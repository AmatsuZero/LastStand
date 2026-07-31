+++
title = "DOCTYPE"
date = '2024-09-24T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = false
weight = 2
tags = ["面试", "前端", "HTML", "DOCTYPE", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
`DOCTYPE` 是一个声明，位于 HTML 文档的最顶部，指示浏览器使用哪种 HTML 或 XHTML 版本来渲染页面。它的主要作用是确保浏览器以标准模式解析文档，从而避免不同浏览器间的渲染差异。正确使用 DOCTYPE 可以提升页面的兼容性和可访问性。

`<!DOCTYPE>`声明应该位于HTML文档的第一行，紧接着是`<html>`标签。

例如，对于 HTML5 文档，你只需写：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document Title</title>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

这个声明告诉浏览器该文档是一个HTML5文档。HTML5是最新的HTML标准，它包括了许多现代化的功能，如语义元素、表单控件、音频和视频等。

---

`DOCTYPE` 的作用有以下几个方面：

1. **指定 HTML 版本**：浏览器根据 DOCTYPE 的声明来确定使用哪个 HTML 版本来渲染页面，从而保证页面在不同的浏览器上显示一致性。
2. **触发标准模式**：在 HTML 中，如果省略了 DOCTYPE 声明，浏览器会进入混杂模式（Quirks mode），这种模式下浏览器的渲染方式与早期的浏览器相同，可能导致页面的显示出现不可预测的错误。而指定了 DOCTYPE 声明，则会触发标准模式（Standards mode），使得浏览器按照 HTML 规范的要求进行页面渲染，从而保证页面的稳定性和可靠性。
3. **供浏览器和开发人员参考**：DOCTYPE 声明还包含了有关 HTML 文档的元信息，例如所使用的 DTD（文档类型定义），以及其他的元数据信息，这些信息可以供浏览器和开发人员参考，帮助开发人员更好地了解和掌握 HTML 语言的特点和规范。
4. **提高网页加载速度**：指定 DOCTYPE 声明可以帮助浏览器更快地加载网页，因为浏览器知道要使用哪种渲染模式，从而更快地解析 HTML 文档。
5. **避免代码错误**：指定 DOCTYPE 声明可以帮助开发人员在编写 HTML 代码时遵循标准，避免一些常见的代码错误，例如忘记关闭标签或者使用非法的属性和元素等等。

---

除了HTML5的`<!DOCTYPE>`声明之外，还有一些其他版本的HTML和XHTML文档类型声明。这里是一些例子：

**1. HTML 4.01 Strict：**

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
```

此声明表示该文档遵循HTML 4.01的严格标准，不包括过时的标签和属性。

**2. HTML 4.01 Transitional：**

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
```

此声明表示该文档遵循HTML 4.01的过渡标准，允许使用一些过时的标签和属性。

**3. HTML 4.01 Frameset：**

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">
```

此声明表示该文档遵循HTML 4.01的框架集标准，用于支持旧式的框架布局。

**4. XHTML 1.0 Strict：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

此声明表示该文档遵循XHTML 1.0的严格标准，不包括过时的标签和属性。

**5. XHTML 1.0 Transitional：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

此声明表示该文档遵循XHTML 1.0的过渡标准，允许使用一些过时的标签和属性。

**6. XHTML 1.0 Frameset：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
```

此声明表示该文档遵循XHTML 1.0的框架集标准，用于支持旧式的框架布局。

**7. XHTML 1.1：**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
```

此声明表示该文档遵循XHTML 1.1的标准。

## 常见考点

1. **定义与作用**：考察你对 DOCTYPE 的基本理解和它的目的。
2. **不同类型**：询问不同 DOCTYPE 的类型及其适用场景。
3. **浏览器渲染模式**：了解标准模式与混杂模式的区别，以及 DOCTYPE 如何影响渲染。
4. **常见错误**：讨论在使用 DOCTYPE 时可能遇到的常见错误及其后果。
5. **历史背景**：可能涉及 DOCTYPE 的演变及其在不同 HTML 版本中的变化。
