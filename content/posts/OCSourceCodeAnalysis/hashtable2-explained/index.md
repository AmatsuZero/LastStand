+++
title = "runtime/hashtable2.mm 作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 16
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime NXHashTable 集合结构

# runtime/hashtable2.mm 作用与实现原理

这个文件实现了旧 NeXT/Objective-C runtime 暴露的 `NXHashTable`：一个可存放任意指针或整数数据的哈希集合。它不保存 key-value 对；需要映射关系时，runtime 另用 `maptable.mm` 的 `NXMapTable`。

## 一遍读懂

- 它用 callback 决定“怎么 hash、怎么判等、怎么释放”。
- 每个 bucket 是一条很短的冲突链。
- bucket 中只有 1 个元素时直接存指针，避免额外分配。
- 元素数超过 bucket 数时扩容并重算位置。
- 删除会把 2 个元素的 bucket 收缩回单指针形态。

## 1. 它解决什么问题

`NXHashTable` 是 runtime 内部和兼容 API 使用的通用集合容器。调用者传入一组 `NXHashTablePrototype`，告诉表如何处理元素：`hash(info, data)` 计算哈希，`isEqual(info, a, b)` 判断相等，`free(info, data)` 在销毁或 reset 时释放元素。这样同一套表结构可以存指针、字符串，或“结构体首字段作为 key”的对象。

**关键不变量：**如果两个元素被 `isEqual` 判为相等，它们的 `hash` 必须一致；而且参与 hash 的内容不能在入表后变化。否则扩容重排后会找不到元素。

## 2. 数据结构：一层数组 + 小冲突链

**NXHashTable**保存 prototype、元素总数、bucket 数组和可透传给 callback 的 `info`。

**HashBucket**保存该 bucket 内元素个数，以及一个 `oneOrMany` union。

**oneOrMany**`count == 1` 时直接存元素指针；`count > 1` 时存指针数组。

### NXHashTable 的关键字段

```javascript
typedef struct {
    const NXHashTablePrototype *prototype; // 元素语义：hash、isEqual、free
    unsigned count;                        // 当前元素总数，Count 查询直接读它
    unsigned nbBuckets;                    // bucket 数量，决定哈希值如何落桶
    void *buckets;                         // 指向 HashBucket 数组
    const void *info;                      // 透传给 callback 的上下文
} NXHashTable;
```

| 字段 | 作用 | 在哪些流程中最关键 |
|----|----|----|
| `prototype` | 保存三类回调：如何计算哈希、如何判断相等、释放元素时做什么。 | 插入、查找、删除、释放。 |
| `count` | 维护表内元素总数。插入成功时加 1，删除成功时减 1。 | `NXCountHashTable`、扩容阈值判断。 |
| `nbBuckets` | bucket 数组长度。哈希值会通过取模或位与映射到 `0..nbBuckets-1`。 | `BUCKETOF`、rehash、遍历。 |
| `buckets` | 真正存储元素的桶数组。每个桶内部再用 `one` 或 `many` 表示冲突链。 | 所有读写路径。 |
| `info` | 不参与表结构本身，只作为上下文参数传给 callback。 | 自定义 hash/equal/free 需要额外上下文时。 |

```javascript
typedef union {
    const void *one;    // bucket 只有 1 个元素：直接把元素放这里
    const void **many;  // bucket 有多个元素：指向动态分配的元素数组
} oneOrMany;

typedef struct {
    unsigned count;     // 0: 空；1: elements.one；2+: elements.many
    oneOrMany elements;
} HashBucket;
```

这种设计承认“好的哈希表大多数 bucket 是空或单元素”。单元素路径不分配数组，查找和释放都少一次间接访问。

## 3. 从哈希值到 bucket

表根据平台配置选择两种取 bucket 方式。支持快速位运算时，bucket 数保持为 2 的幂，用 `hash & (nbBuckets - 1)` 取下标；否则用取模，bucket 数按 `2^n - 1` 增长。

