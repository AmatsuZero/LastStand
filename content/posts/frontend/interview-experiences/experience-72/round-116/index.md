+++
title = "百度-用户增长-秋招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/72"
experienceId = 72
roundId = 116
roundOrder = 1
company = "百度"
date = "2025-08-21T15:39:11.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-72/_index.md" >}}) · 已是最后一轮 →

本轮共 20 道题。答案默认折叠，便于先自行作答。

## 1. 有没有使用 Node.js 进行开发的经历？ {#question-subjective-7266893b44e3}

### 题目要点

**“不仅仅用过 Node.js，而且能说清楚在前端团队里它解决了哪些实际问题，产生了什么价值。”**
这样比单纯回答“用过/没用过”更有亮点。

<details>
<summary>参考答案</summary>

考察的核心是：**对 Node.js 的理解深度**和**在前端/全栈中的实际应用场景**。

回答时可以从以下几个角度展开：

---

### 1. 使用场景

* **前端工程化工具链**：
  使用 Node.js 驱动构建工具（Webpack、Vite、Rollup 等），编写脚本实现自动化构建、代码检查、Mock Server 搭建。
* **服务端接口开发**：
  基于 Express、Koa、NestJS 搭建轻量级 API 服务，用于前后端分离项目的接口模拟或小型后台系统。
* **中间层 / BFF（Backend for Frontend）**：
  在复杂业务中，用 Node.js 实现前后端解耦，比如统一处理接口聚合、鉴权、缓存。
* **SSR / SSG 场景**：
  使用 Next.js 或 Nuxt.js，借助 Node.js 渲染首屏，提升 SEO 和加载体验。
* **运维与脚本**：
  编写部署脚本、自动生成文件、批量处理数据。

---

### 2. 具体任务

可以结合自身经历强调：

* 是否搭建过 Mock 服务，辅助前后端并行开发；
* 是否写过中间层解决跨域、接口聚合问题；
* 是否在工程化中写过 Node.js 工具脚本（如自动生成路由表、埋点收集脚本）；
* 是否参与过服务端渲染或静态站点生成相关开发。

---

### 3. 收获和亮点

* 对 **事件驱动、非阻塞 I/O** 有更深理解，能写出高并发场景下的稳定服务；
* 学会了在前端视角下如何更好地和后端衔接；
* 在实际项目中通过 Node.js 提升了团队的开发效率（例如通过脚本工具减少重复劳动）。

</details>

## 2. CSS 3D 变形有哪些常见的属性和方法？ {#question-subjective-84f9eb35b071}

### 题目要点

CSS 3D 变形（3D Transform）是 CSS3 提供的一组属性，用来在三维空间中对元素进行旋转、缩放、平移、倾斜等操作。

<details>
<summary>参考答案</summary>

CSS 3D 变形（3D Transform）是 CSS3 提供的一组属性，用来在三维空间中对元素进行旋转、缩放、平移、倾斜等操作。

以下是常见的属性和方法整理：

---

### **一、3D 变形的核心属性**

1. **`transform`**

   * 用于指定具体的变形方法，可以组合多个。
   * 常见函数：

     * **`translate3d(x, y, z)`**：沿 x/y/z 轴移动。
     * **`translateZ(z)`**：沿 z 轴移动。
     * **`scale3d(x, y, z)`**：在 x/y/z 轴方向缩放。
     * **`scaleZ(z)`**：只在 z 轴缩放。
     * **`rotate3d(x, y, z, angle)`**：绕指定的向量旋转。
     * **`rotateX(angle)`**：绕 x 轴旋转。
     * **`rotateY(angle)`**：绕 y 轴旋转。
     * **`rotateZ(angle)`**：绕 z 轴旋转（和 2D 的 rotate 类似）。
     * **`perspective(n)`**：定义透视效果（一般不用在 transform 中单独写，而是用下面的 `perspective` 属性）。

---

### **二、3D 相关的辅助属性**

1. **`transform-style`**

   * 控制子元素是否保留 3D 变形。
   * 常用值：

     * `flat`：子元素在 2D 平面中呈现（默认）。
     * `preserve-3d`：子元素保留 3D 效果。

2. **`perspective`**

   * 定义观察者到 z=0 平面的距离，影响 3D 元素的透视效果。
   * 值越小，透视感越强（近大远小更明显）。
   * 一般加在父容器上。

3. **`perspective-origin`**

   * 定义观察点的位置（类似于透视的“视角”）。
   * 默认值：`50% 50%`（容器中心）。

4. **`backface-visibility`**

   * 定义当元素背面朝向观察者时是否可见。
   * 常用值：

     * `visible`：背面可见（默认）。
     * `hidden`：背面不可见（常用于翻转卡片效果）。

---

### **三、常见的 3D 效果场景**

1. **3D 旋转卡片（翻转效果）**

   * 利用 `rotateY(180deg)` + `backface-visibility: hidden`。

2. **3D 轮播图（旋转木马效果）**

   * 利用多个元素绕 `rotateY` 或 `rotateX` 均匀分布。

3. **立体盒子**

   * 利用 `translateZ` 和 `rotateX/rotateY` 组合出不同面的立体效果。

</details>

## 3. 你都了解哪些 CSS 布局技术？它们各自的特点和适用场景是什么？ {#question-d2128d55-6549-40d4-9e45-55c020437b8c}

> 题库原题：[你都了解哪些 CSS 布局技术？它们各自的特点和适用场景是什么？](https://fe.ecool.fun/topic/d2128d55-6549-40d4-9e45-55c020437b8c)

### 题目要点

* **Flexbox** → 一维布局，居中和伸缩简单。
* **Grid** → 二维布局，复杂页面结构更直观。
* **传统布局** → 兼容性好，但灵活性和可维护性差。
* 实际项目中常结合多种布局方式，例如 Grid + Flex 组合实现响应式页面。

<details>
<summary>参考答案</summary>

在前端开发中，CSS 布局技术是核心能力，不同技术各有特点和适用场景。主要可以分为 **传统布局**、**弹性布局** 和 **现代布局** 三大类。

---

## 1. **传统布局**

### （1）块级布局（Block Layout）

* 基于文档流，块级元素默认垂直排列。
* 特点：

  * 容器高度由内容撑开。
  * 水平排列需要浮动或 `inline-block` 配合。
* 适用场景：

  * 文本内容、文章流式布局。
  * 简单的结构页面，兼容老浏览器。

### （2）浮动布局（Float Layout）

```css
.left { float: left; width: 200px; }
.right { float: right; width: 200px; }
```

* 特点：

  * 元素脱离普通文档流，占据左右空间。
  * 需要清除浮动 (`clearfix`) 以避免容器高度塌陷。
* 适用场景：

  * 早期多栏布局。
  * 图文环绕、简单侧边栏布局。

### （3）定位布局（Position Layout）

* `position: static | relative | absolute | fixed | sticky`
* 特点：

  * 脱离文档流或相对位置偏移。
  * 可以实现重叠、固定位置或粘性滚动效果。
* 适用场景：

  * 弹窗、工具提示、固定导航栏。

---

## 2. **弹性布局（Flexbox）**

```css
.container {
  display: flex;
  justify-content: center; /* 主轴对齐 */
  align-items: center;     /* 侧轴对齐 */
}
```

* 特点：

  * 一维布局（主轴/交叉轴），可控制排列方向和对齐方式。
  * 子元素大小可以自适应、分配剩余空间。
  * 可以轻松实现居中、间距分布、响应式伸缩。
* 适用场景：

  * 水平或垂直居中。
  * 导航菜单、按钮组、列表项等一维布局场景。

---

## 3. **现代布局（CSS Grid）**

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 100px auto;
  gap: 10px;
}
```

* 特点：

  * 二维布局（行 + 列）能力强。
  * 可以显式定义行列大小、间距和区域命名。
  * 支持复杂的响应式布局。
* 适用场景：

  * 页面整体布局（头部、侧边栏、内容区、底部）。
  * 表格型布局、网格画廊、仪表盘等。

---

## 4. **其他布局方式**

* **多列布局（Multi-column Layout）**

  * `column-count` / `column-width`
  * 将内容自动分成多列，类似报纸排版。
* **表格布局（Table Layout）**

  * `display: table | table-row | table-cell`
  * 适合数据表格或等高布局场景。
* **CSS Shapes / Float + Shape**

  * 用于文字环绕图片或不规则形状布局。

---

## 5. **对比总结**

| 布局方式    | 轴向 | 灵活性 | 易用性 | 适用场景               |
| ------- | -- | --- | --- | ------------------ |
| 块级布局    | 垂直 | 低   | 高   | 文章流式布局             |
| 浮动布局    | 水平 | 中   | 中   | 早期多栏、图文环绕          |
| 定位布局    | 任意 | 高   | 中   | 弹窗、固定元素            |
| Flexbox | 一维 | 高   | 高   | 导航、按钮组、列表、居中       |
| Grid    | 二维 | 高   | 中   | 仪表盘、复杂页面网格、响应式整体布局 |
| 多列布局    | 水平 | 中   | 高   | 报纸、杂志排版            |
| 表格布局    | 二维 | 中   | 中   | 数据表格、等高布局          |

</details>

## 4. 如何使用 Flex 布局实现子元素的横向和纵向居中？ {#question-subjective-9962890d7b29}

### 题目要点

核心考查：如何使用 Flex 布局实现子元素的横向和纵向居中？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```html
<div class="parent">
  <div class="child">居中</div>
