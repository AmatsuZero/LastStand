+++
title = "前端安全 面试题"
draft = false
tags = ["面试", "前端", "前端安全", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:29:35.628Z"
+++

共 35 道 前端安全 面试题。答案默认折叠，便于先自行作答。

## 1. 如果发现JWT Token泄露，如何快速响应？ {#question-bbf8b7ee-035e-4f2b-b64c-40d560e6dc19}

> 难度：3 · 类型：QA

### 题目要点

1. **定位**：确认泄露的是单个用户 Token 还是全局密钥。
2. **拉黑**：立即将泄露的 Token `jti` 加入 Redis 禁用名单。
3. **阻断**：如果是密钥泄露，立即更新环境变量中的 `JWT_SECRET`。
4. **通知**：提醒受影响用户，并建议其修改密码（以防攻击者通过其他渠道获取了账号控制权）。
5. **审计**：检查该 Token 泄露期间产生的异常操作日志，进行回滚或补偿。

<details>
<summary>参考答案</summary>

由于 JWT 是**无状态**的（服务器默认不存储 Token，无法像 Session 那样轻易在服务端作废），快速响应的核心思路在于**阻断该 Token 的有效性**或**强制变更鉴权环境**。

以下是针对不同场景的快速响应方案：

### 1. 服务端拦截：引入“黑名单”机制（最快响应）

这是最直接的补救措施。虽然 JWT 旨在去中心化校验，但在紧急情况下，必须引入中心化检查。

* **操作**：将泄露的 Token 唯一标识（通常是 `jti` 载荷）或整个 Token 字符串存入 Redis 等极速缓存中，并设置过期时间（等于该 Token 的剩余有效期）。
* **逻辑更新**：修改后端的鉴权中间件，在校验 JWT 签名通过后，额外多一步检查：**“该 Token 是否在 Redis 黑名单中？”**。如果在，则拒绝请求。
* **优点**：秒级生效，精准拦截。

### 2. 变更签名密钥（最彻底但代价大）

如果怀疑是大规模泄露，或者加密私钥（Secret Key）本身已暴露：

* **操作**：立即在服务端更换用于签署 JWT 的 **Secret Key**。
* **后果**：由于密钥变了，之前所有基于旧密钥生成的 Token（包括合法用户的）都会瞬间失效。
* **适用场景**：密钥泄露或遭受系统性攻击。虽然这会导致全服用户强制下线（需重新登录），但在极端安全风险下是必要的“熔断”。

### 3. 强制用户重新登录：变更 User Secret

如果你的 JWT 签名逻辑中引入了用户特有的变量（例如：`HMAC256(payload, base_secret + user_password_hash)`）：

* **操作**：在数据库中重置该用户的某个关键字段（如随机生成的 `token_salt` 或直接让其修改密码）。
* **原理**：后端在校验时，由于该用户的 `user_password_hash` 或 `salt` 变了，旧 Token 算出的签名将无法匹配，从而实现单用户精准作废。

### 4. 移动端/客户端响应：主动清除

* **操作**：通过通知推送（Push Notification）或特定的指令，强制客户端执行注销逻辑，清除本地存储的 `localStorage` 或 `Cookie` 中的 Token。
* **局限性**：这只能防君子不防小人。如果攻击者已经拿到了 Token 并通过 Postman 等工具调用接口，客户端的清除动作毫无意义，必须配合上述服务端拦截。

### 5. 缩短过期时间与 Refresh Token 策略（长效机制）

如果泄露已经发生，而你的 Token 有效期设为了 7 天，那么损失是巨大的。

* **响应举措**：立即调低新生成 Token 的 `exp`（过期时间），例如缩短至 15 分钟。
* **利用 Refresh Token**：如果系统使用了双 Token 机制，立即在数据库中禁用对应的 `Refresh Token`，这样攻击者手中的 Access Token 一旦过期，将无法续期。

</details>

## 2. 在前端开发中，你了解哪些与安全性相关的内容？（提示：除了 HTTP 和 HTTPS） {#question-9476535c-2cd4-49e5-b3ee-f16a01a371ab}

> 难度：2 · 类型：QA

### 题目要点

* **注入防御**：通过 CSP 和转义机制防止 XSS 脚本执行。
* **请求校验**：利用 SameSite 属性和 CSRF Token 防范身份伪造。
* **资源保护**：通过响应头控制页面嵌套（点击劫持）和资源加载策略。
* **工程安全**：关注 npm 依赖审计和 CDN 资源的完整性校验（SRI）。
* **存储安全**：审慎选择浏览器本地存储方案，隔离敏感数据。

<details>
<summary>参考答案</summary>

前端是防御的第一线，直接面对用户的输入和浏览器的各种执行环境。除了传输层的加密（HTTP/HTTPS），前端安全性主要集中在**注入攻击、跨站伪造、浏览器策略以及依赖项安全**四个维度。

### 1. XSS（跨站脚本攻击）

这是前端最常见的安全威胁。攻击者通过在页面中注入恶意脚本，窃取用户的 Cookie、Session 或劫持用户行为。

* **防御机制**：
* **输入过滤与输出转义**：对用户提交的所有内容进行校验，在渲染到 HTML 之前进行转义（如将 `<` 转为 `&lt;`）。现代框架（如 Vue 和 React）默认会对数据绑定进行转义，但需警惕 `v-html` 或 `dangerouslySetInnerHTML`。
* **内容安全策略（CSP）**：通过 HTTP 响应头配置 `Content-Security-Policy`，限制浏览器只能加载特定域名的资源，禁止执行内联脚本（inline script），从根本上遏制 XSS 的执行环境。

### 2. CSRF（跨站请求伪造）

攻击者诱导用户访问第三方恶意网站，利用浏览器自动携带 Cookie 的特性，冒充用户向目标服务器发送恶意请求（如转账、修改密码）。

* **防御机制**：
* **SameSite Cookie 属性**：将 Cookie 设置为 `SameSite=Lax` 或 `Strict`，限制第三方网站请求携带 Cookie。
* **CSRF Token**：服务器生成一个随机 Token，前端在发送非 GET 请求时将其放入请求头或表单中，服务器校验该 Token 的有效性。由于第三方网站无法跨域获取该 Token，攻击无法奏效。

### 3. 点击劫持（Clickjacking）

攻击者通过 `&lt;iframe&gt;` 将目标网站嵌入到一个透明层下，诱导用户点击看似无害的按钮，实则操作了底层被嵌入的网站。

* **防御机制**：
* **X-Frame-Options**：设置响应头为 `DENY` 或 `SAMEORIGIN`，告诉浏览器该页面不允许被嵌入到任何（或非同源）的 iframe 中。

### 4. 浏览器端数据安全与隐私

* **敏感信息泄露**：避免在 LocalStorage 或 SessionStorage 中存储未加密的敏感信息（如 Token、个人隐私），因为这些数据极易被 XSS 脚本读取。建议使用 `HttpOnly` 标识的 Cookie 来存储鉴权信息。
* **Window.opener 安全性**：在使用 `target="_blank"` 打开新窗口时，新页面可以通过 `window.opener` 操作原页面。应添加 `rel="noopener noreferrer"` 来阻断这种关联。

### 5. 供应链安全（Supply Chain Security）

现代前端高度依赖 npm 生态。一旦某个底层依赖包被植入木马，整个项目都会沦陷。

* **防御机制**：
* **定期审计**：使用 `npm audit` 检查已知漏洞。
* **锁定版本**：通过 `package-lock.json` 或 `yarn.lock` 确保团队及构建环境安装的包版本一致，防止意外升级到带有后门的版本。
* **子资源完整性（SRI）**：在引用 CDN 资源时，加入 `integrity` 属性（如文件的哈希值），浏览器会校验下载的内容是否被篡改。

</details>

## 3. 使用第三方库可能带来哪些安全风险？ {#question-7f8684e3-e810-4bb4-aee0-28180db55fb0}

> 难度：3 · 类型：QA

### 题目要点

使用第三方库的安全风险主要包括代码漏洞、恶意代码注入、权限滥用、依赖复杂性、数据泄露、性能问题、冲突风险和法律问题。

要降低风险，可以：
1. 选择受信任、活跃维护的库。
2. 定期更新和审查依赖。
3. 使用自动化工具监控安全漏洞。
4. 限制权限，确保数据隐私。
5. 仔细检查许可证，避免法律风险。

<details>
<summary>参考答案</summary>

使用第三方库虽然可以提升开发效率，但也可能带来一系列安全风险，尤其是在处理敏感信息或公开发布的应用程序时。

这些安全风险主要包括以下几个方面：

---

### **1. 代码漏洞风险**
第三方库中可能存在已知或未知的安全漏洞：
- **过时版本**：使用了存在已知漏洞的老版本库，容易被攻击者利用。
- **代码缺陷**：库的代码中可能存在漏洞，比如 SQL 注入、跨站脚本攻击 (XSS)、远程代码执行 (RCE) 等。

#### 解决方法：
- 定期检查依赖的安全性（使用工具如 `npm audit` 或 `yarn audit`）。
- 使用受信任的、活跃维护的库，并及时更新到最新稳定版本。

---

### **2. 恶意代码注入**
第三方库可能被攻击者植入恶意代码：
- **供应链攻击**：攻击者篡改了库的源码或其依赖，导致使用该库的项目被感染。
- **依赖污染**：间接依赖的某个库被替换为恶意版本。

#### 解决方法：
- 使用固定版本号 (`package-lock.json` 或 `yarn.lock`) 锁定依赖版本。
- 检查库的维护者信誉、下载量和使用社区规模。
- 使用工具（如 `Snyk`）扫描和监控依赖的安全性。

---

### **3. 未授权的权限访问**
某些第三方库可能会要求过多的权限，比如访问文件系统、网络资源或敏感数据。如果权限被滥用，可能导致数据泄露或非法操作。

#### 解决方法：
- 仔细阅读库的文档，确保其权限需求合理。
- 运行时对权限进行限制（如使用 `Node.js` 的沙盒机制或浏览器 CSP 策略）。

---

### **4. 依赖爆炸问题**
现代项目往往引入多个库，而每个库可能依赖于其他库，形成复杂的依赖树：
- **递归依赖风险**：你可能并不直接使用的库也会被引入，并可能包含漏洞。
- **依赖冗余**：加载过多的依赖可能增加应用暴露面。

#### 解决方法：
- 定期优化依赖树，删除不必要的依赖。
- 使用工具（如 `Webpack` 或 `Vite`）分析依赖的体积和来源。

---

### **5. 数据泄露风险**
某些库可能收集或暴露用户数据：
- **明文存储数据**：库可能不安全地存储敏感信息。
- **未授权的数据上报**：某些库可能暗中将用户数据发送到第三方服务器。

#### 解决方法：
- 遵循隐私法规（如 GDPR），避免使用含有数据上报功能的库。
- 对敏感数据进行加密存储和传输。

---

### **6. 不兼容或潜在冲突**
第三方库之间可能存在兼容性问题：
- **版本冲突**：两个库可能依赖同一个包的不同版本，导致运行时错误。
- **全局命名污染**：某些库可能修改全局对象，影响项目其他部分的运行。

#### 解决方法：
- 避免引入功能重复的库，选择社区推荐的单一方案。
- 使用模块隔离技术，如 `Webpack` 的模块作用域隔离。

---

### **7. 性能问题**
某些库可能存在性能问题：
- **未优化的代码**：库中的算法可能效率低下。
- **体积过大**：某些库可能包含了未使用的功能，导致应用加载时间变长。

#### 解决方法：
- 按需引入模块，使用 Tree Shaking 技术移除未使用的代码。
- 定期分析和优化应用的性能。

---

### **8. 法律和许可风险**
使用未明确许可的第三方库可能导致法律纠纷：
- **许可证不兼容**：某些开源库的许可证可能限制其在商业产品中的使用。
- **侵犯版权**：未正确遵循开源许可证条款可能导致法律风险。

#### 解决方法：
- 仔细检查库的许可证类型（如 MIT、Apache 2.0、GPL 等）。
- 避免使用可能带来商业限制的库（如 GPL）。

</details>

## 4. 前端如何防止加载外域脚本？ {#question-1e3b830f-04d0-476d-b04b-462ae4e5e20d}

> 难度：1 · 类型：QA

### 题目要点

前端可以通过以下方式防止加载外域脚本：

<details>
<summary>参考答案</summary>

前端可以通过以下方式防止加载外域脚本：

1. 使用 Content Security Policy (CSP)：CSP 是一个 HTTP 头，可以限制页面可以从哪些源加载资源。通过 CSP，可以禁止加载外域脚本，从而防止 XSS 攻击等安全问题。

2. 使用 Subresource Integrity (SRI)：SRI 是一个浏览器功能，可以确保在加载外部资源时，它们的内容没有被篡改过。通过在 script 标签中添加 integrity 属性，可以指定资源的校验和，浏览器会校验资源是否与 integrity 值匹配，从而确保资源没有被篡改过。

3. 避免使用动态脚本加载：使用 document.createElement('script') 创建 script 元素，并手动设置其 src 属性，可以避免使用 eval() 动态执行脚本。动态加载脚本的方式可能会受到中间人攻击，从而加载恶意脚本。

4. 避免使用不安全的协议加载资源：使用 HTTPS 加载资源可以确保资源在传输过程中不会被篡改。避免使用 HTTP 或者 file 协议加载资源，这些协议容易受到中间人攻击。

</details>

## 5. 介绍下如何实现 token 加密？ {#question-832f41cd-27bb-4fae-bf8d-b63b52d7086a}

> 难度：1 · 类型：QA

### 题目要点

Token 加密的关键是确保数据的机密性和完整性。通过选择合适的加密算法、正确生成和验证 Token，可以有效保护用户身份信息和系统的安全性。

<details>
<summary>参考答案</summary>

在身份认证中，Token 加密是确保用户身份验证信息安全的一种方法。常见的实现包括 JWT（JSON Web Token）和加密算法。下面是实现 Token 加密的基本步骤：

### **1. 生成 Token**

1. **选择加密算法**：
   - 常见的算法包括对称加密（如 HMAC SHA256）和非对称加密（如 RSA、ECMAScript）。

2. **创建 Token**：
   - **Payload**：包含用户信息和其他声明。
   - **Header**：指定加密算法。
   - **Signature**：将 Header 和 Payload 使用密钥或公私钥对进行签名。

#### **JWT 示例**

```javascript
const jwt = require('jsonwebtoken');

// 生成 Token
function generateToken(user) {
  const payload = { userId: user.id, username: user.username };
  const secretKey = 'your_secret_key'; // 对称加密密钥
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  return token;
}
```

### **2. 验证 Token**

1. **解析 Token**：
   - **Header**：从 Token 中提取算法和加密方式。
   - **Payload**：解析并获取用户信息。
   - **Signature**：验证签名是否有效，确保 Token 未被篡改。

2. **验证过程**：

```javascript
// 验证 Token
function verifyToken(token) {
  const secretKey = 'your_secret_key';
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded; // 验证通过，返回解码后的用户信息
  } catch (err) {
    throw new Error('Invalid token');
  }
}
```

### **3. 常见的加密算法**

- **对称加密**：使用相同的密钥进行加密和解密，如 HMAC SHA256。
- **非对称加密**：使用一对公钥和私钥进行加密和解密，如 RSA。

### **4. Token 的安全管理**

- **存储**：Token 通常存储在客户端的 Cookie 或 Local Storage 中。确保存储位置的安全性，以防 XSS 攻击。
- **过期时间**：设置合理的过期时间，并使用刷新 Token 机制以维持用户会话。
- **传输**：使用 HTTPS 确保 Token 在传输过程中加密。

</details>

## 6. cookie 构成部分有哪些 {#question-8a109788-5551-44a0-ba39-526632145959}

> 难度：2 · 类型：QA

### 题目要点

Cookie 是一种存储在用户浏览器中的小型数据，通常用于保存用户的会话信息或跟踪用户行为。Cookie 由以下几个部分构成：

<details>
<summary>参考答案</summary>

Cookie 是一种存储在用户浏览器中的小型数据，通常用于保存用户的会话信息或跟踪用户行为。Cookie 由以下几个部分构成：

### **1. 名称（Name）**
- **描述**：Cookie 的键，用于唯一标识该 Cookie。
- **示例**：`username`

### **2. 值（Value）**
- **描述**：与 Cookie 名称关联的数据。可以是字符串或其他数据类型的编码形式。
- **示例**：`john_doe`

### **3. 域（Domain）**
- **描述**：指定 Cookie 可以被哪些域名访问。通常用于限制 Cookie 的使用范围。
- **默认**：如果未设置，默认是创建 Cookie 的域。
- **示例**：`.example.com`（允许子域名访问）

### **4. 路径（Path）**
- **描述**：指定 Cookie 可以被哪些路径访问。通常用于控制 Cookie 在网站中的具体路径。
- **默认**：如果未设置，默认是创建 Cookie 的路径。
- **示例**：`/`（允许整个网站访问）

### **5. 过期时间（Expires）**
- **描述**：指定 Cookie 的过期日期和时间。到达此时间后，Cookie 将被删除。
- **默认**：如果未设置，Cookie 会被视为会话 Cookie，并在浏览器关闭时删除。
- **示例**：`Wed, 01 Jan 2025 00:00:00 GMT`

### **6. 最大有效期（Max-Age）**
- **描述**：指定 Cookie 的有效期（以秒为单位）。与 `Expires` 类似，但通常以相对时间表示。
- **示例**：`3600`（表示 Cookie 将在 1 小时后过期）

### **7. 安全标志（Secure）**
- **描述**：如果设置了 `Secure`，则 Cookie 仅在使用 HTTPS 协议时发送，确保数据传输的安全性。
- **示例**：`Secure`

### **8. HttpOnly 标志（HttpOnly）**
- **描述**：如果设置了 `HttpOnly`，则 Cookie 不能通过 JavaScript 访问，这有助于防止 XSS 攻击。
- **示例**：`HttpOnly`

### **9. SameSite 标志（SameSite）**
- **描述**：控制 Cookie 的跨站点请求策略，减少 CSRF 攻击的风险。可以设置为 `Strict`、`Lax` 或 `None`。
- **示例**：`SameSite=Lax`

</details>

## 7. 说说对数字证书的了解 {#question-8ac65ba5-f7d5-4d01-a6eb-2e8259850ef7}

> 难度：2 · 类型：QA

### 题目要点

数字证书是用于验证身份和加密通信的关键工具，通过提供公钥、身份验证和数字签名，增强了网络通信的安全性。尽管它们在提高安全性方面有显著作用，但也可能带来成本和管理上的挑战。

<details>
<summary>参考答案</summary>

数字证书是用于验证和加密电子通信中身份的工具，广泛应用于安全通信和数据保护领域。数字证书由受信任的证书颁发机构（CA）颁发，提供了身份验证和数据加密功能。

**主要组成部分**：
1. **证书持有者信息**：包括持有者的姓名、组织、电子邮件地址等。
2. **公钥**：用于加密信息或验证签名，公钥与私钥配对。
3. **证书颁发机构（CA）**：负责颁发和验证证书的机构。
4. **数字签名**：由 CA 使用其私钥对证书内容进行签名，以确保证书的真实性。
5. **有效期**：证书的有效开始和结束日期。
6. **证书序列号**：唯一标识证书的编号。
7. **证书用途**：指明证书的用途，如 SSL/TLS、代码签名等。

**数字证书的功能**：
1. **身份验证**：确认通信方的身份，例如网站是否可信。
2. **数据加密**：通过公钥加密数据，确保数据在传输过程中不被窃取。
3. **数据完整性**：通过数字签名验证数据是否被篡改。

**常见类型**：
1. **SSL/TLS 证书**：用于加密 Web 浏览器和服务器之间的通信。
2. **代码签名证书**：用于验证软件发布者的身份并确保代码未被篡改。
3. **个人证书**：用于个人身份验证，如电子邮件签名。

**优点**：
- **安全性**：提供数据加密和身份验证，保护通信安全。
- **信任**：通过 CA 的验证建立信任，确保通信双方的身份可靠。

**缺点**：
- **成本**：高质量的数字证书通常需要付费。
- **管理复杂性**：证书的颁发、更新和吊销需要管理和维护。

</details>

## 8. 说说 jwt 中的 token，是怎么进行身份验证的？ {#question-d8631cf2-0f88-42a2-a4d7-0de26d611201}

> 难度：3 · 类型：QA

### 题目要点

JWT（JSON Web Token）是一种用于 **身份验证** 和 **授权** 的开源标准。它是一种将用户身份信息 **编码为一个 Token** 的形式进行身份验证的机制。JWT 是基于 **JSON** 格式的令牌，并且是自包含的，即它包含了验证用户身份和权限所需的所有信息。通过 JWT，前后端可以进行无状态的认证。

<details>
<summary>参考答案</summary>

JWT（JSON Web Token）是一种用于 **身份验证** 和 **授权** 的开源标准。它是一种将用户身份信息 **编码为一个 Token** 的形式进行身份验证的机制。JWT 是基于 **JSON** 格式的令牌，并且是自包含的，即它包含了验证用户身份和权限所需的所有信息。通过 JWT，前后端可以进行无状态的认证。

### 1. **JWT 的结构**

JWT 的结构是由三个部分组成的，使用点 `.` 分隔：
```
Header.Payload.Signature
```
这三个部分分别是：

- **Header（头部）**：包含算法和令牌类型的元数据。
- **Payload（负载）**：包含用户的身份信息（比如用户 ID、角色）以及其他自定义数据。
- **Signature（签名）**：用于确保 Token 在传输过程中没有被篡改。

#### 示例：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
- **Header** 部分内容：
  ```json
  {
    "alg": "HS256",  // 签名算法 HMAC-SHA256
    "typ": "JWT"     // Token 类型为 JWT
  }
  ```
- **Payload** 部分内容：
  ```json
  {
    "sub": "1234567890", // 用户 ID
    "name": "John Doe",  // 用户名称
    "iat": 1516239022    // Token 的签发时间
  }
  ```
- **Signature** 是用指定的算法和密钥加密生成的：
  ```
  HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    secret
  )
  ```

### 2. **JWT 身份验证的流程**

身份验证流程通过以下几个步骤来完成：

#### 1. **用户登录**：
用户通过登录页面提交用户名和密码，后端服务器验证用户的身份信息。

#### 2. **生成 JWT Token**：
一旦用户通过身份验证，服务器会生成一个 JWT Token。生成的 Token 包含了用户身份相关的信息（例如用户 ID 或角色），这些信息被编码在 **Payload** 中。然后服务器使用 **私钥**（或预定义的密钥）对 Token 进行签名。

#### 3. **前端存储 Token**：
服务器将生成的 JWT 返回给前端。前端通常会将 JWT 存储在 **LocalStorage** 或 **SessionStorage** 中，或者作为 Cookie 存储在客户端。

#### 4. **携带 Token 发起请求**：
在用户登录后，前端每次请求需要认证的资源时，将 JWT 放入 **HTTP 请求头的 Authorization 字段** 中（通常是 `Bearer Token` 形式），例如：
```http
Authorization: Bearer <JWT_Token>
```

#### 5. **后端验证 JWT**：
服务器接收到前端携带的 JWT 后，会对其进行验证：
- **验证签名**：服务器使用预先定义的密钥（私钥）对 JWT 的签名部分进行解密，验证它没有被篡改。
- **验证有效性**：服务器检查 Token 是否过期（通过 `exp` 字段）或是否具备访问资源的权限（通过角色或权限字段）。

如果 Token 验证通过，服务器就会返回用户请求的数据，否则返回 **401 Unauthorized** 或 **403 Forbidden** 的错误。

#### 6. **续签或刷新 Token**：
如果 Token 过期，通常会提供 **刷新 Token** 的机制，允许用户使用一个短时效的 Refresh Token 来获取新的 JWT。

### 3. **JWT 的优势**
- **无状态认证**：JWT 是无状态的，不需要在服务器端存储 Token，因此服务器可以扩展得更好。服务器不需要保存用户的会话状态，所有信息都在 Token 中自包含。
- **跨域认证**：JWT 可以在多个不同的域中使用，因此特别适合在微服务架构中使用。
- **减少数据库查询**：由于 JWT 包含了用户的信息，服务器在每次请求时不需要查询数据库来获取用户信息。

### 4. **JWT 的安全性考量**
虽然 JWT 自带签名以防篡改，但它并不自带加密，所有的信息都是 **明文** 存在于 Token 的 Payload 中。因此，以下是一些安全性考量：

- **不要在 Payload 中存放敏感数据**：由于 JWT 的 Payload 是可解码的，不能将敏感信息（如密码）直接存入 Payload。
- **Token 过期机制**：JWT 应该设置 **过期时间** (`exp`)，确保 Token 不会被长期使用。一旦 Token 过期，用户需要重新登录或使用刷新 Token 获取新 Token。
- **HTTPS 传输**：在传输 Token 时，应该使用 **HTTPS** 确保通信的安全，防止 Token 被窃取。
- **刷新 Token 机制**：可以设计一个更短时效的 Refresh Token，用户可以使用它在 Token 过期后获取新的 Token。

### 5. **JWT 的局限性**
- **Token 无法撤销**：JWT 是无状态的，因此在 Token 发出后，服务器无法主动撤销它。如果用户登出或者 Token 泄漏，服务器无法使其失效，除非等待 Token 过期。
- **Token 体积较大**：由于 JWT 是自包含的，它可能比传统的会话 Token 体积要大，传输频繁时可能会影响性能。

### 总结
JWT 是一种轻量级的身份验证机制，适用于无状态的应用场景，尤其在微服务架构和跨域场景下十分有用。通过对 JWT 的签名机制，可以保证 Token 的完整性和可靠性，但需要注意不能将敏感数据放在 JWT 中，并确保 Token 的安全传输和使用。

</details>

## 9. 在域名 A 的网站上，跨域请求域名 B 上的接口，怎么在跨域请求中携带域名 B 的 Cookie 呢？ {#question-3f9c98d1-28f5-46fe-ba4b-ee7d9f6107cf}

> 难度：3 · 类型：QA

### 题目要点

在跨域请求中带 Cookie 需要服务端和客户端的共同支持，包括配置 `Access-Control-Allow-Credentials`、`SameSite=None` 等，并在前端请求中启用凭证携带的设置。

<details>
<summary>参考答案</summary>

要在跨域请求中携带其他域名下的 Cookie，通常需要确保以下几点：

### 1. **服务器允许跨域请求带上 Cookie**
   - 服务器端设置 `Access-Control-Allow-Origin` 为指定的域或 `*`（但带 Cookie 时不能使用 `*`），例如：
     ```http
     Access-Control-Allow-Origin: https://example.com
     ```
   - 服务器需要设置 `Access-Control-Allow-Credentials` 为 `true`，允许发送凭证（如 Cookie、HTTP 认证信息）：
     ```http
     Access-Control-Allow-Credentials: true
     ```
   - 确保服务器设置的 Cookie `Domain` 属性符合你要共享的域范围。对于 `.example.com` 的 Cookie，`sub.example.com` 和 `another-sub.example.com` 下的请求都可以使用该 Cookie。

### 2. **客户端请求设置**
   - 客户端请求中需要设置 `withCredentials` 为 `true`，允许在跨域请求中发送 Cookie：
     ```javascript
     axios.get('https://api.example.com/data', {
       withCredentials: true
     });
     ```
   - 如果使用 `fetch`，也可以设置 `credentials` 为 `"include"`：
     ```javascript
     fetch('https://api.example.com/data', {
       credentials: 'include'
     });
     ```

### 3. **Cookie 属性的正确配置**
   - Cookie 必须设置 `SameSite=None`，允许跨站点发送，并且设置 `Secure` 属性确保只有在 HTTPS 连接下才发送该 Cookie。示例：
     ```http
     Set-Cookie: sessionId=abc123; SameSite=None; Secure
     ```
   - 确保 Cookie 的 `Domain` 属性被设置为共享的父域名或适合的子域名。这样，API 请求才会自动携带该域的 Cookie。

### 4. **前端和服务端的协议匹配**
   - 确保前端和服务端都通过 HTTPS 访问，`SameSite=None` Cookie 只能在 HTTPS 下使用。

</details>

## 10. OAuth2.0 是什么，是怎么实现授权第三方应用登录的？ {#question-abd13e17-e3c0-4f5b-86ba-5d6a7c40b2e2}

> 难度：3 · 类型：QA

### 题目要点

OAuth2.0 登录通过授权码、安全令牌等机制，让客户端可以安全地代表用户访问资源，适用于第三方应用授权登录，提升用户体验的同时保障用户信息安全。

<details>
<summary>参考答案</summary>

OAuth2.0 是一种授权协议，允许第三方应用在不获取用户密码的情况下，安全地访问用户的资源。OAuth2.0 通过 `Access Token` 实现登录授权，应用可以使用该令牌访问用户授权的资源。

### OAuth2.0 登录原理
OAuth2.0 登录主要涉及四个角色：
1. **资源拥有者（Resource Owner）**：通常是用户，拥有资源和访问权限。
2. **客户端（Client）**：需要访问资源的第三方应用（例如社交平台上的某个应用）。
3. **资源服务器（Resource Server）**：存储资源的服务器，提供接口供客户端访问资源。
4. **授权服务器（Authorization Server）**：负责用户认证，并发放 `Access Token` 和 `Refresh Token`。

### OAuth2.0 授权流程
OAuth2.0 提供了四种授权模式，其中最常见的是“授权码模式”（Authorization Code Flow），适合 web 应用，流程如下：

1. **用户授权请求**
   - 用户在客户端应用上点击“使用某平台登录”（例如使用 Google 登录），客户端应用将用户跳转到授权服务器的授权页面。
   - 客户端会传递 `client_id`、`redirect_uri`、`response_type` 等参数。

2. **用户同意授权**
   - 用户在授权页面上登录，并同意授权客户端访问自己的某些资源（如用户信息、邮箱等）。
   - 授权服务器验证用户身份后，生成一个**授权码（Authorization Code）**，将其重定向返回给客户端。

3. **交换授权码获取访问令牌**
   - 客户端收到授权码后，直接向授权服务器请求 `Access Token`。该请求包含 `client_id`、`client_secret`、`grant_type`、`code`、`redirect_uri` 等参数。
   - 授权服务器验证授权码有效后，返回 `Access Token` 和 `Refresh Token`（可选）。

4. **使用 Access Token 访问资源**
   - 客户端拿到 `Access Token` 后，可以在需要时携带该令牌向资源服务器发起请求，资源服务器验证令牌有效性后允许访问。
   - 如果 `Access Token` 过期，可以通过 `Refresh Token` 请求新的 `Access Token`，避免用户重新登录。

### OAuth2.0 中的关键令牌
1. **Authorization Code（授权码）**：用于交换 `Access Token` 的临时凭据。
2. **Access Token（访问令牌）**：允许客户端访问资源的凭证，通常有过期时间。
3. **Refresh Token（刷新令牌）**：当 `Access Token` 过期时，使用 `Refresh Token` 获取新的 `Access Token`，无需用户重新登录。

### 安全性
- **Access Token 有时效性**，过期后需要重新获取，减少安全风险。
- **Refresh Token** 通常有效期较长，用于延长用户会话，适合安全性高的场景。

</details>

## 11. 如何禁止他人使用控制台调试前端页面代码? {#question-71356502-8f31-4963-bf16-798a45ca7552}

> 难度：3 · 类型：QA

### 题目要点

防止别人调试前端代码的思路包括：

1. **代码保护**：使用混淆和压缩技术，尽量避免敏感逻辑出现在前端。
2. **运行时检测**：通过检测开发者工具和禁用调试快捷键增加调试难度。
3. **资源保护**：通过限制访问、请求签名等手段保护前端资源。
4. **核心逻辑后移**：将重要逻辑放到后端执行。

所有措施只能增加调试难度，**无法完全防止代码被调试**。更重要的是做好后端安全策略，将敏感逻辑和验证放在服务器端实现。

<details>
<summary>参考答案</summary>

防止别人调试前端页面代码是一个安全性问题，但需要认识到，前端代码本质上是运行在用户浏览器中的，用户拥有完全的控制权，**无法完全防止代码被调试或篡改**。

我们只能通过一定的技术手段增加调试难度，提升代码安全性。

这些手段主要分为**代码保护**和**运行时检测**两类。

---

### **1. 代码保护**

#### (1) **代码混淆**
通过工具对 JavaScript 代码进行混淆和压缩，使代码难以阅读和理解：
- 替换变量名为无意义的字符。
- 删除空格、注释。
- 重组代码逻辑，使其更难调试。

常用工具：
- **UglifyJS**
- **Terser**
- **Babel Minify**

示例：
原始代码：
```javascript
function sayHello() {
    console.log('Hello, world!');
}
```
混淆后：
```javascript
function a(){console.log("Hello, world!")}
```

#### (2) **敏感逻辑放在后端**
尽量避免将敏感的业务逻辑放在前端，比如权限验证、算法实现等。这些逻辑可以通过 API 调用在服务器端处理。

#### (3) **动态加载代码**
将部分核心逻辑通过加密后动态加载：
- 在需要时通过网络请求加载核心代码。
- 使用加密技术对加载的代码进行保护。

---

### **2. 运行时检测**

#### (1) **检测开发者工具**
通过轮询或检测方法判断用户是否打开了浏览器的开发者工具：
- 检测 `window.console` 的调用。
- 检测 `debugger` 是否被触发。
- 检测 `DevTools` 是否开启。

示例代码：
```javascript
(function detectDevTools() {
    const threshold = 100; // 检测宽度高度阈值
    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            alert('检测到开发者工具已开启！');
        }
    }, 1000);
})();
```

#### (2) **禁用右键和键盘快捷键**
通过监听事件禁用常用的调试快捷键，如 `F12`、`Ctrl+Shift+I` 等：
```javascript
document.addEventListener('keydown', (event) => {
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
        alert('调试被禁用！');
    }
});
```

#### (3) **干扰 `console` 输出**
通过劫持 `console.log` 等函数，干扰开发者读取信息：
```javascript
console.log = function () {
    alert('不允许调试！');
};
```

---

### **3. 资源保护**

#### (1) **防止代码被直接访问**
- 通过 `robots.txt` 禁止爬虫访问代码。
- 通过 CDN 或代理隐藏真实的资源路径。

#### (2) **请求签名与校验**
对前端发起的请求增加签名或时间戳校验，防止用户手动伪造请求。

---

### **4. 提高调试难度**

#### (1) **定期检查运行环境**
定期检查代码是否被篡改或执行环境是否异常，例如监控全局变量的值或执行环境的行为。

#### (2) **动态代码生成**
将部分逻辑代码动态生成，增加代码的动态性和复杂性。

---

### **5. 其他**
- 完全禁止调试前端代码是不可行的，因为最终代码是用户可以访问和执行的。
- 重点应放在保护核心业务逻辑、敏感数据和后台 API 安全，而不是过度关注前端防调试。

</details>

## 12. HTTP是一个无状态的协议，那么Web应用是怎么保持用户的登录态的呢？ {#question-c08f65cd-a9ab-425e-baae-d2772dcd5839}

> 难度：3 · 类型：QA

### 题目要点

Web 应用中保持用户登录态的方式，通常依赖以下几种技术：
1. **Cookies**：存储在客户端，常用于服务器端维护用户会话。
2. **LocalStorage/SessionStorage**：通过浏览器的本地存储保存用户的身份信息（如 `token`）。
3. **Session**：后端维护会话状态，通过 `session ID` 在客户端和服务器之间传递，适用于传统 Web 应用。
4. **JWT**：无状态的身份验证机制，适用于分布式和 API 驱动的应用。
5. **OAuth 2.0**：授权框架，适用于跨应用和第三方服务的身份认证。

<details>
<summary>参考答案</summary>

虽然 **HTTP** 协议本身是无状态的，即每个请求都是独立的，不会记住之前的请求状态，但 Web 应用通常需要保持用户的登录状态，这通常是通过以下几种方式来实现的：

### **1. Cookies**

**Cookies** 是 Web 应用中最常见的保持登录态的方式。当用户登录成功时，后端服务器会生成一个标识用户身份的 **session ID** 或 **token**，并将其保存在用户的浏览器的 Cookies 中。之后，用户每次发送请求时，浏览器会自动带上这个 Cookie，从而使服务器能够识别用户身份，保持登录状态。

#### **工作原理**：
- **用户登录**：用户输入用户名和密码进行登录，后端服务器验证通过后，生成一个唯一的标识符（例如 `session ID` 或 `JWT token`），并将其存储在用户浏览器的 Cookies 中。
- **发送请求**：用户每次发送请求时，浏览器会自动附带这个 Cookie，服务器通过 Cookie 中的标识符来识别用户身份。
- **有效期管理**：Cookie 可以设置过期时间（`Expires` 或 `Max-Age`），过期后需要重新登录。

#### **优点**：
- 简单易用，浏览器会自动管理 Cookies。
- 支持跨页面持久化登录态。

#### **缺点**：
- 受浏览器的安全策略限制，如 **SameSite** 限制和跨域问题。
- 如果存储了敏感数据，可能面临被盗用的风险，必须采取适当的加密措施。

### **2. LocalStorage / SessionStorage**

**LocalStorage** 和 **SessionStorage** 是浏览器提供的本地存储方式，常用于存储用户登录信息（如 `token`）等非敏感数据。这两种存储方式的主要区别是：
- **LocalStorage**：数据永久存储，直到被显式删除。
- **SessionStorage**：数据仅在浏览器会话（标签页）中有效，关闭标签页或浏览器后数据丢失。

#### **工作原理**：
- 用户登录后，后端将用户身份信息（如 `JWT token`）返回，前端将其保存在 **LocalStorage** 或 **SessionStorage** 中。
- 每次发送请求时，前端将 `token` 从存储中读取并附加到请求头中，后端通过解析请求头来验证用户身份。

#### **优点**：
- 数据存储在客户端，不依赖于 Cookies。
- 适用于单页面应用（SPA）中，尤其是使用 **JWT token** 的场景。
- **LocalStorage** 可以存储大量数据。

#### **缺点**：
- 容易受到 XSS 攻击，如果攻击者能够注入恶意脚本，可能会窃取存储在浏览器中的敏感数据。
- 不支持跨标签页和跨域的共享。

### **3. Session**

**Session** 是一种传统的服务端保持状态的方法。用户登录时，后端会为每个用户分配一个唯一的 **session ID**，并将该 ID 存储在服务器端。当用户发送请求时，浏览器会自动带上一个包含该 **session ID** 的 Cookie，后端根据 **session ID** 查找对应的会话数据，从而识别用户的身份。

#### **工作原理**：
- **用户登录**：用户登录后，服务器会创建一个 **session ID** 并将其存储在服务器的内存或数据库中，返回给前端一个 `session ID` 并存储在浏览器的 Cookie 中。
- **后续请求**：用户发送请求时，浏览器会将 **session ID** 自动附加到请求中，服务器通过 **session ID** 查找用户的会话状态。

#### **优点**：
- **安全性较高**：敏感数据存储在服务器端，不易被窃取。
- 可以在服务器端对 session 数据进行控制，如过期、销毁等。

#### **缺点**：
- **服务器负担**：服务器需要存储所有活跃会话的状态，尤其是大量并发请求时，存储和管理 session 可能会增加服务器的负担。
- 不支持跨域访问，因为每个 **session ID** 是与特定域名绑定的。

### **4. JSON Web Token (JWT)**

**JWT**（JSON Web Token）是一种无状态的身份验证机制，常用于现代 Web 应用，尤其是分布式应用和 API 服务中。JWT 不依赖于服务器存储会话信息，而是通过加密签名的方式将用户信息和认证信息包含在 **token** 中，客户端（如浏览器）保存该 token，并在后续请求中携带该 token。

#### **工作原理**：
- **用户登录**：用户通过用户名和密码登录，服务器验证通过后生成一个 **JWT token**（包含用户身份信息、过期时间等），并返回给前端。
- **后续请求**：客户端将 JWT token 保存在 **LocalStorage** 或 **SessionStorage** 中，并将其附加到每次请求的 HTTP header（如 `Authorization: Bearer <token>`）。
- **验证 token**：后端通过解码 JWT token，验证其有效性并确认用户身份。

#### **优点**：
- **无状态**：不需要服务器保存会话信息，每次请求都携带完整的身份验证信息。
- 适用于分布式架构和微服务架构中的跨域认证。
- 可以在前端存储 JWT token，并可以与第三方 API 无缝集成。

#### **缺点**：
- **安全问题**：如果 JWT token 被盗，攻击者可以伪造请求，尤其是在没有使用 HTTPS 或 token 存储不当的情况下。
- **刷新 token**：JWT token 通常是无状态的，一旦过期，需要通过某种机制（如刷新 token）来处理登录过期的情况。

### **5. OAuth 2.0**

**OAuth 2.0** 是一种授权框架，允许第三方应用通过授权方式访问资源，而不需要直接暴露用户的凭证。OAuth 2.0 常用于授权访问跨平台资源（如 Google、Facebook 登录），它通常结合 **JWT** 来实现无状态的用户认证。

#### **工作原理**：
- 用户通过第三方授权服务（如 Google）进行登录授权。
- 第三方服务返回一个 **access token** 和一个 **refresh token**，前端使用 **access token** 进行 API 请求。
- 如果 **access token** 过期，前端使用 **refresh token** 来获取新的 **access token**。

#### **优点**：
- 允许跨平台、跨应用的授权和认证，适用于与第三方服务集成的应用。
- **refresh token** 提供了自动续期机制，减少用户重新登录的次数。

#### **缺点**：
- **复杂度较高**：相比传统的 session 或 JWT，OAuth 2.0 的实现和管理更复杂。
- 安全性依赖于 token 的存储和管理。

</details>

## 13. cookie 可以实现在不同域名下共享吗？ {#question-eb7bd569-2124-4190-806e-d681d616a105}

> 难度：2 · 类型：QA

### 题目要点

- cookie **不能在不同主域之间共享**<br>
- 子域之间可以通过设置 `Domain` 属性共享<br>
- 跨主域可考虑 token + 中转登录 等方案实现身份同步

<details>
<summary>参考答案</summary>

**cookie 无法在不同主域之间直接共享**，浏览器的同源策略限制了跨域访问 cookie 的能力。

---

### 具体规则如下：

#### 1. **子域之间可以共享（设置 `Domain` 属性）**
```http
Set-Cookie: key=value; Domain=.example.com
```
此时 `a.example.com` 与 `b.example.com` 可共享该 cookie。

#### 2. **不同主域（如 a.com 与 b.com）无法共享**
浏览器会隔离 cookie，只能在当前主域及其子域下访问。不能通过设置 `Domain` 来突破这一限制。

---

### 替代方案（不同域 cookie 共享）：

1. **通过后端中转**
   - 使用统一的认证服务器或中间页进行跳转登录，实现服务端的 cookie 写入。

2. **使用前端跨域通信（如 postMessage）**
   - 在两个页面之间通过 iframe + `postMessage` 交换身份信息，但无法直接共享 cookie，只能传 token。

3. **使用统一的顶级域名 + 子域部署系统**
   - 例如统一为 `app.example.com`，再挂多个子路径（推荐方式）

</details>

## 14. 浏览器有同源策略，但是为什么我们可以将静态资源放到 CDN 上，使用不同的域名访问，这不会有跨域限制吗？ {#question-b18e3951-44d8-4347-b429-805ede23b706}

> 难度：3 · 类型：QA

### 题目要点

- **同源策略** 主要是针对 JavaScript 中的跨域请求限制，而 **静态资源**（如图片、CSS、JS 文件）不受此限制。
- 通过 **CORS** 头，CDN 可以允许跨域请求加载资源。
- **静态资源** 访问的跨域限制比 **API 请求** 要宽松，因此在不同的域名上访问 CDN 中的资源是可行的。

<details>
<summary>参考答案</summary>

浏览器的 **同源策略** 主要是为了防止恶意网站进行 **跨站请求伪造（CSRF）** 或 **跨站脚本攻击（XSS）**。

它的核心是限制不同源之间的相互访问，但 **静态资源（如图片、CSS、JS 文件）** 可以通过 **跨域资源共享（CORS）** 等机制来实现跨域访问。

### 为什么静态资源可以放到 CDN 上，并且不会遇到跨域限制？

1. **静态资源与同源策略**：
   - 同源策略限制的是 **脚本**（如 JavaScript）之间的跨域请求，而 **静态资源**（如图片、字体、CSS、JavaScript 文件）并不会触发同源策略。浏览器允许从不同域名加载静态资源。

2. **CORS（跨域资源共享）**：
   - 对于 API 请求（如 `fetch` 或 `XMLHttpRequest`），浏览器会进行跨域检查。然而，对于静态资源，如果服务器配置了 `Access-Control-Allow-Origin` 响应头，浏览器会允许不同域名的请求。
   - 静态资源的跨域通常不涉及数据读取和修改，所以浏览器对于 **GET 请求** 的跨域资源会宽松处理。

3. **CDN 使用的典型模式**：
   - CDN（内容分发网络）是专门为了提供加速而存在的，通常会允许多个来源的资源访问。CDN 服务器通过设置适当的 CORS 头，确保资源能够被不同的域访问。
   - 例如，CDN 服务商会允许所有源通过 `Access-Control-Allow-Origin: *` 来访问资源。

4. **浏览器的缓存与性能优化**：
   - 静态资源如图片、CSS、JavaScript 等，通常通过缓存机制减少服务器负载。将这些资源放到 CDN 上，能够减少延迟并提高加载速度。浏览器通常会允许跨域访问这些资源以优化性能。

### 示例：CORS 头的使用

如果你希望某个域名的静态资源能够被其他域名访问，CDN 服务器需要在响应头中设置 CORS 相关的头信息，如：

```http
Access-Control-Allow-Origin: *
```

这个头告诉浏览器，允许任何域名访问该资源。

</details>

## 15. 如何禁止别人调试自己的前端代码？ {#question-6a451db6-ddbe-4f76-8519-8ce6d47af8b3}

> 难度：3 · 类型：QA

### 题目要点

**答题思路：**

1. 无限debugger：通过设置定时器不断执行debugger语句，阻止开发者工具的正常使用，但可以通过关闭断点或格式化代码来绕过。
2. 禁止断点对策：将debugger语句放在一行内，即使格式化代码也无法添加断点。
3. 忽略执行代码：将debugger封装在Function构造器中，使其在每次执行时生成临时js文件，从而绕过忽略列表。
4. 终极增强防调试：优化代码结构，增加检测窗口大小变化，一旦发现调试行为，替换页面内容，提高安全性。
5. 其他防调试技术：禁止右键菜单、禁止F12快捷键、检测开发者工具是否打开，通过这些手段进一步防止调试。

<details>
<summary>参考答案</summary>

## 1. 无限 debugger

前端页面防止调试的方法主要是通过不断 debugger 来疯狂输出断点，因为 debugger 在控制台被打开的时候就会执行。由于程序被 debugger 阻止，所以无法进行断点调试，所以网页的请求也是看不到的。

以下是使用无限debugger方式阻止代码调试的示例：

```
/**
* 基础禁止调试代码
*/
(() => {
    function ban() {
      setInterval(() => {
        debugger;
      }, 50);
    }
    try {
      ban();
    } catch (err) { }
})();
```

不过，如果仅仅是加上面那么简单的代码，对于一些技术人员而言作用不大。可以通过控制台中的 Deactivate breakpoints 按钮或者使用快捷键 Ctrl + F8 关闭无限 debugger。这种方式虽然能去掉碍眼的 debugger，但是无法通过左侧的行号添加 breakpoint。

## 2. 禁止断点的对策

如果将 setInterval 中的代码写在一行，就能禁止用户断点，即使添加 logpoint 为 false 也无用。当然即使有些人想到用左下角的格式化代码，将其变成多行也是没用的。

```
(() => {
  function ban() {
    setInterval(() => { debugger; }, 50);
  }
  try {
    ban();
  } catch (err) { }
})();
```

## 3. 忽略执行的代码

可以通过添加 `add script ignore list` 需要忽略执行代码行或文件，也可以达到禁止无限 debugger。

不过，我们可以通过将 debugger 改写成 `Function("debugger")();` 的形式来应对，Function 构造器生成的 debugger 会在每一次执行时开启一个临时 js 文件。当然使用的时候，为了更加的安全，最好使用加密后的脚本。

```js
// 加密前
(() => {
  function ban() {
    setInterval(() => {
      Function('debugger')();
    }, 50);
  }
  try {
    ban();
  } catch (err) { }
})();

// 加密后
eval(function(c,g,a,b,d,e){d=String;if(!"".replace(/^/,String)){for(;a--;)e[a]=b[a]||a;b=[function(f){return e[f]}];d=function(){return"\w+"};a=1}for(;a--;)b[a]&&(c=c.replace(new RegExp("\b"+d(a)+"\b","g"),b[a]));return c}('(()=>{1 0(){2(()=>{3("4")()},5)}6{0()}7(8){}})();',9,9,"block function setInterval Function debugger 50 try catch err".split(" "),0,{}));

```

## 4. 终极增强防调试

为了让自己写出来的代码更加的晦涩难懂，需要对上面的代码再优化一下：将 `Function('debugger').call()` 改成 `(function(){return false;})['constructor'](debugger)\['call'\]()`;

并且添加条件，当窗口外部宽高和内部宽高的差值大于一定的值 ，我把 body 里的内容换成指定内容，当然使用的时候，为了更加的安全，最好加密后再使用。

```
(() => {
  function block() {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      document.body.innerHTML = "检测到非法调试,请关闭后刷新重试!";
    }
    setInterval(() => {
      (function () {
        return false;
      }
      ['constructor']('debugger')
      ['call']());
    }, 50);
  }
  try {
    block();
  } catch (err) { }
})();
```

## 5. 其他防调试技术

除此之外，我们还可以通过【禁止右键菜单】、【禁止F12快捷键】、【检测开发者工具】等手段来禁止调试。

#### 禁止右键菜单

禁止右键菜单是目前比较常见的一种禁止调试的方法，因为浏览器默认右键菜单是可以调出开发者工具的。可以通过以下JS代码实现：

```js
document.oncontextmenu = function () {
    return false;
};
```

这样一来，当用户在富文本编辑器的区域内右键时，就不会弹出菜单，从而避免了用户调出开发者工具的情况。

#### 禁止F12快捷键

F12快捷键是打开开发者工具的常用快捷键，禁止这个快捷键也是一种禁止调试的方法。可以通过以下JS代码实现：

```js
document.onkeydown = function (e) {
    if (e.keyCode === 123) {
        return false;
    }
};
```

这样一来，当用户按下F12键时，就会被拦截，从而避免了用户打开开发者工具的情况。

#### 检测开发者工具

还有一种方法是通过检测开发者工具是否打开来实现禁止调试的目的，可以通过以下JS代码实现：

```js
setInterval(function () {
    if (typeof console.clear !== 'undefined') {
        location.reload();
    }
}, 1000);
```

这段代码会每隔1秒检测一次当前页面是否打开了开发者工具，如果发现开发者工具已经打开，则会刷新当前页面，从而避免用户使用开发者工具对页面进行调试。

点击查看原文：[原文链接](https://mp.weixin.qq.com/s?__biz=Mzk0NTI2NDgxNQ==&mid=2247489707&idx=1&sn=e1c00785af7bb6983ae03229247398a6&chksm=c319596bf46ed07de2de6b9dc540a8c24e6f2d5bfdf39cac9b5f77db3d3e9356f7bac6cc8a1c&token=1211258579&lang=zh_CN#rd)

</details>

## 16. CSP（Content Security Policy）可以解决什么问题? {#question-330533b2-c523-486a-b2f5-8b10cb6e6173}

> 难度：2 · 类型：QA

### 题目要点

**答题思路**

CSP（Content Security Policy，内容安全策略）主要解决以下安全问题：

1. **减少跨站脚本攻击（XSS）的风险**：
   通过限制哪些外部脚本可以在网页上执行，CSP 可以显著降低跨站脚本攻击（XSS）的风险。如果攻击者试图注入恶意脚本，浏览器会基于CSP策略拒绝执行这些脚本。

2. **防止数据注入和数据泄漏**：
   CSP允许网站管理员定义哪些外部资源（如字体、图片、脚本等）可以加载到页面上，从而限制潜在的数据泄漏路径。这有助于保护用户数据不被恶意脚本窃取。

3. **提高Web应用程序的安全性**：
   作为一种额外的安全层，CSP能够检测并削弱某些特定类型的攻击，使Web应用程序处于一个更安全的运行环境中。

4. **增强内容安全**：
   通过白名单制度，CSP明确告诉浏览器哪些外部资源是可信的，这有助于防止不受信任的资源被加载和执行，进而减少恶意内容的注入。

5. **减少恶意软件传播**：
   通过限制可加载和执行的内容来源，CSP有助于减少恶意软件通过Web应用程序传播的机会。

6. **提供可配置的安全策略**：
    网站管理员可以根据实际需要配置CSP策略，以平衡安全性和用户体验。例如，可以允许来自特定域名的资源加载，同时禁止其他来源的资源。
。

<details>
<summary>参考答案</summary>

CSP（Content Security Policy）是为了解决 Web 应用程序中的安全问题而创建的一种规范。

CSP 通过限制 Web 应用程序能够加载和执行的内容，来减少恶意攻击的成功率。具体来说，CSP 允许 Web 应用程序管理员定义哪些来源可以加载资源和运行 JavaScript 等代码。这些源可以是域名、协议或端口号等。

当浏览器尝试加载一个 Web 页面时，它会检查页面是否包含 CSP 头，并根据该头信息确定允许加载哪些资源。如果某个资源的来源不在允许列表内，则浏览器将停止加载该资源并向用户发出警告。这样就可以防止注入恶意代码并帮助保护用户隐私和身份。

CSP 的工作流程如下：

- 客户端请求 Web 页面。
- 服务器返回 Web 页面及相关资源，并设置 CSP 头。
- 浏览器解析 Web 页面，并根据 CSP 头信息确定允许加载哪些资源。
- 如果某个资源的来源不在允许列表内，则浏览器将停止加载该资源并向用户发出警告。

需要注意的是，在实际应用中，Web 开发人员需要谨慎设置 CSP 规则，以确保不会限制正常的 Web 应用程序功能。此外，开发人员也需要定期审核 CSP 规则，以确保其仍然适用于最新的 Web 应用程序版本。

总之，CSP 的原理是通过限制 Web 应用程序能够加载和执行的内容，来减少恶意攻击的成功率。它可以帮助保护用户隐私和身份，并提高 Web 应用程序的安全性。

</details>

## 17. webSocket 有哪些安全问题，应该如何应对？ {#question-6100dbed-3600-470f-90b1-b1c6ef213a52}

> 难度：4 · 类型：QA

### 题目要点

**答题思路：**

#### WebSocket可能遇到的安全问题

1. **跨站脚本攻击（XSS）**：
    攻击者可能通过WebSocket连接向用户发送恶意脚本，如果服务器没有适当过滤和验证用户输入，这些脚本可能会被浏览器执行。

2. **跨站请求伪造（CSRF）**：
   WebSocket连接可能被用于执行未经授权的操作，尤其是当身份验证和授权机制存在缺陷时。

3. **中间人攻击（MitM）**：
   攻击者可能截获和篡改WebSocket连接，窃取用户敏感信息或操纵通信内容。

4. **拒绝服务（DoS）攻击**：
   恶意用户可能通过大量的并发WebSocket连接或发送大量的消息来耗尽服务器资源。

5. **未加密的通信**：
   如果WebSocket连接未通过TLS/SSL加密，则传输的数据可能被截获和读取。

6. **身份验证和授权问题**：
   WebSocket协议本身不处理授权或身份验证，需要应用程序层来确保只有经过授权的用户才能建立连接。

#### 应对策略

1. **使用TLS/SSL加密**：
   使用wss://协议代替ws://协议，确保WebSocket通信过程中的数据加密，防止中间人攻击。

2. **输入验证和过滤**：
    对从用户输入中获取的数据进行严格的验证和过滤，确保输入数据的安全性，防止XSS攻击。

3. **身份验证和授权**：
   在WebSocket连接建立时，进行适当的身份验证和授权，确保只有经过授权的用户可以建立连接和发送消息。

4. **CSRF防御**：
    使用CSRF令牌等机制来验证WebSocket请求的来源，确保请求来自合法用户。

5. **资源限制**：
    实施适当的资源限制和控制，例如限制每个用户的并发连接数或消息发送频率，以防止资源耗尽攻击。

<details>
<summary>参考答案</summary>

### 1. WebSocket特性介绍

WebSocket是HTML5开始提供的一种浏览器与服务器间进行全双工通讯的网络技术。WebSocket通信协议于2011年被IETF定为标准RFC 6455，WebSocket API也被W3C定为标准，主流的浏览器都已经支持WebSocket通信。

WebSocket协议是基于TCP协议上的独立的通信协议，在建立WebSocket通信连接前，需要使用HTTP协议进行握手，从HTTP连接升级为WebSocket连接。浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

WebSocket定义了两种URI格式, “ws://“和“wss://”，类似于HTTP和HTTPS, “ws://“使用明文传输，默认端口为80，”wss://“使用TLS加密传输，默认端口为443。

```ini
ws-URI : "ws://host[:port]path[?query]" wss-URI : "wss://host[:port]path[?query]"复制代码
```

WebSocket 握手阶段，需要用到一些HTTP头，升级HTTP连接为WebSocket连接如下表所示。

| HTTP头                    | 是否必须   | 解释                        |
| ------------------------ | ------ | ------------------------- |
| Host                     | 是      | 服务端主机名                    |
| Upgrade                  | 是      | 固定值，”websocket”           |
| Connection               | 是      | 固定值，”Upgrade”             |
| Sec-WebSocket-Key        | 是      | 客户端临时生成的16字节随机值, base64编码 |
| Sec-WebSocket-Version    | 是      | WebSocket协议版本             |
| Origin                   | 否      | 可选, 发起连接请求的源              |
| Sec-WebSocket-Accept     | 是(服务端) | 服务端识别连接生成的随机值             |
| Sec-WebSocket-Protocol   | 否      | 可选，客户端支持的协议               |
| Sec-WebSocket-Extensions | 否      | 可选， 扩展字段                  |

一次完整的握手连接如下图:

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/11/5/166e31708ccb6601~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)

一旦服务器端返回 101 响应，即可完成 WebSocket 协议切换。服务器端可以基于相同端口，将通信协议从 http://或 https:// 切换到 ws://或 wss://。协议切换完成后，浏览器和服务器端可以使用 WebSocket API 互相发送和收取文本和二进制消息。

### 2. WebSocket应用安全问题

WebSocket作为一种通信协议引入到Web应用中，并不会解决Web应用中存在的安全问题，因此WebSocket应用的安全实现是由开发者或服务端负责。这就要求开发者了解WebSocket应用潜在的安全风险，以及如何做到安全开发规避这些安全问题。

#### 2.1 认证

WebSocket 协议没有规定服务器在握手阶段应该如何认证客户端身份。服务器可以采用任何 HTTP 服务器的客户端身份认证机制，如 cookie认证，HTTP 基础认证，TLS 身份认证等。在WebSocket应用认证实现上面临的安全问题和传统的Web应用认证是相同的，如：[CVE-2015-0201](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-0201), Spring框架的Java SockJS客户端生成可预测的会话ID，攻击者可利用该漏洞向其他会话发送消息; [CVE-2015-1482](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2015-1482), Ansible Tower未对用户身份进行认证，远程攻击者通过websocket连接获取敏感信息。

#### 2.2 授权

同认证一样，WebSocket协议没有指定任何授权方式，应用程序中用户资源访问等的授权策略由服务端或开发者实现。WebSocket应用也会存在和传统Web应用相同的安全风险，如：垂直权限提升和水平权限提升。

#### 2.3 跨域请求

WebSocket使用基于源的安全模型，在发起WebSocket握手请求时，浏览器会在请求中添加一个名为Origin的HTTP头，Oringin字段表示发起请求的源，以此来防止未经授权的跨站点访问请求。WebSocket 的客户端不仅仅局限于浏览器，因此 WebSocket 规范没有强制规定握手阶段的 Origin 头是必需的，并且WebSocket不受浏览器同源策略的限制。如果服务端没有针对Origin头部进行验证可能会导致跨站点WebSocket劫持攻击。该漏洞最早在 2013 年被Christian Schneider 发现并公开，Christian 将之命名为跨站点 WebSocket 劫持 (Cross Site WebSocket Hijacking)(CSWSH)。跨站点 WebSocket 劫持危害大，但容易被开发人员忽视。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/11/5/166e31708cdaca2e~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)

