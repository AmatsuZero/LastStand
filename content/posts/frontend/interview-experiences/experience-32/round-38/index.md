+++
title = "阿里-国际电商-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/32"
experienceId = 32
roundId = 38
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T06:02:07.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-32/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-32/round-39/index.md" >}}) →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 19 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你的技术栈，为什么要学前端，如何学习前端的？ {#question-subjective-5605b7f269f9}

### 题目要点

技术栈、学习动机与方法。

<details>
<summary>参考答案</summary>

1. 技术栈：
    1. HTML/CSS：用于构建页面结构和样式。
    2. JavaScript：包括ES6+特性，用于实现页面交互。
    3. 框架：熟练使用Vue.js和React，了解其生态系统（如Vue Router、Vuex、React Router、Redux）。
    4. 构建工具：使用Vite和Webpack进行项目构建和优化。
    5. 状态管理：使用Vuex和Redux进行状态管理。
    6. UI组件库：使用Element UI、Ant Design等。
    7. 其他工具：Git、ESLint、Prettier、Jest等。
2. 学习动机：
    1. 前端开发结合了技术和创意，能够直接看到代码转化为用户界面，带来了即时满足感。
    2. 前端领域技术更新快，充满挑战，提供了不断学习新知识的机会。
    3. 对用户界面和交互设计的兴趣，希望创造良好的用户体验。
3. 学习方法：
    1. 在线课程：通过Coursera、Udemy、MDN Web Docs等平台学习基础知识。
    2. 实践项目：通过个人项目和开源项目应用所学知识。
    3. 阅读书籍：如《JavaScript高级程序设计》、《你不知道的JavaScript》。
    4. 参与社区：在GitHub、Stack Overflow等社区与开发者交流，解决遇到的问题。
    5. 技术博客：关注CSS-Tricks、JavaScript.info等博客，了解新技术和最佳实践。

</details>

## 2. 常见的H5标签有哪些 ，你是怎么用的 {#question-ae93b62f-d9ef-46c2-8151-da164426f49f}

