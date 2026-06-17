+++
date = '2026-06-16T09:06:27+08:00'
draft = false
title = 'Swift 面试：泛型、协议与派发源码解析'
tags = ['Swift', '泛型', 'Protocol', '派发', '源码分析', '面试']
categories = ['iOS开发']
weight = 2
+++

# Swift 面试：泛型、协议与派发源码解析

Swift 面试里，泛型和协议经常不是单独问语法，而是连着问：**Swift 中函数派发机制有哪几种？泛型是编译期还是运行期机制？协议调用为什么可能慢？`some` 和 `any` 为什么性能不同？Protocol Witness Table 到底是什么？**

这篇文章按面试题展开，把答案落到 Swift 编译器里的 Generic Signature、Generic Specializer、SIL 调用指令、Protocol Witness Table、class vtable 和 Devirtualize 优化。

## 面试高频问题

- Swift 中函数派发机制有哪几种？
- 直接派发、class vtable 派发、witness table 派发、Objective-C 消息派发分别适用于什么场景？
- `function_ref`、`class_method`、`witness_method`、`objc_method` 在 SIL 里分别代表什么？
- 如何用 `swiftc -emit-silgen` / `swiftc -emit-sil -O` 观察派发指令？
- `dynamic` / `@objc dynamic` 会怎样影响派发？
- 如何用代码对比泛型、`some`、`any` 的派发和性能差异？
- Swift 泛型是运行时泛型还是编译期泛型？
- Generic Signature 是什么？它保存哪些信息？
- 泛型特化为什么能提升性能？
- Protocol Witness Table 是什么？
- 协议方法调用什么时候是静态派发，什么时候是动态派发？
- `some Protocol` 和 `any Protocol` 的本质区别是什么？
- `final`、`private`、具体类型为什么有利于优化？
- 协议扩展里的方法一定是动态派发吗？
- `class_method` 和 `witness_method` 有什么区别？
- 面试里如何解释“Swift 既强调协议，又强调性能”？

## 30 秒回答版

Swift 函数派发面试不要只答“静态派发和动态派发”。更完整的分类是：**直接派发**、**class vtable 派发**、**protocol witness table 派发**、**Objective-C 消息派发**，再补充优化器可能把动态调用去虚拟化成直接调用。

Swift 泛型既不是简单的 C++ 模板，也不是完全运行时擦除。更准确地说：**Swift 会在编译期保留泛型约束信息，并在 SIL 优化阶段尽量做特化；如果无法确定具体类型，就通过运行时 metadata、witness table 等机制支持动态行为。**

协议派发的关键是 Protocol Witness Table。一个具体类型声明遵循某个协议时，编译器会记录“协议要求 -> 具体实现”的映射。通过协议存在类型或泛型约束调用协议方法时，可能需要查 witness table，再间接调用具体实现。

`some Protocol` 表示不透明类型：调用方不知道具体类型，但编译器知道同一个声明返回的是固定具体类型，更容易静态优化。`any Protocol` 表示存在类型：值被装进 existential 容器，运行时通过 witness table 保留协议能力，灵活但更可能有动态派发和装箱成本。

面试可以这样收束：

> Swift 用 `function_ref` 表达可确定目标的直接调用，用 `class_method` 表达 class 动态派发，用 `witness_method` 表达协议 requirement 派发，用 `objc_method` 衔接 Objective-C runtime；同时用 Generic Signature 描述泛型约束，用 Generic Specialization 和 Devirtualization 尽量把抽象成本消掉。

## 源码定位

下面链接指向 `swiftlang/swift` 的固定 commit，方便线上阅读。

