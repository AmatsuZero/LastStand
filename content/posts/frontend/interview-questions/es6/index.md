+++
title = "ES6 面试题"
draft = false
tags = ["面试", "前端", "ES6", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T05:14:14.562Z"
+++

共 51 道 ES6 面试题。答案默认折叠，便于先自行作答。

## 1. 说说 Class 语法糖的底层实现 {#question-86483690-5e1e-4dae-911e-0aba1644bd2f}

> 难度：3 · 类型：QA

### 题目要点

class 是基于函数构造器和原型链的语法封装，实例方法本质挂载在 prototype 上，继承通过 Object.create 构建原型链，同时通过构造函数原型链继承静态方法。super 依赖内部 [[HomeObject]] 机制定位父类方法。class 并未引入新的对象模型，而是在原型继承基础上增加语义约束与语法增强。

<details>
<summary>参考答案</summary>

这个问题的关键在于理解：`class` 并不是一种新的面向对象机制，而是对 **原型继承（prototype-based inheritance）** 的语法封装。底层仍然是函数构造器 + 原型链。

如果把 `class` 当作 Java 那种基于类的模型去理解，就会产生误解。

---

先看一个简单例子：

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  say() {
    console.log(this.name);
  }

  static create(name) {
    return new Person(name);
  }
}
```

它在底层大致等价于：

```js
function Person(name) {
  this.name = name;
}

Person.prototype.say = function () {
  console.log(this.name);
};

Person.create = function (name) {
  return new Person(name);
};
```

---

一、实例方法的实现

类中的方法：

```js
say() {}
```

本质是定义在 `Person.prototype` 上。

并且具有几个默认特性：

* 不可枚举（enumerable: false）
* 可写（writable: true）
* 可配置（configurable: true）

这和直接给 prototype 赋值略有区别，因为手动赋值默认是可枚举的。

---

二、constructor 的本质

`constructor` 本质仍然是一个函数。

但 `class` 定义的构造函数有两个特殊点：

1. 不能作为普通函数调用

   ```js
   Person(); // 报错
   ```

   必须通过 `new`。

2. 默认开启严格模式（strict mode）

这是和 ES5 构造函数的重要差异。

---

三、继承的底层实现

```js
class Student extends Person {
  constructor(name, grade) {
    super(name);
    this.grade = grade;
  }
}
```

底层大致等价于：

```js
function Student(name, grade) {
  Person.call(this, name);
  this.grade = grade;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

// 继承静态方法
Object.setPrototypeOf(Student, Person);
```

这里有两个关键继承链：

1. 实例继承链：
   Student.prototype → Person.prototype

2. 构造函数继承链（静态方法继承）：
   Student → Person

很多人只记得 prototype 继承，忽略了构造函数本身的原型链。

---

四、super 的底层机制

`super` 并不是简单的 `Parent.prototype.method.call(this)`。

它依赖于一个内部机制：

[[HomeObject]]

当方法定义在 class 内部时，会隐式绑定一个 HomeObject，用于在运行时确定“当前方法属于哪个对象”，从而正确查找父类方法。

这也是为什么下面写法不能正确使用 super：

```js
const obj = {
  method() {}
};
```

只有 class 或对象字面量简写方法才有 [[HomeObject]]。

---

五、class 的一些“语法层面增强”

虽然本质还是原型，但 class 增加了一些语义约束：

* 方法默认不可枚举
* 必须使用 new
* 自动严格模式
* 支持 static 方法
* 支持 getter / setter
* 支持私有字段（#field）

尤其是私有字段：

```js
class A {
  #x = 1;
}
```

这个已经不再是纯原型模拟可以实现的，而是引擎层面的私有槽（private slot），编译到 ES5 时通常需要 WeakMap 来模拟。

---

六、为什么说它是“语法糖”

因为：

* 实例仍然是对象
* 继承仍然是原型链
* 方法仍然挂在 prototype 上
* 构造器本质仍然是函数

class 并没有引入新的对象模型，只是让语法更接近传统面向对象语言，同时补充了一些约束与语义增强。

---

七、工程理解层面

理解 class 的底层实现非常重要，因为很多问题本质都是原型链问题：

* 方法查找路径
* instanceof 判断机制
* 静态方法继承
* super 调用行为
* this 绑定

如果只停留在 class 表层语法，很难排查继承链相关问题。

</details>

## 2. 如何使用 WeakMap 解决循环引用？ {#question-c2a29dec-432f-46eb-a149-d37278017e31}

> 难度：3 · 类型：QA

### 题目要点

WeakMap 并不是通过打破循环引用来避免内存泄漏，而是通过“弱引用 key”的机制，使缓存结构不参与对象的可达性判断。当对象在其他地方不可达时，即使存在于 WeakMap 中也会被垃圾回收，从而避免因强引用容器导致的内存滞留问题。

<details>
<summary>参考答案</summary>

这个问题的关键不在于“WeakMap 能不能断开循环引用”，而在于理解 JavaScript 的垃圾回收机制是如何判定对象是否可回收的。

在现代 JavaScript 引擎（例如 V8）中，垃圾回收采用的是“可达性分析（reachability）”，而不是简单的引用计数。也就是说，只要一个对象从根对象（全局对象、当前执行栈、闭包等）不可达，就会被回收。

因此，**单纯的循环引用并不会导致内存泄漏**。真正的问题在于：

> 某个长生命周期对象（例如全局缓存、单例、DOM 节点、事件系统）持有对短生命周期对象的强引用，导致后者始终可达，无法被回收。

WeakMap 正是用来解决这种“强引用导致无法释放”的问题。

---

一、普通 Map 为什么会造成问题

考虑一个典型场景：给 DOM 节点附加额外数据。

```js
const map = new Map();

function register(node) {
  map.set(node, { some: "data" });
}
```

这里 Map 的 key 是 DOM 节点。问题在于：

* Map 对 key 是强引用
* 只要 map 还存在
* 即使 DOM 节点从页面中删除
* 节点对象仍然被 Map 持有
* 因此不会被垃圾回收

这并不是循环引用问题，而是“长生命周期容器”强持有对象。

---

二、WeakMap 的核心机制

WeakMap 的 key 是“弱引用”。

弱引用的含义是：

* 如果对象除了 WeakMap 之外没有其他强引用
* 垃圾回收器会直接回收该对象
* 并自动移除 WeakMap 中对应的键值对

```js
const weakMap = new WeakMap();

function register(node) {
  weakMap.set(node, { some: "data" });
}
```

当 node 从 DOM 中移除且没有其他引用时：

* node 变为不可达
* GC 会回收 node
* weakMap 中对应条目自动消失

开发者不需要手动 delete。

---

三、它如何“解决循环引用”

从严格意义上讲，WeakMap 并不是用来解决对象之间的相互引用，而是解决“缓存结构导致对象无法被回收”的问题。

举一个更典型的场景：深拷贝时处理循环引用。

```js
function clone(obj, cache = new WeakMap()) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  const copy = {};
  cache.set(obj, copy);

  for (let key in obj) {
    copy[key] = clone(obj[key], cache);
  }

  return copy;
}
```

这里 WeakMap 的作用是：

* 记录已访问对象
* 防止无限递归
* 同时避免缓存结构本身阻止对象释放

如果这里使用普通 Map，那么 cache 会强持有所有遍历过的对象，即使 clone 结束之后，这些对象仍然可能因为 cache 未释放而存活。

WeakMap 则不会影响原对象的回收。

---

四、为什么 WeakMap 不能被枚举

WeakMap 不提供 size、keys、forEach 等方法。

原因在于：

* 垃圾回收发生时间不可预测
* 条目可能随时消失
* 枚举会导致语义不稳定

这是一种刻意的设计选择，用来保证弱引用语义的正确性。

---

五、本质总结

WeakMap 解决的不是“循环引用导致的内存泄漏”，因为现代 JS 并不会因循环引用泄漏。

它解决的是：强引用缓存结构，导致对象即使逻辑上已无用，仍然在 GC 可达路径中。

WeakMap 通过弱引用 key，使得缓存不影响对象生命周期，从而避免隐藏的内存滞留问题。

</details>

## 3. 如何设计模块以确保它只初始化一次？ {#question-b9a98ff7-761f-4c58-9e3e-10942ab84c04}

> 难度：3 · 类型：QA

### 题目要点

模块单次初始化依赖模块系统的实例唯一性和缓存机制；ES Module 通过规范层面的单例实例保证只执行一次；CommonJS 依赖 `require` 缓存和模块标识一致性；设计上应区分模块初始化与业务初始化，并保证初始化逻辑幂等；在多运行时或微前端场景中，需要重新定义初始化边界并引入更高层的单例管理。

<details>
<summary>参考答案</summary>

从工程和运行时的角度看，“模块只初始化一次”并不是依赖某个语法技巧，而是**通过模块加载模型、缓存机制以及初始化边界的设计共同保证的结果**。无论是在 JavaScript 层还是在更底层的运行时实现中，核心思想都是：**同一个模块标识在同一个运行时上下文中只会对应一个实例**。

在 JavaScript 层，ES Module 天然具备这一特性。模块在首次被解析和实例化时会执行一次顶层代码，之后无论被多少地方 `import`，拿到的都是同一份模块实例和同一组导出绑定。这要求模块在设计时将“初始化逻辑”放在顶层作用域，并避免把初始化动作隐藏在可被多次调用的函数中。如果初始化依赖外部输入，应当通过显式的初始化 API 或参数化工厂来控制，而不是在模块加载阶段隐式执行，从而保证模块加载本身是幂等的。

在 CommonJS 或类似动态模块系统中，只初始化一次更多依赖运行时缓存。`require` 在第一次加载模块时会执行模块函数并将 `exports` 缓存起来，后续调用直接返回缓存结果。因此，模块需要避免在导出对象之外维护“隐式全局状态”，并确保副作用发生在模块首次执行阶段。对于可能被多次 `require` 的路径差异问题，还需要保证模块标识的唯一性，例如避免同一文件被不同相对路径或软链接重复加载，否则缓存将失效，初始化会被执行多次。

在运行时或 C++ 层，模块只初始化一次通常由模块记录和状态机来保证。模块在内部会有明确的生命周期状态，例如未加载、已链接、已执行。初始化逻辑只允许在“执行”阶段触发一次，后续访问只读取已有的实例或导出表。这种设计在面对循环依赖时尤为重要，运行时需要在模块尚未完全执行完成时就暴露部分导出绑定，以避免死循环或重复初始化。

从模块设计角度，还需要刻意区分“模块初始化”和“业务初始化”。模块初始化负责创建单例资源、注册全局能力或建立底层连接，而业务初始化应通过显式调用触发。这样可以避免因热更新、测试环境或多入口场景导致的重复副作用。同时，初始化过程应具备幂等性，即使被意外触发，也不会破坏系统状态。

在更复杂的场景下，例如微前端或多运行时并存，单次初始化的边界需要被重新定义。模块是否只初始化一次，取决于运行时上下文而非代码本身。此时往往需要在更高层引入全局注册表或宿主级别的单例管理，而不是仅依赖模块系统本身。

总体而言，模块只初始化一次并不是“写法问题”，而是对模块系统工作方式的理解和对副作用边界的约束。

</details>

## 4. 如何使用 WeakMap 封装私有属性？ {#question-282d0311-3b51-42eb-a41a-2d264e16a732}

> 难度：2 · 类型：QA

### 题目要点

* `WeakMap` 可将私有属性绑定到类实例，外部无法访问，天然封装；
* 利用弱引用，能自动随实例被销毁而释放内存；
* 是一种兼容性好、安全性高的私有数据封装方式；
* 在需要封装对象状态又不引入内存风险时非常实用。

<details>
<summary>参考答案</summary>

使用 `WeakMap` 封装私有属性是一种经典的“闭包 + 弱引用”技巧。它的核心目的是为每个对象实例存储一份外部不可访问的私有数据，同时不引发内存泄漏。这种方式比传统的前缀 `_`、或者 `Symbol` 命名更安全，并且不需要使用 ES2022 的 `#私有字段` 语法，在旧环境中依然适用。

### 一、基本原理

* 创建一个 `WeakMap` 实例 `privateData`；
* 每个类实例作为 `WeakMap` 的键，对应一个私有数据对象；
* 外部无法直接访问 `privateData`，因为它在模块作用域内，无法被引用；
* 当对象实例被销毁时，对应的私有数据也会被自动释放。

### 二、示例代码：封装私有属性

```js
const privateData = new WeakMap();

class Person {
  constructor(name, age) {
    // 初始化私有数据
    privateData.set(this, { name, age });
  }

  getName() {
    return privateData.get(this).name;
  }

  setName(newName) {
    privateData.get(this).name = newName;
  }

  getAge() {
    return privateData.get(this).age;
  }
}
```

#### 使用：

```js
const p = new Person('Alice', 30);
console.log(p.getName()); // Alice
p.setName('Bob');
console.log(p.getName()); // Bob

console.log(p.name); // undefined，外部无法访问
```

### 三、优势

1. **私有性强**
   外部无法通过任何方式访问 `privateData`，除非获得对它本身的引用。

2. **不污染实例属性**
   `this` 上没有暴露任何私有字段。

3. **内存安全**
   使用 `WeakMap` 的弱引用特性，当类实例没有外部引用时，相关私有数据会自动被 GC 回收。

### 四、应用场景

* 实现类中的私有状态或缓存；
* 在框架或 SDK 中构建对外不可暴露的状态；
* 实现封装性更强的库组件（如 DOM 组件内部状态管理）；
* 给第三方对象动态挂载私有数据，不影响其原型结构。

### 五、局限与注意事项

* 不能在类的静态方法中直接访问 `privateData`，因为没有 `this` 实例；
* 访问和修改私有属性需要显式使用 `get()` / `set()`，不如 `#私有字段` 语法直观；
* 仅适合类级别的封装，不适合导出后希望每个模块共享的私有数据（这反而可以用 `Map`）。

</details>

## 5. 为什么 WeakMap 的键不能是基本类型？ {#question-9ba8772e-64a2-4472-be3b-21caa3410679}

> 难度：3 · 类型：QA

### 题目要点

* `WeakMap` 的键必须是对象，这是因为它基于**弱引用机制**设计；
* 基本类型没有生命周期、不可被 GC，因此无法参与“弱引用”；
* 允许基本类型会破坏 `WeakMap` 的语义完整性与 GC 安全性；
* 本质上，`WeakMap` 是为了解决“对象缓存但不泄漏”问题，因此只能服务于对象类型键。

<details>
<summary>参考答案</summary>

`WeakMap` 的键**只能是对象**，不能是基本类型（如字符串、数字、布尔值、`null`、`undefined`、`Symbol`）。这个设计并不是随意设定的，而是与它的**核心设计目的：弱引用与垃圾回收行为**密切相关。

### 一、WeakMap 的核心目标是**弱引用**

在 `WeakMap` 中：

* 对象作为键时，`WeakMap` 对该对象是**弱引用（weak reference）**；
* 也就是说，它**不会阻止该对象被垃圾回收**；
* 当对象没有任何强引用时，GC 可以随时清理它，同时 `WeakMap` 也会自动移除该条目。

这正是用来避免内存泄漏的核心能力。

### 二、为什么**不能是基本类型**？

#### 原因 1：基本类型不是对象，没有内存标识可被“追踪”

基本类型是按值存储的，没有独立的“引用”或“地址”：

```js
const str = 'hello';
const num = 123;
```

这些值在内存中是立即分配、不可变的，不具有“生命周期”概念，不能被垃圾回收追踪。

弱引用机制必须依赖“对象的生命周期”，否则无法判断是否该释放引用。

#### 原因 2：弱引用语义在基本类型上没有意义

弱引用的本质是“**在不打扰 GC 的前提下引用某个对象**”。但基本类型的值不会参与 GC，不存在被释放的可能，也就无法“弱引用”。

例如：

```js
const wm = new WeakMap();
wm.set('key', 123); // 报错
```

在这里，`'key'` 是字符串，不可能被 GC，“弱引用”对它没有任何效果，因此在语义上是错误的。

#### 原因 3：安全性与一致性考虑

如果允许基本类型作为键，就必须像 `Map` 那样使用强引用保存它们，但这将打破 `WeakMap` 的设计目标：**不可枚举 + 不阻止回收 + 无法观测行为**。

一旦加入强引用的键，整个 `WeakMap` 的行为就变得不确定了，既不能观察其变化，又无法保证是否释放，设计上不再自洽。

### 三、类比 `Map` 与 `WeakMap` 的行为

| 特性     | `Map`                     | `WeakMap`      |
| ------ | ------------------------- | -------------- |
| 键类型    | 任意类型（对象或基本类型）             | 只能是对象          |
| 引用类型键  | 强引用                       | 弱引用（不会阻止 GC）   |
| 可枚举/遍历 | 支持 `.keys()`、`.forEach()` | 不可遍历           |
| 可清空/管理 | 支持 `.clear()`             | 不支持，依赖 GC 自动清除 |

</details>

## 6. Map 的键是引用类型时，如何防止内存泄漏？ {#question-248830a2-ac8d-4321-8d65-2ab4566f44aa}

> 难度：3 · 类型：QA

### 题目要点

* `Map` 对引用类型键是强引用，可能导致内存泄漏；
* 使用 `WeakMap` 替代 `Map` 能在对象无外部引用时自动释放；
* `WeakMap` 不可遍历，有使用上的限制，适合做“缓存”或“映射”用途；
* 内存泄漏的本质是“无效引用被意外保留”，选择合适的数据结构是避免此类问题的关键。

<details>
<summary>参考答案</summary>

当 `Map` 的键是引用类型（如对象、数组、函数）时，如果不小心管理，会导致**内存泄漏**，因为：

* `Map` 对键是**强引用**，只要该键存在于 `Map` 中，它就不会被垃圾回收；
* 即使代码中不再显式使用这个对象，只要它还在 `Map` 里，它的内存就无法释放。

### 一、问题举例

```js
const map = new Map();

function cacheUser(user) {
  map.set(user, computeHeavyStuff(user));
}

// 某个 user 对象，即使业务中已经不再用它，但 map 中还持有它
// → user 永远不会被 GC 回收，内存常驻
```

这在需要缓存大量对象时尤为危险，比如响应缓存、页面数据缓存等场景中，可能在用户无感知的情况下持续增加内存占用。

### 二、解决方案：使用 `WeakMap`

#### 1. 什么是 `WeakMap`

`WeakMap` 是专为解决上述问题设计的数据结构：

* 它的键**只能是对象**（引用类型）；
* 对键是**弱引用**，不阻止垃圾回收；
* 如果没有其他强引用指向某个键对象，它会被 GC 回收，`WeakMap` 也会自动清理对应的键值对。

#### 2. 示例替换

```js
const cache = new WeakMap();

function cacheUser(user) {
  if (!cache.has(user)) {
    cache.set(user, computeHeavyStuff(user));
  }
  return cache.get(user);
}
```

当外部不再引用 `user`，这个对象就会被回收，`WeakMap` 不会阻止 GC。

### 三、`WeakMap` 的使用限制

* 无法遍历（没有 `.keys()`、`.values()`、`.entries()`）；
* 不能清空（没有 `.clear()` 方法）；
* 无法观察删除（不会触发事件）；
* 键必须是对象，不能是原始值。

这些限制是设计上的权衡，为的是让它成为**GC 友好**的结构，**不干扰垃圾回收算法**。

### 四、何时用 `WeakMap` 替代 `Map`

**适用场景：**

* 键为对象；
* 不需要枚举所有键；
* 缓存、映射、私有字段存储等用途；
* 期望自动释放内存的临时结构。

**不适用：**

* 需要遍历所有键值；
* 键为原始值；
* 需要清空缓存的场景（可考虑封装手动过期逻辑的 Map 替代方案）。

</details>

## 7. 怎么理解 ESM 中的 export * from "a.js" 这种写法？ {#question-630b7016-1eb0-4bc9-b35b-a74aefc74c65}

> 难度：2 · 类型：QA

### 题目要点

- `export * from 'a.js'` 是将 `a.js` 的所有**命名导出**重新导出；
- 常用于统一封装模块接口，提升模块复用性；
- 不导出默认值，若需要导出默认值，需要显式写 `export { default } from 'a.js'`。

<details>
<summary>参考答案</summary>

在 ESM（ES Modules）中，`export * from "a.js"` 的作用是：**将 `a.js` 中的所有命名导出（`named exports`）重新导出（re-export）**，供当前模块的使用者使用。

---

### 等价理解：

```js
// 假设 a.js 中有：
export const foo = 'foo';
export const bar = 'bar';

// 那么在 b.js 中写：
export * from './a.js';
// 相当于重新导出了 foo 和 bar

// 使用时
import { foo, bar } from './b.js'; // 可以正常使用
```

---

### 注意事项：
1. 不会导出 `a.js` 中的默认导出（`export default`）。
2. 如果当前模块中已经存在相同名称的导出，会发生冲突，抛出错误。
3. 它是 **重新导出**，并不会在当前模块声明变量或函数。

---

### 应用场景：

- **统一出口模块（barrel 文件）**：

```js
// utils/index.js
export * from './math.js';
export * from './string.js';
export * from './date.js';

// 在其他地方可以统一引入
import { formatDate, sum } from './utils';
```

</details>

## 8. 如何理解 ES6 模块化方案的缓存机制？ {#question-7cdbad60-69cf-4534-aac1-2413f9fe77a1}

> 难度：3 · 类型：QA

### 题目要点

- **ES6 模块化的缓存机制**可以显著提升性能，因为模块的代码只会被执行一次，之后的导入将直接使用缓存结果。
- **缓存的共享特性**：模块的导出内容（如对象、函数）会被多个地方共享，这在某些情况下可能导致意外的副作用。
- **与其他模块化方案对比**：与 CommonJS 和 AMD 等传统模块化方案相比，ES6 的模块化方案是静态的，更具一致性，且具有更好的性能优势。

总的来说，ES6 的模块化方案的缓存机制帮助我们避免了多次执行同一个模块的代码，提高了性能和效率，同时确保了模块状态的一致性。在开发时，需要注意缓存带来的状态共享特性，确保模块的行为符合预期。

<details>
<summary>参考答案</summary>

ES6 引入了模块化方案，即通过 `import` 和 `export` 语法来实现模块的导入和导出。与之前的 CommonJS 和 AMD 模块化方案不同，ES6 模块化具有一个 **缓存机制**，它会在模块第一次被加载时缓存该模块，并且在后续的导入中返回该缓存结果，而不是重新执行模块代码。这个特性对于性能优化、避免重复执行和确保模块的一致性具有重要意义。

### 1. **ES6 模块的加载机制**

当一个 ES6 模块首次被导入时，浏览器或运行环境会加载该模块并执行其代码。模块的加载和执行遵循以下步骤：

- **第一次加载**：当模块第一次被导入时，模块的代码会被执行一次，导出的内容会被返回。
- **缓存模块**：一旦模块执行完毕，模块的结果（即导出的内容）会被缓存。这个缓存是以模块的文件路径为键存储的，因此每个模块文件只会被执行一次。
- **后续导入**：之后再次导入相同的模块时，模块不会被重新执行，而是直接返回缓存的结果。

### 2. **缓存机制的实现方式**

ES6 模块的缓存是基于模块的 **标识符（文件路径）** 进行管理的。具体来说：

- **模块对象**：每个模块的导出内容都会被保存在一个 **模块对象** 中。这个对象包含了所有导出的成员，并且会在模块第一次加载时进行计算。
- **缓存存储**：当模块第一次加载时，它的导出结果会被存储在一个全局的缓存对象中（通常由 JavaScript 引擎负责管理）。在后续的导入中，模块的执行会被跳过，直接从缓存中获取结果。

### 3. **缓存的优势和特性**

- **性能优化**：由于 ES6 模块的缓存机制，模块的代码只会执行一次，这大大减少了模块重复加载和执行的性能开销。尤其是在大型应用中，多个模块间可能相互依赖，如果每次都重新执行模块的代码，效率会极低。缓存机制保证了模块的加载是高效的。

- **一致性**：缓存机制确保了在整个应用中导入相同模块的多次引用是相同的，模块内部的状态也会保持一致。例如，模块内部的变量会在整个生命周期中保持不变。

