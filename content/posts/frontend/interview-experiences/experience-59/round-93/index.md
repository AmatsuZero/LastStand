+++
title = "滴滴-社招-3年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/59"
experienceId = 59
roundId = 93
roundOrder = 1
company = "滴滴"
date = "2025-07-28T03:27:35.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-92/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-94/index.md" >}}) →

**本轮要点：** react hooks、列表和key、高阶组件、性能优化、react 渲染机制、React函数组件更新、react 组件设计模式、全方位解读this、类型判断

本轮共 14 道题。答案默认折叠，便于先自行作答。

## 1. 项目中遇到的最大技术挑战是什么 {#question-subjective-26e1dc3b0dcc}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 项目整体架构是什么样的 {#question-subjective-69995578c3fa}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 在项目中，你们是如何进行前端代码的模块化和组件化的 {#question-subjective-6df78bf9f0d6}

### 题目要点

- 模块化：代码拆分成独立功能模块，使用 ES Module 标准<br>
- 组件化：UI拆分成可复用组件，封装结构、样式和逻辑<br>
- 结合构建工具支持模块管理和代码分割<br>
- 组件通信通过 props、事件、状态管理实现<br>
- 合理设计文件结构和规范，提升维护性和扩展性<br>
- 注意职责单一、样式隔离和性能优化<br>
- 防止模块和组件划分不合理导致管理混乱

<details>
<summary>参考答案</summary>

### 考察点

- 理解模块化和组件化的概念及其在前端开发中的重要性<br>
- 熟悉常见的模块化规范（如 CommonJS、ES Module）及其区别<br>
- 掌握组件化设计思想和实现方式，尤其是在主流框架中的实践<br>
- 能结合项目需求合理组织代码结构，提高复用性和维护性

---

### 参考答案

#### 一、原理说明

- **模块化** 指将代码拆分成独立的、功能明确的模块，每个模块有自己的作用域和接口，避免全局污染，提高代码可维护性。<br>
  - 常见规范包括：<br>
    - **CommonJS**（Node.js环境，使用 `require` 和 `module.exports`）<br>
    - **AMD**（异步模块定义，适用于浏览器异步加载）<br>
    - **ES Module（ESM）**（现代标准，使用 `import` 和 `export`，支持静态分析）<br>
- **组件化** 是模块化的进一步细化，专注于 UI 层面，将界面拆分成独立且可复用的组件，封装逻辑、样式和结构。<br>
  - 组件通常包含状态管理、事件处理、生命周期管理等，方便组合和维护。<br>
  - 主流框架如 Vue、React、Angular 都鼓励基于组件开发。

---

#### 二、项目中模块化和组件化的实践

##### 1. **模块化管理**

- 项目采用 **ES Module** 作为标准模块规范，利用 `import` 和 `export` 进行模块间依赖管理。<br>
- 通过合理拆分功能模块（如工具库、接口服务、状态管理、业务逻辑）形成清晰的依赖关系，便于维护和测试。<br>
- 使用构建工具（Webpack、Vite）支持模块打包和代码分割，提高加载效率。<br>
- 配合 `alias` 和路径管理，保持模块引用简洁，提升开发体验。

##### 2. **组件化设计**

- 界面层面，拆分成粒度合适的可复用组件，满足单一职责原则。<br>
- 采用状态提升、属性传递和事件回调机制实现组件间通信。<br>
- 使用组件库（如 Element UI、Ant Design）或自研组件库提升开发效率。<br>
- 结合样式模块化（CSS Modules、Scoped CSS、CSS-in-JS）实现样式隔离，防止样式冲突。<br>
- 组件支持配置化和插槽机制，提高灵活性和扩展性。

##### 3. **代码组织结构**

- 按业务域或功能划分文件夹，模块和组件分层清晰，便于定位和扩展。<br>
- 统一入口导出，方便模块聚合和复用。<br>
- 编写完善的文档和规范，确保团队成员对模块和组件使用方式达成共识。

##### 4. **优势与价值**

- 提高代码复用率，减少重复开发和维护成本。<br>
- 降低耦合度，提升系统可扩展性。<br>
- 加快开发节奏，方便多人协作。<br>
- 利用现代构建工具实现性能优化。

---

#### 三、常见误区与注意点

- **模块划分过细或过粗** 导致管理困难或代码臃肿，需根据项目复杂度合理拆分。<br>
- **组件职责不明确**，混合业务逻辑和表现层，影响复用和测试。<br>
- 忽视样式隔离，导致样式污染和冲突。<br>
- 组件间通信设计不合理，导致状态管理混乱。<br>
- 忽略模块和组件的性能优化，如避免无意义的重新渲染和重复加载。

</details>

## 4. 项目中做过哪些性能优化方面的工作 {#question-subjective-43824f1001b4}

