+++
title = "单例模式"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 2
tags = ["设计模式", "面试"]
categories = ["设计模式", "面试"]
+++
## 定义

单例模式（Singleton Pattern）是一种创建型设计模式，它确保一个类只有一个实例，并提供一个全局访问点来获取该实例。

单例模式的核心要点：
- **唯一性**：整个应用程序生命周期内只存在一个实例
- **全局访问**：提供一个全局访问点获取该实例
- **懒加载**：通常在第一次使用时才创建实例

## 为什么需要单例模式

单例模式要解决的核心问题是：**确保某个类在整个应用中只有一个实例，并提供全局访问点**。

**问题场景**：假设我们正在开发一个App，需要管理用户的登录状态和用户信息。

如果不使用单例，可能会遇到这样的问题：

```swift
class UserManager {
    var currentUser: User?
    var isLoggedIn: Bool = false
    
    func login(user: User) {
        currentUser = user
        isLoggedIn = true
    }
}

// 在登录页面
let userManager1 = UserManager()
userManager1.login(user: user)

// 在个人中心页面
let userManager2 = UserManager()
print(userManager2.isLoggedIn)  // false！因为是不同的实例
```

这种方式有什么问题？

1. **状态不一致**：不同地方创建的UserManager是不同的实例，它们的状态相互独立，导致登录状态无法共享
2. **资源浪费**：如果UserManager管理的是数据库连接、网络会话等资源，创建多个实例会浪费系统资源
3. **数据同步困难**：多个实例之间的数据需要手动同步，容易出错

**单例模式的解决思路**：

单例模式确保整个应用只有一个UserManager实例，所有地方都访问同一个对象：

```swift
class UserManager {
    static let shared = UserManager()
    
    private init() {}
    
    var currentUser: User?
    var isLoggedIn: Bool = false
    
    func login(user: User) {
        currentUser = user
        isLoggedIn = true
    }
}

// 在登录页面
UserManager.shared.login(user: user)

// 在个人中心页面
print(UserManager.shared.isLoggedIn)  // true！同一个实例
```

**适合使用单例的场景**：
- **共享资源访问**：如数据库连接、文件管理器、网络会话
- **全局状态管理**：如用户登录状态、应用配置
- **协调系统操作**：如日志记录器、缓存管理器

**注意**：单例模式是一把双刃剑，虽然方便，但也带来了全局状态、隐藏依赖、难以测试等问题。在使用前应该仔细评估是否真的需要单例。

## iOS中的实现

### Objective-C实现

#### 基础实现（非线程安全）

```objectivec
@interface MySingleton : NSObject
+ (instancetype)sharedInstance;
@end

@implementation MySingleton

static MySingleton *_instance = nil;

+ (instancetype)sharedInstance {
    if (_instance == nil) {
        _instance = [[MySingleton alloc] init];
    }
    return _instance;
}

@end
```

这种实现在单线程环境下工作正常，但在多线程环境下可能创建多个实例。

#### 线程安全实现（dispatch_once）

```objectivec
@interface MySingleton : NSObject
+ (instancetype)sharedInstance;
@end

@implementation MySingleton

+ (instancetype)sharedInstance {
    static MySingleton *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[super allocWithZone:NULL] init];
    });
    return instance;
}

// 防止通过 alloc/init 创建新实例
+ (instancetype)allocWithZone:(struct _NSZone *)zone {
    return [self sharedInstance];
}

// 防止通过 copy 创建新实例
- (id)copyWithZone:(NSZone *)zone {
    return self;
}

// 防止通过 mutableCopy 创建新实例
- (id)mutableCopyWithZone:(NSZone *)zone {
    return self;
}

@end
```

**关键点说明**：
- `dispatch_once`保证代码块只执行一次，且是线程安全的
- 静态变量`instance`声明在方法内部，作用域更小，更安全
- 重写`allocWithZone:`防止通过`[[MySingleton alloc] init]`创建新实例
- 重写`copyWithZone:`和`mutableCopyWithZone:`防止通过复制创建新实例
- 使用`[super allocWithZone:NULL]`而不是`[self alloc]`避免递归调用

### Swift实现

Swift的实现非常简洁，利用`static let`的特性自动保证线程安全和唯一性：

