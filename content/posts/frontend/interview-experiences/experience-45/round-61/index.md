+++
title = "百度-文库-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/45"
experienceId = 45
roundId = 61
roundOrder = 1
company = "百度"
date = "2025-07-19T07:40:07.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-45/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-45/round-62/index.md" >}}) →

**本轮要点：** 本轮面试侧重于考察候选人的JavaScript基础知识、CSS布局能力、对浏览器工作原理的理解以及实际编码能力。重点在于事件循环、异步编程、闭包、原型链等核心概念，同时也涵盖了跨域、缓存等常见Web问题。

本轮共 11 道题。答案默认折叠，便于先自行作答。

## 1. 实现一个三栏布局，左右侧固定200px，中间自适应，写出至少两种方案。追问：Grid布局中fr单位的作用？如何解决Flex布局的浏览器兼容问题？ {#question-subjective-a49bd92d13fb}

### 题目要点

1. **CSS布局能力**：面试官想确认你是否熟练掌握现代CSS布局技术，如Flexbox和Grid，以及是否了解传统的布局方法。
2. **布局方案的优劣对比**：能否分析不同方案的适用场景和优缺点，体现出技术选型的思考能力。
3. **CSS单位的理解**：对`fr`这类现代布局单位的深入理解，表明你不是只会“复制粘贴”代码。
4. **兼容性处理经验**：在实际项目中如何处理浏览器兼容性问题，这是衡量工程师经验的重要指标。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

三栏布局是前端开发中的经典布局问题，旨在实现一个两侧宽度固定、中间区域宽度自适应的页面结构。核心是处理中间区域如何填满剩余空间。

* **Flexbox（弹性盒子布局）**：是一种一维布局模型，它让容器内的项目（item）能够灵活地分配空间。通过设置父容器`display: flex`，并为子项设置`flex-grow`（放大比例）、`flex-shrink`（缩小比例）和`flex-basis`（基准大小），可以轻松实现空间的自适应分配。对于三栏布局，可以将中间栏的`flex-grow`设为`1`，使其占据所有剩余空间。
* **Grid（网格布局）**：是一种二维布局模型，可以将页面划分为行和列，并在这些行列构成的单元格中放置内容。通过`grid-template-columns`属性，可以精确定义每一列的宽度，使用`fr`单位可以非常方便地实现自适应。
* **fr 单位**：`fr`是 "fractional unit"（分数单位）的缩写，用于Grid布局中。它代表了可用空间的一等份。例如，`grid-template-columns: 200px 1fr 200px;`意味着第一个和第三个元素宽度为`200px`，中间的元素占据所有剩余的可用空间。如果是`1fr 2fr`，则表示两者按1:2的比例分配可用空间。

##### 1.2 核心用法 + 示例代码

**方案一：Flexbox 布局**这是目前最常用和推荐的方案，代码简洁且语义化。

* **使用场景**：适用于绝大部分现代浏览器项目，尤其是一维方向（行或列）的布局。
* **注意点**：需要注意旧版本浏览器的兼容性问题。

```
<div class="container-flex">
  <div class="left">左侧固定</div>
  <div class="main">中间自适应</div>
  <div class="right">右侧固定</div>
</div>

<style>
  .container-flex {
    display: flex;
    height: 100vh;
  }
  .left, .right {
    width: 200px;
    background-color: #f0f0f0;
  }
  .main {
    flex: 1; /* 等同于 flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */
    background-color: #e0e0e0;
  }
</style>


```

**方案二：Grid 布局**Grid布局在处理二维对齐时更具优势，实现三栏布局同样非常简单。

* **使用场景**：非常适合复杂的页面网格结构，如棋盘式布局。对于简单的三栏布局也是一个优秀的选择。
* **注意点**：需要注意IE浏览器的兼容性。

```
<div class="container-grid">
  <div class="left">左侧固定</div>
  <div class="main">中间自适应</div>
  <div class="right">右侧固定</div>
</div>

<style>
  .container-grid {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    height: 100vh;
  }
  .left { background-color: #f0f0f0; }
  .main { background-color: #e0e0e0; }
  .right { background-color: #f0f0f0; }
</style>


```

##### 1.3 常见误区或面试陷阱

1. **只知道传统方案**：如果只回答浮动（float）或绝对定位（position）方案，可能会被认为技术栈陈旧。虽然这些方案也能实现，但通常伴随着需要清除浮动、DOM结构限制等副作用。
2. **对Flexbox的`flex: 1`理解不清**：`flex: 1`是`flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 0%`的简写。面试官可能会追问这三个属性的具体含义，如果答不上来会减分。
3. **Flex布局兼容性处理**：当被问到兼容性问题时，不能只说“会不兼容”。标准的回答应该包括：<br>
   * **添加浏览器私有前缀**：对于一些旧版浏览器，需要添加`-webkit-`、`-ms-`等前缀。可以使用`Autoprefixer`等工具自动处理。<br>
   * **注意旧版语法**：旧版的Flexbox语法与现代标准有差异（例如`display: box` vs `display: flex`），在维护旧项目时需要注意。

</details>

## 2. 输出顺序及原因？ {#question-subjective-087e56f6485d}

```js
setTimeout(() => console.log(1));
Promise.resolve().then(() => console.log(2));
console.log(3);
```

### 题目要点

1. **JavaScript事件循环（Event Loop）**：这是前端面试中最高频的考点之一，用于考察候选人对JS异步执行机制的理解深度。
2. **宏任务（Macrotask）与微任务（Microtask）**：能否清晰地区分宏任务和微任务，并理解它们的执行优先级，是衡量JS基础是否扎实的关键。
3. **异步API的分类**：确认候选人是否知道`setTimeout`、`Promise`等常见异步API在事件循环中属于哪种任务类型。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

