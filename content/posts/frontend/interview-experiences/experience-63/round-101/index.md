+++
title = "阿里巴巴-社招-3年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/63"
experienceId = 63
roundId = 101
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T12:26:34.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-63/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-63/round-102/index.md" >}}) →

**本轮要点：** react 事件机制、React 生命周期、state 与 props

本轮共 13 道题。答案默认折叠，便于先自行作答。

## 1. 实现全屏水平垂直居中、宽高为屏幕宽度一半的正方形 {#question-subjective-ee8affda6741}

### 题目要点

* 利用 `vw` 单位定义宽高，保证正方形且相对视口大小
* Flexbox 和绝对定位 + transform 是常用居中方案
* 重置默认 margin 和设置容器高度保证布局准确
* 任选方案均可，Flexbox 代码简洁，绝对定位兼容性好

<details>
<summary>参考答案</summary>

## 一、考察点

- 掌握 CSS 布局基础知识<br>
- 熟悉视口单位（vw、vh）的使用<br>
- 理解水平垂直居中多种实现方式<br>
- 了解盒模型和尺寸计算<br>

---

## 二、参考答案

### 2.1 需求分析

- 元素宽度和高度为屏幕宽度的 50%（即 50vw）<br>
- 元素是正方形，宽高相等<br>
- 水平和垂直方向均居中显示<br>
- 兼容主流现代浏览器<br>

### 2.2 代码实现示例

#### 方法一：使用 Flexbox

```html
<div class="container">
  <div class="square"></div>
</div>

<style>
  html, body, .container {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center;     /* 垂直居中 */
  }
  .square {
    width: 50vw;
    height: 50vw; /* 保证正方形 */
    background-color: #4CAF50;
  }
</style>
````

#### 方法二：使用绝对定位 + transform

```html
<div class="square"></div>

<style>
  .square {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50vw;
    height: 50vw;
    background-color: #2196F3;
    transform: translate(-50%, -50%);
  }
  html, body {
    margin: 0;
    height: 100vh;
  }
</style>
```

---

### 2.3 说明

* `50vw` 表示视口宽度的一半
* Flexbox 方案利用容器的弹性布局实现简单居中
* 绝对定位方案通过 `top:50%`, `left:50%` 定位中心点，再用 `transform` 修正偏移
* 两种方案均保证元素在视口中央且尺寸为屏幕宽度一半的正方形

---

## 三、常见误区或面试陷阱

* 忽略 viewport 单位，使用百分比 `%` 宽高导致高度受父元素限制
* 使用 `margin: auto` 只实现水平居中，未垂直居中
* transform 偏移值写错方向或单位
* 未重置 `html, body` 的 margin 和高度，导致布局异常

</details>

## 2. 如何通过 padding-bottom 实现自适应正方形 {#question-subjective-efad8bc5b4fe}

### 题目要点

* 百分比 padding-bottom 是相对于元素宽度计算的
* 设置宽度，padding-bottom 等于宽度比例即可实现宽高比
* 纯 CSS 实现响应式正方形，无需 JS 计算
* 配合 position 及 transform 可实现内部内容居中

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 CSS 盒模型及百分比 padding 的计算规则<br>
- 熟悉通过内边距（padding）比例实现自适应高度的布局技巧<br>
- 掌握纯 CSS 无需固定高度实现宽高比控制的方法<br>
- 了解响应式设计及视口适配相关概念<br>

---

## 二、参考答案

### 2.1 核心原理说明

- **百分比 padding 的高度计算基于元素的宽度**<br>
  例如，`padding-bottom: 100%` 表示内边距底部高度是元素自身宽度的 100%<br>
- 利用这一特性，设置一个元素的宽度，然后用 `padding-bottom` 来控制高度，从而实现固定宽高比（正方形为 1:1）<br>
- 这种方式不依赖固定高度或 JS，纯 CSS 实现响应式正方形

### 2.2 具体实现方式

```html
<div class="square"></div>

<style>
  .square {
    width: 50vw;               /* 宽度为视口宽度的一半 */
    padding-bottom: 50vw;      /* 内边距底部为宽度的 100%，实现高度与宽度相等 */
    background-color: #f60;
    position: relative;        /* 便于放置绝对定位内容（如文字） */
  }
  /* 如果需要内部内容绝对居中，可添加： */
  .square > .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
````

### 2.3 使用场景

* 自适应正方形容器
* 图片或视频占位框
* 响应式卡片、图标区域布局

---

## 三、常见误区或面试陷阱

* 误以为 padding 百分比是基于高度计算（实际上是基于宽度）
* 忽略内容本身不占高度，需要通过 `position: relative` 和绝对定位解决内容布局
* 没有设置元素的 `width`，导致 padding 计算无意义
* 使用固定 `height` 反而破坏响应式效果

