+++
title = "SOLID原则"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 3
tags = ["设计原则", "面试"]
categories = ["设计原则", "面试"]
+++
## 概述

SOLID 是面向对象设计的五大基本原则的首字母缩写，由 Robert C. Martin（Uncle Bob）在 2000 年代初期提出。这五个原则是构建可维护、可扩展软件的基础，在 iOS 开发中同样适用。

| 字母 | 原则 | 英文名称 |
|------|------|----------|
| S | 单一职责原则 | Single Responsibility Principle |
| O | 开放封闭原则 | Open-Closed Principle |
| L | 里氏替换原则 | Liskov Substitution Principle |
| I | 接口隔离原则 | Interface Segregation Principle |
| D | 依赖倒置原则 | Dependency Inversion Principle |

## 单一职责原则（Single Responsibility Principle, SRP）

### 定义

> A class should have one, and only one, reason to change.
> 一个类应该只有一个引起它变化的原因。

### 原则解读

单一职责原则要求每个类只负责一项职责。这里的"职责"可以理解为"变化的原因"——如果你能想到多于一个的原因去改变一个类，那么这个类就有多于一个的职责。

**核心思想**：将不同的关注点分离，使每个模块只专注于做好一件事。

### 解决的问题

**1. 代码耦合度高**

当一个类承担多个职责时，这些职责会相互依赖、相互影响。修改其中一个职责的代码，可能会无意中破坏另一个职责的功能。

**2. 难以复用**

如果一个类混合了多个职责，当你只想使用其中一个职责时，不得不引入整个类及其所有依赖。

**3. 维护困难**

职责混杂的类通常代码量大、逻辑复杂，理解和修改都很困难。不同职责的代码交织在一起，修改一处可能产生意想不到的连锁反应。

**4. 测试复杂**

多职责的类需要更多的测试用例，且测试之间可能相互干扰，难以进行独立的单元测试。

### 违反 SRP 的例子

```swift
// 违反 SRP：UserManager 承担了太多职责
class UserManager {
    // 职责1：用户数据管理
    func saveUser(_ user: User) {
        let data = try? JSONEncoder().encode(user)
        UserDefaults.standard.set(data, forKey: "user")
    }
    
    func loadUser() -> User? {
        guard let data = UserDefaults.standard.data(forKey: "user") else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }
    
    // 职责2：网络请求
    func fetchUserFromServer(id: String) async throws -> User {
        let url = URL(string: "https://api.example.com/users/\(id)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(User.self, from: data)
    }
    
    // 职责3：UI 展示
    func showUserProfile(_ user: User, in viewController: UIViewController) {
        let alert = UIAlertController(title: user.name, message: user.email, preferredStyle: .alert)
        viewController.present(alert, animated: true)
    }
    
    // 职责4：数据验证
    func validateEmail(_ email: String) -> Bool {
        let regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: email)
    }
}
```

### 遵循 SRP 的重构

```swift
// 职责1：本地存储
class UserStorage {
    func save(_ user: User) {
        let data = try? JSONEncoder().encode(user)
        UserDefaults.standard.set(data, forKey: "user")
    }
    
    func load() -> User? {
        guard let data = UserDefaults.standard.data(forKey: "user") else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }
}

// 职责2：网络请求
class UserAPIService {
    func fetchUser(id: String) async throws -> User {
        let url = URL(string: "https://api.example.com/users/\(id)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(User.self, from: data)
    }
}

// 职责3：数据验证
class EmailValidator {
    func validate(_ email: String) -> Bool {
        let regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: email)
    }
}

// 职责4：协调各个组件（如果需要）
class UserService {
    private let storage: UserStorage
    private let api: UserAPIService
    private let validator: EmailValidator
    
    init(storage: UserStorage = UserStorage(),
         api: UserAPIService = UserAPIService(),
         validator: EmailValidator = EmailValidator()) {
        self.storage = storage
        self.api = api
        self.validator = validator
    }
    
    func updateUser(_ user: User) async throws {
        guard validator.validate(user.email) else {
            throw ValidationError.invalidEmail
        }
        storage.save(user)
    }
}
```

