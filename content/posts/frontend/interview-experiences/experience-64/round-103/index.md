+++
title = "阿里巴巴-社招-5年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/64"
experienceId = 64
roundId = 103
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T12:42:07.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-64/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-104/index.md" >}}) →

**本轮要点：** React 生命周期、react hooks、JSX、react 渲染机制、React函数组件更新、react 组件设计模式

本轮共 38 道题。答案默认折叠，便于先自行作答。

## 1. 你参与的主要项目是什么？是桌面端还是移动端项目 {#question-subjective-0e1759e87727}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 在项目中主要使用了哪些技术栈 {#question-subjective-d691062b1d66}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 你对 Vue 有多少了解 {#question-subjective-3ee00ddb36c7}

### 题目要点

- Vue 是数据驱动 + 响应式的组件化框架，适合快速构建中大型项目<br>
- 熟悉其核心机制：响应式原理、组件生命周期、指令语法、虚拟 DOM<br>
- 掌握 Vue Router、Vuex/Pinia 等配套生态工具<br>
- 能区分并熟练使用 Vue 2 和 Vue 3 的开发模式<br>
- 具备优化性能、提升可维护性的工程意识

<details>
<summary>参考答案</summary>

## 一、考察点

- 探查候选人对 Vue 核心原理、语法机制的理解深度<br>
- 判断是否具备实战经验、组件开发能力、性能优化能力<br>
- 涵盖响应式系统、组件通信、生命周期、指令系统、虚拟 DOM、Diff 等关键技术点<br>
- Vue 生态栈是否熟悉，如 Vue Router、Vuex / Pinia、Composition API、Vue 3 升级等<br>

---

## 二、参考答案

### 2.1 Vue 框架的整体认知

- Vue 是一个 **轻量、渐进式的前端框架**，核心关注 View 层，易学易用，适合快速开发中大型应用
- 支持响应式绑定、组件化开发、指令系统、虚拟 DOM、跨平台（如 H5、小程序）

Vue 的核心组成包括：
- 响应式系统（数据驱动视图）
- 组件系统（组合式开发、生命周期）
- 模板语法（指令、插值、事件绑定）
- 虚拟 DOM + Diff 算法（高性能渲染）
- 生态体系（Vue Router、Vuex / Pinia、CLI / Vite）

---

### 2.2 Vue 关键机制理解

#### ✅ 响应式系统

- Vue 2 基于 `Object.defineProperty` 劫持数据读写，Vue 3 基于 `Proxy`
- 自动追踪依赖，数据变动后触发视图更新
- 使用 `ref`、`reactive` 创建响应式对象，配合 `effect` 触发副作用

#### ✅ 组件通信方式

- `props / emit` 父子通信
- `provide / inject` 祖孙通信
- `eventBus`（Vue 2）全局通信
- Vuex / Pinia 管理全局状态
- `$attrs` / `$listeners` 透传
- `v-model` 的语法糖双向绑定

#### ✅ 生命周期

- Vue 2: `created` / `mounted` / `updated` / `destroyed` 等
- Vue 3: 使用 `setup()` + `onMounted()` 等组合式 API
- 生命周期控制副作用、数据初始化、销毁清理等逻辑

#### ✅ 模板语法与指令系统

- 插值：`{{ msg }}`
- 事件绑定：`@click="handleClick"`
- 条件渲染：`v-if` / `v-show`
- 列表渲染：`v-for`
- 动态绑定：`:class` / `:style`

#### ✅ 虚拟 DOM 和 Diff 算法

- Vue 会将模板编译成 render 函数，生成虚拟 DOM 树
- 数据变化时通过对比前后虚拟 DOM，执行最小更新
- 支持 key 优化、组件缓存、静态提升等优化手段

---

### 2.3 实战能力与生态栈

- 熟悉 Vue CLI / Vite 搭建项目，掌握模块化、热更新、HMR 原理
- 熟练使用 Vue Router（嵌套路由、动态路由、路由守卫）
- 熟练使用 Vuex（模块拆分、mutation / action 分离、持久化插件）
- 掌握 Pinia（替代 Vuex 的轻量方案，组合式 API，更易测试）
- 了解 SSR（Nuxt.js）、组件懒加载、性能优化等实战策略

---

### 2.4 Vue2 与 Vue3 的对比认知

| 特性           | Vue 2                        | Vue 3                          |
|----------------|------------------------------|---------------------------------|
| 响应式原理     | `Object.defineProperty`      | `Proxy`（更强大、支持数组等）   |
| API 形式        | Options API（data、methods）| Composition API（setup、ref）   |
| 性能表现        | 编译和运行体积较大           | 更轻量，Tree-Shaking 支持更好   |
| 模板编译优化    | 无静态提升                   | 静态提升 + Patch Flag 优化      |

---

## 三、常见误区或面试陷阱

- ❌ 混淆 Vue 2 和 Vue 3 的响应式实现原理<br>
- ❌ 误用 `v-if` 与 `v-show`（如频繁切换时使用 v-if 会导致性能问题）<br>
- ❌ 滥用全局事件通信（如 eventBus），导致难以维护<br>
- ❌ 不了解组件更新机制（如 key 对 diff 的影响）<br>
- ❌ 只会使用 Options API，缺乏 Composition API 的组织能力

</details>

## 4. 在移动端开发中，如何判断用户使用的是安卓、iOS 还是微信平台 {#question-subjective-a102e772cef7}

### 题目要点

* 利用 `navigator.userAgent` 分析平台特征关键词
* 正确区分 Android / iOS / 微信环境 / 企业微信 / 小程序
* 注意跨平台兼容性问题（如 iOS 键盘、微信 JSAPI）
* UA 判断仅用于“适配”，非“安全认证”
* 小程序中使用微信提供的 API 获取平台更为可靠

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 User-Agent 的使用方法<br>
- 掌握平台环境识别（iOS、Android、微信）的关键判断点<br>
- 能结合移动端环境差异进行兼容性判断与适配<br>
- 熟悉前端能力检测（Feature Detection vs User-Agent 检测）

---

## 二、参考答案

### 2.1 核心思路：基于 `navigator.userAgent` 分析平台标识

移动端平台可通过浏览器暴露的 `User-Agent` 字符串判断设备环境。

```js
const ua = navigator.userAgent;
````

#### ✅ 判断 Android：

```js
const isAndroid = /Android/i.test(ua);
```

#### ✅ 判断 iOS：

```js
const isIOS = /iPhone|iPad|iPod/i.test(ua);
```

#### ✅ 判断微信（微信浏览器）：

```js
const isWeChat = /MicroMessenger/i.test(ua);
```

#### ✅ 综合判断函数封装：

```js
function detectPlatform() {
  const ua = navigator.userAgent;

  return {
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    isWeChat: /MicroMessenger/i.test(ua),
    isWeCom: /wxwork/i.test(ua), // 判断是否企业微信
    isMiniProgram: /miniprogram/i.test(ua), // 微信小程序环境
  };
}

const platform = detectPlatform();
console.log(platform.isAndroid, platform.isIOS, platform.isWeChat);
```

---

### 2.2 使用场景与注意事项

| 场景            | 示例应用           |
| ------------- | -------------- |
| 安卓/IOS 特定行为优化 | 控制滚动、键盘弹起处理    |
| 微信平台限制        | 禁止跳转外链、支付逻辑    |
| 小程序内判断        | 使用 JS SDK 或注入桥 |

**注意：**

* 微信客户端和微信小程序 User-Agent 不一样
* 微信小程序推荐使用 `wx.getSystemInfoSync()` 获取平台信息
* Safari 浏览器可能会模拟 iOS 标识，注意与真实设备区别

---

### 2.3 常见误区或陷阱

* ❌ 将所有 iOS 判断仅用 `iPhone`，可能漏掉 iPad
* ❌ 忽略微信内嵌 WebView 的兼容性差异
* ❌ 不做前缀判断，可能误匹配（如 UC 浏览器也带 Android）
* ❌ 忽视 UA 会被劫持/修改，不能作为安全验证手段

</details>

## 5. 在移动端页面开发中，如何处理页面的尺寸和宽高 {#question-subjective-62d0c66f4295}

### 题目要点

* 使用 viewport 设置页面布局基准
* rem 配合 flexible 或 vw/vh 是主流适配方式
* 注意处理 100vh、键盘弹起、屏幕旋转等高度问题
* 可结合媒体查询精细控制样式
* 合理使用 JS 获取 `window.innerWidth/innerHeight` 动态布局

<details>
<summary>参考答案</summary>

## 一、考察点

- 判断候选人是否掌握移动端页面适配方案<br>
- 理解视口（viewport）、DPR、布局单位等基础概念<br>
- 熟悉多种移动端布局方式（rem、vw/vh、媒体查询）及其适用场景<br>
- 具备处理移动端宽高异常、兼容性 bug 的能力（如 100vh 问题）<br>

---

## 二、参考答案

### 2.1 关键概念说明

#### ✅ 视口（Viewport）

- 浏览器渲染页面的可视区域<br>
- 移动端通常使用 `&lt;meta name="viewport"&gt;` 控制缩放、布局行为

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
````

#### ✅ 设备像素比（DPR）

* DPR（Device Pixel Ratio）表示物理像素与 CSS 像素的比值
* 影响页面的清晰度与布局计算

---

### 2.2 常见移动端尺寸适配方案

#### ✅ 方案一：`rem` + `flexible.js`（淘宝早期方案）

* 原理：通过动态设置 `html` 的 `font-size` 实现等比缩放
* 通常基于设计稿宽度（如 750px）按比例换算：

```js
const baseSize = 100;
const scale = document.documentElement.clientWidth / 750;
document.documentElement.style.fontSize = (baseSize * scale) + 'px';
```

* 页面中样式单位使用 `rem`：

```css
.box {
  width: 3.75rem; /* 3.75 * 100 = 375px */
}
```

#### ✅ 方案二：`vw/vh` 响应式单位（现代推荐）

* `1vw` 表示视口宽度的 1%，`1vh` 表示视口高度的 1%
* 实现自适应宽高布局无需 JS，适合现代移动设备

```css
.container {
  width: 100vw;
  height: 100vh;
  font-size: 3vw;
}
```

* 优势：简单直观，无需额外脚本

#### ✅ 方案三：媒体查询（Media Queries）

* 针对不同设备宽度设置不同样式规则，提升适配精度

```css
@media screen and (max-width: 375px) {
  body {
    font-size: 14px;
  }
}
```

---

### 2.3 移动端页面高度问题处理

#### ✅ iOS `100vh` 不准确问题（地址栏未隐藏）

* 原因：Safari 浏览器的视口高度包含顶部工具栏，导致 `100vh` 超出实际可见区域
* 解决方案：

  * 使用 JS 计算实际可视高度：

    ```js
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    // 然后 CSS 中使用：
    height: calc(var(--vh) * 100);
    ```

#### ✅ 安卓键盘弹起导致高度变化

* 避免使用 `vh`，使用 `position: fixed` 时配合 JS 动态适配
* 可监听 `window.innerHeight` 变化判断键盘弹起状态

---

### 2.4 页面初始缩放与禁止缩放

```html
<!-- 禁止用户缩放页面（表单类页面常见） -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

