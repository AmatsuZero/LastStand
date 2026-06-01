+++
title = "objc4 Autorelease 一页讲透"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 12
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime guide

# Autorelease 的作用和实现原理

一句话：autorelease 是“延迟一次 release”的机制。对象先被登记到当前线程的自动释放池中， 等池子 pop 时再统一发送 release，从而让返回值和临时对象可以跨过当前语句或当前函数继续存活一小段时间。

核心文件：runtime/NSObject.mm 数据结构：AutoreleasePoolPage 线程隔离：TLS hot page 边界标记：POOL_BOUNDARY

## 先建立正确心智模型

**autorelease pool 不是一堆对象的容器类。** 在 objc4 里，它更像每个线程私有的一条栈。栈里放两类指针： 普通对象指针，以及表示池边界的 `POOL_BOUNDARY`。每次 push 池，就压入一个边界并返回这个边界地址作为 token。 每次 autorelease 对象，就把对象指针压到 hot page 的 `next` 位置。pop 时拿 token 找到边界， 把边界之上的对象按后进先出的顺序逐个 `objc_release`。

## 它解决什么问题

- **返回 +0 对象：**被调用方可以返回一个“当前调用者可用，但不归调用者拥有”的对象。
- **批量释放临时对象：**循环、事件回调、线程入口可以用池边界控制临时对象峰值。
- **兼容手动引用计数：**`retain` 表示拿所有权，`release` 表示交回所有权，`autorelease` 表示稍后自动交回。
- **配合 ARC 优化：**运行时和编译器会尝试消除返回值中的多余 retain/autorelease。

## 一张图看懂栈变化

假设外层池中 autorelease 了 A，又进入内层池 autorelease 了 B、C。内层 pop 只释放 B、C，不影响外层 A。

push 外层

POOL \#1

A autorelease

POOL \#1 A

push 内层

POOL \#1 A POOL \#2

B/C autorelease

POOL \#1 A POOL \#2 B C

pop 内层

POOL \#1 A POOL \#2 B C

## 核心类及关键字段方法

|  |  |
|----|----|
| `AutoreleasePoolPage` | 真正的池页。每页固定大小，页头是元数据，页尾到页末是一段连续指针槽位。 多页通过 `parent` 和 `child` 串成双向链表。 |
| `AutoreleasePoolPageData::next` | 下一个可写槽位。`add()` 把对象写到 `*next` 后递增。 `releaseUntil()` 先递减 `next`，再释放取出的对象。 |
| `thread` | 创建该页的线程。`check()` 会确认当前线程一致，所以 autorelease pool 是线程私有的。 |
| `parent / child` | 池栈可能跨多个页。当前页满了就找 child 或创建 child，pop 后会按策略回收空 child。 |
| `hotPage_` | TLS 中的当前热页。新 autorelease 的对象总是优先写入 hot page。 |
| `POOL_BOUNDARY` | 池边界，源码中定义为 `nil`。push 时压入，pop 时释放它上面的对象。 |
| `push()` | 把 `POOL_BOUNDARY` 压栈并返回边界地址。这个地址就是之后 pop 要传回来的 token。 |
| `autoreleaseFast()` | autorelease 的主入口：有 hot page 且未满就直接 `add(obj)`，满页就扩容，没有页就创建页或 placeholder。 |
| `pop()` | 校验 token，定位 token 所在 page，调用 `releaseUntil(stop)` 从栈顶释放到边界为止。 |
| `ReturnAutoreleaseInfo` | 返回值优化用的 TLS 记录。callee 和 caller 配合时，可以让对象不进入真实 autorelease pool，减少 retain/release。 |

## 关键操作流程

**1. 进入作用域**

`@autoreleasepool` 或 Swift `autoreleasepool` 调用 push，运行时压入一个边界并返回 token。

**2. 对象 autorelease**

`objc_autorelease(obj)` 先跳过 nil/tagged pointer，再进入对象的 `autorelease()`。

**3. 写入 hot page**

