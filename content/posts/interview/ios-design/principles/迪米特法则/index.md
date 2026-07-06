+++
title = "迪米特法则"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 4
tags = ["设计原则", "面试"]
categories = ["设计原则", "面试"]
+++
## 什么是迪米特法则？

迪米特法则（Law of Demeter, LoD）也称为**最少知识原则**（Least Knowledge Principle, LKP），由 Ian Holland 在 1987 年提出。

> Each unit should have only limited knowledge about other units: only units "closely" related to the current unit.
> 每个单元应该只对与其紧密相关的单元有有限的了解。

更通俗的表述是：**只和直接朋友交流，不要和陌生人说话**。

## 核心思想

### 什么是"直接朋友"？

一个对象的"直接朋友"包括：

1. **当前对象本身**（this/self）
2. **作为参数传入的对象**
3. **当前对象创建的对象**
4. **当前对象的成员变量**
5. **全局对象**（如单例，技术上可访问，但应谨慎依赖）

```swift
class Person {
    let wallet: Wallet  // 成员变量 - 直接朋友
    
    func buyItem(shop: Shop, item: Item) {  // 参数 - 直接朋友
        let receipt = Receipt()  // 自己创建的对象 - 直接朋友
        
        // 以下都是与直接朋友交流
        let money = wallet.getMoney()
        shop.sell(item: item)
        receipt.record(item: item)
    }
}
```

### 什么是"陌生人"？

如果需要通过**多层对象**去访问另一个对象，那个被间接访问的对象就是"陌生人"。

```swift
// 违反迪米特法则：深层链式调用
class Customer {
    let wallet: Wallet
    
    func pay(shop: Shop, amount: Double) {
        // 访问了三层结构：wallet -> creditCard -> bank
        // Customer 不应该知道信用卡内部有银行网关
        shop.charge(wallet.creditCard.bank.paymentGateway, amount: amount)
    }
}

// 典型的违规链式调用
order.customer.address.city.name  // 访问了太多陌生人
```


## iOS开发中的迪米特法则实践

### 1. 避免链式属性访问

```swift
// 违反迪米特法则
class OrderViewController: UIViewController {
    var order: Order?
    
    func displayCustomerCity() {
        // 链式访问：知道太多内部结构
        let city = order?.customer?.address?.city?.name
        cityLabel.text = city
    }
}

// 问题：
// 1. OrderViewController 需要了解 Order、Customer、Address、City 的结构
// 2. 任何中间结构的变化都会影响这段代码
// 3. 需要处理多层可选值
```

```swift
// 遵循迪米特法则：封装访问路径
struct Order {
    let customer: Customer
    
    // 提供直接的访问方法
    var customerCityName: String? {
        return customer.cityName
    }
}

struct Customer {
    let address: Address
    
    var cityName: String? {
        return address.cityName
    }
}

struct Address {
    let city: City?
    
    var cityName: String? {
        return city?.name
    }
}

// 使用
class OrderViewController: UIViewController {
    var order: Order?
    
    func displayCustomerCity() {
        // 简洁，只和直接朋友（order）交流
        cityLabel.text = order?.customerCityName
    }
}
```

### 2. 使用中介者/外观模式

```swift
// 违反迪米特法则：ViewController 直接操作多个底层模块
class CheckoutViewController: UIViewController {
    func checkout() {
        // 直接和多个模块交互
        let cart = CartManager.shared.getCart()
        let user = UserManager.shared.currentUser
        let inventory = InventoryService.shared
        let payment = PaymentService.shared
        let shipping = ShippingService.shared
        
        // 检查库存
        for item in cart.items {
            if !inventory.checkAvailability(item.productId, quantity: item.quantity) {
                showError("库存不足")
                return
            }
        }
        
        // 计算运费
        let shippingFee = shipping.calculate(address: user.address, items: cart.items)
        
        // 处理支付
        let total = cart.total + shippingFee
        payment.process(amount: total, method: user.paymentMethod)
        
        // ... 更多逻辑
    }
}
```

