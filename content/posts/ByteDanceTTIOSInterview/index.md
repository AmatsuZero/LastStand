+++
date = '2026-06-16T20:07:38+08:00'
draft = true
title = '字节 TT 商业化团队 iOS 工程师一面面试题'
description = '记录字节 TT 商业化团队 iOS 工程师一面中涉及的 GCD、weak-strong dance、Objective-C 属性修饰、线程安全、Swift 消息派发和字符串算法题。'
summary = '字节 TT 商业化团队 iOS 一面题目整理，包含 Objective-C、Swift Runtime/Dispatch 和算法题的答题要点。'
keywords = ['字节跳动', 'TT', '商业化', 'iOS 面试', 'Objective-C', 'Swift', 'GCD', '线程安全', 'Swift 消息派发']
tags = ['iOS', 'Objective-C', 'Swift', 'GCD', '线程安全', '面试']
categories = ['iOS开发', '面试']
series = ['iOS 面试题']
weight = 1
+++

这篇文章记录字节 TT 商业化团队 iOS 工程师一面的面试题，并补充我自己的答题思路。整体覆盖 Objective-C Block 捕获、weak-strong dance、属性修饰符、集合线程安全、Swift 消息派发和字符串算法。

> 说明：本文先记录题目，再补充「考点」和「回答方向」。后续如果继续补充二面/三面题目，可以沿用同样结构追加。

## 面试信息

| 项目 | 内容 |
| --- | --- |
| 公司/团队 | 字节 TT 商业化团队 |
| 岗位 | iOS 工程师 |
| 轮次 | 一面 |
| 题型 | iOS 八股、Objective-C/Swift 语言机制、线程安全、算法 |
| 记录状态 | 持续补充中 |

## 目录