默认 RR 实现走 `rootAutorelease2()`，最终把对象指针追加到当前线程 hot page。

**4. 离开作用域**

pop 根据 token 找到边界，从当前栈顶释放到该边界，内层池不会释放外层池里的对象。

**5. 异常与线程结束**

Swift 用 `defer` 保证 pop。线程销毁时 TLS 析构会清理剩余 pool page。

### Objective-C / Swift 入口

语言层的池语法最终都落到运行时的 push/pop。Swift overlay 展示了这个关系。

``` swift
// ObjectiveC/ObjectiveC.swift
public func autoreleasepool<E, Result: ~Copyable>(
    invoking body: () throws(E) -> Result
) throws(E) -> Result {
    // 1. 进入作用域：向 objc runtime 要一个池 token。
    //    token 不是池对象，而是当前栈中 POOL_BOUNDARY 的地址。
    let pool = _autoreleasePoolPush()

    // 2. 无论 body 正常返回还是抛错，都必须 pop。
    //    这就是 @autoreleasepool 的作用域语义。
    defer {
        _autoreleasePoolPop(pool)
    }

    // 3. body 期间产生的 autorelease 对象会登记到当前线程的池栈。
    return try body()
}
```text

来源：`ObjectiveC/ObjectiveC.swift:185`

### 运行时 API 入口

C API 很薄，只是把工作转交给 `AutoreleasePoolPage`。

``` cpp
// runtime/NSObject.mm
void *objc_autoreleasePoolPush(void)
{
    // push() 会压入 POOL_BOUNDARY，并返回边界槽位地址。
    // 调用者必须保存这个地址，后续 pop 依赖它确定释放范围。
    return AutoreleasePoolPage::push();
}

void objc_autoreleasePoolPop(void *ctxt)
{
    // ctxt 就是 push 返回的 token。
    // pop() 会校验 token，然后释放 token 之上的对象。
    AutoreleasePoolPage::pop(ctxt);
}

id objc_autorelease(id obj)
{
    // nil 和 tagged pointer 不需要引用计数管理。
    if (_objc_isTaggedPointerOrNil(obj)) return obj;

    // 进入 objc_object::autorelease()，可能走默认实现，
    // 也可能通过 objc_msgSend 调用类自定义的 -autorelease。
    return obj->autorelease();
}
```text

来源：`runtime/NSObject.mm:2013`、`runtime/NSObject.mm:2256`

### 数据结构：一页就是一段指针栈

``` cpp
// runtime/NSObject-internal.h
struct AutoreleasePoolPageData
{
    magic_t const magic;            // 页完整性检查，调试坏 token 或越界写。
    __unsafe_unretained id *next;   // 下一个可写槽位，也就是栈顶后一格。
    objc_thread_t const thread;     // 该页归属线程，防止跨线程误用。
    AutoreleasePoolPage * const parent;
    AutoreleasePoolPage *child;     // 多页串成链表，parent 更冷，child 更热。
    uint32_t const depth;           // 页深度，用于统计和高水位日志。
    uint32_t hiwat;                 // high-water mark，用于诊断池过大。
};
```text

来源：`runtime/NSObject-internal.h:133`

页头之后的内存就是对象槽位。`begin()` 指向第一个槽位， `end()` 指向页尾，`next == begin()` 表示空页。

### push：压入边界，返回 token

``` cpp
// runtime/NSObject.mm
static inline void *push()
{
    // 返回值优化可能把对象临时放在 TLS 中。
    // push 新池前先把它转移到真实池里，避免遗留对象漏掉。
    ReturnAutoreleaseInfo info = getReturnAutoreleaseInfo();
    moveTLSAutoreleaseToPool(info);

    id *dest;
    if (slowpath(DebugPoolAllocation)) {
        // 调试模式：每个 pool 单独开新页，方便定位问题。
        dest = autoreleaseNewPage(POOL_BOUNDARY);
    } else {
        // 正常模式：像普通对象一样把边界压到 hot page。
        dest = autoreleaseFast(POOL_BOUNDARY);
    }

    // dest 是 POOL_BOUNDARY 的槽位地址。
    // 这个地址就是 pop() 需要的 token。
    return dest;
}
```text

