+++
title = "设计模式概述"
date = '2026-05-27T22:24:03+08:00'
draft = false
weight = 11
tags = ["设计模式", "面试"]
categories = ["设计模式", "面试"]
+++
## 什么是设计模式？

设计模式（Design Pattern）是软件开发中反复出现问题的经典解决方案。它们是前人在大量实践中总结出的、被证明有效的代码设计经验，可以帮助开发者编写出更加灵活、可维护、可复用的代码。

设计模式不是具体的代码，而是解决特定问题的思想和模板。正确运用设计模式可以：

- 提高代码的可读性和可维护性
- 增强代码的可复用性
- 降低模块间的耦合度
- 提供通用的设计词汇，便于团队沟通

## 设计模式的起源

设计模式的概念最早由"四人帮"（Gang of Four，简称GoF）在1994年出版的《Design Patterns: Elements of Reusable Object-Oriented Software》一书中系统化提出。书中总结了23种经典设计模式，这些模式至今仍是软件设计的重要参考。

## 设计模式分类

GoF将23种设计模式分为三大类：

### 创建型模式（Creational Patterns）

创建型模式关注对象的创建机制，旨在以合适的方式创建对象，而不是直接使用new操作符。这类模式使得代码在创建对象时更加灵活。

| 模式 | 描述 | iOS常见应用 |
|------|------|------------|
| 单例模式 | 确保一个类只有一个实例 | UIApplication.shared、FileManager.default |
| 工厂方法模式 | 定义创建对象的接口，由子类决定实例化哪个类 | NSNumber的工厂方法 |
| 抽象工厂模式 | 创建一系列相关对象而无需指定具体类 | UIKit组件创建 |
| 建造者模式 | 将复杂对象的构建与表示分离 | URLComponents、AlertController |
| 原型模式 | 通过复制现有实例创建新对象 | NSCopying协议 |

### 结构型模式（Structural Patterns）

结构型模式关注类和对象的组合，用于形成更大的结构。这类模式帮助确保当系统的一部分发生改变时，整个系统不需要随之改变。

| 模式 | 描述 | iOS常见应用 |
|------|------|------------|
| 适配器模式 | 将一个类的接口转换成客户期望的另一个接口 | 协议适配、第三方库封装 |
| 桥接模式 | 将抽象部分与实现部分分离 | 平台无关的抽象设计 |
| 组合模式 | 将对象组合成树形结构以表示部分-整体层次结构 | UIView层级结构 |
| 装饰器模式 | 通过包装对象在运行时动态添加职责 | 包装器对象、链式装饰 |
| 外观模式 | 为子系统提供一个统一的高层接口 | SDK封装、模块门面 |
| 享元模式 | 运用共享技术有效支持大量细粒度对象 | 字体对象、颜色对象等可共享的不可变对象 |
| 代理模式 | 为其他对象提供一种代理以控制访问 | NSProxy、虚拟代理、保护代理 |

### 行为型模式（Behavioral Patterns）

行为型模式关注对象之间的通信和职责分配，描述类或对象如何交互以及如何分配职责。

| 模式 | 描述 | iOS常见应用 |
|------|------|------------|
| 责任链模式 | 将请求的发送者和接收者解耦 | 响应者链（Responder Chain） |
| 命令模式 | 将请求封装成对象 | Target-Action、NSInvocation |
| 迭代器模式 | 顺序访问聚合对象中的元素 | for-in循环、NSEnumerator |
| 中介者模式 | 用一个中介对象封装一系列对象交互 | NotificationCenter |
| 备忘录模式 | 在不破坏封装的前提下捕获对象内部状态 | 状态恢复、UserDefaults |
| 观察者模式 | 定义对象间的一对多依赖关系 | KVO、NotificationCenter、Combine |
| 状态模式 | 允许对象在内部状态改变时改变行为 | 有限状态机实现 |
| 策略模式 | 定义一系列算法并使它们可互换 | 协议+多态实现 |
| 模板方法模式 | 定义算法骨架，将某些步骤延迟到子类 | UIViewController生命周期方法 |
| 访问者模式 | 不改变元素类的前提下定义新操作 | AST遍历处理 |

