+++
title = "+load与+initialize的区别"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 20
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
`+load`和`+initialize`是Objective-C中两个特殊的类方法，它们都会被Runtime自动调用，但调用时机、调用方式和使用场景有很大区别。理解它们的差异对于iOS开发和性能优化非常重要。

---

## 基本定义

### +load方法

`+load`方法在类被加载到内存时由Runtime自动调用，发生在main函数执行之前。

```objc
@implementation MyClass
+ (void)load {
    NSLog(@"MyClass loaded");
}
@end
```

### +initialize方法

`+initialize`方法在类第一次收到消息时由Runtime自动调用，是一种懒加载机制。

```objc
@implementation MyClass
+ (void)initialize {
    NSLog(@"MyClass initialized");
}
@end
```

---

## 核心区别对比

| 特性 | +load | +initialize |
|------|-------|-------------|
| 调用时机 | main函数之前，类加载时 | 类首次收到消息时 |
| 调用方式 | 直接调用函数指针 | 通过objc_msgSend |
| 调用次数 | 每个类只调用一次 | 可能被调用多次 |
| 是否阻塞启动 | 是 | 否 |
| 是否需要显式调用父类 | 否，自动调用 | 否，自动调用 |
| Category的行为 | 都会被调用 | 会覆盖主类实现 |
| 线程安全 | 是 | 是 |
| 调用顺序 | 父类 -> 子类 -> Category | 父类 -> 子类 |
| 未实现时的行为 | 不调用 | 可能调用父类实现 |

---

## 调用时机详解

### +load的调用时机

`+load`的调用发生在dyld加载镜像的过程中：

```
dyld加载Mach-O
    ↓
映射到内存
    ↓
读取__DATA段中的__objc_nlclslist（非懒加载类列表）
    ↓
调用所有类的+load方法
    ↓
读取__objc_nlcatlist（非懒加载分类列表）
    ↓
调用所有分类的+load方法
    ↓
main()函数执行
```

### +initialize的调用时机

`+initialize`在类第一次收到消息时调用：

```objc
// 第一次调用类方法时触发+initialize
[MyClass someMethod];

// 第一次创建实例时也会触发
MyClass *obj = [[MyClass alloc] init];
```

---

## 调用方式的差异

### +load是直接调用

Runtime通过函数指针直接调用`+load`方法，不经过消息发送机制：

```c
// Runtime源码简化
typedef void(*load_method_t)(id, SEL);
load_method_t load_method = (load_method_t)method_getImplementation(m);
load_method(cls, @selector(load));
```

这意味着：
- 不会触发消息转发
- Category的`+load`不会覆盖主类的`+load`

### +initialize是消息发送

`+initialize`通过`objc_msgSend`调用：

```c
// Runtime源码简化
void _class_initialize(Class cls) {
    // ...
    ((void(*)(Class, SEL))objc_msgSend)(cls, @selector(initialize));
}
```

这意味着：
- 遵循消息发送机制
- Category的`+initialize`会覆盖主类的`+initialize`

---

## 调用顺序规则

### +load的调用顺序

1. 父类的`+load`先于子类
2. 类的`+load`先于Category
3. 同一镜像中，按编译顺序调用
4. 不同镜像中，按依赖关系调用

```objc
// 调用顺序示例
@implementation SuperClass
+ (void)load { NSLog(@"1. SuperClass +load"); }
@end

@implementation SubClass : SuperClass
+ (void)load { NSLog(@"2. SubClass +load"); }
@end

@implementation SubClass (Category)
+ (void)load { NSLog(@"3. SubClass+Category +load"); }
@end

// 输出：
// 1. SuperClass +load
// 2. SubClass +load
// 3. SubClass+Category +load
```

### +initialize的调用顺序

1. 父类的`+initialize`先于子类
2. 如果子类没有实现`+initialize`，会调用父类的实现

```objc
@implementation SuperClass
+ (void)initialize {
    NSLog(@"SuperClass +initialize, self = %@", self);
}
@end

@implementation SubClass : SuperClass
// 没有实现+initialize
@end

// 当调用[SubClass new]时输出：
// SuperClass +initialize, self = SuperClass
// SuperClass +initialize, self = SubClass  // 注意：父类实现被调用了两次！
```

---

## +initialize的多次调用问题

由于`+initialize`通过消息发送调用，如果子类没有实现该方法，会调用父类的实现。这可能导致父类的`+initialize`被多次调用：

```objc
@implementation SuperClass
+ (void)initialize {
    // 这段代码可能执行多次！
    [self setupSomething];
}
@end
```

### 解决方案

使用`dispatch_once`或类型检查：