```text
// 简化后的思想：先让 prototype.hash 算出哈希值，再映射到 bucket。
bucket = table->buckets + (
    SUPPORT_MOD
        ? hash(info, data) % table->nbBuckets
        : hash(info, data) & (table->nbBuckets - 1)
);

// 相等判断先比较指针，命中时不用调用 callback。
equal = (a == b) || table->prototype->isEqual(info, a, b);
```

## 4. 生命周期主流程

**创建**补齐默认 callback，规范化容量，分配 bucket 数组。

**查找**定位 bucket，在线性小数组里比较。

**插入**空位直接放；相等则替换；冲突则扩充 bucket。

**扩容**元素数超过 bucket 数时，新建 bucket 数组并重插元素。

**删除**找到后移除；2 元素 bucket 会退回单指针存储。

## 5. 插入、查找、查询流程

### 插入：从目标 bucket 到必要时 rehash

**1. 定位**`hash(data)`\
算出 bucket

**2. 空桶**写入 `one`\
直接成功

**3. 单元素**相等则替换\
不等则升为 `many`

**4. 多元素**扫描短链\
命中替换

**5. 负载过高**`count > nbBuckets`\
全表 rehash

1.  插入不是先扫全表，只访问哈希命中的一个 bucket。
2.  空桶和单元素桶是高频路径，所以实现避免了数组分配。
3.  如果插入的是“相等元素”，表保持集合语义：新元素替换旧元素，并返回旧元素。
4.  平均负载超过 1 后扩容，重插所有元素让冲突重新分布。

``` snippet
HashBucket *bucket = BUCKETOF(table, data); // 只进入一个候选桶
if (!bucket->count) {
    bucket->elements.one = data;           // 空桶：直接保存
    table->count++;
    return NULL;                           // 没有旧元素
}
if (bucket->count == 1 && ISEQUAL(table, data, bucket->elements.one)) {
    old = bucket->elements.one;            // 命中相等元素
    bucket->elements.one = data;           // 用新元素替换
    return old;
}
// 冲突：升级或扩展 many 数组；插入后可能触发 rehash。
```text

### 查找：只查一个 bucket，再按 bucket 形态分支

**1. 计算 hash**`BUCKETOF`\
得到候选桶

**2. 空桶**`count == 0`\
立即失败

**3. 单元素**`elements.one`\
比较一次

**4. 多元素**`elements.many`\
线性扫描

**5. 返回**`Get` 返回元素\
`Member` 返回真假

1.  `NXHashGet` 和 `NXHashMember` 的查找路径相同，区别只在返回值。
2.  `ISEQUAL` 先做指针比较，再调用 prototype 的 `isEqual`。
3.  多元素 bucket 是冲突链，但扩容策略让它通常很短。
4.  查找成功返回的是表里原来保存的元素，不一定是传入的临时查询对象。

``` snippet
if (!j) return NULL;                       // 空桶：不存在
if (j == 1) {
    return ISEQUAL(table, data, bucket->elements.one)
         ? (void *)bucket->elements.one    // 返回表中原始元素
         : NULL;
}
pairs = bucket->elements.many;
while (j--) {
    if (ISEQUAL(table, data, *pairs))       // 冲突链逐个比较
        return (void *)*pairs;
    pairs++;
}
```text

### 查询：计数是 O(1)，比较和遍历靠状态机

**计数**`table->count`\
直接读取

**初始化遍历**`i = nbBuckets`\
`j = 0`

**找非空桶**`--i`\
读取桶内数量

**吐出元素**`one` 或 `many[j]`\
每次一个

**比较表**遍历表 1\
逐项查表 2

1.  `NXCountHashTable` 不遍历，直接返回维护好的元素总数。
2.  `NXNextHashState` 从 bucket 数组尾部向前扫，遇到非空 bucket 才返回元素。
3.  `NXCompareHashTables` 先比较数量，再用遍历状态逐项调用 `NXHashMember`。
4.  遍历顺序由 bucket 分布和冲突数组决定，不能当作稳定顺序。

