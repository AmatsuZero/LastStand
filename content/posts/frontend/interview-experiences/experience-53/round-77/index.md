+++
title = "字节-抖音短视频-社招-5年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/53"
experienceId = 53
roundId = 77
roundOrder = 1
company = "字节跳动"
date = "2025-07-27T10:01:22.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-53/round-76/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-53/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-53/round-78/index.md" >}}) →

**本轮要点：** CSRF攻击、https、浏览器的同源策略、浏览器的缓存机制、盒子模型、全方位解读this、call、apply和bind

本轮共 23 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍与项目介绍 {#question-subjective-ae0f4a4f8724}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 你在项目中如何优化首屏加载时间 {#question-subjective-ca6e8fa84ffb}

### 题目要点

* 清晰解释首屏加载构成和评估指标
* 梳理优化方向：资源优化、加载顺序、渲染提前
* 结合实际项目列举优化措施及效果
* 提醒常见误区，展示对细节的把控能力

<details>
<summary>参考答案</summary>

### 考察点

#### ● 首屏加载性能优化的全链路能力<br>
考察对加载过程、资源调度、渲染流程等多维度的理解与掌握。

#### ● 实际优化手段的选型和落地能力<br>
考察对首屏加载优化策略在项目中的实际应用和效果反馈。

---

### 参考答案

### 一、首屏加载时间的定义与构成

**首屏加载时间**指的是从用户发起访问请求到页面关键内容（尤其是首屏可视区域）可交互的时间。<br>
它包括以下几个阶段：

- DNS 解析、TCP/TLS 连接
- HTML 下载与解析
- CSS/JS 加载、阻塞与执行
- 首屏组件渲染、资源加载与图片显示
- 浏览器首次 Paint 与可交互（First Contentful Paint / TTI）

---

### 二、常见优化策略与实战举例

#### 1. **资源加载优化**

- **Gzip / Brotli 压缩**：减少资源体积<br>
- **使用 HTTP/2 / QUIC**：提升多资源并发加载能力<br>
- **开启 CDN 加速**：靠近用户，提高请求速度<br>
- **精简依赖包**：如 tree-shaking、移除未用依赖（如 moment → dayjs）

#### 2. **首屏关键资源优先加载**

- **Critical CSS 提取与内联**：减少 CSS 阻塞渲染<br>
  示例：使用 webpack 的 `critical-css` 插件提取首屏样式并内联到 HTML<br>
- **预加载首屏图片和组件**<br>
  ```html
  <link rel="preload" href="/assets/banner.jpg" as="image">
````

* **合理使用 `async` / `defer` 加载 JS**：避免阻塞 HTML 解析

#### 3. **首屏代码最小化（关键代码提取）**

* **路由懒加载**：非首屏模块按需加载

  ```js
  const About = React.lazy(() => import('./About'));
  ```
* **组件级拆分（如 webpack 的 SplitChunks）**：减少主包体积
* **SSR / SSG / 静态渲染**：预渲染首屏内容，降低白屏时间

#### 4. **骨架屏 + 占位图**

* 使用骨架屏组件在主内容加载前展示占位 UI

  ```html
  <div class="skeleton-loader">...</div>
  ```
* 提高用户感知速度，避免白屏

#### 5. **缓存策略**

* 使用强缓存（Cache-Control）与协商缓存（ETag）
* 使用 Service Worker 做离线缓存，提升重复访问性能

#### 6. **图片优化**

* 使用 WebP、AVIF 等新格式
* 小图 base64 内嵌、大图懒加载
* 多倍图压缩（如用 tinypng 等工具）控制首屏图体积 <200KB

---

### 三、项目实战效果举例（性能指标前后对比）

| 优化项          | 优化前   | 优化后   |
| ------------ | ----- | ----- |
| 首屏加载时间（TTFB） | 1.8s  | 0.9s  |
| JS包大小        | 1.2MB | 450KB |
| 首屏渲染（FCP）    | 3.5s  | 1.2s  |
| 可交互时间（TTI）   | 5.2s  | 1.9s  |

---

### 四、常见误区与陷阱

* **盲目使用懒加载**：过度懒加载会导致首屏核心内容延迟
* **未合理拆分 vendor 包**：导致主包过大
* **骨架屏布局不一致或闪烁**：影响用户体验

---

### 五、总结

* 首屏优化是系统性工程，涵盖网络传输、资源管理、组件拆分、渲染路径等多环节。
* 应结合业务场景按阶段优化，配合 Lighthouse/Chrome DevTools 实时评估效果。
* 目标是压缩关键资源、减少阻塞、加快首屏渲染并保障体验一致性。

</details>

## 3. 如何识别首屏关键资源 {#question-subjective-9bbab0275c1b}

### 题目要点

* 明确首屏关键资源的定义与分类
* 能列出识别方法：Performance、Lighthouse、Network、Coverage
* 能结合项目给出识别+优化的实际策略
* 有资源优先级调度、渲染阻塞等知识支撑

<details>
<summary>参考答案</summary>

### 考察点

#### ● 识别影响首屏渲染的关键资源<br>
考察候选人对渲染链路和性能瓶颈的理解。

#### ● 熟悉浏览器加载机制与资源优先级调度<br>
考察对 Chrome DevTools、Performance 面板等性能工具的使用能力。

---

### 参考答案

### 一、首屏关键资源的定义

> **首屏关键资源**是指那些**必须在首屏渲染前加载完成**，否则会**阻塞页面首屏展示**的资源。常见类型包括：

- **HTML 入口文件**：解析整个页面结构的根文档
- **CSS 样式表**：CSS 是阻塞渲染的，必须加载后才能绘制页面
- **首屏 JS 脚本**：用于首屏交互或组件逻辑初始化的 JS（例如 React/Vue 渲染逻辑）
- **首屏图片**：Banner、大图等占据首屏核心位置的可见资源
- **字体文件（可选）**：若首屏需展示特殊字体（注意 FOUT 问题）

---

### 二、识别关键资源的方法

#### 1. 使用 Chrome DevTools → Performance 面板

1. 打开页面，F12 → Performance → 开始录制
2. 观察：
   - **Loading 阶段的资源瀑布图**（Network Timing）
   - **Longest Frame Before First Paint**
   - 标出首屏时间点前加载完成的资源，即为关键资源

#### 2. 使用 Chrome DevTools → Coverage 面板

- 识别“实际使用的 CSS/JS”
- 可以看出哪些资源在首屏期间被真正用到，哪些是冗余代码

#### 3. 使用 Lighthouse 报告

- Lighthouse 中的“Diagnostics”项会指出：
  - 阻塞渲染的资源（Render Blocking Resources）
  - Critical Request Chains
  - Unused JS/CSS 提示，帮助精简非关键资源

#### 4. 查看 Chrome DevTools → Network 面板排序

- 按时间排序，查看首屏渲染前加载的资源
- 关注 `Initiator` 列，了解加载来源（HTML、JS 引入、CSS @import）

---

### 三、首屏关键资源识别的原则

| 资源类型     | 是否为关键资源 | 原因说明 |
|--------------|----------------|-----------|
| `index.html` | ✅              | HTML 是渲染入口 |
| `main.css`   | ✅              | 阻塞渲染，必须先加载 |
| `main.js`    | ✅              | 驱动页面逻辑，渲染主视图 |
| 首页大图     | ✅              | 首屏可见，未加载即白屏 |
| lazy.js      | ❌              | 延迟加载，非首屏资源 |
| 用户点击后加载的组件 | ❌       | 用户交互后才需要，不影响首屏 |

---

### 四、如何标记与优化首屏资源加载

#### ✅ 使用 `&lt;link rel="preload"&gt;` 预加载关键资源

```html
<link rel="preload" href="/styles/main.css" as="style">
<link rel="preload" href="/scripts/main.js" as="script">
````

#### ✅ 合理设置优先级（优先样式、关键 JS）

* 样式应优先加载，JS 使用 `defer` 避免阻塞渲染
* 图片使用 `priority` 或手动 preload，避免首屏懒加载

#### ✅ 拆分资源、按需加载，非关键资源延后

* 使用 `webpack` 拆包、code splitting
* 配合路由懒加载、图片懒加载，剥离非首屏资源

---

### 五、总结

* 首屏关键资源识别关键在于**时机和影响**：只看首屏时间前对渲染有影响的资源
* 工具使用（DevTools Performance / Coverage / Lighthouse）是识别的重要手段
* 识别后需通过**优先加载、资源压缩、预加载、懒加载**等手段进行优化

</details>

## 4. 具体通过哪些手段减少关键资源体积 {#question-subjective-c8174172431f}

### 题目要点

* 清晰分类 JS / CSS / 图片 / 字体 / HTML 各自的体积优化方式
* 能结合具体工具（Webpack、插件、工具链）给出实操方案
* 表达对“精简资源体积 = 提升性能体验”逻辑的理解
* 给出优化前后定量结果更有说服力

<details>
<summary>参考答案</summary>

### 考察点

#### ● 资源优化能力（代码压缩、依赖精简、图片优化等）<br>
考察候选人对性能优化的掌握是否落到实处。

#### ● 掌握不同类型资源的压缩与优化方式<br>
考察是否具备端到端优化思维，而非局限于某一方面。

---

### 参考答案

### 一、为什么要减少关键资源体积？

> **关键资源体积越小**，加载越快，网络传输耗时更短，浏览器处理压力更小，首屏渲染速度更快。<br>
这直接影响用户的“感知性能”体验，尤其在弱网、移动端下尤为明显。

---

### 二、具体优化手段按资源类型分类

#### 1. **JavaScript 优化**

- ✅ **Tree-shaking**：去除未使用的代码（Webpack、Rollup）
- ✅ **代码压缩（Minify）**：如使用 Terser 插件压缩变量名、去除注释
- ✅ **Polyfill 精简**：根据浏览器环境按需引入（如 core-js + babel-preset-env 的 useBuiltIns）
- ✅ **库按需引入**：如 lodash → lodash-es + babel-plugin-lodash
  ```js
  import cloneDeep from 'lodash/cloneDeep'; // ✅ 按需引入
````

* ✅ **替换重型库**：

  * moment.js → dayjs
  * lodash → 使用原生或轻量函数库
* ✅ **代码分包（SplitChunks）**：

  * 只加载首屏模块，非关键模块延迟加载

#### 2. **CSS 优化**

* ✅ **PurgeCSS / uncss**：移除未使用的 CSS 选择器
* ✅ **合并小文件、减少重复样式**
* ✅ **压缩 CSS（cssnano 等）**
* ✅ **拆分 critical CSS 与非关键 CSS**

  ```html
  <style>/* inline critical CSS */</style>
  <link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'" />
  ```

#### 3. **图片资源优化**

* ✅ **使用现代格式（WebP / AVIF）**
* ✅ **图片压缩（tinypng、image-webpack-loader）**
* ✅ **小图 base64 内嵌，减少请求数**
* ✅ **SVG 图标代替 PNG / JPG**
* ✅ **使用 `srcset` 提供不同分辨率资源**

#### 4. **字体资源优化**

* ✅ **子集化字体（Subset Font）**：仅保留页面需要的字符
* ✅ **使用 woff2 格式压缩体积**
* ✅ **延迟加载非首屏字体**

#### 5. **HTML 优化**

* ✅ **去除冗余注释、空白字符**
* ✅ **启用 gzip / brotli 压缩**
* ✅ **减少 HTML 中内联的 JS/CSS**

---

### 三、构建工具相关配置举例（以 Webpack 为例）

```js
// webpack.config.js 中常见压缩插件配置
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({ parallel: true }),
    new CssMinimizerPlugin()
  ]
}
```

---

### 四、优化前后对比效果（示例）

| 类型      | 优化前     | 优化后     |
| ------- | ------- | ------- |
| JS 主包   | 800KB   | 290KB   |
| CSS 主样式 | 220KB   | 70KB    |
| 首页图片    | 400KB   | 120KB   |
| 总体首屏资源  | \~1.5MB | \~500KB |

---

### 五、总结

* **优化目标**：让“首屏相关资源更小、更快、更少”
* **优化策略要针对资源类型差异制定**
* **与构建工具、业务场景相结合落地**
* **建议结合 Lighthouse 报告做持续性指标跟踪**

</details>

## 5. 如何利用缓存策略提升二次加载速度 {#question-subjective-3bf5c552e4c6}

### 题目要点

* 说明强缓存 / 协商缓存的原理与设置方式
* 理解构建产物加 hash 与缓存命中之间的关系
* 熟练掌握 Service Worker 缓存核心资源的能力
* 能结合实际项目给出合理的缓存策略设计方案

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解浏览器缓存的原理与分类<br>
考察候选人对 HTTP 缓存、Service Worker 缓存等的认知是否全面。

#### ● 是否能针对项目合理选择缓存策略<br>
考察实际项目中缓存策略的设计能力，是否能有效提升性能。

---

### 参考答案

### 一、缓存的核心目的

> 利用缓存策略，避免用户每次访问都重新请求资源，**减少网络传输、提升加载速度、降低服务器压力**，实现“秒开体验”。

---

### 二、主流缓存策略概述

#### 1. **HTTP 缓存（浏览器缓存）**

分为两大类：

- ✅ **强缓存（强制命中，无需发请求）**<br>
  - 关键字段：`Cache-Control`（常用）、`Expires`（旧标准）<br>
  - 示例：<br>
    ```http
    Cache-Control: public, max-age=31536000
    ```
    代表资源可缓存 1 年，过期前不会重新请求。

- ✅ **协商缓存（条件命中，服务端确认）**<br>
  - 关键字段：`Last-Modified` / `ETag`<br>
  - 示例：<br>
    ```http
    If-Modified-Since: [上次时间]
    If-None-Match: [上次ETag]
    ```
    若服务端返回 304 Not Modified，则使用本地缓存资源。

#### 2. **Service Worker 缓存**

> 前端可控的离线缓存机制，可缓存页面、资源、接口数据等。

- 常用于：
  - 静态资源缓存（如 HTML、JS、CSS、图片）
  - 接口数据缓存（用于离线或弱网访问）
  - 离线加载（PWA）

#### 3. **浏览器本地存储**

- **LocalStorage / IndexedDB / Cache API**
- 常用于存储静态数据、接口返回结果、用户配置等非敏感信息

---

### 三、如何具体利用缓存策略提升二次加载速度

#### 1. **构建产物加 hash，配合强缓存**

- JS / CSS / 图片资源启用强缓存
  ```http
  Cache-Control: max-age=31536000
