+++
title = "CSS 面试题"
draft = false
tags = ["面试", "前端", "CSS", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:27:55.625Z"
+++

共 114 道 CSS 面试题。答案默认折叠，便于先自行作答。

## 1. Tailwind 的响应式断点（如 `md:`）底层如何实现？ {#question-88f58c02-0b7c-4706-9e7e-08d7509205c5}

> 难度：2 · 类型：QA

### 题目要点

Tailwind 的响应式断点基于构建期的变体系统实现。`md:` 在编译阶段被解析为 screen 变体，并根据 `screens` 配置生成对应的 `@media (min-width)` 包裹规则。所有响应式逻辑依赖原生 CSS media query，遵循 mobile-first 原则，通过规则生成管线支持多变体组合，不涉及运行时计算。

<details>
<summary>参考答案</summary>

这个问题的关键在于理解：
`md:` 不是运行时逻辑，而是 **构建期的变体（variant）展开机制**。

在 Tailwind CSS 中，响应式系统建立在三个核心之上：

* screens 配置映射
* 变体解析机制
* JIT 构建阶段规则生成

---

## 一、`md:` 本质是什么？

当写：

```html
<div class="md:text-red-500">
```

Tailwind 在构建阶段会将其解析为：

* variant：`md`
* utility：`text-red-500`

然后生成如下 CSS：

```css
@media (min-width: 768px) {
  .md\:text-red-500 {
    color: #ef4444;
  }
}
```

关键点：

* `md:` 只是一个前缀标记
* 构建阶段转换成 `@media`
* 冒号会被转义为合法 CSS 选择器

---

## 二、断点从哪里来？

断点定义在配置文件中：

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    }
  }
}
```

`md` 映射为：

```css
@media (min-width: 768px)
```

本质是一个键值映射表。

---

## 三、构建阶段做了什么？

在 JIT 模式下，流程是：

1. 扫描源码中的 class
2. 拆分出 variant 与 utility
3. 生成基础规则
4. 根据 variant 包裹规则

例如：

```html
md:hover:text-red-500
```

会解析为：

* variant1：md
* variant2：hover
* utility：text-red-500

生成结果：

```css
@media (min-width: 768px) {
  .md\:hover\:text-red-500:hover {
    color: #ef4444;
  }
}
```

可以看出，变体系统是可组合的，类似规则生成管线。

---

## 四、为什么不是运行时判断？

原因有两个：

第一，性能稳定。
所有规则提前生成，浏览器只执行标准 CSS。

第二，逻辑简单。
完全依赖浏览器原生 `@media` 机制，不需要 JS 监听 resize。

---

## 五、移动优先原则

Tailwind 默认采用 mobile-first。

写法：

```html
text-red-500 md:text-blue-500
```

含义：

* 默认红色
* 屏幕宽度 ≥ 768px 时变蓝

生成顺序保证：

* 基础规则在前
* media query 在后
* 利用 CSS 层叠覆盖

---

## 六、抽象理解

可以把 Tailwind 的响应式机制理解为：

对基础 utility 规则进行“包装”。

伪逻辑可以理解为：

```
生成基础规则
如果有 screen 变体 → 用 @media 包裹
如果有伪类变体 → 添加伪类选择器
```

这是一种构建期规则生成模型，而不是条件分支执行。

</details>

## 2. Tailwind 是怎么解决样式冲突的？ {#question-fa06c194-9fab-4cf0-8cc7-dda90c2c4f97}

> 难度：2 · 类型：QA

### 题目要点

Tailwind 通过原子化 utility 类、统一选择器权重、避免层级嵌套、构建期生成样式以及可预测的覆盖规则，从架构层面降低样式冲突的发生概率。它不是依赖命名规范解决冲突，而是通过设计约束和单一职责类模型，使样式天然解耦，从而让冲突可控且可预测。

<details>
<summary>参考答案</summary>

这个问题如果只回答“因为类名不会冲突”是远远不够的。

Tailwind 解决样式冲突，本质上是通过 **设计约束 + 原子化模型 + 构建期生成策略**，从源头消除冲突的产生条件，而不是事后避免覆盖。

下面从机制层面拆解。

---

# 一、传统 CSS 为什么容易冲突

传统样式冲突来自三个方面：

### 1. 选择器冲突

```css
.btn { color: red; }
.button { color: blue; }
```

不同模块命名不规范会互相覆盖。

---

### 2. 层级嵌套带来的权重问题

```css
.page .btn { ... }
```

权重升级，导致后续难以覆盖。

---

### 3. 样式全局污染

CSS 默认是全局作用域，没有隔离边界。

---

# 二、Tailwind 的核心解决思路

以 Tailwind Labs 开发的 Tailwind CSS 为例，其核心思想是：

> 不写语义类，不写组件类，只写功能类。

---

## 1. 原子化（Utility First）

```html
<div class="text-red-500 bg-blue-200 p-4">
```

每个 class 只负责一个属性：

* `text-red-500` → color
* `bg-blue-200` → background
* `p-4` → padding

不会出现“一个类定义多个属性”的情况，因此冲突范围极小。

---

## 2. 单一职责类避免交叉覆盖

传统写法：

```css
.card {
  padding: 20px;
  color: red;
}
```

如果只想改颜色，就必须覆盖整个类。

Tailwind 里：

```html
<div class="p-5 text-red-500">
```

属性天然解耦，不存在样式耦合冲突。

---

## 3. 统一的优先级策略

Tailwind 通过构建期生成 CSS，保证：

* 所有 utility class 权重一致
* 基本不使用复杂选择器
* 几乎不依赖层级嵌套

因此冲突只来自“同一属性的后写类覆盖前写类”。

例如：

```html
<div class="text-red-500 text-blue-500">
```

后者覆盖前者。

规则简单且可预测。

---

## 4. 变体机制是可控叠加

响应式、hover、focus 等都通过前缀实现：

```html
hover:text-red-500
md:text-blue-500
```

这些变体在生成 CSS 时有明确顺序规则，不依赖手写层级。

---

## 5. 构建期裁剪（避免隐性冲突）

Tailwind 使用 JIT 模式：

* 只生成使用到的类
* 不存在无关样式残留

这减少了“未知样式干扰”的可能。

---

# 三、为什么它几乎不需要 BEM

传统为了解决冲突，会使用：

* BEM
* CSS Modules
* Scoped CSS

而 Tailwind 的模型是：

* 不产生语义命名
* 不产生模块耦合
* 所有类都是扁平的功能声明

冲突空间天然极小。

---

# 四、是否完全没有冲突？

不是。

冲突仍然可能出现在：

### 1. 同一属性重复声明

```html
text-sm text-lg
```

后者覆盖前者。

---

### 2. 自定义 CSS 与 Tailwind 混用

如果写了：

```css
.button { color: red; }
```

再加：

```html
<button class="text-blue-500">
```

具体谁生效，取决于加载顺序与权重。

---

### 3. 使用 @apply 时可能回到传统问题

`@apply` 本质上是展开成普通 CSS，
如果滥用，会重新引入耦合。

---

# 五、本质总结

Tailwind 并不是“避免冲突”，而是：

* 限制表达方式
* 原子化拆解样式
* 统一权重规则
* 构建期控制输出

通过架构层面消除冲突产生的土壤。

</details>

## 3. 怎么实现一个固定宽高比（如16:9）的容器 {#question-e789aade-8844-4502-9883-7a33442c283d}

> 难度：3 · 类型：QA

### 题目要点

固定宽高比的本质是用宽度推导高度；传统方案利用 padding 百分比规则实现，兼容性好但结构冗余；现代方案使用 `aspect-ratio` 原生支持，语义清晰、维护成本低；具体选择需结合浏览器兼容性和布局上下文。

<details>
<summary>参考答案</summary>

实现固定宽高比容器的核心，是**让高度由宽度推导出来**，而不是直接写死高度。围绕这一目标，随着 CSS 能力的演进，实践方式也发生了明显变化。

在较早阶段，最常见的做法是利用 **百分比 padding 的计算规则**。在 CSS 中，纵向的 `padding-top` / `padding-bottom` 百分比是相对于父元素宽度计算的，这一点恰好可以用来推导高度。一个 16:9 的容器，本质上就是高度等于宽度的 56.25%。因此可以通过一个“占位层”来撑开高度，再用绝对定位承载真实内容。这种方式兼容性极好，在旧项目或需要兼容老浏览器时仍然可靠，但结构上需要多一层包裹，语义和可读性都不算理想。

随着现代浏览器能力的提升，CSS 已经原生支持了 **`aspect-ratio`** 属性。通过直接声明宽高比，浏览器可以在布局阶段自动计算高度，无需额外 hack。对于一个响应式容器，只需要控制宽度，浏览器就能按比例推导出高度。这个方案在语义、可维护性和可读性上都明显优于传统 padding 技巧，非常适合新项目和组件库场景。需要注意的是，当容器内部存在绝对定位或内容溢出时，仍然需要配合 `overflow` 等属性进行约束。

在一些布局受限的场景下，例如容器高度受父级约束，也可以通过 **Flex 或 Grid** 间接实现比例控制。通过让容器在某个维度上参与布局，而另一个维度通过计算或约束推导出来，可以实现近似的固定比例效果。不过这种方式通常依赖上下文条件，更适合作为补充方案，而非通用解法。

在实际工程中，选择哪种方案取决于项目的浏览器支持范围和组件复用要求。老项目或跨端环境优先选择 padding 百分比方案，新项目和现代浏览器环境应优先使用 `aspect-ratio`，以减少结构复杂度和潜在 bug。

</details>

## 4. 你都了解哪些 CSS 布局技术？它们各自的特点和适用场景是什么？ {#question-d2128d55-6549-40d4-9e45-55c020437b8c}

> 难度：3 · 类型：QA

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

## 5. 说说你对原子化 CSS 的了解 {#question-a8b24897-3f40-480f-a46b-2af8d6a07305}

> 难度：3 · 类型：QA

### 题目要点

原子化 CSS 是一种通过拆分和组合最小化样式的高效方式，能够提升开发速度、复用性和灵活性。尽管带来了一些可读性问题，但它在快速开发、设计系统、组件库中具有很大的优势。随着 Tailwind CSS 等框架的流行，原子化 CSS 已成为现代前端开发的一个重要趋势。

<details>
<summary>参考答案</summary>

原子化 CSS 是一种将样式分解为最小化、独立的单一功能类名的 CSS 设计方法。每个类名通常只定义一个特定样式（例如设置颜色、边距、字体大小等），然后在 HTML 中通过组合这些类来构建界面。Tailwind CSS 是这种方法的代表框架之一。

### 原子化 CSS 的核心理念
原子化 CSS 旨在通过**拆分样式、最小化样式单元**来避免传统样式表中的复杂性问题，并通过小而精确的类名提供了更高的灵活性和复用性。

#### 示例
传统的样式表可能会写出：
```css
/* 传统 CSS */
.button {
    background-color: blue;
    padding: 10px;
    border-radius: 5px;
}
```

而原子化 CSS 则会分解为单一功能类：
```css
/* 原子化 CSS */
.bg-blue { background-color: blue; }
.p-10 { padding: 10px; }
.rounded-5 { border-radius: 5px; }
```

HTML 中组合使用这些类：
```html
<button class="bg-blue p-10 rounded-5">按钮</button>
```

### 原子化 CSS 的优势

1. **更高的复用性**：
   - 每个类都只包含一个样式，可以在多个组件或页面中复用，减少重复代码。

2. **更高的灵活性**：
   - 由于每个类代表一个特定样式，开发者可以自由组合这些类来实现各种效果，无需频繁编写新样式。

3. **降低样式冲突**：
   - 原子化 CSS 避免了命名空间冲突的问题，不需要担心不同组件之间的样式覆盖，因为每个类只包含一个特定的功能，不依赖上下文。

4. **更快速的构建和样式更新**：
   - 在构建时无需重新定义类名，开发者可以直接在 HTML 中组合样式类，使得开发更高效。

### 原子化 CSS 的不足

1. **可读性差**：
   - 大量短小的类名堆积在一起，可能会降低 HTML 的可读性，尤其是对于不熟悉代码的团队成员。

2. **依赖 HTML 类名**：
   - 大量的样式依赖于 HTML 的类名，导致 HTML 和 CSS 之间的分离不再明显，这对代码的结构化有一定影响。

3. **学习曲线**：
   - 原子化 CSS 需要开发者熟悉大量的短小类名和命名规则，例如 Tailwind CSS 的命名规则，可能对新手来说有一定的学习难度。

### 常见的原子化 CSS 框架

1. **Tailwind CSS**：最流行的原子化 CSS 框架，提供了大量的原子类，可以直接用于构建复杂的布局和样式。
2. **Tachyons**：类似于 Tailwind，提供了小而独立的样式类，支持快速原型和构建。

### 原子化 CSS 的应用场景
- **快速原型设计**：可以快速迭代页面，不需要定义大量的样式。
- **小型项目**：项目简单、页面少的情况下，原子化 CSS 可以大大提升开发速度。
- **组件库**：在构建组件库时，可以使用原子类创建灵活、可组合的组件。

</details>

## 6. position 的 sticky 有什么应用场景？ {#question-65bb22ac-b04c-401a-b6d3-8b05f5d16422}

> 难度：3 · 类型：QA

### 题目要点

`position: sticky` 的应用场景主要集中在提升用户体验和易读性方面，适用于导航栏、侧边栏、内容目录、表头固定、章节标题、购物车等场景。它在需要“半固定”效果时非常有用，不仅减少了对 JavaScript 的依赖，还提高了页面的性能和可读性。

<details>
<summary>参考答案</summary>

`position: sticky` 是一种结合了 `relative` 和 `fixed` 特性的定位方式，在一定的滚动范围内表现为相对定位，但当达到设定的阈值时会变成固定定位。它在前端开发中常用于创建随滚动动态固定的内容，提升用户体验。以下是一些常见的应用场景：

### 1. **导航栏固定**
   - 场景：页面有一个较长的内容，当用户滚动页面时，导航栏可以保持在视口顶部，方便用户随时访问导航选项。
   - 这种场景中使用 `sticky` 使导航栏在滚动时停留在顶部。

   ```css
   .navbar {
       position: sticky;
       top: 0;
       background-color: white;
       z-index: 1000;
   }
   ```

### 2. **内容目录（TOC）**
   - 场景：在文章页面中，常有一个内容目录（Table of Contents）来帮助用户快速跳转到对应章节。使用 `sticky` 可以让目录随着用户的滚动停留在侧边，便于用户随时查看。

   ```css
   .toc {
       position: sticky;
       top: 20px; /* 距离顶部 20px */
   }
   ```

### 3. **表头固定**
   - 场景：在一个有滚动条的表格中，让表头保持固定，以便用户在查看数据时，始终能看到列的名称。
   - 在表头元素上使用 `position: sticky; top: 0;`，可以让表头在滚动时停留在表格的顶部。

   ```css
   th {
       position: sticky;
       top: 0;
       background-color: #f1f1f1;
   }
   ```

### 4. **浮动的侧边栏**
   - 场景：在一个带有侧边栏的布局中，可以使侧边栏随滚动保持在视口的一个固定位置，避免用户需要返回顶部才能看到侧边内容。
   - 设置 `top` 值，让侧边栏在到达该位置时停留。

   ```css
   .sidebar {
       position: sticky;
       top: 10px; /* 在距离视口顶部 10px 时固定 */
   }
   ```

### 5. **分段内容的标题固定**
   - 场景：长文档或博客文章中，常分成多个章节，每一章节的标题可以使用 `sticky` 实现“吸附效果”。当用户滚动到每一章节时，标题会停留在顶部，清晰指示当前章节内容。
   - 设置 `top` 值，让标题随章节滚动到顶部时停留。

   ```css
   .section-title {
       position: sticky;
       top: 0;
       background-color: #fff;
       z-index: 1;
   }
   ```

### 6. **购物车或价格信息的固定**
   - 场景：在电商产品页面中，当用户浏览详细信息时，可以将购物车按钮或价格信息固定在侧边或底部，便于用户快速访问结算功能。

   ```css
   .price-info {
       position: sticky;
       top: 10px;
   }
   ```

</details>

## 7. 说说你对 CSS 变量的了解 {#question-023bc117-e6d8-4099-a847-1143d97b2809}

> 难度：2 · 类型：QA

### 题目要点

CSS 变量（也叫自定义属性）是 CSS 中的一项重要特性，允许开发者在样式表中定义可以重复使用的值，并可以在不同的地方引用这些值。CSS 变量使得样式的管理和维护更加灵活，尤其在处理复杂的设计系统和动态主题时非常有用。

<details>
<summary>参考答案</summary>

CSS 变量（也叫自定义属性）是 CSS 中的一项重要特性，允许开发者在样式表中定义可以重复使用的值，并可以在不同的地方引用这些值。CSS 变量使得样式的管理和维护更加灵活，尤其在处理复杂的设计系统和动态主题时非常有用。

### 1. **定义 CSS 变量**
   CSS 变量使用 `--` 前缀来定义，并且可以在任意选择器中定义。它们可以在任何作用域中声明，作用域决定了变量的可访问范围。

   ```css
   :root {
       --primary-color: #3498db; /* 定义全局变量 */
   }
   ```

   - `:root` 选择器表示文档的根元素（通常是 `<html>`），定义在 `:root` 中的变量是全局变量，可以在整个文档中使用。
   - 可以在其他元素或类中定义局部变量，但这些变量的作用域仅限于其定义的上下文。

### 2. **使用 CSS 变量**
   使用 CSS 变量时，通过 `var()` 函数来引用变量的值。例如：

   ```css
   body {
       background-color: var(--primary-color); /* 使用 CSS 变量 */
   }
   ```

   - `var(--primary-color)` 用来获取 `--primary-color` 变量的值，并将其应用于 `background-color` 属性。

### 3. **作用域**
   - **全局作用域**：如果在 `:root` 中定义变量，它可以在整个文档中访问。
   - **局部作用域**：如果在某个元素或类中定义变量，它仅在该元素及其子元素中有效。

   ```css
   :root {
       --global-color: red; /* 全局变量 */
   }

   .container {
       --container-color: green; /* 局部变量，仅在.container及其子元素有效 */
   }

   .header {
       color: var(--global-color); /* 使用全局变量 */
   }

   .footer {
       color: var(--container-color); /* 使用局部变量 */
   }
   ```

### 4. **默认值**
   CSS 变量可以为 `var()` 函数提供一个默认值，当变量未定义或值为空时，使用默认值。默认值在 `var()` 的第二个参数中指定。

   ```css
   .content {
       color: var(--text-color, black); /* 如果 --text-color 未定义，则使用 black */
   }
   ```

### 5. **动态修改 CSS 变量**
   CSS 变量具有动态性，可以通过 JavaScript 来修改它们的值。修改变量时，浏览器会立即重新渲染受影响的元素，使得它们能够响应变化。

   ```javascript
   document.documentElement.style.setProperty('--primary-color', '#e74c3c');
   ```

   - 这段代码修改了 `:root` 中定义的 `--primary-color` 变量，使其值变为 `#e74c3c`，并立即应用到文档中的所有引用此变量的地方。

### 6. **继承和覆盖**
   CSS 变量支持继承，这意味着子元素可以继承父元素定义的变量的值。变量可以被覆盖，并且具有局部作用域。

   ```css
   :root {
       --main-color: blue;
   }

   .child {
       --main-color: red; /* 重写父元素的 --main-color 变量 */
       color: var(--main-color); /* 子元素的文字颜色为 red */
   }
   ```

   在这个例子中，`.child` 类中的 `--main-color` 会覆盖 `:root` 中的全局变量。

### 7. **支持的浏览器**
   CSS 变量被大多数现代浏览器支持，包括 Chrome、Firefox、Safari 和 Edge。但在老版本的浏览器（如 IE）中并不支持，因此在使用时需要考虑兼容性问题。

</details>

## 8. gap 属性是用来设置什么的？ {#question-b46834a5-d407-419d-a068-af002028d71d}

> 难度：0.5 · 类型：QA

### 题目要点

`gap` 是用于设置 `grid` 和 `flex` 布局中元素之间的间距属性，简化了元素间距的管理。

<details>
<summary>参考答案</summary>

`gap` 属性用于设置在网格布局（`grid`）或弹性布局（`flex`）中，子元素（项目）之间的间距。它可以同时设置行间距和列间距，或者分别通过 `row-gap` 和 `column-gap` 单独设置。

- 适用于：`grid` 和 `flex` 布局
- 示例：
  ```css
  .container {
    display: flex;
    gap: 10px;
  }
  ```

</details>

## 9. 怎么实现一段文字颜色渐变的效果？ {#question-fc3721e1-2f24-48f4-ab08-b370d9fc6d26}

> 难度：3 · 类型：QA

### 题目要点

可以使用 **CSS** 的 `background` 和 `-webkit-background-clip` 属性来实现

<details>
<summary>参考答案</summary>

可以使用 **CSS** 的 `background` 和 `-webkit-background-clip` 属性来实现

### 具体方法

1. 设置文字的 `background` 为渐变色。
2. 使用 `-webkit-background-clip: text;` 将背景裁剪为文字形状。
3. 使用 `color: transparent;` 隐藏文字的原始颜色，确保只显示渐变背景。

### 示例代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        .gradient-text {
            font-size: 48px;
            font-weight: bold;
            background: linear-gradient(90deg, #ff7f50, #1e90ff); /* 定义渐变颜色 */
            -webkit-background-clip: text;
            color: transparent; /* 隐藏原始文本颜色 */
        }
    </style>
    <title>Gradient Text</title>
</head>
<body>

    <h1 class="gradient-text">渐变文字效果</h1>

</body>
</html>
```

### 解释：
- `background: linear-gradient(...)`: 定义从左到右的渐变色。
- `-webkit-background-clip: text`: 让背景裁剪成文字的形状。
- `color: transparent`: 使文本颜色透明，从而显示背景的渐变效果。

</details>

## 10. 未知高度和宽度元素的水平垂直居中的方案有哪些， 简单手写一下？ {#question-596703db-a53c-43bd-8d22-0cfb21fcd059}

> 难度：1.5 · 类型：QA

### 题目要点

- **Flexbox** 和 **Grid** 是现代 CSS 布局的强大工具，适用于大多数情况。
- **Absolute + Transform** 是一个经典的解决方案，适用于任何情况。
- **Line-Height** 是用于简单文本居中的方法。

<details>
<summary>参考答案</summary>

要在未知高度和宽度的元素中实现水平和垂直居中，可以使用多种 CSS 技巧。以下是几种常见的方案以及它们的简单手写实现：

### **1. Flexbox**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  /* 元素的样式 */
}
```

### **2. Grid**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  display: grid;
  place-items: center;     /* 同时水平和垂直居中 */
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  /* 元素的样式 */
}
```

### **3. Absolute + Transform**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  position: relative;
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 使元素居中 */
}
```

### **4. Line-Height (适用于单行文本)**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  height: 100vh;           /* 使容器填满视口 */
  line-height: 100vh;      /* 设置行高为容器高度 */
  text-align: center;      /* 水平居中 */
}

.centered-element {
  display: inline-block;
  vertical-align: middle; /* 垂直居中 */
  line-height: normal;    /* 恢复正常行高 */
}
```

</details>

## 11. 浏览器如何解析css选择器？ {#question-4ad4e434-9883-480e-a403-f54614a41293}

> 难度：2 · 类型：QA

### 题目要点

**从右往左**解析CSS选择器

<details>
<summary>参考答案</summary>

浏览器会『从右往左』解析CSS选择器。

#### CSS选择器的解析顺序

相信很多人在一开始接触CSS的时候都会看到一条规则就是尽量少使用层级关系，比如尽量不要写成：
```css
#div P.class {
    color: red;
}
```

而是写成：
```css
.class {
    color: red;
}
```
之所以需要这么写，给的解释是这样可以减少选择器匹配的次数。
初看觉得哦，有点道理啊，但是往细了再想想：
如果我把层级定的足够的清晰分明，那不是可以直接去掉很多不对应的CSS选择器的索引路径的么？为什么都是建议少使用层级关系呢？

原因其实很简单，我们犯了一个经验主义错误，默认CSS选择器是从左往右进行解析的，实际上恰恰相反，CSS选择器是从右往左解析的。

#### CSS选择器进行优化的必要性

再次看下图：<br>

![img](https://static.ecool.fun//article/68cbfba0-6602-4606-b7ee-e66015bedfc4.jpeg)

在图中我们可以看到HTML解析出了一颗DOM tree，与此同时样式脚本则解析生成了一个style rules，也可以说是一个CSS tree。
最后，DOM tree同style rules一同结合解析出一颗Render Tree，
而Render Tree就是包含了一个dom对象以及为其计算好的样式规则，提供了布局以及显示方法。

因为不清楚一个DOM对象上究竟对应着哪些样式规则，所以只能选择一个最笨的办法，
即每一个DOM对象都遍历一遍style rules，DOM对象的数量相信大家也都清楚，
如果每次遍历style rules都是像一个晒太阳的老大爷一样的悠哉游哉，因此对CSS选择器进行优化就是一个必须的事情了。

#### 从右往左解析到底好在哪里
假如有如下的一段HTML：
```html
<div id="div1">
    <div class="a">
        <div class="b">
            ...
        </div>
        <div class="c">
            <div class="d">
                ...
            </div>
            <div class="e">
                ...
            </div>
        </div>
    </div>
    <div class="f">
        <div class="c">
            <div class="d">
                ...
            </div>
        </div>
    </div>
</div>
```

和如下的CSS：
```css
#div1 .c .d {}
.f .c .d {}
.a .c .e {}
#div1 .f {}
.c .d{}
```

假如我们的CSS解析器是从左往右进行匹配的，那么会生成如下的style rules：
![01_47_03](https://static.ecool.fun//article/f5c251f0-544d-4807-ab1a-97a91159dab5.jpg)

首先，#div1 .c .d ｛｝ .f .c .d ｛｝.c .d｛｝这三个选择器里面都含有 **.c .d｛｝这么一个公用样式，**
所以哪怕是我们的DOM节点明确了是在#div1下面都必须对style rules进行全部的匹配查找，
这样一来基本上可以说是**每一个DOM节点都必须完全遍历一遍style rules**，
不然搞不好就会漏掉一些公用样式之类的，所以想着将层级写的更加详细就能去掉很多不对应的CSS选择器的索引路径的就不要想了，
不管你写的多细，你总是需要把整个style rules都遍历一遍，不然万一漏掉了某个公用样式不就思密达了？

那么如果我们换成从右向左进行解析就能够避免这种情况了么？请看下面这个style rules：<br>
![01_47_04](https://static.ecool.fun//article/cdccc9ba-a99a-4159-806d-04b973fb88ba.jpeg)

别的先不提，**最少这个节点就少了很多**嘛，哪怕我这里同样是需要全部遍历一遍就冲着减少了这么多个节点也要从右往左进行解析啊！<br>

更重要的是，只要有公用样式，那么选择器最右边的那个类型选择器一定是相同的，如此公共样式就很自然的都集中到一个分支上，
这个时候我们**完全可以将其他不匹配的路径全部去掉而不用担心会漏掉某些个公用样式了**。

虽然当这颗CSS树在遍历的时候还有有部分节点会遍历到最后才能确定到底是不是匹配的，

但总的来说从**右往左进行解析还是会比从左往右解析要少很多次的匹配**，这样带来的效率提升是显而易见的！

同时，这也是不建议使用*通配符来进行样式匹配的原因：浏览器专门建立了一个反常规思维的从右往左的匹配规则就是为了避免对所有元素进行遍历。

最后，从右往左进行解析还有一个好处那就是从右往左进行匹配的时候，匹配的全部是DOM元素的父节点，而从左往右进行匹配的时候时候，匹配的全部是DOM元素的子节点，这样就**避免了HTML与CSS没有下载完需要进行等待的情形**。

</details>

## 12. CSS 尺寸单位有哪些？ {#question-b2307971-c42d-49f7-b659-d3e2a50d3505}

> 难度：2 · 类型：QA

### 题目要点

- **绝对单位**：`px`, `cm`, `mm`, `in`, `pt`, `pc`
- **相对单位**：`%`, `em`, `rem`, `vh`, `vw`, `vmin`, `vmax`, `ch`, `ex`
- **动态单位**：`auto`, `min-content`, `max-content`, `fit-content`

<details>
<summary>参考答案</summary>

CSS 提供了多种尺寸单位，用于设置元素的大小、位置和其他样式属性。主要的尺寸单位包括：

### **1. 绝对单位**

- **`px`（像素）**：固定的单位，适用于设备屏幕上的精确像素。
  ```css
  width: 100px;
  ```

- **`cm`（厘米）**：用于印刷样式，1厘米等于约37.8像素。
  ```css
  margin: 2cm;
  ```

- **`mm`（毫米）**：用于印刷样式，1毫米等于约3.78像素。
  ```css
  padding: 10mm;
  ```

- **`in`（英寸）**：用于印刷样式，1英寸等于96像素。
  ```css
  font-size: 1in;
  ```

- **`pt`（点）**：印刷样式单位，1点等于1/72英寸，约为1.333像素。
  ```css
  line-height: 12pt;
  ```

- **`pc`（派卡）**：印刷样式单位，1派卡等于12点。
  ```css
  border-width: 2pc;
  ```

### **2. 相对单位**

- **`%`（百分比）**：相对于包含块的尺寸，如父元素的宽度或高度。
  ```css
  width: 50%;
  ```

- **`em`**：相对于当前元素的字体大小，`1em`等于当前字体的大小。
  ```css
  font-size: 2em;
  ```

- **`rem`**：相对于根元素（`<html>`）的字体大小，`1rem`等于根元素的字体大小。
  ```css
  margin: 1rem;
  ```

- **`vh`（视口高度）**：相对于视口的高度，`1vh`等于视口高度的1%。
  ```css
  height: 50vh;
  ```

- **`vw`（视口宽度）**：相对于视口的宽度，`1vw`等于视口宽度的1%。
  ```css
  width: 50vw;
  ```

- **`vmin`**：相对于视口的较小的宽度或高度，`1vmin`是 `vw` 和 `vh` 中较小的那个。
  ```css
  font-size: 2vmin;
  ```

- **`vmax`**：相对于视口的较大的宽度或高度，`1vmax`是 `vw` 和 `vh` 中较大的那个。
  ```css
  font-size: 2vmax;
  ```

- **`ch`**：相对于 `0` 字符的宽度（当前字体的数字 `0` 的宽度）。
  ```css
  width: 10ch;
  ```

- **`ex`**：相对于当前字体的 `x` 高度。
  ```css
  height: 5ex;
  ```

### **3. 动态单位**

- **`auto`**：根据元素内容或布局自动计算尺寸。
  ```css
  width: auto;
  ```

- **`min-content`、`max-content`、`fit-content`**：用于定义元素尺寸的最小、最大或适应内容的尺寸。
  ```css
  width: min-content;
  ```

</details>

## 13. css 中三栏布局的实现方案有哪些？ {#question-e33db22c-e826-41f0-b5a9-33b9a03091bc}

> 难度：1.5 · 类型：QA

### 题目要点

- **Flexbox**：适合简单的三栏布局，特别是响应式设计。
- **CSS Grid**：适合更复杂的布局需求，提供更强的布局控制。
- **浮动布局**：传统方法，适合兼容老旧浏览器，但代码较复杂。
- **绝对定位**：适用于需要精确定位的复杂布局，但维护性较差。

<details>
<summary>参考答案</summary>

在 CSS 中实现三栏布局有多种方法，常见的包括使用 Flexbox、Grid、以及传统的浮动布局。每种方法都有其优缺点和适用场景。以下是三栏布局的常见实现方案：

### **1. Flexbox 布局**

Flexbox 提供了一种简洁且灵活的方式来实现三栏布局，特别适合用于响应式设计。

#### **示例代码**

```html
<div class="container">
  <div class="sidebar-left">左侧</div>
  <div class="main">中间</div>
  <div class="sidebar-right">右侧</div>
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
  }
  .sidebar-left, .sidebar-right {
    flex: 0 0 200px; /* 固定宽度 */
  }
  .main {
    flex: 1; /* 自动填充剩余空间 */
  }
</style>
```

#### **优点**
- **简洁**：非常容易理解和实现。
- **响应式**：可以很方便地适配不同屏幕宽度。

#### **缺点**
- **宽度调整**：需要根据内容调整各栏的宽度。

### **2. CSS Grid 布局**

CSS Grid 是实现复杂布局的强大工具，非常适合实现三栏布局，支持更细粒度的控制。

#### **示例代码**

```html
<div class="grid-container">
  <div class="sidebar-left">左侧</div>
  <div class="main">中间</div>
  <div class="sidebar-right">右侧</div>
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: 200px 1fr 200px; /* 定义三列的宽度 */
    gap: 10px; /* 列间距 */
  }
  .sidebar-left, .sidebar-right {
    background-color: #f0f0f0;
  }
  .main {
    background-color: #e0e0e0;
  }
</style>
```

#### **优点**
- **强大**：支持复杂布局和对齐，提供更强的布局控制。
- **响应式**：可以轻松定义响应式布局。

#### **缺点**
- **兼容性**：在老旧浏览器中的支持可能不如 Flexbox 完善（但现代浏览器都支持）。

### **3. 浮动布局**

浮动布局是传统的布局方法，适合在老旧浏览器中使用，但相比于现代布局方法，代码较为复杂。

#### **示例代码**

```html
<div class="container">
  <div class="sidebar-left">左侧</div>
  <div class="main">中间</div>
  <div class="sidebar-right">右侧</div>
</div>

<style>
  .container {
    overflow: hidden; /* 清除浮动 */
  }
  .sidebar-left, .sidebar-right {
    float: left;
    width: 200px; /* 固定宽度 */
  }
  .main {
    margin: 0 200px; /* 设置左右边距 */
  }
</style>
```

#### **优点**
- **兼容性**：在非常老旧的浏览器中也能工作。

#### **缺点**
- **复杂性**：需要清除浮动，代码维护较为繁琐。

### **4. 绝对定位布局**

绝对定位可以用于实现复杂的布局，但需要手动计算和调整位置。

#### **示例代码**

```html
<div class="container">
  <div class="sidebar-left">左侧</div>
  <div class="main">中间</div>
  <div class="sidebar-right">右侧</div>
</div>

<style>
  .container {
    position: relative;
    height: 100vh; /* 高度为视口高度 */
  }
  .sidebar-left, .sidebar-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 200px; /* 固定宽度 */
  }
  .sidebar-left {
    left: 0;
  }
  .sidebar-right {
    right: 0;
  }
  .main {
    position: absolute;
    left: 200px;
    right: 200px;
    top: 0;
    bottom: 0;
  }
</style>
```

#### **优点**
- **灵活性**：可以创建复杂的布局和层叠效果。

#### **缺点**
- **维护**：需要手动计算和调整，可能不如其他方法灵活和易用。

</details>

## 14. CSS 中的文档流是什么？ {#question-de824eed-a719-4325-9c5e-143ac50891df}

> 难度：1 · 类型：QA

### 题目要点

文档流是浏览器布局和呈现页面内容的基础。通过理解和控制文档流中的不同布局模式和 CSS 属性，可以实现各种复杂的页面布局和设计。

<details>
<summary>参考答案</summary>

CSS 中的文档流（Document Flow），也称为标准流，是指浏览器如何按照 HTML 元素的结构和 CSS 样式规则来布局和呈现网页内容的过程。文档流决定了元素在页面上的位置和排列方式。文档流的主要特点和组成部分包括：

### **1. 主要布局模式**

- **正常流（Normal Flow）**：元素按照在 HTML 中的顺序逐个显示。块级元素（如 `<div>`, `<p>`）在页面上垂直堆叠，行内元素（如 `<span>`, `<a>`）在页面上水平排列。
- **浮动（Float）**：当元素应用 `float` 属性后，它会从正常流中脱离，允许其他文本和行内元素围绕它排列。
- **定位（Positioning）**：使用 `position` 属性（如 `absolute`, `relative`, `fixed`, `sticky`）时，元素会脱离正常流，根据其定位规则进行放置。
- **弹性盒布局（Flexbox）**：通过 `display: flex`，元素成为弹性容器及其子元素成为弹性项，允许灵活地布局和对齐。
- **网格布局（Grid）**：通过 `display: grid`，元素成为网格容器及其子元素成为网格项，提供了二维布局的能力。

### **2. 文档流中的元素类型**

- **块级元素（Block-level Elements）**：通常会从新行开始，占据父元素的整个宽度，如 `<div>`, `<h1>`, `<p>`。
- **行内元素（Inline Elements）**：在同一行内显示，仅占据其内容的宽度，如 `<span>`, `<a>`, `<img>`。
- **块级行内元素（Block-level Inline Elements）**：既有块级元素的特性又能在行内显示，如 `<button>`, `<input>`。

### **3. 影响文档流的 CSS 属性**

- **`display`**：决定元素的显示类型（如 `block`, `inline`, `flex`, `grid`）。
- **`position`**：决定元素的定位方式（如 `static`, `relative`, `absolute`, `fixed`, `sticky`）。
- **`float`**：使元素脱离正常流并允许文本环绕。
- **`clear`**：用于控制浮动元素的清除，以避免元素重叠。

### **4. 文档流的影响**

- **布局**：文档流决定了元素的默认布局方式。块级元素会垂直堆叠，行内元素会水平排列。
- **重叠和排列**：使用浮动和定位可以改变元素的排列顺序和位置，但这些元素不会占据正常文档流的位置。
- **响应式设计**：通过调整文档流中的元素（如使用 Flexbox 或 Grid），可以实现响应式布局，适应不同的屏幕尺寸。

### **5. 示例**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      border: 1px solid black;
      padding: 10px;
    }
    .block {
      display: block;
      background-color: lightblue;
      margin-bottom: 10px;
    }
    .inline {
      display: inline;
      background-color: lightcoral;
    }
    .float {
      float: left;
      width: 100px;
      height: 100px;
      background-color: lightgreen;
      margin-right: 10px;
    }
    .absolute {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 100px;
      height: 100px;
      background-color: lightyellow;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="block">Block Element</div>
    <div class="inline">Inline Element</div>
    <div class="float">Floating Element</div>
    <div class="absolute">Absolute Positioning</div>
  </div>
</body>
</html>
```

在这个示例中：
- `.block` 元素按正常流的块级布局显示。
- `.inline` 元素在同一行内显示。
- `.float` 元素浮动到左侧，其他内容围绕它。
- `.absolute` 元素绝对定位，脱离了正常流。

</details>

## 15. 说下 css 中的 BFC、IFC、GFC 和 FFC 分别指什么？ {#question-c740c88b-fe1b-426f-ab9c-23f43c7fe62d}

> 难度：3 · 类型：QA

### 题目要点

- **BFC**：用于块级元素的布局和清除浮动。
- **IFC**：用于内联元素的水平排列。
- **GFC**：用于 CSS Grid 布局中的网格项布局。
- **FFC**：用于 CSS Flexbox 布局中的弹性项布局。

<details>
<summary>参考答案</summary>

在 CSS 中，BFC（Block Formatting Context）、IFC（Inline Formatting Context）、GFC（Grid Formatting Context）和 FFC（Flex Formatting Context）是几种格式化上下文，它们定义了元素如何在布局中被格式化和渲染。

### **1. Block Formatting Context (BFC)**

- **定义**：BFC 是一个独立的渲染区域，所有的块级盒子都在这个上下文中进行布局。它定义了块级元素的布局和定位规则。
- **特性**：
  - **清除浮动**：BFC 可以用于清除浮动元素带来的影响，因为 BFC 形成的区域不会被浮动元素影响。
  - **自适应高度**：BFC 会计算自身的高度以包裹包含的内容，确保包含块的高度能根据内容变化而调整。
  - **边距折叠**：垂直方向上，BFC 中相邻的块级元素的边距不会折叠到 BFC 的外部。
