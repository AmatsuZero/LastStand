+++
title = "小红书-社招-3年 · 第 1 轮 · 技术面试"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/94"
experienceId = 94
roundId = 156
roundOrder = 1
company = "小红书"
date = "2026-02-01T14:42:08.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-94/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-157/index.md" >}}) →

**本轮概述：** 这一轮主要考察了前端基础知识，包括JavaScript的基本类型和引用类型的存储、闭包的内存泄漏、垃圾回收机制、事件循环、React框架的理解等。

**本轮要点：** Promise、CDN原理、Class、数据类型、浏览器渲染过程

本轮共 24 道题。答案默认折叠，便于先自行作答。

## 1. js中基本类型 和 引用类型的存储有什么不一样 {#question-ae4aa03a-06fe-41be-9c42-f53947f13f49}

> 题库原题：[引用类型有哪些，有什么特点](https://fe.ecool.fun/topic/ae4aa03a-06fe-41be-9c42-f53947f13f49)

### 题目要点

在JavaScript中，引用类型是指非基本数据类型，它们是由对象、数组、函数等复杂数据结构组成的。

<details>
<summary>参考答案</summary>

在JavaScript中，引用类型是指非基本数据类型，它们是由对象、数组、函数等复杂数据结构组成的。

常见的引用类型包括：

1. `对象（Object）`：对象是JavaScript中最基本的引用类型，它可以用来存储键值对，也可以通过原型链实现继承。

2. `数组（Array）`：数组是一种有序的集合，可以存储任意类型的数据，它的长度是动态的，可以随时添加或删除元素。

3. `函数（Function）`：函数是一种可执行的对象，可以封装一段可重复使用的代码。函数可以接收参数并返回值。

引用类型的特点包括：

1. 引用类型的值是可变的：引用类型的值是存储在堆内存中的，当我们修改一个引用类型的值时，实际上是修改了它在内存中的地址，而不是修改了该值本身。

2. 引用类型值的比较是引用的比较：当使用"=="或"==="运算符比较两个引用类型的值时，它们会进行引用的比较，即判断它们是否指向同一个内存地址。只有当两个引用指向同一个对象时，它们才被认为是相等的。

3. 引用类型可以有自己的属性和方法：引用类型的值可以拥有自己的属性和方法。例如，数组对象有长度属性和一些常用的数组方法（例如push、pop、sort等），而函数对象有call、apply等方法。

4. 引用类型可以通过原型链实现继承：通过原型链，引用类型可以继承父类型的属性和方法。

基本类型（如数字、字符串、布尔值）在JavaScript中是按值传递的，而引用类型是按引用传递的。

这意味着当将一个引用类型的值赋给另一个变量时，实际上是将内存地址复制给了新的变量，两个变量引用的是同一对象。而基本类型的值赋给另一个变量时，会创建一个新的值并赋给新的变量。

</details>

## 2. 闭包的内存泄漏应该如何监控和解决？ {#question-6dd983d9-39fc-48ca-9e22-7599ab339f5b}

> 题库原题：[如何检查Javascript中的内存泄漏？](https://fe.ecool.fun/topic/6dd983d9-39fc-48ca-9e22-7599ab339f5b)

### 题目要点

Chrome 浏览器查看内存占用，按照以下步骤操作。

<details>
<summary>参考答案</summary>

## 浏览器

Chrome 浏览器查看内存占用，按照以下步骤操作。

![image.png](https://static.ecool.fun//article/b822300b-cf04-4c9f-9d88-06bd331726c0.png)

```
1、打开开发者工具，选择 Timeline 面板
2、在顶部的Capture字段里面勾选 Memory
3、点击左上角的录制按钮。
4、在页面上进行各种操作，模拟用户的使用情况。
5、一段时间后，点击对话框的 stop 按钮，面板上就会显示这段时间的内存占用情况。
```

如果内存占用基本平稳，接近水平，就说明不存在内存泄漏。

![image.png](https://static.ecool.fun//article/5b616638-2dbc-49a7-9bde-97271ec206b1.png)

反之，就是内存泄漏了。

![image.png](https://static.ecool.fun//article/a05a6942-5cbe-42c8-a213-9122a9a851db.png)

## 命令行

命令行可以使用 Node 提供的process.memoryUsage方法。

```js
console.log(process.memoryUsage());
// { rss: 27709440,
//  heapTotal: 5685248,
//  heapUsed: 3449392,
//  external: 8772 }
```

process.memoryUsage返回一个对象，包含了 Node 进程的内存占用信息。该对象包含四个字段，单位是字节，含义如下。

![image.png](https://static.ecool.fun//article/518da811-c80c-4bc2-a4d6-ba02bf8c508b.png)

```
rss（resident set size）：所有内存占用，包括指令区和堆栈。
heapTotal："堆"占用的内存，包括用到的和没用到的。
heapUsed：用到的堆的部分。
external： V8 引擎内部的 C++ 对象占用的内存。
```

判断内存泄漏，以 `heapUsed` 字段为准。

</details>

## 3. WeakMap 如何解决循环引用 {#question-c2a29dec-432f-46eb-a149-d37278017e31}

> 题库原题：[如何使用 WeakMap 解决循环引用？](https://fe.ecool.fun/topic/c2a29dec-432f-46eb-a149-d37278017e31)

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

## 4. 垃圾回收机制讲一下 {#question-594f4864-1932-4020-aec6-a2ae0fb16765}

> 题库原题：[浏览器的垃圾回收机制有哪些？](https://fe.ecool.fun/topic/594f4864-1932-4020-aec6-a2ae0fb16765)

### 题目要点

JS会在创建变量时自动分配内存，在不使用的时候会自动周期性的释放内存，释放的过程就叫 "垃圾回收"。

<details>
<summary>参考答案</summary>

JS会在创建变量时自动分配内存，在不使用的时候会自动周期性的释放内存，释放的过程就叫 "垃圾回收"。

一方面自动分配内存减轻了开发者的负担，开发者不用过多的去关注内存使用，但是另一方面，正是因为因为是自动回收，所以如果不清楚回收的机制，会很容易造成混乱，而混乱就很容易造成"内存泄漏"。

由于是自动回收，所以就存在一个 "内存是否需要被回收的" 的问题，但是这个问题的判定在程序中意味着无法通过某个算法去准确完整的解决，后面探讨的回收机制只能有限的去解决一般的问题。

## 回收算法

垃圾回收对是否需要回收的问题主要依赖于对变量的判定是否可访问，由此衍生出两种主要的回收算法：

* 标记清理
* 引用计数

### 标记清理

标记清理是js最常用的回收策略，2012年后所有浏览器都使用了这种策略，此后的对回收策略的改进也是基于这个策略的改进。其策略是：

* 变量进入上下文，也可理解为作用域，会加上标记，证明其存在于该上下文；
* 将所有在上下文中的变量以及上下文中被访问引用的变量标记去掉，表明这些变量活跃有用；
* 在此之后再被加上标记的变量标记为准备删除的变量，因为上下文中的变量已经无法访问它们；
* 执行内存清理，销毁带标记的所有非活跃值并回收之前被占用的内存；

局限：

* 由于是从根对象(全局对象)开始查找，对于那些无法从根对象查询到的对象都将被清除
* 回收后会形成内存碎片，影响后面申请大的连续内存空间

### 引用计数

引用计数策略相对而言不常用，因为弊端较多。其思路是对每个值记录它被引用的次数，通过最后对次数的判断(引用数为0)来决定是否保留，具体的规则有：

* 声明一个变量，赋予它一个引用值时，计数+1；
* 同一个值被赋予另外一个变量时，引用+1；
* 保存对该值引用的变量被其他值覆盖，引用-1；
* 引用为0，回收内存；

局限：

最重要的问题就是，循环引用 的问题

```js
function refProblem () {
    let a = new Object();
    let b = new Object();
    a.c = b;
    b.c = a;  //互相引用
}
```

根据之前提到的规则，两个都互相引用了，引用计数不为0，所以两个变量都无法回收。如果频繁的调用改函数，则会造成很严重的内存泄漏。

</details>

## 5. `setTimeout(fn, 0)`、`Promise.resolve().then()` 的执行顺序 {#question-subjective-a81a35979e90}

### 题目要点

`Promise.resolve().then()` 属于微任务，`setTimeout(fn, 0)` 属于宏任务。事件循环在每轮宏任务执行结束后会立即清空微任务队列，因此 Promise 回调一定先于 setTimeout 执行。0ms 仅表示最早可执行时间，而不是立即执行，本质差异在于任务队列优先级而非时间参数。

<details>
<summary>参考答案</summary>

这个问题本质考察的是 **事件循环（Event Loop）中宏任务与微任务的调度优先级**。

结论先给出：在同一轮调用栈执行完成之后，`Promise.resolve().then()` 一定早于 `setTimeout(fn, 0)` 执行。

原因不在于时间参数是 0，而在于它们被放入的是不同的任务队列。

---

一、两者分别进入什么队列

`setTimeout(fn, 0)` 会把回调放入 **宏任务队列（macrotask queue）**。

`Promise.resolve().then()` 会把回调放入 **微任务队列（microtask queue）**。

在浏览器环境中，常见宏任务包括：

* script（整体脚本）
* setTimeout
* setInterval
* I/O
* UI render

常见微任务包括：

* Promise.then / catch / finally
* queueMicrotask
* MutationObserver

---

二、事件循环的执行模型

每一轮事件循环的核心流程是：

1. 执行一个宏任务（例如当前 script）
2. 执行所有微任务（清空微任务队列）
3. 可能进行一次渲染
4. 再取下一个宏任务

关键点在于：

**每执行完一个宏任务，都会立即清空当前微任务队列。**

---

三、结合代码分析

```js
console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

Promise.resolve().then(() => {
  console.log(3);
});

console.log(4);
```

执行过程：

第一步：整个 script 是一个宏任务
同步执行：

输出 1
注册 setTimeout
注册 Promise.then
输出 4

此时同步代码执行结束。

第二步：清空微任务队列

执行 Promise.then → 输出 3

第三步：进入下一轮宏任务

执行 setTimeout 回调 → 输出 2

最终顺序：

1
4
3
2

---

四、为什么 0ms 也不会立即执行

`setTimeout(fn, 0)` 的 0 不是“立即执行”，而是“最早可执行时间”。

它至少要满足两个条件：

* 当前宏任务执行完成
* 当前微任务队列清空
* 浏览器调度到该宏任务

此外，在浏览器中还存在最小时间间隔限制（通常为 4ms 嵌套限制）。

---

五、Node.js 中的差异

在 Node 环境中还存在：

* process.nextTick（优先级高于 Promise 微任务）
* setImmediate（不同阶段的宏任务）

但在浏览器语境下，规则相对简单：

Promise 微任务 > setTimeout 宏任务。

---

六、工程角度的理解

微任务的设计目的是：

* 在当前逻辑结束后立即执行
* 在渲染前完成状态一致性处理

例如在 React、Vue 等框架中，Promise 微任务常用于批量更新调度，以保证 DOM 更新前数据已稳定。

宏任务则用于：

* 延迟执行
* 让出主线程
* 拆分长任务

</details>

## 6. Node.js 事件循环的 6 个阶段 {#question-2b415f44-7a22-4e74-bef4-1b7c09e170d4}

> 题库原题：[说说对Nodejs中的事件循环机制理解?](https://fe.ecool.fun/topic/2b415f44-7a22-4e74-bef4-1b7c09e170d4)

### 题目要点

**作答思路**：

Node.js中的事件循环机制是一种异步编程模型，它基于事件驱动和非阻塞I/O。其核心是V8引擎和libuv库。V8负责执行JavaScript代码，而libuv负责处理系统调用和I/O操作。
事件循环的主要组成部分包括：

1. **主事件循环（Main Loop）**：负责处理异步任务，包括文件读写、网络请求等。
2. **事件队列**：存储等待处理的异步任务。
3. **观察者模式**：用于处理异步任务完成后的回调。
当有事件发生时，libuv会将事件放入事件队列，V8引擎会不断检查事件队列，如果有事件，则调用相应的回调函数。这种机制使得Node.js能够高效地处理大量的并发请求。

**考察要点**：

1. **事件循环概念**：理解事件循环在Node.js中的作用和基本原理。
2. **异步编程模型**：理解事件驱动和非阻塞I/O在Node.js中的应用。
3. **事件队列和观察者模式**：理解事件队列和观察者模式在事件循环中的作用。

<details>
<summary>参考答案</summary>

## 一、是什么

在[浏览器事件循环](https://github.com/febobo/web-interview/issues/73)中，我们了解到`javascript`在浏览器中的事件循环机制，其是根据`HTML5`定义的规范来实现

而在`NodeJS`中，事件循环是基于`libuv`实现，`libuv`是一个多平台的专注于异步IO的库，如下图最右侧所示：

 ![](https://static.ecool.fun//article/a3883f83-894a-475e-9352-2c6d5fe3dc2d.png)

上图`EVENT_QUEUE` 给人看起来只有一个队列，但`EventLoop`存在6个阶段，每个阶段都有对应的一个先进先出的回调队列

## 二、流程

上节讲到事件循环分成了六个阶段，对应如下：

 ![](https://static.ecool.fun//article/b120f48a-402c-4784-a78b-366151217ed5.png)

- timers阶段：这个阶段执行timer（setTimeout、setInterval）的回调
- 定时器检测阶段(timers)：本阶段执行 timer 的回调，即 setTimeout、setInterval 里面的回调函数
- I/O事件回调阶段(I/O callbacks)：执行延迟到下一个循环迭代的 I/O 回调，即上一轮循环中未被执行的一些I/O回调
- 闲置阶段(idle, prepare)：仅系统内部使用
- 轮询阶段(poll)：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外），其余情况 node 将在适当的时候在此阻塞
- 检查阶段(check)：setImmediate() 回调函数在这里执行
- 关闭事件回调阶段(close callback)：一些关闭的回调函数，如：socket.on('close', ...)

每个阶段对应一个队列，当事件循环进入某个阶段时, 将会在该阶段内执行回调，直到队列耗尽或者回调的最大数量已执行, 那么将进入下一个处理阶段

除了上述6个阶段，还存在`process.nextTick`，其不属于事件循环的任何一个阶段，它属于该阶段与下阶段之间的过渡, 即本阶段执行结束, 进入下一个阶段前, 所要执行的回调，类似插队

流程图如下所示：

 ![](https://static.ecool.fun//article/6ab9a805-9ff5-4a47-985f-e15c2e3442c2.png)

在`Node`中，同样存在宏任务和微任务，与浏览器中的事件循环相似

微任务对应有：

- next tick queue：process.nextTick
- other queue：Promise的then回调、queueMicrotask

宏任务对应有：

- timer queue：setTimeout、setInterval
- poll queue：IO事件
- check queue：setImmediate
- close queue：close事件

其执行顺序为：

- next tick microtask queue
- other microtask queue
- timer queue
- poll queue
- check queue
- close queue

## 三、题目

通过上面的学习，下面开始看看题目

```js
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}

async function async2() {
    console.log('async2')
}

console.log('script start')

setTimeout(function () {
    console.log('setTimeout0')
}, 0)

setTimeout(function () {
    console.log('setTimeout2')
}, 300)

setImmediate(() => console.log('setImmediate'));

process.nextTick(() => console.log('nextTick1'));

async1();

process.nextTick(() => console.log('nextTick2'));

new Promise(function (resolve) {
    console.log('promise1')
    resolve();
    console.log('promise2')
}).then(function () {
    console.log('promise3')
})

console.log('script end')
```

分析过程：

- 先找到同步任务，输出script start
- 遇到第一个 setTimeout，将里面的回调函数放到 timer 队列中
- 遇到第二个 setTimeout，300ms后将里面的回调函数放到 timer 队列中
- 遇到第一个setImmediate，将里面的回调函数放到 check 队列中
- 遇到第一个 nextTick，将其里面的回调函数放到本轮同步任务执行完毕后执行

- 执行 async1函数，输出 async1 start
- 执行 async2 函数，输出 async2，async2 后面的输出 async1 end进入微任务，等待下一轮的事件循环
- 遇到第二个，将其里面的回调函数放到本轮同步任务执行完毕后执行
- 遇到 new Promise，执行里面的立即执行函数，输出 promise1、promise2
- then里面的回调函数进入微任务队列
- 遇到同步任务，输出 script end
- 执行下一轮回到函数，先依次输出 nextTick 的函数，分别是 nextTick1、nextTick2
- 然后执行微任务队列，依次输出 async1 end、promise3
- 执行timer 队列，依次输出 setTimeout0
- 接着执行 check  队列，依次输出 setImmediate
- 300ms后，timer 队列存在任务，执行输出 setTimeout2

执行结果如下：

```
script start
async1 start
async2
promise1
promise2
script end
nextTick1
nextTick2
async1 end
promise3
setTimeout0
setImmediate
setTimeout2
```

最后有一道是关于`setTimeout`与`setImmediate`的输出顺序

```js
setTimeout(() => {
  console.log("setTimeout");
}, 0);

setImmediate(() => {
  console.log("setImmediate");
});
```

输出情况如下：

```js
情况一：
setTimeout
setImmediate

情况二：
setImmediate
setTimeout
```

分析下流程：

- 外层同步代码一次性全部执行完，遇到异步API就塞到对应的阶段
- 遇到`setTimeout`，虽然设置的是0毫秒触发，但实际上会被强制改成1ms，时间到了然后塞入`times`阶段
- 遇到`setImmediate`塞入`check`阶段
- 同步代码执行完毕，进入Event Loop
- 先进入`times`阶段，检查当前时间过去了1毫秒没有，如果过了1毫秒，满足`setTimeout`条件，执行回调，如果没过1毫秒，跳过
- 跳过空的阶段，进入check阶段，执行`setImmediate`回调

这里的关键在于这1ms，如果同步代码执行时间较长，进入`Event Loop`的时候1毫秒已经过了，`setTimeout`先执行，如果1毫秒还没到，就先执行了`setImmediate`

</details>

## 7. 箭头函数的 `this` 绑定规则与普通函数的区别？ {#question-33363940-179b-4ae3-9cd3-7bf0a5619df9}

> 题库原题：[箭头函数的 this 指向哪⾥？](https://fe.ecool.fun/topic/33363940-179b-4ae3-9cd3-7bf0a5619df9)

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

## 8. Class 语法糖的底层实现 {#question-86483690-5e1e-4dae-911e-0aba1644bd2f}

> 题库原题：[说说 Class 语法糖的底层实现](https://fe.ecool.fun/topic/86483690-5e1e-4dae-911e-0aba1644bd2f)

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

## 9. Proxy 如何实现深度监听？ {#question-6d66ddb0-f53a-4286-b5e1-bf7ca3bcd34e}

> 题库原题：[如何让 Proxy 去监听基本数据类型？](https://fe.ecool.fun/topic/6d66ddb0-f53a-4286-b5e1-bf7ca3bcd34e)

### 题目要点

`Proxy`无法直接监听基本数据类型（如字符串、数字、布尔值等），因为它们是不可变的。`Proxy`只能在对象级别上进行操作，而不是基本数据类型。

<details>
<summary>参考答案</summary>

`Proxy`无法直接监听基本数据类型（如字符串、数字、布尔值等），因为它们是不可变的。`Proxy`只能在对象级别上进行操作，而不是基本数据类型。

当我们尝试使用`Proxy`包装基本数据类型时，会得到一个`TypeError`错误，因为基本数据类型不具有属性和方法。

以下展示了尝试在基本数据类型上应用`Proxy`时会发生的错误：

```javascript
const value = 'Hello';

const handler = {
  set(target, property, value) {
    console.log(`Setting property '${property}' to '${value}'`);
    target[property] = value;
    return true;
  }
};

const proxyValue = new Proxy(value, handler); // TypeError: Cannot create proxy with a non-object as target
```

如果要监听基本数据类型的更改，最好使用其他方式，例如通过触发事件或调用回调函数来通知更改。可以创建一个自定义的数据包装器，将基本数据类型包装在对象中，并在该对象上实现监听逻辑。这样，可以在包装器对象上添加`Proxy`以监听其属性的更改。

以下是一个示例，演示如何使用自定义的数据包装器来监听基本数据类型的更改：

```javascript
function ValueWrapper(value) {
  this.value = value;
  this.onChange = null;
}

ValueWrapper.prototype.setValue = function(newValue) {
  this.value = newValue;
  if (typeof this.onChange === 'function') {
    this.onChange(this.value);
  }
};

const wrapper = new ValueWrapper('Hello');

const handler = {
  set(target, property, value) {
    console.log(`Setting property '${property}' to '${value}'`);
    target[property] = value;
    if (typeof target.onChange === 'function') {
      target.onChange(target.value);
    }
    return true;
  }
};

const proxyWrapper = new Proxy(wrapper, handler);

proxyWrapper.onChange = newValue => {
  console.log(`Value changed: ${newValue}`);
};

proxyWrapper.setValue('Hi'); // 输出: Setting property 'value' to 'Hi', Value changed: Hi
```

在上述示例中，我们创建了一个`ValueWrapper`对象作为数据包装器，并在其原型上定义了`setValue`方法来设置值并触发更改事件。然后，我们使用`Proxy`对该包装器对象进行拦截，以监听`value`属性的更改，并在适当时调用回调函数 `onChange`。

通过这种方式，可以实现对基本数据类型的更改进行监听和响应。

</details>

## 10. 说说你对React的了解 {#question-36adf219-6e4e-44fb-b22f-8e024ace05b5}

> 题库原题：[说说你对 React 生态的了解](https://fe.ecool.fun/topic/36adf219-6e4e-44fb-b22f-8e024ace05b5)

### 题目要点

React 的生态围绕组件化、状态管理、路由、数据请求、构建和测试等各个方面，提供了从开发到部署的完整工具链。根据项目规模和需求的不同，可以灵活选型构建不同复杂度的应用。React 本身的“库而非框架”特性，也为其生态的多样性和活力提供了基础。

<details>
<summary>参考答案</summary>

React 的生态系统非常丰富，是支撑其成为主流前端框架的重要原因之一。

可以从几个主要方面简要说明：

---

### 1. **状态管理**
- **Redux**：经典的状态管理方案，适合大型应用，配合中间件（如 redux-thunk、redux-saga）处理异步逻辑。
- **Zustand / Jotai / Recoil**：更现代、轻量的替代方案，适合中小型项目。
- **React Context + useReducer**：适合简单全局状态的共享，不依赖外部库。

---

### 2. **路由管理**
- **React Router**：React 官方推荐的路由库，支持嵌套路由、懒加载、动态路由等。
- **Next.js 自带路由**：基于文件系统的路由方案，简化配置流程。

---

### 3. **异步数据管理**
- **SWR / React Query**：支持缓存、自动重试、请求去重、依赖刷新等功能，极大提升了数据请求体验。
- **Axios / Fetch**：底层请求库，通常配合上述工具使用。

---

### 4. **组件库**
- **Ant Design / Material UI**：完整的企业级组件库，满足常规开发需求。
- **Tailwind CSS + Headless UI**：更注重样式和结构分离，适合需要高度定制的项目。
- **shadcn/ui**：基于 Tailwind 构建，现代化、高可定制的新兴组件库。

---

### 5. **框架扩展**
- **Next.js**：服务端渲染 + 静态生成的 React 应用框架，支持 SEO、路由、API 路由等。
- **Remix**：强调服务端优先的路由框架，增强数据获取和页面渲染逻辑。

---

### 6. **构建工具**
- **Vite / Webpack / Parcel**：React 可以在这些工具中灵活运行，Vite 更现代、热更新更快。
- **Create React App (CRA)**：React 官方脚手架，适合快速搭建项目。

---

### 7. **测试工具**
- **Jest**：React 官方推荐的测试框架。
- **React Testing Library**：以用户视角测试组件行为，更贴近真实交互。
- **Cypress / Playwright**：端到端测试工具，测试完整用户流程。

---

### 8. **动画与交互**
- **Framer Motion**：流畅强大的动画库，配合 React 使用简单高效。
- **React Spring**：基于物理的动画方案，适合复杂动画场景。

</details>

## 11. Fiber 架构如何解决卡顿 {#question-8ebf476c-a776-49a1-a8b7-7eae37237cb2}

> 题库原题：[fiber 架构的工作原理？](https://fe.ecool.fun/topic/8ebf476c-a776-49a1-a8b7-7eae37237cb2)

### 题目要点

Fiber 架构通过引入增量渲染、任务调度、优先级管理和错误处理等机制，提高了 React 的渲染性能和用户体验。它将渲染过程拆分为多个可中断的工作单元，允许更高效地处理复杂的 UI 更新和交互。

<details>
<summary>参考答案</summary>

React 中的 Fiber 架构是一种新的协调算法，旨在提高 React 的性能和用户体验。它通过引入新的数据结构和机制，使得 React 能够更高效地处理 UI 更新。以下是 Fiber 架构的工作原理：

### **1. Fiber 数据结构**

- **Fiber 节点**：Fiber 是一个表示组件的内部数据结构，每个 Fiber 节点对应一个 React 组件。它包含了组件的状态、更新信息和子组件的引用等。
- **Fiber 树**：Fiber 节点形成了一棵 Fiber 树，类似于旧版的虚拟 DOM 树。每个 Fiber 节点指向其父节点、子节点和兄弟节点。

### **2. 工作单元和增量渲染**

- **工作单元**：渲染过程被分解为多个工作单元，每个单元代表一个小的渲染任务。这样可以将渲染过程拆分成可中断的任务，以避免长时间的阻塞。
- **增量渲染**：Fiber 允许将渲染任务拆分为增量的操作，逐步完成整个渲染过程。每次渲染会处理 Fiber 树的一部分，允许在任务之间插入中断点，从而提高了渲染的响应性。

### **3. 调度优先级**

- **优先级调度**：Fiber 引入了任务调度机制，允许根据任务的优先级来决定渲染的顺序。高优先级的任务（如用户输入、动画）会优先处理，而低优先级的任务（如数据加载）会在空闲时间处理。
- **任务中断和恢复**：Fiber 支持在渲染过程中中断并恢复任务。当重要任务需要处理时，当前的渲染任务可以被中断，待重要任务完成后再恢复继续。

### **4. 更新和协调**

- **更新队列**：每个 Fiber 节点都有一个更新队列，用于存储与组件相关的更新信息。更新队列可以包含多个更新，React 会根据更新的优先级和顺序进行协调。
- **协调过程**：Fiber 通过对比新旧 Fiber 树来决定哪些部分需要更新。这一过程称为协调（Reconciliation），它会检查节点的变更，生成更新的补丁。

### **5. 渲染阶段和提交阶段**

- **渲染阶段**：在渲染阶段，Fiber 架构会计算出需要更新的部分，但不会立即更新 DOM。这一阶段主要用于计算新的 Fiber 树，并生成更新任务。
- **提交阶段**：在提交阶段，Fiber 会将渲染阶段计算出的更新应用到实际的 DOM 上。这个阶段是同步的，确保所有的更改都被正确地应用。

### **6. 错误处理**

- **错误边界**：Fiber 提供了更好的错误处理机制，可以局部地处理渲染中的错误。即使在渲染过程中发生错误，也能保证 UI 的部分更新和恢复。

</details>

## 12. Diff 算法中 key 的作用与索引 key 的风险？ {#question-subjective-fe16132afb2f}

### 题目要点

Diff 算法中 key 的作用是为虚拟节点提供稳定身份标识，使框架能够基于 key 建立映射关系，实现节点复用与最小化 DOM 操作。使用 index 作为 key 在列表发生插入、删除或排序时会导致组件实例错位和状态混乱，因为节点身份随位置变化而变化。稳定且唯一的 key 是保证 Diff 正确性与性能的前提。

<details>
<summary>参考答案</summary>

这个问题本质考察的是：虚拟 DOM Diff 的优化策略，以及“节点身份（identity）”在更新过程中的作用。

在 React 或 Vue 这类基于 Virtual DOM 的框架中，列表更新时不会直接逐个销毁重建 DOM，而是会进行同层节点比较（same-level diff）。而 key，就是用来标识“同一节点”的稳定身份。

### 一、key 在 Diff 中的核心作用

在没有 key 的情况下，框架只能采用“按索引位置对比”的策略：

* 第 0 个新节点对比旧的第 0 个
* 第 1 个对比第 1 个
* 依次类推

这是一种基于位置的比较。

当存在 key 时，Diff 会先建立一张映射表（通常是 key → oldVNode 的哈希映射），然后在新列表中根据 key 查找对应旧节点，从而实现：

* 节点复用
* 最小化 DOM 操作
* 保持组件实例状态

也就是说，key 的本质是：为节点提供稳定的 identity，而不是为了“加速循环”。

### 二、没有 key 或 key 不稳定时会发生什么

如果列表发生插入操作，例如：

旧列表：
A B C D

新列表：
X A B C D

在没有 key 的情况下，Diff 会认为：

A → X
B → A
C → B
D → C

结果是每个节点都被“更新”，甚至触发组件重渲染，而不是简单插入一个新节点。

而有稳定 key 时：

只会新增 X，其余节点全部复用。

这就是 key 带来的性能优化。

### 三、使用 index 作为 key 的风险

使用 index 作为 key 的问题在于：当列表发生顺序变化时，index 本身会改变。

例如删除第一个元素：

旧：
0:A
1:B
2:C

新：
0:B
1:C

如果 key 是 index：

原本 key=1 的 B，现在变成 key=0
React 会认为：

旧的 A（key=0） → 新的 B（key=0）

于是组件实例被复用，但数据已经变了。

这会导致两个典型问题：

第一，组件内部状态错位
如果列表项内部有 useState 或本地状态，状态会“跟着位置走”，而不是跟着数据走。

第二，输入框等可控组件异常
常见现象是输入框内容错乱，因为 DOM 被复用但数据已经换了。

也就是说，index key 会破坏“数据与组件实例的一一对应关系”。

### 四、什么时候 index 是安全的

index 不是绝对不能用，而是有前提条件：

* 列表是静态的
* 不会发生插入、删除、排序
* 仅用于展示

例如一个纯展示的评分星级组件，数量固定，此时使用 index 不会带来副作用。

但只要列表具有“动态结构变化”的可能，就不应该使用 index。

### 五、从算法角度理解 key 的意义

React 的 Diff 复杂度理想情况下是 O(n)。
这是基于两个假设：

1. 同层比较
2. 通过 key 快速匹配

如果 key 不稳定，等于退化成“顺序比对 + 大量错误复用”，不仅逻辑错误，还可能导致多余渲染。

Vue3 甚至在 Diff 中使用双端指针 + key 映射优化移动成本，本质仍然依赖 key 的稳定性。

### 六、工程实践原则

key 应满足两个特征：

* 唯一性（在同一层级内唯一）
* 稳定性（在整个生命周期内不随渲染变化）

通常使用：

* 后端返回的 id
* 数据库主键
* 业务唯一标识

而不应使用：

* Math.random()
* index
* 每次 render 生成的新值

### 七、深入理解：key 决定的是“是否复用组件实例”

很多人误以为 key 只影响 DOM，其实更重要的是影响组件实例的保留与销毁。

改变 key 等价于强制卸载再挂载组件。

这在某些场景下甚至是刻意使用的技巧，例如重置组件状态。

</details>

## 13. Hooks 的依赖数组原理 {#question-7e56d9a7-fe8f-4b9f-819f-68247725f673}

> 题库原题：[说说 Hooks 的依赖数组原理](https://fe.ecool.fun/topic/7e56d9a7-fe8f-4b9f-819f-68247725f673)

### 题目要点

Hooks 的依赖数组本质是一次浅层引用比较机制。React 在 commit 阶段通过 Object.is 逐项比较新旧依赖数组，决定是否重新执行 effect，并在变化时先执行 cleanup。依赖数组不会监听变量变化，也不负责触发 render，只用于声明副作用与状态之间的关系。依赖缺失会导致闭包捕获旧值，依赖不稳定会导致 effect 频繁执行，因此依赖必须完整且保持引用稳定。

<details>
<summary>参考答案</summary>

这个问题的核心，不是“依赖数组怎么写”，而是：**React 是如何判断副作用是否需要重新执行的**。

依赖数组的存在，本质是为了让 React 在两次 render 之间进行一次“浅层比较（shallow compare）”，从而决定是否跳过本次 effect 的执行。

---

## 一、从 useEffect 的执行时机说起

```js
useEffect(() => {
  // effect
}, [a, b]);
```

React 在每次 render 结束后，会把 effect 收集到 Fiber 节点的 effect 链表中。

当进入 commit 阶段时，React 会：

1. 取出当前 Fiber 上一次保存的依赖数组
2. 与本次 render 生成的新依赖数组进行比较
3. 决定是否标记该 effect 需要执行

如果依赖变化，则：

* 先执行上一次的 cleanup
* 再执行新的 effect

如果依赖未变化，则跳过。

---

## 二、底层判断逻辑

React 内部判断依赖是否变化，核心逻辑类似：

```js
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return false;

  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false;
    }
  }
  return true;
}
```

关键点有两个：

### 1. 使用的是 Object.is

不是 `===`，而是 `Object.is`，因此：

* `NaN` 与 `NaN` 被认为相等
* `+0` 与 `-0` 被认为不相等

这是为了和 React 内部状态更新逻辑保持一致。

### 2. 只做浅比较

依赖数组中的每一项，只做引用层级的比较。

这意味着：

```js
useEffect(() => {}, [{}]);
```

每次 render 都会重新执行，因为对象引用变化。

---

## 三、为什么依赖数组必须写全

React 不会分析 effect 内部使用了哪些变量。

依赖数组完全由开发者声明。

如果 effect 内部使用了某个变量，但没有放入依赖数组，那么：

* 变量变化时 effect 不会重新执行
* effect 内部捕获的是旧闭包中的值
* 出现“闭包陷阱”（stale closure）

例如：

```js
useEffect(() => {
  console.log(count);
}, []);
```

这里只会打印初始 count，因为 effect 永远不会重新执行。

这不是 React 的 bug，而是依赖声明不完整。

ESLint 的 `react-hooks/exhaustive-deps` 插件，本质是在做静态分析，提醒依赖缺失。

---

## 四、空数组与不写依赖的区别

```js
useEffect(() => {}, []);
```

表示：只在首次挂载时执行一次（以及卸载时 cleanup）。

而：

```js
useEffect(() => {});
```

表示：每次 render 后都执行。

这两种语义差异非常大。

---

## 五、依赖数组与性能的关系

依赖数组不是用来“优化性能”的工具，而是用来声明副作用与状态之间的关系。

如果依赖声明准确：

* effect 执行次数最少
* 逻辑正确

如果为了“减少执行”而故意删除依赖：

* 会产生逻辑错误
* 引入难以排查的状态不一致问题

真正的优化方式应该是：

* 使用 useMemo / useCallback 保持引用稳定
* 或者重构 effect 逻辑

---

## 六、从 Fiber 角度理解

每个 Hook 在 Fiber 上都会形成一个链表节点：

* memoizedState：存储上一次依赖
* next：指向下一个 Hook

在下一次 render 时：

* React 按调用顺序读取对应 Hook 节点
* 拿到上一次的依赖
* 进行对比

这也是为什么 Hook 调用顺序必须稳定。

依赖数组只是挂在这个 Hook 节点上的一段元数据。

---

## 七、一个常见误区

很多人认为依赖数组是“监听变量变化”。

实际上 React 并不会监听变量。

变量变化只是触发 render，render 之后 React 才会在 commit 阶段做依赖比较。

也就是说：

依赖数组不参与“触发更新”，只参与“是否执行副作用”。

</details>

## 14. useEffect 清理函数的执行时机 {#question-subjective-ad208342486d}

### 题目要点

useEffect, 清理函数, 组件卸载, 重新渲染, 资源释放

<details>
<summary>参考答案</summary>

useEffect的清理函数在组件卸载前和每次渲染后都会执行。具体来说，在组件卸载时，清理函数会自动执行；在组件重新渲染时，清理函数会在新的副作用执行之前执行。这种机制确保了资源的正确释放和副作用的正确管理。

</details>

## 15. 从输入 URL 到页面渲染的完整流程 {#question-61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6}

> 题库原题：[简述 html 页面渲染过程](https://fe.ecool.fun/topic/61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6)

### 题目要点

1. **解析 HTML** -> 构建 DOM 树。
2. **解析 CSS** -> 构建 CSSOM 树。
3. **合并 DOM 和 CSSOM** -> 构建渲染树。
4. **计算布局** -> 生成布局信息。
5. **绘制页面** -> 将内容绘制到屏幕。
6. **合成和显示** -> 合成图层并显示页面。
7. **JavaScript 执行** -> 执行脚本可能导致重绘或回流。

<details>
<summary>参考答案</summary>

整个渲染过程其实就是将URL对应的各种资源，通过浏览器渲染引擎的解析，输出可视化的图像。

## 基本概念

* HTML解释器：解释HTML语言的解释器，本质是将HTML文本解释成DOM树（文档对象模型）。
* CSS解释器：解释样式表的解释器，其作用是将DOM中的各个元素对象加上样式信息，从而为计算最后结果的布局提供依据。
* 布局：将DOM和css样式信息结合起来，计算它们的大小位置等布局信息，形成一个能够表示这所有信息的内部表示模型即渲染树。
* JavaScript引擎：JavaScript可以修改网页的内容，也能修改CSS的信息，JavaScript引擎解释JavaScript代码并把代码的逻辑和对DOM和CSS的改动信息应用到布局中去，从而改变渲染的结果。

## 基本过程

* 1.解析HTML文件，创建DOM树

浏览器解析html源码，然后创建一个 DOM树。并行请求 css/image/js在DOM树中，每一个HTML标签都有一个对应的节点，并且每一个文本也都会有一个对应的文本节点。DOM树的根节点就是 documentElement，对应的是html标签。

* 2.解析CSS,形成CSS对象模型

浏览器解析CSS代码，计算出最终的样式数据。构建CSSOM树。对CSS代码中非法的语法它会直接忽略掉。解析CSS的时候会按照如下顺序来定义优先级：

> 浏览器默认设置 < 用户设置 < 外链样式 < 内联样式 &lt; html中的style。

* 3.将CSS与DOM合并，构建渲染树（renderingtree）

DOM Tree + CSSOM –> 渲染树（rendering tree）。渲染树和DOM树有点像，但是是有区别的。DOM树完全和html标签一一对应，但是渲染树会忽略掉不需要渲染的元素，比如head、display:none的元素等。而且一大段文本中的每一个行在渲染树中都是独立的一个节点。渲染树中的每一个节点都存储有对应的css属性。

* 4.布局和绘制

一旦渲染树创建好了，浏览器就可以根据渲染树直接把页面绘制到屏幕上。

以上四个步骤并不是一次性顺序完成的。如果DOM或者CSSOM被修改，以上过程会被重复执行。实际上，CSS和JavaScript往往会多次修改DOM或者CSSOM。

### Repaint(重绘)

重绘是改变不影响元素在网页中的位置的元素样式时，譬如background-color(背景色)， border-color(边框色)，visibility(可见性)，浏览器会根据元素的新属性重新绘制一次(这就是重绘，或者说重新构造样式)，使元素呈现新的外观。

重绘不会带来重新布局，所以并不一定伴随重排。

### Reflow（重排）

渲染对象在创建完成并添加到渲染树时，并不包含位置和大小信息。计算这些值的过程称为布局或重排。

"重绘"不一定需要"重排"，比如改变某个网页元素的颜色，就只会触发"重绘"，不会触发"重排"，因为布局没有改变。

但是，"重排"必然导致"重绘"，比如改变一个网页元素的位置，就会同时触发"重排"和"重绘"，因为布局改变了。

## 引申问题：浏览器如何优化渲染？

* 将多次改变样式属性的操作合并成一次操作
* 将需要多次重排的元素，position属性设为absolute或fixed，这样此元素就脱离了文档流，它的变化不会影响到其他元素。例如有动画效果的元素就最好设置为绝对定位。
* 由于display属性为none的元素不在渲染树中，对隐藏的元素操作不会引发其他元素的重排。如果要对一个元素进行复杂的操作时，可以先隐藏它，操作完成后再显示。这样只在隐藏和显示时触发2次重排。

</details>

## 16. 怎么理解回流跟重绘？什么场景下会触发？ {#question-417ebda0-3f2d-48d3-95ec-ae1838bf39cb}

> 题库原题：[怎么理解回流跟重绘？什么场景下会触发？](https://fe.ecool.fun/topic/417ebda0-3f2d-48d3-95ec-ae1838bf39cb)

### 题目要点

回流（Reflow）和重绘（Repaint）是浏览器在渲染页面时发生的两种性能成本较高的操作。

#### 回流（Reflow）

回流是指浏览器需要重新计算元素的尺寸、位置等属性，然后重新排列这些元素的过程。当DOM结构发生变化时，浏览器需要重新计算这些元素的布局信息。

触发回流的场景：

- 页面初次加载。
- 元素尺寸、位置或内容发生变化（如通过JavaScript修改样式）。
- 浏览器窗口大小变化（响应式设计）。
- 元素的class或id属性改变。
- 调用了某些会引起布局变化的方法，如offsetTop、offsetLeft、scrollTop、scrollLeft、clientTop、clientLeft等。

#### 重绘（Repaint）

重绘是指当元素的外观（如颜色、背景色、边框颜色等）发生变化，但不影响布局时，浏览器需要重新绘制这些元素。

触发重绘的场景：

- 元素的颜色、背景色、边框颜色等属性改变。
- 元素的可见性发生变化（如visibility、display属性改变）。
- 元素的box-shadow、text-shadow等属性改变。
- CSS伪类状态改变，如:hover、:focus。
- 理解回流和重绘的重要性

回流和重绘是性能瓶颈的常见原因。它们都会增加浏览器的渲染负担，尤其是当涉及到大量元素时。因此，优化回流和重绘是提高网页性能的关键。

#### 优化策略

- 减少不必要的DOM操作，尤其是在复杂的页面布局中。
- 使用transform和opacity属性进行动画，因为它们可以触发合成（Compositing），从而避免回流和重绘。
- 将多个会引起回流的样式更改合并到一个动画帧中进行。
- 使用文档片段（Document Fragment）或display: none的元素进行DOM操作，以减少对可见元素的影响。
- 使用CSS变量（Custom Properties）来实现主题切换，以减少重绘和回流。

#### 考察重点

- 对回流和重绘概念的理解。
- 能够识别和解释触发回流和重绘的场景。
- 掌握减少回流和重绘性能影响的优化技巧。

<details>
<summary>参考答案</summary>

## 一、是什么

在`HTML`中，每个元素都可以理解成一个盒子，在浏览器解析过程中，会涉及到回流与重绘：

- 回流：布局引擎会根据各种样式计算每个盒子在页面上的大小与位置

- 重绘：当计算好盒模型的位置、大小及其他属性后，浏览器根据每个盒子特性进行绘制

具体的浏览器解析渲染机制如下所示：

 ![](https://static.ecool.fun//article/19adb6a1-5ac2-4d39-b06f-166c3541d01f.png)

- 解析HTML，生成DOM树，解析CSS，生成CSSOM树

- 将DOM树和CSSOM树结合，生成渲染树(Render Tree)
- Layout(回流):根据生成的渲染树，进行回流(Layout)，得到节点的几何信息（位置，大小）
- Painting(重绘):根据渲染树以及回流得到的几何信息，得到节点的绝对像素
- Display:将像素发送给GPU，展示在页面上

在页面初始渲染阶段，回流不可避免的触发，可以理解成页面一开始是空白的元素，后面添加了新的元素使页面布局发生改变

当我们对 `DOM` 的修改引发了 `DOM `几何尺寸的变化（比如修改元素的宽、高或隐藏元素等）时，浏览器需要重新计算元素的几何属性，然后再将计算的结果绘制出来

当我们对 `DOM `的修改导致了样式的变化（`color`或`background-color`），却并未影响其几何属性时，浏览器不需重新计算元素的几何属性、直接为该元素绘制新的样式，这里就仅仅触发了重绘

## 二、如何触发

要想减少回流和重绘的次数，首先要了解回流和重绘是如何触发的

### 回流触发时机

回流这一阶段主要是计算节点的位置和几何信息，那么当页面布局和几何信息发生变化的时候，就需要回流，如下面情况：

- 添加或删除可见的DOM元素
- 元素的位置发生变化
- 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
- 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代
- 页面一开始渲染的时候（这避免不了）
- 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

还有一些容易被忽略的操作：获取一些特定属性的值

> offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight

这些属性有一个共性，就是需要通过即时计算得到。因此浏览器为了获取这些值，也会进行回流

除此还包括`getComputedStyle `方法，原理是一样的

### 重绘触发时机

触发回流一定会触发重绘

可以把页面理解为一个黑板，黑板上有一朵画好的小花。现在我们要把这朵从左边移到了右边，那我们要先确定好右边的具体位置，画好形状（回流），再画上它原有的颜色（重绘）

除此之外还有一些其他引起重绘行为：

- 颜色的修改

- 文本方向的修改
- 阴影的修改

### 浏览器优化机制

由于每次重排都会造成额外的计算消耗，因此大多数浏览器都会通过队列化修改并批量执行来优化重排过程。浏览器会将修改操作放入到队列里，直到过了一段时间或者操作达到了一个阈值，才清空队列

当你获取布局信息的操作的时候，会强制队列刷新，包括前面讲到的`offsetTop`等方法都会返回最新的数据

因此浏览器不得不清空队列，触发回流重绘来返回正确的值

## 三、如何减少

我们了解了如何触发回流和重绘的场景，下面给出避免回流的经验：

- 如果想设定元素的样式，通过改变元素的 `class` 类名 (尽可能在 DOM 树的最里层)
- 避免设置多项内联样式
- 应用元素的动画，使用 `position` 属性的 `fixed` 值或 `absolute` 值(如前文示例所提)
- 避免使用 `table` 布局，`table` 中每个元素的大小以及内容的改动，都会导致整个 `table` 的重新计算
- 对于那些复杂的动画，对其设置 `position: fixed/absolute`，尽可能地使元素脱离文档流，从而减少对其他元素的影响
- 使用css3硬件加速，可以让`transform`、`opacity`、`filters`这些动画不会引起回流重绘
- 避免使用 CSS 的 `JavaScript` 表达式

在使用 `JavaScript` 动态插入多个节点时, 可以使用`DocumentFragment`. 创建后一次插入. 就能避免多次的渲染性能

但有时候，我们会无可避免地进行回流或者重绘，我们可以更好使用它们

例如，多次修改一个把元素布局的时候，我们很可能会如下操作

```js
const el = document.getElementById('el')
for(let i=0;i<10;i++) {
    el.style.top  = el.offsetTop  + 10 + "px";
    el.style.left = el.offsetLeft + 10 + "px";
}
```

每次循环都需要获取多次`offset`属性，比较糟糕，可以使用变量的形式缓存起来，待计算完毕再提交给浏览器发出重计算请求

```js
// 缓存offsetLeft与offsetTop的值
const el = document.getElementById('el')
let offLeft = el.offsetLeft, offTop = el.offsetTop

// 在JS层面进行计算
for(let i=0;i<10;i++) {
  offLeft += 10
  offTop  += 10
}

// 一次性将计算结果应用到DOM上
el.style.left = offLeft + "px"
el.style.top = offTop  + "px"
```

我们还可避免改变样式，使用类名去合并样式

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

使用类名去合并样式

```html
<style>
    .basic_style {
        width: 100px;
        height: 200px;
        border: 10px solid red;
        color: red;
    }
</style>
<script>
    const container = document.getElementById('container')
    container.classList.add('basic_style')
</script>
```

前者每次单独操作，都去触发一次渲染树更改（新浏览器不会），

都去触发一次渲染树更改，从而导致相应的回流与重绘过程

合并之后，等于我们将所有的更改一次性发出

我们还可以通过通过设置元素属性`display: none`，将其从页面上去掉，然后再进行后续操作，这些后续操作也不会触发回流与重绘，这个过程称为离线操作

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

离线操作后

```js
let container = document.getElementById('container')
container.style.display = 'none'
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
...（省略了许多类似的后续操作）
container.style.display = 'block'
```

</details>

## 17. 浏览器如何减少重绘？ {#question-c94ef007-aafe-4b9c-b96b-4f25c8120130}

> 题库原题：[如何避免重绘或者重排？](https://fe.ecool.fun/topic/c94ef007-aafe-4b9c-b96b-4f25c8120130)

### 题目要点

- **批量更新 DOM**、**避免频繁访问布局属性** 和 **使用 `transform` 和 `opacity`** 等方法可以有效减少重绘和重排，提升页面性能。
- **简化选择器** 和 **减少 DOM 元素数量** 有助于提高 CSS 渲染效率。
- **使用现代框架** 和 **CSS 动画** 可以进一步优化渲染性能。

<details>
<summary>参考答案</summary>

## 如何触发重排和重绘
任何改变用来构建渲染树的信息都会导致一次重排或重绘：

- 添加、删除、更新DOM节点
- 通过display: none隐藏一个DOM节点-触发重排和重绘
- 通过visibility: hidden隐藏一个DOM节点-只触发重绘，因为没有几何变化
- 移动或者给页面中的DOM节点添加动画
- 添加一个样式表，调整样式属性
- 用户行为，例如调整窗口大小，改变字号，或者滚动。

## 如何避免重绘或者重排

### 集中改变样式
我们往往通过改变class的方式来集中改变样式
```js
// 判断是否是黑色系样式
const theme = isDark ? 'dark' : 'light';

// 根据判断来设置不同的class
ele.setAttribute('className', theme);
```

### 使用DocumentFragment
我们可以通过createDocumentFragment创建一个游离于DOM树之外的节点，然后在此节点上批量操作，最后插入DOM树中，因此只触发一次重排
```js
var fragment = document.createDocumentFragment();

for (let i = 0;i<10;i++){
  let node = document.createElement("p");
  node.innerHTML = i;
  fragment.appendChild(node);
}

document.body.appendChild(fragment);
```

### 提升为合成层
元素提升为合成层有以下优点：

- 合成层的位图，会交由 GPU 合成，比 CPU 处理要快
- 当需要 repaint 时，只需要 repaint 本身，不会影响到其他的层
- 对于 transform 和 opacity 效果，不会触发 layout 和 paint

提升合成层的最好方式是使用 CSS 的 will-change 属性：
```css
#target {
  will-change: transform;
}
```

</details>

## 18. CDN 缓存失效策略？ {#question-subjective-3c98feb5dd58}

### 题目要点

CDN, 缓存失效, 缓存时间, 版本号, 哈希值, Cache-Control, Expires

<details>
<summary>参考答案</summary>

CDN缓存失效策略包括设置合适的缓存时间、使用版本号或哈希值来区分不同版本的文件、利用HTTP头部的Cache-Control和Expires字段来控制缓存行为等。合理的缓存策略可以确保用户获得最新的内容，同时减少服务器负载。

</details>

## 19. `SameSite=Lax` 在第三方登录场景的漏洞？ {#question-subjective-20092cec090e}

### 题目要点

SameSite, Lax, 第三方登录, CSRF, 安全性, CSP, SRI

<details>
<summary>参考答案</summary>

SameSite=Lax是一种Cookie属性，用于限制跨站请求中的Cookie传输。在第三方登录场景中，如果设置为Lax，可能会导致CSRF攻击的风险增加。因此，需要结合其他安全措施（如CSP、SRI等）来确保安全性。此外，应根据实际需求选择合适的SameSite属性值。

</details>

## 20. 项目中动态表单的设计逻辑是？ {#question-6e229410-c489-4f7f-bcc1-36ffc38d0eb5}

> 题库原题：[如果在项目中需要使用到动态表单，你会怎么实现？](https://fe.ecool.fun/topic/6e229410-c489-4f7f-bcc1-36ffc38d0eb5)

### 题目要点

动态表单的设计核心在于将结构、状态与行为解耦。通过 Schema 描述字段结构，通过集中式 Form Store 管理表单状态，通过依赖或表达式机制实现字段联动，从而构建一个可配置、可扩展、可维护的表单系统。本质是将表单抽象为一个状态驱动的响应式系统，而不是简单的配置渲染。

<details>
<summary>参考答案</summary>

这个问题如果只是回答“根据配置渲染组件”，深度是不够的。

动态表单真正考察的是：**如何把表单从“页面结构”抽象为“可驱动的状态机”**。

动态表单的核心不是 UI 渲染，而是三层解耦：

* 表单结构描述
* 表单状态管理
* 表单行为控制

如果这三层没有拆开，项目后期一定会失控。

---

## 一、第一层：结构抽象 —— Schema 驱动

动态表单通常基于 Schema 描述结构，而不是写死 JSX / template。

一个最基础的 schema 可能是：

```js
{
  name: "username",
  label: "用户名",
  component: "Input",
  props: { placeholder: "请输入用户名" },
  rules: [{ required: true }]
}
```

这个 Schema 本质上是“表单 DSL”。

关键设计点在于：

1. 字段标识必须唯一（通常使用 name 作为路径）
2. 组件类型与具体 UI 框架解耦
3. 校验规则抽象为规则对象
4. 支持嵌套结构（数组、对象）

复杂场景下，Schema 会支持：

* 条件渲染
* 动态枚举数据源
* 表单联动表达式
* 权限控制

---

## 二、第二层：状态管理 —— 数据中心化

动态表单的难点不在渲染，而在状态。

表单至少包含：

* 当前值（values）
* 校验状态（errors）
* 触发状态（touched）
* 可见性（visible）
* 禁用状态（disabled）

如果每个字段自己维护状态，联动逻辑会非常混乱。

正确方式是：

**所有字段状态集中存储在一个 Form Store 中。**

可以类比 Redux / Zustand 的设计思想。

当字段值变化：

1. 更新 Store
2. 触发依赖计算
3. 重新派发状态给相关字段

例如在 React 体系中，可以通过 context + reducer 实现。

成熟方案如：

* Formily
* React Hook Form

本质都在做一件事：构建一个可订阅的表单状态容器。

---

## 三、第三层：行为驱动 —— 联动与副作用

真正复杂的是字段联动。

例如：

* 选择国家后，城市下拉框变化
* 勾选复选框后，显示额外字段
* 金额变化触发计算字段

常见实现方式有三种：

### 1. 命令式联动

直接写监听逻辑：

```js
if (values.type === "company") {
  showField("taxId");
}
```

问题是强耦合，维护成本高。

---

### 2. 声明式表达式驱动

在 schema 中写规则：

```js
{
  visible: "{{ $values.type === 'company' }}"
}
```

然后在渲染时解析表达式。

这种方式更可扩展，但需要表达式解析引擎。

---

### 3. 依赖收集机制

高级方案会建立字段依赖图。

字段 A 依赖字段 B
当 B 更新时，只通知 A 重新计算。

这本质是一个响应式系统。

例如：

* Vue 的依赖收集机制
* MobX 的 observable

如果项目规模较大，建议构建“字段依赖图”，否则复杂联动会退化为大量手写监听。

---

## 四、动态表单的几个关键设计点

### 1. 渲染层必须可替换

Schema 只描述结构，不应绑定具体 UI 库。

否则换组件库时成本巨大。

---

### 2. 支持异步数据源

例如下拉选项来自接口。

必须设计：

* loading 状态
* 请求缓存
* 错误处理

---

### 3. 支持嵌套与数组字段

例如：

* 表单中嵌套子表单
* 动态增删行

这通常需要路径解析能力，例如：

```
user.address.city
users[0].name
```

---

### 4. 性能优化

大型表单常见问题是：

* 全量重渲染
* 每次输入触发整个表单更新

优化思路：

* 字段级订阅
* React.memo
* 局部更新

否则 100+ 字段的表单体验会明显卡顿。

---

## 五、从工程视角总结设计逻辑

一个成熟的动态表单系统通常遵循：

1. Schema 描述结构（配置驱动）
2. 中央 Store 管理状态（状态驱动）
3. 依赖系统驱动联动（响应式驱动）
4. 渲染层与逻辑层解耦（可扩展）

如果缺少其中任意一层，系统复杂度会指数级上升。

</details>

## 21. 讲一下你们的JSON Schema 协议是怎么设计的 {#question-subjective-da6780f91ca2}

### 题目要点

JSON Schema, 数据结构, 验证规则, 默认值, 扩展性, 兼容性, 业务需求

<details>
<summary>参考答案</summary>

JSON Schema协议的设计通常包括定义数据结构、验证规则、默认值等内容。通过JSON Schema，可以明确地描述数据的格式和约束条件，便于前后端的数据交互和验证。设计时需要考虑扩展性和兼容性，确保Schema能够适应不同的业务需求。

</details>

## 22. 拖拽的原理讲一下 {#question-6efa769a-3eb9-44ea-bd7c-01c5c991000f}

> 题库原题：[怎么使用 js 实现拖拽功能？](https://fe.ecool.fun/topic/6efa769a-3eb9-44ea-bd7c-01c5c991000f)

### 题目要点

拖拽的核心原理是通过按下、移动、释放三个阶段的指针事件，基于坐标差值计算元素位移，并通过 transform 更新视觉位置。高频移动需要结合 requestAnimationFrame 进行性能优化，复杂场景涉及边界控制、碰撞检测和状态同步。其本质是连续输入驱动的实时渲染过程，而非浏览器提供的特殊机制。

<details>
<summary>参考答案</summary>

拖拽的本质不是“元素跟着鼠标动”，而是：**通过指针事件驱动位置计算，在连续渲染中不断更新元素的位移**。它是一个典型的“输入 → 计算 → 渲染”循环。

可以从事件流、坐标体系、性能控制三个层面理解。

---

## 一、事件模型：拖拽的基本生命周期

无论是鼠标还是触控，拖拽都遵循三段式流程：

1. 按下（mousedown / pointerdown）
2. 移动（mousemove / pointermove）
3. 释放（mouseup / pointerup）

核心逻辑是：

* 在按下时记录起始坐标
* 在移动时计算偏移量
* 在释放时清理监听

一个最简化的实现思路：

```js
let startX = 0;
let startY = 0;

element.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  startY = e.clientY;

  function onMove(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
});
```

这里有两个关键点：

* move 事件必须绑定在 document 上，避免鼠标移出元素后丢失事件
* 位移是通过差值计算，而不是直接赋值坐标

---

## 二、坐标体系的选择

拖拽涉及多个坐标系：

* clientX / clientY（视口坐标）
* pageX / pageY（包含滚动）
* screenX / screenY（屏幕坐标）
* offsetLeft / offsetTop（相对定位父级）

一般拖拽使用 client 坐标即可。

如果页面存在滚动，需要结合 scrollTop 计算。

---

## 三、为什么通常使用 transform 而不是 left/top

直接修改 left/top 会触发：

* layout（回流）
* paint（重绘）

而 transform 属于：

* 只触发 composite（合成层）

性能更优，尤其在高频 move 事件中。

因此现代拖拽库基本都使用：

```js
transform: translate3d(...)
```

利用 GPU 加速。

---

## 四、性能优化：高频事件处理

mousemove / pointermove 触发频率极高。

如果每次都直接更新 DOM，会导致主线程阻塞。

优化方式包括：

1. 使用 requestAnimationFrame 节流

```js
let ticking = false;

function onMove(e) {
  if (!ticking) {
    requestAnimationFrame(() => {
      updatePosition(e);
      ticking = false;
    });
    ticking = true;
  }
}
```

2. 使用 pointer events 统一处理鼠标与触控

`pointerdown / pointermove / pointerup` 可以避免分别监听 mouse 和 touch。

---

## 五、HTML5 Drag and Drop API

浏览器原生提供了一套拖拽 API：

* dragstart
* dragover
* drop
* dataTransfer

但这套 API 主要用于：

* 文件拖入
* 浏览器内部元素拖拽

缺点：

* 自定义能力弱
* 在移动端支持不好
* 交互可控性有限

因此现代前端工程中，大多数复杂拖拽场景（例如可排序列表、画布编辑器）都采用“自定义拖拽实现”。

---

## 六、复杂拖拽的扩展问题

真实项目中拖拽通常还涉及：

### 1. 边界限制

限制元素只能在容器内移动，需要计算：

* 容器宽高
* 元素宽高
* 最大可移动范围

### 2. 吸附与碰撞检测

例如拖拽排序，需要判断当前位置与其他元素的重叠区域。

通常通过：

* getBoundingClientRect
* 计算中线
* 决定插入位置

### 3. 拖拽与虚拟 DOM 的协调

在 React / Vue 中：

* 频繁 setState 会导致重渲染
* 一般拖拽过程用 ref 直接操作 DOM
* 释放时再同步状态

否则性能会明显下降。

---

## 七、从底层理解拖拽

拖拽本质是：

* 监听连续输入事件
* 通过坐标差计算位移
* 更新视觉表现
* 在释放时完成状态确认

它不是一个特殊能力，而是“连续事件驱动动画”的一种形式。

本质上属于交互式动画的一种实现方式。

</details>

## 23. 大型表单渲染时候的卡顿问题是如何解决的？ {#question-subjective-782237b594f3}

### 题目要点

大型表单卡顿的根因是全量状态驱动全量渲染以及高频同步校验。解决思路是缩小更新粒度，采用字段级订阅模型或非受控组件降低渲染压力，并结合虚拟化与防抖优化联动与校验逻辑。核心原则是让不相关字段不参与更新，从架构层面避免无意义重渲染。

<details>
<summary>参考答案</summary>

大型表单卡顿，本质上不是“字段多”，而是 **更新粒度过粗 + 重渲染范围过大 + 高频校验与计算叠加** 导致主线程阻塞。

如果一个表单有 100～300 个字段，只要设计合理，是可以做到输入流畅的。真正的问题通常出在状态管理模型和渲染策略上。

下面从机制层面拆解。

---

## 一、问题根源：为什么会卡

### 1. 全量状态驱动全量渲染

最常见的错误是：

* 所有字段值存在一个大对象里
* 每次输入 setState 整个 values
* 父组件重渲染
* 所有子字段组件跟着重渲染

这种模式下，输入一个字符，整个表单重新 render。

React 默认是自顶向下渲染，只要父组件更新，子组件就会进入 reconciliation。

---

### 2. 同步校验阻塞主线程

如果每次输入都触发：

* 同步规则校验
* 正则匹配
* 跨字段联动计算
* 异步请求未做防抖

主线程很容易出现 10ms～30ms 的阻塞，叠加后就会明显卡顿。

---

### 3. 不必要的受控组件重渲染

每个输入框都是受控组件：

```js
value={values.name}
onChange={...}
```

如果 value 对象引用变化，组件就会更新。

在大型表单中，这个成本会被放大。

---

## 二、核心优化思想：缩小更新范围

真正的优化方向不是“让 React 更快”，而是：

> 让不相关的字段根本不参与更新。

---

## 三、解决方案一：字段级订阅模型

不要让整个表单依赖同一个状态对象。

更优解是建立一个“表单状态中心”，然后：

* 每个字段只订阅自己那一块数据
* 值变化时，只通知相关字段

这种模型类似于：

* Redux 的 selector
* Zustand 的局部订阅
* MobX 的依赖收集

成熟方案例如：

* React Hook Form 使用 uncontrolled + ref 收集值
* Formily 使用响应式依赖收集

核心都是：字段级更新，而不是表单级更新。

---

## 四、解决方案二：减少受控渲染压力

在极端大表单中，可以采用：

* 默认使用非受控组件
* 在 blur 或 submit 时同步状态

例如：

```js
<input defaultValue="xxx" ref={inputRef} />
```

这样输入时不会触发 React 渲染。

这种方式在性能敏感场景非常有效。

---

## 五、解决方案三：虚拟化渲染

如果表单非常长，例如 200+ 字段滚动页面，可以考虑：

* 只渲染可视区域字段
* 滚动时动态挂载卸载

类似列表虚拟化（windowing）的思想。

可以结合 IntersectionObserver 或滚动监听实现。

适用于审批系统、配置后台等超长表单。

---

## 六、解决方案四：拆分表单结构

不要把所有字段放在同一个组件层级。

可以：

* 按模块拆分子表单
* 使用 React.memo
* 使用 useCallback 保持 handler 稳定

但要注意：

React.memo 只能避免 props 未变化时的渲染，无法解决状态模型问题。

---

## 七、解决方案五：校验与联动优化

1. 校验做防抖
2. 跨字段联动建立依赖图
3. 异步校验取消过期请求
4. 避免在 render 中做计算

否则输入体验会明显下降。

---

## 八、工程实践中的推荐组合

对于中大型项目：

* 构建表单状态中心
* 字段级订阅更新
* 复杂校验使用防抖
* 使用 transform 或局部 DOM 更新避免频繁重排
* 长表单结合虚拟化

真正的瓶颈几乎从来不是“字段数量”，而是“更新粒度错误”。

</details>

## 24. 实现 Promise.allSettled {#question-13146206-837d-4eb6-9d47-c7152c4dae46}

> 题库原题：[手写实现 Promise.allSettled](https://fe.ecool.fun/topic/13146206-837d-4eb6-9d47-c7152c4dae46)

### 题目要点

手写实现 `Promise.allSettled` 方法，涉及创建一个新的 `Promise` 对象，该对象在所有输入的 `Promise` 对象都完成（无论成功还是失败）时解决，并返回每个 `Promise` 对象的状态和结果。

<details>
<summary>参考答案</summary>

手写实现 `Promise.allSettled` 方法，涉及创建一个新的 `Promise` 对象，该对象在所有输入的 `Promise` 对象都完成（无论成功还是失败）时解决，并返回每个 `Promise` 对象的状态和结果。

### **实现步骤**

1. **接收输入**：接受一个 `Promise` 对象的可迭代对象（通常是数组）。
2. **初始化**：创建一个新的 `Promise` 对象，用于最终的结果。
3. **处理每个 `Promise`**：遍历输入的 `Promise` 对象，处理每个 `Promise` 的状态（成功或失败）。
4. **收集结果**：将每个 `Promise` 对象的状态和结果收集到一个数组中。
5. **完成处理**：在所有 `Promise` 对象都完成后，返回结果数组。

### **实现代码**

```javascript
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    // 结果数组
    const results = [];
    let completedCount = 0;

    // 遍历每个 Promise
    promises.forEach((promise, index) => {
      // 确保 promise 是一个 Promise 对象
      Promise.resolve(promise).then(
        (value) => {
          results[index] = { status: 'fulfilled', value };
        },
        (reason) => {
          results[index] = { status: 'rejected', reason };
        }
      ).finally(() => {
        // 记录已完成的 Promise 数量
        completedCount++;
        // 如果所有 Promise 都完成了
        if (completedCount === promises.length) {
          resolve(results);
        }
      });
    });
  });
}

// 示例用法
const p1 = Promise.resolve(1);
const p2 = Promise.reject(new Error('Failed'));
const p3 = new Promise((resolve) => setTimeout(resolve, 100, 3));

promiseAllSettled([p1, p2, p3]).then(results => {
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

### **说明**

1. **接收和处理**：
   - 使用 `Promise.resolve(promise)` 确保每个输入都是 `Promise` 对象，方便处理非 `Promise` 对象。
   - 在每个 `Promise` 成功时，将 `{ status: 'fulfilled', value }` 记录到结果数组中。
   - 在每个 `Promise` 失败时，将 `{ status: 'rejected', reason }` 记录到结果数组中。

2. **最终处理**：
   - 使用 `finally()` 方法确保无论 `Promise` 成功还是失败，最终都能够执行并检查是否所有 `Promise` 对象都完成。
   - 当所有 `Promise` 对象都完成时，调用 `resolve(results)` 传递结果数组。

这种实现方法确保了处理所有 `Promise` 对象，无论它们的结果如何，并在所有 `Promise` 完成后提供最终结果。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-94/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-157/index.md" >}}) →
