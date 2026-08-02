+++
title = "小红书-社招-1年 · 第 1 轮 · 技术面试"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/93"
experienceId = 93
roundId = 154
roundOrder = 1
company = "小红书"
date = "2026-02-01T14:40:35.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-93/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-93/round-155/index.md" >}}) →

**本轮概述：** 这一轮主要考察了前端技术栈的深度和广度，包括CSS框架、响应式设计、渲染优化、Vue框架的高级特性、HTTP协议、浏览器渲染机制等方面的知识。

本轮共 22 道题。答案默认折叠，便于先自行作答。

## 1. 项目中为何选择 Tailwind CSS ？ {#question-subjective-aa8173c10147}

### 题目要点

灵活性, 可维护性, 现代前端工具链

<details>
<summary>参考答案</summary>

Tailwind CSS 是一个高度可定制的低级 CSS 框架，它提供了大量的原子类，可以快速构建一致且响应式的布局。选择 Tailwind CSS 的原因可能包括其灵活性、可维护性以及与现代前端工具链的良好集成。

</details>

## 2. Tailwind 是怎么解决样式冲突的？ {#question-fa06c194-9fab-4cf0-8cc7-dda90c2c4f97}

> 题库原题：[Tailwind 是怎么解决样式冲突的？](https://fe.ecool.fun/topic/fa06c194-9fab-4cf0-8cc7-dda90c2c4f97)

### 题目要点

Tailwind 通过原子化 utility 类、统一选择器权重、避免层级嵌套、构建期生成样式以及可预测的覆盖规则，从架构层面降低样式冲突的发生概率。它不是依赖命名规范解决冲突，而是通过设计约束和单一职责类模型，使样式天然解耦，从而让冲突可控且可预测。

<details>
<summary>参考答案</summary>

这个问题如果只回答“因为类名不会冲突”是远远不够的。

Tailwind 解决样式冲突，本质上是通过 **设计约束 + 原子化模型 + 构建期生成策略**，从源头消除冲突的产生条件，而不是事后避免覆盖。

下面从机制层面拆解。

---

# 一、传统 CSS 为什么容易冲突

传统样式冲突来自三个方面：

### 1. 选择器冲突

```css
.btn { color: red; }
.button { color: blue; }
```

不同模块命名不规范会互相覆盖。

---

### 2. 层级嵌套带来的权重问题

```css
.page .btn { ... }
```

权重升级，导致后续难以覆盖。

---

### 3. 样式全局污染

CSS 默认是全局作用域，没有隔离边界。

---

# 二、Tailwind 的核心解决思路

以 Tailwind Labs 开发的 Tailwind CSS 为例，其核心思想是：

> 不写语义类，不写组件类，只写功能类。

---

## 1. 原子化（Utility First）

```html
<div class="text-red-500 bg-blue-200 p-4">
```

每个 class 只负责一个属性：

* `text-red-500` → color
* `bg-blue-200` → background
* `p-4` → padding

不会出现“一个类定义多个属性”的情况，因此冲突范围极小。

---

## 2. 单一职责类避免交叉覆盖

传统写法：

```css
.card {
  padding: 20px;
  color: red;
}
```

如果只想改颜色，就必须覆盖整个类。

Tailwind 里：

```html
<div class="p-5 text-red-500">
```

属性天然解耦，不存在样式耦合冲突。

---

## 3. 统一的优先级策略

Tailwind 通过构建期生成 CSS，保证：

* 所有 utility class 权重一致
* 基本不使用复杂选择器
* 几乎不依赖层级嵌套

因此冲突只来自“同一属性的后写类覆盖前写类”。

例如：

```html
<div class="text-red-500 text-blue-500">
```

后者覆盖前者。

规则简单且可预测。

---

## 4. 变体机制是可控叠加

响应式、hover、focus 等都通过前缀实现：

```html
hover:text-red-500
md:text-blue-500
```

这些变体在生成 CSS 时有明确顺序规则，不依赖手写层级。

---

## 5. 构建期裁剪（避免隐性冲突）

Tailwind 使用 JIT 模式：

* 只生成使用到的类
* 不存在无关样式残留

这减少了“未知样式干扰”的可能。

---

# 三、为什么它几乎不需要 BEM

传统为了解决冲突，会使用：

* BEM
* CSS Modules
* Scoped CSS

而 Tailwind 的模型是：

* 不产生语义命名
* 不产生模块耦合
* 所有类都是扁平的功能声明

冲突空间天然极小。

---

# 四、是否完全没有冲突？

不是。

冲突仍然可能出现在：

### 1. 同一属性重复声明

```html
text-sm text-lg
```

后者覆盖前者。

---

### 2. 自定义 CSS 与 Tailwind 混用

如果写了：

```css
.button { color: red; }
```

再加：

```html
<button class="text-blue-500">
```

具体谁生效，取决于加载顺序与权重。

---

### 3. 使用 @apply 时可能回到传统问题

`@apply` 本质上是展开成普通 CSS，
如果滥用，会重新引入耦合。

---

# 五、本质总结

Tailwind 并不是“避免冲突”，而是：

* 限制表达方式
* 原子化拆解样式
* 统一权重规则
* 构建期控制输出

通过架构层面消除冲突产生的土壤。

</details>

## 3. Tailwind 的响应式断点（如 `md:`）底层如何实现？ {#question-88f58c02-0b7c-4706-9e7e-08d7509205c5}

> 题库原题：[Tailwind 的响应式断点（如 `md:`）底层如何实现？](https://fe.ecool.fun/topic/88f58c02-0b7c-4706-9e7e-08d7509205c5)

### 题目要点

Tailwind 的响应式断点基于构建期的变体系统实现。`md:` 在编译阶段被解析为 screen 变体，并根据 `screens` 配置生成对应的 `@media (min-width)` 包裹规则。所有响应式逻辑依赖原生 CSS media query，遵循 mobile-first 原则，通过规则生成管线支持多变体组合，不涉及运行时计算。

<details>
<summary>参考答案</summary>

这个问题的关键在于理解：
`md:` 不是运行时逻辑，而是 **构建期的变体（variant）展开机制**。

在 Tailwind CSS 中，响应式系统建立在三个核心之上：

* screens 配置映射
* 变体解析机制
* JIT 构建阶段规则生成

---

## 一、`md:` 本质是什么？

当写：

```html
<div class="md:text-red-500">
```

Tailwind 在构建阶段会将其解析为：

* variant：`md`
* utility：`text-red-500`

然后生成如下 CSS：

```css
@media (min-width: 768px) {
  .md\:text-red-500 {
    color: #ef4444;
  }
}
```

关键点：

* `md:` 只是一个前缀标记
* 构建阶段转换成 `@media`
* 冒号会被转义为合法 CSS 选择器

---

## 二、断点从哪里来？

断点定义在配置文件中：

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    }
  }
}
```

`md` 映射为：

```css
@media (min-width: 768px)
```

本质是一个键值映射表。

---

## 三、构建阶段做了什么？

在 JIT 模式下，流程是：

1. 扫描源码中的 class
2. 拆分出 variant 与 utility
3. 生成基础规则
4. 根据 variant 包裹规则

例如：

```html
md:hover:text-red-500
```

会解析为：

* variant1：md
* variant2：hover
* utility：text-red-500

生成结果：

```css
@media (min-width: 768px) {
  .md\:hover\:text-red-500:hover {
    color: #ef4444;
  }
}
```

可以看出，变体系统是可组合的，类似规则生成管线。

---

## 四、为什么不是运行时判断？

原因有两个：

第一，性能稳定。
所有规则提前生成，浏览器只执行标准 CSS。

第二，逻辑简单。
完全依赖浏览器原生 `@media` 机制，不需要 JS 监听 resize。

---

## 五、移动优先原则

Tailwind 默认采用 mobile-first。

写法：

```html
text-red-500 md:text-blue-500
```

含义：

* 默认红色
* 屏幕宽度 ≥ 768px 时变蓝

生成顺序保证：

* 基础规则在前
* media query 在后
* 利用 CSS 层叠覆盖

---

## 六、抽象理解

可以把 Tailwind 的响应式机制理解为：

对基础 utility 规则进行“包装”。

伪逻辑可以理解为：

```
生成基础规则
如果有 screen 变体 → 用 @media 包裹
如果有伪类变体 → 添加伪类选择器
```

这是一种构建期规则生成模型，而不是条件分支执行。

</details>

## 4. CSS 容器查询了解么 ？能否替代媒体查询？ {#question-c7844d1f-223c-41cc-b6c2-6df29d8ecc00}

> 题库原题：[什么是CSS媒体查询?](https://fe.ecool.fun/topic/c7844d1f-223c-41cc-b6c2-6df29d8ecc00)

### 题目要点

媒体查询(Media Queries)早在在css2时代就存在,经过css3的洗礼后变得更加强大bootstrap的响应式特性就是从此而来的.

<details>
<summary>参考答案</summary>

媒体查询(Media Queries)早在在css2时代就存在,经过css3的洗礼后变得更加强大bootstrap的响应式特性就是从此而来的.

简单的来讲媒体查询是一种用于修饰css何时起作用的语法.

> Media Queries 的引入，其作用就是允许添加表达式用以确定媒体的环境情况，以此来应用不同的样式表。换句话说，其允许我们在不改变内容的情况下，改变页面的布局以精确适应不同的设备。

</details>

## 5. 响应式开发中如何避免窗口大小监听导致的重排抖动？ {#question-cf82f359-6b3e-494b-ba24-11d79fabb8b8}

> 题库原题：[响应式开发中，如何避免窗口大小监听导致的重排抖动？](https://fe.ecool.fun/topic/cf82f359-6b3e-494b-ba24-11d79fabb8b8)

### 题目要点

响应式开发中 resize 导致抖动的本质原因是窗口变化会高频触发事件，从而反复触发布局计算。常见优化方式包括对 resize 事件进行节流或防抖以降低执行频率，避免在回调中混合 DOM 读写以减少强制同步布局，利用 `requestAnimationFrame` 控制更新时机，以及使用 `ResizeObserver`、媒体查询或容器查询等浏览器能力，让布局响应更多地交给浏览器完成，从而降低重排和重绘的成本。

<details>
<summary>参考答案</summary>

在响应式开发中，如果直接监听 `resize` 事件并在回调中执行布局计算或 DOM 操作，很容易引发频繁的 **重排（reflow）和重绘（repaint）**。原因在于浏览器在拖动窗口尺寸时会持续触发 `resize` 事件，如果每次触发都进行样式读取和 DOM 更新，就会造成布局计算不断被打断，从而出现明显的抖动或性能下降。

实际工程中通常会从 **事件触发频率控制、布局计算方式优化、浏览器能力利用** 三个层面进行处理。

首先是对 `resize` 事件进行频率控制。浏览器在拖拽窗口时可能每秒触发几十到上百次 `resize`，如果每次都重新计算布局，主线程压力会非常大。常见做法是通过 **节流（throttle）或防抖（debounce）** 将计算频率降低。例如在节流策略下，每隔一段时间才执行一次布局更新，从而避免在连续拖动过程中频繁触发布局计算。对于布局实时性要求较低的场景，防抖也比较适合，即在窗口停止变化后再执行计算。

其次是避免在 `resize` 回调中混合 **DOM 读写操作**。浏览器在读取布局信息（例如 `offsetWidth`、`getBoundingClientRect`）时，如果之前存在未提交的样式修改，会强制触发布局计算，这被称为 **强制同步布局（Forced Reflow）**。因此更好的方式是将读取和写入操作进行分离，例如先批量读取尺寸，再统一修改样式，或者借助 `requestAnimationFrame` 将 DOM 更新安排到浏览器下一帧执行，避免频繁打断渲染流程。

另外一个更现代的方案是尽量减少对 `window.resize` 的依赖，而是使用 **元素级尺寸监听机制**。浏览器已经提供了 `ResizeObserver` API，可以直接监听某个容器尺寸变化。当布局响应依赖的是容器宽度而不是窗口宽度时，这种方式更加精确，同时也减少无关 resize 触发带来的性能损耗。

在 CSS 层面也可以减少 JavaScript 的参与。例如使用 **媒体查询（media query）** 或 **容器查询（container query）** 来处理布局变化，让浏览器在样式计算阶段直接完成响应式适配。CSS 驱动的响应式布局通常比 JavaScript 监听 resize 更高效，因为浏览器可以对样式计算进行统一调度。

在大型前端项目中，还会进一步结合 **虚拟布局、组件级响应式控制、缓存计算结果** 等方式，避免在每次窗口变化时重新计算整个页面布局，从而减少重排的传播范围。

</details>

## 6. `requestAnimationFrame` 与 `requestIdleCallback` 在渲染优化中的执行时机差异？谁优先触发？ {#question-f142c5fe-17fd-444e-8daf-bd03d085ce69}

> 题库原题：[`requestAnimationFrame` 与 `requestIdleCallback` 在渲染优化中的执行时机差异？谁优先触发？](https://fe.ecool.fun/topic/f142c5fe-17fd-444e-8daf-bd03d085ce69)

### 题目要点

`requestAnimationFrame` 在浏览器即将进行下一帧渲染之前执行，用于动画与视觉更新，优先级高于渲染阶段后的任务。`requestIdleCallback` 只会在当前帧所有渲染任务完成且仍有剩余时间时触发，属于低优先级空闲调度机制。因此在同一帧中，rAF 必然先于 rIC 执行。rAF 用于保证帧同步，rIC 用于利用空闲时间执行非关键任务。

<details>
<summary>参考答案</summary>

这个问题本质是理解 **浏览器一帧的调度模型**。
不搞清楚一帧里发生了什么，很容易回答成“谁快谁慢”这种表层结论。

核心结论先给出：

> 在有下一帧渲染需求的情况下，`requestAnimationFrame` 一定优先于 `requestIdleCallback` 执行。
> `requestIdleCallback` 只会在当前帧还有“空闲时间”时才会触发。

下面从浏览器帧模型拆解。

---

# 一、浏览器一帧的基本流程

以 60fps 为例，一帧约 16.6ms。

一次完整渲染循环大致是：

1. 执行宏任务（例如 setTimeout）
2. 清空微任务队列
3. 触发 requestAnimationFrame 回调
4. 进行样式计算（Style）
5. 布局计算（Layout）
6. 绘制（Paint）
7. 合成（Composite）
8. 如果还有时间 → 执行 requestIdleCallback

需要明确一点：

* rAF 是“下一帧渲染前”的回调
* rIC 是“当前帧剩余时间”的回调

---

# 二、requestAnimationFrame 的执行时机

`requestAnimationFrame` 的设计目标是：

> 在浏览器即将进行下一次重绘之前执行回调。

特点：

* 每帧最多执行一次
* 与刷新率同步
* 在样式计算之前触发
* 如果标签页不可见，会暂停

执行时机可以理解为：

> 在下一帧开始渲染流程之前

示例：

```js id="z0ad4h"
requestAnimationFrame(() => {
  // 适合更新动画状态
})
```

如果在 rAF 中修改 DOM，会参与当前帧的布局与绘制。

---

# 三、requestIdleCallback 的执行时机

`requestIdleCallback` 的设计目标是：

> 利用主线程空闲时间执行低优先级任务。

它有两个触发条件：

1. 当前帧执行完所有渲染任务后仍有剩余时间
2. 或者超时（timeout）触发

示例：

```js id="dbb8k7"
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0) {
    // 做低优先级任务
  }
});
```

关键特征：

* 不保证每帧都会执行
* 如果帧很忙，可能一直被延迟
* 优先级低于渲染任务

---

# 四、两者在同一帧中的相对顺序

假设：

```js id="wj3k6a"
requestAnimationFrame(() => console.log('rAF'));
requestIdleCallback(() => console.log('rIC'));
```

执行顺序一定是：

```
rAF
rIC
```

原因：

* rAF 是渲染前任务
* rIC 是渲染后空闲任务

只要这一帧需要渲染，rAF 必然优先。

---

# 五、极端情况分析

## 情况一：主线程持续繁忙

如果 JavaScript 长时间占用主线程：

* rAF 会延迟到下一帧
* rIC 可能根本不执行

rIC 不保证执行时间。

---

## 情况二：页面不可见

* rAF 会暂停
* rIC 仍可能执行（取决于浏览器策略）

---

## 情况三：高帧率显示器

在 120Hz 下：

* 每帧时间更短（约 8ms）
* rIC 更难获得空闲时间

---

# 六、在渲染优化中的使用场景

## requestAnimationFrame 适合：

* 动画
* DOM 变更
* 视觉相关更新
* 滚动同步

因为它保证在渲染前执行。

---

## requestIdleCallback 适合：

* 预加载
* 数据预计算
* 日志上报
* 非关键计算

因为它只在空闲时间运行。

---

# 七、优先级总结

在浏览器调度优先级中：

微任务 > rAF > 渲染 > rIC

可以抽象为：

高优先级（影响视觉） → rAF
低优先级（非关键逻辑） → rIC

---

# 八、本质差异

可以从“目标函数”角度理解：

* rAF 优化的是“帧同步”
* rIC 优化的是“主线程利用率”

两者并不是竞争关系，而是不同调度通道。

</details>

## 7. Vue 中 `defineAsyncComponent` 如何结合 Webpack 的代码分割（Code Splitting）实现懒加载？ {#question-subjective-358e7bafa137}

### 题目要点

`defineAsyncComponent` 本质是对返回 Promise 的 loader 进行封装，在组件首次渲染时触发加载，并管理 loading、error 与缓存状态。Webpack 在构建阶段识别 `import()` 动态导入语法，将模块拆分为独立 chunk，实现代码分割。运行时通过 Promise 加载对应 js 文件，加载完成后 Vue 重新渲染组件。Webpack 负责拆包，Vue 负责调度与生命周期整合，两者通过动态 import 机制协作完成懒加载。

<details>
<summary>参考答案</summary>

这个问题如果只回答“它返回一个 Promise”是不够的。

要讲清楚，需要把 **Vue 运行时机制** 和 **Webpack 的动态 import 代码分割机制** 放在一起看。

核心结论先给出：

> `defineAsyncComponent` 负责“组件加载时机控制”，
> Webpack 负责“打包阶段拆分 chunk”。
> 两者通过 `import()` 这个语法点连接起来。

下面从底层链路展开。

---

# 一、Webpack 如何实现 Code Splitting

在 Webpack 中，以下写法：

```js
import('./UserPanel.vue')
```

不会被当成普通模块加载，而是被解析为 **动态导入**。

Webpack 在构建阶段会：

1. 为该模块生成一个独立 chunk
2. 输出一个单独的 js 文件
3. 把当前代码改写为“按需加载 chunk 的 runtime 逻辑”

构建结果等价于：

```js
__webpack_require__.e("chunkName").then(() => {
  return __webpack_require__("./UserPanel.vue");
});
```

本质是：

* 构建期拆包
* 运行时按需加载 js 文件
* 返回 Promise

---

# 二、defineAsyncComponent 做了什么？

在 Vue.js 3 中：

```js
import { defineAsyncComponent } from 'vue'

