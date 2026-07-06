+++
title = "耗电-CPU与后台优化"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 10
tags = ["iOS", "性能优化", "耗电"]
categories = ["iOS开发", "性能优化"]
+++
CPU是App最容易"无意识"耗电的模块，而后台则是最容易"偷偷"耗电的场景。本文聚焦这两大问题域，给出具体的优化手段。

---

## 一、CPU耗电的根本原因

根据 [耗电-原理](./耗电-原理.md) 中的分析，CPU耗电由三部分构成：

1. **活跃时间**：CPU处于C0/P0的时间。
2. **瞬时功率**：和P-State频率相关。
3. **唤醒次数**：频繁从C-State唤醒无法进入深度休眠。

对应三条优化方向：

| 优化方向 | 策略                           |
| ---- | ---------------------------- |
| 减少活跃 | 任务及时结束，该停就停                  |
| 降低功率 | 避免无谓的满核满频，使用合适的QoS            |
| 合并唤醒 | 聚合Timer、聚合任务，让CPU能连续工作后进入深休眠 |

---

## 二、识别CPU耗电热点

### 从MetricKit入手

`cumulativeCPUTime` 是线上最直接的CPU指标。对比同版本前后、同机型前后的CPU时长，能快速定位回归。

### Time Profiler的使用技巧

在Instruments中抓一份Time Profiler Trace后：

1. 按"Heavy Stack"视图查看耗时函数。
2. 关注**后台**的采样（通过Xcode的生命周期切换复现）。
3. 查看**线程调用频率**——单次耗时低但高频调用的函数，同样是耗电大头。

### 代码层面的CPU异味

```swift
// 1. 死循环轮询
while isWaitingForData {
    if dataReady { break }
}

// 2. 主线程sleep循环
DispatchQueue.global().async {
    while true {
        checkStatus()
        Thread.sleep(forTimeInterval: 0.1)
    }
}

// 3. 密集Timer
Timer.scheduledTimer(withTimeInterval: 0.016, repeats: true) { _ in
    self.updateUI()
}

// 4. 无限制的CADisplayLink
displayLink = CADisplayLink(target: self, selector: #selector(tick))
displayLink.add(to: .main, forMode: .common)
// 页面隐藏后忘记invalidate
```

这些代码在Time Profiler中都会显示出异常高的调用频率。

---

## 三、Timer与高频任务优化

### Timer的唤醒代价

每一个活跃的NSTimer/DispatchTimer都会阻止CPU进入深度C-State。一个1秒Timer + 一个500ms Timer + 一个300ms Timer，可能让CPU每秒醒3~4次。

### 优化策略

#### 1. 合并Timer

```swift
// Bad: 三个Timer各跑各的
Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in updateClock() }
Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in updateUnread() }
Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in updateLocation() }

// Good: 共用一个统一调度器
class TickScheduler {
    static let shared = TickScheduler()
    private var handlers: [() -> Void] = []
    private var timer: Timer?
    
    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            self?.handlers.forEach { $0() }
        }
    }
    
    func register(_ handler: @escaping () -> Void) {
        handlers.append(handler)
    }
}
```

#### 2. 合理使用DispatchSourceTimer的tolerance

```swift
let timer = DispatchSource.makeTimerSource(queue: .main)
// 间隔10秒，但允许5秒的容忍度，系统会合并相邻唤醒
timer.schedule(deadline: .now() + 10, repeating: 10, leeway: .seconds(5))
```

苹果在WWDC明确推荐：非精确任务给足tolerance，系统才能把你的唤醒合并到其他任务上。

#### 3. CADisplayLink的生命周期

```swift
class ChartView: UIView {
    private var displayLink: CADisplayLink?
    
    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil {
            startDisplayLink()
        } else {
            stopDisplayLink()
        }
    }
    
    private func startDisplayLink() {
        stopDisplayLink()
        let link = CADisplayLink(target: self, selector: #selector(tick))
        if #available(iOS 15.0, *) {
            // ProMotion下降低刷新率
            link.preferredFrameRateRange = CAFrameRateRange(minimum: 30, maximum: 60, preferred: 30)
        }
        link.add(to: .main, forMode: .common)
        displayLink = link
    }
    
    private func stopDisplayLink() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    @objc private func tick() {
        setNeedsDisplay()
    }
}
```

### 避免轮询，拥抱事件驱动

```swift
// Bad: 轮询业务状态
Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
    if DataCenter.shared.isReady {
        self.loadUI()
    }
}

// Good: 事件通知
NotificationCenter.default.addObserver(
    forName: .dataCenterReady,
    object: nil,
    queue: .main
) { [weak self] _ in
    self?.loadUI()
}
```

对于网络相关状态，使用 `NWPathMonitor` 的回调而不是轮询 `Reachability`。

