+++
title = "Objective-C与Swift区别"
date = '2026-05-08T13:07:14+08:00'
draft = false
weight = 7
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
## 语言设计

### Objective-C
- 是C的超集，在C的基础上添加了Smalltalk风格的消息传递机制
- 对象间交互不通过调用方法而是发送消息，以实现面向对象编程和超高的动态性
- 动态性由 Objective-C Runtime 系统支持，可以在运行时修改类结构、方法交换等，详见 [Runtime]({{< relref "/posts/interview/ios-basics/runtime" >}})
- 弱类型语言，核心类型`id`可以指向任何Objective-C对象

### Swift
- 从很多现代化语言中汲取精华，是一门偏重于安全、性能的现代化语言
- Swift 也有自己的运行时系统（Swift Runtime），但设计哲学完全不同，更强调编译期优化
- 强类型语言，编译器在编译阶段进行严格的类型检查

## 语法特性

### Objective-C
- 语法冗长，需要显式声明类型
- 命名通常较长且需要添加前缀避免冲突
- 需要单独的`.h`和`.m`文件声明接口和实现
- 引用其他文件/模块必须要`import`（[Objective-C中import详解]({{< relref "/posts/interview/ios-basics/Objective-C中import详解" >}})）
- 协议不支持默认实现
- 泛型是"轻量级泛型"，仅用于编译时类型检查，运行时类型信息会被擦除

### Swift
- 语法简洁，强大的类型推断减少冗余的类型声明
- 有命名空间（模块）的存在避免命名冲突
- 不需要单独的头文件声明接口
- 默认情况下变量必须初始化
- 引用同模块的其他文件不需要`import`（[Swift中import详解]({{< relref "/posts/interview/ios-basics/Swift中import详解" >}})）
- 协议支持默认实现、支持拓展，支持关联类型以实现泛型协议
- 值类型也可以遵守协议
- 泛型在编译时进行类型特化优化，支持完整的泛型元编程

## 内存管理

### Objective-C
- 大部分都是引用类型，依赖引用计数管理内存
- ARC在编译时自动插入`retain`、`release`、`autorelease`调用
- 64位系统使用优化的isa（Non-pointer isa），通过位域在isa中嵌入引用计数（`extra_rc`字段），溢出时使用SideTable存储
- 实例变量（ivar）会被Runtime自动初始化为0/nil

### Swift
- 引用类型也是依赖引用计数管理内存
- 存在大量的值类型，例如结构体、枚举、数组、字典等
- 非逃逸的值类型的内存存在栈区由系统进行自动管理
- 纯Swift类的引用计数直接存储在对象头部的RefCount字段中，无需SideTable，访问更高效
- 编译器在编译时就确保了初始化，不需要运行时统一清零

拓展：[值类型和引用类型的区别]({{< relref "/posts/interview/ios-basics/值类型和引用类型的区别" >}})
拓展：[iOS中的内存管理]({{< relref "/posts/interview/ios-basics/iOS中的内存管理" >}})

## 性能对比

### Objective-C
- 基于消息传递机制本质上是动态派发，运行时查找方法实现，有一定开销
- ARC管理引用计数也有开销
- 引用类型内存存在堆区，内存管理的性能开销会比栈区多很多

### Swift
- 方法派发尽可能使用静态派发（如对`final`类/方法、私有方法、值类型方法的调用）
- 编译器可以内联优化，速度接近C
  - **内联优化**：比如A方法调用B方法，B方法调用C方法，代码编写调用A方法时编译器通过内联直接调用C方法的实现
- 值类型内存分配在栈区，性能开销相对较小
- 虽然值类型是深拷贝，Swift为了优化值类型性能引入写时拷贝（Copy-on-Write）机制，值类型只在写操作发生深拷贝，其他时候都是浅拷贝

## 安全性

### Objective-C
- 弱类型（动态类型）占主导
- 核心类型`id`可以指向任何Objective-C对象
- 编译器几乎不做类型检查，会有运行时崩溃的风险（如向不响应某消息的对象发送该消息）
- `nil`消息发送不会崩溃但可能导致逻辑错误，不容易感知
- 局部变量不会自动初始化，可能包含栈上的垃圾数据（未定义行为）