## iOS中常用的设计模式

iOS开发中常用的设计模式：

### 创建型模式

| 文章 | 描述 |
|------|------|
| [单例模式](单例模式.md) | 确保类只有一个实例，iOS中UIApplication.shared、UserDefaults.standard等都是典型应用 |
| [工厂模式](工厂模式.md) | 封装对象创建逻辑，包括简单工厂、工厂方法和抽象工厂三种变体 |
| [建造者模式](建造者模式.md) | 分步构建复杂对象，iOS中URLComponents、链式调用都是其应用 |

### 结构型模式

| 文章 | 描述 |
|------|------|
| [代理模式](代理模式.md) | 控制对象访问，典型包括虚拟代理、远程代理、保护代理等 |
| [适配器模式](适配器模式.md) | 转换不兼容接口，常用于第三方库封装和数据模型转换 |
| [装饰器模式](装饰器模式.md) | 通过对象包装在运行时叠加功能，常用于可组合扩展能力 |
| [外观模式](外观模式.md) | 为子系统提供统一接口，简化复杂系统的使用 |

### 行为型模式

| 文章 | 描述 |
|------|------|
| [观察者模式](观察者模式.md) | 一对多依赖通知，iOS提供KVO、NotificationCenter、Combine等多种实现 |
| [策略模式](策略模式.md) | 封装可互换算法，通过协议实现算法族的灵活切换 |
| [命令模式](命令模式.md) | 将请求封装为对象，iOS中的Target-Action机制是其典型体现 |
| [责任链模式](责任链模式.md) | 将请求沿链传递，iOS中的响应者链（Responder Chain）是经典应用 |

### 并发模式

| 文章 | 描述 |
|------|------|
| [生产者消费者模式](生产者消费者模式.md) | 通过缓冲区解耦数据生产和消费过程，常用于图片处理、日志收集、请求队列和数据同步 |

## 面试题：常用的设计模式有哪些？

**问题：常用的设计模式有哪些？请结合 iOS 开发说明它们分别解决什么问题、典型使用场景和注意事项。**

**答案：**

常用设计模式可以按目标分为三类：创建型模式解决"对象怎么创建"的问题，结构型模式解决"对象和模块怎么组合"的问题，行为型模式解决"对象之间怎么通信和分配职责"的问题。除此之外，iOS 的多线程和异步任务场景里也常考生产者消费者这类并发设计模式。面试回答时不要只背模式名称，最好按"解决的问题 -> iOS 场景 -> 取舍和风险"来展开。

| 分类 | 常用模式 | 解决的问题 | iOS 中的典型场景 |
|------|----------|------------|------------------|
| 创建型 | 单例模式 | 保证全局唯一实例，并提供统一访问点 | `UIApplication.shared`、`UserDefaults.standard`、`FileManager.default`、日志服务、缓存管理 |
| 创建型 | 工厂模式 | 将对象创建逻辑和使用逻辑分离 | 网络客户端创建、Cell 创建、主题 UI 组件创建、Mock 对象注入 |
| 创建型 | 建造者模式 | 分步骤构建复杂对象，避免构造函数参数过多 | `URLComponents`、`UIAlertController`、`NSAttributedString`、网络请求配置 |
| 结构型 | 代理模式 / 委托模式 | 代理控制访问，委托完成对象间回调协作 | `NSProxy`、图片懒加载代理、权限代理、`UITableViewDelegate`、`URLSessionDelegate` |
| 结构型 | 适配器模式 | 将不兼容接口转换成调用方期望的接口 | 第三方库封装、旧 API 兼容、数据模型转换、UIKit 与 SwiftUI 桥接 |
| 结构型 | 装饰器模式 | 不修改原对象的前提下动态叠加能力 | UI 效果叠加、日志/缓存/重试包装器、Swift Extension、Objective-C Category |
| 结构型 | 外观模式 | 为复杂子系统提供简单统一的入口 | 网络层 Facade、播放器封装、认证模块封装、SDK 门面 |
| 行为型 | 观察者模式 | 一个对象变化后通知多个依赖方 | KVO、`NotificationCenter`、Combine、RxSwift、登录状态广播 |
| 行为型 | 策略模式 | 将一组可互换算法封装起来，运行时切换 | 表单校验、支付方式、重试策略、图片加载策略、排序策略 |
| 行为型 | 命令模式 | 将请求封装成对象，便于排队、记录、撤销和重做 | Target-Action、JS Bridge、任务队列、事务处理、编辑器 Undo/Redo |
| 行为型 | 责任链模式 | 让请求沿处理链传递，发送者不关心最终处理者 | Responder Chain、手势处理链、网络拦截器链、审批流 |
| 并发 | 生产者消费者模式 | 通过缓冲区解耦生产和消费速度，提供背压和流量控制 | 图片处理管线、日志收集、网络请求队列、数据同步 |