JavaScript是单线程的，但通过事件循环机制实现了异步执行。代码执行时，会区分同步任务和异步任务。

1. **调用栈（Call Stack）**：用于跟踪所有同步任务的执行。当一个函数被调用，它会被推入栈中；执行完毕后，被弹出。
2. **任务队列（Task Queue）**：用于存放异步任务的回调函数。任务队列分为两种：<br>
   * **宏任务队列（Macrotask Queue）**：存放`setTimeout`、`setInterval`、`I/O`操作、UI渲染等任务的回调。<br>
   * **微任务队列（Microtask Queue）**：存放`Promise.then()`、`process.nextTick`（Node.js中）、`MutationObserver`等任务的回调。
3. **事件循环（Event Loop）**：其核心执行顺序如下： a. 执行调用栈中所有的同步代码。 b. 同步代码执行完毕后，检查微任务队列。如果微任务队列不为空，则执行其中所有的微任务，直到队列清空。 c. 微任务队列清空后，取出一个宏任务队列中的任务来执行。 d. 该宏任务执行完毕后，再次回到步骤 b，检查并清空微任务队列。 e. 重复以上 c 和 d 的过程，形成循环。

**核心结论**：每一次事件循环中，在执行下一个宏任务之前，总会清空当前所有的微任务。

##### 1.2 核心用法 + 示例代码

根据上述原理，我们来分析题目中的代码：

1. `setTimeout(() => console.log(1));`：`setTimeout`是一个异步API，它的回调函数 `() => console.log(1)` 会被注册为一个**宏任务**，并放入宏任务队列。
2. `Promise.resolve().then(() => console.log(2));`：`Promise.then`的回调 `() => console.log(2)` 会被注册为一个**微任务**，并放入微任务队列。
3. `console.log(3);`：这是一个**同步任务**，会立即在主线程（调用栈）上执行。

**执行流程**：

1. **第一轮（同步任务）**：<br>
   * 代码从上到下执行。<br>
   * 遇到`setTimeout`，将其回调注册为宏任务。<br>
   * 遇到`Promise.then`，将其回调注册为微任务。<br>
   * 遇到`console.log(3)`，立即执行。<br>
   * 控制台输出：**`3`**
2. **同步任务结束，检查微任务**：<br>
   * 事件循环发现微任务队列中有任务 `() => console.log(2)`。<br>
   * 立即执行该微任务。<br>
   * 控制台输出：**`2`**
3. **微任务清空，执行一个宏任务**：<br>
   * 事件循环从宏任务队列中取出任务 `() => console.log(1)`。<br>
   * 执行该宏任务。<br>
   * 控制台输出：**`1`**

因此，最终的输出顺序是 **`3, 2, 1`**。

##### 1.3 常见误区或面试陷阱

1. **混淆宏任务与微任务**：最常见的错误是认为`setTimeout`和`Promise.then`是同一种任务，或者错误地认为`setTimeout(..., 0)`会比`Promise.then`先执行。
2. **对`Promise`的理解不深**：需要明确`new Promise(...)`中的代码是同步执行的，而`.then()`或`.catch()`中的回调才是异步的微任务。
3. **忽略Node.js环境的特殊性**：在Node.js中，`process.nextTick`的优先级甚至高于其他微任务，它有自己独立的队列。如果在题目中加入`process.nextTick`，执行顺序会更复杂。

</details>

## 3. Node.js中`process.nextTick`与微任务的执行顺序？ {#question-subjective-29884f294b87}

### 题目要点

1. **Node.js事件循环**：考察对Node.js事件循环模型的理解，及其与浏览器事件循环的差异。
2. **`process.nextTick`的特殊性**：`process.nextTick`是一个非常特殊的API，面试官想知道你是否理解它在事件循环中的“插队”行为。
3. **知识的深度和广度**：这个问题能有效地区分出对Node.js有深入研究的候选人。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

虽然Node.js的事件循环也区分宏任务和微任务，但它的机制比浏览器更复杂，并且有一个特殊的API——`process.nextTick`。

* **`process.nextTick`**：它不属于事件循环的任何一个阶段，而是独立于事件循环之外。它有一个自己的队列（`nextTickQueue`）。
* **执行时机**：`process.nextTick`的回调函数会在**当前同步代码执行完毕后**，**并且在任何其他微任务（如`Promise.then`）执行之前**被立即处理。可以理解为它在同步代码和微任务之间“插队”了。

**Node.js中异步任务的优先级顺序**：**同步代码 > `process.nextTick` \> 其他微任务（如`Promise.then`） > 宏任务（如`setTimeout`）**

##### 1.2 核心用法 + 示例代码

让我们通过一个例子来直观地感受它们的执行顺序：

```
// a.js in Node.js environment
console.log('sync start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise.then');
});

process.nextTick(() => {
  console.log('process.nextTick');
});

console.log('sync end');


```

**执行流程分析**：

1. **同步代码执行**：<br>
   * 打印 `'sync start'`。<br>
   * `setTimeout`的回调被放入宏任务队列。<br>
   * `Promise.then`的回调被放入微任务队列。<br>
   * `process.nextTick`的回调被放入`nextTickQueue`。<br>
   * 打印 `'sync end'`。
2. **同步代码执行完毕**：<br>
   * 事件循环首先检查`nextTickQueue`。<br>
   * 发现队列不为空，执行所有`nextTick`回调。打印 `'process.nextTick'`。