上图展示了跨站WebSocket劫持的过程，某个用户已经登录了WebSocket应用程序，如果他被诱骗访问了某个恶意网页，而恶意网页中植入了一段js代码，自动发起 WebSocket 握手请求跟目标应用建立 WebSocket 连接。注意到，Origin 和 Sec-WebSocket-Key 都是由浏览器自动生成的，浏览器再次发起请求访问目标服务器会自动带上Cookie 等身份认证参数。如果服务器端没有检查 Origin头，则该请求会成功握手切换到 WebSocket 协议，恶意网页就可以成功绕过身份认证连接到 WebSocket 服务器，进而窃取到服务器端发来的信息，或者发送伪造信息到服务器端篡改服务器端数据。与传统跨站请求伪造(CSRF)攻击相比，CSRF 主要是通过恶意网页悄悄发起数据修改请求，而跨站 WebSocket 伪造攻击不仅可以修改服务器数据，还可以控制整个双向通信通道。也正是因为这个原因，Christian 将这个漏洞命名为劫持(Hijacking)，而不是请求伪造(Request Forgery)。

理解了跨站WebSocket劫持攻击的原理和过程，那么如何防范这种攻击呢？处理也比较简单，在服务器端的代码中增加 对Origin头的检查，如果客户端发来的 Origin 信息来自不同域，服务器端可以拒绝该请求。但是仅仅检查 Origin 仍然是不够安全的，恶意网页可以伪造Origin头信息，绕过服务端对Origin头的检查，更完善的解决方案可以借鉴CSRF的解决方案-令牌机制。