</details>

## 3. 若要求正方形内嵌图片保持比例且不拉伸，如何实现 {#question-subjective-c8954730cddb}

### 题目要点

* 容器用 padding-bottom 创建自适应正方形
* 图片使用 `object-fit: contain` 保持比例且不拉伸
* 绝对定位图片居中显示，宽高100%填充容器
* 设置 `overflow: hidden` 避免溢出

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解图片的默认渲染行为及尺寸适配<br>
- 掌握 CSS 中图片等媒体对象的缩放控制属性（object-fit）<br>
- 熟悉容器布局，确保图片在固定宽高正方形内自适应显示<br>
- 了解响应式设计和兼容性考虑<br>

---

## 二、参考答案

### 2.1 核心概念说明

- **图片默认行为**：图片按原始宽高比显示，若强制设置宽高可能导致变形<br>
- **`object-fit` 属性**：用于控制替换元素（如 img、video）内容的填充方式<br>
- `object-fit: contain` 保持图片比例，完整显示，可能留空白<br>
- `object-fit: cover` 保持比例，填满容器，超出部分裁剪<br>
- 结合容器尺寸和 `object-fit` 可灵活控制图片展示效果

### 2.2 具体实现示例

```html
<div class="square">
  <img src="your-image.jpg" alt="示例图片" />
</div>

<style>
  .square {
    width: 50vw;
    padding-bottom: 50vw; /* 自适应正方形 */
    position: relative;
    overflow: hidden;     /* 防止图片溢出 */
  }
  .square img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    object-fit: contain;   /* 保持比例且不拉伸 */
    transform: translate(-50%, -50%);
  }
</style>
````

### 2.3 说明

* 使用 `padding-bottom` 创建正方形容器
* `position: relative` + `position: absolute` 定位图片，方便居中
* 图片宽高设为 100%，配合 `object-fit: contain` 保持原始比例且不被拉伸
* `overflow: hidden` 防止图片超出容器边界显示
* 可根据需求改为 `object-fit: cover` 实现填充并裁剪效果

---

## 三、常见误区或面试陷阱

* 不设置 `object-fit`，直接用 `width` 和 `height` 100%，图片可能被拉伸变形
* 忽略容器定位，导致图片无法居中或布局错乱
* 未设置 `overflow: hidden`，图片溢出影响页面布局
* 误用 `background-image` 和 `background-size`，与 img 标签区别不清

</details>

## 4. 怎么理解回流跟重绘？什么场景下会触发？ {#question-417ebda0-3f2d-48d3-95ec-ae1838bf39cb}

> 题库原题：[怎么理解回流跟重绘？什么场景下会触发？](https://fe.ecool.fun/topic/417ebda0-3f2d-48d3-95ec-ae1838bf39cb)

### 题目要点

回流（Reflow）和重绘（Repaint）是浏览器在渲染页面时发生的两种性能成本较高的操作。

#### 回流（Reflow）

回流是指浏览器需要重新计算元素的尺寸、位置等属性，然后重新排列这些元素的过程。当DOM结构发生变化时，浏览器需要重新计算这些元素的布局信息。

触发回流的场景：

- 页面初次加载。
- 元素尺寸、位置或内容发生变化（如通过JavaScript修改样式）。
- 浏览器窗口大小变化（响应式设计）。
- 元素的class或id属性改变。
- 调用了某些会引起布局变化的方法，如offsetTop、offsetLeft、scrollTop、scrollLeft、clientTop、clientLeft等。

#### 重绘（Repaint）

重绘是指当元素的外观（如颜色、背景色、边框颜色等）发生变化，但不影响布局时，浏览器需要重新绘制这些元素。

触发重绘的场景：

- 元素的颜色、背景色、边框颜色等属性改变。
- 元素的可见性发生变化（如visibility、display属性改变）。
- 元素的box-shadow、text-shadow等属性改变。
- CSS伪类状态改变，如:hover、:focus。
- 理解回流和重绘的重要性

回流和重绘是性能瓶颈的常见原因。它们都会增加浏览器的渲染负担，尤其是当涉及到大量元素时。因此，优化回流和重绘是提高网页性能的关键。

#### 优化策略

- 减少不必要的DOM操作，尤其是在复杂的页面布局中。
- 使用transform和opacity属性进行动画，因为它们可以触发合成（Compositing），从而避免回流和重绘。
- 将多个会引起回流的样式更改合并到一个动画帧中进行。
- 使用文档片段（Document Fragment）或display: none的元素进行DOM操作，以减少对可见元素的影响。
- 使用CSS变量（Custom Properties）来实现主题切换，以减少重绘和回流。

#### 考察重点

- 对回流和重绘概念的理解。
- 能够识别和解释触发回流和重绘的场景。
- 掌握减少回流和重绘性能影响的优化技巧。

<details>
<summary>参考答案</summary>

## 一、是什么

在`HTML`中，每个元素都可以理解成一个盒子，在浏览器解析过程中，会涉及到回流与重绘：

- 回流：布局引擎会根据各种样式计算每个盒子在页面上的大小与位置

- 重绘：当计算好盒模型的位置、大小及其他属性后，浏览器根据每个盒子特性进行绘制

具体的浏览器解析渲染机制如下所示：

 ![](https://static.ecool.fun//article/19adb6a1-5ac2-4d39-b06f-166c3541d01f.png)

- 解析HTML，生成DOM树，解析CSS，生成CSSOM树

- 将DOM树和CSSOM树结合，生成渲染树(Render Tree)
- Layout(回流):根据生成的渲染树，进行回流(Layout)，得到节点的几何信息（位置，大小）
- Painting(重绘):根据渲染树以及回流得到的几何信息，得到节点的绝对像素
- Display:将像素发送给GPU，展示在页面上

在页面初始渲染阶段，回流不可避免的触发，可以理解成页面一开始是空白的元素，后面添加了新的元素使页面布局发生改变

当我们对 `DOM` 的修改引发了 `DOM `几何尺寸的变化（比如修改元素的宽、高或隐藏元素等）时，浏览器需要重新计算元素的几何属性，然后再将计算的结果绘制出来

当我们对 `DOM `的修改导致了样式的变化（`color`或`background-color`），却并未影响其几何属性时，浏览器不需重新计算元素的几何属性、直接为该元素绘制新的样式，这里就仅仅触发了重绘

## 二、如何触发

要想减少回流和重绘的次数，首先要了解回流和重绘是如何触发的

### 回流触发时机

回流这一阶段主要是计算节点的位置和几何信息，那么当页面布局和几何信息发生变化的时候，就需要回流，如下面情况：

- 添加或删除可见的DOM元素
- 元素的位置发生变化
- 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
- 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代
- 页面一开始渲染的时候（这避免不了）
- 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

还有一些容易被忽略的操作：获取一些特定属性的值

> offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight

这些属性有一个共性，就是需要通过即时计算得到。因此浏览器为了获取这些值，也会进行回流

除此还包括`getComputedStyle `方法，原理是一样的

### 重绘触发时机

触发回流一定会触发重绘

可以把页面理解为一个黑板，黑板上有一朵画好的小花。现在我们要把这朵从左边移到了右边，那我们要先确定好右边的具体位置，画好形状（回流），再画上它原有的颜色（重绘）

除此之外还有一些其他引起重绘行为：

- 颜色的修改

- 文本方向的修改
- 阴影的修改

### 浏览器优化机制

由于每次重排都会造成额外的计算消耗，因此大多数浏览器都会通过队列化修改并批量执行来优化重排过程。浏览器会将修改操作放入到队列里，直到过了一段时间或者操作达到了一个阈值，才清空队列

当你获取布局信息的操作的时候，会强制队列刷新，包括前面讲到的`offsetTop`等方法都会返回最新的数据

因此浏览器不得不清空队列，触发回流重绘来返回正确的值

## 三、如何减少

我们了解了如何触发回流和重绘的场景，下面给出避免回流的经验：

- 如果想设定元素的样式，通过改变元素的 `class` 类名 (尽可能在 DOM 树的最里层)
- 避免设置多项内联样式
- 应用元素的动画，使用 `position` 属性的 `fixed` 值或 `absolute` 值(如前文示例所提)
- 避免使用 `table` 布局，`table` 中每个元素的大小以及内容的改动，都会导致整个 `table` 的重新计算
- 对于那些复杂的动画，对其设置 `position: fixed/absolute`，尽可能地使元素脱离文档流，从而减少对其他元素的影响
- 使用css3硬件加速，可以让`transform`、`opacity`、`filters`这些动画不会引起回流重绘
- 避免使用 CSS 的 `JavaScript` 表达式

在使用 `JavaScript` 动态插入多个节点时, 可以使用`DocumentFragment`. 创建后一次插入. 就能避免多次的渲染性能

但有时候，我们会无可避免地进行回流或者重绘，我们可以更好使用它们

例如，多次修改一个把元素布局的时候，我们很可能会如下操作

```js
const el = document.getElementById('el')
for(let i=0;i<10;i++) {
    el.style.top  = el.offsetTop  + 10 + "px";
    el.style.left = el.offsetLeft + 10 + "px";
}
```

每次循环都需要获取多次`offset`属性，比较糟糕，可以使用变量的形式缓存起来，待计算完毕再提交给浏览器发出重计算请求

```js
// 缓存offsetLeft与offsetTop的值
const el = document.getElementById('el')
let offLeft = el.offsetLeft, offTop = el.offsetTop

