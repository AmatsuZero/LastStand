+++
title = "iOS 定时器的注意事项"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 15
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
iOS 开发中常用的定时器有 NSTimer、CADisplayLink 和 GCD Timer。它们各有特点，但在使用时都有一些需要注意的问题。

## 常见定时器类型

### 1. NSTimer

最常用的定时器，基于 RunLoop 实现：

```objc
// 自动添加到当前 RunLoop 的 DefaultMode
NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                  target:self
                                                selector:@selector(timerFired)
                                                userInfo:nil
                                                 repeats:YES];

// 手动创建，需要手动添加到 RunLoop
NSTimer *timer = [NSTimer timerWithTimeInterval:1.0
                                         target:self
                                       selector:@selector(timerFired)
                                       userInfo:nil
                                        repeats:YES];
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
```

### 2. CADisplayLink

与屏幕刷新率同步的定时器，适合做动画：

```objc
CADisplayLink *displayLink = [CADisplayLink displayLinkWithTarget:self
                                                         selector:@selector(update)];
[displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
```

### 3. GCD Timer

不依赖 RunLoop，精度更高：

```objc
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 1.0 * NSEC_PER_SEC, 0);
dispatch_source_set_event_handler(timer, ^{
    NSLog(@"GCD Timer fired");
});
dispatch_resume(timer);
```

## 注意事项一：循环引用问题

### 问题描述

NSTimer 和 CADisplayLink 在使用 target-action 模式时，会强引用 target。如果 target 又持有定时器，就会形成循环引用：

```objc
// self -> timer -> self，形成循环引用
self.timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                              target:self  // timer 强引用 self
                                            selector:@selector(tick)
                                            userInfo:nil
                                             repeats:YES];
```

即使在 `dealloc` 中调用 `[self.timer invalidate]` 也没用，因为循环引用导致 `dealloc` 永远不会被调用。

此外，NSTimer 被添加到 RunLoop 后，RunLoop 也会强引用 Timer。也就是说即使外部没有持有 timer，只要没调用 `invalidate`，timer 就不会被释放：

```
RunLoop ──strong──> timer ──strong──> target(self)
```

### 解决方案

**方案一：使用 Block API（iOS 10+）**

```objc
__weak typeof(self) weakSelf = self;
self.timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                             repeats:YES
                                               block:^(NSTimer * _Nonnull timer) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    [strongSelf tick];
}];

即使使用 Block API 打破了 timer 对 self 的强引用，RunLoop 仍然强引用 timer。如果不调用 `invalidate`，timer 本身不会释放，会在 RunLoop 中持续空转。Block API 的优势在于 self 能正常走到 `dealloc`，从而有机会在 `dealloc` 中调用 `invalidate` 来停止 timer。

// self 可以正常 dealloc，在 dealloc 中停止 timer
- (void)dealloc {
    [self.timer invalidate];
}
```

**方案二：使用 NSProxy 中间层**

NSProxy 是专门为消息转发设计的抽象基类。与 NSObject 不同，NSProxy 几乎不实现任何方法，收到消息后会直接进入消息转发流程。利用这个特性，可以创建一个弱引用 target 的代理对象来打破循环引用。

**WeakProxy 实现：**

```objc
@interface WeakProxy : NSProxy

@property (nonatomic, weak) id target;

+ (instancetype)proxyWithTarget:(id)target;

@end

@implementation WeakProxy

+ (instancetype)proxyWithTarget:(id)target {
    WeakProxy *proxy = [WeakProxy alloc];
    proxy.target = target;
    return proxy;
}

// NSProxy 直接进入消息转发，需要实现以下两个方法
- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel {
    return [self.target methodSignatureForSelector:sel];
}

- (void)forwardInvocation:(NSInvocation *)invocation {
    if (self.target) {
        [invocation invokeWithTarget:self.target];
    }
}

@end
```

**使用方式：**

```objc
// 使用 WeakProxy 打破循环：self -> timer -> proxy --weak--> self
self.timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                              target:[WeakProxy proxyWithTarget:self]
                                            selector:@selector(tick)
                                            userInfo:nil
                                             repeats:YES];
```

**原理分析：**

```
原来的循环引用：
self ──strong──> timer ──strong──> self
     <──strong──      

使用 WeakProxy 后：
self ──strong──> timer ──strong──> proxy ──weak──> self
```

当 self 没有其他强引用时，self 可以正常释放。self 释放后，proxy.target 变为 nil，timer 触发时调用的方法不会执行任何操作。

**为什么用 NSProxy 而不是 NSObject 子类？**

NSProxy 比 NSObject 更适合做代理，因为：

1. NSProxy 几乎不实现任何方法，所有消息都会转发给 target
2. NSObject 实现了很多方法（如 `isKindOfClass:`、`respondsToSelector:`），这些方法不会被转发

```objc
// 假设要代理一个 ViewController
// 使用 NSObject 子类做代理
[proxy respondsToSelector:@selector(tick)];  // 返回 NO，因为 NSObject 自己处理了

// 使用 NSProxy 子类做代理
[proxy respondsToSelector:@selector(tick)];  // 转发给 target，返回 YES
```