### 4. **模块缓存的影响**

- **共享状态**：由于缓存是基于模块的路径和标识符的，模块的导出值会在整个应用的生命周期中保持一致。这意味着模块中的状态（例如导出的对象或函数）会被共享，其他导入该模块的地方将能够访问到同一份状态。

  例如，假设一个模块导出了一个对象，并且该对象的属性在模块中被修改：

  ```javascript
  // counter.js
  export const counter = { value: 0 };
  export function increment() {
    counter.value += 1;
  }
  ```

  当模块被导入并修改 `counter.value` 时，其他地方导入 `counter.js` 时，都会看到同样修改后的值：

  ```javascript
  import { counter, increment } from './counter.js';

  increment(); // counter.value === 1

  import { counter as counter2 } from './counter.js';
  console.log(counter2.value); // 输出 1
  ```

- **模块的静态性**：模块一旦被导入并缓存，它的导出内容不会再变化。因此，任何导入该模块的地方都会看到相同的导出结果。如果想要动态更新模块的导出内容，就需要依赖其他方式（如重新加载模块或使用不同的状态管理策略）。

### 5. **与 CommonJS 和 AMD 的对比**

- **CommonJS**：CommonJS 的模块是同步加载的，模块是按需执行的，每次 `require` 都会重新执行模块代码，并返回模块的导出内容。CommonJS 模块的缓存机制也有，但它与 ES6 的静态分析和执行机制不同，CommonJS 更依赖于运行时的加载和执行。

- **AMD**：AMD 的模块系统通常用于浏览器端，它支持异步加载，适用于动态加载模块。AMD 也会进行缓存，但其工作原理和 ES6 的静态模块导入有所不同，特别是在模块的依赖和异步加载方面。

### 6. **如何避免缓存的问题？**

在某些情况下，可能需要避免 ES6 模块缓存机制带来的问题，尤其是当你需要模块具有不同状态时。可以通过以下几种方式来处理：

- **重新加载模块**：如果需要重新加载一个模块，可以通过一些手段来强制浏览器或环境重新加载模块（如在 Webpack 中使用 HMR，或者在 Node.js 中使用 `delete require.cache`）。
- **动态模块加载**：对于需要动态加载且不希望缓存的场景，可以使用 `import()` 动态导入模块，这样每次导入都会重新执行模块的代码。

</details>

## 9. JS 有哪些迭代器，该如何使用？ {#question-f433ce42-7095-4c20-8461-dc71f39bea39}

> 难度：4 · 类型：QA

### 题目要点

JavaScript 提供了多种迭代器，如 for...of 循环、数组和集合的内置迭代器方法、自定义迭代器和生成器。它们可以用于遍历不同的数据结构，使得数据处理更加灵活和高效。

<details>
<summary>参考答案</summary>

## 迭代器分类
在 JavaScript 中，有三种类型的迭代器：

- **Array Iterator（数组迭代器）**：通过对数组进行迭代以访问其元素。

- **String Iterator（字符串迭代器）**：通过对字符串进行迭代以访问其字符。

- **Map Iterator（映射迭代器）和 Set Iterator（集合迭代器）**：通过对 Map 和 Set 数据结构进行迭代以访问其键和值。

此外，在 ES6 中，我们还可以使用自定义迭代器来迭代对象中的元素。我们可以使用 Symbol.iterator 方法来创建自定义迭代器，该方法返回一个具有 next 方法的迭代器对象。

另外，`Generator` 函数可以看作是一种特殊的迭代器，它能够暂停执行和恢复执行，使得我们可以通过控制迭代器的执行来生成序列。

## Array Iterator（数组迭代器）有哪些迭代方法？

Array Iterator（数组迭代器）是针对 JavaScript 数组的迭代器，它可以通过 `Array.prototype[Symbol.iterator]()` 方法来获取。

获取到数组迭代器后，我们可以使用以下迭代方法：

`next()`: 返回一个包含 value 和 done 属性的对象，value 表示下一个元素的值，done 表示是否迭代结束。

`return()`: 用于提前终止迭代，并返回给定的值。

`throw()`: 用于向迭代器抛出一个异常。

下面是一个使用迭代器的示例代码：
```js
const arr = ['a', 'b', 'c'];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: 'b', done: false }
console.log(iterator.next()); // { value: 'c', done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

除了以上的迭代方法，还可以通过 for...of 语句来使用迭代器，如下所示：
```js
const arr = ['a', 'b', 'c'];
for (const item of arr) {
  console.log(item);
}
// output:
// a
// b
// c
```

另外，数组迭代器除了上述的迭代方法，还可以使用 forEach()、map()、filter()、reduce() 等常见数组方法进行迭代操作；

## String Iterator（字符串迭代器） 有哪些迭代方法？
`String Iterator` 是 ES6 引入的一种迭代器，可以用于遍历字符串。String Iterator 没有自己的迭代方法，但可以使用通用的迭代方法。以下是 String Iterator 可以使用的迭代方法：

`next()`：返回迭代器的下一个值，格式为 {value: string, done: boolean}。
`Symbol.iterator`：返回一个迭代器对象，可以使用 for...of 循环来遍历字符串。

示例代码如下：
```js
const str = "hello";
const strIterator = str[Symbol.iterator]();

console.log(strIterator.next()); // { value: 'h', done: false }
console.log(strIterator.next()); // { value: 'e', done: false }
console.log(strIterator.next()); // { value: 'l', done: false }
console.log(strIterator.next()); // { value: 'l', done: false }
console.log(strIterator.next()); // { value: 'o', done: false }
console.log(strIterator.next()); // { value: undefined, done: true }

for (let char of str) {
  console.log(char);
}
// Output:
// h
// e
// l
// l
// o
```

## Map Iterator（映射迭代器）和 Set Iterator（集合迭代器）有哪些迭代方法？

**Map Iterator 和 Set Iterator 都有以下迭代方法：**
`next()`: 返回迭代器中下一个元素的对象，对象包含 value 和 done 两个属性。value 属性是当前元素的值，done 属性表示迭代器是否已经迭代完成。
`Symbol.iterator`: 返回迭代器本身，使其可被 for...of 循环使用。

**Map Iterator 还有以下方法：**
`entries()`: 返回一个新的迭代器对象，该迭代器对象的元素是 [key, value] 数组。
`keys()`: 返回一个新的迭代器对象，该迭代器对象的元素是 Map 中的键名。
`values()`: 返回一个新的迭代器对象，该迭代器对象的元素是 Map 中的键值。

**Set Iterator 还有以下方法：**
`entries()`: 返回一个新的迭代器对象，该迭代器对象的元素是 [value, value] 数组。
`keys()`: 返回一个新的迭代器对象，该迭代器对象的元素是 Set 中的值。
`values()`: 返回一个新的迭代器对象，该迭代器对象的元素是 Set 中的值。

**Map Iterator 使用举例**
```js
const myMap = new Map();
myMap.set("key1", "value1");
myMap.set("key2", "value2");
myMap.set("key3", "value3");

const mapIterator = myMap.entries();

console.log(mapIterator.next().value); // ["key1", "value1"]
console.log(mapIterator.next().value); // ["key2", "value2"]
console.log(mapIterator.next().value); // ["key3", "value3"]
console.log(mapIterator.next().value); // undefined
```

**Set Iterator 使用举例**
```js
const mySet = new Set(['apple', 'banana', 'orange']);

// 使用 for...of 循环遍历 Set
for (const item of mySet) {
  console.log(item);
}

// 使用 Set 迭代器手动遍历 Set
const setIterator = mySet.values();
let next = setIterator.next();
while (!next.done) {
  console.log(next.value);
  next = setIterator.next();
}
```

</details>

## 10. 如何使对象 iterable 化， 使其可以支持 for...of 迭代 {#question-eca441f6-10bd-41e4-b154-a409d43ad44b}

> 难度：3.5 · 类型：QA

### 题目要点

通过在对象中实现 `Symbol.iterator` 方法，可以使对象变得可迭代，从而支持 `for...of` 循环。`Symbol.iterator` 方法返回一个迭代器对象，该对象需要实现 `next` 方法，返回 `{ value, done }` 结构。生成器函数是简化迭代器实现的一种便利方式。

<details>
<summary>参考答案</summary>

要使对象支持 `for...of` 迭代，你需要使该对象具有符合迭代协议的迭代器。实现这一点的方法是为对象定义一个名为 `Symbol.iterator` 的方法。这个方法应该返回一个迭代器对象，迭代器对象必须有一个 `next` 方法，该方法返回一个对象，其中包含 `value` 和 `done` 属性。

以下是实现过程的步骤和示例代码：

### **1. 实现 `Symbol.iterator` 方法**

**1.1 定义迭代器对象**

迭代器对象需要实现 `next` 方法，`next` 方法返回一个对象，包含两个属性：

- `value`：当前的值。
- `done`：一个布尔值，指示迭代是否完成。

**1.2 在对象中实现 `Symbol.iterator`**

将 `Symbol.iterator` 方法定义在对象上，这样对象就变成了可迭代的。

### **示例代码**

**示例 1: 基本对象**

```javascript
const myObject = {
  items: ['a', 'b', 'c'],
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

// 使用 for...of 进行迭代
for (const item of myObject) {
  console.log(item); // 'a', 'b', 'c'
}
```

**示例 2: 自定义对象**

```javascript
function createIterableObject() {
  return {
    start: 1,
    end: 5,
    [Symbol.iterator]() {
      let current = this.start;
      const end = this.end;
      return {
        next() {
          if (current <= end) {
            return { value: current++, done: false };
          } else {
            return { done: true };
          }
        }
      };
    }
  };
}

const iterableObject = createIterableObject();

// 使用 for...of 进行迭代
for (const num of iterableObject) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

### **3. 注意事项**

- **生成器**：生成器函数（`function*`）可以更方便地创建可迭代对象，它自动实现了 `Symbol.iterator` 方法，并简化了迭代器的代码。

**示例 3: 使用生成器**

```javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const iterableObject = range(1, 5);

// 使用 for...of 进行迭代
for (const num of iterableObject) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

</details>

## 11. 详细讲一下 Symbol 数据类型特征与实际使用案例？ {#question-675f2f01-6304-49e6-aacc-71d754fcb7d4}

> 难度：3 · 类型：QA

### 题目要点

`Symbol` 提供了一种创建唯一标识符的方法，解决了对象属性名冲突的问题，并可用于定义特定的对象行为。它具有唯一性、不可变性和隐私性，在现代 JavaScript 编程中，用于增强对象和类的功能，定义和处理内置对象的特殊行为，以及在应用中创建更健壮的代码。

<details>
<summary>参考答案</summary>

`Symbol` 是 ES6 引入的一种基本数据类型，它用于创建唯一且不可变的值。它主要用于解决对象属性的命名冲突问题。以下是 `Symbol` 的主要特征和实际使用案例：

### **1. 特征**

**1.1 唯一性**

每个 `Symbol` 值都是唯一的，即使它们具有相同的描述。两个不同的 `Symbol` 对象即使描述相同，也不会相等。

```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');

console.log(sym1 === sym2); // false
```

**1.2 不可变性**

`Symbol` 的值是不可变的，一旦创建，就不能改变。

**1.3 隐私性**

`Symbol` 属性不容易与其他属性冲突，因为每个 `Symbol` 都是唯一的。它们不会被 `for...in` 循环、`Object.keys()` 或 `JSON.stringify()` 处理，但可以通过 `Object.getOwnPropertySymbols()` 获取。

### **2. 创建 Symbol**

使用 `Symbol()` 函数创建 Symbol：

```javascript
const sym = Symbol('description');
console.log(sym); // Symbol(description)
```

### **3. 实际使用案例**

**3.1 用作对象属性的唯一标识符**

`Symbol` 可以用作对象的属性键，避免属性名冲突。

```javascript
const mySymbol = Symbol('uniqueProperty');

const obj = {
  [mySymbol]: 'value'
};

console.log(obj[mySymbol]); // 'value'
```

**3.2 定义私有对象属性**

使用 `Symbol` 可以定义对象的“私有”属性，这些属性不会被意外覆盖或枚举到。

```javascript
const privateProp = Symbol('private');

class MyClass {
  constructor(value) {
    this[privateProp] = value;
  }

  getPrivate() {
    return this[privateProp];
  }
}

const instance = new MyClass('secret');
console.log(instance.getPrivate()); // 'secret'
console.log(instance[privateProp]); // 'secret' (if you have the Symbol reference)
```

**3.3 定义和使用内置对象的符号属性**

JavaScript 内置对象（如 `Object`, `Array`, `String` 等）有一些 Symbol 属性，用于定义特定行为或协议。

- **`Symbol.iterator`**：定义对象的默认迭代器，用于 `for...of` 循环。

```javascript
const iterable = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
};

for (const value of iterable) {
  console.log(value); // 1, 2, 3
}
```

- **`Symbol.toStringTag`**：定义对象的默认字符串表示（`Object.prototype.toString`）。

```javascript
const obj = {
  [Symbol.toStringTag]: 'MyObject'
};

console.log(Object.prototype.toString.call(obj)); // [object MyObject]
```

- **`Symbol.hasInstance`**：自定义 `instanceof` 行为。

```javascript
class MyClass {
  static [Symbol.hasInstance](instance) {
    return instance instanceof Array;
  }
}

console.log([] instanceof MyClass); // true
console.log({} instanceof MyClass); // false
```

- **`Symbol.toPrimitive`**：自定义对象的原始值转换行为。

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return 'string representation';
    if (hint === 'number') return 42;
    return 'default representation';
  }
};

console.log(String(obj)); // 'string representation'
console.log(Number(obj)); // 42
console.log(+obj + 1); // 43
```

### **4. 组合使用**

**4.1 扩展对象的行为**

`Symbol` 还可以与其他 ES6 特性组合使用，例如 Proxy 和 Reflect API 来扩展对象行为。

**示例代码**：

```javascript
const handler = {
  get(target, prop, receiver) {
    if (prop === Symbol.toStringTag) {
      return 'CustomObject';
    }
    return Reflect.get(target, prop, receiver);
  }
};

const proxy = new Proxy({}, handler);
console.log(Object.prototype.toString.call(proxy)); // [object CustomObject]
```

</details>

## 12. ESM 与 CJS 的差异有哪些？ {#question-2e201752-ecd3-4420-9d6e-df58b43e25ee}

> 难度：2 · 类型：QA

### 题目要点

- **ESM** 是现代 JavaScript 的模块系统，具有静态分析、异步加载等优势，适用于现代前端和 Node.js 环境。
- **CJS** 是 Node.js 的传统模块系统，支持动态加载和同步加载，适用于老旧的 Node.js 项目。

<details>
<summary>参考答案</summary>

ECMAScript Modules（ESM）和 CommonJS（CJS）是 JavaScript 中两种主要的模块系统，它们各有特点和差异。

### **1. 语法**

- **ESM**（ECMAScript Modules）：
  - **导入**：使用 `import` 语法
    ```javascript
    import { foo } from './module.js';
    import * as bar from './module.js';
    import defaultExport from './module.js';
    ```
  - **导出**：使用 `export` 语法
    ```javascript
    export const foo = 42;
    export function bar() { ... }
    export default function() { ... }
    ```

- **CJS**（CommonJS）：
  - **导入**：使用 `require` 语法
    ```javascript
    const foo = require('./module.js').foo;
    const bar = require('./module.js');
    ```
  - **导出**：使用 `module.exports` 和 `exports`
    ```javascript
    module.exports = {
      foo: 42,
      bar: function() { ... }
    };
    // 或者
    exports.foo = 42;
    exports.bar = function() { ... };
    ```

### **2. 模块加载方式**

- **ESM**：
  - **静态**：模块加载在编译时确定，可以进行静态分析，支持树摇优化（tree-shaking）。
  - **异步**：支持异步加载（动态导入），可以使用 `import()` 来按需加载模块。

- **CJS**：
  - **动态**：模块加载在运行时进行，`require` 可以在任何地方调用，包括条件语句中。
  - **同步**：`require` 是同步的，所有模块在程序开始时加载。

### **3. 文件扩展名**

- **ESM**：
  - 通常使用 `.js` 文件扩展名，默认情况下会使用 `ESM` 语法，但也可以使用 `.mjs` 扩展名明确标识为 ESM 模块。

- **CJS**：
  - 通常使用 `.js` 文件扩展名，模块系统默认为 `CJS`。使用 `.cjs` 扩展名可以明确标识为 CJS 模块。

### **4. 模块解析**

- **ESM**：
  - **相对路径**：需要提供完整的路径（包括文件扩展名），例如 `import { foo } from './module.js';`
  - **绝对路径**：支持 URL 作为模块标识符。

- **CJS**：
  - **相对路径**：可以省略文件扩展名，例如 `const foo = require('./module');`，Node.js 会尝试自动解析 `.js`、`.json`、`.node` 等扩展名。

### **5. 模块缓存**

- **ESM**：
  - 模块加载结果会被缓存，后续的导入会从缓存中读取。

- **CJS**：
  - 模块首次 `require` 时加载，后续的 `require` 会使用缓存的结果。

### **6. 默认导出**

- **ESM**：
  - 支持默认导出，可以导出一个默认值和多个命名值。

- **CJS**：
  - `module.exports` 可以导出一个对象或函数，不能直接导出多个命名值。

### **7. `this` 绑定**

- **ESM**：
  - 在模块代码中，`this` 是 `undefined`。模块代码不在函数上下文中运行，而是在模块上下文中运行。

- **CJS**：
  - 在模块代码中，`this` 指向 `module.exports`，即模块的导出对象。

### **示例对比**

**ESM 示例：**

```javascript
// module.js
export const foo = 42;
export default function() { ... }

// main.js
import { foo } from './module.js';
import defaultExport from './module.js';
```

**CJS 示例：**

```javascript
// module.js
const foo = 42;
module.exports = function() { ... };
module.exports.foo = foo;

// main.js
const module = require('./module.js');
const foo = module.foo;
const defaultExport = module;
```

</details>

## 13. promise.race、promise.all、promise.allSettled 有哪些区别？ {#question-a0a7f06f-8aa3-4408-8a40-87c33bd3608f}

> 难度：2 · 类型：QA

### 题目要点

- **`Promise.all`**：等待所有 `Promise` 对象都成功，或第一个失败的 `Promise`。
- **`Promise.race`**：返回第一个解决或拒绝的 `Promise` 的结果。
- **`Promise.allSettled`**：等待所有 `Promise` 对象都完成，无论成功还是失败，返回每个 `Promise` 的状态和结果。

<details>
<summary>参考答案</summary>

`Promise.race`、`Promise.all` 和 `Promise.allSettled` 都是处理多个 `Promise` 对象的静态方法，它们的主要区别在于处理 `Promise` 的方式和返回结果。下面是这三者的详细比较：

### **1. `Promise.all`**

- **功能**：接受一个 `Promise` 对象的可迭代对象（通常是数组），并返回一个新的 `Promise` 对象。这个新的 `Promise` 对象在所有输入的 `Promise` 对象都成功时成功，并返回一个包含所有成功 `Promise` 结果的数组。如果其中任何一个 `Promise` 失败，则立即失败，并返回第一个失败的 `Promise` 的拒绝理由。

- **返回值**：一个 `Promise` 对象。成功时，返回一个数组，其中包含每个输入 `Promise` 对象的结果；失败时，返回第一个失败的 `Promise` 的拒绝原因。

- **使用示例**：
  ```javascript
  Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ]).then(results => {
    console.log(results); // [1, 2, 3]
  }).catch(error => {
    console.error(error);
  });
  ```

### **2. `Promise.race`**

- **功能**：接受一个 `Promise` 对象的可迭代对象（通常是数组），并返回一个新的 `Promise` 对象。这个新的 `Promise` 对象将会在第一个输入的 `Promise` 对象解决或拒绝时解决或拒绝，而不管其他 `Promise` 对象的状态。

- **返回值**：一个 `Promise` 对象。它的状态由第一个解决或拒绝的 `Promise` 决定。

- **使用示例**：
  ```javascript
  Promise.race([
    new Promise((resolve) => setTimeout(resolve, 500, 'first')),
    new Promise((resolve) => setTimeout(resolve, 100, 'second'))
  ]).then(result => {
    console.log(result); // 'second' (因为它首先解决)
  });
  ```

### **3. `Promise.allSettled`**

- **功能**：接受一个 `Promise` 对象的可迭代对象（通常是数组），并返回一个新的 `Promise` 对象。这个新的 `Promise` 对象在所有输入的 `Promise` 对象都完成时解决（无论成功还是失败），并返回一个数组，其中每个元素是一个对象，描述了对应 `Promise` 对象的结果或拒绝原因。

- **返回值**：一个 `Promise` 对象。成功时，返回一个包含每个输入 `Promise` 对象的结果的数组，每个结果对象有两个属性：`status`（"fulfilled" 或 "rejected"）和 `value`（如果成功）或 `reason`（如果失败）。

- **使用示例**：
  ```javascript
  Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(new Error('Failed')),
    Promise.resolve(3)
  ]).then(results => {
    console.log(results);
    /*
    [
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: Error('Failed') },
      { status: 'fulfilled', value: 3 }
    ]
    */
  });
  ```

</details>

## 14. es5 和 es6 使用 new 关键字实例化对象的流程是一样的吗？ {#question-490221f4-ebf9-4d40-a2d2-254ab02c70f1}

> 难度：1 · 类型：QA

### 题目要点

虽然 `ES5` 和 `ES6` 在实例化对象时的基本流程相似，但 `ES6` 引入的 `class` 语法为构造函数提供了更直观、更强大的功能，使得代码更易于理解和维护。

<details>
<summary>参考答案</summary>

`ES5` 和 `ES6` 在使用 `new` 关键字实例化对象时，整体流程类似，但在细节上有一些关键区别。下面是详细的对比：

### **1. `ES5` 的 `new` 实例化流程**

1. **创建新对象**：`new` 关键字会创建一个新对象。
2. **设置原型**：新对象的 `[[Prototype]]` 被设置为构造函数的 `prototype` 属性。
3. **绑定 `this`**：构造函数内部的 `this` 被绑定到新创建的对象上。
4. **执行构造函数**：构造函数会被执行，其内部代码会初始化新对象的属性。
5. **返回对象**：如果构造函数返回一个对象，则返回这个对象；如果返回的是基本类型（如 `string`、`number`、`boolean`），则返回新创建的对象。

#### **示例**

```javascript
function Person(name) {
  this.name = name;
}

var person = new Person('Alice');
console.log(person.name); // Alice
```

### **2. `ES6` 的 `new` 实例化流程**

`ES6` 中的 `class` 语法是基于 `ES5` 的构造函数语法封装的，`new` 的基本流程与 `ES5` 类似，但有一些新特性和要求：

1. **创建新对象**：`new` 关键字会创建一个新对象。
2. **设置原型**：新对象的 `[[Prototype]]` 被设置为类的 `prototype` 属性。
3. **绑定 `this`**：类的构造函数中的 `this` 被绑定到新创建的对象上。
4. **执行构造函数**：构造函数会被执行，用于初始化新对象的属性。
5. **返回对象**：如果构造函数返回一个对象，则返回这个对象；如果构造函数返回的是基本类型，返回新创建的对象。

#### **示例**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