### Swift
- 可选类型强制处理空值，编译器强制解包检查
- 强类型和编译时检查阻止了大量常见错误
- 变量必须初始化后才能使用，编译器在编译阶段强制检查，消除未定义行为
- 强制初始化使编译器能更精确地追踪变量生命周期，带来更多优化机会
- 数组越界等操作会在运行时触发明确的崩溃，便于定位问题

## 编程范式

### Objective-C
- 主要是面向对象编程（OOP）
- 通过继承实现代码复用
- 依赖Runtime实现面向切面编程（AOP），如Method Swizzling

### Swift
- 拥抱多范式，对函数式编程、面向协议编程（POP）、声明式编程很友好
- 通过协议扩展提供默认实现，协议组合替代多继承
- 值类型（struct/enum）也可以遵循协议，不再局限于类

拓展：[OOP、POP与AOP]({{< relref "/posts/interview/ios-advanced/OOP-POP-AOP" >}})

## 方法派发方式

### Objective-C
- **方法调用**只支持消息派发（动态派发）
- 方法调用本质是消息发送（`objc_msgSend`），详见 [Runtime]({{< relref "/posts/interview/ios-basics/runtime" >}})
- 消息发送流程：检查receiver是否为nil → 通过isa找到类对象 → 在方法缓存中查找 → 在方法列表中查找 → 沿superclass链向上查找 → 消息转发

### Swift
- 支持静态派发、虚函数表派发（V-Table）、见证表派发（Witness Table）、动态派发（消息派发）
- 常规的struct、enum等值类型都是静态派发
- 静态派发除了编译时就确定调用地址外，编译器会通过内联优化减少栈帧。效率更高。
  - **内联优化**：比如A方法调用B方法，B方法调用C方法，代码编写调用A方法时编译器通过内联直接调用C方法的实现
- `final`修饰的类、方法是静态派发，`private`、`static`修饰的方法是静态派发。经过`@objc dynamic`修饰的方法是通过动态消息派发。其他情况下类均使用虚函数表方式派发。
  - 只经过`@objc`修饰的方法不一定是动态消息派发，Swift编译器会尝试优化。但结合 dynamic 后则一定会使用。
- 协议方法使用见证表派发，支持泛型和协议组合

### 派发方式对比

| 派发方式 | 性能 | 使用场景 |
|---------|------|---------|
| 静态派发 | 最高（可内联） | Swift值类型方法、final类/方法、private方法 |
| 虚函数表派发 | 较高 | Swift类的实例方法（默认）、可重写的`class func` |
| 见证表派发 | 中等 | Swift协议方法 |
| 消息派发 | 较低 | `@objc dynamic`方法、Objective-C方法 |

拓展：[Swift底层原理-结构体、类和协议]({{< relref "/posts/interview/ios-basics/Swift底层原理-结构体-类和协议" >}})

## Runtime 与动态性

Objective-C 和 Swift 都有各自的 Runtime 系统，但两者的设计哲学截然不同：Objective-C Runtime 追求极致的动态性，而 Swift Runtime 则在保证类型安全的前提下尽可能将工作放到编译期完成。

### Runtime 系统对比

| 维度 | Objective-C Runtime | Swift Runtime |
|------|-------------------|---------------|
| 设计目标 | 最大化动态性 | 最大化类型安全和性能 |
| 核心机制 | 消息传递（`objc_msgSend`） | 类型元数据（Metadata） |
| 方法调用 | 运行时查找 IMP | 编译时尽可能确定调用地址 |
| 类结构修改 | 支持运行时修改 | 编译时固定，不支持修改 |
| 方法添加/替换 | 支持 | 不支持（除非桥接到 ObjC） |

### Objective-C Runtime 的动态能力

Objective-C Runtime 提供了丰富的运行时操作能力：

- **消息发送与转发**：所有方法调用都是 `objc_msgSend`，找不到方法时触发三阶段消息转发机制（动态解析 -> 快速转发 -> 完整转发）
- **Method Swizzling**：运行时交换方法实现，可以 Hook 任意 ObjC 方法
- **关联对象**：运行时为已有对象动态添加存储，常用于 Category 添加属性
- **动态创建类**：`objc_allocateClassPair` 在运行时创建全新的类
- **动态添加方法/属性**：`class_addMethod`、`class_addProperty` 等
- **内省（Introspection）**：`class_copyMethodList`、`class_copyPropertyList` 等遍历类的完整信息

详见 [Runtime]({{< relref "/posts/interview/ios-basics/runtime" >}})

### Swift Runtime 的能力与限制

