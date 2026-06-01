+++
title = "objc4 类加载、read_images 与类实现化"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 1
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

# objc4 类加载、read_images 与类实现化

本文解释 Objective-C runtime 从 dyld 通知镜像映射，到读取类、处理 future class、realize class、methodize class、附着 category 的主干流程。 重点源码来自 `runtime/objc-runtime-new.mm`、`objc-runtime-new.h`、`objc-os.mm`、`objc-class.mm` 及相关测试。

[作用](#purpose) [核心结构](#structures) [关键流程](#flow) [测试视角](#tests)

## 一、这条链路的作用

### 把 Mach-O 中的静态元数据变成运行时可用的类

编译器把类、元类、方法列表、协议列表、属性列表和 ivar 布局写入 Mach-O 的 Objective-C sections。 这些数据起初主要是只读的 `class_ro_t`。runtime 加载镜像时要登记类名、修正 selector/protocol/class 引用，并在必要时分配可写的 `class_rw_t`。

### 延迟成本，同时保证消息发送能看到正确结构

大量类可以保持未 realized 状态，直到非懒加载、`+load`、消息发送、Swift 桥接或显式 API 需要它们。 realize 时才连接父类和元类、修正 ivar 偏移、初始化 cache、复制运行时标志，并把方法列表整理成可查找的形态。

简化理解：`read_images` 是“发现并登记”；`readClass` 是“读一个类声明并处理 future/remap”；`realizeClassWithoutSwift` 是“把类接入运行时继承图”；`methodizeClass` 是“准备方法/协议/属性并合并 category”。

## 二、核心类/结构和关键字段

| 结构 | 关键字段 | 作用 |
|----|----|----|
| `objc_class` | `superclass`、`cache`、`bits` | 类对象本体。`bits` 初始可指向 `class_ro_t`，realize 后指向 `class_rw_t` 并夹带 fast flags。 |
| `class_ro_t` | `flags`、`instanceStart`、`instanceSize`、`name`、`baseMethods`、`ivars` | 编译期只读描述。包含类名、方法、协议、属性、ivar 布局和 root/meta/future/realized 等 ABI 标志。 |
| `class_rw_t` | `flags`、`ro_or_rw_ext`、`firstSubclass`、`nextSiblingClass` | 运行时可写状态。保存 realized/initialized/constructing 等状态，并把类接入子类链。 |
| `class_rw_ext_t` | `ro`、`methods`、`properties`、`protocols` | 当类需要扩展列表时分配。category 附着后，方法/属性/协议列表通常进入这里。 |
| `method_list_t` | `entsizeAndFlags`、`count`、方法条目 | 方法列表。加载时会 uniquing selector，必要时排序并标记 fixed-up。 |
| `category_t` | `cls`、`instanceMethods`、`classMethods`、`protocols`、`instanceProperties` | 分类元数据。目标类已 realized 时立即附着，否则暂存到 unattached categories。 |
| `header_info` | `classlist`、`nlclslist`、`catlist`、`selrefs`、`protocolrefs` | 一个 Mach-O 镜像的 ObjC 元数据索引。`objc-os.mm` 中 `addHeader` 负责创建或取出它。 |

### 类数据从 ro 切换到 rw

```cpp
struct objc_class : objc_object {
    Class superclass;
    cache_t cache;
    class_data_bits_t bits;  // 未实现时指向 class_ro_t，实现后指向 class_rw_t
};

struct class_rw_t {
    uint32_t flags;          // RW_REALIZED、RW_FUTURE、RW_INITIALIZED 等
    explicit_atomic<uintptr_t> ro_or_rw_ext;
    Class firstSubclass;
    Class nextSiblingClass;
};
```

`class_data_bits_t::safe_ro()` 允许在并发 realize 场景下安全取出 ro。 `setData()` 则在 realization 或构造阶段把 `objc_class::bits` 改成 rw 指针，并设置 `FAST_IS_RW_POINTER`。

## 三、关键流程总览

**1. dyld callbacks**runtime 初始化后向 dyld 注册 map/load/unmap/root patch 回调。

**2. map_images**加 runtimeLock，收集 ObjC 镜像并调用 `_read_images`。

**3. readClass**登记类名，处理 weak superclass、future class 和 remap。

**4. remap refs**修正 classrefs、superrefs、protocolrefs 和 selector refs。

**5. realize**非懒类和已解析 future class 被接入继承图。

**6. methodize**整理本类方法并附着 category 方法、属性、协议。

### 1. dyld map images 入口

`_objc_init` 完成锁、环境、side table、cache 等初始化后，通过 `_dyld_objc_register_callbacks` 注册回调。 当 dyld 映射新镜像时，`map_images` 获取 `runtimeLock` 并进入 `map_images_nolock`。

```cpp
void _objc_init(void)
{
    locks_init();
    runtime_init();
    cache_t::init();

    _dyld_objc_callbacks_v4 callbacks = {
        4,
        map_images,      // 镜像映射：读取 ObjC 元数据
        load_images,     // 调用 +load 等加载动作
        unmap_image,
        _objc_patch_root_of_class,
    };
    _dyld_objc_register_callbacks((_dyld_objc_callbacks*)&callbacks);
}
```

`map_images_nolock` 会调用 `addHeader` 找出包含 ObjC 元数据的 Mach-O，建立 `mapped_image_info` 数组。 首次执行时还会初始化 selector 表、runtime 数组，并处理 shared cache、pointer authentication、GC 兼容等平台条件。

### 2. \_read_images 做了什么

`_read_images` 是加载阶段的枢纽，按依赖顺序完成多类修正：

1.  首次运行时创建 `gdb_objc_realized_classes` 等 named class 表。
2.  修正 `@selector` 引用，确保方法列表使用 uniqued selector。
3.  遍历 `classlist`，对需要 runtime 读取的类调用 `readClass`。
4.  如果 future class 让类地址发生替换，重写 `classrefs` 和 `superrefs`。
5.  读取 protocol，修正 `@protocol` 引用。
6.  在合适时机发现并附着 category，避免早期线程看到未修正完的元数据。
7.  realize 非懒类 `nlclslist`，再 realize 新解析的 future class。
```cpp
// _read_images 的主干伪代码，保留源码顺序
fixupSelectorReferences();

for (image in infos) {
    if (mustReadClasses(image, hasDyldRoots)) {
        for (cls in image.classlist()) {
            newCls = readClass(cls, headerIsBundle, headerIsPreoptimized);
            if (newCls != cls) rememberResolvedFutureClass(newCls);
        }
    }
}

if (classesWereRemapped) {
    remapClassRefs();
    remapSuperRefs();
}

readProtocolsAndRemapProtocolRefs();
loadCategoriesIfInitialAttachAlreadyHappened();

for (cls in image.nlclslist()) {
    realizeClassWithoutSwift(remapClass(cls), nil);
}

for (cls in resolvedFutureClasses) {
    realizeClassWithoutSwift(cls, nil);
}
```

### 3. readClass：登记类、处理 future class

`readClass` 读取编译器写出的类/元类对。它不负责把类完全 realize，而是让 runtime 能按名字和引用找到这个类。 如果 superclass 弱链接缺失，类会被 remap 到 `nil`，后续引用也会被清掉。

```javascript
Class readClass(Class cls, bool headerIsBundle, bool headerIsPreoptimized)
{
    const char *name = cls->nonlazyMangledName();

    if (missingWeakSuperclass(cls)) {
        addRemappedClass(cls, nil);  // 弱父类缺失：禁用这个类
        cls->setSuperclass(nil);
        return nil;
    }

    if (Class future = popFutureNamedClass(name)) {
        // 真实类到来，占用之前预留的 future class 地址。
        class_rw_t *rw = future->data();
        future->setSuperclass(cls->getSuperclass());
        future->initIsa(cls->getIsa());
        rw->set_ro(cls->safe_ro());
        addRemappedClass(cls, future);
        cls = future;
    }

    addNamedClass(cls, name, replacing);
    addClassTableEntry(cls);
    return cls;
}
```

future class 的入口是 `objc_getFutureClass` 和 `_objc_allocateFutureClass`。 它们为尚未加载的类名分配一块 `objc_class`，放进 `future_named_class_map`。 真正的类后来被 `readClass` 读到时，runtime 把真实 ro/super/isa/cache 信息复制到 future class 地址，并用 `remappedClasses` 记录旧地址到新地址的替换。

### 4. realizeClassWithoutSwift：把类接入运行时

realization 是第一次把类从“声明已读”推进到“可参与消息发送和继承关系”的过程。 源码中 Swift 类会先走 `realizeClassMaybeSwift*`，这里聚焦普通 ObjC 路径 `realizeClassWithoutSwift`。

```cpp
static Class realizeClassWithoutSwift(Class cls, Class previously)
{
    if (!cls || cls->isRealized()) return cls;

    auto ro = cls->safe_ro();
    if (ro->flags & RO_FUTURE) {
        rw = cls->data();                         // future class 已有 rw
        cls->changeInfo(RW_REALIZED | RW_REALIZING, RW_FUTURE);
    } else {
        rw = zalloc<class_rw_t>();                 // 普通类分配 rw
        rw->set_ro(ro);
        rw->flags = RW_REALIZED | RW_REALIZING | isMeta;
        cls->setData(rw);
    }

    cls->cache.initializeToEmptyOrPreoptimizedInDisguise();
    cls->chooseClassArrayIndex();

    supercls = realizeClassWithoutSwift(remapClass(cls->getSuperclass()), nil);
    metacls  = realizeClassWithoutSwift(remapClass(cls->ISA()), nil);

    cls->setSuperclass(supercls);
    cls->initClassIsa(metacls);
    reconcileInstanceVariables(cls, supercls, ro);
    addSubclassOrRootClass(cls, supercls);

    methodizeClass(cls, previously);
    return cls;
}
```

这个过程有几个关键保证： 先设置 RW_REALIZED/RW_REALIZING 递归 realize 父类和元类 修正 ivar 偏移 连接子类链 最后 methodize

若非 root 类的 weak superclass 缺失，realize 会把类 remap 到 `nil`，并把 metaclass 置空作为 disabled class 的快速信号。

### 5. methodizeClass：准备方法并合并 category

`methodizeClass` 只在第一次 methodize 时运行，要求 `runtimeLock` 已持有，并断言类还没有 `rw_ext`。 它先处理类自身的 `baseMethods`，再给 root metaclass 补一个默认 `+initialize`，最后附着之前暂存的 category。

```cpp
static void methodizeClass(Class cls, Class previously)
{
    bool isMeta = cls->isMetaClass();
    auto rw = cls->data();
    auto ro = rw->ro();

    if (method_list_t *list = ro->baseMethods.dyn_cast<method_list_t *>()) {
        prepareMethodLists(cls, &list, 1, YES, isBundleClass(cls), nullptr);
    }

    if (cls->isRootMetaclass()) {
        addMethod(cls, @selector(initialize), (IMP)&objc_noop_imp, "", NO);
    }

    if (previously) {
        unattachedCategories.attachToClass(cls, previously,
            isMeta ? ATTACH_METACLASS : ATTACH_CLASS_AND_METACLASS);
    }

    unattachedCategories.attachToClass(cls, cls,
        isMeta ? ATTACH_METACLASS : ATTACH_CLASS);
}
```

`prepareMethodLists` 会对方法列表做 selector uniquing、排序、fixed-up 标记，并在已初始化类上扫描影响 retain/release、alloc、core 方法的实现。 category 方法被 prepend 到方法列表数组中，因此后加载的 category 能在方法查找中优先于旧列表。

### 6. attach categories：已实现类立即附着，未实现类先暂存

`load_categories_nolock` 会遍历镜像里的 `catlist`。 对普通类，如果目标类或元类已经 realized，就直接 `attachCategories` 并在需要时 flush cache；否则写入 `unattachedCategories`，等待 `methodizeClass`。

```cpp
if (cat->instanceMethods || cat->protocols || cat->instanceProperties) {
    if (cls->isRealized()) {
        attachCategories(cls, &lc, 1, cls, ATTACH_EXISTING);
    } else {
        unattachedCategories.addForClass(lc, cls);
    }
}

if (cat->classMethods || cat->protocols || cat->classProperties) {
    if (cls->ISA()->isRealized()) {
        attachCategories(cls->ISA(), &lc, 1, cls,
                         ATTACH_EXISTING | ATTACH_METACLASS);
    } else {
        unattachedCategories.addForClass(lc.reSignedForMetaclass(cls),
                                         cls->ISA());
    }
}
```

真正附着时，`attachCategories` 会确保 `class_rw_ext_t` 存在，把 category 的 method/property/protocol 分别放进临时列表。 方法列表先经过 `prepareMethodLists`，再用 `rwe->methods.attachLists` 接到类上；如果这是已存在类的新增 category，还会清理受影响的 method cache。

## 四、实现原理和设计取舍

### ro/rw 分离

编译期稳定数据留在 `class_ro_t`，运行时变化进入 `class_rw_t` 或 `class_rw_ext_t`。 这样 shared cache 中大量类可以共享只读页，同时仍支持 category、动态方法、初始化状态和子类链。

### 延迟 realize

`readClass` 只保证类可被查找；真正昂贵的父类递归、ivar reconcile、cache 初始化和 category 合并延后。 非懒类、future class、Swift 需求和消息发送慢路径会触发 realization。

### remap 机制

future class 和弱链接缺失都可能让“原始 class 指针”不再是最终答案。 runtime 用 `remappedClasses` 修正 `classrefs`、`superrefs`，并在后续 `remapClass` 中返回最终类或 `nil`。

### category 延迟附着

category 发现必须晚于 class/protocol/ref 修正，避免其他线程在元数据半修正状态下进入新方法。 未 realized 的目标类先进入 `unattachedCategories`，由 `methodizeClass` 原子式接入。

## 五、测试提供的边界视角

| 测试文件 | 验证点 |
|----|----|
| `test/class-structures.h` | 定义测试用的 fake `ObjCClass`、`ObjCClass_ro`、`ObjCMethodList`，帮助构造接近 ABI 的类结构。 |
| `test/readClassPair.m` | `objc_readClassPair` 可读取 root/non-root 类；重复类名允许但会 warning；named class 表保持原有赢家。 |
| `test/readClassPairIvarFixup.m` | 当子类 `instanceStart` 与新父类 `instanceSize` 重叠时，`objc_readClassPair` 会 eager realize 来修正 ivar offset。 |
| `test/partiallyRealizedClass.m` | 对未 realized 类对象执行 retain/autorelease/alloc 相关路径，不应制造“元类已 realized、类未 realized”的半成品状态。 |

`objc_readClassPair` 内部也调用 `readClass`，但它明确不允许 future remap 改变传入类地址。 它不会调用 `+load`；只有发现 ivar overlap 时才提前 `realizeClassWithoutSwift`，这是 Swift 依赖的行为。

## 六、把流程串起来

dyld 把镜像映射进进程后通知 libobjc；libobjc 找到每个 Objective-C 镜像的 `header_info`，由 `_read_images` 统一修正 selector、class、protocol 引用。 类声明通过 `readClass` 进入 named class 表；future class 会在这里被真实类填充并建立 remap。 随后非懒类和新解析的 future class 被 `realizeClassWithoutSwift` 实现化：分配 rw、递归父类/元类、修正 ivar、连接继承图。 最后 `methodizeClass` 准备本类方法列表，并将此前延迟的 category 通过 `attachCategories` 合并到 `class_rw_ext_t`。

源码依据：`runtime/objc-os.mm` 的 `addHeader`、`map_images_nolock`、`_objc_init`； `runtime/objc-runtime-new.mm` 的 `_read_images`、`readClass`、future class helpers、`realizeClassWithoutSwift`、`methodizeClass`、`attachCategories`； `runtime/objc-runtime-new.h` 的类结构定义；`runtime/objc-class.mm` 的方法列表历史说明；以及 `test/readClassPair*.m`、`test/partiallyRealizedClass.m`。