### iOS 中的 SRP 应用

**ViewController 的职责拆分：**

```swift
// 违反 SRP 的 ViewController（Massive View Controller）
class BadUserViewController: UIViewController {
    // UI 配置、数据获取、业务逻辑、导航...全部混在一起
}

// 遵循 SRP 的结构
class UserViewController: UIViewController {
    private let viewModel: UserViewModel  // 业务逻辑
    private let router: UserRouter        // 导航
    
    // ViewController 只负责：
    // 1. 管理生命周期
    // 2. 绑定 UI 和 ViewModel
    // 3. 处理用户交互
}

class UserViewModel {
    // 负责业务逻辑和数据转换
}

class UserRouter {
    // 负责页面跳转
}
```

## 开放封闭原则（Open-Closed Principle, OCP）

### 定义

> Software entities should be open for extension, but closed for modification.
> 软件实体应该对扩展开放，对修改封闭。

### 原则解读

开放封闭原则是面向对象设计中最重要的原则之一。它的核心思想是：**当需求变化时，应该通过添加新代码来扩展系统功能，而不是修改已有的代码**。

- **对扩展开放**：模块的行为可以被扩展，以满足新的需求
- **对修改封闭**：扩展行为时，不需要修改模块的源代码

实现 OCP 的关键是**抽象**。通过定义稳定的抽象层（如协议/接口），让具体实现依赖于抽象，新功能通过新增实现类来完成。

### 解决的问题

**1. 修改风险**

直接修改已有代码会引入 bug 的风险。已有代码可能经过了充分的测试和生产环境的验证，修改它意味着这些验证需要重新进行。

**2. 回归测试成本**

每次修改现有代码都需要进行回归测试，确保修改没有破坏原有功能。如果通过扩展而非修改来添加功能，原有代码不变，回归测试的范围就小得多。

**3. 代码稳定性**

频繁修改的代码难以稳定。遵循 OCP，核心代码保持不变，新功能通过新增模块实现，系统整体更加稳定。

**4. 并行开发困难**

如果添加新功能需要修改现有代码，多人协作时容易产生冲突。遵循 OCP，不同功能可以由不同人独立开发新的实现类，减少冲突。

### 违反 OCP 的例子

```swift
// 违反 OCP：每次添加新的支付方式都需要修改这个类
class PaymentProcessor {
    enum PaymentType {
        case creditCard
        case applePay
        case wechatPay
        // 添加新支付方式需要修改枚举
    }
    
    func process(amount: Double, type: PaymentType) {
        switch type {
        case .creditCard:
            processCreditCard(amount: amount)
        case .applePay:
            processApplePay(amount: amount)
        case .wechatPay:
            processWechatPay(amount: amount)
        // 添加新支付方式需要修改 switch
        }
    }
    
    private func processCreditCard(amount: Double) { /* ... */ }
    private func processApplePay(amount: Double) { /* ... */ }
    private func processWechatPay(amount: Double) { /* ... */ }
}
```

### 遵循 OCP 的重构

```swift
// 定义支付策略协议
protocol PaymentStrategy {
    var name: String { get }
    func process(amount: Double) async throws -> PaymentResult
}

// 各种支付方式实现协议
class CreditCardPayment: PaymentStrategy {
    let name = "Credit Card"
    
    func process(amount: Double) async throws -> PaymentResult {
        // 信用卡支付逻辑
        return PaymentResult(success: true, transactionId: UUID().uuidString)
    }
}

class ApplePayPayment: PaymentStrategy {
    let name = "Apple Pay"
    
    func process(amount: Double) async throws -> PaymentResult {
        // Apple Pay 支付逻辑
        return PaymentResult(success: true, transactionId: UUID().uuidString)
    }
}

// 添加新支付方式只需创建新类，无需修改现有代码
class WechatPayPayment: PaymentStrategy {
    let name = "WeChat Pay"
    
    func process(amount: Double) async throws -> PaymentResult {
        // 微信支付逻辑
        return PaymentResult(success: true, transactionId: UUID().uuidString)
    }
}

// PaymentProcessor 对扩展开放，对修改封闭
class PaymentProcessor {
    func process(amount: Double, strategy: PaymentStrategy) async throws -> PaymentResult {
        return try await strategy.process(amount: amount)
    }
}

// 使用
let processor = PaymentProcessor()
let result = try await processor.process(amount: 99.99, strategy: ApplePayPayment())
```