// 在JS层面进行计算
for(let i=0;i<10;i++) {
  offLeft += 10
  offTop  += 10
}

// 一次性将计算结果应用到DOM上
el.style.left = offLeft + "px"
el.style.top = offTop  + "px"
```

我们还可避免改变样式，使用类名去合并样式

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

使用类名去合并样式

```html
<style>
    .basic_style {
        width: 100px;
        height: 200px;
        border: 10px solid red;
        color: red;
    }
</style>
<script>
    const container = document.getElementById('container')
    container.classList.add('basic_style')
</script>
```

前者每次单独操作，都去触发一次渲染树更改（新浏览器不会），

都去触发一次渲染树更改，从而导致相应的回流与重绘过程

合并之后，等于我们将所有的更改一次性发出

我们还可以通过通过设置元素属性`display: none`，将其从页面上去掉，然后再进行后续操作，这些后续操作也不会触发回流与重绘，这个过程称为离线操作

```js
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

离线操作后

```js
let container = document.getElementById('container')
container.style.display = 'none'
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
...（省略了许多类似的后续操作）
container.style.display = 'block'
```

</details>

## 5. 获取 offsetTop 为何会触发强制同步回流 {#question-subjective-52e037c1820e}

### 题目要点

* `offsetTop` 读取需要最新布局，浏览器强制同步回流保证数据准确
* 回流是昂贵且同步阻塞的渲染过程，影响性能
* 避免频繁读取布局属性，批量修改 DOM，分离读写操作
* 使用异步或缓存手段优化回流触发

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解浏览器渲染流程（重排 Reflow 与重绘 Repaint）<br>
- 掌握什么操作会触发强制同步回流<br>
- 理解同步读取布局相关属性（如 offsetTop）导致回流的机制<br>
- 熟悉性能优化时避免强制回流的方法<br>