- **触发 BFC 的情况**：
  - 根元素
  - `display: flow-root`（用于创建新的 BFC）
  - `position: absolute` 或 `position: fixed`
  - `float`（左或右）
  - `overflow` 的值为 `hidden`, `auto`, 或 `scroll`
  - `display: table`（table, inline-table）

### **2. Inline Formatting Context (IFC)**

- **定义**：IFC 是处理内联元素（如 `<span>`、`<a>`）的上下文。它定义了这些元素如何在一行中进行布局。
- **特性**：
  - **水平排列**：在 IFC 中，内联元素按水平顺序排列，直到当前行的宽度被填满。
  - **高度自适应**：内联元素的高度由内容决定，不会影响周围元素的高度。
  - **不影响其他行**：内联元素不会影响其他行的布局，行内元素会在行中水平排列。

### **3. Grid Formatting Context (GFC)**

- **定义**：GFC 是在使用 CSS Grid 布局时创建的上下文。它定义了如何在网格容器内布局网格项。
- **特性**：
  - **网格布局**：在 GFC 中，元素会按照定义的网格行和列进行布局。
  - **完全控制**：通过 CSS Grid，开发者可以完全控制网格项的位置和大小。
  - **网格线**：GFC 允许开发者定义网格线，从而精确控制布局。

### **4. Flex Formatting Context (FFC)**

- **定义**：FFC 是在使用 CSS Flexbox 布局时创建的上下文。它定义了如何在弹性容器内布局弹性项。
- **特性**：
  - **弹性布局**：在 FFC 中，元素会根据 Flexbox 属性（如 `flex-direction`, `justify-content`, `align-items`）进行弹性布局。
  - **方向控制**：开发者可以控制主轴和交叉轴上的对齐方式。
  - **自适应布局**：FPC 允许弹性项根据容器大小自动调整自身的大小和排列方式。

</details>

## 16. CSS 伪类和伪元素有哪些，它们的区别和实际应用 {#question-efc1bdba-4ded-4d08-846c-cc98cd1d0d58}

> 难度：1 · 类型：QA

### 题目要点

- **伪类**：用于选择和样式化元素的状态和结构特征。
- **伪元素**：用于选择元素的部分或插入新的内容。

<details>
<summary>参考答案</summary>

CSS 伪类和伪元素用于选择和样式化 DOM 元素的特定状态或部分。它们有不同的作用和用法。以下是它们的区别、常见类型及实际应用：

### **CSS 伪类**

伪类用于选择元素的特定状态或特性。例如：

1. **`:hover`** - 选择当鼠标悬停在元素上时的状态。
   ```css
   a:hover {
     color: red;
   }
   ```

2. **`:focus`** - 选择当元素获得焦点时的状态，通常用于输入框。
   ```css
   input:focus {
     border-color: blue;
   }
   ```

3. **`:nth-child(n)`** - 选择父元素中第 `n` 个子元素。
   ```css
   li:nth-child(2) {
     color: green;
   }
   ```

4. **`:first-child`** - 选择父元素中的第一个子元素。
   ```css
   p:first-child {
     font-weight: bold;
   }
   ```

5. **`:last-child`** - 选择父元素中的最后一个子元素。
   ```css
   p:last-child {
     margin-bottom: 0;
   }
   ```

6. **`:not(selector)`** - 选择不匹配指定选择器的元素。
   ```css
   div:not(.active) {
     opacity: 0.5;
   }
   ```

7. **`:checked`** - 选择已选中的输入框（如复选框、单选框）。
   ```css
   input:checked {
     background-color: yellow;
   }
   ```

### **CSS 伪元素**

伪元素用于选择元素的特定部分，通常创建新的元素内容。例如：

1. **`::before`** - 在元素的内容之前插入内容。
   ```css
   p::before {
     content: "Note: ";
     font-weight: bold;
   }
   ```

2. **`::after`** - 在元素的内容之后插入内容。
   ```css
   p::after {
     content: " [end]";
     color: gray;
   }
   ```

3. **`::first-line`** - 选择元素的第一行文本。
   ```css
   p::first-line {
     font-weight: bold;
   }
   ```

4. **`::first-letter`** - 选择元素的第一个字母。
   ```css
   p::first-letter {
     font-size: 2em;
   }
   ```

### **区别**

- **伪类**：选择元素的状态或结构特征。伪类的选择器是 `:pseudo-class`，如 `:hover`、`:focus`。伪类主要用于根据用户交互或元素在文档中的位置来改变样式。

- **伪元素**：选择元素的特定部分或添加新的内容。伪元素的选择器是 `::pseudo-element`，如 `::before`、`::after`。伪元素主要用于插入额外的样式或内容到元素的特定位置。

### **实际应用**

- **伪类应用**：
  - **`:hover`**：用于在用户将鼠标悬停在元素上时改变样式，常用于按钮和链接。
  - **`:nth-child()`**：用于选中具有特定位置的子元素，常用于条目列表和表格行的样式。

- **伪元素应用**：
  - **`::before` 和 `::after`**：用于在元素前后插入内容，常用于图标、装饰性文本等。
  - **`::first-line` 和 `::first-letter`**：用于对文本的首行或首字母应用样式，常用于排版和设计效果。

</details>

## 17. PostCSS 是什么，有什么作用？ {#question-b153090e-a6cc-4503-88df-25a1a77c62da}

> 难度：3 · 类型：QA

### 题目要点

PostCSS 是一个功能强大的 CSS 处理工具，通过灵活的插件机制，可以进行 CSS 预处理、自动添加前缀、优化压缩、支持未来 CSS 功能等。它的插件生态系统极其丰富，使得 PostCSS 可以根据项目需求进行高度定制，成为现代前端构建流程中的重要工具。

<details>
<summary>参考答案</summary>

**PostCSS** 是一个基于 Node.js 的工具，用于处理 CSS 文件。它本质上是一个 CSS 解析器和转换器，通过插件机制，可以在构建过程中对 CSS 进行各种优化和扩展。

### 主要作用和功能

1. **CSS 预处理**：
   - PostCSS 可以用作 CSS 预处理器，支持嵌套规则、变量、混合等功能，类似于 Sass 或 LESS。通过插件，如 `postcss-nested`（支持嵌套）和 `postcss-simple-vars`（支持变量），可以在 CSS 中使用这些高级功能。

2. **自动添加浏览器前缀**：
   - PostCSS 可以自动为 CSS 属性添加浏览器前缀，以确保兼容性。插件 `Autoprefixer` 是最常用的插件之一，它基于 Can I Use 数据库来判断需要添加哪些前缀，从而减少手动添加前缀的繁琐操作。

3. **优化和压缩**：
   - PostCSS 还可以用于优化和压缩 CSS 代码，减少文件大小。通过插件，如 `cssnano`，可以自动去除不必要的空格、注释，并合并相同的选择器规则，生成更小的 CSS 文件。

4. **未来 CSS 功能的支持**：
   - PostCSS 通过插件可以提前使用一些未来 CSS 规范中的功能，即使这些功能还未被广泛支持。例如，`postcss-preset-env` 插件允许开发者使用未来的 CSS 语法，然后根据目标浏览器的支持情况自动进行相应的转换。

5. **CSS Linting**：
   - PostCSS 可以用于代码风格的检查和格式化。通过插件，如 `stylelint`，可以按照团队的编码规范自动检测和修正 CSS 中的不合规写法。

6. **自定义插件**：
   - PostCSS 的强大之处在于其灵活的插件机制，开发者可以编写自己的插件来实现特定的 CSS 转换需求。例如，处理特定的公司风格指南、动态生成样式等。

### 工作原理

PostCSS 的工作流程通常包括以下步骤：
1. **解析**：首先，PostCSS 将 CSS 源代码解析为抽象语法树（AST）。
2. **转换**：然后，PostCSS 会通过插件对 AST 进行各种转换。
3. **生成**：最后，PostCSS 将转换后的 AST 重新生成 CSS 代码。

### 示例代码

使用 PostCSS 自动添加浏览器前缀的示例：

```javascript
// 安装 PostCSS 和 Autoprefixer
// npm install postcss autoprefixer

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const css = `
  .example {
    display: flex;
    transition: transform 1s;
  }
`;

postcss([autoprefixer])
  .process(css, { from: undefined })
  .then(result => {
    console.log(result.css);
  });
```

</details>

## 18. html 元素节点上， 有多个 class 名称，这几个class 名称对应的样式渲染优先级是如何的？ {#question-bbbb61f4-a591-46db-ae66-7884bb682099}

> 难度：1.5 · 类型：QA

### 题目要点

多个 `class` 名称的样式渲染优先级由 CSS 选择器的特指度、样式表的定义顺序、内联样式和 `!important` 声明共同决定。在特指度相同的情况下，后定义的样式会覆盖前定义的样式。

<details>
<summary>参考答案</summary>

在 HTML 元素上，多个 `class` 名称的样式渲染优先级（或称为特指度）是由 CSS 的特指度计算规则决定的。具体来说，CSS 选择器的优先级是由以下几个部分组成的：

### 特指度计算规则

1. **ID 选择器**（如 `#header`）：特指度最高。
2. **类选择器**（如 `.menu`）、属性选择器（如 `[type="text"]`）和伪类选择器（如 `:hover`）：特指度次之。
3. **元素选择器**（如 `div`）和伪元素选择器（如 `::before`）：特指度最低。
4. **通配符选择器**（如 `*`）、组合器（如 `>`、`+`）和伪类（如 `:not()`）的特指度通常较低。

### 计算多个 `class` 的优先级

当一个元素上有多个 `class` 名称时，每个 `class` 名称的样式规则都会应用到该元素。若多个 `class` 选择器定义了相同的 CSS 属性，浏览器会按照以下规则决定哪个样式优先应用：

1. **特指度**：在多个 `class` 选择器的情况下，优先应用特指度更高的规则。例如，`.class1` 和 `.class2` 的特指度相同，那么后定义的样式会覆盖先定义的样式。

2. **样式表的顺序**：如果多个样式规则的特指度相同，那么后定义的规则会覆盖先定义的规则。例如，如果 CSS 文件中 `.menu { color: red; }` 在 `.header { color: blue; }` 之后，那么 `.menu` 的样式会被应用。

3. **内联样式**：内联样式（即 `style` 属性中的样式）具有比外部样式表更高的特指度。如果元素上有内联样式，它们会覆盖 `class` 中定义的样式。

4. **`!important` 声明**：如果 CSS 属性使用了 `!important`，它将具有最高的优先级，覆盖所有其他没有 `!important` 的规则。

### 示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Priority Example</title>
    <style>
        .class1 {
            color: red;
        }
        .class2 {
            color: blue;
        }
        .class1.class2 {
            color: green;
        }
    </style>
</head>
<body>
    <div class="class1 class2">This text will be green.</div>
</body>
</html>
```

在这个例子中，`<div>` 元素同时应用了 `.class1` 和 `.class2`，并且 `.class1.class2` 的选择器具有更高的特指度，因此 `color` 属性设置为 `green`。

</details>

## 19. 如何避免全局样式污染？ {#question-2ca37e15-70b8-4e97-abd5-d5d6170a2eeb}

> 难度：3 · 类型：QA

### 题目要点

通过使用 CSS 模块、命名空间、CSS-in-JS 以及 scoped CSS 等方法，可以有效避免全局样式污染，确保样式的局部性和模块化，从而提高代码的可维护性和复用性。

<details>
<summary>参考答案</summary>

避免全局样式污染是确保 CSS 样式可维护、可复用且不会意外影响其他部分的关键。以下是一些常见的方法和最佳实践：

### 1. **使用 CSS 模块**
- **CSS Modules**：每个 CSS 文件只对其作用的组件生效，样式局部化，避免全局污染。例如，在使用 CSS Modules 的项目中，样式只会影响导入了该模块的组件。

### 2. **使用命名空间**
- **命名空间**：为类名添加前缀，或使用更具描述性的命名空间，避免类名冲突。例如，使用 `Button__primary` 而不是 `.primary`。

### 3. **CSS-in-JS**
- **CSS-in-JS**：使用如 `styled-components` 或 `emotion` 这样的库将 CSS 和 JavaScript 结合，样式与组件绑定，不会全局污染。

### 4. **Scoped CSS**
- **Scoped Styles**：在 Vue.js 等框架中，使用 `&lt;style scoped&gt;` 将样式限制在组件内部，只影响当前组件的 DOM 元素。

### 5. **BEM 方法论**
- **BEM（Block Element Modifier）**：遵循 BEM 方法论编写 CSS 类名，使类名具有更高的特异性，避免样式冲突。例如，`.block__element--modifier`。

### 6. **CSS 预处理器**
- **CSS 预处理器**：使用 Sass、Less 等预处理器来组织样式，通过嵌套、变量和混合宏提高样式管理能力，减少全局样式污染。

### 7. **避免通配符选择器**
- **限制通配符选择器使用**：避免使用 `*` 选择器，这会影响所有元素，增加样式污染的风险。

### 8. **使用 CSS 变量**
- **CSS Variables**：通过定义 CSS 变量（自定义属性），确保样式在组件中可控，并减少全局样式的影响。

### 9. **合理使用继承**
- **继承**：尽量避免深层次的样式继承。使用明确的选择器来减少继承的副作用。

### 10. **分离结构与样式**
- **分离结构与样式**：尽量将结构和样式分离，保持 CSS 文件的简洁和模块化。

### 示例：CSS Modules

```javascript
// Button.module.css
.button {
  background-color: blue;
  color: white;
}

// Button.js
import React from 'react';
import styles from './Button.module.css';

const Button = () => (
  <button className={styles.button}>Click me</button>
);

export default Button;
```

</details>

## 20. 全局样式命名冲突和样式覆盖问题怎么解决？ {#question-29d0b7c1-722e-476f-a02d-96d6792d273c}

> 难度：1.5 · 类型：QA

### 题目要点

在前端开发过程中，有几种常见的方法可以解决全局样式命名冲突和样式覆盖问题：

<details>
<summary>参考答案</summary>

在前端开发过程中，有几种常见的方法可以解决全局样式命名冲突和样式覆盖问题：

1. 使用命名空间（Namespacing）：给样式类名添加前缀或命名空间，以确保每个组件的样式类名不会冲突。例如，在一个项目中，可以为每个组件的样式类名都添加一个唯一的前缀，例如`.componentA-button`和`.componentB-button`，这样可以避免命名冲突。

2. 使用BEM命名规范：BEM（块、元素、修饰符）是一种常用的命名规范，可以将样式类名分成块（block）、元素（element）和修饰符（modifier）三个部分，以确保样式的唯一性和可读性。例如，`.button`表示一个块，`.button__icon`表示一个元素，`.button--disabled`表示一个修饰符。

3. 使用CSS预处理器：CSS预处理器（如Sass、Less）可以提供变量、嵌套规则和模块化等功能，可以更方便地管理样式并避免命名冲突。例如，可以使用变量来定义颜色和尺寸，使用嵌套规则来组织样式，并将样式拆分成多个模块。

4. 使用CSS模块：CSS模块提供了在组件级别上限定样式作用域的能力，从而避免了全局样式的冲突和覆盖。每个组件的样式定义在组件内部，使用唯一的类名，确保样式的隔离性和唯一性。

5. 使用CSS-in-JS解决方案：CSS-in-JS是一种将CSS样式直接写入JavaScript代码中的方法，通过将样式与组件绑定，可以避免全局样式的冲突问题。一些常见的CSS-in-JS解决方案包括Styled Components、Emotion和CSS Modules with React等。

</details>

## 21. css  module 是什么？ {#question-f2180996-95e0-4926-aa8f-5c9fceb36330}

> 难度：1.5 · 类型：QA

### 题目要点

CSS Modules 是一种用于组织和管理 CSS 的技术。它通过在编译时为每个 CSS 类名生成唯一的标识符，并将它们作为 JavaScript 对象的属性导出。这样，可以确保每个类名在整个应用程序中的唯一性，避免样式冲突。

<details>
<summary>参考答案</summary>

CSS Modules 是一种用于组织和管理 CSS 的技术。它通过在编译时为每个 CSS 类名生成唯一的标识符，并将它们作为 JavaScript 对象的属性导出。这样，可以确保每个类名在整个应用程序中的唯一性，避免样式冲突。

使用 CSS Modules，可以将 CSS 文件与组件文件绑定在一起，这样每个组件都有自己的 CSS 作用域，样式只会应用于特定的组件，不会影响其他组件。这种隔离性和局部作用域有助于降低样式冲突和维护 CSS 的复杂性。

CSS Modules 还提供了一些其他功能，例如:

1. 局部作用域: CSS Modules 允许在组件中定义局部样式，这些样式仅适用于该组件。这样，可以避免全局样式造成的副作用，并使组件更加可重用。

2. 类名和样式的映射: 使用 CSS Modules，可以通过导入生成的样式对象，将类名映射到组件中的类名，并将其应用于相应的元素。这样可以方便地将样式与组件关联起来，并跟踪样式的变化。

3. 继承和组合: CSS Modules 支持继承和组合样式。可以通过使用类名组合和继承规则，将多个样式应用于同一个元素或组件。

总结来说，CSS Modules 提供了一种更可靠和可维护的方式来管理 CSS，通过实现局部作用域和唯一类名标识符，帮助开发者避免样式冲突和提高样式的可重用性。

</details>

## 22. CSS 属性值计算 - calc 怎么使用，具体有哪些使用场景？ {#question-817e3bfa-bb12-489c-a290-5a9ce08df745}

> 难度：1 · 类型：QA

### 题目要点

- `calc()` 是一个非常灵活的 CSS 函数，允许在 CSS 中进行简单的数学计算，动态计算样式值。
- 它支持加法、减法、乘法和除法，并能够混合不同的单位（如百分比和像素）。
- `calc()` 非常适用于响应式布局、动态位置和大小的计算、以及复杂的布局场景。

<details>
<summary>参考答案</summary>

`calc()` 是 CSS 中一个非常强大的函数，它允许你在 CSS 样式中进行动态的数学计算，从而为某些属性的值提供更大的灵活性。`calc()` 函数可以执行加法、减法、乘法和除法操作，能够基于已知的值（如百分比、像素、em、rem 等）进行计算，计算结果会动态应用到元素的样式中。

### **基本语法**
```css
property: calc(expression);
```
其中，`expression` 是一个数学表达式，可以包含数值、运算符和单位。

### **支持的运算符**
- **加法 (`+`)**：将两个值相加。
- **减法 (`-`)**：从第一个值中减去第二个值。
- **乘法 (`*`)**：将一个值与另一个值相乘。
- **除法 (`/`)**：将一个值除以另一个值。

### **使用场景**
`calc()` 可以在很多情况下派上用场，特别是在需要混合不同单位或需要响应式布局时，它能够根据不同的条件灵活调整元素的尺寸或位置。

#### **常见的使用场景**
1. **响应式布局**
   `calc()` 可以帮助你创建响应式的布局，动态调整元素的宽度或高度，使布局在不同的视口宽度下更加灵活。

   ```css
   .container {
     width: calc(100% - 40px); /* 宽度为 100% 减去 40px 的边距 */
   }
   ```

2. **定位元素**
   使用 `calc()` 来动态计算元素的位置，特别是在绝对定位的情况下，根据父元素的宽度和高度来设置元素的 `top`、`left`、`right` 或 `bottom`。

   ```css
   .box {
     position: absolute;
     top: calc(50% - 10px); /* 将元素垂直居中 */
   }
   ```

3. **结合百分比和固定值**
   有时你可能需要将百分比和固定单位混合使用（例如，百分比加像素），`calc()` 就可以处理这种需求。

   ```css
   .element {
     width: calc(50% - 20px); /* 使元素宽度为 50% 减去 20px */
   }
   ```

4. **动态计算字体大小或间距**
   你可以使用 `calc()` 来根据父元素的大小动态计算字体大小、内外边距等。

   ```css
   .header {
     font-size: calc(1rem + 2vw); /* 字体大小随着视口宽度的变化而动态调整 */
   }
   ```

### **注意事项**
1. **空格要求**：在 `calc()` 函数中，操作符（如 `+`、`-`、`*` 和 `/`）两边必须有空格，否则会导致语法错误。
   ```css
   /* 正确 */
   width: calc(100% - 20px);

   /* 错误 */
   width: calc(100%-20px); /* 缺少空格 */
   ```

2. **单位的混合使用**：`calc()` 允许在一个表达式中混合不同的单位（如百分比和像素），但请注意，乘法和除法操作时只能保持单位一致。例如：
   - `calc(100% - 50px)` 是合法的。
   - `calc(100% * 2)` 是不合法的，因为 `%` 不能直接与数字进行乘法运算。

3. **性能问题**：`calc()` 的计算会在每次渲染时动态计算，虽然现代浏览器优化了这个过程，但在复杂布局和大量元素中，还是有一定的性能开销。因此，尽量避免在性能敏感的场景下过度使用 `calc()`。

</details>

## 23. 怎么给某个元素的背景设置渐变色？ {#question-5cf6918e-4b07-4a6f-83b9-a9b817cc7f29}

> 难度：0.5 · 类型：QA

### 题目要点

- **`linear-gradient`** 用于线性渐变，可以设置方向或角度。
- **`radial-gradient`** 用于径向渐变，渐变从一个点（通常是中心）扩展。
- 可以设置渐变的颜色、方向、形状，甚至透明度，来达到不同的视觉效果。

<details>
<summary>参考答案</summary>

可以使用 CSS 的 `background-image` 属性，并配合 `linear-gradient` 或 `radial-gradient` 来实现渐变效果。

### 1. **线性渐变（`linear-gradient`）**

`linear-gradient` 用于创建沿直线方向的渐变，可以设置渐变的角度或方向。

#### 示例：

```css
/* 从上到下的线性渐变 */
.element {
  background-image: linear-gradient(to bottom, red, yellow);
}

/* 从左上到右下的线性渐变 */
.element {
  background-image: linear-gradient(to bottom right, red, yellow);
}

/* 角度为45度的线性渐变 */
.element {
  background-image: linear-gradient(45deg, red, yellow);
}
```

- `to bottom` 或 `to top`：定义渐变的方向。
- `45deg`：表示渐变的角度。

#### 结果：
- **`linear-gradient(to bottom, red, yellow)`** 会创建从红色到黄色的垂直渐变。
- **`linear-gradient(to bottom right, red, yellow)`** 会创建从红色到黄色的对角线渐变。

### 2. **径向渐变（`radial-gradient`）**

`radial-gradient` 用于创建从中心向外扩展的渐变效果。

#### 示例：

```css
/* 圆形渐变，默认从中心向外 */
.element {
  background-image: radial-gradient(circle, red, yellow);
}

/* 椭圆形渐变 */
.element {
  background-image: radial-gradient(ellipse, red, yellow);
}

/* 设置渐变的起始位置 */
.element {
  background-image: radial-gradient(circle at top left, red, yellow);
}
```

- `circle`：表示渐变为圆形。
- `ellipse`：表示渐变为椭圆形。
- `at top left`：表示渐变的中心从元素的左上角开始。

#### 结果：
- **`radial-gradient(circle, red, yellow)`** 会创建从中心到外部的圆形渐变。
- **`radial-gradient(ellipse, red, yellow)`** 会创建一个椭圆形的渐变。

### 3. **多重颜色渐变**

还可以在渐变中使用多个颜色，实现更复杂的效果。

#### 示例：

```css
.element {
  background-image: linear-gradient(to right, red, orange, yellow, green);
}
```

#### 结果：
这将创建一个从红色到橙色，再到黄色和绿色的渐变。

### 4. **透明度渐变**

渐变色可以同时处理颜色和透明度，可以使用 RGBA 或 HSLA 来实现渐变的透明效果。

#### 示例：

```css
.element {
  background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0), rgba(255, 0, 0, 1));
}
```

#### 结果：
这会创建一个从透明红色到不透明红色的渐变。

</details>

## 24. less 文件中怎么使用函数？ {#question-bb366b24-5703-4bf5-99c0-1fe66d9955b7}

> 难度：0.5 · 类型：QA

### 题目要点

- 利用内置函数进行数学运算、颜色调整、字符串处理等；
- 自定义 Mixin 或者函数来进行动态的样式计算；
- 使用条件语句根据不同的参数选择不同的样式。

<details>
<summary>参考答案</summary>

在 `LESS` 中，可以使用函数来进行各种操作，例如数学运算、颜色操作、字符串操作等。LESS 提供了一些内置的函数，可以帮助我们在样式表中动态计算、转换和修改值。还可以自定义函数来完成特定的计算或操作。

### 1. **内置函数**

#### 数学函数

LESS 提供了常见的数学运算函数，比如加、减、乘、除等：

```less
@base: 10;
@result: @base + 5; // 15

@width: 50px;
@height: 100px;
@area: @width * @height; // 5000px
```

#### 颜色操作

LESS 提供了许多用于操作颜色的函数，可以调整颜色的亮度、饱和度、透明度等：

- `darken($color, $amount)`：使颜色变暗
- `lighten($color, $amount)`：使颜色变亮
- `saturate($color, $amount)`：增加颜色的饱和度
- `desaturate($color, $amount)`：减少颜色的饱和度
- `adjust-hue($color, $degrees)`：调整颜色的色相
- `rgba($color, $alpha)`：为颜色添加透明度

```less
@color: #00bcd4;

@lightColor: lighten(@color, 10%); // 更亮的颜色
@darkColor: darken(@color, 10%);   // 更暗的颜色
@semiTransparent: rgba(@color, 0.5); // 半透明的颜色
```

#### 字符串操作

LESS 还提供了一些用于字符串处理的函数：

- `unit($value)`：返回值的单位
- `str-length($string)`：返回字符串的长度
- `str-index($string, $substring)`：返回子字符串的位置
- `to-upper-case($string)`：将字符串转换为大写
- `to-lower-case($string)`：将字符串转换为小写

```less
@string: "Hello, LESS!";
@stringLength: str-length(@string); // 12

@upper: to-upper-case(@string); // "HELLO, LESS!"
@lower: to-lower-case(@string); // "hello, less!"
```

#### 媒体查询操作

LESS 提供了内置的 `media()` 函数来定义响应式设计中的媒体查询：

```less
@breakpoint: 768px;

@media-query: media(max-width: @breakpoint);
```

### 2. **自定义函数**

你也可以在 LESS 中定义自己的函数（Mixin），通过参数传递来实现一些动态的样式计算。自定义函数通常用于计算一些动态的值或者重复的样式逻辑。

#### 示例：自定义 Mixin 函数

```less
// 定义一个计算圆角的函数
.rounded(@radius) {
  border-radius: @radius;
}

// 使用该函数
.button {
  .rounded(5px); // 设置圆角为 5px
}
```

#### 示例：根据不同的值返回不同的颜色

```less
// 定义一个自定义的颜色选择函数
.chooseColor(@color) {
  @selectedColor: @color == "primary" ? #3498db :
                  @color == "secondary" ? #2ecc71 :
                  #e74c3c; // 默认红色
  color: @selectedColor;
}

// 使用该函数
.button {
  .chooseColor("primary");  // 使用主色
}
```

#### 示例：计算动态的值

```less
// 定义一个动态计算的函数
.calculatePadding(@padding) {
  padding: @padding * 2; // 将传入的 padding 值翻倍
}

// 使用该函数
.container {
  .calculatePadding(10px); // padding 为 20px
}
```

### 3. **函数与条件语句**

LESS 支持使用 `@variable` 作为函数的参数，并结合条件语句来动态生成值：

```less
@font-size: 16px;

.getFontSize(@size) {
  @calculated-size: @size > 20px ? @size : 20px;
  font-size: @calculated-size;
}

.button {
  .getFontSize(@font-size); // 如果 @font-size 小于 20px，则使用 20px
}
```

### 4. **函数的作用域**

在 LESS 中，函数的作用域是局部的，函数内部的变量不会影响外部环境，函数的参数和局部变量只在函数内部有效。

### 总结

</details>

## 25. 请使用 css 实现卡片翻转的动画 {#question-eb057db2-c26f-409f-8b38-64db8f949ef9}

> 难度：3 · 类型：QA

### 题目要点

- 使用 `perspective` 实现 3D 效果<br>
- `card-inner` 设置 `transform-style: preserve-3d` 和 `transition`<br>
- 正反两面通过 `backface-visibility: hidden` 隐藏背面<br>
- 背面需要额外 `rotateY(180deg)` 对齐

<details>
<summary>参考答案</summary>

可以使用 **3D 变换（transform: rotateY）** + **过渡动画（transition）**实现。

下面的例子，可以通过 hover 实现控制水平翻转：

```html
<div class="card">
  <div class="card-inner">
    <div class="card-front">Front</div>
    <div class="card-back">Back</div>
  </div>
</div>
```

```css
.card {
  width: 200px;
  height: 300px;
  perspective: 1000px; /* 创建 3D 视角 */
}

.card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

/* 触发翻转效果 */
.card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-front {
  background: #fff;
  color: #000;
}

.card-back {
  background: #333;
  color: #fff;
  transform: rotateY(180deg);
}
```

如果需要 **上下翻转**，只需将 `rotateY` 改为 `rotateX` 即可。

</details>

## 26. css 中的 animation、transition、transform 有什么区别？ {#question-0de1d7b2-794c-4867-a61c-7840ae0eafdc}

> 难度：1 · 类型：QA

### 题目要点

1. **`animation`**
   - 定义复杂的动画效果。
   - 包含多个动画步骤，控制动画的持续时间、延迟、次数。

2. **`transition`**
   - 元素状态变化时平滑过渡属性值。
   - 适合简单的状态变化动画，如 hover 效果。

3. **`transform`**
   - 改变元素的几何属性，如旋转、缩放、移动。
   - 通常与 `transition` 或 `animation` 结合使用，产生动画效果。

#### 考察重点

- **理解**：`animation`、`transition` 和 `transform` 的基本功能和区别。
- **选择**：根据实际需求选择合适的动画实现方式。
- **应用**：将这些技术应用到实际项目中，提升用户体验。

<details>
<summary>参考答案</summary>

在 CSS 中，`animation`、`transition` 和 `transform` 是用来创建动画效果的关键属性，它们各自具有不同的作用和特点。

1. **animation**：
   - `animation` 属性允许创建一个在指定时间内播放的动画效果，可以包括多个关键帧。
   - 通过指定关键帧动画的名称、持续时间、动画方式（timing function）、延迟时间、播放次数等来控制动画的效果。
   - `animation` 属性可以实现更复杂的动画效果，例如循环动画、无限次播放等。

2. **transition**：
   - `transition` 属性用于指定在元素状态改变时，要以何种方式过渡到新状态。
   - 通过指定过渡的属性、持续时间、动画方式（timing function）、延迟时间等来控制过渡效果。
   - `transition` 属性适用于元素从一种状态平滑过渡到另一种状态，例如颜色、大小、位置等属性的变化。

3. **transform**：
   - `transform` 属性用于对元素进行变形，例如平移、旋转、缩放、倾斜等。
   - 通过 `transform` 属性，可以改变元素的变形属性来创建动画效果。
   - `transform` 属性通常与 `transition` 或 `animation` 结合使用，使得变形动画更加平滑。

总结：

* `animation` 属性用于创建复杂的动画序列
* `transition` 属性用于在状态变化时平滑过渡
*  `transform` 属性用于对元素进行变形

这三种属性通常结合使用，以实现丰富的动画效果。

</details>

## 27. flex 布局下，怎么改变元素的顺序？ {#question-286f8c5a-9f06-476d-9670-bd02de26db4e}

> 难度：1 · 类型：QA

### 题目要点

在 Flexbox 布局中，可以通过设置 order 属性来改变元素的显示顺序，而不需要改变 HTML 的结构。

#### Flexbox 布局元素顺序

- **`order` 属性**：
  - 定义元素的排序顺序。
  - 默认值是 `0`。
  - 数值越小，元素越靠前显示。

#### 考察重点

- 理解：order 属性的作用和用法。
- 应用：在实际布局中灵活调整元素的显示顺序。

<details>
<summary>参考答案</summary>

可以使用`order`属性来改变Flex布局下元素的顺序。`order`属性指定了Flex容器内部各个项目的排列顺序，其默认值为0。

通过调整`order`属性的值，可以改变元素的顺序。具体步骤如下：

1. 将元素定义为Flex容器，使用`display: flex;`或者`display: inline-flex;`。
2. 为每个子元素设置`order`属性，根据需要设置不同的值，值越小的元素会在前面，值相等的元素按照文档流原始顺序排列。

以下是一个示例代码：

```html
<div class="flex-container">
  <div class="item-1">1</div>
  <div class="item-2">2</div>
  <div class="item-3">3</div>
</div>
```

```css
.flex-container {
  display: flex;
}

.item-2 {
  order: 2; /* 改变顺序 */
}
```

在上述代码中，通过将第二个子元素的`order`属性设置为2，可以将其放置在其他子元素之后。

请注意，`order`属性接受任意整数值，负数也可以使用。同时，当多个元素的`order`值相同时，它们会按照它们在文档流中的位置进行排序。

</details>

## 28. ”flex: auto;“是什么意思？ {#question-27a34d44-74b5-4406-b6e6-61f4b1d203a1}

> 难度：2 · 类型：QA

### 题目要点

#### `flex: auto;` 的含义

- **`flex` 属性**：
  - 一个简写属性，用于设置 `flex-grow`、`flex-shrink` 和 `flex-basis`。
  - `flex: auto;` 相当于 `flex: 1 1 auto;`。

### 详细解释

- **`flex-grow`**: 1
  - 允许元素在容器中占据额外的空间。
- **`flex-shrink`**: 1
  - 允许元素在容器空间不足时缩小自身尺寸。
- **`flex-basis`**: auto
  - 元素的初始大小默认为内容大小。

#### 考察重点

- 理解：flex 属性的简写形式及其默认值。
- 应用：在实际布局中根据内容自动调整元素大小。

<details>
<summary>参考答案</summary>

`flex` 是**复合属性**，是`flex-grow`,`flex-shrink` 和 `flex-basis`的简写，默认值为`0 1 auto`，后两个属性可选。

* flex-grow 属性定义项目的放大比例，默认为0，即如果存在剩余空间也不放大
* flex-shrink 属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
* flex-basis 属性定义了在分配多余空间之前，项目占据的主轴空间（相当于我们设置的width）

而 `flex: auto;` 是 `flex:1 1 auto;` 的简写，即元素尺寸可以弹性增大，也可以弹性变小，具有十足的弹性，但在尺寸不足时会优先最大化内容尺寸。

再介绍下使用场景：

当希望元素充分利用剩余空间，但是各自的尺寸按照各自内容进行分配的时候，适合使用 `flex:auto`。

`flex:auto` 多用于内容固定，或者内容可控的布局场景，例如导航数量不固定，每个导航文字数量也不固定的导航效果就适合使用 `flex:auto` 效果来实现，

</details>

## 29. object-fit 用法 {#question-c1728539-a263-46bd-b5b7-583191a4ccf8}

> 难度：2 · 类型：QA

### 题目要点

<p><strong>object-fit</strong> 属性用于控制图片或内嵌内容（如 &lt;img&gt;、&lt;video&gt;、&lt;object&gt;&#x60;等）如何填充其容器。</p><p></p><p><strong>可用值</strong></p><ul><li>fill: 默认值，内容会被拉伸以填充整个容器。</li><li>contain: 内容会被缩放以适应容器，保持宽高比，可能会有空白区域。</li><li>cover: 内容会被缩放以覆盖整个容器，保持宽高比，可能会被裁剪。</li><li>none: 内容保持原始尺寸，不进行缩放。</li><li>scale-down: 内容会被缩放，但不会超过其原始尺寸。</li></ul><p style="text-align:left;" size="0" _root="undefined" __ownerID="undefined" __hash="undefined" __altered="false"><strong>考察重点</strong></p><ul><li><strong>理解</strong>：<code>object-fit</code> 属性的不同值及其效果。</li><li><strong>应用</strong>：在实际项目中根据需求选择合适的 <code>object-fit</code> 值，确保内容的显示效果。</li></ul><p></p>

<details>
<summary>参考答案</summary>

<h1>object-fit</h1><p><strong><code>object-fit</code></strong> <u><a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS">CSS</a></u> 属性指定<u><a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/Replaced_element">可替换元素</a></u>（例如：<code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img">&lt;img&gt;</a></u></code> 或 <code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video">&lt;video&gt;</a></u></code>）的内容应该如何适应到其使用高度和宽度确定的框。</p><p><br/>你可以通过使用 <code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-position">object-position</a></u></code> 属性来切换被替换元素的内容对象在元素框内的对齐方式。</p><p></p><p><a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/object-fit#%E8%AF%AD%E6%B3%95">语法</a></p><pre><code><br/>object-fit: contain; <br/>object-fit: cover; <br/>object-fit: fill; <br/>object-fit: none; <br/>object-fit: scale-down; /* Global values */ <br/>object-fit: inherit; <br/>object-fit: initial; <br/>object-fit: revert; <br/>object-fit: revert-layer; <br/>object-fit: unset; </code></pre><p></p><p><br/>object-fit 属性由下列的值中的单独一个关键字来指定。</p><p></p><p><code>contain</code></p><p>被替换的内容将被缩放，以在填充元素的内容框时保持其宽高比。整个对象在填充盒子的同时保留其长宽比，因此如果宽高比与框的宽高比不匹配，该对象将被添加“<u><a href="https://zh.wikipedia.org/wiki/%E9%BB%91%E9%82%8A" target="_blank" class="external">黑边</a></u>”。</p><p><code>cover</code></p><p>被替换的内容在保持其宽高比的同时填充元素的整个内容框。如果对象的宽高比与内容框不相匹配，该对象将被剪裁以适应内容框。</p><p><code>fill</code></p><p>被替换的内容正好填充元素的内容框。整个对象将完全填充此框。如果对象的宽高比与内容框不相匹配，那么该对象将被拉伸以适应内容框。</p><p><code>none</code></p><p>被替换的内容将保持其原有的尺寸。</p><p><code>scale-down</code></p><p>内容的尺寸与 <code>none</code> 或 <code>contain</code> 中的一个相同，取决于它们两个之间谁得到的对象尺寸会更小一些。</p><p></p><p></p>

</details>

## 30. CSS3 中 transition 和 animation 的属性分别有哪些？ {#question-a9854cb2-406f-4837-a57f-947f818e5731}

> 难度：2 · 类型：QA

### 题目要点

#### `transition` 属性

- **`transition-property`**: 指定哪些 CSS 属性需要过渡效果。
- **`transition-duration`**: 过渡效果持续的时间。
- **`transition-timing-function`**: 过渡效果的速度曲线。
- **`transition-delay`**: 过渡效果开始前的延迟时间。

#### `animation` 属性

- **`animation-name`**: 指定关键帧名称，定义动画效果。
- **`animation-duration`**: 动画持续的时间。
- **`animation-timing-function`**: 动画的速度曲线。
- **`animation-delay`**: 动画开始前的延迟时间。
- **`animation-iteration-count`**: 动画播放的次数。
- **`animation-direction`**: 动画播放的方向（正向、反向、交替）。
- **`animation-fill-mode`**: 动画在开始和结束时的样式。

#### 考察重点

- 理解：transition 和 animation 属性及其作用。
- 应用：根据需求选择合适的属性，实现平滑的过渡效果和复杂的动画效果。

<details>
<summary>参考答案</summary>

在 CSS3 中，`transition` 和 `animation` 是两种用于实现动画效果的属性。它们分别用于不同的动画需求和实现方式。

### Transition 属性：

`transition` 属性用于定义元素在状态改变时从一个样式转换到另一个样式的过渡效果。它包含以下几个属性：

- `transition-property`：指定过渡效果应用的 CSS 属性名称，多个属性可以用逗号分隔。
- `transition-duration`：指定过渡效果的持续时间，单位可以是秒(s)或毫秒(ms)。
- `transition-timing-function`：指定过渡效果的时间曲线，也就是过渡的速度变化函数。
- `transition-delay`：指定过渡效果开始之前的延迟时间，单位可以是秒(s)或毫秒(ms)。

示例：
```css
/* 定义一个简单的过渡效果 */
.box {
  width: 100px;
  height: 100px;
  background-color: red;
  transition: width 1s ease-in-out;
}