```swift
// 遵循迪米特法则：引入 Facade（外观）
class CheckoutFacade {
    private let cartManager: CartManager
    private let userManager: UserManager
    private let inventoryService: InventoryService
    private let paymentService: PaymentService
    private let shippingService: ShippingService
    
    init(
        cartManager: CartManager = .shared,
        userManager: UserManager = .shared,
        inventoryService: InventoryService = .shared,
        paymentService: PaymentService = .shared,
        shippingService: ShippingService = .shared
    ) {
        self.cartManager = cartManager
        self.userManager = userManager
        self.inventoryService = inventoryService
        self.paymentService = paymentService
        self.shippingService = shippingService
    }
    
    func checkout() async throws -> CheckoutResult {
        let cart = cartManager.getCart()
        let user = userManager.currentUser
        
        // 检查库存
        try await validateInventory(for: cart)
        
        // 计算总价
        let shippingFee = try await calculateShipping(for: cart, to: user.address)
        let total = cart.total + shippingFee
        
        // 处理支付
        let paymentResult = try await processPayment(amount: total, method: user.paymentMethod)
        
        return CheckoutResult(orderId: paymentResult.orderId, total: total)
    }
    
    private func validateInventory(for cart: Cart) async throws { /* ... */ }
    private func calculateShipping(for cart: Cart, to address: Address) async throws -> Double { /* ... */ }
    private func processPayment(amount: Double, method: PaymentMethod) async throws -> PaymentResult { /* ... */ }
}

// ViewController 只和 Facade 交互
class CheckoutViewController: UIViewController {
    private let checkoutFacade = CheckoutFacade()
    
    func checkout() {
        Task {
            do {
                let result = try await checkoutFacade.checkout()
                showSuccess("订单号：\(result.orderId)")
            } catch {
                showError(error.localizedDescription)
            }
        }
    }
}
```

### 3. 委托模式的应用

```swift
// 违反迪米特法则：直接访问内部对象
class MusicPlayer {
    let audioEngine: AVAudioEngine
    let playerNode: AVAudioPlayerNode
    
    func play() {
        // 外部可以直接访问和操作内部组件
        playerNode.play()
    }
}

// 外部代码可能这样使用
let player = MusicPlayer()
player.audioEngine.connect(player.playerNode, to: someOtherNode, format: nil)  // 违反！
player.playerNode.volume = 0.5  // 违反！
```

```swift
// 遵循迪米特法则：隐藏内部实现
class MusicPlayer {
    private let audioEngine: AVAudioEngine
    private let playerNode: AVAudioPlayerNode
    
    var volume: Float {
        get { playerNode.volume }
        set { playerNode.volume = newValue }
    }
    
    var isPlaying: Bool {
        playerNode.isPlaying
    }
    
    func play() {
        do {
            try audioEngine.start()
            playerNode.play()
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }
    
    func pause() {
        playerNode.pause()
    }
    
    func stop() {
        playerNode.stop()
        audioEngine.stop()
    }
}

// 外部代码只能通过公开的接口操作
let player = MusicPlayer()
player.volume = 0.5
player.play()
```

### 4. 数据传输对象（DTO）

```swift
// 违反迪米特法则：直接传递领域对象
class OrderDetailViewController: UIViewController {
    var order: Order?  // Order 是复杂的领域对象
    
    func updateUI() {
        // ViewController 需要了解 Order 的完整结构
        titleLabel.text = order?.id
        dateLabel.text = order?.createdAt.formatted()
        statusLabel.text = order?.status.displayName
        
        // 访问嵌套对象
        customerLabel.text = order?.customer.name
        addressLabel.text = order?.customer.address.fullAddress
        
        // 计算派生数据
        let itemCount = order?.items.reduce(0) { $0 + $1.quantity }
        itemCountLabel.text = "\(itemCount ?? 0) 件商品"
    }
}
```