### 题目要点

- 资源按需加载与代码拆分减少首屏加载时间<br>
- 静态资源压缩、合并和 CDN 加速<br>
- 图片优化与懒加载<br>
- 减少 DOM 操作，合理使用虚拟 DOM<br>
- JS 任务拆分，使用防抖节流和 Web Worker<br>
- 接口合并、缓存和 HTTP/2 多路复用<br>
- 持续性能监控与数据驱动优化<br>
- 避免过度拆分和缓存策略失误<br>
- 注重整体性能和用户设备多样性

<details>
<summary>参考答案</summary>

### 考察点

- 理解前端性能优化的核心目标与常见瓶颈<br>
- 掌握多种性能优化手段及其适用场景<br>
- 能结合具体项目场景，分析问题并提出有效优化策略<br>
- 熟悉常用性能监控和评估工具，验证优化效果

---

### 参考答案

#### 一、原理说明

- 前端性能优化的核心目标是提升页面加载速度、响应速度和交互流畅度，从而改善用户体验，降低用户流失。<br>
- 性能瓶颈通常来源于资源加载慢、渲染阻塞、JavaScript 执行耗时、内存泄漏和网络请求频繁等。<br>
- 现代性能优化涉及多个层面，包括网络层、资源层、渲染层和代码执行层。<br>
- 性能优化不仅是技术问题，更涉及合理架构设计和业务合理拆分。

---

#### 二、项目中的具体优化实践

##### 1. **资源加载优化**

- 采用代码拆分（Code Splitting）和按需加载，避免一次性加载大量无关代码，缩短首屏加载时间。<br>
- 使用 CDN 分发静态资源，提升资源下载速度。<br>
- 资源压缩和合并（如压缩 JS/CSS，合并小文件减少请求数量）。<br>
- 图片优化（WebP 格式替代、图片懒加载、合理尺寸裁剪）。<br>
- 利用浏览器缓存策略（Cache-Control、Service Worker）减少重复请求。

##### 2. **渲染性能优化**

- 减少 DOM 操作次数，合并多次修改，避免触发频繁回流和重绘。<br>
- 使用虚拟 DOM 和虚拟列表技术优化大量数据渲染。<br>
- CSS 动画尽量使用 GPU 加速属性（如 transform、opacity）。<br>
- 避免长任务阻塞主线程，合理拆分 JS 任务，防止界面卡顿。

##### 3. **JavaScript 执行优化**

- 减少不必要的计算和事件绑定，防抖节流常用来优化频繁触发的事件。<br>
- 使用 Web Worker 将计算密集型任务移至后台线程，避免主线程阻塞。<br>
- 利用 Tree Shaking 去除未使用代码，减小包体积。<br>
- 预编译和缓存机制提升运行效率。

##### 4. **网络请求优化**

- 接口合并，减少请求次数。<br>
- 接口缓存，避免重复请求同一数据。<br>
- 接口压缩与批量请求。<br>
- 使用 HTTP/2 多路复用，提升请求并发性能。

##### 5. **性能监控与持续优化**

- 集成性能监控工具（如 Lighthouse、Chrome DevTools Performance、RUM 埋点等）。<br>
- 通过埋点监控首屏时间、接口响应时间、动画帧率等关键指标。<br>
- 根据监控数据持续跟踪性能瓶颈，迭代优化。

---

#### 三、常见误区与注意点

- 只注重单一优化手段，忽视整体性能提升策略。<br>
- 盲目过度拆分导致请求过多，反而影响性能。<br>
- 缓存设置不合理，导致用户看到过期内容。<br>
- 不关注性能监控数据，缺乏闭环改进。<br>
- 忽视用户设备差异，优化方案不够适配低端设备。

</details>

## 5. 在移动端开发中，你们是如何处理不同设备的适配问题的 {#question-subjective-bfa8d18a2415}

### 题目要点

* 了解并使用 viewport 设置布局基础
* 灵活组合 rem/vw/flex/media query 等单位和布局方案
* 使用 postcss 工具链统一适配流程
* 考虑高DPR设备图像清晰度适配
* 针对横屏、Pad 等极端设备考虑额外样式方案
* 注重兼容性测试，处理浏览器差异

<details>
<summary>参考答案</summary>

### 考察点

- 是否了解常见的移动端适配方案及原理<br>
- 是否能结合业务场景选择合理的适配策略<br>
- 是否关注兼容性、用户体验和性能平衡<br>
- 是否能系统性总结适配技术手段的优缺点<br>

---

### 参考答案

#### 一、适配问题的来源

移动端设备种类繁多，存在如下适配挑战：

- 屏幕尺寸不同（如 iPhone SE 到 iPad Pro）<br>
- 分辨率与像素密度不同（如1x 到 4x）<br>
- 不同平台（iOS、Android）行为差异<br>
- 浏览器内核差异（微信内嵌、Safari、Chrome 等）