3. **处理微任务**：<br>
   * `nextTickQueue`清空后，事件循环接着检查微任务队列。<br>
   * 发现队列不为空，执行所有微任务。打印 `'promise.then'`。
4. **执行宏任务**：<br>
   * 所有微任务处理完毕后，事件循环从宏任务队列中取出一个任务执行。<br>
   * 执行`setTimeout`的回调。打印 `'setTimeout'`。

**最终输出**：

```
sync start
sync end
process.nextTick
promise.then
setTimeout


```

##### 1.3 常见误区或面试陷阱

1. **将`process.nextTick`等同于微任务**：这是最致命的错误。必须清楚地指出`process.nextTick`的优先级高于标准的微任务。
2. **命名误导**：虽然名字叫`nextTick`（下一个嘀嗒），但它实际上是在同一个tick（事件循环周期）内，同步代码执行完后立即执行的，而不是在“下一个”tick。
3. **滥用`process.nextTick`**：在实际开发中，官方推荐开发者优先使用`Promise`，因为滥用`process.nextTick`（例如在其中进行递归调用）可能会阻塞事件循环，导致I/O操作等宏任务饥饿（starvation）。

</details>

## 4. 手写代码：数组去重。优化：如何处理对象元素的去重？ {#question-subjective-b6036a26f548}

### 题目要点

1. **算法与数据结构**：考察对不同去重算法的时间/空间复杂度的理解。
2. **ES6新特性**：是否能熟练运用`Set`等ES6提供的便捷工具。
3. **处理复杂数据类型**：面试官通过追问对象去重，来考察你处理引用类型的能力以及思维的严谨性。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

数组去重的核心思想是，在遍历数组时，判断当前元素是否已经出现过。根据判断方式的不同，可以衍生出多种实现方案。

* **`Set`数据结构**：`Set`是ES6引入的一种数据结构，其成员的值都是唯一的。利用这个特性，可以非常简单地实现数组去重。这是目前最优的方案。
* **双重循环/`indexOf`**：这是比较基础的思路，通过遍历原数组，将不重复的元素添加到一个新数组中。时间复杂度为O(n²)，性能较差。
* **对象属性/`Map`**：利用对象的key不能重复的特性，将数组元素作为key存入一个对象或Map中，最后再取出所有的key。

对于对象元素的去重，难点在于对象是引用类型。两个内容相同的对象（如`{a:1}`和`{a:1}`）在内存中是两个不同的地址，直接比较或使用`Set`是无法将它们视为重复的。因此，需要一个**唯一标识**来判断对象是否重复，通常是将对象转换为一个唯一的字符串key。

##### 1.2 核心用法 + 示例代码

**基础类型去重（推荐方案：使用`Set`）**

```
function uniqueArray(arr) {
  if (!Array.isArray(arr)) {
    console.error('type error!');
    return;
  }
  return [...new Set(arr)];
  // 或者 Array.from(new Set(arr))
}

// 示例
const arr1 = [1, 2, 'a', 'a', 2, 3, 3, 4];
console.log(uniqueArray(arr1)); // [1, 2, "a", 3, 4]


```

**对象元素去重（优化方案）** 需要根据一个或多个属性来定义“重复”。

```
/**
 * 根据对象的特定key进行去重
 * @param {Array} arr 待去重的数组
 * @param {String} key 用作唯一标识的属性名
 * @returns {Array} 去重后的数组
 */
function uniqueArrayOfObjects(arr, key) {
  if (!Array.isArray(arr)) {
    console.error('type error!');
    return;
  }
  const map = new Map();
  // 使用filter方法，遍历数组，通过Map来判断key是否已存在
  return arr.filter(item => !map.has(item[key]) && map.set(item[key], 1));
}

// 示例
const arr2 = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 1, name: 'C' }, // id重复
  { id: 3, name: 'D' }
];
console.log(uniqueArrayOfObjects(arr2, 'id'));
// 输出: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'D' }]


```

**更通用的对象去重（基于`JSON.stringify`）** 如果需要基于对象所有内容进行去重，可以将其序列化为字符串。

```
function uniqueDeep(arr) {
  let obj = {};
  return arr.filter(item => {
    const key = typeof item + JSON.stringify(item);
    return obj.hasOwnProperty(key) ? false : (obj[key] = true);
  });
}

// 示例
const arr3 = [
    {a: 1, b: 2},
    {b: 2, a: 1}, // 属性顺序不同，但内容相同
    {a: 1, b: 3}
];
// 注意：JSON.stringify({a: 1, b: 2}) 和 JSON.stringify({b: 2, a: 1}) 结果可能不同
// 需要先对key排序来保证唯一性，这里为了简化，暂时不处理
console.log(uniqueDeep(arr3));


```

##### 1.3 常见误区或面试陷阱

1. **只知道O(n²)的解法**：如果只写出双重循环或`indexOf`的方案，会显得基础不扎实。一定要主动提出并写出使用`Set`的O(n)解法。
2. **对象去重时直接使用`Set`**：`new Set([{a:1}, {a:1}])`会得到一个包含两个对象的Set，因为它们的引用不同。直接用`Set`处理对象数组是典型的错误。
3. **`JSON.stringify`的局限性**：当被问到对象去重时，如果提出`JSON.stringify`方案，最好能主动说明其局限性：<br>
   * 对象中属性的顺序会影响结果（例如`{a:1, b:2}`和`{b:2, a:1}`）。<br>
   * 无法处理`undefined`、`Function`、`Symbol`等特殊值。<br>
   * 这是一个体现你思考全面性的加分项。