---

## 二、参考答案

### 2.1 核心概念说明

- **浏览器渲染流程**：DOM 树构建 → 样式计算 → 布局计算（Reflow） → 绘制（Repaint）<br>
- **回流（Reflow）**：因元素尺寸、位置等变化导致浏览器重新计算布局，是性能开销最大的过程<br>
- **强制同步回流**：当脚本读取某些会依赖最新布局信息的属性时，浏览器必须立即执行回流，保证数据准确<br>

### 2.2 offsetTop 的本质及触发原因

- `offsetTop` 返回元素相对于 offsetParent 上边缘的距离（布局信息）<br>
- 浏览器为了返回正确数值，必须保证布局计算是最新的<br>
- 如果之前有对 DOM 的改动尚未布局，读取 `offsetTop` 会强制浏览器同步执行回流，更新布局数据后返回准确值

### 2.3 举例说明

```js
element.style.width = '100px';  // 修改样式，标记为需回流
const top = element.offsetTop;  // 读取布局属性，强制同步回流执行，获取最新布局
````

* 上面代码中，修改样式后，浏览器延迟回流优化；读取 `offsetTop` 时，必须同步回流，性能开销明显

---

### 2.4 性能优化建议

* 减少频繁读取布局相关属性，尤其在修改 DOM 或样式后避免立即读取
* 批量修改 DOM，避免多次触发回流
* 使用 `requestAnimationFrame` 或异步延迟读取布局，规避同步回流
* 通过缓存布局信息减少访问次数
* 使用 `getBoundingClientRect` 时同理，也会触发回流

---

## 三、常见误区或面试陷阱

* 误认为读取 `offsetTop` 不会影响性能，其实会导致强制回流
* 不知道回流是同步阻塞操作，滥用布局属性读取会拖慢页面渲染
* 忽略浏览器优化策略，导致性能瓶颈难排查
* 将多次 DOM 读写操作混杂，未按读写分离优化

</details>

## 6. 对象不可变性实现，对比三种方案： {#question-subjective-ae5c03604c9f}

```js
// 方案1: Object.freeze
const obj1 = Object.freeze({ a: 1 });
// 方案2: Proxy
const obj2 = new Proxy({ a: 1 }, { set: () => false });
// 方案3: Object.defineProperty
Object.defineProperty(obj3, "a", { writable: false });
```

### 题目要点

* Object.freeze：浅冻结，禁止新增、删除、修改属性
* Proxy：灵活拦截，支持深度不可变，实现复杂业务需求
* Object.defineProperty：逐属性控制，可设为不可写，适合部分属性保护
* 根据需求和兼容性权衡选择方案

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解前端实现对象不可变性的不同方案<br>
- 掌握 Object.freeze、Proxy 和 Object.defineProperty 的特点及限制<br>
- 分析三种方案在深度冻结、性能、使用体验上的差异<br>
- 理解不可变对象在状态管理、函数式编程中的应用价值<br>

---

## 二、参考答案

### 2.1 方案介绍及原理

#### 方案1：`Object.freeze`

- **原理**：冻结对象，使其属性不可新增、删除、修改<br>
- 对象变为不可扩展，属性变为不可写不可配置<br>
- **注意**：只冻结一层（浅冻结），嵌套对象仍可修改<br>

示例：

```js
const obj1 = Object.freeze({ a: 1 });
obj1.a = 2; // 无效，严格模式下会报错
````

