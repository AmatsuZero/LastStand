+++
title = "HTML 面试题"
draft = false
tags = ["面试", "前端", "HTML", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:28:04.975Z"
+++

共 77 道 HTML 面试题。答案默认折叠，便于先自行作答。

## 1. SPA和MPA的区别？ {#question-1c3850f1-2fdf-46a8-8b6e-ff9a6f1abf08}

> 难度：1 · 类型：QA

### 题目要点

SPA 通过前端路由在单一 HTML 中完成页面切换，交互流畅但首屏和 SEO 成本较高；MPA 每次导航请求新页面，SEO 友好且隔离性强，但交互体验有限；两者本质差异在于前后端渲染与路由职责的划分；现代项目常通过 SSR、SSG 等方式在两种模式之间折中。

<details>
<summary>参考答案</summary>

SPA 和 MPA 的区别，表面看是“页面跳转方式不同”，本质上是**前端与服务器在渲染职责、路由控制以及资源加载策略上的分工差异**。理解这一点，才能在具体业务中做出合理选择。

SPA（Single Page Application）只有一个 HTML 入口，首屏加载时会拉取完整的 JavaScript 应用骨架，之后的页面切换通过前端路由完成。URL 的变化并不会触发浏览器重新请求文档，而是由前端框架根据路由状态切换视图并复用已有资源。这种模式的优势在于页面切换流畅、状态可以在客户端长期保留，复杂交互体验更接近原生应用，非常适合后台系统、强交互工具型产品。但代价也同样明显：首屏资源压力大，SEO 先天不足，对 JS 执行和异常处理的依赖极高，一旦主 bundle 出现问题，整个应用都无法正常工作。

MPA（Multi Page Application）则以“页面”为核心单元。每一次导航都会向服务器请求一个新的 HTML 文档，路由和渲染主要由服务端控制。页面之间天然隔离，资源和状态会随页面刷新而重置。这种模式的优势在于首屏直观、SEO 友好、容错性强，适合内容型站点、营销页和对搜索引擎依赖较高的业务场景。但在交互复杂度上，MPA 往往需要付出更多成本，例如重复加载公共资源、跨页面状态共享困难，整体体验也更接近传统 Web。

从工程角度看，SPA 和 MPA 的差异还体现在构建和部署方式上。SPA 更强调前端工程化和运行时能力，构建目标是一个可长期运行的客户端应用；MPA 更强调页面级拆分和服务端模板渲染，前端更多是增强层而非控制中心。在现代实践中，两者并非对立关系，常见的折中方案包括 SSR、SSG 以及“多入口 SPA”，试图在交互体验和首屏性能、SEO 之间取得平衡。

因此，选择 SPA 还是 MPA，并不存在绝对优劣，关键在于业务目标：是以复杂交互和状态管理为核心，还是以内容分发和搜索可见性为核心。

</details>

## 2. 常见的H5标签有哪些 ，你是怎么用的 {#question-ae93b62f-d9ef-46c2-8151-da164426f49f}

> 难度：1 · 类型：QA

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

## 3. 浏览器是怎么解析 HTML 文档的？ {#question-869f1734-40bb-4954-8991-f3e5bac37808}

> 难度：3.5 · 类型：QA

### 题目要点

浏览器解析 HTML 的过程可以简化为以下几个关键步骤：

1. **接收 HTML 文件**。
2. **构建 DOM 树**：解析 HTML 生成 DOM 结构。
3. **解析 CSS**：解析样式规则并生成 CSSOM 树。
4. **生成渲染树**：将 DOM 和 CSSOM 结合，得到渲染树。
5. **布局**：计算每个元素的位置和大小。
6. **绘制**：将元素渲染到屏幕上。
7. **合成层**：将多个图层合成显示。
8. **执行 JavaScript**：执行页面上的脚本，可能改变 DOM 和样式。
9. **事件监听与交互**：处理用户输入并与页面交互。

每个步骤的执行都会影响页面的加载和渲染性能，因此开发者需要优化 HTML 结构、CSS、JavaScript 和资源加载顺序，提升用户体验。

<details>
<summary>参考答案</summary>

浏览器解析 HTML 文档的过程是一个复杂的过程，涉及多个阶段，主要分为以下几个步骤：

### 1. **接收 HTML 文件**
   - 浏览器通过发送 HTTP 请求获取服务器返回的 HTML 文件。该文件可能会包含外部资源（如 CSS、JavaScript、图片等），浏览器会逐步处理这些内容。

### 2. **构建 DOM 树**
   - **词法分析（Tokenization）**：浏览器开始解析 HTML 文档时，将 HTML 源代码拆分为一系列的“标记”或“词法单元”（tokens）。这些标记对应 HTML 标签、属性和文本。
   - **构建 DOM 树（Document Object Model）**：浏览器根据这些标记构建一个 DOM 树。DOM 树的每个节点代表 HTML 文档的一个元素（如 `<div>`、`<p>`）或文本内容，形成一个层次结构。
   - **节点顺序**：解析 HTML 文档时，浏览器会根据标签的嵌套关系将它们组织成树状结构。例如，`<html>` 元素是根节点，`<head>` 和 `<body>` 是其子节点，等等。

### 3. **解析 CSS（样式处理）**
   - 在构建 DOM 树的同时，浏览器会遇到 `&lt;style&gt;` 标签或者外部 CSS 文件的链接（如 `<link rel="stylesheet">`），浏览器会下载并解析这些 CSS 规则。
   - 浏览器将 CSS 规则应用到相应的 DOM 节点，生成 **CSSOM 树**（CSS Object Model），它表示页面上所有样式的结构。
   - 通过将 DOM 树和 CSSOM 树结合，生成 **渲染树**（Render Tree），它包含了页面中所有可见元素的样式信息。

### 4. **生成渲染树**
   - 渲染树由 DOM 树和 CSSOM 树组合而成，包含了页面中所有需要呈现的元素以及它们的样式信息。
   - 渲染树不包括像 `<head>` 标签或隐藏元素（例如 `display: none` 的元素），只有可见的元素和它们的样式才会被包含在内。
   - 例如，一个 `<div>` 元素的渲染树节点会包含该 `div` 的位置、大小、颜色等样式信息。

### 5. **布局（Layout / Reflow）**
   - **布局阶段**：浏览器通过渲染树来确定每个元素的准确位置和大小。浏览器计算每个元素的几何位置，得到每个元素在页面上的精确位置。
   - 如果布局发生了改变（例如窗口尺寸变化，或者某个元素的尺寸改变），浏览器需要重新计算布局，这个过程叫做 **重排（Reflow）**。

### 6. **绘制（Paint）**
   - **绘制阶段**：浏览器会将布局好的元素按照样式规则渲染到屏幕上，绘制每个元素的颜色、边框、阴影等外观。这个过程称为 **绘制（Paint）**。
   - 例如，浏览器会绘制元素的背景色、文本、边框等，生成最终的页面显示内容。

### 7. **合成层（Composite）**
   - 在绘制完成后，浏览器可能会将渲染的内容分为多个层。某些元素（如动画、滚动条、固定定位的元素等）可能需要单独的图层。
   - **合成阶段**：浏览器将这些层合成，最终生成显示在屏幕上的完整页面。

### 8. **执行 JavaScript**
   - 如果页面中有 JavaScript 代码，浏览器会在文档解析过程中执行它。JavaScript 代码通常会在 HTML 中的 `&lt;script&gt;` 标签内被嵌入或通过外部文件引入。
   - **影响**：JavaScript 可能会修改 DOM 或 CSSOM，导致重新计算布局（Reflow）或重新绘制（Repaint）。因此，JavaScript 执行的时机和顺序可能会影响页面的渲染性能。

### 9. **事件监听与交互**
   - 一旦页面的初始渲染完成，用户可以与页面进行交互。浏览器会监听用户的输入、鼠标点击、键盘事件等，并相应地触发 JavaScript 代码进行处理。

</details>

## 4. 怎么让页面上的某块区域全屏展示？ {#question-5e6f561b-5c29-482e-b07b-f08a4aa11432}

> 难度：2 · 类型：QA

### 题目要点

通过全屏 API，可以轻松将页面中的某个元素切换为全屏模式。这在需要专注展示某块内容或页面时（如视频播放器、图表、图片查看器等）非常有用。

<details>
<summary>参考答案</summary>

可以通过 HTML5 提供的 **全屏 API**，将该区域元素通过 `requestFullscreen()` 方法切换到全屏模式。

### **步骤概述**
1. 选择你希望全屏的某块区域（如一个 `div`）。
2. 在事件中调用 `element.requestFullscreen()` 方法进入全屏。
3. 可以监听全屏状态的变化（如退出全屏时的处理）。

### **实现示例**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>特定区域全屏展示</title>
  <style>
    #fullscreenDiv {
      width: 300px;
      height: 200px;
      background-color: lightcoral;
      text-align: center;
      line-height: 200px;
      margin: 50px auto;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div id="fullscreenDiv">点击全屏</div>

  <script>
    const fullscreenDiv = document.getElementById('fullscreenDiv');

    // 点击该区域进入全屏
    fullscreenDiv.addEventListener('click', function() {
      if (fullscreenDiv.requestFullscreen) {
        fullscreenDiv.requestFullscreen();
      } else if (fullscreenDiv.mozRequestFullScreen) { // Firefox
        fullscreenDiv.mozRequestFullScreen();
      } else if (fullscreenDiv.webkitRequestFullscreen) { // Chrome, Safari and Opera
        fullscreenDiv.webkitRequestFullscreen();
      } else if (fullscreenDiv.msRequestFullscreen) { // IE/Edge
        fullscreenDiv.msRequestFullscreen();
      }
    });

    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        console.log('退出全屏');
      } else {
        console.log('进入全屏');
      }
    });
  </script>

</body>
</html>
```

### **代码解析**
1. **指定的区域**：页面上有一个 `div` 元素，`#fullscreenDiv`，点击它时该 `div` 进入全屏状态。
2. **进入全屏**：调用 `fullscreenDiv.requestFullscreen()` 使 `div` 全屏。
3. **退出全屏**：可以按 `Esc` 键退出全屏，或者调用 `document.exitFullscreen()` 方法。
4. **兼容性处理**：由于各浏览器对全屏 API 的支持不同，我们进行了跨浏览器的兼容处理。

### **监听全屏状态变化**
使用 `fullscreenchange` 事件来监听进入或退出全屏的状态变化，可以在不同状态下执行一些操作（如重新调整布局、隐藏/显示退出全屏按钮等）。

</details>

## 5. 怎么在页面上获取用户的定位信息？ {#question-0fad3c15-63fe-4358-a202-397c983cae6f}

> 难度：1 · 类型：QA

### 题目要点

要在网页上获取用户的地理位置信息，可以使用 HTML5 提供的 Geolocation API，或者使用百度地图、高德地图等 SDK 进行获取。

<details>
<summary>参考答案</summary>

要在网页上获取用户的地理位置信息，可以使用 HTML5 提供的 Geolocation API，或者使用百度地图、高德地图等 SDK 进行获取。

下面仅介绍通过 Geolocation API 实现的基本步骤和代码示例：

### **步骤**
1. **检查浏览器是否支持 Geolocation API**
   使用 `navigator.geolocation` 对象来检测是否支持该功能。

2. **请求获取用户的当前位置**
   调用 `getCurrentPosition()` 方法来获取当前位置，该方法需要用户允许网页访问其位置信息。

3. **处理成功和错误情况**
   提供回调函数来处理成功获取位置信息和错误的情况。

### **实现代码示例**

```javascript
if (navigator.geolocation) {
  // 获取当前位置信息
  navigator.geolocation.getCurrentPosition(
    // 成功获取位置时的回调
    function(position) {
      const latitude = position.coords.latitude;   // 纬度
      const longitude = position.coords.longitude; // 经度
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      // 在页面上展示位置信息
      document.getElementById("location").innerText =
        `您的位置：纬度 ${latitude}, 经度 ${longitude}`;
    },
    // 获取位置失败时的回调
    function(error) {
      console.error(`Error Code = ${error.code}: ${error.message}`);
      alert("无法获取您的位置信息，请确保已授权！");
    },
    // 可选参数配置
    {
      enableHighAccuracy: true, // 提高精度（消耗更多资源）
      timeout: 5000,            // 超时时间（毫秒）
      maximumAge: 0             // 不使用缓存
    }
  );
} else {
  alert("您的浏览器不支持 Geolocation API");
}
```

### **页面展示示例**
在 HTML 页面上可以创建一个元素，用于展示用户的位置信息：

```html
<div id="location">定位中...</div>
```

### **关键参数说明**
- `success(position)`：当成功获取到位置时的回调函数，返回 `position` 对象，包含用户的经度、纬度等。
- `error(error)`：当获取位置失败时的回调函数。可以通过 `error.code` 和 `error.message` 了解失败原因，如用户拒绝授权或请求超时。
- `options`：可以提供配置参数，如提高位置精度（`enableHighAccuracy`）、设置超时时间（`timeout`）、以及是否使用缓存中的位置信息（`maximumAge`）。

</details>

## 6. html 中有哪些常见的实体字符？ {#question-b45cda77-44a7-45aa-a563-eb46bc5fd1d6}

> 难度：1 · 类型：QA

### 题目要点

HTML 中常见的实体字符用于表示特殊符号和字符，确保它们可以正确地显示在网页上。

<details>
<summary>参考答案</summary>

HTML 中常见的实体字符用于表示特殊符号和字符，确保它们可以正确地显示在网页上。

以下是一些常见的 HTML 实体字符：

### 1. **空格和特殊字符**
- **`&nbsp;`**：不换行空格 (non-breaking space)
  ```html
  &nbsp; <!-- 表示一个空格 -->
  ```
- **`&lt;`**：小于号 `<`
  ```html
  &lt;div&gt; <!-- 表示 <div> -->
  ```
- **`&gt;`**：大于号 `>`
  ```html
  &gt;/div&gt; <!-- 表示 </div> -->
  ```
- **`&amp;`**：与符号 `&`
  ```html
  &amp; <!-- 表示 & -->
  ```
- **`&quot;`**：双引号 `"`
  ```html
  &quot;Hello&quot; <!-- 表示 "Hello" -->
  ```
- **`&apos;`**：单引号 `'`
  ```html
  &apos;Hello&apos; <!-- 表示 'Hello' -->
  ```

### 2. **数学符号**
- **`&plus;`**：加号 `+`
- **`&minus;`**：减号 `−`
- **`&times;`**：乘号 `×`
- **`&divide;`**：除号 `÷`
- **`&equals;`**：等号 `=`

### 3. **货币符号**
- **`&dollar;`**：美元符号 `$`
- **`&euro;`**：欧元符号 `€`
- **`&pound;`**：英镑符号 `£`
- **`&yen;`**：日元符号 `¥`

### 4. **标点符号**
- **`&hellip;`**：省略号 `…`
- **`&bull;`**：项目符号 `•`
- **`&iexcl;`**：反向感叹号 `¡`
- **`&iquest;`**：反向问号 `¿`

### 5. **版权和注册符号**
- **`&copy;`**：版权符号 `©`
- **`&reg;`**：注册商标符号 `®`
- **`&trade;`**：商标符号 `™`

### 6. **箭头和方向符号**
- **`&larr;`**：左箭头 `←`
- **`&rarr;`**：右箭头 `→`
- **`&uarr;`**：上箭头 `↑`
- **`&darr;`**：下箭头 `↓`

### 7. **希腊字母**
- **`&alpha;`**：α
- **`&beta;`**：β
- **`&gamma;`**：γ
- **`&delta;`**：δ

### 8. **几何符号**
- **`&infin;`**：无穷符号 `∞`
- **`&le;`**：小于或等于 `≤`
- **`&ge;`**：大于或等于 `≥`

### 9. **其他符号**
- **`&sect;`**：章节符号 `§`
- **`&deg;`**：度数符号 `°`
- **`&para;`**：段落符号 `¶`
- **`&cent;`**：美分符号 `¢`
- **`&micro;`**：微符号 `µ`

### 10. **制表符和换行符**
- **`&#09;`**：制表符 (Tab)
- **`&#10;`**：换行符 (New Line)

</details>

## 7. html 文档中常见的 &nbsp; 是什么，有什么作用？ {#question-b5effd7b-86b9-49b9-a658-43e940ea19af}

> 难度：1 · 类型：QA

### 题目要点

`&nbsp;` 是 HTML 中的不间断空格实体字符，英文全称是 "Non-Breaking Space"。它的主要作用是插入一个空格，并且该空格不会因为文本的换行或其他布局规则而被浏览器自动折行或移除。

<details>
<summary>参考答案</summary>

`&nbsp;` 是 HTML 中的不间断空格实体字符，英文全称是 "Non-Breaking Space"。它的主要作用是插入一个空格，并且该空格不会因为文本的换行或其他布局规则而被浏览器自动折行或移除。

### `&nbsp;` 的作用：
1. **防止自动换行**：普通空格在 HTML 中，如果文本内容过长，浏览器会自动进行换行。使用 `&nbsp;` 可以防止换行，确保文本保持在同一行显示。适用于某些场合下希望一组词语或字符不被拆开的情况。

   例如：
   ```html
   <p>This&nbsp;is&nbsp;a&nbsp;test&nbsp;sentence.</p>
   ```

2. **保留连续空格**：在 HTML 中，多个连续的普通空格会被浏览器压缩为一个空格显示。而使用 `&nbsp;` 可以确保多个连续空格得以保留。

   例如：
   ```html
   <p>First&nbsp;&nbsp;&nbsp;&nbsp;Second</p>
   ```
   这将会在 "First" 和 "Second" 之间保持 4 个空格。

3. **排版和对齐**：在某些排版需求中，`&nbsp;` 常用于插入多个不可见的空白字符，来控制文字或元素的间距和布局，比如手动调整表格内容的对齐、排版等。

4. **占位符**：在表格或布局中，`&nbsp;` 可以作为占位符，用于在没有内容的情况下保持某些元素的空间，避免因为内容为空而导致的布局塌陷。

---

### 使用场景：
- 需要保持单词或短语不被拆开时（如人名、数字单位等）。
- 用于精确控制空格数量。
- 实现特定的排版或对齐需求。

### 注意事项：
虽然 `&nbsp;` 对于简单的排版需求有帮助，但应尽量避免过度依赖它来控制布局或间距。现代布局通常可以通过 CSS（如 `margin` 和 `padding`）来实现更灵活和可控的排版效果。

</details>

## 8. 说说你对 html 嵌套规则的了解 {#question-9464dbb8-2b6b-4309-83fa-15a5eb72ead1}

> 难度：2 · 类型：QA

### 题目要点

HTML 标签的嵌套规则规定了不同类型的 HTML 元素可以如何相互嵌套，以确保文档的结构有效和符合语义。

<details>
<summary>参考答案</summary>

HTML 标签的嵌套规则规定了不同类型的 HTML 元素可以如何相互嵌套，以确保文档的结构有效和符合语义。

以下是一些常见的嵌套规则：

### 1. **块级元素与内联元素的嵌套规则**
   - **块级元素**：一般情况下，块级元素可以嵌套其他块级元素和内联元素。
     - **合法示例**：
       ```html
       <div>
         <p>This is a paragraph inside a div.</p>
         <span>This is an inline element inside a div.</span>
       </div>
       ```
   - **内联元素**：内联元素一般只能包含内联元素，不能直接包含块级元素。
     - **不合法示例**（内联元素 `<span>` 包含块级元素 `<div>`）：
       ```html
       <span>
         <div>This is a block-level element inside an inline element.</div>
       </span>
       ```

   **总结**：块级元素可以包含块级和内联元素，内联元素不能包含块级元素。

### 2. **表单元素嵌套规则**
   - **表单元素**：
     - `&lt;form&gt;` 标签不能嵌套另一个 `&lt;form&gt;` 标签，即一个 `&lt;form&gt;` 不能包含另一个表单。
     - `<button>` 元素可以包含内联内容，但不能包含其他可交互的元素，如 `<a>`。

   **总结**：表单元素需要遵守严格的嵌套规则，避免嵌套多个表单或交互元素。

### 3. **列表标签嵌套规则**
   - **`<ul>`、`<ol>` 和 `<li>` 标签**：
     - `<li>` 元素只能直接包含在 `<ul>`、`<ol>` 或 `<menu>` 中，不能包含在其他块级或内联元素中。
     - 列表的项（`<li>`）可以嵌套另一个列表，但必须嵌套在 `<li>` 中。
     - **合法示例**：
       ```html
       <ul>
         <li>Item 1</li>
         <li>Item 2
           <ul>
             <li>Subitem 1</li>
           </ul>
         </li>
       </ul>
       ```

   **总结**：列表项 `<li>` 必须是直接子元素，列表可以嵌套但必须通过 `<li>` 元素。