Swift Runtime 主要负责类型元数据管理和内存布局，不提供类似 ObjC Runtime 的动态修改能力：

- **类型元数据（Type Metadata）**：每个类型在运行时都有对应的元数据，包含 V-Table、字段偏移、父类信息等，但元数据结构是编译时生成的，运行时只读
- **Mirror 反射**：Swift 通过 `Mirror` 提供有限的内省能力，可以遍历属性名和值，但不能修改
- **协议一致性检查**：运行时判断类型是否遵循某个协议，用于 `as?`、`is` 等类型转换
- **泛型实例化**：通过 Value Witness Table 在运行时处理泛型类型的内存操作（拷贝、销毁、对齐等）

纯 Swift 本身不具备 ObjC 那样的动态性，但可以通过以下方式获得部分动态能力：

**1. 桥接到 Objective-C Runtime**

继承 `NSObject` 并使用 `@objc dynamic` 标记，使方法走消息派发，从而获得 KVO、Method Swizzling 等能力：

```swift
class ViewModel: NSObject {
    @objc dynamic var name: String = ""
}

// 可以使用 KVO
let observation = viewModel.observe(\.name) { obj, change in
    print("name changed to \(obj.name)")
}
```

**2. Swift 原生的有限动态特性**

- **KeyPath**：类型安全的属性路径，编译时检查，可部分替代 KVC

```swift
struct User { var name: String; var age: Int }
let nameKeyPath = \User.name
var user = User(name: "Tom", age: 25)
user[keyPath: nameKeyPath] = "Jerry"  // 类型安全的属性访问
```

- **协议 + 泛型**：通过协议约束和泛型实现编译时多态，替代运行时动态派发
- **`@dynamicMemberLookup` / `@dynamicCallable`**：编译器层面的语法糖，让 Swift 对象支持动态成员访问和调用，但底层实现仍然是编译时确定的

```swift
@dynamicMemberLookup
struct DynamicStruct {
    subscript(dynamicMember member: String) -> String {
        return "访问了属性: \(member)"
    }
}
let s = DynamicStruct()
print(s.anything)  // 输出: 访问了属性: anything
```

## 类型系统

### Objective-C
- `id`类型可以指向任何对象，编译器不做类型检查
- 协议类型`id<Protocol>`提供一定的类型约束
- 泛型仅用于编译时检查，运行时被擦除

```objc
// Objective-C的类型擦除
NSMutableArray<NSString *> *stringArray = [NSMutableArray array];
NSArray *rawArray = stringArray;  // 泛型信息丢失
```

### Swift
- 强类型系统，所有类型在编译时确定
- 可选类型`Optional<T>`明确区分有值和无值
- 泛型系统完整，支持类型约束、关联类型、泛型特化
- `any`关键字用于存在类型（运行时类型擦除），`some`关键字用于不透明类型（编译时确定）

```swift
// Swift的类型擦除
let animals: [any Animal] = [Dog(), Cat()]  // 存在类型，运行时决定
func makeAnimal() -> some Animal { Dog() }  // 不透明类型，编译时确定
```

| 关键字 | 类型 | 性能 | 使用场景 |
|-------|-----|------|---------|
| `some` | 不透明类型 | 高（可优化） | 返回类型、属性类型 |
| `any` | 存在类型 | 有开销 | 集合元素、参数类型 |

拓展：[类型擦除]({{< relref "/posts/interview/ios-basics/类型擦除" >}})

## 错误处理

### Objective-C
- 使用`NSError`指针的out参数传递错误
- `@try/@catch/@finally`用于异常处理，但不推荐用于常规错误处理
- `nil`消息发送不会崩溃，可能导致静默失败

```objc
NSError *error = nil;
BOOL success = [self doSomethingWithError:&error];
if (!success) {
    NSLog(@"Error: %@", error);
}
```

### Swift
- `throws`/`try`/`catch`语法，编译器强制处理错误
- `Result<Success, Failure>`类型用于异步错误处理
- `do-catch`块明确错误处理范围

```swift
do {
    let result = try doSomething()
} catch {
    print("Error: \(error)")
}

// 或使用 try? 转换为可选值
let result = try? doSomething()
```

## 互操作性

### Swift调用Objective-C
- 通过Bridging Header导入Objective-C头文件
- 大部分Objective-C API可以直接使用
- `NS_SWIFT_NAME`、`NS_REFINED_FOR_SWIFT`等宏可以优化Swift端的API

