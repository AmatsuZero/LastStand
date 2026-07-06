+++
title = "iOS反射"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 18
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
反射（Reflection）是指程序在运行时检查、访问和修改自身结构（类型、属性、方法等）的能力。在 iOS 开发中，Objective-C 和 Swift 分别提供了不同层次的反射支持：OC 依赖 Runtime 提供完整的动态反射能力，Swift 则通过 Mirror 提供只读的内省能力。

## Objective-C 的反射能力

Objective-C 的反射能力完全建立在 Runtime 之上。Runtime 在运行时维护了完整的类型元数据（类对象、元类对象、方法列表、属性列表、成员变量列表、协议列表等），并通过一系列 C 函数 API 暴露给开发者，使得程序可以在运行时动态地查询和修改几乎所有类型信息。

关于 Runtime 的消息发送、消息转发、Method Swizzling、关联对象等核心能力，请参考 [runtime](./runtime.md)。本节聚焦于 Runtime 中与"反射"直接相关的能力——即运行时的类型内省和动态操作。

### 类型内省

类型内省（Introspection）是反射中最基础的能力——在运行时查询一个对象的类型信息。

#### NSObject 提供的内省方法

`NSObject` 定义了一组内省方法，这些方法底层都依赖 Runtime 的 isa 指针和类型元数据来实现：

```objc
id obj = [[NSMutableArray alloc] init];

// 类型判断
[obj isKindOfClass:[NSArray class]];           // YES — 判断是否是某个类或其子类的实例
[obj isMemberOfClass:[NSMutableArray class]];  // YES — 判断是否是某个类的直接实例
[obj conformsToProtocol:@protocol(NSCoding)];  // YES — 判断是否遵循某个协议

// 方法响应检查
[obj respondsToSelector:@selector(addObject:)]; // YES — 判断是否能响应某个消息

// 获取类型信息
NSStringFromClass([obj class]);          // @"__NSArrayM"（真实的私有子类名）
NSStringFromSelector(@selector(count));  // @"count"
```

需要注意 `isKindOfClass:` 和 `isMemberOfClass:` 的区别：前者沿继承链向上查找，后者只比较当前类。另外，`[obj class]` 返回的可能是私有子类（如类簇 `NSArray` 的实际类是 `__NSArrayI` 或 `__NSArrayM`），而 `object_getClass(obj)` 能获取真正的 isa 指向的类（KVO 场景下会是 `NSKVONotifying_` 前缀的子类）。

#### Runtime API 的类型查询

除了 `NSObject` 的方法，Runtime 提供了更底层的 C 函数 API 来获取详细的类型元数据：

```objc
#import <objc/runtime.h>

Class cls = [MyClass class];

// 获取类名和继承关系
const char *name = class_getName(cls);           // "MyClass"
Class superCls = class_getSuperclass(cls);       // 父类
BOOL isMeta = class_isMetaClass(cls);            // 是否是元类
size_t size = class_getInstanceSize(cls);        // 实例大小（字节）

// 获取属性列表
unsigned int propCount;
objc_property_t *props = class_copyPropertyList(cls, &propCount);
for (unsigned int i = 0; i < propCount; i++) {
    const char *propName = property_getName(props[i]);
    const char *propAttrs = property_getAttributes(props[i]);
    NSLog(@"属性: %s, 特性: %s", propName, propAttrs);
}
free(props);

// 获取成员变量列表
unsigned int ivarCount;
Ivar *ivars = class_copyIvarList(cls, &ivarCount);
for (unsigned int i = 0; i < ivarCount; i++) {
    const char *ivarName = ivar_getName(ivars[i]);
    const char *ivarType = ivar_getTypeEncoding(ivars[i]);
    ptrdiff_t offset = ivar_getOffset(ivars[i]);
    NSLog(@"成员变量: %s, 类型编码: %s, 偏移量: %td", ivarName, ivarType, offset);
}
free(ivars);

// 获取方法列表
unsigned int methodCount;
Method *methods = class_copyMethodList(cls, &methodCount);
for (unsigned int i = 0; i < methodCount; i++) {
    SEL sel = method_getName(methods[i]);
    const char *typeEncoding = method_getTypeEncoding(methods[i]);
    NSLog(@"方法: %@, 类型编码: %s", NSStringFromSelector(sel), typeEncoding);
}
free(methods);

// 获取协议列表
unsigned int protocolCount;
Protocol * __unsafe_unretained *protocols = class_copyProtocolList(cls, &protocolCount);
for (unsigned int i = 0; i < protocolCount; i++) {
    NSLog(@"协议: %s", protocol_getName(protocols[i]));
}
free(protocols);
```

