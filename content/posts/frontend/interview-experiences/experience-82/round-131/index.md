+++
title = "百度-百家号-实习 · 第 1 轮 · 技术面试"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/82"
experienceId = 82
roundId = 131
roundOrder = 1
company = "百度"
date = "2026-01-31T09:19:52.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-82/_index.md" >}}) · 已是最后一轮 →

**本轮概述：** 该轮主要考察前端基础知识、JavaScript高级特性、HTTP协议、Vue与React框架对比、Git操作以及算法实现能力。问题涵盖理论理解与实际应用，氛围较为专业。

本轮共 16 道题。答案默认折叠，便于先自行作答。

## 1. 如何判断一个变量是数组？ {#question-25a1d366-42f6-42e2-9a41-b6dd4624fd55}

> 题库原题：[判断数组的方式有哪些？](https://fe.ecool.fun/topic/25a1d366-42f6-42e2-9a41-b6dd4624fd55)

### 题目要点

- **推荐方法**：使用 `Array.isArray()`，这是最简单、最可靠的方式来检查一个值是否为数组。
- **其他方法**：`instanceof` 和 `Object.prototype.toString.call()` 也很有效，但有一些特定的局限性。`constructor` 和 `isPrototypeOf()` 方法不如 `Array.isArray()` 可靠，且在某些情况下可能会出现问题。

<details>
<summary>参考答案</summary>

判断一个值是否为数组的方式有多种：

### 1. **`Array.isArray()` 方法**

- **描述**：这是 ES5 引入的标准方法，推荐用于检查一个值是否为数组。
- **语法**：`Array.isArray(value)`
- **示例**：
  ```javascript
  console.log(Array.isArray([1, 2, 3])); // true
  console.log(Array.isArray('hello')); // false
  ```

### 2. **`instanceof` 操作符**

- **描述**：使用 `instanceof` 操作符来判断对象是否是 `Array` 的实例。
- **语法**：`value instanceof Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3] instanceof Array); // true
  console.log('hello' instanceof Array); // false
  ```

### 3. **`Object.prototype.toString.call()` 方法**

- **描述**：使用 `Object.prototype.toString.call()` 可以准确判断一个对象的类型，包括数组。它返回 `[object Array]` 对于数组，其他类型则返回不同的结果。
- **语法**：`Object.prototype.toString.call(value)`
- **示例**：
  ```javascript
  console.log(Object.prototype.toString.call([1, 2, 3])); // [object Array]
  console.log(Object.prototype.toString.call('hello')); // [object String]
  ```

### 4. **`constructor` 属性**

- **描述**：检查 `constructor` 属性是否为 `Array`。这种方法不如 `Array.isArray()` 可靠，因为 `constructor` 可以被改变。
- **语法**：`value.constructor === Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3].constructor === Array); // true
  console.log('hello'.constructor === Array); // false
  ```

### 5. **`Array.prototype.isPrototypeOf()` 方法**

- **描述**：检查数组的 `prototype` 是否在目标对象的 `prototype` 链上。这种方法也可以用来判断一个对象是否为数组。
- **语法**：`Array.prototype.isPrototypeOf(value)`
- **示例**：
  ```javascript
  console.log(Array.prototype.isPrototypeOf([1, 2, 3])); // true
  console.log(Array.prototype.isPrototypeOf('hello')); // false
  ```

### 6. **使用 `constructor` 属性和原型链**

- **描述**：结合 `constructor` 属性和原型链检查。这个方法有一定的局限性，不推荐使用。
- **示例**：
  ```javascript
  function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
  }

  console.log(isArray([1, 2, 3])); // true
  console.log(isArray('hello')); // false
  ```

</details>

## 2. 讲一下闭包及其优缺点。 {#question-subjective-9627e396b5fc}

### 题目要点

函数嵌套, 词法作用域, 内存管理

<details>
<summary>参考答案</summary>

闭包是指函数能够访问并记住其词法作用域的特性，即使该函数在其作用域外执行。优点包括封装数据、保持状态、实现模块化等。缺点包括内存占用较高、可能造成内存泄漏。关键点包括：函数嵌套、词法作用域、内存管理。

</details>

## 3. 以下代码输出并解释原因： {#question-a2c0b41f-1a7e-478b-9e0f-eba7e31a0b2c}

> 题库原题：[【Promise第九题】下面两段代码分别输出什么？](https://fe.ecool.fun/topic/a2c0b41f-1a7e-478b-9e0f-eba7e31a0b2c)

代码一：
```js
setTimeout(() => {
  console.log('timer1');
  setTimeout(() => {
    console.log('timer3')
  }, 0)
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```

代码二：
```js
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => {
    console.log('promise')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```

### 题目要点

核心考查：以下代码输出并解释原因：的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

代码一输出：
```
'start'
'timer1'
'timer2'
'timer3'
```

代码二输出：
```
'start'
'timer1'
'promise'
'timer2'
```

这两个例子，看着好像只是把第一个定时器中的内容换了一下而已。

一个是为定时器timer3，一个是为Promise.then

但是如果是定时器timer3的话，它会在timer2后执行，而Promise.then却是在timer2之前执行。

你可以这样理解，Promise.then是微任务，它会被加入到本轮中的微任务列表，而定时器timer3是宏任务，它会被加入到下一轮的宏任务中。

</details>

## 4. 对比HTTP/1.1、HTTP/2、的区别。 HTTP/2的Server Push如何优化首屏加载？ {#question-d535efce-d820-4ad3-9723-e0e7373f542f}

> 题库原题：[HTTP1.0，HTTP1.1，HTTP2.0之间有什么区别？](https://fe.ecool.fun/topic/d535efce-d820-4ad3-9723-e0e7373f542f)

### 题目要点

### HTTP1.0与HTTP1.1的区别

1. **缓存处理**：
   - **HTTP1.0**：使用`If-Modified-Since`和`Expires`作为缓存判断标准。
   - **HTTP1.1**：引入了`Entity tag`、`If-Unmodified-Since`、`If-Match`、`If-None-Match`等更多缓存控制策略。
2. **带宽优化**：
   - **HTTP1.0**：存在浪费带宽的现象，不支持断点续传。
   - **HTTP1.1**：默认支持断点续传，提高了带宽利用率。
3. **Host头处理**：
   - **HTTP1.0**：不传递主机名（hostname）。
   - **HTTP1.1**：请求和响应消息都支持Host头域，没有Host头域会报告错误。
4. **长连接**：
   - **HTTP1.0**：需要使用`keep-alive`参数建立长连接。
   - **HTTP1.1**：默认支持长连接，减少了建立和关闭连接的消耗和延迟。
5. **错误通知的管理**：
   - **HTTP1.1**：新增了24个错误状态响应码，如409（Conflict）和410（Gone）。
6. **新增请求方式**：
   - **HTTP1.1**：新增了PUT、DELETE、OPTIONS、CONNECT、TRACE等请求方式。

### HTTP2.0与HTTP1.x的区别

1. **二进制分帧**：
   - **HTTP2.0**：使用二进制格式代替文本格式，提高了协议的健壮性。
2. **多路复用（MultiPlexing）**：
   - **HTTP2.0**：允许在单一连接上并发处理多个请求和响应，提高了连接的利用率。
   - **HTTP1.x**：同一时间对同一域名下的请求数量有限制，超过限制的请求会被阻塞。
3. **header压缩**：
   - **HTTP2.0**：使用HPACK算法对header数据进行压缩，减少了需要传输的header大小。
4. **服务端推送**：
   - **HTTP2.0**：允许服务器在客户端请求之前主动推送数据，如JS和CSS文件。

### 总结

HTTP1.0是最初的HTTP协议版本，它在互联网的发展中发挥了重要作用，但随着时间的推移，它的性能限制变得越来越明显。

HTTP1.1对HTTP1.0进行了许多改进，提高了性能和安全性。然而，随着互联网的进一步发展，HTTP1.1也遇到了一些性能瓶颈，如线程阻塞、连接限制等。

HTTP2.0是在HTTP1.x基础上进行了重大改进的版本，它通过二进制分帧、多路复用、header压缩和服务端推送等机制，大幅提高了传输性能，减少了延迟和提高了吞吐量。这些改进使得HTTP2.0成为目前互联网上最常用的HTTP协议版本之一。

<details>
<summary>参考答案</summary>

## HTTP1.0 和 HTTP1.1 的一些区别

### 缓存处理

在 HTTP1.0 中主要使用 header 里的 `If-Modified-Since`（比较资源最后的更新时间是否一致）,`Expires`（资源的过期时间（取决于客户端本地时间）） 来做为缓存判断的标准。

HTTP1.1 则引入了更多的缓存控制策略：

- `Entity tag`：资源的匹配信息
- `If-Unmodified-Since`：比较资源最后的更新时间是否不一致
- `If-Match`：比较 ETag 是否一致
- `If-None-Match`：比较 ETag 是否不一致

等更多可供选择的缓存头来控制缓存策略。

### 带宽优化

HTTP1.0 中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能。

HTTP 1.1默认支持断点续传。

### Host 头处理

在 HTTP1.0 中认为每台服务器都绑定一个唯一的 IP 地址，因此，请求消息中的 URL 并没有传递主机名（hostname）。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机，并且它们共享一个 IP 地址。HTTP1.1 的请求消息和响应消息都应支持 Host 头域，且请求消息中如果没有 Host 头域会报告一个错误（400 Bad Request）。

### 长连接

HTTP1.0 需要使用`keep-alive`参数来告知服务器端要建立一个长连接，而 HTTP1.1 默认支持长连接，一定程度上弥补了 HTTP1.0 每次请求都要创建连接的缺点。

HTTP 是基于 TCP/IP 协议的，创建一个 TCP 连接是需要经过三次握手的,有一定的开销，如果每次通讯都要重新建立连接的话，对性能有影响。因此最好能维持一个长连接，可以用个长连接来发多个请求。

HTTP1.1 支持长连接（PersistentConnection）和请求的流水线（Pipelining）处理，在一个 TCP 连接上可以传送多个 HTTP 请求和响应，减少了建立和关闭连接的消耗和延迟。

### 错误通知的管理

在 HTTP1.1 中新增了 24 个错误状态响应码，如 409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。

### 新增请求方式

- PUT：请求服务器存储一个资源
- DELETE：请求服务器删除标识的资源
- OPTIONS：请求查询服务器的性能，或者查询与资源相关的选项和需求
- CONNECT：保留请求以供将来使用
- TRACE：请求服务器回送收到的请求信息，主要用于测试或诊断

## HTTP2.0 与 HTTP1.X 的区别

HTTP1.X 版本的缺陷概括来说是：线程阻塞，在同一时间，同一域名的请求有一定的数量限制，超过限制数目的请求会被阻塞。

### 二进制分帧

HTTP1.x 的解析是基于文本。基于文本协议的格式解析存在天然缺陷，文本的表现形式有多样性，要做到健壮性考虑的场景必然很多，二进制则不同，只认 0 和 1 的组合。基于这种考虑 HTTP2.0 的协议解析决定采用二进制格式，实现方便且健壮。

HTTP2.0 在 应用层(HTTP2.0)和传输层(TCP/UDP)之间增加一个二进制分帧层。在不改动 HTTP1.X 的语义、方法、状态码、URI 以及首部字段的情况下, 解决了 HTTP1.1 的性能限制，改进传输性能，实现低延迟和高吞吐量。在二进制分帧层中，HTTP2.0 会将所有传输的信息分割为更小的消息和帧（frame）,并对它们采用二进制格式的编码 ，其中 HTTP1.X 的首部信息会被封装到 HEADER frame，而相应的 Request Body 则封装到 DATA frame 里面。

- 帧：HTTP2.0 数据通信的最小单位消息：指 HTTP2.0 中逻辑上的 HTTP 消息。例如请求和响应等，消息由一个或多个帧组成。

- 流：存在于连接中的一个虚拟通道。流可以承载双向消息，每个流都有一个唯一的整数 ID。

### 多路复用（MultiPlexing）

多路复用允许同时通过单一的 HTTP2.0 连接发起多重的请求-响应消息。即是连接共享，提高了连接的利用率，降低延迟。即每一个 request 都是是用作连接共享机制的。一个 request 对应一个 id，这样一个连接上可以有多个 request，每个连接的 request 可以随机的混杂在一起，接收方可以根据 request 的 id 将 request 再归属到各自不同的服务端请求里面。

在 HTTP1.1 协议中浏览器客户端在同一时间，针对同一域名下的请求有一定数量限制。超过限制数目的请求会被阻塞。这也是为何一些站点会有多个静态资源 CDN 域名的原因之一。

当然 HTTP1.1 也可以多建立几个 TCP 连接，来支持处理更多并发的请求，但是创建 TCP 连接本身也是有开销的。

TCP 连接有一个预热和保护的过程，先检查数据是否传送成功，一旦成功过，则慢慢加大传输速度。因此对应瞬时并发的连接，服务器的响应就会变慢。所以最好能使用一个建立好的连接，并且这个连接可以支持瞬时并发的请求。

HTTP2.0 可以很容易的去实现多流并行而不用依赖建立多个 TCP 连接，同个域名只需要占用一个 TCP 连接，消除了因多个 TCP 连接而带来的延时和内存消耗。HTTP2.0 把 HTTP 协议通信的基本单位缩小为一个一个的帧，这些帧对应着逻辑流中的消息。并行地在同一个 TCP 连接上双向交换消息。

### header 压缩

HTTP1.x 的 header 带有大量信息，而且每次都要重复发送，HTTP2.0 使用 HPACK 算法对 header 的数据进行压缩，减少需要传输的 header 大小，通讯双方各自 cache 一份 header fields 表，差量更新 HTTP 头部，既避免了重复 header 的传输，又减小了需要传输的大小。

header 采取的压缩策略：

- HTTP2.0 在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键－值对，对于相同的数据，不再通过每次请求和响应发送；
- 首部表在 HTTP2.0 的连接存续期内始终存在，由客户端和服务器共同渐进地更新;
- 每个新的首部键－值对要么被追加到当前表的末尾，要么替换表中之前的值。

### 服务端推送（server push）

服务端推送是一种在客户端请求之前发送数据的机制。

服务端可以在发送页面 HTML 时主动推送其它资源，而不用等到浏览器解析到相应位置，发起请求再响应。例如服务端可以主动把 JS 和 CSS 文件推送给客户端，而不需要客户端解析 HTML 时再发送这些请求。

服务器端推送的这些资源其实存在客户端的某处地方，客户端直接从本地加载这些资源就可以了，不用走网络，速度自然是快很多的。

</details>

## 5. 强缓存与协商缓存 {#question-7f7e5941-1079-476a-8a62-8ca51879c7ab}

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

## 6. 如何通过Service Worker实现离线缓存？ {#question-b84d40fe-e50a-48e1-b6bf-ddaf036b64fd}

> 题库原题：[Service Worker 是如何缓存 http 请求资源的？](https://fe.ecool.fun/topic/b84d40fe-e50a-48e1-b6bf-ddaf036b64fd)

### 题目要点

Service Worker 通过拦截 HTTP 请求，并使用缓存 API 存储和管理缓存资源，使得应用能够离线访问，提高了应用的性能和可靠性。核心过程包括注册 Service Worker、在 `install` 事件中预缓存资源、在 `fetch` 事件中拦截请求并从缓存或网络返回资源，以及在 `activate` 事件中进行缓存清理。

<details>
<summary>参考答案</summary>

Service Worker 的缓存机制是通过缓存 API 实现的，它允许开发者拦截和缓存 HTTP 请求，以提高离线体验和加速页面加载。以下是 Service Worker 缓存 HTTP 请求资源的基本流程和原理：

### **1. 注册 Service Worker**

首先，Service Worker 需要在浏览器中注册。通常在主线程（如 JavaScript 入口文件）中进行注册：

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### **2. 安装 Service Worker**

在 Service Worker 脚本中，首先会触发 `install` 事件。在这个事件中，可以预缓存一些资源，以便在 Service Worker 激活后立即可用：

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
        '/images/logo.png'
      ]);
    })
  );
});
```

### **3. 激活 Service Worker**

`activate` 事件在 Service Worker 安装完成后触发。可以在这个事件中进行缓存清理，删除旧的缓存：

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // 这里可以指定要删除的缓存
          return cacheName !== 'my-cache-v1';
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
```

