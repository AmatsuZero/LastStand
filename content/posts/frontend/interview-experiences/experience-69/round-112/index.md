+++
title = "百度-APP产品研发-秋招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/69"
experienceId = 69
roundId = 112
roundOrder = 1
company = "百度"
date = "2025-08-19T14:47:24.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-69/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-69/round-115/index.md" >}}) →

本轮共 15 道题。答案默认折叠，便于先自行作答。

## 1. 前端实现动画有哪些方式？ {#question-8b516cb7-fa94-4d68-929f-d3c628d1b7a2}

> 题库原题：[前端实现动画有哪些方式？](https://fe.ecool.fun/topic/8b516cb7-fa94-4d68-929f-d3c628d1b7a2)

### 题目要点

前端开发中，实现动画的方法多种多样，每种方法都有其适用场景和优缺点。以下是一些常见的实现方式：

1. **CSS 动画**：
   - 使用 `@keyframes` 和 `animation` 属性定义动画。
   - 优点：易于实现，性能好，易于维护。
   - 缺点：功能相对简单，难以实现复杂的交互动画。

2. **CSS 过渡（Transitions）**：
   - 使用 `transition` 属性在状态变化时实现平滑过渡。
   - 优点：简单易用，性能优秀。
   - 缺点：只能用于状态变化的过渡，不适合复杂动画。

3. **JavaScript 动画**：
   - 使用 JavaScript 直接操作 DOM 元素的样式属性实现动画。
   - 优点：灵活性高，可以控制动画的每一个细节。
   - 缺点：可能影响性能，需要更多的代码实现。

4. **Web Animations API**：
   - 使用 `Element.animate()` 方法实现动画。
   - 优点：提供更丰富的动画控制和更一致的跨浏览器支持。
   - 缺点：兼容性不如 CSS 动画。

5. **SVG 动画**：
   - 使用 SVG 元素和 SMIL（Synchronized Multimedia Integration Language）或 CSS 动画实现动画。
   - 优点：适合矢量图形动画，易于集成。
   - 缺点：浏览器支持和性能可能不如 CSS 动画。

6. **Canvas**：
   - 使用 HTML `<canvas>` 元素和 JavaScript 绘制动画。
   - 优点：适合复杂的图形和游戏动画。
   - 缺点：实现复杂，需要手动管理每一帧的绘制。

7. **CSS 3D 变换**：
   - 使用 `transform` 属性的 3D 变换实现动画效果。
   - 优点：可以触发硬件加速，提升性能。
   - 缺点：兼容性和浏览器支持有限。

8. **请求动画帧（requestAnimationFrame）**：
   - 使用 `requestAnimationFrame` 方法实现平滑的动画。
   - 优点：性能好，适合复杂的动画和游戏。
   - 缺点：实现相对复杂，需要手动控制每一帧。

9. **CSS Grid 和 Flexbox**：
   - 利用 CSS Grid 和 Flexbox 的布局特性实现动画效果。
   - 优点：易于实现，兼容性好。
   - 缺点：主要用于布局动画，不适合复杂的动画效果。

#### 考察重点

- 理解：不同动画实现方式的特点和适用场景。
- 选择：根据项目需求和目标选择合适的动画实现方式。

<details>
<summary>参考答案</summary>

前端常用的动画实现方式有以下种：

1. css3的`transition` 属性
2. css3的`animation` 属性
3. 原生JS动画
4. 使用`canvas`绘制动画
5. SVG动画
6. Jquery的`animate`函数
7. 使用gif图片

## 1. css3的`transition`

`transition`属性：

用来设置样式的属性值是如何从一种状态平滑过渡到另外一种状态

**语法：**

```css
transition: property duration timing-function delay;
```

`transition`是一种简写属性,它可以拆分为四个过渡属性。你可以 `transition: 值1，值2，值3，值4` 这样写，也可以：`transition-property: 值1;`，`transition-duration:值2;`，`transition-timing-function:值2;`，`transition-delay:值4;`这样写。

| 值 | 描述 |
| --|--|
|transition-property|规定设置过渡效果的 CSS 属性的名称。|
|transition-duration|规定完成过渡效果需要多少秒或毫秒。|
|transition-timing-function|规定速度效果的速度曲线。|
|transition-delay|定义过渡效果何时开始。|

**演示代码：**

```html
<div></div>

```

```css
div{
  width:50px;
  height: 50px;
  background-color: pink;
}

div:hover{
  width:200px;
}
```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d5cabe35b~tplv-t2oaga2asx-image.image)

由上图可看出：鼠标移入移出时,`width`状态的变化是瞬间完成的。

添加`transition: 1s;`后

```css
div{
  width:50px;
  height: 50px;
  background-color: pink;
  transition: 1s;
}
div:hover{
  width:200px;
}
```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d5de25bf8~tplv-t2oaga2asx-image.image)

`transition: 1s;` 设置了`width`属性状态变化的过渡时间为1秒。

`transition`属性默认为：`transition: all 0 ease 0;`

`transition:1s;` 等价于 `transition: all 1s ease 0;`

## 2. css3的`animation`

`animation`属性：比较类似于 flash 中的逐帧动画。学习过 `flash`的同学知道，这种逐帧动画是由关键帧组成，很多个关键帧连续的播放就组成了动画在 `CSS3` 中是由属性`keyframes`来完成逐帧动画的。

`animation`属性与`transition`属性的区别：

* `transition`只需指定动画的开始和结束状态，整个动画的过程是由特定的函数控制,你不用管它。
* `animation`可以对动画过程中的各个关键帧进行设置

**演示代码：**

```html
<div></div>

```

```css
div{
    width:50px;
    height:50px;
    background-color: pink;
}
div:hover{
    animation: change1 5s;
}
@keyframes change1{
    25%  {width:130px;background-color: red;}
    50%  {width:170px;background-color: blue;}
    75%  {width:210px;background-color: green;}
    100% {width:250px;background-color: yellow;}
}

```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d834ba42c~tplv-t2oaga2asx-image.image)

## 3. 原生`JS`动画

其主要思想是通过setInterval或setTimeout方法的回调函数来持续调用改变某个元素的CSS样式以达到元素样式变化的效果。

javascript 实现动画通常会导致页面频繁性重排重绘，消耗性能，一般应该在桌面端浏览器。在移动端上使用会有明显的卡顿。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style type="text/css">
        #rect {
            width: 200px;
            height: 200px;
            background: #ccc;
        }
    </style>
</head>
<body>
    <div id="rect"></div>
    <script>
        let elem = document.getElementById('rect');
        let left = 0;
        let timer = setInterval(function(){
            if(left<window.innerWidth-200){
                elem.style.marginLeft = left+'px';
                left ++;
            }else {
                clearInterval(timer);
            }
        },16);
    </script>
</body>
</html>

```

上面的例子中，我们设置的setInterval时间间隔是16ms。一般认为人眼能辨识的流畅动画为每秒60帧，这里16ms比(1000ms/60)帧略小一些，但是一般可仍为该动画是流畅的。

在很多移动端动画性能优化时，一般使用16ms来进行节流处理连续触发的浏览器事件。例如对touchmove、scroll事件进行节流等。通过这种方式减少持续事件的触发频率，可以大大提升动画的流畅性。

## 4. 使用`canvas`绘制动画

canvas作为H5新增元素，是借助Web API来实现动画的。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <style>
    *{
        margin:0;
        padding:0;
    }
    </style>
</head>
<body>
    <canvas id="canvas" width="700" height="550"></canvas>
    <script type="text/javascript">
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        let left = 0;
        let timer = setInterval(function(){
            ctx.clearRect(0,0,700,550);
            ctx.beginPath();
            ctx.fillStyle = "#ccc";
            ctx.fillRect(left,0,100,100);
            ctx.stroke();
            if(left>700){
                clearInterval(timer);
            }
            left += 1;
        },16);
    </script>
</body>
</html>
```