const person = new Person('Alice');
console.log(person.name); // Alice
```

### **主要区别**

1. **语法**：
   - `ES5` 使用函数和 `prototype` 来定义构造函数。
   - `ES6` 引入了 `class` 语法，使得构造函数的定义更简洁和直观。

2. **继承**：
   - `ES5` 使用原型链和构造函数实现继承。
   - `ES6` 使用 `extends` 关键字实现继承，语法更清晰。

3. **静态方法**：
   - `ES5` 中静态方法是直接定义在构造函数上。
   - `ES6` `class` 语法支持使用 `static` 关键字定义静态方法。

4. **类和构造函数**：
   - `ES6` 中的类构造函数必须使用 `new` 调用，否则会抛出错误。而 `ES5` 中的构造函数如果没有使用 `new` 调用，也不会抛出错误（`this` 可能会不正确）。

</details>

## 15. Promise then 第二个参数和 Promise.catch 的区别是什么? {#question-c5f7ff93-7de3-4ebd-bfaa-bcaeebcd7f56}

> 难度：2 · 类型：QA

### 题目要点

- **功能**：`then` 的第二个参数和 `catch` 都用于处理拒绝的情况，但 `catch` 更专注于处理错误，通常用在链式调用中来捕获和处理所有错误。
- **链式调用**：`catch` 更常用在链式调用中，能够捕获前面 `then` 链中的任何错误，而 `then` 的第二个参数只能处理 `then` 本身的错误。
- **可读性**：`catch` 提高了代码的可读性，使得错误处理逻辑更加集中，特别是在处理多个链式操作时。

<details>
<summary>参考答案</summary>

`Promise.then` 的第二个参数和 `Promise.catch` 都用于处理 Promise 的拒绝（rejected）情况，但它们的使用方式和作用有所不同。以下是它们的区别：

### **1. `Promise.then` 的第二个参数**

- **作用**：用于处理 Promise 被拒绝（rejected）时的情况。
- **用法**：
  ```javascript
  promise.then(onFulfilled, onRejected);
  ```
  - `onFulfilled`：可选的回调函数，Promise 被解决（fulfilled）时调用。
  - `onRejected`：可选的回调函数，Promise 被拒绝（rejected）时调用。

- **示例**：
  ```javascript
  new Promise((resolve, reject) => reject('Error'))
    .then(
      value => console.log('Fulfilled:', value),
      error => console.log('Rejected:', error) // 处理拒绝的情况
    );
  ```

- **特点**：`then` 方法接收两个参数，第一个是成功回调，第二个是失败回调。只有当 `then` 的第一个参数不为 `undefined` 时，第二个参数才会被触发。

### **2. `Promise.catch`**

- **作用**：专门用于处理 Promise 被拒绝（rejected）时的情况。
- **用法**：
  ```javascript
  promise.catch(onRejected);
  ```
  - `onRejected`：回调函数，当 Promise 被拒绝时调用。

- **示例**：
  ```javascript
  new Promise((resolve, reject) => reject('Error'))
    .catch(error => console.log('Caught Error:', error)); // 处理拒绝的情况
  ```

- **特点**：`catch` 方法是 `then` 方法的语法糖，专门用于处理拒绝的情况。它可以与 `then` 链式调用配合使用，使得代码更加清晰和符合逻辑。

</details>

## 16. Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？ {#question-1bdd3e29-f9b2-4f1d-a8b2-6a8b14320779}

> 难度：1.5 · 类型：QA

### 题目要点

- **Promise 构造函数**：同步执行。在构造函数中传入的 `executor` 函数立即执行。
- **`then` 方法**：异步执行。`then` 方法的回调函数会在当前执行栈完成后，进入微任务队列执行。

这种设计确保了 `Promise` 的状态变更能够被正确地处理，并且 `then` 中的回调不会干扰到当前的同步执行流程。

<details>
<summary>参考答案</summary>

### **Promise 构造函数的执行**

**同步执行**：
- `Promise` 的构造函数（即 `new Promise(executor)`）是同步执行的。
- 当你创建一个新的 `Promise` 实例时，传递给构造函数的 `executor` 函数会立即同步执行。
- 在 `executor` 函数中调用 `resolve` 或 `reject` 也是同步的，直到 `executor` 函数执行完毕，`Promise` 的状态才会改变。

**示例**：
```javascript
console.log('Start');

const promise = new Promise((resolve, reject) => {
  console.log('Inside promise executor');
  resolve('Resolved value');
});

console.log('After promise creation');

promise.then(value => {
  console.log('Inside then');
  console.log(value);
});

console.log('End');
```

**输出**：
```
Start
Inside promise executor
After promise creation
End
Inside then
Resolved value
```

### **`then` 方法的执行**

**异步执行**：
- `then` 方法的回调函数（`onFulfilled` 和 `onRejected`）是异步执行的。它们会在当前执行栈清空后被执行，即微任务队列（Microtask Queue）中。
- 当 `Promise` 的状态变为 `fulfilled` 或 `rejected` 时，`then` 方法中注册的回调函数会被加入微任务队列，在当前脚本执行完后，事件循环会处理这些微任务。

**示例**：
```javascript
console.log('Start');

const promise = new Promise((resolve, reject) => {
  console.log('Inside promise executor');
  resolve('Resolved value');
});

console.log('After promise creation');

promise.then(value => {
  console.log('Inside then');
  console.log(value);
});

console.log('End');
```

**输出**：
```
Start
Inside promise executor
After promise creation
End
Inside then
Resolved value
```

</details>

## 17. promise 是否可以取消？ {#question-848cb975-f2e8-4a46-bf55-d36acd6a1a38}

> 难度：3 · 类型：QA

### 题目要点

原生 Promise 本身不支持取消，但可以通过一些变通的方式实现类似功能，如使用标志位、自定义类、AbortController 或第三方库。

<details>
<summary>参考答案</summary>

JavaScript 中的原生 Promise 不直接支持取消操作。Promise 的设计理念是一次性且不可变的，创建后就不可取消。

实现 Promise 取消的常见方法有：

### **1. 使用标志位**

可以在 Promise 内部设置一个取消标志，手动检查这个标志来决定是否继续执行操作。

```javascript
function cancellablePromise(executor) {
  let cancelled = false;

  const promise = new Promise((resolve, reject) => {
    executor(
      (value) => {
        if (!cancelled) resolve(value);
      },
      (error) => {
        if (!cancelled) reject(error);
      }
    );
  });

  return {
    promise,
    cancel() {
      cancelled = true;
    }
  };
}
```

### **2. 使用 `AbortController`**

对于 Fetch API 或类似支持 AbortController 的操作，可以利用 AbortController 取消网络请求。

```javascript
const controller = new AbortController();
const signal = controller.signal;

fetch('url', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error('Fetch error:', err);
    }
  });

// 取消请求
controller.abort();
```

### **3. 自定义取消的 Promise 机制**

通过自定义机制来处理 Promise 的取消逻辑，可以封装 Promise 和取消逻辑。

```javascript
class CancelablePromise {
  constructor(executor) {
    this._isCanceled = false;
    this._promise = new Promise((resolve, reject) => {
      executor(
        value => !this._isCanceled && resolve(value),
        error => !this._isCanceled && reject(error)
      );
    });
  }

  cancel() {
    this._isCanceled = true;
  }

  then(onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._promise.catch(onRejected);
  }
}
```

### **4. 使用第三方库**

有些第三方库（如 [Bluebird](http://bluebirdjs.com/) 和 [rxjs](https://rxjs.dev/)）提供了对 Promise 取消的支持或替代方案。

</details>

## 18. JS里的类就是构造函数的语法糖，这个说法是否正确？ {#question-56ea667a-50f3-424e-9ed7-9ac28cddf197}

> 难度：1 · 类型：QA

### 题目要点

- **类的语法糖**：`class` 语法提供了构造函数和方法的简化语法，使代码更易读、更易于管理。
- **底层实现**：`class` 在底层仍然使用构造函数和原型链机制，只是提供了更现代、更简洁的语法。

因此，`class` 语法确实是构造函数的语法糖，它简化了面向对象编程的代码编写和维护。

<details>
<summary>参考答案</summary>

这个说法是正确的。

在 JavaScript 中，`class` 语法实际上是构造函数的语法糖，提供了一个更清晰和直观的方式来定义和创建对象和继承。下面是详细解释：

### 构造函数与类的关系

#### **构造函数**

构造函数是一种传统的创建对象的方式，通过 `function` 关键字定义，并且使用 `new` 关键字来实例化对象。

- **示例**：
  ```javascript
  function Person(name, age) {
      this.name = name;
      this.age = age;
  }

  Person.prototype.greet = function() {
      console.log('Hello!');
  };

  const john = new Person('John', 30);
  ```

- **特点**：
  - 使用 `function` 定义，`this` 关键字用于设置实例属性。
  - 方法需要在构造函数的原型上定义。
  - 需要手动设置原型链上的方法。

#### **类（Class）**

ES6 引入的 `class` 语法提供了一种更清晰、更现代的方式来定义构造函数和对象的方法。类的语法是构造函数的语法糖，但它简化了代码并提供了更直观的面向对象编程方式。

- **示例**：
  ```javascript
  class Person {
      constructor(name, age) {
          this.name = name;
          this.age = age;
      }

      greet() {
          console.log('Hello!');
      }
  }

  const john = new Person('John', 30);
  ```

- **特点**：
  - `class` 语法提供了更简洁的构造函数和方法定义方式。
  - 方法定义在类的主体中，而不是在原型上。
  - 默认使用 `strict mode`。
  - 允许使用 `static` 关键字定义静态方法，这些方法不依赖于实例。

### 语法糖的具体实现

- **构造函数**：
  ```javascript
  function Person(name, age) {
      this.name = name;
      this.age = age;
  }

  Person.prototype.greet = function() {
      console.log('Hello!');
  };
  ```

- **类**：
  ```javascript
  class Person {
      constructor(name, age) {
          this.name = name;
          this.age = age;
      }

      greet() {
          console.log('Hello!');
      }
  }
  ```

实际上，类的语法在内部会被转换成类似于构造函数和原型链的方法：

- **类的构造函数**：
  ```javascript
  Person.prototype.constructor = Person;
  ```

- **类的方法**：
  ```javascript
  Person.prototype.greet = function() {
      console.log('Hello!');
  };
  ```

</details>

## 19. 使用 async/await 时，是否有必要加 try catch? {#question-3cadb842-10f6-4c2f-887d-ae4b6cb24aea}

> 难度：3 · 类型：QA

### 题目要点

-  **推荐使用**：为了健壮性和可维护性，通常建议在使用 `async/await` 时加上 `try...catch`，以捕获和处理潜在的错误。
- **根据需求决定**：如果错误处理逻辑已经在上层处理，或你希望错误冒泡，或者你在短期内需要快速开发和调试，可以暂时不加 `try...catch`。

<details>
<summary>参考答案</summary>

在使用 `async/await` 时，是否需要添加 `try...catch` 语句取决于你如何处理错误以及你的应用程序的需求。总体而言，添加 `try...catch` 是一个好的实践，因为它可以帮助你捕获并处理异步操作中的错误，从而提高代码的健壮性和可靠性。

### 为什么需要 `try...catch`

1. **捕获异步操作中的错误**：
   - `async/await` 本质上是基于 `Promise` 的语法糖。当 `await` 关键字后面的 `Promise` 被拒绝（rejected）时，它会抛出一个错误。使用 `try...catch` 可以捕获这个错误并进行处理，避免未捕获的异常导致程序崩溃。

   ```javascript
   async function fetchData() {
       try {
           const response = await fetch('https://api.example.com/data');
           const data = await response.json();
           return data;
       } catch (error) {
           console.error('Error fetching data:', error);
           // Handle the error or throw it again
       }
   }
   ```

2. **确保代码的健壮性**：
   - 即使错误发生，也可以通过 `catch` 块进行适当的处理（如记录错误、显示用户友好的错误信息、执行清理操作等），从而确保应用程序能够继续运行或安全地终止。

   ```javascript
   async function performTask() {
       try {
           await task1();
           await task2();
           await task3();
       } catch (error) {
           console.error('Error performing tasks:', error);
           // Clean up or notify the user
       }
   }
   ```

3. **特定情况下的错误处理**：
   - 有时，你可能希望在每个 `await` 操作后处理错误，而不是在函数级别进行统一处理。在这种情况下，可以为每个异步操作添加 `try...catch` 块。

   ```javascript
   async function processMultipleTasks() {
       try {
           await task1();
       } catch (error) {
           console.error('Error in task1:', error);
           return; // Exit or handle accordingly
       }

       try {
           await task2();
       } catch (error) {
           console.error('Error in task2:', error);
       }

       // Continue with other tasks
   }
   ```

### 什么时候可以不使用 `try...catch`

1. **上层调用处理**：
   - 如果你确定上层调用者会处理错误，或者你希望错误冒泡到更高的层级，可以选择不在当前 `async` 函数中捕获错误，而是让调用者处理。

   ```javascript
   async function fetchData() {
       const response = await fetch('https://api.example.com/data');
       return await response.json();
   }

   async function main() {
       try {
           const data = await fetchData();
           console.log(data);
       } catch (error) {
           console.error('Error in main:', error);
       }
   }
   ```

2. **简化代码**：
   - 在一些简单的或不太关键的异步操作中，你可能选择不处理错误，尤其是在开发阶段。但在生产代码中，还是建议处理错误。

</details>

## 20. 怎么遍历 ES6 中的 Set 对象？ {#question-43b44cfd-43c7-4d03-85d3-26d84ee975ab}

> 难度：1 · 类型：QA

### 题目要点

- `Set` 可以通过 `forEach()`、`for...of`、`values()`、`keys()` 和 `entries()` 等方法进行遍历。
- 其中，`for...of` 和 `forEach()` 是最常用的遍历方式。

<details>
<summary>参考答案</summary>

`Set` 是一个集合类型，它类似于数组，但具有以下特点：
- 每个元素都是唯一的。
- 元素的顺序是根据插入的顺序来保持的。

要遍历 `Set` 对象，可以使用以下几种方法：

### 1. **使用 `forEach()` 方法**
`Set` 具有 `forEach()` 方法，它接受一个回调函数，在每次迭代时会传入当前的值、值本身和 `Set` 本身。

```javascript
const mySet = new Set([1, 2, 3, 4]);

mySet.forEach(value => {
  console.log(value);  // 输出：1, 2, 3, 4
});
```

### 2. **使用 `for...of` 循环**
`Set` 是可迭代的，因此可以直接使用 `for...of` 循环遍历其元素。

```javascript
const mySet = new Set([1, 2, 3, 4]);

for (let value of mySet) {
  console.log(value);  // 输出：1, 2, 3, 4
}
```

### 3. **使用 `Set` 的 `values()` 方法**
`Set` 对象有一个 `values()` 方法，它返回一个新的 `Set` 对象的迭代器。实际上，`values()` 和 `keys()` 返回的迭代器是相同的，因为 `Set` 中的元素没有键（键和值都是元素本身）。

```javascript
const mySet = new Set([1, 2, 3, 4]);

for (let value of mySet.values()) {
  console.log(value);  // 输出：1, 2, 3, 4
}
```

### 4. **使用 `Set` 的 `keys()` 方法**
`Set` 的 `keys()` 方法与 `values()` 方法相同，它返回一个包含 `Set` 元素的迭代器。

```javascript
const mySet = new Set([1, 2, 3, 4]);

for (let value of mySet.keys()) {
  console.log(value);  // 输出：1, 2, 3, 4
}
```

### 5. **使用 `Set` 的 `entries()` 方法**
`entries()` 方法返回一个包含 `Set` 元素的 `[value, value]` 键值对的迭代器，尽管在 `Set` 中没有键，但返回的数组形式仍然是 `[value, value]`。

```javascript
const mySet = new Set([1, 2, 3, 4]);

for (let [key, value] of mySet.entries()) {
  console.log(value);  // 输出：1, 2, 3, 4
}
```

</details>

## 21. 怎么遍历 ES6 中的 Map 对象？ {#question-f7df10d2-74ea-47cc-993c-ee7fd657b606}

> 难度：0.5 · 类型：QA

### 题目要点

- **`forEach()`**：适用于在遍历时执行某些操作，接收 `value`、`key` 和 `Map` 本身作为参数。
- **`for...of`**：适用于更加灵活的遍历，支持 `Map` 的 `entries()`、`keys()` 和 `values()` 方法。
- **`keys()`**、**`values()`**、**`entries()`**：分别用于遍历键、值或键值对。

<details>
<summary>参考答案</summary>

在 ES6 中，`Map` 是一种新的集合类型，它存储键值对（key-value pairs），与对象不同的是，`Map` 的键可以是任何类型（不仅仅是字符串），并且键值对的顺序是有序的。

要遍历 `Map` 对象，可以使用以下几种方法：

### 1. **使用 `forEach()` 方法**
`Map` 具有 `forEach()` 方法，它接受一个回调函数，回调函数会接收三个参数：`value`（值），`key`（键），以及 `Map` 本身。

```javascript
const myMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

myMap.forEach((value, key) => {
  console.log(key, value);  // 输出：a 1, b 2, c 3
});
```

### 2. **使用 `for...of` 循环**
`Map` 是可迭代的，可以直接使用 `for...of` 循环进行遍历。默认情况下，`Map` 会按 `[key, value]` 的形式返回每个元素。

```javascript
const myMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

for (let [key, value] of myMap) {
  console.log(key, value);  // 输出：a 1, b 2, c 3
}
```

### 3. **使用 `Map` 的 `keys()` 方法**
`keys()` 方法返回一个包含所有键的迭代器，可以用 `for...of` 循环遍历这些键。

```javascript
const myMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

for (let key of myMap.keys()) {
  console.log(key);  // 输出：a, b, c
}
```

### 4. **使用 `Map` 的 `values()` 方法**
`values()` 方法返回一个包含所有值的迭代器，可以用 `for...of` 循环遍历这些值。

```javascript
const myMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

for (let value of myMap.values()) {
  console.log(value);  // 输出：1, 2, 3
}
```

### 5. **使用 `Map` 的 `entries()` 方法**
`entries()` 方法返回一个包含 `[key, value]` 键值对的迭代器，可以用 `for...of` 循环遍历这些键值对。

```javascript
const myMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

for (let [key, value] of myMap.entries()) {
  console.log(key, value);  // 输出：a 1, b 2, c 3
}
```

</details>

## 22. Proxy 和 Reflect 有什么关系？ {#question-aebf5248-b0f3-4407-b5a0-ee833e0ad450}

> 难度：3 · 类型：QA

### 题目要点

- **Proxy**：用于创建代理对象，拦截并自定义对象操作（如 `get`、`set`、`apply` 等）。
- **Reflect**：提供底层的操作方法，通常用来在 `Proxy` 的拦截器中执行默认操作。

`Reflect` 提供的方法是 `Proxy` 的拦截操作的基础，能够简化并保持操作的一致性。在 `Proxy` 的拦截器中，使用 `Reflect` 方法可以保证对象操作的一致性，避免直接访问目标对象属性时带来的副作用。

<details>
<summary>参考答案</summary>

`Proxy` 和 `Reflect` 都是 JavaScript 中用于操作对象的一对新特性，主要用于拦截和操作对象的行为。它们通常一起使用，但各自有不同的作用和用途。

### 1. **Proxy**：拦截器（Handler）
`Proxy` 是一个用于创建代理对象的机制，它可以让你定义自定义的行为来拦截和修改对目标对象的操作（例如属性访问、赋值、方法调用等）。通过代理，你可以在对象操作之前或之后执行一些自定义逻辑，比如验证、日志、计数等。

#### 基本语法：
```javascript
const proxy = new Proxy(target, handler);
```
- `target` 是目标对象，表示你要代理的实际对象。
- `handler` 是一个对象，它定义了代理对象的行为（拦截器），如 `get`、`set`、`apply` 等。

#### 示例：
```javascript
const target = {
  message: "Hello, World!"
};

