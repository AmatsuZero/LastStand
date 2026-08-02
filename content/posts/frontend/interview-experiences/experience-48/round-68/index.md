+++
title = "腾讯云-实习 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/48"
experienceId = 48
roundId = 68
roundOrder = 1
company = "腾讯"
date = "2025-07-25T02:54:17.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-48/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-48/round-69/index.md" >}}) →

**本轮要点：** 一面，更多考察的是八股文的基础知识

本轮共 20 道题。答案默认折叠，便于先自行作答。

## 1. 什么是 HTML 语义化？ {#question-a75b1e9d-9359-47b0-8614-1088eee4b085}

> 题库原题：[什么是 HTML 语义化？](https://fe.ecool.fun/topic/a75b1e9d-9359-47b0-8614-1088eee4b085)

### 题目要点

先看下什么是HTML：

<details>
<summary>参考答案</summary>

先看下什么是HTML：

> 超文本标记语言（英语：HyperText Markup Language，简称：HTML）是一种用于创建网页的标准标记语言。
> HTML元素是构建网站的基石。HTML允许嵌入图像与对象，并且可以用于创建交互式表单，它被用来结构化信息——例如标题、段落和列表等等，也可用来在一定程度上描述文档的外观和语义。

那么如何理解 Web 语义化？

通俗的来讲就是从代码上来展示页面的结构，而不是从最终视觉上来展示结构。

单纯的HTML代码是不带任何样式的只是用来标记这一段是标题、这一块是代码、那一个是要强调的内容等等。

但是为什么我们只写HTML在浏览器中不同的标签也是有不同的样式呢？

那是因为各个浏览器都自带的有相应标签的默认样式，为了方便在没有设定样式的情况下友好的展示页面。

良好的语义化代码可以直接从代码上就能看出来那一块到底是要表达什么内容。

## 为什么要使用语义化标签？

有伙伴会认为，我用DIV+CSS也能做出来一样的效果，虽然单纯看实现效果，两者并没有什么区别。

但是页面不止是给人看的，机器也要看爬虫也要看，网页结构更清晰方便开发维护。

特别是在网络或其他原因页面样式文件丢失的时候，良好语义结构组成的页面，肯定比全是div的页面对用户更友好。

总结下语义化的优点：

* 标签语义化有助于构架良好的HTML结构，有利于搜索引擎的建立索引、抓取。简单来说。
* 有利于不同设备的解析（屏幕阅读器，盲人阅读器等）
* 有利于构建清晰的机构，有利于团队的开发、维护

</details>

## 2. CSS盒模型、Flex布局与Grid布局的区别及适用场景 {#question-subjective-c66a747cbe22}

### 题目要点

CSS盒模型/box-sizing/Flex布局/Grid布局/一维 vs 二维/布局适用场景/页面结构设计

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握 CSS 中盒模型的基本概念及布局行为
- Flex 与 Grid 的本质区别及使用场景是否清晰
- 能否结合实际 UI 场景选择最合适的布局方式
- 是否理解布局系统与页面结构解耦的设计思想

#### 二、参考答案

##### 1.1 原理说明

---

### ✅ 一、CSS 盒模型（Box Model）

**定义**：所有 HTML 元素都可以看作一个矩形盒子，由以下四层组成：

1. **Content**（内容区域）：放置文本、图片等内容；
2. **Padding**（内边距）：内容与边框之间的距离；
3. **Border**（边框）：围绕 padding 和内容的线；
4. **Margin**（外边距）：盒子与其他元素之间的空间。

两种盒模型模式：

- `content-box`（默认）：width/height 只包括内容区域；
- `border-box`：width/height 包含内容 + padding + border，更符合开发直觉。

```css
box-sizing: border-box;
````

使用 `border-box` 可以减少布局计算错误，是主流推荐写法。

---

### ✅ 二、Flex 布局（弹性布局）

**特点**：

* 一维布局系统：**在主轴方向（横或竖）上进行排列和对齐**
* 默认主轴为横向（row），支持换行（flex-wrap）；
* 子项可自由伸缩、自动分配空间，支持对齐、排序等控制。

适合场景：

* 水平或垂直方向的线性排列；
* 容器宽度/高度不固定、元素等比分布；
* 常用于：导航栏、按钮组、卡片排布等。

示例：

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

### ✅ 三、Grid 布局（网格布局）

**特点**：

* 二维布局系统：**同时控制行与列**
* 支持按网格分区布局，精确控制每一格的位置和大小；
* 支持显式区域命名、自动填充等高级功能。

适合场景：

* 整体页面布局（如 header/sidebar/main/footer）；
* 数据看板、表格式展示；
* 多行多列栅格设计。

示例：

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto 100px;
  gap: 20px;
}
```

---

### ✅ 四、Flex vs Grid 对比总结

| 特性     | Flex        | Grid               |
| ------ | ----------- | ------------------ |
| 维度     | 一维（主轴）      | 二维（行 + 列）          |
| 子项位置控制 | 相对顺序        | 可显式放入网格            |
| 适合场景   | 列表、导航栏、均分元素 | 整体结构布局、复杂页面区域      |
| 浏览器支持  | 广泛支持        | Edge 16+、现代浏览器全面支持 |

---

##### 1.3 常见误区或面试陷阱

* **Flex 并不适合二维布局**，勉强用 Flex 处理多行多列会增加嵌套复杂度；
* **误用 Grid 布局做等宽分布**，实际这类场景 Flex 更简单；
* **未设置 `box-sizing: border-box` 导致盒子溢出问题频发**；
* **不了解 `min-content`, `auto`, `fr` 在 Grid 中的差异**；
* **误以为 Grid 替代 Flex**，实际二者应合理搭配使用。

</details>

## 3. CSS中的 “flex:1;” 是什么意思？ {#question-286f67d3-4e8d-48f5-962a-ed9cccc46335}

> 题库原题：[CSS中的 “flex:1;” 是什么意思？](https://fe.ecool.fun/topic/286f67d3-4e8d-48f5-962a-ed9cccc46335)

### 题目要点

在CSS中，flex: 1; 是一个简写属性，用于设置一个元素为Flexbox子项时的布局行为。具体来说，它包括以下几个部分：

- flex-grow：定义了当父容器有多余空间时，子项如何增长。flex-grow: 1 表示子项将尽可能多地占据可用空间。
- flex-shrink：定义了当父容器空间不足时，子项如何缩小。默认值是 1，表示子项可以等比例缩小以适应容器空间。
- flex-basis：定义了在分配多余空间之前，子项的默认大小。flex-basis: 1 通常意味着子项的初始大小是相对于父容器的1%（如果父容器设置了flex-basis）。

flex: 1; 通常用于确保Flexbox子项能够充满其父容器，同时在空间不足时能够适当缩小，保持布局的灵活性。

<details>
<summary>参考答案</summary>

flex 是 flex-grow, flex-shrink 和 flex-basis的简写。

除了auto (1 1 auto) 和 none (0 0 auto)这两个快捷值外，还有以下设置方式：

* 当 flex 取值为一个非负数字，则该数字为 flex-grow 值，flex-shrink 取 1，flex-basis 取 0%，如下是等同的：

```css
.item {flex: 1;}
.item {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
}
```

* 当 flex 取值为 0 时，对应的三个值分别为 0 1 0%

```css
.item {flex: 0;}
.item {
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: 0%;
}
```

* 当 flex 取值为一个长度或百分比，则视为 flex-basis 值，flex-grow 取 1，flex-shrink 取 1，有如下等同情况（注意 0% 是一个百分比而不是一个非负数字）

```css
.item-1 {flex: 0%;}
.item-1 {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
}

.item-2 {flex: 24px;}
.item-2 {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 24px;
}
```

* 当 flex 取值为两个非负数字，则分别视为 flex-grow 和 flex-shrink 的值，flex-basis 取 0%，如下是等同的：

```css
.item {flex: 2 3;}
.item {
    flex-grow: 2;
    flex-shrink: 3;
    flex-basis: 0%;
}
```

* 当 flex 取值为一个非负数字和一个长度或百分比，则分别视为 flex-grow 和 flex-basis 的值，flex-shrink 取 1，如下是等同的：

```
.item {flex: 11 32px;}
.item {
    flex-grow: 11;
    flex-shrink: 1;
    flex-basis: 32px;
}
```

</details>

## 4. 说说你对闭包的理解，以及闭包使用场景 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

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

## 5. 浏览器和 Node 中的事件循环有什么区别？ {#question-12240b0e-e285-422e-b6ac-b1e839af6cae}

> 题库原题：[浏览器和 Node 中的事件循环有什么区别？](https://fe.ecool.fun/topic/12240b0e-e285-422e-b6ac-b1e839af6cae)

### 题目要点

**作答思路**：

在浏览器中，事件循环是单线程的，包括渲染线程和事件触发线程。事件被添加到事件队列中，然后按照优先级被渲染线程处理。而在Node.js中，事件循环是多线程的，包括主事件循环和I/O事件循环。主事件循环负责执行同步代码，而I/O事件循环则处理异步I/O操作。

**考察要点**：

1. **浏览器事件循环**：理解浏览器中事件循环的基本原理，包括渲染线程和事件触发线程的作用。
2. **Node.js事件循环**：理解Node.js中事件循环的特点，包括主事件循环和I/O事件循环的作用。
3. **线程模型差异**：理解浏览器和Node.js在事件循环方面线程模型的差异，以及这些差异如何影响编程模型。

<details>
<summary>参考答案</summary>

## 浏览器

关于微任务和宏任务在浏览器的执行顺序是这样的：

* 执行一只task（宏任务）
* 执行完micro-task队列 （微任务）

如此循环往复下去

常见的 task（宏任务） 比如：setTimeout、setInterval、script（整体代码）、 I/O 操作、UI 渲染等。
常见的 micro-task 比如: new Promise().then(回调)、MutationObserver(html5新特性) 等。

## Node

Node的事件循环是libuv实现的，引用一张官网的图：

![image.png](https://static.ecool.fun//article/b6d024fe-2847-4749-99ca-7c1a8d9faeba.png)

大体的task（宏任务）执行顺序是这样的：

* timers 定时器：本阶段执行已经安排的 setTimeout() 和 setInterval() 的回调函数。
* pending callbacks待定回调：执行延迟到下一个循环迭代的 I/O 回调。
* idle, prepare：仅系统内部使用。
* poll 轮询：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，它们由计时器 setImmediate() 排定的之外），其余情况 node 将在此处阻塞。
* check 检测：setImmediate() 回调函数在这里执行。
* close callbacks 关闭的回调函数：一些准备关闭的回调函数，如：socket.on('close', ...)。

微任务和宏任务在Node的执行顺序

Node 10 及以前：

* 执行完一个阶段的所有任务
* 执行完nextTick队列里面的内容
* 然后执行完微任务队列的内容

Node 11以后：
和浏览器的行为统一了，都是每执行一个宏任务就执行完微任务队列。

</details>

## 6. CSS 垂直居中有哪些实现方式？ {#question-1d338445-7c02-4ffa-9541-1f7a00896244}

> 题库原题：[CSS 垂直居中有哪些实现方式？](https://fe.ecool.fun/topic/1d338445-7c02-4ffa-9541-1f7a00896244)

### 题目要点

我们在布局一个页面时，通常都会用到水平居中和垂直居中，处理水平居中很好处理，不外乎就是设定margin:0 auto;或是text-align:center;,就可以轻松解决掉水平居中的问题，但一直以来最麻烦对齐问题就是「垂直居中」，以下将介绍几种单纯利用CSS垂直居中的方式，只需要理解背后的原理就可以轻松应用。

<details>
<summary>参考答案</summary>

我们在布局一个页面时，通常都会用到水平居中和垂直居中，处理水平居中很好处理，不外乎就是设定margin:0 auto;或是text-align:center;,就可以轻松解决掉水平居中的问题，但一直以来最麻烦对齐问题就是「垂直居中」，以下将介绍几种单纯利用CSS垂直居中的方式，只需要理解背后的原理就可以轻松应用。

下面为公共代码：

```html
<div class="box">
    <div class="small">small</div>
</div>
```

```css
.box {
    width: 300px;
    height: 300px;
    background: #ddd;
}
.small {
    background: red;
}

```

## absolute + margin实现

方法一：

```css
.box {
    position: relative;
}
.small {
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -50px 0 0 -50px;
    width: 100px;
    height: 100px;
}
```

方法二：

```css
.box {
    position: relative;
}
.small {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 100px;
    height: 100px;
}
```

## absolute + calc 实现

```css
.box {
    position: relative;
}
.small {
    position: absolute;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
    width: 100px;
    height: 100px;
}
```

## absolute + transform 实现

```css
.box {
    position: relative;
}
.small {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,0);
    width: 100px;
    height: 100px;
}

```

## 转行内元素

```css
.box {
    line-height: 300px;
    text-align: center;
    font-size: 0px;
}
.small {
    padding: 6px 10px;
    font-size: 16px;
    display: inline-block;
    vertical-align: middle;
    line-height: 16px;
}
```

## table-cell

```
.box {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
}
.small {
    padding: 6px 10px;
    display: inline-block;
}
```

## flex

方法一：

```css
.box {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

方法二：

```css
.box {
    display: flex;
    justify-content: center;
}
.small {
    align-self: center;
}
```

## 08 grid

网格布局（Grid）是最强大的 CSS 布局方案。

它将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。以前，只能通过复杂的 CSS 框架达到的效果，现在浏览器内置了。

下面是4种使用grid实现水平垂直居中的例子。

方法一：

```css
.box {
    display: grid;
    justify-items: center;
    align-items: center;
}
```

方法二：

```css
.box {
    display: grid;
}
.small {
    justify-self: center;
    align-self: center;
}
```

方法三：

```css
.box {
    display: grid;
    justify-items: center;
}
.small {
    align-self: center;
}

```

方法四：

```css
.box {
    display: grid;
    align-items: center;
}
.small {
    justify-self: center;
}
```

</details>

## 7. 浏览器有哪几种缓存，各种缓存的优先级是什么样的？ {#question-ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87}

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

## 8. 前端怎么实现跨域请求？ {#question-56e56a05-99c7-4701-ae72-e06d2c6a4d42}

> 题库原题：[前端怎么实现跨域请求？](https://fe.ecool.fun/topic/56e56a05-99c7-4701-ae72-e06d2c6a4d42)

### 题目要点

**答题思路：**

跨域是指浏览器出于安全考虑，限制不同源之间的资源请求。同源策略限制存储内容、DOM节点和AJAX请求。但某些HTML标签如`<img>`、`&lt;link&gt;`、`&lt;script&gt;`可跨域加载资源。跨域并非请求发不出，而是响应被浏览器拦截。
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
* `&lt;link href=XXX&gt;`
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

## 9. 简单描述从输入网址到页面显示的过程 {#question-5def10e9-7825-4bd4-a76e-6d7eb555a2ce}

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

## 10. Promise与Async/Await的实现原理及错误处理 {#question-subjective-e255e194a38b}

### 题目要点

Promise/async/await/语法糖/微任务/错误处理/try-catch/then-catch链

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握 Promise 的核心机制与状态流转
- 是否理解 async/await 是 Promise 的语法糖
- 对异步执行模型（微任务、事件循环）是否有清晰认知
- 是否了解 Promise 和 async/await 的错误处理方式与区别

#### 二、参考答案

##### 1.1 原理说明

---

### ✅ 一、Promise 实现原理

**Promise 是一个表示异步操作最终完成或失败的对象。**

其核心机制包括：

- 三种状态：`pending`（进行中）、`fulfilled`（成功）、`rejected`（失败）；
- 状态不可逆，只能改变一次；
- 通过 `.then()` 链式调用，返回新的 Promise，形成 promise 链；
- 使用微任务队列（Microtask）执行 `.then()` 回调。

简单实现原理概念：

```js
new Promise((resolve, reject) => {
  // 异步操作
}).then(result => {
  // 成功处理
}).catch(error => {
  // 错误处理
});
````

---

### ✅ 二、async/await 实现原理

**async/await 是基于 Promise 的语法糖**，本质上是用同步的方式写异步逻辑。

编译后 async 函数仍会被转为 Promise，内部通过生成器 + 状态机 + `then()` 实现自动调用链。

```js
async function fetchData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('fetch failed', err);
  }
}
```

关键行为：

* `await` 会暂停 async 函数的执行，等待 Promise 解决后再恢复；
* 多个 await 会按顺序执行，串行；
* 如果 await 的 Promise reject，会跳入 try/catch。

---

### ✅ 三、错误处理对比

| 方式          | 错误捕获方法      | 是否链式 | 是否强依赖 try/catch |
| ----------- | ----------- | ---- | --------------- |
| Promise     | `.catch()`  | 是    | 否               |
| async/await | try/catch 块 | 否    | 是               |

**注意点：**

* `Promise.catch()` 只捕获上一个 `.then()` 抛出的错误；
* async 函数内部未写 try/catch 会返回 reject 的 Promise，需要外部 `.catch()` 捕获；
* `await` 后面最好不要直接写非 Promise 表达式，避免异常无法捕获。

---

##### 1.3 常见误区或面试陷阱

* **以为 async 函数一定是同步的**：async 函数始终返回一个 Promise。
* **await 后不是 Promise 也能等待？** 是的，会自动封装为 resolved Promise，但不推荐滥用。
* **未用 try/catch 包裹 await，错误被吞掉**：async 错误不会冒泡，需要开发者显式处理。
* **误认为 async/await 比 Promise 更快**：两者底层机制相同，区别在可读性与控制结构。

</details>

## 11. 什么是内存泄漏？什么原因会导致呢？ {#question-b9bd9552-5748-45b1-88a8-f36e45f6261f}

> 题库原题：[什么是内存泄漏？什么原因会导致呢？](https://fe.ecool.fun/topic/b9bd9552-5748-45b1-88a8-f36e45f6261f)

### 题目要点

#### 答题思路

什么是内存泄漏？

- **定义**：内存泄漏（Memory Leak）是指程序中已分配的内存由于某种原因未被释放或无法释放，导致这部分内存无法再次被使用，造成内存的浪费和程序的潜在性能问题。

什么原因会导致内存泄漏？

1. **全局变量**：不当地使用全局变量或在全局作用域中创建变量，这些变量在整个页面生命周期内都不会被自动释放。

2. **闭包**：闭包可以保持对外部函数作用域中变量的引用，如果这些变量是较大的对象或数组，且闭包本身未被及时销毁，那么这些变量所占用的内存也无法被释放。

3. **DOM引用**：在JavaScript中，如果DOM元素被JavaScript变量引用，即使这些DOM元素已经从页面上移除了，它们所占用的内存也不会被释放，因为JavaScript仍然保持着对这些元素的引用。

4. **定时器**：如`setTimeout`或`setInterval`创建的定时器，如果定时器中的回调函数引用了外部变量，而这些变量又包含了大量数据或DOM元素，那么在定时器未被清除之前，这些资源都无法被释放。

5. **第三方库**：使用的第三方库可能存在内存泄漏的问题，特别是当这些库管理大量资源（如DOM元素、数据等）时。

6. **内存泄漏的连锁反应**：一个小的内存泄漏可能会引发连锁反应，导致更多的内存泄漏，最终严重影响程序的性能和稳定性。

#### 考察要点

1. **内存管理知识**：考察面试者对JavaScript内存管理机制的理解，包括垃圾回收机制、作用域链等。

2. **编程习惯**：通过询问内存泄漏的原因，考察面试者的编程习惯和代码质量意识。

3. **问题解决能力**：面试者是否能够识别和解决潜在的内存泄漏问题，以及是否有有效的策略来预防内存泄漏。

<details>
<summary>参考答案</summary>

内存泄露的解释：程序中己动态分配的堆内存由于某种原因未释放或无法释放。

* 根据JS的垃圾回收机制，当内存中引用的次数为0的时候内存才会被回收
* 全局执行上下文中的对象被标记为不再使用才会被释放

## 内存泄露的几种场景

* 全局变量过多。**通常是变量未被定义或者胡乱引用了全局变量**
```js
// main.js
// 场景1
function a(){
    b=10;
}
a();
b++;

// 场景2
setTimeout(()=>{
    console.log(b)
},1000)
```

* 闭包。 未手动解决必包遗留的内存引用。**定义了闭包就要消除闭包带来的副作用**。

```js

function closuer (){
    const b = 0;
    return (c)=> b + c
}

const render = closuer();

render();
render = null; // 手动设置为null，GC会自己去清除
```

* 事件监听未被移除
```js

function addEvent (){
 const node =  document.getElementById('warp');
    node.addEventListener('touchmove',()=>{
        console.log('In Move');
    })
}

const onTouchEnd = (){
   const node =  document.getElementById('warp');
   node.
}

useEffect(()=>()=>{
     const node =  document.getElementById('warp');
     node.removeEventListener('touchmove');
}) // 类似react 生命周期函数： componentWillUnmount
render(<div id='warp' onTouchEnd={onTouchEnd}>
 // code...
</div>)
```

* 缓存。建议所有缓存都设置好过期时间。

</details>

## 12. 数组去重 {#question-f56b93a9-52df-49ae-8d63-d7ee4f816f8b}

> 题库原题：[数组去重](https://fe.ecool.fun/topic/f56b93a9-52df-49ae-8d63-d7ee4f816f8b)

```js
const arr = [1, 1, '1', 17, true, true, false, false, 'true', 'a', {}, {}];
// => [1, '1', 17, true, false, 'true', 'a', {}, {}]
```

### 题目要点

方法一：利用Set

<details>
<summary>参考答案</summary>

* 方法一：利用Set
```js
const res1 = Array.from(new Set(arr));
```

* 方法二：两层for循环+splice
```js
const unique1 = arr => {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
        // 每删除一个树，j--保证j的值经过自加后不变。同时，len--，减少循环次数提升性能
        len--;
        j--;
      }
    }
  }
  return arr;
}
```

* 方法三：利用indexOf
```js
const unique2 = arr => {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) res.push(arr[i]);
  }
  return res;
}
```

当然也可以用include、filter，思路大同小异。

* 方法四：利用include
```js
const unique3 = arr => {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!res.includes(arr[i])) res.push(arr[i]);
  }
  return res;
}
```

* 方法五：利用filter
```js
const unique4 = arr => {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}
```

* 方法六：利用Map
```js
const unique5 = arr => {
  const map = new Map();
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      map.set(arr[i], true)
      res.push(arr[i]);
    }
  }
  return res;
}
```

</details>

## 13. 什么是响应式设计？响应式设计的基本原理是什么？如何进行实现？ {#question-dc8c6233-f645-444c-8e31-f18bc3f5244f}

> 题库原题：[什么是响应式设计？响应式设计的基本原理是什么？如何进行实现？](https://fe.ecool.fun/topic/dc8c6233-f645-444c-8e31-f18bc3f5244f)

### 题目要点

响应式设计（Responsive Design）是一种网页设计方法，旨在使网页在各种设备和屏幕尺寸上都能提供良好的用户体验。响应式设计通过使用流式布局、弹性网格和媒体查询，使得网页能够根据不同的设备特性（如屏幕大小、分辨率、方向等）自动调整其布局和内容。

### 响应式设计的基本原理

1. **流式布局（Fluid Layouts）**：
   - 使用相对单位（如百分比、`vw`、`vh`）而不是绝对单位（如像素），使得网页布局能够根据容器的宽度自动调整。例如，使用百分比设置宽度，可以让列宽度随着屏幕尺寸的变化而变化。

2. **弹性网格（Flexible Grid Systems）**：
   - 利用网格系统设计布局，将页面划分为多个灵活的区域。这些区域能够根据屏幕尺寸调整大小，从而实现不同设备上的适配。

3. **媒体查询（Media Queries）**：
   - 使用 CSS 媒体查询，根据设备的特性（如宽度、高度、分辨率等）应用不同的样式规则。媒体查询可以针对不同的屏幕尺寸、方向（横向或纵向）等条件设置样式。

### 如何实现响应式设计

1. **使用流式布局**：
   - 在 CSS 中使用相对单位（如 `%`, `em`, `rem`, `vh`, `vw`）设置宽度和高度。例如：
     ```css
     .container {
       width: 80%; /* 宽度为容器的 80% */
     }
     ```

2. **利用弹性网格系统**：
   - 创建一个弹性网格布局，可以使用 CSS Grid 或 Flexbox。例如，使用 Flexbox：
     ```css
     .container {
       display: flex;
       flex-wrap: wrap; /* 自动换行 */
     }
     .item {
       flex: 1 1 300px; /* 自动调整宽度，最小宽度为 300px */
       margin: 10px;
     }
     ```

3. **编写媒体查询**：
   - 针对不同的屏幕尺寸和设备特性编写 CSS 规则。例如：
     ```css
     /* 默认样式 */
     .container {
       width: 100%;
     }

     /* 当屏幕宽度小于 600px 时 */
     @media (max-width: 600px) {
       .container {
         width: 90%;
       }
     }

     /* 当屏幕宽度大于等于 600px 并小于 1200px 时 */
     @media (min-width: 600px) and (max-width: 1200px) {
       .container {
         width: 80%;
       }
     }

     /* 当屏幕宽度大于等于 1200px 时 */
     @media (min-width: 1200px) {
       .container {
         width: 70%;
       }
     }
     ```

4. **使用弹性图片和媒体**：
   - 确保图片和其他媒体内容根据屏幕尺寸调整大小，防止超出容器或显示不正常。使用 `max-width: 100%` 可以确保图片在容器中缩放：
     ```css
     img {
       max-width: 100%; /* 图片不会超出容器宽度 */
       height: auto; /* 高度自适应 */
     }
     ```

5. **测试和优化**：
   - 在不同的设备和屏幕尺寸上测试网页，以确保布局和设计在各种环境中都能正常显示。使用浏览器的开发者工具模拟不同设备的视图进行测试。

### 示例

**响应式布局示例：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Design Example</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .container {
      display: flex;
      flex-wrap: wrap;
      padding: 10px;
    }
    .box {
      flex: 1 1 200px;
      background-color: #ccc;
      margin: 10px;
      padding: 20px;
      box-sizing: border-box;
    }
    /* 媒体查询 */
    @media (max-width: 600px) {
      .box {
        flex: 1 1 100%; /* 在小屏幕上每个盒子占满整行 */
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">Box 1</div>
    <div class="box">Box 2</div>
    <div class="box">Box 3</div>
  </div>
</body>
</html>
```

### 总结

响应式设计的核心是确保网页在各种设备上都能提供良好的用户体验。通过使用流式布局、弹性网格、媒体查询和弹性图片等技术，可以创建适应不同屏幕尺寸和分辨率的网页。

<details>
<summary>参考答案</summary>

## 一、是什么

响应式网站设计（Responsive Web design）是一种网络页面设计布局，页面的设计与开发应当根据用户行为以及设备环境(系统平台、屏幕尺寸、屏幕定向等)进行相应的响应和调整

描述响应式界面最著名的一句话就是“Content is like water”

大白话便是“如果将屏幕看作容器，那么内容就像水一样”

响应式网站常见特点：

- 同时适配PC + 平板 + 手机等

- 标签导航在接近手持终端设备时改变为经典的抽屉式导航

- 网站的布局会根据视口来调整模块的大小和位置

 ![](https://static.ecool.fun//article/3e044cad-d40d-467e-ae42-290e94e41d3f.png)

## 二、实现方式

响应式设计的基本原理是通过媒体查询检测不同的设备屏幕尺寸做处理，为了处理移动端，页面头部必须有`meta`声明`viewport`

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no”>
```

属性对应如下：

- width=device-width: 是自适应手机屏幕的尺寸宽度

- maximum-scale:是缩放比例的最大值

- inital-scale:是缩放的初始化

- user-scalable:是用户的可以缩放的操作

实现响应式布局的方式有如下：

- 媒体查询
- 百分比
- vw/vh
- rem

### 媒体查询

`CSS3 `中的增加了更多的媒体查询，就像`if`条件表达式一样，我们可以设置不同类型的媒体条件，并根据对应的条件，给相应符合条件的媒体调用相对应的样式表

使用`@Media`查询，可以针对不同的媒体类型定义不同的样式，如：

```css
@media screen and (max-width: 1920px) { ... }
```

当视口在375px - 600px之间，设置特定字体大小18px

```css
@media screen (min-width: 375px) and (max-width: 600px) {
  body {
    font-size: 18px;
  }
}
```

通过媒体查询，可以通过给不同分辨率的设备编写不同的样式来实现响应式的布局，比如我们为不同分辨率的屏幕，设置不同的背景图片

比如给小屏幕手机设置@2x图，为大屏幕手机设置@3x图，通过媒体查询就能很方便的实现

### 百分比

通过百分比单位 " % " 来实现响应式的效果

 比如当浏览器的宽度或者高度发生变化时，通过百分比单位，可以使得浏览器中的组件的宽和高随着浏览器的变化而变化，从而实现响应式的效果

`height`、`width`属性的百分比依托于父标签的宽高，但是其他盒子属性则不完全依赖父元素：

- 子元素的top/left和bottom/right如果设置百分比，则相对于直接非static定位(默认定位)的父元素的高度/宽度

- 子元素的padding如果设置百分比，不论是垂直方向或者是水平方向，都相对于直接父亲元素的width，而与父元素的height无关。

- 子元素的margin如果设置成百分比，不论是垂直方向还是水平方向，都相对于直接父元素的width

- border-radius不一样，如果设置border-radius为百分比，则是相对于自身的宽度

可以看到每个属性都使用百分比，会照成布局的复杂度，所以不建议使用百分比来实现响应式

### vw/vh

`vw`表示相对于视图窗口的宽度，`vh`表示相对于视图窗口高度。 任意层级元素，在使用`vw`单位的情况下，`1vw`都等于视图宽度的百分之一

与百分比布局很相似，在以前文章提过与`%`的区别，这里就不再展开述说

### rem

在以前也讲到，`rem`是相对于根元素`html`的`font-size`属性，默认情况下浏览器字体大小为`16px`，此时`1rem = 16px`

可以利用前面提到的媒体查询，针对不同设备分辨率改变`font-size`的值，如下：

```css
@media screen and (max-width: 414px) {
  html {
    font-size: 18px
  }
}

@media screen and (max-width: 375px) {
  html {
    font-size: 16px
  }
}

@media screen and (max-width: 320px) {
  html {
    font-size: 12px
  }
}
```

为了更准确监听设备可视窗口变化，我们可以在`css`之前插入`script`标签，内容如下：

```js
//动态为根元素设置字体大小
function init () {
    // 获取屏幕宽度
    var width = document.documentElement.clientWidth
    // 设置根元素字体大小。此时为宽的10等分
    document.documentElement.style.fontSize = width / 10 + 'px'
}

//首次加载应用，设置一次
init()
// 监听手机旋转的事件的时机，重新设置
window.addEventListener('orientationchange', init)
// 监听手机窗口变化，重新设置
window.addEventListener('resize', init)
```

无论设备可视窗口如何变化，始终设置`rem`为`width`的1/10，实现了百分比布局

除此之外，我们还可以利用主流`UI`框架，如：`element ui`、`antd`提供的栅格布局实现响应式

### 小结

响应式设计实现通常会从以下几方面思考：

- 弹性盒子（包括图片、表格、视频）和媒体查询等技术
- 使用百分比布局创建流式布局的弹性UI，同时使用媒体查询限制元素的尺寸和内容变更范围
- 使用相对单位使得内容自适应调节
- 选择断点，针对不同断点实现不同布局和内容展示

## 三、总结

响应式布局优点可以看到：

- 面对不同分辨率设备灵活性强
- 能够快捷解决多设备显示适应问题

缺点：

- 仅适用布局、信息、框架并不复杂的部门类型网站
- 兼容各种设备工作量大，效率低下
- 代码累赘，会出现隐藏无用的元素，加载时间加长
- 其实这是一种折中性质的设计解决方案，多方面因素影响而达不到最佳效果
- 一定程度上改变了网站原有的布局结构，会出现用户混淆的情况

</details>

## 14. 如何提高webpack的构建速度？ {#question-4cf47e01-92e5-4e04-ab83-f4eca1953e23}

> 题库原题：[如何提高webpack的构建速度？](https://fe.ecool.fun/topic/4cf47e01-92e5-4e04-ab83-f4eca1953e23)

### 题目要点

* Webpack 构建慢的根源在于**模块数量多、体积大、处理流程长**；
* 提升构建速度需从**缓存、并发、范围控制、按需加载**四个方向优化；
* 区分开发和生产环境进行有针对性的配置调整；
* 借助生态工具（如 thread-loader、BundleAnalyzer、TerserPlugin）提升自动化与调试效率；
* 保持依赖精简、代码可维护，有助于从源头优化构建时间。

<details>
<summary>参考答案</summary>

Webpack 的构建过程本质上包括**模块解析、加载、编译、优化、输出**等多个阶段，因此优化手段也需从多个维度入手。

以下从**开发模式（`webpack-dev-server`）和生产模式（`webpack build`）两个阶段**，分别分析提高构建速度的关键策略。

---

## 一、通用优化策略

### 1. **合理使用缓存**

* **开启持久化缓存**（Webpack 5）：

  ```js
  module.exports = {
    cache: {
      type: 'filesystem',
    },
  };
  ```

  能将模块编译结果缓存到磁盘，避免重复编译。

* **`babel-loader` 开启缓存**：

  ```js
  {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true
    }
  }
  ```

### 2. **减少模块解析范围**

* **使用 `include` / `exclude` 精准匹配**

  ```js
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: path.resolve(__dirname, 'src'),
    exclude: /node_modules/
  }
  ```

* **配置 `resolve.extensions` 精简后缀解析**

  ```js
  resolve: {
    extensions: ['.js', '.ts']
  }
  ```

* **配置 `resolve.alias` 减少深层查找**

  ```js
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
  ```

### 3. **并行/多进程处理**

* **使用 `thread-loader`** 处理 JS/TS 转译等耗时任务：

  ```js
  {
    test: /\.js$/,
    use: ['thread-loader', 'babel-loader']
  }
  ```

* **使用 `terser-webpack-plugin` 的并行压缩**：
  Webpack 5 中默认已启用，手动配置时可设置：

  ```js
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ parallel: true })]
  }
  ```

---

## 二、开发阶段优化（提升热更新和增量编译速度）

### 1. **使用 `webpack-dev-server` + HMR**

* 启用热模块替换（HMR），只更新变更部分，提高效率；
* 配合 React Fast Refresh、Vue HMR 插件，提升开发体验。

### 2. **开启 `source-map` 优化模式**

* 开发阶段推荐：

  ```js
  devtool: 'cheap-module-source-map'
  ```

  比 `eval-source-map` 更快，调试体验仍可接受。

### 3. **使用模块缓存机制**

* Webpack 会将未变更模块缓存，如果未配置 `module.id`，建议开启：

  ```js
  optimization: {
    moduleIds: 'deterministic'
  }
  ```

---

## 三、生产阶段优化（压缩构建产物）

### 1. **Tree Shaking（摇树优化）**

* 确保使用 `ESModule` 规范（`import`/`export`），否则无法移除无用代码；
* 设置 `sideEffects: false`，移除副作用模块（需谨慎）：

  ```json
  // package.json
  {
    "sideEffects": false
  }
  ```

### 2. **合理分包 + 动态引入**

* 利用 `SplitChunksPlugin` 拆分公共依赖和第三方库，减少重复打包：

  ```js
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
  ```

* 对大型路由模块按需加载，减少初始构建体积。

### 3. **缩小构建目标范围**

* 使用 `IgnorePlugin` 忽略无用语言包等：

  ```js
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  });
  ```

* 精简 polyfill，例如使用 `core-js-pure` 或按需引入。

---

## 四、其他技巧与工具

### 1. **使用 `webpack-bundle-analyzer` 分析体积**

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
```

定位冗余依赖和重复打包问题。

### 2. **使用轻量替代库**

* 用 `dayjs` 替代 `moment`；
* 用 `lodash-es` + Tree Shaking 替代整个 lodash。

### 3. **升级到 Webpack 5**

Webpack 5 提供了更好的缓存机制、更快的构建性能和内置优化能力。

</details>

## 15. 解释XSS和CSRF攻击原理及防护措施 {#question-subjective-28cd588cf21a}

### 题目要点

XSS/CSRF/前端安全/CSP/Token验证/HTML转义/SameSite/跨站攻击/Referer验证

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否理解 XSS 与 CSRF 的本质区别（主动攻击 vs 被动伪造）
- 是否掌握各类攻击的成因、表现与常见形式
- 是否熟悉 Web 安全防护手段，如 CSP、Token 验证、SameSite Cookie 等
- 是否能结合前后端联动的思路进行系统性防护

#### 二、参考答案

##### 1.1 攻击原理解释

---

### ✅ 一、XSS（跨站脚本攻击）

**原理**：

攻击者将恶意脚本注入到网站页面中，当其他用户访问时，这段脚本会在用户浏览器中执行，从而窃取 Cookie、执行操作或篡改页面内容。

**常见类型**：

1. **反射型 XSS**：恶意脚本通过 URL 参数传入并立即响应执行；
2. **存储型 XSS**：恶意脚本被存入数据库（如评论），后续访问自动触发；
3. **DOM 型 XSS**：攻击利用前端 JS 操作 DOM 导致脚本执行。

**防护措施**：

- **输出内容时进行 HTML 转义/编码**；
- **使用 CSP（内容安全策略）限制可执行脚本来源**；
- **避免使用 `innerHTML` 等危险 API**；
- **对用户输入做白名单校验**。

---

### ✅ 二、CSRF（跨站请求伪造）

**原理**：

攻击者诱导用户点击某个链接或页面，自动向受信网站发送请求（如转账、修改密码），借此“伪造用户操作”。

**关键点**：浏览器会自动携带用户的 Cookie，导致“请求来源合法、意图恶意”。

**攻击条件**：

- 用户已登录目标网站（如银行网站）；
- 攻击者诱导用户访问含恶意请求的页面；
- 后端无鉴别机制来判断请求是否来自“用户真实意图”。

**防护措施**：

- **使用 CSRF Token 并在每次请求中校验**；
- **验证请求头 Referer / Origin**；
- **开启 Cookie 的 SameSite 属性（推荐：Strict 或 Lax）**；
- **敏感操作必须要求重新登录或二次验证（如验证码）**。

---

##### 1.3 常见误区或面试陷阱

- **混淆 XSS 与 CSRF 的攻击方向**：XSS 是攻击用户，CSRF 是利用用户攻击服务端；
- **误以为 HTTPS 可防 XSS/CSRF**：HTTPS 只能加密传输，不能防逻辑攻击；
- **CSRF Token 写在 Cookie 中**：这会失效，应放在请求体或 Header 中；
- **未对 DOM 操作做白名单检查，导致 DOM 型 XSS 泄露漏洞**；
- **设置了 CSP 但允许了 `unsafe-inline`，实际无防护效果**。

</details>

## 16. 大文件怎么实现断点续传？ {#question-7b63d3a8-32c4-4561-95fc-77755ea629f1}

> 题库原题：[大文件怎么实现断点续传？](https://fe.ecool.fun/topic/7b63d3a8-32c4-4561-95fc-77755ea629f1)

### 题目要点

- **文件分块**：将大文件分成多个块，以便更好地管理和恢复。
- **客户端实现**：处理文件选择、分块上传/下载、保存进度、恢复操作。
- **服务器端实现**：支持接收文件块、合并块、处理断点续传请求。
- **技术支持**：使用 HTTP 头部（如 `Range`、`Content-Range`）和状态记录来实现断点续传。

<details>
<summary>参考答案</summary>

## 一、是什么

不管怎样简单的需求，在量级达到一定层次时，都会变得异常复杂

文件上传简单，文件变大就复杂

上传大文件时，以下几个变量会影响我们的用户体验

- 服务器处理数据的能力
- 请求超时
- 网络波动

上传时间会变长，高频次文件上传失败，失败后又需要重新上传等等

为了解决上述问题，我们需要对大文件上传单独处理

这里涉及到分片上传及断点续传两个概念

#### 分片上传

分片上传，就是将所要上传的文件，按照一定的大小，将整个文件分隔成多个数据块（Part）来进行分片上传

如下图

 ![](https://static.ecool.fun//article/601be6fe-4b6e-420b-b88a-0e54be051d02.png)

上传完之后再由服务端对所有上传的文件进行汇总整合成原始的文件

大致流程如下：

1. 将需要上传的文件按照一定的分割规则，分割成相同大小的数据块；
2. 初始化一个分片上传任务，返回本次分片上传唯一标识；
3. 按照一定的策略（串行或并行）发送各个分片数据块；
4. 发送完成后，服务端根据判断数据上传是否完整，如果完整，则进行数据块合成得到原始文件

#### 断点续传

断点续传指的是在下载或上传时，将下载或上传任务人为的划分为几个部分

每一个部分采用一个线程进行上传或下载，如果碰到网络故障，可以从已经上传或下载的部分开始继续上传下载未完成的部分，而没有必要从头开始上传下载。用户可以节省时间，提高速度

一般实现方式有两种：

- 服务器端返回，告知从哪开始
- 浏览器端自行处理

上传过程中将文件在服务器写为临时文件，等全部写完了（文件上传完），将此临时文件重命名为正式文件即可

如果中途上传中断过，下次上传的时候根据当前临时文件大小，作为在客户端读取文件的偏移量，从此位置继续读取文件数据块，上传到服务器从此偏移量继续写入文件即可

## 二、实现思路

整体思路比较简单，拿到文件，保存文件唯一性标识，切割文件，分段上传，每次上传一段，根据唯一性标识判断文件上传进度，直到文件的全部片段上传完毕

![](https://static.ecool.fun//article/a9b201e1-12dc-4598-a7a1-205a15d573f2.png)

下面的内容都是伪代码

读取文件内容：

```js
const input = document.querySelector('input');
input.addEventListener('change', function() {
    var file = this.files[0];
});
```

可以使用`md5`实现文件的唯一性

```js
const md5code = md5(file);
```

然后开始对文件进行分割

```js
var reader = new FileReader();
reader.readAsArrayBuffer(file);
reader.addEventListener("load", function(e) {
    //每10M切割一段,这里只做一个切割演示，实际切割需要循环切割，
    var slice = e.target.result.slice(0, 10*1024*1024);
});
```

h5上传一个（一片）

```js
const formdata = new FormData();
formdata.append('0', slice);
//这里是有一个坑的，部分设备无法获取文件名称，和文件类型，这个在最后给出解决方案
formdata.append('filename', file.filename);
var xhr = new XMLHttpRequest();
xhr.addEventListener('load', function() {
    //xhr.responseText
});
xhr.open('POST', '');
xhr.send(formdata);
xhr.addEventListener('progress', updateProgress);
xhr.upload.addEventListener('progress', updateProgress);

function updateProgress(event) {
    if (event.lengthComputable) {
        //进度条
    }
}
```

这里给出常见的图片和视频的文件类型判断

```js
function checkFileType(type, file, back) {
/**
* type png jpg mp4 ...
* file input.change=> this.files[0]
* back callback(boolean)
*/
    var args = arguments;
    if (args.length != 3) {
        back(0);
    }
    var type = args[0]; // type = '(png|jpg)' , 'png'
    var file = args[1];
    var back = typeof args[2] == 'function' ? args[2] : function() {};
    if (file.type == '') {
        // 如果系统无法获取文件类型，则读取二进制流，对二进制进行解析文件类型
        var imgType = [
            'ff d8 ff', //jpg
            '89 50 4e', //png

            '0 0 0 14 66 74 79 70 69 73 6F 6D', //mp4
            '0 0 0 18 66 74 79 70 33 67 70 35', //mp4
            '0 0 0 0 66 74 79 70 33 67 70 35', //mp4
            '0 0 0 0 66 74 79 70 4D 53 4E 56', //mp4
            '0 0 0 0 66 74 79 70 69 73 6F 6D', //mp4

            '0 0 0 18 66 74 79 70 6D 70 34 32', //m4v
            '0 0 0 0 66 74 79 70 6D 70 34 32', //m4v

            '0 0 0 14 66 74 79 70 71 74 20 20', //mov
            '0 0 0 0 66 74 79 70 71 74 20 20', //mov
            '0 0 0 0 6D 6F 6F 76', //mov

            '4F 67 67 53 0 02', //ogg
            '1A 45 DF A3', //ogg

            '52 49 46 46 x x x x 41 56 49 20', //avi (RIFF fileSize fileType LIST)(52 49 46 46,DC 6C 57 09,41 56 49 20,4C 49 53 54)
        ];
        var typeName = [
            'jpg',
            'png',
            'mp4',
            'mp4',
            'mp4',
            'mp4',
            'mp4',
            'm4v',
            'm4v',
            'mov',
            'mov',
            'mov',
            'ogg',
            'ogg',
            'avi',
        ];
        var sliceSize = /png|jpg|jpeg/.test(type) ? 3 : 12;
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener("load", function(e) {
            var slice = e.target.result.slice(0, sliceSize);
            reader = null;
            if (slice && slice.byteLength == sliceSize) {
                var view = new Uint8Array(slice);
                var arr = [];
                view.forEach(function(v) {
                    arr.push(v.toString(16));
                });
                view = null;
                var idx = arr.join(' ').indexOf(imgType);
                if (idx > -1) {
                    back(typeName[idx]);
                } else {
                    arr = arr.map(function(v) {
                        if (i > 3 && i < 8) {
                            return 'x';
                        }
                        return v;
                    });
                    var idx = arr.join(' ').indexOf(imgType);
                    if (idx > -1) {
                        back(typeName[idx]);
                    } else {
                        back(false);
                    }

                }
            } else {
                back(false);
            }

        });
    } else {
        var type = file.name.match(/\.(\w+)$/)[1];
        back(type);
    }
}
```

调用方法如下

```js
checkFileType('(mov|mp4|avi)',file,function(fileType){
    // fileType = mp4,
    // 如果file的类型不在枚举之列，则返回false
});
```

上面上传文件的一步，可以改成：

```js
formdata.append('filename', md5code+'.'+fileType);
```

有了切割上传后，也就有了文件唯一标识信息，断点续传变成了后台的一个小小的逻辑判断

后端主要做的内容为：根据前端传给后台的`md5`值，到服务器磁盘查找是否有之前未完成的文件合并信息（也就是未完成的半成品文件切片），取到之后根据上传切片的数量，返回数据告诉前端开始从第几节上传

如果想要暂停切片的上传，可以使用`XMLHttpRequest `的 `abort `方法

## 三、使用场景

- 大文件加速上传：当文件大小超过预期大小时，使用分片上传可实现并行上传多个 Part， 以加快上传速度
- 网络环境较差：建议使用分片上传。当出现上传失败的时候，仅需重传失败的Part
- 流式上传：可以在需要上传的文件大小还不确定的情况下开始上传。这种场景在视频监控等行业应用中比较常见

## 小结

当前的伪代码，只是提供一个简单的思路，想要把事情做到极致，我们还需要考虑到更多场景，比如

- 切片上传失败怎么办
- 上传过程中刷新页面怎么办
- 如何进行并行上传
- 切片什么时候按数量切，什么时候按大小切
- 如何结合 Web Work 处理大文件上传
- 如何实现秒传

人生又何尝不是如此，极致的人生体验有无限可能，越是后面才发现越是精彩 ~_~

</details>

## 17. 虚拟DOM的作用及Diff算法优化思路 {#question-subjective-5da406e9c012}

### 题目要点

虚拟DOM/Diff算法/key/性能优化/同层比较/最长递增子序列/patch/更新流程

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否理解虚拟 DOM 的设计动机与性能优势
- 能否清晰解释虚拟 DOM 的结构与更新流程
- 是否了解 Diff 算法的核心思想与优化手段
- 是否能结合实际场景分析虚拟 DOM 的性能瓶颈及改进方式

#### 二、参考答案

##### 1.1 原理说明

---

### ✅ 一、虚拟 DOM 是什么？

**虚拟 DOM（Virtual DOM）** 是一个用 JavaScript 对象表示真实 DOM 结构的中间层，用于在内存中构建和操作 DOM，然后**批量更新**真实 DOM。

主要作用：

- 减少直接 DOM 操作的频率，提高性能；
- 通过“对比前后两棵虚拟 DOM 树”，只更新必要的部分；
- 实现响应式渲染和跨平台渲染（如 SSR、原生端渲染）。

示例结构：

```js
{
  tag: 'div',
  props: { class: 'container' },
  children: [
    { tag: 'span', children: ['hello'] }
  ]
}
````

---

### ✅ 二、虚拟 DOM 更新流程

1. 数据变化触发组件更新；
2. 重新生成新的虚拟 DOM；
3. **与旧虚拟 DOM 执行 Diff 算法**，找出最小变更集；
4. 通过 Patch 更新真实 DOM。

这个过程称为“**virtual DOM diff-patch**”机制。

---

### ✅ 三、Diff 算法优化思路

虚拟 DOM 的 Diff 算法并非是全树对比，而是基于一系列优化策略：

#### 🔹 1. 同层比较

只比较**同一层级的节点**，不跨层 diff，减少复杂度。

* 复杂度由 `O(n^3)` 降为 `O(n)`

#### 🔹 2. key 的优化作用

当列表节点发生插入/删除/移动时，通过 `key` 标识节点身份，辅助精确比较。

* 如果不加 key，默认使用位置索引，可能导致节点复用错误；
* 合理设置 key（如 ID）能减少 DOM 频繁重建。

#### 🔹 3. 双端比较（Vue2 使用）

同时从两端（头尾）开始比较，快速识别前后插入/删除操作，减少指针移动次数。

#### 🔹 4. 最长递增子序列（Vue3）

Vue3 使用基于动态规划的最长递增子序列（LIS）优化移动操作：

* 在 Patch 阶段，找出无需移动的最大子序列；
* 只对非子序列部分执行插入/移动操作，进一步提升性能。

#### 🔹 5. Fragment、静态提升

* Vue3 会标记模板中**不变的 DOM 片段**为静态节点，跳过对比；
* 提升性能、减少 diff 开销。

---

##### 1.3 常见误区或面试陷阱

* **以为虚拟 DOM 一定比直接操作 DOM 快**：小规模更新时反而原生更快，虚拟 DOM 更适合组件化与复杂页面更新；
* **未设置 key 导致列表乱序更新**；
* **误以为虚拟 DOM 是 React 独有机制**：Vue、Inferno 等也采用；
* **不理解 Patch 的过程导致优化无效**：如频繁 setState 但未合并、未使用 batch 更新；
* **混淆 vnode 与真实 DOM 节点结构**。

</details>

## 18. 移动端适配方案（rem、vw/vh、1px问题） {#question-subjective-9ce6f679d718}

### 题目要点

移动端适配/rem/vw/vh/1px/视口单位/DPR/font-size动态设置/子像素边框

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否熟悉主流的移动端适配方式及其使用场景
- 能否清楚说明 rem 与 vw/vh 单位的区别与原理
- 是否了解 1px 问题产生原因及解决方案
- 是否具备在多种设备（尤其是高分屏）上保持 UI 一致性的能力

#### 二、参考答案

##### 1.1 原理说明

---

### ✅ 一、移动端适配目标

移动端适配的核心目标是：

- 在不同分辨率/尺寸/像素比的设备上，**保持视觉布局尺寸一致**；
- 实现统一的设计稿转码规则，提升 UI 开发效率；
- 提高多终端兼容性。

---

### ✅ 二、适配方式对比

#### 🔹 1. rem 方案（基于根字体大小）

**原理**：`rem` 是相对 `html` 根元素的字体大小的单位。通过动态设置 `html` 的 `font-size` 实现布局缩放。

常配合 JS 设置根元素字体：

```js
// 以设计稿 375px 为基准，100px = 375px
const scale = document.documentElement.clientWidth / 375;
document.documentElement.style.fontSize = scale * 100 + 'px';
````

优点：

* 与设计稿比例一致，适配精度高；
* 项目中单位统一为 `rem`，布局更流畅。

缺点：

* 需要结合 JS 或 lib-flexible 自动调整；
* 在一些 WebView 场景中字体缩放可能受限。

---

#### 🔹 2. vw/vh 方案（视口宽高单位）

**原理**：

* `1vw = 视口宽度的 1%`，`1vh = 视口高度的 1%`；
* 完全基于设备视口单位计算，无需 JS 配合。

示例：

```css
.container {
  width: 100vw;
  padding: 2vw;
  font-size: 4vw;
}
```

优点：

* 使用简单、纯 CSS 方案；
* 不依赖脚本，响应式强。

缺点：

* 小数单位可能出现渲染偏差；
* 字体缩放一致性差，不易控制排版比例。

---

#### 🔹 3. 1px 问题（物理像素适配）

**问题来源**：

在高 DPI 屏幕中（如 DPR = 2），CSS 的 1px 实际会被渲染为 2 个物理像素，导致边框线条“变粗”。

**解决方案**：

1. **使用 transform 缩放**：

```css
.border {
  border-bottom: 1px solid #ccc;
  transform: scaleY(0.5);
}
```

2. **使用伪元素 + media query**：

```css
@media (min-resolution: 2dppx) {
  .border::after {
    content: '';
    height: 1px;
    transform: scaleY(0.5);
  }
}
```

3. **使用 viewport 单位实现子像素线**：

```css
.border {
  border-bottom: 0.5px solid #ccc;
}
```

部分浏览器（如 Safari）已支持 `0.5px` 渲染，但兼容性不完全。

---

##### 1.3 常见误区或面试陷阱

* **误以为 rem 与 em 无区别**：`rem` 相对于根元素，而 `em` 相对父级，实际表现差异大；
* **vw 适配字体导致布局混乱**：vw 更适合容器尺寸控制，字体适配建议仍采用 rem；
* **直接写 1px 忽略设备 DPR 差异**：导致高分屏渲染异常；
* **未测试不同机型 DPR，适配方案存在盲区**；
* **同时混用多种适配方式未统一标准**，导致维护困难。

</details>

## 19. 深拷贝浅拷贝有什么区别？怎么实现深拷贝？ {#question-a5330a58-5be0-4f4f-8394-43392311ddaa}

> 题库原题：[深拷贝浅拷贝有什么区别？怎么实现深拷贝？](https://fe.ecool.fun/topic/a5330a58-5be0-4f4f-8394-43392311ddaa)

### 题目要点

JS数据类型分别基本数据类型和引用数据类型，基本数据类型保存的是值，引用类型保存的是引用地址(this指针)。

浅拷贝共用一个引用地址，深拷贝会创建新的内存地址。

#### 浅拷贝方法

- 直接对象复制
- Object.assign

#### 深拷贝

- JSON.stringify转为字符串再JSON.parse
- 深度递归遍历

<details>
<summary>参考答案</summary>

## 一、数据类型存储

前面文章我们讲到，`JavaScript`中存在两大数据类型：

- 基本类型
- 引用类型

基本类型数据保存在在栈内存中

引用类型数据保存在堆内存中，引用数据类型的变量是一个指向堆内存中实际对象的引用，存在栈中

## 二、浅拷贝

浅拷贝，指的是创建新的数据，这个数据有着原始数据属性值的一份精确拷贝

如果属性是基本类型，拷贝的就是基本类型的值。如果属性是引用类型，拷贝的就是内存地址

即浅拷贝是拷贝一层，深层次的引用类型则共享内存地址

下面简单实现一个浅拷贝

```js
function shallowClone(obj) {
    const newObj = {};
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop)){
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
}
```

在`JavaScript`中，存在浅拷贝的现象有：

- `Object.assign`
- `Array.prototype.slice()`, `Array.prototype.concat()`
- 使用拓展运算符实现的复制

### Object.assign

```js
var obj = {
    age: 18,
    nature: ['smart', 'good'],
    names: {
        name1: 'fx',
        name2: 'xka'
    },
    love: function () {
        console.log('fx is a great girl')
    }
}
var newObj = Object.assign({}, obj);
```

### slice()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.slice(0)
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### concat()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.concat()
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### 拓展运算符

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = [...fxArr]
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

## 三、深拷贝

深拷贝开辟一个新的栈，两个对象的属性完全相同，但是对应两个不同的地址，修改一个对象的属性，不会改变另一个对象的属性

常见的深拷贝方式有：

- _.cloneDeep()

- jQuery.extend()
- JSON.stringify()
- 手写循环递归

### _.cloneDeep()

```js
const _ = require('lodash');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
```

### jQuery.extend()

```js
const $ = require('jquery');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = $.extend(true, {}, obj1);
console.log(obj1.b.f === obj2.b.f); // false
```

### JSON.stringify()

```js
const obj2=JSON.parse(JSON.stringify(obj1));
```

但是这种方式存在弊端，会忽略`undefined`、`symbol`和`函数`

```js
const obj = {
    name: 'A',
    name1: undefined,
    name3: function() {},
    name4:  Symbol('A')
}
const obj2 = JSON.parse(JSON.stringify(obj));
console.log(obj2); // {name: "A"}
```

### 循环递归

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== "object") return obj;
  // 是对象的话就要进行深拷贝
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}
```

## 四、区别

下面首先借助两张图，可以更加清晰看到浅拷贝与深拷贝的区别

 ![](https://static.ecool.fun//article/8252919d-2855-4ccd-9b2e-d64ce5c07be2.png)

从上图发现，浅拷贝和深拷贝都创建出一个新的对象，但在复制对象属性的时候，行为就不一样

浅拷贝只复制属性指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存，修改对象属性会影响原对象

```js
// 浅拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj3=shallowClone(obj1) // 一个浅拷贝方法
obj3.name = "update";
obj3.arr[1] = [5,6,7] ; // 新旧对象还是共享同一块内存

console.log('obj1',obj1) // obj1 { name: 'init',  arr: [ 1, [ 5, 6, 7 ], 4 ] }
console.log('obj3',obj3) // obj3 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象

```js
// 深拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj4=deepClone(obj1) // 一个深拷贝方法
obj4.name = "update";
obj4.arr[1] = [5,6,7] ; // 新对象跟原对象不共享内存

console.log('obj1',obj1) // obj1 { name: 'init', arr: [ 1, [ 2, 3 ], 4 ] }
console.log('obj4',obj4) // obj4 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

### 小结

前提为拷贝类型为引用类型的情况下：

- 浅拷贝是复制内存中的地址，拷贝前后的对象，因为引用类型共享了同一块内存，修改会相互影响。
- 深拷贝是递归拷贝深层次，属性为对象时，深拷贝是新开栈，两个对象指向不同的地址

</details>

## 20. ES6有哪些新特性？ {#question-5e131c75-d26e-4527-8f51-29d842f3c829}

> 题库原题：[ES6有哪些新特性？](https://fe.ecool.fun/topic/5e131c75-d26e-4527-8f51-29d842f3c829)

### 题目要点

### ES6 新特性分类

1. **解决原有语法不足**：例如 `let` 和 `const` 用于块级作用域，解决了 `var` 声明变量时的提升问题。
2. **原有语法增强**：如解构赋值、模板字符串、参数默认值等。
3. **新增对象、方法和功能**：如 `Promise`、`Proxy`、`Object.assign`、`is` 等。
4. **新增数据类型和数据结构**：如 `Symbol`、`Set`、`Map` 等。

### 具体特性

1. **let 和 const**：提供了块级作用域，并且声明的变量不会提升。
2. **解构**：允许快速提取数组或对象中的元素。
3. **模板字符串**：允许在字符串中嵌入表达式，并且可以换行。
4. **字符串扩展方法**：提供了 `includes`、`startsWith`、`endsWith` 等方法。
5. **参数默认值和剩余参数**：允许在函数定义时提供默认值，并收集剩余参数。
6. **展开数组**：使用 `...` 展开数组。
7. **箭头函数**：简化了函数的写法，并且 `this` 的绑定是静态的。
8. **对象字面量增强**：允许省略键值对中的键名，使用计算属性等。
9. **Object.assign**：用于复制和合并对象。
10. **Object.is**：比较两个值是否相等，不进行隐式类型转换。
11. **Proxy**：提供了对象代理，可以监控对象的读写操作。
12. **Reflect**：提供了一系列对象操作的方法。
13. **Promise**：用于解决异步编程中的回调嵌套问题。
14. **class**：用于类和继承的定义。
15. **Set**：类似数组的数据结构，元素唯一。
16. **Map**：类似 Object，以键值对形式存储数据。
17. **Symbol**：用于定义唯一的变量。
18. **for...of...**：用于遍历引用数据类型。
19. **迭代器模式**：通过 `Symbol.iterator` 提供统一的迭代接口。
20. **Generator 生成器**：用于惰性执行，解决异步回调过深的问题。
21. **includes 函数**：判断数组是否包含某个元素。
22. **指数运算符**：简化指数运算。
23. **values 函数**：返回对象的值数组。
24. **entries 函数**：返回对象的键值对数组。
25. **Object.getOwnPropertyDescriptors**：获取对象的描述信息。
26. **padStart 和 padEnd 函数**：在字符串前或后追加指定字符串。

<details>
<summary>参考答案</summary>

### 关于ES6和JavaScript的关系

##### 1、ES6是对于ES2015+的俗称，也可以说是通常叫法，那么，ES6是什么呢？

ES 全称是ECMAScript，它是JavaScript基础构建的一种语言，JavaScript正是建立在ECMAScript语言的基础规范中建立使用的，那么，ECMAScript的使用，对于JavaScript至关重要！

在我的理解中，ECMAScript是一种语言层面的东西，它只是定义了JavaScript以及在它基础之上建立的其他语言的语法规范，而JavaScript的语言，更关于一种平台性质在其中。

JavaScript包括 ECMAScript、DOM、BOM三个组成部分，DOM和BOM是web API提供的接口或者是JavaScript和浏览器之间进行交互的部分，实质就是操纵文档元素，进行展示布局，而ECMAScript在JavaScript中其中语法的作用，它不会去跟文档有直接的关系，但是他的数据处理完成后会通过web API展示在文档中。

### ES6新特性的分类

新特性主要归为四大类：

* 解决原有语法上的一些不足

比如let 和 const 的块级作用域

* 对原有语法进行增强

比如解构、展开、参数默认值、模板字符串

* 全新的对象、全新的方法、全新的功能

比如promise、proxy、object的assign、is

* 全新的数据类型和数据结构

比如symbol、set、map

下面具体进行介绍

## 1. let、const 块级作用域以及和 var 的区别

- let、const 声明的变量，在 for，if 语句中，会形成块级作用域，块级作用域内的变量，不能被作用域外部使用
- let、const 声明变量不再会有声明提升，在变量声明之前使用运行时会报错

```js
//块级作用域一级块级作用域的使用
if (true) {
  const param = 'param in if block'
  console.log(param) //param in if block
}
console.log(param) //块级作用域外访问内部定义的变量，ReferenceError: param is not defined
```

- 块级作用域声明变量，会出现“暂时性死区”，块级作用域声明变量前使用变量，将会报错

```js
// 暂时性死区
const i = 100
if (i) {
  console.log(i) //ReferenceError: Cannot access 'i' before initialization
  const i = 1000
}
```

- const 声明的是一个常量，声明必须初始化

```js

    // const常量声明必须初始化
    const i;
    i = 10;
    console.log(i) //SyntaxError: Missing initializer in const declaration

```

- 如果 const 声明的是基本类型常量，初始化之后不能修改；引用类型的常量，可以修改其成员变量；

```js
// 基本类型常量不能修改，引用类型常量能修改属性
const str = 'str'
str = 'str1' //TypeError: Assignment to constant variable.

const arr = [1, 2, 3]
arr[0] = 100
console.log(arr[0]) //100
```

- 和 var 的区别

| 声明方式 | 变量提升 | 作用域 | 初始值 | 重复定义 |
| -------- | -------- | ------ | ------ | -------- |
| var      | 是       | 函数级 | 不需要 | 允许     |
| let      | 否       | 块级   | 不需要 | 不允许   |
| const    | 否       | 块级   | 必需   | 不允许   |

## 2.解构-快速提取数组/对象中的元素

- **数组解构**

- 单独解构-根据数组索引，将数组解构成单独的元素

```js
const arr = [1, 2, 3]

const [a, b, c] = arr
console.log(a, b, c) //1,2,3
const [, , d] = arr
console.log(d) //3
```

- 默认值，解构时可以给变量设置默认值，数组没有这个元素的话

```js
const arr = [1, 2, 3]

const [, , , defaultVal = '4'] = arr
console.log('设置默认值', defaultVal)
```

- 剩余解构-用 "...+变量名" 解构剩余参数到新数组，只能用一次

```js
const arr = [1, 2, 3]

const [e, ...rest] = arr
console.log(rest) //[2, 3]
```

- 实例应用

```js
// 拆分字符串
const str = 'xiaobai/18/200'
const strArr = str.split('/')
const [, age] = strArr
console.log(age) //18
```

- **对象解构**

- 单个/多个解构-跟数组解构差不多

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name, age } = obj
console.log(name, age) // 'xiaohui', 18
```

- 解构+重命名-给解构出来的变量重命名

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name: objName } = obj
console.log(objName)
```

- 默认值-给解构变量设置默认值

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { next = 'default' } = obj
console.log(next)
```

## 3.模板字符串

用法：使用``将字符串包裹起来

功能：可以换行、插值、使用标签函数进行字符串操作

示例：

- 换行/插值

```js
//换行
const str = `fdsjak
    fdsa`
console.log(str)

// 插值
const strs = `random: ${Math.random()}`
console.log(strs)
```

- 标签函数-可以对模板字符串的字符串和插值进行处理和过滤等操作

```js
/**
 * 字符串模板函数
 * @param {array} strs 以插值为分隔符组成的字符串数组
 * @param {string} name 插值的value，有多少个就会传入多少个
 */
const tagFunc = (strs, name, gender) => {
  const [str1, str2, str3] = strs
  const genderParsed = gender == '1' ? '男' : '女'
  // 可以在此做过滤，字符串处理，多语言等操作
  return str1 + name + str2 + str3 + genderParsed
}

// 带标签的模板字符串,
const person = {
  name: 'xiaohui',
  gender: 1,
}
// 返回值为标签函数的返回值
const result = tagFunc`my name is ${person.name}.gender is ${person.gender}`
console.log(result) //my name is xiaohui.gender is 男
```

## 4. 字符串扩展方法

- includes-是否包含
- startsWith-是否以什么开始
- endsWith-是否以什么结束

```js
const str = 'abcd'

console.log(str.includes('e')) //false
console.log(str.startsWith('a')) //true
console.log(str.endsWith('a')) //false
```

## 5.参数默认值&剩余参数

- 给函数形参设置默认值

```js
// 带默认参数的形参一般放在后面，减少传参导致的错误几率
const defaultParams = function (name, age = 0) {
  return [age, name]
}
console.log(defaultParams(1))
```

- 使用...rest 形式设置剩余形参，支持无限参数

```js
// 剩余参数，转化成数组
const restParams = function (...args) {
  console.log(args.toString()) //1, 2, 3, 4, 5
}

restParams(1, 2, 3, 4, 5)
```

## 6.展开数组

使用...将数组展开

```js
const arr = [1, 2, 3]

console.log(...arr)
// 等价于es5中以下写法
console.log.apply(console, arr)
```

## 7.箭头函数

**特性&优势：**

- 1、简化了函数的写法
- 2、没有 this 机制，this 继承自上一个函数的上下文，如果上一层没有函数，则指向 window
- 3、作为异步回调函数时，可解决 this 指向问题

```js
const inc = (n) => n + 1
console.log(inc(100))

const obj = {
  name: 'aa',
  func() {
    setTimeout(() => {
      console.log(this.name) //aa
    }, 0)
    setTimeout(function () {
      console.log(this.name) //undefined
    }, 0)
  },
}
obj.func()
```

## 8.对象字面量增强

- 同名属性可以省略 key:value 形式，直接 key，
- 函数可以省略 key：value 形式
- 可以直接 func(),
- 可以使用计算属性，比如：{[Math.random()]: value}

```js
/**
 * 1、增强了对象字面量：
 * 1，同名属性可以省略key:value形式，直接key，
 * 2，函数可以省略key：value形式
 * 3，可以直接func(),
 * 4，可以使用计算属性，比如：{[Math.random()]: value}
 */
const arr = [1, 2, 3]
const obj = {
  arr,
  func() {
    console.log(this.arr)
  },
  [Math.random()]: arr,
}

console.log(obj)
```

## 9.Object.assign(target1, target2, targetN)-复制/合并对象

```js
/**
 * Object.assign(target1, target2, ...targetn)
 * 后面的属性向前面的属性合并
 * 如果target1是空对象，可以创建一个全新对象，而不是对象引用
 */
const obj1 = {
  a: 1,
  b: 2,
}
const obj2 = {
  a: 1,
  b: 2,
}

const obj3 = Object.assign({}, obj1)
obj3.a = 5
console.log(obj3, obj2, obj1)
```

## 10.Object.is(value1, value2)

作用：比较两个值是否相等

特性：

- 没有隐式转换
- 可以比较+0,-0、NaN

```js
console.log(NaN === NaN) //false
console.log(Object.is(NaN, NaN)) //true
console.log(0 === -0) // true
console.log(Object.is(0, -0)) //false
console.log(Object.is(1, 1)) //true
```

## 11.Proxy(object, handler)

**作用：**

- 代理一个对象的所有，包括读写操作和各种操作的监听

**用法：**

```js
const P = {
  n: 'p',
  a: 19,
}

const proxy = new Proxy(P, {
  get(target, property) {
    console.log(target, property)
    return property in target ? target[property] : null
  },
  defineProperty(target, property, attrs) {
    console.log(target, property, attrs)
    //   throw new Error('不允许修改')
  },
  deleteProperty(target, property) {
    console.log(target, property)
    delete target[property]
  },
  set(target, property, value) {
    target[property] = value
  },
})

proxy.c = 100
console.log('pp', P)
```

与 Object.defineProperty 对比

优势：

- **拥有很多 defineProperty 没有的属性方法，比如：**
  - handler.getPrototypeOf() ---Object.getPrototypeOf 方法的监听器
  - handler.setPrototypeOf() ---Object.setPrototypeOf 方法的监听器。
  - handler.isExtensible() ---Object.isExtensible 方法的监听器。
  - handler.preventExtensions() ---Object.preventExtensions 方法的监听器。
  - handler.getOwnPropertyDescriptor() ---Object.getOwnPropertyDescriptor 方法的监听器。
  - handler.defineProperty() ---Object.defineProperty 方法的监听器。
  - handler.has() ---in 操作符的监听器。
  - handler.get() ---属性读取操作的监听器。
  - handler.set() ---属性设置操作的监听器。
  - handler.deleteProperty() ---delete 操作符的监听器
  - handler.ownKeys() ---Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的监听器。
  - handler.apply() ---函数调用操作的监听器。
  - handler.construct() ---new 操作符的监听器。
- **对数组的监视更方便**
- **以非侵入的访视监管对象的读写**

## 12.Reflect

作用：

集成 Object 操作的所有方法，统一、方便，具体方法如下：

用于对对象的统一操作，集成 Object 相关的所有方法

1、apply：类似 Function.prototype.apply

2、Reflect.construct()

对构造函数进行 new 操作，相当于执行 new target(...args)。

3、Reflect.defineProperty()

和 Object.defineProperty() 类似。

4、Reflect.deleteProperty()

作为函数的 delete 操作符，相当于执行 delete target[name]。

5、Reflect.get()

获取对象身上某个属性的值，类似于 target[name]。

6、Reflect.getOwnPropertyDescriptor()

类似于 Object.getOwnPropertyDescriptor()。

7、Reflect.getPrototypeOf()

类似于 Object.getPrototypeOf(), 获取目标对象的原型。

8、Reflect.has()

判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。

9、Reflect.isExtensible()

类似于 Object.isExtensible().判断对象是否可扩展，可以添加额外属性

Object.seal(封闭对象)， Object.freeze（冻结对象）是不可扩展的

10、Reflect.ownKeys()

返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受 enumerable 影响).

11、Reflect.preventExtensions()

类似于 Object.preventExtensions()。返回一个 Boolean。

12、Reflect.set()

将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true, 反之返回 false。

13、Reflect.setPrototypeOf()

类似于 Object.setPrototypeOf()。

示例：

```js
const obj = {
  name: 'reflect',
}
Reflect.preventExtensions(obj) //禁止扩展
console.log(Reflect.set(obj, 'age', 'xiaobai')) //false
console.log(obj) //{ name: 'reflect' }
console.log(Reflect.isExtensible(obj, 'name')) //false
console.log(Reflect.ownKeys(obj)) //[ 'name' ]
```

## 13.Promise

作用：解决异步编程中回调嵌套过深问题

## 14.class&静态方法&继承

**定义**

- 使用 class 关键字定义类

```js
class Person {
  constructor(props) {
    this.props = props
  }
}
```

**方法**

- 实例方法，需要实例化之后才能调用，this 指向实例
- 静态方法，用 static 修饰符修饰，可以直接通过类名调用，不需要实例化，this 不指向实例，而是指向当前类

```js
class Person {
  constructor(props) {
    this.props = props
  }
  // 实例方法
  eat() {}
  // 静态方法
  static run() {}
}
// 调用静态方法
Person.run()
const person = new Person('props')
// 调用实例方法
person.eat()
```

**继承：子类使用 extends 关键字实现继承，可以继承父类所有属性**

```js
class Student extends Person {
  constructor(props) {
    super(props)
  }
  printProps() {
    console.log(this.props)
  }
}

const student = new Student('student')
student.printProps()
```

## 15.Set

说明：

Set 是一种类似于数组的数据结构

特性：

- 元素唯一性，不允许重复元素
- 使用 add 增加重复元素，将会被忽略

用途：

- 数组去重
- 数据存储

```js
const arr = [1, 3, 1, 1, 1]
const set = new Set(arr)
set.add(1).add(1)
console.log(set.size) //2
const newArr = Array.from(set)
console.log(newArr) //[ 1, 3 ]
```

## 16.Map

说明：

类似 Object，以 key、value 形式存储数据

区别：

Map 键不会隐式转换成字符串，而是保持原有类型

实例：

```js
const map = new Map()
map.set(1, 1)
map.set('name', 'map')
map.set(obj, obj)
console.log(map.get(1)) //1
/**
        1 1
        name map
        { '1': 1, true: true, a: 'a' } { '1': 1, true: true, a: 'a' }
     */
map.forEach((val, key) => {
  console.log(key, val)
})
```

## 17.Symbol

说明：

JavaScript 第六种原始数据类型，用来定义一个唯一的变量

作用：

- 创建唯一的变量，解决对象键名重复问题
- 为对象、类、函数等创建私有属性

- 修改对象的 toString 标签
- 为对象添加迭代器属性

如何获取对象的 symbol 属性？

- Object.getOwnPropertySymbols(object)

实例

```js
// 对象属性重名问题；
const objSymbol = {
  [Symbol()]: 1,
  [Symbol()]: 2,
}
console.log(objSymbol)

// 2、为对象、类、函数等创建私有属性
const name = Symbol()
const obj2 = {
  [name]: 'symbol',
  testPrivate() {
    console.log(this[name])
  },
}

obj2.testPrivate()
// 定义toString标签；
console.log(obj2.toString())
obj2[Symbol.toStringTag] = 'xx'
console.log(obj2.toString()) //[object xx]
```

## 18.for...of...

用途：

已统一的方式，遍历所有引用数据类型

特性：

可以随时使用 break 终止遍历，而 forEach 不行

实例：

```js
// 基本用法
// 遍历数组
const arr = [1, 2, 3, 4]
for (const item of arr) {
  if (item > 3) {
    break
  }
  if (item > 2) {
    console.log(item)
  }
}

// 遍历set
const set = new Set()
set.add('foo').add('bar')
for (const item of set) {
  console.log('set for of', item)
}
// 遍历map
const map = new Map()
map.set('foo', 'one').set('bar', 'two')
for (const [key, val] of map) {
  console.log('for of map', key, val)
}
//迭代对象
const obj = {
  name: 'xiaohui',
  age: '10',
  store: [1, 2, 3],
  // 实现可迭代的接口
  [Symbol.iterator]: function () {
    const params = [this.name, this.age, this.store]
    let index = 0
    return {
      next() {
        const ret = {
          value: params[index],
          done: index >= params.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of obj) {
  console.log('obj for of', item)
}
```

## 19. 迭代器模式

作用：通过 Symbol.interator 对外提供统一的接口，获取内部的数据

外部可以通过 for...of...去迭代内部的数据

```js
const tods = {
  life: ['eat', 'sleep'],
  learn: ['js', 'dart'],
  // 增加的任务
  work: ['sale', 'customer'],
  [Symbol.iterator]: function () {
    const all = []
    Object.keys(this).forEach((key) => {
      all.push(...this[key])
    })
    let index = 0
    return {
      next() {
        const ret = {
          value: all[index],
          done: index >= all.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of tods) {
  console.log(item)
}
```

## 20.Generator 生成器

- Generator
- 函数前添加 *，生成一个生成器
- 一般配合 yield 关键字使用
- 最大特点，惰性执行，调 next 才会往下执行
- 主要用来解决异步回调过深的问题

```js
// 生成迭代器方法
//  生成器Generator的应用

function* createIdGenerator() {
  let id = 1
  while (id < 3) yield id++
}
const createId = createIdGenerator()
console.log(createId.next()) //{ value: 1, done: false }
console.log(createId.next()) //{ value: 2, done: false }
console.log(createId.next()) //{ value: undefined, done: true }

const todos = {
  life: ['eat', 'sleep', 'baba'],
  learn: ['es5', 'es6', 'design pattern'],
  work: ['b', 'c', 'framework'],
  [Symbol.iterator]: function* () {
    const all = [...this.life, ...this.learn, ...this.work]
    for (const i of all) {
      yield i
    }
  },
}
for (const item of todos) {
  console.log(item)
}
```

## 21.includes 函数-es2016

判断数组是否包含某个元素，包含 NaN，解决 indexOf 无法查找 NaN 问题

```js
//  includes函数
const arr = ['foo', 'bar', 'baz', NaN]
console.log(arr.includes(NaN)) //true
console.log(arr.indexOf(NaN)) //-1
```

## 22. 运算符-es2016

指数运算

```js
// 指数运算符 **
// es5中2十次方
console.log(Math.pow(2, 10))
// es6中2十次方
console.log(2 ** 10)
```

## 23.values 函数-es2017

将对象的值以数组的形式返回

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}

console.log(Object.values(obj)) //[ 1, 2, 3 ]
```

## 24.entries 函数-es2017

将对象以键值对二维数组返回，使之可以使用 for...of...遍历

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}
console.log(Object.entries(obj))
const entry = Object.entries(obj)
for (const [key, value] of entry) {
  console.log(key, value)
}
```

## 25.Object.getOwnPropertyDescriptors(obj)-es2017

获取对象的描述信息

可以通过获得的描述信息，配合 Object.defineProperties 来完整复制对象，包含 get，set 方法

```js
// getOwnPropertyDescriptors

// 普通get方法
const objGet = {
  foo: 1,
  bar: 2,
  get getCount() {
    return this.foo + this.bar
  },
}
// assign方法会把getCount当做普通属性复制，从而getCount为3，修改bar不管用
const objGet1 = Object.assign({}, objGet)
objGet1.bar = 3
console.log(objGet1.getCount) //3
// descriptors
const descriptors = Object.getOwnPropertyDescriptors(objGet)
console.log('des', descriptors)
// 通过descriptors来复制对象，可以完整复制对象，包含get，set
const objGet2 = Object.defineProperties({}, descriptors)
objGet2.bar = 3
console.log(objGet2.getCount) //4
```

## 26.padStart, padEnd 函数-es2017

在字符串前，或者后面追加指定字符串

参数：

targetLenght: 填充后的目标长度

padString:填充的字符串

规则：

1、填充的字符串超过目标长度，会在规定长度时被截断

2、填充字符串太短会以空格填充

3、padString 未传值，以空格填充

作用：

一般用来对齐字符串输出

```js

    /**
     *  foo.................|1
        barbar..............|2
        bazbazbaz...........|3
     */
    console.log(`${key.padEnd(20, '.')}${value.toString().padStart(2, '|')}`)
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-48/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-48/round-69/index.md" >}}) →