这些 API 返回的都是 `copy` 语义的数组（内部使用 `malloc` 分配），调用方必须手动 `free`。

#### 类型编码

Runtime 使用类型编码（Type Encoding）字符串来描述类型信息。编译器会为每个方法的返回值和参数生成对应的类型编码，存储在方法元数据中。常见的编码：

| 编码 | 类型 | 编码 | 类型 |
|------|------|------|------|
| `c` | char | `i` | int |
| `s` | short | `l` | long |
| `q` | long long | `f` | float |
| `d` | double | `B` | BOOL（C++ bool） |
| `v` | void | `@` | id（ObjC 对象） |
| `#` | Class | `:` | SEL |
| `^type` | type 指针 | `{name=...}` | struct |

例如 `"v@:"` 表示：返回 void、参数为 id（self）和 SEL（_cmd），这是最常见的无参方法的类型编码。

`"@24@0:8@16"` 表示：返回 id、总大小 24 字节、第一个参数 id（self）在偏移 0、第二个参数 SEL（_cmd）在偏移 8、第三个参数 id 在偏移 16。

属性的特性编码（`property_getAttributes`）采用不同的格式。例如 `"T@\"NSString\",C,N,V_name"` 表示：类型是 `NSString *`、`copy` 语义、`nonatomic`、对应的实例变量名是 `_name`。

| 属性编码 | 含义 |
|---------|------|
| `T` | 类型 |
| `R` | readonly |
| `C` | copy |
| `&` | retain/strong |
| `N` | nonatomic |
| `W` | weak |
| `V` | 实例变量名 |

### 动态操作

OC Runtime 的反射能力不仅限于"查看"，还支持在运行时动态修改类型结构。

#### 动态创建类

```objc
// 创建 NSObject 的子类 "DynamicPerson"
Class PersonClass = objc_allocateClassPair([NSObject class], "DynamicPerson", 0);

// 添加成员变量（必须在 objc_registerClassPair 之前）
class_addIvar(PersonClass, "_name", sizeof(NSString *), log2(sizeof(NSString *)), @encode(NSString *));
class_addIvar(PersonClass, "_age", sizeof(int), log2(sizeof(int)), @encode(int));

// 添加方法
class_addMethod(PersonClass, @selector(description), (IMP)personDescription, "@@:");

// 注册类（注册后不能再添加成员变量）
objc_registerClassPair(PersonClass);

// 使用
id person = [[PersonClass alloc] init];
[person setValue:@"Tom" forKey:@"name"];
NSLog(@"%@", person);  // 调用 personDescription

NSString *personDescription(id self, SEL _cmd) {
    Ivar nameIvar = class_getInstanceVariable([self class], "_name");
    NSString *name = object_getIvar(self, nameIvar);
    return [NSString stringWithFormat:@"DynamicPerson: %@", name];
}
```

注册后不能再添加成员变量，这是因为 `objc_registerClassPair` 会将 `instanceSize`、`ivars` 列表等信息固化到 `class_ro_t` 中。但方法、属性、协议可以在注册后随时添加，因为它们存储在可写的 `class_rw_t` 中。

#### 动态方法操作

```objc
// 添加方法
class_addMethod([MyClass class], @selector(newMethod), (IMP)newMethodIMP, "v@:");

// 替换方法实现
class_replaceMethod([MyClass class], @selector(existingMethod), (IMP)newIMP, "v@:");

// 交换两个方法的实现
Method m1 = class_getInstanceMethod([MyClass class], @selector(method1));
Method m2 = class_getInstanceMethod([MyClass class], @selector(method2));
method_exchangeImplementations(m1, m2);

// 获取和设置方法实现
IMP oldIMP = method_getImplementation(m1);
method_setImplementation(m1, (IMP)customIMP);
```

#### 通过字符串动态访问

OC 的反射支持从字符串到运行时对象的动态转换：

