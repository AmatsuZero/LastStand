+++
title = "iOS多线程编程"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 28
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
iOS多线程方案对比

| 方案          | 简介                     | 语言         | 生命周期管理 |
| ----------- | ---------------------- | ---------- | ------ |
| pthread     | POSIX标准的多线程API         | C          | 手动管理   |
| NSThread    | 面向对象的线程封装              | OC/Swift   | 手动管理   |
| GCD         | Grand Central Dispatch | C/OC/Swift | 自动管理   |
| NSOperation | 基于GCD的面向对象封装           | OC/Swift   | 自动管理   |

## pthread

pthread是POSIX标准的多线程API，是最底层的多线程方案，使用C语言编写。

```c
#import <pthread.h>

void *threadFunction(void *param) {
    NSLog(@"pthread执行任务: %@", [NSThread currentThread]);
    return NULL;
}

- (void)createPthread {
    pthread_t thread;
    pthread_create(&thread, NULL, threadFunction, NULL);
}
```

**特点**：
- 跨平台，可移植性强
- 使用复杂，需要手动管理线程生命周期
- 实际开发中很少直接使用

## NSThread

NSThread是苹果对pthread的面向对象封装，使用更加简单。

### 创建线程的方式

```objc
// 方式1：实例方法创建，需要手动启动
NSThread *thread = [[NSThread alloc] initWithTarget:self 
                                           selector:@selector(doTask) 
                                             object:nil];
thread.name = @"MyThread";
[thread start];

// 方式2：类方法创建，自动启动
[NSThread detachNewThreadSelector:@selector(doTask) 
                         toTarget:self 
                       withObject:nil];

// 方式3：隐式创建
[self performSelectorInBackground:@selector(doTask) withObject:nil];
```

### 常用方法

```objc
// 获取当前线程
NSThread *currentThread = [NSThread currentThread];

// 获取主线程
NSThread *mainThread = [NSThread mainThread];

// 判断是否是主线程
BOOL isMain = [NSThread isMainThread];

// 线程休眠
[NSThread sleepForTimeInterval:2.0];
[NSThread sleepUntilDate:[NSDate dateWithTimeIntervalSinceNow:2.0]];

// 退出当前线程
[NSThread exit];
```

### 线程间通信

```objc
// 回到主线程执行
[self performSelectorOnMainThread:@selector(updateUI) 
                       withObject:nil 
                    waitUntilDone:NO];

// 在指定线程执行
[self performSelector:@selector(doTask) 
             onThread:thread 
           withObject:nil 
        waitUntilDone:NO];
```

## GCD（Grand Central Dispatch）

GCD是苹果推出的多线程解决方案，基于C语言实现，自动管理线程的生命周期。GCD的核心概念是 **队列（Queue）** 和**任务（Task）**。

### 队列类型

**串行队列（Serial Queue）**：
- 任务按照FIFO顺序一个接一个执行
- 同一时间只有一个任务在执行

```objc
dispatch_queue_t serialQueue = dispatch_queue_create("com.example.serial", DISPATCH_QUEUE_SERIAL);
```

**并发队列（Concurrent Queue）**：
- 任务可以并发执行
- 开启多少条线程由GCD内部根据系统资源决定，开发者无法直接控制

```objc
dispatch_queue_t concurrentQueue = dispatch_queue_create("com.example.concurrent", DISPATCH_QUEUE_CONCURRENT);
```

**主队列（Main Queue）**：
- 特殊的串行队列，任务在主线程上执行
- 用于UI更新操作

```objc
dispatch_queue_t mainQueue = dispatch_get_main_queue();
```

**全局并发队列（Global Queue）**：
- 系统提供的并发队列，全局共享
- 通过Quality of Service（QoS）指定优先级：`QOS_CLASS_USER_INTERACTIVE`（最高）> `QOS_CLASS_USER_INITIATED` > `QOS_CLASS_DEFAULT` > `QOS_CLASS_UTILITY` > `QOS_CLASS_BACKGROUND`（最低）

```objc
dispatch_queue_t globalQueue = dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0);
```

### 同步与异步执行

同步和异步描述的是**任务的派发方式**，决定的是**当前线程是否需要等待**：

- **同步（sync）**：将任务提交到队列后，**阻塞**当前线程，直到该任务执行完毕才继续往下执行。不具备开启新线程的能力。
- **异步（async）**：将任务提交到队列后，**立即返回**，当前线程可以继续执行后续代码。具备开启新线程的能力（但不一定会开，例如异步提交到主队列不会开新线程）。

```objc
// 同步执行 - 阻塞当前线程，等待block执行完毕后才返回
dispatch_sync(queue, ^{
    NSLog(@"同步任务");
});
NSLog(@"同步任务完成后才会打印");

// 异步执行 - 不阻塞当前线程，立即返回
dispatch_async(queue, ^{
    NSLog(@"异步任务");
});
NSLog(@"这行代码不需要等待异步任务完成");
```

### 队列与执行方式组合

| 组合 | 串行队列 | 并发队列 | 主队列 |
|------|----------|----------|--------|
| 同步执行 | 不开新线程，串行执行 | 不开新线程，串行执行 | 在主线程中调用会死锁（子线程调用不会死锁） |
| 异步执行 | 开1条新线程，串行执行 | 开多条新线程，并发执行 | 不开新线程，串行执行 |

