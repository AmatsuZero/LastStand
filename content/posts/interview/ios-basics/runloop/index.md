+++
title = "RunLoop"
date = '2026-05-27T22:24:03+08:00'
draft = false
weight = 22
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
RunLoop 是 iOS/macOS 中用于管理线程的事件循环机制。它的核心作用是让线程在有任务时处理任务，没有任务时进入休眠状态，从而避免线程退出并节省 CPU 资源。

简单来说，RunLoop 就是一个 do-while 循环：

```c
// 伪代码
void CFRunLoopRun() {
    do {
        // 处理各种事件源
        // 如果没有事件，线程休眠
        // 有事件时被唤醒处理
    } while (running);
}
```

## RunLoop 与线程的关系

- 每个线程都有唯一对应的 RunLoop 对象
- 主线程和子线程的 RunLoop 都采用懒加载机制，在第一次获取时才创建
- 主线程的 RunLoop 由 `UIApplicationMain` 内部首次获取并启动（调用链：`UIApplicationMain` → `GSEventRunModal` → `CFRunLoopRunSpecific`）
- RunLoop 与线程是一一对应的，存储在一个全局字典（`__CFRunLoops`）中

```objc
// 获取当前线程的 RunLoop
CFRunLoopRef runLoop = CFRunLoopGetCurrent();
NSRunLoop *runLoop = [NSRunLoop currentRunLoop];

// 获取主线程的 RunLoop
CFRunLoopRef mainRunLoop = CFRunLoopGetMain();
NSRunLoop *mainRunLoop = [NSRunLoop mainRunLoop];
```

## RunLoop 的核心组成

RunLoop 包含以下几个核心概念：

### 1. RunLoop 对象（CFRunLoopRef）

RunLoop 对象本身，管理整个事件循环。在代码层面对应 `CFRunLoopRef` 类型。

### 2. 运行模式（CFRunLoopModeRef）

RunLoop 的运行模式，决定了哪些事件源会被处理。一个 RunLoop 可以包含多个 Mode，但同一时刻只能运行在一个 Mode 下。切换 Mode 需要退出当前循环，重新进入新的 Mode。

常见的 Mode 有：

| Mode | 说明 |
|------|------|
| kCFRunLoopDefaultMode | 默认模式，App 通常运行在此模式 |
| UITrackingRunLoopMode | 界面追踪模式，用于 ScrollView 滑动时 |
| kCFRunLoopCommonModes | 占位模式，包含 Default 和 Tracking |
| UIInitializationRunLoopMode | 启动时的模式，启动完成后不再使用 |
| GSEventReceiveRunLoopMode | 接收系统事件的内部模式（未公开模式，可能随系统版本变化） |

#### 为什么要设计 Mode 体系？

Mode 体系的核心目的是**实现事件源的隔离与优先级管理**。如果没有 Mode 体系，所有事件源混在一起，低优先级事件（如 Timer、网络回调）可能抢占高优先级事件（如 UI 追踪）的处理时间，导致界面卡顿。

Mode 体系让不同场景各自独立：
- 启动阶段有特定的初始化任务（UIInitializationRunLoopMode）
- 滑动时需要高频响应触摸事件（UITrackingRunLoopMode）
- 正常运行时处理各种业务逻辑（kCFRunLoopDefaultMode）

开发者只需将事件源添加到正确的 Mode，不需要在每个回调中手动判断当前场景是否适合执行，RunLoop 会自动完成这个隔离。

#### 滑动时的 Mode 切换

Mode 切换最典型的场景就是 ScrollView 滑动。当用户开始滑动时，RunLoop 会自动从 `kCFRunLoopDefaultMode` 切换到 `UITrackingRunLoopMode`：

```
正常状态                    开始滑动                    停止滑动
  |                          |                          |
  v                          v                          v
DefaultMode ──触摸事件──> TrackingMode ──滑动结束──> DefaultMode
(处理Timer/网络等)        (只处理UI追踪)           (恢复处理Timer/网络等)
```

切换过程中，RunLoop 先退出当前 Mode，再进入新 Mode。虽然有一定开销，但切换频率很低（只在用户开始/停止滑动时发生），远小于同时处理所有事件导致的卡顿代价。

这种切换机制会导致一个经典问题：**滑动时 Timer 停止触发**。因为 `scheduledTimerWithTimeInterval:` 默认将 Timer 添加到 DefaultMode，当 RunLoop 切换到 TrackingMode 后，DefaultMode 中的 Timer 自然不会被处理。

#### CommonModes 机制

`kCFRunLoopCommonModes` 并不是一个真正的 Mode，而是一个**标记集合**。它默认包含 `kCFRunLoopDefaultMode` 和 `UITrackingRunLoopMode`。当事件源添加到 CommonModes 时，实际上是将该事件源同时注册到所有被标记为 Common 的 Mode 中：

```objc
// 添加到 CommonModes
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];

// 等价于同时添加到 DefaultMode 和 TrackingMode
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
[[NSRunLoop currentRunLoop] addTimer:timer forMode:UITrackingRunLoopMode];
```

这就提供了灵活的事件调度能力：需要在滑动时也响应的事件源，添加到 CommonModes；不需要的，只添加到 DefaultMode 即可。

### 3. 事件源（CFRunLoopSourceRef）

事件源是 RunLoop 处理的输入来源，分为两类：

**Source0（非基于 Port）**
- 手动标记为待处理状态（调用 `CFRunLoopSourceSignal`），等待runloop处理
- 不能主动唤醒 RunLoop，需要配合 `CFRunLoopWakeUp` 使用

常见来源：
- `performSelector:onThread:withObject:waitUntilDone:` 跨线程调用
- 触摸事件的应用内分发（由 Source1 接收后封装成 Source0）
- 手动创建的 Source0（通过 `CFRunLoopSourceCreate`）

**Source1（基于 Port）**
- 基于 mach port，能够主动唤醒 RunLoop
- 用于内核与线程、线程与线程之间的通信

常见来源：
- 触摸/硬件事件的系统级接收（`__IOHIDEventSystemClientQueueCallback`）
- 基于 port 的进程间通信

### 4. 定时器（CFRunLoopTimerRef）

基于时间的触发器，与 NSTimer 是 toll-free bridged 的关系。定时器可以在指定时间触发事件。

```objc
// NSTimer 方式
NSTimer *timer = [NSTimer timerWithTimeInterval:1.0 
                                         target:self 
                                       selector:@selector(timerFired) 
                                       userInfo:nil 
                                        repeats:YES];
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];

// CFRunLoopTimer 方式
CFRunLoopTimerRef timer = CFRunLoopTimerCreateWithHandler(
    kCFAllocatorDefault, 
    CFAbsoluteTimeGetCurrent(), 
    1.0,  // 间隔
    0, 
    0, 
    ^(CFRunLoopTimerRef timer) {
        NSLog(@"Timer fired");
    }
);
CFRunLoopAddTimer(CFRunLoopGetCurrent(), timer, kCFRunLoopCommonModes);
```

### 5. CADisplayLink

CADisplayLink 是一个与屏幕刷新率同步的定时器对象，常用于动画和游戏渲染。虽然它也需要添加到 RunLoop 中运行，但其触发机制与 NSTimer 有本质区别。

#### CADisplayLink vs NSTimer

| 特性 | CADisplayLink | NSTimer |
|-----|---------------|---------|
| 触发机制 | 由 VSync 信号驱动 | 基于 CFRunLoopTimer |
| 触发频率 | 与屏幕刷新率同步（60Hz/120Hz） | 自定义时间间隔 |
| 精度 | 高，与屏幕刷新严格同步 | 相对较低，受 RunLoop 状态影响 |
| 适用场景 | 动画、游戏渲染、帧率监控 | 定时任务、延迟执行 |

#### 基本使用