const handler = {
  get: function(target, prop, receiver) {
    if (prop === "message") {
      return target[prop].toUpperCase();  // 返回大写的 message
    }
    return prop in target ? target[prop] : `Property "${prop}" not found`;
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.message); // 输出：HELLO, WORLD!
console.log(proxy.nonExistent); // 输出：Property "nonExistent" not found
```

### 2. **Reflect**：反射 API
`Reflect` 是一个新的内置对象，它提供了与对象操作相关的静态方法。这些方法是 `Proxy` 操作的低层次 API，用于执行默认的操作，或在 `Proxy` 的拦截器中调用它们来执行实际的行为。`Reflect` 方法基本上是 `Object` 方法的扩展，目的是简化对象操作。

#### `Reflect` 的常用方法：
- `Reflect.get(target, prop)`：获取目标对象的属性值。
- `Reflect.set(target, prop, value)`：设置目标对象的属性值。
- `Reflect.deleteProperty(target, prop)`：删除目标对象的属性。
- `Reflect.has(target, prop)`：检查目标对象是否具有某个属性。
- `Reflect.apply(target, thisArg, argumentsList)`：调用目标函数。
- `Reflect.construct(target, argumentsList)`：创建目标函数的实例。

#### 示例：
```javascript
const obj = { name: 'Alice' };

console.log(Reflect.get(obj, 'name')); // 输出：Alice
Reflect.set(obj, 'name', 'Bob');
console.log(obj.name); // 输出：Bob
```

### **Proxy 和 Reflect 之间的关系**
`Proxy` 和 `Reflect` 经常一起使用，原因如下：
1. **Proxy 拦截器的操作通常会调用 Reflect**：`Proxy` 的处理程序（`handler`）定义了如何拦截目标对象的操作。在这些处理程序中，通常会调用 `Reflect` 方法来执行对象的默认操作，这样可以确保操作符合预期。

2. **Reflect 是 `Proxy` 的默认行为**：当你定义了 `Proxy` 拦截器时，如果你没有提供某个操作的具体实现，通常可以通过调用 `Reflect` 的方法来执行默认的行为。

#### 示例：使用 `Reflect` 在 `Proxy` 中实现默认行为
```javascript
const target = {
  message: "Hello"
};

const handler = {
  get(target, prop, receiver) {
    if (prop === "message") {
      return `Hello, ${target[prop]}`;  // 自定义行为
    }
    // 对于其他属性，使用 Reflect 执行默认行为
    return Reflect.get(...arguments);
  },
  set(target, prop, value, receiver) {
    if (prop === "message") {
      value = value.toUpperCase();  // 自定义行为：把 message 转成大写
    }
    return Reflect.set(...arguments);  // 使用 Reflect 来执行默认的 set 操作
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.message);  // 输出：Hello, Hello
proxy.message = "world";
console.log(proxy.message);  // 输出：Hello, WORLD
```

</details>

## 23. 如何把一个对象变成可迭代对象？ {#question-eda0c7a2-e591-4eeb-8bf0-69f8162c8db1}

> 难度：3 · 类型：QA

### 题目要点

在JavaScript中，一个普通的对象默认不是可迭代对象，因为它没有实现迭代器协议（即没有`Symbol.iterator`方法）。要使对象变得可迭代，你需要手动给该对象添加一个`Symbol.iterator`方法。

`Symbol.iterator`方法应该返回一个迭代器对象，该对象有一个`next()`方法，该方法返回一个对象，该对象包含`value`和`done`两个属性。`value`属性是当前迭代的值，`done`属性是一个布尔值，表示迭代是否完成。

可以通过几种方式来实现`Symbol.iterator`方法：

1. **直接编写迭代器逻辑**：在`Symbol.iterator`方法中编写逻辑来逐个返回对象的属性或值。这通常涉及到维护一个内部状态（如索引或迭代器位置）来跟踪当前迭代的位置。

2. **使用生成器函数**：生成器函数提供了一种更简洁的方式来编写迭代器。你可以使用`function*`语法定义一个生成器函数，并在其中使用`yield`语句来逐个返回值。如果你想要迭代对象的属性或值，你可以结合使用`Object.keys()`, `Object.values()`, 或 `Object.entries()`等方法来简化逻辑。

3. **委托迭代**：如果你的对象包含另一个可迭代对象（如数组或另一个实现了`Symbol.iterator`方法的对象），你可以在你的`Symbol.iterator`方法中简单地返回那个内部对象的迭代器。这可以通过使用`yield*`语句（在生成器函数中）来实现，它会委托迭代给另一个迭代器。

<details>
<summary>参考答案</summary>

可迭代对象（Iterable object）是数组的泛化，这个概念是在说任何对象都可以被定制为可在 `for..of` 循环中使用的对象。

也就是说，可以应用 `for..of` 的对象被称为 `可迭代对象`。

## 迭代器

在 JavaScript 中，**迭代器**是一个对象，它定义一个序列，并在终止时可能返回一个返回值。

更具体地说，迭代器是通过使用 `next()` 方法实现 `Iterator protocol` 的任何一个对象，该方法返回具有两个属性的对象：

* `value`，这是序列中的 `next` 值
* `done`，如果已经迭代到序列中的最后一个值，则它为 `true`

如果 `value` 和 `done` 一起存在，则它是迭代器的返回值。

一旦创建，迭代器对象可以通过重复调用 `next() `显式地迭代。

迭代一个迭代器被称为消耗了这个迭代器，因为它通常只能执行一次。

在产生终止值之后，对 `next()` 的额外调用应该继续返回 `{done: true}`。

Javascript 中最常见的迭代器是 Array 迭代器，它只是按顺序返回关联数组中的每个值。

虽然很容易想象所有迭代器都可以表示为数组，但事实并非如此。数组必须完整分配，但迭代器仅在必要时使用，因此可以表示无限大小的序列，例如 0 和无穷大之间的整数范围。

这是一个可以做到这一点的例子。它允许创建一个简单的范围迭代器，它定义了从开始（包括）到结束（独占）间隔步长的整数序列。它的最终返回值是它创建的序列的大小，由变量 iterationCount 跟踪。

```js
let index = 0
const bears = ['ice', 'panda', 'grizzly']

let iterator = {
  next() {
    if (index < bears.length) {
      return { done: false, value: bears[index++] }
    }

    return { done: true, value: undefined }
  }
}

console.log(iterator.next()) //{ done: false, value: 'ice' }
console.log(iterator.next()) //{ done: false, value: 'panda' }
console.log(iterator.next()) //{ done: false, value: 'grizzly' }
console.log(iterator.next()) //{ done: true, value: undefined }
```

## 实现可迭代对象

如果一个对象拥有 `[Symbol.iterator]` 方法，并且该方法返回一个迭代器对象，这样的对象即可称为`可迭代对象`。

```js
let info = {
  bears: ['ice', 'panda', 'grizzly'],
  [Symbol.iterator]: function() {
    let index = 0
    let _iterator = {
       //这里一定要箭头函数，或者手动保存上层作用域的this
       next: () => {
        if (index < this.bears.length) {
          return { done: false, value: this.bears[index++] }
        }

        return { done: true, value: undefined }
      }
    }

    return _iterator
  }
}

let iter = info[Symbol.iterator]()
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())

//符合可迭代对象协议 就可以利用 for of 遍历
for (let bear of info) {
  console.log(bear)
}
//ice panda grizzly
```

</details>

## 24. 说说你对 Iterator, Generator 和 Async/Await 的理解 {#question-82b536ee-2a79-4e64-b238-061656ca8ca9}

> 难度：4 · 类型：QA

### 题目要点

#### Iterator

- **定义**：Iterator 是一个简单的循环接口，用于支持 `for...of` 循环遍历数据。
- **特点**：任何实现了 Iterator 接口的数据都可以被 `for...of` 循环遍历。
- **适用场景**：适用于任何需要循环遍历数据的情况。

#### Generator

- **定义**：Generator 是一种特殊的函数，可以暂停和继续执行，类似于状态机。
- **特点**：可以实现 Iterator 的功能，并且由于可以保存上下文，适合实现简单的状态机。
- **适用场景**：适合需要流程控制和状态管理的情况，尤其是需要进行异步操作时。

#### Async/Await

- **定义**：Async/Await 是 Generator 进行异步操作的语法糖。
- **特点**：通过 `async` 关键字和 `await` 关键字，使得异步代码的编写更加直观和易于理解。
- **适用场景**：适用于任何需要异步操作的情况，是目前最广泛使用的异步编程方式。

<details>
<summary>参考答案</summary>

这里重点理解他们三者分别是什么，有什么区别，以及分别适用什么场景

# Iterator

Iterator是最简单最好理解的。

简单的说，我们常用的 `for of` 循环，都是通过调用被循环对象的一个特殊函数 `Iterator` 来实现的，但是以前这个函数是隐藏的我们无法访问， 从 `Symbol` 引入之后，我们就可以通过 `Symbol.iterator` 来直接读写这个特殊函数。

对于循环语句来说，他并不关心被循环的对象到底是什么，他只负责调用 `data[Symbol.iterator]` 函数，然后根据返回值来进行循环。所以任何对象只要提供了标准的 Iterator 接口即可被循环，比如我们现在来创造一个自定义的数据：

```
var students = {}
students[Symbol.iterator] = function() {
  let index = 1;
  return { next() {
    return {done: index>100, value: index++} }
  }
}

for(var i of students) { console.log(i); }
```

除了这种方式外，我们也可以通过 `Generator` 来实现一个 `Iterator` 接口。

# Generator 基本语法

Generator 是ES6引入的新语法，Generator是一个可以暂停和继续执行的函数。简单的用法，可以当做一个Iterator来用，进行一些遍历操作。复杂一些的用法，他可以在内部保存一些状态，成为一个状态机。

Generator 基本语法包含两部分：
* 函数名前要加一个星号
* 函数内部用 `yield` 关键字返回值

下面是一个简单的示例：

```js
function * count() {
  yield 1
  yield 2
  return 3
}
var c = count()
console.log(c.next()) // { value: 1, done: false }
console.log(c.next()) // { value: 2, done: false }
console.log(c.next()) // { value: 3, done: true }
console.log(c.next()) // { value: undefined, done: true }
```

由于Generator也存在 `Symbol.iterator` 接口，所以他也可以被 `for` 循环调用：

```js
function * count() {
  yield 1
  yield 2
  return 3
}
var c = count()
for (i of c) console.log(i) // 1, 2
```
不过这里要注意一个不同点，调用 `next` 的时候能得到 `3` ，但是用 `for` 则会忽略最后的 `return` 语句。 也就是 `for` 循环会忽略 `generator` 中的 `return` 语句.

另外 `yeild*` 语法可以用来在 `Generator` 中调用另一个 `Generator`，参见 [yield* MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A)

# Generator VS Iterator

Generator 可以看做是一个更加灵活的 `Iterator` ，他们之间是可以互相替代的，但是， `Generator` 由于可以通过 `yield` 随时暂停，因此可以很方便进行流程控制和状态管理，而 `Iterator` 就可能需要你写更多的代码进行相同的操作：

比如 Stack Overflow 上的这个中序遍历代码：

```js
function* traverseTree(node) {
    if (node == null) return;
    yield* traverseTree(node.left);
    yield node.value;
    yield* traverseTree(node.right);
}
```
同样的功能用 `iterator` 实现就会变得麻烦很多。

Generator 也是实现简单的状态机的最佳选择，因为他是在函数内部进行 `yield` 操作，因此不会丢失当前状态：

```js
function * clock () {
  yield 'tick'
  yield 'tock'
}
```

同样的功能如果普通的函数，因为每次都是调用这个函数，所以函数内部并不能保存状态，因此就需要在函数外面用一个变量来保存当前状态：

```js
let tick = false
function clock() {
  tick = !tick
  return tick ? 'tick' : 'tock'
}
```

其实Babel编译 `Generator` 的时候，也是用了一个 `Context` 来保存当前状态的，可以看看Babel编译后的代码，其中的 `_context` 就是当前状态，这里通过 `_context.next` 的值来控制调用 `next` 的时候应该进入到哪一个流程：

```js

var _marked = /*#__PURE__*/regeneratorRuntime.mark(clock);

function clock() {
  return regeneratorRuntime.wrap(function clock$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'tick';

        case 2:
          _context.next = 4;
          return 'tock';

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}
```

当然，如果是很复杂的，非线性状态变化的状态机，我还是会倾向于用一个类来实现。

# Generator 异步操作

Generator 的设计，可以很方便执行异步操作，现在我们需要写一个小函数，可以取到用户信息然后打印出来，我们用generator来写就是这样的：

```js
function * fetchUser () {
  const user = yield ajax()
  console.log(user)
}
```
但是，generator本身并不会自动进行 `next` 操作，也就是，我们如果此时这样调用并不能打印出用户信息:

```js
const f = fetchUser()
```
因为`Generator` 本身只是一个状态机，他需要由调用者来改变他的状态，所以我们需要额外加一段控制代码来控制 `fetchUser` 进行状态转换:

```js

function * fetchUser () {
  const user = yield ajax()
  console.log(user)
}

const f = fetchUser()

// 加入的控制代码
const result = f.next()
result.value.then((d) => {
  f.next(d)
})
```

但是写了这些代码之后， `Generator` 的实现就变得非常不优雅了，如果我们内部有多个异步操作，控制代码就会变得很长。我们可以选择 co 库来帮我们做这个操作。

# Async/Await

我最开始接触到 Async/Await 的时候把它当成了一个 `promise` 的语法糖，但是经过我们对 `Generator` 的理解后，明白了其实他就是 `Generator` 的一个语法糖：

* `async` 对应的是 `*`
* `await` 对应的是 `yield`

他只是自动帮我们进行了 `Generator` 的流程控制而已。

和上面的获取用户信息实现一样的功能的话，基本语法如下：

```js
async function fetchUser() {
  const user = await ajax()
  console.log(user)
}
```

因为有自动的流程控制，所以我们不用手动在ajax成功的时候手动调用 `next`。相比于 `Promise` 或者 `Generator` 的实现，代码要明显更加优雅。

如果有兴趣的话，可以参考一下 `Babel` 是如何编译 `Async/Await` 的，简单的说，代码分成了两部分，一部分是编译了一个 `Generator`，另一部分是通过 promise 实现了generator的流程控制。

对于如下代码：

```js
async function count () {
  let a = await 1;
  let b = await 2;
  return a+b
}
```

编译后的代码：

```js
var count = function () {
  // 下面这部分是 generator 的一个实现
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var a, b;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return 1;

            // 省略...
        }
      }
    }, _callee, this);
  }));

  return function count() {
    return _ref.apply(this, arguments);
  };
}();

// 下面这部分是用 promise 实现了流程控制。
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
```

所以我们可以大约这么认为： **async/await == generator + promise**

# async/await 并发

我们的代码在执行到await的时候会等待结果返回才执行下一行，这样如果我们有很多需要异步执行的操作就会变成一个串行的流程，可能会导致非常慢。

比如如下代码，我们需要遍历获取redis中存储的100个用户的信息：

```js
const users=[]
for (var i=0;i<ids.length;i++) {
  users.push(await db.get(ids))
}
```
由于每次数据库读取操作都要消耗时间，这个接口将会变得非常慢。如果我们把它变成一个并行的操作，将会极大提升效率：

```js
const users = await Promise.all(ids.map(async (id) => await db.get(id)))
```

# 总结

* `Iterator` 是一个循环接口，任何实现了此接口的数据都可以被 `for of` 循环遍历
* `Generator` 是一个可以暂停和继续执行的函数，他可以完全实现 `Iterator` 的功能，并且由于可以保存上下文，他非常适合实现简单的状态机。另外通过一些流程控制代码的配合，可以比较容易进行异步操作。
* `Async/Await` 就是generator进行异步操作的语法糖。而这个语法糖反而是被使用最广泛的，比如著名的 `Koa`

</details>

## 25. Map 和 WeakMap 有什么区别？ {#question-b837af11-c26f-41d2-b2fc-3610a1575ec2}

> 难度：2.5 · 类型：QA

### 题目要点

#### Map

1. **键值对集合**：Map 是一个键值对的集合，不同于传统对象，其键可以不是字符串，可以是任何类型的值。
2. **优势**：
   - 键类型灵活：可以是非字符串类型。
   - 键值对个数可轻松获取：通过 `size` 属性。
   - 性能优势：在频繁增删键值对的场景下，性能优于传统对象。
3. **适用场景**：
   - 键名和对象默认键名冲突。
   - 需要使用非字符串类型作为键。
   - 需要计算键值对数量。
   - 频繁增删键值对。

#### WeakMap

1. **弱引用键**：WeakMap 的键是弱引用，意味着如果一个对象没有其他引用，那么这个键值对会自动从 WeakMap 中移除。
2. **特性**：
   - 只接受对象作为键：不能使用其他类型的值作为键。
   - 不可遍历：因为键值对的个数可能随垃圾回收机制的变化而变化。
3. **适用场景**：
   - 当某个对象的引用需要在其他地方被释放时，使用 WeakMap 可以避免内存泄漏。
   - 存储DOM节点时，使用 WeakMap 可以让这些节点在不再需要时被自动回收。

#### Map 和 WeakMap 区别

- **键的类型**：Map 的键可以是任意类型，WeakMap 只接受对象作为键。
- **键的引用强度**：Map 的键是强引用，WeakMap 的键是弱引用。
- **遍历能力**：Map 可以被遍历，WeakMap 不能被遍历。

<details>
<summary>参考答案</summary>

### Map

##### 1.传统对象结构
Map本质上是一个键值对的集合。和传统对象结构相比，传统对象只能用字符串作为键名，这在使用上造成了很大的限制。

```javascript
const data = {}
//element为节点对象
const element = document.querySelector('.node')
console.log(element)  //输出div.node对象
console.log(element.toString())
//用点操作符不能有空格，所以采用中括号的形式给对象赋值
data[element] = 'objectData'
//输出objectData，说明在对象中存在[object HTMLDivElement]键名
console.log(data['[object HTMLDivElement]'])

```
上面带代码中，我们创建了一个对象并将一个节点对象作为它的键名，并进行了代码测试，首先验证了获取到的element节点为一个对象，再确定了经过toString方法转化后的结果，以这个值为键名成功的输出了value值objectData。

上面的代码证明了传统对象的键名会通过toString方法转化为字符串类型

注意：在我们访问对象成员的时，键名有空格时不能采用点访问，例如data.ab c
这是错误的。我们可以用data['ab c']的形式访问

##### 2.Map结构

Map类似于对象，但是键名不限于字符串，可以说Object结构提供键值对应，Map提供值值对应，因此采用Map结构会优于传统对象。

```javascript
const dataMap = new Map()
const element = document.querySelector('.node')
dataMap.set(element,'objectData')
console.log(dataMap.get(element))
console.log(dataMap)
```
上面的代码中我们获取值时直接传入了element对象，成功将对象作为键名，弥补了传统对象的不足。

##### 3.Map的特点

1. Map默认情况下不包含任何键，所有键都是自己添加进去的。不同于Object原型链上有一写默认的键。
2. Map的键可以时任何类型数据，就连函数都可以。
3. Map的键值对个数可以轻易通过size属性获取，Object需要手动计算。
4. Map在频繁增删键值对的场景下性能比Object更好。

##### 4.什么时候用Map

1. 想要添加的键值名和Object上的默认键值名冲突，又不想改名，用Map。
2. 需要String和Symbol以外的数据类型做键值时，用Map。
3. 键值对很多，有时需要计算数量，用Map。
4. 需要频繁地增删键值对时，用Map。

### WeakMap
#### 什么是WeakMap

WeakMap是ES6中新增的一种集合类型，叫做'弱映射'。它和Map是兄弟关系，与Map的区别在于这个弱字，API还是Map那套API

#### WeakMap的特性

##### 1. WeakMap只能将对象作为键名
只接受对象作为键名(null除外)，不接受其它类型的值作为键名。

##### 2.WeakMap的键名引用的对象是弱引用

首先我们需要知道什么是强引用什么是弱引用

**强引用**

```javascript
const e1 = document.getElementById('foo')
const e2 = document.getElementById('bar')
const arr = [
    [e1,'foo'],
    [e2,'bar'],
];
```

上面的代码中e1和e2是两个对象，通过arr数组对这两个对象添加一些文字说明。但是这样就形成了arr对e1和e2的引用，而这种引用又是强引用。它的区别就体现在这。当我们不再需要这两个对象时，我们必须手动删除这个引用，接触arr对两个对象的引用关系，否则垃圾回收机制不会释放e1和e2占用的内存。因为arr仍然存在着对对象的引用。

```javascript
arr[0] = null;
arr[1] = null;
```

**弱引用**

是指不能确保其引用的对象不会被垃圾回收器回收的引用。一个对象若只被弱引用所引用，则被认为是不可访问的，并因此可能在任何时刻被回收。

也就是说当我们创建一个弱引用的对象时，我们就可以静静地等待其被垃圾回收器回收。

总的来说，局势WeakMap保持了对键名所引用对象的弱引用，即垃圾回收机制不将该引用考虑在内。只要所引用的对象的其它引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap里面的键名对象和所对应的键值对会自动消失，不需要手动删除引用。

##### 3.不可遍历

正因为WeakMap对键名引用的对象是弱引用关系 ，因此WeakMap内部成员是会取决于垃圾回收机制有没有执行，运行前后成员个数很可能是不一样的，而垃圾回收机制的执行又是不可预测的，因此不可遍历。

## Map和WeakMap区别

- Map的键可以是任意类型，WeakMap只接受对象作为键，不接受其它类型的值作为键
- Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键；WeakMap的键是弱引用，键所指向的对象是可以被垃圾回收，此时键是无效的。
- Map可以被遍历，WeakMap不能被遍历

</details>

## 26. 说说你对 new.target 的理解 {#question-838b4eda-1f58-4215-9bb5-3e59db973286}

> 难度：1 · 类型：QA

### 题目要点

`new.target` 属性是 JavaScript 中一个特殊的属性，它用于检测函数或构造函数是否是通过 `new` 运算符被调用的。这个属性在通过 `new` 运算符初始化的函数或构造方法中，会返回一个指向构造方法或函数的引用。如果函数不是通过 `new` 运算符被调用的，`new.target` 的值将是 `undefined`。

利用 `new.target`，我们可以编写代码来检查一个函数是否作为构造函数被 `new` 调用，从而确保函数的调用方式符合预期。

<details>
<summary>参考答案</summary>

`new.target` 属性是 JavaScript 中一个特殊的属性，它用于检测函数或构造函数是否是通过 `new` 运算符被调用的。这个属性在通过 `new` 运算符初始化的函数或构造方法中，会返回一个指向构造方法或函数的引用。如果函数不是通过 `new` 运算符被调用的，`new.target` 的值将是 `undefined`。
利用 `new.target`，我们可以编写代码来检查一个函数是否作为构造函数被 `new` 调用，从而确保函数的调用方式符合预期。例如，如果我们有一个函数，它应该总是作为构造函数被调用，那么我们可以在函数体内部使用 `new.target` 来抛出一个错误，如果它没有被以正确的方式调用。
```javascript
function Foo() {
  if (!new.target) {
    throw new Error("Foo() must be called with new");
  }
  console.log("Foo instantiated with new");
}
// 如果直接调用函数，会抛出错误
try {
  Foo();
} catch (error) {
  console.log(error.message); // 输出: Foo() must be called with new
}
// 如果使用 new 运算符调用函数，则不会抛出错误
try {
  new Foo();
} catch (error) {
  console.log(error.message); // 不会抛出错误
}
```
在上述代码中，当 `Foo()` 函数被直接调用时，由于 `new.target` 是 `undefined`，因此会抛出一个错误，提示必须使用 `new` 运算符来调用 `Foo()`。而当使用 `new` 运算符调用时，`new.target` 指向 `Foo` 函数本身，因此不会抛出错误，而是执行了 `console.log` 语句。

</details>

## 27. async/await 怎么进行错误处理？ {#question-deb034d1-2a96-45b4-8576-132f2af9c797}

> 难度：2 · 类型：QA

### 题目要点

`async/await`进行错误处理的方式如下：

`async/await`允许你以几乎同步的方式编写异步代码，使得异步操作的流程更加清晰易懂。在`async`函数内部，你可以使用`await`来等待`Promise`的解决或拒绝。如果`Promise`被拒绝（即异步操作失败），`await`会抛出一个错误，这个错误可以像处理同步代码中的错误一样，通过外部的`try...catch`语句来捕获和处理。

具体来说，当你在`async`函数内部使用`await`等待一个`Promise`时，你应该将这个`await`调用包裹在`try...catch`语句中。这样，如果`Promise`被拒绝，`catch`块就会捕获到这个错误，允许你在其中进行错误处理，比如重试操作、记录日志、给用户显示错误消息等。

这种错误处理方式使得异步代码的错误处理变得更加直观和一致，减少了回调地狱（Callback Hell）的困扰，提高了代码的可读性和可维护性。

最后，需要注意的是，由于`async`函数总是返回一个`Promise`，因此如果在一个更外层的异步函数或事件处理器中调用这个`async`函数，你也可以在那个外层函数的`try...catch`中捕获到由这个`async`函数抛出的错误（如果它没有在内部被捕获的话）。这提供了更灵活的错误处理机制。

<details>
<summary>参考答案</summary>

一般情况下 async/await 在错误处理方面，主要使用 try/catch，像这样

```js
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is me')
        }, 1000)
    })
}

(async () => {
    try {
        const data = await fetchData()
        console.log('data is ->', data)
    } catch(err) {
        console.log('err is ->', err)
    }
})()

```

这么看，感觉倒是没什么问题，如果是这样呢？有多个异步操作，需要对每个异步返回的 error 错误状态进行不同的处理，以下是示例代码

```js
const fetchDataA = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is A')
        }, 1000)
    })
}

const fetchDataB = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is B')
        }, 1000)
    })
}

const fetchDataC = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is C')
        }, 1000)
    })
}

(async () => {
    try {
        const dataA = await fetchDataA()
        console.log('dataA is ->', dataA)
    } catch(err) {
        console.log('err is ->', err)
    }

    try {
        const dataB = await fetchDataB()
        console.log('dataB is ->', dataB)
    } catch(err) {
        console.log('err is ->', err)
    }

    try {
        const dataC = await fetchDataC()
        console.log('dataC is ->', dataC)
    } catch(err) {
        console.log('err is ->', err)
    }
})()

```

这样写代码里充斥着 try/catch，有代码洁癖的你能忍受的了吗？这时可能会想到只用一个 try/catch。

```js
// ... 这里 fetch 函数省略

(async () => {
    try {
        const dataA = await fetchDataA()
        console.log('dataA is ->', dataA)
        const dataB = await fetchDataB()
        console.log('dataB is ->', dataB)
        const dataC = await fetchDataC()
        console.log('dataC is ->', dataC)
    } catch(err) {
        console.log('err is ->', err)
        // 难道要定义 err 类型，然后判断吗？？
        /**
         * if (err.type === 'dataA') {
         *  console.log('dataA err is', err)
         * }
         * ......
         * */
    }
})()

```

如果是这样写只会增加编码的复杂度，而且要多写代码，这个时候就应该想想怎么优雅的解决，async/await 本质就是 promise 的语法糖，既然是 promise 那么就可以使用 then 函数了

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    const data = await fetchData().then(data => data ).catch(err => err)
    console.log(data)
})()

```

在上面写法中，如果 fetchData 返回 resolve 正确结果时，data 是我们要的结果，如果是 reject 了，发生错误了，那么 data 是错误结果，这显然是行不通的，再对其完善。

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    const [err, data] = await fetchData().then(data => [null, data] ).catch(err => [err, null])
    console.log('err', err)
    console.log('data', data)
    // err null
    // data fetch data is me
})()

```

这样是不是好很多了呢，但是问题又来了，不能每个 await 都写这么长，写着也不方便也不优雅，再优化一下

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    // 抽离成公共方法
    const awaitWrap = (promise) => {
        return promise
            .then(data => [null, data])
            .catch(err => [err, null])
    }

    const [err, data] = await awaitWrap(fetchData())
    console.log('err', err)
    console.log('data', data)
    // err null
    // data fetch data is me
})()

```

将对 await 处理的方法抽离成公共的方法，在使用 await 调用 awaitWrap 这样的方法是不是更优雅了呢。如果使用 typescript 实现大概是这个样子

```ts
function awaitWrap<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, null]>(err => [err, null])
}
```

</details>

## 28. Map 和 Set 的用法以及区别 {#question-487a7c86-fd00-4567-a6e2-dd6446e79e5e}

> 难度：1 · 类型：QA

### 题目要点

Map 是一组键值对的结构，和 JSON 对象类似。

<details>
<summary>参考答案</summary>

### 首先了解一下 Map
Map 是一组键值对的结构，和 JSON 对象类似。

**(1) Map数据结构如下**

这里我们可以看到的是Map的数据结构是一个键值对的结构