const AsyncUserPanel = defineAsyncComponent(() =>
  import('./UserPanel.vue')
)
```

`defineAsyncComponent` 的核心作用是：

> 把一个返回 Promise 的 loader 函数，包装成一个标准组件。

它内部做了几件事：

1. 延迟执行 loader（直到组件真正渲染）
2. 管理 loading / error 状态
3. 缓存已加载组件
4. 触发组件更新

---

# 三、完整懒加载链路

执行过程可以拆成 4 步：

## 第一步：构建阶段

Webpack 看到：

```js
import('./UserPanel.vue')
```

拆分成独立 chunk。

---

## 第二步：首次渲染

当组件出现在模板中：

```vue
<AsyncUserPanel />
```

Vue 发现这是一个异步组件。

---

## 第三步：触发 loader

`defineAsyncComponent` 调用：

```js
loader()  // 即 import(...)
```

返回 Promise。

---

## 第四步：加载 chunk

浏览器下载对应 js 文件。

下载完成后：

* Promise resolve
* Vue 将真实组件挂载
* 触发重新渲染

---

# 四、为什么这是真正的懒加载？

因为：

* 代码不在主 bundle 中
* 首屏不会加载该组件代码
* 只有渲染时才发起请求

这区别于“条件渲染但已打包进主包”的伪懒加载。

---

# 五、进阶配置能力

`defineAsyncComponent` 支持更精细控制：

```js
const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000
})
```

这在弱网或大组件场景非常重要。

---

# 六、和路由懒加载的关系

在 Vue Router 中：

```js
{
  path: '/user',
  component: () => import('./User.vue')
}
```

其实底层原理完全一样：

* 也是动态 import
* 也是 Webpack 拆 chunk
* 只是由路由系统触发加载

---

# 七、关键点区分

需要明确两个角色：

### Webpack 解决：

* 如何拆分代码
* 如何生成独立文件
* 如何按需加载资源

### Vue 解决：

* 什么时候加载
* 加载状态如何管理
* 如何与组件生命周期融合

两者职责分离。

---

# 八、常见误区

1. 直接用 `require()` 不会触发拆包
2. 静态 import 无法懒加载
3. defineAsyncComponent 不负责拆包

它只是“消费”动态 import。

---

# 九、本质抽象

可以理解为：

```text
defineAsyncComponent = 组件层的懒加载调度器
import()              = 模块层的懒加载触发器
Webpack               = 构建期拆包器
```

三者形成闭环。

</details>

## 8. 动态加载失败时的降级方案有没有 {#question-893f6941-8eb4-4c4c-9bba-0f4802d7320a}

> 题库原题：[web 应用中如何对静态资源加载失败的场景做降级处理？](https://fe.ecool.fun/topic/893f6941-8eb4-4c4c-9bba-0f4802d7320a)

### 题目要点

对静态资源加载失败进行降级处理可以通过备用资源、动态加载、服务工作者和功能降级等策略来实现。选择合适的方法可以提升应用的稳定性和用户体验，确保即使在资源加载失败时，用户也能获得良好的体验。

<details>
<summary>参考答案</summary>

在 Web 应用中，对静态资源加载失败的场景进行降级处理是确保应用稳定性和用户体验的关键。以下是一些常见的策略和方法：

### 1. **使用备用资源**

- **图片**：
  - 在 `<img>` 标签中使用 `onerror` 事件处理程序，当图片加载失败时，替换为备用图片。
  ```html
  <img src="main-image.jpg" alt="Image" onerror="this.src='fallback-image.jpg';">
  ```

- **CSS**：
  - 对于 CSS 文件，可以在 `&lt;link&gt;` 标签中设置备用 CSS 文件，但这种方式不如 JavaScript 的处理直接。通常建议使用 JavaScript 进行处理。
  ```html
  <link rel="stylesheet" href="main.css" onerror="this.href='fallback.css';">
  ```

### 2. **JavaScript 动态加载**

- **动态脚本加载**：
  - 使用 JavaScript 动态加载资源并处理加载失败情况。例如，可以使用 `fetch` 或 `XMLHttpRequest` 加载 JavaScript 文件或其他资源，并在失败时加载备用资源。
  ```javascript
  function loadScript(url, fallbackUrl) {
      const script = document.createElement('script');
      script.src = url;
      script.onerror = () => {
          script.src = fallbackUrl;
          document.head.appendChild(script);
      };
      document.head.appendChild(script);
  }

  loadScript('main-script.js', 'fallback-script.js');
  ```

- **动态样式表加载**：
  - 类似地，可以动态加载样式表并处理加载失败。
  ```javascript
  function loadStylesheet(url, fallbackUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onerror = () => {
          link.href = fallbackUrl;
      };
      document.head.appendChild(link);
  }

  loadStylesheet('main-styles.css', 'fallback-styles.css');
  ```

### 3. **利用Service Workers**

- **缓存和离线处理**：
  - 使用 Service Workers 来缓存静态资源，并提供离线访问或备用资源。在资源加载失败时，服务工作者可以提供缓存中的版本或备用资源。
  ```javascript
  // Example service worker script
  self.addEventListener('install', (event) => {
      event.waitUntil(
          caches.open('my-cache').then((cache) => {
              return cache.addAll([
                  '/main.css',
                  '/fallback.css',
                  '/main.js',
                  '/fallback.js'
              ]);
          })
      );
  });

  self.addEventListener('fetch', (event) => {
      event.respondWith(
          caches.match(event.request).then((response) => {
              return response || fetch(event.request).catch(() => {
                  return caches.match('/fallback.css'); // Or fallback.js
              });
          })
      );
  });
  ```

### 4. **Graceful Degradation**

- **功能降级**：
  - 设计时考虑功能降级，确保核心功能在静态资源加载失败时仍然可用。例如，提供基本功能和备用界面，即使某些样式或脚本没有加载成功。

### 5. **用户提示**

- 在静态资源加载失败时，向用户显示提示信息或错误页面，以告知他们发生了问题并提供解决方案或备用操作。

</details>

## 9. `keep-alive`的原理讲一下 {#question-800f499d-75d2-4f3b-9bb3-542cf21721a5}

> 题库原题：[谈谈你对Vue中keep-alive的理解](https://fe.ecool.fun/topic/800f499d-75d2-4f3b-9bb3-542cf21721a5)

### 题目要点

`<keep-alive>` 是 Vue 提供的内置组件，用于缓存那些不需要频繁创建和销毁的组件实例。这样，当这些组件再次被需要时，可以避免重新创建和渲染，从而提高性能。

- **include** 和 **exclude** 属性用于指定哪些组件需要被缓存或排除在外。
- **activated** 和 **deactivated** 钩子函数会在组件被激活或失活时触发。

`<keep-alive>` 常用于以下场景：

- 详情页：当用户查看表格中的某条数据详情时，返回时希望保持之前的筛选结果或页面状态。
- 表单：用户填写了表单内容后，如果路由跳转，返回时希望表单内容仍然保持，无需用户重新填写。

原理上，`<keep-alive>` 内部维护了一个包含组件实例的列表。当一个组件被切换到时，它会将该组件的实例添加到列表中，并记录下组件的名称。当该组件再次被切换到时，它会检查组件名称是否已经在列表中，如果是，则直接使用缓存的组件实例，而不是重新创建一个新的组件实例。

<details>
<summary>参考答案</summary>

## 什么是 keep-alive

在平常开发中，有部分组件没有必要多次初始化，这时，我们需要将组件进行持久化，使组件的状态维持不变，在下一次展示时，也不会进行重新初始化组件。

也就是说，keepalive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，或避免重新渲染，也就是所谓的组件缓存。

<keep-alive>是Vue的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染DOM。

> <keep-alive> 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 <transition> 相似，<keep-alive> 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

## include和exclude指定是否缓存某些组件

* include属性

include 包含的意思。值为字符串或正则表达式或数组。只有组件的名称与include的值相同的才会被缓存，即指定哪些被缓存，可以指定多个被缓存。这里以字符串为例，指定多个组件缓存，语法是用逗号隔开。如下：

```js
// 指定home组件和about组件被缓存
<keep-alive include="home,about" >
    <router-view></router-view>