---

#### 二、常见适配方案及实践

##### 1. **使用视口 meta 标签设置**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
````

* 保证页面以设备宽度为基准渲染，避免缩放失真
* 是一切移动端适配的基础

##### 2. **flex 弹性布局 + 百分比布局**

* 使用 `flex` 实现自适应布局、对齐方式
* 使用 `%` 控制元素宽高随父元素变化自动适应

##### 3. **rem 适配（结合 lib-flexible 或 postcss-pxtorem）**

* 基于 `html { font-size }` 动态设置根字体大小
* 所有长度用 `rem` 表示，实现随屏幕宽度缩放

示例代码：

```js
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';
```

* 优点：适配思路清晰，开发体验好
* 缺点：对第三方组件兼容性较差，需要统一处理单位转换

##### 4. **vw/vh 适配**

* 使用视口单位（vw = 1%视口宽度，vh = 1%视口高度）作为长度单位
* 优点：原生CSS支持，无需额外JS计算
* 缺点：iOS下 Safari 某些版本 vh 不稳定；不利于对字体的精确控制

##### 5. **媒体查询 Media Query**

```css
@media screen and (max-width: 768px) {
  /* 针对窄屏设备样式 */
}
```

* 适合做断点响应式布局（如 PC/H5 两端共用一套代码）
* 可配合 CSS Modules 或 Sass 编写模块化响应样式

##### 6. **多套 UI 组件或主题切换**

* 对于分辨率特别极端或平台风格差异大的情况（如横屏、Pad、TV）
* 采用不同主题、样式、交互进行适配处理

---

#### 三、其他补充策略

* 高清方案：针对高DPR（devicePixelRatio）设备使用多倍图或 SVG 图形
* viewport-fit=cover：适配 iPhone X 等刘海屏安全区域
* 字体大小限制：Android 浏览器允许用户放大字体，需设置 `user-scalable=no` 或动态缩放限制

</details>

## 6. 闭包的定义和应用场景是什么 {#question-subjective-2fa3800e4650}

### 题目要点

* 闭包是在函数中返回函数，并访问外部变量形成的作用域链
* 常用于封装私有变量、延长变量生命周期、记忆函数等
* 项目中常见于定时器、回调函数、高阶函数中
* 滥用闭包会导致内存泄漏或性能下降，需注意释放引用

<details>
<summary>参考答案</summary>

### 考察点

- 是否理解闭包的**定义与形成机制**<br>
- 是否掌握闭包的**典型应用场景**和实际项目中的使用方式<br>
- 能否识别闭包带来的**性能和内存问题**

---

### 参考答案

#### 一、闭包的定义

闭包（**Closure**）是指：

> **一个函数能够“记住”并访问其定义时的词法作用域，即使这个函数在其词法作用域之外执行。**

换句话说，当一个函数内部返回另一个函数，并且这个内部函数访问了外部函数的变量，那么这个内部函数就形成了闭包。

**形成条件：**
- 函数嵌套（函数内部返回或引用另一个函数）
- 内部函数引用了外部函数的变量
- 外部函数执行后返回了内部函数

**示例代码：**

```js
function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  };
}
const counter = outer(); // 闭包形成
counter(); // 1
counter(); // 2
````

---

#### 二、闭包的应用场景

##### 1. **封装私有变量**

闭包常用于模拟私有变量的封装，防止外部直接修改：

```js
function createCounter() {
  let count = 0;
  return {
    increment() { count++; return count; },
    decrement() { count--; return count; }
  };
}
const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.decrement()); // 0
```

##### 2. **延长变量生命周期（缓存/记忆函数）**

```js
function memoize(fn) {
  const cache = {};
  return function(key) {
    if (cache[key]) return cache[key];
    const result = fn(key);
    cache[key] = result;
    return result;
  };
}
```

##### 3. **事件监听绑定中的变量保留**

```js
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 正确输出 0,1,2，因 let 有块级作用域
  }, i * 1000);
}
```

如果使用 `var`，可以配合闭包解决变量提升问题：

```js
for (var i = 0; i < 3; i++) {
  (function(index){
    setTimeout(() => console.log(index), index * 1000);
  })(i);
}
```

##### 4. **高阶函数/工厂函数/回调函数的典型场景**

```js
function withPrefix(prefix) {
  return function (str) {
    return prefix + str;
  };
}
const hello = withPrefix("Hello, ");
console.log(hello("World")); // Hello, World
```

---

#### 三、闭包的性能和内存问题

* **闭包会增加内存消耗**，因为其引用的外部变量不会被销毁，造成 GC 回收延迟或内存泄漏
* 特别是在 DOM 操作、定时器、事件监听器中，如果闭包持有大量 DOM 引用，要注意手动解除引用或使用弱引用（如 `WeakMap`）

</details>

## 7. 解释以下代码的输出顺序： {#question-subjective-fe634098239b}

```js
console.log('script start');
setTimeout(() => {
  console.log('setTimeout');
}, 0);
Promise.resolve().then(() => {
  console.log('promise1');
});
Promise.resolve().then(() => {
  console.log('promise2');
});
console.log('script end');
```

### 题目要点

* JS 先执行所有同步代码（输出 script start 和 script end）
* 微任务（Promise 的 `.then`）优先于下一轮宏任务执行（输出 promise1、promise2）
* 宏任务（setTimeout）最后执行（输出 setTimeout）
* 事件循环模型中：**同步 → 微任务 → 宏任务** 是关键执行顺序

<details>
<summary>参考答案</summary>

### 考察点

- 理解 JavaScript **事件循环（Event Loop）** 的执行机制<br>
- 掌握 **宏任务（macrotask）** 与 **微任务（microtask）** 的执行顺序<br>
- 能准确分析同步任务、Promise、setTimeout 等在执行栈中的先后关系

---

### 参考答案

#### 一、代码执行顺序分析

```js
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
});
Promise.resolve().then(() => {
  console.log('promise2');
});

