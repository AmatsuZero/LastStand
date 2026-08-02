+++
title = "阿里巴巴-社招-1年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/61"
experienceId = 61
roundId = 97
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T11:47:07.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-61/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-61/round-98/index.md" >}}) →

**本轮要点：** Webpack与Vite、事件循环、跨域通信

本轮共 16 道题。答案默认折叠，便于先自行作答。

## 1. 项目中遇到了哪些技术难题，是如何解决的 {#question-subjective-80619f2d22f7}

### 题目要点

STAR法则

<details>
<summary>参考答案</summary>

略

</details>

## 2. 在解决这些技术难题的过程中，有没有尝试过其他解决方案 {#question-subjective-8eccdcf5f029}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 项目中是如何进行团队协作的 {#question-subjective-97e442c116a5}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 4. 在团队协作中，有没有遇到过沟通不畅或者意见不合的情况？是如何解决的 {#question-subjective-ff0b3dbd2346}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 5. webpack 的 plugin 了解吗 {#question-subjective-78a32c9021bc}

### 题目要点

* Plugin 是 Webpack 扩展机制，贯穿构建全过程
* 核心结构是类 + `apply(compiler)` + Tapable 钩子
* 常见生命周期钩子：`compile`、`emit`、`done` 等
* 可用于注入变量、分析构建、生成资源、操作产物等
* 熟悉 compiler 与 compilation 的概念
* 可结合实际项目经验举例说明插件使用场景

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 Plugin 在 Webpack 中的作用和工作机制**

  * Plugin 是 Webpack 最核心的扩展机制之一
* **是否掌握编写 Plugin 的基本方法和生命周期**

  * 了解 `compiler`、`compilation`、钩子（hooks）等概念
* **能否结合实际项目场景说明使用插件的案例和目的**

  * 提高构建效率、定制构建流程、集成第三方能力等
* **是否具备分析和调试复杂构建流程的能力**

---

## 二、参考答案

### 1.1 原理说明

#### Webpack Plugin 的定义

* Plugin 是 Webpack 的**插件系统**，用于**扩展构建流程中的各个阶段**
* Plugin 可以在 Webpack 的生命周期钩子上注册回调，实现自定义行为
* 插件是通过类的形式实现，通常定义一个 `apply(compiler)` 方法

#### Webpack 生命周期钩子