创建型模式里最常见的是单例、工厂和建造者。单例适合管理真正全局唯一的系统资源，例如应用对象、文件管理器、用户默认配置、日志中心和共享缓存。Swift 中常用 `static let shared` 实现，它具备懒加载和线程安全特性：

```swift
final class Logger {
    static let shared = Logger()

    private init() {}

    func log(_ message: String) {
        print("[Log]", message)
    }
}

Logger.shared.log("App did launch")
```

单例的风险是全局可变状态、隐藏依赖和测试困难，所以业务对象不要为了调用方便就做成单例。很多时候可以用依赖注入替代单例，把依赖从初始化方法传进去，这样更容易 Mock 和测试。

工厂模式适合创建逻辑复杂、需要按环境切换实现、或者调用方只应该依赖抽象协议的场景。简单工厂通常用一个参数决定创建哪个对象；工厂方法把创建动作延迟给子类；抽象工厂用于创建一组相关对象，例如一整套主题 UI。它的核心价值是让业务代码只关心"我要一个能工作的对象"，不用关心对象的具体构造过程。

```swift
protocol APIClient {
    func request(_ path: String) async throws -> Data
}

final class URLSessionAPIClient: APIClient {
    func request(_ path: String) async throws -> Data {
        let url = URL(string: "https://api.example.com" + path)!
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
}

final class MockAPIClient: APIClient {
    func request(_ path: String) async throws -> Data {
        Data("{}".utf8)
    }
}

enum APIEnvironment {
    case production
    case testing
}

enum APIClientFactory {
    static func makeClient(for environment: APIEnvironment) -> any APIClient {
        switch environment {
        case .production:
            return URLSessionAPIClient()
        case .testing:
            return MockAPIClient()
        }
    }
}
```

建造者模式适合创建参数多、可选项多、需要分步骤校验的复杂对象。比如构建 URL、Alert、富文本和网络请求配置时，链式调用比一个很长的初始化方法更清晰，也可以在 `build()` 阶段统一校验必要参数。

结构型模式里，代理、适配器、装饰器和外观很容易被追问区别。代理模式的重点是"控制访问"，代理对象和真实对象通常实现同一接口，可以做懒加载、权限控制、远程访问和缓存。iOS 里的 Delegate 虽然也翻译成代理，但它更像一种基于协议的回调协作机制，常用于子对象把事件交给外部对象处理，比如 `UITableViewDelegate` 把点击、滑动、编辑事件交给控制器处理。Delegate 属性通常要用 `weak`，否则容易产生循环引用。

适配器模式的重点是"转换接口"。当旧代码依赖 `OldNetworkClient`，新引入的库暴露的是另一套 API 时，可以写一个 Adapter 让新库伪装成旧接口，这样调用方不用大面积修改。它常用于第三方库替换、旧接口兼容、模型转换、组件化依赖隔离和 UIKit/SwiftUI 桥接。装饰器模式的重点是"叠加能力"，它不改变对象接口，而是通过包装对象动态增加日志、缓存、重试、UI 效果等能力。外观模式的重点是"简化子系统"，它把网络请求、鉴权、缓存、解析等复杂流程封装成一个更好用的高层接口。简单区分就是：适配器改接口，装饰器加能力，外观简化调用，代理控制访问。