```objc
// 方案1：使用dispatch_once
@implementation SuperClass
+ (void)initialize {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        [self setupSomething];
    });
}
@end

// 方案2：检查类型
@implementation SuperClass
+ (void)initialize {
    if (self == [SuperClass class]) {
        [self setupSomething];
    }
}
@end
```

---

## Category的行为差异

### +load在Category中的行为

Category的`+load`不会覆盖主类的`+load`，两者都会被调用：

```objc
@implementation MyClass
+ (void)load { NSLog(@"MyClass +load"); }
@end

@implementation MyClass (CategoryA)
+ (void)load { NSLog(@"MyClass+CategoryA +load"); }
@end

@implementation MyClass (CategoryB)
+ (void)load { NSLog(@"MyClass+CategoryB +load"); }
@end

// 输出（三个都会调用）：
// MyClass +load
// MyClass+CategoryA +load
// MyClass+CategoryB +load
```

### +initialize在Category中的行为

Category的`+initialize`会覆盖主类的实现：

```objc
@implementation MyClass
+ (void)initialize { NSLog(@"MyClass +initialize"); }
@end

@implementation MyClass (Category)
+ (void)initialize { NSLog(@"MyClass+Category +initialize"); }
@end

// 输出（只有Category的会被调用）：
// MyClass+Category +initialize
```

---

## 使用场景

### +load的适用场景

由于`+load`会阻塞启动，应尽量避免使用。仅在以下场景考虑：

1. **Method Swizzling**：需要在最早时机替换方法实现

```objc
+ (void)load {
    Method original = class_getInstanceMethod(self, @selector(viewDidLoad));
    Method swizzled = class_getInstanceMethod(self, @selector(swizzled_viewDidLoad));
    method_exchangeImplementations(original, swizzled);
}
```

2. **注册协议实现**：某些框架要求在最早时机注册

### +initialize的适用场景

`+initialize`更适合延迟初始化：

1. **初始化静态变量**

```objc
static NSDateFormatter *dateFormatter;

+ (void)initialize {
    if (self == [MyClass class]) {
        dateFormatter = [[NSDateFormatter alloc] init];
        dateFormatter.dateFormat = @"yyyy-MM-dd";
    }
}
```

2. **配置类级别的默认值**

```objc
+ (void)initialize {
    if (self == [MyClass class]) {
        [self setDefaultConfiguration];
    }
}
```

---

## Method Swizzling应该在+load还是+initialize中执行

Method Swizzling是`+load`最常见的使用场景，但能否在`+initialize`中进行swizzle是一个经常被讨论的问题。

### 推荐：在+load中执行

`+load`是执行Method Swizzling的最佳时机，原因如下：

**1. 天然只执行一次**

Runtime保证每个类的`+load`只调用一次，不需要额外的防重复措施。常见的在`+load`中包裹`dispatch_once`的写法实际上是多余的，这只是一种防御性编程习惯，源自早期模板代码的传播。

Runtime源码（`objc-runtime-new.mm`中的`load_images`函数）通过`loadMethodLock`递归锁保护`+load`的调用过程，`call_load_methods()`确保每个`+load`实现只被调用一次。

**2. 线程安全**

`+load`在加锁环境下串行执行，swizzling操作不会与其他线程产生竞争。

**3. 调用顺序有保证**

Runtime保证父类的`+load`先于子类执行。这对于swizzle有继承关系的类非常重要——如果在子类和父类中分别swizzle同一个方法，顺序错误会导致方法查找链出问题。`+load`天然保证了从父类到子类的正确顺序。

### 不推荐：在+initialize中执行

虽然技术上可行，但`+initialize`存在以下问题：

**1. 子类继承导致多次调用**

这是最实际的问题。如果子类没有实现`+initialize`，父类的`+initialize`会被多次调用。多次执行`method_exchangeImplementations`会将方法实现换回去再换过来，导致swizzle失效。因此必须使用`dispatch_once`保护：

```objc
// 不推荐：在+initialize中swizzle
+ (void)initialize {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Method original = class_getInstanceMethod(self, @selector(viewDidLoad));
        Method swizzled = class_getInstanceMethod(self, @selector(swizzled_viewDidLoad));
        method_exchangeImplementations(original, swizzled);
    });
}
```

仅使用`if (self == [MyClass class])`判断也不够安全，因为存在并发场景。

**2. swizzling操作非原子性**

Method Swizzling通常涉及多个步骤（`class_addMethod` + `method_exchangeImplementations`），这些步骤之间不是原子的。`+load`在串行加锁环境下执行，天然避免了竞争；而`+initialize`可能在多线程环境下被调用，即使使用`dispatch_once`保护了入口，swizzling内部的多步操作之间仍存在竞争窗口。

**3. 潜在的死锁风险**

`+initialize`内部有锁机制，在复杂场景下（比如A类的`+initialize`触发了B类的`+initialize`）可能产生死锁。

