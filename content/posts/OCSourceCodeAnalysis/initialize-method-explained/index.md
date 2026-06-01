+++
title = "+initialize 懒初始化与并发状态机"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 6
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime 懒初始化 并发等待 fork safety

# +initialize 懒初始化与并发状态机

`+initialize` 是 Objective-C 运行时在类第一次被真正使用时触发的类级初始化钩子。 objc4 的实现重点不是“调用一个方法”，而是用每个类的递归初始化锁、元类上的状态位、线程本地的初始化列表和 fork 子进程保护规则，保证父类优先、单线程执行、并发可等待、重入不死锁。

## 目录

1.  [作用](#purpose)
2.  [实现原理](#principle)
3.  [核心状态字段](#state)
4.  [入口与触发](#entry)
5.  [并发状态机](#machine)
6.  [关键流程](#flows)
7.  [测试依据](#tests)

<a id="purpose"></a>
## 作用

`+initialize` 的语义是：在某个类或其子类第一次收到会触发初始化的消息前，运行时先给该类发送一次 `+initialize`。 这让类可以延迟建立全局状态、注册方法、准备缓存或执行只依赖本类的初始化逻辑。

**懒触发**

`objc_getClass()` 只查找类，不触发初始化；普通消息发送、部分运行时查询、autorelease 返回值路径和弱引用相关路径可能需要先完成初始化。

**父类优先**

子类开始初始化前，运行时递归确保父类已经初始化，避免类层次中间被并发线程插入造成死锁。

**一次完成**

同一类只有一个线程真正发送 `+initialize`；其他线程要么等待，要么在同一初始化线程重入时直接放行。

<a id="principle"></a>
## 实现原理

objc4 把 `+initialize` 做成一个按需进入的并发状态机：消息查找路径发现目标类未初始化时，先把类 realize，再释放 `runtimeLock`，进入 `initializeNonMetaClass()`。 后者用父类递归、每类递归锁、元类状态位和线程本地初始化列表协调所有线程。真正执行用户代码的线程设置 `INITIALIZING`，发送 `+initialize`，最后在 `@finally` 中切换到 `INITIALIZED`；其他线程通过同一把类锁等待状态稳定。

这个设计的核心约束是单调性：类状态只从“未初始化”前进到“初始化中”，再前进到“已初始化”。即使 `+initialize` 抛异常，状态机也会完成收尾；即使发生重入，只有当前初始化线程能绕过等待；即使 fork 发生在多线程初始化期间，子进程也只允许 trivial 初始化继续，其他自定义初始化会主动终止。

<a id="state"></a>
## 核心类/结构状态字段

初始化状态存在类对象的元类标志位里。源码注释明确约束：初始时 `RW_INITIALIZING` 和 `RW_INITIALIZED` 都未设置；初始化中只设置前者；完成后清除前者并设置后者；两者永不同时为真，且 `RW_INITIALIZED` 一旦设置就不会清除。

**未初始化** `INITIALIZING=0`\
`INITIALIZED=0`

**初始化中** `INITIALIZING=1`\
`INITIALIZED=0`

**已初始化** `INITIALIZING=0`\
`INITIALIZED=1`

**非法组合** `INITIALIZING=1`\
`INITIALIZED=1` 不允许

| 元素 | 位置 | 作用 |
|----|----|----|
| `RW_INITIALIZING` | `runtime/objc-runtime-new.h` | 表示类的 `+initialize` 正在执行。实际设置在非元类接口 `setInitializing()` 中，但写入目标是 `ISA()`，也就是元类。 |
| `RW_INITIALIZED` | `runtime/objc-runtime-new.h` | 表示类初始化彻底完成。`objc_class::setInitialized()` 最后调用 `metacls->changeInfo(RW_INITIALIZED, RW_INITIALIZING)` 完成状态切换。 |
| `_objc_initializing_classes` | `runtime/objc-initialize.mm` | 线程本地数组，保存当前线程正在初始化的元类。它用于判断重入：初始化线程自己给同一个类发消息可以继续，其他线程必须等。 |
| `classInitLock` | `runtime/objc-initialize.mm` | 保护 `RW_INITIALIZING` 状态变化与 `willInitializeFuncs` 回调列表，避免注册回调和类初始化并发时漏通知或重复通知。 |
| `pendingInitializeMap` | `runtime/objc-initialize.mm` | 当子类自己的 `+initialize` 已返回但父类尚未完全初始化时，先把子类挂到父类名下，等父类完成后再递归标记子类完成。 |

```javascript
// runtime/objc-runtime-new.h：状态位只属于运行时，不由编译器写入。
#define RW_INITIALIZED   (1<<29)  // 类已经完成 +initialize
#define RW_INITIALIZING  (1<<28)  // 类正在执行 +initialize

bool isInitializing() const {
    return getMetaFlags() & RW_INITIALIZING;  // 从元类读取状态
}

void setInitializing() {
    ASSERT(!isMetaClass());      // 调用者传入非元类
    ISA()->setInfo(RW_INITIALIZING); // 但状态写到元类上
}

bool isInitialized() const {
    return getMetaFlags() & RW_INITIALIZED;   // 同样从元类读取
}
```

<a id="entry"></a>
## 入口与触发

消息查找路径发现类未初始化时，会进入 `class_initialize()`。它先持有 `runtimeLock`，实现类的 realize，然后释放运行时大锁去执行 `+initialize`。释放大锁是关键：用户代码可能任意发消息、加载类、抛异常，不能在运行时全局锁下执行。

```objectivec
// runtime/objc-runtime-new.mm：压缩后的入口逻辑。
static Class initializeAndMaybeRelock(Class cls, id inst,
                                      mutex_t& lock, bool leaveLocked)
{
    lockdebug::assert_locked(&lock);

    cls->realizeIfNeeded_nolock();   // 初始化前先确保类已 realize

    if (cls->isInitialized()) {      // 快速路径：别人已经完成
        if (!leaveLocked) lock.unlock();
        return cls;
    }

    Class nonmeta = getMaybeUnrealizedNonMetaClass(cls, inst);
    // +initialize 总是发送给非元类对象，即使触发点来自元类。

    if (nonmeta->isRealized()) {
        lock.unlock();               // 用户 +initialize 不能在 runtimeLock 下执行
    } else {
        nonmeta = realizeClassMaybeSwiftAndUnlock(nonmeta, lock);
    }

    initializeNonMetaClass(nonmeta); // 真正的并发状态机

    if (leaveLocked) runtimeLock.lock();
    return cls;
}
```

**触发边界：** `test/initialize.m` 验证 `objc_getClass("Super0")` 不触发 `+initialize`； 但向 `Sub` 发类方法、调用 `class_getMethodImplementation`、以及 `objc_autoreleaseReturnValue` 路径会按需触发初始化。

<a id="machine"></a>
## 并发状态机

`initializeNonMetaClass()` 是核心。每个类使用以元类为 key 的递归同步锁，等待线程会卡在 `lockClass(cls)` 上；初始化线程因为锁可递归，重入同一个类时不会死锁。

1**父类优先**

若父类未完成，先递归初始化父类。

2**加类锁**

用元类作为同步对象，串行化同一类初始化。

3**判断状态**

已完成则返回；初始化中则判断是否本线程重入。

4**赢得竞态**

设置 `INITIALIZING`，登记线程本地状态。

5**调用并收尾**

发送 `+initialize`，最后切换为 `INITIALIZED`。

```objectivec
// runtime/objc-initialize.mm：保留核心分支的伪源码。
void initializeNonMetaClass(Class cls)
{
    ASSERT(!cls->isMetaClass());

    Class supercls = cls->getSuperclass();
    if (supercls && !supercls->isInitialized()) {
        initializeNonMetaClass(supercls);
        // 父类必须在子类开始前完成，避免两个线程从继承链中间互等。
    }

    lockClass(cls);                  // 每类递归锁；其他线程会在这里等待

    if (cls->isInitialized()) {      // 等锁期间已由别的线程完成
        unlockClass(cls);
        return;
    }

    if (cls->isInitializing()) {     // 已经处于初始化中
        if (!MultithreadedForkChild || _thisThreadIsInitializingClass(cls)) {
            unlockClass(cls);        // 本线程重入：允许继续发消息
            return;
        } else {
            lockClass(cls);          // fork 子进程特殊恢复，见下文
            _setThisThreadIsInitializingClass(cls);
            performForkChildInitialize(cls, supercls);
        }
    }

    {
        mutex_locker_t lock(classInitLock);
        cls->setInitializing();      // INITIALIZING=1，INITIALIZED=0
        localWillInitializeFuncs.initFrom(willInitializeFuncs);
    }

    _setThisThreadIsInitializingClass(cls);
    // 从这里开始，本线程可以向该类发消息而不等待自己。

    @try {
        callInitialize(cls);         // objc_msgSend(cls, @selector(initialize))
    } @catch (...) {
        @throw;                      // 异常继续向外抛
    } @finally {
        lockAndFinishInitializing(cls, supercls);
        // 无论正常返回还是抛异常，都认为本次初始化流程已完成。
    }
}
```

<a id="flows"></a>
## 关键流程

### 父类优先

运行时先递归初始化父类，再给当前类设置 `INITIALIZING`。源码注释用 OmniWeb 类层次说明了历史死锁：如果线程 A 在父类初始化中触发另一个子类，线程 B 又从另一个子类等待同一个父类，就可能形成环。父类先完全初始化能让“正在初始化/已初始化”的继承链始终从根类连续向下扩展。

### INITIALIZING / INITIALIZED

`setInitializing()` 设置元类上的 `RW_INITIALIZING`。 完成时 `setInitialized()` 在 `runtimeLock` 下扫描类、可能转换预优化缓存，最后执行 `changeInfo(RW_INITIALIZED, RW_INITIALIZING)`，一次性清除初始化中并置为已初始化。

```cpp
// runtime/objc-runtime-new.mm：完成态切换。
void objc_class::setInitialized()
{
    ASSERT(!isMetaClass());

    Class cls = (Class)this;
    Class metacls = cls->ISA();

    mutex_locker_t lock(runtimeLock);

    objc::Scanner::scanInitializedClass(cls, metacls);
    // 初始化完成后，运行时可以扫描 RR/AWZ/Core 等方法特征。

    metacls->changeInfo(RW_INITIALIZED, RW_INITIALIZING);
    // 关键状态转移：INITIALIZED=1，同时清掉 INITIALIZING。
}
```

### 并发等待

只有第一个成功进入类锁并看到“未初始化、未初始化中”的线程会发送 `+initialize`。 其他线程在同一个类锁上阻塞；等初始化线程调用 `unlockClass(cls)` 后，等待线程获得锁，看到 `isInitialized()` 为真，立即返回。

### 优先级捐赠

`test/initializePriorityDonation.m` 让后台队列线程先进入 `+initialize`，主线程随后等待同一类。测试要求初始化线程的优先级提升到主线程优先级，说明等待使用的同步原语支持优先级捐赠，避免高优先级线程被低优先级初始化线程长期拖住。

### 异常与重入

`+initialize` 可以重入：初始化线程发送消息给正在初始化的类时，`_thisThreadIsInitializingClass(cls)` 返回真，运行时直接解锁返回，允许这次消息继续分派。测试里的 `Super6/Sub6`、`Super7/Sub7` 覆盖了父子类互相触发和显式 `[super initialize]` 的循环场景。

异常策略也很明确：`@finally` 总会执行 `lockAndFinishInitializing()`。因此一次抛异常的 `+initialize` 仍被视为“完成并成功初始化”，后续不会再次调用该类的 `+initialize`。`test/initialize.m` 中 `SuperThrower` 抛出对象后，主线程再次访问不应再次触发它。

**为什么异常也完成？** 这是运行时的并发安全取舍。若异常后回到未初始化态，等待线程和重入路径可能再次进入用户初始化代码，造成重复副作用或更复杂的锁状态。objc4 选择让状态机单调前进。

### 父类未完成时的 pending 子类

有一种交错：子类的 `+initialize` 已经返回，但它是在父类 `+initialize` 内部被触发的，此时父类还没标记 `INITIALIZED`。 objc4 不会立刻把子类标为完成，而是挂到 `pendingInitializeMap[supercls]`，继续持有子类类锁；等父类完成后，`_finishInitializing()` 递归释放这些子类。

```cpp
// runtime/objc-initialize.mm：完成或挂起子类完成态。
static void lockAndFinishInitializing(Class cls, Class supercls)
{
    mutex_locker_t lock(pendingInitializeMapLock);

    if (!supercls || supercls->isInitialized()) {
        _finishInitializing(cls, supercls);
        // 父类已完成：设置 INITIALIZED，解开类锁，唤醒等待者。
    } else {
        _finishInitializingAfter(cls, supercls);
        // 父类仍在初始化：子类先进入 pending 表，等父类完成后再释放。
    }
}

static void _finishInitializing(Class cls, Class supercls)
{
    cls->setInitialized();           // INITIALIZING -> INITIALIZED
    unlockClass(cls);                // 等待该类初始化的线程可以继续
    _setThisThreadIsNotInitializingClass(cls);

    // 若有子类等本类完成，则递归标记那些子类完成。
    for (PendingInitialize *p = pendingInitializeMap[cls]; p; p = p->next) {
        _finishInitializing(p->subclass, cls);
    }
}
```

### fork 处理

多线程进程在某个线程执行 `+initialize` 时 fork 很危险：子进程只剩调用 `fork()` 的线程，其他线程中断在何处不可知。objc4 的策略不是强行加全局锁，而是在子进程中保守处理。

- fork 发生在当前线程自己的 `+initialize` 内：该线程的初始化列表仍存在，子进程通过 `classInitializeAtforkChild()` 重新获取这些类锁，允许继续。
- 类在父进程其他线程中初始化：子进程若尝试使用该类，不能安全继续，也不能假装完成；若该类有自定义 `+initialize`，运行时主动崩溃并提示在 `objc_initializeAfterForkError` 下断点。
- 若类的 `+initialize` 被判断为 trivial，例如没有自己的实现、使用 root 空实现或 no-op，则子进程可跳过调用并标记完成。
- 单线程 fork 例外：调用 fork 时进程没有其他线程，子进程不需要启用多线程 fork 限制。
```cpp
// runtime/objc-initialize.mm：fork 子进程中的保守规则。
void performForkChildInitialize(Class cls, Class supercls)
{
    if (classHasTrivialInitialize(cls)) {
        lockAndFinishInitializing(cls, supercls);
        // 没有真实用户 +initialize：可当作完成，避免无意义等待。
    } else {
        objc_initializeAfterForkError(cls);
        _objc_fatal("+[%s initialize] may have been in progress ...",
                    cls->nameForLogging());
        // 自定义 +initialize 可能在父进程其他线程执行到一半：崩溃比死锁或破坏状态更可控。
    }
}

void classInitializeAtforkChild() {
    foreachInitializingClass([](Class cls){
        lockClass(cls);
        // 子进程里的 objc_sync 锁已重建；当前线程正在初始化的类需要重新加锁。
    });
}
```

<a id="tests"></a>
## 测试依据

| 测试文件 | 覆盖行为 |
|----|----|
| `test/initialize.m` | 基础触发、父类先于子类、继承父类 `+initialize`、初始化期间发消息、运行时查询触发、`objc_getClass` 不触发、重入循环、异常后不重试、autorelease 返回路径触发。 |
| `test/initialize-autorelease.m` | 在 `+initialize` 内 autorelease 对象不会泄漏；`objc_retainAutoreleaseReturnValue` 可触发类初始化。 |
| `test/initializeVersusWeak.m` | 弱引用 store/load 与 `+initialize` 的锁顺序问题。运行时需要在弱表锁外先初始化，避免递归弱锁或弱锁和初始化锁倒置。 |
| `test/initializePriorityDonation.m` | 高优先级线程等待后台线程执行 `+initialize` 时，初始化线程应获得优先级捐赠。 |
| `test/forkInitialize.m` | 多线程 fork 后，自定义 `+initialize` 若可能在父进程其他线程中执行，子进程访问会崩溃；trivial 场景可继续。 |
| `test/forkInitializeSingleThreaded.m` | 单线程 fork 下不启用多线程 fork 安全限制，复用 `forkInitialize.m` 期望正常通过。 |
| `test/forkInitializeDisabled.m` | 带 `__DATA,__objc_fork_ok` section 的程序会禁用 `+initialize` fork 安全 enforcement，并打印对应诊断。 |

## 源码阅读索引

- `runtime/objc-initialize.mm`：线程本地初始化列表、每类锁、状态机、pending 子类、fork 子进程策略、will-initialize 回调。
- `runtime/objc-initialize.h`：对外声明 `initializeNonMetaClass()`、线程判断、atfork 钩子。
- `runtime/objc-runtime-new.mm`：`class_initialize()` 入口、realize 与解锁调度、`objc_class::setInitialized()` 状态切换。
- `runtime/objc-runtime-new.h`：`RW_INITIALIZING`、`RW_INITIALIZED` 和 `isInitializing()/isInitialized()/setInitializing()`。

文档为单页自包含 HTML，面向 objc4 当前源码结构编写。
