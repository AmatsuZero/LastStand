+++
title = "Objective-C 消息发送 objc_msgSend 与慢速查找入口"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 2
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime dispatch

# Objective-C 消息发送：objc_msgSend 与慢速查找入口

Objective-C 的方法调用本质上是一次以 `receiver` 和 `SEL` 为键的动态派发。 在 arm64 上，`objc_msgSend` 先用少量汇编完成 nil/tagged pointer 判断和方法缓存查找； 只有缓存未命中时，才进入 C++ 慢路径 `lookUpImpOrForward`，沿类层级查找、触发动态解析、填充缓存或进入消息转发。

入口：runtime/Messengers.subproj/objc-msg-arm64.s 慢路径：runtime/objc-runtime-new.mm 缓存：runtime/objc-cache.mm 测试：test/msgSend.m

## 目录

1.  [作用](#purpose)
2.  [实现原理总览](#principle)
3.  [核心结构与约定](#structures)
4.  [快速路径](#fast-path)
5.  [慢速查找入口](#slow-path)
6.  [消息转发](#forwarding)
7.  [测试观察点](#tests)

<a id="purpose"></a>
## 作用

`objc_msgSend(id self, SEL _cmd, ...)` 是 Objective-C 实例方法和类方法调用的公共派发入口。 编译器把 `[obj method:arg]` 形式的调用降低为对 `objc_msgSend` 的调用；真正执行哪个 `IMP` 由运行时根据接收者的实际类、选择子和当前方法缓存决定。

### 动态派发

同一个 `SEL` 可以在不同类上命中不同 `IMP`，体现多态。

### 缓存加速

大多数热路径只扫描类的 `cache_t`，命中后直接尾调用 `IMP`。

### 语义兼容

`nil` 接收者返回零值；tagged pointer 通过标签映射到伪类继续派发。

### 扩展入口

未找到实现时支持 `+resolve...` 和完整的 forwarding 机制。

<a id="principle"></a>
## 实现原理总览

运行时把消息发送拆成两个层次：汇编快路径只做最必要的检查和缓存探测；C++ 慢路径负责需要加锁、可能初始化类、 搜索方法列表、调用解析器以及更新缓存的工作。

### 调用入口

`x0=self`，`x1=_cmd`，其余参数保持 ABI 原样传给最终 `IMP`。

### 接收者分类

先区分 `nil`、tagged pointer、普通对象，普通对象读取 `isa` 得到类。

### 缓存查找

在 `class->cache` 中用 `SEL` 哈希定位 bucket，反向线性探测。

### 慢路径

缓存 miss 进入 `__objc_msgSend_uncached`，调用 `lookUpImpOrForward`。

### 执行或转发

找到实现则填充缓存并尾调用；找不到则缓存 forwarding IMP。

快路径的关键是“尾调用”：缓存命中后不是返回给 `objc_msgSend` 再调用方法，而是直接跳到目标 `IMP`。 因此调用者看到的栈形态接近直接函数调用。

<a id="structures"></a>
## 核心结构、函数与约定

| 对象 | 位置 | 关键属性/约定 | 作用 |
|----|----|----|----|
| `objc_msgSend` | `objc-msg-arm64.s` | `x0/p0=self`，`x1/p1=_cmd`；命中时 `x17=IMP`；`x16` 保存待查找的类。 | 消息发送主入口，处理 nil/tagged pointer、读取 isa、执行缓存查找和尾调用。 |
| `CacheLookup` | `objc-msg-arm64.s` | 输入 `x1=SEL`、`x16=Class`；破坏 `x9-x13/x15/x17`；miss 时跳转到指定慢路径标签。 | 汇编宏，扫描方法缓存。支持 `NORMAL`、`GETIMP`、`LOOKUP` 三种模式。 |
| `bucket_t` | `objc-runtime-new.h` | arm64 布局为 `_imp` 在前、`_sel` 在后；arm64e 可用 SEL、类和 bucket 地址对 IMP 签名。 | 缓存表的单元，一项记录一个 `SEL -> IMP` 映射。 |
| `cache_t` | `objc-runtime-new.h` / `objc-cache.mm` | 保存 bucket 指针、mask、occupied、flags，也可能表示 dyld 预优化常量缓存。 | 每个类持有的方法缓存；动态插入时按填充率决定复用、扩容或重建。 |
| `lookUpImpOrForward` | `objc-runtime-new.mm` | 行为位包括 `LOOKUP_INITIALIZE`、`LOOKUP_RESOLVER`、`LOOKUP_NIL`、`LOOKUP_NOCACHE`。 | 标准 IMP 慢速查找：实现类检查、类实现/初始化、方法列表和父类搜索、解析、缓存填充。 |
| `_objc_msgForward` | `message.h` / `objc-msg-arm64.s` | 外部可见转发入口；缓存中实际放的是 `_objc_msgForward_impcache`。 | 未找到方法实现时进入 forwarding 处理器。 |

### 缓存结构节选

```asm
/* 节选并加注释：runtime/objc-runtime-new.h */
struct bucket_t {
#if __arm64__
    explicit_atomic<uintptr_t> _imp;  // arm64 上 IMP 在前，汇编 ldp 可一次取出 {imp, sel}
    explicit_atomic<SEL>       _sel;  // 选择子，缓存命中时必须等于当前 _cmd
#else
    explicit_atomic<SEL>       _sel;
    explicit_atomic<uintptr_t> _imp;
#endif

    inline SEL sel() const;
    inline IMP imp(bucket_t *base, Class cls) const; // 解码/认证后得到可调用 IMP
    void set(bucket_t *base, SEL newSel, IMP newImp, Class cls);
};

struct cache_t {
    explicit_atomic<uintptr_t> _bucketsAndMaybeMask; // bucket 指针，也可内联保存 mask 位
    uint16_t _occupied;                              // 已占用 bucket 数
    uint16_t _flags;                                 // 快速标志位，部分汇编路径依赖布局

    bucket_t *buckets() const;
    mask_t mask() const;
    void insert(SEL sel, IMP imp, id receiver);       // 慢路径找到结果后填充缓存
};
```

<a id="fast-path"></a>
## 快速路径：nil、tagged pointer 与 cache lookup

arm64 入口用 `cmp p0, #0` 同时覆盖 nil 和 tagged pointer：nil 等于零；启用 tagged pointer 时， 最高位为 1 的 tagged pointer 在有符号比较中表现为负数，因此走 `LNilOrTagged`。

### nil 接收者

`objc_msgSend` 直接清零通用返回寄存器和浮点返回寄存器后返回。 `test/msgSend.m` 中验证了对象、整数、结构体、浮点等 nil 消息返回零值且方法体未执行。

### tagged pointer

对 tagged pointer 不读取对象内存中的 isa，而是从 `_objc_debug_taggedpointer_classes` 或扩展标签表中取类，再复用同一段缓存查找逻辑。

### objc_msgSend 入口节选

```asm
/* 节选并加注释：runtime/Messengers.subproj/objc-msg-arm64.s */
MSG_ENTRY _objc_msgSend
    cmp p0, #0                  // p0/x0 是 self；比较 nil，同时让 tagged pointer 走负数分支
    b.le LNilOrTagged           // self == nil 或 MSB=1 的 tagged pointer

    ldr p14, [x0]               // 普通对象：从对象首字读取 raw isa
    GetClassFromIsa_p16 p14, 1, x0
                                // 解码/认证 isa，把 Class 放入 p16/x16
LGetIsaDone:
    CacheLookup NORMAL, _objc_msgSend, __objc_msgSend_uncached
                                // 查 class cache；命中就直接尾调用 IMP，miss 跳慢路径

LNilOrTagged:
    b.eq LReturnZero            // nil：不查找、不转发，直接返回零值
    GetTaggedClass              // tagged pointer：根据 tag 查到对应 Class，放入 x16
    b LGetIsaDone               // 回到同一个缓存查找入口

LReturnZero:
    mov x1, #0                  // 清理部分整数返回寄存器
    movi d0, #0                 // 清理浮点/向量返回寄存器
    movi d1, #0
    movi d2, #0
    movi d3, #0
    ret
```

### CacheLookup 查找逻辑节选

```asm
/* 伪代码化节选：runtime/Messengers.subproj/objc-msg-arm64.s 的 CacheLookup 宏 */
class_to_search = x16
original_class = class_to_search          // 汇编中用 x15 暂存原始 isa/class

buckets, mask = load_cache(class_to_search)
index = hash(_cmd) & mask                 // 部分配置使用 (_cmd ^ (_cmd >> 7)) & mask
bucket = buckets + index

do {
    imp, sel = *bucket--                  // arm64 bucket_t 是 {IMP, SEL}，一次 ldp 取出
    if (sel == _cmd) {
        x17 = authenticate_if_needed(imp) // arm64e 会认证并重签名 IMP
        tailcall x17                      // NORMAL 模式：直接跳入目标方法
    }
    if (sel == 0) miss                    // 空 bucket 表示当前探测链结束
} while (bucket >= buckets)

wrap_to_end_and_continue_until_first_probe()
miss: jump __objc_msgSend_uncached
```

`objc-cache.mm` 明确说明：`objc_msgSend` 读缓存不加锁。缓存修改方必须用不会让并发 reader 崩溃或得到错误结果的方式更新； 旧 bucket 内存先放入垃圾列表，等待所有线程离开消息发送临界区后再释放。

<a id="slow-path"></a>
## 慢速查找入口：cache miss 到 lookUpImpOrForward

缓存未命中时，汇编入口 `__objc_msgSend_uncached` 不是普通 C 函数。 它保存消息发送 ABI 中需要保护的寄存器，把待查找类从 `x16` 传给 C++ 函数，然后调用 `lookUpImpOrForward(obj, sel, cls, LOOKUP_INITIALIZE | LOOKUP_RESOLVER)`。

### uncached 入口节选

```asm
/* 节选并加注释：runtime/Messengers.subproj/objc-msg-arm64.s */
.macro MethodTableLookup
    SAVE_REGS MSGSEND

    // lookUpImpOrForward(obj, sel, cls, LOOKUP_INITIALIZE | LOOKUP_RESOLVER)
    // x0=self 和 x1=_cmd 已经是 C 调用约定的前两个参数
    mov x2, x16                 // 第三个参数 cls：缓存 miss 时仍保存在 x16
    mov x3, #3                  // LOOKUP_INITIALIZE(1) | LOOKUP_RESOLVER(2)
    bl  _lookUpImpOrForward     // 返回值 x0 是找到的 IMP 或 forwarding IMP

    mov x17, x0                 // 统一放入 x17，后续尾调用
    RESTORE_REGS MSGSEND
.endmacro

STATIC_ENTRY __objc_msgSend_uncached
    MethodTableLookup
    TailCallFunctionPointer x17 // 慢路径找到结果后仍然直接跳入 IMP
END_ENTRY __objc_msgSend_uncached
```

### 准备查找

若类未初始化，先设置 `LOOKUP_NOCACHE` 避免早期消息把缓存永久做成单项缓存。

### 加 runtimeLock

慢路径持有 `runtimeLock`，保证方法查找与缓存填充相对分类添加等修改是原子的。

### 实现/初始化类

调用 `realizeAndInitializeIfNeeded_locked`，必要时 realize 和 `+initialize`。

### 搜索方法

先查当前类方法列表，再沿父类链上行；父类缓存命中也可直接用于当前类缓存。

### lookUpImpOrForward 核心伪代码

```objectivec
/* 伪代码化节选：runtime/objc-runtime-new.mm */
IMP lookUpImpOrForward(id inst, SEL sel, Class cls, int behavior) {
    forward_imp = _objc_msgForward_impcache

    if (!cls->isInitialized())
        behavior |= LOOKUP_NOCACHE       // 初始化前尽量不缓存

    runtimeLock.lock()
    checkIsKnownClass(cls)               // 防止伪造类指针参与 CFI 攻击
    cls = realizeAndInitializeIfNeeded_locked(inst, cls,
            behavior & LOOKUP_INITIALIZE)

    if (!cls || !cls->ISA()) {           // disabled class：按 message to nil 处理
        imp = _objc_returnNil
        goto done
    }

    curClass = cls
    for (;;) {
        meth = getMethodNoSuper_nolock(curClass, sel)
        if (meth) {
            imp = meth->imp(false)       // 当前类方法列表命中
            goto done
        }

        curClass = curClass->getSuperclass()
        if (!curClass) {                 // 到根仍未找到
            imp = forward_imp            // 先准备进入 forwarding
            break
        }

        imp = cache_getImp(curClass, sel)
        if (imp == forward_imp) break     // 父类已有负缓存/转发记录
        if (imp) goto done                // 父类缓存命中，当前类可缓存该结果
    }

    if (behavior & LOOKUP_RESOLVER) {
        behavior ^= LOOKUP_RESOLVER
        return resolveMethod_locked(inst, sel, cls, behavior)
                                           // 调用 +resolveInstanceMethod: 或 +resolveClassMethod:
    }

done:
    if (!(behavior & LOOKUP_NOCACHE))
        log_and_fill_cache(cls, imp, sel, inst, curClass)
                                           // 找到 IMP 或 forward_imp 后写入 cache_t
    runtimeLock.unlock()
    return imp
}
```

### 缓存填充与增长

```objectivec
/* 节选并加注释：runtime/objc-cache.mm */
void cache_t::insert(SEL sel, IMP imp, id receiver) {
    assert(runtimeLock is held)

    if (!cls()->isInitialized())
        return                         // 永不在 +initialize 完成前缓存

    newOccupied = occupied() + 1
    if (cache_is_empty_or_readonly)
        reallocate(oldCapacity, INIT_CACHE_SIZE, false)
    else if (newOccupied <= cache_fill_ratio(capacity))
        use_existing_buckets()         // arm64 LP64 通常允许 7/8 填充率
    else
        reallocate(oldCapacity, grow(capacity), true)

    i = cache_hash(sel, capacity - 1)
    do {
        if (buckets[i].sel() == 0) {
            incrementOccupied()
            buckets[i].set(sel, imp, cls())
            return
        }
        if (buckets[i].sel() == sel)
            return                     // 其他线程已插入同项
    } while ((i = cache_next(i, mask)) != begin)

    bad_cache(receiver, sel)
}
```

<a id="forwarding"></a>
## forwarding：未找到实现之后

慢路径第一次未找到方法时不会立刻进入转发，而是先在 `LOOKUP_RESOLVER` 允许下调用动态方法解析。 如果解析器添加了方法，后续 `lookUpImpOrForwardTryCache` 会重新走查找；如果仍然没有实现， `lookUpImpOrForward` 返回并缓存 `_objc_msgForward_impcache`。

### 动态解析

`resolveMethod_locked` 会触发类的 `+resolveInstanceMethod:` 或 `+resolveClassMethod:`。

### 负缓存

找不到实现时缓存 `_objc_msgForward_impcache`，下次相同消息可直接命中转发入口。

### 外部 API

`message.h` 说明 `class_getMethodImplementation()` 可能返回 `_objc_msgForward`。

### 转发入口节选

```asm
/* 节选并加注释：runtime/Messengers.subproj/objc-msg-arm64.s */
STATIC_ENTRY __objc_msgForward_impcache
    b __objc_msgForward                 // cache 中保存的 IMP，实际跳到外部转发入口
END_ENTRY __objc_msgForward_impcache

ENTRY __objc_msgForward
    adrp x17, __objc_forward_handler@PAGE
    add  x17, x17, __objc_forward_handler@PAGEOFF
    ldr  p16, [x17]                     // 读取当前 forward handler
    TailCallSignedFunctionPointer x16, x17, 0x1c18
                                        // 尾调用 handler；测试中可用 objc_setForwardHandler 替换
END_ENTRY __objc_msgForward
```

forwarding 不是 nil 消息。nil 在 `objc_msgSend` 入口直接返回零值，不会解析方法、不会查父类、不会进入 `_objc_msgForward`。

<a id="tests"></a>
## 测试观察点

`test/msgSend.m` 对消息发送的边界行为做了覆盖，可以作为理解源码时的行为锚点。

- `message to nil` 段验证向 nil 发送返回对象、整数、结构体、浮点、向量等消息时结果为零，且 `state` 不变。
- DWARF/unwind 相关测试构造普通对象、tagged pointer、extended tagged pointer、super 发送和 cache miss，确保汇编入口的不可达指令和 unwind 信息符合预期。
- 测试中调用 `objc_setForwardHandler((void*)test_dw_forward, ...)`，说明 forwarding handler 可被替换，用来观察未识别消息路径。

## 源码依据

- `runtime/Messengers.subproj/objc-msg-arm64.s`：`_objc_msgSend`、`CacheLookup`、`__objc_msgSend_uncached`、`__objc_msgForward`。
- `runtime/objc-runtime-new.mm`：`log_and_fill_cache`、`lookUpImpOrForwardTryCache`、`lookUpImpOrForward`。
- `runtime/objc-cache.mm`：缓存无锁读取设计、填充率、`cache_t::insert` 和缓存垃圾回收说明。
- `runtime/objc-runtime-new.h`：`bucket_t`、`cache_t`、`cache_getImp` 结构和接口。
- `runtime/message.h`：`_objc_msgForward` 和 `_objc_msgForward_stret` 的公开声明与使用说明。
- `test/msgSend.m`：nil 消息、tagged pointer、super 发送和 forwarding handler 相关测试。

本页为源码阅读讲解文档，代码片段为节选或伪代码化表达；具体实现以仓库源码为准。