---

## 性能影响

### +load对启动的影响

- 所有`+load`方法在main函数之前同步执行
- 大量的`+load`方法会显著增加启动时间
- 即使`+load`方法体为空，也有调用开销

### 优化建议

1. **减少+load的使用**：评估是否真的需要在启动时执行
2. **迁移到+initialize**：将非必要的初始化延迟到首次使用时
3. **使用静态注册**：用编译时配置替代运行时注册
4. **使用Swift**：Swift没有`+load`机制，天然避免这个问题

---

## 底层实现原理

### +load的实现

Runtime维护了一个待调用的`+load`方法列表，在`_dyld_objc_notify_register`回调中处理：

```c
void call_load_methods(void) {
    // 1. 调用所有类的+load
    while (loadable_classes_used > 0) {
        call_class_loads();
    }
    
    // 2. 调用所有分类的+load
    while (loadable_categories_used > 0) {
        call_category_loads();
    }
}
```

### +initialize的实现

`+initialize`在类第一次收到消息时由`lookUpImpOrForward`触发：

```c
IMP lookUpImpOrForward(Class cls, SEL sel, ...) {
    // 检查类是否已初始化
    if (!cls->isInitialized()) {
        _class_initialize(cls);
    }
    // 继续查找方法实现...
}
```

---

## 常见面试问题

### Q1: +load和+initialize的主要区别是什么？

**1. 调用时机**
- `+load`：在main函数执行之前，由dyld在加载Mach-O镜像时自动调用。只要类被编译进项目，无论是否被使用，`+load`都会被执行。
- `+initialize`：在类第一次收到消息时调用（懒加载）。如果一个类从未被使用过，它的`+initialize`永远不会被执行。

**2. 调用方式**
- `+load`：Runtime通过函数指针直接调用，不经过`objc_msgSend`消息发送机制。这意味着不会触发消息转发流程。
- `+initialize`：通过`objc_msgSend`调用，遵循完整的消息发送机制，包括方法查找、消息转发等。

**3. Category行为**
- `+load`：主类和所有Category的`+load`方法都会被执行，互不覆盖。
- `+initialize`：如果Category实现了`+initialize`，会覆盖主类的实现，只有Category的版本会被调用。

**4. 继承行为**
- `+load`：不会因继承关系而调用父类实现。如果子类没有实现`+load`，就不会调用任何`+load`。
- `+initialize`：如果子类没有实现，会调用父类的`+initialize`，这可能导致父类的实现被多次调用。

**5. 对启动性能的影响**
- `+load`：会阻塞App启动，过多的`+load`方法会显著增加启动时间。
- `+initialize`：延迟执行，不影响启动性能。

### Q2: +load方法的执行顺序是怎样的？

`+load`方法的执行顺序遵循以下规则：

**1. 父类优先于子类**
- 如果存在继承关系，父类的`+load`一定先于子类执行
- Runtime会确保在调用子类的`+load`之前，其所有父类的`+load`都已执行完毕

**2. 类优先于Category**
- 所有类的`+load`方法执行完毕后，才会执行Category的`+load`
- 主类和Category的`+load`都会被调用，不会相互覆盖

**3. 同级别按编译顺序**
- 没有继承关系的类之间，按照编译顺序（Compile Sources中的顺序）执行
- 多个Category之间也是按编译顺序执行

**4. 不同镜像按依赖关系**
- 如果项目依赖多个动态库，会按照镜像的依赖关系顺序调用
- 被依赖的镜像中的`+load`先执行

### Q3: +initialize可能被调用多次吗？

是的。如果子类没有实现`+initialize`，当子类首次收到消息时，会调用父类的`+initialize`实现。因此父类的`+initialize`可能因为不同子类的初始化而被多次调用，需要使用`dispatch_once`或类型检查来保护。

### Q4: Method Swizzling应该在+load还是+initialize中执行？为什么？

应该在`+load`中执行。原因有三点：

1. **`+load`天然只执行一次**：Runtime保证每个类的`+load`只调用一次，且在串行加锁环境下执行，不需要`dispatch_once`保护。而`+initialize`可能因子类继承被多次调用，多次`method_exchangeImplementations`会导致swizzle失效，必须使用`dispatch_once`。

2. **线程安全**：swizzling操作（`class_addMethod` + `method_exchangeImplementations`）不是原子的。`+load`在`loadMethodLock`保护下串行执行，天然避免竞争；`+initialize`可能在多线程环境下被调用，即使`dispatch_once`保护了入口，内部多步操作之间仍存在竞争窗口。

3. **调用顺序有保证**：`+load`保证父类先于子类执行，对于继承链上的swizzle顺序非常重要。`+initialize`的调用顺序取决于哪个类先收到消息，不可控。