来源：`runtime/NSObject.mm:1246`

### autorelease：快路径追加对象

``` cpp
// runtime/NSObject.mm
static inline id *autoreleaseFast(id obj)
{
    AutoreleasePoolPage *page = hotPage();

    if (page && !page->full()) {
        // 最常见路径：当前线程已经有 hot page，且页未满。
        // 直接把 obj 写入 *next，然后 next++。
        return page->add(obj);
    } else if (page) {
        // 有 hot page，但满了：沿 child 找可用页，没有就创建新页。
        return autoreleaseFullPage(obj, page);
    } else {
        // 没有任何 page：可能是首次 push，也可能缺少 pool。
        return autoreleaseNoPage(obj);
    }
}

id *add(id obj)
{
    id *ret = next;     // 记录本次写入槽位，push 会把它作为 token。
    *next++ = obj;      // 栈追加。obj 可以是真对象，也可以是 POOL_BOUNDARY。
    return ret;
}
```cpp

来源：`runtime/NSObject.mm:907`、`runtime/NSObject.mm:1113`

### objc_object::autorelease：是否允许自定义

``` cpp
// runtime/objc-object.h
inline id objc_object::autorelease()
{
    if (isTaggedPointer()) return (id)this;

    if (fastpath(!ISA()->hasCustomRR())) {
        // 类没有自定义 retain/release/autorelease。
        // 直接走 runtime 默认实现，避免一次 objc_msgSend。
        return rootAutorelease();
    }

    // 类自定义了 RR 行为时，必须尊重它的 -autorelease。
    return ((id(*)(objc_object *, SEL))objc_msgSend)
        (this, @selector(autorelease));
}

ALWAYS_INLINE id objc_object::rootAutorelease()
{
    // 默认实现还会尝试“返回值 autorelease 优化”。
    if (prepareOptimizedReturn((id)this, true, ReturnAtPlus1))
        return (id)this;

    // 优化失败才真正进入 AutoreleasePoolPage。
    return rootAutorelease2();
}
```text

来源：`runtime/objc-object.h:1258`

### pop：定位边界并释放到边界

``` cpp
// runtime/NSObject.mm
static inline void pop(void *token)
{
    // 先处理返回值优化 TLS 中尚未落入真实池的对象。
    while (releaseReturnAutoreleaseTLS())
        ;

    AutoreleasePoolPage *page;
    if (token == (void*)EMPTY_POOL_PLACEHOLDER) {
        // 顶层空池优化：池从未放入对象时甚至不分配真实 page。
        page = hotPage();
        if (!page) return setHotPage(nil);
        page = coldPage();
        token = page->begin();
    } else {
        // token 是 POOL_BOUNDARY 槽位地址。
        // 通过地址按页大小对齐，反推出它所在的 AutoreleasePoolPage。
        page = pageForPointer(token);
    }

    id *stop = (id *)token;
    if (*stop != POOL_BOUNDARY) {
        // token 无效或池被提前释放，运行时会报错或 fatal。
        return badPop(token);
    }

    // 释放 stop 之上的所有对象，stop 自身是边界，不释放。
    return popPage<false>(token, page, stop);
}
```text

来源：`runtime/NSObject.mm:1326`

### releaseUntil：后进先出释放

``` cpp
// runtime/NSObject.mm
void releaseUntil(id *stop)
{
    do {
        while (this->next != stop) {
            // 每轮都重新读取 hotPage。
            // 原因：objc_release(obj) 可能触发 dealloc，
            // dealloc 里又可能 autorelease 新对象或 push 新池。
            AutoreleasePoolPage *page = hotPage();

            while (page->empty()) {
                page = page->parent;
                setHotPage(page);
            }

            // 从栈顶取出一个槽位：先 --next，再读对象。
            id obj = *--page->next;
            memset((void*)page->next, SCRIBBLE, sizeof(*page->next));

            // 边界只用于分隔，不是对象。
            if (obj != POOL_BOUNDARY) {
                objc_release(obj);
            }
        }

        // TLS 中概念上也可能有一个“待 autorelease”对象。
        // 释放它后可能产生更多 autorelease，所以用 do-while。
    } while (releaseReturnAutoreleaseTLS());

    setHotPage(this);
}
```text