</keep-alive>
```

* exclude属性

exclude相当于include的反义词，就是除了的意思，指定哪些组件不被缓存，用法和include类似，如下：

```js
// 除了home组件和about组件别的都缓存，本例中就是只缓存detail组件
<keep-alive exclude="home,about" >
    <router-view></router-view>
</keep-alive>
```

## 使用keep-alive的钩子函数执行顺序问题

首先使用了keep-alive的组件以后，组件上就会自动加上了`activated`钩子和`deactivated`钩子。

* `activated` 当组件被激活（使用）的时候触发 可以简单理解为进入这个页面的时候触发
* `deactivated` 当组件不被使用（inactive状态）的时候触发 可以简单理解为离开这个页面的时候触发

假设我们只缓存home组件，我们先看一下代码，再在钩子中打印出对应的顺序。就知道钩子执行的顺序了，自己动手印象深刻

```js
<template>
<div>
  <el-checkbox v-model="checked">备选项</el-checkbox>
</div>
</template>
<script>
export default {
name: "home",
data() { return { checked: false } },
created() {
  console.log("我是created钩子");
},
mounted() {
  console.log("我是mounted钩子");
},
activated() {
  console.log("我是activated钩子");
},
deactivated() {
  console.log("我是deactivated钩子");
},
beforeDestroy() {
  console.log("我是beforeDestroy钩子");所以我们可以得出结论：
},
};
</script>
```

进入组件打印结果如下：

```
我是created钩子
我是mounted钩子
我是activated钩子
```

离开组件打印结果如下：

```
我是deactivated钩子
```

得出结论：

```
初始进入和离开 created ---> mounted ---> activated --> deactivated
后续进入和离开 activated --> deactivated
```

## keep-alive的应用场景举例

* 查看表格某条数据详情页，返回还是之前的状态，比如还是之前的筛选结果，还是之前的页数等
* 填写的表单的内容路由跳转返回还在，比如input框、下选择拉框、开关切换等用户输入了一大把东西，跳转再回来不能清空啊，不用让用户再写一遍

</details>

## 10. 多级路由下如何通过 `include` 精准控制组件缓存？ {#question-subjective-92086820c842}

### 题目要点

多级路由中 `include` 的匹配依据是组件的 `name`，因此需要保证页面组件名称稳定，并将 `keep-alive` 放在合适的 `router-view` 层级，只缓存页面组件而不是布局组件。通过在路由 `meta` 中声明缓存策略，并动态维护 `include` 名单，可以实现页面级精确缓存。如果存在同一组件对应多个路由实例的情况，还需要通过 `key` 或路由信息区分组件实例，从而避免缓存冲突。

<details>
<summary>参考答案</summary>

在使用组件缓存机制时，例如 Vue 中的 `keep-alive`，`include` 的作用是通过组件名称来控制哪些组件需要被缓存。但在多级路由结构下，如果没有合理设计组件层级和命名策略，很容易出现缓存失效、缓存错乱或者无法精准控制的问题。

多级路由场景下的关键点在于：**`keep-alive` 实际缓存的是组件实例，而 `include` 的匹配依据是组件的 `name` 属性**。因此只要组件名称不稳定，或者多个路由复用同一个组件名称，就会导致缓存行为不可控。

实际项目中一般会先明确 `keep-alive` 的包裹层级。通常不会直接包裹整个 `router-view` 树，而是在某一层路由组件中对 **具体业务页面的 `router-view` 进行缓存控制**。这样可以保证只有页面级组件被缓存，而布局组件或路由容器组件不会进入缓存体系。

例如典型的后台系统结构：

```
Layout
 └── router-view
      └── PageContainer
            └── router-view
                 ├── UserList
                 ├── UserDetail
                 └── UserEdit