---

## 三、常见误区或面试陷阱

* ❌ 误以为 `100vh` 在所有浏览器上高度都准确（忽略 iOS 和 Android 差异）
* ❌ 将 `px` 用于移动端适配，无法等比缩放
* ❌ 忽略设备 DPR 导致视觉模糊或布局错位
* ❌ 页面使用 viewport 未设置 `initial-scale`，导致页面缩放异常

</details>

## 6. 如何根据设计稿的尺寸计算出 REM 值，相关原理了解么 {#question-subjective-454563ee20b3}

### 题目要点

* rem 是基于 html 的 font-size 计算的相对单位
* 通常约定：1rem = 设计稿宽度 / 10，便于换算
* 使用 JS 或 PostCSS 动态设置 html 字体大小，完成等比缩放
* 保证 viewport 设置正确，页面才会按实际宽度渲染
* 推荐使用 PostCSS 工具链自动换算 px → rem，统一团队开发风格

<details>
<summary>参考答案</summary>

## 一、考察点

- 考察候选人是否掌握基于 `rem` 的移动端适配方案<br>
- 理解 `rem` 与设计稿尺寸之间的换算原理<br>
- 是否理解动态设置 `html` 字体大小的作用与实现方式<br>
- 判断是否熟悉 flexible、postcss-pxtorem 等工具链<br>

---

## 二、参考答案

### 2.1 rem 的基本概念

- `rem` 是相对单位：**根元素（html）的字体大小**
- 例如：
  ```css
  html { font-size: 100px; }
  div { width: 1rem; } /* 实际为 100px */
````

* 所以，**只要动态设置好 html 的 font-size，就能实现按设计稿等比缩放的页面布局**

---

### 2.2 设计稿 rem 计算的核心原理

#### ✅ 原理公式（核心逻辑）：

```text
1rem = 设计稿宽度 / 10
```

* 假设设计稿宽度为 **750px**，我们约定：

  ```text
  html.font-size = 750 / 10 = 75px
  ```

* 那么设计稿中标注的 375px，就转换为：

  ```text
  375 / 75 = 5rem
  ```

* 页面中的样式就写为：

  ```css
  .box {
    width: 5rem;
  }
  ```

#### ✅ 为什么是除以 10？

* 除以 10 是一种经验值，便于换算（数字缩小 10 倍，开发更直观）
* 也可以除以其他值（如 7.5、100），但需保持一致性

---

### 2.3 如何动态设置 html 的 font-size？

#### ✅ 方案1：JS 自适应设置（flexible 方案）

```js
(function() {
  const baseWidth = 750; // 设计稿宽度
  function setFontSize() {
    const docEl = document.documentElement;
    const clientWidth = docEl.clientWidth;
    const fontSize = clientWidth / (baseWidth / 100);
    docEl.style.fontSize = fontSize + 'px';
  }

  window.addEventListener('resize', setFontSize);
  setFontSize();
})();
```

* 举例：375px 屏幕 → `font-size = 375 / 7.5 = 50px`
* 设计稿上 75px → 页面中写为 `1rem`

#### ✅ 方案2：PostCSS 自动换算（推荐）

* 使用 `postcss-pxtorem` 插件，将 px 自动转换为 rem

```js
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 75, // 对应 html font-size
      propList: ['*'],
    },
  },
};
```

* 开发时仍按设计稿写 px，构建时自动转为 rem：

```css
/* 输入 */
.box {
  width: 375px;
}
/* 输出 */
.box {
  width: 5rem;
}
```

---

### 2.4 使用场景与注意事项

* 多用于移动端、H5 项目等宽度固定的 UI（通常设计稿 750px 或 375px）
* 使用时应保证 `&lt;meta name="viewport"&gt;` 配置正确：

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## 三、常见误区或陷阱

* ❌ 误将 rem 理解为自动缩放单位（需依赖 html 的 font-size）
* ❌ 忽略屏幕宽度变动未同步刷新 html font-size，导致适配异常
* ❌ 多人协作时未统一 rootValue（导致 rem 换算不一致）
* ❌ 忽略媒体查询或元素单位（如 border）未转 rem，导致显示错乱

</details>

## 7. 在一个应用生命周期中，函数式组件会在什么时机被调用？会被调用多少次 {#question-subjective-3981dea65010}

### 题目要点

* 函数组件是一个纯函数，每次渲染都会调用
* 首次渲染和每次状态或属性变化都会调用函数组件
* React 18 严格模式下开发环境可能会多调用一次
* 函数组件调用次数等于渲染次数，函数体应保持无副作用
* 通过 Hooks 控制副作用和状态更新，避免重复调用带来副作用

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 函数组件的渲染机制<br>
- 理解组件的调用与 React 渲染流程的关系<br>
- 掌握函数组件在首次渲染和后续更新时的调用次数<br>
- 区分组件的挂载、更新和卸载时机<br>

---

## 二、参考答案

### 2.1 函数组件调用的本质

- React 的函数式组件本质是一个普通函数，接收 `props`，返回 JSX（React 元素）
- 该函数在每次渲染时都会被调用，生成最新的虚拟 DOM 树
- React 会根据新旧虚拟 DOM 进行 Diff，对比差异进行真实 DOM 更新

---

### 2.2 调用时机

#### ✅ 首次挂载时调用

- 当组件第一次渲染到页面时，React 调用函数组件生成元素树
- 函数组件被调用一次以完成首次渲染

#### ✅ 父组件重新渲染导致调用

- 当父组件状态或属性变化，导致该函数组件需要重新渲染时，函数组件会被重新调用
- 只要父组件触发重新渲染，子函数组件都会被调用生成新的元素树

#### ✅ 自身状态或上下文变化

- 函数组件内部通过 Hooks（如 `useState`、`useContext`）触发状态或上下文变化时，也会导致该组件重新调用

#### ✅ React 严格模式（StrictMode）下的额外调用

- React 18+ 的严格模式中，为了检测副作用，函数组件在开发环境可能会被调用两次（但不影响生产环境）

---

### 2.3 调用次数

- 理论上，函数组件调用次数等于它被渲染的次数（首次 + 每次更新）
- 没有缓存机制，函数体每次渲染都执行，保持函数无副作用是最佳实践
- 额外渲染次数可能由于 React 严格模式或父组件频繁更新引起

---

### 2.4 总结调用流程示意

```mermaid
graph TD
  A[首次挂载] --> B[调用函数组件，生成虚拟DOM]
  B --> C[渲染到真实DOM]
  D[父组件状态更新] --> E[重新调用函数组件]
  E --> F[虚拟DOM Diff与更新]
  G[自身状态更新] --> E
  H[React StrictMode] --> I[开发环境函数组件调用两次]
````

---

## 三、常见误区或面试陷阱

* ❌ 认为函数组件只调用一次，忽略了更新时的重复调用
* ❌ 在函数组件中执行副作用代码，导致重复副作用（应放在 `useEffect`）
* ❌ 不理解 React 严格模式下的双调用是故意行为，用于发现潜在问题
* ❌ 误以为函数组件调用次数与真实 DOM 操作次数一致（实际上 React 会复用 DOM）

</details>

## 8. 什么情况下会触发组件更新 {#question-subjective-a12e766cdfa9}

### 题目要点

* 组件更新由三类数据变化触发：`state`、`props`、`context`
* 父组件更新默认会触发子组件更新，需优化避免无意义渲染
* `forceUpdate` 可强制刷新组件
* 注意浅比较机制，避免传入新函数/对象导致不必要更新

<details>
<summary>参考答案</summary>

## 一、考察点

- 掌握 React 组件更新的触发条件<br>
- 理解状态（state）、属性（props）、上下文（context）变化的关系<br>
- 理解 React 的更新机制和渲染优化点（如 `shouldComponentUpdate`、`React.memo`）<br>
- 能区分类组件和函数组件的更新触发差异<br>

---

## 二、参考答案

### 2.1 触发组件更新的主要情况

#### 1. **props 变化**

- 父组件传入的 `props` 发生变化时，子组件会重新渲染<br>
- React 会浅比较新旧 props，发现差异则触发更新<br>
- 注意：如果父组件每次都传入新对象（例如内联创建的对象），会导致子组件频繁更新

#### 2. **state 变化**

- 组件内部通过 `setState`（类组件）或 `useState`（函数组件）更新状态时<br>
- 状态更新会触发组件重新渲染，React 根据新状态重新调用渲染函数或执行 `render`

#### 3. **context 变化**

- 通过 React Context 传递的值发生变化时，所有消费该 Context 的组件都会更新<br>
- Context 的更新触发机制类似于 props 变化

#### 4. **父组件更新导致的子组件更新**

- 父组件重新渲染时，如果没有阻止，子组件会随之更新<br>
- 可以通过 `PureComponent`、`React.memo`、`shouldComponentUpdate` 优化避免无效更新

---

### 2.2 额外触发更新的场景

#### 5. **强制更新**

- 类组件调用 `forceUpdate()` 会强制触发更新，不考虑 props/state 是否变化

#### 6. **组件内部副作用或订阅更新**

- 例如使用第三方库事件触发更新，通过 `useState` 修改状态，间接触发更新

#### 7. **父组件传递的回调函数或对象变化**

- 若父组件每次渲染创建新函数或新对象，作为 props 传递，导致浅比较不通过，触发子组件更新

---

### 2.3 总结触发更新的流程

```mermaid
graph LR
  StateChange[State变化] --> Update[组件更新]
  PropsChange[Props变化] --> Update
  ContextChange[Context变化] --> Update
  ForceUpdate[forceUpdate调用] --> Update
  ParentUpdate[父组件更新] --> Update
````

---

## 三、常见误区或面试陷阱

* ❌ 误以为只有 `setState` 才会触发更新，忽略了 `props` 或 `context` 变化
* ❌ 忽略了父组件更新会影响子组件，导致不必要的性能问题
* ❌ 忽略了函数和对象类型的 props 每次都新建，导致子组件频繁更新
* ❌ 不理解 `forceUpdate` 的强制更新机制

</details>

## 9. 如果子组件没有任何 props，父组件渲染时，子组件会跟着渲染吗 {#question-subjective-c909b42c129a}

### 题目要点

* 父组件每次渲染，子组件默认都会被重新调用渲染函数
* 子组件无 props 也不影响其被调用渲染
* 使用 `React.memo` 或 `PureComponent` 可以避免无意义渲染
* 真实 DOM 操作和虚拟 DOM 重新生成是两个不同过程

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 组件的渲染传递机制<br>
- 理解父组件更新对无 props 子组件的影响<br>
- 掌握 React 渲染优化手段（如 React.memo、PureComponent）<br>
- 判断组件是否会无条件重新渲染<br>

---

## 二、参考答案

### 2.1 父组件渲染对子组件的影响

- React 默认采用**自顶向下**的渲染机制<br>
- 当父组件渲染（首次或更新）时，其子组件会**默认**被调用渲染函数<br>
- **即使子组件没有任何 props**，只要父组件重新渲染，子组件也会被重新渲染

### 2.2 为什么会这样？

- React 无法判断子组件是否依赖父组件状态或上下文<br>
- 组件函数或类的渲染是 React 生成虚拟 DOM 的过程，需要保证最新状态<br>
- 父组件重新渲染时会重新构建子组件的虚拟 DOM 树

### 2.3 如何避免无意义的子组件重复渲染？

#### 方案一：`React.memo`

- 对函数组件使用 `React.memo`，会进行浅层 props 比较<br>
- 如果子组件无 props，React.memo 会阻止子组件重复渲染

```js
const Child = React.memo(() => {
  console.log('Child rendered');
  return <div>Child</div>;
});
````