#### 2.4 拒绝服务

WebSocket设计为面向连接的协议，可被利用引起客户端和服务器端拒绝服务攻击。

**(1). 客户端拒绝服务**

WebSocket连接限制不同于HTTP连接限制，和HTTP相比，WebSocket有一个更高的连接限制，不同的浏览器有自己特定的最大连接数,如：火狐浏览器默认最大连接数为200。通过发送恶意内容，用尽允许的所有Websocket连接耗尽浏览器资源，引起拒绝服务。

**(2). 服务器端拒绝服务**

WebSocket建立的是持久连接，只有客户端或服务端其中一发提出关闭连接的请求，WebSocket连接才关闭，因此攻击者可以向服务器发起大量的申请建立WebSocket连接的请求，建立持久连接，耗尽服务器资源，引发拒绝服务。针对这种攻，可以通过设置单IP可建立连接的最大连接数的方式防范。攻击者还可以通过发送一个单一的庞大的数据帧(如, 2^16)，或者发送一个长流的分片消息的小帧，来耗尽服务器的内存，引发拒绝服务攻击, 针对这种攻击，通过限制帧大小和多个帧重组后的总消息大小的方式防范。

#### 2.5 中间人攻击

WebSocket使用HTTP或HTTPS协议进行握手请求，在使用HTTP协议的情况下，若存在中间人可以嗅探HTTP流量，那么中间人可以获取并篡改WebSocket握手请求，通过伪造客户端信息与服务器建立WebSocket连接，如下图所示。防范这种攻击，需要在加密信道上建立WebSocket连接，使用HTTPS协议发起握手请求。

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/11/5/166e31708ced092b~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image)