### iOS 中的 OCP 应用

**使用协议扩展实现 OCP：**

```swift
// 定义日志协议
protocol Logger {
    func log(_ message: String, level: LogLevel)
}

enum LogLevel {
    case debug, info, warning, error
}

// 控制台日志
class ConsoleLogger: Logger {
    func log(_ message: String, level: LogLevel) {
        print("[\(level)] \(message)")
    }
}

// 文件日志（扩展，无需修改 ConsoleLogger）
class FileLogger: Logger {
    private let fileURL: URL
    
    init(fileURL: URL) {
        self.fileURL = fileURL
    }
    
    func log(_ message: String, level: LogLevel) {
        let logEntry = "[\(Date())] [\(level)] \(message)\n"
        // 写入文件...
    }
}

// 远程日志（继续扩展）
class RemoteLogger: Logger {
    func log(_ message: String, level: LogLevel) {
        // 发送到服务器...
    }
}

// 组合多个 Logger
class CompositeLogger: Logger {
    private let loggers: [Logger]
    
    init(loggers: [Logger]) {
        self.loggers = loggers
    }
    
    func log(_ message: String, level: LogLevel) {
        loggers.forEach { $0.log(message, level: level) }
    }
}
```

## 里氏替换原则（Liskov Substitution Principle, LSP）

### 定义

> Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
> 子类对象应该能够替换其父类对象，而程序的行为不会发生变化。

### 原则解读

里氏替换原则由 Barbara Liskov 在 1987 年提出，是对继承机制的一个重要约束。它的核心思想是：**子类必须能够完全替代其父类**，也就是说，使用父类的地方都可以透明地使用子类，而不会产生任何错误或异常行为。

LSP 强调的是**行为兼容性**，而不仅仅是语法兼容性。子类不仅要实现父类的所有方法，还要保证这些方法的行为符合父类的约定（前置条件、后置条件、不变量等）。

**判断是否违反 LSP 的简单方法**：如果子类的某个方法：
- 抛出父类方法不会抛出的异常
- 加强了前置条件（对输入要求更严格）
- 削弱了后置条件（输出的保证变少了）
- 改变了方法的语义

那么就可能违反了 LSP。

### 解决的问题

**1. 继承滥用**

继承是强耦合关系，使用不当会导致系统脆弱。LSP 提供了一个判断标准，帮助我们决定是否应该使用继承——只有当子类真正"是一个"父类时，继承才是合适的。

**2. 多态失效**

多态的威力在于我们可以统一处理不同类型的对象。如果子类的行为与父类不一致，多态就失去了意义，调用者需要针对不同的子类编写不同的处理逻辑。

**3. 运行时错误**

违反 LSP 的代码在编译时通常不会报错，但运行时可能产生意外的行为或错误。这类 bug 往往难以发现和定位。

**4. 代码脆弱性**

当系统依赖于父类的行为约定时，违反 LSP 的子类会破坏这种约定，导致系统在某些场景下失效，使得代码变得脆弱、不可预测。

### 违反 LSP 的经典例子