### 常用GCD函数

| 函数                           | 作用                          | 应用场景                      |
| ---------------------------- | --------------------------- | ------------------------- |
| `dispatch_after`             | 延迟执行任务                      | 延迟弹窗、延迟加载、倒计时             |
| `dispatch_once`              | 保证代码只执行一次                   | 单例模式、一次性初始化               |
| `dispatch_group`             | 管理一组任务，监听任务组完成              | 多个网络请求完成后刷新UI、批量下载        |
| `dispatch_group_enter/leave` | 手动管理调度组的任务计数                | 监听多个异步回调任务的完成             |
| `dispatch_barrier`           | 栅栏函数，等待前面任务完成后执行，完成后再执行后续任务 | 实现多读单写，保证数据读写安全           |
| `dispatch_semaphore`         | 信号量，控制并发访问资源                | 控制最大并发数、异步转同步、线程安全访问      |
| `dispatch_apply`             | 快速迭代，并发执行指定次数的任务            | 批量处理数组元素、并发遍历             |
| `dispatch_source`            | 创建事件源，如定时器                  | 精确定时器（比NSTimer更准确）、监听文件变化 |

**注意事项**：
- `dispatch_barrier`只对自定义并发队列有效，对全局队列无效
- `dispatch_group_enter`和`dispatch_group_leave`必须成对使用
- `dispatch_semaphore`的wait和signal也必须成对使用

## NSOperation

NSOperation是苹果基于GCD封装的面向对象的多线程解决方案，提供了更多的控制功能。

### NSOperation与NSOperationQueue

- `NSOperation`：表示一个任务，是抽象类，需要使用其子类
- `NSOperationQueue`：操作队列，用于管理和调度NSOperation

### NSOperation子类

#### NSInvocationOperation

> 注：`NSInvocationOperation` 在 Swift 中不可用，且在较新 Apple 平台上已不推荐新代码继续使用；实际开发优先使用 `NSBlockOperation` 或 `addOperation { ... }`。

```objc
NSInvocationOperation *op = [[NSInvocationOperation alloc] initWithTarget:self 
                                                                 selector:@selector(doTask) 
                                                                   object:nil];
// 直接调用start会在当前线程执行
[op start];

// 添加到队列会在子线程执行
NSOperationQueue *queue = [[NSOperationQueue alloc] init];
[queue addOperation:op];
```

#### NSBlockOperation

`NSBlockOperation`可以通过`addExecutionBlock:`添加多个block，这些block之间是**并发执行**的（当block数量 > 1时，系统可能开启新线程来并发执行）。所有block全部执行完毕后，operation才算完成，此时触发`completionBlock`。

```objc
NSBlockOperation *op = [NSBlockOperation blockOperationWithBlock:^{
    NSLog(@"任务1: %@", [NSThread currentThread]);
}];

[op addExecutionBlock:^{
    NSLog(@"任务2: %@", [NSThread currentThread]);
}];

[op addExecutionBlock:^{
    NSLog(@"任务3: %@", [NSThread currentThread]);
}];

op.completionBlock = ^{
    NSLog(@"所有任务完成");
};

[op start];
```

#### 自定义NSOperation

```objc
@interface CustomOperation : NSOperation
@end

@implementation CustomOperation

- (void)main {
    if (self.isCancelled) return;
    
    // 执行任务
    NSLog(@"自定义任务: %@", [NSThread currentThread]);
    
    if (self.isCancelled) return;
}

@end
```

### NSOperationQueue

```objc
// 创建队列
NSOperationQueue *queue = [[NSOperationQueue alloc] init];

// 设置最大并发数
queue.maxConcurrentOperationCount = 3;

// 添加操作
[queue addOperation:op];

// 使用block添加操作
[queue addOperationWithBlock:^{
    NSLog(@"任务");
}];

// 获取主队列
NSOperationQueue *mainQueue = [NSOperationQueue mainQueue];
```

### 操作依赖

NSOperation支持跨队列的依赖关系——即使两个operation分别在不同的queue中执行，依赖关系仍然有效。依赖必须在operation添加到queue之前设置。

```objc
NSOperationQueue *queue = [[NSOperationQueue alloc] init];

NSBlockOperation *op1 = [NSBlockOperation blockOperationWithBlock:^{
    NSLog(@"下载图片");
}];

NSBlockOperation *op2 = [NSBlockOperation blockOperationWithBlock:^{
    NSLog(@"处理图片");
}];

NSBlockOperation *op3 = [NSBlockOperation blockOperationWithBlock:^{
    NSLog(@"显示图片");
}];

// 设置依赖关系：op2依赖op1，op3依赖op2
[op2 addDependency:op1];
[op3 addDependency:op2];

[queue addOperations:@[op1, op2, op3] waitUntilFinished:NO];
```

**注意**：
- 不要创建循环依赖（如A依赖B，B又依赖A），会导致所有相关operation永远无法执行
- 依赖关系是基于operation的`isFinished`状态判断的，被取消的operation也会标记为finished，因此被依赖的operation取消后，依赖它的operation仍会继续执行

