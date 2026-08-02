+++
title = "京东-广告数据-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "京东", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/26"
experienceId = 26
roundId = 29
roundOrder = 1
company = "京东"
date = "2025-06-27T05:46:50.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-26/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 考察核心集中在前端性能优化（如无限加载卡顿、页面渲染延迟）、CSS布局与兼容性（如Flexbox自适应、跨浏览器适配）及Vue框架原理（如响应式限制、虚拟DOM优劣）。需重点准备懒加载/虚拟滚动优化、兼容性Hack技巧、异步执行顺序分析及需求拆分设计能力。

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. 现在我们有一个 618 活动页的需求，需要你来做，你会如何拆分需求，如何设计？ {#question-subjective-1471ea7054ad}

### 题目要点

需求分析与设计能力

<details>
<summary>参考答案</summary>

1. 首先与产品、设计、运营等多部门沟通，明确活动页的核心功能、促销规则、页面风格等基本需求。例如，确定活动主题（如限时秒杀、满减优惠等）、预计流量、商品展示形式等。
2. 根据功能模块拆分需求，可将活动页分为头部导航区（包含活动标题、时间、入口等信息）、商品展示区（如秒杀商品列表、热门推荐商品列表等）、促销信息区（展示活动规则、优惠券领取等）、底部信息区（如活动说明、客服入口等）。
3. 在设计上，根据品牌风格和活动主题确定整体视觉风格，包括配色方案（如节日氛围的红色、金色等）、字体选择、图片风格等。针对商品展示区，考虑采用网格布局或瀑布流布局，以合理展示商品信息，包括商品图片、名称、价格、优惠信息等。对于交互设计，需考虑页面的滚动加载、商品点击跳转、优惠券领取等交互效果，确保用户体验流畅。

</details>

## 2. 商品列表中一行有五个商品卡片，最后一个自适应剩余空间，怎么实现。 {#question-subjective-f2b52b32bd5b}

### 题目要点

CSS 布局能力

<details>
<summary>参考答案</summary>

可以使用 CSS 的 Flexbox 布局来实现。首先将商品列表的容器设置为 flex 布局，即 `display: flex`。然后对前四个商品卡片设置固定宽度，例如 `width: 100px`，最后一个商品卡片设置 `flex: 1`，这样它就会占据所在行剩余的空间，实现自适应效果。同时，为了防止一行中商品卡片因内容过多而超出父容器宽度，可对每个商品卡片设置 `overflow: hidden`，确保其内容在自身区域内显示，并且可以添加 `white - space: nowrap` 和 `text - overflow: ellipsis` 来处理溢出的文字内容。

</details>

## 3. CSS 样式开发中你都遇到过哪些兼容性问题，如何解决的。 {#question-subjective-ebdcefd0ba4c}

### 题目要点

CSS 问题解决能力及兼容性知识

<details>
<summary>参考答案</summary>

1. 在不同浏览器中遇到过盒模型问题，例如 IE 浏览器的怪异盒模型与其他浏览器的标准盒模型不同，导致元素尺寸计算不一致。解决方法是使用 `box - sizing: border - box`，并结合 CSS 重置样式表统一各浏览器的盒模型表现。
    2. 浮动布局在某些低版本浏览器中可能出现父元素高度塌陷或子元素排列不整齐的问题。可以通过为父元素添加 `clearfix` 清除浮动，即设置父元素 `overflow: hidden` 或使用伪元素 `:after` 添加清除浮动的样式来解决。
    3. CSS3 动画在部分浏览器中可能不支持，或者动画效果不一致。例如，IE 浏览器对 CSS3 动画的支持较弱。解决方法是使用渐进增强的方式，在支持 CSS3 动画的浏览器中展示动画效果，对于不支持的浏览器提供简单的过渡效果或静态样式，并利用Modernizr 等工具进行特性检测，根据检测结果加载相应的样式和脚本。
    4. 字体渲染在不同操作系统和浏览器中可能存在差异，影响页面的美观和一致性。可以通过设置字体的 `font - family` 为系统安全字体组合，并使用相对单位（如 `em`、`rem`）设置字体大小，以提高字体的兼容性和可读性。

</details>

## 4. 你刚刚说的上滑无限加载有没有性能问题，你怎么解决？ {#question-subjective-99d5bcff8208}

### 题目要点

前端性能优化知识

<details>
<summary>参考答案</summary>

上滑无限加载可能出现的性能问题包括滚动卡顿、内存泄漏、DOM 操作频繁导致页面渲染缓慢等。当大量数据不断加载到页面时，DOM 元素数量增多，浏览器需要消耗更多资源来渲染和更新这些元素，从而导致滚动不流畅。同时，如果没有正确管理加载的数据和事件监听器，可能会引发内存泄漏。

解决方法如下：

* 使用虚拟滚动技术，只渲染视口附近可见的元素，减少 DOM 元素数量。例如，通过计算滚动位置和元素高度，动态确定需要渲染的数据索引范围，只创建和更新对应范围内的 DOM 元素，从而降低内存占用和渲染压力。
* 对加载的数据进行分页处理，在每次上滑加载时，只请求一定数量的数据，并在数据加载完成后及时清理不再需要的数据和事件监听器，避免内存泄漏。
* 优化图片资源的加载，采用懒加载技术，只有当图片进入视口时才开始加载图片资源，减少初始加载时的网络请求和资源消耗。
* 减少不必要的 DOM 操作，在数据更新时，尽量使用批量更新操作，并利用浏览器的请求动画帧（`requestAnimationFrame`）来优化 DOM 更新的时机，确保 DOM 更新与屏幕刷新同步，提高滚动的流畅度。

</details>

## 5. 什么是防抖和节流，以及如何编码实现？ {#question-7fa82090-78a2-4445-a982-48ed95cb20c0}

> 题库原题：[什么是防抖和节流，以及如何编码实现？](https://fe.ecool.fun/topic/7fa82090-78a2-4445-a982-48ed95cb20c0)

### 题目要点

本质上是优化高频率执行代码的一种手段

<details>
<summary>参考答案</summary>

## 一、是什么

本质上是优化高频率执行代码的一种手段

如：浏览器的 `resize`、`scroll`、`keypress`、`mousemove` 等事件在触发时，会不断地调用绑定在事件上的回调函数，极大地浪费资源，降低前端性能

为了优化体验，需要对这类事件进行调用次数的限制，对此我们就可以采用`throttle`（节流）和`debounce`（防抖）的方式来减少调用频率

#### 定义

- 节流: n 秒内只运行一次，若在 n 秒内重复触发，只有一次生效
- 防抖: n 秒后在执行该事件，若在 n 秒内被重复触发，则重新计时

一个经典的比喻:

想象每天上班大厦底下的电梯。把电梯完成一次运送，类比为一次函数的执行和响应

假设电梯有两种运行策略 `debounce` 和 `throttle`，超时设定为15秒，不考虑容量限制

电梯第一个人进来后，15秒后准时运送一次，这是节流

电梯第一个人进来后，等待15秒。如果过程中又有人进来，15秒等待重新计时，直到15秒后开始运送，这是防抖

## 代码实现

### 节流

完成节流可以使用时间戳与定时器的写法

使用时间戳写法，事件会立即执行，停止触发后没有办法再次执行

```js
function throttled1(fn, delay = 500) {
    let oldtime = Date.now()
    return function (...args) {
        let newtime = Date.now()
        if (newtime - oldtime >= delay) {
            fn.apply(null, args)
            oldtime = Date.now()
        }
    }
}

```

使用定时器写法，`delay`毫秒后第一次执行，第二次事件停止触发后依然会再一次执行

```js
function throttled2(fn, delay = 500) {
    let timer = null
    return function (...args) {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args)
                timer = null
            }, delay);
        }
    }
}
```

可以将时间戳写法的特性与定时器写法的特性相结合，实现一个更加精确的节流。实现如下

```js
function throttled(fn, delay) {
    let timer = null
    let starttime = Date.now()
    return function () {
        let curTime = Date.now() // 当前时间
        let remaining = delay - (curTime - starttime)  // 从上一次到现在，还剩下多少多余时间
        let context = this
        let args = arguments
        clearTimeout(timer)
        if (remaining <= 0) {
            fn.apply(context, args)
            starttime = Date.now()
        } else {
            timer = setTimeout(fn, remaining);
        }
    }
}
```

### 防抖

简单版本的实现

```js
function debounce(func, wait) {
    let timeout;

    return function () {
        let context = this; // 保存this指向
        let args = arguments; // 拿到event对象

        clearTimeout(timeout)
        timeout = setTimeout(function(){
            func.apply(context, args)
        }, wait);
    }
}
```

防抖如果需要立即执行，可加入第三个参数用于判断，实现如下：

```js
function debounce(func, wait, immediate) {

    let timeout;

    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout); // timeout 不为null
        if (immediate) {
            let callNow = !timeout; // 第一次会立即执行，以后只有事件执行后才会再次触发
            timeout = setTimeout(function () {
                timeout = null;
            }, wait)
            if (callNow) {
                func.apply(context, args)
            }
        }
        else {
            timeout = setTimeout(function () {
                func.apply(context, args)
            }, wait);
        }
    }
}
```

## 二、区别

相同点：

- 都可以通过使用 `setTimeout` 实现
- 目的都是，降低回调执行频率。节省计算资源

不同点：

- 函数防抖，在一段连续操作结束后，处理回调，利用`clearTimeout `和 `setTimeout`实现。函数节流，在一段连续操作中，每一段时间只执行一次，频率较高的事件中使用来提高性能
- 函数防抖关注一定时间连续触发的事件，只在最后执行一次，而函数节流一段时间内只执行一次

例如，都设置时间频率为500ms，在2秒时间内，频繁触发函数，节流，每隔 500ms 就执行一次。防抖，则不管调动多少次方法，在2s后，只会执行一次

如下图所示：

 ![](https://static.ecool.fun//article/5650498e-9fc1-4b0e-bd68-63831bc94cb3.png)

## 三、应用场景

防抖在连续的事件，只需触发一次回调的场景有：

- 搜索框搜索输入。只需用户最后一次输入完，再发送请求
- 手机号、邮箱验证输入检测
- 窗口大小`resize`。只需窗口调整完成后，计算窗口大小。防止重复渲染。

节流在间隔一段时间执行一次回调的场景有：

- 滚动加载，加载更多或滚到底部监听
- 搜索框，搜索联想功能

</details>

## 6. 以下代码输出顺序： {#question-subjective-abf2eb52a062}

```js
Promise.resolve().then(() => console.log(1));
setTimeout(() => console.log(2), 0);
console.log(3);
```

### 题目要点

JavaScript 异步执行机制

<details>
<summary>参考答案</summary>

首先，代码的执行顺序是同步代码先执行，异步代码后执行。`console.log(3);` 是同步代码，会首先执行并输出 3。

接着看异步代码，`Promise.resolve().then(() => console.log(1))` 中的 `then` 回调属于微任务（microtask），而 `setTimeout(() => console.log(2), 0)` 中的回调属于宏任务（macrotask）。

在 JavaScript 的事件循环中，当前所有同步代码执行完毕后，会先处理微任务队列中的任务，然后再处理宏任务队列中的任务。

因此，`console.log(1)` 作为微任务会先于 `console.log(2)` 这个宏任务执行。所以最终的输出顺序是 3、1、2。

</details>

## 7. 说说常规的前端性能优化手段 {#question-549f8d07-a907-4c86-93c1-d3e8fef30613}

> 题库原题：[说说常规的前端性能优化手段](https://fe.ecool.fun/topic/549f8d07-a907-4c86-93c1-d3e8fef30613)

### 题目要点

<p><strong>答题思路</strong>：列举常规的前端性能优化手段，并简要说明每项手段的目的。</p><p></p><p>1. 资源压缩：减小HTML、CSS、JavaScript文件体积。</p><p>2. 图片优化：压缩图片大小，使用适当的图片格式。</p><p>3. 利用浏览器缓存：通过设置缓存策略，减少重复资源加载。</p><p>4. CSS Sprites：合并多个图片，减少HTTP请求。</p><p>5. 延迟加载：对非关键资源使用懒加载，减少初始加载时间。</p><p>6. 异步脚本：使用async或defer属性异步加载JavaScript。</p><p>7. 减少HTTP请求：合并文件，减少请求次数。</p><p>8. 代码分割：将代码分割成多个小块，按需加载。</p><p>9. 使用CDN：加速静态资源的加载速度。</p><p>10. 网络优化：使用HTTP/2，减少传输延迟。</p><p></p><p><strong>考察要点</strong>：对前端性能优化方法的了解和应用能力。</p><p></p><p></p><p></p>

<details>
<summary>参考答案</summary>

<ul><li>content方面<br/></li><ul><li>减少HTTP请求：合并文件、CSS精灵、inline Image</li><li>减少DNS查询：DNS查询完成之前浏览器不能从这个主机下载任何任何文件。方法：DNS缓存、将资源分布到恰当数量的主机名，平衡并行下载和DNS查询</li><li>避免重定向：多余的中间访问</li><li>使Ajax可缓存</li><li>非必须组件延迟加载</li><li>未来所需组件预加载</li><li>减少DOM元素数量</li><li>将资源放到不同的域下：浏览器同时从一个域下载资源的数目有限，增加域可以提高并行下载量</li><li>减少iframe数量</li><li>不要404</li></ul></ul><p></p><ul><li>Server方面<br/></li><ul><li>使用CDN</li><li>添加Expires或者Cache-Control响应头</li><li>对组件使用Gzip压缩</li><li>配置ETag</li><li>Flush Buffer Early</li><li>Ajax使用GET进行请求</li><li>避免空src的img标签</li></ul></ul><p></p><ul><li>Cookie方面<br/></li><ul><li>减小cookie大小</li><li>引入资源的域名不要包含cookie</li></ul></ul><p></p><ul><li>css方面<br/></li><ul><li>将样式表放到页面顶部</li><li>不使用CSS表达式</li><li>不使用IE的Filter</li></ul></ul><p></p><ul><li>Javascript方面<br/></li><ul><li>将脚本放到页面底部</li><li>将javascript和css从外部引入</li><li>压缩javascript和css</li><li>删除不需要的脚本</li><li>减少DOM访问</li><li>合理设计事件监听器</li></ul></ul><p></p><ul><li>图片方面<br/></li><ul><li>优化图片：根据实际颜色需要选择色深、压缩</li><li>优化css精灵</li><li>不要在HTML中拉伸图片</li><li>保证favicon.ico小并且可缓存</li></ul></ul><p></p><p></p>

</details>

## 8. Vue2.0为什么不能检查数组的变化，该怎么解决？ {#question-26f1a1e7-1bfd-4a0c-91b1-4e1c8455f60a}

> 题库原题：[Vue2.0为什么不能检查数组的变化，该怎么解决？](https://fe.ecool.fun/topic/26f1a1e7-1bfd-4a0c-91b1-4e1c8455f60a)

### 题目要点

Vue 2.0 中的响应式系统是基于 Object.defineProperty 实现的，这导致了它无法检测数组和对象的一些特定操作。具体来说：

1. 对于数组：Vue 2.0 无法检测数组的新增操作，因为 Object.defineProperty 只适用于对象属性，而不适用于数组索引。
   Vue 2.0 也无法检测通过索引改变数组的操作，即 `vm.items[indexOfItem] = newValue`。这是因为 Object.defineProperty 不会对数组索引的直接赋值操作进行监听。

2. 对于对象：
   Vue 2.0 无法检测对象属性的新增或删除，因为 Object.defineProperty 只适用于对象属性的直接赋值操作，而不适用于属性的新增或删除。

这些限制是由于 JavaScript 原生 API 的限制，以及 Vue 2.0 为了性能考虑所做的设计决策。尽管 Object.defineProperty 理论上可以检测到通过索引改变数组的操作，但由于性能原因，Vue 2.0 没有实现这一功能。

Vue 3.0 使用了 Proxy 代替了 Object.defineProperty，从而解决了这些限制，提供了更全面的响应式支持。

对于数组和对象的新增和修改，Vue 2.0 提供了一些解决方案，例如使用 `this.$set` 方法来设置对象或数组的新属性，使用 `splice` 方法来修改数组等。这些方法可以确保数据的变化能够被 Vue 检测到，并触发相应的更新。

<details>
<summary>参考答案</summary>

## 前言

我们都知道，Vue2.0对于响应式数据的实现有一些不足：

- 无法检测数组/对象的新增
- 无法检测通过索引改变数组的操作。

## 分析

- 无法检测数组/对象的新增？

Vue检测数据的变动是通过Object.defineProperty实现的，所以无法监听数组的添加操作是可以理解的，因为是在构造函数中就已经为所有属性做了这个检测绑定操作。

- 无法检测通过索引改变数组的操作。即vm.items[indexOfItem] = newValue？

[官方文档](https://cn.vuejs.org/v2/guide/list.html#注意事项)中对于这两点都是简要的概括为“由于JavaScript的限制”无法实现，而Object.defineProperty是实现检测数据改变的方案，这个限制是指Object.defineProperty

## 思考

### vm.items[indexOfItem] = newValue真的不能被监听么？

> Vue对数组的7个变异方法（push、pop、shift、unshift、splice、sort、reverse）实现了响应式。这里就不做测试了。我们测试一下通过索引改变数组的操作，能不能被监听到。
>
> 遍历数组，用Object.defineProperty对每一项进行监测

```js
function defineReactive(data, key, value) {
     Object.defineProperty(data, key, {
         enumerable: true,
         configurable: true,
         get: function defineGet() {
             console.log(`get key: ${key} value: ${value}`)
             return value
         },
         set: function defineSet(newVal) {
             console.log(`set key: ${key} value: ${newVal}`)
             value = newVal
         }
     })
}

function observe(data) {
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key])
    })
}

let arr = [1, 2, 3]
observe(arr)
```

![image-20210607020953993](https://static.ecool.fun//article/fd22ab50-39ad-4dc7-a638-b580e7fa7d58.jpeg)

### 测试说明

通过索引改变arr[1]，我们发现触发了set，也就是Object.defineProperty是可以检测到通过索引改变数组的操作的，那Vue2.0为什么没有实现呢？是尤大能力不行？这肯定毋庸置疑。那他为什么不实现呢？

![image-20210607021557820](https://static.ecool.fun//article/f05a63a5-0ff2-4336-b1d7-cc5414564ca8.jpeg)

**小结**：是出于对性能原因的考虑，没有去实现它。而不是不能实现。

对于对象而言，每一次的数据变更都会对对象的属性进行一次枚举，一般对象本身的属性数量有限，所以对于遍历枚举等方式产生的性能损耗可以忽略不计，但是对于数组而言呢？数组包含的元素量是可能达到成千上万，假设对于每一次数组元素的更新都触发了枚举/遍历，其带来的性能损耗将与获得的用户体验不成正比，故vue无法检测数组的变动。

不过Vue3.0用proxy代替了defineProperty之后就解决了这个问题。

-----------------------

## 解决方案

### 数组

1. this.$set(array, index, data)

   ```js
   //这是个深度的修改，某些情况下可能导致你不希望的结果，因此最好还是慎用
   this.dataArr = this.originArr
   this.$set(this.dataArr, 0, {data: '修改第一个元素'})
   console.log(this.dataArr)
   console.log(this.originArr)  //同样的 源数组也会被修改 在某些情况下会导致你不希望的结果
   ```

2. splice

   ```js
   //因为splice会被监听有响应式，而splice又可以做到增删改。
   ```

3. 利用临时变量进行中转

   ```js
   let tempArr = [...this.targetArr]
   tempArr[0] = {data: 'test'}
   this.targetArr = tempArr
   ```

### 对象

1. this.$set(obj, key ,value) - 可实现增、改

2. watch时添加`deep：true`深度监听，只能监听到属性值的变化，新增、删除属性无法监听

   ```js
   this.$watch('blog', this.getCatalog, {
       deep: true
       // immediate: true // 是否第一次触发
     });
   ```

3. watch时直接监听某个key

   ```js
   watch: {
     'obj.name'(curVal, oldVal) {
       // TODO
     }
   }
   ```

</details>

## 9. 虚拟 dom 原理是什么，手写一个简单的虚拟 dom 实现 {#question-dd92f98d-9e6e-4cc5-bcfc-dc61adce1bf2}

> 题库原题：[虚拟 dom 原理是什么，手写一个简单的虚拟 dom 实现](https://fe.ecool.fun/topic/dd92f98d-9e6e-4cc5-bcfc-dc61adce1bf2)

### 题目要点

- **虚拟 DOM** 提供了一个轻量级的 DOM 表示，在内存中进行操作，提高了性能。
- **比较和更新**：通过虚拟 DOM 树的比较和差异更新来优化真实 DOM 的操作。
- **手写实现**：需要使用 JavaScript 实现虚拟 DOM、差异计算和更新。实际生产环境中的虚拟 DOM 实现要复杂得多，通常会使用更高级的技术和优化策略。

<details>
<summary>参考答案</summary>

**虚拟 DOM（Virtual DOM）** 是一种通过用 JavaScript 对象来模拟真实 DOM 的机制。它可以提高网页的性能和响应速度，减少直接对 DOM 的操作，从而优化 UI 渲染。

### **虚拟 DOM 的原理**

1. **创建虚拟 DOM**：
   - 使用 JavaScript 对象来表示 DOM 元素。虚拟 DOM 结构类似于真实 DOM，但它是轻量级的，可以在内存中快速操作。

2. **比较差异（Diffing）**：
   - 当组件状态或属性发生变化时，生成一个新的虚拟 DOM 树。
   - 通过对比新旧虚拟 DOM 树，找到差异（diff）。

3. **更新真实 DOM**：
   - 将差异应用到真实 DOM 上，进行最小化的更新，以提高性能。

### **手写一个简单的虚拟 DOM 实现**

以下是一个简化版的虚拟 DOM 实现示例：

```javascript
// 创建虚拟 DOM 节点
function createElement(tag, props, ...children) {
    return {
        tag,
        props: props || {},
        children: children.flat().map(child =>
            typeof child === 'object' ? child : createTextNode(child)
        )
    };
}

// 创建虚拟 DOM 文本节点
function createTextNode(text) {
    return { tag: 'TEXT', props: { nodeValue: text } };
}

// 渲染虚拟 DOM 节点到真实 DOM
function render(vnode, container) {
    if (vnode.tag === 'TEXT') {
        const textNode = document.createTextNode(vnode.props.nodeValue);
        container.appendChild(textNode);
        return;
    }

    const element = document.createElement(vnode.tag);
    Object.keys(vnode.props).forEach(prop => {
        element[prop] = vnode.props[prop];
    });

    vnode.children.forEach(child => render(child, element));

    container.appendChild(element);
}

// 比较两个虚拟 DOM 树，更新差异
function diff(oldVNode, newVNode) {
    if (!oldVNode) {
        return newVNode;
    }
    if (!newVNode) {
        return null;
    }
    if (oldVNode.tag !== newVNode.tag) {
        return newVNode;
    }
    if (oldVNode.tag === 'TEXT') {
        if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
            return newVNode;
        }
        return null;
    }

    const patch = {};
    const propChanges = Object.keys(newVNode.props).reduce((acc, prop) => {
        if (oldVNode.props[prop] !== newVNode.props[prop]) {
            acc[prop] = newVNode.props[prop];
        }
        return acc;
    }, {});

    if (Object.keys(propChanges).length > 0) {
        patch.props = propChanges;
    }

    const childPatches = [];
    const maxLength = Math.max(oldVNode.children.length, newVNode.children.length);
    for (let i = 0; i < maxLength; i++) {
        const childPatch = diff(oldVNode.children[i], newVNode.children[i]);
        if (childPatch) {
            childPatches[i] = childPatch;
        }
    }

    if (childPatches.length > 0) {
        patch.children = childPatches;
    }

    return Object.keys(patch).length > 0 ? patch : null;
}

// 应用虚拟 DOM 差异到真实 DOM
function patch(node, patch) {
    if (patch === null) {
        return;
    }

    if (patch.props) {
        Object.keys(patch.props).forEach(prop => {
            node[prop] = patch.props[prop];
        });
    }

    if (patch.children) {
        patch.children.forEach((childPatch, index) => {
            const childNode = node.childNodes[index];
            if (childNode) {
                patch(childNode, childPatch);
            }
        });
    }
}

// 使用示例
const oldVNode = createElement('div', { id: 'container' },
    createElement('h1', null, 'Hello, World!'),
    createElement('p', null, 'This is a virtual DOM example.')
);

const newVNode = createElement('div', { id: 'container' },
    createElement('h1', null, 'Hello, Virtual DOM!'),
    createElement('p', null, 'Updated example.')
);

const container = document.getElementById('app');
render(oldVNode, container);

setTimeout(() => {
    const patch = diff(oldVNode, newVNode);
    patch(container, patch);
}, 2000);
```

### **解释**

1. **`createElement`**：创建虚拟 DOM 节点。
2. **`createTextNode`**：创建虚拟文本节点。
3. **`render`**：将虚拟 DOM 渲染到真实 DOM。
4. **`diff`**：对比虚拟 DOM 树，找出差异。
5. **`patch`**：将差异应用到真实 DOM 上。

</details>

## 10. 虚拟DOM一定更快吗？ {#question-a19c5526-dc2d-43ac-bda7-c4b2948839a4}

> 题库原题：[虚拟DOM一定更快吗？](https://fe.ecool.fun/topic/a19c5526-dc2d-43ac-bda7-c4b2948839a4)

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

## 11. 列表页面的数据要跟商品数据卡通信，你会怎么做？ {#question-subjective-512879bd7abf}

### 题目要点

组件间通信能力

<details>
<summary>参考答案</summary>

如果是使用 Vue 框架，可以采用以下方法实现列表页面和商品数据卡之间的通信：

1. 父子组件通信：如果列表页面是父组件，商品数据卡是子组件，可以通过 props 从父组件向子组件传递数据。在父组件中将列表数据作为 props 传递给子组件，子组件通过 props 接收并展示相应的数据。如果需要从子组件向父组件传递数据，例如当商品数据卡中的某些操作（如点击事件）需要通知列表页面时，可以在子组件中使用自定义事件（`this.$emit`），在父组件中监听该事件并进行相应的处理。

2. 事件总线（Event Bus）：在 Vue 中可以创建一个事件总线（一个空的 Vue 实例），用于在不同组件之间进行通信。列表页面和商品数据卡组件都可以通过事件总线来发送和接收事件。例如，当商品数据卡需要向列表页面发送数据时，通过事件总线的 `$emit` 方法发送一个事件，列表页面监听该事件并通过 `$on` 方法接收数据。

3. Vuex 状态管理模式：对于复杂的应用场景，特别是当列表页面和商品数据卡之间存在多层组件嵌套或跨组件通信需求时，可以使用 Vuex 来管理应用的状态。将列表数据和商品数据卡相关联的数据存储在 Vuex 的 store 中，列表页面和商品数据卡通过 mutations 或 actions 来修改 state 中的数据，并通过 getters 获取数据。这样可以实现组件之间的状态共享和通信，确保数据的一致性和可维护性。

</details>

## 12. 数组去重 {#question-f56b93a9-52df-49ae-8d63-d7ee4f816f8b}

> 题库原题：[数组去重](https://fe.ecool.fun/topic/f56b93a9-52df-49ae-8d63-d7ee4f816f8b)

```js
const arr = [1, 1, '1', 17, true, true, false, false, 'true', 'a', {}, {}];
// => [1, '1', 17, true, false, 'true', 'a', {}, {}]
```

### 题目要点

方法一：利用Set

<details>
<summary>参考答案</summary>

* 方法一：利用Set
```js
const res1 = Array.from(new Set(arr));
```

* 方法二：两层for循环+splice
```js
const unique1 = arr => {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
        // 每删除一个树，j--保证j的值经过自加后不变。同时，len--，减少循环次数提升性能
        len--;
        j--;
      }
    }
  }
  return arr;
}
```

* 方法三：利用indexOf
```js
const unique2 = arr => {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) res.push(arr[i]);
  }
  return res;
}
```

当然也可以用include、filter，思路大同小异。

* 方法四：利用include
```js
const unique3 = arr => {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!res.includes(arr[i])) res.push(arr[i]);
  }
  return res;
}
```

* 方法五：利用filter
```js
const unique4 = arr => {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}
```

* 方法六：利用Map
```js
const unique5 = arr => {
  const map = new Map();
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      map.set(arr[i], true)
      res.push(arr[i]);
    }
  }
  return res;
}
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-26/_index.md" >}}) · 已是最后一轮 →
