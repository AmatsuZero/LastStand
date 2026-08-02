+++
title = "百度-搜索-春招 · 第 1 轮 · 技术面试"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/81"
experienceId = 81
roundId = 130
roundOrder = 1
company = "百度"
date = "2026-01-31T09:19:33.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-81/_index.md" >}}) · 已是最后一轮 →

**本轮概述：** 该轮主要考察前端开发相关知识，包括动画实现、性能优化、React优化、Web Accessibility、计时器处理、WebSocket、缓存策略、国际化、兼容性问题等。题目以主观题为主，注重对核心原理和实际应用场景的理解。

本轮共 18 道题。答案默认折叠，便于先自行作答。

## 1. 实现一个动画，当用户鼠标悬停在按钮上时，按钮逐渐变大 {#question-subjective-c97dc39dce4b}

### 题目要点

CSS transition, 动画性能优化, 硬件加速, 事件监听

<details>
<summary>参考答案</summary>

在实现此类动画时，可以使用CSS的transition属性或JavaScript的requestAnimationFrame方法。重点在于控制动画的流畅性和性能。可以通过设置合适的过渡时间（transition-duration）和使用硬件加速（如transform: scale()）来提升性能。此外，注意避免不必要的重排和重绘，确保动画的平滑性。

</details>

## 2. 如何避免动画过程中的卡顿？ {#question-5adab921-8dfb-4a65-9f44-38ae8a70820f}