```swift
// 经典的长方形-正方形问题
class Rectangle {
    var width: Double
    var height: Double
    
    init(width: Double, height: Double) {
        self.width = width
        self.height = height
    }
    
    func area() -> Double {
        return width * height
    }
}

// 正方形继承长方形 - 违反 LSP
class Square: Rectangle {
    override var width: Double {
        didSet { height = width }  // 强制保持宽高相等
    }
    
    override var height: Double {
        didSet { width = height }  // 强制保持宽高相等
    }
    
    init(side: Double) {
        super.init(width: side, height: side)
    }
}

// 这个函数期望传入 Rectangle，但 Square 会破坏预期行为
func testRectangle(_ rect: Rectangle) {
    rect.width = 5
    rect.height = 4
    // 期望面积是 20，但如果传入 Square，面积会是 16
    assert(rect.area() == 20)  // Square 会导致断言失败！
}
```

### 遵循 LSP 的重构

```swift
// 使用协议而非继承
protocol Shape {
    func area() -> Double
}

struct Rectangle: Shape {
    let width: Double
    let height: Double
    
    func area() -> Double {
        return width * height
    }
}

struct Square: Shape {
    let side: Double
    
    func area() -> Double {
        return side * side
    }
}

// 现在可以安全地使用 Shape 协议
func printArea(_ shape: Shape) {
    print("Area: \(shape.area())")
}
```

### iOS 中违反 LSP 的例子

```swift
// 违反 LSP：子类改变了父类方法的行为
class BaseViewController: UIViewController {
    func fetchData() {
        // 默认实现：从网络获取数据
        print("Fetching from network...")
    }
}

// 这个子类违反了 LSP，因为它完全改变了 fetchData 的行为
class CachedViewController: BaseViewController {
    override func fetchData() {
        // 完全不同的行为：只从缓存读取
        print("Reading from cache only...")
        // 如果调用者期望网络请求，这会导致问题
    }
}
```

### 正确的 LSP 实践

```swift
// 使用协议定义数据获取行为
protocol DataFetching {
    func fetchData() async throws -> Data
}

// 网络获取
class NetworkDataFetcher: DataFetching {
    func fetchData() async throws -> Data {
        // 网络请求
        return Data()
    }
}

// 缓存获取
class CacheDataFetcher: DataFetching {
    func fetchData() async throws -> Data {
        // 从缓存读取
        return Data()
    }
}

// 组合策略：先缓存后网络
class CacheThenNetworkFetcher: DataFetching {
    private let cache: CacheDataFetcher
    private let network: NetworkDataFetcher
    
    init(cache: CacheDataFetcher = CacheDataFetcher(),
         network: NetworkDataFetcher = NetworkDataFetcher()) {
        self.cache = cache
        self.network = network
    }
    
    func fetchData() async throws -> Data {
        do {
            return try await cache.fetchData()
        } catch {
            return try await network.fetchData()
        }
    }
}

// ViewController 依赖抽象
class DataViewController: UIViewController {
    private let fetcher: DataFetching
    
    init(fetcher: DataFetching) {
        self.fetcher = fetcher
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
```

## 接口隔离原则（Interface Segregation Principle, ISP）

### 定义

> Clients should not be forced to depend on interfaces they do not use.
> 客户端不应该被迫依赖它们不使用的接口。

### 原则解读

接口隔离原则关注的是接口的**粒度**问题。它的核心思想是：**接口应该小而专一，而不是大而全**。与其提供一个包含所有方法的"胖接口"，不如提供多个小的、职责单一的"瘦接口"。

这个原则与单一职责原则（SRP）类似，但 SRP 关注的是类的职责，而 ISP 关注的是接口的设计。一个类可以实现多个小接口，但每个接口应该只包含一组相关的方法。

**设计原则**：
- 接口应该是内聚的，所有方法都服务于同一个目的
- 使用者只需要依赖它真正使用的接口
- 宁可多个小接口，不要一个大接口

### 解决的问题

**1. 接口污染**

当一个接口包含太多方法时，实现类可能只需要其中一部分，但被迫实现所有方法。这些空实现或抛出异常的方法就是"接口污染"。