### 4. **表格元素嵌套规则**
   - **`<table>` 元素**：
     - `<table>` 只能包含表格相关的元素，如 `<thead>`、`<tbody>`、`<tfoot>`、`<tr>`、`<td>`、`<th>` 等。
     - 不能将 `<div>`、`<p>` 等非表格元素直接放在 `<table>`、`<thead>`、`<tbody>` 或 `<tfoot>` 中。
     - **合法示例**：
       ```html
       <table>
         <thead>
           <tr>
             <th>Header</th>
           </tr>
         </thead>
         <tbody>
           <tr>
             <td>Data</td>
           </tr>
         </tbody>
       </table>
       ```

   **总结**：表格元素必须包含特定的表格标签，不能包含非表格标签。

### 5. **标题元素嵌套规则**
   - **`<h1>` 到 `<h6>` 标签**：
     - 标题元素（`<h1>` 到 `<h6>`）不能被嵌套，不能包含其他块级或内联元素。
     - 标题标签的顺序应该符合语义化，不能跳过级别，如直接从 `<h1>` 跳到 `<h4>`。

   **总结**：标题元素不能嵌套其他元素，也不能无序跳级。

### 6. **语义化标签嵌套规则**
   - **`<article>`、`<section>`、`<nav>`、`<aside>` 等语义化标签**：
     - 这些语义化标签可以嵌套其他块级元素或内联元素，但要符合逻辑层次。
     - **示例**：
       ```html
       <article>
         <section>
           <h2>Section Title</h2>
           <p>Section content.</p>
         </section>
         <aside>
           <p>Related information.</p>
         </aside>
       </article>
       ```

   **总结**：语义化标签可以嵌套，但应遵循页面结构的层次和逻辑。

### 7. **自闭合标签嵌套规则**
   - **自闭合标签**（如 `<img>`、`<br>`、`<hr>`）不能包含任何子元素。
     - 这些标签是自闭合的，不能嵌套其他元素，也不能有结束标签。
     - **不合法示例**：
       ```html
       <img>
         <p>This is inside an image tag.</p>
       </img> <!-- 错误：img是自闭合标签 -->
       ```

   **总结**：自闭合标签不能嵌套内容，且不需要结束标签。

### 8. **脚本和样式标签嵌套规则**
   - **`&lt;script&gt;` 和 `&lt;style&gt;` 标签**：
     - `&lt;script&gt;` 标签不能包含块级或内联元素，但可以包含 JavaScript 代码。
     - `&lt;style&gt;` 标签只能包含 CSS 代码，不能包含其他 HTML 元素。

   **总结**：`&lt;script&gt;` 和 `&lt;style&gt;` 标签只能包含相应的代码类型，不能嵌套其他 HTML 元素。

</details>

## 9. 如何使用 JavaScript 控制 <audio> 和 <video> 元素？ {#question-dad962f6-05f7-4711-a201-fad9f6215196}

> 难度：0.5 · 类型：QA

### 题目要点

可以通过 DOM 方法和属性来操作这些媒体元素。

<details>
<summary>参考答案</summary>

可以通过 DOM 方法和属性来操作这些媒体元素。

以下是一些常见的操作方法和示例：

### **1. 获取元素**

首先，使用 `document.getElementById()` 或其他选择器获取音频或视频元素的引用：

```javascript
const audioElement = document.getElementById('myAudio');
const videoElement = document.getElementById('myVideo');
```

### **2. 播放和暂停**

可以使用 `.play()` 和 `.pause()` 方法控制音频和视频的播放。

```javascript
// 播放
audioElement.play();
videoElement.play();

// 暂停
audioElement.pause();
videoElement.pause();
```

### **3. 设置音量**

使用 `.volume` 属性设置音量，范围是 0.0（静音）到 1.0（最大音量）。

```javascript
audioElement.volume = 0.5; // 设置音量为50%
videoElement.volume = 0.7; // 设置音量为70%
```

### **4. 控制播放进度**

使用 `.currentTime` 属性设置或获取当前播放时间（以秒为单位）。

```javascript
// 跳转到 30 秒
audioElement.currentTime = 30;
videoElement.currentTime = 30;

// 获取当前时间
const currentAudioTime = audioElement.currentTime;
const currentVideoTime = videoElement.currentTime;
```

### **5. 监听事件**

可以为音频或视频元素添加事件监听器，例如监听播放、暂停、结束等事件。

```javascript
audioElement.addEventListener('ended', () => {
  console.log('Audio ended');
});

videoElement.addEventListener('play', () => {
  console.log('Video is playing');
});
```

### **6. 显示和隐藏控件**

使用 `.controls` 属性来显示或隐藏默认的音频/视频控件。

```javascript
audioElement.controls = true;  // 显示控件
videoElement.controls = false;  // 隐藏控件
```

### **7. 完整示例**

```html
<audio id="myAudio" src="audio.mp3"></audio>
<video id="myVideo" src="video.mp4" width="640" height="360"></video>
<button id="playButton">Play</button>
<button id="pauseButton">Pause</button>

<script>
  const audioElement = document.getElementById('myAudio');
  const videoElement = document.getElementById('myVideo');
  const playButton = document.getElementById('playButton');
  const pauseButton = document.getElementById('pauseButton');

  playButton.addEventListener('click', () => {
    audioElement.play();
    videoElement.play();
  });

  pauseButton.addEventListener('click', () => {
    audioElement.pause();
    videoElement.pause();
  });
</script>
```

</details>

## 10. html 中的视频，怎么添加字幕？ {#question-d2fa61c7-ccd8-47db-b26e-0647fafd87a5}

> 难度：0.5 · 类型：QA

### 题目要点

通过在 `<video>` 标签中使用 `<track>` 标签，可以方便地为视频添加字幕，提升用户体验，尤其是在多语言环境中。确保字幕文件格式正确并正确设置属性，以便视频播放器能够识别和显示字幕。

<details>
<summary>参考答案</summary>

在 HTML 中，可以通过 `<track>` 标签为视频添加字幕。这个标签通常与 `<video>` 标签一起使用。以下是如何添加字幕的步骤和示例：

### **步骤**

1. **准备字幕文件**：通常使用 WebVTT 格式（.vtt 文件），其中包含时间戳和对应的字幕文本。

2. **使用 `<track>` 标签**：在 `<video>` 标签内添加 `<track>` 标签，指定字幕的属性。

### **示例代码**

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track src="subtitles.vtt" kind="subtitles" srclang="en" label="English">
  <track src="subtitles-zh.vtt" kind="subtitles" srclang="zh" label="中文">
  Your browser does not support the video tag.
</video>
```

### **属性说明**

- **src**：指定字幕文件的路径。
- **kind**：字幕类型，常用值有：
  - `subtitles`：表示字幕，通常用于翻译内容。
  - `captions`：表示听障者的字幕，包含额外的描述信息。
  - `descriptions`：描述性字幕，提供视频内容的额外信息。
  - `chapters`：章节标题。
- **srclang**：字幕语言的代码（如 `en`、`zh`）。
- **label**：用户界面中显示的语言名称。

</details>

## 11. 如何避免重绘或者重排？ {#question-c94ef007-aafe-4b9c-b96b-4f25c8120130}

> 难度：3 · 类型：QA

### 题目要点

- **批量更新 DOM**、**避免频繁访问布局属性** 和 **使用 `transform` 和 `opacity`** 等方法可以有效减少重绘和重排，提升页面性能。
- **简化选择器** 和 **减少 DOM 元素数量** 有助于提高 CSS 渲染效率。
- **使用现代框架** 和 **CSS 动画** 可以进一步优化渲染性能。

<details>
<summary>参考答案</summary>

## 如何触发重排和重绘
任何改变用来构建渲染树的信息都会导致一次重排或重绘：

- 添加、删除、更新DOM节点
- 通过display: none隐藏一个DOM节点-触发重排和重绘
- 通过visibility: hidden隐藏一个DOM节点-只触发重绘，因为没有几何变化
- 移动或者给页面中的DOM节点添加动画
- 添加一个样式表，调整样式属性
- 用户行为，例如调整窗口大小，改变字号，或者滚动。

## 如何避免重绘或者重排

### 集中改变样式
我们往往通过改变class的方式来集中改变样式
```js
// 判断是否是黑色系样式
const theme = isDark ? 'dark' : 'light';

// 根据判断来设置不同的class
ele.setAttribute('className', theme);
```

### 使用DocumentFragment
我们可以通过createDocumentFragment创建一个游离于DOM树之外的节点，然后在此节点上批量操作，最后插入DOM树中，因此只触发一次重排
```js
var fragment = document.createDocumentFragment();

for (let i = 0;i<10;i++){
  let node = document.createElement("p");
  node.innerHTML = i;
  fragment.appendChild(node);
}

document.body.appendChild(fragment);
```

### 提升为合成层
元素提升为合成层有以下优点：

- 合成层的位图，会交由 GPU 合成，比 CPU 处理要快
- 当需要 repaint 时，只需要 repaint 本身，不会影响到其他的层
- 对于 transform 和 opacity 效果，不会触发 layout 和 paint

提升合成层的最好方式是使用 CSS 的 will-change 属性：
```css
#target {
  will-change: transform;
}
```

</details>

## 12. canvas 与 svg 在可视化领域优劣如何 {#question-ca26a4cb-9880-4755-8ece-9c9a8f50f5b9}

> 难度：3 · 类型：QA

### 题目要点

选择 `<canvas>` 还是 `<svg>` 取决于具体的需求和应用场景。如果你需要高性能、动态更新的图形绘制，`<canvas>` 是更好的选择。而如果你需要可维护的矢量图形、灵活的样式和交互，`<svg>` 是更合适的选择。在实际应用中，也可以根据需要将两者结合使用，以发挥各自的优势。

<details>
<summary>参考答案</summary>

在可视化领域，`<canvas>` 和 `<svg>` 是两种常用的图形绘制技术，各有其优劣。它们各自适用于不同的场景和需求。

以下是对它们优缺点的详细比较：

### **1. Canvas**

#### **优点**

1. **性能高效**：
   - 对于需要频繁更新的动态内容（如游戏、动画），`<canvas>` 更加高效。因为它基于像素渲染，不需要管理复杂的 DOM 树。

2. **复杂绘制**：
   - 适合绘制复杂的图形和图像操作，如实时图像处理、像素级别的操作等。

3. **直接控制像素**：
   - 可以直接操作像素数据，适用于图像处理、图形计算等需求。

4. **绘图性能**：
   - 对于大量、复杂的图形绘制，`<canvas>` 的性能通常优于 `SVG`。

#### **缺点**

1. **不可维护性**：
   - 绘制完成后的图形不能直接访问和操作。无法直接修改已经绘制的内容，需要重新绘制。

2. **无内容语义**：
   - `canvas` 中的内容没有 DOM 结构，无法利用 HTML 的语义标签和事件绑定，难以进行内容层级和属性操作。

3. **适应性差**：
   - 对于需要响应式设计或动态调整内容，`<canvas>` 不如 `SVG` 方便。

### **2. SVG**

#### **优点**

1. **可维护性**：
   - SVG 是基于 XML 的矢量图形，图形元素在 DOM 中可以直接访问和操作。可以使用 CSS 和 JavaScript 进行样式和事件处理。

2. **可缩放性**：
   - SVG 图形是矢量的，可以在不同分辨率和尺寸下清晰显示，不会失真。

3. **灵活性和响应性**：
   - 对于需要响应式设计、交互和动态更新的应用，`SVG` 提供了更高的灵活性和可控性。

4. **样式和动画**：
   - 可以使用 CSS 和 SMIL 动画对 SVG 图形进行样式和动画处理，支持细粒度的动画控制。

#### **缺点**

1. **性能问题**：
   - 对于大量或复杂的图形元素，`SVG` 的性能可能会受到影响，因为每个图形元素都在 DOM 中存在。

2. **绘图限制**：
   - 对于需要频繁更新或操作的图形，`SVG` 的性能可能不如 `canvas`，因为每次更新都涉及 DOM 操作。

3. **复杂场景**：
   - 对于非常复杂或动态的图形场景，`SVG` 的性能和管理可能会变得复杂。

### **适用场景**

- **Canvas**：
  - 动画和游戏。
  - 实时数据可视化（如图表的动态更新）。
  - 图像处理和像素级操作。
  - 复杂的图形和渲染效果。

- **SVG**：
  - 图标和标志设计。
  - 矢量图形和图表（如静态和交互式图表）。
  - 响应式和可缩放的图形设计。
  - 需要精确控制和访问的图形。

</details>

## 13. web components 是什么？ {#question-699d3c09-7c5e-433e-8ca6-e02d55abfec9}

> 难度：2 · 类型：QA

### 题目要点

Web Components 是一组 Web 平台 API，允许开发者创建封装性强、可重用的组件，这些组件可以在任何 Web 应用程序中使用。

<details>
<summary>参考答案</summary>

Web Components 是一组 Web 平台 API，允许开发者创建封装性强、可重用的组件，这些组件可以在任何 Web 应用程序中使用。

Web Components 主要包括以下四个核心技术：

### **1. 自定义元素（Custom Elements）**
允许开发者定义新的 HTML 元素及其行为。这些自定义元素可以像内置元素一样被使用，并且支持生命周期回调函数。

### **2. 模板（Templates）**
`<template>` 元素用于定义可以重复使用的 HTML 结构。模板中的内容在被使用时才会被实例化和插入到 DOM 中，从而提高性能和重用性。

### **3. Shadow DOM**
允许将组件的内部结构和样式封装在一个独立的 DOM 子树中，这样可以避免样式和脚本的冲突。Shadow DOM 使组件可以有自己的封闭样式和结构。

### **4. HTML Imports（已废弃）**
HTML Imports 曾用于引入和使用 HTML 文档的片段，但该技术已被废弃，现代 Web 组件技术通常通过模块化 JavaScript 或 ES6 模块来替代。

### **Web Components 的优势**

- **封装性**：通过 Shadow DOM 隔离组件的样式和结构，避免全局样式和脚本的干扰。
- **重用性**：自定义元素可以被多次重用，促进代码的模块化和组织。
- **标准化**：作为 Web 标准的一部分，Web Components 与各种 JavaScript 框架和库兼容，能够在不同的环境中使用。

### **使用示例**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web Components Example</title>
    <script>
        class MyElement extends HTMLElement {
            constructor() {
                super();
                const shadow = this.attachShadow({ mode: 'open' });
                shadow.innerHTML = `<style>p { color: red; }</style><p>Hello, Web Components!</p>`;
            }
        }
        customElements.define('my-element', MyElement);
    </script>
</head>
<body>
    <my-element></my-element>
</body>
</html>
```

在上面的示例中，定义了一个自定义元素 `<my-element>`，它具有一个 Shadow DOM 和一些样式。这个元素可以被插入到任何 HTML 文档中，并且它的样式和结构是封闭的，不会受到外部样式的影响。

</details>

## 14. 什么是 HTML 文档的预解析？ {#question-8620e64e-4051-46a8-bef3-3b1031a29872}

> 难度：3 · 类型：QA

### 题目要点

文档的预解析涉及在浏览器开始渲染 HTML 之前，对文档进行各种处理和优化，以提升加载速度、提高安全性和增强兼容性。这些技术和方法能够显著改善用户体验和网站性能。

<details>
<summary>参考答案</summary>

文档的预解析（Document Preprocessing）指的是在浏览器开始渲染和解析 HTML 文档之前，对文档进行的一系列处理。这通常包括：

### 主要目的
1. **优化加载时间**：通过在服务器端或浏览器端对文档进行预处理，减少客户端的解析和渲染时间。
2. **提高安全性**：对文档进行预处理以防止潜在的安全威胁，比如恶意代码的注入。
3. **增强兼容性**：处理文档中可能引起兼容性问题的内容，确保在不同浏览器中的一致性表现。

### 常见的预解析技术
1. **HTML Minification**：在服务器端对 HTML 文件进行压缩，去除不必要的空格、换行符和注释，减小文件大小。
2. **资源预加载**：在 HTML 中使用 `<link rel="preload">` 或 `<link rel="prefetch">` 标签，提前加载可能会在后续渲染中用到的资源（如脚本、样式表）。
3. **模板编译**：将客户端模板（如 Handlebars 或 Vue 组件）预编译成 JavaScript 代码，减少客户端的编译负担。
4. **DOM 预处理**：对文档结构进行优化，例如将复杂的 DOM 操作预处理成更高效的结构。
5. **延迟加载**：对资源（如图片）使用延迟加载技术，避免在初次渲染时加载不必要的内容。

### 优点
- **提升页面加载速度**：减少客户端处理时间，提高用户体验。
- **降低服务器负载**：通过在服务器端进行一些预处理，减少了每次客户端请求时的计算负担。
- **增强安全性**：过滤和清理潜在的安全风险。

</details>

## 15. html 中前缀为 data- 开头的元素属性是什么？ {#question-b90eb9af-fa06-4b4e-ba83-fbe34330cbf6}

> 难度：3 · 类型：QA

### 题目要点

`data-` 属性提供了一种简洁的方法来将自定义数据存储在 HTML 元素中，这些数据可通过 JavaScript 进行访问和操作，而不会影响页面的标准表现。它们是现代 Web 开发中用于处理元素相关数据的有用工具。

<details>
<summary>参考答案</summary>

在 HTML 中，前缀为 `data-` 的元素属性被称为 **自定义数据属性**（Custom Data Attributes）。这些属性用于存储与元素相关的私有数据，供 JavaScript 使用，而不会影响页面的样式或行为。

### 主要特点

1. **自定义数据存储**：
   - 自定义数据属性允许开发者在 HTML 元素上存储额外的信息，这些信息不会影响 HTML 的标准行为或样式。

2. **不影响页面表现**：
   - `data-` 属性不会被浏览器默认处理或渲染，它们只用于存储数据并可通过 JavaScript 访问。

3. **灵活性**：
   - 自定义数据属性名称是自由定义的，只需以 `data-` 为前缀，并且后面跟着自定义的名称。例如，`data-user-id` 和 `data-info` 都是合法的自定义数据属性。

### 语法

```html
<element data-attribute-name="value">
  ...
</element>
```

### 示例

```html
<div id="myElement" data-user-id="12345" data-role="admin">
  User Info
</div>
```

### 访问自定义数据属性

**使用 JavaScript 访问**：

```javascript
const element = document.getElementById('myElement');

// 获取自定义数据属性
const userId = element.getAttribute('data-user-id');
const role = element.getAttribute('data-role');

console.log(userId); // 输出: 12345
console.log(role);   // 输出: admin

// 使用 dataset 访问
const data = element.dataset;
console.log(data.userId); // 输出: 12345
console.log(data.role);   // 输出: admin
```

**注意**：

- `dataset` 属性是一个对象，包含了所有以 `data-` 开头的属性，以驼峰命名的形式作为键（例如，`data-user-id` 会被访问为 `dataset.userId`）。
- 属性名称中只允许使用字母、数字、`-` 和 `_`。在 JavaScript 中访问时，连字符（-）会被转换为驼峰命名法（例如，`data-user-id` 变成 `dataset.userId`）。

### 使用场景

- **存储动态数据**：如用户信息、状态标识等。
- **实现交互**：通过将数据附加到元素上，可以在事件处理程序中使用这些数据来控制行为或更新 UI。
- **避免在 HTML 中硬编码数据**：在不修改 DOM 结构的情况下存储和访问附加数据。

</details>

## 16. script 标签上有那些属性，作用分别是什么？ {#question-87b1f0a2-a058-4f00-ae03-7d85bd19cbf5}

> 难度：2 · 类型：QA

### 题目要点

- **核心属性**：`src`、`type`、`defer`、`async` 是最常用的，控制脚本的加载、执行顺序和类型。
- **现代化支持**：`crossorigin`、`integrity`、`nomodule` 和 `referrerpolicy` 等属性则提供了现代浏览器的安全性和兼容性支持。
- **过时属性**：`language`、`event`、`for` 等属性已经过时，应该避免使用。

<details>
<summary>参考答案</summary>

`&lt;script&gt;` 标签是 HTML 中用于嵌入或引用 JavaScript 代码的标签。它有多个属性，可以控制脚本的加载和执行方式。以下是常见的 `&lt;script&gt;` 标签属性及其作用：

### 1. **src**
   - **作用**：指定外部 JavaScript 文件的 URL。
   - **用法**：当使用 `src` 属性时，`&lt;script&gt;` 标签内部的内容会被忽略。
   - **示例**：
     ```html
     &lt;script src="path/to/your/script.js"&gt;&lt;/script&gt;
     ```

### 2. **type**
   - **作用**：指定脚本的 MIME 类型，通常用于区分不同类型的脚本。
   - **默认值**：`text/javascript`，也可以是 `module` 用于引入 ES6 模块。
   - **示例**：
     ```html
     &lt;script type="module" src="path/to/your/module.js"&gt;&lt;/script&gt;
     ```

### 3. **defer**
   - **作用**：延迟脚本的执行，直到 HTML 文档完全解析完毕。适用于外部脚本文件。
   - **注意**：只有当 `script` 标签有 `src` 属性时，这个属性才有效。
   - **示例**：
     ```html
     &lt;script src="path/to/your/script.js" defer&gt;&lt;/script&gt;
     ```

### 4. **async**
   - **作用**：异步加载脚本文件，加载完后立即执行，不会阻塞 HTML 的解析。适用于外部脚本文件。
   - **注意**：`async` 和 `defer` 不能同时使用，如果都写了，`async` 会被忽略。
   - **示例**：
     ```html
     &lt;script src="path/to/your/script.js" async&gt;&lt;/script&gt;
     ```

