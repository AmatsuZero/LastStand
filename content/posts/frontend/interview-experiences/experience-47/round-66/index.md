+++
title = "百度-百度云-校招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/47"
experienceId = 47
roundId = 66
roundOrder = 1
company = "百度"
date = "2025-07-24T15:06:51.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-65/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-47/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-67/index.md" >}}) →

**本轮要点：** 二面重点考察前端框架理解与性能优化能力，同时关注工程化处理思维和大规模数据处理能力。

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 元素隐藏的三种方法（display:none、visibility:hidden、opacity:0）及其区别 {#question-subjective-e266174d498c}

### 题目要点

`display: none`：元素不在文档流中，不占位，无法响应事件。

<details>
<summary>参考答案</summary>

1. `display: none`：元素不在文档流中，不占位，无法响应事件。
2. `visibility: hidden`：占位但不可见，无法响应事件。
3. `opacity: 0`：占位且可响应事件（需用 `pointer-events: none` 避免）。

</details>

## 2. display:none是否影响DOM渲染性能？如何用CSS实现淡出动画？ {#question-subjective-8f3da0a071c6}

### 题目要点

`display:none` 会从渲染树中移除，提升性能，但不能用于动画过渡。

<details>
<summary>参考答案</summary>

* `display:none` 会从渲染树中移除，提升性能，但不能用于动画过渡。
* 使用 `opacity + transition` 实现淡出，再用 JS 延迟设置 `display:none`。

</details>

## 3. `Array.from({ length: 5 }, (v, i) => i * 2)` 的输出是什么？ {#question-subjective-ac93c5c2773f}

### 题目要点

输出 `[0, 2, 4, 6, 8]`。构造一个长度为 5 的数组，并通过索引乘以 2 填充。

<details>
<summary>参考答案</summary>

输出 `[0, 2, 4, 6, 8]`。构造一个长度为 5 的数组，并通过索引乘以 2 填充。

</details>

## 4. 用 `flat()` 和 `flatMap()` 实现二维数组扁平化 {#question-subjective-9e0a1106cff2}

### 题目要点

`flat()` 展开嵌套数组：`[[1,2],[3,4]].flat()` → `[1,2,3,4]`

<details>
<summary>参考答案</summary>

* `flat()` 展开嵌套数组：`[[1,2],[3,4]].flat()` → `[1,2,3,4]`
* `flatMap()` 同时映射和扁平化一层：`[[1],[2]].flatMap(x => x)` → `[1,2]`

</details>

## 5. Vue3.0里为什么要用 Proxy API 替代 defineProperty API ？ {#question-cf173a5c-bf67-4121-ad14-ed7404bc77a4}

> 题库原题：[Vue3.0里为什么要用 Proxy API 替代 defineProperty API ？](https://fe.ecool.fun/topic/cf173a5c-bf67-4121-ad14-ed7404bc77a4)

### 题目要点

在Vue 3.0中，使用Proxy API替代defineProperty API对响应式系统进行了性能和功能上的优化：

1. **性能提升**：Proxy API相较于defineProperty API在性能上有所提高，因为它拦截的是整个对象，而不需要像defineProperty那样遍历每个属性。

2. **更全面的拦截能力**：Proxy API提供了更广泛的拦截操作，包括但不限于属性的读取、设置、删除和枚举，以及对函数调用和构造函数实例化的拦截。

3. **更好的数组变化检测**：利用Proxy API，Vue 3.0能够更有效地检测数组变化，直接拦截数组索引的访问和修改。

4. **更易于处理嵌套对象**：Proxy API能够递归地拦截嵌套对象，而defineProperty则需要手动处理嵌套属性。

5. **更好的错误提示**：Proxy API提供了更佳的错误追踪和调试信息，使得开发过程中更容易发现和解决问题。

<details>
<summary>参考答案</summary>

在 Vue 3.0 中，使用 Proxy API 替代 defineProperty API 是为了改进响应式系统的性能和功能：

1. **性能提升**：Proxy API 比 defineProperty API 在许多情况下具有更好的性能。defineProperty 使用 Object.defineProperty 方法来拦截对象属性的访问和修改，但它需要遍历每个属性进行拦截。而 Proxy API 允许拦截整个对象，可以更高效地捕获对对象的访问和修改。

2. **更全面的拦截能力**：Proxy API 提供了更多的拦截方法，比 defineProperty API 更灵活、丰富。它支持拦截目标的各种操作，包括读取、设置、删除、枚举等，甚至还可以拦截函数调用和构造函数实例化。

3. **更好的数组变化检测**：Vue 3.0 使用 Proxy API 改善了数组的变化检测机制。Proxy 可以直接拦截数组的索引访问和修改，使得对数组的变化更容易被监听到，从而提供了更可靠的响应式行为。

4. **更易于处理嵌套对象**：Proxy API 能够递归地拦截对象的嵌套属性，而 defineProperty 无法自动递归处理嵌套对象。这使得在 Vue 3.0 中处理嵌套对象更加简单和方便。

5. **更好的错误提示**：相比于 defineProperty，Proxy API 提供了更好的错误追踪和调试信息。当使用 Proxy API 时，如果访问或修改了一个不存在的属性，会直接抛出错误，从而更容易发现和修复问题。

使用 Proxy API 取代 defineProperty API 是为了提升性能、增强功能，并提供更好的开发体验和错误提示。这些改进使得 Vue 3.0 的响应式系统更加高效、灵活和可靠。

</details>

## 6. 虚拟 DOM 如何通过 Diff 算法减少真实 DOM 操作？ {#question-subjective-14433822ba2a}

### 题目要点

对比前后两棵虚拟树，找出差异，只更新变更节点，避免整棵树重绘。

<details>
<summary>参考答案</summary>

对比前后两棵虚拟树，找出差异，只更新变更节点，避免整棵树重绘。

</details>

## 7. 为什么 v-for 推荐设置 key？不设置会导致什么？ {#question-subjective-2a23904c72a3}

### 题目要点

key 提供唯一标识，帮助精确判断组件复用，否则可能引发错位或状态混乱。

<details>
<summary>参考答案</summary>

key 提供唯一标识，帮助精确判断组件复用，否则可能引发错位或状态混乱。

</details>

## 8. 如何通过 Object.freeze 优化长列表性能？ {#question-subjective-80744855d485}

### 题目要点

对无需响应的数据使用 `Object.freeze` 可避免 Vue 递归转化，减少初始化开销。

<details>
<summary>参考答案</summary>

对无需响应的数据使用 `Object.freeze` 可避免 Vue 递归转化，减少初始化开销。

</details>

## 9. 文件列表页需加载10万+文件元数据，你会如何处理？ {#question-subjective-70d9fdd8d9cb}

### 题目要点

在 10 万+ 文件元数据场景下，单纯靠“加载+渲染”无法满足需求，必须结合**后端分页/检索策略**、**前端虚拟化渲染与懒加载**、**用户交互优化**三方面协同处理。目标不是让用户真的滚动浏览全部文件，而是通过合理的数据管理与体验设计，让用户在需要时能快速、流畅地找到目标文件。

<details>
<summary>参考答案</summary>

这个问题实际上考察的是候选人对**海量数据渲染、前端性能优化、交互体验设计和系统架构思维**的综合能力。10 万+ 级别的文件元数据，直接一次性加载和渲染肯定不可行，回答时需要体现“分层处理”和“权衡取舍”。

### 1. 数据获取层面的处理

* **分页/分片加载**：后端提供分页 API，每次只请求部分数据（如 100\~500 条），避免一次性返回 10 万条数据。
* **增量请求 + 滚动加载**：结合前端滚动监听，用户滚动到接近底部时再请求下一批，保持体验流畅。
* **筛选 + 搜索优先**：用户通常不会真的浏览 10 万条，更多是通过搜索、过滤来定位，所以可以优先提供检索 API，再返回精准数据。

### 2. 前端渲染层面的优化

* **虚拟列表技术**：如 React Virtualized / Vue Virtual Scroll List，仅渲染可视区域元素，随着滚动动态复用 DOM，避免 10 万节点同时挂载。
* **懒加载 + 占位符渲染**：对缩略图、文件图标、预览信息按需加载，提升初始渲染速度。
* **批量渲染 / requestIdleCallback**：大批量数据追加时，可以切片分批插入，避免一次性阻塞主线程。

### 3. 交互与体验设计

* **引导用户快速定位**：提供文件夹分类、时间排序、类型过滤、关键字搜索，减少用户滚动操作。
* **缓存与持久化**：对常用目录结果做缓存，避免每次都重新加载。可使用 IndexedDB 或 localStorage 存储部分数据。
* **后台预加载**：在用户操作间隙，提前请求下一页数据，平滑衔接。

### 4. 工程与架构考虑

* **前后端约定接口标准**：明确分页策略、排序方式、搜索维度，避免数据倾斜。
* **数据流管理**：前端需要有缓存策略与状态管理，避免重复请求。
* **异常与容错**：对大规模请求可能出现的超时、网络中断，需要有断点续传或降级方案。

</details>

## 10. 后续规划 {#question-subjective-cd4ebdaf5c6f}

### 题目要点

核心考查：后续规划的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

略

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-65/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-47/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-67/index.md" >}}) →
