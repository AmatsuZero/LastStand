+++
title = "布局技巧"
date = '2024-10-10T00:00:00+08:00'
lastmod = '2024-11-10T00:00:00+08:00'
draft = false
weight = 9
tags = ["面试", "前端", "CSS", "布局技巧", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
### 1、普通流（常规流）

文档流（流式布局）分为 普通流、定位流、浮动流，不同流内的块级元素和行内元素的布局方式不同，布局方式用 FC（格式化上下文，含有 块级格式化上下文、内联格式化上下文、层叠格式化上下文、灵活格式化上下文等）来命名；

普通流中的布局规则默认为块级盒子从上到下，垂直排列；内联盒子从左到右，水平排列等；（书写模式（writing-mode）会对流布局产生影响；

### 2、position

属性有：

- static：默认值，元素依然按照 普通流 的定位规则定位；
- relative
- absolute
- sticky
- fixed

使用 position 会脱离常规流，成为定位流，并有其自己的定位规则；

### 3、float

属性有：

- left
- right
- none
- inherit

使用 float 会脱离常规流，成为浮动流，并有其自己的定位规则；

### 4、table

使用 HTML 标签来布局；

```css
<table>
    <tr>
        <th></th>
        <th></th>
    </tr>
    <tr>
        <td></td>
        <td></td>
    </tr>
</table>
```

### 5、flex

2009 年 W3C 提供的方案，注意只有 IE 10+ 支持 flex；

重要的概念：flex 容器，flex 项目，主轴，交叉轴；

设置某个元素的属性 `display: flex;`，此元素就成了 flex 容器，flex 容器内的元素是 flex 项目；

1.  flex 容器的属性：<br>
  - flex-direction
  - flex-wrap
  - flex-flow
  - justify-content
  - align-items
  - align-content
2.  flex 项目的属性<br>
  - flex （flex-grow、flex-shrink、flex-basis）
  - order
  - align-self

### 6、grid

二维布局方式，相对于使用 HTML 结构实现的 table 布局，grid 布局都是在 CSS 中完成的；

重要的概念：grid 容器、grid 项目、行、列、单元格、网格线；

设置某个元素的属性 `display: grid;` ，此元素就成了 grid 容器，grid 容器的直接子元素就是 grid 项目；

1.  grid 容器的属性<br>
  - grid-template-columns
  - grid-template-rows
  - gap（column-gap、row-gap）
  - palce-items（justify-items、align-items）
  - place-content（justify-content、align-content）
  - grid-template-areas
  - grid-auto-flow
  - grid-auto-columns、grid-auto-rows
2.  grid 项目的属性<br>
  -  grid-column-start、grid-column-end grid-row-start、grid-row-end grid-column grid-row
  -  grid-area
  -  justify-self、align-self place-self

## 2、常见布局效果

### 1、水平居中

1.  对于子元素为**行内元素**，直接在父元素上加上 `text-align:center;`
2.  对于子元素为**块级元素**或**行内块级元素**，直接在子元素上加上 `margin:0 auto;` 当子元素设置了绝对定位时 `position:absolute;` , 需要在左右加上相等的定位距离 `left:0;right:0;` 才能使用 `margin:0 auto;` 为什么 `margin: 0 auto;` 会居中，见： [www.cnblogs.com/sunhang32/p…](https://www.cnblogs.com/sunhang32/p/11826580.html)
3.  使用定位 `position:absolute;` + 父元素宽度的 50% 的偏移 `left:50%;` + 回退子元素宽度的 50% `transform:translateX(50%);`
4.  使用定位 `position:absolute;` + 父元素宽度的 50% 的偏移 `left:50%;` + 回退子元素宽度的 50% `margin-left:-子元素宽度的一半;` 水平居中时采用 `margin-left:-子元素宽度的一半;`和 `transform: translateX(-50%);` 两个方案的底层原理有什么不同：margin 会占据空间，transform 是移动，并不会占据原来的空间； 补充一个知识点 `margin: 50%;` 是相对于父元素的百分比， `transform: translate(50%, 50%);` 是相对于元素本身的百分比；
5.  使用 flex 布局或 grid 布局；

### 2、垂直居中

1.  对于单行文本，可以设置 `line-height:父元素高度;` 来达到垂直居中的目的；
2.  对于行内块级元素，可以通过增加高度为 100% 的伪元素，并增加 `vertical-align:middle;` 属性来改变父元素基线的位置；然后子元素通过 `vertical-align:middle;` 达到垂直居中的目的；  child 元素不加 `vertical-align:middle;` : ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c83b43f18e5e4f2292747d12b1a2e967~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?) child 元素加 `vertical-align:middle;` : ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dcd8c3ca7c8b418a9cbfe6c526c41766~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    .parent {
      width: 100px;
      height: 100px;
      border: 1px solid black;

    }
    .parent::after {
      content: '';
      display: inline-block;
      height:100%;
      vertical-align:middle;
    }
    /* 行内块级元素*/
    .child {
      display: inline-block;
      width: 50px;
      height: 50px;
      vertical-align:middle; /* 尝试注释这行代码 */
      background-color: green;
    }
    /* 行内元素*/
    .child1 {
      display: inline;
      background-color: red;
    }
  </style>
</head>
<body>
  <div class="parent">
    <div class="child"></div>
    <div class="child1">ss1</div>
  </div>
</body>
</html>
```
3.  通过设置父元素为 `display:table;` ,子元素为 `display:table-cell;` ，并通过 `vertical-align:middle;` 来将子元素垂直居中；
4.  使用 flex 布局或 grid 布局；

### 2、两列布局

左边定宽，右边自适应

利用 `float: left;` 和 `overflow: hidden;` 实现；

```css
.wrapper {
    width: 50vw;
    height: 100vh;
    background-color: grey;
}
.left {
    width: 100px;
    background-color: red;
    float: left;
}
.right {
    background-color: green;
    overflow: hidden;
    zoom: 1; /*兼容 ie 浏览器*/
}
```

利用 flex 布局实现：

```css
.wrapper {
    width: 50vw;
    height: 100vh;
    display: flex;
}
.left {
    width: 100px;
}
.right {
    flex: 1;
}
```

利用 grid 布局实现：

```css
.wrapper {
    width: 50vw;
    height: 100vh;
    display: grid;
    grid-template-columns: 100px auto;
    /*或者：grid-template-columns: 100px 1fr*/
}
```

#### 3、三列布局

左右列固定，中间列自适应，要求中间的 HTML 结构先解析；

注意 HTML 结构，这样使得 center 会优先加载：

```css
<div class="wrapper">
    <div class="center">content</div>
    <div class="left">left</div>
    <div class="right">right</div>
</div>
```

#### 1)、flex 布局实现

```css
.wrapper {
    display: flex;
​
}
.center {
     flex: 1;
     background-color: yellow;
     order: 1;
}
.left {
    width: 100px;
    /* flex: 1; */
    background-color: red;
​
}
.right {
    width: 100px;
    background-color: green;
    order: 2;
}
```

#### 2)、grid 布局实现

```css
.wrapper {
    display: grid;
    grid-template-columns: 100px 1fr 100px;
    grid-auto-flow: row dense;
​
}
.center {
    grid-column-start: 2;
    background-color: yellow;
​
}
.left {
    background-color: red;
​
}
.right {
    background-color: green;
}
```

#### 3)、圣杯布局

利用 float 将三列排到同一行，

再利用负的 margin 将 left 和 right 移动到 center 的两边；

最后增加 wrapper 的 padding，并用相对定位将 left 和 right 定位到 center 的 两边；

```css
.wrapper {
    padding: 0 100px;
}
.center {
    width: 100%;
    float: left;  
    background-color: yellow;
}
.left {
    width: 100px;
    float: left;
    margin-left: -100%;
    position: relative;
    left: -100px;
    background-color: red;
}
.right {
    width: 100px;
    float: left;
    margin-left: -100px;
    position: relative;
    left: 100px;
    background-color: green;
}
```

#### 4)、双飞翼布局

利用 float 将三列排到同一行，

再利用负的 margin 将 left 和 right 移动到 center 的两边；

再在 center 中新增一个 div ，并设置其 `margin: 0 100px;` 给 left 和 right 留下宽度；

```css
.wrapper {
    min-width: 400px; /*需要有一个最小宽度*/
}
.center {
    width: 100%;
    float: left;  
    background-color: yellow;
}
.center > div {
    margin: 0 100px; /*在 center 中增加了一个 div，并设置左右 margin 为 left 和 right 的宽度*/
}
.left {
    width: 100px;
    float: left;
    margin-left: -100%;
    background-color: red;
}
.right {
    width: 100px;
    float: left;
    margin-left: -100px;
    background-color: green;
}
```

> 原文：[https://juejin.cn/post/7070001080960024583](https://juejin.cn/post/7070001080960024583)

## 常见考点

### 1. **传统布局方法**

-  **浮动布局（Float）**：<br>
  - 理解如何使用 `float` 属性实现文本环绕和布局，且如何清除浮动影响（使用clearfix）。
  - 常见的浮动布局用了比如侧边栏、网格布局等。
-  **定位布局（Position）**：<br>
  - 理解 `position` 属性的不同值（`static`、`relative`、`absolute`、`fixed`、`sticky`）及其应用场景。
  - 能够使用绝对定位与相对定位结合来实现复杂的组件布局效果。

### 2. **Flexbox 布局**

-  **基本概念**：<br>
  - 理解 Flexbox 的基本原理及其优点，能够解释主轴和交叉轴的概念。
-  **常用属性**：<br>
  - 掌握 Flexbox 的相关属性，如 `display: flex;`、`flex-direction`、`justify-content`、`align-items`、`flex-wrap` 等。
-  **响应式布局**：<br>
  - 如何利用 Flexbox 自适应不同屏幕尺寸，实现响应式设计。

### 3. **Grid 布局**

-  **基本概念**：<br>
  - 理解 Grid 布局的基本原理，包括网格容器和网格项的概念。
-  **常用属性**：<br>
  - 掌握 Grid 布局的重要属性，如 `grid-template-columns`、`grid-template-rows`、`grid-area`、`gap` 等。
-  **适用场景**：<br>
  - 能够识别何时使用 Grid 布局和 Flexbox 布局，并解释两者的优缺点。

### 4. **响应式设计**

-  **媒体查询**：<br>
  - 理解如何使用媒体查询创建自适应布局，能够编写适当的 CSS 代码。
-  **相对单位**：<br>
  - 使用 `em`、`rem`、`vw`、`vh` 等单位来实现响应式布局。

### 5. **盒模型（Box Model）**

-  **理解盒模型**：<br>
  - 理解 CSS 盒模型的组成部分，包括内容区域、边框、内边距（padding）、外边距（margin）。
-  **盒模型的影响**：<br>
  - 能够讨论如何设置 `box-sizing: border-box;` 来影响布局计算方式，以及它的好处。

### 6. **常见布局模式**

- **复合布局**：<br>
  - 能够实现一些常见的布局模式，例如：<br>
    - 基于 Flexbox 的导航栏
    - 网格布局的卡片
    - 响应式图片库
    - 瀑布流布局

### 7. **CSS 变量与自定义属性**

- **CSS 变量**：<br>
  - 理解 CSS 自定义属性（变量）的使用以及它们如何简化和提高布局的可维护性。

### 8. **最佳实践与性能**

-  **代码可读性**：<br>
  - 优化布局相关 CSS 代码的可读性和可维护性。
-  **性能考虑**：<br>
  - 理解复杂布局对性能的影响，如何避免重排和重绘（reflow & repaint），以及选择合适的方法。

### 9. **技术与工具**

-  **布局调试**：<br>
  - 能够使用 Chrome 开发者工具进行布局调试，检查盒模型、Flex 和 Grid 布局。
-  **工具与框架**：<br>
  - 对 CSS 布局框架的理解（如 Bootstrap、Tailwind CSS），特别是它们如何支持快速布局开发。

### 10. **实际应用的案例**

- **案例分析**：<br>
  - 被问到如何处理特定布局问题，能够描述你会采取的步骤和思路。