### 5. **charset**
   - **作用**：指定外部脚本文件的字符编码，通常用于避免字符集问题。
   - **用法**：仅在 `src` 属性存在时使用。
   - **示例**：
     ```html
     &lt;script src="path/to/your/script.js" charset="UTF-8"&gt;&lt;/script&gt;
     ```

### 6. **crossorigin**
   - **作用**：控制跨域请求的设置，用于指定如何处理跨域脚本。
   - **值**：
     - `anonymous`：不发送用户凭据（如 Cookies 或 HTTP 认证）。
     - `use-credentials`：发送用户凭据。
   - **示例**：
     ```html
     &lt;script src="https://example.com/script.js" crossorigin="anonymous"&gt;&lt;/script&gt;
     ```

### 7. **integrity**
   - **作用**：用于验证外部脚本的完整性，通过对比哈希值确保脚本文件未被篡改。
   - **示例**：
     ```html
     &lt;script src="https://example.com/script.js" integrity="sha384-OgVRvuATP..."&gt;&lt;/script&gt;
     ```

### 8. **nomodule**
   - **作用**：指定在不支持 ES6 模块的浏览器中不执行此脚本。
   - **用法**：常与 `type="module"` 配合使用，提供对旧浏览器的兼容。
   - **示例**：
     ```html
     &lt;script nomodule src="path/to/your/script.js"&gt;&lt;/script&gt;
     ```

### 9. **referrerpolicy**
   - **作用**：控制加载外部脚本时的 `Referer` HTTP 头部的内容。
   - **值**：`no-referrer`, `origin`, `origin-when-cross-origin`, `unsafe-url` 等。
   - **示例**：
     ```html
     &lt;script src="https://example.com/script.js" referrerpolicy="no-referrer"&gt;&lt;/script&gt;
     ```

### 10. **language** (Deprecated)
   - **作用**：指定脚本语言，但已废弃，不再推荐使用。
   - **示例**：
     ```html
     &lt;script language="JavaScript"&gt;/* script content */&lt;/script&gt;
     ```

### 11. **event** (Deprecated)
   - **作用**：指定在何种事件下加载脚本，已废弃。
   - **示例**：
     ```html
     &lt;script event="onload"&gt;/* script content */&lt;/script&gt;
     ```

### 12. **for** (Deprecated)
   - **作用**：与 `event` 属性配合使用，指定触发事件的对象，已废弃。
   - **示例**：
     ```html
     &lt;script for="window" event="onload"&gt;/* script content */&lt;/script&gt;
     ```

</details>

## 17. link 标签有哪些属性，分别有什么作用？ {#question-d4cff3fa-0488-47d6-a488-705ea93e174c}

> 难度：2 · 类型：QA

### 题目要点

- **`href`**：指定资源 URL。
- **`rel`**：定义文档与资源的关系。
- **`type`**：指定资源 MIME 类型（主要用于样式表）。
- **`media`**：定义样式表的媒体条件。
- **`sizes`**：定义图标的尺寸。
- **`as`**：指定预加载资源的类型。
- **`crossorigin`**：设置跨域请求处理方式。

<details>
<summary>参考答案</summary>

`<link>` 标签在 HTML 中用于链接外部资源，最常见的是用于引入样式表（CSS）。它可以有多个属性，每个属性具有不同的作用。

以下是常用的 `<link>` 标签属性及其作用：

### **常用属性**

1. **`href`**

   - **作用**：指定要链接的外部资源的 URL。
   - **示例**：
     ```html
     <link rel="stylesheet" href="styles.css">
     ```

2. **`rel`**

   - **作用**：定义当前文档与目标资源之间的关系。用于指示链接资源的类型。
   - **常见值**：
     - `stylesheet`：指示链接的资源是一个样式表。
     - `icon`：指示链接的资源是网站图标（favicon）。
     - `preload`：指示预加载资源（如字体、脚本）。
     - `prefetch`：指示预取资源，以便在用户可能需要时可以更快地加载。
   - **示例**：
     ```html
     <link rel="stylesheet" href="styles.css">
     <link rel="icon" href="favicon.ico">
     ```

3. **`type`**

   - **作用**：指定链接资源的 MIME 类型，通常用于描述资源的类型（主要用于 `&lt;style&gt;`）。
   - **示例**：
     ```html
     <link rel="stylesheet" type="text/css" href="styles.css">
     ```

4. **`media`**

   - **作用**：指定样式表应用的媒体类型或设备条件。用于响应式设计，决定样式表在哪些条件下应用。
   - **常见值**：
     - `all`：所有设备。
     - `screen`：屏幕设备。
     - `print`：打印设备。
     - `(min-width: 600px)`：具有至少 600 像素宽度的设备。
   - **示例**：
     ```html
     <link rel="stylesheet" media="print" href="print.css">
     <link rel="stylesheet" media="(min-width: 600px)" href="responsive.css">
     ```

5. **`sizes`**

   - **作用**：定义图标的尺寸。这对于不同尺寸的图标非常有用，例如用于高分辨率屏幕上的不同图标大小。
   - **示例**：
     ```html
     <link rel="icon" href="favicon.ico" sizes="32x32">
     <link rel="icon" href="favicon-large.ico" sizes="64x64">
     ```

6. **`as`**

   - **作用**：指定加载资源的类型，主要用于资源预加载（`rel="preload"`）。
   - **常见值**：
     - `script`：脚本。
     - `style`：样式表。
     - `font`：字体。
     - `image`：图像。
   - **示例**：
     ```html
     <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin="anonymous">
     ```

7. **`crossorigin`**

   - **作用**：设置如何处理跨域请求（尤其在涉及到字体和图像时）。通常与 `rel="preload"` 和 `as` 属性一起使用。
   - **常见值**：
     - `anonymous`：不发送凭证（cookies、HTTP认证信息等）。
     - `use-credentials`：发送凭证。
   - **示例**：
     ```html
     <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin="anonymous">
     ```

</details>

## 18. link 标签的 rel 属性中，preload 和 prefetch 这两个值的作用是什么？ {#question-9d35a1bc-a10f-45d0-a6ee-a141327bd9a8}

> 难度：2.5 · 类型：QA

### 题目要点

- **`preload`**：优先加载当前页面需要的关键资源，以提升页面加载速度。
- **`prefetch`**：预取未来可能需要的资源，以提高未来导航的速度。

<details>
<summary>参考答案</summary>

在 HTML 中，`rel` 属性用于定义当前文档与目标资源之间的关系。`preload` 和 `prefetch` 是 `rel` 属性的两个值，主要用于优化资源的加载策略。

### **`preload`**

- **作用**：指定浏览器在页面加载时优先加载资源。适用于关键资源（如字体、脚本、样式表），可以提高页面加载速度和用户体验。
- **用法**：用于在文档加载时预加载资源，确保它们在需要时可以快速访问。
- **示例**：
  ```html
  <link rel="preload" href="styles.css" as="style">
  <link rel="preload" href="script.js" as="script">
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin="anonymous">
  ```

  在这个示例中：
  - `styles.css` 和 `script.js` 会在页面加载时被预加载。
  - `font.woff2` 也会被预加载，并指定了资源的类型和跨域策略。

### **`prefetch`**

- **作用**：指示浏览器预取资源，这些资源在未来的导航或用户交互中可能会被用到。适用于不是立即需要的资源，但预计在将来会用到的场景。
- **用法**：用于在空闲时加载资源，以加快未来页面的加载速度。
- **示例**：
  ```html
  <link rel="prefetch" href="next-page.html">
  <link rel="prefetch" href="extra-data.json">
  ```

  在这个示例中：
  - `next-page.html` 和 `extra-data.json` 会被预取，以便在用户访问时更快地加载。

</details>

## 19. HTML 部分标签中的 crossorigin 属性，作用是什么？ {#question-523d454b-755e-4c1f-9952-440e469195a3}

> 难度：3 · 类型：QA

### 题目要点

- **`crossorigin="anonymous"`**：请求不包含凭证，适用于公开资源。
- **`crossorigin="use-credentials"`**：请求包含凭证，适用于需要用户认证的资源。

<details>
<summary>参考答案</summary>

`crossorigin` 属性用于指定如何处理跨域请求，特别是在加载外部资源（如图片、字体或脚本）时。它主要用于 `<link>` 和 `<img>` 标签以及一些其他 HTML 元素。该属性的作用是定义浏览器如何处理 CORS（跨域资源共享）请求。

### **`crossorigin` 属性的取值和作用**

1. **`anonymous`**

   - **作用**：请求不会包含凭证（如 Cookies 和 HTTP 认证信息）。这是默认的 CORS 策略，适用于大多数情况，特别是公共资源。
   - **示例**：
     ```html
     <link rel="stylesheet" href="styles.css" crossorigin="anonymous">
     <img src="image.jpg" crossorigin="anonymous">
     ```
   - **用途**：用于公共资源，例如从 CDN 加载的样式表或图片，这些资源不需要用户认证。

2. **`use-credentials`**

   - **作用**：请求会包含凭证（如 Cookies 和 HTTP 认证信息），用于需要身份验证的资源。要求服务器在响应头中包含 `Access-Control-Allow-Credentials: true`。
   - **示例**：
     ```html
     <link rel="stylesheet" href="styles.css" crossorigin="use-credentials">
     <img src="image.jpg" crossorigin="use-credentials">
     ```
   - **用途**：用于需要用户认证的资源，例如需要登录的内容。

### **如何工作**

- **资源请求**：当浏览器请求跨域资源时，会根据 `crossorigin` 属性的值决定是否发送凭证。
- **响应头**：服务器需要在响应头中设置 CORS 相关的头信息（如 `Access-Control-Allow-Origin` 和 `Access-Control-Allow-Credentials`），以允许资源被成功加载。

</details>

## 20. 在 DOM 中，如何判定 a 元素是否是 b 元素的子元素？ {#question-6012756d-09e0-48b3-9722-79bb30529dc8}

> 难度：1 · 类型：QA

### 题目要点

- 推荐使用 `b.contains(a)`，语义清晰，兼容性好。
- `compareDocumentPosition` 更细粒度，适合需要精确判断各种节点关系的场景。

<details>
<summary>参考答案</summary>

在 DOM 中，可以使用 `Node.contains()` 或 `Node.compareDocumentPosition()` 方法判断元素之间的包含关系。

---

### 方法一：`contains`

```js
b.contains(a)
```

**说明**：当 `a` 是 `b` 的子节点（包括后代）时，返回 `true`，否则返回 `false`。

```js
const a = document.querySelector('#child');
const b = document.querySelector('#parent');
console.log(b.contains(a)); // true 表示 a 是 b 的子元素或后代
```

---

### 方法二：`compareDocumentPosition`

```js
(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0
```

**说明**：如果 `a` 被 `b` 包含（即 `a` 是 `b` 的后代节点），返回 `true`。

</details>

## 21. 说说你对 SSG 的理解 {#question-f56eac8e-a286-4971-a9c4-77df60335d0c}

> 难度：1 · 类型：QA

### 题目要点

SSG（Static Site Generation，静态网站生成）是指在构建时预先生成静态页面，并将这些页面部署到 CDN 或者其他存储服务中，以提升 Web 应用的性能和用户体验。

<details>
<summary>参考答案</summary>

SSG（Static Site Generation，静态网站生成）是指在构建时预先生成静态页面，并将这些页面部署到 CDN 或者其他存储服务中，以提升 Web 应用的性能和用户体验。

具体来说，SSG 的实现方式通常包括以下几个步骤：

1. 在开发阶段，使用模板引擎等技术创建静态页面模板；
2. 将需要展示的数据从后台 API 中获取或者通过其他渠道获取，并将其填充到静态页面模板中，生成完整的 HTML 页面；
3. 使用构建工具（例如 Gatsby、Next.js 等）对静态页面进行构建，生成静态 HTML、CSS 和 JavaScript 文件；
4. 部署生成好的静态文件到服务器或者 CDN 上，以供用户访问。

相比于传统的动态网页，SSG 具有如下优势：

1. 加载速度快：由于不需要每次请求都动态地渲染页面，SSG 可以减少页面加载时间，从而提高用户体验和搜索引擎排名；
2. 安全性高：由于没有后台代码和数据库，SSG 不容易受到 SQL 注入等攻击；
3. 成本低：由于不需要动态服务器等设备，SSG 可以降低网站的运维成本和服务器负担。

需要注意的是，SSG 不适用于频繁更新的内容和动态交互等场景，但对于内容较为稳定和更新较少的网站则是一个性能优化的好选择。

</details>

## 22. 说说你对 Dom 树的理解 {#question-45affa79-be16-4489-b403-bf3d614fcf03}

> 难度：2 · 类型：QA

### 题目要点

- **DOM 树** 是文档的结构化表示，包含了文档的所有元素、属性和文本节点。
- **操作 DOM** 是通过 JavaScript 对页面内容进行动态修改和控制的基础。
- **了解 DOM 树** 的结构和操作可以帮助开发者更有效地处理网页的动态内容和交互。

<details>
<summary>参考答案</summary>

## 什么是 DOM

从网络传给渲染引擎的 HTML 文件字节流是无法直接被渲染引擎理解的，所以要将其转化为渲染引擎能够理解的内部结构，这个结构就是 DOM。

DOM 提供了对 HTML 文档结构化的表述。

在渲染引擎中，DOM 有三个层面的作用：

* 从页面的视角来看，DOM 是生成页面的基础数据结构。
* 从 JavaScript 脚本视角来看，DOM 提供给 JavaScript 脚本操作的接口，通过这套接口，JavaScript 可以对 DOM 结构进行访问，从而改变文档的结构、样式和内容。
* 从安全视角来看，DOM 是一道安全防护线，一些不安全的内容在 DOM 解析阶段就被拒之门外了。

简言之，DOM 是表述 HTML 的内部数据结构，它会将 Web 页面和 JavaScript 脚本连接起来，并过滤一些不安全的内容。

## DOM树如何生成

HTML 解析器（HTMLParser）： 负责将 HTML 字节流转换为 DOM 结构。

那么网络进程是如何将数据传给HTML解析器的呢？