</details>

## 5. 循环中绑定事件时如何避免闭包陷阱？ {#question-subjective-4153e1cb2f49}

### 题目要点

1. **闭包的理解与应用**：考察对闭包的本质——函数能够记住并访问其所在的词法作用域——的理解。
2. **`var`的函数作用域**：对`var`声明的变量在循环中的行为是否清晰。
3. **`let`的块级作用域**：是否了解并能利用ES6的`let`来优雅地解决此问题。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

“闭包陷阱”在循环中通常指，当使用`var`声明循环变量时，给多个元素绑定的事件处理函数，在触发时都只会获取到循环变量的**最终值**，而不是绑定时期望的那个值。

**问题根源**：

* **`var`的作用域**：`var`声明的变量是函数作用域或全局作用域。在一个`for`循环中，用`var`声明的变量`i`实际上只存在一个，它属于循环外的作用域。
* **异步执行**：事件处理函数是异步执行的。当用户点击按钮触发事件时，`for`循环早已执行完毕。
* **闭包的引用**：所有的事件处理函数都形成了一个闭包，它们共享同一个词法作用域，因此它们引用的都是同一个变量`i`。当循环结束后，`i`的值已经变成了循环的最终值（例如，`for(var i=0; i<5; i++)`结束后，`i`为5）。所以，无论点击哪个按钮，访问到的`i`都是5。

##### 1.2 核心用法 + 示例代码

**错误的示例（闭包陷阱）**

```
<button>Button 0</button>
<button>Button 1</button>
<button>Button 2</button>

<script>
var buttons = document.querySelectorAll('button');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    // 无论点击哪个按钮，都会输出 3
    console.log('You clicked button #' + i);
  });
}
</script>


```

**解决方案一：使用`let`（ES6推荐方案）**

 `let`具有块级作用域。在`for`循环的每次迭代中，`let`都会为循环变量`i`创建一个新的绑定，并将其初始化为当前迭代的值。每个事件处理函数都关闭并捕获了它自己那一次迭代的`i`。

```
// 只需将 var 改为 let
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    // 点击不同按钮，会分别输出 0, 1, 2
    console.log('You clicked button #' + i);
  });
}


```

**解决方案二：使用立即执行函数（IIFE）创建独立作用域（ES5方案）**

在`let`出现之前，经典的解决方案是使用IIFE为每次循环创建一个新的函数作用域，从而将每次迭代的`i`值“锁住”。

```
for (var i = 0; i < buttons.length; i++) {
  (function(savedI) {
    buttons[savedI].addEventListener('click', function() {
      // savedI 是IIFE作用域内的变量，值被保存了下来
      console.log('You clicked button #' + savedI);
    });
  })(i); // 将当前的i作为参数传入IIFE
}


```

##### 1.3 常见误区或面试陷阱

1. **无法解释`var`为什么不行**：只知道用`let`可以解决，但说不清楚`var`的问题根源在于函数作用域和事件的异步执行，这会显得理解不深。
2. **无法写出ES5的IIFE解法**：虽然`let`是现代首选，但能写出IIFE解法表明你对JavaScript的历史和核心概念有更扎实的掌握。
3. **混淆作用域**：对函数作用域、块级作用域和词法作用域的概念模糊不清，导致解释时逻辑混乱。

</details>

## 6. 输出结果是？ {#question-subjective-cb2326440381}

```js
function A() {}
A.prototype.name = 'a';
const b = new A();
console.log(b.name); //
```

### 题目要点

1. **原型与原型链**：考察对JavaScript核心概念——原型继承机制的理解。
2. **`new`操作符**：`new`一个构造函数时，内部发生了什么，特别是实例与构造函数原型之间的关联。
3. **属性查找机制**：当访问一个对象的属性时，JavaScript引擎的查找顺序。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

这是对JavaScript原型链基础知识的直接考察。

1. **构造函数与原型对象**：每个函数在创建时，都会自动获得一个`prototype`属性，这个属性是一个对象，被称为原型对象。
2. **`new`操作符**：当使用`new`关键字调用一个构造函数时（如`new A()`），会发生以下事情： a. 创建一个全新的空对象。 b. 这个新对象的`[[Prototype]]`（在代码中通常通过`__proto__`访问）被设置为构造函数的`prototype`对象。 c. 构造函数`A`被执行，其中的`this`指向这个新创建的对象。 d. 如果构造函数没有显式返回一个对象，则`new`表达式的结果就是这个新对象。
3. **原型链属性查找**：当试图访问一个对象的属性时（如`b.name`）： a. JavaScript引擎首先在对象`b`自身上查找是否存在`name`属性。 b. 如果在`b`上找不到，引擎会沿着`b`的`[[Prototype]]`链向上查找，也就是去`A.prototype`对象上查找。 c. 如果在`A.prototype`上找到了`name`属性，就返回它的值。 d. 如果还没找到，会继续沿着原型链向上查找，直到`Object.prototype`，最终到达`null`。如果整个链上都没有，则返回`undefined`。

##### 1.2 核心用法 + 示例代码

**代码分析**：

1. `function A() {}`：定义了一个构造函数`A`。
2. `A.prototype.name = 'a';`：在构造函数`A`的原型对象上定义了一个属性`name`，其值为`'a'`。
3. `const b = new A();`：创建了`A`的一个实例`b`。此时，`b`本身是一个空对象`{}`，但它的原型（`b.__proto__`）指向了`A.prototype`。
4. `console.log(b.name);`：访问`b.name`。<br>
   * 引擎在`b`对象自身上查找`name`，没有找到。<br>
   * 引擎沿着原型链找到`b.__proto__`，即`A.prototype`。<br>
   * 在`A.prototype`上找到了`name`属性，其值为`'a'`。<br>
   * 查找停止，返回该值。