```objc
// 字符串 → 类
Class cls = NSClassFromString(@"UIViewController");
id vc = [[cls alloc] init];

// 字符串 → SEL
SEL sel = NSSelectorFromString(@"viewDidLoad");
if ([vc respondsToSelector:sel]) {
    [vc performSelector:sel];
}

// 反向转换
NSString *className = NSStringFromClass([vc class]);   // @"UIViewController"
NSString *selName = NSStringFromSelector(sel);         // @"viewDidLoad"
```

这在路由系统、解耦模块间通信等场景中广泛使用。例如组件化架构中，A 模块不需要直接 `#import` B 模块的头文件，通过 `NSClassFromString` 和 `NSSelectorFromString` 就能动态创建对象和调用方法。

### Objective-C 反射的局限性

虽然 OC Runtime 的反射能力非常强大，但也有明确的局限：

1. **无法获取局部变量**：Runtime 只能访问类的元数据（成员变量、方法等），函数内部的局部变量在栈上分配，不在 Runtime 的管辖范围
2. **类型编码信息有限**：泛型参数会被擦除（如 `NSArray<NSString *>` 的类型编码只有 `@"NSArray"`），无法在运行时获取集合的元素类型
3. **安全性风险**：Runtime 允许访问私有成员变量、修改方法实现，这虽然提供了极大的灵活性，但也带来了安全和稳定性风险。App Store 审核会拒绝使用私有 API 的应用
4. **Swift 类型不完全兼容**：纯 Swift 的 struct、enum 没有 OC Runtime 元数据，只有继承自 `NSObject` 的 Swift 类才能使用 OC 的反射 API

## Swift 的反射能力

Swift 的反射设计哲学与 OC 截然不同：OC 追求最大的运行时灵活性（完整的动态反射），Swift 则以编译时安全和性能为优先，只提供有限的运行时内省能力。

### Mirror：Swift 的内省机制

`Mirror` 是 Swift 标准库提供的反射 API，它能在运行时检查任意值的结构，但仅支持**只读内省**——可以查看但不能修改。

#### 基本用法

```swift
struct Person {
    let name: String
    var age: Int
    private var secret: String = "hidden"
}

let person = Person(name: "Tom", age: 25)
let mirror = Mirror(reflecting: person)

// 获取类型信息
print(mirror.subjectType)        // Person
print(mirror.displayStyle)       // Optional(.struct)

// 遍历所有存储属性（包括 private）
for child in mirror.children {
    print("\(child.label ?? "nil"): \(child.value)")
}
// 输出：
// name: Tom
// age: 25
// secret: hidden
```

`Mirror` 有几个关键特点：

1. **可以访问 private 属性**：Mirror 绕过了 Swift 的访问控制，能看到所有存储属性
2. **只反映存储属性**：计算属性不会出现在 `children` 中
3. **值是 `Any` 类型**：`child.value` 的类型是 `Any`，需要类型转换后才能使用

#### Mirror.Child 结构

`Mirror` 的 `children` 属性返回 `AnyCollection<Mirror.Child>`，每个 `Child` 是一个 `(label: String?, value: Any)` 的命名元组：

```swift
for child in mirror.children {
    let label = child.label   // 属性名（可选，元组元素可能没有名字）
    let value = child.value   // 属性值（Any 类型）
    let valueMirror = Mirror(reflecting: value)
    print("属性: \(label ?? "?"), 值: \(value), 类型: \(valueMirror.subjectType)")
}
```

#### displayStyle

`displayStyle` 表示被反射值的展示风格，帮助判断值的类型分类：

| displayStyle | 对应类型 |
|-------------|---------|
| `.struct` | 结构体 |
| `.class` | 类 |
| `.enum` | 枚举 |
| `.tuple` | 元组 |
| `.optional` | Optional |
| `.collection` | Array |
| `.dictionary` | Dictionary |
| `.set` | Set |
| `nil` | 基础类型（Int、String 等） |

#### 继承链反射

对于类继承体系，`Mirror` 的 `superclassMirror` 可以获取父类的 Mirror，从而遍历整个继承链的属性：

```swift
class Animal {
    var species: String = "Unknown"
}

class Dog: Animal {
    var name: String = "Buddy"
    var breed: String = "Labrador"
}

let dog = Dog()
var currentMirror: Mirror? = Mirror(reflecting: dog)

while let mirror = currentMirror {
    print("--- \(mirror.subjectType) ---")
    for child in mirror.children {
        print("  \(child.label ?? "?"): \(child.value)")
    }
    currentMirror = mirror.superclassMirror
}
// 输出：
// --- Dog ---
//   name: Buddy
//   breed: Labrador
// --- Animal ---
//   species: Unknown
```

