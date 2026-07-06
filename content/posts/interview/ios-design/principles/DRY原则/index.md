+++
title = "DRY原则"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 1
tags = ["设计原则", "面试"]
categories = ["设计原则", "面试"]
+++
## 什么是DRY原则？

DRY（Don't Repeat Yourself）原则是由 Andy Hunt 和 Dave Thomas 在《The Pragmatic Programmer》一书中提出的软件开发原则。

> Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.
> 系统中的每一项知识都必须有一个单一、明确、权威的表示。

DRY 原则的核心不仅仅是"不要复制粘贴代码"，而是确保**知识和逻辑在系统中只存在一处**。

## 核心思想

### 知识的单一来源

DRY 原则强调的是"知识"的不重复，而非简单的"代码"不重复。知识包括：

- **业务规则**：如"订单金额超过100元免运费"
- **数据结构定义**：如用户模型的字段
- **算法逻辑**：如价格计算公式
- **配置信息**：如 API 地址、超时时间

```swift
// 违反 DRY：同一个业务规则在多处定义
class OrderService {
    func calculateShipping(orderAmount: Double) -> Double {
        if orderAmount > 100 {  // 业务规则：100元以上免运费
            return 0
        }
        return 10
    }
}

class CartViewController {
    func updateShippingLabel() {
        if cartTotal > 100 {  // 重复的业务规则！
            shippingLabel.text = "免运费"
        } else {
            shippingLabel.text = "运费：¥10"
        }
    }
}

class CheckoutViewModel {
    func getShippingFee() -> Double {
        return totalAmount > 100 ? 0 : 10  // 又是重复！
    }
}
```

```swift
// 遵循 DRY：业务规则只定义一次
struct ShippingPolicy {
    static let freeShippingThreshold: Double = 100
    static let standardShippingFee: Double = 10
    
    static func calculateFee(for orderAmount: Double) -> Double {
        return orderAmount > freeShippingThreshold ? 0 : standardShippingFee
    }
    
    static func isFreeShipping(for orderAmount: Double) -> Bool {
        return orderAmount > freeShippingThreshold
    }
}

// 所有地方都使用这个单一来源
class OrderService {
    func calculateShipping(orderAmount: Double) -> Double {
        return ShippingPolicy.calculateFee(for: orderAmount)
    }
}

class CartViewController {
    func updateShippingLabel() {
        if ShippingPolicy.isFreeShipping(for: cartTotal) {
            shippingLabel.text = "免运费"
        } else {
            shippingLabel.text = "运费：¥\(ShippingPolicy.standardShippingFee)"
        }
    }
}
```

### DRY vs WET

WET 是 DRY 的反义词，常见的解释有：
- Write Everything Twice（什么都写两遍）
- We Enjoy Typing（我们喜欢打字）
- Waste Everyone's Time（浪费大家的时间）

## iOS开发中的DRY实践

### 1. 使用 Extension 复用代码

```swift
// 违反 DRY：多处重复的日期格式化代码
class OrderCell: UITableViewCell {
    func configure(with order: Order) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        dateLabel.text = formatter.string(from: order.createdAt)
    }
}

class MessageCell: UITableViewCell {
    func configure(with message: Message) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        timeLabel.text = formatter.string(from: message.timestamp)
    }
}
```

```swift
// 遵循 DRY：通过 Extension 复用
extension Date {
    func formatted(as format: String = "yyyy-MM-dd HH:mm") -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter.string(from: self)
    }
    
    var displayString: String {
        return formatted()
    }
    
    var shortDisplayString: String {
        return formatted(as: "MM-dd HH:mm")
    }
}

// 使用
class OrderCell: UITableViewCell {
    func configure(with order: Order) {
        dateLabel.text = order.createdAt.displayString
    }
}

class MessageCell: UITableViewCell {
    func configure(with message: Message) {
        timeLabel.text = message.timestamp.displayString
    }
}
```

### 2. 使用协议和默认实现