**2. 不必要的依赖**

当调用方依赖一个臃肿的接口时，即使它只使用其中几个方法，它也间接依赖了接口中的其他方法。这种不必要的依赖增加了系统的耦合度。

**3. 修改的连锁反应**

臃肿接口的任何修改（如增加新方法）都会影响所有实现类，即使某些实现类根本不需要这个新方法。这增加了维护成本和引入 bug 的风险。

**4. 重用困难**

小而专一的接口更容易被重用。调用方可以只依赖它需要的接口，而不必引入不相关的依赖。

**5. 测试复杂度**

臃肿的接口需要更多的 Mock 实现，测试代码变得冗长。小接口使得测试更加简单和聚焦。

### 违反 ISP 的例子

```swift
// 违反 ISP：一个臃肿的协议
protocol Worker {
    func work()
    func eat()
    func sleep()
    func attendMeeting()
    func writeReport()
}

// Robot 被迫实现不需要的方法
class Robot: Worker {
    func work() {
        print("Robot working...")
    }
    
    func eat() {
        // Robot 不需要吃饭，但被迫实现
        fatalError("Robots don't eat")
    }
    
    func sleep() {
        // Robot 不需要睡觉
        fatalError("Robots don't sleep")
    }
    
    func attendMeeting() {
        // Robot 不参加会议
        fatalError("Robots don't attend meetings")
    }
    
    func writeReport() {
        print("Generating report...")
    }
}
```

### 遵循 ISP 的重构

```swift
// 拆分成小的、专一的协议
protocol Workable {
    func work()
}

protocol Feedable {
    func eat()
    func sleep()
}

protocol Meetable {
    func attendMeeting()
}

protocol Reportable {
    func writeReport()
}

// Human 实现所有需要的协议
class Human: Workable, Feedable, Meetable, Reportable {
    func work() { print("Human working...") }
    func eat() { print("Human eating...") }
    func sleep() { print("Human sleeping...") }
    func attendMeeting() { print("Human in meeting...") }
    func writeReport() { print("Human writing report...") }
}

// Robot 只实现需要的协议
class Robot: Workable, Reportable {
    func work() { print("Robot working...") }
    func writeReport() { print("Robot generating report...") }
}

// 函数只依赖需要的协议
func assignWork(to worker: Workable) {
    worker.work()
}

func feedWorker(_ worker: Feedable) {
    worker.eat()
    worker.sleep()
}
```

### iOS 中的 ISP 应用

**UITableView 的 DataSource 和 Delegate 就是 ISP 的体现：**

```swift
// Apple 将 UITableView 的回调拆分成多个协议

// 数据源协议 - 只关心数据
protocol UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell
    // ...
}

// 代理协议 - 只关心交互
protocol UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath)
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat
    // ...
}
```

**自定义协议拆分示例：**

```swift
// 违反 ISP 的协议
protocol NetworkService {
    func get(url: URL) async throws -> Data
    func post(url: URL, body: Data) async throws -> Data
    func upload(url: URL, file: URL) async throws -> Data
    func download(url: URL, to destination: URL) async throws
    func webSocket(url: URL) -> WebSocketTask
}

// 遵循 ISP：拆分成多个专一的协议
protocol HTTPGettable {
    func get(url: URL) async throws -> Data
}

protocol HTTPPostable {
    func post(url: URL, body: Data) async throws -> Data
}

protocol FileTransferable {
    func upload(url: URL, file: URL) async throws -> Data
    func download(url: URL, to destination: URL) async throws
}

protocol WebSocketConnectable {
    func connect(url: URL) -> WebSocketTask
}

// 简单的 API 客户端只需要实现 HTTP 方法
class SimpleAPIClient: HTTPGettable, HTTPPostable {
    func get(url: URL) async throws -> Data {
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
    
    func post(url: URL, body: Data) async throws -> Data {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = body
        let (data, _) = try await URLSession.shared.data(for: request)
        return data
    }
}

// ViewModel 只依赖需要的协议
class UserViewModel {
    private let apiClient: HTTPGettable  // 只依赖 GET 功能
    
    init(apiClient: HTTPGettable) {
        self.apiClient = apiClient
    }
}
```