注意：`Mirror(reflecting: dog)` 的 `children` **只包含 Dog 自身定义的属性**，不包含从 Animal 继承的属性。要获取继承的属性，需要通过 `superclassMirror` 逐层向上遍历。

#### 枚举的反射

Mirror 对枚举有特殊的处理方式：

```swift
enum NetworkError {
    case timeout
    case serverError(code: Int, message: String)
    case noConnection
}

let error = NetworkError.serverError(code: 500, message: "Internal Server Error")
let mirror = Mirror(reflecting: error)

print(mirror.displayStyle)       // Optional(.enum)

for child in mirror.children {
    print("case: \(child.label ?? "?"), 关联值: \(child.value)")
}
// 输出：
// case: serverError, 关联值: (code: 500, message: "Internal Server Error")
```

对于有关联值的枚举 case，`label` 是 case 名称，`value` 是关联值（如果有多个关联值则是元组）。对于无关联值的 case（如 `.timeout`），`children` 为空，此时可以通过 `String(describing:)` 获取 case 名称。

### Mirror 的底层原理

Mirror 并不是简单的"语法糖"，它的底层依赖 Swift 编译器在 Mach-O 中生成的元数据。

#### 元数据来源

Swift 编译器会在 Mach-O 的特定 Section 中生成反射所需的元数据：

| Section | 内容 | 用途 |
|---------|------|------|
| `__swift5_fieldmd` | 字段描述符（Field Descriptor） | 每个类型的存储属性名称和类型引用 |
| `__swift5_reflstr` | 反射字符串 | 属性名称的字符串常量 |
| `__swift5_types` | 类型描述符（Type Descriptor） | 类型的名称、泛型参数、字段数量等 |
| `__swift5_typeref` | 类型引用 | 属性类型的 Mangled Name 引用 |

当创建 `Mirror(reflecting:)` 时，Swift Runtime 通过值的类型元数据指针（Type Metadata）找到对应的 Type Descriptor，再从中找到 Field Descriptor，逐一读取字段名称和值。

#### Mirror 的创建流程

```
Mirror(reflecting: value)
        │
        ▼
获取 value 的类型元数据（Type Metadata）
        │
        ▼
查找 Type Descriptor → Field Descriptor
        │
        ▼
遍历 Field Descriptor 中的字段记录
        │
        ├── 读取字段名称（从 __swift5_reflstr）
        ├── 计算字段偏移量（从元数据中的 Field Offset Vector）
        └── 读取字段值（从 value 内存 + 偏移量）
        │
        ▼
构建 Mirror.Child 数组
```

字段偏移量存储在类型元数据结构中的 **Field Offset Vector** 区域。对于 struct，偏移量在编译期确定，存储在元数据的固定位置；对于 class，由于可能涉及继承和运行时调整，偏移量在类初始化时计算并存储。

#### CustomReflectable 协议

Swift 允许类型通过遵循 `CustomReflectable` 协议来自定义反射行为：

```swift
struct Credentials: CustomReflectable {
    let username: String
    let password: String
    
    var customMirror: Mirror {
        Mirror(self, children: [
            "username": username,
            "password": String(repeating: "*", count: password.count)
        ])
    }
}

let creds = Credentials(username: "admin", password: "secret123")
let mirror = Mirror(reflecting: creds)
for child in mirror.children {
    print("\(child.label ?? "?"): \(child.value)")
}
// 输出：
// username: admin
// password: *********
```

这在调试输出、日志记录等场景中很有用——可以隐藏敏感信息，或者将复杂的内部结构转换为更易读的形式。

当 `Mirror(reflecting:)` 检测到值遵循了 `CustomReflectable` 协议时，会调用 `customMirror` 属性获取自定义的 Mirror，而不是使用默认的元数据反射。

### Swift 反射的局限性

Mirror 提供的是有限的内省能力，与 OC Runtime 的完整反射相比有明显限制：

