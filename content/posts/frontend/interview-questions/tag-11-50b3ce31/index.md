+++
title = "性能优化 面试题"
draft = false
tags = ["面试", "前端", "性能优化", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:29:31.361Z"
+++

共 52 道 性能优化 面试题。答案默认折叠，便于先自行作答。

## 1. 响应式开发中，如何避免窗口大小监听导致的重排抖动？ {#question-cf82f359-6b3e-494b-ba24-11d79fabb8b8}

> 难度：2 · 类型：QA

### 题目要点

响应式开发中 resize 导致抖动的本质原因是窗口变化会高频触发事件，从而反复触发布局计算。常见优化方式包括对 resize 事件进行节流或防抖以降低执行频率，避免在回调中混合 DOM 读写以减少强制同步布局，利用 `requestAnimationFrame` 控制更新时机，以及使用 `ResizeObserver`、媒体查询或容器查询等浏览器能力，让布局响应更多地交给浏览器完成，从而降低重排和重绘的成本。

<details>
<summary>参考答案</summary>

在响应式开发中，如果直接监听 `resize` 事件并在回调中执行布局计算或 DOM 操作，很容易引发频繁的 **重排（reflow）和重绘（repaint）**。原因在于浏览器在拖动窗口尺寸时会持续触发 `resize` 事件，如果每次触发都进行样式读取和 DOM 更新，就会造成布局计算不断被打断，从而出现明显的抖动或性能下降。

实际工程中通常会从 **事件触发频率控制、布局计算方式优化、浏览器能力利用** 三个层面进行处理。

首先是对 `resize` 事件进行频率控制。浏览器在拖拽窗口时可能每秒触发几十到上百次 `resize`，如果每次都重新计算布局，主线程压力会非常大。常见做法是通过 **节流（throttle）或防抖（debounce）** 将计算频率降低。例如在节流策略下，每隔一段时间才执行一次布局更新，从而避免在连续拖动过程中频繁触发布局计算。对于布局实时性要求较低的场景，防抖也比较适合，即在窗口停止变化后再执行计算。

其次是避免在 `resize` 回调中混合 **DOM 读写操作**。浏览器在读取布局信息（例如 `offsetWidth`、`getBoundingClientRect`）时，如果之前存在未提交的样式修改，会强制触发布局计算，这被称为 **强制同步布局（Forced Reflow）**。因此更好的方式是将读取和写入操作进行分离，例如先批量读取尺寸，再统一修改样式，或者借助 `requestAnimationFrame` 将 DOM 更新安排到浏览器下一帧执行，避免频繁打断渲染流程。

另外一个更现代的方案是尽量减少对 `window.resize` 的依赖，而是使用 **元素级尺寸监听机制**。浏览器已经提供了 `ResizeObserver` API，可以直接监听某个容器尺寸变化。当布局响应依赖的是容器宽度而不是窗口宽度时，这种方式更加精确，同时也减少无关 resize 触发带来的性能损耗。

在 CSS 层面也可以减少 JavaScript 的参与。例如使用 **媒体查询（media query）** 或 **容器查询（container query）** 来处理布局变化，让浏览器在样式计算阶段直接完成响应式适配。CSS 驱动的响应式布局通常比 JavaScript 监听 resize 更高效，因为浏览器可以对样式计算进行统一调度。

在大型前端项目中，还会进一步结合 **虚拟布局、组件级响应式控制、缓存计算结果** 等方式，避免在每次窗口变化时重新计算整个页面布局，从而减少重排的传播范围。

</details>

## 2. canvas 有什么优化渲染性能的方案 {#question-e150e0ff-0182-4410-b082-b7d9dc215616}

> 难度：3.5 · 类型：QA

### 题目要点

Canvas 优化重点在减少重绘和状态切换；通过脏矩形或多层 Canvas 避免全量绘制；复用 Path2D 和绘制状态降低 API 调用成本；利用 rAF 合并渲染、Worker 和 OffscreenCanvas 解耦计算与绘制；通过资源缓存和分辨率控制平衡性能与清晰度。

<details>
<summary>参考答案</summary>

在 Canvas 场景中，性能瓶颈很少来自“API 是否足够快”，而更多来自**渲染模型、状态管理和绘制策略是否合理**。一个高性能的 Canvas 引擎，核心目标是：**减少无效绘制、降低状态切换成本、把计算和绘制从主线程中解耦出来**。

首先要优化的是**绘制次数本身**。Canvas 是立即模式渲染，每一次 `draw` 都会直接作用在位图上，因此最重要的原则是避免全量重绘。常见做法是引入脏矩形机制，只重绘发生变化的区域；或者按层拆分 Canvas，例如将背景、静态元素和高频变化元素放在不同的 Canvas 中，静态层几乎不需要重绘，从而显著降低每帧绘制量。

其次是**绘制路径和状态的复用**。Canvas 的状态切换（如 `save / restore`、`fillStyle`、`transform`）本身是有成本的。引擎通常会在内部做状态缓存，避免重复设置相同的样式或变换。同时，对于复杂路径，可以提前构建 `Path2D` 对象并复用，而不是在每一帧中重复调用路径 API，这在图形数量较多时效果明显。

在渲染调度上，合理使用 **`requestAnimationFrame`** 是基本前提。引擎需要将多次状态变更合并到同一帧中执行，避免在一帧内多次触发绘制。进一步的优化是引入渲染队列或批处理机制，将相同类型的绘制操作集中处理，减少上下文切换。

对于计算密集型场景，还需要关注**主线程负载**。几何计算、碰撞检测、布局计算等可以放到 Web Worker 中执行，主线程只负责最终绘制。随着 OffscreenCanvas 的支持，甚至可以将部分绘制过程本身迁移到 Worker 中，从根本上降低对主线程的占用，这在复杂动画和大规模节点场景中尤为关键。

在资源层面，图片是常见的性能瓶颈。引擎通常会对图片资源进行预加载和尺寸适配，避免在绘制阶段触发解码和缩放；对于重复使用的位图，可以通过离屏 Canvas 缓存绘制结果，再在主 Canvas 中快速复用，相当于手动实现一层纹理缓存。

最后还需要关注分辨率与清晰度的平衡。直接按设备 DPR 放大 Canvas 尺寸虽然能提升清晰度，但会线性增加像素填充成本。成熟的引擎往往允许在性能和清晰度之间做动态取舍，例如在动画过程中降低渲染分辨率，在静态状态下再恢复高清绘制。

总体来看，Canvas 性能优化并不是单点技巧，而是一套围绕“少画、复用、分层、解耦”的系统性设计。

</details>

## 3. 在 DOM 结构比较复杂的情况下，为什么操作虚拟 DOM 的性能比操作真实 DOM 好？ {#question-bd3ad515-7432-440f-a7c0-46e80daf5ddb}

> 难度：2 · 类型：QA

### 题目要点

* **开销对比**：JS 对象的操作速度远快于浏览器内置 DOM API 的调用。
* **渲染频率**：通过批量合并更新，将多次渲染压缩为一次，降低了重排和重绘的频率。
* **更新粒度**：利用 Diff 算法实现最小化补丁更新，避免了因“全量刷新”导致的昂贵代价。
* **性能下限**：在复杂场景下，提供了不依赖于开发者个人优化水平的稳定性能表现。

<details>
<summary>参考答案</summary>

作为前端开发者，必须修正一个常见的认知偏误：**虚拟 DOM 本身并不比原生 DOM 快。**

事实上，没有任何框架的操作能比经过极致优化的原生 JS 操作更高效。

虚拟 DOM 真正的优势在于：在**复杂应用**和**频繁状态变更**的场景下，它能通过算法策略，规避开发者可能写出的低效代码，从而保证性能的“下限”。

以下是深度解析：

### 1. 减少昂贵的重排（Reflow）与重绘（Repaint）

真实 DOM 的属性极其沉重（包含成百上千个属性），且与浏览器的渲染引擎深度耦合。当我们频繁操作真实 DOM 时，每一步修改都可能触发浏览器的样式计算、布局（Layout）和绘制（Painting）。

在 DOM 结构复杂时，一次细微的节点变动可能会引发连锁反应，导致整棵渲染树的重新计算。虚拟 DOM 通过在内存中维护一个轻量级的 JS 对象，将所有的改动先在内存中进行计算，最终只将**差量（Delta）**一次性应用到真实 DOM 上，极大地减少了浏览器渲染管线的触发频率。

### 2. 批量处理与合并更新（Batching）

在复杂交互中，一个操作可能触发多个状态变更。如果直接操作真实 DOM，可能会连续触发多次渲染流程。

* **原生操作**：修改 10 次 DOM，浏览器可能会尝试进行多次重绘。
* **虚拟 DOM**：它具有“缓冲”作用。React 等框架会将短时间内的多次 `setState` 合并，在内存中完成 10 次虚拟 DOM 的构建和 Diff 比对，最后对真实 DOM 只执行 **1 次** 必要的更新。这种合并机制在复杂结构下能显著降低计算开销。

### 3. 差量更新（Diffing Algorithm）

当 DOM 树非常深且复杂时，手动寻找最精确的更新点是非常耗时的。如果开发者为了省事直接使用 `innerHTML` 替换父容器，会导致所有子节点被销毁并重新创建，这在性能上是灾难性的。

虚拟 DOM 的 Diff 算法通过同层比较、唯一标识（Key）等策略，能够精确识别出哪些节点是移动了、哪些是属性变了、哪些是真正需要删除的。它解决了**“全量替换”导致的资源浪费**。

### 4. 跨越“性能陷阱”的均值保证

在大型团队开发中，不同水平的开发者编写的代码质量参差不齐。虚拟 DOM 的意义在于提供了一个**高性能的默认行为**。它让一个普通开发者写出的代码，在处理复杂 DOM 结构时，也能拥有接近资深开发者手动优化后的性能表现。它解决的是**工程化环境下的平均性能问题**。

</details>

## 4. 如何取消重复请求？ {#question-2ba85ac3-466e-49ae-b75a-4545d1556545}

> 难度：3 · 类型：QA

### 题目要点

1. 通过请求拦截器维护一个请求 Map，利用 `AbortController` 或 `CancelToken` 实现取消。
2. 搜索、输入类场景可结合防抖、节流策略减少重复触发。
3. 区分不同业务场景的重复请求处理策略，关键操作要依赖后端幂等性保证安全性。

<details>
<summary>参考答案</summary>

取消重复请求主要是为了避免无意义的网络消耗和数据覆盖问题。

常见的实现思路是 **在发起请求前判断是否已经存在相同的请求，如果存在则进行取消或延迟处理**。

在具体实现上，通常会结合请求库的能力：

首先，使用 `axios` 这样的请求库时，可以通过其 `CancelToken` 或 `AbortController` 来管理请求。实现上通常在请求拦截器里，针对请求的 URL、请求方法、参数拼成一个唯一标识，将其存入一个 Map 中。如果新的请求在发起时检测到该标识已经存在，则取消掉上一次的请求，再更新为新的请求。这样就能保证同一个资源只会有一次有效请求。

其次，对于一些需要实时请求的场景（例如输入搜索框时的联想请求），也可以通过 **防抖与节流** 配合请求取消来降低重复请求的概率。比如用户快速输入时，只有最后一次输入才真正触发请求，中间的多余请求都会被主动取消。

此外，若在项目中使用 `fetch`，则可以通过 `AbortController` 原生支持取消请求。只要在请求发起时持有对应的 `controller`，下次发起同类请求时调用 `controller.abort()` 即可实现取消。

在设计层面，不同场景对“重复请求”的定义可能不同。比如数据列表的刷新按钮，如果用户连续点击两次，可能业务上只需保留最后一次；而对于支付、下单类请求，则需要在后端结合幂等性校验，前端的请求取消只能作为辅助措施。

</details>

## 5. 如何避免JavaScript代码对浏览器渲染的阻塞？ {#question-9cf927ac-d134-4590-9a2a-0cb73bc3e2c8}

> 难度：3 · 类型：QA

### 题目要点

1. **优化加载顺序**：`defer` / `async` / 脚本底部，减少 HTML 解析阻塞；
2. **拆分长任务**：将大任务分块执行或异步调度，避免阻塞渲染；
3. **按需加载 JS**：减少首屏加载体积，延迟非关键脚本；
4. **使用 Web Worker**：处理耗时任务，不占用主线程；
5. **减少回流重绘**：避免频繁读写 layout、批量操作 DOM。

<details>
<summary>参考答案</summary>

JavaScript 是单线程执行的，如果不加控制，会 **阻塞浏览器解析 HTML 和渲染页面**，导致首屏渲染延迟。避免阻塞的策略主要有以下几类：

## 一、调整 `&lt;script&gt;` 加载方式

1. **`defer`**

* 解析 HTML 时不会阻塞，脚本在 DOM 构建完成后按顺序执行。
* 适合有依赖关系、需要操作 DOM 的脚本。

```html
<script src="main.js" defer></script>
```

2. **`async`**

* 脚本异步加载，加载完成立即执行，可能会打乱执行顺序。
* 适合无依赖关系、独立的脚本（如统计、广告）。

```html
<script src="analytics.js" async></script>
```

3. **将脚本放在 `<body>` 底部**

* HTML 解析完成后才执行 JS，减少首屏阻塞。

---

## 二、减少同步、长时间运行的 JS

1. **避免长任务**

* 单次执行时间过长的 JS 会阻塞渲染。
* 可以将大任务拆分成小块，用 `setTimeout` 或 `requestIdleCallback` 异步执行。

```js
function processLargeArray(arr) {
  let i = 0;
  function chunk() {
    const end = Math.min(i + 1000, arr.length);
    for (; i < end; i++) {
      // 处理逻辑
    }
    if (i < arr.length) {
      setTimeout(chunk, 0);
    }
  }
  chunk();
}
```

2. **避免阻塞样式计算**

* 避免在循环中频繁读写 layout 属性（如 `offsetWidth`、`scrollTop`），这会触发同步回流。
* 通过 **缓存 DOM 信息** 或 **批量修改样式** 避免回流。

---

## 三、按需加载资源

1. **动态按需加载 JS**

* 仅加载当前页面需要的模块，减少阻塞。
* 可以使用 **Code Splitting** 或动态 `import()`。

```js
button.addEventListener('click', async () => {
  const module = await import('./heavyModule.js');
  module.doSomething();
});
```

2. **延迟加载非关键 JS**

* 将统计、广告等第三方脚本延迟加载，保证首屏渲染。

---

## 四、利用 Web Worker 执行耗时任务

* Web Worker 在**独立线程**执行 JS，主线程不会被阻塞。
* 适合 CPU 密集型计算，如数据处理、图片处理等。

```js
const worker = new Worker('worker.js');
worker.postMessage(largeData);
worker.onmessage = (e) => console.log('处理结果:', e.data);
```

</details>

## 6. 在 html 页面渲染过程中，哪些因素可能会影响页面的渲染性能？如何优化？ {#question-abd67a8c-15c5-421f-9d48-c4aa19869a88}

> 难度：3 · 类型：QA

### 题目要点

* **渲染性能瓶颈**：DOM 复杂度、CSS 复杂度、JS 阻塞、资源加载慢、回流重绘频繁。
* **优化思路**：减少 DOM/样式复杂度，避免阻塞 JS，压缩和懒加载资源，优化动画和频繁操作。
* **原则**：减少浏览器计算量，合理使用 GPU 加速，提升首屏渲染速度和流畅度。

<details>
<summary>参考答案</summary>

在 HTML 页面渲染过程中，性能瓶颈主要出现在 **浏览器的渲染流水线**上，包括 **解析 HTML/CSS/JS、构建 DOM/CSSOM、布局（Layout）、绘制（Paint）、合成（Composite）** 等阶段。

## 一、影响渲染性能的主要因素

1. **DOM 结构复杂度**

* 节点过多、层级过深会增加浏览器的 **DOM 构建时间** 和 **布局计算成本**。
* **表现**：页面渲染慢，回流（reflow）和重绘（repaint）频繁。

2. **CSS 复杂度**

* 复杂选择器（如通配符 `*`、嵌套选择器）会增加匹配成本。
* 使用大量动画、阴影、滤镜（filter）也会增加绘制开销。

3. **JavaScript 阻塞**

* `&lt;script&gt;` 默认阻塞 HTML 解析，影响 DOM 构建。
* JS 操作 DOM、频繁修改样式，会触发回流和重绘。

4. **图片和资源大小**

* 大图、未压缩资源会延长页面加载时间。
* 网络请求阻塞 CSS/JS 渲染也会延迟首屏显示。

5. **布局抖动与频繁回流**

* 通过 JS 修改 DOM 或样式属性（如 `offsetWidth`, `scrollTop`）会触发同步回流，频繁操作会严重拖慢渲染。

6. **浏览器重绘与合成成本**

* CSS 动画使用会触发重绘或合成，复杂的 DOM 树和层叠关系会增加 GPU 开销。

---

## 二、优化策略

1. **优化 DOM 结构**

* 减少节点数量、避免过深层级。
* 使用文档碎片（`DocumentFragment`）或虚拟 DOM 批量更新。

2. **优化 CSS**

* 避免低效选择器，尽量使用类选择器；
* CSS 动画优先使用 `transform` 和 `opacity`，利用 GPU 加速；
* 减少不必要的样式属性，避免触发回流。

3. **优化 JavaScript**

* 将 `&lt;script&gt;` 放在 `<body>` 底部，或使用 `defer` / `async` 属性；
* 批量修改 DOM，减少频繁的读取/写入混合操作；
* 使用防抖/节流优化滚动、resize 等频繁触发的事件。

4. **资源优化**

* 图片压缩、使用 WebP 格式；
* CSS/JS 文件压缩、按需加载、使用 HTTP/2 或 CDN；
* 图片懒加载，减少首屏阻塞。

5. **减少回流和重绘**

* 使用 `class` 批量修改样式而不是逐条修改；
* 避免在循环中频繁读取 layout 信息；
* 对动画使用 `transform`、`opacity`，避免改变布局属性。

6. **使用浏览器优化技术**

* CSS will-change 提前告知浏览器将要变化的属性；
* 合理使用硬件加速（GPU layer）处理动画；
* 对长列表使用虚拟滚动（Virtual Scroll）或分页加载。

</details>

## 7. 如何优化音频和视频的加载性能？ {#question-315725cc-0ec3-4ea0-9ef2-2b301190dbb0}

> 难度：2 · 类型：QA

### 题目要点

通过选择合适的编码格式、使用流媒体技术、压缩文件、懒加载、CDN 和合理的缓存策略，可以显著提升音频和视频的加载性能，改善用户体验。定期监测和分析性能也是确保持续优化的重要环节。

<details>
<summary>参考答案</summary>

优化音频和视频的加载性能可以提高用户体验，减少缓冲时间，下面是一些常见的优化策略：

### **1. 使用合适的编码格式**

- **选择高效的编码**：使用现代音频和视频编码格式，如 AAC（音频）和 H.264 或 VP9（视频），以在保持质量的同时减小文件大小。

### **2. 采用流媒体技术**

- **流媒体协议**：使用流媒体协议（如 HLS 或 DASH）进行分段传输，允许用户在未完全加载的情况下开始播放，从而减少加载时间。

### **3. 压缩和优化文件**

- **压缩文件**：使用工具（如 HandBrake）压缩音频和视频文件，减小文件大小以加速加载。
- **调整分辨率**：根据目标设备调整视频分辨率，移动设备可以使用较低分辨率以提高加载速度。

### **4. 使用懒加载**

- **懒加载技术**：只在用户即将观看时加载音频或视频。例如，可以在用户滚动到包含媒体的部分时再开始加载。

### **5. 提前加载**

- **预加载属性**：使用 `<audio>` 和 `<video>` 标签的 `preload` 属性，设置为 `metadata` 或 `auto`，以控制资源的预加载方式。

```html
<video preload="metadata" src="video.mp4"></video>
```

### **6. 使用内容分发网络 (CDN)**

- **部署 CDN**：将音频和视频文件托管在 CDN 上，以加速全球用户的访问，减少延迟和缓冲。

### **7. 设置合理的缓存策略**

- **HTTP 缓存**：利用浏览器缓存，通过设置适当的缓存头（如 `Cache-Control` 和 `Expires`），使用户在重复访问时能够更快加载。

### **8. 监测和分析性能**

- **使用工具**：利用监测工具（如 Google Analytics 和 WebPageTest）分析音频和视频的加载性能，识别瓶颈并进行优化。

### **9. 设计友好的用户界面**

- **缓冲指示器**：提供明确的缓冲指示器和加载动画，让用户知道正在加载，提升用户体验。

</details>

## 8. 以用户为中心的前端性能指标有哪些？ {#question-a2fc1424-164d-41c5-a366-0e118ccb2f09}

> 难度：3 · 类型：QA

### 题目要点

以用户为中心的性能指标不仅关注技术层面的加载时间和资源处理，还关注用户实际的使用体验。通过这些指标，开发者可以更好地优化页面性能，提高用户的满意度和体验感。

<details>
<summary>参考答案</summary>

以用户为中心的前端性能指标关注的是用户体验，即用户在使用页面或应用时的实际感受。这些指标着重于页面的加载速度、交互性和视觉响应。以下是一些常用的用户中心性能指标：

### **1. 首次绘制（First Paint, FP）**

- **定义**：从导航开始到浏览器首次将像素渲染到屏幕上的时间。
- **重要性**：FP 反映了页面的初步响应速度，是用户感知性能的一个重要指标，是用户的第一印象。较快的 FP 能让用户感受到页面加载更迅速，提升用户体验。

### **2. 首次内容绘制（First Contentful Paint, FCP）**

- **定义**：从用户发起请求到浏览器首次绘制任何内容（文本、图像等）的时间。
- **重要性**：表示用户首次看到页面上有意义内容的时间，对用户感知页面加载速度至关重要。

### **3. 最大内容绘制（Largest Contentful Paint, LCP）**

- **定义**：从用户发起请求到页面中最大可视内容（如图像或文本）完全绘制的时间。
- **重要性**：衡量用户能看到页面的主要内容的时间，对用户体验有重要影响。

### **4. 首次输入延迟（First Input Delay, FID）**

- **定义**：从用户首次与页面交互（如点击、触摸）到浏览器能够响应这个交互的时间。
- **重要性**：衡量页面对用户输入的响应时间，直接影响用户交互的流畅性。

### **5. 页面交互时间（Time to Interactive, TTI）**

- **定义**：从页面加载开始到页面变得完全可交互的时间。
- **重要性**：表示页面完全加载并且所有重要的脚本和事件监听器已准备好，用户可以与页面交互的时间。

### **6. 页面完全加载时间（Load Time）**

- **定义**：从用户发起请求到页面的所有资源（如图片、CSS、JavaScript）完全加载并可用的时间。
- **重要性**：全面反映页面的加载性能，用户需要等待页面完全加载的时间。

### **7. 视觉稳定性（Cumulative Layout Shift, CLS）**

- **定义**：衡量页面内容在加载过程中视觉稳定性的指标，计算内容移动的总和。
- **重要性**：反映了页面在加载过程中布局的稳定性，避免页面内容在加载时发生位移，影响用户体验。

### **8. 渲染时间（Render Time）**

- **定义**：从页面加载开始到页面内容渲染完成的时间。
- **重要性**：影响用户看到页面的速度，通常与 FCP 和 LCP 相关联。

### **9. 延迟（Latency）**

- **定义**：网络延迟或服务器响应时间，指用户请求到服务器接收请求的时间间隔。
- **重要性**：影响用户感知的速度，尤其是在使用需要大量数据交换的应用时。

### **10. 资源加载时间**

- **定义**：不同资源（如图片、脚本、样式表）的加载时间。
- **重要性**：影响页面的整体加载时间和用户的体验，特别是大文件或慢速网络环境下。

### **11. 用户感知性能**

- **定义**：通过用户调查、反馈或分析工具收集的关于页面加载和交互的实际用户体验数据。
- **重要性**：反映用户对页面性能的真实感受，帮助了解用户的满意度和体验问题。

</details>

## 9. 浏览器缓存中 Memory Cache 和 Disk Cache，有什么区别？ {#question-67bb706f-a325-4e89-9940-05ab3bcf4bf6}

> 难度：0.5 · 类型：QA

### 题目要点

- **Memory Cache** 是内存中的缓存，速度快但生命周期短，适合频繁访问的资源。
- **Disk Cache** 是硬盘中的缓存，速度慢但生命周期长，适合存储大量或长期有效的资源。

<details>
<summary>参考答案</summary>

在浏览器缓存中，`Memory Cache` 和 `Disk Cache` 都用于存储网页资源以加速加载速度，但它们的存储位置和使用方式有所不同。

以下是它们的主要区别：

### **Memory Cache**

1. **存储位置**：
   - 存储在浏览器内存中，即计算机的RAM。

2. **存取速度**：
   - 由于数据存储在内存中，访问速度非常快。通常用于存储最近访问的资源，以便快速响应。

3. **缓存生命周期**：
   - 数据在内存中存储，生命周期较短。如果浏览器关闭或刷新，内存缓存中的数据通常会被清除。

4. **适用场景**：
   - 适合存储需要频繁访问的资源，如当前页面的CSS、JavaScript、图片等。

### **Disk Cache**

1. **存储位置**：
   - 存储在计算机的硬盘驱动器中。

2. **存取速度**：
   - 由于硬盘读写速度较慢，访问速度比内存缓存慢。但硬盘缓存可以存储大量数据，适合长期存储资源。

3. **缓存生命周期**：
   - 数据在硬盘中存储，生命周期较长。即使浏览器关闭或计算机重启，数据通常仍然保留，直到被清除或过期。

4. **适用场景**：
   - 适合存储不需要频繁更新的资源，如大容量文件、长期有效的静态资源等。

</details>

## 10. Service Worker 是如何缓存 http 请求资源的？ {#question-b84d40fe-e50a-48e1-b6bf-ddaf036b64fd}

> 难度：3.5 · 类型：QA

### 题目要点

Service Worker 通过拦截 HTTP 请求，并使用缓存 API 存储和管理缓存资源，使得应用能够离线访问，提高了应用的性能和可靠性。核心过程包括注册 Service Worker、在 `install` 事件中预缓存资源、在 `fetch` 事件中拦截请求并从缓存或网络返回资源，以及在 `activate` 事件中进行缓存清理。

<details>
<summary>参考答案</summary>

Service Worker 的缓存机制是通过缓存 API 实现的，它允许开发者拦截和缓存 HTTP 请求，以提高离线体验和加速页面加载。以下是 Service Worker 缓存 HTTP 请求资源的基本流程和原理：

### **1. 注册 Service Worker**

首先，Service Worker 需要在浏览器中注册。通常在主线程（如 JavaScript 入口文件）中进行注册：

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### **2. 安装 Service Worker**

在 Service Worker 脚本中，首先会触发 `install` 事件。在这个事件中，可以预缓存一些资源，以便在 Service Worker 激活后立即可用：

```javascript
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
        '/images/logo.png'
      ]);
    })
  );
});
```

### **3. 激活 Service Worker**

`activate` 事件在 Service Worker 安装完成后触发。可以在这个事件中进行缓存清理，删除旧的缓存：

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // 这里可以指定要删除的缓存
          return cacheName !== 'my-cache-v1';
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
```

### **4. 拦截和缓存请求**

`fetch` 事件允许 Service Worker 拦截所有的网络请求。可以根据需要从缓存中返回资源，或将请求转发到网络：

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 如果缓存中有匹配的资源，直接返回
      if (cachedResponse) {
        return cachedResponse;
      }

      // 否则，发起网络请求
      return fetch(event.request).then(response => {
        // 克隆响应对象，因为响应只能被消费一次
        const responseClone = response.clone();

        // 将网络请求的结果缓存
        caches.open('my-cache-v1').then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(() => {
      // 网络和缓存都失败的情况
      return new Response('Oops, something went wrong.');
    })
  );
});
```

### **5. 资源管理**

- **缓存清理**：定期删除过期或不再需要的缓存，保持缓存的健康状态。
- **缓存策略**：可以实现不同的缓存策略，如缓存优先、网络优先、缓存和网络同时等。

</details>

## 11. canvas 性能为何会比 html/css 好？ {#question-1461ed4b-a23d-4ae7-9b00-78d10a57eb29}

> 难度：3 · 类型：QA

### 题目要点

- **直接渲染**：`<canvas>` 的绘图操作是直接的，减少了浏览器的计算开销。
- **无 DOM 操作**：避免了 DOM 更新带来的性能损耗。
- **硬件加速**：利用 GPU 加速图形渲染。
- **高效批处理**：可以进行高效的批量渲染操作。
- **细粒度控制**：允许精确控制图形的每个像素和渲染过程。

由于这些优势，`<canvas>` 在需要大量图形渲染和动画的应用场景（如游戏、数据可视化等）中表现得更为高效。

<details>
<summary>参考答案</summary>

`<canvas>` 性能优于 HTML/CSS 的原因主要涉及以下几点：

### **1. 低级别绘图操作**

- **直接绘图**：`<canvas>` 允许直接进行像素级别的绘图操作。它通过 JavaScript 提供了一个可以直接操作像素的 API，这使得绘制复杂图形和动画的性能更高，因为可以避开 DOM 和 CSS 渲染的开销。

### **2. 无 DOM 更新开销**

- **无需 DOM 操作**：使用 `<canvas>` 绘制图形时，不涉及 DOM 的增删改操作，而这些操作通常会引发重排（reflow）和重绘（repaint）。这些操作是性能开销较大的，特别是在复杂的布局和样式计算中。

### **3. 高效的渲染路径**

- **批量渲染**：`<canvas>` 允许通过一次绘制命令批量渲染多个图形，这与 HTML/CSS 的逐个渲染不同。Canvas 的绘图操作是批处理的，可以减少浏览器的渲染次数。

### **4. GPU 加速**

- **硬件加速**：现代浏览器通常对 `<canvas>` 渲染进行硬件加速，利用 GPU 处理图形渲染，从而大幅提升性能。相比之下，HTML/CSS 渲染通常依赖于 CPU 计算，尽管一些 CSS 渲染也可能得到 GPU 加速，但整体上可能不如 `<canvas>` 效率高。

### **5. 精确控制渲染**

- **像素级控制**：`<canvas>` 允许开发者精确控制每个像素的绘制方式。这种精细的控制使得开发者可以实现各种复杂的图形效果，而不必担心被 DOM 和 CSS 布局的限制。

### **6. 动画性能**

- **平滑动画**：由于 `<canvas>` 绘制的每一帧都是独立的，因此在进行动画时，它可以保持较高的帧率，特别是在进行大量绘制操作时。这种高效的帧率通常比使用 CSS 动画或 JavaScript 操作 DOM 更容易实现流畅的动画效果。

</details>

## 12. dom 渲染能使用 GPU 加速吗？ {#question-5994273f-200b-4dd2-99d7-d05efd937a04}

> 难度：2 · 类型：QA

### 题目要点

- **部分支持**：DOM 渲染可以利用 GPU 加速，特别是涉及到 CSS 动画、转换和合成层时。
- **优化动画**：使用 `transform` 和 `opacity` 可以帮助利用 GPU 加速，提高动画性能。
- **浏览器差异**：不同浏览器对 GPU 加速的支持和效果有所不同。
- **合成层**：GPU 加速的效果主要体现在合成层的使用上，减少了对主渲染层的影响。

因此，虽然 DOM 渲染能够利用 GPU 加速，优化图形和动画性能，实际效果和全面加速还依赖于具体的使用方式和浏览器的实现。

<details>
<summary>参考答案</summary>

DOM 渲染可以利用 GPU 加速，但这种加速不是全面的，而是依赖于浏览器对特定类型的操作和属性的优化。

以下是一些与 GPU 加速相关的关键点：

### **1. GPU 加速的概念**

- **GPU 加速**：指的是将图形渲染的部分任务从 CPU 转移到 GPU 上进行处理，从而提高渲染性能和效率。GPU 适合处理并行任务，这使得它在图形处理和渲染方面特别有效。

### **2. CSS 硬件加速**

- **转换与动画**：现代浏览器通常会对使用 `transform` 和 `opacity` 的 CSS 动画和转换进行 GPU 加速。这些属性通常会触发合成层的创建，利用 GPU 进行渲染，从而提高动画的平滑度和性能。

  ```css
  .animated {
    transform: translate3d(0, 0, 0); /* 使用 translate3d 启用 GPU 加速 */
  }
  ```

### **3. CSS 处理的其他优化**

- **合成层**：浏览器会将具有 GPU 加速的元素放到一个独立的合成层中，GPU 可以独立于 CPU 处理这些层，从而减少重排（reflow）和重绘（repaint）的开销。这对于频繁更新的元素（如滚动条）尤其有效。

- **复合与合成**：CSS 动画和变换（transform）可能触发合成（compositing），在独立的合成层上进行处理，减少对主渲染层的影响。

### **4. 浏览器的不同处理**

- **浏览器差异**：不同浏览器对 GPU 加速的支持和实现可能有所不同。例如，Chrome、Firefox 和 Safari 都对 GPU 加速的支持有所不同，因此实际效果可能会有差异。

### **5. 限制与考虑**

- **并非全面加速**：虽然 GPU 加速可以提高性能，但它并不能解决所有性能问题。例如，重排（reflow）和布局计算通常仍然依赖于 CPU。

- **合成层开销**：创建和维护合成层也有一定的开销，如果使用不当，可能会导致性能下降而不是提升。

</details>

## 13. CSR、SSR、SSG、NSR、ESR、ISR 都是什么？ {#question-da682e52-a098-4f33-a4b5-9fd40bb48e99}

> 难度：3 · 类型：QA

### 题目要点

- **CSR** 和 **SSR** 是客户端和服务器端的渲染策略，各有优缺点。
- **SSG** 适用于完全静态的内容，而 **ISR** 允许在静态生成的基础上进行增量更新。
- **NSR** 可能包括任何非静态渲染策略。
- **ESR** 主要用于优化内容分发的速度和效率。

<details>
<summary>参考答案</summary>

这些术语涉及现代 Web 开发中不同的渲染和数据获取技术，主要用于描述不同的页面渲染模式及其对用户体验的影响。以下是这些术语的解释：

### **1. CSR（Client-Side Rendering）客户端渲染**

- **定义**：客户端渲染指的是在浏览器中使用 JavaScript 渲染整个应用程序的过程。服务器会发送一个空的 HTML 模板和必要的 JavaScript 文件，浏览器接收到这些文件后，运行 JavaScript 代码来动态生成和插入 HTML 内容。
- **优点**：
  - 更快的用户交互响应，因为页面已经在客户端加载，用户的后续操作不需要请求新的页面。
  - 更流畅的用户体验，因为页面内容的更新是即时的。
- **缺点**：
  - 初次加载时间较长，因为浏览器需要下载和解析大量的 JavaScript。
  - 对搜索引擎优化（SEO）不友好，因为搜索引擎爬虫可能无法完全解析 JavaScript 生成的内容。

### **2. SSR（Server-Side Rendering）服务器端渲染**

- **定义**：服务器端渲染指的是在服务器上生成 HTML 内容，并将其发送到客户端。用户请求页面时，服务器处理该请求并返回完整的 HTML 页面，浏览器仅需要显示这些内容。
- **优点**：
  - 初次加载速度较快，因为页面内容已经在服务器上生成。
  - 对 SEO 友好，因为搜索引擎可以直接抓取到完整的 HTML 内容。
- **缺点**：
  - 用户交互可能会比 CSR 稍慢，因为每次页面变更都需要通过服务器请求新的内容。
  - 服务器负担较重，因为需要处理每个页面请求并生成 HTML。

### **3. SSG（Static Site Generation）静态站点生成**

- **定义**：静态站点生成是在构建时生成所有页面的 HTML 文件。这些页面在构建时就被生成，并在服务器上作为静态文件提供给客户端。
- **优点**：
  - 极快的页面加载速度，因为所有内容都是静态文件，直接从 CDN 或服务器上提供。
  - 最低的服务器负担，因为服务器只需提供静态文件。
- **缺点**：
  - 不适合内容频繁变化的网站，因为每次内容更新都需要重新生成和部署整个站点。
  - 对动态内容支持有限。

### **4. NSR（Not Static Rendering）非静态渲染**

- **定义**：NSR 是一个比较模糊的术语，通常指任何不使用静态站点生成的渲染方法，通常包括 CSR 和 SSR 的组合。
- **优点**：可以灵活地处理动态内容和交互。
- **缺点**：可能需要更多的服务器资源和复杂的架构设计。

### **5. ESR（Edge-Side Rendering）边缘端渲染**

- **定义**：边缘端渲染是指在内容分发网络（CDN）的边缘节点上生成和缓存页面内容。请求会被路由到离用户最近的边缘节点，边缘节点负责生成和返回页面内容。
- **优点**：
  - 快速的响应时间，因为内容生成和缓存发生在离用户较近的边缘节点。
  - 减少了对中央服务器的负担。
- **缺点**：
  - 边缘节点的配置和维护可能会更复杂。
  - 对动态内容处理可能不如 SSR 灵活。

### **6. ISR（Incremental Static Regeneration）增量静态再生**

- **定义**：增量静态再生是一种将静态站点生成和服务器端渲染结合的技术，允许在不重新生成整个站点的情况下，单独更新某些静态页面。当某个页面被请求时，服务器会在后台更新页面的静态版本，并将新的版本提供给后续的用户请求。
- **优点**：
  - 支持动态内容更新，同时保留静态站点生成的性能优势。
  - 更新速度快，能够在不影响整个站点的情况下更新单个页面。
- **缺点**：
  - 需要适当的缓存和再生策略来确保内容的时效性和一致性。

</details>

## 14. script 预加载方式有哪些，这些加载方式有何区别？ {#question-53f0ec19-c292-4d4c-bcf0-dc50f9ba6b59}

> 难度：1.5 · 类型：QA

### 题目要点

- **`&lt;script&gt;`**：默认同步加载，阻塞文档渲染。
- **`defer`**：异步加载，但在 DOMContentLoaded 事件之前按顺序执行。适合 `<head>` 部分的脚本。
- **`async`**：异步加载，立即执行，不保证执行顺序。适合独立的脚本。
- **`preload`**：提前加载资源，适合当前页面所需的关键资源。
- **`prefetch`**：预先加载可能会在未来页面中使用的资源，适合优化未来的页面加载。
- **`module`**：模块化脚本，延迟加载，支持 ES6 模块特性。

每种预加载方式都有其适用的场景和特点，通过合理选择和使用这些方式，可以优化网页性能和资源加载效率。

<details>
<summary>参考答案</summary>

在网页中，`&lt;script&gt;` 标签有几种预加载方式可以用来优化脚本的加载和执行。不同的预加载方式具有不同的特性和应用场景，以下是主要的预加载方式及其区别：

### **1. `&lt;script&gt;` 标签的默认行为**

```html
<script src="script.js"></script>
```
- **行为**：默认情况下，`&lt;script&gt;` 标签会在 HTML 文档解析时同步加载和执行脚本。这会阻塞文档的渲染，直到脚本下载并执行完毕。

### **2. `defer` 属性**

```html
<script src="script.js" defer></script>
```
- **行为**：`defer` 属性表示脚本将在文档解析完成后（即 `DOMContentLoaded` 事件之前）异步执行。这种方式不会阻塞 HTML 文档的解析，脚本会按顺序执行。
- **特点**：
  - 适用于 `<head>` 部分的脚本。
  - 保证脚本执行顺序与在文档中的顺序一致。
  - 有效避免了脚本加载对页面渲染的阻塞。

### **3. `async` 属性**

```html
<script src="script.js" async></script>
```
- **行为**：`async` 属性表示脚本将异步加载并立即执行（不管 HTML 是否解析完毕）。一旦脚本下载完成，它将立即执行，而不会等待其他脚本或 HTML 解析完成。
- **特点**：
  - 适用于不依赖于其他脚本的脚本（如分析脚本、广告脚本等）。
  - 脚本的执行顺序与在文档中的顺序不一定一致，取决于哪个脚本最早加载完成。
  - 有可能会影响页面的渲染顺序和依赖脚本的执行顺序。

### **4. `preload` 和 `prefetch`**

```html
<link rel="preload" href="script.js" as="script">
<link rel="prefetch" href="script.js" as="script">
```
- **行为**：
  - **`preload`**：在页面加载过程中提前加载资源，以便资源在需要时能更快地使用。通常用于确保关键资源在页面渲染前已加载完成。
  - **`prefetch`**：指示浏览器预先加载可能在将来页面中使用的资源，以提高未来页面的加载速度。通常用于优化用户可能接下来的操作。
- **特点**：
  - `preload` 用于当前页面中即将需要的资源，加载优先级较高。
  - `prefetch` 用于未来可能需要的资源，加载优先级较低。
  - `preload` 和 `prefetch` 可以提高资源的加载速度，但它们的使用场景和效果有所不同。

### **5. `module` 类型脚本**

```html
<script type="module" src="script.js"></script>
```
- **行为**：`type="module"` 指定脚本为 ECMAScript 模块，支持模块化导入和导出。模块脚本会被延迟加载并在 HTML 文档解析完成后执行。
- **特点**：
  - 支持 `import` 和 `export` 语法，允许模块化开发。
  - 默认具有 `defer` 行为，保证模块脚本在 DOMContentLoaded 事件触发之前执行。

</details>

## 15. 如何防止 CSS 阻塞渲染？ {#question-d598569e-a03a-4110-bdbc-fd0c9f0ca18d}

> 难度：2 · 类型：QA

### 题目要点

- **内联关键 CSS**：加快页面渲染，减少外部请求。
- **延迟加载非关键 CSS**：通过 `rel="preload"` 延迟加载不重要的 CSS 文件。
- **CSS 分块和优化**：减少 CSS 文件的大小和复杂度。
- **使用 `media` 属性**：将 CSS 文件标记为仅在特定条件下加载。

<details>
<summary>参考答案</summary>

CSS 阻塞渲染是指浏览器在加载和解析 CSS 时，会阻止页面的渲染，直到 CSS 被完全下载和解析完毕。这会导致页面加载变慢。以下是一些防止或减轻 CSS 阻塞渲染的策略：

### **1. 使用 `media` 属性**

通过使用 `media` 属性将 CSS 文件标记为在特定条件下才需要加载，可以防止不必要的 CSS 阻塞渲染。

```html
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
```

- **解释**：`media="print"` 属性使得该 CSS 文件只在打印时被加载。`onload` 事件触发后将 `media` 属性改为 `all`，使其对所有媒体有效。这样，浏览器可以优先渲染页面，CSS 文件在下载完成后应用。

### **2. 将 CSS 文件置于 `<head>` 中**

虽然将 CSS 文件放在 `<head>` 部分会阻塞渲染，但它是保证页面样式准确加载的必要方式。要确保在 `<head>` 部分中尽量精简和优化 CSS 以减少阻塞时间。

### **3. 内联关键 CSS**

将关键 CSS 直接嵌入到 HTML 的 `<head>` 中，减少外部请求：

```html
<style>
  /* 关键 CSS 代码 */
  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }
  /* 其他关键样式 */
</style>
```

- **解释**：关键 CSS 是首次加载页面时必须应用的样式，可以提高渲染速度。将其内联到 HTML 中，可以避免额外的网络请求。

### **4. 延迟加载非关键 CSS**

使用 `rel="preload"` 或 `rel="stylesheet"` 来延迟加载非关键 CSS 文件，这些 CSS 文件对首屏渲染不是必需的：

```html
<link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
```

- **解释**：`rel="preload"` 会使浏览器提前加载资源，但不会立即应用，直到 `onload` 事件触发并将 `rel` 属性改为 `stylesheet`。

### **5. 使用 CSS 分块**

将 CSS 文件拆分为多个较小的文件，仅加载当前视图所需的 CSS 文件。这样可以减少单个 CSS 文件的体积，提高加载效率。

```html
<link rel="stylesheet" href="main.css">
<link rel="stylesheet" href="home.css" media="(min-width: 600px)">
```

- **解释**：将 CSS 文件按功能分块，并在需要时加载，有助于减少初始加载时的 CSS 量。

### **6. 优化 CSS 文件**

- **压缩 CSS**：使用工具（如 CSSnano 或 Clean-CSS）来压缩 CSS 文件，去除空格和注释，以减少文件大小。
- **删除未使用的 CSS**：通过工具（如 PurgeCSS）去除未使用的 CSS 代码，减小文件体积。

### **7. 使用 CSS 自定义属性（变量）**

尽量减少 CSS 文件中的重复代码，使用 CSS 变量来优化样式的管理。

```css
:root {
  --primary-color: #3498db;
}
body {
  color: var(--primary-color);
}
```

</details>

## 16. 如何优化大规模 dom 操作的场景？ {#question-a2e5e3a0-8b27-4961-b21f-05db8a2fed7e}

> 难度：2 · 类型：QA

### 题目要点

优化大规模 DOM 操作可以显著提高页面性能和响应速度。以下是一些常见的优化策略：

<details>
<summary>参考答案</summary>

优化大规模 DOM 操作可以显著提高页面性能和响应速度。以下是一些常见的优化策略：

### **1. 减少 DOM 操作的频率**

- **批量更新**：将多个 DOM 操作合并到一个批次中，减少对浏览器重排和重绘的触发次数。
- **文档片段**：使用 `DocumentFragment` 进行 DOM 操作，避免频繁更新真实 DOM。

### **2. 使用虚拟 DOM**

- **React 和 Vue**：使用虚拟 DOM 技术，先在内存中进行 DOM 更新，然后一次性应用差异，减少直接操作真实 DOM 的次数。

### **3. 避免不必要的重排和重绘**

- **最小化变化**：尽量减少对布局的变化，例如避免频繁读取或修改布局属性（如 `offsetWidth`）。
- **使用 `requestAnimationFrame`**：将视觉变化操作放在 `requestAnimationFrame` 回调中，以便在浏览器进行渲染之前执行。

### **4. 只修改可见区域**

- **懒加载**：只渲染用户可见区域的内容，其余部分可以按需加载。
- **虚拟滚动**：对于长列表或表格，使用虚拟滚动技术，只渲染当前视窗中的元素。

### **5. 使用 CSS 3D 转换和硬件加速**

- **CSS 3D 转换**：使用 CSS 的 3D 转换来提升性能，例如 `translateZ(0)` 或 `will-change` 属性，利用 GPU 加速渲染。

### **6. 优化事件处理**

- **事件委托**：使用事件委托，将事件处理器添加到父级元素上，而不是为每个子元素添加事件处理器。
- **节流和防抖**：对频繁触发的事件（如滚动和输入）使用节流（throttle）或防抖（debounce）技术，减少处理次数。

### **7. 避免过度使用复杂选择器**

- **简单选择器**：使用更简单的 CSS 选择器以提高选择效率，复杂选择器可能导致性能问题。

### **8. 监控和分析性能**

- **性能分析工具**：使用浏览器的开发者工具（如 Chrome DevTools）分析和识别性能瓶颈。
- **性能监控**：定期监控和优化页面性能，使用工具如 Lighthouse 来评估页面的性能状况。

### **9. 进行渐进式加载**

- **动态加载**：对一些大规模的数据或组件进行动态加载，避免一次性加载所有内容。

通过这些策略，可以有效优化大规模 DOM 操作，提升页面性能和用户体验。

</details>

## 17. 如何优化 DOM 树解析过程？ {#question-2232a4c3-4c8b-4241-b778-88aaada16ef4}

> 难度：3 · 类型：QA

### 题目要点

- **简化 HTML 结构**：减少不必要的节点和嵌套。
- **优化 CSS 和 JavaScript 加载**：将 CSS 放在 `<head>`，使用 `defer` 或 `async` 属性异步加载 JavaScript。
- **优化 CSS 选择器**：使用简单选择器，减少动态样式变更。
- **合理使用 `document.write()`**：避免在页面加载过程中使用。
- **减少外部资源大小和数量**：合并、压缩资源，启用 HTTP/2。

<details>
<summary>参考答案</summary>

### **DOM 树解析**
- **定义**：DOM 树解析是浏览器解析 HTML 文本并将其转换为一个可操作的 DOM 树的过程。这个过程主要涉及将 HTML 标签转换成 DOM 节点，并建立它们之间的父子关系。

以下是一些优化 DOM 树解析的策略：

#### 1. **简化 HTML 结构**

- **减少节点嵌套**：避免深层嵌套的 HTML 结构，简化 DOM 树的层级结构，帮助浏览器更高效地解析和构建 DOM 树。

  ```html
  <!-- 复杂嵌套 -->
  <div><section><article><p>Content</p></article></section></div>

  <!-- 简化结构 -->
  <article><p>Content</p></article>
  ```

- **去除冗余元素**：避免不必要的包裹元素，减少 DOM 节点的数量。

#### 2. **优化 CSS 和 JavaScript 加载**

- **将 CSS 和 JavaScript 文件放在 `<head>` 或 `<body>` 合适的位置**：
  - **CSS 文件**：应放在 `<head>` 中，以确保样式在页面渲染时能够立即应用，防止页面闪烁。
  - **JavaScript 文件**：将不需要立即执行的脚本放在 `<body>` 底部，或使用 `async` 和 `defer` 属性来异步加载脚本，避免阻塞 DOM 树的构建。

  ```html
  <head>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <!-- 页面内容 -->
    <script src="script.js" defer></script>
  </body>
  ```

#### 3. **减少不必要的样式计算**

- **优化 CSS 选择器**：使用更简单的 CSS 选择器，避免使用过于复杂的选择器，这样可以减少浏览器在解析和计算样式时的负担。

  ```css
  /* 复杂选择器 */
  .container .child .grandchild { color: red; }

  /* 简单选择器 */
  .grandchild { color: red; }
  ```

- **减少动态样式变更**：尽量减少使用 JavaScript 动态修改样式的频率，这些操作会触发浏览器的重排和重绘。

#### 4. **合理使用 `document.write()`**

- **避免在页面加载过程中使用 `document.write()`**：`document.write()` 会重写整个文档，导致浏览器丢弃当前解析的内容。尽量避免在页面加载过程中使用。

  ```javascript
  // 不推荐
  document.write('<p>New Content</p>');
  ```

#### 5. **优化外部资源**

- **减少资源大小和数量**：合并和压缩 CSS 和 JavaScript 文件，减少 HTTP 请求的数量和资源的大小，从而加快页面加载和解析速度。

  ```html
  <!-- 合并后的文件 -->
  <link rel="stylesheet" href="styles.min.css">
  <script src="scripts.min.js"></script>
  ```

#### 6. **启用 HTTP/2**

- **使用 HTTP/2**：如果可能，启用 HTTP/2，它支持多路复用、头部压缩和服务器推送，能有效提升资源的加载速度。

</details>

## 18. 衡量页面性能的指标有哪些？ {#question-ef44e03d-4f04-4aed-8bbe-fb6c7435dffd}

> 难度：2 · 类型：QA

### 题目要点

- **加载时间指标**：评估页面加载速度和初次内容呈现。
- **用户体验指标**：衡量用户交互的流畅性和页面稳定性。
- **网络性能指标**：页面资源的总大小和请求数量。
- **JavaScript 性能指标**：脚本执行和处理时间。
- **工具**：使用工具（如 Web Vitals、Lighthouse、PageSpeed Insights）来测量和优化性能。

<details>
<summary>参考答案</summary>

衡量页面性能的指标有助于评估网页的加载速度、响应能力和用户体验。

以下是一些常见的性能指标：

### **1. 加载时间指标**

- **Page Load Time**：页面从开始加载到完全加载所需的时间。包括所有资源（HTML、CSS、JavaScript、图片等）的下载时间。
- **Time to First Byte (TTFB)**：从发出请求到接收到第一个字节的时间。衡量服务器响应速度。
- **First Contentful Paint (FCP)**：页面上首次呈现内容（文本、图片等）的时间。
- **Largest Contentful Paint (LCP)**：页面上最大内容元素（如大图像或大文本块）的渲染时间。
- **DOM Content Loaded (DCL)**：HTML 文档被完全加载和解析完成（不包括样式表、图像等）的时间。
- **Fully Loaded Time**：页面所有资源（包括图像、样式表、脚本等）加载完成的时间。

### **2. 用户体验指标**

- **First Interactive**：页面开始响应用户交互（点击、滚动等）的时间。
- **First Meaningful Paint (FMP)**：页面上主要内容首次呈现的时间。比 FCP 更能反映页面实际内容的显示情况。
- **Time to Interactive (TTI)**：页面变得完全可交互（用户可以开始与页面交互，所有脚本已加载并执行）的时间。
- **Cumulative Layout Shift (CLS)**：页面内容在加载过程中发生的意外布局偏移量。衡量页面视觉稳定性。

### **3. 网络性能指标**

- **Total Page Size**：页面的总大小，包括所有资源（HTML、CSS、JavaScript、图片等）的大小。
- **Number of Requests**：页面加载过程中发出的请求总数。请求数量多可能会影响加载性能。
- **Resource Load Time**：各个资源（如 CSS、JavaScript 文件、图片）的加载时间。

### **4. JavaScript 性能指标**

- **JavaScript Execution Time**：页面中 JavaScript 代码的执行时间。长时间运行的脚本可能会阻塞页面渲染。
- **Script Parse and Compile Time**：解析和编译 JavaScript 脚本所需的时间。

### **5. 性能工具和指标**

- **Web Vitals**：Google 提供的一组关键 Web 性能指标，包括 LCP、FCP、CLS 等。
- **Lighthouse**：Google 提供的开源自动化工具，分析网页性能、可访问性和 SEO 等方面。
- **PageSpeed Insights**：Google 的工具，提供页面性能评分和优化建议。
- **Chrome DevTools**：浏览器开发者工具，用于实时分析和调试网页性能问题。

</details>

## 19. 怎么统计页面的性能指标？ {#question-a043bcc6-f419-471d-a4cb-4e927daaaf3c}

> 难度：3.5 · 类型：QA

### 题目要点

- **浏览器开发者工具**（如 Chrome DevTools）提供详尽的实时性能数据。
- **Web Vitals** 和 **Lighthouse** 提供核心用户体验指标和优化建议。
- **PageSpeed Insights** 和 **GTmetrix** 提供详细的性能分析报告。
- **Performance API** 用于自定义性能测量。

<details>
<summary>参考答案</summary>

下面是一些常用的方法和工具：

### **1. 使用浏览器开发者工具**

**Chrome DevTools** 提供了丰富的性能分析功能：
- **Performance 面板**：记录和分析页面的加载和运行过程，包括所有网络请求、JavaScript 执行、布局和绘制时间等。
- **Lighthouse 面板**：生成页面性能报告，提供关于加载速度、可访问性、SEO 和最佳实践的评分和建议。
- **Network 面板**：监控网络请求，查看每个请求的详细信息，包括加载时间和资源大小。

**示例**：
1. 打开 Chrome DevTools（按 `F12` 或 `Ctrl+Shift+I`）。
2. 转到 **Performance** 面板，点击 **Record** 按钮开始录制性能数据。
3. 执行页面操作，然后停止录制，查看详细的性能数据。

### **2. 使用 Web Vitals**

**Web Vitals** 是 Google 提供的性能指标集合，专注于用户体验：
- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**

**示例**：
- 可以通过 Chrome DevTools 的 **Lighthouse** 面板查看 Web Vitals 指标。
- 使用 **Web Vitals** JavaScript 库直接在页面上收集和报告这些指标：
  ```javascript
  import { getCLS, getFID, getLCP } from 'web-vitals';

  getCLS(console.log);
  getFID(console.log);
  getLCP(console.log);
  ```

### **3. 使用性能监控工具**

**Google PageSpeed Insights**：分析页面性能并提供优化建议。它基于 Lighthouse 提供报告。
- 访问 [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)。
- 输入页面 URL，获取性能分析报告和改进建议。

**GTmetrix**：提供页面性能分析，包括加载时间、页面大小和请求数量。
- 访问 [GTmetrix](https://gtmetrix.com/)。
- 输入页面 URL，查看性能评分和详细分析。

### **4. 使用 Performance API**

**Performance API** 提供了浏览器的低级性能数据，可以用于自定义性能测量：
- **Performance.now()**：获取自页面加载开始以来的时间（高精度时间戳）。
- **Performance.mark() 和 Performance.measure()**：标记特定事件，并测量事件之间的时间。

**示例**：
```javascript
performance.mark('start');
// 执行某些操作
performance.mark('end');
performance.measure('my-measure', 'start', 'end');
const measure = performance.getEntriesByName('my-measure')[0];
console.log(`Duration: ${measure.duration}ms`);
```

</details>

## 20. SPA首屏加载速度慢的怎么解决 {#question-5cb71435-19b4-45ef-bcee-f2d9825af25e}

> 难度：3 · 类型：QA

### 题目要点

SPA的首屏渲染，通常都受限于我们代码大小、分包策略、网络、缓存等因素，因此提高首屏渲染速度，重点就是分析&解决上面几点。

- 确保我们代码包尽量小，使用 tree-shaking 等技术，移除未使用的代码
- 合理的分包策略，避免某的包过大、也需要避免拆成很多的小文件
- 网络方面，主要就是利用CDN加速等手段，大大缩短静态资源的下载时间
- 缓存，可以认为是网络的延伸，**最快的网络请求，就是么有网络请求** ，如果我们能保证大多数资源包都直接走浏览器本地缓存，那不管是对我们服务器资源节省、还是提高首屏渲染速度，都是有极大的帮助

<details>
<summary>参考答案</summary>

单页面应用（SPA）首屏加载速度慢的问题可能由多种因素造成。以下是一些优化首屏加载速度的常见方法：

### 1. **代码分割（Code Splitting）**
   - **描述**：将代码拆分成多个小块，只加载当前页面所需的代码。
   - **实现**：使用 Webpack 或其他打包工具进行动态导入，按需加载代码模块。
   - **示例**：使用 `React.lazy` 和 `Suspense` 进行组件级别的代码分割。

     ```javascript
     import React, { Suspense, lazy } from 'react';

     const LazyComponent = lazy(() => import('./LazyComponent'));

     function App() {
         return (
             <Suspense fallback={<div>Loading...</div>}>
                 <LazyComponent />
             </Suspense>
         );
     }
     ```

### 2. **懒加载（Lazy Loading）**
   - **描述**：只在需要时加载资源（如图片、组件）。
   - **实现**：使用 `IntersectionObserver` 或第三方库（如 `react-lazyload`）。
   - **示例**：

     ```javascript
     import React from 'react';

     const LazyImage = React.lazy(() => import('./LazyImage'));

     function App() {
         return (
             <React.Suspense fallback={<div>Loading...</div>}>
                 <LazyImage />
             </React.Suspense>
         );
     }
     ```

### 3. **减少初始加载资源**
   - **描述**：减少首屏渲染时需要加载的资源量（如 JS、CSS 文件）。
   - **实现**：合并和压缩 CSS 和 JS 文件，删除未使用的 CSS，减少 HTTP 请求数量。

### 4. **服务器端渲染（SSR）**
   - **描述**：将页面的初始内容在服务器端生成，以减少客户端的渲染时间。
   - **实现**：使用框架（如 Next.js、Nuxt.js）支持 SSR，优化首屏加载时间。

### 5. **使用 Service Workers**
   - **描述**：使用 Service Workers 缓存资源和页面，加速后续的访问。
   - **实现**：在应用中注册 Service Worker，缓存静态资源和 API 请求。

     ```javascript
     if ('serviceWorker' in navigator) {
         window.addEventListener('load', () => {
             navigator.serviceWorker.register('/service-worker.js')
                 .then(registration => {
                     console.log('ServiceWorker registration successful:', registration);
                 })
                 .catch(error => {
                     console.log('ServiceWorker registration failed:', error);
                 });
         });
     }
     ```

### 6. **优化数据请求**
   - **描述**：优化初始数据请求，减少请求时间。
   - **实现**：将请求数据分为初始必要的数据和后续加载的数据，减少首屏渲染时的数据请求。

### 7. CDN
静态资源走CDN，缩短下载时间。

### 8. **使用性能分析工具**
   - **描述**：分析应用性能，找到瓶颈。
   - **实现**：使用 Chrome DevTools、Lighthouse 等工具来分析和优化首屏加载时间。

通过结合这些方法，可以显著改善 SPA 的首屏加载速度，提高用户体验。

</details>

## 21. 将静态资源缓存在本地的方式有哪些？ {#question-1f734f01-90ea-4e70-8968-5aed96d8662e}

> 难度：1.5 · 类型：QA

### 题目要点

**关键词**：静态资源缓存本地

<details>
<summary>参考答案</summary>

**关键词**：静态资源缓存本地

**浏览器可以使用以下几种方式将前端静态资源缓存在本地**：

1. HTTP缓存：浏览器通过设置HTTP响应头中的Cache-Control或Expires字段来指定资源的缓存策略。常见的缓存策略有：no-cache（每次都请求服务器进行验证）、no-store（不缓存资源）、max-age（设置资源缓存的最大时间）等。浏览器根据这些缓存策略来决定是否将资源缓存在本地。

2. ETag/If-None-Match：服务器可以通过在响应头中添加ETag字段，用于标识资源的版本号。当浏览器再次请求资源时，会将上次请求返回的ETag值通过If-None-Match字段发送给服务器，由服务器判断资源是否发生了变化。如果资源未发生变化，服务器会返回304 Not Modified状态码，浏览器则直接使用本地缓存的资源。

3. Last-Modified/If-Modified-Since：服务器可以通过在响应头中添加Last-Modified字段，用于标识资源的最后修改时间。浏览器再次请求资源时，会将上次请求返回的Last-Modified值通过If-Modified-Since字段发送给服务器。服务器根据资源的最后修改时间判断资源是否发生了变化，如果未发生变化，则返回304 Not Modified状态码，浏览器使用本地缓存的资源。

4. Service Worker缓存：使用Service Worker可以将前端资源缓存在浏览器的Service Worker缓存中。Service Worker是运行在浏览器后台的脚本，它可以拦截和处理网络请求，因此可以将前端资源缓存起来，并在离线状态下提供缓存的资源。

5. LocalStorage或IndexedDB：对于一些小的静态资源，可以将其存储在浏览器的LocalStorage或IndexedDB中。这些存储方式是浏览器提供的本地存储机制，可以将数据以键值对的形式存储在浏览器中，从而实现缓存的效果。

**如何将静态资源缓存在 LocalStorage或IndexedDB**

以下是一个使用LocalStorage将静态资源缓存的示例代码：

```javascript
// 定义一个数组，包含需要缓存的静态资源的URL
var resources = [
  'https://example.com/css/style.css',
  'https://example.com/js/main.js',
  'https://example.com/images/logo.png'
];

// 遍历资源数组，将资源请求并存储在LocalStorage中
resources.forEach(function(url) {
  // 发起资源请求
  fetch(url)
    .then(function(response) {
      // 检查请求是否成功
      if (!response.ok) {
        throw new Error('Request failed: ' + response.status);
      }
      // 将响应数据存储在LocalStorage中
      return response.text();
    })
    .then(function(data) {
      // 将资源数据存储在LocalStorage中，以URL作为键名
      localStorage.setItem(url, data);
      console.log('Resource cached: ' + url);
    })
    .catch(function(error) {
      console.error(error);
    });
});
```

以下是一个使用IndexedDB将静态资源缓存的示例代码：

```javascript
// 打开或创建一个IndexedDB数据库
var request = indexedDB.open('myDatabase', 1);

// 创建或更新数据库的对象存储空间
request.onupgradeneeded = function(event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore('resources', { keyPath: 'url' });
  objectStore.createIndex('url', 'url', { unique: true });
};

// 成功打开数据库后，将资源请求并存储在IndexedDB中
request.onsuccess = function(event) {
  var db = event.target.result;
  var transaction = db.transaction('resources', 'readwrite');
  var objectStore = transaction.objectStore('resources');

  resources.forEach(function(url) {
    // 发起资源请求
    fetch(url)
      .then(function(response) {
        // 检查请求是否成功
        if (!response.ok) {
          throw new Error('Request failed: ' + response.status);
        }
        // 将响应数据存储在IndexedDB中
        return response.blob();
      })
      .then(function(data) {
        // 创建一个资源对象，以URL作为键名
        var resource = { url: url, data: data };
        // 将资源对象存储在IndexedDB中
        objectStore.put(resource);
        console.log('Resource cached: ' + url);
      })
      .catch(function(error) {
        console.error(error);
      });
  });

  // 完成事务
  transaction.oncomplete = function() {
    console.log('All resources cached in IndexedDB.');
  };

  transaction.onerror = function(event) {
    console.error('Transaction error:', event.target.error);
  };
};
```

以上代码仅为示例，实际应用中需要根据具体的需求进行相应的优化和错误处理。

</details>

## 22. 为何现在市面上做表格渲染可视化技术的，大多数都是 canvas ， 而很少用 svg 的？ {#question-64cfe53d-5551-47b4-97bc-720a146723af}

> 难度：2 · 类型：QA

### 题目要点

虽然 SVG 在某些场景下（如交互性强的小型图形或可缩放性需求）表现出色，但在处理大规模数据、频繁更新和复杂渲染方面，Canvas 由于性能优势和灵活性，更成为了市场上主流的选择。这也是为什么大多数表格渲染可视化技术倾向于使用 Canvas 的原因。

<details>
<summary>参考答案</summary>

在表格渲染可视化技术中，Canvas 和 SVG 各有优缺点，但使用 Canvas 的原因主要包括以下几点：

### **1. 性能**

- **大数据量处理**：Canvas 更适合处理大量数据，因为它基于像素的绘制方式，不会因为 DOM 元素的增加而导致性能下降。SVG 在处理复杂或大量元素时会变得慢，因为每个元素都是 DOM 的一部分。

### **2. 渲染速度**

- **快速重绘**：Canvas 的重绘性能更好，尤其是在需要频繁更新图形时，如动态数据可视化或实时图表。Canvas 直接在像素层面进行操作，而 SVG 则需要操作 DOM。

### **3. 复杂图形**

- **丰富的绘制功能**：Canvas 提供了更多的绘图功能（如路径、阴影、渐变等），使得渲染复杂图形时更具灵活性。

### **4. 资源占用**

- **内存使用**：Canvas 的内存占用通常低于 SVG，特别是在处理大量元素时，因为它不需要维护 DOM 树的结构。

### **5. 开发和使用便利性**

- **简单 API**：对于许多开发者而言，使用 Canvas API 进行绘制可能更直观，尤其是在处理复杂的可视化时。

</details>

## 23. 想要实现页面加载速度提升（性能优化），可以从哪些方向来尝试？ {#question-0b161fbb-0fe4-4fc2-a028-e432769c458f}

> 难度：4 · 类型：QA

### 题目要点

以下是部分优化方向：

<details>
<summary>参考答案</summary>

以下是部分优化方向：

### 1. **资源优化**
   - **图片优化**：
     - **懒加载**：对于不在首屏的图片，使用懒加载技术，只有在用户滚动到相应位置时才加载（`<img loading="lazy">` 或 JavaScript 实现）。
     - **适应性图片**：使用 `srcset` 提供不同分辨率的图片资源，适应不同设备屏幕大小。
     - **图片压缩**：使用 WebP、AVIF 等现代格式，减少图片文件体积。
     - **SVG 使用**：使用 SVG 代替小图片、图标，减少 HTTP 请求并提高缩放清晰度。

   - **JavaScript 和 CSS 优化**：
     - **代码拆分**：使用 Webpack、Rollup 等工具进行代码拆分（`code-splitting`），将不同功能模块分开打包，避免加载不必要的代码。
     - **减少打包体积**：移除未使用的代码（Tree-Shaking），使用 `sideEffects` 配置减少副作用模块的加载。
     - **CSS 和 JS 压缩**：通过工具压缩代码，如 `Terser`（JS）、`cssnano`（CSS）等，减小文件大小。
     - **减少 Polyfill**：使用 `@babel/preset-env` 加载必要的 Polyfill，而不是加载整个 `core-js`，这样可以减少不必要的代码。

   - **字体优化**：
     - 使用 `font-display: swap;` 防止字体阻塞渲染。
     - 优化字体格式（使用 WOFF2），并减少字体文件大小。

### 2. **网络请求优化**
   - **CDN 加速**：将静态资源（如图片、JS、CSS）放在 CDN（内容分发网络）上，利用全球节点的缓存，缩短资源的下载时间。
   - **减少 HTTP 请求数**：
     - 合并 CSS、JS 文件，减少请求。
     - 使用雪碧图（Sprite）合并小图片或使用字体图标库（如 FontAwesome）代替图片。
   - **HTTP 缓存**：
     - 为静态资源设置缓存（`Cache-Control`, `ETag`），避免重复加载相同资源。
     - 使用合理的缓存策略，如长期缓存（对不经常变化的资源）和短期缓存（对经常更新的资源）。
   - **Prefetch/Preload**：
     - 通过 `<link rel="preload">` 预加载关键资源，如字体、CSS、JS，以便尽快使用。
     - 使用 `<link rel="prefetch">` 提前获取用户即将访问的页面资源。

### 3. **页面加载顺序优化**
   - **CSS 优化**：
     - 将关键 CSS 内联在 HTML 中，避免页面白屏（首屏 CSS 渲染优先）。
     - 将非关键 CSS 异步加载，避免阻塞页面渲染（使用 `media="print"` 等）。

   - **JavaScript 优化**：
     - 将 `&lt;script&gt;` 标签放置在页面底部或使用 `defer` 和 `async` 属性，避免阻塞 HTML 渲染。
     - **异步加载**：通过 `async` 加载 JS 脚本，确保不阻塞页面其他资源的加载。

   - **首屏渲染优化**：
     - 使用 SSR（服务器端渲染）或 CSR（客户端渲染）结合的方式，快速生成首屏内容，提高页面的首屏加载速度。
     - 使用骨架屏（skeleton screen），在页面真实内容加载之前展示占位符，提高用户体验感。

### 4. **性能优化工具**
   - **Gzip/ Brotli 压缩**：在服务器端开启 Gzip 或 Brotli 压缩，减少传输文件的大小。
   - **HTTP/2 or HTTP/3**：使用 HTTP/2 或 HTTP/3 提升传输速度，利用多路复用同时加载多个资源，减少网络延迟。
   - **Service Worker**：通过 PWA（渐进式 Web 应用）技术，使用 Service Worker 缓存资源，提升页面的加载性能，尤其是离线访问和重新加载时。
   - **Lazy Loading**：对图片、视频、iframe 等资源使用懒加载策略，减少初始加载的内容。

### 5. **代码执行和渲染优化**
   - **减少重排和重绘**：
     - 避免频繁操作 DOM，尽量将多次 DOM 操作合并成一次。
     - 使用虚拟 DOM 或类似 React 的合成事件机制减少直接对真实 DOM 的操作。

   - **节流和防抖**：
     - 对于用户频繁触发的事件（如滚动、调整窗口大小、输入框输入），可以通过防抖（debounce）和节流（throttle）策略减少不必要的频繁响应。

   - **请求优先级优化**：
     - 在资源请求时，可以为关键资源（如首屏渲染的 JS、CSS）提高优先级，以加快页面的首次可用时间（FCP）。

### 6. **第三方依赖优化**
   - **减少第三方库的使用**：引入较大的第三方库（如 jQuery、Lodash 等）可能会显著影响加载速度。可以使用更小的替代方案或按需加载库。
   - **按需加载**：对于不需要立即使用的库，使用异步加载技术，按需加载（如懒加载模块）。

### 7. **移动端优化**
   - **响应式设计**：针对移动端优化设计，减少不必要的元素和样式，以适配屏幕大小。
   - **动态内容加载**：移动端流量有限，尽量使用动态加载策略，减少一次性加载过多内容。
   - **适配视口**：设置 `meta` 标签中的 `viewport` 以正确缩放页面，避免无用的布局调整。

### 8. **性能分析与监控**
   - **使用 Lighthouse**：使用 Google 的 Lighthouse 工具评估页面性能，并根据它提供的优化建议做调整。
   - **Performance API**：使用浏览器提供的 Performance API 监控页面性能，分析加载时间、资源获取时间、渲染时间等关键指标。
   - **性能监控**：可以集成性能监控工具，如 New Relic、Sentry 等，实时捕捉并分析用户在生产环境下的性能数据。

### 9. **其他优化策略**
   - **Lazy Hydration**：在使用 React 或 Vue 等框架时，延迟非必要的组件或区域的挂载与渲染，提高首屏渲染性能。
   - **减少重定向**：避免页面多次重定向，减少跳转所需的时间。

</details>

## 24. 后端一次性返回树形结构数据，数据量非常大, 前端该如何处理？ {#question-fdfd1894-4fed-4863-a88a-56f217b54539}

> 难度：3 · 类型：QA

### 题目要点

前端处理大数据量的树形结构时，可通过懒加载、按需渲染、虚拟滚动、数据压缩和结构优化等方式分摊渲染压力，提升性能和用户体验。同时合理利用缓存、Web Worker 等技术，进一步优化响应速度。

<details>
<summary>参考答案</summary>

处理后端一次性返回的大量树形结构数据时，前端可以采取以下策略，避免性能问题，提高页面的响应速度：

### 1. **懒加载和按需渲染**<br>
   - **懒加载节点**：在树形组件展开某个节点时，才加载该节点的子节点数据，而不是一次性加载所有数据。可以通过监听节点展开事件，在需要时从后端请求子节点数据。
   - **虚拟滚动**：对于树状结构数据量很大的场景，通过虚拟列表技术（如 Vue 的 `vue-virtual-scroller` 或 React 的 `react-window`）只渲染当前可视区域的节点，避免 DOM 元素的过多渲染。

### 2. **分页加载数据**<br>
   - 对于树形结构的每一层级数据，设计成分页加载模式，让后端在请求时返回指定层级的分页数据。客户端按需请求并渲染，不会一次性加载所有层级数据。

### 3. **数据压缩与精简**<br>
   - **数据精简**：请求数据时过滤掉不必要的字段，保持数据简洁，减小传输量。例如，仅请求展示和交互所需的基本字段，如 `id`、`label` 等。
   - **数据压缩**：通过后端和前端都支持 `gzip` 或 `brotli` 等压缩协议，对数据进行压缩传输，减少网络流量。

### 4. **异步处理和 Web Worker**<br>
   - 使用 Web Worker 在后台线程处理数据，以避免大数据量处理时阻塞主线程，提升页面交互体验。可以在 Web Worker 中处理数据转换、计算等任务，并将结果传回主线程渲染。

### 5. **缓存与数据持久化**<br>
   - **本地缓存**：可以在客户端通过 `localStorage`、`sessionStorage` 或 `IndexedDB` 缓存树形数据，避免每次刷新页面重新请求。
   - **内存缓存**：在组件的状态或全局状态（如 Vuex 或 Redux）中缓存数据，避免重复请求和渲染。

### 6. **数据结构优化**<br>
   - 将树形结构转化为更加高效的存储形式（如平铺数组或 Map），并在客户端对数据做索引，以便快速查找节点或子节点，优化数据的访问速度。

### 7. **适时降级展示**<br>
   - 对于数据量极大的情况，可考虑进行降级处理，比如只展示前几层节点，用户展开或滚动到对应区域时再加载更多层级，防止一次性渲染过多节点。

### 示例方案：
假设树形结构的数据量过大，我们可以结合**懒加载**和**虚拟滚动**来处理，以下是伪代码示例：

```javascript
<template>
  <TreeView :data="treeData" @node-expand="loadNodeChildren" />
</template>

<script>
export default {
  data() {
    return {
      treeData: [] // 初始为空，按需加载数据
    };
  },
  methods: {
    async loadNodeChildren(node) {
      if (!node.isLoaded) {
        // 请求子节点数据
        const children = await fetch(`/api/tree-children?id=${node.id}`);
        this.$set(node, 'children', children);
        node.isLoaded = true;
      }
    }
  },
  async created() {
    // 初次加载根节点数据
    this.treeData = await fetch("/api/tree-root");
  }
};
</script>
```

</details>

## 25. 如果想在图片这块做性能优化，你有哪些思路？ {#question-cca00a6f-0496-4c5b-a9c8-08b67d9675a7}

> 难度：3.5 · 类型：QA

### 题目要点

图片优化是前端性能优化中的关键环节，从选择合适格式、压缩、响应式设计，到懒加载、缓存、CDN 加速等，构成了完整的优化链条。

<details>
<summary>参考答案</summary>

以下是一些常见的图片优化思路：

### **1. 图片格式优化**
1. **选择合适的图片格式**：
   - **JPEG**：适合照片类图片，有损压缩，文件体积小。
   - **PNG**：适合需要透明背景的图片，无损压缩，体积较大。
   - **WebP**：现代图片格式，支持有损和无损压缩，体积更小，兼容性逐步提高。
   - **AVIF**：更高效的现代格式，体积小但兼容性较 WebP 差一些。
   - **SVG**：适合图标和简单图形，基于矢量，支持缩放不失真。

2. **根据设备需求动态提供格式**：
   - 使用工具（如 `sharp` 或服务端配置）生成不同格式的图片，并根据浏览器支持选择最佳格式（如 WebP 优先）。

### **2. 图片压缩**
1. **无损压缩**：
   - 保留图片质量的同时减少文件大小。常用工具：
     - 在线工具：TinyPNG、ImageOptim
     - 本地工具：`imagemin`、`sharp`
2. **有损压缩**：
   - 对允许质量稍有下降的图片，可以进一步压缩，显著减少体积。

### **3. 响应式图片**
1. **使用 `<picture>` 元素**：
   根据不同的屏幕分辨率和尺寸，加载合适尺寸的图片。

   ```html
   <picture>
       <source srcset="image-large.webp" type="image/webp" media="(min-width: 1024px)">
       <source srcset="image-small.webp" type="image/webp" media="(max-width: 1024px)">
       <img src="image-fallback.jpg" alt="example image">
   </picture>
   ```

2. **使用 `srcset` 属性**：
   指定不同尺寸的图片，让浏览器选择最适合的版本。

   ```html
   <img src="image-default.jpg" srcset="image-small.jpg 480w, image-medium.jpg 800w, image-large.jpg 1200w" sizes="(max-width: 600px) 480px, (max-width: 1200px) 800px, 1200px" alt="example">
   ```

### **4. 懒加载（Lazy Loading）**
1. **使用 `loading="lazy"` 属性**（现代浏览器支持）：
   图片在进入视口前不会加载，减少首屏加载压力。

   ```html
   <img src="image.jpg" alt="example" loading="lazy">
   ```

2. **使用 JavaScript 实现懒加载**：
   可以基于 Intersection Observer API 实现更复杂的懒加载逻辑。

   ```javascript
   const lazyImages = document.querySelectorAll('img[data-src]');
   const observer = new IntersectionObserver((entries, observer) => {
       entries.forEach(entry => {
           if (entry.isIntersecting) {
               const img = entry.target;
               img.src = img.dataset.src;
               observer.unobserve(img);
           }
       });
   });

   lazyImages.forEach(img => observer.observe(img));
   ```

### **5. 使用 CDN（内容分发网络）**
- **图片托管在 CDN 上**：
  - CDN 会根据用户地理位置提供最近的服务器加速图片加载。
  - 提供图片的格式转换、压缩、裁剪等功能（如阿里云 OSS、Cloudflare Images）。

### **6. CSS 背景图优化**
1. **雪碧图（Sprites）**：
   - 将多个小图标合并成一张大图，减少 HTTP 请求次数。
2. **Base64 编码**：
   - 对小图标（<2KB）直接进行 Base64 编码内嵌到 CSS 文件中，避免额外的 HTTP 请求。

### **7. 占位符技术**
1. **使用低分辨率图片作为占位符**：
   - 在图片加载前显示模糊的低清晰度版本，提升用户感知。
2. **骨架屏设计**：
   - 使用 CSS 或图片的尺寸占位，防止内容跳动（Cumulative Layout Shift）。

### **8. 图片缓存**
1. **设置缓存头**：
   - 通过 HTTP 响应头设置 `Cache-Control` 和 `ETag`，减少重复加载。

2. **文件名带版本号**：
   - 文件名如 `image-v1.jpg`，更新图片时改变版本号避免缓存冲突。

### **9. 使用矢量图**
1. **SVG 图像**：
   - 用于图标和简单图形，支持缩放且体积小。
2. **图标库**：
   - 使用 IconFont 或类似 Font Awesome 的字体图标库替代图片图标。

### **10. 动态图片优化**
1. **服务端裁剪**：
   - 根据用户设备的分辨率或屏幕尺寸生成适配的图片尺寸。
2. **图片懒生成**：
   - 在用户需要时，才生成或传输对应版本的图片。

</details>

## 26. JS 的加载是否会阻塞浏览器渲染？ {#question-3340a5a1-82f9-4790-8791-b24ae2970047}

> 难度：3 · 类型：QA

### 题目要点

- **同步 JavaScript**：会阻塞浏览器的渲染，直到脚本加载和执行完成。
- **异步加载 JavaScript (`async`)**：不会阻塞浏览器的渲染，脚本加载时与 HTML 解析并行，但会在加载完成后立即执行，可能会打乱脚本的执行顺序。
- **延迟加载 JavaScript (`defer`)**：不会阻塞浏览器的渲染，脚本会在 HTML 完全解析后执行，且按顺序执行。
- **内联脚本**：如果没有 `async` 或 `defer`，会阻塞渲染。

### 扩展：如何优化 JavaScript 加载以提高页面渲染速度？

1. **使用 `async` 和 `defer`**：尽量避免同步脚本，使用 `async` 或 `defer` 属性异步加载 JavaScript，减少阻塞。
2. **按需加载**：根据用户交互和需求按需加载 JavaScript 代码，避免一次性加载所有脚本。可以使用代码分割技术（如 Webpack 的 `splitChunks`）来实现。
3. **减少内联脚本**：尽量将脚本移到外部文件，使用 `async` 或 `defer` 来控制脚本加载时机。
4. **资源压缩和合并**：压缩 JavaScript 文件，减少文件的大小，合并多个脚本，减少网络请求的次数。

通过这些优化，能够减少 JavaScript 加载对浏览器渲染的阻塞，从而提升用户的页面加载体验。

<details>
<summary>参考答案</summary>

是的，JavaScript 的加载和执行有可能会阻塞浏览器的渲染，但这取决于如何加载和执行 JavaScript 代码。浏览器在处理页面时，需要解析 HTML、CSS 和 JavaScript 文件，同时渲染页面的内容。在加载 JavaScript 时，页面的渲染可能会被阻塞，尤其是在执行同步的 JavaScript 时。

下面我们分几种情况来分析 JavaScript 加载是否会阻塞浏览器渲染：

### 1. **同步 JavaScript (`&lt;script&gt;` 默认行为)**

默认情况下，当浏览器遇到一个 `&lt;script&gt;` 标签时，会停止 HTML 的解析，去加载并执行这个脚本文件，直到脚本执行完毕才会继续解析 HTML 和渲染页面。这种情况下，JavaScript 的加载和执行会阻塞页面的渲染过程，影响用户体验，尤其是在脚本较大或网络较慢时。

#### 示例：
```html
<html>
  <head>
    <script src="large-script.js"></script> <!-- 阻塞渲染 -->
  </head>
  <body>
    <h1>Welcome to My Page</h1>
  </body>
</html>
```
在这个例子中，浏览器在加载 `large-script.js` 时会停止解析 HTML 和渲染页面内容，直到该脚本执行完毕。

### 2. **异步加载 JavaScript (`&lt;script async&gt;`）**

如果将 `&lt;script&gt;` 标签的 `async` 属性添加到 JavaScript 脚本中，浏览器将并行加载 JavaScript 文件，并且一旦加载完成，立即执行该脚本。重要的是，**异步加载不会阻塞 HTML 的解析和渲染**，但由于 `async` 脚本是立即执行的，因此可能会打乱脚本的执行顺序。

#### 示例：
```html
<html>
  <head>
    <script src="large-script.js" async></script> <!-- 不阻塞渲染 -->
  </head>
  <body>
    <h1>Welcome to My Page</h1>
  </body>
</html>
```
在这个例子中，`large-script.js` 会与 HTML 的解析并行进行，且不会阻塞页面的渲染，脚本会在加载完成后立刻执行。

### 3. **延迟加载 JavaScript (`&lt;script defer&gt;`）**

如果将 `&lt;script&gt;` 标签的 `defer` 属性添加到 JavaScript 脚本中，浏览器会在解析完 HTML 文档后，**延迟执行**这些脚本。这样，JavaScript 的加载不会阻塞 HTML 的解析和页面渲染，但脚本会在页面内容解析完毕后执行。因此，`defer` 适合需要在 DOM 构建完毕后执行的脚本。

#### 示例：
```html
<html>
  <head>
    <script src="large-script.js" defer></script> <!-- 不阻塞渲染 -->
  </head>
  <body>
    <h1>Welcome to My Page</h1>
  </body>
</html>
```
在这个例子中，`large-script.js` 会在 HTML 完全解析和渲染后才执行，不会阻塞页面渲染。

### 4. **内联脚本（Inline Scripts）**

对于内联脚本（直接在 HTML 中书写的 `&lt;script&gt;` 标签），如果没有使用 `async` 或 `defer`，它们会像外部同步脚本一样阻塞页面的渲染。内联脚本的执行会暂停 HTML 的解析和页面渲染，直到脚本执行完毕。

#### 示例：
```html
<html>
  <head>
    <script>
      console.log('Script running');
    </script> <!-- 阻塞渲染 -->
  </head>
  <body>
    <h1>Welcome to My Page</h1>
  </body>
</html>
```
在这个例子中，`&lt;script&gt;` 中的代码会在页面渲染之前执行，导致阻塞渲染。

</details>

## 27. 在 JS 中， 如何解决递归导致栈溢出问题？ {#question-421a8c8f-c78c-4192-a4ea-d34532f91372}

> 难度：3 · 类型：QA

### 题目要点

避免递归栈溢出的问题可以通过多种方式来解决：

1. **尾递归优化**：理论上通过尾递归可以避免栈溢出，但目前 JavaScript 引擎对尾递归的优化支持有限。
2. **将递归转为循环**：使用循环代替递归是最常见的解决方法，避免了递归深度过大造成栈溢出。
3. **分段递归**：通过延迟递归调用，避免立即占用大量栈空间。
4. **模拟递归**：手动使用栈来模拟递归过程，避免了递归深度过大导致的栈溢出。
5. **限制递归深度**：通过限制最大递归深度来防止栈溢出。
6. **Web Workers**：对于长时间的计算任务，可以通过 Web Workers 将计算任务分离到独立线程中执行。

<details>
<summary>参考答案</summary>

在 JavaScript 中，递归调用如果过深，可能会导致 **栈溢出**（Stack Overflow），因为 JavaScript 的执行栈是有限的。如果函数调用过多，栈空间用尽，就会抛出 `RangeError: Maximum call stack size exceeded` 错误。

为了解决这个问题，可以使用以下几种方法来避免栈溢出。

### 1. **尾递归优化 (Tail Call Optimization)**
尾递归是指递归调用是函数的最后一步操作，没有其他操作发生在递归之后。尾递归的一个好处是可以通过优化避免增加栈帧，从而避免栈溢出。

#### 原理：
在尾递归中，递归函数调用后，当前函数的栈帧不再需要，因此可以复用当前栈帧来执行递归。尾递归优化 (TCO) 可以将递归转换为循环，从而避免了栈的增长。

#### 示例：

```javascript
// 尾递归的例子
function factorial(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorial(n - 1, n * accumulator);  // 递归调用是最后一步
}

console.log(factorial(10000));  // 适用于较大的数值
```

**注意**：目前，大部分 JavaScript 引擎（如 V8）并不实现尾递归优化（TCO）。因此，尾递归在 JavaScript 中不能完全避免栈溢出的问题，虽然它在理论上能优化栈溢出问题，但实际效果依赖于 JavaScript 引擎的实现。

### 2. **将递归转换为循环（迭代）**
递归往往可以用循环来实现。将递归转为迭代不仅可以避免栈溢出，还可以提升性能，因为循环不需要额外的栈空间。

#### 示例：将递归转为循环

递归版本的阶乘函数：

```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

改为迭代版本：

```javascript
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

使用循环代替递归可以避免栈的使用，防止栈溢出。

### 3. **分段递归**
如果递归的深度很大，可以通过分段来分批执行递归，避免一次性调用栈的积累。

#### 示例：使用 `setTimeout` 或 `requestIdleCallback`
可以通过 `setTimeout` 或 `requestIdleCallback` 在每次递归时延迟执行，确保每次递归都不会立即占用栈空间，从而避免堆栈溢出。

```javascript
function deepRecursive(index, max) {
  if (index > max) return;
  console.log(index);

  // 每次递归后延迟，避免阻塞栈
  setTimeout(() => deepRecursive(index + 1, max), 0);
}

deepRecursive(1, 10000);
```

这种方法让递归调用变成了非阻塞式的异步任务，从而避免了同步递归的栈溢出问题。

### 4. **模拟递归：使用栈（手动维护栈）**
将递归转为显式的栈操作是另一种避免栈溢出的方案。通过显式使用一个栈来模拟递归过程，可以避免函数调用栈的溢出。

#### 示例：模拟递归

```javascript
function factorial(n) {
  let stack = [];
  let result = 1;

  while (n > 1) {
    stack.push(n);
    n--;
  }

  while (stack.length > 0) {
    result *= stack.pop();
  }

  return result;
}

console.log(factorial(10000));  // 避免了栈溢出
```

在这种方法中，我们手动管理栈，而不是依赖 JavaScript 引擎的调用栈，从而避免了栈溢出。

### 5. **限制递归深度**
在某些情况下，你可以在递归调用前，检查递归的深度或栈的使用情况。如果栈的深度过大，可以选择中止递归或进行其他处理。

```javascript
let depth = 0;
const MAX_DEPTH = 10000;

function recursiveFunction(n) {
  if (depth > MAX_DEPTH) {
    console.log('Maximum depth reached');
    return;
  }

  depth++;
  if (n <= 1) return 1;
  return n * recursiveFunction(n - 1);
}

console.log(recursiveFunction(10000));  // 在递归深度过大时停止
```

通过限制最大递归深度，可以有效地防止过深递归导致的栈溢出。

### 6. **使用 Web Workers（适用于长时间计算任务）**
如果递归操作非常耗时，可以考虑使用 **Web Workers** 来将计算任务移到单独的线程中，这样可以避免阻塞主线程，并避免栈溢出。

#### 示例：

```javascript
const worker = new Worker('worker.js');
worker.postMessage({ type: 'start', data: 10000 });

worker.onmessage = function(event) {
  console.log('Worker result:', event.data);
};
```

`worker.js`：

```javascript
onmessage = function(e) {
  const n = e.data;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  postMessage(result);
};
```

使用 Web Workers 使得递归任务在独立线程中运行，避免了主线程的栈溢出。

</details>

## 28. 有些框架不用虚拟dom，但是他们的性能也不错是为什么？ {#question-7b776a5f-f2b7-4b8e-ad83-930c67a75142}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

一些框架即使不使用虚拟DOM（Virtual DOM），它们的性能仍然不错，这可能是因为以下几个原因：

1. **直接操作真实DOM**：这些框架可能直接操作真实DOM，而不是创建一个虚拟的DOM副本。通过优化操作，它们可以减少不必要的DOM操作，提高性能。
2. **批量更新**：这些框架可能采用批量更新策略，将多次小的DOM操作合并成一次大的操作，减少浏览器重排和重绘的次数。
3. **状态管理**：这些框架可能提供了更好的状态管理机制，允许开发者更有效地管理应用的状态，从而减少不必要的DOM更新。
4. **组件优化**：这些框架可能鼓励或提供组件级别的优化，例如通过使用懒加载、虚拟滚动等方法，减少不必要的DOM操作。
5. **编译时优化**：如果这些框架使用了编译时优化，如Tree Shaking、Dead Code Elimination等，它们可以减少最终构建的代码量，从而提高性能。
6. **高效的数据绑定**：这些框架可能提供了高效的数据绑定机制，减少了手动操作DOM的需求，从而提高了性能。

**考察要点**：

1. **直接操作真实DOM**：理解直接操作真实DOM的优缺点。
2. **批量更新**：了解批量更新策略如何提高性能。
3. **状态管理**：了解状态管理对性能的影响。
4. **组件优化**：理解组件优化对性能的贡献。
5. **编译时优化**：了解编译时优化如何提高性能。
6. **高效的数据绑定**：了解高效数据绑定对性能的影响。

<details>
<summary>参考答案</summary>

确实有一些框架不使用虚拟DOM，但仍能获得较好的性能。这是因为框架的整体设计和实现方式可能经过了优化，以使其在渲染和更新方面更加高效。

具体来说，可能有以下原因：

1. **直接操作DOM**：这些框架可能直接对真实的DOM进行操作，而不是通过虚拟DOM中间层来进行抽象。直接操作DOM可以减少一些虚拟DOM的计算和比较开销。

2. **精细的变更追踪**：这些框架可能采用更精细的变更追踪机制，只更新需要变更的部分，而不是重新渲染整个组件。通过避免不必要的DOM操作，可以提高性能。

3. **异步渲染**：一些框架可能使用异步渲染技术，将多个DOM操作合并到一次更新中，从而减少浏览器的重排和重绘。例如，利用`requestAnimationFrame`或`MutationObserver`等机制延迟渲染，以便在下一个绘制周期内进行批量更新。

4. **性能优化策略**：这些框架可能包含一些性能优化策略，如组件缓存、懒加载、异步加载等，以提高初始加载和后续渲染的执行效率。

5. **针对特定用例的优化**：某些框架可能专注于解决特定的问题或场景，并进行了相应的优化。这些优化可以包括针对数据量较小或操作频率较低的应用进行的特定优化。

虚拟DOM在某些情况下提供了灵活性和开发便利性，但并不是唯一能实现高性能的方法。框架的性能往往是由多个因素综合影响的，除了是否使用虚拟DOM，还包括算法、数据结构、异步处理、组件设计等方面的因素。不同的框架可能有不同的设计理念和优化策略，因此性能也会有差异。

</details>

## 29. 如果某个页面有几百个函数需要执行，可以怎么优化页面的性能？ {#question-7ae57c4b-d6e0-443b-a7f6-8f2a1fdec82c}

> 难度：3 · 类型：QA

### 题目要点

**作答思路**

优化页面的性能的方法：

1. **代码分割**：将代码分割成多个块，通过动态导入（如Webpack的`import()`）来按需加载这些块。
2. **减少初始加载时间**：只加载当前页面上必要的前端代码，其他代码可以通过异步加载。
3. **使用缓存**：对于经常访问的代码，可以使用浏览器缓存来减少加载时间。
4. **优化函数执行**：对函数进行优化，减少不必要的计算和操作。
5. **使用事件委托**：对于DOM事件处理，使用事件委托来减少事件监听器的数量。
6. **懒加载**：对于不需要立即加载的资源，使用懒加载来延迟加载。
7. **使用Web Workers**：对于计算密集型任务，可以使用Web Workers在后台线程中执行，避免阻塞主线程。
8. **优化CSS和JavaScript**：压缩和合并CSS和JavaScript文件，减少HTTP请求。
9. **使用CDN**：将静态资源（如图片、CSS和JavaScript文件）托管在CDN上，提高资源加载速度。
10. **使用HTTP/2**：如果服务器支持HTTP/2，可以提高资源的传输速度。
通过这些方法，可以有效地优化页面的性能，减少加载时间，提高用户体验。

**考察要点**：性能优化

<details>
<summary>参考答案</summary>

如果有几百个函数需要执行，并且这些函数可能会导致页面卡顿，可以考虑以下几种处理方式：

1. **异步执行**：将函数调用转换为异步操作，使用`setTimeout`或`requestAnimationFrame`等方法将函数分散到多个时间片中执行。这样可以避免一次性执行大量函数造成的阻塞。

2. **分批处理**：将函数分批执行，而不是一次性执行所有函数。可以使用循环和计数器来控制每个批次的函数数量，并在每个批次之间添加适当的延迟，以确保主线程有足够的空闲时间处理其他任务。

3. **Web Worker**：将函数放入Web Worker中执行，以在后台线程中进行计算，避免阻塞主线程。Web Worker可以独立于主线程运行，并发出消息来与主线程通信。

4. **函数优化**：检查需要执行的函数是否可以进行优化，例如减少计算量、缓存结果、避免重复计算等。通过优化单个函数的执行效率，可以减少整体执行的时间和资源消耗。

5. **任务调度库**：使用第三方任务调度库，如`async.js`或`p-queue`等，来管理并行执行和限制同时执行的函数数量。这些库提供了更灵活的任务管理和控制，可以根据需求进行配置和调整。

具体的处理方式取决于应用程序的需求和场景，以及函数之间是否有依赖关系。选择最合适的方法时，需要综合考虑性能、可维护性和代码复杂度等因素，并进行必要的测试和性能评估。

</details>

## 30. 讲一下png8、png16、png32的区别，并简单讲讲 png 的压缩原理 {#question-4e206538-eb5c-43d2-8665-0471800fcd80}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

PNG（Portable Network Graphics）是一种无损压缩的位图图形格式，用于存储高质量的图像。PNG8、PNG16、PNG32是PNG格式的三种不同位深度的格式，它们的主要区别在于每个像素的颜色信息量不同。可以从位深度、颜色模式，优缺点来讲。

PNG的压缩原理主要是利用人眼对颜色和细节的感知有限性，通过以下方式减少图像数据：

1. **无损压缩**：PNG使用LZ77和Deflate算法进行无损压缩，保留了所有原始图像数据。
2. **颜色索引**：PNG8使用颜色索引来减少颜色信息，通过有限的颜色表来表示图像中的颜色。
3. **预测编码**：PNG使用预测编码来减少相邻像素之间的冗余信息。
4. **滤波**：PNG通过不同的滤波方法来减少图像中的高频噪声，从而减少文件体积。

<details>
<summary>参考答案</summary>

## 区别
PNG8、PNG16、PNG32 是 PNG 图像格式的不同变种，它们主要区别在于颜色深度和透明度支持的不同。

1. PNG8：
PNG8 是一种 8 位颜色深度的 PNG 图像格式，它最多支持 256 种颜色。对于颜色相对较简单、不需要透明度的图像，使用 PNG8 可以获得较小的文件大小。PNG8 图像使用一种叫做调色板（Palette）的技术来存储颜色信息，它会创建一个包含所有使用的颜色的列表，并在图像中通过索引来引用这些颜色。

2. PNG16：
PNG16 是一种 16 位颜色深度的 PNG 图像格式，它支持更多的颜色，最多可达 65536 种颜色。PNG16 适用于一些颜色较丰富的图像，但同样不支持透明度。

3. PNG32：
PNG32 是一种 32 位颜色深度的 PNG 图像格式，它支持上千万种颜色，并且支持完全透明度（alpha 通道）。PNG32 适用于需要精确透明度控制的图像，例如图标、Logo 等。

## PNG 的压缩原理

PNG 图像使用无损压缩技术来减小文件大小。它主要通过以下两种压缩方式来实现：

1. 使用 DEFLATE 算法：PNG 使用 DEFLATE 算法来对图像数据进行压缩，这是一种无损的压缩算法，可以将相邻的相似数据块识别并用更短的编码进行替代，从而减小文件大小。

2. 使用索引颜色和调色板：对于 PNG8 图像，它使用调色板技术来存储颜色信息。调色板是一个包含所有使用的颜色的列表，然后图像中使用颜色的索引来引用调色板中的颜色。这样可以大大减小文件大小，特别适用于颜色较简单的图像。

由于 PNG 使用无损压缩，所以图像的质量不会因为压缩而损失，但这也导致 PNG 文件相对于其他有损压缩格式（如 JPEG）通常会更大。因此，在选择使用 PNG 还是其他格式时，需要根据图像类型、透明度需求和文件大小要求进行权衡。

</details>

## 31. 页面加载的过程中，JS 文件是不是一定会阻塞 DOM 和 CSSOM 的构建？ {#question-212703a8-43a2-426e-b9c4-b51053436d23}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

页面加载的过程中，JS文件不一定会阻塞DOM和CSSOM的构建。具体取决于以下几个因素：

1. **并行加载**：浏览器通常会并行加载多个资源，包括HTML、CSS和JavaScript文件。这意味着DOM和CSSOM的构建可以在加载JS文件的同时进行。
2. **异步加载**：如果JavaScript文件使用`async`或`defer`属性进行异步加载，那么它不会阻塞DOM和CSSOM的构建。`async`属性会使脚本在下载完成后立即执行，而`defer`属性会使脚本在HTML解析完成后执行。
3. **内联JavaScript**：如果JavaScript代码内联在HTML文档中，它会在DOM构建完成后立即执行，这可能会阻塞DOM的构建，但不会阻塞CSSOM的构建。
4. **阻塞行为**：如果JavaScript文件没有使用`async`或`defer`属性，或者使用了`&lt;script&gt;`标签的`type="text/javascript"`属性，它可能会阻塞DOM和CSSOM的构建，直到脚本加载并执行完毕。

**考察要点**：

1. **浏览器资源加载机制**：理解浏览器如何并行加载多个资源，包括HTML、CSS和JavaScript文件。
2. **异步加载**：了解如何使用`async`和`defer`属性来异步加载JavaScript文件，以及它们对DOM和CSSOM构建的影响。
3. **内联JavaScript的影响**：理解内联JavaScript如何影响DOM和CSSOM的构建。
4. **阻塞行为**：了解没有使用`async`或`defer`属性的JavaScript文件如何阻塞DOM和CSSOM的构建。

<details>
<summary>参考答案</summary>

答案：**不一定**

JavaScript阻塞DOM和CSSOM的构建的情况主要集中在以下两个方面：

* JavaScript文件被放置在head标签内部

当JavaScript文件被放置在head标签内部时，浏览器会先加载JavaScript文件并执行它，然后才会继续解析HTML文档。因此，如果JavaScript文件过大或服务器响应时间过长，就会导致页面一直处于等待状态，进而影响DOM和CSSOM的构建。

* JavaScript代码修改了DOM结构

在JavaScript代码执行时，如果对DOM结构进行了修改，那么浏览器需要重新计算布局（reflow）和重绘（repaint），这个过程会较为耗时，并且会阻塞DOM和CSSOM的构建。

除此之外，还有一些情况下JavaScript并不会阻塞DOM和CSSOM的构建：

* 通过设置 script 标签的 async 、defer 属性避免阻塞DOM和CSSOM的构建
    * **async**：异步加载JavaScript文件，脚本的下载和执行将与其他工作同时进行（例如从服务器请求其他资源、渲染页面等），而不必等到脚本下载完成才开始这些操作。因此，在使用 async 属性时，脚本的加载和执行是异步的，并且不保证脚本在页面中的顺序。
    * **defer属性** ：属性也告诉浏览器立即下载脚本文件，但有一个重要的区别：当文档解析时，脚本不会执行，直到文档解析完成后才执行。这意味着脚本将按照它们在页面上出现的顺序执行，并且在执行之前，整个文档已经被解析完毕了。
* Web Workers ：Web Workers 是一种运行在后台线程的JavaScript脚本，它不会阻塞DOM和CSSOM的构建，并且可以利用多核CPU提高JavaScript代码执行速度。

## 总结

在一定情况下，JavaScript的执行会阻塞DOM和CSSOM的构建。

但是，在实际应用中，我们可以通过设置 script 标签的 async、defer 属性、使用Web Workers等方式来避免这个问题。

</details>

## 32. React.memo() 和 useMemo() 的用法是什么，有哪些区别？ {#question-e4c43a21-1621-4281-9340-1839ec880382}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

React.memo() 和 useMemo() 都是React中用于性能优化的工具，但它们的作用对象和使用场景不同。

1. **React.memo()**：
   - 作用于组件，用于减少不必要的渲染。
   - 只有当组件的props发生变化时，才会重新渲染组件。
   - 它是一个高阶组件，可以接受一个组件作为参数，并返回一个新的组件。
2. **useMemo()**：
   - 作用于函数组件，用于减少不必要的计算。
   - 只有当依赖项发生变化时，才会重新计算memoized的值。
   - 它是React的Hooks API的一部分，可以在函数组件中使用。
**区别**：

- **作用对象**：React.memo()作用于组件，useMemo()作用于函数组件的计算逻辑。
- **优化目的**：React.memo()优化组件的渲染，useMemo()优化函数组件中的计算。
- **使用场景**：React.memo()适用于父组件通过props传递数据给子组件，useMemo()适用于函数组件中的计算逻辑。

**考察要点**：

1. **React.memo()概念**：理解React.memo()的作用和用途。
2. **useMemo()概念**：理解useMemo()的作用和用途。

<details>
<summary>参考答案</summary>

在软件开发中，我们通常痴迷于性能提升以及如何使我们的应用程序执行得更快，从而为用户提供更好的体验。

Memoization 是优化性能的方法之一。 在本文中，我们将探讨它在 React 中的工作原理。

# 什么是 memoization？
在解释这个概念之前，让我们先来看一个简单的斐波那契程序：
```javascript
function fibonacci(n){
  return (n < 2) ? n : fibonacci(n-1) + fibonacci(n-2);
}
```
显然这个算法缓慢的令人绝望，因为做了非常多的冗余计算，这个时候memoization就可以派上用场了！

简单来说，memoization 是一个过程，它允许我们缓存递归/昂贵的函数调用的值，以便下次使用相同的参数调用函数时，返回缓存的值而不必重新计算函数。

这确保了我们的应用程序运行得更快，因为我们通过返回一个已经存储在内存中的值来避免重新执行函数需要的时间。

# 为什么在 React 中使用 memoization？
在 React 函数组件中，当组件中的 props 发生变化时，默认情况下整个组件都会重新渲染。 换句话说，如果组件中的任何值更新，整个组件将重新渲染，包括尚未更改其 values/props 的函数/组件。

让我们看一个发生这种情况的简单示例。 我们将构建一个基本的应用程序，告诉用户哪种酒最适合与它们选择的奶酪搭配。

我们将从设置两个组件开始。 第一个组件将允许用户选择奶酪。 然后它会显示最适合该奶酪的酒的名称。 第二个组件将是第一个组件的子组件。 在这个组件中，没有任何变化。 我们将使用这个组件来跟踪 React 重新渲染的次数。

> 注意，本示例中使用的 `classNames` 来自 Tailwind CSS。

下面是我们的父组件：`<ParentComponent />`。

```
// components/parent-component.js
import Counts from "./counts";
import Button from "./button";
import { useState, useEffect } from "react";
import constants from "../utils";
const { MOZARELLA, CHEDDAR, PARMESAN, CABERNET, CHARDONAY, MERLOT } = constants;

export default function ParentComponent() {
  const [cheeseType, setCheeseType] = useState("");
  const [wine, setWine] = useState("");
  const whichWineGoesBest = () => {
    switch (cheeseType) {
      case MOZARELLA:
        return setWine(CABERNET);
      case CHEDDAR:
        return setWine(CHARDONAY);
      case PARMESAN:
        return setWine(MERLOT);
      default:
        CHARDONAY;
    }
  };
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      whichWineGoesBest();
    }
    return () => (mounted = false);
  }, [cheeseType]);

  return (
    <div className="flex flex-col justify-center items-center">
        <h3 className="text-center dark:text-gray-400 mt-10">
          Without React.memo() or useMemo()
        </h3>
      <h1 className="font-semibold text-2xl dark:text-white max-w-md text-center">
        Select a cheese and we will tell you which wine goes best!
      </h1>
      <div className="flex flex-col gap-4 mt-10">
        <Button text={MOZARELLA} onClick={() => setCheeseType(MOZARELLA)} />
        <Button text={CHEDDAR} onClick={() => setCheeseType(CHEDDAR)} />
        <Button text={PARMESAN} onClick={() => setCheeseType(PARMESAN)} />
      </div>
      {cheeseType && (
        <p className="mt-5 dark:text-green-400 font-semibold">
          For {cheeseType}, <span className="dark:text-yellow-500">{wine}</span>{" "}
          goes best.
        </p>
      )}
      <Counts />
    </div>
  );
}
```

第二个组件是 `<Counts />` 组件，它跟踪整个 `<Parent Component />` 组件重新渲染的次数。

```
// components/counts.js
import { useRef } from "react";
export default function Counts() {
  const renderCount = useRef(0);
  return (
    <div className="mt-3">
      <p className="dark:text-white">
        Nothing has changed here but I've now rendered:{" "}
        <span className="dark:text-green-300 text-grey-900">
          {(renderCount.current++)} time(s)
        </span>
      </p>
    </div>
  );
}
```

下面的例子是我们点击奶酪名字时的效果:

`<ParentComponent />` 中的 `<Counts />` 组件计算了因 `<ParentComponent />` 的更改而强制 `<Counts />` 组件重新渲染的次数。

目前，单击奶酪名字将更新显示下面的奶酪名字以及酒名。 除了 `<ParentComponent />` 会重新渲染，`<Counts />` 组件也会重新渲染，即使其中的任何内容都没有改变。

想象一下，有一个组件显示数以千计的数据，每次用户单击一个按钮时，该组件或树中的每条数据都会在不需要更新时重新渲染。 这就是 `React.memo()` 或 `useMemo()` 为我们提供性能优化所必需的地方。

现在，让我们探索 `React.memo` 以及 `useMemo()`。 之后我们将比较它们之间的差异，并了解何时应该使用一种而不是另一种。

# 什么是 React.memo()？
`React.memo()` 随 [React v16.6](https://reactjs.org/blog/2018/10/23/react-v-16-6.html) 一起发布。 虽然类组件已经允许您使用 [PureComponent](https://reactjs.org/docs/react-api.html#reactpurecomponent) 或 [shouldComponentUpdate](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) 来控制重新渲染，但 React 16.6 引入了对函数组件执行相同操作的能力。

`React.memo()` 是一个[高阶组件 (HOC)](https://reactjs.org/docs/higher-order-components.html)，它接收一个组件A作为参数并返回一个组件B，如果组件B的 props（或其中的值）没有改变，则组件 B 会阻止组件 A 重新渲染 。

我们将采用上面相同的示例，但在我们的 `<Counts />` 组件中使用 `React.memo()`。 我们需要做的就是用 `React.memo()` 包裹我们的 `<Counts /> `组件，如下所示：

```
import { useRef } from "react";
function Counts() {
  const renderCount = useRef(0);
  return (
    <div className="mt-3">
      <p className="dark:text-white">
        Nothing has changed here but I've now rendered:{" "}
        <span className="dark:text-green-300 text-grey-900">
          {(renderCount.current ++)} time(s)
      </span>
      </p>
    </div>
  );
}
export default React.memo(Counts);
```

现在，当我们通过单击选择奶酪类型时，我们的 `<Counts />` 组件将不会重新渲染。

# 什么是 useMemo()？

`React.memo()` 是一个 HOC，而 [useMemo()](https://blog.logrocket.com/react-reference-guide-hooks-api/#usememo) 是一个 React Hook。 使用 `useMemo()`，我们可以返回记忆值来避免函数的依赖项没有改变的情况下重新渲染。

为了在我们的代码中使用 `useMemo()`，[React 开发者有一些建议给我们](https://blog.logrocket.com/rethinking-hooks-memoization/)：

- 您可以依赖 `useMemo()` 作为性能优化，而不是语义保证
- 函数内部引用的每个值也应该出现在依赖项数组中

对于我们的下一个示例，我们将对 `<ParentComponent />` 进行一些更改。 下面的代码仅显示对我们之前创建的 `<ParentComponent />` 的新更改。

```
// components/parent-component.js

import { useState, useEffect, useRef, useMemo } from "react";
import UseMemoCounts from "./use-memo-counts";

export default function ParentComponent() {
  const [times, setTimes] = useState(0);
  const useMemoRef = useRef(0);

  const incrementUseMemoRef = () => useMemoRef.current++;

  // uncomment the next line to test that <UseMemoCounts /> will re-render every t ime the parent re-renders.
  // const memoizedValue = useMemoRef.current++;

// the next line ensures that <UseMemoCounts /> only renders when the times value changes
const memoizedValue = useMemo(() => incrementUseMemoRef(), [times]);

  return (
    <div className="flex flex-col justify-center items-center border-2 rounded-md mt-5 dark:border-yellow-200 max-w-lg m-auto pb-10 bg-gray-900">
        <div className="mt-4 text-center">
          <button
            className="bg-indigo-200 py-2 px-10 rounded-md"
            onClick={() => setTimes(times+1)}
          >
            Force render
          </button>

          <UseMemoCounts memoizedValue={memoizedValue} />
        </div>
    </div>
  );
}
```

首先，我们引入了非常重要的 `useMemo()` Hook。 我们还引入了 `useRef()` Hook 来帮助我们跟踪在我们的组件中发生了多少次重新渲染。 接下来，我们声明一个 `times` 状态，稍后我们将更新该状态来触发/强制重新渲染。

之后，我们声明一个 `memoizedValue` 变量，用于存储 `useMemo()` Hook 的返回值。` useMemo()` Hook 调用我们的 `incrementUseMemoRef` 函数，它会在每次依赖项发生变化时将我们的 `useMemoRef.current` 值加一，即 `times` 值发生变化。

然后我们创建一个按钮来点击更新`times`的值。 单击此按钮将触发我们的 `useMemo()` Hook，更新 `memoizedValue` 的值，并重新渲染我们的 `<UseMemoCounts />` 组件。

在这个例子中，我们还将 `<Counts />` 组件重命名为 `<UseMemoCounts />`，它现在需要一个 `memoizedValue` 属性。

这是它的样子：
```
// components/use-memo-counts.js

function UseMemoCounts({memoizedValue}) {
  return (
    <div className="mt-3">
      <p className="dark:text-white max-w-md">
        I'll only re-render when you click <span className="font-bold text-indigo-400">Force render.</span>
        </p>
      <p className="dark:text-white">I've now rendered: <span className="text-green-400">{memoizedValue} time(s)</span> </p>
    </div>
  );
}
export default UseMemoCounts;
```

现在，当我们单击任何奶酪按钮时，我们的 `memoizedValue` 不会更新。 但是当我们单击 **Force render** 按钮时，我们看到 `memoizedValue` 更新并且 `<UseMemoCounts />` 组件重新渲染。

如果您注释掉我们当前的 `memoizedValue` 行，并取消注释掉它上面的行：
```
const memoizedValue = useMemoRef.current++;
```

您将看到 `<UseMemoCounts />` 组件在每次 `<ParentComponent />` 渲染时重新渲染。

# 总结：React.memo() 和 useMemo() 的主要区别

从上面的例子中，我们可以看到 `React.memo()` 和 `useMemo()` 之间的主要区别：

- `React.memo()` 是一个高阶组件，我们可以使用它来包装我们不想重新渲染的组件，除非其中的 props 发生变化
- `useMemo()` 是一个 React Hook，我们可以使用它在组件中包装函数。 我们可以使用它来确保该函数中的值仅在其依赖项之一发生变化时才重新计算

虽然 memoization 似乎是一个可以随处使用的巧妙小技巧，但只有在绝对需要这些性能提升时才应该使用它。 Memoization 会占用运行它的机器上的内存空间，因此可能会导致意想不到的效果。

</details>

## 33. 导致页面加载白屏时间长的原因有哪些，怎么进行优化？ {#question-841bfe02-d07d-45db-9e65-b9c250595d80}

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

## 34. script标签放在header里和放在body底部里有什么区别？ {#question-54940522-41b4-42f5-ae3e-83d520d1cff5}

> 难度：2 · 类型：QA

### 题目要点

**作答思路：**

将`&lt;script&gt;`标签放在HTML页面的`<head>`部分和`<body>`底部，主要从以下几个方面讲一下：

1. **加载顺序**：

2. **页面渲染**：

3. **页面性能**：

4. **交互体验**：

**考察要点**：

- **`<head>` 部分：** 适合需要立即执行的脚本，但可能阻塞页面渲染。
- **`<body>` 底部：** 适合一般脚本，能提高页面加载性能和用户体验。
- **使用 `defer` 或 `async`：** 现代浏览器支持这些属性，可以同时兼顾性能和功能需求。

<details>
<summary>参考答案</summary>

将 `&lt;script&gt;` 标签放在`<head>`和 `<body>` 底部，会对页面的加载和性能产生不同的影响：

### `&lt;script&gt;` 标签放在 `<head>` 部分

**优点：**
1. **预加载：** 浏览器在渲染页面之前，会先下载和解析所有在 `<head>` 部分的脚本文件。这样可以确保脚本在页面加载过程中随时可以被调用。
2. **全局可用性：** 一些脚本，特别是需要在页面一加载就运行的脚本，适合放在 `<head>` 中。

**缺点：**
1. **阻塞渲染：** 浏览器在遇到 `&lt;script&gt;` 标签时会暂停 HTML 的解析和渲染，直到脚本下载并执行完毕。这可能会导致页面加载变慢，尤其是当脚本文件较大或者需要从远程服务器下载时。
2. **页面白屏时间延长：** 用户可能会看到页面在加载过程中有一段时间的白屏，直到脚本加载完成。

### `&lt;script&gt;` 标签放在 `<body>` 底部

**优点：**
1. **非阻塞渲染：** 将 `&lt;script&gt;` 标签放在 `<body>` 底部意味着浏览器可以优先下载和渲染 HTML 内容，这样用户可以更快地看到页面内容。
2. **更好的用户体验：** 用户不会因为等待脚本加载而长时间看到空白页面。页面内容会先显示出来，然后再执行脚本，这提高了页面的响应速度和用户体验。

**缺点：**
1. **延迟脚本执行：** 如果某些脚本需要在页面加载之前运行（如某些初始化脚本），放在 `<body>` 底部可能会导致这些脚本运行延迟，影响功能。

### 现代优化技术

**1. `defer` 属性：**
在 `<head>` 部分使用 `&lt;script&gt;` 标签时，可以添加 `defer` 属性。这个属性会告诉浏览器异步下载脚本，但在页面解析完成后再执行脚本。这样既可以保持脚本全局可用，又不会阻塞页面渲染。
```html
<script src="script.js" defer></script>
```

**2. `async` 属性：**
`async` 属性也用于异步加载脚本，但它会在脚本下载完成后立即执行，不考虑页面的解析进度。这对某些独立的、不会依赖于其他脚本或 DOM 结构的脚本很有用。
```html
<script src="script.js" async></script>
```

### 总结

- **`<head>` 部分：** 适合需要立即执行的脚本，但可能阻塞页面渲染。
- **`<body>` 底部：** 适合一般脚本，能提高页面加载性能和用户体验。
- **使用 `defer` 或 `async`：** 现代浏览器支持这些属性，可以同时兼顾性能和功能需求。

</details>

## 35. 怎么进行站点内的图片性能优化？ {#question-0b096e94-b846-448b-ae4b-b4f500e96bf1}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

进行站点内的图片性能优化，可以采取以下几种方法：

1. **压缩图片**：使用图像压缩工具（如TinyPNG、JPEGmini等）来压缩图片，减少文件大小，加快加载速度。
2. **优化图片格式**：根据图片内容和质量要求，选择合适的图片格式（如JPEG、PNG、WebP等），以达到更好的压缩效果。
3. **使用懒加载**：对于用户初始不查看的区域，可以采用懒加载技术，等到用户滚动到相应位置时再加载图片。
4. **图片CDN**：使用内容分发网络（CDN）来加速图片的加载速度，通过将图片托管在CDN上，利用CDN的边缘服务器来缓存图片，减少用户与服务器之间的距离，提高加载速度。
5. **优化图片大小**：根据图片在页面中的实际大小来调整图片尺寸，避免使用过大的图片，以减少文件大小。
6. **合理使用CSS Sprites**：将多个小图片合并为一个大的图片，通过CSS的background-position属性来显示不同的部分，以减少HTTP请求数量。
通过这些方法，可以有效地优化站点内的图片性能，提高用户体验。

**考察要点**：

1. **压缩和格式优化**：理解如何通过压缩和优化图片格式来减少文件大小。
2. **懒加载和CDN使用**：了解如何使用懒加载和CDN来加速图片加载。
3. **图片大小和CSS Sprites**：理解如何通过调整图片大小和使用CSS Sprites来优化图片性能。

<details>
<summary>参考答案</summary>

## 选择合适的图片格式

### JPEG

JPEG 是由 Joint Photographic Experts Group 所开发出的一种图片。它最大的特点是 **有损压缩**。这种高效的压缩算法使它成为了一种非常轻巧的图片格式。另一方面，即使被称为“有损”压缩，JPG 的压缩方式仍然是一种高质量的压缩方式：当我们把图片体积压缩至原有体积的 50% 以下时，JPG 仍然可以保持住 60% 的品质。此外，JPG 格式以 24 位存储单个图，可以呈现多达 1600 万种颜色，足以应对大多数场景下对色彩的要求，这一点决定了它压缩前后的质量损耗并不容易被我们人类的肉眼所察觉。

**优点**

- JPEG 格式的图片可以呈现数百万种颜色。所以每当网站需要呈现色彩丰富的图片，JPEG 总是最佳选择。
- 有损压缩，你可以通过压缩大大的减少图片的体积，一般图片用 60%级别比较合适，如果选择大于 75%的压缩等级，则会使图片有明显的质量下降。
- 无兼容性问题，所以开发者可以放心随意使用。

**使用场景**

- JPG 适用于呈现色彩丰富的图片，在我们日常开发中，JPEG 图片经常作为大的背景图、轮播图或 Banner 图出现。
- 但是有损压缩后的图片确实很难露出马脚，当它处理矢量图形和 Logo 等线条感较强、颜色对比强烈的图像时，人为压缩的图片模糊会相当明显。
- JPEG 图像不支持透明度处理，透明图片可选择使用 PNG。

### PNG

PNG（可移植网络图形格式）是由 W3C 开发的图片格式，是一种**无损压缩**的高保真的图片格式。它同时支持 8 位和 24 位，这里都是二进制数的位数。按照我们前置知识里提到的对应关系，8 位的 PNG 最多支持 256 种颜色，而 24 位的可以呈现约 1600 万种颜色。

PNG 图片具有比 JPEG 更强的色彩表现力，对线条的处理更加细腻，对透明度有良好的支持。它弥补了上文我们提到的 JPEG 的局限性，唯一的缺点就是　**体积太大**。

**应用场景**

- PNG 在处理线条和颜色对比度方面的优势，我们主要用它来呈现小的 Logo、颜色简单且对比强烈的图片或背景等。
- 支持透明度处理，透明图片可选择使用 PNG

### GIF

GIF 是一种最多支持 256 种颜色的 8 位无损图片格式。这个限制让 GIF 格式对于多颜色或者摄影图片的展示无能为力。

**优点**

- 支持 256 中颜色，文件体积通常都很小
- 支持透明

**应用场景**

- 支持动画，适合去展示一些无限循环的动画，比如图标、表情、广告栏等。
- 对于一些只有简单色彩的图片非常合适。

### WebP

WebP 是一种同时提供了有损压缩与无损压缩（可逆压缩）的图片文件格式，派生自影像编码格式 VP8。它像 JPEG 一样对细节丰富的图片信手拈来，像 PNG 一样支持透明，像 GIF 一样可以显示动态图片，集多种图片文件格式的优点于一身。

WebP 最初在 2010 年发布，目标是减少文件大小，但达到和 JPEG 格式相同的图片质量，希望能够减少图片档在网络上的发送时间。根据 Google 较早的测试，WebP 的无损压缩比网络上找到的 PNG 档少了 45％的文件大小，即使这些 PNG 档在使用 pngcrush 和 PNGOUT 处理过，WebP 还是可以减少 28％的文件大小。

虽然 webP 有诸多优点，但是它不能完全替代 JPEG 和 PNG，因为浏览器对 WebP 支持并不普遍。特别是移动端 IOS 系统基本不支持。

## 图片压缩

图片众多以及图片体积过大往往会影响页面加载速度，造成不良的用户体验，有部分图片达到几百 kB，甚至 2M(这锅必须运营背，非得上传高清大图不可？)，直接导致了加载时间过长。所以对于体积过大的图片，在保持图片在可接受的清晰度范围内可适当对图片大小进行压缩。

图片压缩又分为有损压缩和无损压缩。

**有损压缩**

有损压缩指在压缩文件大小的过程中，损失了一部分图片的信息，也即降低了图片的质量（即图片被压糊了），并且这种损失是不可逆的。常见的有损压缩手段是按照一定的算法将临近的像素点进行合并。压缩算法不会对图片所有的数据进行编码压缩，而是在压缩的时候，去除了人眼无法识别的图片细节。因此有损压缩可以在同等图片质量的情况下大幅降低图片的体积。例如 jpg 格式的图片使用的就是有损压缩。

**无损压缩**

无损压缩指的是在压缩图片的过程中，图片的质量没有任何损耗。我们任何时候都可以从无损压缩过的图片中恢复出原来的信息。压缩算法对图片的所有的数据进行编码压缩，能在保证图片的质量的同时降低图片的体积。例如 png、gif 使用的就是无损压缩。

下面是各种图片格式的压缩类型

![image.png](https://static.ecool.fun//article/d83a5bc5-e6e9-4af3-b1ea-fb7540c0ab8b.jpeg)

### 工具压缩

- [tinypng](https://tinypng.com/) 免费、批量、速度块
- [智图压缩](https://zhitu.isux.us/) 百度很难搜到官网了，免费、批量、好用
- [squoosh](https://squoosh.app/) 在线图片压缩工具
- [compressor](https://compressor.io/) 支持 JPG、PNG、SVG、GIF

### webpack 压缩

工程化的项目可以在 webpack 里面配置 image-webpack-loader 进行图片压缩

1. 安装依赖

```js
npm install --save-dev image-webpack-loader
```

2. 配置 webpack

```js
module.exports = {
...
  module: {
    rules: [
      {
        test: /.(png|jpe?g|gif|svg)(?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:7].[ext]'
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 50,
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                quality: [0.5, 0.65],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: { // 不支持WEBP就不要写这一项
                quality: 75
              },
            },
          },
        ],
      },
    ],
  },
}
```

至于要不要使用插件自动压缩就见仁见智了，因为有些 UI 和产品会说压缩出来的效果图片不是他们想要的。

## 使用雪碧图

雪碧图，CSS Sprites，国内也叫 CSS 精灵，是一种 CSS 图像合成技术，主要用于小图片显示。

浏览器请求资源的时候，同源域名请求资源的时候有最大并发限制，chrome 为 6 个，就比如你的页面上有 10 个相同 CDN 域名小图片，那么需要发起 10 次请求去拉取，分两次并发。第一次并发请求回来后，发起第二次并发。如果你把 10 个小图片合并为一张大图片的画，那么只用一次请求即可拉取下来 10 个小图片的资源。减少服务器压力，减少并发，减少请求次数。

**优点**

把诸多小图片合成一张大图，利用 `backround-position` 属性值来确定图片呈现的位置，可以有效的较少请求个数，而且，而不影响开发体验，使用构建插件可以做到对开发者透明。适用于页面图片多且丰富的场景。

**缺点**

生成的图片体积较大，减少请求个数同时也增加了图片大小，不合理拆分将不利于并行加载。

**合成雪碧图**

在 webpack 中，有相应的插件提供了自动合成雪碧图的功能并且可以自动生成对应的样式文件—— webpack-spritesmith，使用方法如下

```js
var path = require('path')
var SpritesmithPlugin = require('webpack-spritesmith')

module.exports = {
  // ...
  plugins: [
    new SpritesmithPlugin({
      src: {
        cwd: path.resolve(__dirname, 'src/ico'),
        glob: '*.png',
      },
      target: {
        image: path.resolve(__dirname, 'src/spritesmith-generated/sprite.png'),
        css: path.resolve(__dirname, 'src/spritesmith-generated/sprite.styl'),
      },
      apiOptions: {
        cssImageRef: '~sprite.png',
      },
    }),
  ],
}
```

通过上面配置就能将 `src/ico` 目录下的所有 png 文件合成雪碧图，并且输出到对应目录，同时还可以生成对应的样式文件，样式文件的语法会根据你配置的样式文件的后缀动态生成。

## 使用 iconfont

iconfont(字体图标)，即通过字体的方式展示图标，多用于渲染图标、简单图形、特殊字体等。

**优点**

- 像使用字体一样，设置大小、颜色及其他样式，不失真
- 轻量，易修改
- 有效减少 HTTP 请求次数

推荐使用阿里的字体图标库：[iconfont](https://www.iconfont.cn/)

## 使用 base64 格式

原理：将图片转换为 base64 编码字符串 inline 到页面或 css 中。

**优点**

- 提升性能: 网页上的每一个图片，都是需要消耗一个 http 请求下载而来的, 图片的下载始终都要向服务器发出请求，要是图片的下载不用向服务器发出请求，base64 可以随着 HTML 的下载同时下载到本地.减少 https 请求。

- 加密: 让用户一眼看不出图片内容 , 只能看到编码。

- 方便引用: 在多个文件同时使用某些图片时, 可以把图片转为 base64 格式的文件, 把样式放在全局中, 比如 common.css, 以后在用的时候就可以直接加类名, 二不需要多层找文件路径, 会提升效率

但需要注意的是：如果图片较大，图片的色彩层次比较丰富，则不适合使用这种方式，因为该图片经过 base64 编码后的字符串非常大，会明显增大 HTML 页面的大小，从而影响加载速度。

base64 化最常见的就是在 url-loader 中使用。

```js
module.exports = {
...
  module: {
    rules: [
      {
        test: /.(png|jpe?g|gif|svg)(?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        }
      },
    ],
  },
}
```

这样就能将项目中小于 10kb 的图片转化为 base64 应用到页面中

## 使用 css 代替图片。

比如实现修饰效果，如半透明、边框、圆角、阴影、渐变等，在当前主流浏览器中都可以用 CSS 达成，这样能减少图片的请求，达到优化的目的。

**缺点**

- 受限于 css 的浏览器的兼容性
- 对于较复杂的图案就无能为力了，写也麻烦，开发成本大

## 使用 CDN 图片

CDN 的全称是 Content Delivery Network，即内容分发网络。CDN 是构建在网络之上的内容分发网络，依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等功能模块，使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。CDN 的关键技术主要有内容存储和分发技术。

举个简单的例子：

> 以前买火车票大家都只能去火车站买，后来我们买火车票就可以在楼下的火车票代售点买了。

**基本原理**

CDN 的基本原理是广泛采用各种缓存服务器，将这些缓存服务器分布到用户访问相对集中的地区或网络中，在用户访问网站时，利用全局负载技术将用户的访问指向距离最近的工作正常的缓存服务器上，由缓存服务器直接响应用户请求。

**基本思路**

CND 的基本思路是尽可能避开互联网上有可能影响数据传输速度和稳定性的瓶颈和环节，使内容传输的更快、更稳定。通过在网络各处放置节点服务器所构成的在现有的互联网基础之上的一层智能虚拟网络，CDN 系统能够实时地根据网络流量和各节点的连接、负载状况以及到用户的距离和响应时间等综合信息将用户的请求重新导向离用户最近的服务节点上。其目的是使用户可就近取得所需内容，解决 Internet 网络拥挤的状况，提高用户访问网站的响应速度。

**CDN 的优势**

- CDN 节点解决了跨运营商和跨地域访问的问题，访问延时大大降低；
- 大部分请求在 CDN 边缘节点完成，CDN 起到了分流作用，减轻了源站的负载。

## 图片懒加载

懒加载是一种网页性能优化的方式，它能极大的提升用户体验。图片一直是影响网页性能的主要元凶，现在一张图片超过几兆已经是很经常的事了。如果每次进入页面就请求所有的图片资源，那么可能等图片加载出来用户也早就走了。所以进入页面的时候，只请求可视区域的图片资源。

总结出来就是：

- 减少资源的加载，页面启动只加载首屏的图片，这样能明显减少了服务器的压力和流量，也能够减小浏览器的负担。
- 防止并发加载的资源过多而阻塞 js 的加载，影响整个网站的启动，影响用户体验
- 浪费用户的流量，有些用户并不想全部看完，全部加载会耗费大量流量。

**原理**

图片懒加载的原理就是暂时不设置图片的 src 属性，而是将图片的 url 隐藏起来，比如先写在 data-src 里面，等当前图片是否到了可视区域再将图片真实的 url 放进 src 属性里面，从而实现图片的延迟加载。

```js
function lazyload() {
  let viewHeight = document.body.clientHeight //获取可视区高度
  let imgs = document.querySelectorAll('img[data-src]')
  imgs.forEach((item, index) => {
    if (item.dataset.src === '') return

    // 用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
    let rect = item.getBoundingClientRect()
    if (rect.bottom >= 0 && rect.top < viewHeight) {
      item.src = item.dataset.src
      item.removeAttribute('data-src')
    }
  })
}

// 可以使用节流优化一下
window.addEventListener('scroll', lazyload)
```

通过上面例子的实现，我们要实现懒加载都需要去监听 scroll 事件，尽管我们可以通过函数节流的方式来阻止高频率的执行函数,但是我们还是需要去计算 scrollTop,offsetHeight 等属性，有没有简单的不需要计算这些属性的方式呢，答案是有的---IntersectionObserver

```js
const imgs = document.querySelectorAll('img[data-src]')
const config = {
  rootMargin: '0px',
  threshold: 0,
}
let observer = new IntersectionObserver((entries, self) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      let img = entry.target
      let src = img.dataset.src
      if (src) {
        img.src = src
        img.removeAttribute('data-src')
      }
      // 解除观察
      self.unobserve(entry.target)
    }
  })
}, config)

imgs.forEach((image) => {
  observer.observe(image)
})
```

## 图片预加载

图片预加载，是指在一些需要展示大量图片的网站，将图片提前加载到本地缓存中，从而提升用户体验。

常用的方式有两种，一种是隐藏在 css 的 background 的 url 属性里面，一种是通过 javascript 的 Image 对象设置实例对象的 src 属性实现图片的预加载。

**1、用 CSS 和 JavaScript 实现预加载**

```css
#preload-01 {
  background: url(http://domain.tld/image-01.png) no-repeat -9999px -9999px;
}
#preload-02 {
  background: url(http://domain.tld/image-02.png) no-repeat -9999px -9999px;
}
#preload-03 {
  background: url(http://domain.tld/image-03.png) no-repeat -9999px -9999px;
}
```

通过 CSS 的 background 属性将图片预加载到屏幕外的背景上。当它们在 web 页面的其他地方被调用时，浏览器就会在渲染过程中使用预加载（缓存）的图片。该方法虽然高效，但仍有改进余地。使用该法加载的图片会同页面的其他内容一起加载，增加了页面的整体加载时间。<br>
为了解决这个问题，我们增加了一些 JavaScript 代码，来推迟预加载的时间，直到页面加载完毕。

```js
function preloader() {
  if (document.getElementById) {
    document.getElementById('preload-01').style.background =
      'url(http://domain.tld/image-01.png) no-repeat -9999px -9999px'
    document.getElementById('preload-02').style.background =
      'url(http://domain.tld/image-02.png) no-repeat -9999px -9999px'
    document.getElementById('preload-03').style.background =
      'url(http://domain.tld/image-03.png) no-repeat -9999px -9999px'
  }
}
function addLoadEvent(func) {
  var oldonload = window.onload
  if (typeof window.onload != 'function') {
    window.onload = func
  } else {
    window.onload = function () {
      if (oldonload) {
        oldonload()
      }
      func()
    }
  }
}
addLoadEvent(preloader)
```

**2、使用 JavaScript 实现预加载**

```js
function preloader() {
  if (document.images) {
    var img1 = new Image()
    var img2 = new Image()
    var img3 = new Image()
    img1.src = 'http://domain.tld/path/to/image-001.gif'
    img2.src = 'http://domain.tld/path/to/image-002.gif'
    img3.src = 'http://domain.tld/path/to/image-003.gif'
  }
}
function addLoadEvent(func) {
  var oldonload = window.onload
  if (typeof window.onload != 'function') {
    window.onload = func
  } else {
    window.onload = function () {
      if (oldonload) {
        oldonload()
      }
      func()
    }
  }
}
addLoadEvent(preloader)
```

## 响应式图片加载

什么是响应式图片加载？其实就是在不同分辨率的设备上显示不同尺寸的图片，避免资源的浪费。<br>

常用的方法就是 css3 的媒体查询(media query)。

```css
@media  screen and (min-width: 1200px) {
  img {
    background-image: url('1.png');
  }
}
@media  screen and (min-width: 992px) {
  img {
    background-image: url('2.png');
  }
}
@media  screen and (min-width: 768px) {
  img {
    background-image: url('3.png');
  }
}
@media screen and (min-width: 480px) {
  img {
    background-image: url('4.png');
  }
}
```

此外，还可以使用 HTML5 的 picture 属性进行响应式处理。方法如下：

1. 创建 picture 标签。
2. 放置多个 source 标签，以指定不同的图像文件名，进而根据不同的条件进行加载。
3. 添加一个回退的元素

```html
<picture>
  <source srcset="src/img/l.png" media="(min-width: 1200px)" />
  <source srcset="src/img/2.png" media="(min-width: 992px)" />
  <source srcset="src/img/4.png" media="(min-width: 768px)" />
  <img src="src/img/4.png" />
</picture>
```

需要注意的是：现在很多浏览器对于 picture 这个标签还不支持，使用的时候需要加以注意。

![picture.png](https://static.ecool.fun//article/fa1feac0-e39c-42b0-b290-8b2a24cd7ace.jpeg)

## 渐进式图片

渐进式图片的意思是在高画质图像加载完之前会先显示低画质版本。低画质版本由于画质低、压缩率高，尺寸很小，加载很快。在两者之间我们也可以根据需要显示不同画质的版本。

![cat.png](https://static.ecool.fun//article/17348b63-9d9d-4179-a302-c131f38307cb.jpeg)

渐进式图片可以让用户产生图片加载变快的印象。用户不再盯着一片空白区域等待图片加载，而能看到图像变得越来越清晰，这样对用户体验也是友好的。

骨架屏技术也是类似的原理。

## 总结

1. 选择合适的图片格式和压缩大图，可从根源上截图大图加载过慢的问题。
2. 使用雪碧图，iconfont，base64，css 代替图片等可减少图片 http 请求，提高页面加载速度。
3. 使用 CDN 图片可达到分流的效果，减少服务券压力。
4. 图片懒加载，预加载，渐进式图片等可不同程度减少白屏时间，提高产品体验。

</details>

## 36. DNS 预解析是什么？怎么实现？ {#question-d76e76c3-7400-4c6e-958a-b5f00916d47d}

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

## 37. 前端性能优化指标有哪些？怎么进行性能检测？ {#question-26e22fa9-becc-4552-b79a-da2f67451455}

> 难度：3 · 类型：QA

### 题目要点

前端性能评估主要围绕三个维度展开：
* 页面加载速度、交互响应能力以及页面稳定性。常见指标包括 FP、FCP、LCP 等加载指标，FID 和 INP 等交互指标，以及 CLS 布局稳定性指标。
* 性能检测通常分为两类方式：开发阶段使用 Lighthouse、Chrome DevTools、WebPageTest 等工具进行实验室分析；
* 线上环境通过 Performance API 或 web-vitals 采集真实用户性能数据，并结合监控平台进行统计与优化。

<details>
<summary>参考答案</summary>

前端性能通常不会只看单一指标，而是从**用户感知加载速度、交互响应速度以及页面稳定性**三个维度进行评估。当前行业中比较主流的一套指标体系来自 Google 提出的 **Web Vitals**，并结合传统的加载性能指标共同评估。

首先从**页面加载阶段的性能指标**来看。

用户访问页面时，最直观的感受是“页面什么时候开始出现内容、什么时候可以操作”。在这个阶段常见的指标包括：

* **FP（First Paint）**：浏览器首次开始绘制像素的时间点，说明页面已经开始渲染。
* **FCP（First Contentful Paint）**：首次渲染出真实内容（文本、图片、SVG 等）的时间，这个指标更接近用户感知。
* **LCP（Largest Contentful Paint）**：页面中最大可见内容元素的渲染时间，例如首屏大图或标题，通常被视为**首屏加载体验的核心指标**。

在真实项目中，如果 LCP 超过 2.5s，一般就需要考虑优化首屏资源加载，例如代码分割、图片压缩、CDN、预加载等。

第二类指标关注的是**页面交互响应能力**。

即页面是否能快速响应用户操作，而不会出现明显卡顿。比较典型的指标是：

* **FID（First Input Delay）**：用户第一次交互（点击、输入）到浏览器开始处理事件的延迟时间。
* **INP（Interaction to Next Paint）**：Google 新提出的指标，用来衡量整个页面生命周期中的交互响应能力，比 FID 更全面。

这些指标通常和 **主线程阻塞**相关，例如：

* JS 执行时间过长
* 大量同步任务
* 大 JSON 解析
* 重计算布局或重绘

因此工程中常见优化方式包括 Web Worker、虚拟列表、任务切片（`requestIdleCallback` / `requestAnimationFrame`）等。

第三类指标是**页面稳定性指标**。

页面加载过程中如果元素频繁跳动，会严重影响用户体验。衡量这个问题的核心指标是：

* **CLS（Cumulative Layout Shift）**

它用于统计页面布局偏移的累计值。常见导致 CLS 的原因包括：

* 图片未设置宽高
* 异步加载广告
* 动态插入 DOM
* 字体加载引起布局变化

在工程实践中，一般通过为图片、视频等元素提前声明尺寸，或者使用 skeleton 占位，来降低 CLS。

---

在明确指标之后，还需要通过工具进行**性能检测与数据采集**。常见方法可以分为实验室环境检测和真实用户监控两类。

**实验室检测（Lab Data）**

主要用于开发阶段或性能调优阶段：

* **Chrome DevTools – Performance 面板**
  可以查看 JS 执行、渲染流程、长任务、布局和重绘情况。

* **Lighthouse**
  Google 官方的性能检测工具，可以生成性能报告，包括 FCP、LCP、CLS 等指标，并给出优化建议。

* **WebPageTest**
  可以模拟不同网络环境、设备和地区，分析瀑布图、资源加载顺序等。

这些工具适合在开发阶段进行分析，但并不能完全代表真实用户体验。

---

**真实用户监控（RUM, Real User Monitoring）**

线上环境通常需要接入监控系统，采集真实用户的性能数据，例如：

* 使用 **Performance API** 获取指标
  如 `performance.getEntriesByType('paint')` 获取 FP / FCP。

* 使用 **web-vitals 库**
  可以直接采集 LCP、CLS、INP 等核心指标并上报。

* 接入监控平台
  如 Sentry、阿里 ARMS、Datadog 等，通过埋点上报性能数据。

真实项目中通常会通过 **SDK 自动采集性能指标 + 上报日志平台**，然后根据地区、设备、网络环境做统计分析，找出性能瓶颈。

</details>

## 38. 浏览器为什么要请求并发数限制？ {#question-76e41377-7373-4113-8c6d-e506cadb0fe0}

> 难度：3 · 类型：QA

### 题目要点

**作答思路：**

浏览器对请求并发数进行限制，主要是出于以下几个考虑要点：

1. **服务器压力**：限制并发数可以减轻服务器的负载，防止服务器因处理过多请求而过载。

2. **资源分配**：合理分配网络资源，确保浏览器可以同时处理多个请求，但不至于消耗过多带宽。

3. **用户体验**：避免因等待过多响应而影响用户体验，平衡页面加载和响应时间。

4. **安全性**：防止恶意用户通过发起大量请求来攻击网站，实施拒绝服务攻击（DoS攻击）。

5. **公平性**：确保不同用户和不同网站之间的请求能够公平地竞争网络资源。

6. **浏览器性能**：避免浏览器自身因处理过多并发请求而出现性能瓶颈或崩溃。

<details>
<summary>参考答案</summary>

1.对操作系统端口资源考虑

PC总端口数为65536，那么一个TCP（http也是tcp）链接就占用一个端口。操作系统通常会对总端口一半开放对外请求，以防端口数量不被迅速消耗殆尽。

2.过多并发导致频繁切换产生性能问题

一个线程对应处理一个http请求，那么如果并发数量巨大的话会导致线程频繁切换。而线程的上下文切换有时候并不是轻量级的资源。这导致得不偿失，所以请求控制器里面会产生一个链接池，以复用之前的链接。所以我们可以看作同域名下链接池最大为4～8个，如果链接池全部被使用会阻塞后面请求任务，等待有空闲链接时执行后续任务。

3.避免同一客服端并发大量请求超过服务端的并发阈值

在服务端通常都对同一个客户端来源设置并发阀值避免恶意攻击，如果浏览器不对同一域名做并发限制可能会导致超过服务端的并发阀值被BAN掉。

4.客户端良知机制

为了防止两个应用抢占资源时候导致强势一方无限制的获取资源导致弱势一方永远阻塞状态。

</details>

## 39. 如果一个列表有 100000 个数据，这个该怎么进行展示？ {#question-9792c9df-e258-4faf-a4a4-9b3358241db8}

> 难度：1 · 类型：QA

### 题目要点

#### 答题思路

1. **分析数据量**：首先认识到直接渲染100000个数据项到DOM中是不现实的，会严重影响页面性能和用户体验。

2. **选择展示策略**：
   - **分页**：将数据分成多个页面展示，每页显示固定数量的数据项。
   - **滚动加载（懒加载）**：初始时只加载部分数据，当用户滚动到页面底部时，再加载更多数据。
   - **虚拟化技术**：只渲染可视区域内的数据项，对于不可见的部分则不渲染或只渲染占位符。

3. **优化渲染性能**：
   - 使用高效的DOM操作方法，如`DocumentFragment`来减少DOM操作次数。
   - 如果使用虚拟DOM库（如React、Vue），利用其内部优化机制。

4. **提供搜索和筛选功能**：允许用户通过搜索或筛选来快速定位到感兴趣的数据项，减少需要渲染的数据量。

5. **考虑后端支持**：如果可能，让后端支持分页或搜索查询，以减少前端处理的数据量。

#### 考察要点

1. **性能优化意识**：能否意识到大数据量对前端性能的影响，并提出合理的优化方案。

2. **技术选型能力**：能否根据具体场景选择合适的展示策略和技术方案。

3. **用户体验设计**：能否从用户的角度出发，设计出既高效又友好的数据展示方式。

4. **前后端协作能力**：能否考虑到后端在数据处理和传输方面的支持作用，并提出合理的协作方案。

<details>
<summary>参考答案</summary>

我们需要思考的问题：该处理是否必须同步完成？数据是否必须按顺序完成？

解决办法：

（1）将数据分页，利用分页的原理，每次服务器端只返回一定数目的数据，浏览器每次只对一部分进行加载。

（2）使用懒加载的方法，每次加载一部分数据，其余数据当需要使用时再去加载。

（3）使用数组分块技术，基本思路是为要处理的项目创建一个队列，然后设置定时器每过一段时间取出一部分数据，然后再使用定时器取出下一个要处理的项目进行处理，接着再设置另一个定时器。

（4）虚拟列表，每次只渲染需要视口的部分

</details>

## 40. 如何确定页面的可用性时间，什么是 Performance API？ {#question-f7192fdf-cbfe-4b62-96af-a614e6a37055}

> 难度：1 · 类型：QA

### 题目要点

**作答思路：**

### 答题思路

 一、如何确定页面的可用性时间

1. **理解页面可用性时间**：页面可用性时间通常指的是从用户发起请求到页面完全加载并可用（即用户可以开始与页面进行交互）的时间段。这包括DNS解析、TCP连接、资源加载（如HTML、CSS、JS、图片等）、DOM构建与解析、样式计算、布局和绘制等过程。

2. **使用Performance API**：Performance API 提供了一系列的方法和属性，允许开发者精确地测量和分析页面的加载时间和其他性能指标。通过该API，可以获取到页面加载的各个阶段的时间戳，从而计算出页面的可用性时间。

3. **计算可用性时间**：具体的计算方法可能因需求而异，但通常可以通过 `performance.timing` 对象中的 `loadEventEnd`（页面加载完成的时间）和 `navigationStart`（导航开始的时间，即用户发起请求的时间）来计算页面的整体加载时间，这可以视为页面可用性时间的一种衡量方式。

 二、什么是Performance API

1. **定义**：Performance API 是一组用于测量和监控网页性能的JavaScript接口，它提供了丰富的工具和信息，帮助开发者精确地分析和优化网页性能。

2.**使用场景**：Performance API 广泛应用于前端性能优化、问题诊断、用户体验改进等方面。通过使用该API，开发者可以及时发现和解决性能瓶颈，提升网页的加载速度和交互性能。

#### 考察要点

1. **对页面可用性时间的理解**：能否准确理解页面可用性时间的含义及其重要性。
2. **对Performance API的掌握程度**：是否了解Performance API的基本概念、功能和使用方法。
3. **性能优化能力**：能否运用Performance API等工具进行前端性能分析和优化。
4. **问题解决能力**：面对性能问题，能否快速定位并解决。

<details>
<summary>参考答案</summary>

Performance API 用于精确度量、控制、增强浏览器的性能表现。这个 API 为测量网站性能，提供以前没有办法做到的精度。

使用 getTime 来计算脚本耗时的缺点，首先，getTime方法（以及 Date 对象的其他方法）都只能精确到毫秒级别（一秒的千分之一），想要得到更小的时间差别就无能为力了。其次，这种写法只能获取代码运行过程中的时间进度，无法知道一些后台事件的时间进度，比如浏览器用了多少时间从服务器加载网页。

为了解决这两个不足之处，ECMAScript 5引入“高精度时间戳”这个 API，部署在 performance 对象上。它的精度可以达到1毫秒
的千分之一（1秒的百万分之一）。

navigationStart：当前浏览器窗口的前一个网页关闭，发生 unload 事件时的 Unix 毫秒时间戳。如果没有前一个网页，则等于 fetchStart 属性。

loadEventEnd：返回当前网页 load 事件的回调函数运行结束时的 Unix 毫秒时间戳。如果该事件还没有发生，返回 0。

根据上面这些属性，可以计算出网页加载各个阶段的耗时。比如，网页加载整个过程的耗时的计算方法如下：

```
var t = performance.timing;
var pageLoadTime = t.loadEventEnd - t.navigationStart;
```

</details>

## 41. 谈谈对 window.requestAnimationFrame 的理解 {#question-828350f9-b3d1-4593-8306-e5bc567b5c28}

> 难度：3 · 类型：QA

### 题目要点

#### 答题思路

1. **定义与用途**：
   - 简要介绍 `window.requestAnimationFrame` 是一个告诉浏览器你希望执行动画并请求浏览器在下次重绘之前调用你指定的函数来更新动画的方法。
   - 是专门用于动画循环的函数，比传统的 `setTimeout` 或 `setInterval` 更能保证动画的平滑性和效率。

2. **工作原理**：
   - 说明 `requestAnimationFrame` 会将动画的回调函数放入浏览器的任务队列中，并在浏览器下一次重绘之前调用该函数。
   - 它的调用频率与浏览器的显示频率相匹配，通常能达到60fps（每秒60帧），从而保证了动画的流畅性。

3. **使用场景**：
   - 指出 `requestAnimationFrame` 适用于需要连续更新屏幕或执行复杂动画的场景。
   - 它特别适用于游戏开发、页面滚动效果、动态图表等需要高性能动画的应用。

4. **优点**：
   - 提及它比 `setTimeout` 或 `setInterval` 更高效，因为它只在浏览器需要重绘时才调用回调函数，减少了不必要的调用。
   - 它能更好地利用浏览器性能，因为它允许浏览器优化动画的绘制过程。

5. **注意事项**：
   - 提到如果动画在回调函数中被取消（如通过调用 `cancelAnimationFrame`），则不会再调用该回调函数。
   - 在动画结束时应该取消 `requestAnimationFrame`，以避免内存泄漏。

#### 考察要点

1. **基础知识掌握程度**：是否了解 `requestAnimationFrame` 的基本概念和工作原理。
2. **应用能力**：是否知道在哪些场景下使用 `requestAnimationFrame` 更合适。
3. **性能优化意识**：是否认识到 `requestAnimationFrame` 在性能优化方面的优势。
4. **细节处理**：是否了解如何正确取消 `requestAnimationFrame` 以避免潜在的问题。

<details>
<summary>参考答案</summary>

window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

与setTimeout相比，requestAnimationFrame最大的优势是由系统来决定回调函数的执行时机。具体一点讲，如果屏幕刷新率是60Hz,那么回调函数就每16.7ms被执行一次，如果刷新率是75Hz，那么这个时间间隔就变成了1000/75=13.3ms，换句话说就是，requestAnimationFrame的步伐跟着系统的刷新步伐走。它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。

这个API的调用很简单，如下所示：

```javascript
const element = document.getElementById('some-element-you-want-to-animate');
let start;

function step(timestamp) {
  if (start === undefined)
    start = timestamp;
  const elapsed = timestamp - start;

  //这里使用`Math.min()`确保元素刚好停在200px的位置。
  element.style.transform = 'translateX(' + Math.min(0.1 * elapsed, 200) + 'px)';

  if (elapsed < 2000) { // 在两秒后停止动画
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
```

除此之外，requestAnimationFrame还有以下两个优势：

* CPU节能：使用setTimeout实现的动画，当页面被隐藏或最小化时，setTimeout 仍然在后台执行动画任务，由于此时页面处于不可见或不可用状态，刷新动画是没有意义的，完全是浪费CPU资源。而requestAnimationFrame则完全不同，当页面处理未激活的状态下，该页面的屏幕刷新任务也会被系统暂停，因此跟着系统步伐走的requestAnimationFrame也会停止渲染，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了CPU开销。
* 函数节流：在高频率事件(resize,scroll等)中，为了防止在一个刷新间隔内发生多次函数执行，使用requestAnimationFrame可保证每个刷新间隔内，函数只被执行一次，这样既能保证流畅性，也能更好的节省函数执行的开销。一个刷新间隔内函数执行多次时没有意义的，因为显示器每16.7ms刷新一次，多次绘制并不会在屏幕上体现出来。

</details>

## 42. 虚拟DOM一定更快吗？ {#question-a19c5526-dc2d-43ac-bda7-c4b2948839a4}

> 难度：3 · 类型：QA

### 题目要点

#### 答题思路

1. **理解虚拟DOM**：
   - 简要介绍虚拟DOM是JavaScript对象表示的DOM树结构，用于在内存中模拟DOM操作，最终通过高效的算法计算出真实DOM的最小变化量并应用到真实DOM上。

2. **虚拟DOM的优势**：
   - 虚拟DOM通过减少直接对真实DOM的操作次数，提高了性能，特别是在复杂的DOM更新场景中。
   - 提到虚拟DOM的批处理和高效的DOM diff算法，能够优化DOM更新的效率。

3. **虚拟DOM不一定总是更快**：
   - 指出虚拟DOM并非在所有情况下都比直接操作DOM更快。特别是对于简单的DOM操作或更新不频繁的场景，直接操作DOM可能更加高效。
   - 性能的比较需要基于具体的应用场景和测试数据，不能一概而论。

4. **其他因素**：
   - 提到除了DOM操作方式外，前端性能还受到其他多种因素的影响，如网络请求、数据处理、页面渲染等。
   - 在优化前端性能时，需要综合考虑各种因素，并采取合适的策略。

#### 考察要点

1. **对虚拟DOM的理解**：是否了解虚拟DOM的基本概念和工作原理。
2. **性能优化意识**：是否认识到性能优化需要基于具体场景进行分析和测试，不能盲目追求某一种技术或方法。
3. **综合分析能力**：是否能够从多个角度考虑前端性能的影响因素，并给出合理的分析和建议。

<details>
<summary>参考答案</summary>

虚拟DOM可以在某些情况下性能，但并不是绝对的。

以下是一些虚拟DOM可能带来性能提升的情况：

1. **批量更新**：虚拟DOM可以将多个DOM操作合并为一次更新。它会在内部进行比较和计算，找出最小的变更集，并批量应用于真实的DOM树。这种批量更新可以减少浏览器的重排和重绘，从而提高性能。

2. **局部更新**：通过比较新旧虚拟DOM树，只有发生变化的部分会被重新渲染到真实的DOM中，而不需要重新渲染整个组件。这可以避免不必要的DOM操作，减少性能开销。

3. **跳过昂贵的计算**：在虚拟DOM的比较过程中，可以通过判断节点是否相同来跳过昂贵的计算或渲染步骤。如果两个节点相同，则无需进一步比较其子节点，从而节省了计算资源。

4. **跨平台支持**：虚拟DOM与底层平台无关，因此它可以在不同环境（例如浏览器、移动端、服务器端）进行渲染。这种可移植性使得使用虚拟DOM能够更轻松地在不同平台之间共享和重用代码。

然而，虚拟DOM也可能引入一些性能开销：

1. **额外的内存占用**：在运行时，虚拟DOM需要维护一个表示整个组件树的数据结构，这可能会占用额外的内存。

2. **操作的复杂度**：虚拟DOM需要进行比较、计算和递归遍历等操作，这可能导致一些额外的计算开销。

总的来说，虚拟DOM通常可以在中等到大型规模的应用程序中提供性能优势。然而，在简单的应用程序或特定场景下，手动的DOM操作可能更加高效。因此，在选择是否使用虚拟DOM时，需要权衡应用程序的需求、性能要求以及代码的可维护性。

</details>

## 43. 什么是内存泄漏？什么原因会导致呢？ {#question-b9bd9552-5748-45b1-88a8-f36e45f6261f}

> 难度：3 · 类型：QA

### 题目要点

#### 答题思路

什么是内存泄漏？

- **定义**：内存泄漏（Memory Leak）是指程序中已分配的内存由于某种原因未被释放或无法释放，导致这部分内存无法再次被使用，造成内存的浪费和程序的潜在性能问题。

什么原因会导致内存泄漏？

1. **全局变量**：不当地使用全局变量或在全局作用域中创建变量，这些变量在整个页面生命周期内都不会被自动释放。

2. **闭包**：闭包可以保持对外部函数作用域中变量的引用，如果这些变量是较大的对象或数组，且闭包本身未被及时销毁，那么这些变量所占用的内存也无法被释放。

3. **DOM引用**：在JavaScript中，如果DOM元素被JavaScript变量引用，即使这些DOM元素已经从页面上移除了，它们所占用的内存也不会被释放，因为JavaScript仍然保持着对这些元素的引用。

4. **定时器**：如`setTimeout`或`setInterval`创建的定时器，如果定时器中的回调函数引用了外部变量，而这些变量又包含了大量数据或DOM元素，那么在定时器未被清除之前，这些资源都无法被释放。

5. **第三方库**：使用的第三方库可能存在内存泄漏的问题，特别是当这些库管理大量资源（如DOM元素、数据等）时。

6. **内存泄漏的连锁反应**：一个小的内存泄漏可能会引发连锁反应，导致更多的内存泄漏，最终严重影响程序的性能和稳定性。

#### 考察要点

1. **内存管理知识**：考察面试者对JavaScript内存管理机制的理解，包括垃圾回收机制、作用域链等。

2. **编程习惯**：通过询问内存泄漏的原因，考察面试者的编程习惯和代码质量意识。

3. **问题解决能力**：面试者是否能够识别和解决潜在的内存泄漏问题，以及是否有有效的策略来预防内存泄漏。

<details>
<summary>参考答案</summary>

内存泄露的解释：程序中己动态分配的堆内存由于某种原因未释放或无法释放。

* 根据JS的垃圾回收机制，当内存中引用的次数为0的时候内存才会被回收
* 全局执行上下文中的对象被标记为不再使用才会被释放

## 内存泄露的几种场景

* 全局变量过多。**通常是变量未被定义或者胡乱引用了全局变量**
```js
// main.js
// 场景1
function a(){
    b=10;
}
a();
b++;

// 场景2
setTimeout(()=>{
    console.log(b)
},1000)
```

* 闭包。 未手动解决必包遗留的内存引用。**定义了闭包就要消除闭包带来的副作用**。

```js

function closuer (){
    const b = 0;
    return (c)=> b + c
}

const render = closuer();

render();
render = null; // 手动设置为null，GC会自己去清除
```

* 事件监听未被移除
```js

function addEvent (){
 const node =  document.getElementById('warp');
    node.addEventListener('touchmove',()=>{
        console.log('In Move');
    })
}

const onTouchEnd = (){
   const node =  document.getElementById('warp');
   node.
}

useEffect(()=>()=>{
     const node =  document.getElementById('warp');
     node.removeEventListener('touchmove');
}) // 类似react 生命周期函数： componentWillUnmount
render(<div id='warp' onTouchEnd={onTouchEnd}>
 // code...
</div>)
```

* 缓存。建议所有缓存都设置好过期时间。

</details>

## 44. css加载会造成阻塞吗？ {#question-fda596ab-16db-41ab-9e81-5a567a373d42}

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

## 45. 如何用webpack来优化前端性能 {#question-9211a856-9131-4bb9-b7a3-e876bb528ee7}

> 难度：1.5 · 类型：QA

### 题目要点

<p><strong>答题思路</strong>：阐述使用Webpack优化前端性能的方法，并简要说明每个方法的作用。</p><p></p><p>1. 使用最新版本的Webpack，以利用其性能优化特性。</p><p>2. 减少Loader的使用，尽量减少处理步骤。</p><p>3. 利用Webpack的缓存功能，如使用cache-loader或HardSourceWebpackPlugin。</p><p>4. 使用externals功能，将第三方库排除在bundle之外，减少构建时间。</p><p>5. 分割代码，使用SplitChunksPlugin进行代码分割，减少单文件大小。</p><p>6. 压缩代码，使用TerserPlugin等插件进行压缩。</p><p>7. 利用tree-shaking去除无用代码。</p><p>8. 使用动态导入（如import()）实现懒加载，按需加载资源。</p><p>9. 设置合理的resolve.extensions和resolve.alias，减少解析时间。</p><p>10. 使用Webpack Bundle Analyzer分析打包结果，进一步优化。</p><p></p><p><strong>考察要点</strong>：对Webpack优化策略的掌握程度。</p><p></p><p></p><p></p>

<details>
<summary>参考答案</summary>

<p>用webpack优化前端性能是指优化webpack的输出结果，让打包的最终结果在浏览器运行快速高效。<br/> </p><ul><li>压缩代码:删除多余的代码、注释、简化代码的写法等等方式。可以利用webpack的<code>UglifyJsPlugin</code>和<code>ParallelUglifyPlugin</code>来压缩JS文件， 利用<code>cssnano</code>（css-loader?minimize）来压缩css</li><li> </li><li>利用CDN加速: 在构建过程中，将引用的静态资源路径修改为CDN上对应的路径。可以利用webpack对于<code>output</code>参数和各loader的<code>publicPath</code>参数来修改资源路径</li><li>Tree Shaking: 将代码中永远不会走到的片段删除掉。可以通过在启动webpack时追加参数<code>--optimize-minimize</code>来实现</li><li>Code Splitting: 将代码按路由维度或者组件分块(chunk),这样做到按需加载,同时可以充分利用浏览器缓存</li><li>提取公共第三方库:  SplitChunksPlugin插件来进行公共模块抽取,利用浏览器缓存可以长期缓存这些无需频繁变动的公共代码</li></ul><p></p>

</details>

## 46. 说说常规的前端性能优化手段 {#question-549f8d07-a907-4c86-93c1-d3e8fef30613}

> 难度：3 · 类型：QA

### 题目要点

<p><strong>答题思路</strong>：列举常规的前端性能优化手段，并简要说明每项手段的目的。</p><p></p><p>1. 资源压缩：减小HTML、CSS、JavaScript文件体积。</p><p>2. 图片优化：压缩图片大小，使用适当的图片格式。</p><p>3. 利用浏览器缓存：通过设置缓存策略，减少重复资源加载。</p><p>4. CSS Sprites：合并多个图片，减少HTTP请求。</p><p>5. 延迟加载：对非关键资源使用懒加载，减少初始加载时间。</p><p>6. 异步脚本：使用async或defer属性异步加载JavaScript。</p><p>7. 减少HTTP请求：合并文件，减少请求次数。</p><p>8. 代码分割：将代码分割成多个小块，按需加载。</p><p>9. 使用CDN：加速静态资源的加载速度。</p><p>10. 网络优化：使用HTTP/2，减少传输延迟。</p><p></p><p><strong>考察要点</strong>：对前端性能优化方法的了解和应用能力。</p><p></p><p></p><p></p>

<details>
<summary>参考答案</summary>

<ul><li>content方面<br/></li><ul><li>减少HTTP请求：合并文件、CSS精灵、inline Image</li><li>减少DNS查询：DNS查询完成之前浏览器不能从这个主机下载任何任何文件。方法：DNS缓存、将资源分布到恰当数量的主机名，平衡并行下载和DNS查询</li><li>避免重定向：多余的中间访问</li><li>使Ajax可缓存</li><li>非必须组件延迟加载</li><li>未来所需组件预加载</li><li>减少DOM元素数量</li><li>将资源放到不同的域下：浏览器同时从一个域下载资源的数目有限，增加域可以提高并行下载量</li><li>减少iframe数量</li><li>不要404</li></ul></ul><p></p><ul><li>Server方面<br/></li><ul><li>使用CDN</li><li>添加Expires或者Cache-Control响应头</li><li>对组件使用Gzip压缩</li><li>配置ETag</li><li>Flush Buffer Early</li><li>Ajax使用GET进行请求</li><li>避免空src的img标签</li></ul></ul><p></p><ul><li>Cookie方面<br/></li><ul><li>减小cookie大小</li><li>引入资源的域名不要包含cookie</li></ul></ul><p></p><ul><li>css方面<br/></li><ul><li>将样式表放到页面顶部</li><li>不使用CSS表达式</li><li>不使用IE的Filter</li></ul></ul><p></p><ul><li>Javascript方面<br/></li><ul><li>将脚本放到页面底部</li><li>将javascript和css从外部引入</li><li>压缩javascript和css</li><li>删除不需要的脚本</li><li>减少DOM访问</li><li>合理设计事件监听器</li></ul></ul><p></p><ul><li>图片方面<br/></li><ul><li>优化图片：根据实际颜色需要选择色深、压缩</li><li>优化css精灵</li><li>不要在HTML中拉伸图片</li><li>保证favicon.ico小并且可缓存</li></ul></ul><p></p><p></p>

</details>

## 47. 在 React 中可以做哪些性能优化？ {#question-060a3711-75a5-4bb3-bb18-9e6e358da4bf}

> 难度：2.5 · 类型：QA

### 题目要点

**答题思路**：

1. 使用`React.memo`或`PureComponent`减少不必要的渲染。
2. 利用`useCallback`和`useMemo`缓存函数和计算结果。
3. 合理使用`shouldComponentUpdate`生命周期方法。
4. 使用懒加载（`React.lazy`和`Suspense`）按需加载组件。
5. 优化渲染列表，使用`key`属性帮助React识别列表项。
6. 避免在渲染方法中创建新的对象或函数。
7. 使用`useReducer`代替在复杂组件中的多个`useState`调用。
8. 减少组件层级，避免不必要的嵌套。
9. 使用Web Workers处理复杂计算，避免阻塞主线程。
10. 使用`React.Fragment`避免额外的DOM层级。

**考察要点**：对React性能优化策略的理解和应用。

<details>
<summary>参考答案</summary>

* 使用 shouldComponentUpdate 避免不需要的渲染，但是如果对 props 和 state 做深比较，代价很大，所以需要根据业务进行些取舍；在有子组件的情况下，为了避免子组件的重复渲染，可以通过父组件来判断子组件是否需要 PureRender。

* 将 props 设置为数组或对象：每次调用 React 组件都会创建新组件，就算传入的数组或对象的值没有改变，他们的引用地址也会发生改变，比如，如果按照如下的写法，那么每次渲染时 style 都是一个新对象

```react.js
// 不推荐
<button style={{ color: 'red' }} />

// 推荐
const style = { color: 'red' }
<button style={style} />

// 不推荐
<button style={this.props.style || {} } />

// 推荐
const defaultStyle = {}
<button style={this.props.style || defaultStyle } />
```

* 将函数的绑定移动到构造函数内：可以避免每次都绑定事件。
* 使用 immutable 不可变数据，在我们项目中使用引用类型时，为了避免对原始数据的影响，一般建议使用 shallowCopy 和 deepCopy 对数据进行处理，但是这样会造成 CPU 和 内存的浪费，所以推荐使用 immutable，优点如下
    * 降低了“可变”带来的复杂度
    * 节省内存，immutable 使用结构共享尽量复用内存，没有被引用的对象会被垃圾回收
    * 可以更好的做撤销/重做，复制/粘贴，时间旅行
    * 不会有并发问题（因为数据本身就是不可变的）
    * 拥抱函数式编程
* 给子组件设置一个唯一的 key，因为在 diff 算法中，会用 key 作为唯一标识优化渲染

</details>

## 48. 什么是CSS Sprites？ {#question-52e2ccda-70e2-438b-8328-ef25f78afb6a}

> 难度：1 · 类型：QA

### 题目要点

将一个页面涉及到的所有图片都包含到一张大图中去，然后利用CSS的 `background-image`，`background-repeat`，`background-position` 的组合进行背景定位。 利用`CSS Sprites`能很好地减少网页的http请求，从而大大的提高页面的性能。

<details>
<summary>参考答案</summary>

将一个页面涉及到的所有图片都包含到一张大图中去，然后利用CSS的 `background-image`，`background-repeat`，`background-position` 的组合进行背景定位。
利用`CSS Sprites`能很好地减少网页的http请求，从而大大的提高页面的性能。

</details>

## 49. CSS优化、提高性能的方法有哪些？ {#question-180f752e-370b-447e-b755-6d004f8f0db0}

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

## 50. script 标签中， async 和 defer 两个属性有什么用途和区别？ {#question-2acd6447-af1d-4430-837f-a468b6c76ffe}

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

## 51. SPA（单页应用）首屏加载速度慢怎么解决？ {#question-a5032eb9-6a53-4792-852f-3f9417631c47}

> 难度：2 · 类型：QA

### 题目要点

**回答思路：**

针对SPA（单页应用）首屏加载速度慢的问题，可以通过以下几种方式来解决：

#### 1. 代码优化

* **合并与压缩文件**：使用Webpack等工具合并和压缩JavaScript和CSS文件，减少文件大小，提高加载速度。
* **代码分割**：利用Webpack的Code Splitting功能，将应用程序代码拆分为多个较小的文件，并在需要时动态加载，减少首屏加载所需的时间。
* **懒加载**：对于非首屏必需的组件或资源，采用懒加载技术，只在需要时加载，减少初始加载内容。

#### 2. 图片优化

* **压缩图片**：对SPA中的图片进行压缩处理，减小图片大小，从而提升首屏加载速度。
* **使用高效图片格式**：如WebP，它比传统的JPEG、PNG等格式具有更高的压缩率和更好的性能。

#### 3. 服务器优化

* **缓存技术**：使用缓存技术减少网络请求的数量和时间，例如对常用数据进行缓存，避免每次都重新请求。
* **CDN加速**：将一些静态资源（如图片、CSS、JS等）放在CDN上，利用CDN的分布式网络缩短资源加载时间。
* **优化服务器响应时间**：通过优化数据库查询、使用更快的服务器硬件等方式，提高服务器响应速度。

#### 4. 路由优化

* **路由懒加载**：将SPA中不同路由对应的代码进行分割，实现路由懒加载，这样用户切换路由时只加载当前路由所需的代码。

#### 5. 使用服务端渲染（SSR）

* SSR可以在服务器端生成HTML页面，减少客户端的渲染时间和数据请求时间，从而提高首屏加载速度。但需要注意的是，SSR需要服务器端的支持，开发成本相对较高。

#### 6. 其他优化措施

* **骨架屏**：在页面加载过程中，先显示一个骨架屏，让用户感觉到页面正在加载，避免白屏问题，提高用户体验。
* **优化JavaScript执行**：确保JavaScript代码尽可能地高效，避免不必要的计算和循环，优化算法和数据结构。

<details>
<summary>参考答案</summary>

## 一、什么是首屏加载

首屏时间（First Contentful Paint），指的是浏览器从响应用户输入网址地址，到首屏内容渲染完成的时间，此时整个网页不一定要全部渲染完成，但需要展示当前视窗需要的内容

首屏加载可以说是用户体验中**最重要**的环节

### 关于计算首屏时间
利用`performance.timing`提供的数据：

 ![image.png](https://static.ecool.fun//article/106a98b9-b2dd-402f-943a-810cdc7e8879.png)

通过`DOMContentLoad`或者`performance`来计算出首屏时间

```js
// 方案一：
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('first contentful painting');
});
// 方案二：
performance.getEntriesByName("first-contentful-paint")[0].startTime

// performance.getEntriesByName("first-contentful-paint")[0]
// 会返回一个 PerformancePaintTiming的实例，结构如下：
{
  name: "first-contentful-paint",
  entryType: "paint",
  startTime: 507.80000002123415,
  duration: 0,
};
```

## 二、加载慢的原因

在页面渲染的过程，导致加载速度慢的因素可能如下：

- 网络延时问题
- 资源文件体积是否过大
- 资源是否重复发送请求去加载了
- 加载脚本的时候，渲染内容堵塞了

## 三、解决方案

常见的几种SPA首屏优化方式

- 减小入口文件积
- 静态资源本地缓存
- UI框架按需加载
- 图片资源的压缩
- 组件重复打包
- 开启GZip压缩
- 使用SSR

### 减小入口文件体积

常用的手段是路由懒加载，把不同路由对应的组件分割成不同的代码块，待路由被请求的时候会单独打包路由，使得入口文件变小，加载速度大大增加

 ![image.png](https://static.ecool.fun//article/0145e724-3487-43df-b7da-1120b9a78120.png)

在`vue-router`配置路由的时候，采用动态加载路由的形式

```js
routes:[
    path: 'Blogs',
    name: 'ShowBlogs',
    component: () => import('./components/ShowBlogs.vue')
]
```

以函数的形式加载路由，这样就可以把各自的路由文件分别打包，只有在解析给定的路由时，才会加载路由组件

### 静态资源本地缓存

后端返回资源问题：

- 采用`HTTP`缓存，设置`Cache-Control`，`Last-Modified`，`Etag`等响应头

- 采用`Service Worker`离线缓存

前端合理利用`localStorage`

### UI框架按需加载

在日常使用`UI`框架，例如`element-UI`、或者`antd`，我们通常会直接引用整个`UI`库

```js
import ElementUI from 'element-ui'
Vue.use(ElementUI)
```

但实际上我用到的组件只有按钮，分页，表格，输入与警告 所以我们要按需引用

```js
import { Button, Input, Pagination, Table, TableColumn, MessageBox } from 'element-ui';
Vue.use(Button)
Vue.use(Input)
Vue.use(Pagination)
```

### 组件重复打包

假设`A.js`文件是一个常用的库，现在有多个路由使用了`A.js`文件，这就造成了重复下载

解决方案：在`webpack`的`config`文件中，修改`CommonsChunkPlugin`的配置

```js
minChunks: 3
```

`minChunks`为3表示会把使用3次及以上的包抽离出来，放进公共依赖文件，避免了重复加载组件

### 图片资源的压缩

图片资源虽然不在编码过程中，但它却是对页面性能影响最大的因素

对于所有的图片资源，我们可以进行适当的压缩

对页面上使用到的`icon`，可以使用在线字体图标，或者雪碧图，将众多小图标合并到同一张图上，用以减轻`http`请求压力。

### 开启GZip压缩

拆完包之后，我们再用`gzip`做一下压缩 安装`compression-webpack-plugin`

```js
cnmp i compression-webpack-plugin -D
```

在`vue.congig.js`中引入并修改`webpack`配置

```js
const CompressionPlugin = require('compression-webpack-plugin')

configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            config.mode = 'production'
            return {
                plugins: [new CompressionPlugin({
                    test: /\.js$|\.html$|\.css/, //匹配文件名
                    threshold: 10240, //对超过10k的数据进行压缩
                    deleteOriginalAssets: false //是否删除原文件
                })]
            }
        }
```

在服务器我们也要做相应的配置 如果发送请求的浏览器支持`gzip`，就发送给它`gzip`格式的文件 我的服务器是用`express`框架搭建的 只要安装一下`compression`就能使用

```
const compression = require('compression')
app.use(compression())  // 在其他中间件使用之前调用
```

### 使用SSR

SSR（Server side ），也就是服务端渲染，组件或页面通过服务器生成html字符串，再发送到浏览器

从头搭建一个服务端渲染是很复杂的，`vue`应用建议使用`Nuxt.js`实现服务端渲染

### 小结：

减少首屏渲染时间的方法有很多，总的来讲可以分成两大部分 ：资源加载优化 和 页面渲染优化

下图是更为全面的首屏优化的方案

 ![image.png](https://static.ecool.fun//article/b15bf9a4-d026-4942-8957-fcc52d74b3da.png)

大家可以根据自己项目的情况选择各种方式进行首屏渲染的优化

</details>

## 52. 如果使用CSS提高页面性能？ {#question-6f841b28-be0d-413f-9b7a-70e740fa7621}

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