```swift
class MySingleton {
    static let shared = MySingleton()
    
    // 私有化初始化方法，防止外部创建实例
    private init() {
        // 初始化代码
    }
    
    func doSomething() {
        print("Singleton method called")
    }
}

// 使用
MySingleton.shared.doSomething()
```

**Swift单例的特点**：
- **延迟初始化**：只有在第一次访问`shared`时才会初始化
- **线程安全**：`static let` 的初始化由 Swift 语言和运行时保证线程安全
- **只初始化一次**：全局唯一实例
- **私有初始化器**：`private init()`防止外部通过`MySingleton()`创建新实例

## iOS系统中的单例

iOS SDK中有很多系统单例的例子：

```swift
// UIApplication - 应用程序对象
let app = UIApplication.shared

// FileManager - 文件管理器
let fileManager = FileManager.default

// UserDefaults - 用户偏好设置
let defaults = UserDefaults.standard

// NotificationCenter - 通知中心
let notificationCenter = NotificationCenter.default

// URLSession - 网络会话（共享会话）
let session = URLSession.shared

// ProcessInfo - 进程信息
let processInfo = ProcessInfo.processInfo

// Bundle - 应用包信息
let mainBundle = Bundle.main
```

这些系统单例的共同特点：
- 管理全局共享资源
- 提供系统级服务
- 生命周期与应用一致

## 使用场景

单例模式适用于以下场景：

### 1. 共享资源管理

```swift
class DatabaseManager {
    static let shared = DatabaseManager()
    
    private var connection: DatabaseConnection?
    
    private init() {
        // 建立数据库连接
    }
    
    func query(_ sql: String) -> [Row] {
        // 执行查询
    }
}
```

### 2. 配置管理

```swift
class AppConfiguration {
    static let shared = AppConfiguration()
    
    private(set) var apiBaseURL: URL
    private(set) var environment: Environment
    private(set) var isDebugMode: Bool
    
    private init() {
        // 从配置文件加载配置
        self.apiBaseURL = URL(string: "https://api.example.com")!
        self.environment = .production
        self.isDebugMode = false
    }
}
```

### 3. 日志服务

```swift
class Logger {
    static let shared = Logger()
    
    private let queue = DispatchQueue(label: "com.app.logger")
    
    private init() {}
    
    func log(_ message: String, level: LogLevel = .info) {
        queue.async {
            let timestamp = Date()
            print("[\(timestamp)] [\(level)] \(message)")
        }
    }
}
```

### 4. 缓存管理

```swift
class CacheManager {
    static let shared = CacheManager()
    
    private let cache = NSCache<NSString, AnyObject>()
    
    private init() {
        cache.countLimit = 100
    }
    
    func set(_ object: AnyObject, forKey key: String) {
        cache.setObject(object, forKey: key as NSString)
    }
    
    func get(forKey key: String) -> AnyObject? {
        return cache.object(forKey: key as NSString)
    }
}
```

## 优缺点

### 优点

1. **唯一实例控制**：严格控制客户端访问唯一实例，避免资源重复创建
2. **全局访问点**：提供统一的访问入口，使用方便
3. **延迟初始化**：可以实现懒加载，在需要时才创建实例
4. **节省系统资源**：避免重复创建对象，特别是创建开销大的对象

### 缺点

1. **全局状态**：单例本质上是全局变量，可能导致隐式依赖和难以追踪的状态变化

2. **全局可访问和修改**：任何地方都可以访问和修改单例的状态，容易造成意外的副作用

3. **难以测试**：单例使得单元测试变得困难，因为无法轻易替换实例
   - 测试之间可能相互影响（共享状态）
   - 无法为不同测试提供不同的配置
   - 难以进行隔离测试

