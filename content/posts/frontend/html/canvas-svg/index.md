+++
title = "Canvas 和 SVG"
date = '2024-10-09T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = false
weight = 10
tags = ["面试", "前端", "HTML", "Canvas 和 SVG", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 1.Canvas

Canvas 是 HTML5 中新增的一个元素，它提供了一种通过 JavaScript 来绘制图形的方式，使用笔刷绘制2D图案。通过 Canvas，我们可以在网页中动态地绘制出各种图形、图表、动画等内容，实现更丰富的交互效果。

### 工作方式

Canvas 的工作方式是，我们首先在 HTML 页面中添加一个 `<canvas>` 元素，并指定其宽度和高度，然后在 JavaScript 中获取该元素的上下文对象，并通过调用它的方法来绘制图形。Canvas 的上下文对象有多种，包括 2D 上下文、WebGL 上下文等，我们可以根据需求选择相应的上下文对象来进行绘制。

### 常用属性

| 属性 | 效果 |
| --- | --- |
| `fillStyle` | 填充颜色。默认为黑色 |
| `strokeStyle` | 描边颜色。默认为黑色 |
| `lineWidth` | 线条宽度。默认为 1 像素 |
| `lineCap` | 线条末端的样式,可选值有 butt、round 和 square。默认为 butt |
| `lineJoin` | 线条相交处的样式,可选值有 miter、round 和 bevel。默认为 miter。 |
| `miterLimit` | 线条相交处的最大斜接长度。默认为 10 像素 |
| `globalAlpha` | 绘制的透明度。默认为 1（不透明） |
| `shadowColor` | 阴影颜色。默认为黑色 |
| `shadowOffsetX`、`shadowOffsetY` | 阴影的偏移量和模糊程度 |
| `shadowBlur` | 模糊程度 |

### 优缺点

#### 优点

- 基于矢量绘制，图形可以自由缩放而不失真
- 具有良好的跨浏览器兼容性
- 通过 JavaScript 动态生成图形，可以更加灵活地控制图形的显示和交互

#### 缺点

无法处理复杂的交互事件、不支持跨域图像等

### 使用实例

这个实例中，我们使用了一个 HTML5 的 Canvas 元素，它的宽度和高度分别为 200 像素。在 JavaScript 中，我们获取了这个元素，并通过 `getContext` 方法获取了它的上下文对象。然后，我们使用 `fillStyle` 属性设置了矩形的填充颜色为红色，并使用 `fillRect` 方法绘制了一个起点坐标为 (50,50)，宽度为 100 像素，高度为 100 像素的矩形。

```xml
<!DOCTYPE html>
<html>
<head>
  <title>Canvas Example</title>
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
</head>
<body>
<canvas id="myCanvas" width="200" height="200"></canvas>

<script>
  // 获取画布元素
  var canvas = document.getElementById('myCanvas');
  // 获取画布上下文
  var ctx = canvas.getContext('2d');
  // 绘制矩形
  ctx.fillStyle = 'red';
  ctx.fillRect(50, 50, 100, 100);
</script>
</body>
</html>
```

## 2.SVG

SVG（Scalable Vector Graphics，可缩放矢量图形）是一种基于 XML 的矢量图形标准，它可以用来描述二维图形和图形应用程序，使用标签绘制不规则矢量图。与像素图形不同，SVG 图形是基于矢量的，它使用数学公式来描述图形形状，因此可以自由缩放而不失真。

### 常用属性

| 属性 | 效果 |
| --- | --- |
| `width`, `height` | 元素的宽度和高度 |
| `viewBox` | 元素的视口大小和位置 |
| `viewBox` | 元素的填充颜色 |
| `viewBox` | 元素的描边颜色和宽度 |
| `opacity` | 元素的不透明度 |
| `transform` | 元素的变换，如旋转、缩放、平移等 |
| `d` | 用于路径元素（如 `<path>`）的属性，指定路径的数据 |
| `text-anchor` , `alignment-baseline` | 用于文本元素（如 `<text>`）的属性，指定文本的水平和垂直对齐方式 |
| `x` , `y` | 用于定位元素的属性，指定元素的 x 坐标和 y 坐标 |

### 优缺点

#### 优点

- 具有良好的跨浏览器兼容性、可搜索性和可访问性
- 支持丰富的图形效果和动画
- 可以通过 CSS 和 JavaScript 来进行样式和交互控制，可以与其他 Web 技术结合使用，实现更丰富的Web应用

#### 缺点

对于复杂的图形或大量的数据，SVG 可能会影响性能

## 使用实例

1. 在 HTML 页面中添加 `<svg>` 元素，并设置其宽度和高度

```arduino
<svg width="200" height="200"></svg>
```

2. 在 `<svg>` 元素中添加各种 SVG 元素来描述图形形状。使用 `<rect>` 元素和 `<circle>` 元素来绘制一个红色的矩形和一个黄色的圆形，同时设置了边框的颜色、宽度和样式。

```arduino
<svg width="200" height="200">
  <rect x="50" y="50" width="100" height="100" fill="red" stroke="black" stroke-width="2"/>
  <circle cx="100" cy="100" r="50" fill="yellow" stroke="black" stroke-width="2"/>
</svg>
```

3. 使用 CSS 来设置 SVG 元素的样式。使用 CSS 来设置 SVG 元素的边框和背景颜色。

```css
svg {
    border: 1px solid black;
    background-color: #eee;
}
```

4. 使用 JavaScript 来实现交互效果和动画效果。使用 JavaScript 来监听圆形的点击事件，并在点击时将圆形的半径设置为 75，从而实现一个简单的动画效果。

```javascript
const circle = document.querySelector('circle');
circle.addEventListener('click', () => {
  circle.setAttribute('r', '75');
});
```

## 3.Canvas 和 SVG 的区别

- Canvas 是用笔刷来绘制 2D 图形的
- SVG 则是用标签来绘制不规则矢量图

### 相同点

- 都是用来绘制 2D 图形的

### 不同点

- SVG 画的是矢量图（不依赖分辨率），Canvas 画的是位图（依赖分辨率）
- SVG 节点过多时渲染较慢， Canvas 性能好一些，但写起来更复杂
- SVG 支持分层和事件，Canvas 不支持，但可以使用库来实现
- SVG 每一个图形都是一个 `DOM` 元素，Canvas 则是单个 `HTML`元素，相当于 `<img>`
- SVG 可以通过脚本和CSS进行修改，Canvas 则只能通过脚本修改
- SVG 支持事件处理器，Canvas 则不支持事件处理器
- SVG中，将每个绘制的形状记住为对象。如果更改了SVG对象的属性，则浏览器可以自动重新呈现形状；Canvas 由像素呈现，旦图形在画布中绘制完成，浏览器撒手不管了。如果需要更改其位置，则需要重新绘制整个场景，其中许多对象会被频繁重绘

## 4. 优势总结

### Canvas优势

- 绘制出来的图形是位图具有很好的渲染性能
- 适合数据量比较大（>1000）
- 大量图形高频率交互
- 适合游戏
- 可以导出jpg/png图片

### SVG优势

- 矢量图放大不失真
- 支持事件处理器
- 文字独立、可编辑可搜索

## 对比表格

|  | Canvas | SVG |
| --- | --- | --- |
| 大数据量 | ✅ | ❌ |
| 高交互场景 | ✅ | ❌ |
| 可导出图片 | ✅ | ❌ |
| 放大不失真 | ❌ | ✅ |
| 支持事件处理 | ❌ | ✅ |
| 文字可编辑 | ❌ | ✅ |

## 常见考点

考察点通常会围绕 **Canvas** 和 **SVG** 的基本概念、性能、事件处理、动画、兼容性等展开，重点在于理解它们各自的优缺点，并能够根据项目需求做出合适的技术选择。

### 1. **Canvas 和 SVG 的基本区别**

- **Canvas** 是基于位图的绘图模型，通过 JavaScript 动态绘制图形。适合大量对象的实时渲染（如游戏）。
- **SVG** 是基于矢量的绘图模型，使用 XML 定义图形。适合处理复杂的静态图形和响应式设计。

**考点**：何时使用 Canvas，何时使用 SVG，以及它们的优缺点。

### 2. **绘图方式**

- **Canvas**：使用 JavaScript API 来绘制图形和处理渲染（例如 `fillRect()`、`stroke()` 等）。
- **SVG**：使用 XML 标记语言来定义图形元素（如 `<circle>`、`<rect>`、`<path>` 等）。

**考点**：如何使用 Canvas API 和 SVG 元素绘制基本图形。

### 3. **性能**

- **Canvas**：基于像素操作，适合绘制大量复杂的、需要高频次更新的图像（如游戏、动画），但随着图形复杂度增加，性能可能下降。
- **SVG**：基于 DOM 树，处理较多复杂对象时可能导致性能瓶颈，但对于简单、静态、少量对象的处理性能较好。

**考点**：讨论 Canvas 与 SVG 在性能上的差异，尤其是大规模动画和动态图形的性能优化。

### 4. **可伸缩性**

- **Canvas**：由于是位图，放大后图像质量下降，可能会出现模糊。
- **SVG**：基于矢量，可以无损缩放，适合响应式设计。

**考点**：如何在需要自适应、无损缩放时选择 SVG。

### 5. **事件处理**

- **Canvas**：不支持 DOM 事件，必须通过计算坐标和事件侦听手动处理用户交互（如点击、悬停）。
- **SVG**：支持标准的 DOM 事件，可以直接绑定事件监听器（如 `onclick`、`onmouseover`）。

**考点**：如何在 Canvas 和 SVG 中处理用户交互和事件监听。

### 6. **文件大小与加载时间**

- **Canvas**：渲染的图形不会影响 DOM 大小，但可能增加页面的 JavaScript 执行量。
- **SVG**：作为 XML 文件嵌入页面，增加 DOM 大小，可能影响复杂图形的渲染速度。

**考点**：如何权衡文件大小和加载速度问题，尤其是在复杂图形或高分辨率下。

### 7. **图形操作**

- **Canvas**：绘制后，无法直接操作已绘制的图形，更新需要重绘整个画布。
- **SVG**：因为是 DOM 元素，图形对象可以直接操作（通过 JavaScript 或 CSS），无需重新渲染整个图像。

**考点**：何时选择 Canvas 或 SVG 来动态操作图形元素。

### 8. **动画**

- **Canvas**：需要通过 `requestAnimationFrame()` 和 JavaScript 控制动画，适合复杂、实时更新的动画效果。
- **SVG**：可以通过 CSS 和 SMIL（可缩放矢量图形语言）实现简单的动画，也可以借助 JavaScript 控制。

**考点**：如何使用 Canvas 实现复杂动画，以及如何使用 CSS 动画和 JavaScript 操控 SVG 动画。

### 9. **兼容性**

- **Canvas** 和 **SVG** 都被现代浏览器广泛支持，但在性能和优化上的表现可能有所不同，特别是在移动设备上。

**考点**：Canvas 和 SVG 的浏览器支持和兼容性问题。

### 10. **实际应用场景**

- **Canvas**：适合游戏开发、数据可视化、图像处理、实时绘图等场景。
- **SVG**：适合图标、简单的图形设计、数据可视化（如图表）、地图等静态或交互式场景。

**考点**：在具体项目中，如何根据需求选择 Canvas 或 SVG 作为渲染技术。