#### 方案二：类组件使用 `PureComponent`

* `PureComponent` 自动浅比较 props 和 state，避免无变化时渲染

---

### 2.4 特殊情况

* 如果子组件使用了 `useContext` 或订阅了其他外部状态，父组件渲染可能导致子组件重新渲染
* 如果子组件内部有状态改变，也会触发自身更新

---

## 三、常见误区或面试陷阱

* ❌ 认为无 props 的子组件不会渲染，忽视了父组件更新导致的递归渲染
* ❌ 忽略 React.memo 只对 props 做浅比较，子组件内部状态变化仍会渲染
* ❌ 误解 React 渲染机制，将函数调用与真实 DOM 操作混淆

</details>

## 10. React.memo 会做什么处理 {#question-subjective-90887797c14d}

### 题目要点

* React.memo 是函数组件的性能优化工具，避免无变化时重复渲染
* 默认浅比较 props，判断是否重新调用渲染函数
* 支持自定义比较函数以实现更精细的控制
* 适用于 props 变化不频繁但渲染成本较高的组件
* 不影响组件内部 state 或 context 变化导致的更新

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React.memo 的功能和实现原理<br>
- 掌握 React.memo 在函数组件优化中的作用<br>
- 理解浅比较（shallow comparison）机制及其限制<br>
- 了解 React.memo 如何减少不必要的重新渲染<br>

---

## 二、参考答案

### 2.1 React.memo 的核心功能

- `React.memo` 是 React 提供的高阶组件（HOC），用于**缓存函数组件的渲染结果**<br>
- 当组件的 props **没有变化时**，避免重新渲染，提高性能<br>
- 类似于类组件中的 `PureComponent`，但专门用于函数组件

---

### 2.2 React.memo 的工作原理

- React.memo 包裹的组件接收 `props`<br>
- React 在组件即将重新渲染时，**自动执行浅比较**（shallow compare）对比新旧 props<br>
- 如果 props 相同（浅比较），返回上次渲染的结果，**跳过渲染和函数调用**<br>
- 如果 props 发生变化，则正常调用函数组件渲染<br>

```js
const MemoizedComponent = React.memo(Component);
````

---

### 2.3 浅比较（shallow compare）细节

* 浅比较只比较 props 的第一层引用是否相同
* 对于基本类型（字符串、数字、布尔值）比较值是否相等
* 对于引用类型（对象、数组、函数）比较引用地址是否相同

> 注意：若传入新创建的对象或函数，浅比较会判定为不同，导致组件重新渲染

---

### 2.4 自定义比较函数

* `React.memo` 可以接收第二个参数，自定义比较函数 `areEqual(prevProps, nextProps)`
* 允许开发者实现更复杂的比较逻辑，控制是否重新渲染

```js
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  // 返回 true 表示跳过渲染，false 表示重新渲染
  return prevProps.value === nextProps.value;
});
```

---

### 2.5 使用场景

* 组件接收大量复杂 props，且渲染开销大
* 父组件频繁渲染，但子组件 props 实际无变化
* 希望减少无意义的子组件渲染，提升性能

---

## 三、常见误区或面试陷阱

* ❌ 误以为 React.memo 能解决所有性能问题，忽视内部状态更新仍会触发渲染
* ❌ 忽略浅比较的限制，传入新对象/函数导致失效
* ❌ 误用 React.memo 包裹无状态且渲染非常简单的组件，可能带来额外开销
* ❌ 忽略自定义比较函数的合理使用

</details>

## 11. 组件返回 JSX，在编译阶段会被转义成什么 JS 代码 {#question-subjective-189d2c7a8cd2}

### 题目要点

* JSX 是语法糖，编译成 `React.createElement` 函数调用
* `createElement` 返回虚拟 DOM（React Element）对象
* 参数包含元素类型、属性对象和子节点
* 该机制实现了 React 的声明式 UI 构建和高效更新
* 理解这一过程，有助于深入掌握 React 渲染原理

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 JSX 的本质及编译原理<br>
- 掌握 JSX 如何转换为 React.createElement 调用<br>
- 理解虚拟 DOM（React Element）生成机制<br>
- 了解 JSX 编译后代码结构及参数含义<br>

---

## 二、参考答案

### 2.1 JSX 是什么？

- JSX 是 JavaScript 的语法扩展，看起来像 XML/HTML<br>
- 并非浏览器原生支持，必须经过编译（如 Babel）转换成纯 JavaScript<br>
- 本质上用于描述 UI 结构和组件树<br>

---

### 2.2 JSX 编译后的核心转换

- 编译器将 JSX 代码转换成 `React.createElement` 函数调用<br>
- 该函数返回一个描述组件或 DOM 元素的“React Element”对象（虚拟 DOM）

示例：

```jsx
const element = <div className="box">Hello</div>;
````

编译后类似于：

```js
const element = React.createElement(
  'div',
  { className: 'box' },
  'Hello'
);
```

---

### 2.3 React.createElement 参数详解

```js
React.createElement(type, props, ...children)
```

* `type`：字符串（如 `'div'`）表示 HTML 标签，或函数/类组件
* `props`：一个对象，包含所有属性和事件处理器
* `children`：子元素，可以是字符串、React Element，甚至数组

---

### 2.4 复杂 JSX 例子

```jsx
<MyComponent id="1">
  <span>Hello</span>
  World
</MyComponent>
```

编译成：

```js
React.createElement(
  MyComponent,
  { id: '1' },
  React.createElement('span', null, 'Hello'),
  'World'
);
```

---

### 2.5 其他细节

* 编译器（如 Babel）可以根据配置使用不同的运行时（React 17 以前使用 classic runtime，React 17+ 也支持自动导入 jsx-runtime）
* React 17 之后可以使用新的 JSX 转换，不再需要显式导入 React

---

## 三、常见误区或面试陷阱

* ❌ 认为 JSX 是浏览器原生支持的语法
* ❌ 忽略 JSX 本质是 React.createElement 调用
* ❌ 不理解 React Element 与真实 DOM 的区别
* ❌ 误解编译后代码为字符串拼接

</details>

## 12. React 函数式组件中，Hooks 的写法规范是出于什么考虑 {#question-subjective-7f61c47c2d04}

### 题目要点

* Hooks 规范保证调用顺序稳定，确保状态匹配
* 规范避免了状态错乱和副作用混乱
* 使 React 内部实现简单高效
* 使用 ESLint 插件辅助规范编写
* 编写自定义 Hook 和规范组件结构，避免条件调用

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React Hooks 的设计原则和使用规范<br>
- 掌握 Hooks 写法规范背后的原因（稳定性、可预测性）<br>
- 理解 Hooks 规则对组件渲染和状态管理的重要性<br>
- 熟悉常见 Hooks 违规使用的副作用和隐患<br>

---

## 二、参考答案

### 2.1 Hooks 写法规范概述

- **Hooks 只能在函数组件最顶层调用，不能在循环、条件语句或嵌套函数中调用**<br>
- **Hooks 只能在 React 函数组件或自定义 Hook 中调用，不能在普通函数中调用**<br>
- 这些规范统称为“Hooks 规则”（Rules of Hooks）

---

### 2.2 写法规范的主要考虑

#### 1. 保证 Hooks 调用顺序稳定

- React 通过调用顺序来关联 Hook 状态（如 `useState`、`useEffect`）<br>
- 如果调用顺序变化，React 会把状态错配，导致错误或异常行为<br>
- 规范保证每次渲染时 Hooks 的调用顺序一致

#### 2. 保证状态管理的可预测性

- 固定的调用顺序让 React 能够正确匹配每个 Hook 的状态和副作用<br>
- 保持 Hook 状态与组件渲染一一对应，避免状态混乱

#### 3. 简化 React 内部实现

- Hooks 机制设计依赖调用顺序，不用显式的 Hook 标识符<br>
- 规则减少复杂度，提高性能和可靠性

---

### 2.3 常见违规写法及后果