````

* 文件名中加上 hash，确保文件变更后重新加载：

  ```
  /main.abc123.js → /main.def456.js
  ```

#### 2. **HTML 不缓存或使用协商缓存**

* 页面结构频繁变更，应避免强缓存，保证用户获取的是最新内容。

  ```http
  Cache-Control: no-cache
  ```

#### 3. **Service Worker 离线缓存核心资源**

```js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache =>
      cache.addAll([
        '/index.html',
        '/main.js',
        '/styles.css',
        '/logo.png'
      ])
    )
  );
});
```

* 可拦截请求，自定义缓存策略（cache-first / network-first）

#### 4. **API 接口数据缓存（可选）**

* 使用 LocalStorage、IndexedDB 或 Service Worker 缓存接口数据，避免重复拉取
* 注意处理缓存过期与数据更新逻辑

#### 5. **CDN 缓存策略优化**

* CDN 节点分发资源靠近用户，缓存配置与主站同步，提升资源加载速度
* 示例：

  ```http
  Cache-Control: public, immutable, max-age=31536000
  ```

---

### 四、实际项目中的缓存策略实践示例

| 资源类型    | 缓存策略                 | 说明              |
| ------- | -------------------- | --------------- |
| HTML 页面 | no-cache             | 避免页面逻辑滞后        |
| JS/CSS  | 强缓存 + 文件 hash        | 一次加载，多次使用       |
| 图片/字体   | 强缓存 + CDN            | 静态资源长缓存         |
| 接口数据    | LocalStorage / SW 缓存 | 二次加载秒开          |
| 第三方资源   | CDN 加速 +版本号控制        | 外链 JS、字体等资源控制变更 |

---

### 五、总结

* **缓存策略是性能优化的核心环节之一**
* **合理划分缓存粒度**，避免缓存过期又不更新或频繁请求不缓存
* **配合构建工具（如 webpack）和部署平台（如 Nginx/CDN）统一策略**
* **充分利用 Service Worker 提升离线体验与弱网性能**

</details>

## 6. HTTP/2与CDN如何协同优化 {#question-subjective-7d790cfbff81}

### 题目要点

* 能清晰阐述 HTTP/2 的性能特性：多路复用、压缩、推送等
* 理解 CDN 如何缓存资源、就近访问
* 能从协同角度说明二者如何配合优化资源加载
* 有项目实践支持、可量化结果更佳

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 HTTP/2 与 CDN 的工作机制及优化作用<br>
考察候选人是否能从网络传输角度理解性能优化策略。

#### ● 是否能基于二者优势进行协同设计<br>
考察实际项目中如何配置、落地协同优化方案。

---

### 参考答案

### 一、HTTP/2 与 CDN 的定位与作用

#### ✅ HTTP/2：新一代网络传输协议
- 主要目标：**提升网络吞吐效率**、减少延迟。
- 核心特性包括：
  - **二进制分帧（Binary Framing）**
  - **多路复用（Multiplexing）**：多个请求/响应复用一个 TCP 连接
  - **首部压缩（Header Compression）**
  - **服务器推送（Server Push）**

#### ✅ CDN：内容分发网络
- 作用：**将资源缓存到离用户最近的节点**，减少跨地域传输、降低 RTT。
- 核心优势：
  - 边缘缓存分发、节点就近访问
  - 支持缓存控制、带宽优化、防攻击能力

---

### 二、HTTP/2 与 CDN 的协同优化方式

#### 1. **利用 HTTP/2 的多路复用，提升 CDN 节点加载效率**
- HTTP/1.1 中浏览器需创建多个连接下载资源（6~8 个并发），而 HTTP/2 在 CDN 节点可 **一个连接并发传多个资源**，极大减少握手 & 阻塞。
- 特别适合场景：
  - 首页加载十几张小图、多个 CSS/JS 小资源
  - HMR 热更新、微前端场景中多个并发资源下载

#### 2. **合并小文件不再必要，提升缓存粒度与命中率**
- 以前为了减少请求数需要合并 CSS/JS 文件（bundle.css），但在 HTTP/2 + CDN 下：
  - 资源分片更细 → 更易缓存
  - 更新时缓存命中率更高（只更新某个 chunk）

#### 3. **充分利用 CDN 的 HTTP/2 支持能力**
- 大多数主流 CDN（如 Cloudflare、阿里云 CDN、腾讯 CDN、Fastly）已原生支持 HTTP/2。
- 建议配置：
  - 启用 **HTTP/2 / HTTP/3 支持**
  - 配置 CDN 支持 **压缩传输（Brotli/Gzip）**，节省传输带宽