### 队列操作

```objc
// 暂停队列：已经在执行中的操作不会被暂停，只是不再调度新的操作
queue.suspended = YES;

// 恢复队列：继续调度队列中等待的操作
queue.suspended = NO;

// 取消所有操作：对每个operation调用cancel，但不会强制停止正在执行的操作，
// 需要在operation的main方法中检查isCancelled来响应取消
[queue cancelAllOperations];

// 等待所有操作完成：会阻塞当前线程，不要在主线程调用
[queue waitUntilAllOperationsAreFinished];
```

## 线程安全

### 常见线程安全问题

1. **数据竞争（Data Race）**：多个线程同时读写同一数据，且至少一个是写操作，导致结果不可预测。典型场景：多线程同时对`NSMutableArray`执行添加/删除操作，可能导致crash
2. **死锁（Deadlock）**：两个或多个线程互相持有对方所需的资源并等待对方释放，导致所有线程永久阻塞。典型场景：线程A持有锁1等待锁2，线程B持有锁2等待锁1
3. **优先级反转（Priority Inversion）**：低优先级线程持有高优先级线程需要的资源，而中优先级线程抢占了低优先级线程的CPU时间，导致高优先级线程间接被中优先级线程阻塞。`OSSpinLock`被废弃就是因为存在此问题

### 线程同步方案

#### @synchronized

```objc
@synchronized (self) {
    // 临界区代码
    self.count++;
}
```

**特点**：
- 使用最简单的加锁方式，底层基于`pthread_mutex`递归锁实现，并维护了一个哈希表将传入的对象映射到对应的锁
- 性能在所有锁中最差，但对于非高频调用的场景足够使用
- 支持递归加锁（同一线程可重入）
- 如果传入的对象为`nil`，则不会加锁，起不到同步效果

#### NSLock（互斥锁）

```objc
NSLock *lock = [[NSLock alloc] init];

[lock lock];
// 临界区代码
self.count++;
[lock unlock];

// tryLock 尝试加锁，不会阻塞
if ([lock tryLock]) {
    // 临界区代码
    [lock unlock];
}
```

#### NSRecursiveLock（递归锁）

递归锁允许**同一线程**多次获取同一把锁而不会死锁，每次`lock`必须对应一次`unlock`。相比之下，`NSLock`是非递归锁，同一线程重复`lock`会立即死锁。递归锁适用于递归调用或同一线程上多个方法需要共享同一把锁的场景。

```objc
NSRecursiveLock *recursiveLock = [[NSRecursiveLock alloc] init];

- (void)recursiveMethod:(int)depth {
    if (depth <= 0) return;
    [recursiveLock lock];
    NSLog(@"depth: %d", depth);
    [self recursiveMethod:depth - 1];
    [recursiveLock unlock];
}
```

#### NSCondition（条件锁）

`NSCondition`封装了`pthread_mutex`和`pthread_cond`，同时提供了锁和条件变量的能力。它适用于**生产者-消费者**模式：消费者线程在条件不满足时通过`wait`挂起等待，生产者线程在条件满足后通过`signal`（唤醒一个）或`broadcast`（唤醒所有）通知等待的线程。

```objc
NSCondition *condition = [[NSCondition alloc] init];

// 生产者
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    [condition lock];
    // 生产数据
    self.dataReady = YES;
    [condition signal]; // 发送信号
    [condition unlock];
});

// 消费者
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    [condition lock];
    while (!self.dataReady) {
        [condition wait]; // 等待信号
    }
    // 消费数据
    [condition unlock];
});
```

#### NSConditionLock

`NSConditionLock`是对`NSCondition`的进一步封装，通过整型的`condition`值来控制线程的执行顺序。`lockWhenCondition:`只有在condition值匹配时才能获取锁，`unlockWithCondition:`在解锁的同时设置新的condition值，适用于需要严格控制多个线程执行顺序的场景。

```objc
NSConditionLock *conditionLock = [[NSConditionLock alloc] initWithCondition:0];

// 线程1
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    [conditionLock lockWhenCondition:0];
    NSLog(@"任务1");
    [conditionLock unlockWithCondition:1];
});

// 线程2
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    [conditionLock lockWhenCondition:1];
    NSLog(@"任务2");
    [conditionLock unlockWithCondition:2];
});
```

#### dispatch_semaphore

```objc
dispatch_semaphore_t semaphore = dispatch_semaphore_create(1);

dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
// 临界区代码
self.count++;
dispatch_semaphore_signal(semaphore);
```

#### pthread_mutex

```objc
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);

pthread_mutex_lock(&mutex);
// 临界区代码
self.count++;
pthread_mutex_unlock(&mutex);

pthread_mutex_destroy(&mutex);
```

#### os_unfair_lock（iOS 10+）

> `os_unfair_lock` 是一种**轻量级互斥锁**（**不是自旋锁**），用于替代因优先级反转问题而被废弃的 `OSSpinLock`。竞争时线程会被内核挂起而非忙等，但其用户态实现比 `pthread_mutex` 更轻量，是 iOS 中性能最优的锁。"unfair"指不保证获锁公平性。
>
> iOS 16+ / macOS 13+ 推荐使用 `OSAllocatedUnfairLock`，它解决了 Swift 中值类型锁的内存地址稳定性问题。