来源：`runtime/NSObject.mm:976`

## 返回值 autorelease 优化

Cocoa 有大量“返回 +0 autoreleased 对象”的调用。如果每次都先 autorelease 到池里，调用者再 retain， 就会产生一对多余操作。objc4 用 `ReturnAutoreleaseInfo` TLS 做 callee/caller 交接： callee 发现 caller 会立刻 claim 这个返回值时，把对象和当前引用计数状态放进 TLS，不进池； caller 读取 TLS 后按自己需要接收 +0 或 +1。交接失败时，再把对象转回真实 autorelease pool。

``` cpp
// runtime/NSObject.mm
id objc_autoreleaseReturnValue(id obj)
{
    // callee 端：对象当前是 +1，但函数签名要按 +0 autoreleasing 返回。
    // 如果 caller 是可优化形态，就把 obj 记录到 ReturnAutoreleaseInfo TLS，
    // 不把它放进 AutoreleasePoolPage。
    if (prepareOptimizedReturn(obj, false, ReturnAtPlus1)) return obj;

    // caller 不配合时，走普通路径：登记到 autorelease pool。
    return objc_autorelease(obj);
}

id objc_retainAutoreleasedReturnValue(id obj)
{
    // caller 端：希望把 +0 返回值变成 +1。
    // 如果 TLS 证明 callee 已经把 +1 对象交给我们，就不需要 retain。
    if (acceptOptimizedReturn(true) == ReturnAtPlus1) return obj;

    // 未优化路径中，返回值按 +0 处理，需要 retain 才能拥有。
    return objc_retain(obj);
}
```cpp

来源：`runtime/NSObject.mm:2310`、`runtime/NSObject.mm:2337`

这类优化不改变语义。你仍然可以按“autorelease 会在池 pop 时 release”理解程序行为，只是运行时在安全时把部分登记和释放省掉了。

### 常见误区

- `autorelease` 不会立刻释放对象，它只是安排未来 release。
- `@autoreleasepool` 不是 Objective-C 对象容器，运行时 token 只是边界地址。
- 对象在池中不被 retain。autorelease 的前提通常是对象当前已有 +1 所有权，稍后由池帮你 release。
- 池是线程私有的，一个线程 autorelease 的对象不会被另一个线程的 pool 接管。
- 缺少 pool 时，调试开关可以报警；正常程序应在线程入口或密集循环中主动设置 pool。

### 读源码时抓这条主线

1.  `objc_autorelease(obj)` 进入 `objc_object::autorelease()`。
2.  默认 RR 类走 `rootAutorelease()`，先尝试返回值优化。
3.  优化失败进入 `rootAutorelease2()`，调用 `AutoreleasePoolPage::autorelease()`。
4.  `autoreleaseFast()` 把对象写入 TLS hot page。
5.  `objc_autoreleasePoolPop(token)` 调用 `releaseUntil(token)`，逐个 `objc_release`。

## 一个最小例子

``` objc
@autoreleasepool {
    id obj = [[[MyObject alloc] init] autorelease];
    // alloc/init 产生 +1 所有权。
    // autorelease 不改变 obj 现在可用这个事实，只是把一次 release 推迟到 pool pop。

    use(obj);
    // 这里 obj 仍然有效，因为 pool 还没有 pop。
}
// 离开作用域时编译器生成 objc_autoreleasePoolPop(token)。
// runtime 从栈顶释放到该 token，obj 收到 release。
// 如果这是最后一个引用，obj 在这里 dealloc。
```

在循环里创建大量 autoreleased 临时对象时，外层事件循环的 pool 可能太晚才 pop。 给循环内部加一个更小的 `@autoreleasepool` 可以显著降低内存峰值。