```swift
// 遵循迪米特法则：使用 DTO/ViewModel
struct OrderDetailViewModel {
    let orderId: String
    let formattedDate: String
    let statusText: String
    let customerName: String
    let deliveryAddress: String
    let itemCountText: String
    let totalPriceText: String
    
    init(order: Order) {
        self.orderId = order.id
        self.formattedDate = order.createdAt.formatted()
        self.statusText = order.status.displayName
        self.customerName = order.customer.name
        self.deliveryAddress = order.customer.address.fullAddress
        
        let itemCount = order.items.reduce(0) { $0 + $1.quantity }
        self.itemCountText = "\(itemCount) 件商品"
        self.totalPriceText = "¥\(order.totalAmount)"
    }
}

class OrderDetailViewController: UIViewController {
    var viewModel: OrderDetailViewModel?  // 只依赖简单的 ViewModel
    
    func updateUI() {
        // ViewController 只需要知道 ViewModel 的扁平结构
        titleLabel.text = viewModel?.orderId
        dateLabel.text = viewModel?.formattedDate
        statusLabel.text = viewModel?.statusText
        customerLabel.text = viewModel?.customerName
        addressLabel.text = viewModel?.deliveryAddress
        itemCountLabel.text = viewModel?.itemCountText
    }
}
```

### 5. 协议隔离

```swift
// 违反迪米特法则：依赖完整对象
class ReportGenerator {
    func generateSalesReport(orders: [Order]) -> Report {
        // 只需要订单金额，却依赖了完整的 Order 对象
        let totalSales = orders.reduce(0.0) { $0 + $1.totalAmount }
        return Report(type: .sales, value: totalSales)
    }
}
```

```swift
// 遵循迪米特法则：只依赖需要的接口
protocol HasAmount {
    var amount: Double { get }
}

extension Order: HasAmount {
    var amount: Double { totalAmount }
}

class ReportGenerator {
    func generateSalesReport(items: [HasAmount]) -> Report {
        // 只依赖需要的数据
        let totalSales = items.reduce(0.0) { $0 + $1.amount }
        return Report(type: .sales, value: totalSales)
    }
}

// 可以传入任何符合 HasAmount 的类型
let orders: [Order] = []
let report = generator.generateSalesReport(items: orders)
```

## 优缺点分析

### 优点

**1. 降低耦合**

```swift
// 高耦合：A 依赖 B, C, D
class A {
    func doSomething(b: B) {
        b.c.d.action()  // A 知道 B, C, D 的结构
    }
}

// 低耦合：A 只依赖 B
class A {
    func doSomething(b: B) {
        b.action()  // A 只知道 B
    }
}

class B {
    private let c: C
    
    func action() {
        c.performAction()
    }
}
```

**2. 提高可维护性**

当内部结构变化时，只需要修改封装层：

```swift
// 地址结构从 city 字符串变成 City 对象
// 只需要修改 Address 的 cityName 计算属性
struct Address {
    // 旧实现
    // let city: String
    // var cityName: String { city }
    
    // 新实现
    let city: City
    var cityName: String { city.name }
}

// 外部代码无需修改
```

**3. 便于测试**

依赖更少，Mock 更简单：

```swift
// 高耦合版本需要 Mock 整个依赖链
let mockOrder = Order(
    customer: Customer(
        address: Address(
            city: City(name: "Beijing")
        )
    )
)

// 低耦合版本只需要简单的 Mock
struct MockOrder: OrderDisplayable {
    var customerCityName: String? = "Beijing"
}
```

### 缺点

**1. 可能产生大量包装方法**

```swift
class Wrapper {
    private let inner: Inner
    
    // 需要暴露 inner 的每个需要的方法
    func method1() { inner.method1() }
    func method2() { inner.method2() }
    func method3() { inner.method3() }
    // ... 可能有很多
}
```

**2. 增加间接层**

```swift
// 直接访问（简单但违反 LoD）
user.wallet.creditCard.number

// 间接访问（符合 LoD 但有中间层）
user.creditCardNumber  // -> wallet.creditCardNumber -> creditCard.number
```

**3. 可能导致接口膨胀**

为了不暴露内部对象，可能需要在外层添加很多委托方法。

### 权衡建议

**适合严格遵循的场景：**
- 公共 API / SDK 设计
- 跨模块边界
- 核心业务逻辑

**可以适度放松的场景：**
- 同一模块内部
- 数据模型的属性访问
- 原型/实验性代码

```swift
// 模块内部，简单的数据访问可以接受链式调用
// 这在同一个模块内是可以接受的
let userName = response.data.user.name

// 但对外暴露的 API 应该封装好
public var userName: String? {
    response.data.user.name
}
```