.box:hover {
  width: 200px;
}
```

在上面的示例中，当鼠标悬停在 `.box` 元素上时，宽度从 100px 过渡到 200px，过渡持续时间为 1 秒，过渡速度为 ease-in-out。

### Animation 属性：

`animation` 属性用于定义复杂的动画效果，可以自定义关键帧（keyframes）来实现更复杂的动画效果。它包含以下几个属性：

- `animation-name`：指定定义动画的关键帧名称。
- `animation-duration`：指定动画的持续时间，单位可以是秒(s)或毫秒(ms)。
- `animation-timing-function`：指定动画的时间曲线，也就是动画的速度变化函数。
- `animation-delay`：指定动画开始之前的延迟时间，单位可以是秒(s)或毫秒(ms)。
- `animation-iteration-count`：指定动画的重复次数，可以使用一个整数值或 `infinite`（表示无限循环）。
- `animation-direction`：指定动画的播放方向，可以是 `normal`（默认），`reverse`（反向播放），`alternate`（正向再反向循环），或 `alternate-reverse`（反向再正向循环）。
- `animation-fill-mode`：指定动画在非运行时的样式，可以是 `none`（默认），`forwards`（保持最后一帧的样式），`backwards`（应用第一帧的样式），或 `both`（同时应用第一帧和最后一帧的样式）。
- `animation-play-state`：指定动画的播放状态，可以是 `running`（默认，动画正在播放）或 `paused`（动画暂停）。

示例：
```css
/* 定义一个简单的动画 */
@keyframes slide-in {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

.box {
  width: 100px;
  height: 100px;
  background-color: red;
  animation: slide-in 1s ease-in-out infinite alternate;
}
```

在上面的示例中，`.box` 元素会应用一个名为 `slide-in` 的动画，从左侧滑动进入容器，动画持续时间为 1 秒，以 ease-in-out 时间曲线播放，无限循环，并且往返运动。

</details>

## 31. 说说你对 CSS 模块化的理解 {#question-44e472a3-ebf2-4009-8403-4ec15020e0f2}

> 难度：3.5 · 类型：QA

### 题目要点

CSS 模块化是一种将 CSS 代码组织成更小、更易于管理的单元的方法。这样做可以提高代码的可维护性、可重用性和可扩展性。

#### 核心概念

1. **封装性**：每个模块的样式仅在模块内部有效，不会影响其他模块。
2. **可重用性**：模块化的 CSS 可以轻松地在不同的项目和组件中重用。
3. **可维护性**：模块化的代码更易于理解和维护，有助于团队协作。

#### 实现方式

- **CSS 预处理器**（如 SASS、LESS）：通过变量、混合、函数等提高 CSS 的抽象和复用。
- **CSS-in-JS**：在 JavaScript 中写 CSS，利用 JavaScript 的动态特性和模块系统。
- **命名规范**：如 BEM（Block Element Modifier）、SMACSS、OOCSS 等，通过命名约定实现样式的局部作用域。

#### 考察重点

- 理解：CSS 模块化的目的和好处。
- 应用：能够使用 CSS 预处理器、CSS-in-JS 或命名规范来实现 CSS 模块化。

<details>
<summary>参考答案</summary>

## CSS 发展

我们在书写 css 的时候其实经历了以下几个阶段：

* 手写原生 CSS
* 使用预处理器 Sass/Less
* 使用后处理器 PostCSS
* 使用 css modules
* 使用 css in js

### 手写原生 CSS

在我们最初学习写页面的时候，大家都学过怎么去写 css，也就以下几种情况：

* 行内样式，即直接在 html 中的 style 属性里编写 css 代码。
* 内嵌样式，即在 html h 中的 style 标签内编写 class，提供给当前页面使用。
* 导入样式，即在内联样式中 通过 @import 方法，导入其他样式，提供给当前页面使用。
* 外部样式，即使用 html 中的 link 标签，加载样式，提供给当前页面使用。

我们在不断摸索中，逐渐形成了以编写**内嵌样式**和**外部样式**为主要的编写习惯。

读到这里大家肯定有所疑问，为什么不建议使用行内样式？

> 使用行内样式的缺点
>
> * 样式不能复用。
> * 样式权重太高，样式不好覆盖。
> * 表现层与结构层没有分离。
> * 不能进行缓存，影响加载效率。

然后我们继续剖析一下，为什么不建议使用导入样式？

经测试，在 css 中使用 @import 会有以下两种情况：

1、在 IE6-8 下，@import 声明指向的样式表并不会与页面其他资源并发加载，而是等页面所有资源加载完成后才开始下载。

2、如果在 link 标签中去 @import 其他 css，页面会等到所有资源加载完成后，才开始解析 link 标签中 @import 的 css。

> 使用导入样式的缺点
>
> * 导入样式，只能放在 style 标签的第一行，放其他行则会无效。
> * @import 声明的样式表不能充分利用浏览器并发请求资源的行为，其加载行为往往会延后触发或被其他资源加载挂起。
> * 由于 @import 样式表的延后加载，可能会导致页面样式闪烁。

### 使用预处理器 Sass/Less

随着时间的不断发展，我们逐渐发现，编写源生的 css 其实并不友好，例如：源生的 css 不支持变量，不支持嵌套，不支持父选择器等等，这些种种问题，催生出了像 sass/less 这样的预处理器。

预处理器主要是强化了 css 的语法，弥补了上文说了这些问题，但本质上，打包出来的结果和源生的 css 都是一样的，只是对开发者友好，写起来更顺滑。

### 后处理器 PostCSS

随着前端工程化的不断发展，越来越多的工具被前端大佬们开发出来，愿景是把所有的重复性的工作都交给机器去做，在 css 领域就产生了 postcss。

postcss 可以称作为 css 界的 babel，它的实现原理是通过 ast 去分析我们的 css 代码，然后将分析的结果进行处理，从而衍生出了许多种处理 css 的使用场景。

常用的 postcss 使用场景有：

* 配合 stylelint 校验 css 语法
* 自动增加浏览器前缀 autoprefixer
* 编译 css next 的语法

### CSS 模块化迅速发展

随着 react、vue 等基于模块化的框架的普及使用，我们编写源生 css 的机会也越来越少。我们常常将页面拆分成许多个小组件，然后像搭积木一样将多个小组件组成最终呈现的页面。

但是我们知道，css 是根据类名去匹配元素的，如果有两个组件使用了一个相同的类名，后者就会把前者的样式给覆盖掉，看来解决样式命名的冲突是个大问题。

为了解决这个问题，产生出了 CSS 模块化的概念。

## CSS 模块化定义

* 你是否为 class 命名而感到苦恼？
* 你是否有怕跟别人使用同样 class 名而感到担忧？
* 你是否因层级结构不清晰而感到烦躁？
* 你是否因代码难以复用而感到不爽？
* 你是否因为 common.css 的庞大而感到恐惧？

你如果遇到如上问题，那么就很有必要使用 css 模块化。

## CSS 模块化的实现方式

### BEM 命名规范

BEM 的意思就是块（block）、元素（element）、修饰符（modifier）。是由 Yandex 团队提出的一种前端命名方法论。这种巧妙的命名方法让你的 css 类对其他开发者来说更加透明而且更有意义。

BEM 的命名规范如下：

```awk
/* 块即是通常所说的 Web 应用开发中的组件或模块。每个块在逻辑上和功能上都是相互独立的。 */
.block {
}

/* 元素是块中的组成部分。元素不能离开块来使用。BEM 不推荐在元素中嵌套其他元素。 */
.block__element {
}

/* 修饰符用来定义块或元素的外观和行为。同样的块在应用不同的修饰符之后，会有不同的外观 */
.block--modifier {
}复制代码
```

通过 bem 的命名方式，可以让我们的 css 代码层次结构清晰，通过严格的命名也可以解决命名冲突的问题，但也不能完全避免，毕竟只是一个命名约束，不按规范写照样能运行。

### CSS Modules

CSS Modules 指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性，通过这种方式，即可在使用时明确指定所引用的 css 样式。

并且 CSS Modules 在打包的时候会自动将类名转换成 hash 值，完全杜绝 css 类名冲突的问题。

使用方式如下：

1、定义 css 文件。

```css
.className {
  color: green;
}
/* 编写全局样式 */
:global(.className) {
  color: red;
}

/* 样式复用 */
.otherClassName {
  composes: className;
  color: yellow;
}

.otherClassName {
  composes: className from "./style.css";
}
```

2、在 js 模块中导入 css 文件。

```applescript
import styles from "./style.css";

element.innerHTML = '<div class="' + styles.className + '">';
```

3、配置 css-loader 打包。

CSS Modules 不能直接使用，而是需要进行打包，一般通过配置 css-loader 中的 modules 属性即可完成 css modules 的配置。

```awk
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use:{
          loader: 'css-loader',
          options: {
            modules: {
              // 自定义 hash 名称
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
            }
          }
       }
    ]
  }
};

```

4、最终打包出来的 css 类名就是由一长串 hash 值生成。

```processing
._2DHwuiHWMnKTOYG45T0x34 {
  color: red;
}

._10B-buq6_BEOTOl9urIjf8 {
  background-color: blue;
}
```

### CSS In JS

CSS in JS，意思就是使用 js 语言写 css，完全不需要些单独的 css 文件，所有的 css 代码全部放在组件内部，以实现 css 的模块化。

CSS in JS 其实是一种编写思想，目前已经有超过 40 多种方案的实现，最出名的是 styled-components。

使用方式如下：

```pgsql
import React from "react";
import styled from "styled-components";

// 创建一个带样式的 h1 标签
const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

// 创建一个带样式的 section 标签
const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

// 通过属性动态定义样式
const Button = styled.button`
  background: ${props => (props.primary ? "palevioletred" : "white")};
  color: ${props => (props.primary ? "white" : "palevioletred")};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

// 样式复用
const TomatoButton = styled(Button)`
  color: tomato;
  border-color: tomato;
`;

<Wrapper>
  <Title>Hello World, this is my first styled component!</Title>
  <Button primary>Primary</Button>
</Wrapper>;
```

可以看到，我们直接在 js 中编写 css，案例中在定义源生 html 时就创建好了样式，在使用的时候就可以渲染出带样式的组件了。

除此之外，还有其他比较出名的库：

* emotion
* radium
* glamorous

## 总结

最后放一张总结好的图。

![css-modules](https://static.ecool.fun//article/7d9f505d-f150-4fb1-8b9d-3f756cb18640.jpeg)

</details>

## 32. ::before 和::after 中双冒号和单冒号有什么区别、作用？ {#question-77778585-d890-4a84-9d69-4a9042f571d7}

> 难度：1 · 类型：QA

### 题目要点

#### 单冒号与双冒号

- **单冒号**（:）: 用于伪类选择器，如 `:hover`、`:focus` 等。
- **双冒号**（::）: 用于伪元素选择器，如 `::before` 和 `::after`。

#### `::before` 和 `::after`

- **`::before`**: 在元素的内容之前插入内容。
- **`::after`**: 在元素的内容之后插入内容。

#### 作用

- **内容生成**：允许在元素的前后插入额外的内容，这些内容可以是文本、图片等。
- **样式控制**：通过 CSS 控制这些插入内容的样式，如字体、颜色、位置等。

#### 考察重点

- 理解：伪类和伪元素的区别。
- 应用：使用 ::before 和 ::after 生成内容并控制样式。

<details>
<summary>参考答案</summary>

在 CSS 中伪类一直用 : 表示，如 :hover, :active 等

伪元素在 CSS1 中已存在，当时语法是用 `:` 表示，如 `:before` 和 `:after`

后来在 CSS3 中修订，伪元素用 `::` 表示，如 `::before` 和 `::after`，以此区分伪元素和伪类

由于低版本 IE 对双冒号不兼容，开发者为了兼容性各浏览器，可以继续使用 `:after` 这种老语法表示伪元素

* 单冒号（:）用于 css3 的伪类
* 双冒号（::）用于 css3 的伪元素

作用：`::before` 和 `::after` 的主要作用是在元素内容前后加上指定内容。

另外，伪类与伪元素的区别有：
* 伪类与伪元素都是用于向选择器加特殊效果
* 伪类与伪元素的本质区别就是是否抽象创造了新元素
* 伪类只要不是互斥可以叠加使用
* 伪元素在一个选择器中只能出现一次，并且只能出现在末尾
* 伪类与伪元素优先级分别与类、标签优先级相同

</details>

## 33. position: fixed 一定是相对于浏览器窗口进行定位吗？ {#question-6248429c-3007-4f72-a429-19d433e60346}

> 难度：3 · 类型：QA

### 题目要点

不一定。

<details>
<summary>参考答案</summary>

不一定。

`position:fixed;`的元素会被移出正常文档流，并不为元素预留空间，而是通过指定元素相对于屏幕视口（viewport）的位置来指定元素位置，元素的位置在屏幕滚动时不会改变。`fixed` 属性会创建新的层叠上下文。

当元素祖先的 `transform`, `perspective` 或 `filter` 属性`非 none` 时，容器由视口改为该祖先。

</details>

## 34. 单行文本怎么实现两端对齐？ {#question-4eee218f-92b4-4765-a377-0cacbeb992c1}

> 难度：1 · 类型：QA

### 题目要点

在 CSS 中，可以通过设置 `text-align` 属性为 `justify` 来实现单行文本的两端对齐，但这种方法通常用于多行文本。对于单行文本，可以使用以下技巧：

#### 方法 1: `text-align: justify` 和 `hyphens`

```css
.single-line-text {
  text-align: justify;
  hyphens: auto;
}
.single-line-text::after {
  content: '';
  display: inline-block;
  width: 100%;
}
```

这种方法利用 justify 对齐文本，并使用 hyphens 自动断字，然后在文本后添加一个空的 ::after 伪元素来填充剩余空间。

#### 方法 2: text-align: justify 和 text-justify

```css
.single-line-text {
  text-align: justify;
  text-justify: inter-word; /* 仅在 WebKit 浏览器中有效 */
}
```

这种方法在 WebKit 浏览器中通过 text-justify 属性实现单行文本的两端对齐。

#### 方法 3: 使用 CSS Grid

```css
.single-line-text {
  display: grid;
  grid-template-columns: auto 1fr;
  justify-content: end;
}
.single-line-text::before,
.single-line-text::after {
  content: '';
}
```

这种方法通过将文本包裹在一个 CSS Grid 容器中，并使用 justify-content 属性将文本推到容器的末端，实现两端对齐。

#### 考察重点

- 理解：不同浏览器对 text-align: justify 的支持和行为。
- 应用：选择合适的方法实现单行文本的两端对齐。

<details>
<summary>参考答案</summary>

说起两端对齐，大家首先想到的可能是 `text-align: justify;`，但justify对最后一行无效。

通常这样的排版对整段文字是极好的，我们并不希望当最后一行只有两个字时也两端对齐，毕竟这是不便于阅读的，那么当我们只有一行文本，但要实现单行文本两端对齐怎么解决？

## 方法一：添加一行

根据justify对最后一行无效，我们可以新增一行，使该行文本不是最后一行，实现如下：

```html
//html
<div class="item">
    <span class="label" >{{item.label}}</span>：
    <span class="value">{{item.value}}</span>
</div>
```

```css
//scss
.item {
    height: 32px;
    line-height: 32px;
    margin-bottom: 8px;
    .label {
        display: inline-block;
        height: 100%;
        width: 100px;
        text-align: justify;
        vertical-align: top;
        &::after {
            display: inline-block;
            width: 100%;
            content: '';
            height: 0;
        }
    }
    .value {
        padding-right: 10px;
    }
}
```

## 方法二： text-align-last

text-align-last，该属性定义的是一段文本中最后一行在被强制换行之前的对齐规则。

```css
//scss
.item {
    margin-bottom: 8px;
    .label {
        display: inline-block;
        height: 100%;
        min-width: 100px;
        text-align: justify;
        text-align-last: justify;
    }
    .value {
        padding-right: 10px;
    }
}
```

现在的浏览器基本都支持该属性。

![](https://static.ecool.fun//article/da3bafad-51c3-482b-a953-955e08bd220c.png)

</details>

## 35. 使用css实现一个无限循环动画 {#question-c7b08d95-edf0-4d08-ac73-ce0b87c08e85}

> 难度：1 · 类型：QA

### 题目要点

要实现一个无限循环的动画效果，可以使用 CSS 的 `animation-iteration-count` 属性设置为 `infinite`。

#### 示例

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.element {
  animation: spin 2s linear infinite;
}
```

#### 详细说明

- @keyframes: 定义动画的关键帧。
- from: 动画开始时的状态。
- to: 动画结束时的状态。
- animation 属性：
- spin: 关键帧名称。
- 2s: 动画持续时间。
- linear: 动画速度曲线。
- infinite: 动画播放次数，设置为无限循环。

#### 考察重点

- 理解：@keyframes 和 animation 属性的用法。
- 应用：能够根据需求创建无限循环的动画效果。

<details>
<summary>参考答案</summary>

想要实现CSS动画的无限循环，其实主要就是要使用`animation-iteration-count`这个属性，将其设置为`infinite`，动画就会一直循环播放。

例如：

```html
<image class="anima" mode="widthFix" @click="nav" src="@/static/1_btn.png"></image>
```

```css
.anima {
  animation-name: likes; // 动画名称
  animation-direction: alternate; // 动画在奇数次（1、3、5...）正向播放，在偶数次（2、4、6...）反向播放。
  animation-timing-function: linear; // 动画执行方式，linear：匀速；ease：先慢再快后慢；ease-in：由慢速开始；ease-out：由慢速结束；ease-in-out：由慢速开始和结束；
  animation-delay: 0s; // 动画延迟时间
  animation-iteration-count: infinite; //  动画播放次数，infinite：一直播放
  animation-duration: 1s; // 动画完成时间
}

@keyframes likes {
  0%{
    transform: scale(1);
  }
  25%{
    transform: scale(0.9);
  }
  50%{
    transform: scale(0.85);
  }
  75%{
    transform: scale(0.9);
  }
  100%{
    transform: scale(1);
  }
}
```

</details>

## 36. 怎么触发BFC，BFC有什么应用场景？ {#question-e87bce7c-af1c-41f3-ae56-142be0e3c999}

> 难度：3 · 类型：QA

### 题目要点

BFC（Block Formatting Context）是 CSS 中的一个概念，它定义了元素如何与其它元素相互作用，尤其是在布局和定位方面。触发 BFC 的常见方式包括：

1. **浮动元素**：`float` 属性不为 `none` 的元素。
2. **绝对定位元素**：`position` 属性为 `absolute` 或 `fixed`。
3. **`inline-block` 元素**：`display` 属性为 `inline-block`。
4. **`table-cell`, `table-caption` 元素**：`display` 属性为 `table-cell` 或 `table-caption`。
5. **`overflow` 不为 `visible` 的块级元素**：`overflow` 属性为 `hidden`、`auto` 或 `scroll`。

#### BFC 的应用场景

1. **防止外边距折叠**：
   - 当两个垂直方向的块级元素的外边距相遇时，会发生外边距折叠。通过创建 BFC 可以防止这种情况。

2. **自适应多栏布局**：
   - 利用 BFC 可以创建多栏布局，每栏内容自适应容器宽度。

3. **防止元素被浮动元素覆盖**：
   - 通过创建 BFC，可以确保块级元素不会被浮动元素覆盖。

4. **创建独立的布局容器**：
   - 将一个区域与页面上的其他部分隔离，实现独立的布局控制。

5. **实现清除浮动**：
   - 清除浮动元素的影响，确保后续元素的布局不受影响。

#### 考察重点

- 理解：BFC 的概念及其触发方式。
- 应用：能够根据实际需求利用 BFC 解决布局问题。

<details>
<summary>参考答案</summary>

## 文档流

在介绍BFC之前，需要先给大家介绍一下文档流。

我们常说的文档流其实分为`定位流`、`浮动流`、`普通流`三种。

## 绝对定位(Absolute positioning)

如果元素的属性 `position` 为 `absolute` 或 `fixed`，它就是一个绝对定位元素。

在绝对定位布局中，元素会整体脱离普通流，因此绝对定位元素不会对其兄弟元素造成影响，而元素具体的位置由绝对定位的坐标决定。

它的定位相对于它的包含块，相关CSS属性：`top`、`bottom`、`left`、`right`；

对于 `position: absolute`，元素定位将相对于上级元素中最近的一个`relative、fixed、absolute`，如果没有则相对于html；

对于 `position:fixed`，正常来说是相对于浏览器窗口定位的，但是当**元素祖先的 `transform` 属性非 `none` 时，会相对于该祖先进行定位**。

## 浮动 (float)

在浮动布局中，元素首先按照普通流的位置出现，然后根据浮动的方向尽可能的向左边或右边偏移，其效果与印刷排版中的文本环绕相似。

## 普通流 (normal flow)

普通流其实就是指BFC中的FC。FC(`Formatting Context`)，直译过来是格式化上下文，它是页面中的一块渲染区域，有一套渲染规则，决定了其子元素如何布局，以及和其他元素之间的关系和作用。

在普通流中，元素按照其在 HTML 中的先后位置至上而下布局，在这个过程中，行内元素水平排列，直到当行被占满然后换行。块级元素则会被渲染为完整的一个新行。

除非另外指定，否则所有元素默认都是普通流定位，也可以说，普通流中元素的位置由该元素在 HTML 文档中的位置决定。

## BFC 概念

先看下MDN上关于BFC的定义：

> 块格式化上下文（`Block Formatting Context`，`BFC`） 是Web页面的可视CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

具有 `BFC` 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 `BFC` 具有普通容器所没有的一些特性。

通俗一点来讲，可以把 `BFC` 理解为一个封闭的大箱子，箱子内部的元素无论如何翻江倒海，都不会影响到外部。

除了 BFC，还有：

* `IFC`（行级格式化上下文）- `inline` 内联
* `GFC`（网格布局格式化上下文）- `display: grid`
* `FFC`（自适应格式化上下文）- `display: flex`或`display: inline-flex`

**注意**：同一个元素不能同时存在于两个 `BFC` 中。

## BFC的触发方式

MDN上对于[BFC的触发条件](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)写的很多，总结一下常见的触发方式有（只需要满足一个条件即可触发 BFC 的特性）：

* 根元素，即 `<html>`
* 浮动元素：`float` 值为 `left` 、`right`
* `overflow` 值不为 `visible`，即为 `auto`、`scroll`、`hidden`
* `display` 值为 `inline-block`、`table-cell`、`table-caption`、`table`、`inline-table`、`flex`、`inline-flex`、`grid`、`inline-grid`
* 绝对定位元素：`position` 值为 `absolute`、`fixed`

## BFC的特性

* BFC 是页面上的一个独立容器，容器里面的子元素不会影响外面的元素。
* BFC 内部的块级盒会在垂直方向上一个接一个排列
* 同一 BFC 下的相邻块级元素可能发生外边距折叠，创建新的 BFC 可以避免外边距折叠
* 每个元素的外边距盒（`margin box`）的左边与包含块边框盒（`border box`）的左边相接触（从右向左的格式的话，则相反），即使存在浮动
* 浮动盒的区域不会和 BFC 重叠
* 计算 BFC 的高度时，浮动元素也会参与计算

## 应用

BFC是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面元素，反之亦然。我们可以利用BFC的这个特性来做很多事。

### 自适应两列布局

左列浮动（定宽或不定宽都可以），给右列开启 BFC。

```html
<div>
    <div class="left">浮动元素，无固定宽度</div>
    <div class="right">自适应</div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.left {
    float: left;
    height: 200px;
    margin-right: 10px;
    background-color: red;
}
.right {
    overflow: hidden;
    height: 200px;
    background-color: yellow;
}
```

效果：
![](https://static.ecool.fun//article/56dfc6e4-a6bd-4b57-a4ad-74611753ac45.jpeg)

* 将左列设为左浮动，将自身高度塌陷，使得其它块级元素可以和它占据同一行的位置。
* 右列为 div 块级元素，利用其自身的流特性占满整行。
* 右列设置overflow: hidden,触发 BFC 特性，使其自身与左列的浮动元素隔离开，不占满整行。

这即是上面说的 BFC 的特性之一：**浮动盒的区域不会和 BFC 重叠**

### 防止外边距（margin）重叠

兄弟元素之间的外边距重叠

```html
<div>
    <div class="child1"></div>
    <div class="child2"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.child1 {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    background-color: red;
}
.child2 {
    width: 100px;
    height: 100px;
    margin-top: 20px;
    background-color: green;
}
```

效果：
![](https://static.ecool.fun//article/c1cf8faf-19df-4ba6-92e4-60eb0dbd5b2b.jpeg)

两个块级元素，红色 div 距离底部 10px，绿色 div 距离顶部 20px，按道理应该两个块级元素相距 30px 才对，但实际却是取距离较大的一个，即 20px。

> 块级元素的上外边距和下外边距有时会合并（或折叠）为一个外边距，其大小取其中的较大者，这种行为称为外边距折叠（重叠），注意这个是发生在属于同一 BFC 下的块级元素之间

根据 BFC 特性，创建一个新的 BFC 就不会发生 margin 折叠了。比如我们在他们两个 div 外层再包裹一层容器，加属性 `overflow: hidden`，触发 BFC，那么两个 div 就不属于同个 BFC 了。

```html
<div>
    <div class="parent">
        <div class="child1"></div>
    </div>
    <div class="parent">
        <div class="child2"></div>
    </div>
</div>
```

```css
.parent {
    overflow: hidden;
}

/* ... */
```

![](https://static.ecool.fun//article/33e4f6b9-cb06-497a-b6f5-60e531cd65e7.jpeg)

这个关于兄弟元素外边距叠加的问题，除了触发 BFC 也有其他方案，比如你统一只用上边距或下边距，就不会有上面的问题。

### 父子元素的外边距重叠

这种情况存在父元素与其第一个或最后一个子元素之间（嵌套元素）。

如果在父元素与其第一个/最后一个子元素之间不存在边框、内边距、行内内容，也没有创建块格式化上下文、或者清除浮动将两者的外边距 分开，此时子元素的外边距会“溢出”到父元素的外面。

```html
<div id="parent">
  <div id="child"></div>
</div>
```
```css
* {
    margin: 0;
    padding: 0;
}
#parent {
    width: 200px;
    height: 200px;
    background-color: green;
    margin-top: 20px;
}
#child {
    width: 100px;
    height: 100px;
    background-color: red;
    margin-top: 30px;
}
```

![](https://static.ecool.fun//article/cf07826a-d756-49cf-a090-0e5deb9f729a.jpeg)

如上图，红色的 div 在绿色的 div 内部，且设置了 `margin-top` 为 30px，但我们发现红色 div 的顶部与绿色 div 顶部重合，并没有距离顶部 30px，而是溢出到父元素的外面计算。即本来父元素距离顶部只有 20px，被子元素溢出影响，外边距重叠，取较大的值，则距离顶部 30px。

解决办法：
* 给父元素触发 BFC（如添加overflow: hidden）
* 给父元素添加 border
* 给父元素添加 padding

这样就能实现我们期望的效果了：
![](https://static.ecool.fun//article/a0b5e69f-dc00-41dd-9aca-7feac4ea33b3.jpeg)

### 清除浮动解决令父元素高度坍塌的问题

当容器内子元素设置浮动时，脱离了文档流，容器中总父元素高度只有边框部分高度。

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.parent {
    border: 4px solid red;
}
.child {
    float: left;
    width: 200px;
    height: 200px;
    background-color: blue;
}
```

