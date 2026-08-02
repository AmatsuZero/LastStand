+++
title = "阿里-阿里妈妈-实习 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/33"
experienceId = 33
roundId = 41
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T06:04:12.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-33/round-40/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-33/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 9 道题。答案默认折叠，便于先自行作答。

## 1. Flex布局中flex-grow与flex-shrink的计算规则？ {#question-subjective-1398dd08a3be}

### 题目要点

CSS布局。

<details>
<summary>参考答案</summary>

在Flex布局中，`flex-grow`和`flex-shrink`属性用于控制子元素在可用空间内的扩展和收缩行为。它们的计算规则如下：

1. `flex-grow`：
    1. 定义：定义项目的扩展比例，即项目在主轴方向上可占有的额外空间的比例。
    2. 计算规则：剩余空间按项目`flex-grow`值的比例分配。如果所有项目的`flex-grow`值之和大于1，则按比例分配；如果小于1，则先分配剩余空间。
    3. 示例：如果有两个子元素，`flex-grow`分别为1和2，总剩余空间为300px，则第一个子元素获得100px，第二个获得200px。
2. `flex-shrink`：
    1. 定义：定义项目的收缩比例，即项目在主轴方向上需要收缩时的比例。
    2. 计算规则：当总项目大小超过容器可用空间时，项目按`flex-shrink`值的比例收缩。收缩的最小尺寸受`min-width`或`min-height`限制。
    3. 示例：如果有两个子元素，`flex-shrink`分别为1和2，总超出行空间为100px，则第一个子元素收缩约33.33px，第二个收缩约66.66px。
3. 完整计算步骤：
    1. 计算总可用空间：容器主轴长度减去所有项目初始尺寸（`flex-basis`或未设置时的内容尺寸）。
    2. 判断剩余空间：
        1. 若剩余空间为正，按`flex-grow`分配扩展空间。
        2. 若剩余空间为负，按`flex-shrink`分配收缩空间。
    3. 计算比例：每个项目的比例为`flex-grow`或`flex-shrink`值除以所有项目对应值之和。
    4. 分配空间：按比例将剩余空间分配或从项目中扣除。
4. `flex`属性：`flex`是`flex-grow`、`flex-shrink`和`flex-basis`的简写形式。例如，`flex: 1 1 0`表示`flex-grow: 1`、`flex-shrink: 1`、`flex-basis: 0`。这在等比例分配剩余空间时非常有用。

</details>

## 2. 讲一下js闭包 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

> 题库原题：[说说你对闭包的理解，以及闭包使用场景](https://fe.ecool.fun/topic/e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848)

### 题目要点

# 什么是闭包

简单理解就是函数中嵌套函数。我们都知道局部变量我们是无法访问的，但是通过闭包可以做到。

```js
// 正常访问
var lan = 'zh';
function hello(){
  var name = '前端未来';
}
console.log(name)//很明显'undefined'

// 换成闭包
function hello(){
    var name = '前端未来';
    function demo(){
      console.log(name)//打印：前端未来
    }
}
```

# 闭包的应用场景

## 1. 数据封装和隐私

闭包可以用来封装数据和功能，创建具有私有变量和公共接口的模块。

### 应用

- 创建具有私有状态的模块或对象。

## 2. 函数工厂

闭包用于创建返回函数的函数，这些返回的函数可以维持状态。

### 应用

- 生成具有特定配置或状态的函数。

## 3. 柯里化（Currying）

闭包允许将多参数的函数转换成一系列单参数的函数。

### 应用

- 简化函数调用，逐步应用参数。

## 4. 延迟计算

闭包可以用于延迟计算，只在必要时才执行计算。

### 应用

- 实现性能优化，如懒加载。

## 5. 迭代器和生成器

闭包在迭代器和生成器中用于维护状态。

### 应用

- 实现可重复使用的迭代器。

## 6. 异步编程

闭包在异步回调中保持状态，避免在多层嵌套回调中使用额外的参数。

### 应用

- 管理异步操作的状态和结果。

## 7. 事件处理器

闭包可以捕获事件处理器需要的局部变量。

### 应用

- 为事件绑定具有特定状态的处理器。

## 8. 缓存和记忆

闭包可以用来实现缓存逻辑，存储和复用计算结果。

### 应用

- 减少重复计算，提高性能。

## 注意事项

- 闭包可能会导致内存使用增加，因为它们会保持对外部变量的引用。
- 理解闭包的作用域链对于避免意外的行为和内存泄漏很重要。
- 闭包提供了强大的功能，但应谨慎使用，以保持代码的清晰和可维护性。

<details>
<summary>参考答案</summary>

## 一、是什么

一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）

也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域

在 `JavaScript `中，每当创建一个函数，闭包就会在函数创建的同时被创建出来，作为函数内部与外部连接起来的一座桥梁

下面给出一个简单的例子

```js
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

`displayName()` 没有自己的局部变量。然而，由于闭包的特性，它可以访问到外部函数的变量

## 二、使用场景

任何闭包的使用场景都离不开这两点：

- 创建私有变量
- 延长变量的生命周期

> 一般函数的词法环境在函数返回后就被销毁，但是闭包会保存对创建时所在词法环境的引用，即便创建时所在的执行上下文被销毁，但创建时所在词法环境依然存在，以达到延长变量的生命周期的目的

下面举个例子：

在页面上添加一些可以调整字号的按钮

```js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);

