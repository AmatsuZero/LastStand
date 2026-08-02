+++
title = "百度-地图-秋招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/41"
experienceId = 41
roundId = 55
roundOrder = 1
company = "百度"
date = "2025-07-10T14:52:42.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-41/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-59/index.md" >}}) →

**本轮要点：** 基础知识面不少，进一步考察实际工程和性能优化能力

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. BFC的作用及触发条件，使用场景讲一下 {#question-subjective-e78ee3f21e11}

### 题目要点

* CSS 样式中 BFC 的概念、特性和触发条件
* BFC 应用场景：避免多列排版间隔折行问题、清除浮动、各区域形成隔离

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**BFC (Block Formatting Context)**，即块级格式化上下文。它是 W3C CSS2.1 中的一类属性，是一个独立的布局环境，在该环境里，按照特定规则进行元素排列和布局。

**主要特性：**

- BFC 内部的元素不会和外部的元素受 margin 折行的影响
- BFC 可以包裹内部浮动元素，解决父容器高度不拉伸问题
- BFC 不会被浮动元素拉动

**触发 BFC 的条件：**

- 样式中定义此元素为 float (non-none)
- 正文模型 overflow 为 hidden, scroll, auto
- display 为 inline-block, table-cell, flex, grid, flow-root
- position 为 absolute 或 fixed

##### 1.2 核心用法 + 示例代码

**场景1：清除浮动** 常用 BFC 包裹元素，使父元素的高度得以支撑

```html
<div style="overflow: hidden">
  <div style="float: left"></div>
</div>
```

**场景2：隔离元素的相邻 margin 折行**

```html
<div style="overflow: hidden">
  <div style="margin-top: 20px"></div>
</div>
```

##### 1.3 常见误区

- 将 BFC 理解成了一种样式属性，实际上是一种规则行为
- 违规应用潜在浮动和 margin 问题场景，使用错误的 BFC 触发条件

</details>

## 2. 在使用 Webpack 时，你采取了哪些优化措施？ {#question-subjective-f08cfa5ffc76}

### 题目要点

* Webpack 性能优化方向：构建时间、初始载入、包体大小、初始化性能
* 课题目的是看候选人是否有系统的性能优化思维

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

Webpack 性能优化分为 **构建性能** 和 **运行性能** 两部分：

- **构建性能优化：**

  - 启用快缓策略：`cache-loader`，`thread-loader`
  - 分步打包：DLLPlugin，Module Federation 功能
  - 合理配置 Loader，避免不必要的复杂处理

- **运行性能优化：**

  - 分析体积，利用热更新 HMR
  - 合理的 code splitting，例如基于路由分割组件
  - 启用 Tree Shaking，删除没有用到的代码

##### 1.2 应用示例

```javascript
// 基于路由的分割
{
  path: '/user',
  component: () => import('@/pages/User.vue')
}

// Webpack 配置 Tree Shaking
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true
  }
}
```

##### 1.3 面试误区

- 只说优化轻量，没有系统思维，比如只说使用 CDN 或应用缓存，缺乏完整性
- 不能区分构建性能和运行性能优化

</details>

## 3. 地图中大量 Markers 的渲染性能如何优化？ {#question-subjective-7ba40d2bb7b8}

### 题目要点

* 地图、Canvas/WebGL 渲染、数据量管控、性能解决思路
* 深度进一步看候选人对 DOM 性能、虚拟列表、分块渲染等技术的理解

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

地图中标记点 (Marker) 的数量过大会导致渲染性能下降，原因包括：

- DOM 元素过多影响重排和重绘
- 多个 Marker 同时加载造成 UI 卡顿
- 用户交互区域过密导致性能负担

##### 1.2 核心优化方案

- **Canvas 或 WebGL 渲染**：使用底层图形渲染技术代替 DOM 提高性能
- **分块加载**：根据地图缩放级别和当前视野范围，按需加载 Marker
- **数据缓存**：对不可变数据进行缓存，避免重复计算和渲染
- **Cluster 聚合渲染**：区域内 Marker 聚合成簇图标，减少渲染节点数

##### 1.3 应用示例

- 使用 Mapbox GL 的 `supercluster` 插件实现 Marker 聚类
- 使用 `requestAnimationFrame` + Canvas 实现渐进式绘制

##### 1.4 常见误区

- 使用纯 DOM 渲染 Marker 数万点，导致浏览器崩溃
- 忽略地图缩放行为，所有 Marker 一次性渲染，无差异化处理
- 未使用缓存，导致缩放或移动时重复计算渲染

</details>

## 4. 在项目中，你使用过哪些ES6特性？ {#question-subjective-4b30bef52aa4}

### 题目要点

* ES6 新特性使用能力
* 代码简洁性与语义化理解
* 实际应用场景的表达能力

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

ES6 是 JavaScript 的一次重大更新，引入了大量新特性，常用特性如下：

- **let / const**：块级作用域，防止变量提升和重复定义
- **解构赋值**：快速获取对象或数组中的值
- **箭头函数**：简洁语法，自动绑定 this
- **模板字符串**：增强字符串拼接能力
- **Promise**：解决回调地狱的问题
- **模块化 import/export**：便于组织项目结构

##### 1.2 应用示例

```javascript
const person = { name: 'Tom', age: 20 };
const { name } = person; // 解构赋值

const greet = (msg) => console.log(msg); // 箭头函数

const getInfo = (user) => `姓名是${user.name}, 年龄是${user.age}`; // 模板字符串
```

##### 1.3 常见误区

- 不了解 let/const 与 var 的区别
- 箭头函数 this 行为与普通函数混淆
- 模块化理解偏差，不清楚默认导出和命名导出的区别

</details>

## 5. 常见的HTTP状态码有哪些？分别表示什么含义？ {#question-subjective-c134aa003e4b}

### 题目要点

* HTTP 协议基础知识
* 请求/响应状态处理机制
* 状态码在调试、监控和用户提示中的作用

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

HTTP 状态码用于表示响应结果。根据含义，状态码可以分为以下几类：

- **1xx 信息性状态码**：服务器已接收请求，继续处理
- **2xx 成功**：表示请求已被成功处理，例如：
  - `200 OK`：请求成功
  - `201 Created`：资源创建成功
- **3xx 重定向**：客户端需进一步操作以完成请求，例如：
  - `301 Moved Permanently`：永久重定向
  - `302 Found`：临时重定向
- **4xx 客户端错误**：请求有误，例如：
  - `400 Bad Request`：请求格式错误
  - `401 Unauthorized`：未授权
  - `403 Forbidden`：禁止访问
  - `404 Not Found`：资源不存在
- **5xx 服务端错误**：服务器处理请求失败，例如：
  - `500 Internal Server Error`：服务器内部错误
  - `502 Bad Gateway`：网关错误
  - `503 Service Unavailable`：服务不可用

##### 1.2 使用场景说明

- `200` 是最常见的成功状态码，配合 `Content-Type` 提示响应类型
- `304 Not Modified` 可用于前端缓存控制
- `404` 用于接口异常处理与页面兜底提示
- `401` 和 `403` 多用于权限拦截

##### 1.3 常见误区

- 混淆 `401` 和 `403`
- 误以为 `302` 是错误状态，实际是浏览器常见跳转行为

</details>

## 6. 前端缓存机制讲一下，如何利用前端缓存机制优化性能？ {#question-subjective-a38c9c09e34f}

### 题目要点

* 浏览器缓存类型与控制策略
* 利用缓存提升加载性能的手段
* 缓存策略在真实项目中的使用场景

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

前端缓存机制主要依赖浏览器的 HTTP 缓存控制，分为：

- **强缓存**：浏览器不发请求，直接使用缓存资源
  - `Cache-Control: max-age`、`Expires`
- **协商缓存**：浏览器发起请求，服务器判断是否命中缓存
  - `Last-Modified / If-Modified-Since`
  - `ETag / If-None-Match`

##### 1.2 应用场景

- JS/CSS/图片等静态资源启用强缓存，减少重复加载
- HTML 页面采用协商缓存，保证更新可控
- 使用 Service Worker 做更复杂的离线缓存与预加载策略

##### 1.3 注意点与误区

- 文件 hash 命名配合强缓存可以确保更新时缓存失效
- 忽视缓存带来的接口数据一致性问题（需结合版本控制）

</details>

## 7. HTTPS相较于HTTP有哪些优势？讲一下HTTPS的加密原理。 {#question-subjective-1e7189332890}

### 题目要点

* HTTP 与 HTTPS 的安全性对比
* TLS 握手流程及加密方式理解

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

HTTPS（HTTP over SSL/TLS）通过 TLS 协议加密传输，保障通信安全。相比 HTTP：

- 数据加密防止被窃听
- 身份验证防止钓鱼与中间人攻击
- 数据完整性验证防篡改

**TLS 加密过程包括：**

1. 客户端发起请求，携带支持的加密算法和随机数
2. 服务器返回证书和加密参数
3. 客户端验证证书并生成对称密钥，使用服务器公钥加密发送
4. 双方协商后使用对称加密进行通信

##### 1.2 优势与场景

- 所有电商、登录、支付等敏感数据传输必须使用 HTTPS
- 与 HTTP 相比，提高 SEO 排名

##### 1.3 常见误区

- 误以为 HTTPS 性能差，现代浏览器已有优化（如会话复用）
- 忽略证书失效、伪造等安全隐患

</details>

## 8. 请求头中包含哪些重要信息？如何通过请求头实现跨域资源共享（CORS）？ {#question-subjective-9f90c02de25f}

### 题目要点

* 请求头常用字段作用
* CORS 跨域通信机制

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

请求头包含了客户端发送给服务器的元数据，常见有：

- `Host`：目标主机地址
- `User-Agent`：客户端信息
- `Content-Type`：请求体类型
- `Authorization`：身份验证信息
- `Cookie`：携带用户状态信息

跨域资源共享（CORS）通过服务器返回以下响应头实现：

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

##### 1.2 示例说明

```http
OPTIONS /api/data HTTP/1.1
Origin: http://frontend.com

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://frontend.com
Access-Control-Allow-Methods: GET, POST
```

##### 1.3 常见误区

- 认为前端设置请求头就可实现跨域，实际是服务端控制的行为
- 忽略带 cookie 请求需要加 `Access-Control-Allow-Credentials`

</details>

## 9. Vue的响应式原理是什么？如何实现数据的双向绑定？ {#question-subjective-8fc82ab2e98b}

### 题目要点

* Vue 2 响应式依赖收集机制
* 双向绑定中的数据监听与更新过程

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

Vue 2 使用 `Object.defineProperty` 实现响应式：

- 对数据对象遍历劫持属性，定义 getter 和 setter
- 读取时收集依赖（Watcher）
- 修改时触发更新（Dep 通知更新视图）

双向绑定依赖 `v-model` 指令：

- 本质是 value + input 的语法糖
- 数据 -> DOM（通过绑定）
- DOM -> 数据（通过 input 事件）

##### 1.2 示例说明

```vue
<input v-model="message" />
// 等价于：
<input :value="message" @input="message = $event.target.value" />
```

##### 1.3 面试误区

- 混淆 Vue 2 与 Vue 3 的响应式实现方式（Vue 3 用 Proxy）
- 认为双向绑定等于响应式，实际上是语法层面封装

</details>

## 10. Vue的响应式原理中，为什么直接通过索引修改数组元素无法触发更新？如何解决？ {#question-subjective-a8d1d452b933}

### 题目要点

* Vue 2 数组响应式机制限制
* 替代方案与 Vue 内置方法

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

Vue 2 使用 `Object.defineProperty` 劫持属性，但数组索引无法被单独劫持，导致：

```javascript
this.list[0] = 123; // 无法触发响应式更新
```

##### 1.2 正确方式

使用 `Vue.set` 或 `this.$set`

```javascript
this.$set(this.list, 0, 123);
```

或者使用 `splice` 替代：

```javascript
this.list.splice(0, 1, 123);
```

##### 1.3 常见误区

- 直接赋值数组索引却未更新视图，忽略了 Vue 监听不到的边界条件
- 在大型数据结构中频繁操作索引，不做封装处理

</details>

## 11. 实现一个函数，计算二叉树的最大深度 {#question-subjective-b8e2328d74d8}

**题目描述**：二叉树的深度是指从根节点到最远叶子节点的最长路径上的节点数。请实现一个函数，接收一个二叉树的根节点作为输入，返回该二叉树的最大深度。

**输入输出要求**：输入一个二叉树的根节点，输出一个整数，表示二叉树的最大深度。

**示例**：

```javascript
// 示例二叉树：
//     3
//    / \
//   9  20
//     /  \
//    15   7
// 最大深度为3
const root = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } }
};
console.log(maxDepth(root)); // 输出：3
```

### 题目要点

* 树结构的递归理解与遍历方式
* 二叉树节点定义与递归边界处理能力
* 面试者代码实现的规范性和边界场景处理

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

二叉树的最大深度是从根节点到最远叶子节点路径上的最大层数。 可采用 **递归深度优先遍历（DFS）**，分别计算左右子树的最大深度，并取最大值加 1。

##### 1.2 示例代码

```javascript
function maxDepth(root) {
  if (!root) return 0;
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  return Math.max(leftDepth, rightDepth) + 1;
}

// 示例二叉树：
const root = {
  val: 3,
  left: { val: 9, left: null, right: null },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
};
console.log(maxDepth(root)); // 输出：3
```

##### 1.3 常见误区

- 忘记递归终止条件
- 没有处理空节点或 null 判断
- 返回值错误地使用 +2 或未考虑 Math.max

</details>

## 12. 编写一个函数，实现两个二进制数字符串的相加，并返回结果字符串。 {#question-subjective-f95e9a4d493a}

**题目描述**：给定两个表示二进制数的字符串，编写一个函数将它们相加，并返回相加后的结果字符串。输入和输出都为字符串，且只包含字符 '0' 和 '1'。

 **输入输出要求**：输入两个字符串形式的二进制数，输出一个字符串，表示两个输入二进制数的和。

**示例**：

```javascript
const a = "1101";
const b = "1011";
console.log(addBinary(a, b)); // 输出："11000"
```

### 题目要点

* 字符串模拟二进制运算的能力
* 对边界情况的处理与代码鲁棒性
* 字符串遍历技巧（逆序处理）

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

从两个字符串末尾向前遍历，逐位模拟二进制加法。

- 使用两个指针从尾部开始移动
- 使用进位标志 carry 存储上一位是否进位
- 每一位做加法后，保存当前位结果，更新 carry

##### 1.2 示例代码

```javascript
function addBinary(a, b) {
  let i = a.length - 1, j = b.length - 1;
  let carry = 0, result = '';

  while (i >= 0 || j >= 0 || carry) {
    const bitA = i >= 0 ? parseInt(a[i--]) : 0;
    const bitB = j >= 0 ? parseInt(b[j--]) : 0;
    const sum = bitA + bitB + carry;
    result = (sum % 2) + result;
    carry = Math.floor(sum / 2);
  }
  return result;
}

const a = "1101";
const b = "1011";
console.log(addBinary(a, b)); // 输出："11000"
```

##### 1.3 常见误区

- 忽略进位逻辑，导致溢出问题
- 忽略输入为空字符串时的处理
- 直接用 parseInt(a, 2) + parseInt(b, 2) 后再 toString(2)，不符合题意中的“手写实现”

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-41/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-41/round-59/index.md" >}}) →