![image.png](https://static.ecool.fun//article/415bb61f-4f46-42b2-a4bd-368330a35008.jpeg)

从图中我们可以知道，网络进程和渲染进程之间有一个共享数据通道，网络进程加载了多少数据， 就将数据传给HTML解析器进行解析。

HTML解析器接收到数据（字节流）之后，字节流将转化成DOM，过程如下：

![image.png](https://static.ecool.fun//article/6d45bc73-38cb-4dc2-aa61-3d235a6ffca1.jpeg)

**有三个阶段**：

1、通过分词器将字节流转化为Token。 分词器先将字节流转换为一个个 Token，分为 Tag Token 和文本 Token。

注意，这里的Token并不是我们之前理解的Token，这里就是一个片段。

2、Token解析为DOM节点。

3、将 DOM节点添加到DOM树中。

## JavaScript影响DOM的生成

我们知道，JavaScript可以修改DOM，它也会影响DOM的生成。

1、内嵌 JavaScript 脚本 比如我们嵌入了一段`&lt;script&gt;`标签的代码，之前的解析过程都一样，但是解析到script标签时， 渲染引擎判断这是一段脚本，此时 HTML 解析器就会**暂停 DOM 的解析**， 因为接下来的 JavaScript 可能要修改当前已经生成的 DOM 结构。

暂停解析之后，JavaScript 引擎介入，并**执行`&lt;script&gt;`标签中的这段脚本**。 脚本执行完成之后，HTML 解析器恢复解析过程，继续解析后续的内容，直至生成最终的 DOM。

2、引入 JavaScript 文件 基本上跟之前是一致的，不同点在于，暂停解析之后执行JavaScript 代码，需要**先下载这段 JavaScript 代码**。

</details>

## 23. Node 和 Element 是什么关系？ {#question-8bf5ed84-131a-405e-9385-0b3b75a42723}

> 难度：1 · 类型：QA

### 题目要点

Node与Element的关系，从继承方面思考可能清晰很多。

<details>
<summary>参考答案</summary>

## Node与Element的关系

Node与Element的关系，从继承方面思考可能清晰很多。

Element 继承于 Node，具有Node的方法，同时又拓展了很多自己的特有方法。

在Element的一些方法里，是明确区分了Node和Element的。比如说：childNodes与 children, parentNode与parentElement等方法。

Node的一些方法，返回值为Node，比如说文本节点，注释节点之类的，而Element的一些方法，返回值则一定是Element。

区分清楚这点了，也能避免很多低级问题。

简单的说就是Node是一个基类，DOM中的`Element`，`Text和Comment`都继承于它。换句话说，`Element`，`Text`和`Comment`是三种特殊的Node，它们分别叫做`ELEMENT_NODE`,`TEXT_NODE`和`COMMENT_NODE`。

所以我们平时使用的 html上的元素，即`Element`，是类型为`ELEMENT_NODE`的`Node`。

</details>

## 24. 如何控制 input 输入框的输入字数？ {#question-9464fd89-1578-4f3b-a103-840b73b1987e}

> 难度：1 · 类型：QA

### 题目要点

一般是通过 maxlength 属性进行限制：

<details>
<summary>参考答案</summary>

一般是通过 maxlength 属性进行限制：

 ```js
 <input maxlength="5" />
 ```

 另外还可以通过监听 `οninput` 事件，对输入值进行处理。

</details>

## 25. 导致页面加载白屏时间长的原因有哪些，怎么进行优化？ {#question-841bfe02-d07d-45db-9e65-b9c250595d80}

> 难度：4 · 类型：QA

### 题目要点

**作答思路：**

页面加载白屏时间长的原因可能包括：

1. **资源加载缓慢**：HTML、CSS、JavaScript文件、图片等资源加载缓慢，导致页面内容无法及时显示。
2. **服务器响应时间长**：服务器处理请求的时间较长，导致页面内容无法及时返回。
3. **浏览器解析时间长**：浏览器解析HTML、CSS、JavaScript文件的时间较长，导致页面内容无法及时渲染。
4. **网络延迟**：用户与服务器之间的网络延迟较大，导致页面内容无法及时传输。
5. **浏览器缓存策略**：浏览器缓存策略不合理，导致页面内容无法从缓存中获取，需要重新加载。

优化方法包括：

1. **压缩资源文件**：对HTML、CSS、JavaScript文件、图片等进行压缩，减少文件大小，加快加载速度。
2. **使用CDN**：将静态资源（如图片、CSS、JavaScript文件）托管在CDN上，提高资源加载速度。
3. **优化服务器响应时间**：优化服务器配置，提高服务器处理请求的速度。
4. **减少HTTP请求**：合并CSS、JavaScript文件，减少HTML页面中的图片数量，减少HTTP请求的数量。
5. **使用浏览器缓存**：设置合理的浏览器缓存策略，让页面内容可以从缓存中获取，加快页面加载速度。
6. **优化网络环境**：优化网络环境，减少网络延迟，提高页面内容的传输速度。

**考察要点**：

1. **白屏原因**：理解页面加载白屏时间长的可能原因。
2. **优化方法**：了解如何通过优化资源、服务器、网络环境等方面来减少白屏时间。

<details>
<summary>参考答案</summary>

# 一、白屏时间

白屏时间：即用户点击一个链接或打开浏览器输入URL地址后，从屏幕空白到显示第一个画面的时间。

# 二、白屏时间的重要性

当用户点开一个链接或者是直接在浏览器中输入URL开始进行访问时，就开始等待页面的展示。页面渲染的时间越短，用户等待的时间就越短，用户感知到页面的速度就越快。这样可以极大的**提升用户的体验，减少用户的跳出，提升页面的留存率。**

# 三、白屏的过程

从输入url，到页面的画面展示的过程

1、首先，在浏览器地址栏中输入url

2、浏览器先查看浏览器缓存-系统缓存-路由器缓存，如果缓存中有，会直接在屏幕中显示页面内容。若没有，则跳到第三步操作。

3、在发送http请求前，需要域名解析(DNS解析)，解析获取相应的IP地址。

4、浏览器向服务器发起tcp连接，与浏览器建立tcp三次握手。

5、握手成功后，浏览器向服务器发送http请求，请求数据包。

6、服务器处理收到的请求，将数据返回至浏览器

7、浏览器收到HTTP响应

8、读取页面内容，浏览器渲染，解析html源码

9、生成Dom树、解析css样式、js交互,渲染显示页面

浏览器下载HTML后，首先解析头部代码，进行样式表下载，然后继续向下解析HTML代码，构建DOM树，同时进行样式下载。当DOM树构建完成后，立即开始构造CSSOM树。理想情况下，样式表下载速度够快，DOM树和CSSOM树进入一个并行的过程，当两棵树构建完毕，构建渲染树，然后进行绘制。

Tips:浏览器安全解析策略对解析HTML造成的影响：

当解析HTML时遇到内联JS代码，会阻塞DOM树的构建，会先执行完JS代码;当CSS样式文件没有下载完成时，浏览器解析HTML遇到了内联JS代码，此时，浏览器暂停JS脚本执行，暂停HTML解析。直到CSS文件下载完成，完成CSSOM树构建，重新恢复原来的解析。

JavaScript 会阻塞 DOM 生成，而样式文件又会阻塞 JavaScript 的执行，所以在实际的工程中需要重点关注 JavaScript 文件和样式表文件，使用不当会影响到页面性能的。

# 四、白屏-性能优化

## 1\. DNS解析优化

针对DNS Lookup环节，我们可以针对性的进行DNS解析优化。

* DNS缓存优化
* DNS预加载策略
* 稳定可靠的DNS服务器

## 2\. TCP网络链路优化

多花点钱吧

## 3\. 服务端处理优化

服务端的处理优化，是一个非常庞大的话题，会涉及到如Redis缓存、数据库存储优化或是系统内的各种中间件以及Gzip压缩等…

## 4\. 浏览器下载、解析、渲染页面优化

根据浏览器对页面的下载、解析、渲染过程，可以考虑一下的优化处理：

* 尽可能的精简HTML的代码和结构
* 尽可能的优化CSS文件和结构
* 一定要合理的放置JS代码，尽量不要使用内联的JS代码
* 将渲染首屏内容所需的关键CSS内联到HTML中，能使CSS更快速地下载。在HTML下载完成之后就能渲染了，页面渲染的时间提前，从而缩短首屏渲染时间；
* 延迟首屏不需要的图片加载，而优先加载首屏所需图片（offsetTop<clientHeight）

```js
document.documentElement.clientHeight//获取屏幕可视区域的高度
element.offsetTop//获取元素相对于文档顶部的高度
```

因为JavaScript 会阻塞 DOM 生成，而样式文件又会阻塞 JavaScript 的执行，所以在实际的工程中需要重点关注 JavaScript 文件和样式表文件，使用不当会影响到页面性能的。

</details>

## 26. 假设我要上传图片，怎么在选择图片后，通过浏览器预览待上传的图片？ {#question-cb703abf-4024-4ad1-8135-782ef6afe339}

> 难度：2 · 类型：QA

### 题目要点

实现预览有两种方式：

<details>
<summary>参考答案</summary>

实现预览有两种方式：

* 一种是用 `window.URL.createObjectURl` 方法对选择的图片数据（可以勉强理解为input的value）生成一个blob对象路径
* 第二种是使用 `FileReader` 读取器

那么无论那种方法，首先都得得到文件数据，获得文件数据是从files集合中获取。

先来看下 `window.URL.createObjectURl` 的实现方法：

```js
function imgChange(img) {
 document.querySelector("img").src=window.URL.cteateObejectURL(img.files[0]);
}
```

而使用	`FileRader` 读取文件.可分为四步；

1. 创建 `FileReader` 对像；
2. 调用 `readAsDataURL` 方法读取文件；
3. 调用 `onload` 事件监听。因为我们需要拿到完整的数据，但我们又不知道文件何时读完，所以需要第三步监听；
4. 通过 `FileReader` 的 `result` 属性拿到读取结果。

```js
function imgChange(img) {
    // 生成一个文件读取的对象
    const reader = new FileReader();
    reader.onload = function (ev) {
        document.querySelector("img").src = imgFile;
    }
    //发起异步读取文件请求，读取结果为data:url的字符串形式，
    reader.readAsDataURL(img.files[0]);
}
```

</details>

## 27. 渐进式jpg有了解过吗？ {#question-987220ea-bf52-48ea-a6bd-106e97167e81}

> 难度：1 · 类型：QA

### 题目要点

渐进式 JPEG（Progressive JPEG），即PJPEG，是该标准的三种流行压缩模式之一。

<details>
<summary>参考答案</summary>

渐进式 JPEG（Progressive JPEG），即PJPEG，是该标准的三种流行压缩模式之一。

渐进式 JPEG 以特定方式压缩照片和图形，与基线 JPEG 不同，PJPEG 在 Web 浏览器中呈现时，会首先给出模糊图像的外观。然后一点一点地开始图片渲染，直到它显示完全渲染的图像。浏览器实际上是逐行解释图像，但在占位符中提供了完整图像的模糊预览。随着 Web 浏览器的渲染引擎处理数据，图像的对比度开始变得更清晰、更详细。直到最后渲染完毕，用户将看到完整的清晰图像。

PJPEG 能够起到一种很有意义的心理效果，让用户有东西可看，而不必坐着干等大型图像慢慢显示在屏幕上。

PJPEG 适用于大部分常用的浏览器，包括 `Chrome`、`Firefox` 和 `Internet Explorer 9` 及更高版本。旧版本的 Internet Explorer 在显示渐进式 JPEG 时存在一些问题，不过这只是很小一部分用户。而不支持渐进式 JPEG 格式的浏览器会像普通 JPEG 一样加载照片。

</details>

## 28. 怎么实现“点击回到顶部”的功能？ {#question-82f034bf-f411-4569-b442-af7b6c229eb9}

> 难度：1.5 · 类型：QA

### 题目要点

下面介绍5种方法进行实现。

<details>
<summary>参考答案</summary>

下面介绍5种方法进行实现。

## 1、锚点

使用锚点链接是一种简单的返回顶部的功能实现。

该实现主要在页面顶部放置一个指定名称的锚点链接，然后在页面下方放置一个返回到该锚点的链接，用户点击该链接即可返回到该锚点所在的顶部位置。

```html
<body style="height:2000px;">
    <div id="topAnchor"></div>
    <a href="#topAnchor" style="position:fixed;right:0;bottom:0">回到顶部</a>
</body>
```

## 2、scrollTop

scrollTop属性表示被隐藏在内容区域上方的像素数。

元素未滚动时，scrollTop的值为0，如果元素被垂直滚动了，scrollTop的值大于0，且表示元素上方不可见内容的像素宽度

由于scrollTop是可写的，可以利用scrollTop来实现回到顶部的功能

```html
<body style="height:2000px;">
    <button id="test" style="position:fixed;right:0;bottom:0">回到顶部</button>
    <script>
        test.onclick = function(){
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
    </script>
</body>
```

## 3、scrollTo

scrollTo(x,y)方法滚动当前window中显示的文档，让文档中由坐标x和y指定的点位于显示区域的左上角

设置scrollTo(0,0)可以实现回到顶部的效果

```html
<body style="height:2000px;">
    <button id="test" style="position:fixed;right:0;bottom:0">回到顶部</button>
    <script>
        test.onclick = function(){
            scrollTo(0,0);
        }
    </script>
</body>
```

## 4、scrollBy()

scrollBy(x,y)方法滚动当前window中显示的文档，x和y指定滚动的相对量

只要把当前页面的滚动长度作为参数，逆向滚动，则可以实现回到顶部的效果

```html
<body style="height:2000px;">
    <button id="test" style="position:fixed;right:0;bottom:0">回到顶部</button>
    <script>
        test.onclick = function(){
            var top = document.body.scrollTop || document.documentElement.scrollTop
            scrollBy(0,-top);
        }
    </script>
</body>
```

## 5、scrollIntoView()

Element.scrollIntoView方法滚动当前元素，进入浏览器的可见区域　

该方法可以接受一个布尔值作为参数。如果为true，表示元素的顶部与当前区域的可见部分的顶部对齐（前提是当前区域可滚动）；如果为false，表示元素的底部与当前区域的可见部分的尾部对齐（前提是当前区域可滚动）。如果没有提供该参数，默认为true

使用该方法的原理与使用锚点的原理类似，在页面最上方设置目标元素，当页面滚动时，目标元素被滚动到页面区域以外，点击回到顶部按钮，使目标元素重新回到原来位置，则达到预期效果

```html
<body style="height:2000px;">
    <div id="target"></div>
    <button id="test" style="position:fixed;right:0;bottom:0">回到顶部</button>
    <script>
        test.onclick = function(){
            target.scrollIntoView();
        }
    </script>
</body>
```

</details>

## 29. SPA应用怎么进行SEO？ {#question-c14803df-f552-4a23-b50d-fd8e3f77f17e}

> 难度：3 · 类型：QA

### 题目要点

SPA全名是`Single Page Application`，指的是单页面应用。

<details>
<summary>参考答案</summary>

## 概述

SPA全名是`Single Page Application`，指的是单页面应用。

SEO全称为`Search Engine Optimization`，指的是搜索引擎优化。

SPA技术将产出html的逻辑从服务器转移到了客户端，在进入React, Vue等UI框架进行开发时，我们开发的页面更多的是在客户端进行脚本执行、数据请求和UI动态装载。

那么搜索引擎爬虫在抓取这样的页面的时，在未做任何优化的情况下，通常拿到的是类似下面的字符文本：

```js
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>title</title>
</head>
<body>
<div id="root"></div>
<script src="index.js"></script>
</body>
</html>
```

除了可以事先定义的title（可能title也不能事先确定），在SPA下很多内容需要通过ajax请求server拿到数据通过脚本执行产生。通常爬虫不会有类似浏览器的执行环境去产生这些内容。

那么如何让爬虫拿到的数据和用户通过浏览器看到的数据尽量是一致？

## SPA的优缺点

优点：用户体验好，前后端代码分离，利于后期的维护

缺点：seo不好，首次加载时长比较久，导航需要自己去实现前进后退。

## SPA如何解决SEO的问题

* SSR 服务端渲染

优点：首屏加载快(因为服务器返回的网页已经包含数据, 所以之下载完JS/CSS就可以直接渲染)。每次请求返回的都是一个独立完成的网页, 更利于SEO。

缺点就是服务器压力会比较大，对网络要求比较大，

## 预渲染

无需服务器实时动态编译，采用预渲染，在构建时针对特定路由简单的生成静态HTML文件

本质就是客户端渲染, 只不过和SPA不同的是预渲染有多个界面

最大优点: 由于有多个界面, 所以更利于SEO

最大缺点: 首屏加载慢, 预编译会非常的慢

</details>

## 30. SEO的原理是什么？ {#question-255b920d-ba6d-4e6a-85ac-58c78d2e0773}

> 难度：2.5 · 类型：QA

### 题目要点

搜索引擎排名大致上可以分为四个步骤。

<details>
<summary>参考答案</summary>

搜索引擎排名大致上可以分为四个步骤。

## 爬行和抓取

搜索引擎派出一个能够在网上发现新网页并抓取文件的程序，这个程序通常被称为蜘蛛或机器人。

搜索引擎蜘蛛从数据库中已知的网页开始出发，就像正常用户的浏览器一样访问这些网页并抓取文件。

并且搜索引擎蜘蛛会跟踪网页上的链接，访问更多网页，这个过程就叫爬行。

当通过链接发现有新的网址时，蜘蛛将把新网址记录入数据库等待抓取。

跟踪网页链接是搜索引擎蜘蛛发现新网址的最基本方法，所以反向链接成为搜索引擎优化的最基本因素之一。

没有反向链接，搜索引擎连页面都发现不了，就更谈不上排名了。

搜索引擎蜘蛛抓取的页面文件与用户浏览器得到的完全一样，抓取的文件存入数据库。

## 索引

搜索引擎索引程序把蜘蛛抓取的网页文件分解、分析，并以巨大表格的形式存入数据库，这个过程就是索引。在索引数据库中，网页文字内容，关键词出现的位置、字体、颜色、加粗、斜体等相关信息都有相应记录。

搜索引擎索引数据库存储巨量数据，主流搜索引擎通常都存有几十亿级别的网页。

## 搜索词处理

用户在搜索引擎界面输入关键词，单击“搜索”按钮后，搜索引擎程序即对输入的搜索词进行处理，如中文特有的分词处理，对关键词词序的分别，去除停止词，判断是否需要启动整合搜索，判断是否有拼写错误或错别字等情况。搜索词的处理必须十分快速。

## 排序

对搜索词进行处理后，搜索引擎排序程序开始工作，从索引数据库中找出所有包含搜索词的网页，并且根据排名计算法计算出哪些网页应该排在前面，然后按一定格式返回“搜索”页面。

排序过程虽然在一两秒之内就完成返回用户所要的搜索结果，实际上这是一个非常复杂的过程。排名算法需要实时从索引数据库中找出所有相关页面，实时计算相关性，加入过滤算法，其复杂程度是外人无法想象的。搜索引擎是当今规模最大、最复杂的计算系统之一。

但是即使最好的搜素引擎在鉴别网页上也还无法与人相比，这就是为什么网站需要搜索引擎优化。没有 SEO 的帮助，搜索引擎常常并不能正确返回最相关、最权威、最有用的信息。

</details>

## 31. SEO是什么？ {#question-2aa4ec3d-020c-4c2e-9147-53707afb2d4e}

> 难度：1 · 类型：QA

### 题目要点

SEO（Search Engine Optimization），汉译为搜索引擎优化。

<details>
<summary>参考答案</summary>

SEO（Search Engine Optimization），汉译为搜索引擎优化。

搜索引擎优化是一种利用搜索引擎的搜索规则来提高目前网站在有关搜索引擎内的自然排名的方式。

SEO是指为了从搜索引擎中获得更多的免费流量，从网站结构、内容建设方案、用户互动传播、页面等角度进行合理规划，使网站更适合搜索引擎的索引原则的行为。

</details>

## 32. 前端跨页面通信，你知道哪些方法？ {#question-16cd86d3-cdc5-4c8c-946b-19f72408525f}

> 难度：4 · 类型：QA

### 题目要点

前端跨页面通信的方法主要包括：

1. **Web 存储 API**：使用 `LocalStorage` 存储数据，在不同页面之间共享。
2. **Cookies**：通过设置和读取 Cookie 值在同一域名下的不同页面间传递信息。
3. **PostMessage**：允许在不同的窗口之间发送和接收消息，通过 `origin` 限制接收范围。
4. **Broadcast Channel**：创建频道实现类似发布-订阅模式的通信，适合标签页和 iframe 之间。
5. **SharedWorker**：共享的 Web Worker，允许不同页面通过 `postMessage` 进行双向通信。
6. **IndexedDB**：浏览器提供的客户端数据库，允许在不同页面间存储和共享数据。
7. **WebSockets**：全双工通信通道，适合实时通信，客户端和服务器间实时数据传输。

<details>
<summary>参考答案</summary>

在前端中，有几种方法可用于实现跨页面通信：

1. **LocalStorage**：这个 Web 存储 API 可以在不同页面之间共享数据。一个页面可以将数据存储在本地存储中，另一个页面则可以读取该数据并进行相应处理。通过监听 storage 事件，可以实现数据的实时更新。

2. **Cookies**：使用 Cookies 也可以在不同页面之间传递数据。通过设置和读取 Cookie 值，可以在同一域名下的不同页面之间交换信息。

3. **PostMessage**：`window.postMessage()` 方法允许从一个窗口向另一个窗口发送消息，并在目标窗口上触发 message 事件。通过指定目标窗口的 origin，可以确保只有特定窗口能够接收和处理消息。

4. **Broadcast Channel**：Broadcast Channel API 允许在同一浏览器下的不同上下文（例如，在不同标签页或 iframe 中）之间进行双向通信。它提供了一个类似于发布-订阅模式的机制，通过创建一个广播频道，并在不同上下文中加入该频道，可以实现消息的广播和接收。

5. **SharedWorker**：SharedWorker 是一个可由多个窗口或标签页共享的 Web Worker，它可以在不同页面之间进行跨页面通信。通过 SharedWorker，多个页面可以通过 postMessage 进行双向通信，并共享数据和执行操作。

6. **IndexedDB**：IndexedDB 是浏览器提供的一个客户端数据库，可以在不同页面之间存储和共享数据。通过在一个页面中写入数据，另一个页面可以读取该数据。

7. **WebSockets**：WebSockets 提供了全双工的、双向通信通道，可以在客户端和服务器之间进行实时通信。通过建立 WebSocket 连接，可以在不同页面之间通过服务器传递数据并实现实时更新。

这些方法各有特点，适用于不同的场景。根据具体需求和使用环境，选择合适的跨页面通信方法可以实现数据传递和协作。

</details>

## 33. 如何实现SEO优化 {#question-1aa28332-a1a6-4778-812f-3226a2003614}

> 难度：1 · 类型：QA

### 题目要点

SEO主要分为内部和外部两个方向。

<details>
<summary>参考答案</summary>

SEO主要分为内部和外部两个方向。

## 一、内部优化

* META 标签优化：例如：TITLE，KEYWORDS，DESCRIPTION （TDK）等的优化
* 内部链接的优化，包括相关性链接（Tag 标签），锚文本链接，各导航链接，及图片链接
* 网站内容更新：每天保持站内的更新(主要是文章的更新等)
* 服务器端渲染（SSR）

## 二、外部优化

* 外部链接类别：博客、论坛、B2B、新闻、分类信息、贴吧、知道、百科、相关信息网等尽量保持链接的多样性
* 外链运营：每天添加一定数量的外部链接，使关键词排名稳定提升。
* 外链选择：与一些和你网站相关性比较高,整体质量比较好的网站交换友情链接,巩固稳定关键词排名

</details>

## 34. DNS 预解析是什么？怎么实现？ {#question-d76e76c3-7400-4c6e-958a-b5f00916d47d}

> 难度：2.5 · 类型：QA

### 题目要点

**作答思路：**

DNS预解析（DNS Prefetching）是一种浏览器行为，它会提前解析将来可能需要访问的域名，以加快页面的加载速度。
实现DNS预解析的方法包括：

1. **使用link标签**：在HTML文档的`<head>`部分添加`<link>`标签，指定`rel="dns-prefetch"`属性，指定要预解析的域名。
2. **使用meta标签**：在HTML文档的`<head>`部分添加`<meta>`标签，指定`http-equiv="x-dns-prefetch-control"`属性为`on`，开启DNS预解析。
3. **使用script标签**：在HTML文档的`<head>`部分添加`&lt;script&gt;`标签，指定`src`属性为`dns-prefetch`的URL，指定要预解析的域名。
通过这些方法，浏览器会在HTML文档解析过程中提前解析指定的域名，当需要访问该域名时，可以直接使用解析好的IP地址，从而加快页面的加载速度。

**考察要点**：

1. **DNS预解析概念**：理解DNS预解析的基本概念和用途。
2. **实现方法**：了解如何通过link标签、meta标签和script标签来实现DNS预解析。

<details>
<summary>参考答案</summary>

## DNS优化

在介绍`dns-prefetch`之前，先要提下当前对于DNS优化主流方法。<br>

一般来说，一次DNS解析需要耗费 20-120ms，所以为了优化DNS，我们可以考虑两个方向：
1. 减少DNS请求次数
2. 缩短DNS解析时间`dns-prefetch`

## 什么是dns-prefetch？
`dns-prefetch`(**DNS预获取**)是前端网络性能优化的一种措施。它根据浏览器定义的规则，**提前解析**之后可能会用到的域名，使解析结果**缓存到系统缓存**中，缩短DNS解析时间，进而提高网站的访问速度。

## 为什么要用dns-prefetch？
每当浏览器从（第三方）服务器发送一次请求时，都要先通过**DNS解析**将该跨域域名解析为 IP地址，然后浏览器才能发出请求。<br>

如果某一时间内，有多个请求都发送给同一个服务器，那么DNS解析会多次并且重复触发。这样会导致整体的网页加载有延迟的情况。<br>

我们知道，虽然DNS解析占用不了多大带宽，但是它会产生很高的延迟，尤其是对于移动网络会更为明显。<br>

因此，为了减少DNS解析产生的延迟，我们可以通过`dns-prefetch`预解析技术有效地缩短DNS解析时间。

```
<link rel="dns-prefetch" href="https://baidu.com/">
```
## dns-prefetch背后原理
当浏览器访问一个域名的时候，需要解析一次DNS，获得对应域名的ip地址。
在解析过程中，按照:
- 浏览器缓存
- 系统缓存
- 路由器缓存
- ISP(运营商)DNS缓存
- 根域名服务器
- 顶级域名服务器
- 主域名服务器

的顺序逐步读取缓存，直到拿到IP地址。

`dns-prefetch`就是在**将解析后的IP缓存在系统中**。<br>

这样，`dns-prefetch`就有效地缩短了DNS解析时间。因为，在本地操作系统做了DNS缓存，使得DNS在解析的过程中，提前在系统缓存中找到了对应IP。<br>

这样一来， 后续的解析步骤就不用执行了，进而也就缩短了DNS解析时间。

假如浏览器**首次将一个域名解析为IP地址**，并**缓存至操作系统**，那么下一次DNS解析时间可以低至**0-1ms**。<br>

倘若结果不缓存在系统，那么就需要读取**路由器的缓存**，进而后续的解析时间最小也要约**15ms**。<br>

如果路由器缓存也不存在，则需要读取**ISP（运营商）DNS缓存**，一般像`taobao.com`、`baidu.com`这些常见的域名，读取ISP（运营商）DNS缓存需要的时间在**80-120ms**，如果是不常见的域名，平均需要**200-300ms**。<br>

一般来说，大部分的网站到运营商这块都能找到IP。<br>

那也就是说，`dns-prefetch`可以给DNS解析过程带来15-300ms的提升，尤其是一些大量引用很多其他域名资源的网站，提升效果就更加明显了

## 浏览器DNS缓存与dns-prefetch

现代浏览器为了优化DNS解析，也设有了浏览器DNS缓存。<br>

每当在首次DNS解析后会对其IP进行缓存。至于缓存时长，每种浏览器都不一样，比如Chrome的过期时间是1分钟，在这个期限内不会重新请求DNS。
> Tip:<br>
> 每当Chrome浏览器启动的时候，就会自动的快速解析浏览器最近一次启动时记录的前10个域名。所以经常访问的网址就不存在DNS解析的延迟，进而打开速度更快。

而`dns-prefetch` 相当于在浏览器缓存之后，在本地操作系统中做了DNS缓存，个人理解，为的是给浏览器缓存做保障，尽量让DNS解析出本地，以此来做了又一层DNS解析优化。<br>

一般来说，DNS在系统的缓存时间是大于浏览器的。

### 浏览器与系统DNS缓存时间

> TTL(Time-To-Live)，就是一条域名解析记录在DNS服务器中的存留时间<br>
>
- **浏览器DNS缓存的时间跟DNS服务器返回的TTL值无关**, 它的缓存时间取决于浏览器自身设置。<br>

- **系统缓存会参考DNS服务器响应的TTL值，但是不完全等于TTL值**。

国内和国际上很多平台的TTL值都是以秒为单位的，很多的默认值都是3600，也就是默认缓存1小时。

## `dns-prefetch`缺点

`dns-prefetch`最大的缺点就是使用它太多。<br>

过多的预获取会导致过量的DNS解析，对网络是一种负担。

## 最佳实践

请记住以下三点：

1. `dns-prefetch` 仅对[跨域](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)域上的 DNS查找有效，因此请避免使用它来指向相同域。这是因为，到浏览器看到提示时，您站点域背后的IP已经被解析。

2. 除了link 还可以通过使用 [HTTP链接字段](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Link)将 `dns-prefetch`（以及其他资源提示）指定为 [HTTP标头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers)：

```
Link: <https://fonts.gstatic.com/>; rel=dns-prefetch
```

3. 考虑将 `dns-prefetch` 与 `preconnect(`预连接`)`提示配对。

由于`dns-prefetch` 仅执行 DNS查找，不像`preconnect` 会建立与服务器的连接。<br>

如果站点是通过HTTPS服务的，两者的组合会涵盖DNS解析，建立TCP连接以及执行TLS握手。将两者结合起来可提供进一步减少[跨域请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)的感知延迟的机会。如下所示：

```
<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
<link rel="dns-prefetch" href="https://fonts.gstatic.com/">
```

**Note**: 如果页面需要建立与许多第三方域的连接，则将它们预先连接会适得其反。 `preconnect` 提示最好仅用于最关键的连接。对于其他的，只需使用 `<link rel="dns-prefetch">` 即可节省第一步的时间DNS查找。

</details>

## 35. HTML5 有哪些 drag 相关的 API ？ {#question-969cddcd-b1ac-4285-86f6-ae0a8eaf828a}

> 难度：1.5 · 类型：QA

### 题目要点

HTML5 的拖拽 API 提供了一种标准化的方式来实现拖拽操作，支持从元素的拖拽到目标区域的放置。通过合理使用拖拽事件和 `dataTransfer` 对象，可以实现丰富的用户交互体验。虽然拖拽 API 提供了强大的功能，但在复杂的实现中需要注意浏览器兼容性和复杂的事件处理。

<details>
<summary>参考答案</summary>

HTML5 的拖拽（Drag and Drop）API 允许用户通过拖拽操作在网页上移动元素或数据。这个 API 是在 HTML5 中引入的，它提供了一种标准的方式来实现拖拽功能。以下是对 HTML5 拖拽 API 的详细介绍：

### 基本概念

- **拖拽源（Drag Source）**：可以被拖拽的元素。通过设置 `draggable` 属性为 `true`，元素可以成为拖拽源。
- **拖拽目标（Drop Target）**：接受被拖拽元素的区域。拖拽源元素被拖拽到目标区域时，目标区域会处理拖拽操作。

### 主要步骤

1. **使元素可拖拽**：
   - 在需要拖拽的元素上设置 `draggable="true"` 属性。

2. **处理拖拽事件**：
   - **`dragstart`**：当拖拽操作开始时触发。通常用于设置拖拽数据。
   - **`drag`**：在拖拽过程中不断触发。用于提供实时反馈。
   - **`dragend`**：拖拽操作结束时触发。用于清理或更新 UI。

3. **处理拖拽目标**：
   - **`dragenter`**：当拖拽元素进入目标区域时触发。
   - **`dragover`**：当拖拽元素悬停在目标区域上方时触发。必须调用 `event.preventDefault()` 才能接受拖拽。
   - **`dragleave`**：当拖拽元素离开目标区域时触发。
   - **`drop`**：当拖拽元素在目标区域放下时触发。用于处理放置逻辑。

### 示例代码

**HTML**：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML5 Drag and Drop</title>
    <style>
        #drag-source {
            width: 100px;
            height: 100px;
            background-color: lightblue;
            margin: 20px;
            text-align: center;
            line-height: 100px;
            cursor: move;
        }
        #drop-target {
            width: 200px;
            height: 200px;
            background-color: lightgreen;
            border: 2px dashed gray;
            margin: 20px;
            text-align: center;
            line-height: 200px;
        }
    </style>