#### 4. **利用 HTTP/2 Push + CDN 预热机制提升首屏性能**
- CDN 支持响应头中预先声明资源推送：
  ```http
  Link: </main.js>; rel=preload; as=script
````

* 或利用 CDN 的“预热”功能，提前将关键资源缓存到边缘节点

#### 5. **协同缓存控制策略设计**

* CDN 配置：

  ```http
  Cache-Control: public, max-age=31536000, immutable
  ```
* 浏览器也通过 cache-control 与 CDN 配合，提升二次访问速度
* 结合构建产物加 hash，实现**长期缓存 + 强制更新**

---

### 三、实际协同优化案例

#### 项目背景：

* 使用 React + Webpack 构建前端，部署在阿里云 OSS + CDN，启用 HTTP/2。

#### 优化点：

| 优化项                  | 说明                                          | 效果                  |
| -------------------- | ------------------------------------------- | ------------------- |
| 多路复用                 | 所有 JS/CSS 小文件并发加载                           | 首屏加载时间降低 30%        |
| 构建拆分                 | main.js 拆成 runtime.js + vendor.js + page.js | 二次访问命中率提升           |
| CDN 预热               | 页面常用资源上线前自动预热到节点                            | TTFB 从 500ms → 80ms |
| cache-control + hash | 所有静态资源都采用长缓存策略                              | 用户秒开体验显著提升          |

---

### 四、常见误区

* ❌ **HTTP/2 不等于自动性能提升**：需结合实际构建结构与网络架构
* ❌ **仍使用合并大包方式**：反而影响 CDN 缓存粒度
* ❌ **未开启 CDN 的 HTTP/2 / Brotli**：未发挥协议性能优势
* ❌ **忽略缓存配置**：导致 CDN 频繁回源，丧失加速效果

---

### 五、总结

* **HTTP/2 解决协议瓶颈，CDN 解决网络地理瓶颈**，二者结合提升加载性能效果极佳。
* 建议在项目中启用 HTTP/2 + CDN，并配合：

  * 多文件拆分策略
  * 精准缓存配置
  * CDN 节点预热
  * 现代压缩算法（Brotli）
* 实现真正的“多连接合并 + 分资源缓存 + 极速首屏体验”。

</details>

## 7. 说说 https 的握手过程 {#question-5acf760e-09cb-4979-8cc3-b34f20f8dcfe}

> 题库原题：[说说 https 的握手过程](https://fe.ecool.fun/topic/5acf760e-09cb-4979-8cc3-b34f20f8dcfe)

### 题目要点

HTTPS的详细握手过程包括以下步骤：

1. **TCP三次握手**：建立一个TCP连接。
2. **客户端发送Client Hello**：客户端发送包含TLS版本、随机数、加密套件候选列表等信息的数据包。
3. **服务端发送Server Hello**：服务端收到客户端的Client Hello后，选择一个TLS版本和加密套件，并发送Server Hello响应。
4. **服务端发送证书**：服务端发送自己的数字证书，证明其身份。
5. **服务端发送Server Key Exchange**：对于某些加密算法，服务端发送公钥参数。
6. **服务端发送Server Hello Done**：通知客户端Server Hello信息发送结束。
7. **客户端发送Client Key Exchange、Change Cipher Spec、Encrypted Handshake Message**：客户端发送公钥参数，通知使用协商的密钥和加密算法，并发送加密的握手消息以测试密钥的有效性。
8. **服务端发送New Session Ticket**：服务端发送会话票据，用于在超时时间内复用协商的密钥。
9. **服务端发送Change Cipher Spec**：服务端通知客户端后续通信将使用协商的密钥和加密算法。
10. **服务端发送Encrypted Handshake Message**：服务端发送加密的握手消息，用于验证客户端和服务端能正常加密和解密。
11. **完成密钥协商，开始发送数据**：双方使用协商的密钥加密和解密数据。
12. **完成数据发送，4次TCP挥手**：双方发送结束握手，关闭TCP连接。

整个握手过程确保了安全通信的建立，包括身份验证、密钥协商和加密配置。

<details>
<summary>参考答案</summary>

## https的详细握手过程

https在七层协议里面属于应用层，他基于tcp协议，所以，https握手的过程，一定先经过tcp的三次握手，tcp链接建立好之后，才进入https的对称密钥协商过程，对称密钥协商好之后，就开始正常的收发数据流程。

接下来拿实际网络数据包来解释https的整个详细的握手过程

打开wireshark抓包工具，并随手打开命令行，输入了如下一行命令

```
curl https://www.baidu.com

```

上面其实涉及到两个问题：

1. 为什么是wireshark，而不是fiddler 或者 charles<br>
> fiddler 和charles主要是用于抓取应用层协议https/http等上层的应用数据，都是建立链接成功后的数据，而wireshark是可以抓取所有协议的数据包（直接读取网卡数据）,我们的目的是抓取https建立链接成功前的过程，所以我们选择wireshark

2. 为什么是用curl， 而不是在浏览器打开https://www.baidu.com<br>
> curl是只发送一个请求，如果是用浏览器打开百度，那百度页面里面的各种资源也会发送请求，容易造成很多不必要的数据包

好，重点来了，开始上图：

![3.jpg](https://static.ecool.fun//article/5eb1e871-2272-4b5c-b3c2-4b997ca9cfed.jpeg)

![4.jpg](https://static.ecool.fun//article/edecff28-62c5-4063-aa63-c873697d25b8.jpeg)

遇到凡事不要慌，接下来待我给你慢慢道来（ack消息属于tcp协议里面的确认报文，不做解释）

#### 第一步

![BBDC09E23F6A440A9D8DF91C8988F884_20200706143251.jpg](https://static.ecool.fun//article/1af0a8a1-e0b9-498e-b89b-de1b1d517b1a.jpeg)

> 解释说明：tcp三次握手，这个不做解释，如果这块不清楚，比如ack，seq,mss,win都代表什么意思，这个可以在互动区留言，我视情况专门写几篇tcp的文章（这块太大了，没几篇是介绍不完的）

#### 第二步：客户端发送client\_hello

![6.jpg](https://static.ecool.fun//article/19971982-68c1-4388-b455-0cdac1618916.jpeg)

> 解释说明：客户端发送client\_hello，包含以下内容（请自行对照上图） 1\. 包含TLS版本信息 2\. 随机数（用于后续的密钥协商）random\_C 3\. 加密套件候选列表 4\. 压缩算法候选列表 5\. 扩展字段 6\. 其他

#### 第三步：服务端发送server\_hello

![0.jpg](https://static.ecool.fun//article/f217ddb9-11b9-4815-88bd-a6c145a9ec3b.jpeg)

> 解释说明：服务端收到客户端的client\_hello之后，发送server\_hello，并返回协商的信息结果 1\. 选择使用的TLS协议版本 version 2\. 选择的加密套件 cipher suite 3\. 选择的压缩算法 compression method 4\. 随机数 random\_S 5\. 其他

#### 第四步：服务端发送证书

![31.jpg](https://static.ecool.fun//article/af820a6a-12bd-4f1b-b126-6513a102aabc.jpeg)

> 解释说明：服务端发送完server\_hello后，紧接着开始发送自己的证书（不清楚证书是什么的，可以移步到[上一篇文章](https://juejin.cn/post/6845166890675863559)），从图可知：因包含证书的报文长度是3761，所以此报文在tcp这块做了分段，分了3个报文把证书发送完了

> 问自己： 1\. 分段的标准是什么？ 2\. 什么时候叫分段，什么时候叫分片？ 3\. 什么是MTU，什么是MSS

#### 第五步：服务端发送Server Key Exchange

![27.jpg](https://static.ecool.fun//article/f88e594d-8b3f-4589-8114-326c8a366560.jpeg)

> 解释说明:对于使用DHE/ECDHE非对称密钥协商算法的SSL握手，将发送该类型握手。RSA算法不会进行该握手流程（DH、ECDH也不会发送server key exchange）,也就是说此报文不一定要发送，视加密算法而定。SSL中的RSA、DHE、ECDHE、ECDH流程与区别可以参考[此篇文章](https://blog.csdn.net/mrpre/article/details/78025940)

#### 第六步：服务端发送Server Hello Done

![11.jpg](https://static.ecool.fun//article/36c979f7-35bc-4882-94fd-1e04adf3245c.jpeg)

> 解释说明:通知客户端 server\_hello 信息发送结束

#### 第七步：客户端发送.client\_key\_exchange+change\_cipher\_spec+encrypted\_handshake\_message

![10.jpg](https://static.ecool.fun//article/f7043a3f-aaed-4b76-9349-c41d24f03196.jpeg)

> 解释说明: 1\. client\_key\_exchange，合法性验证通过之后，向服务器发送自己的公钥参数，这里客户端实际上已经计算出了密钥 2\. change\_cipher\_spec，客户端通知服务器后续的通信都采用协商的通信密钥和加密算法进行加密通信 3\. encrypted\_handshake\_message，主要是用来测试密钥的有效性和一致性

#### 第八步：服务端发送New Session Ticket

![948.jpg](https://static.ecool.fun//article/de0beb4d-5eee-4d5c-8883-634773f2a2e2.jpeg)

> 解释说明:服务器给客户端一个会话，用处就是在一段时间之内（超时时间到来之前），双方都以协商的密钥进行通信。

#### 第九步：服务端发送change\_cipher\_spec

![37.jpg](https://static.ecool.fun//article/2c53bff9-2d84-49b4-953d-ae62a11911ea.jpeg)

> 解释说明:服务端解密客户端发送的参数，然后按照同样的算法计算出协商密钥，并通过客户端发送的encrypted\_handshake\_message验证有效性，验证通过，发送该报文，告知客户端，以后可以拿协商的密钥来通信了

#### 第十步：服务端发送encrypted\_handshake\_message

![03.jpg](https://static.ecool.fun//article/5fe5ee5a-eff9-4933-bb4c-d51d2ca8c80e.jpeg)

> 解释说明:目的同样是测试密钥的有效性，客户端发送该报文是为了验证服务端能正常解密，客户端能正常加密，相反：服务端发送该报文是为了验证客户端能正常解密，服务端能正常加密

#### 第十一步：完成密钥协商，开始发送数据

![0706182714.jpg](https://static.ecool.fun//article/b6823e50-f6dc-4570-b0f9-740fe0d8f5e6.jpeg)

> 解释说明：数据同样是分段发送的

#### 第十二步：完成数据发送，4次tcp挥手

![6183001.jpg](https://static.ecool.fun//article/95abd39e-df25-43d5-97fa-4861185ea860.jpeg)

> 解释说明：红框的意思是：客户端或服务器发送的，意味着加密通信因为某些原因需要中断，警告对方不要再发送敏感的数据,服务端数据发送完成也会有此数据包，可不关注

## 结语

最后用一张图来说明以下过程

![20190626125502435.png](https://static.ecool.fun//article/5fe6b973-9dc5-400c-a2c8-cdae7b5d8624.jpeg)

</details>

## 8. 为什么HTTPS能防止中间人攻击 {#question-subjective-794443b89cbc}

### 题目要点

- 懂得中间人攻击是“伪装+监听+篡改”的过程
- 能清晰解释 HTTPS 防护机制（证书 + 加密 + 完整性）
- 能对比 HTTP 的不足，说明为什么 HTTPS 更安全
- 知道 TLS 握手流程及其安全意义

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 HTTPS 的加密原理和中间人攻击的本质<br>
面试官想了解候选人是否真正掌握 TLS 握手过程和公钥加密机制，而不是表面地说“HTTPS更安全”。

#### ● 是否了解证书信任机制与非对称加密的作用<br>
验证候选人是否理解数字证书如何防止数据被篡改或伪造。

---

### 参考答案

### 一、中间人攻击（MITM）的本质是什么？

> 中间人攻击（Man-in-the-Middle Attack）是指攻击者在客户端与服务器之间**截获、篡改或伪造通信内容**的一种攻击方式。

常见手段：
- 恶意 Wi-Fi 热点劫持
- DNS 污染/伪造
- 篡改请求或响应数据
- 冒充服务器与用户建立连接

---

### 二、HTTPS 的核心防护机制

HTTPS = HTTP + TLS/SSL，主要靠 **TLS 握手 + 加密通信** 实现防护。

#### 1. **非对称加密保障密钥协商安全**

- 浏览器连接服务器 → 获取服务端公钥（证书中携带）
- 客户端使用公钥加密随机生成的“对称密钥”
- 只有服务端私钥可以解密该密钥，整个过程**即便被监听，也无法解密内容**

✅ 防止：中间人获取密钥后解密数据。

#### 2. **数字证书验证服务器身份**

- 浏览器验证服务器下发的证书是否由可信 CA 签发
- 验证内容包括：
  - 证书链是否完整
  - 域名是否匹配
  - 证书是否过期/吊销
- 若证书被伪造，浏览器会拦截连接（提示证书不安全）

✅ 防止：中间人伪造服务器欺骗客户端。

#### 3. **对称加密保护通信内容**

- 握手后，客户端与服务器使用协商好的对称密钥加密通信数据
- 加密算法：如 AES、ChaCha20 等，安全性强，无法被直接破解

✅ 防止：监听数据包也无法看到明文内容。

#### 4. **完整性校验防止篡改**

- 每个数据包包含 MAC（消息认证码）或使用 AEAD 模式（如 GCM）
- 即便数据被截获，也无法修改内容而不被检测

✅ 防止：中间人偷偷修改请求或响应数据。

---

### 三、HTTPS 防止中间人攻击的完整链路过程图（简述）

```