#### 方案2：`Proxy`

* **原理**：通过代理对象拦截操作，自定义行为，如禁止修改
* 可以深度拦截（结合递归代理实现深度不可变）
* 灵活性高，可定制化错误提示或日志
* 性能相对较高，但部分老浏览器不支持

示例：

```js
const obj2 = new Proxy({ a: 1 }, {
  set(target, prop, value) {
    console.warn(`禁止修改属性${prop}`);
    return false; // 拦截写操作
  }
});
obj2.a = 2; // 拦截失败，无法修改
```

#### 方案3：`Object.defineProperty`

* **原理**：将属性设置为不可写（writable: false），禁止修改该属性
* 只能逐个属性设置，不方便批量操作
* 不能阻止新增或删除属性
* 同样是浅层限制

示例：

```js
const obj3 = {};
Object.defineProperty(obj3, "a", { value: 1, writable: false, configurable: false });
obj3.a = 2; // 无效，无法修改
```

---

### 2.2 方案对比

| 特性        | Object.freeze | Proxy       | Object.defineProperty |
| --------- | ------------- | ----------- | --------------------- |
| 不可变性范围    | 浅冻结           | 可实现深度冻结（递归） | 单个属性浅冻结               |
| 新增/删除属性限制 | 不允许           | 可自定义        | 允许                    |
| 可定制行为     | 无             | 灵活，支持各种拦截   | 无                     |
| 使用复杂度     | 简单            | 复杂          | 中等，逐属性操作              |
| 浏览器兼容性    | 较好            | 部分旧浏览器不支持   | 较好                    |
| 性能影响      | 较小            | 较大，代理开销     | 较小                    |

---

### 2.3 适用场景及选择建议

* **Object.freeze**
  简单冻结浅层对象，防止误修改，适合小规模数据冻结
* **Proxy**
  复杂场景需深度不可变，需捕获所有修改操作，推荐使用，适合现代环境
* **Object.defineProperty**
  需对部分关键属性单独保护时使用，适合局部控制，不适合整体冻结

---

## 三、常见误区或面试陷阱

* 误以为 Object.freeze 是深冻结（需手动递归冻结）
* 忽略 Proxy 兼容性问题，盲目使用导致兼容性缺陷
* 认为 Object.defineProperty 可以阻止所有修改（无法阻止属性新增和删除）
* 低估 Proxy 对性能的潜在影响

</details>

## 7. Proxy 的 set 函数如何拦截数组的 push 操作 {#question-subjective-3ee90ecb67ba}

### 题目要点

* 数组 `push` 触发 `set` 两次：新元素赋值 + length 赋值
* 通过判断 `prop` 是否为数字索引或 `"length"`，即可精准拦截
* 使用 Reflect.set 保证默认行为正常执行
* 结合拦截做日志、校验或阻止操作

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 Proxy 拦截机制，尤其是对数组操作的捕获<br>
- 掌握数组 `push` 方法的底层本质（其实是通过 `set` 操作新增或修改数组元素和 `length` 属性）<br>
- 能正确通过 Proxy 的 `set` 捕获数组元素新增和长度变化<br>
- 了解如何针对数组操作做定制化处理或限制<br>

---

## 二、参考答案

### 2.1 核心原理说明

- JavaScript 中数组的 `push` 方法本质是修改数组的“length”属性和新增元素（数组索引属性）<br>
- 当执行 `arr.push(value)` 时，触发两次 `set`：<br>
  1. 新索引位置设置新元素值<br>
  2. `length` 属性增加<br>
- Proxy 的 `set` 捕获的是属性赋值操作，能捕获上述两种赋值<br>
- 通过判断被赋值的属性（`prop`）是否为数字索引或者 `"length"`，可以针对 push 进行特殊处理<br>

### 2.2 示例代码