- 在条件语句中调用 Hooks：

  ```js
  if (condition) {
    useEffect(() => { /*...*/ }, []);
  }
````

**会导致下一次渲染调用顺序变化，出现状态错乱**

* 在循环或嵌套函数中调用 Hooks，产生类似问题
* 在普通函数中调用 Hooks，React 无法识别上下文

---

### 2.4 如何保证规范

* 遵循 ESLint 插件 `eslint-plugin-react-hooks` 规则检测
* 自定义 Hook 用于抽离逻辑，减少条件分支内调用
* 设计清晰的组件逻辑，避免复杂嵌套

---

## 三、常见误区或面试陷阱

* ❌ 认为 Hooks 可以随意在条件语句、循环中调用
* ❌ 不了解调用顺序对状态管理的重要性
* ❌ 忽略 ESLint 检查，导致潜在运行时错误
* ❌ 误用 Hooks 导致状态错乱和难以调试的问题

</details>

## 13. React Fiber 是在什么情况下诞生的，它解决了什么问题 {#question-subjective-4ea8d7c9bcf4}

### 题目要点

- React Fiber 是为了解决 React 早期同步渲染阻塞主线程问题而诞生<br>
- Fiber 实现了可中断、可恢复、优先级调度的增量渲染机制<br>
- 通过拆分渲染任务，提升了响应性能和用户体验<br>
- Fiber 是 React 架构升级的核心，为并发模式和时间切片等特性提供支持

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React Fiber 的诞生背景与动因<br>
- 掌握 React Fiber 架构设计核心思想<br>
- 了解 Fiber 如何解决 React 早期性能与响应性问题<br>
- 理解 Fiber 在协调（Reconciliation）和调度中的作用<br>

---

## 二、参考答案

### 2.1 React Fiber 诞生背景

- React 最初的版本采用递归的同步渲染（stack reconciler），一次渲染整个组件树<br>
- 当组件树变大或状态频繁更新时，渲染过程阻塞主线程较长，导致 UI 卡顿、响应迟缓<br>
- 在复杂应用和移动端场景下，用户体验受到较大影响<br>
- 需求：**实现可中断、可恢复的渲染工作，提高渲染过程的可调度性和响应性**

---

### 2.2 React Fiber 的设计目标和解决的问题

#### 1. 可中断和分段渲染（Incremental Rendering）

- Fiber 将渲染任务拆分成多个小单元（Fiber 单元），可以中断执行<br>
- 通过调度算法，将渲染任务分批执行，允许浏览器主线程处理用户交互等高优先级任务<br>
- 大幅度提升应用的响应性和流畅度

#### 2. 优先级调度（Prioritization）

- 支持任务优先级管理，不同类型的更新赋予不同优先级<br>
- 优先处理紧急任务（如用户输入、动画），延后处理不重要任务（如数据预加载）

#### 3. 渲染流程的可恢复（Reconciliation）

- Fiber 架构允许在中断后保存当前进度，稍后恢复<br>
- 支持更灵活的错误边界处理和时间切片（time slicing）

#### 4. 支持异步渲染和并发特性

- Fiber 为 React 后续的 Concurrent Mode、Suspense 等并发特性奠定基础<br>
- 使 React 能够更智能地协调多个更新任务<br>

---

### 2.3 Fiber 的核心实现思路

- 每个 Fiber 对象对应一个 React 元素（组件或 DOM 节点）<br>
- Fiber 以链表结构组织，方便调度和增量更新<br>
- 通过双缓冲机制（current Fiber 和 work-in-progress Fiber）实现高效 Diff<br>
- 以任务单元为单位，逐步遍历 Fiber 树完成渲染<br>

---

## 三、常见误区或面试陷阱

- ❌ 误以为 Fiber 是虚拟 DOM，实际上 Fiber 是虚拟 DOM 的调度和协调架构<br>
- ❌ 忽略 Fiber 的中断和优先级调度能力<br>
- ❌ 误解 Fiber 是某种第三方库或独立框架<br>
- ❌ 忽视 Fiber 与 React 17+ 并发特性的关系

</details>

## 14. React 优化是否需要手动操作？有没有自动化的优化方案 {#question-subjective-293efa4d3086}

### 题目要点

- React 优化既需要手动操作，也有部分自动化机制辅助<br>
- Fiber 架构、自动批处理、并发模式是 React 内置的自动优化<br>
- 静态分析、打包工具和性能监控提供自动化支持<br>
- 手动优化如 Memoization、拆分等针对具体场景不可替代<br>
- 结合自动化与手动优化，才能实现最佳性能

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 优化的手动与自动化区别<br>
- 掌握手动优化的常见方法和应用场景<br>
- 了解 React 生态中自动化优化工具和框架支持<br>
- 理解自动优化方案的局限和适用条件<br>

---

## 二、参考答案

### 2.1 React 优化是否需要手动操作？

- **手动优化是 React 性能提升的常见且必要手段**<br>
  - 包括合理使用 `React.memo`、`PureComponent`、`useMemo`、`useCallback` 等<br>
  - 避免不必要的重新渲染和计算<br>
  - 代码拆分（Code Splitting）、懒加载（Lazy Loading）<br>
  - 事件节流、防抖、虚拟列表等性能技巧<br>
- **手动优化能够根据具体业务场景精准调优**，更灵活地应对复杂逻辑

### 2.2 React 自动化优化方案有哪些？

#### 1. React 自身优化机制（部分自动）

- **React Fiber 架构**，自动调度渲染，支持增量更新和任务优先级<br>
- **自动批处理（Automatic Batching）**，React 18+ 自动合并多次状态更新，减少渲染次数<br>
- **并发模式（Concurrent Mode）**，允许 React 自动打断、恢复渲染，提升响应性能<br>

#### 2. 静态分析与编译时优化

- **Babel 插件（如 `babel-plugin-transform-react-inline-elements`）**，将 JSX 转换为更高效的代码<br>
- **Tree Shaking**，移除未使用代码，减小打包体积<br>
- **Webpack 等打包工具的自动代码拆分**，实现按需加载<br>

#### 3. 第三方自动化工具和库

- **React Profiler API + 性能监控工具**，自动识别性能瓶颈<br>
- **Lint 工具（如 `eslint-plugin-react-hooks`）**，自动发现潜在性能问题<br>
- **性能监控和自动报警系统**，集成到 CI/CD 流程，辅助持续优化<br>

---

### 2.3 自动化方案的局限性

- 自动优化难以精准判断业务逻辑中的渲染必要性<br>
- 复杂业务和状态依赖仍需手动调优避免过度渲染<br>
- 自动方案往往依赖于最佳实践，需要配合合理编码规范使用<br>

---

## 三、常见误区或面试陷阱

- ❌ 误以为 React 可以完全自动优化，无需开发者关注性能<br>
- ❌ 忽略手动优化中避免不必要渲染的价值<br>
- ❌ 误解自动化优化工具只能解决所有性能问题<br>
- ❌ 忽视自动化工具对开发流程和团队协作的辅助作用

</details>

## 15. 项目中是否有服务端渲染的实践？如果使用 React，需要配合哪些框架 {#question-subjective-36ad46f0a6fa}

### 题目要点

- SSR 通过服务器渲染 React 组件，提高首屏速度和 SEO<br>
- React SSR 核心是 `ReactDOMServer.renderToString` 和客户端 Hydration<br>
- 主流框架有 Next.js、Razzle、Remix，或自定义 Express + React Router<br>
- 需处理数据同步、环境兼容、性能和容错<br>
- 框架选择应结合项目需求、团队经验和生态支持

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解服务端渲染（SSR）的基本概念及价值<br>
- 掌握 React 服务端渲染的实现方案<br>
- 了解主流 SSR 相关框架及其特点<br>
- 能根据项目需求选择合适的 SSR 框架或工具<br>

---

## 二、参考答案

### 2.1 服务端渲染（SSR）简介

- SSR 是指在服务器端生成完整的 HTML 页面，发送给客户端<br>
- 主要解决首屏加载速度慢、SEO 不友好等问题<br>
- 优势包括更快的首屏渲染时间、更好的搜索引擎支持、改善用户体验

---

### 2.2 React 服务端渲染的基本实现

- 使用 `ReactDOMServer` 提供的 API，如 `renderToString` 或 `renderToNodeStream`，在服务端渲染 React 组件生成 HTML 字符串<br>
- 将生成的 HTML 发送到浏览器，浏览器接收完整 HTML 内容<br>
- 客户端通过 React 的“水合”机制（Hydration）挂载事件和状态，使页面可交互

---

### 2.3 React 配合的主流 SSR 框架/工具

#### 1. **Next.js**

- 最流行的 React SSR 框架，开箱即用，支持服务器渲染、静态生成（SSG）、客户端渲染混合<br>
- 提供路由、数据获取、API 路由、静态资源管理等全套解决方案<br>
- 支持自动代码拆分、优化和开发体验提升<br>

#### 2. **Razzle**

- 通用的 React SSR 脚手架，支持自定义 Webpack 配置<br>
- 更灵活，适合复杂需求的 SSR 项目<br>

#### 3. **React Router + Express/Koa**

- 自定义实现 SSR，通过 React Router 实现同构路由<br>
- 需要手动配置服务端渲染流程，灵活但复杂<br>

#### 4. **Remix**

- 新兴的 React SSR 框架，强调数据加载和路由体验<br>
- 支持服务器端渲染和边缘计算部署<br>

---

### 2.4 SSR 需要注意的点

- 服务器环境要支持 Node.js 运行 React 代码<br>
- 需要处理数据预取和注水（hydration）的一致性<br>
- 注意避免在服务端运行浏览器专有 API（如 `window`、`document`）<br>
- 性能调优、缓存策略和错误处理尤为重要

---

## 三、常见误区或面试陷阱

- ❌ 误以为 SSR 只是在服务器渲染 HTML，没有考虑客户端“水合”<br>
- ❌ 忽略数据预加载和状态同步问题<br>
- ❌ 认为所有项目都必须用 SSR，忽视项目实际需求和复杂度<br>
- ❌ 不了解不同 SSR 框架的优缺点，导致选型盲目

</details>

## 16. 你了解服务端渲染的原理吗？它是如何实现的 {#question-subjective-70b131f78ece}

### 题目要点

- SSR 是服务器端先将组件渲染成 HTML 字符串，客户端接收并展示<br>
- 通过 `ReactDOMServer.renderToString` 实现服务器渲染<br>
- 服务器预取数据并注入，客户端 Hydration 恢复状态和交互<br>
- SSR 提升首屏加载性能和 SEO，适用于内容丰富、SEO 要求高的场景<br>
- 需注意客户端和服务端代码的环境差异及状态一致性

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解服务端渲染（SSR）的基本工作原理<br>
- 掌握 SSR 中客户端和服务器端的协作机制<br>
- 了解 SSR 与客户端渲染（CSR）的区别和联系<br>
- 理解 SSR 中数据获取和状态同步的实现方式<br>

---

## 二、参考答案

### 2.1 服务端渲染（SSR）原理简介

- SSR 是指在服务器端将前端组件渲染成完整的 HTML 字符串，发送到浏览器<br>
- 浏览器收到预渲染好的 HTML，直接展示页面，提升首屏加载速度和 SEO 友好性<br>
- 浏览器接收到 HTML 后，加载 JS 脚本，执行“水合（Hydration）”过程，激活页面的交互功能<br>

---

### 2.2 SSR 的具体实现流程

1. **请求到达服务器**<br>
   - 浏览器向服务器发起页面请求

2. **服务器端渲染 React 组件**<br>
   - 服务器端使用 `ReactDOMServer.renderToString`（或 `renderToNodeStream`）将 React 组件渲染为 HTML 字符串<br>
   - 渲染时，组件中需预先获取必要的数据（同步或异步），以保证生成的 HTML 是完整的

3. **将渲染结果发送给客户端**<br>
   - 服务器返回完整的 HTML 页面，包括渲染好的内容和用于客户端 Hydration 的 JS 脚本

4. **客户端 Hydration**<br>
   - 浏览器接收并解析 HTML，先展示静态内容<br>
   - 加载并执行 React 代码，React 使用 `ReactDOM.hydrate` 使已渲染的 DOM 元素与 React 组件状态挂钩，实现事件绑定和交互逻辑激活<br>

---

### 2.3 数据预取与状态同步

- 服务器端需提前获取组件渲染所需数据，通常通过异步数据请求完成<br>
- 渲染时，将数据注入到 HTML 中（如通过 `&lt;script&gt;` 标签嵌入序列化状态）<br>
- 客户端 Hydration 时读取注入的数据，恢复状态，保证 UI 与服务器渲染一致<br>

---

### 2.4 SSR 与传统客户端渲染的区别

| 特性       | SSR                          | 客户端渲染（CSR）           |
|------------|------------------------------|-----------------------------|
| 渲染时机   | 服务器端渲染完整页面          | 浏览器端渲染，JS 加载后渲染  |
| 首屏速度   | 快，直接收到完整 HTML          | 慢，需等待 JS 下载和执行      |
| SEO 友好性 | 高，爬虫可直接抓取内容          | 较低，爬虫抓取动态内容有限    |
| 交互激活   | 通过 Hydration 激活交互        | 初始渲染即激活              |

---

## 三、常见误区或面试陷阱

- ❌ 误以为 SSR 只渲染静态页面，无需 JS 交互<br>
- ❌ 忽略数据同步导致客户端和服务端 UI 不一致<br>
- ❌ 不了解 Hydration 过程和重要性<br>
- ❌ 忽视 SSR 复杂度，盲目使用，导致性能或维护问题

</details>

## 17. 服务端需要做什么处理，才能生成 DOM 结构 {#question-subjective-5bcaa23b951d}

### 题目要点

- 服务端先异步获取渲染数据，确保完整性<br>
- 使用 `ReactDOMServer.renderToString` 将 React 组件渲染为 HTML 字符串<br>
- 将数据序列化注入 HTML，保证客户端 Hydration<br>
- 拼接成完整 HTML，作为响应发送给浏览器<br>
- 避免在服务端调用浏览器专有 API

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解服务端渲染（SSR）生成 DOM 结构的具体步骤<br>
- 掌握服务端如何将组件转成 HTML 字符串<br>
- 理解数据预取、渲染和状态注入的流程<br>
- 熟悉服务端环境与浏览器环境的区别及处理<br>

---

## 二、参考答案

### 2.1 服务端渲染的核心处理步骤

#### 1. 数据准备

- 服务器接收到客户端请求后，先根据请求信息进行数据预取<br>
- 通过调用接口、数据库查询等方式，获取组件渲染所需的完整数据<br>
- 确保数据准备完成后，才进行下一步渲染<br>

#### 2. 组件渲染为 HTML 字符串

- 使用 React 提供的 `ReactDOMServer.renderToString` 或 `renderToNodeStream` 方法<br>
- 传入 React 组件和数据，服务端执行组件渲染逻辑<br>
- 将组件树渲染成完整的 HTML 字符串，包含对应的标签和内容<br>

#### 3. 状态注入和模板拼接

- 将数据序列化为 JSON，嵌入到生成的 HTML 页面（通常通过 `&lt;script&gt;` 标签）<br>
- 这一步用于客户端 Hydration 时恢复状态，保证前后端渲染一致<br>
- 将渲染好的 HTML 和状态注入，拼接成完整的 HTML 页面模板<br>

#### 4. 返回 HTML 响应

- 服务器将生成的完整 HTML 发送给浏览器<br>
- 浏览器解析 HTML，直接展示页面内容<br>

---

### 2.2 服务端环境需要注意

- 服务端没有 DOM API，不能直接操作 `document`、`window` 等浏览器对象<br>
- 所以组件中要避免使用浏览器专有 API 或做相应兼容处理<br>
- 服务端执行的是纯 JavaScript 代码，将组件渲染结果转成字符串<br>

---

## 三、常见误区或面试陷阱

- ❌ 认为服务端直接生成真实 DOM 节点（服务端只生成字符串）<br>
- ❌ 忽略数据异步加载导致 HTML 内容不完整<br>
- ❌ 不了解 Hydration 状态注入的重要性<br>
- ❌ 误用浏览器 API，导致服务端渲染失败

</details>

## 18. Vue 是如何实现响应式的？依赖收集是如何工作的？ {#question-subjective-ae3bcda84cba}

### 题目要点

- Vue 通过数据劫持（`Object.defineProperty` 或 `Proxy`）实现响应式<br>
- 依赖收集通过拦截 getter，收集副作用函数，记录依赖关系<br>
- 数据变化触发 setter，通知依赖重新执行，实现视图更新<br>
- Vue 3 相较 Vue 2 有更强的灵活性和性能优势<br>
- 依赖收集和响应式是 Vue 响应式系统的核心基础

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 Vue 响应式系统的核心原理<br>
- 掌握响应式数据劫持和 Proxy 的作用<br>
- 理解依赖收集（Dependency Tracking）的机制<br>
- 了解响应式系统中“触发更新”的过程<br>

---

## 二、参考答案

### 2.1 Vue 响应式的实现原理

- Vue 2.x 通过 `Object.defineProperty` 对数据对象的属性进行“劫持”，拦截数据的读取和修改<br>
- Vue 3.x 使用 ES6 的 `Proxy` 来代理整个对象，实现更全面和高效的响应式<br>
- 响应式的核心是“拦截数据读取与写入”，从而实现自动追踪和通知更新<br>

---

### 2.2 依赖收集的工作机制

#### 依赖收集流程

1. **读取数据触发 getter**<br>
   - 当组件渲染过程中访问响应式数据的某个属性时，触发该属性的 getter<br>
   - getter 中会将当前“激活的副作用函数（effect）”记录为该属性的依赖<br>

2. **存储依赖**<br>
   - 每个响应式属性对应一个“依赖集合”（Dep），存储所有依赖该属性的副作用函数<br>
   - 这样当数据变化时，能精准找到需要重新执行的函数<br>

3. **修改数据触发 setter**<br>
   - 当响应式属性被修改时，setter 被触发<br>
   - setter 会通知该属性的依赖集合，触发所有相关副作用函数重新执行，完成视图更新<br>

---

### 2.3 具体实现细节

- Vue 2.x 的响应式是基于 `Object.defineProperty` 实现，针对每个属性定义 getter/setter<br>
- Vue 3.x 利用 `Proxy` 能监听整个对象操作，包括属性新增和删除，更灵活<br>
- 依赖收集是通过一个全局“当前激活副作用”变量实现，配合 Dep（依赖收集器）管理订阅者<br>
- 副作用函数（effect）一般是组件的渲染函数或计算属性函数<br>

---

### 2.4 响应式优势

- 自动追踪依赖，无需手动指定更新逻辑<br>
- 精准更新，减少不必要的视图渲染<br>
- 兼容普通对象、数组、Map、Set 等数据结构（Vue 3）<br>

---

## 三、常见误区或面试陷阱

- ❌ 认为 Vue 响应式是通过轮询或脏检查实现<br>
- ❌ 忽略 Proxy 对属性新增和删除的支持<br>
- ❌ 误解依赖收集是一次性完成，实际是动态且持续的<br>
- ❌ 忽视副作用函数和依赖集合的对应关系

</details>

## 19. React 和 Vue 在性能方面有哪些差异 {#question-subjective-c1a83a0cb458}

### 题目要点

- Vue 的响应式系统带来细粒度、自动化的性能优化优势<br>
- React 依赖不可变数据和手动优化机制，灵活但需开发者配合<br>
- React Fiber 架构支持并发和任务调度，适合复杂应用<br>
- Vue 3 对虚拟 DOM 和响应式做了大量性能提升<br>
- 两者性能差异受项目复杂度、数据结构、使用习惯等多方面影响<br>
- 选型和优化需结合实际业务场景与团队技术栈

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 与 Vue 在性能优化机制上的设计差异<br>
- 掌握两者响应式系统和渲染流程对性能的影响<br>
- 了解各自框架的虚拟 DOM 实现和更新策略<br>
- 认识两者在实际项目中的性能表现及优化建议<br>

---

## 二、参考答案

### 2.1 响应式系统与数据变化检测

- **Vue**<br>
  - Vue 2 使用 `Object.defineProperty` 劫持数据属性，Vue 3 使用 `Proxy`<br>
  - 响应式系统自动追踪依赖，实现精准更新，只更新实际变更的组件部分<br>
  - 依赖收集机制避免不必要的渲染，性能较优

- **React**<br>
  - 依赖于不可变数据和手动触发状态更新（`setState`、Hooks）<br>
  - 组件重新渲染基于状态或 props 变化，需开发者合理控制渲染粒度<br>
  - 通过 `shouldComponentUpdate`、`React.memo`、`useMemo` 等优化渲染

### 2.2 虚拟 DOM 实现和 Diff 算法

- **React**<br>
  - React Fiber 架构支持增量渲染、优先级调度和任务中断<br>
  - Diff 算法复杂且功能丰富，适合大型复杂应用<br>
  - 支持并发模式，提升响应性能和用户体验

- **Vue**<br>
  - Vue 采用模板编译优化，生成高效渲染函数<br>
  - Diff 过程更聚焦于组件局部更新，性能开销较低<br>
  - Vue 3 进一步优化虚拟 DOM 和渲染机制，性能提升明显

### 2.3 组件更新和渲染控制

- **React**<br>
  - 组件更新依赖于状态和 props 变化，频繁更新可能影响性能<br>
  - 需手动通过 `React.memo` 等手段避免无效渲染<br>
  - 优化点在于数据不可变性和渲染粒度控制

- **Vue**<br>
  - 响应式系统天然跟踪依赖，实现细粒度更新<br>
  - 减少全组件重新渲染，性能开销更低<br>
  - 通过计算属性和侦听器优化复杂逻辑

### 2.4 性能优化生态与工具支持

- **React**<br>
  - 丰富的性能分析工具（React Profiler）<br>
  - 并发模式和自动批处理提升性能<br>
  - 依赖开发者进行合理优化，灵活性高但门槛较大

- **Vue**<br>
  - 依赖响应式系统自动优化，大部分场景开箱即用<br>
  - Vue Devtools 提供性能追踪支持<br>
  - Vue 3 性能提升明显，适合快速开发和中大型项目

---

## 三、常见误区或面试陷阱

- ❌ 认为 React 性能必然低于 Vue 或反之<br>
- ❌ 忽视数据结构设计和状态管理对性能的影响<br>
- ❌ 误解虚拟 DOM 实现细节，简单归结为“快”或“慢”<br>
- ❌ 忽略具体项目需求、团队熟悉度对性能表现的影响

</details>

## 20. Vue 有 computed，React 是如何处理类似功能的 {#question-subjective-c80effe07403}

### 题目要点

* Vue `computed` 自动依赖收集，缓存计算结果，使用方便
* React 用 `useMemo` 手动指定依赖，实现类似缓存计算
* React 的缓存机制更灵活但需要开发者精准管理依赖
* 合理使用 `useMemo` 可以减少不必要的计算，提高性能
* 两者本质上都是为优化计算性能设计的机制

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 Vue 中 computed 的概念及作用<br>
- 掌握 React 中实现“计算属性”或“缓存计算”的常用方式<br>
- 了解两者响应式和渲染机制差异对实现的影响<br>
- 掌握 React Hooks 中 `useMemo` 的使用场景及注意点<br>

---

## 二、参考答案

### 2.1 Vue 中 computed 的作用和原理

- `computed` 是基于依赖收集的响应式计算属性<br>
- 只有依赖的响应式数据发生变化时，computed 才重新计算，否则返回缓存结果<br>
- 计算过程自动追踪依赖，避免重复计算，提升性能<br>
- 适用于复杂计算或多个组件共用计算结果<br>

### 2.2 React 处理类似功能的方式

- React 没有内置的 `computed` API<br>
- 常用的替代方案是使用 **`useMemo` Hook**：<br>
  - `useMemo` 接收一个计算函数和依赖数组<br>
  - 仅当依赖项变化时，重新执行计算函数，否则复用缓存值<br>
  - 用于避免重复计算，优化性能<br>

```jsx
const computedValue = useMemo(() => {
  // 复杂计算逻辑
  return someExpensiveCalculation(props.data);
}, [props.data]);
````

