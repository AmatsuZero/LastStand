+++
title = "HTML 元素分类"
date = '2024-10-15T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = false
weight = 4
tags = ["面试", "前端", "HTML", "HTML 元素分类", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
根据标签的功能和表现，HTML 标签主要分为以下几类：

### 1. **块级元素（Block-level Elements）**

块级元素通常独占一行，并且可以包含其他块级元素或内联元素，能够扩展至父容器的全部宽度。

-  **特点**：<br>
  - 独占一行，默认情况下会在前后产生换行。
  - 宽度默认是父元素的 100%。
  - 可以设置 `width`、`height`、`margin`、`padding` 等布局属性。
-  **常见的块级元素**：<br>
  - `<div>`：无特定语义的容器，常用于布局。
  - `<p>`：段落标签。
  - `<h1>` 到 `<h6>`：标题标签，按重要性递减。
  - `<ul>`、`<ol>`、`<li>`：无序、有序列表及其项。
  - `<header>`、`<footer>`、`<section>`、`<article>`：HTML5 语义化标签，分别表示页头、页尾、内容区块等。
-  **示例**：<br>
```html
<div>
  <h1>标题</h1>
  <p>这是一个段落。</p>
</div>
```

### 2. **内联元素（Inline Elements）**

内联元素与其他元素排列在同一行，且只占用其内容所需的宽度。它们不会独占一行，不能包含块级元素。

-  **特点**：<br>
  - 与相邻的内联元素排列在同一行。
  - 仅占据自身内容的宽度，不会在前后产生换行。
  - 不能设置 `width`、`height`（无效），但可以设置 `padding` 和 `margin`，只影响水平方向。
-  **常见的内联元素**：<br>
  - `<span>`：无特定语义的容器，常用于局部样式。
  - `<a>`：超链接。
  - `<strong>`：表示强调的文本，通常加粗显示。
  - `<em>`：表示强调的文本，通常斜体显示。
  - `<img>`：图像标签。
  - `<input>`：表单输入元素。
-  **示例**：<br>
```html
<p>这是一个段落，<a href="#">点击这里</a> 了解更多。</p>
```

### 3. **内联块元素（Inline-block Elements）**

内联块元素是同时具备内联元素和块级元素特性的元素。它们在布局上是内联的，但表现为块状元素，因此可以设置宽高。

-  **特点**：<br>
  - 与其他元素排列在同一行，但可设置宽度和高度。
  - 不会自动换行。
-  **常见的内联块元素**：<br>
  - `<img>`：虽然图像显示在行内，但可以设置 `width` 和 `height`。
  - `<button>`：按钮。
  - `<input type="text">`：文本输入框。
  - **CSS 设置为 `display: inline-block` 的元素**。
-  **示例**：<br>
```html
<span style="display: inline-block; width: 100px; height: 100px; background: red;"></span>
```

### 4. **自闭合元素（Self-closing Elements）**

自闭合元素是没有闭合标签的元素，因为它们没有任何内容。这类标签通常用于插入内容或进行控制，而不包含其他内容。

-  **特点**：<br>
  - 不需要关闭标签。
  - 直接在标签内结束。
-  **常见的自闭合元素**：<br>
  - `<img>`：图像。
  - `<input>`：表单输入。
  - `<br>`：换行。
  - `<hr>`：水平线。
-  **示例**：<br>
```html
<img src="image.jpg" alt="图片描述">
<br />
```

### 5. **语义化标签（Semantic Elements）**

HTML5 提供了一些语义化标签，它们描述了页面不同部分的语义，使文档结构更加清晰，同时对 SEO 和无障碍访问更友好。

-  **常见的语义化标签**：<br>
  - `<header>`：定义页面或章节的头部。
  - `<footer>`：定义页面或章节的底部。
  - `<nav>`：定义导航链接的区域。
  - `<article>`：表示独立的内容块。
  - `<section>`：表示文档的某个部分。
  - `<aside>`：定义侧边栏或附属内容。
  - `<main>`：定义页面的主要内容。
-  **示例**：<br>
```html
<header>
  <h1>页面标题</h1>
</header>
<main>
  <article>
    <h2>文章标题</h2>
    <p>文章内容</p>
  </article>
</main>
<footer>
  <p>版权信息</p>
</footer>
```

### 6. **表单元素（Form Elements）**

表单元素用于收集用户输入的数据，通常与服务器交互。

- **常见的表单元素**：<br>
  - `<form>`：定义表单容器。
  - `<input>`：各种类型的输入框（如文本、密码、单选按钮等）。
  - `<textarea>`：多行文本输入框。
  - `<select>` 和 `<option>`：下拉选择框。
  - `<button>`：按钮。
  - `<label>`：用于表单项的文本标签。
  - `<fieldset>` 和 `<legend>`：用于对表单区域进行分组。
- **示例**：<br>
```html
<form action="/submit" method="POST">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name">
  <button type="submit">Submit</button>
</form>
```

### 7. **媒体元素（Media Elements）**

媒体元素用于嵌入多媒体，如音频、视频等。

- **常见的媒体元素**：<br>
  - `<img>`：嵌入图像。
  - `<audio>`：嵌入音频。
  - `<video>`：嵌入视频。
  - `<source>`：为音频和视频提供多个资源。
- **示例**：<br>
```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

### 8. **元数据元素（Metadata Elements）**

元数据元素不会直接显示在页面上，而是用于提供页面的额外信息，例如页面标题、描述、字符集等。

- **常见的元数据元素**：<br>
  - `<title>`：定义页面的标题。
  - `<meta>`：提供页面的元数据，如描述、关键词等。
  - `<link>`：定义与外部资源的关系，如 CSS 文件。
  - `<style>`：定义页面的内联样式。
  - `<script>`：嵌入或引用 JavaScript 代码。
- **示例**：<br>
```html
<head>
  <meta charset="UTF-8">
  <meta name="description" content="网页描述">
  <title>网页标题</title>
  <link rel="stylesheet" href="styles.css">
</head>
```

## 常见考点

### 1. **块级元素（Block-level Elements）**

- 定义块级元素的特点
- 常见的块级元素有哪些？
- 块级元素与行级元素的主要区别是什么？

### 2. **行内元素（Inline Elements）**

- 定义行内元素的特点
- 常见的行内元素有哪些？
- 行内元素是否可以包含块级元素？

### 3. **行内块元素（Inline-block Elements）**

- 什么是行内块元素？
- 行内块元素的应用场景及特点。

### 4. **语义化元素**

- 什么是语义化元素？
- HTML5 引入的语义化元素有哪些（如 `<article>`、`<section>`、`<header>` 等）？
- 语义化标签的作用及其对 SEO 和无障碍设计的影响。

### 5. **HTML5 新增的结构性元素**

- HTML5 引入的结构性标签有哪些？它们的语义和应用场景（如 `<nav>`、`<footer>`、`<aside>` 等）？

### 6. **自闭合元素**

- 什么是自闭合元素？
- 常见的自闭合元素有哪些？（如 `<img>`、`<br>`、`<input>` 等）
- 自闭合元素是否需要关闭标签？

### 7. **可替换元素**

- 什么是可替换元素？
- 常见的可替换元素有哪些？（如 `<img>`、`<input>`、`<iframe>`）
- 可替换元素的特性与布局影响。

### 8. **表单元素**

- 表单元素的分类及其应用场景（如 `<input>`、`<select>`、`<textarea>`）。
- 表单元素的语义化和无障碍设计考量。

### 9. **全局属性**

- 哪些是 HTML 元素的全局属性？
- 全局属性（如 `class`、`id`、`data-*`、`style`、`title`）如何应用到不同类型的元素上？

### 10. **隐式元素与显式元素**

- 什么是隐式元素？（如 `tbody`）
- 隐式元素的作用以及何时需要显式声明。

### 11. **HTML 内容模型**

- 元素内容模型的分类：流内容、元内容、嵌入内容、交互内容等。
- 不同类型的元素如何组合使用？

### 12. **嵌套规则**

- 块级元素与行内元素的嵌套规则。
- 哪些元素不能嵌套在一起？