注释：通过getContext()获取元素的绘制对象，通过clearRect不断清空画布并在新的位置上使用fillStyle绘制新矩形内容实现页面动画效果。

Canvas主要优势是可以应对页面中多个动画元素渲染较慢的情况，完全通过javascript来渲染控制动画的执行。可用于实现较复杂动画。

## 5. SVG 动画

SVG是一种基于XML的图像格式，非常类似于HTML的工作方式。它为许多熟悉的几何形状定义了不同的元素，这些元素可以在标记中组合以产生二维图形。

同样高清的质地，矢量图不畏惧放大，体积小。

这里要说明一点就是，因为 SVG 中保存的是点、线、面的信息，与分辨率和图形大小无关，只是跟图像的复杂程度有关，所以图像文件所占的存储空间通常会比 png 小。

SVG动画的优势：

* 优化 SEO 和无障碍的利器，因为 SVG 图像是使用XML(可扩展标记语言【英语：Extensible Markup Language，简称：XML】标记指计算机所能理解的信息符号，通过此种标记，计算机之间可以处理包含各种信息的文章等)来标记构建的，浏览器通过绘制每个点和线来打印它们，而不是用预定义的像素填充某些空间。这确保 SVG 图像可以适应不同的屏幕大小和分辨率。
* 由于是在 XML 中定义的，SVG 图像比 JPG 或 PNG 图像更灵活，而且我们可以使用 CSS 和 JavaScript 与它们进行交互。SVG 图像设置可以包含 CSS 和 JavaScript。在 react、vue 这种数据驱动视图的框架下，对于 SVG 操作就更加如鱼得水了。（下文会跟大家分享一些小的 SVG 动画在我们项目中的实践）
* 在运用层面上，SVG 提供了一些图像编辑效果，比如屏蔽和剪裁、应用过滤器等等。并且 SVG 只是文本，因此可以使用 GZip 对其进行有效压缩。

## 6. Jquery的`animate()`方法

* `animate()` 方法执行 `CSS` 属性集的自定义动画。
* 该方法通过 CSS 样式将元素从一个状态改变为另一个状态。
* CSS属性值是逐渐改变的，这样就可以创建动画效果。
* 只有数字值可创建动画（比如 "`margin:30px`"）。字符串值无法创建动画（比如 "`background-color:red`"）。

**代码演示：**

```html
<button id="btn1">使用动画放大高度</button>
<button id="btn2">重置高度</button>
<div id="box" style="background:#98bf21;height:100px;width:100px;margin:6px;">
</div>

```

```css
$(document).ready(function(){
    $("#btn1").click(function(){
        $("#box").animate({height:"300px"});
    });
    $("#btn2").click(function(){
        $("#box").animate({height:"100px"});
    });
});

```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d89e475ad~tplv-t2oaga2asx-image.image)

##  7. 使用`gif`图片

gif图想必大家都接触过，前端使用也非常简单。

## 总结：

* **代码复杂度方面**简单动画：`css`代码实现会简单一些，`js`复杂一些。 复杂动画的话：`css`代码就会变得冗长，`js`实现起来更优。
* **动画运行时，对动画的控制程度上** `js` 比较灵活，能控制动画暂停，取消，终止等`css`动画不能添加事件，只能设置固定节点进行什么样的过渡动画。
* **兼容方面** `css` 有浏览器兼容问题`js`大多情况下是没有的。
* **性能方面** `css`动画相对于优一些，`css` 动画通过`GUI`解析`js`动画需要经过`js`引擎代码解析，然后再进行 `GUI` 解析渲染。

</details>

## 2. 你了解像素单位吗？能讲一下这一类单位有多少种？ {#question-subjective-63b39065a61a}

### 题目要点

像素单位不仅仅是 `px`，还包括一系列 **相对单位、视口单位、排版单位、物理单位**。在浏览器环境下，核心单位主要有：

* **px**（逻辑像素，最常用）
* **em / rem**（相对字体大小）
* **vw / vh / vmin / vmax**（相对视口大小）
* **pt / cm / mm / in**（绝对物理单位，主要用于打印）

理解这些单位的区别与适用场景，对于处理 **响应式布局、高分屏适配、打印排版** 等场景至关重要。

<details>
<summary>参考答案</summary>

在前端开发中，“像素单位”这个话题常常容易混淆，因为浏览器渲染涉及 **物理像素、逻辑像素、CSS 像素** 等多种概念。严格来说，前端中的“像素单位”并不仅指 px，还包括一系列与显示设备和视口相关的度量方式。

## 一、像素相关的单位分类

### 1. **绝对单位**

* **px（像素）**
  CSS 中的基础长度单位。它是一个“逻辑像素”，并非物理像素。在标准 CSS 中，1px 被定义为视距 28 英寸时，物理尺寸约 1/96 英寸。
  由于设备像素比（`devicePixelRatio`），1px 可能对应多个物理像素。

### 2. **相对长度单位（基于字体）**

* **em**
  相对于父元素的 `font-size`，常用于排版。
* **rem**
  相对于根元素（html）的 `font-size`，常用于响应式布局。

### 3. **视口相对单位**

这些单位与设备屏幕或视口大小有关：

* **vw（viewport width）**：1vw = 视口宽度的 1%
* **vh（viewport height）**：1vh = 视口高度的 1%
* **vmin**：取 vw 和 vh 的最小值
* **vmax**：取 vw 和 vh 的最大值

在移动端响应式设计中，这类单位应用非常广泛。

### 4. **绝对物理单位（较少使用）**

主要是印刷相关的传统单位，在 CSS 中也能使用，但在屏幕设备上通常被映射为固定比例的 px：

* **in（英寸）**
* **cm（厘米）**
* **mm（毫米）**
* **pt（点，1/72 英寸）**
* **pc（派卡，1pc = 12pt）**

这些单位的渲染结果取决于设备的像素密度，实际意义有限，多用于打印或 PDF。

### 5. **动态单位**

* **ex**：当前字体的小写字母 x 的高度
* **ch**：数字 0 的宽度
  这些主要用于排版精细控制。

## 二、与像素相关的特殊概念

* **设备像素（Device Pixel）**
  屏幕的物理像素点。不同设备有不同密度（PPI 或 DPI）。
* **CSS 像素（CSS Pixel）**
  CSS 中定义的逻辑像素，开发者写的 `1px` 实际会映射到设备上的若干物理像素。
* **设备像素比（DPR, Device Pixel Ratio）**
  `DPR = 设备物理像素 / CSS 像素`
  在高分屏（如 Retina 屏）上，1 CSS 像素可能对应 2×2 或 3×3 的物理像素。

</details>

## 3. 10vh 代表什么意思？ {#question-subjective-7809fc01cead}

### 题目要点

`10vh` 是一个 **CSS 视口相对单位**，具体含义是：

<details>
<summary>参考答案</summary>

`10vh` 是一个 **CSS 视口相对单位**，具体含义是：

* `vh` 表示 **viewport height**，即视口（可见窗口）高度的百分比。
* `10vh` = 视口高度的 10%。

</details>

## 4. 你用过 rpx吗？ {#question-subjective-43d5629f90f0}

### 题目要点

* `rpx` 是微信小程序的自适应单位，1 屏幕宽度 = 750rpx。
* 在不同设备上，`rpx` 会换算成不同的物理像素值，保证视觉效果一致。
* 适合小程序场景，但不通用于传统 Web。

<details>
<summary>参考答案</summary>

是的，`rpx` 是 **微信小程序** 中特有的一种长度单位，全称是 **responsive pixel（响应像素）**。它的核心设计目的是为了解决不同设备屏幕宽度不一致时的适配问题。

