+++
title = "滴滴-社招-1年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/56"
experienceId = 56
roundId = 87
roundOrder = 1
company = "滴滴"
date = "2025-07-28T01:53:33.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-86/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-56/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-88/index.md" >}}) →

**本轮要点：** 浏览器渲染过程

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 简单介绍一下你上一段实习中觉得做的比较好的项目 {#question-subjective-038c546ee8da}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 想知道你们的项目大概是什么样的结构，你在开发的时候会从什么地方下手 {#question-subjective-139b60ddec82}

### 题目要点

- 理解项目结构和流程是高效开发的基础<br>
- 先从入口和路由入手，理清全局数据和功能模块<br>
- 注重调试和测试，减少开发盲点<br>
- 合理利用团队协作工具提升开发效率<br>
- 持续学习和总结，快速适应项目迭代

<details>
<summary>参考答案</summary>

### 考察点

- 理解典型前端项目的整体结构及模块划分<br>
- 掌握从项目启动到开发流程的系统思路<br>
- 能清晰描述如何快速定位入口及关键代码区域<br>
- 展示合理的开发习惯与代码管理思路<br>
- 体现对团队协作和版本控制的认知<br>

---

### 参考答案

#### 一、典型前端项目结构说明

1. **目录结构**<br>
   - `src/`：项目源码，包含页面（Page）、组件（Component）、样式（Styles）、工具函数（Utils）、状态管理（Store）等<br>
   - `public/` 或 `static/`：静态资源，如图片、字体、favicon 等<br>
   - `build/` 或 `scripts/`：构建相关脚本和配置<br>
   - `config/`：环境配置文件，如开发、测试、生产环境参数<br>
   - `tests/`：单元测试和集成测试代码<br>
   - 配置文件如 `package.json`, `.babelrc`, `webpack.config.js` 或 `vite.config.js`

2. **关键文件**<br>
   - 入口文件（如 `src/main.js`、`src/index.js`）负责挂载应用<br>
   - 路由配置文件定义页面导航<br>
   - 状态管理文件（如 Vuex、Redux）管理全局状态<br>
   - 公共组件库及工具函数模块<br>
   - API 接口封装层，统一管理后端请求<br>

---

#### 二、开发时的切入点及流程

1. **理解业务和需求**<br>
   - 先明确当前任务目标和业务逻辑<br>
   - 查阅需求文档、设计稿和接口文档<br>

2. **定位项目入口**<br>
   - 从入口文件入手，理清项目启动流程<br>
   - 理解路由配置，确定目标页面<br>

3. **代码结构梳理**<br>
   - 理解页面层与组件层的关系<br>
   - 查找关键组件和功能模块的实现<br>

4. **查看状态管理和数据流**<br>
   - 明确数据来源、流向及状态管理方式<br>
   - 理解接口调用及异步处理流程<br>

5. **搭建本地调试环境**<br>
   - 运行项目，使用调试工具分析关键逻辑<br>
   - 断点调试和打印日志，快速定位问题<br>

6. **开发和改造**<br>
   - 编写或修改代码，遵循项目编码规范<br>
   - 编写测试用例，确保功能稳定<br>
   - 进行代码审查和版本提交<br>

---

#### 三、团队协作和代码管理

- 使用版本控制工具（Git），配合分支管理<br>
- 遵守代码规范和提交规范<br>
- 利用代码评审保证质量<br>
- 持续集成（CI）确保自动化测试和构建<br>
- 定期同步需求和设计变更

</details>

## 3. IntersectionObserver的事件回调是宏任务还是微任务？如何判断呢 {#question-subjective-20e68d9ff915}

### 题目要点

* IntersectionObserver 回调属于宏任务，因为它与浏览器渲染密切相关，属于事件循环中宏任务队列执行
* 判断方法可通过输出顺序和事件循环机制分析
* 微任务一般紧跟同步代码执行后立即执行，优先级更高；宏任务通常发生在事件循环的下一轮
* 理解这点对调试异步执行顺序和性能优化很重要

<details>
<summary>参考答案</summary>

### 考察点

- 理解浏览器事件模型中宏任务（Macrotask）与微任务（Microtask）的区别<br>
- 掌握 IntersectionObserver 的执行机制和事件回调时机<br>
- 能准确判断某个异步回调属于宏任务还是微任务<br>
- 了解如何通过实验或文档验证事件类型<br>

---

### 参考答案

#### 一、核心概念说明

- **宏任务（Macrotask）**：浏览器事件循环中的任务队列，包括 `setTimeout`、`setInterval`、UI渲染、I/O事件等，每轮事件循环只执行一个宏任务<br>
- **微任务（Microtask）**：执行优先级高于宏任务，常见的有 `Promise.then`、`MutationObserver` 回调，微任务会在当前宏任务执行完后、渲染前执行完毕<br>
- 任务执行顺序：执行一个宏任务 → 执行所有微任务 → 渲染 → 下一个宏任务<br>

---

#### 二、IntersectionObserver 回调属于宏任务

- `IntersectionObserver` 的回调是在浏览器主线程空闲时异步执行，属于宏任务队列<br>
- 回调的触发依赖于浏览器的渲染帧（通常是下一次布局计算或绘制完成后触发），而非微任务的即时执行<br>

---

#### 三、判断方法（实验步骤）

1. **实验示例**

```js
console.log('script start');

const observer = new IntersectionObserver(entries => {
  console.log('IntersectionObserver callback');
});

observer.observe(document.querySelector('#target'));

Promise.resolve().then(() => {
  console.log('promise then');
});

setTimeout(() => {
  console.log('setTimeout');
}, 0);

console.log('script end');
````

2. **输出顺序分析**

* `script start`
* `script end`
* `promise then`  （微任务，紧接同步代码后执行）
* `IntersectionObserver callback` （宏任务）
* `setTimeout` （宏任务）

3. **结论**

* 观察到 `IntersectionObserver callback` 会在 `promise then` 之后，但不一定紧接着，且与 `setTimeout` 属于同类宏任务队列
* 说明它不是微任务，而是宏任务

</details>

## 4. 虚拟列表中滚动条的位置该如何确定呢？尤其是元素不定高的情况 {#question-subjective-3e30f62ed7e8}

### 题目要点

* 虚拟列表滚动条位置本质是滚动偏移量对应的内容偏移
* 固定高简单计算，不定高需动态测量并缓存高度
* 维护前缀和数组，利用二分查找定位当前滚动索引
* 通过容器高度撑开滚动条，通过内容偏移实现虚拟渲染
* 及时响应元素高度变化，动态更新缓存数据
* 以上方案既保证性能，又兼顾用户体验和准确渲染

<details>
<summary>参考答案</summary>

### 考察点

- 理解虚拟列表（虚拟滚动）的核心原理和目标<br>
- 掌握如何根据滚动位置计算可见区域和渲染元素<br>
- 了解不定高列表中滚动条位置的计算难点与解决方案<br>
- 熟悉滚动偏移管理、缓存机制与性能优化策略<br>

---

### 参考答案

#### 一、虚拟列表滚动条位置的基本概念

- 虚拟列表的核心是只渲染可视区域的少量元素，极大减少 DOM 节点，提升性能<br>
- 滚动条的位置本质上反映的是用户滚动的“偏移量”<br>
- 通过滚动偏移量计算当前可见的列表项索引，从而决定渲染哪些元素<br>

#### 二、固定高度元素场景

- 计算简单，单项高度固定，滚动条总高度 = 单项高度 × 总项数<br>
- 滚动偏移量 / 单项高度即可定位当前第一个可视项索引<br>
- 计算公式简单，性能开销低<br>

#### 三、不定高元素的挑战

- 各项高度不一，无法通过简单的乘法确定滚动条长度及当前位置对应项<br>
- 需要动态记录每项高度并维护“前缀高度和”数据结构<br>
- 滚动条总高度 = 所有项高度累加和<br>
- 滚动偏移量无法直接映射到固定索引，需要查找对应高度区间<br>

#### 四、常用解决方案

1. **动态测量和缓存每个元素高度**<br>
   - 初次渲染时通过 DOM 测量各项高度，存入数组或映射表<br>
   - 维护一个前缀和数组 `prefixHeights`，其中 `prefixHeights[i]` 表示第 `i` 项之前所有项的高度之和<br>

2. **滚动位置定位算法**<br>
   - 根据当前滚动偏移量 `scrollTop`，通过二分查找快速定位对应的项索引 `startIndex`<br>
   - `startIndex` 是满足 `prefixHeights[startIndex] <= scrollTop &lt; prefixHeights[startIndex + 1]` 的索引<br>

3. **设置滚动容器高度**<br>
   - 虚拟列表的总高度设置为所有项高度之和，即 `prefixHeights[总项数]`<br>
   - 内容容器通过 `transform: translateY(offset)` 将渲染的少量元素“偏移”到对应位置<br>

4. **元素高度变化处理**<br>
   - 监听元素尺寸变化（ResizeObserver 或其他手段），动态更新缓存<br>
   - 当某项高度变化时，更新后续 `prefixHeights` 索引的数据<br>
   - 触发列表重新计算和渲染<br>

#### 五、示例伪代码

```js
// prefixHeights示例: prefixHeights[0] = 0; prefixHeights[i] = prefixHeights[i-1] + height[i-1]

function binarySearch(prefixHeights, scrollTop) {
  let left = 0, right = prefixHeights.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (prefixHeights[mid] <= scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left - 1; // 找到对应的startIndex
}

function onScroll(scrollTop) {
  const startIndex = binarySearch(prefixHeights, scrollTop);
  // 根据startIndex和可视高度，计算渲染哪些项
  // 设置内容容器translateY = prefixHeights[startIndex]
}
````

</details>

## 5. 你这个自己实现的虚拟列表有和其他第三方插件进行对比吗 {#question-subjective-375e823ca895}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 6. 如果是在直播这种不断推送新消息的场景下，你会怎么设计呢 {#question-subjective-6da170af3e09}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 7. 对于埋点，如果用户打开页面后很快将页面关闭的话，关闭之前的操作和数据该如何获取 {#question-subjective-be3e21823b95}

### 题目要点

* 用户快速关闭页面导致数据丢失，关键在于提升最后时刻数据发送的可靠性
* `sendBeacon` 是关闭页面时异步上报的最佳实践
* 结合缓存机制和事件监听，保障数据不丢失
* 设计埋点时需兼顾性能、用户体验与数据准确度

<details>
<summary>参考答案</summary>

### 考察点

- 理解前端埋点数据采集的时效性与完整性问题<br>
- 掌握在页面关闭或跳转时，如何保证采集到关键行为数据<br>
- 了解浏览器提供的相关事件和接口（如 `beforeunload`、`visibilitychange`、`sendBeacon`）<br>
- 能设计合理方案保证用户快速关闭页面时数据可靠上报<br>

---

### 参考答案

#### 一、问题背景及核心挑战

- 用户打开页面后，如果操作很快关闭页面，常规异步上报接口（如 `fetch`、`XMLHttpRequest`）可能未完成，导致数据丢失<br>
- 传统的异步请求无法保证在页面卸载时完整发送数据<br>
- 需要机制确保“页面关闭前最后的操作数据”被可靠上报<br>

#### 二、相关浏览器机制及事件

1. **`beforeunload` / `unload` 事件**<br>
   - `beforeunload` 在页面即将卸载前触发，可用来同步处理或阻止页面关闭（部分浏览器限制阻止行为）<br>
   - `unload` 在页面卸载时触发，但异步请求通常会被中断<br>
   - 这两个事件中执行异步请求，浏览器可能无暇完成<br>

2. **`visibilitychange` 事件**<br>
   - 当页面变为不可见（切换标签页、最小化、关闭等）触发<br>
   - 可借此时机尝试数据上报，增强采集完整度<br>

3. **`Navigator.sendBeacon` API**<br>
   - 专门设计用于在页面卸载时发送少量数据<br>
   - 发送异步请求，但不阻塞页面卸载<br>
   - 兼容性较好，是关闭页面时发送埋点的首选<br>

---

#### 三、常用解决方案及实践

1. **使用 `sendBeacon` 在页面卸载时上报数据**<br>
   - 在 `beforeunload` 或 `visibilitychange`（页面变为隐藏）时，将尚未发送的埋点数据通过 `sendBeacon` 发送给服务器<br>
   - `sendBeacon` 发送的是小体积数据（如 JSON），传输可靠，且不影响页面关闭<br>

2. **缓存用户操作数据**<br>
   - 用户操作时先写入本地缓存（内存变量、`sessionStorage` 等）<br>
   - 在合适时机（定时或关键操作后）同步上报<br>
   - 关闭页面时，尽可能通过 `sendBeacon` 发送剩余缓存数据<br>

3. **结合定时上报与关闭上报**<br>
   - 定时批量上报，减少频繁请求<br>
   - 页面关闭时做最后补充上报，保证数据完整性<br>

4. **避免阻塞页面关闭**<br>
   - 不使用同步 AJAX 请求（会阻塞且用户体验差）<br>
   - 尽量避免在 `beforeunload` 阻止用户操作<br>

---

#### 四、示例代码

```js
// 缓存操作数据
let eventQueue = [];

function trackEvent(data) {
  eventQueue.push(data);
  // 也可定时上报，或达到一定量时上报
}

// 页面即将卸载时发送剩余数据
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (eventQueue.length > 0) {
      const payload = JSON.stringify(eventQueue);
      navigator.sendBeacon('/log', payload);
      eventQueue = [];
    }
  }
});

// 或者结合beforeunload
window.addEventListener('beforeunload', () => {
  if (eventQueue.length > 0) {
    const payload = JSON.stringify(eventQueue);
    navigator.sendBeacon('/log', payload);
    eventQueue = [];
  }
});
````

</details>

## 8. 看你组件库项目使用了Monorepo，介绍一下 {#question-subjective-e7313f9dbe82}

### 题目要点

- Monorepo 是大型组件库项目管理多包开发的最佳实践<br>
- 它提供了统一的依赖管理、构建和发布机制，提高开发效率和代码质量<br>
- 合理使用 Monorepo 工具链能解决多包协作的复杂性<br>
- 需要根据团队规模、项目复杂度权衡选用

<details>
<summary>参考答案</summary>

### 考察点

- 理解 Monorepo（单一代码库管理多项目）的核心概念和优势<br>
- 掌握 Monorepo 在组件库项目中的应用场景和典型实践<br>
- 理解 Monorepo 管理依赖、构建、版本发布等环节的技术细节<br>
- 了解使用 Monorepo 可能带来的挑战及解决方案<br>

---

### 参考答案

#### 一、Monorepo 的定义与核心理念

- Monorepo 指将多个相关项目（如组件库的多个包、工具、示例等）放在同一个代码仓库统一管理<br>
- 与多仓库（Multirepo）相比，Monorepo 方便跨包协作、统一依赖管理和版本控制<br>

#### 二、为什么组件库项目适合用 Monorepo

- 组件库通常包含多个子包（Button、Modal、Form 等独立包）<br>
- 各包间有依赖关系，Monorepo 方便同步改动和联调<br>
- 提高代码复用率和团队协作效率<br>
- 统一构建、测试、发布流程，减少重复配置<br>

#### 三、Monorepo 的核心环节及工具支持

1. **项目结构管理**<br>
   - 通常采用 `/packages` 目录管理各个组件包<br>
   - 根目录配置统一的 `package.json`、构建脚本、eslint 等<br>

2. **依赖管理**<br>
   - 使用工具如 `pnpm`、`Yarn Workspaces` 或 `Lerna` 实现依赖集中安装和软链接（symlink）<br>
   - 减少重复安装，加快安装速度<br>

3. **构建与打包**<br>
   - 各包独立构建，统一触发构建命令（支持增量构建）<br>
   - 利用 Rollup、Webpack 等打包工具生成适合多端使用的产物<br>

4. **版本发布和发布流程**<br>
   - 通过 Lerna 或 `changesets` 管理多包版本及发布<br>
   - 支持按需发布，避免全量发布浪费<br>

5. **代码质量与测试**<br>
   - 统一的代码规范和测试覆盖<br>
   - 支持跨包集成测试<br>

#### 四、Monorepo 典型优势

- **代码共享与复用**：公共工具、类型定义、样式等统一管理<br>
- **跨包改动一致性**：单次提交即可同时更新多个包<br>
- **统一开发体验**：统一脚本、命令、配置，降低新成员入门门槛<br>
- **提升CI效率**：增量构建、测试减少无关变动的重复工作<br>

#### 五、面临的挑战及应对措施

- **仓库体积膨胀**：通过合理拆分和清理依赖控制体积<br>
- **构建复杂度**：引入增量构建工具，缓存编译结果<br>
- **依赖关系管理复杂**：采用自动依赖图构建，严格定义依赖边界<br>
- **版本控制冲突**：规范分支和合并流程，使用代码评审工具辅助

</details>

## 9. 对比其他方式，Monorepo最大的好处是什么 {#question-subjective-7a016dd903ce}

### 题目要点

Monorepo 最大的优势在于**“多项目、多包的统一管理和跨包同步改动能力”**，这大幅提升了开发效率、版本一致性和团队协作体验，是大型复杂项目不可替代的管理方式。

<details>
<summary>参考答案</summary>

### 考察点

- 理解 Monorepo 与其他代码管理方式（如 Multirepo、多仓库）本质区别<br>
- 掌握 Monorepo 带来的核心优势和典型应用价值<br>
- 能结合实际场景说明 Monorepo 如何提升开发效率和协作体验<br>

---

### 参考答案

#### 一、Monorepo 与其他管理方式的对比

- **Multirepo（多仓库）**<br>
  - 每个项目/包独立仓库管理<br>
  - 优点：职责清晰，仓库小，权限和访问控制灵活<br>
  - 缺点：跨包改动需多个仓库协调，版本同步难度大，依赖管理复杂<br>

- **Monorepo（单仓库）**<br>
  - 所有项目/包统一存放在一个仓库<br>
  - 优点：集中管理依赖、版本和代码，方便跨包协作和同步改动<br>
  - 缺点：仓库体积大，构建和管理需要更复杂工具支持<br>

#### 二、Monorepo 最大的好处

- **跨包改动和协作效率极大提升**<br>
  - 在单个提交中同步修改多个包，避免跨仓库版本不一致和发布延迟问题<br>
  - 开发者可以轻松引用和调试多个包的代码，减少调试和联调成本<br>

- **统一依赖和版本管理**<br>
  - 依赖安装统一，避免版本冲突和重复安装<br>
  - 版本发布可统一控制，实现一致性版本号或按需发布<br>

- **增强代码复用和共享**<br>
  - 公共代码、工具、样式、类型定义等集中管理<br>
  - 减少重复开发，提升代码质量和一致性<br>

- **简化开发和CI流程**<br>
  - 统一构建、测试和发布脚本，提升自动化水平<br>
  - 利用增量构建和缓存，提升构建速度<br>

#### 三、实际应用场景体现的优势

- 大型组件库（如 Ant Design、Material UI）采用 Monorepo，实现了数十个子包的高效管理<br>
- 微服务或微前端架构中，Monorepo 方便统一管理多个子应用或模块<br>
- 团队规模较大时，Monorepo 统一规范减少沟通成本

</details>

## 10. 你上一家实习公司的主要业务有了解过吗 {#question-subjective-559d155b8538}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 11. 算法题 {#question-subjective-a75064e6183f}

- （1）lc LCR 091. 粉刷房子
- （2）数组扁平化（后面要求尾递归实现）

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-86/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-56/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-88/index.md" >}}) →