---

## 四、GCD与QoS

### QoS的含义

QoS（Quality of Service）告诉系统某个任务的优先级。系统根据QoS决定：

- 调度到大核还是小核。
- 线程优先级。
- IO优先级。
- CPU频率档位。

| QoS                  | 典型场景               | 能效特征       |
| -------------------- | ------------------ | ---------- |
| .userInteractive     | 动画、主线程直接依赖         | 高优先级、大核、高频 |
| .userInitiated       | 用户触发的UI加载          | 较高         |
| .default             | 普通任务               | 中等         |
| .utility             | 长耗时但用户可等的任务（下载、导出） | 偏节能，可能调度到小核 |
| .background          | 索引、同步、备份           | 节能优先，低优先级  |
| .unspecified / 0     | 未指定                | 视情况推断      |

### 滥用 .userInteractive 是耗电大坑

```swift
// Bad: 下载任务用.userInteractive，阻止CPU降频
DispatchQueue.global(qos: .userInteractive).async {
    self.downloadHugeFile()
}

// Good: 根据任务性质选择
DispatchQueue.global(qos: .utility).async {
    self.downloadHugeFile()
}
```

### QoS反转陷阱

如果高QoS任务等待低QoS任务的锁，系统会临时提升低QoS任务的优先级（Priority Inversion），打破能效规划。尽量让同一资源上的所有任务使用相同QoS。

---

## 五、后台任务的正确打开方式

iOS的后台执行模型是"默认挂起，少量例外"。想要在后台跑代码，必须使用系统支持的机制。滥用后台权限是耗电投诉的头号原因。

### 后台模式一览

| 模式                       | 用途              | 风险                |
| ------------------------ | --------------- | ----------------- |
| Audio                    | 后台播放音频          | 假播放被审查            |
| Location                 | 后台定位            | 必须"合理"使用          |
| VoIP                     | 网络电话            | iOS 13后已被PushKit限制 |
| External Accessory       | 外设              | 较冷门               |
| Background Fetch（iOS 13-） | 定时拉数据           | 已被BackgroundTasks替代 |
| Background Tasks         | 后台处理、刷新         | 推荐                |
| Bluetooth                | 蓝牙后台            | 有严格审核             |
| Silent Push              | 静默推送            | 高频被系统降级           |

### BackgroundTasks框架（推荐）

从iOS 13开始，苹果推出 `BackgroundTasks` 框架，它是目前最推荐的后台调度方式。

#### 注册任务

```swift
// AppDelegate
func application(_ application: UIApplication, didFinishLaunchingWithOptions ...) {
    
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.example.refresh",
        using: nil
    ) { task in
        self.handleRefresh(task: task as! BGAppRefreshTask)
    }
    
    BGTaskScheduler.shared.register(
        forTaskWithIdentifier: "com.example.processing",
        using: nil
    ) { task in
        self.handleProcessing(task: task as! BGProcessingTask)
    }
}
```

#### 提交任务

```swift
func scheduleRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.example.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 30 * 60) // 30分钟后
    try? BGTaskScheduler.shared.submit(request)
}

func scheduleLongProcessing() {
    let request = BGProcessingTaskRequest(identifier: "com.example.processing")
    request.requiresNetworkConnectivity = true
    request.requiresExternalPower = true   // 只在充电时执行
    try? BGTaskScheduler.shared.submit(request)
}
```

#### 执行任务

```swift
private func handleRefresh(task: BGAppRefreshTask) {
    scheduleRefresh() // 立即注册下一次
    
    let operation = RefreshOperation()
    
    task.expirationHandler = {
        operation.cancel()
    }
    
    operation.completionBlock = {
        task.setTaskCompleted(success: !operation.isCancelled)
    }
    
    OperationQueue().addOperation(operation)
}
```

### BGAppRefreshTask vs BGProcessingTask

| 能力          | BGAppRefreshTask | BGProcessingTask                      |
| ----------- | ---------------- | ------------------------------------- |
| 预算          | 约30秒             | 数分钟（系统决定）                             |
| 前置要求        | 无                | 可要求充电、可要求网络                           |
| 典型场景        | 后台刷Feed          | 图片压缩、数据同步、ML训练                        |
| 最少间隔        | 系统调度             | 系统调度（通常夜间）                            |

### 后台音频的能效陷阱

"假播放"是Apple审核的重点打击对象：很多App为了在后台保持运行，用静音音频欺骗系统。这不仅违规，也会让CPU和音频子系统持续耗电。

正确做法：

- 真正的音频App才申请audio后台模式。
- 其他需要后台运行的场景，使用BackgroundTasks或Silent Push。

### 后台定位的能效陷阱