**所以，最终的输出结果是：`a`**

##### 1.3 常见误区或面试陷阱

1. **混淆实例属性和原型属性**：错误地认为`b.name`是`undefined`，因为`b`对象本身是空的。这是没有理解原型链查找机制的表现。
2. **对`prototype`和`__proto__`的关系不清晰**：`prototype`是函数才有的属性，而`__proto__`是每个对象都有的（指向其构造函数的原型）。虽然现在`__proto__`已标准化，但面试中能说出`Object.getPrototypeOf(b)`是更推荐的访问原型的方式，会是加分项。
3. **无法画出原型链图**：一个好的衡量标准是，能否清晰地画出`b`、`A`、`A.prototype`、`Object.prototype`之间的关系图。

</details>

## 7. 跨域解决方案（JSONP/CORS/代理）及各自适用场景 {#question-subjective-de1fd3efcb9f}

### 题目要点

1. **同源策略（Same-Origin Policy）**：是否理解浏览器设置此安全策略的根本原因。
2. **主流跨域技术**：对CORS、JSONP、Nginx反向代理等常见解决方案的原理和实现方式是否熟悉。
3. **方案选型能力**：能否根据不同场景（如是否能控制后端、请求方法、兼容性要求）选择最合适的跨域方案。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**同源策略 (Same-Origin Policy, SOP)**：是浏览器的一个核心安全功能，它限制一个源（origin）的文档或脚本如何能与另一个源的资源进行交互。一个源由协议（protocol）、域名（domain）、端口（port）三者共同定义。当三者完全一致时，才属于同源。这个策略主要为了防止恶意网站读取其他网站的敏感数据。

**跨域**：当一个请求的URL的协议、域名、端口三者中任意一个与当前页面URL不同时，就产生了跨域。

**解决方案原理**：

1. **JSONP (JSON with Padding)**：<br>
   * **原理**：利用了`&lt;script&gt;`标签的`src`属性不受同源策略限制的“漏洞”。动态创建一个`&lt;script&gt;`标签，其`src`指向一个跨域的URL，并带上一个回调函数名（如`callback=myFunction`）。服务器接收到请求后，不再返回纯JSON数据，而是返回一段执行该回调函数的JavaScript代码，并将数据作为参数传入，如 `myFunction({"data": "..."})`。
2. **CORS (Cross-Origin Resource Sharing)**：<br>
   * **原理**：跨域资源共享是一个W3C标准，它允许服务器在HTTP响应头中添加一些`Access-Control-*`字段，来声明哪些源站有权限访问其资源。浏览器在收到响应时，会检查这些头部信息，如果当前源被允许，就正常处理响应；否则，浏览器会拦截响应，并在控制台报错。这是目前解决跨域问题的**根本和标准**方法。
3. **代理 (Proxy)**：<br>
   * **原理**：利用服务器之间通信不受同源策略限制的特点。在自己的服务器上（与前端页面同源）创建一个接口，前端页面所有跨域请求都先发给这个同源的代理接口。然后，由这个代理服务器作为客户端，去请求真正的目标服务器，拿到数据后再返回给前端。对于前端来说，整个过程都是同源的。

##### 1.2 核心用法 + 示例代码

##### 1.3 常见误区或面试陷阱

1. **认为跨域是请求发不出去**：错误的。跨域请求实际上已经到达了服务器，服务器也返回了数据，只是浏览器根据同源策略，在接收到响应时给拦截了。
2. **JSONP和CORS原理混淆**：把两者搞混，或者说不清JSONP为什么只支持GET。
3. **对代理的理解停留在开发环境**：虽然Webpack的proxy很常用，但需要理解其原理，并知道在生产环境中通常使用Nginx等Web服务器来实现反向代理。
4. **CORS配置说不全**：当被问到CORS时，至少应该能说出`Access-Control-Allow-Origin`（允许的源）、`Access-Control-Allow-Methods`（允许的方法）、`Access-Control-Allow-Headers`（允许的头部）这几个关键的响应头。

</details>

## 8. CORS预检请求（Preflight）的触发条件？ {#question-subjective-8d05a4c20eca}

### 题目要点

1. **CORS的深入理解**：这个问题是对CORS知识的进一步深挖，考察是否了解“简单请求”和“非简单请求”的区别。
2. **网络知识**：对HTTP请求方法和请求头的了解程度。
3. **性能意识**：理解预检请求的目的是为了安全，但它也带来了额外的网络开销。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

CORS将跨域请求分为两类：**简单请求（Simple Requests）** 和 **非简单请求（Non-Simple Requests）**。

* **简单请求**：浏览器认为这类请求风险较低，不会触发预检请求。它会直接发送CORS请求，并在响应头中检查是否允许跨域。
* **非简单请求**：对于这类可能对服务器数据产生“副作用”（如修改数据）的请求，浏览器会先发送一个**预检请求（Preflight Request）**。

**预检请求**：

* 是一个HTTP `OPTIONS`方法的请求。
* 它先于实际请求发送到目标服务器，目的是为了“询问”服务器，实际的请求是否安全，是否被允许。
* 服务器收到预检请求后，会检查请求中的`Access-Control-Request-Method`和`Access-Control-Request-Headers`等信息，并返回相应的CORS头部。
* 浏览器根据预检请求的响应，来决定是否发送实际的请求。浏览器可以缓存预检请求的结果（通过`Access-Control-Max-Age`头），避免每次都发送。

