+++
title = "阿里巴巴-社招-5年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/64"
experienceId = 64
roundId = 104
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T13:12:16.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-103/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-64/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-105/index.md" >}}) →

**本轮要点：** 浏览器的缓存机制、react hooks

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 魔方组件的整体架构设计，包括其模块划分和核心功能 {#question-subjective-ec00bef3ae1f}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 你们是如何选择技术栈的？有哪些关键因素影响了决策 {#question-subjective-5fbb94f70c45}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 魔方组件如何实现动态加载，以提升初始加载性能 {#question-subjective-6609cb7e68a2}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 4. 魔方组件如何管理组件的配置信息？组件之间的通信是如何处理的 {#question-subjective-6341793e1f2f}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 5. 三维模型的加载性能，将加载时间从10秒缩短至3秒都做了哪些操作 {#question-subjective-1c18a4d18c05}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 6. 这个项目中在移动端，你们是如何处理不同设备的适配问题的 {#question-subjective-eccb4b551bdc}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 7. 有没有用服务端渲染（SSR）？如果有，你们是如何实现的 {#question-subjective-d2890bee3f50}

### 题目要点

- SSR 是服务器预先渲染页面，提高首屏性能和 SEO<br>
- 常用框架有 Next.js、Nuxt.js，也可自研实现<br>
- 实现时结合服务器渲染和客户端 Hydration 完成完整页面交互<br>
- 需处理代码共享、数据预取、样式加载及性能优化<br>
- 了解 SSR 的局限性和优化难点，合理权衡使用场景

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 SSR 的基本概念和优势<br>
- 掌握常见 SSR 实现方案及其原理<br>
- 理解 SSR 与客户端渲染（CSR）的区别和协同方式<br>
- 了解 SSR 在项目中的具体落地方法和技术选型<br>

---

## 二、参考答案

### 2.1 SSR 的基本概念

- SSR（Server-Side Rendering）是指在服务器端完成页面的 HTML 渲染，再将完整的 HTML 返回给客户端<br>
- 相比纯客户端渲染，SSR 提升了首屏渲染速度和 SEO 友好性<br>
- 用户拿到的是已渲染好的页面，浏览器可以更快显示内容<br>

### 2.2 SSR 的优势和适用场景

- **首屏速度快**：浏览器无需等待大量 JS 执行即可显示页面<br>
- **SEO 优化**：搜索引擎能抓取到完整的内容，提升排名<br>
- **社交分享友好**：分享链接时可显示完整预览<br>
- **适合内容型或公共站点**，电商、新闻、博客等场景<br>

### 2.3 常见 SSR 实现方案

- **Next.js**（React）：提供开箱即用的 SSR 支持和静态生成<br>
- **Nuxt.js**（Vue）：Vue 生态的 SSR 框架，支持服务端渲染和静态导出<br>
- **自研 SSR**：使用 Node.js 搭配 ReactDOMServer 或 Vue SSR API 手动实现<br>
- **传统模板引擎**：如 EJS、Handlebars 等，服务器渲染 HTML<br>

### 2.4 我们项目中 SSR 的实现方式

- 使用了 [Next.js / Nuxt.js / 自研 SSR] 作为 SSR 框架<br>
- 服务器通过 Node.js 环境调用 ReactDOMServer.renderToString 或 Vue SSR 的 renderToString，生成完整 HTML<br>
- 结合路由系统，实现根据请求 URL 渲染对应页面<br>
- 页面返回时携带初始数据（通过服务端数据预取），客户端接管 Hydration，实现页面交互<br>
- 结合缓存策略，优化性能和响应速度<br>
- 配合 Webpack 和 Babel，保证服务端代码和客户端代码一致性<br>

### 2.5 实现过程中需注意的问题

- 服务端和客户端代码共享及差异处理（避免浏览器 API 直接调用）<br>
- 初始数据的获取与注入，保证页面完整性和交互<br>
- 处理样式加载，避免闪烁（FOUC）<br>
- 性能优化，如页面缓存、资源压缩和异步加载<br>
- 服务器负载和扩展性考虑<br>

---

## 三、常见误区或面试陷阱

- ❌ 认为 SSR 只是在服务器渲染静态 HTML，忽略客户端 Hydration<br>
- ❌ 忽视服务端渲染的性能开销和状态同步难题<br>
- ❌ 直接复用客户端代码，未处理服务端无 DOM 的环境差异<br>
- ❌ 忽略 SEO 以外的性能和用户体验提升点

</details>

## 8. 项目中使用了哪些状态管理工具？为什么选择这些工具 {#question-subjective-3785aa20675d}

### 题目要点

- 状态管理工具选择基于项目规模、团队经验和性能需求<br>
- Redux 适合大型复杂应用，MobX 适合响应式需求<br>
- Context 适合轻量局部状态管理<br>
- 结合工具生态和中间件支持，提升开发效率和维护性<br>
- 合理划分全局与局部状态，避免状态管理复杂化

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解不同状态管理工具的特点及适用场景<br>
- 掌握项目中选择状态管理工具的决策逻辑<br>
- 能清晰阐述所选工具带来的优势和解决的问题<br>
- 了解状态管理的基本概念和复杂度控制方法<br>

---

## 二、参考答案

### 2.1 项目中使用的状态管理工具

- **Redux**<br>
  - 适用于大型复杂应用，状态集中管理<br>
  - 具备时间旅行调试、可预测状态变更、丰富中间件生态<br>
- **MobX**<br>
  - 响应式状态管理，自动追踪依赖，适合数据驱动视图更新<br>
  - 代码简洁，学习曲线较低<br>
- **React Context + useReducer/useState**<br>
  - 轻量级状态共享方案，适合中小型或局部状态管理<br>
- **Recoil / Zustand / Valtio 等轻量方案**<br>
  - 现代灵活的状态管理，适合部分场景需求<br>
- **Vuex（Vue 项目）**<br>
  - Vue 官方状态管理库，集中管理全局状态，支持插件扩展<br>

### 2.2 选择这些工具的理由

- **项目规模与复杂度**<br>
  - 大型项目选 Redux 保障状态可控、流程清晰<br>
  - 轻量项目用 Context 或 MobX 提高开发效率<br>

- **团队技术栈和经验**<br>
  - 团队熟悉 Redux 或 MobX，降低学习成本<br>
  - React 项目优先选社区活跃、文档完善的工具<br>

- **性能考虑**<br>
  - MobX 响应式性能好，避免不必要渲染<br>
  - Redux 结合 memo、reselect 等优化渲染<br>

- **维护和扩展性**<br>
  - Redux 强调不可变数据和纯函数，利于维护和测试<br>
  - Context 适合简单状态，避免引入复杂依赖<br>

- **生态系统支持**<br>
  - Redux 拥有丰富的中间件和开发者工具支持<br>
  - Vuex 与 Vue 生态深度整合，便于插件和模块管理<br>

### 2.3 实际应用中的使用场景举例

- **全局认证信息、用户权限、主题切换等使用 Redux 或 Vuex**<br>
- **局部组件状态使用 useState 或 Context 管理**<br>
- **表单状态、异步请求状态使用 MobX 或 Recoil**<br>
- **结合异步中间件（Redux Thunk / Saga）处理复杂异步流程**<br>

---

## 三、常见误区或面试陷阱

- ❌ 误以为所有状态都必须放在全局管理，导致状态膨胀<br>
- ❌ 忽视工具本身性能，错误使用导致频繁无效渲染<br>
- ❌ 忽略团队熟悉度，盲目选用新技术带来维护成本<br>
- ❌ 混淆状态管理和数据请求，未合理划分责任

</details>

## 9. 浏览器有哪几种缓存，各种缓存的优先级是什么样的？ {#question-ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87}

> 题库原题：[浏览器有哪几种缓存，各种缓存的优先级是什么样的？](https://fe.ecool.fun/topic/ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87)

### 题目要点

### 延伸知识

光记住这些理论是不够的，还需要深入在实际场景中去运用。至少要思考如下几个问题：

- HTML文件应该采用哪种缓存？强缓存还是协商缓存？
- JS/CSS/图片，应该采用哪种方式？
- webpack打包时的 contenthash 是做什么的？
- 有时候，JS文件名没法修改，我们会在JS的URL最后面加上类似 `xxx.js?v=20240719` 这种query参数，是做什么的？

<details>
<summary>参考答案</summary>

在浏览器中，有以下几种常见的缓存：

1. 强制缓存：通过设置 Cache-Control 和 Expires 等响应头实现，可以让浏览器直接从本地缓存中读取资源而不发起请求。
2. 协商缓存：通过设置 Last-Modified 和 ETag 等响应头实现，可以让浏览器发送条件请求，询问服务器是否有更新的资源。如果服务器返回 304 Not Modified 响应，则表示客户端本地缓存仍然有效，可直接使用缓存的资源。
3. Service Worker 缓存：Service Worker 是一种特殊的 JS 脚本，可以拦截网络请求并返回缓存的响应，以实现离线访问和更快的加载速度等功能。
4. Web Storage 缓存：包括 localStorage 和 sessionStorage。localStorage 用于存储用户在网站上的永久性数据，而 sessionStorage 则用于存储用户会话过程中的临时数据。

这些缓存的优先级如下：

1. Service Worker 缓存：由于其可以完全控制网络请求，因此具有最高的优先级，即使是强制缓存也可以被它所覆盖。
2. 强制缓存：如果存在强制缓存，并且缓存没有过期，则直接使用缓存，不需要向服务器发送请求。
3. 协商缓存：如果强制缓存未命中，但协商缓存可用，则会向服务器发送条件请求，询问资源是否更新。如果服务器返回 304 Not Modified 响应，则直接使用缓存。
4. Web Storage 缓存：Web Storage 缓存的优先级最低，只有在网络不可用或者其他缓存都未命中时才会生效。

</details>

## 10. React Hooks的原理，如何使用useEffect进行副作用处理。如何避免常见的useEffect陷阱 {#question-subjective-532a8e949c64}

### 题目要点

* React Hooks 通过调用顺序和内部状态数组实现状态与副作用管理
* useEffect 用于管理副作用，依赖数组控制执行时机和频率
* 避免遗漏依赖和错误异步写法，保证副作用正确同步和清理
* 熟练使用 useCallback、useMemo 辅助稳定依赖，提升性能

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React Hooks 的设计初衷及核心原理<br>
- 掌握 useEffect 的用法和生命周期对应关系<br>
- 理解副作用（side effects）的概念及处理场景<br>
- 熟悉 useEffect 常见陷阱及避免策略<br>

---

## 二、参考答案

### 2.1 React Hooks的原理

- React Hooks 是 React 16.8 引入的函数组件状态管理和副作用处理机制<br>
- 通过闭包和内部 Hook 调用顺序的“状态数组”存储，实现函数组件状态持久化<br>
- React 内部维护一个 Hook 状态链表（或数组），按调用顺序对应 Hook 状态<br>
- 每次组件渲染时，React 根据调用顺序依次读取或更新对应 Hook 的状态<br>
- Hooks 使函数组件具备了类组件的状态和生命周期能力，且逻辑复用更灵活<br>

### 2.2 useEffect 的用法和副作用处理

- `useEffect(callback, [deps])` 用于执行副作用操作，如数据请求、事件监听、DOM 操作等<br>
- React 组件渲染后，会执行 useEffect 注册的副作用函数<br>
- useEffect 中的副作用函数可以返回一个清理函数，用于组件卸载或副作用更新时清理资源<br>
- 依赖数组 `[deps]` 决定副作用函数的执行时机：<br>
  - 依赖为空数组 `[]`：只在组件挂载和卸载时执行一次<br>
  - 无依赖数组：每次渲染后都执行<br>
  - 依赖项变化时执行<br>

```jsx
useEffect(() => {
  // 副作用逻辑，如订阅事件、发请求
  return () => {
    // 清理逻辑，如取消订阅、清理定时器
  };
}, [deps]);
````

### 2.3 避免 useEffect 常见陷阱

* **陷阱一：遗漏依赖**

  * 忽略了副作用中使用的变量应加入依赖数组，导致副作用不同步或 stale closure
  * 解决：确保所有外部引用的变量都在依赖列表中声明，必要时使用 `useCallback` 或 `useMemo` 优化

* **陷阱二：依赖项写空数组但使用了外部变量**

  * 造成副作用只执行一次，但内部使用了外部变量，导致值不更新
  * 解决：正确列出依赖，或将外部变量提升到状态或 ref

* **陷阱三：副作用函数返回值不是函数**

  * 返回非函数值会被 React 忽略，造成资源无法正确清理
  * 解决：确保返回值是函数或者不返回

* **陷阱四：副作用中直接使用异步函数**

  * `useEffect` 不能直接传入 async 函数，导致返回 Promise，React 无法识别清理函数
  * 解决：在副作用内声明异步函数并调用

* **陷阱五：副作用依赖过多导致频繁执行**

  * 依赖数组频繁变化，导致副作用过度执行影响性能
  * 解决：减少依赖项，使用 `useCallback`、`useMemo` 优化依赖的稳定性

---

## 三、常见误区或面试陷阱

* ❌ 误以为 useEffect 会阻塞渲染，实际上它是异步执行
* ❌ 忽视依赖数组，导致副作用执行行为不可预测
* ❌ 直接传入异步函数给 useEffect，React 不支持
* ❌ 清理函数未写或写错，导致内存泄漏或事件重复绑定

</details>

## 11. 实现一个函数，对数组进行去重操作 {#question-subjective-0079f62431bd}

### 题目要点

* 数组去重核心是判断元素是否重复，利用数据结构辅助
* Set 是 ES6 提供的最简洁高效方案
* 对象键法适合简单类型，但有类型限制
* 复杂数据结构去重需自定义唯一标识和比较逻辑

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解数组去重的基本需求<br>
- 掌握常用的去重方法及其底层原理<br>
- 了解去重的性能差异和适用场景<br>
- 熟悉 ES6 新特性（如 Set）在去重中的应用<br>

---

## 二、参考答案

### 2.1 去重的基本原理

- 去重的核心是判断元素是否已存在于结果集合中<br>
- 利用数据结构（如 Set、对象键）实现快速查重<br>
- 保持元素的唯一性，且一般要求保持原数组顺序<br>

### 2.2 常见去重实现方案及示例

#### 方案一：利用 ES6 Set

- Set 是一种集合，内部值唯一<br>
- 将数组转成 Set，再转回数组即可去重<br>

```js
function uniqueArray(arr) {
  return [...new Set(arr)];
}
````

* 优点：简洁高效，适合基本数据类型数组
* 缺点：对引用类型对象的去重需要额外处理

#### 方案二：使用对象键做标记

* 利用对象属性的唯一性进行查重
* 适合基本类型数组（数字、字符串）

```js
function uniqueArray(arr) {
  const seen = {};
  return arr.filter(item => {
    if (seen[item]) {
      return false;
    } else {
      seen[item] = true;
      return true;
    }
  });
}
```

* 缺点：只能对字符串和数字去重，可能有类型转换问题

#### 方案三：双层循环（暴力法）

* 逐个元素检查是否重复
* 时间复杂度较高，通常不推荐

```js
function uniqueArray(arr) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i]);
    }
  }
  return res;
}
```

#### 方案四：结合 Map 处理复杂类型

* 用 Map 存储已出现的元素
* 对复杂对象需自定义唯一标识

### 2.3 选择方案依据

* 数据类型简单，推荐使用 Set
* 需要保持原数组顺序，Set 和 filter 都可用
* 对复杂对象去重需要自定义逻辑

---

## 三、常见误区或面试陷阱

* ❌ 使用对象键时未考虑类型转换（如 '1' 和 1 会冲突）
* ❌ 对引用类型直接用 Set，未考虑深度去重
* ❌ 忽视时间复杂度，使用双重循环导致性能低下

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-103/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-64/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-105/index.md" >}}) →
