+++
title = "京东-技术中台-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "京东", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/27"
experienceId = 27
roundId = 30
roundOrder = 1
company = "京东"
date = "2025-06-27T05:48:05.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-27/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-27/round-31/index.md" >}}) →

**本轮要点：** 本次面试深度考察JavaScript核心原理（闭包、继承实现）、前端框架（Vue响应式机制、虚拟DOM性能、Vue vs React区别）、性能优化（高并发请求处理、HTTP/2应用）、前端安全（XSS/CSRF防御）。难点聚焦于Vue响应式系统限制的解决（如动态字段更新）、复杂布局实现（自适应流式），以及高效算法设计（O(n)去重）。

本轮共 14 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍 {#question-subjective-12b75c445924}

### 题目要点

个人背景、能力、经验。

<details>
<summary>参考答案</summary>

我叫[姓名]，毕业于[学校]，专业是[专业]。我有[X]年的前端开发经验，熟练掌握HTML、CSS、JavaScript等前端技术，熟悉Vue.js和React框架。在项目中，我注重代码质量和用户体验，善于解决复杂的技术问题。我曾参与过多个大型项目的开发，例如[项目名称]，负责[具体工作]，通过优化代码结构和性能，提升了页面加载速度和用户体验。

</details>

## 2. 怎么学习javascript的？讲一下闭包，自己的使用场景 {#question-subjective-48a8fe6d93f0}

### 题目要点

JavaScript学习方法、闭包概念及应用。

<details>
<summary>参考答案</summary>

学习JavaScript时，我首先从基础语法入手，通过阅读经典书籍如《JavaScript高级程序设计》来系统地学习。闭包是JavaScript中的一个重要概念，它允许函数记住并访问其创建时所在的作用域链中的变量。闭包的使用场景很多，比如在事件处理中，可以使用闭包来保存事件相关的数据。例如，创建一个计数器函数，每次调用时返回当前的计数值，利用闭包可以保持计数器的状态。

</details>

## 3. Javascript如何实现继承？ {#question-21144fa1-41b7-4077-97cd-b0c6030b10e0}

> 题库原题：[Javascript如何实现继承？](https://fe.ecool.fun/topic/21144fa1-41b7-4077-97cd-b0c6030b10e0)

### 题目要点

## 1. 原型链继承

通过将一个构造函数的实例作为另一个构造函数的原型，实现属性和方法的继承。

### 特点

- 简单易实现。
- 缺点是父类实例的属性会被所有子类实例共享。

## 2. 借用构造函数（经典继承）

通过在子类构造函数中调用父类构造函数，实现属性的继承。

### 特点

- 避免了原型链继承共享属性的问题。
- 但无法继承父类的原型方法。

## 3. 组合继承（原型链+借用构造函数）

结合原型链继承和借用构造函数的方法，既调用父类构造函数，又将父类原型赋值给子类原型。

### 特点

- 可以继承实例属性和原型方法。
- 需要注意避免构造函数属性的多次调用。

## 4. 原型式继承

使用一个函数来创建一个新对象，并将这个新对象的原型指向另一个对象。

### 特点

- 适用于对象之间的属性继承，不涉及构造函数。

## 5. 寄生式继承

基于原型式继承，但添加了额外的包装函数，以提供更好的控制和灵活性。

### 特点

- 通过创建对象的副本来实现继承，避免修改原始对象。

## 6. ES6 类继承

使用`class`关键字和`extends`关键字实现继承。

### 特点

- 语法简洁，易于理解。
- 底层仍然是基于原型链实现。

<details>
<summary>参考答案</summary>

## 一、是什么

继承（inheritance）是面向对象软件技术当中的一个概念。

如果一个类别B“继承自”另一个类别A，就把这个B称为“A的子类”，而把A称为“B的父类别”也可以称“A是B的超类”

- 继承的优点

继承可以使得子类具有父类别的各种属性和方法，而不需要再次编写相同的代码

在子类别继承父类别的同时，可以重新定义某些属性，并重写某些方法，即覆盖父类别的原有属性和方法，使其获得与父类别不同的功能

虽然`JavaScript`并不是真正的面向对象语言，但它天生的灵活性，使应用场景更加丰富

关于继承，我们举个形象的例子：

定义一个类（Class）叫汽车，汽车的属性包括颜色、轮胎、品牌、速度、排气量等

```js
class Car{
    constructor(color,speed){
        this.color = color
        this.speed = speed
        // ...
    }
}
```

由汽车这个类可以派生出“轿车”和“货车”两个类，在汽车的基础属性上，为轿车添加一个后备厢、给货车添加一个大货箱

```js
// 货车
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.Container = true // 货箱
    }
}
```

这样轿车和货车就是不一样的，但是二者都属于汽车这个类，汽车、轿车继承了汽车的属性，而不需要再次在“轿车”中定义汽车已经有的属性

在“轿车”继承“汽车”的同时，也可以重新定义汽车的某些属性，并重写或覆盖某些属性和方法，使其获得与“汽车”这个父类不同的属性和方法

```js
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.color = "black" //覆盖
        this.Container = true // 货箱
    }
}
```

从这个例子中就能详细说明汽车、轿车以及卡车之间的继承关系

## 二、实现方式

下面给出`JavaScript`常见的继承方式：

- 原型链继承

- 构造函数继承（借助 call）
- 组合继承
- 原型式继承
- 寄生式继承
- 寄生组合式继承

### 原型链继承

原型链继承是比较常见的继承方式之一，其中涉及的构造函数、原型和实例，三者之间存在着一定的关系，即每一个构造函数都有一个原型对象，原型对象又包含一个指向构造函数的指针，而实例则包含一个原型对象的指针

举个例子

```js
 function Parent() {
    this.name = 'parent1';
    this.play = [1, 2, 3]
  }
  function Child() {
    this.type = 'child2';
  }
  Child1.prototype = new Parent();
  console.log(new Child())
```

上面代码看似没问题，实际存在潜在问题

```js
var s1 = new Child2();
var s2 = new Child2();
s1.play.push(4);
console.log(s1.play, s2.play); // [1,2,3,4]
```

改变`s1`的`play`属性，会发现`s2`也跟着发生变化了，这是因为两个实例使用的是同一个原型对象，内存空间是共享的

### 构造函数继承

借助 `call `调用`Parent`函数

```js
function Parent1(){
    this.name = 'parent1';
}

Parent.prototype.getName = function () {
    return this.name;
}

function Child(){
    Parent1.call(this);
    this.type = 'child'
}

let child = new Child();
console.log(child);  // 没问题
console.log(child.getName());  // 会报错
```

可以看到，父类原型对象中一旦存在父类之前自己定义的方法，那么子类将无法继承这些方法

相比第一种原型链继承方式，父类的引用属性不会被共享，优化了第一种继承方式的弊端，但是只能继承父类的实例属性和方法，不能继承原型属性或者方法

### 组合继承

前面我们讲到两种继承方式，各有优缺点。组合继承则将前两种方式继承起来

```js
function Parent3 () {
    this.name = 'parent3';
    this.play = [1, 2, 3];
}

Parent3.prototype.getName = function () {
    return this.name;
}
function Child3() {
    // 第二次调用 Parent3()
    Parent3.call(this);
    this.type = 'child3';
}

// 第一次调用 Parent3()
Child3.prototype = new Parent3();
// 手动挂上构造器，指向自己的构造函数
Child3.prototype.constructor = Child3;
var s3 = new Child3();
var s4 = new Child3();
s3.play.push(4);
console.log(s3.play, s4.play);  // 不互相影响
console.log(s3.getName()); // 正常输出'parent3'
console.log(s4.getName()); // 正常输出'parent3'
```

这种方式看起来就没什么问题，方式一和方式二的问题都解决了，但是从上面代码我们也可以看到` Parent3` 执行了两次，造成了多构造一次的性能开销

### 原型式继承

这里主要借助`Object.create`方法实现普通对象的继承

同样举个例子

```js
let parent4 = {
    name: "parent4",
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };

  let person4 = Object.create(parent4);
  person4.name = "tom";
  person4.friends.push("jerry");

  let person5 = Object.create(parent4);
  person5.friends.push("lucy");

  console.log(person4.name); // tom
  console.log(person4.name === person4.getName()); // true
  console.log(person5.name); // parent4
  console.log(person4.friends); // ["p1", "p2", "p3","jerry","lucy"]
  console.log(person5.friends); // ["p1", "p2", "p3","jerry","lucy"]
```

这种继承方式的缺点也很明显，因为`Object.create `方法实现的是浅拷贝，多个实例的引用类型属性指向相同的内存，存在篡改的可能

### 寄生式继承

寄生式继承在上面继承基础上进行优化，利用这个浅拷贝的能力再进行增强，添加一些方法

```js
let parent5 = {
    name: "parent5",
    friends: ["p1", "p2", "p3"],
    getName: function() {
        return this.name;
    }
};

function clone(original) {
    let clone = Object.create(original);
    clone.getFriends = function() {
        return this.friends;
    };
    return clone;
}

let person5 = clone(parent5);

console.log(person5.getName()); // parent5
console.log(person5.getFriends()); // ["p1", "p2", "p3"]
```

其优缺点也很明显，跟上面讲的原型式继承一样

### 寄生组合式继承

寄生组合式继承，借助解决普通对象的继承问题的` Object.create` 方法，在亲全面几种继承方式的优缺点基础上进行改造，这也是所有继承方式里面相对最优的继承方式

```js
function clone (parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
}
Parent6.prototype.getName = function () {
    return this.name;
}
function Child6() {
    Parent6.call(this);
    this.friends = 'child5';
}

clone(Parent6, Child6);

Child6.prototype.getFriends = function () {
    return this.friends;
}

let person6 = new Child6();
console.log(person6); //{friends:"child5",name:"parent6",play:[1,2,3],__proto__:Parent6}
console.log(person6.getName()); // parent6
console.log(person6.getFriends()); // child5
```

可以看到 person6 打印出来的结果，属性都得到了继承，方法也没问题

文章一开头，我们是使用`ES6` 中的`extends `关键字直接实现 `JavaScript `的继承

```js
class Person {
  constructor(name) {
    this.name = name
  }
  // 原型方法
  // 即 Person.prototype.getName = function() { }
  // 下面可以简写为 getName() {...}
  getName = function () {
    console.log('Person:', this.name)
  }
}
class Gamer extends Person {
  constructor(name, age) {
    // 子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    super(name)
    this.age = age
  }
}
const asuna = new Gamer('Asuna', 20)
asuna.getName() // 成功访问到父类的方法
```

利用`babel`工具进行转换，我们会发现`extends`实际采用的也是寄生组合继承方式，因此也证明了这种方式是较优的解决继承的方式

## 三、总结

下面以一张图作为总结：

 ![](https://static.ecool.fun//article/c15679e3-2c26-4aef-a14f-8d6a68179bce.png)

通过`Object.create` 来划分不同的继承方式，最后的寄生式组合继承方式是通过组合继承改造之后的最优继承方式，而 `extends` 的语法糖和寄生组合继承的方式基本类似

</details>

## 4. 京东，天猫的商品页面有很多的并发请求，应该怎么优化 {#question-subjective-e0e7086fac9e}

### 题目要点

前端性能优化。

<details>
<summary>参考答案</summary>

优化并发请求的方法包括：

    1. 合并请求：将多个小请求合并为一个大请求，减少HTTP请求的数量。
    2. 使用HTTP/2：利用HTTP/2的多路复用特性，减少连接的开销。
    3. 缓存策略：合理设置缓存，减少重复请求。
    4. 懒加载：对于非关键资源，如图片等，采用懒加载的方式，按需加载。
    5. 服务端渲染：使用SSR技术，减少客户端的渲染压力。

</details>

## 5. 讲一下对http2的了解，如果要在http层面对页面优化，有哪些手段 {#question-subjective-ab4ac55f18d0}

### 题目要点

HTTP/2协议及优化手段。

<details>
<summary>参考答案</summary>

HTTP/2是HTTP协议的升级版本，主要特性包括：

    1. 多路复用：允许多个请求共享同一个TCP连接，减少连接开销。
    2. 二进制分帧：将HTTP消息分解为多个二进制帧，提高传输效率。
    3. 头部压缩：通过HPACK算法压缩HTTP头部，减少传输数据量。
    4. 服务器推送：服务器可以主动推送资源到客户端，减少客户端的请求延迟。

在HTTP层面优化页面的方法包括：

    5. 启用HTTP/2：确保服务器和客户端都支持HTTP/2。
    6. 优化资源加载顺序：将关键资源优先加载。
    7. 使用CDN：通过CDN加速静态资源的加载。

</details>

## 6. 前端的常规安全策略 {#question-f1de93ec-d1c8-48b0-98a9-bf256dfe2df0}

> 题库原题：[前端的常规安全策略](https://fe.ecool.fun/topic/f1de93ec-d1c8-48b0-98a9-bf256dfe2df0)

### 题目要点

<p><strong>答题要点：</strong></p><p></p><p><strong>1、防止跨站脚本攻击（XSS）</strong>：</p><ul><ul><li>使用<code>HttpOnly</code>属性保护Cookies，防止Cookies被JavaScript访问。</li><li>对输入数据进行验证和清洗，避免恶意代码注入。</li><li>使用<code>Content Security Policy</code>（CSP）来限制可以加载和执行的资源。</li></ul></ul><p><strong>2、防止跨站请求伪造（CSRF）</strong>：</p><ul><ul><li>在请求中添加CSRF令牌，确保每个请求都包含验证信息。</li><li>验证请求的来源，确保请求来自可信的域。</li></ul></ul><p><strong>3、数据验证和清洗</strong>：</p><ul><ul><li>对用户输入进行验证，防止SQL注入、命令注入等攻击。</li><li>清洗输入数据，去除可能包含恶意代码的字符。</li></ul></ul><p></p><p><strong>4、安全编码实践</strong>：</p><ul><ul><li>使用安全的编程实践，避免常见的编程错误和安全漏洞。</li><li>避免使用已知的漏洞代码库和框架。</li></ul></ul><p><strong>5、HTTPS的使用</strong>：</p><ul><ul><li>使用HTTPS协议加密数据传输，保护数据不被中间人攻击。</li><li>对敏感数据使用TLS/SSL加密</li></ul></ul><p></p><p></p><p></p>

<details>
<summary>参考答案</summary>

<p></p><ul><li><span><span><span><span>定期请第三方机构做安全性测试，漏洞扫描</span></span></span></span></li><li><span><span><span><span>使用第三方开源库做上线前的安全测试，可以考虑融合到CI中</span></span></span></span></li><li><span><span><span><span>code review 保证代码质量</span></span></span></span></li><li><span><span><span><span>默认项目中设置对应的 Header 请求头，如 X-XSS-Protection、 X-Content-Type-Options 、X-Frame-Options Header、Content-Security-Policy 等等</span></span></span></span></li><li><span><span><span><span>对第三方包和库做检测：NSP(Node Security Platform)，Snyk</span></span></span></span></li></ul><p></p>

</details>

## 7. 开发的过程中你用到过哪些设计模式？ {#question-252664a5-1524-46f0-b6ae-ae7e2874f6e2}

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

## 8. React 和 Vue 在技术层面有哪些区别？ {#question-a97eb340-1a7f-4456-aff3-a187d9570421}

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

## 9. 说说 vue3 中的响应式设计原理 {#question-ea676360-c8f5-4ce4-bc66-5c3e4f7eddb6}

> 题库原题：[说说 vue3 中的响应式设计原理](https://fe.ecool.fun/topic/ea676360-c8f5-4ce4-bc66-5c3e4f7eddb6)

### 题目要点

Vue 3 的响应式系统通过使用 Proxy 和 Reflect API，以及引入 activeEffect 和 ref 方法，实现了对数据变化的自动追踪和更新。

Vue 3 的响应式系统主要包括以下几个核心概念：

1. **Proxy**：使用 Proxy 对象来拦截对象的读取和修改操作，通过定义 get 和 set 方法来实现对数据变化的自动追踪。
2. **Reflect**：通过 Reflect API 来实现对对象属性的读取和修改操作，提供了与 `Object.defineProperty` 类似的功能，但更加强大和灵活。
3. **activeEffect**：一个全局变量，用于保存当前正在执行的 effect 函数，以便在追踪依赖时使用。
4. **ref**：将普通值转换为响应式可变的 ref 对象，其值可以通过 `.value` 属性访问和修改。

<details>
<summary>参考答案</summary>

Vue 3 中的响应式原理可谓是非常之重要，通过学习 Vue3 的响应式原理，不仅能让我们学习到 Vue.js 的一些设计模式和思想，还能**帮助我们提高项目开发效率和代码调试能力**。<br>

## 一、Vue 3 响应式使用

### 1. Vue 3 中的使用

当我们在学习 Vue 3 的时候，可以通过一个简单示例，看看什么是 Vue 3 中的响应式：

```html
<!-- HTML 内容 -->
<div id="app">
    <div>Price: {{price}}</div>
    <div>Total: {{price * quantity}}</div>
    <div>getTotal: {{getTotal}}</div>
</div>
```

```javascript
const app = Vue.createApp({ // ① 创建 APP 实例
    data() {
        return {
            price: 10,
            quantity: 2
        }
    },
    computed: {
        getTotal() {
            return this.price * this.quantity * 1.1
        }
    }
})
app.mount('#app')  // ② 挂载 APP 实例
```

通过创建 APP 实例和挂载 APP 实例即可，这时可以看到页面中分别显示对应数值：
![image.png](https://static.ecool.fun//article/614ad328-3096-4f32-bbb7-8373f950ed1d.jpeg)

当我们修改 `price` 或 `quantity` 值的时候，页面上引用它们的地方，内容也能正常展示变化后的结果。这时，我们会好奇为何数据发生变化后，相关的数据也会跟着变化，那么我们接着往下看。

### 2. 实现单个值的响应式

在普通 JS 代码执行中，并不会有响应式变化，比如在控制台执行下面代码：

```javascript
let price = 10, quantity = 2;
const total = price * quantity;
console.log(`total: ${total}`); // total: 20
price = 20;
console.log(`total: ${total}`); // total: 20
```

从这可以看出，在修改 `price` 变量的值后， `total` 的值并没有发生改变。

那么如何修改上面代码，让 `total` 能够自动更新呢？我们其实可以将修改 `total` 值的方法保存起来，等到与 `total` 值相关的变量（如 `price` 或 `quantity` 变量的值）发生变化时，触发该方法，更新 `total` 即可。我们可以这么实现：

```javascript
let price = 10, quantity = 2, total = 0;
const dep = new Set(); // ①
const effect = () => { total = price * quantity };
const track = () => { dep.add(effect) };  // ②
const trigger = () => { dep.forEach( effect => effect() )};  // ③

track();
console.log(`total: ${total}`); // total: 0
trigger();
console.log(`total: ${total}`); // total: 20
price = 20;
trigger();
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `Set` 类型的 `dep` 变量，用来存放需要执行的副作用（ `effect` 函数），这边是修改 `total` 值的方法；

② 创建 `track()` 函数，用来将需要执行的副作用保存到 `dep` 变量中（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行 `dep` 变量中的所有副作用；

在每次修改 `price` 或 `quantity` 后，调用 `trigger()` 函数执行所有副作用后， `total` 值将自动更新为最新值。
![image.png](https://static.ecool.fun//article/098e3ad6-2db4-440a-b0a6-7e20c36479c1.jpeg)

（图片来源：Vue Mastery）

### 3. 实现单个对象的响应式

通常，**我们的对象具有多个属性，并且每个属性都需要自己的 `dep`。我们如何存储这些？比如：**

```javascript
let product = { price: 10, quantity: 2 };
```

从前面介绍我们知道，我们将所有副作用保存在一个 `Set` 集合中，而该集合不会有重复项，这里我们引入一个 `Map` 类型集合（即 `depsMap` ），其 `key` 为对象的属性（如： `price` 属性）， `value` 为前面保存副作用的 `Set` 集合（如： `dep` 对象），大致结构如下图：

![image.png](https://static.ecool.fun//article/a658efdb-5daa-45ef-bcce-6647bc29021e.jpeg)
（图片来源：Vue Mastery）

实现代码：

```javascript
let product = { price: 10, quantity: 2 }, total = 0;
const depsMap = new Map(); // ①
const effect = () => { total = product.price * product.quantity };
const track = key => {     // ②
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = key => {  // ③
  let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

track('price');
console.log(`total: ${total}`); // total: 0
effect();
console.log(`total: ${total}`); // total: 20
product.price = 20;
trigger('price');
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `Map` 类型的 `depsMap` 变量，用来保存每个需要响应式变化的对象属性（`key` 为对象的属性， `value` 为前面 `Set` 集合）；

② 创建 `track()` 函数，用来将需要执行的副作用保存到 `depsMap` 变量中对应的对象属性下（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行 `dep` 变量中指定对象属性的所有副作用；

这样就实现监听对象的响应式变化，在 `product` 对象中的属性值发生变化， `total` 值也会跟着更新。

### 4. 实现多个对象的响应式

如果我们有多个响应式数据，比如同时需要观察对象 `a` 和对象 `b`  的数据，那么又要如何跟踪每个响应变化的对象？

这里我们引入一个 [WeakMap 类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)的对象，将需要观察的对象作为 `key` ，值为前面用来保存对象属性的 Map 变量。代码如下：

```javascript
let product = { price: 10, quantity: 2 }, total = 0;
const targetMap = new WeakMap();     // ① 初始化 targetMap，保存观察对象
const effect = () => { total = product.price * product.quantity };
const track = (target, key) => {     // ② 收集依赖
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = (target, key) => {  // ③ 执行指定对象的指定属性的所有副作用
  const depsMap = targetMap.get(target);
  if(!depsMap) return;
    let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

track(product, 'price');
console.log(`total: ${total}`); // total: 0
effect();
console.log(`total: ${total}`); // total: 20
product.price = 20;
trigger(product, 'price');
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `WeakMap` 类型的 `targetMap` 变量，用来要观察每个响应式对象；

② 创建 `track()` 函数，用来将需要执行的副作用保存到指定对象（ `target` ）的依赖中（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行指定对象（ `target` ）中指定属性（ `key` ）的所有副作用；

这样就实现监听对象的响应式变化，在 `product` 对象中的属性值发生变化， `total` 值也会跟着更新。

大致流程如下图：

![image.png](https://static.ecool.fun//article/4ca05d1f-3d74-4d3a-a716-1a54bc6c7ac4.jpeg)
（图片来源：Vue Mastery）

## 二、Proxy 和 Reflect

在上一节内容中，介绍了如何在数据发生变化后，自动更新数据，但存在的问题是，每次需要手动通过触发 `track()` 函数搜集依赖，通过 `trigger()` 函数执行所有副作用，达到数据更新目的。

这一节将来解决这个问题，实现这两个函数自动调用。

### 1. 如何实现自动操作

这里我们引入 JS 对象访问器的概念，解决办法如下：

- 在读取（GET 操作）数据时，自动执行 `track()` 函数自动收集依赖；
- 在修改（SET 操作）数据时，自动执行 `trigger()` 函数执行所有副作用；

那么如何拦截 GET 和 SET 操作？接下来看看 Vue2 和 Vue3 是如何实现的：

- 在 Vue2 中，使用 ES5 的 [`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 函数实现；
- 在 Vue3 中，使用 ES6 的 [`Proxy`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 和 [`Reflect`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect) API 实现；

需要注意的是：Vue3 使用的 `Proxy` 和 `Reflect` API 并不支持 IE。

[`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 函数这边就不多做介绍，可以阅读文档，下文将主要介绍 [`Proxy`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 和 [`Reflect`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect) API。

### 2. 如何使用 Reflect

通常我们有三种方法读取一个对象的属性：

1. 使用 `.` 操作符：`leo.name` ；
2. 使用 `[]` ： `leo['name']` ；
3. 使用 `Reflect` API： `Reflect.get(leo, 'name')` 。

这三种方式输出结果相同。

### 3. 如何使用 Proxy

Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。语法如下：

```javascript
const p = new Proxy(target, handler)
```

参数如下：

- target : 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler : 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为。

我们通过官方文档，体验一下 [Proxy API](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)：

```javascript
let product = { price: 10, quantity: 2 };
let proxiedProduct = new Proxy(product, {
    get(target, key){
      console.log('正在读取的数据：',key);
    return target[key];
  }
})
console.log(proxiedProduct.price);
// 正在读取的数据： price
// 10
```

这样就保证我们每次在读取 `proxiedProduct.price` 都会执行到其中代理的 get 处理函数。其过程如下：

![image.png](https://static.ecool.fun//article/c65b6a63-6e61-44e0-a56f-04c4eb63bf3e.jpeg)
（图片来源：Vue Mastery）

然后结合 Reflect 使用，只需修改 get 函数：

```javascript
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
    return Reflect.get(target, key, receiver);
  }
```

输出结果还是一样。

接下来增加 set 函数，来拦截对象的修改操作：

```javascript
let product = { price: 10, quantity: 2 };
let proxiedProduct = new Proxy(product, {
  get(target, key, receiver){
    console.log('正在读取的数据：',key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver){
    console.log('正在修改的数据：', key, ',值为：', value);
    return Reflect.set(target, key, value, receiver);
  }
})
proxiedProduct.price = 20;
console.log(proxiedProduct.price);
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 20
```

这样便完成 get 和 set 函数来拦截对象的读取和修改的操作。为了方便对比 Vue 3 源码，我们将上面代码抽象一层，使它看起来更像 Vue3 源码：

```javascript
function reactive(target){
  const handler = {  // ① 封装统一处理函数对象
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver){
      console.log('正在修改的数据：', key, ',值为：', value);
      return Reflect.set(target, key, value, receiver);
    }
  }

  return new Proxy(target, handler); // ② 统一调用 Proxy API
}

let product = reactive({price: 10, quantity: 2}); // ③ 将对象转换为响应式对象
product.price = 20;
console.log(product.price);
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 20
```

这样输出结果仍然不变。

### 4. 修改 track 和 trigger 函数

通过上面代码，我们已经实现一个简单 `reactive()` 函数，用来**将普通对象转换为响应式对象**。但是还缺少自动执行 `track()` 函数和 `trigger()` 函数，接下来修改上面代码：

```javascript
const targetMap = new WeakMap();
let total = 0;
const effect = () => { total = product.price * product.quantity };
const track = (target, key) => {
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if(!depsMap) return;
    let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

const reactive = (target) => {
  const handler = {
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
      const result = Reflect.get(target, key, receiver);
      track(target, key);  // 自动调用 track 方法收集依赖
      return result;
    },
    set(target, key, value, receiver){
      console.log('正在修改的数据：', key, ',值为：', value);
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if(oldValue != result){
         trigger(target, key);  // 自动调用 trigger 方法执行依赖
      }
      return result;
    }
  }

  return new Proxy(target, handler);
}

let product = reactive({price: 10, quantity: 2});
effect();
console.log(total);
product.price = 20;
console.log(total);
// 正在读取的数据： price
// 正在读取的数据： quantity
// 20
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 正在读取的数据： quantity
// 40
```

![image.png](https://static.ecool.fun//article/2a941233-fd37-4967-8ce3-3c14746580e2.jpeg)
（图片来源：Vue Mastery）

## 三、activeEffect 和 ref

在上一节代码中，还存在一个问题： `track` 函数中的依赖（ `effect` 函数）是外部定义的，当依赖发生变化， `track` 函数收集依赖时都要手动修改其依赖的方法名。

比如现在的依赖为 `foo` 函数，就要修改 `track` 函数的逻辑，可能是这样：

```javascript
const foo = () => { /**/ };
const track = (target, key) => {     // ②
  // ...
  dep.add(foo);
}
```

那么如何解决这个问题呢？

### 1. 引入 activeEffect 变量

接下来引入 `activeEffect` 变量，来保存当前运行的 effect 函数。

```javascript
let activeEffect = null;
const effect = eff => {
  activeEffect = eff; // 1. 将 eff 函数赋值给 activeEffect
  activeEffect();     // 2. 执行 activeEffect
  activeEffect = null;// 3. 重置 activeEffect
}
```

然后在 `track` 函数中将 `activeEffect` 变量作为依赖：

```javascript
const track = (target, key) => {
    if (activeEffect) {  // 1. 判断当前是否有 activeEffect
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);  // 2. 添加 activeEffect 依赖
    }
}
```

使用方式修改为：

```javascript
effect(() => {
    total = product.price * product.quantity
});
```

这样就可以解决手动修改依赖的问题，这也是 Vue3 解决该问题的方法。完善一下测试代码后，如下：

```javascript
const targetMap = new WeakMap();
let activeEffect = null; // 引入 activeEffect 变量

const effect = eff => {
  activeEffect = eff; // 1. 将副作用赋值给 activeEffect
  activeEffect();     // 2. 执行 activeEffect
  activeEffect = null;// 3. 重置 activeEffect
}

const track = (target, key) => {
    if (activeEffect) {  // 1. 判断当前是否有 activeEffect
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);  // 2. 添加 activeEffect 依赖
    }
}

const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    let dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => effect());
    }
};

const reactive = (target) => {
    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue != result) {
                trigger(target, key);
            }
            return result;
        }
    }

    return new Proxy(target, handler);
}

let product = reactive({ price: 10, quantity: 2 });
let total = 0, salePrice = 0;
// 修改 effect 使用方式，将副作用作为参数传给 effect 方法
effect(() => {
    total = product.price * product.quantity
});
effect(() => {
    salePrice = product.price * 0.9
});
console.log(total, salePrice);  // 20 9
product.quantity = 5;
console.log(total, salePrice);  // 50 9
product.price = 20;
console.log(total, salePrice);  // 100 18
```

思考一下，如果把第一个 `effect` 函数中 `product.price` 换成 `salePrice` 会如何：

```javascript
effect(() => {
    total = salePrice * product.quantity
});
effect(() => {
    salePrice = product.price * 0.9
});
console.log(total, salePrice);  // 0 9
product.quantity = 5;
console.log(total, salePrice);  // 45 9
product.price = 20;
console.log(total, salePrice);  // 45 18
```

得到的结果完全不同，因为 `salePrice` 并不是响应式变化，而是需要调用第二个 `effect` 函数才会变化，也就是 `product.price` 变量值发生变化。

> 代码地址：
> [https://github.com/Code-Pop/vue-3-reactivity/blob/master/05-activeEffect.js](https://github.com/Code-Pop/vue-3-reactivity/blob/master/05-activeEffect.js)

### 2. 引入 ref 方法

熟悉  Vue3 Composition API 的朋友可能会想到 Ref，它接收一个值，并返回一个响应式可变的[ Ref 对象](https://v3.cn.vuejs.org/api/refs-api.html)，其值可以通过 `value` 属性获取。

> ref：接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象具有指向内部值的单个 property .value。

官网的使用示例如下：

```javascript
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```
我们有 2 种方法实现 ref 函数：

1. **使用 `reactive` 函数**

```javascript
const ref = intialValue => reactive({value: intialValue});
```

这样是可以的，虽然 Vue3 不是这么实现。

2. **使用对象的属性访问器（计算属性）**

属性方式包括：[getter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get) 和 [setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set)。

```javascript
const ref = raw => {
  const r = {
    get value(){
      track(r, 'value');
      return raw;
    },

    set value(newVal){
        raw = newVal;
      trigger(r, 'value');
    }
  }
  return r;
}
```

使用方式如下：

```javascript
let product = reactive({ price: 10, quantity: 2 });
let total = 0, salePrice = ref(0);
effect(() => {
    salePrice.value = product.price * 0.9
});
effect(() => {
    total = salePrice.value * product.quantity
});
console.log(total, salePrice.value); // 18 9
product.quantity = 5;
console.log(total, salePrice.value); // 45 9
product.price = 20;
console.log(total, salePrice.value); // 90 18
```

在 Vue3 中 ref 实现的核心也是如此。

> 代码地址：
> [https://github.com/Code-Pop/vue-3-reactivity/blob/master/06-ref.js](https://github.com/Code-Pop/vue-3-reactivity/blob/master/06-ref.js)

## 四、实现简易 Computed 方法

用过 Vue 的同学可能会好奇，上面的 `salePrice` 和 `total` 变量为什么不使用 `computed` 方法呢？

没错，这个可以的，接下来一起实现个简单的 `computed` 方法。

```javascript
const computed = getter => {
    let result = ref();
    effect(() => result.value = getter());
    return result;
}

let product = reactive({ price: 10, quantity: 2 });
let salePrice = computed(() => {
    return product.price * 0.9;
})
let total = computed(() => {
    return salePrice.value * product.quantity;
})

console.log(total.value, salePrice.value);
product.quantity = 5;
console.log(total.value, salePrice.value);
product.price = 20;
console.log(total.value, salePrice.value);
```

这里我们将一个函数作为参数传入 `computed` 方法，`computed` 方法内通过 `ref` 方法构建一个 ref 对象，然后通过 `effct` 方法，将 `getter` 方法返回值作为 `computed` 方法的返回值。

这样我们实现了个简单的 `computed` 方法，执行效果和前面一样。

## 五、源码学习建议

### 1. 构建 reactivity.cjs.js

这一节介绍如何去从[ Vue 3 仓库](https://github.com/vuejs/vue-next)打包一个 Reactivity 包来学习和使用。

准备流程如下：

1. 从[ Vue 3 仓库](https://github.com/vuejs/vue-next)下载最新 Vue3 源码；

```bash
git clone https://github.com/vuejs/vue-next.git
```

2. 安装依赖：

```bash
yarn install
```

3. 构建 Reactivity 代码：

```bash
yarn build reactivity
```

4. 复制 reactivity.cjs.js 到你的学习 demo 目录：

上一步构建完的内容，会保存在 `packages/reactivity/dist`目录下，我们只要在自己的学习 demo 中引入该目录的  reactivity.cjs.js  文件即可。

5. 学习 demo 中引入：

```javascript
const { reactive, computed, effect } = require("./reactivity.cjs.js");
```

### 2. Vue3 Reactivity 文件目录

在源码的 `packages/reactivity/src`目录下，有以下几个主要文件：

1. effect.ts：用来定义 `effect` / `track` / `trigger` ；
1. baseHandlers.ts：定义 Proxy 处理器（ get 和 set）；
1. reactive.ts：定义 `reactive` 方法并创建 ES6 Proxy；
1. ref.ts：定义 reactive 的 ref 使用的对象访问器；
1. computed.ts：定义计算属性的方法；

![image.png](https://static.ecool.fun//article/53093dcc-fa06-464a-bb7c-72242bd868b0.jpeg)
（图片来源：Vue Mastery）

</details>

## 10. 虚拟dom为什么会快，一直都很快么 {#question-subjective-235b59b9f1fe}

### 题目要点

虚拟DOM的原理及性能。

<details>
<summary>参考答案</summary>

虚拟DOM快的原因在于它通过比较前后两个DOM树的差异，只更新有变化的部分，减少了直接操作DOM的开销。然而，虚拟DOM并不总是快的，如果DOM树非常庞大，比较过程会变得很耗时。因此，在实际应用中，需要合理使用虚拟DOM，避免不必要的DOM操作。

</details>

## 11. 表单组件需要支持运行时新增字段，Vue2中直接this.form.newField = value为何无法触发更新？如何解决？ {#question-subjective-efaf738025bf}

### 题目要点

Vue响应式系统的局限性及解决方案。

<details>
<summary>参考答案</summary>

在Vue 2中，直接给对象添加新属性不会触发响应式更新，因为`Object.defineProperty`无法检测到新属性的添加。解决方法是使用`Vue.set`方法，例如：

```javascript
this.$set(this.form, 'newField', value);
```

这样可以确保新属性是响应式的。

</details>

## 12. SEO是什么？ {#question-2aa4ec3d-020c-4c2e-9147-53707afb2d4e}

> 题库原题：[SEO是什么？](https://fe.ecool.fun/topic/2aa4ec3d-020c-4c2e-9147-53707afb2d4e)

### 题目要点

SEO（Search Engine Optimization），汉译为搜索引擎优化。

<details>
<summary>参考答案</summary>

SEO（Search Engine Optimization），汉译为搜索引擎优化。

搜索引擎优化是一种利用搜索引擎的搜索规则来提高目前网站在有关搜索引擎内的自然排名的方式。

SEO是指为了从搜索引擎中获得更多的免费流量，从网站结构、内容建设方案、用户互动传播、页面等角度进行合理规划，使网站更适合搜索引擎的索引原则的行为。

</details>

## 13. 京东商品详情页的多规格按钮如何实现自适应流式布局 {#question-subjective-e7e782cd76bf}

### 题目要点

CSS布局技巧。

<details>
<summary>参考答案</summary>

可以使用CSS的`flexbox`布局来实现自适应流式布局。例如：

```css
.container {
  display: flex;
  flex-wrap: wrap;
}
.button {
  flex: 1 1 auto;
  margin: 5px;
}
```

这样，按钮会根据容器的宽度自动调整大小和排列方式。

</details>

## 14. 实现O(n)时间复杂度的数组去重 {#question-subjective-5d44c1d15aaa}

### 题目要点

数组去重算法。

<details>
<summary>参考答案</summary>

可以使用`Set`数据结构实现O(n)时间复杂度的数组去重：

```javascript
function uniqueArray(arr) {
  return [...new Set(arr)];
}
console.log(uniqueArray([1, 2, 2, 3, 4, 4, 5])); // [1, 2, 3, 4, 5]
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-27/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-27/round-31/index.md" >}}) →