```objc
#import <os/lock.h>

// 作为实例变量使用，确保锁的内存地址稳定
@implementation MyClass {
    os_unfair_lock _lock;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _lock = OS_UNFAIR_LOCK_INIT;
    }
    return self;
}

- (void)safeIncrement {
    os_unfair_lock_lock(&_lock);
    self.count++;
    os_unfair_lock_unlock(&_lock);
}
@end
```

> **注意**：`os_unfair_lock`是值类型，必须保证锁变量的内存地址在整个使用期间保持稳定，不能对锁变量进行拷贝，否则会导致未定义行为。

### 锁的性能对比

从高到低排序：
1. `os_unfair_lock`
2. `dispatch_semaphore`
3. `pthread_mutex`
4. `NSLock`
5. `NSCondition`
6. `NSRecursiveLock`
7. `NSConditionLock`
8. `@synchronized`

### 原子属性

```objc
@property (atomic, strong) NSString *name;
```

- `atomic`：属性的getter/setter方法通过 os_unfair_lock 保证原子性，但不能保证线程安全。例如对可变容器`NSMutableArray`的`atomic`属性，getter/setter是原子的，但对数组的`addObject:`等操作并不受保护；又如"先读后写"的复合操作（如`self.count = self.count + 1`）也无法保证线程安全
- `nonatomic`：非原子操作，性能更好，iOS开发中推荐使用

## Swift Concurrency（Swift 5.5+）

Swift 5.5引入了现代化的并发编程模型，解决了传统GCD/NSOperation存在的回调地狱、错误处理困难、线程安全等问题。

### 底层线程模型

Swift Concurrency 底层使用**协作式线程池（Cooperative Thread Pool）**，线程数量默认等于 CPU 核心数，避免了 GCD 可能出现的线程爆炸问题。

核心机制：
- **挂起（suspend）与恢复（resume）**：当 `await` 一个异步操作时，当前任务被挂起，线程被释放回线程池去执行其他任务；当异步操作完成后，任务被恢复执行，但不一定在同一个线程上
- **Continuation**：是挂起点的底层实现。每个 `await` 都对应一个 continuation，它保存了恢复执行所需的上下文。也可以通过 `withCheckedContinuation` / `withCheckedThrowingContinuation` 手动创建，用于桥接回调式 API

```swift
func fetchData() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        legacyFetchData { result in
            switch result {
            case .success(let data):
                continuation.resume(returning: data)
            case .failure(let error):
                continuation.resume(throwing: error)
            }
        }
    }
}
```

> **注意**：`continuation.resume` 必须且只能调用一次。调用零次会导致任务永久挂起（内存泄漏），调用多次会触发运行时崩溃。`withCheckedContinuation` 在 debug 模式下会检测这些错误，`withUnsafeContinuation` 性能更好但不做检查。

### 核心概念

#### async/await

`async`标记函数为异步函数，`await`标记**挂起点（suspension point）**——在这个位置任务可能被挂起，线程可以去执行其他工作。

```swift
func fetchUser() async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)  // 挂起点：等待网络请求
    return try JSONDecoder().decode(User.self, from: data)        // 恢复后继续执行
}

let user = try await fetchUser()
```

> 关键字顺序：`try await`（调用时）、`async throws`（声明时）。Swift 6.0 中 `throws` 支持类型化错误：`func fetch() async throws(NetworkError) -> Data`。

**与传统闭包回调对比**：

```swift
// 闭包回调风格：容易产生回调嵌套，错误处理分散
func loadUserProfile(completion: @escaping (Result<Profile, Error>) -> Void) {
    fetchUser { userResult in
        switch userResult {
        case .success(let user):
            fetchProfile(for: user) { profileResult in
                completion(profileResult)
            }
        case .failure(let error):
            completion(.failure(error))
        }
    }
}

// async/await风格：线性书写，错误统一处理
func loadUserProfile() async throws -> Profile {
    let user = try await fetchUser()
    let profile = try await fetchProfile(for: user)
    return profile
}
```

**优势**：
- 代码按顺序书写，避免回调嵌套
- 编译器保证在正确的位置使用 `await`，遗漏会编译报错
- 错误处理与同步代码一致（try/catch）
- 挂起点明确可见，便于推理代码的并发行为

#### Task

`Task`用于在同步上下文中启动异步任务。

```swift
// 创建非结构化任务
Task {
    let user = try await fetchUser()
    print(user.name)
}

// 创建分离任务（不继承当前上下文）
Task.detached {
    await performBackgroundWork()
}
```

**Task vs Task.detached**：
- `Task { }`：继承当前actor上下文和任务优先级。例如在`@MainActor`标记的函数中创建的Task，其闭包默认也在主线程执行
- `Task.detached { }`：不继承任何上下文，完全独立运行。适用于不需要与当前上下文关联的后台工作（如日志上传、缓存清理）

**Task的取消**：
- Swift Concurrency 采用**协作式取消**：调用`task.cancel()`仅将任务标记为取消状态，不会强制终止
- 任务内部需要主动检查`Task.isCancelled`或调用`try Task.checkCancellation()`来响应取消
- 取消会自动传播到子任务（结构化并发中）