## 依赖倒置原则（Dependency Inversion Principle, DIP）

### 定义

> High-level modules should not depend on low-level modules. Both should depend on abstractions.
> Abstractions should not depend on details. Details should depend on abstractions.
> 高层模块不应该依赖低层模块，两者都应该依赖抽象。
> 抽象不应该依赖细节，细节应该依赖抽象。

### 原则解读

依赖倒置原则是实现松耦合的关键原则。传统的软件设计中，高层模块（业务逻辑）通常直接依赖低层模块（基础设施如数据库、网络等）。DIP 要求我们**倒置**这种依赖关系：

- **传统依赖**：高层 → 低层（业务逻辑直接依赖数据库实现）
- **依赖倒置**：高层 → 抽象 ← 低层（业务逻辑和数据库实现都依赖于抽象接口）

这里的"倒置"体现在：
1. **控制反转**：不是高层模块去创建低层模块，而是由外部注入
2. **抽象导向**：高层按业务需求定义或依赖抽象接口，低层模块去实现该接口（接口也可放在独立共享层）

**实现 DIP 的两个关键手段**：
1. **抽象化**：定义抽象接口（Swift 中的 Protocol）
2. **依赖注入**：通过构造函数、属性或方法将依赖从外部传入

### 解决的问题

**1. 高层与低层紧耦合**

当业务逻辑直接依赖具体实现（如特定的数据库、第三方服务）时，更换实现会导致业务代码的大量修改。

**2. 难以测试**

直接依赖具体实现的代码难以进行单元测试，因为无法轻易替换为 Mock 对象。DIP 使得我们可以注入测试替身，实现真正的单元测试。

**3. 可替换性差**

如果想把 SDWebImage 换成 KingFisher，或把 Alamofire 换成 URLSession，依赖具体实现的代码需要大量修改。依赖抽象则只需提供新的实现类。

**4. 模块独立性差**

遵循 DIP 的模块可以独立开发、独立测试、独立部署。高层模块不需要等待低层模块完成，只要约定好接口即可。

**5. 违反开闭原则**

不遵循 DIP 往往也会违反 OCP。因为当低层实现变化时，高层模块也需要修改。DIP 是实现 OCP 的重要手段。

### 违反 DIP 的例子

```swift
// 违反 DIP：高层模块直接依赖低层模块的具体实现
class MySQLDatabase {
    func save(_ data: Data) {
        print("Saving to MySQL...")
    }
    
    func fetch(id: String) -> Data? {
        print("Fetching from MySQL...")
        return nil
    }
}

// UserRepository 直接依赖 MySQLDatabase 的具体实现
class UserRepository {
    private let database = MySQLDatabase()  // 紧耦合！
    
    func saveUser(_ user: User) {
        let data = try! JSONEncoder().encode(user)
        database.save(data)
    }
    
    func getUser(id: String) -> User? {
        guard let data = database.fetch(id: id) else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }
}
```

问题：
- 无法在测试中使用 Mock 数据库
- 更换数据库实现需要修改 UserRepository
- 高层业务逻辑与低层存储实现紧密耦合

### 遵循 DIP 的重构