![image.png](https://static.ecool.fun//article/c88014da-ef2f-4626-89cc-d3b7729546e6.jpeg)

**(2) key 不仅可以是字符串还可以是对象**

```
var obj ={name:"小如",age:9}
let map = new Map()
map.set(obj,"111")
```
打印结果如下

![image.png](https://static.ecool.fun//article/f85eb9e7-c056-4b49-82e4-20f8e8a3e8e7.jpeg)

**(3) Map常用语法如下**

```
//初始化`Map`需要一个二维数组(请看 Map 数据结构)，或者直接初始化一个空`Map`
let map = new Map();

//添加key和value值
map.set('Amy','女')
map.set('liuQi','男')

//是否存在key，存在返回true,反之为false
map.has('Amy') //true
map.has('amy') //false

//根据key获取value
map.get('Amy') //女

//删除 key为Amy的value
map.delete('Amy')
map.get('Amy') //undefined  删除成功
```
**(4) 一个key只能对应一个value，多次对一个key放入value，后面的值会把前面的值覆盖掉**

```
var map =new Map
map.set('Amy',"女")
map.set('Amy',"男")
console.log(map)
```
打印结果如下

![image.png](https://static.ecool.fun//article/fff162fa-10e5-4de8-aa5f-49e04702374a.jpeg)

### 再来了解一下 Set
Set 对象类似于数组，且成员的值都是唯一的

**(1) 打印出的数据结构如下**

这里打印出来是一个对象

![image.png](https://static.ecool.fun//article/74e2e811-d1d8-488b-94ba-fefd47ee649c.jpeg)

**(2) 最常用来去重使用，去重方法有很多但是都没有它运行的快。**

```
var arr=[1,3,4,2,5,1,4]
// 这里原本是一个对象用了es6的语法 转化成了数组，就是转化数组之前已经过滤掉了重复的元素了
var arr2=[...new Set(arr)] //[1,3,4,2,5]
```
**(3) Set常用语法如下**

```
//初始化一个Set ，需要一个Array数组，要么空Set
var set = new Set([1,2,3,5,6])
console.log(set)  // {1, 2, 3, 5, 6}

//添加元素到Set中
set.add(7) //{1, 2, 3, 5, 6, 7}

//删除Set中的元素
set.delete(3) // {1, 2, 5, 6, 7}

//检测是否含有此元素，有为true，没有则为false
set.has(2) //true
```

### 总结Map和Set的区别

**(1) 这两种方法具有极快的查找速度;那么下面我们来对比一下Map，Set，Array 的执行时间**

```
//首先初始化数据
var lng=100
var arr =new Array(lng).fill(2)
var set =new Set(arr)
let map =new Map()
for(var i=0;i<lng;i++){
arr[i]=i
map.set(i,arr[i])
}

// Array
console.time()
for(var j=0;j<lng;j++){
arr.includes(j)
}
console.timeEnd()  //default: 0.01220703125 ms


// Set
console.time()
for(var j=0;j<lng;j++){
set.has(j)
}
console.timeEnd()  // default: 0.005859375 ms

// Map
console.time()
for(var j=0;j<lng;j++){
map.has(j)
}
console.timeEnd()
// default: 0.007080078125 ms
```

通过以上几种方法我们可以看到，Set执行时间最短，那么查找速度最快，当然了Set 和 Map的查找速度都很快想差不大，所以说这两种方法具有极快的查找速度。

**(2) 初始化需要的值不一样，Map需要的是一个二维数组，而Set 需要的是一维 Array 数组**

**(3) Map 和 Set 都不允许键重复**

**(4) Map的键是不能修改，但是键对应的值是可以修改的；Set不能通过迭代器来改变Set的值，因为Set的值就是键。**

**(5) Map 是键值对的存在，值也不作为健；而 Set 没有 value 只有 key，value 就是 key；**

</details>

## 29. 说说对 ES6 中rest参数的理解 {#question-80e34587-60c8-4788-af46-96eec6f5f887}

> 难度：2 · 类型：QA

### 题目要点

ES6 引入 rest 参数（形式为`...变量名`），用于获取函数的多余参数，这样就不需要使用`arguments`对象了。rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。

<details>
<summary>参考答案</summary>

ES6 引入 rest 参数（形式为`...变量名`），用于获取函数的多余参数，这样就不需要使用`arguments`对象了。rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。
```js
function add(...values) {
  let sum = 0;

  for (var val of values) {
    sum += val;
  }

  return sum;
}

add(2, 5, 3) // 10
```
上面代码的`add`函数是一个求和函数，利用 rest 参数，可以向该函数传入任意数目的参数。

下面是一个 rest 参数代替`arguments`变量的例子。
```js
// arguments变量的写法
function sortNumbers() {
  return Array.prototype.slice.call(arguments).sort();
}

// rest参数的写法
const sortNumbers = (...numbers) => numbers.sort();
```
上面代码的两种写法，比较后可以发现，rest 参数的写法更自然也更简洁。

`arguments`对象不是数组，而是一个类似数组的对象。所以为了使用数组的方法，必须使用`Array.prototype.slice.call`先将其转为数组。rest 参数就不存在这个问题，它就是一个真正的数组，数组特有的方法都可以使用。下面是一个利用 rest 参数改写数组`push`方法的例子。
```js
function push(array, ...items) {
  items.forEach(function(item) {
    array.push(item);
    console.log(item);
  });
}

var a = [];
push(a, 1, 2, 3)
```
注意，rest 参数之后不能再有其他参数（即只能是最后一个参数），否则会报错。
```js
// 报错
function f(a, ...b, c) {
  // ...
}
```
函数的`length`属性，不包括 rest 参数。
```js
(function(a) {}).length  // 1
(function(...a) {}).length  // 0
(function(a, ...b) {}).length  // 1
```

> 箭头函数不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用 `rest` 参数代替

</details>

## 30. es5 中的类和es6中的class有什么区别？ {#question-1036468a-13c7-49d5-af8f-31c31135ceea}

> 难度：3 · 类型：QA

### 题目要点

### ES5 vs ES6 类

#### ES5

- 使用构造函数和`prototype`来模拟类。
- 继承通过原型链或对象冒充实现。
- 没有专门的静态方法和属性的语法。
- 类（实际上是构造函数）可以像普通函数一样被调用（尽管不推荐）。

#### ES6

- 引入`class`关键字，使类的定义更加直观。
- 使用`constructor`方法定义构造函数。
- 使用`static`关键字定义静态方法和属性。
- 继承通过`extends`关键字和`super`调用实现。
- 类的定义必须使用`new`关键字来实例化。
- 类的内部方法（包括构造函数）自动添加到类的`prototype`上，但语法更简洁。

简而言之，ES6的类语法提供了更直观、面向对象的方式来定义和使用类，而ES5则需要通过构造函数和原型链来模拟这些特性。

<details>
<summary>参考答案</summary>

在es5中主要是通过构造函数方式和原型方式来定义一个类，在es6中我们可以通过class来定义类。

## 一、class类必须new调用，不能直接执行。

![image.png](https://static.ecool.fun//article/c1841b40-fce7-466c-9316-38c057419c40.png)

class类执行的话会报错，而es5中的类和普通函数并没有本质区别，执行肯定是ok的。

## 二、class类不存在变量提升

![image.png](https://static.ecool.fun//article/5378c86b-1d14-41d6-8661-e6bd762cd17a.png)

![image.png](https://static.ecool.fun//article/43a43e47-2362-4f57-9b4c-0461033ed0a6.png)

图2报错，说明class方式没有把类的定义提升到顶部。

## 三、class类无法遍历它实例原型链上的属性和方法

```js
function Foo (color) {
    this.color = color
}
Foo.prototype.like = function () {
    console.log(`like${this.color}`)
}
let foo = new Foo()

for (let key in foo) {
    // 原型上的like也被打印出来了
    console.log(key)  // color、like
}
```

```js
class Foo {
    constructor (color) {
        this.color = color
    }
    like () {
        console.log(`like${this.color}`)
    }
}
let foo = new Foo('red')

for (let key in foo) {
    // 只打印一个color,没有打印原型链上的like
    console.log(key)  // color
}
```

## 四、new.target属性

es6为new命令引入了一个new.target属性，它会返回new命令作用于的那个构造函数。如果不是通过new调用或Reflect.construct()调用的，new.target会返回undefined

```js
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('必须使用 new 命令生成实例');
  }
}

let obj = {}
Person.call(obj, 'red') // 此时使用非new的调用方式就会报错
```

## 五、class类有static静态方法

static静态方法只能通过类调用，不会出现在实例上；另外如果静态方法包含 this 关键字，这个 this 指的是类，而不是实例。static声明的静态属性和方法可以被子类继承，但不能被子类实例继承。

```js
class Foo {
  static bar() {
    this.baz(); // 此处的this指向类
  }
  static baz() {
    console.log('hello'); // 不会出现在实例中
  }
  baz() {
    console.log('world');
  }
}

Foo.bar() // hello
```

</details>

## 31. ES6有哪些新特性？ {#question-5e131c75-d26e-4527-8f51-29d842f3c829}

> 难度：2 · 类型：QA

### 题目要点

### ES6 新特性分类

1. **解决原有语法不足**：例如 `let` 和 `const` 用于块级作用域，解决了 `var` 声明变量时的提升问题。
2. **原有语法增强**：如解构赋值、模板字符串、参数默认值等。
3. **新增对象、方法和功能**：如 `Promise`、`Proxy`、`Object.assign`、`is` 等。
4. **新增数据类型和数据结构**：如 `Symbol`、`Set`、`Map` 等。

### 具体特性

1. **let 和 const**：提供了块级作用域，并且声明的变量不会提升。
2. **解构**：允许快速提取数组或对象中的元素。
3. **模板字符串**：允许在字符串中嵌入表达式，并且可以换行。
4. **字符串扩展方法**：提供了 `includes`、`startsWith`、`endsWith` 等方法。
5. **参数默认值和剩余参数**：允许在函数定义时提供默认值，并收集剩余参数。
6. **展开数组**：使用 `...` 展开数组。
7. **箭头函数**：简化了函数的写法，并且 `this` 的绑定是静态的。
8. **对象字面量增强**：允许省略键值对中的键名，使用计算属性等。
9. **Object.assign**：用于复制和合并对象。
10. **Object.is**：比较两个值是否相等，不进行隐式类型转换。
11. **Proxy**：提供了对象代理，可以监控对象的读写操作。
12. **Reflect**：提供了一系列对象操作的方法。
13. **Promise**：用于解决异步编程中的回调嵌套问题。
14. **class**：用于类和继承的定义。
15. **Set**：类似数组的数据结构，元素唯一。
16. **Map**：类似 Object，以键值对形式存储数据。
17. **Symbol**：用于定义唯一的变量。
18. **for...of...**：用于遍历引用数据类型。
19. **迭代器模式**：通过 `Symbol.iterator` 提供统一的迭代接口。
20. **Generator 生成器**：用于惰性执行，解决异步回调过深的问题。
21. **includes 函数**：判断数组是否包含某个元素。
22. **指数运算符**：简化指数运算。
23. **values 函数**：返回对象的值数组。
24. **entries 函数**：返回对象的键值对数组。
25. **Object.getOwnPropertyDescriptors**：获取对象的描述信息。
26. **padStart 和 padEnd 函数**：在字符串前或后追加指定字符串。

<details>
<summary>参考答案</summary>

### 关于ES6和JavaScript的关系

##### 1、ES6是对于ES2015+的俗称，也可以说是通常叫法，那么，ES6是什么呢？

ES 全称是ECMAScript，它是JavaScript基础构建的一种语言，JavaScript正是建立在ECMAScript语言的基础规范中建立使用的，那么，ECMAScript的使用，对于JavaScript至关重要！

在我的理解中，ECMAScript是一种语言层面的东西，它只是定义了JavaScript以及在它基础之上建立的其他语言的语法规范，而JavaScript的语言，更关于一种平台性质在其中。

JavaScript包括 ECMAScript、DOM、BOM三个组成部分，DOM和BOM是web API提供的接口或者是JavaScript和浏览器之间进行交互的部分，实质就是操纵文档元素，进行展示布局，而ECMAScript在JavaScript中其中语法的作用，它不会去跟文档有直接的关系，但是他的数据处理完成后会通过web API展示在文档中。

### ES6新特性的分类

新特性主要归为四大类：

* 解决原有语法上的一些不足

比如let 和 const 的块级作用域

* 对原有语法进行增强

比如解构、展开、参数默认值、模板字符串

* 全新的对象、全新的方法、全新的功能

比如promise、proxy、object的assign、is

* 全新的数据类型和数据结构

比如symbol、set、map

下面具体进行介绍

## 1. let、const 块级作用域以及和 var 的区别

- let、const 声明的变量，在 for，if 语句中，会形成块级作用域，块级作用域内的变量，不能被作用域外部使用
- let、const 声明变量不再会有声明提升，在变量声明之前使用运行时会报错

```js
//块级作用域一级块级作用域的使用
if (true) {
  const param = 'param in if block'
  console.log(param) //param in if block
}
console.log(param) //块级作用域外访问内部定义的变量，ReferenceError: param is not defined
```

- 块级作用域声明变量，会出现“暂时性死区”，块级作用域声明变量前使用变量，将会报错

```js
// 暂时性死区
const i = 100
if (i) {
  console.log(i) //ReferenceError: Cannot access 'i' before initialization
  const i = 1000
}
```

- const 声明的是一个常量，声明必须初始化

```js

    // const常量声明必须初始化
    const i;
    i = 10;
    console.log(i) //SyntaxError: Missing initializer in const declaration

```

- 如果 const 声明的是基本类型常量，初始化之后不能修改；引用类型的常量，可以修改其成员变量；

```js
// 基本类型常量不能修改，引用类型常量能修改属性
const str = 'str'
str = 'str1' //TypeError: Assignment to constant variable.

const arr = [1, 2, 3]
arr[0] = 100
console.log(arr[0]) //100
```

- 和 var 的区别

| 声明方式 | 变量提升 | 作用域 | 初始值 | 重复定义 |
| -------- | -------- | ------ | ------ | -------- |
| var      | 是       | 函数级 | 不需要 | 允许     |
| let      | 否       | 块级   | 不需要 | 不允许   |
| const    | 否       | 块级   | 必需   | 不允许   |

## 2.解构-快速提取数组/对象中的元素

- **数组解构**

- 单独解构-根据数组索引，将数组解构成单独的元素

```js
const arr = [1, 2, 3]

const [a, b, c] = arr
console.log(a, b, c) //1,2,3
const [, , d] = arr
console.log(d) //3
```

- 默认值，解构时可以给变量设置默认值，数组没有这个元素的话

```js
const arr = [1, 2, 3]

const [, , , defaultVal = '4'] = arr
console.log('设置默认值', defaultVal)
```

- 剩余解构-用 "...+变量名" 解构剩余参数到新数组，只能用一次

```js
const arr = [1, 2, 3]

const [e, ...rest] = arr
console.log(rest) //[2, 3]
```

- 实例应用

```js
// 拆分字符串
const str = 'xiaobai/18/200'
const strArr = str.split('/')
const [, age] = strArr
console.log(age) //18
```

- **对象解构**

- 单个/多个解构-跟数组解构差不多

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name, age } = obj
console.log(name, age) // 'xiaohui', 18
```

- 解构+重命名-给解构出来的变量重命名

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name: objName } = obj
console.log(objName)
```

- 默认值-给解构变量设置默认值

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { next = 'default' } = obj
console.log(next)
```

## 3.模板字符串

用法：使用``将字符串包裹起来

功能：可以换行、插值、使用标签函数进行字符串操作

示例：

- 换行/插值

```js
//换行
const str = `fdsjak
    fdsa`
console.log(str)

// 插值
const strs = `random: ${Math.random()}`
console.log(strs)
```

- 标签函数-可以对模板字符串的字符串和插值进行处理和过滤等操作

```js
/**
 * 字符串模板函数
 * @param {array} strs 以插值为分隔符组成的字符串数组
 * @param {string} name 插值的value，有多少个就会传入多少个
 */
const tagFunc = (strs, name, gender) => {
  const [str1, str2, str3] = strs
  const genderParsed = gender == '1' ? '男' : '女'
  // 可以在此做过滤，字符串处理，多语言等操作
  return str1 + name + str2 + str3 + genderParsed
}

// 带标签的模板字符串,
const person = {
  name: 'xiaohui',
  gender: 1,
}
// 返回值为标签函数的返回值
const result = tagFunc`my name is ${person.name}.gender is ${person.gender}`
console.log(result) //my name is xiaohui.gender is 男
```

## 4. 字符串扩展方法

- includes-是否包含
- startsWith-是否以什么开始
- endsWith-是否以什么结束

```js
const str = 'abcd'

console.log(str.includes('e')) //false
console.log(str.startsWith('a')) //true
console.log(str.endsWith('a')) //false
```

## 5.参数默认值&剩余参数

- 给函数形参设置默认值

```js
// 带默认参数的形参一般放在后面，减少传参导致的错误几率
const defaultParams = function (name, age = 0) {
  return [age, name]
}
console.log(defaultParams(1))
```

- 使用...rest 形式设置剩余形参，支持无限参数

```js
// 剩余参数，转化成数组
const restParams = function (...args) {
  console.log(args.toString()) //1, 2, 3, 4, 5
}

restParams(1, 2, 3, 4, 5)
```

## 6.展开数组

使用...将数组展开

```js
const arr = [1, 2, 3]

console.log(...arr)
// 等价于es5中以下写法
console.log.apply(console, arr)
```

## 7.箭头函数

**特性&优势：**

- 1、简化了函数的写法
- 2、没有 this 机制，this 继承自上一个函数的上下文，如果上一层没有函数，则指向 window
- 3、作为异步回调函数时，可解决 this 指向问题

```js
const inc = (n) => n + 1
console.log(inc(100))

const obj = {
  name: 'aa',
  func() {
    setTimeout(() => {
      console.log(this.name) //aa
    }, 0)
    setTimeout(function () {
      console.log(this.name) //undefined
    }, 0)
  },
}
obj.func()
```

## 8.对象字面量增强

- 同名属性可以省略 key:value 形式，直接 key，
- 函数可以省略 key：value 形式
- 可以直接 func(),
- 可以使用计算属性，比如：{[Math.random()]: value}

```js
/**
 * 1、增强了对象字面量：
 * 1，同名属性可以省略key:value形式，直接key，
 * 2，函数可以省略key：value形式
 * 3，可以直接func(),
 * 4，可以使用计算属性，比如：{[Math.random()]: value}
 */
const arr = [1, 2, 3]
const obj = {
  arr,
  func() {
    console.log(this.arr)
  },
  [Math.random()]: arr,
}

console.log(obj)
```

## 9.Object.assign(target1, target2, targetN)-复制/合并对象

```js
/**
 * Object.assign(target1, target2, ...targetn)
 * 后面的属性向前面的属性合并
 * 如果target1是空对象，可以创建一个全新对象，而不是对象引用
 */
const obj1 = {
  a: 1,
  b: 2,
}
const obj2 = {
  a: 1,
  b: 2,
}

const obj3 = Object.assign({}, obj1)
obj3.a = 5
console.log(obj3, obj2, obj1)
```

## 10.Object.is(value1, value2)

作用：比较两个值是否相等

特性：

- 没有隐式转换
- 可以比较+0,-0、NaN

```js
console.log(NaN === NaN) //false
console.log(Object.is(NaN, NaN)) //true
console.log(0 === -0) // true
console.log(Object.is(0, -0)) //false
console.log(Object.is(1, 1)) //true
```

## 11.Proxy(object, handler)

**作用：**

- 代理一个对象的所有，包括读写操作和各种操作的监听

**用法：**

```js
const P = {
  n: 'p',
  a: 19,
}

const proxy = new Proxy(P, {
  get(target, property) {
    console.log(target, property)
    return property in target ? target[property] : null
  },
  defineProperty(target, property, attrs) {
    console.log(target, property, attrs)
    //   throw new Error('不允许修改')
  },
  deleteProperty(target, property) {
    console.log(target, property)
    delete target[property]
  },
  set(target, property, value) {
    target[property] = value
  },
})

proxy.c = 100
console.log('pp', P)
```

与 Object.defineProperty 对比

优势：

- **拥有很多 defineProperty 没有的属性方法，比如：**
  - handler.getPrototypeOf() ---Object.getPrototypeOf 方法的监听器
  - handler.setPrototypeOf() ---Object.setPrototypeOf 方法的监听器。
  - handler.isExtensible() ---Object.isExtensible 方法的监听器。
  - handler.preventExtensions() ---Object.preventExtensions 方法的监听器。
  - handler.getOwnPropertyDescriptor() ---Object.getOwnPropertyDescriptor 方法的监听器。
  - handler.defineProperty() ---Object.defineProperty 方法的监听器。
  - handler.has() ---in 操作符的监听器。
  - handler.get() ---属性读取操作的监听器。
  - handler.set() ---属性设置操作的监听器。
  - handler.deleteProperty() ---delete 操作符的监听器
  - handler.ownKeys() ---Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的监听器。
  - handler.apply() ---函数调用操作的监听器。
  - handler.construct() ---new 操作符的监听器。
- **对数组的监视更方便**
- **以非侵入的访视监管对象的读写**

## 12.Reflect

作用：

集成 Object 操作的所有方法，统一、方便，具体方法如下：

用于对对象的统一操作，集成 Object 相关的所有方法

1、apply：类似 Function.prototype.apply

2、Reflect.construct()

对构造函数进行 new 操作，相当于执行 new target(...args)。

3、Reflect.defineProperty()

和 Object.defineProperty() 类似。

4、Reflect.deleteProperty()

作为函数的 delete 操作符，相当于执行 delete target[name]。

5、Reflect.get()

获取对象身上某个属性的值，类似于 target[name]。

6、Reflect.getOwnPropertyDescriptor()

类似于 Object.getOwnPropertyDescriptor()。

7、Reflect.getPrototypeOf()

类似于 Object.getPrototypeOf(), 获取目标对象的原型。

8、Reflect.has()

判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。

9、Reflect.isExtensible()

类似于 Object.isExtensible().判断对象是否可扩展，可以添加额外属性

Object.seal(封闭对象)， Object.freeze（冻结对象）是不可扩展的

10、Reflect.ownKeys()

返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受 enumerable 影响).

11、Reflect.preventExtensions()

类似于 Object.preventExtensions()。返回一个 Boolean。

12、Reflect.set()

将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true, 反之返回 false。

13、Reflect.setPrototypeOf()

类似于 Object.setPrototypeOf()。

示例：

```js
const obj = {
  name: 'reflect',
}
Reflect.preventExtensions(obj) //禁止扩展
console.log(Reflect.set(obj, 'age', 'xiaobai')) //false
console.log(obj) //{ name: 'reflect' }
console.log(Reflect.isExtensible(obj, 'name')) //false
console.log(Reflect.ownKeys(obj)) //[ 'name' ]
```

## 13.Promise

作用：解决异步编程中回调嵌套过深问题

## 14.class&静态方法&继承

**定义**

- 使用 class 关键字定义类

```js
class Person {
  constructor(props) {
    this.props = props
  }
}
```

**方法**

- 实例方法，需要实例化之后才能调用，this 指向实例
- 静态方法，用 static 修饰符修饰，可以直接通过类名调用，不需要实例化，this 不指向实例，而是指向当前类

```js
class Person {
  constructor(props) {
    this.props = props
  }
  // 实例方法
  eat() {}
  // 静态方法
  static run() {}
}
// 调用静态方法
Person.run()
const person = new Person('props')
// 调用实例方法
person.eat()
```

**继承：子类使用 extends 关键字实现继承，可以继承父类所有属性**

```js
class Student extends Person {
  constructor(props) {
    super(props)
  }
  printProps() {
    console.log(this.props)
  }
}

const student = new Student('student')
student.printProps()
```

## 15.Set

说明：

Set 是一种类似于数组的数据结构

特性：

- 元素唯一性，不允许重复元素
- 使用 add 增加重复元素，将会被忽略

用途：

- 数组去重
- 数据存储

```js
const arr = [1, 3, 1, 1, 1]
const set = new Set(arr)
set.add(1).add(1)
console.log(set.size) //2
const newArr = Array.from(set)
console.log(newArr) //[ 1, 3 ]
```

## 16.Map

说明：

类似 Object，以 key、value 形式存储数据

区别：

Map 键不会隐式转换成字符串，而是保持原有类型

实例：

```js
const map = new Map()
map.set(1, 1)
map.set('name', 'map')
map.set(obj, obj)
console.log(map.get(1)) //1
/**
        1 1
        name map
        { '1': 1, true: true, a: 'a' } { '1': 1, true: true, a: 'a' }
     */
map.forEach((val, key) => {
  console.log(key, val)
})
```

## 17.Symbol

说明：

JavaScript 第六种原始数据类型，用来定义一个唯一的变量

作用：

- 创建唯一的变量，解决对象键名重复问题
- 为对象、类、函数等创建私有属性

- 修改对象的 toString 标签
- 为对象添加迭代器属性

如何获取对象的 symbol 属性？

- Object.getOwnPropertySymbols(object)

实例

```js
// 对象属性重名问题；
const objSymbol = {
  [Symbol()]: 1,
  [Symbol()]: 2,
}
console.log(objSymbol)

// 2、为对象、类、函数等创建私有属性
const name = Symbol()
const obj2 = {
  [name]: 'symbol',
  testPrivate() {
    console.log(this[name])
  },
}

obj2.testPrivate()
// 定义toString标签；
console.log(obj2.toString())
obj2[Symbol.toStringTag] = 'xx'
console.log(obj2.toString()) //[object xx]
```

## 18.for...of...

用途：

已统一的方式，遍历所有引用数据类型

特性：

可以随时使用 break 终止遍历，而 forEach 不行

实例：

```js
// 基本用法
// 遍历数组
const arr = [1, 2, 3, 4]
for (const item of arr) {
  if (item > 3) {
    break
  }
  if (item > 2) {
    console.log(item)
  }
}

// 遍历set
const set = new Set()
set.add('foo').add('bar')
for (const item of set) {
  console.log('set for of', item)
}
// 遍历map
const map = new Map()
map.set('foo', 'one').set('bar', 'two')
for (const [key, val] of map) {
  console.log('for of map', key, val)
}
//迭代对象
const obj = {
  name: 'xiaohui',
  age: '10',
  store: [1, 2, 3],
  // 实现可迭代的接口
  [Symbol.iterator]: function () {
    const params = [this.name, this.age, this.store]
    let index = 0
    return {
      next() {
        const ret = {
          value: params[index],
          done: index >= params.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of obj) {
  console.log('obj for of', item)
}
```

## 19. 迭代器模式

作用：通过 Symbol.interator 对外提供统一的接口，获取内部的数据

外部可以通过 for...of...去迭代内部的数据

```js
const tods = {
  life: ['eat', 'sleep'],
  learn: ['js', 'dart'],
  // 增加的任务
  work: ['sale', 'customer'],
  [Symbol.iterator]: function () {
    const all = []
    Object.keys(this).forEach((key) => {
      all.push(...this[key])
    })
    let index = 0
    return {
      next() {
        const ret = {
          value: all[index],
          done: index >= all.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of tods) {
  console.log(item)
}
```

## 20.Generator 生成器

- Generator
- 函数前添加 *，生成一个生成器
- 一般配合 yield 关键字使用
- 最大特点，惰性执行，调 next 才会往下执行
- 主要用来解决异步回调过深的问题

```js
// 生成迭代器方法
//  生成器Generator的应用

function* createIdGenerator() {
  let id = 1
  while (id < 3) yield id++
}
const createId = createIdGenerator()
console.log(createId.next()) //{ value: 1, done: false }
console.log(createId.next()) //{ value: 2, done: false }
console.log(createId.next()) //{ value: undefined, done: true }

const todos = {
  life: ['eat', 'sleep', 'baba'],
  learn: ['es5', 'es6', 'design pattern'],
  work: ['b', 'c', 'framework'],
  [Symbol.iterator]: function* () {
    const all = [...this.life, ...this.learn, ...this.work]
    for (const i of all) {
      yield i
    }
  },
}
for (const item of todos) {
  console.log(item)
}
```

## 21.includes 函数-es2016

判断数组是否包含某个元素，包含 NaN，解决 indexOf 无法查找 NaN 问题

```js
//  includes函数
const arr = ['foo', 'bar', 'baz', NaN]
console.log(arr.includes(NaN)) //true
console.log(arr.indexOf(NaN)) //-1
```

## 22. 运算符-es2016

指数运算

```js
// 指数运算符 **
// es5中2十次方
console.log(Math.pow(2, 10))
// es6中2十次方
console.log(2 ** 10)
```

## 23.values 函数-es2017

将对象的值以数组的形式返回

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}

console.log(Object.values(obj)) //[ 1, 2, 3 ]
```

## 24.entries 函数-es2017

将对象以键值对二维数组返回，使之可以使用 for...of...遍历

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}
console.log(Object.entries(obj))
const entry = Object.entries(obj)
for (const [key, value] of entry) {
  console.log(key, value)
}
```

## 25.Object.getOwnPropertyDescriptors(obj)-es2017

获取对象的描述信息

可以通过获得的描述信息，配合 Object.defineProperties 来完整复制对象，包含 get，set 方法

```js
// getOwnPropertyDescriptors

// 普通get方法
const objGet = {
  foo: 1,
  bar: 2,
  get getCount() {
    return this.foo + this.bar
  },
}
// assign方法会把getCount当做普通属性复制，从而getCount为3，修改bar不管用
const objGet1 = Object.assign({}, objGet)
objGet1.bar = 3
console.log(objGet1.getCount) //3
// descriptors
const descriptors = Object.getOwnPropertyDescriptors(objGet)
console.log('des', descriptors)
// 通过descriptors来复制对象，可以完整复制对象，包含get，set
const objGet2 = Object.defineProperties({}, descriptors)
objGet2.bar = 3
console.log(objGet2.getCount) //4
```

## 26.padStart, padEnd 函数-es2017

在字符串前，或者后面追加指定字符串

参数：

targetLenght: 填充后的目标长度

padString:填充的字符串

规则：

1、填充的字符串超过目标长度，会在规定长度时被截断

2、填充字符串太短会以空格填充

3、padString 未传值，以空格填充

作用：

一般用来对齐字符串输出

```js

    /**
     *  foo.................|1
        barbar..............|2
        bazbazbaz...........|3
     */
    console.log(`${key.padEnd(20, '.')}${value.toString().padStart(2, '|')}`)
```

</details>

## 32. 箭头函数的 this 指向哪⾥？ {#question-33363940-179b-4ae3-9cd3-7bf0a5619df9}

> 难度：3 · 类型：QA

### 题目要点

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

<details>
<summary>参考答案</summary>

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

可以⽤Babel理解⼀下箭头函数:

```js
// ES6
const obj = {
  getArrow() {
    return () => {
      console.log(this === obj);
    };
  }
}
```

转化后：

```js
// ES5，由 Babel 转译
var obj = {
   getArrow: function getArrow() {
     var _this = this;
     return function () {
        console.log(_this === obj);
     };
   }
};
```

</details>

## 33. 如果new一个箭头函数会怎么样？ {#question-31134096-417d-48df-8030-68dd004c40d1}

> 难度：2 · 类型：QA

### 题目要点

箭头函数是ES6中的提出来的，它没有prototype，也没有自己的this指向，更不可以使用arguments参数，所以不能New一个箭头函数。

<details>
<summary>参考答案</summary>

箭头函数是ES6中的提出来的，它没有prototype，也没有自己的this指向，更不可以使用arguments参数，所以不能New一个箭头函数。

new操作符的实现步骤如下：

1、创建一个空的简单JavaScript对象（即{}）；

2、为步骤1新创建的对象添加属性__proto__，将该属性链接至构造函数的原型对象 ；

3、将步骤1新创建的对象作为this的上下文 ；

4、如果该函数没有返回对象，则返回this。

所以，上面的第二、三步，箭头函数都是没有办法执行的。

</details>

## 34. object.assign和扩展运算法是深拷贝还是浅拷贝，两者区别是什么？ {#question-8244fd41-2b94-4179-887f-177501ddf280}

> 难度：3 · 类型：QA

### 题目要点

扩展运算符

<details>
<summary>参考答案</summary>

* 扩展运算符

```js
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = {...outObj}
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

* Object.assign()

```js
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = Object.assign({}, outObj)
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

可以看到，两者都是浅拷贝。

Object.assign()方法接收的第一个参数作为目标对象，后面的所有参数作为源对象。然后把所有的源对象合并到目标对象中。它会修改了一个对象，因此会触发 ES6 setter。

扩展操作符（…）使用它时，数组或对象中的每一个值都会被拷贝到一个新的数组或对象中。它不复制继承的属性或类的属性，但是它会复制ES6的 symbols 属性。

</details>

## 35. 谈谈 Object.defineProperty 与 Proxy 的区别 {#question-09420ad4-4cd0-4c3d-9b56-970e21c8f208}

> 难度：3 · 类型：QA

### 题目要点

### Vue2.x 中的双向绑定实现

- **基于**：Vue2.x 的双向绑定是基于 `Object.defineProperty` 实现的。
- **问题**：这种方式存在一些局限性：
  1. **数组监听**：无法直接监听数组的变化，需要重写数组的方法来模拟。
  2. **属性遍历**：需要遍历对象的每个属性来定义属性描述符。
  3. **嵌套对象监听**：需要递归遍历嵌套对象的所有属性。

### Vue3.x 中的双向绑定实现

- **基于**：Vue3.x 使用 `Proxy` 代理的方式实现双向绑定。
- **优势**：
  1. **对象深度监听**：Proxy 可以针对整个对象进行代理，无需遍历每个属性，解决了深度递归的问题。
  2. **数组监听**：Proxy 可以直接监听数组的变化，无需重写数组方法。
  3. **拦截方法**：Proxy 提供更多的拦截方法，如 `get`、`set`、`deleteProperty` 等，使得数据劫持更加灵活。
  4. **性能优化**：Proxy 可能得到浏览器针对性的优化，有助于性能提升。

<details>
<summary>参考答案</summary>

在 Vue2.x 的版本中，双向绑定是基于 Object.defineProperty 方式实现的。而 Vue3.x 版本中，使用了 ES6 中的 Proxy 代理的方式实现。

## Object.defineProperty(obj, prop, descriptor)

使用 Object.defineProperty 会产生三个主要的问题：

* 不能监听数组的变化

在 Vue2.x 中解决数组监听的方法是将能够改变原数组的方法进行重写实现（比如：push、 pop、shift、unshift、splice、sort、reverse），举例：

```javascript
// 我们重写 push 方法
const originalPush = Array.prototype.push

Array.prototype.push = function() {
  // 我们在这个位置就可以进行 数据劫持 了
  console.log('数组被改变了')

  originalPush.apply(this, arguments)
}
```

* 必须遍历对象的每个属性

可以通过 Object.keys() 来实现

* 必须深层遍历嵌套的对象

通过递归深层遍历嵌套对象，然后通过 Object.keys() 来实现对每个属性的劫持

## Proxy

* Proxy 针对的整个对象，Object.defineProperty 针对单个属性，这就解决了 需要对对象进行深度递归（支持嵌套的复杂对象劫持）实现对每个属性劫持的问题

```javascript
// 定义一个复杂对象
const obj = {
    obj: {
        children: {
            a: 1
        }
    }
}

const objProxy = new Proxy(obj, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },

    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(objProxy.obj) // 输出 '-- target --'
console.log(objProxy.a = 2) // 输出 '-- set --'
```

* Proxy 解决了 Object.defineProperty 无法劫持数组的问题

```javascript
const ary = [1, 2, 3]

const aryProxy = new Proxy(ary, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(aryProxy[0]) // 输出 '-- target --'
console.log(aryProxy.push(1)) // 输出 '-- set --'
```

*  比 Object.defineProperty 有更多的拦截方法，对比一些新的浏览器，可能会对 Proxy 针正对性的优化，有助于性能提升

</details>

## 36. ES6中的 Reflect 对象有什么用？ {#question-18682a73-0c4e-4859-96fd-2a6fde7587b7}

> 难度：3 · 类型：QA

### 题目要点

### Reflect 对象

- **定义**：Reflect 对象不是构造函数，因此在创建时不需要使用 `new` 关键字。
- **目的**：
  1. **统一内部方法**：将一些明显属于语言内部的方法（如 `Object.defineProperty`）从 `Object` 对象转移到 `Reflect` 对象上。
  2. **改进方法行为**：修改某些 `Object` 方法的返回结果，使其行为更合理。
  3. **命令式操作函数化**：将某些 `Object` 操作（如 `name in obj` 和 `delete obj[name]`）转换为函数行为。
  4. **与 Proxy 对象对应**：Reflect 对象的方法与 Proxy 对象的方法一一对应，提供了一种调用默认行为的机制。

### Reflect 对象与 Proxy 对象

- **对应关系**：Reflect 对象的方法与 Proxy 对象的方法一一对应。
- **功能**：Proxy 对象通过调用对应的 Reflect 方法来执行默认行为，同时可以修改行为。

<details>
<summary>参考答案</summary>

Reflect 对象不是构造函数，所以创建时不是用 new 来进行创建。

在 ES6 中增加这个对象的目的：

- 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
- 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc)则会返回 false。
- 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name]，而 Reflect.has(obj, name)和 Reflect.deleteProperty(obj, name)让它们变成了函数行为。
- Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

```javascript
var loggedObj = new Proxy(obj, {
  get(target, name) {
    console.log("get", target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log("delete" + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log("has" + name);
    return Reflect.has(target, name);
  },
});

```

上面代码中，每一个 Proxy 对象的拦截操作（get、delete、has），内部都调用对应的 Reflect 方法，保证原生行为能够正常执行。添加的工作，就是将每一个操作输出一行日志。

</details>

## 37. 简单介绍下 ES6 中的 Iterator 迭代器 {#question-c188ea2f-8882-413c-af52-3ccce36f35cf}

> 难度：3 · 类型：QA

### 题目要点

### Iterator 迭代器的作用

- **定义**：Iterator 迭代器是为了解决不同数据结构遍历问题而设计的，它提供了一个统一的访问机制。
- **数据结构**：目前 Map、Set、Array 都支持 Iterator。
- **接口**：迭代器提供了一个统一的接口，使得不同数据结构的遍历方式一致。
- **for...of 依赖**：for...of 循环依赖于 Iterator 迭代器来实现遍历。

### Iterator 规范

- **规范定义**：Iterator 规范定义了迭代器必须有一个 `next()` 方法。
- **next 方法返回**：`next()` 方法调用时，返回一个包含 `value` 和 `done` 属性的对象。
- **可迭代对象**：要成为可迭代对象，一个对象必须实现 `@@iterator` 方法，该方法可以通过 `Symbol.iterator` 访问。
- **应用场景**：通过定义一个对象的 `Symbol.iterator` 属性，可以将其修改为迭代器对象，支持 `for...of` 遍历。

### 总结

- Iterator 迭代器提供了一个统一的接口，为不同的数据结构提供了统一的访问机制。
- 通过定义对象的 `Symbol.iterator` 属性，可以使其成为可迭代对象，支持 `for...of` 遍历。
- Iterator 规范定义了迭代器必须有一个 `next()` 方法，该方法返回包含 `value` 和 `done` 属性的对象。

<details>
<summary>参考答案</summary>

想必大家使用过for循环、while循环等，遍历Array获取其中的值，那其他数据结构如何通过遍历获取呢？或者这样说，是否可以提供一个统一的访问机制？来访问Object、Map、Set等。

轮到Iterator迭代器出场，Iterator迭代器就是为了解决这个问题，它提供统一的接口，为不同的数据结构提供统一的访问机制。(目前Map、Set、Array支持Iterator)。

顾名思义，Iterator迭代器的出现就是为了迭代而生，为不同的集合：Object、Array、Map、Set，提供了一个统一的接口（这里接口可以简单的理解为方法，就是遍历方法）。像我们常用的for...of就是依赖与Iterator迭代器。

在这里顺便提一嘴，我理解到的遍历、迭代的关系：遍历就是访问数据结构的所有元素，而迭代是遍历的一种形式。

```javascript
// 阮一峰 ECMAScript 6 入门
// 模拟next方法返回值
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true}
    }
  }
}
```

上面的makeIterator函数，它就是一个迭代器生成函数，作用就是返回一个迭代器对象。对数组执行这个函数，就会返回该数组的迭代器对象it。

通过调用next函数，返回value和done两个属性；value属性返回当前位置的成员，done属性是一个布尔值，表示遍历是否结束，即是否还有必要再一次调用next方法；当done为true时，即遍历完成。

小结：Iterator迭代器就是一个接口方法，它为不同的数据结构提供了一个统一的访问机制；使得数据结构的成员能够按某种次序排列，并逐个被访问。

## Iterator规范

在上面的代码中，迭代器对象it包含一个next() 方法，调用next()方法，返回两个属性：布尔值done和值value，value的类型无限制。

迭代器对象包含的属性我们知道了，那么在日常开发中，我们如何让一个对象成为一个可迭代对象呢？（可迭代对象即支持迭代器规范的对象）

要成为可迭代对象， 一个对象必须实现@@iterator方法。这意味着对象（或者它原型链上的某个对象）必须有一个键为@@iterator的属性，可通过常量 Symbol.iterator 访问该属性。

```javascript
let myIterable = {
    a: 1,
    b: 2,
    c: 3
}
myIterable[Symbol.iterator] = function() {
  let self = this;
  let arr = Object.keys(self);
  let index = 0;
  return {
    next() {
      return index < arr.length ? {value: self[arr[index++]], done: false} : {value: undefined, done: true};
    }
  }
}

var it = myIterable[Symbol.iterator]();

it.next();

for(const i of myIterable) {
  console.log(i);
}
```

将myIterable对象添加Symbol.iterator属性，同时在返回的next方法中，添加两个属性，既让它成为了一个可迭代对象。（其实如果真的有这样的需求，可以考虑使用Map）。

小结：Iterator规范————Iterator迭代器包含一个next()方法，方法调用返回返回两个属性：done和value；通过定义一个对象的Symbol.iterator属性，即可将此对象修改为迭代器对象，支持for...of遍历。

</details>

## 38. 什么是 let 的临时性死区？ {#question-769ab8fd-1070-42d3-817e-48d9b37374ff}

> 难度：2 · 类型：QA

### 题目要点

let 会产生临时性死区，在当前的执行上下文中，会进行变量提升，但是未被初始化，所以在执行上下文执行阶段，执行代码如果还没有执行到变量赋值，就引用此变量就会报错，此变量未初始化。

<details>
<summary>参考答案</summary>

let 会产生临时性死区，在当前的执行上下文中，会进行变量提升，但是未被初始化，所以在执行上下文执行阶段，执行代码如果还没有执行到变量赋值，就引用此变量就会报错，此变量未初始化。

</details>

## 39. common.js和es6中模块引入的区别？ {#question-b9a0ceb2-84b5-4a79-8548-d043a97d0096}

> 难度：2 · 类型：QA

### 题目要点

**作答思路：**

在Common.js和ES6模块系统中，模块引入的区别主要体现在以下几个方面：

1. **运行时与编译时**：
   - **Common.js**：在运行时加载模块，模块代码是在require时执行的。
   - **ES6模块**：在编译时加载模块，模块代码是在编译阶段静态分析确定的。
2. **模块依赖**：
   - **Common.js**：模块是一个对象，require时返回模块对象。
   - **ES6模块**：模块是静态的，通过`import`引入。
3. **模块导出**：
   - **Common.js**：使用`module.exports`或`exports`导出模块。
   - **ES6模块**：使用`export`导出模块。
4. **模块导入**：
   - **Common.js**：使用`require`导入模块。
   - **ES6模块**：使用`import`导入模块。
5. **模块作用域**：
   - **Common.js**：模块内部的变量是全局变量。
   - **ES6模块**：模块内部的变量是模块私有变量。

**考察要点：**

1. **运行时与编译时**：理解Common.js和ES6模块系统在运行时和编译时的区别。
2. **模块依赖和导出**：理解模块的依赖关系和如何导出模块。
3. **模块导入和作用域**：理解模块的导入方式以及模块内部变量的作用域。

<details>
<summary>参考答案</summary>

CommonJS 和 ES6 模块系统在语法和行为上有显著的区别：

### CommonJS

CommonJS 是一种模块系统，主要用于 Node.js 环境。它使用 `require` 函数来引入模块，并使用 `module.exports` 来导出模块。

#### 语法

- **导出模块：**

```javascript
// moduleA.js
const name = 'John';
module.exports = name;

// 或者导出一个对象
const person = { name: 'John', age: 30 };
module.exports = person;
```

- **引入模块：**

```javascript
// main.js
const name = require('./moduleA');
console.log(name); // 'John'

// 引入对象
const person = require('./moduleA');
console.log(person.name); // 'John'
console.log(person.age);  // 30
```

#### 特点

1. **动态引入：** `require` 可以在函数体内、条件语句中动态引入模块。
    ```javascript
    if (condition) {
        const moduleA = require('./moduleA');
    }
    ```

2. **同步加载：** `require` 是同步的，模块在执行 `require` 时会立即加载并返回结果。

3. **导出的是值的拷贝：** 但对于对象和数组等引用类型，修改引用类型的属性会在所有引用中反映出来。
    ```javascript
    const obj = require('./moduleA');
    obj.newProp = 'new';
    console.log(require('./moduleA').newProp); // 'new'
    ```

### ES6 模块

ES6 模块系统是 ECMAScript 标准的一部分，使用 `import` 和 `export` 语法来定义模块，广泛用于现代前端开发以及一些支持 ES6 的服务器环境。

#### 语法

- **导出模块：**

```javascript
// moduleA.js
export const name = 'John';

// 导出默认值
const person = { name: 'John', age: 30 };
export default person;
```

- **引入模块：**

```javascript
// main.js
import { name } from './moduleA';
console.log(name); // 'John'

// 引入默认导出
import person from './moduleA';
console.log(person.name); // 'John'
console.log(person.age);  // 30
```

#### 特点

1. **静态引入：** `import` 必须在文件的顶部声明，不能在函数体内或条件语句中使用（**注意，这里有个例外，动态import()是可以在函数或者条件语句中使用的，这也是我们通常code splitting所依赖的特性**）。这使得 ES6 模块可以在编译时确定依赖关系和优化。
    ```javascript
    // 错误的用法
    if (condition) {
        import { name } from './moduleA';
    }
    ```

2. **异步加载：** 浏览器中的 ES6 模块是异步加载的，这意味着它们不会阻塞页面的其他加载过程。

3. **导出的是值的引用：** 导出值的引用意味着当导出模块中的值发生变化时，所有引用该值的地方都会反映出这些变化。
    ```javascript
    // moduleA.js
    export let count = 1;
    setTimeout(() => { count += 1; }, 1000);

    // main.js
    import { count } from './moduleA';
    setTimeout(() => { console.log(count); }, 2000); // 2
    ```

### 兼容性和转换

- **CommonJS 和 ES6 模块的互操作性：** 在 Node.js 环境中，可以使用工具如 Babel 或 Webpack 将 ES6 模块转换为 CommonJS 模块，从而实现兼容性。
- **双向兼容：** 使用工具链（如 Babel、Webpack）可以同时支持 CommonJS 和 ES6 模块语法，并在构建过程中根据目标环境进行转换。

### 总结

- **语法区别：** CommonJS 使用 `require` 和 `module.exports`，而 ES6 模块使用 `import` 和 `export`。
- **加载方式：** CommonJS 是同步加载，ES6 模块是静态分析和异步加载。
- **使用场景：** CommonJS 主要用于 Node.js 环境，而 ES6 模块是 ECMAScript 标准的一部分，更适合现代前端开发。

选择使用哪种模块系统取决于项目需求和运行环境。对于现代前端开发，推荐使用 ES6 模块。对于 Node.js 项目，传统上使用 CommonJS，但也可以逐渐迁移到 ES6 模块。

</details>

## 40. 箭头函数和普通函数有啥区别？箭头函数能当构造函数吗？ {#question-71f7613a-3703-4c0c-85c3-d8ad31fac232}

> 难度：3 · 类型：QA

### 题目要点

ES6中允许使用箭头=>来定义箭头函数，具体语法，我们来看一个简单的例子：

<details>
<summary>参考答案</summary>

## 什么是箭头函数？

ES6中允许使用箭头=>来定义箭头函数，具体语法，我们来看一个简单的例子：

```js
// 箭头函数
let fun = (name) => {
    // 函数体
    return `Hello ${name} !`;
};

// 等同于
let fun = function (name) {
    // 函数体
    return `Hello ${name} !`;
};
```

可以看出，定义箭头函在数语法上要比普通函数简洁得多。箭头函数省去了function关键字，采用箭头=>来定义函数。函数的参数放在=>前面的括号中，函数体跟在=>后的花括号中。

## 箭头函数与普通函数的区别

1、语法更加简洁、清晰

从上面的基本语法示例中可以看出，箭头函数的定义要比普通函数定义简洁、清晰得多，很快捷。

2、箭头函数不会创建自己的this（重要！！深入理解！！）

我们先来看看MDN上对箭头函数this的解释。

> 箭头函数不会创建自己的this，所以它没有自己的this，它只会从自己的作用域链的上一层继承this。

箭头函数没有自己的this，它会捕获自己在定义时（注意，是定义时，不是调用时）所处的外层执行环境的this，并继承这个this值。所以，箭头函数中this的指向在它被定义的时候就已经确定了，之后永远不会改变。

3、箭头函数继承而来的this指向永远不变（重要！！深入理解！！）

上面的例子，就完全可以说明箭头函数继承而来的this指向永远不变。对象obj的方法b是使用箭头函数定义的，这个函数中的this就永远指向它定义时所处的全局执行环境中的this，即便这个函数是作为对象obj的方法调用，this依旧指向Window对象。

4、.call()/.apply()/.bind()无法改变箭头函数中this的指向

.call()/.apply()/.bind()方法可以用来动态修改函数执行时this的指向，但由于箭头函数的this定义时就已经确定且永远不会改变。所以使用这些方法永远也改变不了箭头函数this的指向，虽然这么做代码不会报错。

5、箭头函数不能作为构造函数使用

我们先了解一下构造函数的new都做了些什么？简单来说，分为四步：

① JS内部首先会先生成一个对象；
② 再把函数中的this指向该对象；
③ 然后执行构造函数中的语句；
④ 最终返回该对象实例。

但是！！因为箭头函数没有自己的this，它的this其实是继承了外层执行环境中的this，且this指向永远不会随在哪里调用、被谁调用而改变，所以箭头函数不能作为构造函数使用，或者说构造函数不能定义成箭头函数，否则用new调用时会报错！

6、箭头函数没有自己的arguments

箭头函数没有自己的arguments对象。在箭头函数中访问arguments实际上获得的是外层局部（函数）执行环境中的值。

7、箭头函数没有原型prototype

```js
let sayHi = () => {
    console.log('Hello World !')
};
console.log(sayHi.prototype); // undefined
```

8、箭头函数不能用作Generator函数，不能使用yeild关键字

</details>

## 41. symbol 有什么用处？ {#question-097902c0-17b4-4416-9926-3ad88a55416e}

> 难度：3.5 · 类型：QA

### 题目要点

ES5 的对象属性名都是字符串，这容易造成属性名的冲突。比如，你使用了一个他人提供的对象，但又想为这个对象添加新的方法（mixin 模式），新方法的名字就有可能与现有方法产生冲突。如果有一种机制，保证每个属性的名字都是独一无二的就好了，这样就从根本上防止属性名的冲突。这就是 ES6 引入Symbol的原因。

<details>
<summary>参考答案</summary>

ES5 的对象属性名都是字符串，这容易造成属性名的冲突。比如，你使用了一个他人提供的对象，但又想为这个对象添加新的方法（mixin 模式），新方法的名字就有可能与现有方法产生冲突。如果有一种机制，保证每个属性的名字都是独一无二的就好了，这样就从根本上防止属性名的冲突。这就是 ES6 引入Symbol的原因。

ES6 引入了一种新的原始数据类型Symbol，表示独一无二的值。它是 JavaScript 语言的第七种数据类型，前六种是：undefined、null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）。

Symbol 值通过Symbol函数生成。这就是说，对象的属性名现在可以有两种类型，一种是原来就有的字符串，另一种就是新增的 Symbol 类型。凡是属性名属于 Symbol 类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

</details>

## 42. async/await 和 Promise 有什么关系？ {#question-fbcd6444-9c0f-492a-b138-bd205bb4bf1d}

> 难度：3 · 类型：QA

### 题目要点

`async/await` 是 JavaScript 的一种语法糖，它建立在 `Promise` 之上，用于简化异步代码的编写和阅读。

- **`Promise`** 是 JavaScript 中处理异步操作的基本机制。
- **`async/await`** 是基于 `Promise` 的语法糖，使异步代码更简洁、易读。
- `async/await` 使得异步代码的编写更像同步代码，提高了可读性，同时错误处理也变得更为直观。

<details>
<summary>参考答案</summary>

## Promise

> Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象

## async/await

es2017的新语法，async/await就是generator + promise的语法糖

async/await 和 Promise 的关系非常的巧妙，await必须在async内使用，并装饰一个Promise对象，async返回的也是一个Promise对象。

async/await中的return/throw会代理自己返回的Promise的resolve/reject，而一个Promise的resolve/reject会使得await得到返回值或抛出异常。

* 如果方法内无await节点
    * return 一个字面量则会得到一个{PromiseStatus: resolved}的Promise。
    * throw 一个Error则会得到一个{PromiseStatus: rejected}的Promise。

* 如果方法内有await节点
    * async会返回一个{PromiseStatus: pending}的Promise（发生切换，异步等待Promise的执行结果）。
    * Promise的resolve会使得await的代码节点获得相应的返回结果，并继续向下执行。
    * Promise的reject 会使得await的代码节点自动抛出相应的异常，终止向下继续执行。

</details>

## 43. JavaScript中的简单数据类型有哪些？ {#question-244485d8-3c96-4f52-88d7-7ac0c76b5e0b}

> 难度：0.5 · 类型：QA

### 题目要点

JavaScript 中的简单数据类型包括以下几种：

<details>
<summary>参考答案</summary>

JavaScript 中的简单数据类型包括以下几种：

- 字符串（String）：用于表示文本数据，用引号（单引号或双引号）包裹起来，例如："Hello, World!"。

- 数字（Number）：用于表示数值数据，包括整数和浮点数（带小数点的数），例如：42、3.14。

- 布尔值（Boolean）：用于表示逻辑值，只有两个可能的取值：true（真）和false（假）。

- undefined：表示未定义的值，通常表示未声明的变量或缺少返回值的函数。

- null：表示空值，用于显式地表示变量或对象没有值。

- Symbol（符号）：表示唯一的标识符，用于对象属性的键。

- BigInt：用于表示任意精度的整数。BigInt 是一种简单数据类型，在 ECMAScript 2020 中引入。

这些简单数据类型在 JavaScript 中是不可变的，也就是说，它们的值在创建后不能被修改。当你对一个简单数据类型的值进行操作时，实际上是创建了一个新的值。

</details>

## 44. 你是怎么理解ES6中 Decorator 的？使用场景有哪些？ {#question-5116f1a8-f1b2-49ec-bbfc-5550861762da}

> 难度：3.5 · 类型：QA

### 题目要点

Decorator，即装饰器，从名字上很容易让我们联想到装饰者模式

<details>
<summary>参考答案</summary>

## 一、介绍

Decorator，即装饰器，从名字上很容易让我们联想到装饰者模式

简单来讲，装饰者模式就是一种在不改变原类和使用继承的情况下，动态地扩展对象功能的设计理论。

`ES6`中`Decorator`功能亦如此，其本质也不是什么高大上的结构，就是一个普通的函数，用于扩展类属性和类方法

这里定义一个士兵，这时候他什么装备都没有

```js
class soldier{
}
```

定义一个得到 AK 装备的函数，即装饰器

```js
function strong(target){
    target.AK = true
}
```

使用该装饰器对士兵进行增强

```js
@strong
class soldier{
}
```

这时候士兵就有武器了

```js
soldier.AK // true
```

上述代码虽然简单，但也能够清晰看到了使用`Decorator`两大优点：

- 代码可读性变强了，装饰器命名相当于一个注释
- 在不改变原有代码情况下，对原来功能进行扩展

## 二、用法

`Docorator`修饰对象为下面两种：

- 类的装饰
- 类属性的装饰

### 类的装饰

当对类本身进行装饰的时候，能够接受一个参数，即类本身

将装饰器行为进行分解，大家能够有个更深入的了解

```js
@decorator
class A {}

// 等同于

class A {}
A = decorator(A) || A;
```

下面`@testable`就是一个装饰器，`target`就是传入的类，即`MyTestableClass`，实现了为类添加静态属性

```js
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

如果想要传递参数，可以在装饰器外层再封装一层函数

```js
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

### 类属性的装饰

当对类属性进行装饰的时候，能够接受三个参数：

- 类的原型对象
- 需要装饰的属性名
- 装饰属性名的描述对象

首先定义一个`readonly`装饰器

```js
function readonly(target, name, descriptor){
  descriptor.writable = false; // 将可写属性设为false
  return descriptor;
}
```

使用`readonly`装饰类的`name`方法

```javascript
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

相当于以下调用

```js
readonly(Person.prototype, 'name', descriptor);
```

如果一个方法有多个装饰器，就像洋葱一样，先从外到内进入，再由内到外执行

```javascript
function dec(id){
    console.log('evaluated', id);
    return (target, property, descriptor) =>console.log('executed', id);
}

class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// evaluated 1
// evaluated 2
// executed 2
// executed 1
```

外层装饰器`@dec(1)`先进入，但是内层装饰器`@dec(2)`先执行

### 注意

装饰器不能用于修饰函数，因为函数存在变量声明情况

```js
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

编译阶段，变成下面

```js
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

意图是执行后`counter`等于 1，但是实际上结果是`counter`等于 0

## 三、使用场景

基于`Decorator`强大的作用，我们能够完成各种场景的需求，下面简单列举几种：

使用`react-redux`的时候，如果写成下面这种形式，既不雅观也很麻烦

```js
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

通过装饰器就变得简洁多了

```js
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}
```

将`mixins`，也可以写成装饰器，让使用更为简洁了

```js
function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}

// 使用
const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

下面再讲讲`core-decorators.js`几个常见的装饰器

#### @antobind

`autobind`装饰器使得方法中的`this`对象，绑定原始对象

```javascript
import { autobind } from 'core-decorators';

class Person {
  @autobind
  getPerson() {
    return this;
  }
}

let person = new Person();
let getPerson = person.getPerson;

getPerson() === person;
// true
```

#### @readonly

`readonly`装饰器使得属性或方法不可写

```javascript
import { readonly } from 'core-decorators';

class Meal {
  @readonly
  entree = 'steak';
}

var dinner = new Meal();
dinner.entree = 'salmon';
// Cannot assign to read only property 'entree' of [object Object]
```

#### @deprecate

`deprecate`或`deprecated`装饰器在控制台显示一条警告，表示该方法将废除

```javascript
import { deprecate } from 'core-decorators';

class Person {
  @deprecate
  facepalm() {}

  @deprecate('功能废除了')
  facepalmHard() {}
}

let person = new Person();

person.facepalm();
// DEPRECATION Person#facepalm: This function will be removed in future versions.

person.facepalmHard();
// DEPRECATION Person#facepalmHard: 功能废除了

```

</details>

## 45. 你是怎么理解ES6中Module的？使用场景有哪些？ {#question-c9d672a0-9abe-46ec-812b-fd198f1e79f4}

> 难度：3 · 类型：QA

### 题目要点

### 延伸知识

面试中，ES module知识通常会和传统的 CommonJS 规范一起考察，特别是他们之间的差异。**最重要的差异**：ES Module是静态分析，CommonJS是运行时；ES导出的是 *引用*，CommonJS导出的是值拷贝。

关于导出引用和导出值拷贝，可以看这两个示例。

**ES Module**

```javascript
// moduleA.mjs
export let count = 0;

export const increment = () => {
    count++;
    console.log(`Module A count incremented to ${count}`);
};

export const getCount = () => count;

// moduleB.mjs
import { increment, getCount, count } from './moduleA.mjs';

console.log('Module B before increment:', getCount(), count);
increment();
console.log('Module B after increment:', getCount(), count);
```

```shell
# node ./moduleB.mjs
Module B before increment: 0 0
Module A count incremented to 1
Module B after increment: 1 1
```

**CommonJS**

```javascript
// moduleA.js
let count = 0;

exports.increment = () => {
    count++;
    console.log(`Module A count incremented to ${count}`);
};

exports.getCount = () => count;
exports.count = count;

// moduleB.js
const { increment, getCount, count } = require('./moduleA.js');

console.log('Module B before increment:', getCount(), count);
increment();
console.log('Module B after increment:', getCount(), count);
```

```shell
# node ./moduleB.js
Module B before increment: 0 0
Module A count incremented to 1
Module B after increment: 1 0
```

**注意看**，上面有2个主要差异：

- 在nodejs里，es module的JS文件后缀是 `.mjs`，普通的JS文件是 `.js`
- 导出的 `count`变量，在 es module下可以正确读取到更新后的值，但是commonjs下还是初始值

下面列出其他一些差异，也是要熟练掌握的：

1. **语法差异**:
   - **ES Module**: 使用 `import` 和 `export` 关键字进行模块导入和导出。
   - **CommonJS**: 使用 `require()` 函数导入模块，`module.exports` 或 `exports` 导出模块。

2. **加载时机**:
   - **ES Module**: 在静态分析阶段进行加载，可以在代码运行之前静态分析模块的依赖关系。
   - **CommonJS**: 在运行时加载模块，模块的导入和导出是动态的。

3. **异步加载**:
   - **ES Module**: 支持异步加载模块，可以使用 `import()` 函数动态加载模块。
   - **CommonJS**: 模块加载是同步的，不支持异步加载模块的语法。

4. **作用域**:
   - **ES Module**: 模块中的变量在模块级别上是私有的，不会污染全局作用域。
   - **CommonJS**: 模块中的变量是在模块作用域内，但可以通过 `module.exports` 或 `exports` 将变量暴露给其他模块。

5. **动态性**:
   - **ES Module**: 静态分析使得编译器可以进行优化，提前加载模块。
   - **CommonJS**: 运行时加载使得模块加载成本较高，不能进行像 ES Module 那样的静态优化。

6. **环境兼容性**:
   - **ES Module**: 主要用于现代浏览器和 Node.js 版本 12 以上的环境，需要通过 Babel 等工具进行转换以支持旧版浏览器或 Node.js。
   - **CommonJS**: 是 Node.js 的默认模块系统，广泛应用于 Node.js 的后端开发，不需要额外的转换工具。

7. **循环依赖处理**:
   - **ES Module**: 支持静态分析，可以检测和处理循环依赖。
   - **CommonJS**: 在运行时加载模块，循环依赖的处理需要开发者注意避免。

8. **默认导出**:
   - **ES Module**: 支持导出单个默认值，使用 `export default`。
   - **CommonJS**: 没有直接的默认导出语法，通常通过 `module.exports` 或 `exports` 导出单个值。

<details>
<summary>参考答案</summary>

## 一、介绍

模块，（Module），是能够单独命名并独立地完成一定功能的程序语句的**集合（即程序代码和数据结构的集合体）**。

两个基本的特征：外部特征和内部特征

- 外部特征是指模块跟外部环境联系的接口（即其他模块或程序调用该模块的方式，包括有输入输出参数、引用的全局变量）和模块的功能

- 内部特征是指模块的内部环境具有的特点（即该模块的局部数据和程序代码）

### 为什么需要模块化

- 代码抽象
- 代码封装
- 代码复用
- 依赖管理

如果没有模块化，我们代码会怎样？

- 变量和方法不容易维护，容易污染全局作用域
- 加载资源的方式通过script标签从上到下。
- 依赖的环境主观逻辑偏重，代码较多就会比较复杂。
- 大型项目资源难以维护，特别是多人合作的情况下，资源的引入会让人奔溃

因此，需要一种将` JavaScript `程序模块化的机制，如

- CommonJs (典型代表：node.js早期)
- AMD (典型代表：require.js)
- CMD (典型代表：sea.js)

### AMD

`Asynchronous ModuleDefinition`（AMD），异步模块定义，采用异步方式加载模块。所有依赖模块的语句，都定义在一个回调函数中，等到模块加载完成之后，这个回调函数才会运行

代表库为`require.js`

```js
/** main.js 入口文件/主模块 **/
// 首先用config()指定各模块路径和引用名
require.config({
  baseUrl: "js/lib",
  paths: {
    "jquery": "jquery.min",  //实际路径为js/lib/jquery.min.js
    "underscore": "underscore.min",
  }
});
// 执行基本操作
require(["jquery","underscore"],function($,_){
  // some code here
});
```

### CommonJs

`CommonJS` 是一套 `Javascript` 模块规范，用于服务端

```js
// a.js
module.exports={ foo , bar}

// b.js
const { foo,bar } = require('./a.js')
```

其有如下特点：

- 所有代码都运行在模块作用域，不会污染全局作用域
- 模块是同步加载的，即只有加载完成，才能执行后面的操作
- 模块在首次执行后就会缓存，再次加载只返回缓存结果，如果想要再次执行，可清除缓存
- `require`返回的值是被输出的值的拷贝，模块内部的变化也不会影响这个值

既然存在了`AMD`以及`CommonJs`机制，`ES6`的`Module`又有什么不一样？

ES6 在语言标准的层面上，实现了`Module`，即模块功能，完全可以取代 `CommonJS `和 `AMD `规范，成为浏览器和服务器通用的模块解决方案

`CommonJS` 和` AMD` 模块，都只能在运行时确定这些东西。比如，`CommonJS `模块就是对象，输入时必须查找对象属性

```javascript
// CommonJS模块
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

`ES6`设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量

```js
// ES6模块
import { stat, exists, readFile } from 'fs';
```

上述代码，只加载3个方法，其他方法不加载，即 `ES6` 可以在编译时就完成模块加载

由于编译加载，使得静态分析成为可能。包括现在流行的`typeScript`也是依靠静态分析实现功能

## 二、使用

`ES6`模块内部自动采用了严格模式，这里就不展开严格模式的限制，毕竟这是`ES5`之前就已经规定好

模块功能主要由两个命令构成：

- `export`：用于规定模块的对外接口
- `import`：用于输入其他模块提供的功能

### export

一个模块就是一个独立的文件，该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用`export`关键字输出该变量

```javascript
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;

或
// 建议使用下面写法，这样能瞬间确定输出了哪些变量
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export { firstName, lastName, year };
```

输出函数或类

```js
export function multiply(x, y) {
  return x * y;
};
```

通过`as`可以进行输出变量的重命名

```js
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
```

### import

使用`export`命令定义了模块的对外接口以后，其他 JS 文件就可以通过`import`命令加载这个模块

```javascript
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

同样如果想要输入变量起别名，通过`as`关键字

```javascript
import { lastName as surname } from './profile.js';
```

当加载整个模块的时候，需要用到星号`*`

```js
// circle.js
export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}

// main.js
import * as circle from './circle';
console.log(circle)   // {area:area,circumference:circumference}
```

输入的变量都是只读的，不允许修改，但是如果是对象，允许修改属性

```js
import {a} from './xxx.js'

a.foo = 'hello'; // 合法操作
a = {}; // Syntax Error : 'a' is read-only;
```

不过建议即使能修改，但我们不建议。因为修改之后，我们很难差错

`import`后面我们常接着`from`关键字，`from`指定模块文件的位置，可以是相对路径，也可以是绝对路径

```js
import { a } from './a';
```

如果只有一个模块名，需要有配置文件，告诉引擎模块的位置

```javascript
import { myMethod } from 'util';
```

在编译阶段，`import`会提升到整个模块的头部，首先执行

```javascript
foo();

import { foo } from 'my_module';
```

多次重复执行同样的导入，只会执行一次

```js
import 'lodash';
import 'lodash';
```

上面的情况，大家都能看到用户在导入模块的时候，需要知道加载的变量名和函数，否则无法加载

如果不需要知道变量名或函数就完成加载，就要用到`export default`命令，为模块指定默认输出

```js
// export-default.js
export default function () {
    console.log('foo');
}
```

加载该模块的时候，`import`命令可以为该函数指定任意名字

```js
// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

### 动态加载

允许您仅在需要时动态加载模块，而不必预先加载所有模块，这存在明显的性能优势

这个新功能允许您将`import()`作为函数调用，将其作为参数传递给模块的路径。 它返回一个 `promise`，它用一个模块对象来实现，让你可以访问该对象的导出

```js
import('/modules/myModule.mjs')
  .then((module) => {
    // Do something with the module.
  });
```

### 复合写法

如果在一个模块之中，先输入后输出同一个模块，`import`语句可以与`export`语句写在一起

```javascript
export { foo, bar } from 'my_module';

// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```

同理能够搭配`as`、`*`搭配使用

## 三、使用场景

如今，`ES6`模块化已经深入我们日常项目开发中，像`vue`、`react`项目搭建项目，组件化开发处处可见，其也是依赖模块化实现

`vue`组件

```js
<template>
  <div class="App">
      组件化开发 ---- 模块化
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
```

`react`组件

```js
function App() {
  return (
    <div className="App">
        组件化开发 ---- 模块化
    </div>
  );
}

export default App;
```

包括完成一些复杂应用的时候，我们也可以拆分成各个模块

</details>

## 46. 你是怎么理解ES6中Proxy的？使用场景有哪些? {#question-70db8e81-b858-4f3a-8bf9-d2bd1eb142e2}

> 难度：3.5 · 类型：QA

### 题目要点

**定义：** 用于定义基本操作的自定义行为

<details>
<summary>参考答案</summary>

## 一、介绍

**定义：** 用于定义基本操作的自定义行为

**本质：** 修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程`(meta programming)`

元编程（Metaprogramming，又译超编程，是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作

一段代码来理解
```bash
#!/bin/bash
# metaprogram
echo '#!/bin/bash' >program
for ((I=1; I<=1024; I++)) do
    echo "echo $I" >>program
done
chmod +x program
```
这段程序每执行一次能帮我们生成一个名为`program`的文件，文件内容为1024行`echo`，如果我们手动来写1024行代码，效率显然低效

- 元编程优点：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译

`Proxy` 亦是如此，用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）

## 二、用法

`Proxy`为 构造函数，用来生成 `Proxy `实例

```javascript
var proxy = new Proxy(target, handler)
```

### 参数

`target`表示所要拦截的目标对象（任何类型的对象，包括原生数组，函数，甚至另一个代理））

`handler`通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为

### handler解析

关于`handler`拦截属性，有如下：

- get(target,propKey,receiver)：拦截对象属性的读取
- set(target,propKey,value,receiver)：拦截对象属性的设置
- has(target,propKey)：拦截`propKey in proxy`的操作，返回一个布尔值
- deleteProperty(target,propKey)：拦截`delete proxy[propKey]`的操作，返回一个布尔值
- ownKeys(target)：拦截`Object.keys(proxy)`、`for...in`等循环，返回一个数组
- getOwnPropertyDescriptor(target, propKey)：拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象
- defineProperty(target, propKey, propDesc)：拦截`Object.defineProperty(proxy, propKey, propDesc）`，返回一个布尔值
- preventExtensions(target)：拦截`Object.preventExtensions(proxy)`，返回一个布尔值
- getPrototypeOf(target)：拦截`Object.getPrototypeOf(proxy)`，返回一个对象
- isExtensible(target)：拦截`Object.isExtensible(proxy)`，返回一个布尔值
- setPrototypeOf(target, proto)：拦截`Object.setPrototypeOf(proxy, proto)`，返回一个布尔值
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作

### Reflect

若需要在`Proxy`内部调用对象的默认行为，建议使用`Reflect`，其是`ES6`中操作对象而提供的新 `API`

基本特点：

- 只要`Proxy`对象具有的代理方法，`Reflect`对象全部具有，以静态方法的形式存在
- 修改某些`Object`方法的返回结果，让其变得更合理（定义不存在属性行为的时候不报错而是返回`false`）
- 让`Object`操作都变成函数行为<br>

下面我们介绍`proxy`几种用法：

### get()

`get`接受三个参数，依次为目标对象、属性名和 `proxy` 实例本身，最后一个参数可选

```javascript
var person = {
  name: "张三"
};

var proxy = new Proxy(person, {
  get: function(target, propKey) {
    return Reflect.get(target,propKey)
  }
});

proxy.name // "张三"
```

`get`能够对数组增删改查进行拦截，下面是试下你数组读取负数的索引

```js
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  };

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
arr[-1] // c
```

注意：如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则会报错

```js
const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed
```

### set()

`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 `Proxy` 实例本身

假定`Person`对象有一个`age`属性，该属性应该是一个不大于 200 的整数，那么可以使用`Proxy`保证`age`的属性值符合要求

```js
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // 对于满足条件的 age 属性以及其他属性，直接保存
    obj[prop] = value;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // 报错
person.age = 300 // 报错
```

如果目标对象自身的某个属性，不可写且不可配置，那么`set`方法将不起作用

```javascript
const obj = {};
Object.defineProperty(obj, 'foo', {
  value: 'bar',
  writable: false,
});

const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = 'baz';
  }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';
proxy.foo // "bar"
```

注意，严格模式下，`set`代理如果没有返回`true`，就会报错

```javascript
'use strict';
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    // 无论有没有下面这一行，都会报错
    return false;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
// TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

### deleteProperty()

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除

```javascript
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    Reflect.deleteProperty(target,key)
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`无法删除私有属性`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: 无法删除私有属性
```

注意，目标对象自身的不可配置（configurable）的属性，不能被`deleteProperty`方法删除，否则报错

### 取消代理

```
Proxy.revocable(target, handler);
```

## 三、使用场景

`Proxy`其功能非常类似于设计模式中的代理模式，常用功能如下：

- 拦截和监视外部对对象的访问
- 降低函数或类的复杂度
- 在复杂操作前对操作进行校验或对所需资源进行管理

使用 `Proxy` 保障数据类型的准确性

```js
let numericDataStore = { count: 0, amount: 1234, total: 14 };
numericDataStore = new Proxy(numericDataStore, {
    set(target, key, value, proxy) {
        if (typeof value !== 'number') {
            throw Error("属性只能是number类型");
        }
        return Reflect.set(target, key, value, proxy);
    }
});

numericDataStore.count = "foo"
// Error: 属性只能是number类型

numericDataStore.count = 333
// 赋值成功
```

声明了一个私有的 `apiKey`，便于 `api` 这个对象内部的方法调用，但不希望从外部也能够访问 `api._apiKey`

```js
let api = {
    _apiKey: '123abc456def',
    getUsers: function(){ },
    getUser: function(userId){ },
    setUser: function(userId, config){ }
};
const RESTRICTED = ['_apiKey'];
api = new Proxy(api, {
    get(target, key, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可访问.`);
        } return Reflect.get(target, key, proxy);
    },
    set(target, key, value, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可修改`);
        } return Reflect.get(target, key, value, proxy);
    }
});

console.log(api._apiKey)
api._apiKey = '987654321'
// 上述都抛出错误
```

还能通过使用`Proxy`实现观察者模式

观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行

`observable`函数返回一个原始对象的 `Proxy` 代理，拦截赋值操作，触发充当观察者的各个函数

```javascript
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}
```

观察者函数都放进`Set`集合，当修改`obj`的值，在会`set`函数中拦截，自动执行`Set`所有的观察者

</details>

## 47. 怎么理解ES6中 Generator的？使用场景有哪些？ {#question-6b4f3ad8-5cd8-49f3-941c-c916615546d0}

> 难度：3.5 · 类型：QA

### 题目要点

- **Generator 函数** 允许函数暂停和恢复执行，提供了强大的异步编程能力。
- **`yield`** 用于暂停函数并返回值，**`yield*`** 用于委托其他可迭代对象。
- 可以与 **`Promise`** 配合使用简化异步代码，处理异步操作和错误。

`Generator` 是 ES6 中的一个重要特性，虽然它在现代开发中不如 `async/await` 常用，但它在处理复杂的迭代和异步流程时仍然非常有用。

<details>
<summary>参考答案</summary>

## 一、介绍

Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同

回顾下上文提到的解决异步的手段：

- 回调函数
- promise

那么，上文我们提到`promsie`已经是一种比较流行的解决异步方案，那么为什么还出现`Generator`？甚至`async/await`呢？

该问题我们留在后面再进行分析，下面先认识下`Generator`

### Generator函数

执行 `Generator` 函数会返回一个遍历器对象，可以依次遍历 `Generator` 函数内部的每一个状态

形式上，`Generator `函数是一个普通函数，但是有两个特征：

- `function`关键字与函数名之间有一个星号
- 函数体内部使用`yield`表达式，定义不同的内部状态

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
```

## 二、使用

`Generator` 函数会返回一个遍历器对象，即具有`Symbol.iterator`属性，并且返回给自己

```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

通过`yield`关键字可以暂停`generator`函数返回的遍历器对象的状态

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
var hw = helloWorldGenerator();
```

上述存在三个状态：`hello`、`world`、`return`

通过`next`方法才会遍历到下一个内部状态，其运行逻辑如下：

- 遇到`yield`表达式，就暂停执行后面的操作，并将紧跟在`yield`后面的那个表达式的值，作为返回的对象的`value`属性值。
- 下一次调用`next`方法时，再继续往下执行，直到遇到下一个`yield`表达式
- 如果没有再遇到新的`yield`表达式，就一直运行到函数结束，直到`return`语句为止，并将`return`语句后面的表达式的值，作为返回的对象的`value`属性值。
- 如果该函数没有`return`语句，则返回的对象的`value`属性值为`undefined`

```javascript
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

`done`用来判断是否存在下个状态，`value`对应状态值

`yield`表达式本身没有返回值，或者说总是返回`undefined`

通过调用`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

正因为`Generator `函数返回`Iterator`对象，因此我们还可以通过`for...of`进行遍历
```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

原生对象没有遍历接口，通过`Generator `函数为它加上这个接口，就能使用`for...of`进行遍历了

```javascript
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

## 三、异步解决方案

回顾之前展开异步解决的方案：

- 回调函数
- Promise 对象
- generator 函数
- async/await

这里通过文件读取案例，将几种解决异步的方案进行一个比较：

### 回调函数

所谓回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，再调用这个函数

```javascript
fs.readFile('/etc/fstab', function (err, data) {
  if (err) throw err;
  console.log(data);
  fs.readFile('/etc/shells', function (err, data) {
    if (err) throw err;
    console.log(data);
  });
});
```

`readFile`函数的第三个参数，就是回调函数，等到操作系统返回了`/etc/passwd`这个文件以后，回调函数才会执行

### Promise

`Promise`就是为了解决回调地狱而产生的，将回调函数的嵌套，改成链式调用

```js
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};


readFile('/etc/fstab').then(data =>{
    console.log(data)
    return readFile('/etc/shells')
}).then(data => {
    console.log(data)
})
```

这种链式操作形式，使异步任务的两段执行更清楚了，但是也存在了很明显的问题，代码变得冗杂了，语义化并不强

### generator

`yield`表达式可以暂停函数执行，`next`方法用于恢复函数执行，这使得`Generator`函数非常适合将异步任务同步化

```javascript
const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

### async/await

将上面`Generator`函数改成`async/await`形式，更为简洁，语义化更强了

```js
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

### 区别：

通过上述代码进行分析，将`promise`、`Generator`、`async/await`进行比较：

- `promise`和`async/await`是专门用于处理异步操作的
- `Generator`并不是为异步而设计出来的，它还有其他功能（对象迭代、控制输出、部署`Interator`接口...）
- `promise`编写代码相比`Generator`、`async`更为复杂化，且可读性也稍差

- `Generator`、`async`需要与`promise`对象搭配处理异步情况
- `async`实质是`Generator`的语法糖，相当于会自动执行`Generator`函数
- `async`使用上更为简洁，将异步代码以同步的形式进行编写，是处理异步编程的最终方案

## 四、使用场景

`Generator`是异步解决的一种方案，最大特点则是将异步操作同步化表达出来

```js
function* loadUI() {
  showLoadingScreen();
  yield loadUIDataAsynchronously();
  hideLoadingScreen();
}
var loader = loadUI();
// 加载UI
loader.next()

// 卸载UI
loader.next()
```

包括`redux-saga `中间件也充分利用了`Generator`特性

```js
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import Api from '...'

function* fetchUser(action) {
   try {
      const user = yield call(Api.fetchUser, action.payload.userId);
      yield put({type: "USER_FETCH_SUCCEEDED", user: user});
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

function* mySaga() {
  yield takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

function* mySaga() {
  yield takeLatest("USER_FETCH_REQUESTED", fetchUser);
}

export default mySaga;
```

还能利用`Generator`函数，在对象上实现`Iterator`接口

```js
function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
  console.log(key, value);
}

// foo 3
// bar 7
```

</details>

## 48. ES6中新增的Set、Map两种数据结构怎么理解? {#question-4232c372-316f-4a53-99b9-6d9299b7e91f}

> 难度：2 · 类型：QA

### 题目要点

如果要用一句来描述，我们可以说

<details>
<summary>参考答案</summary>

如果要用一句来描述，我们可以说

`Set`是一种叫做集合的数据结构，`Map`是一种叫做字典的数据结构

什么是集合？什么又是字典？

- 集合<br>
是由一堆无序的、相关联的，且不重复的内存结构【数学中称为元素】组成的组合

- 字典<br>
是一些元素的集合。每个元素有一个称作key 的域，不同元素的key 各不相同

区别？

- 共同点：集合、字典都可以存储不重复的值
- 不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

## 一、Set

` Set`是`es6`新增的数据结构，类似于数组，但是成员的值都是唯一的，没有重复的值，我们一般称为集合

`Set`本身是一个构造函数，用来生成 Set 数据结构

```js
const s = new Set();
```

### 增删改查

`Set`的实例关于增删改查的方法：

- add()
- delete()

- has()
- clear()

### add()

添加某个值，返回 `Set` 结构本身

当添加实例中已经存在的元素，`set`不会进行处理添加

```js
s.add(1).add(2).add(2); // 2只被添加了一次
```

### delete()

删除某个值，返回一个布尔值，表示删除是否成功

```js
s.delete(1)
```

### has()

返回一个布尔值，判断该值是否为`Set`的成员

```js
s.has(2)
```

### clear()

清除所有成员，没有返回值

```js
s.clear()
```

### 遍历

`Set`实例遍历的方法有如下：

关于遍历的方法，有如下：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回键值对的遍历器
- forEach()：使用回调函数遍历每个成员

`Set`的遍历顺序就是插入顺序

`keys`方法、`values`方法、`entries`方法返回的都是遍历器对象

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```

`forEach()`用于对每个成员执行某种操作，没有返回值，键值、键名都相等，同样的`forEach`方法有第二个参数，用于绑定处理函数的`this`

```javascript
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```

扩展运算符和` Set` 结构相结合实现数组或字符串去重

```javascript
// 数组
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)]; // [3, 5, 2]

// 字符串
let str = "352255";
let unique = [...new Set(str)].join(""); // "352"
```

实现并集、交集、和差集

```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// （a 相对于 b 的）差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

## 二、Map

`Map`类型是键值对的有序列表，而键和值都可以是任意类型

`Map`本身是一个构造函数，用来生成 `Map` 数据结构

```js
const m = new Map()
```

### 增删改查

`Map` 结构的实例针对增删改查有以下属性和操作方法：

- size 属性
- set()
- get()
- has()
- delete()
- clear()

### size

`size`属性返回 Map 结构的成员总数。

```javascript
const map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
```

### set()

设置键名`key`对应的键值为`value`，然后返回整个 Map 结构

如果`key`已经有值，则键值会被更新，否则就新生成该键

同时返回的是当前`Map`对象，可采用链式写法

```javascript
const m = new Map();

m.set('edition', 6)        // 键是字符串
m.set(262, 'standard')     // 键是数值
m.set(undefined, 'nah')    // 键是 undefined
m.set(1, 'a').set(2, 'b').set(3, 'c') // 链式操作
```

### get()

`get`方法读取`key`对应的键值，如果找不到`key`，返回`undefined`

```javascript
const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // 键是函数

m.get(hello)  // Hello ES6!
```

### has()

`has`方法返回一个布尔值，表示某个键是否在当前 Map 对象之中

```javascript
const m = new Map();

m.set('edition', 6);
m.set(262, 'standard');
m.set(undefined, 'nah');

m.has('edition')     // true
m.has('years')       // false
m.has(262)           // true
m.has(undefined)     // true
```

### delete()

`delete`方法删除某个键，返回`true`。如果删除失败，返回`false`

```javascript
const m = new Map();
m.set(undefined, 'nah');
m.has(undefined)     // true

m.delete(undefined)
m.has(undefined)       // false
```

### clear()

`clear`方法清除所有成员，没有返回值

```javascript
let map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
map.clear()
map.size // 0
```

### 遍历

`Map `结构原生提供三个遍历器生成函数和一个遍历方法：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回所有成员的遍历器
- forEach()：遍历 Map 的所有成员

遍历顺序就是插入顺序

```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

map.forEach(function(value, key, map) {
  console.log("Key: %s, Value: %s", key, value);
});
```

## 三、WeakSet 和 WeakMap

### WeakSet

创建`WeakSet`实例

```js
const ws = new WeakSet();
```

`WeakSet `可以接受一个具有 `Iterable `接口的对象作为参数

```js
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

在`API`中`WeakSet`与`Set`有两个区别：

- 没有遍历操作的`API`
- 没有`size`属性

`WeakSet`只能成员只能是引用类型，而不能是其他类型的值

```js
let ws=new WeakSet();

// 成员不是引用类型
let weakSet=new WeakSet([2,3]);
console.log(weakSet) // 报错

// 成员为引用类型
let obj1={name:1}
let obj2={name:1}
let ws=new WeakSet([obj1,obj2]);
console.log(ws) //WeakSet {{…}, {…}}
```

`WeakSet `里面的引用只要在外部消失，它在 `WeakSet `里面的引用就会自动消失

### WeakMap

`WeakMap`结构与`Map`结构类似，也是用于生成键值对的集合

在`API`中`WeakMap`与`Map`有两个区别：

- 没有遍历操作的`API`
- 没有`clear`清空方法

```javascript
// WeakMap 可以使用 set 方法添加成员
const wm1 = new WeakMap();
const key = {foo: 1};
wm1.set(key, 2);
wm1.get(key) // 2

// WeakMap 也可以接受一个数组，
// 作为构造函数的参数
const k1 = [1, 2, 3];
const k2 = [4, 5, 6];
const wm2 = new WeakMap([[k1, 'foo'], [k2, 'bar']]);
wm2.get(k2) // "bar"
```

`WeakMap`只接受对象作为键名（`null`除外），不接受其他类型的值作为键名

```javascript
const map = new WeakMap();
map.set(1, 2)
// TypeError: 1 is not an object!
map.set(Symbol(), 2)
// TypeError: Invalid value used as weak map key
map.set(null, 2)
// TypeError: Invalid value used as weak map key
```

`WeakMap`的键名所指向的对象，一旦不再需要，里面的键名对象和所对应的键值对会自动消失，不用手动删除引用

举个场景例子：

在网页的 DOM 元素上添加数据，就可以使用`WeakMap`结构，当该 DOM 元素被清除，其所对应的`WeakMap`记录就会自动被移除

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

注意：`WeakMap` 弱引用的只是键名，而不是键值。键值依然是正常引用

下面代码中，键值`obj`会在`WeakMap`产生新的引用，当你修改`obj`不会影响到内部

```js
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```

</details>

## 49. ES6中函数新增了哪些扩展? {#question-9cf9cb30-8864-4823-bf2d-d30b5f079f45}

> 难度：1.5 · 类型：QA

### 题目要点

`ES6`允许为函数的参数设置默认值

<details>
<summary>参考答案</summary>

## 一、参数

`ES6`允许为函数的参数设置默认值

```js
function log(x, y = 'World') {
  console.log(x, y);
}

console.log('Hello') // Hello World
console.log('Hello', 'China') // Hello China
console.log('Hello', '') // Hello
```

函数的形参是默认声明的，不能使用`let`或`const`再次声明

```js
function foo(x = 5) {
    let x = 1; // error
    const x = 2; // error
}
```

参数默认值可以与解构赋值的默认值结合起来使用

```js
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

上面的`foo`函数，当参数为对象的时候才能进行解构，如果没有提供参数的时候，变量`x`和`y`就不会生成，从而报错，这里设置默认值避免

```js
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

参数默认值应该是函数的尾参数，如果不是非尾部的参数设置默认值，实际上这个参数是没发省略的

```javascript
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined]
f(, 1) // 报错
f(undefined, 1) // [1, 1]
```

## 二、属性

### 函数的length属性

`length`将返回没有指定默认值的参数个数

```js
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

`rest` 参数也不会计入`length`属性

```js
(function(...args) {}).length // 0
```

如果设置了默认值的参数不是尾参数，那么`length`属性也不再计入后面的参数了

```js
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

### name属性

返回该函数的函数名

```js
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

如果将一个具名函数赋值给一个变量，则 `name`属性都返回这个具名函数原本的名字

```js
const bar = function baz() {};
bar.name // "baz"
```

`Function`构造函数返回的函数实例，`name`属性的值为`anonymous`

```javascript
(new Function).name // "anonymous"
```

`bind`返回的函数，`name`属性值会加上`bound`前缀

```javascript
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

## 三、作用域

一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域

等到初始化结束，这个作用域就会消失。这种语法行为，在不设置参数默认值时，是不会出现的

下面例子中，`y=x`会形成一个单独作用域，`x`没有被定义，所以指向全局变量`x`

```js
let x = 1;

function f(y = x) {
  // 等同于 let y = x
  let x = 2;
  console.log(y);
}

f() // 1
```

## 四、严格模式

只要函数参数使用了默认值、解构赋值、或者扩展运算符，那么函数内部就不能显式设定为严格模式，否则会报错

```js
// 报错
function doSomething(a, b = a) {
  'use strict';
  // code
}

// 报错
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// 报错
const doSomething = (...a) => {
  'use strict';
  // code
};

const obj = {
  // 报错
  doSomething({a, b}) {
    'use strict';
    // code
  }
};
```

## 五、箭头函数

使用“箭头”（`=>`）定义函数

```js
var f = v => v;

// 等同于
var f = function (v) {
  return v;
};
```

如果箭头函数不需要参数或需要多个参数，就使用一个圆括号代表参数部分

```js
var f = () => 5;
// 等同于
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// 等同于
var sum = function(num1, num2) {
  return num1 + num2;
};
```

如果箭头函数的代码块部分多于一条语句，就要使用大括号将它们括起来，并且使用`return`语句返回

```js
var sum = (num1, num2) => { return num1 + num2; }
```

如果返回对象，需要加括号将对象包裹

```js
let getTempItem = id => ({ id: id, name: "Temp" });
```

注意点：

- 函数体内的`this`对象，就是定义时所在的对象，而不是使用时所在的对象
- 不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误
- 不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用 `rest` 参数代替
- 不可以使用`yield`命令，因此箭头函数不能用作 Generator 函数

</details>

## 50. ES6中对象新增了哪些扩展? {#question-593b09fd-094f-44b7-a375-6ddc393113a5}

> 难度：1.5 · 类型：QA

### 题目要点

ES6中，当对象键名与对应值名相等的时候，可以进行简写

<details>
<summary>参考答案</summary>

## 一、属性的简写

ES6中，当对象键名与对应值名相等的时候，可以进行简写

```js
const baz = {foo:foo}

// 等同于
const baz = {foo}
```

方法也能够进行简写

```js
const o = {
  method() {
    return "Hello!";
  }
};

// 等同于

const o = {
  method: function() {
    return "Hello!";
  }
}
```

在函数内作为返回值，也会变得方便很多

```js
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

注意：简写的对象方法不能用作构造函数，否则会报错

```js
const obj = {
  f() {
    this.foo = 'bar';
  }
};

new obj.f() // 报错
```

## 二、属性名表达式

ES6 允许字面量定义对象时，将表达式放在括号内

```js
let lastWord = 'last word';

const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};

a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

表达式还可以用于定义方法名

```js
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

注意，属性名表达式与简洁表示法，不能同时使用，会报错

```js
// 报错
const foo = 'bar';
const bar = 'abc';
const baz = { [foo] };

// 正确
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

注意，属性名表达式如果是一个对象，默认情况下会自动将对象转为字符串`[object Object]`

```js
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

## 三、super关键字

`this`关键字总是指向函数所在的当前对象，ES6 又新增了另一个类似的关键字`super`，指向当前对象的原型对象

```javascript
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto); // 为obj设置原型对象
obj.find() // "hello"
```

## 四、扩展运算符的应用

在解构赋值中，未被读取的可遍历的属性，分配到指定的对象上面

```js
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

注意：解构赋值必须是最后一个参数，否则会报错

解构赋值是浅拷贝

```js
let obj = { a: { b: 1 } };
let { ...x } = obj;
obj.a.b = 2; // 修改obj里面a属性中键值
x.a.b // 2，影响到了结构出来x的值
```

对象的扩展运算符等同于使用`Object.assign()`方法

## 五、属性的遍历

ES6 一共有 5 种方法可以遍历对象的属性。

- for...in：循环遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）

- Object.keys(obj)：返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名

- Object.getOwnPropertyNames(obj)：回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名

- Object.getOwnPropertySymbols(obj)：返回一个数组，包含对象自身的所有 Symbol 属性的键名

- Reflect.ownKeys(obj)：返回一个数组，包含对象自身的（不含继承的）所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举

上述遍历，都遵守同样的属性遍历的次序规则：

- 首先遍历所有数值键，按照数值升序排列
- 其次遍历所有字符串键，按照加入时间升序排列
- 最后遍历所有 Symbol 键，按照加入时间升序排

```js
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

## 六、对象新增的方法

关于对象新增的方法，分别有以下：

- Object.is()
- Object.assign()
- Object.getOwnPropertyDescriptors()
- Object.setPrototypeOf()，Object.getPrototypeOf()
- Object.keys()，Object.values()，Object.entries()
- Object.fromEntries()

### Object.is()

严格判断两个值是否相等，与严格比较运算符（===）的行为基本一致，不同之处只有两个：一是`+0`不等于`-0`，二是`NaN`等于自身

```js
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

### Object.assign()

`Object.assign()`方法用于对象的合并，将源对象`source`的所有可枚举属性，复制到目标对象`target`

`Object.assign()`方法的第一个参数是目标对象，后面的参数都是源对象

```javascript
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

注意：`Object.assign()`方法是浅拷贝，遇到同名属性会进行替换

### Object.getOwnPropertyDescriptors()

返回指定对象所有自身属性（非继承属性）的描述对象

```js
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
```

### Object.setPrototypeOf()

`Object.setPrototypeOf`方法用来设置一个对象的原型对象

```js
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null);
```

### Object.getPrototypeOf()

用于读取一个对象的原型对象

```js
Object.getPrototypeOf(obj);
```

### Object.keys()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键名的数组

```js
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

### Object.values()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键对应值的数组

```js
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

### Object.entries()

返回一个对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对的数组

```js
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

### Object.fromEntries()

用于将一个键值对数组转为对象

```js
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

</details>

## 51. ES6中数组新增了哪些扩展? {#question-4a0df14c-048b-47cc-a18f-1c9b36f54e90}

> 难度：1 · 类型：QA

### 题目要点

以下是一些 ES6 中数组新增的扩展：

<details>
<summary>参考答案</summary>

以下是一些 ES6 中数组新增的扩展：

1. 扩展运算符（Spread operator）：使用 `...` 语法可以将一个数组展开成多个独立的元素，或者将多个元素合并为一个数组。

2. Array.from()：通过类似数组的对象或可迭代对象创建一个新的数组。

3. Array.of()：创建一个由传入参数组成的新数组。

4. find() 和 findIndex()：用于在数组中查找满足指定条件的第一个元素及其索引。

5. includes()：检查数组是否包含指定的元素，并返回布尔值。

6. fill()：使用指定的值填充数组的所有元素。

7. flat() 和 flatMap()：用于将嵌套的数组展平，减少维度。

8. map()、filter()、reduce()、forEach() 等方法的回调函数支持箭头函数语法。

9. entries()、keys() 和 values()：用于遍历数组的键值对、键和值。

10. 数组解构赋值：可以通过解构赋值从数组中提取值并赋给变量。

11. 数组的扩展属性：`Array.prototype.length` 可以被修改，`Array.prototype[@@toStringTag]` 返回 `"Array"`。

</details>
