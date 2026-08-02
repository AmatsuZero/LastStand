+++
title = "滴滴-社招-3年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/59"
experienceId = 59
roundId = 92
roundOrder = 1
company = "滴滴"
date = "2025-07-28T03:15:10.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-93/index.md" >}}) →

**本轮要点：** z-index、布局技巧、Flexbox、优化性能、react hooks、浏览器渲染过程、浏览器的缓存机制、浏览器的垃圾回收机制

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下可视化搭建平台中魔方组件的设计与实现难点 {#question-subjective-920e774f1156}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 如何解决多模块叠加时的z-index管理问题 {#question-subjective-6898841d5b91}

### 题目要点

* `z-index` 基于层叠上下文，简单数字不能保证全局一致性
* 建立统一 z-index 管理系统（如 Z\_INDEX\_MAP）是可维护的关键
* 模块内部创建局部 stacking context，避免全局冲突
* 动态模块如拖拽、浮层应使用自动 z-index 分配策略
* 避免滥用 z-index，建议结合 portal、绝对定位和容器设计实现可控叠加

<details>
<summary>参考答案</summary>

### 考察点

- 面试官想了解你在复杂 UI 组件系统中的图层管理策略
- 探查你对 `z-index` 的工作机制、层级上下文（stacking context）的理解
- 是否具备系统化组织多模块图层关系的经验，能避免冲突和错乱

---

### 参考答案

#### 一、z-index 背后机制与问题本质

##### 1. z-index 的作用机制

- `z-index` 定义元素在“同一层叠上下文（stacking context）”中的前后顺序
- 层叠上下文由具有特定属性的元素（如`position: relative/absolute/fixed` + `z-index`）创建
- 每个层叠上下文是独立的，只影响自身子元素的层叠关系

##### 2. 可视化搭建系统的典型挑战

- 多模块（如弹窗、悬浮面板、组件拖拽层、选中态）频繁叠加，若统一用裸 `z-index` 数字管理，非常容易：
  - 维护混乱
  - 层级冲突（某组件盖住了弹窗）
  - 模块互相影响，难以解耦

---

#### 二、系统化的 z-index 管理方案

##### 1. 建立统一的层级管理规范（z-index Map）

- 在系统中定义一套统一的 z-index 枚举表，例如：

```ts
export const Z_INDEX_MAP = {
  base: 0,
  component: 10,
  floatingPanel: 100,
  modal: 1000,
  tooltip: 2000,
  dragLayer: 3000,
  globalMask: 9999,
};
````

* 所有模块只能从该映射中引用 z-index，禁止硬编码数字，避免冲突

##### 2. 模块隔离，建立明确的层叠上下文边界

* 使用 `position: relative/absolute` + `z-index`，每个模块在其容器内控制层级
* 避免所有元素在一个全局层叠上下文中争夺 z-index

##### 3. 动态 z-index 分配机制（如拖拽时临时置顶）

* 为拖拽、临时弹出等模块动态分配最高层级，例如：

```ts
let dynamicZIndex = Z_INDEX_MAP.dragLayer;
function getNextZIndex() {
  return dynamicZIndex++;
}
```

* 使多个拖拽元素在交互中可动态置顶，不影响整体秩序

##### 4. 可视化调试工具辅助

* 引入 DevTool 插件或内嵌 z-index 层级可视化辅助组件，用不同颜色或 label 显示当前模块层级，便于调试

---

#### 三、z-index 冲突的实际案例与应对策略

* **问题**：浮层 A（z-index: 200）被浮层 B（z-index: 100）遮挡
* **分析**：两者可能位于不同层叠上下文中，A 在子上下文里，B 在全局上下文中，导致 B 反而在上方
* **解决方案**：

  * 确保关键组件（如 Modal、Drawer）在顶层创建新的 stacking context
  * 或将其挂载到 `body`，通过 `portal` + 高 z-index 确保全局置顶（如 React 的 `createPortal`）

</details>

## 3. 如果商家频繁操作导致性能卡顿，如何优化 {#question-subjective-a7b7dcba653b}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 4. 性能优化做过哪些工作 {#question-subjective-bd715bac0484}

### 题目要点

- 加载性能优化：资源压缩 / 按需加载 / CDN 缓存 / 分包
- 渲染性能优化：减少重排 / 虚拟列表 / transform动画
- 交互性能优化：事件防抖 / Web Worker / 长任务切片
- 用户体验优化：骨架屏 / loading 反馈
- 能结合项目落地实际案例说明优化效果和收益

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望了解你是否具备**性能瓶颈识别、分析和优化的能力**
- 重点考察你在**不同阶段的性能优化手段**（加载性能、渲染性能、交互性能等）
- 是否有系统化的优化策略，而非零散 patch
- 是否能根据项目情况权衡性能和工程成本

---

### 参考答案

#### 一、加载性能优化（首屏/资源体积/网络请求）

##### 1. 资源压缩与优化
- 使用 `webpack` 或 `Vite` 开启 `gzip`/`brotli` 压缩，减小资源体积<br>
- 图片格式优化（WebP/AVIF），icon 使用 SVG sprite 替代多图<br>

##### 2. 资源按需加载（分包/延迟）
- `import()` 动态加载路由页面和组件，按需拆分 bundle
- 使用 Webpack 的 `SplitChunksPlugin`/`Vite Rollup manualChunks` 拆包
- 页面首次加载时仅加载首屏内容，非关键资源通过 `requestIdleCallback` 懒加载

##### 3. CDN 加速 & HTTP 缓存策略
- 静态资源放置于 CDN 并设置合理缓存头（`Cache-Control`, `ETag`）
- 使用 HTTP2/3 多路复用，减少队头阻塞

---

#### 二、渲染性能优化（DOM/动画/长列表）

##### 1. 减少不必要的 DOM 更新
- 使用 `React.memo`、`PureComponent`、Vue 的 `v-once`、`computed` 减少重复渲染
- 提取公共组件，减少重复实例化

##### 2. 虚拟滚动 & 懒加载
- 对海量数据列表使用 `VirtualList`（如 `react-window`、`vue-virtual-scroll-list`）
- 图片懒加载：原生 `loading="lazy"`，或用 `IntersectionObserver`

##### 3. 动画优化
- 优先使用 CSS3 动画，并用 `transform` 和 `opacity` 实现 GPU 加速
- 避免频繁触发重排（如修改 `width`、`top`）

---

#### 三、交互响应优化（FPS/卡顿/主线程阻塞）

##### 1. 使用 Chrome DevTools 分析帧率和 Timeline
- 识别长任务（>50ms），通过 Web Worker 拆分计算逻辑
- 使用 `requestIdleCallback` 推迟低优先级任务执行

##### 2. 事件节流/防抖
- 滚动、resize、input 事件中使用 `throttle` / `debounce` 降低事件触发频率

##### 3. 大计算拆分
- 将复杂计算逻辑通过 `setTimeout`/`requestIdleCallback` 分片执行，防止主线程卡顿

---

#### 四、用户体验优化

##### 1. 骨架屏 & 占位图
- 在首屏接口未返回前用骨架屏占位，避免白屏

##### 2. 加载指示与动画反馈
- 操作等待时使用 loading 状态避免误操作

---

#### 五、项目实战中的优化策略

- 某项目首页首屏从 5s 优化到 1.2s，主要手段包括：
  - 拆包按需加载（bundle 从 2MB 降到 700KB）
  - 图片延迟加载
  - 重构组件避免重复渲染
  - 使用骨架屏与 CDN 加速并行渲染

</details>

## 5. 用CSS实现以下布局（文字沿对角线排列）如何让文字在旋转后仍保持可读方向 {#question-subjective-61544d83619f}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 6. 说说flex布局的属性与应用场景 {#question-subjective-d444422422b3}

### 题目要点

* Flex 是一维弹性布局，主轴 + 交叉轴控制空间分配
* 父元素：`flex-direction`/`justify-content`/`align-items` 控制布局流向与对齐
* 子元素：`flex` 用于控制伸缩比例与尺寸，`order` 控制排序
* 典型应用：居中布局 / 两栏三栏 / 响应式卡片 / 固定页脚等
* Flex 优于传统布局的地方：结构简洁、响应式友好、无需额外清除浮动

<details>
<summary>参考答案</summary>

### 考察点

- 是否理解 Flex 布局的核心属性及其作用
- 能否结合实际场景灵活运用 Flex 实现常见布局（如水平居中、两端对齐等）
- 是否了解 Flex 相比传统布局的优势，以及适合使用 Flex 的典型场景

---

### 参考答案

#### 一、Flex 布局概述

Flex（Flexible Box）是 CSS3 引入的一种弹性布局方式，用于在容器中灵活分配空间，特别适用于**一维布局（横向或纵向）**，其核心是父子关系：**父元素设为 `display: flex`，子元素通过属性参与布局**。

---

#### 二、核心属性讲解

##### 1. 容器（父元素）属性

- `display: flex | inline-flex`：启用 Flex 布局
- `flex-direction`: 设置主轴方向（row/column）
- `justify-content`: 主轴对齐（start/center/space-between/...）
- `align-items`: 交叉轴对齐（stretch/center/flex-start/...）
- `flex-wrap`: 是否换行（nowrap/wrap/wrap-reverse）
- `align-content`: 多行时交叉轴整体对齐方式

##### 2. 子元素属性

- `flex-grow`: 剩余空间的放大比例
- `flex-shrink`: 空间不足时的缩小比例
- `flex-basis`: 初始主轴尺寸（可以是 px、%）
- `flex`: `flex-grow flex-shrink flex-basis` 的简写
- `align-self`: 单个项目在交叉轴的对齐方式，覆盖 `align-items`
- `order`: 定义子项渲染顺序（默认 0）

---

#### 三、常见应用场景

##### 1. 水平居中 & 垂直居中

```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
````

##### 2. 左右两端布局，中间自适应（如头部导航）

```html
<div class="container">
  <div class="left">LOGO</div>
  <div class="middle">导航</div>
  <div class="right">搜索</div>
</div>
```

```css
.container {
  display: flex;
}
.middle {
  flex: 1;
}
```

##### 3. 响应式卡片布局 + 自动换行

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.card {
  flex: 1 1 200px;
}
```

##### 4. 固定底部栏

```css
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.content {
  flex: 1;
  overflow: auto;
}
.footer {
  height: 50px;
}
```

---

#### 四、Flex 的优势

* 弹性伸缩：子项可按比例自动分配空间
* 顺序可调：不影响 DOM 顺序也可调整显示顺序（`order`）
* 更少嵌套结构：可轻松替代 float/inline-block 的布局
* 适合响应式：可搭配媒体查询动态调整方向与对齐方式

</details>

## 7. 实现usePrevious Hook记录上一次状态 {#question-subjective-0f3795520d36}

### 题目要点

* 利用 `useRef` 保持跨渲染周期的数据持久化
* 通过 `useEffect` 在每次渲染后更新 ref，确保返回的是上一次的值
* 避免直接在渲染时更新 ref，防止和当前值混淆
* 理解 Hook 的执行时机和生命周期
* 首次渲染返回 undefined，需在使用时注意容错处理

<details>
<summary>参考答案</summary>

### 考察点

- 理解 React Hook 的状态管理和闭包机制
- 能够实现自定义 Hook，掌握 `useRef` 和 `useEffect` 的配合使用
- 理解如何保存上一次渲染的状态值，并在下一次渲染时访问
- 能够区分普通变量、state 和 ref 在 Hook 中的生命周期差异

---

### 参考答案

#### 一、原理说明

`usePrevious` 是一个自定义 Hook，用来保存组件上一次渲染时某个状态或属性的值。

- React 函数组件每次渲染时，函数体内的变量都会重新声明，无法直接保存“上一次”的值。
- 通过 `useRef` 创建的 ref 对象，其 `.current` 属性在多次渲染间保持稳定，不会重置。
- 在每次渲染后，通过 `useEffect` 将当前值赋给 ref，从而在下一次渲染时能访问到上一次的值。

这利用了 React 的渲染和 Hook 特性，实现了“跨渲染周期”的数据保存。

---

#### 二、核心用法 + 示例代码

```jsx
import { useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
````

##### 使用示例：

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前计数: {count}</p>
      <p>上一次计数: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

---

#### 三、常见误区或面试陷阱

* **误区1：用 `useState` 也能保存上一次状态？**
  `useState` 触发更新时会导致组件重新渲染，并不会保存旧值的快照。`useRef` 才能跨渲染周期稳定保存。

* **误区2：不加依赖导致值不更新**
  如果 `useEffect` 依赖数组不包含 `value`，`ref.current` 可能不会更新，导致返回的值一直是旧的。

* **误区3：直接在渲染期间赋值 `ref.current = value`**
  这样会导致“上一次”与“当前”值是一样的，必须放到 `useEffect` 的副作用中保证赋值在渲染后进行。

* **注意点：首次渲染时返回值为 `undefined`**
  因为尚无上一次状态，调用方需做兼容处理。

</details>

## 8. 为什么用 useRef 而不是 useState {#question-subjective-1388e262ce1c}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 9. webpack 打包流程、优化策略 {#question-subjective-0bc027dd7c48}

### 题目要点

- Webpack 主要流程：初始化→编译入口→模块构建→Chunk 生成→资源输出
- 体积优化：Tree Shaking、代码分割、压缩混淆、合理 polyfill
- 构建性能：缓存、多线程、Loader 限制
- 运行时性能：CDN、长缓存、externals、懒加载
- Source Map 区分环境配置，兼顾调试和性能
- 结合业务需求合理权衡，避免盲目优化

<details>
<summary>参考答案</summary>

### 考察点

- 理解 Webpack 的核心打包流程及各个阶段的作用
- 熟悉常用的优化策略及其原理，能针对不同场景提出合理方案
- 掌握模块解析、构建、输出的底层逻辑
- 了解性能瓶颈来源及对应解决措施

---

### 参考答案

#### 一、Webpack 打包流程

Webpack 是一个现代前端模块打包工具，其打包流程大致分为以下几个阶段：

1. **初始化（Initialize）**<br>
   读取配置文件，初始化 Compiler 对象，加载所有配置参数（入口、输出、loader、plugin 等）。

2. **开始编译（Compile）**<br>
   根据配置的入口（Entry），开始递归解析模块依赖，构建模块依赖图。

3. **模块解析与转换（Build Modules）**<br>
   使用 Loader 逐个加载模块，转换代码（如 ES6 转 ES5、CSS 转 JS 等），并将结果缓存。

4. **完成模块构建（Seal）**<br>
   对所有模块进行分析，整理成 Chunk（代码块），准备生成最终文件。

5. **生成文件（Emit）**<br>
   根据 Chunk，生成对应的静态资源文件（如 JS、CSS、图片等），写入输出目录。

6. **完成（Done）**<br>
   打包完成，输出结果信息，执行回调。

---

#### 二、Webpack 优化策略

##### 1. 体积优化

- **Tree Shaking（摇树优化）**<br>
  利用 ES6 Module 的静态结构，剔除未引用的代码，减小打包体积。需开启 `mode=production` 和开启 `sideEffects` 配置。

- **代码分割（Code Splitting）**<br>
  利用 `import()` 动态导入和 SplitChunksPlugin，将代码拆分为多个块，按需加载，减少首屏体积。

- **压缩混淆**<br>
  使用 TerserPlugin 压缩 JS 代码，压缩 CSS（cssnano）和图片，减少文件大小。

- **减少 polyfill**<br>
  根据目标浏览器配置有选择性地加载 polyfill，避免无用代码引入。

##### 2. 构建性能优化

- **缓存**<br>
  使用 `cache`（内存或文件缓存）加速重复构建，避免重复编译相同模块。

- **多线程并行**<br>
  使用 `thread-loader` 或 `HappyPack` 并行处理 Loader，提高构建速度。

- **减少 Loader 数量和范围**<br>
  只针对必要文件配置 Loader，避免无谓转换。

##### 3. 运行时性能优化

- **CDN 和长缓存策略**<br>
  利用 CDN 分发静态资源，结合内容哈希和合理的缓存配置，提高加载速度。

- **合理配置 externals**<br>
  将大型库（如 React、Vue）设置为外部依赖，减少打包体积。

- **懒加载和预加载**<br>
  配合动态导入，实现按需加载，同时合理使用 `preload` 和 `prefetch` 资源提示。

##### 4. Source Map 配置

- 根据调试和生产环境区分，选择合适的 Source Map 类型，如 `eval-source-map`（开发）、`source-map`（生产）。

---

#### 三、总结

Webpack 打包流程核心是模块解析-转换-组合成 Chunk-输出文件，优化目标围绕“减小包体积”和“提升构建效率”展开。常见策略有代码拆分、Tree Shaking、多线程并行、缓存等。实际项目中需结合业务特点权衡方案，避免过度复杂导致构建难以维护。

</details>

## 10. DLLPlugin在Webpack5中是否有替代方案 {#question-subjective-a0bb46b0e6d6}

### 题目要点

- DLLPlugin 用于提前编译第三方库，减少重复打包<br>
- Webpack 5 持久化缓存内置且默认启用，极大提升构建性能<br>
- 模块联邦适合多应用模块共享场景，提升资源复用<br>
- SplitChunksPlugin 配合使用，合理拆分依赖<br>
- 推荐优先使用缓存机制，简化维护流程<br>
- 根据项目规模和需求权衡是否继续使用 DLLPlugin

<details>
<summary>参考答案</summary>

### 考察点

- 理解 Webpack 打包性能优化中 DLLPlugin 的作用与原理<br>
- 了解 Webpack 5 新特性及其对构建性能优化的改进<br>
- 掌握 Webpack 5 中如何替代或实现类似 DLLPlugin 功能的方案<br>
- 分析方案优缺点及应用场景

---

### 参考答案

#### 一、原理说明

- **DLLPlugin** 是 Webpack 早期为提升构建速度设计的插件，通过将第三方库（如 React、lodash 等）提前编译成动态链接库（DLL），减少每次构建时对这些库的重复打包。<br>
- 它通过生成一个 manifest 文件和一个独立的 DLL bundle，主构建过程只需引用这个 DLL，提升构建性能。<br>
- 缺点是需要额外的配置、维护多个构建步骤，且不够灵活，随着项目复杂度增长使用成本较高。

---

#### 二、Webpack 5 中的替代方案

Webpack 5 引入了内置的 **持久化缓存（Persistent Caching）** 和 **模块联邦（Module Federation）**，在很多场景下可以替代 DLLPlugin 的需求。

##### 1. **持久化缓存（Persistent Caching）**

- Webpack 5 内置了高效的文件系统缓存，缓存模块编译结果、Loader 结果等，极大减少了重复构建时间。<br>
- 配置简单，默认启用后即可获得类似 DLLPlugin 的构建加速效果，无需额外维护 DLL 代码包。<br>
- 适用于绝大多数第三方依赖和业务代码，缓存会自动失效和更新。

##### 2. **模块联邦（Module Federation）**

- 适合微前端或多应用共享依赖场景，通过运行时动态加载远程模块，减少重复打包。<br>
- 不是直接替代 DLLPlugin，但在复杂多应用环境下可以提高资源复用率和构建效率。

##### 3. **SplitChunksPlugin 优化**

- 利用 SplitChunksPlugin 做合理的第三方库拆分和缓存分离，也能减少重复打包和加快构建。

---

#### 三、总结

- Webpack 5 的持久化缓存是目前最推荐替代 DLLPlugin 的方式，降低配置复杂度且效果显著。<br>
- 模块联邦适用于更复杂的多应用共享模块需求。<br>
- DLLPlugin 仍然可以使用，但建议优先考虑内置缓存机制。<br>
- 评估项目需求、构建速度和维护成本，选择合适方案。

</details>

## 11. 编程题 {#question-subjective-a7d6eff2943d}

题目描述：

给定一组理财产品列表 products，每个产品包含 { id: string, risk: number, profit: number } 和用户风险承受等级 maxRisk，找出在风险总和不超过 maxRisk 的情况下，利润最大的产品组合（每个产品最多选一次）。<br>

示例输入：

```js
const products = [
  { id: "A", risk: 1, profit: 2 },
  { id: "B", risk: 2, profit: 5 },
  { id: "C", risk: 3, profit: 6 }
];
const maxRisk = 4;
```

期望输出：<br>

```js
{
  selected: ["B", "A"], // 或 ["A", "B"]
  totalRisk: 3,         // 1 + 2
  totalProfit: 7         // 2 + 5
}
```

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-93/index.md" >}}) →