```swift
// 定义抽象（协议）
protocol Database {
    func save(_ data: Data, forKey key: String) throws
    func fetch(forKey key: String) -> Data?
    func delete(forKey key: String) throws
}

// 低层模块实现抽象
class MySQLDatabase: Database {
    func save(_ data: Data, forKey key: String) throws {
        print("Saving to MySQL with key: \(key)")
    }
    
    func fetch(forKey key: String) -> Data? {
        print("Fetching from MySQL with key: \(key)")
        return nil
    }
    
    func delete(forKey key: String) throws {
        print("Deleting from MySQL with key: \(key)")
    }
}

class CoreDataDatabase: Database {
    func save(_ data: Data, forKey key: String) throws {
        print("Saving to CoreData with key: \(key)")
    }
    
    func fetch(forKey key: String) -> Data? {
        print("Fetching from CoreData with key: \(key)")
        return nil
    }
    
    func delete(forKey key: String) throws {
        print("Deleting from CoreData with key: \(key)")
    }
}

// 高层模块依赖抽象
class UserRepository {
    private let database: Database  // 依赖抽象！
    
    init(database: Database) {  // 依赖注入
        self.database = database
    }
    
    func saveUser(_ user: User) throws {
        let data = try JSONEncoder().encode(user)
        try database.save(data, forKey: user.id)
    }
    
    func getUser(id: String) -> User? {
        guard let data = database.fetch(forKey: id) else { return nil }
        return try? JSONDecoder().decode(User.self, from: data)
    }
}

// 使用
let mysqlRepo = UserRepository(database: MySQLDatabase())
let coreDataRepo = UserRepository(database: CoreDataDatabase())
```

### iOS 中的依赖注入方式

**1. 构造函数注入（推荐）：**

```swift
class UserViewModel {
    private let userService: UserServiceProtocol
    private let analytics: AnalyticsProtocol
    
    init(userService: UserServiceProtocol, analytics: AnalyticsProtocol) {
        self.userService = userService
        self.analytics = analytics
    }
}
```

**2. 属性注入：**

```swift
class UserViewModel {
    var userService: UserServiceProtocol!
    var analytics: AnalyticsProtocol!
}

// 使用
let viewModel = UserViewModel()
viewModel.userService = UserService()
viewModel.analytics = FirebaseAnalytics()
```

**3. 方法注入：**

```swift
class UserViewModel {
    func loadUser(using service: UserServiceProtocol) async {
        // ...
    }
}
```

**4. 使用依赖注入容器：**

```swift
// 简单的 DI 容器
class Container {
    static let shared = Container()
    private var factories: [String: () -> Any] = [:]
    
    func register<T>(_ type: T.Type, factory: @escaping () -> T) {
        let key = String(describing: type)
        factories[key] = factory
    }
    
    func resolve<T>(_ type: T.Type) -> T {
        let key = String(describing: type)
        guard let factory = factories[key] else {
            fatalError("No registration for \(key)")
        }
        return factory() as! T
    }
}

// 注册依赖
Container.shared.register(UserServiceProtocol.self) { UserService() }
Container.shared.register(AnalyticsProtocol.self) { FirebaseAnalytics() }

// 解析依赖
let userService = Container.shared.resolve(UserServiceProtocol.self)
```

### 测试中的应用

```swift
// Mock 实现用于测试
class MockDatabase: Database {
    var savedData: [String: Data] = [:]
    var saveCallCount = 0
    
    func save(_ data: Data, forKey key: String) throws {
        savedData[key] = data
        saveCallCount += 1
    }
    
    func fetch(forKey key: String) -> Data? {
        return savedData[key]
    }
    
    func delete(forKey key: String) throws {
        savedData.removeValue(forKey: key)
    }
}

// 测试
class UserRepositoryTests: XCTestCase {
    func testSaveUser() throws {
        // Arrange
        let mockDatabase = MockDatabase()
        let repository = UserRepository(database: mockDatabase)
        let user = User(id: "1", name: "Test", email: "test@example.com")
        
        // Act
        try repository.saveUser(user)
        
        // Assert
        XCTAssertEqual(mockDatabase.saveCallCount, 1)
        XCTAssertNotNil(mockDatabase.savedData["1"])
    }
}
```

## SOLID常见误区

- **过度应用**：不是所有代码都需要严格遵循 SOLID
- **为了模式而模式**：SOLID 是手段不是目的
- **忽视权衡**：更多的抽象意味着更多的间接层，需要权衡复杂度