``` snippet
NXHashState state = NXInitHashState(table1);
while (NXNextHashState(table1, &state, &data)) {
    // Compare 的核心：表 1 的每个元素都必须能在表 2 找到。
    if (!NXHashMember(table2, data)) return NO;
}
return YES;

// Count 更简单：元素总数在插入/删除时已维护。
return table->count;
```text

## 6. 核心代码片段

### Prototype：把“元素语义”交给回调函数

```
typedef struct {
    uintptr_t (*hash)(const void *info, const void *data);
    int       (*isEqual)(const void *info,
                         const void *data1,
                         const void *data2);
    void      (*free)(const void *info, void *data);
    int       style; // 预留字段；当前必须为 0
} NXHashTablePrototype;

// 默认的指针哈希：把地址高位右移后与原地址异或。
// 目的不是密码学安全，而是让常见对齐指针的低位不至于全为 0。
uintptr_t NXPtrHash(const void *info, const void *data) {
    return (((uintptr_t)data) >> 16) ^ ((uintptr_t)data);
}

// 默认相等性：只比较两个指针值是否完全相同。
// 这意味着默认 NXHashTable 是“按对象地址/原始指针身份”去重。
int NXPtrIsEqual(const void *info, const void *data1, const void *data2) {
    return data1 == data2;
}

// 默认释放策略：什么都不做。
// 因此表默认不拥有元素，只负责保存指针；元素生命周期由调用者管理。
void NXNoEffectFree(const void *info, void *data) {}

// 常用组合：指针哈希 + 指针相等 + 不释放元素。
const NXHashTablePrototype NXPtrPrototype = {
    NXPtrHash, NXPtrIsEqual, NXNoEffectFree, 0
};
```text

### 创建：prototype 去重 + 默认行为

```
NXHashTable *NXCreateHashTable(NXHashTablePrototype prototype,
                               unsigned capacity,
                               const void *info) {
    if (!prototypes) bootstrap();       // 第一次使用时创建“prototype 表”
    if (!prototype.hash) prototype.hash = NXPtrHash;
    if (!prototype.isEqual) prototype.isEqual = NXPtrIsEqual;
    if (!prototype.free) prototype.free = NXNoEffectFree;

    // prototype 本身也放进一个 NXHashTable 中去重。
    // 这样多个表可共享同一份 callback 描述，减少重复分配。
    proto = NXHashGet(prototypes, &prototype);
    if (!proto) {
        proto = malloc(sizeof(NXHashTablePrototype));
        *proto = prototype;
        NXHashInsert(prototypes, proto);
    }

    table->nbBuckets = GOOD_CAPACITY(capacity); // 容量只是 hint
    table->buckets = ALLOCBUCKETS(table->nbBuckets);
    table->info = info;                         // 之后透传给 callback
}
```text

### 查找：先定位，再扫短链

```
void *NXHashGet(NXHashTable *table, const void *data) {
    HashBucket *bucket = BUCKETOF(table, data); // hash(data) 决定候选桶

    if (bucket->count == 0) return NULL;

    if (bucket->count == 1) {
        // 单元素 bucket 是最快路径：只做一次相等比较。
        return ISEQUAL(table, data, bucket->elements.one)
             ? (void *)bucket->elements.one
             : NULL;
    }

    // 多元素 bucket 是冲突链。设计假设链很短，所以直接线性扫描。
    for (each element in bucket->elements.many) {
        if (ISEQUAL(table, data, element)) return element;
    }
    return NULL;
}
```text

### 插入：三种 bucket 状态分别处理

```
void *NXHashInsert(NXHashTable *table, const void *data) {
    HashBucket *bucket = BUCKETOF(table, data);

    if (bucket->count == 0) {
        bucket->elements.one = data;    // 空桶直接变单元素桶
        bucket->count = 1;
        table->count++;
        return NULL;
    }

    if (bucket->count == 1) {
        if (ISEQUAL(table, data, bucket->elements.one)) {
            old = bucket->elements.one; // 集合语义：相等元素被新元素替换
            bucket->elements.one = data;
            return old;
        }
        // 第一次冲突：把 one 升级成 many[2]。
        bucket->elements.many = allocate_array(data, old_one);
    }

    // 后续冲突：分配更大的数组，把新元素插到数组头部。
    // 插入后如果 count > nbBuckets，说明平均负载超过 1，需要扩容。
    if (table->count > table->nbBuckets) rehash(table);
}
```text