</head>
<body>
    <div id="drag-source" draggable="true">Drag me</div>
    <div id="drop-target">Drop here</div>

    <script>
        const dragSource = document.getElementById('drag-source');
        const dropTarget = document.getElementById('drop-target');

        // Drag start event
        dragSource.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', 'Dragged data');
        });

        // Drag over event
        dropTarget.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessary to allow dropping
            dropTarget.style.backgroundColor = 'lightyellow';
        });

        // Drag leave event
        dropTarget.addEventListener('dragleave', () => {
            dropTarget.style.backgroundColor = 'lightgreen';
        });

        // Drop event
        dropTarget.addEventListener('drop', (event) => {
            event.preventDefault();
            dropTarget.style.backgroundColor = 'lightgreen';
            const data = event.dataTransfer.getData('text/plain');
            dropTarget.textContent = `Dropped: ${data}`;
        });
    </script>
</body>
</html>
```

### 关键点

1. **`draggable` 属性**：使元素可以被拖拽。设置 `draggable="true"` 启用拖拽。
2. **`dataTransfer` 对象**：在 `dragstart` 事件中使用 `event.dataTransfer` 设置和获取拖拽数据。
3. **`preventDefault()`**：在 `dragover` 事件中调用 `event.preventDefault()` 允许放置操作。
4. **事件处理**：通过监听不同的拖拽事件来实现自定义的拖拽行为。

### 优点

- **标准化**：HTML5 拖拽 API 提供了浏览器一致的拖拽行为，避免了以前自定义拖拽实现的不一致性。
- **简洁**：使用标准的事件处理方式实现拖拽功能，无需依赖第三方库。

### 缺点

- **兼容性**：虽然现代浏览器都支持 HTML5 拖拽 API，但旧版浏览器和某些环境可能不完全支持。
- **复杂性**：处理拖拽事件可能涉及较多的事件监听和状态管理，特别是在复杂的应用中。

</details>

## 36. 浏览器乱码的原因是什么？如何解决？ {#question-8e135d77-c081-4419-b0b3-2e43461d5b55}

> 难度：3 · 类型：QA

### 题目要点

**产生乱码的原因：**

<details>
<summary>参考答案</summary>

**产生乱码的原因：**

- 网页源代码是`gbk`的编码，而内容中的中文字是`utf-8`编码的，这样浏览器打开即会出现`html`乱码，反之也会出现乱码；
- `html`网页编码是`gbk`，而程序从数据库中调出呈现是`utf-8`编码的内容也会造成编码乱码；
- 浏览器不能自动检测网页编码，造成网页乱码。

**解决办法：**

- 使用软件编辑HTML网页内容；
- 如果网页设置编码是`gbk`，而数据库储存数据编码格式是`UTF-8`，此时需要程序查询数据库数据显示数据前进程序转码；
- 如果浏览器浏览时候出现网页乱码，在浏览器中找到转换编码的菜单进行转换。

</details>

## 37. Canvas和SVG有什么区别？ {#question-c8a51567-945f-461d-b632-0209dd1917f5}

> 难度：2 · 类型：QA

### 题目要点

**（1）SVG：** SVG可缩放矢量图形（Scalable Vector Graphics）是基于可扩展标记语言XML描述的2D图形的语言，SVG基于XML就意味着SVG DOM中的每个元素都是可用的，可以为某个元素附加Javascript事件处理器。在 SVG 中，每个被绘制的图形均被视为对象。如果 SVG 对象的属性发生变化，那么浏览器能够自动重现图形。

<details>
<summary>参考答案</summary>

**（1）SVG：**
SVG可缩放矢量图形（Scalable Vector Graphics）是基于可扩展标记语言XML描述的2D图形的语言，SVG基于XML就意味着SVG DOM中的每个元素都是可用的，可以为某个元素附加Javascript事件处理器。在 SVG 中，每个被绘制的图形均被视为对象。如果 SVG 对象的属性发生变化，那么浏览器能够自动重现图形。

其特点如下：

- 不依赖分辨率
- 支持事件处理器
- 最适合带有大型渲染区域的应用程序（比如谷歌地图）
- 复杂度高会减慢渲染速度（任何过度使用 DOM 的应用都不快）
- 不适合游戏应用

**（2）Canvas：**
Canvas是画布，通过Javascript来绘制2D图形，是逐像素进行渲染的。其位置发生改变，就会重新进行绘制。

其特点如下：

- 依赖分辨率
- 不支持事件处理器
- 弱的文本渲染能力
- 能够以 .png 或 .jpg 格式保存结果图像
- 最适合图像密集型的游戏，其中的许多对象会被频繁重绘

注：矢量图，也称为面向对象的图像或绘图图像，在数学上定义为一系列由线连接的点。矢量文件中的图形元素称为对象。每个对象都是一个自成一体的实体，它具有颜色、形状、轮廓、大小和屏幕位置等属性。

</details>

## 38. title与h1的区别、b与strong的区别、i与em的区别？ {#question-ddcf6ea7-290c-4ab1-9b5c-d77f08c9771d}

> 难度：0.5 · 类型：QA

### 题目要点

在 HTML 中，title、h1、b、strong、i 和 em 都是文本相关的标记，它们之间有一些相似之处，但也有一些重要的区别。

<details>
<summary>参考答案</summary>

在 HTML 中，title、h1、b、strong、i 和 em 都是文本相关的标记，它们之间有一些相似之处，但也有一些重要的区别。

## title 和 h1 的区别

1. 用途不同：title 标签用于定义 HTML 文档的标题，通常会显示在浏览器的标签页上或者窗口的标题栏上，对于搜索引擎优化（SEO）也非常重要。而 h1 标签用于表示文档的主标题，通常显示在页面内容区域的顶部。

2. 所在位置不同：title 标签应该放在 `<head>` 标签内，而 h1 标签则应该放在 `<body>` 标签内。

3. 格式和样式不同：title 标签中的文本通常比较短，并且不需要进行格式化、排版等操作；而 h1 标签中的文本通常比较长，并且需要进行合适的格式化、排版和样式设置，以便使其适应页面布局和设计风格。

## b 和 strong 的区别

b 标记用于指定文本加粗的外观效果，通常只是为了强调关键词或短语，没有特别强的语义化含义。而 strong 标记则表示文本的强调重点，具有更强的语义化含义，并且可以改变文本的语调和读音等方面。

## i 和 em 的区别

i 标记用于指定文本斜体的外观效果，通常只是为了强调关键词或短语，没有特别强的语义化含义。而 em 标记则表示文本的重要性，具有更强的语义化含义，并且可以改变文本的语调和读音等方面。

## 最后

需要注意的是，在 HTML5 中，b 和 i 标记已经被废弃，推荐使用 strong 和 em 标记来代替。同时，随着搜索引擎的发展和语义化网页的兴起，h1-h6 标记也被赋予了更重要的语义化含义，应该根据具体情况来选择使用不同的标记。

</details>

## 39. 浏览器是如何对 HTML5 的离线储存资源进行管理和加载？ {#question-93ffefee-3471-48a5-b60c-1b7adf8edf13}

> 难度：1.5 · 类型：QA

### 题目要点

**在线的情况下**，浏览器发现 html 头部有 manifest 属性，它会请求 manifest 文件，如果是第一次访问页面 ，那么浏览器就会根据 manifest 文件的内容下载相应的资源并且进行离线存储。如果已经访问过页面并且资源已经进行离线存储了，那么浏览器就会使用离线的资源加载页面，然后浏览器会对比新的 manifest 文件与旧的 manifest 文件，如果文件没有发生改变，就不做任何操作，如果文件改变了，就会重新下载文件中的资源并进行离线存储。

<details>
<summary>参考答案</summary>

- **在线的情况下**，浏览器发现 html 头部有 manifest 属性，它会请求 manifest 文件，如果是第一次访问页面 ，那么浏览器就会根据 manifest 文件的内容下载相应的资源并且进行离线存储。如果已经访问过页面并且资源已经进行离线存储了，那么浏览器就会使用离线的资源加载页面，然后浏览器会对比新的 manifest 文件与旧的 manifest 文件，如果文件没有发生改变，就不做任何操作，如果文件改变了，就会重新下载文件中的资源并进行离线存储。
- **离线的情况下**，浏览器会直接使用离线存储的资源。

</details>

## 40. HTML5的离线储存怎么使用，它的工作原理是什么 {#question-d2d8725c-7941-4ba8-9b92-67a730fa1097}

> 难度：2.5 · 类型：QA

### 题目要点

离线存储指的是：在用户没有与因特网连接时，可以正常访问站点或应用，在用户与因特网连接时，更新用户机器上的缓存文件。

<details>
<summary>参考答案</summary>

离线存储指的是：在用户没有与因特网连接时，可以正常访问站点或应用，在用户与因特网连接时，更新用户机器上的缓存文件。

**原理：**HTML5的离线存储是基于一个新建的 `.appcache` 文件的缓存机制(不是存储技术)，通过这个文件上的解析清单离线存储资源，这些资源就会像cookie一样被存储了下来。之后当网络在处于离线状态下时，浏览器会通过被离线存储的数据进行页面展示

**使用方法：**
（1）创建一个和 html 同名的 manifest 文件，然后在页面头部加入 manifest 属性：

```html
<html lang="en" manifest="index.manifest">
```

（2）在 `cache.manifest` 文件中编写需要离线存储的资源：

```html
CACHE MANIFEST
    #v0.11
    CACHE:
    js/app.js
    css/style.css
    NETWORK:
    resourse/logo.png
    FALLBACK:
    / /offline.html
```

- **CACHE**: 表示需要离线存储的资源列表，由于包含 manifest 文件的页面将被自动离线存储，所以不需要把页面自身也列出来。
- **NETWORK**: 表示在它下面列出来的资源只有在在线的情况下才能访问，他们不会被离线存储，所以在离线情况下无法使用这些资源。不过，如果在 CACHE 和 NETWORK 中有一个相同的资源，那么这个资源还是会被离线存储，也就是说 CACHE 的优先级更高。
- **FALLBACK**: 表示如果访问第一个资源失败，那么就使用第二个资源来替换他，比如上面这个文件表示的就是如果访问根目录下任何一个资源失败了，那么就去访问 offline.html 。

（3）在离线状态时，操作 `window.applicationCache` 进行离线缓存的操作。

**如何更新缓存：**

（1）更新 manifest 文件

 （2）通过 javascript 操作

 （3）清除浏览器缓存

**注意事项：**

 （1）浏览器对缓存数据的容量限制可能不太一样（某些浏览器设置的限制是每个站点 5MB）。

 （2）如果 manifest 文件，或者内部列举的某一个文件不能正常下载，整个更新过程都将失败，浏览器继续全部使用老的缓存。

 （3）引用 manifest 的 html 必须与 manifest 文件同源，在同一个域下。

 （4）FALLBACK 中的资源必须和 manifest 文件同源。

 （5）当一个资源被缓存后，该浏览器直接请求这个绝对路径也会访问缓存中的资源。

 （6）站点中的其他页面即使没有设置 manifest 属性，请求的资源如果在缓存中也从缓存中访问。

（7）当 manifest 文件发生改变时，资源请求本身也会触发更新。

</details>

## 41. img的srcset属性的作⽤？ {#question-072b9f8d-7383-4823-9508-77e4e9d1744c}

> 难度：1 · 类型：QA

### 题目要点

响应式页面中经常用到根据屏幕密度设置不同的图片。这时就用到了 img 标签的srcset属性。srcset属性用于设置不同屏幕密度下，img 会自动加载不同的图片。用法如下：

<details>
<summary>参考答案</summary>

响应式页面中经常用到根据屏幕密度设置不同的图片。这时就用到了 img 标签的srcset属性。srcset属性用于设置不同屏幕密度下，img 会自动加载不同的图片。用法如下：

```html
<img src="image-128.png" srcset="image-256.png 2x" />
```

使用上面的代码，就能实现在屏幕密度为1x的情况下加载image-128.png, 屏幕密度为2x时加载image-256.png。

按照上面的实现，不同的屏幕密度都要设置图片地址，目前的屏幕密度有1x,2x,3x,4x四种，如果每一个图片都设置4张图片，加载就会很慢。所以就有了新的srcset标准。代码如下：

```html
<img src="image-128.png"
     srcset="image-128.png 128w, image-256.png 256w, image-512.png 512w"
     sizes="(max-width: 360px) 340px, 128px" />
```

其中srcset指定图片的地址和对应的图片质量。sizes用来设置图片的尺寸零界点。对于 srcset 中的 w 单位，可以理解成图片质量。如果可视区域小于这个质量的值，就可以使用。浏览器会自动选择一个最小的可用图片。

sizes语法如下：

```html
sizes="[media query] [length], [media query] [length] ... "
```

sizes就是指默认显示128px, 如果视区宽度大于360px, 则显示340px。

</details>

## 42. js和css是否阻塞DOM树构建和渲染？ {#question-9c119d14-fe3b-4f23-9a51-222c50529890}

> 难度：3 · 类型：QA

### 题目要点

JavaScript (JS) 和层叠样式表 (CSS) 都可能以不同的方式影响 DOM（文档对象模型）树的构建和渲染过程。

#### CSS 对 DOM 树构建的影响

1. **阻塞渲染**：
   - CSS 会阻塞 DOM 的解析和渲染。浏览器必须在构建 DOM 树时获取到 CSS，以便正确渲染页面。
   - 这被称为“渲染阻塞资源”，因为浏览器会等待 CSS 加载完成才能进行渲染。

2. **关键渲染路径**：
   - CSS 是关键渲染路径的一部分，直接影响页面的首次渲染时间。

3. **异步加载**：
   - 如果 CSS 文件被标记为异步加载（`async` 或 `defer`），它们不会阻塞 DOM 的解析，但会影响渲染。

#### JS 对 DOM 树构建的影响

1. **阻塞 DOM 解析**：
   - 内联 JavaScript（直接在 HTML 中编写的 JS）会阻塞 DOM 解析，直到脚本执行完成。
   - 外部 JavaScript 文件如果被放置在文档头部，也会阻塞 DOM 解析，直到文件下载并执行完成。

2. **修改 DOM**：
   - JS 可以在 DOM 解析完成后修改 DOM 树，这可能会触发重新渲染和重排。

3. **异步 JavaScript**：
   - 使用 `async` 或 `defer` 属性的外部 JS 文件可以异步加载，不会阻塞 DOM 解析，但会影响 DOM 的最终渲染。

4. **DOMContentLoaded 事件**：
   - `DOMContentLoaded` 事件在 DOM 树构建完成但不包括 CSS 和图片等资源时触发，可以用于执行不依赖于 CSS 的 JS 代码。

#### 考察重点

- 理解：CSS 和 JS 如何影响 DOM 树的构建和渲染。
- 优化：知道如何通过异步加载或延迟执行 JS 和 CSS 来优化页面加载性能。

<details>
<summary>参考答案</summary>

先做个总结，然后再进行具体的分析：

CSS不会阻塞DOM的解析，但是会影响JAVAScript的运行，javascript会阻止DOM树的解析，最终css（CSSOM）会影响DOM树的渲染，也可以说最终会影响渲染树的生成。

接下来我们先看javascript对DOM树构建和渲染是如何造成影响的，分成三种类型来讲解：

## JavaScript脚本在html页面中

```html
<html>
  <body>
    <div>1</div>
    <script>
      let div1 = document.getElementsByTagName('div')[0]
      div1.innerText = 'time.geekbang'
    </script>
    <div>test</div>
  </body>
</html>
```

两段div中间插入一段JavaScript脚本，这段脚本的解析过程就有点不一样了。

当解析到script脚本标签时，HTML解析器暂停工作，javascript引擎介入，并执行script标签中的这段脚本。

因为这段javascript脚本修改了DOM中第一个div中的内容，所以执行这段脚本之后，div节点内容已经修改为time.geekbang了。脚本执行完成之后，HTML解析器回复解析过程，继续解析后续的内容，直至生成最终的DOM。

## html页面中引入javaScript文件

```js
//foo.js
let div1 = document.getElementsByTagName('div')[0]
div1.innerText = 'time.geekbang'
```

```html
<html>
  <body>
    <div>1</div>
    <script type="text/javascript" src='foo.js'></script>
    <div>test</div>
  </body>
