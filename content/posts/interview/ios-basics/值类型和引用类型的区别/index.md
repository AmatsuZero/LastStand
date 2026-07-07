+++
title = "值类型和引用类型的区别"
date = '2026-05-10T22:25:41+08:00'
draft = false
weight = 26
tags = ["iOS", "面试", "基础"]
categories = ["iOS开发", "面试"]
+++
## 定义

### 值类型

值类型是指变量直接存储自身字段或描述信息的类型。值类型具有值语义，当将一个值类型变量赋值给另一个变量时，语义上会得到一份独立的值；底层是否立即复制完整数据，取决于编译器优化和写时拷贝等实现。

### 引用类型

引用类型是指变量存储的是指向数据在内存中位置的引用（指针）。当将一个引用类型变量赋值给另一个变量时，两个变量指向同一块内存区域。

## Objective-C中的类型分类

在Objective-C中：

- **值类型**：基础数据类型（int、float、double、BOOL、char等）、结构体（struct）、枚举（enum）
- **引用类型**：除基础数据类型之外的大部分类型，包括NSObject及其子类（NSString、NSArray、NSDictionary、自定义类等）

## Swift中的类型分类

Swift对类型的分类更加清晰：

- **值类型**：基础数据类型（Int、Float、Double、Bool等）、字符串（String）、结构体（Struct）、枚举（Enum）、数组（Array）、字典（Dictionary）、集合（Set）等
- **引用类型**：类（Class）、闭包（Closure）、Actor等

## 拷贝机制差异

### 值类型 - 值语义拷贝

- 每个值类型变量都有自己的字段存储
- 对一个变量的操作不会影响另一个变量
- 赋值语义上会得到独立副本；如果字段是引用类型，复制的是引用本身，底层也可能通过写时拷贝延迟真正的数据复制

### 引用类型 - 浅拷贝

- 引用类型在内存中有一个指向该位置的引用
- 引用类型的变量可以指向相同类型的数据
- 对一个变量进行的操作会影响另一变量所指向的数据

## 内存分配机制

需要注意：**值类型/引用类型描述的是语义模型，不等价于栈/堆分配规则**。Swift编译器会根据生命周期、逃逸分析、优化级别、协议类型包装、集合存储等因素决定具体放在哪里。

理解Swift对象和字段的内存位置，可以先记住三个规则：

- **class实例本体**通常在堆上，通过引用计数管理生命周期
- **struct/enum的字段**通常内联存储在这个值本身所在的位置
- **class类型的字段**存储的是对象引用，也就是一个指针，真实class实例仍然在堆上

### 常见存储位置

- **局部值类型变量**：生命周期明确、未逃逸时，通常可以放在当前线程的栈区，甚至被优化到寄存器中
- **class实例**：实例本体在堆区，局部变量中保存的是指向堆对象的引用
- **class里的struct属性**：struct属性内联存储在class实例这块堆内存中
- **struct里的class属性**：struct内部只保存class引用，真实class实例仍然在堆上
- **被逃逸闭包捕获的值类型**可能随闭包上下文一起存储在堆区
- **Array、Dictionary、Set、String等写时拷贝值类型**通常只有一小段描述信息是值本身，真实元素或字符缓冲区可能在堆上
- **协议类型（existential container）持有大值类型**时，如果超过存在容器的内联缓冲区大小，会使用堆分配
- **indirect enum**的间接关联值会通过堆上的盒子存储，常见于递归枚举
- **全局变量、静态变量**不属于栈区，也不是普通意义上的堆对象，它们通常位于全局/静态存储区

栈区内存分配和销毁通常只需移动栈顶指针，成本较低；堆区更动态，但分配、释放和引用计数维护都有额外成本。

### struct中包含class属性

```swift
class Dog {
    var name: String

    init(name: String) {
        self.name = name
    }
}

struct Person {
    var age: Int
    var dog: Dog
}

var p1 = Person(age: 18, dog: Dog(name: "Lucky"))
var p2 = p1

p2.age = 20
p2.dog.name = "Max"

print(p1.age)       // 18
print(p1.dog.name)  // Max
```

内存关系可以近似理解为：

```text
p1所在位置（通常是栈/寄存器，也可能被优化）
Person {
  age: 18
  dog: 指向Dog实例的引用 ───┐
}                          │
                           ▼
                        堆上的Dog实例
                        Dog { name: "Max" }

p2所在位置（p1赋值而来）
Person {
  age: 20
  dog: 指向同一个Dog实例的引用 ─┘
}
```

`Person`是值类型，`p2 = p1`会复制`Person`的字段，所以`age`变成两份独立的值；但`dog`字段本身只是一个引用，复制时复制的是指针，不会把`Dog`实例也复制一份。因此修改`p2.age`不影响`p1.age`，修改`p2.dog.name`会影响`p1.dog.name`。

**struct包含class属性时，struct整体仍然是值语义，但它内部的引用属性指向的对象可能被多个值共享**。

### class中包含struct属性

