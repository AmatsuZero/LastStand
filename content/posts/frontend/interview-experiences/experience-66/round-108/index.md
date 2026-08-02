+++
title = "腾讯-CSIG一校招 · 第 1 轮 · 第一轮"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "第一轮", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/66"
experienceId = 66
roundId = 108
roundOrder = 1
company = "腾讯"
date = "2025-07-28T14:52:54.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-66/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-66/round-109/index.md" >}}) →

**本轮概述：** 一面主要考察前端基础，难度不大。

**面试时间：** 90分钟

**本轮要点：** 基础概念理解深入，能够解释原理和应用场景

代码实现思路清晰，考虑边界情况和性能优化

对前端技术栈有系统性认知，了解技术发展趋势

具备解决实际问题的能力和工程化思维

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. 为什么选择前端 {#question-subjective-9d0178e8aef9}

### 题目要点

作为校招生，回答"为什么选择前端"时要避免空喊"热爱"或跟风，建议用**具体经历+能力匹配+行业洞察**的三段式结构，既体现思考深度又展示成长潜力。

<details>
<summary>参考答案</summary>

以下是分场景的高分回答模板：

---

### **版本一：技术驱动型（适合有项目经历的同学）**
> "选择前端源于两次关键经历：<br>
> 1. **大一用Vue重构学院官网**时，发现通过组件化开发能将设计稿像素级还原，这种'所见即所得'的即时反馈让我着迷；<br>
> 2. **在实习中做低代码平台**时，用React+D3.js实现拖拽生成图表，体会到前端不仅是实现UI，更是连接用户与数据的桥梁。<br>
> 前端技术迭代快（如WebAssembly、微前端）的特点，恰好匹配我热衷通过技术解决实际问题的性格。贵司的XX业务（如电商/数据可视化）对交互体验要求极高，我的XX项目经验（举例）能快速落地。"

---

### **版本二：用户导向型（适合非科班转行的同学）**
> "虽然我是工业设计专业，但**大三时用Figma做APP原型**时，发现静态设计无法验证用户真实体验。于是自学Three.js做了3D产品展示页，通过A/B测试发现3D交互使用户停留时长提升40%。这让我意识到：前端是设计落地的'最后一公里'。<br>
> 前端独有的**'技术+设计+心理学'交叉属性**（如用Framer-motion设计微交互引导用户操作），让我能用代码延续设计价值。贵司注重用户体验（如引用官网案例），我的设计背景+代码能力能提供差异化视角。"

---

### **版本三：行业趋势型（适合技术视野广的同学）**
> "选择前端是因为它是**最接近技术变革一线**的领域：<br>
> - **云原生时代**：前端从浏览器扩展到全端（如Electron桌面应用、小程序）；<br>
> - **AI赋能**：WebGL+TF.js让前端直接运行AI模型（如实时人脸检测）；<br>
> - **IoT场景**：前端技术控制智能家居（如用WebSerial协议与硬件通信）。<br>
> 我在**开源项目参与过WebRTC实时互动功能开发**，体会到前端工程师正在定义下一代人机交互标准。贵司的XX业务（如智能硬件/元宇宙）正处于这些趋势的交汇点，我的XX技能（如WebGL/跨端开发）能直接贡献。"

---

### **避坑提示**
1. **不要只说"喜欢 visible 的结果"**：改为**"享受从像素级还原到性能优化的全链路挑战"**（体现技术深度）。<br>
2. **避免"前端简单"的刻板印象**：改为**"前端是工程复杂度最高的领域之一，需同时处理兼容性、状态管理、性能优化多端适配"**（展示认知）。<br>
3. **关联公司业务**：提前研究官网/技术博客，比如："注意到贵司用Next.js重构了主站，我对其中SSG/ISR的SEO优化策略很感兴趣"（体现调研）。

---

最后，用**成长型结尾**强化潜力："作为校招生，我清楚自己缺乏高并发场景经验，但已系统学习Chrome DevTools性能分析，并模拟过百万级PV的SSR优化（举例），期待在贵司的实际业务中深化这些能力。"

</details>

## 2. 框架理解 - Nest.js设计思想 {#question-subjective-6610c0a2f308}

### 题目要点

分层架构、功能增强、多种设计模式应用

<details>
<summary>参考答案</summary>

Nest.js基于Express或Fastify进行封装，采用分层架构设计。底层HTTP服务器提供基础的请求处理能力，Nest.js在此基础上添加了依赖注入、装饰器、模块化等企业级特性。这确实类似装饰器模式，每一层都在不改变核心功能的前提下增强框架能力。

除了装饰器模式，还了解观察者模式（发布-订阅），常用于事件系统和状态管理；工厂模式，用于创建不同类型的对象实例；单例模式，确保全局唯一实例等。

</details>

## 3. 闭包概念和产生原因 {#question-subjective-fff5f90bab8c}

### 题目要点

词法作用域、变量访问权限、执行环境保持

<details>
<summary>参考答案</summary>

闭包是指函数能够访问其外部作用域变量的特性。产生闭包的原因是JavaScript的词法作用域机制，函数在定义时就确定了可访问的变量范围，即使在其他执行环境中调用也能保持这种访问能力。

```js
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

</details>

## 4. 闭包内存问题及解决方案 {#question-subjective-b79de4be96a2}

### 题目要点

引用保持、垃圾回收阻塞、手动清理、变量提取

<details>
<summary>参考答案</summary>

闭包可能导致内存泄漏，因为外部函数的变量会被内部函数持续引用，无法被垃圾回收机制清理。

解决方法包括：

- 手动断开引用，将闭包变量设置为null
- 避免在闭包中引用大型对象，只提取需要的值
- 在不需要时及时清理事件监听器和定时器

```js
// 问题示例
function createProblem() {
  const largeData = new Array(1000000).fill('data');
  return function() {
    console.log('called');
  };
}

// 解决方案
function createOptimized() {
  const largeData = new Array(1000000).fill('data');
  const dataLength = largeData.length; // 只保留需要的值

  return function() {
    console.log('length:', dataLength);
  };
}
```

</details>

## 5. Promise解决的问题及回调转换 {#question-subjective-d99d30161fa5}

### 题目要点

链式调用、错误处理统一、代码可读性提升

<details>
<summary>参考答案</summary>

一、Promise 到底解决了什么？
1. 回调地狱（Callback Hell）<br>
   多层异步嵌套 → 代码横向增长、错误处理散落在不同层级，后期根本改不动。

2. 信任问题（Inversion of Control）<br>
   把回调交给第三方库，你不知道它会不会：<br>
   • 调用多次<br>
   • 同步/异步调用顺序不确定<br>
   • 吞掉异常<br>
   Promise 把“控制权”从对方手里夺回来，由引擎统一调度。

3. 组合与流程控制困难<br>
   想并行两个异步任务后统一处理？用回调得自己计数；想串行、竞争、容错？都得手写状态机。<br>
   Promise.all / race / any 直接搞定。

4. 错误堆栈断裂<br>
   回调里的错误只能看到当前这一帧，Promise 会保留整条链路上的堆栈，方便调试。

------------------------------------------------
二、回调 → Promise 的三步改造套路

以 Node.js 经典的 `fs.readFile` 为例：

```js
// 1. 最原始的回调写法
fs.readFile('a.txt', 'utf8', (err, dataA) => {
  if (err) return console.error(err);
  fs.readFile('b.txt', 'utf8', (err, dataB) => {
    if (err) return console.error(err);
    console.log(dataA + dataB);
  });
});
```

步骤 1：先把“回调函数”包装成一个返回 Promise 的函数
```js
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);   // Node 自带 util.promisify
// 如果环境没有 promisify，手写也不复杂：
// const readFileAsync = (...args) =>
//   new Promise((resolve, reject) =>
//     fs.readFile(...args, (err, data) => (err ? reject(err) : resolve(data)))
//   );
```

步骤 2：用 `.then` 链式调用（替代嵌套）
```js
readFileAsync('a.txt', 'utf8')
  .then(dataA => readFileAsync('b.txt', 'utf8')
    .then(dataB => dataA + dataB))
  .then(result => console.log(result))
  .catch(console.error);