</div>
```

```css
.parent {
  display: flex;              /* 启用 Flex 布局 */
  justify-content: center;    /* 主轴（水平方向）居中 */
  align-items: center;        /* 交叉轴（垂直方向）居中 */

  width: 400px;
  height: 300px;
  border: 1px solid #000;
}

.child {
  width: 100px;
  height: 50px;
  background: lightblue;
}
```

### 解释：

1. **`justify-content: center;`**
   控制 **水平方向（主轴）** 的排列，让子元素居中。

2. **`align-items: center;`**
   控制 **垂直方向（交叉轴）** 的排列，让子元素居中。

这样，子元素会在父容器中 **水平 + 垂直居中**。

</details>

## 5. 说说你对盒子模型的理解 {#question-dc607f56-c467-4cc2-8a0a-c79d498bee49}

> 题库原题：[说说你对盒子模型的理解](https://fe.ecool.fun/topic/dc607f56-c467-4cc2-8a0a-c79d498bee49)

### 题目要点

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）

<details>
<summary>参考答案</summary>

## 一、是什么

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）

一个盒子由四个部分组成：`content`、`padding`、`border`、`margin`

![](https://static.ecool.fun//article/a2dd1ae4-1031-4391-b320-3d65c1fffb49.png)\r\n\r\n`content`，即实际内容，显示文本和图像

* `boreder`，即边框，围绕元素内容的内边距的一条或多条线，由粗细、样式、颜色三部分组成
* `padding`，即内边距，清除内容周围的区域，内边距是透明的，取值不能为负，受盒子的`background`属性影响
* `margin`，即外边距，在元素外创建额外的空白，空白通常指不能放其他元素的区域

上述是一个从二维的角度观察盒子，下面再看看看三维图：

![](https://static.ecool.fun//article/ade993de-6cb6-45e6-8750-7018df905d14.png)

下面来段代码：
```html
<style>
.box {
    width: 200px;
    height: 100px;
    padding: 20px;
}
</style>

<div class=\"box\">
盒子模型
</div>
```

当我们在浏览器查看元素时，却发现元素的大小变成了`240px`

这是因为，在`CSS`中，盒子模型可以分成：

- W3C 标准盒子模型
- IE 怪异盒子模型

默认情况下，盒子模型为`W3C` 标准盒子模型

## 二、标准盒子模型

标准盒子模型，是浏览器默认的盒子模型

下面看看标准盒子模型的模型图：

![](https://static.ecool.fun//article/bb71712f-4d36-49cc-a180-b08f4a536b9e.png)

从上图可以看到：

- 盒子总宽度 = width + padding + border + margin;
- 盒子总高度 = height + padding + border + margin

也就是，`width/height` 只是内容高度，不包含 `padding` 和 `border `值

所以上面问题中，设置`width`为200px，但由于存在`padding`，但实际上盒子的宽度有240px

## 三、IE 怪异盒子模型

同样看看IE 怪异盒子模型的模型图：

![](https://static.ecool.fun//article/39712bfa-735c-404d-9cfb-78a9873b0e38.png)

从上图可以看到：

- 盒子总宽度 = width + margin;
- 盒子总高度 = height + margin;

也就是，`width/height` 包含了 `padding `和 `border `值

## Box-sizing

CSS 中的 box-sizing 属性定义了引擎应该如何计算一个元素的总宽度和总高度

语法：

```css
box-sizing: content-box|border-box|inherit;
```

- content-box 默认值，元素的 width/height 不包含padding，border，与标准盒子模型表现一致
- border-box 元素的 width/height 包含 padding，border，与怪异盒子模型表现一致
- inherit 指定 box-sizing 属性的值，应该从父元素继承

回到上面的例子里，设置盒子为 border-box 模型

```html
<style>
.box {
    width: 200px;
    height: 100px;
    padding: 20px;
    box-sizing: border-box;
}
</style>
<div class=\"box\">
盒子模型
</div>
```

这时候，就可以发现盒子的所占据的宽度为200px

</details>

## 6. JavaScript 中有哪些基本数据类型？它们分别占用多少内存空间？ {#question-subjective-17065ebe2921}

### 题目要点

在 **JavaScript** 中，基本数据类型（Primitive Types）一共有 **7 种**（ES6+ 增加了 `Symbol`，ES2020 又增加了 `BigInt`），分别是：

<details>
<summary>参考答案</summary>

在 **JavaScript** 中，基本数据类型（Primitive Types）一共有 **7 种**（ES6+ 增加了 `Symbol`，ES2020 又增加了 `BigInt`），分别是：

1. **Undefined**

   * 只有一个值：`undefined`
   * 内存占用：在大多数实现中，用一个机器字（通常是 **4 字节**）存储。

2. **Null**

   * 只有一个值：`null`
   * 内存占用：在规范中并未严格规定，V8 等引擎里通常也是 **4 字节**，底层常用 `0x00` 来表示。

3. **Boolean**

   * 两个值：`true` / `false`
   * 内存占用：通常用 **4 字节**（一个字大小）来存储，但逻辑上只需 1 bit。

4. **Number**

   * 双精度浮点数（IEEE 754 标准的 64 位浮点数）
   * 内存占用：**8 字节**（64 位）。
   * 表示范围：

     * 最大安全整数：`Number.MAX_SAFE_INTEGER = 2^53 - 1`
     * 最小安全整数：`Number.MIN_SAFE_INTEGER = -(2^53 - 1)`

5. **BigInt**（ES2020 新增）

   * 任意精度整数
   * 内存占用：不固定，取决于数值大小（引擎内部动态分配）。

6. **String**

   * 由 UTF-16 编码的字符序列组成
   * 内存占用：每个字符 **2 字节**（UTF-16），所以字符串长度为 `n` 时，大约占用 `2n` 字节。
   * 例：`"abc"` → 3 个字符 → **6 字节**。

7. **Symbol**（ES6 新增）

   * 唯一且不可变的值，用来作为对象属性的标识符
   * 内存占用：具体大小未在规范中规定，通常由引擎内部实现（可视作指针引用，一般 **4-8 字节**）。

</details>

## 7. 数据类型检测的方式有哪些？ {#question-74d6fe86-2acf-4b0c-a588-0738302ced01}

> 题库原题：[数据类型检测的方式有哪些？](https://fe.ecool.fun/topic/74d6fe86-2acf-4b0c-a588-0738302ced01)

### 题目要点

| 方法                                 | 适用场景                      | 优点   | 缺点                             |
| ---------------------------------- | ------------------------- | ---- | ------------------------------ |
| `typeof`                           | 基本类型                      | 简单直观 | 不能区分 `null` / `object`，数组/对象混淆 |
| `instanceof`                       | 引用类型（Array, Date, RegExp） | 语义直观 | 跨 iframe 不可靠，基本类型无效            |
| `Object.prototype.toString.call()` | 通用方式                      | 最准确  | 语法繁琐                           |
| `Array.isArray()`                  | 判断数组                      | 语义清晰 | 功能单一                           |
| `constructor`                      | 简单对象/数组                   | 直观   | 可被篡改，`null/undefined` 无法用      |
| `Object.is()`                      | 判断特殊值相等性                  | 精确   | 不是专门的类型判断                      |

<details>
<summary>参考答案</summary>

## 1. `typeof`

```ts
console.log(typeof 123);      // "number"
console.log(typeof 'abc');    // "string"
console.log(typeof true);     // "boolean"
console.log(typeof undefined);// "undefined"
console.log(typeof Symbol()); // "symbol"
console.log(typeof 123n);     // "bigint"
console.log(typeof {});       // "object"
console.log(typeof []);       // "object"
console.log(typeof null);     // "object" (历史遗留问题)
console.log(typeof (()=>{}));// "function"
```

**优点**：

* 语法简单，适合判断 **基本类型**。
* 直接内置操作符，无需额外依赖。

**缺点**：

* 不能区分 `null` 和 `object`。
* 数组和对象都返回 `"object"`。
* 无法精确区分更多复杂对象（如 `Date`、`RegExp` 等）。

---

## 2. `instanceof`

```ts
console.log([] instanceof Array);     // true
console.log({} instanceof Object);    // true
console.log(/abc/ instanceof RegExp); // true
console.log(new Date() instanceof Date); // true
```

**优点**：

* 能判断对象是否由某个构造函数创建。
* 适合区分 `Array`、`Date`、`RegExp` 等引用类型。

**缺点**：

* **原型链判断**，在跨 iframe / 跨 realm 场景下可能失效（因为全局环境不同）。
* 对基本类型无效（如 `123 instanceof Number // false`）。