\[浏览器] ─── TLS握手 ───► \[服务端]
│                       │
▼                       ▼
验证证书                 解密密钥
生成对称密钥          建立加密通道
│                       │
└── 加密通信 ◄────────┘

```

---

### 四、为什么 HTTP 无法防止中间人攻击？

HTTP 是明文传输，没有任何加密或验证机制，攻击者可以：
- 拦截请求/响应（抓包工具即可）
- 修改 HTML/JS 注入广告、木马
- 劫持登录信息或令牌

---

### 五、总结

HTTPS 能有效防止中间人攻击的根本原因在于：

1. **非对称加密协商密钥，不怕被窃听**
2. **数字证书验证服务器身份，防止伪造**
3. **对称加密保障通信数据机密性**
4. **完整性校验防止篡改**

只有三者结合，才能真正构建安全可信的通信链路。

</details>

## 9. HTTPS的证书链的验证过程是怎样的 {#question-subjective-ea18fae3bbd5}

### 题目要点

- 能说出证书链的组成结构（服务器证书 / 中间 CA / 根证书）
- 明确验证过程是“从服务器证书一路验证到本地根证书”
- 能说明验证项目包括签名、有效期、吊销状态、域名等
- 能指出浏览器本地信任库的重要性

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 HTTPS 中的数字证书验证机制<br>
面试官希望候选人能清晰解释浏览器是如何验证服务器身份的，是否理解「信任链」的概念。

#### ● 是否掌握证书链的组成、验证步骤及信任模型<br>
关注候选人是否了解中间 CA、根证书、浏览器信任库的关系。

---

### 参考答案

### 一、什么是证书链？

HTTPS 使用的 TLS 证书（通常为 X.509 格式）并不是单独存在的，而是组成一条“信任链”。

这条证书链包含三类证书：

1. **服务器证书（Leaf Certificate）**<br>
   - 安装在网站服务器上<br>
   - 绑定域名、包含公钥信息<br>

2. **中间证书（Intermediate CA）**<br>
   - 由根证书签发<br>
   - 通常是“证书颁发机构的中继者”，实际用于签发服务器证书

3. **根证书（Root Certificate）**<br>
   - 由权威 CA 签发，并预装在浏览器/操作系统信任库中<br>
   - **信任的起点**，必须是浏览器本地“已信任”的证书

🔗 **证书链**：服务器证书 ← 中间证书 ← 根证书<br>
➡️ 服务器会将证书链（除根证书外）传给浏览器进行验证。

---

### 二、证书链验证的完整过程

> 验证目的：确保服务端证书是合法、未被伪造的。

#### ✅ 第一步：获取服务端下发的证书链

- 浏览器访问网站 → 服务端返回 TLS 证书链：
```

\[服务器证书] + \[中间 CA 证书] + ...（可能有多个中间证书）

```

#### ✅ 第二步：逐级验证签名链是否有效

浏览器按以下顺序校验：

1. **验证服务器证书的签名是否由中间证书签发**
 - 签名有效：继续
 - 否则：终止，提示“不受信任的证书”

2. **验证中间证书是否由更高级的中间 CA 签发**
 - 若存在多个中间证书，逐层验证

3. **验证顶层中间证书是否由根证书签发**
 - 查找本地「受信任的根证书列表」是否包含该根证书
 - 若找不到：终止连接，提示“不受信任的签名机构”

#### ✅ 第三步：校验证书有效性

除了验证签名链，还需检查以下内容：

- 📅 **证书是否过期（Valid Time）**
- 🔐 **证书是否被吊销（通过 CRL / OCSP 查询）**
- 🌐 **证书绑定的域名是否与当前访问域名匹配**
- 🔗 **是否为可信的签名算法（如 SHA-1 已不被信任）**

---

### 三、图示：HTTPS 证书链验证流程

```

\[浏览器信任库]
▲
\[根证书] ← \[中间CA] ← \[服务器证书]
│                     ▲
浏览器本地     服务端下发

```

---

### 四、浏览器是如何信任根证书的？

- 浏览器 / 操作系统内置一组「受信任的根证书」，称为 **信任锚（Trust Anchors）**
- 常见的根证书颁发机构（Root CA）有：
  - DigiCert
  - GlobalSign
  - Let's Encrypt
  - Sectigo（原 Comodo）

💡 用户也可以手动导入自签名根证书，用于企业内网、自建平台等场景。

---

### 五、常见面试陷阱

- ❌ **误以为证书链中一定包含根证书**<br>
  实际上浏览器会自行查找本地根证书，而不是依赖服务端提供

- ❌ **认为只验证服务器证书本身**<br>
  忽略了中间 CA 的存在，容易答漏或答错

- ❌ **不了解证书被吊销也会导致验证失败**<br>
  比如使用 OCSP Stapling 提前拉取吊销状态也是重要细节

---

### 六、总结

证书链验证过程 = **链式签名校验 + 有效性检查 + 本地信任校验**

- 🔐 保证服务端身份可信（不是伪造者）
- 🧾 浏览器利用预置的根证书，信任一整条链
- 🚨 一旦任意一环验证失败，HTTPS 连接就会被拒绝

</details>

## 10. 设置 Domain=.example.com 和 Domain=example.com 有什么区别 {#question-subjective-668a630018e4}

### 题目要点

* 明确两种写法在现代浏览器中效果相同
* 知道 `.example.com` 是旧式写法，现代推荐直接写 `example.com`
* 能结合 Cookie 跨子域共享、浏览器安全策略进行分析

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 Cookie 中 Domain 属性的作用和规则<br>
面试官希望通过这道题，考察候选人对 Cookie 跨子域共享、作用域控制的理解程度。

#### ● 是否能正确解释两个写法的区别及兼容性问题<br>
了解细节差异是否会影响浏览器行为，以及如何在实际项目中正确设置。

---

### 参考答案

### 一、Cookie 中 `Domain` 属性的作用

> `Domain` 属性用于指定 Cookie 可以被哪些域名访问。

- 默认情况下（未设置 `Domain`）：
  - Cookie 只能被当前域访问（**不包含子域**）

- 设置了 `Domain`：
  - Cookie 将作用于 **指定域及其子域**（前提是设置的 domain 属于当前请求域）

---

### 二、`Domain=.example.com` 和 `Domain=example.com` 的区别

> **在大多数现代浏览器中，它们的作用是等价的**。<br>

#### ✅ 共同点：

| 设置方式               | 可被访问的域                |
|------------------------|-----------------------------|
| `Domain=.example.com`  | `example.com`、`a.example.com`、`b.example.com` |
| `Domain=example.com`   | `example.com`、`a.example.com`、`b.example.com` |

两者都会使 Cookie 在主域及子域中共享。

#### ❗ 差异来源：

- `Domain=.example.com` 是 **早期 Netscape 规范中的写法**，推荐使用点号来明确“子域可用”。
- `Domain=example.com` 是现代浏览器**更宽容且推荐**的写法，点号被视为冗余。

现代浏览器为了兼容，**两种写法都支持跨子域访问**，但有以下细微差别：

| 差异点 | 描述 |
|--------|------|
| 可读性 | `.example.com` 明确指出对子域开放访问，表达更直观 |
| 向后兼容 | 某些非常旧的浏览器（如 IE6/IE7）曾区别对待，`.example.com` 更具兼容性 |
| 语义标准 | `example.com` 已包含子域含义，点号可省略 |

---

### 三、项目中的推荐做法

- ✅ 若要让多个子域（如 `www.example.com`、`api.example.com`）共享登录状态或 token，设置：
  ```http
  Set-Cookie: token=abc; Domain=example.com; Path=/;
````

* ❌ 不建议写成 `Domain=www.example.com`，否则仅 `www.` 子域可访问

* ⚠️ 注意：必须由 **主域或子域服务器** 设置 `Domain=example.com`，否则被浏览器拒绝（**安全限制，防止跨域伪造 Cookie**）

---

### 四、常见误区

* ❌ 以为 `Domain=.example.com` 更能跨子域，其实两者效果一致
* ❌ 以为省略 `Domain` 也可以跨子域访问，**默认不能跨子域访问 Cookie**

---

### 五、总结