##### 1.2 核心用法 + 示例代码

**触发预检请求的条件**： 只要**不满足**以下所有“简单请求”的条件，就会被视为非简单请求，从而触发预检。

**“简单请求”必须同时满足以下两大条件**：

**1\. 请求方法是以下三种之一：**

* `GET`
* `HEAD`
* `POST`

**2\. HTTP头部信息不超出以下几种字段：**

* `Accept`
* `Accept-Language`
* `Content-Language`
* `Last-Event-ID`
* `Content-Type`，但其值仅限于以下三种：<br>
   * `application/x-www-form-urlencoded`<br>
   * `multipart/form-data`<br>
   * `text/plain`

**常见触发预检请求的场景**：

* 使用了`PUT`、`DELETE`、`PATCH`等请求方法。
* 发送了`Content-Type: application/json`的请求（非常常见！）。
* 请求中包含了自定义的HTTP头部，例如 `X-Token` 或 `Authorization`。

##### 1.3 常见误区或面试陷阱

1. **认为所有POST请求都是简单请求**：这是一个高频误区。只有当`Content-Type`是`application/x-www-form-urlencoded`、`multipart/form-data`或`text/plain`之一时，POST才被视为简单请求。我们常用的`axios`或`fetch`发送的JSON数据（`Content-Type: application/json`）会触发预检。
2. **不知道预检请求可以被缓存**：能提到`Access-Control-Max-Age`这个响应头可以用来控制预检结果的缓存时间，是一个重要的加分项，体现了你对性能优化的关注。
3. **对预检请求的目的不清楚**：预检的核心目的是**安全**，它确保了服务器有能力处理即将到来的非简单请求，防止了在服务器不知情的情况下被发送可能修改数据的跨域请求。

</details>

## 9. 浏览器缓存策略讲一下，`Cache-Control: max-age=3600`与`ETag`的如何配合使用。 {#question-subjective-de2b597ed885}

### 题目要点

1. **HTTP缓存机制**：考察对浏览器缓存两大策略——强缓存和协商缓存的理解。
2. **HTTP头部字段**：对`Cache-Control`, `Expires`, `ETag`, `Last-Modified`等关键缓存头部的作用和优先级是否清晰。
3. **综合应用能力**：能否将不同的缓存策略结合起来，描述一个完整的、实际的缓存工作流程。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

浏览器缓存是提升Web性能的关键手段。它主要分为两大类：**强缓存**和**协商缓存**。

1. **强缓存 (Strong Cache)**：<br>
   * **作用**：在缓存有效期内，浏览器**不向服务器发送任何请求**，直接从本地缓存中读取资源。HTTP状态码通常是`200 OK (from memory cache)`或`200 OK (from disk cache)`。<br>
   * **实现**：通过HTTP响应头中的`Cache-Control`（HTTP/1.1，优先级更高）和`Expires`（HTTP/1.0）字段来控制。<br>
         * `Cache-Control: max-age=3600`：表示资源在3600秒（1小时）内是有效的。<br>
         * `Expires`：指定一个具体的过期时间点（绝对时间），由于依赖客户端本地时间，可能不准确，已逐渐被`Cache-Control`取代。
2. **协商缓存 (Negotiation Cache / Weak Cache)**：<br>
   * **作用**：当强缓存失效后（或没有设置强缓存），浏览器会向服务器发送一个请求，以“协商”本地缓存的资源是否仍然有效。如果服务器认为资源未改变，则返回一个`304 Not Modified`状态码，浏览器继续使用本地缓存；如果资源已更新，则返回`200 OK`和新的资源内容。<br>
   * **实现**：通过两组“请求头-响应头”对来工作。<br>
         * **`Last-Modified` / `If-Modified-Since`**：基于资源的最后修改时间。服务器在响应头中提供`Last-Modified`，浏览器在下次请求时带上`If-Modified-Since`。缺点是时间戳不够精确（只能到秒），且文件内容没变但修改时间变了也会导致缓存失效。<br>
         * **`ETag` / `If-None-Match`** (优先级更高)：基于资源内容的唯一标识符（Entity Tag），通常是文件内容的哈希值。服务器在响应头中提供`ETag`，浏览器在下次请求时带上`If-None-Match`。它比`Last-Modified`更精确可靠。

**缓存优先级**：浏览器会优先检查强缓存。如果强缓存有效，则直接使用；如果强缓存失效，则发起协商缓存的请求。

##### 1.2 核心用法 + 示例代码

**`Cache-Control: max-age=3600`与`ETag`的配合使用流程**：

这是一个非常经典的组合，结合了强缓存的速度和协商缓存的精确性。

**场景：浏览器首次请求一个`style.css`文件**

1. **浏览器 -> 服务器**：`GET /style.css`
2. **服务器 -> 浏览器**：<br>
   * `HTTP/1.1 200 OK`<br>
   * `Cache-Control: max-age=3600` (设置强缓存，有效期1小时)<br>
   * `ETag: "xyz123abc"` (为文件内容生成一个唯一标识)<br>
   * `Content: ...` (文件内容)<br>
   * 浏览器将文件内容和这些头部信息一起存入缓存。

**场景：1小时内再次请求该文件**

1. 浏览器检查本地缓存，发现`style.css`的强缓存未过期 (`max-age`还有剩余时间)。
2. **不发送任何HTTP请求**，直接从本地缓存读取文件。页面加载速度极快。

**场景：1小时后再次请求该文件**