Webpack 使用 [Tapable](https://github.com/webpack/tapable) 提供的钩子机制，常见生命周期包括：

* `compiler.hooks.run`：开始构建（CLI）
* `compiler.hooks.compile`：开始一次新的编译
* `compilation.hooks.optimizeAssets`：优化生成资源前
* `emit`：生成输出文件前
* `done`：构建完成

---

### 1.2 插件的核心结构与示例

#### 插件基本结构

```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 在 emit 阶段处理资源
      console.log('Assets about to emit...');
      callback();
    });
  }
}

module.exports = MyPlugin;
```

#### 使用插件

```js
// webpack.config.js
const MyPlugin = require('./MyPlugin');

module.exports = {
  plugins: [
    new MyPlugin()
  ]
};
```

#### 插件常见用途

* 添加版权头部（BannerPlugin）
* 清理输出目录（CleanWebpackPlugin）
* 拷贝静态资源（CopyWebpackPlugin）
* 注入变量（DefinePlugin）
* 构建分析（BundleAnalyzerPlugin）

---

### 1.3 实践经验与项目应用

#### ✅ 项目中自定义过插件用途示例：

* **构建后自动生成版本文件**

  * 在 `emit` 阶段写入 `version.json` 文件，记录 Git hash、构建时间
* **打包结果分析插件**

  * 集成 `webpack-bundle-analyzer`，优化包体积
* **自定义日志输出**

  * 在构建生命周期中监听钩子输出构建进度或自定义日志信息

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：将 Loader 和 Plugin 混淆

* Loader 用于处理模块内容（如 `.js`、`.css`）
* Plugin 用于扩展整个构建生命周期，更高层次

#### ❌ 误区二：错误使用异步钩子

* 未正确调用 `callback()` 或使用 `tapPromise()`，导致构建卡死

#### ❌ 误区三：不理解 compiler 与 compilation 的区别

* `compiler` 表示 Webpack 整体实例
* `compilation` 表示一次具体构建过程（尤其是增量构建中）

</details>

## 6. 302、304 状态码的含义和应用场景 {#question-subjective-872da29a10f2}

### 题目要点

* 302：临时重定向，浏览器跳转，常用于未登录跳转、新活动页面
* 304：资源未修改，命中缓存，无响应体，提升性能
* 304 基于条件请求头（如 `If-Modified-Since`），需服务器返回标识符（如 `ETag`）
* 302 适用于用户体验优化跳转，304 适用于前端性能优化
* 区分缓存控制与跳转逻辑，理解各自的使用前提和返回机制

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否准确理解 HTTP 状态码语义，尤其是重定向与缓存机制**
* **是否了解 302 和 304 的区别及在浏览器中的处理逻辑**
* **是否能结合实际开发场景正确使用状态码，提高响应效率**
* **是否理解缓存控制与页面跳转背后的网络优化原理**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ 302 Found（临时重定向）

* 表示客户端请求的资源临时被移动到另一个 URL，客户端应使用 `Location` 响应头中的地址重新发起请求
* 适用于服务器临时重定向请求目标，例如跳转登录页、活动页等
* 浏览器会自动跳转到新地址，用户无感知

```http
HTTP/1.1 302 Found
Location: https://example.com/new-url
```

#### ✅ 304 Not Modified（缓存命中）

* 表示客户端所请求的资源未被修改，可继续使用本地缓存副本
* 响应不包含资源内容，服务器通过响应头告知浏览器使用缓存
* 需要客户端带上条件请求头（如 `If-Modified-Since` 或 `If-None-Match`）

```http
HTTP/1.1 304 Not Modified
```

* 常用于静态资源缓存优化，减轻服务端压力和加快加载速度

---

### 1.2 应用场景详解

#### ✅ 302 状态码应用场景

| 场景         | 描述                        |
| ---------- | ------------------------- |
| 用户未登录跳转登录页 | 登录校验失败时将用户请求重定向到登录页面      |
| 活动临时跳转     | 某活动期将旧链接临时重定向到新页面，不影响搜索引擎 |
| 语言/地域自动跳转  | 根据 IP/浏览器设置跳转到对应语言站点      |

#### ✅ 304 状态码应用场景

| 场景         | 描述                                                  |
| ---------- | --------------------------------------------------- |
| 静态资源缓存优化   | JS、CSS、图片等通过 `Cache-Control` 和 `ETag` 控制缓存，命中返回 304 |
| 前端请求数据缓存   | Ajax 请求带上 `If-None-Match`，若服务端资源未更新，返回 304，节省流量     |
| API 响应缓存策略 | 对请求频繁但更新较少的接口可启用 304 机制，优化性能                        |

---

### 1.3 常见误区或面试陷阱

#### ❌ 误区一：将 302 理解为永久重定向

* 302 是**临时**重定向，若需永久跳转，应使用 301 Moved Permanently

#### ❌ 误区二：以为 304 是服务端缓存

* 实际是**客户端缓存命中，服务端仅返回响应头**，不包含实体内容

#### ❌ 误区三：未配置缓存控制导致 304 无效

* 服务端需正确配置 `Last-Modified`、`ETag` 及响应缓存头

</details>

## 7. 为何304状态码的ETag比Last-Modified更精准 {#question-subjective-d909c1249f01}

### 题目要点

* Last-Modified 精度为秒，ETag 基于内容标识更精确
* ETag 能识别内容无变更但修改时间改变的情况
* ETag 更适合精细控制资源缓存，特别是动态内容或频繁变更文件
* 两者可配合使用，兼顾兼容性与效率
* 实际中需注意 ETag 在分布式部署下可能不一致的问题

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解浏览器缓存中 ETag 和 Last-Modified 的使用机制**
* **是否能比较两者在精度、适用场景和技术实现上的差异**
* **是否了解强缓存与协商缓存的原理及性能优化策略**
* **能否结合实际开发场景说明 ETag 的优势与劣势**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ Last-Modified 工作机制

* **由服务器返回资源的“最后修改时间”**，保存在响应头中：

```http
Last-Modified: Wed, 24 Jul 2024 10:00:00 GMT
```

* 浏览器下次请求会带上：

```http
If-Modified-Since: Wed, 24 Jul 2024 10:00:00 GMT
```

* 如果服务器判断资源**自此时间以来未变更**，返回 `304 Not Modified`

#### ✅ ETag 工作机制

* **由服务器为资源生成一个唯一标识符**（如文件哈希值、版本号），返回在响应头：

```http
ETag: "a1b2c3d4"
```

* 浏览器下次请求会带上：

```http
If-None-Match: "a1b2c3d4"
```

* 若服务器判断资源内容未变，则返回 `304 Not Modified`

---

### 1.2 为什么 ETag 更精准

| 对比项  | Last-Modified              | ETag              |
| ---- | -------------------------- | ----------------- |
| 精度   | **秒级**                     | **字节级（内容哈希）**     |
| 判断标准 | 文件是否在某时间点之后修改              | 文件内容是否变化          |
| 缺陷   | 改动后还原时间会导致误判 / 同秒内多次修改无法识别 | 基于内容本身，精确判断       |
| 灵活性  | 只能使用时间戳判断                  | 可自定义哈希策略（如内容、版本号） |
| 支持场景 | 简单静态资源                     | 精确控制的动态资源或复杂内容缓存  |

#### 示例说明

```txt
- 某资源被编辑了但最终内容恢复成原样，Last-Modified 变了，ETag 不变 → ETag 更准确
- 某资源同一秒内修改了两次，Last-Modified 无法捕捉，ETag 能识别 → ETag 更敏感
```

---

### 1.3 实际使用中的优势与注意事项

#### ✅ 优势

* ETag 可以避免因时间精度或人为操作导致的缓存误判
* 适用于大型站点中内容频繁变更但差异微小的资源管理
* CDN 和服务端更易统一控制缓存策略

#### ⚠️ 注意事项

* ETag 默认生成方式（如 Apache/NGINX）可能基于 inode + mtime，在分布式环境不稳定
* 可能带来计算开销（尤其内容 hash）
* 实际部署中需与 Last-Modified 配合使用，增强兼容性和性能

</details>

## 8. cas 了解吗？讲一下怎么实现三方登录 {#question-subjective-bf981e3bf1a9}

### 题目要点

* CAS 是一种单点登录协议，支持多个系统共享登录状态
* 三方登录通过 CAS 实现需配合 service 跳转、ticket 校验、登录态管理
* 后端需调用 `serviceValidate` 接口解析 ticket 获取用户信息
* 本地登录状态管理需开发者实现（如 Cookie、Session、Token）
* 保证回调安全性、支持 HTTPS、防止 ticket 重放攻击
* 可扩展对接钉钉、企业微信、OAuth 平台等统一认证系统

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否了解 CAS（Central Authentication Service）的基本原理**

  * 授权中心统一登录，支持单点登录（SSO）
* **是否理解三方登录（如平台接入企业统一认证系统）的流程和角色**
* **是否能说清客户端、CAS 服务端、三方系统之间的交互逻辑**
* **是否具备结合实际场景实现登录对接的能力**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ 什么是 CAS（Central Authentication Service）

* CAS 是一种开放协议，用于实现 **单点登录（SSO）**，最初由 Yale 大学提出
* 它允许用户在多个子系统中**只需登录一次**即可访问所有系统
* 基本角色：

  * **Client（客户端系统）**：需要认证的业务系统
  * **CAS Server**：统一认证服务中心
  * **Browser**：用户操作入口

#### ✅ 什么是三方登录（以接入 CAS 为例）

* 指业务系统（第三方）接入统一认证平台（如 CAS、企业微信、钉钉、OAuth 系统等）
* 用户访问三方系统时，会被引导到认证中心登录，认证成功后再跳回原系统

---

### 1.2 三方登录实现流程（基于 CAS）

#### ✅ 核心流程（标准 Web 应用场景）

```plaintext
[用户访问第三方系统]
        ↓
[系统检测未登录] → 跳转至 CAS Server 登录页（带 service 参数）
        ↓
[CAS 登录成功后，重定向回 service 地址 + Ticket]
        ↓
[第三方系统用 Ticket 请求 CAS 验证接口 → 返回用户信息]
        ↓
[系统根据用户信息创建本地登录态]
```

#### ✅ 简化流程说明

1. **未登录时重定向到 CAS 登录地址**：

```http
GET /login?service=https://your-app.com/cas/callback
```

2. **CAS 登录成功后回调**：

```http
302 Redirect → https://your-app.com/cas/callback?ticket=ST-xxxxx
```

3. **后端校验 Ticket 合法性**：

```http
GET https://cas.example.com/serviceValidate?service=https://your-app.com/cas/callback&ticket=ST-xxxxx
```

4. **验证通过后获取用户身份信息**，系统创建 session 或 JWT

---

### 1.3 实现细节与技术要点

#### ✅ 客户端对接要点（第三方系统）

* 搭建回调接口 `/cas/callback`
* 后端请求 CAS Server 的校验接口，解析返回 XML 或 JSON 格式的用户信息
* 登录后可设置本地 cookie、token 或 session 管理登录状态
* 可增加白名单校验、防重放攻击措施

#### ✅ CAS Server 配置要点

* 配置 service 白名单，限制哪些系统可以接入
* 可对接后端认证源（LDAP、数据库、第三方 OAuth）
* 配置 Ticket 有效期和服务端缓存策略

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为 CAS 登录后能直接登录三方系统

* 实际三方系统需要 **显式调用验证接口**，否则只拿到 ticket 无法确定身份

#### ❌ 误区二：忽略 HTTPS 要求

* 为保证安全性，**CAS 推荐服务端和回调地址都必须是 HTTPS**

#### ❌ 误区三：未设置本地登录态

* 验票成功后需自行设置本地会话或 JWT，否则每次都要走 CAS 认证流程

</details>

## 9. CAS单点登录流程中，前端如何存储和传递service ticket {#question-subjective-2896bef0753f}

### 题目要点

* ST 是一次性票据，用于客户端换取用户身份信息
* 前端只负责从 URL 中读取 ticket → 传给后端验证 → 清除 URL 中的 ticket
* ticket 不应被缓存或持久化存储
* 登录状态由服务端统一管理（session/cookie/token）
* 前端通过 `history.replaceState` 清理 URL 中的敏感参数

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 CAS 单点登录流程中 service ticket 的作用**
* **是否清楚前端在整个 CAS 登录链路中扮演的角色**
* **能否结合实际场景解释前端如何处理 URL 中的 ticket 参数并参与认证**
* **是否了解安全性要求、跳转逻辑与状态管理机制**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ 什么是 service ticket（ST）

* ST 是 **CAS Server 发给 Client（第三方系统）的一次性令牌**
* ST 是登录成功后，**CAS Server 重定向到客户端地址时附带的 `ticket` 参数**
* 第三方系统必须通过后端发起请求，调用 CAS 的 `serviceValidate` 接口来验证 ST 是否有效，并获取用户身份信息

#### ✅ 前端处理 ST 的责任

* 负责从当前 URL 中读取 `ticket` 参数
* 一般**不存储 ST**，而是立即交给后端完成校验
* 校验完成后，前端通常需要将 URL 中的 `ticket` 参数清除，避免暴露

---

### 1.2 具体流程：前端如何处理 ticket

#### ✅ 1）用户未登录 → 跳转 CAS 登录

```js
// 如果没有本地登录态，前端将跳转 CAS 登录
window.location.href = `https://cas.example.com/login?service=${encodeURIComponent(currentUrl)}`;
```

#### ✅ 2）CAS 登录成功，重定向回前端带上 `ticket`

```http
GET https://your-app.com?ticket=ST-12345...
```

#### ✅ 3）前端从 URL 中提取 `ticket`，传给后端校验

```js
// 示例：提取 ticket 参数
const urlParams = new URLSearchParams(window.location.search);
const ticket = urlParams.get('ticket');

if (ticket) {
  // 发送给后端进行 ticket 校验
  fetch(`/api/cas/validate?ticket=${ticket}&service=${location.origin}`, {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // 登录成功，清除 URL 中的 ticket 参数
        const cleanUrl = location.origin + location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    });
}
```

* 票据只在首次认证回调时存在，使用后立刻清除
* 登录状态由后端设置，如 Cookie、Session、Token 等

---

### 1.3 关键技术点

#### ✅ 不推荐前端长期存储 ticket

* ST 是一次性的票据，暴露风险高
* 后端应在收到 ticket 后立即验证并销毁

#### ✅ 票据应立即传给后端校验

* 服务端向 CAS 发起 `/serviceValidate` 请求，获取用户身份
* 成功后由服务端设置前端登录态（JWT 或 Cookie）

#### ✅ URL 清理避免 ticket 暴露和重复认证

* 清除 URL 参数可避免分享、跳转等操作泄露 ticket
* `history.replaceState` 是推荐方式

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：在前端缓存 ticket 用于后续请求

* ST 是一次性的，不应重复使用，也不应暴露

#### ❌ 误区二：未处理 URL 中的 ticket，导致 URL 泄漏或重复跳转

* 需要及时清除 URL 参数，提升安全性和用户体验

#### ❌ 误区三：ticket 验证逻辑写在前端

* ticket 验证必须由**后端完成**，因为涉及调用 CAS Server、解析身份信息

</details>

## 10. 跨域场景下如何解决Cookie作用域问题 {#question-subjective-5953e88595cb}

### 题目要点

* Cookie 默认无法跨域，需通过配置 Domain、SameSite、Secure 控制作用域
* 跨域请求携带 Cookie：前端设置 `credentials: include`，服务端设置 `Access-Control-Allow-Credentials: true`
* Set-Cookie 需带上 `SameSite=None; Secure` 才允许跨域传递
* `Access-Control-Allow-Origin` 不可为通配符
* 常用于登录态共享、开发联调等跨源通信场景

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 Cookie 的作用域限制机制（Domain / Path / SameSite）**
* **是否了解跨域请求时 Cookie 的携带条件**
* **是否掌握前后端联调中解决跨域 Cookie 失效的实践方法**
* **是否能结合真实场景说明如何设置、传递、验证 Cookie**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ Cookie 的作用域控制

* **Domain**：决定 Cookie 可被哪些子域访问，默认仅当前域名可访问，可通过 `Set-Cookie: Domain=xxx.com` 设置共享
* **Path**：限制 Cookie 作用的路径，默认当前路径及子路径生效
* **SameSite**：控制跨站请求时 Cookie 是否会自动发送：

| SameSite 属性 | 描述                        |
| ----------- | ------------------------- |
| `Strict`    | 完全禁止跨站点发送 Cookie          |
| `Lax`       | 部分允许（GET 导航类请求可携带）        |
| `None`      | 允许跨站发送，但**必须设置 `Secure`** |

#### ✅ 跨域请求 Cookie 不生效的原因

1. **前端未设置 `withCredentials: true`**
2. **服务端未返回 `Access-Control-Allow-Credentials: true`**
3. **服务端未设置 `Access-Control-Allow-Origin` 为具体源（不能是 `*`）**
4. **Cookie 设置了 SameSite=Strict 或未指定导致默认限制**

---

### 1.2 前后端联调中 Cookie 跨域解决方案

#### ✅ 前端配置

```js
fetch('https://api.example.com/userinfo', {
  method: 'GET',
  credentials: 'include' // 关键点：允许携带 Cookie
});
```

* `XMLHttpRequest` 同样需要设置 `xhr.withCredentials = true`

#### ✅ 服务端配置（以 Node.js/Express 为例）

```js
res.setHeader('Access-Control-Allow-Origin', 'https://frontend.example.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

#### ✅ Cookie 设置示例

```http
Set-Cookie: token=abc123; Domain=.example.com; Path=/; SameSite=None; Secure
```

* 跨域必须使用：`SameSite=None; Secure`
* Secure 要求 HTTPS 协议才能生效

---

### 1.3 应用场景举例

#### 场景一：子域共享登录态（SSO）

* 主域名：`example.com`
* 系统1：`admin.example.com`
* 系统2：`user.example.com`

> 使用 `Set-Cookie: token=...; Domain=.example.com` 可让两个子域共享登录态

#### 场景二：前端在 `localhost:3000`，后端在 `api.example.com`

* 典型开发环境跨域情况
* 需设置：前端 `withCredentials`、后端 `Access-Control-Allow-Credentials: true`
* 后端设置 CORS `origin` 精确匹配，而非通配符

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：服务端已设置 Cookie，前端就能收到

* 如果跨域不配置 `credentials: include` + `Allow-Credentials`，浏览器不会保存 Cookie

#### ❌ 误区二：CORS 中 `Access-Control-Allow-Origin: *` 能解决所有跨域问题

* 携带 Cookie 时不能使用 `*`，必须设置明确来源

#### ❌ 误区三：SameSite=None 不生效

* 忽略了必须搭配 `Secure`，在非 HTTPS 环境中会被浏览器拒绝

</details>

## 11. 有没有使用过 lerna？是如何管理多个 package 的 {#question-subjective-877e3d0ade55}

### 题目要点

* Lerna 是 Monorepo 管理工具，用于管理多包依赖、构建、发布
* 通常搭配 Yarn Workspaces 使用，提升依赖安装和链接效率
* 通过 `lerna add` 添加依赖，通过 `lerna run` 统一执行命令
* 支持固定和独立版本模式，支持 changelog 和自动发布
* 实际可搭配 CI 工具实现变更感知构建和发布流程

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否具备 Monorepo 多包管理经验**
* **是否理解 Lerna 的核心功能和实际应用场景**
* **是否掌握 Lerna + Yarn Workspaces 的协同用法**
* **是否有能力管理多包依赖、版本、构建、发布等完整流程**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ 什么是 Lerna？

* **Lerna** 是一个基于 Git 的 Monorepo 管理工具，支持在一个仓库中管理多个 npm 包（packages）
* 主要用于解决：

  * 多包依赖版本混乱
  * 开发/构建流程重复低效
  * 包间依赖难以协调与联调

#### ✅ 核心能力

* **依赖管理**：自动分析包之间的依赖关系，链接内部依赖
* **版本管理**：统一或独立管理各个包的版本
* **发布流程**：自动生成 changelog，发布到 npm
* **执行任务**：统一在所有包中执行某个命令（如构建、测试）

#### ✅ 常见搭配：Lerna + Yarn Workspaces

* Yarn Workspaces 负责 **安装优化** 和 **软链接**
* Lerna 负责 **任务调度、依赖分析、发布控制**

---

### 1.2 如何管理多个 Package（实战角度）

#### ✅ 项目结构示例

```
/my-monorepo
├── packages/
│   ├── core/        # 公共核心包
│   ├── ui-components/
│   ├── utils/
│   └── app/         # 主业务项目
├── lerna.json
├── package.json
└── yarn.lock
```

#### ✅ 配置要点

**根目录 `package.json`：**

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

**`lerna.json` 示例（独立版本模式）：**

```json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "packages": ["packages/*"]
}
```

#### ✅ 开发流程说明

1. **创建包**

```bash
lerna create utils
```

2. **添加依赖**

```bash
lerna add lodash --scope=utils
lerna add @my-scope/utils --scope=app
```

> 自动建立包间依赖和软链接，避免重复安装

3. **统一执行命令**

```bash
lerna run build --scope=app
lerna run test --parallel
```

4. **版本发布**

```bash
lerna version  # 按包差异生成版本号
lerna publish  # 发布改动的包
```

---

### 1.3 实践经验总结

#### ✅ 使用场景

* **UI 组件库 + 工具函数包 + 多个业务模块**
* **统一维护公共依赖版本，减少冗余**
* **提升多包协作效率，适合中大型团队**

#### ✅ 优化策略

* 搭配 `changesets` 管理变更记录
* 使用 `concurrently`/`turbo` 优化多包构建并发速度
* 配合 CI/CD（如 GitHub Actions）实现变更感知构建和自动发布

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：只用 Lerna 不配 Yarn Workspaces，导致依赖安装重复

* 推荐使用 Yarn Workspaces 统一依赖安装和链接，提高效率

#### ❌ 误区二：认为所有项目都适合用 Monorepo

* 小团队/低复用场景下维护成本反而上升

#### ❌ 误区三：误用版本管理模式

* `fixed` 模式适合整体版本一致性，`independent` 模式适合功能模块独立演进

</details>

## 12. git rebase 与 git merge 的区别 {#question-subjective-a533e05cc328}

### 题目要点

* `merge`：保留历史，产生合并提交，适合多人协作
* `rebase`：线性历史，重写提交，适合个人开发、保持整洁
* `rebase` 后可用 `--ff-only` 合并，避免 merge commit
* 公共分支避免使用 `rebase`，以防历史冲突
* 冲突处理：rebase 更频繁，merge 集中发生
* 实际项目中常见模式：本地 rebase 整理，远程 merge 提交

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 Git 中分支合并的两种核心策略：rebase 与 merge**
* **是否清楚 rebase/merge 对历史记录、提交顺序、代码冲突处理的影响**
* **是否具备实际使用 rebase/merge 的经验和判断场景的能力**
* **是否了解协作开发中使用 rebase 的风险与规范**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ `git merge`：合并分支，保留分支历史

* 将两个分支的开发历史“合并”为一个新的提交（**merge commit**），形成“分叉-合并”记录
* **优点**：保留历史分支结构，直观展示分支合流情况
* **缺点**：历史提交较多，可能造成 commit log 杂乱

```bash
# 从 feature 分支合并到 main 分支
git checkout main
git merge feature
```

> 会生成一个新的合并提交（merge commit）

#### ✅ `git rebase`：变基合并，重写提交历史

* 将当前分支的提交“移动”到目标分支的最新提交之上，形成线性提交历史
* **优点**：提交记录清晰整洁，适合 review
* **缺点**：会**重写历史**，慎用在公共分支上（可能导致冲突和历史污染）

```bash
# 把 feature 分支变基到 main 分支上
git checkout feature
git rebase main
```

> 之后再合并回 `main`，可以避免 merge commit，保持提交线性

---

### 1.2 举例说明

假设你有以下提交历史：

```bash
A---B---C main
     \
      D---E feature
```

#### 使用 `git merge`：

```bash
git checkout main
git merge feature
```

结果如下：

```bash
A---B---C--------F main
     \         /
      D---E feature
```

* `F` 为合并提交，包含 C、E 的所有改动

#### 使用 `git rebase`：

```bash
git checkout feature
git rebase main
```

结果如下：

```bash
A---B---C---D'---E' feature
```

* `D`、`E` 会重新应用一遍，成为新的 `D'`、`E'`
* 若此时再合并回 main，可 `--ff-only` 快速合并（无 merge commit）

---

### 1.3 实际使用场景

| 场景            | 推荐策略          | 理由                   |
| ------------- | ------------- | -------------------- |
| 团队协作开发、保留历史   | `merge`       | 保留分支结构，便于审查          |
| 提交历史清晰、个人特性分支 | `rebase`      | 整洁提交、减少噪音            |
| 修复冲突后统一提交 PR  | `rebase`      | 避免多个 merge commit 混杂 |
| 公共分支、已推送远程    | ✅ 避免 `rebase` | rebase 会重写历史，导致协作混乱  |

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为 rebase 更高级，所有情况都适用

* 实际上 **公共分支禁止使用 rebase**，否则会引发 push/pull 冲突

#### ❌ 误区二：误用 rebase 覆盖历史，引起同事代码混乱

* 若已有同事基于该分支开发，rebase 会让他们的 base 提交失效

#### ❌ 误区三：认为 rebase 就不会有冲突

* rebase 本质是“重新应用每个提交”，更容易发生多个冲突

</details>

## 13. 事件机制讲一下，event loop {#question-subjective-2a667e8ee0b7}

### 题目要点

* JS 是单线程，Event Loop 实现异步非阻塞执行
* 宏任务：setTimeout、setInterval、I/O
* 微任务：Promise.then、queueMicrotask，优先执行
* 执行顺序：同步 → 微任务 → 下一个宏任务
* Node.js 有自己的事件循环阶段，process.nextTick 优先级更高
* 所有浏览器事件回调也是宏任务的一部分，遵循捕获-冒泡模型

<details>
<summary>参考答案</summary>

## 一、考察点

* **是否理解 JavaScript 的单线程模型及异步任务处理机制**
* **是否能准确解释 Event Loop、宏任务与微任务的概念与执行顺序**
* **是否掌握浏览器或 Node.js 中的事件循环差异**
* **是否了解异步编程与性能优化的联系**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ JavaScript 是单线程语言

* 同一时间只能执行一个任务，原因：防止 DOM 操作的并发冲突。
* 为了解决耗时任务阻塞主线程的问题，JS 使用\*\*事件循环（Event Loop）\*\*来管理异步任务。

#### ✅ 什么是 Event Loop？

Event Loop 是 JavaScript 的**运行时机制**，用于协调任务队列中的任务，确保非阻塞执行。

它的基本流程是：

1. 执行一个**主线程任务（同步代码）**
2. 查找是否有可执行的微任务（Microtask）
3. 清空所有微任务
4. 执行一个宏任务（Macrotask）
5. 回到第 2 步，循环往复

#### ✅ 任务类型分为两类：

| 类型             | 描述            | 典型场景                                                             |
| -------------- | ------------- | ---------------------------------------------------------------- |
| 宏任务（Macrotask） | 宏观层面的任务队列     | `setTimeout`、`setInterval`、`setImmediate`、`MessageChannel`、`I/O` |
| 微任务（Microtask） | 执行更快、优先级更高的任务 | `Promise.then/catch/finally`、`MutationObserver`、`queueMicrotask` |

每执行完一个宏任务，会清空所有微任务，然后再进入下一个宏任务。

---

### 1.2 举例说明（浏览器）

```js
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
}).then(() => {
  console.log('promise2');
});

console.log('script end');
```

**输出顺序如下：**

```txt
script start
script end
promise1
promise2
setTimeout
```

#### ✅ 执行顺序解析：

1. `script start` 和 `script end`：同步任务，立即执行
2. `Promise.then` 是微任务，等待同步执行完立即执行
3. `setTimeout` 是宏任务，下一轮 Event Loop 执行

---

### 1.3 Node.js 中的 Event Loop 略有不同

Node.js 的事件循环更复杂，包含如下阶段：

1. timers（`setTimeout`）
2. pending callbacks（上一轮延迟执行的回调）
3. idle, prepare
4. **poll**（I/O 阶段）
5. **check**（`setImmediate` 阶段）
6. close callbacks
7. 每一阶段结束后会清空 **微任务队列（process.nextTick / Promise）**

> 微任务优先级：
>
> * `process.nextTick`（Node 专属）优先级高于 `Promise.then`

---

### 1.4 与事件机制的关系

#### ✅ 浏览器事件机制简述

* 浏览器通过 **事件队列** 将用户行为（点击、键盘、滚动）放入任务队列中
* 每个事件回调也是一个**宏任务**
* 被触发的事件会被加入到任务队列，等待主线程空闲时执行

#### ✅ 冒泡与捕获阶段（事件传播机制）

* 捕获阶段：从外层元素向目标元素传播
* 目标阶段：事件到达目标元素
* 冒泡阶段：从目标元素向外层元素传播
* 可通过 `event.stopPropagation()` 或 `event.stopImmediatePropagation()` 控制传播行为

---

### 1.5 常见误区或面试陷阱

#### ❌ 误区一：认为 Promise 是异步的

* Promise 的**执行器（executor）是同步执行的**，只有 `.then()` 是异步（微任务）

#### ❌ 误区二：setTimeout(fn, 0) 会立即执行

* 实际会被放入宏任务队列，需等待当前任务与所有微任务执行完才运行

#### ❌ 误区三：忽略微任务的执行顺序

* 一轮宏任务执行完后，**必须先清空微任务队列**，才进入下一个宏任务

</details>

## 14. 输出顺序： {#question-subjective-b1b7fbd49e06}

```js
document.body.addEventListener('click', () => {
  Promise.resolve().then(() => console.log(1));
  setTimeout(() => console.log(2), 0);
});
// 用户点击后输出顺序？
```

### 题目要点

* `click` 事件是宏任务
* `Promise.then` 是微任务，执行顺序优先于后续宏任务
* `setTimeout` 是下一轮宏任务，因此最后执行
* 所以输出：`1` → `2`

<details>
<summary>参考答案</summary>

当用户点击页面后，以下代码：

```js
document.body.addEventListener('click', () => {
  Promise.resolve().then(() => console.log(1));
  setTimeout(() => console.log(2), 0);
});
```

会按如下 **输出顺序** 执行：

```
1
2
```

---

## ✅ 原因解析（结合 Event Loop 执行顺序）

用户点击触发 `click` 事件 → 浏览器将该事件处理函数加入 **宏任务队列**。

1. 当前主线程空闲时，开始执行这个 **宏任务**（事件回调）：

   * `Promise.resolve().then(...)`：将 `console.log(1)` 加入 **微任务队列**
   * `setTimeout(...)`：将 `console.log(2)` 加入 **下一轮宏任务队列**

2. 当前宏任务执行完毕后，进入 **微任务阶段**：

   * 执行 `console.log(1)`

3. 微任务清空后，开始下一轮事件循环，取出下一个宏任务：

   * 执行 `console.log(2)`

---

## ✅ 图示执行顺序

```text
[Event Loop 开始新轮询]
┌───────────────────────────┐
│   宏任务：click 事件回调   │
│     ├─ 加入微任务队列：log(1)
│     └─ 加入宏任务队列：log(2)
└───────────────────────────┘
        ↓
[清空微任务队列]
  → console.log(1)
        ↓
[进入下一个宏任务队列]
  → console.log(2)
```

---

## ⚠️ 延伸补充：若多次点击

如果用户连续点击 3 次，输出顺序会是：

```
1
2
1
2
1
2
```

因为每次点击都会生成一个独立的事件宏任务，**每个事件回调中的微任务都在其后立即执行，宏任务延后一轮**。

</details>

## 15. 为什么微任务在冒泡阶段立即执行而非进入任务队列 {#question-subjective-0ef58a4ce5b4}

### 题目要点

* 微任务是当前宏任务的“补充”，执行时机在宏任务结束后立即执行
* 事件冒泡阶段的回调属于当前宏任务的同步部分
* 事件回调内产生的微任务会在宏任务结束时立刻执行，保证状态和 UI 一致
* 这种设计保证了事件处理的原子性、性能和响应速度

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解微任务（Microtask）和宏任务（Macrotask）的本质区别**
* **理解浏览器事件传播机制与事件循环（Event Loop）之间的关系**
* **掌握微任务优先执行的设计原理及对性能和一致性的影响**
* **能够结合事件冒泡阶段说明微任务的执行时机**

---

## 二、参考答案

### 1.1 原理说明

#### ✅ 微任务与宏任务的区别

* **宏任务（任务队列）**：浏览器维护的主事件队列，事件处理、定时器、UI 渲染均属于宏任务。
* **微任务（微任务队列）**：由 Promise.then、MutationObserver 等产生的任务，属于当前宏任务完成后的“补充”，用来执行需要尽快完成的回调。

#### ✅ 浏览器事件传播流程

事件捕获和冒泡都是**同步执行的回调**，属于当前宏任务的一部分：

* **事件回调（如冒泡阶段监听函数）本身是宏任务的一个回调函数**，在执行时，所有同步代码都会立即执行
* 在事件回调中产生的微任务，会被加入微任务队列，并在当前宏任务执行完毕后立即执行

---

### 1.2 为什么微任务在冒泡阶段立即执行

#### 1）保持任务执行的原子性和一致性

* 浏览器在执行一个宏任务时（比如事件冒泡阶段的回调），要保证该宏任务内的所有同步代码和微任务都能**连续执行完毕**，防止中间被其他宏任务打断，保证状态一致
* 如果微任务延迟到下一个宏任务队列，可能导致 UI 更新不及时或状态不一致

#### 2）微任务设计为“当前任务的延续”

* 微任务是为了解决**异步回调“立刻”执行但不阻塞主线程**的需求
* 因此它设计成在当前宏任务执行完后立即执行，保证快速响应

#### 3）避免事件处理顺序混乱

* 如果微任务不在当前宏任务中执行，事件处理逻辑可能被后续宏任务打断，导致事件回调效果混乱

---

### 1.3 事件传播中微任务的执行时机总结

* 事件冒泡阶段执行的回调属于当前宏任务
* 回调中产生的微任务会被推入微任务队列
* 宏任务结束时，浏览器立即执行微任务队列，完成后再进入下一个宏任务
* 这样设计保证了事件响应的同步与异步操作有序且高效

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为事件回调和微任务都属于宏任务

* 事件回调是宏任务，但微任务属于更高优先级的任务队列

#### ❌ 误区二：认为微任务一定先于事件传播执行

* 事件传播是同步宏任务过程，微任务在该宏任务末尾执行，不会打断同步事件传播

#### ❌ 误区三：忽视微任务执行对 UI 更新的影响

* 微任务执行完成后才会进行下一轮渲染，延迟执行会影响性能和用户体验

</details>

## 16. 若在事件回调中嵌套queueMicrotask(() => console.log(3))，输出顺序如何变化 {#question-subjective-afb32e017028}

### 题目要点

* 事件回调是宏任务，执行过程中产生的所有微任务会按顺序排队
* `Promise.then` 和 `queueMicrotask` 都产生微任务，先进先出
* 宏任务执行完，立即清空微任务队列
* 代码输出顺序是：`1`（Promise.then） → `3`（queueMicrotask） → `2`（setTimeout）

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解事件回调（宏任务）执行机制**
* **理解微任务队列的执行时机和顺序**
* **掌握 `queueMicrotask` 的使用及其与 Promise 微任务的关系**
* **能结合事件循环分析复杂异步代码输出顺序**

---

## 二、参考答案

### 2.1 代码示例（基于之前例子）

```js
document.body.addEventListener('click', () => {
  Promise.resolve().then(() => console.log(1));
  setTimeout(() => console.log(2), 0);
  queueMicrotask(() => console.log(3));
});
```

---

### 2.2 输出顺序

```
1
3
2
```

---

### 2.3 解析执行流程

1. **点击事件触发，事件回调作为一个宏任务执行：**

   * 执行同步代码，将 `Promise.resolve().then(() => console.log(1))` 的回调加入微任务队列
   * 执行 `queueMicrotask(() => console.log(3))`，该回调也加入微任务队列（微任务队列是一个队列，先进先出）
   * 执行 `setTimeout(() => console.log(2), 0)`，其回调加入下一个宏任务队列

2. **当前宏任务（事件回调）执行完毕，开始执行微任务队列：**

   * 先执行第一个微任务 `console.log(1)`
   * 再执行第二个微任务 `console.log(3)`

3. **微任务队列清空后，进入下一轮事件循环，执行宏任务队列中的 `setTimeout` 回调：**

   * 执行 `console.log(2)`

---

### 2.4 额外说明

* `Promise.then` 和 `queueMicrotask` 都是微任务，执行顺序取决于它们加入队列的先后顺序
* 在事件回调中同步调用它们时，先加入的先执行
* `setTimeout` 属于宏任务，会延迟到下一轮事件循环执行

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-61/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-61/round-98/index.md" >}}) →