</html>
```

这段代码的功能还是和前面那段代码是一样的，只是把内嵌JavaScript脚本修改成了通过javaScript文件加载。

其整个执行流程还是一样的，执行到JAVAScript标签时，暂停整个DOM的解析，执行javascript代码，不过这里执行javascript时，需要现在在这段代码。这里需要重点关注下载环境，因为javascript文件的下载过程会阻塞DOM解析，而通常下载又是非常耗时的，会受到网络环境、javascript文件大小等因素的影响。

优化机制：

谷歌浏览器做了很多优化，其中一个主要的优化就是预解析操作。当渲染引擎收到字节流之后，会开启一个预解析线程，用来分析HTML文件中包含的JavaScript、CSS等相关文件，解析到相关文件之后，会开启一个预解析线程，用来分析HTML文件中包含的javascprit、css等相关文件、解析到相关文件之后，预解析线程会提前下载这些文件。

再回到 DOM 解析上，我们知道引入 JavaScript 线程会阻塞 DOM，不过也有一些相关的策略来规避，比如使用 CDN 来加速 JavaScript 文件的加载，压缩 JavaScript 文件的体积。

另外，如果 JavaScript 文件中没有操作 DOM 相关代码，就可以将该 JavaScript 脚本设置为异步加载，通过 async 或 defer 来标记代码，使用方式如下所示：

```
<script async type="text/javascript" src='foo.js'></script>
<script defer type="text/javascript" src='foo.js'></script>
```

async和defer区别：

* async：脚本并行加载，加载完成之后立即执行，执行时机不确定，仍有可能阻塞HTML解析，执行时机在load事件派发之前。
* defer：脚本并行加载，等待HTML解析完成之后，按照加载顺序执行脚本，执行时机DOMContentLoaded事件派发之前。

## html页面中有css样式

```css
//theme.css
div {color:blue}
```

```html
<html>
<head>
    <style src='theme.css'></style>
</head>
<body>
  <div>1</div>
  <script>
      let div1 = document.getElementsByTagName('div')[0]
      div1.innerText = 'time.geekbang' // 需要 DOM
      div1.style.color = 'red' // 需要 CSSOM
  </script>
  <div>test</div>
</body>
</html>
```

该示例中，JavaScript 代码出现了 `div1.style.color = ‘red’` 的语句，它是用来操纵 CSSOM 的，所以在执行 JavaScript 之前，需要先解析 JavaScript 语句之上所有的CSS 样式。所以如果代码里引用了外部的 CSS 文件，那么在执行 JavaScript 之前，还需要等待外部的 CSS 文件下载完成，并解析生成 CSSOM 对象之后，才能执行 JavaScript 脚本。

而 JavaScript 引擎在解析 JavaScript 之前，是不知道 JavaScript 是否操纵了 CSSOM的，所以渲染引擎在遇到 JavaScript 脚本时，不管该脚本是否操纵了 CSSOM，都会执行CSS 文件下载，解析操作，再执行 JavaScript 脚本。所以说 JavaScript 脚本是依赖样式表的，这又多了一个阻塞过程。

总结：通过上面三点的分析，我们知道了 JavaScript 会阻塞 DOM 生成，而样式文件又会阻塞js的执行。

</details>

## 43. CSSOM树和DOM树是同时解析的吗？ {#question-9f396d9a-43dc-4f39-a53a-3d25fa1cf348}

> 难度：1 · 类型：QA

### 题目要点

浏览器会下下载HTML解析页面生成DOM树，遇到CSS标签就开始解析CSS，这个过程不会阻塞，但是如果遇到了JS脚本，此时假如CSSOM还没有构建完，需要等待CSSOM构建完，再去执行JS脚本，然后再执行DOM解析，此时会阻塞。

<details>
<summary>参考答案</summary>

浏览器会下下载HTML解析页面生成DOM树，遇到CSS标签就开始解析CSS，这个过程不会阻塞，但是如果遇到了JS脚本，此时假如CSSOM还没有构建完，需要等待CSSOM构建完，再去执行JS脚本，然后再执行DOM解析，此时会阻塞。

</details>

## 44. 使用input标签上传图片时，怎样触发默认拍照功能？ {#question-a7e1aeb6-aaf9-43fe-92ac-fd574fb60a96}

> 难度：1 · 类型：QA

### 题目要点

capture 属性用于指定文件上传控件中媒体拍摄的方式。

<details>
<summary>参考答案</summary>

capture 属性用于指定文件上传控件中媒体拍摄的方式。

可选值：
* user 前置
* environment 后置
* camera 相机
* camcorder 摄像机
* microphone 录音

```html
<input type='file' accept='image/*;' capture='camera'>
```

</details>

## 45. input上传文件可以同时选择多张吗？怎么设置？ {#question-1934d168-5248-425b-9648-2c14f2b4f570}

> 难度：1 · 类型：QA

### 题目要点

可以，通过给input标签设置multiple属性。

<details>
<summary>参考答案</summary>

可以，通过给input标签设置multiple属性。

```html
<input type="file" name="files" multiple/>
```

</details>

## 46. 如何禁止input展示输入的历史记录？ {#question-9d0e350c-5b48-4122-b54c-dc55552ccc05}

> 难度：1 · 类型：QA

### 题目要点

在输入input时会提示原来输入过的内容，还会出现下拉的历史记录，禁止这种情况只需在input中加入： autocomplete=“off”

<details>
<summary>参考答案</summary>

在输入input时会提示原来输入过的内容，还会出现下拉的历史记录，禁止这种情况只需在input中加入： autocomplete=“off”

```html
<input type="text"  autocomplete="off" />
```

autocomplete 属性是用来规定输入字段是否启用自动完成的功能。

</details>

## 47. 能否使用自闭合script标签引入脚本文件? {#question-1592fd61-1555-4646-a2a0-438828b5b8e5}

> 难度：1 · 类型：QA

### 题目要点

不能。自闭合标签来自于XML语法，而不是HTML语法。

<details>
<summary>参考答案</summary>

不能。自闭合标签来自于XML语法，而不是HTML语法。

根据现在的HTML语法，只有不需要结束标签的void element（如img之类的），或者是外部元素（如svg）可以使用自闭合。script标签显然不在此列。

 ```html
 // 正确写法
 <script src="..."></script>

 // 错误写法
 <script src="..."/>
 ```

</details>

## 48. iconfont是什么？有什么优缺点？ {#question-ece0e4b9-112c-4d3c-934c-822e8807fe46}

> 难度：1 · 类型：QA

### 题目要点

顾名思义，IconFont 就是字体图标。严格地说，就是一种字体，但是，它们不包含字母或数字，而是包含符号和字形。您可以使用 CSS 设置样式，就像设置常规文本一样，这使得 IconFont 成为 Web 开发时图标的热门选择。

<details>
<summary>参考答案</summary>

## 什么是 IconFont

> 顾名思义，IconFont 就是字体图标。严格地说，就是一种字体，但是，它们不包含字母或数字，而是包含符号和字形。您可以使用 CSS 设置样式，就像设置常规文本一样，这使得 IconFont 成为 Web 开发时图标的热门选择。

## 优点

* 可以方便地将任何 CSS 效果应用于它们。
* 因为它们是矢量图形，所以它们是可伸缩的。这意味着我们可以在不降低质量的情况下伸缩它们。
* 我们只需要发送一个或少量 HTTP 请求来加载它们，而不是像图片，可能需要多个 HTTP 请求。
* 由于尺寸小，它们加载速度快。
* 它们在所有浏览器中都得到支持（甚至支持到 IE6）。

## 不足

* 不能用来显示复杂图像
* 通常只限于一种颜色，除非应用一些 CSS 技巧
* 字体图标通常是根据特定的网格设计的，例如 16x16, 32×32, 48×48等。如果由于某种原因将网格系统改为25×25，可能不会得到清晰的结果

</details>

## 49. 页面统计数据中，常用的 PV、UV 指标分别是什么？ {#question-f6e033d6-6e6e-4613-ad8d-a4340c3380a0}

> 难度：0.5 · 类型：QA

### 题目要点

即页面浏览量或点击量，用户每1次对网站中的每个网页访问均被记录1个PV。

<details>
<summary>参考答案</summary>

## PV(页面访问量)

即页面浏览量或点击量，用户每1次对网站中的每个网页访问均被记录1个PV。

用户对同一页面的多次访问，访问量累计，用以衡量网站用户访问的网页数量。

##  UV(独立访客)

是指通过互联网访问、浏览这个网页的自然人。访问您网站的一台电脑客户端为一个访客。

00:00-24:00内相同的客户端只被计算一次。

</details>

## 50. 什么是 DOM 和 BOM？ {#question-6b6a6323-32e3-4082-91a4-d431a88436d9}

> 难度：1 · 类型：QA

### 题目要点

DOM（Document Object Model）和 BOM（Browser Object Model）是 JavaScript 中常用的两个概念，用于描述浏览器中的不同对象模型。

<details>
<summary>参考答案</summary>

DOM（Document Object Model）和 BOM（Browser Object Model）是 JavaScript 中常用的两个概念，用于描述浏览器中的不同对象模型。

1. **DOM（Document Object Model）**:
   - DOM 是表示 HTML 和 XML 文档的标准的对象模型。它将文档中的每个组件（如元素、属性、文本等）都看作是一个对象，开发者可以使用 JavaScript 来操作这些对象，从而动态地改变页面的内容、结构和样式。
   - DOM 以树状结构组织文档的内容，其中树的根节点是 `document` 对象，它代表整个文档。`document` 对象有各种方法和属性，可以用来访问和修改文档的内容和结构。

2. **BOM（Browser Object Model）**:
   - BOM 是表示浏览器窗口及其各个组件的对象模型。它提供了一组对象，用于访问和控制浏览器窗口及其各个部分，如地址栏、历史记录等。
   - BOM 的核心对象是 `window` 对象，它表示浏览器窗口，并且是 JavaScript 中的全局对象。`window` 对象提供了许多属性和方法，用于控制浏览器窗口的各个方面，如页面导航、定时器、对话框等。
   - BOM 还提供了其他一些对象，如 `navigator`（提供浏览器相关信息）、`location`（提供当前文档的 URL 信息）、`history`（提供浏览器历史记录）、`screen`（提供屏幕信息）等。

总的来说，DOM 是用于访问和操作网页文档的对象模型，而 BOM 是用于控制浏览器窗口及其各个组件的对象模型。在 JavaScript 编程中，开发者通常会同时使用 DOM 和 BOM 来完成各种任务，如操作网页元素、导航控制、事件处理等。

</details>

## 51. 说说你对以下几个页面生命周期事件的理解：DOMContentLoaded，load，beforeunload，unload {#question-43dad801-6c42-4638-9006-2c51a7cf0c91}

> 难度：1.5 · 类型：QA

### 题目要点

### HTML 页面生命周期事件

- **DOMContentLoaded**：当浏览器已完全加载 HTML 并构建了 DOM 树，但外部资源（如图片、样式表）可能尚未加载完成时触发。
- **load**：当浏览器不仅加载完成了 HTML，还加载完成了所有外部资源时触发。
- **beforeunload/unload**：当用户正在离开页面时触发。

### DOMContentLoaded 和脚本

- **阻塞规则**：
  - 普通脚本（无 `async` 或 `defer` 属性）会阻塞 `DOMContentLoaded`。
  - `async` 脚本和动态创建的脚本不会阻塞 `DOMContentLoaded`。

### DOMContentLoaded 和样式

- **样式加载**：
  - 外部样式表不会阻塞 `DOMContentLoaded`。
  - 但在样式表加载完成后，后续的脚本会阻塞 `DOMContentLoaded`，因为脚本可能需要样式信息。

### 浏览器内建的自动填充

- **表单自动填充**：
  - Firefox、Chrome 和 Opera 会在 `DOMContentLoaded` 事件中自动填充表单。
  - 但如果 `DOMContentLoaded` 被长时间脚本延迟，自动填充也会延迟。

### window.onload

- **页面加载完成**：
  - 当整个页面，包括样式、图片等资源被加载完成时触发。
  - 较少使用，因为通常不需要等待整个页面加载。

### window.onunload

- **用户离开页面**：
  - 当用户离开页面时触发。
  - 适用于不涉及延迟的操作，如发送统计数据。

### navigator.sendBeacon

- **后台数据发送**：
  - 在用户离开页面时，可以在后台发送数据，如分析数据。
  - 即使浏览器已经离开文档，请求仍在执行。

### window.onbeforeunload

- **用户离开前的确认**：
  - 当用户触发了离开页面的导航或试图关闭窗口时触发。
  - 用于在用户离开前询问确认。

<details>
<summary>参考答案</summary>

HTML 页面的生命周期包含三个重要事件：

* DOMContentLoaded —— 浏览器已完全加载 HTML，并构建了 DOM 树，但像 `<img>` 和样式表之类的外部资源可能尚未加载完成。
* load —— 浏览器不仅加载完成了 HTML，还加载完成了所有外部资源：图片，样式等。
* beforeunload/unload —— 当用户正在离开页面时。

每个事件都是有用的：

* DOMContentLoaded 事件 —— DOM 已经就绪，因此处理程序可以查找 DOM 节点，并初始化接口。
* load 事件 —— 外部资源已加载完成，样式已被应用，图片大小也已知了。
* beforeunload 事件 —— 用户正在离开：我们可以检查用户是否保存了更改，并询问他是否真的要离开。
* unload 事件 —— 用户几乎已经离开了，但是我们仍然可以启动一些操作，例如发送统计数据。

## DOMContentLoaded 和脚本

当浏览器处理一个 HTML 文档，并在文档中遇到 &lt;script&gt; 标签时，就会在继续构建 DOM 之前运行它。这是一种防范措施，因为脚本可能想要修改 DOM，甚至对其执行 document.write 操作，所以 DOMContentLoaded 必须等待脚本执行结束。

因此，DOMContentLoaded 肯定在下面的这些脚本执行结束之后发生。

此规则有两个例外：

* 具有 async 特性（attribute）的脚本不会阻塞 DOMContentLoaded，稍后 我们会讲到。
* 使用 document.createElement('script') 动态生成并添加到网页的脚本也不会阻塞 DOMContentLoaded。

## DOMContentLoaded 和样式

外部样式表不会影响 DOM，因此 DOMContentLoaded 不会等待它们。

但这里有一个陷阱。如果在样式后面有一个脚本，那么该脚本必须等待样式表加载完成。原因是，脚本可能想要获取元素的坐标和其他与样式相关的属性。因此，它必须等待样式加载完成。

当 DOMContentLoaded 等待脚本时，它现在也在等待脚本前面的样式。

## 浏览器内建的自动填充

Firefox，Chrome 和 Opera 都会在 DOMContentLoaded 中自动填充表单。

例如，如果页面有一个带有登录名和密码的表单，并且浏览器记住了这些值，那么在 DOMContentLoaded 上，浏览器会尝试自动填充它们（如果得到了用户允许）。

因此，如果 DOMContentLoaded 被需要加载很长时间的脚本延迟触发，那么自动填充也会等待。你可能在某些网站上看到过（如果你使用浏览器自动填充）—— 登录名/密码字段不会立即自动填充，而是在页面被完全加载前会延迟填充。这实际上是 DOMContentLoaded 事件之前的延迟。

## window.onload

当整个页面，包括样式、图片和其他资源被加载完成时，会触发 window 对象上的 load 事件。可以通过 onload 属性获取此事件。

## window.onunload

当访问者离开页面时，window 对象上的 unload 事件就会被触发。我们可以在那里做一些不涉及延迟的操作，例如关闭相关的弹出窗口。

有一个值得注意的特殊情况是发送分析数据。

假设我们收集有关页面使用情况的数据：鼠标点击，滚动，被查看的页面区域等。

自然地，当用户要离开的时候，我们希望通过 unload 事件将数据保存到我们的服务器上。

有一个特殊的 navigator.sendBeacon(url, data) 方法可以满足这种需求，详见规范 https://w3c.github.io/beacon/。

它在后台发送数据，转换到另外一个页面不会有延迟：浏览器离开页面，但仍然在执行 sendBeacon。

当 sendBeacon 请求完成时，浏览器可能已经离开了文档，所以就无法获取服务器响应（对于分析数据来说通常为空）。

还有一个 keep-alive 标志，该标志用于在 fetch 方法中为通用的网络请求执行此类“离开页面后”的请求。你可以在 Fetch API 一章中找到更多相关信息。

如果我们要取消跳转到另一页面的操作，在这里做不到。但是我们可以使用另一个事件 —— onbeforeunload。

## window.onbeforeunload

如果访问者触发了离开页面的导航（navigation）或试图关闭窗口，beforeunload 处理程序将要求进行更多确认。

如果我们要取消事件，浏览器会询问用户是否确定。

## 总结

页面生命周期事件：

* 当 DOM 准备就绪时，document 上的 DOMContentLoaded 事件就会被触发。在这个阶段，我们可以将 JavaScript 应用于元素。
    * 诸如 `&lt;script&gt;...&lt;/script&gt;` 或 `&lt;script src="..."&gt;&lt;/script&gt;` 之类的脚本会阻塞 DOMContentLoaded，浏览器将等待它们执行结束。
    * 图片和其他资源仍然可以继续被加载。
* 当页面和所有资源都加载完成时，window 上的 load 事件就会被触发。我们很少使用它，因为通常无需等待那么长时间。
* 当用户想要离开页面时，window 上的 beforeunload 事件就会被触发。如果我们取消这个事件，浏览器就会询问我们是否真的要离开（例如，我们有未保存的更改）。
* 当用户最终离开时，window 上的 unload 事件就会被触发。在处理程序中，我们只能执行不涉及延迟或询问用户的简单操作。正是由于这个限制，它很少被使用。我们可以使用 navigator.sendBeacon 来发送网络请求。

</details>

## 52. 一台设备的dpr，是否是可变的？ {#question-8dad4e08-b8b7-4593-bb5e-8df4d4b14499}

> 难度：3 · 类型：QA

### 题目要点

`devicePixelRatio`，中文名称是设备像素比。这个概念在移动开发的时候会被特别关注，因为它关系到了整个画面的观感、布局甚至是清晰度。在JavaScript BOM中，它是window全局对象下的一个属性，它的定义如下：

<details>
<summary>参考答案</summary>

`devicePixelRatio`，中文名称是设备像素比。这个概念在移动开发的时候会被特别关注，因为它关系到了整个画面的观感、布局甚至是清晰度。在JavaScript BOM中，它是window全局对象下的一个属性，它的定义如下：

> dpr = 设备像素 / CSS像素

也有文章把设备像素称为物理像素，把CSS像素称为独立像素（DIPs），但所指的都是同样概念：

(1) 首先说设备像素。举手机的例子来说，设备像素也就是在手机广告上经常会看到的1920*1080像素或1280*720像素，也就是常说的分辨率为1080p或720p。它所指的是设备上有多少个能够显示一种特定颜色的最小区域，在任何设备中这个数值都是不会变的。

(2) 再说CSS像素，它的一种更广义的叫法是独立像素。CSS像素是为web开发者所打造的，是在CSS和JavaScript中使用的一个抽象的层，我们在CSS中定义的width: 100px;、font-size: 16px;等属性都是指CSS像素。而相对于CSS像素，设备像素这个概念在前端中几乎用不上（除了screen.width/height）。

那么，从定义来看，dpr的意义就是：在一个设备（的每个方向）上，每个CSS像素会被多少个实际的物理像素来显示。

![image.png](https://static.ecool.fun//article/893cb23b-5299-44ab-af90-f0585f94c298.png)

上图中，一个蓝色方块代表一个设备像素，一个黄色方块代表一个CSS像素。我们可以通过这张图来理清dpr的概念：

* 如图左，一个设备像素覆盖了多个CSS像素，dpr < 1，对应用户的缩小操作；
* 如图右，一个CSS像素覆盖了多个设备像素，dpr > 1，对应用户的放大操作。

由于**用户的缩放操作会改变dpr**，所以设备dpr是在默认缩放为100%的情况下定义的。

</details>

## 53. html和css中的图片加载与渲染规则是什么样的？ {#question-5b612b6a-3828-4cd9-9de4-b05bb36a4e3d}

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

## 54. meta 标签中的viewport 有什么用？ {#question-394752d7-88aa-4512-bd7e-91711a3904b7}

> 难度：2 · 类型：QA

### 题目要点

`meta viewport` 用于控制移动端浏览器的视口大小和页面缩放行为。

移动浏览器默认使用较大的布局视口（如约 980px）来兼容 PC 页面。

通过 `width=device-width` 可以让布局视口与设备宽度一致，从而支持响应式布局。

`initial-scale`、`maximum-scale` 等参数可以控制页面的缩放比例。

移动端页面适配（rem、vw、媒体查询等）都依赖正确配置 `viewport`。

<details>
<summary>参考答案</summary>

`meta viewport` 是移动端页面中非常关键的一个配置，用于控制页面在移动设备上的 **视口（Viewport）大小以及缩放行为**。移动浏览器默认会使用一个虚拟布局视口来渲染 PC 网站，如果不进行配置，页面通常会被整体缩小显示，导致字体和布局异常。因此需要通过 `viewport` 指定页面的显示规则。

## 技术分析

在移动浏览器中通常存在两个概念：**layout viewport（布局视口）** 和 **visual viewport（视觉视口）**。布局视口通常会被设定为一个较大的宽度（例如约 980px），用于兼容 PC 页面，而视觉视口则是用户当前实际看到的区域。

`meta viewport` 的作用是让开发者能够控制布局视口与设备屏幕之间的关系。例如常见配置：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

其中 `width=device-width` 表示布局视口宽度与设备屏幕宽度保持一致，这样 CSS 中的 `px` 就会按照设备宽度进行布局。`initial-scale=1.0` 则表示页面初始缩放比例为 1，不会在加载时自动缩放。

除此之外，`viewport` 还可以控制页面是否允许用户缩放（`user-scalable`）、最大和最小缩放比例（`maximum-scale`、`minimum-scale`）等，从而影响页面的交互体验。

如果不设置 `viewport`，移动浏览器通常会按照 PC 页面逻辑渲染页面，再自动缩小以适应屏幕，这会导致响应式布局、媒体查询和移动端适配策略无法正常工作。

## 工程实践

在移动端开发中，`meta viewport` 是响应式布局的基础配置。无论是使用 `flex`、`rem`、`vw` 还是媒体查询进行适配，都依赖于正确的视口宽度。

大多数移动端项目都会使用类似如下配置：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

这样可以保证页面宽度与设备宽度一致，并避免用户误触导致页面缩放。如果涉及无障碍设计或需要支持放大阅读，则通常不会限制 `user-scalable`。

</details>

## 55. style标签写在body后与body前有什么区别？ {#question-14912aa6-d4d4-4af9-ad73-e7641f3a6212}

> 难度：2 · 类型：QA

### 题目要点

页面加载自上而下 当然是先加载样式。

<details>
<summary>参考答案</summary>

页面加载自上而下 当然是先加载样式。

写在body标签后由于浏览器以逐行方式对HTML文档进行解析，当解析到写在尾部的样式表（外联或写在style标签）会导致浏览器停止之前的渲染，等待加载且解析样式表完成之后重新渲染，在windows的IE下可能会出现FOUC现象（即样式失效导致的页面闪烁问题）

</details>

## 56. 前端该如何选择图片的格式？ {#question-55ba9331-1165-4b0e-baba-dc9a6378a8fb}

> 难度：3 · 类型：QA

### 题目要点

## 如何选择图片的格式

![image.png](https://static.ecool.fun//article/d0ab542b-20ea-4709-baab-54aed4e0e07b.png)

<details>
<summary>参考答案</summary>

##图片的类型

图片的类型目前就分为两种：

* 位图
* 矢量图

### 位图

所谓位图就是用像素点拼起来的图也叫点阵图，平时我们用到的png、jpg等图片就是位图。

### 矢量图

矢量图，也叫做向量图。矢量图并不纪录画面上每一点的信息，而是纪录了元素形状及颜色的算法，当你打开一幅矢量图的时候，软件对图形对应的函数进行运算，将运算结果图形的形状和颜色显示给你看。

无论显示画面是大还是小，画面上的对象对应的算法是不变的，所以，即使对画面进行倍数相当大的缩放，它也不会像位图那样会失真。

常见的就是svg格式的。

## 图片的压缩类型

* 无压缩
* 有损压缩
* 无损压缩

### 无压缩

无压缩的图片格式不对图片数据进行压缩处理，能准确地呈现原图片。例如BMP格式的图片。

### 有损压缩

指在压缩文件大小的过程中，损失了一部分图片的信息，也即降低了图片的质量（即图片被压糊了），并且这种损失是不可逆的。

常见的有损压缩手段是按照一定的算法将临近的像素点进行合并。压缩算法不会对图片所有的数据进行编码压缩，而是在压缩的时候，去除了人眼无法识别的图片细节。因此有损压缩可以在同等图片质量的情况下大幅降低图片的体积。例如jpg格式的图片使用的就是有损压缩。

### 无损压缩

在压缩图片的过程中，图片的质量没有任何损耗。我们任何时候都可以从无损压缩过的图片中恢复出原来的信息。

压缩算法对图片的所有的数据进行编码压缩，能在保证图片的质量的同时降低图片的体积。例如png、gif使用的就是无损压缩。

## 图片位数

图片位数通常分为8、16、24、32

* 图片位数越大，能表示的颜色越多，同时占用的体积也约大。例如8位图片支持256种颜色，即2的8次方。
* 图片位数越大，颜色过渡也就越细腻，携带的色彩信息可以更加丰富。
* 32位跟24位的区别就是多了一个Alpha通道，用来支持半透明，其他的跟24位基本一样。

## 常见的图片的格式

### GIF

GIF的全称是`Graphics Interchange Format`，可译为图形交换格式，是在1987年由Compu Serve公司为了填补跨平台图像格式的空白而发展起来的。

GIF采用的是Lempel-Zev-Welch（LZW）压缩算法，最高支持256种颜色。由于这种特性，GIF比较适用于色彩较少的图片，比如卡通造型、公司标志等等。如果碰到需要用24位真彩色的场合，那么GIF的表现力就有限了。

GIF格式图片最大的特性是帧动画，相比古老的bmp格式，尺寸较小，而且支持透明(不支持半透明，因为不支持 Alpha 透明通道 )和动画。

优点：

* 体积小
* 支持动画

缺点：

* 由于采用了8位压缩，最多只能处理256种颜色

### JPEG/JPG

JPEG是`Joint Photographic Experts Group`(联合图像专家组)的缩写，文件后辍名为"．jpg"或"．jpeg"，是常用的图像文件格式，由一个软件开发联合会组织制定，是一种有损压缩格式，能够将图像压缩在很小的储存空间，图像中重复或不重要的资料会被丢失，因此容易造成图像数据的损伤。尤其是使用过高的压缩比例，将使最终解压缩后恢复的图像质量明显降低，如果追求高品质图像，不宜采用过高压缩比例。

优点：

* 采用有损压缩，压缩后体积更小
* 支持24位真彩色
* 支持渐进式加载

缺点：

* 有损压缩会损坏图片的质量
* 不支持透明/半透明

### 渐进式jpeg(progressive jpeg)

渐进式jpg文件包含多次扫描，这些扫描顺寻的存储在jpg文件中。打开文件过程中，会先显示整个图片的模糊轮廓，随着扫描次数的增加，图片变得越来越清晰。

### PNG

png，即便携式网络图形是一种无损压缩的位图片形格式，其设计目的是试图替代GIF和TIFF文件格式，同时增加一些GIF文件格式所不具备的特性。PNG使用从LZ77派生的无损数据压缩算法，一般应用于JAVA程序、网页或S60程序中，原因是它压缩比高，生成文件体积小。

png支持8位、24位、32位3种，我们通常叫它们png8、png24、png32。

优点：

* 无损压缩
* 支持透明、半透明
* 最高支持24位真彩色图像以及8位灰度图像，从而彻底地消除锯齿边缘。

缺点：

* 与jpg的有损耗压缩相比，png提供的压缩量较少
* 不支持动画，如需支持动画还得使用apng

### APNG

APNG（Animated Portable Network Graphics）是一个基于PNG（Portable Network Graphics）的位图动画格式。实际上就是多张png组成的动图。MAC电脑打开可以看到组成apng的每一张图。

优点：

* 支持png的所有优点
* 支持动画

缺点：

* 浏览器支持情况较差

### WEBP

WebP是由Google最初在2010年发布，目标是减少文件大小。它能同时支持无损压缩和有损压缩。

它几乎集成了以上所有图片的优点，并且能够拥有更高的压缩率，但是浏览器支持率还不够理想。

### SVG

SVG是一种用XML定义的语言，用来描述二维矢量及矢量/栅格图形。SVG提供了3种类型的图形对象：矢量图形（例如：由直线和曲线组成的路径）、图象、文本。图形对象还可进行分组、添加样式、变换、组合等操作，特征集包括嵌套变换、剪切路径、alpha蒙板、滤镜效果、模板对象和其它扩展。

SVG图形是可交互的和动态的，可以在SVG文件中嵌入动画元素或通过脚本来定义动画。

SVG与上面图片不同的是它是矢量图，无论你怎么放大，它都不会失真；同时，SVG文件通常要比比JPEG和PNG格式的文件要小很多。

优点：

* SVG 可被非常多的工具读取和修改（比如记事本）
* SVG 与 JPEG 和 GIF 图像比起来，尺寸更小，且可压缩性更强。
* SVG 是可伸缩
* SVG 图像可在任何的分辨率下被高质量地打印
* SVG 可在图像质量不下降的情况下被放大
* SVG 可以与 JavaScript 技术一起运行
* SVG 文件是纯粹的 XML

缺点：

* 渲染成本相对于其他格式图片比较高，对于性能有影响。
* 需要学习成本，因为SVG是一种用XML定义的语言。

## 如何选择图片的格式

![image.png](https://static.ecool.fun//article/d0ab542b-20ea-4709-baab-54aed4e0e07b.png)

</details>

## 57. 什么是渐进增强和优雅降级？ {#question-79fe443f-0556-4359-8e05-804161ac48ef}

> 难度：1 · 类型：QA

### 题目要点

渐进增强（progressive enhancement）：主要是针对低版本的浏览器进行页面重构，保证基本的功能情况下，再针对高级浏览器进行效果，交互等方面的改进和追加功能，以达到更好的用户体验。

<details>
<summary>参考答案</summary>

渐进增强（progressive enhancement）：主要是针对低版本的浏览器进行页面重构，保证基本的功能情况下，再针对高级浏览器进行效果，交互等方面的改进和追加功能，以达到更好的用户体验。

优雅降级 graceful degradation： 一开始就构建完整的功能，然后再针对低版本的浏览器进行兼容。

## 区别

* 优雅降级是从复杂的现状开始的，并试图减少用户体验的供给；而渐进增强是从一个非常基础的，能够起作用的版本开始的，并在此基础上不断扩充，以适应未来环境的需要；
* 优雅降级（功能衰竭）意味着往回看，而渐进增强则意味着往前看，同时保证其根基处于安全地带。

</details>

## 58. webSocket如何兼容低浏览器 {#question-9f860d42-8504-4562-8b9a-4a415ba5782a}

> 难度：1 · 类型：QA

### 题目要点

Adobe Flash Socket；

<details>
<summary>参考答案</summary>

* Adobe Flash Socket；
* ActiveX HTMLFile (IE) ；
* 基于 multipart 编码发送 XHR；
* 基于长轮询的 XHR；

</details>

## 59. 如何实现浏览器内多个标签页之间的通信？ {#question-833fba72-1614-4502-adc3-1f5593ae6560}

> 难度：2.5 · 类型：QA

### 题目要点

顾名思义，“广播频道”，官方文档里的解释为“用于同源不同页面之间完成通信的功能”，在其中某个页面发送的消息会被其他页面监听到。

<details>
<summary>参考答案</summary>

## Broadcast Channel

顾名思义，“广播频道”，官方文档里的解释为“用于同源不同页面之间完成通信的功能”，在其中某个页面发送的消息会被其他页面监听到。

注意“同源”二字，该方法无法完成跨域的数据传输。

## localStorage

localStorage是浏览器多个标签共用的存储空间，所以可以用来实现多标签之间的通信(ps：session是会话级的存储空间，每个标签页都是单独的）。

## SharedWorker

SharedWorker可以被多个window共同使用，但必须保证这些标签页都是同源的(相同的协议，主机和端口号)

## WebSocket通讯

全双工（full-duplex）通信自然可以实现多个标签之间的通信

## 定时器setInterval+cookie

* 在页面A设置一个使用setInterval定时器不断刷新，检查Cookies的值是否发生变化，如果变化就进行刷新的操作。
* 由于Cookies是在同域可读的，所以在页面B审核的时候改变Cookies的值，页面A自然是可以拿到的。

这样做确实可以实现我想要的功能，但是这样的方法相当浪费资源。虽然在这个性能过盛的时代，浪费不浪费也感觉不出来，但是这种实现方案，确实不够优雅。

## postMessage

两个需要交互的tab页面具有依赖关系。

如 A页面中通过JavaScript的window.open打开B页面，或者B页面通过iframe嵌入至A页面，此种情形最简单，可以通过HTML5的 window.postMessage API完成通信，由于postMessage函数是绑定在 window 全局对象下，因此通信的页面中必须有一个页面（如A页面）可以获取另一个页面（如B页面）的window对象，这样才可以完成单向通信；B页面无需获取A页面的window对象，如果需要B页面对A页面的通信，只需要在B页面侦听message事件，获取事件中传递的source对象，该对象即为A页面window对象的引用：

```js
//B页面
window.addEventListner('message',(e)=>{
    let {data,source,origin} = e;
    source.postMessage('message echo','/');
});
```

postMessage的第一个参数为消息实体，它是一个结构化对象，即可以通过“JSON.stringify和JSON.parse”函数还原的对象；第二个参数为消息发送范围选择器，设置为“/”意味着只发送消息给同源的页面，设置为“*”则发送全部页面。

</details>

## 60. 什么是HTML5，以及和HTML的区别是什么？ {#question-63d73ae0-ea78-4b4c-8a85-6be7513a62a4}

> 难度：1 · 类型：QA

### 题目要点

HTML5是HTML的新标准，其主要目标是无需任何额外的插件如Flash、Silverlight等，就可以传输所有内容。它囊括了动画、视频、丰富的图形用户界面等。

<details>
<summary>参考答案</summary>

HTML5是HTML的新标准，其主要目标是无需任何额外的插件如Flash、Silverlight等，就可以传输所有内容。它囊括了动画、视频、丰富的图形用户界面等。

HTML5是由万维网联盟（W3C）和 `Web Hypertext Application Technology Working Group` 合作创建的HTML新版本。

## 区别

从文档声明类型上看：

HTML是很长的一段代码，很难记住。如下代码：
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
```