更多关于 NSProxy 消息转发机制的详细介绍，请参考 [Runtime - NSProxy 的消息转发](./runtime.md#nsproxy-的消息转发)。

**方案三：使用 GCD Timer**

GCD Timer 使用 block 回调，配合 weak-strong dance 可以避免循环引用：

```objc
__weak typeof(self) weakSelf = self;
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 1.0 * NSEC_PER_SEC, 0);
dispatch_source_set_event_handler(timer, ^{
    __strong typeof(weakSelf) strongSelf = weakSelf;
    [strongSelf tick];
});
dispatch_resume(timer);
self.gcdTimer = timer;
```

## 注意事项二：RunLoop Mode 问题

### 问题描述

NSTimer 和 CADisplayLink 依赖 RunLoop 运行。当 ScrollView 滑动时，主线程 RunLoop 会从 `kCFRunLoopDefaultMode` 切换到 `UITrackingRunLoopMode`，导致添加在 DefaultMode 下的定时器不触发。

```objc
// 添加到 DefaultMode，滑动时不触发
NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                  target:self
                                                selector:@selector(tick)
                                                userInfo:nil
                                                 repeats:YES];
```

### 解决方案

**方案一：添加到 CommonModes**

```objc
NSTimer *timer = [NSTimer timerWithTimeInterval:1.0
                                         target:self
                                       selector:@selector(tick)
                                       userInfo:nil
                                        repeats:YES];
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];
```

`NSRunLoopCommonModes` 不是一个真正的 Mode，而是一个 Mode 集合的标记。默认情况下包含 `kCFRunLoopDefaultMode` 和 `UITrackingRunLoopMode`，也可以通过 `CFRunLoopAddCommonMode` 动态添加其他 Mode。将 Timer 添加到 CommonModes 后，Timer 会在集合中所有 Mode 下都能运行。

**方案二：使用 GCD Timer**

GCD Timer 不依赖 RunLoop，不受 Mode 切换影响：

```objc
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 1.0 * NSEC_PER_SEC, 0);
dispatch_source_set_event_handler(timer, ^{
    NSLog(@"即使滑动也能触发");
});
dispatch_resume(timer);
```

## 注意事项三：子线程使用定时器

### 问题描述

子线程的 RunLoop 默认不启动，直接在子线程添加 NSTimer 不会生效：

```objc
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    // 这个 timer 不会触发！
    NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                      target:self
                                                    selector:@selector(tick)
                                                    userInfo:nil
                                                     repeats:YES];
});
```

### 解决方案

**方案一：手动启动 RunLoop**

```objc
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                      target:self
                                                    selector:@selector(tick)
                                                    userInfo:nil
                                                     repeats:YES];
    [[NSRunLoop currentRunLoop] run];
});
```

需要注意的是，`[[NSRunLoop currentRunLoop] run]` 启动的 RunLoop 几乎无法停止（即使移除所有 input source，`run` 方法内部会自动重启 RunLoop）。如果需要可控地停止 RunLoop，建议使用 `runUntilDate:` 或 `runMode:beforeDate:` 配合条件判断：

```objc
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    @autoreleasepool {
        NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                          target:self
                                                        selector:@selector(tick)
                                                        userInfo:nil
                                                         repeats:YES];
        NSRunLoop *runLoop = [NSRunLoop currentRunLoop];
        while (!self.shouldStopTimer) {
            [runLoop runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.5]];
        }
    }
});
```

**方案二：使用 GCD Timer**

GCD Timer 不需要 RunLoop，可以在任意队列使用：

```objc
dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 1.0 * NSEC_PER_SEC, 0);
dispatch_source_set_event_handler(timer, ^{
    NSLog(@"子线程定时器触发");
});
dispatch_resume(timer);
```

## 注意事项四：定时器精度问题

### NSTimer / CADisplayLink 精度问题

NSTimer 和 CADisplayLink 都依赖 RunLoop 驱动，因此精度都受 RunLoop 状态影响：

1. **RunLoop 繁忙时**：如果主线程正在处理耗时任务（如大量布局计算、图片解码等），回调会被延迟。对于 CADisplayLink 来说，这意味着丢帧
2. **容差（Tolerance）**：NSTimer 支持设置 tolerance，系统会根据 tolerance 合并多个 Timer 的触发时机，节省电量

```objc
NSTimer *timer = [NSTimer timerWithTimeInterval:1.0
                                         target:self
                                       selector:@selector(tick)
                                       userInfo:nil
                                        repeats:YES];
timer.tolerance = 0.1;  // 允许 0.1 秒的误差
```

### CADisplayLink 特点

CADisplayLink 与屏幕刷新同步（通常 60Hz 或 120Hz），适合需要与帧率同步的场景，但同样受 RunLoop 繁忙影响。如果某一帧主线程耗时过长，CADisplayLink 的回调会被推迟到下一次 RunLoop 迭代，表现为掉帧：

```objc
CADisplayLink *displayLink = [CADisplayLink displayLinkWithTarget:self
                                                         selector:@selector(update)];
// iOS 15+，推荐使用 preferredFrameRateRange
if (@available(iOS 15.0, *)) {
    displayLink.preferredFrameRateRange = CAFrameRateRangeMake(30, 60, 60);
} else {
    displayLink.preferredFramesPerSecond = 60;  // iOS 15 之前使用，iOS 15+ 已废弃
}
[displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
```

### GCD Timer 精度

GCD Timer 精度最高，可以指定允许的误差：

```objc
dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
// 参数：定时器，开始时间，间隔，允许误差（leeway）
dispatch_source_set_timer(timer, 
                          DISPATCH_TIME_NOW, 
                          1.0 * NSEC_PER_SEC,      // 1秒间隔
                          0.1 * NSEC_PER_SEC);     // 允许0.1秒误差
```

## 注意事项五：正确销毁定时器

### NSTimer / CADisplayLink

必须调用 `invalidate` 才能停止并释放：

```objc
// NSTimer
[self.timer invalidate];
self.timer = nil;

// CADisplayLink
[self.displayLink invalidate];
self.displayLink = nil;
```

注意：`invalidate` 必须在定时器所注册的 RunLoop 所在的线程调用。例如在主线程创建并添加到主 RunLoop 的 timer，就必须在主线程调用 `invalidate`。

### GCD Timer

使用 `dispatch_source_cancel` 取消：

```objc
if (self.gcdTimer) {
    dispatch_source_cancel(self.gcdTimer);
    self.gcdTimer = nil;
}
```

注意：不能对一个尚未 resume（处于 suspended 状态）的 `dispatch_source_t` 直接 cancel 后释放，这会导致崩溃。如果 timer 可能还没 resume 就需要销毁，需先 resume 再 cancel：

```objc
if (self.gcdTimer) {
    // 如果 timer 可能处于 suspended 状态，先 resume 再 cancel
    dispatch_resume(self.gcdTimer);
    dispatch_source_cancel(self.gcdTimer);
    self.gcdTimer = nil;
}
```

## 定时器选型建议

| 场景 | 推荐定时器 | 原因 |
|------|-----------|------|
| 普通延时/周期任务 | NSTimer (Block API) | 简单易用，iOS 10+ 无循环引用 |
| 动画帧同步 | CADisplayLink | 与屏幕刷新同步 |
| 高精度定时 | GCD Timer | 精度最高，不受 RunLoop 影响 |
| 后台任务 | GCD Timer | 不依赖 RunLoop |
| 滑动时需触发 | GCD Timer 或 CommonModes | 不受 Mode 切换影响 |

## 常见面试题

### Q: Timer 的使用注意事项有哪些？

1. **循环引用**：NSTimer/CADisplayLink 使用 target-action 模式会强引用 target，如果 target 又持有 timer 就形成循环引用，导致双方都无法释放。解决方案有三种：使用 Block API（iOS 10+）配合 weak-strong dance；使用 NSProxy 中间层弱引用 target 来打破引用环；或者改用基于 block 的 GCD Timer

2. **RunLoop Mode 切换**：NSTimer/CADisplayLink 依赖 RunLoop 驱动。当 ScrollView 滑动时，主线程 RunLoop 会从 `kCFRunLoopDefaultMode` 切换到 `UITrackingRunLoopMode`，添加在 DefaultMode 下的定时器就不会触发。解决方案是将 Timer 添加到 `NSRunLoopCommonModes`（同时覆盖 Default 和 Tracking 两个 Mode），或使用不依赖 RunLoop 的 GCD Timer

3. **子线程 RunLoop**：子线程的 RunLoop 默认不启动，直接在子线程创建 NSTimer 不会触发。需要手动调用 `[[NSRunLoop currentRunLoop] run]` 启动 RunLoop，但要注意 `run` 方法启动的 RunLoop 几乎无法停止，建议使用 `runMode:beforeDate:` 配合条件判断来实现可控退出。GCD Timer 不依赖 RunLoop，无此问题

4. **精度**：NSTimer/CADisplayLink 的精度受 RunLoop 繁忙程度影响，主线程有耗时任务时回调会被延迟。NSTimer 支持设置 `tolerance` 属性，系统会据此合并多个 Timer 的触发时机以节省电量。GCD Timer 不依赖 RunLoop，精度最高，可以通过 leeway 参数精确控制允许的误差

5. **正确销毁**：Timer 被添加到 RunLoop 后，RunLoop 会强引用 Timer，即使使用 Block API 打破了 timer 对 self 的强引用，timer 本身仍被 RunLoop 持有不会释放，Block API 的真正优势是让 self 能正常 dealloc，从而有机会在 `dealloc` 中调用 `invalidate` 来停止 timer。NSTimer/CADisplayLink 必须调用 `invalidate` 才能从 RunLoop 中移除并释放，且必须在 timer 所注册的 RunLoop 所在线程调用。GCD Timer 使用 `dispatch_source_cancel` 取消，但需注意不能对 suspended 状态的 `dispatch_source_t` 直接释放，否则会触发 EXC_BAD_INSTRUCTION 崩溃，需先 resume 再 cancel