#### Actor

`Actor`是一种引用类型，通过**数据隔离（actor isolation）**自动保证线程安全，可以理解为自带串行队列的对象。

```swift
actor BankAccount {
    private var balance: Int = 0
    
    func deposit(_ amount: Int) {
        balance += amount
    }
    
    func withdraw(_ amount: Int) -> Bool {
        guard balance >= amount else { return false }
        balance -= amount
        return true
    }
    
    // nonisolated：不需要隔离保护的成员，可以同步访问
    // 只能访问不可变状态或不涉及actor状态的计算
    nonisolated var description: String {
        "BankAccount instance"
    }
}

let account = BankAccount()
await account.deposit(100)  // 从外部访问actor需要await（跨隔离域）
```

**Actor隔离规则**：
- **外部访问**：从 actor 外部访问其属性和方法需要 `await`，因为调用会被排队到 actor 的串行执行器上
- **内部访问**：actor 内部的方法互相调用不需要 `await`，因为已经在同一隔离域中
- **`nonisolated`**：标记不需要隔离的成员，常用于只读的 `let` 属性、纯计算属性、或实现协议方法（如 `Hashable`、`CustomStringConvertible`）

**Actor Reentrancy（可重入性）**：

Actor 的方法在遇到 `await` 挂起点时，会**释放对 actor 的独占访问**，允许其他任务在此期间访问该 actor。这意味着 `await` 前后 actor 的状态可能发生变化：

```swift
actor ImageCache {
    private var cache: [URL: Image] = [:]
    
    func getImage(for url: URL) async throws -> Image {
        if let cached = cache[url] { return cached }
        
        let image = try await downloadImage(from: url)
        // ⚠️ await之后cache[url]可能已被其他任务修改
        // 应检查是否已有缓存，避免覆盖
        cache[url] = cache[url] ?? image
        return cache[url]!
    }
}
```

> 这是 Actor 设计上的有意选择——防止死锁（如果 actor A 等待 actor B，而 B 又等待 A，不可重入会死锁）。开发者需要在每个 `await` 之后重新验证状态假设。

#### MainActor

`@MainActor`是一个全局 actor，确保代码在主线程执行，用于 UI 更新。它本质上是 actor 隔离机制的特例，替代了传统的 `DispatchQueue.main.async`。

```swift
// 标记整个类：所有属性和方法默认在主线程执行
@MainActor
class ViewModel: ObservableObject {
    @Published var users: [User] = []
    
    func loadUsers() async {
        let users = try? await fetchUsers()  // await处可能切到后台线程执行网络请求
        self.users = users ?? []             // 回到主线程更新UI
    }
}

// 标记单个函数
@MainActor
func updateUI() {
    label.text = "Updated"
}

// 在非MainActor上下文中临时切到主线程
func processData() async {
    let result = await computeInBackground()
    await MainActor.run {
        label.text = result  // 确保在主线程更新
    }
}
```

**与 `DispatchQueue.main` 的对比**：

| 特性 | `DispatchQueue.main.async` | `@MainActor` |
|------|---------------------------|--------------|
| 检查时机 | 运行时（忘了切主线程只有运行时才崩溃） | 编译时（编译器保证主线程访问） |
| 嵌套调用 | 如果已经在主线程，`sync`会死锁 | 编译器自动优化，不会重复调度 |
| 与 async/await 配合 | 需要嵌套闭包 | 原生支持 |

### 结构化并发（Structured Concurrency）

结构化并发是Swift Concurrency的核心设计理念，它确保：
- 子任务的生命周期不会超过父任务
- 任务取消会自动传播到子任务
- 错误会正确传播

#### TaskGroup

用于动态创建一组并发任务，任务数量可以在运行时决定。

```swift
func fetchAllUsers(ids: [Int]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            group.addTask {
                try await fetchUser(id: id)
            }
        }
        
        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}
```

**TaskGroup 的错误处理**：当 group 中某个子任务抛出错误时，TaskGroup 会**自动取消**其余尚未完成的子任务，并将错误抛给调用方。如果需要容错处理（某些子任务失败不影响整体），可以在子任务内部 catch 错误返回可选值：

```swift
try await withThrowingTaskGroup(of: User?.self) { group in
    for id in ids {
        group.addTask {
            try? await fetchUser(id: id)  // 单个失败返回nil，不影响其他任务
        }
    }
    var users: [User] = []
    for try await user in group {
        if let user { users.append(user) }
    }
    return users
}
```

> `withTaskGroup` 用于不抛出错误的场景，`withThrowingTaskGroup` 用于可能抛出错误的场景。`withDiscardingTaskGroup`（Swift 5.9+）用于不需要收集子任务结果的场景，内存效率更高。

#### async let

用于并发执行**编译时已知数量**的异步任务。`async let` 声明后子任务立即开始执行，在 `await` 时等待结果。

```swift
func loadDashboard() async throws -> Dashboard {
    async let user = fetchUser()
    async let posts = fetchPosts()
    async let notifications = fetchNotifications()
    
    // 三个请求从声明时就开始并发执行，此处等待所有结果
    return try await Dashboard(
        user: user,
        posts: posts,
        notifications: notifications
    )
}
```