document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```

### 柯里化函数

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用

```js
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

### 使用闭包模拟私有方法

在`JavaScript`中，没有支持声明私有变量，但我们可以使用闭包来模拟私有方法

下面举个例子：

```js
var Counter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
};

var Counter1 = Counter();
var Counter2 = Counter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

上述通过使用闭包来定义公共函数，并令其可以访问私有函数和变量，这种方式也叫模块方式

两个计数器 `Counter1` 和 `Counter2` 是维护它们各自的独立性的，每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境，不会影响另一个闭包中的变量

### 其他

例如计数器、延迟调用、回调等闭包的应用，其核心思想还是创建私有变量和延长变量的生命周期

## 三、注意事项

如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响

例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。

原因在于每个对象的创建，方法都会被重新赋值

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

</details>

## 3. HTTP强缓存与协商缓存的实现机制及响应头字段 {#question-7f7e5941-1079-476a-8a62-8ca51879c7ab}

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

## 4. 实现深拷贝函数，需处理循环引用与特殊对象（如Date） {#question-subjective-d82908fcb8b6}

### 题目要点

JavaScript编程。

<details>
<summary>参考答案</summary>

深拷贝函数需要处理对象、数组、基本数据类型、特殊对象（如`Date`、`RegExp`、`Map`、`Set`）以及循环引用。以下是实现代码及详细解释：

```javascript
function isObject(target) {
    return (typeof target === 'object' || typeof target === 'function') && target !== null;
}

function deepClone(source, hash = new WeakMap()) {
    // 处理循环引用
    if (hash.has(source)) {
        return hash.get(source);
    }

    // 处理基本数据类型和某些特殊对象
    if (!isObject(source)) {
        return source;
    }

    // 处理Date对象
    if (source instanceof Date) {
        const cloneDate = new Date();
        cloneDate.setTime(source.getTime());
        return cloneDate;
    }

    // 处理RegExp对象
    if (source instanceof RegExp) {
        return new RegExp(source);
    }

    // 处理Map对象
    if (source instanceof Map) {
        const cloneMap = new Map();
        for (const [key, value] of source) {
            cloneMap.set(deepClone(key, hash), deepClone(value, hash));
        }
        return cloneMap;
    }

    // 处理Set对象
    if (source instanceof Set) {
        const cloneSet = new Set();
        for (const value of source) {
            cloneSet.add(deepClone(value, hash));
        }
        return cloneSet;
    }

    // 处理普通对象和数组
    const prototype = Array.isArray(source) ? [] : {};
    hash.set(source, prototype);

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            prototype[key] = deepClone(source[key], hash);
        }
    }

    return prototype;
}

