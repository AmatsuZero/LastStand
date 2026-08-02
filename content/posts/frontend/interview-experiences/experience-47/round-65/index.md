+++
title = "百度-百度云-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/47"
experienceId = 47
roundId = 65
roundOrder = 1
company = "百度"
date = "2025-07-24T15:06:51.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-47/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-66/index.md" >}}) →

**本轮要点：** 本轮面试注重基础知识的掌握与表达，涵盖了前端语言、框架原理、计算机基础、网络协议、数据库设计、加密安全等内容，兼顾技术深度与广度。

本轮共 16 道题。答案默认折叠，便于先自行作答。

## 1. 面向对象和面向程序设计的主要区别 {#question-subjective-d5f454c4c77e}

### 题目要点

面向过程以过程为中心，强调顺序执行逻辑，适合小型程序；

<details>
<summary>参考答案</summary>

* 面向过程以过程为中心，强调顺序执行逻辑，适合小型程序；
* 面向对象以对象和行为抽象为中心，强调封装、继承、多态，适合复杂系统的可维护性与复用性设计。

</details>

## 2. 面向对象的三大特性 {#question-subjective-1e59a267c882}

### 题目要点

封装隐藏内部实现、继承提高复用性、多态通过统一接口实现行为差异，三者是构建大型系统的基础。

<details>
<summary>参考答案</summary>

封装隐藏内部实现、继承提高复用性、多态通过统一接口实现行为差异，三者是构建大型系统的基础。

</details>

## 3. 开发的过程中你用到过哪些设计模式？ {#question-252664a5-1524-46f0-b6ae-ae7e2874f6e2}

