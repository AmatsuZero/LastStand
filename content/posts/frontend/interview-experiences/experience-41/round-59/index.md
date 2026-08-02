+++
title = "百度-地图-秋招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/41"
experienceId = 41
roundId = 59
roundOrder = 1
company = "百度"
date = "2025-07-19T06:27:27.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-55/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-41/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-60/index.md" >}}) →

**本轮要点：** 本轮面试考察了前端基础能力、网络协议、Vue响应式原理、构建工具底层实现，以及手写能力与业务建模能力，重点在于深入理解底层原理和综合解决问题的能力。

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你的前端模块化的理解 {#question-subjective-2b3736d3f494}

### 题目要点

模块化发展历程、ES Module 和 CommonJS 区别、模块加载机制、Tree-shaking原理。

<details>
<summary>参考答案</summary>

**原理说明**

- **模块化的目的**：为了提高代码的可维护性、复用性和依赖管理能力，将代码组织为独立模块。

- **发展历程**：

  - 无模块化（全局变量）
  - IIFE 模式（立即执行函数）
  - CommonJS（Node.js 标准，同步加载）
  - AMD / CMD（异步模块定义）
  - ES Module（ES6 标准模块系统，浏览器原生支持）

- **CommonJS vs ES Module**：

  - CommonJS 是同步加载，适用于服务端；ES Module 是静态分析+异步加载，适用于浏览器。
  - ES Module 支持 Tree-shaking，CommonJS 不支持。

**核心用法 + 示例代码**

```js
// ES Module
export const add = (a, b) => a + b;
import { add } from './utils.js';
```

**常见误区**

- 将 ES Module 和 CommonJS 混用，导致打包失败。
- 忽视 ES Module 是静态结构，不能在运行时动态导入变量名模块（需使用 `import()`）。

</details>

## 2. HTTP/2 解决 HTTP/1.1什么问题？ {#question-subjective-363169dded10}

### 题目要点

HTTP/2 优化点、HTTP/1.1 的瓶颈、性能原理

<details>
<summary>参考答案</summary>

**原理说明**

HTTP/2 的主要改进点：

1. **多路复用**：HTTP/1.1 只能并行发起多个连接，HTTP/2 允许多个请求复用一个 TCP 连接。
2. **头部压缩**：通过 HPACK 算法压缩重复的请求头。
3. **服务端推送**：可以在客户端请求之前主动推送资源。
4. **二进制分帧**：改为帧的形式传输数据，提升解析效率。

**核心用法 + 示例**

- 开启 HTTP/2：
  - Nginx 开启 `http2` 支持。
  - 使用 CDN 或 HTTPS 时启用 `http/2` 协议。

**常见误区**

- 认为 HTTP/2 就是更快的 HTTP/1.1，其实它改变了传输结构。
- 忽略了浏览器是否支持或服务端配置不当。

</details>

## 3. 在你的项目中，你是如何设计埋点方案统计用户点击“加入购物车”的行为？ {#question-subjective-563042c563c5}

### 题目要点

1. **字段设计**：覆盖业务核心维度，避免过度采集；<br>
2. **技术选型**：根据场景选择无痕/手动埋点，优先保证可靠性；<br>
3. **数据质量**：通过验证、监控、采样确保数据可信；<br>
4. **长期维护**：通过SDK收敛和文档化降低协作成本。

<details>
<summary>参考答案</summary>

可以参考以下设计思路进行回答：<br>

### **1. 数据建模：明确埋点字段**<br>
核心字段需覆盖基础上下文，例如：<br>
- **行为标识**：统一命名规则（如 `cart_add`），避免魔法字符串<br>
- **商品信息**：商品ID、SKU、价格、类目（需考虑敏感字段脱敏）<br>
- **用户上下文**：匿名ID（设备指纹或Cookie）、登录用户ID（若存在）<br>
- **环境信息**：页面URL、referrer、时间戳、设备类型（User Agent解析）<br>
- **业务扩展字段**：促销ID、库存状态、AB测试分组<br>

*关键点*：字段设计需与后端数据团队对齐，确保数仓能解析。例如价格单位统一为「分」以避免浮点误差。<br>

### **2. 技术实现：平衡侵入性与可靠性**<br>
- **无痕埋点**：通过事件代理（Event Delegation）监听购物车按钮的父容器，减少对业务代码侵入。例如：<br>
  ```javascript
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-track="cart-add"]')) {
      const product = e.target.dataset.product; // 通过dataset传递参数
      tracker.send('cart_add', JSON.parse(product));
    }
  });
  ```
- **手动埋点**：对于动态生成的内容（如SPA路由跳转），在业务逻辑层显式调用埋点：<br>
  ```typescript
  const handleAddToCart = (product) => {
    cartService.add(product);
    tracker.send('cart_add', {
      product_id: product.id,
      // 避免直接透传整个product对象，按需选取字段
    });
  };
  ```

*权衡点*：无痕埋点维护成本低但灵活性差，手动埋点更精准但需代码耦合。<br>

### **3. 数据上报策略**<br>
- **实时性要求**：采用Navigator.sendBeacon()（页面关闭时仍可靠发送）或优先调用API，降级方案为localStorage暂存+下次上报<br>
- **防重复提交**：通过唯一请求ID（如UUID）或前端生成的事件指纹（商品ID+时间戳哈希）去重<br>
- **采样率控制**：大流量场景下按用户ID哈希采样（如10%），避免数据爆炸<br>

### **4. 验证与监控**<br>
- **开发阶段**：通过Mock服务拦截埋点请求，验证字段完整性<br>
- **线上监控**：<br>
  - 日志抽样检查：定期抽查原始日志是否包含必填字段<br>
  - 数据一致性校验：对比埋点数据与购物车服务调用量差异（如±5%阈值告警）<br>
  - 用户行为路径分析：检查“加入购物车”后无下单的异常流失节点<br>

### **5. 可维护性优化**<br>
- **统一SDK封装**：收敛埋点方法，禁止业务代码直接调用第三方统计平台（如Google Analytics）<br>
- **版本化兼容**：埋点字段随业务迭代时，通过Schema校验工具（如JSON Schema）保证历史数据可解析<br>
- **文档自动化**：利用JSDoc或Swagger生成埋点字段字典，与数据团队共享

</details>

## 4. Hash 模式和历史模式（History API）的路由跳转差异，如何实现服务端兼容。 {#question-subjective-0279c06638ea}

### 题目要点

前端路由原理、Hash vs History 模式、服务端配置要点。

<details>
<summary>参考答案</summary>

**原理说明**

- **Hash 模式**：使用 `#` 符号改变 URL，变化不会触发服务端请求。兼容性好、部署简单。
- **History 模式**：使用 HTML5 的 `pushState`/`replaceState` 修改路径，用户访问某个路径可能触发真实的服务端访问，需配置服务端 fallback 到 `index.html`。

**核心用法 + 示例**

```js
// Vue Router
const router = new VueRouter({
  mode: 'history', // 或 hash
});
```

- History 模式下 Nginx 示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**常见误区**

- 忽略 History 模式下的服务端 fallback 导致路径刷新 404。
- 使用 Hash 模式时不美观、对 SEO 不友好。

</details>

## 5. Vue 2 的 `Object.defineProperty` 和 Vue 3 的 `Proxy` 在响应式处理数组时的区别是什么？ {#question-subjective-75541ef8e7d4}

### 题目要点

Vue 响应式系统、数组监听原理、defineProperty 和 Proxy 区别

<details>
<summary>参考答案</summary>

**原理说明**

- **Vue 2 使用 **``：
  - 只能拦截已有属性，对新增或删除属性无法监听。
  - 对数组进行了方法重写（push/pop/shift...）来手动触发更新。
- **Vue 3 使用 **``：
  - 能完全代理对象和数组，包括属性的添加、删除、访问等。
  - 对数组索引访问、length 修改等也能被监听。

**示例对比**

```js
// Vue 2
this.arr[1] = 10; // 无法监听索引变化
// Vue 3
reactiveArr[1] = 10; // 可以被追踪
```

**常见误区**

- 认为 Proxy 性能一定更好，其实需要考虑浏览器兼容性。
- 忽略 Vue 2 中数组原型方法的重写带来的维护成本。

</details>

## 6. 讲一下Vue 的异步更新策略，以及 nextTick 的实现原理。 {#question-subjective-a1670813bfd9}

### 题目要点

1. **异步更新策略**<br>
   - Vue 通过 `queueWatcher` 将 `Watcher` 更新推入异步队列，避免同步频繁更新 DOM。<br>
   - 默认使用 **Microtask（微任务）** 执行队列，确保数据稳定后再渲染。<br>

2. **nextTick 核心流程**<br>
   - 回调推入队列 → 异步任务调度（`Promise.then` 等）→ 执行回调（`flushCallbacks`）。<br>
   - 保证回调在 **DOM 更新后** 执行，适用于依赖更新后 DOM 的操作（如获取渲染后的元素尺寸）。<br>

3. **降级兼容**<br>
   - 根据浏览器支持情况选择最优异步 API，保证高版本性能优先，低版本功能可用。<br>

**典型应用场景**：<br>
- 修改数据后立即获取更新后的 DOM（如 `this.$nextTick(() => { /* 操作 DOM */ })`）。<br>
- 在自定义指令或插件中确保操作发生在渲染完成后。

<details>
<summary>参考答案</summary>

Vue 的异步更新机制是其高效渲染的核心之一，主要目的是**减少不必要的 DOM 操作**，通过批量更新优化性能。具体策略如下：<br>

1. **响应式数据变更触发依赖更新**<br>
   - 当数据被修改时，Vue 的响应式系统会触发 `dep.notify()`，通知所有订阅该数据的 `Watcher` 进行更新。<br>
   - 但 Vue 并不会立即执行 DOM 更新，而是将 `Watcher` 推入一个**异步队列**（`queueWatcher`）。<br>

2. **异步队列去重**<br>
   - 同一个 `Watcher` 在同一个事件循环内多次触发（如在一个方法中多次修改数据），Vue 会去重，确保它仅被推入队列一次，避免重复计算。<br>

3. **批量更新（Microtask / Macrotask）**<br>
   - Vue 默认使用 **Microtask（微任务）** 来执行异步队列，优先选择 `Promise.then`（现代浏览器），降级到 `MutationObserver` 或 `setImmediate`，最终回退到 `setTimeout`（Macrotask）。<br>
   - 这样做的目的是让所有同步数据变更在同一个事件循环内完成，DOM 更新在微任务阶段执行，保证视图更新前所有数据已稳定。<br>

---

### **nextTick 的实现原理**<br>

`nextTick` 是 Vue 提供的一个 API，用于在 **DOM 更新完成后** 执行回调，其核心逻辑与异步更新队列紧密相关：<br>

1. **回调队列管理**<br>
   - 每次调用 `nextTick(callback)`，Vue 不会立即执行回调，而是将其推入一个 **回调队列（callbacks）**。<br>
   - 如果当前没有刷新回调队列的任务（`pending = false`），则启动一个异步任务（`timerFunc`）。<br>

2. **异步任务调度**<br>
   - Vue 会根据运行环境选择最优的异步 API（优先级：`Promise.then` > `MutationObserver` > `setImmediate` > `setTimeout`）。<br>
   - 例如，在现代浏览器中，`timerFunc` 可能是：<br>
     ```javascript<br>
     timerFunc = () => Promise.resolve().then(flushCallbacks);<br>
     ```<br>

3. **执行回调（flushCallbacks）**<br>
   - 当异步任务触发时，Vue 会依次执行回调队列中的所有回调，并清空队列。<br>
   - 由于 Vue 的 DOM 更新也使用相同的异步机制，`nextTick` 能确保回调在 **DOM 更新后** 执行。<br>

4. **降级策略**<br>
   - 在不支持 `Promise` 的旧浏览器（如 IE11），Vue 会降级到 `MutationObserver` 或 `setTimeout`，但 Macrotask 可能比 Microtask 稍慢，导致 `nextTick` 延迟稍高。

</details>

## 7. Loader 和 Plugin 在 Webpack 中的作用有何不同？举例说明常见应用场景。 {#question-subjective-f44e9923fb66}

### 题目要点

1. **Loader**<br>
   - 专注**单个文件的转换**，需声明文件类型（`test` 正则）。<br>
   - 典型场景：转译（Babel）、样式处理、文件加载。<br>

2. **Plugin**<br>
   - 干预**整个构建生命周期**，通过钩子实现高级功能。<br>
   - 典型场景：代码压缩、HTML 生成、环境变量注入。

<details>
<summary>参考答案</summary>

Webpack 的核心编译流程可以抽象为：**资源输入 → 模块转换（Loader）→ 代码优化与输出（Plugin）**。两者的分工和定位完全不同：<br>

| **维度**       | **Loader**                          | **Plugin**                          |
|----------------|-------------------------------------|-------------------------------------|
| **作用阶段**   | 模块加载阶段（Module Resolution）    | 整个构建流程（Compilation Hooks）    |
| **功能目标**   | 转换单个文件（如转译、编译）         | 干预打包过程（如优化、资源管理）     |
| **运行机制**   | 链式调用，按规则处理文件内容         | 监听 Webpack 生命周期钩子执行任务    |
| **配置方式**   | `module.rules` 数组                 | `plugins` 数组                      |

---

### **Loader 的作用与典型场景**<br>
**核心能力**：将非 JavaScript 模块转换为 Webpack 可识别的格式（通常输出 JavaScript 或 Asset 资源）。<br>

#### **常见 Loader 示例**<br>
1. **转译类 Loader**<br>
   - `babel-loader`：将 ES6+/TypeScript 转译为 ES5。<br>
     ```javascript<br>
     module: {<br>
       rules: [{<br>
         test: /\.js$/,<br>
         use: 'babel-loader' // 调用 Babel 转译<br>
       }]<br>
     }<br>
     ```<br>
   - `ts-loader`：处理 TypeScript 文件。<br>

2. **样式处理 Loader**<br>
   - `css-loader`：解析 `@import` 和 `url()` 依赖。<br>
   - `style-loader`：将 CSS 注入 DOM（通过 `&lt;style&gt;` 标签）。<br>
     ```javascript<br>
     {<br>
       test: /\.css$/,<br>
       use: ['style-loader', 'css-loader'] // 从右到左执行<br>
     }<br>
     ```<br>

3. **文件资源 Loader**<br>
   - `file-loader`：将文件（如图片）输出到构建目录并返回 URL。<br>
   - `url-loader`：小文件转 Base64 内联，大文件回退到 `file-loader`。<br>

**关键点**：Loader 是**单向管道**，每个文件匹配后依次通过多个 Loader 处理（如 `sass-loader` → `css-loader` → `style-loader`）。

---

### **Plugin 的作用与典型场景**<br>
**核心能力**：通过 Webpack 的 **Tapable 事件流** 扩展构建流程，实现资源优化、环境注入等高级功能。<br>

#### **常见 Plugin 示例**<br>
1. **代码优化类**<br>
   - `TerserPlugin`：压缩 JavaScript（替代 UglifyJS）。<br>
     ```javascript<br>
     const TerserPlugin = require('terser-webpack-plugin');<br>
     module.exports = {<br>
       optimization: {<br>
         minimizer: [new TerserPlugin()]<br>
       }<br>
     };<br>
     ```<br>
   - `SplitChunksPlugin`：拆分公共代码（默认已集成）。<br>

2. **资源管理类**<br>
   - `HtmlWebpackPlugin`：自动生成 HTML 并注入打包后的资源。<br>
     ```javascript<br>
     new HtmlWebpackPlugin({<br>
       template: './src/index.html'<br>
     });<br>
     ```<br>
   - `CopyWebpackPlugin`：复制静态文件（如 `public/favicon.ico`）。<br>

3. **环境增强类**<br>
   - `DefinePlugin`：定义全局常量（如 `process.env.NODE_ENV`）。<br>
   - `HotModuleReplacementPlugin`：启用 HMR 热更新。<br>

**关键点**：Plugin 通过监听 **Compiler Hooks**（如 `emit`、`done`）干预构建流程。例如：<br>
```javascript
compiler.hooks.emit.tap('MyPlugin', (compilation) => {
  // 在生成资源到输出目录前修改内容
});
```

</details>

## 8. Webpack 热更新（HMR）的实现原理，包括客户端和服务端的协作流程。 {#question-subjective-e3d5414930cb}

### 题目要点

1. **服务端**：<br>
   - 监听文件 → 增量编译 → 推送 WebSocket 消息 → 提供补丁文件。<br>
2. **客户端**：<br>
   - 接收通知 → 拉取补丁 → 移除旧模块 → 执行新代码 → 触发 `accept` 回调。<br>
3. **关键依赖**：<br>
   - WebSocket（实时通信） + `hot-update.js`（新模块代码） + HMR Runtime（替换逻辑）。<br>
4. **适用场景**：<br>
   - 开发环境保留应用状态（如表单输入、UI 组件状态）。

<details>
<summary>参考答案</summary>

Webpack 的 **Hot Module Replacement (HMR)** 允许在运行时替换、添加或删除模块，而无需完全刷新页面。其核心依赖于 **客户端（Browser）** 和 **服务端（Webpack Dev Server）** 的协同工作，整体流程可分为以下几个阶段：<br>

---

## **1. 服务端（Webpack Dev Server）的职责**<br>
### **1.1 启动阶段：建立 WebSocket 连接**<br>
- **Webpack Dev Server (WDS)** 启动时，会创建一个 **WebSocket 服务**，用于与客户端实时通信。<br>
- 同时，WDS 会监听文件变化（通过 `chokidar` 等库），并触发重新编译。<br>

### **1.2 文件变更后的编译流程**<br>
1. **增量编译**：<br>
   - 当文件修改后，Webpack 触发 **增量构建**（Incremental Build），生成新的 **模块依赖图（Module Graph）**。<br>
   - 对比新旧依赖图，找出 **变动的模块（changed modules）**。<br>

2. **生成补丁文件（HMR Update）**：<br>
   - Webpack 生成一个 **JSON 格式的补丁文件（hot-update.json）**，包含：<br>
     ```json<br>
     {
       "c": {"main": "newHash"}, // 变更的 chunk ID 及新 hash<br>
       "h": "newHotUpdateHash"   // 本次 HMR 的唯一标识<br>
     }<br>
     ```<br>
   - 同时生成 **JS 补丁文件（hot-update.js）**，包含变更模块的新代码。<br>

3. **推送更新通知**：<br>
   - WDS 通过 **WebSocket** 向客户端发送消息：<br>
     ```json<br>
     {
       "type": "hash",  // 通知客户端新的编译 hash<br>
       "data": "newHash"
     }<br>
     ```<br>
     随后发送：<br>
     ```json<br>
     {
       "type": "ok",    // 表示编译完成<br>
       "data": { /* 可能携带警告信息 */ }<br>
     }<br>
     ```<br>

---

## **2. 客户端（Browser）的职责**<br>
### **2.1 初始化阶段：注册 HMR 运行时**<br>
- Webpack 在打包时注入 **HMR Runtime** 代码（`webpack-hot-middleware/client` 或 `webpack-dev-server/client`）。<br>
- 客户端初始化时，会：<br>
  1. 建立 **WebSocket 连接**（用于接收服务端通知）。<br>
  2. 向服务端发送 `"hot"` 请求，表明支持 HMR。<br>

### **2.2 接收更新并执行热替换**<br>
1. **监听 WebSocket 消息**：<br>
   - 当收到 `"hash"` 消息时，客户端存储新的编译 hash。<br>
   - 当收到 `"ok"` 消息时，客户端触发 **检查更新（checkForUpdates）**。<br>

2. **请求补丁文件**：<br>
   - 客户端通过 `JSONP` 或 `fetch` 请求 `hot-update.json` 和 `hot-update.js`。<br>
   - 示例请求 URL：<br>
     ```
     http://localhost:8080/main.newHash.hot-update.js
     ```<br>

3. **执行模块替换**：<br>
   - **`hotApply` 阶段**：HMR Runtime 执行关键操作：<br>
     - 从缓存中移除旧模块。<br>
     - 执行新模块代码（`hot-update.js`）。<br>
     - 调用 **模块的 `module.hot.accept` 回调**（如果有）。<br>

4. **UI 更新（可选）**：<br>
   - 如果模块定义了 `module.hot.accept`，开发者可以手动处理更新逻辑（如保留 React/Vue 组件状态）。<br>
   - 示例（React + HMR）：<br>
     ```javascript<br>
     if (module.hot) {
       module.hot.accept('./App', () => {
         // 重新渲染组件，保留状态<br>
         render(<App />, document.getElementById('root'));
       });
     }
     ```<br>

---

## **3. 关键协作流程总结**<br>
| **步骤**               | **服务端（WDS）**                          | **客户端（Browser）**                     |
|------------------------|--------------------------------------------|------------------------------------------|
| **1. 初始化**          | 启动 WebSocket 服务                        | 连接 WebSocket，注册 HMR                 |
| **2. 文件变更**        | 监听文件 → 增量编译 → 生成补丁文件         | -                                        |
| **3. 通知客户端**      | 推送 `"hash"` 和 `"ok"` 消息               | 接收消息，触发更新检查                   |
| **4. 获取补丁**        | 提供 `hot-update.json` 和 `.js`            | 请求补丁文件                             |
| **5. 热替换**          | -                                          | 移除旧模块 → 执行新代码 → 触发 `accept`  |

---

## **4. 核心实现细节**<br>
### **4.1 模块热替换的边界条件**<br>
- **未处理 `accept` 的模块**：会向上冒泡，直到找到父模块的 `accept`，否则刷新页面。<br>
- **CSS 热更新**：通过 `style-loader` 或 `MiniCssExtractPlugin` 自动处理，无需手动 `accept`。<br>

### **4.2 降级策略**<br>
- 如果 HMR 失败（如模块报错），客户端会回退到 **`window.location.reload()`**。<br>

### **4.3 性能优化**<br>
- **增量构建**：仅编译变动的文件（依赖 `webpack` 的缓存机制）。<br>
- **懒加载模块**：动态导入（`import()`）的模块也支持 HMR。

</details>

## 9. 手写一个支持异步链式调用的 Promise 基础版本，需包含 resolve 和 then 方法。 {#question-subjective-3f93df302bab}

### 题目要点

1. **状态机模型**：`pending`/`fulfilled`/`rejected` 三态转换。
2. **异步队列**：通过回调数组和 `setTimeout` 实现异步执行。
3. **链式调用**：`then` 返回新 Promise，递归解析返回值。
4. **兼容性**：处理 `then` 参数可选和值穿透。

<details>
<summary>参考答案</summary>

#### 实现代码
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending'; // 状态：pending, fulfilled, rejected
    this.value = undefined; // 成功时的值
    this.reason = undefined; // 失败时的原因
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = []; // 失败回调队列

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 异步执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // 异步执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject); // 立即执行执行器函数
    } catch (err) {
      reject(err); // 捕获同步错误
    }
  }

  then(onFulfilled, onRejected) {
    // 处理 then 的参数可选（值穿透）
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        // 异步执行 onFulfilled（模拟微任务）
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.state === 'rejected') {
        // 异步执行 onRejected
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.state === 'pending') {
        // 订阅回调（支持异步操作）
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });

    return promise2; // 返回新 Promise 实现链式调用
  }
}

