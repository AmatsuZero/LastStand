+++
title = "小红书-社招-1年 · 第 2 轮 · 技术面试"
draft = false
weight = 2
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/93"
experienceId = 93
roundId = 155
roundOrder = 2
company = "小红书"
date = "2026-02-01T14:40:35.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-93/round-154/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-93/_index.md" >}}) · 已是最后一轮 →

**本轮概述：** 这一轮主要考察了项目经验和技术选型，包括Vue3+TS的选择理由、UI框架的优势、TypeScript的应用、组件化方案、Canvas离屏渲染、Service Worker等内容。

本轮共 14 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你觉的最有成就感的项目 {#question-subjective-5e97f1f58c95}

### 题目要点

实际问题, 创新性, 用户价值, 项目背景, 技术选型, 实现过程, 最终效果, 亮点, 贡献

<details>
<summary>参考答案</summary>

最有成就感的项目通常是那些能够解决实际问题、具有创新性并且对用户有显著价值的项目。在回答这个问题时，可以从项目的背景、目标、技术选型、实现过程以及最终效果等方面进行详细描述。重点突出项目的亮点和自己在其中的贡献。

</details>

## 2. 项目为什么选择Vue3+TS而非React {#question-subjective-46188abebbf3}

### 题目要点

Vue3 + TypeScript 的选择通常基于团队技术栈一致性、Composition API 带来的逻辑复用能力、与 TypeScript 的良好类型推导，以及在中后台场景中更成熟的生态和更低的工程复杂度，从而提升整体开发效率与可维护性。

<details>
<summary>参考答案</summary>

在技术选型阶段通常会综合考虑团队技术栈、项目复杂度以及开发效率等因素。对于以中后台系统或业务管理平台为主的项目，Vue3 在整体开发体验和约束能力上往往更容易形成统一规范。

首先是框架设计层面的差异。Vue3 通过 Composition API 将逻辑拆分为可组合的函数单元，在复杂业务场景下可以很好地解决 Options API 中逻辑分散的问题，同时又保留了模板语法，使得结构、逻辑、样式之间的职责划分更加清晰。对于需要长期维护的业务项目，这种组织方式通常更容易理解和维护。

其次是 TypeScript 的结合程度。Vue3 在框架层面对 TypeScript 做了较深的适配，例如 `defineComponent`、`setup`、`ref`、`reactive` 等 API 都有较完整的类型推导能力，配合 `&lt;script setup&gt;` 可以获得较好的类型提示和开发体验。在大型项目中，类型系统能够帮助提前暴露接口契约问题，提高代码的可维护性。

另外在生态与工程效率方面，Vue3 在国内中后台领域的组件生态较成熟，例如组件库、低代码平台以及相关工具链都比较完善，能够快速搭建业务系统。对于团队成员技术背景主要偏 Vue 的情况下，可以降低学习成本和沟通成本，提高整体开发效率。

从工程复杂度角度看，React 在灵活性上更强，但很多能力需要通过生态组合实现，例如状态管理、表单方案等，需要额外制定规范。Vue3 本身提供了较完整的开发范式，在团队规模较大的情况下更容易形成统一的代码风格。

</details>

## 3. NutUI在营销活动中相比其他UI框架有什么优势 {#question-subjective-6d85386cc446}

### 题目要点

移动端, 轻量, 高性能, 易于使用, 组件库, 用户体验, 开发效率, 按需加载, 应用体积

<details>
<summary>参考答案</summary>

NutUI 是一个专门为移动端设计的 UI 框架，具有轻量、高性能、易于使用等特点。在营销活动中，NutUI 的优势可能包括丰富的组件库、良好的用户体验、快速的开发效率等。此外，NutUI 还支持按需加载，可以有效减少应用体积。

</details>

## 4. ts在你的项目中有哪些应用？ {#question-subjective-e8cb500fcf21}

### 题目要点

TypeScript 在项目中的核心作用主要体现在接口数据建模、组件通信类型约束、复杂逻辑的泛型抽象、全局状态结构定义以及工程级类型声明，通过静态类型检查减少运行时错误并提升代码可维护性。

<details>
<summary>参考答案</summary>

在实际项目中，TypeScript 的使用主要体现在对业务数据结构、组件接口以及工程层面的类型约束，通过类型系统提升代码的可维护性和稳定性。

首先是在 **接口数据建模** 上。前后端接口通常会定义统一的数据类型，例如请求参数、返回数据结构以及分页模型等，通过 `interface` 或 `type` 对这些结构进行描述，可以让接口调用、数据处理以及状态管理中的数据结构保持一致。当后端接口字段发生变化时，编译阶段就能暴露问题，减少运行时错误。

其次是在 **组件层面的类型约束**。在 Vue3 组件中会对 `props`、`emits`、组件实例方法以及 `ref` 引用的 DOM 或组件实例进行类型声明。这样可以保证组件之间的调用关系更加清晰，同时在多人协作时也能形成明确的组件契约。

另外在 **复杂业务逻辑抽象** 时，TypeScript 的泛型能力比较常用。例如在封装请求函数、分页数据处理、表格组件封装或表单逻辑抽象时，通过泛型可以让同一套逻辑适配不同的数据结构，提高复用性。

在 **状态管理与全局类型约束** 方面，也会通过类型定义来约束全局状态结构，例如用户信息、权限数据或系统配置等，使得不同模块在访问全局状态时能够获得完整的类型提示。

工程层面还会通过 **类型声明文件** 扩展第三方库类型、补充环境变量类型或声明全局工具函数，使项目在编译阶段具备更强的类型校验能力。

</details>

## 5. 组件的配置化方案详细讲一下 {#question-subjective-ab4a27c56889}

### 题目要点

配置文件, 参数, 动态生成, 复用性, 灵活性, props, context, 逻辑判断, 条件渲染, Slot, 作用域插槽

<details>
<summary>参考答案</summary>

组件的配置化方案是指通过配置文件或参数来动态生成组件的行为和外观。这种方式可以提高组件的复用性和灵活性。实现时，可以使用 props 或者 context 来传递配置信息，通过逻辑判断和条件渲染来生成不同的组件。此外，还可以结合 Slot 和作用域插槽来实现更复杂的配置。

</details>

## 6. 配置化方案如何解决多活动复用与定制化需求 {#question-subjective-1152de3f40ec}

### 题目要点

配置选项, 复用, 定制化, 配置文件, 样式, 行为, 标识符, 加载, 代码复用, 开发效率

<details>
<summary>参考答案</summary>

配置化方案通过提供灵活的配置选项，可以轻松实现多活动的复用和定制化需求。例如，可以通过配置文件定义不同活动的样式和行为，然后在运行时根据活动的 ID 或其他标识符加载相应的配置。这样可以避免重复编写代码，提高开发效率。

</details>

## 7. 讲一下Props-Driven组件的封装 {#question-subjective-1091ba4ae9fc}

### 题目要点

props, 控制, 行为, 外观, 接口, 用途, 类型, 定制, 复用性, 灵活性

<details>
<summary>参考答案</summary>

Props-Driven 组件是指通过 props 来控制组件的行为和外观。封装这样的组件时，可以定义一组清晰的 props 接口，明确每个 prop 的用途和类型。通过这种方式，组件的使用者可以通过传递不同的 props 来定制组件的行为，从而提高组件的复用性和灵活性。

</details>

## 8. 为什么选择Canvas离屏渲染+WebGL而非纯CSS动画 {#question-1461ed4b-a23d-4ae7-9b00-78d10a57eb29}

> 题库原题：[canvas 性能为何会比 html/css 好？](https://fe.ecool.fun/topic/1461ed4b-a23d-4ae7-9b00-78d10a57eb29)

### 题目要点

- **直接渲染**：`<canvas>` 的绘图操作是直接的，减少了浏览器的计算开销。
- **无 DOM 操作**：避免了 DOM 更新带来的性能损耗。
- **硬件加速**：利用 GPU 加速图形渲染。
- **高效批处理**：可以进行高效的批量渲染操作。
- **细粒度控制**：允许精确控制图形的每个像素和渲染过程。

由于这些优势，`<canvas>` 在需要大量图形渲染和动画的应用场景（如游戏、数据可视化等）中表现得更为高效。

<details>
<summary>参考答案</summary>

`<canvas>` 性能优于 HTML/CSS 的原因主要涉及以下几点：

### **1. 低级别绘图操作**

- **直接绘图**：`<canvas>` 允许直接进行像素级别的绘图操作。它通过 JavaScript 提供了一个可以直接操作像素的 API，这使得绘制复杂图形和动画的性能更高，因为可以避开 DOM 和 CSS 渲染的开销。

### **2. 无 DOM 更新开销**

- **无需 DOM 操作**：使用 `<canvas>` 绘制图形时，不涉及 DOM 的增删改操作，而这些操作通常会引发重排（reflow）和重绘（repaint）。这些操作是性能开销较大的，特别是在复杂的布局和样式计算中。

### **3. 高效的渲染路径**

- **批量渲染**：`<canvas>` 允许通过一次绘制命令批量渲染多个图形，这与 HTML/CSS 的逐个渲染不同。Canvas 的绘图操作是批处理的，可以减少浏览器的渲染次数。

### **4. GPU 加速**

- **硬件加速**：现代浏览器通常对 `<canvas>` 渲染进行硬件加速，利用 GPU 处理图形渲染，从而大幅提升性能。相比之下，HTML/CSS 渲染通常依赖于 CPU 计算，尽管一些 CSS 渲染也可能得到 GPU 加速，但整体上可能不如 `<canvas>` 效率高。

### **5. 精确控制渲染**

- **像素级控制**：`<canvas>` 允许开发者精确控制每个像素的绘制方式。这种精细的控制使得开发者可以实现各种复杂的图形效果，而不必担心被 DOM 和 CSS 布局的限制。

### **6. 动画性能**

- **平滑动画**：由于 `<canvas>` 绘制的每一帧都是独立的，因此在进行动画时，它可以保持较高的帧率，特别是在进行大量绘制操作时。这种高效的帧率通常比使用 CSS 动画或 JavaScript 操作 DOM 更容易实现流畅的动画效果。

</details>

## 9. 离屏Canvas具体实现方式？ {#question-subjective-18f99cffc71b}

### 题目要点

不可见, 图形处理, 可见, 闪烁, 性能问题, createOffscreenCanvas

<details>
<summary>参考答案</summary>

离屏 Canvas 的实现方式是通过创建一个不可见的 Canvas 元素来进行图形处理，然后将处理后的图像绘制到可见的 Canvas 或其他元素上。这种方式可以避免在主 Canvas 上直接绘制导致的闪烁和性能问题。实现时，可以使用 `createOffscreenCanvas` 方法来创建离屏 Canvas。

</details>

## 10. Service Worker缓存了哪些资源 {#question-subjective-728653622145}

### 题目要点

Service Worker 一般缓存三类资源：应用的静态资源（JS、CSS、HTML 等）、部分可复用的接口数据，以及离线兜底页面或页面级资源；同时会结合运行时缓存策略和缓存版本控制，保证性能优化与资源更新之间的平衡。

<details>
<summary>参考答案</summary>

Service Worker 在浏览器中主要承担离线能力与资源缓存的职责，缓存内容通常会根据业务场景进行策略划分，而不是简单地缓存全部资源。

一般情况下首先会缓存 **应用的静态资源**。例如 HTML、JS、CSS、字体文件以及常用图片资源等，这些资源在版本发布后变化频率较低，通过预缓存（Precache）的方式在 Service Worker 安装阶段提前写入 Cache Storage，可以保证应用在离线或弱网环境下依然能够正常加载基础页面。

其次是 **接口请求数据的缓存**。对于一些变化不频繁的数据接口，例如配置数据、列表数据或公共字典数据，可以在 `fetch` 事件中通过运行时缓存（Runtime Cache）进行拦截，并根据策略选择 `Cache First`、`Network First` 或 `Stale While Revalidate` 等模式，从而在性能与数据实时性之间取得平衡。

另外在一些 PWA 场景中，还会缓存 **页面级资源或离线兜底页面**。当网络请求失败时，可以返回缓存中的 fallback 页面，保证用户体验不会出现空白或报错页面。

在实际项目中通常会对缓存进行 **版本控制与更新策略管理**，例如通过缓存名称带版本号、在 `activate` 阶段清理旧缓存等方式，避免资源更新后仍然使用旧版本缓存。

</details>

## 11. 缓存更新机制如何设计？如何避免用户看到过期活动页面？ {#question-subjective-ec4b09005dd7}

### 题目要点

缓存更新机制通常通过资源分层策略、缓存版本控制、HTML 不强缓存以及 Service Worker 主动更新实现；对于活动类强时效页面应避免缓存或使用网络优先策略，从而减少用户看到过期页面的风险。

<details>
<summary>参考答案</summary>

Service Worker 的缓存更新机制设计通常需要在 **性能、离线能力和资源实时性之间做平衡**。核心思路不是简单缓存，而是根据资源类型设计不同的更新策略，并结合版本控制与主动更新机制。

首先在缓存设计上会对资源进行分层。**静态构建资源**（如 JS、CSS、字体等）通常带有 hash 值，这类资源一旦发布基本不会变化，因此适合使用 `Cache First` 策略，通过文件名变化触发更新；而 **HTML 页面或接口数据** 则更适合 `Network First` 或 `Stale While Revalidate`，优先请求网络，以保证内容的实时性。

在缓存更新流程上，一般会通过 **缓存版本号管理**。当发布新版本时，Service Worker 的缓存名称会带版本号，例如 `app-cache-v3`。在 `activate` 生命周期中清理旧版本缓存，从而确保浏览器只保留最新资源。

针对 **用户可能看到旧页面的问题**，通常会结合几个机制：

一是 **HTML 不强缓存**。入口 HTML 通过 `Network First` 或 HTTP `no-cache` 控制，让浏览器每次优先请求服务器，这样可以确保获取最新的资源引用。

二是 **Service Worker 更新触发刷新**。当检测到新的 Service Worker 安装完成后，可以通过 `skipWaiting` 和 `clients.claim` 让新 Worker 立即接管，并通过 `postMessage` 或版本提示引导页面刷新，从而加载最新资源。

三是 **活动类页面避免缓存**。对于活动页、运营页面等强时效内容，一般不会放入 Service Worker 缓存，或者只使用短时间缓存策略，保证页面始终从网络获取最新数据。

四是 **接口数据重新验证**。对于缓存接口数据的场景，可以使用 `Stale While Revalidate`，先返回缓存数据保证速度，同时后台重新请求接口并更新缓存。

整体设计原则是：**构建资源强缓存、HTML 弱缓存、接口按策略缓存、通过版本控制与 SW 更新机制主动刷新页面**，从而既保证加载性能，又避免用户长期看到过期页面。

</details>

## 12. Service Worker失败时（如脚本更新错误）的前端兜底方案？ {#question-subjective-9ba69b0408ea}

### 题目要点

Service Worker 失败时的兜底方案通常包括注册阶段异常捕获、`fetch` 逻辑回退到默认网络请求、运行时主动注销 Service Worker、清理缓存并刷新页面，以及结合监控快速回滚版本，从而避免 Service Worker 成为页面可用性的单点风险。

<details>
<summary>参考答案</summary>

Service Worker 一旦注册成功就会接管页面请求，如果脚本更新出现异常或运行逻辑错误，可能会导致资源加载失败或页面无法正常渲染。因此在设计时通常需要提供浏览器层面的兜底机制，避免 Service Worker 成为单点故障。

首先在注册阶段需要做 **失败降级处理**。Service Worker 的注册本身是渐进增强能力，如果注册失败或初始化过程中抛出异常，应保证应用仍然可以按照传统网络请求方式运行，因此注册逻辑通常需要放在独立模块中，并对 `register` 的 Promise 做异常捕获，确保不会影响主应用启动。

其次在运行阶段要避免 **缓存策略导致资源不可恢复**。例如在 `fetch` 事件中不应该盲目拦截所有请求，而是只处理明确需要缓存的资源；如果缓存读取失败或策略执行异常，应回退到 `fetch(request)` 的默认网络请求，让浏览器直接从服务器获取资源。

另外对于 **Service Worker 脚本更新异常** 的情况，可以通过版本检测或错误上报机制进行处理。一旦发现 Service Worker 进入异常状态，可以主动执行 `registration.unregister()` 并刷新页面，使浏览器回退到无 Service Worker 的正常模式。

在用户体验层面还可以提供 **运行时降级机制**。例如在资源请求连续失败、缓存命中异常或页面初始化失败时，通过前端监控或错误捕获触发降级逻辑，清理 Cache Storage、注销 Service Worker 并重新加载页面。

同时通常会结合 **监控与日志上报**。对 Service Worker 的安装、激活、fetch 失败等事件进行埋点，一旦新版本脚本存在问题可以快速定位并回滚版本。

整体原则是让 Service Worker 成为 **可随时移除的增强能力**，即使脚本异常也能快速回退到普通 Web 加载模式，避免影响核心业务访问。

</details>

## 13. 遇到过哪些兼容性问题，怎么解决的? {#question-subjective-d52e1d0fb1e0}

### 题目要点

兼容性问题通常集中在浏览器 API、CSS 布局以及移动端交互差异上；解决方式包括使用 polyfill、构建工具自动兼容、CSS 适配方案以及能力检测后的降级处理，从而保证不同浏览器环境下的稳定运行。

<details>
<summary>参考答案</summary>

在实际项目中兼容性问题主要集中在 **浏览器 API 支持差异、CSS 渲染差异以及移动端环境差异** 等方面，需要通过降级方案或构建工具进行处理。

比较常见的是 **浏览器 API 的兼容问题**。例如部分旧浏览器不支持 `Promise`、`fetch`、`IntersectionObserver` 等 API，这类问题通常通过 polyfill 解决，例如在构建阶段通过 `core-js` 或 `babel` 自动注入兼容代码，保证低版本浏览器能够正常运行。

另外是 **CSS 布局差异**。例如 `flex`、`grid`、`vh/vw` 在不同浏览器中的表现存在细微差别，尤其是移动端 Safari 中 `100vh` 在地址栏收起或展开时会产生高度变化，这类问题一般通过动态计算高度或使用 `env(safe-area-inset-*)` 等方式进行修正，同时通过 `postcss` 自动补充浏览器前缀。

移动端还经常遇到 **事件和交互差异**。例如 iOS 上 `position: fixed` 在某些滚动容器中表现异常，或者输入框聚焦时页面被顶起，这类问题通常通过调整布局方式、避免嵌套滚动容器或在键盘弹起时动态调整页面结构解决。

还有一些 **资源加载与缓存相关问题**，例如低版本浏览器不支持 Service Worker，或者部分浏览器对缓存策略支持不同，这类情况通常采用能力检测，如果不支持相关能力就直接降级为普通网络加载。

总体处理思路是先通过 **能力检测与构建工具解决大部分兼容问题**，对于浏览器行为差异则通过样式或逻辑层面进行适配，并在项目上线前通过多浏览器测试工具进行验证。

</details>

## 14. 实现一个promise {#question-f8787bfb-ca4c-4b0f-98d9-4ad5e0a3774d}

> 题库原题：[实现 Promise](https://fe.ecool.fun/topic/f8787bfb-ca4c-4b0f-98d9-4ad5e0a3774d)

### 题目要点

核心考查：实现一个promise的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
// 模拟实现Promise
// Promise利用三大手段解决回调地狱：
// 1. 回调函数延迟绑定
// 2. 返回值穿透
// 3. 错误冒泡

// 定义三种状态
const PENDING = 'PENDING';      // 进行中
const FULFILLED = 'FULFILLED';  // 已成功
const REJECTED = 'REJECTED';    // 已失败

class Promise {
  constructor(exector) {
    // 初始化状态
    this.status = PENDING;
    // 将成功、失败结果放在this上，便于then、catch访问
    this.value = undefined;
    this.reason = undefined;
    // 成功态回调函数队列
    this.onFulfilledCallbacks = [];
    // 失败态回调函数队列
    this.onRejectedCallbacks = [];

    const resolve = value => {
      // 只有进行中状态才能更改状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 成功态函数依次执行
        this.onFulfilledCallbacks.forEach(fn => fn(this.value));
      }
    }
    const reject = reason => {
      // 只有进行中状态才能更改状态
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 失败态函数依次执行
        this.onRejectedCallbacks.forEach(fn => fn(this.reason))
      }
    }
    try {
      // 立即执行executor
      // 把内部的resolve和reject传入executor，用户可调用resolve和reject
      exector(resolve, reject);
    } catch(e) {
      // executor执行出错，将错误内容reject抛出去
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function'? onRejected :
      reason => { throw new Error(reason instanceof Error ? reason.message : reason) }
    // 保存this
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.status === PENDING) {
        self.onFulfilledCallbacks.push(() => {
          // try捕获错误
          try {
            // 模拟微任务
            setTimeout(() => {
              const result = onFulfilled(self.value);
              // 分两种情况：
              // 1. 回调函数返回值是Promise，执行then操作
              // 2. 如果不是Promise，调用新Promise的resolve函数
              result instanceof Promise ? result.then(resolve, reject) : resolve(result);
            })
          } catch(e) {
            reject(e);
          }
        });
        self.onRejectedCallbacks.push(() => {
          // 以下同理
          try {
            setTimeout(() => {
              const result = onRejected(self.reason);
              // 不同点：此时是reject
              result instanceof Promise ? result.then(resolve, reject) : resolve(result);
            })
          } catch(e) {
            reject(e);
          }
        })
      } else if (self.status === FULFILLED) {
        try {
          setTimeout(() => {
            const result = onFulfilled(self.value);
            result instanceof Promise ? result.then(resolve, reject) : resolve(result);
          });
        } catch(e) {
          reject(e);
        }
      } else if (self.status === REJECTED) {
        try {
          setTimeout(() => {
            const result = onRejected(self.reason);
            result instanceof Promise ? result.then(resolve, reject) : resolve(result);
          })
        } catch(e) {
          reject(e);
        }
      }
    });
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  static resolve(value) {
    if (value instanceof Promise) {
      // 如果是Promise实例，直接返回
      return value;
    } else {
      // 如果不是Promise实例，返回一个新的Promise对象，状态为FULFILLED
      return new Promise((resolve, reject) => resolve(value));
    }
  }
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    })
  }
  static all(promiseArr) {
    const len = promiseArr.length;
    const values = new Array(len);
    // 记录已经成功执行的promise个数
    let count = 0;
    return new Promise((resolve, reject) => {
      for (let i = 0; i < len; i++) {
        // Promise.resolve()处理，确保每一个都是promise实例
        Promise.resolve(promiseArr[i]).then(
          val => {
            values[i] = val;
            count++;
            // 如果全部执行完，返回promise的状态就可以改变了
            if (count === len) resolve(values);
          },
          err => reject(err),
        );
      }
    })
  }
  static race(promiseArr) {
    return new Promise((resolve, reject) => {
      promiseArr.forEach(p => {
        Promise.resolve(p).then(
          val => resolve(val),
          err => reject(err),
        )
      })
    })
  }
}

```

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-93/round-154/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-93/_index.md" >}}) · 已是最后一轮 →
