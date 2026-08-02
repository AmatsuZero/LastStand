+++
title = "京东-技术中台-校招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "京东", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/27"
experienceId = 27
roundId = 31
roundOrder = 1
company = "京东"
date = "2025-06-27T05:48:05.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-27/round-30/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-27/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试聚焦CSS布局核心问题（浮动清除、BFC机制）、高频JS手写能力（防抖函数）、工程化实践（TS迁移痛点、Vue3升级策略）、深度性能优化（缓存协同更新、Tree Shaking原理）。难点在于浮动导致的布局塌陷解决方案、CDN与本地缓存协同策略设计，以及复杂框架迁移的兼容性处理。

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 浮动元素导致的布局错乱应该如何解决？ {#question-subjective-1bcbaffba536}

### 题目要点

CSS浮动布局及解决方案。

<details>
<summary>参考答案</summary>

浮动元素会导致其父元素高度塌陷，从而影响布局。解决方法有：

    1. 清除浮动：在浮动元素后面添加一个空的`div`，设置`clear: both`。
    2. 使用伪元素清除浮动：在父元素上使用`::after`伪元素，设置`clear: both`。

```css
.parent::after {
  content: "";
  display: block;
  clear: both;
}
```

    1. 使用`overflow: hidden`：给父元素设置`overflow: hidden`，但可能会隐藏超出部分的内容。
    2. 使用`BFC`（块级格式化上下文）：通过设置`display: flow-root`或`overflow: auto`等属性，使父元素形成一个独立的BFC，从而包含浮动元素。

</details>

## 2. 实现一个固定侧边栏+自适应主内容的布局 {#question-subjective-f249762a3656}

### 题目要点

CSS布局技巧。

<details>
<summary>参考答案</summary>

可以使用`flexbox`布局实现固定侧边栏和自适应主内容的布局：

```html
<div class="container">
  <div class="sidebar">侧边栏</div>
  <div class="main">主内容</div>
</div>

```

```css
.container {
  display: flex;
}
.sidebar {
  width: 200px; /* 固定宽度 */
  background-color: #f0f0f0;
}
.main {
  flex: 1; /* 自适应宽度 */
  background-color: #ffffff;
}
```

</details>

## 3. 实现 debounce（防抖）函数 {#question-c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c}

> 题库原题：[实现 debounce（防抖）函数](https://fe.ecool.fun/topic/c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c)

### 题目要点

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

<details>
<summary>参考答案</summary>

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

```js
const debounce = (fn, time) => {
  let timeout = null;
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
};

```

防抖常应用于用户进行搜索输入节约请求资源，window触发resize事件时进行防抖只触发一次。

</details>

## 4. 讲一下你的实习项目 {#question-subjective-b43652718045}

### 题目要点

项目经验及个人贡献。

<details>
<summary>参考答案</summary>

参考回答：

我的实习项目是一个电商平台的前端开发。主要负责商品详情页和购物车页面的开发。在项目中，我使用了Vue.js框架，通过组件化开发提高了代码的可维护性。针对商品详情页的图片加载性能问题，我引入了懒加载技术，显著提升了页面加载速度。同时，我还参与了购物车功能的优化，通过本地缓存和后端接口的优化，减少了用户等待时间。

</details>

## 5. 项目中使用ts 的场景，当时迁移遇到了什么问题，怎么解决的 {#question-subjective-fbcd63e11e24}

### 题目要点

TypeScript的使用及迁移问题。

<details>
<summary>参考答案</summary>

在项目中，我们使用TypeScript来提高代码的可读性和可维护性。迁移过程中遇到的主要问题是：

    1. 类型定义问题：一些第三方库没有提供完整的类型定义文件。解决方法是手动编写类型定义文件或使用`@types`库。
    2. 编译错误：部分代码不符合TypeScript的类型规则。解决方法是逐步修复代码，确保类型正确。
    3. 性能问题：TypeScript的编译速度较慢。解决方法是使用增量编译和缓存机制，减少编译时间。

</details>

## 6. vue3.0是全量迁移么 ？vue2中废弃的api是怎么处理的 {#question-subjective-b9e536f8361b}

### 题目要点

Vue 3迁移策略。

<details>
<summary>参考答案</summary>

Vue 3.0并不是全量迁移，它提供了兼容模式，允许渐进式迁移。对于Vue 2中废弃的API，Vue 3提供了`vue-composition-api`插件，可以在Vue 2项目中提前体验Vue 3的新特性。在迁移过程中，建议逐步替换废弃的API，同时使用`vue-template-compiler`等工具检查代码中的兼容性问题。

</details>

## 7. 本地缓存（LocalStorage）与CDN缓存的协同更新策略详细讲讲 {#question-subjective-08f400a28948}

### 题目要点

缓存策略及更新机制。

<details>
<summary>参考答案</summary>

本地缓存（LocalStorage）和CDN缓存的协同更新策略需要确保数据的一致性和及时性。具体策略包括：

    1. 版本控制：在CDN资源的URL中添加版本号，例如`script.js?v=1.0.1`。每次更新资源时，更新版本号，确保客户端加载最新的资源。
    2. 本地缓存失效机制：在本地缓存中存储资源的版本信息，当检测到CDN资源版本更新时，清除本地缓存并重新加载。
    3. 缓存失效时间：合理设置CDN缓存的失效时间（TTL），确保在更新资源后，客户端能够及时获取到最新版本。

</details>

## 8. 性能优化都做过哪些工作？ {#question-subjective-f7a55407621d}

### 题目要点

前端性能优化经验。

<details>
<summary>参考答案</summary>

在项目中，我主要进行了以下性能优化工作：

    1. 代码压缩：使用Webpack等工具对JavaScript和CSS文件进行压缩。
    2. 图片优化：对图片进行压缩和懒加载，减少页面加载时间。
    3. 缓存策略：合理设置HTTP缓存策略，减少重复请求。
    4. 服务端渲染（SSR）：使用SSR技术，减少客户端的渲染压力，提高首屏加载速度。
    5. 性能监控：使用性能监控工具（如Lighthouse）定期检查页面性能，及时发现并解决问题。

</details>

## 9. Tree Shaking的原理 {#question-subjective-d9758e65a7fd}

### 题目要点

Tree Shaking原理。

<details>
<summary>参考答案</summary>

Tree Shaking是一种代码优化技术，主要用于移除未使用的代码。其原理基于ES6模块的静态分析：

    1. 静态分析：在构建过程中，通过分析模块的导入和导出关系，确定哪些代码是未被使用的。
    2. 移除未使用代码：在打包过程中，将未使用的代码从最终的打包文件中移除，从而减小打包体积。
    3. 依赖工具：Webpack等构建工具支持Tree Shaking，通过配置`mode: 'production'`等选项，自动启用Tree Shaking功能。

</details>

## 10. 遇到的比较困难的问题，是如何解决的？ {#question-subjective-135aacd6a439}

### 题目要点

问题解决能力。

<details>
<summary>参考答案</summary>

在项目中，我遇到的一个比较困难的问题是跨浏览器兼容性问题。具体问题是某个页面在Chrome上显示正常，但在Firefox上出现了布局错乱。为了解决这个问题，我采取了以下步骤：

    1. 问题定位：使用浏览器开发者工具检查CSS样式和DOM结构，找出差异。
    2. 测试和调试：在不同浏览器上进行测试，逐步缩小问题范围。
    3. 解决方案：发现是某些CSS属性在Firefox中的默认值与Chrome不同，通过添加浏览器前缀或调整CSS规则，解决了兼容性问题。

</details>

## 11. 前端学习相关的 {#question-subjective-318d627464ce}

### 题目要点

前端学习方法和资源。

<details>
<summary>参考答案</summary>

前端学习需要系统性和实践性相结合。以下是一些推荐的学习方法和资源：

    1. 基础知识：通过阅读经典书籍（如《HTML与CSS设计与构建网站》、《JavaScript高级程序设计》）学习基础知识。
    2. 在线课程：利用在线平台（如Coursera、Udemy、网易云课堂）学习前端开发课程。
    3. 实践项目：通过实际项目（如开源项目、个人项目）积累经验，提高解决问题的能力。
    4. 社区交流：参与前端开发者社区（如Stack Overflow、知乎、掘金），与同行交流经验和解决问题。
    5. 持续学习：关注前端技术的最新动态（如Vue.js、React.js、TypeScript等），通过阅读技术博客和参加技术会议保持知识更新。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-27/round-30/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-27/_index.md" >}}) · 已是最后一轮 →