**作用域与隐式取消**：`async let` 绑定的子任务生命周期不能超过其所在作用域。如果离开作用域时子任务尚未完成（比如提前 return 或抛出错误），系统会**自动取消**该子任务并 `await` 其完成：

```swift
func example() async throws -> User {
    async let user = fetchUser()
    async let analytics = trackPageView()  // 如果fetchUser抛出错误...
    
    let result = try await user             // ...这里抛出异常
    _ = try await analytics
    return result
    // analytics任务会被自动取消并等待结束，不会泄漏
}
```

> **async let vs TaskGroup 选择**：任务数量编译时已知且固定用 `async let`（更简洁）；任务数量动态或需要逐个处理结果用 `TaskGroup`（更灵活）。

#### 结构化 vs 非结构化并发

| 特性 | 结构化并发 | 非结构化并发 |
|------|-----------|-------------|
| 创建方式 | async let、TaskGroup | Task、Task.detached |
| 生命周期 | 受父作用域限制，父任务结束前会等待子任务完成 | 独立于创建上下文，需持有Task引用手动管理 |
| 取消传播 | 父任务取消自动传播到所有子任务 | 不会从创建上下文自动接收取消，需手动调用`task.cancel()` |
| 上下文继承 | 继承父任务上下文 | Task继承actor上下文和优先级；Task.detached不继承任何上下文 |
| 适用场景 | 需要等待所有子任务完成 | 启动独立的后台任务（如fire-and-forget） |

### Sendable协议

`Sendable`协议标记类型可以安全地**跨并发域（isolation domain）传递**，是 Swift Concurrency 数据安全的基石。

**自动满足 Sendable 的类型**：
- 值类型（struct、enum），且所有存储属性也是 Sendable
- Actor 类型（自带隔离保护）
- 只包含不可变（`let`）Sendable 属性的 `final class`

```swift
// 值类型：所有属性都是Sendable，自动满足
struct User: Sendable {
    let id: Int
    let name: String
}

// final class + 全部let属性：可以显式声明Sendable
final class Config: Sendable {
    let apiKey: String
    init(apiKey: String) { self.apiKey = apiKey }
}

// Actor自动满足Sendable
actor DataStore: Sendable { }
```

**`@unchecked Sendable`**：当编译器无法自动验证 Sendable 安全性，但开发者可以通过内部同步机制保证安全时使用。常见于内部使用锁保护的类：

```swift
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Any] = [:]
    
    func set(_ value: Any, for key: String) {
        lock.lock()
        storage[key] = value
        lock.unlock()
    }
}
```

> 使用 `@unchecked Sendable` 意味着开发者承诺自己保证了线程安全，编译器不再检查。如果实际上不是线程安全的，会导致运行时数据竞争。

**`@Sendable` 闭包**：标记闭包可以安全地跨并发域传递。`Task`、`TaskGroup.addTask` 等 API 的闭包参数都要求 `@Sendable`，这意味着闭包不能捕获非 Sendable 的可变状态：

```swift
var count = 0
Task { @Sendable in
    // ❌ 编译错误：捕获了外部可变变量
    // count += 1
}
```

**编译器检查**：Swift 5 中可通过 `-strict-concurrency=complete` 开启严格检查（以 warning 形式）。Swift 6 默认开启严格并发检查，跨并发域传递非 Sendable 类型会产生编译错误。

### AsyncSequence 与 AsyncStream

#### AsyncSequence

`AsyncSequence`是`Sequence`的异步版本，允许使用`for await`逐个异步消费元素。许多系统 API 已支持 AsyncSequence，如`URLSession.bytes`、`NotificationCenter.notifications`、`FileHandle.bytes`等。

```swift
// 逐行异步读取URL内容
let url = URL(string: "https://example.com/data.txt")!
for try await line in url.lines {
    print(line)
}

// 异步监听通知
let notifications = NotificationCenter.default.notifications(named: .userDidLogin)
for await notification in notifications {
    handleLogin(notification)
}
```

#### AsyncStream

`AsyncStream`用于创建自定义的 AsyncSequence，常用于将回调式 API、delegate 模式或定时器等桥接到 async/await 世界。

```swift
// 将CLLocationManager的delegate回调桥接为AsyncStream
func locationUpdates() -> AsyncStream<CLLocation> {
    AsyncStream { continuation in
        let delegate = LocationDelegate(
            onUpdate: { location in
                continuation.yield(location)
            },
            onFinish: {
                continuation.finish()
            }
        )
        
        continuation.onTermination = { _ in
            // 清理资源
        }
        
        locationManager.delegate = delegate
        locationManager.startUpdatingLocation()
    }
}

// 消费
for await location in locationUpdates() {
    updateMap(with: location)
}
```

> `AsyncThrowingStream`用于可能抛出错误的场景。`AsyncStream`还支持设置缓冲策略（`.bufferingPolicy`）来控制生产速度快于消费速度时的行为：`.unbounded`（无限缓冲）、`.bufferingNewest(n)`（保留最新 n 个）、`.bufferingOldest(n)`（保留最早 n 个）。

### 与GCD的对比