## 一、rpx 的定义

* 在微信小程序中，**规定屏幕宽度固定等分为 750 份**，即 750rpx。
* 无论手机屏幕宽度是 320px（低端机）、375px（iPhone 6/7/8）、414px（iPhone Plus）还是 1080px（高分屏），**750rpx 始终等于屏幕宽度**。
* 因此：

  * 在 iPhone6（屏幕宽度 375px，DPR=2）上：1rpx = 0.5px
  * 在 1080px 宽度设备上：1rpx = 1080 / 750 ≈ 1.44px

## 二、使用场景

* 页面布局时，开发者不用关心设备具体宽度，只需要基于 **750rpx 设计稿** 来标注尺寸。
* 常见用法：

  ```css
  .box {
    width: 750rpx;   /* 总是占满屏幕宽度 */
    height: 200rpx;
    background: red;
  }
  ```

## 三、优势与问题

### 优势：

1. **自适配**：不同屏幕宽度下自动换算，保持一致的设计效果。
2. **与设计稿对齐**：设计稿通常以 750px 宽度标注，开发时直接按 rpx 写样式即可。

### 潜在问题：

1. 在极窄或极宽屏幕设备下，某些元素可能过小或过大，需要结合 `px` 或 `vw/vh` 做优化。
2. `rpx` 仅限小程序环境，**Web 浏览器和原生 App 并不支持**。

</details>

## 5. 我有一个变量，想准确判断它的数据类型，合理的判断流程是什么？ {#question-subjective-280697fce954}

### 题目要点

1. **null 和 NaN** 要单独判断；
2. **typeof** 可准确识别基本类型，但对对象类不够精细；
3. **Object.prototype.toString** 是区分对象类型最可靠的方式；
4. 对于类实例，可以结合 `instanceof` 使用，但要注意跨上下文问题。

<details>
<summary>参考答案</summary>

这是一个非常经典且常考的问题，因为在 JavaScript 中，变量类型判断存在一些陷阱。合理的判断流程需要结合 **`typeof`**、**`Object.prototype.toString`**、以及部分内建函数来分层判断。

## 一、为什么要设计判断流程

* `typeof` 简单高效，但对复杂对象的区分能力有限（例如 `typeof null === 'object'`）。
* `instanceof` 可以判断引用类型，但无法跨 iframe/window。
* `Object.prototype.toString.call(value)` 能精确区分大多数内建对象，是最稳妥的方法。

## 二、合理的类型判断流程

### 1. 先处理特殊情况

* **`null`**：
  `value === null` → `true`，这是唯一能直接精确判断的方式。
* **`NaN`**：
  用 `Number.isNaN(value)` 判断，而不是 `value === NaN`。

### 2. 使用 `typeof` 初步分类

* **基础类型**：

  ```js
  typeof value === 'string'
  typeof value === 'number'
  typeof value === 'boolean'
  typeof value === 'undefined'
  typeof value === 'symbol'
  typeof value === 'bigint'
  ```

  这些结果相对准确。

* **引用类型**：
  `typeof value === 'object'` 或 `typeof value === 'function'`，需要进一步区分。

### 3. 借助 `Object.prototype.toString`

通过 `Object.prototype.toString.call(value)`，可以得到类似 `"[object Array]"` 的结果：

```js
const type = Object.prototype.toString.call(value);
// "[object Array]" → Array
// "[object Date]" → Date
// "[object RegExp]" → RegExp
// "[object Object]" → Object
// "[object Map]" → Map
// "[object Set]" → Set
// "[object WeakMap]" → WeakMap
// "[object WeakSet]" → WeakSet
```

这种方式非常稳妥，尤其在跨 iframe/window 的情况下仍然可靠。

### 4. 针对函数与类实例

* 函数：`typeof value === 'function'`
* 类实例：用 `instanceof` 或构造函数判断，例如：

  ```js
  value instanceof Date
  value instanceof HTMLElement
  ```

## 三、综合流程示例

```js
function getType(value) {
  if (value === null) return 'null';
  if (Number.isNaN(value)) return 'NaN';

  const type = typeof value;
  if (type !== 'object') return type; // string, number, boolean, undefined, symbol, bigint, function

  // 对象类型进一步判断
  return Object.prototype.toString.call(value).slice(8, -1);
}
```

测试：

```js
getType(123)           // "number"
getType(NaN)           // "NaN"
getType('hello')       // "string"
getType(null)          // "null"
getType([])            // "Array"
getType({})            // "Object"
getType(new Date())    // "Date"
getType(new Map())     // "Map"
getType(() => {})      // "function"
```

</details>

## 6. 你知道原型链判断数据类型的风险吗？它的风险是什么？ {#question-subjective-e2a81ba5bc40}

### 题目要点

1. `instanceof` 的风险主要是 **跨上下文失效** 和 **原型链可变性**；
2. 在多窗口、多环境下，`instanceof` 判断数组、对象可能出错；
3. 更稳妥的做法是使用 **`Object.prototype.toString.call`**，保证跨上下文的可靠性；
4. 在需要区分类实例时，可以结合 `constructor.name` 或显式标记来补充。

<details>
<summary>参考答案</summary>

原型链方式（即 `instanceof`）在判断数据类型时确实存在一定风险，主要问题出在 **跨执行上下文（cross-context）** 和 **原型链可变性** 上。

## 一、`instanceof` 的原理

`instanceof` 的底层逻辑是：

```text
A instanceof B → 沿着 A 的原型链查找，看是否能找到 B.prototype
```

这意味着它依赖于 **构造函数的 prototype 属性**。

## 二、风险点

### 1. **跨 iframe / 跨 window 场景失效**

假设在主窗口和 iframe 中各自定义了一个 `Array`：

```js
const arr = iframeWindow.Array();
console.log(arr instanceof Array); // false
```

虽然 `arr` 本质上是一个数组，但因为它的 `__proto__` 指向的是 `iframeWindow.Array.prototype`，和主页面的 `Array.prototype` 并不相同，所以判断失败。

这种情况在涉及 **多窗口应用、插件、沙箱环境** 时很容易出现。

### 2. **原型链可被修改**

原型链在运行时是可变的：

```js
function A() {}
const a = new A();

// 修改 A 的 prototype
A.prototype = {};

console.log(a instanceof A); // false
```

修改构造函数的 `prototype` 或对象的 `__proto__`，都可能影响 `instanceof` 的判断结果，导致数据类型判断失真。

### 3. **继承关系导致的混淆**

在继承场景下，子类实例 `instanceof` 父类也成立：

```js
class Parent {}
class Child extends Parent {}
const c = new Child();

console.log(c instanceof Parent); // true
```

如果只是想判断变量是否为 `Child` 实例，而不是任何继承链上的类型，`instanceof` 的结果可能过于宽泛。

## 三、与 `Object.prototype.toString` 对比

* `instanceof` → 依赖原型链，可能因跨上下文或原型修改而不可靠；
* `Object.prototype.toString.call(value)` → 返回 `"[object Type]"`，不依赖原型链，更加稳妥，尤其是基础内建类型。

</details>

## 7. Http 缓存策略，有什么区别，分别解决了什么问题 {#question-b97ddbf9-57fd-493f-888d-1ffb7981f10a}