### Objective-C调用Swift
- Swift类需要继承自`NSObject`
- Swift方法需要`@objc`标记才能被Objective-C调用
- 纯Swift类型（如struct、enum）不能直接暴露给Objective-C
- 自动生成的`ProjectName-Swift.h`头文件供Objective-C导入
- **在Framework/Library中**，Swift类和方法还需要`public`或`open`修饰符才能被外部访问

## 编译与链接

Objective-C 和 Swift 虽然都使用 LLVM 工具链编译，最终产物都是 Mach-O 格式，但在编译流程、中间表示、Mach-O 内部结构以及符号命名规则上都有显著差异。

### 编译流程

**Objective-C 编译流程**：

```plaintext
源代码(.m) → 预处理（宏展开、#import处理）→ Clang前端 → LLVM IR → 机器码(.o)
```

- 预处理阶段处理`#import`和宏展开（详见 [Objective-C中import详解]({{< relref "/posts/interview/ios-basics/Objective-C中import详解" >}})）
- Clang直接将ObjC源码编译为LLVM IR
- 动态特性（如消息发送、方法查找）的逻辑被编译为对Runtime函数的调用（如`objc_msgSend`），具体实现推迟到运行时

**Swift 编译流程**：

```plaintext
源代码(.swift) → Swift前端（AST + 语义分析）→ SIL（Swift中间语言）→ LLVM IR → 机器码(.o)
```

- Swift编译器在Clang和LLVM IR之间多了一层**SIL（Swift Intermediate Language）**
- SIL是Swift特有的高级中间表示，承担了大量Swift特有的优化工作：
  - **泛型特化（Generic Specialization）**：为具体类型生成特化版本，消除泛型抽象开销
  - **逃逸分析（Escape Analysis）**：分析闭包和对象是否逃逸出当前作用域
  - **引用计数消除（ARC Optimization）**：删除多余的`retain`/`release`调用
  - **栈提升（Stack Promotion）**：当编译器证明对象不会逃逸时，将堆分配优化为栈分配，完全消除ARC开销
  - **确定性初始化检查（Definite Initialization）**：编译器确保变量在使用前必须被初始化
- 编译器还支持**Whole Module Optimization（WMO）**：将整个模块视为单一编译单元，支持跨文件的内联和优化

拓展：[SIL]({{< relref "/posts/interview/ios-basics/SIL" >}})

### 宏机制差异

Objective-C 的宏主要来自 C 预处理器，最典型的是 `#define`。它发生在编译器真正理解代码之前，本质是对源码 token 做文本替换。Swift 5.9 引入的宏则是 Swift 编译器前端中的编译期代码生成机制：源码先被解析成语法树，编译器遇到宏调用后把相关语法节点交给宏插件，宏插件返回新的 Swift 语法片段，再继续类型检查、SIL 生成和优化。

| 维度 | Objective-C `#define` | Swift 宏 |
|------|----------------------|----------|
| 执行阶段 | 预处理阶段，编译器真正理解源码之前 | Swift 前端中，类型检查前 |
| 处理对象 | token / 文本替换 | SwiftSyntax 语法树变换 |
| 类型系统 | 替换时不理解类型，替换后才参与类型检查 | 宏声明签名参与类型检查，展开结果必须是合法 Swift 代码 |
| 作用域与卫生性 | 没有卫生性，容易命名冲突、重复求值和污染作用域 | 具备部分卫生机制，可通过 `context.makeUniqueName` 生成唯一名字，附加宏还需要通过 `names:` 声明生成的外部名字 |
| 表达能力 | 适合常量、条件编译、简单文本模板，复杂场景容易失控 | 可以生成表达式、声明、成员、访问器、扩展、函数体等合法 Swift 代码 |
| 调试与 IDE 体验 | 展开结果对 IDE 和调试器不友好，错误位置可能不直观 | Xcode 可 `Expand Macro` 查看展开结果，宏实现可发出 Diagnostic / FixIt |
| 运行模型 | 由预处理器直接完成，不运行第三方编译期插件 | 第三方宏以独立编译器插件进程运行，通过 JSON-RPC 与 `swiftc` 通信 |
| 工程风险 | 文本替换隐藏副作用，可读性和可维护性差 | 会增加编译耗时，依赖 `swift-syntax` 与 Swift 编译器版本匹配，也有供应链信任成本 |

