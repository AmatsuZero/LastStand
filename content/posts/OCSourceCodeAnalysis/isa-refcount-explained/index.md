+++
title = "objc4：isa_t、nonpointer isa、引用计数与 SideTable"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 10
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

# isa_t、nonpointer isa、引用计数与 SideTable

本文基于 objc4 仓库中的 runtime 源码和相关测试，解释 Objective-C 对象头里的 `isa_t` 如何同时承载类信息、引用计数、弱引用/关联对象标记，以及这些信息何时转移到 `SideTable`。

- [作用](#role)
- [实现原理与位布局](#layout)
- [核心结构和关键字段方法](#structures)
- [关键流程](#flows)
- [测试如何约束行为](#tests)

## 1. 作用

传统 Objective-C 对象的第一个机器字是 `isa`，直接保存类指针。objc4 在支持 `SUPPORT_NONPOINTER_ISA` 的平台上把这个机器字扩展为 `isa_t`： 低位和高位保存状态，中间区域保存类信息。这样一次对象头访问就能拿到类、内联引用计数、 是否有弱引用、是否有关联对象、是否可能有 C++ 析构等信息。

### 为什么要 nonpointer isa

对象绝大多数时候引用计数很小，把计数放进 `isa` 可让 retain/release 走原子 CAS 快路径，避免进入全局散列表和锁。

### 为什么仍需要 SideTable

`isa` 空间有限。引用计数溢出、raw isa 对象、弱引用表，以及 deallocating 状态的兼容存储，都需要 `SideTable`。

### raw isa 的存在原因

类对象始终使用 raw pointer isa；某些类通过 `instancesRequireRawIsa()` 或 运行时配置禁用 nonpointer isa；测试 `rawisa.m` 还覆盖了 `__DATA,__objc_rawisa` 段禁用 nonpointer isa 的场景。

## 2. 实现原理与位布局

`runtime/isa.h` 按架构定义 `ISA_BITFIELD`。packed isa 会把类指针右移后存入 `shiftcls` 或 `shiftcls_and_sig`；indexed isa 则把类数组索引存入 `indexcls`。两者共同点是 `nonpointer` 位为 1，且在支持内联引用计数时拥有 `extra_rc` 与 `has_sidetable_rc`。

| 字段 | 位置/形态 | 含义 |
|----|----|----|
| `nonpointer` | 最低位 | 为 1 表示 `isa` 不是裸类指针，而是压缩字段集合。 |
| `has_assoc` | 状态位 | 对象曾经设置过关联对象。释放时如果为 0，可跳过关联对象清理。 |
| `has_cxx_dtor` | 部分架构存在 | 类或实例是否需要 C++ 析构。部分 arm64e 布局没有独立位，会回到类元数据查询。 |
| `shiftcls` / `shiftcls_and_sig` | 类指针区域 | packed isa 的类信息。ptrauth 平台可能包含签名相关位。 |
| `indexcls` | indexed isa 的索引区域 | 通过 `objc_indexed_classes[index]` 找到真实类。 |
| `magic` | 校验位 | 调试和快速识别 nonpointer isa 布局。 |
| `weakly_referenced` | 状态位 | 对象曾进入弱引用表，dealloc 时需要清理 weak table。 |
| `has_sidetable_rc` | `extra_rc` 前一位 | 表示有一部分引用计数已经放入 `SideTable::refcnts`。 |
| `extra_rc` | 最高若干位 | 内联引用计数。源码注释要求它是最高有效位一侧字段，以便利用加减法 carry/overflow。 |

``` cpp
// runtime/isa.h 的思想摘要：不同架构位数不同，但字段职责一致。
#define ISA_BITFIELD                 \
    uintptr_t nonpointer        : 1; // 1 表示 nonpointer isa，0 表示 raw class pointer \
    uintptr_t has_assoc         : 1; // 是否可能有关联对象 \
    uintptr_t has_cxx_dtor      : 1; // 是否可能需要 C++ 析构，部分布局没有这个位 \
    uintptr_t shiftcls          : N; // 类指针右移后的主体位，或 indexed isa 的 indexcls \
    uintptr_t magic             : M; // 布局校验位 \
    uintptr_t weakly_referenced : 1; // 是否曾被弱引用 \
    uintptr_t has_sidetable_rc  : 1; // SideTable 中是否有溢出的引用计数 \
    uintptr_t extra_rc          : R; // 内联引用计数，retain/release 快路径直接加减这里
```text

**计数语义：**源码中 `initIsa()` 为新 nonpointer 实例设置 `extra_rc = 1`，`rootRetainCount()` 对 nonpointer isa 直接返回 `extra_rc + sidetable extra`。因此这里的 `extra_rc` 表示用户可观察的 retain count 基数，而不是“额外持有数 + 1”这种外部抽象。

## 3. 核心结构和关键字段方法

### `isa_t`：同一个机器字的两种解释

`runtime/objc-private.h` 中 `isa_t` 是 union：既可以通过 `bits` 做整字原子更新，也可以通过位字段读写状态。`cls` 被放在 private 区域，迫使调用者通过 `setClass()` 和 `getClass()` 处理 mask、indexed isa 和 pointer authentication。

``` cpp
union isa_t {
    uintptr_t bits;        // retain/release 使用整字 CAS 修改 isa

private:
    Class cls;             // raw isa 下的类指针；访问要走 setClass/getClass

public:
    struct {
        ISA_BITFIELD;      // 来自 runtime/isa.h 的架构相关位布局
    };

    bool isDeallocating() const {
        // nonpointer isa 没有单独 deallocating 位：
        // extra_rc == 0 且没有 SideTable 计数，表示正在/应该 dealloc。
        return extra_rc == 0 && has_sidetable_rc == 0;
    }
};
```text

### `objc_object`：对象头与入口方法

`objc_object` 把 `isa_t` 存在 `isa_storage` 中，并提供三类入口： `ISA()`/`getIsa()` 解码类，`initIsa()`/`changeIsa()` 初始化或改写类， `rootRetain()`/`rootRelease()`/`clearDeallocating()` 操作生命周期。

``` cpp
struct objc_object {
private:
    char isa_storage[sizeof(isa_t)];
    isa_t &isa();          // 对象第一个机器字

public:
    Class ISA(bool authenticated = false) const;
    void initInstanceIsa(Class cls, bool hasCxxDtor);
    Class changeIsa(Class newCls);

    id rootRetain();
    bool rootRelease();
    uintptr_t rootRetainCount() const;
    void clearDeallocating();
};
```text

### `SideTable`：锁、引用计数表、弱引用表

`runtime/NSObject-private.h` 定义 `SideTable`。真实全局容器在 `NSObject.mm` 中是 `StripedMap<SideTable>`，按对象地址映射到不同条带，降低锁竞争。

``` cpp
struct SideTable {
    spinlock_t slock;      // 保护 refcnts 和 weak_table
    RefcountMap refcnts;   // key 是 DisguisedPtr<objc_object>，避免 leaks 把它当根
    weak_table_t weak_table;
};
```text

`NSObject.mm` 中 SideTable 引用计数的低位布局如下：

``` cpp
#define SIDE_TABLE_WEAKLY_REFERENCED (1UL<<0) // 对象曾被弱引用
#define SIDE_TABLE_DEALLOCATING      (1UL<<1) // raw isa 或 SideTable 路径的 deallocating 标记
#define SIDE_TABLE_RC_ONE            (1UL<<2) // 每一次 retain 增加的单位
#define SIDE_TABLE_RC_SHIFT 2                 // 真实计数 = refcnt >> 2
```text

## 4. 关键流程

### 4.1 isa 初始化

**选择 raw 还是 nonpointer。** `initInstanceIsa(cls, hasCxxDtor)` 要求类不需要 raw isa，然后调用 `initIsa(cls, true, hasCxxDtor)`；类对象用 `initClassIsa()`，始终 raw isa。

**写入 magic 和类信息。** packed isa 写 `ISA_MAGIC_VALUE` 后通过 `setClass()` 写入 `shiftcls`；indexed isa 写 `ISA_INDEX_MAGIC_VALUE` 和 `indexcls`。

**建立初始引用计数。** 若支持 `ISA_HAS_INLINE_RC`，新 nonpointer 对象设置 `extra_rc = 1`。

``` cpp
// runtime/objc-object.h：初始化 nonpointer isa 的关键逻辑
isa_t newisa(0);
newisa.bits = ISA_MAGIC_VALUE;  // nonpointer 位和 magic 位来自常量
newisa.setClass(cls, this);     // packed isa: 写 shiftcls/shiftcls_and_sig
newisa.extra_rc = 1;            // 新对象 retainCount 从 1 开始
isa() = newisa;                 // 单次存储发布对象头
```text

### 4.2 retain 快路径

**入口分流。** `objc_retain()` 跳过 nil/tagged pointer，然后进入 `obj->retain()`。 `retain()` 在无自定义 RR 时走 `rootRetain()`，否则发消息或调用 Swift RR。

**raw isa 进入 SideTable。** 如果 `isa.nonpointer == 0`，且不是元类，retain 直接调用 `sidetable_retain()`。

**nonpointer isa 原子加一。** 使用 `LoadExclusive` / `StoreExclusive` 循环，把 `isa.bits += RC_ONE`，也就是增加 `extra_rc`。

**溢出时转慢路径。** 加法 carry 表示 `extra_rc` 溢出；快路径调用 `rootRetain_overflow()` 进入完整路径。

``` cpp
// rootRetain() 的核心思想，省略 custom RR 和 tagged pointer 分支
oldisa = LoadExclusive(&isa().bits);
do {
    newisa = oldisa;

    if (!newisa.nonpointer) {
        ClearExclusive(&isa().bits);
        return sidetable_retain();     // raw isa 没有内联计数
    }

    if (newisa.isDeallocating()) {
        ClearExclusive(&isa().bits);
        return tryRetain ? nil : (id)this;
    }

    uintptr_t carry;
    newisa.bits = addc(newisa.bits, RC_ONE, 0, &carry); // extra_rc++

    if (carry) {
        // extra_rc 放不下：完整慢路径会把一半计数放进 SideTable
        return rootRetain_overflow(tryRetain);
    }
} while (!StoreExclusive(&isa().bits, &oldisa.bits, newisa.bits));
```cpp

### 4.3 retain 溢出到 SideTable

完整慢路径中，retain 溢出不会把所有计数都搬走，而是把 `extra_rc` 留在半满状态 `RC_HALF`，同时设置 `has_sidetable_rc = true`，再把另一半计数加到 `SideTable::refcnts`。这样后续 retain/release 仍有较大概率继续命中内联快路径。

``` cpp
// rootRetain(..., RRVariant::Full) 溢出处理
if (carry) {
    sidetable_lock();              // 保护 SideTable refcnts
    newisa.extra_rc = RC_HALF;     // isa 内保留一半容量
    newisa.has_sidetable_rc = true;
    transcribeToSideTable = true;
}

// CAS 成功后执行，避免 isa 和 SideTable 不一致
if (transcribeToSideTable) {
    sidetable_addExtraRC_nolock(RC_HALF);
}
```text

### 4.4 release 快路径、借计数与 dealloc 判定

**nonpointer release 先减内联计数。** `rootRelease()` 做 `isa.bits -= RC_ONE`。如果减法未 underflow，则 CAS 成功后检查 `newisa.isDeallocating()`。

**underflow 且有 SideTable 计数时借回。** 若 `has_sidetable_rc` 为真，慢路径锁住 SideTable，调用 `sidetable_subExtraRC_nolock(RC_HALF)` 借一批计数回 `extra_rc`。

**无可借计数时进入 dealloc。** 当内联计数减到 0 且没有 SideTable 计数时，`isDeallocating()` 为真，随后 `performDealloc()` 调用 `dealloc` 或自定义 dealloc initiation。

``` cpp
// rootRelease() 的核心思想
newisa.bits = subc(newisa.bits, RC_ONE, 0, &carry); // extra_rc--
if (carry) {
    // extra_rc 下溢：如果 SideTable 有计数，尝试借回 RC_HALF
    goto underflow;
}

if (newisa.isDeallocating()) {
    // extra_rc == 0 且 has_sidetable_rc == 0
    goto deallocate;
}

underflow:
if (newisa.has_sidetable_rc) {
    sidetable_lock();
    auto borrow = sidetable_subExtraRC_nolock(RC_HALF);
    newisa.extra_rc = borrow.borrowed - 1; // 同时补做本次 release
    newisa.has_sidetable_rc = borrow.remaining != 0;
    // CAS 成功后，如果 SideTable 没剩计数，清除 refcnts 项
}

deallocate:
if (performDealloc) this->performDealloc();
```text

### 4.5 raw isa 的 SideTable retain/release

raw isa 没有 `extra_rc`。`sidetable_retain()` 直接给 `refcnts[this]` 加 `SIDE_TABLE_RC_ONE`；`sidetable_release()` 如果没有表项， 会插入 `SIDE_TABLE_DEALLOCATING` 并触发 dealloc。如果已有表项且计数大于标志位，则减 `SIDE_TABLE_RC_ONE`。

``` cpp
// raw isa release 的关键语义
auto it = table.refcnts.try_emplace(this, SIDE_TABLE_DEALLOCATING);
auto &refcnt = it.first->second;

if (it.second) {
    do_dealloc = true;                 // 原本没有额外 retain，release 后归零
} else if (refcnt < SIDE_TABLE_DEALLOCATING) {
    do_dealloc = true;
    refcnt |= SIDE_TABLE_DEALLOCATING; // 保留 weak 标志，设置 deallocating
} else if (!(refcnt & SIDE_TABLE_RC_PINNED)) {
    refcnt -= SIDE_TABLE_RC_ONE;       // 正常减 SideTable 计数
}
```text

### 4.6 dealloc 与 clearDeallocating

`rootDealloc()` 对简单 nonpointer 对象有极快路径：没有弱引用、关联对象、C++ 析构和 SideTable 计数时直接 `free(this)`。否则进入对象销毁流程，最后通过 `objc_clear_deallocating()` 调用 `clearDeallocating()` 清理 SideTable 和 weak table。

``` cpp
// clearDeallocating() 的分流
if (!isa().nonpointer) {
    sidetable_clearDeallocating();       // raw isa：状态都在 SideTable
} else if (isa().weakly_referenced || isa().has_sidetable_rc) {
    clearDeallocating_slow();            // nonpointer：只在需要时进 SideTable
}

// clearDeallocating_slow()
table.lock();
if (isa().weakly_referenced) {
    weak_clear_no_lock(&table.weak_table, (id)this);
}
if (isa().has_sidetable_rc) {
    table.refcnts.erase(this);
}
table.unlock();
```text

### 4.7 changeIsa 时的计数迁移

`object_setClass()` 可能触发 `changeIsa()`。测试 `nonpointerisa.m` 验证了 nonpointer 到 nonpointer、nonpointer 到 raw pointer、raw pointer 到 raw pointer 都必须保留 retain count。关键点是 nonpointer 变 raw pointer 时，源码先锁 SideTable，再改 isa，随后用 `sidetable_moveExtraRC_nolock()` 把旧 `extra_rc`、deallocating 和 weak 标志转写到 SideTable。

``` cpp
// changeIsa(): nonpointer -> raw pointer 的保守迁移
if (oldisa.nonpointer && newClsRequiresRawIsa) {
    sidetable_lock();                 // 防止并发 release 看到半迁移状态
    newisa.setClass(newCls, this);    // isa 变成 raw class pointer
    StoreExclusive(&isa().bits, &oldisa.bits, newisa.bits);

    sidetable_moveExtraRC_nolock(
        oldisa.extra_rc,
        oldisa.isDeallocating(),
        oldisa.weakly_referenced);
    sidetable_unlock();
}
```

## 5. 测试如何约束行为

| 测试文件 | 覆盖点 |
|----|----|
| `test/nonpointerisa.m` | 验证 nonpointer 位、packed/indexed isa 的调试 mask、retain/release 对 `isa` 增减 `RC_ONE`、弱引用和关联对象只翻转一个状态位，以及 `changeIsa()` 迁移后 retain count 不丢失。 |
| `test/rawisa.m` | 验证带 `__DATA,__objc_rawisa` 段的程序会禁用 nonpointer isa，并打印 `RAW ISA` 诊断。 |
| `test/rr-sidetable.m` | 用多线程反复 retain/release 触发 nonpointer isa 与 SideTable 之间的引用计数转移，确保不会提前 dealloc，最终最后一次 release 后能正确 dealloc。 |
| `test/supported-inline-refcnt.m` | 验证类通过 `_OBJC_SUPPORTED_INLINE_REFCNT` 等宏声明自定义内联引用计数时， retain/release/dealloc 行为正确，包括把 dealloc 调度回主线程的变体。 |

## 6. 速查总结

nonpointer isa extra_rc 快路径 SideTable 溢出存储 weak table 清理

objc4 的对象生命周期优化可以概括为：类信息仍从 `isa` 解码；小引用计数直接放在 `extra_rc`；超过 `extra_rc` 容量时把一半计数转移到 `SideTable`； release 下溢时再从 `SideTable` 借回；对象真正销毁时根据 `weakly_referenced`、`has_assoc`、`has_sidetable_rc` 等位决定能否快释放，以及是否需要 清理 weak table 和 SideTable 记录。

## 主要源码依据

- `runtime/isa.h`：packed/indexed isa 位布局、`RC_ONE`、`RC_HALF`。
- `runtime/objc-private.h`：`isa_t`、`objc_object`、引用计数方法声明。
- `runtime/objc-object.h`：`initIsa`、`changeIsa`、`rootRetain`、`rootRelease`、`rootRetainCount`、`clearDeallocating`。
- `runtime/NSObject-private.h`：`SideTable` 和 `RefcountMap` 定义。
- `runtime/NSObject.mm`：SideTable 标志位、溢出/借回辅助函数、raw isa SideTable retain/release、dealloc 清理。
- `test/nonpointerisa.m`、`test/rawisa.m`、`test/rr-sidetable.m`、`test/supported-inline-refcnt.m`：行为约束和边界场景。