```js
const arr = [];

const proxyArr = new Proxy(arr, {
  set(target, prop, value, receiver) {
    if (prop === 'length') {
      console.log(`数组长度被修改，新长度：${value}`);
    } else if (!isNaN(prop)) {
      console.log(`数组索引 ${prop} 被赋值为 ${value}`);
    }
    // 反射操作，确保正常赋值
    return Reflect.set(target, prop, value, receiver);
  }
});

proxyArr.push(10);
// 控制台输出：
// 数组索引 0 被赋值为 10
// 数组长度被修改，新长度：1

proxyArr.push(20);
// 控制台输出：
// 数组索引 1 被赋值为 20
// 数组长度被修改，新长度：2
````

### 2.3 说明

* Proxy 的 `set` 拦截函数接收四个参数：目标对象、属性名、赋值、代理对象
* 数组新增元素本质是给新索引属性赋值，长度变化是对 `"length"` 属性赋值
* 可以根据 `prop` 判断操作类型，从而实现对 `push` 的拦截、限制或日志打印
* 如果需要阻止 `push`，可返回 `false` 并阻止赋值

---

## 三、常见误区或面试陷阱

* 误以为 Proxy 会单独拦截 `push` 方法调用（其实是捕获属性赋值）
* 忽略 `"length"` 也会被 `set` 拦截，需要同时处理
* 没有正确返回 `true/false` 导致 Proxy 行为异常
* 只处理数字索引，忽略了 `length` 属性修改

</details>

## 8. 发布订阅模式手写 {#question-subjective-433681c75f5c}

### 题目要点

* 维护事件与回调的映射表
* 设计 `on`、`off`、`emit` 三大核心方法
* 支持 `once` 一次性订阅
* 确保回调执行时传递参数和正确上下文

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解发布-订阅模式的设计思想和应用场景<br>
- 掌握事件管理的核心机制：事件注册、触发、解绑<br>
- 理解解耦合思想，减少模块之间依赖<br>
- 掌握如何设计一个简洁高效的事件总线（Event Bus）<br>

---

## 二、参考答案

### 2.1 模式核心概念

- **发布者（Publisher）**：发布事件，通知订阅者<br>
- **订阅者（Subscriber）**：订阅感兴趣的事件，并对事件做出响应<br>
- **事件总线（Event Bus）**：负责管理事件的注册和触发，解耦发布者和订阅者<br>

### 2.2 手写示例代码

```js
class EventEmitter {
  constructor() {
    this.events = {}; // 存储事件及对应回调函数列表
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(fn => fn !== callback);
  }

  // 触发事件
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(fn => {
      fn.apply(null, args);
    });
  }

  // 订阅一次事件，触发后自动取消
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback.apply(null, args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}
````

### 2.3 代码说明

* 使用一个对象 `events` 维护事件名和对应的回调函数数组
* `on` 方法实现事件订阅，往事件列表添加回调
* `off` 方法实现事件解绑，过滤掉指定回调
* `emit` 方法触发事件，调用所有订阅该事件的回调，并传递参数
* `once` 方法包装回调，保证回调只执行一次，执行后自动解绑

---

## 三、常见误区或面试陷阱

* 忽略解绑功能，导致内存泄漏
* 不支持事件参数传递，限制灵活性
* 在 `emit` 过程中修改事件数组导致遍历异常
* 忘记绑定 `this`，导致回调函数上下文丢失

</details>

## 9. React setState合并机制 {#question-subjective-b2240f39d970}

### 题目要点

* React 对 `setState` 进行批量合并，避免重复渲染
* 类组件 `setState` 采用浅合并，函数组件 `useState` 不自动合并
* 多个 `setState` 合并时，基于调用时的状态快照（对象形式可能丢失更新）
* 使用函数形式 `setState` 避免状态丢失和竞态问题
* React 18 引入了自动批处理，覆盖更多场景

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 中 `setState` 的异步与同步行为<br>
- 掌握批量合并状态更新（批处理）的原理和适用场景<br>
- 区分类组件和函数组件中状态更新的差异<br>
- 理解合并状态时的浅合并策略及其影响<br>
- 掌握如何避免状态更新陷阱（如状态丢失、竞态）<br>

---

## 二、参考答案

### 2.1 核心概念说明

- **setState 的合并**：React 会将多个同一生命周期或同一事件处理函数中的 `setState` 调用合并成一次更新，提高性能，避免不必要的重复渲染<br>
- **批处理（Batching）**：React 在事件回调等“合成事件”期间，会收集多次状态更新，批量执行，最终合并渲染<br>
- **异步更新**：`setState` 并不立即更新状态，而是异步合并，避免多次同步执行导致性能损耗<br>
- **浅合并**：对于类组件，`setState` 是对状态对象的浅合并，不会递归合并嵌套对象<br>

### 2.2 机制详解

