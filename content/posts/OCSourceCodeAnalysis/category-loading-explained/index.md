+++
title = "Objective-C Category 装载与附加机制"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 4
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime

# Category 装载与方法、协议、属性附加

Category 的本质不是“修改类结构体”，而是在镜像加载和类实现化时，把分类携带的方法列表、协议列表、属性列表合并到目标类或元类的可变列表视图中。objc4 同时要处理未实现类、stub class、dyld 预附加列表、方法缓存失效和 `+load` 顺序。

runtime/objc-runtime-new.mm runtime/objc-runtime-new.h runtime/objc-loadmethod.mm test/category.m 等测试

## 目录

1.  [作用](#purpose)
2.  [实现原理总览](#model)
3.  [核心结构和字段](#structures)
4.  [关键流程](#flow)
5.  [带注释核心代码](#snippets)
6.  [测试揭示的行为](#tests)

<a id="purpose"></a>
## 作用

### 扩展类行为

分类把实例方法挂到类，把类方法挂到元类，让现有类获得新 selector 或覆盖既有 selector。

### 扩展反射信息

分类的协议和属性参与 `class_copyProtocolList`、`class_getProperty` 等运行时查询。

### 保持加载顺序

后加载的分类应优先被方法查找看到，所以列表附加采用“前插”。

### 支持动态镜像

bundle、共享缓存、stub class 和未实现类都能在不同时间点接收分类。

关键结论：分类附加不是把方法逐个复制进类定义，而是把 `method_list_t`、`protocol_list_t`、`property_list_t` 这类“列表”挂到 `class_rw_ext_t` 的数组视图前端。

<a id="model"></a>
## 实现原理总览

### Mach-O 镜像

`__objc_catlist` / `__objc_catlist2` 中保存 `category_t *`。runtime 通过 `header_info` 知道分类来自哪个镜像。

→

### 分类分流

目标类未实现则暂存到 `unattachedCategories`；目标类已实现则立即 `attachCategories`。

→

### 列表前插

`attachLists` 把新增列表放在旧列表前面，方法查找和反射会先看到分类列表。

依据：`load_categories_nolock` 分流逻辑见 runtime/objc-runtime-new.mm:3585-3717；列表前插见 runtime/objc-runtime-new.h:2021-2105。

<a id="structures"></a>
## 核心类、结构和关键字段方法

| 结构/方法 | 关键字段或方法 | 在分类装载中的职责 |
|----|----|----|
| `category_t` | `name`、`cls`、`instanceMethods`、`classMethods`、`protocols`、`instanceProperties`、`_classProperties` | 分类的磁盘 ABI 结构。`methodsForMeta()` 根据是否元类返回实例/类方法；`protocolsForMeta()` 只给非元类返回协议；`propertiesForMeta()` 区分实例属性和类属性。 |
| `locstamped_category_t` | `cat`、`hi`、`getCategory()`、`reSignedForMetaclass()` | 把分类指针和镜像 `header_info` 绑在一起。arm64e 下分类指针按目标类签名；当分类要暂存在元类键下时需要重新签名。 |
| `UnattachedCategories` | `addForClass()`、`attachToClass()`、`eraseCategoryForClass()` | 保存“分类已发现、目标类或元类尚未实现”的状态。类实现化时按 key 取出并调用 `attachCategories`。 |
| `class_ro_t` | `baseMethods`、`baseProtocols`、`baseProperties` | 编译期只读类描述。它可能直接指向单个列表，也可能指向 dyld 预优化的 `relative_list_list_t`。 |
| `class_rw_t` / `class_rw_ext_t` | `ro_or_rw_ext`、`extAllocIfNeeded()`、`methods()`、`properties()`、`protocols()` | 实现化后的可变视图。分类附加会确保存在 `rw_ext`，再把列表插入 `methods/properties/protocols` 数组。 |
| `attachLists()` | `preoptimized` 参数、`storage`、`array_t` | 通用列表合并函数。新增列表被放到旧列表前面；若预优化列表已经在 `relative_list_list_t` 中，则跳过重复附加。 |
| `loadable_category` | `cat`、`method`、`loadable_categories` | 记录待调用的分类 `+load`。分类必须先附加到父类，之后才排队调用其 `+load`。 |

依据：`category_t` 见 runtime/objc-runtime-new.h:3196-3217；`class_ro_t` 见 runtime/objc-runtime-new.h:1598-1617；`class_rw_t` 见 runtime/objc-runtime-new.h:2212-2358。

<a id="flow"></a>
## 关键流程

### 扫描分类

`load_categories_nolock` 读取镜像的 `catlist` 和 `catlist2`。缺失的 weak-linked 目标类被忽略；特殊 `0xbad4007` 根缺失会直接 fatal。

### 未实现类分类暂存

类或元类尚未 realized 时，分类被存入 `unattachedCategories`。stub class 因元类尚不可知，也先按 stub 自身暂存。

### 实现化时补挂

`methodizeClass` 先准备类自身方法，再调用 `attachToClass` 把之前暂存的分类附加到类或元类。

### attachCategories

按是否元类取方法/属性/协议列表，分成 dyld 预附加列表和普通列表，批量交给 `attachLists`。

### 缓存失效与 +load

给已存在类附加新方法后刷新类及子类缓存；`+load` 则由单独队列保证类先于分类。

### 方法列表前插

分类排序是“旧分类在前”。`attachCategories` 先把输入倒序放入本地缓冲，再让 `attachLists` 前插。最终效果是越新的分类越靠前，方法查找优先命中分类实现。

### 协议和属性附加

协议只附加到类，不附加到元类；类属性只有当镜像声明支持 `hasCategoryClassProperties()` 时才走 `_classProperties`。实例属性和类属性是两份不同列表。

### cache invalidation

如果分类附加到已经 realized 的类，旧方法缓存可能已经缓存了被分类覆盖的 IMP。`attachCategories` 在 `ATTACH_EXISTING` 且有方法列表时调用 `flushCaches`，遍历目标类及其子类擦除非 constant optimized cache。

### `+load` 关系

`prepare_load_methods` 发现非懒加载分类后先实现化目标类，确保分类已经附加，再把分类加入 `loadable_categories`。调用阶段先反复执行类 `+load`，再执行分类 `+load`。

<a id="snippets"></a>
## 带注释核心代码片段

### 1. 分类载体：`category_t`

```javascript
struct category_t {
    const char *name;                 // 分类名，例如 "Debug"
    classref_t cls;                   // 目标类引用，加载时会 remapClass()
    WrappedPtr<method_list_t> instanceMethods;
    WrappedPtr<method_list_t> classMethods;
    protocol_list_t *protocols;
    property_list_t *instanceProperties;
    property_list_t *_classProperties; // 新 ABI 中可选存在

    method_list_t *methodsForMeta(bool isMeta) const {
        return isMeta ? classMethods : instanceMethods;
    }

    protocol_list_t *protocolsForMeta(bool isMeta) const {
        return isMeta ? nullptr : protocols;
    }
};
```

来源摘录：runtime/objc-runtime-new.h:3196-3217；类属性选择逻辑见 runtime/objc-runtime-new.mm:6488-6499。

### 2. 未实现类分类暂存

```cpp
if (cat->instanceMethods || cat->protocols || cat->instanceProperties) {
    if (cls->isRealized()) {
        attachCategories(cls, &lc, 1, cls, ATTACH_EXISTING);
    } else {
        // 目标类还没有实现化：先按类指针作为 key 暂存。
        unattachedCategories.addForClass(lc, cls);
    }
}

if (cat->classMethods || cat->protocols || hasClassProperties) {
    if (cls->ISA()->isRealized()) {
        attachCategories(cls->ISA(), &lc, 1, cls,
                         ATTACH_EXISTING | ATTACH_METACLASS);
    } else {
        // 元类路径需要用元类重新签名分类指针。
        unattachedCategories.addForClass(lc.reSignedForMetaclass(cls),
                                         cls->ISA());
    }
}
```

来源摘录：runtime/objc-runtime-new.mm:3662-3687。

### 3. 实现化时补挂分类

```cpp
static void methodizeClass(Class cls, Class previously)
{
    // 先准备类自身 method_list_t，root metaclass 还会补 initialize。
    prepareMethodLists(...);

    // 类重定位时，previously key 下可能也有暂存分类。
    if (previously) {
        unattachedCategories.attachToClass(cls, previously,
            isMeta ? ATTACH_METACLASS : ATTACH_CLASS_AND_METACLASS);
    }

    // 普通路径：取出以 cls 为 key 的暂存分类并附加。
    unattachedCategories.attachToClass(cls, cls,
        isMeta ? ATTACH_METACLASS : ATTACH_CLASS);
}
```

来源摘录：runtime/objc-runtime-new.mm:1729-1829。

### 4. `attachCategories`：取列表、分组、附加、刷新缓存

```cpp
for (uint32_t i = 0; i < cats_count; i++) {
    method_list_t *mlist =
        entry.getCategory(catsListKey)->methodsForMeta(isMeta);
    property_list_t *proplist =
        entry.getCategory(catsListKey)->propertiesForMeta(isMeta, entry.hi);
    protocol_list_t *protolist =
        entry.getCategory(catsListKey)->protocolsForMeta(isMeta);

    // 根据 dyld 是否已经预优化分类，放到不同缓冲区。
    Lists *lists = isPreattached ? &preattachedLists : &normalLists;
    lists->methods.add(mlist);
    lists->properties.add(proplist);
    lists->protocols.add(protolist);
}

if (lists->methods.count > 0) {
    prepareMethodLists(cls, lists->methods.begin(), lists->methods.count,
                       NO, fromBundle, __func__);
    rwe->methods.attachLists(lists->methods.begin(),
                             lists->methods.count, isPreattached, "methods");

    if (flags & ATTACH_EXISTING) {
        // 已有类可能缓存过旧 IMP，需要擦掉受影响 cache。
        flushCaches(cls, __func__, [](Class c) {
            return !c->cache.isConstantOptimizedCache();
        });
    }
}

rwe->properties.attachLists(...);
rwe->protocols.attachLists(...);
```

来源摘录：runtime/objc-runtime-new.mm:1632-1725。

### 5. `attachLists`：新增列表前插

```text
if (oldList) array->lists[addedCount] = oldList;
for (unsigned i = 0; i < addedCount; i++)
    array->lists[i] = addedLists[i];       // 0/1 个旧列表时，新增列表放前面

for (int i = oldCount - 1; i >= 0; i--)
    newArray->lists[i + addedCount] = array->lists[i];
for (unsigned i = 0; i < addedCount; i++)
    newArray->lists[i] = addedLists[i];    // 多个旧列表时仍然前插
```

来源摘录：runtime/objc-runtime-new.h:2021-2105。

### 6. `+load`：分类先附加，后调用

```cpp
for (category_t *cat : nonLazyCategoryList) {
    Class cls = remapClass(cat->cls);
    realizeClassWithoutSwift(cls, nil);    // 触发 methodizeClass 和分类附加
    add_category_to_loadable_list(cat);    // 只把实现了 +load 的分类入队
}

do {
    while (loadable_classes_used > 0) {
        call_class_loads();                // 类 +load：父类优先
    }
    more_categories = call_category_loads(); // 分类 +load：父类已连接后
} while (loadable_classes_used > 0 || more_categories);
```

来源摘录：runtime/objc-runtime-new.mm:4564-4590；runtime/objc-loadmethod.mm:90-105、184-286。

<a id="tests"></a>
## 测试揭示的行为

### `test/category.m`

验证分类方法覆盖类自身方法，实例属性和类属性分别能在类和元类上找到，分类属性对应的 getter/setter 方法可查到。还手工构造 `__objc_catlist2` 分类，证明 catlist2 会被无条件扫描。

依据：test/category.m:191-234。

### `test/preAttachedCategories.mm`

手工构造 list-of-lists，验证共享缓存预附加列表中已加载分类可参与方法、协议、属性查询，而未加载分类不会泄漏到运行时行为中；运行时新增方法/协议/属性仍能覆盖或扩展这些列表。

依据：test/preAttachedCategories.mm 中 list-of-lists 和 `doChecks()`。

### `test/concurrentcat_category.m`

提供带多方法分类的目标类，用于并发场景下加载分类方法，覆盖 runtime 对列表附加和查找一致性的要求。

### `test/rootMissingCategoryClass.m`

构造 `cls == 0xbad4007` 的分类，预期在进入 `main` 前 fatal，覆盖安装 root 缺失的诊断路径。

对应实现：runtime/objc-runtime-new.mm:3608-3612。

容易误解的一点：分类协议不会附加到元类；分类类方法会附加到元类；分类类属性需要镜像声明支持 class properties。`test/category.m` 中 `class_getProperty(cls, "r25605427d1")` 存在而元类上不存在，正是为了防止实例属性被错误附加到元类。

## 一句话串起来

objc4 在镜像加载时把每个 `category_t` 包装成带来源镜像的 `locstamped_category_t`；能立即附加的就把方法、属性、协议列表前插到类或元类的 `class_rw_ext_t`，不能立即附加的就暂存在 `unattachedCategories`，等 `methodizeClass` 时补挂。对已经存在的类，新增方法列表会触发 cache invalidation；对 `+load`，runtime 先保证分类已附加，再用独立队列维持“类先、分类后”的调用关系。

本文只解释 objc4 当前仓库中 Category 装载与附加相关路径；源码依据来自指定 runtime 文件和测试文件。
