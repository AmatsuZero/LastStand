+++
title = "腾讯-3年社招-前端面试 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/79"
experienceId = 79
roundId = 127
roundOrder = 1
company = "腾讯"
date = "2025-09-07T02:45:19.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-79/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-79/round-128/index.md" >}}) →

**本轮概述：** 这些题目全面考察了前端工程师在实际项目中需要掌握的核心技术和解决问题的能力，涵盖了从基础原理到工程实践的各个层面。

本轮共 23 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍、项目介绍 {#question-subjective-327b17e537b3}

### 题目要点

技术栈熟练度、架构经验、性能优化成果、团队协作能力

<details>
<summary>参考答案</summary>

具有3年前端开发经验，专注于现代化前端技术栈和工程化实践。主要负责过大型电商平台的前端架构设计和性能优化工作，熟练掌握 Vue/React 生态系统。在项目中主导了从传统架构向微前端架构的迁移，通过模块联邦和组件库建设提升了团队开发效率。同时在性能优化方面有丰富实践，将核心页面的首屏加载时间优化至2秒以内。

</details>

## 2. 可视化搭建平台中，如何设计数据规范保证组件间数据兼容性？请求收效的具体实现方案是什么？ {#question-subjective-264a86fa57fa}

### 题目要点

Schema规范、数据校验、适配器模式、请求优化策略

<details>
<summary>参考答案</summary>

建立统一的数据协议规范，定义标准的组件 Schema 结构，包含 props、events、slots 等接口描述。通过 JSON Schema 进行数据校验，确保组件间数据传递的类型安全。实现数据适配器模式，当组件接口不兼容时自动进行数据转换。请求收效方面，采用请求去重和缓存策略，相同请求在短时间内只发送一次，同时建立请求优先级队列，确保关键数据的及时响应。

</details>

## 3. 组件的拖拽行为如何实现？如何为组件动态注入行为（如拖拽、缩放）？ {#question-subjective-7fdf24ca2fb8}

### 题目要点

事件序列处理、状态管理、装饰器模式、行为解耦

<details>
<summary>参考答案</summary>

拖拽实现基于原生 Drag API 或鼠标事件，通过监听 mousedown、mousemove、mouseup 事件序列。建立拖拽状态管理，记录拖拽起始位置、当前位置和目标位置。动态行为注入采用装饰器模式或高阶组件，将行为逻辑与组件本身解耦。通过 mixin 或 composition API 的方式，在运行时为组件添加拖拽、缩放等交互能力。

</details>

## 4. 如何解决拖拽过程中频繁触发事件导致的性能问题？ {#question-subjective-4da1a84bbb8d}

### 题目要点

节流防抖、requestAnimationFrame、事件委托、计算优化

<details>
<summary>参考答案</summary>

使用节流（throttle）限制事件触发频率，通常设置为 16ms 以保持 60fps 的流畅度。采用 requestAnimationFrame 优化动画渲染，确保在浏览器重绘时机执行位置更新。实现事件委托减少事件监听器数量，在容器元素上统一处理拖拽事件。对于复杂计算，使用防抖（debounce）延迟执行，避免在拖拽过程中进行不必要的重计算。

</details>

## 5. 性能优化关注的指标有哪些（如FCP、TTI）？你用了哪些具体手段？ {#question-26e22fa9-becc-4552-b79a-da2f67451455}

> 题库原题：[前端性能优化指标有哪些？怎么进行性能检测？](https://fe.ecool.fun/topic/26e22fa9-becc-4552-b79a-da2f67451455)

### 题目要点

前端性能评估主要围绕三个维度展开：
* 页面加载速度、交互响应能力以及页面稳定性。常见指标包括 FP、FCP、LCP 等加载指标，FID 和 INP 等交互指标，以及 CLS 布局稳定性指标。
* 性能检测通常分为两类方式：开发阶段使用 Lighthouse、Chrome DevTools、WebPageTest 等工具进行实验室分析；
* 线上环境通过 Performance API 或 web-vitals 采集真实用户性能数据，并结合监控平台进行统计与优化。

<details>
<summary>参考答案</summary>

前端性能通常不会只看单一指标，而是从**用户感知加载速度、交互响应速度以及页面稳定性**三个维度进行评估。当前行业中比较主流的一套指标体系来自 Google 提出的 **Web Vitals**，并结合传统的加载性能指标共同评估。

首先从**页面加载阶段的性能指标**来看。

用户访问页面时，最直观的感受是“页面什么时候开始出现内容、什么时候可以操作”。在这个阶段常见的指标包括：

* **FP（First Paint）**：浏览器首次开始绘制像素的时间点，说明页面已经开始渲染。
* **FCP（First Contentful Paint）**：首次渲染出真实内容（文本、图片、SVG 等）的时间，这个指标更接近用户感知。
* **LCP（Largest Contentful Paint）**：页面中最大可见内容元素的渲染时间，例如首屏大图或标题，通常被视为**首屏加载体验的核心指标**。

在真实项目中，如果 LCP 超过 2.5s，一般就需要考虑优化首屏资源加载，例如代码分割、图片压缩、CDN、预加载等。

第二类指标关注的是**页面交互响应能力**。

即页面是否能快速响应用户操作，而不会出现明显卡顿。比较典型的指标是：

* **FID（First Input Delay）**：用户第一次交互（点击、输入）到浏览器开始处理事件的延迟时间。
* **INP（Interaction to Next Paint）**：Google 新提出的指标，用来衡量整个页面生命周期中的交互响应能力，比 FID 更全面。

这些指标通常和 **主线程阻塞**相关，例如：

* JS 执行时间过长
* 大量同步任务
* 大 JSON 解析
* 重计算布局或重绘

因此工程中常见优化方式包括 Web Worker、虚拟列表、任务切片（`requestIdleCallback` / `requestAnimationFrame`）等。

第三类指标是**页面稳定性指标**。

页面加载过程中如果元素频繁跳动，会严重影响用户体验。衡量这个问题的核心指标是：

* **CLS（Cumulative Layout Shift）**

它用于统计页面布局偏移的累计值。常见导致 CLS 的原因包括：

* 图片未设置宽高
* 异步加载广告
* 动态插入 DOM
* 字体加载引起布局变化

在工程实践中，一般通过为图片、视频等元素提前声明尺寸，或者使用 skeleton 占位，来降低 CLS。

---

在明确指标之后，还需要通过工具进行**性能检测与数据采集**。常见方法可以分为实验室环境检测和真实用户监控两类。

**实验室检测（Lab Data）**

主要用于开发阶段或性能调优阶段：

* **Chrome DevTools – Performance 面板**
  可以查看 JS 执行、渲染流程、长任务、布局和重绘情况。

* **Lighthouse**
  Google 官方的性能检测工具，可以生成性能报告，包括 FCP、LCP、CLS 等指标，并给出优化建议。

* **WebPageTest**
  可以模拟不同网络环境、设备和地区，分析瀑布图、资源加载顺序等。

这些工具适合在开发阶段进行分析，但并不能完全代表真实用户体验。

---

**真实用户监控（RUM, Real User Monitoring）**

线上环境通常需要接入监控系统，采集真实用户的性能数据，例如：

* 使用 **Performance API** 获取指标
  如 `performance.getEntriesByType('paint')` 获取 FP / FCP。

* 使用 **web-vitals 库**
  可以直接采集 LCP、CLS、INP 等核心指标并上报。

* 接入监控平台
  如 Sentry、阿里 ARMS、Datadog 等，通过埋点上报性能数据。

真实项目中通常会通过 **SDK 自动采集性能指标 + 上报日志平台**，然后根据地区、设备、网络环境做统计分析，找出性能瓶颈。

</details>

## 6. 虚拟滚动解决大量DOM渲染时，如何避免快速滚动时的空白闪烁？ {#question-subjective-ae85ef44b207}

### 题目要点

缓冲区机制、双缓冲策略、事件优化、智能预加载

<details>
<summary>参考答案</summary>

实现缓冲区机制，在可视区域上下预渲染额外的元素，通常设置为可视区域的 1-2 倍。采用双缓冲策略，维护两个渲染队列交替使用，确保在快速滚动时始终有内容可显示。优化滚动事件处理，使用 passive 监听器和 requestAnimationFrame 确保滚动的流畅性。同时实现智能预加载，根据滚动方向和速度动态调整缓冲区大小。

</details>

## 7. 如何实现关键资源优先返回，非关键资源延迟加载？ {#question-subjective-47226a9dba2c}

### 题目要点

Resource Hints、代码分割、优先级队列、懒加载策略

<details>
<summary>参考答案</summary>

通过 Resource Hints（preload、prefetch、preconnect）控制资源加载优先级，关键资源使用 preload 提前加载。实现路由级别的代码分割，非当前页面的代码通过动态 import 延迟加载。建立资源优先级队列，根据用户行为和页面重要性动态调整加载顺序。同时使用 Intersection Observer API 实现图片和组件的懒加载，只在进入视口时才开始加载。

</details>

## 8. 延迟加载的组件遇到依赖缺失时，如何设计降级方案？ {#question-subjective-867cf72c1376}

### 题目要点

多层降级、错误边界、依赖检测、重试机制

<details>
<summary>参考答案</summary>

建立多层降级机制：首先尝试从 CDN 加载备用资源，如果失败则使用本地缓存版本，最终降级到基础功能组件。实现错误边界（Error Boundary）捕获组件加载失败，显示友好的错误提示或替代内容。建立依赖检测机制，在组件加载前验证必要依赖的可用性。同时提供手动重试功能，允许用户在网络恢复后重新加载失败的组件。

</details>

## 9. 浏览器存储机制讲一下 {#question-ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87}

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

## 10. Cache-Control: max-age=0 和 no-cache 行为有何区别？ {#question-subjective-9f7e6b017fdc}

### 题目要点

缓存验证策略、使用时机差异、服务器交互行为

<details>
<summary>参考答案</summary>

max-age=0 表示资源立即过期，但浏览器仍可能使用缓存，只是会向服务器验证资源是否更新。no-cache 要求每次使用前都必须向服务器验证，不能直接使用缓存。实际行为上，max-age=0 在某些情况下可能直接使用缓存，而 no-cache 更严格地要求验证。两者都允许缓存存储，区别在于使用缓存前的验证策略。

</details>

## 11. HTTPS的TLS握手过程，证书如何验证身份？ {#question-subjective-4255c97f03b9}

### 题目要点

四阶段握手、证书链验证、数字签名、根证书信任

<details>
<summary>参考答案</summary>

TLS握手包含四个阶段：客户端发送支持的加密套件，服务器选择加密方式并发送证书，客户端验证证书并生成预主密钥，双方确认加密参数。证书验证通过证书链进行，从服务器证书开始，逐级验证到根证书颁发机构。验证内容包括证书有效期、域名匹配、数字签名和证书撤销状态。浏览器内置根证书库，确保证书链的可信性。

</details>

## 12. Webpack如何将模块打包成bundle？ {#question-subjective-fe583c71e676}

### 题目要点

依赖图构建、Loader转换、AST分析、模块包装

<details>
<summary>参考答案</summary>

Webpack 从入口文件开始，递归分析模块依赖关系，构建依赖图。通过不同的 Loader 处理各种文件类型，将非 JavaScript 资源转换为模块。使用 AST 分析代码，提取 import/require 语句建立模块映射。最终将所有模块包装成函数，通过模块 ID 和依赖关系生成可执行的 bundle 文件。支持代码分割和懒加载，可以生成多个 chunk 文件。

</details>

## 13. 在Webpack之前如何解决模块化、代码压缩？ {#question-subjective-a0c33bac4056}

### 题目要点

AMD/CommonJS规范、独立压缩工具、构建工具串联、配置复杂性

<details>
<summary>参考答案</summary>

早期使用 AMD（RequireJS）或 CommonJS 规范实现模块化，通过 define 和 require 函数管理依赖。代码压缩主要依赖 UglifyJS、Closure Compiler 等工具，通过 Grunt 或 Gulp 构建工具串联各个处理步骤。文件合并通过简单的文件拼接或使用 r.js 等工具。这种方式配置复杂，缺乏统一的解决方案，Webpack 的出现统一了这些工具链。

</details>

## 14. Webpack中Loader和Plugin的功能及区别是什么？ {#question-subjective-9f992fe8259a}

### 题目要点

功能定位差异、工作阶段不同、处理对象区别、扩展能力

<details>
<summary>参考答案</summary>

Loader 负责转换文件，将非 JavaScript 资源转换为 Webpack 能够处理的模块，工作在模块加载阶段，是一个转换函数。Plugin 扩展 Webpack 功能，可以在构建过程的各个阶段执行自定义逻辑，通过钩子系统介入构建流程。Loader 专注于文件转换，Plugin 专注于功能扩展。一个文件可以被多个 Loader 处理，Plugin 则在整个构建生命周期中发挥作用。

</details>

## 15. js事件机制讲一下 {#question-305a1520-b7df-4c05-a72b-a18c165250de}

> 题库原题：[什么是事件代理，以及它的应用场景有哪些？](https://fe.ecool.fun/topic/305a1520-b7df-4c05-a72b-a18c165250de)

### 题目要点

### 事件代理（事件委托）

- **定义**：事件代理是一种事件处理技术，它允许将事件监听器绑定到父元素上，从而监听子元素的事件。
- **原理**：事件代理利用事件冒泡的机制，当子元素发生事件时，事件会传递给父元素，从而触发绑定在父元素上的事件监听器。
- **优点**：
  - **减少内存消耗**：只需要为父元素绑定事件监听器，而不需要为每个子元素都绑定，从而减少内存消耗。
  - **动态绑定**：当子元素动态增减时，不需要为新增的子元素重新绑定事件，也不需要为删除的子元素解绑事件。

### 应用场景

- **列表点击事件**：对于包含大量列表项的列表，使用事件代理可以减少内存消耗。
- **动态元素事件绑定**：当页面元素可以通过用户交互动态增减时，使用事件代理可以减少重复绑定和解绑事件的工作。

### 事件代理的局限性

- **非冒泡事件**：对于 `focus`、`blur` 这类没有事件冒泡机制的事件，无法使用事件代理。
- **定位性能问题**：对于 `mousemove`、`mouseout` 这类事件，虽然有事件冒泡，但频繁的计算定位会消耗大量性能，因此不适合使用事件代理。
- **事件误判**：如果所有事件都使用事件代理，可能会出现事件误判，即本不该被触发的事件被绑定上了事件监听器。

<details>
<summary>参考答案</summary>

## 一、是什么

事件代理，俗地来讲，就是把一个元素响应事件（`click`、`keydown`......）的函数委托到另一个元素

前面讲到，事件流的都会经过三个阶段： 捕获阶段 -> 目标阶段 -> 冒泡阶段，而事件委托就是在冒泡阶段完成

事件委托，会把一个或者一组元素的事件委托到它的父层或者更外层元素上，真正绑定事件的是外层元素，而不是目标元素

当事件响应到目标元素上时，会通过事件冒泡机制从而触发它的外层元素的绑定事件上，然后在外层元素上去执行函数

下面举个例子：

比如一个宿舍的同学同时快递到了，一种笨方法就是他们一个个去领取

较优方法就是把这件事情委托给宿舍长，让一个人出去拿好所有快递，然后再根据收件人一一分发给每个同学

在这里，取快递就是一个事件，每个同学指的是需要响应事件的 `DOM `元素，而出去统一领取快递的宿舍长就是代理的元素

所以真正绑定事件的是这个元素，按照收件人分发快递的过程就是在事件执行中，需要判断当前响应的事件应该匹配到被代理元素中的哪一个或者哪几个

## 二、应用场景

如果我们有一个列表，列表之中有大量的列表项，我们需要在点击列表项的时候响应一个事件

```js
<ul id="list">
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
  ......
  <li>item n</li>
</ul>
```

如果给每个列表项一一都绑定一个函数，那对于内存消耗是非常大的

```js
// 获取目标元素
const lis = document.getElementsByTagName("li")
// 循环遍历绑定事件
for (let i = 0; i < lis.length; i++) {
    lis[i].onclick = function(e){
        console.log(e.target.innerHTML)
    }
}
```

这时候就可以事件委托，把点击事件绑定在父级元素`ul`上面，然后执行事件的时候再去匹配目标元素

```js
// 给父层元素绑定事件
document.getElementById('list').addEventListener('click', function (e) {
    // 兼容性处理
    var event = e || window.event;
    var target = event.target || event.srcElement;
    // 判断是否匹配目标元素
    if (target.nodeName.toLocaleLowerCase === 'li') {
        console.log('the content is: ', target.innerHTML);
    }
});
```

还有一种场景是上述列表项并不多，我们给每个列表项都绑定了事件

但是如果用户能够随时动态的增加或者去除列表项元素，那么在每一次改变的时候都需要重新给新增的元素绑定事件，给即将删去的元素解绑事件

如果用了事件委托就没有这种麻烦了，因为事件是绑定在父层的，和目标元素的增减是没有关系的，执行到目标元素是在真正响应执行事件函数的过程中去匹配的

举个例子：

下面`html`结构中，点击`input`可以动态添加元素

```html
<input type="button" name="" id="btn" value="添加" />
<ul id="ul1">
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
    <li>item 4</li>
</ul>
```

使用事件委托

```js
const oBtn = document.getElementById("btn");
const oUl = document.getElementById("ul1");
const num = 4;

//事件委托，添加的子元素也有事件
oUl.onclick = function (ev) {
    ev = ev || window.event;
    const target = ev.target || ev.srcElement;
    if (target.nodeName.toLowerCase() == 'li') {
        console.log('the content is: ', target.innerHTML);
    }

};

//添加新节点
oBtn.onclick = function () {
    num++;
    const oLi = document.createElement('li');
    oLi.innerHTML = `item ${num}`;
    oUl.appendChild(oLi);
};
```

可以看到，使用事件委托，在动态绑定事件的情况下是可以减少很多重复工作的

## 三、总结

适合事件委托的事件有：`click`，`mousedown`，`mouseup`，`keydown`，`keyup`，`keypress`

从上面应用场景中，我们就可以看到使用事件委托存在两大优点：

- 减少整个页面所需的内存，提升整体性能
- 动态绑定，减少重复工作

但是使用事件委托也是存在局限性：

- `focus`、`blur `这些事件没有事件冒泡机制，所以无法进行委托绑定事件

- `mousemove`、`mouseout `这样的事件，虽然有事件冒泡，但是只能不断通过位置去计算定位，对性能消耗高，因此也是不适合于事件委托的

如果把所有事件都用事件代理，可能会出现事件误判，即本不该被触发的事件被绑定上了事件

</details>

## 16. 如何实现三个请求严格按顺序返回（A→B→C） {#question-subjective-a9de95c9041a}

### 题目要点

async/await顺序、Promise链式、并发控制、请求队列

<details>
<summary>参考答案</summary>

使用 async/await 确保请求的顺序执行，每个请求等待前一个完成后再发起。也可以使用 Promise 链式调用，通过 then 方法串联请求。如果需要并发请求但按顺序处理结果，可以使用 Promise.all 发起所有请求，然后按索引顺序处理返回结果。对于更复杂的场景，可以实现请求队列，确保请求按指定顺序执行和返回。

```javascript
// 顺序执行
async function sequentialRequests() {
  const resultA = await requestA()
  const resultB = await requestB(resultA)
  const resultC = await requestC(resultB)
  return [resultA, resultB, resultC]
}
```

</details>

## 17. 哪些CSS属性会触发重排？哪些仅触发重绘？ {#question-417ebda0-3f2d-48d3-95ec-ae1838bf39cb}

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

## 18. 为何 transform 和 opacity 不影响重排 {#question-subjective-d01fec627187}

### 题目要点

合成层创建、GPU处理、跳过布局阶段、硬件加速

<details>
<summary>参考答案</summary>

transform 和 opacity 属性会创建新的合成层（Composite Layer），在 GPU 上进行处理，不影响文档流中其他元素的布局计算。这些属性的变化只在合成阶段处理，跳过了布局和绘制阶段，因此性能更好。浏览器会将这些元素提升到独立的图层，通过硬件加速进行渲染，避免了对主线程布局计算的影响。

</details>

## 19. Vue3解决了Vue2哪些核心问题 {#question-subjective-150098e01ecf}

### 题目要点

响应式升级、逻辑组织改进、性能优化、TypeScript支持

<details>
<summary>参考答案</summary>

Vue3 解决了响应式系统的局限性，Proxy 替代 Object.defineProperty 支持动态属性和数组监听。Composition API 解决了 Options API 的逻辑分散问题，提供更好的代码组织和复用能力。性能方面通过 Tree-shaking、更小的包体积和编译时优化显著提升。TypeScript 支持更加完善，提供更好的类型推导和开发体验。

</details>

## 20. Vue2和Vue3的响应式原理有什么异同 {#question-d3cd6795-d550-4e53-b97e-52d79c93f8f0}

> 题库原题：[Vue3和Vue2的响应式原理有什么差别？](https://fe.ecool.fun/topic/d3cd6795-d550-4e53-b97e-52d79c93f8f0)

### 题目要点

Vue2 基于 `Object.defineProperty`，以属性为中心进行依赖收集，无法天然支持新增属性和复杂结构；Vue3 基于 `Proxy`，以访问行为为中心动态追踪依赖；Vue3 将 watcher 统一为 effect，提升了可组合性和扩展性；两者的核心目标一致，但在能力边界、性能模型和工程取舍上存在明显差异。

<details>
<summary>参考答案</summary>

从设计目标上看，Vue2 和 Vue3 的响应式系统都试图解决同一个问题：**在不显式声明依赖的情况下，建立数据与视图之间的自动更新关系**。区别不在于“是否响应式”，而在于**依赖的收集方式、更新触发的时机以及系统的可扩展性**。

在 Vue2 中，响应式的核心建立在 `Object.defineProperty` 之上。每一个被观测的对象属性，都会被单独劫持其 `getter` 和 `setter`。当组件渲染时，`getter` 会触发依赖收集，将当前的渲染 watcher 记录到该属性的依赖列表中；当属性被修改时，`setter` 触发依赖通知，相关 watcher 重新执行。这个模型是“以属性为中心”的：每个属性维护自己的依赖集合。它的优势是实现直观、行为稳定，但代价也很明显——必须在初始化阶段递归遍历对象，无法感知属性的新增和删除，对数组的支持需要通过方法重写来间接实现。

Vue3 则彻底重构了这一套机制，响应式的基础从“属性劫持”转向了“对象代理”。通过 `Proxy` 拦截对象的读写、枚举和结构性操作，Vue3 可以在运行时动态感知属性的访问和变化，而不需要在初始化阶段预先处理所有字段。依赖收集不再绑定在某个具体的 `getter` 上，而是通过一个全局的依赖追踪机制，将“当前正在执行的副作用函数”与“被访问的目标对象 + key”建立映射关系。这种设计让响应式系统从“属性驱动”升级为“访问驱动”，在能力上覆盖了新增、删除属性、Map / Set 等复杂数据结构。

在更新模型上，两者也存在本质差异。Vue2 的 watcher 是以组件为主的，计算属性、侦听器和渲染 watcher 在语义上是不同类型，但底层机制相对分散。Vue3 将这些概念统一为 effect，通过调度器控制执行时机，使响应式系统更具可组合性。这种统一模型也是 Composition API 得以成立的前提。

从性能和可维护性角度看，Vue2 的响应式成本主要体现在初始化阶段和深层对象遍历上，而 Vue3 将成本更多地推迟到“真正发生访问和修改时”。同时，Proxy 的存在让代码路径更加集中，减少了针对数组和特殊场景的补丁式实现。但相应地，Vue3 放弃了对 IE 等不支持 Proxy 环境的兼容，这也是一次明确的技术取舍。

总结来看，Vue2 的响应式是“静态劫持 + 属性级依赖”，而 Vue3 的响应式是“动态代理 + 访问级依赖”。前者在早期浏览器环境下是工程最优解，后者则为复杂状态管理和更强的表达能力打开了空间。

</details>

## 21. Vue2中数组的 push 方法为何能被拦截？ {#question-subjective-101801e82d12}

### 题目要点

原型方法重写、继承关系、功能保留、响应式通知

<details>
<summary>参考答案</summary>

Vue2 通过重写数组原型上的变更方法（push、pop、shift、unshift、splice、sort、reverse）实现拦截。创建一个继承自 Array.prototype 的新对象，在这个对象上重新定义这些方法，既保留原有功能又添加了响应式通知。当数组调用这些方法时，实际调用的是重写后的版本，从而触发视图更新。

</details>

## 22. Proxy 如何实现深层嵌套对象的按需响应式？ {#question-subjective-20b59df453c0}

### 题目要点

递归代理、懒代理策略、动态创建、缓存优化

<details>
<summary>参考答案</summary>

Proxy 通过递归代理实现深层响应式，但采用懒代理策略，只在访问到嵌套对象时才创建新的 Proxy。在 get 拦截器中判断返回值是否为对象，如果是则动态创建 Proxy 代理。这种按需代理避免了初始化时的性能开销，同时通过 WeakMap 缓存已创建的代理对象，避免重复创建。
```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const result = target[key]
      return typeof result === 'object' ? reactive(result) : result
    }
  })
}
```

</details>

## 23. 设计一个类百度搜索的Select组件 {#question-subjective-17f079b29dca}

### 题目要点

搜索过滤、键盘交互、虚拟滚动、异步加载、自定义扩展

<details>
<summary>参考答案</summary>

组件需要支持搜索过滤、键盘导航、异步数据加载和虚拟滚动。核心功能包括：输入框支持搜索和高亮匹配文本，下拉列表支持键盘上下选择和回车确认，支持单选和多选模式。性能优化方面实现防抖搜索、虚拟滚动处理大量数据、懒加载和缓存机制。同时提供丰富的自定义选项，如自定义渲染模板、搜索策略和数据源适配。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-79/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-79/round-128/index.md" >}}) →