| 能力 | OC Runtime | Swift Mirror |
|------|-----------|-------------|
| 读取属性值 | 支持 | 支持 |
| 修改属性值 | 支持（`object_setIvar`） | 不支持 |
| 获取方法列表 | 支持（`class_copyMethodList`） | 不支持 |
| 调用任意方法 | 支持（`objc_msgSend`） | 不支持 |
| 动态添加方法 | 支持（`class_addMethod`） | 不支持 |
| 动态创建类型 | 支持（`objc_allocateClassPair`） | 不支持 |
| 获取协议列表 | 支持（`class_copyProtocolList`） | 不支持 |
| 访问私有属性 | 支持 | 支持（只读） |

Swift 故意限制了反射能力，这是设计上的取舍：

1. **编译时安全**：Swift 强调类型安全，大量的类型检查在编译期完成，不鼓励运行时动态操作
2. **性能优化**：Swift 编译器依赖静态类型信息进行优化（如内联、泛型特化），如果支持完整反射，很多优化将无法进行
3. **二进制大小**：完整的反射元数据会显著增加二进制大小。实际上，`-Osize` 优化级别下编译器会裁剪部分反射元数据

## 实际应用场景

### 1. 通用调试输出

利用 Mirror 实现一个通用的对象描述函数，自动打印所有属性：

```swift
func dump<T>(_ value: T, indent: Int = 0) -> String {
    let mirror = Mirror(reflecting: value)
    let prefix = String(repeating: "  ", count: indent)
    
    if mirror.children.isEmpty {
        return "\(value)"
    }
    
    var lines = ["\(mirror.subjectType) {"]
    for child in mirror.children {
        let childDesc = dump(child.value, indent: indent + 1)
        lines.append("\(prefix)  \(child.label ?? "?"): \(childDesc)")
    }
    lines.append("\(prefix)}")
    return lines.joined(separator: "\n")
}
```

Swift 标准库已经提供了全局的 `dump()` 函数，内部就是基于 Mirror 实现的，它会递归打印对象的所有属性结构，日常调试时可以直接使用。

### 2. JSON 序列化

Mirror 可以用于实现简单的 JSON 序列化（虽然实际项目中应使用 `Codable`）：

```swift
func toJSON<T>(_ value: T) -> Any {
    let mirror = Mirror(reflecting: value)
    
    if mirror.children.isEmpty {
        return value
    }
    
    if mirror.displayStyle == .collection {
        return mirror.children.map { toJSON($0.value) }
    }
    
    if mirror.displayStyle == .dictionary {
        var dict: [String: Any] = [:]
        for child in mirror.children {
            if let pair = child.value as? (key: AnyHashable, value: Any) {
                dict["\(pair.key)"] = toJSON(pair.value)
            }
        }
        return dict
    }
    
    var dict: [String: Any] = [:]
    for child in mirror.children {
        guard let label = child.label else { continue }
        let childMirror = Mirror(reflecting: child.value)
        if childMirror.displayStyle == .optional {
            if let firstChild = childMirror.children.first {
                dict[label] = toJSON(firstChild.value)
            }
        } else {
            dict[label] = toJSON(child.value)
        }
    }
    return dict
}
```

### 3. OC 字典转模型

这是 OC Runtime 反射最经典的应用场景，利用 `class_copyIvarList` 或 `class_copyPropertyList` 自动完成字典到模型的映射：

```objc
+ (instancetype)modelWithDict:(NSDictionary *)dict {
    id obj = [[self alloc] init];
    
    unsigned int count;
    objc_property_t *props = class_copyPropertyList(self, &count);
    
    for (unsigned int i = 0; i < count; i++) {
        NSString *propName = [NSString stringWithUTF8String:property_getName(props[i])];
        id value = dict[propName];
        if (value && value != [NSNull null]) {
            [obj setValue:value forKey:propName];
        }
    }
    
    free(props);
    return obj;
}
```

这是 MJExtension、YYModel 等 JSON 转模型框架的核心思路。完整的实现还需要处理类型转换、嵌套模型、数组泛型、属性名与 JSON key 的映射等问题，但底层都依赖 Runtime 的反射能力。

### 4. 路由系统

在组件化架构中，模块间通过路由进行解耦通信，核心依赖 OC 的字符串-类型转换能力：