![](https://static.ecool.fun//article/76238cb3-62a5-466e-b9b5-6706ca911c9f.jpeg)

解决办法：给父元素触发 BFC，使其有 BFC 特性：**计算 BFC 的高度时，浮动元素也会参与计算**

```css
.parent {
    overflow: hidden;
    border: 4px solid red;
}
```

![](https://static.ecool.fun//article/e98368e4-45a8-4edb-bfbf-e6ef722fef2c.jpeg)

上面我们都是用的 `overflow: hidden` 触发 BFC，因为确实常用，但是触发 BFC 也不止是只有这一种方法。

如上面写的所示，可以设置`float: left;`，`float: right;`，`display: inline-block;`，`overflow: auto;`，`display: flex;`，`display: table;`，`position` 为 `absolute` 或 `fixed` 等等，这些都可以触发，不过父元素宽度表现不一定相同，但父元素高度都被撑出来了。

当然实际运用可不是随便挑一个走，还是根据场景选择。

</details>

## 37. 怎么实现一个宽高自适应的正方形？ {#question-84f9d3f9-88aa-4441-8868-b7c834f796fc}

> 难度：2 · 类型：QA

### 题目要点

利用vw来实现：

<details>
<summary>参考答案</summary>

- 利用vw来实现：

```css
.square {
  width: 10%;
  height: 10vw;
  background: tomato;
}
```

- 利用元素的margin/padding百分比是相对父元素width的性质来实现：

```css
.square {
  width: 20%;
  height: 0;
  padding-top: 20%;
  background: orange;
}
```

- 利用子元素的margin-top的值来实现：

```css
.square {
  width: 30%;
  overflow: hidden;
  background: yellow;
}
.square::after {
  content: '';
  display: block;
  margin-top: 100%;
}
```

</details>

## 38. z-index属性在什么情况下会失效？ {#question-e1900c3f-a1e8-426c-8f5c-3281129e1430}

> 难度：2.5 · 类型：QA

### 题目要点

`z-index` 属性用于控制元素的堆叠顺序，但有时会出现失效的情况。以下是一些常见的导致 `z-index` 失效的原因：

1. **没有设置 `position` 属性**：
   - `z-index` 仅对设置了 `position` 属性（`absolute`、`relative`、`fixed` 或 `sticky`）的元素有效。

2. **`z-index` 值不在范围内**：
   - `z-index` 可以取负值，但必须在 `position` 属性设置后才能生效。

3. **元素被隐藏**：
   - 如果元素的 `visibility` 属性设置为 `hidden`，或者 `display` 属性设置为 `none`，则 `z-index` 不会生效。

4. **`z-index` 值相同**：
   - 如果多个元素的 `z-index` 值相同，它们的堆叠顺序将按照它们在文档流中的顺序决定。

5. **`z-index` 值被覆盖**：
   - 如果父元素的 `z-index` 值较高，可能会覆盖子元素的 `z-index`。

6. **元素是 `position: static`**：
   - 静态定位的元素（`position: static`）不会创建新的层级，因此 `z-index` 不会生效。

7. **元素在不同的堆叠上下文**：
   - 堆叠上下文（Stacking Context）可以被创建，例如通过 `opacity`、`transform` 等属性，这会影响 `z-index` 的效果。

#### 考察重点

- 理解：z-index 的工作原理和限制。
- 应用：能够正确设置 z-index 以控制元素的堆叠顺序。

<details>
<summary>参考答案</summary>

通常 z-index 的使用是在有两个重叠的标签，在一定的情况下控制其中一个在另一个的上方或者下方出现。z-index值越大就越是在上层。z-index元素的position属性需要是relative，absolute或是fixed。

z-index属性在下列情况下会失效：

- 父元素position为relative时，子元素的z-index失效。解决：父元素position改为absolute或static；
- 元素没有设置position属性为非static属性。解决：设置该元素的position属性为relative，absolute或是fixed中的一种；
- 元素在设置z-index的同时还设置了float浮动。解决：float去除，改为`display：inline-block`；

20230116，有小伙伴补充：

* 在手机端 `iOS 13` 系统中，`-webkit-overflow-scrolling:touch` 也会使 `z-index` 失效，将 `touch` 换成 `unset`

具体原因可参考这篇文章： [为什么我的 z-index 又不生效了？](https://mp.weixin.qq.com/s?__biz=Mzk0NTI2NDgxNQ==&mid=2247485708&idx=1&sn=e0bbc4755dc078402697a075ff3c0d05&chksm=c31948ccf46ec1da01851d7c8e585e07e0bb5088996cf60bf1ef779b4a54d7c8584a17da4796#rd)

</details>

## 39. 说说对 CSS 工程化的理解 {#question-a603e82b-8b27-41af-9cbd-2f1baa38d922}

> 难度：4 · 类型：QA

### 题目要点

CSS 工程化是指将 CSS 代码的开发和管理过程标准化、模块化和自动化，以提高开发效率、可维护性和可扩展性。以下是一些关键点：

1. **模块化**：
   - 将 CSS 代码分解成独立的模块，每个模块负责特定的功能或组件。

2. **组件化**：
   - 将 UI 组件封装成可复用的样式，易于在不同项目中重用。

3. **命名规范**：
   - 使用一致的命名约定，如 BEM（Block Element Modifier）、SMACSS 或 OOCSS，以提高代码的可读性和可维护性。

4. **预处理器使用**：
   - 利用 SASS、LESS 等 CSS 预处理器提供的功能，如变量、混合、函数等，增强 CSS 的可维护性和可扩展性。

5. **构建工具**：
   - 使用构建工具如 Webpack、Gulp 等，自动化 CSS 的编译、压缩、合并等过程。

6. **代码质量**：
   - 通过代码审查、自动化测试等手段，确保 CSS 代码的质量和一致性。

7. **文档和注释**：
   - 编写清晰的文档和注释，帮助团队成员理解和使用 CSS 代码。

8. **性能优化**：
   - 优化 CSS 代码以减少文件大小、提高加载速度和渲染性能。

9. **响应式设计**：
   - 确保 CSS 代码能够适应不同的屏幕尺寸和设备。

#### 考察重点

- 理解：CSS 工程化的目的和好处。
- 应用：能够使用 CSS 预处理器、构建工具和命名规范实现 CSS 工程化。

<details>
<summary>参考答案</summary>

CSS 工程化是为了解决以下问题：

1. **宏观设计**：CSS 代码如何组织、如何拆分、模块结构怎样设计？
2. **编码优化**：怎样写出更好的 CSS？
3. **构建**：如何处理我的 CSS，才能让它的打包结果最优？
4. **可维护性**：代码写完了，如何最小化它后续的变更成本？如何确保任何一个同事都能轻松接手？

以下三个方向都是时下比较流行的、普适性非常好的 CSS 工程化实践：

- 预处理器：Less、 Sass 等；
- 重要的工程化插件： PostCss；
- Webpack loader 等 。

基于这三个方向，可以衍生出一些具有典型意义的子问题，这里我们逐个来看：

**（1）预处理器：为什么要用预处理器？它的出现是为了解决什么问题？**

预处理器，其实就是 CSS 世界的“轮子”。预处理器支持我们写一种类似 CSS、但实际并不是 CSS 的语言，然后把它编译成 CSS 代码：

![](https://static.ecool.fun//article/3eaa8d72-1521-41ac-bb21-0f0032ee426b.jpeg)

那为什么写 CSS 代码写得好好的，偏偏要转去写“类 CSS”呢？这就和本来用 JS 也可以实现所有功能，但最后却写 React 的 jsx 或者 Vue 的模板语法一样。

随着前端业务复杂度的提高，前端工程中对 CSS 提出了以下的诉求：

1. 宏观设计上：我们希望能优化 CSS 文件的目录结构，对现有的 CSS 文件实现复用；
2. 编码优化上：我们希望能写出结构清晰、简明易懂的 CSS，需要它具有一目了然的嵌套层级关系，而不是无差别的一铺到底写法；我们希望它具有变量特征、计算能力、循环能力等等更强的可编程性，这样我们可以少写一些无用的代码；
3. 可维护性上：更强的可编程性意味着更优质的代码结构，实现复用意味着更简单的目录结构和更强的拓展能力，这两点如果能做到，自然会带来更强的可维护性。

这三点是传统 CSS 所做不到的，也正是预处理器所解决掉的问题。预处理器普遍会具备这样的特性：

- 嵌套代码的能力，通过嵌套来反映不同 css 属性之间的层级关系 ；
- 支持定义 css 变量；
- 提供计算函数；
- 允许对代码片段进行 extend 和 mixin；
- 支持循环语句的使用；
- 支持将 CSS 文件模块化，实现复用。

**（2）PostCss：PostCss 是如何工作的？我们在什么场景下会使用 PostCss？**

![](https://static.ecool.fun//article/67cfdcba-5fe2-4b9c-84a9-a7adba836794.jpeg)

它和预处理器的不同就在于，预处理器处理的是 类CSS，而 PostCss 处理的就是 CSS 本身。Babel 可以将高版本的 JS 代码转换为低版本的 JS 代码。PostCss 做的是类似的事情：它可以编译尚未被浏览器广泛支持的先进的 CSS 语法，还可以自动为一些需要额外兼容的语法增加前缀。更强的是，由于 PostCss 有着强大的插件机制，支持各种各样的扩展，极大地强化了 CSS 的能力。

PostCss 在业务中的使用场景非常多：

- 提高 CSS 代码的可读性：PostCss 其实可以做类似预处理器能做的工作；
- 当我们的 CSS 代码需要适配低版本浏览器时，PostCss 的 [Autoprefixer](https://github.com/postcss/autoprefixer) 插件可以帮助我们自动增加浏览器前缀；
- 允许我们编写面向未来的 CSS：PostCss 能够帮助我们编译 CSS next 代码；

**（3）Webpack 能处理 CSS 吗？如何实现？**

- **Webpack 在裸奔的状态下，是不能处理 CSS 的**，Webpack 本身是一个面向 JavaScript 且只能处理 JavaScript 代码的模块化打包工具；
- Webpack 在 loader 的辅助下，是可以处理 CSS 的。

如何用 Webpack 实现对 CSS 的处理：

- Webpack 中操作 CSS 需要使用的两个关键的 loader：css-loader 和 style-loader
- 注意，答出“用什么”有时候可能还不够，面试官会怀疑你是不是在背答案，所以你还需要了解每个 loader 都做了什么事情：
  - css-loader：导入 CSS 模块，对 CSS 代码进行编译处理；
  - style-loader：创建style标签，把 CSS 内容写入标签。

在实际使用中，**css-loader 的执行顺序一定要安排在 style-loader 的前面**。因为只有完成了编译过程，才可以对 css 代码进行插入；若提前插入了未编译的代码，那么 webpack 是无法理解这坨东西的，它会无情报错。

</details>

## 40. Sass、Less 是什么？为什么要使用他们？ {#question-e894262c-f9eb-495b-bb45-5016337f3af1}

> 难度：1 · 类型：QA

### 题目要点

**Sass** 和 **Less** 是两种流行的 CSS 预处理器，它们扩展了 CSS 的功能，使得编写 CSS 更加高效和灵活。

#### 为什么要使用它们？

1. **提高开发效率**：
   - 通过变量和混合，减少重复代码，提高代码复用性。

2. **增强代码可维护性**：
   - 模块化和组件化使得代码结构更清晰，易于维护。

3. **增加样式控制**：
   - 函数和计算属性允许在 CSS 中进行更复杂的计算和逻辑处理。

4. **支持编程特性**：
   - 变量、条件语句、循环等编程特性使得 CSS 更加灵活和强大。

5. **自动化构建**：
   - 可以与构建工具（如 Webpack、Gulp）集成，自动化编译和优化过程。

6. **浏览器兼容性**：
   - 预处理器代码最终会被编译成标准的 CSS，确保在所有浏览器中的兼容性。

#### 考察重点

- 理解：Sass 和 Less 的基本概念和特性。
- 应用：能够根据项目需求选择合适的 CSS 预处理器。

<details>
<summary>参考答案</summary>

他们都是 CSS 预处理器，是 CSS 上的一种抽象层。他们是一种特殊的语法/语言编译成 CSS。 例如 Less 是一种动态样式语言，将 CSS 赋予了动态语言的特性，如变量，继承，运算， 函数，LESS 既可以在客户端上运行 (支持 IE 6+, Webkit, Firefox)，也可以在服务端运行 (借助 Node.js)。

**为什么要使用它们？**

- 结构清晰，便于扩展。 可以方便地屏蔽浏览器私有语法差异。封装对浏览器语法差异的重复处理， 减少无意义的机械劳动。
- 可以轻松实现多重继承。 完全兼容 CSS 代码，可以方便地应用到老项目中。LESS 只是在 CSS 语法上做了扩展，所以老的 CSS 代码也可以与 LESS 代码一同编译。

</details>

## 41. 怎么实现单行、多行文本溢出隐藏？ {#question-38fbd4c0-d294-4bf5-9041-250449fe0f6a}

> 难度：1 · 类型：QA

### 题目要点

单行文本溢出

<details>
<summary>参考答案</summary>

- 单行文本溢出

```css
overflow: hidden;            // 溢出隐藏
text-overflow: ellipsis;      // 溢出用省略号显示
white-space: nowrap;         // 规定段落中的文本不进行换行
```

- 多行文本溢出

```css
overflow: hidden;            // 溢出隐藏
text-overflow: ellipsis;     // 溢出用省略号显示
display:-webkit-box;         // 作为弹性伸缩盒子模型显示。
-webkit-box-orient:vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
-webkit-line-clamp:3;        // 显示的行数
```

注意：由于上面的三个属性都是 CSS3 的属性，没有浏览器可以兼容，所以要在前面加一个`-webkit-` 来兼容一部分浏览器。

</details>

## 42. CSS预处理器/后处理器是什么？为什么要使用它们？ {#question-ad2a65d2-9330-4f65-9be7-b61e11e10c02}

> 难度：2 · 类型：QA

### 题目要点

CSS预处理器和后处理器是改善CSS编写和管理的工具,主要优势如下:

**CSS预处理器:**

1. 添加变量、函数、混合(mixin)等高级功能,提高CSS的可维护性和模块化
2. 支持嵌套语法,使CSS结构更清晰易读
3. 提供代码复用的机制,减少重复编写
4. 常见的CSS预处理器有Sass、Less和Stylus。

**CSS后处理器:**

1. 自动添加浏览器前缀,提高CSS的兼容性
2. 优化CSS代码,如代码压缩、自动排序等
3. 支持模块化、变量、函数等高级功能
4. 常见的CSS后处理器有PostCSS和Autoprefixer。

总之,使用CSS预处理器和后处理器可以提高CSS的可维护性、模块化和跨浏览器兼容性,从而更好地管理和优化CSS代码。

<details>
<summary>参考答案</summary>

**预处理器，** 如：`less`，`sass`，`stylus`，用来预编译`sass`或者`less`，增加了`css`代码的复用性。层级，`mixin`， 变量，循环， 函数等对编写以及开发UI组件都极为方便。

**后处理器，** 如： `postCss`，通常是在完成的样式表中根据`css`规范处理`css`，让其更加有效。目前最常做的是给`css`属性添加浏览器私有前缀，实现跨浏览器兼容性的问题。

`css`预处理器为`css`增加一些编程特性，无需考虑浏览器的兼容问题，可以在`CSS`中使用变量，简单的逻辑程序，函数等在编程语言中的一些基本的性能，可以让`css`更加的简洁，增加适应性以及可读性，可维护性等。

其它`css`预处理器语言：`Sass（Scss）`, `Less`, `Stylus`, `Turbine`, `Swithch css`, `CSS Cacheer`, `DT Css`。

使用原因：

- 结构清晰， 便于扩展
- 可以很方便的屏蔽浏览器私有语法的差异
- 可以轻松实现多重继承
- 完美的兼容了`CSS`代码，可以应用到老项目中

</details>

## 43. 为什么有时候⽤translate来改变位置⽽不是使用position进行定位？ {#question-98cd24a6-d666-4ddd-a696-f74fbe1552a1}

> 难度：1.5 · 类型：QA

### 题目要点

使用 translate() 来改变元素位置相比于使用 position 属性有以下几个优势:

**性能更好:**

- translate() 是合成属性,通常由浏览器的合成线程来处理,不会触发重排(reflow)和重绘(repaint)。
- position 定位会触发重排和重绘,对性能的影响较大。

**不会影响布局:**

- translate() 只改变元素的视觉位置,不会影响其他元素的布局。
- position 定位会改变元素在文档流中的位置,会影响其他元素的布局。

**动画效果更流畅:**

- translate() 的动画效果更流畅,因为合成线程处理更高效。
- position 定位的动画可能会出现卡顿或跳跃的情况。

因此,在不需要改变元素在文档流中的位置,只需要改变视觉位置时,使用 translate() 通常是更好的选择。它可以提高性能,不影响布局,并且产生更流畅的动画效果。

**考察重点**

- 理解：transform 和 position 属性的区别。
- 应用：根据布局需求和性能考虑，选择合适的方法改变元素位置。

<details>
<summary>参考答案</summary>

translate 是 transform 属性的⼀个值。

改变transform或opacity不会触发浏览器重新布局（reflow）或重绘（repaint），只会触发复合（compositions）。

⽽改变绝对定位会触发重新布局，进⽽触发重绘和复合。

transform使浏览器为元素创建⼀个 GPU 图层，但改变绝对定位会使⽤到 CPU。

因此translate()更⾼效，可以缩短平滑动画的绘制时间。

⽽translate改变位置时，元素依然会占据其原始空间，绝对定位就不会发⽣这种情况。

具体的原理可查看 [【前端基础系列】CSS篇-带你搞懂“硬件加速”](https://mp.weixin.qq.com/s?__biz=Mzk0NTI2NDgxNQ==&mid=2247484939&idx=1&sn=229467c549cec5e3980671f488a4d89e&chksm=c31947cbf46ecedd13f930b44e9bc2a25ce706a8d30fce56c54584598015640338a6e075b8ff#rd)

</details>

## 44. transition和animation的区别 {#question-07d98297-cc3c-434b-9eb5-307858ded62d}

> 难度：1 · 类型：QA

### 题目要点

transition是过度属性，强调过度，它的实现需要触发一个事件（比如鼠标移动上去，焦点，点击等）才执行动画。它类似于flash的补间动画，设置一个开始关键帧，一个结束关键帧。

<details>
<summary>参考答案</summary>

* transition是过度属性，强调过度，它的实现需要触发一个事件（比如鼠标移动上去，焦点，点击等）才执行动画。它类似于flash的补间动画，设置一个开始关键帧，一个结束关键帧。
* animation是动画属性，它的实现不需要触发事件，设定好时间之后可以自己执行，且可以循环一个动画。它也类似于flash的补间动画，但是它可以设置多个关键帧（用@keyframe定义）完成动画。

</details>

## 45. 在解决动画卡顿问题时，会引导硬件加速，那么硬件加速的原理是什么？ {#question-5adab921-8dfb-4a65-9f44-38ae8a70820f}

> 难度：4 · 类型：QA

### 题目要点

硬件加速是指利用 GPU（图形处理单元）来执行图形和动画相关的计算任务，以减轻 CPU（中央处理单元）的负担。GPU 专为处理图形和图像的高吞吐量操作而设计，因此在执行动画和复杂图形渲染时，硬件加速可以提供更流畅的体验。

#### 原理解析

1. **GPU vs CPU**：
   - GPU 拥有更多的核心，适合并行处理大量计算任务，而 CPU 核心较少，更适合串行处理复杂逻辑。

2. **图形渲染**：
   - GPU 优化了图形渲染流程，包括顶点处理、像素着色等，这些是动画和图形显示的基础。

3. **减少重绘和回流**：
   - 通过硬件加速，可以减少浏览器的重绘（repaint）和回流（reflow）次数，这些操作通常由 DOM 变更触发，非常消耗性能。

4. **合成层（Compositing Layer）**：
   - 浏览器使用合成层来合并多个层的图形，GPU 可以快速地在这些层上进行变换和动画。

5. **CSS 属性触发**：
   - 某些 CSS 属性，如 `transform` 的 3D 变换（`translate3d`、`scale3d` 等）和 `opacity` 动画，可以触发硬件加速。

6. **浏览器优化**：
   - 浏览器会根据性能和资源情况，自动决定是否使用硬件加速。

#### 考察重点

- 理解：硬件加速的基本概念和 GPU 在图形渲染中的作用。
- 应用：知道哪些 CSS 属性可以触发硬件加速，以及如何利用它们来优化动画性能。

<details>
<summary>参考答案</summary>

面试中可能会经常会碰到怎么解决动画卡顿的问题，然后会引导到硬件加速。那么究竟什么是硬件加速，为什么它可以提高咱们的动画效率？我们今天就来一探究竟。

首先，我们先从 CPU 和 GPU 开始了解。

## CPU 和 GPU 的区别

`CPU` 即中央处理器，`GPU` 即图形处理器。

`CPU`是计算机的大脑，它提供了一套指令集，我们写的程序最终会通过 `CPU` 指令来控制的计算机的运行。它会对指令进行译码，然后通过逻辑电路执行该指令。整个执行的流程分为了多个阶段，叫做流水线。指令流水线包括取`指令、译码、执行、取数、写回`五步，这是一个指令周期。`CPU`会不断的执行指令周期来完成各种任务。

`GPU`，是`Graphics ProcessingUnit`的简写，是现代显卡中非常重要的一个部分，其地位与`CPU`在主板上的地位一致，主要负责的任务是加速图形处理速度。GPU是显卡的“大脑”，它决定了该显卡的档次和大部分性能，同时也是2D显示卡和3D显示卡的区别依据。2D显示芯片在处理3D图像和特效时主要依赖CPU的处理能力，称为“软加速”。3D显示芯片是将三维图像和特效处理功能集中在显示芯片内，也即所谓的“硬件加速”功能。

要解释两者的区别，要先明白两者的相同之处：两者都有总线和外界联系，有自己的缓存体系，以及数字和逻辑运算单元。

一句话，两者都为了完成计算任务而设计。

两者的区别在于存在于片内的缓存体系和数字逻辑运算单元的结构差异：

* `CPU`虽然有多核，但总数没有超过两位数，每个核都有足够大的缓存和足够多的数字和逻辑运算单元，并辅助有很多加速分支判断甚至更复杂的逻辑判断的硬件；
* `GPU` 的核数远超`CPU`，被称为众核（NVIDIA Fermi有512个核）。每个核拥有的缓存大小相对小，数字逻辑运算单元也少而简单（`GPU`初始时在浮点计算上一直弱于`CPU`）。

从结果上导致`CPU`擅长处理具有复杂计算步骤和复杂数据依赖的计算任务，如分布式计算，数据压缩，人工智能，物理模拟，以及其他很多很多计算任务等。

`GPU`由于历史原因，是为了视频游戏而产生的（至今其主要驱动力还是不断增长的视频游戏市场），在三维游戏中常常出现的一类操作是对海量数据进行相同的操作，如：对每一个顶点进行同样的坐标变换，对每一个顶点按照同样的光照模型计算颜色值。

GPU的众核架构非常适合把同样的指令流并行发送到众核上，采用不同的输入数据执行。在通用计算领域有广泛应用，包括：数值分析，海量数据处理（排序，Map-Reduce等），金融分析等等。

简而言之，当程序员为CPU编写程序时，他们倾向于利用复杂的逻辑结构优化算法从而减少计算任务的运行时间，即 `Latency`。当程序员为GPU编写程序时，则利用其处理海量数据的优势，通过提高总的数据吞吐量（`Throughput`）来掩盖 `Lantency`。

目前，`CPU` 和 `GPU` 的区别正在逐渐缩小，因为GPU也在处理不规则任务和线程间通信方面有了长足的进步。

## 每一帧的执行步骤

一般浏览器的刷新率为60HZ，即1秒钟刷新60次。

1000ms / 60hz = 16.6 ，也就是大概每过 `16.6ms` 浏览器就会渲染一帧画面。

浏览器对每一帧画面的渲染工作都要在 16ms 内完成，超出这个时间，页面的渲染就会出现卡顿现象，影响用户体验。

简单概括下，浏览器在每一帧里会依次执行以下这些动作：

* `JavaScript`：JavaScript 实现动画效果，DOM 元素操作等。
* `Style`（计算样式）：确定每个 DOM 元素应该应用什么 CSS 规则。
* `Layout`（布局）：计算每个 DOM 元素在最终屏幕上显示的大小和位置。由于 web 页面的元素布局是相对的，所以其中任意一个元素的位置发生变化，都会联动的引起其他元素发生变化，这个过程叫 reflow。
* `Paint`（绘制）：在多个层上绘制 DOM 元素的的文字、颜色、图像、边框和阴影等。
* `Composite`（渲染层合并）：按照合理的顺序合并图层然后显示到屏幕上。

减少或者避免 `layout`，`paint` 可以让页面减少卡顿，动画效果更加流畅。

## 完整的渲染流程

更具体一些，一个完整的渲染步骤大致可总结为如下：

* 渲染进程将HTML内容转换为能够读懂的DOM树结构。
* 渲染引擎将CSS样式表转化为浏览器可以理解的 `styleSheets` ，计算出DOM节点的样式。
* 创建布局树，并计算元素的布局信息。
* 对布局树进行分层，并生成分层树。
* 为每个图层生成绘制列表，并将其提交到合成线程。
* 合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图。
* 合成线程发送绘制图块命令DrawQuad给浏览器进程。
* 浏览器进程根据DrawQuad消息生成页面，并显示到显示器上

## 普通图层和复合图层

上面的介绍中，提到了 `composite` 概念。

可以简单的这样理解，浏览器渲染的图层一般包含两大类：`渲染图层（普通图层）`以及`复合图层`

* 渲染图层：又称默认复合层，是页面普通的文档流。我们虽然可以通过绝对定位，相对定位，浮动定位脱离文档流，但它仍然属于默认复合层，共用同一个绘图上下文对象（`GraphicsContext`）。
* 复合图层，它会单独分配资源（当然也会脱离普通文档流，这样一来，不管这个复合图层中怎么变化，也不会影响默认复合层里的回流重绘）

某些特殊的渲染层会被提升为复合成层（`Compositing Layers`），复合图层拥有单独的 `GraphicsLayer`，而其他不是复合图层的渲染层，则和其第一个拥有 `GraphicsLayer` 父层共用一个。

每个 `GraphicsLayer` 都有一个 `GraphicsContext`，`GraphicsContext` 会负责输出该层的位图，位图是存储在共享内存中，作为纹理上传到 GPU 中，最后由 GPU 将多个位图进行合成，然后 draw 到屏幕上，此时，我们的页面也就展现到了屏幕上。

可以 `Chrome源码调试 -> More Tools -> Rendering -> Layer borders`中看到，黄色的就是复合图层信息。

## 硬件加速

硬件加速，直观上说就是依赖 GPU 实现图形绘制加速，软硬件加速的区别主要是图形的绘制究竟是 GPU 来处理还是 CPU，如果是 GPU，就认为是硬件加速绘制，反之，则为软件绘制。

一般一个元素开启硬件加速后会变成复合图层，可以独立于普通文档流中，改动后可以避免整个页面重绘，提升性能。

常用的硬件加速方法有：

* 最常用的方式：`translate3d`、`translateZ`
* `opacity` 属性/过渡动画（需要动画执行的过程中才会创建合成层，动画没有开始或结束后元素还会回到之前的状态）
* `will-change`属性（这个知识点比较冷僻），一般配合 `opacity` 与 `translate` 使用（而且经测试，除了上述可以引发硬件加速的属性外，其它属性并不会变成复合层），作用是提前告诉浏览器要变化，这样浏览器会开始做一些优化工作（这个最好用完后就释放）
* `<video>`、`&lt;iframe&gt;`、`<canvas>`、`<webgl>`等元素
* 其它，譬如以前的 `flash` 插件

当然，有的时候我们想强制触发硬件渲染，就可以通过上面的属性，比如

```css
will-change: transform;
```
或者
```css
transform:translate3d(0, 0, 0);
```

## 使用硬件加速的注意事项

使用硬件加速并不是十全十美的事情，比如：

* 内存。如果GPU加载了大量的纹理，那么很容易就会发生内容问题，这一点在移动端浏览器上尤为明显，所以，一定要牢记不要让页面的每个元素都使用硬件加速。
* 使用GPU渲染会影响字体的抗锯齿效果。这是因为GPU和CPU具有不同的渲染机制。即使最终硬件加速停止了，文本还是会在动画期间显示得很模糊。

所以不要大量使用复合图层，否则由于资源消耗过度，页面可能会变的更加卡顿。

同时，在使用硬件加速时，尽可能的使用`z-index`，防止浏览器默认给后续的元素创建复合层渲染。

具体的原理是这样的：

> webkit CSS3中，如果一个元素添加了硬件加速，并且`z-index`层级比较低，那么在这个元素的后面其它元素（层级比这个元素高的，或者相同的，并且`releative`或`absolute`属性相同的），会默认变为复合层渲染，如果处理不当会极大的影响性能。

简单点理解，其实可以认为是一个隐式合成的概念：如果a是一个复合图层，而且b在a上面，那么b也会被隐式转为一个复合图层，这点需要特别注意。

</details>

## 46. 什么是硬件加速？ {#question-9f6cb07a-c464-4b2e-b2ab-9861e56c4de3}

> 难度：1.5 · 类型：QA

### 题目要点

硬件加速就是将浏览器的渲染过程交给GPU处理，而不是使用自带的比较慢的渲染器。这样就可以使得 `animation` 与 `transition` 更加顺畅。

<details>
<summary>参考答案</summary>

硬件加速就是将浏览器的渲染过程交给GPU处理，而不是使用自带的比较慢的渲染器。这样就可以使得 `animation` 与 `transition` 更加顺畅。

我们可以在浏览器中用css开启硬件加速，使GPU (Graphics Processing Unit) 发挥功能，从而提升性能。

现在大多数电脑的显卡都支持硬件加速。鉴于此，我们可以发挥GPU的力量，从而使我们的网站或应用表现的更为流畅。

</details>

## 47. CSS动画和JS实现的动画分别有哪些优缺点？ {#question-0139d2e8-67c1-40f9-868e-5f277e223629}

> 难度：2 · 类型：QA

### 题目要点

#### CSS 动画

**优点**：

1. **简单易用**：通过声明式的方式直接在 CSS 中定义动画。
2. **性能好**：CSS 动画可以由浏览器优化，通常利用 GPU 加速。
3. **易于维护**：动画与样式定义在一起，方便管理和复用。
4. **无需 JavaScript**：不需要编写额外的 JavaScript 代码来控制动画。

**缺点**：

1. **控制性差**：难以实现复杂的交互和状态控制。
2. **功能有限**：CSS 动画功能相对简单，难以实现复杂的动画效果。
3. **兼容性问题**：一些旧浏览器对 CSS 动画的支持不佳。

#### JS 实现动画

**优点**：

1. **灵活性高**：JavaScript 可以控制动画的每一个细节，实现复杂的逻辑和交互。
2. **功能强大**：可以结合其他 JavaScript 库或框架，实现几乎任何类型的动画。
3. **控制性强**：可以根据用户交互或程序状态动态控制动画。

**缺点**：

1. **性能问题**：JavaScript 动画可能受到 JavaScript 执行效率和浏览器渲染性能的影响。
2. **实现复杂**：需要编写更多的代码来控制动画的开始、结束和变化。
3. **依赖 JavaScript**：在没有 JavaScript 支持的环境中，动画将无法工作。

#### 考察重点

- 理解：CSS 动画和 JavaScript 动画的基本实现方式。
- 选择：根据项目需求和环境选择合适的动画实现方式。
- 优化：了解如何优化 CSS 和 JS 动画的性能和用户体验。

<details>
<summary>参考答案</summary>

## CSS动画

### 优点

* 浏览器可以对动画进行优化<br>
* 代码相对简单,性能调优方向固定<br>
* 对于帧速表现不好的低版本浏览器，`CSS3`可以做到自然降级，而`JS`则需要撰写额外代码

### 缺点

* 运行过程控制较弱,无法附加事件绑定回调函数<br>
* 代码冗长，想用`CSS`实现稍微复杂一点动画,最后`CSS`代码都会变得非常笨重

## JS动画

### 优点

* 控制能力很强, 可以在动画播放过程中对动画进行控制：开始、暂停、回放、终止、取消都是可以做到的。<br>
* 动画效果比`css3`动画丰富,有些动画效果，比如曲线运动,冲击闪烁,视差滚动效果，只有`js`动画才能完成<br>
* `CSS3`有兼容性问题，而`JS`大多时候没有兼容性问题

### 缺点<br>

* 代码的复杂度高于`CSS`动画<br>
* `JavaScript`在浏览器的主线程中运行，而主线程中还有其它需要运行的`JavaScript`脚本、样式计算、布局、绘制任务等,对其干扰导致线程可能出现阻塞，从而造成丢帧的情况

</details>

## 48. 前端实现动画有哪些方式？ {#question-8b516cb7-fa94-4d68-929f-d3c628d1b7a2}

> 难度：2 · 类型：QA

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

## 49. 下面代码中，p标签的背景色是什么？ {#question-e34edfe5-0ce6-47f8-9de0-b8a1bfe72be0}

> 难度：1 · 类型：QA

```html
<style type="text/css">
     #parent p { background-color: red;  }
      div .a.b.c.d.e.f.g.h.i.j.k p{ background-color: green;
</style>
......
<div id="parent">
     <div class="a b c d e f g h i j k">
         <p>xxxx</p>
     </div>
</div>

```

### 题目要点

大家需要注意，权重是按优先级进行比较的，而不是相加规则。

<details>
<summary>参考答案</summary>

大家需要注意，权重是按优先级进行比较的，而不是相加规则。

答案是 `red`。

</details>

## 50. 假设下面样式都作用于同一个节点元素`span`，判断下面哪个样式会生效 {#question-ed616567-30f4-45d4-b910-04bd4a92f53e}

> 难度：1 · 类型：QA

```css
body#god div.dad span.son {width: 200px;}
body#god span#test {width: 250px;}
```

### 题目要点

本题考察css的样式优先级权重，大家需要记住：

<details>
<summary>参考答案</summary>

本题考察css的样式优先级权重，大家需要记住：

当两个权值进行比较的时候，是从高到低逐级将等级位上的权重值（如 权值 1,0,0,0 对应--> 第一等级权重值，第二等级权重值，第三等级权重值，第四等级权重值）来进行比较的，而不是简单的 1000个数 + 100个数 + 10个数 + 1个数 的总和来进行比较的，换句话说，低等级的选择器，个数再多也不会越等级超过高等级的选择器的优先级的。

所以本题的分析思路是：
* 先比较高权重位，即第一个样式的高权重为 `#god` = 100
* 第二个样式的高权重为 `#god` + `#text` = 200
* 100 < 200
* 所以最终计算结果是取 `width: 250px;`
* 若两个样式的高权重数量一样的话，则需要比较下一较高权重！

答案是  `width: 250px;`

</details>

## 51. 为何CSS不支持父选择器？ {#question-f430e672-45b0-4836-9ef0-09f427900dd4}

> 难度：3 · 类型：QA

### 题目要点

CSS（层叠样式表）的设计哲学是选择子元素以应用样式，而不是选择父元素。以下是一些原因解释为什么 CSS 不支持父选择器：

1. **避免复杂性**：
   - 父选择器会增加 CSS 选择器的复杂性，使得 CSS 更难理解和维护。

2. **防止样式泄露**：
   - 如果允许父选择器，可能会意外地将样式应用到不希望改变样式的父元素上，导致样式泄露。

3. **保持选择器的一致性**：
   - CSS 选择器设计为从右到左的匹配方式，即从最具体的元素开始选择。父选择器会打破这种一致性。

4. **性能考虑**：
   - 父选择器可能会降低 CSS 选择器的匹配效率，因为浏览器需要检查更多的元素关系。

5. **避免依赖于 DOM 结构**：
   - CSS 设计为与 DOM 结构相对独立，父选择器会使得样式过于依赖于特定的 DOM 结构。

6. **提高可维护性**：
   - 没有父选择器可以鼓励开发者编写更模块化、更易于维护的 CSS 代码。

7. **符合 CSS 的作用域原则**：
   - CSS 的作用域是从父到子，而不是相反。父选择器与这一原则相悖。

#### 考察重点

- 理解：CSS 设计原则和为什么不支持父选择器。
- 应用：知道如何使用现有的 CSS 选择器来实现所需的样式效果。

<details>
<summary>参考答案</summary>

这个问题的答案和“为何CSS相邻兄弟选择器只支持后面的元素，而不支持前面的兄弟元素？”是一样的。

浏览器解析HTML文档，是从前往后，由外及里的。所以，我们时常会看到页面先出现头部然后主体内容再出现的加载情况。

但是，如果CSS支持了父选择器，那就必须要页面所有子元素加载完毕才能渲染HTML文档，因为所谓“父选择器”，就是后代元素影响祖先元素，如果后代元素还没加载处理，如何影响祖先元素的样式？于是，网页渲染呈现速度就会大大减慢，浏览器会出现长时间的白板。加载多少HTML就可以渲染多少HTML，在网速不是很快的时候，就显得尤为的必要。比方说你现在看的这篇文章，只要文章内容加载出来就可以了，就算后面的广告脚本阻塞了后续HTML文档的加载，我们也是可以阅读和体验。但是，如果支持父选择器，则整个文档不能有阻塞，页面的可访问性则要大大降低。

有人可能会说，要不采取加载到哪里就渲染到哪里的策略？这样子问题更大，因为会出现加载到子元素的时候，父元素本来渲染的样式突然变成了另外一个样式的情况，体验非常不好。

“相邻选择器只能选择后面的元素”也是一样的道理，不可能说后面的HTML加载好了，还会影响前面HTML的样式。

所以，从这一点来讲，CSS支持“父选择器”或者“前兄弟选择器”的可能性要比其他炫酷的CSS特性要低，倒不是技术层面，而是CSS和HTML本身的渲染机制决定的。当然，以后的事情谁都说不准，说不定以后网速都是每秒几个G的，网页加载速度完全就忽略不计，说不定就会支持了。

</details>

## 52. 脱离文档流有哪些方法？ {#question-f00474b0-83a2-4723-8bee-0e2abe8b8277}

> 难度：1 · 类型：QA

### 题目要点

在 CSS 中，脱离文档流（也称为"从文档流中取出"）意味着元素的位置和尺寸不会影响到其他元素的布局。以下是一些常见的方法来使元素脱离文档流：

1. **绝对定位（`position: absolute`）**：
   - 将元素从文档流中取出，并相对于其最近的已定位（非 static）祖先元素定位。

2. **固定定位（`position: fixed`）**：
   - 元素会相对于浏览器窗口进行定位，即使滚动页面也不会移动。

3. **浮动（`float`）**：
   - 元素会脱离文档流并沿着其父元素的边缘放置，直到没有空间。

<details>
<summary>参考答案</summary>

## 一、什么是文档流？

将窗体自上而下分成一行一行，并在每行中按从左至右依次排放元素，称为文档流，也称为普通流。

这个应该不难理解，HTML中全部元素都是盒模型，盒模型占用一定的空间，依次排放在HTML中，形成了文档流。

## 二、什么是脱离文档流？

元素脱离文档流之后，将不再在文档流中占据空间，而是处于浮动状态（可以理解为漂浮在文档流的上方）。脱离文档流的元素的定位基于正常的文档流，当一个元素脱离文档流后，依然在文档流中的其他元素将忽略该元素并填补其原先的空间。

## 三、怎么脱离文档流？

### float

使用float可以脱离文档流。

注意！！！：使用float脱离文档流时，其他盒子会无视这个元素，但其他盒子内的文本依然会为这个元素让出位置，环绕在该元素的周围。

### absolute

absolute称为绝对定位，其实博主觉得应该称为相对定位，因为使用absolute脱离文档流后的元素，是相对于该元素的父类（及以上，如果直系父类元素不满足条件则继续向上查询）元素进行定位的，并且这个父类元素的position必须是非static定位的（static是默认定位方式）。

### fixed

完全脱离文档流，相对于浏览器窗口进行定位。（相对于浏览器窗口就是相对于html）。

</details>

## 53. 第二个子元素的高度是多少 {#question-5cb7ee1c-c527-40f9-b00b-eb65bde48657}

> 难度：1 · 类型：QA

```html
<div class="container">
    <div style="height: 100px"></div>
    <div style="min-height: 10px"></div>
</div>
<style>
    .container{
        display: flex;
    }
    .container > div {
        width: 100px;
    }
</style>
```

### 题目要点

答案：100px

<details>
<summary>参考答案</summary>

答案：100px

Flex 布局会默认：

* 把所有子项变成水平排列。
* 默认不自动换行。
* 让子项与其内容等宽，并把所有子项的高度变为最高子项的高度。

> 本答案由“前端面试题宝典”收集整理，PC端访问请前往： https://fe.ecool.fun/

</details>

## 54. CSSOM树和DOM树是同时解析的吗？ {#question-9f396d9a-43dc-4f39-a53a-3d25fa1cf348}

> 难度：1 · 类型：QA

### 题目要点

浏览器会下下载HTML解析页面生成DOM树，遇到CSS标签就开始解析CSS，这个过程不会阻塞，但是如果遇到了JS脚本，此时假如CSSOM还没有构建完，需要等待CSSOM构建完，再去执行JS脚本，然后再执行DOM解析，此时会阻塞。

<details>
<summary>参考答案</summary>

浏览器会下下载HTML解析页面生成DOM树，遇到CSS标签就开始解析CSS，这个过程不会阻塞，但是如果遇到了JS脚本，此时假如CSSOM还没有构建完，需要等待CSSOM构建完，再去执行JS脚本，然后再执行DOM解析，此时会阻塞。

</details>

## 55. 怎么实现样式隔离？ {#question-f47b5d5d-4aec-44a9-907d-a2a054d6984e}

> 难度：3 · 类型：QA

### 题目要点

实现样式隔离的常见方法有：

1. **CSS 模块化**：为每个样式生成唯一的类名，避免样式冲突。
2. **Shadow DOM**：通过封闭的 DOM 子树，彻底隔离样式和行为。
3. **BEM**：通过命名规范将样式限定在一个块内，减少样式污染。
4. **Scoped CSS**：通过框架的支持，自动限定样式的作用域。
5. **CSS-in-JS**：将样式和组件逻辑结合，避免全局污染。
6. **原生 CSS Scoped 支持**：现代框架提供的样式作用域控制功能。

<details>
<summary>参考答案</summary>

在前端开发中，**样式隔离**（CSS Isolation）是指确保不同模块或组件之间的样式不会相互影响，避免样式冲突。特别是在大型应用中，多个组件或页面可能使用相同的类名或样式规则，导致它们之间的样式互相覆盖或污染。

实现样式隔离有几种常见的方式，以下是几种常见的实现方法：

### 1. **CSS 模块化（CSS Modules）**
CSS 模块化是一种通过给每个样式类加上唯一标识符来避免全局污染的技术。它通常与 JavaScript 框架（如 React、Vue 等）一起使用。

#### 原理：
CSS 模块化将 CSS 类名在编译时进行哈希处理，确保类名的唯一性。这样，即使不同组件使用相同的类名，生成的最终样式也不会冲突。

#### 示例：
使用 CSS 模块化时，你可以这样写：

```css
/* styles.module.css */
.button {
  background-color: blue;
}
```

在 JavaScript 组件中：

```jsx
import React from 'react';
import styles from './styles.module.css';

const Button = () => {
  return <button className={styles.button}>Click me</button>;
};
```

这样生成的 `button` 类名会被自动处理为一个唯一的哈希值（如 `.button_x12hs8`），避免了与其他组件的样式冲突。

#### 优点：
- 自动生成唯一的类名，避免全局样式污染。
- 可以和 React、Vue 等框架无缝集成。

#### 缺点：
- 需要使用构建工具（如 Webpack）支持 CSS Modules。

### 2. **Shadow DOM**
**Shadow DOM** 是 Web Components 的一部分，它允许将样式和 DOM 隔离在一个封闭的区域中。这样，样式只会影响 Shadow DOM 内的元素，而不会影响外部文档。

#### 原理：
通过使用 Shadow DOM，你可以创建一个封闭的 DOM 子树，在该树内的样式和元素都与外部的 DOM 相隔离。

#### 示例：
```html
<template id="my-component">
  <style>
    .button {
      background-color: red;
    }
  </style>
  <button class="button">Click me</button>
</template>

<script>
  class MyComponent extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({mode: 'open'});
      const template = document.getElementById('my-component');
      shadow.appendChild(template.content.cloneNode(true));
    }
  }

  customElements.define('my-component', MyComponent);
</script>
```

通过这种方式，`.button` 类只会影响到 `my-component` 组件内部的按钮，而不会影响外部页面的按钮。

#### 优点：
- 完全的样式隔离。
- 防止外部样式影响组件的外观。

#### 缺点：
- 在某些环境中（比如旧版本的浏览器）可能不完全支持 Shadow DOM。
- 对于复杂的样式，可能需要更多的开发工作来确保兼容性。

### 3. **BEM（块、元素、修饰符）命名规范**
**BEM** 是一种命名约定，用于保持类名的结构化和避免样式冲突。通过给每个元素指定更具描述性的类名，可以有效减少全局样式冲突的可能性。

#### 原理：
BEM 采用嵌套结构的类名约定，如 `block__element--modifier`。例如：

```css
/* Block */
.button {
  background-color: blue;
}

/* Element */
.button__text {
  color: white;
}

/* Modifier */
.button--large {
  font-size: 20px;
}
```

#### 示例：
```html
<div class="button button--large">
  <span class="button__text">Click me</span>
</div>
```

在这个例子中，`button`, `button__text`, 和 `button--large` 都有明确的命名空间，减少了类名冲突的风险。

#### 优点：
- 通过有意义的命名减少样式冲突。
- 可维护性强，适合大型团队和项目。

#### 缺点：
- 可能导致类名冗长，不够简洁。

### 4. **Scoped CSS**
在 Vue.js 或其他一些前端框架中，**scoped CSS** 允许你为每个组件定义只在该组件范围内生效的 CSS 样式。通过这种方式，组件内的样式不会影响到全局样式。

#### 原理：
使用 `scoped` 特性时，框架会自动为每个组件生成一个唯一的类名，并将其添加到样式表中。这样，样式只会应用于该组件的 DOM。

#### 示例：
在 Vue 中使用 scoped CSS：

```vue
<template>
  <button class="button">Click me</button>
</template>

<style scoped>
.button {
  background-color: green;
}
</style>
```

在 Vue 的 `scoped` CSS 中，样式只会作用于该组件内的 `.button` 元素，而不会影响全局的 `.button` 元素。

#### 优点：
- 简单易用。
- 自动生成唯一类名，避免样式冲突。

#### 缺点：
- 不同框架的支持方式不同，不一定适用于所有场景。

### 5. **CSS-in-JS**
CSS-in-JS 是一种将 CSS 与 JavaScript 结合的技术，常见于 React 中的样式库（如 styled-components 和 Emotion）。它允许你将样式直接写在 JavaScript 中，并通过 JavaScript 动态生成类名或样式规则。

#### 示例：
使用 `styled-components` 来创建一个样式隔离的组件：

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background-color: blue;
  color: white;
`;

const App = () => {
  return <Button>Click me</Button>;
};
```

通过这种方式，`styled-components` 会为 `Button` 组件生成一个唯一的类名，避免与其他组件样式冲突。

#### 优点：
- 样式与组件紧密结合，增强可维护性。
- 动态样式，适应各种场景。

#### 缺点：
- 可能增加性能开销，特别是动态生成大量样式时。
- 依赖第三方库，增加了项目的复杂性。

### 6. **CSS Scoped Styles（原生支持）**
在一些现代的前端框架中，例如 Vue 3 和 Angular，原生提供了 scoped 样式功能。它类似于 scoped CSS，但有一些额外的优化和功能。

#### 示例：
在 Vue 3 中使用 scoped：

```vue
<template>
  <button class="btn">Click me</button>
</template>

<style scoped>
.btn {
  background-color: red;
}
</style>
```

在这种情况下，Vue 会自动给 `.btn` 添加一个特殊的作用域类名（例如 `v-xxx`），确保样式仅应用于该组件内的元素。

</details>

## 56. position：absolute绝对定位，是相对于谁的定位？ {#question-1f131907-c40f-485b-8ff1-67e7091fed68}

> 难度：0.5 · 类型：QA

### 题目要点

CSS position属性用于指定一个元素在文档中的定位方式。top，right，bottom 和 left 属性则决定了该元素的最终位置。

<details>
<summary>参考答案</summary>

CSS position属性用于指定一个元素在文档中的定位方式。top，right，bottom 和 left 属性则决定了该元素的最终位置。

absolute的元素会被移出正常文档流，并不为元素预留空间，通过指定元素相对于最近的 **非 static 定位祖先元素** 的偏移，来确定元素位置。绝对定位的元素可以设置外边距（margins），且不会与其他边距合并。

</details>

## 57. 下面这段代码中，class为content的元素，实际高度是100px吗？ {#question-bc918d0d-ecea-459c-930c-3c502708a997}

> 难度：3 · 类型：QA

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <style>
      .parent {
        display: flex;
        flex-direction: column;
        height: 600px;
        width: 300px;
        background: yellow;
      }
      div {
        width: 100%;
      }
      .header {
        height: 200px;
        background: red;
      }
      .content {
        height: 100%;
        background: blue;
      }
      .footer {
        height: 200px;
        background: black;
      }
    </style>
  </head>
  <body>
    <div class="parent">
      <div class="header"></div>
      <div class="content"></div>
      <div class="footer"></div>
    </div>
  </body>
</html>
```

### 题目要点

答案： 不是

<details>
<summary>参考答案</summary>

答案： 不是

首先，content元素的 height 设置为 “100%”，在父级的高度为固定值时，直接继承该高度，也就是600px。

但父级设置了 display:flex ，在高度固定的前提下，子元素的高度会按比例进行缩放，所以content元素最后的高度应该是 600 * (600/(200+600+200)) = 360px

在线demo可访问查看： https://codesandbox.io/s/strange-curran-3kci7i?file=/index.html

> 本题目答案由“前端面试题宝典”整理，PC端可访问 https://fe.ecool.fun/

</details>

## 58. 怎么做移动端的样式适配？ {#question-ffd21d04-15d9-4f94-9167-5edf63a42741}

> 难度：3 · 类型：QA

### 题目要点

移动端的样式适配是为了确保网页在不同尺寸和分辨率的移动设备上都能提供良好的用户体验。以下是一些实现移动端样式适配的常用方法：

1. **使用媒体查询（Media Queries）**：
   - 根据不同的屏幕尺寸、分辨率或设备方向应用不同的 CSS 规则。

2. **相对单位**：
   - 使用 `em`、`rem`、`vh`、`vw` 等相对单位替代像素（px），使布局更加灵活。

3. **流式布局（Fluid Layout）**：
   - 利用百分比宽度而不是固定宽度，使元素可以适应不同屏幕尺寸。

4. **响应式框架**：
   - 使用 Bootstrap、Foundation 等响应式框架来快速实现适配。

5. **弹性盒子（Flexbox）**：
   - 使用 Flexbox 布局，它提供了一种更加高效的方式来布局、对齐和分配容器内项目的空间。

6. **CSS Grid 布局**：
   - 使用 CSS Grid 布局创建复杂的响应式设计。

#### 考察重点

- 理解：移动端适配的重要性和基本概念。
- 应用：能够使用媒体查询、相对单位和现代布局技术实现响应式设计。

<details>
<summary>参考答案</summary>

以下是一些常见的移动端样式适配方法：

1. **响应式设计（Responsive Design）：**
   - 使用CSS媒体查询（Media Queries）来根据设备的特征（如屏幕宽度、高度、方向等）应用不同的样式。
   - 通过设置百分比宽度、最大宽度或相对单位（比如 rem）来确保元素相对于其容器的大小进行自适应。

```css
@media only screen and (max-width: 768px) {
  /* 在小屏幕上的样式 */
}

@media only screen and (min-width: 769px) and (max-width: 1024px) {
  /* 在中等屏幕上的样式 */
}

@media only screen and (min-width: 1025px) {
  /* 在大屏幕上的样式 */
}
```

2. **弹性布局（Flexbox）和网格布局（Grid）：**
   - 使用弹性布局和网格布局可以更方便地创建灵活的布局，使页面元素能够根据屏幕大小自动调整位置。

```css
.container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  flex: 1;
}
```

3. **移动端优先（Mobile-first）：**
   - 首先定义移动端的样式，然后使用媒体查询逐渐添加更大屏幕上的样式，以确保基本功能在小屏幕上也能正常工作。

```css
/* 移动端样式 */
body {
  font-size: 14px;
}

/* 大屏幕样式 */
@media only screen and (min-width: 768px) {
  body {
    font-size: 16px;
  }
}
```

4. **图片和多媒体适配：**
   - 使用`max-width: 100%`确保图片和多媒体在小屏幕上不会溢出其容器。
   - 使用`picture`元素或`srcset`属性提供不同尺寸的图片。

```css
img {
  max-width: 100%;
  height: auto;
}
```

5. **交互友好：**
   - 使用合适的尺寸和间距，确保链接、按钮等可点击元素在触摸屏上易于点击。

```css
/* 适当的触摸区域大小 */
a, button {
  padding: 10px;
}
```

6. **测试和调试：**
   - 在不同设备和浏览器上测试你的样式，确保页面在各种情况下都有良好的表现。
   - 使用浏览器开发者工具检查元素并模拟不同设备的情况。

</details>

## 59. 行内元素和块级元素有什么区别 {#question-c130f552-a50b-4a88-b74c-bd992dfab692}

> 难度：1 · 类型：QA

### 题目要点

**行内元素（Inline Elements）：**

<details>
<summary>参考答案</summary>

**行内元素（Inline Elements）：**

- 默认情况下，行内元素在水平方向上以行内的方式显示，不会独占一行。
- 行内元素只能容纳文本或其他行内元素，不能容纳块级元素。
- 行内元素的宽度和高度由其内容决定，无法设置固定的宽度和高度。
- 行内元素可以设置左右的外边距（margin）和内边距（padding），但上下外边距和内边距对行内元素不起作用。
- 常见的行内元素包括 `<span>`、`<a>`、`<strong>`、`<em>`、`<img>` 等。

**块级元素（Block-level Elements）：**

- 默认情况下，块级元素会独占一行的空间，即使它们宽度没有填满父元素的水平空间。
- 块级元素可以包含其他块级元素和行内元素。
- 块级元素的宽度、高度、内外边距都可以通过 CSS 设置。
- 块级元素会自动在其前后创建换行。
- 常见的块级元素包括 `<div>`、`<p>`、`<h1>`-`<h6>`、`<ul>`、`<ol>`、`<li>`、`<table>` 等。

通过 CSS 的 `display` 属性可以修改元素的显示方式，例如将行内元素设置为块级元素或将块级元素设置为行内元素，这样可以改变元素在页面中的布局和显示效果。

</details>

## 60. 使用原生js实现以下效果：点击容器内的图标，图标边框变成border:1px solid red，点击空白处重置 {#question-c3faa4b5-e73e-47f6-af7b-1f9c73d74126}

> 难度：2 · 类型：QA

### 题目要点

核心考查：使用原生js实现以下效果：点击容器内的图标，图标边框变成border:1px solid red，点击空白处重置的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```js

const box = document.getElementById('box');

function isIcon(target) {
  return target.className.includes('icon');
}

box.onclick = function(e) {
  e.stopPropagation();
  const target = e.target;
  if (isIcon(target)) {
    target.style.border = '1px solid red';
  }
}

const doc = document;

doc.onclick = function(e) {
  const children = box.children;
  for(let i = 0; i < children.length; i++) {
    if (isIcon(children[i])) {
      children[i].style.border = 'none';
    }
  }
}
```

</details>

## 61. CSS 垂直居中有哪些实现方式？ {#question-1d338445-7c02-4ffa-9541-1f7a00896244}

> 难度：2.5 · 类型：QA

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

## 62. 怎么让CSS flex布局最后一行列表左对齐？ {#question-389a7ca7-43d2-4fbe-99ef-50bea32bef5c}

> 难度：3 · 类型：QA

## justify-content对齐问题描述

在CSS flex布局中，justify-content属性可以控制列表的水平对齐方式，例如space-between值可以实现两端对齐。

但是，如果最后一行的列表的个数不满，则就会出现最后一行没有完全垂直对齐的问题。

如下代码：

```css
.container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.list {
    width: 24%; height: 100px;
    background-color: skyblue;
    margin-top: 15px;
}
```

```html
<div class="container">
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
</div>
```

![image.png](https://ae04.alicdn.com/kf/Hf1a4fff1d2894f1e9abe1106afa1ebd9R.png)

怎么让最后一行左对齐呢？

### 题目要点

如果每一行列数是固定的，则下面两种方法可以实现最后一行左对齐。

<details>
<summary>参考答案</summary>

### 如果每一行列数是固定的

如果每一行列数是固定的，则下面两种方法可以实现最后一行左对齐。

#### 方法一：模拟space-between和间隙

也就是我们不使用`justify-content:space-between`声明在模拟两端对齐效果。中间的gap间隙我们使用margin进行控制。

例如：

```css
.container {
    display: flex;
    flex-wrap: wrap;
}
.list {
    width: 24%; height: 100px;
    background-color: skyblue;
    margin-top: 15px;
}
.list:not(:nth-child(4n)) {
    margin-right: calc(4% / 3);
}
```

#### 方法二：根据个数最后一个元素动态margin

由于每一列的数目都是固定的，因此，我们可以计算出不同个数列表应当多大的`margin`值才能保证完全左对齐。

例如，假设每行4个元素，结果最后一行只有3个元素，则最后一个元素的`margin-right`大小是“列表宽度+间隙大小”的话，那最后3个元素也是可以完美左对齐的。

然后，借助树结构伪类数量匹配技术，我们可以知道最后一行有几个元素。

例如：

*   `.list:last-child:nth-child(4n - 1)`说明最后一行，要么3个元素，要么7个元素……
*   `.list:last-child:nth-child(4n - 2)`说明最后一行，要么2个元素，要么6个元素……

在本例中，一行就4个元素，因此，我们可以有如下CSS设置：

```css
.container {
    display: flex;
    /* 两端对齐 */
    justify-content: space-between;
    flex-wrap: wrap;
}
.list {
    width: 24%; height: 100px;
    background-color: skyblue;
    margin-top: 15px;
}
/* 如果最后一行是3个元素 */
.list:last-child:nth-child(4n - 1) {
    margin-right: calc(24% + 4% / 3);
}
/* 如果最后一行是2个元素 */
.list:last-child:nth-child(4n - 2) {
    margin-right: calc(48% + 8% / 3);
}
```

### 如果每一子项宽度不固定

有时候，每一个flex子项的宽度都是不固定的，这个时候希望最后一行左对齐该如何实现呢？

由于此时间隙的大小不固定，对齐不严格，因此，我们可以直接让最后一行左对齐即可。具体方法有两个：

#### 方法一：最后一项margin-right:auto

CSS代码如下：

```css
.container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.list {
    background-color: skyblue;
    margin: 10px;
}
/* 最后一项margin-right:auto */
.list:last-child {
    margin-right: auto;
}
```

#### 方法二：创建伪元素并设置flex:auto或flex:1

CSS代码如下：

```css
.container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.list {
    background-color: skyblue;
    margin: 10px;
}
/* 使用伪元素辅助左对齐 */
.container::after {
    content: '';
    flex: auto;    /* 或者flex: 1 */
}
```

### 如果每一行列数不固定

如果每一行的列数不固定，则上面的这些方法均不适用，需要使用其他技巧来实现最后一行左对齐。

这个方法其实很简单，也很好理解，就是使用足够的空白标签进行填充占位，具体的占位数量是由最多列数的个数决定的，例如这个布局最多7列，那我们可以使用7个空白标签进行填充占位，最多10列，那我们需要使用10个空白标签。

如下HTML示意：

```html
<div class="container">
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <i></i><i></i><i></i><i></i><i></i>
</div>
```

相关CSS如下，实现的关键就是占位的`&lt;i&gt;`元素宽度和`margin`大小设置得和`.list`列表元素一样即可，其他样式都不需要写。

```css
.container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-right: -10px;
}
.list {
    width: 100px; height:100px;
    background-color: skyblue;
    margin: 15px 10px 0 0;
}
/* 和列表一样的宽度和margin值 */
.container > i {
    width: 100px;
    margin-right: 10px;
}
```

由于`<i>`元素高度为0，因此，并不会影响垂直方向上的布局呈现。

### 如果列数不固定HTML又不能调整

然而有时候，由于客观原因，前端重构人员没有办法去调整html结构，同时布局的列表个数又不固定，这个时候该如何实现我们最后一行左对齐效果呢？

我们不妨可以试试使用Grid布局。

Grid布局天然有gap间隙，且天然格子对齐排布，因此，实现最后一行左对齐可以认为是天生的效果。

CSS代码如下：

```css
.container {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(auto-fill, 100px);
    grid-gap: 10px;
}
.list {
    width: 100px; height:100px;
    background-color: skyblue;
    margin-top: 5px;
}
```

可以看到CSS代码非常简洁。

HTML代码就是非常规整非常普通的代码片段：

```html
<div class="container">
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
    <div class="list"></div>
</div>
```

### 这几种实现方法点评

首先最后一行需要左对齐的布局更适合使用CSS grid布局实现，但是，`repeat()`函数兼容性有些要求，IE浏览器并不支持。如果项目需要兼容IE，则此方法需要斟酌。

然后，适用范围最广的方法是使用空的元素进行占位，此方法不仅适用于列表个数不固定的场景，对于列表个数固定的场景也可以使用这个方法。但是有些人代码洁癖，看不惯这种空的占位的html标签，则可以试试一开始的两个方法，一是动态计算margin，模拟两端对齐，另外一个是根据列表的个数，动态控制最后一个列表元素的margin值实现左对齐。

> by zhangxinxu
>
> 原文地址： https://www.zhangxinxu.com/wordpress/?p=8855

</details>

## 63. 相邻的两个inline-block节点为什么会出现间隔，该如何解决？ {#question-5f8efe01-0851-4c6f-87bc-f50d6e3ca279}

> 难度：2 · 类型：QA

### 题目要点

### 相邻`inline-block`元素间距问题

相邻的两个`inline-block`元素之间出现间隔，通常是由于以下原因：

1. **空白字符**：HTML代码中元素间的空格或换行被浏览器解析为间距。
2. **解决方案**：

   - **删除空白字符**：确保HTML中没有多余的空格或换行。
   - **`font-size: 0`技巧**：

     ```css
     .parent {
       font-size: 0;
     }
     .child {
       font-size: 16px; /* 恢复子元素字体大小 */
     }
     ```

   - **使用`letter-spacing`或`word-spacing`**：

     ```css
     .inline-block {
       letter-spacing: -1px; /* 负值抵消间距 */
     }
     ```

   - **使用`margin`负值**：通过设置负`margin`来抵消间距。
   - **使用`text-align: justify`**：均匀分布`inline-block`元素。
   - **使用Flexbox**：更灵活地控制布局和间距。

### 面试重点考察

- 对CSS布局细节的理解。
- 解决实际开发中间距问题的能力。

<details>
<summary>参考答案</summary>

### 一、现象描述

真正意义上的inline-block水平呈现的元素间，换行显示或空格分隔的情况下会有间距，很简单的个例子：

```html
<input /> <input type="submit" />
```

间距就来了~~

![image.png](https://static.ecool.fun//article/b1a50051-8bf5-4e14-9460-cbe4ff2ee78d.png)

我们使用CSS更改非inline-block水平元素为inline-block水平，也会有该问题：

```css
.space a {
    display: inline-block;
    padding: .5em 1em;
    background-color: #cad5eb;
}
```

```html
<div class="space">
    <a href="##">惆怅</a>
    <a href="##">淡定</a>
    <a href="##">热血</a>
</div>
```

![image.png](https://static.ecool.fun//article/5f3fa381-ccb2-43c3-b5ba-58c5ad161abe.png)

这种表现是符合规范的应该有的表现。

元素被当成行内元素排版的时候，元素之间的空白符（空格、回车换行等）都会被浏览器处理，根据white-space的处理方式（默认是normal，合并多余空白），原来HTML代码中的回车换行被转成一个空白符，在字体不为0的情况下，空白符占据一定宽度，所以inline-block的元素之间就出现了空隙。这些元素之间的间距会随着字体的大小而变化，当行内元素font-size:16px时，间距为8px。

不过，这类间距有时会对我们布局，或是兼容性处理产生影响，以下展示N种方法去掉。

### 二、方法之移除空格

元素间留白间距出现的原因就是标签段之间的空格，因此，去掉HTML中的空格，自然间距就木有了。考虑到代码可读性，显然连成一行的写法是不可取的，我们可以：

```html
<div class="space">
    <a href="##">
    惆怅</a><a href="##">
    淡定</a><a href="##">
    热血</a>
</div>
```

或者是：

```html
<div class="space">
    <a href="##">惆怅</a
    ><a href="##">淡定</a
    ><a href="##">热血</a>
</div>
```

或者是借助HTML注释：

```html
<div class="space">
    <a href="##">惆怅</a><!--
    --><a href="##">淡定</a><!--
    --><a href="##">热血</a>
</div>
```

等。

### 三、使用margin负值

```css
.space a {
    display: inline-block;
    margin-right: -3px;
}
```

margin负值的大小与上下文的字体和文字大小相关：

![image.png](https://static.ecool.fun//article/4d07ee09-ad17-41a8-9dd6-01eab25e0e8a.png)

例如，对于12像素大小的上下文，Arial字体的`margin`负值为`-3`像素，Tahoma和Verdana就是`-4`像素，而Geneva为`-6`像素。

由于外部环境的不确定性，以及最后一个元素多出的父margin值等问题，这个方法不适合大规模使用。

### 四、让闭合标签吃胶囊

如下处理：

```html
<div class="space">
    <a href="##">惆怅
    <a href="##">淡定
    <a href="##">热血</a>
</div>
```

注意，为了向下兼容IE6/IE7等喝蒙牛长大的浏览器，最后一个列表的标签的结束（闭合）标签不能丢。

在HTML5中，我们直接：

```html
<div class="space">
    <a href="##">惆怅
    <a href="##">淡定
    <a href="##">热血
</div>
```

好吧，虽然感觉上有点怪怪的，但是，这是OK的。

![image.png](https://static.ecool.fun//article/71ea9156-22a7-43a1-9a29-b04cd6ed9280.png)

### 五、使用font-size:0

类似下面的代码：

```css
.space {
    font-size: 0;
}
.space a {
    font-size: 12px;
}
```

这个方法，基本上可以解决大部分浏览器下inline-block元素之间的间距(IE7等浏览器有时候会有1像素的间距)。

### 六、使用letter-spacing

类似下面的代码：

```css
.space {
    letter-spacing: -3px;
}
.space a {
    letter-spacing: 0;
}
```

根据我去年的测试，该方法可以搞定基本上所有浏览器。

### 七、使用word-spacing

类似下面代码：

```css
.space {
    word-spacing: -6px;
}
.space a {
    word-spacing: 0;
}
```

一个是字符间距(`letter-spacing`)一个是单词间距(`word-spacing`)，大同小异。据我测试，`word-spacing`的负值只要大到一定程度，其兼容性上的差异就可以被忽略。因为，貌似，`word-spacing`即使负值很大，也不会发生重叠。

与上面demo一样的效果，这里就不截图展示了。如果您使用Chrome浏览器，可能看到的是间距依旧存在。确实是有该问题，原因我是不清楚，不过我知道，可以添加`display: table;`或`display:inline-table;`让Chrome浏览器也变得乖巧。

```css
.space {
    display: inline-table;
    word-spacing: -6px;
}
```

### 八、其他成品方法

下面展示的是YUI 3 CSS Grids 使用`letter-spacing`和`word-spacing`去除格栅单元见间隔方法（注意，其针对的是block水平的元素，因此对IE8-浏览器做了hack处理）：

```css
.yui3-g {
    letter-spacing: -0.31em; /* webkit */
    *letter-spacing: normal; /* IE < 8 重置 */
    word-spacing: -0.43em; /* IE < 8 && gecko */
}

.yui3-u {
    display: inline-block;
    zoom: 1; *display: inline; /* IE < 8: 伪造 inline-block */
    letter-spacing: normal;
    word-spacing: normal;
    vertical-align: top;
}
```

以下是一个名叫RayM的人提供的方法：

```css
li {
    display:inline-block;
    background: orange;
    padding:10px;
    word-spacing:0;
    }
ul {
    width:100%;
    display:table;  /* 调教webkit*/
    word-spacing:-1em;
}

.nav li { *display:inline;}
```

也就是上面一系列CSS方法的组组合合。

</details>

## 64. display 有哪些取值？ {#question-88d1350b-5dce-48f8-974d-9115b0d270d0}

> 难度：1 · 类型：QA

### 题目要点

- **`none`**：元素不会被显示，也不占据空间。
- **`block`**：元素会显示为块级元素，占据整行。
- **`inline`**：元素会显示为行内元素，不占据整行。
- **`inline-block`**：元素会显示为行内块级元素，可以设置宽度和高度，但仍保持行内元素的特性。
- **`table`**：元素会显示为表格。
- **`table-row`**：元素会显示为表格行。
- **`table-cell`**：元素会显示为表格单元格。
- **`list-item`**：元素会显示为列表项，通常与 `<ul>` 或 `<ol>` 元素一起使用。
- **`table-column`**：元素会显示为表格列。
- **`table-column-group`**：元素会显示为表格列组。
- **`table-footer-group`**：元素会显示为表格页脚组。
- **`table-header-group`**：元素会显示为表格头部组。
- **`flex`**：元素会显示为弹性盒子容器。
- **`inline-flex`**：元素会显示为行内弹性盒子容器。
- **`grid`**：元素会显示为网格容器。
- **`inline-grid`**：元素会显示为行内网格容器。
- **`ruby`**：元素会显示为对齐文本。
- **`contents`**：元素的子元素会被当作父元素的子元素处理。

<details>
<summary>参考答案</summary>

display 属性可以设置元素的内部和外部显示类型。

* 元素的外部显示类型将决定该元素在流式布局中的表现（块级或内联元素）；
* 元素的内部显示类型可以控制其子元素的布局（例如：flow layout，grid 或 flex）。

以下是一些关于display比较常用的属性值：

| 值 | 描述 |
|--|--|
|none|元素不会显示|
|block|此元素将显示为块级元素，此元素前后会带有换行符。|
|inline|默认。此元素会被显示为内联元素，元素前后没有换行符。|
|inline-block|行内块元素。（CSS2.1 新增的值）[IE6/7不支持]|
|inline-table|此元素会作为内联表格来显示（类似 table），表格前后没有换行符。|
|table|此元素会作为块级表格来显示（类似 table），表格前后带有换行符。|
|inherit|规定应该从父元素继承 display 属性的值。|
|grid|网格布局（Grid）是最强大的CSS 布局方案。 它将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。 |
|flex|弹性布局，用来为盒状模型提供最大的灵活性。|

从大的分类来讲，`display`的`32`种写法可以分为`6`个大类，再加上`1`个全局类，一共是`7`大类：

*   [外部值](#外部值)
*   [内部值](#内部值)
*   [列表值](#列表值)
*   [属性值](#属性值)
*   [显示值](#显示值)
*   [混合值](#混合值)
*   [全局值](#全局值)

## 外部值

所谓外部值，就是说这些值只会直接影响一个元素的外部表现，而不影响元素里面的儿子级孙子级元素的表现。

### display: block

这个值大家不陌生，我们最熟悉的`<div>`缺省就是这个值，最基本的块级元素，属于`css`入门初学者都知道的概念，只要是容器类型的元素基本都是这个值。除`<div>`之外，还有`<h1>`到`<h6>`，`<p>`，`&lt;form&gt;`，`<header>`，`<footer>`，`<section>`，`<article>`天生都是这个值。

### display: inline

这个值大家也不陌生，行内元素嘛，只要是个行内元素都是这个值，最典型的是`<span>`，还有`<a>`，`<img>`，以及古代`html`语言当中的`<b>`，`<i>`都属于这一类型。

### display: run-in

这个值有点奇怪，通常没人用它，但你可以知道它。因为除了`IE`和`Opera`支持它以外，其他所有主流浏览器包括`Chrome`, `Safari`, `Firefox`全都对它置若罔闻。这东西说白了也没什么神秘，它的意思就是说如果我们命令一个元素`run-in`，中文意思就是『`闯入`』！那么这个元素就直接闯入下一行。比如说这样：

![image.png](https://static.ecool.fun//article/2cbc365c-776e-4a81-86ec-702b74ef25d2.png)

写起来大概就是这样：

```html
<div class="a">aaa</div>
<div class="b">bbb</div>
```

```css
.a {
  font-size: 36px;
  display: run-in;
}
```

这有什么用呢？我们拿`span`设置`font-size`一样可以实现这个效果，就让`IE`自己跟自己玩去吧！说实话，在人力资源如此宝贵的今天，`IE`的产品经理不知脑子是不是进水了，不派工程师去实现那么多比这重要的多得多的特性，却花时间做这么个没用的玩意儿，难道工程师的时间不是金钱吗？难怪市场占有率连年下滑。

## 内部值

谈完了外部值，我们来看看内部值。这一组值比较有意思了，在`css3`如火如荼的今天，你要玩不转这些值，怕是哪儿也找不到工作的。内部值主要是用来管束自己下属的儿子级元素的排布的，规定它们或者排成`S`形，或者排成`B`形这样的。

### display: flow

含义不清，实验室阶段产品，`Chrome`不支持。如果还不够说服你暂时不要碰它的话，试着理解以下英文原文：

> If its outer display type is inline or run-in, and it is participating in a block or inline formatting context, then it generates an inline box. Otherwise it generates a block container box.

### display: flow-root

不同于刚才谈到的`flow`，现在用`flow-root`的渐渐多起来了，因为它可以撑起被你`float`掉的块级元素的高度。外容器本来是有高度的，就像这样：

![image.png](https://static.ecool.fun//article/bd08aa59-0327-44c7-be00-25fdd7de8062.png)

```html
<div class="container container1">
  <div class="item"></div>
  Example one
</div>
```

```css
.container {
  border: 2px solid #3bc9db;
  border-radius: 5px;
  background-color: #e3fafc;
  width: 400px;
  padding: 5px;
}
.item {
  height: 100px;
  width: 100px;
  background-color: #1098ad;
  border: 1px solid #0b7285;
  border-radius: 5px;
}
```

结果因为你想让那一行字上去，于是你给`.item`加了一个`float: left;`结果就成这样了，外容器高度掉了，这不是很多人常犯的错误吗？

![image.png](https://static.ecool.fun//article/9245b61d-9640-4541-af54-4e06977b0adc.png)

现在我们给`.container`加上`display: flow-root;`再看一下：

![image.png](https://static.ecool.fun//article/42f5d8fd-bdcf-44d7-94ac-5ace2d751cfa.png)

喏，外容器高度又回来了，这效果是不是杠杠的？

可能就有同学要说了，我们用`clear: both;`不是一样可以达到这效果吗？

```css
.container::after {
  content: '';
  clear: both;
  display: table;
}
```

小明，请你出去！我们在讲`display: flow-root;`，不是在讲`clear: both;`！

### display: table

这一个属性，以及下面的另外`8`个与`table`相关的属性，都是用来控制如何把`div`显示成`table`样式的，因为我们不喜欢`<table>`这个标签嘛，所以我们想把所有的`<table>`标签都换成`<div>`标签。`<div>`有什么好？无非就是能自动换行而已，但其实你完全可以做一个`<table><tr><td>`标签，把它全都替换成`display: block;`也可以自动折行，只不过略微麻烦而已。

关于`display: table;`的详细用法，大家可以参考mdn上的文章，这里就不细说了。

### display: flex

敲黑板，划重点！作为新一代的前端工程师，这个属性你必须烂熟于胸中。`display: flex;`以及与它相关联的一系列属性：`flex-direction`, `flex-wrap`, `flex-flow`, `justify-content`, `align-items`, `align-content`，并且包括所有这些属性的取值，都是你需要反复研磨的。`2009`年诞生的这个属性可以说是不亚于`css`界一场蒸汽机诞生一样的工业革命，它的诞生标志着马车一样的`float`被彻底抛进历史的垃圾堆。

没有一张图能完整地展现`flex`的神韵，就放这张我比较喜欢的图片吧：

![image.png](https://static.ecool.fun//article/7e891f54-161f-41af-add8-764106a90829.png)

### display: grid

会`flex`很吊吗？会`grid`更吊哦！也许这就是下次前端面试的重点哦！

![image.png](https://static.ecool.fun//article/e8c17847-dc43-4584-a556-f54538e6e9d2.png)

`grid`布局，中文翻译为`网格布局`。学习`grid`布局有两个重点：一个重点是`grid`布局引入了一个全新的单位：`fr`，它是`fraction`（`分数`）的缩写，所以从此以后，你的兵器库里除了`px`, `em`, `rem`, `百分比`这些常见兵器以及`vw`, `vh`这些新式武器之外，又多了一样旁门暗器`fr`，要想用好`grid`，必须充分掌握`fr`。另一个重点是`斜杠操作符`，这可不是`分数`哦。它表示的是`起始位置`和`结束位置`。比如说`3 / 4`，这可不是`四分之三`的意思，这是指一个元素从第`3`行开始，到第`4`行结束，但又不包括第`4`行。

同样，与`grid`相关联的也有一大堆旁门属性，是在学习`display: grid;`的同时必须掌握的。包括`grid`, `grid-column-start`, `grid-column-end`, `grid-row-start`, `grid-row-end`, `grid-template`, `grid-template-columns`, `grid-template-rows`, `grid-template-areas`, `grid-gap`, `grid-column-gap`, `grid-row-gap`, `grid-auto-columns`, `grid-auto-rows`, `grid-auto-flow`, `grid-column`, `grid-row`。不能详述，关于这个写起来又是一大篇文章。详情还是参考 csstrick 上[这篇文章](https://css-tricks.com/snippets/css/complete-guide-grid/)，讲得非常细致非常清楚。

### display: ruby

`ruby`这个取值对于我们亚洲人来说其实是非常有用的一个东西，但是目前除了`Firefox`以外其它浏览器对它的支持都不太好。简而言之，`display: ruby;`的作用就是可以做出下面这样的东西：

![image.png](https://static.ecool.fun//article/035fde95-407c-4109-84e3-332f4a9220c3.png)

很好的东西，对吧？如果可以用的话，对我国的小学教育可以有极大的促进。但可惜我们现在暂时还用不了。

`ruby`这个词在英语里的意思是`红宝石`，但在日语里是`ルビ`，翻译成中文是`旁注标记`的意思，我们中文的旁注标记就是汉语拼音。可以想见，这个标准的制定者肯定是日本人，如果是我们中国人的话，那这个标签就不是`ruby`，而是`pinyin`了。还有一个`ruby`语言，发明者也是一个日本人，和`html`里这个`ruby`是两码事，不要搞混了。

`ruby`的语法大致如下：

![image.png](https://static.ecool.fun//article/65b43976-d8dd-43c3-964e-561d34a141b1.png)

### display: subgrid

`subgrid`总的思想是说大网格里还可以套小网格，互相不影响。但如果`grid`里可以再套`subgrid`的话，那我`subgrid`里还想再套`subgrid`怎么办？`subsubgrid`吗？况且，到底是`grid: subgrid;`还是`display: subgrid;`这个也没有达成共识。

## 列表值

### display: list-item

`display: list-item;`和`display: table;`一样，也是一帮痛恨各种`html`标签，而希望只使用`<div>`来写遍一切`html`的家伙搞出来的鬼东西，实际使用极少，效果就是这样：

![image.png](https://static.ecool.fun//article/b3a1c0ba-7e65-4c5f-b040-b7a091725b4c.png)

看，你用`<ul><li>`能实现的效果，他可以用`<div>`实现出来，就是这个作用。

## 属性值

属性值一般是附属于主值的，比如主值里设置了`display: table;`，就可以在子元素里使用`display: table-row-group;`等等属性，不过并不绝对。关于它们的作用，主要参考主值就够了。

### display: table-row-group

详情参考[display: table;](#display-table)。

### display: table-header-group

详情参考[display: table;](#display-table)。

### display: table-footer-group

详情参考[display: table;](#display-table)。

### display: table-row

详情参考[display: table;](#display-table)。

### display: table-cell

详情参考[display: table;](#display-table)。这个属性有必要详细说说，因为它完全可以单独应用，用在高度不固定元素的垂直居中上。效果如下图所示：

![image.png](https://static.ecool.fun//article/98de9407-e6be-4ec1-8b2e-6f2eb207bb30.png)

### display: table-column-group

详情参考[display: table;](#display-table)。

### display: table-column

详情参考[display: table;](#display-table)。

### display: table-caption

详情参考[display: table;](#display-table)。

### display: ruby-base

详情参考[display: ruby;](#display-ruby)。

### display: ruby-text

详情参考[display: ruby;](#display-ruby)。

### display: ruby-base-container

详情参考[display: ruby;](#display-ruby)。

### display: ruby-text-container

详情参考[display: ruby;](#display-ruby)。

## 显示值

`MDN`里把它叫做`<display-box> values`（`盒子值`），我把它叫做`显示值`，主要是为了便于理解。

### display: contents

![image.png](https://static.ecool.fun//article/b723d2a2-a13b-4cc4-bab7-8290d832a30b.png)

你给中间那个`div`加上`display: contents;`之后，它就变成这样了：

![image.png](https://static.ecool.fun//article/c6fcbe0c-ede3-4808-8505-b5af9d46cd51.png)

这就是`display: contents;`的作用，它让子元素拥有和父元素一样的布局方式，仅此而已。

### display: none

这么著名的值还用多说吗？

## 混合值

### display: inline-block

关于`display: inline-block;`的作用恐怕只要做过`3`天以上前端的工程师都应该知道。什么也不说了，上一张著名的图片作总结吧：

![image.png](https://static.ecool.fun//article/9581c1ef-bfda-46cd-9398-c7cf925eff8d.png)

### display: inline-table

你要能理解`inline-block`，你就能理解`inline-table`。在行内显示一个表格，就像这样：

![image.png](https://static.ecool.fun//article/80a56bc7-7d12-46d6-a629-a5cd7436b760.png)

### display: inline-flex

这个就不用多说了吧？跟上面一样，在行内进行弹性布局，参考[display: flex;](#display-flex)。

### display: inline-grid

同上，在行内进行网格布局，参考[display: grid;](#display-grid)。

## 全局值

这些值不是`display`属性的专利，几乎其它任意属性都可以用，列在这里凑个数。

### display: inherit

继承父元素的`display`属性。

### display: initial

不管父元素怎么设定，恢复到浏览器最初始时的`display`属性。

### display: unset

`unset`混合了`inherit`和`initial`。如果父元素设值了，就用父元素的设定，如果父元素没设值，就用浏览器的缺省设定。直接看图最明白：

![image.png](https://static.ecool.fun//article/4b1deb11-c35e-476c-b1e1-4eb9f0a4b16d.png)

## 总结

以上就是在`css`里`display`的`32`种写法。谈了这么多，不知道你记住了多少呢？其实，单纯理解每一个`display`属性的取值都不难，难的是融会贯通，在恰当的地方运用恰当的值，毕竟我们的目的是为了把代码写短，而不是把代码写长。

</details>

## 65. 如何从html元素继承box-sizing？ {#question-6a8dda85-ad38-4eec-86b5-dad87ad3c929}

> 难度：1 · 类型：QA

### 题目要点

在大多数情况下我们在设置元素的 border 和 padding 并不希望改变元素的 width,height值，这个时候我们就可以为该元素设置 `box-sizing:border-box;`。

<details>
<summary>参考答案</summary>

在大多数情况下我们在设置元素的 border 和 padding 并不希望改变元素的 width,height值，这个时候我们就可以为该元素设置 `box-sizing:border-box;`。

如果不希望每次都重写一遍，而是希望他是继承而来的，那么我们可以使用如下代码：

```css
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
```

这样的好处在于他不会覆盖其他组件的 box-sizing 值，又无需为每一个元素重复设置 box-sizing:border-box;

</details>

## 66. 如何使用css来实现禁止移动端页面的左右划动手势？ {#question-a792448f-bd4c-4320-b3dc-c1dbe395c090}

> 难度：1 · 类型：QA

### 题目要点

CSS属性 `touch-action` 用于设置触摸屏用户如何操纵元素的区域(例如，浏览器内置的缩放功能)。

<details>
<summary>参考答案</summary>

CSS属性 `touch-action` 用于设置触摸屏用户如何操纵元素的区域(例如，浏览器内置的缩放功能)。

最简单方法是：

```css
html{
 touch-action: none;
 touch-action: pan-y;
}
```

还可以直接指定对应元素的宽度和overflow：

```css
html{
 width: 100vw;
 overflow-x: hidden;
}
```

</details>

## 67. 如何检测浏览器所支持的最小字体大小？ {#question-c860f93c-430e-4813-b534-0fcfda8b64ba}

> 难度：1 · 类型：QA

### 题目要点

可以使用 JS 设置 DOM 的字体为某一个值，然后再取出来，如果值设置成功，就说明支持。

<details>
<summary>参考答案</summary>

可以使用 JS 设置 DOM 的字体为某一个值，然后再取出来，如果值设置成功，就说明支持。

</details>

## 68. Js 动画与 CSS 动画区别及相应实现 {#question-af8d6439-598f-4317-8063-93349b83f2d3}

> 难度：3 · 类型：QA

### 题目要点

CSS3 的动画的优点

<details>
<summary>参考答案</summary>

* CSS3 的动画的优点
    * 在性能上会稍微好一些，浏览器会对 CSS3 的动画做一些优化
    * 代码相对简单
* 缺点
    * 在动画控制上不够灵活
    * 兼容性不好

JavaScript 的动画正好弥补了这两个缺点，控制能力很强，可以单帧的控制、变换，同时写得好完全可以兼容 IE6，并且功能强大。对于一些复杂控制的动画，使用 javascript 会比较靠谱。而在实现一些小的交互动效的时候，就多考虑考虑 CSS 吧

</details>

## 69. IconFont 的原理是什么 {#question-144bb888-936e-42c8-bdcb-445b5c4dc774}

> 难度：2 · 类型：QA

### 题目要点

IconFont 的使用原理来自于 css 的 `@font-face` 属性。

<details>
<summary>参考答案</summary>

IconFont 的使用原理来自于 css 的 `@font-face` 属性。

这个属性用来定义一个新的字体，基本用法如下：

```css
@font-face {
  font-family: <YourFontName>;
  src: <url> [<format>],[<source> [<format>]], *;
  [font-weight: <weight>];
  [font-style: <style>];
}
```

* font-family：为载入的字体取名字。
* src：[url]加载字体，可以是相对路径，可以是绝对路径，也可以是网络地址。[format]定义的字体的格式，用来帮助浏览器识别。主要取值为：【truetype(.ttf)、opentype（.otf）、truetype-aat、embedded-opentype(.eot)、svg(.svg)、woff(.woff)】。
* font-weight：定义加粗样式。
* font-style：定义字体样式。

</details>

## 70. css sprites是什么，怎么使用？ {#question-cffcacf0-52fc-4d67-b9d0-3e7d477b92d0}

> 难度：1 · 类型：QA

### 题目要点

CSS Sprites是一种网页图片应用处理方式，就是把网页中一些背景图片整合到一张图片文件中，再利用CSS的“background-image”，“background- repeat”，“background-position”的组合进行背景定位。

<details>
<summary>参考答案</summary>

## 是什么

CSS Sprites是一种网页图片应用处理方式，就是把网页中一些背景图片整合到一张图片文件中，再利用CSS的“background-image”，“background- repeat”，“background-position”的组合进行背景定位。

## 优点

其优点在于：

* 减少网页的http请求，提高性能，这也是CSS Sprites最大的优点，也是其被广泛传播和应用的主要原因；
* 减少图片的字节：多张图片合并成1张图片的字节小于多张图片的字节总和；
* 减少了命名困扰：只需对一张集合的图片命名，不需要对每一个小元素进行命名提高制作效率；
* 更换风格方便：只需要在一张或少张图片上修改图片的颜色或样式，整个网页的风格就可以改变，维护起来更加方便。

## 缺点

诚然CSS Sprites是如此的强大，但是也存在一些不可忽视的缺点：

* 图片合成比较麻烦；
* 背景设置时，需要得到每一个背景单元的精确位置；
* 维护合成图片时，最好只是往下加图片，而不要更改已有图片。

</details>

## 71. display:none与visibility:hidden 有什么区别？ {#question-b61122b0-5971-4bc9-afc2-4987d4aa06d7}

> 难度：1 · 类型：QA

### 题目要点

display:none是彻底消失，不在文档流中占位，浏览器也不会解析该元素；

<details>
<summary>参考答案</summary>

## 表现上

* display:none是彻底消失，不在文档流中占位，浏览器也不会解析该元素；
* visibility:hidden是视觉上消失了，可以理解为透明度为0的效果，在文档流中占位，浏览器会解析该元素；

## 性能上

* 使用visibility:hidden比display:none性能上要好，display:none切换显示时，页面产生回流（当页面中的一部分元素需要改变规模尺寸、布局、显示隐藏等，页面重新构建，此时就是回流。所有页面第一次加载时需要产生一次回流），而visibility切换是否显示时则不会引起回流。

</details>

## 72. 你知道哪些css模块化的方案？ {#question-0bb0b3a7-ed1b-41c0-a93e-7187b2aa85a8}

> 难度：3 · 类型：QA

### 题目要点

- **BEM (Block Element Modifier)**：一种CSS命名方法，通过块（Block）、元素（Element）和修饰符（Modifier）来组织CSS类名，以提高代码的可读性和可维护性。
- **SMACSS (Scalable and Modular Architecture for CSS)**：一种CSS组织方法，将样式分为五个类别：Base（基础样式）、Layout（布局样式）、Module（模块样式）、State（状态样式）和Theme（主题样式）。
- **OOCSS (Object-Oriented CSS)**：面向对象的CSS方法，通过创建可重用的样式对象来减少重复代码。
- **SUIT CSS**：遵循SMACSS原则，但更注重组件的独立性和可组合性。
- **CSS Modules**：一种将CSS类名局部化的方法，通常与构建工具（如Webpack）结合使用，以避免全局污染。
- **Styled-components**：一个用于React的CSS-in-JS库，允许你在JavaScript中写样式，并自动将类名局部化。
- **Styled-jsx**：Next.js框架中的CSS模块化方案，允许在JSX文件中写CSS，并自动局部化。
- **Tailwind CSS**：一个实用工具优先的CSS框架，通过预定义的类来构建设计，易于组合和重用。
- **Bulma**：一个基于Flexbox的CSS框架，提供了一套可组合的模块来构建响应式布局。
- **Foundation**：一个响应式前端框架，提供了一套预定义的组件和样式。
- **PostCSS**：一个CSS后处理器，可以与各种插件一起使用来实现CSS的模块化、优化和转译。

<details>
<summary>参考答案</summary>

目前主流的 css 模块化分为 css modules 和 css in js 两种方案。

## css modules

> CSS Modules 指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性, 编译时会将 css 类名 加上唯一 hash。

css module 需要 webpack 配置 css-loader 或者 scss-loader , module 为 true

```
{
    loader: 'css-loader',
    options: {
        modules: true, // 开启模块化
        localIdentName: '[path][name]-[local]-[hash:base64:5]'
    }
}
```

### localIdentName

介绍下 localIdentName 自定义生成的类名格式，可选参数有：

* [path]表示样式表相对于项目根目录所在的路径(默认不拼接)
* [name] 表示样式表文件名称
* [local] 表示样式表的类名定义名称
* [hash:length] 表示 32 位的 hash 值

注意：只有类名选择器和 ID 选择器才会被模块化控制，类似 `body`、`h2`、`span` 这些标签选择器不会被模块化控制。

### css module 作用域

* 作用域默认为 local 即只在当前模块生效
* global：被 `:global` 包裹起来的类名，不会被模块化

```css
/* 加上 :global 会全局样式 */
:global(.global-color) {
  color: blue;
  :global(.common-width) {
    width: 200px;
  }
}
```

### css module 高级使用

* 和外部样式混用

```js
import classNames from 'classnames';

// 使用classNames
const wrapperClassNames = classNames({
  'common-show': visible,
  'common-hide': !visible,
  [styles1['view-wrapper']]: true
});
<div className={wrapperClassNames}></div>;

// 使用模板字符串
<div className={`${styles1.content} ${styles1.color} common-show`}>
  我是文章内容我是文章内容我是文章内容我是文章内容我是文章内容我是文章内容
</div>;
```

* 覆盖第三方 UI 库

```
{/* 覆盖第三方UI库 样式*/}
<div className={styles1['am-button-custom-wrapper']}>
  <Button type={'primary'} onClick={() => toggle()}>
     {visible ? '隐藏' : '显示'}
  </Button>
</div>

//  覆盖第三方UI库的 样式
.am-button-custom-wrapper {
  :global {
    .am-button-primary {
      color: red;
    }
  }
}
```

## css in js

CSS-in-JS是一种技术（technique），而不是一个具体的库实现（library）。

简单来说CSS-in-JS就是将应用的CSS样式写在JavaScript文件里面，而不是独立为一些.css，.scss或者less之类的文件，这样你就可以在CSS中使用一些属于JS的诸如模块声明，变量定义，函数调用和条件判断等语言特性来提供灵活的可扩展的样式定义。

值得一提的是，虽然CSS-in-JS不是一种很新的技术，它当初的出现是因为一些component-based的Web框架（例如React，Vue和Angular）的逐渐流行，使得开发者也想将组件的CSS样式也一块封装到组件中去以解决原生CSS写法的一系列问题。

还有就是CSS-in-JS在React社区的热度是最高的，这是因为React本身不会管用户怎么去为组件定义样式的问题，而Vue和Angular都有属于框架自己的一套定义样式的方案。

实现了CSS-in-JS的库有很多，虽然每个库解决的问题都差不多，可是它们的实现方法和语法却大相径庭。

从实现方法上区分大体分为两种：唯一CSS选择器和内联样式（Unique Selector VS Inline Styles）。

接下来我们来分别看一下对应于这两种实现方式的两个比较有代表性的实现：styled-components和radium。

### Styled-components

通过styled-components，你可以使用ES6的标签模板字符串语法（Tagged Templates）为需要styled的Component定义一系列CSS属性，当该组件的JS代码被解析执行的时候，styled-components会动态生成一个CSS选择器，并把对应的CSS样式通过style标签的形式插入到head标签里面。

动态生成的CSS选择器会有一小段哈希值来保证全局唯一性来避免样式发生冲突。

```jsx
const DivWrapper = styled.div`
  width: '100%';
  height: 300;
  background-color: ${(props) => props.color};
`;

// 封装第三方组件库
const AntdButtonWrapper = styled(Button)`
  color: 'red';
`;

// 通过属性动态定义样式
const MyButton = styled.button`
  background: ${(props) => (props.primary ? 'palevioletred' : 'white')};
  color: ${(props) => (props.primary ? 'white' : 'palevioletred')};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

// 样式复用
const TomatoButton = styled(MyButton)`
  color: tomato;
  border-color: tomato;
`;

// 创建关键帧
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
  `;

// 创建动画组件
const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
  padding: 2rem 1rem;
  font-size: 1.2rem;
`;
```

styled-components 优势: 支持将 props 以插值的方式传递给组件,以调整组件样式, 跨平台可在 RN 和 next 中使用。 缺点： 预处理器和后处理器不兼容。

### Radium

Radium和styled-components的最大区别是它生成的是标签内联样式（inline styles）。

由于标签内联样式在处理诸如media query以及:hover，:focus，:active等和浏览器状态相关的样式的时候非常不方便，所以radium为这些样式封装了一些标准的接口以及抽象。

```jsx
import Radium from 'radium';

const Button = () => (
    <button
        style={styles.base}>
        {this.props.children}
    </button>;
)

var styles = {
  red: {
    backgroundColor: 'red'
  }
};

Button = Radium(Button);
```

内联样式相比于CSS选择器的方法有以下的优点：

* 自带局部样式作用域的效果，无需额外的操作
* 内联样式的权重（specificity）是最高的，可以避免权重冲突的烦恼
* 由于样式直接写在HTML中，十分方便开发者调试

</details>

## 73. html和css中的图片加载与渲染规则是什么样的？ {#question-5b612b6a-3828-4cd9-9de4-b05bb36a4e3d}

> 难度：3 · 类型：QA

### 题目要点

Web浏览器先会把获取到的HTML代码解析成一个DOM树，HTML中的每个标签都是DOM树中的一个节点，包括`display: none`隐藏的标签，还有JavaScript动态添加的元素等。

<details>
<summary>参考答案</summary>

Web浏览器先会把获取到的HTML代码解析成一个DOM树，HTML中的每个标签都是DOM树中的一个节点，包括`display: none`隐藏的标签，还有JavaScript动态添加的元素等。

浏览器会获取到所有样式，并会把所有样式解析成样式规则，在解析的过程中会去掉浏览器不能识别的样式。

浏览器将会把DOM树和样式规则组合在一起（DOM元素和样式规则匹配）后将会合建一个渲染树（Render Tree），渲染树类似于DOM树，但两者别还是很大的：

渲染树能识别样式，渲染树中每个节点（NODE）都有自己的样式，而且渲染树不包含隐藏的节点（比如display:none的节点，还有`</head>`内的一些节点），因为这些节点不会用于渲染，也不会影响节点的渲染，因此不会包含到渲染树中。一旦渲染树构建完毕后，浏览器就可以根据渲染树来绘制页面了。

简单的归纳就是浏览器渲染Web页面大约会经过六个过程：

* 解析HTML，构成DOM树
* 解析加载的样式，构建样式规则树
* 加载JavaScript，执行JavaScript代码
* DOM树和样式规则树进行匹配，构成渲染树
* 计算元素位置进行页面布局
* 绘制页面，最终在浏览器中呈现

是不是会感觉这个和我们图像加载渲染没啥关系一样，事实并非如此，因为img、picture或者background-image都是DOM树或样式规则中的一部分，那么咱们套用进来，图片加载和渲染的时机有可能是下面这样：

* 解析HTML时，如果遇到img或picture标签，将会加载图片
* 解析加载的样式，遇到background-image时，并不会加载图片，而会构建样式规则树
* 加载JavaScript，执行JavaScript代码，如果代码中有创建img元素之类，会添加到DOM树中；如查有添加background-image规则，将会添加到样式规则树中
* DOM树和样式规则匹配时构建渲染树，如果DOM树节点匹配到样式规则中的backgorund-image，则会加载背景图片
* 计算元素（图片）位置进行布局
* 开始渲染图片，浏览器将呈现渲染出来的图片

上面套用浏览器渲染页面的机制，但图片加载与渲染还是有一定的规则。因为，页面中不是所有的`<img>`（或picture）元素引入的图片和background-image引入的背景图片都会加载的。那么就引发出新问题了，什么时候会真正的加载，加载规则又是什么？

先概括一点：

> Web页面中不是所有的图片都会加载和渲染！

我们可以归纳为：

* `<img>`、`<picture>`和设置background-image的元素遇到display:none时，图片会加载，但不会渲染。
* `<img>`、`<picture>`和设置background-image的元素祖先元素设置display:none时，background-image不会渲染也不会加载，而img和picture引入的图片不会渲染但会加载
* `<img>`、`<picture>`和background-image引入相同路径相同图片文件名时，图片只会加载一次
* 样式文件中background-image引入的图片，如果匹配不到DOM元素，图片不会加载
* 伪类引入的background-image，比如:hover，只有当伪类被触发时，图片才会加载

</details>

## 74. CSS中的 “flex:1;” 是什么意思？ {#question-286f67d3-4e8d-48f5-962a-ed9cccc46335}

> 难度：1 · 类型：QA

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

## 75. 分析比较 opacity: 0、visibility: hidden、display: none 优劣和适用场景 {#question-4c911fbf-c243-476a-ad8d-09a7868b304e}

> 难度：2 · 类型：QA

### 题目要点

display:none: 会让元素完全从渲染树中消失，渲染的时候不占据任何空间, 不能点击， visibility: hidden:不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，不能点击 opacity: 0: 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，可以点击

<details>
<summary>参考答案</summary>

## 结构

display:none: 会让元素完全从渲染树中消失，渲染的时候不占据任何空间, 不能点击，
visibility: hidden:不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，不能点击
opacity: 0: 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，可以点击

## 继承
display: none和opacity: 0：是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示。
visibility: hidden：是继承属性，子孙节点消失由于继承了hidden，通过设置visibility: visible;可以让子孙节点显式。

## 性能

displaynone : 修改元素会造成文档回流,读屏器不会读取display: none元素内容，性能消耗较大
visibility:hidden: 修改元素只会造成本元素的重绘,性能消耗较少读屏器读取visibility: hidden元素内容
opacity: 0 ：修改元素会造成重绘，性能消耗较少

</details>

## 76. Atom CSS 是什么？ {#question-b7956f38-87f5-4db6-958a-7ae47d60da9b}

> 难度：2 · 类型：QA

### 题目要点

Atom CSS：原子CSS，意思是一个类只干一件事。

<details>
<summary>参考答案</summary>

Atom CSS：原子CSS，意思是一个类只干一件事。

不同于大家常用的BEM这类规则，原子css就是拆分，所有 CSS 类都有一个唯一的 CSS 规则。例如如下

```css
.w-full{
  width:100%;
}
.h-full{
  height:100%;
}
```

而像这种就不是
```
.w&h-full{
  width:100%;
  height:100%;
}
```

当我们使用的时候，直接写class名就可以

```html
<html>
    <body>
        <div id="app" class="w-full h-full">
        </div>
    </body>
</html>

```

## 原子CSS的优缺点

* 优点
    * 减少了css体积，提高了css复用
    * 减少起名的复杂度
* 缺点
    * 增加了记忆成本。将css拆分为原子之后，你势必要记住一些class才能书写，哪怕tailwindcss提供了完善的工具链，你写background，也要记住开头是bg。
    * 增加了html结构的复杂性。当整个dom都是这样class名，势必会带来调试的麻烦，有的时候很难定位具体css问题
    * 你仍需要起class名。对于大部分属性而言，你可以只用到center,auto，100%，这些值，但是有时候你仍需要设定不一样的参数值，例如left，top，这时候你还需要起一个class名

</details>

## 77. CSS中的1像素问题是什么？有哪些解决方案？ {#question-7904bc3e-62e0-44a1-ac3e-bdd737471b7e}

> 难度：3.5 · 类型：QA

### 题目要点

- **1 像素问题** 是由于高分辨率屏幕上的像素密度不同，导致 1 像素边框或线条的渲染问题。
- **解决方案** 包括使用 `border`、`box-shadow`、`transform`、`background`、CSS 变量、媒体查询，以及 SVG 或 Canvas 绘制。

<details>
<summary>参考答案</summary>

## 1px 边框问题的由来

苹果 iPhone4 首次提出了 Retina Display（视网膜屏幕）的概念，在 iPhone4 使用的视网膜屏幕中，把 2x2 个像素当 1 个物理像素使用，即使用 2x2 个像素显示原来 1 个物理像素显示的内容，从而让 UI 显示更精致清晰，这 2x2 个像素叫做逻辑像素。

像这种像素比（像素比（即dpr）＝ 物理像素 / 逻辑像素）为 2 的视网膜屏幕也被称为二倍屏，目前市面上还有像素比更高的三倍屏、四倍屏。

而 CSS 中 1px 指的是物理像素，因此，设置为 1px 的边框在 dpr = 2 的视网膜屏幕中实际占用了 2 个逻辑像素的宽度，这就导致了界面边框变粗的视觉体验。

## 使用 transform 解决

通过设置元素的 box-sizing 为 border-box，然后构建伪元素，再使用 CSS3 的 transform 缩放，这是目前市面上最受推崇的解决方法。这种方法可以满足所有的场景，而且修改灵活，唯一的缺陷是，对于已使用伪元素的元素要多嵌套一个无用元素。具体的实现如下：

```css
.one-pixel-border {
  position: relative;
  box-sizing: border-box;
}

.one-pixel-border::before {
  display: block;
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  border: 1px solid red;
  transform: translate(-50%, -50%) scale(0.5, 0.5);
}
```

这样就可以得到 0.5px 的边框。

还可以结合媒体查询（@media）解决不同 dpr 值屏幕的边框问题，如下：

```css
@media screen and (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  ...
}

@media screen and (-webkit-min-device-pixel-ratio: 3), (min-resolution: 3dppx) {
  ...
}
```

当然还有不少其他的解决方案：border-image、background-image、viewport + rem + js、box-shadow等，但都有各自的缺点，不进行推荐，此处也不做详细介绍。

</details>

## 78. css加载会造成阻塞吗？ {#question-fda596ab-16db-41ab-9e81-5a567a373d42}

> 难度：2.5 · 类型：QA

### 题目要点

#### 答题思路

1. **传统浏览器行为**：
   - 在传统浏览器中，CSS文件是阻塞渲染过程的。浏览器会等待CSSOM（CSS对象模型）构建完成后，才会与DOM（文档对象模型）一起生成渲染树（Render Tree），然后开始页面的渲染。因此，如果CSS文件加载缓慢，会导致页面渲染的延迟。

2. **现代浏览器优化**：
   - 现代浏览器对CSS的加载和渲染过程进行了一定的优化。例如，通过异步加载CSS（如使用`<link rel="preload" as="style" href="...">`）或利用媒体查询（Media Queries）来控制CSS的加载时机，可以减少CSS对页面渲染的阻塞影响。
   - 但是，即使采用了这些优化手段，CSS的加载仍然会对页面渲染产生一定的影响，只是程度可能有所减轻。

3. **结论**：
   - 总体上，CSS加载确实会造成一定的阻塞，但这种阻塞可以通过合理的加载策略和浏览器优化来减轻。

#### 考察要点

1. **对CSS加载机制的理解**：面试者是否了解CSS是如何被浏览器加载和处理的，以及这个过程中可能遇到的问题。
2. **浏览器优化知识**：面试者是否了解现代浏览器在CSS加载和渲染方面所做的优化措施。
3. **性能优化意识**：面试者是否具备通过合理的加载策略来减轻CSS加载对页面性能影响的意识。

<details>
<summary>参考答案</summary>

先说下结论：

* css加载不会阻塞DOM树的解析
* css加载会阻塞DOM树的渲染
* css加载会阻塞后面js语句的执行

为了避免让用户看到长时间的白屏时间，我们应该尽可能的提高css加载速度，比如可以使用以下几种方法:

* 使用CDN(因为CDN会根据你的网络状况，替你挑选最近的一个具有缓存内容的节点为你提供资源，因此可以减少加载时间)
* 对css进行压缩(可以用很多打包工具，比如webpack,gulp等，也可以通过开启gzip压缩)
* 合理的使用缓存(设置cache-control,expires,以及E-tag都是不错的，不过要注意一个问题，就是文件更新后，你要避免缓存而带来的影响。其中一个解决防范是在文件名字后面加一个版本号)
* 减少http请求数，将多个css文件合并，或者是干脆直接写成内联样式(内联样式的一个缺点就是不能缓存)

## 原理解析

浏览器渲染的流程如下：

* HTML解析文件，生成DOM Tree，解析CSS文件生成CSSOM Tree
* 将Dom Tree和CSSOM Tree结合，生成Render Tree(渲染树)
* 根据Render Tree渲染绘制，将像素渲染到屏幕上。

从流程我们可以看出来:

* DOM解析和CSS解析是两个并行的进程，所以这也解释了为什么CSS加载不会阻塞DOM的解析。
* 然而，由于Render Tree是依赖于DOM Tree和CSSOM Tree的，所以他必须等待到CSSOM Tree构建完成，也就是CSS资源加载完成(或者CSS资源加载失败)后，才能开始渲染。因此，CSS加载是会阻塞Dom的渲染的。
* 由于js可能会操作之前的Dom节点和css样式，因此浏览器会维持html中css和js的顺序。因此，样式表会在后面的js执行前先加载执行完毕。所以css会阻塞后面js的执行。

</details>

## 79. CSS 中有哪几种定位方式？ {#question-f1e6c221-11b8-4e5d-8e8b-f4c70d698291}

> 难度：2 · 类型：QA

### 题目要点

Static

<details>
<summary>参考答案</summary>

* Static

这个是元素的默认定位方式，元素出现在正常的文档流中，会占用页面空间。

* Relative

相对定位方式，相对于其父级元素（无论父级元素此时为何种定位方式）进行定位，准确地说是相对于其父级元素所剩余的未被占用的空间进行定位（在父元素由多个相对定位的子元素时可以看出），且会占用该元素在文档中初始的页面空间，即在使用top，bottom，left，right进行移动位置之后依旧不会改变其所占用空间的位置。可以使用z-index进行在z轴方向上的移动。

* Absolute

绝对定位方式，脱离文档流，不会占用页面空间。以最近的不是static定位的父级元素作为参考进行定位，如果其所有的父级元素都是static定位，那么此元素最终则是以当前窗口作为参考进行定位。

可以使用top，bottom，left，right进行位置移动，亦可使用z-index在z轴上面进行移动。当元素为此定位时，如果该元素为内联元素，则会变为块级元素，即可以直接设置其宽和高的值；如果该元素为块级元素，则其宽度会由初始的100%变为auto。

注意：当元素设置为绝对定位时，在没有指定top，bottom，left，right的值时，他们的值并不是0，这几个值是有默认值的，默认值就是该元素设置为绝对定位前所处的正常文档流中的位置。

* Fixed

绝对定位方式，直接以浏览器窗口作为参考进行定位。其它特性同absolute定位。

当父元素使用了transform的时候，会以父元素定位。

* sticky

粘性定位，可以简单理解为relative和fixed布局的混合。

当粘性约束矩形在可视范围内为relative，反之，则为fixed粘性定位元素如果和它的父元素一样高，则垂直滚动的时候，粘性定位效果是不会出现的它的定位效果完全受限于父级元素们。

如果父元素的overflow属性设置了scroll，auto,overlay值，那么，粘性定位将会失效同一容器中多个粘贴定位元素独立偏移，因此可能重叠；位置上下靠在一起的不同容器中的粘贴定位元素则会鸠占鹊巢，挤开原来的元素，形成依次占位的效果。

</details>

## 80. 什么是CSS Sprites？ {#question-52e2ccda-70e2-438b-8328-ef25f78afb6a}

> 难度：1 · 类型：QA

### 题目要点

将一个页面涉及到的所有图片都包含到一张大图中去，然后利用CSS的 `background-image`，`background-repeat`，`background-position` 的组合进行背景定位。 利用`CSS Sprites`能很好地减少网页的http请求，从而大大的提高页面的性能。

<details>
<summary>参考答案</summary>

将一个页面涉及到的所有图片都包含到一张大图中去，然后利用CSS的 `background-image`，`background-repeat`，`background-position` 的组合进行背景定位。
利用`CSS Sprites`能很好地减少网页的http请求，从而大大的提高页面的性能。

</details>

## 81. style标签写在body后与body前有什么区别？ {#question-14912aa6-d4d4-4af9-ad73-e7641f3a6212}

> 难度：2 · 类型：QA

### 题目要点

页面加载自上而下 当然是先加载样式。

<details>
<summary>参考答案</summary>

页面加载自上而下 当然是先加载样式。

写在body标签后由于浏览器以逐行方式对HTML文档进行解析，当解析到写在尾部的样式表（外联或写在style标签）会导致浏览器停止之前的渲染，等待加载且解析样式表完成之后重新渲染，在windows的IE下可能会出现FOUC现象（即样式失效导致的页面闪烁问题）

</details>

## 82. 两个同级的相邻元素之间，有看不见的空白间隔，是什么原因引起的？有什么解决办法？ {#question-12770dfd-79d2-4c0b-80e1-e19f3ab85c82}

> 难度：1 · 类型：QA

### 题目要点

行框的排列会受到中间空白（回车空格）等的影响，因为空格也属于字符,这些空白也会被应用样式，占据空间，所以会有间隔，把字符大小设为0，就没有空格了。

<details>
<summary>参考答案</summary>

行框的排列会受到中间空白（回车空格）等的影响，因为空格也属于字符,这些空白也会被应用样式，占据空间，所以会有间隔，把字符大小设为0，就没有空格了。

解决方法：

* 相邻元素代码代码全部写在一排
* 浮动元素，float:left;
* 在父级元素中用font-size:0;

</details>

## 83. 如果需要手动写动画，你认为最小时间间隔是多久，为什么？ {#question-27da945d-848c-4af3-bc27-65e4833776b2}

> 难度：1 · 类型：QA

### 题目要点

多数显示器默认频率是60Hz，即1秒刷新60次，所以理论上最小间隔为1/60＊1000ms ＝ 16.7ms。

<details>
<summary>参考答案</summary>

多数显示器默认频率是60Hz，即1秒刷新60次，所以理论上最小间隔为1/60＊1000ms ＝ 16.7ms。

</details>

## 84. ::before 和 :after中双冒号和单冒号有什么区别？解释一下这2个伪元素的作用 {#question-ec2aa05e-da02-4a15-9862-9eaee4aa54e5}

> 难度：1 · 类型：QA

### 题目要点

单冒号(:)用于CSS3伪类，双冒号(::)用于CSS3伪元素。

<details>
<summary>参考答案</summary>

* 单冒号(:)用于CSS3伪类，双冒号(::)用于CSS3伪元素。
* ::before就是以一个子元素的存在，定义在元素主体内容之前的一个伪元素。并不存在于dom之中，只存在在页面之中。

:before 和 :after 这两个伪元素，是在CSS2.1里新出现的。起初，伪元素的前缀使用的是单冒号语法，但随着Web的进化，在CSS3的规范里，伪元素的语法被修改成使用双冒号，成为::before ::after

</details>

## 85. 元素竖向的百分比设定是相对于容器的高度吗？ {#question-60b32fdd-58ef-4fe0-bc87-da65c5a00db1}

> 难度：2 · 类型：QA

### 题目要点

当按百分比设定一个元素的宽度时，它是相对于父容器的宽度计算的，但是，对于一些表示竖向距离的属性，例如 padding-top , padding-bottom , margin-top , margin-bottom 等，当按百分比设定它们时，依据的也是父容器的宽度，而不是高度。

<details>
<summary>参考答案</summary>

当按百分比设定一个元素的宽度时，它是相对于父容器的宽度计算的，但是，对于一些表示竖向距离的属性，例如 padding-top , padding-bottom , margin-top , margin-bottom 等，当按百分比设定它们时，依据的也是父容器的宽度，而不是高度。

</details>

## 86. CSS优化、提高性能的方法有哪些？ {#question-180f752e-370b-447e-b755-6d004f8f0db0}

> 难度：2 · 类型：QA

### 题目要点

避免过度约束

<details>
<summary>参考答案</summary>

* 避免过度约束
* 避免后代选择符
* 避免链式选择符
* 使用紧凑的语法
* 避免不必要的命名空间
* 避免不必要的重复
* 最好使用表示语义的名字。一个好的类名应该是描述他是什么而不是像什么
* 避免！important，可以选择其他选择器
* 尽可能的精简规则，你可以合并不同类里的重复规则

</details>

## 87. margin和padding分别适合什么场景使用？ {#question-ff429084-6242-4bd6-9f09-64e567aeb99d}

> 难度：1 · 类型：QA

### 题目要点

何时使用margin：

<details>
<summary>参考答案</summary>

何时使用margin：

* 需要在border外侧添加空白
* 空白处不需要背景色
* 上下相连的两个盒子之间的空白，需要相互抵消时。

何时使用padding：

* 需要在border内侧添加空白
* 空白处需要背景颜色
* 上下相连的两个盒子的空白，希望为两者之和。

</details>

## 88. 什么是CSS媒体查询? {#question-c7844d1f-223c-41cc-b6c2-6df29d8ecc00}

> 难度：1 · 类型：QA

### 题目要点

媒体查询(Media Queries)早在在css2时代就存在,经过css3的洗礼后变得更加强大bootstrap的响应式特性就是从此而来的.

<details>
<summary>参考答案</summary>

媒体查询(Media Queries)早在在css2时代就存在,经过css3的洗礼后变得更加强大bootstrap的响应式特性就是从此而来的.

简单的来讲媒体查询是一种用于修饰css何时起作用的语法.

> Media Queries 的引入，其作用就是允许添加表达式用以确定媒体的环境情况，以此来应用不同的样式表。换句话说，其允许我们在不改变内容的情况下，改变页面的布局以精确适应不同的设备。

</details>

## 89. 为什么会出现浮动？什么时候需要清除浮动？清除浮动的方式有哪些？ {#question-d28f9b69-6d6c-474d-82ad-682dddfe1aa5}

> 难度：1 · 类型：QA

### 题目要点

浮动元素碰到包含它的边框或者浮动元素的边框停留。由于浮动元素不在文档流中，所以文档流的块框表现得就像浮动框不存在一样。浮动元素会漂浮在文档流的块框上。

<details>
<summary>参考答案</summary>

浮动元素碰到包含它的边框或者浮动元素的边框停留。由于浮动元素不在文档流中，所以文档流的块框表现得就像浮动框不存在一样。浮动元素会漂浮在文档流的块框上。

浮动带来的问题：

* 父元素的高度无法被撑开，影响与父元素同级的元素
* 与浮动元素同级的非浮动元素（内联元素）会跟随其后
* 若非第一个元素浮动，则该元素之前的元素也需要浮动，否则会影响页面显示的结构。

清除浮动的方式：

* 父级div定义height
* 最后一个浮动元素后加空div标签 并添加样式clear:both。
* 包含浮动元素的父标签添加样式overflow为hidden或auto。
* 父级div定义zoom

</details>

## 90. 什么是BFC？ {#question-5c174882-c1e7-4c08-a71a-f4c991be552f}

> 难度：3 · 类型：QA

### 题目要点

**BFC（Block Formatting Context）** 是 CSS 中一个重要的布局概念，它描述了一个块级元素的内部布局和外部布局之间的关系。BFC 主要用于处理元素的布局、浮动、边距合并等问题。

### BFC 的作用

1. **阻止外边距折叠**：
   - **外边距折叠**：当两个块级元素垂直相邻时，它们的外边距会合并，形成一个更大的外边距。
   - **BFC**：在 BFC 内部的元素的外边距不会影响到外部 BFC 的元素，避免了外边距折叠的问题。

2. **包含浮动元素**：
   - **浮动元素**：通常会从其包含块中溢出。
   - **BFC**：具有 BFC 的元素可以包含其内部的浮动元素，确保其高度包括浮动元素的高度。

3. **控制元素的布局**：
   - **BFC**：在 BFC 内部，元素的布局（如浮动、定位）会受到影响和控制，避免与外部元素发生冲突。

4. **防止元素重叠**：
   - **BFC**：能够隔离不同的 BFC 区域，避免元素之间的重叠或干扰。

### 如何触发 BFC

BFC 会在以下情况中被触发：

1. **块级格式化上下文的创建**：
   - 元素的 `display` 属性值为 `block` 或 `inline-block`。
   - 元素的 `position` 属性值为 `absolute` 或 `fixed`。
   - 元素的 `float` 属性值为 `left` 或 `right`。
   - 元素的 `overflow` 属性值为 `hidden`、`scroll` 或 `auto`。

2. **其他常见触发情况**：
   - 使用 `overflow` 属性，设置为 `hidden`、`scroll`、`auto`。
   - 使用 `display: flow-root`。
   - 使用 Flexbox 或 Grid 布局的容器也会创建 BFC。

### 示例

**1. 防止外边距折叠**：

```html
<div style="margin: 0; padding: 0; background: lightgray;">
  <div style="margin: 20px; background: lightblue;">Inner</div>
</div>
```

**2. 包含浮动元素**：

```html
<div style="overflow: hidden;">
  <div style="float: left; width: 100px; height: 100px; background: lightblue;"></div>
</div>
```

### 总结

- **BFC（Block Formatting Context）** 是一种 CSS 布局概念，用于控制块级元素的布局和外部元素的影响。
- **主要作用** 包括防止外边距折叠、包含浮动元素、控制布局和防止重叠。
- **触发 BFC** 的常见方法包括设置 `overflow` 属性、`display` 属性、`float` 属性和特定的布局模式。

<details>
<summary>参考答案</summary>

BFC：block formatting context，块级格式化上下文。

BFC是Web页面的可视CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

定位方案：

* 内部的Box会在垂直方向上一个接一个放置。
* Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠。
* 每个元素的margin box 的左边，与包含块border box的左边相接触。
* BFC的区域不会与float box重叠。
* BFC是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。
* 计算BFC的高度时，浮动元素也会参与计算。

满足下列条件之一就可触发BFC:

* 根元素，即html
* float的值不为none（默认）
* overflow的值不为visible（默认）
* display的值为table-cell, table-caption, inline-block, flex, 或者 inline-flex 中的其中一个
* position的值为absolute或fixed

</details>

## 91. CSS3新增伪类有那些？ {#question-a180397f-7b8e-421f-964e-ed97bdd57efd}

> 难度：1 · 类型：QA

### 题目要点

p:first-of-type 选择属于其父元素的首个元素

<details>
<summary>参考答案</summary>

* p:first-of-type 选择属于其父元素的首个元素
* p:last-of-type 选择属于其父元素的最后元素
* p:only-of-type 选择属于其父元素唯一的元素
* p:only-child 选择属于其父元素的唯一子元素
* p:nth-child(2) 选择属于其父元素的第二个子元素
* :enabled :disabled 表单控件的禁用状态。
* :checked 单选框或复选框被选中。

</details>

## 92. CSS中，box-sizing属性值有什么用？ {#question-d26004b5-4091-4a30-b66f-7c6e78dd34c8}

> 难度：0.5 · 类型：QA

### 题目要点

用来控制元素的盒子模型的解析模式，默认为content-box

<details>
<summary>参考答案</summary>

用来控制元素的盒子模型的解析模式，默认为content-box

* context-box：W3C的标准盒子模型，设置元素的 height/width 属性指的是content部分的高/宽
* border-box：IE传统盒子模型。设置元素的height/width属性指的是border + padding + content部分的高/宽

</details>

## 93. 前端项目中为什么要初始化CSS样式？ {#question-a4bbb8e2-1333-460a-8127-87f04f83c5b8}

> 难度：1 · 类型：QA

### 题目要点

因为浏览器的兼容问题，不同浏览器对标签的默认值是不同的，如果没有对浏览器的CSS初始化，会造成相同页面在不同浏览器的显示存在差异。

<details>
<summary>参考答案</summary>

因为浏览器的兼容问题，不同浏览器对标签的默认值是不同的，如果没有对浏览器的CSS初始化，会造成相同页面在不同浏览器的显示存在差异。

</details>

## 94. 页面导入样式时，使用link和@import有什么区别？ {#question-d7e46f80-9878-4757-8535-ee962dca4ee6}

> 难度：1 · 类型：QA

### 题目要点

link属于HTML标签，而@import是css提供的；

<details>
<summary>参考答案</summary>

link属于HTML标签，而@import是css提供的；

页面被加载时，link会同时被加载，而@import引用的css会等到页面被加载完再加载；

@import只在IE5以上才能识别，而link是XHTML标签，无兼容问题；

link方式的样式的权重高于@import的权重。

</details>

## 95. CSS匹配规则顺序是怎么样的？ {#question-3e5ade06-6338-4949-b642-47f09bcff045}

> 难度：2 · 类型：QA

### 题目要点

相信大多数初学者都会认为CSS匹配是左向右的，其实恰恰相反。

<details>
<summary>参考答案</summary>

相信大多数初学者都会认为CSS匹配是左向右的，其实恰恰相反。

CSS匹配发生在Render Tree构建时（Chrome Dev Tools将其归属于Layout过程）。此时浏览器构建出了DOM，而且拿到了CSS样式，此时要做的就是把样式跟DOM上的节点对应上，浏览器为了提高性能需要做的就是快速匹配。

首先要明确一点，浏览器此时是给一个"可见"节点找对应的规则，这和jQuery选择器不同，后者是使用一个规则去找对应的节点，这样从左到右或许更快。但是对于前者，由于CSS的庞大，一个CSS文件中或许有上千条规则，而且对于当前节点来说，大多数规则是匹配不上的，稍微想一下就知道，如果从右开始匹配（也是从更精确的位置开始），能更快排除不合适的大部分节点，而如果从左开始，只有深入了才会发现匹配失败，如果大部分规则层级都比较深，就比较浪费资源了。

除了上面这点，我们前面还提到DOM构建是"循序渐进的"，而且DOM不阻塞Render Tree构建（只有CSSOM阻塞），这样也是为了能让页面更早有元素呈现。

考虑如下情况，如果我们此时构建的只是部分DOM，而CSSOM构建完成，浏览器就会构建Render Tree。

这个时候对每一个节点，如果找到一条规则从右向左匹配，我们只需要逐层观察该节点父节点是否匹配，而此时其父节点肯定已经在DOM上。

但是反过来，我们可能会匹配到一个DOM上尚未存在的节点，此时的匹配过程就浪费了资源。

</details>

## 96. canvas在标签上设置宽高，与在style中设置宽高有什么区别？ {#question-5570174b-5bd1-4e00-a9cf-49f6ae227758}

> 难度：1 · 类型：QA

### 题目要点

canvas标签的width和height是画布实际宽度和高度，绘制的图形都是在这个上面。

<details>
<summary>参考答案</summary>

canvas标签的width和height是画布实际宽度和高度，绘制的图形都是在这个上面。

而style的width和height是canvas在浏览器中被渲染的高度和宽度。

如果canvas的width和height没指定或值不正确，就被设置成默认值。

</details>

## 97. grid网格布局是什么？ {#question-a1d425f5-4d07-4ffc-865b-23fec635032c}

> 难度：2 · 类型：QA

### 题目要点

CSS Grid布局是一种二维布局系统，允许你以网格的形式在网页上放置元素。它提供了一种更灵活和强大的方式，来创建复杂的页面布局，而不需要依赖传统的浮动或定位技术。

- **容器**：使用`display: grid;`将一个元素定义为网格容器。
- **行和列**：通过定义行和列的尺寸来创建网格的行和列。
- **网格线**：网格的行和列由网格线定义，可以通过`grid-template-columns`和`grid-template-rows`属性来指定。
- **网格单元格**：网格容器内的子元素会被放置在网格单元格中。
- **网格区域**：可以定义一个或多个连续的网格单元格，形成一个区域。
- **对齐**：可以通过`justify-items`、`align-items`和`place-items`属性来控制网格单元格内的内容对齐方式。
- **自适应尺寸**：可以使用`fr`单位来定义自适应的行和列尺寸，`fr`代表一个网格容器的可用空间的分数。
- **间隙**：可以通过`grid-gap`、`row-gap`和`column-gap`属性来定义网格行和列之间的间隙。
- **重叠**：网格布局允许元素重叠，可以通过`z-index`属性来控制重叠元素的堆叠顺序。
- **响应式**：可以通过媒体查询来调整网格的布局，使其在不同屏幕尺寸下表现良好。

### 示例代码

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 创建三列，每列等宽 */
  grid-gap: 10px; /* 定义行和列之间的间隙 */
}

.item {
  /* 子元素将自动填充网格单元格 */
}
```

在这个示例中，.container 被定义为一个网格容器，拥有三列，每列宽度相等，并且行和列之间有10像素的间隙。

#### 考察重点

- 对CSS Grid布局的基本概念和特性的理解。
- 能够使用Grid布局创建复杂的页面布局。
- 理解如何控制网格的行、列、单元格和区域。

<details>
<summary>参考答案</summary>

## 一、是什么

`Grid` 布局即网格布局，是一个二维的布局方式，由纵横相交的两组网格线形成的框架性布局结构，能够同时处理行与列

擅长将一个页面划分为几个主要区域，以及定义这些区域的大小、位置、层次等关系

 ![](https://static.ecool.fun//article/0714a4e2-e9bb-4ad1-a0f2-db2e7cd96c0e.png)

这与之前讲到的`flex`一维布局不相同

设置`display:grid/inline-grid`的元素就是网格布局容器，这样就能出发浏览器渲染引擎的网格布局算法

```js
<div class="container">
    <div class="item item-1">
        <p class="sub-item"></p >
 </div>
    <div class="item item-2"></div>
    <div class="item item-3"></div>
</div>
```

上述代码实例中，`.container`元素就是网格布局容器，`.item`元素就是网格的项目，由于网格元素只能是容器的顶层子元素，所以`p`元素并不是网格元素

这里提一下，网格线概念，有助于下面对`grid-column`系列属性的理解

网格线，即划分网格的线，如下图所示：

 ![](https://static.ecool.fun//article/8d0c8f20-7cd8-48d0-9ee4-80854afd4c54.png)

上图是一个 2 x 3 的网格，共有3根水平网格线和4根垂直网格线

## 二、属性

同样，`Grid` 布局属性可以分为两大类：

- 容器属性，
- 项目属性

关于容器属性有如下：

### display 属性

文章开头讲到，在元素上设置`display：grid` 或 `display：inline-grid` 来创建一个网格容器

- display：grid 则该容器是一个块级元素

- display: inline-grid 则容器元素为行内元素

### grid-template-columns 属性，grid-template-rows 属性

`grid-template-columns` 属性设置列宽，`grid-template-rows` 属性设置行高

```css
.wrapper {
  display: grid;
  /*  声明了三列，宽度分别为 200px 200px 200px */
  grid-template-columns: 200px 200px 200px;
  grid-gap: 5px;
  /*  声明了两行，行高分别为 50px 50px  */
  grid-template-rows: 50px 50px;
}
```

以上表示固定列宽为 200px 200px 200px，行高为 50px 50px

上述代码可以看到重复写单元格宽高，通过使用`repeat()`函数，可以简写重复的值

- 第一个参数是重复的次数
- 第二个参数是重复的值

所以上述代码可以简写成

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(3,200px);
  grid-gap: 5px;
  grid-template-rows:repeat(2,50px);
}
```

除了上述的`repeact`关键字，还有：

- auto-fill：示自动填充，让一行（或者一列）中尽可能的容纳更多的单元格

>`grid-template-columns: repeat(auto-fill, 200px)` 表示列宽是 200 px，但列的数量是不固定的，只要浏览器能够容纳得下，就可以放置元素

- fr：片段，为了方便表示比例关系

>`grid-template-columns: 200px 1fr 2fr` 表示第一个列宽设置为 200px，后面剩余的宽度分为两部分，宽度分别为剩余宽度的 1/3 和 2/3

- minmax：产生一个长度范围，表示长度就在这个范围之中都可以应用到网格项目中。第一个参数就是最小值，第二个参数就是最大值

>`minmax(100px, 1fr)`表示列宽不小于`100px`，不大于`1fr`

- auto：由浏览器自己决定长度

>`grid-template-columns: 100px auto 100px` 表示第一第三列为 100px，中间由浏览器决定长度

### grid-row-gap 属性， grid-column-gap 属性， grid-gap 属性

`grid-row-gap` 属性、`grid-column-gap` 属性分别设置行间距和列间距。`grid-gap` 属性是两者的简写形式

`grid-row-gap: 10px` 表示行间距是 10px

`grid-column-gap: 20px` 表示列间距是 20px

`grid-gap: 10px 20px` 等同上述两个属性

### grid-template-areas 属性

用于定义区域，一个区域由一个或者多个单元格组成

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas: 'a b c'
                       'd e f'
                       'g h i';
}
```

上面代码先划分出9个单元格，然后将其定名为`a`到`i`的九个区域，分别对应这九个单元格。

多个单元格合并成一个区域的写法如下

 ```css
 grid-template-areas: 'a a a'
                      'b b b'
                      'c c c';
 ```

上面代码将9个单元格分成`a`、`b`、`c`三个区域

如果某些区域不需要利用，则使用"点"（`.`）表示

### grid-auto-flow 属性

划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。

顺序就是由`grid-auto-flow`决定，默认为行，代表"先行后列"，即先填满第一行，再开始放入第二行

 ![](https://static.ecool.fun//article/5b612385-00aa-44d6-8da1-f0ee389c67a4.png)

当修改成`column`后，放置变为如下：

![](https://static.ecool.fun//article/7a9d326a-ac29-44a7-a054-fcdc00869e6b.png)

### justify-items 属性， align-items 属性， place-items 属性

`justify-items` 属性设置单元格内容的水平位置（左中右），`align-items` 属性设置单元格的垂直位置（上中下）

两者属性的值完成相同

```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```

属性对应如下：

- start：对齐单元格的起始边缘
- end：对齐单元格的结束边缘
- center：单元格内部居中
- stretch：拉伸，占满单元格的整个宽度（默认值）

`place-items`属性是`align-items`属性和`justify-items`属性的合并简写形式

### justify-content 属性， align-content 属性， place-content 属性

`justify-content`属性是整个内容区域在容器里面的水平位置（左中右），`align-content`属性是整个内容区域的垂直位置（上中下）

```css
.container {
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
}
```

两个属性的写法完全相同，都可以取下面这些值：

- start - 对齐容器的起始边框
- end - 对齐容器的结束边框
- center - 容器内部居中

 ![](https://static.ecool.fun//article/0b3d3683-95b8-41ea-9a96-2bf56e624dce.png)

- space-around - 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与容器边框的间隔大一倍

- space-between - 项目与项目的间隔相等，项目与容器边框之间没有间隔

- space-evenly - 项目与项目的间隔相等，项目与容器边框之间也是同样长度的间隔

- stretch - 项目大小没有指定时，拉伸占据整个网格容器

 ![](https://static.ecool.fun//article/57d0cb19-b15b-4035-9a2e-fcdf95cead2b.png)

### grid-auto-columns 属性和 grid-auto-rows 属性

有时候，一些项目的指定位置，在现有网格的外部，就会产生显示网格和隐式网格

比如网格只有3列，但是某一个项目指定在第5行。这时，浏览器会自动生成多余的网格，以便放置项目。超出的部分就是隐式网格

而`grid-auto-rows`与`grid-auto-columns`就是专门用于指定隐式网格的宽高

关于项目属性，有如下：

### grid-column-start 属性、grid-column-end 属性、grid-row-start 属性以及grid-row-end 属性

指定网格项目所在的四个边框，分别定位在哪根网格线，从而指定项目的位置

- grid-column-start 属性：左边框所在的垂直网格线
- grid-column-end 属性：右边框所在的垂直网格线
- grid-row-start 属性：上边框所在的水平网格线
- grid-row-end 属性：下边框所在的水平网格线

举个例子：

```html
<style>
    #container{
        display: grid;
        grid-template-columns: 100px 100px 100px;
        grid-template-rows: 100px 100px 100px;
    }
    .item-1 {
        grid-column-start: 2;
        grid-column-end: 4;
    }
</style>

<div id="container">
    <div class="item item-1">1</div>
    <div class="item item-2">2</div>
    <div class="item item-3">3</div>
</div>
```

通过设置`grid-column`属性，指定1号项目的左边框是第二根垂直网格线，右边框是第四根垂直网格线

 ![](https://static.ecool.fun//article/93cbc15c-fd3c-490b-9648-7672bf742851.png)

### grid-area 属性

`grid-area` 属性指定项目放在哪一个区域

```css
.item-1 {
  grid-area: e;
}
```

意思为将1号项目位于`e`区域

与上述讲到的`grid-template-areas`搭配使用

### justify-self 属性、align-self 属性以及 place-self 属性

`justify-self`属性设置单元格内容的水平位置（左中右），跟`justify-items`属性的用法完全一致，但只作用于单个项目。

`align-self`属性设置单元格内容的垂直位置（上中下），跟`align-items`属性的用法完全一致，也是只作用于单个项目

 ```css
 .item {
   justify-self: start | end | center | stretch;
   align-self: start | end | center | stretch;
 }
 ```

这两个属性都可以取下面四个值。

 - start：对齐单元格的起始边缘。
  - end：对齐单元格的结束边缘。
 - center：单元格内部居中。
 - stretch：拉伸，占满单元格的整个宽度（默认值）

## 三、应用场景

文章开头就讲到，`Grid`是一个强大的布局，如一些常见的 CSS 布局，如居中，两列布局，三列布局等等是很容易实现的，在以前的文章中，也有使用`Grid`布局完成对应的功能

关于兼容性问题，结果如下：

 ![](https://static.ecool.fun//article/0d29d9de-8cf6-46bb-bf73-3f4de983722a.png)

总体兼容性还不错，但在 IE 10 以下不支持

目前，`Grid`布局在手机端支持还不算太友好

</details>

## 98. CSS3新增了哪些特性？ {#question-9083d1ed-fedc-4aec-ba50-df836e983e55}

> 难度：0.5 · 类型：QA

### 题目要点

CSS3是CSS的最新版本，它引入了许多新特性和改进，以增强网页设计的能力和用户体验。以下是一些重要的CSS3特性：

- **选择器增强**：CSS3引入了新的选择器，如属性选择器、伪类选择器（如`:nth-child`、`:nth-of-type`）、伪元素选择器（如`::first-line`、`::before`、`::after`）等。

- **Flexbox布局**：一种新的布局模式，为一维布局提供了更灵活的伸缩性。

- **Grid布局**：一种二维布局系统，允许在网页上以网格形式放置元素。

- **多列布局**：允许内容在多个列中显示，类似于报纸的布局。

- **圆角**：`border-radius`属性允许创建圆角边框。

- **阴影和反射**：`box-shadow`和`text-shadow`属性用于添加阴影效果，`::before`和`::after`伪元素可以创建反射效果。

- **渐变**：线性渐变（`linear-gradient`）和径向渐变（`radial-gradient`）可以用于背景图像。

- **转换**：`transform`属性允许对元素进行旋转、缩放、倾斜和位移等变换。

- **过渡**：`transition`属性允许在属性值变化时创建平滑的过渡效果。

- **动画**：`@keyframes`规则结合`animation`属性，允许创建复杂的动画效果。

- **媒体查询**：允许根据不同的媒体类型和特性（如屏幕大小、分辨率等）应用不同的样式。

- **Web字体**：`@font-face`规则允许网页使用自定义字体。

- **背景大小**：`background-size`属性允许控制背景图像的大小。

- **弹性盒子模型**：一种新的布局方式，允许元素在容器内灵活地伸缩。

- **边框图像**：`border-image`属性允许使用图像作为边框。

- **形状**：`clip-path`属性允许创建非矩形的元素形状。

- **滤镜效果**：`filter`属性提供了多种视觉效果，如模糊、亮度调整等。

- **自定义属性（CSS变量）**：允许在CSS中定义变量，以便于样式的复用和维护。

- **响应式图像**：`srcset`和`sizes`属性允许为不同屏幕尺寸提供不同分辨率的图片。

- **全屏模式**：`:fullscreen`伪类选择器允许元素在全屏模式下应用特定的样式。

<details>
<summary>参考答案</summary>

## 一、是什么

`css`，即层叠样式表（Cascading Style Sheets）的简称，是一种标记语言，由浏览器解释执行用来使页面变得更美观

`css3`是`css`的最新标准，是向后兼容的，`CSS1/2 `的特性在` CSS3` 里都是可以使用的

而` CSS3` 也增加了很多新特性，为开发带来了更佳的开发体验

## 二、选择器

`css3`中新增了一些选择器，主要为如下图所示：

 ![](https://static.ecool.fun//article/bc62fec7-c228-4e93-8622-228f935050a7.png)

## 三、新样式

### 边框

`css3`新增了三个边框属性，分别是：

- border-radius：创建圆角边框
- box-shadow：为元素添加阴影

- border-image：使用图片来绘制边框

#### box-shadow

设置元素阴影，设置属性如下：

- 水平阴影
- 垂直阴影
- 模糊距离(虚实)
- 阴影尺寸(影子大小)
- 阴影颜色
- 内/外阴影

其中水平阴影和垂直阴影是必须设置的

### 背景

新增了几个关于背景的属性，分别是`background-clip`、`background-origin`、`background-size`和`background-break`

#### background-clip

用于确定背景画区，有以下几种可能的属性：

- background-clip: border-box; 背景从border开始显示
- background-clip: padding-box; 背景从padding开始显示
- background-clip: content-box; 背景显content区域开始显示
- background-clip: no-clip; 默认属性，等同于border-box

通常情况，背景都是覆盖整个元素的，利用这个属性可以设定背景颜色或图片的覆盖范围

#### background-origin

当我们设置背景图片时，图片是会以左上角对齐，但是是以`border`的左上角对齐还是以`padding`的左上角或者`content`的左上角对齐? `border-origin`正是用来设置这个的

- background-origin: border-box; 从border开始计算background-position
- background-origin: padding-box; 从padding开始计算background-position
- background-origin: content-box; 从content开始计算background-position

默认情况是`padding-box`，即以`padding`的左上角为原点

#### background-size

background-size属性常用来调整背景图片的大小，主要用于设定图片本身。有以下可能的属性：

- background-size: contain; 缩小图片以适合元素（维持像素长宽比）
- background-size: cover; 扩展元素以填补元素（维持像素长宽比）
- background-size: 100px 100px; 缩小图片至指定的大小
- background-size: 50% 100%; 缩小图片至指定的大小，百分比是相对包 含元素的尺寸

### background-break

元素可以被分成几个独立的盒子（如使内联元素span跨越多行），`background-break` 属性用来控制背景怎样在这些不同的盒子中显示

- background-break: continuous; 默认值。忽略盒之间的距离（也就是像元素没有分成多个盒子，依然是一个整体一样）
- background-break: bounding-box; 把盒之间的距离计算在内；
- background-break: each-box; 为每个盒子单独重绘背景

### 文字

### word-wrap

语法：`word-wrap: normal|break-word`

- normal：使用浏览器默认的换行
- break-all：允许在单词内换行

### text-overflow

` text-overflow`设置或检索当当前行超过指定容器的边界时如何显示，属性有两个值选择：

- clip：修剪文本
- ellipsis：显示省略符号来代表被修剪的文本

### text-shadow

`text-shadow`可向文本应用阴影。能够规定水平阴影、垂直阴影、模糊距离，以及阴影的颜色

### text-decoration

CSS3里面开始支持对文字的更深层次的渲染，具体有三个属性可供设置：

- text-fill-color: 设置文字内部填充颜色

- text-stroke-color: 设置文字边界填充颜色

- text-stroke-width: 设置文字边界宽度

### 颜色

`css3`新增了新的颜色表示方式`rgba`与`hsla`

- rgba分为两部分，rgb为颜色值，a为透明度
- hala分为四部分，h为色相，s为饱和度，l为亮度，a为透明度

## 四、transition 过渡

`transition`属性可以被指定为一个或多个` CSS `属性的过渡效果，多个属性之间用逗号进行分隔，必须规定两项内容：

- 过度效果
- 持续时间

语法如下：

```css
transition： CSS属性，花费时间，效果曲线(默认ease)，延迟时间(默认0)
```

上面为简写模式，也可以分开写各个属性

```css
transition-property: width;
transition-duration: 1s;
transition-timing-function: linear;
transition-delay: 2s;
```

### 五、transform 转换

`transform`属性允许你旋转，缩放，倾斜或平移给定元素

`transform-origin`：转换元素的位置（围绕那个点进行转换），默认值为`(x,y,z):(50%,50%,0)`

使用方式：

- transform: translate(120px, 50%)：位移
- transform: scale(2, 0.5)：缩放
- transform: rotate(0.5turn)：旋转
- transform: skew(30deg, 20deg)：倾斜

### 六、animation 动画

动画这个平常用的也很多，主要是做一个预设的动画。和一些页面交互的动画效果，结果和过渡应该一样，让页面不会那么生硬

animation也有很多的属性

- animation-name：动画名称
- animation-duration：动画持续时间
- animation-timing-function：动画时间函数
- animation-delay：动画延迟时间
- animation-iteration-count：动画执行次数，可以设置为一个整数，也可以设置为infinite，意思是无限循环
- animation-direction：动画执行方向
- animation-paly-state：动画播放状态
- animation-fill-mode：动画填充模式

## 七、渐变

颜色渐变是指在两个颜色之间平稳的过渡，`css3`渐变包括

- linear-gradient：线性渐变

> background-image: linear-gradient(direction, color-stop1, color-stop2, ...);

- radial-gradient：径向渐变

> linear-gradient(0deg, red, green);

## 八、其他

关于`css3`其他的新特性还包括`flex`弹性布局、`Grid`栅格布局，这两个布局在以前就已经讲过，这里就不再展示

除此之外，还包括多列布局、媒体查询、混合模式等等......

</details>

## 99. 怎么使用 CSS3 实现动画？ {#question-38358609-e797-42f9-983d-3e2709fb4fdd}

> 难度：1.5 · 类型：QA

### 题目要点

在CSS3中，实现动画主要有两种方式：transition 和 @keyframes 结合 animation 属性。以下是这两种方式的基本用法：

**使用 transition 实现简单动画**

transition 属性用于在CSS属性值变化时创建平滑的过渡效果。它不适用于复杂的动画，但对于简单的效果非常有效。

**使用 @keyframes 和 animation 实现复杂动画**

对于更复杂的动画效果，可以使用 @keyframes 规则定义动画的关键帧，然后使用 animation 属性应用这些动画。

<details>
<summary>参考答案</summary>

## 一、是什么

CSS动画（CSS Animations）是为层叠样式表建议的允许可扩展标记语言（XML）元素使用CSS的动画的模块

即指元素从一种样式逐渐过渡为另一种样式的过程

常见的动画效果有很多，如平移、旋转、缩放等等，复杂动画则是多个简单动画的组合

`css`实现动画的方式，有如下几种：

- transition 实现渐变动画
- transform 转变动画
- animation 实现自定义动画

## 二、实现方式

### transition 实现渐变动画

`transition`的属性如下：

- property:填写需要变化的css属性
- duration:完成过渡效果需要的时间单位(s或者ms)
- timing-function:完成效果的速度曲线
- delay: 动画效果的延迟触发时间

其中`timing-function`的值有如下：

| 值                            | 描述                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| linear                        | 匀速（等于 cubic-bezier(0,0,1,1)）                           |
| ease                          | 从慢到快再到慢（cubic-bezier(0.25,0.1,0.25,1)）              |
| ease-in                       | 慢慢变快（等于 cubic-bezier(0.42,0,1,1)）                    |
| ease-out                      | 慢慢变慢（等于 cubic-bezier(0,0,0.58,1)）                    |
| ease-in-out                   | 先变快再到慢（等于 cubic-bezier(0.42,0,0.58,1)），渐显渐隐效果 |
| cubic-bezier(*n*,*n*,*n*,*n*) | 在 cubic-bezier 函数中定义自己的值。可能的值是 0 至 1 之间的数值 |

注意：并不是所有的属性都能使用过渡的，如`display:none<->display:block`

举个例子，实现鼠标移动上去发生变化动画效果

```html
<style>
       .base {
            width: 100px;
            height: 100px;
            display: inline-block;
            background-color: #0EA9FF;
            border-width: 5px;
            border-style: solid;
            border-color: #5daf34;
            transition-property: width, height, background-color, border-width;
            transition-duration: 2s;
            transition-timing-function: ease-in;
            transition-delay: 500ms;
        }

        /*简写*/
        /*transition: all 2s ease-in 500ms;*/
        .base:hover {
            width: 200px;
            height: 200px;
            background-color: #5daf34;
            border-width: 10px;
            border-color: #3a8ee6;
        }
</style>
<div class="base"></div>
```

### transform 转变动画

包含四个常用的功能：

- translate：位移
- scale：缩放
- rotate：旋转
- skew：倾斜

一般配合`transition`过度使用

注意的是，`transform`不支持`inline`元素，使用前把它变成`block`

举个例子

```html
<style>
    .base {
        width: 100px;
        height: 100px;
        display: inline-block;
        background-color: #0EA9FF;
        border-width: 5px;
        border-style: solid;
        border-color: #5daf34;
        transition-property: width, height, background-color, border-width;
        transition-duration: 2s;
        transition-timing-function: ease-in;
        transition-delay: 500ms;
    }
    .base2 {
        transform: none;
        transition-property: transform;
        transition-delay: 5ms;
    }

    .base2:hover {
        transform: scale(0.8, 1.5) rotate(35deg) skew(5deg) translate(15px, 25px);
    }
</style>
 <div class="base base2"></div>
```

可以看到盒子发生了旋转，倾斜，平移，放大

### animation 实现自定义动画

`animation`是由 8 个属性的简写，分别如下：

| 属性                                   | 描述                                                         | 属性值                                        |
| -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| animation-duration                     | 指定动画完成一个周期所需要时间，单位秒（s）或毫秒（ms），默认是 0 |                                               |
| animation-timing-function              | 指定动画计时函数，即动画的速度曲线，默认是 "ease"            | linear、ease、ease-in、ease-out、ease-in-out  |
| animation-delay                        | 指定动画延迟时间，即动画何时开始，默认是 0                   |                                               |
| animation-iteration-count              | 指定动画播放的次数，默认是 1                                 |                                               |
| animation-direction 指定动画播放的方向 | 默认是 normal                                                | normal、reverse、alternate、alternate-reverse |
| animation-fill-mode                    | 指定动画填充模式。默认是 none                                | forwards、backwards、both                     |
| animation-play-state                   | 指定动画播放状态，正在运行或暂停。默认是 running             | running、pauser                               |
| animation-name                         | 指定 @keyframes 动画的名称                                   |                                               |

`CSS` 动画只需要定义一些关键的帧，而其余的帧，浏览器会根据计时函数插值计算出来，

通过 `@keyframes` 来定义关键帧

因此，如果我们想要让元素旋转一圈，只需要定义开始和结束两帧即可：

```css
@keyframes rotate{
    from{
        transform: rotate(0deg);
    }
    to{
        transform: rotate(360deg);
    }
}
```

`from` 表示最开始的那一帧，`to` 表示结束时的那一帧

也可以使用百分比刻画生命周期

```css
@keyframes rotate{
    0%{
        transform: rotate(0deg);
    }
    50%{
        transform: rotate(180deg);
    }
    100%{
        transform: rotate(360deg);
    }
}
```

定义好了关键帧后，下来就可以直接用它了：

```css
animation: rotate 2s;
```

## 三、总结

| 属性               | 含义                                                         |
| ------------------ | ------------------------------------------------------------ |
| transition（过度） | 用于设置元素的样式过度，和animation有着类似的效果，但细节上有很大的不同 |
| transform（变形）  | 用于元素进行旋转、缩放、移动或倾斜，和设置样式的动画并没有什么关系，就相当于color一样用来设置元素的“外表” |
| translate（移动）  | 只是transform的一个属性值，即移动                            |
| animation（动画）  | 用于设置动画属性，他是一个简写的属性，包含6个属性            |

</details>

## 100. 怎么理解回流跟重绘？什么场景下会触发？ {#question-417ebda0-3f2d-48d3-95ec-ae1838bf39cb}

> 难度：3 · 类型：QA

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

## 101. 什么是响应式设计？响应式设计的基本原理是什么？如何进行实现？ {#question-dc8c6233-f645-444c-8e31-f18bc3f5244f}

> 难度：3 · 类型：QA

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

## 102. 如果使用CSS提高页面性能？ {#question-6f841b28-be0d-413f-9b7a-70e740fa7621}

> 难度：2 · 类型：QA

### 题目要点

**答题思路**

1. **减少CSS文件大小**：
   - **压缩CSS**：使用工具（如CSSNano、Clean-CSS等）压缩CSS文件，移除不必要的空格、注释和缩短属性名等，减少文件体积。
   - **删除无用样式**：定期审查CSS文件，删除不再使用的样式规则，避免加载不必要的代码。

2. **利用缓存**：
   - 为CSS文件设置合理的缓存策略，通过HTTP头（如Cache-Control、Expires）控制浏览器缓存，减少重复加载。

3. **使用CDN**：
   - 将CSS文件部署到CDN上，利用CDN的分发网络提高文件加载速度，特别是对于跨地域的用户访问。

4. **减少HTTP请求**：
   - 合并多个CSS文件为一个，减少HTTP请求的次数，降低网络延迟。
   - 利用CSS Sprite技术合并多个小图标为一个大图，通过CSS背景定位来显示需要的图标，减少图片加载请求。

5. **优化选择器**：
   - 避免使用复杂的选择器，特别是深度嵌套的或包含大量类名/ID的选择器，这些选择器的查找成本较高。
   - 使用类选择器（class selectors）代替标签选择器（tag selectors）和ID选择器（ID selectors），因为类选择器的性能通常更优。

6. **媒体查询**：
   - 使用CSS媒体查询（Media Queries）来针对不同设备或屏幕宽度应用不同的样式规则，减少不必要的样式加载。

7. **利用CSS3硬件加速**：
   - 合理使用CSS3的transform和opacity属性，这些属性在大多数现代浏览器中都能触发GPU加速，提高渲染性能。

8. **异步加载非关键CSS**：
   - 对于非首屏或用户交互后才需要的CSS，可以使用JavaScript异步加载，避免阻塞首屏渲染。

**考察要点**

- **性能优化意识**：是否了解并关注页面性能优化的重要性。
- **CSS知识深度**：对CSS选择器性能、CSS压缩、CSS Sprite等技术的掌握程度。
- **HTTP和缓存知识**：是否了解HTTP请求优化和缓存策略。
- **现代前端技术掌握**：是否了解并能够应用CSS3新特性和现代前端框架/库中的性能优化技术。

<details>
<summary>参考答案</summary>

## 一、前言

每一个网页都离不开`css`，但是很多人又认为，`css`主要是用来完成页面布局的，像一些细节或者优化，就不需要怎么考虑，实际上这种想法是不正确的

作为页面渲染和内容展现的重要环节，`css`影响着用户对整个网站的第一体验

因此，在整个产品研发过程中，`css`性能优化同样需要贯穿全程

## 二、实现方式

实现方式有很多种，主要有如下：

- 内联首屏关键CSS
- 异步加载CSS
- 资源压缩
- 合理使用选择器
- 减少使用昂贵的属性
- 不要使用@import

### 内联首屏关键CSS

在打开一个页面，页面首要内容出现在屏幕的时间影响着用户的体验，而通过内联`css`关键代码能够使浏览器在下载完`html`后就能立刻渲染

而如果外部引用`css`代码，在解析`html`结构过程中遇到外部`css`文件，才会开始下载`css`代码，再渲染

所以，`CSS`内联使用使渲染时间提前

注意：但是较大的`css`代码并不合适内联（初始拥塞窗口、没有缓存），而其余代码则采取外部引用方式

### 异步加载CSS

在`CSS`文件请求、下载、解析完成之前，`CSS`会阻塞渲染，浏览器将不会渲染任何已处理的内容

前面加载内联代码后，后面的外部引用`css`则没必要阻塞浏览器渲染。这时候就可以采取异步加载的方案，主要有如下：

- 使用javascript将link标签插到head标签最后

```js
// 创建link标签
const myCSS = document.createElement( "link" );
myCSS.rel = "stylesheet";
myCSS.href = "mystyles.css";
// 插入到header的最后位置
document.head.insertBefore( myCSS, document.head.childNodes[ document.head.childNodes.length - 1 ].nextSibling );
```

- 设置link标签media属性为noexis，浏览器会认为当前样式表不适用当前类型，会在不阻塞页面渲染的情况下再进行下载。加载完成后，将`media`的值设为`screen`或`all`，从而让浏览器开始解析CSS

```html
<link rel="stylesheet" href="mystyles.css" media="noexist" onload="this.media='all'">
```

- 通过rel属性将link元素标记为alternate可选样式表，也能实现浏览器异步加载。同样别忘了加载完成之后，将rel设回stylesheet

```html
<link rel="alternate stylesheet" href="mystyles.css" onload="this.rel='stylesheet'">
```

### 资源压缩

利用`webpack`、`gulp/grunt`、`rollup`等模块化工具，将`css`代码进行压缩，使文件变小，大大降低了浏览器的加载时间

### 合理使用选择器

`css`匹配的规则是从右往左开始匹配，例如`#markdown .content h3`匹配规则如下：

- 先找到h3标签元素
- 然后去除祖先不是.content的元素
- 最后去除祖先不是#markdown的元素

如果嵌套的层级更多，页面中的元素更多，那么匹配所要花费的时间代价自然更高

所以我们在编写选择器的时候，可以遵循以下规则：

- 不要嵌套使用过多复杂选择器，最好不要三层以上
- 使用id选择器就没必要再进行嵌套
- 通配符和属性选择器效率最低，避免使用

### 减少使用昂贵的属性

在页面发生重绘的时候，昂贵属性如`box-shadow`/`border-radius`/`filter`/透明度/`:nth-child`等，会降低浏览器的渲染性能

### 不要使用@import

css样式文件有两种引入方式，一种是`link`元素，另一种是`@import`

`@import`会影响浏览器的并行下载，使得页面在加载时增加额外的延迟，增添了额外的往返耗时

而且多个`@import`可能会导致下载顺序紊乱

比如一个css文件`index.css`包含了以下内容：`@import url("reset.css")`

那么浏览器就必须先把`index.css`下载、解析和执行后，才下载、解析和执行第二个文件`reset.css`

### 其他

- 减少重排操作，以及减少不必要的重绘
- 了解哪些属性可以继承而来，避免对这些属性重复编写
- cssSprite，合成所有icon图片，用宽高加上backgroud-position的背景图方式显现出我们要的icon图，减少了http请求
- 把小的icon图片转成base64编码
- CSS3动画或者过渡尽量使用transform和opacity来实现动画，不要使用left和top属性

## 三、总结

`css`实现性能的方式可以从选择器嵌套、属性特性、减少`http`这三面考虑，同时还要注意`css`代码的加载顺序

</details>

## 103. 如何实现单行／多行文本溢出的省略样式？ {#question-cae03999-2c1e-4ecc-9c66-10c0714c61d6}

> 难度：2 · 类型：QA

### 题目要点

实现文本溢出的省略样式，可以使用CSS中的几种不同的属性和技巧。以下是一些常见的方法：

#### 单行文本溢出省略

对于单行文本，可以使用text-overflow属性与overflow属性结合使用

#### 多行文本溢出省略

对于多行文本，可以使用-webkit-line-clamp属性，这是一个非标准的CSS属性，主要用于Webkit内核浏览器（如Chrome、Safari）

注意，-webkit-line-clamp属性并不是所有浏览器都支持的标准CSS属性，因此可能需要额外的JavaScript解决方案或后退方案来兼容其他浏览器。

#### 其他方法

- 使用CSS遮罩：通过CSS的mask-image属性或clip属性来实现多行文本的省略效果。
- 使用JavaScript：通过JavaScript动态计算文本高度并添加省略效果，这种方法可以提供更多的灵活性和兼容性。

<details>
<summary>参考答案</summary>

## 一、前言

在日常开发展示页面，如果一段文本的数量过长，受制于元素宽度的因素，有可能不能完全显示，为了提高用户的使用体验，这个时候就需要我们把溢出的文本显示成省略号

对于文本的溢出，我们可以分成两种形式：

- 单行文本溢出
- 多行文本溢出

## 二、实现方式

### 单行文本溢出省略

理解也很简单，即文本在一行内显示，超出部分以省略号的形式展现

实现方式也很简单，涉及的`css`属性有：

- text-overflow：规定当文本溢出时，显示省略符号来代表被修剪的文本
- white-space：设置文字在一行显示，不能换行
- overflow：文字长度超出限定宽度，则隐藏超出的内容

`overflow`设为`hidden`，普通情况用在块级元素的外层隐藏内部溢出元素，或者配合下面两个属性实现文本溢出省略

`white-space:nowrap`，作用是设置文本不换行，是`overflow:hidden`和`text-overflow：ellipsis`生效的基础

`text-overflow`属性值有如下：

- clip：当对象内文本溢出部分裁切掉
- ellipsis：当对象内文本溢出时显示省略标记（...）

`text-overflow`只有在设置了`overflow:hidden`和`white-space:nowrap`才能够生效的

举个例子

```html
<style>
    p{
        overflow: hidden;
        line-height: 40px;
        width:400px;
        height:40px;
        border:1px solid red;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
<p 这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本</p >
```

效果如下：

 ![](https://static.ecool.fun//article/cd51e486-ac1d-40d9-aa97-0846d54b925c.png)

可以看到，设置单行文本溢出较为简单，并且省略号显示的位置较好

### 多行文本溢出省略

多行文本溢出的时候，我们可以分为两种情况：

- 基于高度截断
- 基于行数截断

#### 基于高度截断

#### 伪元素 + 定位

核心的`css`代码结构如下：

- position: relative：为伪元素绝对定位
- overflow: hidden：文本溢出限定的宽度就隐藏内容）
- position: absolute：给省略号绝对定位
- line-height: 20px：结合元素高度,高度固定的情况下,设定行高, 控制显示行数
- height: 40px：设定当前元素高度
- ::after {} ：设置省略号样式

代码如下所示：

```html
<style>
    .demo {
        position: relative;
        line-height: 20px;
        height: 40px;
        overflow: hidden;
    }
    .demo::after {
        content: "...";
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 0 20px 0 10px;
    }
</style>

<body>
    <div class='demo'>这是一段很长的文本</div>
</body>
```

实现原理很好理解，就是通过伪元素绝对定位到行尾并遮住文字，再通过 `overflow: hidden` 隐藏多余文字

这种实现具有以下优点：

- 兼容性好，对各大主流浏览器有好的支持
- 响应式截断，根据不同宽度做出调整

一般文本存在英文的时候，可以设置`word-break: break-all`使一个单词能够在换行时进行拆分

#### 基于行数截断

纯`css`实现也非常简单，核心的`css`代码如下：

- -webkit-line-clamp: 2：用来限制在一个块元素显示的文本的行数，为了实现该效果，它需要组合其他的WebKit属性）
- display: -webkit-box：和1结合使用，将对象作为弹性伸缩盒子模型显示
- -webkit-box-orient: vertical：和1结合使用 ，设置或检索伸缩盒对象的子元素的排列方式
- overflow: hidden：文本溢出限定的宽度就隐藏内容
- text-overflow: ellipsis：多行文本的情况下，用省略号“…”隐藏溢出范围的文本

```html
<style>
    p {
        width: 400px;
        border-radius: 1px solid red;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
<p>
    这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本
    这是一些文本这是一些文本这是一些文本这是一些文本这是一些文本
</p >
```

可以看到，上述使用了`webkit`的`CSS`属性扩展，所以兼容浏览器范围是`PC`端的`webkit`内核的浏览器，由于移动端大多数是使用`webkit`，所以移动端常用该形式

需要注意的是，如果文本为一段很长的英文或者数字，则需要添加`word-wrap: break-word`属性

还能通过使用`javascript`实现配合`css`，实现代码如下所示：

css结构如下：

```css
p {
    position: relative;
    width: 400px;
    line-height: 20px;
    overflow: hidden;

}
.p-after:after{
    content: "...";
    position: absolute;
    bottom: 0;
    right: 0;
    padding-left: 40px;
    background: -webkit-linear-gradient(left, transparent, #fff 55%);
    background: -moz-linear-gradient(left, transparent, #fff 55%);
    background: -o-linear-gradient(left, transparent, #fff 55%);
    background: linear-gradient(to right, transparent, #fff 55%);
}
```

javascript代码如下：

```js
$(function(){
 //获取文本的行高，并获取文本的高度，假设我们规定的行数是五行，那么对超过行数的部分进行限制高度，并加上省略号
   $('p').each(function(i, obj){
        var lineHeight = parseInt($(this).css("line-height"));
        var height = parseInt($(this).height());
        if((height / lineHeight) >3 ){
            $(this).addClass("p-after")
            $(this).css("height","60px");
        }else{
            $(this).removeClass("p-after");
        }
    });
})
```

</details>

## 104. 如何使用css完成视差滚动效果? {#question-fad85622-728a-4c93-bf22-d91f8902837d}

> 难度：2.5 · 类型：QA

### 题目要点

## 如何使用CSS完成视差滚动效果？

视差滚动效果是一种在网页设计中常用的技术，它通过让背景元素相对于前景内容以不同的速度滚动，来创建深度和动态效果。以下是实现视差滚动效果的基本步骤：

### 1. 准备HTML结构

首先，你需要一个多层次的布局结构，通常包括背景层和内容层。

```html
<div class="parallax-container">
  <div class="parallax-background"></div>
  <div class="content">
    <!-- 这里是主要内容 -->
  </div>
</div>
```

### 2. 设置CSS样式

使用CSS设置各个层的样式，特别是背景层的定位和大小。

```css
.parallax-container {
  position: relative;
  overflow: hidden;
  height: 500px; /* 根据需要设置高度 */
}

.parallax-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('background.jpg'); /* 背景图片 */
  background-attachment: fixed; /* 固定背景，不随滚动条滚动 */
  background-size: cover;
}

.content {
  position: relative;
  z-index: 10; /* 确保内容层在背景层之上 */
  color: #fff; /* 内容颜色 */
}
```

### 3. 使用JavaScript增强效果

虽然可以通过纯CSS实现简单的视差效果（如使用background-attachment: fixed;），但要创建更复杂的视差效果，可能需要JavaScript来动态调整背景层的位置。

```js
window.addEventListener('scroll', function() {
  var scrolledHeight = window.pageYOffset;
  document.querySelector('.parallax-background').style.transform = 'translateY(' + -scrolledHeight * 0.5 + 'px)';
});
```

### 4. 优化性能

视差滚动效果可能会影响页面性能，特别是在移动设备上。因此，考虑以下优化策略：

使用requestAnimationFrame代替setInterval或setTimeout来平滑滚动动画。
只在需要视差效果的区域使用视差滚动，避免过度使用。
考虑使用CSS的transform属性代替top或background-position，以利用GPU加速。

### 5. 兼容性和响应式设计

确保视差效果在不同设备和浏览器上都能正常工作，并且响应式地适应不同屏幕尺寸。

### 考察重点

- 对视差滚动效果的理解及其实现原理。
- 掌握CSS和JavaScript在视差滚动效果中的应用。
- 了解性能优化和兼容性问题的处理方法。

<details>
<summary>参考答案</summary>

## 一、是什么

视差滚动（Parallax Scrolling）是指多层背景以不同的速度移动，形成立体的运动效果，带来非常出色的视觉体验

我们可以把网页解刨成：背景层、内容层、悬浮层

 ![](https://static.ecool.fun//article/90b49aad-edf4-4c9a-80c0-d4108befbc9e.png)

当滚动鼠标滑轮的时候，各个图层以不同的速度移动，形成视觉差的效果

 ![image.png](https://static.ecool.fun//article/b559ab16-e004-4202-9216-ed4137ff23af.png)

## 二、实现方式

使用`css`形式实现视觉差滚动效果的方式有：

- background-attachment
- transform:translate3D

### background-attachment

作用是设置背景图像是否固定或者随着页面的其余部分滚动

值分别有如下：

- scroll：默认值，背景图像会随着页面其余部分的滚动而移动
- fixed：当页面的其余部分滚动时，背景图像不会移动
- inherit：继承父元素background-attachment属性的值

完成滚动视觉差就需要将`background-attachment`属性设置为`fixed`，让背景相对于视口固定。及时一个元素有滚动机制，背景也不会随着元素的内容而滚动

也就是说，背景一开始就已经被固定在初始的位置

核心的`css`代码如下：

```css
section {
    height: 100vh;
}

.g-img {
    background-image: url(...);
    background-attachment: fixed;
    background-size: cover;
    background-position: center center;
}
```

整体例子如下：

```html
<style>
div {
            height: 100vh;
            background: rgba(0, 0, 0, .7);
            color: #fff;
            line-height: 100vh;
            text-align: center;
            font-size: 20vh;
        }

        .a-img1 {
            background-image: url(https://images.pexels.com/photos/1097491/pexels-photo-1097491.jpeg);
            background-attachment: fixed;
            background-size: cover;
            background-position: center center;
        }

        .a-img2 {
            background-image: url(https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg);
            background-attachment: fixed;
            background-size: cover;
            background-position: center center;
        }

        .a-img3 {
            background-image: url(https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg);
            background-attachment: fixed;
            background-size: cover;
            background-position: center center;
        }
</style>
 <div class="a-text">1</div>
    <div class="a-img1">2</div>
    <div class="a-text">3</div>
    <div class="a-img2">4</div>
    <div class="a-text">5</div>
    <div class="a-img3">6</div>
    <div class="a-text">7</div>
```

### transform:translate3D

同样，让我们先来看一下两个概念`transform`和`perspective`：

- transform: css3 属性，可以对元素进行变换(2d/3d)，包括平移 translate,旋转 rotate,缩放 scale,等等
- perspective: css3 属性，当元素涉及 3d 变换时，perspective 可以定义我们眼睛看到的 3d 立体效果，即空间感

`3D`视角示意图如下所示：

 ![](https://static.ecool.fun//article/54934f1f-3ae6-4655-8b01-b345b0f88d2b.png)

举个例子：

```html
<style>
    html {
        overflow: hidden;
        height: 100%
    }

    body {
        /* 视差元素的父级需要3D视角 */
        perspective: 1px;
        transform-style: preserve-3d;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    #app{
        width: 100vw;
        height:200vh;
        background:skyblue;
        padding-top:100px;
    }
    .one{
        width:500px;
        height:200px;
        background:#409eff;
        transform: translateZ(0px);
        margin-bottom: 50px;
    }
    .two{
        width:500px;
        height:200px;
        background:#67c23a;
        transform: translateZ(-1px);
        margin-bottom: 150px;
    }
    .three{
        width:500px;
        height:200px;
        background:#e6a23c;
        transform: translateZ(-2px);
        margin-bottom: 150px;
    }
</style>
<div id="app">
    <div class="one">one</div>
    <div class="two">two</div>
    <div class="three">three</div>
</div>
```

而这种方式实现视觉差动的原理如下：

- 容器设置上 transform-style: preserve-3d 和 perspective: xpx，那么处于这个容器的子元素就将位于3D空间中，

- 子元素设置不同的 transform: translateZ()，这个时候，不同元素在 3D Z轴方向距离屏幕（我们的眼睛）的距离也就不一样

- 滚动滚动条，由于子元素设置了不同的 transform: translateZ()，那么他们滚动的上下距离 translateY 相对屏幕（我们的眼睛），也是不一样的，这就达到了滚动视差的效果

</details>

## 105. 怎么使用 CSS 如何画一个三角形 {#question-f2e90e32-83d2-4ba4-8a57-033160fac9c4}

> 难度：0.5 · 类型：QA

### 题目要点

在前端开发的时候，我们有时候会需要用到一个三角形的形状，比如地址选择或者播放器里面播放按钮

<details>
<summary>参考答案</summary>

## 一、前言

在前端开发的时候，我们有时候会需要用到一个三角形的形状，比如地址选择或者播放器里面播放按钮

 ![](https://static.ecool.fun//article/e03c3216-c02f-4db0-bab4-af2bf2fc06ad.png)

通常情况下，我们会使用图片或者`svg`去完成三角形效果图，但如果单纯使用`css`如何完成一个三角形呢？

实现过程似乎也并不困难，通过边框就可完成

## 二、实现过程

在以前也讲过盒子模型，默认情况下是一个矩形，实现也很简单

```html
<style>
    .border {
        width: 50px;
        height: 50px;
        border: 2px solid;
        border-color: #96ceb4 #ffeead #d9534f #ffad60;
    }
</style>
<div class="border"></div>
```

效果如下图所示：

 ![](https://static.ecool.fun//article/8faa7df8-ff57-4794-b4d3-c119d619e5ad.png)

将`border`设置`50px`，效果图如下所示：

 ![](https://static.ecool.fun//article/9c5c4e9d-702b-4f81-8c21-7e32ced1f576.png)

白色区域则为`width`、`height`，这时候只需要你将白色区域部分宽高逐渐变小，最终变为0，则变成如下图所示：

 ![](https://static.ecool.fun//article/5f9da9b5-c4de-42d0-8690-f0e74d76ea04.png)

这时候就已经能够看到4个不同颜色的三角形，如果需要下方三角形，只需要将上、左、右边框设置为0就可以得到下方的红色三角形

 ![](https://static.vue-js.com/2afaa030-a27a-11eb-85f6-6fac77c0c9b3.png)

但这种方式，虽然视觉上是实现了三角形，但实际上，隐藏的部分任然占据部分高度，需要将上方的宽度去掉

最终实现代码如下：

```css
.border {
    width: 0;
    height: 0;
    border-style:solid;
    border-width: 0 50px 50px;
    border-color: transparent transparent #d9534f;
}
```

如果想要实现一个只有边框是空心的三角形，由于这里不能再使用`border`属性，所以最直接的方法是利用伪类新建一个小一点的三角形定位上去

```css
.border {
    width: 0;
    height: 0;
    border-style:solid;
    border-width: 0 50px 50px;
    border-color: transparent transparent #d9534f;
    position: relative;
}
.border:after{
    content: '';
    border-style:solid;
    border-width: 0 40px 40px;
    border-color: transparent transparent #96ceb4;
    position: absolute;
    top: 0;
    left: 0;
}
```

效果图如下所示：

 ![i](https://static.ecool.fun//article/bd31c2c5-0104-4ef0-b054-519e3df72afc.png)

伪类元素定位参照对象的内容区域宽高都为0，则内容区域即可以理解成中心一点，所以伪元素相对中心这点定位

将元素定位进行微调以及改变颜色，就能够完成下方效果图：

 ![](https://static.ecool.fun//article/adbfd4c3-276a-4407-b08f-711bb65f809e.png)

最终代码如下：

```css
.border:after {
    content: '';
    border-style: solid;
    border-width: 0 40px 40px;
    border-color: transparent transparent #96ceb4;
    position: absolute;
    top: 6px;
    left: -40px;
}
```

## 三、原理分析

可以看到，边框是实现三角形的部分，边框实际上并不是一个直线，如果我们将四条边设置不同的颜色，将边框逐渐放大，可以得到每条边框都是一个梯形

 ![](https://static.ecool.fun//article/856cb9da-ec73-48cc-b457-9e0f994d48a4.png)

当分别取消边框的时候，发现下面几种情况：

- 取消一条边的时候，与这条边相邻的两条边的接触部分会变成直的
- 当仅有邻边时， 两个边会变成对分的三角
- 当保留边没有其他接触时，极限情况所有东西都会消失

 ![](https://static.ecool.fun//article/e5f027de-aea2-4db6-9e51-4a4e6b17070c.png)

通过上图的变化规则，利用旋转、隐藏，以及设置内容宽高等属性，就能够实现其他类型的三角形

如设置直角三角形，如上图倒数第三行实现过程，我们就能知道整个实现原理

实现代码如下：

```css
.box {
    /* 内部大小 */
    width: 0px;
    height: 0px;
    /* 边框大小 只设置两条边*/
    border-top: #4285f4 solid;
    border-right: transparent solid;
    border-width: 85px;
    /* 其他设置 */
    margin: 50px;
}
```

</details>

## 106. 怎么让Chrome支持小于12px 的文字？ {#question-b54f7b5e-bac2-47bc-bc6a-0ec521a55a7f}

> 难度：1.5 · 类型：QA

### 题目要点

在默认情况下，Chrome 浏览器的最小字体大小限制为 12px，因此无法直接设置小于 12px 的文字大小。然而，可以通过以下方法绕过这个限制：

<details>
<summary>参考答案</summary>

在默认情况下，Chrome 浏览器的最小字体大小限制为 12px，因此无法直接设置小于 12px 的文字大小。然而，可以通过以下方法绕过这个限制：

1. **使用缩放比例**：可以使用 CSS 的 `transform` 属性来缩放文本元素以达到小于 12px 的效果。例如，使用 `transform: scale(0.8)` 将文本缩放为 80% 的原始大小。请注意，这可能会导致文本外观变得模糊或失真。

   ```css
   .small-text {
     transform: scale(0.8);
   }
   ```
2. 使用 zoom：将容器或文本元素的 zoom 属性设置为小于 1 的值，例如 zoom: 0.8;。这会缩小文本元素及其容器，使得文本看起来更小。请注意，zoom 是非标准的 CSS 属性，不一定在所有浏览器中都有效。
    ```css
    .small-text {
      zoom: 0.8;
    }
    ```
3. 使用 -webkit-text-size-adjust：将容器或文本元素的 -webkit-text-size-adjust 属性设置为 "none" 或 "auto" 可以控制 Chrome 浏览器对文本大小的调整行为。通过将其设置为 "none"，可以禁用 Chrome 浏览器的最小字体大小限制。请注意，-webkit-text-size-adjust 是针对 WebKit 内核（包括 Chrome 和 Safari）的私有属性。
    ```css
    .small-text {
      -webkit-text-size-adjust: none;
    }
    ```

4. **使用图片替代**：如果需要应用较小的文字大小，并且无法使用缩放，可以将文本转换为图像，并将其作为背景图像或内联图像插入到元素中。这样可以绕过浏览器的最小字体大小限制。但要注意，这将增加页面加载时间并且不利于可访问性和响应式设计。

   ```html
   <div class="small-text">
     <img src="path/to/small_text_image.png" alt="Small Text">
   </div>
   ```

无论选择哪种方法，都应该评估是否真正需要使用小于 12px 的文字大小，并确保在可读性、用户体验和跨浏览器兼容性方面做好测试和优化工作。

</details>

## 107. 说说对 CSS 预编语言的理解，以及它们之间的区别 {#question-9764b6d2-511b-40e3-9430-34b62711396c}

> 难度：3 · 类型：QA

### 题目要点

CSS 预编语言是一种基于 CSS 的扩展语言，可以更加方便和高效地编写 CSS 代码。其主要作用是为 CSS 提供了变量、函数、嵌套、继承、混合等功能，以及更加易于维护和组织的代码结构。

<details>
<summary>参考答案</summary>

CSS 预编语言是一种基于 CSS 的扩展语言，可以更加方便和高效地编写 CSS 代码。其主要作用是为 CSS 提供了变量、函数、嵌套、继承、混合等功能，以及更加易于维护和组织的代码结构。

常见的 CSS 预编语言有 Sass、Less 和 Stylus 等，它们之间的区别如下：

1. 语法不同：Sass 和 Less 使用类似于 CSS 的语法规则，而 Stylus 则使用了更加简洁和灵活的缩进式语法。

2. 变量定义方式不同：Sass 使用 `$` 符号来定义变量，Less 使用 `@` 符号，Stylus 则直接使用变量名即可。

3. 操作符和函数库不同：Sass 和 Less 支持常见的操作符和函数库，例如运算符、颜色处理、字符串处理等，而 Stylus 的函数库更加强大，支持更多的特性和功能。

4. 编译方式不同：Sass 和 Less 都需要通过编译器进行编译，可以将预编译的代码转换成标准的 CSS 代码。而 Stylus 则可以直接在浏览器中解析和执行，可以动态调整样式和布局。

总之，CSS 预编语言是一种非常有用的工具，可以提高 CSS 开发的效率和可维护性。选择哪种预编语言取决于项目需求和个人喜好，需要根据具体情况来进行选择。

</details>

## 108. flexbox（弹性盒布局模型）是什么，适用什么场景？ {#question-dd65350c-9907-4d3a-a01c-baeebb3e963d}

> 难度：2 · 类型：QA

### 题目要点

Flexbox（弹性盒布局模型）是一种用于创建灵活且自适应的网页布局的 CSS 模块。它提供了一种在容器和其子元素之间建立灵活关系的方式，以实现多个元素的对齐、分布和调整大小。

## 适用场景

- 等高的多列布局：Flexbox 可以轻松创建等高的多列布局，使得每一列的高度相等，无论其内容的长度如何。
- 水平和垂直居中：Flexbox 提供了强大的对齐和居中功能，可以在容器中轻松实现水平和垂直居中元素。
- 自适应布局：Flexbox 具有弹性特性，可以根据可用空间自动调整项目的大小和位置，从而实现自适应的布局。
- 等间距的分布：通过使用 Flexbox 的 `justify-content` 和 `align-items` 属性，可以轻松地在容器中创建等间距的分布，使项目之间具有相等的间距。
- 响应式布局：Flexbox 是响应式设计的有力工具，可以通过简单的 CSS 更改来构建适应不同屏幕尺寸和设备类型的布局。

<details>
<summary>参考答案</summary>

Flexbox（弹性盒布局模型）是一种 CSS 布局模式，旨在简化和优化在容器内分配空间和对齐项目的过程。它使得在布局中处理复杂的对齐、空间分配和顺序问题变得更加简单和高效。

### Flexbox 主要概念

1. **容器和项目**：
   - **Flex 容器**：使用 `display: flex` 或 `display: inline-flex` 将一个元素指定为 flex 容器。
   - **Flex 项目**：容器内部的直接子元素，即 flex 容器的项目。

2. **主轴和交叉轴**：
   - **主轴**：定义了 flex 项目排列的方向（默认为水平轴）。可以通过 `flex-direction` 属性设置。
   - **交叉轴**：与主轴垂直的轴，控制项目的对齐方式。可以通过 `align-items` 和 `align-self` 属性设置。

3. **主要属性**：
   - **`display: flex`**：将元素设为 flex 容器。
   - **`flex-direction`**：定义主轴方向（`row`、`column`、`row-reverse`、`column-reverse`）。
   - **`flex-wrap`**：定义项目是否换行（`nowrap`、`wrap`、`wrap-reverse`）。
   - **`flex-flow`**：是 `flex-direction` 和 `flex-wrap` 的缩写形式。
   - **`justify-content`**：在主轴上对齐项目（`flex-start`、`flex-end`、`center`、`space-between`、`space-around`）。
   - **`align-items`**：在交叉轴上对齐项目（`flex-start`、`flex-end`、`center`、`baseline`、`stretch`）。
   - **`align-self`**：控制单个项目在交叉轴上的对齐方式，覆盖 `align-items` 设置。
   - **`align-content`**：在多行的交叉轴上对齐所有行（`flex-start`、`flex-end`、`center`、`space-between`、`space-around`、`stretch`）。

4. **项目属性**：
   - **`flex-grow`**：定义项目的放大比例。
   - **`flex-shrink`**：定义项目的缩小比例。
   - **`flex-basis`**：定义项目在主轴上的初始大小。
   - **`flex`**：`flex-grow`、`flex-shrink` 和 `flex-basis` 的简写属性。
   - **`align-self`**：覆盖 `align-items` 对单个项目的对齐方式。

### 适用场景

1. **水平或垂直对齐**：
   - Flexbox 使得水平和垂直对齐项目变得简单，无论是单行还是多行布局，都能很方便地进行对齐和分布。

2. **响应式布局**：
   - 通过使用 `flex-wrap` 和 `flex-grow` 等属性，能够实现响应式布局，让项目在容器大小变化时自动调整。

3. **动态空间分配**：
   - Flexbox 可以根据可用空间动态调整项目的大小和位置，适用于需要动态调整布局的场景。

4. **复杂的排列**：
   - 例如，创建多列布局、导航栏、卡片布局等，Flexbox 提供了强大的工具来处理这些复杂的排列问题。

### 示例

**水平居中对齐：**

```html
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center; /* 水平居中对齐 */
  }
  .item {
    margin: 10px;
  }
</style>
```

**垂直居中对齐：**

```html
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
</div>

<style>
  .container {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
    height: 100vh; /* 高度设置为视口高度 */
  }
  .item {
    margin: 10px;
  }
</style>
```

Flexbox 是一种非常强大且灵活的布局工具，能够解决许多传统布局模型无法轻松处理的问题。它在现代 Web 开发中被广泛应用。

</details>

## 109. 如何实现两栏布局，右侧自适应？三栏布局中间自适应呢？ {#question-9cc69b35-a6f3-466a-8724-7b855b38a1a9}

> 难度：0.5 · 类型：QA

### 题目要点

flex 和 grid 都比较好实现

<details>
<summary>参考答案</summary>

## 一、背景

在日常布局中，无论是两栏布局还是三栏布局，使用的频率都非常高

### 两栏布局

两栏布局实现效果就是将页面分割成左右宽度不等的两列，宽度较小的列设置为固定宽度，剩余宽度由另一列撑满，

比如 `Ant Design` 文档，蓝色区域为主要内容布局容器，侧边栏为次要内容布局容器

> 这里称宽度较小的列父元素为次要布局容器，宽度较大的列父元素为主要布局容器

 ![](https://static.ecool.fun//article/f69a3d2e-7f0f-4340-98a6-70d691b6ded4.png)

这种布局适用于内容上具有明显主次关系的网页

### 三栏布局

三栏布局按照左中右的顺序进行排列，通常中间列最宽，左右两列次之

大家最常见的就是`github`：

 ![](https://static.ecool.fun//article/60777033-39d9-411a-a3cd-8aa40fd8006b.png)

## 二、双栏布局

双栏布局非常常见，往往是以一个定宽栏和一个自适应的栏并排展示存在

实现思路也非常的简单：

- 使用 float 左浮左边栏
- 右边模块使用 margin-left 撑出内容块做内容展示
- 为父级元素添加BFC，防止下方元素飞到上方内容

代码如下：

```html
<style>
    .box{
        overflow: hidden; 添加BFC
    }
    .left {
        float: left;
        width: 200px;
        background-color: gray;
        height: 400px;
    }
    .right {
        margin-left: 210px;
        background-color: lightgray;
        height: 200px;
    }
</style>
<div class="box">
    <div class="left">左边</div>
    <div class="right">右边</div>
</div>
```

还有一种更为简单的使用则是采取：flex弹性布局

### flex弹性布局

```html
<style>
    .box{
        display: flex;
    }
    .left {
        width: 100px;
    }
    .right {
        flex: 1;
    }
</style>
<div class="box">
    <div class="left">左边</div>
    <div class="right">右边</div>
</div>
```

`flex`可以说是最好的方案了，代码少，使用简单

注意的是，`flex`容器的一个默认属性值:`align-items: stretch;`

这个属性导致了列等高的效果。 为了让两个盒子高度自动，需要设置: `align-items: flex-start`

## 三、三栏布局

实现三栏布局中间自适应的布局方式有：

- 两边使用 float，中间使用 margin
- 两边使用 absolute，中间使用 margin
- 两边使用 float 和负 margin
- display: table 实现
- flex实现
- grid网格布局

### 两边使用 float，中间使用 margin

需要将中间的内容放在`html`结构最后，否则右侧会臣在中间内容的下方

实现代码如下：

```html
<style>
    .wrap {
        background: #eee;
        overflow: hidden; <!-- 生成BFC，计算高度时考虑浮动的元素 -->
        padding: 20px;
        height: 200px;
    }
    .left {
        width: 200px;
        height: 200px;
        float: left;
        background: coral;
    }
    .right {
        width: 120px;
        height: 200px;
        float: right;
        background: lightblue;
    }
    .middle {
        margin-left: 220px;
        height: 200px;
        background: lightpink;
        margin-right: 140px;
    }
</style>
<div class="wrap">
    <div class="left">左侧</div>
    <div class="right">右侧</div>
    <div class="middle">中间</div>
</div>
```

原理如下：

- 两边固定宽度，中间宽度自适应。
- 利用中间元素的margin值控制两边的间距
- 宽度小于左右部分宽度之和时，右侧部分会被挤下去

这种实现方式存在缺陷：

- 主体内容是最后加载的。

- 右边在主体内容之前，如果是响应式设计，不能简单的换行展示

### 两边使用 absolute，中间使用 margin

基于绝对定位的三栏布局：注意绝对定位的元素脱离文档流，相对于最近的已经定位的祖先元素进行定位。无需考虑HTML中结构的顺序

```html
<style>
  .container {
    position: relative;
  }

  .left,
  .right,
  .main {
    height: 200px;
    line-height: 200px;
    text-align: center;
  }

  .left {
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    background: green;
  }

  .right {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    background: green;
  }

  .main {
    margin: 0 110px;
    background: black;
    color: white;
  }
</style>

<div class="container">
  <div class="left">左边固定宽度</div>
  <div class="right">右边固定宽度</div>
  <div class="main">中间自适应</div>
</div>
```

实现流程：

- 左右两边使用绝对定位，固定在两侧。
- 中间占满一行，但通过 margin和左右两边留出10px的间隔

### 两边使用 float 和负 margin

```html
<style>
  .left,
  .right,
  .main {
    height: 200px;
    line-height: 200px;
    text-align: center;
  }

  .main-wrapper {
    float: left;
    width: 100%;
  }

  .main {
    margin: 0 110px;
    background: black;
    color: white;
  }

  .left,
  .right {
    float: left;
    width: 100px;
    margin-left: -100%;
    background: green;
  }

  .right {
    margin-left: -100px; /* 同自身宽度 */
  }
</style>

<div class="main-wrapper">
  <div class="main">中间自适应</div>
</div>
<div class="left">左边固定宽度</div>
<div class="right">右边固定宽度</div>
```

实现过程：

- 中间使用了双层标签，外层是浮动的，以便左中右能在同一行展示
- 左边通过使用负 margin-left:-100%，相当于中间的宽度，所以向上偏移到左侧
- 右边通过使用负 margin-left:-100px，相当于自身宽度，所以向上偏移到最右侧

缺点：

- 增加了 .main-wrapper 一层，结构变复杂
- 使用负 margin，调试也相对麻烦

### 使用 display: table 实现

`<table>` 标签用于展示行列数据，不适合用于布局。但是可以使用 `display: table` 来实现布局的效果

```html
<style>
  .container {
    height: 200px;
    line-height: 200px;
    text-align: center;
    display: table;
    table-layout: fixed;
    width: 100%;
  }

  .left,
  .right,
  .main {
    display: table-cell;
  }

  .left,
  .right {
    width: 100px;
    background: green;
  }

  .main {
    background: black;
    color: white;
    width: 100%;
  }
</style>

<div class="container">
  <div class="left">左边固定宽度</div>
  <div class="main">中间自适应</div>
  <div class="right">右边固定宽度</div>
</div>
```

实现原理：

- 层通过 display: table设置为表格，设置 table-layout: fixed`表示列宽自身宽度决定，而不是自动计算。
- 内层的左中右通过 display: table-cell设置为表格单元。
- 左右设置固定宽度，中间设置 width: 100% 填充剩下的宽度

### 使用flex实现

利用`flex`弹性布局，可以简单实现中间自适应

代码如下：

```html
<style type="text/css">
    .wrap {
        display: flex;
        justify-content: space-between;
    }

    .left,
    .right,
    .middle {
        height: 100px;
    }

    .left {
        width: 200px;
        background: coral;
    }

    .right {
        width: 120px;
        background: lightblue;
    }

    .middle {
        background: #555;
        width: 100%;
        margin: 0 20px;
    }
</style>
<div class="wrap">
    <div class="left">左侧</div>
    <div class="middle">中间</div>
    <div class="right">右侧</div>
</div>
```

实现过程：

- 仅需将容器设置为`display:flex;`，
- 盒内元素两端对其，将中间元素设置为`100%`宽度，或者设为`flex:1`，即可填充空白
- 盒内元素的高度撑开容器的高度

优点：

- 结构简单直观
- 可以结合 flex的其他功能实现更多效果，例如使用 order属性调整显示顺序，让主体内容优先加载，但展示在中间

### grid网格布局

代码如下：

```html
<style>
    .wrap {
        display: grid;
        width: 100%;
        grid-template-columns: 300px auto 300px;
    }

    .left,
    .right,
    .middle {
        height: 100px;
    }

    .left {
        background: coral;
    }

    .right {
        width: 300px;
        background: lightblue;
    }

    .middle {
        background: #555;
    }
</style>
<div class="wrap">
    <div class="left">左侧</div>
    <div class="middle">中间</div>
    <div class="right">右侧</div>
</div>
```

跟`flex`弹性布局一样的简单

</details>

## 110. CSS中，有哪些方式可以隐藏页面元素？有什么区别? {#question-3a6b4cce-0829-42dc-9629-c97fa85312f0}

> 难度：0.5 · 类型：QA

### 题目要点

在平常的样式排版中，我们经常遇到将某个模块隐藏的场景

<details>
<summary>参考答案</summary>

## 一、前言

在平常的样式排版中，我们经常遇到将某个模块隐藏的场景

通过`css`隐藏元素的方法有很多种，它们看起来实现的效果是一致的

但实际上每一种方法都有一丝轻微的不同，这些不同决定了在一些特定场合下使用哪一种方法

## 二、实现方式

通过`css`实现隐藏元素方法有如下：

- display:none
- visibility:hidden
- opacity:0
- 设置height、width模型属性为0
- position:absolute
- clip-path

### display:none

设置元素的`display`为`none`是最常用的隐藏元素的方法

```css
.hide {
    display:none;
}
```

将元素设置为`display:none`后，元素在页面上将彻底消失

元素本身占有的空间就会被其他元素占有，也就是说它会导致浏览器的重排和重绘

消失后，自身绑定的事件不会触发，也不会有过渡效果

特点：元素不可见，不占据空间，无法响应点击事件

### visibility:hidden

设置元素的`visibility`为`hidden`也是一种常用的隐藏元素的方法

从页面上仅仅是隐藏该元素，DOM结果均会存在，只是当时在一个不可见的状态，不会触发重排，但是会触发重绘

```css
.hidden{
    visibility:hidden
}
```

给人的效果是隐藏了，所以他自身的事件不会触发

特点：元素不可见，占据页面空间，无法响应点击事件

### opacity:0

`opacity`属性表示元素的透明度，将元素的透明度设置为0后，在我们用户眼中，元素也是隐藏的

不会引发重排，一般情况下也会引发重绘

> 如果利用 animation 动画，对 opacity 做变化（animation会默认触发GPU加速），则只会触发 GPU 层面的 composite，不会触发重绘

```css
.transparent {
    opacity:0;
}
```

由于其仍然是存在于页面上的，所以他自身的的事件仍然是可以触发的，但被他遮挡的元素是不能触发其事件的

需要注意的是：其子元素不能设置opacity来达到显示的效果

特点：改变元素透明度，元素不可见，占据页面空间，可以响应点击事件

### 设置height、width属性为0

将元素的`margin`，`border`，`padding`，`height`和`width`等影响元素盒模型的属性设置成0，如果元素内有子元素或内容，还应该设置其`overflow:hidden`来隐藏其子元素

```css
.hiddenBox {
    margin:0;
    border:0;
    padding:0;
    height:0;
    width:0;
    overflow:hidden;
}
```

特点：元素不可见，不占据页面空间，无法响应点击事件

### position:absolute

将元素移出可视区域

```css
.hide {
   position: absolute;
   top: -9999px;
   left: -9999px;
}
```

特点：元素不可见，不影响页面布局

### clip-path

通过裁剪的形式

```css
.hide {
  clip-path: polygon(0px 0px,0px 0px,0px 0px,0px 0px);
}
```

特点：元素不可见，占据页面空间，无法响应点击事件

### 小结

最常用的还是`display:none`和`visibility:hidden`，其他的方式只能认为是奇招，它们的真正用途并不是用于隐藏元素，所以并不推荐使用它们

## 三、区别

关于`display: none`、`  visibility: hidden`、`opacity: 0`的区别，如下表所示：

|                        | display: none | visibility: hidden | opacity: 0 |
| :--------------------- | :------------ | :----------------- | ---------- |
| 页面中                 | 不存在        | 存在               | 存在       |
| 重排                   | 会            | 不会               | 不会       |
| 重绘                   | 会            | 会                 | 不一定     |
| 自身绑定事件           | 不触发        | 不触发             | 可触发     |
| transition             | 不支持        | 支持               | 支持       |
| 子元素可复原           | 不能          | 能                 | 不能       |
| 被遮挡的元素可触发事件 | 能            | 能                 | 不能       |

</details>

## 111. 设备像素、css像素、设备独立像素、dpr、ppi 之间有什么区别？ {#question-9d9b80c8-3768-4bf3-96a6-b6c6bf7cb8c3}

> 难度：2 · 类型：QA

### 题目要点

- **设备像素**：物理像素，屏幕的实际显示单位。
- **CSS 像素**：逻辑像素，用于网页设计和渲染，是与设备像素无关的单位。
- **设备独立像素**：逻辑像素单位，帮助实现跨设备一致的界面体验。
- **DPR**：设备像素比，表示设备像素与 CSS 像素的比例。
- **PPI**：每英寸像素数，衡量屏幕的像素密度和清晰度。

<details>
<summary>参考答案</summary>

设备像素、CSS 像素、设备独立像素 (DIP)、设备像素比 (DPR) 和每英寸像素密度 (PPI) 是与屏幕分辨率和显示质量相关的概念。它们之间的区别如下：

- **设备像素**：设备像素是物理屏幕上的最小可见单元，用于实际渲染图像或文本。它表示硬件像素点的数量，通常用于描述屏幕的分辨率。设备像素的数量确定了屏幕的细节和清晰度。

- **CSS 像素**：CSS 像素是在 Web 开发中使用的抽象单位，用于定义网页上的布局和样式。它是一个相对单位，不直接对应物理屏幕上的像素。CSS 像素可以通过缩放和变换来适应不同的设备和分辨率。

- **设备独立像素 (DIP)**：设备独立像素是一种逻辑像素单位，用于将 CSS 像素与实际渲染的设备像素进行关联。DIP 可以看作是在 CSS 像素与设备像素之间建立了一个转换层。在标准的 96 DPI（dots per inch）的情况下，1 DIP 等于 1 CSS 像素。

- **设备像素比 (DPR)**：设备像素比是设备的物理像素与 CSS 像素之间的比例关系。它表示在一个 CSS 像素中有多少个设备像素。例如，如果设备像素比为 2，那么 1 CSS 像素将对应 2 个设备像素。DPR 可以用来判断屏幕的高清程度，即 Retina 屏幕。

- **每英寸像素密度 (PPI)**：每英寸像素密度表示屏幕上每英寸区域内的像素数量。它是一个描述屏幕分辨率的物理指标。更高的 PPI 值通常意味着更高的像素密度和更细腻的图像显示。

总结：

- 设备像素是物理屏幕上的最小可见单元。
- CSS 像素是 Web 开发中使用的抽象单位，用于布局和样式。
- 设备独立像素是逻辑像素单位，建立了 CSS 像素与设备像素之间的转换关系。
- 设备像素比是设备的物理像素与 CSS 像素之间的比例关系。
- 每英寸像素密度表示屏幕上每英寸区域内的像素数量，反映了屏幕的分辨率和显示质量。

</details>

## 112. em/px/rem/vh/vw 这些单位有什么区别？ {#question-394b6918-4c26-4e70-89b8-6bf1751f33ca}

> 难度：2 · 类型：QA

### 题目要点

传统的项目开发中，我们只会用到`px`、`%`、`em`这几个单位，它可以适用于大部分的项目开发，且拥有比较良好的兼容性

<details>
<summary>参考答案</summary>

## 一、介绍

传统的项目开发中，我们只会用到`px`、`%`、`em`这几个单位，它可以适用于大部分的项目开发，且拥有比较良好的兼容性

从`CSS3`开始，浏览器对计量单位的支持又提升到了另外一个境界，新增了`rem`、`vh`、`vw`、`vm`等一些新的计量单位

利用这些新的单位开发出比较良好的响应式页面，适应多种不同分辨率的终端，包括移动设备等

## 二、单位

在`css`单位中，可以分为长度单位、绝对单位，如下表所指示

| CSS单位      |                                        |
| ------------ | -------------------------------------- |
| 相对长度单位 | em、ex、ch、rem、vw、vh、vmin、vmax、% |
| 绝对长度单位 | cm、mm、in、px、pt、pc                 |

这里我们主要讲述px、em、rem、vh、vw

### px

px，表示像素，所谓像素就是呈现在我们显示器上的一个个小点，每个像素点都是大小等同的，所以像素为计量单位被分在了绝对长度单位中

有些人会把`px`认为是相对长度，原因在于在移动端中存在设备像素比，`px`实际显示的大小是不确定

这里之所以认为`px`为绝对单位，在于`px`的大小和元素的其他属性无关

### em

em是相对长度单位。相对于当前对象内文本的字体尺寸。如当前对行内文本的字体尺寸未被人为设置，则相对于浏览器的默认字体尺寸（`1em = 16px`）

为了简化 `font-size` 的换算，我们需要在` css `中的 `body` 选择器中声明` font-size `= `62.5%`，这就使 em 值变为 `16px*62.5% = 10px`

这样 `12px = 1.2em`, `10px = 1em`, 也就是说只需要将你的原来的` px` 数值除以 10，然后换上 `em `作为单位就行了

特点：

- em 的值并不是固定的
- em 会继承父级元素的字体大小
- em 是相对长度单位。相对于当前对象内文本的字体尺寸。如当前对行内文本的字体尺寸未被人为设置，则相对于浏览器的默认字体尺寸
- 任意浏览器的默认字体高都是 16px

举个例子

```html
<div class="big">
    我是14px=1.4em
    <div class="small">我是12px=1.2em</div>
</div>
```

样式为

```css
<style>
html {font-size: 10px;  } /*  公式16px*62.5%=10px  */
.big{font-size: 1.4em}
.small{font-size: 1.2em}
</style>
```

这时候`.big`元素的`font-size`为14px，而`.small`元素的`font-size`为12px

### rem

rem，相对单位，相对的只是HTML根元素`font-size`的值

同理，如果想要简化`font-size`的转化，我们可以在根元素`html`中加入`font-size: 62.5%`

```css
html {font-size: 62.5%;  } /*  公式16px*62.5%=10px  */
```

这样页面中1rem=10px、1.2rem=12px、1.4rem=14px、1.6rem=16px;使得视觉、使用、书写都得到了极大的帮助

特点：

- rem单位可谓集相对大小和绝对大小的优点于一身
- 和em不同的是rem总是相对于根元素，而不像em一样使用级联的方式来计算尺寸

### vh、vw

vw ，就是根据窗口的宽度，分成100等份，100vw就表示满宽，50vw就表示一半宽。（vw 始终是针对窗口的宽），同理，`vh`则为窗口的高度

这里的窗口分成几种情况：

- 在桌面端，指的是浏览器的可视区域
- 移动端指的就是布局视口

像`vw`、`vh`，比较容易混淆的一个单位是`%`，不过百分比宽泛的讲是相对于父元素：

对于普通定位元素就是我们理解的父元素
- 对于position: absolute;的元素是相对于已定位的父元素
- 对于position: fixed;的元素是相对于 ViewPort（可视窗口）

## 三、总结

**px**：绝对单位，页面按精确像素展示

**em**：相对单位，基准点为父节点字体的大小，如果自身定义了`font-size`按自身来计算，整个页面内`1em`不是一个固定的值

**rem**：相对单位，可理解为`root em`, 相对根节点`html`的字体大小来计算

**vh、vw**：主要用于页面视口大小布局，在页面布局上更加方便简单

</details>

## 113. css选择器有哪些？优先级分别是什么？哪些属性可以继承？ {#question-376fe4ce-b43c-45b3-834b-28da33c56920}

> 难度：1.5 · 类型：QA

### 题目要点

CSS选择器是CSS规则的第一部分

<details>
<summary>参考答案</summary>

## 一、选择器

CSS选择器是CSS规则的第一部分

它是元素和其他部分组合起来告诉浏览器哪个HTML元素应当是被选为应用规则中的CSS属性值的方式

选择器所选择的元素，叫做“选择器的对象”

我们从一个`Html`结构开始

```html
<div id="box">
    <div class="one">
        <p class="one_1"></p>
        <p class="one_1"></p>
    </div>
    <div class="two"></div>
    <div class="two"></div>
    <div class="two"></div>
</div>
```

关于`css`属性选择器常用的有：

```css
- id选择器（#box），选择id为box的元素
- 类选择器（.one），选择类名为one的所有元素
- 标签选择器（div），选择标签为div的所有元素
- 后代选择器（#box div），选择id为box元素内部所有的div元素
- 子选择器（.one>one_1），选择父元素为.one的所有.one_1的元素
- 相邻同胞选择器（.one+.two），选择紧接在.one之后的所有.two元素
- 群组选择器（div,p），选择div、p的所有元素
```

还有一些使用频率相对没那么多的选择器：

- 伪类选择器

```css
:link ：选择未被访问的链接
:visited：选取已被访问的链接
:active：选择活动链接
:hover ：鼠标指针浮动在上面的元素
:focus ：选择具有焦点的
:first-child：父元素的首个子元素
```
- 伪元素选择器

```css
:first-letter ：用于选取指定选择器的首字母
:first-line ：选取指定选择器的首行
:before : 选择器在被选元素的内容前面插入内容
:after : 选择器在被选元素的内容后面插入内容
```

- 属性选择器

```css
[attribute] 选择带有attribute属性的元素
[attribute=value] 选择所有使用attribute=value的元素
[attribute~=value] 选择attribute属性包含value的元素
[attribute|=value]：选择attribute属性以value开头的元素
```
在`CSS3`中新增的选择器有如下：

- 层次选择器（p~ul），选择前面有p元素的每个ul元素
- 伪类选择器

```css
:first-of-type 父元素的首个元素
:last-of-type 父元素的最后一个元素
:only-of-type 父元素的特定类型的唯一子元素
:only-child 父元素中唯一子元素
:nth-child(n) 选择父元素中第N个子元素
:nth-last-of-type(n) 选择父元素中第N个子元素，从后往前
:last-child 父元素的最后一个元素
:root 设置HTML文档
:empty 指定空的元素
:enabled 选择被禁用元素
:disabled 选择被禁用元素
:checked 选择选中的元素
:not(selector) 选择非 <selector> 元素的所有元素
```

- 属性选择器

```css
[attribute*=value]：选择attribute属性值包含value的所有元素
[attribute^=value]：选择attribute属性开头为value的所有元素
[attribute$=value]：选择attribute属性结尾为value的所有元素
```

## 二、优先级

相信大家对`CSS`选择器的优先级都不陌生：

> 内联 > ID选择器 > 类选择器 > 标签选择器

到具体的计算层⾯，优先级是由 A 、B、C、D 的值来决定的，其中它们的值计算规则如下：

- 如果存在内联样式，那么 A = 1, 否则 A = 0
- B的值等于 ID选择器出现的次数
- C的值等于 类选择器 和 属性选择器 和 伪类 出现的总次数
- D 的值等于 标签选择器 和 伪元素 出现的总次数

这里举个例子：

```css
#nav-global > ul > li > a.nav-link
```

套用上面的算法，依次求出 `A` `B` `C` `D` 的值：

- 因为没有内联样式 ，所以 A = 0
- ID选择器总共出现了1次， B = 1
- 类选择器出现了1次， 属性选择器出现了0次，伪类选择器出现0次，所以 C = (1 + 0 + 0) = 1
- 标签选择器出现了3次， 伪元素出现了0次，所以 D = (3 + 0) = 3

上面算出的`A` 、 `B`、`C`、`D` 可以简记作：`(0, 1, 1, 3)`

知道了优先级是如何计算之后，就来看看比较规则：

- 从左往右依次进行比较 ，较大者优先级更高
- 如果相等，则继续往右移动一位进行比较
- 如果4位全部相等，则后面的会覆盖前面的

经过上面的优先级计算规则，我们知道内联样式的优先级最高，如果外部样式需要覆盖内联样式，就需要使用`!important`

## 三、继承属性

在`css`中，继承是指的是给父元素设置一些属性，后代元素会自动拥有这些属性
关于继承属性，可以分成：

- 字体系列属性

```css
font:组合字体
font-family:规定元素的字体系列
font-weight:设置字体的粗细
font-size:设置字体的尺寸
font-style:定义字体的风格
font-variant:偏大或偏小的字体
```

- 文本系列属性

```css
text-indent：文本缩进
text-align：文本水平对齐
line-height：行高
word-spacing：增加或减少单词间的空白
letter-spacing：增加或减少字符间的空白
text-transform：控制文本大小写
direction：规定文本的书写方向
color：文本颜色
```

- 元素可见性

```css
visibility
```

- 表格布局属性

```css
caption-side：定位表格标题位置
border-collapse：合并表格边框
border-spacing：设置相邻单元格的边框间的距离
empty-cells：单元格的边框的出现与消失
table-layout：表格的宽度由什么决定
```

- 列表属性

```css
list-style-type：文字前面的小点点样式
list-style-position：小点点位置
list-style：以上的属性可通过这属性集合
```

- 引用

```css
quotes：设置嵌套引用的引号类型
```

- 光标属性

```css
cursor：箭头可以变成需要的形状
```

继承中比较特殊的几点：

- a 标签的字体颜色不能被继承
- h1-h6标签字体的大下也是不能被继承的

## 无继承的属性

- display
- 文本属性：vertical-align、text-decoration
- 盒子模型的属性：宽度、高度、内外边距、边框等
- 背景属性：背景图片、颜色、位置等
- 定位属性：浮动、清除浮动、定位position等
- 生成内容属性：content、counter-reset、counter-increment
- 轮廓样式属性：outline-style、outline-width、outline-color、outline
- 页面样式属性：size、page-break-before、page-break-after

</details>

## 114. 说说你对盒子模型的理解 {#question-dc607f56-c467-4cc2-8a0a-c79d498bee49}

> 难度：1 · 类型：QA

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