```swift
// 违反 DRY：多个 ViewController 重复实现相同的加载逻辑
class UserListViewController: UIViewController {
    var isLoading = false
    let activityIndicator = UIActivityIndicatorView()
    
    func showLoading() {
        isLoading = true
        activityIndicator.startAnimating()
        view.isUserInteractionEnabled = false
    }
    
    func hideLoading() {
        isLoading = false
        activityIndicator.stopAnimating()
        view.isUserInteractionEnabled = true
    }
}

class OrderListViewController: UIViewController {
    var isLoading = false
    let activityIndicator = UIActivityIndicatorView()
    
    func showLoading() {
        // 完全相同的代码...
    }
    
    func hideLoading() {
        // 完全相同的代码...
    }
}
```

```swift
// 遵循 DRY：使用协议和默认实现
protocol LoadingPresentable: AnyObject {
    var loadingIndicator: UIActivityIndicatorView { get }
    var containerView: UIView { get }
}

extension LoadingPresentable {
    func showLoading() {
        loadingIndicator.startAnimating()
        containerView.isUserInteractionEnabled = false
    }
    
    func hideLoading() {
        loadingIndicator.stopAnimating()
        containerView.isUserInteractionEnabled = true
    }
}

// UIViewController 的便捷扩展
extension LoadingPresentable where Self: UIViewController {
    var containerView: UIView { return view }
}

// 使用
class UserListViewController: UIViewController, LoadingPresentable {
    let loadingIndicator = UIActivityIndicatorView(style: .large)
    // showLoading() 和 hideLoading() 自动可用
}

class OrderListViewController: UIViewController, LoadingPresentable {
    let loadingIndicator = UIActivityIndicatorView(style: .large)
    // 同样自动可用
}
```

### 3. 使用泛型消除重复

```swift
// 违反 DRY：为每种类型写重复的网络请求代码
class UserAPI {
    func fetchUsers(completion: @escaping (Result<[User], Error>) -> Void) {
        let url = URL(string: "https://api.example.com/users")!
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            do {
                let users = try JSONDecoder().decode([User].self, from: data)
                completion(.success(users))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

class ProductAPI {
    func fetchProducts(completion: @escaping (Result<[Product], Error>) -> Void) {
        // 几乎完全相同的代码...
    }
}
```

```swift
// 遵循 DRY：使用泛型
class APIClient {
    static let shared = APIClient()
    private let baseURL = "https://api.example.com"
    
    func fetch<T: Decodable>(_ endpoint: String) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              200..<300 ~= httpResponse.statusCode else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// 使用
let users: [User] = try await APIClient.shared.fetch("/users")
let products: [Product] = try await APIClient.shared.fetch("/products")
let orders: [Order] = try await APIClient.shared.fetch("/orders")
```

### 4. 配置集中管理

```swift
// 违反 DRY：配置信息散落各处
class NetworkManager {
    let timeout: TimeInterval = 30
    let baseURL = "https://api.example.com"
}

class ImageLoader {
    let timeout: TimeInterval = 30  // 重复！
    let baseURL = "https://cdn.example.com"
}

class AnalyticsManager {
    let timeout: TimeInterval = 30  // 又重复！
}
```

```swift
// 遵循 DRY：集中配置
enum AppConfig {
    enum Network {
        static let timeout: TimeInterval = 30
        static let apiBaseURL = "https://api.example.com"
        static let cdnBaseURL = "https://cdn.example.com"
    }
    
    enum Cache {
        static let maxMemoryCost = 50 * 1024 * 1024  // 50MB
        static let maxDiskSize = 200 * 1024 * 1024  // 200MB
    }
    
    enum UI {
        static let animationDuration: TimeInterval = 0.3
        static let cornerRadius: CGFloat = 8
    }
}

// 使用
class NetworkManager {
    let timeout = AppConfig.Network.timeout
    let baseURL = AppConfig.Network.apiBaseURL
}
```

### 5. 使用计算属性避免状态重复

```swift
// 违反 DRY：维护冗余状态
class ShoppingCart {
    var items: [CartItem] = []
    var totalPrice: Double = 0  // 冗余！需要手动同步
    var itemCount: Int = 0      // 冗余！需要手动同步
    
    func addItem(_ item: CartItem) {
        items.append(item)
        totalPrice += item.price * Double(item.quantity)  // 容易忘记更新
        itemCount += item.quantity
    }
    
    func removeItem(at index: Int) {
        let item = items[index]
        totalPrice -= item.price * Double(item.quantity)  // 容易出错
        itemCount -= item.quantity
        items.remove(at: index)
    }
}
```