```objc
- (UIViewController *)viewControllerForURL:(NSURL *)url {
    NSString *path = url.path;  // 例如 "/user/profile"
    
    // 路由表：URL path → 类名
    NSDictionary *routeMap = @{
        @"/user/profile": @"UserProfileViewController",
        @"/order/detail": @"OrderDetailViewController",
    };
    
    NSString *className = routeMap[path];
    if (!className) return nil;
    
    Class cls = NSClassFromString(className);
    if (!cls) return nil;
    
    UIViewController *vc = [[cls alloc] init];
    
    // 通过 URL 参数自动设置属性
    NSDictionary *params = [self parseQueryParams:url];
    for (NSString *key in params) {
        // 构造 setter 名称：key "userId" → "setUserId:"
        NSString *setterName = [NSString stringWithFormat:@"set%@%@:",
            [[key substringToIndex:1] uppercaseString],
            [key substringFromIndex:1]];
        if ([vc respondsToSelector:NSSelectorFromString(setterName)]) {
            [vc setValue:params[key] forKey:key];
        }
    }
    
    return vc;
}
```

这里涉及了 OC 反射的多个能力：`NSClassFromString`（字符串动态创建类）、`NSSelectorFromString`（字符串动态构造 SEL）、`respondsToSelector:`（运行时内省检查）、KVC 的 `setValue:forKey:`（通过字符串 key 动态赋值）。

### 5. 自动化测试辅助

利用 Mirror 验证模型对象的属性是否符合预期，无需为每个属性手写断言：

```swift
func assertEqual<T>(_ actual: T, _ expected: T, file: StaticString = #file, line: UInt = #line) {
    let actualMirror = Mirror(reflecting: actual)
    let expectedMirror = Mirror(reflecting: expected)
    
    for (actualChild, expectedChild) in zip(actualMirror.children, expectedMirror.children) {
        let actualStr = String(describing: actualChild.value)
        let expectedStr = String(describing: expectedChild.value)
        if actualStr != expectedStr {
            print("属性 \(actualChild.label ?? "?") 不匹配: 实际=\(actualStr), 期望=\(expectedStr)")
        }
    }
}
```

## OC 与 Swift 反射的对比

| 维度 | Objective-C Runtime | Swift Mirror |
|------|-------------------|-------------|
| 设计理念 | 最大灵活性，运行时决定一切 | 编译时安全优先，运行时内省为辅 |
| 反射深度 | 完整反射（读/写/增/删/改） | 只读内省（只能查看） |
| 支持类型 | ObjC 类（继承自 NSObject） | 所有 Swift 类型（struct/class/enum/tuple） |
| 方法反射 | 支持（方法列表、动态调用） | 不支持 |
| 属性修改 | 支持（`object_setIvar`、KVC） | 不支持 |
| 性能 | 有运行时开销（哈希查找、间接跳转） | 有运行时开销（元数据查找、`Any` 装箱） |
| 安全性 | 低（可访问私有 API、修改内部实现） | 高（只读，不影响运行时行为） |
| 元数据存储 | `class_rw_t` / `class_ro_t` | Mach-O 的 `__swift5_fieldmd` 等 Section |

对于继承自 `NSObject` 的 Swift 类，两套反射系统可以共存：

```swift
class MyObject: NSObject {
    @objc var name: String = "Tom"
    var age: Int = 25    // 非 @objc 属性
}

let obj = MyObject()

// Swift Mirror：能看到所有存储属性
let mirror = Mirror(reflecting: obj)
for child in mirror.children {
    print("\(child.label ?? "?"): \(child.value)")
}
// name: Tom
// age: 25

// OC Runtime：只能看到 @objc 属性
var count: UInt32 = 0
let properties = class_copyPropertyList(type(of: obj), &count)
for i in 0..<Int(count) {
    let name = String(cString: property_getName(properties![i]))
    print("OC property: \(name)")
}
free(properties)
// OC property: name（age 不会出现，因为没有 @objc 标记）
```

## 常见面试题

### Q1: iOS 中有哪些反射机制？OC 和 Swift 的反射有什么区别？

iOS 中有两套反射机制：

**Objective-C Runtime 反射**：提供完整的动态反射能力。通过 Runtime API 可以在运行时获取类的属性列表、方法列表、成员变量列表、协议列表等元数据，还可以动态创建类、添加方法、修改方法实现（Method Swizzling）、通过字符串创建对象（`NSClassFromString`）等。元数据存储在类对象的 `class_rw_t` / `class_ro_t` 结构中。只支持 ObjC 类（继承自 NSObject 的对象）。