// 测试示例
const original = {
    a: 1,
    b: [2, 3],
    c: { d: 4 },
    e: new Date(),
    f: /pattern/g,
    g: new Set([5, 6]),
    h: new Map([['key', 'value']])
};
original.self = original; // 循环引用
const clone = deepClone(original);
console.log(clone);
console.log(clone.e instanceof Date); // true
console.log(clone.f instanceof RegExp); // true
console.log(clone.g instanceof Set); // true
console.log(clone.h instanceof Map); // true
console.log(clone.self === clone); // true（循环引用正确处理）
```

 实现细节：

1. 处理循环引用：通过`WeakMap`记录已拷贝的对象及其对应的拷贝对象，避免无限递归。
2. 处理特殊对象：
    1. `Date`：通过`getTime`方法获取时间戳，创建新的`Date`对象。
    2. `RegExp`：直接构造新的正则表达式对象。
    3. `Map`和`Set`：遍历原对象的键值对或值，递归拷贝并存入新对象。
3. 处理普通对象和数组：通过判断`isArray`属性创建目标对象，并递归拷贝每个属性值。使用`hasOwnProperty`确保只拷贝自身属性。

</details>

## 5. Vue3的Composition API与React Hooks的设计思想对比 {#question-subjective-656929fb9e80}

### 题目要点

前端框架。

<details>
<summary>参考答案</summary>

Vue3的Composition API和React Hooks都旨在解决组件逻辑复用和组织的问题，但它们在设计思想和使用方式上存在一些差异：

1. Vue3 Composition API：
    1. 设计思想：通过函数式编程的方式，将组件的逻辑抽取到可复用的函数中，打破选项式API的限制，允许更灵活的逻辑组合和复用。
    2. 核心特点：
        1. 逻辑复用：通过`setup`函数和组合式API（如`ref`、`reactive`、`computed`、`watch`等）提取逻辑到可复用的函数中。
        2. 组织清晰：相关逻辑可以在`setup`中按功能组织，而不是分散在多个选项中。
        3. 生命周期清晰：提供与选项式API对应的生命周期钩子（如`onMounted`、`onUnmounted`等）。
    3. 示例：

```javascript
import { ref, onMounted } from 'vue';

export default {
    setup() {
        const count = ref(0);
        const increment = () => {
            count.value++;
        };

        onMounted(() => {
            console.log('Component mounted');
        });

        return { count, increment };
    }
};
```

2. React Hooks：
    1. 设计思想：通过自定义Hook函数封装组件逻辑，允许在函数组件中复用状态逻辑，打破类组件的限制。
    2. 核心特点：
        1. 逻辑复用：通过自定义Hook函数提取逻辑，多个组件可以共享相同的状态逻辑。
        2. 组织清晰：相关逻辑可以在自定义Hook中按功能组织，而不是分散在组件的不同部分。
        3. 规则限制：要求Hooks只能在顶层调用，不能在循环、条件或嵌套函数中调用。
    3. 示例：

```javascript
import { useState, useEffect } from 'react';

function useCounter() {
    const [count, setCount] = useState(0);
    const increment = () => {
        setCount(count + 1);
    };

    useEffect(() => {
        console.log('Counter mounted');
    }, []);

    return { count, increment };
}