```swift
// 遵循 DRY：使用计算属性
class ShoppingCart {
    var items: [CartItem] = []
    
    // 计算属性：总是从 items 计算得出，保证一致性
    var totalPrice: Double {
        items.reduce(0) { $0 + $1.price * Double($1.quantity) }
    }
    
    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }
    
    var isEmpty: Bool {
        items.isEmpty
    }
    
    func addItem(_ item: CartItem) {
        items.append(item)
        // 不需要手动更新 totalPrice 和 itemCount
    }
    
    func removeItem(at index: Int) {
        items.remove(at: index)
        // 自动保持一致性
    }
}
```

## 常见误区

### 误区1：所有相似代码都要合并

```swift
// 这两个函数看起来相似，但它们代表不同的业务概念
func calculateOrderDiscount(price: Double) -> Double {
    return price > 100 ? price * 0.1 : 0
}

func calculateMembershipDiscount(price: Double) -> Double {
    return price > 100 ? price * 0.1 : 0
}

// 错误的 DRY：强行合并不同的业务概念
func calculateDiscount(price: Double) -> Double {
    return price > 100 ? price * 0.1 : 0
}

// 问题：当订单折扣和会员折扣的规则各自变化时，你会陷入困境
```

**正确做法**：如果两段代码只是"恰好相同"而非"本质相同"，就不应该合并。判断标准是：当其中一个需要变化时，另一个是否也应该跟着变化？

### 误区2：过度抽象

```swift
// 过度 DRY：为了消除简单的重复而引入复杂的抽象
protocol Stringifiable {
    var stringValue: String { get }
}

extension Int: Stringifiable {
    var stringValue: String { String(self) }
}

extension Double: Stringifiable {
    var stringValue: String { String(self) }
}

// 实际上直接用 String(value) 更清晰
```

**正确做法**：如果抽象带来的复杂度超过了重复代码本身的问题，那就保留重复。

### 误区3：忽视上下文的 DRY

```swift
// 不同层级可能需要不同的数据模型
// API 层
struct UserDTO: Codable {
    let id: String
    let name: String
    let email: String
    let created_at: String  // API 返回字符串
}

// 领域层
struct User {
    let id: String
    let name: String
    let email: String
    let createdAt: Date  // 领域模型用 Date
}

// 这不是重复！它们属于不同的层级，有不同的职责
```

### 误区4：DRY 与性能的权衡

```swift
// 有时"重复"是有意义的，比如性能优化
class HighPerformanceRenderer {
    // 内联展开可能比抽象调用更快
    func renderOptimized() {
        // 直接写具体逻辑，而非调用通用方法
        // 在性能关键路径上，这是可接受的
    }
}
```

## DRY 的正确应用

### Rule of Three（三次法则）

一个实用的经验法则：当代码第三次重复出现时，再考虑抽象。

```swift
// 第一次：直接写
func fetchUsers() { /* ... */ }

// 第二次：可以接受一定程度的重复
func fetchProducts() { /* ... */ }

// 第三次：是时候抽象了
func fetch<T: Decodable>(_ endpoint: String) async throws -> T { /* ... */ }
```

### 判断是否应该 DRY 的问题清单

在决定是否消除重复之前，问自己：

1. **这是"恰好相同"还是"本质相同"？**
   - 如果业务规则变化时两处应该同步变化，则本质相同
   
2. **抽象是否增加了理解成本？**
   - 简单的重复可能比复杂的抽象更好

3. **变化的可能性有多大？**
   - 如果某段代码几乎不会变化，重复的危害较小

4. **团队成员能否理解这个抽象？**
   - 过度聪明的代码比简单的重复更危险

## 与其他原则的关系

### DRY 与 SRP

单一职责原则有助于实现 DRY。当职责明确时，相关的知识自然会集中在一处。

```swift
// SRP 帮助 DRY
class PriceCalculator {  // 单一职责：计算价格
    func calculate(items: [Item], discount: Discount?) -> Double {
        // 所有价格计算逻辑集中于此
    }
}
```

### DRY 与 KISS

DRY 和 KISS 有时会冲突。过度追求 DRY 可能导致过于复杂的抽象，违反 KISS。需要在两者间找到平衡。

### DRY 与开放封闭原则

消除重复通常需要引入抽象，而这正是 OCP 所提倡的。好的抽象既能消除重复，又能使系统对扩展开放。