> 题库原题：[常见的H5标签有哪些 ，你是怎么用的](https://fe.ecool.fun/topic/ae93b62f-d9ef-46c2-8151-da164426f49f)

### 题目要点

常见 H5 标签包括结构语义标签、文本语义标签、表单标签和媒体标签；实际使用中优先考虑语义表达和可访问性，而非样式；充分利用表单和媒体标签的原生能力以减少 JS 复杂度；`canvas` 与 `svg` 需根据场景选择；合理使用语义化标签能显著提升页面质量和长期可维护性。

<details>
<summary>参考答案</summary>

在实际工程中，H5 标签并不是“记住有哪些”，而是**是否理解它们在语义、结构、可访问性和默认行为上的差异，并能在合适的场景中使用**。对标签的理解，直接影响页面结构质量、SEO 以及后续的可维护性。

从结构层面看，最常用的一类是**语义化结构标签**。例如 `header`、`nav`、`main`、`section`、`article`、`aside`、`footer`。在页面搭建时，通常会用 `header` 承载页面或模块级头部信息，用 `nav` 明确标识导航区域，用 `main` 作为页面主体的唯一入口，再用 `section` 或 `article` 对内容进行分块。这类标签本身不改变样式，但会向浏览器、搜索引擎和辅助技术清晰表达“这块内容的角色是什么”，比单纯使用 `div` 更具表达力。

在文本语义上，H5 提供了更精细的表达方式。`h1` 到 `h6` 用于描述内容层级，而不是单纯控制字号；`p` 用于段落；`strong` 和 `em` 分别表达重要性和语气强调，而不是“加粗”和“斜体”；`time` 用来描述时间点或时间范围，便于搜索引擎和程序识别。这类标签在内容型页面、文档型页面中尤为重要。

在表单和交互场景中，H5 标签的价值更多体现在“减少 JS 负担”。例如 `input` 的不同 `type`（`email`、`number`、`date` 等）可以直接获得校验和移动端键盘优化；`label` 与表单控件绑定，提升可点击区域和可访问性；`fieldset` 和 `legend` 用于表达表单分组语义。在实际使用中，通常会优先利用浏览器的原生能力，而不是一开始就完全依赖自定义校验和交互。

媒体相关标签是 H5 的一大增强点。`audio` 和 `video` 提供了标准化的多媒体播放能力，配合 `controls`、`autoplay`、`muted` 等属性即可完成大多数基础需求；`source` 用于提供多格式资源兜底；`track` 用于字幕和辅助信息。在业务中，这类标签通常结合自定义 UI 使用，但底层播放能力仍然依赖原生标签。

此外，还有一些偏“能力型”的标签，例如 `canvas` 和 `svg`。`canvas` 更适合高频刷新、像素级控制的场景，如图表、动画和游戏；`svg` 则更适合结构化、可交互、可缩放的矢量图形，如图标和流程图。在选择时，通常会根据渲染频率、交互复杂度和可维护性进行权衡。

整体而言，H5 标签的使用原则并不是“全用新标签”，而是**在不增加复杂度的前提下，优先表达语义，其次才是样式和行为**。当标签本身已经能准确表达含义时，就不再需要额外的注释或约定。

</details>

## 3. 讲一下CSS盒模型、Flex布局与Grid布局的区别及适用场景 {#question-subjective-3ba8746e4b5e}

### 题目要点

CSS布局。

<details>
<summary>参考答案</summary>

1. CSS盒模型：
    1. 定义：描述元素的物理尺寸，包括内容、内边距、边框和外边距。
    2. 标准盒模型：`width`和`height`仅包括内容区域，不包括内边距和边框。总宽度 = `width + padding-left + padding-right + border-left-width + border-right-width + margin-left + margin-right`。
    3. IE盒模型：`width`和`height`包括内容、内边距和边框。通过`box-sizing: border-box`启用。
2. Flex布局：
    1. 定义：一维布局模型，用于在单个方向（行或列）上排列子元素。
    2. 适用场景：灵活分配空间和对齐元素，如导航栏、列表项的对齐。
    3. 基本属性：
        1. 容器属性：
            1. `display: flex`：启用Flex布局。
            2. `justify-content`：主轴对齐方式。
            3. `align-items`：交叉轴对齐方式。
            4. `flex-direction`：主轴方向。
        2. 项目属性：
            1. `flex-grow`：项目扩展比例。
            2. `flex-shrink`：项目收缩比例。
            3. `flex-basis`：项目初始大小。
            4. `order`：项目排列顺序。
    4. 示例：水平垂直居中：

```css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

3. Grid布局：
    1. 定义：二维布局模型，用于在行列网格上排列子元素。
    2. 适用场景：复杂的页面布局，如网格照片墙、仪表盘。
    3. 基本属性：
        1. 容器属性：
            1. `display: grid`：启用Grid布局。
            2. `grid-template-columns`、`grid-template-rows`：定义网格轨道大小。
            3. `grid-gap`：网格间距。
            4. `grid-template-areas`：命名网格区域。
        2. 项目属性：
            1. `grid-column`、`grid-row`：项目跨越的轨道。
            2. `grid-area`：项目所在的命名区域。
    4. 示例：定义网格布局：

```css
.container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: auto auto;
    grid-gap: 10px;
}
.item {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
}
```

</details>

## 4. 关于弹性布局，如果我想把元素垂直排列用哪个属性?值是什么?flex=1是哪几个的缩写?分别代表什么? {#question-subjective-d014545854cb}

### 题目要点

Flex布局。

<details>
<summary>参考答案</summary>

1. 垂直排列元素：
    1. 属性：`flex-direction`
    2. 值：`column`
    3. 示例：

```css
.container {
display: flex;
flex-direction: column;
}
```

2. `flex=1`的缩写：
    1. 完整写法：`flex: 1 1 0%`
    2. 含义：
        1. `flex-grow: 1`：项目在主轴方向的扩展比例为1。
        2. `flex-shrink: 1`：项目在主轴方向的收缩比例为1。
        3. `flex-basis: 0%`：项目的初始大小为0%。
    3. 作用：在分配多余空间时，项目可以扩展和收缩，初始大小为0%。

</details>

## 5. 实现垂直居中的多种方法，讲一下你所有知道的。 {#question-1d338445-7c02-4ffa-9541-1f7a00896244}

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

## 6. JavaScript闭包原理及实际应用场景 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

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

## 7. 讲一下HTTP缓存机制，项目中有相关的设计么 ？ {#question-subjective-756076b7e776}

### 题目要点

网络优化。

<details>
<summary>参考答案</summary>

1. HTTP缓存机制：
    1. 强缓存：
        1. `Cache-Control`：指定缓存策略，如`max-age=3600`表示资源在3600秒内有效。
        2. `Expires`：指定资源过期时间。
    2. 协商缓存：
        1. `Last-Modified`：服务器返回资源最后修改时间，客户端请求时通过`If-Modified-Since`对比。
        2. `ETag`：服务器返回资源唯一标识，客户端通过`If-None-Match`对比。
    3. 缓存位置：浏览器缓存、CDN缓存、代理服务器缓存。
2. 项目设计：
    1. 设置合理的缓存策略：静态资源（如图片、CSS、JS）设置长缓存时间，动态资源设置短缓存时间。
    2. 使用CDN加速：将静态资源部署到CDN，减少服务器负载，提高访问速度。
    3. 版本化资源：通过文件名哈希（如`style.abc123.css`）实现缓存失效。

</details>

## 8. 了解跨域么 ？如何解决 {#question-56e56a05-99c7-4701-ae72-e06d2c6a4d42}

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

## 9. 从输入URL到页面渲染的完整过程，越详细越好 {#question-5def10e9-7825-4bd4-a76e-6d7eb555a2ce}

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

JavaScript异步编程。

<details>
<summary>参考答案</summary>

1. Promise：
    1. 定义：表示异步操作的最终完成或失败。
    2. 状态：pending（进行中）、fulfilled（成功）、rejected（失败）。
    3. 实现：

```javascript
class MyPromise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn());
            }
        };
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }
    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        const result = onFulfilled(this.value);
                        if (result instanceof MyPromise) {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            } else if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        const result = onRejected(this.reason);
                        if (result instanceof MyPromise) {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            } else {
                this.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const result = onFulfilled(this.value);
                            if (result instanceof MyPromise) {
                                result.then(resolve, reject);
                            } else {
                                resolve(result);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const result = onRejected(this.reason);
                            if (result instanceof MyPromise) {
                                result.then(resolve, reject);
                            } else {
                                resolve(result);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
        });
    }
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
}
```

2. Async/Await：
    1. 定义：基于Promise的语法糖，使异步代码更易读。
    2. 实现原理：编译器将async函数转换为状态机，使用Promise管理异步操作。
    3. 错误处理：

```javascript
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

</details>

## 11. 有没有做过响应式开发，核心原理及媒体查询讲一下。 {#question-dc8c6233-f645-444c-8e31-f18bc3f5244f}

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

## 12. 如何实现大文件分片上传与断点续传 {#question-5d5d730d-b80a-4535-a491-6bf059d389ff}