#### 2.6 输入校验

WebSocket应用和传统Web应用一样，都需要对输入进行校验，来防范来客户端的XSS攻击，服务端的SQL注入，代码注入等攻击。

### 3. 总结

Websocket是一个基于TCP的HTML5的新协议，可以实现浏览器和服务器之间的全双工通讯。在即时通讯等应用中，WebSocket具有很大的性能优势, 并且非常适合全双工通信，但是，和任何其他技术一样，开发WebSocket应用也需要考虑潜在的安全风险。

</details>

## 18. 说说你对前端鉴权的理解 {#question-ac0148e2-09c1-4634-acf6-a027eeee37bb}

> 难度：3 · 类型：QA

### 题目要点

**答题思路：**

鉴权，即身份认证，验证用户是否有系统访问权限。常见的认证方式包括：

1. **Session-Cookie认证**：通过服务端Session和客户端Cookie实现，简单易用但依赖浏览器，安全性需通过设置Cookie属性提高。
2. **Token认证**：使用Token（如JWT）进行用户信息验证，无需服务端存储Session，适用于移动端和负载均衡环境，但Token一旦派发，在有效期内始终有效。
3. **单点登录（SSO）**：允许用户在一个系统登录后访问多个相关系统，实现“一次登录，全线通用”。
4. **其他认证方式**：
   - **2FA（双因素认证）**：需要两种认证方式，如密码加上动态令牌。
   - **Google验证器**：采用TOTP算法，生成随时间变化的一次性密码，用于双因子认证。
这些认证方式旨在提高系统安全性，防止未授权访问。

<details>
<summary>参考答案</summary>

## 什么是鉴权

鉴权也叫身份认证，指验证用户是否有系统的访问权限。就很像我们经常乘坐动车的票据（对应的标识，一定的时间范围）。

## 认证方式

接下来介绍几种我们工作中通常用到的认证方式。

### Session-Cookie 认证

利用服务端的 Session（会话）和浏览器（客户端）的 Cookie 来实现的前后端通信认证模式。

#### 来源

由于 HTTP 请求时是无状态的，服务端正常情况下无法得知请求发送者的身份。这个时候如果我们要记录状态，就需要在服务端创建会话，将相同客户端的请求都维护在各自的会话记录中，每当请求到达服务端时，先校验请求中的用户标识是否存在于 Session 中，如果有则表示已经认证成功，否则表示认证失败。

#### 流程