* 也可以通过自定义 Hook 封装计算逻辑，提高复用性

### 2.3 其他相关机制

* React 的函数组件本身是无状态纯函数，依赖于 `useState` 和 `useEffect` 管理状态和副作用
* `useMemo` 仅缓存计算结果，不缓存副作用
* React 开发者需合理选择依赖项，避免缓存失效或 stale data 问题
* 对比 Vue，React 依赖开发者手动管理依赖，灵活但复杂度较高

---

## 三、常见误区或面试陷阱

* ❌ 误认为 `useMemo` 总是带来性能提升，实际上滥用可能反而开销更大
* ❌ 忽略依赖数组，导致缓存无效或错误
* ❌ 将 `useMemo` 用作副作用，实际应使用 `useEffect`
* ❌ 忽视 React 组件重新渲染时 `useMemo` 的缓存机制

</details>

## 21. 除了 JavaScript，你还了解其他编程语言吗 {#question-subjective-bd6c3dca8484}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 22. 在编程中，进程和线程的概念是什么 {#question-subjective-17f3aa7f1265}

### 题目要点

- 进程是资源分配的独立单位，线程是执行的基本单位<br>
- 线程共享进程资源，进程资源相互隔离<br>
- 多线程切换开销小，适合轻量级并发<br>
- 多进程提供更好隔离性和稳定性<br>
- 并发编程中需根据实际需求权衡使用进程或线程

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解进程与线程的基本定义和区别<br>
- 掌握进程和线程的工作机制及资源管理差异<br>
- 理解多进程、多线程编程模型及应用场景<br>
- 理解进程与线程的调度和通信方式<br>

