+++
title = "Objective-C KVC 作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 14
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

Key-Value Coding / Foundation behavior with objc4 runtime support

# Objective-C KVC：从字符串 key 到对象读写

KVC 的核心价值是：把“访问某个属性或实例变量”抽象成 `valueForKey:`、`setValue:forKey:` 这样的字符串协议。 读完这一页，你应该能说清楚它解决什么问题、Foundation 大致怎样查找成员， 以及 objc4 runtime 在消息发送、元数据查询、ivar 直写和内存管理上提供了哪些支撑。

适合第一次系统理解 KVC 标注 objc4 / Foundation 边界 含关键流程和注释代码

## 目录

1.  [KVC 到底有什么用](#why)
2.  [本仓库能看到什么](#boundary)
3.  [读写 key 的查找顺序](#lookup)
4.  [objc4 提供的底层能力](#runtime)
5.  [核心类、方法和关键属性](#classes)
6.  [关键操作流程](#flows)
7.  [常见坑与记忆模型](#pitfalls)

<a id="why"></a>
## 1. KVC 到底有什么用

平时你写 `person.name` 或 `[person name]`，访问目标在编译期就固定了。 KVC 允许你在运行时才决定要访问哪个成员：`[person valueForKey:@"name"]`。 这使得对象、字典、表单、序列化、绑定和调试工具可以用同一套字符串 key 访问模型对象。

### 动态访问

**运行时才知道字段名**时，用字符串 key 读取或写入对象。

### 统一映射

JSON、表单、数据库行、UI 绑定都可以映射到对象属性。

### 批量和路径

`valueForKeyPath:` 能沿着 `department.manager.name` 连续取值。

### KVO 基础

KVO 观察的是 key；KVC 兼容的 setter 和集合访问器是 KVO 常用入口。

```text
@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic) NSInteger age;
@end

Person *p = [Person new];

// 普通写法：编译期已经确定调用 setName:
p.name = @"Ana";

// KVC 写法：运行时根据字符串 key 找 setter 或 ivar。
// Foundation 会先尝试 setName:，必要时再按规则找 _name / _isName / name / isName。
[p setValue:@"Ana" forKey:@"name"];

// KVC 读法：运行时根据 key 找 getter 或 ivar。
// 返回值统一是对象；标量 NSInteger 会被自动装箱成 NSNumber。
NSNumber *age = [p valueForKey:@"age"];
```

<a id="boundary"></a>
## 2. 本仓库能看到什么

objc4 是 Objective-C runtime 仓库，不包含 Foundation 的 `NSObject(NSKeyValueCoding)` 主实现。因此这里看不到 `valueForKey:`、`setValue:forKey:` 的完整源码。 下文对 KVC 查找顺序的说明基于公开 KVC 行为；对 runtime 支撑点的说明则来自本仓库代码。

### 你调用 KVC

`[obj valueForKey:@"name"]` 或 `[obj setValue:v forKey:@"name"]`

→

### Foundation 决策

拼 selector、检查访问器、处理 key path、集合代理、标量装箱、异常兜底。

→

### objc4 执行底层动作

消息发送、查方法/属性/ivar、按 offset 读写、strong/weak/copy/atomic 辅助。

可以把 KVC 理解成 Foundation 写的一层“字符串访问解释器”，objc4 则提供对象模型和执行 primitives。

<a id="lookup"></a>
## 3. 读写 key 的查找顺序

KVC 的关键不是“直接找同名属性”，而是按约定派生出多个候选访问器。 以 key `name` 为例，Foundation 会优先尊重方法；只有找不到访问器且类允许直接访问实例变量时， 才会进入 ivar 路径。

### `valueForKey:@"name"` 读流程

1.  找普通 getter，例如 `getName`、`name`、`isName`、`_getName`、`_name`。
2.  找集合访问器，例如 `countOfNames`、`objectInNamesAtIndex:`，返回 NSArray/NSSet 风格代理。
3.  如果 `+accessInstanceVariablesDirectly` 返回 YES，找 `_name`、`_isName`、`name`、`isName` ivar。
4.  标量和结构体会包装成 `NSNumber` 或 `NSValue`；找不到则调用 `valueForUndefinedKey:`。

### `setValue:forKey:@"name"` 写流程

1.  找 setter，例如 `setName:` 或 `_setName:`。
2.  如果没有 setter 且允许直接访问 ivar，找 `_name`、`_isName`、`name`、`isName`。
3.  若目标是对象 ivar，runtime 必须按 strong、weak 或 unretained 语义写入。
4.  若给非对象标量传 `nil`，调用 `setNilValueForKey:`；找不到 key 则调用 `setValue:forUndefinedKey:`。

```objectivec
@interface Account : NSObject {
@private
    NSString *_owner;
    double _balance;
}
- (NSString *)owner;
- (void)setOwner:(NSString *)owner;
@end

// 这是 Foundation 行为的简化伪代码，不是 objc4 中的函数。
id KVCGet(id obj, NSString *key) {
    // 1. 根据 key 拼出候选 getter selector。
    // key = "owner" 时，优先尝试 owner / getOwner / isOwner / _owner 等。
    SEL getter = firstExistingGetter([obj class], key);
    if (getter) {
        // 2. 真正调用方法时会落到 objc_msgSend。
        // 注意实际实现还要根据返回类型处理标量、结构体和对象。
        return ((id (*)(id, SEL))objc_msgSend)(obj, getter);
    }

    // 3. 没有访问器时，只有类允许直接访问 ivar 才继续。
    if ([[obj class] accessInstanceVariablesDirectly]) {
        Ivar ivar = firstExistingIvar([obj class], key);
        if (ivar) {
            // 4. 已经拿到 Ivar 元数据后，runtime 可按 offset 读取对象 ivar。
            // 标量 ivar 需要根据 type encoding 手动读内存并装箱。
            return object_getIvar(obj, ivar);
        }
    }

    // 5. 兜底入口通常会抛 NSUndefinedKeyException，也可以被子类重写。
    return [obj valueForUndefinedKey:key];
}
```

<a id="runtime"></a>
## 4. objc4 提供的底层能力

Foundation 的 KVC 决策完成后，要么调用 Objective-C 方法，要么直接读写 ivar。 这些动作都依赖 objc4 暴露的 runtime API。

| 能力 | 相关源码 | KVC 为什么需要 |
|----|----|----|
| 发送 getter / setter 消息 | `runtime/message.h`：`objc_msgSend` | KVC 找到 `name` 或 `setName:` 后，需要像普通方法调用一样执行。 |
| 查找方法 | `runtime/runtime.h`：`class_getInstanceMethod` | 检查某个 selector 是否存在，且会沿 superclass 查找。 |
| 查找 ivar | `runtime/runtime.h`：`class_getInstanceVariable`、`ivar_getOffset` | 直接 ivar 访问必须先拿到名字、类型编码和对象内偏移。 |
| 安全读写对象 ivar | `runtime/objc-class.mm`：`object_getIvar`、`object_setIvar` | 写对象 ivar 不能只做裸指针赋值；weak、strong、unretained 行为不同。 |
| 属性访问器辅助 | `runtime/objc-accessors.mm`：`objc_getProperty`、`objc_setProperty` | 编译器生成的属性 getter/setter 可调用这些函数处理 atomic、copy、retain/release。 |
| 属性元数据 | `runtime/runtime.h`：`class_copyPropertyList`、`property_getName` | 工具和框架可枚举属性；但 KVC 语义本身优先看访问器约定，不等同于只看 `@property`。 |

### 源码片段：消息发送是访问器路径的执行点

`runtime/message.h` 说明编译器遇到方法调用会生成 `objc_msgSend` 或相关变体。KVC 动态找到 selector 后，也必须按正确函数签名调用。

```objectivec
/* runtime/message.h 摘要 */

// objc_msgSend 的真实签名是可变的：
//   第 1 个参数是接收者 self
//   第 2 个参数是 selector
//   后面跟方法自己的参数
// 调用前必须 cast 成匹配返回值和参数的函数指针类型。
OBJC_EXPORT void
objc_msgSend(void /* id self, SEL op, ... */);

// KVC 找到 getter "owner" 后，概念上会做类似调用。
// 实际 Foundation 还会查看方法返回类型，处理标量装箱和结构体。
id value = ((id (*)(id, SEL))objc_msgSend)(obj, @selector(owner));

// KVC 找到 setter "setOwner:" 后，概念上会做类似调用。
((void (*)(id, SEL, id))objc_msgSend)(obj, @selector(setOwner:), newOwner);
```

### 源码片段：直接 ivar 写入要尊重内存管理

`runtime/objc-class.mm` 中的 `_object_setIvar` 展示了为什么 KVC 不能简单地用 `*(id *)addr = value`： weak、strong、unretained 必须走不同路径。

```objectivec
/* runtime/objc-class.mm 摘要 */

static ALWAYS_INLINE
void _object_setIvar(id obj, Ivar ivar, id value, bool assumeStrong)
{
    // nil、tagged pointer 或空 ivar 没有可写的对象实例存储。
    if (!ivar || _objc_isTaggedPointerOrNil(obj)) return;

    ptrdiff_t offset;
    objc_ivar_memory_management_t memoryManagement;

    // 根据 obj 的真实类和 Ivar，拿到对象内偏移以及该 ivar 的内存管理语义。
    _class_lookUpIvar(obj->ISA(), ivar, offset, memoryManagement);

    // 某些旧代码或 MRC 场景无法从布局判断语义。
    // object_setIvar 默认把 unknown 当 unsafe_unretained；
    // object_setIvarWithStrongDefault 则把 unknown 当 strong。
    if (memoryManagement == objc_ivar_memoryUnknown) {
        if (assumeStrong) memoryManagement = objc_ivar_memoryStrong;
        else memoryManagement = objc_ivar_memoryUnretained;
    }

    // offset 是 ivar 在对象实例内的字节偏移。
    id *location = (id *)((char *)obj + offset);

    switch (memoryManagement) {
    case objc_ivar_memoryWeak:
        // weak 写入要注册弱引用表，对象销毁时自动置 nil。
        objc_storeWeak(location, value);
        break;
    case objc_ivar_memoryStrong:
        // strong 写入要 retain 新值、release 旧值。
        objc_storeStrong(location, value);
        break;
    case objc_ivar_memoryUnretained:
        // assign/unsafe_unretained 只是裸指针写入。
        *location = value;
        break;
    case objc_ivar_memoryUnknown:
        _objc_fatal("impossible");
    }
}
```

### 源码片段：属性 setter 的 copy、atomic 和 retain/release

KVC 如果命中 setter，会执行你的 setter。编译器合成的 setter 可能调用 `objc_setProperty`，这里能看到 `copy`、`atomic` 和旧值释放的大致顺序。

```objectivec
/* runtime/objc-accessors.mm 摘要 */

static inline void reallySetProperty(id self, SEL _cmd, id newValue,
                                     ptrdiff_t offset,
                                     bool atomic, bool copy, bool mutableCopy)
{
    id oldValue;
    id *slot = (id *)((char *)self + offset);

    if (copy) {
        // @property(copy) 先复制新值，常见于 NSString、block。
        newValue = [newValue copyWithZone:nil];
    } else if (mutableCopy) {
        newValue = [newValue mutableCopyWithZone:nil];
    } else {
        // 非 copy 属性保留新值；如果新旧相同可直接返回。
        if (*slot == newValue) return;
        newValue = objc_retain(newValue);
    }

    if (!atomic) {
        // nonatomic：直接替换，速度快，不保证跨线程原子访问。
        oldValue = *slot;
        *slot = newValue;
    } else {
        // atomic：用按地址分片的锁保护 slot 的替换。
        spinlock_t& slotlock = PropertyLocks.get()[slot];
        slotlock.lock();
        oldValue = *slot;
        *slot = newValue;
        slotlock.unlock();
    }

    // 替换完成后释放旧值，避免在锁内执行潜在复杂代码。
    objc_release(oldValue);
}
```

<a id="classes"></a>
## 5. 核心类、方法和关键属性

KVC 没有一个在 objc4 中可见的“核心类”。使用者看到的是 `NSObject` 的 Foundation 分类方法；底层则主要与 runtime 的 `Class`、`SEL`、`Method`、`Ivar` 和 `objc_property_t` 交互。

### `NSObject(NSKeyValueCoding)`

Foundation 对外入口：`valueForKey:`、`setValue:forKey:`、 `valueForKeyPath:`、`setValue:forKeyPath:`、 `dictionaryWithValuesForKeys:`。

关键覆写点：`+accessInstanceVariablesDirectly`、`valueForUndefinedKey:`、`setValue:forUndefinedKey:`、`setNilValueForKey:`。

### `Class` / `SEL` / `Method`

objc4 `SEL` 是方法名的 runtime 表示； `Method` 记录 selector、类型编码和 IMP； `Class` 提供方法表和 superclass 链。

关键方法：`class_getInstanceMethod`、`method_getImplementation`、`objc_msgSend`。

### `Ivar`

objc4 描述实例变量。直接 ivar 访问时，KVC 需要知道名称、类型编码和 offset。

关键方法：`class_getInstanceVariable`、`class_copyIvarList`、`ivar_getName`、`ivar_getTypeEncoding`、`ivar_getOffset`。

### `objc_property_t`

objc4 描述 `@property` 元数据，例如类型、nonatomic、copy、weak、自定义 getter/setter。

关键方法：`class_copyPropertyList`、`property_getName`、`property_getAttributes`、`property_copyAttributeValue`。

### 集合访问器

Foundation 例如 `countOfEmployees`、`objectInEmployeesAtIndex:`、 `insertObject:inEmployeesAtIndex:`。

KVC 可用这些方法构造数组、集合或可变集合代理，不要求对象真的持有一个 NSArray 属性。

### 标量和空值处理

Foundation 读标量时装箱成 `NSNumber` 或 `NSValue`； 写标量时从对象拆箱。

给标量写 `nil` 会进入 `setNilValueForKey:`，默认通常抛异常。

<a id="flows"></a>
## 6. 关键操作流程

### 读取：`valueForKey:@"balance"`

### 拼候选 selector

从 key 推出 getter 名称，优先走方法访问，保证封装逻辑生效。

### 通过消息发送执行

命中 getter 后调用 `objc_msgSend`；若返回标量，Foundation 负责装箱。

### 尝试集合代理

没有普通 getter 时，查找 `countOf...` 等集合访问器。

### 必要时读 ivar

允许直接访问时，用 `Ivar` 的 offset 读取；找不到则 undefined key。

```cpp
// 示例：不暴露 NSArray 属性，也可以让 KVC 读出 employees。
@interface Department : NSObject
@end

@implementation Department {
    NSMutableArray *_storage;
}

- (NSUInteger)countOfEmployees {
    // KVC 集合代理需要知道元素数量。
    return _storage.count;
}

- (id)objectInEmployeesAtIndex:(NSUInteger)index {
    // valueForKey:@"employees" 可以通过这个方法按需取元素。
    // 这避免了必须额外创建一个 NSArray 属性。
    return _storage[index];
}

@end

// Foundation 会返回一个 NSArray 风格的代理对象。
NSArray *employees = [department valueForKey:@"employees"];
```

### 写入：`setValue:forKey:@"owner"`

### 优先 setter

命中 `setOwner:` 时，所有自定义校验、副作用和 KVO 通知机会都在 setter 内发生。

### 处理属性语义

若 setter 是合成的，可能由 runtime 辅助函数完成 copy、atomic、retain/release。

### 没有 setter 才找 ivar

只有 `+accessInstanceVariablesDirectly` 为 YES 时才找 `_owner` 等 ivar。

### 按 ivar 语义写入

对象 ivar 通过 `objc_storeStrong`、`objc_storeWeak` 或裸赋值写入。

```cpp
@interface User : NSObject {
@private
    NSString *_name;
}
@property (nonatomic, copy) NSString *name;
@end

@implementation User

- (void)setName:(NSString *)name {
    // KVC 命中 setter 时会进入这里，而不是直接改 _name。
    // 因此你写在 setter 中的规范化、校验、日志或通知逻辑都会生效。
    NSString *trimmed = [name stringByTrimmingCharactersInSet:
        [NSCharacterSet whitespaceAndNewlineCharacterSet]];

    // copy 语义很重要：调用方传 NSMutableString 时，内部仍保存不可变副本。
    _name = [trimmed copy];
}

@end

NSMutableString *s = [NSMutableString stringWithString:@"  Mei  "];
[user setValue:s forKey:@"name"];

// 结果是 @"Mei"，并且不会受 s 后续 mutation 影响。
[s appendString:@" changed"];
```

### Key Path：`valueForKeyPath:@"manager.name"`

```objectivec
// Key path 可以理解成多次 valueForKey: 串联。
// manager.name 大致等价于：
id manager = [department valueForKey:@"manager"];
id name = [manager valueForKey:@"name"];

// 简化伪代码：Foundation 会按 "." 拆分并逐段推进。
id KVCGetPath(id obj, NSString *path) {
    id current = obj;
    for (NSString *part in [path componentsSeparatedByString:@"."]) {
        // 任何一段都使用完整 KVC 查找规则。
        current = [current valueForKey:part];

        // 实际实现还要处理 nil、NSNull、集合运算符等情况。
        if (!current) break;
    }
    return current;
}
```

### Undefined Key：把错误变成可控边界

```cpp
@implementation Model

- (id)valueForUndefinedKey:(NSString *)key {
    // 默认行为通常是抛 NSUndefinedKeyException。
    // 重写后可以把未知字段记录下来，适合兼容服务端新增字段。
    NSLog(@"Unknown read key: %@", key);
    return nil;
}

- (void)setValue:(id)value forUndefinedKey:(NSString *)key {
    // 常用于 JSON -> Model：服务端有字段，本地版本还没有属性。
    // 注意不要悄悄吞掉真正的拼写错误；至少应记录日志。
    NSLog(@"Ignore unknown write key %@ = %@", key, value);
}

- (void)setNilValueForKey:(NSString *)key {
    // 当外部试图给 NSInteger、BOOL、double 等非对象字段写 nil 时会进这里。
    // 可以设置默认值，也可以抛出更明确的业务异常。
    if ([key isEqualToString:@"age"]) {
        [self setValue:@0 forKey:key];
        return;
    }
    [super setNilValueForKey:key];
}

@end
```

<a id="pitfalls"></a>
## 7. 常见坑与记忆模型

### 不要把 KVC 当成“只访问属性”

KVC 的第一优先级是访问器方法；没有方法时才可能直接 ivar。 一个 key 可以没有 `@property`，只要有符合命名规则的方法，也能工作。

### 直接 ivar 访问会绕开 setter

一旦走到 ivar 路径，setter 中的校验、副作用、copy 逻辑不会执行。 不希望外部绕过封装时，重写 `+accessInstanceVariablesDirectly` 返回 NO。

### 标量必须装箱和拆箱

`valueForKey:` 返回对象，所以 `int`、`BOOL`、 `double` 会变成 `NSNumber`。写入时传错对象类型会在运行时出问题。

### 字符串 key 没有编译期保护

`@"fristName"` 这种拼写错误编译器发现不了。生产代码里应集中定义 key， 或优先使用真实属性访问，把 KVC 留给确实需要动态性的边界。

最短记忆模型： key 先变成一组可能的 getter/setter selector；命中方法就走 objc_msgSend； 没有方法且允许直访时，key 再变成 Ivar + offset + type/memory semantics； 仍失败就进入 undefined-key 兜底。

| 你看到的现象 | 背后机制 | 排查方向 |
|----|----|----|
| `valueForKey:` 返回 `NSNumber` | 目标 getter 或 ivar 是标量，Foundation 做了装箱。 | 检查属性类型；写回时传对应 NSNumber。 |
| 写 key 后 setter 没被调用 | 可能没有符合规则的 setter，于是 KVC 走了直接 ivar 路径。 | 确认 selector 名称；必要时关闭 `accessInstanceVariablesDirectly`。 |
| 抛 `NSUndefinedKeyException` | 访问器和允许的 ivar 名都没找到。 | 检查 key 拼写、大小写、是否访问了错误对象层级。 |
| 给标量写 `nil` 抛异常 | 非对象字段不能接收 nil，进入 `setNilValueForKey:`。 | 传默认 NSNumber，或重写 `setNilValueForKey:`。 |

## 源码索引

本文用到的 objc4 支撑点可以从以下文件继续阅读：

- `runtime/message.h`：`objc_msgSend`、`objc_msgSendSuper` 声明和调用约束。
- `runtime/runtime.h`：`Class`、`Method`、`Ivar`、`objc_property_t` 相关公开 API。
- `runtime/objc-class.mm`：`object_getIvar`、`object_setIvar`、`_class_getIvarMemoryManagement`。
- `runtime/objc-accessors.mm`：编译器属性访问器辅助函数 `objc_getProperty` 和 `objc_setProperty`。
- `test/ARCLayouts.m`：测试中明确提到动态访问器、KVC 与 ARC/MRC ivar 布局的一致性。