1. 浏览器检查本地缓存，发现强缓存已过期。
2. 进入协商缓存阶段，向服务器发起请求。请求头中会带上`If-None-Match`字段。
3. **浏览器 -> 服务器**：<br>
   * `GET /style.css`<br>
   * `If-None-Match: "xyz123abc"` (告诉服务器我本地的版本是这个)
4. **服务器进行判断**：<br>
   * **情况A：文件未修改**<br>
         * 服务器计算当前`style.css`的ETag，发现与浏览器传来的`"xyz123abc"`一致。<br>
         * **服务器 -> 浏览器**：返回 `HTTP/1.1 304 Not Modified`，响应体为空。<br>
         * 浏览器收到304后，知道本地缓存仍然有效，于是从本地加载文件。虽然有一次请求，但节省了下载文件内容的带宽。<br>
   * **情况B：文件已修改**<br>
         * 服务器计算出新的ETag，例如`"def456ghi"`。<br>
         * **服务器 -> 浏览器**：返回 `HTTP/1.1 200 OK`，并带上新的`Cache-Control`、新的`ETag: "def456ghi"`以及**新的文件内容**。<br>
         * 浏览器使用新的文件，并更新本地缓存。

##### 1.3 常见误区或面试陷阱

1. **混淆强缓存和协商缓存**：说不清两者的根本区别（一个不发请求，一个发请求）。
2. **HTTP状态码记错**：将协商缓存的`304`与重定向的`301`/`302`混淆。或者不知道`200 (from cache)`代表的是强缓存。
3. **`ETag`和`Last-Modified`的优劣说不清**：`ETag`更优，因为它解决了`Last-Modified`的两个主要问题：1）修改时间不精确（秒级）；2）内容没变但时间变了（如`git pull`）也会触发重新下载。
4. **对用户操作的影响不了解**：需要知道用户按`F5`刷新会忽略强缓存、走协商缓存；而按`Ctrl+F5`强制刷新会忽略所有缓存，直接向服务器请求新资源。

</details>

## 10. 为什么Vue3选择Proxy替代`Object.defineProperty`？ {#question-subjective-313ec087ef0a}

### 题目要点

1. **Vue响应式原理**：考察对Vue2响应式系统核心API `Object.defineProperty` 的理解及其局限性。
2. **ES6 `Proxy`**：对`Proxy`这一新特性的功能和优势是否了解。
3. **框架设计思考**：能否从框架作者的角度，分析技术选型背后的权衡，体现出对技术演进的洞察力。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

Vue 的核心特性之一是其响应式系统。当数据变化时，视图会自动更新。Vue 2 和 Vue 3 实现了相同的目标，但底层采用了不同的技术。

* **Vue 2: `Object.defineProperty`**<br>
   * **原理**：Vue 2 通过 `Object.defineProperty` 来劫持对象**属性**的 `getter` 和 `setter`。在初始化时，Vue 会递归地遍历 data 对象的所有属性，为每个属性都设置上 `getter` 和 `setter`。<br>
   * **`getter`**：在属性被读取时触发，用于进行**依赖收集**（即记录下哪些组件的渲染依赖于此属性）。<br>
   * **`setter`**：在属性被修改时触发，用于**派发更新**（通知所有依赖此属性的组件重新渲染）。
* **Vue 3: `Proxy`**<br>
   * **原理**：Vue 3 使用 ES6 的 `Proxy` API 来实现响应式。`Proxy` 可以创建一个对象的“代理”，从而实现对该对象**整体**的基本操作（如属性读取、设置、删除、遍历等）的拦截和自定义。它不是针对单个属性，而是作用于整个对象。

##### 1.2 核心用法 + 示例代码

`Proxy`之所以能够替代并优于`Object.defineProperty`，主要解决了后者存在的几个核心痛点：

**1\. `Object.defineProperty` 无法监听对象属性的新增和删除。**

* **Vue 2 的问题**：如果你向一个响应式对象直接添加一个新属性，或者用`delete`删除一个属性，Vue 是无法检测到这个变化的。<br>
```
// 在Vue 2组件中
this.myObject.newProp = 'hello'; // 视图不会更新
delete this.myObject.oldProp;    // 视图不会更新
```
* **Vue 2 的解决方案**：必须使用全局的 `Vue.set` (或 `this.$set`) 和 `Vue.delete` (或 `this.$delete`) 这两个特殊的API来操作，这无疑增加了心智负担。
* **Proxy 的优势**：`Proxy` 是对整个对象的代理，任何对该对象的操作（包括新增和删除）都会被 `handler` 的 `set` 或 `deleteProperty` 陷阱（trap）捕获到，无需任何特殊API。

**2\. `Object.defineProperty` 无法原生监听数组的变化。**

* **Vue 2 的问题**：`Object.defineProperty` 无法有效地劫持对数组索引的直接赋值（如 `arr[0] = ...`）或对 `.length` 属性的修改。
* **Vue 2 的解决方案**：Vue 2 通过“重写”数组的原型方法（如 `push`, `pop`, `splice` 等）来实现对数组变化的监听。这是一种“hack”手段，且只能覆盖部分方法。
* **Proxy 的优势**：`Proxy` 可以完美地代理整个数组对象，无论是通过索引赋值还是修改 `.length`，都会被 `set` 陷阱捕获，处理起来自然且高效。

**3\. `Object.defineProperty` 需要在初始化时进行深度递归遍历。**