---

## 二、参考答案

### 2.1 进程的概念

- 进程是操作系统分配资源的基本单位，是正在运行的程序实例<br>
- 拥有独立的地址空间、内存、文件句柄等资源<br>
- 一个操作系统可以同时运行多个进程，彼此间内存独立<br>
- 进程之间通信复杂，一般通过进程间通信（IPC）机制实现<br>

### 2.2 线程的概念

- 线程是进程内的执行单位，是程序执行的最小调度单位<br>
- 同一进程内的多个线程共享进程资源（内存空间、文件句柄等）<br>
- 线程之间切换开销较小，适合并发执行任务<br>
- 多线程提高程序执行效率，但需注意同步和资源竞争问题<br>

### 2.3 进程与线程的主要区别

| 维度         | 进程                           | 线程                           |
|--------------|--------------------------------|--------------------------------|
| 资源拥有     | 拥有独立资源（内存空间等）      | 共享进程资源                   |
| 调度单位     | 操作系统调度的基本单位          | 线程调度的基本单位             |
| 通信方式     | 进程间通信（IPC），复杂且开销大  | 线程间通信直接共享内存，速度快 |
| 创建销毁开销 | 较大                           | 较小                           |
| 稳定性       | 进程崩溃不影响其他进程          | 一个线程异常可能影响整个进程   |

### 2.4 应用场景

- 多进程适用于资源隔离、安全性高的场景，如 Web 服务器多进程架构<br>
- 多线程适合计算密集型或 IO 并发任务，提高执行效率<br>
- 现代系统常结合使用多进程和多线程实现高效、稳定的并发<br>

---

## 三、常见误区或面试陷阱

- ❌ 混淆进程和线程的资源隔离和共享机制<br>
- ❌ 忽视线程安全问题，误认为线程间无竞争<br>
- ❌ 认为多线程一定比多进程更高效，忽略上下文切换开销<br>
- ❌ 不理解进程和线程的调度开销差异，错误设计并发方案

</details>

## 23. 一个进程可能会有几个堆和几个栈 {#question-subjective-88636c9d0dfb}

### 题目要点

- 一个进程通常只有一个堆，供所有线程共享使用<br>
- 每个线程都有独立的栈，用于存储局部变量和函数调用信息<br>
- 堆负责动态内存分配，栈负责函数调用管理<br>
- 多线程程序中堆是共享资源，栈是线程私有资源<br>
- 理解堆和栈的区别及数量，有助于设计安全高效的并发程序

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解进程内存结构中堆和栈的定义<br>
- 掌握堆和栈的数量及其对应关系<br>
- 了解多线程环境下堆和栈的变化<br>
- 理解堆和栈的作用及管理机制<br>

---

## 二、参考答案

### 2.1 堆（Heap）的数量

- 一个进程通常只有 **一个堆**<br>
- 堆是进程内存中用于动态分配内存的区域<br>
- 所有线程共享同一个堆，线程可以动态分配和释放内存<br>
- 堆上的内存管理由程序或语言运行时负责，如 `malloc`、`new`<br>

### 2.2 栈（Stack）的数量

- 一个进程中，每个线程都有 **自己的独立栈**<br>
- 栈用于存储函数调用时的局部变量、参数、返回地址等<br>
- 因为每个线程执行独立的调用栈，所以每个线程都有一个独立的栈空间<br>
- 主线程有主栈，子线程各自拥有各自的栈<br>

### 2.3 关系总结

| 资源   | 数量                           | 作用                         | 共享情况               |
|--------|--------------------------------|------------------------------|------------------------|
| 堆     | 通常只有一个                   | 动态分配内存，跨线程共享     | 所有线程共享           |
| 栈     | 每个线程一个独立的栈           | 存储函数调用信息和局部变量   | 线程独享，互不干扰     |

### 2.4 其他补充

- 虽然堆是共享的，但多线程访问堆时需做好同步，防止竞态条件<br>
- 栈大小一般固定，由系统或线程创建时分配<br>
- 线程的栈空间相对较小，堆空间可以动态增长<br>

---

## 三、常见误区或面试陷阱

- ❌ 认为每个线程也有独立的堆（实际上堆是共享的）<br>
- ❌ 误以为进程只有一个栈（多线程时栈的数量等于线程数）<br>
- ❌ 忽略多线程访问堆的同步问题<br>
- ❌ 混淆栈和堆的作用及生命周期

</details>

## 24. 为什么会有堆内存和栈内存的区分？它们各自有什么特点 {#question-subjective-7b59efc1ce27}

### 题目要点

- 栈和堆内存设计目的是优化内存分配和程序性能<br>
- 栈内存自动管理，速度快但空间有限，适合局部数据<br>
- 堆内存动态管理，灵活但分配和释放开销较大<br>
- 两者协同保证程序运行的高效和灵活<br>
- 理解堆栈区分，有助于合理设计程序和避免内存错误

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解堆内存和栈内存设计的初衷与区别<br>
- 掌握堆和栈的内存管理方式及生命周期<br>
- 了解两者的性能差异和使用场景<br>
- 理解程序执行时堆栈协作的机制<br>

---

## 二、参考答案

### 2.1 为什么区分堆和栈？

- **目的在于优化内存管理与程序执行效率**<br>
- 栈内存结构简单，分配释放快，适合存储局部变量和函数调用信息<br>
- 堆内存灵活，支持动态分配和释放，适合存储生命周期不确定的数据<br>
- 这种区分帮助操作系统和运行时高效管理内存资源，保证程序稳定和高效执行<br>

---

### 2.2 栈内存的特点

- **内存分配方式**：连续且自动，系统通过调整栈指针完成分配和释放<br>
- **生命周期**：函数调用开始时分配，结束时自动释放<br>
- **访问速度**：极快，CPU 直接支持栈操作<br>
- **大小限制**：较小，固定大小（通常几 MB），栈溢出会导致程序崩溃<br>
- **用途**：存储函数参数、局部变量、返回地址等临时数据<br>
- **线程私有**：每个线程有独立栈，互不影响<br>

---

### 2.3 堆内存的特点

- **内存分配方式**：动态分配，程序员或运行时手动管理（如 malloc/free 或 GC）<br>
- **生命周期**：灵活，可跨函数调用，直到显式释放或垃圾回收<br>
- **访问速度**：比栈慢，因需维护内存分配数据结构，存在碎片化问题<br>
- **大小限制**：较大，受限于系统内存和进程地址空间<br>
- **用途**：存储对象、动态数据结构、全局或共享数据等<br>
- **线程共享**：堆是所有线程共享的内存区域，需要同步机制保证安全<br>

---

### 2.4 区分的意义总结

- 栈适合频繁分配、生命周期短、大小确定的数据，保证高效执行<br>
- 堆适合生命周期不确定、大小动态变化的数据，提供灵活性<br>
- 两者协同工作，使程序既高效又灵活，满足不同需求<br>

---

## 三、常见误区或面试陷阱

- ❌ 认为堆内存比栈内存“更好”，忽视其分配开销和管理复杂性<br>
- ❌ 混淆栈和堆的生命周期和访问权限<br>
- ❌ 忽略栈大小有限制，导致栈溢出问题<br>
- ❌ 忽视多线程环境下堆内存的同步和安全问题

</details>

## 25. JavaScript 是单线程语言，这个特点有什么好处？为什么设计成单线程的 {#question-subjective-451dae27086c}

### 题目要点

- JavaScript 运行在单线程环境，保证执行顺序和状态一致性<br>
- 单线程简化并发控制，避免复杂的同步和竞态问题<br>
- 设计初衷是适应浏览器环境需求，保证 UI 渲染和脚本执行协调<br>
- 事件循环和异步机制弥补了单线程的局限，提升性能和体验<br>
- 现代环境通过 Web Worker 等支持多线程，但核心执行仍单线程

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 JavaScript 单线程模型的含义<br>
- 掌握单线程设计带来的优势及限制<br>
- 理解事件循环（Event Loop）与异步机制如何配合单线程<br>
- 认识单线程设计背后的历史和实际应用考量<br>

---

## 二、参考答案

### 2.1 JavaScript 单线程的含义

- JavaScript 运行在单个主线程上，意味着同一时刻只执行一个任务<br>
- 所有代码执行、事件处理、UI 渲染等都在这个线程内顺序进行<br>
- 避免了多线程环境下复杂的线程同步和竞争问题<br>

### 2.2 单线程的好处

- **简化并发控制**<br>
  - 无需显式锁、死锁等多线程问题，降低程序复杂度<br>
- **避免数据竞争和状态不一致**<br>
  - 由于只有一个执行线程，访问共享数据时无需担心竞态条件<br>
- **一致的执行顺序**<br>
  - 代码执行按顺序进行，易于理解和调试<br>
- **适合浏览器环境设计**<br>
  - 浏览器需要同时处理 UI 渲染和 JS 执行，单线程避免渲染阻塞和状态混乱<br>

### 2.3 为什么设计成单线程

- **历史原因**<br>
  - JavaScript 最初设计用于网页浏览器，主要处理用户交互和DOM操作<br>
  - 浏览器环境中，UI 渲染必须同步，线程切换和并发会带来巨大复杂性<br>
- **保证执行环境安全与简洁**<br>
  - 单线程避免了复杂的同步机制，提高性能和稳定性<br>
- **通过事件循环和异步机制补充**<br>
  - 虽然是单线程，JS 通过事件循环（Event Loop）实现异步任务和并发效果<br>
  - 使得单线程下仍能高效处理 IO、定时器、网络请求等任务<br>

### 2.4 现实中的应用和演变

- 现代浏览器引入 Web Worker 支持多线程处理，但 JS 主线程仍保持单线程<br>
- 单线程设计保证了主线程的安全和 UI 的流畅<br>
- 异步机制和回调函数、Promise、async/await 等使得编程更灵活<br>

---

## 三、常见误区或面试陷阱

- ❌ 误以为单线程意味着 JS 只能同步执行，忽视异步机制<br>
- ❌ 认为单线程不能实现并发或异步操作<br>
- ❌ 忽略事件循环机制对单线程性能和并发的支撑作用<br>
- ❌ 混淆主线程与浏览器底层多线程（如渲染线程、网络线程）

</details>

## 26. Node.js 相比其他服务端语言有什么优势 {#question-subjective-93246d221324}

### 题目要点

