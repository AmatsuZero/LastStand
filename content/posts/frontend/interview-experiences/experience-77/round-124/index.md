+++
title = "腾讯-1年社招-前端面试 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/77"
experienceId = 77
roundId = 124
roundOrder = 1
company = "腾讯"
date = "2025-09-04T14:50:28.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-77/round-123/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-77/_index.md" >}}) · 已是最后一轮 →

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你的第一个项目 {#question-subjective-052576c3597e}

### 题目要点

突出难点与解决方案，亮点强调可扩展性与价值。

<details>
<summary>参考答案</summary>

第一个项目是一个内部管理系统，主要功能是数据可视化和表单管理。难点在于表单项类型复杂、交互逻辑多。解决方案是抽象出一套动态表单引擎，通过 JSON 配置生成组件，既降低了开发成本，也提升了可扩展性。项目的亮点在于统一了交互和样式规范，同时通过可配置化提高了可维护性。

</details>

## 2. 为什么选择 Vue3 + Vite 而非 React/Webpack {#question-subjective-5166f4b076aa}

### 题目要点

Vue3 → 响应式系统和语法优势；Vite → 构建性能显著提升。

<details>
<summary>参考答案</summary>

Vue3 在响应式系统上引入了 Proxy，更适合处理复杂响应式数据，语法上对团队更友好。Vite 基于 ESBuild 和原生 ESM，构建速度远快于 Webpack，特别是在开发阶段的冷启动和热更新体验明显更优。而 Webpack 尽管生态成熟，但在开发构建效率上落后。

</details>

## 3. Vite 的构建速度比 Webpack 快多少 {#question-subjective-1ecf3069eb75}

### 题目要点

冷启动快一个数量级，HMR 延迟极低，原因是按需编译 vs 整包构建。

<details>
<summary>参考答案</summary>

在实际项目中，冷启动通常能快 10 倍以上。例如一个中大型项目，Webpack 启动需要 20-30 秒，Vite 一般在 1-3 秒即可完成；热更新延迟也从秒级缩短到 100ms 以内。这是因为 Vite 基于原生 ESM 做按需编译，而 Webpack 是整包构建。

</details>

## 4. FCP 从 3.2s 降到 1.1s，具体做了哪些优化？ {#question-subjective-40f1ae7b12e8}

### 题目要点

构建优化 + 资源优化 + 网络优化 + SSR 骨架屏。

<details>
<summary>参考答案</summary>

主要从几个方面：

构建产物优化：使用 SplitChunks 减少主包体积，启用 Tree Shaking。

静态资源优化：关键资源内联，非关键资源延迟加载，图片懒加载。

服务端优化：开启 gzip/brotli 压缩，利用 HTTP2 多路复用。

渲染优化：SSR 直出骨架屏，首屏减少 JS 逻辑，推迟非关键计算。
最终显著降低了首屏渲染时间。

</details>

## 5. 图片优化具体做了哪些？ {#question-subjective-f06c616e91f5}

### 题目要点

格式、尺寸、加载、传输四方面优化。

<details>
<summary>参考答案</summary>

根据不同场景做了几类优化：

格式优化：用 WebP/AVIF 替换传统 JPEG/PNG。

尺寸优化：通过 responsive image 或 CDN 自动裁剪。

加载优化：首屏关键图片内联 base64，小图用 sprite，大图懒加载。

传输优化：开启压缩，利用缓存头减少重复请求。

</details>

## 6. 浏览器缓存策略讲一下。 {#question-subjective-1451aec1ccf7}

### 题目要点

强缓存（Expires、Cache-Control），协商缓存（Last-Modified、ETag），生产实践是 hash + 强缓存。

<details>
<summary>参考答案</summary>

主要分为强缓存和协商缓存。强缓存通过 Expires 或 Cache-Control 控制，命中时不会发请求；协商缓存依赖 Last-Modified/If-Modified-Since 或 ETag/If-None-Match，由服务器判断是否更新。实际生产中静态资源通常使用强缓存，并结合文件名 hash 保证更新，接口数据更倾向于协商缓存。

</details>

## 7. Axios 是如何封装的？ {#question-subjective-5a27cec404d3}

### 题目要点

三层封装：基础配置 → 业务 API → 工具层统一处理。

<details>
<summary>参考答案</summary>

在项目里做了三层封装：

基础层：配置 baseURL、超时、请求/响应拦截器，统一处理 token、错误提示。

业务层：根据模块封装方法，如 userApi、orderApi。

工具层：结合统一异常处理和重试机制，返回统一格式，避免调用方分散处理。

</details>

## 8. 拦截器如何处理 401 令牌失效？ {#question-subjective-5f1181a00e64}

### 题目要点

401 → 刷新 token，失败 → 重定向；并发场景需要队列化处理。

<details>
<summary>参考答案</summary>

在响应拦截器中统一捕获 401 错误，触发刷新 token 的逻辑。如果 refresh token 也过期，则跳转登录页。为避免并发请求多次刷新，可以设计请求队列，在刷新成功后统一重试。

</details>

## 9. 如何区分需要重试的 500 错误？ {#question-subjective-2b4e77eb89fe}

### 题目要点

根据错误类型区分，网络类可重试，逻辑类不可；结合幂等与退避。

<details>
<summary>参考答案</summary>

并不是所有 500 都能重试。一般会结合错误码或响应体区分，比如网络抖动、网关超时可重试，而逻辑错误则不可。可配合幂等接口 + 指数退避重试策略，避免请求风暴。

</details>

## 10. 实现一个通用的弹出框组件 {#question-subjective-de4b6ce05028}

### 题目要点

分层抽象 → 通用 Modal + 插槽；API 化控制；Promise 化返回结果。

<details>
<summary>参考答案</summary>

采用插槽 + 组件抽象的方式：

基础层提供 Modal 组件，负责遮罩层、居中定位、动画。

插槽传入内容，保证灵活性。

提供 API 控制显隐，支持 Promise 化调用（如 confirm 返回布尔值）。
同时抽象成单例调用，避免多个弹窗重叠冲突。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-77/round-123/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-77/_index.md" >}}) · 已是最后一轮 →