// 处理 then 的返回值（支持 Promise 链）
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  } else {
    resolve(x);
  }
}
```

---

### 关键实现解析

1. **状态管理**
   - `pending` → `fulfilled`（成功）或 `rejected`（失败），状态不可逆。
   - 通过 `resolve`/`reject` 修改状态并触发回调。

2. **异步支持**
   - 使用 `setTimeout` 模拟微任务队列（实际 Promise 使用微任务）。
   - 在 `pending` 时订阅回调，`resolve`/`reject` 后异步执行。

3. **链式调用**
   - `then` 返回新 Promise（`promise2`）。
   - `resolvePromise` 处理返回值：
     - 普通值 → 直接 `resolve`。
     - Promise → 等待其状态变更。

4. **错误处理**
   - 执行器（`executor`）和 `then` 回调中的错误会被捕获并 `reject`。

---

### 使用示例
```javascript
const p = new MyPromise((resolve) => {
  setTimeout(() => resolve('success'), 1000);
});

p.then((res) => {
  console.log(res); // 1秒后输出 "success"
  return 'chain';
}).then((res) => {
  console.log(res); // 输出 "chain"
});
```

</details>

## 10. 给定数组 nums，判断是否存在三个元素 a, b, c 使得 a + b + c = 0 {#question-subjective-686a41cad104}

### 题目要点

| **方法**       | **时间复杂度** | **空间复杂度** | **适用场景**               |
|----------------|---------------|----------------|---------------------------|
| 排序 + 双指针  | O(n²)         | O(1)           | 一般情况（最优解）         |
| 哈希表         | O(n²)         | O(n)           | 需快速查找（但去重较麻烦） |

<details>
<summary>参考答案</summary>

#### 方法一：排序 + 双指针（最优解）
**时间复杂度**：O(n²)<br>
**空间复杂度**：O(1)（不考虑结果存储空间）

##### 算法步骤
1. **排序数组**（方便去重和双指针移动）。
2. **遍历数组**，固定一个数 `nums[i]`，然后在剩余部分用双指针找 `nums[left] + nums[right] = -nums[i]`。
3. **去重处理**：
   - 如果 `nums[i] === nums[i-1]`，跳过（避免重复三元组）。
   - 在双指针移动时，跳过重复的 `left` 和 `right`。

##### 代码实现
```javascript
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b); // 排序

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // 跳过重复的 nums[i]

    let left = i + 1;
    let right = nums.length - 1;
    const target = -nums[i];

    while (left < right) {
      const sum = nums[left] + nums[right];
      if (sum === target) {
        result.push([nums[i], nums[left], nums[right]]);
        // 跳过重复的 left 和 right
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}
```

#### 方法二：哈希表（辅助优化）
**时间复杂度**：O(n²)<br>
**空间复杂度**：O(n)（哈希表存储）

##### 算法步骤
1. **排序数组**（方便去重）。
2. **双层循环**：
   - 外层遍历 `nums[i]`。
   - 内层用哈希表记录 `target = -nums[i] - nums[j]` 是否出现过。

##### 代码实现
```javascript
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    const seen = new Set();
    const target = -nums[i];

    for (let j = i + 1; j < nums.length; j++) {
      const complement = target - nums[j];
      if (seen.has(complement)) {
        result.push([nums[i], complement, nums[j]]);
        while (j + 1 < nums.length && nums[j] === nums[j + 1]) j++; // 去重
      }
      seen.add(nums[j]);
    }
  }
  return result;
}
```

---

### 边界情况处理
1. **数组长度 < 3**：直接返回 `[]`。
2. **全零数组**：如 `[0, 0, 0]`，返回 `[[0, 0, 0]]`。
3. **无解情况**：如 `[1, 2, 3]`，返回 `[]`。

</details>

## 11. 设计一个地图搜索框的自动补全功能 {#question-subjective-0cec0fd47b86}

### 题目要点

| **模块**       | **技术选型**                  | **优化点**                     |
|----------------|-----------------------------|-------------------------------|
| 前端交互        | 防抖 + 键盘导航              | 减少请求、无障碍支持            |
| 后端 API       | Elasticsearch + Redis       | 快速检索、结果缓存              |
| 数据排序        | 热度 + 距离 + 个性化         | 提升结果准确性                  |
| 扩展能力        | 语音/多源搜索               | 增强用户体验                    |

<details>
<summary>参考答案</summary>

#### **1. 核心功能需求**
- **输入联想**：根据用户输入实时匹配候选结果（如地点、POI）。
- **结果排序**：按相关性（如搜索热度、距离）排序。
- **异步加载**：高效处理高并发请求，避免频繁触发搜索。
- **防抖优化**：减少无效请求，提升性能。
- **键盘导航**：支持 `↑`/`↓` 选择、`Enter` 确认。

---

#### **2. 技术实现方案**
##### **2.1 前端实现**
**UI 组件结构**：
```html
<div class="search-container">
  <input
    type="text"
    id="search-input"
    placeholder="搜索地点..."
    autocomplete="off"
  />
  <ul id="suggestions-list" class="suggestions-hidden"></ul>