| 设置方式                  | 子域可访问 | 推荐使用       |
| --------------------- | ----- | ---------- |
| `Domain=.example.com` | ✅     | ✅（向后兼容更好）  |
| `Domain=example.com`  | ✅     | ✅（现代主流）    |
| 默认不设置 `Domain`        | ❌     | ✅（限当前域更安全） |

</details>

## 11. 浏览器发送请求时，如何确定携带哪些Cookie {#question-subjective-650feea4e09c}

### 题目要点

* 熟悉 Cookie 携带机制的多个限制条件
* 能解释各属性（Domain、Path、Secure、SameSite）的控制作用
* 能识别跨站与跨域场景中的 Cookie 携带逻辑
* 知道服务端与前端如何共同保障 Cookie 携带行为

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 Cookie 的作用域控制机制（Domain、Path、Secure、SameSite 等）<br>
面试官希望判断候选人是否真正掌握 Cookie 在请求时的“生效边界”。

#### ● 是否了解浏览器如何根据请求目标决定是否附带 Cookie<br>
这体现了候选人对浏览器行为、跨域安全模型的理解。

---

### 参考答案

### 一、Cookie 的基础规则

浏览器在发送请求时，会根据当前请求的 URL，**自动携带匹配的 Cookie**，不需要手动设置。

携带 Cookie 的前提是：满足下列条件。

---

### 二、决定 Cookie 是否携带的 5 大因素

#### ✅ 1. 域名匹配（Domain）

- Cookie 的 `Domain` 必须与当前请求 URL 的域 **完全匹配或是其父域**。
- 否则浏览器不会携带该 Cookie。

例子：

```http
Set-Cookie: token=abc; Domain=example.com;
````

* 访问 `a.example.com` 时会携带 ✅
* 访问 `evil.com` 时不会携带 ❌

#### ✅ 2. 路径匹配（Path）

* Cookie 的 `Path` 属性决定 **匹配 URL 的路径前缀**。

```http
Set-Cookie: session=xyz; Path=/admin;
```

* 请求 `/admin/page` 会携带 ✅
* 请求 `/user/page` 不会携带 ❌

#### ✅ 3. 是否为安全请求（Secure）

* 设置了 `Secure` 属性的 Cookie 只会在 HTTPS 请求中被发送。

```http
Set-Cookie: token=abc; Secure;
```

* 访问 `https://example.com` 会携带 ✅
* 访问 `http://example.com` 不会携带 ❌

#### ✅ 4. SameSite 策略控制“跨站携带”行为

| SameSite 值 | 说明                                             |
| ---------- | ---------------------------------------------- |
| `Strict`   | **完全禁止跨站发送**，即便是 `<a href>`、表单提交也不会发送 Cookie ❌ |
| `Lax`      | 允许部分“安全”跨站请求（如 GET 跳转）发送 Cookie ✅              |
| `None`     | 允许所有跨站请求携带 Cookie，但**必须配合 Secure** ✅           |

```http
Set-Cookie: auth=abc; SameSite=None; Secure;
```

若未设置 `SameSite`，现代浏览器默认认为是 `Lax`。

#### ✅ 5. 是否跨域（含跨协议、跨端口）

* 如果请求是跨域的（例如主站访问 iframe 或向第三方接口发请求），默认不会携带第三方 Cookie。
* 可以通过设置 `withCredentials=true` 显式允许跨域请求携带 Cookie（但前提是服务端也需设置 `Access-Control-Allow-Credentials: true`）

---

### 三、请求时 Cookie 携带判断流程（简化版）

```text
1. 当前 URL 的域名和路径是否匹配 Set-Cookie 的 Domain & Path？
2. 是否是 HTTPS 请求？若 Cookie 有 Secure 限制，则必须是 HTTPS。
3. 是否为跨站请求？若是，SameSite 策略是否允许？
4. 是否是第三方请求？是否设置 withCredentials？
5. 最终符合条件的 Cookie 会被自动附带到请求头中。
```

---

### 四、示例代码与实际行为

```javascript
fetch('https://api.example.com/user', {
  credentials: 'include', // 允许携带 Cookie
});
```

服务端需响应：

```http
Access-Control-Allow-Origin: https://your.frontend.com
Access-Control-Allow-Credentials: true
```

否则即使客户端设置了 `credentials: 'include'`，也不会发送 Cookie。

---

### 五、常见误区

* ❌ **认为设置了 Cookie 就一定会发送** → 忽略了路径、域、安全限制
* ❌ **跨域请求忘记设置 withCredentials / Allow-Credentials**
* ❌ **SameSite=None 忘记加 Secure，导致被浏览器丢弃**

---

### 六、总结

浏览器是否携带 Cookie 取决于以下条件是否同时满足：

| 条件                                | 是否必须 |
| --------------------------------- | ---- |
| 请求的域名与 Cookie 的 Domain 匹配         | ✅    |
| 请求的路径符合 Cookie 的 Path 规则          | ✅    |
| 若设置 Secure，则必须是 HTTPS 请求          | ✅    |
| 若是跨站请求，则 SameSite 策略必须允许          | ✅    |
| 若是跨域请求，还需 withCredentials + 服务端配合 | ✅    |

</details>

## 12. 如何避免Cookie带来的性能问题 {#question-subjective-eafceb630f64}

### 题目要点

* 理解 Cookie 自动发送的特性是性能隐患
* 明确哪些场景 Cookie 不该被携带（如静态资源）
* 掌握 Cookie 的控制参数（Domain、Path、Max-Age）
* 提出可落地的优化方案，包括架构调整（静态资源隔离）和代码实践

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 Cookie 在请求中自动携带机制带来的隐性性能负担<br>
考察候选人是否意识到 Cookie 会在每一次请求中自动携带，可能造成网络性能浪费。

#### ● 是否掌握精细管理 Cookie 的最佳实践<br>
面试官希望看到候选人具备优化 Cookie 使用策略的能力，减少冗余和带宽浪费。

---

### 参考答案

### 一、Cookie 的性能问题本质

> Cookie 会被自动添加在浏览器发起的 **每一个与匹配域相关的请求中**，包括 HTML、JS、CSS、图片等静态资源。

#### ⚠️ 性能问题表现：

1. **请求体积增加**：即使请求不需要身份信息，Cookie 依然会被附加。
2. **资源加载变慢**：尤其是大 Cookie 文件影响静态资源加载（如 CDN 资源）。
3. **带宽浪费**：Cookie 太大时会浪费上传带宽，影响低网速用户体验。
4. **服务端压力增加**：服务端每次都接收不必要的 Cookie 数据，占用 IO 和解析资源。

---

### 二、避免性能问题的策略

#### ✅ 1. 精确设置 Cookie 的 `Path` 和 `Domain`

- 默认：Cookie 绑定当前路径（推荐）
- 如果设置为根路径 `/`，则所有请求都会携带 Cookie ❌

**优化建议：**

```http
Set-Cookie: token=abc; Path=/user;
````

* 仅 `/user` 相关接口会带上该 Cookie，避免影响其他静态资源请求。

---

#### ✅ 2. 避免对静态资源使用 Cookie 域

* 如果使用了如 `Domain=example.com`，那么请求静态资源（如 `cdn.example.com`）也会附带 Cookie ❌

**优化建议：**

* 将静态资源部署在不同子域（如 `static.examplecdn.com`）或使用独立域名，不设置 Cookie。
* 利用 CDN 配置隔离 Cookie 域。

---

#### ✅ 3. 控制 Cookie 的体积

Cookie 本身大小限制约为 4KB，但不建议接近上限。

**优化建议：**

* 只存储必要信息（如 token、用户ID）
* 不存储大量业务数据（如用户权限、偏好设置等）
* 考虑将非关键数据放在 LocalStorage / IndexedDB 中

---

#### ✅ 4. 设置合理的过期时间

**问题：** 永久有效 Cookie 会被长期携带，哪怕用户已退出系统。

**优化建议：**

```http
Set-Cookie: token=abc; Max-Age=3600; // 设置 1 小时有效期
```

* 对于登录态使用短期有效期 + 滑动过期策略
* 及时清除失效的 Cookie

---

#### ✅ 5. 区分首要认证与辅助数据存储

**策略设计：**

* 登录认证使用 Cookie（如 JWT）
* 其他功能性数据（如主题、首选项）存入 LocalStorage / SessionStorage，避免重复请求时冗余发送

---

### 三、前端开发中的注意事项

* 图片标签中的跨域请求，如 `<img src="xxx">`，也会附带 Cookie
* 第三方脚本引用应尽量避免携带主域的 Cookie
* 可以通过 `fetch` 的 `credentials: omit` 禁止 Cookie 发送

```js
fetch('/static/data.json', {
  credentials: 'omit',
});
```

---

### 四、总结

| 优化策略                 | 说明              |
| -------------------- | --------------- |
| 限制 Cookie 的 Path 范围  | 减少无关请求携带 Cookie |
| 避免静态资源与主域共用 Cookie 域 | 减轻带宽负担          |
| 控制 Cookie 数量和大小      | 避免超出浏览器限制       |
| 合理设置过期时间             | 降低长期无效传输        |
| 区分存储用途               | 降低无关数据自动上传      |

</details>

## 13. 画一下从浏览器请求到使用缓存资源的整个流程图 {#question-subjective-8dfe3bda6109}

### 题目要点

* 能绘制并描述缓存流程图，清晰表达决策分支
* 理解强制缓存与协商缓存的区别与配合工作
* 知道关键 HTTP 头（Cache-Control、Expires、ETag、Last-Modified、If-None-Match、If-Modified-Since）
* 说明浏览器如何减少不必要的网络请求，实现性能优化

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解浏览器缓存的整体流程与关键决策点<br>
#### ● 能清晰描述浏览器如何判断使用缓存资源还是发起网络请求<br>
#### ● 理解请求、响应、缓存命中、校验机制等步骤及其顺序

---

### 参考答案

### 一、浏览器请求到使用缓存资源的完整流程图（简化版）

```mermaid
flowchart TD
  A[浏览器发起请求] --> B{检查浏览器缓存中是否有资源}

  B -- 无缓存 --> C[直接发起网络请求]
  B -- 有缓存 --> D{判断缓存是否过期}

  D -- 未过期 --> E[直接使用缓存资源，页面渲染完成]
  D -- 已过期 --> F[发起条件请求 (If-Modified-Since / If-None-Match)]

  F --> G{服务器响应状态码}

  G -- 304 Not Modified --> E
  G -- 200 OK --> H[服务器返回新资源，更新缓存]

  H --> E
  C --> I[服务器返回资源]
  I --> J[缓存资源（根据 Cache-Control/Expires 指令）]
  J --> E
