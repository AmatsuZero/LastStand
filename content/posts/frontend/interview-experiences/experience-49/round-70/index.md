+++
title = "腾讯-音乐 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/49"
experienceId = 49
roundId = 70
roundOrder = 1
company = "腾讯"
date = "2025-07-25T07:17:59.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-49/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-49/round-71/index.md" >}}) →

**本轮要点：** 动画、响应式设计、事件循环、跨域、浏览器的缓存机制、列表和key、生命周期

本轮共 16 道题。答案默认折叠，便于先自行作答。

## 1. 请介绍一下你的科研项目经历。 {#question-subjective-e6ed37c33d4d}

### 题目要点

STAR法则

<details>
<summary>参考答案</summary>

结合自身经历展开

</details>

## 2. 为什么选择前端开发作为你的职业方向？ {#question-subjective-d857524704a9}

### 题目要点

无

<details>
<summary>参考答案</summary>

无

</details>

## 3. 你学习前端开发有多久了？谈谈你的学习经历。 {#question-subjective-4c8c7e9b248f}

### 题目要点

无

<details>
<summary>参考答案</summary>

无

</details>

## 4. 如何使用CSS实现动画效果？举个项目中的例子。 {#question-subjective-5be066a0fa02}

### 题目要点

transition/animation 区别 / transform+opacity / 项目落地举例 / 动画性能

<details>
<summary>参考答案</summary>

### 考察点

#### ● CSS 动画相关属性与原理掌握
面试官希望了解候选人是否掌握 CSS 动画的基本实现方式，包括 `transition`、`animation`、关键帧、补间函数等。

#### ● 能结合项目场景举例说明
不仅要懂 API，更重要的是知道什么时候使用、为什么使用，是否有性能考量和交互体验意识。

#### ● 对动画效果的性能与体验理解
是否清楚哪些动画对性能影响大，哪些动画适合用 CSS 实现，如何避免卡顿或丢帧。

---

### 参考答案

#### 原理说明

##### 一、CSS 动画的实现方式

CSS 提供了两类动画机制：

###### 1. 过渡动画（transition）

通过 `transition` 属性定义在样式变更时自动补间的动画：

```css
.button {
  transition: all 0.3s ease-in-out;
}
````

特点：

* 只能在**属性值变更**时触发；
* 常用于交互动画，如 hover、active、打开/收起等；
* 无法控制重复、关键帧，只支持一次性补间。

###### 2. 关键帧动画（@keyframes + animation）

定义动画过程中的多个关键帧：

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.box {
  animation: fadeIn 0.5s ease-in-out forwards;
}
```

特点：

* 支持控制动画过程、重复次数、延迟等；
* 可定义复杂路径、循环、暂停等；
* 动画启动无需依赖事件，可自动播放。

---

#### 项目中实际应用举例

##### 场景：弹窗渐显动效

在项目中，我们有一个弹窗组件 `Modal.vue`，当用户点击按钮时，弹窗从透明到可见并从下方浮现。

###### HTML结构（Vue中示意）：

```html
<transition name="fade-slide">
  <div class="modal" v-if="visible">
    弹窗内容
  </div>
</transition>
```

###### CSS 动画定义：

```css
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
```

###### 效果说明：

* 利用 Vue 的 `transition` 配合 CSS 过渡；
* 当 `visible = true`，modal 渐显并向上浮现；
* 视觉体验顺滑、实现简单、性能优秀。

---

#### 常见误区或面试陷阱

##### 误区一：动画都写在 JavaScript 中更好控制

* 实际上，**CSS 动画执行在合成线程**，性能优于 JS；
* 简单的动效（如透明度、位移）用 CSS 足够，且更流畅。

##### 误区二：频繁操作 `width/height` 实现动画

* `width/height` 涉及重排（reflow），比 `transform`、`opacity` 成本高；
* 推荐使用 GPU 加速属性：`transform`、`opacity` 实现高性能动画。

##### 误区三：动画默认无限循环

* 未设置 `animation-iteration-count` 会默认执行一次；
* 需显式声明循环次数或 `infinite` 才能循环播放。

---

### 总结回顾

CSS 提供两种动画方式：

* `transition` 适用于状态切换时的补间动画；
* `animation` + `@keyframes` 适用于复杂、多阶段动画。

项目中常见的 CSS 动画使用场景包括：

* 弹窗 / Toast / 抽屉出入场；
* 骨架屏、加载动画；
* Hover / 点击交互提示；
* 页面过渡、滑动等。

</details>

## 5. 浏览器的缓存机制有哪些？请比较Cookie、Local Storage和Session Storage的区别和使用场景。 {#question-subjective-9b257e5865a8}

### 题目要点

缓存分类 / Cookie 与 Storage 区别 / 生命周期 / 使用场景

<details>
<summary>参考答案</summary>

### 考察点

#### ● 浏览器缓存体系认知是否全面
面试官希望了解候选人是否具备从“网络层缓存 + 存储层缓存”两个维度理解缓存机制的能力。

#### ● 本地存储三种机制的掌握情况
是否能准确区分 Cookie、Local Storage、Session Storage 的特性、限制和应用场景。

#### ● 是否具备合理选型能力
面试官希望候选人在项目中能根据业务需求选择合适的本地存储方案，并规避安全或性能风险。

---

### 参考答案

#### 原理说明

##### 一、浏览器缓存机制概览

浏览器缓存体系主要分为两大类：

###### 1. 网络层缓存（HTTP 缓存）

- **强缓存（强制使用本地缓存）**
  - 响应头 `Cache-Control`、`Expires`
  - 浏览器判断未过期 → 不发请求，直接用本地缓存
- **协商缓存（与服务器确认后使用缓存）**
  - 响应头 `ETag` / `Last-Modified`
  - 浏览器发请求时带上 `If-None-Match` / `If-Modified-Since`
  - 若资源未变，服务端返回 304 → 浏览器使用缓存

###### 2. 本地存储（Web Storage & Cookie）

- Cookie
- Local Storage
- Session Storage
- IndexedDB（大型结构化数据，不在本题范围）

---

#### Cookie、Local Storage 和 Session Storage 对比

| 特性             | Cookie                            | Local Storage                  | Session Storage                |
|------------------|-----------------------------------|--------------------------------|--------------------------------|
| 存储大小限制     | ~4KB                              | ~5MB                           | ~5MB                           |
| 生命周期         | 可设置过期时间；默认浏览器关闭失效 | 永久保存，除非手动清除         | 浏览器窗口关闭即失效           |
| 作用范围         | 跨标签页、跨窗口、可跨请求        | 跨标签页、跨窗口，但同源限制   | 同标签页 & 同窗口 & 同源       |
| 是否自动携带     | ✅ 请求头自动携带到服务端         | ❌ 不会自动携带                 | ❌ 不会自动携带                 |
| 安全性           | 存在被劫持、伪造等风险            | 相对安全，仅前端可访问         | 相对安全，仅前端可访问         |
| 适合存储         | 登录态、会话标识、用户标识        | 用户偏好、缓存数据、持久令牌   | 页面状态、短期临时数据         |

---

#### 使用场景分析

##### Cookie

- **特点**：小体积、自动随请求发送到服务器；
- **使用场景**：
  - 登录认证凭证（如 session_id）；
  - 跨请求记录用户状态；
  - 后端需要读取的字段。

- **注意**：
  - 不适合存储大量数据；
  - 易被攻击（XSS + CSRF），需配合 `HttpOnly + Secure + SameSite` 增强安全。

##### Local Storage