function Counter() {
    const { count, increment } = useCounter();
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>Increment</button>
        </div>
    );
}
```

3. 对比：
    1. 相似点：
        1. 都允许将组件逻辑提取到可复用的函数中，提高代码复用性。
        2. 都提供了比传统选项式API更灵活的逻辑组织方式。
        3. 都依赖钩子函数实现生命周期管理（Vue的`onMounted`与React的`useEffect`）。
    2. 差异点：
        1. 语法和API风格：Vue的Composition API通过`setup`函数统一管理逻辑，而React Hooks通过自定义函数分散定义Hook。
        2. 状态管理：Vue的响应式系统（`reactive`、`ref`）与React的状态管理（`useState`、`useReducer`）在API设计和使用方式上有所不同。
        3. 生命周期处理：Vue提供了更接近传统生命周期的钩子，而React的`useEffect`更灵活但需要手动处理依赖数组。
        4. 学习曲线：Vue的Composition API对Vue用户来说是自然的扩展，而React Hooks对类组件用户需要一定的学习成本来适应函数组件和Hook规则。
4. 适用场景：
    1. Vue3 Composition API：适用于Vue生态中的项目，特别是需要复杂状态管理和逻辑复用的场景。
    2. React Hooks：适用于React生态中的项目，特别适合希望避免类组件复杂性的开发者。

</details>

## 6. Webpack的Loader与Plugin区别，如何实现一个自定义Loader？ {#question-89eda79c-6cfb-4593-86d3-69d9ce9eb43d}

> 题库原题：[面试官：说说Loader和Plugin的区别？编写Loader，Plugin的思路？](https://fe.ecool.fun/topic/89eda79c-6cfb-4593-86d3-69d9ce9eb43d)

### 题目要点

前面两节我们有提到`Loader`与`Plugin`对应的概念，先来回顾下

<details>
<summary>参考答案</summary>

## 一、区别

前面两节我们有提到`Loader`与`Plugin`对应的概念，先来回顾下

- loader 是文件加载器，能够加载资源文件，并对这些文件进行一些处理，诸如编译、压缩等，最终一起打包到指定的文件中
- plugin 赋予了 webpack 各种灵活的功能，例如打包优化、资源管理、环境变量注入等，目的是解决 loader 无法实现的其他事

从整个运行时机上来看，如下图所示：

![](https://static.ecool.fun//article/28ef0747-02ae-4903-bb2a-7ee56c19ce7d.png)

可以看到，两者在运行时机上的区别：

-  loader 运行在打包文件之前
-  plugins 在整个编译周期都起作用

在` Webpack` 运行的生命周期中会广播出许多事件，`Plugin` 可以监听这些事件，在合适的时机通过` Webpack `提供的 `API `改变输出结果

对于`loader`，实质是一个转换器，将A文件进行编译形成B文件，操作的是文件，比如将`A.scss`或`A.less`转变为`B.css`，单纯的文件转换过程

## 二、编写loader

在编写 `loader` 前，我们首先需要了解 `loader` 的本质

其本质为函数，函数中的 `this` 作为上下文会被 `webpack` 填充，因此我们不能将 `loader`设为一个箭头函数

函数接受一个参数，为 `webpack` 传递给 `loader` 的文件源内容

函数中 `this` 是由 `webpack` 提供的对象，能够获取当前 `loader` 所需要的各种信息

函数中有异步操作或同步操作，异步操作通过 `this.callback` 返回，返回值要求为 `string` 或者 `Buffer`

代码如下所示：

```js
// 导出一个函数，source为webpack传递给loader的文件源内容
module.exports = function(source) {
    const content = doSomeThing2JsString(source);

    // 如果 loader 配置了 options 对象，那么this.query将指向 options
    const options = this.query;

    // 可以用作解析其他模块路径的上下文
    console.log('this.context');

    /*
     * this.callback 参数：
     * error：Error | null，当 loader 出错时向外抛出一个 error
     * content：String | Buffer，经过 loader 编译后需要导出的内容
     * sourceMap：为方便调试生成的编译后内容的 source map
     * ast：本次编译生成的 AST 静态语法树，之后执行的 loader 可以直接使用这个 AST，进而省去重复生成 AST 的过程
     */
    this.callback(null, content); // 异步
    return content; // 同步
}
```

一般在编写`loader`的过程中，保持功能单一，避免做多种功能

如` less `文件转换成 `css `文件也不是一步到位，而是 `less-loader`、`css-loader`、` style-loader `几个 `loader `的链式调用才能完成转换

## 三、编写plugin

由于`webpack`基于发布订阅模式，在运行的生命周期中会广播出许多事件，插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务

在之前也了解过，`webpack`编译会创建两个核心对象：

- compiler：包含了 webpack 环境的所有的配置信息，包括 options，loader 和 plugin，和 webpack 整个生命周期相关的钩子
- compilation：作为 plugin 内置事件回调函数的参数，包含了当前的模块资源、编译生成资源、变化的文件以及被跟踪依赖的状态信息。当检测到一个文件变化，一次新的 Compilation 将被创建

如果自己要实现`plugin`，也需要遵循一定的规范：

- 插件必须是一个函数或者是一个包含 `apply` 方法的对象，这样才能访问`compiler`实例
- 传给每个插件的 `compiler` 和 `compilation` 对象都是同一个引用，因此不建议修改
- 异步的事件需要在插件处理完任务时调用回调函数通知 `Webpack` 进入下一个流程，不然会卡住

实现`plugin`的模板如下：

```js
class MyPlugin {
    // Webpack 会调用 MyPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply (compiler) {
    // 找到合适的事件钩子，实现自己的插件功能
    compiler.hooks.emit.tap('MyPlugin', compilation => {
        // compilation: 当前打包构建流程的上下文
        console.log(compilation);

        // do something...
    })
  }
}
```

在 `emit` 事件发生时，代表源文件的转换和组装已经完成，可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容

</details>

## 7. 在React中，如何避免不必要的子组件重渲染？ {#question-subjective-a5c5253148b0}

### 题目要点

React性能优化。

<details>
<summary>参考答案</summary>

在React中，可以通过以下方式避免不必要的子组件重渲染：

1. `React.memo`：
    1. 定义：`React.memo`是一个高阶组件，用于对函数组件进行记忆化处理，避免在父组件重新渲染时子组件不必要的渲染。
    2. 使用方法：

```javascript
const MemoizedComponent = React.memo(function MyComponent(props) {
// 只有props变化时才会重新渲染
return /* ... */;
});
```

    3. 原理：默认比较浅层相等性，如果`props`未变化，则跳过渲染。
2. `useMemo`：
    1. 定义：`useMemo` Hook用于记忆化计算结果，避免在每次渲染时重复计算。
    2. 使用方法：

```javascript
function MyComponent({ items }) {
    const expensiveCalculation = useMemo(() => {
        return items.map(item => item * 2); // 示例计算
    }, [items]); // 依赖数组
    return /* ... */;
}
```

    3. 原理：只有依赖数组中的值变化时，才会重新计算。
3. `useCallback`：
    1. 定义：`useCallback` Hook用于记忆化函数，避免在每次渲染时创建新的函数引用。
    2. 使用方法：

```javascript
function ParentComponent() {
    const [count, setCount] = useState(0);
    const increment = useCallback(() => {
        setCount(count + 1);
    }, [count]); // 依赖数组
    return <ChildComponent onIncrement={increment} />;
}
```

    3. 原理：只有依赖数组中的值变化时，才会返回新函数。
4. `React.PureComponent`：
    1. 定义：`React.PureComponent`是`Component`的子类，实现了浅层相等性比较的`shouldComponentUpdate`方法。
    2. 使用方法：

```javascript
class MyComponent extends React.PureComponent {
    render() {
        // 只有props或state变化时才会重新渲染
        return /* ... */;
    }
}
```

    3. 原理：通过浅层比较`props`和`state`决定是否更新。
5. 优化父组件渲染：
    1. 使用`shouldComponentUpdate`：手动控制组件更新逻辑，避免不必要的渲染。

```javascript
shouldComponentUpdate(nextProps, nextState) {
    return nextProps.id !== this.props.id || nextState.count !== this.state.count;
}
```

6. 避免频繁的状态更新：

```javascript
setState(prevState => ({
    ...prevState,
    count: prevState.count + 1
}));
```
    1. 合并状态更新：使用对象展开或函数形式的`setState`合并多次更新。
    2. 防抖和节流：对频繁触发的事件（如滚动、输入）进行防抖或节流处理，减少更新频率。

</details>

## 8. 项目中使用微前端架构？参与了多少？落地难点及解决方案讲一下 {#question-subjective-3e9901d0f0fb}

### 题目要点

前端架构。

<details>
<summary>参考答案</summary>

在项目中，我参与了微前端架构的设计和实施，主要负责子应用的开发和部分主应用的集成工作。以下是我在项目中遇到的落地难点及解决方案：

1. 难点1：通信机制复杂：
    1. 问题：微前端架构中，主应用与子应用之间需要高效的通信机制，但不同子应用可能采用不同的技术栈，导致通信接口不一致。
    2. 解决方案：我们设计了一套基于`postMessage`和自定义事件的通信机制，主应用通过`postMessage`向子应用发送消息，子应用通过监听`message`事件接收消息。同时，我们在子应用中封装了通信接口，统一了消息格式和处理逻辑。例如：

```javascript
// 主应用通信示例
childAppWindow.postMessage({ type: 'SET_THEME', payload: theme }, '*');