### 扩容：重建 bucket，而不是原地搬移

```
void _NXHashRehashToCapacity(NXHashTable *table, unsigned newCapacity) {
    old = pseudo_table_pointing_to_current_buckets(table);

    table->nbBuckets = newCapacity;
    table->count = 0;
    table->buckets = ALLOCBUCKETS(newCapacity);

    // 每个元素必须重新插入，因为 bucket 下标依赖 nbBuckets。
    while (NXNextHashState(old, &state, &element)) {
        NXHashInsert(table, element);
    }

    // 只释放旧 bucket/数组壳，不释放元素本身。
    // 元素所有权仍属于新表。
    freeBuckets(old, NO);
}
```text

### 删除：保持单元素优化

```
void *NXHashRemove(NXHashTable *table, const void *data) {
    bucket = BUCKETOF(table, data);

    if (bucket->count == 1) {
        if (!ISEQUAL(table, data, bucket->elements.one)) return NULL;
        removed = bucket->elements.one;
        bucket->elements.one = NULL;    // 单元素桶变空桶
    } else if (bucket->count == 2) {
        // 删除其中一个后，另一个降级回 elements.one，释放 many 数组。
        removed = matching_element;
        bucket->elements.one = survivor;
        FREEPAIRS(old_many);
    } else {
        // 3 个以上时重新分配 count-1 的数组，拷贝删除项前后两段。
        bucket->elements.many = copy_all_except_removed();
    }
    table->count--;
    bucket->count--;
    return removed;
}
```text

### 查询/遍历：用状态对象逐个吐出元素

```
NXHashState NXInitHashState(NXHashTable *table) {
    NXHashState state;
    state.i = table->nbBuckets; // 从 bucket 数量开始，Next 中会先 --i
    state.j = 0;                // 当前 bucket 剩余未返回的元素数
    return state;
}

int NXNextHashState(NXHashTable *table, NXHashState *state, void **data) {
    HashBucket *buckets = (HashBucket *)table->buckets;

    while (state->j == 0) {
        if (state->i == 0) return NO; // 所有 bucket 都扫完
        state->i--;                   // 换到前一个 bucket
        state->j = buckets[state->i].count;
    }

    state->j--;                       // 返回当前 bucket 的下一个元素
    bucket = &buckets[state->i];
    *data = (bucket->count == 1)
          ? (void *)bucket->elements.one
          : (void *)bucket->elements.many[state->j];
    return YES;
}
```

## 7. 几个容易误解的点

| 问题 | 正确理解 |
|----|----|
| `NXHashInsert` 返回什么？ | 如果替换了相等元素，返回旧元素；如果是新插入，返回 `NULL`。`NXHashInsertIfAbsent` 则返回表中最终存在的元素。 |
| `NXEmptyHashTable` 和 `NXResetHashTable` 有何区别？ | `Empty` 只清空容器，不调用元素释放 callback；`Reset` 会对每个元素调用 prototype 的 `free`。 |
| 为什么扩容阈值是 `count > nbBuckets`？ | 它把平均负载控制在约 1。冲突仍可能存在，但每个 bucket 的线性链通常很短。 |
| 为什么要有 `NXPtrPrototype`、`NXStrPrototype`？ | 它们是常用 callback 组合：按指针判等、按字符串内容判等，以及结构体首字段作为 key 的变体。 |

## 8. 用一句话总结

`hashtable2.mm` 是一个小而老练的通用哈希集合实现：用 callback 抽象元素语义，用 bucket 数组实现平均 O(1) 查找，用单元素 bucket 优化常见路径，并在扩容时重插所有元素以维持哈希分布。
