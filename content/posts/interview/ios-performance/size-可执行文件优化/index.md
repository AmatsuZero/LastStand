+++
title = "包瘦身-可执行文件优化"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 34
tags = ["iOS", "性能优化", "包瘦身"]
categories = ["iOS开发", "性能优化"]
+++
可执行文件通常占iOS应用包体积的30-50%，是优化的重点。本文介绍各种可执行文件优化手段及其原理。

---

## 编译器优化选项

### 优化级别原理

编译器优化级别控制了LLVM在编译时应用的优化Pass数量和类型。

**什么是优化Pass？** Pass是指编译器对代码进行的一次特定优化处理过程。LLVM将优化工作分解为多个独立的Pass，每个Pass负责一种特定类型的优化：

```
源代码 → 前端解析 → IR（中间表示）→ Pass1 → Pass2 → Pass3 → ... → 优化后的代码 → 机器码
```

常见的优化Pass包括：

| Pass名称 | 作用 |
|----------|------|
| Dead Code Elimination | 删除永远不会执行的代码 |
| Constant Folding | 编译时计算常量表达式，如`3+5`直接变成`8` |
| Function Inlining | 将函数调用替换为函数体本身 |
| Loop Unrolling | 展开循环，减少循环控制开销 |
| Common Subexpression Elimination | 消除重复计算的表达式 |

不同的优化级别启用不同数量和类型的Pass：

```
# Build Settings
Optimization Level = -Os  # 级别：-Os 优化大小（推荐用于Release）
```

**-O0（无优化）**

不应用任何优化Pass，编译速度最快。代码按原样生成，保留所有变量和控制流，便于调试。适用于Debug构建。

**-O1（基础优化）**

应用不显著增加编译时间的基础优化，包括：
- 基本的死代码消除
- 简单的常量折叠
- 基本块合并

**死代码消除：** 死代码消除（Dead Code Elimination）是指编译器自动移除永远不会被执行或执行结果不会被使用的代码。注意：这里的死代码消除是编译阶段的优化，作用于函数内部；而后文提到的Dead Code Stripping是链接阶段的优化，用于移除未被引用的整个函数或类。

-O1 适合需要一定优化但对编译速度敏感的场景。

**-O2（标准优化）**

应用大多数优化Pass，是性能和体积的平衡点。包括：
- 函数内联（有阈值限制）
- 循环优化（强度削减、循环不变量外提）
- 寄存器分配优化
- 指令调度
- 尾调用优化

大多数生产环境的默认选择。

**-O3（激进优化）**

启用所有-O2的优化，并增加更激进的优化：
- 更激进的函数内联（更高的阈值）
- 循环展开（Loop Unrolling）
- 向量化（Vectorization）
- 循环向量化

```c
// 源代码
for (int i = 0; i < 4; i++) {
    array[i] = 0;
}

// -O3循环展开后（体积增大，但减少循环开销）
array[0] = 0;
array[1] = 0;
array[2] = 0;
array[3] = 0;
```

注意：-O3可能显著增大代码体积，不推荐用于release构建。

**-Os（优化大小，推荐）**

基于-O2，但禁用会增大体积的优化。这是iOS Release构建的推荐选择：
- 禁用循环展开
- 禁用激进的函数内联
- 禁用向量化
- 优先选择体积更小的指令序列

**-Oz（极致大小优化）**

比-Os更激进地优化体积，可能牺牲运行时性能：
- 更严格地限制内联
- 优先选择最短的指令编码
- 可能使用更慢但更小的代码模式

适合对体积极度敏感、对性能要求不高的场景。

**-Ofast（最快速度优化）**

在-O3基础上，启用可能违反语言标准的激进优化：
- 启用`-ffast-math`：放宽浮点数运算的精度要求
- 忽略浮点数的NaN和Inf处理
- 允许浮点运算重排序（可能改变结果）
- 假设没有浮点异常

```c
// -Ofast下，编译器可能将
float result = a / b + c / b;
// 优化为（数学上等价，但浮点精度可能不同）
float result = (a + c) / b;
```

注意：-Ofast可能导致浮点计算结果与预期不符，不推荐在对数值精度有要求的场景使用。