> 题库原题：[开发的过程中你用到过哪些设计模式？](https://fe.ecool.fun/topic/252664a5-1524-46f0-b6ae-ae7e2874f6e2)

### 题目要点

设计模式是一种被广泛接受并经过验证的面向对象软件开发中的最佳实践。它们提供了一套解决常见问题的可重用设计方案。

<details>
<summary>参考答案</summary>

设计模式是一种被广泛接受并经过验证的面向对象软件开发中的最佳实践。它们提供了一套解决常见问题的可重用设计方案。

以下是一些常用的设计模式：

1. **单例模式（Singleton）**：确保一个类只有一个实例，并提供全局访问点来获取该实例。

2. **工厂模式（Factory）**：通过工厂方法创建对象，而不是直接使用`new`操作符。这样可以隐藏具体实现，并根据需要创建所需类型的对象。

3. **观察者模式（Observer）**：定义了一种一对多的依赖关系，当一个对象状态发生改变时，它的所有依赖者（观察者）都会收到通知并自动更新。

4. **装饰器模式（Decorator）**：动态地将责任附加到对象上。通过将对象包装在装饰器对象中，可以在运行时为对象添加新的行为。

5. **策略模式（Strategy）**：定义了一系列算法，将每个算法封装起来并使它们可以相互替换。策略模式可以让算法独立于客户端而变化。

6. **适配器模式（Adapter）**：将一个类的接口转换成客户端所期望的另一个接口。适配器模式使得原本由于接口不匹配而无法一起工作的类可以协同工作。

每个设计模式都有其特定的应用场景和优缺点，可以根据具体情况来选择使用。设计模式可以提高代码结构的灵活性、可维护性和可扩展性，并促进重用和解耦。然而，需要根据实际需求慎重选择和应用设计模式，避免过度设计或不必要的复杂性。

</details>

## 4. JavaScript 中引用数据类型和基本数据类型 {#question-subjective-6e24fdf44b3a}

### 题目要点

基本类型包括 Number、String 等，按值传递；引用类型如 Object、Array 按地址传递，赋值为浅拷贝。

<details>
<summary>参考答案</summary>

基本类型包括 Number、String 等，按值传递；引用类型如 Object、Array 按地址传递，赋值为浅拷贝。

</details>

## 5. 谈谈对Vue中双向绑定的理解 {#question-da1881cc-64b9-40f8-8a25-a6256c1349ed}

> 题库原题：[谈谈对Vue中双向绑定的理解](https://fe.ecool.fun/topic/da1881cc-64b9-40f8-8a25-a6256c1349ed)

### 题目要点

Vue中的双向绑定是其核心特性之一，它极大地简化了数据在视图（View）和模型（Model）之间的同步过程。双向绑定意味着当数据发生变化时，视图会自动更新以反映这些变化，反之亦然，用户在视图上的操作（如输入）也会自动更新到数据中。

#### 实现原理

Vue的双向绑定主要依赖于其响应式系统（Reactivity System）和模板引擎（Template Engine）。

1. **响应式系统**：Vue使用Object.defineProperty（在Vue 3中使用了Proxy）来劫持（或说“代理”）对象的getter和setter。当组件的data中的属性被访问或修改时，Vue会拦截这些操作，并执行相应的依赖更新逻辑。这样，Vue就能追踪到数据的变化，并在需要时更新视图。

2. **模板引擎**：Vue的模板引擎使用基于HTML的模板语法，允许开发者声明式地将DOM绑定到底层Vue实例的数据上。当数据变化时，Vue的模板引擎会重新渲染模板，生成新的虚拟DOM树，并通过高效的DOM diff算法更新真实的DOM，以反映数据的最新状态。

<details>
<summary>参考答案</summary>

## 一、什么是双向绑定

我们先从单向绑定切入单向绑定非常简单，就是把`Model`绑定到`View`，当我们用`JavaScript`代码更新`Model`时，`View`就会自动更新双向绑定就很容易联想到了，在单向绑定的基础上，用户更新了`View`，`Model`的数据也自动被更新了，这种情况就是双向绑定举个栗子

 ![](https://static.ecool.fun//article/129e9076-eae0-4f4c-87e5-3330cbb35e23.png)

当用户填写表单时，`View`的状态就被更新了，如果此时可以自动更新`Model`的状态，那就相当于我们把`Model`和`View`做了双向绑定关系图如下

 ![](https://static.ecool.fun//article/042320e1-1cc9-4439-ac9d-bf6a7ababccf.png)

## 二、双向绑定的原理是什么

我们都知道 `Vue` 是数据双向绑定的框架，双向绑定由三个重要部分构成

- 数据层（Model）：应用的数据及业务逻辑
- 视图层（View）：应用的展示效果，各类UI组件
- 业务逻辑层（ViewModel）：框架封装的核心，它负责将数据与视图关联起来

而上面的这个分层的架构方案，可以用一个专业术语进行称呼：`MVVM`这里的控制层的核心功能便是 “数据双向绑定” 。自然，我们只需弄懂它是什么，便可以进一步了解数据绑定的原理

### 理解ViewModel

它的主要职责就是：

- 数据变化后更新视图
- 视图变化后更新数据

当然，它还有两个主要部分组成

- 监听器（Observer）：对所有数据的属性进行监听
- 解析器（Compiler）：对每个元素节点的指令进行扫描跟解析,根据指令模板替换数据,以及绑定相应的更新函数

### 三、实现双向绑定

我们还是以`Vue`为例，先来看看`Vue`中的双向绑定流程是什么的

1.  `new Vue()`首先执行初始化，对`data`执行响应化处理，这个过程发生`Observe`中
2.  同时对模板执行编译，找到其中动态绑定的数据，从`data`中获取并初始化视图，这个过程发生在`Compile`中
3.  同时定义⼀个更新函数和`Watcher`，将来对应数据变化时`Watcher`会调用更新函数
4.  由于`data`的某个`key`在⼀个视图中可能出现多次，所以每个`key`都需要⼀个管家`Dep`来管理多个`Watcher`
5.  将来data中数据⼀旦发生变化，会首先找到对应的`Dep`，通知所有`Watcher`执行更新函数

流程图如下：

 ![](https://static.ecool.fun//article/7e2d907a-e80d-4e00-ab72-4f829010bd47.png)

### 实现

先来一个构造函数：执行初始化，对`data`执行响应化处理

```js
class Vue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
      
    // 对data选项做响应式处理
    observe(this.$data);
      
    // 代理data到vm上
    proxy(this);
      
    // 执行编译
    new Compile(options.el, this);
  }
}
```

对`data`选项执行响应化具体操作

```js
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }
  new Observer(obj);
}

class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value);
  }
  walk(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}
```

#### 编译`Compile`

对每个元素节点的指令进行扫描跟解析,根据指令模板替换数据,以及绑定相应的更新函数

 ![](https://static.ecool.fun//article/81fac2e4-25a8-4a51-adff-143803d0099a.png)

```
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);  // 获取dom
    if (this.$el) {
      this.compile(this.$el);
    }
  }
  compile(el) {
    const childNodes = el.childNodes; 
    Array.from(childNodes).forEach((node) => { // 遍历子元素
      if (this.isElement(node)) {   // 判断是否为节点
        console.log("编译元素" + node.nodeName);
      } else if (this.isInterpolation(node)) {
        console.log("编译插值⽂本" + node.textContent);  // 判断是否为插值文本 {{}}
      }
      if (node.childNodes && node.childNodes.length > 0) {  // 判断是否有子元素
        this.compile(node);  // 对子元素进行递归遍历
      }
    });
  }
  isElement(node) {
    return node.nodeType == 1;
  }
  isInterpolation(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}

```

#### 依赖收集

视图中会用到`data`中某`key`，这称为依赖。同⼀个`key`可能出现多次，每次都需要收集出来用⼀个`Watcher`来维护它们，此过程称为依赖收集多个`Watcher`需要⼀个`Dep`来管理，需要更新时由`Dep`统⼀通知

 ![](https://static.ecool.fun//article/7a337c07-fe16-4da1-ba47-28c28a4a61c6.png)

实现思路

 1. `defineReactive`时为每⼀个`key`创建⼀个`Dep`实例
 2. 初始化视图时读取某个`key`，例如`name1`，创建⼀个`watcher1`
 3. 由于触发`name1`的`getter`方法，便将`watcher1`添加到`name1`对应的Dep中
 4. 当`name1`更新，`setter`触发时，便可通过对应`Dep`通知其管理所有`Watcher`更新

```js
// 负责更新视图
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updaterFn = updater

    // 创建实例时，把当前实例指定到Dep.target静态属性上
    Dep.target = this
    // 读一下key，触发get
    vm[key]
    // 置空
    Dep.target = null
  }

  // 未来执行dom更新函数，由dep调用的
  update() {
    this.updaterFn.call(this.vm, this.vm[this.key])
  }
}
```

声明`Dep`

```js
class Dep {
  constructor() {
    this.deps = [];  // 依赖管理
  }
  addDep(dep) {
    this.deps.push(dep);
  }
  notify() { 
    this.deps.forEach((dep) => dep.update());
  }
}
```

创建`watcher`时触发`getter`

```js
class Watcher {
  constructor(vm, key, updateFn) {
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
}

```

依赖收集，创建`Dep`实例

```js
function defineReactive(obj, key, val) {
  this.observe(val);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addDep(Dep.target);// Dep.target也就是Watcher实例
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      dep.notify(); // 通知dep执行更新方法
    },
  });
}
```

</details>

## 6. 进程与线程有什么区别？ {#question-6c221f8f-6a86-45f9-8141-59c21388c073}

> 题库原题：[进程与线程有什么区别？](https://fe.ecool.fun/topic/6c221f8f-6a86-45f9-8141-59c21388c073)

### 题目要点

进程是系统进行资源分配和调度的一个独立单位

<details>
<summary>参考答案</summary>

* 进程是系统进行资源分配和调度的一个独立单位
* 线程是CPU调度和分派的基本单位，它是比进程更小的能独立运行的基本单位
* 一个进程至少由一个线程组成。

线程自己基本上不拥有系统资源,只拥有一点在运行中必不可少的资源(如程序计数器,一组寄存器和栈)，但是它可与同属一个进程的其他的线程共享进程所拥有的全部资源。

</details>

## 7. 介绍你知道的一些数据结构 {#question-e00b6fcb-fb55-435f-ac74-687734871111}

> 题库原题：[介绍你知道的一些数据结构](https://fe.ecool.fun/topic/e00b6fcb-fb55-435f-ac74-687734871111)

### 题目要点

栈：一种特殊串联形式的抽象数据类型，可由链表或数组实现，通过链表或数组的栈顶（Top）指针对数据进行压栈（Push）和出栈（Pop）操作，其特点是LIFO。

<details>
<summary>参考答案</summary>

* 栈：一种特殊串联形式的抽象数据类型，可由链表或数组实现，通过链表或数组的栈顶（Top）指针对数据进行压栈（Push）和出栈（Pop）操作，其特点是LIFO。

* 队列：先进先出（FIFO）的线性表，一般用链表和数组来实现，只允许在后端（back or rear）插入，在前端（front）删除。

* 数组：由相同元素的集合所组成的数据结构，存储在一块连续的内存单元，根据元素的索引可以计算出该元素对应的存储地址。

* 链表：由一连串节点组成，每个节点包含任意的实例数据和一个或两个用来指向下一个/上一个节点位置的链接。

* 树：实现抽象数据类型的数据结构，如：二叉树、霍夫曼树。

* 图：表示物件与物件之间的关系，图论的基本研究对象。

* 堆：是计算机科学中一种特别的树状数据结构，也是一种特殊的二叉树。

* 散列表：根据键（key）直接访问内存存储位置的一种数据结构，通过计算一个关于键值的函数，将所需查询的数据映射到表中的一个位置来访问记录，映射函数叫做散列函数，存放记录的数组叫散列表（散列函数和哈希冲突是实现散列表最重要的两个环节）。

</details>

## 8. 前端对于密码加密常用哪些方法？ {#question-subjective-320f95283d15}

### 题目要点

前端常使用 SHA 哈希加密（不可逆）、AES 对称加密、RSA 非对称加密用于密钥传输，配合 HTTPS 加密传输安全数据。

<details>
<summary>参考答案</summary>

前端常使用 SHA 哈希加密（不可逆）、AES 对称加密、RSA 非对称加密用于密钥传输，配合 HTTPS 加密传输安全数据。

</details>

## 9. 后端设置 cookie 的操作方式有哪些？ {#question-subjective-2396f57c4730}

### 题目要点

后端通过 `Set-Cookie` 设置 Cookie，可配置 HttpOnly、Secure、SameSite、Path、Expires 等属性。

<details>
<summary>参考答案</summary>

后端通过 `Set-Cookie` 设置 Cookie，可配置 HttpOnly、Secure、SameSite、Path、Expires 等属性。

</details>

## 10. HTTP 请求头有哪些设置，数据的格式又有哪些？ {#question-subjective-2961c7300504}

### 题目要点

常见头包括 Authorization、Accept、Content-Type 等；常见格式为 JSON、form-urlencoded、multipart。

<details>
<summary>参考答案</summary>

常见头包括 Authorization、Accept、Content-Type 等；常见格式为 JSON、form-urlencoded、multipart。

</details>

## 11. 重载和重写的主要区别是什么？ {#question-subjective-5798d177de3b}

### 题目要点

重载是同名不同参（JS 不支持），重写是子类覆盖父类方法。

<details>
<summary>参考答案</summary>

重载是同名不同参（JS 不支持），重写是子类覆盖父类方法。

</details>

## 12. 数据库设计的三大范式分别是什么？ {#question-subjective-8b6f9291b149}

### 题目要点

1NF 保证原子性，2NF 消除部分依赖，3NF 消除传递依赖；有助于降低冗余，提升一致性。

<details>
<summary>参考答案</summary>

1NF 保证原子性，2NF 消除部分依赖，3NF 消除传递依赖；有助于降低冗余，提升一致性。

</details>

## 13. 简述 OSI 的七层模型 {#question-subjective-50220fe6f4ac}

### 题目要点

应用、表示、会话、传输、网络、数据链路、物理层；分别解决不同抽象层级的通信问题。

<details>
<summary>参考答案</summary>

应用、表示、会话、传输、网络、数据链路、物理层；分别解决不同抽象层级的通信问题。

</details>

## 14. HTTPS 加密算法和加解密过程是啥？ {#question-88f3b671-5906-4aa8-9f68-8df711d582f3}

> 题库原题：[HTTPS 加密算法和加解密过程是啥？](https://fe.ecool.fun/topic/88f3b671-5906-4aa8-9f68-8df711d582f3)

### 题目要点

HTTPS 通过结合非对称加密和对称加密来确保通信的安全。非对称加密用于握手过程中的身份验证和密钥交换，而对称加密则用于实际的数据传输。哈希算法用于确保数据的完整性。这个加解密过程确保了数据在客户端和服务器之间的安全传输。

<details>
<summary>参考答案</summary>

HTTPS 使用 SSL/TLS 协议来加密传输的数据，确保数据的机密性和完整性。HTTPS 的加解密过程主要包括以下几个步骤和算法：

### **1. 加密算法和密钥类型**

- **对称加密算法**：使用相同的密钥进行加密和解密。常见的对称加密算法包括 AES（Advanced Encryption Standard）和 3DES（Triple Data Encryption Standard）。
- **非对称加密算法**：使用一对密钥（公钥和私钥），公钥用于加密，私钥用于解密。常见的非对称加密算法包括 RSA（Rivest-Shamir-Adleman）和 ECC（Elliptic Curve Cryptography）。
- **哈希算法**：用于生成数据的摘要，以确保数据完整性。常见的哈希算法包括 SHA-256（Secure Hash Algorithm 256-bit）和 MD5（Message Digest Algorithm 5，虽然 MD5 不再安全）。

### **2. SSL/TLS 握手过程**

#### **握手阶段**

1. **客户端发起连接**
   - 客户端发送一个 “ClientHello” 消息，包含客户端支持的 TLS 版本、加密套件（加密算法组合）、压缩方法和其他信息。

2. **服务器响应**
   - 服务器回应一个 “ServerHello” 消息，选择客户端支持的加密套件和 TLS 版本。
   - 服务器发送其数字证书给客户端。数字证书包含服务器的公钥，由证书颁发机构（CA）签名。

3. **证书验证**
   - 客户端验证服务器的数字证书的有效性和真实性。如果证书有效，客户端继续执行。
   - 客户端生成一个随机的“pre-master secret”并用服务器的公钥加密，然后发送给服务器。这个“pre-master secret”将在后续的步骤中用于生成对称加密密钥。

4. **密钥交换**
   - 服务器使用其私钥解密“pre-master secret”并生成一个对称加密密钥（session key）。
   - 客户端和服务器使用“pre-master secret”生成相同的对称加密密钥（session key），用于加密后续的通信数据。

5. **完成握手**
   - 双方用对称加密密钥加密并交换“Finished”消息，表示握手过程完成。
   - 从这一点开始，客户端和服务器使用对称加密密钥加密和解密数据。

### **3. 数据加密和传输**

- **对称加密**：客户端和服务器使用之前生成的对称加密密钥来加密和解密数据。对称加密算法确保数据在传输过程中是机密的。
- **数据完整性**：除了加密，TLS 还使用消息认证码（MAC）来确保数据在传输过程中没有被篡改。常见的 MAC 算法包括 HMAC（Hash-based Message Authentication Code）。

### **4. 连接关闭**

- **优雅关闭**：当通信完成时，客户端和服务器通过发送“close_notify”消息来优雅地关闭连接，确保所有的数据都被正确传输。

### **常见的加密套件**

在 TLS 握手过程中，客户端和服务器会协商一个加密套件（cipher suite），这是一个加密算法的组合。常见的加密套件包括：

- **TLS_AES_128_GCM_SHA256**：使用 AES 进行对称加密，GCM（Galois/Counter Mode）用于加密模式，SHA-256 用于消息认证。
- **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384**：使用 ECDHE（Elliptic Curve Diffie-Hellman Ephemeral）进行密钥交换，RSA 进行身份验证，AES-256-GCM 进行对称加密，SHA-384 进行消息认证。

</details>

## 15. 说一说 TCP/IP 和 HTTP 之间的关系 {#question-subjective-f17b69df0d41}

### 题目要点

HTTP 基于 TCP，运行在应用层，依赖 TCP 提供可靠的传输通道。

<details>
<summary>参考答案</summary>

HTTP 基于 TCP，运行在应用层，依赖 TCP 提供可靠的传输通道。

</details>

## 16. 算法题：最大连续子数组和 {#question-subjective-5ac6bb2398c0}

给定一个整数数组 nums ，请你找出该数组中最大连续子数组的和。一个子数组是数组的一个连续非空子序列。

例如，对于数组 [−2,1,−3,4,−1,2,1,−5,4]，其最大连续子数组的和为 6对应的，子数组为 [4,−1,2,1]。

请写出一个函数来实现该算法，并说明其时间复杂度。

### 题目要点

* 关键在于动态规划的思想：**以当前位置结尾的最大和，要么继承前一个子数组，要么重新开始**。
* Kadane 算法保证了线性时间内得到结果，是最

<details>
<summary>参考答案</summary>

这是一个经典的算法题，即 **最大子数组和问题（Maximum Subarray Problem）**，通常使用 **Kadane’s Algorithm** 来解决。

### 思路

1. 遍历数组时，用一个变量 `currentSum` 表示**以当前位置结尾的最大子数组和**。
2. 每次迭代时，比较 `nums[i]` 与 `currentSum + nums[i]`，选择较大者作为新的 `currentSum`。

   * 如果前面的和是负数，舍弃，直接从当前元素重新开始。
3. 同时维护一个全局最大值 `maxSum`，记录遍历过程中的最大子数组和。

### 实现代码（JavaScript 示例）

```javascript
function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}
```

### 时间复杂度与空间复杂度

* **时间复杂度：O(n)**
  只需一次遍历，每个元素只处理一次。
* **空间复杂度：O(1)**
  只用到常数个变量，不需要额外数组。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-47/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-47/round-66/index.md" >}}) →