console.log('script end');
````

#### 二、执行流程详解

1. **同步代码执行**（立即执行）：

   ```js
   console.log('script start'); // 输出：script start
   setTimeout(...);             // 注册宏任务，等待执行
   Promise.resolve().then(...); // 注册微任务
   Promise.resolve().then(...); // 再注册微任务
   console.log('script end');   // 输出：script end
   ```

   此时，输出顺序为：

   ```
   script start
   script end
   ```

2. **微任务队列执行**（在当前宏任务结束后，立即执行所有微任务）：

   * 执行 `promise1`
   * 执行 `promise2`

   输出：

   ```
   promise1
   promise2
   ```

3. **宏任务队列执行**：

   * 执行 `setTimeout` 回调

   输出：

   ```
   setTimeout
   ```

---

#### 三、最终输出顺序

```text
script start
script end
promise1
promise2
setTimeout
```

</details>

## 8. typeof null和null instanceof Object的结果是什么 {#question-subjective-84065dd8674e}

### 题目要点

* `typeof null === 'object'` 是历史遗留的设计问题
* `null instanceof Object === false` 因为 null 没有原型链
* 类型判断建议优先使用 `=== null`、`Object.prototype.toString.call(val)` 等更准确方式

<details>
<summary>参考答案</summary>

### 考察点

- 掌握 JavaScript 中 `typeof` 与 `instanceof` 操作符的机制<br>
- 能解释为何 `typeof null` 返回 `'object'` 的历史原因<br>
- 理解原型链与类型检测的区别

---

### 参考答案

#### 一、typeof null 的结果

```js
typeof null === 'object';
````

##### ✅ 原因说明：

* `typeof` 是一个用于检测数据类型的操作符，但它有个历史遗留问题：

  * **在 JavaScript 最初设计时，`null` 被定义为一个对象的占位值**
  * 底层实现中，`null` 的二进制表示是 `0x00`，而对象的类型标记也是以 0 开头
  * 所以 `typeof null` 错误地返回了 `'object'`，这是 ECMAScript 历史上的一个**bug**

##### ❗注意：

* 这个问题已经存在多年，但由于历史兼容性问题，ECMA 没有修复它
* 你可以通过更精确的方法判断 null，例如：

```js
value === null
```

---

#### 二、null instanceof Object 的结果

```js
null instanceof Object === false;
```

##### ✅ 原因说明：

* `instanceof` 检查的是**原型链上是否能找到目标构造函数的 prototype**
* `null` 是原始值，没有原型链，也不是任何构造函数的实例对象

因此：

* `null instanceof Object` 返回 `false`
* 而例如 `{}`、`[]`、`new Date()` 等对象，都返回 `true`

---

### 总结对比

| 表达式                      | 结果         | 原因说明                    |
| ------------------------ | ---------- | ----------------------- |
| `typeof null`            | `'object'` | 历史遗留 bug，null 被错误识别为对象  |
| `null instanceof Object` | `false`    | null 无原型链，不是 Object 的实例 |

</details>

## 9. React Fiber是什么？它是如何工作的 {#question-subjective-6792e37e7d1a}

### 题目要点

* `Fiber` 是 React 的新的 **协调与更新引擎**，用于支持异步可中断渲染

* Fiber 拆分了更新过程，使得渲染任务可以被打断、恢复

* 整个 Fiber 架构包括三阶段：调度、渲染、提交

* 使用 `requestIdleCallback` 等实现任务切片，提升性能

* 通过 Fiber，React 实现了更强大的并发特性和用户响应性

* Fiber Node / Effect List / Lanes / Scheduler 是核心关键词

<details>
<summary>参考答案</summary>

### 考察点

- 掌握 React 新架构 Fiber 的设计目的和核心机制
- 理解 Fiber 如何解决 React 16 之前的性能瓶颈
- 能准确说明 Fiber 的工作原理、任务调度、递归方式等关键设计点
- 理解 Fiber 和浏览器帧率调度的关系

---

### 参考答案

#### 一、React Fiber 的定义与出现背景

**Fiber 是 React 16 引入的重构版核心算法，用于实现更可控的更新过程。**

> 简单理解：Fiber 是对 React 树的“增量更新”机制的支持，是一个可中断、可恢复的渲染算法。

##### 为什么需要 Fiber？

React 15 及之前的 Reconciliation（协调）过程是同步、递归的：
- 一旦开始更新 Virtual DOM 树，中途无法中断
- 大型组件树会导致主线程长时间卡顿，影响动画、响应、输入

##### Fiber 带来的改变：

- 将递归的树更新过程**拆分成可中断的任务单元**
- 利用浏览器的空闲时间进行任务调度，实现高响应性（实现异步可中断渲染）
- 支持 React 的**并发模式（Concurrent Mode）**，例如：`Suspense`、`useTransition`

---

#### 二、Fiber 的核心机制

##### 1. Fiber Node

每个组件在更新时，都会生成一个对应的 **Fiber 节点对象**，形成一棵 Fiber 树：
```js
FiberNode {
  type,            // 类型：函数组件、类组件、HostComponent等
  key,             // React key
  return,          // 父 Fiber
  child,           // 第一个子 Fiber
  sibling,         // 右边的兄弟 Fiber
  alternate,       // 当前 Fiber 对应的上一次 Fiber（旧树）
  stateNode,       // 真实 DOM 或 class 实例
  effectTag,       // 标记更新类型
  ...
}
````