```swift
struct Point {
    var x: Int
    var y: Int
}

class ViewModel {
    var point: Point

    init(point: Point) {
        self.point = point
    }
}

let vm1 = ViewModel(point: Point(x: 1, y: 2))
let vm2 = vm1

vm2.point.x = 10

print(vm1.point.x)  // 10
```

内存关系可以近似理解为：

```text
vm1局部变量
引用 ─────┐
          ▼
       堆上的ViewModel实例
       ViewModel {
         point: Point {
           x: 10
           y: 2
         }
       }

vm2局部变量
同一个引用 ─┘
```

`ViewModel`是引用类型，实例本体在堆上；`point`是struct属性，它不是单独的堆对象，而是内联存储在`ViewModel`实例这块堆内存中。`vm2 = vm1`只是复制引用，`vm1`和`vm2`仍然指向同一个`ViewModel`实例，所以修改`vm2.point.x`也会反映到`vm1.point.x`。

如果把`point`从对象里取出来，再修改局部变量，则不会影响原对象：

```swift
var point = vm1.point
point.x = 99

print(vm1.point.x)  // 10
print(point.x)      // 99
```

这里`point`是从`ViewModel`实例中复制出来的一份新的`Point`值，后续修改的是局部变量自己的副本。

### 四种组合总结

| 组合 | 宿主在哪里 | 属性如何存储 | 赋值后的影响 |
|------|------------|--------------|--------------|
| struct中包含struct | struct值在哪里，内部struct字段就内联在哪里 | 字段整体复制 | 修改新值不影响旧值 |
| struct中包含class | struct值在哪里，class引用字段就在哪里 | 只复制对象引用，class实例仍在堆上 | 修改引用指向的对象会影响共享者 |
| class中包含struct | class实例在堆上 | struct字段内联在class实例内部 | 多个class引用共享同一份struct字段 |
| class中包含class | 两个class实例都在堆上 | 属性中保存另一个对象的引用 | 修改被引用对象会影响共享者 |

### 值类型的逃逸

如果一个值类型需要在创建它的函数作用域之外继续被访问，即发生了逃逸，Swift编译器可能会把相关存储放到堆上。典型场景是被逃逸闭包捕获：

```swift
struct Point {
    var x: Double
    var y: Double
}

func makePrinter() -> () -> Void {
    let point = Point(x: 1, y: 2)
    return {
        print(point.x)     // 闭包逃逸，捕获的point会随闭包上下文保存
    }
}
```

但“值类型作为函数返回值”不应简单理解为必然堆分配。返回普通结构体时，编译器可能通过寄存器、调用方栈空间或返回值优化完成传递；返回`Array`这类集合时，数组这个值本身是一个结构体，底层元素缓冲区通常位于堆上，这属于写时拷贝容器的实现细节。

## 性能对比

- 栈内存的操作性能远远高于堆内存
- 值类型如果发生真实数据拷贝，成本可能高于引用类型的浅拷贝；Swift为了优化值类型性能，引入了写时拷贝（Copy-on-Write）机制

## 写时拷贝（Copy-on-Write）

### 基本原理

写时拷贝是Swift对值类型的重要性能优化。当一个值类型被赋值给另一个变量时，不会立即创建副本，而是让多个变量共享同一份底层存储。只有当其中一个变量尝试修改数据时，才会触发真正的拷贝。

```swift
var array1 = [1, 2, 3, 4, 5]
var array2 = array1  // 此时不拷贝，共享底层存储

array2.append(6)     // 此时才触发拷贝，array1和array2变为独立
```

这种机制在大多数情况下既保证了值语义的安全性，又避免了不必要的拷贝开销。

### 实现机制

Swift标准库中的Array、Dictionary、Set等集合类型都内置了写时拷贝优化。其核心实现依赖于`isKnownUniquelyReferenced`函数：

```swift
// 简化的写时拷贝实现原理
struct MyArray<Element> {
    private var storage: ArrayStorage<Element>
    
    mutating func append(_ element: Element) {
        // 检查底层存储是否被唯一引用
        if !isKnownUniquelyReferenced(&storage) {
            // 如果被多个变量共享，先创建副本
            storage = storage.copy()
        }
        // 然后执行修改操作
        storage.append(element)
    }
}
```

当检测到底层存储被多个变量共享时，会先创建副本再进行修改；如果只有一个变量引用，则直接修改，无需拷贝。

### 多次赋值的共享

```swift
var array1 = [1, 2, 3, 4, 5]  // 原始数组
var array2 = array1           // 共享存储
var array3 = array1           // 同样共享存储

// 此时 array1、array2、array3 共享同一份底层数据

array2.append(6)              // array2 触发拷贝，获得独立副本
// 现在 array1 和 array3 仍共享存储，array2 有自己的副本
```

## 底层内存布局

详见[Objective-C底层原理-NSObject]({{< relref "/posts/interview/ios-basics/Objective-C底层原理-NSObject" >}})以及[Swift底层原理-结构体、类和协议]({{< relref "/posts/interview/ios-basics/Swift底层原理-结构体-类和协议" >}})