- Node.js 采用单线程异步非阻塞 I/O，适合高并发 I/O 密集型应用<br>
- 统一使用 JavaScript，提升开发效率和团队协作<br>
- 拥有丰富生态系统和灵活模块化设计，支持现代架构<br>
- 启动快、资源占用低，适合轻量级微服务<br>
- 需要注意单线程瓶颈和异步编程技巧，合理设计应用结构

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 Node.js 的架构特点及设计理念<br>
- 掌握 Node.js 在性能、扩展性和开发效率方面的优势<br>
- 了解 Node.js 与传统服务端语言（如 Java、PHP、Python 等）的区别<br>
- 掌握 Node.js 适用的典型应用场景<br>

---

## 二、参考答案

### 2.1 单线程事件驱动架构

- Node.js 基于单线程事件循环（Event Loop），采用异步非阻塞 I/O 模型<br>
- 能高效处理大量并发请求，避免线程切换和资源消耗<br>
- 适合 I/O 密集型应用（网络请求、文件操作等），性能表现优异<br>

### 2.2 JavaScript 全栈统一语言

- 前端和后端均使用 JavaScript，降低团队学习成本<br>
- 代码复用性高，前后端共享部分逻辑（如校验、数据结构）<br>
- 促进开发效率和协作，快速构建和迭代产品<br>

### 2.3 丰富的生态系统和模块化

- npm 拥有海量开源包，覆盖各种功能需求<br>
- 模块化设计方便组件拆分和复用<br>
- 支持微服务、Serverless 等现代架构模式<br>

### 2.4 高扩展性与灵活性

- 支持事件驱动、高并发场景，适合实时应用（聊天、推送等）<br>
- 灵活的异步编程模型（Promise、async/await）易于编写高效代码<br>
- 支持多进程/集群模式，解决单线程瓶颈<br>

### 2.5 快速启动和轻量级

- 启动快，资源占用低<br>
- 适合构建轻量级服务和微服务架构<br>
- 易于部署和运维<br>

---

## 三、常见误区或面试陷阱

- ❌ 误认为 Node.js 适合所有场景，忽视 CPU 密集型任务瓶颈<br>
- ❌ 忽略单线程可能导致阻塞的问题，需合理使用异步和多进程<br>
- ❌ 认为 JavaScript 不适合后端开发，忽略其生态和性能优势<br>
- ❌ 忽视 Node.js 在安全和稳定性方面的最佳实践

</details>

## 27. V8 是用什么语言编写的？为什么选择这种语言 {#question-subjective-089a79b5b206}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 28. 高级语言需要经过哪些步骤才能在计算机上运行 {#question-subjective-5599d23ad88b}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 29. 编译 C++ 代码的程序是用什么语言编写的 {#question-subjective-b1e3a801c126}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 30. 你用 Node.js 写过什么项目或工具 {#question-subjective-3e9fde33feb9}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 31. 请解释一下 JavaScript 的事件循环机制 {#question-subjective-346e4eeba592}

如果有一个 setTimeout(() => {}, 1000)，这个回调是什么时候进入队列的？是在执行 setTimeout 的时候，还是在等待 1000ms 之后

### 题目要点

* 事件循环保证单线程中异步任务的顺序执行
* `setTimeout` 回调在计时结束后才入宏任务队列，不是调用时
* 宏任务与微任务分离，微任务优先执行
* 1000ms 是最短等待时间，实际执行受事件循环调度影响

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 JavaScript 单线程与异步执行模型<br>
- 掌握事件循环（Event Loop）的核心原理和流程<br>
- 理解宏任务（task）与微任务（microtask）的区别与执行顺序<br>
- 了解定时器（setTimeout）回调的入队时机和触发条件<br>

---

## 二、参考答案

### 2.1 JavaScript 事件循环机制简介

- JavaScript 是单线程语言，所有代码运行在主线程中<br>
- 事件循环机制使得 JavaScript 能异步处理任务，不阻塞主线程<br>
- 事件循环不断从任务队列中取任务执行，保证任务有序执行<br>
- 任务分为两类：<br>
  - **宏任务（Macro Task）**：如 `setTimeout`、`setInterval`、I/O 操作、UI 渲染等<br>
  - **微任务（Micro Task）**：如 `Promise.then`、`queueMicrotask`、`MutationObserver`<br>

- 每轮事件循环（tick）流程：<br>
  1. 执行当前调用栈中的同步代码<br>
  2. 执行所有微任务队列中的任务，直到清空<br>
  3. 从宏任务队列取一个任务执行<br>
  4. 浏览器可能进行渲染更新<br>
  5. 循环回第 1 步继续<br>

---

### 2.2 setTimeout 回调的入队时机

- 调用 `setTimeout(callback, 1000)` 时：<br>
  - 浏览器启动一个计时器，计时开始计时 1000 毫秒<br>
  - **setTimeout 调用本身是同步执行的，回调不会立即进入任务队列**<br>
  - 直到计时器到期（1000ms 后），回调函数才被放入宏任务队列<br>
- 当事件循环空闲并且调用栈清空后，事件循环会从宏任务队列取出该回调执行<br>
- 需要注意：<br>
  - 1000ms 是最短等待时间，实际执行时间可能更晚，受事件循环状态影响<br>
  - 如果主线程一直忙于执行任务，回调会被延迟执行<br>

---

### 2.3 总结示例流程

```js
console.log('start');
setTimeout(() => {
  console.log('timeout callback');
}, 1000);
console.log('end');
````

* 输出顺序：

  1. `start` 立即打印
  2. 调用 `setTimeout`，计时开始，回调未入队列
  3. `end` 立即打印
  4. 1000ms 后，回调进入宏任务队列
  5. 事件循环取出回调执行，打印 `timeout callback`

---

## 三、常见误区或面试陷阱

* ❌ 误认为 `setTimeout` 调用时回调立即进入任务队列
* ❌ 误解等待时间为精确执行时间，忽略事件循环负载和任务排队延迟
* ❌ 混淆宏任务和微任务执行顺序
* ❌ 忽略事件循环在浏览器与 Node.js 中细节差异

</details>

## 32. 事件循环是由谁来处理的 {#question-subjective-8928af51b85f}

### 题目要点

- 事件循环由 JavaScript 的宿主环境负责实现，不属于 JS 引擎本身<br>
- 浏览器内核负责浏览器中的事件循环机制<br>
- Node.js 事件循环由 libuv 实现，管理异步 I/O 和任务调度<br>
- JavaScript 引擎负责代码执行，事件循环负责异步任务管理和调度

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解事件循环（Event Loop）机制的实现主体<br>
- 掌握事件循环与 JavaScript 引擎及宿主环境的关系<br>
- 理解浏览器或 Node.js 中事件循环的工作职责和分工<br>

---

## 二、参考答案

### 2.1 事件循环的实现主体

- **事件循环不是 JavaScript 引擎本身实现的**，而是由**宿主环境（Host Environment）**负责管理<br>
- 宿主环境包括浏览器、Node.js 等运行环境，它们提供了事件循环机制<br>
- JavaScript 引擎（如 V8）负责执行 JS 代码和调用栈管理，但不直接控制事件循环<br>

### 2.2 浏览器中的事件循环

- 浏览器中的事件循环由浏览器内核（如 Chromium 的 Blink）实现<br>
- 浏览器维护多个任务队列（宏任务队列、微任务队列等）<br>
- 浏览器调度任务，执行 JS 代码，处理事件、渲染页面等<br>
- 浏览器事件循环协调 JS 执行与 UI 渲染，使得异步操作顺畅进行<br>

### 2.3 Node.js 中的事件循环

- Node.js 事件循环由 libuv 库实现<br>
- libuv 负责管理异步 I/O、定时器、微任务和宏任务队列<br>
- Node.js 事件循环模型与浏览器类似，但有额外阶段处理网络、文件等任务<br>
- Node.js 本身基于 V8 引擎执行 JS 代码，但事件循环是 libuv 的职责<br>

### 2.4 综述

| 组件             | 角色                         | 责任                         |
|------------------|------------------------------|------------------------------|
| JavaScript 引擎  | 解释执行 JavaScript 代码      | 管理调用栈，执行同步代码       |
| 宿主环境（浏览器/Node.js） | 实现事件循环、管理任务队列     | 调度任务执行，协调异步事件     |

---

## 三、常见误区或面试陷阱

- ❌ 误认为事件循环是 JavaScript 引擎的一部分<br>
- ❌ 忽视宿主环境对事件循环的控制和实现差异<br>
- ❌ 混淆 JavaScript 语言本身和运行环境的职责<br>
- ❌ 忽略 Node.js 事件循环与浏览器事件循环的实现差异

</details>

## 33. 在浏览器环境下，JavaScript 执行在哪个进程和线程中 {#question-subjective-2cf910e4bd30}

### 题目要点

- JavaScript 代码运行在浏览器的 **渲染进程** 中<br>
- JS 执行在线程池的 **主线程（主渲染线程）** 上，单线程模型<br>
- 浏览器采用多进程多线程架构，分离渲染、网络、GPU 等任务<br>
- Web Worker 可用于 JS 多线程执行，但与主线程分开<br>
- 了解这些对调试性能和设计前端架构非常重要

<details>
<summary>参考答案</summary>

## 一、考察点

- 了解现代浏览器多进程架构<br>
- 掌握 JavaScript 执行所在的具体进程和线程位置<br>
- 理解浏览器各个进程和线程的职责划分<br>
- 理解单线程模型与浏览器多线程架构的关系<br>

---

## 二、参考答案

### 2.1 浏览器多进程架构简介

- 现代浏览器一般采用多进程架构，主要进程包括：<br>
  - **浏览器主进程（Browser Process）**：负责管理浏览器窗口、标签页、网络请求、UI 等<br>
  - **渲染进程（Renderer Process）**：负责页面渲染、JavaScript 执行、DOM 处理等<br>
  - **GPU 进程**：负责图形加速和渲染<br>
  - **网络进程（部分浏览器）**：专门处理网络通信<br>

### 2.2 JavaScript 执行的进程

- JavaScript 代码运行在 **渲染进程（Renderer Process）** 中<br>
- 每个标签页通常对应一个或多个渲染进程，保证标签页隔离和稳定性<br>

### 2.3 JavaScript 执行的线程

- 在渲染进程内部，JavaScript 执行在线程池中的 **主线程（Main Thread）** 上<br>
- 这个主线程负责执行 JS 代码、处理用户交互事件、操作 DOM 和布局、绘制页面等<br>
- 由于 JS 是单线程的，所有 JS 代码在该主线程上顺序执行<br>

### 2.4 其他线程

- 浏览器中还有其他线程辅助渲染和网络请求，比如：<br>
  - **渲染线程（Compositor Thread）** 负责合成页面层<br>
  - **事件线程** 处理异步事件和回调<br>
  - **工作线程（Web Workers）** 允许创建独立线程运行 JS，避免阻塞主线程<br>

### 2.5 总结

| 组件           | 所在进程           | 所在线程             | 作用                         |
|----------------|--------------------|----------------------|------------------------------|
| JavaScript 代码 | 渲染进程           | 渲染进程主线程（主线程）| 执行 JS，操作 DOM，处理事件   |
| UI 渲染        | 渲染进程及 GPU 进程 | 多线程并行            | 页面绘制、合成、加速          |
| 网络请求        | 浏览器主进程或网络进程 | 独立线程              | 处理网络 I/O                  |
| Web Worker     | 渲染进程           | 独立工作线程          | JS 多线程执行，计算密集任务  |

---

## 三、常见误区或面试陷阱

- ❌ 认为 JS 代码运行在浏览器主进程<br>
- ❌ 误解浏览器单进程模型，忽视现代多进程设计<br>
- ❌ 以为 JS 运行在多个线程中，忽略单线程模型及 Web Worker 区别<br>
- ❌ 混淆渲染线程与 JS 主线程的职责

</details>

## 34. 闭包 {#question-subjective-1da2188972f9}

- 产生闭包需要满足哪些必要条件？
- 如果一个外部函数内部返回一个内部函数，内部函数引用了外部函数的变量，产生闭包。如果外部函数被调用 10 次，会产生多少个闭包？
- 对其中一个闭包里的变量进行修改，会影响其他闭包里的变量吗？
- 有没有其他写法可以生成闭包？

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 35. Javascript如何实现继承？ {#question-21144fa1-41b7-4077-97cd-b0c6030b10e0}

> 题库原题：[Javascript如何实现继承？](https://fe.ecool.fun/topic/21144fa1-41b7-4077-97cd-b0c6030b10e0)

### 题目要点

## 1. 原型链继承

通过将一个构造函数的实例作为另一个构造函数的原型，实现属性和方法的继承。

### 特点

- 简单易实现。
- 缺点是父类实例的属性会被所有子类实例共享。

## 2. 借用构造函数（经典继承）

通过在子类构造函数中调用父类构造函数，实现属性的继承。

### 特点

- 避免了原型链继承共享属性的问题。
- 但无法继承父类的原型方法。

## 3. 组合继承（原型链+借用构造函数）

结合原型链继承和借用构造函数的方法，既调用父类构造函数，又将父类原型赋值给子类原型。

### 特点

- 可以继承实例属性和原型方法。
- 需要注意避免构造函数属性的多次调用。

## 4. 原型式继承

使用一个函数来创建一个新对象，并将这个新对象的原型指向另一个对象。

### 特点

- 适用于对象之间的属性继承，不涉及构造函数。

## 5. 寄生式继承

基于原型式继承，但添加了额外的包装函数，以提供更好的控制和灵活性。

### 特点

- 通过创建对象的副本来实现继承，避免修改原始对象。

## 6. ES6 类继承

使用`class`关键字和`extends`关键字实现继承。

### 特点

- 语法简洁，易于理解。
- 底层仍然是基于原型链实现。

<details>
<summary>参考答案</summary>

## 一、是什么

继承（inheritance）是面向对象软件技术当中的一个概念。

如果一个类别B“继承自”另一个类别A，就把这个B称为“A的子类”，而把A称为“B的父类别”也可以称“A是B的超类”

- 继承的优点

继承可以使得子类具有父类别的各种属性和方法，而不需要再次编写相同的代码

在子类别继承父类别的同时，可以重新定义某些属性，并重写某些方法，即覆盖父类别的原有属性和方法，使其获得与父类别不同的功能

虽然`JavaScript`并不是真正的面向对象语言，但它天生的灵活性，使应用场景更加丰富

关于继承，我们举个形象的例子：

定义一个类（Class）叫汽车，汽车的属性包括颜色、轮胎、品牌、速度、排气量等

```js
class Car{
    constructor(color,speed){
        this.color = color
        this.speed = speed
        // ...
    }
}
```

由汽车这个类可以派生出“轿车”和“货车”两个类，在汽车的基础属性上，为轿车添加一个后备厢、给货车添加一个大货箱

```js
// 货车
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.Container = true // 货箱
    }
}
```

这样轿车和货车就是不一样的，但是二者都属于汽车这个类，汽车、轿车继承了汽车的属性，而不需要再次在“轿车”中定义汽车已经有的属性

在“轿车”继承“汽车”的同时，也可以重新定义汽车的某些属性，并重写或覆盖某些属性和方法，使其获得与“汽车”这个父类不同的属性和方法

```js
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.color = "black" //覆盖
        this.Container = true // 货箱
    }
}
```

从这个例子中就能详细说明汽车、轿车以及卡车之间的继承关系

## 二、实现方式

下面给出`JavaScript`常见的继承方式：

- 原型链继承

- 构造函数继承（借助 call）
- 组合继承
- 原型式继承
- 寄生式继承
- 寄生组合式继承

### 原型链继承

原型链继承是比较常见的继承方式之一，其中涉及的构造函数、原型和实例，三者之间存在着一定的关系，即每一个构造函数都有一个原型对象，原型对象又包含一个指向构造函数的指针，而实例则包含一个原型对象的指针

举个例子

```js
 function Parent() {
    this.name = 'parent1';
    this.play = [1, 2, 3]
  }
  function Child() {
    this.type = 'child2';
  }
  Child1.prototype = new Parent();
  console.log(new Child())