4. **隐藏依赖**：使用单例的类会隐式依赖单例，依赖关系不明确
   
   什么是隐藏依赖？当一个类内部直接使用单例时，从类的接口（初始化方法、属性、方法签名）上看不出它依赖了什么，这就是隐藏依赖。
   
   ```swift
   class UserService {
       // 从类定义看不出依赖了什么
       init() {}
       
       func login(username: String, password: String) {
           // 突然出现了NetworkManager，这是隐藏的依赖
           NetworkManager.shared.request(...)
           
           // 又出现了Logger，也是隐藏的依赖
           Logger.shared.log("User logged in")
       }
   }
   
   // 使用时看起来很简单，但实际上依赖了很多东西
   let service = UserService()  // 看不出任何依赖
   ```
   
   **隐藏依赖的问题**：
   - 难以理解：不看实现代码，不知道这个类需要什么
   - 难以测试：无法替换依赖为Mock对象
   - 难以维护：依赖关系不清晰，修改时容易出错
   - 难以复用：在其他环境中使用需要确保所有隐藏的单例都存在
   
   **对比：显式依赖（依赖注入）**
   ```swift
   // 显式依赖的例子
   class UserService {
       private let networkManager: NetworkManager
       private let logger: Logger
       
       // 从初始化方法就能看出所有依赖
       init(networkManager: NetworkManager,
            logger: Logger) {
           self.networkManager = networkManager
           self.logger = logger
       }
       
       func login(username: String, password: String) {
           networkManager.request(...)
           logger.log("User logged in")
       }
   }
   
   // 使用时依赖关系一目了然
   let service = UserService(
       networkManager: realNetworkManager,
       logger: realLogger
   )
   
   // 测试时可以轻松注入Mock对象
   let testService = UserService(
       networkManager: mockNetworkManager,
       logger: mockLogger
   )
   ```

5. **违反单一职责原则**：单例类既负责业务逻辑，又负责管理自身实例

6. **并发问题**：在多线程环境下，单例的状态管理需要特别注意
   - 多个线程同时修改单例状态可能导致数据竞争
   - 需要额外的同步机制保护共享状态

## 单例模式的替代方案

### 1. 依赖注入

```swift
// 不使用单例，而是通过依赖注入传入
class UserService {
    private let networkClient: NetworkClient
    
    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }
}

// 使用时注入依赖
let service = UserService(networkClient: RealNetworkClient())

// 测试时注入Mock
let testService = UserService(networkClient: MockNetworkClient())
```

### 2. 环境对象（SwiftUI）

```swift
class AppState: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: User?
}

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        if appState.isLoggedIn {
            MainView()
        } else {
            LoginView()
        }
    }
}
```

## 单例的陷阱与注意事项

### 1. 全局可修改性问题

单例最大的问题是任何地方都可以修改其状态，容易造成不可预期的副作用：

```swift
// 不好的设计：状态完全暴露
class ConfigManager {
    static let shared = ConfigManager()
    
    var apiKey: String = ""
    var timeout: TimeInterval = 30
    var maxRetries: Int = 3
    
    private init() {}
}

// 任何地方都可以修改，难以追踪谁改了什么
ConfigManager.shared.timeout = 0  // 可能导致其他模块出错

// 更好的设计：限制修改权限
class BetterConfigManager {
    static let shared = BetterConfigManager()
    
    // 只读属性
    private(set) var apiKey: String = ""
    private(set) var timeout: TimeInterval = 30
    
    private init() {}
    
    // 通过方法控制修改，可以添加验证逻辑
    func updateTimeout(_ timeout: TimeInterval) {
        guard timeout > 0 else { return }
        self.timeout = timeout
    }
}
```

### 2. 内存泄漏风险

```swift
class Singleton {
    static let shared = Singleton()
    
    // ⚠️ 注意：强引用可能导致循环引用
    var delegate: SomeDelegate?
    var closures: [() -> Void] = []
    
    private init() {}
}

// 解决方案：使用weak引用
class BetterSingleton {
    static let shared = BetterSingleton()
    
    weak var delegate: SomeDelegate?
    private var closures: [() -> Void] = []
    
    private init() {}
}
```

### 3. 单例的重置问题

单例通常不应该被重置，但在测试环境中可能需要：

```swift
class TestableSingleton {
    static let shared = TestableSingleton()
    
    private var state: String = "initial"
    
    private init() {}
    
    // 仅用于测试的重置方法
    #if DEBUG
    func reset() {
        state = "initial"
    }
    #endif
}
```

### 4. 单例与多线程

