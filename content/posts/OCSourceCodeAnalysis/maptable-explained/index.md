+++
title = "runtime/maptable.h 作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 17
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime NXMapTable 开放寻址哈希表 runtime/maptable.h

# runtime/maptable.h 作用与实现原理

`runtime/maptable.h` 定义了 Objective-C runtime 里旧 NeXT 风格的 `NXMapTable`：一个通用的 **key - value 指针映射表**。 它不拥有业务对象，只负责把指针或整数形式的 key 映射到指针或整数形式的 value， 并通过回调把“怎么 hash、怎么比较、释放时怎么处理”交给调用方决定。

**存储模型**连续桶数组，每个桶是 `{key, value}`。

**冲突处理**开放寻址 + 线性探测。

**扩容阈值**元素数超过桶数的 75% 后翻倍重哈希。

**runtime 用途**类名表、协议表、future class 表、少量 meta 到 non-meta 映射。

<a id="role"></a>
## 阅读路径

1.  [它解决什么问题](#role)
2.  [和 hashtable2 的区别](#hash-vs-map)
3.  [核心数据结构](#shape)
4.  [Prototype 回调机制](#prototype)
5.  [查找、插入、删除、扩容流程](#algorithm)
6.  [带注释核心代码](#code)
7.  [runtime 中的实际使用](#runtime-use)
8.  [必须记住的约束](#rules)

<a id="hash-vs-map"></a>
## 1. 它解决什么问题

runtime 需要维护很多“名字到结构体指针”“元类到类”“未来会出现的类名到占位 Class”的映射。 这些映射发生在启动、加载镜像、注册类、查找协议等低层路径上，不能依赖 Objective-C 容器对象。 `NXMapTable` 就是一个 C 接口的轻量哈希表。

### 它是什么

一个 `void *` key 到 `void *` value 的映射表。key 和 value 可以是指针，也可以把整数强转成指针使用。

### 它不是什么

它不是 `NSDictionary`，没有对象语义、没有 retain/release、没有自动拷贝 key。释放行为只由 prototype 的 `free` 回调决定。

### 为什么还存在

这是旧 runtime ABI 和调试工具会看到的接口。当前源码中很多新结构已转向 `DenseMap`，但类名表、协议表等路径仍在使用它。

<a id="shape"></a>
## 2. 和 hashtable2 的区别

`docs/hashtable2-explained.html` 讲的是 `NXHashTable`： 它是“集合”，只回答“某个元素在不在表里”。`NXMapTable` 是“映射表”，回答的是 “这个 key 对应哪个 value”。两者都使用 callback 抽象 hash/equality/free，但存储形态和冲突处理完全不同。

| 对比项 | `NXHashTable` / `hashtable2.mm` | `NXMapTable` / `maptable.mm` |
|----|----|----|
| 数据语义 | 集合：保存一个 `data` 元素，等价于 `Set<data>`。 | 映射：保存 `{key, value}`，等价于 `Map<key, value>`。 |
| 核心问题 | 元素是否存在；相等元素插入时替换旧元素。 | key 是否存在；相等 key 插入时只替换 value，保留表内原始 key。 |
| 桶结构 | bucket 是 `HashBucket`：空、单元素 `one`、多元素 `many` 小数组。 | bucket 是私有 `MapPair`：固定存一对 `key/value`，空桶由 key 哨兵标记。 |
| 冲突处理 | 分离链思想：所有冲突元素留在同一个 bucket 的小数组里。 | 开放寻址：冲突后继续向后找下一个桶，也就是线性探测。 |
| 扩容阈值 | 元素数超过 bucket 数时 rehash，平均每桶约 1 个元素。 | 元素数超过桶数的 75% 时 rehash，避免线性探测链过长。 |
| 删除代价 | 只改命中的 bucket；多元素 bucket 可能收缩回单元素形态。 | 删除后必须重建一段连续探测链，否则后续 key 可能因为提前遇到空桶而查不到。 |
| 上下文参数 | `NXHashTable` 有 `info` 字段，会透传给 callback。 | `NXMapTable` 没有 `info` 字段，callback 接收的是 table 本身。 |
| 典型 runtime 用途 | 保存一组唯一元素，比如 prototype 去重表这类集合场景。 | 类名到 `Class`、协议名到 `Protocol *`、metaclass 到 class 等映射场景。 |

### 一眼判断用哪个

只需要去重和成员判断，用 `NXHashTable`；需要从一个 key 找到另一个 value，用 `NXMapTable`。

### 为什么 Map 删除更麻烦

`NXHashTable` 的冲突被限制在一个 bucket 内；`NXMapTable` 的冲突会占用后续 bucket，删除中间元素会影响整条探测链。

### 为什么 Map 负载更保守

线性探测对负载因子很敏感。桶越满，查找越容易连续跨多个桶，所以 `NXMapTable` 在 75% 就扩容。

<a id="prototype"></a>
## 3. 核心数据结构

### `NXMapTable`

表对象本身，只保存回调集合、元素数量、桶数掩码和桶数组地址。

→

### `MapPair[]`

实现文件里的私有桶数组。每个桶有一个 key 和一个 value。空桶用 `NX_MAPNOTAKEY` 标记。

| 字段 | 含义 | 为什么这样设计 |
|----|----|----|
| `prototype` | 指向 `NXMapTablePrototype`，里面是 hash、isEqual、free 回调。 | 同一个表实现可以支持指针 key、字符串 key，甚至自定义 key。 |
| `count` | 当前有效键值对数量。 | 用于计数、判断扩容、快速比较两张表大小。 |
| `nbBucketsMinusOne` | 桶数减一。桶数始终是 2 的幂，因此这个字段也是位掩码。 | `hash & nbBucketsMinusOne` 可以快速取模定位桶。 |
| `buckets` | 私有 `MapPair` 数组地址。 | 连续内存提高局部性；开放寻址不需要额外链表节点。 |

**一个关键点：** 头文件只暴露 `NXMapTable` 和函数声明，真实桶类型 `MapPair`、探测算法、扩容删除逻辑都在 `runtime/maptable.mm`。所以理解这个文件必须把 `maptable.h` 和 `maptable.mm` 一起看。

<a id="algorithm"></a>
## 4. Prototype 回调机制

`NXMapTablePrototype` 是这张表的“策略对象”。表本身只知道保存 key 和 value， 但不知道 key 怎么 hash、两个 key 怎么算相等、释放表时是否要释放 key/value。

### `hash(table, key)`

把 key 变成无符号整数。默认指针版本会右移指针低位；字符串版本会遍历字节并做混合。

### `isEqual(table, a, b)`

判断两个 key 是否相等。实现中会先比较指针相等，再调用这个回调。

### `free(table, key, value)`

`NXResetMapTable` 和 `NXFreeMapTable` 遍历已有元素时调用。默认 prototype 是 no-op。

| 内置 prototype | key 类型 | hash | 相等判断 | 释放 |
|----|----|----|----|----|
| `NXPtrValueMapPrototype` | 指针或整数 | 指针地址右移，去掉常见对齐产生的低位 0 | 指针身份相等 | 不释放 |
| `NXStrValueMapPrototype` | C 字符串 | 按字符串内容计算 | `strcmp` 内容相等 | 不释放 |

<a id="code"></a>
## 5. 实现原理：开放寻址 + 线性探测

`NXMapTable` 没有链表桶。每个 key 先用 hash 定位一个理想桶。 如果这个桶被别的 key 占了，就向后一个桶一个桶找，直到遇到同 key 或空桶。

**0**其他 key

**1**其他 key

**2**hash(key) 命中起点

**3**冲突，继续探测

**4**找到目标 key

**5**空桶，查找失败会在这里停止

**6**其他 key

**7**其他 key

### 查找流程

**1算 hash**调用 prototype 的 `hash`，或使用调用方传入的 hash。

**2定位桶**`index = hash & nbBucketsMinusOne`。

**3看起点**空桶代表不存在；非空就比较 key。

**4线性探测**不相等就 `(index + 1) & mask` 继续。

**5返回结果**找到则返回表里保存的原始 key 和 value，遇空桶则失败。

### 插入流程

**1拒绝哨兵 key**`-1` 是内部空桶标记，不能作为真实 key。

**2找桶**从 hash 对应桶开始查找。

**3已有 key**如果 key 相等，覆盖 value 并返回旧 value。

**4空桶写入**如果遇到空桶，写入 key/value，`count++`。

**5检查负载**超过 75% 就扩容为两倍桶数并重插入所有元素。

### 删除流程为什么特殊

开放寻址的删除不能简单把目标桶清空。因为目标桶后面可能有因为冲突而挪到后方的 key。 如果直接清空，之后查找这些 key 时会提前遇到空桶并误判“不存在”。所以删除要把连续非空区间取出， 清空后再把剩余元素重新插入。

**0**无关

**1**A 的理想位置

**2**删除 B

**3**C 因冲突在这里

**4**D 因冲突在这里

**5**连续区间结束

**6**无关

**7**无关

删除 B 时，代码会把 A、C、D 这一段连续区间都清掉，再把除 B 外的元素重新插入。 这样 C、D 会回到它们在当前表容量下应该出现的位置，查找链不会断。

<a id="runtime-use"></a>
## 6. 带详细注释的核心代码片段

### 6.1 公开结构：表对象和策略对象

```javascript
typedef struct _NXMapTable {
    const struct _NXMapTablePrototype *prototype;
    unsigned count;
    unsigned nbBucketsMinusOne;
    void *buckets;
} NXMapTable;

typedef struct _NXMapTablePrototype {
    unsigned (*hash)(NXMapTable *table, const void *key);
    int      (*isEqual)(NXMapTable *table, const void *key1, const void *key2);
    void     (*free)(NXMapTable *table, void *key, void *value);
    int style;
} NXMapTablePrototype;
```

- `prototype` 决定这张表如何理解 key。
- `count` 是真实元素数，不包括空桶。
- `nbBucketsMinusOne` 是桶数减一，也是取模掩码。
- `buckets` 指向实现文件中的 `MapPair` 数组。
- `style` 当前必须为 0，是历史保留扩展位。

### 6.2 桶数组、哨兵和取模

```javascript
typedef struct _MapPair {
    const void *key;
    const void *value;
} MapPair;

#define NX_MAPNOTAKEY ((void *)(-1))

static inline unsigned bucketOfHash(NXMapTable *table, unsigned hash) {
    // 桶数始终是 2 的幂，所以 hash & (bucketCount - 1)
    // 等价于 hash % bucketCount，但比除法取模更快。
    return hash & table->nbBucketsMinusOne;
}

static inline unsigned nextIndex(NXMapTable *table, unsigned index) {
    // 线性探测的“下一个桶”。
    // & mask 让 index 到尾部后自然绕回 0。
    return (index + 1) & table->nbBucketsMinusOne;
}
```

**为什么 key 不能是 `-1`？** 因为空桶不是用额外布尔位表示，而是把 `key == NX_MAPNOTAKEY` 当成空。 如果真实 key 也等于 `-1`，表就分不清“空桶”和“真实元素”。

### 6.3 创建表：容量向 2 的幂靠拢

```cpp
NXMapTable *NXCreateMapTable(NXMapTablePrototype prototype, unsigned capacity) {
    NXMapTable *table = malloc(sizeof(NXMapTable));

    // prototype 必须提供三个核心回调，style 当前必须为 0。
    if (!prototype.hash || !prototype.isEqual || !prototype.free || prototype.style) {
        return NULL;
    }

    // runtime 会复用内容相同的 prototype，避免每张表都复制一份策略。
    table->prototype = canonicalizePrototype(prototype);
    table->count = 0;

    // 计算桶数：exp2u(log2u(capacity) + 1)。
    // 结果是一个 2 的幂；字段保存 bucketCount - 1。
    table->nbBucketsMinusOne = nextPowerOfTwoAboveCapacity(capacity) - 1;

    // 所有桶初始都写成 NX_MAPNOTAKEY，表示空。
    table->buckets = allocBuckets(table->nbBucketsMinusOne + 1);
    return table;
}
```

上面是按源码结构整理后的伪代码。真实实现还维护了一个全局 `prototypes` 哈希表， 用来把内容相同的 `NXMapTablePrototype` 合并成同一个指针。

### 6.4 查找：遇到空桶就能停止

```javascript
static inline void *
_NXMapMemberWithHash(NXMapTable *table, const void *key,
                     unsigned hash, void **value)
{
    MapPair *pairs = (MapPair *)table->buckets;
    unsigned index = bucketOfHash(table, hash);

    for (;;) {
        MapPair *pair = pairs + index;

        // 开放寻址中，探测链一旦遇到空桶，就说明 key 不存在。
        // 如果目标 key 曾经插入过，它一定会位于空桶之前。
        if (pair->key == NX_MAPNOTAKEY) {
            return NX_MAPNOTAKEY;
        }

        // 先做指针身份比较，失败后才走 prototype 的 isEqual 回调。
        if (pair->key == key || table->prototype->isEqual(table, pair->key, key)) {
            *value = (void *)pair->value;
            return (void *)pair->key; // 返回表里保存的原始 key。
        }

        // 冲突：继续看下一个桶。mask 会让 index 环形回绕。
        index = nextIndex(table, index);
    }
}
```

### 6.5 插入：覆盖旧值或写入第一个空桶

```javascript
void *NXMapInsertWithHash(NXMapTable *table, const void *key,
                          unsigned hash, const void *value)
{
    if (key == NX_MAPNOTAKEY) {
        // -1 是内部空桶标记，不能作为用户 key。
        return NULL;
    }

    MapPair *pairs = (MapPair *)table->buckets;
    unsigned index = bucketOfHash(table, hash);
    unsigned bucketCount = table->nbBucketsMinusOne + 1;

    for (;;) {
        MapPair *pair = pairs + index;

        if (pair->key == NX_MAPNOTAKEY) {
            // 找到空桶：插入新 key/value。
            pair->key = key;
            pair->value = value;
            table->count++;

            // 负载因子超过 3/4 后扩容，降低后续探测长度。
            if (table->count * 4 > bucketCount * 3) {
                _NXMapRehash(table);
            }
            return NULL; // 新插入，没有旧 value。
        }

        if (pair->key == key || table->prototype->isEqual(table, pair->key, key)) {
            // key 已存在：只替换 value，不替换原始 key。
            const void *old = pair->value;
            if (old != value) pair->value = value;
            return (void *)old;
        }

        // 冲突：线性探测下一个桶。
        index = nextIndex(table, index);
    }
}
```

### 6.6 扩容：新表翻倍，再重新插入

```cpp
static void _NXMapRehash(NXMapTable *table) {
    MapPair *oldPairs = (MapPair *)table->buckets;
    unsigned oldBucketCount = table->nbBucketsMinusOne + 1;
    unsigned oldCount = table->count;

    // 桶数翻倍。因为字段保存的是 bucketCount - 1，
    // 新 mask = 2 * oldBucketCount - 1。
    table->nbBucketsMinusOne = 2 * oldBucketCount - 1;
    table->count = 0;
    table->buckets = allocBuckets(table->nbBucketsMinusOne + 1);

    // 不能直接 memcpy。桶位置依赖 mask，扩容后每个 key 都要重新定位。
    for (unsigned i = 0; i < oldBucketCount; i++) {
        if (oldPairs[i].key != NX_MAPNOTAKEY) {
            NXMapInsert(table, oldPairs[i].key, oldPairs[i].value);
        }
    }

    // 如果重插后 count 变了，通常说明 hash/isEqual 的不变量被破坏。
    assert(oldCount == table->count);
    freeBuckets(oldPairs);
}
```

### 6.7 删除：清空连续链，再把剩余元素放回去

```javascript
void *NXMapRemove(NXMapTable *table, const void *key) {
    unsigned start = bucketOf(table, key);

    // 1. 从 start 开始扫描连续非空桶，找到目标 key。
    //    同时计算 chain 长度：这段连续桶都可能依赖彼此保持可查找。
    unsigned chain = scanUntilEmptyBucket(table, start, key);
    if (chain == 0) return NULL;

    // 2. 把这段连续桶临时保存下来，目标 key 除外。
    MapPair saved[...];
    void *oldValue = copyChainExceptRemovedKey(saved, table, start, chain, key);

    // 3. 把原连续桶全部清空，并相应减少 count。
    clearChain(table, start, chain);

    // 4. 重新插入剩余元素，让它们按当前 mask 形成新的正确探测链。
    for (each pair in saved) {
        NXMapInsert(table, pair.key, pair.value);
    }

    return oldValue;
}
```

这段是按真实源码逻辑写成的教学版伪代码。源码中为了避免小删除频繁 malloc， 对长度不超过 16 的 chain 使用栈上 `MapPair buffer[16]`。

<a id="rules"></a>
## 7. runtime 中的实际使用

`NXMapTable` 在这个 runtime 里不是泛泛而谈的工具类， 它直接服务类、协议、调试器可见信息的维护。

这些调用大多要求持有 `runtimeLock`。`NXMapTable` 自身不提供锁， 线程安全由外层 runtime 逻辑保证。

| 位置 | 映射 | 用途 |
|----|----|----|
| `gdb_objc_realized_classes` | 类名字符串 → `Class` | 按名字查找 runtime 分配的类，也暴露给调试器。 |
| `future_named_class_map` | 未来类名字符串 → 占位 `Class` | 支持在真实类加载前预留类结构。 |
| `protocol_map` | 协议名字符串 → `Protocol *` | 注册和查找协议。 |
| `nonmeta_class_map` | 元类指针 → 非元类 `Class` | 处理重名类等少数需要从 metaclass 找回 class 的路径。 |

### 类名表的典型路径

```text
// _read_images 第一次运行时创建类名表。
NXMapTablePrototype namedClassesPrototype = NXStrValueMapPrototype;
gdb_objc_realized_classes =
    NXCreateMapTable(namedClassesPrototype, namedClassesSize);

// 添加类名映射时，调用方已经算好 hash。
unsigned hash = namedClassTableHash(name);
NXMapInsertWithHash(gdb_objc_realized_classes, name, hash, signedCls);

// 查找类时复用同一个 hash，避免重复计算字符串 hash。
void *result = NXMapGetWithHash(gdb_objc_realized_classes, name, hash);
```

这里能看出 `NXMapGetWithHash` 和 `NXMapInsertWithHash` 的意义： 如果调用方本来就需要 hash，比如还要把 hash 混入指针认证 discriminator，就不用在 map 内部再算一次。 前提是传入的 hash 必须和 prototype 的 `hash(table, key)` 结果一致。

### Bundle 卸载相关：复制和释放 key

```javascript
void *NXMapKeyCopyingInsert(NXMapTable *table, const void *key, const void *value)
{
    void *realValue = NULL;
    void *realKey = NXMapMember(table, key, &realValue);

    if (realKey == NX_MAPNOTAKEY) {
        // 表里还没有这个 key：如果 key 来自可卸载镜像，复制一份稳定字符串。
        realKey = strdupIfMutable((char *)key);
    }

    // 表里已有 key 时，沿用表内原始 key，避免同名字符串重复分配。
    return NXMapInsert(table, realKey, value);
}

void *NXMapKeyFreeingRemove(NXMapTable *table, const void *key)
{
    void *realValue = NULL;
    void *realKey = NXMapMember(table, key, &realValue);

    if (realKey != NX_MAPNOTAKEY) {
        realValue = NXMapRemove(table, realKey);
        // 释放表内保存的真实 key，而不是调用方传入的那个 key。
        freeIfMutable((char *)realKey);
    }
    return realValue;
}
```

## 8. 必须记住的约束

### key 不变量

- key 不能等于 `NX_MAPNOTAKEY`，也就是 `(void *)-1`。
- key 插入后，参与 hash 和 equality 的内容不能改变。
- 如果两个 key 相等，它们的 hash 必须相同。

### value 语义

- `NXMapGet` 找不到时返回 `NULL`。
- 如果业务上需要存储 `NULL` value，要用 `NXMapMember` 判断 key 是否存在。
- 默认 prototype 不释放 key/value。

### 性能直觉

- 平均查找、插入是常数时间。
- 冲突越多，线性探测越长。
- 超过 75% 负载后翻倍扩容，换空间减少探测长度。

**一遍读懂版总结：** `NXMapTable` 是 runtime 的 C 级 key-value 哈希表。它把 key/value 存在连续桶数组里， 用 prototype 回调定制 key 的 hash 和相等判断，用 `NX_MAPNOTAKEY` 标记空桶， 用 `hash & mask` 定位起点，用线性探测解决冲突，用 75% 负载因子触发翻倍重哈希。 删除时必须重建连续探测链，否则后面的 key 会因为提前遇到空桶而查不到。

文档依据 `runtime/maptable.h`、`runtime/maptable.mm`、 `runtime/objc-runtime-new.mm` 和 `runtime/objc-gdb.h` 编写。