````

---

### 二、流程详解

1. **浏览器发起请求**：用户输入 URL 或页面内资源请求。
2. **浏览器检查本地缓存**：查看是否存在对应请求的缓存条目（包括强制缓存和协商缓存）。
3. **无缓存时**：直接向服务器发起请求，服务器返回完整资源，浏览器缓存响应数据，并渲染页面。
4. **有缓存时，判断缓存是否过期**：

   * 依据 `Cache-Control` 的 `max-age`、`Expires` 等判断资源是否仍然有效。
   * 若未过期，直接使用缓存，避免网络请求，提高性能。
5. **缓存过期时，发起条件请求**：

   * 浏览器通过请求头 `If-Modified-Since`（基于最后修改时间）或 `If-None-Match`（基于 ETag）向服务器询问资源是否变更。
6. **服务器响应**：

   * `304 Not Modified`：资源未变更，浏览器继续使用缓存资源。
   * `200 OK`：资源已更新，服务器返回新资源，浏览器更新缓存并渲染。

---

### 三、缓存类型及对应作用

* **强制缓存（Freshness）**
  由 `Cache-Control: max-age` 或 `Expires` 控制，期间直接使用缓存。

* **协商缓存（Validation）**
  当缓存过期后，浏览器使用条件请求向服务器确认资源有效性。

</details>

## 14. Cache-Control: max-age=3600 和 Expires 同时存在时，哪个优先级更高 {#question-subjective-fefcc7111bbe}

### 题目要点

- 明确 `Cache-Control:max-age` 优先于 `Expires`
- 理解相对时间与绝对时间的差异及浏览器处理逻辑
- 知道 `Cache-Control` 是现代缓存控制标准

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否理解 HTTP 缓存控制的优先级规则<br>
面试官希望考察候选人对两种缓存失效时间控制机制的区别及冲突时的处理方式。

#### ● 了解现代浏览器及 HTTP/1.1 标准中的缓存行为

---

### 参考答案

### 一、`Cache-Control` 与 `Expires` 的区别

- **Expires**<br>
  - HTTP/1.0 引入，指定资源的绝对过期时间（GMT 格式的时间戳）。<br>
  - 服务器告诉浏览器，缓存有效直到某个具体时间点。<br>

- **Cache-Control: max-age**<br>
  - HTTP/1.1 引入，指定缓存的相对过期时间（秒数）。<br>
  - 从请求时间开始计算，max-age 秒数内缓存有效。

---

### 二、两者共存时的优先级

- 当响应头中同时包含 `Cache-Control: max-age` 和 `Expires` 时，**`Cache-Control: max-age` 优先级更高**。<br>
- 浏览器会忽略 `Expires`，仅根据 `max-age` 判断缓存是否过期。

---

### 三、原因分析

- `max-age` 相对时间更灵活，避免了因客户端时间不准带来的问题。<br>
- HTTP/1.1 标准推荐使用 `Cache-Control`，逐渐取代 `Expires`。<br>
- 现代浏览器普遍实现了这个优先级规则。

---

### 四、实际示例

```

Cache-Control: max-age=3600
Expires: Wed, 21 Oct 2025 07:28:00 GMT

```

- 只要请求在发送后 3600 秒内，浏览器就使用缓存，无视 `Expires` 指定的具体时间。

---

### 五、总结

| 头部字段          | 作用                | 优先级           |
|-------------------|---------------------|------------------|
| Cache-Control:max-age | 相对过期时间（秒）   | 高               |
| Expires           | 绝对过期时间（GMT）  | 低（仅作兼容）    |

</details>

## 15. 如何强制缓存失效 {#question-subjective-e0341a32882e}

### 题目要点

* 掌握版本号管理作为最有效的强制失效手段
* 理解 HTTP 头控制缓存的区别和作用
* 明确缓存失效的实际业务需求与技术实现结合

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器缓存机制及缓存失效的条件<br>
面试官想确认候选人能掌握控制缓存生命周期、避免缓存带来内容更新延迟的手段。

#### ● 熟悉 HTTP 头部控制缓存策略和前端版本管理方法

---

### 参考答案

### 一、什么是强制缓存失效？

> 强制缓存失效指浏览器在缓存时间未到期之前，**主动让缓存失效**，从而重新请求最新资源，确保页面内容更新及时。

---

### 二、常用强制缓存失效手段

#### 1. 修改资源 URL 版本号（Cache Busting）

- 通过给静态资源文件名添加**版本号、哈希值或时间戳**，使 URL 变更。
- 浏览器认为是全新请求，直接请求服务器最新资源。

**示例：**

```html
<script src="/app.js?v=20230727"></script>
<!-- 或 -->
<script src="/app.abcdef.js"></script>
````

**优点：**

* 简单高效，兼容所有浏览器
* 无需更改服务器配置

---

#### 2. 设置响应头控制缓存

* **设置 `Cache-Control: no-cache`**
  表示浏览器在使用缓存前必须向服务器验证资源是否修改（发条件请求）。
  注意：不是完全不缓存，而是每次都要验证。

* **设置 `Cache-Control: no-store`**
  禁止缓存，浏览器不会存储资源，每次请求都会去服务器获取最新内容。

* **设置 `Pragma: no-cache`**
  HTTP/1.0 兼容头，一般配合 `Cache-Control` 使用。

* **设置 `Expires` 为过去的时间**
  表示资源已经过期。

---

#### 3. 利用 HTTP 协商缓存机制

* 服务器返回 `ETag` 或 `Last-Modified`，浏览器带条件请求头 `If-None-Match` 或 `If-Modified-Since`。
* 当资源变化时，服务器返回新的内容，否则返回 `304 Not Modified`。

---

### 三、项目中推荐做法

* 对频繁更新的资源（如 JS、CSS）使用版本号管理（内容哈希 + 自动化构建工具生成）。
* 对于静态资源可配置合理的长缓存策略，更新时通过改名实现强制失效。
* 动态数据接口可设置 `Cache-Control: no-cache` 或不缓存。
* 确保服务器支持协商缓存，减少不必要流量。

---

### 四、常见误区

* 误认为 `no-cache` 就是“不缓存”，实际是“缓存但先验证”。
* 依赖 `Expires` 而不设置 `Cache-Control`，现代浏览器更依赖 `Cache-Control`。
* 忽视资源 URL 不变导致缓存永远不更新。

---

### 五、总结

| 方案                       | 说明                 | 适用场景      |
| ------------------------ | ------------------ | --------- |
| 修改资源 URL 版本号             | 通过变更 URL 强制浏览器重新请求 | 静态资源更新    |
| Cache-Control: no-cache  | 使用缓存但每次请求都验证是否变更   | 动态资源、接口请求 |
| Cache-Control: no-store  | 禁止缓存，每次都请求最新资源     | 绝对禁止缓存    |
| 协商缓存（ETag、Last-Modified） | 浏览器条件请求，减少不必要传输    | 大多数缓存优化场景 |

</details>

## 16. CSRF攻击的原理 {#question-subjective-f1f1c28c5dad}

### 题目要点

* 明确 CSRF 利用浏览器自动携带 Cookie 的特性
* 说明攻击通过伪造用户请求实现未授权操作
* 体现对同源策略与请求发送机制的理解

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解跨站请求伪造（CSRF）攻击的基本概念及机制<br>
面试官希望确认候选人能准确描述攻击原理，识别安全风险。

#### ● 理解浏览器同源策略与Cookie自动携带机制在CSRF中的作用

---

### 参考答案

### 一、CSRF攻击的核心定义

> CSRF（Cross-Site Request Forgery）即跨站请求伪造，是攻击者利用用户已登录的身份，在不知情的情况下诱导用户浏览器发送伪造请求，从而达到非法操作的攻击行为。

---

### 二、CSRF攻击的原理详解

#### 1. 用户已登录状态下浏览器自动携带 Cookie

- 当用户登录网站（如 `bank.com`）后，浏览器会自动保存并在后续对该域名的请求中携带登录状态的 Cookie。
- 这一机制基于 HTTP 协议设计，方便用户免登录使用服务。

#### 2. 攻击者构造恶意请求并诱导用户访问

- 攻击者在自己控制的网站（如 `evil.com`）嵌入针对 `bank.com` 的请求，例如 `<img>`, `&lt;form&gt;`, 或 AJAX 请求。
- 由于浏览器的自动 Cookie 机制，这些请求会携带用户对 `bank.com` 的登录 Cookie。

#### 3. 服务器收到请求，误以为是用户主动发起的操作

- 服务器根据 Cookie 认证身份，执行对应操作（如转账、修改密码），完成攻击者意图。

---

### 三、关键点总结

- **利用浏览器自动携带 Cookie 特性**<br>
  使跨站请求带有合法的认证信息。

- **不依赖用户主动操作**<br>
  用户只需访问攻击页面，无需点击任何按钮。

- **绕过同源策略**<br>
  同源策略限制脚本跨域访问响应数据，但不阻止浏览器发送跨域请求。

---

### 四、示例场景

用户登录 `bank.com`，保持登录状态。攻击者在 `evil.com` 页面放置：

```html
<img src="https://bank.com/transfer?amount=10000&to=attacker" />
````

用户访问 `evil.com` 时，浏览器自动携带 `bank.com` 的 Cookie，触发转账请求。

</details>

## 17. 使用Cookie的SameSite属性如何阻止CSRF {#question-subjective-f81aa95f5e99}

### 题目要点

* 准确描述 SameSite 限制 Cookie 发送的机制
* 解释不同取值对跨站请求携带 Cookie 的影响
* 阐述 SameSite 阻断 CSRF 的原理和实际效果
* 强调实际应用中结合其他防护手段的重要性

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 SameSite 属性的安全意义及其在防止 CSRF 中的作用<br>
面试官想确认候选人能正确解释 SameSite 如何限制跨站请求携带 Cookie，从而降低 CSRF 风险。