// 子应用监听示例
window.addEventListener('message', (event) => {
    if (event.data.type === 'SET_THEME') {
        applyTheme(event.data.payload);
    }
});
```

2. 难点2：样式隔离问题：
    1. 问题：子应用的样式可能会影响其他子应用或主应用的样式，导致样式冲突。
    2. 解决方案：我们采用CSS Modules和Shadow DOM技术实现样式隔离。CSS Modules通过哈希类名确保样式作用域，Shadow DOM提供更强的封装性。对于全局样式（如重置样式、主题变量），我们通过主应用统一管理。例如：

```javascript
// 子应用样式示例（CSS Modules）
import styles from './Component.module.css';
function Component() {
    return <div className={styles.container}>Content</div>;
}
```

3. 难点3：性能优化：
    1. 问题：微前端架构下，多个子应用的加载和运行可能导致内存占用过高和首屏加载时间过长。
    2. 解决方案：我们通过以下措施优化性能：
        1. 代码分割：使用Webpack的`splitChunks`插件提取公共代码，减少重复加载。
        2. 懒加载子应用：只有在用户导航到子应用路由时才加载对应的子应用资源。
        3. 资源预加载：在主应用中预加载关键子应用的资源，利用浏览器缓存减少加载时间。
        4. 内存管理：在子应用卸载时清理其占用的内存，包括事件监听器、定时器等。
4. 难点4：路由管理：
    1. 问题：微前端架构中，主应用和子应用需要协调路由管理，避免路由冲突。
    2. 解决方案：我们采用主应用统一管理路由，子应用注册路由的方式。主应用通过路由前缀区分不同子应用的路由。例如，子应用A的路由为`/app-a/*`，子应用B的路由为`/app-b/*`。主应用使用React Router或Vue Router进行路由分发。子应用内部使用独立的路由配置，但所有路由都挂载在主应用分配的基路径下。
5. 难点5：状态管理：
    1. 问题：子应用之间需要共享状态，但全局状态管理可能导致性能问题和耦合度过高。
    2. 解决方案：我们设计了一个基于`Context API`和`Redux`的全局状态管理系统。对于跨子应用共享的状态（如用户信息、主题配置），通过主应用的状态管理进行统一维护。子应用通过主应用提供的状态管理接口进行状态读写。例如：

```javascript
// 主应用状态管理示例
constGlobalStateContext = React.createContext();

function MainApp() {
    const [globalState, setGlobalState] = useState({
        theme: 'light',
        user: null
    });
    return (
        <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
            <Router>
                {/* 子应用路由配置 */}
            </Router>
        </GlobalStateContext.Provider>
    );
}