- React 内部维护一个更新队列，将多次 `setState` 调用合并，最后触发一次渲染<br>
- 同一事件循环内多次 `setState` 调用合并为一次状态更新<br>
- 函数组件中使用的 `useState` 钩子更新通常不会合并（除非是 React 18+ 且开启自动批处理）<br>
- 传递给 `setState` 的如果是对象，则与当前状态浅合并；如果是函数，则使用函数返回的新状态更新<br>

### 2.3 示例代码

```jsx
class MyComponent extends React.Component {
  state = { count: 0, nested: { value: 1 } };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    // 实际只会增加 1，因为两次 setState 合并，基于第一次调用时的 state
  };

  handleUpdate = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }));
    this.setState(prevState => ({ count: prevState.count + 1 }));
    // 使用函数形式，能保证每次基于最新状态，最终增加 2
  };

  render() {
    return <button onClick={this.handleClick}>Count: {this.state.count}</button>;
  }
}
````

---

## 三、常见误区或面试陷阱

* 误认为每次 `setState` 都是同步更新，导致读取状态时出现竞态
* 不使用函数形式 `setState` 导致状态更新丢失
* 以为状态是深度合并，实际上是浅合并，嵌套对象直接替换
* 忽略 React 18 函数组件自动批处理的变化
* 混淆类组件和函数组件状态更新机制

</details>

## 10. 为何 setTimeout 中 setState 无法合并 {#question-subjective-c11533aec8a0}

### 题目要点

* React 17 及之前版本，`setTimeout` 中的 `setState` 不批量合并
* 因为 `setTimeout` 不属于 React 合成事件系统，触发同步渲染
* React 18 引入自动批处理，异步环境中也能合并更新
* 理解批处理范围及版本差异，合理组织状态更新

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 中批量更新（批处理）的触发条件<br>
- 掌握同步事件与异步事件中 `setState` 合并机制的差异<br>
- 理解 React 事件系统和浏览器原生事件对状态更新的影响<br>
- 理解 React 版本对自动批处理的支持变化<br>

---

## 二、参考答案

### 2.1 核心原理说明

- React 的 **批量更新机制**（批处理）默认只在 **React 合成事件** 和生命周期函数中生效<br>
- `setTimeout`、`Promise.then`、原生事件等异步回调不属于 React 事件系统范围<br>
- 在这些异步环境中调用 `setState`，React 会立即触发状态更新和渲染，不会批量合并<br>
- 因此，`setTimeout` 中的多次 `setState` 会被视为独立更新，不能合并<br>
- React 18 引入了 **自动批处理（Automatic Batching）**，扩展了批处理范围，支持 `setTimeout` 等异步回调中的合并<br>

### 2.2 示例说明

```jsx
class MyComponent extends React.Component {
  state = { count: 0 };

  componentDidMount() {
    // 异步环境，setTimeout 中调用 setState，默认不合并
    setTimeout(() => {
      this.setState({ count: this.state.count + 1 });
      this.setState({ count: this.state.count + 1 });
      // 结果：count 增加 2 次，触发两次渲染
    }, 0);

    // 同步环境，React 合成事件或生命周期内调用 setState 合并
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    // 结果：count 只增加 1，合并成一次更新
  }

  render() {
    return <div>Count: {this.state.count}</div>;
  }
}
````

### 2.3 React 18 变化

* React 18 默认开启自动批处理，批处理范围扩展到所有异步任务，包括 `setTimeout`、`Promise`、原生事件等
* 这意味着 React 18+ 中 `setTimeout` 里的多次 `setState` 会自动合并，提升性能

---

## 三、常见误区或面试陷阱

* 误认为所有环境下 `setState` 都会自动批量合并
* 忽略 React 版本对批处理策略的影响
* 混淆 React 合成事件与原生事件对批处理的支持差异
* 未理解批处理对性能优化的重要性

</details>

## 11. 事件循环中批处理何时重置 {#question-subjective-61dfb701201a}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 12. React 18 自动批处理对 Promise 和 setTimeout 的行为变化 {#question-subjective-f1e6ada241e7}

### 题目要点

* React 17 及以前，`setTimeout`、`Promise` 中的 `setState` 不会合并
* React 18 引入自动批处理，扩展了批处理范围到所有异步任务
* 多次状态更新自动合并，触发一次渲染，性能提升明显
* 开发时可放心在异步回调中多次调用 `setState`，减少优化成本

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解 React 18 中自动批处理（Automatic Batching）的概念和作用<br>
- 掌握 React 17 及之前版本批处理机制的局限<br>
- 分析 Promise 和 setTimeout 异步场景中状态更新的合并差异<br>
- 了解自动批处理对性能优化和渲染次数的影响<br>

---

## 二、参考答案

