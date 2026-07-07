+++
title = "Swift底层原理-结构体、类和协议"
date = '2026-05-06T22:05:01+08:00'
draft = false
weight = 14
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
在[Objective-C底层原理-NSObject]({{< relref "/posts/interview/ios-basics/Objective-C底层原理-NSObject" >}})文章中，我们深入了解了Objective-C对象的底层实现。本文将探讨Swift中类和结构体的底层原理。

## Swift数据结构的分类

Swift中的类根据是否继承自NSObject，在底层实现上存在显著差异：

- **继承自NSObject的Swift类**：兼容Objective-C运行时，支持完整的Objective-C特性
- **纯Swift类**：使用Swift原生运行时，性能更优但Objective-C互操作性受限

Swift中结构体是值类型，具有以下核心特征：

- 栈上分配内存（[非逃逸]({{< relref "/posts/interview/ios-basics/值类型和引用类型的区别" >}}#值类型的逃逸)情况）
- 值语义和完整拷贝
- [写时拷贝]({{< relref "/posts/interview/ios-basics/值类型和引用类型的区别" >}}#写时拷贝copy-on-write)优化（COW）
- 静态方法派发

## Swift类的底层实现

### 继承自NSObject的Swift类

当Swift类继承自NSObject时，必须兼容Objective-C的运行时系统，其底层实现与Objective-C对象高度一致。

#### 内存布局

```swift
class Class: NSObject {
    var name: String
    var isMale: Bool
    var age: Int
    
    init(name: String, isMale: Bool, age: Int) {
        self.name = name
        self.isMale = isMale
        self.age = age
        super.init()
    }
}
```

实例内存布局：

| 偏移量 | 内容 | 大小 | 说明 |
|--------|------|------|------|
| 0x0-0x7 | isa_t isa | 8字节 | 指向类对象，包含优化的位域信息 |
| 0x8-0x17 | String name | 16字节 | Swift String结构（64位系统） |
| 0x18 | Bool isMale | 1字节 | 布尔值 |
| 0x19-0x1F | (padding) | 7字节 | Swift编译器根据下一个字段（Int，8字节对齐要求）自动插入填充，确保Int字段从8的倍数地址开始 |
| 0x20-0x27 | Int age | 8字节 | 64位整数 |
| 0x28-0x2F | (padding) | 8字节 | 最终内存对齐填充 |

**关键特性：**

- 第一个字段是指向类对象的isa指针，在64位Objective-C运行时中使用优化的non-pointer isa（通过位域嵌入引用计数、关联对象标志等元数据），在32位系统中使用传统指针isa
- isa指向的类对象是一个**ObjC与Swift的混合体**——同一块内存的前半部分满足Objective-C运行时，后半部分满足Swift运行时（详见下方「类对象的内部结构」）
- 遵循完整的类/元类层级结构，支持isa链和继承链查找

#### 类对象的内部结构

上面的实例内存布局展示的是**实例对象**在堆上的样子，而isa指针指向的是另一块内存——**类对象**。对于继承自NSObject的Swift类，这个类对象的布局是ObjC与Swift共用的混合结构：

类对象的内存布局（isa指向的内存）：

| 区域 | 字段 | 说明 |
|------|------|------|
| **Objective-C 部分**（兼容`objc_class`结构） | isa | 指向元类（metaclass） |
| | superclass | 父类指针 |
| | cache_t | 方法缓存，`objc_msgSend`快速查找用 |
| | class_data_bits_t → class_rw_t | 包含method_list_t（实例方法列表）、property_list_t（属性列表）、protocol_list_t（协议列表） |
| **Swift 扩展部分**（紧接在ObjC布局之后） | flags | Swift运行时标志 |
| | instanceSize / instanceAlignMask | 实例大小和对齐掩码 |
| | typeDescriptor | 类型描述符，包含泛型参数信息、字段描述等 |
| | vtable[] | 虚函数表，存储Swift可重写方法槽位，包括实例方法和可重写的`class func` |
| | Protocol Conformance Records | 协议一致性记录，记录遵循的Swift协议及见证表位置 |

核心设计思路是：**Swift编译器将类对象设计为Objective-C的`objc_class`结构向后扩展的形式**。

- **Objective-C部分**：完全兼容`objc_class`内存布局。ObjC运行时的代码是按`objc_class`的固定偏移量读取字段的，它只会访问`[起始地址, 起始地址 + sizeof(objc_class))`范围内的内存，超出这个范围的Swift扩展部分，ObjC运行时的代码中没有任何指令去访问。因此ObjC可见成员的`objc_msgSend`、method swizzling、KVO等机制都能正常工作
- **Swift扩展部分**：紧接在ObjC布局之后，追加了vtable（虚表派发，比`objc_msgSend`更快）、typeDescriptor（泛型参数、字段反射等Swift特有数据）、协议一致性记录（该类型遵循了哪些Swift协议及对应见证表位置）

两个运行时各取所需，互不干扰——这也解释了为什么继承自NSObject的Swift类既能让ObjC可见或`dynamic`成员被`objc_msgSend`消息派发调用（走前半部分的方法列表），又能让普通Swift可重写成员使用Swift的vtable快速派发（走后半部分的虚函数表）。

#### 元类（Metaclass）的结构

类对象的第一个字段`isa`指向**元类**。这里的元类是ObjC运行时意义上的元类，负责**ObjC消息派发中的类方法查找**：当某个Swift类方法暴露给ObjC（如`@objc class func`）或被`@objc dynamic`强制走消息派发时，编译器会在元类的方法列表中注册对应的ObjC thunk，`objc_msgSend`通过类对象的`isa`找到元类再查找方法。

**元类的结构和纯ObjC类的[元类对象]({{< relref "/posts/interview/ios-basics/Objective-C底层原理-NSObject" >}}#元类对象meta-class-object)完全相同，就是标准的`objc_class`**（没有Swift扩展部分）。普通Swift `class func` 的Swift派发不依赖元类；只要它可被子类重写，Swift编译器会在类对象的Swift vtable中为它分配槽位。Swift的vtable、typeDescriptor等信息都只存在类对象上，不需要在元类上重复。

**ARC存储兼容性：**

- 引用计数存储遵循Objective-C规则
  - 小引用计数存储在isa指针的extra_rc位域中
  - 大引用计数存储在SideTable的RefcountMap中
- 支持retain/release/autorelease操作和自动释放池

**弱引用机制：**

- 使用Objective-C的weak引用实现
- 弱引用信息存储在SideTable的weak_table中
- 对象释放时自动将弱引用置nil

**Swift编译器的ARC优化：**

虽然内存机制兼容，但Swift编译器在ARC优化方面更加先进：

```swift
// Swift编译器进行更激进的ARC优化
func swiftARCOptimization() {
    let obj = SomeClass()           // retain count = 1
    obj.name = "Swift"              // 编译器通过数据流分析优化掉不必要的retain/release对
    let obj2 = obj                  // 编译器识别短暂的引用，消除冗余的retain/release
    print(obj2.name)                // 编译器追踪RC Identity，确定最后使用点后才释放
    // 编译器通过retain/release消除优化，移除成对出现的冗余操作
}
// 对比：Objective-C的ARC优化相对保守，每次赋值和传递都会严格执行retain/release
```

#### 方法派发机制

继承自NSObject的Swift类使用混合的方法派发机制：

```swift
class SomeClass: NSObject {
    // 1. @objc方法 - 默认使用虚函数表派发，但会在Objective-C运行时注册，支持从OC调用
    @objc func objcMethod() {
        print("使用vtable派发，但可从Objective-C通过消息派发调用")
    }
    
    // 2. @objc dynamic方法 - 强制消息派发
    @objc dynamic func dynamicMethod() {
        print("强制使用消息派发，支持method swizzling")
    }
    
    // 3. 普通Swift方法 - 使用虚函数表派发
    func swiftMethod() {
        print("使用vtable派发，性能更好")
    }
    
    // 4. 普通class func - 可重写时使用Swift vtable派发
    class func swiftClassMethod() {
        print("Swift类方法也可以使用vtable派发")
    }

    // 5. @objc dynamic class func - 强制从ObjC元类方法列表消息派发
    @objc dynamic class func dynamicClassMethod() {
        print("强制使用objc_msgSend派发")
    }

    // 6. final方法 - 静态派发
    final func finalMethod() {
        print("编译时确定调用地址，可内联优化")
    }
}
```

### 纯Swift类（未继承NSObject）

纯Swift类不继承NSObject，使用Swift自己的运行时系统，在性能和内存效率上都有显著优势。

```swift
class SomeClass {
    var name: String
    var isMale: Bool
    var age: Int
    
    init(name: String, isMale: Bool, age: Int) {
        self.name = name
        self.isMale = isMale
        self.age = age
    }
}
```

#### 纯Swift类的内存布局

纯Swift类使用更紧凑的内存布局：

| 偏移量 | 内容 | 大小 | 说明 |
|--------|------|------|------|
| 0x0-0x7 | HeapMetadata* | 8字节 | 类型元数据指针，指向Swift的`ClassMetadata`结构（功能等价于ObjC的isa，但不兼容`objc_class`布局） |
| 0x8-0xF | RefCount | 8字节 | Swift引用计数（内联存储），使用InlineRefCountBits结构：bit 0-31存储unowned引用计数，bit 32为isDeiniting标志，bit 33-62存储strong引用计数，bit 63为UseSlowRC标志（标记是否已切换为SideTable模式） |
| 0x10-0x1F | String name | 16字节 | Swift String结构（64位系统） |
| 0x20 | Bool isMale | 1字节 | 布尔值 |
| 0x21-0x27 | (padding) | 7字节 | 内存对齐填充 |
| 0x28-0x2F | Int age | 8字节 | 64位整数 |

默认情况下，引用计数直接内联存储在对象头部的这 8 字节中（内联模式），无需查找外部数据结构，引用计数与对象数据相邻，缓存友好，并使用高效的原子操作指令。

#### InlineRefCountBits 与 SideTable 的切换

InlineRefCountBits 这 8 字节通过 bit 63（UseSlowRC）在两种模式之间切换：

- **内联模式**（bit 63 = 0）：8 字节直接存储 strong 计数、unowned 计数和 isDeiniting 标志，适用于对象没有被 weak 引用且引用计数未溢出的常见情况
- **SideTable 模式**（bit 63 = 1）：8 字节不再存储内联计数，而是存储一个指向 `HeapObjectSideTableEntry` 的指针

**触发切换的条件：**

1. 对象首次被 weak 引用时
2. strong 或 unowned 引用计数溢出时（32 位系统上更容易发生）

当首次对纯 Swift 对象创建 weak 引用时，Runtime 会：
1. 分配一个 `HeapObjectSideTableEntry`，其中包含完整的引用计数（strong、unowned、weak）和指回原对象的指针
2. 将原来内联存储的 strong/unowned 计数迁移到 SideTable entry 中
3. 将对象头部的 InlineRefCountBits 改写为指向该 SideTable entry 的指针，并置 bit 63 = 1
4. weak 引用变量存储的是指向该 SideTable entry 的指针，而非直接指向对象

此后**所有引用计数操作（strong、unowned、weak）都通过 SideTable entry 统一管理**。这个切换是**不可逆的**——即使后来所有 weak 引用都消失了，也不会切回内联模式，因为切回去的同步代价远大于维持 SideTable 的开销。

读取 weak 变量时的流程：通过 SideTable entry 获取原对象指针 → 检查 strong 引用计数是否 > 0 → 如果对象已释放（strong count == 0），返回 nil。

这也解释了为什么 weak 比 unowned 更"重"：第一次 weak 引用会触发 SideTable 的分配和模式切换，而 unowned 只需要内联计数就够了。更多关于 weak 引用的底层细节，参见 [weak详解]({{< relref "/posts/interview/ios-basics/weak详解" >}}#swift类的弱引用存储)。

#### 类型元数据的结构

与继承自NSObject的类对比，纯Swift类**没有ObjC意义上的"类对象"**，但`HeapMetadata*`指向的`ClassMetadata`承担了等价的角色。区别在于它是纯Swift的结构，不包含任何ObjC的`objc_class`布局：

| 字段 | 说明 |
|------|------|
| kind | 类型种类标识（标记为class） |
| superclass | 父类元数据指针，支持继承链查找 |
| flags | 运行时标志（是否使用Swift 1.0的引用计数等） |
| instanceSize | 实例大小（对应上面内存布局的总大小） |
| instanceAlignMask | 实例对齐掩码 |
| typeDescriptor | 类型描述符，包含泛型参数、字段反射信息等 |
| vtable[] | 虚函数表，存储所有可重写方法的函数指针（包括实例方法和`class func`） |

**纯Swift类的类型方法派发不依赖ObjC元类方法列表。** 这是与ObjC继承体系的重要区别之一：

- 在ObjC中，实例方法存在类对象的方法列表里，**类方法存在元类的方法列表里**。元类本身也是一个`objc_class`结构，`objc_msgSend`通过类对象的isa找到元类来查找类方法——这种双层设计让实例方法调用和类方法调用可以用统一的消息派发逻辑处理
- 在纯Swift类中，类方法的派发不依赖元类机制：
  - `static func` → 静态派发，编译时直接确定函数地址，可内联优化
  - `class func` → 可被子类override时，编译器在vtable中为其分配槽位，和实例方法放在**同一个vtable**里
  - `final class func` → 等价于`static func`，静态派发

因此Swift vtable可以同时包含实例方法和可重写的类方法；Swift方法派发本身不需要额外的ObjC元类方法列表。

与继承自NSObject的类对象的混合结构对比：

| 对比项 | 继承自NSObject | 纯Swift类 |
|-------|---------------|----------|
| 元数据起始布局 | ObjC `objc_class`（isa/superclass/cache/bits） | Swift `ClassMetadata`（kind/superclass/flags） |
| 元类（metaclass） | 有ObjC元类（纯`objc_class`，无Swift扩展），`@objc`/`dynamic`类方法通过元类方法列表参与`objc_msgSend`；普通Swift `class func`可在Swift vtable中派发 | Swift方法派发不依赖ObjC元类方法列表；可重写`class func`和实例方法统一放在vtable中 |
| ObjC方法缓存(cache_t) | 有 | 无 |
| ObjC方法/属性/协议列表 | 有（ObjC可见成员通过class_rw_t记录） | 无 |
| vtable | 有（追加在ObjC布局之后），包含Swift可重写方法槽位，包括实例方法和可重写的`class func` | 有（直接内嵌在ClassMetadata中），包含实例方法和可重写的`class func` |
| typeDescriptor | 有 | 有 |
| `objc_msgSend`兼容 | 默认兼容，尤其适合KVO、Selector、method swizzling等ObjC运行时能力 | Swift-only成员默认不参与；ObjC可表示成员可显式`@objc`/`dynamic`桥接到消息派发 |
| 引用计数方式 | ObjC的isa extra_rc + SideTable | 内联InlineRefCountBits（被weak引用后切换为SideTable模式） |

可以看出，纯Swift类的元数据更加紧凑——省去了ObjC运行时所需的`cache_t`、`class_rw_t`等结构，vtable也直接内嵌而非追加，整体开销更小。

#### 编译器优化

- **栈提升（Stack Promotion）**：编译器分析对象生命周期，当满足以下条件时将对象从堆分配优化为栈分配：对象大小较小、不逃逸作用域、不包含内部堆引用

   ```swift
   func stackPromotion() {
       let obj = PureSwiftClass()  // 编译器分析：生命周期局限于函数内，不逃逸
       obj.value = 42              // 符合栈提升条件，分配在栈上，零ARC开销
       print(obj.value)
   }
   ```

- **引用计数消除（RC Elimination）**：编译器通过数据流分析识别并删除成对的retain/release操作

   ```swift
   func rcElimination() {
       let obj = PureSwiftClass()  // retain count = 1
       let obj2 = obj             // 编译器识别短暂引用，消除这里的retain/release对
       process(obj)               // 编译器分析发现参数不逃逸，消除retain/release对
       process(obj2)              // 同样消除冗余的ARC操作
       // 编译器优化后只在函数开始和结束处各执行一次retain/release
   }
   ```

- **生命周期合并（Lifetime Merging）**：编译器通过追踪变量的词法作用域，当两个变量的生命周期不重叠时复用内存槽位

   ```swift
   func lifetimeMerging() {
       let obj1 = PureSwiftClass()
       // ... 使用obj1（obj1生命周期结束）
       let obj2 = PureSwiftClass()  // 编译器检测到obj1和obj2作用域不重叠，复用内存槽位
       // ... 使用obj2
       // 优化后减少了内存分配和释放的次数
   }
   ```

## Swift结构体的底层实现

Swift结构体是值类型，其底层实现与类有根本性差异。结构体的设计目标是提供高性能、内存安全的数据容器。

### 基本结构体的内存布局

```swift
struct Point {
    var x: Double
    var y: Double
}

struct Person {
    var name: String
    var age: Int
    var isActive: Bool
}
```

#### Point结构体内存布局

| 偏移量 | 内容 | 大小 | 说明 |
|--------|------|------|------|
| 0x0-0x7 | x | 8字节 | Double值 |
| 0x8-0xF | y | 8字节 | Double值 |

#### Person结构体内存布局

| 偏移量 | 内容 | 大小 | 说明 |
|--------|------|------|------|
| 0x0-0xF | String name | 16字节 | Swift String结构（64位系统） |
| 0x10-0x17 | Int age | 8字节 | 64位整数 |
| 0x18 | Bool isActive | 1字节 | 布尔值 |
| 0x19-0x1F | (padding) | 7字节 | 内存对齐填充 |

### 值类型的核心特征

#### 1. 栈上分配（非逃逸情况）

```swift
func createPoint() {
    let point = Point(x: 10.0, y: 20.0)  // 分配在栈上
    // 函数结束时自动释放，无需引用计数
}
```

#### 2. 值语义和拷贝

```swift
var point1 = Point(x: 1.0, y: 2.0)
var point2 = point1  // 完整的内存拷贝
point2.x = 5.0       // 不影响point1
```

#### 3. 写时拷贝优化（COW）

对于包含引用类型的结构体，Swift实现了写时拷贝优化（详见[值类型和引用类型的区别-写时拷贝]({{< relref "/posts/interview/ios-basics/值类型和引用类型的区别" >}}#写时拷贝copy-on-write)）：

```swift
struct Container {
    private var storage: ContainerStorage
    
    mutating func append(_ item: String) {
        if !isKnownUniquelyReferenced(&storage) {
            storage = ContainerStorage(copying: storage)  // 写时拷贝
        }
        storage.append(item)
    }
}
```

### 结构体的方法派发

结构体使用静态派发，所有方法调用在编译时确定：

```swift
struct Calculator {
    func add(_ a: Int, _ b: Int) -> Int {
        return a + b  // 静态派发，可以内联优化
    }
}

let calc = Calculator()
let result = calc.add(5, 3)  // 编译时确定调用地址
```

## Swift的元数据系统

前面我们分析了Swift类和结构体的内存布局，现在让我们深入了解Swift的元数据系统是如何工作的。

回顾前面的内存布局分析，类的实例头部都包含指向元数据的指针：

- **继承自NSObject的Swift类**：第一个字段是`isa`指针，指向的[类对象是ObjC与Swift的混合结构](#类对象的内部结构)
- **纯Swift类**：第一个字段是`HeapMetadata*`，指向纯Swift的`ClassMetadata`结构

而**结构体**作为值类型，实例本身不包含任何元数据指针——前面的内存布局表格也清楚地展示了这一点，结构体实例中只有纯数据字段。

不过，这并不意味着结构体没有元数据。实际上，Swift会为**所有类型**（包括继承自NSObject的Swift类、纯Swift类、结构体、枚举）生成类型元数据。区别在于：

- **类**的实例通过内嵌的指针（`isa`或`HeapMetadata*`）在运行时动态关联到元数据
- **结构体**的元数据不存储在实例中，而是作为全局数据由编译器生成，编译后写入[Mach-O]({{< relref "/posts/interview/ios-basics/Mach-O的链接-装载与库" >}})的固定段中：TypeDescriptor（字段名、字段类型等反射信息）在`__TEXT,__const`中（只读不可变）；ValueWitnessTable（size、alignment、copy/destroy函数指针）和完整的Metadata记录在`__DATA,__const`中（包含函数指针，需要dyld加载时重定位）；协议一致性记录在`__TEXT,__swift5_proto`中。运行时在需要时（如泛型特化、协议一致性检查、`Mirror`反射等）通过`swift_getTypeMetadata`等函数按需访问这些全局符号

这些元数据是Swift运行时系统的核心，它们描述了类型的完整信息。

### 元数据的层级结构

前面已经详细分析过类的元数据——继承自NSObject的有[类对象混合结构](#类对象的内部结构)，纯Swift类有[`ClassMetadata`](#类型元数据的结构)。这些都是**具体类型**的元数据。Swift运行时为所有类型的元数据定义了一个公共的基础层：

```c
// 所有类型元数据的公共基础（简化表示）
struct TypeMetadata {
    TypeMetadataKind kind;              // 类型种类标识（class, struct, enum等）
    ValueWitnessTable* valueWitnesses;  // 值见证表：size、alignment、copy、destroy等操作
};
```

各种元数据都是在这个基础上扩展的：

| 具体元数据 | 种类 | 扩展的字段 |
|-----------|------|-----------|
| `ClassMetadata` | 纯Swift类 | superclass、vtable[]、typeDescriptor等 |
| ObjC兼容类元数据 | 继承自NSObject的Swift类 | `objc_class`全部字段 + vtable[]、typeDescriptor等 |
| `StructMetadata` | 结构体 | fieldDescriptor、字段偏移量等 |
| `EnumMetadata` | 枚举 | case数量、payload大小等 |

这个层级设计的好处是：Swift运行时在处理泛型、协议一致性检查等场景时，只需要通过`TypeMetadata`基础接口就能对任意类型执行通用操作（读取size分配内存、调用copy/destroy管理生命周期），而不需要关心具体是class还是struct。

### 结构体和枚举的元数据

前面的章节已经详细分析了类的元数据结构，这里补充结构体和枚举的。

#### 结构体元数据（Struct Metadata）

虽然结构体实例不包含元数据指针，但编译器为每个结构体类型生成元数据，存储在Mach-O的全局段中：

```c
struct StructMetadata {
    TypeMetadata base;               // 公共基础（kind + valueWitnesses）
    TypeDescriptor* descriptor;      // 类型描述符（字段名、字段类型等反射信息）
    // 字段偏移量数组（运行时确定每个字段在实例中的偏移）
};
```

其中`ValueWitnessTable`记录了结构体的内存操作信息，直接对应前面分析的内存布局特性：

- `size`和`alignment` → 决定了前面分析的内存布局和padding填充
- `initializeWithCopy` → 实现值类型的拷贝语义
- `destroy` → 处理包含引用类型字段时的清理工作

#### 枚举元数据（Enum Metadata）

```c
struct EnumMetadata {
    TypeMetadata base;               // 公共基础
    TypeDescriptor* descriptor;      // 类型描述符（case信息、关联值描述）
    // payload大小、case数量等
};
```

### 见证表（Witness Table）

见证表是Swift协议系统的核心，它与前面讨论的方法派发机制密切相关。当我们使用协议类型时，Swift需要在运行时确定具体的实现：

```swift
protocol Drawable {
    func draw()
    var area: Double { get }
}

struct Circle: Drawable {
    let radius: Double
    
    func draw() {
        print("Drawing circle with radius \(radius)")
    }
    
    var area: Double {
        return .pi * radius * radius
    }
}
```

编译器为`Circle`类型生成见证表，这个见证表与前面讨论的虚函数表类似，但用于协议派发：

```c
// Circle对Drawable协议的见证表
struct CircleDrawableWitnessTable {
    void (*draw)(Circle* self);              // draw方法指针
    double (*area_getter)(Circle* self);     // area属性getter指针
    TypeMetadata* associatedTypeMetadata;    // 关联类型元数据
    // ... 协议要求的其他函数指针
};
```

**见证表与虚函数表的区别：**

- **虚函数表**：属于类，存储在类元数据中，支持继承重写
- **见证表**：属于协议一致性，每个类型对每个协议都有独立的见证表，支持多协议组合

见证表是编译器在编译期静态生成的全局数据，**不存储在类型元数据内部**，而是作为独立的全局符号写入Mach-O二进制文件中：

- **见证表本身**（函数指针数组）→ 存储在`__DATA,__const`段（包含函数指针，需要dyld加载时重定位）
- **协议一致性记录**（Protocol Conformance Record）→ 存储在`__TEXT,__swift5_proto`段（记录"类型X遵循协议Y"以及对应见证表的位置）

这种设计与虚函数表的存储方式形成对比：虚函数表是内嵌在`ClassMetadata`中的（即类型元数据的一部分），而见证表是独立于类型元数据之外的全局数据。这样设计的原因是——一个类型可以遵循多个协议，每个协议一张见证表，如果都塞进类型元数据会导致元数据结构不固定；独立存储后，类型元数据保持固定布局，见证表通过一致性记录间接关联即可。

那么运行时如何根据一致性记录找到见证表？这就涉及到协议一致性的查找机制。

### 协议一致性（Protocol Conformance）

协议一致性描述的是"类型X遵循协议Y"这一关系。编译器为每一对（类型, 协议）关系生成一条**协议一致性记录**（Protocol Conformance Record），记录该类型对该协议的见证表位置。

#### 一致性记录的存储

所有一致性记录在编译期写入Mach-O的`__TEXT,__swift5_proto`段（只读）。每条记录的核心字段：

```c
struct ProtocolConformanceRecord {
    RelativePointer<ProtocolDescriptor> protocol;    // 指向协议描述符（标识是哪个协议）
    RelativePointer<TypeDescriptor> typeRef;          // 指向类型描述符（标识是哪个类型）
    RelativePointer<WitnessTable> witnessTable;       // 指向见证表（函数指针数组）
    uint32_t flags;                                   // 标志位（一致性类型：直接/条件/回溯等）
};
```

使用相对指针（RelativePointer）而非绝对指针，是因为相对指针存储的是偏移量而非绝对地址，不需要dyld加载时重定位，因此一致性记录可以放在只读的`__TEXT`段中，节省内存（只读页可以在多个进程间共享）。

#### 运行时查找流程

当Swift运行时需要确认某个类型是否遵循某个协议时（例如通过协议类型调用方法、`as?`协议转换、泛型约束检查等场景），会调用`swift_conformsToProtocol`函数执行查找：

1. **查缓存**：首先检查全局的一致性缓存（哈希表，key是(类型, 协议)对），命中则直接返回见证表地址
2. **扫描一致性记录**：缓存未命中时，遍历所有已加载的Mach-O镜像（包括主二进制、动态库、框架等）的`__TEXT,__swift5_proto`段，逐条检查一致性记录，匹配目标类型和协议
3. **处理条件一致性**：如果记录标记为条件一致性（Conditional Conformance，如`extension Array: Equatable where Element: Equatable`），还需要递归检查泛型参数是否满足条件
4. **写入缓存**：找到匹配后，将结果缓存到哈希表中，后续相同查询直接命中

这个查找结果会被缓存，因此同一对(类型, 协议)只需要扫描一次，后续调用的开销接近O(1)。

#### 条件一致性（Conditional Conformance）

值得特别说明的是条件一致性。例如：

```swift
extension Array: Equatable where Element: Equatable {
    static func == (lhs: Array, rhs: Array) -> Bool { ... }
}
```

`Array`并不是无条件遵循`Equatable`，而是**仅当`Element`也遵循`Equatable`时**才遵循。编译器为这种情况生成的一致性记录中，`flags`标记为条件一致性，并附带条件要求列表。运行时在查找到这条记录后，还需要递归调用`swift_conformsToProtocol`检查`Element`是否遵循`Equatable`，只有所有条件都满足时才确认一致性成立并返回见证表。

### 存在容器（Existential Container）

前面我们知道，当变量声明为协议类型时（如`let drawable: Drawable = Circle(radius: 5)`），编译器在编译期不知道运行时的具体类型。那么这个变量在内存中是如何表示的？答案是**存在容器**。

存在容器是Swift编译器为协议类型变量生成的一种固定大小的内存布局，它将具体类型的值（或引用）、类型元数据和见证表"打包"在一起，使得运行时能够通过统一的接口操作任意遵循该协议的类型。

#### 值类型的存在容器（Opaque Existential Container）

当协议没有类约束时（即值类型和引用类型都可以遵循），使用不透明存在容器：

```c
struct OpaqueExistentialContainer {
    void* inlineBuffer[3];               // 24字节的内联缓冲区（3个指针大小）
    TypeMetadata* type;                  // 类型元数据指针
    WitnessTable* witnessTable;          // 协议见证表指针（遵循几个协议就有几个）
};
```

**内联缓冲区（Inline Buffer）策略：**

- 如果具体类型的大小 <= 24字节（3个指针大小，64位系统上即24字节）：值直接存储在`inlineBuffer`中，无需堆分配
- 如果具体类型的大小 > 24字节：在堆上分配内存存储值，`inlineBuffer[0]`存储指向堆内存的指针

```swift
protocol Shape {
    func area() -> Double
}

struct SmallShape: Shape {   // 大小 = 8字节（一个Double）
    var radius: Double
    func area() -> Double { return .pi * radius * radius }
}

struct LargeShape: Shape {   // 大小 = 40字节（5个Double）
    var a, b, c, d, e: Double
    func area() -> Double { return a * b }
}

let s1: Shape = SmallShape(radius: 5)    // SmallShape直接存储在inlineBuffer中（8 <= 24）
let s2: Shape = LargeShape(a: 1, b: 2, c: 3, d: 4, e: 5)  // LargeShape堆分配，inlineBuffer[0]存指针
```

`s1`的内存布局（SmallShape，内联存储）：

| 偏移量 | 内容 | 说明 |
|--------|------|------|
| 0x0-0x7 | 5.0 (Double) | SmallShape.radius，直接存在inlineBuffer中 |
| 0x8-0xF | (未使用) | inlineBuffer剩余空间 |
| 0x10-0x17 | (未使用) | inlineBuffer剩余空间 |
| 0x18-0x1F | TypeMetadata* | 指向SmallShape的类型元数据 |
| 0x20-0x27 | WitnessTable* | 指向SmallShape对Shape协议的见证表 |

`s2`的内存布局（LargeShape，堆分配）：

| 偏移量 | 内容 | 说明 |
|--------|------|------|
| 0x0-0x7 | HeapBuffer* | 指向堆上分配的LargeShape值（40字节） |
| 0x8-0xF | (未使用) | inlineBuffer剩余空间 |
| 0x10-0x17 | (未使用) | inlineBuffer剩余空间 |
| 0x18-0x1F | TypeMetadata* | 指向LargeShape的类型元数据 |
| 0x20-0x27 | WitnessTable* | 指向LargeShape对Shape协议的见证表 |

内联缓冲区策略的意义在于：大多数常用的值类型（如基本数值类型、小型结构体等）都能放进24字节，这使得协议类型变量在常见场景下无需堆分配，减少了内存分配和引用计数的开销。

**存在容器的总大小：** 基础大小 = 24字节（inlineBuffer）+ 8字节（type）+ 8字节 * N（N个协议的见证表指针）。对于遵循单个协议的变量，总大小为40字节；遵循两个协议的组合（如`Shape & CustomStringConvertible`），总大小为48字节。

#### 类存在容器（Class Existential Container）

当协议有类约束时（通过`AnyObject`或`class`约束），编译器知道具体类型一定是引用类型，因此使用更紧凑的布局：

```c
struct ClassExistentialContainer {
    HeapObject* value;                   // 直接存储对象引用（8字节）
    WitnessTable* witnessTable;          // 协议见证表指针
};
```

```swift
protocol Renderable: AnyObject {
    func render()
}

class Canvas: Renderable {
    func render() { print("Rendering canvas") }
}

let r: Renderable = Canvas()
// r的底层表示是ClassExistentialContainer
// value = Canvas实例的堆地址（8字节）
// witnessTable = Canvas对Renderable的见证表指针（8字节）
```

类存在容器不需要inlineBuffer，因为引用类型的值就是一个指针（8字节），直接存储即可。总大小 = 8字节（value）+ 8字节 * N（N个协议的见证表指针）。

注意：类存在容器中没有单独的`TypeMetadata*`字段——因为引用类型的实例头部本身就包含指向类型元数据的指针（isa或HeapMetadata*），运行时可以直接从对象头部获取类型信息，无需在容器中冗余存储。

#### 特殊情况：`Any`和`AnyObject`

- **`Any`类型**：等价于零协议约束的存在容器。布局只有inlineBuffer + type，没有见证表指针（因为没有协议要求）。总大小32字节
- **`AnyObject`类型**：等价于零协议约束的类存在容器。布局只有value指针，没有见证表指针。总大小8字节

#### 存在容器与协议方法调用

理解了存在容器的布局，就能清楚协议类型的方法调用是如何工作的：

```swift
let drawable: Drawable = Circle(radius: 5)
drawable.draw()
```

1. 编译器生成的代码从`drawable`的存在容器中取出`witnessTable`指针
2. 在见证表中按固定偏移量找到`draw`方法的函数指针
3. 从存在容器的inlineBuffer（或堆指针指向的内存）中取出值的地址，作为`self`参数传入
4. 跳转到函数指针指向的`Circle.draw()`执行

整个过程需要两次间接跳转（取见证表、取函数指针），这就是见证表派发相比静态派发的额外开销。

## 方法派发机制详解

Swift的方法派发机制比Objective-C更加复杂和高效，支持多种派发方式。

### 静态派发（Static Dispatch）

最高效的派发方式，在编译时确定调用地址：

```swift
struct Calculator {
    func add(_ a: Int, _ b: Int) -> Int {
        return a + b  // 静态派发，可以内联优化
    }
}

final class FinalClass {
    func method() {
        // final类的方法使用静态派发
    }
}
```

**使用场景：**

- 所有结构体和枚举的方法
- final类和final方法
- private方法（编译器确定不会被重写）
- 静态方法和类方法（某些情况下）

### 虚函数表派发（V-Table Dispatch）

类的实例方法默认使用虚函数表派发；可被子类重写的`class func`也会通过类元数据中的vtable派发：

```swift
class Animal {
    func makeSound() {        // vtable槽位0
        print("Some sound")
    }
    
    func move() {            // vtable槽位1
        print("Moving")
    }
}

class Dog: Animal {
    override func makeSound() {  // 重写vtable槽位0
        print("Woof!")
    }
    
    func wagTail() {            // vtable槽位2（新方法）
        print("Wagging tail")
    }
}

class Factory {
    class func makeName() -> String {  // 类型方法的vtable槽位
        "Factory"
    }
}

class DogFactory: Factory {
    override class func makeName() -> String {  // 重写类型方法槽位
        "DogFactory"
    }
}
```

虚函数表结构：

```c
// Dog类的虚函数表
struct DogVTable {
    void (*makeSound)(Dog* self);  // 指向Dog.makeSound
    void (*move)(Animal* self);    // 继承Animal.move
    void (*wagTail)(Dog* self);    // Dog的新方法
};
```

### 消息派发（Message Dispatch）

使用`@objc dynamic`标记的方法使用Objective-C的消息派发：

```swift
class SwiftClass: NSObject {
    @objc dynamic func dynamicMethod() {
        // 使用objc_msgSend派发
    }
}
```

### 见证表派发（Witness Table Dispatch）

协议方法并不总是通过见证表动态派发——**派发方式取决于调用时编译器是否能确定具体类型**。

#### 场景一：具体类型直接调用 → 静态派发

当变量声明为具体类型时，编译器在编译期就知道调用目标，直接生成函数调用指令，完全不涉及见证表：

```swift
protocol Drawable {
    func draw()
}

struct Circle: Drawable {
    func draw() { print("Circle") }
}

let circle = Circle(radius: 5)
circle.draw()  // 静态派发：编译器知道这是Circle，直接调用Circle.draw()
```

这和调用普通结构体方法没有任何区别，虽然`Circle`遵循了`Drawable`协议，但以具体类型调用时协议完全不参与派发过程。

#### 场景二：协议类型（存在类型）调用 → 见证表派发

当变量声明为协议类型时，编译器不知道运行时的具体类型，必须通过见证表间接调用：

```swift
let drawable: Drawable = Circle(radius: 5)
drawable.draw()  // 见证表派发：编译器只知道是Drawable，运行时查找见证表
```

此时变量`drawable`的底层表示是一个[**存在容器**（Existential Container）](#存在容器existential-container)——一种固定大小的内存结构，包含值的存储空间（内联缓冲区或堆指针）、类型元数据指针和见证表指针。调用`draw()`时，运行时从存在容器中取出见证表指针，按固定偏移量找到`draw`的函数指针，跳转到`Circle.draw()`执行。

#### 场景三：泛型约束调用 → 取决于是否特化

泛型函数中的协议方法调用的派发方式取决于编译器能否进行**泛型特化（Generic Specialization）**。

先看泛型函数的默认实现方式。当编译器编译一个泛型函数时，默认会生成一个**通用版本**，使用[类型擦除]({{< relref "/posts/interview/ios-basics/类型擦除" >}})来处理任意类型——将具体类型信息"擦除"为不透明指针，通过TypeMetadata和见证表在运行时间接操作：

```swift
func render<T: Drawable>(_ shape: T) {
    shape.draw()
}
```

```c
// 编译器默认生成的通用版本（类型擦除后的伪代码）
void render_generic(
    void* shape,                          // 具体值被擦除为不透明指针
    TypeMetadata* T,                      // 类型元数据（用于获取size、alignment、copy/destroy等）
    DrawableWitnessTable* witnessTable    // 见证表（作为隐藏参数传入）
) {
    witnessTable->draw(shape, T);         // 通过见证表间接调用
}
```

这个通用版本能处理任何遵循`Drawable`的类型，但代价是每次方法调用都要经过见证表间接跳转，且编译器无法进行内联等优化。

**泛型特化**是编译器的一项优化：当编译器能在编译期确定泛型参数的具体类型时，直接为该类型生成一个**专用版本**，将泛型参数替换为具体类型，从而消除类型擦除和见证表查找的开销：

```swift
render(Circle(radius: 5))

// 编译器特化后，等价于直接生成了这样一个函数：
func render_Circle(_ shape: Circle) {
    shape.draw()  // 直接调用Circle.draw()，静态派发，可内联
}
```

特化后，`shape.draw()`从"见证表间接调用"变成了"直接调用`Circle.draw()`"——等价于静态派发，零运行时开销。

**特化的条件：** 编译器需要在编译期同时看到泛型函数的实现和调用处的具体类型。因此：

- **同模块内调用 + 开启编译优化（`-O`）** → 特化成功，静态派发
- **跨模块调用** → 默认无法特化（看不到函数实现），走见证表派发。除非函数标记了`@inlinable`，允许编译器跨模块内联和特化
- **未开启优化（`-Onone`，即Debug模式）** → 不执行特化，走见证表派发

#### 协议方法派发汇总

| 调用上下文 | 派发方式 | 原因 |
|-----------|---------|------|
| 具体类型调用（`let c = Circle(); c.draw()`） | 静态派发 | 编译器在编译期确定具体类型 |
| 协议类型调用（`let d: Drawable = Circle(); d.draw()`） | 见证表派发 | 编译器不知道运行时具体类型，通过[存在容器](#存在容器existential-container)中的见证表指针间接调用 |
| 泛型约束 + 特化成功（同模块+开优化，或`@inlinable`跨模块） | 静态派发 | 编译器为具体类型生成特化版本，消除间接调用 |
| 泛型约束 + 未特化（跨模块无`@inlinable`、Debug模式） | 见证表派发 | 编译器生成通用版本（类型擦除），见证表作为隐藏参数传入 |

#### 协议要求方法 vs 协议扩展方法的派发陷阱

上面讨论的都是**协议要求方法**（在`protocol`声明体中定义的方法）。还有一类方法是**协议扩展方法**（在`extension`中定义但不在协议要求中的方法），它们的派发规则完全不同：

```swift
protocol Greeting {
    func sayHello()  // 协议要求 - 会被加入见证表
}

extension Greeting {
    func sayHello() { print("Hello from protocol") }  // 默认实现
    func sayGoodbye() { print("Goodbye from protocol") }  // 扩展方法 - 不在见证表中
}

struct Person: Greeting {
    func sayHello() { print("Hello from Person") }
    func sayGoodbye() { print("Goodbye from Person") }
}

let person = Person()
person.sayHello()    // "Hello from Person" ✅ 静态派发，编译器知道是Person类型
person.sayGoodbye()  // "Goodbye from Person" ✅ 静态派发，编译器知道是Person类型

let greeter: Greeting = Person()
greeter.sayHello()    // "Hello from Person" ✅ 通过见证表动态派发，找到Person的实现
greeter.sayGoodbye()  // "Goodbye from protocol" ⚠️ 静态派发，直接调用扩展实现！
```

**底层原理：函数地址在哪里？**

要理解这个行为，需要搞清楚这些函数的地址存储在哪里。

`sayHello`是协议要求方法，它在见证表中有槽位。当通过协议类型调用时，运行时从见证表中取出函数指针，跳转到`Person.sayHello()`——这是动态派发，能找到具体类型的实现。

`sayGoodbye`不是协议要求，**它不在任何派发表中**（不在见证表、不在虚函数表）。无论是扩展定义的`Greeting.sayGoodbye()`还是`Person`自己定义的`Person.sayGoodbye()`，编译后都只是Mach-O `__TEXT,__text`段中的普通函数符号。没有任何表存储它们的指针，所有调用都由编译器在编译期根据变量的**声明类型**直接绑定：

- 声明为`Person` → 编译器绑定`Person.sayGoodbye()`的地址
- 声明为`Greeting` → 编译器绑定`Greeting.sayGoodbye()`的地址（扩展版本）

运行时没有任何机会"发现"`Person`还有自己的`sayGoodbye()`，因为根本没有表可查。

见证表结构（只包含协议要求的方法）：

```c
// Person 对 Greeting 协议的见证表
struct PersonGreetingWitnessTable {
    void (*sayHello)(Person* self);  // ✅ 指向 Person.sayHello
    // sayGoodbye 不在这里——它是普通函数符号，不在任何派发表中
};
```

## 常见面试题

### Q1: 纯Swift类和继承自NSObject的Swift类在底层有什么区别？

1. **实例头部不同**：继承自NSObject的类头部是isa指针（兼容ObjC运行时），引用计数存储在isa的extra_rc位域和SideTable中；纯Swift类头部是HeapMetadata指针 + 8字节的InlineRefCountBits（bit 0-31 unowned计数，bit 32 isDeiniting，bit 33-62 strong计数，bit 63 UseSlowRC标志），默认内联存储无需查找外部结构，缓存更友好。当对象被weak引用时，bit 63置1，这8字节切换为指向`HeapObjectSideTableEntry`的指针，此后所有引用计数（strong、unowned、weak）由SideTable统一管理，该切换不可逆
2. **类型元数据结构不同**：继承自NSObject的类的类对象是ObjC与Swift的混合结构——前半部分是标准的`objc_class`布局（isa/superclass/cache_t/class_data_bits_t → class_rw_t，包含ObjC可见的方法列表、属性列表、协议列表），后半部分追加了Swift的vtable（包含Swift可重写方法槽位，包括实例方法和可重写的`class func`）、typeDescriptor、协议一致性记录等，ObjC运行时只访问前半部分，Swift运行时访问后半部分，两者互不干扰；纯Swift类的ClassMetadata是纯Swift结构（kind/superclass/flags/instanceSize/vtable等），没有ObjC的cache_t和class_rw_t，vtable直接内嵌且同样可以包含实例方法和可重写的`class func`，整体更紧凑
3. **有无ObjC元类参与派发**：继承自NSObject的类有ObjC元类（标准`objc_class`结构），`@objc`/`dynamic`类方法通过元类方法列表供`objc_msgSend`查找；普通Swift `class func`可在Swift vtable中派发。纯Swift类的Swift方法派发不依赖ObjC元类方法列表，可重写`class func`和实例方法统一放在vtable中
4. **方法派发**：两者都支持vtable派发、静态派发和见证表派发。区别在于：继承自NSObject的类天然接入ObjC运行时，可使用`@objc dynamic`强制消息派发来支持Selector、method swizzling、KVO等能力；纯Swift类的Swift-only成员默认不走`objc_msgSend`，但ObjC可表示成员也可以显式`@objc`/`dynamic`桥接到消息派发，只是不会因此自动获得完整的NSObject/KVO语义

### Q2: Swift有哪些方法派发方式？

**1. 静态派发（Static Dispatch）**：编译时确定调用地址，性能最优，可内联优化。适用于结构体/枚举的所有方法、final类和final方法、private方法、`static func`。函数地址在编译期直接嵌入调用指令中，不依赖任何派发表。

**2. 虚函数表派发（V-Table Dispatch）**：通过类元数据中的vtable查找函数指针。适用于类的实例方法（默认），以及可被子类override的`class func`；这点对纯Swift类和继承自NSObject的Swift类都成立。虚函数表内嵌在类的元数据结构中（继承自NSObject的类追加在`objc_class`布局之后，纯Swift类直接内嵌在ClassMetadata中），存储Swift可重写方法的函数指针，支持继承和方法重写。

**3. 消息派发（Message Dispatch）**：通过Objective-C的`objc_msgSend`进行动态查找。适用于Objective-C方法，以及Swift中显式`@objc dynamic`且ObjC可表示的成员；继承自NSObject的Swift类是最常见场景，因为它天然接入Selector、KVO、method swizzling等ObjC运行时能力。消息派发依赖ObjC运行时的方法缓存和方法列表，支持运行时替换实现。

**4. 见证表派发（Witness Table Dispatch）**：通过协议见证表查找函数指针。见证表属于协议一致性关系（类型-协议的组合），不存储在类型元数据内部，而是作为独立的全局符号写入Mach-O中——见证表本身（函数指针数组）在`__DATA,__const`段，协议一致性记录在`__TEXT,__swift5_proto`段。每个类型对每个协议都有独立的见证表，支持多协议组合。这样设计是因为一个类型可以遵循多个协议，如果都塞进类型元数据会导致结构不固定；独立存储后，类型元数据保持固定布局，见证表通过一致性记录间接关联。

**协议方法的派发取决于调用上下文：**

| 调用上下文 | 派发方式 | 原因 |
|-----------|---------|------|
| 具体类型调用（`let c = Circle(); c.draw()`） | 静态派发 | 编译器在编译期确定具体类型 |
| 协议类型调用（`let d: Drawable = Circle(); d.draw()`） | 见证表派发 | 编译器不知道运行时具体类型，通过存在容器中的见证表指针间接调用 |
| 泛型约束 + 特化成功（同模块+开优化，或`@inlinable`跨模块） | 静态派发 | 编译器为具体类型生成特化版本，消除间接调用 |
| 泛型约束 + 未特化（跨模块无`@inlinable`、Debug模式） | 见证表派发 | 编译器生成通用版本（类型擦除），见证表作为隐藏参数传入 |

其中 **泛型特化（Generic Specialization）** 是Swift编译器的一项重要优化：当编译器能在编译期确定泛型参数的具体类型时，直接为该类型生成一个专用版本的函数，将泛型参数替换为具体类型，从而消除类型擦除和见证表查找的运行时开销。未特化时，编译器生成通用版本，使用类型擦除（将具体类型擦除为不透明指针），通过TypeMetadata和见证表在运行时间接操作，每次方法调用都要经过见证表间接跳转；特化后，等价于静态派发，可以内联，零运行时开销。

```swift
protocol Drawable {
    func draw()
}
struct Circle: Drawable {
    func draw() { print("Circle") }
}

// 泛型函数
func render<T: Drawable>(_ shape: T) {
    shape.draw()
}
// 调用处传入具体类型Circle
render(Circle())
// 编译器特化后，等价于直接生成了：
// func render_Circle(_ shape: Circle) {
//     shape.draw()  // 直接调用Circle.draw()，静态派发，可内联
// }
```

特化成功的条件：同模块内调用 + 开启编译优化（`-O`）可以特化；跨模块调用默认无法特化，除非函数标记了`@inlinable`；Debug模式（`-Onone`）不执行特化。

**协议要求方法 vs 协议扩展方法的派发陷阱：**

上述讨论的都是**协议要求方法**（在`protocol`声明体中定义的方法），它们会被编译器加入见证表，通过协议类型调用时使用见证表动态派发，能正确找到具体类型的实现。

**协议扩展方法**（在`extension`中定义但不在协议要求中的方法）不在任何派发表中，编译后只是Mach-O中的普通函数符号，所有调用都由编译器在编译期根据变量的**声明类型**静态绑定，属于静态派发。

### Q3: 纯Swift类的编译器有哪些性能优化手段？

1. **栈提升（Stack Promotion）**：当类实例满足条件（大小较小、不逃逸作用域、不包含内部堆引用）时，编译器将堆分配优化为栈分配，实现零ARC开销
2. **引用计数消除（RC Elimination）**：通过数据流分析识别并删除成对的retain/release操作，比如短暂引用、不逃逸的函数参数等场景下消除冗余的ARC操作
3. **生命周期合并（Lifetime Merging）**：追踪变量的词法作用域，当两个变量的生命周期不重叠时复用内存槽位，减少内存分配和释放次数

相比Objective-C，Swift编译器能进行更激进的ARC优化。ObjC的ARC优化相对保守，每次赋值和传递都会严格执行retain/release；而Swift编译器通过追踪RC Identity、数据流分析等手段，在保证正确性的前提下尽可能消除冗余的引用计数操作。

### Q4: 为什么把协议类型作为函数参数传递时，性能会比泛型约束差？底层的区别是什么？

```swift
// 方式一：协议类型参数
func drawA(_ shape: Shape) { shape.draw() }
// 方式二：泛型约束参数
func drawB<T: Shape>(_ shape: T) { shape.draw() }
```

两者的核心区别在于参数的底层表示不同。

方式一中，`shape`参数的类型是协议类型（存在类型），编译器会将传入的具体值包装进一个**存在容器**（Existential Container）。存在容器是一种固定大小的结构，布局为：24字节内联缓冲区（inlineBuffer[3]）+ 8字节类型元数据指针 + 8字节见证表指针，单协议时总大小40字节。如果具体类型大小 <= 24字节，值直接存在inlineBuffer中；超过24字节则堆分配，inlineBuffer[0]存堆指针。调用`shape.draw()`时，运行时从容器中取出见证表，通过函数指针间接跳转——这是见证表派发，无法内联优化。

方式二中，编译器可以进行泛型特化——当调用处的具体类型已知时，直接为该类型生成专用版本的函数，参数就是具体类型本身，没有存在容器的包装开销，`shape.draw()`变成静态派发，可以内联。

性能差异来自三个方面：存在容器的构造和拷贝开销（大值类型还涉及堆分配）、见证表的间接跳转开销、以及无法内联导致编译器丧失进一步优化的机会。

补充：当协议有类约束（`AnyObject`）时，使用更紧凑的类存在容器（8字节对象引用 + 见证表指针），不需要inlineBuffer。特殊情况下，`Any`类型是零协议约束的存在容器（共32字节），`AnyObject`是零协议约束的类存在容器（仅8字节）。

### Q5: 用`as?`把一个值转换为某个协议类型时，Swift运行时是怎么判断这个类型是否遵循该协议的？

这涉及到Swift的**协议一致性**（Protocol Conformance）查找机制。编译器会为每一对（类型, 协议）关系生成一条**协议一致性记录**，存储在Mach-O的`__TEXT,__swift5_proto`段中，记录该类型对该协议的见证表位置。

运行时通过`swift_conformsToProtocol`函数执行查找，流程分为四步：

1. **查缓存**：首先检查全局一致性缓存（哈希表，key是(类型, 协议)对），命中则直接返回见证表地址
2. **扫描一致性记录**：缓存未命中时，遍历所有已加载Mach-O镜像的`__TEXT,__swift5_proto`段，逐条匹配目标类型和协议
3. **处理条件一致性**：如果记录标记为条件一致性（如`extension Array: Equatable where Element: Equatable`），递归检查泛型参数是否满足条件
4. **写入缓存**：匹配成功后缓存结果，后续相同查询直接命中，开销接近O(1)

一致性记录使用RelativePointer（相对指针）而非绝对指针，存储偏移量而非绝对地址，无需dyld重定位，因此可以放在只读的`__TEXT`段中，只读页可在多进程间共享，节省内存。

这个机制不仅用于`as?`/`as!`转换，也用于泛型约束检查、协议类型赋值等所有需要确认"类型是否遵循协议"的场景。

### Q6: 以下代码中`sayGoodbye()`的输出是什么？为什么？

```swift
protocol Greeting {
    func sayHello()
}
extension Greeting {
    func sayHello() { print("Hello from protocol") }
    func sayGoodbye() { print("Goodbye from protocol") }
}
struct Person: Greeting {
    func sayHello() { print("Hello from Person") }
    func sayGoodbye() { print("Goodbye from Person") }
}

let greeter: Greeting = Person()
greeter.sayHello()     // ?
greeter.sayGoodbye()   // ?
```

`greeter.sayHello()`输出 "Hello from Person"，`greeter.sayGoodbye()`输出 "Goodbye from protocol"。

两个方法的行为不同，根本原因在于**函数地址存储在哪里**：

`sayHello`是**协议要求方法**（在`protocol`声明体中定义），编译器会在见证表中为它分配槽位。通过协议类型调用时，运行时从存在容器中取出见证表指针，找到`Person.sayHello()`的函数指针并跳转——这是动态派发，能正确找到具体类型的实现。

`sayGoodbye`是**协议扩展方法**（仅在`extension`中定义，不在协议要求中），它不在任何派发表中（不在见证表、不在虚函数表），编译后只是Mach-O `__TEXT,__text`段中的普通函数符号。编译器在编译期根据变量的声明类型`Greeting`直接绑定到扩展版本的函数地址，运行时没有任何机会"发现"`Person`还有自己的`sayGoodbye()`。

因此，如果希望具体类型的实现在通过协议类型调用时生效，必须将方法声明为协议要求（写在`protocol`声明体中），而不能仅在扩展中定义。