```

步骤 3：再用 `async/await` 语法糖，彻底消灭 `.then`
```js
(async () => {
  try {
    const [dataA, dataB] = await Promise.all([
      readFileAsync('a.txt', 'utf8'),
      readFileAsync('b.txt', 'utf8')
    ]);
    console.log(dataA + dataB);
  } catch (err) {
    console.error(err);
  }
})();
```

------------------------------------------------
三、小结（面试一句话版）
“Promise 通过链式调用把横向金字塔拉直，用统一的状态机保证只决议一次，再搭配 all/race 等组合子把流程控制‘声明式’化；实际落地时，把 Node 回调函数 promisify 一下，就能直接用 async/await 写出同步风格的异步代码，彻底告别回调地狱。”

</details>

## 6. 浏览器事件循 {#question-subjective-a5de890d88bc}

### 题目要点

浏览器事件循环一句话：<br>
**“浏览器用单线程的 Event Loop 不断把宏任务→微任务→渲染→下一轮，以此调度所有异步工作。”**

答题要点（4 个关键词，背下来就能答）：<br>
1. 单线程：JS 引擎主线程唯一。<br>
2. 任务队列：<br>
   • 宏任务（script、setTimeout、I/O…）<br>
   • 微任务（Promise.then、queueMicrotask、MutationObserver…）<br>
3. 执行顺序：每轮先清空一个宏任务 → 再清空所有微任务 → 必要的话渲染。<br>
4. 循环：重复以上步骤直到队列为空。

<details>
<summary>参考答案</summary>

JavaScript本身是单线程，也就是同一时刻只能干一件事，JS任务包含了同步任务和异步任务，遇到执行函数会将其放入调用栈(先进后出)中，遇到setTimeout/setInterval等异步任务时，会把它放入到消息队列中，等主线程的任务执行完成以后，再回过头执行消息队列中的异步任务，如果异步任务中仍然有异步任务，会继续放入消息队列，以此类推，便形成了一个事件循环。

异步任务：setTimeoutsetInterval异步任务又分为宏任务和微任务，promise就属于微任务.

</details>

## 7. 回流和重绘 {#question-subjective-fd89f477d72b}

### 题目要点

几何属性变化、批量更新、Virtual DOM优化

<details>
<summary>参考答案</summary>

回流（reflow）发生在元素几何属性改变时，需要重新计算布局；重绘（repaint）发生在样式属性改变但不影响布局时。

触发回流的操作：修改元素尺寸、位置、添加删除元素等。
触发重绘的操作：修改颜色、背景等视觉属性。

减少方法：

- 批量修改DOM
- 使用CSS类替代逐个样式修改
- 使用文档片段
- React通过Virtual DOM将多次操作合并为一次批量更新

</details>

## 8. React Virtual DOM 和 Fiber {#question-subjective-9837abe9d7c6}

### 题目要点

虚拟表示、差异对比、时间切片、任务调度

<details>
<summary>参考答案</summary>

Virtual DOM是React用JavaScript对象描述真实DOM结构的技术。通过对比新旧Virtual DOM树的差异（diff算法），只更新变化的部分，提高渲染效率。

Fiber是React 16引入的新协调算法，主要特性：

- 时间切片：将渲染工作分割成小块，避免长时间阻塞主线程
- 优先级调度：高优先级任务可以中断低优先级任务
- 可中断渲染：支持任务暂停和恢复

</details>

## 9. useLayoutEffect vs useEffect {#question-subjective-07b9b196578e}

### 题目要点

执行时机差异、同步异步、依赖数组控制、清理函数

<details>
<summary>参考答案</summary>

useLayoutEffect在DOM变更后同步执行，会阻塞浏览器绘制；useEffect在渲染完成后异步执行，不阻塞绘制。

生命周期模拟：

```js
// componentDidMount
useEffect(() => {
  console.log('mounted');
}, []);