行为型模式里，观察者、策略、命令和责任链最常见。观察者模式解决一对多通知问题，发布者只负责发出变化，订阅者自己注册监听。iOS 中常见实现包括 KVO、`NotificationCenter`、Combine 和 RxSwift。使用时要注意观察者生命周期、线程切换和通知粒度，避免通知过多导致状态难以追踪。

策略模式解决"同一个行为有多种算法"的问题。比如支付可以有信用卡、Apple Pay、支付宝；重试可以有固定间隔、指数退避、立即失败；表单校验可以有手机号、邮箱、密码强度等策略。调用方依赖策略协议，运行时替换具体策略即可。简单策略也可以用闭包实现，复杂策略再抽成独立类型。

```swift
protocol PaymentStrategy {
    var name: String { get }
    func pay(amount: Decimal) async throws
}

struct ApplePayStrategy: PaymentStrategy {
    let name = "Apple Pay"

    func pay(amount: Decimal) async throws {
        print("Pay \(amount) with Apple Pay")
    }
}

struct CardPaymentStrategy: PaymentStrategy {
    let name = "Credit Card"

    func pay(amount: Decimal) async throws {
        print("Pay \(amount) with credit card")
    }
}

final class CheckoutService {
    private var strategy: any PaymentStrategy

    init(strategy: any PaymentStrategy) {
        self.strategy = strategy
    }

    func updateStrategy(_ strategy: any PaymentStrategy) {
        self.strategy = strategy
    }

    func checkout(amount: Decimal) async throws {
        try await strategy.pay(amount: amount)
    }
}
```

命令模式解决"把一次操作保存下来"的问题。命令对象通常包含接收者、参数、执行逻辑，有时还包含撤销逻辑，所以它适合任务队列、操作日志、事务、宏命令和 Undo/Redo。iOS 的 Target-Action 可以理解为命令模式的体现，控件保存 target 和 action，等事件发生时再触发。命令模式和策略模式的区别是：策略封装的是可互换算法，强调"用哪种方式做"；命令封装的是一次请求，强调"把这个操作传递、排队、记录或撤销"。

责任链模式解决"请求可能由多个对象中的某一个处理"的问题。发送者只把请求交给链头，链上的每个处理器判断自己能不能处理，不能处理就交给下一个。iOS 最经典的例子是响应者链，触摸事件从第一响应者沿 `UIView -> UIViewController -> UIWindow -> UIApplication` 传递。网络拦截器也常用责任链，例如认证、签名、缓存、日志、重试各自成为一个处理器。使用责任链时要特别关注处理顺序、链路终止条件，以及无人处理时的兜底逻辑。

生产者消费者模式虽然不属于 GoF 23 种模式，但在 iOS 并发面试中很常见。它通过线程安全的缓冲区连接生产者和消费者，让生产和消费可以用不同速度工作。缓冲区最好是有界的，满了阻塞或丢弃生产，空了阻塞或等待消费，这就是背压。iOS 中可以用 `DispatchSemaphore`、`OperationQueue`、Combine、`AsyncStream` 或 `AsyncChannel` 实现，典型场景包括图片加载与滤镜处理、日志异步写入、网络请求队列和离线数据同步。

最后，设计模式不是越多越好。面试中更好的回答是能说出使用边界：全局唯一资源才考虑单例；创建逻辑变化频繁才抽工厂；参数复杂才上建造者；接口不兼容用适配器；需要动态叠加能力用装饰器；子系统复杂用外观；一对多状态通知用观察者；算法可替换用策略；操作需要排队或撤销用命令；处理者不固定用责任链；生产消费速度不一致用生产者消费者。能把这些模式和 iOS 系统 API、工程场景、缺点取舍联系起来，比单纯背定义更有说服力。