**Clang各级别对比**

| 优化级别 | 编译速度 | 运行性能 | 代码体积 | 适用场景 |
|---------|---------|---------|---------|---------|
| -O0 | 最快 | 最差 | 最大 | Debug调试 |
| -O1 | 快 | 一般 | 较大 | 快速迭代 |
| -O2 | 中等 | 好 | 中等 | 通用生产环境 |
| -O3 | 慢 | 最好 | 最大 | 性能关键代码 |
| -Ofast | 慢 | 极好 | 最大 | 不推荐（牺牲精度） |
| -Os | 中等 | 好 | 较小 | iOS Release（推荐） |
| -Oz | 中等 | 一般 | 最小 | 极致体积优化 |

### Swift编译器优化级别

Swift编译器（swiftc）有独立的优化级别设置，与Clang不同：

```
# Build Settings
Swift Compiler - Code Generation
Optimization Level = -O  # 推荐用于Release
```

**-Onone（无优化）**

不进行任何优化，保留完整的调试信息。适用于Debug构建，编译速度最快。

**-O（标准优化，推荐）**

启用大多数优化，是Swift Release构建的推荐选择。包括：
- 函数内联
- 泛型特化（Generic Specialization）
- 去虚拟化（Devirtualization）
- 引用计数优化

**-Osize（优化大小）**

类似于Clang的-Os，优先减小代码体积：
- 限制函数内联
- 减少泛型特化
- 优先选择体积更小的代码生成策略

适合对包体积敏感的场景。

**Swift各级别对比**

| 优化级别 | 编译速度 | 运行性能 | 代码体积 | 适用场景 |
|---------|---------|---------|---------|---------|
| -Onone | 最快 | 最差 | 最大 | Debug调试 |
| -O | 慢 | 好 | 中等 | Release（推荐） |
| -Osize | 慢 | 一般 | 较小 | 体积敏感场景 |

### Strip Symbols原理

符号表存储在`__LINKEDIT`段中，包含函数名、变量名等调试信息。Strip操作移除这些符号：

```
# Build Settings
Strip Linked Product = YES
Strip Style = All Symbols  # 移除所有符号
Strip Swift Symbols = YES
```

**符号类型**：

| 符号类型 | 说明 | 是否可Strip |
|---------|-----|------------|
| 本地符号 | 文件内部使用 | 可以 |
| 全局符号 | 导出供外部使用 | 动态库不可以 |
| 调试符号 | DWARF调试信息 | 可以（保留到dSYM） |
| 间接符号 | 动态链接需要 | 不可以 |

**Strip Style选项**：

- `All Symbols`：移除所有符号（主程序推荐）
- `Non-Global Symbols`：保留全局符号（动态库推荐）
- `Debugging Symbols`：仅移除调试符号

### Dead Code Stripping原理

Dead Code Stripping（死代码消除）在链接阶段工作，通过分析符号引用关系，移除未被引用的代码：

```
# Build Settings
Dead Code Stripping = YES
```

**工作原理**：

```
1. 从入口点（main函数）开始
2. 递归标记所有被引用的符号
3. 未被标记的符号视为"死代码"
4. 链接时不包含死代码
```

**限制**：

- 只对静态链接的代码有效
- Objective-C的动态特性会阻止某些优化
- 需要配合`-ObjC`链接标志使用时要注意

```bash
# -ObjC标志会加载所有ObjC代码，阻止Dead Code Stripping
# 可以使用-force_load替代，只加载特定库
OTHER_LDFLAGS = -force_load $(SRCROOT)/Libs/libSomeLib.a
```

### Link-Time Optimization (LTO)原理

LTO将优化推迟到链接阶段，此时编译器可以看到所有模块的代码，进行跨模块优化：

```
# Build Settings
Link-Time Optimization = Incremental  # 或 Monolithic
```

**传统编译 vs LTO**：