![](https://static.ecool.fun//article/35b6368a-dbf9-45f6-b1ef-769968a635f6.png)

#### 实践

boss（我们的一个产品） 这边 Session ID 存在数据库里面，在 Memcached 里面做缓存。客户端每次调用接口的时候会通过 response headers 里面的 Set-Cookie 更新过期时间（boss 这边设置的是 6 个小时），这样做的作用是防止你在做一些复杂操作的时候，cookie 突然过期。

⚠️**整个过程是比较重的，因为每次的接口调用都得更新过期时间。**

#### 优缺点

##### 优点：

* 简单易用，浏览器会自动带上

##### 缺点：

* 脱离浏览器没法用，比如原生应用

### 关于 Cookie 的安全问题

Cookie 属性：

![](https://static.ecool.fun//article/540326e7-1c16-42af-adf5-42c791bf89a5.png)

提高安全性的办法

* Expires/Max-Age 设置合理过期时间
* HttpOnly 设置为 true
* Secure 设置为 true（使用 https）

### Token 认证

#### 来源

负载均衡多服务器的情况，不好确认当前用户是否登录，因为多服务器不共享 Session。这个问题也可以将 Session 存在一个服务器中来解决，但是就不能完全达到负载均衡的效果。<br>
Token 和 Session-Cookie 认证方式中的 Session ID 不同，并非只是一个标识符。Token 一般会包含用户的相关信息，通过验证 Token 不仅可以完成身份校验，还可以获取预设的信息。<br>
客户端可以将 token 存放于 localStroage 等容器中。客户端每次访问都传递 token，服务端解密 token，服务端就不需要存储 Session 占用存储空间，就很好的解决负载均衡多服务器的问题了。

#### 流程

![](https://static.ecool.fun//article/979372f4-69c5-431d-8f15-d74c6e30115b.png)

#### 实践

平常用的最多的就是 JSON Web Token（JWT），也是目前最流行的跨域身份验证解决方案。<br>

JWT 组成：**头部. 载荷. 签名**<br>

头部和载荷用 **base64 编码**<br>

签名计算：

```
    HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload) , secret)
```

使用方法：

```
    Authorization: Bearer <token>
```

但是 JWT 有个大缺点是服务器不保存会话状态，所以在使用期间不可能取消令牌或更改令牌的权限。也就是说，一旦 JWT 签发，在有效期内将会一直有效。

⚠️**载荷的内容任何人都可以读到，不要放入敏感信息**

jwt 存储位置的争论：我觉得如果存储信息多，天然防止 csrf 的话，放到 **localStorage** 或者 **sessionStoraged** 都行。<br>

除了 JWT 可以提升 token 的安全性，**Refresh token** 也可以。<br>

业务接口用来鉴权的 token，我们称之为 access token。越是权限敏感的业务，我们越希望 access token 有效期足够短，以避免被盗用。但是过短的有效期会造成 access token 经常过期，过期后怎么办呢？<br>

一种办法是，让用户重新登录获取新 token，显然不够友好，要知道有的 access token 过期时间可能只有几分钟。<br>

另外一种办法是，再来一个 token，一个专门生成 access token 的 token，我们称为 refresh token。<br>

refresh token 的过期时间一般比较长，比如 6 个小时，access token 的过期时间比较短，比如 10 分钟。我们在实际业务中，api 调用时只传递 access token 进行鉴权。如果 access token 过期，则使用 refresh token 去授权服务器更新 access token。最终 refresh token 也过期了，这时候用户就得重新登陆了。

#### 优缺点

##### 优点：

* 轻量，服务端不用存储，移动端可用

##### 缺点：

* 一旦派发出去，失效之前都是有效的（虽然可以解决，但是就类似于 Session 机制了）

### 单点登录

#### 来源

但当我们业务线越来越多，就会有更多业务系统分散到不同域名下，就需要「一次登录，全线通用」的能力，叫做「单点登录」。

#### 流程

![](https://static.ecool.fun//article/277cd37f-f76b-445d-a252-ec2b2da47213.png)

对浏览器来说，SSO 域下返回的数据要怎么存，才能在访问 A 的时候带上？这就需要也只能由 A 提供 A 域下存储凭证的能力。

![](https://static.ecool.fun//article/2df38aa3-f502-4072-aaa2-effdcb9f84d5.png)

#### 实践

OIDC

1. OIDC 登陆点击，重定向到登录的 OpenID 网站
2. 输入用户名密码，如果验证成功。则会重定向到登陆回调（之前设置好的地址）
3. 回调地址里面有个 code 参数，code 验证正确后，下发 sk，boss 系统登陆成功
4. 前端通过添加 iframe 的方式轮询 authing 链接实现单点登出

### 关于 OIDC

OIDC 是一个 OAuth2 上层的简单身份层协议。它允许客户端验证用户的身份并获取基本的用户配置信息。OIDC 使用 JSON Web Token（JWT）作为信息返回，通过符合 OAuth2 的流程来获取。

### 关于 OAuth2

OAuth2 最终目的是为第三方应用颁发一个有时效性的令牌 token。使得第三方应用能够通过该令牌获取相关的资源。当你想要登录某个论坛，但没有账号，而这个论坛接入了如 QQ、Facebook 等登录功能，在你使用 QQ 登录的过程中就使用的 OAuth 2.0 协议。

![](https://static.ecool.fun//article/5381d9c7-4ff5-46c6-8997-c9d1b22d3cae.png)

* Client 请求 Resource Owner 的授权。授权请求可以直接向 Resource Owner 请求，也可以通过 Authorization Server 间接的进行。
* Client 获得授权许可。
* Client 向 Authorization Server 请求访问令牌。
* Authorization Server 验证授权许可，如果有效则颁发访问令牌。
* Client 通过访问令牌从 Resource Server 请求受保护资源。
* Resource Server 验证访问令牌，有效则响应请求。

### 关于 LDAP

LDAP (Light Directory Access Portocol)，中文名轻量目录访问协议，是一个开放、广泛被使用的工业标准。比如我们的 Jira、Confluence、Yapi。<br>

但是 LDAP 并不能做到单点登录 SSO，只是可以用同样的用户名和密码可以登陆不同的系统，但达不到一次登陆之后可以访问多个系统。

### Others 认证方式

#### 2FA（双因素认证）

线上的 boss 必须开启二次认证，会生成一个二维码，那个二维码就是一个 SecretKey，通过 CryptoJS.HmacSHA1（默认算法），每次会计算出一个 6 位（默认长度）随机数。计算公式为

![](https://static.ecool.fun//article/25a3c914-4696-4d90-9d58-dcda2543f8e9.png)

⚠️因为默认是 30s 内有效，所以用户手机时间要比较准确

## Google 验证器

谷歌身份验证器最早是谷歌为了减少 Gmail 邮箱遭受恶意攻击而推出的两步验证方式，后来被很多网站支持。使用谷歌身份验证器，可以避免比如不久前发生的 Coinbase 短信二次验证导致的安全事故。开启谷歌身份验证之后，登录账户，除了输入用户名和密码，还需要输入谷歌验证器上的动态密码。

谷歌验证器上的动态密码，也称为一次性密码，密码按照时间或使用次数不断动态变化（默认 30 秒变更一次）。它和很多银行发行的动态口令卡类似，可以断网使用，只不过前者是谷歌推出的一个 App，后者是专门的一个硬件。

在手机端生成动态口令后，在Google相关的服务登陆中除了用正常用户名和密码外，需要输入一次动态口令才能验证成功，此举是为了保护用户的信息安全。

与传统单因子密码不同，其采用的是更安全的双因子（2FA two-factor authentication）认证。

FA是指结合密码以及实物（信用卡、SMS手机、令牌或指纹等生物标志）两种条件对用户进行认证的方法。只需要在手机上安装如此高大上的密码生成应用程序，就可以生成一个随着时间变化的一次性密码，用于帐户验证，而且这个应用程序不需要连接网络即可工作。

实际上 `Google Authenticator` 采用的算法是TOTP（`Time-Based One-Time Password`基于时间的一次性密码），其核心内容包括以下三点：

* 一个共享密钥（一个比特序列）；
* 当前时间输入；
* 一个签署函数。

</details>

## 19. 前端怎么实现跨域请求？ {#question-56e56a05-99c7-4701-ae72-e06d2c6a4d42}

> 难度：3 · 类型：QA

### 题目要点

**答题思路：**

跨域是指浏览器出于安全考虑，限制不同源之间的资源请求。同源策略限制存储内容、DOM节点和AJAX请求。但某些HTML标签如`<img>`、`<link>`、`&lt;script&gt;`可跨域加载资源。跨域并非请求发不出，而是响应被浏览器拦截。
跨域解决方案包括：

1. **CORS**：服务器设置`Access-Control-Allow-Origin`等头部，允许跨域请求。分为简单请求和非简单请求，后者需发送预检请求。
2. **Nginx代理**：配置代理服务器转发请求，修改请求头实现跨域。
3. **Node中间件代理**：在开发环境中使用中间件代理跨域请求。
4. **WebSocket**：HTML5协议，不实行同源策略，服务器支持即可跨域通信。
5. **postMessage**：HTML5 API，用于窗口间跨域数据传递。
6. **JSONP**：通过`&lt;script&gt;`标签跨域获取数据，只支持GET请求，存在安全隐患。

跨域时处理Cookie：

- 在Cookie设置`SameSite`属性，控制跨域请求是否发送Cookie。
- Chrome 80后默认`SameSite`为`lax`，之前为`none`。
- `SameSite=None`必须与`Secure`属性一起使用，表示Cookie只能通过HTTPS发送。

<details>
<summary>参考答案</summary>

## 什么是跨域？

### 1.什么是同源策略及其限制内容？

同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。所谓同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

同源策略限制内容有：

* Cookie、LocalStorage、IndexedDB 等存储性内容
* DOM 节点
* AJAX 请求发送后，结果被浏览器拦截了

但是有三个标签是允许跨域加载资源：

* `<img src=XXX>`
* `<link href=XXX>`
* `&lt;script src=XXX&gt;`

### 2.常见跨域场景

当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域。不同域之间相互请求资源，就算作“跨域”。

特别说明两点：

* 第一：如果是协议和端口造成的跨域问题“前台”是无能为力的。
* 第二：在跨域问题上，仅仅是通过“URL的首部”来识别而不会根据域名对应的IP地址是否相同来判断。“URL的首部”可以理解为“协议, 域名和端口必须匹配”。

跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。你可能会疑问明明通过表单的方式可以发起跨域请求，为什么 Ajax 就不会?因为归根结底，跨域是为了阻止用户读取到另一个域名下的内容，Ajax 可以获取响应，浏览器认为这不安全，所以拦截了响应。但是表单并不会获取新的内容，所以可以发起跨域请求。同时也说明了跨域并不能完全阻止 CSRF，因为请求毕竟是发出去了。

## 跨域有哪些方案？

这里只介绍几种开发中用的比较多的，几乎用不到的比如：

- document.domain + iframe：适用主域名相同，子域名不同的跨域场景
- window.name + iframe：利用name值最长可以 2M ，并用不同页面或不同域名加载后依然存在的特性
- location.hash + iframe：适用通过 C 页面来实现 A 页面与 B 页面通信的场景

就不过多展开了

### 1. **CORS**

CORS 通信过程都是浏览器自动完成，需要浏览器(都支持)和服务器都支持，所以关键在**只要服务器支持，就可以跨域通信**，CORS请求分两类，`简单请求`和`非简单请求`

另外CORS请求**默认不包含Cookie以及HTTP认证信息**，如果需要包含Cookie，需要满足几个条件：
- 服务器指定了 `Access-Control-Allow-Credentials: true`
- 开发者须在请求中打开withCredentials属性: `xhr.withCredentials = true`
- `Access-Control-Allow-Origin不要设为星号`，指定明确的与请求网页一致的域名，这样就不会把其他域名的Cookie上传

#### 简单请求

需要同时满足两个条件，就属于简单请求：

- 请求方法是：`HEAD`、`GET`、`POST`，三者之一
- 请求头信息不超过以下几个字段：
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-Id
    - Content-Type：值为三者之一application/x-www/form/urlencoded、multipart/form-data、text/plain

需要这些条件是为了兼容表单，因为历史上表单一直可以跨域

浏览器直接发出CORS请求，具体来说就是在头信息中增加Origin字段，表示请求来源来自哪个域(协议+域名+端口)，服务器根据这个值决定是否同意请求。如果同意，返回的响应会多出以下响应头信息

```js
Access-Control-Allow-Origin: http://juejin.com // 和 Orign 一致  这个字段是必须的
Access-Control-Allow-Credentials: true // 表示是否允许发送 Cookie  这个字段是可选的
Access-Control-Expose-Headers: FooBar // 指定返回其他字段的值   这个字段是可选的
Content-Type: text/html; charset=utf-8 // 表示文档类型
```

在简单请求中服务器至少需要设置：`Access-Control-Allow-Origin` 字段

#### 非简单请求

比如 PUT 或 DELETE 请求，或 Content-Type 为 application/json ，就是非简单请求。

非简单 CORS 请求，**正式请求前会发一次 OPTIONS 类型的查询请求**，称为`预检请求`，询问服务器是否支持网页所在域名的请求，以及可以使用哪些头信息字段。只有收到肯定的答复，才会发起正式XMLHttpRequest请求，否则报错

预检请求的方法是OPTIONS，它的头信息中有几个字段

- Origin: 表示请求来自哪个域，这个字段是必须的
- Access-Control-Request-Method：列出CORS请求会用到哪些HTTP方法，这个字段是必须的
- Access-Control-Request-Headers： 指定CORS请求会额外发送的头信息字段，用逗号隔开

OPTIONS请求次数过多也会损耗性能，所以要尽量减少OPTIONS请求，可以让服务器在请求返回头部添加
```js
Access-Control-Max-Age: Number // 数字 单位是秒
```
表示预检请求的返回结果可以被缓存多久，在这个时间范围内再请求就不需要预检了。不过这个缓存只对完全一样的URL才会生效

### 2. Nginx代理跨域

配置一个代理服务器向服务器请求，再将数据返回给客户端，实质和CORS跨域原理一样，需要配置请求响应头Access-Control-Allow-Origin等字段

```js
server {
    listen 81; server_name www.domain1.com;
    location / {
        proxy_pass http://xxxx1:8080; // 反向代理
        proxy_cookie_domain www.xxxx1.com www.xxxx2.com; // 修改cookie里域名
        index index.html index.htm;
        // 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.xxxx2.com; // 当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```

### 3. Node中间件代理跨域

在 Vue 中 vue.config.js 中配置
```js
module.export = {
    ...
    devServer: {
        proxy: {
            [ process.env.VUE_APP_BASE_API ]: {
                target: \'http://xxxx\',//代理跨域目标接口
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    [ \'^\' + process.env.VUE_APP_BASE_API ] : \'\'
                }
            }
        }
    }
}
```
Node + express
```js
const express = require(\'express\')
const proxy = require(\'http-proxy-middleware\')
const app = express()
app.use(\'/\', proxy({
    // 代理跨域目标接口
    target: \'http://xxxx:8080\',
    changeOrigin: true,
    // 修改响应头信息，实现跨域并允许带cookie
    onProxyRes: function(proxyRes, req, res) {
        res.header(\'Access-Control-Allow-Origin\', \'http://xxxx\')
        res.header(\'Access-Control-Allow-Credentials\', \'true\')
    },
    // 修改响应信息中的cookie域名
    cookieDomainRewrite: \'www.domain1.com\' // 可以为false，表示不修改
}));
app.listen(3000);
```

### 4. WebSocket

WebSocket是HTML5标准中的一种通信协议，以`ws://`(非加密)和`wss://`(加密)作为协议前缀，该协议不实行同源政策，只要服务器支持就行

因为WebSocket请求头信息中有Origin字段，表示请求源来自哪个域，服务器可以根据这个字段判断是否允许本次通信，如果在白名单内，就可以通信

### 5. postMessage

postMessage是HTML5标准中的API，它可以给我们解决如下问题：

- 页面和新打开的窗口间数据传递
- 多窗口之间数据传递
- 页面与嵌套的 iframe 之间数据传递
- 上面三个场景之间的`跨域传递`

postMessage 接受两个参数，用法如下：
- **参数一**：发送的数据
- **参数二**：你要发送给谁就写谁的地址`(协议 + 域名 +端口`)，也可以设置为`*`，表示任意窗口，为`/`表示与当前窗口同源的窗口

### 6. JSONP

原理就是通过添加一个&lt;script&gt;标签，向服务器请求JSON数据，这样不受同源政策限制。服务器收到请求后，将数据放在一个callback回调函数中传回来。比如axios。

不过`只支持GET请求`且`不安全`，**可能遇到XSS攻击，不过它的好处是可以向老浏览器或不支持CORS的网站请求数据**

```js
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://juejin.com/xxx?callback=handleCallback'
    document.body.appendChild(script)

    function handleCallback(res){
        console.log(res)
    }
```
服务器返回并立即执行
```js
handleCallback({ code: 200, msg: 'success', data: [] })
```

## 跨域时 Cookie 要做何处理？

指的就是对第三方使用 Cookie 的设置，在 Cookie 信息中添加 `SameSite` 属性

```js
Set-Cookie: widget_session=123456; SameSite=None; Secure
```

SameSite 有三个值：
- `strict`：严格模式，完全禁止使用Cookie
- `lax`：宽松模式，允许部分情况使用Cookie，`跨域的都行`，a标签跳转，link标签，GET提交的表单
- `none`：任何情况下都会发送Cookie，但必须同时设置Secure属性，意思是需要安全上下文，Cookie `只能通过https发送`，否则无效

Chrome 80之前默认值是none，之后是lax

不过在最新的 `Chrome91` 版本中这个`已经被移除`了，所以在 91之前的版本依然可以使用

如果 Chrome 或 Edge 版本大于91小于94的话，可以通过[Chromium支持的command-line flag](https://peter.sh/experiments/chromium-command-line-switches/)

- 右键 Chrome 或 Edge 浏览器，选择属性
- 在目标(Target)属性末尾加上

```js
 --disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure
```

并且官方说的到 94 版本会连 comman-line 也会移除

官方的说法是任由开发者控制这两个选项，容易被攻击

</details>

## 20. 什么是点击劫持？如何防范点击劫持？ {#question-4bc2059f-c8c1-46f9-a768-0e43f8a06665}

> 难度：1 · 类型：QA

### 题目要点

点击劫持是一种视觉欺骗的攻击手段，攻击者将需要攻击的网站通过 iframe 嵌套的方式嵌入自己的网页中，并将 iframe 设置为透明，在页面中透出一个按钮诱导用户点击。

<details>
<summary>参考答案</summary>

点击劫持是一种视觉欺骗的攻击手段，攻击者将需要攻击的网站通过 iframe 嵌套的方式嵌入自己的网页中，并将 iframe 设置为透明，在页面中透出一个按钮诱导用户点击。

我们可以在 http 相应头中设置 X-FRAME-OPTIONS 来防御用 iframe 嵌套的点击劫持攻击。通过不同的值，可以规定页面在特
定的一些情况才能作为 iframe 来使用。

</details>

## 21. 什么是 Samesite Cookie 属性？ {#question-aef19252-da7d-447d-a9c5-3eb0d191901d}

> 难度：3 · 类型：QA

### 题目要点

**答题要点：**

SameSite是Set-Cookie头的属性，用于控制Cookie的跨站发送行为。其值有：

- `strict`：严格模式，禁止Cookie作为第三方Cookie。
- `lax`：宽松模式，默认值，允许GET请求在改变页面或打开新页面的情况下作为第三方Cookie，但不支持子域，可能导致需要重新登录。
- `None`：允许Cookie在所有上下文中发送，包括跨域，但需与Secure属性一起使用以确保安全性。

<details>
<summary>参考答案</summary>

SameSite 是HTTP响应头 `Set-Cookie` 的属性之一。它允许声明该 `Cookie` 是否仅限于第一方或者同一站点上下文。

* 将 Samesite 设为 `strict` ，这种称为严格模式，表示这个 cookie 在任何情况下都不可能作为第三方 cookie。

* 将 Samesite 设为 `Lax` ，这种模式称为宽松模式，也是目前浏览器中的默认值。如果这个请求是个 GET 请求，并且这个请求改变了当前页面或者打开了新的页面，那么这个 cookie 可以作为第三方 cookie，其余情况下都不能作为第三方 cookie。使用这种方法的缺点是，因为它不支持子域，所以子域没有办法与主域共享登录信息，每次转入子域的网站，都需要重新登录。还有一个问题就是它的兼容性不够好。

* 将 Samesite 设为 `None`，Cookie将在所有上下文中发送，即允许跨域发送。

响应头设置方式：
```
Set-Cookie: flavor=choco; SameSite=None; Secure
```

</details>

## 22. Cookie 的 SameSite 属性有什么作用？ {#question-d86b13c6-54f1-423a-80c5-e52c24f71e30}

> 难度：2 · 类型：QA

### 题目要点

**答题要点：**

Chrome 51 开始支持新的 Cookie 属性 SameSite，用于防止 CSRF 攻击和用户追踪。SameSite 属性有三个值：Strict、Lax 和 None。

- **Strict**：最严格的设置，完全禁止第三方 Cookie，只有当前网页的 URL 与请求目标一致时才会发送 Cookie。
- **Lax**：允许 GET 请求跨站发送 Cookie，包括链接、预加载请求和 GET 表单。
- **None**：允许任何类型的请求跨站发送 Cookie，但必须同时设置 Secure 属性。
SameSite 属性可以减少 CSRF 攻击的风险，但也可能影响用户体验，例如，点击外部链接时可能需要重新登录。

<details>
<summary>参考答案</summary>

Chrome 51 开始，浏览器的 Cookie 新增加了一个SameSite属性，用来防止 CSRF 攻击和用户追踪。

## 相关概念：

* 第一方cookie：第一方 cookie 指的是由网络用户访问的域创建的 cookie。
* 第三方cookie：第三方 cookie 是建立在别的域名不是你访问的域名（地址栏中的网址），比如：广告网络商就是最常见的第三方 cookies 的来源，他们用它们在多个网站上追踪用户的行为，当然这些活动可以用来调整广告。此外图像、 JavaScript 和 iframe 通常也会导致第三方 cookies 的生成。

## CSRF 攻击是什么？

Cookie 往往用来存储用户的身份信息，恶意网站可以设法伪造带有正确 Cookie 的 HTTP 请求，这就是 CSRF 攻击。

举例来说，用户登陆了银行网站your-bank.com，银行服务器发来了一个 Cookie。

```
Set-Cookie:id=a3fWa;
```

用户后来又访问了恶意网站`malicious.com`，上面有一个表单。

```html
<form action="your-bank.com/transfer" method="POST">
  ...
</form>
```

用户一旦被诱骗发送这个表单，银行网站就会收到带有正确 Cookie 的请求。为了防止这种攻击，表单一般都带有一个随机 token，告诉服务器这是真实请求。

```html
<form action="your-bank.com/transfer" method="POST">
  <input type="hidden" name="token" value="dad3weg34">
  ...
</form>
```

这种第三方网站引导发出的 Cookie，就称为第三方 Cookie。它除了用于 CSRF 攻击，还可以用于用户追踪。

比如，Facebook 在第三方网站插入一张看不见的图片。

```
<img src="facebook.com" style="visibility:hidden;">
```

浏览器加载上面代码时，就会向 Facebook 发出带有 Cookie 的请求，从而 Facebook 就会知道你是谁，访问了什么网站。

## SameSite 属性

Cookie 的SameSite属性用来限制第三方 Cookie，从而减少安全风险。

它可以设置三个值:

* Strict
* Lax
* None

### Strict

Strict最为严格，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。

```
Set-Cookie: CookieName=CookieValue; SameSite=Strict;
```

这个规则过于严格，可能造成非常不好的用户体验。比如，当前网页有一个 GitHub 链接，用户点击跳转就不会带有 GitHub 的 Cookie，跳转过去总是未登陆状态。

### Lax

Lax规则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。

```
Set-Cookie: CookieName=CookieValue; SameSite=Lax;
```

导航到目标网址的 GET 请求，只包括三种情况：链接，预加载请求，GET 表单。详见下表。

|请求类型|示例|正常情况|Lax|
|--|--|--|--|
|链接|	<a href="..."></a>|	发送 Cookie|	发送 Cookie|
|预加载|	<link rel="prerender" href="..."/>|	发送 Cookie|	发送 Cookie|
|GET| 表单	&lt;form method="GET" action="..."&gt;|发送 Cookie|	发送 Cookie|
|POST| 表单	&lt;form method="POST" action="..."&gt;	|发送 Cookie|	不发送|
|iframe|	&lt;iframe src="..."&gt;&lt;/iframe&gt;|	发送 Cookie	|不发送|
|AJAX|	$.get("...")	|发送 Cookie|	不发送|
|Image|	<img src="...">	|发送 Cookie|	不发送|

设置了Strict或Lax以后，基本就杜绝了 CSRF 攻击。当然，前提是用户浏览器支持 SameSite 属性。

### None

网站可以选择显式关闭SameSite属性，将其设为None，这样无论是否跨站都会发送 Cookie。不过，前提是必须同时设置Secure属性（Cookie 只能通过 HTTPS 协议发送），否则无效。

下面的设置无效。

```
Set-Cookie: widget_session=abc123; SameSite=None
```

下面的设置有效。

```
Set-Cookie: widget_session=abc123; SameSite=None; Secure
```

</details>

## 23. cookie中的 HttpOnly 属性有什么用途？ {#question-d370ad63-b673-4887-899d-6446148bcfe7}

> 难度：1 · 类型：QA

### 题目要点

**答题要点：**

在Web开发中，Cookie用于存储客户端与服务器之间的会话信息。然而，Cookies可以被客户端脚本（如JavaScript）读取和修改，这可能导致安全风险，尤其是对于那些包含敏感信息的Cookies。

为了提高安全性，开发者可以设置Cookie的`HttpOnly`属性。当一个Cookie设置了`HttpOnly`属性时，它就只能通过HTTP协议头进行设置和访问，而不能通过JavaScript脚本访问。这意味着即使攻击者能够访问用户的Cookies，也无法通过JavaScript脚本来读取或修改这些Cookies，从而提高了网站的安全性。

简单来说，`HttpOnly`属性用于防止跨站脚本攻击（XSS）中的Cookie劫持，因为即使攻击者能够注入恶意脚本，也无法访问这些标记为`HttpOnly`的Cookies。
举例来说，如果一个Cookie包含了用户的会话ID，没有设置`HttpOnly`属性，那么攻击者可以利用XSS攻击读取并修改这个Cookie，从而获取用户的会话信息。但如果这个Cookie设置了`HttpOnly`属性，攻击者就无法通过JavaScript脚本访问它，从而减少了安全风险。
因此，建议对于包含敏感信息的Cookies，都应设置`HttpOnly`属性，以增强网站的安全性。

<details>
<summary>参考答案</summary>

MDN 上对HttpOnly属性的解释：

> JavaScript Document.cookie API 无法访问带有 HttpOnly 属性的cookie；此类 Cookie 仅作用于服务器。例如，持久化服务器端会话的 Cookie 不需要对 JavaScript 可用，而应具有 HttpOnly 属性。此预防措施有助于缓解跨站点脚本（XSS） (en-US)攻击。

也就是说，对于设置了 HttpOnly 属性为 true 的cookie，无法通过 js 进行访问或其他操作，只是在发送对应域下的请求时，浏览器会自动带上。这样可以有效缓解 XSS 攻击。

</details>

## 24. 点击劫持 {#question-d627f91c-d910-447b-88b5-4f424799aa84}

> 难度：3 · 类型：QA

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p>点击劫持（Clickjacking）是一种攻击手段，通过覆盖在网页上的透明按钮或链接诱使用户点击，从而执行恶意操作。防御方法包括设置X-FRAME-OPTIONS HTTP响应头，其值有：DENY（禁止页面在frame中展示）、SAMEORIGIN（允许在相同域名页面的frame中展示）和ALLOW-FROM url（允许在指定来源的frame中展示）。</p><p></p>

<details>
<summary>参考答案</summary>

<p></p><ul><li>Clickjacking： 点击劫持，是指利用透明的按钮或连接做成陷阱，覆盖在 Web 页面之上。然后诱使用户在不知情的情况下，点击那个连接访问内容的一种攻击手段。这种行为又称为界面伪装(UI Redressing) 。</li><li>大概有两种方式：</li></ul><p>攻击者使用一个透明 iframe，覆盖在一个网页上，然后诱使用户在该页面上进行操作，此时用户将在不知情的情况下点击透明的 iframe 页面；<br/>攻击者使用一张图片覆盖在网页，遮挡网页原有的位置含义。<br/></p><hr/><p><br/><strong>一般步骤</strong><br/></p><ul><li>黑客创建一个网页利用 iframe 包含目标网站；</li><li>隐藏目标网站，使用户无法无法察觉到目标网站存在；</li><li>构造网页，诱变用户点击特点按钮</li><li>用户在不知情的情况下点击按钮，触发执行恶意网页的命令。</li></ul><p><strong>防御</strong><br/><strong><span style="color:#f32784">X-FRAME-OPTIONS</span></strong>；<br/>X-FRAME-OPTIONS HTTP 响应头是用来给浏览器指示允许一个页面可否在&lt;frame&gt;, <br/><br/>&lt;iframe&gt; 或者 &lt;object&gt; 中展现的标记。<br/><br/>网站可以使用此功能，来确保自己网站内容没有被嵌到别人的网站中去，也从而避免点击劫持的攻击。<br/><strong>有三个值：</strong><br/></p><ul><li>DENY：表示页面不允许在 frame 中展示，即便是在相同域名的页面中嵌套也不允许。</li><li>SAMEORIGIN：表示该页面可以在相同域名页面的 frame 中展示。</li><li>ALLOW-FROM url：表示该页面可以在指定来源的 frame 中展示。</li></ul><p></p><p></p><p><br/></p>

</details>

## 25. CSRF攻击及防护 {#question-a1c9963f-fb40-4d8a-aa47-e5cca8c885b7}

> 难度：3 · 类型：QA

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p></p><p style="text-align:left;text-indent:2em;">CSRF（Cross-Site Request Forgery，跨站请求伪造）攻击是一种网络攻击方式，攻击者盗用用户的登录凭证，诱使用户在不知情的情况下执行非本意的操作。这种攻击利用了网站对用户登录状态的信任，用户一旦登录某个网站，攻击者就可以在用户不知情的情况下，使用用户的登录凭证向该网站发送恶意请求，导致用户账户受到损害。</p><h3 style="text-align:left;text-indent:2em;">CSRF攻击原理</h3><ol><li><strong>用户登录网站A</strong>：用户通过认证登录了网站A，网站A在用户的浏览器中设置了一个Cookie。</li><li><strong>用户访问网站B</strong>：用户在浏览器的地址栏输入网站B的网址，或者点击了网站B的链接。</li><li><strong>网站B执行请求</strong>：网站B执行了一个会改变用户账户状态的请求，比如转账、修改密码等。由于用户的浏览器中还保留着网站A的Cookie，这个请求会携带网站A的Cookie。</li><li><strong>网站A响应请求</strong>：网站A接收到请求后，认为请求来自已经登录的用户，因此没有进行额外的验证，直接响应了请求。</li><li><strong>用户账户受损</strong>：用户在不知情的情况下，账户状态被改变，遭受了损失。</li></ol><h3 style="text-align:left;text-indent:2em;">CSRF攻击防护</h3><ol><li><strong>验证Referer字段</strong>：服务器端可以检查Referer字段，确保请求来自可信的来源。但这种方法存在局限性，因为Referer可以被伪造。</li><li><strong>验证Token</strong>：在请求中加入一个Token，服务器端在处理请求时验证Token的有效性。Token可以是随机的，每次请求都会生成一个不同的Token。这种方法相对安全，但需要客户端和服务器端都进行相应的修改。</li><li><strong>设置Cookie的HttpOnly属性</strong>：Cookie的HttpOnly属性可以防止Cookie被JavaScript读取，从而减少CSRF攻击的风险。</li><li><strong>使用CORS（跨源资源共享）</strong>：服务器端设置CORS策略，限制哪些域名可以访问特定的资源。这种方法可以防止第三方网站直接访问受保护的资源，从而减少CSRF攻击的风险。</li><li><strong>设置SameSite属性</strong>：Cookie的SameSite属性可以限制Cookie在跨站请求中的发送，从而减少CSRF攻击的风险。</li></ol>

<details>
<summary>参考答案</summary>

<ul><li>跨站点请求伪造（Cross-Site Request Forgeries），冒充用户发起请求（在用户不知情的情况下）， 完成一些违背用户意愿的事情（如修改用户信息，删初评论等）。</li></ul><p></p><ul><li><strong>1、可能造成危害：</strong><br/></li><ol><li>利用已通过认证的用户权限更新设定信息等；</li><li>利用已通过认证的用户权限购买商品；</li><li>利用已通过的用户权限在留言板上发表言论。</li></ol></ul><p></p><ul><li><strong>2、防御：</strong><br/></li><ol><li>验证码；强制用户必须与应用进行交互，才能完成最终请求。</li><li>尽量使用 post ，限制 get 使用；get 太容易被拿来做 csrf 攻击；</li><li>请求来源限制，此种方法成本最低，但是并不能保证 100% 有效，因为服务器并不是什么时候都能取到 Referer，而且低版本的浏览器存在伪造 Referer 的风险。</li><li>token 验证 CSRF 防御机制是公认最合适的方案。</li></ol></ul><p></p><ul><li><strong>使用token的原理：</strong><br/></li><ol><li>第一步：后端随机产生一个 token，把这个token 保存到 session 状态中；同时后端把这个token 交给前端页面；</li><li>第二步：前端页面提交请求时，把 token 加入到请求数据或者头信息中，一起传给后端；</li><li>后端验证前端传来的 token 与 session 是否一致，一致则合法，否则是非法请求。</li></ol></ul><p></p>

</details>

## 26. 前端的常规安全策略 {#question-f1de93ec-d1c8-48b0-98a9-bf256dfe2df0}

> 难度：2 · 类型：QA

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p><strong>1、防止跨站脚本攻击（XSS）</strong>：</p><ul><ul><li>使用<code>HttpOnly</code>属性保护Cookies，防止Cookies被JavaScript访问。</li><li>对输入数据进行验证和清洗，避免恶意代码注入。</li><li>使用<code>Content Security Policy</code>（CSP）来限制可以加载和执行的资源。</li></ul></ul><p><strong>2、防止跨站请求伪造（CSRF）</strong>：</p><ul><ul><li>在请求中添加CSRF令牌，确保每个请求都包含验证信息。</li><li>验证请求的来源，确保请求来自可信的域。</li></ul></ul><p><strong>3、数据验证和清洗</strong>：</p><ul><ul><li>对用户输入进行验证，防止SQL注入、命令注入等攻击。</li><li>清洗输入数据，去除可能包含恶意代码的字符。</li></ul></ul><p></p><p><strong>4、安全编码实践</strong>：</p><ul><ul><li>使用安全的编程实践，避免常见的编程错误和安全漏洞。</li><li>避免使用已知的漏洞代码库和框架。</li></ul></ul><p><strong>5、HTTPS的使用</strong>：</p><ul><ul><li>使用HTTPS协议加密数据传输，保护数据不被中间人攻击。</li><li>对敏感数据使用TLS/SSL加密</li></ul></ul><p></p><p></p><p></p>

<details>
<summary>参考答案</summary>

<p></p><ul><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">定期请第三方机构做安全性测试，漏洞扫描</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">使用第三方开源库做上线前的安全测试，可以考虑融合到CI中</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">code review 保证代码质量</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">默认项目中设置对应的 Header 请求头，如 X-XSS-Protection、 X-Content-Type-Options 、X-Frame-Options Header、Content-Security-Policy 等等</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">对第三方包和库做检测：NSP(Node Security Platform)，Snyk</span></span></span></span></li></ul><p></p>

</details>

## 27. 前端数据安全 {#question-475b72b6-3c41-4509-afe3-abaaff8fc651}

> 难度：2.5 · 类型：QA

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p style="text-align:left;text-indent:2em;">前端数据安全是指在网页和应用程序中保护数据免受未经授权的访问、使用、披露、修改或破坏的措施。随着互联网的发展和用户对隐私保护意识的提高，前端数据安全变得越来越重要。以下是一些前端数据安全的关键措施：</p><p></p><p><strong>1、HTTPS加密</strong>：<br/></p><ul><ul><li>使用HTTPS协议进行数据传输，确保数据在传输过程中不被窃取或篡改。</li></ul></ul><p><strong>2、Cookie安全</strong>：<br/></p><ul><ul><li>设置HttpOnly属性，防止Cookies被JavaScript读取，从而减少XSS攻击的风险。</li><li>设置Secure属性，确保Cookies仅通过HTTPS传输。</li><li>限制Cookies的域和路径，避免跨域Cookie的共享。</li></ul></ul><p><strong>3、表单验证</strong>：<br/></p><ul><ul><li>在客户端和服务器端对用户输入进行验证，防止SQL注入、XSS等攻击。</li><li>对敏感数据进行加密，如密码、信用卡信息等。</li></ul></ul><p><strong>4、内容安全策略（CSP）</strong>：<br/></p><ul><ul><li>使用CSP来限制可以加载和执行的资源，减少XSS攻击的风险。</li></ul></ul><p><strong>5、避免直接使用HTTP</strong>：<br/></p><ul><ul><li>避免使用HTTP传输敏感数据，始终使用HTTPS。</li></ul></ul><p></p>

<details>
<summary>参考答案</summary>

<p><span style="font-size:14ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx"><strong>描述</strong></span></span></span></span></p><p><br/><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx"><span style="font-size:10.5ptpx">反爬虫。如猫眼电影、天眼查等等，以数据内容为核心资产的企业</span></span></span></span></p><p><br/><span style="font-size:14ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx"><strong>预防方案：</strong></span></span></span></span><br/></p><ul><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">i）font-face拼接方式：猫眼电影、天眼查</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">ii）background 拼接：美团</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">iii）伪元素隐藏：汽车之家</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">iv）元素定位覆盖式：去哪儿</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">v）iframe 异步加载：网易云音乐</span></span></span></span></li></ul><p><br/></p>

</details>

## 28. sql 注入 {#question-f4198437-3b03-4a26-83ae-7b820a23b85d}

> 难度：2 · 类型：QA

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p style="text-align:left;text-indent:2em;">前端安全中的SQL注入是一种常见的攻击方式，它发生在用户输入的数据被直接拼接到SQL查询语句中，而没有经过适当的验证或转义的情况下。这种攻击可以导致数据库中的敏感数据被读取、修改或删除，甚至可能导致整个数据库被破坏。</p><p></p><p><strong>预防SQL注入的策略：</strong></p><h4><strong>1、参数化查询</strong>：使用参数化查询（Prepared Statements）来防止SQL注入。参数化查询将用户输入的数据作为参数传递给查询，而不是直接拼接到查询字符串中。</h4><p><strong>2、输入验证</strong>：在服务器端对用户输入的数据进行验证，确保其符合预期的格式和范围；验证数据类型、长度、格式等，避免接受可能被恶意利用的数据。</p><p><strong>3、使用白名单</strong>：只允许特定的字符集或字符序列，拒绝任何不在白名单中的输入。</p><p><strong>4、转义特殊字符</strong>：如果必须将用户输入直接拼接到查询中，使用适当的转义字符（如<code>mysql_real_escape_string</code>或<code>PDO::quote</code>）来转义特殊字符。</p><p><strong>5、限制权限</strong>：确保数据库用户的权限最小化，只允许执行必要操作。</p><p></p>

<details>
<summary>参考答案</summary>

<p><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">就是通过把SQL命令插入到Web表单递交或输入域名或页面请求的查询字符串，最终达到欺骗数据库服务器执行恶意的SQL命令,从而达到和服务器</span></span></span></span><br/><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">进行直接的交互</span></span></span></span></p><p><br/><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx"><span style="font-size:14ptpx"><strong>预防方案</strong></span></span></span></span><br/></p><ul><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">i）后台进行输入验证，对敏感字符过滤。</span></span></span></span></li><li><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">ii）使用参数化查询，能避免拼接SQL，就不要拼接SQL语句。</span></span></span></span></li></ul><p><br/></p>

</details>

## 29. 中间人攻击是什么？ {#question-825e3009-688d-43d4-ba62-0c4940d90ce9}

> 难度：2.5 · 类型：QA

### 题目要点

中间人攻击通过拦截和篡改两方之间的通信来获取敏感信息或伪造数据。有效的保护措施包括使用强加密协议、验证证书、避免不安全的网络、启用 HSTS、使用 VPN 以及保持系统更新。

<details>
<summary>参考答案</summary>

中间人攻击（Man-in-the-Middle Attack, MITM）是一种网络攻击形式，其中攻击者拦截并可能篡改两个通信方之间传输的数据，而通信双方可能认为他们直接在彼此之间进行安全的通信。以下是一些关于中间人攻击的详细信息：

### **1. 攻击过程**

- **拦截**：攻击者通过各种手段（如伪造网络接入点、ARP 欺骗）在受害者与目标服务器之间插入自己，拦截通信流量。
- **解密和篡改**：攻击者可以解密受害者和服务器之间的加密流量，读取和篡改数据，然后重新加密并转发这些数据，确保受害者和服务器都不知道数据已被修改。
- **伪造信息**：攻击者还可以伪造信息，向其中一方发送虚假的数据或命令，可能造成欺诈、数据泄露或其他安全问题。

### **2. 常见类型**

- **HTTPS 中间人攻击**：攻击者伪造或篡改 HTTPS 连接，以在加密通道内拦截敏感数据。
- **Wi-Fi 中间人攻击**：在不安全的 Wi-Fi 网络中，攻击者可以通过创建虚假的 Wi-Fi 热点拦截用户的数据流。
- **ARP 欺骗**：在局域网中，攻击者伪造 ARP 响应，将自己的 MAC 地址伪装成目标服务器的地址，从而拦截网络流量。

### **3. 保护措施**

- **使用加密协议**：确保所有通信使用强加密协议（如 HTTPS、TLS）进行保护。加密协议可以防止攻击者读取或篡改数据。
- **验证证书**：在使用 HTTPS 时，检查和验证 SSL/TLS 证书，确保与合法的服务器建立连接。
- **避免不安全的网络**：尽量避免连接到不安全或未知的 Wi-Fi 网络，以减少被中间人攻击的风险。
- **启用 HSTS**：HTTP 严格传输安全（HSTS）可以强制浏览器使用 HTTPS 加密连接，防止降级攻击。
- **使用虚拟专用网络（VPN）**：在不安全的网络环境下，使用 VPN 可以加密所有的网络流量，从而保护数据的安全性。
- **定期更新**：保持操作系统、浏览器和所有相关软件的最新版本，以修复已知的安全漏洞。

</details>

## 30. 网络劫持 {#question-1176d873-74da-4e0d-87b9-034c1287488a}

> 难度：2.5 · 类型：QA

<p></p>

### 题目要点

<p><br/><span style="font-size:15px"><span style="line-height:27">微详细</span></span><br/><strong>答题要点：</strong></p><p></p><p>网络劫持（Network Hijacking）是一种网络安全攻击，攻击者通过在数据传输过程中插入自己，从而控制通信流。这种攻击方式通常会导致通信数据的篡改、窃听或阻断，从而影响通信的完整性和安全性。<br/>网络劫持的类型：<br/>1、<strong>中间人攻击（Man-in-the-Middle, MitM）</strong>：</p><ul><ul><li>攻击者在客户端和服务器之间插入自己，拦截并篡改通信数据。</li><li>攻击者可能伪装成客户端或服务器，使通信双方认为是在与对方直接通信。</li></ul></ul><p><strong>2、DNS劫持</strong>：</p><ul><ul><li>攻击者控制或篡改DNS服务器，将用户的域名解析请求指向攻击者控制的恶意网站。</li><li>用户在浏览器中输入域名时，会被重定向到攻击者的恶意网站。</li></ul></ul><p><strong>3、路由劫持</strong>：</p><ul><ul><li>攻击者控制网络中的路由器或交换机，将通信流量重定向到攻击者的服务器。</li><li>攻击者可以监控或篡改通信数据，或者阻断通信。</li></ul></ul><p></p><p>预防网络劫持的措施：</p><p><br/>1、<strong>使用HTTPS</strong>：确保所有的通信都使用HTTPS协议，以加密数据传输，防止数据被截获和篡改。</p><p><strong>2、验证证书</strong>：在客户端和服务器端验证证书的有效性，确保通信双方的身份是可信的。</p><p><strong>3、使用数字签名</strong>：对数据进行数字签名，确保数据的完整性和不可否认性。</p><p><strong>4、使用安全的框架和库</strong>：使用经过安全审计的框架和库，它们通常提供了内置的预防网络劫持的功能。</p><p></p><p></p>

<details>
<summary>参考答案</summary>

<ul><li><span style="color:#24292e"><span style="background-color:#ffffff">DNS劫持（涉嫌违法）：修改运行商的 DNS 记录，重定向到其他网站。DNS 劫持是违法的行为，目前 DNS 劫持已被监管，现在很少见 DNS 劫持</span></span></li><li><span style="color:#24292e"><span style="background-color:#ffffff">HTTP劫持：前提有 HTTP 请求。因 HTTP 是明文传输，运营商便可借机修改 HTTP 响应内容（如加广告）。</span></span></li></ul><p><strong><span style="color:#24292e"><span style="background-color:#ffffff">预防方案</span></span></strong></p><p></p><p> <span style="color:#24292e"><span style="background-color:#ffffff">全站 HTTPS</span></span></p>

</details>

## 31. 静态资源完整性校验 {#question-5f0460dc-84ca-425e-8629-7aec874d024c}

> 难度：2.5 · 类型：QA

### 题目要点

<p style="text-align:start;" size="0" _root="undefined" __ownerID="undefined" __hash="undefined" __altered="false"></p><p style="text-align:start;text-indent:2em;"><strong>静态资源完整性校验</strong>是指通过对比资源的预期哈希值与实际下载资源的哈希值，来验证资源是否在传输过程中被篡改的一种机制。其目的在于防止CDN（内容分发网络）被劫持、中间人攻击等安全威胁，确保用户加载的是合法、未被篡改的静态资源。</p><p style="text-align:start;text-indent:2em;"></p><h4 style="text-align:start;text-indent:2em;">1. Subresource Integrity (SRI)</h4><p style="text-align:start;text-indent:2em;">SRI（子资源完整性）是一种安全特性，允许Web开发者为HTML中的外链资源（如JavaScript、CSS文件）指定一个或多个加密哈希值。浏览器在下载这些资源时，会计算资源的哈希值，并与开发者指定的哈希值进行比较。如果两者匹配，则资源被认为是完整的，可以安全使用；如果不匹配，则浏览器会拒绝加载该资源，从而防止潜在的安全风险。</p><h4 style="text-align:start;text-indent:2em;">2. 实现步骤</h4><ul><li><strong>计算哈希值</strong>：开发者需要使用安全的哈希算法（如SHA-256）为静态资源计算哈希值。</li><li><strong>在HTML中指定SRI</strong>：在HTML标签中，通过<code>integrity</code>属性添加计算得到的哈希值。例如，对于JavaScript文件，可以这样写：<code>&lt;script src=&quot;https://example.com/script.js&quot; integrity=&quot;sha256-xxx...&quot; crossorigin=&quot;anonymous&quot;&gt;&lt;/script&gt;</code>。</li><li><strong>浏览器验证</strong>：浏览器在加载资源时，会自动计算资源的哈希值，并与<code>integrity</code>属性中指定的哈希值进行比较。</li></ul><h3 style="text-align:start;text-indent:2em;"></h3>

<details>
<summary>参考答案</summary>

<p><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">使用 内容分发网络 (CDNs) 在多个站点之间共享脚本和样式表等文件可以提高站点性能并节省带宽。然而，使用CDN也存在风险，如果攻击者获得对 CDN 的控制权，则可以将任意恶意内容注入到 CDN 上的文件中 （或完全替换掉文件），因此可能潜在地攻击所有从该 CDN 获取文件的站点。</span></span></span></span></p><p><br/><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx"><span style="font-size:14ptpx"><strong>预防方案</strong></span></span></span></span></p><p><br/><span style="font-size:10.5ptpx"><span style="color:#24292e"><span style="background-color:#ffffff"><span style="letter-spacing:0ptpx">将使用 base64 编码过后的文件哈希值写入你所引用的 &lt;script&gt; 或 标签的 integrity 属性值中即可启用子资源完整性能。</span></span></span></span><br/><br/></p>

</details>

## 32. HTTPS 有哪些优点？ {#question-748b2bec-7e35-4d5b-81e1-c6fb29f00464}

> 难度：2.5 · 类型：QA

<p></p>

### 题目要点

HTTPS（Hypertext Transfer Protocol Secure）是一种安全的通信协议，它通过加密和身份验证来保护网站数据传输的安全。HTTPS基于HTTP协议，通过添加SSL/TLS（安全套接层/传输层安全协议）层来增强安全性。
以下是HTTPS相较于HTTP的主要优点：

1. **数据安全性**：HTTPS使用SSL/TLS加密技术，确保数据在传输过程中不被第三方窃取或监听。
2. **身份认证**：HTTPS使用数字证书来验证服务器的身份，确保用户连接的是真实的服务器而不是伪造的恶意网站。。
3. **完整性保护**：HTTPS使用数字签名来验证数据的完整性，确保用户接收到的数据是完整且未被修改的。
4. **SEO优化**：搜索引擎（如Google）将HTTPS作为搜索排名的一个重要因素。
5. **用户隐私保护**：HTTPS协议可以隐藏用户在网站上的具体访问内容，防止第三方窃听者获取用户的浏览历史和个人信息。
6. **防止恶意攻击**：HTTPS通过加密和身份验证机制，可以有效防止中间人攻击，确保数据在传输过程中的安全性和完整性。

<details>
<summary>参考答案</summary>

HTTPS并非绝对安全，掌握根证书的机构、掌握加密算法的组织同样可以进行中间人形式的攻击，但HTTPS仍是现行架构下最安全的解决方案，主要有以下几个好处：

* 使用 HTTPS 协议可认证用户和服务器，确保数据发送到正确的客户机和服务器。
* HTTPS 协议是由SSL+HTTP 协议构建的可进行加密传输、身份认证的网络协议，要比 HTTP 协议安全，可防止数据在传输过程中不被窃取、修改，确保数据的完整性。
* HTTPS 是现行架构下最安全的解决方案，虽然不是绝对安全，相比于http，https可以提供更加优质保密的信息，保证了用户数据的安全性，此外https同时也一定程度上保护了服务端，使用恶意攻击和伪装数据的成本大大提高。
* 谷歌曾在2014年8月份调整搜索引擎算法，并称“比起同等HTTP网站，采用HTTPS加密的网站在搜索结果中的排名将会更高”。

</details>

## 33. iframe 安全 {#question-eb1c1598-ed1b-484e-8cae-e97a8f49c509}

> 难度：2.5 · 类型：QA

<p></p>

### 题目要点

<p></p><p></p><p style="text-align:left;text-indent:2em;">iframe在Web开发中用于嵌入外部内容，但也存在安全风险。关键的安全点包括：</p><ol><li><strong>XSS攻击</strong>：通过验证嵌入内容来源和使用CSP来减少风险。</li><li><strong>点击劫持</strong>：设置X-Frame-Options和CSP来防止。</li><li><strong>CSRF攻击</strong>：使用CSRF令牌和验证Referer头部来增加攻击难度。</li><li><strong>跨域问题</strong>：使用postMessage和限制iframe权限来解决。</li><li><strong>性能和安全性的平衡</strong>：考虑加载时间和使用HTTPS。</li><li><strong>响应式设计和浏览器兼容性</strong>：确保在不同设备和浏览器下表现良好。</li></ol><p style="text-align:left;text-indent:2em;">通过合理配置和防护措施，可以有效降低iframe带来的安全风险。</p>

<details>
<summary>参考答案</summary>

<p style="text-align:start;text-indent:2em;">iframe在Web开发中常被用于嵌入外部页面或内容，但其使用也伴随着一定的安全风险。以下是关于iframe安全性的几个关键点：</p><h3 style="text-align:start;text-indent:2em;">1. 跨站脚本攻击（XSS）</h3><ul><li><strong>风险</strong>：攻击者可能通过iframe注入恶意脚本，从而窃取用户信息、进行会话劫持或篡改页面内容。</li><li><strong>防护措施</strong>：</li><ul><li><strong>验证嵌入内容</strong>：确保嵌入的网页来自可信来源，避免从未知或不受信任的源加载内容。</li><li><strong>使用内容安全策略（CSP）</strong>：通过CSP可以减少XSS攻击的风险，因为它允许网站开发者指定哪些外部资源是允许加载的。</li></ul></ul><p></p><h3 style="text-align:start;text-indent:2em;">2. 点击劫持</h3><ul><li><strong>风险</strong>：攻击者可以在iframe中放置一个透明的覆盖层，诱使用户在不知情的情况下点击恶意链接或按钮。</li><li><strong>防护措施</strong>：</li><ul><li><strong>设置X-Frame-Options头部</strong>：在网站的响应头中添加X-Frame-Options标头，可以设置为DENY（禁止所有网站嵌入iframe）或SAMEORIGIN（只允许同源网站嵌入iframe），以防止点击劫持。</li><li><strong>使用CSP</strong>：通过CSP的frame-ancestors指令来指定哪些网站可以嵌入当前网站的内容。</li></ul></ul><p></p><h3 style="text-align:start;text-indent:2em;">3. 跨站请求伪造（CSRF）</h3><ul><li><strong>风险</strong>：虽然iframe本身不直接导致CSRF攻击，但攻击者可以利用iframe来伪造用户请求，特别是在与表单提交相关的场景中。</li><li><strong>防护措施</strong>：</li><ul><li><strong>使用CSRF令牌</strong>：在表单提交时加入CSRF令牌，确保请求是由用户本人发起的。</li><li><strong>验证Referer头部</strong>：虽然Referer头部可以被伪造，但在一定程度上可以增加攻击的难度。</li></ul></ul><p></p><h3 style="text-align:start;text-indent:2em;">4. 跨域问题</h3><ul><li><strong>风险</strong>：当iframe加载的内容来自不同的域名时，可能存在跨域通信的问题，攻击者可能利用这一点进行跨域攻击。</li><li><strong>防护措施</strong>：</li><ul><li><strong>使用postMessage进行跨域通信</strong>：这是一种安全的跨域通信方式，允许不同源的页面之间进行数据交换。</li><li><strong>限制iframe的权限</strong>：通过iframe的sandbox属性来限制iframe的权限，如禁止脚本执行、禁止表单提交等。</li></ul></ul><p></p><h3 style="text-align:start;text-indent:2em;">5. 性能和安全性的平衡</h3><ul><li><strong>考虑加载时间和资源消耗</strong>：避免在iframe中加载过多的大文件或复杂的内容，以减少页面加载时间和提高性能。</li><li><strong>使用HTTPS</strong>：如果可能的话，尽量使用HTTPS加密连接来加载iframe内容，以确保传输过程中的数据安全。</li></ul><h3 style="text-align:start;text-indent:2em;">6. 响应式设计和浏览器兼容性</h3><ul><li><strong>响应式设计</strong>：考虑iframe在不同屏幕尺寸和设备类型下的表现，确保用户体验。</li><li><strong>浏览器兼容性</strong>：进行兼容性测试，确保iframe在各种主流浏览器下都能正常工作。</li></ul><p style="text-align:start;text-indent:2em;">综上所述，iframe的安全性需要从多个方面进行考虑和防护。通过合理的配置和防护措施，可以有效降低iframe带来的安全风险。</p>

</details>

## 34. 说说你对 XSS 的了解 {#question-0958b45c-a5b9-4087-9431-e0ca02ff0597}

> 难度：2.5 · 类型：QA

### 题目要点

**答题要点：**
跨站脚本攻击（XSS）是一种通过在网页中嵌入恶意脚本来控制用户浏览器的行为。攻击者通过在网页中注入恶意脚本，当用户访问该网页时，恶意脚本将在用户的浏览器中执行，从而实现攻击者的目的。XSS攻击可以分为三类：反射型、存储型和基于DOM的XSS。

1. **反射型XSS**：
   反射型XSS是指攻击者通过诱使用户点击恶意链接，使得恶意脚本在用户的浏览器中执行。这种攻击通常是通过URL参数传递恶意脚本。

2. **存储型XSS**：
    存储型XSS是指攻击者将恶意脚本存储在服务器端，当其他用户访问包含恶意脚本的网页时，恶意脚本将在用户的浏览器中执行。

3. **基于DOM的XSS**：
   基于DOM的XSS是指攻击者通过操作DOM来执行恶意脚本。这种攻击通常发生在客户端，攻击者利用浏览器的前端技术来执行恶意脚本。

为了防御XSS攻击，可以采取以下措施：

1. **使用HttpOnly属性**：
   -设置Cookie的HttpOnly属性，防止Cookie被JavaScript读取，从而减少XSS攻击的风险。
2. **输入检查**：
   -对用户输入的内容进行验证和清洗，避免恶意代码注入。
3. **输出检查**：
   -在将用户输入的内容输出到HTML页面时，使用编码或转义的方式来防御XSS攻击。

<details>
<summary>参考答案</summary>

## 初探`XSS`

**跨站脚本攻击**，英文全称是 `Cross Site Script`，本来缩写是 `CSS`，但是为了和层叠样式表（`Cascading Style Sheet`，`CSS`）有所区别，所以在安全领域叫做“`XSS`”。

`XSS`攻击，通常指黑客通过`HTML`注入 篡改网页，插入恶意脚本，从而在用户浏览网页时，控制用户浏览器的一种攻击行为。在这种行为最初出现之时，所有的演示案例全是跨域行为，所以叫做 "跨站脚本" 。时至今日，随着`Web`端功能的复杂化，应用化，是否跨站已经不重要了，但 `XSS`这个名字却一直保留下来。

随着`Web`发展迅速发展，`Web`开发已经被应用的非常广泛了，由之前的单一`PC`端扩展到现在的移动端（`APP`、`H5`），甚至包括桌面工具、设备大屏等等，所以在产生的应用场景越来越多，越来越复杂的情况下，同时大多数互联网（尤其是传统行业）的产品开发版本迭代上线时间非常短，一周一版本，两周一大版本的情况下，忽略了安全这一重要属性，一旦遭到攻击，后果将不堪设想。

## `XSS`攻击类型分类

`XSS`攻击可以分为3类：反射型（非持久型）、存储型（持久型）、基于`DOM XSS`；

### 反射型

反射型`XSS`只是简单地把用户输入的数据“反射”给浏览器。也就是说，黑客往往需要诱使用户“点击”一个恶意链接，才能攻击成功。反射型`XSS`也叫做 **“非持久型 **`**XSS**`**”（**`**Non-persistent XSS**`**）**。

通常反射型`XSS`的恶意代码存在`URL`里，通过`URL`传递参数的功能，如网站搜索、跳转等。由于需要用户主动打开恶意的`URL`才能生效，攻击者往往会结合多种手段诱导用户点击。

一个最初级的反射型攻击是：我们对网页数据进行获取:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XSS攻防演练</title>
</head>
<body>
    <div id="t"></div>
    <input id="s" type="button" value="这是一个按钮" onclick="test()">
</body>
<script>
    function test() {
        const arr = [
            '自定义的数据1',
            '自定义的数据2',
            '自定义的数据3',
            '<img src="11" onerror="console.log(window.localStorage)" />'
        ];
        const t = document.querySelector('#t');
        arr.forEach(item => {
            const p = document.createElement('p');
            p.innerHTML = item;
            t.append(p);
        })
    }
</script>
</html>
```

当黑客点击`这是一个按钮`时，即可轻松获取本地`localStorage`数据，从而获取关键信息。

### 存储型

存储型 `XSS` 会把用户输入的数据“存储”在服务器端。这种 `XSS` 具有很强的稳定性。

比较常见的一个场景就是，黑客写下一篇包含有恶意 `JavaScript` 代码的博客文章，文章发表后，所有访问该博客文章的用户，都会在他们的浏览器中执行这段恶意的 `JavaScript` 代码。黑客把恶意的脚本保存到服务器端，所以这种 `XSS` 攻击就叫做 **“存储型 **`**XSS**`**”**。

```html
<!-- 例如我们分别在网站中的输入框中输入以下信息，并保存到远程数据库 -->
<img src="11" onerror="console.log(window.localStorage)" />
<img src="11" onerror="alert(111)" />
```

页面输入

![1.png](https://static.ecool.fun//article/cd44a823-6593-402e-b058-49e6579f00ef.jpeg)

---

![2.png](https://static.ecool.fun//article/6de5bf7b-c0c2-489b-9743-9c28c8a865d5.jpeg)

使用者浏览页面，分别先后触发了`alert`弹框和`localStorage`获取本地数据：

![3.png](https://static.ecool.fun//article/5c597fdc-e561-4265-830f-fba6a685a12a.jpeg)

---

![4.png](https://static.ecool.fun//article/d20eb0a6-056a-45c9-9bd6-8006a4b84673.jpeg)<br />以上就是一个典型的**存储型**攻击。

### 基于`DOM XSS`

实际上，这种类型的`XSS`并非按照“数据是否保存在服务器端”来划分，`DOM Based XSS`从效果上来说也是反射型`XSS`。单独划分出来，是因为`DOM Based XSS` 的形成原因比较特别，发现它的安全专家专门提出了这种类型的`XSS`。`DOM 型 XSS`跟前两种`XSS`的区别：`DOM 型 XSS`攻击中，取出和执行恶意代码由浏览器端完成，属于前端`JavaScript`自身的安全漏洞，而其他两种`XSS`都属于服务端的安全漏洞。

接下来我们来看一个简单的示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XSS攻防演练</title>
</head>
<body>
    <h3>基于DOM的XSS</h3>
    <input type="text" id="input">
    <button id="btn">提交内容</button>
    <div id="div"></div>
</body>
<script>
    const input = document.getElementById('input');
    const btn = document.getElementById('btn');
    const div = document.getElementById('div');

    let inputValue;

    input.addEventListener('change', (e) => {
        inputValue = e.target.value;
    }, false);

    btn.addEventListener('click', () => {
        div.innerHTML = `<a href=${inputValue}>链接地址</a>`
    }, false);
</script>
</html>
```

我们再页面输入框中输入以下文本`'' onclick=alert(/xss/)`，这里的`''`引号是为了关闭掉`href`属性，给它赋予了一个空值。然后点击`提交内容`按钮，则页面中的`<div id="div"></div>`标签包含了一下`html`内容

```html
<a href onlick="alert(/xss/)">链接地址</a>
```

---

![7.png](https://static.ecool.fun//article/2dfeb37e-ed63-49e0-afd8-07530521cb76.jpeg)

## `XSS`攻击防御

关于`XSS`的防御是非常复杂的，值得幸运的是现代浏览器、前端框架/库已经帮我们做了相当大的一部分工作。

### `HttpOnly`

`HttpOnly` 最早是由微软提出，并在`IE 6`中最先实现的，至今已经逐渐成为一个标准。浏览器将禁止页面的`JavaScript`访问带有`HttpOnly`属性的`Cookie`。所以我们需要在`http`的响应头`set-cookie`时设置`httpOnly`，让浏览器知道不能通过`document.cookie`的方式获取到`cookie`内容。

严格地说，`HttpOnly` 并非为了对抗 `XSS——HttpOnly` 解决的是`XSS`后的 `Cookie` 劫持攻击。所以说使用`HttpOnly`有助于缓解`XSS`攻击，但仍然需要其他能够解决`XSS`漏洞的方案；

### 输入检查

对于用户的输入内容我们需要持怀疑态度。在对输入不做任何过滤检查的情况下用户可能输入任何字符串。比如我们期望输入的内容是：`hello word`, 也许我们收到的内容是`onclick=alert(/xss/)`。

在`XSS`的防御上，输入检查一般是检查用户输入的数据中是否包含一些特殊字符，如`＜、＞、’、”`等。如果发现存在特殊字符，则将这些字符过滤或者编码。这种输入检查的方式，可以称为`“XSS Filter”`。互联网上有很多开源的`“XSS Filter”`的实现。比如一个简单的`htmlencode`转义：

```javascript
const htmlEncode = function (handleString){
    return handleString
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/ /g,"&nbsp;")
    .replace(/'/g,"&#39;")
    .replace(/"/g,"&quot;");
}
```

但是**输入检查**也有弊端，比如

- 攻击者绕过前端页面直接使用接口就可以提交恶意代码到远程库中。
- 输入数据，还可能会被展示在多个地方，每个地方的语境可能各不相同，如果使用单一的替换操作，则可能会出现问题。输入检查也需要有针对性，如果我们想表达的意思是一个数小于另一个数（ `3 < 4`）,前端转义后的字符就变成`3 &lt; 4`，当这个值被存到远端时后，再通过`AJAX`获取使用就会造成不必要的麻烦，比如我就进行数值计算等等。

### 输出检查

一般来说，除富文本的输出外，在变量输出到`HTML`页面时，可以使用编码或转义的方式来防御`XSS`攻击。

XSS的本质还是一种“HTML 注入”，用户的数据被当成了HTML代码一部分来执行，从而混淆了原本的语义，产生了新的语义。

如同输入检查一样，我们可以对输出进行编码转义。

#### 1.在`HTML`中输出

比如我们的html代码中有这样一段代码：

```html
<div>$htmlVar</div>
<a href="">$htmlVar</a>
```

如果输出的变量没有进行安全处理，直接使用并渲染在页面中，都能导致直接产生`XSS`。最终的结果可能生成一下代码：

```html
<div><script>alert('我是一个XSS攻击者')</script></div>
<a href="#"><img href="" onclick="alert('我是另外一个XSS攻击者')"></a>
```

这个预防的方法就是对html进行转义检查

#### 2. 在`HTML`属性中输出

如果我们的html属性时动态值，那么利用属性也可以被攻击；

```html
<div id="testXSS" data-name=""></div>
```

现在往`data-name`属性中插入一段未转义的代码`">&lt;script&gt;alert('我是一个XSS攻击者')&lt;/script&gt;<"`,结果如下：

```html
<div id="testXSS" data-name=""><script>alert('我是一个XSS攻击者')</script><""></div>
```

#### 3. 在`&lt;script&gt;`标签中输出

在`&lt;script&gt;`标签中输出时，首先应该确保输出的变量在引号中。

```html
<script>
  // 假设userData是攻击者注入的数据
  let xssVar = userData;
</script>
```

攻击者需要先闭合引号才能实施XSS攻击：

```html
<script>
  // 假设userData是攻击者注入的数据
  let xssVar = "";alert('我是一个script XSS攻击者');
</script>
```

#### 4. 在`CSS`中输出

在 `CSS` 和 `style`、`style attribute` 中形成 `XSS` 的方式非常多样化，所以，一般来说，尽可能禁止用户可控制的变量在“`&lt;style&gt;`标签”、“`HTML`标签的`style`属性”以及“`CSS` 文件”中输出。如果一定有这样的需求，则推荐使用一个关于CSS转义库。

### 防御`DOM Based XSS`

`DOM Based XSS`是一种比较特别的`XSS`漏洞，前文提到的几种防御方法都不太适用，需要特别对待。这个本质上，实际上就是网站前端JavaScript代码本身不够严谨，把不可信的数据当作代码执行了。

如果用 `Vue/React` 技术栈，并且不使用 `v-html`/`dangerouslySetInnerHTML`功能，就在前端`render`阶段避免`innerHTML`、`outerHTML`的 `XSS`隐患。稍后会有专门的`Vue`关于`XSS`的防御段落。

会触发`DOM Based XSS`的地方有很多，以下几个地方是`JavaScript`输出到`HTML`页面的必经之路。

- `document.write()`;
- `document.writeln()`;
- `xxx.innerHTML()`;
- `xxx.outerHTML()`;
- `xxx.innerHTML.replace()`;
- `document.attachEvent()`;
- `window.attachEvent()`;
- `window.location()`;
- `window.name()`;

所以开发者需要重点关注这几个地方的参数是否可以被用户控制。如果项目中有用到这些的话，一定要避免在字符串中拼接不可信数据。

## `Vue`中的`XSS`防御

如果你在项目中使用了`Vue`作为前端开发框架，恭喜你，`Vue`将为你解决绝大多数的`XSS`攻击问题，但是`Vue`不是一个预防`XSS`攻击的框架，在开发使用的时候还是有被攻击的漏洞存在；

### `Vue`中的防御措施

不论使用模板还是渲染函数，`Vue`都会将插值的内容都会自动转义。也就是说对于这份模板：

```html
<template>
    <p>{{userData}}</p>
</template>

<script>
    // 从远程获取的数据
    userData = "<script>alert('xss')</script>"
</script>
```

最终编译后页面显示的`html`源码内容如下：

```html
<p>
    <script>alert('xss')</script>
</p>
```

原因是`Vue`帮我们对数据进行了转义，因此避免了脚本注入。该转义通过诸如 textContent 的浏览器原生的 API 完成，所以除非浏览器本身存在安全漏洞，否则不会存在安全漏洞。转义后的内容如下：

```html
&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

### 注入`HTML`

如果你要动态注入远程的`HTML`内容，首先你应该确保这些内容是安全有效的，否则你应该采取一些防御措施，去过滤或转义掉一些危险的标签符号；例如你可以这样显示的渲染`HTML`：

```html
<!-- 当使用模版时 -->
<div v-html="userProvidedHtml"></div>

<!-- 当使用渲染函数时 -->
<script>
    h('div', {
    domProps: {
        innerHTML: this.userProvidedHtml
    }
    })
</script>
<!-- 当使用JSX 的渲染函数时 -->
<div domPropsInnerHTML={this.userProvidedHtml}></div>
```

例如我们可以使用一个简单的方法（或者引用一个更加健壮的库/插件[XSS](https://jsxss.com/zh/index.html)来过滤一遍这个远程的`userProvidedHtml`数据内容，以确保安全；

```javascript
// 一个简单的函数，通过转义<为&lt以及>为&gt来实现防御HTML节点内容
const escape = function(str){
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
```

### 样式注入

在使用`Vue` 要在模板内避免渲染 `style` 标签:

```html
<style>{{ userProvidedStyles }}</style>
```

这是因为，一但通过`userProvidedStyles`，恶意用户仍可以提供 `CSS` 来进行“点击诈骗”，例如将链接的样式设置为一个透明的方框覆盖在“登录”按钮之上。然后再把`https://user-XSS-website.com/` 做成你的应用的登录页的样子，它们就可能获取一个用户真实的登录信息，所以Vue推荐使用`对象语法`且只允许用户提供特定的可以安全控制的`property`的值:

```html
<!-- sanitizedUrl应为受控的地址 -->
<a
  v-bind:href="sanitizedUrl"
  v-bind:style="{
    color: userProvidedColor,
    background: userProvidedBackground
  }"
>
  click me
</a>
```

## 安全问题“没有银弹”

> 在解决安全问题的过程中，不可能一劳永逸，也就是说“没有银弹”。

> 一般来说，人们都会讨厌麻烦的事情，在潜意识里希望能够让麻烦越远越好。而安全，正是一件麻烦的事情，而且是无法逃避的麻烦。任何人想要一劳永逸地解决安全问题，都属于一相情愿，是“自己骗自己”，是不现实的。

## 最佳实践

通用的规则是只要允许执行未过滤的用户提供的内容 (不论作为 `HTML`、`JavaScript` 甚至 `CSS`)，你就可能令自己处于被攻击的境地。这些建议实际上不论使用 `Vue`、`React`还是别的框架甚至不使用框架，都是成立的。

</details>

## 35. web常见的攻击方式有哪些，以及如何进行防御？ {#question-947278fd-7485-4e8c-a704-83d48280e05a}

> 难度：3 · 类型：QA

### 题目要点

**答题要点：**

Web攻击是针对用户上网行为或网站服务器等设备进行攻击的行为，目的包括植入恶意代码、修改网站权限或获取网站用户隐私信息。常见的Web攻击方式包括跨站脚本攻击（XSS）、跨站请求伪造（CSRF）和SQL注入攻击。

XSS攻击允许攻击者将恶意代码植入到提供给其他用户使用的页面中，目的是盗取存储在客户端的cookie或其他网站用于识别客户端身份的敏感信息。XSS攻击可以分为存储型、反射型和DOM型。

CSRF攻击是通过诱导受害者访问第三方网站，在第三方网站中向被攻击网站发送跨站请求，利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

SQL注入攻击是通过将恶意的SQL查询或添加语句插入到应用的输入参数中，在后台SQL服务器上解析执行进行的攻击。预防方式包括严格检查输入变量的类型和格式、过滤和转义特殊字符以及对访问数据库的Web应用程序采用Web应用防火墙。

Web应用程序的安全性是任何基于Web业务的重要组成部分，确保Web应用程序安全十分重要，即使是代码中很小的bug也可能导致隐私信息被泄露。站点安全就是为保护站点不受未授权的访问、使用、修改和破坏而采取的行为或实践。

<details>
<summary>参考答案</summary>

## 一、是什么

Web攻击（WebAttack）是针对用户上网行为或网站服务器等设备进行攻击的行为

如植入恶意代码，修改网站权限，获取网站用户隐私信息等等

Web应用程序的安全性是任何基于Web业务的重要组成部分

确保Web应用程序安全十分重要，即使是代码中很小的 bug 也有可能导致隐私信息被泄露

站点安全就是为保护站点不受未授权的访问、使用、修改和破坏而采取的行为或实践

我们常见的Web攻击方式有

- XSS (Cross Site Scripting) 跨站脚本攻击
- CSRF（Cross-site request forgery）跨站请求伪造
- SQL注入攻击

## 二、XSS

XSS，跨站脚本攻击，允许攻击者将恶意代码植入到提供给其它用户使用的页面中

`XSS`涉及到三方，即攻击者、客户端与`Web`应用

`XSS`的攻击目标是为了盗取存储在客户端的`cookie`或者其他网站用于识别客户端身份的敏感信息。一旦获取到合法用户的信息后，攻击者甚至可以假冒合法用户与网站进行交互

举个例子：

一个搜索页面，根据`url`参数决定关键词的内容

```html
<input type="text" value="<%= getParameter("keyword") %>">
<button>搜索</button>
<div>
  您搜索的关键词是：<%= getParameter("keyword") %>
</div>
```

这里看似并没有问题，但是如果不按套路出牌呢？

用户输入`">&lt;script&gt;alert('XSS');&lt;/script&gt;`，拼接到 HTML 中返回给浏览器。形成了如下的 HTML：

```html
<input type="text" value=""><script>alert('XSS');</script>">
<button>搜索</button>
<div>
  您搜索的关键词是："><script>alert('XSS');</script>
</div>
```

浏览器无法分辨出 `&lt;script&gt;alert('XSS');&lt;/script&gt;` 是恶意代码，因而将其执行，试想一下，如果是获取`cookie`发送对黑客服务器呢？

根据攻击的来源，`XSS`攻击可以分成：

- 存储型
- 反射型
- DOM 型

### 存储型

存储型 XSS 的攻击步骤：

1. 攻击者将恶意代码提交到目标网站的数据库中
2. 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

这种攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等

### 反射型 XSS

反射型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码
2. 用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

反射型 XSS 跟存储型 XSS 的区别是：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。

反射型 XSS 漏洞常见于通过 URL 传递参数的功能，如网站搜索、跳转等。

由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。

POST 的内容也可以触发反射型 XSS，只不过其触发条件比较苛刻（需要构造表单提交页面，并引导用户点击），所以非常少见

### DOM 型 XSS

DOM 型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码
2. 用户打开带有恶意代码的 URL
3. 用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞

### XSS的预防

通过前面介绍，看到`XSS`攻击的两大要素：

- 攻击者提交而恶意代码
- 浏览器执行恶意代码

针对第一个要素，我们在用户输入的过程中，过滤掉用户输入的恶劣代码，然后提交给后端，但是如果攻击者绕开前端请求，直接构造请求就不能预防了

而如果在后端写入数据库前，对输入进行过滤，然后把内容给前端，但是这个内容在不同地方就会有不同显示

例如：

一个正常的用户输入了 `5 < 7` 这个内容，在写入数据库前，被转义，变成了 `5 < 7`

在客户端中，一旦经过了 `escapeHTML()`，客户端显示的内容就变成了乱码( `5 < 7` )

在前端中，不同的位置所需的编码也不同。

- 当 `5 < 7` 作为 HTML 拼接页面时，可以正常显示：

```html
<div title="comment">5 &lt; 7</div>
```

- 当 `5 < 7` 通过 Ajax 返回，然后赋值给 JavaScript 的变量时，前端得到的字符串就是转义后的字符。这个内容不能直接用于 Vue 等模板的展示，也不能直接用于内容长度计算。不能用于标题、alert 等

可以看到，过滤并非可靠的，下面就要通过防止浏览器执行恶意代码：

在使用 `.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 HTML 插到页面上，而应尽量使用 `.textContent`、`.setAttribute()` 等

如果用 `Vue/React` 技术栈，并且不使用 `v-html`/`dangerouslySetInnerHTML` 功能，就在前端 `render` 阶段避免 `innerHTML`、`outerHTML` 的 XSS 隐患

DOM 中的内联事件监听器，如 `location`、`onclick`、`onerror`、`onload`、`onmouseover` 等，`<a>` 标签的 `href` 属性，JavaScript 的 `eval()`、`setTimeout()`、`setInterval()` 等，都能把字符串作为代码运行。如果不可信的数据拼接到字符串中传递给这些 API，很容易产生安全隐患，请务必避免

```js
<!-- 链接内包含恶意代码 -->
< a href=" ">1</ a>

<script>
// setTimeout()/setInterval() 中调用恶意代码
setTimeout("UNTRUSTED")
setInterval("UNTRUSTED")

// location 调用恶意代码
location.href = 'UNTRUSTED'

// eval() 中调用恶意代码
eval("UNTRUSTED")
```

## 三、CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求

利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目

一个典型的CSRF攻击有着如下的流程：

- 受害者登录a.com，并保留了登录凭证（Cookie）
- 攻击者引诱受害者访问了b.com
- b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带a.com的Cookie
- a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求
- a.com以受害者的名义执行了act=xx
- 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作

`csrf`可以通过`get`请求，即通过访问`img`的页面后，浏览器自动访问目标地址，发送请求

同样，也可以设置一个自动提交的表单发送`post`请求，如下：

```js
<form action="http://bank.example/withdraw" method=POST>
    <input type="hidden" name="account" value="xiaoming" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="for" value="hacker" />
</form>
<script> document.forms[0].submit(); </script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次`POST`操作

还有一种为使用`a`标签的，需要用户点击链接才会触发

访问该页面后，表单会自动提交，相当于模拟用户完成了一次POST操作

```html
< a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
    重磅消息！！
<a/>
```

### CSRF的特点

- 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生
- 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据
- 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”
- 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪

### CSRF的预防<br>

CSRF通常从第三方网站发起，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对CSRF的防护能力来提升安全性

防止`csrf`常用方案如下：

- 阻止不明外域的访问
  - 同源检测
  - Samesite Cookie
- 提交时要求附加本域才能获取的信息
  - CSRF Token
  - 双重Cookie验证

这里主要讲讲`token`这种形式，流程如下：

- 用户打开页面的时候，服务器需要给这个用户生成一个Token
- 对于GET请求，Token将附在请求地址之后。对于 POST 请求来说，要在 form 的最后加上

```html
<input type=”hidden” name=”csrftoken” value=”tokenvalue”/>
```

- 当用户从客户端得到了Token，再次提交给服务器的时候，服务器需要判断Token的有效性

## 四、SQL注入

Sql 注入攻击，是通过将恶意的 `Sql `查询或添加语句插入到应用的输入参数中，再在后台 `Sql `服务器上解析执行进行的攻击

 ![](https://static.ecool.fun//article/91d30bea-31a8-42c5-8037-4aac3ef14669.png)

流程如下所示：

- 找出SQL漏洞的注入点

- 判断数据库的类型以及版本
- 猜解用户名和密码
- 利用工具查找Web后台管理入口
- 入侵和破坏

预防方式如下：

- 严格检查输入变量的类型和格式
- 过滤和转义特殊字符
- 对访问数据库的Web应用程序采用Web应用防火墙

上述只是列举了常见的`web`攻击方式，实际开发过程中还会遇到很多安全问题，对于这些问题， 切记不可忽视

</details>