```swift
class AnimationController {
    private var displayLink: CADisplayLink?
    
    func startAnimation() {
        displayLink = CADisplayLink(target: self, selector: #selector(render))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    @objc private func render(_ link: CADisplayLink) {
        // link.timestamp: 上一帧显示的时间
        // link.targetTimestamp: 下一帧预计显示的时间
        let frameDuration = link.targetTimestamp - link.timestamp
        // 执行动画更新...
    }
    
    func stopAnimation() {
        displayLink?.invalidate()
        displayLink = nil
    }
}
```

#### 触发时机

CADisplayLink 的触发流程：

1. 屏幕硬件发出 VSync 信号
2. VSync 信号通过 mach port 唤醒主线程的 RunLoop
3. RunLoop 被唤醒后调用 CADisplayLink 的回调
4. 回调中更新 UI 属性
5. 在 RunLoop 的 BeforeWaiting 阶段，Core Animation 提交渲染事务

```
VSync信号 → 唤醒RunLoop → CADisplayLink回调 → 处理事件 → BeforeWaiting提交渲染 → 休眠
```

#### ProMotion 设备适配

在支持 ProMotion 的设备上（iPhone 13 Pro 及以上），屏幕刷新率可达 120Hz：

```swift
// 检查设备最大刷新率
let maxFrameRate = UIScreen.main.maximumFramesPerSecond  // 120 或 60

// iOS 15+ 设置期望的帧率范围
if #available(iOS 15.0, *) {
    displayLink?.preferredFrameRateRange = CAFrameRateRange(
        minimum: 60,    // 最低可接受帧率
        maximum: 120,   // 最高帧率
        preferred: 120  // 期望帧率
    )
}
```

### 6. 观察者（CFRunLoopObserverRef）

观察者用于监听 RunLoop 的状态变化，可以在 RunLoop 进入不同阶段时收到通知：

```objc
typedef CF_OPTIONS(CFOptionFlags, CFRunLoopActivity) {
    kCFRunLoopEntry         = (1UL << 0), // 即将进入 RunLoop
    kCFRunLoopBeforeTimers  = (1UL << 1), // 即将处理 Timer
    kCFRunLoopBeforeSources = (1UL << 2), // 即将处理 Source
    kCFRunLoopBeforeWaiting = (1UL << 5), // 即将进入休眠
    kCFRunLoopAfterWaiting  = (1UL << 6), // 刚从休眠中唤醒
    kCFRunLoopExit          = (1UL << 7), // 即将退出 RunLoop
    kCFRunLoopAllActivities = 0x0FFFFFFFU // 监听所有状态
};
```

使用示例：

```objc
CFRunLoopObserverRef observer = CFRunLoopObserverCreateWithHandler(
    kCFAllocatorDefault,
    kCFRunLoopAllActivities,
    YES,  // 重复监听
    0,    // 优先级
    ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
        switch (activity) {
            case kCFRunLoopEntry:
                NSLog(@"进入 RunLoop");
                break;
            case kCFRunLoopBeforeTimers:
                NSLog(@"即将处理 Timer");
                break;
            case kCFRunLoopBeforeSources:
                NSLog(@"即将处理 Source");
                break;
            case kCFRunLoopBeforeWaiting:
                NSLog(@"即将进入休眠");
                break;
            case kCFRunLoopAfterWaiting:
                NSLog(@"从休眠中唤醒");
                break;
            case kCFRunLoopExit:
                NSLog(@"退出 RunLoop");
                break;
            default:
                break;
        }
    }
);
CFRunLoopAddObserver(CFRunLoopGetCurrent(), observer, kCFRunLoopCommonModes);
```

## RunLoop 的运行流程

RunLoop 的内部运行逻辑如下：

```
┌─ CFRunLoopRunSpecific 入口 ──────────────────────────────
│  1. 通知 Observer：即将进入 RunLoop (kCFRunLoopEntry)
│
│  ┌─ __CFRunLoopRun do-while 循环 ─────────────────────
│  │  2. 通知 Observer：即将处理 Timer (kCFRunLoopBeforeTimers)
│  │  3. 通知 Observer：即将处理 Source0 (kCFRunLoopBeforeSources)
│  │  4. 处理 Blocks + 处理 Source0 事件（+ 如果有 Source0 被处理，再执行一次 Blocks）
│  │  5. 如果有 GCD 主队列消息就绪，跳转到步骤 9
│  │  6. 通知 Observer：即将进入休眠 (kCFRunLoopBeforeWaiting)
│  │  7. 线程休眠（mach_msg），等待被唤醒：
│  │     - Source1 (port-based)
│  │     - Timer 到时
│  │     - RunLoop 超时
│  │     - 被外部手动唤醒
│  │  8. 通知 Observer：从休眠中唤醒 (kCFRunLoopAfterWaiting)
│  │  9. 处理唤醒时收到的消息：
│  │      - 如果是 Timer 到时，处理 Timer
│  │      - 如果是 dispatch_async 到主队列，执行 block
│  │      - 如果是 Source1，处理 Source1
│  │  10. 处理 Blocks（步骤 9 中的回调可能通过 CFRunLoopPerformBlock 提交了新 block）
│  │  11. 根据条件判断：继续循环 → 回到步骤 2 / 退出循环 → 步骤 12
│  └──────────────────────────────────────────────────────
│
│  12. 通知 Observer：即将退出 RunLoop (kCFRunLoopExit)
└──────────────────────────────────────────────────────────
```

### 流程详解

**步骤 1：进入 RunLoop**

`CFRunLoopRunSpecific` 函数首先通知 Observer `kCFRunLoopEntry`，表示 RunLoop 即将开始运行。AutoreleasePool 就是在这个时机创建的。随后进入 `__CFRunLoopRun` 的 do-while 循环。

**步骤 2-3：循环开始，通知 Observer**

每次循环开始时，依次通知 Observer `kCFRunLoopBeforeTimers` 和 `kCFRunLoopBeforeSources`，给外部一个在事件处理前做准备工作的机会。

**步骤 4-5：处理 Blocks、Source0 与就绪检查**

步骤 4 包含三个子步骤，源码中的顺序为：

```c
__CFRunLoopDoBlocks(rl, rlm);                                          // 4a. 处理 Blocks
Boolean sourceHandledThisLoop = __CFRunLoopDoSources0(rl, rlm, ...);   // 4b. 处理 Source0
if (sourceHandledThisLoop) {
    __CFRunLoopDoBlocks(rl, rlm);                                      // 4c. 再执行一次 Blocks
}
```

步骤 4a 执行通过 `CFRunLoopPerformBlock` 提交到当前 Mode 的 block，这些 block 可能是上一次循环或其他时机提交但尚未执行的。

步骤 4b 处理已被标记为待处理的 Source0 事件，主要来源包括：

1. **performSelector:onThread:withObject:waitUntilDone:**
   ```objc
   [self performSelector:@selector(doTask) onThread:bgThread withObject:nil waitUntilDone:NO];
   ```
   底层会创建 Source0 并调用 `CFRunLoopWakeUp()` 唤醒目标线程，在下次循环处理。

2. **手动触发的 Source0**
   ```objc
   CFRunLoopSourceSignal(source);       // 标记 Source0 为待处理
   CFRunLoopWakeUp(runLoop);            // 唤醒 RunLoop
   ```

3. **上一次循环遗留的 Source0**
   如果上一次循环中产生了新的待处理 Source0（如事件处理回调中触发的新事件），会在本次循环处理。

步骤 4c 中，如果 4b 处理了 Source0，则再次调用 `__CFRunLoopDoBlocks`，因为 Source0 的回调中可能又提交了新的 block。