---

## 3. `Object.prototype.toString.call()`

```ts
console.log(Object.prototype.toString.call(123));     // "[object Number]"
console.log(Object.prototype.toString.call('abc'));   // "[object String]"
console.log(Object.prototype.toString.call(null));    // "[object Null]"
console.log(Object.prototype.toString.call(undefined));// "[object Undefined]"
console.log(Object.prototype.toString.call([]));      // "[object Array]"
console.log(Object.prototype.toString.call({}));      // "[object Object]"
console.log(Object.prototype.toString.call(new Date));// "[object Date]"
```

**优点**：

* 最准确、最通用的方式。
* 可以区分各种内置对象，包括 `null` 和 `undefined`。
* 在跨环境中仍然可靠。

**缺点**：

* 语法相对冗长，不够简洁。

---

## 4. `Array.isArray()`

```ts
console.log(Array.isArray([]));  // true
console.log(Array.isArray({}));  // false
```

**优点**：

* 专门判断数组，语义清晰，推荐用来判断是否为数组。

**缺点**：

* 只能判断数组，功能单一。

---

## 5. `constructor`

```ts
console.log((123).constructor === Number);  // true
console.log('abc'.constructor === String);  // true
console.log([].constructor === Array);      // true
console.log({}.constructor === Object);     // true
```

**优点**：

* 简单，直观。

**缺点**：

* `null` 和 `undefined` 没有 `constructor` 属性，会报错。
* 如果对象的 `constructor` 被改写，结果可能不可靠。
* 跨 iframe 环境可能不准确。

---

## 6. `Object.is()`

虽然不是专门判断类型的方法，但在判断 **值是否相等**（尤其是区分 `NaN`、`+0` 和 `-0`）时很有用：

```ts
console.log(Object.is(NaN, NaN));   // true
console.log(Object.is(+0, -0));     // false
console.log(Object.is(0, -0));      // false
```

**优点**：

* 更准确的相等性比较。

**缺点**：

* 不是专门用于判断类型，而是辅助判断特殊值。

</details>

## 8. 分别写出判断一个变量是否为数组、是否为对象的代码，并解释其中的原理和判断依据。 {#question-subjective-596de6240a91}

### 题目要点

* **判断数组**：首选 `Array.isArray()`，兼容性要求高时可用 `Object.prototype.toString.call()`。
* **判断对象**：首选 `Object.prototype.toString.call(obj) === "[object Object]"`，需要严格区分时可写 `isPlainObject`。

<details>
<summary>参考答案</summary>

## 1. 判断一个变量是否为数组

### 常见写法

```js
// 方法一：Array.isArray()
Array.isArray(arr); // 推荐写法

// 方法二：Object.prototype.toString.call()
Object.prototype.toString.call(arr) === "[object Array]";

// 方法三：instanceof
arr instanceof Array;
```

### 原理解释

1. **Array.isArray()**

   * ES5 新增的方法，用来准确判断变量是否为数组。
   * 内部通过 `[[Class]]` 属性判断，返回 `true/false`。
   * 推荐使用，最直观、最安全。

2. **Object.prototype.toString.call()**

   * 所有对象调用 `Object.prototype.toString` 都会返回形如 `"[object Type]"` 的字符串。
   * 数组会返回 `"[object Array]"`。
   * 优点：可以区分几乎所有内置对象（`Object`、`Date`、`RegExp`、`Function` 等）。
   * 常用于类型判断。

3. **instanceof**

   * 判断某个对象的原型链上是否能找到构造函数的 `prototype`。
   * `arr instanceof Array` → true。
   * 缺点：跨 iframe / 跨 window 环境时失效，因为不同上下文中的 `Array` 构造函数不一样。

---

## 2. 判断一个变量是否为对象（严格意义上的纯对象）

### 常见写法

```js
// 方法一：typeof + 非 null + 非数组
typeof obj === "object" && obj !== null && !Array.isArray(obj);

// 方法二：Object.prototype.toString.call()
Object.prototype.toString.call(obj) === "[object Object]";

// 方法三：自定义 isPlainObject
function isPlainObject(val) {
  if (Object.prototype.toString.call(val) !== "[object Object]") {
    return false;
  }
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}
```

### 原理解释

1. **typeof**

   * `typeof` 对普通对象返回 `"object"`。
   * 但注意：`null` 也会返回 `"object"`（历史遗留 bug）。
   * 所以需要 `obj !== null`。
   * 同时数组、日期、正则等也是 `"object"`，所以需要排除 `Array.isArray()`。

2. **Object.prototype.toString.call()**

   * 只有普通对象会返回 `"[object Object]"`。
   * 比 typeof 更精确。

3. **isPlainObject**

   * 判断是否是通过 `{}` 或 `new Object()` 创建的对象。
   * 原理：检查对象的原型是不是 `Object.prototype` 或 `null`。
   * 这样可以排除 `Date`、`RegExp` 等特殊对象。

</details>

## 9. 详细讲一下 Symbol 数据类型特征与实际使用案例？ {#question-675f2f01-6304-49e6-aacc-71d754fcb7d4}

> 题库原题：[详细讲一下 Symbol 数据类型特征与实际使用案例？](https://fe.ecool.fun/topic/675f2f01-6304-49e6-aacc-71d754fcb7d4)

### 题目要点

`Symbol` 提供了一种创建唯一标识符的方法，解决了对象属性名冲突的问题，并可用于定义特定的对象行为。它具有唯一性、不可变性和隐私性，在现代 JavaScript 编程中，用于增强对象和类的功能，定义和处理内置对象的特殊行为，以及在应用中创建更健壮的代码。

<details>
<summary>参考答案</summary>

`Symbol` 是 ES6 引入的一种基本数据类型，它用于创建唯一且不可变的值。它主要用于解决对象属性的命名冲突问题。以下是 `Symbol` 的主要特征和实际使用案例：

### **1. 特征**

**1.1 唯一性**

每个 `Symbol` 值都是唯一的，即使它们具有相同的描述。两个不同的 `Symbol` 对象即使描述相同，也不会相等。

```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');

console.log(sym1 === sym2); // false
```

**1.2 不可变性**

`Symbol` 的值是不可变的，一旦创建，就不能改变。

**1.3 隐私性**

`Symbol` 属性不容易与其他属性冲突，因为每个 `Symbol` 都是唯一的。它们不会被 `for...in` 循环、`Object.keys()` 或 `JSON.stringify()` 处理，但可以通过 `Object.getOwnPropertySymbols()` 获取。

### **2. 创建 Symbol**

使用 `Symbol()` 函数创建 Symbol：

```javascript
const sym = Symbol('description');
console.log(sym); // Symbol(description)
```

### **3. 实际使用案例**

**3.1 用作对象属性的唯一标识符**

`Symbol` 可以用作对象的属性键，避免属性名冲突。

```javascript
const mySymbol = Symbol('uniqueProperty');

const obj = {
  [mySymbol]: 'value'
};

console.log(obj[mySymbol]); // 'value'
```

**3.2 定义私有对象属性**

使用 `Symbol` 可以定义对象的“私有”属性，这些属性不会被意外覆盖或枚举到。

```javascript
const privateProp = Symbol('private');

class MyClass {
  constructor(value) {
    this[privateProp] = value;
  }

  getPrivate() {
    return this[privateProp];
  }
}

const instance = new MyClass('secret');
console.log(instance.getPrivate()); // 'secret'
console.log(instance[privateProp]); // 'secret' (if you have the Symbol reference)
```

**3.3 定义和使用内置对象的符号属性**

JavaScript 内置对象（如 `Object`, `Array`, `String` 等）有一些 Symbol 属性，用于定义特定行为或协议。

- **`Symbol.iterator`**：定义对象的默认迭代器，用于 `for...of` 循环。

```javascript
const iterable = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
};

for (const value of iterable) {
  console.log(value); // 1, 2, 3
}
```

- **`Symbol.toStringTag`**：定义对象的默认字符串表示（`Object.prototype.toString`）。

```javascript
const obj = {
  [Symbol.toStringTag]: 'MyObject'
};

console.log(Object.prototype.toString.call(obj)); // [object MyObject]
```

- **`Symbol.hasInstance`**：自定义 `instanceof` 行为。

```javascript
class MyClass {
  static [Symbol.hasInstance](instance) {
    return instance instanceof Array;
  }
}

console.log([] instanceof MyClass); // true
console.log({} instanceof MyClass); // false
```

- **`Symbol.toPrimitive`**：自定义对象的原始值转换行为。

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return 'string representation';
    if (hint === 'number') return 42;
    return 'default representation';
  }
};