1. [GCD 与 Block 捕获](#1-gcd-与-block-捕获)
2. [weak-strong dance](#2-weak-strong-dance)
3. [NSMutableDictionary 属性声明问题](#3-nsmutabledictionary-属性声明问题)
4. [NSMutableDictionary 的线程安全改造](#4-nsmutabledictionary-的线程安全改造)
5. [Swift 消息派发](#5-swift-消息派发)
6. [算法题：反转分隔符和单词](#6-算法题反转分隔符和单词)

## 1. GCD 与 Block 捕获

题目：

```objc
int i = 10;
dispatch_async(dispatch_get_mainQueue(), ^{
    NSLog(@"%@", @(i));
});
i = 20;
```

问题：`i` 的值是多少？

### 考点

- Objective-C Block 对局部自动变量的捕获方式。
- `dispatch_async` 的异步执行时机。
- 捕获值和变量后续修改之间的关系。

### 回答方向

输出是 `10`。

原因是：普通局部变量默认会被 Block **按值捕获**。Block 创建时，`i` 的值已经被捕获为 `10`；后面执行 `i = 20`，修改的是 Block 外部的局部变量，不会影响 Block 内部捕获到的那份值。

这里即使 `dispatch_async` 投递到主队列，Block 的执行时机晚于当前代码继续向下执行，也不会改变结果。异步只影响「什么时候执行」，不改变普通局部变量「按值捕获」这个事实。

如果变量被 `__block` 修饰，Block 捕获的就不再是普通值副本，而是可以共享修改的 `__block` 存储，此时结果才可能变成后续修改后的值。

## 2. weak-strong dance

拓展讨论：weak-strong dance 的必要性，以及如果没有 `__strong`，会有什么问题？

### 典型写法

```objc
__weak typeof(self) weakSelf = self;
dispatch_async(queue, ^{
    __strong typeof(weakSelf) strongSelf = weakSelf;
    if (!strongSelf) {
        return;
    }

    [strongSelf doSomething];
    [strongSelf doAnotherThing];
});
```

### 考点

- Block 和 `self` 之间的循环引用。
- `weakSelf` 在 Block 执行期间可能变成 `nil`。
- `strongSelf` 对执行期间对象生命周期的保证。

### 回答方向

`weakSelf` 的作用是避免 Block 强持有 `self`，从而打破「对象持有 Block，Block 又持有对象」的循环引用。

进入 Block 后再转成 `strongSelf`，是为了保证在本次 Block 执行期间对象不会突然释放。否则如果一直使用 `weakSelf`，它可能在多次访问之间变成 `nil`：

```objc
[weakSelf doSomething];
[weakSelf doAnotherThing];
```

Objective-C 给 `nil` 发消息不会崩溃，但会导致后续逻辑静默不执行，出现「前半段执行了、后半段对象没了」的状态不一致问题。使用 `strongSelf` 后，如果对象还在，就让它至少活到当前 Block 结束；如果对象已经释放，就直接 `return`。

## 3. NSMutableDictionary 属性声明问题

题目：以下写法有什么问题？

```objc
@interface SomeClass: NSObject

@property(atomic, copy) NSMutableDictionary *dict;

@end
```

### 考点

- `atomic` 的线程安全边界。
- `copy` 修饰可变集合的副作用。
- 对外暴露可变集合的封装问题。

### 回答方向

这段声明主要有三个问题。

第一，`copy` 和 `NSMutableDictionary *` 搭配很危险。对一个可变字典执行 `copy`，通常得到的是不可变的 `NSDictionary`。属性类型写的是 `NSMutableDictionary *`，但实际对象可能是不可变字典，后续如果调用 `setObject:forKey:` 这类可变方法，就可能触发 `unrecognized selector` 崩溃。

第二，`atomic` 只保证属性 getter/setter 本身的原子性，不保证字典内部读写是线程安全的。例如两个线程同时对 `dict` 做 `setObject:forKey:`，`atomic` 并不能保护这次 mutation。

第三，直接暴露 `NSMutableDictionary *` 会破坏封装。外部拿到字典后可以绕过类内部的同步策略直接修改，后续即使类内部加锁，也无法保证所有访问都经过同一把锁或同一个队列。

更合理的声明通常是：

```objc
@property (nonatomic, strong, readonly) NSMutableDictionary *dict;
```

或者对外只暴露不可变快照：

```objc
@property (nonatomic, copy, readonly) NSDictionary *dictSnapshot;
```

## 4. NSMutableDictionary 的线程安全改造

题目：上面的 `dict`，如果想要线程安全地访问和修改，可以怎么改？

### 考点

- 可变集合不是线程安全容器。
- 线程安全需要保护「复合操作」，而不只是保护属性赋值。
- 对外 API 应该收敛读写入口。

### 回答方向

常见做法是把可变字典变成私有状态，对外提供方法，并用同一套同步机制保护所有读写。

#### 方案一：串行队列

```objc
@interface SomeClass ()
@property (nonatomic, strong) NSMutableDictionary *dict;
@property (nonatomic, strong) dispatch_queue_t dictQueue;
@end

@implementation SomeClass

- (instancetype)init {
    self = [super init];
    if (self) {
        _dict = [NSMutableDictionary dictionary];
        _dictQueue = dispatch_queue_create("com.example.someclass.dict", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

- (id)objectForKey:(id<NSCopying>)key {
    __block id value = nil;
    dispatch_sync(self.dictQueue, ^{
        value = self.dict[key];
    });
    return value;
}

- (void)setObject:(id)object forKey:(id<NSCopying>)key {
    dispatch_async(self.dictQueue, ^{
        self.dict[key] = object;
    });
}

@end
```

串行队列实现简单，所有访问天然排队，适合读写量都不大的场景。

#### 方案二：并发队列 + barrier

```objc
- (id)objectForKey:(id<NSCopying>)key {
    __block id value = nil;
    dispatch_sync(self.dictQueue, ^{
        value = self.dict[key];
    });
    return value;
}

- (void)setObject:(id)object forKey:(id<NSCopying>)key {
    dispatch_barrier_async(self.dictQueue, ^{
        self.dict[key] = object;
    });
}
```

如果读多写少，可以把 `dictQueue` 建成并发队列，读操作用 `dispatch_sync`，写操作用 `dispatch_barrier_async`。这样多个读可以并发，写会独占。

还可以使用 `NSLock`、`os_unfair_lock` 或 `@synchronized`，核心原则一样：**所有读写都必须经过同一套同步入口，不要把可变字典直接暴露给外部随意修改。**

## 5. Swift 消息派发

题目：Swift 消息派发有哪几种？

### 考点

- Swift 不同语义下的派发方式。
- Protocol extension 默认实现和 protocol requirement 的区别。
- 静态类型对调用结果的影响。

### 回答方向

Swift 常见派发方式可以按下面几类理解：

| 派发方式 | 常见场景 | 特点 |
| --- | --- | --- |
| Direct Dispatch / Static Dispatch | `struct`、`enum`、`final`、`private`、可内联调用 | 编译期确定目标，性能最好，不能动态重写 |
| Vtable Dispatch | 普通 class 方法 | 通过类的虚函数表查找，支持继承和 override |
| Witness Table Dispatch | protocol requirement 的泛型/存在类型调用 | 通过协议见证表找到具体实现 |
| Objective-C Message Dispatch | `@objc`、`dynamic`、继承自 `NSObject` 并暴露给 ObjC 的调用 | 走 `objc_msgSend`，支持 KVO、Runtime 动态替换等能力 |

拓展题代码：

```swift
protocol dd {
    func hello()
}

extension dd {
    func hello {}
}

Class A {
    func hello {}
}

extension A: dd {
    func hello() {

    }
}
```

这段代码按原样看有语法问题：`Class` 应该是 `class`，`func hello {}` 也不是合法 Swift 写法；如果 `A` 里已经有同签名的 `hello()`，再在 `extension A` 里实现一个同签名 `hello()`，也会构成重复声明。

把它整理成一个可讨论版本：

```swift
protocol DD {
    func hello()
}

extension DD {
    func hello() {
        print("DD default")
    }
}

class A {
    func hello() {
        print("A hello")
    }
}

extension A: DD {}
```

在这个版本里，`A` 自己的 `hello()` 会满足 `DD` 的 requirement。因此：

```swift
let a = A()
a.hello()          // A hello

let d: any DD = a
d.hello()          // A hello
```

如果某个方法只写在 protocol extension 里，但不是 protocol requirement，那么它更偏静态派发，调用时会受变量的静态类型影响。这也是 Swift 协议扩展题最容易考的点：**先判断方法是不是协议要求，再判断当前调用的静态类型是什么。**

## 6. 算法题：反转分隔符和单词

题目：力扣 151 题「[反转字符串中的单词](https://leetcode.cn/problems/reverse-words-in-a-string/description/?envType=study-plan-v2&envId=top-interview-150)」的变种：

```swift
/**
@@hello@world@ -> @world@hello@@
@ -> @
hello -> hello
hello@hello -> hello@hello
 */
func reverseWords(_ s: String) -> String {}
```

### 考点

- 字符串扫描和分组。
- 分隔符连续出现时如何处理。
- Swift `String` 按 `Character` 遍历的写法。

### 题意理解

从样例看，目标不是只反转单词，而是把字符串按「连续的 `@`」和「连续的非 `@` 字符」切成若干段，然后整体反转这些段：

```text
@@hello@world@  ->  [@@, hello, @, world, @]
反转段顺序       ->  [@, world, @, hello, @@]
结果             ->  @world@hello@@
```

### Swift 实现

```swift
func reverseWords(_ s: String) -> String {
    guard !s.isEmpty else { return s }

    var groups: [String] = []
    var current = ""
    var currentIsSeparator: Bool?

    for ch in s {
        let isSeparator = ch == "@"

        if currentIsSeparator == nil || currentIsSeparator == isSeparator {
            current.append(ch)
        } else {
            groups.append(current)
            current = String(ch)
        }

        currentIsSeparator = isSeparator
    }

    if !current.isEmpty {
        groups.append(current)
    }

    return groups.reversed().joined()
}
```

### 测试用例

```swift
reverseWords("@@hello@world@") // "@world@hello@@"
reverseWords("@")              // "@"
reverseWords("hello")          // "hello"
reverseWords("hello@hello")    // "hello@hello"
reverseWords("@@")             // "@@"
reverseWords("hello@world")    // "world@hello"
```

其中 `hello@hello` 反转后仍然是 `hello@hello`，不是因为没有反转，而是因为它的分组结果 `[hello, @, hello]` 本身是对称的。

### 复杂度

- 时间复杂度：`O(n)`，每个字符扫描一次。
- 空间复杂度：`O(n)`，需要保存分组结果。

如果面试官继续要求原地处理，需要先确认输入是否是可变字符数组；Swift 的 `String` 本身不适合做真正意义上的原地字符交换，可以转换成 `[Character]` 后再讨论双指针方案。
