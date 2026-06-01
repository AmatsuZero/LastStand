+++
title = "objc4 方法缓存 cache_t / bucket_t 技术讲解"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 3
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

# objc4 方法缓存 cache_t / bucket_t 技术讲解

本文基于当前仓库中的 `runtime/objc-cache.mm`、 `runtime/objc-runtime-new.h`、`runtime/objc-runtime-new.mm` 以及 cache flush 相关测试，说明 Objective-C runtime 如何把一次慢速方法查找变成后续的快速 `objc_msgSend` cache hit。

## 一、方法缓存的作用

Objective-C 消息发送以 `(Class, SEL)` 为核心输入。完整方法查找需要处理类实现、父类链、 动态方法解析、转发和分类变更等逻辑，代价高于一次普通函数调用。`cache_t` 是挂在每个 `objc_class` 上的 IMP cache，用 `SEL` 作为 key，缓存最终应该调用的 `IMP`。

**加速热路径**命中时 `objc_msgSend` 不进入 runtime 慢路径，直接由 bucket 中的 IMP 跳转。

**缓存继承结果**子类未实现某 selector 时，也可以把父类找到的 IMP 缓存在子类 cache 中。

**支持动态变更**分类加载、添加方法、交换实现等操作会触发 cache flush，避免继续调用旧 IMP。

cache 不是方法列表本身，也不是权威数据源。它是一个可丢弃、可重建的性能结构；扩容时甚至不会搬迁旧条目， 而是让后续消息重新填充热点 selector。

## 二、核心结构

### `bucket_t`：一个 selector 到 IMP 的槽位

|  |  |
|----|----|
| 字段 | `_sel` 保存 selector，`_imp` 保存编码后的 IMP。arm64 上 IMP 在前，其他架构通常 SEL 在前，以贴合汇编 fast path 和指针认证需求。 |
| `sel()` | 以 relaxed atomic 读取 selector。空槽的 selector 为 0。 |
| `imp(base, cls)` | 读取并解码 IMP。arm64e 可使用 ptrauth，部分配置使用 class 指针 XOR，未编码配置则直接返回。 |
| `set<Atomic, Encoded>()` | 写入一个 bucket。写入顺序被精心安排，保证无锁读取者不会看到“新 SEL + 旧 IMP”的错误组合。 |

### `cache_t`：每个类上的哈希表

|  |  |
|----|----|
| `_bucketsAndMaybeMask` | 保存 buckets 指针，有些 64 位配置还把 mask 打包进高位；preoptimized cache 也用低位 marker 复用这个字段。 |
| `_mask` / 内联 mask | bucket 数量始终为 2 的幂，`mask = capacity - 1`，哈希后用按位与得到起始槽。 |
| `_occupied` | 已占用动态 bucket 数。插入成功后递增；换表时清零。 |
| `_flags` | 保存若干快速路径标记，例如 metaclass、C++ ctor/dtor、默认 alloc 或 RR 等，具体位定义在 `objc-runtime-new.h`。 |
| 关键方法 | `insert`、`eraseNolock`、`destroy`、`copyCacheNolock`、`maybeConvertToPreoptimized`、`preoptFallbackClass`。 |

### `preopt_cache_t`：dyld shared cache 预构建的常量 cache

|  |  |
|----|----|
| `fallback_class_offset` | 预优化查找未覆盖时继续查找的类，相对当前 class 地址保存。 |
| `shift` / `mask` | 用于计算预优化 entries 下标。`capacity()` 返回 `mask + 1`。 |
| `occupied` | 预优化 cache 中的有效条目数量。 |
| `has_inlines` | 标记是否存在内联 selector；方法列表变更时需要更谨慎地禁用这类 cache。 |
| `entries[]` | 每项保存 selector offset 和 IMP offset，而不是直接保存完整指针。 |

## 三、实现原理

动态 cache 是一个开放寻址哈希表。`cache_hash(sel, mask)` 用 selector 地址和 mask 得到起始槽； 冲突时调用 `cache_next` 继续探测。不同架构的探测方向不同：部分架构递增并使用 end marker， arm64 递减并通过 mask 回绕。

填充比例控制扩容时机：历史配置是 75%，arm64 64 位配置允许 87.5%；小 cache 在支持的配置下可 100% 利用，以减少大量小类或 metaclass 的内存浪费。初始容量通常是 2 或 4，最大容量是 `1 << 16`。

关键并发设计：`objc_msgSend` 读 cache 不加锁。所有修改都必须让并发读取者最多看到 miss， 不能看到错误 IMP，也不能越界或访问已释放内存。因此旧 buckets 被放入垃圾列表，等确认没有线程仍处于 cache 读取临界区后再释放。

## 四、带注释的核心代码片段

### 1. bucket 写入顺序

