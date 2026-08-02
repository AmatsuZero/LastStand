+++
title = "美团-零售-秋招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "美团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/68"
experienceId = 68
roundId = 111
roundOrder = 1
company = "美团"
date = "2025-08-04T07:49:59.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-68/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试主要考察前端基础知识，包括数据结构、网络协议、操作系统、JavaScript、CSS、React以及算法等方面。

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. 数组和链表的区别，读取 和 删除 的时间复杂度 {#question-subjective-2de490946b38}

### 题目要点

1.  **数据结构基础**：考察对数组和链表这两种基本数据结构概念的理解，包括它们的存储方式和特点。
2.  **时间复杂度分析**：评估数据结构在不同操作下的性能表现，这是衡量算法效率的关键指标。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **数组**：数组是一种将元素存储在连续内存空间中的数据结构。它通过索引来直接访问任意元素，因为所有元素的大小相同且物理地址连续，可以通过首地址和索引计算出元素的确切位置。
*   **链表**：链表是一种将元素存储在非连续内存空间中的数据结构。每个元素（称为节点）包含数据本身以及指向下一个元素的指针（或引用）。节点之间通过这些指针逻辑上连接起来，但不要求物理上连续。
*   **联系与区别**：数组和链表都是线性数据结构，用于有序地存储和组织数据。它们的主要区别在于内存的物理存储方式和由此带来的对元素访问、插入、删除操作的效率差异。数组支持随机访问，而链表只能顺序访问。
*   **为什么会出现这个技术需求或问题**：不同的数据存储和操作场景对数据结构有不同的性能要求。当需要快速随机访问数据时，数组由于其连续存储特性表现更优；而当需要频繁地进行插入和删除操作时，链表由于其灵活的指针连接方式，避免了大量元素移动，因此效率更高。

**1.2 核心用法 + 示例代码**
*   **读取操作**：
    *   **数组**：通过索引直接访问元素，时间复杂度为 `O(1)`。无论数组大小，访问任何元素所需时间都是恒定的。
    ```javascript
    const arr = [10, 20, 30, 40, 50];
    console.log(arr[2]); // 输出 30，直接访问，时间复杂度 O(1)
    ```
    *   **链表**：必须从链表的头部节点开始，沿着指针逐个遍历，直到找到目标元素。因此，时间复杂度为 `O(n)`，其中 `n` 是链表的长度。在最坏情况下，需要遍历整个链表。
    ```javascript
    class Node {
      constructor(val) {
        this.val = val;
        this.next = null;
      }
    }
    const head = new Node(10);
    head.next = new Node(20);
    head.next.next = new Node(30);

    let current = head;
    while (current && current.val !== 30) {
      current = current.next;
    }
    console.log(current ? current.val : 'Not found'); // 输出 30，需要遍历，时间复杂度 O(n)
    ```

*   **删除操作**：
    *   **数组**：删除数组中的某个元素后，为了保持内存的连续性，其后的所有元素都需要向前移动以填补空缺。这个移动操作的时间复杂度为 `O(n)`。
    ```javascript
    const arr = [1, 2, 3, 4, 5];
    arr.splice(2, 1); // 删除索引为2的元素（即3），后续元素（4, 5）前移，时间复杂度 O(n)
    console.log(arr); // 输出 [1, 2, 4, 5]
    ```
    *   **链表**：如果已知要删除节点的前一个节点，删除操作只需要修改前一个节点的指针，使其指向被删除节点的下一个节点。这个操作的时间复杂度为 `O(1)`。如果需要先查找再删除，则总时间复杂度为 `O(n)`（查找的开销）。
    ```javascript
    // 假设我们有一个链表 1 -> 2 -> 3，我们要删除值为 2 的节点
    // 模拟找到值为 1 的节点 (prevNode) 和值为 2 的节点 (nodeToDelete)
    let headDelete = new Node(1);
    let node2 = new Node(2);
    let node3 = new Node(3);
    headDelete.next = node2;
    node2.next = node3;

    let prevNode = headDelete; // 值为 1 的节点
    let nodeToDelete = node2; // 值为 2 的节点

    prevNode.next = nodeToDelete.next; // 将 1 的 next 指向 3，时间复杂度 O(1)
    // 现在链表变为 1 -> 3
    ```

*   **优势总结**：
    *   **数组**：在随机访问（通过索引直接获取元素）的场景下具有显著优势，因为其时间复杂度是 `O(1)`。适用于数据不常变动、需要频繁通过索引进行查询的场景。
    *   **链表**：在频繁进行插入和删除操作时具有优势，因为其时间复杂度是 `O(1)`（在已知插入/删除位置的情况下）。适用于数据频繁变动、不需要频繁随机访问的场景，例如实现队列、栈等数据结构。

**1.3 常见误区或面试陷阱**
*   **混淆时间复杂度**：最常见的错误是混淆数组和链表在读取、插入、删除操作上的时间复杂度，尤其是在链表的删除操作中，容易忽略先查找的 `O(n)` 开销，直接给出 `O(1)` 的答案。要强调 `O(1)` 是指在已知前驱节点的情况下的操作。
*   **忽略数组删除的移动成本**：对于数组的删除操作，容易只想到删除本身，而忽略了为了保持连续性，后续元素需要移动所带来的 `O(n)` 时间开销。
*   **对内存存储的理解不深入**：没有清晰地阐述数组的物理连续存储和链表的逻辑连续、物理非连续存储的区别，这是导致两者性能差异的根本原因。

</details>

## 2. 什么是TCP和UDP，它们之间有什么区别？ {#question-subjective-c45d1c2ccbd2}

### 题目要点

1.  **网络协议基础**：考察对传输层核心协议TCP和UDP的理解，包括其基本定义、特点和功能。
2.  **协议差异与应用场景**：评估对不同协议适用性的掌握，理解为何在不同场景下选择不同协议，这体现了对网络通信深层原理的认知。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **TCP (Transmission Control Protocol)**：传输控制协议。是一种面向连接的、可靠的、基于字节流的传输层通信协议。它在数据传输前需要建立连接（三次握手），传输过程中提供流量控制、拥塞控制和错误校验机制，确保数据能够按序、完整地到达目的地，并在数据传输结束后断开连接（四次挥手）。
*   **UDP (User Datagram Protocol)**：用户数据报协议。是一种无连接的、不可靠的、基于数据报的传输层通信协议。它在数据传输前不需要建立连接，直接将数据报发送出去，不保证数据传输的可靠性（不提供错误重传、流量控制或拥塞控制），也不保证数据报的顺序。它只负责将数据报从发送端投递到接收端。
*   **联系与区别**：TCP和UDP都属于传输层协议，负责端到端的数据传输。它们的主要区别在于是否面向连接、是否提供可靠性、是否保证顺序、以及传输效率和资源消耗。TCP提供高度可靠的服务，但开销较大；UDP则提供低延迟、高效率的服务，但不可靠。
*   **为什么会出现这个技术需求或问题**：互联网应用场景的多样性决定了需要不同特性的传输协议。对于文件传输、网页浏览等需要数据完整性和可靠性的应用，TCP是首选；而对于视频会议、在线游戏等对实时性要求高、允许少量丢包的应用，UDP则更具优势，因为它减少了建立连接和维护可靠性所需的开销。

**1.2 核心用法 + 示例**
*   **TCP的核心用法**：
    *   **连接建立与断开**：TCP通过三次握手建立连接，通过四次挥手断开连接，确保通信双方都准备就绪并完成数据交换。
    *   **可靠性传输**：通过序列号、确认应答、超时重传、流量控制（滑动窗口）和拥塞控制等机制，保证数据不丢失、不重复、不乱序。如果数据包丢失或损坏，发送方会重传。
    *   **流量控制**：接收方根据自身的处理能力，告知发送方可以发送的数据量，防止发送方发送过快导致接收方缓冲区溢出。
    *   **拥塞控制**：通过慢启动、拥塞避免、快速重传和快速恢复等算法，避免网络拥塞，平衡网络负载，提高利用率。
    *   **应用场景**：HTTP/HTTPS (网页浏览)、FTP (文件传输)、SMTP (邮件发送)、Telnet (远程登录)等。
    ```mermaid
    sequenceDiagram
        participant Client
        participant Server
        Client->>Server: SYN (seq=x)
        Server->>Client: SYN-ACK (seq=y, ack=x+1)
        Client->>Server: ACK (ack=y+1)
        Note over Client,Server: TCP连接建立 (三次握手)
        Client->>Server: Data Segment
        Server->>Client: ACK
        Note over Client,Server: 数据传输
        Client->>Server: FIN (seq=m)
        Server->>Client: ACK (ack=m+1)
        Server->>Client: FIN (seq=n)
        Client->>Server: ACK (ack=n+1)
        Note over Client,Server: TCP连接断开 (四次挥手)
    ```

*   **UDP的核心用法**：
    *   **简单与高效**：不建立连接，不维护状态，直接发送数据报。因此，开销小、传输效率高，适合对实时性要求高、容忍少量丢包的场景。
    *   **数据报传输**：将应用层数据封装成UDP数据报，然后直接发送到网络层。每个数据报是独立的，彼此之间没有关联。
    *   **应用场景**：DNS (域名解析)、视频/音频流媒体 (实时性要求高，允许少量丢包)、在线游戏、VoIP (语音通话)等。

**1.3 常见误区或面试陷阱**
*   **"UDP不可靠就没用"的误区**：很多人会错误地认为UDP由于不可靠就很少使用。实际上，UDP在实时性要求高的场景中非常重要，因为其低延迟的特性是TCP无法比拟的。不可靠不代表"没用"，而是"适用于不同场景"。
*   **混淆流量控制和拥塞控制**：虽然两者都与网络传输的效率有关，但流量控制是端到端的，防止发送方淹没接收方；拥塞控制是全局的，防止发送方发送过多数据导致整个网络瘫痪。面试时需要清晰区分。
*   **TCP连接建立和断开的细节不清**：对三次握手和四次挥手的具体过程、每个步骤的作用理解不透彻，尤其是在四次挥手时，容易混淆主动关闭方和被动关闭方的状态转换。
*   **UDP的"无连接"不等于没有源/目的IP和端口**：无连接是指在传输数据前不需要建立会话状态，但每个UDP数据报仍然包含源IP、目的IP、源端口和目的端口信息，以便正确寻址。这是基本的网络寻址概念，容易被忽略。

</details>

## 3. 什么是进程与线程？ {#question-subjective-4a33590fc582}

### 题目要点

1.  **操作系统基础**：考察对进程和线程这两个核心概念的理解，包括它们的定义、特点以及在操作系统中的作用。
2.  **并发与并行**：理解进程与线程在实现并发和并行计算中的角色，以及它们之间的关系和区别，这对于理解现代应用程序的运行机制至关重要。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **进程 (Process)**：进程是操作系统进行资源分配和调度的基本单位。它是一个程序的执行实例，拥有独立的内存空间（包括代码段、数据段、堆、栈）、文件句柄、网络连接等系统资源。每个进程之间相互独立，隔离性强，一个进程的崩溃通常不会影响其他进程。
*   **线程 (Thread)**：线程是CPU调度的基本单位，是进程内的一个执行流。一个进程可以包含一个或多个线程。线程共享其所属进程的内存空间和文件句柄等资源，但每个线程有独立的栈、程序计数器和寄存器等。线程间的通信比进程间通信更高效，因为它们共享相同的地址空间。
*   **联系与区别**：
    *   **归属关系**：进程是线程的容器，线程是进程的最小执行单位。没有进程，就没有线程。
    *   **资源拥有**：进程拥有独立的资源，线程共享进程的资源（除了私有的栈、程序计数器、寄存器）。
    *   **调度单位**：操作系统进行资源分配的最小单位是进程，而CPU调度的最小单位是线程。
    *   **开销**：创建、销毁和切换进程的开销远大于线程，因为进程涉及独立的资源分配和上下文切换；线程切换开销较小，因为它共享进程资源。
    *   **隔离性**：进程间隔离性强，通信复杂，但安全性高；线程间共享资源，通信简单，但安全性相对较低（一个线程的错误可能影响同进程的其他线程）。
*   **为什么会出现这个技术需求或问题**：为了提高计算机系统的资源利用率和程序的并发性。早期的操作系统只有进程的概念，但当程序需要执行多个任务时（如一个浏览器同时加载多个网页），如果每个任务都创建一个进程，会带来巨大的资源消耗和上下文切换开销。线程的引入解决了这个问题，它允许在一个进程内部创建多个执行流，共享资源，从而提高并发性，减少系统开销。

**1.2 核心用法 + 示例**
*   **进程的应用场景**：
    *   **独立应用程序**：例如，打开一个浏览器、一个文本编辑器，它们通常作为独立的进程运行，互相之间不干扰。
    *   **多任务操作系统**：操作系统通过进程管理不同的应用程序，实现多任务并行执行的假象。
    *   **安全性要求高**：由于进程之间资源隔离，一个进程的崩溃通常不会影响其他进程，适合需要高安全隔离性的场景。
    *   **示例 (Node.js)**：在Node.js中，可以通过 `child_process` 模块创建子进程来执行外部命令或独立的Node.js脚本，实现进程间的通信。
    ```javascript
    const { spawn } = require('child_process');
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    ```

*   **线程的应用场景**：
    *   **并发执行任务**：在同一个应用程序中同时处理多个任务，例如，在图形用户界面（GUI）应用中，一个线程负责响应用户输入，另一个线程负责执行后台计算，避免界面卡顿。
    *   **共享资源**：多个线程可以方便地访问和修改进程的共享数据，如全局变量、堆内存等，实现数据共享和协作。
    *   **多核CPU利用**：在多核处理器系统中，多个线程可以真正地并行执行，从而提高程序的运行效率。
    *   **示例 (Web Workers)**：在浏览器环境中，Web Workers 允许JavaScript在后台线程中运行脚本，而不会影响主线程的性能，从而避免UI的阻塞。
    ```javascript
    // main.js
    const worker = new Worker('worker.js');

    worker.onmessage = function(e) {
      console.log('Message received from worker:', e.data);
    };

    worker.postMessage('Hello Worker!');

    // worker.js
    onmessage = function(e) {
      console.log('Message received in worker:', e.data);
      postMessage('Hello Main Thread!');
    };
    ```

**1.3 常见误区或面试陷阱**
*   **"线程是轻量级进程"的误区**：虽然线程相比进程开销小，但不能简单地将其视为"轻量级进程"。它们的本质区别在于是否拥有独立的资源，线程共享进程资源，而进程拥有独立资源。
*   **混淆并发和并行**：并发是指一个时间段内有多个任务都在进行，但在某个时刻点只有一个任务在执行（单核CPU）；并行是指多个任务在同一时刻点真正地同时执行（多核CPU）。线程在单核CPU上可以实现并发，在多核CPU上可以实现并行。
*   **线程安全问题**：由于多线程共享进程的内存空间，如果不加同步控制，多个线程同时读写共享数据可能导致数据不一致，引发竞态条件和死锁等线程安全问题。这是多线程编程中一个重要的考点。
*   **对上下文切换的理解不足**：进程和线程切换都需要进行上下文切换，但进程上下文切换涉及更多资源的保存和恢复，因此开销更大。理解上下文切换是理解调度效率的关键。

</details>

## 4. HTTP和HTTPS 区别是啥？ {#question-subjective-d4700b4ceab3}

### 题目要点

1.  **网络协议安全**：考察对HTTP和HTTPS这两种Web传输协议的理解，特别是它们在数据安全方面的核心差异。
2.  **加密机制与证书**：深入理解HTTPS如何通过TLS/SSL协议实现数据加密、身份认证和数据完整性，以及数字证书在其中的作用。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **HTTP (HyperText Transfer Protocol)**：超文本传输协议。是一种用于分布式、协作式和超媒体信息系统的应用层协议。它以明文方式发送数据，不提供任何数据加密或身份验证机制。这意味着HTTP传输的数据容易被窃听（中间人攻击）、篡改和伪造。
*   **HTTPS (HyperText Transfer Protocol Secure)**：超文本传输安全协议。是HTTP的安全版本，它在HTTP和TCP之间增加了一个加密层——TLS/SSL（传输层安全协议/安全套接字层）。HTTPS通过TLS/SSL协议对数据进行加密、身份认证和数据完整性校验，确保数据在传输过程中的安全性和隐私性。
*   **联系与区别**：
    *   **安全性**：HTTP是明文传输，不安全；HTTPS通过TLS/SSL加密传输，提供数据加密、身份认证和数据完整性保护，是安全的。
    *   **连接方式**：HTTP默认端口是80；HTTPS默认端口是443。
    *   **资源消耗**：HTTPS由于需要进行加密解密和证书验证等操作，相比HTTP会增加一定的计算开销和网络延迟。
    *   **证书**：HTTPS需要CA（证书颁发机构）颁发的数字证书来验证服务器身份。
*   **为什么会出现这个技术需求或问题**：随着互联网的发展和应用场景的复杂化，数据安全和用户隐私变得越来越重要。HTTP的明文传输方式无法满足现代Web应用对安全性的需求，容易遭受各种网络攻击，如敏感信息泄露、数据篡改等。HTTPS的出现正是为了解决这些安全问题，为用户提供更安全、更可信的Web服务。

**1.2 核心用法 + 示例**
*   **HTTPS的工作原理**：
    1.  **客户端发起HTTPS请求**：浏览器向服务器发送HTTPS请求，默认使用443端口。
    2.  **服务器返回证书**：服务器收到请求后，会把配置好的数字证书发送给客户端。
    3.  **客户端验证证书**：客户端收到证书后，会验证证书的合法性（是否由受信任的CA颁发、是否过期、域名是否匹配等）。如果验证失败，会给出警告；如果成功，则从证书中提取服务器的公钥。
    4.  **协商会话密钥**：客户端生成一个随机的对称加密密钥（会话密钥），使用服务器的公钥对其进行加密，然后发送给服务器。
    5.  **服务器解密**：服务器使用自己的私钥解密收到的信息，获取到会话密钥。
    6.  **加密通信**：此后，客户端和服务器都使用这个会话密钥进行对称加密和解密，实现后续数据的安全传输。由于对称加密的效率比非对称加密高，所以数据传输阶段使用对称加密。

*   **HTTPS的优势**：
    *   **数据加密**：防止数据在传输过程中被窃听，保护用户隐私和敏感信息。
    *   **身份认证**：通过数字证书验证服务器身份，防止钓鱼网站和中间人攻击。
    *   **数据完整性**：防止数据在传输过程中被篡改，确保数据的真实性。
    *   **SEO优势**：主流搜索引擎（如Google）将HTTPS作为排名因素，有利于网站的SEO。
    *   **浏览器提示**：现代浏览器会对非HTTPS的网站标记为"不安全"，影响用户体验和信任度。

**1.3 常见误区或面试陷阱**
*   **"HTTPS只是HTTP加了SSL/TLS"的简化理解**：虽然HTTPS确实是在HTTP上加了一层加密，但其背后涉及复杂的握手过程、非对称加密与对称加密的结合、数字证书的信任链等，仅仅说是"加了SSL/TLS"不足以体现其深度。
*   **误认为HTTPS是"绝对安全"的**：HTTPS能有效防御传输过程中的窃听和篡改，但它并不能防御所有攻击，例如服务器自身的漏洞、客户端的恶意软件、DDoS攻击等。
*   **混淆对称加密和非对称加密的作用**：在HTTPS握手过程中，非对称加密（公钥/私钥）用于安全地交换对称密钥，而后续的数据传输则使用效率更高的对称加密。面试中容易对这两种加密方式的应用场景混淆。
*   **对证书信任链的理解不足**：不清楚数字证书是如何通过层层签名，最终追溯到根CA（根证书颁发机构）来建立信任的。这是HTTPS安全性的基石。

</details>

## 5. Array上有什么方法，比如 map, push {#question-subjective-cfa37dc2251a}

### 题目要点

1.  **JavaScript数组操作**：考察对JavaScript内置Array对象常用方法的掌握程度，包括对数组元素的增、删、改、查、遍历、转换等操作。
2.  **函数式编程与链式调用**：理解 `map` 等高阶函数在函数式编程中的应用，以及这些方法如何支持链式调用，提高代码的简洁性和可读性。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **JavaScript Array对象**：JavaScript中的Array（数组）是一个有序的集合，用于存储一系列值。它是一个特殊的对象，其属性名是整数（索引），并且有一个 `length` 属性，表示数组元素的数量。JavaScript的Array对象提供了丰富的内置方法，用于方便地操作数组，这些方法可以分为几大类：修改原数组的方法、不修改原数组返回新数组的方法、遍历方法、查找方法等。
*   **方法分类及联系**：这些方法的设计旨在提供多样化的数组操作能力。例如，`push` 和 `pop` 关注数组尾部的增删，`shift` 和 `unshift` 关注数组头部的增删，`splice` 允许在任意位置进行增删改。而 `map`、`filter`、`reduce` 等高阶函数则体现了函数式编程的思想，它们通过回调函数对数组进行转换或聚合，且通常不修改原数组，而是返回一个新的数组，这有助于保持数据的不变性。
*   **为什么会出现这个技术需求或问题**：在前端开发中，数组是数据处理的核心，无论是从后端获取的数据列表，还是前端内部维护的状态，都离不开数组。因此，高效、便捷地操作数组是开发者的基本需求。JavaScript内置的这些Array方法，正是为了满足这些需求而设计的，它们抽象了常见的数组操作模式，提升了开发效率和代码可读性。

**1.2 核心用法 + 示例代码**
JavaScript `Array` 对象提供了大量有用的方法。以下是一些常见的分类和示例：

*   **改变原数组的方法**：
    *   `push()`: 在数组末尾添加一个或多个元素，并返回新数组的长度。
    ```javascript
    const arr = [1, 2];
    arr.push(3, 4); // arr变为 [1, 2, 3, 4]
    console.log(arr); // [1, 2, 3, 4]
    ```
    *   `pop()`: 删除并返回数组的最后一个元素。
    ```javascript
    const arr = [1, 2, 3];
    const lastElement = arr.pop(); // lastElement为 3, arr变为 [1, 2]
    console.log(arr); // [1, 2]
    ```
    *   `unshift()`: 在数组开头添加一个或多个元素，并返回新数组的长度。
    ```javascript
    const arr = [3, 4];
    arr.unshift(1, 2); // arr变为 [1, 2, 3, 4]
    console.log(arr); // [1, 2, 3, 4]
    ```
    *   `shift()`: 删除并返回数组的第一个元素。
    ```javascript
    const arr = [1, 2, 3];
    const firstElement = arr.shift(); // firstElement为 1, arr变为 [2, 3]
    console.log(arr); // [2, 3]
    ```
    *   `splice(start, deleteCount, ...items)`: 通过删除或替换现有元素或者原地添加新的元素来修改数组。
    ```javascript
    const arr = [1, 2, 3, 4, 5];
    arr.splice(2, 1, 6); // 从索引2开始删除1个元素，并插入6，arr变为 [1, 2, 6, 4, 5]
    console.log(arr); // [1, 2, 6, 4, 5]
    ```
    *   `sort()`: 对数组的元素进行排序，并返回数组。默认按字符串升序排列。
    ```javascript
    const arr = [3, 1, 4, 1, 5, 9];
    arr.sort((a, b) => a - b); // arr变为 [1, 1, 3, 4, 5, 9]
    console.log(arr); // [1, 1, 3, 4, 5, 9]
    ```
    *   `reverse()`: 颠倒数组中元素的顺序，并返回颠倒后的数组。
    ```javascript
    const arr = [1, 2, 3];
    arr.reverse(); // arr变为 [3, 2, 1]
    console.log(arr); // [3, 2, 1]
    ```
    *   `fill(value, start, end)`: 用一个固定值填充一个数组中从起始索引到终止索引内的全部元素。
    ```javascript
    const arr = [1, 2, 3, 4];
    arr.fill(0, 1, 3); // arr变为 [1, 0, 0, 4]
    console.log(arr); // [1, 0, 0, 4]
    ```

*   **不改变原数组的方法（返回新数组）**：
    *   `map(callbackFn)`: 创建一个新数组，这个新数组由"原数组中的每个元素都调用一次提供的函数"的返回值组成。
    ```javascript
    const numbers = [1, 2, 3];
    const doubled = numbers.map(num => num * 2); // doubled为 [2, 4, 6]
    console.log(numbers); // [1, 2, 3] (原数组未改变)
    console.log(doubled); // [2, 4, 6]
    ```
    *   `filter(callbackFn)`: 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。
    ```javascript
    const numbers = [1, 2, 3, 4, 5];
    const evens = numbers.filter(num => num % 2 === 0); // evens为 [2, 4]
    console.log(evens); // [2, 4]
    ```
    *   `reduce(callbackFn, initialValue)`: 对数组中的每个元素执行一个由您提供的reducer函数(升序执行)，将其结果汇总为单个返回值。
    ```javascript
    const numbers = [1, 2, 3, 4];
    const sum = numbers.reduce((acc, current) => acc + current, 0); // sum为 10
    console.log(sum); // 10
    ```
    *   `slice(start, end)`: 提取数组的一部分到一个新数组中，原数组不会被修改。
    ```javascript
    const arr = [1, 2, 3, 4, 5];
    const subArr = arr.slice(1, 4); // subArr为 [2, 3, 4]
    console.log(subArr); // [2, 3, 4]
    ```
    *   `concat(...arrays)`: 用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
    ```javascript
    const arr1 = [1, 2];
    const arr2 = [3, 4];
    const newArr = arr1.concat(arr2); // newArr为 [1, 2, 3, 4]
    console.log(newArr); // [1, 2, 3, 4]
    ```

*   **遍历方法**：
    *   `forEach(callbackFn)`: 对数组的每个元素执行一次提供的函数。
    ```javascript
    const arr = ['a', 'b', 'c'];
    arr.forEach(element => console.log(element)); // 输出 a, b, c
    ```
    *   `some(callbackFn)`: 测试数组中是不是至少有一个元素通过了被提供的函数实现的测试。它返回一个布尔值。
    ```javascript
    const numbers = [1, 2, 3, 4, 5];
    const hasEven = numbers.some(num => num % 2 === 0); // hasEven为 true
    console.log(hasEven); // true
    ```
    *   `every(callbackFn)`: 测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。
    ```javascript
    const numbers = [2, 4, 6];
    const allEven = numbers.every(num => num % 2 === 0); // allEven为 true
    console.log(allEven); // true
    ```

*   **查找方法**：
    *   `indexOf(searchElement, fromIndex)`: 返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。
    ```javascript
    const arr = [1, 2, 3, 2];
    console.log(arr.indexOf(2)); // 1
    console.log(arr.indexOf(4)); // -1
    ```
    *   `find(callbackFn)`: 返回数组中满足提供的测试函数的第一个元素的值。否则返回 `undefined`。
    ```javascript
    const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
    const user = users.find(u => u.id === 2); // user为 {id: 2, name: 'Bob'}
    console.log(user); // { id: 2, name: 'Bob' }
    ```
    *   `includes(searchElement, fromIndex)`: 判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 `true`，否则返回 `false`。
    ```javascript
    const arr = [1, 2, 3];
    console.log(arr.includes(2)); // true
    console.log(arr.includes(4)); // false
    ```

*   **应用场景和优势**：
    *   **数据转换**：`map` 常用于将一个数组转换为另一个数组，例如，从一组对象中提取特定属性，或者对数字进行计算。
    *   **数据过滤**：`filter` 常用于从数组中筛选出满足特定条件的元素，例如，过滤掉不符合要求的数据项。
    *   **数据聚合**：`reduce` 常用于将数组中的所有元素聚合成一个单一的值，例如，计算数组元素的总和、平均值，或者将数组转换为对象。
    *   **不变性**：`map`、`filter`、`slice` 等不改变原数组的方法，在React、Vue等框架中尤其重要，因为它们有助于遵循不可变数据流，简化状态管理和组件更新逻辑。
    *   **链式调用**：许多数组方法返回新数组，这使得它们可以链式调用，写出更简洁、更具可读性的代码，例如 `array.filter(...).map(...).sort(...)`。

**1.3 常见误区或面试陷阱**
*   **混淆改变原数组和不改变原数组的方法**：这是最常见的错误。例如，认为 `map` 会修改原数组，或者 `sort` 不会修改原数组。需要清晰地知道哪些方法是"纯函数"（不改变原数组），哪些是"副作用函数"（改变原数组）。
*   **`forEach` 与 `map` 的区别**：虽然都能遍历数组，但 `forEach` 只是执行副作用（如打印），没有返回值；而 `map` 会返回一个新数组。在需要转换数组并获得新数组时，使用 `map` 更合适。
*   **`reduce` 的参数和返回值理解不透彻**：`reduce` 的回调函数的参数（累加器、当前值、索引、原数组）以及 `initialValue` 参数的作用常常被忽视或混淆，导致 `reduce` 使用不当。
*   **`sort` 默认排序问题**：`sort` 默认将元素转为字符串进行比较，这对于数字排序会产生错误结果。必须提供一个比较函数 `(a, b) => a - b` 来正确排序数字。
*   **数组方法的回调函数中的 `this` 指向问题**：在箭头函数作为回调函数时，`this` 会词法绑定到父级作用域；而普通函数作为回调函数时，`this` 可能指向 `window` 或 `undefined`（严格模式下），这需要注意。

</details>

## 6. 鼠标点击A元素内，此时输出？ {#question-subjective-4ee6c8801acc}

### 题目要点

1.  **事件机制**：考察对JavaScript事件传播机制的理解，特别是事件冒泡（Event Bubbling）的概念及其工作原理。
2.  **事件监听与执行顺序**：理解事件监听器如何捕获和处理事件，以及在DOM树中事件传播的顺序。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **事件传播**：当一个事件发生在DOM元素上时，它并不只是在那个元素上触发，而是会经历一个完整的传播过程，这个过程通常分为三个阶段：
    1.  **捕获阶段 (Capturing phase)**：事件从文档的根节点（`window`）开始，向下传播到目标元素。
    2.  **目标阶段 (Target phase)**：事件到达其最终目的地，即触发事件的那个元素。
    3.  **冒泡阶段 (Bubbling phase)**：事件从目标元素开始，向上回溯到文档的根节点（`window`）。
*   **事件冒泡**：是事件传播的第三个阶段，也是最常用的阶段。它指的是当一个元素上的事件被触发时，该事件会从目标元素开始，逐级向上传播到其父元素、祖先元素，直到文档的根节点。如果路径上的任何父元素也注册了相同类型的事件监听器，它们也会被触发。
*   **为什么会出现这个技术需求或问题**：事件传播机制（尤其是事件冒泡）的设计，是为了实现"事件委托"（Event Delegation）这一重要的优化手段。通过事件冒泡，我们可以在父元素上统一监听子元素的事件，而不是为每个子元素单独绑定事件监听器。这可以显著减少内存消耗，提高性能，尤其是在处理大量动态生成的元素时。

**1.2 核心用法 + 示例代码**
*   **事件监听器 `addEventListener`**：
    `addEventListener` 方法允许我们为元素添加事件监听器。它有三个参数：事件类型（如 `'click'`）、事件处理函数、以及一个可选的 `options` 对象（或布尔值 `useCapture`）。
    *   当 `options` 中的 `capture` 为 `true`（或 `useCapture` 为 `true`）时，事件监听器在捕获阶段被触发。
    *   当 `options` 中的 `capture` 为 `false`（或 `useCapture` 为 `false`，默认值）时，事件监听器在冒泡阶段被触发。

*   **代码分析与输出**：
    ```html
    <div id="B">
        <div id="A"></div>
    </div>
    &lt;script&gt;
        document.getElementById('A').addEventListener('click', () => { console.log('A') });
        document.getElementById('B').addEventListener('click', () => { console.log('B') });
    &lt;/script&gt;
    ```
    当鼠标点击 `id='A'` 元素内部时：
    1.  **事件传播开始**：点击事件首先在 `div#A` 上触发。
    2.  **捕获阶段**：事件从 `window` -> `document` -> `html` -> `body` -> `div#B` -> `div#A` 依次向下传递。在此过程中，由于没有在捕获阶段注册的监听器，所以没有输出。
    3.  **目标阶段**：事件到达 `div#A`，此时 `div#A` 上的点击事件监听器被触发，输出 `A`。
    4.  **冒泡阶段**：事件从 `div#A` 开始向上冒泡。
        *   事件冒泡到 `div#B`。由于 `div#B` 也注册了点击事件监听器（默认在冒泡阶段触发），因此 `div#B` 上的监听器被触发，输出 `B`。
        *   事件继续向上冒泡到 `body`、`html`、`document`、`window`，但由于这些元素上没有注册监听器，因此没有额外的输出。

    **所以，最终的输出顺序是：**
    ```
    A
    B
    ```

*   **事件委托示例**：
    使用事件冒泡可以实现事件委托，将多个子元素的事件监听器统一绑定到它们的父元素上。
    ```javascript
    <ul id="myList">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>

    document.getElementById('myList').addEventListener('click', function(event) {
      if (event.target.tagName === 'LI') {
        console.log('Clicked:', event.target.textContent);
      }
    });
    ```
    在这个例子中，即使 `<li>` 元素是动态添加的，`<ul>` 上的一个监听器也能处理所有 `<li>` 的点击事件，提高了效率和可维护性。

**1.3 常见误区或面试陷阱**
*   **混淆冒泡和捕获**：最常见的错误是将事件冒泡和事件捕获的顺序搞混。要牢记标准的事件流是"捕获 -> 目标 -> 冒泡"。
*   **`event.stopPropagation()` 的作用**：不理解 `event.stopPropagation()` 的作用，它用于阻止事件在DOM树中进一步传播（无论是冒泡还是捕获）。面试时可能会问如何阻止事件冒泡到父元素。
*   **`event.preventDefault()` 的作用**：混淆 `stopPropagation` 和 `preventDefault`。`preventDefault()` 是阻止事件的默认行为（例如点击链接跳转、提交表单），但事件仍然会继续传播。
*   **不同浏览器事件模型的差异（历史知识点，现代浏览器已统一）**：在早期，IE使用冒泡模型，而Netscape使用捕获模型。现代浏览器（包括IE9及以上）都支持W3C的事件流（捕获 -> 目标 -> 冒泡），但面试中可能会提及作为历史考点。
*   **事件委托的优势不清晰**：只知道事件冒泡，但不能清晰地阐述事件冒泡在事件委托中的应用及其带来的性能和维护优势。

</details>

## 7. 跨域的原因及方案、如何解决跨域 {#question-subjective-3671ba61e2fa}

### 题目要点

1.  **同源策略**：考察对浏览器安全核心机制"同源策略"的理解，这是导致跨域问题的根本原因。
2.  **跨域解决方案**：掌握多种解决跨域请求的方法，包括它们的原理、适用场景、优缺点以及在实际项目中的应用。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **跨域 (Cross-Origin)**：当一个请求的协议、域名（或IP）、端口号三者中任意一个与当前文档的地址不同时，就发生了跨域。浏览器出于安全考虑，会默认阻止跨域的AJAX（XHR和Fetch）请求，这就是著名的"同源策略"（Same-Origin Policy）。
*   **同源策略 (Same-Origin Policy)**：同源策略是浏览器的一项安全功能，它限制了来自一个源的文档或脚本如何与来自另一个源的资源进行交互。其目的是为了保护用户信息安全，防止恶意网站通过JavaScript窃取或篡改用户在其他网站上的数据。
*   **跨域发生的原因**：根本原因在于浏览器的同源策略限制了非同源的脚本对DOM、Cookie、XHR等资源的访问。当浏览器检测到跨域请求时，会发出请求，但会阻止响应的读取，从而防止敏感信息泄露到非授权的源。
*   **为什么会出现这个技术需求或问题**：在现代Web开发中，前后端分离、微服务架构、CDN资源加载等成为常态。这意味着前端应用经常需要向不同源的API服务器请求数据，或者从不同的域加载静态资源。这种架构模式天然地导致了跨域问题的出现，因此需要有相应的解决方案来绕过同源策略的限制，实现正常的跨域通信，同时又不完全牺牲安全性。

**1.2 核心用法 + 示例代码**
解决跨域问题有多种方案，每种方案都有其适用场景和优缺点：

*   **1. CORS (Cross-Origin Resource Sharing)**：
    *   **原理**：CORS是一个W3C标准，它允许服务器在响应头中添加特殊的HTTP头（如 `Access-Control-Allow-Origin`），告知浏览器该资源可以被哪些源访问。这是目前主流且推荐的跨域解决方案。
    *   **应用**：后端需要在响应头中添加CORS相关的配置。
    *   **优点**：W3C标准，功能完善，支持各种HTTP方法，可以控制具体允许的源、方法、头部和是否发送Cookie。
    *   **缺点**：需要后端配合修改配置。对于老旧浏览器可能存在兼容性问题（IE8/9需要XDR）。
    *   **示例 (Node.js Express)**：
    ```javascript
    const express = require('express');
    const app = express();

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*'); // 允许所有源访问，实际项目中应指定具体域名
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许的方法
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许的头部
      res.header('Access-Control-Allow-Credentials', 'true'); // 允许发送Cookie
      if (req.method === 'OPTIONS') {
        res.sendStatus(200); // 预检请求直接返回200
      } else {
        next();
      }
    });

    app.get('/data', (req, res) => {
      res.json({ message: 'Hello from cross-origin!' });
    });

    app.listen(3000, () => console.log('Server running on port 3000'));
    ```

*   **2. JSONP (JSON with Padding)**：
    *   **原理**：JSONP利用了 `&lt;script&gt;` 标签没有同源限制的特性。前端通过 `&lt;script&gt;` 标签向非同源服务器发起请求，服务器返回一个包裹在指定回调函数中的JSON数据。
    *   **应用**：前端定义一个回调函数，通过动态创建 `&lt;script&gt;` 标签并设置其 `src` 属性来发起请求，后端响应时将数据作为参数传递给该回调函数。
    *   **优点**：兼容性好，支持老旧浏览器，无需修改服务器配置（只需后端支持返回特定格式）。
    *   **缺点**：
        *   **只支持GET请求**：无法发送POST、PUT等请求。
        *   **不安全**：容易遭受XSS攻击（如果服务器返回的JSONP数据被注入恶意代码）。
        *   **无法处理错误**：很难判断请求是否成功（只能通过回调是否被执行判断）。
    *   **示例 (前端)**：
    ```javascript
    function handleData(data) {
      console.log('Received data:', data);
    }

    const script = document.createElement('script');
    script.src = 'http://other-domain.com/api/data?callback=handleData';
    document.body.appendChild(script);
    ```
    *   **示例 (后端)**：
    ```javascript
    // 假设请求路径为 /api/data?callback=handleData
    // 后端接收callback参数，并返回数据
    function sendJsonp(req, res) {
        const callbackName = req.query.callback;
        const data = { name: 'JSONP User', age: 30 };
        res.send(`${callbackName}(${JSON.stringify(data)})`);
    }
    ```

*   **3. 代理 (Proxy)**：
    *   **原理**：在同源策略限制下，前端无法直接访问非同源服务器，但后端服务器之间没有同源策略限制。因此，可以通过在当前域的服务器上设置一个代理，由代理服务器去请求目标服务器的数据，再将数据返回给前端。
    *   **应用**：开发环境常用，如Webpack Dev Server的 `proxy` 配置；生产环境则是在Nginx等服务器上配置反向代理。
    *   **优点**：对前端无感，前端请求的仍然是同源地址；安全性高，所有跨域请求都在服务器端完成。
    *   **缺点**：增加了服务器的负担和网络请求的复杂度。
    *   **示例 (Webpack Dev Server)**：
    ```javascript
    // webpack.config.js
    module.exports = {
      // ...
      devServer: {
        proxy: {
          '/api': {
            target: 'http://other-domain.com', // 目标服务器地址
            changeOrigin: true, // 改变源，将请求的Host头设置为目标URL
            pathRewrite: { '^/api' : '' } // 重写路径，将/api前缀去除
          }
        }
      }
    };
    ```
    当前端请求 `/api/data` 时，实际上会被代理到 `http://other-domain.com/data`。

*   **4. WebSocket**：
    *   **原理**：WebSocket协议本身没有同源策略的限制。一旦WebSocket连接建立，数据就可以在客户端和服务器之间全双工、无限制地传输，不受同源策略的约束。
    *   **应用**：实时通信场景，如聊天室、实时数据推送等。
    *   **优点**：支持全双工通信，性能高，适合实时应用。
    *   **缺点**：主要是针对特定应用场景，不能替代HTTP请求，不支持传统的RESTful API。

*   **5. document.domain (子域)**：
    *   **原理**：在同一主域下的不同子域之间（如 `a.example.com` 和 `b.example.com`），可以通过将 `document.domain` 设置为相同的主域（`example.com`）来规避同源策略。
    *   **优点**：简单易用，适用于主域相同但子域不同的场景。
    *   **缺点**：安全性较低，可能引入安全漏洞；只适用于同主域下的情况。

*   **6. postMessage**：
    *   **原理**：`window.postMessage()` 方法提供了一种安全的方式来跨源通信。它允许来自不同源的脚本之间进行数据的双向通信。
    *   **应用**：主要用于内嵌 `iframe` 或打开新窗口进行跨域通信。
    *   **优点**：安全可靠，支持复杂数据类型传输，广泛应用于跨窗口/跨iframe通信。
    *   **缺点**：只能用于窗口或iframe之间的通信。

**1.3 常见误区或面试陷阱**
*   **误认为跨域是"请求被阻止"**：实际上，浏览器会发送跨域请求到服务器，但如果服务器没有返回正确的CORS头，浏览器会阻止JavaScript读取响应。请求本身已经发出，只是结果被阻止。
*   **混淆CORS预检请求 (Preflight Request)**：对于非简单请求（如PUT、DELETE、带自定义头的POST请求），浏览器会先发送一个OPTIONS请求（预检请求）来询问服务器是否允许该跨域请求。如果预检请求不通过，后续的实际请求就不会发送。容易忽略预检请求的存在和作用。
*   **JSONP的安全性问题**：认为JSONP是安全的，或不清楚其容易遭受XSS攻击的原理（因为 `&lt;script&gt;` 标签可以执行任意JS代码）。
*   **代理方案的部署方式**：不清楚代理可以是开发环境的开发服务器代理（如Webpack Dev Server），也可以是生产环境的Web服务器反向代理（如Nginx）。
*   **同源策略的判断标准不清晰**：仅仅知道协议、域名、端口号三者一致才同源，但对于端口号默认值（HTTP 80，HTTPS 443）的理解可能不足，或者忽略了子域不同也算跨域的情况。

</details>

## 8. cookie、localStorage、sessionStorage有什么区别 {#question-subjective-650edcc8c032}

### 题目要点

1.  **浏览器存储机制**：考察对前端数据存储方式的理解，包括Cookie、localStorage和sessionStorage的基本概念、存储特性和限制。
2.  **应用场景选择**：掌握在不同业务需求下，如何选择合适的存储方案，这体现了对前端存储技术栈的全面认知和实践能力。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **Cookie**：Cookie是Web服务器发送给浏览器的一小段文本信息，浏览器会将它保存下来，并在下次向同一服务器发送请求时携带这些信息。Cookie主要用于以下目的：会话管理（如登录状态、购物车）、个性化设置（如用户偏好）和跟踪用户行为。每个Cookie都有大小限制（通常为4KB），并且数量也有限制（每个域名下20-50个）。
*   **localStorage**：localStorage是HTML5 Web Storage API的一部分，提供了一种在浏览器中持久化存储键值对数据的方法。它没有过期时间，数据会一直保留，除非用户手动清除或代码主动删除。存储容量较大（通常为5MB或更多）。
*   **sessionStorage**：sessionStorage也是HTML5 Web Storage API的一部分，与localStorage类似，但其生命周期仅限于当前会话。这意味着当用户关闭浏览器窗口或标签页时，sessionStorage中存储的数据会被清除。存储容量与localStorage类似，通常为5MB或更多。
*   **联系与区别**：Cookie、localStorage和sessionStorage都用于在客户端存储数据，但它们在存储容量、生命周期、是否随HTTP请求发送以及API使用上存在显著差异。Cookie是最早的客户端存储技术，而localStorage和sessionStorage是HTML5引入的，提供了更强大的存储能力。
*   **为什么会出现这个技术需求或问题**：在Web应用中，为了提升用户体验、保存用户状态、缓存数据等，需要在客户端存储一些信息。不同的业务场景对存储的持久性、容量和安全性有不同的要求，因此需要多种存储机制来满足这些多样化的需求。

**1.2 核心用法 + 示例代码**
以下是Cookie、localStorage和sessionStorage的主要区别和使用场景：

| 特性         | Cookie                               | localStorage                          | sessionStorage                        |
| :----------- | :----------------------------------- | :------------------------------------ | :------------------------------------ |
| **生命周期**   | 可设置过期时间，默认会话结束时失效。  | 除非手动删除或浏览器清除，永不失效。 | 浏览器会话结束（关闭标签页/浏览器）时失效。 |
| **存储容量**   | 小，约4KB。                          | 大，约5MB或更多。                     | 大，约5MB或更多。                     |
| **与服务器通信** | 每次HTTP请求都会自动携带（同源）。      | 不会自动随HTTP请求发送。             | 不会自动随HTTP请求发送。             |
| **API**        | 需要手动封装读写，或使用第三方库。    | `setItem()`, `getItem()`, `removeItem()`, `clear()`, `key()` | `setItem()`, `getItem()`, `removeItem()`, `clear()`, `key()` |
| **作用域**     | 同源下所有页面共享。                  | 同源下所有页面共享。                 | 仅限于当前标签页/窗口的同源页面。    |

*   **使用示例**：

    *   **Cookie (手动设置/读取)**：
        ```javascript
        // 设置Cookie (过期时间为1小时)
        document.cookie = "username=John Doe; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString() + "; path=/";

        // 读取Cookie
        function getCookie(name) {
          const nameEQ = name + "=";
          const ca = document.cookie.split(';');
          for(let i = 0; i &lt; ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
          }
          return "";
        }
        console.log(getCookie("username")); // John Doe
        ```

    *   **localStorage**：
        ```javascript
        // 设置数据
        localStorage.setItem('userSettings', JSON.stringify({ theme: 'dark', notifications: true }));

        // 读取数据
        const settings = JSON.parse(localStorage.getItem('userSettings'));
        console.log(settings.theme); // dark

        // 删除数据
        localStorage.removeItem('userSettings');

        // 清除所有数据
        // localStorage.clear();
        ```

    *   **sessionStorage**：
        ```javascript
        // 设置数据
        sessionStorage.setItem('currentOrderId', 'ORD12345');

        // 读取数据
        console.log(sessionStorage.getItem('currentOrderId')); // ORD12345

        // 删除数据
        sessionStorage.removeItem('currentOrderId');
        ```

*   **应用场景**：
    *   **Cookie**：
        *   **会话管理**：用户登录状态、Session ID的存储。
        *   **个性化设置**：用户偏好设置、主题选择（需要较短的持久性）。
        *   **广告追踪**：用户行为分析。
    *   **localStorage**：
        *   **持久化存储**：长期缓存用户数据（如用户登录信息，若用户勾选"记住我"）、离线应用数据、用户设置（如语言、字体大小）等。
        *   **大量数据存储**：无需每次请求都发送到服务器的非敏感数据。
    *   **sessionStorage**：
        *   **单次会话数据**：表单填写信息（防止意外关闭丢失）、当前页面的状态信息、多步操作的临时数据等。适用于页面刷新后需要保留，但关闭标签页后不需要保留的数据。

**1.3 常见误区或面试陷阱**
*   **Cookie的安全性误解**：认为Cookie是安全的。实际上，Cookie是明文存储的，容易被篡改；`HttpOnly` 属性可以防止XSS攻击获取Cookie，但不能防止CSRF攻击。同时，由于每次请求都会发送，如果存储敏感信息且未加密，存在安全风险。
*   **localStorage的"永不失效"误解**：localStorage的数据确实没有过期时间，但用户或浏览器仍可以手动清除它。因此，不能将其视为绝对永久的存储。
*   **sessionStorage的作用域误解**：误认为sessionStorage是所有同源标签页共享的。实际上，sessionStorage是独立于每个标签页/窗口的，只有在同一个标签页中刷新或通过 `window.open()` 打开的同源子页面才会共享。
*   **存储容量的混淆**：对三者的存储容量没有清晰的概念，尤其是Cookie的容量非常小，不适合存储大量数据。
*   **数据类型限制**：localStorage和sessionStorage只能存储字符串。如果需要存储对象或数组，必须先通过 `JSON.stringify()` 转换为字符串，读取时再通过 `JSON.parse()` 转换回来。忘记这一步是常见错误。

</details>

## 9. 说下元素的排列情况 {#question-subjective-53a419c770e8}

[a][b][c]

a,b,c {

display: inline-block,

width: 100px,

height: 100px,

}

b {

position: absolute,

top: 50px,

}

### 题目要点

1.  **CSS盒模型与显示类型**：考察对 `display: inline-block` 的理解，包括其如何结合行内元素和块级元素的特性，以及对元素尺寸和间距的影响。
2.  **CSS定位**：深入理解 `position: absolute` 的工作原理，包括其脱离文档流、定位基准以及对其他元素布局的影响。
3.  **布局综合分析**：综合运用CSS知识，分析不同CSS属性组合对元素最终排列情况的影响，这考验了面试者对CSS布局机制的全面掌握和实际分析能力。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **`display: inline-block`**：`inline-block` 是一种结合了行内元素（`inline`）和块级元素（`block`）特性的显示方式。它允许元素在同一行内水平排列（像行内元素），但同时又可以设置宽度（`width`）、高度（`height`）、内外边距（`margin`、`padding`），并且支持垂直对齐（像块级元素）。`inline-block` 元素之间会因为HTML源代码中的换行或空格而产生默认的间隙。
*   **`position: absolute`**：当一个元素的 `position` 属性被设置为 `absolute` 时，该元素会完全脱离正常的文档流（normal document flow）。这意味着它不再占据空间，也不会影响其他元素的布局，其他元素会像它不存在一样进行排列。`absolute` 定位的元素会相对于其最近的已定位祖先元素（`position` 属性不是 `static` 的祖先元素，即 `relative`、`absolute`、`fixed`、`sticky`）进行定位。如果没有已定位的祖先元素，它将相对于初始包含块（通常是 `<html>` 或 `<body>` 元素）进行定位。
*   **属性交互与布局影响**：在这个问题中，`display: inline-block` 和 `position: absolute` 的组合使用是关键。一旦元素被设置为 `position: absolute`，它的 `display` 属性（无论是 `inline`、`block`、还是 `inline-block`）就不再对其在文档流中的表现产生影响，因为它已经脱离了文档流。但是，其尺寸（`width`, `height`）仍然受 `inline-block` 所允许的设置的影响。
*   **为什么会出现这个技术需求或问题**：前端开发中，精确的布局控制是核心需求。`inline-block` 常用于水平排列可控尺寸的元素，而 `absolute` 定位则用于实现元素的浮层、精确覆盖、或者在特定区域内自由定位。理解它们的组合效果，对于实现复杂UI界面，特别是需要元素重叠或精确对齐的场景至关重要。

**1.2 核心用法 + 示例代码**
假设有以下HTML结构：
```html
<div>
  <span class="box a">a</span><span class="box b">b</span><span class="box c">c</span>
</div>
```
以及给定的CSS：
```css
.box {
  display: inline-block;
  width: 100px;
  height: 100px;
  border: 1px solid black;
  text-align: center;
  line-height: 100px;
}
.b {
  position: absolute;
  top: 50px;
}
```

**元素排列情况分析：**
1.  **初始状态 (`.box`)**：
    *   元素 `a`, `b`, `c` 都被设置为 `display: inline-block`，宽度和高度都为 `100px`。\n    *   在没有其他定位属性的情况下，`a`, `b`, `c` 会在同一行水平排列，每个元素占据 `100px` 宽和 `100px` 高的空间。由于它们是 `inline-block` 元素，并且HTML中它们之间可能存在换行或空格（如示例HTML所示），所以它们之间会存在一个很小的水平间隙（通常是4px或8px，取决于字体大小）。

2.  **元素 `b` 的定位 (`.b`)**：
    *   `position: absolute` 会使元素 `b` **完全脱离正常的文档流**。这意味着：
        *   元素 `b` 不再占用其原始位置的空间。\n        *   元素 `b` 不再影响其兄弟元素 `a` 和 `c` 的布局。
    *   元素 `b` 将会相对于其最近的已定位祖先元素进行定位。在给定的CSS和假设的HTML中，如果没有父元素被设置 `position`（如 `relative`），那么 `b` 将会相对于**初始包含块**（通常是浏览器窗口的左上角，或 `<html>`/`<body>` 元素）进行定位。
    *   `top: 50px` 将使元素 `b` 的上边缘距离其定位父元素（或初始包含块）的顶部 `50px`。
    *   由于没有设置 `left`、`right`、`bottom`，元素 `b` 的水平位置将保持其在脱离文档流前的位置（或者说，如果其父元素没有相对定位，它会紧随 `a` 元素的右侧的水平位置）。

3.  **元素 `a` 和 `c` 的排列**：
    *   因为元素 `b` 脱离了文档流，元素 `a` 和 `c` 会表现得像 `b` 不存在一样。它们会紧邻着水平排列，仍然保持 `inline-block` 的特性，各自占据 `100px` 宽和 `100px` 高的空间，并可能存在因HTML中空格导致的微小间隙。

**最终的排列情况示意：**
*   元素 `a` 会在最左侧，占据 `100px` x `100px` 的空间。
*   元素 `c` 会紧随 `a` 的右侧排列，占据 `100px` x `100px` 的空间，就好像 `b` 从未存在过一样，或者说 `b` 的位置被 `c` "填补"了。
*   元素 `b` 会浮动在页面上，其顶部距离初始包含块 `50px`。它的水平位置将取决于其在脱离文档流前的位置，通常会紧挨着 `a` 的右侧，但会下移 `50px`。

**简而言之：** `a` 和 `c` 会在一行上紧邻排列，而 `b` 会脱离它们，浮动在 `a` 和 `c` 所在的行的下方，距离页面顶部50px的位置。

**1.3 常见误区或面试陷阱**
*   **误认为 `absolute` 元素仍然占据空间**：这是最常见的误区。一旦元素 `position: absolute`，它就不再占用文档流中的任何空间，其他元素会忽略它的存在并重新排列。
*   **不理解 `absolute` 的定位基准**：很多面试者会错误地认为 `absolute` 总是相对于 `body` 或 `html` 定位。关键在于"最近的已定位祖先元素"。如果父元素没有 `position: relative` 等属性，才会相对于初始包含块。
*   **忽略 `inline-block` 之间的空白间隙**：虽然问题主要考察 `absolute` 的影响，但 `inline-block` 元素之间的默认空白间隙（由于HTML代码中的空格、换行、Tab等）也是一个常见考点，容易被忽视。
*   **未提及 `z-index` 和堆叠上下文**：当元素 `position: absolute` 时，它会创建一个新的堆叠上下文（如果同时设置了 `z-index` 且不是 `auto`）。面试官可能会深挖这方面知识，考察对元素堆叠顺序的理解。\n

</details>

## 10. setState是同步还是异步？具体做了什么？ {#question-subjective-75a1d5155468}

### 题目要点

1.  **React状态管理**：考察对React组件状态（State）管理核心机制的理解，特别是 `setState` 方法的异步性及其背后的原因。
2.  **React更新机制**：深入理解React的批量更新（Batching Updates）机制、虚拟DOM（Virtual DOM）与真实DOM的协调（Reconciliation）过程，以及 `setState` 如何触发这些更新流程。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **`setState` 的异步性与同步性**：
    *   **异步性**：在**React的事件处理函数（如 `onClick`、`onChange` 等）和生命周期函数（如 `componentDidMount`、`componentDidUpdate` 等）中**，`setState` 是异步执行的。这意味着在调用 `setState` 后，你不能立即获取到更新后的 `state` 值，因为React会出于性能优化考虑，将多次 `setState` 调用进行批量处理（Batching）。
    *   **同步性**：在**非React事件（如 `setTimeout`、`Promise.then` 回调、原生DOM事件监听器）中**，`setState` 是同步执行的。这意味着在这些场景下调用 `setState` 后，可以立即获取到更新后的 `state` 值，因为React无法对这些场景下的更新进行批量处理。
*   **批量更新 (Batching Updates)**：React为了提高性能，会将短时间内发生的多次 `setState` 调用合并为一次，只进行一次虚拟DOM的比较和真实DOM的更新。这样做可以减少不必要的渲染，避免重复计算和DOM操作，从而提升应用程序的响应速度和性能。
*   **为什么会出现这个技术需求或问题**：前端应用中频繁的状态更新会导致频繁的DOM操作，而DOM操作是昂贵的。如果每次 `setState` 都立即更新DOM，会造成大量的性能开耗。React引入 `setState` 的异步和批量更新机制，正是为了优化性能，提供更流畅的用户体验。它将UI更新视为一个批处理过程，而不是即时操作，从而避免了"抖动"和不必要的重渲染。

**1.2 核心用法 + 示例代码**
`setState` 的核心作用是更新组件的状态，并触发UI的重新渲染。它接受两个参数：
1.  **`updater` (function or object)**：
    *   **对象形式 (Object)**：直接传入一个对象来更新state。如果新的state依赖于旧的state，不推荐使用此形式，因为它可能导致异步更新的滞后性问题。
    ```javascript
    this.setState({ count: this.state.count + 1 }); // 潜在问题：this.state.count 可能不是最新的
    ```
    *   **函数形式 (Function)**：推荐使用函数形式，因为它接收当前的 `state` 和 `props` 作为参数，可以确保你拿到的是最新的状态值。函数形式的 `setState` 更加可靠，因为它会排队执行，保证状态更新的正确性。
    ```javascript
    this.setState((prevState, props) => ({
      count: prevState.count + 1
    })); // 确保基于最新状态进行更新
    ```
2.  **`callback` (function, optional)**：一个可选的回调函数，它会在状态更新并重新渲染组件后被调用。这确保你可以在DOM更新完成后执行一些操作，例如获取更新后的DOM尺寸。
    ```javascript
    this.setState({ count: this.state.count + 1 }, () => {
      console.log('State updated, new count:', this.state.count);
      // 在这里可以进行依赖于最新DOM的操作
    });
    ```

*   **`setState` 具体做了什么？**
    1.  **合并状态 (Merge State)**：`setState` 会将传入的 `updater` 与当前 `state` 进行浅合并。如果是对象形式，则直接合并；如果是函数形式，则先执行函数获取新的state，再合并。
    2.  **标记为"脏" (Mark as Dirty)**：将当前组件标记为"脏"，表示它需要在下次事件循环中重新渲染。
    3.  **放入更新队列 (Enqueue Update)**：将更新放入一个更新队列中。
    4.  **批量更新 (Batching)**：在React的内部机制中（如事件系统），会等待所有事件处理函数执行完毕后，一次性处理更新队列中的所有 `setState`，进行批量更新。这个过程是在一个事件循环的末尾或者下一个微任务中进行的（取决于React版本和上下文）。
    5.  **协调 (Reconciliation)**：当批量更新触发时，React会执行"协调"过程：
        *   **创建新的虚拟DOM树**：根据更新后的 `state` 和 `props`，重新调用组件的 `render` 方法，生成一个新的虚拟DOM树。
        *   **比较差异 (Diffing)**：将新的虚拟DOM树与旧的虚拟DOM树进行高效的比较（Diffing算法）。React会找出两棵树之间最少的差异。
        *   **更新真实DOM (Commit)**：将差异应用到真实的浏览器DOM上，只更新那些真正改变的部分，而不是整个DOM树。
    6.  **执行回调 (Callback Execution)**：如果提供了回调函数，它会在真实DOM更新完成后执行。

*   **为什么异步更新是性能优化的体现？**
    假设在一个点击事件中连续调用了三次 `this.setState({ count: this.state.count + 1 })`。
    如果 `setState` 是同步的，每次调用都会立即触发：更新 `state` -> 虚拟DOM对比 -> 真实DOM更新。这将导致三次昂贵的DOM操作。
    而异步和批量更新机制下，三次 `setState` 会被合并，最终只触发一次：更新 `state` -> 虚拟DOM对比 -> 真实DOM更新。这大大减少了DOM操作，提升了性能。

**1.3 常见误区或面试陷阱**
*   **误认为 `setState` 总是异步的**：这是最常见的误解。需要明确区分在React事件和非React事件（如 `setTimeout`、原生事件）中 `setState` 的同步/异步表现。
*   **不理解函数式 `setState` 的重要性**：当新的状态依赖于旧的状态时，直接使用对象形式的 `setState` 可能会因为批量更新而导致读取到旧的状态值，从而出现逻辑错误。函数式 `setState` 能够获取到最新的 `prevState`，避免这种问题。
*   **混淆 `setState` 的回调函数和 `render` 的执行时机**：回调函数是在DOM更新完成后执行的，而不是在 `render` 函数执行后立即执行。`render` 函数可能会在 `setState` 调用后，但在DOM更新前执行。
*   **对批量更新机制的理解不深入**：仅仅知道"异步"，但不知道为什么异步，以及React是如何进行批量处理来优化性能的（事件循环、更新队列、Diffing算法等）。
*   **未提及 `forceUpdate()`**：虽然不常用，但 `forceUpdate()` 可以强制组件重新渲染，即使 `state` 或 `props` 没有改变。面试官可能会通过对比 `setState` 和 `forceUpdate` 来考察对组件更新机制的理解。

</details>

## 11. 树形结构取值 {#question-subjective-94b58b63bcff}

```
{
  id: 1,
    children: [
    {
        id:2,
      children: [
        {id:4, children: []}
      ],
    },
    {
        id:3,
      children: null
    }
  ]
}
```

### 题目要点

1.  **数据结构**：考察对树形数据结构（特别是多叉树）的理解，以及如何表示和遍历这种结构。
2.  **算法设计**：掌握在树形结构中查找特定节点并返回其路径的算法，这通常涉及到深度优先搜索（DFS）或广度优先搜索（BFS）的思想。
3.  **递归与迭代**：评估是否能够使用递归或迭代的方式高效地实现树形结构的遍历和查找，并处理边缘情况（如空子节点、找不到目标）。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **树形结构**：树形结构是一种非线性的数据结构，由节点（node）和边（edge）组成。它有一个根节点（root node），每个节点可以有零个或多个子节点。子节点又有自己的子节点，以此类推，形成一个层级结构。在这个问题中，我们面对的是一个通用的树形结构，每个节点包含 `id` 和 `children` 属性，`children` 是一个数组，表示其子节点。
*   **路径查找**：给定一个目标ID，我们需要从根节点开始，沿着正确的路径向下遍历，直到找到目标ID所在的节点，并返回从根节点到该目标节点的完整路径（即所有祖先节点的ID和目标节点自身的ID）。
*   **为什么会出现这个技术需求或问题**：在前端开发中，树形结构非常常见，例如文件系统、组织架构、评论回复、组件嵌套关系、菜单导航等。从树形结构中查找特定项或其路径是常见的操作，例如在文件浏览器中查找文件路径，或者在组件树中定位某个组件的层级。因此，掌握树形结构的遍历和查找算法是前端开发者的必备技能。

**1.2 核心用法 + 示例代码**
解决这类问题最常用的方法是深度优先搜索（DFS），可以使用递归来实现。

**算法思路：**
1.  定义一个递归函数，接收当前节点、目标ID和当前路径作为参数。
2.  将当前节点的 `id` 添加到当前路径中。
3.  如果当前节点的 `id` 等于目标ID，则说明找到了，返回当前路径。
4.  如果当前节点有子节点（`children` 不为 `null` 且不为空数组），则遍历每个子节点，递归调用自身。
5.  如果在遍历子节点的过程中找到了目标ID，则直接返回结果。
6.  如果当前节点的所有子节点都遍历完了，但没有找到目标ID，则说明目标ID不在当前路径下，需要将当前节点从路径中移除（回溯），然后返回 `null` 或空数组。

**示例代码：**
```javascript
const tree = {
  id: 1,
  children: [
    {
      id: 2,
      children: [
        { id: 4, children: [] }
      ],
    },
    {
      id: 3,
      children: null
    }
  ]
};

/**
 * 查找树形结构中指定ID的节点路径
 * @param {object} node 当前遍历到的节点
 * @param {number} targetId 目标节点的ID
 * @param {array} path 当前路径数组
 * @returns {array|null} 如果找到，返回路径数组；否则返回null
 */
function findPathInTree(node, targetId, path = []) {
  if (!node) {
    return null;
  }

  // 将当前节点ID添加到路径中
  path.push(node.id);

  // 如果当前节点就是目标节点
  if (node.id === targetId) {
    return path;
  }

  // 遍历子节点
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const result = findPathInTree(child, targetId, path); // 递归调用，并传递当前路径
      if (result) {
        return result; // 如果子节点找到了，直接返回结果
      }
    }
  }

  // 如果当前节点及其所有子节点都没有找到目标ID，回溯：将当前节点从路径中移除
  path.pop();
  return null; // 未找到
}

// 测试用例
console.log('输入4，输出:', findPathInTree(tree, 4)); // [1, 2, 4]
console.log('输入3，输出:', findPathInTree(tree, 3)); // [1, 3]
console.log('输入5，输出:', findPathInTree(tree, 5)); // null (根据题目要求，输出[])

// 为了符合题目输出[]的要求，可以再封装一层
function getPath(treeData, targetId) {
  const result = findPathInTree(treeData, targetId);
  return result === null ? [] : result;
}

console.log('输入4，输出:', getPath(tree, 4)); // [1, 2, 4]
console.log('输入3，输出:', getPath(tree, 3)); // [1, 3]
console.log('输入5，输出:', getPath(tree, 5)); // []

```

**方案优势**：
*   **通用性**：该递归方法适用于任意深度的树形结构。
*   **可读性**：递归方式通常比迭代方式（使用栈或队列）更直观，更接近树的自然定义。
*   **效率**：时间复杂度为 `O(N)`，其中 N 是树中节点的总数，因为每个节点最多被访问一次。空间复杂度在最坏情况下（树是链状的）为 `O(H)`，其中 H 是树的高度，因为递归栈的深度与树的高度成正比。

**1.3 常见误区或面试陷阱**
*   **不理解递归的"回溯"**：在递归遍历中，如果当前路径没有找到目标，需要通过 `path.pop()` 来"回溯"，撤销当前节点对路径的影响，以便探索其他分支。忘记回溯是常见错误，会导致路径不正确。
*   **边界条件处理不当**：例如，树为空、节点没有子节点（`children` 为 `null` 或空数组）、目标ID不存在等情况，需要进行适当的判断和处理。
*   **性能考量**：对于非常深的树，递归可能会导致栈溢出。在这种情况下，可以考虑使用迭代（栈）的方式来实现DFS，或者使用广度优先搜索（BFS，使用队列）来实现路径查找。
*   **修改原始路径数组**：在递归调用时，如果直接传递同一个 `path` 数组而不进行复制（例如 `[...path, node.id]`），可能会导致不同分支之间的路径相互影响。虽然在上述示例中通过 `path.push` 和 `path.pop` 配合递归调用实现了正确的回溯，但在某些场景下，传递拷贝会更安全。
*   **混淆DFS和BFS**：虽然两种方法都能找到节点，但DFS（深度优先）通常用于查找路径，因为它自然地探索一条完整的路径；BFS（广度优先）通常用于查找最短路径或层级遍历。

</details>

## 12. 代码输出题 {#question-subjective-66e722bdf4b0}

```
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}
console.log('start')
async1()
setTimeout(() => {
console.log('timer1')
Promise.resolve().then(function () {
  console.log('promise1')
})
}, 0)

Promise.resolve().then(function () {
console.log('promise2')
})

new Promise(resolve => {
  console.log('Promise3')
  resolve()
}).then(() => {
  console.log('Promise3 then')
})
console.log('end')
```

### 题目要点

1.  **JavaScript事件循环 (Event Loop)**：考察对JavaScript运行时核心机制事件循环的理解，包括宏任务（MacroTask）和微任务（MicroTask）的执行顺序。
2.  **异步编程**：深入理解 `async/await`、`Promise` 和 `setTimeout` 等异步操作的工作原理以及它们在事件循环中的优先级。
3.  **代码执行顺序**：综合分析同步代码、异步代码以及不同类型的异步任务在事件循环中的调度和执行顺序。

<details>
<summary>参考答案</summary>

**1.1 原理说明**
*   **JavaScript是单线程的**：JavaScript引擎在执行代码时是单线程的，这意味着在任何给定的时间点，只能执行一个任务。为了处理耗时操作（如网络请求、定时器等）而不阻塞主线程，JavaScript引入了异步编程和事件循环机制。
*   **事件循环 (Event Loop)**：事件循环是JavaScript运行时环境（如浏览器或Node.js）的一个核心组件，它负责管理和调度同步任务和异步任务。它的工作流程是不断检查调用栈是否为空，如果为空，就从任务队列中取出任务放到调用栈中执行。
*   **宏任务 (MacroTask) 和 微任务 (MicroTask)**：异步任务被分为两类：
    *   **宏任务**：包括 `script`（整体代码）、`setTimeout`、`setInterval`、`setImmediate` (Node.js)、I/O、UI渲染等。每次事件循环只会执行一个宏任务。
    *   **微任务**：包括 `Promise` 的 `then/catch/finally` 回调、`MutationObserver`、`process.nextTick` (Node.js)、`async/await` 中的 `await` 后续代码等。在每个宏任务执行完毕后，当前宏任务的所有微任务会立即执行完毕，然后才会执行下一个宏任务。
*   **`async/await`**：`async` 函数返回一个 `Promise` 对象。`await` 表达式会暂停 `async` 函数的执行，直到 `Promise` 解决（resolved）或拒绝（rejected）。`await` 后面的代码会被推入微任务队列。
*   **`Promise`**：`Promise` 是处理异步操作的对象。它的 `then()`、`catch()` 和 `finally()` 方法的回调函数会被推入微任务队列。
*   **`setTimeout`**：`setTimeout` 的回调函数会被推入宏任务队列。
*   **执行顺序优先级**：同步任务 > 微任务 > 宏任务。
    一个完整的事件循环过程简述：
    1.  执行主线程的同步代码。
    2.  当遇到异步任务时，将其推入对应的任务队列（宏任务队列或微任务队列）。
    3.  同步代码执行完毕，检查微任务队列。如果微任务队列不为空，则清空微任务队列（依次执行所有微任务）。
    4.  微任务队列清空后，从宏任务队列中取出一个宏任务执行。
    5.  宏任务执行完毕后，再次检查微任务队列，重复步骤3和4，直到所有任务执行完毕。

**1.2 核心用法 + 示例代码分析**
给定代码：
```javascript
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}
console.log('start')
async1()
setTimeout(() => {
console.log('timer1')
Promise.resolve().then(function () {
  console.log('promise1')
})
}, 0)

Promise.resolve().then(function () {
console.log('promise2')
})

new Promise(resolve => {
  console.log('Promise3')
  resolve()
}).then(() => {
  console.log('Promise3 then')
})
console.log('end')
```

**执行步骤分析：**
1.  **同步代码执行阶段**：
    *   `console.log('start')`：直接输出 `start`。
        *   **输出: `start`**
    *   `async1()` 调用：
        *   进入 `async1` 函数，执行 `console.log('async1 start')`。
            *   **输出: `async1 start`**
        *   遇到 `await async2()`：
            *   执行 `async2()` 函数，立即输出 `async2`。
                *   **输出: `async2`**
            *   `await` 会暂停 `async1` 的执行，并将 `console.log('async1 end')` 及其后续代码作为微任务推入微任务队列。
    *   `setTimeout(() => { ... }, 0)`：`setTimeout` 是宏任务，将其回调函数推入宏任务队列。
    *   `Promise.resolve().then(function () { console.log('promise2') })`：`Promise.resolve()` 立即解决，其 `then` 回调作为微任务推入微任务队列。
    *   `new Promise(resolve => { console.log('Promise3'); resolve() }).then(() => { ... })`：
        *   `new Promise` 构造函数中的代码是同步执行的，立即输出 `Promise3`。
            *   **输出: `Promise3`**
        *   `resolve()` 使得 Promise 状态变为解决（resolved）。其 `then` 回调作为微任务推入微任务队列。
    *   `console.log('end')`：直接输出 `end`。
        *   **输出: `end`**

    **至此，主线程同步代码执行完毕，当前输出为：`start async1 start async2 Promise3 end`**

2.  **第一次微任务队列清空阶段**：
    当前微任务队列中有三个任务，按照加入顺序执行：
    *   `async1` 中 `await` 后面的 `console.log('async1 end')`。
        *   **输出: `async1 end`**
    *   第一个 `Promise.resolve().then(...)` 的回调 `console.log('promise2')`。
        *   **输出: `promise2`**
    *   第二个 `new Promise(...).then(...)` 的回调 `console.log('Promise3 then')`。
        *   **输出: `Promise3 then`**

    **至此，微任务队列清空，当前输出为：`start async1 start async2 Promise3 end async1 end promise2 Promise3 then`**

3.  **第一次宏任务队列执行阶段**：
    从宏任务队列中取出第一个（也是唯一一个）`setTimeout` 的回调函数执行：
    *   执行 `console.log('timer1')`。
        *   **输出: `timer1`**
    *   `Promise.resolve().then(function () { console.log('promise1') })`：其 `then` 回调作为微任务推入微任务队列。

4.  **第二次微任务队列清空阶段**：
    当前微任务队列中只有一个任务：`setTimeout` 中 `Promise.resolve().then(...)` 的回调 `console.log('promise1')`。
    *   **输出: `promise1`**

    **至此，所有任务执行完毕。**

**最终输出顺序：**
```
start
async1 start
async2
Promise3
end
async1 end
promise2
Promise3 then
timer1
promise1
```

**1.3 常见误区或面试陷阱**
*   **混淆 `async/await` 的执行时机**：很多人会错误地认为 `await` 后面的代码会立即执行，或者直接进入宏任务。实际上，`await` 会将后续代码作为微任务处理。
*   **`Promise` 构造函数和 `then` 回调的区别**：`new Promise` 构造函数中的代码是同步执行的，而 `then/catch/finally` 中的回调函数是微任务。
*   **`setTimeout` 和 `Promise` 的优先级**：牢记微任务（`Promise.then`，`async/await` 的后续）优先级高于宏任务（`setTimeout`）。这意味着在一个宏任务执行完毕后，所有排队的微任务会先于下一个宏任务执行。
*   **多次 `Promise.resolve().then()` 的顺序**：即使 `Promise.resolve()` 是同步解决的，它的 `then` 回调仍然是微任务，并按照加入队列的顺序执行。
*   **对事件循环的整体流程缺乏把握**：如果不能清晰地画出事件循环的图示（调用栈、宏任务队列、微任务队列），就很难正确分析复杂代码的输出。理解一个宏任务 -> 清空所有微任务 -> 下一个宏任务的循环是关键。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-68/_index.md" >}}) · 已是最后一轮 →
