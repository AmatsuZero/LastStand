+++
title = "小红书-社招-3年 · 第 2 轮 · 技术面试"
draft = false
weight = 2
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/94"
experienceId = 94
roundId = 157
roundOrder = 2
company = "小红书"
date = "2026-02-01T14:42:08.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-156/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-94/_index.md" >}}) · [第 3 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-158/index.md" >}}) →

**本轮概述：** 这一轮主要考察了小程序的性能优化、核心监控指标、首屏时间的计算、业务价值验证、高频事件处理等方面的知识。

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 小程序性能优化做了哪些事情？ {#question-92e09b66-a9fc-435d-ad28-99011b2ddeaa}

> 题库原题：[小程序可以做哪些性能优化？](https://fe.ecool.fun/topic/92e09b66-a9fc-435d-ad28-99011b2ddeaa)

### 题目要点

小程序性能优化围绕逻辑层与视图层分离架构展开，重点是减少 setData 频率与数据体积，控制列表节点数量，优化首包体积与启动链路，并通过分包加载、WXS 与懒加载等手段降低渲染压力。核心原则是减少跨线程通信与避免无意义重渲染，从架构层面解决性能瓶颈。

<details>
<summary>参考答案</summary>

小程序的性能优化，不能只从“前端渲染”角度看。它的运行模型和 Web 不同，存在 **逻辑层（JSCore）与视图层（WebView）分离** 的架构特征，核心瓶颈往往出在：

* 跨线程通信成本
* setData 传输体积
* 渲染节点数量
* 包体与启动链路

优化必须围绕这些机制展开。

---

## 一、理解运行架构是前提

以 微信小程序 为例：

* 逻辑层：JS 执行环境
* 视图层：WebView 渲染
* 两层通过 JSON 序列化通信

每一次 `setData`：

1. 数据序列化
2. 线程间传输
3. 视图层 diff
4. 真实节点更新

所以小程序性能优化的第一原则是：

> 减少跨线程通信的数据量与次数。

---

## 二、控制 setData 的粒度与频率

### 1. 避免大对象全量更新

错误方式：

```js
this.setData({
  form: newFormObject
})
```

如果 form 很大，每次都会整体传输。

正确方式：

```js
this.setData({
  "form.username": value
})
```

使用路径更新，最小化数据传输。

---

### 2. 合并多次 setData

多次调用：

```js
this.setData({ a: 1 })
this.setData({ b: 2 })
```

会触发多次通信。

应合并为：

```js
this.setData({
  a: 1,
  b: 2
})
```

---

### 3. 避免高频 setData

例如滚动、拖拽、动画中频繁 setData，会造成卡顿。

解决方式：

* 使用节流 / 防抖
* 纯样式动画交给 CSS
* 使用 WXS 做视图层计算

---

## 三、列表渲染优化

列表是性能高发区。

### 1. 控制节点数量

一次性渲染几百个节点，必然卡顿。

解决方式：

* 分页加载
* 虚拟列表
* 懒加载

---

### 2. 正确使用 wx:key

如果 key 不稳定，会导致整列表重渲染。

必须使用唯一且稳定的 id，而不是 index。

---

### 3. 条件渲染用 hidden 替代频繁切换

`wx:if` 会销毁重建节点
`hidden` 只是控制显示

频繁切换时使用 hidden 性能更好。

---

## 四、包体与启动优化

小程序启动性能极其关键。

### 1. 分包加载

把非首屏页面放入分包，减小主包体积。

首包越小，冷启动越快。

---

### 2. 图片优化

* 使用压缩图片
* 使用 CDN
* 首屏图片懒加载

---

### 3. 代码体积控制

* 删除无用依赖
* 避免大型工具库
* Tree shaking

---

## 五、网络请求优化

小程序环境下网络延迟会显著影响体验。

优化方式：

* 请求合并
* 数据缓存
* 预加载关键接口
* 减少无意义轮询

---

## 六、渲染层优化技巧

### 1. 使用 WXS

WXS 在视图层执行，避免频繁 JS → View 通信。

适合：

* 简单计算
* 格式转换
* 列表中轻量逻辑

---

### 2. 使用 pureDataPattern

可以声明不参与视图层更新的数据字段，减少 setData 传输。

---

### 3. 减少复杂组件嵌套

组件层级过深，会增加渲染成本。

---

## 七、长列表与复杂页面的工程实践

如果是电商或内容类页面：

* 使用分块渲染（首屏优先）
* Skeleton 占位
* 滚动区域分段加载
* 图片懒加载

核心目标是：

> 让用户“尽快看到内容”，而不是等全部渲染完成。

---

## 八、本质理解

小程序优化的核心矛盾是：

逻辑层与视图层分离带来的通信成本。

因此优化方向始终围绕：

* 减少 setData 次数
* 减少传输数据量
* 控制节点数量
* 降低首屏体积

</details>

## 2. 核心监控指标有哪些？如何采集？ {#question-ef44e03d-4f04-4aed-8bbe-fb6c7435dffd}

> 题库原题：[衡量页面性能的指标有哪些？](https://fe.ecool.fun/topic/ef44e03d-4f04-4aed-8bbe-fb6c7435dffd)

### 题目要点

- **加载时间指标**：评估页面加载速度和初次内容呈现。
- **用户体验指标**：衡量用户交互的流畅性和页面稳定性。
- **网络性能指标**：页面资源的总大小和请求数量。
- **JavaScript 性能指标**：脚本执行和处理时间。
- **工具**：使用工具（如 Web Vitals、Lighthouse、PageSpeed Insights）来测量和优化性能。

<details>
<summary>参考答案</summary>

衡量页面性能的指标有助于评估网页的加载速度、响应能力和用户体验。

以下是一些常见的性能指标：

### **1. 加载时间指标**

- **Page Load Time**：页面从开始加载到完全加载所需的时间。包括所有资源（HTML、CSS、JavaScript、图片等）的下载时间。
- **Time to First Byte (TTFB)**：从发出请求到接收到第一个字节的时间。衡量服务器响应速度。
- **First Contentful Paint (FCP)**：页面上首次呈现内容（文本、图片等）的时间。
- **Largest Contentful Paint (LCP)**：页面上最大内容元素（如大图像或大文本块）的渲染时间。
- **DOM Content Loaded (DCL)**：HTML 文档被完全加载和解析完成（不包括样式表、图像等）的时间。
- **Fully Loaded Time**：页面所有资源（包括图像、样式表、脚本等）加载完成的时间。

### **2. 用户体验指标**

- **First Interactive**：页面开始响应用户交互（点击、滚动等）的时间。
- **First Meaningful Paint (FMP)**：页面上主要内容首次呈现的时间。比 FCP 更能反映页面实际内容的显示情况。
- **Time to Interactive (TTI)**：页面变得完全可交互（用户可以开始与页面交互，所有脚本已加载并执行）的时间。
- **Cumulative Layout Shift (CLS)**：页面内容在加载过程中发生的意外布局偏移量。衡量页面视觉稳定性。

### **3. 网络性能指标**

- **Total Page Size**：页面的总大小，包括所有资源（HTML、CSS、JavaScript、图片等）的大小。
- **Number of Requests**：页面加载过程中发出的请求总数。请求数量多可能会影响加载性能。
- **Resource Load Time**：各个资源（如 CSS、JavaScript 文件、图片）的加载时间。

### **4. JavaScript 性能指标**

- **JavaScript Execution Time**：页面中 JavaScript 代码的执行时间。长时间运行的脚本可能会阻塞页面渲染。
- **Script Parse and Compile Time**：解析和编译 JavaScript 脚本所需的时间。

### **5. 性能工具和指标**

- **Web Vitals**：Google 提供的一组关键 Web 性能指标，包括 LCP、FCP、CLS 等。
- **Lighthouse**：Google 提供的开源自动化工具，分析网页性能、可访问性和 SEO 等方面。
- **PageSpeed Insights**：Google 的工具，提供页面性能评分和优化建议。
- **Chrome DevTools**：浏览器开发者工具，用于实时分析和调试网页性能问题。

</details>

## 3. 首屏时间是如何计算的？ {#question-subjective-2e397d47ea86}

### 题目要点

首屏时间, Performance API, DOMContentLoaded, load事件, Lighthouse

<details>
<summary>参考答案</summary>

首屏时间是指用户打开页面后，首次看到主要内容的时间。可以通过Performance API来获取关键的时间点，如DOMContentLoaded、load事件等。通过这些时间点的差值，可以计算出首屏时间。此外，还可以使用Lighthouse等工具来自动化测试和优化首屏时间。

</details>

## 4. 优化后如何验证业务价值？ {#question-subjective-4d086bd4d911}

### 题目要点

业务价值, A/B测试, 用户反馈, 数据分析, 优化效果

<details>
<summary>参考答案</summary>

优化后的业务价值可以通过A/B测试、用户反馈、数据分析等方式来验证。A/B测试可以对比不同版本的表现，用户反馈可以了解用户的实际体验，数据分析可以评估各项指标的变化。通过这些方法，可以全面评估优化的效果，并指导后续的优化方向。

</details>

## 5. 高频事件是怎么处理的？ {#question-subjective-bc2cf07c5d6b}

### 题目要点

高频事件, 节流, 防抖, 异步处理, 批量处理

<details>
<summary>参考答案</summary>

处理高频事件时，可以通过节流（throttle）和防抖（debounce）等技术来减少事件处理的频率。节流可以在一定时间内只执行一次事件处理，防抖则是在连续触发事件后，只执行最后一次。此外，还可以通过异步处理、批量处理等方式来优化高频事件的处理。

</details>

## 6. 小程序的日志和监控怎么做的 {#question-subjective-3e1b70f90d27}

### 题目要点

小程序监控聚焦性能、错误与接口质量；通过生命周期封装、全局错误捕获与请求拦截实现采集；重点关注 setData 成本与弱网场景的数据可靠性；工程目标是在包体积受限条件下构建轻量级监控体系。

<details>
<summary>参考答案</summary>

小程序的日志与监控，本质是在受限容器环境中构建一套轻量级可观测体系，核心围绕**性能、稳定性、接口质量和业务行为**四个维度。

性能层面重点关注页面加载耗时、页面切换耗时以及 `setData` 的调用频率和数据体积，因为小程序性能瓶颈往往集中在数据传输与渲染层。稳定性方面依赖全局错误捕获能力，例如在 微信小程序 中通过 `App.onError`、`onUnhandledRejection` 等统一上报异常。接口监控通常通过封装 `wx.request` 统计耗时与成功率。业务日志则通过生命周期与点击事件埋点实现关键路径追踪。

工程实现上一般通过高阶封装 Page/App 注入日志逻辑，拦截请求与 setData，结合本地缓存与批量上报机制，控制包体积与上报频率，避免监控反向影响性能。

</details>

## 7. 为什么要自己去做一个请求库 {#question-76bd6235-2d8d-4519-b14a-98bbde4eb3a1}

> 题库原题：[项目中是否有必要自己封装请求库？](https://fe.ecool.fun/topic/76bd6235-2d8d-4519-b14a-98bbde4eb3a1)

### 题目要点

自建请求库的核心目的是统一协议规范、集中处理异常与鉴权、封装重试与缓存等增强能力、接入监控体系以及屏蔽多端差异；它是工程治理与基础设施建设行为，而非简单的功能封装。

<details>
<summary>参考答案</summary>

是否需要自建请求库，本质上不是技术炫技，而是工程治理问题。

在业务规模较小阶段，直接使用原生 `fetch` 或 `XMLHttpRequest` 已经足够；但在中大型项目中，请求逐渐成为系统的基础设施。如果每个业务模块各自处理鉴权、错误提示、重试逻辑和埋点，上层代码会迅速失控。

自建请求库的核心价值在于**统一规范与横切能力收敛**。

第一是统一协议层。包括基础 URL、鉴权 token 注入、公共 headers、参数序列化规则，以及接口返回格式的统一解构。没有统一抽象，接口风格一旦变化会导致大面积修改。

第二是统一异常处理。比如 401 刷新 token、403 权限跳转、接口错误码映射、全局错误提示等，这些逻辑属于横切关注点，分散在业务中会导致重复代码与维护成本上升。

第三是增强能力封装。包括请求取消、超时控制、重试策略、并发控制、节流合并、缓存策略、弱网兜底等。这些能力如果不抽象，很难在系统层面治理接口质量。

第四是可观测性建设。请求库可以统一接入监控系统，例如接入 Sentry 或其他 APM 平台，实现接口耗时、错误率、慢接口统计。若不集中封装，很难形成完整链路追踪。

第五是环境适配。Web、SSR、小程序等环境对请求实现不同，例如浏览器使用 fetch，小程序使用平台 API，通过统一抽象可以屏蔽底层差异。

当然，自建请求库不等于重复造轮子。通常是在成熟库（如 axios 或原生 fetch）之上做二次封装，而不是完全重写网络层。

从架构角度看，请求库属于“基础设施层”，它的作用是将横切逻辑从业务代码中剥离，提高一致性与可维护性，而不是单纯为了替代现有 API。

</details>

## 8. 在实现请求库时，如何处理请求的配置管理和错误处理机制？ {#question-subjective-9dfdda653845}

### 题目要点

请求库, 配置管理, 错误处理, 参数, 默认配置, 覆盖配置, 错误处理函数, 错误码映射, 重试机制

<details>
<summary>参考答案</summary>

在实现请求库时，可以通过配置对象来管理请求的参数，例如URL、请求头、超时时间等。配置管理可以使用默认配置和覆盖配置相结合的方式，以满足不同场景的需求。错误处理机制则可以包括统一的错误处理函数、错误码映射、重试机制等，确保请求的健壮性和可靠性。

</details>

## 9. Sketch 插件是怎么实现的？ {#question-subjective-f704974c935c}

### 题目要点

Sketch, 插件, API, JavaScript, 自动生成, 导出资源, 辅助设计, 兼容性, 性能优化, 用户体验

<details>
<summary>参考答案</summary>

Sketch插件的实现通常基于Sketch的API，开发者可以使用JavaScript来编写插件。插件可以实现各种功能，如自动生成设计稿、导出资源、辅助设计等。实现过程中需要注意API的兼容性、性能优化以及用户体验。

</details>

## 10. Sketch 插件发布后，兼容性都做了哪些工作？ {#question-subjective-da8572251d44}

### 题目要点

Sketch, 插件, 兼容性, 测试, API变更, 文档, 示例, 用户反馈, 社区, 论坛

<details>
<summary>参考答案</summary>

Sketch插件发布后，为了确保兼容性，可以进行以下工作：测试不同版本的Sketch、处理API变更、提供详细的文档和示例、收集用户反馈并及时修复问题。此外，还可以通过社区和论坛来获取更多用户的反馈，不断改进插件的功能和稳定性。

</details>

## 11. 算法题：构建组织架构树 {#question-b9ca2e1f-d720-4b6a-ab77-acc5edd03c99}

> 题库原题：[树转数组](https://fe.ecool.fun/topic/b9ca2e1f-d720-4b6a-ab77-acc5edd03c99)

将以下结构的数据转成数组。

```js
const listTree = [
  {
    id: 1,
    name: '部门1',
    pid: 0,
    children: [
      {
        id: 2,
        name: '部门1-1',
        pid: 1,
        children: [
          {
            id: 4,
            name: '部门1-1-1',
            pid: 2,
            children: []
          }
        ]
      },
      {
        id: 3,
        name: '部门1-2',
        pid: 1,
        children: [
          {
            id: 5,
            name: '部门1-2-1',
            pid: 3,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: '部门2',
    pid: 0,
    children: [
      {
        id: 7,
        name: '部门2-1',
        pid: 6,
        children: []
      }
    ]
  },
  {
    id: 8,
    name: '部门3',
    pid: 0,
    children: []
  }
]
```

期望结果：

```js
const list = [
  {id: 1, name: '部门1', pid: 0},
  {id: 2, name: '部门1-1', pid: 1},
  {id: 3, name: '部门1-2', pid: 1},
  {id: 4, name: '部门1-1-1', pid: 2},
  {id: 5, name: '部门1-2-1', pid: 3},
  {id: 6, name: '部门2', pid: 0},
  {id: 7, name: '部门2-1', pid: 6},
  {id: 8, name: '部门3', pid: 0},
]
```

### 题目要点

reduce取树行数据的所有子集

<details>
<summary>参考答案</summary>

## reduce取树行数据的所有子集
```js
function treeTransList(tree, key) {
  return tree.reduce(function(con, item) {
    var callee = arguments.callee;
    con.push(item);
    if (item[key] && item[key].length >0)
      item[key].reduce(callee, con);
    return con;
  }, []).map(function(item){
    item[key] = [];
    return item;
  })
}
treeTransList(listTree, 'children')
```
## 递归实现
```js
function getItem(tree, result) {
  for (let i = 0; i < tree.length; i++) {
    if(tree[i].children) {
      getItem(tree[i].children, result)
      delete tree[i].children;
    }
    result.push(tree[i])
  }
  return result;
}

function treeToList(tree) {
  const result = [];
  getItem(tree, result);
  return result;
}
treeToList(listTree)
```

## 广度优先遍历法
```js
function treeToList(tree, childName = 'children') {
  // 设置临时数组，用来存放队列
  let queen = [];
  // 设置输出数组，用来存放要输出的一维数组
  const result = [];
  queen = queen.concat(tree);
  // 对树对象进行广度优先的遍历
  while(queen.length) {
    const first = queen.shift();
    if (first[childName]) {
      queen = queen.concat(first[childName]);
      delete first[childName]
    }
    result.push(first);
  }
  return result;
}
treeToList(listTree, 'children')
```

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-156/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-94/_index.md" >}}) · [第 3 轮]({{< relref "/posts/frontend/interview-experiences/experience-94/round-158/index.md" >}}) →