- **特点**：容量较大、数据持久、仅客户端可访问；
- **使用场景**：
  - 用户主题、语言偏好；
  - 页面缓存数据；
  - 保存 JWT 等长效令牌（但需注意安全性）；
  - SPA 中模拟状态持久化。

- **注意**：
  - 不能跨源访问；
  - 不适合存储敏感信息（可被 JS 访问）；
  - 不会被服务端读取。

##### Session Storage

- **特点**：生命周期短，标签页级别隔离；
- **使用场景**：
  - 单次页面会话的中间状态；
  - 表单暂存（用户填写表单刷新后保留）；
  - 多标签页数据隔离场景（如表单向导、多步操作）。

- **注意**：
  - 页面刷新不清除，但关闭标签页即清除；
  - 无法在新开窗口或标签页共享数据。

---

#### 常见误区或面试陷阱

##### 误区一：Local Storage 更安全，可以存储敏感信息

- 实际上，Local Storage 可被 JS 任意访问，一旦存在 XSS 漏洞，攻击者可窃取内容；
- 敏感数据推荐存储在 Cookie + `HttpOnly`。

##### 误区二：Session Storage 和 Cookie 生命周期一样

- Cookie 默认在关闭浏览器时过期，但可设置持久化；
- Session Storage 在关闭**当前标签页**后立即销毁，两者生命周期不同。

##### 误区三：本地存储都能跨域共享

- 实际上，Cookie、Local/Session Storage 均受同源策略约束（协议+域名+端口）；
- Cookie 可通过设置 `domain` 实现子域共享，Storage 不支持跨域访问。

---

### 总结回顾

浏览器缓存体系分为：

- **网络层缓存**：HTTP 缓存头控制资源加载（提升性能）；
- **本地数据缓存**：三种主要机制分别适用于不同业务需求。

三者核心对比总结如下：

- Cookie：可用于后端通信，适合身份认证；
- Local Storage：适合持久化配置、缓存数据；
- Session Storage：适合临时状态、表单暂存。

</details>

## 6. 你对前端开发的哪个方向比较感兴趣？为什么？ {#question-subjective-b03c1dc6f0e8}

### 题目要点

结合自身经历展开

<details>
<summary>参考答案</summary>

结合自身经历展开

</details>

## 7. 请解释什么是JavaScript的Polyfill，并举例说明如何实现一个Polyfill {#question-subjective-1c0f777e4a76}

### 题目要点

Polyfill 概念 / 与 Transpile 区别 / 使用场景 / 手动实现示例 / 实现原理

<details>
<summary>参考答案</summary>

### 考察点

#### ● 对 Polyfill 概念的准确理解
面试官希望了解候选人是否真正理解什么是 Polyfill，它与 Transpile、Shim 有何区别。

#### ● 掌握 Polyfill 的应用场景
是否知道 Polyfill 通常用来解决浏览器兼容问题，在哪些项目阶段用得上。

#### ● 具备实现 Polyfill 的能力
能否编写简单的 Polyfill 实现，体现对 JavaScript 原生方法的理解。

---

### 参考答案

#### 原理说明

##### 什么是 Polyfill？

**Polyfill（垫片）** 是一段代码（通常是 JavaScript），用于在**老旧或不支持某些标准功能的浏览器中“模拟”这些新特性**。

换句话说，Polyfill 是在浏览器原生不支持某 API 的情况下，通过其他手段“补上这个功能”。

例如：`Array.prototype.includes` 在 IE 中不支持，可以使用 Polyfill 模拟实现。

##### Polyfill 与其他术语的区别：

- **Transpile**：如 Babel，把 ES6+ 转换为 ES5；
- **Polyfill**：运行时填补“缺失能力”的实现；
- **Shim**：类似 Polyfill，但有时用于“修复已存在但不符合规范”的方法实现。

---

#### 使用场景与重要性

- **浏览器兼容处理**：IE、旧版 Android 浏览器不支持部分现代 API（如 Promise、fetch、classList）；
- **渐进增强策略**：提供“能力补充”，不破坏原有功能；
- **低成本适配**：相比全面降级，更灵活、成本低。

---

#### Polyfill 实现示例

##### 示例：实现 `Array.prototype.includes` 的 Polyfill

原生方法作用：判断一个数组是否包含某个元素。

###### 原生使用方式：

```js
[1, 2, 3].includes(2); // true
````

###### Polyfill 实现：

```js
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement, fromIndex) {
    const len = this.length >>> 0;
    let i = fromIndex || 0;

    if (len === 0) return false;
    if (i < 0) i = Math.max(len + i, 0);

    while (i < len) {
      // 处理 NaN 的情况
      if (this[i] === searchElement || (Number.isNaN(this[i]) && Number.isNaN(searchElement))) {
        return true;
      }
      i++;
    }

    return false;
  };
}
```

###### 实现说明：

* 使用 `this.length >>> 0` 强制转换为无符号整数；
* 支持 `fromIndex` 参数（支持负值）；
* 兼容 `NaN` 的判断；
* 在原生方法不存在时才定义（防止覆盖）。

---

#### 常见误区与面试陷阱

##### 误区一：Polyfill 是 Babel 自动加的

* Babel 只是“语法转换”，不处理运行时功能；
* Babel 可配合 `@babel/preset-env + core-js` 实现自动引入 Polyfill，但它们是两个步骤。

##### 误区二：Polyfill 可以替代一切兼容问题

* Polyfill 仅针对“可模拟”的 API；
* 无法模拟浏览器行为（如 CSS 特性、DOM API 安全限制等）。

##### 误区三：任何时候都应该手动写 Polyfill

* 实际开发中，通常使用 `core-js`、`polyfill.io` 等统一方案管理；
* 手动写 Polyfill 适合理解原理或对特定 API 做兼容适配。

---

### 总结回顾

Polyfill 是前端开发中解决兼容性问题的重要工具。通过对不支持的 API 进行模拟，使现代语法或功能在老旧浏览器中也能运行。

</details>

## 8. 说说你对事件循环的理解 {#question-b1b488cb-0f79-4d12-bdab-4c070e0da072}

> 题库原题：[说说你对事件循环的理解](https://fe.ecool.fun/topic/b1b488cb-0f79-4d12-bdab-4c070e0da072)

### 题目要点

JavaScript本身是单线程，也就是同一时刻只能干一件事，JS任务包含了同步任务和异步任务，遇到执行函数会将其放入调用栈(先进后出)中，遇到setTimeout/setInterval等异步任务时，会把它放入到消息队列中，等主线程的任务执行完成以后，再回过头执行消息队列中的异步任务，如果异步任务中仍然有异步任务，会继续放入消息队列，以此类推，便形成了一个事件循环。

**异步任务：**

- setTimeout
- setInterval

异步任务又分为宏任务和微任务，promise就属于微任务.

<details>
<summary>参考答案</summary>

## 一、是什么
`JavaScript` 在设计之初便是单线程，即指程序运行时，只有一个线程存在，同一时间只能做一件事

为什么要这么设计，跟`JavaScript`的应用场景有关

`JavaScript` 初期作为一门浏览器脚本语言，通常用于操作 `DOM` ，如果是多线程，一个线程进行了删除 `DOM` ，另一个添加 `DOM`，此时浏览器该如何处理？

为了解决单线程运行阻塞问题，`JavaScript`用到了计算机系统的一种运行机制，这种机制就叫做事件循环（Event Loop）

#### 事件循环（Event Loop）

在`JavaScript`中，所有的任务都可以分为

- 同步任务：立即执行的任务，同步任务一般会直接进入到主线程中执行

- 异步任务：异步执行的任务，比如`ajax`网络请求，`setTimeout `定时函数等

同步任务与异步任务的运行流程图如下：

 ![](https://static.ecool.fun//article/85f7d058-08ee-4bb7-af03-610411a08581.png)

从上面我们可以看到，同步任务进入主线程，即主执行栈，异步任务进入任务队列，主线程内的任务执行完毕为空，会去任务队列读取对应的任务，推入主线程执行。上述过程的不断重复就是事件循环

## 二、宏任务与微任务

如果将任务划分为同步任务和异步任务并不是那么的准确，举个例子：

```js
console.log(1)