console.log(String(obj)); // 'string representation'
console.log(Number(obj)); // 42
console.log(+obj + 1); // 43
```

### **4. 组合使用**

**4.1 扩展对象的行为**

`Symbol` 还可以与其他 ES6 特性组合使用，例如 Proxy 和 Reflect API 来扩展对象行为。

**示例代码**：

```javascript
const handler = {
  get(target, prop, receiver) {
    if (prop === Symbol.toStringTag) {
      return 'CustomObject';
    }
    return Reflect.get(target, prop, receiver);
  }
};

const proxy = new Proxy({}, handler);
console.log(Object.prototype.toString.call(proxy)); // [object CustomObject]
```

</details>

## 10. JavaScript 中循环有哪些常见方法？它们在遍历不同数据结构时的适用情况如何？ {#question-3957051d-dad2-46df-86bf-3b48cedda28b}

> 题库原题：[JavaScript 中循环有哪些常见方法？它们在遍历不同数据结构时的适用情况如何？](https://fe.ecool.fun/topic/3957051d-dad2-46df-86bf-3b48cedda28b)

### 题目要点

| 方法                          | 适用数据结构                | 是否可提前退出    | 是否返回新值 | 特点            |
| --------------------------- | --------------------- | ---------- | ------ | ------------- |
| `for` / `while`             | 数组、类数组、任意             | ✅          | ❌      | 灵活、可控，效率高     |
| `for...in`                  | 对象（属性遍历）              | ✅          | ❌      | 包含原型链属性，数组不推荐 |
| `for...of`                  | 可迭代对象（数组、Set、Map、字符串） | ✅          | ❌      | 直接拿值，简洁       |
| `forEach`                   | 数组、Set、Map            | ❌          | ❌      | 不能中断，简洁       |
| `map` / `filter` / `reduce` | 数组                    | ❌          | ✅      | 函数式编程，链式调用    |
| `some` / `every`            | 数组                    | ✅（条件满足即退出） | ✅（布尔值） | 条件判断方便        |

要点：
* **操作对象属性** → 用 `for...in`。
* **操作可迭代对象** → 用 `for...of`。
* **数组处理** → 优先用数组方法（`map`、`filter`、`reduce`）。
* **需要最大灵活性** → 用 `for` 或 `while`。

<details>
<summary>参考答案</summary>

在 JavaScript 中，循环方式非常多，不同的数据结构和场景适合使用不同的循环。常见方法主要可以分为 **传统循环**、**for-in / for-of**、**数组专用遍历方法** 三类。

---

## 1. 传统循环

### `for` 循环

```js
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

* **适用场景**：数组、类数组对象，需要索引值或自定义迭代规则时。
* **特点**：灵活，可以随时 `break`、`continue`，可控制起始、步长。

### `while` 循环

```js
let i = 0;
while (i < arr.length) {
  console.log(arr[i]);
  i++;
}
```

* **适用场景**：适合不确定循环次数，只根据条件执行。
* **特点**：写法简洁，可能出现死循环风险。

### `do...while`

```js
let i = 0;
do {
  console.log(arr[i]);
  i++;
} while (i < arr.length);
```

* **适用场景**：至少要执行一次的场景。

---

## 2. `for...in` 和 `for...of`

### `for...in`

```js
const obj = { a: 1, b: 2 };
for (let key in obj) {
  console.log(key, obj[key]);
}
```

* **适用场景**：遍历对象的 **可枚举属性**（含原型链上的）。
* **注意**：不推荐用于数组（顺序不可控，还会遍历自定义属性）。

### `for...of`

```js
const arr = [10, 20, 30];
for (let value of arr) {
  console.log(value);
}
```

* **适用场景**：遍历 **可迭代对象**（数组、字符串、Set、Map、NodeList 等）。
* **特点**：直接拿到值，比 `for...in` 更适合数组。
* **局限**：不能直接遍历普通对象（对象默认不可迭代）。

---

## 3. 数组专用方法

### `forEach`

```js
arr.forEach((value, index) => console.log(index, value));
```

* **适用场景**：数组遍历。
* **特点**：简洁、可读性好。
* **局限**：不能 `break` 或 `return` 提前退出（只能用 `throw` hack）。

### `map`

```js
const doubled = arr.map(v => v * 2);
```

* **适用场景**：需要生成一个新数组时。
* **特点**：返回新数组，不改变原数组。

### `filter`

```js
const evens = arr.filter(v => v % 2 === 0);
```

* **适用场景**：筛选数据。

### `reduce`

```js
const sum = arr.reduce((acc, cur) => acc + cur, 0);
```

* **适用场景**：聚合操作（求和、对象统计、数组扁平化等）。

### `some` / `every`

```js
arr.some(v => v > 10);  // 是否存在大于10的元素
arr.every(v => v > 0);  // 是否所有元素都大于0
```

* **适用场景**：条件判断。

### `find` / `findIndex`

```js
arr.find(v => v > 10);      // 返回第一个符合条件的值
arr.findIndex(v => v > 10); // 返回下标
```

---

## 4. 特殊结构

### `forEach` + `Map` / `Set`

```js
const set = new Set([1, 2, 3]);
set.forEach(v => console.log(v));

const map = new Map([["a", 1], ["b", 2]]);
map.forEach((value, key) => console.log(key, value));
```

### `for...of` 遍历 Map / Set

```js
for (let [key, value] of map) {
  console.log(key, value);
}
```

</details>

## 11. map 和 forEach 有什么区别？ {#question-da41ddaa-57d7-405e-83d8-8cc56fca6ec1}