```objectivec
// 简化自 bucket_t::set()
void bucket_set(bucket_t *bucket, bucket_t *base, SEL sel, IMP imp, Class cls) {
    // IMP 可能需要编码：arm64e 使用 ptrauth，部分配置用 isa/class XOR。
    uintptr_t encoded = encodeImp(base, imp, sel, cls);

    // 非 arm64 的关键约束：
    // 1. 先写 IMP，再写 SEL。
    // 2. 读取者如果看到“新 IMP + 空 SEL”，只会 miss。
    // 3. 绝不能让读取者看到“新 SEL + 旧 IMP”，否则会跳错函数。
    bucket->_imp.store(encoded, relaxed);
    publish_barrier_if_needed();
    bucket->_sel.store(sel, release_or_relaxed);

    // arm64 路径用成对 store，让观察者看到旧二元组或新二元组。
}
```

### 2. 插入和扩容

```objectivec
// 简化自 cache_t::insert(sel, imp, receiver)
void cache_insert(cache_t *cache, SEL sel, IMP imp, id receiver) {
    // 未完成 +initialize 的类不缓存，避免初始化同步被绕过。
    if (!cache->cls()->isInitialized()) return;

    // 动态插入不能发生在已安装的 preoptimized constant cache 上。
    if (cache->isConstantOptimizedCache()) fatal();

    lock(cacheUpdateLock_if_configured);

    unsigned oldCapacity = cache->capacity();
    unsigned capacity = oldCapacity;
    mask_t newOccupied = cache->occupied() + 1;

    if (cache->isConstantEmptyCache()) {
        // 共享空表是只读语义，第一次插入要换成私有 buckets。
        if (!capacity) capacity = INIT_CACHE_SIZE;
        cache->reallocate(oldCapacity, capacity, false);
    } else if (newOccupied + CACHE_END_MARKER <= cache_fill_ratio(capacity)) {
        // 还没超过填充阈值，原地插入。
    } else if (small_cache_can_be_filled_completely(capacity, newOccupied)) {
        // 小表可允许 100% 利用。
    } else {
        // 扩容到两倍，但不超过 MAX_CACHE_SIZE。
        capacity = min(capacity ? capacity * 2 : INIT_CACHE_SIZE, MAX_CACHE_SIZE);
        cache->reallocate(oldCapacity, capacity, true);
    }

    bucket_t *b = cache->buckets();
    mask_t m = capacity - 1;
    mask_t begin = cache_hash(sel, m);

    // 从哈希槽开始线性探测，找到空 selector 后写入。
    for (mask_t i = begin;; i = cache_next(i, m)) {
        if (b[i].sel() == 0) {
            cache->incrementOccupied();
            b[i].set<Atomic, Encoded>(b, sel, imp, cache->cls());
            return;
        }
        if (b[i].sel() == sel) return; // 其他线程已填充。
        if (wrapped_to_begin(i, begin)) cache->bad_cache(receiver, sel);
    }
}
```

### 3. cache miss 后填充

```objectivec
// 简化自 lookUpImpOrForward / log_and_fill_cache
IMP lookup_then_fill(id obj, SEL sel, Class cls, int behavior) {
    IMP imp = cache_getImp(cls, sel);
    if (imp) return imp;

    runtimeLock.lock();

    // 在锁内查方法列表和父类链，保证“查找 + 填 cache”
    // 不会与 category 添加、方法替换等修改交错出永久旧结果。
    Method m = search_method_lists_and_superclasses(cls, sel);
    imp = m ? method_get_imp(m) : _objc_msgForward_impcache;

    if (!(behavior & LOOKUP_NOCACHE)) {
        // 子类命中父类实现时，也可把父类 IMP 填到子类 cache。
        cls->cache.insert(sel, imp, obj);
    }

    runtimeLock.unlock();
    return imp;
}
```

### 4. flush 与延迟释放

```javascript
// 简化自 flushCaches() 与 cache_t::eraseNolock()
void erase_cache(cache_t *cache, const char *why) {
    if (cache->isConstantOptimizedCache()) {
        // 常量 preopt cache 被丢弃后，同时标记该类不再允许 preopt cache。
        cache->setBucketsAndMask(cache_t::emptyBuckets(), 0);
        cache->cls()->setDisallowPreoptCaches();
        return;
    }

    if (cache->occupied() > 0) {
        unsigned cap = cache->capacity();
        bucket_t *old = cache->buckets();

        // 注意：不缩容。换成同容量共享空表，保持无锁读者的安全假设。
        cache->setBucketsAndMask(emptyBucketsForCapacity(cap), cap - 1);

        // 旧表不能立即 free；可能仍被并发 objc_msgSend 扫描。
        collect_free_later(old, cap);
    }
}
```

### 5. preoptimized cache 安装