```

通常会在 `PageContainer` 这一层控制缓存：

```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>
```

这时 `cachedViews` 中存储的应该是 **页面组件的 name**，例如：

```
UserList
UserDetail
```

这样 `include` 就可以精准命中需要缓存的页面组件。

在多级路由场景中，还需要解决一个常见问题：**多个路由复用同一个组件，但希望缓存不同实例**。例如：

```
/article/1
/article/2
```

如果页面组件名称相同，只会缓存一个实例。工程实践中通常通过 **动态 key 或 route meta 配合缓存控制** 来解决：

```
<router-view :key="$route.fullPath" />
```

或者在路由配置中维护缓存名单：

```js
meta: {
  keepAlive: true
}
```

然后在运行时根据路由信息动态维护 `include`：

```
cachedViews = visitedRoutes
  .filter(r => r.meta.keepAlive)
  .map(r => r.name)
```

这样就可以做到：

* 只缓存声明 `keepAlive` 的页面
* 路由切换时动态更新 `include`
* 多级路由结构下依然保持缓存可控

另外一个容易被忽略的点是 **组件必须显式声明 `name`**。如果组件没有 `name`，`include` 是无法匹配到的，这在 `script setup` 语法下尤其容易遗漏，需要通过 `defineOptions({ name: 'xxx' })` 或文件名策略保证组件名称稳定。

总结来说，多级路由下精准控制组件缓存，本质上是一个 **组件命名、路由层级设计、缓存名单管理** 三者结合的问题。只要缓存控制放在合适的 `router-view` 层级，并通过稳定的组件名称和动态维护的 `include` 列表进行匹配，就可以实现比较精细的页面级缓存控制。

</details>

## 11. 缓存过多导致内存泄露如何排查？ {#question-subjective-7552e3bbc6cf}

### 题目要点

缓存过多导致的内存泄露通常表现为页面操作过程中内存持续增长且无法回收。排查过程一般先通过浏览器 Memory 或 Performance 工具确认内存趋势，再通过 Heap Snapshot 找到持续增长的对象，并沿引用链定位来源。常见原因包括 `keep-alive` 缓存无限增长、组件副作用资源未在缓存生命周期中清理，以及全局对象持有组件引用。解决方案通常包括限制缓存规模、正确管理组件生命周期中的副作用资源，以及避免全局结构持有组件实例或 DOM 引用。

<details>
<summary>参考答案</summary>

在前端应用中，如果页面使用了大量组件缓存机制，例如 `keep-alive`、页面级状态缓存、全局 store 持久化等，而缺乏合理的淘汰策略，就可能导致浏览器内存持续增长。排查这种问题的核心思路通常是：**确认内存是否持续增长 → 找到无法释放的对象 → 确定引用来源 → 修复生命周期或缓存策略**。

首先需要确认是否真的存在内存泄露。常见的方式是在浏览器开发者工具中观察内存变化趋势。通过 Chrome DevTools 的 **Performance 或 Memory 面板**记录一段时间的操作，例如不断进行页面跳转或路由切换。如果每次操作之后内存都持续增长，并且在触发垃圾回收后仍然没有明显下降，就说明存在对象没有被释放。

接下来通常会使用 **Heap Snapshot（堆快照）** 定位问题对象。对比多次快照时，可以观察哪些对象的实例数量在不断增加。例如某些组件实例、VNode、事件监听器或闭包对象持续累积。通过 DevTools 的 **Retainers（引用链）** 可以向上追踪是谁持有这些对象引用，从而定位到真正的泄露源。

在缓存相关场景中，常见的问题往往集中在几个方面。

第一类是组件缓存没有被正确淘汰。例如在使用 `keep-alive` 时，如果 `include` 列表不断增加，或者动态路由产生大量不同组件名称，就可能导致缓存组件无限增长。此时可以通过 Vue DevTools 查看组件树，确认 `keep-alive` 的缓存数量，并检查是否存在动态组件名称或路由实例导致缓存膨胀的问题。

第二类问题来自 **未销毁的副作用资源**。组件被缓存后不会触发销毁生命周期，如果在组件中注册了事件监听器、定时器、WebSocket、IntersectionObserver 等资源，而没有在 `deactivated` 或 `onUnmounted` 中清理，这些对象就会一直存在。随着缓存组件数量增加，这些资源会不断叠加，从而形成明显的内存增长。

第三类问题是 **闭包或全局引用导致对象无法释放**。例如在全局事件总线、缓存 Map、store 或单例对象中保存了组件实例、DOM 节点或回调函数引用。即使组件已经离开页面，只要这些引用还存在，垃圾回收机制就不会回收相关对象。

在定位到具体引用来源之后，通常需要从架构上做调整。例如为组件缓存设置合理的上限，动态维护 `include` 列表，避免无限增长；对于被缓存组件，将副作用资源放入 `activated` / `deactivated` 生命周期中进行注册和清理；对于全局缓存结构，则需要明确缓存淘汰策略，例如 LRU 或基于路由数量的限制。

在大型单页应用中，还可以通过自动化监控方式发现问题。例如定期采集页面内存占用数据，在用户持续操作后观察是否出现持续增长趋势。如果发现异常，再结合 Heap Snapshot 做深入分析。

</details>

## 12. vite的热更新讲一下 {#question-subjective-7dc8a627678c}

### 题目要点

Vite 的热更新机制基于原生 ES Module，在开发阶段通过模块依赖图记录模块关系，并通过文件监听捕获代码变化。发生变更后，开发服务器通过 WebSocket 向浏览器推送更新消息，浏览器端的 HMR runtime 根据模块类型执行更新。JavaScript 模块通过 `import.meta.hot.accept` 声明更新边界，框架插件负责实现组件级热替换。如果没有模块能够处理更新，则最终退化为整页刷新。Vite 热更新速度快的核心原因是无需重新打包整个应用，并且能够通过模块依赖图精确控制更新范围。

<details>
<summary>参考答案</summary>

Vite 的热更新（HMR）本质上是基于 **原生 ES Module + 浏览器模块依赖图 + WebSocket 推送更新** 的一种增量更新机制。相比传统打包工具需要先构建完整 bundle 再进行热替换，Vite 在开发阶段并不会提前打包，而是利用浏览器原生模块系统按需加载，从而让热更新过程变得更轻量。

当开发服务器启动时，Vite 会构建一份 **模块依赖图（Module Graph）**。每一个被浏览器请求的模块都会被记录，包括模块之间的 import 关系。例如一个 Vue 或 React 组件，可能依赖多个 JS、CSS 或资源文件，这些依赖关系都会被维护在这张图中。这样当某个文件发生变化时，就可以快速找到所有受影响的模块。

文件变化通常是通过 **文件系统监听（chokidar）** 捕获的。当开发者修改某个源文件时，Vite 会立即收到文件变更事件，然后在模块依赖图中定位对应的模块节点，并判断哪些模块需要更新。接下来服务器会通过 **WebSocket** 向浏览器推送更新消息，消息中包含需要更新的模块路径以及更新类型。

浏览器端在加载页面时，会自动注入 Vite 的 **HMR runtime**。这个运行时代码会与开发服务器建立 WebSocket 连接，一旦收到更新消息，就会根据更新模块的类型执行不同的策略。如果是 CSS 文件，Vite 可以直接替换对应的 `&lt;style&gt;` 标签而不刷新页面；如果是 JavaScript 模块，则会通过 `import()` 重新加载更新后的模块。

对于 JS 模块，Vite 依赖 **ESM 的 HMR 接口** 来控制更新边界。模块可以通过 `import.meta.hot.accept` 声明自己可以接受更新。如果某个模块声明了 HMR 接收逻辑，那么当该模块更新时，浏览器只会重新执行这个模块及其回调逻辑，而不会触发整页刷新。像 React、Vue 等框架都在其插件中实现了这一层封装，例如 React Fast Refresh 或 Vue 的组件热替换，从而保证组件状态在更新过程中尽量保持不丢失。

如果某个模块没有声明可以接受更新，Vite 就会沿着模块依赖图向上查找父模块，直到找到一个可以处理 HMR 的边界模块。如果始终没有找到可接受更新的模块，那么最终会退化为 **整页刷新（full reload）**。

与传统构建工具相比，Vite 热更新速度快的关键原因有两个。首先开发阶段不需要重新打包整个应用，只需要更新变动模块；其次依赖图可以精确定位影响范围，从而减少不必要的更新传播。这也是 Vite 在大型项目中依然能够保持较快开发体验的重要原因。

</details>

## 13. vite热更新（HMR）速度为何优于 Webpack？ {#question-subjective-1fc62cacd5d0}

### 题目要点

Vite 热更新速度优于 Webpack，核心原因在于开发阶段架构不同。Webpack 的 HMR 仍然依赖 bundle 体系，需要重新编译模块并生成 hot update chunk；而 Vite 基于原生 ES Module，不进行整体打包，只在模块请求时按需编译。文件变化后只需重新处理受影响模块，并通过 WebSocket 通知浏览器更新。结合 esbuild 的依赖预构建和细粒度模块更新机制，使得 Vite 在开发环境中的 HMR 通常可以达到更快的响应速度。

<details>
<summary>参考答案</summary>

Vite 的热更新速度通常明显快于传统的打包工具，其核心原因并不只是实现方式不同，而是 **开发阶段的整体架构设计发生了变化**。Vite 在开发模式下基本放弃了传统的 bundle 构建流程，而 Webpack 的 HMR 仍然依赖打包体系，这导致两者在更新路径上存在本质差异。

Webpack 在开发环境运行时，会先构建一份完整的 **模块 bundle**。当某个文件发生变化时，Webpack 需要重新编译受影响的模块，并重新生成对应的 **chunk 更新文件（hot update chunk）**。虽然 Webpack 也会利用模块依赖图进行增量编译，但编译过程仍然需要经过 **loader 处理、模块解析、AST 转换、依赖收集、chunk 生成等流程**。在项目规模较大、依赖较多的情况下，即使只是修改一个小组件，也可能触发较复杂的重新编译过程，因此 HMR 的延迟通常会比较明显。

Vite 在开发阶段采用的是完全不同的模式。服务器并不会提前打包项目，而是利用浏览器的 **原生 ES Module** 能力，让浏览器直接按模块请求代码。每个模块在首次请求时才会被即时编译，并以单独的 ESM 文件形式返回。这样开发服务器就不需要维护完整的 bundle，也就避免了每次更新都重新构建 chunk 的成本。

当代码发生变化时，Vite 只需要做两件事情：首先通过文件系统监听快速定位发生变化的文件，然后根据 **模块依赖图（Module Graph）** 找到受影响的模块。由于每个模块都是独立的 ESM 文件，因此更新过程只需要重新编译当前模块，并通过 **WebSocket** 通知浏览器重新加载该模块即可。整个过程基本不涉及复杂的打包步骤，因此响应速度通常是毫秒级。

另外一个影响速度的重要因素是 **预构建策略**。Vite 在启动阶段会使用构建工具对第三方依赖进行一次 **依赖预构建（通常由 esbuild 完成）**。这样在开发过程中，依赖包不会反复参与编译，开发服务器只需要处理应用源码模块。由于 esbuild 使用 Go 编写并且采用原生并行编译，其处理速度远快于传统 JavaScript 构建工具，这也进一步缩短了开发阶段的处理时间。

在大型项目中，模块数量往往非常多。如果使用 Webpack，每次更新可能需要重新计算模块和 chunk 的关系，而 Vite 的模块粒度更细，只会更新真正变化的模块，并通过浏览器 ESM 的缓存机制避免重复加载未变化的部分。这种 **细粒度更新策略** 是 HMR 速度差异的重要原因。

因此从整体流程来看，Webpack 的热更新仍然建立在 **“先打包再更新”** 的模式上，而 Vite 在开发模式中基本实现了 **“按需编译 + 模块级更新”**。减少打包过程、降低编译范围以及利用浏览器原生模块机制，是 Vite 热更新速度更快的主要原因。

</details>

## 14. http2.0相对于http1.0 有哪些优化 {#question-d535efce-d820-4ad3-9723-e0e7373f542f}

> 题库原题：[HTTP1.0，HTTP1.1，HTTP2.0之间有什么区别？](https://fe.ecool.fun/topic/d535efce-d820-4ad3-9723-e0e7373f542f)

### 题目要点

### HTTP1.0与HTTP1.1的区别

1. **缓存处理**：
   - **HTTP1.0**：使用`If-Modified-Since`和`Expires`作为缓存判断标准。
   - **HTTP1.1**：引入了`Entity tag`、`If-Unmodified-Since`、`If-Match`、`If-None-Match`等更多缓存控制策略。
2. **带宽优化**：
   - **HTTP1.0**：存在浪费带宽的现象，不支持断点续传。
   - **HTTP1.1**：默认支持断点续传，提高了带宽利用率。
3. **Host头处理**：
   - **HTTP1.0**：不传递主机名（hostname）。
   - **HTTP1.1**：请求和响应消息都支持Host头域，没有Host头域会报告错误。
4. **长连接**：
   - **HTTP1.0**：需要使用`keep-alive`参数建立长连接。
   - **HTTP1.1**：默认支持长连接，减少了建立和关闭连接的消耗和延迟。
5. **错误通知的管理**：
   - **HTTP1.1**：新增了24个错误状态响应码，如409（Conflict）和410（Gone）。
6. **新增请求方式**：
   - **HTTP1.1**：新增了PUT、DELETE、OPTIONS、CONNECT、TRACE等请求方式。

### HTTP2.0与HTTP1.x的区别

1. **二进制分帧**：
   - **HTTP2.0**：使用二进制格式代替文本格式，提高了协议的健壮性。
2. **多路复用（MultiPlexing）**：
   - **HTTP2.0**：允许在单一连接上并发处理多个请求和响应，提高了连接的利用率。
   - **HTTP1.x**：同一时间对同一域名下的请求数量有限制，超过限制的请求会被阻塞。
3. **header压缩**：
   - **HTTP2.0**：使用HPACK算法对header数据进行压缩，减少了需要传输的header大小。
4. **服务端推送**：
   - **HTTP2.0**：允许服务器在客户端请求之前主动推送数据，如JS和CSS文件。

### 总结

HTTP1.0是最初的HTTP协议版本，它在互联网的发展中发挥了重要作用，但随着时间的推移，它的性能限制变得越来越明显。

HTTP1.1对HTTP1.0进行了许多改进，提高了性能和安全性。然而，随着互联网的进一步发展，HTTP1.1也遇到了一些性能瓶颈，如线程阻塞、连接限制等。

HTTP2.0是在HTTP1.x基础上进行了重大改进的版本，它通过二进制分帧、多路复用、header压缩和服务端推送等机制，大幅提高了传输性能，减少了延迟和提高了吞吐量。这些改进使得HTTP2.0成为目前互联网上最常用的HTTP协议版本之一。

<details>
<summary>参考答案</summary>

## HTTP1.0 和 HTTP1.1 的一些区别

### 缓存处理

在 HTTP1.0 中主要使用 header 里的 `If-Modified-Since`（比较资源最后的更新时间是否一致）,`Expires`（资源的过期时间（取决于客户端本地时间）） 来做为缓存判断的标准。

HTTP1.1 则引入了更多的缓存控制策略：

- `Entity tag`：资源的匹配信息
- `If-Unmodified-Since`：比较资源最后的更新时间是否不一致
- `If-Match`：比较 ETag 是否一致
- `If-None-Match`：比较 ETag 是否不一致

等更多可供选择的缓存头来控制缓存策略。

### 带宽优化

HTTP1.0 中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能。

HTTP 1.1默认支持断点续传。

### Host 头处理

在 HTTP1.0 中认为每台服务器都绑定一个唯一的 IP 地址，因此，请求消息中的 URL 并没有传递主机名（hostname）。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机，并且它们共享一个 IP 地址。HTTP1.1 的请求消息和响应消息都应支持 Host 头域，且请求消息中如果没有 Host 头域会报告一个错误（400 Bad Request）。

### 长连接

HTTP1.0 需要使用`keep-alive`参数来告知服务器端要建立一个长连接，而 HTTP1.1 默认支持长连接，一定程度上弥补了 HTTP1.0 每次请求都要创建连接的缺点。

HTTP 是基于 TCP/IP 协议的，创建一个 TCP 连接是需要经过三次握手的,有一定的开销，如果每次通讯都要重新建立连接的话，对性能有影响。因此最好能维持一个长连接，可以用个长连接来发多个请求。

HTTP1.1 支持长连接（PersistentConnection）和请求的流水线（Pipelining）处理，在一个 TCP 连接上可以传送多个 HTTP 请求和响应，减少了建立和关闭连接的消耗和延迟。

### 错误通知的管理

在 HTTP1.1 中新增了 24 个错误状态响应码，如 409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。

### 新增请求方式

- PUT：请求服务器存储一个资源
- DELETE：请求服务器删除标识的资源
- OPTIONS：请求查询服务器的性能，或者查询与资源相关的选项和需求
- CONNECT：保留请求以供将来使用
- TRACE：请求服务器回送收到的请求信息，主要用于测试或诊断

## HTTP2.0 与 HTTP1.X 的区别

HTTP1.X 版本的缺陷概括来说是：线程阻塞，在同一时间，同一域名的请求有一定的数量限制，超过限制数目的请求会被阻塞。

### 二进制分帧

HTTP1.x 的解析是基于文本。基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认 0 和 1 的组合。基于这种考虑 HTTP2.0 的协议解析决定采用二进制格式，实现方便且健壮。

HTTP2.0 在 应用层(HTTP2.0)和传输层(TCP/UDP)之间增加一个二进制分帧层。在不改动 HTTP1.X 的语义、方法、状态码、URI 以及首部字段的情况下, 解决了 HTTP1.1 的性能限制，改进传输性能，实现低延迟和高吞吐量。在二进制分帧层中，HTTP2.0 会将所有传输的信息分割为更小的消息和帧（frame）,并对它们采用二进制格式的编码 ，其中 HTTP1.X 的首部信息会被封装到 HEADER frame，而相应的 Request Body 则封装到 DATA frame 里面。

- 帧：HTTP2.0 数据通信的最小单位消息：指 HTTP2.0 中逻辑上的 HTTP 消息。例如请求和响应等，消息由一个或多个帧组成。

- 流：存在于连接中的一个虚拟通道。流可以承载双向消息，每个流都有一个唯一的整数 ID。

### 多路复用（MultiPlexing）

多路复用允许同时通过单一的 HTTP2.0 连接发起多重的请求-响应消息。即是连接共享，提高了连接的利用率，降低延迟。即每一个 request 都是是用作连接共享机制的。一个 request 对应一个 id，这样一个连接上可以有多个 request，每个连接的 request 可以随机的混杂在一起，接收方可以根据 request 的 id 将 request 再归属到各自不同的服务端请求里面。

在 HTTP1.1 协议中浏览器客户端在同一时间，针对同一域名下的请求有一定数量限制。超过限制数目的请求会被阻塞。这也是为何一些站点会有多个静态资源 CDN 域名的原因之一。

当然 HTTP1.1 也可以多建立几个 TCP 连接，来支持处理更多并发的请求，但是创建 TCP 连接本身也是有开销的。

TCP 连接有一个预热和保护的过程，先检查数据是否传送成功，一旦成功过，则慢慢加大传输速度。因此对应瞬时并发的连接，服务器的响应就会变慢。所以最好能使用一个建立好的连接，并且这个连接可以支持瞬时并发的请求。

HTTP2.0 可以很容易的去实现多流并行而不用依赖建立多个 TCP 连接，同个域名只需要占用一个 TCP 连接，消除了因多个 TCP 连接而带来的延时和内存消耗。HTTP2.0 把 HTTP 协议通信的基本单位缩小为一个一个的帧，这些帧对应着逻辑流中的消息。并行地在同一个 TCP 连接上双向交换消息。

### header 压缩

HTTP1.x 的 header 带有大量信息，而且每次都要重复发送，HTTP2.0 使用 HPACK 算法对 header 的数据进行压缩，减少需要传输的 header 大小，通讯双方各自 cache 一份 header fields 表，差量更新 HTTP 头部，既避免了重复 header 的传输，又减小了需要传输的大小。

header 采取的压缩策略：

- HTTP2.0 在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键－值对，对于相同的数据，不再通过每次请求和响应发送；
- 首部表在 HTTP2.0 的连接存续期内始终存在，由客户端和服务器共同渐进地更新;
- 每个新的首部键－值对要么被追加到当前表的末尾，要么替换表中之前的值。

### 服务端推送（server push）

服务端推送是一种在客户端请求之前发送数据的机制。

服务端可以在发送页面 HTML 时主动推送其它资源，而不用等到浏览器解析到相应位置，发起请求再响应。例如服务端可以主动把 JS 和 CSS 文件推送给客户端，而不需要客户端解析 HTML 时再发送这些请求。

服务器端推送的这些资源其实存在客户端的某处地方，客户端直接从本地加载这些资源就可以了，不用走网络，速度自然是快很多的。

</details>

## 15. HTTP/2 的多路复用（Multiplexing），对比 HTTP/1.1 的长连接优化，它是如何解决队头阻塞的？ {#question-aed171b8-93ef-49cf-9347-725c3d53b563}

> 题库原题：[HTTP/2 的多路复用（Multiplexing），对比 HTTP/1.1 的长连接优化，它是如何解决队头阻塞的？](https://fe.ecool.fun/topic/aed171b8-93ef-49cf-9347-725c3d53b563)

### 题目要点

HTTP/1.1 虽然通过长连接减少了 TCP 建连成本，但同一连接中的响应必须按请求顺序返回，因此容易出现队头阻塞。HTTP/2 通过多路复用机制，将 HTTP 消息拆分为帧，并为每个请求建立独立的流，使多个请求和响应可以在同一 TCP 连接中交错传输。浏览器通过流 ID 重新组装数据，从而避免一个慢请求阻塞其他响应。不过 HTTP/2 仍然基于 TCP，因此在传输层仍可能存在丢包导致的阻塞问题。

<details>
<summary>参考答案</summary>

在 HTTP/1.1 中，性能优化主要依赖 **长连接（Keep-Alive）**。浏览器与服务器建立一次 TCP 连接后，可以在这个连接上连续发送多个 HTTP 请求，从而避免频繁的 TCP 握手开销。但 HTTP/1.1 在协议层仍然是 **串行响应模型**：即使浏览器可以连续发送多个请求，服务器返回响应时仍然必须按照请求顺序返回。

这就带来了经典的 **队头阻塞（Head-of-Line Blocking）** 问题。假设在一个连接中发送了多个请求，如果第一个请求的处理时间较长，那么后面的响应必须等待它完成之后才能返回。即使后面的资源已经准备好，也无法提前返回。这种阻塞会导致网络利用率下降，因此浏览器通常会通过 **建立多个 TCP 连接（例如 6 个并发连接）** 来缓解问题，但这又带来了额外的 TCP 建连和拥塞控制成本。

HTTP/2 的多路复用机制是从 **协议层的数据传输模型** 上改变了这种串行结构。HTTP/2 将 HTTP 消息拆分为多个更小的 **帧（Frame）**，并为每个请求分配一个唯一的 **流（Stream ID）**。所有流的数据帧可以在同一个 TCP 连接中 **交错发送**。

也就是说，在一个连接中可以同时存在多个请求和响应的数据流。例如：

* 请求 A 的响应帧
* 请求 B 的响应帧
* 请求 C 的响应帧

这些帧可以按照任意顺序在网络中交错传输，浏览器根据 **Stream ID** 将帧重新组装成完整的响应。这样服务器就不需要再按照请求顺序返回数据，而是可以 **谁准备好谁先发送**。当某个请求处理时间较长时，并不会阻塞其他请求的响应返回，从而在应用层解决了 HTTP/1.1 的队头阻塞问题。

另外，多路复用还带来了几个附带优势。由于只需要一个 TCP 连接，浏览器不再需要维护多个并发连接，从而减少了 TCP 握手、慢启动和拥塞控制带来的额外开销。同时多个请求共享带宽，网络利用率也更高。

需要注意的是，HTTP/2 虽然解决了 **应用层的队头阻塞**，但由于底层仍然运行在 **TCP** 之上，如果某个 TCP 数据包丢失，TCP 仍然需要等待该包重传才能继续向上层交付数据，这在传输层仍然可能造成阻塞。因此后来出现的 HTTP/3 通过使用 **QUIC（基于 UDP）**，在传输层进一步解决了这个问题。

</details>

## 16. HTTPS 的混合加密机制如何防止中间人攻击？ {#question-76826682-df0e-4dad-a50f-d500a09065cb}

> 题库原题：[https是如何保证安全的，又是如何保证不被中间人攻击的？](https://fe.ecool.fun/topic/76826682-df0e-4dad-a50f-d500a09065cb)

### 题目要点

**答题要点：**

HTTPS是一种安全的传输协议，通过TLS/SSL保护数据传输的安全性和隐私性。它主要通过以下方式实现：

1. **加密传输**：使用公钥加密和私钥解密技术保护数据。
2. **身份认证**：通过数字证书验证服务器和客户端的身份，防止伪装攻击。
3. **完整性校验**：利用消息摘要算法确保数据的完整性和准确性。
4. **防止重放攻击**：通过时间戳和随机数等技术防止重放攻击。
为防止中间人攻击，HTTPS采用以下措施：
1. **数字证书验证**：客户端在握手阶段验证服务器证书的真实性和合法性。
2. **主机名验证**：客户端验证证书中的域名信息，确保连接到正确的服务器。
3. **对称加密**：提高传输效率，同时需保护密钥安全。
4. **证书固定**：将服务器证书信息内置到客户端，防止证书被替换或伪造。

为确保HTTPS的安全性，需选择合适的加密算法、证书颁发机构，并正确实施证书验证和密钥保护措施。

<details>
<summary>参考答案</summary>

HTTPS 是一种基于 TLS/SSL 协议的安全传输协议，它可以通过加密和认证等措施来保护数据传输过程中的安全性和隐私性。其主要保证方式如下：

1. 加密传输：使用公钥加密技术对数据进行加密，并使用私钥进行解密，以保证在传输过程中数据不会被窃取、篡改或伪造。

2. 身份认证：使用数字证书对服务器和客户端身份进行认证，防止恶意攻击者伪装成合法用户或服务器进行攻击。

3. 完整性校验：使用消息摘要算法对传输数据进行校验，确保数据的完整性和准确性，防止数据在传输过程中被篡改或损坏。

4. 防止重放攻击：使用时间戳和随机数等技术对请求和响应进行标记，以防止恶意攻击者利用重放攻击进行攻击。

至于如何防止中间人攻击，HTTPS 主要采用以下几种方式：

1. 数字证书验证：在握手阶段，客户端会向服务器请求数字证书，然后对证书进行验证，以确认服务器身份的真实性和合法性。如果证书验证失败，则会拒绝连接，从而避免了中间人攻击的风险。

2. 主机名验证：客户端在验证数字证书时，会对证书中包含的域名信息进行匹配验证，以确保请求的是正确的服务器地址和域名。如果主机名验证失败，则同样会拒绝连接。

3. 对称加密：使用对称密钥加密算法可以提高传输效率，但需要注意在传输过程中保护密钥的安全性，以避免被中间人获取密钥并进行攻击。

4. 证书固定：一些应用程序可以将服务器证书的指纹或公钥等信息内置到客户端中，从而避免了恶意攻击者替换证书或伪造数字证书的风险。

HTTPS 可以通过加密和认证等措施来保证数据传输过程的安全性和隐私性，并防止中间人攻击等风险。但需要注意，在实际应用中，需要选择合适的加密算法、证书颁发机构和证书验证方式，并进行有效的密钥保护和网络安全管控，以保证 HTTPS 的可靠性和稳定性。

</details>

## 17. 浏览器的渲染流程详细讲一下。 {#question-61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6}

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

## 18. 重排（Reflow）与重绘（Repaint）的触发条件及性能影响？ {#question-417ebda0-3f2d-48d3-95ec-ae1838bf39cb}

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

## 19. 微任务（Microtask）与宏任务（Macrotask）的执行顺序？ {#question-d6b01c3c-e671-4edf-a739-35745ff5119e}

> 题库原题：[为什么要区分宏任务和微任务？它们的执行优先级是什么？](https://fe.ecool.fun/topic/d6b01c3c-e671-4edf-a739-35745ff5119e)

### 题目要点

宏任务（macrotask）和微任务（microtask）的区分主要是为了解决 JavaScript 引擎中不同任务之间的执行优先级问题。

<details>
<summary>参考答案</summary>

宏任务（macrotask）和微任务（microtask）的区分主要是为了解决 JavaScript 引擎中不同任务之间的执行优先级问题。

宏任务通常包括以下几种：

- setTimeout 和 setInterval 定时器
- DOM 事件处理程序
- AJAX 请求的回调函数
- script 标签的加载和执行

对于宏任务，JavaScript 引擎会将其添加到任务队列（task queue）中，在当前任务执行完毕后按顺序依次执行。

而微任务通常包括以下几种：

- Promise 的 then 方法和 catch 方法
- async/await 中的 await 表达式
- MutationObserver 监听器

对于微任务，JavaScript 引擎也会将其添加到任务队列中，但是微任务的执行在当前宏任务执行结束后立即进行，也就是说微任务具有更高的执行优先级，可以优先于下一个宏任务执行。

通过区分宏任务和微任务，我们可以更好地控制任务的执行顺序，提高应用程序的性能和响应速度。例如，在处理一些异步操作时，可以使用 Promise 来代替普通的回调函数，并通过 then 方法和 catch 方法来实现更灵活、更高效的任务处理方式。同时，在编写代码时需要注意，尽量避免在宏任务中进行耗时操作，以免影响其他任务的执行。

总之，宏任务和微任务的区分是为了更好地协调任务的执行优先级，提高 JavaScript 的运行效率和代码的可读性。

</details>

## 20. `requestAnimationFrame` 属于哪一类？ {#question-828350f9-b3d1-4593-8306-e5bc567b5c28}

> 题库原题：[谈谈对 window.requestAnimationFrame 的理解](https://fe.ecool.fun/topic/828350f9-b3d1-4593-8306-e5bc567b5c28)

### 题目要点

#### 答题思路

1. **定义与用途**：
   - 简要介绍 `window.requestAnimationFrame` 是一个告诉浏览器你希望执行动画并请求浏览器在下次重绘之前调用你指定的函数来更新动画的方法。
   - 是专门用于动画循环的函数，比传统的 `setTimeout` 或 `setInterval` 更能保证动画的平滑性和效率。

2. **工作原理**：
   - 说明 `requestAnimationFrame` 会将动画的回调函数放入浏览器的任务队列中，并在浏览器下一次重绘之前调用该函数。
   - 它的调用频率与浏览器的显示频率相匹配，通常能达到60fps（每秒60帧），从而保证了动画的流畅性。

3. **使用场景**：
   - 指出 `requestAnimationFrame` 适用于需要连续更新屏幕或执行复杂动画的场景。
   - 它特别适用于游戏开发、页面滚动效果、动态图表等需要高性能动画的应用。

4. **优点**：
   - 提及它比 `setTimeout` 或 `setInterval` 更高效，因为它只在浏览器需要重绘时才调用回调函数，减少了不必要的调用。
   - 它能更好地利用浏览器性能，因为它允许浏览器优化动画的绘制过程。

5. **注意事项**：
   - 提到如果动画在回调函数中被取消（如通过调用 `cancelAnimationFrame`），则不会再调用该回调函数。
   - 在动画结束时应该取消 `requestAnimationFrame`，以避免内存泄漏。

#### 考察要点

1. **基础知识掌握程度**：是否了解 `requestAnimationFrame` 的基本概念和工作原理。
2. **应用能力**：是否知道在哪些场景下使用 `requestAnimationFrame` 更合适。
3. **性能优化意识**：是否认识到 `requestAnimationFrame` 在性能优化方面的优势。
4. **细节处理**：是否了解如何正确取消 `requestAnimationFrame` 以避免潜在的问题。

<details>
<summary>参考答案</summary>

window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

与setTimeout相比，requestAnimationFrame最大的优势是由系统来决定回调函数的执行时机。具体一点讲，如果屏幕刷新率是60Hz,那么回调函数就每16.7ms被执行一次，如果刷新率是75Hz，那么这个时间间隔就变成了1000/75=13.3ms，换句话说就是，requestAnimationFrame的步伐跟着系统的刷新步伐走。它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。

这个API的调用很简单，如下所示：

```javascript
const element = document.getElementById('some-element-you-want-to-animate');
let start;