##### 2. Fiber 架构的三个阶段

React Fiber 的更新过程可分为三大阶段：

###### （1）调度阶段（reconciliation）

* 任务被插入调度队列，由 `Scheduler` 调度执行
* React 利用 `requestIdleCallback` / `MessageChannel` 实现**任务时间切片**
* 每次只处理一小段 Fiber 节点，**中间可以中断恢复**

> 此阶段只计算更新差异（diff），不会修改真实 DOM

###### （2）渲染阶段（render phase）

* 从根组件开始，构建新的 Fiber 树
* 标记所有需要更新的节点（`effectTag`）
* 生成 “副作用列表” (`effect list`)

> 这部分也称为“协调阶段”，是纯函数阶段，没有副作用执行

###### （3）提交阶段（commit phase）

* 将所有副作用统一提交：更新 DOM、触发生命周期、Ref 等
* 此阶段是**同步、不可中断**的

---

#### 三、Fiber 的调度模型

Fiber 的调度基于\*\*优先级（Lanes）\*\*设计：

* 每个更新任务都有一个优先级（如：同步更新、高优先交互、低优先动画）
* React 可以根据空闲时间选择合适的任务执行
* 实现任务的抢占、中断与恢复，提高整体响应性

---

#### 四、React Fiber 的意义与优势

* ✅ 支持异步渲染与任务中断，避免长任务阻塞 UI
* ✅ 可根据优先级灵活调度任务（比如用户输入优先）
* ✅ 支持 `Concurrent Mode` 并发特性
* ✅ 为后续功能如 `Suspense`、`Transition`、`useDeferredValue` 提供技术支撑

</details>

## 10. useEffect和useLayoutEffect的区别是什么 {#question-subjective-6298126e8ab7}

### 题目要点

* `useLayoutEffect` 执行在浏览器绘制前，**同步副作用**

* `useEffect` 执行在浏览器绘制后，**异步副作用**

* 页面需读取/修改 DOM 布局时必须使用 `useLayoutEffect`

* 不涉及 DOM 的副作用，如请求、事件监听等应使用 `useEffect`

* 滥用 `useLayoutEffect` 会引发**性能问题**

* 执行时机不同 / 是否阻塞渲染 / 是否同步影响 DOM / 视觉稳定性

<details>
<summary>参考答案</summary>

### 考察点

- 掌握 React 中两个副作用钩子的执行时机和使用场景
- 理解 DOM 渲染流程及其与副作用的关系
- 能在项目中合理区分 useEffect 与 useLayoutEffect 的适用情况
- 理解它们对性能与视觉渲染的影响

---

### 参考答案

#### 一、核心区别概览