> 题库原题：[如何实现大文件分片上传与断点续传](https://fe.ecool.fun/topic/5d5d730d-b80a-4535-a491-6bf059d389ff)

### 题目要点

大文件上传通过前端切片与服务端合并实现；断点续传依赖文件唯一标识和已上传分片状态查询；前端按缺失分片继续上传并控制并发与重试；上传完成后需显式触发服务端合并和校验；整体是一个前后端协同的状态协议设计问题。

<details>
<summary>参考答案</summary>

在前端视角下，大文件分片上传与断点续传解决的不是“能不能上传”，而是**在不稳定网络环境下，如何保证上传过程可控、可恢复且对用户友好**。它本质上是一个前后端协同的协议设计问题，而不仅是前端切片这么简单。

在实现层面，前端首先需要在本地对文件进行切片。通常通过 `File` 对象的 `slice` 能力，将一个大文件按固定大小或动态策略拆分成多个 chunk。切片时并不立即上传所有数据，而是先生成一个能够唯一标识该文件的标识，例如基于文件内容、文件大小和修改时间计算的 hash。这个标识用于在后续的整个生命周期中，让前后端对“同一个文件”达成一致认知。

在真正上传之前，前端通常会先向服务端发起一次“查询请求”，用于确认哪些分片已经存在。这一步是断点续传的关键。服务端根据文件标识返回一个已上传分片的列表或上传进度，前端据此跳过已完成的分片，仅上传缺失部分。这样即使浏览器刷新、进程中断或网络异常，也可以从已有进度继续。

分片上传阶段，前端会为每个 chunk 附带必要的元信息，例如文件标识、分片索引、分片大小和总分片数。上传可以是串行、并行或受控并发的方式，具体策略取决于网络状况和服务端承载能力。并发上传需要额外关注失败重试和顺序无关性，确保单个分片失败不会影响整体状态。

当所有分片上传完成后，前端需要显式通知服务端执行“合并”操作。服务端根据分片索引顺序将数据合并成最终文件，并进行完整性校验，例如比对文件 hash 或大小。如果合并失败，服务端应返回明确状态，前端再决定是否重试或重新上传部分分片。

在这个过程中，前端的职责不仅是发请求，还包括进度管理和用户体验控制。总体进度通常不是简单的已完成分片数，而是基于每个分片大小加权计算；失败时要能够精确回退到某个分片级别，而不是整文件重来。这也是分片上传相比普通上传复杂得多的原因。

从工程设计角度看，还需要注意安全和一致性问题。例如文件标识不能完全信任前端生成，服务端应有自己的校验逻辑；分片的存储需要具备过期和清理机制，避免“半成品文件”长期占用资源。在对象存储场景下，通常会直接利用存储服务提供的分片 / 多段上传能力，将前端协议映射到底层存储接口上。

总体而言，大文件分片上传与断点续传的关键不在“切”，而在于**可恢复状态的设计**。只要前后端都围绕同一个文件标识和分片状态工作，上传过程就可以被安全地中断并继续。

</details>

## 13. 虚拟DOM的作用及Diff算法优化思路 {#question-d5acd6cf-38c3-4afb-965d-be79f03cd045}

> 题库原题：[什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路](https://fe.ecool.fun/topic/d5acd6cf-38c3-4afb-965d-be79f03cd045)

### 题目要点

虚拟DOM（Virtual DOM）是一种抽象层，它将真实的DOM操作转换为JavaScript对象的操作，这些对象被称为VNode（虚拟节点）。

VNode对象通常包含标签名、属性、子节点和文本等属性，以模拟真实的DOM节点。通过这种方式，可以对虚拟DOM进行高效操作，比如创建、删除和修改节点，而无需直接操作真实的DOM，从而提高了性能。

Vue.js 框架使用虚拟DOM来实现高效的DOM更新。在Vue中，每当数据变化时，会通过一系列操作（如创建VNode、更新VNode等）来更新虚拟DOM，然后通过diff算法比较新旧虚拟DOM，找出需要更新的最小单位，最后将这些更新应用到真实的DOM上。

虚拟DOM的主要优势在于它提供了一种高效的DOM操作方式，并且具有跨平台的能力。通过虚拟DOM，Vue能够支持如React Native和Weex等跨平台应用的开发。

在Vue中，`createElement`函数用于创建VNode。这个函数接收几个参数，包括上下文环境、标签名、数据对象（包含属性、事件监听器等）、子节点等，并返回一个VNode对象。VNode对象可以包含子节点，形成一个虚拟树结构，这个结构最终会被映射到真实的DOM树上。

<details>
<summary>参考答案</summary>

## 一、什么是虚拟DOM

虚拟 DOM （`Virtual DOM` ）这个概念相信大家都不陌生，从 `React` 到 `Vue` ，虚拟 `DOM` 为这两个框架都带来了跨平台的能力（`React-Native` 和 `Weex`）

实际上它只是一层对真实`DOM`的抽象，以`JavaScript` 对象 (`VNode` 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上

在`Javascript`对象中，虚拟`DOM` 表现为一个 `Object `对象。并且最少包含标签名 (`tag`)、属性 (`attrs`) 和子元素对象 (`children`) 三个属性，不同框架对这三个属性的名命可能会有差别

创建虚拟`DOM`就是为了更好将虚拟的节点渲染到页面视图中，所以虚拟`DOM`对象的节点与真实`DOM`的属性一一照应

在`vue`中同样使用到了虚拟`DOM`技术

定义真实`DOM`

```html
<div id="app">
    <p class="p">节点内容</p>
    <h3>{{ foo }}</h3>
</div>
```

实例化`vue`

```js
const app = new Vue({
    el:"#app",
    data:{
        foo:"foo"
    }
})
```

观察`render`的`render`，我们能得到虚拟`DOM`

```js
(function anonymous(
) {
    with(this){return _c('div',{attrs:{"id":"app"}},[_c('p',{staticClass:"p"},
                      [_v("节点内容")]),_v(" "),_c('h3',[_v(_s(foo))])])}})
```

通过`VNode`，`vue`可以对这颗抽象树进行创建节点,删除节点以及修改节点的操作， 经过`diff`算法得出一些需要修改的最小单位,再更新视图，减少了`dom`操作，提高了性能

## 二、为什么需要虚拟DOM

`DOM`是很慢的，其元素非常庞大，页面的性能问题，大部分都是由`DOM`操作引起的

真实的`DOM`节点，哪怕一个最简单的`div`也包含着很多属性，可以打印出来直观感受一下：
 ![](https://static.ecool.fun//article/2967524b-26f4-44a1-ae01-818bd4283f23.png)

由此可见，操作`DOM`的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户的体验

**举个例子：**

你用传统的原生`api`或`jQuery`去操作`DOM`时，浏览器会从构建`DOM`树开始从头到尾执行一遍流程

当你在一次操作时，需要更新10个`DOM`节点，浏览器没这么智能，收到第一个更新`DOM`请求后，并不知道后续还有9次更新操作，因此会马上执行流程，最终执行10次流程

而通过`VNode`，同样更新10个`DOM`节点，虚拟`DOM`不会立即操作`DOM`，而是将这10次更新的`diff`内容保存到本地的一个`js`对象中，最终将这个`js`对象一次性`attach`到`DOM`树上，避免大量的无谓计算

> 很多人认为虚拟 DOM 最大的优势是 diff 算法，减少 JavaScript 操作真实 DOM 的带来的性能消耗。虽然这一个虚拟 DOM 带来的一个优势，但并不是全部。虚拟 DOM 最大的优势在于抽象了原本的渲染过程，实现了跨平台的能力，而不仅仅局限于浏览器的 DOM，可以是安卓和 IOS 的原生组件，可以是近期很火热的小程序，也可以是各种GUI

## 三、如何实现虚拟DOM

首先可以看看`vue`中`VNode`的结构

源码位置：src/core/vdom/vnode.js

```js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    /*当前节点的标签名*/
    this.tag = tag
    /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.data = data
    /*当前节点的子节点，是一个数组*/
    this.children = children
    /*当前节点的文本*/
    this.text = text
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm
    /*当前节点的名字空间*/
    this.ns = undefined
    /*编译作用域*/
    this.context = context
    /*函数化组件作用域*/
    this.functionalContext = undefined
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key
    /*组件的option选项*/
    this.componentOptions = componentOptions
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined
    /*当前节点的父节点*/
    this.parent = undefined
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false
    /*静态节点标志*/
    this.isStatic = false
    /*是否作为跟节点插入*/
    this.isRootInsert = true
    /*是否为注释节点*/
    this.isComment = false
    /*是否为克隆节点*/
    this.isCloned = false
    /*是否有v-once指令*/
    this.isOnce = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next https://github.com/answershuto/learnVue*/
  get child (): Component | void {
    return this.componentInstance
  }
}
```

这里对`VNode`进行稍微的说明：

- 所有对象的 `context` 选项都指向了 `Vue` 实例
- `elm` 属性则指向了其相对应的真实 `DOM` 节点

`vue`是通过`createElement`生成`VNode`

源码位置：src/core/vdom/create-element.js

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

上面可以看到`createElement` 方法实际上是对 `_createElement` 方法的封装，对参数的传入进行了判断

```javascript
export function _createElement(
    context: Component,
    tag?: string | Class<Component> | Function | Object,
    data?: VNodeData,
    children?: any,
    normalizationType?: number
): VNode | Array<VNode> {
    if (isDef(data) && isDef((data: any).__ob__)) {
        process.env.NODE_ENV !== 'production' && warn(
            `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
            context`
        )
        return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
        tag = data.is
    }
    if (!tag) {
        // in case of component :is set to falsy value
        return createEmptyVNode()
    }
    ...
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
        typeof children[0] === 'function'
    ) {
        data = data || {}
        data.scopedSlots = { default: children[0] }
        children.length = 0
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children)
    } else if ( === SIMPLE_NORMALIZE) {
        children = simpleNormalizeChildren(children)
    }
    // 创建VNode
    ...
}
```

可以看到`_createElement`接收5个参数：

- `context` 表示 `VNode` 的上下文环境，是 `Component` 类型
- tag 表示标签，它可以是一个字符串，也可以是一个 `Component`

- `data` 表示 `VNode` 的数据，它是一个 `VNodeData` 类型

- `children` 表示当前 `VNode `的子节点，它是任意类型的

- `normalizationType` 表示子节点规范的类型，类型不同规范的方法也就不一样，主要是参考 `render` 函数是编译生成的还是用户手写的

根据`normalizationType` 的类型，`children`会有不同的定义

```js
if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
} else if ( === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
}
```

`simpleNormalizeChildren`方法调用场景是 `render` 函数是编译生成的

`normalizeChildren`方法调用场景分为下面两种：

-  `render` 函数是用户手写的
- 编译 `slot`、`v-for` 的时候会产生嵌套数组

无论是`simpleNormalizeChildren`还是`normalizeChildren`都是对`children`进行规范（使`children` 变成了一个类型为 `VNode` 的 `Array`），这里就不展开说了

规范化`children`的源码位置在：src/core/vdom/helpers/normalzie-children.js

在规范化`children`后，就去创建`VNode`

```js
let vnode, ns
// 对tag进行判断
if (typeof tag === 'string') {
  let Ctor
  ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  if (config.isReservedTag(tag)) {
    // 如果是内置的节点，则直接创建一个普通VNode
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    // 如果是component类型，则会通过createComponent创建VNode节点
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
```

`createComponent`同样是创建`VNode`

源码位置：src/core/vdom/create-component.js

```js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
 // 构建子类构造函数
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
    if (Ctor === undefined) {
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // 安装组件钩子函数，把钩子函数合并到data.hook中
  installComponentHooks(data)

  //实例化一个VNode返回。组件的VNode是没有children的
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}
```

稍微提下`createComponent`生成`VNode`的三个关键流程：

- 构造子类构造函数`Ctor `
- `installComponentHooks`安装组件钩子函数
- 实例化 `vnode`

### 小结

`createElement` 创建 `VNode` 的过程，每个 `VNode` 有 `children`，`children` 每个元素也是一个`VNode`，这样就形成了一个虚拟树结构，用于描述真实的`DOM`树结构

</details>

## 14. 移动端适配方案（rem、vw/vh、1px问题） {#question-subjective-42fc029fa8f1}

### 题目要点

移动端适配关注比例一致性和高 DPR 兼容；`rem` 通过动态根字体控制整体缩放，适合设计稿驱动的页面；`vw / vh` 基于视口原生自适应，更适合流式布局但需约束；1px 问题源于 DPR 差异，通常通过缩放或伪元素解决；工程实践中常组合使用多种方案而非单一技术。

<details>
<summary>参考答案</summary>

移动端适配的核心目标并不是“在不同屏幕上看起来一模一样”，而是**在不同尺寸、不同 DPR 的设备上保持视觉比例一致、交互可用、边界清晰**。`rem`、`vw / vh` 以及 1px 问题，分别对应的是“尺寸缩放模型”和“高分辨率下的物理像素差异”这两类问题。

在以 `rem` 为核心的适配方案中，关键不在单位本身，而在于**根字体大小如何计算**。通常会根据视口宽度动态设置 `html` 的 `font-size`，例如将设计稿宽度等分成若干份，使 1rem 对应设计稿中的一个固定比例单位。这样，页面中所有使用 `rem` 的尺寸都会随屏幕宽度线性缩放。`rem` 的优势在于可控性强，适合还原设计稿比例，且对复杂布局的稳定性较好；代价是需要一段运行时脚本或构建期处理，同时对“设计稿强依赖”，在横屏或超大屏设备上需要额外兜底策略。

`vw / vh` 则是另一种思路，它直接以视口尺寸为基准，将屏幕宽高拆分为 100 份。使用 `vw` 可以在不引入额外计算逻辑的情况下实现自适应布局，尤其适合流式排版和响应式组件。与 `rem` 不同，`vw` 更贴近 CSS 原生能力，但在极端尺寸下更容易失控，例如在超宽屏或折叠屏场景中，元素可能被放大到不符合设计预期。因此在实践中，通常会将 `vw` 与 `max-width`、`clamp` 等约束手段结合使用，而不是完全放任其自由缩放。

1px 问题本质上是**设备像素比（DPR）与 CSS 像素之间的差异**。在高 DPR 设备上，1 个 CSS 像素往往对应多个物理像素，直接使用 `border: 1px` 会显得比设计稿更粗。常见的解决思路是利用缩放或伪元素来“压缩”物理像素，例如通过 `transform: scale(0.5)` 绘制 1px 视觉线条，或者使用 `::after` 伪元素并按 DPR 调整缩放比例。随着浏览器对亚像素渲染支持的提升，在部分场景下直接使用 `0.5px` 也可以达到较好效果，但仍需要根据目标设备范围谨慎选择。

在实际项目中，适配方案往往不是“二选一”。布局层面可能采用 `vw` 或 Flex / Grid 的流式能力，尺寸体系上使用 `rem` 保持设计比例，而边界和分割线则针对性解决 1px 显示问题。真正重要的是统一度量体系，并在设计、开发和测试阶段形成共识，而不是堆叠技术名词。

</details>

## 15. Webpack的Loader和Plugin区别？ {#question-89eda79c-6cfb-4593-86d3-69d9ce9eb43d}

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

## 16. 讲一下你了解到的ES6+新特性并说明应用场景 {#question-subjective-3e531f618a23}

### 题目要点

ES6+ 新特性围绕模块化、作用域、异步模型和工程能力演进；`import / export` 和块级作用域提升了可维护性；`Promise` 与 `async / await` 重塑异步编程；新数据结构和语法糖改善状态管理与表达力；后续特性聚焦安全性、精度和国际化，整体推动 JS 工程化发展。

<details>
<summary>参考答案</summary>

从 ES6 开始，JavaScript 的演进不再是零散补丁式增强，而是**围绕“语言表达力、工程可维护性和运行时能力”持续系统化演进**。理解 ES6+ 新特性，重点不在于枚举 API，而在于它们解决了哪些历史问题，以及在什么场景下真正产生价值。

ES6 引入的最核心变化，是**模块化与作用域模型的重构**。`import / export` 让依赖关系在语法层面静态可分析，使构建工具能够进行 Tree Shaking，这在大型前端工程和组件库中至关重要。配合 `let / const` 和块级作用域，代码的可预测性显著提升，避免了 `var` 带来的提升和污染问题，在复杂业务逻辑和并发开发中尤为重要。

在异步模型上，`Promise` 与后续的 `async / await` 几乎重塑了前端的异步编程方式。`Promise` 提供了统一的异步抽象，而 `async / await` 则让异步流程以同步形式表达，极大降低了逻辑嵌套和错误处理成本。在接口编排、串并行请求控制以及复杂业务流程中，这套模型已经成为事实标准。

在数据结构与操作层面，ES6+ 提供了更符合直觉的能力。解构赋值让数据提取与函数参数声明更清晰，扩展运算符使不可变数据操作更加自然，在 React、Vue 等强调状态不可变或响应式的框架中应用非常广泛。`Map`、`Set` 等新数据结构解决了对象只能以字符串为 key 的历史限制，更适合做缓存、去重和关系映射。

在函数与对象模型上，箭头函数改变的不只是写法，而是对 `this` 语义的重新约束，使函数更适合用作“逻辑片段”而非可被随意绑定的对象方法；`class` 语法则为基于原型的继承提供了更清晰的抽象，降低了理解和维护成本，在组件封装、SDK 设计中更易表达意图。

进入 ES2019 及之后，语言开始关注**工程健壮性和边界场景**。例如 `optional chaining` 和 `nullish coalescing` 让对不确定数据结构的访问更加安全，显著减少防御性代码；`BigInt` 解决了金融、计数等场景下整数精度不足的问题；`Intl` 相关能力增强了国际化支持，在多语言产品中价值明显。

再往后，一些看似“细节”的特性，实际改善了开发体验和代码质量。例如 `Object.fromEntries` 让对象构造更对称，`Array.prototype.flat` 简化了数组展开逻辑，`Top-level await` 则让模块级异步初始化变得自然，适合配置加载、运行时环境探测等场景。

整体来看，ES6+ 的新特性并不是孤立存在的，而是共同推动 JavaScript 从“脚本语言”向“工程语言”转变。是否使用这些特性，取决于目标环境和编译策略，但理解其设计动机，才能在合适的地方发挥它们的价值。

</details>

## 17. 实现一个深拷贝函数（考虑循环引用和特殊对象） {#question-a6a869f2-a5f5-451e-8f1d-eb25cea4750f}

> 题库原题：[实现深拷贝](https://fe.ecool.fun/topic/a6a869f2-a5f5-451e-8f1d-eb25cea4750f)

### 题目要点

核心考查：实现一个深拷贝函数（考虑循环引用和特殊对象）的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
const cloneDeep1 = (target, hash = new WeakMap()) => {
  // 对于传入参数处理
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  // 哈希表中存在直接返回
  if (hash.has(target)) return hash.get(target);

  const cloneTarget = Array.isArray(target) ? [] : {};
  hash.set(target, cloneTarget);

  // 针对Symbol属性
  const symKeys = Object.getOwnPropertySymbols(target);
  if (symKeys.length) {
    symKeys.forEach(symKey => {
      if (typeof target[symKey] === 'object' && target[symKey] !== null) {
        cloneTarget[symKey] = cloneDeep1(target[symKey]);
      } else {
        cloneTarget[symKey] = target[symKey];
      }
    })
  }

  for (const i in target) {
    if (Object.prototype.hasOwnProperty.call(target, i)) {
      cloneTarget[i] =
        typeof target[i] === 'object' && target[i] !== null
        ? cloneDeep1(target[i], hash)
        : target[i];
    }
  }
  return cloneTarget;
}

```

</details>

## 18. React生命周期讲一下 {#question-f59d29a2-7ff8-41ca-8176-a24f1ca6d0f5}

> 题库原题：[简述下 React 的生命周期？每个生命周期都做了什么？](https://fe.ecool.fun/topic/f59d29a2-7ff8-41ca-8176-a24f1ca6d0f5)

### 题目要点

React 的生命周期方法是类组件中的特性，用于在组件的不同阶段执行特定的代码。

在 React 16.3 之前，生命周期方法主要分为三个阶段：挂载（Mounting）、更新（Updating）和卸载（Unmounting）。

React 16.3 引入了新的生命周期方法，并且在 React 16.8 中引入了 Hooks，使得函数组件也能处理类似的逻辑。

以下是类组件生命周期方法的详细描述：

### 1. **挂载（Mounting）**

组件被创建并插入到 DOM 中的过程。

- **`constructor(props)`**
  - **作用**：构造函数，用于初始化组件状态和绑定事件处理函数。
  - **调用时机**：组件创建时调用，第一次渲染之前。

- **`static getDerivedStateFromProps(nextProps, prevState)`**
  - **作用**：在每次渲染之前调用，允许组件根据 props 更新状态。
  - **调用时机**：挂载和更新时都会调用。

- **`render()`**
  - **作用**：渲染组件的 UI。必须实现的核心方法。
  - **调用时机**：组件的第一次渲染和每次更新时调用。

- **`componentDidMount()`**
  - **作用**：组件挂载完成后调用。通常用于进行数据获取、订阅或设置 DOM 操作。
  - **调用时机**：组件第一次渲染完成后调用。

### 2. **更新（Updating）**

组件由于 props 或 state 的变化而重新渲染的过程。

- **`static getDerivedStateFromProps(nextProps, prevState)`**
  - **作用**：如前所述，也会在更新时调用，以便根据新的 props 更新状态。

- **`shouldComponentUpdate(nextProps, nextState)`**
  - **作用**：用于控制组件是否应该更新。返回 `false` 可以阻止组件更新。
  - **调用时机**：在组件的 props 或 state 变化时调用，决定是否重新渲染组件。

- **`render()`**
  - **作用**：渲染组件的 UI，如前所述。

- **`getSnapshotBeforeUpdate(prevProps, prevState)`**
  - **作用**：在实际 DOM 更新之前调用，可以获取 DOM 的状态，以便在 `componentDidUpdate` 中使用。
  - **调用时机**：组件更新时，在 `render` 之后，实际 DOM 更新之前。

- **`componentDidUpdate(prevProps, prevState, snapshot)`**
  - **作用**：组件更新完成后调用。可以用于处理更新后的 DOM 或发送网络请求等。
  - **调用时机**：组件更新完成后调用。

### 3. **卸载（Unmounting）**

组件从 DOM 中移除的过程。

- **`componentWillUnmount()`**
  - **作用**：组件卸载前调用。用于清理资源，如取消订阅、清除定时器等。
  - **调用时机**：组件被从 DOM 中移除之前调用。

### 4. **错误处理（Error Handling）**

处理组件树中 JavaScript 错误的生命周期方法。

- **`componentDidCatch(error, info)`**
  - **作用**：捕获子组件树中的错误，记录错误信息或显示备用 UI。
  - **调用时机**：组件树中发生错误时调用。

### 5. **总结**

- **挂载**：`constructor`、`getDerivedStateFromProps`、`render`、`componentDidMount`
- **更新**：`getDerivedStateFromProps`、`shouldComponentUpdate`、`render`、`getSnapshotBeforeUpdate`、`componentDidUpdate`
- **卸载**：`componentWillUnmount`
- **错误处理**：`componentDidCatch`

### 6. **函数组件中的生命周期**

在函数组件中，使用 Hooks 实现类似的功能：

- **`useState`**：管理组件状态。
- **`useEffect`**：处理副作用，可以模拟 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount`。
- **`useMemo`** 和 **`useCallback`**：用于性能优化，类似于 `shouldComponentUpdate`。
- **`useRef`**：管理可变的引用，类似于 `componentDidMount` 和 `componentDidUpdate` 中的 DOM 操作。

使用这些 Hooks，可以在函数组件中实现和类组件类似的生命周期管理逻辑。

<details>
<summary>参考答案</summary>

![生命周期示意图](https://static.ecool.fun//article/0cdd2ef9-dfc0-49b1-b5ff-e1bfa069c438.png)

## 挂载

当组件实例被创建并插入 DOM 中时，其生命周期调用顺序如下：

* constructor()
* static getDerivedStateFromProps()
* render()
* componentDidMount()

## 更新

当组件的 props 或 state 发生变化时会触发更新。组件更新的生命周期调用顺序如下：

* static getDerivedStateFromProps()
* shouldComponentUpdate()
* render()
* getSnapshotBeforeUpdate()
* componentDidUpdate()

## 卸载

当组件从 DOM 中移除时会调用如下方法：

* componentWillUnmount()

## 错误处理

渲染过程，生命周期，或子组件的构造函数中抛出错误时，会调用如下方法：

* static getDerivedStateFromError()
* componentDidCatch()

## 具体介绍

### render()

render() 方法是 class 组件中唯一必须实现的方法。

当 render 被调用时，它会检查 this.props 和 this.state 的变化并返回以下类型之一：

* React 元素。通常通过 JSX 创建。例如，<div /> 会被 React 渲染为 DOM 节点，<MyComponent /> 会被 React 渲染为自定义组件，无论是 <div /> 还是 <MyComponent /> 均为 React 元素。
* 数组或 fragments。 使得 render 方法可以返回多个元素。欲了解更多详细信息，请参阅 fragments 文档。
* Portals。可以渲染子节点到不同的 DOM 子树中。欲了解更多详细信息，请参阅有关 portals 的文档
* 字符串或数值类型。它们在 DOM 中会被渲染为文本节点
* 布尔类型或 null。什么都不渲染。（主要用于支持返回 test && <Child /> 的模式，其中 test 为布尔类型。）

render() 函数应该为纯函数，这意味着在不修改组件 state 的情况下，每次调用时都返回相同的结果，并且它不会直接与浏览器交互。

如需与浏览器进行交互，请在 componentDidMount() 或其他生命周期方法中执行你的操作。保持 render() 为纯函数，可以使组件更容易思考。

### constructor()

如果不初始化 state 或不进行方法绑定，则不需要为 React 组件实现构造函数。

在 React 组件挂载之前，会调用它的构造函数。在为 React.Component 子类实现构造函数时，应在其他语句之前前调用 super(props)。否则，this.props 在构造函数中可能会出现未定义的 bug。

通常，在 React 中，构造函数仅用于以下两种情况：

通过给 this.state 赋值对象来初始化内部 state。

* 为事件处理函数绑定实例
* 在 constructor() 函数中不要调用 setState() 方法。如果你的组件需要使用内部 state，请直接在构造函数中为 this.state 赋值初始 state。

只能在构造函数中直接为 this.state 赋值。如需在其他方法中赋值，你应使用 this.setState() 替代。

要避免在构造函数中引入任何副作用或订阅。如遇到此场景，请将对应的操作放置在 componentDidMount 中。

### componentDidMount()

componentDidMount() 会在组件挂载后（插入 DOM 树中）立即调用。依赖于 DOM 节点的初始化应该放在这里。如需通过网络请求获取数据，此处是实例化请求的好地方。

这个方法是比较适合添加订阅的地方。如果添加了订阅，请不要忘记在 componentWillUnmount() 里取消订阅

你可以在 componentDidMount() 里直接调用 setState()。它将触发额外渲染，但此渲染会发生在浏览器更新屏幕之前。如此保证了即使在 render() 两次调用的情况下，用户也不会看到中间状态。请谨慎使用该模式，因为它会导致性能问题。通常，你应该在 constructor() 中初始化 state。如果你的渲染依赖于 DOM 节点的大小或位置，比如实现 modals 和 tooltips 等情况下，你可以使用此方式处理。

### componentDidUpdate()

componentDidUpdate() 会在更新后会被立即调用。首次渲染不会执行此方法。

当组件更新后，可以在此处对 DOM 进行操作。如果你对更新前后的 props 进行了比较，也可以选择在此处进行网络请求。（例如，当 props 未发生变化时，则不会执行网络请求）。

```react.js
componentDidUpdate(prevProps) {
  // 典型用法（不要忘记比较 props）：
  if (this.props.userID !== prevProps.userID) {
    this.fetchData(this.props.userID);
  }
}
```

你也可以在 componentDidUpdate() 中直接调用 setState()，但请注意它必须被包裹在一个条件语句里，正如上述的例子那样进行处理，否则会导致死循环。它还会导致额外的重新渲染，虽然用户不可见，但会影响组件性能。不要将 props “镜像”给 state，请考虑直接使用 props。 欲了解更多有关内容，请参阅为什么 props 复制给 state 会产生 bug。

如果组件实现了 getSnapshotBeforeUpdate() 生命周期（不常用），则它的返回值将作为 componentDidUpdate() 的第三个参数 “snapshot” 参数传递。否则此参数将为 undefined。

### componentWillUnmount()

componentWillUnmount() 会在组件卸载及销毁之前直接调用。在此方法中执行必要的清理操作，例如，清除 timer，取消网络请求或清除在 componentDidMount() 中创建的订阅等。

componentWillUnmount() 中不应调用 setState()，因为该组件将永远不会重新渲染。组件实例卸载后，将永远不会再挂载它。

### shouldComponentUpdate()

根据 shouldComponentUpdate() 的返回值，判断 React 组件的输出是否受当前 state 或 props 更改的影响。默认行为是 state 每次发生变化组件都会重新渲染。大部分情况下，你应该遵循默认行为。

当 props 或 state 发生变化时，shouldComponentUpdate() 会在渲染执行之前被调用。返回值默认为 true。首次渲染或使用 forceUpdate() 时不会调用该方法。

此方法仅作为性能优化的方式而存在。不要企图依靠此方法来“阻止”渲染，因为这可能会产生 bug。你应该考虑使用内置的 PureComponent 组件，而不是手动编写 shouldComponentUpdate()。PureComponent 会对 props 和 state 进行浅层比较，并减少了跳过必要更新的可能性。

如果你一定要手动编写此函数，可以将 this.props 与 nextProps 以及 this.state 与nextState 进行比较，并返回 false 以告知 React 可以跳过更新。请注意，返回 false 并不会阻止子组件在 state 更改时重新渲染。

我们不建议在 shouldComponentUpdate() 中进行深层比较或使用 JSON.stringify()。这样非常影响效率，且会损害性能。

目前，如果 shouldComponentUpdate() 返回 false，则不会调用 UNSAFE_componentWillUpdate()，render() 和 componentDidUpdate()。后续版本，React 可能会将 shouldComponentUpdate 视为提示而不是严格的指令，并且，当返回 false 时，仍可能导致组件重新渲染。

### static getDerivedStateFromProps()

getDerivedStateFromProps 会在调用 render 方法之前调用，并且在初始挂载及后续更新时都会被调用。它应返回一个对象来更新 state，如果返回 null 则不更新任何内容。

此方法适用于罕见的用例，即 state 的值在任何时候都取决于 props。例如，实现 <Transition> 组件可能很方便，该组件会比较当前组件与下一组件，以决定针对哪些组件进行转场动画。

派生状态会导致代码冗余，并使组件难以维护。 确保你已熟悉这些简单的替代方案：

* 如果你需要执行副作用（例如，数据提取或动画）以响应 props 中的更改，请改用 componentDidUpdate。
* 如果只想在 prop 更改时重新计算某些数据，请使用 memoization helper 代替。
* 如果你想在 prop 更改时“重置”某些 state，请考虑使组件完全受控或使用 key 使组件完全不受控代替。

此方法无权访问组件实例。如果你需要，可以通过提取组件 props 的纯函数及 class 之外的状态，在getDerivedStateFromProps()和其他 class 方法之间重用代码。

请注意，不管原因是什么，都会在每次渲染前触发此方法。这与 UNSAFE_componentWillReceiveProps 形成对比，后者仅在父组件重新渲染时触发，而不是在内部调用 setState 时。

### getSnapshotBeforeUpdate()

getSnapshotBeforeUpdate() 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期方法的任何返回值将作为参数传递给 componentDidUpdate()。

此用法并不常见，但它可能出现在 UI 处理中，如需要以特殊方式处理滚动位置的聊天线程等。

应返回 snapshot 的值（或 null）。

### Error boundaries

Error boundaries 是 React 组件，它会在其子组件树中的任何位置捕获 JavaScript 错误，并记录这些错误，展示降级 UI 而不是崩溃的组件树。Error boundaries 组件会捕获在渲染期间，在生命周期方法以及其整个树的构造函数中发生的错误。

如果 class 组件定义了生命周期方法 static getDerivedStateFromError() 或 componentDidCatch() 中的任何一个（或两者），它就成为了 Error boundaries。通过生命周期更新 state 可让组件捕获树中未处理的 JavaScript 错误并展示降级 UI。

仅使用 Error boundaries 组件来从意外异常中恢复的情况；不要将它们用于流程控制。

### static getDerivedStateFromError()

此生命周期会在后代组件抛出错误后被调用。 它将抛出的错误作为参数，并返回一个值以更新 state。

### componentDidCatch()

此生命周期在后代组件抛出错误后被调用。 它接收两个参数：

* error —— 抛出的错误。
* info —— 带有 componentStack key 的对象，其中包含有关组件引发错误的栈信息。

componentDidCatch() 会在“提交”阶段被调用，因此允许执行副作用。 它应该用于记录错误之类的情况。

React 的开发和生产构建版本在 componentDidCatch() 的方式上有轻微差别。

在开发模式下，错误会冒泡至 window，这意味着任何 window.onerror 或 window.addEventListener('error', callback) 会中断这些已经被 componentDidCatch() 捕获的错误。

相反，在生产模式下，错误不会冒泡，这意味着任何根错误处理器只会接受那些没有显式地被 componentDidCatch() 捕获的错误。

</details>

## 19. useEffect，第二个参数是依赖项数组，如果依赖项数组是x，在页面中绑定了a.x，并且对a.x进行值的修改，useEffect会重新执行回调函数吗?为什么 {#question-subjective-6ca751891197}

### 题目要点

`useEffect` 依赖项通过 `Object.is` 做引用比较；修改对象内部属性不会改变引用，因此不会触发 effect；只有依赖项本身引用变化或直接依赖具体字段才会重新执行；这是 React 显式、可预测依赖模型的设计结果。

<details>
<summary>参考答案</summary>

结论先行：**不会重新执行**。`useEffect` 是否重新执行，只取决于依赖项数组中每一项的**引用是否发生变化**，而不是该引用“内部的某个字段是否变化”。

在这个场景中，依赖项数组是 `x`，而页面中实际使用和修改的是 `a.x`。如果 `x` 本身是一个对象引用，并且 `a.x` 只是这个对象上的某个属性，那么修改 `a.x` 并不会改变 `x` 这个引用在内存中的指向。React 在依赖比较时使用的是 `Object.is`，比较的是前后两次 render 中 `x` 的引用是否相同，而不是进行深层对比。

因此，当执行的是类似 `a.x = newValue` 这样的操作时，`x` 仍然指向同一个对象实例，React 会认为依赖没有发生变化，`useEffect` 不会重新执行。这一点和 Vue 的响应式系统有本质差异，React 并不会自动追踪对象内部字段的变化。

只有在以下情况下，`useEffect` 才会重新触发：例如通过不可变更新的方式，创建了一个新的对象并赋值给 `x`，使得 `x` 的引用发生变化；或者直接把 `a.x` 作为依赖项传入依赖数组，而不是传入 `x` 本身。前者依赖不可变数据模式，后者则是通过更精确的依赖声明来驱动 effect。

从设计角度看，这种行为并不是限制，而是 React 有意为之。`useEffect` 的依赖模型是“显式声明 + 引用比较”，这样可以保证执行逻辑是可预测的，避免因隐式深度监听带来的性能问题和不确定性。代价是开发者必须对状态更新方式和依赖声明负责。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-32/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-32/round-39/index.md" >}}) →