setTimeout(()=>{
    console.log(2)
}, 0)

new Promise((resolve, reject)=>{
    console.log('new Promise')
    resolve()
}).then(()=>{
    console.log('then')
})

console.log(3)
```

如果按照上面流程图来分析代码，我们会得到下面的执行步骤：

- `console.log(1) `，同步任务，主线程中执行
- `setTimeout()` ，异步任务，放到 `Event Table`，0 毫秒后`console.log(2) `回调推入 `Event Queue` 中
- `new Promise` ，同步任务，主线程直接执行
- `.then` ，异步任务，放到 `Event Table`
- `console.log(3)`，同步任务，主线程执行

所以按照分析，它的结果应该是 `1` => `'new Promise'` => `3` => `2` => `'then'`

但是实际结果是：`1`=>`'new Promise'`=> `3` => `'then'` => `2`

出现分歧的原因在于异步任务执行顺序，事件队列其实是一个“先进先出”的数据结构，排在前面的事件会优先被主线程读取

例子中 `setTimeout`回调事件是先进入队列中的，按理说应该先于 `.then` 中的执行，但是结果却偏偏相反

原因在于异步任务还可以细分为微任务与宏任务

### 微任务

一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前

常见的微任务有：

- Promise.then

- MutaionObserver

- Object.observe（已废弃；Proxy 对象替代）

- process.nextTick（Node.js）

### 宏任务

宏任务的时间粒度比较大，执行的时间间隔是不能精确控制的，对一些高实时性的需求就不太符合

常见的宏任务有：

- script (可以理解为外层同步代码)
- setTimeout/setInterval
- UI rendering/UI事件
- postMessage、MessageChannel
- setImmediate、I/O（Node.js）

这时候，事件循环，宏任务，微任务的关系如图所示

 ![](https://static.ecool.fun//article/698f38dc-0399-4a3b-b38a-126c9f5c221e.png)

按照这个流程，它的执行机制是：

- 执行一个宏任务，如果遇到微任务就将它放到微任务的事件队列中
- 当前宏任务执行完成后，会查看微任务的事件队列，然后将里面的所有微任务依次执行完

回到上面的题目

```js
console.log(1)
setTimeout(()=>{
    console.log(2)
}, 0)
new Promise((resolve, reject)=>{
    console.log('new Promise')
    resolve()
}).then(()=>{
    console.log('then')
})
console.log(3)
```

流程如下

```js
// 遇到 console.log(1) ，直接打印 1
// 遇到定时器，属于新的宏任务，留着后面执行
// 遇到 new Promise，这个是直接执行的，打印 'new Promise'
// .then 属于微任务，放入微任务队列，后面再执行
// 遇到 console.log(3) 直接打印 3
// 好了本轮宏任务执行完毕，现在去微任务列表查看是否有微任务，发现 .then 的回调，执行它，打印 'then'
// 当一次宏任务执行完，再去执行新的宏任务，这里就剩一个定时器的宏任务了，执行它，打印 2
```

## 三、async与await

`async` 是异步的意思，`await `则可以理解为等待

放到一起可以理解` async `就是用来声明一个异步方法，而 `await `是用来等待异步方法执行

### async

`async`函数返回一个`promise`对象，下面两种方法是等效的

```js
function f() {
    return Promise.resolve('TEST');
}

// asyncF is equivalent to f!
async function asyncF() {
    return 'TEST';
}
```

### await

正常情况下，`await`命令后面是一个 `Promise `对象，返回该对象的结果。如果不是 `Promise `对象，就直接返回对应的值

```js
async function f(){
    // 等同于
    // return 123
    return await 123
}
f().then(v => console.log(v)) // 123
```

不管`await`后面跟着的是什么，`await`都会阻塞后面的代码

```js
async function fn1 (){
    console.log(1)
    await fn2()
    console.log(2) // 阻塞
}

async function fn2 (){
    console.log('fn2')
}

fn1()
console.log(3)
```

上面的例子中，`await` 会阻塞下面的代码（即加入微任务队列），先执行 `async `外面的同步代码，同步代码执行完，再回到 `async` 函数中，再执行之前阻塞的代码

所以上述输出结果为：`1`，`fn2`，`3`，`2`

## 四、流程分析

通过对上面的了解，我们对`JavaScript`对各种场景的执行顺序有了大致的了解

这里直接上代码：

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
    console.log('settimeout')
})
async1()
new Promise(function (resolve) {
    console.log('promise1')
    resolve()
}).then(function () {
    console.log('promise2')
})
console.log('script end')
```

分析过程：

1. 执行整段代码，遇到 `console.log('script start')` 直接打印结果，输出 `script start`
2. 遇到定时器了，它是宏任务，先放着不执行
3. 遇到 `async1()`，执行 `async1` 函数，先打印 `async1 start`，下面遇到` await `怎么办？先执行 `async2`，打印 `async2`，然后阻塞下面代码（即加入微任务列表），跳出去执行同步代码
4. 跳到 `new Promise` 这里，直接执行，打印 `promise1`，下面遇到 `.then()`，它是微任务，放到微任务列表等待执行
5. 最后一行直接打印 `script end`，现在同步代码执行完了，开始执行微任务，即 `await `下面的代码，打印 `async1 end`
6. 继续执行下一个微任务，即执行 `then` 的回调，打印 `promise2`
7. 上一个宏任务所有事都做完了，开始下一个宏任务，就是定时器，打印 `settimeout`

所以最后的结果是：`script start`、`async1 start`、`async2`、`promise1`、`script end`、`async1 end`、`promise2`、`settimeout`

</details>

## 9. 简单描述从输入网址到页面显示的过程 {#question-5def10e9-7825-4bd4-a76e-6d7eb555a2ce}