```
传统编译：
┌─────────┐    ┌─────────┐    
│ A.swift │ →  │  A.o    │ ─┐
└─────────┘    └─────────┘  │
                            ├→ 链接器 → 可执行文件
┌─────────┐    ┌─────────┐  │
│ B.swift │ →  │  B.o    │ ─┘
└─────────┘    └─────────┘
（各模块独立优化，无法跨模块内联）

LTO编译：
┌─────────┐    ┌─────────┐
│ A.swift │ →  │ A.bc    │ ─┐
└─────────┘    └─────────┘  │
                            ├→ LTO优化器 → 链接器 → 可执行文件
┌─────────┐    ┌─────────┐  │
│ B.swift │ →  │ B.bc    │ ─┘
└─────────┘    └─────────┘
（.bc是LLVM bitcode，优化器可以跨模块分析）
```

**LTO的优化能力**：

- 跨模块函数内联
- 跨模块死代码消除
- 全局变量优化
- 去虚拟化（Devirtualization）

**Incremental vs Monolithic**：

- `Incremental`：增量LTO，只重新优化改变的模块，编译更快
- `Monolithic`：全量LTO，优化效果更好，但编译慢

---

## 清理无用代码

### 检测未使用的类

Mach-O文件中，ObjC类信息存储在特定的Section中：

- `__objc_classlist`：所有定义的类
- `__objc_classrefs`：所有被引用的类

```bash
# 获取所有定义的ObjC类
nm YourApp | grep "_OBJC_CLASS_\\$" | grep -v " U " | awk '{print $3}'

# 或者直接解析objc类列表（更稳健）
otool -ov YourApp | grep "_OBJC_CLASS_\\$_"

# 获取所有引用的ObjC类  
otool -v -s __DATA __objc_classrefs YourApp
```

**原理解析**：

```
__objc_classlist段：
┌────────────────────────────┐
│ 指向ClassA的指针             │  ← 定义了ClassA
│ 指向ClassB的指针             │  ← 定义了ClassB
│ 指向ClassC的指针             │  ← 定义了ClassC（未使用）
└────────────────────────────┘

__objc_classrefs段：
┌────────────────────────────┐
│ 指向ClassA的指针             │  ← 代码中引用了ClassA
│ 指向ClassB的指针             │  ← 代码中引用了ClassB
└────────────────────────────┘

对比两个段，ClassC在classlist中但不在classrefs中 → 未使用
```

### 检测未使用的方法

方法检测基于`__objc_selrefs`段，存储所有被引用的Selector：

```bash
# 获取所有被引用的selector
otool -v -s __DATA __objc_selrefs YourApp
```

**Selector引用机制**：

```objc
// 源代码
[obj doSomething];

// 编译后，selector被存入__objc_selrefs
// __objc_selrefs段：
// 0x100001000: "doSomething"
```

**静态分析的局限性**：

由于Objective-C的动态特性，以下情况会导致误判：

```objc
// 1. performSelector动态调用
SEL sel = NSSelectorFromString(@"hiddenMethod");
[obj performSelector:sel];  // hiddenMethod不会出现在__objc_selrefs中

// 2. KVC访问
[obj setValue:@"value" forKey:@"propertyName"];  // setter不会被记录

// 3. Storyboard/XIB中的IBAction
// 在Interface Builder中连接的方法不会出现在代码引用中
```

### 检测Swift未使用的代码

Swift与ObjC不同，Swift是静态类型语言，编译器在编译时就能确定类型信息，因此检测未使用代码相对更可靠。

**方法一：Periphery工具**

