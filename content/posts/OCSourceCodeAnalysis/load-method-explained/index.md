+++
title = "Objective-C +load 调度：load_images 与 call_load_methods"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 5
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime

# +load 调度：从 load_images 到 call_load_methods

这页解释 objc4 如何在 dyld 映射镜像后发现、排队并调用 Objective-C 的 `+load`。 重点是类与分类的顺序、父类优先、递归和重入处理，以及 `runtimeLock` 与 `loadMethodLock` 的边界。

入口：dyld callback 队列：loadable_classes / loadable_categories 调度：call_load_methods 测试：load\*.m

## 目录

[作用](#purpose) [实现原理](#principle) [核心结构和关键函数](#structures) [关键流程](#flow) [带注释代码片段](#code) [测试体现的语义](#tests)

## 作用

`+load` 是 Objective-C 运行时在类或分类被装入进程时主动调用的类方法。 它不依赖消息发送触发，也早于普通的 `+initialize`。objc4 的任务不是简单遍历所有方法并调用， 而是在 dyld 映射镜像、runtime 完成类注册和分类附着后，按照语言语义和装载依赖稳定地调用。

**装载时机**

dyld 通过 `_dyld_objc_register_callbacks` 注册 runtime 回调。镜像映射后先走 `map_images`，随后 `load_images` 处理该镜像中的非懒加载类和分类。

**顺序语义**

类 `+load` 必须父类优先；所有当前可调用的类 `+load` 先于分类 `+load`；分类必须等宿主类已经完成自己的 `+load`。

**重入安全**

`+load` 内部可能 `dlopen` 新镜像，再次进入 `load_images`。objc4 让内层调用只排队，真正调用由最外层 `call_load_methods` 收尾。

## 实现原理

objc4 将 `+load` 分成“发现”和“调用”两阶段。发现阶段需要持有 `runtimeLock`， 因为它要读取和实现类、解析分类、查找元类方法列表。调用阶段释放 `runtimeLock`， 只持有递归的 `loadMethodLock`，因为用户代码可能执行任意 Objective-C 行为并重新映射镜像。

**1. dyld 映射**

`_objc_init` 注册 `map_images`、`load_images`、`unmap_image`。

**2. 快速过滤**

`hasLoadMethods` 扫描非懒加载类和分类 section；没有候选项则不加锁返回。

**3. 收集候选**

`prepare_load_methods` 把类和分类加入两个待调用队列。

**4. 外层调度**

`call_load_methods` 反复清空类队列，再尝试一次分类队列。

**5. 处理重入**

重入只追加队列；`loading` 使内层调度直接返回，外层继续补齐。

**核心分工：** `runtime/objc-runtime-new.mm` 负责镜像入口、扫描 section、实现类和分类； `runtime/objc-loadmethod.mm` 负责两个队列以及最终调用顺序。 `runtime/objc-load.mm` 在当前版本中只保留历史文件壳。

## 核心结构和关键函数

### 待调用队列

`loadable_class` 保存 `Class` 与已经取出的 `IMP`；`loadable_category` 保存 `Category` 与 `IMP`。队列扩容使用 `realloc`，卸载镜像时通过置空条目避免调用已失效项。

### 类已加载标记

`RW_LOADED` 写入类的 `rw` flags，表示该类的 `+load` 已经排过队。`schedule_class_load` 先递归父类，再加入当前类。

### 方法查找

`objc_class::getLoadMethod` 在元类的基方法列表中找 `@selector(load)`；分类使用 `_category_getLoadMethod` 在 `cat->classMethods` 中找。

### 锁

`loadMethodLock` 是 `recursive_mutex_t`，允许 `+load` 触发的重入路径再次进入；`runtimeLock` 只包住发现和准备阶段，调用用户代码前释放。

| 函数 | 位置 | 职责 |
|----|----|----|
| `load_images` | `runtime/objc-runtime-new.mm` | dyld 映射通知后的 `+load` 入口；过滤、加锁、收集候选，然后调用 `call_load_methods`。 |
| `prepare_load_methods` | `runtime/objc-runtime-new.mm` | 读取 `__objc_nlclslist` 和 `__objc_nlcatlist` 等非懒加载 section，把类和分类加入待调用队列。 |
| `schedule_class_load` | `runtime/objc-runtime-new.mm` | 递归安排父类，再安排当前类，并设置 `RW_LOADED`，保证父类优先且不重复排队。 |
| `add_class_to_loadable_list` | `runtime/objc-loadmethod.mm` | 如果类自己实现了 `+load`，保存类和 `IMP` 到类队列。 |
| `add_category_to_loadable_list` | `runtime/objc-loadmethod.mm` | 如果分类实现了 `+load`，保存分类和 `IMP` 到分类队列。 |
| `call_load_methods` | `runtime/objc-loadmethod.mm` | 最外层调度器：类队列清空后再处理分类队列，并处理重入期间新增的候选项。 |

## 关键流程

1

### 收集

`load_images` 先用 `hasLoadMethods` 快速检查非懒加载类和分类 section。命中后持有 `loadMethodLock`，再持有 `runtimeLock`，调用 `loadAllCategoriesIfNeeded` 和 `prepare_load_methods`。

2

### 排序

类排序不是全局 sort，而是由 `schedule_class_load` 的递归构造保证：先排父类，再排当前类。注释中明确类队列因为构造方式“总是 superclass first”。

3

### 类优先于分类

`call_load_methods` 在每一轮先 `while (loadable_classes_used > 0)` 调用所有类。只有类队列清空后，才执行一次 `call_category_loads`。

4

### 分类等待宿主类

`call_category_loads` 只在 `_category_getClass(cat)` 存在且 `cls->isLoadable()` 为真时调用。未满足条件的分类会保留并压缩回队列，等待下一轮。

5

### 递归和重入处理

调度器用静态变量 `loading` 标记外层正在运行。内层重入直接返回，不调用新队列；外层循环继续处理重入新增的类或尚未尝试过的分类。

6

### 锁边界

准备阶段同时要求 `runtimeLock` 和 `loadMethodLock`。真正调用 `+load` 时不持有 `runtimeLock`，避免用户代码回调 runtime 时死锁；仍持有递归的 `loadMethodLock` 来保护队列和重入状态。

## 带详细注释代码片段

以下片段按 objc4 源码逻辑改写并加注释，保留关键控制流。

### 1. load_images：镜像映射后的入口

```javascript
void load_images(const _dyld_objc_notify_mapped_info *info)
{
    // 先无锁快速扫 Mach-O 的非懒加载类/分类 section。
    // 没有 +load 候选项时直接返回，避免进入 runtime 锁路径。
    if (!hasLoadMethods((const headerType *)info->mh,
                        info->sectionLocationMetadata)) {
        return;
    }

    // 保护 +load 队列。它是递归锁，因为 +load 里可能 dlopen，
    // dlopen 又会重新触发 load_images。
    recursive_mutex_locker_t lock(loadMethodLock);

    {
        // 只在发现/准备阶段持有 runtimeLock。
        // 这里会实现类、附着分类、读取方法列表。
        mutex_locker_t lock2(runtimeLock);
        loadAllCategoriesIfNeeded();
        prepare_load_methods((const headerType *)info->mh,
                             info->sectionLocationMetadata);
    }

    // 调用用户 +load 前已经释放 runtimeLock，允许重入 runtime。
    call_load_methods();
}
```

### 2. prepare_load_methods：收集类和分类

```javascript
static void schedule_class_load(Class cls)
{
    if (!cls) return;

    // _read_images 已经实现类；重复排队由 RW_LOADED 拦住。
    ASSERT(cls->isRealized());
    if (cls->data()->flags & RW_LOADED) return;

    // 递归先排父类。这样不需要额外排序，队列天然父类在前。
    schedule_class_load(cls->getSuperclass());

    // 只有类自己实现 +load 才会真正进入 loadable_classes。
    add_class_to_loadable_list(cls);

    // 标记“已经安排过 +load”，避免子类或后续镜像再次安排。
    cls->setInfo(RW_LOADED);
}

void prepare_load_methods(const headerType *mhdr,
                          const _dyld_section_location_info_t info)
{
    // 1. 扫非懒加载类列表，逐个安排类 +load。
    classref_t const *classlist =
        getSectionData<classref_t>(mhdr, info,
            _dyld_section_location_data_non_lazy_class_list, &count);
    for (size_t i = 0; i < count; i++) {
        schedule_class_load(remapClass(classlist[i]));
    }

    // 2. 扫非懒加载分类列表，先确认宿主类可用。
    category_t * const *categorylist =
        getSectionData<category_t *>(mhdr, info,
            _dyld_section_location_data_non_lazy_category_list, &count);
    for (size_t i = 0; i < count; i++) {
        category_t *cat = categorylist[i];
        Class cls = remapClass(cat->cls);
        if (!cls) continue;

        // Swift 稳定 ABI 类不允许 Objective-C category 带 +load。
        if (cls->isSwiftStable()) fatal(...);

        // 确保宿主类及其元类已实现，再把分类加入分类队列。
        realizeClassWithoutSwift(cls, nil);
        add_category_to_loadable_list(cat);
    }
}
```

### 3. call_load_methods：外层调度器

```cpp
void call_load_methods(void)
{
    static bool loading = NO;

    // 调用者必须已经持有 loadMethodLock。
    lockdebug::assert_locked(&loadMethodLock.get());

    // 如果 +load 里触发 dlopen，内层 load_images 会再次调用这里。
    // 内层直接返回，保证外层 +load 先完成，顺序不被打乱。
    if (loading) return;
    loading = YES;

    void *pool = objc_autoreleasePoolPush();
    do {
        // 只要类队列非空就持续调用。
        // call_class_loads 会摘下当前队列；调用期间新增的类进入新队列，下一轮处理。
        while (loadable_classes_used > 0) {
            call_class_loads();
        }

        // 分类队列每轮只尝试一次。
        // 这样分类 +load 触发的新类仍能在下一轮先于新分类执行。
        bool more_categories = call_category_loads();

        // 有新类，或有新加入且尚未尝试的分类，就继续外层循环。
    } while (loadable_classes_used > 0 || more_categories);

    objc_autoreleasePoolPop(pool);
    loading = NO;
}
```

### 4. call_category_loads：分类延迟和压缩

```cpp
static bool call_category_loads(void)
{
    // 摘下当前分类队列。调用 +load 时新加入的分类会进入新的全局队列。
    struct loadable_category *cats = loadable_categories;
    int used = loadable_categories_used;
    loadable_categories = nil;
    loadable_categories_used = 0;

    for (int i = 0; i < used; i++) {
        Category cat = cats[i].cat;
        if (!cat) continue;

        Class cls = _category_getClass(cat);
        // 宿主类存在且已可 load 时才调用分类 +load。
        // 不满足条件的分类保留在 cats 中，稍后重新挂回队列。
        if (cls && cls->isLoadable()) {
            ((load_method_t)cats[i].method)(cls, @selector(load));
            cats[i].cat = nil;
        }
    }

    // 把未调用的分类稳定压缩到前面，再把调用期间新加入的分类追加到后面。
    // 返回值告诉外层：是否存在“刚加入、还没尝试过”的分类。
    compact_remaining_categories();
    append_new_categories();
    return new_categories_added;
}
```

## 测试体现的语义

| 测试文件 | 验证点 |
|----|----|
| `test/load.m` | 父类 `Super` 的 `+load` 先于子类 `Sub`；类 `+load` 先于分类；实例方法 `-load` 不会被 runtime 当作装载入口；调用期间有 autorelease pool。 |
| `test/load-order.m`、`load-order1.m`、`load-order2.m`、`load-order3.m` | 多个 dylib 之间按依赖的 bottom-up 装载顺序触发：`Three` 先设 `state3`，`Two` 再依赖它，`One` 最后依赖前二者。 |
| `test/load-reentrant.m`、`load-reentrant2.m` | `One +load` 中 `dlopen` 新 bundle，bundle 的 constructor 可执行，但 `Two +load` 必须等 `One +load` 完成后才运行，证明重入调度被外层收束。 |
| `test/load-map-images.m` | 手工构造 Mach-O header，先 `_objc_map_images` 再 `_objc_load_image`，覆盖 runtime 映射和 load 入口的配合。 |
| `test/load-parallel0.m`、`load-parallel00.m` | 大量类 `+load` 并发计数，用于暴露队列和锁在并行装载场景下的竞态。 |

**容易误解的一点：** 分类 `+load` 的 receiver 是宿主类，不是分类对象；runtime 保存的是分类的类方法 `IMP`， 调用时传入 `cls` 和 `@selector(load)`。

源码依据：`runtime/objc-loadmethod.mm`、`runtime/objc-runtime-new.mm`、 `runtime/objc-os.mm`、`runtime/objc-load.mm`，以及 `test/load*.m`、 `test/load-order*.m`、`test/load-reentrant*.m`。
