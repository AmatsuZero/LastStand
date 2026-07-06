+++
title = "启动优化-load方法"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 5
tags = ["iOS", "性能优化", "启动"]
categories = ["iOS开发", "性能优化"]
+++
`+load`方法是ObjC运行时在类被加载时自动调用的方法，所有`+load`方法在main函数之前同步执行，会阻塞启动。

---

## 问题分析

`+load`方法的特点：

| 特性 | 说明 |
|-----|------|
| 调用时机 | main函数之前，ObjC Runtime初始化时 |
| 调用顺序 | 父类 → 子类 → Category |
| 线程 | 主线程，同步执行 |
| 影响 | 直接阻塞启动 |

```objc
// 问题代码：+load中执行耗时操作
@implementation HeavyModule
+ (void)load {
    // 耗时操作会阻塞启动
    [self setupDatabase];
    [self preloadResources];
    [self registerServices];
}
@end
```

---

## +load与+initialize的区别

| 特性 | +load | +initialize |
|------|-------|-------------|
| 调用时机 | main之前 | 类首次使用时 |
| 调用次数 | 只调用一次 | 可能多次（子类触发） |
| 是否阻塞启动 | 是 | 否 |
| 线程安全 | 是 | 是 |
| 调用顺序 | 父类→子类→Category | 父类→子类 |

> 更详细的对比请参考：[+load与+initialize的区别](../../ios-basics/load与initialize的区别.md)

---

## 优化方案

### 方案1：使用+initialize替代

将`+load`中的逻辑迁移到`+initialize`，延迟到类首次使用时执行：

```objc
@implementation HeavyModule

// 优化前
+ (void)load {
    [self setupDatabase];
}

// 优化后
+ (void)initialize {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // 延迟到类首次使用时执行
        [self setupDatabase];
    });
}

@end
```

> **注意**：`+initialize`可能被子类触发多次调用，需要使用`dispatch_once`保证只执行一次。

### 方案2：延迟到启动完成后执行

只在`+load`中做轻量级注册，将实际工作延迟到启动完成后：

```objc
@implementation HeavyModule

+ (void)load {
    // 只做轻量级注册
    [[LaunchTaskManager shared] registerTask:^{
        [self setupDatabase];
        [self preloadResources];
    }];
}

@end
```

启动任务管理器的实现：

```swift
class LaunchTaskManager {
    static let shared = LaunchTaskManager()
    
    private var tasks: [() -> Void] = []
    
    func registerTask(_ task: @escaping () -> Void) {
        tasks.append(task)
    }
    
    func executeTasks() {
        // 在首帧渲染后执行
        DispatchQueue.main.async {
            for task in self.tasks {
                task()
            }
            self.tasks.removeAll()
        }
    }
}
```

### 方案3：使用静态注册替代动态注册

很多`+load`的使用场景是为了注册某些服务或路由，可以改用静态注册：

```objc
// 优化前：动态注册
@implementation ModuleA
+ (void)load {
    [[Router shared] registerPath:@"/moduleA" handler:self];
}
@end

// 优化后：静态注册（在plist或代码中配置）
// 在AppDelegate中统一注册
- (void)setupRoutes {
    NSDictionary *routes = @{
        @"/moduleA": @"ModuleA",
        @"/moduleB": @"ModuleB",
    };
    [[Router shared] registerRoutes:routes];
}
```

### 方案4：使用Swift替代ObjC

Swift没有`+load`方法，可以使用懒加载或其他方式实现相同功能：

```swift
class HeavyModule {
    // 使用懒加载，首次访问时才初始化
    static let shared: HeavyModule = {
        let instance = HeavyModule()
        instance.setupDatabase()
        return instance
    }()
    
    private func setupDatabase() {
        // 数据库初始化
    }
}
```

---

## 如何找出所有+load方法

### 方法1：使用Instruments

在Instruments的Time Profiler中可以看到所有`+load`方法的调用和耗时。

### 方法2：使用脚本扫描

```bash
# 在项目目录下搜索所有+load方法
grep -r "+ (void)load" --include="*.m" .
```