一句话概括：**Objective-C 宏是在源文件上做查找替换，Swift 宏是在编译器语法树上做受约束的代码生成**。所以 Swift 宏更适合用来表达稳定的样板代码生成规则，例如 `@Observable`、`@Model`、`#Preview`、`@Test`、`#expect` 等；而普通逻辑仍应优先使用函数、泛型、协议扩展等语言机制。

拓展：[Swift 宏]({{< relref "/posts/interview/ios-basics/Swift宏" >}})

### 链接差异

ObjC和Swift在链接阶段也存在差异：

**Objective-C**：
- ObjC的动态特性大量依赖Runtime，链接时需要链接`libobjc`（ObjC Runtime库）
- Category、+load方法等需要特殊的链接标志（如`-ObjC`、`-all_load`）确保正确加载
- `-ObjC`标志强制链接器加载静态库中所有包含ObjC类或Category的目标文件，否则Category可能不会被链接进来

**Swift**：
- 纯Swift代码需要链接Swift Runtime库和Swift标准库
- Swift 5.0+系统内置了Swift Runtime（ABI稳定），App不再需要打包Swift标准库，减小了包体积
- 在Swift 5.0之前，每个App都需要在Bundle中嵌入对应版本的Swift标准库（约2-3MB）

### Mach-O 中的差异

ObjC和Swift编译后的代码在Mach-O文件的不同Section中存储，反映了两种语言在底层元数据组织上的差异。

**`__TEXT` 段中的语言特有Section**：

| Section | 语言 | 内容 |
|---------|------|------|
| `__objc_methname` | ObjC | 方法名字符串（如"viewDidLoad"） |
| `__objc_classname` | ObjC | 类名字符串（如"UIViewController"） |
| `__objc_methtype` | ObjC | 方法类型编码（如"v@:"） |
| `__swift5_typeref` | Swift | 类型引用（mangled名称字符串） |
| `__swift5_reflstr` | Swift | 反射字符串（属性名、枚举case名） |
| `__swift5_entry` | Swift | 入口点信息 |

**`__DATA` 系列段中的语言特有Section**：

| Section | 语言 | 内容 |
|---------|------|------|
| `__objc_classlist` | ObjC | 类列表指针（位于`__DATA_CONST`） |
| `__objc_protolist` | ObjC | 协议列表指针（位于`__DATA_CONST`） |
| `__objc_imageinfo` | ObjC | 镜像信息（位于`__DATA_CONST`） |
| `__objc_ivar` | ObjC | 实例变量信息 |
| `__swift5_proto` | Swift | 协议描述符（位于`__DATA_CONST`） |
| `__swift5_types` | Swift | 类型描述符（struct/class/enum元数据，位于`__DATA_CONST`） |
| `__swift5_fieldmd` | Swift | 字段元数据（属性类型和偏移） |
| `__swift5_assocty` | Swift | 关联类型信息 |
| `__swift5_protos` | Swift | 协议一致性记录 |

**关键区别**：
- ObjC的元数据（类结构、方法列表、协议列表等）由ObjC Runtime在启动时解析和注册，支持运行时修改
- Swift的元数据（类型描述符、协议一致性等）在编译时生成，运行时只读，结构更紧凑

继承自`NSObject`的Swift类会**同时生成ObjC和Swift的元数据**，因为它既要参与ObjC Runtime的类注册，也需要Swift Runtime的类型信息。

拓展：[Mach-O的链接、装载与库]({{< relref "/posts/interview/ios-basics/Mach-O的链接-装载与库" >}})

### 符号命名（Name Mangling）

ObjC和Swift对符号名有不同的修饰规则，这直接影响了链接行为和命名空间：

```plaintext
Objective-C（简单直接，无模块信息）：
  类符号       →  _OBJC_CLASS_$_MyClass
  类方法       →  +[MyClass doSomething]
  实例方法     →  -[MyClass doSomething]

Swift（复杂编码，包含模块、类型、签名等完整信息）：
  函数         →  $s4Main3fooyyF
  类初始化器   →  $s4Main6PersonC4name3ageSSSi_tcfc
```

| 维度 | Objective-C | Swift |
|------|-------------|-------|
| 命名规则 | 简单，类名/方法名直接作为符号 | 复杂的mangling方案，编码完整类型信息 |
| 模块信息 | 不包含 | 包含模块名 |
| 命名空间 | 全局，整个App不能有同名ObjC类 | 模块级，不同模块可有同名类型 |
| 冲突避免 | 依赖类名前缀约定（NS、UI、AF等） | 编译器通过模块名自动区分 |