</div>
```

**关键逻辑**：
1. **输入监听与防抖**：
   ```javascript
   const input = document.getElementById('search-input');
   let debounceTimer;

   input.addEventListener('input', () => {
     clearTimeout(debounceTimer);
     debounceTimer = setTimeout(() => {
       if (input.value.trim()) fetchSuggestions(input.value);
     }, 300); // 防抖 300ms
   });
   ```

2. **结果渲染**：
   ```javascript
   function renderSuggestions(results) {
     const list = document.getElementById('suggestions-list');
     list.innerHTML = results.map(item => `
       <li data-id="${item.id}">${item.name} <small>${item.address}</small></li>
     `).join('');
     list.classList.remove('suggestions-hidden');
   }
   ```

3. **键盘导航**：
   ```javascript
   input.addEventListener('keydown', (e) => {
     const items = document.querySelectorAll('#suggestions-list li');
     let current = document.querySelector('.suggestion-active');

     switch (e.key) {
       case 'ArrowDown':
         e.preventDefault();
         current?.classList.remove('suggestion-active');
         const next = current?.nextElementSibling || items[0];
         next?.classList.add('suggestion-active');
         break;
       case 'Enter':
         if (current) {
           input.value = current.textContent.trim();
           list.classList.add('suggestions-hidden');
         }
         break;
     }
   });
   ```

##### **2.2 后端 API 设计**
**请求示例**：
```
GET /api/suggestions?query=北京&limit=5&lat=39.9&lng=116.4
```

**响应格式**：
```json
{
  "results": [
    {
      "id": "poi-123",
      "name": "北京故宫",
      "address": "北京市东城区景山前街4号",
      "distance": "2.5km"
    }
  ]
}
```

**优化策略**：
- **缓存**：使用 Redis 缓存高频查询结果。
- **分词优化**：结合 Elasticsearch 或地理编码服务（如高德/Google Places API）。
- **个性化排序**：结合用户历史搜索数据调整权重。

---

#### **3. 性能与体验优化**
- **预加载热点数据**：首页加载时缓存热门地点。
- **懒加载图片**：候选结果的图标延迟加载。
- **离线支持**：本地存储历史记录，无网络时展示。
- **错误降级**：API 失败时显示本地历史记录。

---

#### **4. 高级功能扩展**
- **多源搜索**：同时搜索地点、公交线路、商家。
- **语音输入**：集成 Web Speech API。
- **地理围栏提示**：输入时自动提示附近地点。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-55/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-41/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-60/index.md" >}}) →