// componentDidUpdate
useEffect(() => {
  console.log('count updated');
}, [count]);

// componentWillUnmount
useEffect(() => {
  return () => {
    console.log('cleanup');
  };
}, []);
```

</details>

## 10. HTTP版本差异 {#question-subjective-01c9b7316d8a}

### 题目要点

连接复用、传输效率、协议演进、性能优化

<details>
<summary>参考答案</summary>

**HTTP/1.1**：引入持久连接、管道化、缓存控制机制
**HTTP/2**：多路复用、服务器推送、头部压缩、二进制协议
**HTTP/3**：基于QUIC协议、UDP传输、连接迁移、更低延迟

主要改进方向是提高传输效率、减少延迟、增强安全性。

</details>

## 11. 手写throttle {#question-subjective-9ec1b0e46c40}

### 题目要点

时间间隔控制、立即执行、延迟执行、上下文保持

<details>
<summary>参考答案</summary>

```js
function throttle(func, delay) {
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      // 立即执行
      func.apply(this, args);
      lastTime = now;
    } else {
      // 延迟执行最后一次
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
        lastTime = Date.now();
      }, delay - (now - lastTime));
    }
  };
}
```

</details>

## 12. BST中第K大值 {#question-subjective-a102635feea9}

### 题目要点

中序遍历逆序、计数控制、BST性质利用、递归终止条件

<details>
<summary>参考答案</summary>

```js
function kthLargest(root, k) {
  let count = 0;
  let result = 0;

  function inorderReverse(node) {
    if (!node || count >= k) return;

    // 先遍历右子树（较大值）
    inorderReverse(node.right);

    // 访问当前节点
    count++;
    if (count === k) {
      result = node.val;
      return;
    }

    // 再遍历左子树（较小值）
    inorderReverse(node.left);
  }

  inorderReverse(root);
  return result;
}
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-66/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-66/round-109/index.md" >}}) →