ObjC符号不包含模块信息这一点在工程中有实际影响——当两个不同的库定义了同名的ObjC类时，静态链接时会报`duplicate symbol`，动态库场景下ObjC Runtime注册类时行为未定义。这也是ObjC社区长期使用类名前缀（如`NS`、`UI`、`AF`）的根本原因。

拓展：[Mach-O的链接、装载与库]({{< relref "/posts/interview/ios-basics/Mach-O的链接-装载与库" >}})

## 底层实现

### 类的内存布局

**Objective-C类（包括继承NSObject的Swift类）**：

| 偏移量 | 内容 | 说明 |
|--------|------|------|
| 0x0-0x7 | isa_t isa | 指向类对象，64位系统使用Non-pointer isa，通过位域嵌入引用计数（extra_rc）、关联对象标志等元数据 |
| 0x8+ | 父类实例变量 | 如果有父类，先存储所有父类定义的实例变量 |
| ... | 本类实例变量 | 本类定义的实例变量，按声明顺序存储 |
| ... | 内存对齐填充 | 编译器根据下一个字段的对齐要求自动插入padding |

引用计数存储策略：
- 小引用计数存储在isa的`extra_rc`位域中
- 大引用计数溢出到SideTable的RefcountMap中

**纯Swift类**：

| 偏移量 | 内容 | 说明 |
|--------|------|------|
| 0x0-0x7 | HeapMetadata* | 类型元数据指针，指向Swift类型元数据（类似于isa的作用） |
| 0x8-0xF | RefCount | 内联引用计数，使用InlineRefCountBits结构 |
| 0x10+ | 父类实例属性 | 如果有父类，先存储所有父类定义的实例属性 |
| ... | 本类实例属性 | 本类定义的实例属性，按声明顺序存储，包含内存对齐填充 |

RefCount位域结构（64位）：
- bit 0-31：无主引用计数（unowned reference count）
- bit 32-62：强引用计数（strong reference count）
- bit 63：状态标志（如是否正在析构、是否使用SideTable）

纯Swift类的优势：
- 强引用计数和无主引用计数内联存储，无需查找SideTable
- 引用计数与对象数据相邻，缓存友好
- 使用更高效的原子操作指令

拓展：[Objective-C底层原理-NSObject]({{< relref "/posts/interview/ios-basics/Objective-C底层原理-NSObject" >}})
拓展：[Swift底层原理-结构体、类和协议]({{< relref "/posts/interview/ios-basics/Swift底层原理-结构体-类和协议" >}})

## 总结对比表

| 维度 | Objective-C | Swift |
|------|-------------|-------|
| 类型系统 | 动态类型，弱类型 | 静态类型，强类型 |
| 空值处理 | nil消息安全但可能静默失败 | Optional强制处理 |
| 内存管理 | 引用类型为主，ARC | 值类型为主，ARC+栈分配 |
| 方法派发 | 消息派发（`objc_msgSend`）；C函数调用属于静态派发 | 静态/虚函数表/见证表/消息派发 |
| Runtime | ObjC Runtime，完整的运行时动态能力 | Swift Runtime，侧重类型元数据，动态能力受限 |
| 动态性 | 高（方法交换、消息转发、动态创建类等） | 受限（需 `@objc dynamic` 桥接到 ObjC Runtime） |
| 编程范式 | OOP | OOP + POP + FP |
| 泛型 | 轻量级（编译时擦除） | 完整泛型系统 |
| 错误处理 | NSError out参数 | throws/try/catch |
| 性能 | 运行时开销 | 编译时优化，接近C |
| 编译流程 | Clang → LLVM IR | Swift前端 → SIL → LLVM IR |
| 编译优化 | 优化有限 | SIL层提供泛型特化、逃逸分析、ARC优化等；WMO支持跨文件优化 |
| 宏机制 | C预处理器文本替换，缺少类型信息和卫生性 | SwiftSyntax语法树变换，类型检查前展开，可生成合法Swift代码 |
| 符号命名 | 全局命名空间，需类名前缀避免冲突 | 包含模块名，编译器自动区分 |
| Mach-O元数据 | `__objc_classlist`等，Runtime启动时解析注册 | `__swift5_types`等，编译时生成，运行时只读 |