#### ● 熟悉 SameSite 属性的不同取值及实际效果

---

### 参考答案

### 一、SameSite 属性简介

- `SameSite` 是 Cookie 的一个属性，用于控制 Cookie 在跨站请求中是否被浏览器发送。
- 通过限制 Cookie 发送范围，减少恶意跨站请求携带认证信息的风险。

---

### 二、SameSite 的取值及含义

| 值        | 描述                                                    | 防止 CSRF 效果                        |
|-----------|---------------------------------------------------------|-------------------------------------|
| `Strict`  | 完全禁止跨站点请求携带 Cookie，只有同站请求携带。         | 最大程度阻止所有跨站请求带 Cookie，强力防护 CSRF |
| `Lax`     | 允许部分“安全”跨站请求（如导航 GET 请求）携带 Cookie。     | 阻止大部分跨站写操作请求，兼顾安全与用户体验  |
| `None`    | 允许所有跨站请求携带 Cookie，但必须同时设置 `Secure` 属性。 | 不阻止跨站请求携带 Cookie，不防护 CSRF      |

---

### 三、SameSite 如何阻止 CSRF

- CSRF 攻击依赖浏览器在跨站请求中自动携带用户 Cookie。<br>
- `SameSite=Strict` 会阻止浏览器在跨站请求时发送任何 Cookie，即使用户已登录，恶意请求也不会携带认证信息，服务器无法识别用户身份，从而阻断 CSRF 攻击链条。<br>
- `SameSite=Lax` 则在常见的跨站 GET 导航中允许携带 Cookie，但会阻止跨站 POST 或 AJAX 写操作，减少大多数 CSRF 风险，同时不影响正常用户跳转体验。

---

### 四、实际示例

```http
Set-Cookie: sessionid=abc123; SameSite=Strict; Secure; HttpOnly
````

* 当用户在 `evil.com` 页面尝试通过表单提交或 AJAX 请求访问 `example.com` 时，浏览器不会携带该 Cookie。
* 服务器无法识别用户身份，拒绝操作。

---

### 五、注意事项

* 若设置 `SameSite=None`，必须同时设置 `Secure`，且仅限 HTTPS 连接，否则 Cookie 会被浏览器忽略。
* `SameSite` 不是万能的 CSRF 解决方案，仍需结合其他防护措施（如 CSRF Token）。

---

### 六、总结

| SameSite 值 | 作用范围              | 对 CSRF 的防护能力     |
| ---------- | ----------------- | ---------------- |
| Strict     | 同站点请求携带 Cookie    | 最强，完全阻断跨站请求      |
| Lax        | 安全跨站导航允许携带 Cookie | 较强，阻断大部分写操作跨站请求  |
| None       | 所有跨站请求携带 Cookie   | 无防护，需要 Secure 支持 |

</details>

## 18. new 一个对象的实现 {#question-subjective-0422f231961d}

- 如果构造函数返回一个对象，new操作的结果是什么？
- 如果返回基本类型呢？
- 如何通过箭头函数创建的对象，使用new会怎样？

### 题目要点

* 清晰描述 `new` 的创建流程和返回机制
* 理解返回对象覆盖默认实例的细节
* 知晓箭头函数不能用作构造函数的底层原因及错误表现

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 `new` 操作符的底层实现机制<br>
#### ● 掌握构造函数返回对象与基本类型时 `new` 的行为差异<br>
#### ● 了解箭头函数作为构造函数的限制及运行时错误

---

### 参考答案

### 一、`new` 操作符的原理说明

- `new` 是 JavaScript 创建实例对象的关键字，用于调用构造函数并返回新对象。<br>
- 执行过程包含四步：

  1. 创建一个新对象，继承构造函数的 `prototype` 属性。<br>
  2. 将构造函数的 `this` 指向这个新对象。<br>
  3. 执行构造函数代码，修改 `this`。<br>
  4. 返回构造函数返回的对象（如果返回的是对象），否则返回新创建的对象。

---

### 二、构造函数返回对象与基本类型时的区别

#### 1. 构造函数返回一个对象

- 如果构造函数显式返回一个对象类型（非 `null`），`new` 表达式的结果就是该对象。<br>
- **示例：**

```js
function Person() {
  this.name = 'Alice';
  return { name: 'Bob' };
}
const p = new Person();
console.log(p.name); // 输出 'Bob'
````

* 说明：构造函数返回了新对象，替代了默认的 `this`。

#### 2. 构造函数返回基本类型（`string`, `number`, `boolean`, `null`, `undefined`）

* `new` 操作符会忽略返回的基本类型值，仍返回新创建的对象（即 `this`）。
* **示例：**

```js
function Person() {
  this.name = 'Alice';
  return 123;
}
const p = new Person();
console.log(p.name); // 输出 'Alice'
```

---

### 三、使用箭头函数创建对象与 `new`

* 箭头函数没有自己的 `this`，且**无法作为构造函数使用**。

* 使用 `new` 调用箭头函数会抛出错误：
  `TypeError: arrow functions cannot be used as constructors`

* **示例：**

```js
const Person = () => {
  this.name = 'Alice';
};
const p = new Person(); // 报错 TypeError
```

---

### 四、总结与补充

| 场景             | `new` 返回值     | 备注                       |
| -------------- | ------------- | ------------------------ |
| 构造函数不返回或返回基本类型 | 新创建对象（`this`） | 默认行为                     |
| 构造函数返回对象       | 返回该对象         | 覆盖默认新对象                  |
| 箭头函数 + new     | 报错，不能作为构造函数   | 箭头函数无 `[[Construct]]` 方法 |

</details>

## 19. 0.1 + 0.2 !== 0.3，为什么 {#question-subjective-251e5dd4c35f}

### 题目要点

* 能准确讲解 IEEE 754 浮点数存储机制
* 理解二进制与十进制小数转换导致的误差来源
* 给出合理的浮点数比较解决方案

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浮点数在计算机中的表示方式<br>
#### ● 掌握 IEEE 754 双精度浮点数标准及其精度误差<br>
#### ● 能解释 JavaScript 中常见浮点数精度问题的根本原因

---

### 参考答案

### 一、浮点数的二进制表示原理

- JavaScript 使用 IEEE 754 双精度浮点数格式（64 位）表示所有数字类型。<br>
- 浮点数由三部分组成：符号位、指数位、尾数位（小数部分）。<br>
- 许多十进制小数无法被精确转换为二进制小数，类似于 `1/3` 不能用有限小数表达。

---

### 二、为什么 `0.1` 和 `0.2` 不能精确表示？

- 十进制的 `0.1` 转换为二进制是无限循环小数，计算机只能截断存储近似值。<br>
- 同理，`0.2` 也不能被精确表示。<br>
- 当这两个近似值相加时，误差累积，导致结果不是精确的 `0.3`。

---

### 三、`0.1 + 0.2 !== 0.3` 的具体表现

```js
console.log(0.1 + 0.2);       // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
````

* 实际相加结果是 `0.30000000000000004`，大于 `0.3`，导致严格相等判断失败。

---

### 四、解决方案与建议

* 避免直接用浮点数比较，改用**误差范围判断**（如 EPSILON）：

```js
const isEqual = Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON;
console.log(isEqual); // true
```

* 对于财务计算，使用整数（如分为单位）或专门的精度库（如 decimal.js）避免误差。

---

### 五、总结

| 关键点        | 说明                 |
| ---------- | ------------------ |
| 浮点数二进制近似存储 | 十进制小数无法精确转成有限二进制小数 |
| 计算误差累积     | 浮点加法存在微小误差导致结果非精确  |
| 直接比较易失败    | 浮点数相等判断要考虑精度误差     |

</details>

## 20. 如何通过CSS Box Model计算元素占据的总宽度 {#question-subjective-36ff9015019d}

### 题目要点

* 准确区分 `box-sizing` 不同模式的计算方式
* 明确 `margin` 不包含在盒模型中，但影响布局占位
* 熟练掌握实际开发中如何计算与调试元素总宽度

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 CSS 盒模型（Box Model）构成及布局影响<br>
#### ● 能准确区分不同 `box-sizing` 模式下宽度的计算方式<br>
#### ● 能在实际项目中正确判断元素渲染尺寸与布局关系

---

### 参考答案

### 一、CSS 盒模型结构

每一个 HTML 元素在页面中都遵循一个标准的盒模型结构，包含：

1. **Content（内容区域）**：元素实际内容所占的宽度（由 `width` 控制）
2. **Padding（内边距）**：内容与边框之间的距离
3. **Border（边框）**：元素的边框厚度
4. **Margin（外边距）**：元素与外部元素之间的距离（不影响自身大小）

---

### 二、总宽度计算公式

默认（`box-sizing: content-box`）时：

```text
总宽度 = width + padding-left + padding-right + border-left + border-right
````

示例：

```css
.box {
  width: 200px;
  padding: 10px;
  border: 2px solid #000;
}
```

实际总宽度为：
`200 + 10 + 10 + 2 + 2 = 224px`

---

### 三、box-sizing 的影响

当设置：

```css
.box {
  box-sizing: border-box;
}
```

此时 `width` 指的是**包括 padding 和 border 在内的总宽度**。

* **计算方式变为：**

```text
内容宽度 = width - padding-left - padding-right - border-left - border-right
总宽度 = width（固定值）
```

上面例子中 `width: 200px`，padding 和 border 相同，总宽度仍为 `200px`。

---

### 四、是否包含 margin？

* `margin` 不包含在盒模型的总宽度中，但会影响元素与其他元素之间的布局距离。
* 如果考虑布局占位空间，则应加上 `margin` 值：

```text
布局宽度 = 总宽度 + margin-left + margin-right
```

---

### 五、如何准确获取总宽度（开发实用技巧）

* 使用浏览器 DevTools 查看 Computed 样式，查看 Width、Padding、Border。
* 通过 JS 获取真实宽度：

```js
const el = document.querySelector('.box');
const totalWidth = el.offsetWidth; // 包含 padding + border，不含 margin
const fullWidth = el.offsetWidth +
  parseFloat(getComputedStyle(el).marginLeft) +
  parseFloat(getComputedStyle(el).marginRight);
```

---

### 六、总结