```

上面代码看似没问题，实际存在潜在问题

```js
var s1 = new Child2();
var s2 = new Child2();
s1.play.push(4);
console.log(s1.play, s2.play); // [1,2,3,4]
```

改变`s1`的`play`属性，会发现`s2`也跟着发生变化了，这是因为两个实例使用的是同一个原型对象，内存空间是共享的

### 构造函数继承

借助 `call `调用`Parent`函数

```js
function Parent1(){
    this.name = 'parent1';
}

Parent.prototype.getName = function () {
    return this.name;
}

function Child(){
    Parent1.call(this);
    this.type = 'child'
}

let child = new Child();
console.log(child);  // 没问题
console.log(child.getName());  // 会报错
```

可以看到，父类原型对象中一旦存在父类之前自己定义的方法，那么子类将无法继承这些方法

相比第一种原型链继承方式，父类的引用属性不会被共享，优化了第一种继承方式的弊端，但是只能继承父类的实例属性和方法，不能继承原型属性或者方法

### 组合继承

前面我们讲到两种继承方式，各有优缺点。组合继承则将前两种方式继承起来

```js
function Parent3 () {
    this.name = 'parent3';
    this.play = [1, 2, 3];
}

Parent3.prototype.getName = function () {
    return this.name;
}
function Child3() {
    // 第二次调用 Parent3()
    Parent3.call(this);
    this.type = 'child3';
}

// 第一次调用 Parent3()
Child3.prototype = new Parent3();
// 手动挂上构造器，指向自己的构造函数
Child3.prototype.constructor = Child3;
var s3 = new Child3();
var s4 = new Child3();
s3.play.push(4);
console.log(s3.play, s4.play);  // 不互相影响
console.log(s3.getName()); // 正常输出'parent3'
console.log(s4.getName()); // 正常输出'parent3'
```

这种方式看起来就没什么问题，方式一和方式二的问题都解决了，但是从上面代码我们也可以看到` Parent3` 执行了两次，造成了多构造一次的性能开销

### 原型式继承

这里主要借助`Object.create`方法实现普通对象的继承

同样举个例子

```js
let parent4 = {
    name: "parent4",
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };

  let person4 = Object.create(parent4);
  person4.name = "tom";
  person4.friends.push("jerry");

  let person5 = Object.create(parent4);
  person5.friends.push("lucy");

  console.log(person4.name); // tom
  console.log(person4.name === person4.getName()); // true
  console.log(person5.name); // parent4
  console.log(person4.friends); // ["p1", "p2", "p3","jerry","lucy"]
  console.log(person5.friends); // ["p1", "p2", "p3","jerry","lucy"]
```

这种继承方式的缺点也很明显，因为`Object.create `方法实现的是浅拷贝，多个实例的引用类型属性指向相同的内存，存在篡改的可能

### 寄生式继承

寄生式继承在上面继承基础上进行优化，利用这个浅拷贝的能力再进行增强，添加一些方法

```js
let parent5 = {
    name: "parent5",
    friends: ["p1", "p2", "p3"],
    getName: function() {
        return this.name;
    }
};

function clone(original) {
    let clone = Object.create(original);
    clone.getFriends = function() {
        return this.friends;
    };
    return clone;
}

let person5 = clone(parent5);

console.log(person5.getName()); // parent5
console.log(person5.getFriends()); // ["p1", "p2", "p3"]
```

其优缺点也很明显，跟上面讲的原型式继承一样

### 寄生组合式继承

寄生组合式继承，借助解决普通对象的继承问题的` Object.create` 方法，在亲全面几种继承方式的优缺点基础上进行改造，这也是所有继承方式里面相对最优的继承方式

```js
function clone (parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
}
Parent6.prototype.getName = function () {
    return this.name;
}
function Child6() {
    Parent6.call(this);
    this.friends = 'child5';
}

clone(Parent6, Child6);

Child6.prototype.getFriends = function () {
    return this.friends;
}

let person6 = new Child6();
console.log(person6); //{friends:"child5",name:"parent6",play:[1,2,3],__proto__:Parent6}
console.log(person6.getName()); // parent6
console.log(person6.getFriends()); // child5
```

可以看到 person6 打印出来的结果，属性都得到了继承，方法也没问题

文章一开头，我们是使用`ES6` 中的`extends `关键字直接实现 `JavaScript `的继承

```js
class Person {
  constructor(name) {
    this.name = name
  }
  // 原型方法
  // 即 Person.prototype.getName = function() { }
  // 下面可以简写为 getName() {...}
  getName = function () {
    console.log('Person:', this.name)
  }
}
class Gamer extends Person {
  constructor(name, age) {
    // 子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    super(name)
    this.age = age
  }
}
const asuna = new Gamer('Asuna', 20)
asuna.getName() // 成功访问到父类的方法
```

利用`babel`工具进行转换，我们会发现`extends`实际采用的也是寄生组合继承方式，因此也证明了这种方式是较优的解决继承的方式

## 三、总结

下面以一张图作为总结：

 ![](https://static.ecool.fun//article/c15679e3-2c26-4aef-a14f-8d6a68179bce.png)

通过`Object.create` 来划分不同的继承方式，最后的寄生式组合继承方式是通过组合继承改造之后的最优继承方式，而 `extends` 的语法糖和寄生组合继承的方式基本类似

</details>

## 36. 递归的定义是什么？它通常用在哪些场景 {#question-subjective-df9fa682a18a}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 37. 请解释一下链表数据结构 {#question-subjective-7e5523f3bea5}

### 题目要点

节点结构（值与指针）、头尾节点、顺序访问复杂度，以及单链表、双向链表和循环链表的取舍。

<details>
<summary>参考答案</summary>

链表由一组不必连续存储的节点组成。每个节点保存数据和指向下一个节点的指针；双向链表还会保存前驱指针。链表通常从头节点开始遍历，因此按下标查找是 O(n)，但在已知插入位置或前驱节点时，插入、删除只需修改指针，可做到 O(1)。

与数组相比，链表不要求连续内存，扩容和局部增删更灵活，但随机访问较慢，也会付出额外指针空间。常见变体包括单链表、双向链表和循环链表，可用于队列、LRU 缓存、邻接表等场景。

</details>

## 38. 深拷贝 {#question-subjective-c417f184d633}

- 如何实现深拷贝？
- 遍历对象的所有属性有哪些方法？
- for...in
- Object.keys()

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-64/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-64/round-104/index.md" >}}) →