| 特性 | GCD | Swift Concurrency |
|------|-----|-------------------|
| 语法 | 闭包回调 | async/await |
| 错误处理 | 手动传递 | try/catch |
| 取消机制 | DispatchWorkItem | 协作式取消，自动传播 |
| 线程安全 | 手动加锁 | Actor自动隔离 |
| 优先级反转 | 可能发生 | 系统自动处理 |
| 调试 | 难以追踪 | 完整的调用栈 |

## 常见面试题

### 1. 死锁的发生条件及常见场景

死锁的发生需要**同时满足**以下四个必要条件（Coffman条件）：

1. **互斥**：资源同一时间只能被一个线程持有
2. **持有并等待**：线程持有至少一个资源的同时，等待获取其他资源
3. **不可抢占**：已被持有的资源不能被强制夺走，只能由持有者主动释放
4. **循环等待**：存在一个线程等待链，形成环路（A等B，B等A）

破坏其中任意一个条件即可避免死锁。

GCD中的死锁：

在**串行队列**中对**当前队列**执行`sync`是最典型的死锁场景：

```swift
// 死锁示例1：主线程同步执行主队列任务
// 主线程正在执行当前代码 → sync将block排到主队列尾部 → 主线程阻塞等待block完成 → block等待当前代码执行完才能执行
DispatchQueue.main.sync {
    print("这里永远不会执行")
}

// 死锁示例2：串行队列中同步执行当前队列任务
let queue = DispatchQueue(label: "com.example")
queue.async {
    // 当前已经在queue上执行
    queue.sync {
        // sync将block排到queue尾部，但queue要等当前block完成才能执行下一个
        print("死锁")
    }
}
```

**原因**：`sync`将任务追加到串行队列尾部，并阻塞当前线程等待该任务完成；而串行队列需要等待当前正在执行的任务（即包含`sync`调用的任务）完成后才能执行队列中的下一个任务，从而形成循环等待。

> **不会死锁的情况**：对**并发队列**执行`sync`不会死锁（并发队列可以同时执行多个任务）；在**子线程**对主队列执行`sync`也不会死锁（当前线程不在主队列上执行）。

锁的不当使用导致的死锁：

```swift
let lockA = NSLock()
let lockB = NSLock()

// 线程1
DispatchQueue.global().async {
    lockA.lock()
    Thread.sleep(forTimeInterval: 0.1)
    lockB.lock()    // 等待线程2释放lockB
    lockB.unlock()
    lockA.unlock()
}

// 线程2
DispatchQueue.global().async {
    lockB.lock()
    Thread.sleep(forTimeInterval: 0.1)
    lockA.lock()    // 等待线程1释放lockA → 循环等待，死锁
    lockA.unlock()
    lockB.unlock()
}
```

**避免方法**：所有线程以相同的顺序获取锁（先A后B），破坏循环等待条件。

### 2. OSSpinLock 为什么被废弃？什么是优先级反转？

**自旋锁（Spin Lock）**在等待锁时不会让线程休眠，而是持续忙等（busy-wait），不断检查锁是否可用。优点是没有线程切换开销，临界区极短时性能好；缺点是等待期间持续占用 CPU。

`OSSpinLock` 被废弃是因为在 iOS 的线程调度机制下会触发**优先级反转（Priority Inversion）**：

```
时间线 →

低优先级线程:   [获取锁]---[执行中...]----------------------------[释放锁]
中优先级线程:          [抢占CPU]---[长时间执行]---[完成]
高优先级线程:              [自旋等待锁...]---[被中优先级间接阻塞...]---[终于获取锁]
```

1. **低优先级**线程获取了自旋锁，开始执行临界区
2. **高优先级**线程需要同一把锁，开始自旋等待（忙等，持续占用 CPU）
3. **中优先级**线程抢占了低优先级线程的 CPU 时间（中 > 低），导致低优先级线程迟迟无法执行完释放锁
4. 结果：高优先级线程空转浪费 CPU，低优先级线程分不到时间片无法释放锁，形成**类似死锁的活锁**

这个问题的关键在于：自旋锁的忙等让高优先级线程霸占了 CPU，而调度器因为高优先级线程"正在运行"而不会调度低优先级线程，锁就永远释放不了。

**替代方案**：
- **`os_unfair_lock`**（推荐）：等待时线程会被内核挂起而非忙等，且系统会进行优先级继承
- **`pthread_mutex`**：支持**优先级继承（Priority Inheritance）**——当高优先级线程等待锁时，系统临时提升持锁的低优先级线程的优先级，让它尽快完成并释放锁
- **`NSLock`**：底层基于 `pthread_mutex`，同样支持优先级继承
- **Actor**：Swift Concurrency 运行时自动处理优先级问题

### 3. 如何实现读写锁？

读写锁（Readers-Writer Lock）的核心需求是：**允许多个线程同时读取，但写操作必须独占访问**。使用自定义并发队列 + `dispatch_barrier_async`是最常见的实现方式：

- 读操作通过`dispatch_sync`提交到并发队列，多个读操作可以并发执行
- 写操作通过`dispatch_barrier_async`提交，barrier会等待前面所有任务完成后独占执行，完成后后续任务才能继续