HTML5却只有简简单单的声明，方便记忆。如下：

```
<!DOCTYPE html>
```

从语义结构上看：

* HTML4.0：没有体现结构语义化的标签，通常都是这样来命名的 `<div id="header"></div>`，这样表示网站的头部。
* HTML5：在语义上却有很大的优势。提供了一些新的标签，比如：`<header><article><footer>`。

## 拓展

不输入<!DOCTYPE html>，浏览器将无法识别html文件，因此html将无法正常工作。

</details>

## 61. 说说 HTML、XML、XHTML 的区别 {#question-43f99048-e5ee-4041-a7f4-65a4d5ef379f}

> 难度：1 · 类型：QA

### 题目要点

HTML：超文本标记语言，是语法较为松散的、不严格的Web语言；

<details>
<summary>参考答案</summary>

* HTML：超文本标记语言，是语法较为松散的、不严格的Web语言；
* XML：可扩展的标记语言，主要用于存储数据和结构，可扩展；
* XHTML：可扩展的超文本标记语言，基于XML，作用与HTML类似，但语法更严格。

</details>

## 62. 标签上title属性与alt属性的区别是什么？ {#question-a82eaabe-70e6-47ed-b29d-d036e80e0815}

> 难度：1 · 类型：QA

### 题目要点

alt 是为了在图片未能正常显示时（屏幕阅读器）给予文字说明。且长度必须少于100个英文字符或者用户必须保证替换文字尽可能的短。

<details>
<summary>参考答案</summary>

* alt 是为了在图片未能正常显示时（屏幕阅读器）给予文字说明。且长度必须少于100个英文字符或者用户必须保证替换文字尽可能的短。
* title 属性为设置该属性的元素提供建议性的信息。使用title属性提供非本质的额外信息。

</details>

## 63. 页面导入样式时，使用link和@import有什么区别？ {#question-d7e46f80-9878-4757-8535-ee962dca4ee6}

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

## 64. 简单描述从输入网址到页面显示的过程 {#question-5def10e9-7825-4bd4-a76e-6d7eb555a2ce}

> 难度：4 · 类型：QA

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

## 65. 简述 html 页面渲染过程 {#question-61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6}

> 难度：3 · 类型：QA

### 题目要点

1. **解析 HTML** -> 构建 DOM 树。
2. **解析 CSS** -> 构建 CSSOM 树。
3. **合并 DOM 和 CSSOM** -> 构建渲染树。
4. **计算布局** -> 生成布局信息。
5. **绘制页面** -> 将内容绘制到屏幕。
6. **合成和显示** -> 合成图层并显示页面。
7. **JavaScript 执行** -> 执行脚本可能导致重绘或回流。

<details>
<summary>参考答案</summary>

整个渲染过程其实就是将URL对应的各种资源，通过浏览器渲染引擎的解析，输出可视化的图像。

## 基本概念

* HTML解释器：解释HTML语言的解释器，本质是将HTML文本解释成DOM树（文档对象模型）。
* CSS解释器：解释样式表的解释器，其作用是将DOM中的各个元素对象加上样式信息，从而为计算最后结果的布局提供依据。
* 布局：将DOM和css样式信息结合起来，计算它们的大小位置等布局信息，形成一个能够表示这所有信息的内部表示模型即渲染树。
* JavaScript引擎：JavaScript可以修改网页的内容，也能修改CSS的信息，JavaScript引擎解释JavaScript代码并把代码的逻辑和对DOM和CSS的改动信息应用到布局中去，从而改变渲染的结果。

## 基本过程

* 1.解析HTML文件，创建DOM树

浏览器解析html源码，然后创建一个 DOM树。并行请求 css/image/js在DOM树中，每一个HTML标签都有一个对应的节点，并且每一个文本也都会有一个对应的文本节点。DOM树的根节点就是 documentElement，对应的是html标签。

* 2.解析CSS,形成CSS对象模型

浏览器解析CSS代码，计算出最终的样式数据。构建CSSOM树。对CSS代码中非法的语法它会直接忽略掉。解析CSS的时候会按照如下顺序来定义优先级：

> 浏览器默认设置 < 用户设置 < 外链样式 < 内联样式 < html中的style。

* 3.将CSS与DOM合并，构建渲染树（renderingtree）

DOM Tree + CSSOM –> 渲染树（rendering tree）。渲染树和DOM树有点像，但是是有区别的。DOM树完全和html标签一一对应，但是渲染树会忽略掉不需要渲染的元素，比如head、display:none的元素等。而且一大段文本中的每一个行在渲染树中都是独立的一个节点。渲染树中的每一个节点都存储有对应的css属性。

* 4.布局和绘制

一旦渲染树创建好了，浏览器就可以根据渲染树直接把页面绘制到屏幕上。

以上四个步骤并不是一次性顺序完成的。如果DOM或者CSSOM被修改，以上过程会被重复执行。实际上，CSS和JavaScript往往会多次修改DOM或者CSSOM。

### Repaint(重绘)

重绘是改变不影响元素在网页中的位置的元素样式时，譬如background-color(背景色)， border-color(边框色)，visibility(可见性)，浏览器会根据元素的新属性重新绘制一次(这就是重绘，或者说重新构造样式)，使元素呈现新的外观。

重绘不会带来重新布局，所以并不一定伴随重排。

### Reflow（重排）

渲染对象在创建完成并添加到渲染树时，并不包含位置和大小信息。计算这些值的过程称为布局或重排。

"重绘"不一定需要"重排"，比如改变某个网页元素的颜色，就只会触发"重绘"，不会触发"重排"，因为布局没有改变。

但是，"重排"必然导致"重绘"，比如改变一个网页元素的位置，就会同时触发"重排"和"重绘"，因为布局改变了。

## 引申问题：浏览器如何优化渲染？

* 将多次改变样式属性的操作合并成一次操作
* 将需要多次重排的元素，position属性设为absolute或fixed，这样此元素就脱离了文档流，它的变化不会影响到其他元素。例如有动画效果的元素就最好设置为绝对定位。
* 由于display属性为none的元素不在渲染树中，对隐藏的元素操作不会引发其他元素的重排。如果要对一个元素进行复杂的操作时，可以先隐藏它，操作完成后再显示。这样只在隐藏和显示时触发2次重排。

</details>

## 66. HTML5 有哪些新特性？ {#question-362a44f0-8be1-4e5b-abfc-f3ddadc4aa2e}

> 难度：0.5 · 类型：QA

### 题目要点

新增语义化标签：nav、header、footer、aside、section、article

<details>
<summary>参考答案</summary>

* 新增语义化标签：nav、header、footer、aside、section、article
* 音频、视频标签：audio、video
* 数据存储：localStorage、sessionStorage
* canvas（画布）、Geolocation（地理定位）、websocket（通信协议）
* input标签新增属性：placeholder、autocomplete、autofocus、required
* history API
    * go、forward、back、pushstate

</details>

## 67. <!DOCTYPE html> 标签有什么用？ {#question-ba6327df-ba59-4870-921c-36b8516c4451}

> 难度：1.5 · 类型：QA

