+++
title = "阿里巴巴-社招-1年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/61"
experienceId = 61
roundId = 98
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T11:54:27.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-61/round-97/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-61/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** react hooks、性能优化

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 你们项目为什么选Redux而非MobX {#question-subjective-8c25c1ddc7f3}

### 题目要点

* Redux 强调可预测性、单向数据流、纯函数 reducer，适合复杂项目
* 丰富的调试工具和社区中间件支持开发效率和可维护性
* MobX 响应式自动追踪，适合快速开发，但隐式依赖增加调试难度
* 团队规模和项目复杂度是选择状态管理方案的关键因素
* 现代 Redux 已大幅简化，代码冗余感降低

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 Redux 和 MobX 两种状态管理库的设计理念与差异**
* **是否能结合项目实际需求，论述选择某一方案的合理性**
* **是否掌握 Redux 在复杂状态管理中的优势与局限**
* **是否能表达对团队协作、维护性和性能的综合考虑**

---

## 二、参考答案

### 1.1 原理说明

#### Redux

* **基于 Flux 架构思想，使用单一全局状态树（Store）**
* 状态只读，通过派发（dispatch）纯函数（Reducer）更新状态
* 强调**不可变数据和纯函数**，方便调试和时间旅行（time-travel debugging）
* 侧重于**可预测性和可维护性**

#### MobX

* 采用响应式编程思想，通过可观察（observable）数据和自动追踪依赖实现状态同步
* 支持**隐式状态更新**，使用更接近传统面向对象编程
* 适合快速开发，较少样板代码

---

### 1.2 选择 Redux 的主要理由

#### 1）明确的状态流向和可预测性

* Redux 的单向数据流和纯函数 reducer 让状态变化过程清晰、易追踪
* 在多人协作中，可以方便定位状态更新的具体原因，减少调试成本

#### 2）强大的开发者工具支持

* Redux DevTools 提供时间旅行、快照对比、action 日志等，极大提升调试体验
* 有丰富的中间件生态（如 redux-thunk、redux-saga），便于处理复杂异步逻辑

#### 3）适合大型复杂项目

* 状态结构复杂时，Redux 更便于组织和维护，模块化拆分 reducer 明确职责
* 明确的规范和社区共识，团队成员易于理解和统一编码风格

#### 4）可测试性强

* Reducer 是纯函数，易于单元测试，保证业务逻辑可靠

---

### 1.3 不选 MobX 的考虑

#### 1）隐式依赖难以追踪

* MobX 的自动依赖追踪机制带来状态变化的隐式性，可能导致调试困难
* 团队成员对响应式原理不熟悉时，维护成本升高

#### 2）状态变化不够可预测

* MobX 允许任意地方修改状态，可能出现难以预料的副作用
* 不利于实现严格的状态管理和权限控制

#### 3）社区规范和中大型项目生态

* Redux 生态成熟且社区规范丰富
* MobX 在某些复杂场景下不够透明，团队风险较大

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为 MobX 性能一定优于 Redux

* 实际性能差异因项目而异，合理使用 Redux 也能实现优秀性能

#### ❌ 误区二：Redux 代码一定繁琐难写

* 现代 Redux 工具（如 Redux Toolkit）极大简化开发体验，减少样板代码

#### ❌ 误区三：认为 MobX 是“魔法”，不需要学习状态管理原理

* 响应式原理本身也需要深入理解，否则容易导致维护难题

</details>

## 2. 项目中提到“首屏加载优化1.5秒”，具体如何实现 {#question-subjective-9bdd9b86d8fe}

### 题目要点

* 首屏加载优化核心在于减少首屏资源体积和请求数量
* 结合 SSR/SSG 预渲染，缩短白屏时间
* 动态拆分代码，懒加载非关键资源
* 充分利用浏览器缓存和 CDN
* 监控指标涵盖 FCP、TTI，持续迭代优化

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解首屏加载的定义及关键性能指标（如 FCP、TTI）**
* **掌握多种前端性能优化手段，涵盖资源、网络、渲染等层面**
* **能结合具体技术和业务场景，说明优化实施细节**
* **理解优化过程中的权衡与监控方法**

---

## 二、参考答案

### 1.1 首屏加载的概念与性能指标

* **首屏加载**：用户打开页面到看到页面主要内容（首屏内容）完整渲染的时间
* 常用指标：

  * **FCP（First Contentful Paint）**：首个内容绘制时间
  * **TTI（Time To Interactive）**：页面可交互时间
* 优化目标是缩短用户等待感知，提高体验

---

### 1.2 优化实现方案

#### 1）资源加载优化

* **静态资源压缩和合并**：使用 gzip/brotli 压缩 JS、CSS，合并小文件减少请求数
* **使用 CDN 加速资源分发**，靠近用户节点降低延迟
* **图片优化**：采用 WebP 格式，懒加载非首屏图片，合理尺寸裁剪

#### 2）代码分割与按需加载

* **动态 import** 和 **路由懒加载**，减少首屏 JS 体积
* 使用现代构建工具（如 Webpack）实现 **Tree Shaking**，剔除无用代码

#### 3）服务端渲染（SSR）或静态生成（SSG）

* 利用 SSR 预先生成首屏 HTML，减少白屏和等待时间
* 结合 hydration 技术实现快速激活交互能力

#### 4）缓存策略

* 利用浏览器缓存（强缓存、协商缓存）
* HTTP/2 多路复用减少请求延迟
* Service Worker 做资源缓存和离线支持

#### 5）网络请求优化

* **合并 API 请求**，减少请求数量
* 使用 **HTTP/2 Server Push** 预加载关键资源
* 接口响应加速，合理设计后端接口

#### 6）渲染优化

* 减少 DOM 节点数，避免复杂布局
* 优化 CSS 选择器，减少回流重绘
* 使用 `requestIdleCallback`、`requestAnimationFrame` 优化任务调度

---

### 1.3 实施细节举例

* 通过 Lighthouse、WebPageTest、Chrome DevTools 监控并定位瓶颈
* 制定 **关键渲染路径**，优先加载首屏必要资源
* 使用 `preload`、`prefetch` 标签预加载关键资源
* 针对慢网络环境，采用渐进式渲染和骨架屏设计

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：只关注页面加载时间，不关注可交互时间

* 首屏快但不能交互，用户体验仍差

#### ❌ 误区二：盲目使用懒加载，导致首屏资源不完整

* 需合理区分首屏与非首屏资源，保证首屏完整性

#### ❌ 误区三：忽视后端性能与网络状况对首屏的影响

* 前端优化需配合后端与网络条件协同提升

</details>

## 3. 如何定位到LCP（最大内容渲染）瓶颈 {#question-subjective-eb25f5cce439}

### 题目要点

* 使用 Chrome DevTools Performance 面板定位 LCP 时间点及元素
* 重点分析图片、字体、CSS 和 JS 加载与执行时间
* 关注长任务阻塞和渲染阻塞因素
* 结合网络面板分析关键请求链
* 综合运用多种工具（Lighthouse、WebPageTest、PageSpeed Insights）获取数据支持

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 LCP 指标的定义及重要性**
* **掌握定位性能瓶颈的工具和方法**
* **能够分析资源加载、渲染及网络等多维度原因**
* **具备结合具体数据进行优化方向判断的能力**

---

## 二、参考答案

### 1.1 LCP（Largest Contentful Paint）简介

* LCP 是衡量网页加载性能的重要指标，表示页面主要内容（最大可见内容块）完成渲染的时间
* 用户体验核心指标之一，直接反映页面加载速度和视觉反馈
* LCP 可能涉及图片、文本块、视频等元素的渲染

---

### 1.2 定位 LCP 瓶颈的具体步骤

#### 1）使用性能分析工具抓取 LCP 时间点

* **Chrome DevTools Performance 面板**

  * 录制页面加载过程，查看 LCP 标记及对应渲染事件
* **Lighthouse**

  * 自动生成性能报告，定位慢资源、长任务
* **WebPageTest**

  * 真实网络环境下抓取加载数据，观察 LCP 相关指标
* **Google PageSpeed Insights**

  * 在线工具，给出 LCP 评分及瓶颈建议

#### 2）分析 LCP 相关资源和任务

* 查找页面中被视为 LCP 元素的 DOM 节点（DevTools Performance → Summary → Largest Contentful Paint）
* 重点关注：

  * 图片是否未优化、过大、未使用懒加载
  * 关键字体是否阻塞渲染（字体加载时间长）
  * 首屏 JS 和 CSS 资源加载是否缓慢或阻塞渲染
  * 长任务（如大量 JS 执行）是否影响渲染

#### 3）分析网络请求

* 查看关键资源（图片、CSS、JS）请求时间，检查是否存在请求阻塞、重定向、DNS 解析慢等问题
* 使用 Chrome DevTools Network 面板，关注“关键请求链”与“水平方向的请求阻塞”
* 分析是否存在多个关键请求串行执行，造成延迟

#### 4）检查渲染阻塞因素

* CSS 及字体文件加载阻塞渲染，影响首次绘制及 LCP
* 大型 JS 任务阻塞主线程，延迟渲染
* DOM 复杂度高，布局计算耗时长

---

### 1.3 优化方向举例

* 图片压缩、合理尺寸、使用 WebP 格式、懒加载非首屏图片
* 关键 CSS 内联，减少阻塞加载
* 异步加载非关键 JS，避免阻塞主线程
* 使用字体显示策略（如 `font-display: swap`）避免字体阻塞
* 服务器开启压缩和缓存，加速资源传输

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：只关注单个资源，忽视整体加载流程

* LCP 受到多资源、多任务协同影响

#### ❌ 误区二：误将 First Paint 或 FCP 当成 LCP

* LCP 关注的是最大可见内容渲染完成，区别明显

#### ❌ 误区三：忽略网络环境影响，未在真实场景测试

* 实际用户网络状况对 LCP 有重大影响

</details>

## 4. 错误监控如何区分可恢复错误（如网络超时）与不可恢复错误（如前端代码崩溃） {#question-subjective-44e70cbeb1df}

### 题目要点

* 利用全局错误监听和请求状态码区分错误类型
* 网络错误（超时、断网）一般为可恢复，支持重试
* JS 运行时错误和未捕获 Promise 异常为不可恢复
* 结合错误上下文和业务影响确定分类
* 建立多层次错误分级和报警机制，减少误报和漏报

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解不同类型错误的分类标准和业务影响**
* **掌握前端错误捕获技术及其分类方法**
* **能结合具体场景设计错误分级与处理策略**
* **了解如何利用监控系统做错误报警和自动化响应**

---

## 二、参考答案

### 1.1 错误分类定义

| 类型     | 特征描述                     | 示例            | 处理策略           |
| ------ | ------------------------ | ------------- | -------------- |
| 可恢复错误  | 影响局部功能或临时异常，用户操作可重试或继续使用 | 网络超时、接口返回异常   | 重试机制、降级处理、提示用户 |
| 不可恢复错误 | 导致应用整体功能崩溃或不可用           | JS 运行时异常、内存泄漏 | 错误上报、告警、快速修复   |

---

### 1.2 错误监控区分方法

#### 1）基于错误类型区分

* **网络请求错误**（Fetch/XHR 失败、超时）

  * 可判断为可恢复错误
  * 通过请求状态码、超时事件捕获
* **JS 运行时错误**

  * 通过 `window.onerror` 或 `window.addEventListener('error')` 捕获
  * 通常属于不可恢复错误
* **Promise 未捕获异常**

  * 通过 `window.onunhandledrejection` 捕获
  * 多为不可恢复错误

#### 2）基于错误上下文信息

* 收集错误堆栈、请求参数、环境信息
* 判断错误影响范围（局部组件、全局应用）
* 结合业务判断是否可恢复

#### 3）基于错误频率和影响度

* 高频错误且影响用户操作为不可恢复
* 偶发或短暂错误，且有重试机制为可恢复

---

### 1.3 具体实现策略

#### A. 网络错误处理

```js
fetch(url, options)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .catch(err => {
    if (err.message.includes('timeout') || err.message.includes('NetworkError')) {
      // 标记为可恢复错误，进行重试或提示
      console.warn('网络超时，尝试重试');
    } else {
      // 其他异常，判断为不可恢复
      reportError(err);
    }
  });
```

#### B. 监听全局错误事件

```js
window.onerror = function (message, source, lineno, colno, error) {
  // 标记为不可恢复错误
  reportError({ message, source, lineno, colno, error, type: 'js_runtime' });
};

window.onunhandledrejection = function (event) {
  // 标记为不可恢复错误
  reportError({ reason: event.reason, type: 'promise_rejection' });
};
```

#### C. 业务层错误分级

* 设计错误码体系，区分错误等级（INFO、WARN、ERROR、FATAL）
* 结合用户反馈和日志分析不断调整分类规则

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：所有错误都一视同仁处理

* 忽视错误对业务影响的差异，导致报警泛滥或漏报

#### ❌ 误区二：只捕获 JS 错误，忽略网络和资源错误

* 网络错误同样会影响用户体验，必须区分对待

#### ❌ 误区三：错误分类完全依赖前端，忽略后端协同

* 后端日志与状态码对判断错误类型很重要

</details>

## 5. react Hooks解决了什么问题 {#question-subjective-1b9e637c5a87}

### 题目要点

* Hooks 解决类组件生命周期混乱、逻辑复用困难问题
* 通过 `useState` 和 `useEffect` 实现状态和副作用的清晰管理
* 赋予函数组件有状态能力，简化代码结构
* 自定义 Hooks 支持灵活复用，替代高阶组件和 Render Props
* 避免 `this` 绑定和生命周期陷阱，提升开发体验

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React 16.8 之前类组件存在的缺陷和痛点**
* **掌握 React Hooks 的设计初衷和核心价值**
* **能够阐述 Hooks 带来的代码复用、状态管理和副作用处理改进**
* **了解 Hooks 对函数组件的强化和生态影响**

---

## 二、参考答案

### 1.1 React Hooks 背景问题

#### 1）类组件存在的痛点

* **复杂组件生命周期难以管理**
  生命周期方法如 `componentDidMount`、`componentDidUpdate`、`componentWillUnmount` 中混杂不同逻辑，导致代码难以维护

* **逻辑复用困难**
  只能通过高阶组件（HOC）、Render Props 等模式复用状态逻辑，写法繁琐且嵌套层级深

* **状态相关逻辑散落**
  同一个功能的状态和副作用可能分散在多个生命周期方法中，难以聚合和理解

---

### 1.2 Hooks 解决的问题

#### 1）更清晰的状态逻辑组织

* 使用 `useState`、`useReducer` 管理状态，状态与逻辑在函数体内自然聚合
* 副作用通过 `useEffect` 明确声明，避免生命周期方法混乱

#### 2）函数组件拥有状态和副作用能力

* 函数组件不再是无状态组件，拥有和类组件同等能力
* 函数组件写法更简洁、易读，无需关心 `this` 绑定问题

#### 3）逻辑复用更方便

* 自定义 Hooks (`useCustomHook`) 实现状态和副作用的封装复用，避免高阶组件和 Render Props 的复杂嵌套
* Hooks 可以组合和嵌套使用，增强代码复用性和模块化

#### 4）避免类组件中的陷阱

* 省去了 `this` 的困扰，避免错误绑定和上下文丢失
* 消除部分生命周期函数导致的“状态不同步”问题

---

### 1.3 Hooks 的核心优势

| 传统类组件       | Hooks                    |
| ----------- | ------------------------ |
| 生命周期复杂且分散   | `useEffect` 统一管理副作用      |
| 状态逻辑难复用     | 自定义 Hooks 提供状态和副作用逻辑复用方式 |
| `this` 绑定繁琐 | 函数组件无 `this`，更简洁直观       |
| 代码嵌套层级深     | Hooks 组合灵活，减少嵌套          |

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：Hooks 只是让函数组件有状态

* Hooks 不仅是状态管理，更重要是副作用处理和逻辑复用方式的革命

#### ❌ 误区二：自定义 Hooks 是 React 内置功能

* 自定义 Hooks 是用户封装的函数，React 只提供基础 Hook API

#### ❌ 误区三：Hooks 适用于所有场景，没有缺点

* Hooks 有学习曲线，滥用可能导致复杂依赖管理问题

</details>

## 6. 为什么Hooks调用顺序必须稳定 {#question-subjective-d8fbb7349e37}

### 题目要点

* React 通过调用顺序关联 Hook 与内部状态
* 稳定顺序保证状态正确绑定和管理
* 违反顺序会导致状态错乱和渲染错误
* 必须在函数组件顶层调用 Hooks，避免条件和循环调用
* ESLint 插件帮助规范调用顺序

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React Hooks 内部实现原理**
* **掌握 Hook 调用顺序对状态关联的关键性**
* **了解违反顺序导致的问题及调试难点**
* **能结合源码层面或运行机制说明原因**

---

## 二、参考答案

### 1.1 React Hooks 的实现机制简述

* React 通过**调用顺序**来“关联”Hooks 调用与对应状态、副作用
* 每个函数组件执行时，React 会按顺序保存每个 Hook 调用的状态快照
* 这种机制避免了传统类组件中复杂的 `this.state` 和生命周期管理

### 1.2 为什么调用顺序必须稳定

#### 1）Hooks 是通过调用顺序“绑定”状态的

* React 根据函数内 Hooks 调用的顺序将 Hook 实例一一对应到内部状态链表中
* 如果调用顺序改变，React 无法正确匹配状态，导致状态错乱

#### 2）条件或循环中调用 Hooks 会破坏调用顺序

* 条件渲染时有的 Hooks 可能执行，有的未执行，导致后续 Hooks 索引不匹配
* 这会引发不可预期的行为、报错或状态错乱

#### 3）保证状态与 Hook 调用位置一一对应，方便调试和维护

* 稳定的调用顺序让 Hook 的状态和副作用管理变得简单明了
* 也使得 React 的 Hook 规则能有效检查（如 ESLint 插件）

---

### 1.3 常见违反顺序的错误示例

```js
// 错误示例：条件语句中调用 Hook，调用顺序不稳定
function MyComponent(props) {
  if (props.flag) {
    useEffect(() => { console.log('flag is true'); });
  }
  useState(0);
  // 这样会导致不同渲染时 Hook 数量和顺序不同，报错
}
```

---

### 1.4 React 官方规则与开发建议

* Hooks 必须在 React 函数组件或自定义 Hook 的最顶层调用
* 不允许在循环、条件判断、嵌套函数中调用 Hooks
* React 官方 ESLint 插件可辅助检测调用顺序违规

---

### 1.5 常见误区或面试陷阱

#### ❌ 误区一：认为 Hooks 可以随意在任何地方调用

* Hooks 必须在顶层调用，保证每次渲染调用顺序一致

#### ❌ 误区二：以为 Hooks 会自动处理调用顺序变化

* React 不会动态调整 Hook 状态绑定，调用顺序必须程序员保证

</details>

## 7. useEffect中出现无限循环的可能场景 {#question-subjective-61768e42d7c6}

### 题目要点

* 无限循环多因依赖数组错误或缺失，状态更新导致重复执行
* 引用类型依赖需用 `useCallback`、`useMemo` 稳定
* 正确管理依赖，避免副作用内无条件状态更新
* ESLint React Hooks 插件可辅助检查依赖完整性

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 useEffect 的执行机制和依赖数组作用**
* **掌握导致无限循环渲染的常见误区和原因**
* **能够结合具体代码示例分析问题根源**
* **熟悉如何避免和修复无限循环的技巧**

---

## 二、参考答案

### 1.1 useEffect 执行机制简述

* `useEffect` 会在组件渲染后执行副作用函数
* 依赖数组（第二个参数）决定副作用的执行时机：

  * 空数组 `[]`：只执行一次（组件挂载时）
  * 指定依赖：依赖变化时重新执行
  * 不传依赖数组：每次渲染后执行（极易导致循环）

---

### 1.2 无限循环的典型场景

#### 1）依赖数组遗漏或错误

```js
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1);  // 修改了 count，count 是依赖，导致无限循环
}, [count]);
```

* `useEffect` 中调用了会更新依赖的状态，导致每次状态更新又触发 `useEffect`，无限循环

#### 2）依赖引用类型（对象、数组、函数）未稳定

```js
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(res => setData(res));
}, [fetchData]);  // fetchData 是函数，每次渲染都会重新创建，导致无限循环
```

* 依赖为每次渲染都新创建的函数或对象，导致依赖值变化，`useEffect` 反复触发

#### 3）副作用内更新状态但依赖不完整或错误

```js
useEffect(() => {
  setValue(someCalculation());
}, []);  // 忽略了 someCalculation 依赖，可能导致状态更新异常循环
```

* 忽略必须的依赖，React 严格模式下可能导致额外调用，或逻辑错误造成循环

---

### 1.3 避免无限循环的方法

* **正确填写依赖数组**，确保只依赖必要的变量
* **使用 `useCallback`、`useMemo` 缓存函数和对象引用**，保持依赖稳定
* **避免在副作用中无条件地修改依赖状态**
* **将副作用拆分，减少依赖交叉**
* **使用条件判断，避免不必要的状态更新**

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：不传依赖数组，导致每次渲染都执行 `useEffect`

* 容易造成无限循环或性能问题

#### ❌ 误区二：认为对象和函数是稳定的依赖

* 应用缓存手段，避免引用变化

#### ❌ 误区三：误用状态更新函数，未考虑依赖引发循环

</details>

## 8. useMemo缓存失效如何定位 {#question-subjective-2c1f308bcf2c}

### 题目要点

* useMemo 缓存依赖依赖数组，依赖变化会导致缓存失效
* 引用类型依赖需保证稳定性，避免每次创建新对象或函数
* 通过日志打印和依赖检查定位缓存失效原因
* 合理使用缓存工具，结合 React Profiler 优化性能

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 useMemo 的缓存机制及依赖数组作用**
* **掌握导致 useMemo 缓存失效的常见原因**
* **能够通过调试和代码分析定位缓存失效问题**
* **了解合理使用 useMemo 的最佳实践**

---

## 二、参考答案

### 1.1 useMemo 缓存机制简述

* `useMemo` 接收一个创建函数和依赖数组，只有当依赖发生变化时，才重新执行创建函数生成新值
* 依赖未变时，返回缓存的上一次计算结果，避免重复计算，提高性能

### 1.2 useMemo 缓存失效的常见原因

#### 1）依赖数组写法错误或不完整

* 依赖项中包含了每次渲染都会变化的变量（如新创建的对象、函数）
* 导致每次渲染依赖变化，useMemo 每次都会重新计算

#### 2）依赖项为引用类型且未稳定

```js
const obj = { a: 1 };
const memoizedValue = useMemo(() => compute(obj), [obj]);
// 每次渲染 obj 都是新对象，缓存失效
```

* 解决：用 `useMemo` 或 `useCallback` 缓存依赖，保证引用稳定

#### 3）依赖项缺失

* 依赖数组遗漏了实际依赖的变量，导致缓存未在正确时机更新
* 这虽然不算缓存“失效”，但会引发数据不一致的问题

#### 4）组件卸载重挂载

* 组件卸载时，缓存自然销毁，重新挂载后缓存不存在

---

### 1.3 定位缓存失效的方法

#### 1）通过调试和日志输出

* 在 `useMemo` 的创建函数里添加 `console.log`，观察是否频繁执行
* 判断是否确实缓存未命中导致重新计算

#### 2）检查依赖数组

* 确认依赖项是否包含不稳定的引用类型或每次渲染都会变化的变量
* 利用 ESLint React Hooks 插件辅助检查依赖完整性和正确性

#### 3）分析组件渲染逻辑

* 组件频繁重新渲染可能是上层传入 props 变化导致，非 `useMemo` 本身问题
* 使用 React DevTools Profiler 分析渲染次数和原因

---

### 1.4 优化建议

* 使用 `useCallback` 或 `useMemo` 缓存函数和对象依赖，保证引用稳定
* 减少不必要的依赖项，避免无关变量导致缓存失效
* 结合 React Profiler 和 ESLint 工具进行持续调试和优化

---

### 1.5 常见误区或面试陷阱

#### ❌ 误区一：认为 useMemo 保证值永久缓存

* useMemo 只保证依赖不变时缓存有效，组件卸载或依赖变化都会导致重新计算

#### ❌ 误区二：滥用 useMemo，带来不必要复杂度

* 非性能瓶颈点滥用 useMemo，可能适得其反

</details>

## 9. 实现useScrollDirection（滚动方向感知）时，如何避免scroll事件高频触发 {#question-subjective-0bf15d8e29af}

### 题目要点

* scroll 事件触发频率高，需用节流（throttle）控制调用频率
* requestAnimationFrame 是性能优化的可选方案
* 用 useRef 存储前一滚动位置，避免重复无效更新
* 事件监听添加和移除要配套，避免内存泄漏
* 防抖适合滚动结束处理，不适合实时方向感知

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解浏览器 scroll 事件触发机制及其性能影响**
* **掌握常用的事件节流（throttle）与防抖（debounce）技术**
* **能够结合 React Hook 设计高性能的滚动方向感知方案**
* **了解事件监听和清理的最佳实践**

---

## 二、参考答案

### 1.1 scroll 事件高频触发问题

* 浏览器的 `scroll` 事件在用户滚动时会以极高频率触发（通常每秒数百次）
* 直接在事件回调中执行复杂逻辑，会导致性能瓶颈，页面卡顿，影响用户体验
* 需要对事件处理函数进行控制，减少实际调用频率

---

### 1.2 常用避免高频触发的方案

#### 1）事件节流（Throttle）

* 节流是指在固定时间间隔内，只允许事件处理函数执行一次
* 可以使用 `lodash.throttle` 或自定义节流函数
* 保证滚动处理函数不会频繁调用，提升性能

#### 2）事件防抖（Debounce）

* 防抖是指事件停止触发后，延迟执行函数
* 适用于希望滚动结束后才触发逻辑的场景
* 不适合实时感知滚动方向，但可用于滚动结束的后续处理

#### 3）requestAnimationFrame 优化

* 使用 `requestAnimationFrame` 包装事件处理函数，将回调与浏览器帧刷新同步
* 适合动画和滚动监听，避免多次无效更新

---

### 1.3 useScrollDirection 实现要点示例

```jsx
import { useState, useEffect, useRef } from 'react';
import throttle from 'lodash.throttle';

function useScrollDirection() {
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const lastScrollY = useRef(window.pageYOffset);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.pageYOffset;
      if (currentScrollY > lastScrollY.current) {
        setDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setDirection('up');
      }
      lastScrollY.current = currentScrollY;
    }, 100); // 100ms 节流时间可调

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel && handleScroll.cancel(); // lodash.throttle 的取消
    };
  }, []);

  return direction;
}
```

* 使用 `throttle` 控制 `handleScroll` 执行频率
* 利用 `useRef` 存储上一次滚动位置，避免频繁触发状态更新
* 监听和清理事件时要注意防止内存泄漏

---

### 1.4 其他优化建议

* 判断滚动位置变化阈值（如超过 10px 再触发），减少无效更新
* 对于复杂场景，可结合 `IntersectionObserver` 替代部分滚动监听
* 仅在必要组件挂载时监听滚动，避免全局事件监听无谓消耗

---

### 1.5 常见误区或面试陷阱

#### ❌ 误区一：直接在 scroll 事件回调里频繁 setState

* 频繁状态更新导致组件重渲染，页面卡顿

#### ❌ 误区二：仅用防抖导致滚动方向延迟感知

* 防抖延迟执行，不适合实时方向感知

#### ❌ 误区三：忽略事件监听清理，导致内存泄漏

* 必须在组件卸载时移除事件监听和取消节流

</details>

## 10. 算法 {#question-subjective-48d002d540d9}

```js
// 基础：DOM树渲染优化（考察DFS与缓存）
function renderTree(node) {
  /* 要求：
     1. 返回以node为根的DOM子树
     2. 对相同引用的节点启用缓存（参考React.memo）
  */
}

// 进阶：异步任务调度器（考察并发控制）
class Scheduler {
  constructor(max) {
    // 实现addTask方法，支持任务优先级插队
  }
  addTask(task) {}
}

// 高阶题：Hooks依赖分析器（考察AST解析）
function detectHooksViolation(code) {
  /* 要求：
     1. 解析代码中的Hooks调用
     2. 检测是否违反调用规则（如条件语句内调用）
     3. 返回错误位置及原因
  */
}
```

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-61/round-97/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-61/_index.md" >}}) · 已是最后一轮 →