| 特性               | useEffect                        | useLayoutEffect                          |
|--------------------|----------------------------------|-------------------------------------------|
| 执行时机           | 组件渲染后，**浏览器绘制之后**     | 组件渲染后，**浏览器绘制之前**（同步）    |
| 执行顺序           | 异步（放入宏任务队列）            | 同步（与 DOM 渲染同步）                   |
| 阻塞页面绘制       | 否                               | ✅ 是（会阻塞浏览器绘制）                  |
| 使用场景           | 异步请求、事件绑定、订阅等        | 读取 DOM 布局、同步 DOM 操作              |

---

#### 二、原理说明

React 的组件渲染分为以下步骤：

1. **构建虚拟 DOM**
2. **提交更新，渲染到真实 DOM**
3. **浏览器执行绘制**
4. **调用副作用函数**

- `useLayoutEffect` 会在 **DOM 更新后但浏览器绘制之前** 执行，适用于读取 DOM 布局或同步修改 DOM
- `useEffect` 会在 **浏览器绘制之后异步执行**，不会阻塞页面渲染

---

#### 三、使用场景对比

##### ✅ useEffect 常用于：

- 发送异步请求
- 设置订阅、事件监听
- 定时器、日志上报
- 不涉及 DOM 读取和同步操作的副作用

```tsx
useEffect(() => {
  fetchData();
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
````

##### ✅ useLayoutEffect 常用于：

* **读取 DOM 布局信息**（如 offsetHeight）
* **同步修改 DOM 样式，防止闪动**

```tsx
useLayoutEffect(() => {
  const height = ref.current.offsetHeight;
  ref.current.style.transform = `translateY(-${height}px)`;
}, []);
```

> 如果用 `useEffect` 做 DOM 操作，可能会出现“闪一下”的视觉问题，因为已经完成了绘制。

---

#### 四、常见误区与面试陷阱

* ❌ **误用 useEffect 操作 DOM**：可能会导致视觉闪烁或布局错位
* ❌ **用 useLayoutEffect 做重型任务**：会阻塞页面渲染，影响性能
* ❌ **不了解执行顺序**：两者都是在组件挂载后才执行，而非渲染前

> 小技巧：能用 `useEffect` 就用它，`useLayoutEffect` 留给需要同步控制 DOM 的场景

</details>

## 11. React中的虚拟DOM和Diff算法是如何提高性能的 {#question-subjective-d700f12759e9}

### 题目要点

* 虚拟DOM是JS对象表示的DOM树，避免直接频繁操作真实DOM
* Diff算法通过**同层对比、key优化、类型判断**将比较复杂度降至O(n)
* 性能优化体现在**减少真实DOM操作、最小化重绘、列表复用**
* 列表更新场景中合理使用`key`可以避免不必要重渲染
* 结合Fiber架构实现异步、可中断的更新机制，进一步提升大规模应用性能

<details>
<summary>参考答案</summary>

### 考察点

- React 的核心渲染机制（Virtual DOM）
- Diff 算法在性能优化中的作用
- 为什么需要虚拟DOM？如何高效比较变化？
- 面试中高频考察其**底层原理、性能优势和适用场景**

---

### 参考答案

#### 一、什么是虚拟DOM（Virtual DOM）

虚拟DOM是用**JavaScript 对象**来描述DOM结构的**轻量级副本**，它不直接操作真实DOM，而是通过比较（Diff）和更新策略，实现高效的DOM变更。

```js
const vNode = {
  type: 'div',
  props: { className: 'container' },
  children: ['Hello']
};
````

##### 虚拟DOM的主要优势：

* 避免直接频繁操作真实DOM（性能开销大）
* 可跨平台（浏览器 / Native / 小程序等）
* 支持高效更新的前提：Diff算法

---

#### 二、React中虚拟DOM的工作机制

1. 初次渲染：`JSX -> 虚拟DOM -> 真实DOM`
2. 组件更新：`新的虚拟DOM` 与 `旧的虚拟DOM` 进行 **Diff 比较**
3. 得到 **最小差异补丁（Patch）**
4. 通过 **Reconciliation 协议** 更新真实DOM

> React通过批量、分批地合并更新，避免频繁的DOM重绘和重排，提高性能。

---

#### 三、Diff 算法的优化原理

React 的 Diff 算法并不是传统的 O(n³) 全树对比，而是做了以下优化降为 **O(n)**：

##### 1. **同层比较**（树的同层节点之间对比，不跨层）

* 假设结构稳定，**只在同一层做对比**，跳过跨层节点。

##### 2. **Key机制优化列表对比**

* 对于列表结构，如果没有 `key`，会使用下标作为标识，容易导致重渲染。
* 正确使用 `key` 可避免不必要的节点移除 / 添加。

##### 3. **节点类型不同，直接销毁重建**

* 不再递归比较，节省计算

##### 4. **组件类型不同，不做深比较，直接替换**

---

#### 四、代码示例与性能影响

假设有以下两个列表：