* **Vue 2 的性能开销**：在组件初始化时，Vue 2 需要递归地遍历 data 对象的所有层级，为每一个属性都调用一次 `Object.defineProperty`。如果数据对象非常庞大和复杂，这个过程会有一定的性能开销。
* **Proxy 的优势**：`Proxy` 是懒代理（lazy）。它只在顶层创建一个代理。只有当你访问到某个深层属性时，它才会即时地（on-the-fly）为那个属性创建下一层的代理。这种懒执行的方式使得初始化速度更快。

**总结**：`Proxy` 提供了更强大、更全面、性能更好的对象劫持能力，使得Vue 3的响应式系统在功能上更完善，实现上更优雅，性能上也有所提升。

##### 1.3 常见误区或面试陷阱

1. **只说“Proxy性能更好”**：这是一个模糊的答案。需要具体说明好在哪里：一是初始化时不需要递归遍历，开销小；二是省去了`Vue.set`等API的调用。
2. **不了解`Proxy`的兼容性**：`Proxy`是ES6的特性，无法被 Polyfill。这意味着Vue 3无法支持IE浏览器。这是一个重要的技术权衡，面试时能主动提及，会展示你的全面性。
3. **对Vue 2的数组处理方式说不清**：如果只说`Object.defineProperty`不能处理数组，但说不清Vue 2到底是怎么处理的（重写原型方法），说明理解不够深入。

</details>

## 11. 手写代码：实现Promise.all {#question-subjective-a5cabba73a6b}

### 题目要点

1. **Promise API的熟练度**：是否能熟练地创建和使用`Promise`。
2. **异步流程控制**：如何管理多个并行的异步操作，并在它们全部完成后执行某个逻辑。
3. **边界条件处理**：能否考虑到各种特殊输入，如空数组、非Promise元素、有Promise被reject等。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

`Promise.all(iterable)` 方法接收一个可迭代对象（如数组）作为输入，并返回一个单一的 `Promise`。这个返回的 `Promise` 的行为如下：

* 当输入的可迭代对象中的**所有** Promise 都成功地 `resolve` 后，它才会 `resolve`。其 `resolve` 的值是一个包含了所有输入 Promise `resolve` 值的数组，且顺序与输入数组的顺序一致。
* 如果输入的可迭代对象中有**任何一个** Promise `reject` 了，它会**立即** `reject`，并且 `reject` 的原因就是那个最先 `reject` 的 Promise 的原因。

**实现思路**：

1. 创建一个新的`Promise`并返回它。
2. 用一个数组`results`来按顺序存储每个输入Promise的结果。
3. 用一个计数器`resolvedCount`来记录已经成功`resolve`的Promise数量。
4. 遍历输入的`promises`数组。
5. 对每个`promise`，使用`Promise.resolve()`进行包装，以处理输入数组中包含非Promise值的情况。
6. 为每个包装后的Promise添加`.then()`处理：<br>
   * 当它`resolve`时，将结果存入`results`数组的对应位置，并将`resolvedCount`加一。<br>
   * 检查`resolvedCount`是否等于`promises`的总数。如果是，说明所有Promise都已成功，此时`resolve`我们自己创建的那个新`Promise`，值为`results`数组。
7. 如果任何一个Promise `reject`了，我们立即`reject`我们自己创建的那个新`Promise`。

##### 1.2 核心用法 + 示例代码

```
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // 检查输入是否为可迭代对象
    if (!promises || typeof promises[Symbol.iterator] !== 'function') {
      return reject(new TypeError('Argument must be iterable.'));
    }

    const promisesArray = Array.from(promises);
    const n = promisesArray.length;

    // 如果输入为空，则立即resolve一个空数组
    if (n === 0) {
      return resolve([]);
    }

    const results = new Array(n);
    let resolvedCount = 0;

    promisesArray.forEach((promise, index) => {
      // 使用Promise.resolve()来处理非Promise值
      Promise.resolve(promise)
        .then(value => {
          results[index] = value; // 按原始顺序存放结果
          resolvedCount++;

          // 如果所有promise都已成功，则resolve最终的promise
          if (resolvedCount === n) {
            resolve(results);
          }
        })
        .catch(error => {
          // 任何一个promise失败，则立即reject最终的promise
          reject(error);
        });
    });
  });
}

// 测试用例
const p1 = Promise.resolve(1);
const p2 = 42; // 非Promise值
const p3 = new Promise(resolve => setTimeout(() => resolve('foo'), 100));
const p4_reject = Promise.reject('Error occurred');

// 1. 全部成功的例子
promiseAll([p1, p2, p3])
  .then(results => console.log('All resolved:', results)) // 期望输出: All resolved: [1, 42, "foo"]
  .catch(error => console.error('Caught error:', error));

// 2. 包含一个reject的例子
promiseAll([p1, p3, p4_reject])
  .then(results => console.log('All resolved:', results))
  .catch(error => console.error('Caught error:', error)); // 期望输出: Caught error: Error occurred


```

##### 1.3 常见误区或面试陷阱

1. **结果顺序不一致**：一个常见的错误是使用`push`将结果添加到`results`数组中，这会导致结果的顺序与Promise完成的顺序一致，而不是与输入数组的顺序一致。必须使用索引来赋值。
2. **忘记处理非Promise值**：`Promise.all`规范要求能处理可迭代对象中的非Promise值。使用`Promise.resolve(promise)`来包装是优雅的处理方式。
3. **忘记处理空数组的边界情况**：当输入一个空数组时，`Promise.all`应该立即`resolve`一个空数组。
4. **失败时没有立即`reject`**：当一个Promise失败时，`Promise.all`应该立即失败，而不是等待其他Promise完成。代码中必须有立即`reject`的逻辑。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-45/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-45/round-62/index.md" >}}) →