### 题目要点

`<!DOCTYPE html>` 是 HTML5 文档的标准声明，用于告知浏览器当前页面遵循 HTML5 标准。它帮助浏览器以标准模式渲染网页，确保一致的用户体验和网页表现。

<details>
<summary>参考答案</summary>

`<!DOCTYPE html>` 是 HTML 文档的文档类型声明（DOCTYPE），用于告知浏览器该文档使用的 HTML 版本和标准。它的主要作用如下：

### 作用

1. **指定文档类型**：
   - `<!DOCTYPE html>` 声明告知浏览器该文档遵循 HTML5 标准。这有助于浏览器正确解析和渲染网页内容。

2. **触发标准模式**：
   - 在浏览器中，`<!DOCTYPE html>` 会触发标准模式（Standards Mode），使浏览器以最严格的方式按照 HTML5 标准来渲染页面。没有 DOCTYPE 或者不正确的 DOCTYPE 可能会导致浏览器进入混杂模式（Quirks Mode），这种模式下的渲染可能不符合标准规范。

3. **确保一致的渲染**：
   - 通过声明 DOCTYPE，可以减少不同浏览器之间的渲染差异。标准模式确保所有浏览器以一致的方式呈现 HTML 内容。

### 示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

### 历史背景

- **HTML4 和 XHTML**：
  - 对于 HTML4 和 XHTML，DOCTYPE 声明较为复杂，需要指定具体的 DTD（Document Type Definition）。例如，HTML4 的 DOCTYPE 是这样的：`<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`。
  - HTML5 简化了 DOCTYPE 声明为 `<!DOCTYPE html>`，使其更简洁且易于使用。

</details>

## 68. script 标签为什么建议放在 body 标签的底部（defer、async） {#question-6f693f1d-67f6-4b01-aae8-dfeb47a444b5}

> 难度：1 · 类型：QA

### 题目要点

因为浏览器在渲染html的时候是从上到下执行的，当遇到js文件的时候就会停止当前页面的渲染，转而去下载js文件。

<details>
<summary>参考答案</summary>

因为浏览器在渲染html的时候是从上到下执行的，当遇到js文件的时候就会停止当前页面的渲染，转而去下载js文件。

如果将script标签放在头部，在文件很大的情况下将导致首屏加载时间延长，影响用户体验。

## 解决办法

* 将script标签放在body的底部
* 通过defer、async属性将js文件转为异步加载

</details>

## 69. HTML 标签中的 src 和 href 有什么区别 {#question-53060972-481f-4025-a055-aa278d737fc1}

> 难度：0.5 · 类型：QA

### 题目要点

`src` 和 `href` 都用于指定资源的 URL，但应用场景不同。`src` 用于嵌入和加载外部资源，而 `href` 用于定义超链接和引用资源。了解这两者的区别有助于正确使用 HTML 属性以实现所需的功能。

<details>
<summary>参考答案</summary>

`src` 和 `href` 是 HTML 中用于不同目的的属性，各自有其特定的使用场景和功能：

### `src` 属性

- **用途**：用于指定外部资源的 URL，通常用在 `<img>`、`&lt;script&gt;`、`&lt;iframe&gt;`、`<audio>` 和 `<video>` 等标签中。
- **功能**：告诉浏览器从哪个 URL 加载资源。加载的资源会嵌入到当前页面中或执行。例如：
  - `<img src="image.jpg" alt="Description">`：加载并显示图像。
  - `&lt;script src="script.js"&gt;&lt;/script&gt;`：加载并执行 JavaScript 文件。
  - `&lt;iframe src="https://example.com"&gt;&lt;/iframe&gt;`：嵌入外部网页。

### `href` 属性

- **用途**：用于定义超链接的目标 URL，通常用在 `<a>`（锚点）和 `<link>`（链接） 标签中。
- **功能**：指定链接或引用的资源地址。用于页面间的导航、资源引入等。例如：
  - `<a href="https://example.com">Visit Example</a>`：创建一个指向外部网站的超链接。
  - `<link rel="stylesheet" href="styles.css">`：引入外部 CSS 样式表。

### 区别

1. **应用场景**：
   - **`src`**：用于嵌入或加载外部资源（如图像、脚本、音频等）。
   - **`href`**：用于定义超链接和引用外部资源（如导航链接、样式表等）。

2. **资源加载方式**：
   - **`src`**：浏览器会立即请求并加载指定的资源，这会影响页面的呈现或功能。
   - **`href`**：主要用于超链接或资源引用，浏览器会在用户点击链接时进行导航或加载资源。

3. **标签支持**：
   - **`src`**：用于 `<img>`、`&lt;script&gt;`、`&lt;iframe&gt;`、`<audio>`、`<video>` 等标签。
   - **`href`**：用于 `<a>` 和 `<link>` 标签。

### 示例

**`src` 示例**：
```html
<img src="logo.png" alt="Website Logo">
<script src="main.js"></script>
<iframe src="https://example.com"></iframe>
```

**`href` 示例**：
```html
<a href="https://example.com">Go to Example</a>
<link rel="stylesheet" href="styles.css">
```

</details>

## 70. iframe是什么？有哪些优缺点？ {#question-06af30a2-e542-4cf0-9793-999267a4007d}

> 难度：2 · 类型：QA

### 题目要点

`&lt;iframe&gt;` 标签提供了一种便捷的方法来嵌入外部内容和实现特定的布局，但它也带来了一些性能、安全性、SEO 和用户体验方面的挑战。合理使用 `&lt;iframe&gt;` 并考虑其优缺点可以帮助开发人员在实现页面功能和保持页面性能之间找到平衡。

<details>
<summary>参考答案</summary>

`&lt;iframe&gt;` 标签用于在当前网页中嵌入另一个 HTML 页面。它可以在页面上创建一个内嵌的浏览器窗口来展示外部内容。使用 `&lt;iframe&gt;` 有一些明显的优点和缺点：

### 优点

1. **隔离内容**：
   - **安全性**：通过 `&lt;iframe&gt;` 可以将外部内容与主页面隔离，从而减少潜在的安全风险（如跨站脚本攻击）。
   - **样式和脚本隔离**：外部页面的样式和脚本不会直接影响主页面。

2. **嵌入外部资源**：
   - **内容集成**：可以轻松地将外部网页或应用（如地图、视频、广告）嵌入到当前页面中，而无需重新开发相同的功能。
   - **第三方服务**：集成第三方服务（如支付网关、社交媒体分享按钮）而不需要直接控制其代码。

3. **独立滚动**：
   - **滚动控制**：内嵌的内容可以独立于主页面滚动，有助于创建自定义滚动区域。

4. **简化布局**：
   - **多样布局**：可以用来实现复杂的布局，例如将广告、视频、或外部应用嵌入到页面的特定部分。

5. **简化测试**：
   - **单元测试**：在开发和测试中，可以单独测试嵌入的内容，确保它在不同环境中的一致性和功能。

### 缺点

1. **性能问题**：
   - **页面加载**：`&lt;iframe&gt;` 的内容需要额外的 HTTP 请求，可能会影响页面加载速度和性能。
   - **资源消耗**：加载多个 `&lt;iframe&gt;` 可能会增加浏览器的内存和 CPU 使用量。

2. **跨域问题**：
   - **限制**：与 `&lt;iframe&gt;` 中的内容进行跨域交互（如操作父页面）可能会受到浏览器的同源策略限制，导致复杂的跨域通信问题。

3. **SEO 和可访问性**：
   - **SEO**：搜索引擎通常不会索引 `&lt;iframe&gt;` 中的内容，可能会影响搜索引擎优化（SEO）。
   - **可访问性**：一些用户可能无法通过屏幕阅读器等工具访问 `&lt;iframe&gt;` 中的内容，影响可访问性。

4. **用户体验**：
   - **滚动条和边框**：`&lt;iframe&gt;` 默认会显示滚动条和边框，这可能影响页面的视觉美观。需要额外的 CSS 样式调整来隐藏这些元素。
   - **响应式设计**：在响应式设计中处理 `&lt;iframe&gt;` 的尺寸和布局可能比较麻烦。

5. **安全隐患**：
   - **点击劫持**：恶意网站可能使用 `&lt;iframe&gt;` 嵌套其内容来进行点击劫持攻击，利用用户的点击意图执行恶意操作。

### 示例

```html
<iframe src="https://example.com" width="600" height="400" frameborder="0" allowfullscreen></iframe>
```

</details>

## 71. canvas在标签上设置宽高，与在style中设置宽高有什么区别？ {#question-5570174b-5bd1-4e00-a9cf-49f6ae227758}

> 难度：1 · 类型：QA

### 题目要点

canvas标签的width和height是画布实际宽度和高度，绘制的图形都是在这个上面。

<details>
<summary>参考答案</summary>

canvas标签的width和height是画布实际宽度和高度，绘制的图形都是在这个上面。

而style的width和height是canvas在浏览器中被渲染的高度和宽度。

如果canvas的width和height没指定或值不正确，就被设置成默认值。

</details>

## 72. 如何禁用a标签跳转页面或定位链接? {#question-65fa7d0f-fd68-4c2d-9c2b-4f98d7a4f9e3}

> 难度：2 · 类型：QA

### 题目要点

当页面中a标签不需要任何跳转时，从原理上来讲，可分如下两种方法：

<details>
<summary>参考答案</summary>

当页面中a标签不需要任何跳转时，从原理上来讲，可分如下两种方法：

* 标签属性href，使其指向空或不返回任何内容。如：

```html
<a href="javascript:void(0);" >点此无反应javascript:void(0)</a>

<a href="javascript:;" >点此无反应javascript:</a>
```

* 从标签事件入手，阻止其默认行为。如：

html方法：

```html
<a href="" onclick="return false;">return false;</a>
<a href="#" onclick="return false;">return false;</a>
```

或者在js文件中阻止默认点击事件：

```javascript
Event.preventDefault()
```

还可以在css文件中处理点击，不响应任何鼠标事件：
```css
pointer-events: none;
```

</details>

## 73. 行内元素有哪些？块级元素有哪些？ 空(void)元素有那些？ {#question-d6a65597-0522-4127-bbe1-68eb9da818ee}

> 难度：1 · 类型：QA

### 题目要点

HTML 中的行内元素（inline elements）通常用于在一行内显示，不会独占一行的空间。常见的行内元素有：

<details>
<summary>参考答案</summary>

HTML 中的行内元素（inline elements）通常用于在一行内显示，不会独占一行的空间。常见的行内元素有：

- `<span>`：用于对文本或其他内联元素进行分组或添加样式。
- `<strong>`：表示强调的文本。
- `<em>`：表示斜体强调的文本。
- `<a>`：用于创建超链接。
- `<img>`：用于插入图像。
- `<input>`：用于创建用户输入字段。

块级元素（block-level elements）通常会独占一行的空间，并且会在前后创建换行。常见的块级元素有：

- `<div>`：用于将内容分组。
- `<p>`：用于段落。
- `<h1>`-`<h6>`：用于标题。
- `<ul>` 和 `<ol>`：用于无序和有序列表。
- `<li>`：用于列表项。
- `<table>`：用于创建表格。

空元素（void elements）是指没有闭合标签的元素。它们在 HTML 中没有内容，只有一个开启标签。常见的空元素有：

- `<br>`：用于插入换行符。
- `<img>`：用于插入图像。
- `<input>`：用于创建用户输入字段。
- `<meta>`：用于指定页面元数据。
- `<link>`：用于引入外部资源。
- `<hr>`：用于创建水平分隔线。

注意，HTML5 中的空元素可以使用自闭合的格式，例如 `<br />`、`<img src="..." alt="..." />`。

</details>

## 74. label标签有什么用？ {#question-76a7ac01-6de6-4391-976d-b703da5b78ec}

> 难度：1 · 类型：QA

### 题目要点

label标签来定义表单控制间的关系。当用户选择该标签时，浏览器会自动将焦点转到和标签相关的表单控件上。

<details>
<summary>参考答案</summary>

label标签来定义表单控制间的关系。当用户选择该标签时，浏览器会自动将焦点转到和标签相关的表单控件上。

```html
<label for="Name">Number:</label>
<input type='text' name="Name" id="Name"/>

<label>Date:<input type="text" name="B"/></label>
```

</details>

## 75. 什么是 HTML 语义化？ {#question-a75b1e9d-9359-47b0-8614-1088eee4b085}

> 难度：1 · 类型：QA

### 题目要点

先看下什么是HTML：

<details>
<summary>参考答案</summary>

先看下什么是HTML：

> 超文本标记语言（英语：HyperText Markup Language，简称：HTML）是一种用于创建网页的标准标记语言。
> HTML元素是构建网站的基石。HTML允许嵌入图像与对象，并且可以用于创建交互式表单，它被用来结构化信息——例如标题、段落和列表等等，也可用来在一定程度上描述文档的外观和语义。

那么如何理解 Web 语义化？

通俗的来讲就是从代码上来展示页面的结构，而不是从最终视觉上来展示结构。

单纯的HTML代码是不带任何样式的只是用来标记这一段是标题、这一块是代码、那一个是要强调的内容等等。

但是为什么我们只写HTML在浏览器中不同的标签也是有不同的样式呢？

那是因为各个浏览器都自带的有相应标签的默认样式，为了方便在没有设定样式的情况下友好的展示页面。

良好的语义化代码可以直接从代码上就能看出来那一块到底是要表达什么内容。

## 为什么要使用语义化标签？

有伙伴会认为，我用DIV+CSS也能做出来一样的效果，虽然单纯看实现效果，两者并没有什么区别。

但是页面不止是给人看的，机器也要看爬虫也要看，网页结构更清晰方便开发维护。

特别是在网络或其他原因页面样式文件丢失的时候，良好语义结构组成的页面，肯定比全是div的页面对用户更友好。

总结下语义化的优点：

* 标签语义化有助于构架良好的HTML结构，有利于搜索引擎的建立索引、抓取。简单来说。
* 有利于不同设备的解析（屏幕阅读器，盲人阅读器等）
* 有利于构建清晰的机构，有利于团队的开发、维护

</details>

## 76. script 标签中， async 和 defer 两个属性有什么用途和区别？ {#question-2acd6447-af1d-4430-837f-a468b6c76ffe}

> 难度：2 · 类型：QA

### 题目要点

**答题思路**：

在HTML的`&lt;script&gt;`标签中，`async`和`defer`两个属性都用于控制脚本的异步加载，但它们之间存在关键的区别，主要体现在脚本加载和执行顺序上。

async属性

- **用途**：`async`属性用于指定脚本应该异步执行，即脚本的加载和解析不会阻塞HTML文档的解析，并且脚本一旦加载完成就会立即执行，不等待DOMContentLoaded事件触发。
- **特点**：`async`脚本的加载和执行是独立的，不会按照在HTML文档中出现的顺序执行。如果页面中有多个`async`脚本，它们的执行顺序是不确定的。

 defer属性

- **用途**：`defer`属性也用于指定脚本的异步加载，但与`async`不同的是，`defer`脚本会等到整个文档被解析完成后，才会执行。这意呀着，脚本的执行会按照在HTML文档中出现的顺序进行。
- **特点**：使用`defer`属性的脚本不会阻塞HTML文档的解析，同时保证了脚本的执行顺序，这对于依赖DOM元素或顺序执行的脚本非常有用。

区别

- **执行时机**：`async`脚本一旦加载完成就会立即执行，不等待其他脚本或DOM的加载完成；而`defer`脚本会等待整个文档解析完成后，按照在HTML文档中出现的顺序执行。
- **执行顺序**：`async`脚本的执行顺序是不确定的，多个`async`脚本可能会乱序执行；而`defer`脚本会按照在HTML文档中出现的顺序执行。

**考察要点**：

- **对HTML脚本加载机制的理解**：面试者需要了解HTML中脚本的加载和执行机制，以及它们如何影响页面的性能和功能。
- **对async和defer属性的掌握**：面试者需要准确理解`async`和`defer`属性的用途和区别，并能够根据实际需求选择合适的属性。
- **实际应用能力**：面试者需要能够将理论知识应用于实际开发中，解决与脚本加载和执行相关的问题。

<details>
<summary>参考答案</summary>

在 HTML 中会遇到以下三类 script：

```
<script src='xxx'></script>
<script src='xxx' async></script>
<script src='xxx' defer></script>
```

script标签用于加载脚本与执行脚本，直接使用script脚本时，html会按照顺序来加载并执行脚本，在脚本加载&执行的过程中，会阻塞后续的DOM渲染。

比如现在大家习惯于在页面中引用各种第三方脚本，但如果第三方服务商出现了一些小问题，比如延迟之类的，就会使得页面白屏。

针对上述情况，script标签提供了两种方式来解决问题，就是加入属性async以及defer，这两个属性使得script标签加载都不会阻塞DOM的渲染。

```
defer：此布尔属性被设置为向浏览器指示脚本在文档被解析后执行。
async：设置此布尔属性，以指示浏览器如果可能的话，应异步执行脚本。
```

## defer

如果script标签设置了defer属性，则浏览器会异步下载该文件并且不会影响后续DOM的渲染。

如果有多个设置了defer属性的script标签存在，则会按照顺序执行所有的script，defer脚本会在文档渲染完毕后，DOMContentLoaded事件调用前执行。

## async

async属性会使得script脚本异步的加载并在允许的情况下执行，而async的执行并不会按照script标签在页面中的顺序来执行，而是谁先加载完谁先执行。

</details>

## 77. 常用的 meta 元素有哪些？ {#question-c849aa25-0dae-49aa-8148-b1c410a7aa1e}

> 难度：1 · 类型：QA

### 题目要点

- **字符集**：`<meta charset="UTF-8">`
- **描述**：`<meta name="description" content="...">`
- **关键词**：`<meta name="keywords" content="...">`
- **作者**：`<meta name="author" content="...">`
- **视口**：`<meta name="viewport" content="...">`
- **刷新和重定向**：`<meta http-equiv="refresh" content="...">`
- **网页权限设置**：`<meta name="robots" content="...">`
- **兼容性**：`<meta http-equiv="X-UA-Compatible" content="IE=edge">`
- **Open Graph** 和 **Twitter Card** 元素用于社交媒体优化：`<meta property="og:image" content="...">`、`<meta name="twitter:card" content="summary_large_image">`

<details>
<summary>参考答案</summary>

> The <meta> tag provides metadata about the HTML document. Metadata will not be displayed on the page, but will be machine parsable.

<meta> 元素标签是提供有关HTML文档的元数据，元数据不会显示在页面上，但是能够被机器识别。

总而言之, meta标签是用来让机器识别的，同时它对SEO起着重要的作用。

## charset

指定了html文档的编码格式，常用的是utf-8(Unicode的字符编码)，还有ISO-8859-1(拉丁字母的字符编码)。当然还有其他的，但是一般不常用也就不介绍了

```html
<meta charset="utf-8">
```

## name & content

指定元数据的名称(这部分对SEO非常有用)

* author——定义了页面的作者

```html
<meta name="author" content="Tony">
```

* keywords——为搜索引擎提供关键字

```html
<meta name="keywords" content="HTML, CSS, JavaScript">
```

* description——对网页整体的描述

```html
<meta name="description" content="My tutorials on HTML, CSS and JavaScript">
```

* viewport——对页面视图相关进行定义

```
width=device-width——将页面宽度设置为跟随屏幕宽度变化而变化
initial-scale=1.0——设置浏览器首次加载页面时的初始缩放比例(0.0-10.0正数)
maximum-scale=1.0——允许用户缩放的最大比例(0.0-10.0正数)，必须大于等于minimum-scale
minimum-scale=1.0——允许用户缩放的最小比例(0.0-10.0正数)，必须小于等于maximum-scale
user-scalable=no——是否允许用户手动缩放(yes或者no)
```

``` html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minmum-scale=1.0">
```

* generator——包含生成页面软件的标识符

> which contains the identifier of the software that generated the page.

```html
<meta name="generator" content="Hexo 3.8.0">
```

* theme-color——定义主题颜色

```html
<meta name="theme-color" content="#222">
```

* http-equiv & content

> Provides an HTTP header for the information/value of the content attribute

* refresh——每30s刷新一次文档

```html
<meta http-equiv="refresh" content="30">
```

* X-UA-Compatible——告知浏览器以何种版本渲染界面。下面的例子有限使用IE最新版本

```html
<meta http-equiv="X-UA-Compatible" content="ie=edge">
```

关于是否有必要使用这一条在stack overflow尚且有争议。个人认为如果不想兼容低版本的IE，可以直接忽略这一条。

* Cache-Control——请求和响应遵循的缓存机制，可以声明缓存的内容，修改过期时间，可多次声明

> no-transform——不得对资源进行转换或转变。
> no-siteapp——禁止百度进行转码

```html
<meta http-equiv="Cache-Control" content="no-transform">
<meta http-equiv="Cache-Control" content="no-siteapp">
```

* property & content

可以让网页成为一个富媒体对象，同意网页内容被其他网站引用，同时在应用的时候不会只是一个链接，会提取相应的信息展现给用户。

```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://zjgyb.github.io/index.html">
<meta property="og:site_name" content="tony's blog">
```

</details>