```jsx
// 更新前
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
  <li key="c">C</li>
</ul>

// 更新后
<ul>
  <li key="b">B</li>
  <li key="a">A</li>
  <li key="c">C</li>
</ul>
```

* 如果没加 `key`，React 会以为每个节点都变了，导致重新渲染
* 有了 `key` 后，它知道 A、B、C 节点只是顺序变化，不需要销毁重建

---

#### 五、为什么虚拟DOM + Diff 能提升性能？

* **批处理更新**：收集变更后统一更新
* **最小差异更新**：通过Diff算法找到最小变更集
* **避免不必要渲染**：精确定位需要更新的DOM
* **与 Fiber 架构结合**：支持异步、可中断的渲染流程（React 16+）

</details>

## 12. React.memo的作用是什么 {#question-subjective-d217e1cdbd92}

### 题目要点

* `React.memo` 是高阶组件，用于记忆函数组件，避免不必要的重新渲染
* 内部默认使用 `Object.is` 做 props 浅比较，也可以自定义比较函数
* 适用于纯函数组件、静态 props、高渲染成本组件
* 使用场景需评估 props 变更特性，避免滥用
* 类似作用的还有 `useMemo`、`useCallback` 但用法不同

<details>
<summary>参考答案</summary>

### 考察点

- 组件性能优化手段
- React 的组件渲染机制
- React.memo 的使用场景和限制
- 如何避免组件的**不必要重渲染**

---

### 参考答案

#### 一、React.memo 的原理与定义

`React.memo` 是一个**高阶组件（Higher-Order Component）**，用于对**函数组件**进行“记忆化”处理，避免**因父组件重新渲染而导致的子组件重复渲染**。