| 模式                | `width` 表示的含义             | 总宽度计算方式                          |
| ----------------- | ------------------------- | -------------------------------- |
| `content-box`（默认） | 内容区域宽度                    | width + padding + border         |
| `border-box`      | 内容 + padding + border 总宽度 | width（已包含 padding 和 border，无需再加） |

</details>

## 21. 箭头函数的this是如何绑定的？与普通函数在this处理上的根本区别是什么 {#question-subjective-94ec099f4b9b}

### 题目要点

* 箭头函数的 `this` 是定义时从外层作用域捕获的，**不可变**
* 普通函数的 `this` 是运行时动态确定的，**可通过 `call/apply/bind` 修改**
* 了解两者的适用场景和易错点

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解箭头函数中 `this` 的绑定规则及其语义<br>
#### ● 掌握普通函数中 `this` 的动态绑定特性<br>
#### ● 能清晰对比两者的行为差异，理解应用场景和误区

---

### 参考答案

### 一、箭头函数的 `this` 绑定机制

- 箭头函数**没有自己的 `this`**，它的 `this` 是**在定义时决定的**，来自**最近的外层非箭头函数作用域**。<br>
- 换句话说，它是**词法作用域绑定（lexical this）**。

#### 示例：

```js
function Outer() {
  this.value = 'outer';
  const arrow = () => {
    console.log(this.value);
  };
  arrow(); // 'outer'
}
new Outer();
````

* 上例中 `arrow` 的 `this` 指向 `Outer` 函数的实例对象。

---

### 二、普通函数的 `this` 绑定规则

* 普通函数的 `this` 是**运行时动态绑定的**，具体取决于调用方式：

| 调用方式                  | `this` 指向                |
| --------------------- | ------------------------ |
| 普通函数调用                | 全局对象（严格模式下为 `undefined`） |
| 对象方法调用                | 当前对象                     |
| `call`/`apply`/`bind` | 显式绑定目标                   |
| 构造函数调用（`new`）         | 新创建的实例对象                 |

#### 示例：

```js
function normal() {
  console.log(this);
}
normal();           // 浏览器中是 window，严格模式是 undefined
normal.call({ x: 1 }); // { x: 1 }
```

---

### 三、箭头函数和普通函数 `this` 的根本区别

| 特性                  | 箭头函数                      | 普通函数                  |
| ------------------- | ------------------------- | --------------------- |
| `this` 来源           | 定义时静态绑定，继承外层 `this`       | 调用时动态绑定               |
| 是否可作为构造函数使用         | ❌ 不可以（没有 `[[Construct]]`） | ✅ 可以配合 `new` 使用       |
| 是否受 `call/apply` 影响 | ❌ 不影响 `this`              | ✅ 可显式更改 `this`        |
| 是否有 `arguments`     | ❌ 没有自己的 `arguments`       | ✅ 有自己的 `arguments` 对象 |

---

### 四、常见误区与面试陷阱

#### 误区 1：误以为箭头函数可以绑定 `this`

```js
const fn = () => { console.log(this); };
fn.call({ x: 1 }); // 仍然是箭头函数定义时的 this，不会变
```

#### 误区 2：箭头函数不适合用作事件回调的处理函数（若需要绑定 `this`）

```js
element.addEventListener('click', () => {
  this.handleClick(); // 如果 this 不是预期对象，可能报错
});
```

---

### 五、适用场景推荐

* **箭头函数适合用于：**

  * 回调函数中需保持上下文 `this`（如：`map`、`setTimeout` 等）
  * React 中函数组件、Hooks

* **普通函数适合用于：**

  * 需要 `this` 动态绑定的逻辑
  * 构造函数（如自定义类、服务、组件）

</details>

## 22. 实现一个apply {#question-subjective-1683aa86e8b6}

### 题目要点

* 明确 `apply` 的功能：绑定 `this`，并传入参数数组
* 能手写核心逻辑：给 context 挂载函数、执行、删除
* 注意参数校验、安全性（防止污染原对象）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握 JavaScript 中函数调用上下文绑定原理（`this` 绑定）<br>
#### ● 理解 `apply` 的作用：改变函数的 `this`，并以数组形式传参<br>
#### ● 能实现原型链扩展，手写高仿版 apply 方法

---

### 参考答案

### 一、apply 的核心作用

```js
func.apply(thisArg, [arg1, arg2, ...])
````

* **作用**：调用 `func`，并将 `this` 设置为 `thisArg`，将参数数组展开传入函数。
* **与 call 的区别**：`call` 接收参数列表，`apply` 接收数组。

---

### 二、实现一个简化版 apply

#### ✅ 基本实现（兼容 ES5）

```js
Function.prototype.myApply = function(context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply must be called on a function');
  }

  context = context || globalThis; // window / global / self
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  let result;
  if (!args) {
    result = context[fnSymbol]();
  } else {
    if (!Array.isArray(args)) {
      throw new TypeError('Second argument must be an array');
    }
    result = context[fnSymbol](...args);
  }

  delete context[fnSymbol];
  return result;
};
```

---

### 三、使用示例

```js
function greet(name, age) {
  return `${this.title}: ${name}, age ${age}`;
}

const obj = { title: 'Manager' };

console.log(greet.myApply(obj, ['Alice', 30]));
// 输出：Manager: Alice, age 30
```

---

### 四、关键点解析

* ✅ 通过 `Symbol` 创建临时属性，避免污染目标对象。
* ✅ 通过展开运算符 `...args` 实现参数数组传递。
* ✅ 手动清理临时属性，防止内存泄漏或污染对象。

---

### 五、注意事项与扩展

* ✔️ `context` 为 `null` 或 `undefined` 时，自动绑定到全局对象（`window` 或 `globalThis`）
* ❗ 如果函数使用了箭头函数，`this` 绑定不会受 apply 影响
* ✔️ 不支持类构造器（`new`）场景调用

</details>

## 23. 如果让你设计一个前端的微应用沙箱，如何隔离JS和CSS？可能会遇到什么问题 {#question-subjective-d8b1795a388b}

### 题目要点

* 必须同时考虑 JS 与 CSS 的隔离机制
* 能够解释 `Proxy` 沙箱、样式前缀、Shadow DOM 等多种实现原理
* 能列出隔离机制中可能遇到的问题和合理应对方案
* 突出微前端系统中子应用的独立性与运行安全性

<details>
<summary>参考答案</summary>

### 考察点

#### ● 了解微前端架构中的沙箱隔离设计原则<br>
#### ● 掌握 JS 运行环境隔离与样式污染防护的常见技术手段<br>
#### ● 能识别沙箱隔离过程中可能遇到的实际问题与边界情况

---

### 参考答案

### 一、背景说明

在微前端架构中，多个子应用可能由不同团队维护、运行在同一页面，**必须保证它们之间 JS 和 CSS 的互不干扰**。因此，需要引入“沙箱”机制，对每个子应用进行隔离。

---

### 二、JS 隔离策略

#### 1. 使用 Proxy + `with` 实现运行时沙箱

```js
const fakeWindow = new Proxy({}, {
  get: (target, key) => window[key],
  set: (target, key, value) => {
    target[key] = value;
    return true;
  }
});

function runInSandbox(code) {
  with (fakeWindow) {
    eval(code); // 沙箱执行
  }
}
````

* ✅ 拦截变量读写，实现局部作用域隔离
* ✅ 子应用定义的全局变量不会污染宿主或其他子应用

#### 2. 限制全局副作用注入

* 控制 `window.addEventListener`、`setTimeout` 等 API 的调用与释放
* 子应用卸载时统一清理挂载的全局副作用

---

### 三、CSS 隔离策略

#### 方案一：CSS Scope + 前缀化

* **做法**：为子应用所有样式添加特定前缀（如 `.app1`），并在 HTML 元素上加命名空间。
* **工具**：使用 `postcss-prefix-selector` 进行预处理。

```css
/* 作用域前缀隔离 */
.app1 .button {
  color: red;
}
```

#### 方案二：Shadow DOM（Web Components）

* 利用 Shadow DOM 隔离样式作用域：

```js
const container = document.getElementById('app');
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = `<style>.btn { color: red; }</style><div class="btn">Click</div>`;
```

* ✅ 真正做到样式隔离，不影响外部，也不被外部影响
* ❗️兼容性及 CSS 继承限制较多，动态样式难处理

#### 方案三：运行时样式隔离（如 CSS-in-JS、动态插入 style 标签管理）

* 通过运行时对 `&lt;style&gt;` 标签打标识、劫持 `document.head.appendChild` 实现样式注册与卸载
* 应用卸载时清除插入的 style 标签，避免污染

---

### 四、常见问题与挑战

#### 1. 全局变量污染

* 子应用通过 `window.xxx = ...` 挂载变量，影响主应用或其他子应用
* **解决**：使用 `Proxy` 拦截变量读写，统一管理生命周期

#### 2. 样式覆盖/污染

* 全局类名冲突导致不同子应用 UI 错乱
* **解决**：样式作用域隔离（前缀、Shadow DOM）

#### 3. 动态加载 JS/CSS

* 动态 `script` 或 `style` 标签注入难被管理（如 CDN 资源）
* **解决**：劫持 DOM API，比如 `appendChild`、`insertBefore`，注册到当前子应用的资源池中

#### 4. 第三方库共享与隔离的权衡

* 有些库需要共享（如 Vue、React），有些必须隔离（如业务组件）
* **解决**：采用主应用提供共享依赖、子应用 peer 依赖的机制，结合模块联邦（Module Federation）

#### 5. Shadow DOM 限制

* CSS 不继承，字体、全局变量、CSS变量等无法穿透
* 动态样式注入（如 `element-ui`）无法直接作用于 Shadow DOM 内部

---

### 五、总结

| 目标     | 方案                     | 优点           | 缺点            |
| ------ | ---------------------- | ------------ | ------------- |
| JS 隔离  | Proxy + with 沙箱        | 实现运行时隔离，可控性强 | 性能消耗，调试复杂     |
| CSS 隔离 | 前缀化处理 / Shadow DOM     | 有效隔离样式       | 兼容性或动态样式处理较麻烦 |
| 样式清理   | 劫持 DOM API 插入/移除 style | 卸载自动清理，效果可控  | DOM 劫持复杂度高    |

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-53/round-76/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-53/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-53/round-78/index.md" >}}) →