参见 [耗电-定位与传感器优化](./耗电-定位与传感器优化.md) 中的详细讲解。简单原则：

- 后台定位只在确实需要时开启，必须在功能完成后停止。
- 优先使用SignificantLocationChanges/Region Monitoring。

---

## 六、beginBackgroundTask的合理使用

`UIApplication.beginBackgroundTask` 是经典的"多给一点时间"API，用于让App切换到后台后还能完成一些收尾工作（最多约30秒）。

### 正确用法

```swift
class UploadManager {
    
    private var bgTask: UIBackgroundTaskIdentifier = .invalid
    
    func uploadImportantData(_ data: Data) {
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "UploadImportant") { [weak self] in
            // 时间即将耗尽，必须结束
            self?.endBackgroundTask()
        }
        
        APIClient.upload(data) { [weak self] result in
            self?.endBackgroundTask()
        }
    }
    
    private func endBackgroundTask() {
        if bgTask != .invalid {
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = .invalid
        }
    }
}
```

### 常见错误

```swift
// Bad: 申请了没结束 → 耗尽时间被强杀 + 完整30秒都在CPU上
bgTask = UIApplication.shared.beginBackgroundTask()
doSomething()
// 忘了 endBackgroundTask

// Bad: 嵌套多个BG Task
bgTask1 = ...beginBackgroundTask()
bgTask2 = ...beginBackgroundTask()
bgTask3 = ...beginBackgroundTask()
// 资源未释放

// Bad: 在BG Task里跑密集CPU任务
bgTask = ...beginBackgroundTask()
DispatchQueue.global().async {
    self.intensiveComputation()  // 应该使用BGProcessingTask
}
```

---

## 七、Silent Push的滥用代价

Silent Push（`content-available: 1`）可以让App在后台被唤起处理数据。但iOS会监控它：

- 触发App执行但长时间高CPU → 被降级，下次推送可能几小时才下发。
- 未调用 `completionHandler(.newData)` → 被系统认为是垃圾推送。
- 用户不使用App → 系统彻底延后推送。

建议：

- Silent Push用于 **"必要且轻量"** 的场景。
- 所有推送入口都要在完成后立即 `completionHandler`。
- 避免用Silent Push做数据轮询。

---

## 八、锁与线程竞争

线程竞争会导致：

- 高QoS线程反复被唤醒。
- CPU在线程切换（Context Switch）上浪费。
- 间接导致电量消耗。

### 减少锁竞争

```swift
// Bad: 粗粒度锁
class Cache {
    private let lock = NSLock()
    private var dict: [String: Data] = [:]
    
    func get(_ key: String) -> Data? {
        lock.lock(); defer { lock.unlock() }
        return dict[key]
    }
}

// Good: 并发队列 + barrier
class Cache {
    private let queue = DispatchQueue(label: "cache", attributes: .concurrent)
    private var dict: [String: Data] = [:]
    
    func get(_ key: String) -> Data? {
        queue.sync { dict[key] }
    }
    
    func set(_ key: String, value: Data) {
        queue.async(flags: .barrier) { self.dict[key] = value }
    }
}

// Better: 使用os_unfair_lock / NSLock的短临界区
```

### 避免Spin Lock + 忙等

```swift
// Bad: 自旋等异步结果
while !isFinished {
    // CPU空转 → 大核满频
}

// Good: 信号量阻塞等待
let sem = DispatchSemaphore(value: 0)
asyncTask { sem.signal() }
sem.wait()
```

---

## 九、后台低功耗检查清单

每个接入后台能力的模块，研发与测试都应过一遍下列清单：

- [ ] 申请了哪种后台能力？是否必要？
- [ ] 后台任务的完成条件是什么？是否能在预算内完成？
- [ ] 所有 `beginBackgroundTask` 都成对调用了 `endBackgroundTask`？
- [ ] 所有Timer/DisplayLink在进入后台后是否暂停？
- [ ] 所有定位/传感器是否在后台按策略关闭/降级？
- [ ] 是否监听了Thermal状态并在critical时主动降级？
- [ ] 是否监听了Low Power Mode并执行降级策略？

---

## 小结

| 维度    | 关键优化点                                        |
| ----- | -------------------------------------------- |
| Timer | 合并、加tolerance、随视图生命周期管理                      |
| 轮询    | 改为事件驱动（Notification、Path Monitor、KVO、Combine） |
| QoS   | 谨慎使用userInteractive，长任务用utility               |
| 后台    | 使用BackgroundTasks替代旧API，避免滥用音频/定位            |
| Push  | Silent Push精简、及时回调                           |
| 锁     | 细粒度、避免忙等、避免QoS反转                             |

接下来进入 [耗电-网络优化](./耗电-网络优化.md)，看看网络请求如何影响耗电。
