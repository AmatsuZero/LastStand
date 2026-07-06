+++
title = "启动优化-didFinishLaunching"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 4
tags = ["iOS", "性能优化", "启动"]
categories = ["iOS开发", "性能优化"]
+++
`didFinishLaunchingWithOptions`是main阶段的核心入口，在这里初始化大量SDK和服务会阻塞启动。本文介绍如何优化这个阶段的耗时。

---

## 问题分析

典型的问题代码：

```swift
func application(_ application: UIApplication, 
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    // 所有初始化都在主线程同步执行
    CrashReporter.setup()
    Analytics.setup()
    PushNotification.setup()
    NetworkManager.setup()
    DatabaseManager.setup()
    ImageCache.setup()
    AdSDK.setup()
    SocialSDK.setup()
    // ... 更多SDK
    
    return true
}
```

这种写法的问题：

1. 所有初始化都在主线程同步执行
2. 无论是否需要，所有SDK都在启动时初始化
3. 阻塞首帧渲染

---

## 优化方案

### 方案1：分级启动任务管理

将启动任务按优先级分类，只在启动时执行必要的任务：

```swift
// 启动任务优先级
enum LaunchTaskPriority {
    case required      // 必须在首帧前完成
    case high          // 首帧后立即执行
    case normal        // 首屏稳定后执行
    case low           // 空闲时执行
}

// 启动任务管理器
class LaunchTaskManager {
    static let shared = LaunchTaskManager()
    
    private var tasks: [LaunchTaskPriority: [() -> Void]] = [:]
    
    func register(priority: LaunchTaskPriority, task: @escaping () -> Void) {
        if tasks[priority] == nil {
            tasks[priority] = []
        }
        tasks[priority]?.append(task)
    }
    
    func executeRequiredTasks() {
        tasks[.required]?.forEach { $0() }
    }
    
    func executeHighPriorityTasks() {
        DispatchQueue.main.async {
            self.tasks[.high]?.forEach { $0() }
        }
    }
    
    func executeNormalTasks() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.tasks[.normal]?.forEach { $0() }
        }
    }
    
    func executeLowPriorityTasks() {
        // 监听RunLoop空闲时执行
        CFRunLoopPerformBlock(CFRunLoopGetMain(), kCFRunLoopDefaultMode) {
            self.tasks[.low]?.forEach { $0() }
        }
    }
}
```

### 使用示例

```swift
func application(_ application: UIApplication, 
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    let manager = LaunchTaskManager.shared
    
    // 必须在首帧前完成
    manager.register(priority: .required) {
        CrashReporter.setup()  // 崩溃收集必须最先初始化
    }
    
    // 首帧后立即执行
    manager.register(priority: .high) {
        Analytics.setup()
        PushNotification.setup()
    }
    
    // 首屏稳定后执行
    manager.register(priority: .normal) {
        AdSDK.setup()
        SocialSDK.setup()
    }
    
    // 空闲时执行
    manager.register(priority: .low) {
        PreloadManager.preloadResources()
    }
    
    // 只执行必须的任务
    manager.executeRequiredTasks()
    
    return true
}
```

### 任务分级建议

| 优先级 | 适用场景 | 示例 |
|-------|---------|------|
| required | 崩溃收集、核心功能依赖 | Crash SDK、必要的配置加载 |
| high | 用户可能很快用到 | 推送、统计、网络配置 |
| normal | 非首屏功能 | 广告SDK、社交分享 |
| low | 预加载、缓存 | 图片预加载、数据预热 |

---

### 方案2：并行初始化

将无依赖关系的初始化任务并行执行：

```swift
class ParallelLaunchManager {
    
    static func execute() {
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "launch.parallel", attributes: .concurrent)
        
        // 并行执行无依赖的初始化
        group.enter()
        queue.async {
            NetworkManager.setup()
            group.leave()
        }
        
        group.enter()
        queue.async {
            DatabaseManager.setup()
            group.leave()
        }
        
        group.enter()
        queue.async {
            ImageCache.setup()
            group.leave()
        }
        
        // 等待所有任务完成
        group.wait()
    }
}
```

### 注意事项

并行初始化需要注意：

1. **线程安全**：确保初始化代码是线程安全的
2. **依赖关系**：有依赖关系的任务不能并行
3. **主线程操作**：UI相关的初始化必须在主线程

```swift
// 处理有依赖关系的任务
class DependencyAwareLaunchManager {
    
    static func execute() {
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "launch.parallel", attributes: .concurrent)
        
        // 阶段1：无依赖的任务并行执行
        group.enter()
        queue.async {
            ConfigManager.setup()  // 配置加载
            group.leave()
        }
        
        group.enter()
        queue.async {
            CacheManager.setup()   // 缓存初始化
            group.leave()
        }
        
        group.wait()  // 等待阶段1完成
        
        // 阶段2：依赖阶段1结果的任务
        group.enter()
        queue.async {
            // NetworkManager依赖ConfigManager
            NetworkManager.setup()
            group.leave()
        }
        
        group.wait()
    }
}
```

---

### 方案3：使用RunLoop空闲时机

利用RunLoop的空闲时机执行低优先级任务：

```swift
class IdleTaskExecutor {
    
    static func executeWhenIdle(_ task: @escaping () -> Void) {
        // 在RunLoop空闲时执行
        CFRunLoopPerformBlock(CFRunLoopGetMain(), kCFRunLoopDefaultMode) {
            task()
        }
        CFRunLoopWakeUp(CFRunLoopGetMain())
    }
    
    // 或者使用CADisplayLink监听空闲
    static func executeAfterFirstFrame(_ task: @escaping () -> Void) {
        var displayLink: CADisplayLink?
        var frameCount = 0
        
        displayLink = CADisplayLink(target: BlockWrapper {
            frameCount += 1
            if frameCount >= 2 {  // 等待2帧后执行
                task()
                displayLink?.invalidate()
                displayLink = nil
            }
        }, selector: #selector(BlockWrapper.invoke))
        
        displayLink?.add(to: .main, forMode: .common)
    }
}

// 辅助类
class BlockWrapper: NSObject {
    let block: () -> Void
    
    init(_ block: @escaping () -> Void) {
        self.block = block
    }
    
    @objc func invoke() {
        block()
    }
}
```
