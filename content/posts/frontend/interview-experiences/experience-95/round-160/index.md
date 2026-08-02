+++
title = "小红书-社招-5年 · 第 2 轮 · 技术面试"
draft = false
weight = 2
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/95"
experienceId = 95
roundId = 160
roundOrder = 2
company = "小红书"
date = "2026-02-01T14:42:25.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-95/round-159/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-95/_index.md" >}}) · 已是最后一轮 →

**本轮概述：** 该轮面试主要考察了浏览器的工作原理、缓存策略、跨域、Vue生命周期、组件通信等方面的知识。题目涉及理论知识和实际应用场景。

本轮共 14 道题。答案默认折叠，便于先自行作答。

## 1. 详细讲一下从url输入网址到页面渲染的过程 {#question-5def10e9-7825-4bd4-a76e-6d7eb555a2ce}

> 题库原题：[简单描述从输入网址到页面显示的过程](https://fe.ecool.fun/topic/5def10e9-7825-4bd4-a76e-6d7eb555a2ce)

### 题目要点

当输入URL到页面加载完成，发生了以下几个关键过程：

1. **DNS解析**：浏览器将URL解析为对应的IP地址。这个过程涉及多级DNS服务器，从本地缓存开始，如果没有找到，则递归查询根域名服务器、顶级域名服务器，直到找到目标服务器的IP地址。
2. **TCP连接**：浏览器通过三次握手与服务器建立TCP连接。一旦连接建立，浏览器可以发送HTTP请求。
3. **HTTP请求**：浏览器构建HTTP请求报文，通过TCP连接发送到服务器。请求报文包含请求行、请求头和请求正文。
4. **服务器处理请求**：服务器接收HTTP请求，解析请求内容，执行相应的处理（如数据库查询、文件读取等），并构建HTTP响应报文。
5. **HTTP响应**：服务器将响应报文通过TCP连接发送回浏览器。响应报文包含状态码、响应头和响应正文。
6. **浏览器解析渲染**：浏览器接收到HTTP响应后，解析HTML文档构建DOM树，解析CSS构建CSSOM树，合并两者形成渲染树，然后开始渲染页面。
7. **连接结束**：当浏览器完成页面渲染或收到服务器关闭连接的信号时，浏览器会发送TCP连接关闭的信号，服务器收到后，双方断开连接。

<details>
<summary>参考答案</summary>

很多大公司面试喜欢问这样一道面试题，输入URL到看见页面发生了什么？

简单来说，共有以下几个过程：

* DNS解析
* 发起TCP连接
* 发送HTTP请求
* 服务器处理请求并返回HTTP报文
* 浏览器解析渲染页面
* 连接结束

下面我们来看看具体的细节。

## DNS解析

DNS解析实际上就是寻找你所需要的资源的过程。假设你输入`www.baidu.com`，而这个网址并不是百度的真实地址，互联网中每一台机器都有唯一标识的IP地址，这个才是关键，但是它不好记，乱七八糟一串数字谁记得住啊，所以就需要一个网址和IP地址的转换，也就是DNS解析。

DNS解析其实是一个递归的过程。

输入`www.google.com`网址后，首先在本地的域名服务器中查找，没找到去根域名服务器查找，没有再去com顶级域名服务器查找，，如此的类推下去，直到找到IP地址，然后把它记录在本地，供下次使用。大致过程就是.-> .com ->google.com. -> www.google.com.。 (最后这个.对应的就是根域名服务器，默认情况下所有的网址的最后一位都是.，为了方便用户，通常都会省略，浏览器在请求DNS的时候会自动加上)

### DNS优化

既然已经懂得了解析的具体过程，我们可以看到上述一共经过了N个过程，每个过程有一定的消耗和时间的等待，因此我们得想办法解决一下这个问题！

* DNS缓存

DNS存在着多级缓存，从离浏览器的距离排序的话，有以下几种: 浏览器缓存，系统缓存，路由器缓存，ISP服务器缓存，根域名服务器缓存，顶级域名服务器缓存，主域名服务器缓存。

* DNS负载均衡

比如访问baidu.com的时候，每次响应的并非是同一个服务器（IP地址不同），一般大公司都有成百上千台服务器来支撑访问。DNS可以返回一个合适的机器的IP给用户，例如可以根据每台机器的负载量，该机器离用户地理位置的距离等等，这种过程就是DNS负载均衡。

## 发起TCP连接

TCP提供一种可靠的传输，这个过程涉及到三次握手，四次挥手。

### 三次握手

![三次握手示意图](https://static.ecool.fun//article/f3f07532-8a7f-48f8-8f9e-d68ac149f9a2.png)

* 第一次握手：

客户端发送syn包(Seq=x)到服务器，并进入SYN_SEND状态，等待服务器确认；

* 第二次握手：

服务器收到syn包，必须确认客户的SYN（ack=x+1），同时自己也发送一个SYN包（Seq=y），即SYN+ACK包，此时服务器进入SYN_RECV状态；

* 第三次握手：

客户端收到服务器的SYN＋ACK包，向服务器发送确认包ACK(ack=y+1)，此包发送完毕，客户端和服务器进入ESTABLISHED状态，完成三次握手。

握手过程中传送的包里不包含数据，三次握手完毕后，客户端与服务器才正式开始传送数据。理想状态下，TCP连接一旦建立，在通信双方中的任何一方主动关闭连接之前，TCP 连接都将被一直保持下去。

### 四次挥手

数据传输完毕后，双方都可释放连接。最开始的时候，客户端和服务器都是处于ESTABLISHED状态，假设客户端主动关闭，服务器被动关闭。

![四次挥手示意图](https://static.ecool.fun//article/dbf0912c-a6df-48d0-8981-7224eae4492f.png)

* 第一次挥手：

客户端发送一个FIN，用来关闭客户端到服务器的数据传送，也就是客户端告诉服务器：我已经不 会再给你发数据了(当然，在fin包之前发送出去的数据，如果没有收到对应的ack确认报文，客户端依然会重发这些数据)，但是，此时客户端还可以接受数据。

FIN=1，其序列号为seq=u（等于前面已经传送过来的数据的最后一个字节的序号加1），此时，客户端进入FIN-WAIT-1（终止等待1）状态。 TCP规定，FIN报文段即使不携带数据，也要消耗一个序号。

* 第二次挥手：

服务器收到FIN包后，发送一个ACK给对方并且带上自己的序列号seq，确认序号为收到序号+1（与SYN相同，一个FIN占用一个序号）。此时，服务端就进入了CLOSE-WAIT（关闭等待）状态。TCP服务器通知高层的应用进程，客户端向服务器的方向就释放了，这时候处于半关闭状态，即客户端已经没有数据要发送了，但是服务器若发送数据，客户端依然要接受。这个状态还要持续一段时间，也就是整个CLOSE-WAIT状态持续的时间。

此时，客户端就进入FIN-WAIT-2（终止等待2）状态，等待服务器发送连接释放报文（在这之前还需要接受服务器发送的最后的数据）。

* 第三次挥手：

服务器发送一个FIN，用来关闭服务器到客户端的数据传送，也就是告诉客户端，我的数据也发送完了，不会再给你发数据了。由于在半关闭状态，服务器很可能又发送了一些数据，假定此时的序列号为seq=w，此时，服务器就进入了LAST-ACK（最后确认）状态，等待客户端的确认。

* 第四次挥手：

主动关闭方收到FIN后，发送一个ACK给被动关闭方，确认序号为收到序号+1，此时，客户端就进入了TIME-WAIT（时间等待）状态。注意此时TCP连接还没有释放，必须经过2∗MSL（最长报文段寿命）的时间后，当客户端撤销相应的TCB后，才进入CLOSED状态。

服务器只要收到了客户端发出的确认，立即进入CLOSED状态。同样，撤销TCB后，就结束了这次的TCP连接。可以看到，服务器结束TCP连接的时间要比客户端早一些。

至此，完成四次挥手。

## 发送HTTP请求

发送HTTP请求，就是构建HTTP请求报文，并通过TCP协议，发送到服务器指定端口。

请求报文由`请求行`，`请求报头`，`请求正文`组成。

## 服务器处理请求并返回HTTP报文

对TCP连接进行处理，对HTTP协议进行解析，并按照报文格式进一步封装成HTTP Request对象，供上层使用。这一部分工作一般是由Web服务器去进行，比如Tomcat, Nginx和Apache等Web服务器。

HTTP报文也分成三段：`状态码`，`响应报头`和`响应报文`。

## 浏览器解析渲染页面

![渲染页面的过程](https://static.ecool.fun//article/d2f90949-ca68-4f27-aeea-aa10ac6ac664.png)

这个图就是Webkit解析渲染页面的过程。

* 解析HTML形成DOM树
* 解析CSS形成CSSOM 树
* 合并DOM树和CSSOM树形成渲染树
* 浏览器开始渲染并绘制页面

</details>

## 2. 当解析到`&lt;script defer&gt;`和`&lt;script async&gt;`时，渲染线程如何协调？哪种会阻塞DOMContentLoaded事件？ {#question-2acd6447-af1d-4430-837f-a468b6c76ffe}

> 题库原题：[script 标签中， async 和 defer 两个属性有什么用途和区别？](https://fe.ecool.fun/topic/2acd6447-af1d-4430-837f-a468b6c76ffe)

### 题目要点

**答题思路**：

在HTML的`&lt;script&gt;`标签中，`async`和`defer`两个属性都用于控制脚本的异步加载，但它们之间存在关键的区别，主要体现在脚本加载和执行顺序上。

async属性

- **用途**：`async`属性用于指定脚本应该异步执行，即脚本的加载和解析不会阻塞HTML文档的解析，并且脚本一旦加载完成就会立即执行，不等待DOMContentLoaded事件触发。
- **特点**：`async`脚本的加载和执行是独立的，不会按照在HTML文档中出现的顺序执行。如果页面中有多个`async`脚本，它们的执行顺序是不确定的。

 defer属性

- **用途**：`defer`属性也用于指定脚本的异步加载，但与`async`不同的是，`defer`脚本会等到整个文档被解析完成后，才会执行。这意呀着，脚本的执行会按照在HTML文档中出现的顺序进行。
- **特点**：使用`defer`属性的脚本不会阻塞HTML文档的解析，同时保证了脚本的执行顺序，这对于依赖DOM元素或顺序执行的脚本非常有用。

区别

- **执行时机**：`async`脚本一旦加载完成就会立即执行，不等待其他脚本或DOM的加载完成；而`defer`脚本会等待整个文档解析完成后，按照在HTML文档中出现的顺序执行。
- **执行顺序**：`async`脚本的执行顺序是不确定的，多个`async`脚本可能会乱序执行；而`defer`脚本会按照在HTML文档中出现的顺序执行。

**考察要点**：

- **对HTML脚本加载机制的理解**：面试者需要了解HTML中脚本的加载和执行机制，以及它们如何影响页面的性能和功能。
- **对async和defer属性的掌握**：面试者需要准确理解`async`和`defer`属性的用途和区别，并能够根据实际需求选择合适的属性。
- **实际应用能力**：面试者需要能够将理论知识应用于实际开发中，解决与脚本加载和执行相关的问题。

<details>
<summary>参考答案</summary>

在 HTML 中会遇到以下三类 script：

```
<script src='xxx'></script>
<script src='xxx' async></script>
<script src='xxx' defer></script>
```

script标签用于加载脚本与执行脚本，直接使用script脚本时，html会按照顺序来加载并执行脚本，在脚本加载&执行的过程中，会阻塞后续的DOM渲染。

比如现在大家习惯于在页面中引用各种第三方脚本，但如果第三方服务商出现了一些小问题，比如延迟之类的，就会使得页面白屏。

针对上述情况，script标签提供了两种方式来解决问题，就是加入属性async以及defer，这两个属性使得script标签加载都不会阻塞DOM的渲染。

```
defer：此布尔属性被设置为向浏览器指示脚本在文档被解析后执行。
async：设置此布尔属性，以指示浏览器如果可能的话，应异步执行脚本。
```

## defer

如果script标签设置了defer属性，则浏览器会异步下载该文件并且不会影响后续DOM的渲染。

如果有多个设置了defer属性的script标签存在，则会按照顺序执行所有的script，defer脚本会在文档渲染完毕后，DOMContentLoaded事件调用前执行。

## async

async属性会使得script脚本异步的加载并在允许的情况下执行，而async的执行并不会按照script标签在页面中的顺序来执行，而是谁先加载完谁先执行。

</details>

## 3. 浏览器的缓存策略讲一下 {#question-ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87}

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

## 4. 若页面含100个第三方资源，你会如何处理 {#question-8102159f-f373-4b08-8597-7220e4afc36c}

> 题库原题：[如果页面含 100 个第三方资源，你会如何处理？](https://fe.ecool.fun/topic/8102159f-f373-4b08-8597-7220e4afc36c)

### 题目要点

当页面包含大量第三方资源时，应优先进行资源治理与分级，而不是一次性加载；通过延迟加载、按需加载和统一的资源管理层，避免首屏阻塞和重复引入；所有第三方脚本都应异步、非阻塞，并在必要时通过 iframe 或异常兜底进行风险隔离；最后结合缓存与监控机制，持续评估资源价值，防止第三方依赖失控增长。

<details>
<summary>参考答案</summary>

当一个页面**同时引入约 100 个第三方资源**时，问题的核心并不是“能否加载”，而是**如何在不牺牲稳定性与首屏体验的前提下，控制风险、降低成本并保持可演进性**。处理思路应从“识别—治理—调度—隔离—监控”几个层面展开。

---

### 一、先做治理，而不是盲目优化

第一步并不是技术手段，而是**资源治理**。

在真实项目中，第三方资源通常来源复杂：统计、监控、广告、客服、A/B、埋点、富文本、地图、支付等。需要先做的是：

* 明确每个资源的**业务价值、使用频率和关键路径依赖**
* 区分**强依赖（页面不可用）**与**弱依赖（功能增强）**
* 标记是否影响首屏、是否阻塞渲染、是否可异步

只有完成这一步，后续的优化策略才有依据。

---

### 二、分级加载，避免首屏被“拖死”

100 个资源不可能同时进入首屏加载，应当进行**加载分级**。

核心原则是：

* 首屏只加载**必要资源**
* 非关键资源全部**延迟或条件加载**

常见策略包括：

* 关键路径资源使用同步或优先级较高的加载方式
* 统计、监控、客服等统一延后到 `DOMContentLoaded` 或 `load`
* 低频功能按路由、按交互触发再加载

这样可以显著降低首屏的网络拥塞和解析压力。

---

### 三、统一资源调度，而不是散落在各处

当第三方资源达到数量级之后，**最大的问题是不可控**。

工程上应避免：

* 在业务代码中直接插 `&lt;script&gt;`
* 各个模块各自加载 SDK

更合理的方式是：

* 抽象一个**第三方资源管理层**
* 统一做加载、缓存、去重和失败兜底
* 对外暴露“能力接口”，而不是暴露脚本细节

这样做的好处是：

* 防止重复加载同一 SDK
* 可以集中做异常兜底
* 可以随时替换或下线某个资源

---

### 四、尽量异步化与非阻塞化

对第三方资源的一个基本要求是：

> **不能阻塞 HTML 解析和主线程**

常见手段包括：

* 使用 `async` / `defer` 加载脚本
* 动态 `import()` 或运行时插入 script
* 将初始化逻辑拆分，避免脚本加载即执行重逻辑

对于不受控的第三方脚本，必须假设：

* 它可能慢
* 它可能抛异常
* 它可能污染全局

因此要在加载方式上尽量降低侵入性。

---

### 五、隔离风险，防止“一个资源拖垮整个页面”

当第三方资源数量很多时，**稳定性优先级高于性能**。

常见的隔离策略包括：

* iframe 隔离高风险脚本（如广告、复杂编辑器）
* try-catch 包裹初始化逻辑，避免异常冒泡
* 对全局对象做存在性检测，防止未加载即调用

核心目标是：

> **任何一个第三方资源失败，都不应影响主流程**

---

### 六、网络与缓存层面的优化

在网络层，可以进一步降低成本：

* 尽量通过 CDN 加速第三方资源
* 能本地托管的资源尽量本地托管，减少外部依赖
* 合理利用浏览器缓存，避免重复下载

对于稳定不变的 SDK，优先选择：

* 长缓存策略
* 版本化文件名

---

### 七、持续监控与动态治理

当页面依赖大量第三方资源时，**必须配套监控机制**：

* 资源加载成功率
* 加载耗时
* 初始化失败率
* 对首屏和交互的影响

通过监控数据，可以：

* 定期下线低价值资源
* 替换性能或稳定性差的 SDK
* 动态调整加载时机

否则第三方资源会不断“只增不减”。

</details>

## 5. https为什么安全 {#question-8740bcd2-4a52-4c22-aed1-d573eb42dfa9}

> 题库原题：[HTTPS 为什么是安全的？](https://fe.ecool.fun/topic/8740bcd2-4a52-4c22-aed1-d573eb42dfa9)

### 题目要点

HTTPS（安全超文本传输协议）之所以安全，是因为它采用了以下几种机制来保护数据传输过程中的安全性和完整性：

1. **加密通信**：HTTPS使用SSL（安全套接字层）或TLS（传输层安全）协议对数据进行加密。这意味着在客户端和服务器之间传输的数据是经过加密的，第三方无法轻易读取或篡改。
2. **数据完整性**：通过加密算法，HTTPS确保了数据在传输过程中不会被修改。任何对数据的篡改都会导致解密失败，从而保护了数据的完整性。
3. **身份验证**：HTTPS通过数字证书实现服务器身份验证。数字证书由可信的第三方认证机构（CA）颁发，它证明了服务器的身份是真实可靠的。客户端可以通过验证证书来确认它们正在与正确的服务器通信。
4. **公钥和私钥**：HTTPS使用非对称加密技术，其中服务器拥有公钥和私钥。公钥用于加密数据，私钥用于解密。即使公钥是公开的，没有对应的私钥也无法解密信息。
5. **对称加密**：为了提高加密和解密的效率，HTTPS在初始的握手过程中使用非对称加密来交换一个对称密钥，之后的数据传输则使用这个对称密钥进行加密和解密。
6. **中间人攻击防护**：由于使用了数字证书和公钥基础设施（PKI），HTTPS能够抵御中间人攻击。即使攻击者拦截了通信，没有服务器的私钥，他们也无法解密或篡改数据。
7. **安全握手**：在建立HTTPS连接时，客户端和服务器之间会进行一次安全握手，以确保双方都同意使用相同的加密算法，并验证证书的有效性。

综上所述，HTTPS通过加密、身份验证、密钥交换和完整性保护等多种机制，为网络通信提供了高度的安全保障。

<details>
<summary>参考答案</summary>

以一个故事来学习 HTTPS：

来自中国的张大胖和位于米国的 Bill 进行通信。

由于张大胖和 Bill 都是使用 HTTP 进行通信，HTTP 是明文的，所以他们的聊天都是可被窥视的。于是，二人准备想要改变现状，所以 HTTPS 首先要解决的问题就是要保证传输的内容只有这两个人能看懂。

## plan1：使用对称密钥

![image.png](https://static.ecool.fun//article/fd6b5f8a-b233-486b-a6a2-3159a77cb7ae.png)

两人商量了一下，可以使用对称密钥进行加密。（对称密钥也就是加密和解密使用的是同一个密钥）

但是问题又来了~既然网络是不安全的，那么最开始的时候怎么将这个对称密钥发送出去呢？如果对称密钥在发送的时候就已经被拦截，那么发送的信息还是会被篡改和窥视啊~~

所以这种对称密钥的弊端就是，可能被中间人拦截，这样中间人就可以获取到了密钥，就可以对传输的信息就行窥视和篡改。

## plan2：使用非对称密钥

![image.png](https://static.ecool.fun//article/38ae2865-9de4-457e-9b14-a499d784dc58.png)

RSA（非对称加密算法）：双方必须协商一对密钥，一个私钥一个公钥。用私钥加密的数据，只有对应的公钥才能解密，用公钥加密的数据， 只有对应的私钥才能解密。

![image.png](https://static.ecool.fun//article/8e2f8088-f4da-4248-9e2d-94cd17600e2b.png)

这样的话 Bill 将自己的公钥给张大胖，张大胖发送的信息使用 Bill 的公钥加密，这样，只有 Bill 使用自己的私钥才能获取

但是这样有个弊端：

**RSA 算法很慢**

所以为了解决这个问题，我们使用非对称密钥+对称密钥结合的方式

## plan3：非对称密钥+对称密钥

使用对称密钥的好处是速度比较快，使用非对称密钥的好处是可以使得传输的内容不能被破解，因为就算你拦截到了数据，但是没有 Bill 的私钥，也是不能破解内容的。就比如说你抢了一个保险柜，但是没有保险柜的钥匙也不能打开保险柜。

所以我们要结合两者的优点。使用 RSA 的方法将加密算法的对称密钥发送过去，之后就可以使用使用这个密钥，利用对称密钥来通信了。就比如说我将钥匙放进了保险柜，然后将保险柜寄给对方。

## 中间人攻击

还有一个问题就是在使用非对称密钥的时候，首先需要将 Bill 的公钥给张大胖，那么在这个过程中，安全是没有保障的，中间人可以拦截到 Bill 的公钥，就可以对拦截到的公钥进行篡改。

这也就是相当于我有手机号，虽然是公开的，谁都可以给我打电话，但是刚开始你并不知道我的手机号，我需要将我的手机号发给你，在我发给你我的手机号的时候，被中间人拦截了，然后将我正确的手机号换成了错误的手机号，比如：110，然后，你收到的就是错误的手机号：110，但是你自己还不知道你收到的是错的手机号，这时候，你要是给我打电话，就尴尬了~~

## 确认身份 —— 数字证书

所以以上的步骤都是可行的，只需要最后一点就可以了，要确定 Bill 给张大胖的公钥确实是 Bill。 的公钥，而不是别人的。（刚刚电话号码的那个例子，也就是说，需要确定我给你发的电话号码是我的，没有被修改的）

那怎么确认 Bill 给张大胖的公钥确实是 Bill 的呢？

这个时候就需要公证处的存在了。也就是说我需要先将我的电话号码到公证处去公证一下，然后我将电话号码传给你之后，你在将你收到的电话号码和公证处的比对下，就知道是不是我的了。

对应到计算机世界，那就是数字签名

![image.png](https://static.ecool.fun//article/2df74fe1-73b8-4370-82ed-e24298c9d0a3.png)

数字签名也就是相当于公证处在公证书上盖章。

![image.png](https://static.ecool.fun//article/ab607ef0-558e-4def-9772-dec27415660a.png)

数字签名和原始信息合在一起称为数字证书，Bill 只需将数字证书发送给张大胖就可以了。

在拿到数字证书之后，就用同样的Hash 算法， 再次生成消息摘要，然后用CA的公钥对数字签名解密， 得到CA创建的消息摘要， 两者一比，就知道有没有人篡改了！

![image.png](https://static.ecool.fun//article/ceeedccb-77a0-43c6-ab00-a8d5c7942a51.png)

以上你全部看完并且理解了，那么对于 HTTPS 你也就大概有个了解了。

</details>

## 6. 跨域讲一下 {#question-3538f4eb-5b78-4ffc-aeae-ccfdd45976a4}

> 题库原题：[什么是跨域？](https://fe.ecool.fun/topic/3538f4eb-5b78-4ffc-aeae-ccfdd45976a4)

### 题目要点

**跨域**是指从一个网站（源）去请求另一个网站（目标）的资源时，由于浏览器的同源策略限制，这种请求可能会被阻止。同源策略要求协议、域名、端口号都相同。

为了解决跨域问题，有几种常用方法：

1. **CORS**：服务器设置响应头，允许特定源的跨域请求。
2. **JSONP**：利用`&lt;script&gt;`标签的跨域能力，但只支持GET请求且存在安全风险。
3. **代理服务器**：通过代理服务器转发请求和响应，客户端与代理服务器同源。
4. **postMessage**：HTML5 API，允许不同源的窗口或iframe之间进行安全通信。

<details>
<summary>参考答案</summary>

**跨域**（Cross-Origin）是指从一个域名的网页去请求另一个域名的资源。在Web开发中，出于安全考虑，同源策略（Same-Origin Policy）限制了文档或脚本如何与来自不同源的“资源”进行交互。这里的“源”指的是协议（如http或https）、域名（如www.example.com）和端口号（如80或443）的组合。如果协议、域名或端口号中的任何一个不同，那么两个资源就被认为是来自不同的源，即跨域。

跨域问题主要出现在前端开发中，尤其是当前端页面需要从不同源的服务器请求数据或服务时。由于浏览器的同源策略，这些跨域请求可能会被阻止，导致请求失败。

为了解决这个问题，有几种常见的跨域资源共享（CORS, Cross-Origin Resource Sharing）策略：

1. **JSONP**：一种早期的跨域技术，通过在客户端动态创建`&lt;script&gt;`标签并设置其`src`属性为跨域URL（该URL会返回一段JavaScript代码，该代码中包含需要的数据），然后利用`&lt;script&gt;`标签的跨域能力来执行返回的JavaScript代码，从而获取数据。但JSONP只支持GET请求，并且存在安全风险。

2. **CORS**：现代浏览器支持的跨域资源共享标准。服务器通过设置响应头（如`Access-Control-Allow-Origin`）来明确告知客户端哪些域的请求是被允许的。CORS支持更复杂的HTTP请求，如POST、PUT等，并且安全性更高。

3. **代理服务器**：在客户端和服务器之间设置一个代理服务器，客户端的请求先发送到代理服务器，代理服务器再将请求转发给目标服务器，并将响应返回给客户端。这样，从客户端的角度看，它始终在与同源的代理服务器进行交互，从而避免了跨域问题。

4. **Nginx反向代理**：一种常见的代理服务器解决方案，通过配置Nginx来实现对跨域请求的转发和响应。

5. **document.domain + iframe**：对于主域相同但子域不同的跨域问题，可以通过设置`document.domain`来使两个页面共享同一个域，然后通过iframe进行交互。但这种方法有一定的局限性，并且存在安全风险。

6. **postMessage**：HTML5引入的一种跨文档通信API，允许来自不同源的页面进行安全通信。通过监听`message`事件并检查事件的`origin`属性，可以确保消息来自预期的源。

</details>

## 7. Vue2中`beforeCreate`阶段无法访问`data`的原因？ {#question-7a2e44a2-1e37-4b5c-98c4-15a049422ea5}

> 题库原题：[Vue2中，为什么在`beforeCreate`阶段，无法访问`data`？](https://fe.ecool.fun/topic/7a2e44a2-1e37-4b5c-98c4-15a049422ea5)

### 题目要点

Vue 2 的 `beforeCreate` 执行时，组件实例尚未完成状态初始化；`data()` 尚未执行，响应式系统也未建立，数据属性尚未代理到实例上；这是由 Vue 2 的初始化顺序和 `Object.defineProperty` 响应式实现决定的设计结果，而非生命周期设计失误；`beforeCreate` 被刻意保留为一个“无状态”的早期钩子，主要用于插件注入和底层扩展。

<details>
<summary>参考答案</summary>

在 Vue 2 中，`beforeCreate` 阶段**无法访问 `data`**，并不是设计疏忽，而是由 **Vue 2 实例初始化顺序与响应式实现方式共同决定的必然结果**。

---

## 一、结论先行

> **`beforeCreate` 执行时，`data` 尚未初始化，也尚未被代理到实例上，因此既不存在响应式数据，也不存在 `this.xxx` 的访问入口。**

---

## 二、Vue 2 实例初始化的真实顺序

Vue 2 创建组件实例时，核心初始化流程可以简化为：

```text
initLifecycle
initEvents
initRender
→ beforeCreate
initInjections
initState（data / props / computed / methods）
→ created
```

关键点在于：

> **`beforeCreate` 在 `initState` 之前执行**

而 `data`、`props`、`computed` 等，全部是在 `initState` 阶段完成的。

---

## 三、`data` 在 Vue 2 中是如何“变得可访问”的

### 1. data 本身只是一个 option

在 `beforeCreate` 时：

* `this.$options.data` 可能存在
* 但 `data()` **尚未执行**
* `data` 对象尚未生成

---

### 2. 响应式与代理发生在 `initState`

在 `initState` 内部，Vue 2 会做三件关键事情：

1. **执行 `data()`，得到原始数据对象**
2. 通过 `Object.defineProperty` 将数据变成响应式
3. 将每个 data key 代理到实例上：

```js
Object.defineProperty(vm, 'count', {
  get() { return vm._data.count },
  set(val) { vm._data.count = val }
})
```

在这一步完成之前：

* `this._data` 不存在
* `this.count` 也不存在

---

## 四、为什么 Vue 2 不提前初始化 data

这是一个**设计取舍**，而不是技术限制。

### 1. injections / props 优先级问题

在 Vue 2 中：

* `inject` 依赖 `provide`
* `data` 可以依赖 `props`
* `props` 又可能依赖注入结果

因此 Vue 必须保证：

> **依赖链路已准备好，再执行 data()**

而 `beforeCreate` 被刻意放在这些初始化之前，用来做**最原始的实例配置**。

---

### 2. 保留一个“无状态”的生命周期钩子

`beforeCreate` 的定位是：

* 无响应式
* 无数据
* 无依赖
* 仅用于插件或底层逻辑注入

这为插件系统提供了稳定的切入点。

---

## 五、为什么在 `created` 就可以访问 data

因为在 `created` 之前：

* `initState` 已完成
* `data` 已响应式化
* 所有 data key 已代理到实例

因此在 `created` 中：

```js
this.count // 可用
```

---

## 六、对比 Vue 3（加分理解）

Vue 3 中：

* 不再依赖 `this`
* 使用 `setup` 明确划分初始化边界
* 响应式数据在 `setup` 内显式创建

本质上是把 Vue 2 中**隐式的初始化顺序问题，转为显式 API 设计**。

</details>

## 8. Vue3的`setup()`如何解决这一问题？ {#question-subjective-a3aaaa867b50}

### 题目要点

Vue 3 中：

<details>
<summary>参考答案</summary>

Vue 3 中：

* 不再依赖 this
* 使用 setup 明确划分初始化边界
* 响应式数据在 setup 内显式创建

本质上是把 Vue 2 中隐式的初始化顺序问题，转为显式 API 设计。

</details>

## 9. Vue组件间通信方式都有哪些? {#question-a88670ef-a898-4676-a272-cabf8bdfade7}

> 题库原题：[Vue组件间通信方式都有哪些?](https://fe.ecool.fun/topic/a88670ef-a898-4676-a272-cabf8bdfade7)

### 题目要点

#### 组件间通信的方案

1. **props传递数据**：父组件通过props向子组件传递数据。
2. **$emit触发自定义事件**：子组件通过$emit向父组件发送通知。
3. **ref**：通过ref获取子组件实例，从而访问子组件的数据和方法。
4. **EventBus**：创建一个中央事件总线，用于兄弟组件之间的通信。
5. **$parent或$root**：通过共同的祖辈组件进行通信。
6. **$attrs与$listeners**：祖先组件通过$attrs传递数据给子孙组件，通过$listeners传递事件监听器。
7. **Provide与Inject**：祖先组件通过Provide提供数据，后代组件通过Inject接收数据。
8. **Vuex**：用于复杂关系的组件数据共享。

<details>
<summary>参考答案</summary>

## 一、组件间通信的概念<br>

开始之前，我们把**组件间通信**这个词进行拆分

- 组件
- 通信

都知道组件是`vue`最强大的功能之一，`vue`中每一个`.vue`我们都可以视之为一个组件。

通信指的是发送者通过某种媒体以某种格式来传递信息到收信者以达到某个目的。

广义上，任何信息的交通都是通信。

**组件间通信**，即指组件\(`.vue`\)通过某种方式来传递信息以达到某个目的。

举个栗子我们在使用`UI`框架中的`table`组件，可能会往`table`组件中传入某些数据，这个本质就形成了组件之间的通信。

## 二、组件间通信解决了什么

在古代，人们通过驿站、飞鸽传书、烽火报警、符号、语言、眼神、触碰等方式进行信息传递，到了今天，随着科技水平的飞速发展，通信基本完全利用有线或无线电完成，相继出现了有线电话、固定电话、无线电话、手机、互联网甚至视频电话等各种通信方式从上面这段话，我们可以看到通信的本质是信息同步，共享。

回到`vue`中，每个组件之间的都有独自的作用域，组件间的数据是无法共享的但实际开发工作中我们常常需要让组件之间共享数据，这也是组件通信的目的要让它们互相之间能进行通讯，这样才能构成一个有机的完整系统

## 二、组件间通信的分类

组件间通信的分类可以分成以下

- 父子组件之间的通信
- 兄弟组件之间的通信
- 祖孙与后代组件之间的通信
- 非关系组件间之间的通信

关系图:

 ![](https://static.ecool.fun//article/b2f13367-d035-4870-b2e0-779d5909620a.png)

## 三、组件间通信的方案

整理`vue`中8种常规的通信方案

1.  通过 props 传递
2.  通过 \$emit 触发自定义事件
3.  使用 ref
4.  EventBus
5.  $parent 或$root
6.  attrs 与 listeners
7.  Provide 与 Inject
8.  Vuex

### props传递数据

 ![](https://static.ecool.fun//article/028189f8-0df1-4af0-b541-a6439f488209.png)

- 适用场景：父组件传递数据给子组件
- 子组件设置`props`属性，定义接收父组件传递过来的参数
- 父组件在使用子组件标签中通过字面量来传递值

`Children.vue`

```js
props:{
    // 字符串形式
 name:String // 接收的类型参数
    // 对象形式
    age:{  
        type:Number, // 接收的类型为数值
        defaule:18,  // 默认值为18
       require:true // age属性必须传递
    }
}
```

`Father.vue`组件

```js
<Children name="jack" age=18 />
```

### \$emit 触发自定义事件

- 适用场景：子组件传递数据给父组件
- 子组件通过`$emit触发`自定义事件，`$emit`第二个参数为传递的数值
- 父组件绑定监听器获取到子组件传递过来的参数

`Chilfen.vue`

```js
this.$emit('add', good)
```

`Father.vue`

```js
<Children @add="cartAdd($event)" />
```

### ref

- 父组件在使用子组件的时候设置`ref`
- 父组件通过设置子组件`ref`来获取数据

父组件

```js
<Children ref="foo" />

this.$refs.foo  // 获取子组件实例，通过子组件实例我们就能拿到对应的数据
```

### EventBus

- 使用场景：兄弟组件传值
- 创建一个中央事件总线`EventBus`
- 兄弟组件通过`$emit`触发自定义事件，`$emit`第二个参数为传递的数值
- 另一个兄弟组件通过`$on`监听自定义事件

`Bus.js`

```js
// 创建一个中央时间总线类
class Bus {
  constructor() {
    this.callbacks = {};   // 存放事件的名字
  }
  $on(name, fn) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(fn);
  }
  $emit(name, args) {
    if (this.callbacks[name]) {
      this.callbacks[name].forEach((cb) => cb(args));
    }
  }
}

// main.js
Vue.prototype.$bus = new Bus() // 将$bus挂载到vue实例的原型上
// 另一种方式
Vue.prototype.$bus = new Vue() // Vue已经实现了Bus的功能
```

`Children1.vue`

```js
this.$bus.$emit('foo')
```

`Children2.vue`

```js
this.$bus.$on('foo', this.handle)
```

### $parent 或 $root

- 通过共同祖辈`$parent`或者`$root`搭建通信侨联

兄弟组件

`this.$parent.$on('add',this.add)<br>
`

另一个兄弟组件

`this.$parent.$emit('add')<br>
`

### $attrs  与$ listeners

 -    适用场景：祖先传递数据给子孙
 -    设置批量向下传属性`$attrs`和 `$listeners`
 -    包含了父级作用域中不作为 `prop` 被识别 \(且获取\) 的特性绑定 \( class 和 style 除外\)。
 -    可以通过 `v-bind="$attrs"` 传⼊内部组件

```js
// child：并未在props中声明foo
<p>{{$attrs.foo}}</p>

// parent
<HelloWorld foo="foo"/>
```

```js
// 给Grandson隔代传值，communication/index.vue
<Child2 msg="lalala" @some-event="onSomeEvent"></Child2>

// Child2做展开
<Grandson v-bind="$attrs" v-on="$listeners"></Grandson>

// Grandson使⽤
<div @click="$emit('some-event', 'msg from grandson')">
{{msg}}
</div>
```

### provide 与 inject

- 在祖先组件定义`provide`属性，返回传递的值
- 在后代组件通过`inject`接收组件传递过来的值

祖先组件

```js
provide(){
    return {
        foo:'foo'
    }
}
```

后代组件

```js
inject:['foo'] // 获取到祖先组件传递过来的值
```

### `vuex`

- 适用场景: 复杂关系的组件数据传递
- `Vuex`作用相当于一个用来存储共享变量的容器
 ![](https://static.ecool.fun//article/3073480a-ca41-4937-a711-5237a7c73506.png)

- `state`用来存放共享变量的地方
- `getter`，可以增加一个`getter`派生状态，\(相当于`store`中的计算属性），用来获得共享变量的值
- `mutations`用来存放修改`state`的方法。
- `actions`也是用来存放修改state的方法，不过`action`是在`mutations`的基础上进行。常用来做一些异步操作

### 小结

- 父子关系的组件数据传递选择 `props`  与 `$emit`进行传递，也可选择`ref`
- 兄弟关系的组件数据传递可选择`$bus`，其次可以选择`$parent`进行传递
- 祖先与后代组件数据传递可选择`attrs`与`listeners`或者 `Provide`与 `Inject`
- 复杂关系的组件数据传递可以通过`vuex`存放共享的变量

</details>

## 10. Vue 中，多个组件复用同一响应式对象时，如何避免不必要的重新渲染？ {#question-90552483-d460-409a-9f1a-1c6613393bab}

> 题库原题：[Vue 中，多个组件复用同一响应式对象时，如何避免不必要的重新渲染？](https://fe.ecool.fun/topic/90552483-d460-409a-9f1a-1c6613393bab)

### 题目要点

多个组件复用同一响应式对象时，是否发生不必要的重新渲染，取决于依赖收集是否精确；应避免在 render 中访问整对象或做遍历操作，而是通过 `toRef`、`computed` 或 props 传递单个字段来缩小依赖范围；对于职责复杂的共享状态，应主动拆分响应式对象；必要时可使用 `shallowReactive`、`shallowRef` 或 `v-memo` 显式控制更新边界，从而避免无关字段变更引发组件重渲染。

<details>
<summary>参考答案</summary>

在 Vue 中，**多个组件复用同一个响应式对象**时，真正的风险并不是“复用”本身，而是：

> **响应式粒度过粗，导致无关字段变更也触发组件更新**

避免不必要的重新渲染，本质上是**控制依赖收集的边界**，让组件只订阅“自己真正用到的那一部分状态”。

---

## 一、先明确触发更新的根因

在 Vue 3 中，组件是否重新渲染取决于：

* render 过程中 **读取了哪些响应式 key**
* 这些 key 在后续是否被 `set`

也就是说：

> **组件更新是“按 key 精确触发的”，而不是“按对象整体触发的”**

但前提是：**不要在 render 中做“整对象读取”**。

---

## 二、最常见的误区：传递整对象 / 解构丢失响应性

### 1. 直接使用整对象

```js
const state = reactive({
  a: 1,
  b: 2
})
```

```vue
<Child :state="state" />
```

在子组件中：

```js
{{ state.a }}
```

表面上只用到了 `a`，但如果在 render 中做了：

```js
const { a } = state
```

或：

```js
Object.values(state)
```

就会导致：

* render 阶段访问了整个对象
* 组件订阅了 `a`、`b` 等所有 key
* 任意字段变化都会触发更新

---

## 三、控制更新的核心策略

### 1. 精确到属性级别的依赖

最重要的一条原则是：

> **在 render 中，只访问必要的 key**

推荐做法包括：

* 使用 `toRef / toRefs` 拆分依赖
* 通过 props 传递单个字段，而不是整对象

```js
const a = toRef(state, 'a')
```

这样组件只会订阅 `state.a`。

---

### 2. 使用 `computed` 作为“依赖隔离层”

当多个组件共享一个复杂状态对象时，可以通过 `computed` 做中间层：

```js
const visibleCount = computed(() => state.count)
```

组件只依赖 `visibleCount`：

* state 中其他字段变化
* 不会影响该组件

这在复杂业务中非常有效。

---

### 3. 合理拆分响应式对象

如果一个对象被多个组件复用，但字段职责完全不同，应考虑：

```js
const userState = reactive({ ... })
const uiState = reactive({ ... })
```

而不是一个“全局大对象”。

响应式拆分是**最基础也是最有效的优化**。

---

## 四、避免“被动更新”的工程实践

### 1. 避免在 render 中遍历对象

如下写法非常容易引入无意义更新：

```js
Object.keys(state)
Object.values(state)
JSON.stringify(state)
```

这些操作会触发对所有 key 的依赖收集。

---

### 2. 谨慎使用 `shallowReactive` / `shallowRef`

在一些场景中，可以用：

* `shallowReactive`：只追踪第一层
* `shallowRef`：只在 `.value` 改变时触发

这适用于：

* 大对象
* 外部不可控数据
* 只关心引用变化的场景

---

### 3. 使用 `v-memo`（Vue 3.2+）

```vue
<div v-memo="[state.a]">
  {{ state.a }}
</div>
```

含义是：

* 只有当 `state.a` 变化时，才重新渲染该子树
* 其他字段变化会被忽略

这是一种**显式声明渲染依赖**的手段。

---

## 五、共享响应式对象的“正确姿势”

一个推荐的组合模式是：

* **store 层**：维护最小化、拆分后的响应式状态
* **selector 层（computed）**：对外暴露精确字段
* **组件层**：只消费 selector，而不是原始 state

这与状态管理中的“selector / derived state”思想是一致的。

</details>

## 11. 为何`setup()`中直接解构`props`会丢失响应性？ {#question-0eb08245-5227-41ee-8dc4-f35a8e3b3748}

> 题库原题：[为何`setup()`中直接解构`props`会丢失响应性？](https://fe.ecool.fun/topic/0eb08245-5227-41ee-8dc4-f35a8e3b3748)

### 题目要点

`setup` 中直接解构 `props` 会丢失响应性，是因为解构会把属性值拷贝为普通变量，打断了与 `props` Proxy 的引用关系，导致 Vue 无法进行依赖收集。正确做法是直接使用 `props.xxx`，或通过 `toRefs / toRef` 将属性转换为保持响应性的 `ref`。

<details>
<summary>参考答案</summary>

在 Vue 3 中，`setup()` 里**直接解构 `props` 会丢失响应性**，根本原因在于：**响应式是依赖引用关系实现的，而解构会打断这种引用关系**。

下面从原理、示例和正确做法三个层面说明。

---

## 一、根本原因：解构会“拷贝值”，不再是响应式引用

在 `setup(props)` 中：

* `props` 本身是一个 **浅只读的响应式对象（Proxy）**
* Vue 的响应式系统是 **基于 getter / setter（Proxy 拦截）+ 依赖收集** 实现的
* **解构会把属性的当前值“取出来”，赋值给一个普通变量**

一旦解构：

```js
const { title } = props;
```

此时：

* `title` 是一个 **普通变量**
* 它不再通过 `props.title` 访问
* Vue 无法拦截 `title` 的读取
* 依赖收集链路断裂 → 响应性丢失

---

## 二、对比示例：为什么一个会更新，一个不会

### ❌ 错误示例（丢失响应性）

```js
export default {
  props: {
    title: String
  },
  setup(props) {
    const { title } = props;

    return { title };
  }
};
```

父组件更新 `title` 时：

* `props.title` 变了
* 但 `title` 变量不会重新赋值
* 模板中使用 `{{ title }}` 不会更新

---

### ✅ 正确示例 1：不解构，直接使用 props

```js
setup(props) {
  return { props };
}
```

模板中：

```html
{{ props.title }}
```

说明：

* 每次访问都走 `props.title`
* 响应式链路完整

---

### ✅ 正确示例 2：使用 `toRefs`（官方推荐）

```js
import { toRefs } from 'vue';

setup(props) {
  const { title } = toRefs(props);
  return { title };
}
```

这里：

* `title` 是一个 `Ref`
* 内部仍然指向 `props.title`
* 响应式未被破坏

模板中：

```html
{{ title }}
```

---

### ✅ 正确示例 3：使用 `toRef`（单个字段）

```js
import { toRef } from 'vue';

setup(props) {
  const title = toRef(props, 'title');
  return { title };
}
```

适合只需要一个 prop 的场景。

---

## 三、为什么 Vue 不“自动处理解构”？

这是一个**语言层面的限制**，不是 Vue 的设计疏忽：

```js
const { title } = props;
```

在 JavaScript 语义上等价于：

```js
const title = props.title;
```

* JS 本身没有“解构后仍保持 getter 引用”的能力
* Vue 无法在不破坏 JS 语义的前提下自动劫持

因此 Vue 选择：

* **明确规则**
* **显式 API（toRefs / toRef）**
* 避免“隐式魔法”带来的不可预测行为

</details>

## 12. 如何用`toRefs`解决？ {#question-subjective-995bee8b3144}

### 题目要点

核心考查：如何用`toRefs`解决？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
import { toRefs } from 'vue';

setup(props) {
  const { title } = toRefs(props);
  return { title };
}

```

</details>

## 13. `watchEffect`自动清理副作用（如事件监听）的底层机制？ {#question-subjective-1e7eda8b7f8b}

### 题目要点

watchEffect, 依赖, 重新执行, 清理函数, 事件监听, 内存泄漏

<details>
<summary>参考答案</summary>

`watchEffect`会自动跟踪依赖，并在依赖变化时重新执行。每次重新执行前，`watchEffect`会自动清理上一次执行时产生的副作用，如事件监听。这是通过在每次执行时返回一个清理函数来实现的。清理函数会在下次执行前被调用，从而避免内存泄漏。

</details>

## 14. 实现函数`parallelRequests(urls, maxConcurrent)` {#question-b44c5715-9bea-4e9b-913d-99d356538aab}

> 题库原题：[实现函数parallelRequests(urls, maxConcurrent)](https://fe.ecool.fun/topic/b44c5715-9bea-4e9b-913d-99d356538aab)

```javascript
// 要求：
// 1. 最多同时执行maxConcurrent个请求
// 2. 请求完成（无论成功/失败）后立即补位新请求
// 3. 返回Promise，结果为所有请求响应数组（顺序需与urls一致）
function parallelRequests(urls, maxConcurrent) {
  // 请补充实现
}
```

### 题目要点

核心考查：实现函数`parallelRequests(urls, maxConcurrent)`的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

## 实现代码

```javascript
function parallelRequests(urls, maxConcurrent) {
  return new Promise((resolve, reject) => {
    const results = new Array(urls.length); // 保证结果顺序
    let nextIndex = 0;                      // 下一个要发起请求的索引
    let activeCount = 0;                    // 当前并发中的请求数
    let finishedCount = 0;                  // 已完成的请求数

    function runNext() {
      // 所有请求完成
      if (finishedCount === urls.length) {
        resolve(results);
        return;
      }

      // 启动新请求（补位）
      while (activeCount < maxConcurrent && nextIndex < urls.length) {
        const current = nextIndex;
        const url = urls[nextIndex];
        nextIndex++;
        activeCount++;

        // 这里假设请求方式是 fetch，可替换为任意返回 Promise 的请求函数
        Promise.resolve(fetch(url))
          .then(res => res)
          .catch(err => err) // 失败也记录结果，不中断整体流程
          .then(result => {
            results[current] = result;
          })
          .finally(() => {
            activeCount--;
            finishedCount++;
            runNext(); // 请求完成后立即补位
          });
      }
    }

    runNext();
  });
}
```

---

## 设计思路说明

### 1. 并发控制的核心

* 使用 `activeCount` 记录**当前正在执行的请求数量**
* 通过 `while (activeCount &lt; maxConcurrent)` 启动新请求
* 请求完成后在 `finally` 中 **立即补位**

这是一个典型的**请求池（request pool）/并发调度器**模型。

---

### 2. 如何保证结果顺序

* 结果数组 `results` 预先按 `urls.length` 创建
* 每个请求在启动时保存自己的索引 `current`
* 无论请求完成顺序如何，始终写入 `results[current]`

这样可以做到：

> **执行顺序无序，结果顺序有序**

---

### 3. 为什么用 `finally`

```js
.finally(() => {
  activeCount--;
  finishedCount++;
  runNext();
});
```

* **成功 / 失败都会执行**
* 满足题目要求：

  > 请求完成（无论成功/失败）后立即补位新请求
* 避免因异常导致并发池“卡死”

---

### 4. 返回整体 Promise 的时机

```js
if (finishedCount === urls.length) {
  resolve(results);
}
```

* 所有请求都完成后，统一 resolve
* 不因单个请求失败 reject（更符合“批量请求”的实际业务需求）
* 如果你希望“只要有一个失败就 reject”，可以在 `catch` 中直接 `reject(err)`

---

## 时间与空间复杂度

* **时间复杂度**：O(n)（调度本身）
* **空间复杂度**：O(n)（结果数组）

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-95/round-159/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-95/_index.md" >}}) · 已是最后一轮 →