```swift
class ThreadSafeSingleton {
    static let shared = ThreadSafeSingleton()
    
    private let queue = DispatchQueue(label: "com.app.singleton", attributes: .concurrent)
    private var _data: [String: Any] = [:]
    
    private init() {}
    
    // 读操作 - 并发
    func getData(forKey key: String) -> Any? {
        return queue.sync {
            return _data[key]
        }
    }
    
    // 写操作 - 串行（使用barrier）
    func setData(_ value: Any, forKey key: String) {
        queue.async(flags: .barrier) {
            self._data[key] = value
        }
    }
}
```

## 最佳实践

1. **谨慎使用**：只在真正需要全局唯一实例时使用单例
   - 适合：硬件访问（相机、传感器）、系统服务（文件管理）
   - 不适合：业务逻辑对象、数据模型

2. **线程安全**：确保单例的创建和访问是线程安全的
   - Objective-C使用`dispatch_once`
   - Swift使用`static let`
   - 内部状态访问使用串行队列或锁

3. **完整的单例保护**：防止通过其他方式创建实例
   - 私有化构造函数
   - 重写`allocWithZone:`、`copyWithZone:`等方法

4. **限制可修改性**：保护单例的内部状态
   - 使用`private(set)`限制属性的修改权限
   - 通过方法而非直接属性访问来控制状态变化
   - 在修改方法中添加验证逻辑
   - 考虑使用不可变对象

5. **避免状态滥用**：不要把单例当作全局变量容器
   - 单例应该提供服务，而不是存储大量状态
   - 避免在单例中存储业务数据
   - 尽量设计为无状态或少状态

6. **注意内存管理**：单例的生命周期与应用一致
   - 使用weak引用避免循环引用
   - 及时清理不需要的资源

## 面试常见问题

### Q1: 如何保证单例的线程安全？

**答**：
- **Objective-C**：使用`dispatch_once`保证初始化代码只执行一次
- **Swift**：使用`static let`，语言层面保证只初始化一次且线程安全
- **状态访问**：如果单例内部有可变状态，需要使用串行队列或锁保护

### Q2: 如何防止单例被多次创建？

**答**：
- **Swift**：将`init()`声明为`private`
- **Objective-C**：
  - 重写`allocWithZone:`返回单例实例
  - 重写`copyWithZone:`和`mutableCopyWithZone:`返回self
  - 在`sharedInstance`中使用`[super allocWithZone:NULL]`避免递归

### Q3: 单例模式的缺点是什么？如何解决？

**答**：
- **缺点**：
  - 全局状态，难以追踪状态变化
  - 全局可访问和修改，任何地方都能改变单例状态，容易产生意外副作用
  - 难以单元测试，测试之间会相互影响
  - 隐藏依赖关系，从代码签名看不出依赖
  - 违反单一职责原则
  - 多线程环境下的并发问题
  
- **解决方案**：
  - 使用`private(set)`限制属性修改权限
  - 通过方法而非属性来控制状态变化
  - 使用依赖注入代替直接访问单例
  - 通过协议抽象，便于测试时替换
  - 使用串行队列或锁保护共享状态
  - 考虑使用环境对象（SwiftUI）替代

### Q4: 为什么Swift中使用static let就能保证线程安全？

**答**：Swift中`static let`声明的属性由语言规则保证“初始化一次且线程安全”，由编译器和运行时共同实现：
- 懒加载：第一次访问时才初始化
- 原子性：初始化过程是原子操作
- 线程安全：多线程同时访问时，只有一个线程执行初始化，其他线程等待

### Q5: 单例对象什么时候释放？

**答**：单例对象的生命周期与应用程序一致，通常不会被释放。在应用程序终止时，系统会回收所有内存，包括单例对象。这也是为什么要注意单例中的内存管理，避免不必要的内存占用。

### Q6: 单例模式和静态方法有什么区别？

**答**：
- **单例模式**：
  - 创建一个对象实例
  - 可以遵循协议、继承
  - 可以有实例变量和状态
  - 可以延迟初始化
  
- **静态方法**：
  - 不创建对象实例
  - 只能访问静态成员
  - 无法继承或遵循协议
  - 没有实例状态

选择依据：如果需要状态管理、协议遵循或继承，使用单例；如果只是工具方法集合，使用静态方法。