**Swift Mirror 反射**：提供有限的只读内省能力。通过 `Mirror(reflecting:)` 可以在运行时获取任意 Swift 值的类型名称、存储属性名和值、displayStyle（struct/class/enum/optional 等），还可以通过 `superclassMirror` 遍历类的继承链。底层依赖编译器在 Mach-O 中生成的元数据（`__swift5_fieldmd`、`__swift5_reflstr` 等）。支持所有 Swift 类型（struct、class、enum、tuple），但不能修改属性、不能获取方法列表、不能动态调用方法。

核心区别：OC 反射追求最大灵活性（可读可写可改），Swift 反射追求编译时安全（只读内省）。对于继承自 `NSObject` 的 Swift 类，两套系统可以共存，但 OC Runtime 只能看到 `@objc` 标记的属性和方法。

### Q2: Swift 的 Mirror 底层是怎么实现的？

Mirror 的底层依赖 Swift 编译器在 Mach-O 中生成的反射元数据。主要涉及以下几个 Section：

- `__swift5_fieldmd`（Field Descriptor）：存储每个类型的字段描述信息，包括字段数量和每个字段的名称引用、类型引用
- `__swift5_reflstr`（Reflection Strings）：存储字段名称的字符串常量
- `__swift5_types`（Type Descriptor）：存储类型的描述信息，包括类型名称、泛型参数、字段数量、Field Descriptor 的相对偏移
- `__swift5_typeref`（Type References）：存储字段类型的 Mangled Name 引用

创建 `Mirror(reflecting: value)` 时，Swift Runtime 首先通过值的类型元数据指针找到 Type Descriptor，再通过其中的 Field Descriptor 引用定位到字段描述信息。然后逐一读取字段名称（从 `__swift5_reflstr`）和字段偏移量（从元数据中的 Field Offset Vector），最终从值的内存地址加上偏移量处读取字段值，构建出 `Mirror.Child` 数组。

如果值的类型遵循了 `CustomReflectable` 协议，Mirror 会优先调用 `customMirror` 属性获取自定义的反射结果，跳过默认的元数据反射流程。

### Q3: OC 的字典转模型是怎么通过反射实现的？

核心思路是利用 Runtime API 获取模型类的所有属性（或成员变量），然后遍历这些属性，从字典中取出对应 key 的值，通过 KVC 赋值给模型对象。

基本实现步骤：
1. 调用 `class_copyPropertyList`（或 `class_copyIvarList`）获取类的属性列表
2. 遍历属性列表，通过 `property_getName` 获取属性名
3. 以属性名为 key 从字典中取值
4. 通过 `setValue:forKey:`（KVC）将值设置到模型对象上
5. 调用 `free` 释放属性列表的内存

实际的 JSON 转模型框架（如 MJExtension、YYModel）还需要额外处理：类型转换（如字符串转数字）、嵌套模型递归转换、数组中的模型类型识别（通过约定的类方法返回数组元素类型）、属性名与 JSON key 的映射关系、`NSNull` 处理等。YYModel 为了追求性能，还使用了 `objc_msgSend` 直接调用 setter 而非 KVC，并且缓存了属性的类型信息避免重复解析。

### Q4: NSClassFromString 在什么场景下使用？有什么注意事项？

`NSClassFromString` 将字符串转换为 Class 对象，常用于以下场景：

1. **路由系统**：组件化架构中，模块间通过 URL → 类名字符串 → `NSClassFromString` → 创建对象的方式实现解耦
2. **动态加载**：根据配置或服务端下发的类名，动态创建不同的视图控制器或策略对象
3. **避免硬依赖**：当需要使用某个类但不想直接 import 它的头文件时（如可选依赖的 SDK）

注意事项：

- 如果类不存在，返回 `nil`，不会崩溃，因此必须做非空判断
- **Swift 类的命名空间**：Swift 类在 Runtime 中的名称包含模块名前缀（如 `MyApp.MyViewController`），使用 `NSClassFromString` 时必须传入完整的 `"模块名.类名"` 格式，否则返回 nil。如果 Swift 类标记了 `@objc(CustomName)`，则使用括号中的名称
- 不要在性能敏感的路径中频繁调用，因为涉及全局类表的哈希查找
