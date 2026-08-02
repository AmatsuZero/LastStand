+++
title = "字节-社招-1年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/51"
experienceId = 51
roundId = 73
roundOrder = 1
company = "字节跳动"
date = "2025-07-25T08:13:19.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-51/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 事件冒泡、事件捕获、事件委托、浏览器的缓存机制、组件通信、异步组件

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 实现数组里的拍平 数组本身的拍平 {#question-subjective-0fc964866a11}

### 题目要点

* 递归遍历数组并合并结果。

* 判断元素类型是否为数组。

* 结合ES6 flat方法提升效率。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解递归与数组操作<br>
考察候选人对递归处理嵌套数据结构的能力。

#### ● 掌握ES6及新特性（如flat）<br>
能结合不同方案解决扁平化问题。

---

### 参考答案

```javascript
/**
 * 递归实现数组拍平
 * @param {Array} arr - 待拍平数组，可能嵌套多层
 * @returns {Array} - 扁平后的数组
 */
function flatten(arr) {
  let result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result = result.concat(flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}
````

或者使用ES6内置方法（只拍平一层）：

```javascript
const flatOnce = arr => arr.flat();
```

ES2019+ 支持深度拍平：

```javascript
const flatDeep = (arr, depth = Infinity) => arr.flat(depth);
```

---

### 代码说明

* 递归遍历数组元素，遇到数组继续递归，遇到普通元素则直接放入结果数组。

* 充分利用内置flat方法简化代码，注意flat默认只拍平一层，需传递depth参数。

---

### 常见误区或面试陷阱

* 只处理一层嵌套，未考虑多层嵌套。

* 递归终止条件遗漏，导致死循环。

* 误用concat导致性能不佳。

</details>

## 2. 实现事件中心 EventEmitter，包括 on emit once 方法 {#question-subjective-2b8ca9c8138d}

### 题目要点

* 事件存储结构设计。

* on/once/emit/off方法逻辑。

* 防止回调修改监听数组带来的遍历问题。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解事件发布-订阅模式（Pub/Sub）<br>
考察候选人对异步事件机制的掌握。

#### ● 掌握JavaScript函数和数据结构的使用<br>
测试对回调管理、事件监听的实现能力。

---

### 参考答案

```javascript
class EventEmitter {
  constructor() {
    // 存储事件名与对应回调函数数组
    this.events = {};
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名
   * @param {Function} listener - 回调函数
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /**
   * 订阅只触发一次的事件
   * @param {string} event - 事件名
   * @param {Function} listener - 回调函数
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper); // 触发后移除监听
    };
    this.on(event, onceWrapper);
  }

  /**
   * 触发事件
   * @param {string} event - 事件名
   * @param  {...any} args - 传递给回调的参数
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    // 复制数组避免回调中修改原数组导致遍历异常
    const listeners = [...this.events[event]];
    listeners.forEach(listener => listener.apply(this, args));
  }

  /**
   * 取消订阅事件
   * @param {string} event - 事件名
   * @param {Function} listener - 要移除的回调函数
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(fn => fn !== listener);
  }
}
````

---

### 代码说明

* `on` 方法添加事件监听回调。

* `once` 方法包装回调，执行一次后自动移除。

* `emit` 方法触发事件，调用所有注册回调。

* `off` 方法支持移除指定事件的回调。

* 使用数组存储多监听，调用时复制数组避免回调内移除导致遍历问题。

---

### 常见误区或面试陷阱

* `once` 未正确移除监听，导致多次调用。

* `emit` 触发时直接遍历原数组，回调中修改监听列表引发异常。

* 忘记实现`off`，无法取消订阅。

</details>

## 3. 说一下对地图和 ECharts 这块业务场景上存在的理解 {#question-subjective-e915ef7e07f1}

### 题目要点

- 地图业务展示、交互及实时性需求。

- ECharts多样图表及联动交互。

- 地图与ECharts结合的综合应用。

- 性能和用户体验的平衡。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解地图和数据可视化（ECharts）在业务中的应用价值<br>
考察候选人对业务需求与技术实现的结合能力。

#### ● 掌握地图和图表展示的典型应用场景<br>
能结合实际业务说出使用场景和关键要点。

#### ● 关注性能优化与用户体验设计

---

### 参考答案

#### 1. 地图业务场景理解

- **地理信息展示**<br>
  通过地图展示地理位置、区域分布、路线导航等，比如门店位置、物流路径。

- **数据叠加与分析**<br>
  地图上叠加热力图、标注、区域统计数据，辅助用户洞察地理相关业务数据。

- **交互需求**<br>
  支持缩放、拖拽、点击、悬浮提示等交互，提升数据探索能力。

- **实时数据可视化**<br>
  例如车辆轨迹、事件报警、人员定位等，要求地图实时刷新和高性能渲染。

- **多图层叠加**<br>
  结合底图、业务图层和控件，灵活展示多维信息。

---

#### 2. ECharts业务场景理解

- **多样化图表展示**<br>
  折线图、柱状图、饼图、散点图、关系图等满足不同数据形态的需求。

- **大数据量可视化**<br>
  支持海量数据展现，辅助业务分析和决策。

- **联动和交互分析**<br>
  图表间联动、数据钻取、筛选等提升用户交互体验。

- **主题和样式定制**<br>
  根据业务品牌定制主题风格，保证视觉一致性。

- **移动端和多平台支持**<br>
  兼容多设备，保证响应式布局和性能。

---

#### 3. 结合地图和ECharts的综合应用

- **地理+业务数据可视化**<br>
  地图叠加ECharts图表，如地理热力图、区域业务统计图等。

- **动态数据展示**<br>
  实时更新地图和图表，展示业务动态变化。

- **性能挑战**<br>
  大量点位渲染、复杂交互需合理分层、懒加载、虚拟化等优化手段。

- **数据准确性和一致性**<br>
  保证地图数据与图表数据同步，避免信息误导。

---

### 常见误区或面试陷阱

- 忽略地图与业务数据的结合，导致展示内容空洞。

- 过度渲染所有数据点，造成性能瓶颈。

- 交互设计单一，用户体验差。

- 数据和地图坐标系不匹配，导致展示错误。

</details>

## 4. 按需加载处理撒点 说一下优化前痛点是什么 优化后效果怎么样 {#question-subjective-9c77bba691c5}

### 题目要点

- 大量数据一次加载导致卡顿和内存压力。

- 按需按视口区域加载和懒加载技术。

- 渲染性能优化（聚合、虚拟化）。

- 网络请求优化和用户体验提升。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解按需加载技术的应用背景与必要性<br>
考察候选人对前端性能优化和数据加载策略的理解。

#### ● 分析优化前的痛点与挑战<br>
测试对性能瓶颈和用户体验问题的洞察。

#### ● 明确优化后带来的效果和提升

---

### 参考答案

#### 1. 优化前痛点

- **大量撒点一次性加载**<br>
  地图或图表上需要展示海量数据点，全部一次性加载导致页面卡顿，渲染时间长。

- **网络请求负担重**<br>
  一次拉取大量数据，网络响应慢，用户等待时间长，体验差。

- **浏览器内存压力大**<br>
  过多 DOM 或 Canvas 元素占用大量内存，容易导致页面崩溃。

- **交互响应迟缓**<br>
  滚动、缩放等操作卡顿，交互体验不好。

- **资源浪费严重**<br>
  用户视口外的数据无意义加载，浪费带宽和计算资源。

---

#### 2. 优化后效果

- **分区域按需加载**<br>
  根据当前视口和缩放级别，只加载可见范围内的点，大幅减少加载和渲染数量。

- **网络请求分批和懒加载**<br>
  分页或动态请求数据，缩短响应时间，减轻服务器压力。

- **渲染性能提升**<br>
  通过虚拟化、聚合（Cluster）等技术减少渲染元素，保持流畅。

- **用户体验改善**<br>
  页面响应更快，操作流畅，用户感知明显提升。

- **节省内存和带宽资源**<br>
  只处理必需数据，降低浏览器负担和网络成本。

---

### 常见误区或面试陷阱

- 误以为按需加载只是简单的分页加载，忽略视口感知和缩放适配。

- 未结合业务需求设计合理的加载策略，导致加载逻辑复杂且无效。

- 忽略加载状态反馈，用户操作无响应导致体验差。

</details>

## 5. 函数式弹窗 从 pinia 角度来讲 从状态分级上的完成上做了什么？函数式弹窗发散 在当前的场景下除了这种优化方案 还有哪些优化方案 {#question-subjective-e9a12ddd142c}

### 题目要点

略

<details>
<summary>参考答案</summary>

问题不是太清晰

</details>

## 6. 结合实际项目，问了几个地图相关的问题，如下： {#question-subjective-0a12c2391b24}

- 获取撒点位置为什么不是 getBoundingClinRect 而是百度地图 API 的 getBound()
- 按需加载是在撒点这里实现的 那这个优化前优化后有哪些指标反映了什么效果吗
- 地图大量数据进行撒点 原本是想把这个渲染速度和效率变得更高 但现在走 worker 可能要等待这个结果 反而更慢了 需要怎么处理
- 地图撒点：菜单栏是通过循环遍历 监听的是什么 详细讲解一下 为什么这么做
- 三级菜单栏管理是通过循环遍历进行查找的 那么如何优化

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 7. Web Worker 的多线程是如何实现的 {#question-subjective-c6cb370b86d5}

### 题目要点

线程隔离 / 消息通信机制 / 不可访问 DOM / 场景适配 / 使用方式与限制

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 Web Worker 的工作机制<br>
确认候选人是否理解 Worker 如何与主线程协同工作。

#### ● 理解浏览器中“多线程”的真实含义<br>
区别 JavaScript 单线程模型与 Web Worker 实现的并发原理。

#### ● 掌握 Web Worker 的使用场景与限制

---

### 参考答案

### 1. 原理说明

#### 1.1 为什么需要 Web Worker

- JavaScript 是单线程运行的语言。
- 如果执行复杂计算或大任务，容易阻塞 UI 渲染线程，导致页面卡顿。
- Web Worker 提供一种将计算任务**转移到主线程之外**的机制，从而实现“伪多线程”执行，提升性能和响应性。

#### 1.2 Web Worker 多线程的本质

- 浏览器在底层实现了**主线程与 Worker 线程的隔离**，它们运行在**不同的线程上下文**中。
- 主线程和 Worker 线程**无法共享变量或内存空间**，只能通过**消息传递（postMessage）+ 序列化（结构化克隆）**进行通信。
- 浏览器负责调度和生命周期管理 Worker。

#### 1.3 通信机制

```js
// 主线程代码
const worker = new Worker('worker.js');

worker.postMessage({ type: 'start', data: 100000 });

worker.onmessage = (e) => {
  console.log('主线程收到结果：', e.data);
};
````

```js
// worker.js 内部代码
onmessage = function(e) {
  const result = heavyCompute(e.data.data);
  postMessage(result);
};

function heavyCompute(n) {
  // 模拟耗时任务
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}
```

---

### 2. 使用场景

* **大计算量任务**：如复杂数学计算、图像处理、音频解码等。
* **数据处理任务**：如大规模 JSON 解析、压缩/加密处理。
* **避免主线程卡顿**：保持 UI 流畅运行。
* **WebSocket 或 SSE 的数据预处理**。

---

### 3. 常见误区与陷阱

* **认为 Web Worker 可以访问 DOM**：错误！Worker 线程无法访问 document、window、alert 等 DOM 相关 API。
* **尝试在主线程和 Worker 之间共享变量或闭包上下文**：错误！只能通过消息传递通信。
* **忽略 Worker 的性能成本**：创建 Worker 是有性能开销的，适用于中长时间任务，不建议大量频繁创建。

---

### 4. 限制与注意点

| 限制项      | 说明                          |
| -------- | --------------------------- |
| 无法访问 DOM | DOM 操作必须由主线程完成              |
| 通信开销     | 数据必须结构化克隆，不能传函数、闭包          |
| 兼容性注意    | 老版本浏览器不支持                   |
| 生命周期管理   | 使用完应调用 `terminate()` 手动释放线程 |

---

### 总结

Web Worker 本质上是浏览器提供的多线程运行机制，通过线程隔离和异步通信方式，让复杂任务从主线程中“卸载”，避免 UI 卡顿。在处理计算密集型任务时是非常实用的优化手段，但也要注意线程通信的成本和适用场景。

</details>

## 8. Web Worker 处理场景有哪些 如果此时有个场景 此时组件要渲染 但是 worker 里面的数据还没有处理完 这时候怎么办 {#question-subjective-0439a9e3b111}

### 题目要点

* Web Worker 适合计算密集 / 数据预处理场景。

* 组件依赖 Worker 数据时，应设计加载状态机制避免渲染错误。

* 使用 loading 状态 / Skeleton / 异步挂载等策略保障用户体验。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 Web Worker 的应用场景和异步特性<br>
确认候选人能合理选择使用 Web Worker 的业务场景。

#### ● 能够处理主线程和 Worker 异步通信之间的协调<br>
分析组件渲染和数据处理之间的“竞态”问题，并提供可用的解决方案。

---

### 参考答案

### 一、Web Worker 的典型应用场景

Web Worker 非常适合处理耗时、计算密集型任务，使这些任务不会阻塞主线程的渲染和交互操作。

#### 1.1 典型场景包括：

- **复杂数学计算**：如图像处理、路径寻优、加解密、排序、机器学习模型前处理等。
- **大体积数据解析/处理**：如大 JSON 数据解析、日志分析、CSV/Excel 解析。
- **音视频编解码处理**：如 WebAssembly + Web Worker 解码视频流。
- **WebSocket / SSE 后台数据处理**：对服务端推送数据进行预处理。
- **游戏或可视化场景中的物理模拟**：如粒子运动、碰撞检测等。

---

### 二、组件渲染早于 Worker 数据处理完成，怎么办？

#### 2.1 典型问题场景：

前端组件进入渲染流程（如表格、图表、地图等），但所依赖的数据仍在 Web Worker 内部处理，尚未通过 `postMessage` 返回。这种“数据未就绪”情况如处理不好，可能会出现以下问题：

- 组件空白或抛错
- UI 频繁闪烁或重新渲染
- 用户误以为页面卡住

---

### 三、解决思路与策略

#### ✅ 方案一：**使用“加载中”状态控制组件渲染**

最常见的方案是引入加载状态标记，在数据尚未就绪时不渲染内容区域。

```ts
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  const worker = new Worker('./worker.js');
  worker.postMessage('load');
  worker.onmessage = (e) => {
    setData(e.data);
    setIsLoading(false); // 数据返回后才渲染内容
  };
}, []);
````

```jsx
return isLoading ? <Spin /> : <Table dataSource={data} />;
```

#### ✅ 方案二：**拆分组件渲染逻辑**

把数据渲染区域封装成独立组件，等数据准备好再挂载，避免父组件反复触发更新或进入错误状态。

```jsx
return (
  <>
    <Header />
    {isReady && <ChartComponent data={data} />}
  </>
);
```

#### ✅ 方案三：**用占位符 + Skeleton 提升用户感知**

在数据加载期间显示骨架屏或默认数据，避免用户看到空白页面，提升感知速度。

#### ✅ 方案四：**设置最大等待时间或超时降级方案**

如果 Worker 处理超时或异常无响应，应有兜底机制避免卡死，例如 fallback UI 或提示“加载失败，请刷新重试”。

---

### 四、常见误区

* ❌ 将 Worker 的异步处理结果直接同步渲染（例如在 `postMessage` 后立刻使用数据），忽略异步特性。
* ❌ 忽略 loading 状态，导致组件空渲染或异常报错。
* ❌ 多次重复 new Worker 没有释放，造成内存泄漏。

</details>

## 9. 异步组件是如何使用的 {#question-subjective-9637baa057d1}

### 题目要点

* 动态 import 实现按需加载
* Vue：`defineAsyncComponent`，支持 loading / error 状态
* React：`React.lazy` + `Suspense`
* 合理场景：路由懒加载 / 弹窗组件 / 大组件延迟加载

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握前端组件的懒加载机制<br>
确认候选人是否理解异步组件在性能优化中的作用。

#### ● 理解异步组件的定义方式与使用流程<br>
包括语法、加载状态处理和错误处理。

#### ● 掌握框架（如 Vue / React）中的具体实现方式和场景

---

### 参考答案

### 一、异步组件的核心原理

异步组件（Async Component）是指**在运行时按需动态加载的组件**，只有当组件真正被需要时，才去加载其代码资源。

本质是通过 **代码分割（Code Splitting）+ 动态导入（`import()`）**，实现延迟加载，减小初始包体积，提升首屏性能。

---

### 二、Vue 中异步组件的使用

#### 2.1 基本写法（Vue 2 / Vue 3）

```js
// Vue 2 异步组件
Vue.component('MyAsyncComponent', () => import('./MyComponent.vue'));
````

```js
// Vue 3 setup 中或局部引入
import { defineAsyncComponent } from 'vue';

const MyAsyncComponent = defineAsyncComponent(() =>
  import('./MyComponent.vue')
);
```

#### 2.2 带 loading / error 状态处理

```js
const MyAsyncComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorFallback,
  delay: 200,
  timeout: 3000
});
```

* `delay`：多少毫秒后显示 loading 组件
* `timeout`：超时时间，超过则显示 errorComponent

#### 2.3 使用方式

```html
<template>
  <Suspense>
    <MyAsyncComponent />
  </Suspense>
</template>
```

---

### 三、React 中异步组件的使用（React.lazy + Suspense）

```js
import React, { lazy, Suspense } from 'react';

const MyAsyncComponent = lazy(() => import('./MyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyAsyncComponent />
    </Suspense>
  );
}
```

---

### 四、适用场景

* **路由懒加载**：如 Vue Router / React Router 中按路由拆分组件。
* **弹窗 / Tab 页**：仅在用户打开时再加载内容，节省资源。
* **可视区域内懒加载**：结合 `IntersectionObserver` 只在进入视口时加载。
* **大体积组件或三方库**：如 ECharts、MonacoEditor 等，不在首屏中加载。

---

### 五、常见误区

* ❌ 忽略错误处理，导致组件加载失败时页面空白。
* ❌ 所有组件都异步加载，反而增加切换延迟。
* ❌ 忘记在 React 中用 `<Suspense>` 包裹 lazy 组件。

</details>

## 10. 判断数据类型的方式 {#question-subjective-ab6c37de9f7f}

### 题目要点

* 类型判断常用 4 种方式：`typeof` / `toString.call` / `instanceof` / `Array.isArray`
* 根据不同需求选择最合适的方法
* 避免误用 `typeof null` / `instanceof` 跨环境失效等陷阱

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 JavaScript 中各种类型的本质与分类<br>
确认候选人是否清楚基本类型、引用类型及特殊对象类型的判断方式。

#### ● 掌握常见的类型判断方法及其适用场景<br>
能够根据不同需求选择最合适的判断方式。

---

### 参考答案

### 一、数据类型分类回顾

JavaScript 中的值主要分为两大类：

- **原始类型（Primitive Types）**：`string`、`number`、`boolean`、`undefined`、`null`、`symbol`、`bigint`
- **引用类型（Reference Types）**：`object`（数组、函数、正则、日期等）

---

### 二、常见的类型判断方式

#### 1. `typeof` —— 基本类型判断首选

```js
typeof 123            // "number"
typeof 'abc'          // "string"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof Symbol()       // "symbol"
typeof 123n           // "bigint"
typeof null           // ⚠️ "object"（历史遗留 Bug）
typeof []             // "object"
typeof function(){}   // "function"
````

✅ 适用于：判断原始类型、函数
❌ 缺点：数组、null、对象都返回 "object"，不够精准。

---

#### 2. `Object.prototype.toString.call()` —— 最精确

```js
Object.prototype.toString.call([])          // "[object Array]"
Object.prototype.toString.call({})          // "[object Object]"
Object.prototype.toString.call(null)        // "[object Null]"
Object.prototype.toString.call(undefined)   // "[object Undefined]"
Object.prototype.toString.call(123)         // "[object Number]"
Object.prototype.toString.call(/abc/)       // "[object RegExp]"
Object.prototype.toString.call(new Date())  // "[object Date]"
```

✅ 适用于：精确区分各种内置对象和基本类型
✅ 能判断特殊对象如 `RegExp`、`Date`、`Error`、`Map`、`Set` 等
❌ 缺点：语法稍长，不如 `typeof` 简洁。

---

#### 3. `instanceof` —— 判断对象实例关系

```js
[] instanceof Array         // true
{} instanceof Object        // true
new Date() instanceof Date  // true
null instanceof Object      // false
```

✅ 适用于：判断引用类型之间的继承关系
❌ 缺点：

* 无法判断原始类型
* 只能判断当前环境下同一个构造函数的实例（跨 iframe 失败）

---

#### 4. `Array.isArray()` —— 判断是否为数组

```js
Array.isArray([])           // true
Array.isArray({})           // false
```

✅ 推荐判断数组，不受原型污染影响。

---

#### 5. `constructor` 属性判断（不推荐）

```js
(123).constructor === Number     // true
"abc".constructor === String     // true
([]).constructor === Array       // true
```

❌ 不推荐：constructor 可被篡改，不安全。

---

### 三、实践建议与常见误区

| 需求        | 推荐方法                               |
| --------- | ---------------------------------- |
| 判断基本类型    | `typeof`                           |
| 判断是否数组    | `Array.isArray()`                  |
| 精准判断任意类型  | `Object.prototype.toString.call()` |
| 判断对象原型链关系 | `instanceof`                       |

#### 常见误区：

* `typeof null` 返回 "object"，需单独处理
* `typeof []` 返回 "object"，无法识别数组
* `instanceof` 在 iframe 跨域中会失效

</details>

## 11. vue 中组件通信 {#question-subjective-be84045917b2}

### 题目要点

* 掌握父子、兄弟、跨层级、全局通信的不同手段
* 知道各方式的优劣和使用限制
* Vue 2 和 Vue 3 在组件通信上的异同点

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 Vue 各类组件通信方式及其适用场景<br>
确认候选人能根据组件间的关系选择合理通信方案。

#### ● 理解 Props、事件、自定义事件、状态管理等机制背后的原理<br>
避免滥用或错误使用通信方式。

---

### 参考答案

### 一、父子组件通信

#### 1.1 父传子：`props`

父组件通过 props 向子组件传递数据。

```vue
<!-- 父组件 -->
<Child :title="pageTitle" />

<!-- 子组件 -->
props: ['title']
````

* **特点**：单向数据流，子组件不可修改 props（违背会报错）
* **适用场景**：传递静态值、配置信息等

#### 1.2 子传父：`$emit` 事件机制

子组件通过 `$emit` 触发事件，将数据传回父组件。

```vue
// 子组件
this.$emit('update-title', '新标题');

// 父组件
<Child @update-title="handleUpdate" />
```

---

### 二、兄弟组件通信

#### 2.1 使用中央事件总线（Vue 2）

在 Vue 2 中，可以通过一个空的 Vue 实例作为事件中心（EventBus）。

```js
// event-bus.js
export const EventBus = new Vue();

// A组件
EventBus.$emit('update', data);

// B组件
EventBus.$on('update', handler);
```

* ⚠️ Vue3 已不推荐该方式，建议使用状态管理或组合式 API。

#### 2.2 使用父组件中转

如果兄弟组件有共同的父组件，也可以通过 props 和事件实现中转。

---

### 三、跨级组件通信

#### 3.1 `provide / inject`

祖先组件通过 `provide` 提供数据，后代组件通过 `inject` 注入使用。

```js
// 祖先组件
provide() {
  return { theme: 'dark' };
}

// 后代组件
inject: ['theme']
```

* **优点**：避免 props 层层传递
* **缺点**：非响应式（Vue 3 中可以用 `ref` 或 `reactive` 提升响应能力）

---

### 四、全局状态管理通信

#### 4.1 使用 Vuex（Vue 2）或 Pinia（Vue 3 推荐）

通过全局状态管理器统一管理跨组件状态。

```js
// Vuex 示例
this.$store.state.count;
this.$store.commit('increment');

// Pinia 示例
const store = useCounterStore();
store.count++;
```

* **优点**：状态集中、结构清晰，适合中大型项目
* **缺点**：引入成本较高，小项目可能冗余

---

### 五、`ref` 与 `parent / $children`

#### 5.1 `ref` 访问子组件方法

```vue
<Child ref="childRef" />
this.$refs.childRef.someMethod();
```

* **适用场景**：调用子组件暴露的方法，不推荐频繁操作子组件状态。

#### 5.2 `$parent` / `$children` 获取父组件或所有子组件引用

* 不推荐依赖，耦合度高，难维护。

---

### 六、Vue 3 新特性：`defineExpose` + `script setup`

Vue 3 中可以通过 `defineExpose` 向父组件暴露方法。

```vue
<!-- 子组件 -->
<script setup>
function doSomething() {}
defineExpose({ doSomething });
</script>

<!-- 父组件 -->
<Child ref="child" />
child.value.doSomething();
```

---

### 总结

| 通信方式               | 适用场景        | Vue版本建议                  |
| ------------------ | ----------- | ------------------------ |
| props / emit       | 父子组件通信      | Vue2 / Vue3 通用           |
| EventBus           | 简单跨组件通信     | Vue2，Vue3 不推荐            |
| provide / inject   | 跨层级但结构清晰场景  | Vue2 / Vue3 通用           |
| Vuex / Pinia       | 全局状态共享，大型项目 | Vue2(Vuex) / Vue3(Pinia) |
| ref / defineExpose | 调用组件方法      | Vue3 推荐使用                |

</details>

## 12. provide 和 inject 实现多级传递的原理 {#question-subjective-db1d84e7831a}

### 题目要点

* `provide/inject` 利用组件实例间原型链传递实现多级共享
* Vue 2 默认不响应式，Vue 3 可结合 `ref`/`reactive`
* 不适合频繁变动的数据通信，只适用于配置型场景

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 Vue 组件树上下文传递机制<br>
确认候选人是否理解 `provide/inject` 背后的依赖注入原理。

#### ● 掌握 Vue 响应式系统与组件间通信机制<br>
判断是否理解为什么 `provide/inject` 可以实现跨层级通信，及其限制。

---

### 参考答案

### 一、provide/inject 的作用和使用方式

`provide` 和 `inject` 是 Vue 提供的一种**依赖注入机制**，允许**祖先组件向其后代组件传递数据**，而无需层层通过 props 传递。

#### 用法示例：

```js
// 祖先组件
export default {
  provide() {
    return {
      theme: 'dark',
      user: this.user // Vue 3 中可配合 reactive/ref
    };
  }
}

// 后代组件
export default {
  inject: ['theme', 'user'],
  mounted() {
    console.log(this.theme); // 'dark'
  }
}
````

---

### 二、原理解释：如何实现多级传递

#### 2.1 provide/inject 是通过组件实例的上下文链实现的

* Vue 中每个组件在初始化时，都会创建一个**组件实例 context**。
* 在组件创建阶段，`provide` 中定义的数据会被保存在该组件实例的 `_provided` 或 `provides` 属性中。
* 所有子组件在创建时，会查找其祖先组件中的 `provides`。

#### 2.2 继承机制是关键

* Vue 会在子组件初始化时，将父组件的 `provides` 作为自己的原型对象：

```js
// 子组件的 provides 会继承自父组件
vm.provides = Object.create(parent.provides);
```

* 这使得即便中间的组件没有显式提供 `inject`，只要祖先组件 `provide` 了，后代组件都能访问。

#### ✅ 这就是 **多级传递的本质：通过原型链进行向上传递查找**

* 注入时，Vue 会从当前组件实例向上查找 `provides` 链，直到找到对应 key。
* 如果找不到，则返回 `undefined` 或使用默认值（如果设置了默认值）。

---

### 三、响应式说明

#### 3.1 Vue 2 中不是响应式的

在 Vue 2 中，`provide` 的数据默认不是响应式的（如果是普通值），因为它不会被 Vue 自动追踪。

#### 3.2 Vue 3 中可以响应式

可以结合 `ref()`、`reactive()` 等方式注入响应式数据：

```js
// Vue 3 中
const user = reactive({ name: 'Alice' });
provide('user', user);

// 后代组件
const user = inject('user');
user.name = 'Bob'; // 自动响应式更新
```

---

### 四、常见误区

* ❌ 以为 provide/inject 是跨组件通信的万能方案，实际上它只适合“配置注入”或“上下文共享”，**不建议用于频繁数据变更传递**。
* ❌ 忽略 Vue 2 中默认非响应式问题，修改 `inject` 的值无法更新视图。
* ❌ 使用 inject 修改数据（虽然可以，但破坏了单向数据流，违背 Vue 设计原则）。

---

### 五、适用场景

| 场景         | 是否推荐                    |
| ---------- | ----------------------- |
| 样式主题（如主题色） | ✅ 推荐                    |
| 表单上下文共享    | ✅ 推荐                    |
| 状态管理替代方案   | ❌ 不推荐（应使用 Vuex / Pinia） |
| 多级组件配置共享   | ✅ 推荐                    |

</details>

## 13. 事件触发机制的原理 {#question-subjective-1fa90c6d61fd}

### 题目要点

* 事件流包括 捕获 → 目标 → 冒泡 三阶段
* 默认事件监听在冒泡阶段，需指定 `{ capture: true }` 参与捕获
* 熟练掌握 `stopPropagation()`、`preventDefault()` 控制事件行为
* 事件委托是性能优化常用技巧
* 理解事件队列和事件循环对 UI 响应的影响

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握浏览器事件模型的基本原理和传播机制<br>
确认候选人理解事件捕获、目标、冒泡各阶段的差异与执行流程。

#### ● 理解事件委托、监听绑定、默认行为等机制<br>
测试对 DOM 编程中常见事件处理技巧的熟练度。

#### ● 能描述浏览器对事件队列的处理顺序

---

### 参考答案

### 一、事件模型基本流程

浏览器采用**事件流（Event Flow）模型**来处理事件触发，主要分为三阶段：

#### 1. 捕获阶段（Capture Phase）

- 事件从 `window` → `document` → 最外层元素 → ... → 目标元素
- 触发顺序是从外到里，但 **默认不会触发监听器**，除非设置 `{ capture: true }`

#### 2. 目标阶段（Target Phase）

- 事件到达目标元素本身，此阶段事件只能在目标元素上触发一次。

#### 3. 冒泡阶段（Bubble Phase）

- 从目标元素开始反向向上传播至 `window`
- 默认事件监听器都会在此阶段执行

---

### 二、事件注册方式与绑定阶段

```js
element.addEventListener('click', handler, false);
// 第三个参数为 false 表示在冒泡阶段触发（默认）
// 为 true 表示在捕获阶段触发
````

* `addEventListener` 支持多个事件绑定，且可控制执行阶段。
* `onclick` 绑定的是冒泡阶段，且每个元素只保留一个。

---

### 三、事件对象的属性与控制方法

* `event.target`：触发事件的**实际元素**
* `event.currentTarget`：当前绑定监听器的元素
* `event.stopPropagation()`：阻止事件向上传播
* `event.stopImmediatePropagation()`：阻止本元素上的后续所有事件监听器执行
* `event.preventDefault()`：阻止浏览器默认行为（如 a 标签跳转）

---

### 四、事件委托机制

\*\*事件委托（Event Delegation）\*\*指：将多个子元素的事件统一交给父元素处理。

#### 原理：

* 利用事件冒泡机制，只绑定一次监听器，提高性能。
* 典型用法：列表、表格、菜单等动态结构。

```js
ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('点击了 li：', e.target.textContent);
  }
});
```

---

### 五、浏览器事件队列与执行顺序

JavaScript 是单线程运行的，事件触发也是放入 **事件队列（task queue）** 中排队执行。

#### 执行机制（基于事件循环）：

* 执行栈为空后，从任务队列中取出任务执行
* 不同事件（click、setTimeout、Promise）被放入不同的任务队列（宏任务、微任务）

---

### 六、常见误区

* ❌ 误以为事件默认只冒泡，其实事件先经历捕获再到冒泡
* ❌ 忘记使用 `stopPropagation()` 导致冒泡干扰其他逻辑
* ❌ 在每个子元素上绑定重复事件，忽视事件委托优化
* ❌ 使用 `event.target` 错误判断点击元素，忽略 `currentTarget` 的区别

---

### 七、适用场景举例

| 场景             | 技术机制               |
| -------------- | ------------------ |
| 表单校验中阻止默认提交行为  | `preventDefault()` |
| 列表点击项统一处理事件    | 事件委托 + 冒泡          |
| 模态框遮罩点击关闭      | 冒泡控制 + 判断 target   |
| 分阶段绑定不同优先级事件处理 | 捕获 + 冒泡结合          |

</details>

## 14. http 的缓存机制 {#question-subjective-7e64ba9aff2a}

### 题目要点

* 缓存机制分为 强缓存（不发请求） 与 协商缓存（发请求判断）
* 控制字段包括 `Cache-Control`、`Expires`、`ETag`、`Last-Modified`
* 区分 `no-store`（完全禁用缓存）与 `no-cache`（强制验证）
* 实际项目中：静态资源建议设置长期缓存 + 文件指纹，接口类资源需动态策略控制

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器缓存的核心原理与流程<br>
确认候选人能区分强缓存与协商缓存，并掌握其控制方式。

#### ● 掌握 HTTP 缓存控制相关 Header 的含义和作用<br>
测试是否能在真实业务中合理配置缓存策略。

#### ● 能清楚不同缓存阶段（内存缓存、磁盘缓存、代理缓存）及其命中机制

---

### 参考答案

### 一、什么是 HTTP 缓存？

HTTP 缓存是指浏览器或中间代理服务器对已请求过的资源进行本地存储，以避免重复请求，从而**减少网络流量、提升访问速度、降低服务端压力**。

---

### 二、HTTP 缓存的两大机制

#### 2.1 强缓存（Strong Cache）

- **特点**：不向服务器发送请求，直接使用缓存。
- **命中条件**：浏览器发现资源仍未过期（基于响应头）

##### 控制 Header：

- `Cache-Control: max-age=xxx`（单位秒）
- `Expires: HTTP 时间格式`

> ✅ 二者都存在时，`Cache-Control` 优先生效。

```http
Cache-Control: max-age=3600
````

➡ 表示资源在 3600 秒内不再请求服务器，直接使用缓存。

#### 2.2 协商缓存（Negotiated Cache）

* **特点**：浏览器发送请求，但会附带条件请求头，服务器判断资源是否修改。
* **命中条件**：服务器判定资源无变化，返回 `304 Not Modified`，浏览器使用缓存。

##### 控制 Header：

* `Last-Modified / If-Modified-Since`
* `ETag / If-None-Match`

```http
ETag: "abc123"
```

➡ 浏览器再次请求时发送 `If-None-Match: "abc123"`，若一致则返回 304。

---

### 三、缓存判定流程图（逻辑顺序）

```text
        ↓ 首次请求资源
        ↓
[ 是否命中强缓存 ] —— 是 → 使用缓存，直接返回
        ↓ 否
[ 发起请求 + 携带协商缓存头 ]
        ↓
[ 服务器判断资源是否修改 ]
        ↓
否 → 返回 304 Not Modified，浏览器使用缓存
是 → 返回 200 + 新资源，更新缓存
```

---

### 四、缓存类型概览

| 类型       | 请求发出 | 是否使用缓存   | 控制字段                        |
| -------- | ---- | -------- | --------------------------- |
| 强缓存      | 否    | ✅        | `Cache-Control` / `Expires` |
| 协商缓存     | 是    | ✅（响应304） | `ETag` / `Last-Modified`    |
| 不使用缓存    | 是    | ❌        | `Cache-Control: no-store`   |
| 强制重新验证缓存 | 是    | 条件使用     | `Cache-Control: no-cache`   |

---

### 五、内存缓存 vs 磁盘缓存

* **内存缓存**：资源保存在浏览器内存中（页面刷新即失效），如运行中 JS/CSS/图片。
* **磁盘缓存**：资源保存在本地硬盘中（支持长期保留），如用户关闭标签页后再次打开。

---

### 六、常见缓存控制策略

#### 6.1 静态资源缓存

* 文件名加 hash + 设置长时间强缓存

```http
Cache-Control: public, max-age=31536000, immutable
```

* 文件名变动自动失效（避免缓存污染）

#### 6.2 接口请求禁止缓存

```http
Cache-Control: no-store
```

* 每次都走服务器，常用于用户相关、动态数据请求。

---

### 七、常见误区

* ❌ 将 `no-cache` 理解为“完全不缓存”，实际上它是“每次都要去服务器确认”。
* ❌ 忘记使用 ETag/Last-Modified 进行协商缓存处理。
* ❌ 文件名 hash 后仍不设置强缓存，浪费性能。
* ❌ 在响应中设置了缓存，但服务端没有正确识别缓存请求头。

</details>

## 15. 缓存过旧 是怎么判断的 {#question-subjective-506ecf99e44e}

### 题目要点

* 强缓存通过 `max-age` 或 `Expires` 判断时间是否过期
* 协商缓存通过 ETag / Last-Modified 和服务端比对是否变化
* “缓存过旧”指缓存文件不再被浏览器信任，需要重新请求服务器验证
* DevTools 可用来观察缓存是否命中和过期状态

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器如何判断缓存是否失效<br>
确认候选人掌握强缓存与协商缓存的命中与失效机制。

#### ● 掌握各类缓存控制字段的含义与比较逻辑<br>
测试是否能根据请求头和响应头分析缓存是否可用。

---

### 参考答案

### 一、缓存“过旧”的判断背景

浏览器收到某个资源请求时，会尝试使用本地缓存以避免重复下载。当缓存存在但**已超过有效期**、或**服务器返回资源已更新**，即视为“缓存过旧”，需要重新拉取新资源。

---

### 二、判断缓存是否“过旧”的两大机制

### 1. 强缓存失效的判断

#### 触发条件：

- 浏览器根据本地缓存文件中的响应头信息判断资源是否过期
- 重点字段：
  - `Cache-Control: max-age=xxx`（单位：秒）
  - `Expires: GMT 时间字符串`

#### 判断逻辑：

```text
当前时间 > 响应时间 + max-age      → 缓存已过期
当前时间 > Expires 时间           → 缓存已过期
````

#### 示例：

```http
// 上一次响应头
Cache-Control: max-age=3600
Date: Thu, 25 Jul 2025 10:00:00 GMT
```

现在时间为 11:10:00 GMT，已经超过 1 小时，缓存被判定为“过旧”。

---

### 2. 协商缓存失效的判断

如果强缓存失效，浏览器会发起请求，同时带上条件头：

* `If-None-Match: xxx`（对比服务器的 `ETag`）
* `If-Modified-Since: 时间戳`（对比服务器的 `Last-Modified`）

#### 服务器处理逻辑：

* 如果资源没变 → 返回 `304 Not Modified`（缓存有效）
* 如果资源已变 → 返回 `200 OK` + 新资源（缓存失效）

#### 示例：

```http
Request Header:
If-None-Match: "abc123"

Response Header:
ETag: "abc456" → 不一致，缓存失效
```

---

### 三、缓存过旧的判断流程总结

```text
1. 浏览器先检查强缓存字段（max-age / Expires）
   → 未过期：直接使用缓存 ✅
   → 过期：进入协商缓存流程

2. 浏览器发送带条件头的请求（ETag / Last-Modified）
   → 服务器判断资源是否变化：
      → 没变 → 返回 304，继续使用缓存 ✅
      → 变了 → 返回 200，新资源替换缓存 ✅
```

---

### 四、缓存是否“过旧”与哪些因素有关？

| 因素                 | 是否影响缓存失效    |
| ------------------ | ----------- |
| max-age 过期         | ✅ 是         |
| 浏览器主动清除缓存          | ✅ 是         |
| ETag 不一致           | ✅ 是         |
| Last-Modified 比对失败 | ✅ 是         |
| 文件名变化              | ✅ 是（被视为新资源） |
| 用户点击强制刷新（Ctrl+F5）  | ✅ 是         |

---

### 五、开发中如何调试缓存是否失效？

#### 打开浏览器 DevTools → Network 面板：

| 状态码                          | 缓存说明      |
| ---------------------------- | --------- |
| 200 (from memory/disk cache) | 强缓存命中     |
| 304 Not Modified             | 协商缓存命中    |
| 200 OK                       | 缓存失效，重新加载 |

</details>

## 16. http1.1 1.0 2.0 三个的字段是怎么判断 {#question-subjective-3fb158bd878f}

### 题目要点

* HTTP 协议版本可从请求响应首行、浏览器 DevTools、curl 输出中判断
* 各版本在连接复用、头部处理、数据格式等方面演进明显
* 实际开发中应能基于协议差异分析性能瓶颈（如队头阻塞、多连接等）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 HTTP 各版本的区别与发展过程<br>
判断候选人是否能清晰描述 HTTP/1.0 → HTTP/1.1 → HTTP/2 的关键演进点。

#### ● 理解实际开发中如何识别和判断所使用的 HTTP 协议版本<br>
是否了解请求报文、响应报文、浏览器开发者工具、协议字段等判断方法。

---

### 参考答案

### 一、如何判断使用的是哪个 HTTP 版本？

#### 方式一：查看请求报文的协议版本（推荐）

使用浏览器 DevTools → Network 面板 → 任意请求 → **Headers → Version / Protocol**

- Chrome、Edge、Firefox 等主流浏览器都支持查看
- 一般会显示：`HTTP/1.0`、`HTTP/1.1` 或 `h2`（表示 HTTP/2）

#### 方式二：查看请求行（request line）或响应行（status line）

HTTP 报文的首行中包含协议版本信息：

```http
// 请求行（Request Line）
GET /index.html HTTP/1.1

// 响应行（Status Line）
HTTP/1.1 200 OK
````

如果你抓包或使用 curl 工具：

```bash
curl -I --http2 https://example.com
```

输出：

```http
HTTP/2 200
```

#### 方式三：命令行工具辅助判断

* 使用 curl：

```bash
curl -I -s -o /dev/null -w '%{http_version}\n' https://example.com
```

输出：

```
2  （代表 HTTP/2）
```

* 使用 Chrome → DevTools → Network 面板 → Protocol 字段

---

### 二、HTTP/1.0 vs HTTP/1.1 vs HTTP/2 字段层面主要区别

| 特性 / 版本  | HTTP/1.0   | HTTP/1.1                          | HTTP/2                |
| -------- | ---------- | --------------------------------- | --------------------- |
| 协议字段标识   | `HTTP/1.0` | `HTTP/1.1`                        | `HTTP/2` or `h2`（二进制） |
| 长连接      | ❌ 每次请求断开   | ✅ 默认开启 `Connection: keep-alive`   | ✅ 多路复用连接              |
| Host 头部  | ❌ 可省略      | ✅ 必须使用 `Host` 字段                  | ✅ 同样需要 Host 字段        |
| 分块传输编码   | ❌ 不支持      | ✅ 支持 `Transfer-Encoding: chunked` | HTTP/2 使用流机制          |
| 多路复用     | ❌ 不支持      | ❌ 不支持（队头阻塞）                       | ✅ 支持多个流并行请求           |
| 请求头压缩    | ❌ 无        | ❌ 无                               | ✅ 使用 HPACK 压缩         |
| 首部字段重复冗余 | ✅ 大量冗余     | ✅ 仍然存在                            | ✅ 自动压缩移除冗余            |
| 二进制格式传输  | ❌ 文本协议     | ❌ 文本协议                            | ✅ 二进制分帧               |

---

### 三、字段判断技巧总结

| 判断角度            | 判断方式示例                                         |
| --------------- | ---------------------------------------------- |
| 浏览器查看           | DevTools → Network → Protocol 字段（如 h2）         |
| curl 工具         | `curl -I -s -o /dev/null -w '%{http_version}'` |
| 抓包工具（如 Fiddler） | 查看请求或响应首行中的 `HTTP/x.x` 标记                      |
| 程序/代码中          | 分析 request/response 的首部                        |

---

### 四、实际使用建议

* HTTP/2 **通常需启用 HTTPS**，浏览器只在 TLS 连接下启用 h2 协议。
* 若服务器未支持 HTTP/2，浏览器会自动降级为 HTTP/1.1。
* 后端服务如 nginx、Apache、Node.js 可通过配置启用 HTTP/2。

</details>

## 17. http1.1 1.0 2.0 详细描述 {#question-subjective-dfdd5d178aaa}

### 题目要点

- 明确每个版本的核心特性和改进点
- 了解协议升级对页面性能、并发能力的影响
- 掌握协议版本判断方法及其实际应用场景

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 HTTP 不同版本的协议演进历史及特性<br>
确认候选人对 HTTP 各版本的技术改进、应用场景和限制有全面认识。

#### ● 掌握协议特性对性能、开发影响的理解<br>
测试对多路复用、长连接、头部压缩等关键概念的掌握。

---

### 参考答案

### 一、HTTP/1.0（1996年）

#### 1.1 基本特性

- **无状态的请求/响应协议**，每次请求完成后都会关闭 TCP 连接（短连接）。
- **请求格式**简单，支持常见方法（GET、POST、HEAD等）。
- 支持的头部字段有限，**不支持 Host 头**，导致不能在同一 IP 上托管多个网站（虚拟主机困难）。
- 不支持分块传输编码（chunked encoding），必须知道内容长度才能发送响应体。

#### 1.2 缺点

- **短连接**导致频繁建立和关闭 TCP 连接，性能较差。
- **不支持虚拟主机**（无法通过同一 IP 分辨不同网站）。
- 无持久连接，浏览器访问多个资源时性能开销大。
- 不支持断点续传等高级特性。

---

### 二、HTTP/1.1（1997年标准化）

#### 2.1 主要改进

- **持久连接（Connection: keep-alive）默认开启**，减少了建立 TCP 连接的开销。
- 引入 **Host 头**，支持虚拟主机，可以通过同一 IP 托管多个网站。
- 支持 **分块传输编码（Transfer-Encoding: chunked）**，无需预先知道内容长度即可发送数据。
- 新增更多方法，如 OPTIONS、PUT、DELETE 等，支持更丰富的 RESTful 操作。
- 支持缓存控制的细化（Cache-Control 头），更加灵活的缓存策略。
- 引入管线化（pipelining）技术，允许客户端在收到前一个响应前发送多个请求（但实际浏览器支持不佳）。
- 支持内容协商、带宽优化、带宽控制。

#### 2.2 性能与问题

- **管线化不普及，仍存在队头阻塞（Head-of-Line Blocking）**，即一个请求阻塞后续请求。
- 虽然支持持久连接，但每个连接同一时刻只能处理一个请求，限制了并发性能。
- 请求和响应头部为纯文本，存在较大冗余。

---

### 三、HTTP/2（2015年标准）

#### 3.1 核心特性

- **基于二进制分帧层（Binary Framing Layer）**，数据传输不再是纯文本，效率更高。
- **多路复用（Multiplexing）**：在一个 TCP 连接中并行交错多个请求和响应，解决 HTTP/1.x 队头阻塞问题。
- **首部压缩（Header Compression）**：使用 HPACK 算法减少请求和响应头部大小，降低冗余。
- 支持服务器推送（Server Push），服务器可主动推送资源给客户端。
- 流量优先级控制和依赖，提升资源加载的灵活性和优化空间。

#### 3.2 影响与应用

- HTTP/2 几乎需要 HTTPS 支持，现代浏览器默认只在加密连接下启用 HTTP/2。
- 大幅度减少延迟和提高页面加载速度，尤其对复杂页面资源请求表现明显。
- 后端服务器和代理需支持 HTTP/2 协议，常见如 Nginx、Apache、Node.js 都支持。

#### 3.3 仍存瓶颈

- 依赖于单个 TCP 连接，底层 TCP 队头阻塞仍存在，未来 HTTP/3 采用 QUIC 解决该问题。
- 实现复杂度提升，调试和分析也更困难。

---

### 四、三者对比总结

| 特性               | HTTP/1.0            | HTTP/1.1               | HTTP/2                      |
|--------------------|---------------------|------------------------|-----------------------------|
| 连接类型           | 短连接（默认关闭）   | 持久连接（默认开启）    | 单连接多路复用               |
| 多请求处理         | 无                   | 管线化（支持有限）      | 多路复用（真正并发）          |
| 头部传输           | 文本                 | 文本                   | HPACK 压缩（二进制）          |
| 虚拟主机支持       | 无                   | 支持 `Host` 头          | 支持 `Host` 头               |
| 服务器推送         | 不支持               | 不支持                 | 支持                       |
| 队头阻塞           | 严重                 | 仍存在                 | 大幅缓解                    |
| 性能提升           | 低                   | 有限                   | 高                          |
| 传输格式           | 文本协议             | 文本协议               | 二进制分帧                   |
| 应用场景           | 早期简单 Web         | 大部分传统 Web 应用     | 现代高速 Web 应用            |

---

### 五、总结

- **HTTP/1.0**：基础版本，简单、性能差，缺乏持久连接和虚拟主机支持。
- **HTTP/1.1**：Web 主流协议，引入持久连接、虚拟主机、分块传输等，性能提升有限，存在队头阻塞。
- **HTTP/2**：革命性升级，二进制协议、多路复用、头部压缩显著提升性能，配合 HTTPS 是现代 Web 标准。

</details>

## 18. js 数组和链表有什么关系和区别 {#question-subjective-d868199bebdf}

### 题目要点

* 区分存储方式（连续 vs 指针链接）
* 明确访问和操作复杂度差异
* 理解 JS 数组的特殊实现与链表的非内置性质
* 结合实际场景说明选择依据

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解数据结构的基本概念及实现原理<br>
确认候选人能准确区分数组和链表的本质差异及各自优势。

#### ● 能结合 JavaScript 特性解释数组和链表的表现与适用场景<br>
测试对内存模型、时间复杂度等性能理解。

---

### 参考答案

### 一、基本概念

#### 1.1 数组（Array）

- 是一组**连续存储空间**的元素集合，元素通过索引（数字下标）访问。
- 在 JavaScript 中，数组是基于对象实现的，既支持稠密数组（连续索引），也支持稀疏数组。
- 访问时间复杂度接近 O(1)，插入、删除操作通常为 O(n)（特别是在中间位置）。

#### 1.2 链表（Linked List）

- 由**一系列节点（Node）组成**，每个节点包含数据和指向下一个节点的指针（单链表）或前后节点指针（双链表）。
- 节点不要求在内存中连续存储。
- 访问某个节点需要从头节点开始顺序遍历，时间复杂度为 O(n)。
- 插入、删除操作（已知节点指针）为 O(1)，非常高效。

---

### 二、关系

- 数组和链表都属于**线性数据结构**，用于存储一组有序元素。
- 都可以用来实现队列、栈等抽象数据结构。
- JavaScript 中原生并无链表结构，链表需要开发者自定义实现。

---

### 三、区别

| 特性          | 数组 (Array)                        | 链表 (Linked List)                   |
|---------------|-----------------------------------|------------------------------------|
| 存储方式      | 连续内存块                        | 节点分散存储，通过指针链接          |
| 访问效率      | 通过索引随机访问，时间复杂度 O(1) | 需顺序遍历访问，时间复杂度 O(n)    |
| 插入/删除效率 | 中间插入删除需移动元素，O(n)       | 指针调整即可，插入删除为 O(1)       |
| 内存利用      | 需预分配连续空间，可能浪费        | 动态分配，空间利用率高              |
| 适用场景      | 频繁读取访问                      | 频繁插入和删除操作                  |
| JavaScript支持 | 内置数据类型，功能丰富            | 需手动实现，非内置数据结构          |

---

### 四、JavaScript 中数组与链表的表现

- JS 数组底层实现并非传统的连续内存块，实际上是类似哈希表的对象结构，索引是属性名，部分浏览器做了优化以提升性能。
- 由于 JS 数组灵活，很多场景下链表并不常用，除非特定场景（如面试题、算法实现）才需自己写链表。
- 插入删除操作在 JS 数组中通常涉及重排元素，性能较低；链表插入删除不受影响。

---

### 五、示例简述

```js
// 简单链表节点结构示例
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// 数组示例
const arr = [1, 2, 3, 4];

// 链表示例（手动构建）
const node1 = new ListNode(1);
const node2 = new ListNode(2);
node1.next = node2;
````

---

### 六、总结

* 数组适合需要**快速随机访问**的场景，链表适合需要**频繁插入删除**的场景。
* JavaScript 内置数组性能较好，链表需自行实现，多用于算法训练。
* 了解两者的差异有助于选择合适的数据结构解决实际问题。

</details>

## 19. js 中数组通过索引取值的底层原理 {#question-subjective-c9a2d6240561}

### 题目要点

- JS 数组本质是对象，索引转换为字符串属性访问
- 引擎通过隐藏类、内联缓存等机制加速访问
- 稠密数组使用连续内存块存储，性能优
- 稀疏数组性能差，慎用稀疏或混合类型数组

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 JavaScript 数组访问的底层实现机制<br>
验证对 JS 引擎如何管理数组索引访问的理解。

#### ● 掌握 JS 数组与传统语言数组在内存和访问机制上的差异<br>
考察对 JS 特性的理解和底层性能影响认知。

---

### 参考答案

### 一、JavaScript 数组的本质

- JavaScript 中的数组本质是**特殊的对象**，索引其实是对象的字符串类型的键（key），例如 `"0"`, `"1"`, `"2"`。
- 数组元素通过属性访问的方式实现，例如 `arr[0]` 等价于 `arr["0"]`。
- JS 数组继承自 `Array.prototype`，有丰富内置方法。

### 二、底层访问原理

#### 2.1 索引访问过程

- 当执行 `arr[index]` 时，JS 引擎将 `index` 转为字符串，查询该对象属性。
- 若该属性存在，则返回对应值。
- 若属性不存在，返回 `undefined`。

#### 2.2 优化机制

虽然是对象访问，现代 JS 引擎（V8、SpiderMonkey 等）对数组访问做了大量优化：

- **元素存储优化**：当数组是“稠密数组”（索引连续且类型统一）时，JS 引擎会使用连续内存块存储元素，类似传统数组。
- **隐藏类和内联缓存**：引擎通过隐藏类（hidden class）和内联缓存（inline caching）优化属性访问速度，提升索引访问性能。
- **元素类型分类**：按类型优化存储，如整型数组、浮点型数组和混合型数组不同策略。
- **稀疏数组处理**：如果数组很稀疏或索引不连续，底层退化为普通哈希表结构，访问性能较差。

### 三、对比传统语言数组

| 维度               | 传统语言（如 C、Java）数组        | JavaScript 数组                  |
|--------------------|---------------------------------|--------------------------------|
| 存储方式           | 连续内存块                      | 对象属性（优化后连续存储）       |
| 访问时间复杂度     | O(1) 直接寻址                   | 平均 O(1)，引擎优化提升接近原生   |
| 元素类型           | 单一固定类型                    | 动态类型混合                    |
| 内存布局           | 连续，紧凑                     | 可能连续或稀疏，取决实现和用法   |

### 四、总结

- JS 数组访问是属性访问，表面看类似对象属性查找。
- 现代引擎对“稠密数组”做连续内存优化，访问接近原生数组性能。
- 理解底层机制有助于写出性能更优的代码，避免稀疏数组和混合类型导致的性能损失。

</details>

## 20. 防抖的机制和适用场景 {#question-subjective-f85096551db0}

### 题目要点

* 防抖通过清除并重置定时器，确保一定时间内只执行一次函数。
* 适合用户停止操作后执行，避免过度触发带来的性能浪费。
* 明确防抖和节流的差异，能针对场景合理选择使用。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解防抖的核心原理与实现机制<br>
考察候选人是否能准确描述防抖函数的工作流程和时间控制。

#### ● 掌握防抖函数的应用场景及与节流的区别<br>
验证对实际开发中防抖使用场景的把握及合理运用。

---

### 参考答案

### 一、防抖机制原理

- **防抖（Debounce）**指的是**连续触发事件时，只有事件停止触发达到一定时间后，才执行一次回调函数**的技术手段。
- 其核心思路是：**重置计时器**，即每次触发事件时，清除之前的延时执行，重新计时。
- 只有当一定时间内没有再次触发，计时器才会执行回调。

---

### 二、防抖的工作流程示例

假设防抖时间为 300ms：

- 用户连续输入字符时，事件不断触发，计时器不断被清除重置。
- 输入停止 300ms 后，计时器触发，执行回调（如发送请求）。

---

### 三、防抖的示例代码

```js
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}
````

---

### 四、防抖适用场景

| 场景             | 说明                        |
| -------------- | ------------------------- |
| 输入搜索建议         | 用户输入时避免频繁请求接口，只在停止输入后发送请求 |
| 窗口大小调整（resize） | 防止 resize 事件频繁触发导致性能问题    |
| 按钮防重复点击        | 防止用户多次快速点击导致多次提交          |
| 表单验证           | 输入结束后统一校验，减少校验次数          |

---

### 五、防抖与节流（Throttle）的区别简述

| 特性   | 防抖（Debounce）    | 节流（Throttle）   |
| ---- | --------------- | -------------- |
| 触发频率 | 连续触发事件停止后只执行一次  | 按固定时间间隔执行一次    |
| 典型应用 | 输入停止后执行搜索、按钮防连点 | 滚动监听、频繁触发的拖拽事件 |

---

### 六、常见误区及面试陷阱

* ❌ 把防抖和节流混淆，场景不分使用错误。
* ❌ 防抖时间设置过短或过长，导致体验差。
* ❌ 忘记绑定正确的 `this`，回调中上下文错误。
* ❌ 误以为防抖适合所有频繁触发事件，其实节流对某些场景更适合。

</details>

## 21. 如果不做防抖有什么问题 {#question-subjective-7422d89c9647}

### 题目要点

- 频繁执行导致性能和用户体验问题
- 服务器请求压力大，资源浪费
- 重复操作引发数据或业务异常
- 结合具体场景描述实际影响

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解防抖技术存在的必要性<br>
考察候选人对防抖缺失时潜在风险及性能影响的认识。

#### ● 结合具体场景分析不使用防抖的后果<br>
验证能否从用户体验和系统性能两方面进行全面思考。

---

### 参考答案

### 一、不做防抖会遇到的典型问题

#### 1. 频繁触发函数，导致性能严重下降

- 例如用户在输入框快速敲击时，如果每次输入都触发网络请求或复杂计算，会造成大量无意义调用。
- 这不仅浪费 CPU 资源，还可能使页面卡顿、响应迟缓，影响用户体验。

#### 2. 造成服务器压力，带来资源浪费

- 无防抖的场景中，频繁请求接口会加大服务器负载，甚至可能触发接口限流、阻断。
- 资源浪费严重，且对后端稳定性造成潜在风险。

#### 3. 用户体验差，可能出现“抖动”或无响应

- 频繁执行复杂逻辑或界面更新，导致界面闪烁、卡顿或响应迟缓。
- 交互不流畅，影响用户对产品的好感度。

#### 4. 多次重复操作导致数据错误

- 比如按钮未做防抖，用户连续点击会产生重复提交、重复购买等问题，造成数据异常或业务逻辑混乱。

---

### 二、典型应用场景说明

| 场景             | 不做防抖导致的问题                      |
|------------------|--------------------------------------|
| 搜索输入         | 每敲一个字母都发请求，接口压力大，响应慢  |
| 按钮点击         | 多次快速点击触发多次提交或操作          |
| 窗口大小调整     | 高频率触发 resize 事件，导致性能下降     |
| 滚动监听         | 频繁触发导致页面卡顿或事件处理堆积       |

---

### 三、总结

- 不做防抖，频繁触发事件会造成性能瓶颈和体验下降。
- 对系统资源、服务器负载、业务正确性都有负面影响。
- 合理使用防抖是保证前端性能和良好用户体验的重要手段。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-51/_index.md" >}}) · 已是最后一轮 →