```javascript
// 简化自 initializeToPreoptCacheInDisguise() 和 maybeConvertToPreoptimized()
void initialize_with_preopt(cache_t *cache, const preopt_cache_t *preopt) {
    // 类 realize 但尚未初始化时，不能让 cache 直接命中；
    // 所以先把 preopt 指针“伪装”为 capacity=1 的 bucket。
    bucket_t *disguised = pointer_that_makes_preopt_bit_one_look_like_SEL(preopt);
    cache->setBucketsAndMask(disguised, 0);
    cache->_occupied = preopt->occupied;
}

void convert_after_initialized(cache_t *cache) {
    const preopt_cache_t *preopt = cache->disguised_preopt_cache();
    if (!preopt) return;

    if (!cache->cls()->allowsPreoptCaches()) {
        cache->setBucketsAndMask(cache_t::emptyBuckets(), 0);
        return;
    }

    // entries 指针、hash 参数和 marker 被打包进 _bucketsAndMaybeMask。
    cache->_bucketsAndMaybeMask.store(pack_preopt_entries_pointer(preopt));
    cache->_occupied = preopt->occupied;
}
```

## 五、关键流程

### 1. 查找

`objc_msgSend` 或 runtime helper 先读当前 class 的 cache。动态 cache miss 返回 `nil`；preoptimized cache miss 可返回指定的 miss 值以避免竞态。

若 class 尚未初始化，进入慢路径，完成 realize / initialize 相关工作，并通常避免过早缓存。

慢路径在 `runtimeLock` 下搜索当前类方法列表、父类链、resolver 和转发逻辑。

找到 IMP 后调用 `log_and_fill_cache`，最终进入 `cache_t::insert` 填入发起查找的 class cache。

### 2. 插入

确认类已初始化，且当前不是 constant optimized cache。

必要时获取 `cacheUpdateLock`，计算 `newOccupied` 和容量阈值。

共享空 cache 要先换成私有 buckets；超过填充比例则扩容。

根据 `cache_hash(sel, mask)` 定位起始槽，线性探测到空槽后写入 `SEL + IMP`。

### 3. 扩容

`reallocate(oldCapacity, newCapacity, freeOld)` 分配新 buckets，调用 `setBucketsAndMask(newBuckets, newCapacity - 1)` 发布，并按需把旧 buckets 加入垃圾列表。 旧条目不会复制到新表，注释中说明这是用额外 cache fill 换取更少 cache 内存占用。

### 4. flush

`_objc_flush_caches(cls)` 在 `runtimeLock` 下调用 `flushCaches`。 传入具体 class 时会遍历该 class 及其子类；对非根普通类还会处理 metaclass 方向。传入 `nil` 时刷新所有已 realize 的 class 和 metaclass，并强制做一次更积极的 cache garbage collection。

`objc-runtime-new.mm` 中的方法变更路径也会触发 flush：例如 category attach、方法添加、 `method_setImplementation`、`method_exchangeImplementations` 等。测试 `cacheflush.m` 先让 `TestRoot` 和 `Sub` 的实例/类方法填入 cache， 再 `dlopen` 两个 category dylib，断言旧返回值 1 被刷新为 2，再刷新为 3。

### 5. preoptimized cache

dyld shared cache builder 可为共享缓存中的类预构建 `preopt_cache_t`，runtime 与 builder 共享结构定义。

类 realize 时，如果环境允许且 root 覆盖检查通过，cache 先保存“伪装”的 preopt 指针，避免未初始化类直接 cache hit。

类完成初始化后，`maybeConvertToPreoptimized()` 把 entries 指针、hash 参数和 marker 打包为真正的 constant optimized cache。

如果方法列表发生可能破坏预优化假设的变化，runtime 会丢弃 preopt cache，并递归设置禁止标记。

`cacheflush-constant.m` 通过 `NSBlock` 这类当前通常有 constant cache 的父类，覆盖 `+foo` / `+bar`，再交换实现，验证 constant cache 场景下也不能保留旧 IMP。

## 六、测试给出的行为边界

|  |  |
|----|----|
| `test/cacheflush*.m` | 验证动态加载 category 后，已缓存的类方法和实例方法必须失效；子类 cache 也不能继续命中旧实现。 |
| `test/cacheflush-constant.m` | 覆盖 constant/preoptimized cache 与方法交换场景，期望输出顺序从 `foo bar` 变为 `bar foo`。 |
| `test/methodCacheLeaks.m` | 动态创建多个类并制造从 1 到 32768 个 selector 的 cache 压力，再运行 `leaks`，覆盖扩容、垃圾回收和销毁路径的内存释放行为。 |

## 七、源码依据

- `runtime/objc-cache.mm`：cache 哈希、bucket 写入、插入、扩容、flush erase、垃圾回收、preopt cache 转换。
- `runtime/objc-runtime-new.h`：`bucket_t`、`cache_t`、`preopt_cache_t` 结构和方法声明。
- `runtime/objc-runtime-new.mm`：慢速查找、cache fill、`flushCaches`、方法变更触发 flush、preopt 禁用逻辑。
- `test/cacheflush.m`、`cacheflush0.m`、`cacheflush2.m`、`cacheflush3.m`：动态 category 覆盖旧 cache 的测试。
- `test/cacheflush-constant.m`：constant cache 与 `method_exchangeImplementations` 行为测试。
- `test/methodCacheLeaks.m`：大量 cache 容量变化后的泄漏测试。