[Periphery](https://github.com/peripheryapp/periphery) 是专门用于检测Swift未使用代码的开源工具，是目前最推荐的方案。

```bash
# 安装
brew install peripheryapp/periphery/periphery

# 扫描项目
periphery scan --project YourApp.xcodeproj --schemes YourApp --targets YourApp
```

Periphery可以检测：
- 未使用的类、结构体、枚举
- 未使用的协议
- 未使用的函数和方法
- 未使用的属性
- 未使用的类型别名
- 未调用的协议方法（仅声明未实现）
- 冗余的协议遵循

**工作原理**：

Periphery基于SourceKit构建完整的代码索引，分析所有声明和引用关系：

```
1. 使用xcodebuild构建项目，生成索引数据
2. 解析所有Swift文件的AST
3. 构建声明-引用关系图
4. 从入口点（如@main、AppDelegate）开始遍历
5. 未被遍历到的声明即为未使用代码
```

**配置文件示例**（`.periphery.yml`）：

```yaml
project: YourApp.xcodeproj
schemes:
  - YourApp
targets:
  - YourApp
retain_public: true          # 保留public声明（库开发时使用）
retain_objc_accessible: true # 保留@objc标记的代码
```

**方法二：Xcode编译器警告**

Xcode内置了部分未使用代码的警告，但覆盖范围有限：

```
Build Settings:
- Unused Variables: YES        # 未使用的变量
- Unused Parameters: YES       # 未使用的参数
- Unreachable Code: YES        # 不可达代码
```

这些警告只能检测函数内部的问题，无法检测未使用的类或方法。

**方法三：SwiftLint规则**

SwiftLint提供了一些相关规则：

```yaml
# .swiftlint.yml
opt_in_rules:
  - unused_import           # 未使用的import
  - unused_declaration      # 未使用的声明（需要额外配置）
```

但SwiftLint的检测能力有限，主要用于代码风格检查。

**Swift检测的特殊考虑**：

1. **@objc标记的代码**：可能被ObjC运行时调用，不能简单删除
2. **Codable属性**：即使代码中未直接访问，编解码时会使用
3. **SwiftUI的@ViewBuilder**：闭包中的代码可能看起来未使用
4. **Protocol扩展的默认实现**：可能被子类型隐式使用

```swift
// 看似未使用，但Codable会用到
struct User: Codable {
    let id: Int
    let name: String  // Periphery可能报告未使用，但实际用于JSON编解码
}

// @objc方法可能被ObjC代码或Selector调用
@objc func handleTap() {
    // ...
}
```

**ObjC vs Swift检测对比**

| 特性 | ObjC | Swift |
|-----|------|-------|
| 检测原理 | Mach-O段分析 | 源码AST分析 |
| 准确性 | 受动态特性影响，误报较多 | 静态类型，准确性高 |
| 推荐工具 | WBBlades、AppCode | Periphery |
| 需要源码 | 否（分析二进制） | 是（需要编译项目） |


### 使用AppCode

AppCode提供了"Inspect Code"功能，可以检测：

- 未使用的类
- 未使用的方法
- 未使用的import
- 未使用的变量

### 使用WBBlades

[WBBlades](https://github.com/wuba/WBBlades) 是58同城开源的基于Mach-O的分析工具，可以检测无用类和无用协议。

**无用类检测原理**：

WBBlades通过分析Mach-O文件中的`__objc_classlist`和`__objc_classrefs`段，对比找出未被引用的类：

```
分析流程：
1. 解析__objc_classlist获取所有定义的类
2. 解析__objc_classrefs获取所有被引用的类
3. 分析Swift类的元数据（支持Swift）
4. 对比得出未使用的类列表
```

**优势**：

- 无需源码，直接分析编译后的二进制
- 同时支持ObjC和Swift
- 支持分析静态库和动态库
- 提供GUI界面，操作简便

**注意事项**：

由于ObjC的动态特性，以下情况需要人工确认：

- 通过`NSClassFromString`动态创建的类
- 在Storyboard/XIB中使用的类
- 通过反射机制访问的类

---

## ObjC元数据优化

每个ObjC类在编译后会生成大量元数据，理解这些元数据有助于优化：

### 类的内存布局

```c
// 简化的ObjC类结构
struct objc_class {
    Class isa;                    // 8字节
    Class superclass;             // 8字节
    cache_t cache;                // 16字节
    class_data_bits_t bits;       // 8字节 → 指向class_rw_t
};

struct class_rw_t {
    uint32_t flags;
    method_array_t methods;       // 方法列表
    property_array_t properties;  // 属性列表
    protocol_array_t protocols;   // 协议列表
    // ...
};

struct method_t {
    SEL name;                     // 8字节
    const char *types;            // 8字节
    IMP imp;                      // 8字节
};  // 每个方法24字节
```

### 元数据体积估算

```
每个ObjC类的基础开销：
- class结构体：~40字节
- metaclass结构体：~40字节
- class_ro_t：~72字节
- 类名字符串：N字节

每个方法的开销：
- method_t结构体：24字节
- 方法名字符串：N字节
- 类型编码字符串：~20字节

每个属性的开销：
- property_t结构体：16字节
- 属性名字符串：N字节
- 属性特性字符串：~30字节
```

### 优化建议

```objc
// 避免：大量小类
@interface HelperA : NSObject
- (void)doA;
@end

@interface HelperB : NSObject
- (void)doB;
@end

// 推荐：合并为一个类或使用函数
@interface Helper : NSObject
- (void)doA;
- (void)doB;
@end

// 或者使用C函数（无元数据开销）
void doA(void);
void doB(void);
```

---

## Swift优化

### WMO（Whole Module Optimization）原理

Swift默认按文件编译，WMO改为按模块编译，允许跨文件优化：

```
# Build Settings
Compilation Mode = Whole Module
```

**WMO的优化能力**：

```swift
// File1.swift
internal func helper() -> Int {
    return 42
}

// File2.swift
func useHelper() -> Int {
    return helper()  // 跨文件调用
}

// 无WMO：helper()是普通函数调用
// 有WMO：helper()可能被内联，消除函数调用开销
```

**WMO对包体积的影响**：

- 更好的死代码消除（可以看到整个模块的引用关系）
- 更好的泛型特化（减少泛型代码膨胀）
- internal/fileprivate函数可以被内联

### 泛型特化（Generic Specialization）

Swift泛型默认使用"类型擦除"实现，但编译器会对常用类型生成特化版本：

```swift
// 泛型函数
func swap<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

// 使用
swap(&intA, &intB)      // 可能生成Int特化版本
swap(&stringA, &stringB) // 可能生成String特化版本
swap(&customA, &customB) // 使用通用版本
```

**代码膨胀问题**：

```swift
// 复杂泛型函数
func process<T: Codable>(_ items: [T]) {
    // 100行代码
}

// 如果被10种类型调用，可能生成10份代码
// 100行 × 10 = 1000行等效代码
```

**优化方案**：

```swift
// 方案1：使用类型擦除
func process(_ items: [any Codable]) {
    // 只生成一份代码
}

// 方案2：提取非泛型部分
func process<T: Codable>(_ items: [T]) {
    let data = items.map { encodeItem($0) }  // 泛型部分
    processData(data)  // 非泛型部分，不会膨胀
}

private func processData(_ data: [Data]) {
    // 大量代码放在这里
}
```

### @inlinable的影响

`@inlinable`将函数体暴露给其他模块，允许跨模块内联：

```swift
// ModuleA
@inlinable
public func calculate(_ x: Int) -> Int {
    return x * 2 + 1  // 函数体被包含在模块接口中
}

// ModuleB
let result = calculate(5)  // 可能被内联为: let result = 5 * 2 + 1
```

**对包体积的影响**：

- 函数体被复制到每个调用模块
- 如果函数很大，会显著增加包体积
- 适合小型、频繁调用的函数

---

## 动态库vs静态库

### 链接方式对比

```
静态链接：
┌─────────┐   ┌─────────┐
│ libA.a  │   │ libB.a  │
└────┬────┘   └────┬────┘
     │             │
     └──────┬──────┘
            ↓
     ┌──────────────┐
     │  可执行文件    │  ← 库代码被复制进来
     └──────────────┘

动态链接：
┌──────────────┐
│  可执行文件    │ ← 只包含引用
└──────┬───────┘
       │ 运行时加载
       ↓
┌───────────┐   ┌───────────┐
│ libA.dylib│   │ libB.dylib│
└───────────┘   └───────────┘
```

### 动态库的额外开销

每个动态库都有独立的开销：

```
动态库额外开销：
- Mach-O Header：~4KB
- Load Commands：~1-2KB
- __LINKEDIT（符号表等）：取决于导出符号数量
- 代码签名：~16KB起
- 启动时加载开销
```

### 优化策略

```
# 合并动态库
# 将多个小动态库合并为一个

# 静态化
# 将动态库改为静态库，代码会被合并到主二进制
# 好处：Dead Code Stripping可以移除未使用的代码
# 坏处：如果多个target使用同一个库，代码会被复制
```

---

## Swift Runtime和标准库

### ABI稳定性的影响

Swift 5.0引入了ABI稳定性，这对包体积有重要影响：

```
iOS 12.2之前（Swift ABI不稳定）：
┌──────────────────────────────────┐
│            App Bundle            │
│  ├── YourApp（主二进制）           │
│  └── Frameworks/                 │
│      ├── libswiftCore.dylib      │  ← 每个App都要打包
│      ├── libswiftFoundation.dylib│
│      ├── libswiftUIKit.dylib     │
│      └── ...（约10-15MB）         │
└──────────────────────────────────┘

iOS 12.2及之后（Swift ABI稳定）：
┌──────────────────────────────────┐
│            App Bundle            │
│  └── YourApp（主二进制）           │  ← 不再需要打包Swift运行时
└──────────────────────────────────┘
        ↓ 运行时链接
┌──────────────────────────────────┐
│         系统Swift运行时            │  ← 系统提供
└──────────────────────────────────┘
```

**优化建议**：

- 最低部署目标设为iOS 12.2+可以节省10-15MB
- 如果必须支持更低版本，Swift运行时会被打包进App

### Always Embed Swift Standard Libraries

```
# Build Settings
Always Embed Swift Standard Libraries = NO  # iOS 12.2+可以关闭
```

当设为YES时，即使系统有Swift运行时，也会打包一份到App中。通常只有App Extension或Framework需要开启。

---

## 段迁移优化（__TEXT段瘦身）

### 背景：DRM加密机制

iOS 13之前，App Store会对应用的`__TEXT`段进行FairPlay DRM加密：

```
App Store分发流程（iOS 13之前）：
开发者IPA → App Store加密__TEXT段 → 用户下载

加密的影响：
┌─────────────────────────────────────┐
│           Mach-O文件                 │
├─────────────────────────────────────┤
│  __TEXT（被加密）                     │ ← 加密后数据随机化
│    ├── __text（机器码）               │    无法有效压缩
│    ├── __cstring（字符串常量）        │    
│    ├── __objc_methname（方法名）      │    
│    └── __stubs（符号桩）              │    
├─────────────────────────────────────┤
│  __DATA（不加密）                     │ ← 可正常压缩
├─────────────────────────────────────┤
│  __LINKEDIT（不加密）                 │ ← 可正常压缩
└─────────────────────────────────────┘
```

| 版本 | 加密策略 | 影响 |
|-----|---------|-----|
| iOS 13之前 | `__TEXT`段被FairPlay DRM加密 | 加密后体积增大，压缩率降低 |
| iOS 13及之后 | 取消`__TEXT`段加密 | 体积更小，加载更快 |

### 优化原理

对于需要支持iOS 13以下版本的应用，可以通过**段迁移**来减少加密范围，提升压缩效率。

**核心思路**：将`__TEXT`段中的只读数据（字符串、常量等）迁移到自定义Segment，由于Apple只加密`__TEXT`段，迁移后的数据不会被加密，可以正常压缩。

```
优化前：
┌─────────────────────────────────────┐
│  __TEXT（全部被加密，约50MB）          │
│    ├── __text（机器码，30MB）         │ ← 必须保留在__TEXT
│    ├── __cstring（字符串，10MB）      │ ← 可迁移
│    ├── __objc_methname（5MB）        │ ← 可迁移
│    └── __const（常量，5MB）           │ ← 可迁移
└─────────────────────────────────────┘

优化后：
┌─────────────────────────────────────┐
│  __TEXT（被加密，30MB）               │
│    └── __text（机器码，30MB）         │ ← 只有代码被加密
├─────────────────────────────────────┤
│  __RODATA（自定义段，不加密，20MB）     │ ← 可正常压缩
│    ├── __cstring（字符串，10MB）      │
│    ├── __objc_methname（5MB）        │
│    └── __const（常量，5MB）           │
└─────────────────────────────────────┘
```

### 实现方式

通过链接器参数`-rename_section`将Section迁移到自定义Segment。有两种方案：

**方案一：仅迁移只读数据**

将字符串、常量等只读数据迁移到自定义的`__RODATA`段：

```bash
# Other Linker Flags
-Wl,-rename_section,__TEXT,__cstring,__RODATA,__cstring
-Wl,-rename_section,__TEXT,__const,__RODATA,__const
-Wl,-rename_section,__TEXT,__gcc_except_tab,__RODATA,__gcc_except_tab
-Wl,-rename_section,__TEXT,__objc_methname,__RODATA,__objc_methname
-Wl,-rename_section,__TEXT,__objc_classname,__RODATA,__objc_classname
-Wl,-rename_section,__TEXT,__objc_methtype,__RODATA,__objc_methtype
```

**方案二：同时迁移可执行代码（更激进）**

除了只读数据，还可以将`__text`和`__stubs`等可执行代码迁移到自定义的可执行段：

```bash
# Other Linker Flags
# 1. 只读数据迁移到 __RODATA
-Wl,-rename_section,__TEXT,__cstring,__RODATA,__cstring
-Wl,-rename_section,__TEXT,__const,__RODATA,__const
-Wl,-rename_section,__TEXT,__gcc_except_tab,__RODATA,__gcc_except_tab
-Wl,-rename_section,__TEXT,__objc_methname,__RODATA,__objc_methname
-Wl,-rename_section,__TEXT,__objc_classname,__RODATA,__objc_classname
-Wl,-rename_section,__TEXT,__objc_methtype,__RODATA,__objc_methtype

# 2. 可执行代码迁移到自定义的可执行段 __BD_TEXT
-Wl,-rename_section,__TEXT,__text,__BD_TEXT,__text
-Wl,-rename_section,__TEXT,__stubs,__BD_TEXT,__stubs
-Wl,-rename_section,__TEXT,__stub_helper,__BD_TEXT,__stub_helper

# 3. 设置自定义段的权限为可读可执行（rx）
-Wl,-segprot,__BD_TEXT,rx,rx
```

**方案二的关键点**：

- `__text`、`__stubs`等代码段需要可执行权限
- 使用`-segprot`参数设置自定义段的权限为`rx`（可读可执行）
- 迁移后`__TEXT`段几乎为空，大幅减少加密范围

### 可迁移的Section

| Section | 内容 | 迁移目标 | 说明 |
|---------|-----|---------|-----|
| `__text` | 机器码 | `__BD_TEXT`（需设置rx权限） | 可迁移，需要可执行权限 |
| `__stubs` | 符号桩 | `__BD_TEXT`（需设置rx权限） | 可迁移，需要可执行权限 |
| `__stub_helper` | 桩辅助代码 | `__BD_TEXT`（需设置rx权限） | 可迁移，需要可执行权限 |
| `__cstring` | C字符串常量 | `__RODATA` | 可迁移 |
| `__const` | 常量数据 | `__RODATA` | 可迁移 |
| `__objc_methname` | ObjC方法名 | `__RODATA` | 可迁移 |
| `__objc_classname` | ObjC类名 | `__RODATA` | 可迁移 |
| `__objc_methtype` | ObjC方法类型 | `__RODATA` | 可迁移 |
| `__ustring` | Unicode字符串 | `__RODATA` | 可迁移 |
| `__gcc_except_tab` | 异常处理表 | `__RODATA` | 可迁移 |
| `__unwind_info` | 栈展开信息 | - | 需要测试，可能影响异常处理 |

### 注意事项

1. Mach-O 的标准命名约定是 Segment 以双下划线 `__` + 大写字母命名（如 `__TEXT`、`__DATA`），自定义 Segment 同样应遵循此约定（如 `__RODATA`、`__BD_TEXT`），这不是"系统保留不可使用"，而是 Mach-O 格式的统一规范
2. 迁移后需要充分测试，确保不影响运行时行为
3. iOS 13+此优化意义不大，因为Apple已取消加密
4. 某些Section迁移可能导致问题，需要逐个验证
5. 第三方库的Section也会被迁移，需要确保兼容性

### 优化效果

根据实际案例，段迁移可以减少10-20%的下载大小（具体取决于`__TEXT`段中可迁移内容的占比）。

对于iOS 13+的应用，Apple已取消`__TEXT`段加密，无需进行此优化。