> 题库原题：[map 和 forEach 有什么区别？](https://fe.ecool.fun/topic/da41ddaa-57d7-405e-83d8-8cc56fca6ec1)

### 题目要点

一些关键的区别：

1. **返回值**：
   - `map`：返回一个新数组，其中的元素是原始数组元素调用提供的函数后的返回值。
   - `forEach`：不返回任何值（或者说返回 `undefined`），它主要用于对数组元素执行副作用操作。

2. **用途**：
   - `map`：当你需要基于原始数组的每个元素生成一个新数组时使用。它常用于数据转换。
   - `forEach`：当你需要对数组的每个元素执行某些操作，但不关心返回值时使用。它常用于执行副作用，如日志记录、事件处理等。

3. **链式调用**：
   - `map`：由于它返回一个新数组，因此可以与其他数组方法（如 `filter`、`reduce`）链式调用。
   - `forEach`：由于它不返回新数组，因此不能与数组方法链式调用。

4. **语法**：
   - `map`：接受一个函数作为参数，该函数定义了如何转换每个元素。
   - `forEach`：也接受一个函数作为参数，该函数定义了对每个元素执行的操作。

5. **参数**：
   - `map` 和 `forEach` 都接受三个参数：当前元素、元素索引和整个数组。但 `map` 返回的是新数组，而 `forEach` 不返回任何值。

7. **性能**：
   - 在某些情况下，`forEach` 可能比 `map` 稍快，因为它不需要创建和返回新数组。但这种差异通常可以忽略不计，除非在处理非常大的数组。

<details>
<summary>参考答案</summary>

### 定义

我们首先来看一看MDN上对Map和ForEach的定义：

* `forEach()`: 针对每一个元素执行提供的函数(executes a provided function once for each array element)。
* `map()`: 创建一个新的数组，其中每一个元素由调用数组中的每一个元素执行提供的函数得来(creates a new array with the results of calling a provided function on every element in the calling array)。

到底有什么区别呢？`forEach()`方法不会返回执行结果，而是`undefined`。也就是说，`forEach()`会修改原来的数组。而`map()`方法会得到一个新的数组并返回。

### 示例

下方提供了一个数组，如果我们想将其中的每一个元素翻倍，我们可以使用`map`和`forEach`来达到目的。

```js
let arr = [1, 2, 3, 4, 5];
```

#### forEach

注意，`forEach`是不会返回有意义的值的。 我们在回调函数中直接修改`arr`的值。

```js
arr.forEach((num, index) => {
    return arr[index] = num * 2;
});
```

执行结果如下：

```js
// arr = [2, 4, 6, 8, 10]
```

#### map

```js
let doubled = arr.map(num => {
    return num * 2;
});
```

执行结果如下：

```js
// doubled = [2, 4, 6, 8, 10]
```

## 执行速度对比

**jsPref**是一个非常好的网站用来比较不同的JavaScript函数的执行速度。

这里是`forEach()`和`map()`的测试结果：

![](https://static.ecool.fun//article/7a9b71f5-e46a-4d4d-a63b-994786896e85.jpeg)

可以看到，在我到电脑上`forEach()`的执行速度比`map()`慢了70%。每个人的浏览器的执行结果会不一样。你可以使用下面的链接来测试一下: [Map vs. forEach - jsPref](https://jsperf.com/map-vs-foreach-speed-test)。

## 函数式角度的理解

如果你习惯使用函数是编程，那么肯定喜欢使用`map()`。因为`forEach()`会改变原始的数组的值，而`map()`会返回一个全新的数组，原本的数组不受到影响。

## 哪个更好呢？

取决于你想要做什么。

`forEach`适合于你并不打算改变数据的时候，而只是想用数据做一些事情 -- 比如存入数据库或则打印出来。

```javascript
let arr = ['a', 'b', 'c', 'd'];
arr.forEach((letter) => {
    console.log(letter);
});
// a
// b
// c
// d
```

`map()`适用于你要改变数据值的时候。不仅仅在于它更快，而且返回一个新的数组。这样的优点在于你可以使用复合(composition)(map(), filter(), reduce()等组合使用)来玩出更多的花样。

```js
let arr = [1, 2, 3, 4, 5];
let arr2 = arr.map(num => num * 2).filter(num => num > 5);
// arr2 = [6, 8, 10]
```

我们首先使用map将每一个元素乘以2，然后紧接着筛选出那些大于5的元素。最终结果赋值给`arr2`。

## 核心要点

* 能用`forEach()`做到的，`map()`同样可以。反过来也是如此。
* `map()`会分配内存空间存储新数组并返回，`forEach()`不会返回数据。
* `forEach()`允许`callback`更改原始数组的元素。`map()`返回新的数组。

</details>

## 12. 数组 map 方法的参数都有哪些？它们各自代表什么含义？ {#question-subjective-8424436aff8f}

### 题目要点

在 JavaScript 里，`Array.prototype.map` 的回调函数参数一共有三个（外加 `map` 本身可以传入一个 `thisArg`）：

<details>
<summary>参考答案</summary>

在 JavaScript 里，`Array.prototype.map` 的回调函数参数一共有三个（外加 `map` 本身可以传入一个 `thisArg`）：

### 1. 回调函数参数

回调函数的签名是：

```js
array.map(function (currentValue, index, array) {
  // return 新的值
}, thisArg)
```

* **`currentValue`**
  当前正在处理的元素值。
  例如 `arr = [10, 20, 30]`，第一次调用时 `currentValue = 10`。

* **`index`**
  当前元素的索引。
  上例中，第一次调用时 `index = 0`，第二次 `index = 1`，依次类推。

* **`array`**
  调用 `map` 的原始数组本身。
  例如上例中始终都是 `[10, 20, 30]`。
  有些时候会用它来在回调里进行对比或做更复杂的操作。

### 2. `thisArg`

* **`thisArg`**
  可选参数，用来指定回调函数执行时 `this` 的值。
  如果不传，默认是 `undefined`（在严格模式下）或者全局对象（在非严格模式下）。
  通常配合对象方法来使用。

---

### 举个例子

```js
const numbers = [1, 2, 3];

const doubled = numbers.map(function (num, index, arr) {
  console.log(`当前值: ${num}, 索引: ${index}, 原数组: ${arr}`);
  return num * 2;
});

console.log(doubled); // [2, 4, 6]
```

如果加上 `thisArg`：

```js
const multiplier = {
  factor: 3,
};

const tripled = numbers.map(function (num) {
  return num * this.factor;
}, multiplier);

console.log(tripled); // [3, 6, 9]
```

</details>

## 13. 箭头函数和普通函数有啥区别？箭头函数能当构造函数吗？ {#question-71f7613a-3703-4c0c-85c3-d8ad31fac232}

> 题库原题：[箭头函数和普通函数有啥区别？箭头函数能当构造函数吗？](https://fe.ecool.fun/topic/71f7613a-3703-4c0c-85c3-d8ad31fac232)

### 题目要点

什么是箭头函数？

<details>
<summary>参考答案</summary>

## 什么是箭头函数？

ES6中允许使用箭头=>来定义箭头函数，具体语法，我们来看一个简单的例子：

```js
// 箭头函数
let fun = (name) => {
    // 函数体
    return `Hello ${name} !`;
};

// 等同于
let fun = function (name) {
    // 函数体
    return `Hello ${name} !`;
};
```

可以看出，定义箭头函在数语法上要比普通函数简洁得多。箭头函数省去了function关键字，采用箭头=>来定义函数。函数的参数放在=>前面的括号中，函数体跟在=>后的花括号中。

## 箭头函数与普通函数的区别

1、语法更加简洁、清晰

从上面的基本语法示例中可以看出，箭头函数的定义要比普通函数定义简洁、清晰得多，很快捷。

2、箭头函数不会创建自己的this（重要！！深入理解！！）

我们先来看看MDN上对箭头函数this的解释。

> 箭头函数不会创建自己的this，所以它没有自己的this，它只会从自己的作用域链的上一层继承this。

箭头函数没有自己的this，它会捕获自己在定义时（注意，是定义时，不是调用时）所处的外层执行环境的this，并继承这个this值。所以，箭头函数中this的指向在它被定义的时候就已经确定了，之后永远不会改变。

3、箭头函数继承而来的this指向永远不变（重要！！深入理解！！）

上面的例子，就完全可以说明箭头函数继承而来的this指向永远不变。对象obj的方法b是使用箭头函数定义的，这个函数中的this就永远指向它定义时所处的全局执行环境中的this，即便这个函数是作为对象obj的方法调用，this依旧指向Window对象。

4、.call()/.apply()/.bind()无法改变箭头函数中this的指向

.call()/.apply()/.bind()方法可以用来动态修改函数执行时this的指向，但由于箭头函数的this定义时就已经确定且永远不会改变。所以使用这些方法永远也改变不了箭头函数this的指向，虽然这么做代码不会报错。

5、箭头函数不能作为构造函数使用

我们先了解一下构造函数的new都做了些什么？简单来说，分为四步：

① JS内部首先会先生成一个对象；
② 再把函数中的this指向该对象；
③ 然后执行构造函数中的语句；
④ 最终返回该对象实例。

但是！！因为箭头函数没有自己的this，它的this其实是继承了外层执行环境中的this，且this指向永远不会随在哪里调用、被谁调用而改变，所以箭头函数不能作为构造函数使用，或者说构造函数不能定义成箭头函数，否则用new调用时会报错！

6、箭头函数没有自己的arguments

箭头函数没有自己的arguments对象。在箭头函数中访问arguments实际上获得的是外层局部（函数）执行环境中的值。

7、箭头函数没有原型prototype

```js
let sayHi = () => {
    console.log('Hello World !')
};
console.log(sayHi.prototype); // undefined
```

8、箭头函数不能用作Generator函数，不能使用yeild关键字

</details>

## 14. 谈谈对 this 对象的理解 {#question-fe97f51f-1d7d-49b7-acd2-83f345014633}

> 题库原题：[谈谈对 this 对象的理解](https://fe.ecool.fun/topic/fe97f51f-1d7d-49b7-acd2-83f345014633)

### 题目要点

this 对象是 JavaScript 中一个非常特殊的关键字，它在函数执行期间指向一个特定的对象。

## 什么是 `this`？

在 JavaScript 中，`this` 是一个特殊的关键字，它在函数执行期间指向一个对象，这个对象被称为 `this` 的上下文或绑定。

## `this` 的行为

1. **全局上下文**：在全局函数中，`this` 指向全局对象（浏览器中是 `window`）。
2. **方法调用**：当一个函数作为对象的方法被调用时，`this` 指向该对象。
3. **构造函数**：在构造函数中，`this` 指向新创建的对象实例。
4. **事件处理**：在事件处理程序中，`this` 指向接收事件的元素。
5. **箭头函数**：箭头函数没有自己的 `this` 上下文，它会捕获其所在上下文的 `this` 值

<details>
<summary>参考答案</summary>

## 一、定义

函数的 `this` 关键字在 `JavaScript` 中的表现略有不同，此外，在严格模式和非严格模式之间也会有一些差别

在绝大多数情况下，函数的调用方式决定了 `this` 的值（运行时绑定）

`this` 关键字是函数运行时自动生成的一个内部对象，只能在函数内部使用，总指向调用它的对象

举个例子：

```js
function baz() {
    // 当前调用栈是：baz
    // 因此，当前调用位置是全局作用域

    console.log( "baz" );
    bar(); // <-- bar的调用位置
}

function bar() {
    // 当前调用栈是：baz --> bar
    // 因此，当前调用位置在baz中

    console.log( "bar" );
    foo(); // <-- foo的调用位置
}

function foo() {
    // 当前调用栈是：baz --> bar --> foo
    // 因此，当前调用位置在bar中

    console.log( "foo" );
}

baz(); // <-- baz的调用位置
```

同时，`this`在函数执行过程中，`this`一旦被确定了，就不可以再更改

```js
var a = 10;
var obj = {
  a: 20
}

function fn() {
  this = obj; // 修改this，运行后会报错
  console.log(this.a);
}

fn();
```

## 二、绑定规则

根据不同的使用场合，`this`有不同的值，主要分为下面几种情况：

- 默认绑定
- 隐式绑定
- new绑定

- 显示绑定

### 默认绑定

全局环境中定义`person`函数，内部使用`this`关键字

```js
var name = 'Jenny';
function person() {
    return this.name;
}
console.log(person());  //Jenny
```

上述代码输出`Jenny`，原因是调用函数的对象在游览器中位`window`，因此`this`指向`window`，所以输出`Jenny`

注意：

严格模式下，不能将全局对象用于默认绑定，this会绑定到`undefined`，只有函数运行在非严格模式下，默认绑定才能绑定到全局对象

### 隐式绑定

函数还可以作为某个对象的方法调用，这时`this`就指这个上级对象

```js
function test() {
  console.log(this.x);
}

var obj = {};
obj.x = 1;
obj.m = test;

obj.m(); // 1
```

这个函数中包含多个对象，尽管这个函数是被最外层的对象所调用，`this`指向的也只是它上一级的对象

```js
var o = {
    a:10,
    b:{
        fn:function(){
            console.log(this.a); //undefined
        }
    }
}
o.b.fn();
```

上述代码中，`this`的上一级对象为`b`，`b`内部并没有`a`变量的定义，所以输出`undefined`

这里再举一种特殊情况

```js
var o = {
    a:10,
    b:{
        a:12,
        fn:function(){
            console.log(this.a); //undefined
            console.log(this); //window
        }
    }
}
var j = o.b.fn;
j();
```

此时`this`指向的是`window`，这里的大家需要记住，`this`永远指向的是最后调用它的对象，虽然`fn`是对象`b`的方法，但是`fn`赋值给`j`时候并没有执行，所以最终指向`window`

### new绑定

通过构建函数`new`关键字生成一个实例对象，此时`this`指向这个实例对象

```js
function test() {
　this.x = 1;
}

var obj = new test();
obj.x // 1
```

上述代码之所以能过输出1，是因为`new`关键字改变了`this`的指向

这里再列举一些特殊情况：

`new`过程遇到`return`一个对象，此时`this`指向为返回的对象

```js
function fn()
{
    this.user = 'xxx';
    return {};
}
var a = new fn();
console.log(a.user); //undefined
```

如果返回一个简单类型的时候，则`this`指向实例对象

```js
function fn()
{
    this.user = 'xxx';
    return 1;
}
var a = new fn;
console.log(a.user); //xxx
```

注意的是`null`虽然也是对象，但是此时`new`仍然指向实例对象

```js
function fn()
{
    this.user = 'xxx';
    return null;
}
var a = new fn;
console.log(a.user); //xxx
```

### 显示修改

`apply()、call()、bind()`是函数的一个方法，作用是改变函数的调用对象。它的第一个参数就表示改变后的调用这个函数的对象。因此，这时`this`指的就是这第一个参数

```js
var x = 0;
function test() {
　console.log(this.x);
}

var obj = {};
obj.x = 1;
obj.m = test;
obj.m.apply(obj) // 1
```

关于`apply、call、bind`三者的区别，我们后面再详细说

## 三、箭头函数

在 ES6 的语法中还提供了箭头函语法，让我们在代码书写时就能确定 `this` 的指向（编译时绑定）

举个例子：

```js
const obj = {
  sayThis: () => {
    console.log(this);
  }
};

obj.sayThis(); // window 因为 JavaScript 没有块作用域，所以在定义 sayThis 的时候，里面的 this 就绑到 window 上去了
const globalSay = obj.sayThis;
globalSay(); // window 浏览器中的 global 对象
```

虽然箭头函数的`this`能够在编译的时候就确定了`this`的指向，但也需要注意一些潜在的坑

下面举个例子：

绑定事件监听

```js
const button = document.getElementById('mngb');
button.addEventListener('click', ()=> {
    console.log(this === window) // true
    this.innerHTML = 'clicked button'
})
```

上述可以看到，我们其实是想要`this`为点击的`button`，但此时`this`指向了`window`

包括在原型上添加方法时候，此时`this`指向`window`

```js
Cat.prototype.sayName = () => {
    console.log(this === window) //true
    return this.name
}
const cat = new Cat('mm');
cat.sayName()
```

同样的，箭头函数不能作为构建函数

## 四、优先级

### 隐式绑定 VS 显式绑定

```js
function foo() {
    console.log( this.a );
}

var obj1 = {
    a: 2,
    foo: foo
};

var obj2 = {
    a: 3,
    foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

显然，显式绑定的优先级更高

### new绑定 VS 隐式绑定

```js
function foo(something) {
    this.a = something;
}

var obj1 = {
    foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
```

可以看到，new绑定的优先级`>`隐式绑定

### `new`绑定 VS 显式绑定

因为`new`和`apply、call`无法一起使用，但硬绑定也是显式绑定的一种，可以替换测试

```js
function foo(something) {
    this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
```

`bar`被绑定到obj1上，但是`new bar(3)` 并没有像我们预计的那样把`obj1.a`修改为3。但是，`new`修改了绑定调用`bar()`中的`this`

我们可认为`new`绑定优先级`>`显式绑定

综上，new绑定优先级 > 显示绑定优先级 > 隐式绑定优先级 > 默认绑定优先级

</details>

## 15. 解释一下原型、构造函数、实例、原型链 之间的关系？ {#question-818064e8-137a-4499-81f5-554f4890fb55}

> 题库原题：[解释一下原型、构造函数、实例、原型链 之间的关系？](https://fe.ecool.fun/topic/818064e8-137a-4499-81f5-554f4890fb55)

### 题目要点

1. **构造函数**：用于创建对象，并通过其 `prototype` 属性定义原型对象。
2. **原型**：构造函数的 `prototype` 属性指向的对象，包含了所有实例共享的属性和方法。
3. **实例**：通过构造函数创建的对象，每个实例都有一个指向构造函数 `prototype` 的隐式链接（`__proto__`）。
4. **原型链**：通过对象的 `__proto__` 连接构造函数的 `prototype`，形成一个链条，使得实例可以访问其原型以及原型的原型上的属性和方法。

<details>
<summary>参考答案</summary>

在 JavaScript 中，原型、构造函数、实例和原型链是构建和继承对象的核心概念。它们之间的关系如下：

### **1. 原型（Prototype）**

**定义**：每个 JavaScript 对象都有一个原型（`__proto__`），这个原型也是一个对象。原型对象可以包含共享的属性和方法，这些属性和方法可以被所有实例访问。

**作用**：原型用于实现对象的继承。在 JavaScript 中，所有对象都可以从其原型中继承属性和方法。

### **2. 构造函数（Constructor Function）**

**定义**：构造函数是一个用于创建和初始化对象的函数。它通常用 `function` 关键字定义，并且按照首字母大写的命名约定。

**作用**：构造函数用于创建新实例。每个构造函数都有一个 `prototype` 属性，指向一个原型对象。构造函数创建的实例对象可以访问这个原型对象上的属性和方法。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};
```

### **3. 实例（Instance）**

**定义**：实例是通过构造函数创建的对象。每个实例都具有构造函数的原型链上的属性和方法。

**作用**：实例是构造函数创建的具体对象，它可以访问构造函数的原型对象上的属性和方法。

```javascript
const john = new Person('John');
john.sayHello(); // 输出: Hello, my name is John
```

### **4. 原型链（Prototype Chain）**

**定义**：原型链是用于实现继承的机制。在 JavaScript 中，当访问对象的属性或方法时，首先在对象本身查找，如果找不到，则沿着对象的原型链向上查找，直到找到属性或方法或者到达 `Object.prototype`。

**作用**：原型链使得 JavaScript 对象可以共享属性和方法，并实现继承机制。

### **关系总结**

1. **构造函数**：用于创建对象，并通过其 `prototype` 属性定义原型对象。
2. **原型**：构造函数的 `prototype` 属性指向的对象，包含了所有实例共享的属性和方法。
3. **实例**：通过构造函数创建的对象，每个实例都有一个指向构造函数 `prototype` 的隐式链接（`__proto__`）。
4. **原型链**：通过对象的 `__proto__` 连接构造函数的 `prototype`，形成一个链条，使得实例可以访问其原型以及原型的原型上的属性和方法。

### **示例代码**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.say = function() {
  console.log(`${this.name} makes a sound`);
};

function Dog(name) {
  Animal.call(this, name); // 继承属性
}

// 继承原型方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} barks`);
};

const myDog = new Dog('Rex');
myDog.say();  // 输出: Rex makes a sound
myDog.bark(); // 输出: Rex barks
```

### **解析**

1. **`Animal`**：构造函数，定义了 `say` 方法。
2. **`Animal.prototype`**：包含了 `say` 方法的原型对象。
3. **`Dog`**：构造函数，继承自 `Animal`。
4. **`Dog.prototype`**：通过 `Object.create(Animal.prototype)` 继承了 `Animal.prototype` 的属性和方法，同时添加了 `bark` 方法。
5. **`myDog`**：`Dog` 的实例，继承了 `Animal.prototype` 和 `Dog.prototype` 的属性和方法。

这种机制允许 JavaScript 实现对象之间的继承和共享，使得代码更加灵活和可复用。

</details>

## 16. 函数的原型和对象的原型分别是什么？它们之间有何关联？结合代码进行说明。 {#question-e1378bae-d0ab-4272-b381-6fe399b7f751}

> 题库原题：[函数的原型和对象的原型分别是什么？它们之间有何关联？结合代码进行说明。](https://fe.ecool.fun/topic/e1378bae-d0ab-4272-b381-6fe399b7f751)

### 题目要点

1. **对象的原型 (`__proto__`)**：指向创建它的构造函数的 `prototype`，用于继承属性和方法。
2. **函数的原型 (`prototype`)**：用于实例化对象时设置实例的原型。
3. **函数自身也是对象**，有 `__proto__` 指向 `Function.prototype`。
4. 原型链关系：

   * 对象实例 → 构造函数的 `prototype` → `Object.prototype` → `null`
   * 函数对象 → `Function.prototype` → `Object.prototype` → `null`

<details>
<summary>参考答案</summary>

## 1. **对象的原型**

* 每个对象都有一个内部属性 `[[Prototype]]`（在 JS 中可以通过 `__proto__` 访问），指向它的原型对象。
* 通过原型对象，对象可以访问继承来的属性和方法。
* 对象的原型通常由 **构造函数的 `prototype` 属性** 指定。

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const p = new Person('Alice');

console.log(p.__proto__ === Person.prototype); // true
p.sayHello(); // Hello, Alice
```

**解释**：

* `p` 是对象实例，它的 `__proto__` 指向 `Person.prototype`，所以能调用 `sayHello` 方法。

---

## 2. **函数的原型**

* 函数本身也是对象，**每个函数都有一个 `prototype` 属性**（注意和 `__proto__` 不同）。
* `prototype` 是给 **使用该函数作为构造函数** 创建的对象实例提供原型的。
* 函数对象还有一个 `__proto__`，指向 `Function.prototype`。

```js
function Foo() {}

console.log(typeof Foo);          // "function"
console.log(Foo.prototype);       // {constructor: Foo}，默认有 constructor 属性
console.log(Foo.__proto__ === Function.prototype); // true
```

**解释**：

* `Foo.prototype` 是实例 `new Foo()` 的原型对象。
* `Foo.__proto__` 是函数自身的原型，指向 `Function.prototype`，因为函数也是对象。

---

## 3. **函数和对象原型之间的关联**

* 对象的原型来自 **构造函数的 `prototype`**。
* 构造函数本身是函数对象，它的原型是 `Function.prototype`。
* 所有函数的原型链最终都指向 `Object.prototype`。

```js
function Person(name) {
  this.name = name;
}
const p = new Person('Bob');

console.log(p.__proto__ === Person.prototype);      // true，实例的原型
console.log(Person.__proto__ === Function.prototype); // true，函数对象的原型
console.log(Function.prototype.__proto__ === Object.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype);   // true
```

**原型链示意**：

```
p --> Person.prototype --> Object.prototype --> null
Person --> Function.prototype --> Object.prototype --> null
```

</details>

## 17. git pull 命令实际上是哪两个操作的融合？ {#question-27c02f52-bbeb-4f13-bbd2-62a0ded5a002}

> 题库原题：[git pull 命令实际上是哪两个操作的融合？](https://fe.ecool.fun/topic/27c02f52-bbeb-4f13-bbd2-62a0ded5a002)

### 题目要点

`git pull` 是**获取远程更新 + 合并到本地分支**的快捷操作，本质就是 `fetch + merge` 的组合。

可以把它理解为一个“一步完成远程更新”的高层命令，但在处理冲突时仍然需要人工干预。

<details>
<summary>参考答案</summary>

`git pull` 实际上是 **`git fetch` + `git merge`** 两个操作的组合。

---

### 1. **`git fetch`**

* 从远程仓库获取最新的分支和提交信息，但 **不会自动合并到当前分支**。
* 它只是把远程仓库的变化更新到本地的远程分支（如 `origin/main`）。

```bash
git fetch origin
```

执行后，本地会得到最新的远程提交记录，但当前工作分支不会改变。

---

### 2. **`git merge`**

* 将某个分支的更新合并到当前分支。
* 如果有冲突需要手动解决。

```bash
git merge origin/main
```

这一步会把远程最新提交的内容整合到当前分支。

---

### 3. **`git pull`**

```bash
git pull origin main
```

* 等效于：

```bash
git fetch origin main
git merge origin/main
```

* **流程**：

  1. 拉取远程分支的最新提交到本地（`fetch`）。
  2. 将这些更新合并到当前分支（`merge`）。

* 可选参数：

  * `--rebase`：用 `rebase` 替代 `merge`，保持提交历史线性。

    ```bash
    git pull --rebase origin main
    ```

</details>

## 18. 在 React 中，useEffect 钩子的作用是什么？它的参数有哪些？如何使用 useEffect 实现组件的副作用处理？ {#question-3247bd42-61b4-4e59-b83b-7eb125a7cca9}

> 题库原题：[在 React 中，useEffect 钩子的作用是什么？它的参数有哪些？如何使用 useEffect 实现组件的副作用处理？](https://fe.ecool.fun/topic/3247bd42-61b4-4e59-b83b-7eb125a7cca9)

### 题目要点

* `useEffect` 用于在函数组件中处理副作用，包括数据请求、事件监听、DOM 操作等。
* 接受两个参数：副作用函数 `effect` 和依赖数组 `deps`。
* 副作用函数可以返回清理函数，避免资源泄漏。
* 依赖数组控制副作用执行时机：空数组 → 挂载/卸载一次，指定依赖 → 依赖变化时执行，不传 → 每次渲染执行。

<details>
<summary>参考答案</summary>

在 React 中，`useEffect` 是 **函数组件处理副作用的核心 Hook**，它可以替代类组件中的 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 生命周期方法。

---

## 1. **作用**

`useEffect` 的主要作用是：

1. **执行副作用操作**：包括数据请求、订阅事件、DOM 操作、定时器、日志记录等。
2. **在组件挂载、更新或卸载时执行**：根据依赖数组的不同，可以控制副作用执行的时机。

> 注意：副作用指的不是纯计算，而是对组件外部世界产生影响的操作。

---

## 2. **参数**

`useEffect` 接收两个参数：

```js
useEffect(effect: () => (void | (() => void)), deps?: any[])
```

1. **`effect`**

   * 一个函数，包含副作用逻辑。
   * 可以返回一个清理函数，用于在组件卸载或副作用重新执行前进行清理。

2. **`deps`（依赖数组，可选）**

   * 指定副作用依赖的变量数组。
   * React 会在依赖变化时重新执行 `effect`。
   * 如果不传依赖数组 → 每次渲染都执行
   * 空数组 `[]` → 仅在组件挂载和卸载时执行
   * 含有依赖 `[a, b]` → 只有当 `a` 或 `b` 改变时执行

---

## 3. **使用示例**

### （1）组件挂载时执行一次副作用

```js
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    console.log('组件挂载');

    return () => {
      console.log('组件卸载');
    };
  }, []); // 空依赖数组
}
```

### （2）依赖某些状态更新时执行

```js
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('count 更新为:', count);
  }, [count]); // 依赖 count
}
```

### （3）副作用中设置定时器，并在卸载时清理

```js
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器触发');
  }, 1000);

  return () => clearInterval(timer); // 清理
}, []); // 挂载时设置，卸载时清理
```

---

## 4. **注意事项**

1. **避免依赖遗漏**

   * 所有在副作用中使用的外部变量（状态、props、函数）都应该在依赖数组中列出，否则可能出现闭包陷阱。

2. **清理副作用**

   * 在副作用中注册事件或定时器时，要返回清理函数，避免内存泄漏。

3. **多个 `useEffect` 可以共存**

   * 每个副作用可以单独声明，提高逻辑可读性。

</details>

## 19. 你有没有自定义过 React Hook？如果有，请详细讲解一个你自定义的 Hook 的功能、实现原理和使用方法。 {#question-subjective-660d72585bfe}

### 题目要点

1. **功能场景**：说明解决了什么问题；
2. **实现原理**：展示对 React 生命周期和 Hook 工作机制的理解；
3. **使用方法**：给出实际使用示例；
4. **价值点**：强调可复用性、性能优化或可维护性。

这个思路可以套用到任何自定义 Hook，比如 `useFetch`、`useLocalStorage`、`usePrevious` 等。

<details>
<summary>参考答案</summary>

考官希望看到的不只是“会写 Hook”，而是**理解 Hook 原理、掌握复用逻辑、能够在项目中解决实际问题**。

下面给出一个参考回答思路：

### 1. 功能场景

例如，自定义了一个 **`useDebounce` Hook**，用于**防抖处理输入值**，避免频繁触发 API 请求或状态更新。

功能描述：

* 接收一个值（如输入框的 value）和延迟时间（delay）。
* 返回一个“延迟更新后的值”，只有在输入停止超过 delay 时间后才更新。
* 常用于搜索框、表单联动等场景，提高性能和用户体验。

---

### 2. 实现原理

核心思想是 **利用 useEffect + setTimeout** 实现防抖逻辑，并通过 useState 保存最终值：

* 当依赖值变化时，启动定时器，延迟更新最终值；
* 如果在延迟期间依赖值再次变化，则清除上一次定时器重新计时；
* 利用 useEffect 的清理函数保证定时器不会泄漏。

示例实现：

```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 3. 使用方法

```javascript
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // 触发接口请求
      fetchData(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

使用 Hook 后，输入过程中不会频繁触发 fetch，只在用户停止输入 500ms 后发起请求。

---

### 4. 回答亮点

* **复用性**：这个 Hook 可以在任意输入防抖场景复用。
* **原理理解**：展示了对 useEffect、setTimeout、清理函数以及依赖项管理的理解。
* **性能优化**：体现了对前端性能和用户体验的关注。

</details>

## 20. 当需要更改组件库中组件的主题时，有哪些常见的方法？请以你熟悉的组件库为例，说明如何实现主题定制。 {#question-c878d3c2-0ca2-4738-a945-ddbaba9945a6}

> 题库原题：[当需要更改组件库中组件的主题时，有哪些常见的方法？请以你熟悉的组件库为例，说明如何实现主题定制。](https://fe.ecool.fun/topic/c878d3c2-0ca2-4738-a945-ddbaba9945a6)

### 题目要点

1. **修改 Less / Sass 变量** → 全局主题定制，适合构建时静态修改。
2. **使用组件库提供的配置 API（ConfigProvider、ThemeProvider 等）** → 动态主题切换，安全可靠。
3. **覆盖 CSS 样式** → 针对个别组件微调，但升级风险较高。
4. **CSS-in-JS 方案** → 组件级主题控制，可动态切换，但有额外依赖和性能开销。

<details>
<summary>参考答案</summary>

在前端项目中，当需要修改组件库的主题时，一般有几种常见方法：覆盖 CSS 变量、通过配置提供的主题 API、使用自定义样式或 CSS-in-JS。

以下以 **Ant Design** 为例说明实现方式：

## 1. **覆盖 Less 变量（Ant Design）**

Ant Design 的样式是基于 Less 变量实现的，通过修改 Less 变量可以全局改变主题。

### 使用方法（Vite / Webpack + less-loader）

1. 安装 Less 和相关 loader：

```bash
npm install less less-loader --save-dev
```

2. 在构建工具中配置 `less-loader` 的 `modifyVars`：

```js
// vite.config.js 示例
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import less from 'less';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#1DA57A',
          '@link-color': '#1890ff',
        },
        javascriptEnabled: true,
      },
    },
  },
});
```

**效果**：

* 改变 `@primary-color` 就会影响按钮、输入框、标签等组件的主色。
* 可以通过修改其他 Less 变量调整边框圆角、字体大小等。

---

## 2. **使用 ConfigProvider 提供全局主题（Ant Design 4.0+）**

Ant Design 提供了 `ConfigProvider`，可以动态设置主题样式或方向：

```jsx
import { ConfigProvider, Button } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#722ED1', // 覆盖主色
        },
      }}
    >
      <Button type="primary">主题按钮</Button>
    </ConfigProvider>
  );
}
```

* **优点**：支持在运行时动态切换主题。
* **限制**：只能修改组件库暴露的 `token` 或主题变量，精细定制有限。

---

## 3. **自定义 CSS / 覆盖样式**

* 可以通过增加自定义 CSS 或 Sass 文件覆盖组件默认样式。
* 适合对个别组件做微调，而不改变全局主题。

```css
/* 覆盖 Ant Design Button 样式 */
.ant-btn-primary {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}
```

* **优点**：灵活、直接，可针对某些特殊组件。
* **缺点**：全局维护较麻烦，升级组件库可能导致样式覆盖失效。

---

## 4. **CSS-in-JS 或 styled-components**

* 对于使用 `styled-components` 或 Emotion 的项目，可以通过动态 props 修改主题样式：

```jsx
import styled from 'styled-components';
import { Button } from 'antd';

const ThemedButton = styled(Button)`
  background-color: ${props => props.theme.primaryColor};
  border-color: ${props => props.theme.primaryColor};
`;

<ThemedButton theme={{ primaryColor: '#52c41a' }}>主题按钮</ThemedButton>
```

* **优点**：可以实现组件级别的主题切换，灵活性高。
* **缺点**：需要额外引入 CSS-in-JS 库，并增加运行时开销。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-72/_index.md" >}}) · 已是最后一轮 →
