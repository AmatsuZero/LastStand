+++
title = "HTML 常见属性"
date = '2024-10-15T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = true
weight = 5
tags = ["面试", "前端", "HTML", "HTML 常见属性", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
HTML 元素的属性是用于控制元素行为或样式的附加信息。

以下是一些常见的 HTML 属性：

### 1. **通用属性（Global Attributes）**

这些属性几乎可以应用于所有 HTML 元素：

- **`id`**：元素的唯一标识符，用于 JavaScript 或 CSS 选择。  
```html
<div id="main"></div>
```
- **`class`**：为元素指定一个或多个类名，用于 CSS 样式或 JavaScript 操作。  
```html
<div class="container header"></div>
```
- **`style`**：为元素设置内联样式。  
```html
<div style="color: red;"></div>
```
- **`title`**：为元素提供额外信息，当鼠标悬停在元素上时显示。  
```html
<button title="Click me!">Click</button>
```
- **`data-*`**：自定义属性，用于存储私有数据，以 `data-` 为前缀，可以通过 JavaScript 访问。  
```html
<div data-user-id="123"></div>
```

### 2. **事件属性（Event Attributes）**

这些属性用于处理元素上的事件：

- **`onclick`**：定义单击事件处理函数。  
```html
<button onclick="alert('Clicked!')">Click me</button>
```
- **`onmouseover`**：鼠标悬停时触发的事件。  
```html
<div onmouseover="console.log('Mouse over')"></div>
```
- **`onkeydown`**：按下键盘时触发的事件。  
```html
<input type="text" onkeydown="handleKeyDown(event)">
```

### 3. **表单相关属性**

- **`type`**：定义输入框类型，例如 `text`、`password`、`email` 等。  
```html
<input type="text">
```
- **`name`**：定义表单元素的名称，用于表单提交。  
```html
<input type="text" name="username">
```
- **`value`**：定义表单元素的默认值。  
```html
<input type="text" value="Default value">
```
- **`placeholder`**：为输入框提供占位符文本，提示用户输入。  
```html
<input type="text" placeholder="Enter your name">
```
- **`disabled`**：禁用输入元素，使其不可交互。  
```html
<input type="text" disabled>
```
- **`required`**：标记表单元素为必填项。  
```html
<input type="text" required>
```

### 4. **链接和资源加载属性**

- **`href`**：用于指定超链接的目标 URL。  
```html
<a href="https://example.com">Go to example.com</a>
```
- **`src`**：指定图像、脚本或其他资源的路径。  
```html
<img src="image.jpg" alt="Image description">
```
- **`alt`**：为图像提供替代文本，图像无法加载时显示。  
```html
<img src="image.jpg" alt="Alternative text">
```
- **`rel`**：指定链接与目标文档的关系，常用于 `link` 标签和 `a` 标签。  
```html
<link rel="stylesheet" href="style.css">
```
- **`target`**：定义链接的打开方式，常用值包括 `_self`（当前窗口）和 `_blank`（新窗口）。  
```html
<a href="https://example.com" target="_blank">Open in new tab</a>
```

### 5. **多媒体属性**

- **`controls`**：为 `<audio>` 或 `<video>` 元素添加播放控件。  
```html
<video src="video.mp4" controls></video>
```
- **`autoplay`**：自动播放音频或视频。  
```html
<audio src="audio.mp3" autoplay></audio>
```
- **`loop`**：音频或视频播放完后重新开始播放。  
```html
<video src="video.mp4" loop></video>
```
- **`muted`**：自动静音视频或音频。  
```html
<audio src="audio.mp3" muted></audio>
```

### 6. **图像和媒体相关属性**

- **`width`** 和 **`height`**：定义图像或视频的宽度和高度。  
```html
<img src="image.jpg" width="200" height="100">
```

### 7. **iframe 属性**

- **`src`**：定义嵌入的网页 URL。  
```html
<iframe src="https://example.com"></iframe>
```
- **`sandbox`**：为嵌入内容提供更严格的限制，控制 iframe 的行为。  
```html
<iframe src="https://example.com" sandbox></iframe>
```

### 8. **语义化属性**

- **`role`**：为屏幕阅读器和辅助技术提供语义化描述。  
```html
<div role="navigation"></div>
```

### 9. **布局和可访问性属性**

- **`hidden`**：隐藏元素，元素不会显示在页面中。  
```html
<div hidden>This content is hidden</div>
```
- **`tabindex`**：定义元素的 tab 键导航顺序。  
```html
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
```

## 常见考点

### 1. **全局属性（Global Attributes）**

- **class**：用于给元素指定样式类，如何使用多个类？有哪些常见用法？
- **id**：唯一标识元素，`id` 的作用和注意事项。
- **style**：内联样式的作用及其优先级。
- **title**：为元素提供额外信息（鼠标悬停时显示）。
- **data-* 属性**：自定义数据属性，如何在 JavaScript 中访问 `data-*` 属性？

### 2. **事件属性（Event Attributes）**

- **onclick**、**onmouseover** 等事件处理属性。
- 如何使用事件属性进行事件绑定？
- 事件属性和 JavaScript 事件监听器（`addEventListener`）的区别和应用场景。

### 3. **表单属性**

- **name**：用于提交表单数据时作为键名。
- **action**：表单提交的目标 URL。
- **method**：表单的提交方式（`GET` 或 `POST`）。
- **autocomplete**：是否启用表单自动填充。
- **required**、**pattern**、**min/max** 等 HTML5 校验属性。

### 4. **输入控件相关属性**

- **value**：为输入控件设置默认值。
- **placeholder**：为输入框提供提示文本。
- **disabled**：禁用输入控件。
- **readonly**：只读属性，控件不能被修改。
- **maxlength/minlength**：输入字符长度的限制。
- **accept**：文件上传时，限制允许的文件类型（适用于 `<input type="file">`）。

### 5. **媒体元素属性**

- **src**：媒体文件的路径（适用于 `<img>`、`<audio>`、`<video>` 等）。
- **alt**：图片无法加载时显示的替代文本。
- **controls**：是否为媒体文件显示默认控制条。
- **autoplay**：媒体文件是否自动播放。
- **loop**：媒体文件是否循环播放。
- **muted**：媒体文件是否静音。

### 6. **超链接相关属性**

- **href**：链接目标的 URL。
- **target**：定义链接打开的方式（如 `_blank` 打开新窗口）。
- **download**：允许下载链接资源，而不是导航到资源。
- **rel**：定义链接与当前文档的关系（如 `nofollow`、`noopener`）。

### 7. **iframe 属性**

- **src**：嵌入的文档或网页的 URL。
- **sandbox**：启用或禁用特定行为（如禁止脚本、表单提交等）。
- **allow**：控制 iframe 内的权限（如允许摄像头、麦克风访问）。

### 8. **图像和图形属性**

- **srcset**：为不同设备提供不同分辨率的图像资源。
- **sizes**：配合 `srcset`，定义不同视口下图像显示的尺寸。
- **usemap**：指定图片使用的图像映射。
- **height/width**：定义图片或其他元素的高度和宽度。

### 9. **meta 标签属性**

- **charset**：指定文档的字符编码（如 `UTF-8`）。
- **name** 和 **content**：为文档提供元信息（如 `description`, `viewport`）。
- **http-equiv**：配合 `content`，定义 HTTP 头信息（如 `refresh`, `Content-Type`）。

### 10. **无障碍相关属性**

- **aria-* 属性**：为无障碍工具（如屏幕阅读器）提供更多语义信息。
- **role**：指定元素的功能角色，增强无障碍性。

### 11. **iframe 和图片的懒加载**

- **loading="lazy"**：为图片和 iframe 启用懒加载。

### 12. **语言和方向属性**

- **lang**：指定元素或页面的语言（如 `lang="en"`）。
- **dir**：指定文本的书写方向（如 `ltr` 左到右，`rtl` 右到左）。