> 题库原题：[Http 缓存策略，有什么区别，分别解决了什么问题](https://fe.ecool.fun/topic/b97ddbf9-57fd-493f-888d-1ffb7981f10a)

<p></p>

### 题目要点

<p>浏览器缓存策略涉及强缓存和协商缓存两个部分。强缓存优先于协商缓存，其中强缓存通过<code>Cache-Control</code>（HTTP 1.1）和<code>Expires</code>（HTTP 1.0）控制，协商缓存则通过<code>Last-Modified</code>/<code>If-Modified-Since</code>（HTTP 1.0）和<code>ETag</code>/<code>If-None-Match</code>（HTTP 1.1）进行验证。</p><p></p><p>强缓存（<code>Cache-Control</code>和<code>Expires</code>）是指服务器告诉浏览器资源的缓存时间，在有效期内浏览器直接使用缓存。<code>Cache-Control</code>是一个相对时间，<code>Expires</code>是一个绝对时间。<code>Cache-Control</code>的优先级高于<code>Expires</code>。</p><p></p><p>协商缓存则是在强缓存失效时，浏览器向服务器发送请求，服务器根据<code>Last-Modified</code>和<code>ETag</code>判断资源是否更新。如果未更新，服务器返回304状态码，浏览器使用缓存；如果已更新，服务器返回新的资源。</p><p></p><p><code>Last-Modified</code>/<code>If-Modified-Since</code>通过文件的最后修改时间来判断资源是否更新，而<code>ETag</code>/<code>If-None-Match</code>通过资源的唯一标识来判断。<code>ETag</code>的优先级高于<code>Last-Modified</code>。</p><p></p><p>这些缓存策略的优点包括提高加载速度、减少服务器负载、节省带宽等，但也存在一些缺点，如<code>Expires</code>的时间问题、<code>Last-Modified</code>的精准性问题、以及<code>ETag</code>的性能损耗和分布式服务器存储问题。</p>

<details>
<summary>参考答案</summary>

<p><strong>1）浏览器缓存策略</strong></p><p>浏览器每次发起请求时，先在本地缓存中查找结果以及缓存标识，根据缓存标识来判断是否使用本地缓存。如果缓存有效，则使<br/>用本地缓存；否则，则向服务器发起请求并携带缓存标识。根据是否需向服务器发起HTTP请求，将缓存过程划分为两个部分：<br/>强制缓存和协商缓存，强缓优先于协商缓存。</p><ul><li>强缓存，服务器通知浏览器一个缓存时间，在缓存时间内，下次请求，直接用缓存，不在时间内，执行比较缓存策略。</li><li>协商缓存，让客户端与服务器之间能实现缓存文件是否更新的验证、提升缓存的复用率，将缓存信息中的Etag和Last-Modified<br/>通过请求发送给服务器，由服务器校验，返回304状态码时，浏览器直接使用缓存。</li></ul><p>HTTP缓存都是从第二次请求开始的：</p><ul><li>第一次请求资源时，服务器返回资源，并在response header中回传资源的缓存策略；</li><li>第二次请求时，浏览器判断这些请求参数，击中强缓存就直接200，否则就把请求参数加到request header头中传给服务器，看是否击中协商缓存，击中则返回304，否则服务器会返回新的资源。这是缓存运作的一个整体流程图：</li></ul><p></p><p></p><div class="media-wrap image-wrap"><img class="media-wrap image-wrap" src="https://camo.githubusercontent.com/df822872ee2a8aef44c665f8fffd13c4cc4eb637bd8706ce4899e8eb72d2a431/687474703a2f2f696d672d7374617469632e796964656e6778756574616e672e636f6d2f77786170702f69737375652d696d672f7169642d382e706e67"/></div><p></p><p></p><p><strong>2）强缓存</strong></p><ul><li>强缓存命中则直接读取浏览器本地的资源，在network中显示的是from memory或者from disk</li><li>控制强制缓存的字段有：Cache-Control（http1.1）和Expires（http1.0）</li><li>Cache-control是一个相对时间，用以表达自上次请求正确的资源之后的多少秒的时间段内缓存有效。</li><li>Expires是一个绝对时间。用以表达在这个时间点之前发起请求可以直接从浏览器中读取数据，而无需发起请求</li><li>Cache-Control的优先级比Expires的优先级高。前者的出现是为了解决Expires在浏览器时间被手动更改导致缓存判断错误的问题。<br/>如果同时存在则使用Cache-control。</li></ul><p><strong>3）强缓存-expires</strong></p><ul><li>该字段是服务器响应消息头字段，告诉浏览器在过期时间之前可以直接从浏览器缓存中存取数据。</li><li>Expires 是 HTTP 1.0 的字段，表示缓存到期时间，是一个绝对的时间 (当前时间+缓存时间)。在响应消息头中，设置这个字段之后，就可以告诉浏览器，在未过期之前不需要再次请求。</li><li>由于是绝对时间，用户可能会将客户端本地的时间进行修改，而导致浏览器判断缓存失效，重新请求该资源。此外，即使不考虑修改，时差或者误差等因素也可能造成客户端与服务端的时间不一致，致使缓存失效。</li><li>优势特点<br/></li><ul><li>1、HTTP 1.0 产物，可以在HTTP 1.0和1.1中使用，简单易用。</li><li>2、以时刻标识失效时间。</li></ul></ul><p></p><ul><li>劣势问题<br/></li><ul><li>1、时间是由服务器发送的(UTC)，如果服务器时间和客户端时间存在不一致，可能会出现问题。</li><li>2、存在版本问题，到期之前的修改客户端是不可知的。</li></ul></ul><p></p><p><strong>4）强缓存-cache-control</strong></p><ul><li>已知Expires的缺点之后，在HTTP/1.1中，增加了一个字段Cache-control，该字段表示资源缓存的最大有效时间，在该时间内，客户端不需要向服务器发送请求。</li><li>这两者的区别就是前者是绝对时间，而后者是相对时间。下面列举一些 <code>Cache-control</code> 字段常用的值：(完整的列表可以查看MDN)<br/></li><ul><li><code>max-age</code>：即最大有效时间。</li><li><code>must-revalidate</code>：如果超过了 <code>max-age</code> 的时间，浏览器必须向服务器发送请求，验证资源是否还有效。</li><li><code>no-cache</code>：不使用强缓存，需要与服务器验证缓存是否新鲜。</li><li><code>no-store</code>: 真正意义上的“不要缓存”。所有内容都不走缓存，包括强制和对比。</li><li><code>public</code>：所有的内容都可以被缓存 (包括客户端和代理服务器， 如 CDN)</li><li><code>private</code>：所有的内容只有客户端才可以缓存，代理服务器不能缓存。默认值。</li></ul></ul><p></p><ul><li><strong>Cache-control 的优先级高于 Expires</strong>，为了兼容 HTTP/1.0 和 HTTP/1.1，实际项目中两个字段都可以设置。</li><li>该字段可以在请求头或者响应头设置，可组合使用多种指令：<br/></li><ul><li><strong>可缓存性</strong>：</li><ul><li>public：浏览器和缓存服务器都可以缓存页面信息</li><li>private：default，代理服务器不可缓存，只能被单个用户缓存</li><li>no-cache：浏览器器和服务器都不应该缓存页面信息，但仍可缓存，只是在缓存前需要向服务器确认资源是否被更改。可配合private，<br/>过期时间设置为过去时间。</li><li>only-if-cache：客户端只接受已缓存的响应</li></ul></ul></ul><p></p><ul><ul><li><strong>到期</strong></li><ul><li>max-age=：缓存存储的最大周期，超过这个周期被认为过期。</li><li>s-maxage=：设置共享缓存，比如can。会覆盖max-age和expires。</li><li>max-stale[=]：客户端愿意接收一个已经过期的资源</li><li>min-fresh=：客户端希望在指定的时间内获取最新的响应</li><li>stale-while-revalidate=：客户端愿意接收陈旧的响应，并且在后台一部检查新的响应。时间代表客户端愿意接收陈旧响应<br/>的时间长度。</li><li>stale-if-error=：如新的检测失败，客户端则愿意接收陈旧的响应，时间代表等待时间。</li></ul></ul></ul><p></p><ul><ul><li><strong>重新验证和重新加载</strong></li><ul><li>must-revalidate：如页面过期，则去服务器进行获取。</li><li>proxy-revalidate：用于共享缓存。</li><li>immutable：响应正文不随时间改变。</li></ul></ul></ul><p></p><ul><ul><li><strong>其他</strong></li><ul><li>no-store：绝对禁止缓存</li><li>no-transform：不得对资源进行转换和转变。例如，不得对图像格式进行转换。</li></ul></ul></ul><p></p><p></p><ul><li>优势特点<br/></li><ul><li>1、HTTP 1.1 产物，以时间间隔标识失效时间，解决了Expires服务器和客户端相对时间的问题。</li><li>2、比Expires多了很多选项设置。</li></ul></ul><p></p><ul><li>劣势问题<br/></li><ul><li>1、存在版本问题，到期之前的修改客户端是不可知的。</li></ul></ul><p></p><p><strong>5）协商缓存</strong></p><ul><li>协商缓存的状态码由服务器决策返回200或者304</li><li>当浏览器的强缓存失效的时候或者请求头中设置了不走强缓存，并且在请求头中设置了If-Modified-Since 或者 If-None-Match 的时候，会将这两个属性值到服务端去验证是否命中协商缓存，如果命中了协商缓存，会返回 304 状态，加载浏览器缓存，并且响应头会设置 Last-Modified 或者 ETag 属性。</li><li>对比缓存在请求数上和没有缓存是一致的，但如果是 304 的话，返回的仅仅是一个状态码而已，并没有实际的文件内容，因此 在响应体体积上的节省是它的优化点。</li><li>协商缓存有 2 组字段(不是两个)，控制协商缓存的字段有：Last-Modified/If-Modified-since（http1.0）和Etag/If-None-match（http1.1）</li><li>Last-Modified/If-Modified-since表示的是服务器的资源最后一次修改的时间；Etag/If-None-match表示的是服务器资源的唯一标<br/>识，只要资源变化，Etag就会重新生成。</li><li>Etag/If-None-match的优先级比Last-Modified/If-Modified-since高。</li></ul><p><strong>6）协商缓存-协商缓存-Last-Modified/If-Modified-since</strong></p><ul><li>1.服务器通过 <code>Last-Modified</code> 字段告知客户端，资源最后一次被修改的时间，例如 <code>Last-Modified: Mon, 10 Nov 2018 09:10:11 GMT</code></li><li>2.浏览器将这个值和内容一起记录在缓存数据库中。</li><li>3.下一次请求相同资源时时，浏览器从自己的缓存中找出“不确定是否过期的”缓存。因此在请求头中将上次的 <code>Last-Modified</code> 的值写入到请求头的 <code>If-Modified-Since</code> 字段</li><li>4.服务器会将 <code>If-Modified-Since</code> 的值与 <code>Last-Modified</code> 字段进行对比。如果相等，则表示未修改，响应 304；反之，则表示修改了，响应 200 状态码，并返回数据。</li><li>优势特点</li><ul><li>1、不存在版本问题，每次请求都会去服务器进行校验。服务器对比最后修改时间如果相同则返回304，不同返回200以及资源内容。</li></ul></ul><p></p><ul><li>劣势问题</li><ul><li>2、只要资源修改，无论内容是否发生实质性的变化，都会将该资源返回客户端。例如周期性重写，这种情况下该资源包含的数据实际上一样的。</li><li>3、以时刻作为标识，无法识别一秒内进行多次修改的情况。 如果资源更新的速度是秒以下单位，那么该缓存是不能被使用的，因为它的时间单位最低是秒。</li><li>4、某些服务器不能精确的得到文件的最后修改时间。</li><li>5、如果文件是通过服务器动态生成的，那么该方法的更新时间永远是生成的时间，尽管文件可能没有变化，所以起不到缓存的作用。</li></ul></ul><p></p><p><strong>7）协商缓存-Etag/If-None-match</strong></p><ul><li>为了解决上述问题，出现了一组新的字段 <code>Etag</code> 和 <code>If-None-Match</code></li><li><code>Etag</code> 存储的是文件的特殊标识(一般都是 hash 生成的)，服务器存储着文件的 <code>Etag</code> 字段。之后的流程和 <code>Last-Modified</code> 一致，只是 <code>Last-Modified</code> 字段和它所表示的更新时间改变成了 <code>Etag</code> 字段和它所表示的文件 hash，把 <code>If-Modified-Since</code> 变成了 <code>If-None-Match</code>。服务器同样进行比较，命中返回 304, 不命中返回新资源和 200。</li><li>浏览器在发起请求时，服务器返回在Response header中返回请求资源的唯一标识。在下一次请求时，会将上一次返回的Etag值赋值给If-No-Matched并添加在Request Header中。服务器将浏览器传来的if-no-matched跟自己的本地的资源的ETag做对比，如果匹配，则返回304通知浏览器读取本地缓存，否则返回200和更新后的资源。</li><li><strong>Etag 的优先级高于 Last-Modified</strong>。</li><li>优势特点</li><ul><li>1、可以更加精确的判断资源是否被修改，可以识别一秒内多次修改的情况。</li><li>2、不存在版本问题，每次请求都回去服务器进行校验。</li></ul></ul><p></p><ul><li>劣势问题</li><ul><li>1、计算ETag值需要性能损耗。</li><li>2、分布式服务器存储的情况下，计算ETag的算法如果不一样，会导致浏览器从一台服务器上获得页面内容后到另外一台服务器上进行验证时现ETag不匹配的情况。</li></ul></ul><p></p>

</details>

## 8. 浏览器的 ETag 是如何计算的？ {#question-subjective-c6461a0a7fa8}

### 题目要点

* ETag 是 **服务器生成的资源标识**，用于判断资源是否修改；
* 常见生成方式：**内容哈希**、**修改时间+长度**，以及 **弱 ETag**；
* 浏览器通过 `If-None-Match` 使用 ETag 来实现条件请求，减少带宽浪费；
* 与 `Last-Modified` 联合使用，可以进一步优化缓存策略。

<details>
<summary>参考答案</summary>

浏览器中的 **ETag（实体标签）** 是 HTTP 协议用于缓存控制的一种机制，用于标识服务器上资源的特定版本。它本质上是服务器生成的一个字符串，表示资源内容的“指纹”。客户端在下一次请求同一资源时，会带上 `If-None-Match` 头，服务器用 ETag 判断资源是否发生变化，从而决定返回 **304 Not Modified** 还是新内容。

---

## 一、ETag 的计算方式

ETag 并不是浏览器计算的，而是 **由服务器生成**。常见生成方式有：

### 1. **内容哈希（Content Hash）**

* 对资源的内容（body）做哈希运算，如 MD5、SHA-1、CRC32 等。
* 示例：

  ```text
  ETag: "e4d909c290d0fb1ca068ffaddf22cbd0"  // MD5 值
  ```
* 优点：精确检测资源内容变化，保证只在资源真的变化时返回新内容。

---

### 2. **修改时间 + 内容长度**

* 对资源的最后修改时间（Last-Modified）和内容长度做组合生成一个字符串或哈希：

  ```text
  ETag: "1617891234-1024"  // timestamp-size
  ```
* 优点：生成简单，性能较好；
* 缺点：精确度略低，文件微调可能未检测到。

---

### 3. **弱 ETag（Weak ETag）**

* 以 `W/` 前缀表示：

  ```text
  ETag: W/"123456789"
  ```
* 表示资源的内容 **逻辑上相同**，但可能字节上略有差异（比如时间戳不同）。
* 浏览器在比较弱 ETag 时，可以宽松匹配，只要逻辑内容未变就可认为未修改。

---

## 二、浏览器的缓存流程（使用 ETag）

1. 第一次请求资源：

   * 浏览器没有缓存，直接请求服务器；
   * 服务器返回资源，同时返回 `ETag: "xxx"`；
   * 浏览器缓存资源内容 + 对应 ETag。

2. 第二次请求同一资源：

   * 浏览器在请求头中带上：

     ```http
     If-None-Match: "xxx"
     ```
   * 服务器比较 ETag：

     * **未改变** → 返回 304 Not Modified → 浏览器直接使用缓存；
     * **已改变** → 返回 200 + 新资源 + 新 ETag。

</details>

## 9. Last-Modified 方式的缺点是什么？ {#question-subjective-31e6bc385e2e}

### 题目要点

`Last-Modified` 优点是实现简单、开销低，但缺点是：

1. **精度有限**，秒级无法捕捉细微变化；
2. **依赖服务器时间**，容易出现不一致；
3. **无法覆盖逻辑变化**，仅检测文件修改；
4. **多服务器环境存在同步问题**。

因此，在实际生产中，常常 **同时使用 ETag 和 Last-Modified**，既保证精确，又兼顾性能。

<details>
<summary>参考答案</summary>

`Last-Modified` 是 HTTP 协议中一种常用的缓存验证机制，它记录资源的最后修改时间。浏览器通过 `If-Modified-Since` 请求头进行条件请求。虽然实现简单，但存在一些固有缺点：

---

## 一、缺点分析

### 1. **时间精度有限**

* `Last-Modified` 通常以秒为单位记录时间（精确到秒）。
* 如果资源在同一秒内被修改多次，服务器可能无法检测到微小变化，导致浏览器错误地使用缓存。

---

### 2. **依赖服务器时间**

* 如果服务器时间不准确或存在时钟漂移，可能导致缓存失效或错误使用缓存。
* 例如，服务器时间比客户端慢，浏览器可能会认为资源没有更新，而实际内容已经改变。

---

### 3. **无法覆盖内容未改但逻辑变化的情况**

* 文件内容可能未改变，但逻辑或元数据变化时，`Last-Modified` 无法反映这种变化。
* 例如动态生成的资源（带时间戳或统计信息）可能变化，但 `Last-Modified` 没有更新。

---

### 4. **并发修改导致冲突**

* 对于 CDN 或多服务器环境，如果服务器之间的修改时间不同步，客户端可能获取错误的缓存判断结果。

---

## 二、与 ETag 对比

| 特性   | Last-Modified | ETag           |
| ---- | ------------- | -------------- |
| 精度   | 秒级时间戳         | 内容哈希或自定义，精确到字节 |
| 变化检测 | 仅时间变化         | 内容变化           |
| 跨服务器 | 可能不一致         | 可以保证唯一标识       |
| 性能   | 简单            | 需要额外计算（如哈希）    |

</details>

## 10. 你能讲一下浏览器的渲染流程吗？ {#question-subjective-431927a579a2}

### 题目要点

浏览器渲染流程可以概括为：

```
HTML -> DOM
CSS -> CSSOM
DOM + CSSOM -> Render Tree
Render Tree -> Layout
Layout -> Paint
Paint -> Composite -> 显示页面
```

**重点理解**：

1. **阻塞因素**：JS、CSS 会阻塞渲染；
2. **回流 vs 重绘**：回流成本高，重绘成本次之；
3. **合成层与 GPU 加速**：合理使用 `transform`/`opacity` 可提升动画流畅度；
4. **优化策略**：减少 DOM 操作、压缩资源、异步加载阻塞资源。

<details>
<summary>参考答案</summary>

浏览器的渲染流程是前端性能优化和理解页面呈现的核心基础。可以把整个流程理解为 **从接收 HTML 到最终显示页面** 的一系列步骤，涉及 **HTML 解析、CSS 解析、布局计算、绘制、合成** 等环节。下面详细讲解。

---

## 一、浏览器渲染流程概览

1. **解析 HTML → 构建 DOM 树**

   * 浏览器接收到 HTML 文档后，解析标签，生成 **DOM（Document Object Model）树**。
   * 遇到 `&lt;script&gt;` 标签时，默认会 **阻塞 HTML 解析**，除非使用 `async` 或 `defer`。

2. **解析 CSS → 构建 CSSOM 树**

   * 浏览器解析所有样式表（内联、内部 `&lt;style&gt;`、外部 `&lt;link&gt;`），生成 **CSSOM（CSS Object Model）树**。
   * 同步阻塞：外部 CSS 会阻塞渲染，保证页面样式正确。

3. **构建渲染树（Render Tree）**

   * 将 DOM 树和 CSSOM 树结合，生成 **渲染树**（只包含可见节点 + 样式信息）。
   * 注意：`display: none` 的节点不会出现在渲染树中。

4. **布局（Layout / Reflow）**

   * 根据渲染树计算每个节点的 **位置和大小**。
   * 输出每个元素在视口中的坐标（x、y、宽度、高度）。
   * 这是一个**计算量较大**的步骤，改变尺寸或位置会触发布局回流。

5. **绘制（Painting / Repaint）**

   * 将每个节点绘制到图层上，包括 **颜色、字体、背景、边框** 等。
   * 通常按图层逐个绘制。

6. **合成（Compositing）**

   * 将多个绘制好的图层组合成最终的屏幕显示。
   * GPU 通常参与加速合成，实现硬件渲染优化。

---

## 二、关键优化点与注意事项

1. **DOM 和 CSSOM 阻塞**

   * `&lt;script&gt;` 默认阻塞 HTML 解析 → 使用 `async`/`defer` 或放在底部可以优化首屏渲染。
   * 外部 CSS 阻塞渲染 → 尽量减少 CSS 文件数量、压缩、关键 CSS 内联。

2. **布局与回流（Reflow）**

   * 改变 DOM 尺寸、位置或字体可能触发布局计算。
   * 批量修改 DOM、使用 `class` 切换样式比逐条修改性能更好。

3. **绘制与重绘（Repaint）**

   * 改变颜色、背景、可见性会触发重绘。
   * 避免频繁修改样式，尽量合并操作。

4. **合成优化**

   * 通过 `transform`、`opacity` 等属性触发 GPU 合成层，减少主线程回流开销。

---

## 三、现代浏览器渲染特点

* **分层渲染（Layered Rendering）**：动画、 fixed/absolute 元素、GPU 加速层会生成独立图层，提高性能。
* **浏览器流水线渲染**：解析 HTML、CSS、JS 与绘制是流水线执行的，并非严格顺序。
* **关键渲染路径优化**：前端性能优化核心在于减少**关键渲染路径长度**，尽量减少阻塞资源和回流重绘。

</details>

## 11. 在这个渲染流程中，浏览器会跑两个钩子函数，它们的触发时机是什么？ {#question-subjective-0c777887cfac}

### 题目要点

1. **rAF**：同步帧率，执行关键渲染前的 DOM 更新和动画。
2. **rIC**：利用空闲时间执行非关键任务，避免阻塞渲染和影响帧率。
3. 这两个钩子是浏览器渲染流程中为 **异步任务调度**提供的接口，帮助开发者优化性能和用户体验。

<details>
<summary>参考答案</summary>

在浏览器的渲染流程中，前端常用的两个钩子函数是 **`requestAnimationFrame`** 和 **`requestIdleCallback`**，它们都是浏览器提供的异步调度机制，但触发时机不同，服务于不同目的。

---

## 一、`requestAnimationFrame`（rAF）

### 触发时机

* rAF 的回调会在 **浏览器下一次重绘之前**执行。
* 浏览器通常每秒刷新 60 次（即每 16.7ms），rAF 会在每帧渲染前被调用，确保动画和 DOM 更新与浏览器刷新同步。

### 使用场景

* 动画效果（平滑过渡）
* DOM 或样式的可视更新

### 特点

1. 回调在 **布局和绘制前执行**（在渲染树准备好后，但还没绘制到屏幕）。
2. 回调由浏览器调度，与页面的 **刷新率同步**，避免过多 DOM 操作导致掉帧。

示例：

```js
function animate() {
  // 更新元素位置
  box.style.transform = `translateX(${x}px)`;
  x += 5;

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

---

## 二、`requestIdleCallback`（rIC）

### 触发时机

* rIC 的回调会在 **浏览器空闲时执行**，即浏览器完成高优先级任务（如 DOM 渲染、事件处理、布局、绘制）后，系统有空闲时间时调用。

### 使用场景

* 非关键任务、后台任务
* 大量数据处理、日志上报、资源预加载

### 特点

1. 不保证立即执行，依赖浏览器空闲时间；
2. 可以指定 **超时**，确保任务最终执行：

```js
requestIdleCallback(myTask, { timeout: 2000 });
```

---

## 三、对比总结

| 特性   | requestAnimationFrame | requestIdleCallback |
| ---- | --------------------- | ------------------- |
| 执行时机 | 浏览器下一次重绘前             | 浏览器空闲时              |
| 典型用途 | 动画、视觉更新               | 数据处理、预加载、日志上报       |
| 优先级  | 高（跟随帧率）               | 低（不阻塞渲染）            |
| 保证顺序 | 每帧一次                  | 不保证，依赖空闲时间          |

</details>

## 12. React Fiber是什么？ {#question-7830d575-2143-47c3-b938-2f9448a7465e}

> 题库原题：[React Fiber是什么？](https://fe.ecool.fun/topic/7830d575-2143-47c3-b938-2f9448a7465e)

### 题目要点

React Fiber 是 React 的一种新架构，旨在解决早期 React 版本中处理更新和渲染的性能瓶颈。它在 React 16 中引入，带来了许多改进和新特性。以下是 React Fiber 的简要介绍：

### **React Fiber 的主要目标和特点**

1. **可中断的渲染**：
   - **优先级管理**：Fiber 允许 React 在渲染过程中根据任务的优先级进行中断和恢复。这意味着高优先级的任务（如用户输入）可以打断低优先级的任务（如后台数据加载），提高了用户体验。

2. **增量更新**：
   - **分片渲染**：Fiber 使 React 可以将渲染任务拆分成多个小的片段（或单元），逐步完成渲染。这有助于防止长时间的渲染过程阻塞主线程，提高了页面的响应性。

3. **灵活的调度**：
   - **调度策略**：Fiber 引入了调度机制，允许 React 更智能地安排和优先处理不同的渲染任务。通过优先级队列，React 可以优化任务调度，以响应用户操作和其他事件。

4. **错误处理**：
   - **错误边界**：Fiber 使得实现错误边界成为可能。错误边界允许开发者捕获和处理组件树中的 JavaScript 错误，并防止整个应用崩溃。

5. **复用现有的 DOM 元素**：
   - **元素复用**：Fiber 改进了对 DOM 元素的复用策略，使得 React 可以更高效地更新现有的 DOM 元素，而不是重新创建和销毁它们。

### **Fiber 的内部结构**

- **Fiber 节点**：每个组件的渲染任务被表示为一个 Fiber 节点，包含有关组件的状态、属性和子节点的信息。Fiber 节点组成了一个 Fiber 树，这棵树描述了整个应用的渲染结构。

- **调度和优先级**：Fiber 通过调度器来管理任务的优先级和执行顺序，确保重要任务（如用户交互）优先处理。

### **总结**

React Fiber 是 React 的一种新的渲染引擎，带来了可中断渲染、增量更新、灵活调度和更好的错误处理等性能和体验优化。它通过改进的任务调度和优先级管理，使得 React 应用能够在处理复杂界面和大量数据时保持更高的性能和响应性。

<details>
<summary>参考答案</summary>

## Fiber 出现的背景

首先要知道的是，JavaScript 引擎和页面渲染引擎两个线程是互斥的，当其中一个线程执行时，另一个线程只能挂起等待。

在这样的机制下，如果 JavaScript 线程长时间地占用了主线程，那么渲染层面的更新就不得不长时间地等待，界面长时间不更新，会导致页面响应度变差，用户可能会感觉到卡顿。

而这正是 React 15 的 Stack Reconciler 所面临的问题，即是 JavaScript 对主线程的超时占用问题。Stack Reconciler 是一个同步的递归过程，使用的是 JavaScript 引擎自身的函数调用栈，它会一直执行到栈空为止，所以当 React 在渲染组件时，从开始到渲染完成整个过程是一气呵成的。如果渲染的组件比较庞大，js 执行会占据主线程较长时间，会导致页面响应度变差。

而且所有的任务都是按照先后顺序，没有区分优先级，这样就会导致优先级比较高的任务无法被优先执行。

## Fiber 是什么

Fiber 的中文翻译叫纤程，与进程、线程同为程序执行过程，Fiber 就是比线程还要纤细的一个过程。纤程意在对渲染过程实现进行更加精细的控制。

从架构角度来看，Fiber 是对 React 核心算法（即调和过程）的重写。

从编码角度来看，Fiber 是 React 内部所定义的一种数据结构，它是 Fiber 树结构的节点单位，也就是 React 16 新架构下的"虚拟 DOM"。

一个 fiber 就是一个 JavaScript 对象，Fiber 的数据结构如下：

```
type Fiber = {
  // 用于标记fiber的WorkTag类型，主要表示当前fiber代表的组件类型如FunctionComponent、ClassComponent等
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，调用`createElement`的第一个参数
  elementType: any,
  // The resolved function/class/ associated with this fiber.
  // 表示当前代表的节点类型
  type: any,
  // 表示当前FiberNode对应的element组件实例
  stateNode: any,

  // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
  return: Fiber | null,
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构，兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,

  ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

  // 当前处理过程中的组件props对象
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state
  memoizedState: any,

  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,

  mode: TypeOfMode,

  // Effect
  // 用来记录Side Effect
  effectTag: SideEffectTag,

  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,

  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,

  // 代表任务在未来的哪个时间点应该被完成，之后版本改名为 lanes
  expirationTime: ExpirationTime,

  // 快速确定子树中是否有不在等待的变化
  childExpirationTime: ExpirationTime,

  // fiber的版本池，即记录fiber更新过程，便于恢复
  alternate: Fiber | null,
}
```

## Fiber 如何解决问题的

Fiber 把一个渲染任务分解为多个渲染任务，而不是一次性完成，把每一个分割得很细的任务视作一个"执行单元"，React 就会检查现在还剩多少时间，如果没有时间就将控制权让出去，故任务会被分散到多个帧里面，中间可以返回至主进程控制执行其他任务，最终实现更流畅的用户体验。

即是实现了"增量渲染"，实现了可中断与恢复，恢复后也可以复用之前的中间状态，并给不同的任务赋予不同的优先级，其中每个任务更新单元为 React Element 对应的 Fiber 节点。

## Fiber 实现原理

实现的方式是requestIdleCallback这一 API，但 React 团队 polyfill 了这个 API，使其对比原生的浏览器兼容性更好且拓展了特性。

> window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间 timeout，则有可能为了在超时前执行函数而打乱执行顺序。

requestIdleCallback回调的执行的前提条件是当前浏览器处于空闲状态。

即requestIdleCallback的作用是在浏览器一帧的剩余空闲时间内执行优先度相对较低的任务。首先 React 中任务切割为多个步骤，分批完成。在完成一部分任务之后，将控制权交回给浏览器，让浏览器有时间再进行页面的渲染。等浏览器忙完之后有剩余时间，再继续之前 React 未完成的任务，是一种合作式调度。

简而言之，由浏览器给我们分配执行时间片，我们要按照约定在这个时间内执行完毕，并将控制权还给浏览器。

React 16 的Reconciler基于 Fiber 节点实现，被称为 Fiber Reconciler。

作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件等等）、对应的 DOM 节点等信息。

作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作。

每个 Fiber 节点有个对应的 React element，多个 Fiber 节点是如何连接形成树呢？靠如下三个属性：

```js
// 指向父级Fiber节点
this.return = null
// 指向子Fiber节点
this.child = null
// 指向右边第一个兄弟Fiber节点
this.sibling = null
```

</details>

## 13. 什么是跨域？ {#question-3538f4eb-5b78-4ffc-aeae-ccfdd45976a4}

> 题库原题：[什么是跨域？](https://fe.ecool.fun/topic/3538f4eb-5b78-4ffc-aeae-ccfdd45976a4)

### 题目要点

**跨域**是指从一个网站（源）去请求另一个网站（目标）的资源时，由于浏览器的同源策略限制，这种请求可能会被阻止。同源策略要求协议、域名、端口号都相同。

为了解决跨域问题，有几种常用方法：

1. **CORS**：服务器设置响应头，允许特定源的跨域请求。
2. **JSONP**：利用`&lt;script&gt;`标签的跨域能力，但只支持GET请求且存在安全风险。
3. **代理服务器**：通过代理服务器转发请求和响应，客户端与代理服务器同源。
4. **postMessage**：HTML5 API，允许不同源的窗口或iframe之间进行安全通信。

<details>
<summary>参考答案</summary>

**跨域**（Cross-Origin）是指从一个域名的网页去请求另一个域名的资源。在Web开发中，出于安全考虑，同源策略（Same-Origin Policy）限制了文档或脚本如何与来自不同源的“资源”进行交互。这里的“源”指的是协议（如http或https）、域名（如www.example.com）和端口号（如80或443）的组合。如果协议、域名或端口号中的任何一个不同，那么两个资源就被认为是来自不同的源，即跨域。

跨域问题主要出现在前端开发中，尤其是当前端页面需要从不同源的服务器请求数据或服务时。由于浏览器的同源策略，这些跨域请求可能会被阻止，导致请求失败。

为了解决这个问题，有几种常见的跨域资源共享（CORS, Cross-Origin Resource Sharing）策略：

1. **JSONP**：一种早期的跨域技术，通过在客户端动态创建`&lt;script&gt;`标签并设置其`src`属性为跨域URL（该URL会返回一段JavaScript代码，该代码中包含需要的数据），然后利用`&lt;script&gt;`标签的跨域能力来执行返回的JavaScript代码，从而获取数据。但JSONP只支持GET请求，并且存在安全风险。

2. **CORS**：现代浏览器支持的跨域资源共享标准。服务器通过设置响应头（如`Access-Control-Allow-Origin`）来明确告知客户端哪些域的请求是被允许的。CORS支持更复杂的HTTP请求，如POST、PUT等，并且安全性更高。

3. **代理服务器**：在客户端和服务器之间设置一个代理服务器，客户端的请求先发送到代理服务器，代理服务器再将请求转发给目标服务器，并将响应返回给客户端。这样，从客户端的角度看，它始终在与同源的代理服务器进行交互，从而避免了跨域问题。

4. **Nginx反向代理**：一种常见的代理服务器解决方案，通过配置Nginx来实现对跨域请求的转发和响应。

5. **document.domain + iframe**：对于主域相同但子域不同的跨域问题，可以通过设置`document.domain`来使两个页面共享同一个域，然后通过iframe进行交互。但这种方法有一定的局限性，并且存在安全风险。

6. **postMessage**：HTML5引入的一种跨文档通信API，允许来自不同源的页面进行安全通信。通过监听`message`事件并检查事件的`origin`属性，可以确保消息来自预期的源。

</details>

## 14. 前端怎么实现跨域请求？ {#question-56e56a05-99c7-4701-ae72-e06d2c6a4d42}

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

## 15. JSONP 是如何实现跨域的? {#question-20f1385d-4442-43c5-bb20-2a53a9bfc6c6}

> 题库原题：[JSONP 是如何实现跨域的?](https://fe.ecool.fun/topic/20f1385d-4442-43c5-bb20-2a53a9bfc6c6)

### 题目要点

JSONP 通过利用 `&lt;script&gt;` 标签的跨域特性和回调函数的方式实现跨域数据请求。尽管它在某些场景下有效，但由于安全和功能限制，现代开发中更多地推荐使用 CORS 作为跨域解决方案。

<details>
<summary>参考答案</summary>

## JSONP

JSONP 的实现原理是通过添加一个 script 标签，指定 src 属性为跨域请求的 URL，而这个 URL 返回的不是 JSON 数据，而是一段可执行的 JavaScript 代码，这段代码会调用一个指定的函数，并且将 JSON 数据作为参数传入函数中。

例如，假设我们从 `http://example.com` 域名下请求数据，我们可以通过在 `http://example.com` 中添加如下代码实现 JSONP 请求：

```js
function handleData(data) {
  // 处理获取到的数据
}

const script = document.createElement('script');
script.src = 'http://example.org/api/data?callback=handleData';
document.head.appendChild(script);
```

其中，我们指定了一个名为 `handleData` 的回调函数，并将这个函数名作为参数传递给了跨域请求的 URL 中的 callback 参数。服务器端返回的数据将会被包装在这个回调函数中，例如：
```js
handleData({"name": "John", "age": 30});
```

在这个例子中，我们可以在 handleData 函数中处理获取到的数据。需要注意的是，在使用 JSONP 时，**需要保证服务器端返回的数据是一个可执行的 JavaScript 代码，并且必须使用指定的回调函数名来包装数据，否则无法正确处理数据。**

### 如何获取 jsonp 的相应参数

获取 JSONP 响应结果的方法有两种，**一种是通过回调函数参数获取**，**另一种是通过 script 标签加载完成后解析全局变量获取**。

假设服务器返回以下 JSONP 响应：

```js
callback({"name": "Alice", "age": 20});
```

其中 callback 是客户端定义的回调函数名，用于指定返回数据的处理方式。

我们可以使用以下两种方式获取响应结果：

**1. 通过回调函数参数获取**
在客户端定义一个全局函数作为回调函数，服务器返回的数据会作为回调函数的参数传入，这个参数可以在回调函数中处理。
```js
function handleResponse(data) {
  console.log(data.name); // Alice
  console.log(data.age); // 20
}

// 创建 script 标签
const script = document.createElement('script');
script.src = 'http://example.com/api?callback=handleResponse';

// 插入到文档中开始加载数据
document.body.appendChild(script);
```

**2. 通过全局变量获取**
在客户端定义一个全局函数作为回调函数，服务器返回的数据会作为一个全局变量赋值给该函数所在的对象，我们可以在 script 标签加载完成后解析全局变量获取响应结果。
```js
function handleResponse() {
  console.log(myData.name); // Alice
  console.log(myData.age); // 20
}

// 创建 script 标签
const script = document.createElement('script');
script.src = 'http://example.com/api?callback=handleResponse';

// 插入到文档中开始加载数据
document.body.appendChild(script);

// script 标签加载完成后解析全局变量
window.myData = {};
script.onload = () => {
  delete window.myData; // 删除全局变量
};
```

注意，使用 JSONP 时要注意安全问题，应该对返回的数据进行验证，避免接收到恶意代码。此外，JSONP **只能发送 GET 请求**，无法发送 POST 请求，**也无法使用 HTTP 请求头和请求体传递数据**。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-69/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-69/round-115/index.md" >}}) →