步骤 5 中，RunLoop 会快速探测 GCD 主队列的 mach port（`dispatchPort`）上是否有已到达但尚未处理的消息（底层调用 `mach_msg()` 时将超时设为 0，立即返回结果而不等待新消息到来）。如果有，就跳过休眠直接跳到步骤 9 处理，避免不必要的休眠-唤醒开销。

**步骤 6-7：休眠阶段**

在真正休眠之前，RunLoop 先通知 Observer `kCFRunLoopBeforeWaiting`。系统在这个时机做了三件重要的事：

1. **手势识别的回调**：当触摸事件在步骤 9 被 Source1 接收并分发后，`UIGestureRecognizer` 并不会在触摸回调中立即执行 action，而是将手势状态变化记录下来，等到 `kCFRunLoopBeforeWaiting` 时，由系统注册的 Observer 统一触发 `_UIGestureRecognizerUpdate`，批量处理所有手势识别器的状态更新并执行对应的 action 回调。这种延迟设计意味着：在手势识别器的 action 被调用时，已经是下一轮 RunLoop 迭代，触摸点位置相比 `touchesBegan:` 时已经发生了变化。

2. **UIView/CALayer 的界面更新**：调用 `setNeedsLayout`、`setNeedsDisplay`、`setNeedsUpdateConstraints` 等方法时，系统并不会立即执行布局和绘制，而是标记为"需要更新"。在 `kCFRunLoopBeforeWaiting` 时，Core Animation 注册的 Observer 会被触发，统一执行待处理的布局（`layoutSubviews`）、显示（`drawRect:`）和约束更新，最终通过 `CATransaction` 提交渲染事务给 Render Server。这种"攒一批再提交"的设计避免了同一帧内多次冗余的布局和渲染计算。

3. **AutoreleasePool 的释放与重建**：释放旧的 AutoreleasePool 并创建新的，释放本轮循环中产生的 autorelease 对象。

随后，RunLoop 调用 `mach_msg()` 函数让线程进入内核态休眠。这种休眠是真正的系统级休眠，不消耗 CPU 资源。线程会一直休眠直到被以下事件唤醒：
- Source1 事件（基于 mach port 的进程间通信）
- Timer 时间到达
- RunLoop 设置的超时时间到达
- 被 `CFRunLoopWakeUp()` 手动唤醒

**步骤 8-10：唤醒处理阶段**

线程被唤醒后，先通知 Observer `kCFRunLoopAfterWaiting`，然后根据唤醒原因处理对应的事件。Timer、GCD 主队列任务、Source1 都是通过 mach port 唤醒 RunLoop 的，但它们有各自独立的处理路径：

- **Timer**：通过 `__CFRunLoopDoTimers()` 函数处理，遍历所有到期的 Timer 并执行回调。Timer 底层使用 `mk_timer`（内核定时器），时间到达时通过 mach port 唤醒 RunLoop。

- **GCD 主队列**：通过 `__CFRUNLOOP_IS_SERVICING_THE_MAIN_DISPATCH_QUEUE__()` 调用 `_dispatch_main_queue_callback_4CF()` 执行 block。主队列有专门的 mach port，dispatch 任务时会向该 port 发送消息唤醒 RunLoop。

- **Source1**：通过 `__CFRunLoopDoSource1()` 处理。例如触摸事件由 Source1（`__IOHIDEventSystemClientQueueCallback`）接收 IOKit 事件后进行应用内分发。

步骤 10 再次调用 `__CFRunLoopDoBlocks` 执行通过 `CFRunLoopPerformBlock` 提交的 block。步骤 9 的消息处理（Timer 回调、GCD block、Source1 回调）过程中可能又提交了新的 block，在此时执行。

**步骤 11-12：循环判断与退出**

RunLoop 会检查以下条件来决定是否继续循环：
- 当前 Mode 是否还有 Source/Timer/Observer
- 是否超过了指定的运行时间
- 是否被外部调用 `CFRunLoopStop()` 强制停止
- `stopAfterHandle` 是否为 true 且已处理了事件（`runMode:beforeDate:` 模式，只执行一次就退出）

如果不满足退出条件，回到步骤 2 继续下一次循环。如果满足退出条件，跳出 do-while 循环，由外层 `CFRunLoopRunSpecific` 通知 Observer `kCFRunLoopExit`，然后结束。

## RunLoop 的底层实现

RunLoop 的核心实现在 Apple 开源的 CoreFoundation 框架中（`CFRunLoop.c`），底层依赖于 macOS/iOS 内核的 Mach 消息机制。

### 核心数据结构

RunLoop 在 CoreFoundation 层面的数据结构如下：

```c
// CFRunLoop
struct __CFRunLoop {
    pthread_t _pthread;             // RunLoop 对应的线程
    CFMutableSetRef _commonModes;   // 标记为 Common 的 Mode 集合
    CFMutableSetRef _commonModeItems; // 所有 Common Mode 中的 Source/Timer/Observer
    CFRunLoopModeRef _currentMode;  // 当前运行的 Mode
    CFMutableSetRef _modes;         // 所有 Mode 的集合
    // ...
};

// CFRunLoopMode
struct __CFRunLoopMode {
    CFStringRef _name;              // Mode 名称，如 kCFRunLoopDefaultMode
    CFMutableSetRef _sources0;      // Source0 集合
    CFMutableSetRef _sources1;      // Source1 集合
    CFMutableArrayRef _observers;   // Observer 数组（有序）
    CFMutableArrayRef _timers;      // Timer 数组
    mach_port_t _timerPort;         // Timer 的 mach port（mk_timer）
    mach_port_t _portSet;           // 监听的 port 集合（port_set）
    // ...
};
```

每个 Mode 内部维护了一个 `_portSet`（mach port 集合），RunLoop 进入休眠时，会调用 `mach_msg()` 同时监听这个集合中的所有 port。任何一个 port 收到消息，都会唤醒线程。

### mach_msg 与休眠机制

RunLoop 的休眠是通过 Mach 内核的消息机制实现的，核心函数是 `mach_msg()`。

**Mach 是什么？**

Mach 是 macOS/iOS 内核（XNU）的微内核部分，它提供了最基础的系统抽象：进程（task）、线程（thread）、端口（port）以及消息（message）。Mach port 是进程间/线程间通信的基础设施。

**mach_msg() 的工作原理：**

```c
mach_msg_return_t mach_msg(
    mach_msg_header_t *msg,       // 消息缓冲区
    mach_msg_option_t option,     // 选项：MACH_SEND_MSG / MACH_RCV_MSG
    mach_msg_size_t send_size,
    mach_msg_size_t rcv_size,
    mach_port_name_t rcv_name,    // 接收端口
    mach_msg_timeout_t timeout,   // 超时时间
    mach_port_name_t notify
);
```

当 RunLoop 需要休眠时，调用 `mach_msg()` 并传入 `MACH_RCV_MSG` 选项。此时线程从用户态（User Mode）切换到内核态（Kernel Mode），真正进入休眠，完全不消耗 CPU 资源。这与简单的 while 空转有本质区别：

```c
// 忙等待：线程仍在运行，持续消耗 CPU
while (!hasEvent) {
    // CPU 空转
}

// mach_msg 休眠：线程被内核挂起，CPU 可以调度给其他线程
// 只有当 port 收到消息时，内核才会唤醒这个线程
mach_msg(msg, MACH_RCV_MSG, 0, size, port_set, timeout, MACH_PORT_NULL);
```

**用户态与内核态切换流程：**

```
发送消息:
  用户态: mach_msg(MACH_SEND_MSG) → 系统调用 → 内核态: 消息进入目标 port 队列

接收消息(休眠):
  用户态: mach_msg(MACH_RCV_MSG) → 系统调用 → 内核态: 线程挂起等待
  ...
  内核态: port 收到消息 → 唤醒线程 → 返回用户态: mach_msg 返回
```