```swift
class ReadWriteStore {
    private let queue = DispatchQueue(label: "com.example.rwlock", attributes: .concurrent)
    private var _data: Any?

    func readData() -> Any? {
        queue.sync {
            _data
        }
    }

    func writeData(_ data: Any?) {
        queue.async(flags: .barrier) {
            self._data = data
        }
    }
}
```

### 4. 不同队列和执行方式的组合会怎样？

| 组合 | 串行队列 | 并发队列 | 主队列 |
|------|----------|----------|--------|
| sync | 不开新线程，串行执行 | 不开新线程，串行执行 | 在主线程调用会死锁 |
| async | 开1条新线程，串行执行 | 开多条新线程，并发执行 | 不开新线程，串行执行 |

逐一分析：

- **串行队列 + sync**：任务在当前线程执行（sync 不开新线程），一个执行完才执行下一个
- **串行队列 + async**：开启一条新线程，任务在该线程上按顺序执行。注意只开一条，因为串行队列同一时间只执行一个任务
- **并发队列 + sync**：任务在当前线程执行（sync 不开新线程），虽然是并发队列但因为 sync 会阻塞等待，效果等同于串行执行
- **并发队列 + async**：开启多条新线程并发执行，这是最常用的并发场景
- **主队列 + sync**：如果在主线程调用会死锁；如果在子线程调用则不会死锁，任务在主线程执行
- **主队列 + async**：任务在主线程上串行执行，常用于回到主线程更新 UI

### 5. 如何保证线程安全？

| 方案 | 适用场景 | 示例 |
|------|----------|------|
| **锁**（NSLock、pthread_mutex、os_unfair_lock） | 保护临界区代码，适用于短暂的共享数据访问 | 保护属性读写、保护计数器递增 |
| **@synchronized** | 对性能要求不高的简单场景 | 单例初始化（OC）、简单的临界区 |
| **dispatch_semaphore** | 控制最大并发数、资源池访问 | 限制同时下载数、数据库连接池 |
| **串行队列** | 将所有对共享资源的操作集中到一个队列 | 日志写入、数据库操作队列 |
| **并发队列 + barrier** | 多读单写场景 | 缓存读写、配置管理 |
| **atomic 属性** | 仅保护单个属性的 getter/setter | 简单标志位（但复合操作仍不安全） |
| **Actor**（Swift 5.5+） | Swift 中推荐的线程安全方案，编译器保证 | ViewModel 状态管理、共享数据存储 |

> **选择建议**：Swift 新项目优先使用 Actor；OC 或需要极致性能时使用 `os_unfair_lock`；多读单写场景用并发队列 + barrier；简单场景用 `NSLock` 或串行队列。不要过度加锁，锁的粒度越小性能越好。

### 6. GCD和NSOperation的区别？

| 特性 | GCD | NSOperation |
|------|-----|-------------|
| 实现 | C语言 | Objective-C |
| 任务依赖 | 无直接API，需通过barrier/group/semaphore间接实现 | 直接支持（addDependency） |
| 取消任务 | 支持（DispatchWorkItem） | 支持 |
| 最大并发数 | 不直接支持 | 支持（maxConcurrentOperationCount） |
| 任务状态 | 有限支持（DispatchWorkItem.isCancelled） | 完整支持（isReady、isExecuting、isFinished、isCancelled） |
| 优先级 | 队列优先级（QoS） | 操作优先级（queuePriority） |

### 7. Actor 的优势是什么？结构化并发解决了什么问题？

Actor 的优势：

传统多线程中，开发者需要手动选择锁、管理加锁/解锁时机，一旦遗漏就会产生数据竞争，而且这类 bug 往往难以复现和调试。Actor 从语言层面解决了这个问题：

- **编译时安全**：从 actor 外部访问其可变状态必须使用 `await`，忘记了编译器直接报错，而不是等到运行时崩溃才发现
- **无需手动加锁**：actor 内部的状态自动受到隔离保护，不需要开发者编写任何锁相关代码，消除了忘记解锁、死锁等人为错误
- **消除数据竞争**：Swift 6 的严格并发检查 + Actor + Sendable 三者配合，可以在编译期消除数据竞争（Data Race Safety）
- **比锁更高层次的抽象**：锁保护的是"代码段"，开发者需要记住哪些代码需要加锁；Actor 保护的是"数据"，只要数据在 actor 内部，就自动是安全的
- **可组合性好**：多个 actor 之间通过 `await` 交互，不会出现传统锁的嵌套死锁问题（得益于 actor 的可重入设计）

结构化并发的优势：

在 GCD 时代，异步任务一旦通过 `dispatch_async` 派发出去，就与创建它的上下文完全脱离了关系，这带来了几个问题：

1. **任务泄漏**：派发出去的任务没有所有者，无法确保它一定会完成或被取消，容易产生资源泄漏
2. **取消困难**：需要手动持有 `DispatchWorkItem` 引用并调用 `cancel()`，而且子任务不会自动取消
3. **错误处理分散**：每个闭包回调都需要独立处理错误，错误无法自动向上传播
4. **生命周期不可控**：闭包捕获了 `self` 等引用，异步任务的生命周期可能超过预期

结构化并发（`async let`、`TaskGroup`）通过将任务的生命周期绑定到作用域来解决这些问题。
