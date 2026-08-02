+++
title = "阿里巴巴-社招-2年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/62"
experienceId = 62
roundId = 100
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T12:14:53.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-62/round-99/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-62/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** call、apply和bind、性能优化、浏览器渲染过程、浏览器的缓存机制

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 假设现在有一个老项目需从React 17升级至React 18，你会怎么做 {#question-subjective-83d197f5cd81}

### 题目要点

* 先升级 react/react-dom 版本，再更改根渲染方式为 `createRoot`
* 理解 React 18 并发特性，调整相关组件代码
* 确认并升级第三方依赖，保证兼容性
* 充分测试，监控性能，平滑迁移

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React 18 的新特性及其对应用的影响**
* **掌握 React 18 升级步骤及兼容性处理**
* **了解新版本的渲染机制变化（如并发特性）**
* **熟悉常见问题排查与升级风险规避**

---

## 二、参考答案

### 2.1 升级前准备

* **阅读官方升级指南**（React 官方文档提供详尽升级说明）
* **检查项目依赖版本**，确保 React 相关依赖（如 ReactDOM、react-scripts 等）兼容 React 18
* **备份代码及建立测试环境**，保证升级过程可回滚

### 2.2 主要升级步骤

#### 1）升级 React 和 ReactDOM 版本

```bash
npm install react@18 react-dom@18
```

或

```bash
yarn add react@18 react-dom@18
```

#### 2）更新根节点渲染方式

React 18 引入了新的根 API：`createRoot`，替代 React 17 的 `ReactDOM.render`。

旧写法：

```js
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));
```

新写法：

```js
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

#### 3）处理并发特性和新 Hooks

* React 18 默认启用并发特性（concurrent features）
* 需检查组件是否依赖于 React 生命周期的执行顺序
* 可能需要调整或使用 `useTransition`、`startTransition` 控制优先级

#### 4）升级第三方库和依赖

* 核实项目使用的第三方库是否支持 React 18
* 更新不兼容的库或查找替代方案

---

### 2.3 兼容性和回退策略

* React 18 的 `createRoot` API 可渐进式替换，支持同时使用旧 API
* 可以在过渡期继续使用 `ReactDOM.render`，但建议尽快切换
* 注意 React 18 对 Suspense、自动批处理等行为的改变

---

### 2.4 升级后测试与调优

* **全面测试**功能，尤其是异步渲染相关场景
* 使用 React DevTools 新版本，监测并发模式和渲染行为
* 优化性能，利用 React 18 新特性（自动批处理、并发渲染）提升体验

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：忽略根节点渲染 API 变更

* 直接升级 React 版本但未更改 `ReactDOM.render` 导致行为异常

#### ❌ 误区二：对并发模式缺乏理解导致状态错乱

* 并发渲染可能导致副作用和状态更新顺序发生变化

#### ❌ 误区三：第三方依赖未升级，造成兼容性问题

* 库版本不兼容 React 18 新机制，出现渲染或事件异常

</details>

## 2. 若升级导致某核心组件崩溃，如何快速定位并回滚 {#question-subjective-258e1bdef56f}

### 题目要点

* 先复现并定位错误，重点查看报错堆栈与源码差异
* 利用版本控制快速回滚完整版本
* 发布稳定回滚版本恢复服务
* 加强监控和灰度，减少升级风险

<details>
<summary>参考答案</summary>

## 一、考察点

* **掌握升级后问题快速定位的方法和工具**
* **熟悉回滚流程及风险控制措施**
* **了解如何通过日志和监控辅助问题排查**
* **具备应急响应和版本管理操作能力**

---

## 二、参考答案

### 2.1 快速定位问题步骤

#### 1）复现问题

* 通过错误日志（浏览器控制台、监控系统）确认崩溃组件和复现步骤
* 在本地或测试环境复现，确认崩溃原因大致范围

#### 2）查看报错信息和堆栈

* 重点关注错误堆栈定位出错代码行和模块
* 利用 Source Map 定位源码位置

#### 3）对比升级前后差异

* 重点对比核心组件代码、依赖版本、调用方式的变更
* 确认是否因 React 18 新特性（如并发模式）引起兼容性问题

#### 4）借助调试工具

* React DevTools 查看组件树状态、Hooks 状态
* 断点调试核心组件，逐步排查异常触发点

---

### 2.2 回滚策略

#### 1）使用版本控制回滚

* 快速将项目代码回退到升级前稳定版本
* 确认依赖版本同步回退，保证环境一致

#### 2）发布回滚版本

* 尽快发布回滚版本到测试和线上环境，恢复稳定性
* 通知团队及相关人员问题已控制

#### 3）同步排查修复

* 在回滚版本基础上定位问题根因，修复后再进行升级尝试

---

### 2.3 预防与优化建议

* **分阶段升级与灰度发布**，减少大面积影响
* **完善监控和报警**，第一时间感知异常
* **建立自动化回滚流程**，提升响应速度
* **充分回归测试**，覆盖核心路径和边界场景

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：盲目线上热修补，忽略根本原因

* 可能导致隐患未消除，后续故障风险增大

#### ❌ 误区二：回滚不彻底，仅回退部分改动

* 版本不一致，造成更多不可预期问题

#### ❌ 误区三：缺乏有效日志和监控，难以准确定位

* 定位时间延长，影响用户体验和团队效率

</details>

## 3. 升级完之后你发现项目首屏加载耗时5秒，应该如何优化 {#question-subjective-e7ce1c5b2e23}

### 题目要点

* 先用工具定位瓶颈，明确首屏阻塞点
* 代码分割、按需加载减小首屏 JS 体积
* 预加载关键资源，压缩和缓存静态资源
* 避免阻塞主线程，优化图片和字体加载
* 考虑 SSR 或静态预渲染方案
* 持续监控性能指标，迭代优化

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解首屏加载时间（First Contentful Paint, FCP）及其影响因素**
* **掌握前端性能优化的常用策略和手段**
* **能够结合具体场景进行针对性分析与优化**
* **熟悉浏览器加载流程及资源加载优先级**

---

## 二、参考答案

### 2.1 诊断阶段

#### 1）使用性能分析工具定位瓶颈

* 利用 Chrome DevTools 的 Performance、Network 面板
* 使用 Lighthouse、WebPageTest 等工具，获取详细性能报告
* 重点关注首屏渲染所需的关键资源、JS 执行时间、阻塞资源

#### 2）分析影响首屏加载的关键因素

* JS 包体积过大导致解析和执行慢
* 首屏关键资源未优先加载或阻塞
* 资源请求过多或服务器响应慢
* 资源未压缩或缓存配置不足
* 渲染阻塞的同步操作或第三方脚本

---

### 2.2 优化方案

#### 1）代码分割和按需加载

* 利用 React.lazy + Suspense 或路由级代码分割，减小首屏 JS 体积
* 按需加载非关键模块和组件

#### 2）资源预加载和预解析

* 使用 `&lt;link rel="preload"&gt;` 优先加载关键 CSS、JS
* 利用 HTTP/2 多路复用优化并发请求

#### 3）静态资源压缩和缓存

* 启用 gzip 或 brotli 压缩传输
* 合理配置缓存策略，利用浏览器缓存减少重复加载

#### 4）减少阻塞主线程操作

* 避免复杂同步计算，拆分任务或异步执行
* 使用 Web Worker 处理计算密集型任务

#### 5）图片和字体优化

* 图片懒加载、格式转换（WebP 等）
* 字体加载优化，减少 FOIT/FOUT

#### 6）服务端渲染（SSR）或静态预渲染

* 利用 SSR 减少客户端渲染时间，提高首屏速度
* 对静态页面使用预渲染（如 Next.js 静态导出）

#### 7）第三方脚本管理

* 延迟加载或异步加载第三方 JS
* 移除不必要的第三方依赖

---

### 2.3 升级相关专项优化

* 确认 React 18 并发特性是否影响首次渲染，调整 `startTransition` 使用
* 升级构建工具和依赖，启用更高效的打包和 Tree Shaking
* 优化服务端响应速度，使用 CDN 加速资源分发

---

### 2.4 持续监控和迭代

* 持续采集性能指标（如 FCP、LCP）
* 定期分析用户实际加载体验，动态调整优化策略

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：只关注加载时间，不关注渲染关键路径

* 需聚焦关键渲染路径，优先保证首屏可视内容快速呈现

#### ❌ 误区二：盲目压缩所有资源，忽略兼容性和效果

* 压缩需兼顾兼容和效果，避免图片质量严重下降等问题

#### ❌ 误区三：忽视网络环境差异，优化效果单一

* 需考虑不同用户网络环境，灵活采用多种优化方案

</details>

## 4. 强缓存和协商缓存分别是什么？ {#question-7f7e5941-1079-476a-8a62-8ca51879c7ab}

> 题库原题：[强缓存和协商缓存分别是什么？](https://fe.ecool.fun/topic/7f7e5941-1079-476a-8a62-8ca51879c7ab)

### 题目要点

浏览器缓存是一种在本地磁盘上保存访问过的资源副本的机制，其目的是提高网页加载速度和节省网络流量。

以下是浏览器缓存的优点和分类的总结：

**优点：**

1. 减少重复数据请求，节省流量。
2. 降低服务器压力，提升网站性能。
3. 加快客户端加载网页速度，提升用户体验。

**浏览器缓存分类：**

- **强缓存**：浏览器直接从本地缓存获取资源，无需与服务器通信。
- **协商缓存**：浏览器与服务器进行一次通信，由服务器决定是否使用缓存。

**强缓存与协商缓存的区别：**

- 强缓存无需向服务器发送请求，而协商缓存需要。
- 在Chrome中，强缓存的请求状态码为200 (from cache)，而协商缓存为304 (not modified)。

**请求流程：**

1. 浏览器检查缓存资源的header信息，判断是否命中强缓存。
2. 如果未命中强缓存，浏览器发送请求到服务器，携带协商缓存的字段（如IF-Modified-Since或IF-None-Match）。

**强缓存控制：**

- **Expires**：HTTP 1.0规范，指定资源失效的绝对时间。
- **Cache-Control**：HTTP 1.1规范，常用max-age指定资源的相对有效期。

**协商缓存控制：**

- **Last-Modified/If-Modified-Since**：基于文件最后修改时间。
- **Etag/If-None-Match**：基于服务器生成的资源唯一标识。

**注意事项：**

- Cache-Control的优先级高于Expires。
- 如果服务器返回304 Not Modified，则不会更新Last-Modified，但会返回新的ETag。
- ETag的生成方式由服务器决定，通常使用哈希值。

<details>
<summary>参考答案</summary>

这里说的缓存是指浏览器（客户端）在本地磁盘中对访问过的资源保存的副本文件。

浏览器缓存主要有以下几个优点：

* 减少重复数据请求，避免通过网络再次加载资源，节省流量。
* 降低服务器的压力，提升网站性能。
* 加快客户端加载网页的速度， 提升用户体验。

浏览器缓存分为强缓存和协商缓存，两者有两个比较明显的区别：

* 如果浏览器命中强缓存，则不需要给服务器发请求；而协商缓存最终由服务器来决定是否使用缓存，即客户端与服务器之间存在一次通信。
* 在 chrome 中强缓存（虽然没有发出真实的 http 请求）的请求状态码返回是 200 (from cache)；而协商缓存如果命中走缓存的话，请求的状态码是 304 (not modified)。 不同浏览器的策略不同，在 Fire Fox中，from cache 状态码是 304.

## 请求流程

浏览器在第一次请求后缓存资源，再次请求时，会进行下面两个步骤：

* 浏览器会获取该缓存资源的 header 中的信息，根据 response header 中的 expires 和 cache-control 来判断是否命中强缓存，如果命中则直接从缓存中获取资源。
* 如果没有命中强缓存，浏览器就会发送请求到服务器，这次请求会带上 IF-Modified-Since 或者 IF-None-Match, 它们的值分别是第一次请求返回 Last-Modified或者 Etag，由服务器来对比这一对字段来判断是否命中。如果命中，则服务器返回 304 状态码，并且不会返回资源内容，浏览器会直接从缓存获取；否则服务器最终会返回资源的实际内容，并更新 header 中的相关缓存字段。

## 强缓存

强缓存是根据返回头中的 Expires 或者 Cache-Control 两个字段来控制的，都是表示资源的缓存有效时间。

* Expires 是 http 1.0 的规范，值是一个GMT 格式的时间点字符串，比如 Expires:Mon,18 Oct 2066 23:59:59 GMT 。这个时间点代表资源失效的时间，如果当前的时间戳在这个时间之前，则判定命中缓存。有一个缺点是，失效时间是一个绝对时间，如果服务器时间与客户端时间偏差较大时，就会导致缓存混乱。而服务器的时间跟用户的实际时间是不一样是很正常的，所以 Expires 在实际使用中会带来一些麻烦。
* Cache-Control这个字段是 http 1.1 的规范，一般常用该字段的 max-age 值来进行判断，它是一个相对时间，比如 .Cache-Control:max-age=3600 代表资源的有效期是 3600 秒。并且返回头中的 Date 表示消息发送的时间，表示当前资源在 Date ~ Date +3600s 这段时间里都是有效的。不过我在实际使用中常常遇到设置了 max-age 之后，在 max-age 时间内重新访问资源却会返回 304 not modified ，这是由于服务器的时间与本地的时间不同造成的。当然 Cache-Control 还有其他几个值可以设置， 不过相对来说都很少用了：
    * no-cache 不使用本地缓存。需要使用协商缓存。
    * no-store直接禁止浏览器缓存数据，每次请求资源都会向服务器要完整的资源， 类似于 network 中的 disabled cache。
    * public 可以被所有用户缓存，包括终端用户和 cdn 等中间件代理服务器。
    * private 只能被终端用户的浏览器缓存。

如果 Cache-Control与 Expires 同时存在的话， Cache-Control 的优先级高于 Expires 。

## 协商缓存

协商缓存是由服务器来确定缓存资源是否可用。 主要涉及到两对属性字段，都是成对出现的，即第一次请求的响应头带上某个字, Last-Modified 或者 Etag，则后续请求则会带上对应的请求字段 If-Modified-Since或者 If-None-Match，若响应头没有 Last-Modified 或者 Etag 字段，则请求头也不会有对应的字段。

* Last-Modified/If-Modified-Since 二者的值都是 GMT 格式的时间字符串， Last-Modified 标记最后文件修改时间， 下一次请求时，请求头中会带上 If-Modified-Since 值就是 Last-Modified 告诉服务器我本地缓存的文件最后修改的时间，在服务器上根据文件的最后修改时间判断资源是否有变化， 如果文件没有变更则返回 304 Not Modified ，请求不会返回资源内容，浏览器直接使用本地缓存。当服务器返回 304 Not Modified 的响应时，response header 中不会再添加的 Last-Modified 去试图更新本地缓存的 Last-Modified， 因为既然资源没有变化，那么 Last-Modified 也就不会改变；如果资源有变化，就正常返回返回资源内容，新的 Last-Modified 会在 response header 返回，并在下次请求之前更新本地缓存的 Last-Modified，下次请求时，If-Modified-Since会启用更新后的 Last-Modified。
* Etag/If-None-Match， 值都是由服务器为每一个资源生成的唯一标识串，只要资源有变化就这个值就会改变。服务器根据文件本身算出一个哈希值并通过 ETag字段返回给浏览器，接收到 If-None-Match 字段以后，服务器通过比较两者是否一致来判定文件内容是否被改变。与 Last-Modified 不一样的是，当服务器返回 304 Not Modified 的响应时，由于在服务器上ETag 重新计算过，response header中还会把这个 ETag 返回，即使这个 ETag 跟之前的没有变化。

HTTP 中并没有指定如何生成 ETag，可以由开发者自行生成，哈希是比较理想的选择。

</details>

## 5. 配置Cache-Control: max-age=31536000后，如何强制客户端更新资源 {#question-subjective-90105dbd994d}

### 题目要点

* 理解 Cache-Control max-age 表示长期缓存
* 通过文件名指纹或查询参数版本号实现缓存更新
* 保持 HTML 文件较短缓存或 no-cache，确保入口更新
* 避免单纯依赖浏览器自动刷新，需构建时做好版本管理

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 HTTP 缓存机制及 Cache-Control 头的含义**
* **掌握强制刷新缓存的常用策略和实现方法**
* **了解版本控制对缓存更新的关键作用**
* **熟悉前端构建与部署中的缓存更新方案**

---

## 二、参考答案

### 2.1 Cache-Control: max-age=31536000 含义

* `max-age=31536000` 表示资源在缓存中最多存活 1 年（单位秒）
* 浏览器及中间缓存会在该时间内直接使用缓存，不会向服务器请求更新

---

### 2.2 强制客户端更新资源的常见方法

#### 1）资源文件名加版本号（文件名指纹）

* 通过构建工具（如 webpack）生成带 hash 的文件名，如 `app.abc123.js`
* 每次资源变更生成新的文件名，浏览器请求新文件，绕过缓存
* 是最推荐、最可靠的缓存更新策略

#### 2）URL 查询参数版本号

* 给资源 URL 添加版本号查询参数，如 `app.js?v=20230728`
* 查询参数变化被视为新资源，强制浏览器重新请求
* 兼容性好，但不如文件名指纹理想，且查询参数缓存策略有时复杂

#### 3）HTTP 协议强制缓存控制

* 通过配置 `Cache-Control: no-cache` 或 `must-revalidate`
* 允许浏览器缓存但每次请求时向服务器验证资源是否变更
* 但若已经配置了长缓存 max-age，通常需要配合资源版本变更使用

---

### 2.3 结合实际项目的推荐实践

* 采用构建工具自动生成带内容 hash 的文件名（如 webpack 的 `[contenthash]`）
* 配置静态资源服务器为长期缓存（Cache-Control max-age=31536000）
* 每次部署时只更新文件名不同的资源，确保客户端能自动拉取新资源
* 配合 HTML 模板中资源引用自动更新，确保入口文件指向最新版本资源

---

### 2.4 特殊场景的应对

* **HTML 文件缓存问题**
  HTML 文件一般不宜长缓存，设置较短缓存或 no-cache，确保客户端及时获取最新资源引用
* **手动刷新**
  用户可通过浏览器强制刷新（Ctrl+F5）绕过缓存，但不是自动方案
* **Service Worker 缓存**
  若使用 Service Worker，还需处理缓存更新逻辑，确保新版缓存替换旧缓存

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：只设置长缓存但不做版本控制

* 导致客户端永远加载旧资源，页面无法更新

#### ❌ 误区二：对静态资源和 HTML 统一设置长缓存

* HTML 不更新导致客户端引用旧版本资源，产生缓存死锁

#### ❌ 误区三：依赖浏览器自动刷新缓存

* 浏览器不会主动重新请求，必须版本号变化或用户手动刷新

</details>

## 6. 为什么ETag比Last-Modified更可靠 {#question-subjective-d0b8d66b2f4f}

### 题目要点

* ETag 基于内容生成，Last-Modified 基于时间戳
* ETag 精度高，能准确反映内容变更
* ETag 不依赖时间，同步问题少，更稳定
* 推荐结合使用，提升缓存验证效果

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 HTTP 缓存验证机制中的 ETag 和 Last-Modified 头**
* **掌握两者的工作原理及区别**
* **分析 ETag 在缓存一致性保障上的优势**
* **了解使用场景及适用性**

---

## 二、参考答案

### 2.1 核心概念解释

* **Last-Modified**
  表示资源最后修改的时间戳，服务器通过该时间判断资源是否发生变更
* **ETag**（实体标签）
  服务器生成的资源唯一标识符（通常为内容哈希或版本号），用于更精确判断资源是否变更

### 2.2 两者的区别与联系

| 特性    | Last-Modified            | ETag             |
| ----- | ------------------------ | ---------------- |
| 判断依据  | 资源的最后修改时间                | 资源的唯一标识（内容哈希等）   |
| 精确度   | 时间精度有限（秒级），可能出现时间相同但内容不同 | 内容变化必然导致 ETag 变化 |
| 生成方式  | 服务器自动取文件修改时间或设置          | 服务器自定义生成（哈希、版本号） |
| 验证请求头 | `If-Modified-Since`      | `If-None-Match`  |

### 2.3 为什么 ETag 更可靠？

#### 1）更细粒度的内容校验

* ETag 通常基于文件内容哈希（如 MD5、SHA-1）生成，内容只要发生任何变更，ETag 就会变化
* Last-Modified 仅依赖时间戳，可能出现内容变化但修改时间未更新或精度不足的情况

#### 2）避免时间同步问题

* 服务器与客户端时间不同步时，Last-Modified 可能导致缓存误判
* ETag 是服务端生成的标识，不受时间影响，更稳定可靠

#### 3）支持无时间戳资源

* 某些动态生成的资源没有固定修改时间，Last-Modified 无法准确表示
* ETag 可灵活自定义，适用性更广

---

### 2.4 实际应用建议

* **优先使用 ETag 实现缓存验证**，保证资源一致性
* **结合 Last-Modified 作为补充**，提高兼容性和性能
* 对于静态资源，构建时生成基于内容的哈希 ETag 更可靠

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：以为 Last-Modified 精度足够

* 时间戳无法保证内容一致性，容易导致缓存命中错误

#### ❌ 误区二：忽略服务器时间与客户端时间差异

* 可能导致缓存失效或错误使用旧缓存

#### ❌ 误区三：误用 ETag 导致过度缓存

* 生成不合理的 ETag（如静态标识）导致缓存失效或频繁请求

</details>

## 7. 简单说下你对 HTTP2 的理解 {#question-8e0a5da4-74f1-4dcd-9217-bc151cd93870}

> 题库原题：[简单说下你对 HTTP2 的理解](https://fe.ecool.fun/topic/8e0a5da4-74f1-4dcd-9217-bc151cd93870)

### 题目要点

HTTP/1.1面临的问题主要包括TCP连接数限制、线头阻塞、Header内容冗余、资源优化困难以及明文传输的不安全性。

为了解决这些问题，HTTP/2引入了一系列优势：

1. **二进制分帧层**：通过二进制传输数据帧，替代了HTTP/1.1的明文传输。
2. **多路复用**：允许在单个TCP连接上并行发送多个请求和响应，解决了线头阻塞问题，减少了连接数。
3. **服务端推送**：服务器可以主动推送资源，优化了资源内联，提高了效率。
4. **Header压缩**：使用HPACK算法压缩Header，减少了传输数据量。
5. **应用层的重置连接**：通过RST_STREAM帧在不关闭连接的情况下取消请求，提升了连接效率。
6. **请求优先级设置**：允许为不同的流设置优先级，确保关键资源优先加载。
7. **流量控制**：每个流都有自己的流量窗口，控制数据传输，避免了网络拥塞。

由于HTTP/2的这些改进，一些HTTP/1.1中的优化手段，如文件合并、资源内联、雪碧图和域名分片，在HTTP/2中变得不再必要。HTTP/2鼓励将资源细粒化，以提高传输效率。

<details>
<summary>参考答案</summary>

## HTTP/1.1 存在的问题

* TCP 连接数限制

对于同一个域名，浏览器最多只能同时创建 6~8 个 TCP 连接 (不同浏览器不一样)。为了解决数量限制，出现了 域名分片 技术，其实就是资源分域，将资源放在不同域名下 (比如二级子域名下)，这样就可以针对不同域名创建连接并请求，以一种讨巧的方式突破限制，但是滥用此技术也会造成很多问题，比如每个 TCP 连接本身需要经过 DNS 查询、三步握手、慢启动等，还占用额外的 CPU 和内存，对于服务器来说过多连接也容易造成网络拥挤、交通阻塞等，对于移动端来说问题更明显。

* 线头阻塞 (Head Of Line Blocking) 问题

每个 TCP 连接同时只能处理一个请求 - 响应，浏览器按 FIFO 原则处理请求，如果上一个响应没返回，后续请求 - 响应都会受阻。为了解决此问题，出现了 管线化 - pipelining 技术，但是管线化存在诸多问题，比如第一个响应慢还是会阻塞后续响应、服务器为了按序返回相应需要缓存多个响应占用更多资源、浏览器中途断连重试服务器可能得重新处理多个请求、还有必须客户端 - 代理 - 服务器都支持管线化。

* Header 内容多，而且每次请求 Header 不会变化太多，没有相应的压缩传输优化方案

* 为了尽可能减少请求数，需要做合并文件、雪碧图、资源内联等优化工作，但是这无疑造成了单个请求内容变大延迟变高的问题，且内嵌的资源不能有效地使用缓存机制

* 明文传输不安全

## HTTP2 的优势

### 二进制分帧层 (Binary Framing Layer)

帧是数据传输的最小单位，以二进制传输代替原本的明文传输，原本的报文消息被划分为更小的数据帧。

### 多路复用 (MultiPlexing)

在一个 TCP 连接上，我们可以向对方不断发送帧，每帧的 stream identifier 的标明这一帧属于哪个流，然后在对方接收时，根据 stream identifier 拼接每个流的所有帧组成一整块数据。

把 HTTP/1.1 每个请求都当作一个流，那么多个请求变成多个流，请求响应数据分成多个帧，不同流中的帧交错地发送给对方，这就是 HTTP/2 中的多路复用。

流的概念实现了单连接上多请求 - 响应并行，解决了线头阻塞的问题，减少了 TCP 连接数量和 TCP 连接慢启动造成的问题
所以 http2 对于同一域名只需要创建一个连接，而不是像 http/1.1 那样创建 6~8 个连接。

### 服务端推送 (Server Push)

浏览器发送一个请求，服务器主动向浏览器推送与这个请求相关的资源，这样浏览器就不用发起后续请求。
Server-Push 主要是针对资源内联做出的优化，相较于 http/1.1 资源内联的优势:

* 客户端可以缓存推送的资源
* 客户端可以拒收推送过来的资源
* 推送资源可以由不同页面共享
* 服务器可以按照优先级推送资源

### Header 压缩 (HPACK)

使用 HPACK 算法来压缩首部内容

### 应用层的重置连接

对于 HTTP/1 来说，是通过设置 tcp segment 里的 reset flag 来通知对端关闭连接的。这种方式会直接断开连接，下次再发请求就必须重新建立连接。HTTP/2 引入 RST_STREAM 类型的 frame，可以在不断开连接的前提下取消某个 request 的 stream，表现更好。

### 请求优先级设置

HTTP/2 里的每个 stream 都可以设置依赖 (Dependency) 和权重，可以按依赖树分配优先级，解决了关键请求被阻塞的问题

### 流量控制

每个 http2 流都拥有自己的公示的流量窗口，它可以限制另一端发送数据。对于每个流来说，两端都必须告诉对方自己还有足够的空间来处理新的数据，而在该窗口被扩大前，另一端只被允许发送这么多数据。

### HTTP/1 的几种优化可以弃用

合并文件、内联资源、雪碧图、域名分片对于 HTTP/2 来说是不必要的，使用 h2 尽可能将资源细粒化，文件分解地尽可能散，不用担心请求数多

</details>

## 8. 前端模块化讲一下 {#question-subjective-cdd426329022}

### 题目要点

* 模块化解决代码组织、复用和维护问题
* 主要规范：CommonJS（Node）、AMD（浏览器）、ES Module（现代标准）
* ES Module 是未来趋势，支持静态分析和按需加载
* 模块隔离作用域，导入导出接口，搭配打包工具使用

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解模块化的核心概念及作用**
* **熟悉常见的前端模块化规范（CommonJS、AMD、ES Module）**
* **掌握模块化对开发、维护、性能的提升**
* **了解模块化实现机制及打包工具的作用**

---

## 二、参考答案

### 2.1 模块化核心概念

* **模块化**指将代码拆分成独立、功能单一的模块，每个模块封装特定功能，通过明确接口进行交互
* 目的是提升代码复用性、可维护性、避免命名冲突和增强团队协作

### 2.2 常见模块化规范

#### 1）CommonJS

* 主要用于 Node.js
* 通过 `require()` 引入模块，`module.exports` 导出
* 同步加载，适合服务器端

示例：

```js
const utils = require('./utils');
module.exports = function() { ... }
```

#### 2）AMD（Asynchronous Module Definition）

* 主要用于浏览器端
* 异步加载模块，支持依赖管理
* 典型实现有 RequireJS

示例：

```js
define(['dep1', 'dep2'], function(dep1, dep2) {
  return function() { ... }
});
```

#### 3）ES Module（ESM）

* ES6 标准，现代浏览器和构建工具支持
* 通过 `import` 和 `export` 语法，静态分析，支持静态和动态加载
* 适用前端和部分后端环境

示例：

```js
import { func } from './module.js';
export function foo() { ... }
```

### 2.3 模块化带来的优势

* **代码组织清晰**：职责分明，结构化良好
* **避免全局污染**：作用域隔离，避免变量冲突
* **支持按需加载**：减少初始加载体积，提高性能
* **方便复用和维护**：模块易于独立开发和测试
* **促进团队协作**：分工明确，降低耦合度

### 2.4 模块化实现原理简述

* **作用域封闭**：每个模块拥有独立作用域，保护内部变量
* **导入导出机制**：明确暴露接口，隐藏内部实现
* **加载机制**：CommonJS 同步，AMD 异步，ESM 静态分析支持多种加载方式
* **打包工具支持**：Webpack、Rollup 等将模块打包成浏览器可执行的代码

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：认为模块化只是语法层面

* 模块化包含设计理念、加载机制、依赖管理等多方面

#### ❌ 误区二：混淆 CommonJS 和 ES Module 的加载时机

* CommonJS 同步，ES Module 静态编译支持异步加载

#### ❌ 误区三：忽视模块化对性能优化的作用

* 合理模块化结合按需加载可显著提升加载速度

</details>

## 9. 实现一个bind {#question-subjective-827b7da85e5f}

### 题目要点

* bind 返回一个绑定了 `this` 和参数的新函数
* 绑定函数支持柯里化参数和构造函数调用
* 通过 `apply` 实现调用时动态传参和绑定 `this`
* 维护原函数原型链，保证实例继承关系

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 `bind` 方法的核心作用和使用场景<br>
- 掌握函数绑定的 this 指向原理<br>
- 了解绑定函数的参数传递与 new 操作符的兼容性<br>
- 掌握函数柯里化和函数执行上下文的控制<br>

## 二、参考答案

### 2.1 bind 的核心原理说明

- `bind` 用于创建一个新函数，绑定指定的 `this` 值和部分参数<br>
- 绑定函数调用时，`this` 指向预先绑定的对象<br>
- 支持柯里化，允许预设部分参数，调用时追加剩余参数<br>
- 绑定函数作为构造函数调用时，`this` 指向新实例，绑定的 this 会被忽略（遵循 new 绑定规则）

### 2.2 bind 实现示例代码

```js
Function.prototype.myBind = function(context, ...bindArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  const self = this; // 原函数

  function boundFn(...args) {
    // 判断是否作为构造函数调用
    // new.target 在 ES6+ 支持，兼容性好
    const isNew = this instanceof boundFn;
    // 如果是 new 调用，this 指向实例，否则指向 context
    const thisArg = isNew ? this : context;
    // 执行原函数，传入绑定参数和调用参数
    return self.apply(thisArg, bindArgs.concat(args));
  }

  // 维护原函数原型链
  boundFn.prototype = Object.create(self.prototype);
  return boundFn;
};
````

### 2.3 代码说明

* 先判断调用 `myBind` 的是否是函数，否则抛错
* 通过闭包保存原函数 `self` 和绑定参数 `bindArgs`
* 返回新函数 `boundFn`，调用时判断是否用作构造函数
* 通过 `apply` 实现绑定 `this` 和合并参数
* 通过 `Object.create` 维护绑定函数的原型链，保证 `new boundFn()` 时继承正常

### 2.4 使用示例

```js
function add(a, b) {
  return a + b;
}

const addFive = add.myBind(null, 5);
console.log(addFive(10)); // 15

function Person(name) {
  this.name = name;
}
const BoundPerson = Person.myBind({});
const p = new BoundPerson('Alice');
console.log(p.name); // Alice
console.log(p instanceof Person); // true
console.log(p instanceof BoundPerson); // true
```

---

## 三、常见误区或面试陷阱

* 绑定函数作为构造函数调用时，`this` 应指向实例，而非绑定的 context
* 忽略维护绑定函数的原型链，导致实例关系断裂
* 直接返回箭头函数，导致无法修改 `this`
* 不检查调用对象类型，导致异常调用时难以排查

</details>

## 10. 实现一个搜索组件 {#question-subjective-ddf7476bd095}

### 题目要点

* 采用受控组件管理输入状态
* 使用防抖技术减少请求频率
* 异步请求接口，更新结果列表
* 处理加载和空结果状态
* 设计组件时考虑灵活传入请求函数，提高复用性

<details>
<summary>参考答案</summary>

## 一、考察点

- 熟悉组件状态管理和事件处理<br>
- 掌握受控组件实现输入绑定<br>
- 理解防抖（Debounce）技术优化输入搜索请求<br>
- 了解异步请求与结果展示的流程<br>
- 具备组件结构设计和可复用性考虑<br>

---

## 二、参考答案

### 2.1 需求分析

- 用户输入搜索关键词<br>
- 输入时触发搜索请求，但避免频繁请求（防抖处理）<br>
- 显示搜索结果列表<br>
- 支持键盘操作（选中、回车搜索）为加分项<br>
- 样式简洁，结构清晰<br>

### 2.2 React 组件实现示例

```jsx
import React, { useState, useEffect, useRef } from 'react';

// 简单防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function Search({ fetchResults }) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetchResults(debouncedInput)
      .then(data => setResults(data))
      .finally(() => setLoading(false));
  }, [debouncedInput, fetchResults]);

  return (
    <div style={{ width: 300 }}>
      <input
        type="text"
        value={input}
        placeholder="请输入搜索关键词"
        onChange={e => setInput(e.target.value)}
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
      />
      {loading && <div>加载中...</div>}
      {!loading && results.length > 0 && (
        <ul style={{ border: '1px solid #ccc', marginTop: 0, paddingLeft: 0, listStyle: 'none' }}>
          {results.map((item, idx) => (
            <li key={idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Search;
````

### 2.3 说明

* **useDebounce Hook**：防止输入时频繁触发请求，300ms 延迟更新
* **fetchResults**：作为 props 传入的异步函数，用于根据关键词请求数据
* 组件状态包括输入内容、加载状态和结果列表
* 输入为空时清空结果，避免无效请求
* 结果通过简单列表展示

### 2.4 使用示例

```jsx
// 模拟异步搜索请求
const mockFetchResults = keyword =>
  new Promise(resolve => {
    setTimeout(() => {
      const data = ['苹果', '香蕉', '橙子', '葡萄', '西瓜'].filter(item =>
        item.includes(keyword),
      );
      resolve(data);
    }, 500);
  });

// 渲染搜索组件
<Search fetchResults={mockFetchResults} />
```

---

## 三、常见误区或面试陷阱

* 忽略防抖导致请求过多，影响性能和体验
* 使用非受控组件导致输入状态管理混乱
* 不处理输入为空时的搜索逻辑，导致不必要请求
* 未处理异步请求的加载状态和异常情况
* 组件复用性和拓展性不足，硬编码搜索逻辑

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-62/round-99/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-62/_index.md" >}}) · 已是最后一轮 →