> 题库原题：[在解决动画卡顿问题时，会引导硬件加速，那么硬件加速的原理是什么？](https://fe.ecool.fun/topic/5adab921-8dfb-4a65-9f44-38ae8a70820f)

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

## 3. 虚拟列表技术的核心原理是什么？ {#question-875d7fc5-bc05-44e7-a017-60849c426ec9}

> 题库原题：[怎么实现虚拟列表？](https://fe.ecool.fun/topic/875d7fc5-bc05-44e7-a017-60849c426ec9)

### 题目要点

### 虚拟列表实现步骤

1. **计算可见区域**：确定用户视窗内能看到的列表项数量和它们的位置。

2. **渲染可见区域**：只对计算出的可见列表项进行渲染。
3. **动态调整列表高度**：调整列表容器的高度，确保滚动条的正确显示和用户的滚动体验。
4. **延迟加载非可见区域**：根据用户的滚动行为动态加载即将进入视窗的列表项。

### 性能优化技术

- **虚拟 DOM**：通过减少直接操作真实 DOM 的次数来提升性能。

- **懒加载**：延迟加载不在视窗内的内容，减少资源消耗。
- **缓存**：复用已渲染的列表项，避免重复渲染。
- **预测算法**：基于用户的滚动行为预测并预先加载可能访问的内容。

<details>
<summary>参考答案</summary>

虚拟列表是一种优化长列表渲染性能的技术，它只渲染可见区域内的部分内容，从而大幅降低了页面渲染的复杂度。

具体而言，实现虚拟列表需要以下步骤：

*  计算可见区域：首先需要计算出当前可见区域内的列表项数量和位置。

* 渲染可见区域：只渲染当前可见区域内的列表项，而不是整个列表。

* 动态调整列表高度：由于只渲染了部分列表项，因此需要动态调整列表容器的高度，以确保滚动条可以正确地显示并且用户可以滚动整个列表。

* 延迟加载非可见区域：当用户滚动列表时，需要根据当前滚动位置动态加载非可见区域的列表项，以便在用户滚动到该区域时能够及时显示。

在实现虚拟列表的过程中，还可以使用一些技术来优化渲染性能，包括：

* 虚拟 DOM：使用虚拟 DOM 技术可以减少每次重新渲染时需要操作真实 DOM 的次数，从而提高渲染性能。

* 懒加载：懒加载可以延迟加载非可见区域的列表项，从而减少不必要的网络请求和资源占用。

* 缓存：缓存可以在滚动时快速复用已经渲染的列表项，从而减少重新渲染的次数。

* 预测算法：使用预测算法可以根据当前滚动位置和滚动速度来预测用户可能查看的区域，并提前加载该区域的列表项，以提高用户体验。

总之，实现虚拟列表需要计算可见区域、渲染可见区域、动态调整列表高度和延迟加载非可见区域等步骤，并且需要使用一些技术来优化渲染性能。虚拟列表可以大幅提高长列表的渲染性能，并提高用户体验。

</details>

## 4. 如何优化滚动过程中的内存占用？ {#question-subjective-753223cef487}

### 题目要点

虚拟列表, 资源回收, 事件节流, 内存管理

<details>
<summary>参考答案</summary>

优化滚动过程中内存占用的关键在于及时释放不再需要的资源。例如，在滚动过程中，可以使用虚拟列表技术仅渲染可见项，同时对不可见项进行卸载或回收。还可以结合节流或防抖技术减少频繁的事件触发。

</details>

## 5. 在React中，如何优化组件以避免不必要的重新渲染？ {#question-060a3711-75a5-4bb3-bb18-9e6e358da4bf}

> 题库原题：[在 React 中可以做哪些性能优化？](https://fe.ecool.fun/topic/060a3711-75a5-4bb3-bb18-9e6e358da4bf)

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

## 6. useMemo和useCallback的具体适用场景 {#question-f10c4b00-cceb-4323-97dc-55b315b05024}

> 题库原题：[我们应该在什么场景下使用  useMemo 和 useCallback ？](https://fe.ecool.fun/topic/f10c4b00-cceb-4323-97dc-55b315b05024)

### 题目要点

useMemo 和 useCallback 是 React Hooks 中常用的性能优化手段,应该在以下场景下使用:

1. 计算密集型操作 - useMemo:
   - 当一个组件中存在一些复杂的计算,并且这些计算的结果会被多次使用时,可以使用 useMemo 缓存计算结果。
   - 这样可以避免每次渲染时都重复执行这些昂贵的计算操作,提高组件的性能。

2. 依赖项变化时重新创建 - useCallback:

    - 当一个组件需要传递函数给子组件时,如果该函数依赖于组件的 props 或 state,那么可以使用 useCallback 缓存该函数。

    - 这样可以确保只有当依赖项发生变化时,函数才会被重新创建,避免不必要的重新渲染。

3. memo 和 shouldComponentUpdate 配合使用 - useMemo 和 useCallback:

    - 将 useMemo 和 useCallback 与 React.memo 或shouldComponentUpdate 结合使用,可以进一步优化组件的性能。

    - 例如,对于子组件,可以使用 React.memo 进行shallow comparison比较,再配合 useMemo 和 useCallback 优化父组件。

4. 大量重复的渲染 - useMemo:

    - 当一个组件会进行大量的重复渲染时,可以使用 useMemo 缓存一些中间计算结果,减轻 CPU 负担。

    - 这样可以显著提高组件的整体性能。

总的来说,useMemo 适用于缓存昂贵的计算,useCallback 适用于缓存依赖项变化时重新创建的函数。合理使用这两个 Hooks 可以有效地优化 React 应用的性能。

<details>
<summary>参考答案</summary>

## 前言

useMemo 和 useCallback 是 React 的内置 Hook，通常作为优化性能的手段被使用。他们可以用来缓存函数、组件、变量，以避免两次渲染间的重复计算。但是实践过程中，他们经常被过度使用：担心性能的开发者给每个组件、函数、变量、计算过程都套上了 memo，以至于它们在代码里好像失控了一样，无处不在。

本文希望通过分析 useMemo/useCallback 的目的、方式、成本，以及具体使用场景，帮助开发者正确的决定如何适时的使用他们。赶时间的读者可以直接拉到底部看结论。

我们先从 useMemo/useCallback 的目的说起。

## 为什么使用 useMemo 和 useCallback

使用 memo 通常有三个原因：

1. ✅ 防止不必要的 effect。
2. ❗️防止不必要的 re-render。
3. ❗️防止不必要的重复计算。

后两种优化往往被误用，导致出现大量的无效优化或冗余优化。下面详细介绍这三个优化方式。

### 防止不必要的 effect

如果一个值被 useEffect 依赖，那它可能需要被缓存，这样可以避免重复执行 effect。

```js
const Component = () => {
  // 在 re-renders 之间缓存 a 的引用
  const a = useMemo(() => ({ test: 1 }), []);

  useEffect(() => {
    // 只有当 a 的值变化时，这里才会被触发
    doSomething();
  }, [a]);

  // the rest of the code
};
```

useCallback 同理：

```js
const Component = () => {
  // 在 re-renders 之间缓存 fetch 函数
  const fetch = useCallback(() => {
    console.log('fetch some data here');
  }, []);

  useEffect(() => {
    // 仅fetch函数的值被改变时，这里才会被触发
    fetch();
  }, [fetch]);

  // the rest of the code

};
```

当变量直接或者通过依赖链成为 useEffect 的依赖项时，那它可能需要被缓存。这是 useMemo 和 useCallback 最基本的用法。

### 防止不必要的 re-render

进入重点环节了🔔。正确的阻止 re-render 需要我们明确三个问题：

1. 组件什么时候会 re-render。
2. 如何防止子组件 re-render。
3. 如何判断子组件需要缓存。

#### 1\. 组件什么时候会 re-render

三种情况：

1. 当本身的 props 或 state 改变时。
2. Context value 改变时，使用该值的组件会 re-render。
3. 当父组件重新渲染时，它所有的子组件都会 re-render，形成一条 re-render 链。

第三个 re-render 时机经常被开发者忽视，**导致代码中存在大量的无效缓存**。

例如：

```js
const App = () => {
  const [state, setState] = useState(1);

  const onClick = useCallback(() => {
    console.log('Do something on click');
  }, []);

  return (
    // 无论 onClick 是否被缓存，Page 都会 re-render
    <Page onClick={onClick} />
  );
};
```

当使用 setState 改变 state 时，App 会 re-render，作为子组件的 Page 也会跟着 re-render。这里 useCallback 是完全无效的，它并不能阻止 Page 的 re-render。

#### 2\. 如何防止子组件 re-render

**必须同时缓存 onClick 和组件本身，才能实现 Page 不触发 re-render。**

```js
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);

  const onClick = useCallback(() => {
    console.log('Do something on click');
  }, []);

  return (
    // Page 和 onClick 同时 memorize
    <PageMemoized onClick={onClick} />
  );
};
```

由于使用了React.memo，PageMemoized 会浅比较 props 的变化后再决定是否 re-render。onClick 被缓存后不会再变化，所以 PageMemoized 不再 re-render。

然而，如果 PageMemoized 再添加一个未被缓存的 props，一切就前功尽弃 🤯 ：

```js
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);

  const onClick = useCallback(() => {
    console.log('Do something on click');
  }, []);

  return (
    // page WILL re-render because value is not memoized
    <PageMemoized onClick={onClick} value={[1, 2, 3]} />
  );
};
```

由于 value 会随着 App 的 re-render 重新定义，引用值发生变化，导致 PageMemoized 仍然会触发 re-render。

现在可以得出结论了，必须同时满足以下两个条件，子组件才不会 re-render：

1. 子组件自身被缓存。
2. 子组件所有的 prop 都被缓存。

#### 3\. 如何判断子组件需要缓存

我们已经了解，为了防止子组件 re-render，需要以下成本：

1. **开发者工作量的增加**： 一旦使用缓存，就必须保证组件本身以及所有 props 都缓存，后续添加的所有 props 都要缓存。
2. **代码复杂度和可读性的变化**：代码中出现大量缓存函数，这会增加代码复杂度，并降低易读性。

除此之外还有另外一个成本：**性能成本**。 组件的缓存是在初始化时进行，虽然每个组件缓存的性能耗费很低，通常不足1ms，但大型程序里成百上千的组件如果同时初始化缓存，成本可能会变得很可观。

所以局部使用 memo，比全局使用显的更优雅、性能更好，坏处是需要开发者主动去判断是否需要缓存该子组件。

🤨 那应该什么时候缓存组件，怎么判断一个组件的渲染是昂贵的？

很遗憾，似乎没有一个简单&无侵入&自动的衡量方式。通常来说有两个方式：

1. 人肉判断，开发或者测试人员在研发过程中感知到渲染性能问题，并进行判断。
2. 通过工具，目前有一些工具协助开发者在查看组件性能:<br>
   1. 如 [React Dev Tools Profiler](https://zh-hans.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)，[这篇文章](https://medium.com/@ashr81/react-performance-code-changes-part-i-fc8f2fddb37)介绍了使用方式<br>
   2. 如这个 hooks：[useRenderTimes](https://ecomfe.github.io/react-hooks/#/hook/debug/use-render-times)

另外，React 在 16.5版本后提供了 [Profiler API](https://reactjs.org/docs/profiler.html)：_它可以识别出应用中渲染较慢的部分，或是可以使用类似 memoization 优化的部分_。所以可以通过 puppeteer 或 cypress 在自动化集成中测试组件性能，这很适合核心组件的性能测试。

### 防止不必要的重复计算

如 [React 文档](https://zh-hans.reactjs.org/docs/hooks-reference.html#usememo)所说，useMemo 的基本作用是，避免在每次渲染时都进行高开销的计算。

🤨 那什么是“高开销的计算”？

高开销的计算其实极少出现，如下示例，对包含 250 个 item 的数组 countries 进行排序、渲染，并计算耗时。

```js
const List = ({ countries }) => {
  const before = performance.now();
  const sortedCountries = orderBy(countries, 'name', sort);
  // this is the number we're after
  const after = performance.now() - before;

  return (
    // same
  )
};
```

![image](https://static.ecool.fun//article/6f542a99-8ec2-4267-b67a-540fc3e627eb.jpeg)

结果如图所示，排序耗时仅用了 4 毫秒，而渲染图中的 List 组件（仅仅只是 button + 文字）却用了 20 毫秒，5倍的差距，代码详见 [codesandbox.](https://codesandbox.io/s/measure-without-memo-tnhggk?file=/src/page.tsx)。 大部分情况下，我们的计算量要比这个 250 个 item 的数组少，而组件渲染要比这个 List 组件复杂的多，所以真实程序中，计算和渲染的性能差距会更大。

可见，组件渲染才是性能的瓶颈，应该把 useMemo 用在程序里渲染昂贵的组件上，而不是数值计算上。当然，除非这个计算真的很昂贵，比如阶乘计算。

至于为什么不给所有的组件都使用 useMemo，上文已经解释了。useMemo 是有成本的，它会增加整体程序初始化的耗时，并不适合全局全面使用，它更适合做局部的优化。

## 为什么 React 没有把缓存组件作为默认配置？

关于这点 Dan Abramov 在[推文](https://twitter.com/dan_abramov/status/1083897065263034368)上也给出了解释（虽然是个类比 😅）：![image](https://static.ecool.fun//article/f5fb8d3c-b958-47ca-8ef4-92ece2e90570.jpeg)

评论区里 react 的另一位核心开发者 Christopher Chedeau 也参与了[讨论](https://twitter.com/Vjeux/status/1083902075946205189)。 简而言之，他们认为：

1. 缓存是有成本的，小的成本可能会累加过高。
2. 默认缓存无法保证足够的正确性。

> 原因 2 的原文：correctness is not guaranteed for everything because people can mutate things. Christopher Chedeau 未给出进一步解释。或许他是指可能会导致跟 [PureComponent相同的问题](https://reactjs.org/docs/optimizing-performance.html#examples)，即浅比较 mutate things 时，由于浅比较相等，导致组件未能 update 的问题。

## 结论

讲到这里我们可以总结出 useMemo/useCallback 使用准则了：

1. **大部分的 useMemo 和 useCallback 都应该移除**，他们可能没有带来任何性能上的优化，反而增加了程序首次渲染的负担，并增加程序的复杂性。
2. 使用 useMemo 和 useCallback 优化子组件 re-render 时，**必须同时满足以下条件才有效**。<br>
   1. 子组件已通过 React.memo 或 useMemo 被缓存<br>
   2. 子组件所有的 prop 都被缓存
3. **不推荐默认给所有组件都使用缓存**，大量组件初始化时被缓存，可能导致过多的内存消耗，并影响程序初始化渲染的速度。

> 关于第三点有相反观点，详见：[Why We Memo All the Things](https://attardi.org/why-we-memo-all-the-things/?utm_source=ttalk.im&utm_medium=website&utm_campaign=Tech%2520Talk)，作者推荐默认给全部组件都加上 React.memo，并给所有 props 都套上 useMemo。他认为这样可以降低工程师心智负担，让工程师不必再自己判断什么时候使用 memorize。

</details>

## 7. 如果你有一个含有数百个项目的数组，你将如何有效地搜索特定项目？ {#question-subjective-17b2d90feff6}

### 题目要点

二分查找, 索引构建, Map结构, 分页处理

<details>
<summary>参考答案</summary>

对于包含数百个项目的数组，如果数据量较大且需要频繁查询，建议使用二分查找算法（前提是数组有序）。若数据无序，可考虑构建索引或使用Map结构进行快速查找。此外，可以结合分页或懒加载机制减少一次性加载的数据量。

</details>

## 8. 讲一下Web Accessibility {#question-subjective-5c57663a1d9d}

### 题目要点

语义化HTML, ARIA标签, 键盘导航, 可访问性设计

<details>
<summary>参考答案</summary>

Web Accessibility旨在确保所有用户都能无障碍地访问网页内容，包括残障人士。可以通过语义化HTML、ARIA标签、键盘导航、颜色对比度优化等方式实现。此外，提供替代文本和可访问的表单控件也是重要部分。

</details>

## 9. 创建一个倒计时计时器，显示天、小时、分钟和秒 {#question-subjective-f72bd001d049}

### 题目要点

时间计算, 定时器更新, 格式化输出, 时间结束处理

<details>
<summary>参考答案</summary>

实现倒计时计时器需要计算剩余时间并定期更新界面。可以使用setInterval或requestAnimationFrame来驱动计时器。需要注意的是，应将时间转换为天、小时、分钟和秒的格式，并在时间结束时进行处理。

</details>

## 10. 如何处理页面隐藏时计时器的暂停与恢复？如何避免setInterval的时间误差？ {#question-subjective-5ef060cd5ce2}

### 题目要点

页面可见性API, 计时器暂停与恢复, 时间误差处理, 精确计时

<details>
<summary>参考答案</summary>

页面隐藏时，可通过监听页面的visibilitychange事件来暂停计时器，恢复时再重新启动。为避免setInterval的时间误差，可以使用requestAnimationFrame或结合时间戳进行精确控制。此外，使用时间差计算代替固定间隔也可以提高准确性。

</details>

## 11. 推荐栏的内容需要实时更新，你的思路是什么？ {#question-subjective-7817719e3354}

### 题目要点

WebSocket/SSE, 数据推送, UI更新, 缓存策略

<details>
<summary>参考答案</summary>

实时更新推荐栏内容通常涉及后端推送机制，如WebSocket或SSE。前端需监听数据变化并及时更新UI。同时，可以采用缓存策略减少请求频率，并结合节流或防抖技术优化性能。

</details>

## 12. WebSocket讲一下 {#question-013a77b6-e97b-4271-9e1b-9d632783979d}

> 题库原题：[介绍下WebSocket](https://fe.ecool.fun/topic/013a77b6-e97b-4271-9e1b-9d632783979d)

### 题目要点

<p></p><p>WebSocket是一种HTML5提供的网络技术，它允许浏览器和服务器之间进行全双工通信，即可以同时进行双向数据传输。WebSocket基于TCP传输协议，并且使用HTTP的握手通道来建立连接。一旦握手完成，客户端和服务器之间就可以直接通信，无需再次建立连接。</p><p>WebSocket的特点包括：</p><ul><li><strong>双向通信</strong>：客户端和服务器可以相互发送消息，增强了实时性。</li><li><strong>支持多种数据格式</strong>：可以发送文本数据和二进制数据。</li><li><strong>简单易实现</strong>：建立在TCP协议之上，服务端的实现相对简单。</li><li><strong>高效性能</strong>：数据格式轻量，通信高效，性能开销小。</li><li><strong>无同源限制</strong>：客户端可以与任意服务器通信，不受同源策略的限制。</li><li><strong>协议标识符</strong>：默认使用ws（未加密）和wss（加密）作为协议标识符。</li><li><strong>兼容性</strong>：与HTTP协议兼容，可以通过各种HTTP代理服务器。</li></ul><p>WebSocket的工作原理是客户端通知服务器一个事件，服务器接收到事件后，立即通知所有活跃的客户端。只有接收者ID在事件中指定的客户端才会处理这个事件。这种方式使得WebSocket能够有效地实现事件驱动的通信模式。</p>

<details>
<summary>参考答案</summary>

<h3 data-id="heading-82">1. WebSocket 是什么</h3><p>WebSocket是HTML5提供的一种浏览器与服务器进行<strong>全双工通讯</strong>的网络技术，属于应用层协议。它基于TCP传输协议，并复用HTTP的握手通道。浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接， 并进行双向数据传输。</p><p>WebSocket 的出现就解决了半双工通信的弊端。它最大的特点是：<strong>服务器可以向客户端主动推动消息，客户端也可以主动向服务器推送消息。</strong></p><p><strong>WebSocket原理</strong> ：客户端向 WebSocket 服务器通知（notify）一个带有所有接收者ID（recipients IDs）的事件（event），服务器接收后立即通知所有活跃的（active）客户端，只有ID在接收者ID序列中的客户端才会处理这个事件。</p><p></p><h3 data-id="heading-83">2. WebSocket 特点</h3><ul><li>支持双向通信，实时性更强</li><li>可以发送文本，也可以发送二进制数据‘’</li><li>建立在TCP协议之上，服务端的实现比较容易</li><li>数据格式比较轻量，性能开销小，通信高效</li><li>没有同源限制，客户端可以与任意服务器通信</li><li>协议标识符是ws（如果加密，则为wss），服务器网址就是 URL</li><li>与 HTTP 协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器。</li></ul>

</details>

## 13. 缓存策略实现离线访问？如何通过预加载关键资源加速首屏？ {#question-subjective-1de220412dff}

### 题目要点

Service Worker, 缓存策略, 预加载, 首屏优化

<details>
<summary>参考答案</summary>

实现离线访问可以通过Service Worker缓存资源，结合Cache API进行存储和检索。预加载关键资源可以使用&lt;link rel="preload"&gt;或JavaScript动态加载，提前获取资源以提升首屏性能。

</details>

## 14. 如何在前端项目中实现国际化和本地化 {#question-subjective-eddc82ba1b0e}

### 题目要点

i18n库, 翻译文件, 本地化格式, 多语言支持

<details>
<summary>参考答案</summary>

实现国际化和本地化通常需要使用i18n库（如react-i18next或vue-i18n），根据用户的语言偏好加载对应的翻译文件。同时，需考虑日期、货币、数字等格式的本地化处理。

</details>

## 15. 如何处理动态内容（如用户生成内容）的翻译？如何管理多语言资源文件？ {#question-subjective-3ea762d91453}

### 题目要点

动态内容翻译, 资源文件管理, i18n工具, 多语言支持

<details>
<summary>参考答案</summary>

处理动态内容的翻译需要将内容存储在数据库中，并根据用户语言动态加载对应翻译。多语言资源文件可以通过JSON或YAML格式管理，结合i18n工具进行加载和维护。

</details>

## 16. 遇到过哪些兼容性问题，是如何解决的 {#question-subjective-f37c6db457d6}

### 题目要点

兼容性测试, Polyfill, 特性检测, 渐进增强

<details>
<summary>参考答案</summary>

兼容性问题常见于不同浏览器或设备上的差异，例如CSS属性不支持、JavaScript语法差异等。解决方式包括使用Polyfill、特性检测、渐进增强等策略。

</details>

## 17. 在一个复杂的页面上，用户操作导致多次不必要的DOM操作，你将如何优化它？ {#question-a2e5e3a0-8b27-4961-b21f-05db8a2fed7e}

> 题库原题：[如何优化大规模 dom 操作的场景？](https://fe.ecool.fun/topic/a2e5e3a0-8b27-4961-b21f-05db8a2fed7e)

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

## 18. 当一个请求失败时，你通常如何处理错误？ {#question-subjective-bbc8fc51be26}

### 题目要点

* **全局拦截**：通过状态码建立第一道防御体系。
* **自动重试**：针对非稳定性网络环境提供静默补偿。
* **优雅降级**：利用占位符和本地缓存确保 UI 的完整性。
* **闭环监控**：将线上错误数据化，为性能优化提供依据。
* **用户体验**：分类设计反馈形式，避免生硬的报错打断用户心智。

<details>
<summary>参考答案</summary>

在前端工程中，请求失败的处理不应只是简单的 `alert(error)`，而是一套**分层处理、分类响应**的健壮性方案。通常会从用户感知、逻辑重试、监控上报三个维度来构建异常处理体系。

以下是标准处理路径：

### 1. 拦截器层的统一分类 (Categorization)

利用 `Axios` 等请求库的响应拦截器（Interceptors），根据 HTTP 状态码进行全局预处理：

* **401 (Unauthorized)**：清除本地 Token，重定向至登录页。
* **403 (Forbidden)**：弹出权限不足提示。
* **404 (Not Found)**：跳转至 404 错误页或提示资源不存在。
* **5xx (Server Error)**：提示“服务器繁忙，请稍后再试”。
* **网络断开/超时**：引导用户检查网络连接。

### 2. 自动重试机制 (Retry Logic)

对于由于网络波动或服务器瞬时过载导致的失败，我会引入**指数退避（Exponential Backoff）** 的自动重试策略。

* **实现方式**：在拦截器中判断错误类型。如果是超时或 `503` 错误，则在  秒后发起重试，通常限制在 3 次以内。
* **幂等性注意**：只对 `GET` 等幂等请求进行自动重试，`POST` 等涉及数据修改的请求需由用户手动触发。

### 3. 业务层面的降级策略 (Degradation)

在具体的 UI 组件中，我会根据业务重要程度执行不同的“B 计划”：

* **局部展示占位图**：如果某个侧边栏模块加载失败，隐藏该模块或展示“暂无数据”的 Placeholder，确保主页面不崩溃。
* **本地缓存兜底**：如果实时行情数据请求失败，先展示上次存储在 `LocalStorage` 中的旧数据，并提示“数据更新失败，展示为历史缓存”。
* **操作锁定解除**：确保 `finally` 块中关闭按钮的 `loading` 状态，防止用户因请求失败被永久锁死在加载界面。

### 4. 监控与异常溯源 (Observability)

线上环境的请求失败必须实现“可追溯”。

* **Sentry/内部日志系统**：将失败的 URL、状态码、请求参数（脱敏后）、用户 ID 以及堆栈信息上报。
* **用户侧反馈**：在报错信息中附带一个“错误追踪 ID”，用户截图反馈时，开发人员可以通过该 ID 在日志系统中快速定位具体的请求链路。

### 5. 交互反馈的艺术 (UX)

错误提示应遵循“非侵入性”原则：

* **轻量错误**（如搜索无结果）：使用 `Toast` 或 `Message` 提示。
* **严重错误**（如表单提交失败）：使用 `Dialog` 强提醒。
* **页面级失败**：使用全屏错误状态页，并提供“点击重试”按钮。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-81/_index.md" >}}) · 已是最后一轮 →