### **4. 拦截和缓存请求**

`fetch` 事件允许 Service Worker 拦截所有的网络请求。可以根据需要从缓存中返回资源，或将请求转发到网络：

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 如果缓存中有匹配的资源，直接返回
      if (cachedResponse) {
        return cachedResponse;
      }

      // 否则，发起网络请求
      return fetch(event.request).then(response => {
        // 克隆响应对象，因为响应只能被消费一次
        const responseClone = response.clone();

        // 将网络请求的结果缓存
        caches.open('my-cache-v1').then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(() => {
      // 网络和缓存都失败的情况
      return new Response('Oops, something went wrong.');
    })
  );
});
```

### **5. 资源管理**

- **缓存清理**：定期删除过期或不再需要的缓存，保持缓存的健康状态。
- **缓存策略**：可以实现不同的缓存策略，如缓存优先、网络优先、缓存和网络同时等。

</details>

## 7. Vue与React区别 {#question-a97eb340-1a7f-4456-aff3-a187d9570421}

> 题库原题：[React 和 Vue 在技术层面有哪些区别？](https://fe.ecool.fun/topic/a97eb340-1a7f-4456-aff3-a187d9570421)

### 题目要点

React 和 Vue 是当前流行的前端框架，它们在技术层面有以下区别：

- **组件化方式**：React 采用组件化，组件封装了状态和行为，共享状态树。Vue 组件也有自己的状态，数据和行为绑定更简单。
- **数据驱动**：React 使用单向数据流，从父组件到子组件，数据交互更复杂。Vue 采用双向数据绑定，数据交互更简洁。
- **模板语法**：React 使用 JSX，结合 HTML 和 JavaScript，编写组件更直观。Vue 使用模板语法，支持表达式和指令，可读性和维护性更高。
- **生命周期**：React 生命周期分为初始化、更新、卸载三个阶段。Vue 生命周期包括创建、挂载、更新、销毁等八个阶段。
- **状态管理**：React 通常使用 Redux 或 MobX 管理状态。Vue 则使用 Vuex 管理共享状态。
- **性能优化**：React 使用虚拟 DOM 优化渲染性能。Vue 使用模板编译和响应式系统，并提供懒加载和缓存等技术。

<details>
<summary>参考答案</summary>

React 和 Vue 是当前比较流行的前端框架，它们在技术层面有以下区别：

- 组件化方式不同：React 是基于组件实现的，组件包含了状态和行为，所有组件共享一个状态树。Vue 也是基于组件实现的，但是每个组件都有自己的状态，并且可以很容易地将数据和行为绑定在一起。

- 数据驱动方式不同：React 使用单向数据流来管理数据，即从父组件到子组件的传递，所以 React 中组件之间的数据交互相对更加复杂。Vue 则使用双向数据绑定来管理数据，使得组件之间的数据交互更加简洁。

- 模板语法不同：React 使用 JSX 语法，将 HTML 和 JavaScript 结合在一起，使得编写组件更加直观和灵活。Vue 则使用模板语法，并且支持模板内的表达式和指令，使得编写组件具有更高的可读性和可维护性。

- 生命周期不同：React 组件的生命周期分为三个阶段：初始化、更新和卸载。Vue 组件的生命周期分为八个阶段：创建、挂载、更新、销毁等。

- 状态管理方式不同：React 使用 Redux 或者 MobX 来管理应用程序的状态。Vue 则提供了自己的状态管理库 Vuex，可以更方便地管理组件之间的共享状态。

- 性能优化方式不同：React 使用虚拟 DOM 技术来实现高效的渲染性能，可以减少每次渲染时需要操作真实 DOM 的次数。Vue 则使用模板编译和响应式系统来实现高效的渲染性能，并且还提供了一些优化技术，例如懒加载和缓存等。

开发人员可以根据项目需求和个人喜好选择合适的框架。

</details>

## 8. Pinia与Vuex的区别 {#question-ae11a7eb-f3b1-487a-9ddc-8c4e29b9d81a}

> 题库原题：[说说 Pinia 与 Vuex 的区别](https://fe.ecool.fun/topic/ae11a7eb-f3b1-487a-9ddc-8c4e29b9d81a)

### 题目要点

| 对比点            | Pinia                               | Vuex                              |
|-------------------|-------------------------------------|-----------------------------------|
| **易用性**       | 轻量简单，贴合 Vue3 API             | 配置严格，学习成本较高            |
| **类型支持**     | 内置类型推导，TypeScript 友好        | 类型支持需手动实现                |
| **性能**         | 基于 Vue3 响应式系统，性能更优       | Vue2 响应式性能稍逊              |
| **模块化**       | 扁平化设计，模块更灵活               | 嵌套模块，适合大型项目             |

在 Vue3 中，**Pinia 是官方推荐的状态管理库**，相比 Vuex 更轻量、现代，适合新项目开发；而 Vuex 在一些老旧的 Vue2 项目中仍有广泛使用。

<details>
<summary>参考答案</summary>

Pinia 和 Vuex 是 Vue 生态中两种状态管理工具，它们的功能类似，但在设计理念、用法和性能上存在一些区别。Pinia 是 Vuex 的替代者，并在 Vue3 生态中逐渐成为推荐的状态管理工具。

以下是它们的对比分析：

---

### **1. 基本对比**
| 特性                | Pinia                         | Vuex                          |
|---------------------|-------------------------------|-------------------------------|
| **作者**           | Vue 核心团队成员尤雨溪         | Vue 核心团队                 |
| **版本支持**       | Vue 3（也支持 Vue 2）         | Vue 2 和 Vue 3               |
| **模块化设计**     | 扁平结构，模块化更灵活         | 嵌套模块，需显式声明         |
| **学习成本**       | 简单，语法贴近 Vue 3 Composition API | 较复杂，语法严格             |
| **状态持久化**     | 不支持直接内置功能（需插件）     | 无内置支持                   |
| **开发体验**       | 支持 TypeScript 的类型推导优化  | 支持但需要手动配置           |

---

### **2. 核心区别**

#### **2.1 状态的定义方式**
- **Pinia**：
  - 使用函数形式的 `defineStore` 定义 Store。
  - 状态是基于 `reactive` 的，天然响应式，支持直接解构使用。
  ```javascript
  import { defineStore } from 'pinia';

  const useStore = defineStore('main', {
    state: () => ({
      count: 0,
    }),
    actions: {
      increment() {
        this.count++;
      },
    },
  });
  ```
  解构使用：
  ```javascript
  const { count, increment } = useStore();
  ```

- **Vuex**：
  - 需要严格按模块化、`state`, `mutations`, `actions` 分离定义。
  - 必须通过 `store.commit` 或 `store.dispatch` 修改状态。
  ```javascript
  const store = new Vuex.Store({
    state: {
      count: 0,
    },
    mutations: {
      increment(state) {
        state.count++;
      },
    },
    actions: {
      increment({ commit }) {
        commit('increment');
      },
    },
  });
  ```

---

#### **2.2 模块化**
- **Pinia**：<br>
  没有嵌套模块的概念，推荐按功能模块划分 Store，每个 Store 都是独立的。模块之间通过 Store 引用即可，逻辑清晰。

- **Vuex**：<br>
  通过嵌套的 `modules` 管理状态，每个模块有自己的 `state`、`mutations`、`actions`，适合大型项目，但可能出现层级过深的问题。

---

#### **2.3 使用 TypeScript**
- **Pinia**：<br>
  天然支持 TypeScript，通过 `defineStore` 自动推导类型，开发者无需额外配置，类型友好。
  ```typescript
  const useStore = defineStore('main', {
    state: () => ({
      count: 0,
    }),
  });

  const store = useStore();
  store.count; // TypeScript 自动推断为 number
  ```

- **Vuex**：<br>
  TypeScript 支持较弱，需要手动定义类型，且需要大量模板代码来维护类型定义。
  ```typescript
  interface State {
    count: number;
  }

  const store = new Vuex.Store<State>({
    state: {
      count: 0,
    },
  });

  store.state.count; // 需手动指定类型
  ```

---

#### **2.4 状态修改方式**
- **Pinia**：<br>
  支持直接修改状态，无需通过 `mutations`。逻辑更简单，易于维护。
  ```javascript
  const store = useStore();
  store.count++; // 直接修改状态
  ```

- **Vuex**：<br>
  必须通过 `mutations` 修改状态，不能直接改变 `state`，使得代码较为冗长。
  ```javascript
  store.commit('increment'); // 必须通过 mutations
  ```

---

#### **2.5 开发体验**
- **Pinia**：<br>
  - API 设计对 Vue3 Composition API 友好。
  - 更少的模板代码，逻辑更简洁。
  - 支持更好的开发者工具（devtools）。

- **Vuex**：<br>
  - 使用 Vue2 Options API 更友好。
  - 需要模板代码配置（如 `state`、`mutations`）。

---

### **3. 性能对比**
- **Pinia**：<br>
  - 基于 Vue3 的响应式系统（`reactive` + `ref`），性能更优。
  - 更轻量，设计现代化。

- **Vuex**：<br>
  - 基于 Vue2 的响应式系统（`Object.defineProperty`），性能稍逊。

</details>

## 9. Vue3的Proxy响应式实现如何优化性能 {#question-subjective-b3ea88815706}

### 题目要点

Proxy, 响应式追踪, 性能优化, 对象代理

<details>
<summary>参考答案</summary>

Vue3采用Proxy替代Object.defineProperty，实现更高效的响应式追踪。Proxy可直接代理整个对象，避免遍历属性，提升性能。

</details>

## 10. Vue3的静态提升（Static Hoisting）如何减少运行时开销？ {#question-subjective-43b3dccd0d20}

### 题目要点

静态节点, 运行时开销, 渲染效率, 预处理

<details>
<summary>参考答案</summary>

静态提升通过提前识别和提取静态节点，减少运行时的重复计算，提高渲染效率。

</details>

## 11. git fetch与git pull的区别 {#question-8ba67b8e-c23a-4919-b645-2757fc1e8be4}

> 题库原题：[git pull 和 git fetch 有什么区别？](https://fe.ecool.fun/topic/8ba67b8e-c23a-4919-b645-2757fc1e8be4)

### 题目要点

git pull 命令从中央存储库中提取特定分支的新更改或提交，并更新本地存储库中的目标分支。

<details>
<summary>参考答案</summary>

git pull 命令从中央存储库中提取特定分支的新更改或提交，并更新本地存储库中的目标分支。

git fetch 也用于相同的目的，但它的工作方式略有不同。当你执行 git fetch 时，它会从所需的分支中提取所有新提交，并将其存储在本地存储库中的新分支中。如果要在目标分支中反映这些更改，必须在 git fetch 之后执行git merge。只有在对目标分支和获取的分支进行合并后才会更新目标分支。为了方便起见，请记住以下等式：

>git pull = git fetch + git merge

</details>

## 12. 如何通过git stash临时保存未提交的代码？解决分支切换冲突。 {#question-subjective-caef9fed4802}

### 题目要点

暂存更改, 分支切换, 冲突解决

<details>
<summary>参考答案</summary>

git stash用于暂存未提交的更改，便于切换分支。通过git stash apply恢复暂存内容，解决分支切换中的冲突。

</details>

## 13. 实现支持立即执行与取消功能的防抖函数。 {#question-subjective-5bc89c1a6d4f}

### 题目要点

定时器, 立即执行, 取消逻辑, 函数节流

<details>
<summary>参考答案</summary>

防抖函数通过定时器控制函数执行频率，支持立即执行和取消操作。

</details>

## 14. 实现一个深拷贝 {#question-a6a869f2-a5f5-451e-8f1d-eb25cea4750f}

> 题库原题：[实现深拷贝](https://fe.ecool.fun/topic/a6a869f2-a5f5-451e-8f1d-eb25cea4750f)

### 题目要点

核心考查：实现一个深拷贝的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
const cloneDeep1 = (target, hash = new WeakMap()) => {
  // 对于传入参数处理
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  // 哈希表中存在直接返回
  if (hash.has(target)) return hash.get(target);

  const cloneTarget = Array.isArray(target) ? [] : {};
  hash.set(target, cloneTarget);

  // 针对Symbol属性
  const symKeys = Object.getOwnPropertySymbols(target);
  if (symKeys.length) {
    symKeys.forEach(symKey => {
      if (typeof target[symKey] === 'object' && target[symKey] !== null) {
        cloneTarget[symKey] = cloneDeep1(target[symKey]);
      } else {
        cloneTarget[symKey] = target[symKey];
      }
    })
  }

  for (const i in target) {
    if (Object.prototype.hasOwnProperty.call(target, i)) {
      cloneTarget[i] =
        typeof target[i] === 'object' && target[i] !== null
        ? cloneDeep1(target[i], hash)
        : target[i];
    }
  }
  return cloneTarget;
}

```

</details>

## 15. 讲一个你参与过或者了解过的比较复杂的项目 {#question-subjective-08c4ccd33f25}

### 题目要点

项目背景, 技术挑战, 解决方案, 团队合作

<details>
<summary>参考答案</summary>

描述复杂项目时需突出技术难点、解决方案和团队协作。关键点包括：项目背景、技术挑战、解决方案、团队合作。

</details>

## 16. 你是怎么学习前端的？ {#question-subjective-6a8cd786af65}

### 题目要点

核心考查：你是怎么学习前端的？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

略

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-82/_index.md" >}}) · 已是最后一轮 →