### 2.1 版本前后的批处理机制差异

| 版本          | 批处理范围                                               |
|---------------|----------------------------------------------------------|
| React 17 及以前 | 仅限于 React 合成事件和生命周期方法内的状态更新           |
| React 18       | 扩展到所有异步任务（包括 Promise、setTimeout、原生事件等） |

### 2.2 核心概念说明

- **批处理（Batching）**：将多次状态更新合并为一次渲染，避免重复渲染，提升性能<br>
- React 17 之前，异步任务（如 `setTimeout`、`Promise.then`）中的多次 `setState` 是分开触发渲染的，不会合并<br>
- React 18 引入自动批处理，能在更多异步环境中合并更新，包括 `Promise` 和 `setTimeout` 回调<br>

### 2.3 具体行为变化示例

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // React 17 中，这两个 setState 会触发两次渲染
    setTimeout(() => {
      setCount(c => c + 1);
      setCount(c => c + 1);
    }, 0);

    // React 17 中，这两个 setState 也会触发两次渲染
    Promise.resolve().then(() => {
      setCount(c => c + 1);
      setCount(c => c + 1);
    });
  }, []);

  return <div>Count: {count}</div>;
}
````

* **React 17 行为**

  * `setTimeout` 回调内两次更新分别触发两次渲染
  * `Promise.then` 内同样分别触发两次渲染

* **React 18 行为**

  * `setTimeout` 和 `Promise.then` 回调内多次状态更新都会被自动批处理合并，触发一次渲染

### 2.4 优势及影响

* 减少不必要的重复渲染，提高性能
* 简化开发者对状态更新的管理，避免手动合并状态
* 使异步场景下的状态更新行为更加一致

---

## 三、常见误区或面试陷阱

* 误认为所有版本的 React 都支持自动批处理
* 不了解 `setTimeout` 和 `Promise` 的异步特性对渲染次数的影响
* 忽视批处理带来的性能提升，误以为多次 `setState` 会都触发渲染
* 忽略需要 React 18 及以上版本支持自动批处理

</details>

## 13. 算法：扁平数组转树形结构 {#question-subjective-4df551b5331d}

```js
const data = [
  { id: 1, name: 'A', parentId: null },
  { id: 2, name: 'B', parentId: 1 }
];
```

### 题目要点

* 利用 Map 快速定位节点，避免重复查找
* 两次遍历：一次建 Map，一次挂载 children
* 以 `parentId === null` 判定根节点
* 保证返回的结构是根节点数组，且每个节点有 `children` 属性

<details>
<summary>参考答案</summary>

## 一、考察点

- 理解树形结构与扁平结构的关系及转换原理<br>
- 掌握利用哈希表（Map）提升父子关系查找效率<br>
- 熟悉递归或迭代构建树形结构的方法<br>
- 掌握边界条件处理（如根节点识别、无父节点情况）<br>

---

## 二、参考答案

### 2.1 核心原理说明

- 扁平数组每个元素包含唯一 `id` 和指向父节点的 `parentId`<br>
- 通过先遍历数组建立一个以 `id` 为键的 Map，快速定位每个节点<br>
- 再次遍历数组，找出每个节点的父节点，并把当前节点挂载到父节点的 `children` 数组中<br>
- `parentId` 为 `null` 的节点即为根节点<br>
- 最终返回根节点集合，即构建好的树形结构<br>

### 2.2 具体实现代码

```js
function flatToTree(data) {
  const idMap = new Map();
  const result = [];

  // 第一次遍历，初始化所有节点，并放入 Map
  data.forEach(item => {
    idMap.set(item.id, { ...item, children: [] });
  });

  // 第二次遍历，构建父子关系
  data.forEach(item => {
    const node = idMap.get(item.id);
    if (item.parentId === null) {
      // 根节点
      result.push(node);
    } else {
      const parentNode = idMap.get(item.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return result;
}

// 示例数据
const data = [
  { id: 1, name: 'A', parentId: null },
  { id: 2, name: 'B', parentId: 1 }
];

console.log(flatToTree(data));
````

### 2.3 说明

* 该方案时间复杂度为 O(n)，空间复杂度为 O(n)
* 充分利用 Map 查找父节点，提高效率
* 结果中每个节点增加 `children` 属性，便于树形遍历和渲染
* 适用于不限层级的树形结构构建

---

## 三、常见误区或面试陷阱

* 直接在遍历时嵌套查找父节点，导致 O(n²) 复杂度
* 忽略 `parentId` 可能为 `null` 或不存在的情况
* 结果中忘记初始化 `children`，导致后续访问报错
* 误将根节点判定错误或未返回根节点集合

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-63/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-63/round-102/index.md" >}}) →