| 主题 | 源码位置 | 重点 |
| --- | --- | --- |
| Generic Signature | [`lib/AST/GenericSignature.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/AST/GenericSignature.cpp#L48-L77) | 泛型签名实现与参数、约束组织 |
| 泛型特化 | [`lib/SILOptimizer/Transforms/GenericSpecializer.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/SILOptimizer/Transforms/GenericSpecializer.cpp) | SIL 层 generic specialization |
| SIL 调用指令 | [`include/swift/SIL/SILNodes.def`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILNodes.def#L339-L375) | `function_ref`、`class_method`、`objc_method`、`witness_method` 等指令分类 |
| FunctionRef / MethodInst | [`include/swift/SIL/SILInstruction.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILInstruction.h#L3576-L3629) | 直接函数引用与动态函数引用的建模 |
| ClassMethod / WitnessMethod | [`include/swift/SIL/SILInstruction.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILInstruction.h#L8059-L8147) | class 派发与 witness 派发的 SIL 指令定义 |
| Class vtable | [`include/swift/SIL/SILVTable.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILVTable.h#L13-L17) | class 动态派发方法到实现的映射 |
| Witness Table 结构 | [`lib/IRGen/ProtocolInfo.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/IRGen/ProtocolInfo.h#L38-L100) | IRGen 层协议见证表入口 |
| SIL Witness Table | [`include/swift/SIL/SILWitnessTable.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILWitnessTable.h) | SIL 层协议一致性表示 |
| Callee 分析 | [`lib/SIL/Utils/CalleeCache.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/SIL/Utils/CalleeCache.cpp#L294-L324) | 优化器如何区分不同 callee kind |
| 派发去虚拟化 | [`lib/SILOptimizer/Utils/Devirtualize.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/SILOptimizer/Utils/Devirtualize.cpp) | 动态调用转直接调用的条件 |
| 协议派发 benchmark | [`benchmark/single-source/ProtocolDispatch2.swift`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/benchmark/single-source/ProtocolDispatch2.swift) | 协议派发性能基准 |
| 泛型文档入口 | [`docs/Generics/README.md`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/docs/Generics/README.md) | 泛型系统相关文档索引 |

## Generic Signature 是什么？

先看一个普通泛型函数：

```swift
func decodeAll<T: Decodable, S: Sequence>(_ values: S) -> [T]
where S.Element == Data {
    []
}
```

源码层面，编译器不能只记一个字符串 `T: Decodable`。它需要知道：

- 有哪些泛型参数：`T`、`S`
- 每个参数的层级和索引
- 有哪些约束：`T: Decodable`、`S: Sequence`
- 有哪些 same-type 约束：`S.Element == Data`
- 类型检查、SILGen、SIL 优化、IRGen 后续阶段该如何引用这些信息

这类信息由 Generic Signature 表达。它可以理解成泛型声明的“约束合同”。

**已确认事实：** [`GenericSignature.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/AST/GenericSignature.cpp#L48-L77) 中的实现围绕泛型参数和 requirement 构造签名。

**机制推导：** 泛型函数在编译器内部不是“文本替换”，而是先建立一个可验证、可规范化、可传递给后续阶段的约束模型。后面的类型检查、泛型特化和 witness table 生成都依赖这份模型。

## 泛型特化为什么能提升性能？

泛型的优点是抽象，代价是编译器不一定知道具体类型。

例如：

```swift
func maxValue<T: Comparable>(_ a: T, _ b: T) -> T {
    a < b ? b : a
}

let x = maxValue(1, 2)
```

源码里写的是 `T: Comparable`，但调用点传入的是 `Int`。如果优化器能证明这里就是 `Int`，就有机会把通用版本特化成类似：

```swift
func maxValueForInt(_ a: Int, _ b: Int) -> Int {
    a < b ? b : a
}
```

这样做的收益包括：

- 少传递泛型 metadata
- 少查 witness table
- 具体类型方法更容易内联
- 后续常量传播、ARC 优化、DCE 更容易生效

[`GenericSpecializer.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/SILOptimizer/Transforms/GenericSpecializer.cpp) 就是 SILOptimizer 里处理泛型特化的入口之一。

面试回答时不要说“Swift 泛型都会被特化”。更稳妥的说法是：

> Swift 会尽量在 SIL 优化阶段对热点或可证明具体类型的泛型调用做 specialization，但跨模块、动态类型、递归、代码体积等因素都可能限制特化。

## Protocol Witness Table 是什么？

看一个协议：

```swift
protocol Drawable {
    func draw()
}

struct Circle: Drawable {
    func draw() {}
}
```

`Circle` 遵循 `Drawable` 时，编译器要记录：

```text
Drawable.draw  ->  Circle.draw
```

如果协议还有关联类型、基协议、一致性约束，表里还要记录更多信息。这个“协议要求到具体实现的映射”就是 witness table 的核心意义。

可以把它理解成：

```text
Protocol Witness Table for Circle: Drawable
├── method draw -> Circle.draw
├── associated type witness
└── associated conformance witness
```

**已确认事实：** [`include/swift/SIL/SILWitnessTable.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILWitnessTable.h) 定义了 SIL 层 witness table 相关结构；[`lib/IRGen/ProtocolInfo.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/IRGen/ProtocolInfo.h#L38-L100) 也能看到 IRGen 层对 witness table entry 的建模。

**机制推导：** 协议调用之所以能在不知道具体类型时仍然找到方法，就是因为运行时值携带或能找到“这个具体类型如何满足协议”的表。

## Swift 中函数派发机制有哪几种？

Swift 里“调用一个方法”不总是同一种机制。面试里可以先按 SIL 和 Runtime 视角分成四类：

1. **直接派发**：目标函数在编译期可确定，SIL 里常见为 `function_ref`。
2. **class vtable 派发**：Swift class 方法可能被 override，SIL 里常见为 `class_method`。
3. **protocol witness table 派发**：通过协议 requirement 调用，SIL 里常见为 `witness_method`。
4. **Objective-C 消息派发**：和 ObjC runtime 互操作，SIL 里常见为 `objc_method`。

**已确认事实：** [`SILNodes.def`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILNodes.def#L339-L375) 把 `function_ref`、`dynamic_function_ref`、`class_method`、`super_method`、`objc_method`、`objc_super_method`、`witness_method` 分在 literal / dynamic dispatch 相关指令里。

如果想自己验证，可以把示例代码保存成 `DispatchDemo.swift`，分别看 SILGen 和优化后的 SIL：

```bash
swiftc -emit-silgen DispatchDemo.swift
swiftc -emit-sil -O DispatchDemo.swift
```

`-emit-silgen` 更接近语义降级后的原始派发形式，适合观察 `class_method` / `witness_method` / `objc_method`；`-emit-sil -O` 适合观察 specialization、devirtualization 后有没有变成 `function_ref`。

### 直接派发：`function_ref`

如果编译器知道确切函数目标，就可以直接调用：

```swift
struct Point {
    func length() -> Double { 0 }
}

let p = Point()
p.length()
```

`Point.length` 没有继承覆盖问题，也不需要协议动态能力。SIL 中 `FunctionRefInst` 的注释直接说明它表示“对一个 SIL function 的引用”。用 `swiftc -emit-silgen` 能看到类似：

```sil
// function_ref Point.length()
%fn = function_ref @$s...5PointV6lengthSdyF : $@convention(method) (Point) -> Double
%result = apply %fn(%point) : $@convention(method) (Point) -> Double
```

这里的重点不是 mangled name，而是 `function_ref + apply`：调用目标已经是一个具体 SIL function。

常见直接派发场景：

- 全局函数、局部函数
- struct / enum 的普通方法
- `final` class 或 `final` 方法
- `private` / `fileprivate` 且优化器能证明没有动态替换的调用
- 已经被泛型特化或去虚拟化后的调用

直接派发的好处不是“少一次查表”这么简单，更重要的是后续优化空间更大：内联、常量传播、ARC 消除、死代码删除都会更容易发生。

一个更有面试价值的例子是：源码看起来用了协议，但优化后仍可能回到直接派发。

```swift
protocol Drawable {
    func draw()
}

struct Circle: Drawable {
    func draw() {}
}

func render<T: Drawable>(_ value: T) {
    value.draw()
}

render(Circle())
```

在未特化的泛型函数体里，`value.draw()` 需要按 `T: Drawable` 找 witness。`swiftc -emit-silgen` 里能看到类似：

```sil
%method = witness_method $T, #Drawable.draw
  : $@convention(witness_method: Drawable) <τ_0_0 where τ_0_0 : Drawable> (@in_guaranteed τ_0_0) -> ()
%result = apply %method<T>(%value)
```

但在 `render(Circle())` 这个调用点，优化器如果能把 `T` 特化成 `Circle`，就有机会生成专门版本。`swiftc -emit-sil -O` 里常见类似：

```sil
// function_ref specialized render<A>(_:)
%fn = function_ref @$s...6render...CircleV_Tg5 : $@convention(thin) () -> ()
apply %fn() : $@convention(thin) () -> ()
```

所以面试里说“struct 方法是直接派发”还不够，最好补一句：**泛型和协议调用也可能经过 specialization / devirtualization 回到直接调用。**

### class vtable 派发：`class_method`

class 方法如果可能被 override，就需要动态查找：

```swift
class Animal {
    func speak() {}
}

class Dog: Animal {
    override func speak() {}
}

func makeNoise(_ animal: Animal) {
    animal.speak()
}
```

调用 `animal.speak()` 时，真实目标取决于动态类型。这里通常通过 class vtable 找到当前动态类型对应的实现。

**已确认事实：** [`SILVTable.h`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILVTable.h#L13-L17) 说明 `SILVTable` 用来把可动态派发的 class 方法和属性映射到动态类型的具体实现，并且会被 IRGen 生成 class vtable，也会被 devirtualization pass 用来把 `class_method` 提升为静态 `function_ref`。

所以 `final` 的意义就很直接：它减少 override 可能性，让优化器更容易把 `class_method` 改成 `function_ref`。

对比下面两个调用：

```swift
func classDispatch(_ animal: Animal) {
    animal.speak()
}

final class Cat: Animal {
    override func speak() {}
}

func finalDispatch(_ cat: Cat) {
    cat.speak()
}
```

前者的静态类型是 `Animal`，真实实现可能来自任意子类，SILGen 中容易看到：

```sil
%method = class_method %animal, #Animal.speak
  : $@convention(method) (@guaranteed Animal) -> ()
apply %method(%animal) : $@convention(method) (@guaranteed Animal) -> ()
```

后者参数类型是 `final` 的 `Cat`，没有继续 override 的空间，调用目标更容易直接确定。即使在 SILGen 阶段，也可能直接看到：

```sil
// function_ref Cat.speak()
%fn = function_ref @$s...3CatC5speakyyF
  : $@convention(method) (@guaranteed Cat) -> ()
apply %fn(%cat) : $@convention(method) (@guaranteed Cat) -> ()
```

这就是 `final` 在性能面试里的核心价值：不是“final 本身更快”，而是它让动态派发更容易被静态化。

### protocol witness table 派发：`witness_method`

协议类型或泛型约束调用协议要求时，可能通过 witness table：

```swift
protocol Drawable {
    func draw()
}

func render<T: Drawable>(_ value: T) {
    value.draw()
}
```

如果 `T` 在调用点不能被特化，`draw` 的调用就不能简单写死为某个实现，需要通过 `T: Drawable` 的 witness table 找到目标函数。

**已确认事实：** [`WitnessMethodInst`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/include/swift/SIL/SILInstruction.h#L8121-L8147) 的注释说明：给定类型、协议一致性和协议方法常量，它会提取这个类型的方法实现；运行时 witness 会在 lookup type 对协议的 conformance 中查找。

这也是为什么协议调用的性能讨论经常和泛型特化放在一起：如果 `render(Circle())` 被特化成 `T == Circle`，`witness_method` 就有机会被解析成具体 `Circle.draw`，再继续内联。

存在类型 `any Drawable` 的例子更能体现 witness table 的运行时味道：

```swift
func renderExistential(_ value: any Drawable) {
    value.draw()
}
```

这里 `value` 的静态类型只是“某个符合 `Drawable` 的值”。SIL 里通常需要先打开 existential，再按打开后的类型查 witness：

```sil
%opened = open_existential_addr immutable_access %value
  to $*@opened(...) Self
%method = witness_method $@opened(...) Self, #Drawable.draw, %opened
  : $@convention(witness_method: Drawable) <τ_0_0 where τ_0_0 : Drawable> (@in_guaranteed τ_0_0) -> ()
apply %method<@opened(...) Self>(%opened)
```

这段流程解释了 `any` 的两层成本来源：一是要用 existential 容器表达“某个类型的值”，二是协议 requirement 调用可能要通过 witness table 间接找到实现。

如果具体类型的 witness 本身只是转发到 `Circle.draw()`，编译器还会生成一个 witness thunk，里面又能看到直接调用：

```sil
sil private [transparent] [thunk] @$s...CircleV...Drawable...draw...TW
  : $@convention(witness_method: Drawable) (@in_guaranteed Circle) -> () {
  // function_ref Circle.draw()
  %fn = function_ref @$s...CircleV4drawyyF
  apply %fn(%circle)
}
```

所以 witness 派发可以拆成两层理解：调用点通过 witness table 找入口，入口内部再转到具体类型实现。

### Objective-C 消息派发：`objc_method`

当 Swift 代码需要走 Objective-C runtime，例如继承 `NSObject`、暴露给 ObjC、使用 `@objc dynamic` 等场景，方法调用可能进入 ObjC 消息派发模型。

```swift
class ViewController: NSObject {
    @objc dynamic func reloadData() {}
}
```

这类调用的核心不是 Swift vtable 或 witness table，而是 Objective-C runtime 的消息发送和动态查找能力。它更灵活，能支持 KVO、Selector、动态替换等能力，但通常也更难被 Swift 优化器静态化。

需要注意：`dynamic` 表达的是“这个访问需要保留动态语义，不要被普通静态优化随便改写”；`@objc dynamic` 则明确把成员暴露到 Objective-C runtime 的动态派发路径。面试里不要把所有 `dynamic` 都简单等同于普通 Swift class vtable。

边界例子是同一个类里同时存在普通 Swift 方法、`dynamic` 方法和 `@objc dynamic` 方法：

```swift
import Foundation

class Loader: NSObject {
    func normalReload() {}
    dynamic func swiftDynamicReload() {}
    @objc dynamic func objcDynamicReload() {}
}

func test(_ loader: Loader) {
    loader.normalReload()       // Swift class 方法：可走 class_method，也可能被去虚拟化
    loader.swiftDynamicReload() // 保留 Swift 动态语义，优化更保守
    loader.objcDynamicReload()  // 暴露给 ObjC runtime，常见 objc_method / objc_msgSend 路径
}
```

对应的 SILGen 形态通常类似：

```sil
%normal = class_method %loader, #Loader.normalReload
apply %normal(%loader)

%swiftDynamic = class_method %loader, #Loader.swiftDynamicReload
apply %swiftDynamic(%loader)

%objcDynamic = objc_method %loader, #Loader.objcDynamicReload!foreign
apply %objcDynamic(%loader) : $@convention(objc_method) (Loader) -> ()
```

这里可以看到：`dynamic` 不等于 `objc_method`；只有 `@objc dynamic` 这种暴露给 Objective-C runtime 的调用才会走 `objc_method` 形态。

面试里可以这样说：

> `final` / `private` 是给编译器更多“目标唯一”的证据；`dynamic` / `@objc dynamic` 是反过来要求保留动态查找能力。二者不是同一类优化开关，而是相反方向的语义约束。

### 面试对比表

| 派发方式 | SIL 线索 | 典型场景 | 成本 | 优化机会 |
| --- | --- | --- | --- | --- |
| 直接派发 | `function_ref` | struct / enum 方法、final 方法、已知函数 | 最低 | 容易内联 |
| class vtable 派发 | `class_method` | 可 override 的 Swift class 方法 | vtable 间接调用 | final / whole-module 可去虚拟化 |
| witness table 派发 | `witness_method` | protocol requirement、existential、泛型约束 | witness table 间接调用 | 特化、去虚拟化 |
| Objective-C 消息派发 | `objc_method` | `@objc dynamic`、NSObject 体系、Selector/KVO | ObjC runtime 消息查找 | 取决于动态特性，通常更保守 |

一句话回答：

> Swift 函数派发不是二分成“静态/动态”。源码和 SIL 里能看到更细的模型：能确定目标时走 `function_ref`，class 多态走 `class_method` 和 vtable，协议多态走 `witness_method` 和 witness table，ObjC 互操作走 `objc_method` 和 Objective-C runtime；优化器会尽量把后几类在安全条件下还原成直接调用。

## `some` 和 `any` 的区别

这题非常高频。

### `some Protocol`：不透明类型

```swift
func makeShape() -> some Drawable {
    Circle()
}
```

调用者只知道返回值符合 `Drawable`，不知道它是 `Circle`。但对编译器来说，这个函数在实现里返回的是某个固定具体类型。

所以 `some` 的核心是：

> 对调用者隐藏具体类型，对编译器保留具体类型。

这通常更利于静态优化，也不会把每个值都当成 existential 容器处理。

### `any Protocol`：存在类型

```swift
let shape: any Drawable = Circle()
shape.draw()
```

这里变量里可以放任何符合 `Drawable` 的值。为了做到这一点，运行时需要保存值本身以及对应的协议能力。调用协议方法时，就更可能通过 witness table 动态派发。

所以 `any` 的核心是：

> 类型被擦除成“某个符合协议的值”，灵活，但更依赖运行时表和容器。

### 面试回答

> `some` 是编译期不透明类型，隐藏类型但不抹掉编译器对具体类型的认知；`any` 是运行时存在类型，允许存放不同具体类型，但通常需要 existential 容器和 witness table。性能敏感路径优先考虑泛型或 `some`，但要权衡代码体积和编译时间；需要异构存储和动态替换时使用 `any`。

### 边界例子：`some` 不能表达异构返回

```swift
protocol Shape {
    func area() -> Double
}

struct Circle: Shape {
    func area() -> Double { 1 }
}

struct Rectangle: Shape {
    func area() -> Double { 2 }
}

func makeShape(flag: Bool) -> some Shape {
    if flag {
        return Circle()
    } else {
        return Rectangle() // 编译错误：同一个 some Shape 声明必须对应一个固定具体类型
    }
}
```

如果确实需要异构返回，有两种常见改法：

```swift
// 方案 1：使用 any，保留动态性
func makeAnyShape(flag: Bool) -> any Shape {
    flag ? Circle() : Rectangle()
}

// 方案 2：用一个具体包装类型统一返回类型
struct AnyShapeBox: Shape {
    private let _area: () -> Double

    init<S: Shape>(_ shape: S) {
        self._area = shape.area
    }

    func area() -> Double { _area() }
}

func makeBoxedShape(flag: Bool) -> some Shape {
    flag ? AnyShapeBox(Circle()) : AnyShapeBox(Rectangle())
}
```

这个例子适合面试收束：`some` 解决“隐藏具体类型但保持静态优化空间”，`any` 解决“运行时异构”，二者不是谁替代谁。

## 协议扩展里的方法一定是动态派发吗？

不一定。

这个问题的陷阱在于：协议“要求”和协议扩展“普通方法”不一样。

```swift
protocol Runner {
    func run()
}

extension Runner {
    func run() {}
    func warmUp() {}
}

struct Sprinter: Runner {
    func run() {}
    func warmUp() {}
}
```

这里要分两类看：

- `run` 是协议 requirement。extension 里的 `run` 只是默认实现，可以作为某个类型的 witness；如果具体类型自己实现了 `run`，witness table 记录的就是具体类型实现。
- `warmUp` 不是 requirement，只是协议扩展方法。它不会因为 `Sprinter` 也写了同名方法，就自动获得 requirement 级别的动态派发语义。

面试里可以用下面这个例子解释陷阱：

```swift
let s = Sprinter()
s.warmUp()       // 静态类型是 Sprinter，调用 Sprinter.warmUp

let r: any Runner = Sprinter()
r.run()          // Runner requirement，通过 witness table 找 Sprinter.run
r.warmUp()       // 非 requirement，静态绑定到 Runner extension 的 warmUp
```

如果给 `warmUp` 加打印，结果会类似：

```text
s.warmUp()  -> Sprinter.warmUp
r.warmUp()  -> Runner extension warmUp
```

所以更准确的说法是：

- 协议 requirement：可由具体类型实现，通常进入 witness table。
- 协议 extension 中非 requirement 方法：可以在协议静态类型上调用，但不会进入 witness table；即使具体类型有同名方法，协议类型调用也会绑定到 extension 实现。

## Devirtualization：动态派发能不能变成直接调用？

Swift 优化器会尝试把动态派发变成直接调用，这叫 devirtualization。

[`Devirtualize.cpp`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/lib/SILOptimizer/Utils/Devirtualize.cpp) 的存在说明 Swift 优化器会分析调用目标是否可确定。

常见可优化条件：

- 类型是 `final`
- 方法是 `final` 或 `private`
- whole-module optimization 能看到所有 override
- 泛型调用被 specialization 成具体类型
- existential 的具体类型在编译期可被证明，例如局部范围内只可能来自某个具体类型

机制可以简化成：

```text
原始调用：witness_method / class_method + apply
分析证明目标唯一
替换为：function_ref + apply
后续继续内联、DCE、ARC 优化
```

对比 SIL 时可以这样看：

```sil
// SILGen：保留动态语义
%method = class_method %animal, #Animal.speak
apply %method(%animal)

// Optimized SIL：如果目标唯一，可能变成直接引用
%fn = function_ref @$s...3CatC5speakyyF
apply %fn(%cat)
```

同理，泛型协议调用也可能从：

```sil
%method = witness_method $T, #Drawable.draw
apply %method<T>(%value)
```

变成：

```sil
%fn = function_ref @$s...specialized_render_for_Circle
apply %fn()
```

**机制推导：** Swift 的性能策略不是“永远避免协议”，而是让协议表达抽象，再让优化器在能证明安全的时候消掉动态成本。

## 性能视角：什么时候该关心协议派发？

一般业务代码不用过度担心。真正需要关注的是：

- 图像、音频、动画、布局等热循环
- 每帧大量调用的小方法
- 大量元素遍历时每个元素都走 existential 调用
- 泛型函数没有被特化，且内部调用频繁

Swift 源码仓库里有 [`ProtocolDispatch2.swift`](https://github.com/swiftlang/swift/blob/a91d653b3703a41a8f557ccc1ba8fbbccec203e4/benchmark/single-source/ProtocolDispatch2.swift) 这类 benchmark，说明协议派发性能本身就是标准库和编译器关注的主题。

实战建议：

```swift
// 更灵活：异构集合、运行时替换
let renderers: [any Drawable]

// 更容易优化：同构、静态类型保留
func renderAll<T: Drawable>(_ values: [T])

// 返回单一隐藏类型：隐藏实现又保留静态优化空间
func makeRenderer() -> some Drawable
```

### 性能对比代码：泛型循环 vs existential 循环

下面这段代码不是为了给出固定耗时数字，而是为了演示如何比较两种派发路径。实际运行时要用 Release / `-O` 构建，先预热，多跑几轮，并避免把循环体优化成空操作。

```swift
import Dispatch

protocol PixelOp {
    func apply(_ value: Int) -> Int
}

struct AddOne: PixelOp {
    @inline(never)
    func apply(_ value: Int) -> Int {
        value &+ 1
    }
}

@inline(never)
func runGeneric<T: PixelOp>(_ op: T, count: Int) -> Int {
    var result = 0
    for i in 0..<count {
        result = result &+ op.apply(i)
    }
    return result
}

@inline(never)
func runExistential(_ op: any PixelOp, count: Int) -> Int {
    var result = 0
    for i in 0..<count {
        result = result &+ op.apply(i)
    }
    return result
}

func measure(_ name: String, repeats: Int = 5, _ body: () -> Int) {
    var checksum = body() // warm-up，让缓存、分支预测等运行状态先稳定一点
    var samples: [UInt64] = []

    for _ in 0..<repeats {
        let start = DispatchTime.now().uptimeNanoseconds
        let result = body()
        let end = DispatchTime.now().uptimeNanoseconds
        checksum = checksum &+ result // 避免循环结果被优化器当成无用计算
        samples.append(end - start)
    }

    let best = samples.min() ?? 0
    let avg = samples.isEmpty ? 0 : samples.reduce(0, +) / UInt64(samples.count)
    print("\(name): best=\(Double(best) / 1_000_000) ms, avg=\(Double(avg) / 1_000_000) ms, checksum=\(checksum)")
}

let op = AddOne()
let count = 10_000_000

measure("generic") {
    runGeneric(op, count: count)
}

measure("existential") {
    runExistential(op, count: count)
}
```

这段代码的面试解读重点不是“`any` 一定慢多少倍”，而是：

- `runGeneric` 保留了具体类型 `T`，优化器有机会 specialization。
- `runExistential` 接收 `any PixelOp`，更可能保留 existential 容器和 witness table 调用。
- `@inline(never)` 是为了隔离“派发调用”这个变量；真实业务代码里，内联本身也是优化收益的一部分。
- 如果循环体很大，派发成本的相对占比会下降；如果循环体很小且调用次数巨大，派发差异才更值得关注。

这类微基准还有几个边界要提前说明：

1. **同模块优化可能让差异变小。** 如果编译器在同一个模块内看到 `let op = AddOne()`，它可能把 existential 的具体来源也分析出来。此时你测到的是“优化器有多聪明”，不只是“existential 固有成本”。
2. **跨模块边界会影响结果。** 如果泛型函数在另一个模块里，且没有暴露足够的优化信息，调用方不一定能完成同样程度的 specialization。
3. **existential 成本不只来自方法派发。** 小值可能放进 existential inline buffer，大值或需要装箱的值可能引入额外拷贝/分配；协议组合、关联类型约束、class-bound protocol 也会改变成本结构。
4. **不要拿异构集合和同构泛型做绝对公平比较。** `[any PixelOp]` 表达的是“每个元素可以是不同实现”，而 `[AddOne]` 表达的是同一种具体类型，它们的语义本来就不同。

### 边界例子：异构数组只能用 `any`

```swift
struct DoubleIt: PixelOp {
    func apply(_ value: Int) -> Int { value * 2 }
}

let homogeneous = [AddOne(), AddOne()]
_ = runGeneric(homogeneous[0], count: 1_000)

let heterogeneous: [any PixelOp] = [AddOne(), DoubleIt()]
for op in heterogeneous {
    _ = runExistential(op, count: 1_000)
}
```

这里 `[AddOne(), DoubleIt()]` 不能直接作为 `[T]` 传给泛型函数，因为数组元素不是同一个具体类型。使用 `any PixelOp` 是为了表达“这个集合里有不同实现”，它是语义需求，不只是性能选择。

如果要测试“调用边界处无法知道具体类型”的情况，可以把 existential 的创建也放到一个不会被内联的函数后面：

```swift
@inline(never)
func makeOp(_ flag: Bool) -> any PixelOp {
    flag ? AddOne() : DoubleIt()
}

let runtimeOp = makeOp(Bool.random())
_ = runExistential(runtimeOp, count: 1_000)
```

这个例子比 `let op: any PixelOp = AddOne()` 更接近真实动态边界，因为优化器更难在调用点证明 existential 里一定是 `AddOne`。

## 易错点 / 追问

### 1. Swift 泛型是不是像 C++ 模板？

不完全是。

Swift 泛型约束会通过 Generic Signature 在编译期记录，运行时又能通过 metadata 和 witness table 支持无法特化的泛型抽象。它既能在编译期做 specialization，也能在无法特化时保留泛型抽象运行。

更准确的答法：

> Swift 泛型在语义上是类型安全的泛型系统，在实现上结合了编译期约束、SIL specialization 和运行时 metadata / witness table。

### 2. `any Protocol` 为什么可能有额外成本？

因为它需要表达“某个符合协议的值”。运行时可能需要 existential 容器保存值，并携带类型 metadata 和 witness table。协议方法调用也可能通过表间接跳转。

### 3. `some Protocol` 能不能返回不同具体类型？

同一个声明下通常不行。

```swift
func make(flag: Bool) -> some Drawable {
    if flag {
        return Circle()
    } else {
        return Rectangle() // 通常不允许，除非被包装成统一具体类型
    }
}
```

`some` 隐藏的是一个固定具体类型，不是“任意符合协议的类型”。

### 4. 协议一定慢吗？

不一定。

如果调用点被泛型特化或去虚拟化，协议抽象可能被优化成直接调用。只有无法静态确定目标时，才需要承担更多动态成本。

### 5. `final` 有什么优化意义？

`final` 告诉编译器没有子类 override，调用目标更容易确定。这样 class method 有机会从动态派发变成直接调用，甚至内联。

### 6. Swift 中函数派发机制有哪几种？

面试推荐答四类：

```text
直接派发 function_ref
class vtable 派发 class_method
protocol witness table 派发 witness_method
Objective-C 消息派发 objc_method
```

再补一句：这四类不是互斥的性能标签，而是不同语义边界下的实现路径。优化器可能把 `class_method` / `witness_method` 去虚拟化成 `function_ref`。

### 7. struct / enum 方法为什么通常是直接派发？

因为 struct / enum 没有继承 override。只要调用目标在编译期可见，编译器就不需要保留运行时动态查找入口。

但“通常”不等于“源码文本一定直接调用”。如果方法通过协议 requirement 调用，例如 `func f<T: P>(_ value: T) { value.run() }`，调用点仍可能先表现为 `witness_method`，再等待特化和去虚拟化。

### 8. class 扩展里的方法怎么派发？

要分情况：

- class 本体里可 override 的普通方法：可能走 vtable。
- extension 里新增的普通方法：没有 override 入口，所以不会进入该 class 的 vtable，通常在编译期可被识别为直接调用。
- 如果 extension 方法实现的是某个协议 requirement：通过协议类型调用时仍可能走 witness table。
- `@objc` / `dynamic` 相关方法：可能进入 ObjC 或动态派发路径。

所以不要简单说“class 方法都是动态派发”。Swift 关心的是这个成员是否有动态替换、override、协议 requirement、ObjC runtime 互操作等语义需求。

### 9. 协议扩展默认实现和协议要求的派发有什么区别？

协议要求会进入 witness table。协议扩展里的非 requirement 方法可以在协议静态类型上调用，但不会进入 witness table。

经典陷阱是：

```swift
protocol P {
    func required()
}

extension P {
    func required() { print("default required") }
    func helper() { print("extension helper") }
}

struct S: P {
    func required() { print("S required") }
    func helper() { print("S helper") }
}

let s = S()
s.helper()       // S helper

let p: any P = S()
p.required()     // S required，走 requirement / witness
p.helper()       // extension helper，静态绑定到协议扩展方法
```

`required` 是 requirement 的默认实现，可以作为 witness；`helper` 不是 requirement，不会因为具体类型也写了同名方法就自动获得 requirement 级别的动态派发语义。

### 10. `dynamic` 和 `@objc dynamic` 面试怎么答？

`dynamic` 的核心是要求保留动态调用语义，限制编译器把调用过早静态化；`@objc dynamic` 还明确把成员暴露给 Objective-C runtime，常见于 KVO、Selector、NSObject 体系互操作。

面试里可以这样说：

> `final` 是给优化器更多静态确定性，`dynamic` 是反过来要求保留动态性；`@objc dynamic` 进一步把动态性落到 Objective-C runtime。它们不是性能优化开关，而是语义约束开关。

### 11. 性能对比代码怎么写才不容易误导？

不要只写下面这种代码：

```swift
let start = Date()
for _ in 0..<1_000_000 {
    op.apply(1)
}
print(Date().timeIntervalSince(start))
```

它的问题是：循环结果没被使用，优化器可能删除大量工作；Debug 构建和 Release 构建差异也很大。

更稳妥的写法可以分成两层。

必须做到：

- 用 Release / `-O` 构建，不要用 Debug 数字下结论。
- 累加返回值并打印或传出，避免循环被优化掉。
- 比较泛型版本和 existential 版本时，保证循环体业务逻辑相同。
- 不把微基准数字当成绝对结论，只用来解释派发路径差异。

强烈建议：

- 先 warm-up，再多轮采样，看 best / median / avg，而不是只看一次运行。
- 给被测函数加 `@inline(never)`，降低内联对“派发路径”实验的干扰。
- 同时看 SIL：确认你测的版本里真的还有 `witness_method` / `class_method`，还是已经被优化成 `function_ref`。
- 把同模块、跨模块、`@inlinable` / 非 `@inlinable` 的情况分开讨论。
- 不在循环体里打印、分配大对象或做 I/O，否则测到的主要就不是派发成本。

## 复习小结

这篇文章可以按五层记：

1. **Dispatch Model**：`function_ref`、`class_method`、`witness_method`、`objc_method` 分别对应直接派发、class vtable、protocol witness table 和 ObjC 消息派发。
2. **Generic Signature**：描述泛型参数和约束，是类型检查与后续代码生成的合同。
3. **Generic Specialization**：在 SIL 优化阶段把部分泛型调用变成具体类型版本，降低抽象成本。
4. **Protocol Witness Table**：保存协议要求到具体实现的映射，让协议动态能力可运行。
5. **Dispatch Optimization**：Swift 会通过 final、private、whole-module、specialization、devirtualization 尽量把动态调用变直接调用。

面试最后可以这样总结：

> Swift 的泛型、协议和派发不是单纯“灵活但慢”。它们先用 Generic Signature、vtable、Witness Table 等结构建立抽象边界，再通过 SIL specialization 和 devirtualization 在能证明安全的地方把抽象成本消掉。