function step(timestamp) {
  if (start === undefined)
    start = timestamp;
  const elapsed = timestamp - start;

  //这里使用`Math.min()`确保元素刚好停在200px的位置。
  element.style.transform = 'translateX(' + Math.min(0.1 * elapsed, 200) + 'px)';

  if (elapsed < 2000) { // 在两秒后停止动画
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
```

除此之外，requestAnimationFrame还有以下两个优势：

* CPU节能：使用setTimeout实现的动画，当页面被隐藏或最小化时，setTimeout 仍然在后台执行动画任务，由于此时页面处于不可见或不可用状态，刷新动画是没有意义的，完全是浪费CPU资源。而requestAnimationFrame则完全不同，当页面处理未激活的状态下，该页面的屏幕刷新任务也会被系统暂停，因此跟着系统步伐走的requestAnimationFrame也会停止渲染，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了CPU开销。
* 函数节流：在高频率事件(resize,scroll等)中，为了防止在一个刷新间隔内发生多次函数执行，使用requestAnimationFrame可保证每个刷新间隔内，函数只被执行一次，这样既能保证流畅性，也能更好的节省函数执行的开销。一个刷新间隔内函数执行多次时没有意义的，因为显示器每16.7ms刷新一次，多次绘制并不会在屏幕上体现出来。

</details>

## 21. 实现发布订阅模式 {#question-0a146449-b17c-42f8-9029-7c56402adc98}

> 题库原题：[实现发布订阅模式](https://fe.ecool.fun/topic/0a146449-b17c-42f8-9029-7c56402adc98)

### 题目要点

发布订阅模式通过事件中心解耦消息发送者与接收者，核心实现是维护事件名与回调函数列表之间的映射关系。订阅阶段注册回调函数，发布阶段遍历执行所有监听函数，取消订阅则从列表中移除对应回调。工程实践中通常会扩展一次性订阅、事件隔离等能力，但在大型应用中需要避免滥用事件总线，以免造成事件链复杂和内存管理问题。

<details>
<summary>参考答案</summary>

发布订阅模式（Publish–Subscribe Pattern）是一种典型的 **消息通信模式**。其核心思想是将消息的发送者（Publisher）与接收者（Subscriber）进行解耦，消息不会直接发送给某个具体对象，而是发布到一个事件或主题（Topic）上，由所有订阅该事件的监听者统一接收。

在前端应用中，这种模式常用于 **组件通信、事件总线、状态变化通知、插件系统等场景**。例如一个模块只负责发布事件，而其他模块只需要订阅事件即可响应变化，双方不需要知道彼此的存在。

实现发布订阅模式通常需要三个核心能力：

* 注册订阅（subscribe / on）
* 发布事件（publish / emit）
* 取消订阅（unsubscribe / off）

本质上可以通过维护一个 **事件名 → 回调函数列表** 的映射结构来实现。

一个简单实现如下：

```javascript
class EventEmitter {
  constructor() {
    this.events = Object.create(null);
  }

  on(eventName, handler) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(handler);
  }

  emit(eventName, ...args) {
    const handlers = this.events[eventName];
    if (!handlers) return;

    handlers.forEach(fn => fn(...args));
  }

  off(eventName, handler) {
    const handlers = this.events[eventName];
    if (!handlers) return;

    this.events[eventName] = handlers.filter(fn => fn !== handler);
  }
}
```

使用方式如下：

```javascript
const bus = new EventEmitter();

function listener(data) {
  console.log("收到消息:", data);
}

bus.on("message", listener);

bus.emit("message", "hello");

bus.off("message", listener);
```

当调用 `emit` 时，会找到对应事件的所有订阅函数并依次执行，从而实现消息广播。

在工程实践中，通常还会扩展一些能力以增强可用性。例如支持 **一次性订阅（once）**，在触发一次后自动取消监听；支持 **事件队列拷贝**，避免在事件执行过程中修改数组导致遍历问题；或者支持 **命名空间事件**，方便大型系统进行事件隔离。

一个常见的 `once` 实现方式是通过包装函数：

```javascript
once(eventName, handler) {
  const wrapper = (...args) => {
    handler(...args);
    this.off(eventName, wrapper);
  };

  this.on(eventName, wrapper);
}
```

需要注意的是，在大型应用中如果发布订阅系统设计不当，也可能导致问题，例如事件链过长、调试困难或监听器未及时移除导致内存占用增加。因此在框架层面往往会限制事件总线的使用范围，更多场景通过 **状态管理（如 Redux / Pinia）或明确的数据流** 来替代。

</details>

## 22. 实现并发控制 {#question-subjective-95a9c65cee14}

### 题目要点

并发控制的核心目标是限制同一时间执行的异步任务数量。常见实现方式是构建任务队列，并维护当前执行任务计数，当运行数量小于最大并发数时从队列取出任务执行，任务完成后再调度新的任务补位。该机制本质上是一个简单的任务调度器，常用于批量请求、文件上传和资源加载等场景，在实际工程中还可以扩展重试、优先级和任务取消等能力。

<details>
<summary>参考答案</summary>

在前端工程中，并发控制通常出现在 **批量请求、任务队列、资源加载等场景**。如果一次性启动大量异步任务，例如批量请求接口或上传文件，可能会导致浏览器连接数耗尽、服务端压力过大，甚至影响页面性能。因此需要通过并发控制机制限制同一时间执行的任务数量。

常见思路是构建一个 **任务调度队列**。所有任务先进入队列，同时维护一个当前正在执行任务的计数器。当执行中的任务数量小于设定的最大并发数时，从队列中取出任务执行；当某个任务完成后，再从队列中取出新的任务补位，从而保证同一时间最多只有固定数量的任务运行。

这种机制本质上类似一个 **简单的调度器（Scheduler）**。

一个典型实现如下：

```javascript
class Scheduler {
  constructor(limit) {
    this.limit = limit;        // 最大并发数
    this.running = 0;          // 当前执行中的任务数
    this.queue = [];           // 等待队列
  }

  add(task) {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.running++;

        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.running--;
            this.next();
          });
      };

      this.queue.push(run);
      this.next();
    });
  }

  next() {
    if (this.running >= this.limit) return;
    if (this.queue.length === 0) return;

    const task = this.queue.shift();
    task();
  }
}
```

使用方式如下：

```javascript
const scheduler = new Scheduler(2);

const timeout = (time) => {
  return () =>
    new Promise(resolve => {
      setTimeout(() => {
        console.log(time);
        resolve();
      }, time);
    });
};

scheduler.add(timeout(1000));
scheduler.add(timeout(500));
scheduler.add(timeout(300));
scheduler.add(timeout(400));
```

在这个例子中，最大并发数为 2，因此同一时间只会有两个任务执行。当某个任务完成后，调度器会自动从等待队列中取出新的任务继续执行。

在工程实践中，这种并发控制通常会进一步扩展。例如在请求层封装并发控制，用于限制 API 调用数量；在文件上传场景中控制上传并发；或者在爬虫和批量数据处理任务中限制网络请求速率。有些成熟库（例如 `p-limit` 或 `p-queue`）已经对这些能力进行了封装。

另外一个常见优化是增加 **任务失败重试、优先级队列、取消任务能力** 等调度策略，从而形成一个更完整的任务调度系统。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-93/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-93/round-155/index.md" >}}) →