> 题库原题：[简单描述从输入网址到页面显示的过程](https://fe.ecool.fun/topic/5def10e9-7825-4bd4-a76e-6d7eb555a2ce)

### 题目要点

当输入URL到页面加载完成，发生了以下几个关键过程：

1. **DNS解析**：浏览器将URL解析为对应的IP地址。这个过程涉及多级DNS服务器，从本地缓存开始，如果没有找到，则递归查询根域名服务器、顶级域名服务器，直到找到目标服务器的IP地址。
2. **TCP连接**：浏览器通过三次握手与服务器建立TCP连接。一旦连接建立，浏览器可以发送HTTP请求。
3. **HTTP请求**：浏览器构建HTTP请求报文，通过TCP连接发送到服务器。请求报文包含请求行、请求头和请求正文。
4. **服务器处理请求**：服务器接收HTTP请求，解析请求内容，执行相应的处理（如数据库查询、文件读取等），并构建HTTP响应报文。
5. **HTTP响应**：服务器将响应报文通过TCP连接发送回浏览器。响应报文包含状态码、响应头和响应正文。
6. **浏览器解析渲染**：浏览器接收到HTTP响应后，解析HTML文档构建DOM树，解析CSS构建CSSOM树，合并两者形成渲染树，然后开始渲染页面。
7. **连接结束**：当浏览器完成页面渲染或收到服务器关闭连接的信号时，浏览器会发送TCP连接关闭的信号，服务器收到后，双方断开连接。

<details>
<summary>参考答案</summary>

很多大公司面试喜欢问这样一道面试题，输入URL到看见页面发生了什么？

简单来说，共有以下几个过程：

* DNS解析
* 发起TCP连接
* 发送HTTP请求
* 服务器处理请求并返回HTTP报文
* 浏览器解析渲染页面
* 连接结束

下面我们来看看具体的细节。

## DNS解析

DNS解析实际上就是寻找你所需要的资源的过程。假设你输入`www.baidu.com`，而这个网址并不是百度的真实地址，互联网中每一台机器都有唯一标识的IP地址，这个才是关键，但是它不好记，乱七八糟一串数字谁记得住啊，所以就需要一个网址和IP地址的转换，也就是DNS解析。

DNS解析其实是一个递归的过程。

输入`www.google.com`网址后，首先在本地的域名服务器中查找，没找到去根域名服务器查找，没有再去com顶级域名服务器查找，，如此的类推下去，直到找到IP地址，然后把它记录在本地，供下次使用。大致过程就是.-> .com ->google.com. -> www.google.com.。 (最后这个.对应的就是根域名服务器，默认情况下所有的网址的最后一位都是.，为了方便用户，通常都会省略，浏览器在请求DNS的时候会自动加上)

### DNS优化

既然已经懂得了解析的具体过程，我们可以看到上述一共经过了N个过程，每个过程有一定的消耗和时间的等待，因此我们得想办法解决一下这个问题！

* DNS缓存

DNS存在着多级缓存，从离浏览器的距离排序的话，有以下几种: 浏览器缓存，系统缓存，路由器缓存，ISP服务器缓存，根域名服务器缓存，顶级域名服务器缓存，主域名服务器缓存。

* DNS负载均衡

比如访问baidu.com的时候，每次响应的并非是同一个服务器（IP地址不同），一般大公司都有成百上千台服务器来支撑访问。DNS可以返回一个合适的机器的IP给用户，例如可以根据每台机器的负载量，该机器离用户地理位置的距离等等，这种过程就是DNS负载均衡。

## 发起TCP连接

TCP提供一种可靠的传输，这个过程涉及到三次握手，四次挥手。

### 三次握手

![三次握手示意图](https://static.ecool.fun//article/f3f07532-8a7f-48f8-8f9e-d68ac149f9a2.png)

* 第一次握手：

客户端发送syn包(Seq=x)到服务器，并进入SYN_SEND状态，等待服务器确认；

* 第二次握手：

服务器收到syn包，必须确认客户的SYN（ack=x+1），同时自己也发送一个SYN包（Seq=y），即SYN+ACK包，此时服务器进入SYN_RECV状态；

* 第三次握手：

客户端收到服务器的SYN＋ACK包，向服务器发送确认包ACK(ack=y+1)，此包发送完毕，客户端和服务器进入ESTABLISHED状态，完成三次握手。

握手过程中传送的包里不包含数据，三次握手完毕后，客户端与服务器才正式开始传送数据。理想状态下，TCP连接一旦建立，在通信双方中的任何一方主动关闭连接之前，TCP 连接都将被一直保持下去。

### 四次挥手

数据传输完毕后，双方都可释放连接。最开始的时候，客户端和服务器都是处于ESTABLISHED状态，假设客户端主动关闭，服务器被动关闭。

![四次挥手示意图](https://static.ecool.fun//article/dbf0912c-a6df-48d0-8981-7224eae4492f.png)

* 第一次挥手：

客户端发送一个FIN，用来关闭客户端到服务器的数据传送，也就是客户端告诉服务器：我已经不 会再给你发数据了(当然，在fin包之前发送出去的数据，如果没有收到对应的ack确认报文，客户端依然会重发这些数据)，但是，此时客户端还可以接受数据。

FIN=1，其序列号为seq=u（等于前面已经传送过来的数据的最后一个字节的序号加1），此时，客户端进入FIN-WAIT-1（终止等待1）状态。 TCP规定，FIN报文段即使不携带数据，也要消耗一个序号。

* 第二次挥手：

服务器收到FIN包后，发送一个ACK给对方并且带上自己的序列号seq，确认序号为收到序号+1（与SYN相同，一个FIN占用一个序号）。此时，服务端就进入了CLOSE-WAIT（关闭等待）状态。TCP服务器通知高层的应用进程，客户端向服务器的方向就释放了，这时候处于半关闭状态，即客户端已经没有数据要发送了，但是服务器若发送数据，客户端依然要接受。这个状态还要持续一段时间，也就是整个CLOSE-WAIT状态持续的时间。

此时，客户端就进入FIN-WAIT-2（终止等待2）状态，等待服务器发送连接释放报文（在这之前还需要接受服务器发送的最后的数据）。

* 第三次挥手：

服务器发送一个FIN，用来关闭服务器到客户端的数据传送，也就是告诉客户端，我的数据也发送完了，不会再给你发数据了。由于在半关闭状态，服务器很可能又发送了一些数据，假定此时的序列号为seq=w，此时，服务器就进入了LAST-ACK（最后确认）状态，等待客户端的确认。

* 第四次挥手：

主动关闭方收到FIN后，发送一个ACK给被动关闭方，确认序号为收到序号+1，此时，客户端就进入了TIME-WAIT（时间等待）状态。注意此时TCP连接还没有释放，必须经过2∗MSL（最长报文段寿命）的时间后，当客户端撤销相应的TCB后，才进入CLOSED状态。

服务器只要收到了客户端发出的确认，立即进入CLOSED状态。同样，撤销TCB后，就结束了这次的TCP连接。可以看到，服务器结束TCP连接的时间要比客户端早一些。

至此，完成四次挥手。

## 发送HTTP请求

发送HTTP请求，就是构建HTTP请求报文，并通过TCP协议，发送到服务器指定端口。

请求报文由`请求行`，`请求报头`，`请求正文`组成。

## 服务器处理请求并返回HTTP报文

对TCP连接进行处理，对HTTP协议进行解析，并按照报文格式进一步封装成HTTP Request对象，供上层使用。这一部分工作一般是由Web服务器去进行，比如Tomcat, Nginx和Apache等Web服务器。

HTTP报文也分成三段：`状态码`，`响应报头`和`响应报文`。

## 浏览器解析渲染页面

![渲染页面的过程](https://static.ecool.fun//article/d2f90949-ca68-4f27-aeea-aa10ac6ac664.png)

这个图就是Webkit解析渲染页面的过程。

* 解析HTML形成DOM树
* 解析CSS形成CSSOM 树
* 合并DOM树和CSSOM树形成渲染树
* 浏览器开始渲染并绘制页面

</details>

## 10. 如何判断JavaScript中的数据类型？请列举至少三种方法 {#question-subjective-ba75f6c683cc}

### 题目要点

列出三种方式 / 明确优缺点 / 举例说明 / 强调误区避免

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 JavaScript 中类型判断的多种方式
面试官希望候选人不仅能列出基础方法（如 typeof），还需理解其适用范围与局限。

#### ● 理解复杂类型（如 Array、null、Function）的判断方式
是否清楚 `typeof null === 'object'` 这种历史遗留问题的成因，以及如何正确判断复杂结构类型。

#### ● 类型判断在项目中的实际使用能力
是否能根据不同场景选择合适的判断方式，提升代码鲁棒性。

---

### 参考答案

#### 原理说明

JavaScript 是一门**弱类型动态语言**，变量可以在运行时动态变化类型，因此**准确判断数据类型**对代码健壮性尤为关键。

常见的数据类型分为两类：

- **基本类型（Primitive）**：`string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint`
- **引用类型（Reference）**：`object`、`array`、`function`、`date`、`regexp`、`error` 等

---

#### 常用判断方法

##### 1. `typeof` —— 判断基本类型

```js
typeof 'hello'       // 'string'
typeof 123           // 'number'
typeof undefined     // 'undefined'
typeof true          // 'boolean'
typeof Symbol()      // 'symbol'
typeof function(){}  // 'function'
````

###### 优点：

* 简单直观；
* 适合判断基本类型。

###### 缺点：

* 无法区分 `null` 和 `object`（`typeof null === 'object'`）；
* 无法判断数组、正则、日期等具体引用类型。

---

##### 2. `Object.prototype.toString.call()` —— 最精确的通用方式

```js
Object.prototype.toString.call([]);         // "[object Array]"
Object.prototype.toString.call(null);       // "[object Null]"
Object.prototype.toString.call({});         // "[object Object]"
Object.prototype.toString.call(/abc/);      // "[object RegExp]"
Object.prototype.toString.call(new Date()); // "[object Date]"
```

###### 用法封装示例：

```js
function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

getType([]);        // "Array"
getType(null);      // "Null"
getType(new Map()); // "Map"
```

###### 优点：

* 准确判断所有内置类型；
* 不受原型链或构造函数污染影响；
* 常用于类库内部类型判断。

###### 缺点：

* 相对繁琐，不适合频繁使用场景。

---

##### 3. `instanceof` —— 判断引用类型的原型链归属

```js
[] instanceof Array          // true
new Date() instanceof Date   // true
(function(){}) instanceof Function // true
{} instanceof Object         // true
```

###### 原理：

判断一个对象的原型链中是否包含目标构造函数的 `prototype`。

###### 优点：

* 可判断自定义构造函数实例；
* 语义清晰，常用于 class 类型判断。

###### 缺点：

* 无法判断基本类型；
* 不适用于跨 iframe/window 场景（不同全局对象构造的 Array 等不相等）；
* 原型被改写后失效。

---

#### 补充方法（了解即可）

##### 4. `constructor`

```js
'abc'.constructor === String        // true
true.constructor === Boolean       // true
[].constructor === Array           // true
({}).constructor === Object        // true
```

###### 缺点：

* 可被伪造/修改；
* `null` 和 `undefined` 没有 `constructor`；
* 不推荐在安全性要求高的场合使用。

---

#### 常见误区或面试陷阱

##### 误区一：`typeof null === 'null'`

错误，`typeof null === 'object'` 是历史遗留 bug，不能用 `typeof` 判断 null。

##### 误区二：以为 `typeof [] === 'array'`

错误，`typeof []` 返回 `"object"`，数组需用 `Array.isArray()` 或 `Object.prototype.toString.call()` 判断。

##### 误区三：`instanceof` 可判断所有类型

错误，`instanceof` 不能判断基本类型，也不能跨 iframe 使用。

---

### 总结回顾

判断 JavaScript 类型的常用方法包括：

1. `typeof` —— 适合基本类型判断；
2. `Object.prototype.toString.call()` —— 精准判断所有类型；
3. `instanceof` —— 判断对象实例与构造函数关系。

</details>

## 11. 在React中，Key的作用是什么？为什么需要Key？ {#question-subjective-2c45931e181e}

### 题目要点

Key 是 diff 算法的定位依据 / 作用是提升性能+保持状态 / 忌用索引 / 正确示例

<details>
<summary>参考答案</summary>

### 考察点

#### ● React 中 Key 的机制理解
面试官希望确认候选人是否理解 Key 在虚拟 DOM Diff 算法中的作用，而不仅仅是“加了就没警告”。

#### ● DOM Diff 性能优化原理掌握
是否明白 Key 是如何帮助 React 更高效地更新列表，以及不当使用可能造成的问题。

#### ● 项目中对 Key 的使用习惯
是否在实际开发中合理设置 Key，避免因使用索引等错误方式引起性能或状态 bug。

---

### 参考答案

#### 原理说明

##### 一、什么是 Key？

在 React 中，**Key 是列表中每个元素的唯一标识符**，用于帮助 React 在**进行列表 Diff 运算时，准确识别哪些项被修改、添加或删除**。

Key 作为 `vnode.key` 挂载在虚拟 DOM 节点上，通常出现在通过 `.map()` 渲染的列表中：

```jsx
{list.map(item => (
  <div key={item.id}>{item.name}</div>
))}
````

---

#### 为什么需要 Key？

##### 背景：React 的 Diff 算法

React 使用虚拟 DOM + Diff 算法更新视图。默认使用“同层对比 +最小化操作”原则：

* 在同一父节点下的子元素对比时，通过 Key 判断是否是“相同元素”；
* 如果 Key 相同 → 复用并更新节点；
* 如果 Key 不同 → 旧节点卸载，创建新节点；
* 如果没提供 Key → 以索引顺序为准，逐个比对，效率低且可能产生错误。

##### 作用总结：

* **提升性能**：减少不必要的节点卸载和重建；
* **保持状态一致性**：复用组件时可保持原状态（如输入框内容）；
* **避免渲染 bug**：避免由于节点错误复用造成的 UI 或逻辑异常。

---

#### 项目实践示例

##### 错误示例：使用索引作为 Key

```jsx
{items.map((item, index) => (
  <li key={index}>{item.text}</li>
))}
```

##### 问题：

当列表增删元素时，索引会“移动”，导致：

* DOM 被错误复用；
* 输入框、动画、局部组件状态错乱；
* 性能浪费（误判为节点变化）；

##### 正确示例：使用业务唯一 ID

```jsx
{items.map(item => (
  <li key={item.id}>{item.text}</li>
))}
```

##### 实际项目中的场景：

* 渲染评论列表 / 消息流 / 表格行；
* 滚动加载分页数据；
* 拖拽排序组件等。

---

#### 常见误区或面试陷阱

##### 误区一：Key 只是为了消除警告

React 在开发模式下提示“Each child in a list should have a unique ‘key’ prop”，不是形式要求，而是功能保障。

##### 误区二：使用 index 作为 Key 没问题

只有**静态列表、永不增删排序**时才可使用 index。否则容易导致性能浪费和组件状态混乱。

##### 误区三：Key 是组件内部 props 可见

Key 是 React 内部用的，不会传递给组件本身。如：

```jsx
<MyComponent key={id} /> // MyComponent 无法通过 props.key 获取到 id
```

如果需要传入，需显式再传一个 prop。

---

### 总结回顾

* **Key 是虚拟 DOM diff 的定位标识符**；
* 正确使用 Key 可以**提升性能、保持状态一致、避免渲染异常**；
* 优先使用稳定、唯一的业务字段（如 id）作为 Key；
* 索引只能在**静态无变更的列表中**使用；
* 理解 Key 的机制有助于写出高性能、无状态错乱的 React 列表渲染逻辑。

</details>

## 12. 请解释虚拟滚动的原理，并说明它在什么场景下使用 {#question-subjective-e51d2b45ccf4}

### 题目要点

定义 / 原理 / DOM复用 / 滚动计算 / 适用场景 / 使用陷阱

<details>
<summary>参考答案</summary>

### 考察点

#### ● 前端性能优化的核心能力
面试官希望了解候选人是否能识别列表渲染的性能瓶颈，并通过虚拟滚动等技术进行优化。

#### ● 虚拟滚动的底层机制掌握
是否理解虚拟滚动的原理和实现方式，能否描述它是如何通过“视口可视区域”动态渲染的。

#### ● 场景分析与项目落地能力
能否结合实际业务需求判断是否需要虚拟滚动，如何落地实现，以及如何与框架结合使用（如 React、Vue、小程序等）。

---

### 参考答案

#### 原理说明

##### 什么是虚拟滚动（Virtual Scrolling）？

虚拟滚动是一种**性能优化技术**，用于在渲染超长列表时，只渲染**当前可视区域内的 DOM 元素**，其余元素不真实渲染，仅保留它们在滚动容器中所占据的位置。

又称为：

- 虚拟列表（Virtual List）
- 懒渲染（Lazy Rendering）
- 懒加载滚动（Infinite Scroll 的一个变种）

##### 为什么需要虚拟滚动？

当渲染一个超长列表（如几千条记录）时，如果每一项都生成真实 DOM，会导致：

- 内存占用高；
- 首屏渲染慢；
- 滚动卡顿（DOM 操作频繁）；
- 移动端/低性能设备直接卡死或崩溃。

虚拟滚动通过**复用有限 DOM 节点**，大幅提升性能，保持流畅滚动体验。

---

#### 工作机制与实现原理

##### 核心思想：

> 只渲染可视区域的元素 + 预留顶部和底部的“占位高度”，在滚动时动态更新可视元素。

##### 基本流程：

1. **计算可视区域高度** 和 **单项高度**，得到同时最多可展示多少条数据（如 10 条）；
2. **只渲染当前视口中需要显示的这几条数据**（如第 50~60 条）；
3. **使用容器 + 占位元素** 创建一个“假装”有几千条的滚动空间；
4. 每次滚动触发时，**重新计算 startIndex / endIndex**，更新 DOM 列表。

##### 示例结构（伪代码）：

```html
<div class="scroll-container" onscroll="handleScroll">
  <div style="height: totalHeight;"></div> <!-- 占位层 -->
  <div style="transform: translateY(offset);">
    <div v-for="item in visibleItems">{{ item }}</div> <!-- 渲染可视元素 -->
  </div>
</div>
````

---

#### 使用场景

##### 适用场景：

* **超长列表展示**：如聊天记录、日志数据、海量订单/表格；
* **表格组件优化**：如 element-plus 的 `el-table`、Ant Design 的 `Table`；
* **移动端滚动性能优化**：小程序 `recycle-view`，React Native FlatList；
* **滚动加载无限下拉列表**：结合分页或 lazy load 使用。

##### 不适用场景：

* 列表项高度不一致、动态变化频繁（需额外适配）；
* 列表项交互复杂、状态保留需求高（需数据与组件状态绑定）；
* 列表数量较少（如几十条以内），没有必要使用虚拟滚动。

---

#### 常见误区或面试陷阱

##### 误区一：虚拟滚动等于分页

分页是分批加载数据，虚拟滚动是全部数据已加载，只渲染部分 DOM，两者可结合但非等价。

##### 误区二：所有长列表都必须上虚拟滚动

在数据量不大或复杂交互场景下，虚拟滚动可能带来实现复杂度增加，不一定带来性能收益。

##### 误区三：框架组件库已处理，无需关注原理

虚拟滚动可能导致滚动锚点、懒加载、交互状态等问题，了解原理有助于正确使用组件库，排查边界问题。

---

### 总结回顾

虚拟滚动是一种用于优化**超长列表渲染性能**的关键技术，其核心在于：

* **控制真实 DOM 数量**
* **复用滚动容器和可视节点**
* **动态计算渲染范围**

在聊天记录、数据中心、表格、日志系统等大量数据呈现场景中尤为重要，是前端性能优化体系的重要一环。

</details>

## 13. 请描述一下你对HTTP/2的了解，以及它相较于HTTP/1.1的优势 {#question-subjective-f8d6665c9989}

### 题目要点

协议兼容性 / 多路复用 / HPACK压缩 / 二进制帧 / Server Push / 使用场景

<details>
<summary>参考答案</summary>

### 考察点

#### ● 对 HTTP 协议演进的理解能力
面试官希望了解候选人是否了解 HTTP/2 的设计背景及其解决的问题。

#### ● 掌握 HTTP/2 的核心特性和底层原理
是否能解释 HTTP/2 的多路复用、头部压缩、二进制分帧等核心概念。

#### ● 能结合实际场景说明 HTTP/2 的优势
是否知道 HTTP/2 在前端资源加载、性能优化等方面的实际应用价值。

---

### 参考答案

#### 原理说明

##### 一、什么是 HTTP/2？

HTTP/2 是对 HTTP 协议的重大升级，由 IETF 于 2015 年标准化，**目标是解决 HTTP/1.1 在性能上的瓶颈问题**，尤其是现代 Web 页面中大量并发请求造成的效率低下问题。

- HTTP/2 保留了 HTTP/1.1 的语义（方法、状态码、URI 结构等）；
- 但对底层传输方式进行了彻底重构。

---

#### 相比 HTTP/1.1 的核心优势

##### 1. 多路复用（Multiplexing）

- 在一个 TCP 连接中同时并发处理多个请求/响应，不再“串行阻塞”；
- 避免了 HTTP/1.1 中的“队头阻塞（Head-of-Line Blocking）”问题；
- 一个连接上可同时承载多个流（Stream），每个流有独立的 ID。

> ✅ 优势：减少了连接数量、避免了排队等待、提升并发效率。

##### 2. 头部压缩（HPACK）

- HTTP 请求和响应中包含大量重复 header（如 Cookie、User-Agent）；
- HTTP/2 使用 HPACK 算法压缩头部字段，显著减少网络开销；
- 同一连接内 header 压缩表共享，后续请求更高效。

> ✅ 优势：大幅降低冗余数据传输，提升首字节到达时间（TTFB）。

##### 3. 二进制分帧（Binary Framing）

- HTTP/1.1 是基于文本的，解析开销大，容易出错；
- HTTP/2 将所有通信拆分为帧（frame），每种帧都有明确格式和类型；
- 更适合程序解析、传输稳定性更高。

> ✅ 优势：更高效、更可靠的数据传输模型。

##### 4. 服务器推送（Server Push）

- 服务端可主动“推送”资源到客户端缓存，无需等待客户端显式请求；
- 适用于 HTML 首屏中依赖的 CSS/JS 资源预加载。

> ✅ 优势：减少 RTT（往返延迟），提升页面加载速度（注意推送策略需谨慎控制）。

##### 5. 单连接复用，降低 TCP 连接数量

- HTTP/1.1 中优化手段如域名分片、合并资源（雪碧图、合并 JS）在 HTTP/2 中可放弃；
- 更利于 CDN、缓存、链路层优化。

---

#### 项目中的应用与体验提升

##### 场景一：现代前端构建后的高并发资源加载

构建产物常包含多个拆分 JS chunk、CSS chunk、字体等资源，HTTP/2 支持同时并发加载，显著提升首屏速度。

##### 场景二：移动端弱网环境下体验优化

减少连接建立、提升 header 传输效率，有助于提升弱网下的数据传输稳定性。

##### 场景三：CDN 分发系统升级

现代 CDN 节点普遍支持 HTTP/2，结合缓存策略，可在资源加载层提升整体性能。

---

#### 常见误区或面试陷阱

##### 误区一：HTTP/2 是全新的协议，与 HTTP/1.1 不兼容

错误。HTTP/2 完全兼容 HTTP/1.1 的语义，不需要重新定义请求方式，只是底层传输方式变化。

##### 误区二：用了 HTTP/2 一定能提升所有性能

- 浏览器和服务端必须都支持 HTTP/2；
- 并发性能提升有限度，受限于 TCP、本地计算等；
- Server Push 滥用可能导致带宽浪费或资源冗余。

##### 误区三：用了 HTTP/2 后就不用优化了

- HTTP/2 解决部分网络层问题，但资源结构设计、懒加载、图片压缩、缓存策略仍需优化；
- 合理搭配前端优化手段才能发挥最大效果。

---

### 总结回顾

HTTP/2 通过多路复用、头部压缩、二进制分帧、Server Push 等机制，相比 HTTP/1.1 有显著性能优势：

- **减少连接数，提升并发加载效率**
- **降低冗余数据传输，提升首字节时间**
- **更适合现代 Web 多资源、多模块的加载模型**

</details>

## 14. 讲一下web前端性能优化 {#question-subjective-c1119b9ce2bb}

### 题目要点

加载优化 / 渲染优化 / 交互优化 / 案例说明 / 性能指标

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否具备系统性思维能力
面试官希望候选人能够从网络、渲染、脚本、交互等多个维度展开思考，而非只说几个零散技巧。

#### ● 掌握主流性能优化手段
是否了解当前 Web 性能优化中常用的技术方法和策略，如懒加载、预加载、缓存、虚拟列表等。

#### ● 能结合实际项目场景提出可落地方案
是否能根据实际项目中的页面复杂度、数据体量、设备差异等因素做出有针对性的优化建议。

---

### 参考答案

#### 原理说明

Web 前端性能优化的目标是：**提升页面加载速度、交互响应速度、渲染流畅度，以及整体用户体验**。

优化过程通常围绕以下 3 个阶段展开：

1. **加载阶段优化（Loading）**
2. **渲染阶段优化（Rendering）**
3. **运行阶段优化（Runtime/Interaction）**

---

#### 核心优化维度与策略

##### 一、加载阶段优化

###### ● 资源压缩与合并

- 使用 Gzip/Brotli 压缩 JS/CSS；
- 压缩图片（webp、avif）；
- 合理使用合并打包（减少 HTTP 请求数）。

###### ● 代码拆分与懒加载

- 使用 Webpack 的代码分割（splitChunks）；
- 路由懒加载 / 组件懒加载；
- 图片、视频懒加载（`loading="lazy"`）。

###### ● CDN 与缓存策略

- 静态资源使用 CDN 分发；
- `Cache-Control`、`ETag` 配置合理；
- 利用 Service Worker 实现离线缓存（PWA）。

###### ● 预加载、预解析、预连接

- `&lt;link rel="preload"&gt;` 提前加载关键资源；
- `&lt;link rel="dns-prefetch"&gt;` 提前解析 DNS；
- `&lt;link rel="preconnect"&gt;` 提前建立 TCP/TLS 链接。

---

##### 二、渲染阶段优化

###### ● 减少重排（Reflow）与重绘（Repaint）

- 减少频繁读写 DOM；
- 合并样式操作（如使用 `classList` 而非逐条设置 style）；
- 避免使用影响布局的属性频繁变更（如 width/height）。

###### ● 合理使用 CSS3 动画

- 尽量使用 GPU 加速属性：`transform`、`opacity`；
- 避免使用 `top/left`、`width` 做动画，会触发 layout。

###### ● Skeleton Screen（骨架屏）

- 提高感知速度，降低用户等待焦虑；
- 比 loading spinner 更具结构感。

---

##### 三、运行阶段优化

###### ● 减少长任务阻塞（Long Task）

- 拆分大计算任务为小任务，使用 `requestIdleCallback`、`setTimeout(fn, 0)` 等优化执行时机；
- 利用 Web Worker 执行非主线程逻辑。

###### ● 虚拟滚动 / 虚拟列表

- 避免一次性渲染大量 DOM；
- React/Vue 可引入 `react-window`、`vue-virtual-scroller` 等库。

###### ● 事件节流 / 防抖

- 对频繁触发事件（如 scroll、resize、input）进行节流或防抖处理。

###### ● 使用合适的数据缓存策略

- 页面间共享缓存（如 localStorage、sessionStorage）；
- 请求缓存（如 SW、缓存池、缓存层）。

---

#### 项目中优化实践案例

##### ✅ SPA 首屏加载优化：

- 使用 SSR 或预渲染（Prerender）；
- 拆分初始资源包，按需加载页面组件；
- 使用骨架屏 + 预取首屏数据。

##### ✅ 表格数据渲染优化：

- 使用虚拟滚动展示大量行；
- 滚动分页加载 + 占位 loading；
- 避免绑定每行太多复杂交互逻辑。

##### ✅ 图片优化：

- CDN 自动压缩与格式转换；
- lazyload + viewport 判断；
- 使用 svg/iconfont 替代图片图标。

---

#### 常见误区或面试陷阱

##### 误区一：只关注 Lighthouse 分数

性能评估应结合 RUM（真实用户监控）数据，如 FCP、TTI、INP，而非只看工具打分。

##### 误区二：以为用了框架就自动性能好

React/Vue 本身并不会“自动优化”，合理的组件拆分、状态控制、避免重复渲染才是关键。

##### 误区三：图片、视频随意加载

大图、高清视频应压缩、懒加载并延迟请求，避免一次性卡住主线程。

##### 误区四：盲目开启缓存

缓存需谨慎管理版本，一旦更新策略不当会导致脏数据或用户看到旧内容。

---

### 总结回顾

Web 前端性能优化是系统工程，通常从以下几个维度展开：

- **加载阶段**：压缩、合并、懒加载、预加载、缓存；
- **渲染阶段**：减少重排、GPU 动画、骨架屏；
- **交互阶段**：事件节流、防抖、虚拟滚动、缓存计算。

</details>

## 15. 你对WebAssembly了解多少？它在前端开发中的应用场景是什么？ {#question-subjective-888ce4c0f743}

### 题目要点

定义 / 二进制字节码 / JS 协同 / 性能优势 / 场景举例 / 误区分析

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否掌握 WebAssembly 的基本概念和技术原理<br>
面试官希望确认候选人是否真正理解 WebAssembly 是什么，它解决了前端什么样的问题。

#### ● 理解 WebAssembly 与 JavaScript 的关系<br>
是否知道二者如何协作，互相调用，以及各自的优劣势。

#### ● 能举出合理的应用场景<br>
是否能够基于 Web 性能瓶颈、计算密集型任务、跨语言模块复用等方面给出真实项目中的使用例子。

---

### 参考答案

#### 原理说明

##### 什么是 WebAssembly？

**WebAssembly（缩写为 wasm）** 是一种可在 Web 浏览器中运行的**低级二进制指令格式**，由 W3C 标准化，旨在提供接近原生的性能体验。

- 类似于浏览器的“汇编语言”；
- 目标是提升 Web 的运行性能，尤其在 JavaScript 难以胜任的高性能计算场景；
- 通常由 C/C++、Rust、Go 等语言编译而成。

##### WebAssembly 的特点：

- **二进制格式传输 + 更快的加载和解析速度**；
- **更接近原生性能的执行速度（Near-Native）**；
- **安全沙箱运行，符合 Web 安全模型**；
- **与 JavaScript 共存协作，互相调用**；
- **跨平台、跨浏览器支持广泛（Chrome、Firefox、Edge、Safari 全部支持）**。

---

#### WebAssembly 与 JavaScript 的对比

| 特性           | JavaScript                        | WebAssembly                       |
|----------------|-----------------------------------|-----------------------------------|
| 编写语言       | 动态、解释型、弱类型              | 静态编译语言（C/C++、Rust等）     |
| 执行性能       | 较慢，解释执行+JIT优化            | 接近原生，直接运行字节码          |
| 加载速度       | 文本格式，加载慢                  | 二进制格式，加载快                |
| 开发体验       | 高，生态完善，调试方便             | 调试复杂，开发门槛相对更高         |
| 适用场景       | 通用业务逻辑、DOM 操作             | 高性能计算、音视频处理、加密压缩等 |

---

#### 前端开发中的应用场景

##### 1. 图像处理、音视频编解码

- 使用 WebAssembly 加载如 ffmpeg、libjpeg、libpng 等 C 库；
- 实现浏览器端图片压缩、格式转换、音频截取、视频转码；
- 应用于 Web 图床、音视频 SaaS 平台。

##### 2. 加密压缩 / 格式解析

- 使用 WebAssembly 加载现有 C/C++ 加密库（如 zlib、openssl）；
- 实现客户端压缩上传、大文件预处理、安全加密等功能。

##### 3. PDF / Excel / CAD 等文件解析与预览

- PDF.js 中部分核心模块已用 WebAssembly 加速；
- 大型文档、二进制格式解析在 JS 中性能瓶颈严重，Wasm 提供高效解决方案。

##### 4. 游戏和 3D 引擎运行时

- Unity、Unreal Engine 支持导出 WebAssembly；
- 实现大型游戏、3D 模型、AR/VR 渲染等；
- 如 AutoCAD Web、Blender Web 版等。

##### 5. AI/机器学习推理计算

- ONNX Runtime、TensorFlow Lite Web 版本中使用 WebAssembly 后端；
- 提升边缘 AI 模型在浏览器中的执行性能。

##### 6. 复用原有 C/C++ 后端模块

- 企业已有底层 C/C++ 核心模块（如金融公式计算器、模拟器）；
- 使用 Emscripten 编译为 wasm，在前端直接运行；
- 降低重复造轮子的成本。

---

#### 常见误区与面试陷阱

##### 误区一：WebAssembly 可以完全取代 JavaScript

- 实际上，Wasm 并不擅长 DOM 操作或复杂交互逻辑；
- 真正的用法是与 JS 协同：Wasm 做“计算密集型任务”，JS 做“UI/控制逻辑”。

##### 误区二：WebAssembly 加载后性能一定更好

- 小模块/低频调用的场景下，编译 wasm 带来的加载成本可能大于性能收益；
- 使用 wasm 需要权衡“初始化成本 vs 执行效率”。

##### 误区三：Wasm 无法与 JS 交互

- 实际上 WebAssembly 可以通过导入导出函数（import/export）与 JS 互调；
- 也可通过 SharedArrayBuffer 共享内存。

---

### 总结回顾

WebAssembly 是一种为 Web 设计的高性能、低层级字节码格式，用于解决 JavaScript 在高性能计算方面的天然短板。

它的典型应用场景包括：

- 图像/音视频处理；
- 加密压缩算法；
- 文件解析与预览；
- 游戏和图形渲染；
- AI 模型推理；
- 复用原生模块等。

</details>

## 16. 请解释一下前端安全中的CORS机制，以及如何处理CORS相关问题 {#question-subjective-97a59de360f0}

### 题目要点

同源策略 / 简单 vs 非简单请求 / 响应头机制 / OPTIONS预检 / 常见跨域报错处理

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解浏览器的同源策略与跨域限制
CORS 背后的根本是浏览器的同源策略，面试官希望确认候选人是否理解其限制对象与作用范围。

#### ● 是否掌握 CORS 的工作流程
候选人是否清楚浏览器发起 CORS 请求的触发条件、预检请求机制、响应头处理逻辑等。

#### ● 能否处理项目中常见的 CORS 报错问题
如开发环境跨域、接口跨域、OPTIONS 请求被拒等，是否有实际经验和处理能力。

---

### 参考答案

#### 原理说明

##### 什么是同源策略？

**同源策略（Same-Origin Policy，简称 SOP）** 是浏览器的核心安全机制，规定**只有协议、域名、端口三者完全相同**的两个页面才允许互相访问资源。

举例：

- `https://a.com` 无法直接通过 JS 访问 `https://b.com` 的接口、Cookie、DOM 等；
- 这样可防止恶意站点窃取用户数据（如 CSRF、敏感信息劫持等）。

##### 什么是 CORS？

**CORS（Cross-Origin Resource Sharing）跨域资源共享机制** 是 W3C 定义的一套标准，用于允许服务端控制浏览器是否接受来自其他源的请求。

通过服务端在响应头中添加特定字段，告诉浏览器：**这个请求是安全的，可以放行**。

---

#### CORS 的工作流程

##### 一、请求类型分类

###### ● 简单请求（Simple Request）

满足以下条件的请求属于“简单请求”，浏览器直接发送：

- 请求方法是 GET、POST、HEAD；
- Content-Type 限定为 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`；
- 无自定义头部字段。

响应时，服务端需返回：

```http
Access-Control-Allow-Origin: https://example.com
````

###### ● 非简单请求（Preflight Request）

如使用了 PUT/DELETE、自定义头部、Content-Type 为 JSON 等，会触发浏览器**自动先发送一次 OPTIONS 预检请求**，以确认服务端是否允许。

服务端需在 OPTIONS 响应中返回：

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

之后浏览器才会发送真正的业务请求。

---

#### 常见问题及处理方式

##### 场景一：本地开发接口跨域

* **问题**：本地前端访问远程 API，出现 `Access-Control-Allow-Origin` 报错；
* **解决方案**：

  * 配置本地代理（如 webpack devServer.proxy）；
  * 或后端设置允许跨域的响应头（推荐）；
  * 或使用反向代理服务（如 Nginx）。

##### 场景二：OPTIONS 预检请求失败

* **问题**：服务器未处理 OPTIONS 请求，或没有设置必要的响应头；
* **解决方案**：

  * 后端需显式支持 OPTIONS 请求；
  * 设置正确的 `Access-Control-Allow-Methods` 和 `Access-Control-Allow-Headers`。

##### 场景三：携带 Cookie 时跨域失败

* **问题**：请求中使用了 `withCredentials: true`，但响应中缺少 `Access-Control-Allow-Credentials`；
* **解决方案**：

  * 前端设置：

    ```js
    fetch(url, {
      credentials: 'include'
    });
    ```

  * 后端需返回：

    ```http
    Access-Control-Allow-Credentials: true
    Access-Control-Allow-Origin: https://example.com
    ```

    注意：**不能设置 `*` 通配符作为 Origin 值**。

---

#### 安全性说明与限制

* CORS 是浏览器层面的安全防护机制，**服务端必须明确“白名单来源”**，避免开放所有来源；
* 不建议使用 `*` 通配，尤其在有敏感数据或登录态场景中；
* 可结合 Token 校验 / Referer 校验加强防护。

---

### 总结回顾

* **CORS 是服务端通过响应头控制跨源请求访问权限的机制**；
* 支持两类请求：**简单请求直接发送，复杂请求需预检**；
* 前端无法“解决” CORS，只能通过配置代理或服务端协作处理；
* 了解 OPTIONS 请求机制、Credential 携带要求，是排查 CORS 问题的关键。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-49/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-49/round-71/index.md" >}}) →