// 子应用使用示例
function ChildAppComponent() {
    const { globalState, setGlobalState } = useContext(GlobalStateContext);
    return (
        <div theme={globalState.theme}>
            {/* 组件内容 */}
        </div>
    );
}
```

6. 难点6：构建和部署：
    1. 问题：微前端架构需要独立构建和部署子应用，同时确保子应用与主应用的兼容性。
    2. 解决方案：我们采用独立构建子应用的方式，每个子应用生成独立的静态资源文件，并通过主应用的配置文件进行加载。主应用使用动态`import()`加载子应用资源，并通过`SystemJS`或`single-spa`等工具进行运行时加载。构建流程中，我们使用`webpack-subresource-integrity`插件确保资源完整性，防止中间人攻击。

</details>

## 9. 性能优化了解多少？ {#question-subjective-42fccc28ac95}

### 题目要点

性能优化。

<details>
<summary>参考答案</summary>

性能优化是前端开发中的关键环节，涉及多个方面，以下是我对性能优化的理解和实践经验：

1. 代码优化：
    1. 减少JavaScript执行时间：避免复杂的计算放在首屏渲染路径上，使用`requestIdleCallback`在浏览器空闲时间执行低优先级任务。
    2. 代码分割和懒加载：通过Webpack、Vite等工具将代码分割成多个小块，按需加载。例如，使用React的`React.lazy`和`Suspense`实现组件的懒加载。
    3. Tree-shaking：确保构建工具移除未使用的代码，减少打包体积。
2. 资源加载优化：
    1. CDN加速：将静态资源部署到CDN，减少服务器响应时间和跨区域访问延迟。
    2. 预加载关键资源：使用`&lt;link rel="preload"&gt;`或`&lt;link rel="prefetch"&gt;`提前加载首屏所需资源。
    3. 图片优化：采用现代图片格式（如WebP、AVIF），使用图片懒加载技术，减少首屏加载时间。
3. 渲染优化：
    1. 减少重绘和回流：批量DOM操作，使用`documentFragment`减少DOM操作次数。例如：

```javascript
const fragment = document.createDocumentFragment();
newItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    fragment.appendChild(li);
});
ul.appendChild(fragment);
```

    2. 使用CSS transform和will-change：对于频繁动画的元素，使用`transform`和`will-change`属性减少布局抖动。例如：

```css
.animating-element {
    transform: translateX(0);
    will-change: transform;
}
```

4. 网络请求优化：
    1. HTTP/2和HTTP/3：利用多路复用和头部压缩减少网络延迟。
    2. API合并和请求压缩：合并多个API请求为一个请求，减少请求数量；使用GZIP压缩请求和响应体。
5. 前端缓存策略：
    1. 强缓存和协商缓存：结合使用`Cache-Control`和`ETag`实现高效缓存，减少重复请求。
    2. Service Worker缓存：在PWA应用中，使用Service Worker缓存静态资源，实现离线访问和支持快速加载。
6. 性能监测与调试：
    1. 使用性能分析工具：定期使用Chrome DevTools的Performance面板、Lighthouse等工具分析应用性能，找出瓶颈。
    2. 实时监控：在生产环境中部署性能监控工具（如Sentry、.umami），收集性能指标并及时响应问题。
7. 用户体验优化：
    1. 首屏优化：确保首屏加载时间控制在1秒以内，使用骨架屏或占位符提升感知性能。
    2. 渐进式加载：对于内容丰富的页面，采用渐进式加载策略，先显示关键内容，再加载次要内容。
8. 移动端优化：
    1. 触摸优化：避免在触摸设备上使用小按钮，确保触摸目标尺寸符合要求（如最小48px x 48px）。
    2. 1px线解决方案：使用`transform: scale(0.5)`或`border: 0.5px solid`解决移动端1px线显示问题。
9. 服务器端优化：
    1. 服务端渲染（SSR）：对于首屏内容丰富的页面，采用SSR技术减少首屏加载时间，提升SEO。
    2. 动静分离：将静态资源和动态内容分离部署，优化服务器响应策略。
    3. 数据库查询优化：使用索引优化数据库查询，减少查询时间，支持高并发访问。
10. 框架与工具优化：
    1. 选择合适的框架：根据项目需求选择轻量级框架或库，避免过度复杂的框架增加负担。
    2. 利用框架特性：如Vue的虚拟DOM diff算法、React的Fiber架构，合理使用性能优化API。
11. 代码质量与团队协作：
    1. 代码审查：通过代码审查确保性能优化实践的落地，避免低效代码进入生产环境。
    2. 性能预算：设定性能指标阈值（如首屏加载时间、页面大小），将性能纳入开发规范。
    3. 团队培训：提升团队成员的性能优化意识，确保每个人都了解最佳实践和工具使用方法。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-33/round-40/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-33/_index.md" >}}) · 已是最后一轮 →