### CFRunLoopRunSpecific 与 __CFRunLoopRun 核心逻辑

RunLoop 的启动链路为 `CFRunLoopRun` → `CFRunLoopRunSpecific` → `__CFRunLoopRun`。`CFRunLoopRunSpecific` 负责 Entry/Exit 通知，`__CFRunLoopRun` 负责内部的 do-while 事件循环。以下是基于 [Apple 开源的 CF-1153.18 源码](https://opensource.apple.com/source/CF/CF-1153.18/CFRunLoop.c) 简化的伪代码：

```c
// ========== CFRunLoopRunSpecific（步骤 1 和 12）==========

SInt32 CFRunLoopRunSpecific(CFRunLoopRef rl, CFStringRef modeName,
                             CFTimeInterval seconds, Boolean returnAfterSourceHandled) {
    // 查找 Mode，如果 Mode 为空则直接返回
    CFRunLoopModeRef currentMode = __CFRunLoopFindMode(rl, modeName, false);
    if (NULL == currentMode || __CFRunLoopModeIsEmpty(rl, currentMode, rl->_currentMode)) {
        return kCFRunLoopRunFinished;
    }
    
    // 步骤 1. 通知 Observer: Entry
    __CFRunLoopDoObservers(rl, currentMode, kCFRunLoopEntry);
    
    // 进入内部 do-while 循环
    int32_t result = __CFRunLoopRun(rl, currentMode, seconds, returnAfterSourceHandled, previousMode);
    
    // 步骤 12. 通知 Observer: Exit
    __CFRunLoopDoObservers(rl, currentMode, kCFRunLoopExit);
    
    return result;
}

// ========== __CFRunLoopRun（步骤 2-11 的 do-while 循环）==========

static int32_t __CFRunLoopRun(CFRunLoopRef rl, CFRunLoopModeRef rlm, 
                               CFTimeInterval seconds, Boolean stopAfterHandle,
                               CFRunLoopModeRef previousMode) {
    mach_port_name_t dispatchPort = MACH_PORT_NULL;
    
    // 如果是主线程且运行在 CommonMode，获取 GCD 主队列的 port
    if (pthread_main_np() && CFRunLoopGetMain() == rl) {
        dispatchPort = _dispatch_get_main_queue_port_4CF();
    }

    Boolean didDispatchPortLastTime = true;
    int32_t retVal = 0;
    
    do {
        // 步骤 2. 通知 Observer: BeforeTimers
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeTimers);
        
        // 步骤 3. 通知 Observer: BeforeSources
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeSources);
        
        // 步骤 4a. 处理 Blocks
        __CFRunLoopDoBlocks(rl, rlm);
        
        // 步骤 4b. 处理 Source0
        Boolean sourceHandledThisLoop = __CFRunLoopDoSources0(rl, rlm, stopAfterHandle);
        
        // 步骤 4c. 如果处理了 Source0，再执行一次 Blocks
        if (sourceHandledThisLoop) {
            __CFRunLoopDoBlocks(rl, rlm);
        }
        
        // 步骤 5. 快速探测 GCD 主队列的 port（非阻塞，超时为 0）
        if (MACH_PORT_NULL != dispatchPort && !didDispatchPortLastTime) {
            if (__CFRunLoopServiceMachPort(dispatchPort, &msg, sizeof(msg_buffer), &livePort, 0, ...)) {
                goto handle_msg;  // 有消息就绪，跳过休眠
            }
        }
        didDispatchPortLastTime = false;
        
        // 步骤 6. 通知 Observer: BeforeWaiting（即将休眠）
        if (!poll) __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeWaiting);
        __CFRunLoopSetSleeping(rl);
        
        // 步骤 7. 调用 mach_msg 进入休眠，等待以下事件唤醒：
        //    - Source1 的 mach port 消息
        //    - Timer 的 mach port（mk_timer）
        //    - GCD 主队列的 mach port
        //    - CFRunLoopWakeUp 手动唤醒（向 rl 的 _wakeUpPort 发消息）
        __CFRunLoopServiceMachPort(waitSet, &msg, sizeof(msg_buffer), &livePort, poll ? 0 : TIMEOUT_INFINITY, ...);
        
        __CFRunLoopUnsetSleeping(rl);
        
        // 步骤 8. 通知 Observer: AfterWaiting（被唤醒）
        if (!poll) __CFRunLoopDoObservers(rl, rlm, kCFRunLoopAfterWaiting);
        
    handle_msg:
        // 步骤 9. 根据唤醒源处理消息
        if (livePort == MACH_PORT_NULL) {
            // 空唤醒，不处理
        } else if (livePort == rl->_wakeUpPort) {
            // CFRunLoopWakeUp 手动唤醒，不需要额外处理
        } else if (livePort == rlm->_timerPort || livePort == modeQueuePort) {
            // Timer 到期
            __CFRunLoopDoTimers(rl, rlm, mach_absolute_time());
        } else if (livePort == dispatchPort) {
            // GCD 主队列的 block
            __CFRUNLOOP_IS_SERVICING_THE_MAIN_DISPATCH_QUEUE__(msg);
            didDispatchPortLastTime = true;
        } else {
            // Source1 事件
            CFRunLoopSourceRef rls = __CFRunLoopModeFindSourceForMachPort(rl, rlm, livePort);
            sourceHandledThisLoop = __CFRunLoopDoSource1(rl, rlm, rls, msg, ...) || sourceHandledThisLoop;
        }
        
        // 步骤 10. 再次处理 Blocks
        __CFRunLoopDoBlocks(rl, rlm);
        
        // 步骤 11. 判断退出条件
        if (stopAfterHandle && sourceHandledThisLoop) {
            retVal = kCFRunLoopRunHandledSource;  // runMode:beforeDate: 模式
        } else if (timeout_context->termTSR < mach_absolute_time()) {
            retVal = kCFRunLoopRunTimedOut;
        } else if (__CFRunLoopIsStopped(rl)) {
            __CFRunLoopUnsetStopped(rl);
            retVal = kCFRunLoopRunStopped;        // 被 CFRunLoopStop 停止
        } else if (__CFRunLoopModeIsEmpty(rl, rlm, previousMode)) {
            retVal = kCFRunLoopRunFinished;       // Mode 中没有 Source/Timer/Observer
        }
    } while (0 == retVal);
    
    return retVal;
}
```

### RunLoop 的启动方式

理解了 `CFRunLoopRunSpecific` 和 `__CFRunLoopRun` 的内部逻辑后，需要进一步理解**不同启动 API 在 `CFRunLoopRunSpecific` 外面**做了什么。这是理解 RunLoop 行为的关键——同样的内部循环，被不同的外层调用包装后，表现出截然不同的退出行为。

#### 调用层次总览

所有启动 API 最终都调用 `CFRunLoopRunSpecific`，区别在于外层是否有循环、循环是否可退出：

```
启动 API（外层）          CFRunLoopRunSpecific（内层）
─────────────────         ──────────────────────────
runMode:beforeDate:  ──→  调用一次就返回
CFRunLoopRun()       ──→  do-while 反复调用，可被 Stop/Finished 退出
[NSRunLoop run]      ──→  while(1) 反复调用，无法退出
[NSRunLoop runUntilDate:]  ──→  while(未超时) 反复调用，超时退出
```

| 启动方式 | 外层循环 | CFRunLoopStop 能否停止 | stopAfterHandle |
|---------|---------|---------------------|----------------|
| `runMode:beforeDate:` | 无，调用一次返回 | 能（只有一次调用） | YES |
| `CFRunLoopRun()` | `do-while`，检查 Stopped/Finished | 能 | NO |
| `[NSRunLoop run]` | `while(1)`，不检查任何条件 | 不能 | YES |
| `[NSRunLoop runUntilDate:]` | `while(未超时)`，不检查 Stopped | 不能（但会超时退出） | YES |

#### 1. CFRunLoopRunInMode / runMode:beforeDate:（单次运行）

```c
// 源码
SInt32 CFRunLoopRunInMode(CFStringRef modeName, CFTimeInterval seconds, Boolean returnAfterSourceHandled) {
    return CFRunLoopRunSpecific(CFRunLoopGetCurrent(), modeName, seconds, returnAfterSourceHandled);
}
```

最底层的 API，直接调用一次 `CFRunLoopRunSpecific` 然后返回结果。`[NSRunLoop runMode:beforeDate:]` 等价于 `CFRunLoopRunInMode(mode, limitDate, YES)`，其中 `returnAfterSourceHandled=YES` 表示处理完一个事件后就从内部 do-while 退出。

这是唯一能精确控制 RunLoop 行为的 API。

#### 2. CFRunLoopRun（可停止的持续运行）

```c
// 源码
void CFRunLoopRun(void) {
    int32_t result;
    do {
        result = CFRunLoopRunSpecific(CFRunLoopGetCurrent(), kCFRunLoopDefaultMode, 1.0e10, false);
    } while (kCFRunLoopRunStopped != result && kCFRunLoopRunFinished != result);
}
```

外层是一个 do-while 循环，反复调用 `CFRunLoopRunSpecific`。关键点：
- `stopAfterHandle` 传入 `false`，内部 do-while 不会因为处理了事件就退出
- 外层循环会在 `kCFRunLoopRunStopped`（被 `CFRunLoopStop()` 停止）或 `kCFRunLoopRunFinished`（Mode 为空）时退出
- 因此 **`CFRunLoopRun()` 是可以被 `CFRunLoopStop()` 停止的**

#### 3. [NSRunLoop run]（不可停止的永久运行）

根据 [Apple 官方文档](https://developer.apple.com/documentation/foundation/runloop/run())：

> If you want the run loop to terminate, you shouldn't use this method. Instead, use one of the other run methods and also check other arbitrary conditions of your own, in a loop.

Apple 文档明确说明 `[NSRunLoop run]` 的实现是 "repeatedly invoking `run(mode:before:)`"，等价于：

```objc
// Apple 文档中的描述
while (1) {
    [runLoop runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
}
```

与 `CFRunLoopRun()` 的关键区别在于：
- `CFRunLoopRun()` 的外层 do-while **检查退出条件**（Stopped/Finished），所以 `CFRunLoopStop()` 可以终止它
- `[NSRunLoop run]` 的外层 while(1) **不检查任何条件**，`CFRunLoopStop()` 只能让当前这一次 `runMode:beforeDate:`（即一次 `CFRunLoopRunSpecific`）返回，但外层 while(1) 会立即发起下一次调用

```
CFRunLoopStop() 的影响范围：

CFRunLoopRun():
  外层 do-while ──检查result──→ result == Stopped → 退出 ✓
  │
  └─ CFRunLoopRunSpecific (Entry → do-while → Exit)
      └─ __CFRunLoopRun 内部: __CFRunLoopIsStopped → retVal = Stopped → 返回

[NSRunLoop run]:
  外层 while(1) ──不检查任何条件──→ 继续 ✗ 无法退出
  │
  └─ runMode:beforeDate: → CFRunLoopRunSpecific (Entry → do-while → Exit)
      └─ __CFRunLoopRun 内部: __CFRunLoopIsStopped → retVal = Stopped → 返回
```

#### 4. [NSRunLoop runUntilDate:]（有时间限制但不可被 Stop 停止）

根据 [Apple 官方文档](https://developer.apple.com/documentation/foundation/runloop/run(until:))，`runUntilDate:` 的实现是 "repeatedly invoking `run(mode:before:)` until the specified expiration date"，等价于：

```objc
NSDate *limitDate = ...;
while ([limitDate timeIntervalSinceNow] > 0) {
    [runLoop runMode:NSDefaultRunLoopMode beforeDate:limitDate];
}
```

它和 `[NSRunLoop run]` 一样无法被 `CFRunLoopStop()` 停止，但到达指定时间后会自动退出。

### 各唤醒源的 mach port 机制

RunLoop 休眠时监听一组 mach port，不同事件源使用不同的 port：

| 唤醒源 | mach port | 说明 |
|--------|-----------|------|
| Timer | `rlm->_timerPort` | 内核的 mk_timer，时间到达时向 port 发消息 |
| Source1 | source1 自带的 port | 如 IOKit 事件通过 `__IOHIDEventSystemClientQueueCallback` 的 port |
| GCD 主队列 | `_dispatch_get_main_queue_port_4CF()` | dispatch_async 到主队列时向此 port 发消息 |
| 手动唤醒 | `rl->_wakeUpPort` | `CFRunLoopWakeUp()` 向此 port 发空消息 |

这些 port 都被添加到 Mode 的 `_portSet` 中，`mach_msg()` 可以一次性等待整个 port set 中的任意消息。

### CFRunLoopWakeUp 的实现

手动唤醒 RunLoop 的实现非常简洁：向 RunLoop 自身的 `_wakeUpPort` 发送一个 mach 消息即可。

```c
void CFRunLoopWakeUp(CFRunLoopRef rl) {
    kern_return_t ret;
    // 向 _wakeUpPort 发送一个空的 mach 消息
    ret = __CFSendTrivialMachMessage(rl->_wakeUpPort, 0, MACH_SEND_TIMEOUT, 0);
}
```

由于 `mach_msg()` 在休眠时监听了 `_wakeUpPort`，收到消息后线程立即被内核唤醒，从 `mach_msg()` 返回继续执行。

## RunLoop 的实际应用

### 1. NSTimer 在滑动时失效问题

当 ScrollView 滑动时，RunLoop 会切换到 UITrackingRunLoopMode，导致添加在 DefaultMode 下的 Timer 不执行。

解决方案：

```objc
// 方案1：将 Timer 添加到 CommonModes
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];

// 方案2：使用 GCD Timer（不受 RunLoop Mode 影响）
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 1.0 * NSEC_PER_SEC, 0);
dispatch_source_set_event_handler(timer, ^{
    NSLog(@"GCD Timer fired");
});
dispatch_resume(timer);
```

### 2. 线程保活

#### 为什么需要线程保活？

子线程默认执行完 block/selector 后就会退出销毁。如果业务中需要频繁地在子线程上执行任务（如串行化的网络回调处理、数据库读写），每次都创建新线程的开销是不可接受的。线程保活的本质是：**让子线程的 RunLoop 持续运行，线程在没有任务时休眠而不是退出，有任务时被唤醒处理**。

#### 实现原理

线程保活需要解决三个问题：

**问题 1：子线程的 RunLoop 默认不启动**

子线程的 RunLoop 采用懒加载机制，创建线程后必须手动获取并启动 RunLoop，否则线程执行完任务就退出了。

**问题 2：RunLoop 没有事件源会立即退出**

即使启动了 RunLoop，如果当前 Mode 中没有任何 Source/Timer/Observer，`CFRunLoopRunSpecific` 入口处的 `__CFRunLoopModeIsEmpty` 检查会直接返回 `kCFRunLoopRunFinished`，RunLoop 根本不会进入 do-while 循环。因此需要向 RunLoop 添加一个持久的事件源（如 `NSPort`）来"撑住"它。

**问题 3：RunLoop 需要能被安全停止**

不能使用 `[NSRunLoop run]`，因为它的外层 while(1) 无条件循环，无法被 `CFRunLoopStop()` 停止（详见「RunLoop 的启动方式」章节）。正确做法是使用 `runMode:beforeDate:` 配合自定义的 while 循环和标志位，这也是 Apple 官方文档推荐的做法。

#### 完整实现

```objc
@interface PermenantThread : NSObject
- (void)executeTask:(void(^)(void))task;
- (void)stop;
@end

@implementation PermenantThread {
    NSThread *_thread;
    BOOL _stopped;
}

- (instancetype)init {
    if (self = [super init]) {
        _stopped = NO;
        __weak typeof(self) weakSelf = self;
        _thread = [[NSThread alloc] initWithBlock:^{
            // 向 RunLoop 中添加 Source，防止 RunLoop 退出
            [[NSRunLoop currentRunLoop] addPort:[[NSPort alloc] init] forMode:NSDefaultRunLoopMode];
            
            while (weakSelf && !weakSelf->_stopped) {
                [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
            }
        }];
        [_thread start];
    }
    return self;
}

- (void)executeTask:(void(^)(void))task {
    if (!_thread || !task) return;
    [self performSelector:@selector(__executeTask:) onThread:_thread withObject:task waitUntilDone:NO];
}

- (void)__executeTask:(void(^)(void))task {
    task();
}

- (void)stop {
    if (!_thread) return;
    [self performSelector:@selector(__stop) onThread:_thread withObject:nil waitUntilDone:YES];
}

- (void)__stop {
    _stopped = YES;
    CFRunLoopStop(CFRunLoopGetCurrent());
    _thread = nil;
}

- (void)dealloc {
    [self stop];
}

@end
```

#### 执行任务与停止的流程

**执行任务时：**

```
调用线程                              保活线程（休眠中）
   |                                      |
   |-- performSelector:onThread: -------→ | （底层创建 Source0 + CFRunLoopWakeUp）
   |                                      |-- mach_msg 返回（被唤醒）
   |                                      |-- 步骤 8: AfterWaiting 通知
   |                                      |-- 步骤 9: 处理 Source0（执行 __executeTask: → task()）
   |                                      |-- 步骤 11: stopAfterHandle=YES，runMode:beforeDate: 返回
   |                                      |-- while 检查 _stopped == NO，再次调用 runMode:beforeDate:
   |                                      |-- 新一次 CFRunLoopRunSpecific: Entry → 步骤 6: BeforeWaiting → 步骤 7: 休眠
```

**停止时：**

```
调用线程                              保活线程（休眠中）
   |                                      |
   |-- performSelector:onThread: -------→ | （唤醒）
   |   waitUntilDone:YES（阻塞等待）        |-- 步骤 9: 处理 Source0（执行 __stop）
   |                                      |   _stopped = YES
   |                                      |   CFRunLoopStop() → 设置 rl->_stopped 标记
   |                                      |-- 步骤 11: runMode:beforeDate: 返回
   |                                      |-- while 检查 _stopped == YES，退出循环
   |                                      |-- 线程函数返回，线程销毁
   |←- waitUntilDone 返回  ---------------|
```

注意 `stop` 方法使用 `waitUntilDone:YES` 是必要的——它确保调用返回时线程已经完全停止，避免在 `dealloc` 中线程还在运行导致野指针问题。

### 3. 卡顿监控

利用 RunLoop Observer 监控主线程卡顿：

```objc
@interface ANRMonitor : NSObject
+ (instancetype)sharedInstance;
- (void)start;
- (void)stop;
@end

@implementation ANRMonitor {
    CFRunLoopObserverRef _observer;
    dispatch_semaphore_t _semaphore;
    CFRunLoopActivity _activity;
}

+ (instancetype)sharedInstance {
    static ANRMonitor *instance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[ANRMonitor alloc] init];
    });
    return instance;
}

- (void)start {
    if (_observer) return;
    
    _semaphore = dispatch_semaphore_create(0);
    
    // 创建 Observer
    CFRunLoopObserverContext context = {0, (__bridge void *)self, NULL, NULL, NULL};
    _observer = CFRunLoopObserverCreate(
        kCFAllocatorDefault,
        kCFRunLoopAllActivities,
        YES,
        0,
        &runLoopObserverCallback,
        &context
    );
    CFRunLoopAddObserver(CFRunLoopGetMain(), _observer, kCFRunLoopCommonModes);
    
    // 在子线程监控
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        while (YES) {
            // 等待信号，超时时间设为卡顿阈值（如 50ms）
            long result = dispatch_semaphore_wait(self->_semaphore, dispatch_time(DISPATCH_TIME_NOW, 50 * NSEC_PER_MSEC));
            
            if (result != 0) {
                if (!self->_observer) return;
                
                // 检查是否在 BeforeSources 或 AfterWaiting 状态停留过久
                if (self->_activity == kCFRunLoopBeforeSources || 
                    self->_activity == kCFRunLoopAfterWaiting) {
                    // 检测到卡顿，记录堆栈
                    NSLog(@"检测到卡顿！");
                }
            }
        }
    });
}

static void runLoopObserverCallback(CFRunLoopObserverRef observer, CFRunLoopActivity activity, void *info) {
    ANRMonitor *monitor = (__bridge ANRMonitor *)info;
    monitor->_activity = activity;
    dispatch_semaphore_signal(monitor->_semaphore);
}

- (void)stop {
    if (!_observer) return;
    CFRunLoopRemoveObserver(CFRunLoopGetMain(), _observer, kCFRunLoopCommonModes);
    CFRelease(_observer);
    _observer = NULL;
}

@end
```

上面的方案是网上流传最广的 RunLoop 卡顿监控实现，但它存在一个 `kCFRunLoopBeforeWaiting` 阶段的监控盲区——UI 布局/绘制、手势回调等系统 Observer 的耗时无法被捕获。微信 Matrix 通过注册两个 Observer（order 分别为 `LONG_MIN` 和 `LONG_MAX`）来包裹所有系统 Observer 的执行，从而覆盖这个阶段。详见 [卡顿-检测]({{< relref "/posts/interview/ios-performance/stutter-检测" >}}#beforewaiting阶段的监控盲区)。

### 4. 利用 RunLoop 空闲时执行低优先级任务

在 RunLoop 即将进入休眠时执行一些不紧急的任务，避免影响主要交互体验：

```objc
@interface IdleTaskManager : NSObject
+ (instancetype)sharedManager;
- (void)addTask:(void(^)(void))task;
- (void)start;
- (void)stop;
@end

@implementation IdleTaskManager {
    NSMutableArray<void(^)(void)> *_tasks;
    CFRunLoopObserverRef _observer;
    NSUInteger _maxTasksPerRound;  // 每次最多执行的任务数
}

+ (instancetype)sharedManager {
    static IdleTaskManager *manager;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[IdleTaskManager alloc] init];
    });
    return manager;
}

- (instancetype)init {
    if (self = [super init]) {
        _tasks = [NSMutableArray array];
        _maxTasksPerRound = 1;  // 默认每次执行1个任务，避免空闲时间过长
    }
    return self;
}

- (void)addTask:(void(^)(void))task {
    if (!task) return;
    @synchronized (_tasks) {
        [_tasks addObject:task];
    }
}

- (void)start {
    if (_observer) return;
    
    __weak typeof(self) weakSelf = self;
    // 在 RunLoop 即将进入休眠时执行任务
    _observer = CFRunLoopObserverCreateWithHandler(
        kCFAllocatorDefault,
        kCFRunLoopBeforeWaiting,
        YES,  // 重复监听
        0,    // 优先级
        ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
            __strong typeof(weakSelf) self = weakSelf;
            if (!self) return;
            
            @synchronized (self->_tasks) {
                // 每次执行有限数量的任务，避免阻塞太久
                NSUInteger count = MIN(self->_maxTasksPerRound, self->_tasks.count);
                for (NSUInteger i = 0; i < count; i++) {
                    void(^task)(void) = self->_tasks.firstObject;
                    [self->_tasks removeObjectAtIndex:0];
                    task();
                }
            }
        }
    );
    CFRunLoopAddObserver(CFRunLoopGetMain(), _observer, kCFRunLoopCommonModes);
}

- (void)stop {
    if (!_observer) return;
    CFRunLoopRemoveObserver(CFRunLoopGetMain(), _observer, kCFRunLoopCommonModes);
    CFRelease(_observer);
    _observer = NULL;
}

- (void)dealloc {
    [self stop];
}

@end
```

**使用场景示例：**

```objc
// 应用启动时开启
[[IdleTaskManager sharedManager] start];

// 1. 预加载图片
[[IdleTaskManager sharedManager] addTask:^{
    UIImage *image = [UIImage imageNamed:@"large_image"];
    [self.imageCache setObject:image forKey:@"large_image"];
}];

// 2. 预处理数据
[[IdleTaskManager sharedManager] addTask:^{
    [self.dataManager prepareCache];
}];

// 3. 日志上报
[[IdleTaskManager sharedManager] addTask:^{
    [self.logger uploadPendingLogs];
}];

// 4. 清理缓存
[[IdleTaskManager sharedManager] addTask:^{
    [self.cacheManager cleanExpiredCache];
}];
```

**优势：**
- 不影响用户交互（在空闲时执行）
- 自动平衡性能（可控制每次执行任务数）
- 适用于各种低优先级任务（图片预加载、数据预处理、日志上报等）

## AutoreleasePool 与 RunLoop

主线程的 AutoreleasePool 是由 RunLoop 自动管理的：

1. 在 RunLoop 进入时（kCFRunLoopEntry）创建 AutoreleasePool
2. 在 RunLoop 即将休眠时（kCFRunLoopBeforeWaiting）释放旧池并创建新池
3. 在 RunLoop 退出时（kCFRunLoopExit）释放 AutoreleasePool

这就是为什么在主线程中创建的 autorelease 对象不会立即释放，而是在 RunLoop 一次循环结束时释放。

## 常见面试题

### Q1: RunLoop 和线程的关系？

- 每个线程都有唯一对应的 RunLoop 对象
- 主线程和子线程的 RunLoop 都采用懒加载机制，在第一次获取时才创建
- 主线程的 RunLoop 由 `UIApplicationMain` 内部首次获取并启动（调用链：`UIApplicationMain` → `GSEventRunModal` → `CFRunLoopRunSpecific`）
- RunLoop 与线程是一一对应的，存储在一个全局字典（`__CFRunLoops`）中
- RunLoop 在第一次获取时创建，在线程结束时销毁

### Q2: RunLoop 的 Mode 有什么作用？

**核心作用：实现事件源的隔离与优先级管理。**

RunLoop 的 Mode 是一种事件分组机制，每个 Mode 内部包含独立的 Source0、Source1、Timer 和 Observer 集合。RunLoop 同一时刻只能运行在一个 Mode 下，只处理当前 Mode 中注册的事件源，其他 Mode 中的事件源不会被处理。

**常见的 Mode：**

- `kCFRunLoopDefaultMode`（NSDefaultRunLoopMode）：默认模式，App 正常运行时使用，处理 Timer、网络回调等常规任务。
- `UITrackingRunLoopMode`：界面追踪模式，当 UIScrollView 及其子类（UITableView、UICollectionView 等）滑动时，RunLoop 自动切换到此模式，专注处理 UI 追踪事件，保证滑动流畅。
- `kCFRunLoopCommonModes`（NSRunLoopCommonModes）：并不是真正的 Mode，而是一个标记集合，默认包含 DefaultMode 和 TrackingMode。将事件源添加到 CommonModes，等价于同时添加到所有被标记为 Common 的 Mode 中。
- `UIInitializationRunLoopMode`：App 启动时使用的模式，启动完成后不再使用。
- `GSEventReceiveRunLoopMode`：接收系统事件的内部模式（未公开），开发者一般不直接使用，且不应依赖其稳定性。

**Mode 切换机制：**

切换 Mode 时，RunLoop 需要先退出当前 Mode 的循环，再以新 Mode 重新进入。最典型的场景是 ScrollView 滑动：用户开始滑动时 RunLoop 从 DefaultMode 切换到 TrackingMode，停止滑动后切换回 DefaultMode。

### Q3: RunLoop 的运作流程是怎样的？

严格来说，RunLoop 的运行可以分成**外层启动循环**和**内层事件循环**两层：

```
启动 API（外层）                     内层一次运行
────────────────────────────────────────────────────────
runMode:beforeDate:       ──调用一次──> CFRunLoopRunSpecific
CFRunLoopRun()            ──do-while──> CFRunLoopRunSpecific
[NSRunLoop run]           ──while(1)──> CFRunLoopRunSpecific
[NSRunLoop runUntilDate:] ──while未超时──> CFRunLoopRunSpecific
```

外层循环由具体启动 API 决定：`runMode:beforeDate:` 只运行一次；`CFRunLoopRun()` 会反复调用 `CFRunLoopRunSpecific`，但外层会检查返回值，所以可以被 `CFRunLoopStop()` 停止；`[NSRunLoop run]` 则是无条件 `while(1)` 反复运行，因此对 `[NSRunLoop run]` 来说，单纯调用 `CFRunLoopStop()` 只能停止当前这一轮内层运行，随后外层还会再次进入。

下面的流程图描述的是**一次 `CFRunLoopRunSpecific` 调用内部**的事件循环，也就是常说的内层循环：

```
┌─ CFRunLoopRunSpecific 入口 ──────────────────────────────
│  1. 通知 Observer：即将进入 RunLoop (kCFRunLoopEntry)
│
│  ┌─ __CFRunLoopRun do-while 循环 ─────────────────────
│  │  2. 通知 Observer：即将处理 Timer (kCFRunLoopBeforeTimers)
│  │  3. 通知 Observer：即将处理 Source0 (kCFRunLoopBeforeSources)
│  │  4. 处理 Blocks + 处理 Source0 事件（+ 如果有 Source0 被处理，再执行一次 Blocks）
│  │  5. 如果有 GCD 主队列消息就绪，跳转到步骤 9
│  │  6. 通知 Observer：即将进入休眠 (kCFRunLoopBeforeWaiting)
│  │  7. 线程休眠（mach_msg），等待被唤醒：
│  │     - Source1 (port-based)
│  │     - Timer 到时
│  │     - RunLoop 超时
│  │     - 被外部手动唤醒
│  │  8. 通知 Observer：从休眠中唤醒 (kCFRunLoopAfterWaiting)
│  │  9. 处理唤醒时收到的消息：
│  │      - 如果是 Timer 到时，处理 Timer
│  │      - 如果是 dispatch_async 到主队列，执行 block
│  │      - 如果是 Source1，处理 Source1
│  │  10. 处理 Blocks（步骤 9 中的回调可能通过 CFRunLoopPerformBlock 提交了新 block）
│  │  11. 根据条件判断：继续循环 → 回到步骤 2 / 退出循环 → 步骤 12
│  └──────────────────────────────────────────────────────
│
│  12. 通知 Observer：即将退出 RunLoop (kCFRunLoopExit)
└──────────────────────────────────────────────────────────
```

**步骤 1：进入 RunLoop**

`CFRunLoopRunSpecific` 函数首先通知 Observer `kCFRunLoopEntry`，表示 RunLoop 即将开始运行。AutoreleasePool 就是在这个时机创建的。随后进入 `__CFRunLoopRun` 的 do-while 循环。

**步骤 2-3：循环开始，通知 Observer**

每次循环开始时，依次通知 Observer `kCFRunLoopBeforeTimers` 和 `kCFRunLoopBeforeSources`，给外部一个在事件处理前做准备工作的机会。

**步骤 4-5：处理 Blocks、Source0 与就绪检查**

步骤 4 包含三个子步骤：先调用 `__CFRunLoopDoBlocks` 处理通过 `CFRunLoopPerformBlock` 提交的 block，然后调用 `__CFRunLoopDoSources0` 处理被标记为待处理的 Source0 事件，如果处理了 Source0 则再次调用 `__CFRunLoopDoBlocks`（因为 Source0 回调中可能又提交了新 block）。

步骤 5 中，RunLoop 快速探测 GCD 主队列的 mach port（`dispatchPort`）上是否有已到达但尚未处理的消息（超时为 0 的非阻塞检查）。如果有，跳过休眠直接跳到步骤 9 处理。

**步骤 6-7：休眠阶段**

在真正休眠之前，RunLoop 先通知 Observer `kCFRunLoopBeforeWaiting`。系统在这个时机做了三件重要的事：

1. **手势识别的回调**：触摸事件被 Source1 接收后，`UIGestureRecognizer` 不会立即执行 action，而是等到 `kCFRunLoopBeforeWaiting` 时，由系统 Observer 统一触发 `_UIGestureRecognizerUpdate`，批量处理所有手势识别器的状态更新和 action 回调。

2. **UIView/CALayer 的界面更新**：`setNeedsLayout`、`setNeedsDisplay` 等只是标记"需要更新"。在 `kCFRunLoopBeforeWaiting` 时，Core Animation 的 Observer 统一执行布局（`layoutSubviews`）、绘制（`drawRect:`）和约束更新，通过 `CATransaction` 提交渲染事务给 Render Server。

3. **AutoreleasePool 的释放与重建**：释放旧池并创建新池，释放本轮循环中产生的 autorelease 对象。

随后，RunLoop 调用 `mach_msg()` 让线程进入内核态休眠，等待 Source1/Timer/超时/手动唤醒。

**步骤 8-10：唤醒处理阶段**

线程被唤醒后，先通知 Observer `kCFRunLoopAfterWaiting`，然后根据唤醒原因处理对应的事件：

- **Timer**：调用 `__CFRunLoopDoTimers()` 执行到期的 Timer 回调
- **GCD 主队列**：调用 `__CFRUNLOOP_IS_SERVICING_THE_MAIN_DISPATCH_QUEUE__()` 执行 block
- **Source1**：调用 `__CFRunLoopDoSource1()` 处理（如触摸事件由 Source1 接收 IOKit 事件后分发）

步骤 10 再次调用 `__CFRunLoopDoBlocks` 处理步骤 9 中可能新提交的 block。

**步骤 11-12：循环判断与退出**

RunLoop 检查以下退出条件：
- 当前 Mode 是否为空（没有 Source/Timer/Observer）
- 是否超过了指定的运行时间
- 是否被 `CFRunLoopStop()` 停止
- `stopAfterHandle` 是否为 true 且已处理了事件（`runMode:beforeDate:` 模式）

不满足退出条件则回到步骤 2；满足则跳出 do-while，由 `CFRunLoopRunSpecific` 通知 Observer `kCFRunLoopExit` 后结束。

### Q4: RunLoop 在实际开发中有哪些应用？

**1. NSTimer 在滑动时失效问题**

当 ScrollView 滑动时，RunLoop 从 `NSDefaultRunLoopMode` 切换到 `UITrackingRunLoopMode`，导致添加在 DefaultMode 下的 Timer 不被触发。有两种解决方案：

- 将 Timer 添加到 `NSRunLoopCommonModes`，使其同时在 DefaultMode 和 TrackingMode 下生效
- 使用 GCD Timer（`dispatch_source_t`），它不依赖 RunLoop Mode，不受模式切换影响

**2. 子线程保活**

子线程默认执行完任务就退出。通过给子线程的 RunLoop 添加事件源（如 Port）并启动 RunLoop，可以让线程持续存活等待任务。关键点：

- 必须向 RunLoop 添加 Source（如 `NSPort`），否则 `CFRunLoopRunSpecific` 入口的 `__CFRunLoopModeIsEmpty` 检查会直接返回，RunLoop 根本不会启动
- 不要使用 `[NSRunLoop run]`，它的外层 while(1) 无条件循环，无法被 `CFRunLoopStop()` 停
- `CFRunLoopRun()` 也可以保活，并且能被 `CFRunLoopStop()` 停止，但它默认运行 DefaultMode，外层退出条件不如自定义循环灵活
- 应使用 `while + runMode:beforeDate:` 的可控循环方式，配合标志位来控制退出

```objc
__weak typeof(self) weakSelf = self;
_thread = [[NSThread alloc] initWithBlock:^{
    [[NSRunLoop currentRunLoop] addPort:[[NSPort alloc] init] forMode:NSDefaultRunLoopMode];
    while (weakSelf && !weakSelf->_stopped) {
        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
    }
}];
[_thread start];
```

**3. 卡顿监控**

利用 RunLoop Observer 监控主线程的运行状态。原理是：在子线程中用信号量等待主线程 RunLoop 的状态变化通知，如果等待超时（比如超过 50ms），且主线程处于 `kCFRunLoopBeforeSources` 或 `kCFRunLoopAfterWaiting` 状态，说明主线程在处理事件或刚唤醒后被阻塞，此时可以抓取堆栈进行分析。

需要注意的是，简单方案（单个 Observer，order=0）存在 `kCFRunLoopBeforeWaiting` 阶段的监控盲区——UI 布局/绘制、手势回调等系统 Observer 的耗时无法被捕获。微信 Matrix 通过注册两个 Observer（order 分别为 `LONG_MIN` 和 `LONG_MAX`）来包裹所有系统 Observer 的执行，从而完整覆盖这个阶段。详见 [卡顿-检测]({{< relref "/posts/interview/ios-performance/stutter-检测" >}}#beforewaiting阶段的监控盲区)。

```objc
// 创建 Observer 监听所有状态变化
CFRunLoopObserverRef observer = CFRunLoopObserverCreate(
    kCFAllocatorDefault, kCFRunLoopAllActivities, YES, 0, &runLoopObserverCallback, &context);
CFRunLoopAddObserver(CFRunLoopGetMain(), observer, kCFRunLoopCommonModes);

// Observer 回调中记录状态并发送信号
static void runLoopObserverCallback(CFRunLoopObserverRef observer, CFRunLoopActivity activity, void *info) {
    monitor->_activity = activity;
    dispatch_semaphore_signal(monitor->_semaphore);
}

// 子线程中等待信号量，超时即判定为卡顿
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    while (YES) {
        long result = dispatch_semaphore_wait(semaphore, dispatch_time(DISPATCH_TIME_NOW, 50 * NSEC_PER_MSEC));
        if (result != 0) {
            if (activity == kCFRunLoopBeforeSources || activity == kCFRunLoopAfterWaiting) {
                // 检测到卡顿，记录堆栈
            }
        }
    }
});
```

**4. 利用 RunLoop 空闲时执行低优先级任务**

在 RunLoop 即将进入休眠时（`kCFRunLoopBeforeWaiting`），注册 Observer 来执行不紧急的任务，如图片预加载、数据预处理、日志上报、缓存清理等。这样做的优势是不影响用户交互（只在空闲时执行），可以通过控制每次执行的任务数量来平衡性能。

```objc
CFRunLoopObserverRef observer = CFRunLoopObserverCreateWithHandler(
    kCFAllocatorDefault, kCFRunLoopBeforeWaiting, YES, 0,
    ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
        // 每次 RunLoop 空闲时，从任务队列取出有限数量的任务执行
        NSUInteger count = MIN(maxTasksPerRound, tasks.count);
        for (NSUInteger i = 0; i < count; i++) {
            void(^task)(void) = tasks.firstObject;
            [tasks removeObjectAtIndex:0];
            task();
        }
    });
CFRunLoopAddObserver(CFRunLoopGetMain(), observer, kCFRunLoopCommonModes);
```