```js
const MemoizedComponent = React.memo(MyComponent);
````

* 本质上是对组件的 **props 做浅比较**，当 props 没有变化时，组件就不会重新渲染。
* 默认使用 `Object.is` + 浅比较，但可以传入自定义比较函数。

---

#### 二、使用场景

* 子组件是**纯函数组件**，只依赖 props 渲染。
* 子组件渲染成本高，**频繁更新但 props 实际未变**。
* 父组件更新但不影响子组件时，使用 `React.memo` 可以跳过子组件渲染。

##### 示例代码

```jsx
const Child = React.memo(({ value }) => {
  console.log("Child render");
  return <div>{value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <Child value="static" />
    </>
  );
}
```

* 每次点击按钮时，`Parent` 重新渲染，但由于 `Child` 的 props 没变，`Child` 不会重新渲染。

---

#### 三、自定义比较函数

默认是浅比较，如果传入的是对象类型的 props，推荐使用自定义比较器：

```js
function areEqual(prevProps, nextProps) {
  return prevProps.id === nextProps.id;
}

const MemoComp = React.memo(MyComponent, areEqual);
```

---

#### 四、常见误区与限制

* **仅适用于函数组件**（类组件用 `PureComponent`）
* **不能阻止内部状态或上下文变更触发的更新**
* **浅比较局限性**：传入复杂对象（如函数或新对象字面量）会导致每次 props 都变化
* **过度使用可能适得其反**：增加计算成本，不一定提升性能

</details>

## 13. CORS的几个关键头部是什么？它们的作用是什么 {#question-subjective-47c795a760c4}

### 题目要点

* `Access-Control-Allow-Origin`：指定允许访问的来源
* `Access-Control-Allow-Methods`：允许的跨域请求方法
* `Access-Control-Allow-Headers`：允许携带的自定义请求头
* `Access-Control-Allow-Credentials`：是否允许携带凭据，需配合具体 Origin
* `Access-Control-Expose-Headers`：客户端可访问的响应头
* `Access-Control-Max-Age`：预检结果的缓存时间
* `Origin` 是浏览器发送的标识来源的请求头
* 区分简单请求与预检请求，理解触发条件和影响性能的机制

<details>
<summary>参考答案</summary>

### 考察点

- 理解 CORS（跨域资源共享）机制的本质与安全模型
- 熟悉 CORS 过程中的关键 HTTP 头部
- 掌握浏览器与服务端如何协同完成跨域请求
- 能解释预检请求与简单请求的异同

---

### 参考答案

#### 一、什么是 CORS

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器基于**同源策略**限制跨域请求的一种安全机制。<br>
为允许安全的跨域请求，CORS 定义了一套服务端响应的**HTTP头部**规则，告知浏览器“这个跨域请求是允许的”。

---

#### 二、CORS 关键头部及作用

##### `Access-Control-Allow-Origin`

- **作用**：指定允许访问资源的来源（Origin）
- **示例**：

```http
Access-Control-Allow-Origin: https://example.com
````

* **支持通配符**：`*` 表示允许任意来源（但不适用于携带 Cookie 的请求）

---

##### `Access-Control-Allow-Methods`

* **作用**：列出服务端允许的跨域请求方法
* **在预检请求（OPTIONS）中响应**
* **示例**：

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

##### `Access-Control-Allow-Headers`

* **作用**：声明哪些自定义请求头允许在跨域中使用（用于预检）
* **示例**：

```http
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

##### `Access-Control-Allow-Credentials`

* **作用**：指示是否允许跨域请求携带 Cookie、HTTP认证信息等凭据
* **值必须为**：`true`
* **配套限制**：

  * `Access-Control-Allow-Origin` **不能是 `*`，必须是明确域名**
  * 浏览器端需设置 `xhr.withCredentials = true`

---

##### `Access-Control-Expose-Headers`

* **作用**：允许客户端 JS 脚本访问哪些响应头
* 默认客户端只能访问部分“安全响应头”，如 `Content-Type`、`Cache-Control`
* 如需暴露自定义响应头，需要设置：

```http
Access-Control-Expose-Headers: X-Custom-Header
```

---

##### `Origin`（请求头）

* **作用**：由浏览器自动添加，用于标识发起请求的源（协议+域名+端口）
* 服务器通过此字段判断是否允许跨域

---

##### `Access-Control-Max-Age`

* **作用**：指定**预检请求的结果在缓存中保留的时间（秒）**
* 可以减少频繁的预检请求：

```http
Access-Control-Max-Age: 86400
```

---

### 三、简单请求 vs 预检请求（Preflight）

| 请求类型 | 触发条件                           | 是否发送 OPTIONS | 常见场景                      |
| ---- | ------------------------------ | ------------ | ------------------------- |
| 简单请求 | GET、POST、HEAD 且无自定义头           | 否            | 表单提交、图片加载等                |
| 预检请求 | 使用 PUT/DELETE/自定义头/Credentials | 是            | RESTful API、携带 Token 的请求等 |

</details>

## 14. 实现debounce函数（实现 debounce(fn, duration, leading) ，支持立即执行（ leading=true ） {#question-subjective-13da62ffd838}

### 题目要点

* 防抖是延迟执行，避免高频调用，适用于输入搜索、resize 等场景
* `leading=true` 表示首次立即执行，后续防抖时间内不再重复执行
* 实现核心是清除 `setTimeout` + 用 `hasCalled` 标记是否执行过
* 注意闭包、上下文（this）与参数传递的正确性

<details>
<summary>参考答案</summary>

### 考察点

- 理解防抖（debounce）的应用场景与机制
- 掌握闭包与定时器控制函数节流频率
- 实现一个支持 `leading`（立即执行） 的 debounce 版本
- 熟悉 JavaScript 高阶函数与异步任务调度

---

### 参考答案

#### 一、什么是 debounce（防抖）？

**debounce（防抖）**是一种函数执行控制技术，它能在高频事件触发时，**只在事件停止一段时间后执行回调函数**，避免频繁执行逻辑。

- 常见场景：输入框搜索、窗口 resize、滚动 scroll、按钮点击防重复提交等。

---

#### 二、为什么需要支持 `leading=true`？

默认的 debounce 是“**等最后一次触发后**”才执行回调。<br>
而有些场景（如点击按钮），希望**第一次就立即执行一次**，这个就是 `leading` 参数的含义。

---

#### 三、实现 debounce(fn, duration, leading)

```js
function debounce(fn, duration = 300, leading = false) {
  let timer = null;
  let hasCalled = false;

  return function (...args) {
    const context = this;

    // 如果 leading 为 true，且未执行过
    if (leading && !hasCalled) {
      fn.apply(context, args);
      hasCalled = true;
    }

    // 清除上一次定时器
    clearTimeout(timer);

    timer = setTimeout(() => {
      if (!leading) {
        fn.apply(context, args);
      }
      hasCalled = false; // 重置标记，允许下次 leading 生效
    }, duration);
  };
}
````

---

#### 四、使用示例

```js
function onSearchInput(value) {
  console.log("搜索关键词：", value);
}

// 300ms 防抖 + 立即执行
const debouncedInput = debounce(onSearchInput, 300, true);

// 模拟用户输入
debouncedInput("vue");
debouncedInput("vue3");
debouncedInput("vue3.x");
```

输出只会立即执行一次 `"vue"`，其余触发会被 debounce 掉。

---

#### 五、常见误区或陷阱

* **误区一：leading 模式会重复执行**
  → 实现中需正确使用标志位 `hasCalled`，避免后续 debounce 时间内重复触发。

* **误区二：忽视 this 上下文和参数传递**
  → 实现中使用 `apply(context, args)` 确保正确绑定调用者和传参。

* **误区三：防抖和节流混淆**
  → 节流是固定时间段内执行一次；防抖是触发结束后延迟执行。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-92/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-94/index.md" >}}) →
