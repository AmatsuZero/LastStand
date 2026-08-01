+++
title = "JavaScript 面试题"
draft = false
tags = ["面试", "前端", "JavaScript", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:24:40.928Z"
+++

共 407 道 JavaScript 面试题。答案默认折叠，便于先自行作答。

## 1. `requestAnimationFrame` 与 `requestIdleCallback` 在渲染优化中的执行时机差异？谁优先触发？ {#question-f142c5fe-17fd-444e-8daf-bd03d085ce69}

> 难度：3 · 类型：QA

### 题目要点

`requestAnimationFrame` 在浏览器即将进行下一帧渲染之前执行，用于动画与视觉更新，优先级高于渲染阶段后的任务。`requestIdleCallback` 只会在当前帧所有渲染任务完成且仍有剩余时间时触发，属于低优先级空闲调度机制。因此在同一帧中，rAF 必然先于 rIC 执行。rAF 用于保证帧同步，rIC 用于利用空闲时间执行非关键任务。

<details>
<summary>参考答案</summary>

这个问题本质是理解 **浏览器一帧的调度模型**。
不搞清楚一帧里发生了什么，很容易回答成“谁快谁慢”这种表层结论。

核心结论先给出：

> 在有下一帧渲染需求的情况下，`requestAnimationFrame` 一定优先于 `requestIdleCallback` 执行。
> `requestIdleCallback` 只会在当前帧还有“空闲时间”时才会触发。

下面从浏览器帧模型拆解。

---

# 一、浏览器一帧的基本流程

以 60fps 为例，一帧约 16.6ms。

一次完整渲染循环大致是：

1. 执行宏任务（例如 setTimeout）
2. 清空微任务队列
3. 触发 requestAnimationFrame 回调
4. 进行样式计算（Style）
5. 布局计算（Layout）
6. 绘制（Paint）
7. 合成（Composite）
8. 如果还有时间 → 执行 requestIdleCallback

需要明确一点：

* rAF 是“下一帧渲染前”的回调
* rIC 是“当前帧剩余时间”的回调

---

# 二、requestAnimationFrame 的执行时机

`requestAnimationFrame` 的设计目标是：

> 在浏览器即将进行下一次重绘之前执行回调。

特点：

* 每帧最多执行一次
* 与刷新率同步
* 在样式计算之前触发
* 如果标签页不可见，会暂停

执行时机可以理解为：

> 在下一帧开始渲染流程之前

示例：

```js id="z0ad4h"
requestAnimationFrame(() => {
  // 适合更新动画状态
})
```

如果在 rAF 中修改 DOM，会参与当前帧的布局与绘制。

---

# 三、requestIdleCallback 的执行时机

`requestIdleCallback` 的设计目标是：

> 利用主线程空闲时间执行低优先级任务。

它有两个触发条件：

1. 当前帧执行完所有渲染任务后仍有剩余时间
2. 或者超时（timeout）触发

示例：

```js id="dbb8k7"
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0) {
    // 做低优先级任务
  }
});
```

关键特征：

* 不保证每帧都会执行
* 如果帧很忙，可能一直被延迟
* 优先级低于渲染任务

---

# 四、两者在同一帧中的相对顺序

假设：

```js id="wj3k6a"
requestAnimationFrame(() => console.log('rAF'));
requestIdleCallback(() => console.log('rIC'));
```

执行顺序一定是：

```
rAF
rIC
```

原因：

* rAF 是渲染前任务
* rIC 是渲染后空闲任务

只要这一帧需要渲染，rAF 必然优先。

---

# 五、极端情况分析

## 情况一：主线程持续繁忙

如果 JavaScript 长时间占用主线程：

* rAF 会延迟到下一帧
* rIC 可能根本不执行

rIC 不保证执行时间。

---

## 情况二：页面不可见

* rAF 会暂停
* rIC 仍可能执行（取决于浏览器策略）

---

## 情况三：高帧率显示器

在 120Hz 下：

* 每帧时间更短（约 8ms）
* rIC 更难获得空闲时间

---

# 六、在渲染优化中的使用场景

## requestAnimationFrame 适合：

* 动画
* DOM 变更
* 视觉相关更新
* 滚动同步

因为它保证在渲染前执行。

---

## requestIdleCallback 适合：

* 预加载
* 数据预计算
* 日志上报
* 非关键计算

因为它只在空闲时间运行。

---

# 七、优先级总结

在浏览器调度优先级中：

微任务 > rAF > 渲染 > rIC

可以抽象为：

高优先级（影响视觉） → rAF
低优先级（非关键逻辑） → rIC

---

# 八、本质差异

可以从“目标函数”角度理解：

* rAF 优化的是“帧同步”
* rIC 优化的是“主线程利用率”

两者并不是竞争关系，而是不同调度通道。

</details>

## 2. 如何拦截`arr[0] = 1`这类操作 {#question-09829c97-8c72-4436-a05f-f91355630197}

> 难度：2.5 · 类型：QA

### 题目要点

**`arr[0] = 1` 本质是对象属性赋值，ES5 的 `defineProperty` 无法完整拦截动态下标，而 ES6 的 `Proxy` 可以通过 `set` trap 精确感知，因此成为现代响应式系统和状态管理的基础能力。**

<details>
<summary>参考答案</summary>

要拦截 `arr[0] = 1` 这类**通过下标直接修改数组元素的操作**，本质上需要拦截的是：

> **对象属性的 `set` 行为**

在 JavaScript 中，这类操作是否可拦截，取决于使用的是 **ES5 的 `Object.defineProperty`** 体系，还是 **ES6 的 `Proxy`** 体系。

---

## 一、结论先行

* **无法通过 `Object.defineProperty` 完整拦截 `arr[0] = 1`**
* **可以通过 `Proxy` 精确拦截 `arr[0] = 1`**

这也是 Vue2 与 Vue3 在数组响应式能力上的本质差异之一。

---

## 二、为什么 `defineProperty` 做不到

### 1. 数组下标是“动态属性”

```js
arr[0] = 1
```

等价于：

```js
arr['0'] = 1
```

而 `Object.defineProperty` 的限制是：

* 只能拦截**已存在的属性**
* 无法感知**新增属性**
* 无法批量监听所有未知 key

即使提前对 `0、1、2...` 做劫持：

* 无法预知数组未来长度
* `length` 的变化也无法可靠追踪

因此只能通过 **hack 原型方法**（push、splice 等）做“部分覆盖”。

---

### 2. Vue2 的实际策略（背景理解）

Vue2 对数组的处理是：

* 劫持 `push / pop / splice / shift / unshift / sort / reverse`
* 不支持 `arr[index] = value`
* 不支持 `arr.length = n`

这是能力边界，而不是遗漏。

---

## 三、Proxy 如何拦截 `arr[0] = 1`

### 1. 核心原理

`Proxy` 能拦截的是：

> **对象层面的“任意属性访问与修改”**

数组在 JS 中本质上是对象，因此：

```js
arr[0] = 1
```

一定会触发 `set` trap。

---

### 2. 示例实现

```js
const arr = new Proxy([], {
  set(target, key, value, receiver) {
    console.log('set:', key, value);
    return Reflect.set(target, key, value, receiver);
  }
});

arr[0] = 1;       // set: "0" 1
arr.length = 10; // set: "length" 10
```

可拦截的包括：

* 下标赋值
* length 变更
* 动态新增元素

---

## 四、为什么 Proxy 是“完整解法”

对比能力边界：

| 能力        | defineProperty | Proxy |
| --------- | -------------- | ----- |
| 下标赋值      | 不可行            | 可行    |
| 新增属性      | 不可感知           | 可感知   |
| 删除属性      | 不可感知           | 可感知   |
| length 修改 | 不稳定            | 可拦截   |
| 全量代理      | 需要逐个定义         | 一次代理  |

这也是 Vue3 全面转向 Proxy 的根本原因。

---

## 五、工程层面的注意点

### 1. 不要直接修改原数组引用

一旦做了 Proxy：

```js
const raw = [];
const observed = new Proxy(raw, ...);
```

后续逻辑必须**只使用代理对象**，否则拦截会失效。

---

### 2. 避免在 set 中直接操作 target

推荐使用：

```js
Reflect.set(target, key, value, receiver);
```

而不是：

```js
target[key] = value;
```

否则容易破坏 this 绑定和继承语义。

</details>

## 3. async function 返回的 Promise 状态何时变为 resolved？ {#question-f63d5da4-7797-4a48-920a-54e983e33bf3}

> 难度：3 · 类型：QA

### 题目要点

1. **`async` 函数本身不一定是异步执行的**

   * 只有 `await` 才会让出执行权

2. `return await` ≠ `return`

   * `return await` 会等待 Promise settle
   * `return` 直接包装 Promise（但结果通常一致）
3. resolved ≠ 同步

   * resolved 的回调一定是异步（微任务）

<details>
<summary>参考答案</summary>

`async function` **返回的 Promise 会在函数体内的执行流程“正常结束”时变为 `resolved`**。

更精确地说，可以从以下几种情况来理解。

---

## 一、基本结论（核心规则）

> **当 `async` 函数执行到 `return`，或函数体执行完且未抛出异常时，返回的 Promise 会被 `resolved`。**

同时遵循两个映射规则：

* `return value` → `Promise.resolve(value)`
* `throw error` → `Promise.reject(error)`

---

## 二、几种常见场景拆解

### 1. 显式 `return`（最常见）

```js
async function foo() {
  return 42;
}

foo().then(res => console.log(res)); // 42
```

等价于：

```js
function foo() {
  return Promise.resolve(42);
}
```

**Promise 在 `return` 语句执行时变为 resolved。**

---

### 2. 没有 `return`（隐式返回 `undefined`）

```js
async function foo() {}

foo().then(res => console.log(res)); // undefined
```

等价于：

```js
Promise.resolve(undefined);
```

**函数执行到末尾时，Promise resolved，值为 `undefined`。**

---

### 3. `return await xxx`

```js
async function foo() {
  return await Promise.resolve(10);
}
```

这里要注意：

* `await` 会“暂停”函数执行，等待 Promise settle
* **只有在 `await` 的 Promise fulfilled 后，函数才会继续执行并 `return`**

因此：

> Promise **在 `await` 的 Promise fulfilled 之后** 才会 resolved

等价逻辑：

```js
Promise.resolve(10).then(v => Promise.resolve(v));
```

---

### 4. 函数内部抛出异常

```js
async function foo() {
  throw new Error("err");
}

foo().catch(err => console.log(err.message));
```

此时：

* Promise **不会 resolved**
* 而是 **立即变为 rejected**

---

### 5. `await` 的 Promise 被 reject

```js
async function foo() {
  await Promise.reject("fail");
  return 1;
}
```

执行流程：

* `await` 等到 Promise reject
* 抛出异常
* 函数中断执行

结果：

```js
foo().catch(err => console.log(err)); // "fail"
```

**返回的 Promise 状态是 rejected，不是 resolved。**

---

## 三、时间点总结（一句话版）

> `async function` 返回的 Promise **在函数执行完毕且没有抛出异常时 resolved**，
> 如果函数中包含 `await`，则要等 **所有被 `await` 的 Promise fulfilled 后** 才会 resolved。

---

## 四、事件循环视角（进阶理解）

```js
async function foo() {
  return 1;
}

console.log("start");
foo().then(console.log);
console.log("end");
```

输出顺序：

```
start
end
1
```

说明：

* `async` 函数是 **同步开始执行**
* `resolved` 的回调（`.then`）**一定进入微任务队列**
* 即使是 `return 1`，也不会同步触发 `.then`

</details>

## 4. 如何实现大文件分片上传与断点续传 {#question-5d5d730d-b80a-4535-a491-6bf059d389ff}

> 难度：3 · 类型：QA

### 题目要点

大文件上传通过前端切片与服务端合并实现；断点续传依赖文件唯一标识和已上传分片状态查询；前端按缺失分片继续上传并控制并发与重试；上传完成后需显式触发服务端合并和校验；整体是一个前后端协同的状态协议设计问题。

<details>
<summary>参考答案</summary>

在前端视角下，大文件分片上传与断点续传解决的不是“能不能上传”，而是**在不稳定网络环境下，如何保证上传过程可控、可恢复且对用户友好**。它本质上是一个前后端协同的协议设计问题，而不仅是前端切片这么简单。

在实现层面，前端首先需要在本地对文件进行切片。通常通过 `File` 对象的 `slice` 能力，将一个大文件按固定大小或动态策略拆分成多个 chunk。切片时并不立即上传所有数据，而是先生成一个能够唯一标识该文件的标识，例如基于文件内容、文件大小和修改时间计算的 hash。这个标识用于在后续的整个生命周期中，让前后端对“同一个文件”达成一致认知。

在真正上传之前，前端通常会先向服务端发起一次“查询请求”，用于确认哪些分片已经存在。这一步是断点续传的关键。服务端根据文件标识返回一个已上传分片的列表或上传进度，前端据此跳过已完成的分片，仅上传缺失部分。这样即使浏览器刷新、进程中断或网络异常，也可以从已有进度继续。

分片上传阶段，前端会为每个 chunk 附带必要的元信息，例如文件标识、分片索引、分片大小和总分片数。上传可以是串行、并行或受控并发的方式，具体策略取决于网络状况和服务端承载能力。并发上传需要额外关注失败重试和顺序无关性，确保单个分片失败不会影响整体状态。

当所有分片上传完成后，前端需要显式通知服务端执行“合并”操作。服务端根据分片索引顺序将数据合并成最终文件，并进行完整性校验，例如比对文件 hash 或大小。如果合并失败，服务端应返回明确状态，前端再决定是否重试或重新上传部分分片。

在这个过程中，前端的职责不仅是发请求，还包括进度管理和用户体验控制。总体进度通常不是简单的已完成分片数，而是基于每个分片大小加权计算；失败时要能够精确回退到某个分片级别，而不是整文件重来。这也是分片上传相比普通上传复杂得多的原因。

从工程设计角度看，还需要注意安全和一致性问题。例如文件标识不能完全信任前端生成，服务端应有自己的校验逻辑；分片的存储需要具备过期和清理机制，避免“半成品文件”长期占用资源。在对象存储场景下，通常会直接利用存储服务提供的分片 / 多段上传能力，将前端协议映射到底层存储接口上。

总体而言，大文件分片上传与断点续传的关键不在“切”，而在于**可恢复状态的设计**。只要前后端都围绕同一个文件标识和分片状态工作，上传过程就可以被安全地中断并继续。

</details>

## 5. 虚拟滚动如何动态计算可视区域？无限滚动如何结合Intersection Observer优化性能？ {#question-54eb5e73-8bde-4be5-b9ea-1e4265762f8a}

> 难度：3 · 类型：QA

### 题目要点

1. **虚拟滚动**

   * 通过计算 `scrollTop` 与 `containerHeight` 动态确定可视区域索引；
   * 使用 `translateY` 模拟滚动偏移；
   * 动态高度需维护累计高度缓存与二分查找定位。

2. **无限滚动**

   * 核心是“何时加载更多”；
   * 使用 `IntersectionObserver` 替代滚动监听；
   * 哨兵进入视口即触发加载。

3. **两者结合**

   * 虚拟滚动负责渲染性能；
   * Intersection Observer 负责加载节奏；
   * 共同实现“无限列表”的流畅体验。

<details>
<summary>参考答案</summary>

这两个问题本质上都围绕前端**大数据列表渲染优化**展开，一个关注「**可视渲染范围的动态计算**」，一个关注「**数据加载时机的触发控制**」。

下面分别深入分析虚拟滚动与无限滚动的机制与实现重点。

## 一、虚拟滚动的可视区域动态计算

虚拟滚动（Virtual Scrolling）通过**只渲染视口内的部分元素**来应对数千甚至数万条数据的性能问题。
核心思想是：

> 不管数据量多大，DOM 始终保持固定数量，随着滚动动态更新内容与偏移。

### 1. 可视区域计算的关键参数

假设：

* 容器可视高度为 `containerHeight`
* 每个 item 高度为 `itemHeight`（或动态高度下需记录每个 item 的累计高度）
* 当前滚动偏移为 `scrollTop`
* 数据总量为 `totalCount`

则可得：

```ts
const startIndex = Math.floor(scrollTop / itemHeight)
const endIndex = Math.min(
  totalCount - 1,
  Math.ceil((scrollTop + containerHeight) / itemHeight)
)
```

可视区域数据为 `[startIndex, endIndex]`。

渲染时，为了避免滚动突变，可以再加一层缓冲区（如上下各多渲染 2~3 屏），即：

```ts
const buffer = 3
const renderStart = Math.max(0, startIndex - buffer)
const renderEnd = Math.min(totalCount, endIndex + buffer)
```

列表整体通过一个 `padding-top` 或 `transform: translateY()` 来**模拟滚动偏移**，
从而保持虚拟节点的相对位置正确：

```html
<div style="height: totalHeight">
  <div style="transform: translateY(${renderStart * itemHeight}px)">
    <!-- 渲染 renderStart ~ renderEnd 的真实内容 -->
  </div>
</div>
```

### 2. 动态高度场景的处理

当每个 item 高度不一致时，不能简单用平均高度估算。
常见策略有：

* **提前测量缓存**：滚动时记录已渲染元素的实际高度缓存到数组。
* **二分查找定位 startIndex**：通过累计高度数组计算当前 scrollTop 对应的可视起点。
* **实时校正**：在滚动过程中异步更新累计高度，平滑修正位置偏移。

这类方案常见于如 `Vue Virtual Scroller`、`React Window` 等库中。

## 二、无限滚动与 Intersection Observer 性能优化

无限滚动（Infinite Scroll）强调**懒加载数据**而非局部渲染。
在早期实现中，通常监听 `scroll` 事件，通过判断 `(scrollTop + clientHeight >= scrollHeight - threshold)` 来触发加载。
但频繁监听滚动事件容易导致主线程压力大，尤其在高频滚动时。

### 使用 Intersection Observer 优化的思路

`IntersectionObserver` 是浏览器原生提供的 API，用于**异步观察元素是否进入视口**，非常适合在无限滚动中检测“触底区域”。

#### 实现步骤

1. 在列表底部添加一个“哨兵元素”（sentinel）：

```html
<div id="list">
  <div v-for="item in list" :key="item.id">{{ item.text }}</div>
  <div ref="sentinel"></div>
</div>
```

2. 创建观察器并监听该元素：

```ts
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadMore() // 触发下一页加载
  }
}, {
  root: document.querySelector('#list'),
  threshold: 0.1
})
observer.observe(sentinel)
```

3. 当“哨兵元素”进入可视区域时自动加载下一批数据。

优点：

* 无需频繁监听滚动事件，浏览器内部通过优化调度执行检测逻辑。
* 可以精准控制触发阈值与加载频率。
* 在虚拟滚动场景中也可复用，用于判断当前渲染区域是否接近末尾。

## 三、两者结合的实践思路

在大型数据列表中，常将「虚拟滚动」与「无限滚动」结合使用：

1. **虚拟滚动**负责控制已加载数据的渲染范围。
2. **Intersection Observer**负责控制数据加载节奏。

流程如下：

* 初始加载首屏数据（例如 50 条）
* 虚拟滚动负责仅渲染可见区域（例如 10 条）
* 在列表底部放置“哨兵元素”，当其进入视口时触发 `loadMore()`，加载更多数据并更新总量
* 虚拟滚动自动计算新的渲染范围，无需额外 DOM 操作

这种方式相比传统滚动监听，**性能更平稳，渲染更可控**。

</details>

## 6. JSON.stringify 遇到 bigint 的类型的数据，会怎么处理？ {#question-1b03eb29-4d2b-4075-b919-262882691392}

> 难度：1 · 类型：QA

### 题目要点

`JSON.stringify()` 无法直接序列化 `BigInt` 类型的数据

<details>
<summary>参考答案</summary>

`JSON.stringify()` **无法直接序列化 `BigInt` 类型的数据**，如果遇到 `BigInt` 值，会**抛出异常**。

来看个例子：

```js
const obj = { id: 123n };
JSON.stringify(obj);
```

运行后会报错：

```
TypeError: Do not know how to serialize a BigInt
```

### 原因：

JSON 规范本身并 **不支持 `BigInt` 类型**，只支持以下几种数据类型：

* string
* number（普通数字）
* boolean
* null
* object
* array

而 `BigInt` 是 ES2020 新增的类型，不属于 JSON 的标准类型。

---

### 常见解决方案：

#### 1. 在序列化前手动转换为字符串

```js
const obj = { id: 123n };
const json = JSON.stringify(obj, (_, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
console.log(json); // {"id":"123"}
```

这样序列化后，可以在解析时再手动恢复：

```js
const parsed = JSON.parse(json, (_, value) =>
  /^\d+$/.test(value) ? BigInt(value) : value
);
console.log(parsed.id); // 123n
```

#### 2. 使用第三方库

像 `json-bigint` 这样的库可以支持 `BigInt` 的序列化与反序列化：

```bash
npm install json-bigint
```

示例：

```js
const JSONbig = require('json-bigint');
const obj = { id: 123n };

const str = JSONbig.stringify(obj);
console.log(str); // {"id":123}

const parsed = JSONbig.parse(str);
console.log(parsed.id); // 123n
```

</details>

## 7. 如何在前端项目中实现动态路由？ {#question-eef1fff3-2f61-40d2-b529-e89daabbf0b0}

> 难度：2 · 类型：QA

### 题目要点

动态路由的核心是将路由配置从静态定义转为运行时生成或挂载。常见做法包括“前端维护完整路由表后过滤”以及“后端下发路由配置”。

具体实现依赖框架提供的 API（如 `addRoute`、`useRoutes`），同时需要兼顾权限控制、懒加载与导航组件的解耦，才能在保证安全性的同时保持可扩展性和良好的用户体验。

<details>
<summary>参考答案</summary>

在前端项目中实现动态路由，本质上是根据用户权限、接口返回的数据或者运行时条件，动态地生成或加载路由配置，从而决定页面的可访问性和导航结构。

以 React Router 和 Vue Router 为例，核心思路有一些共通点：
在应用启动时，会有一个静态的基础路由表，用来保证最基本的页面可以正常访问（例如登录页、404 页、Layout 容器等）。而真正需要按用户角色、接口数据控制的路由，则通过接口请求或预置配置动态挂载进路由系统。

常见的实现方式有两类：

一种是前端自行维护完整的路由表，用户登录后，后端返回权限信息（角色、菜单、可访问模块 ID 等），前端在已有的路由表中做过滤，只保留当前用户有权限的部分，再动态挂载到路由系统。这种方式对前端掌控力更强，体验流畅，但需要在前端同步维护一份路由和权限的映射关系。

另一种是由后端直接下发路由配置（通常带有 path、component 标识、子路由结构等），前端拿到配置后再通过组件映射表动态生成路由。这种方式能减轻前端维护压力，但会带来接口设计和前后端耦合的问题。

在技术层面，React Router v6 提供了 `useRoutes` 可以直接基于对象动态生成路由，Vue Router 也支持 `router.addRoute` 在运行时动态添加路由。对于懒加载组件，还需要结合 `import()` 或 `defineAsyncComponent`（Vue）来实现，避免一次性加载所有页面。

此外，动态路由不仅仅是技术实现，还涉及安全性和用户体验。例如：

* 在前端动态路由实现时，不能只依赖前端的路由控制，还需要后端接口做权限校验，避免用户绕过前端访问受限页面。
* 路由结构最好和菜单、面包屑等导航组件解耦，通过统一的数据结构管理，保证后续扩展的灵活性。
* 在大规模项目中，动态路由还常与微前端、模块化加载结合，按需挂载子应用或子模块。

</details>

## 8. 如何通过bind或箭头函数固定this指向？ {#question-94fc6ad9-ce15-4a8a-babb-1836bec46903}

> 难度：2 · 类型：QA

### 题目要点

| 特点        | `bind`              | 箭头函数              |
| --------- | ------------------- | ----------------- |
| 绑定时机      | 调用 `bind` 时固定       | 定义时词法绑定           |
| 返回结果      | 返回一个新的函数            | 不生成新的 `this`      |
| 使用场景      | 需要显式传递 `this` 或预设参数 | 需要保持外层作用域的 `this` |
| 是否可作为构造函数 | 可以                  | 不可以               |

<details>
<summary>参考答案</summary>

## 一、问题背景

在 JavaScript 中，`this` 的指向不是在函数定义时确定的，而是 **在函数执行时，由调用方式决定**。
因此，很多情况下我们需要“固定”`this`，保证函数执行时内部的 `this` 始终指向期望的对象。

## 二、使用 **bind** 固定 `this`

`Function.prototype.bind` 会返回一个新的函数，**无论后续如何调用，内部的 `this` 都会固定为指定对象**。

### 示例

```js
const obj = {
  name: "Alice",
  sayHi: function() {
    console.log("Hi, I am " + this.name);
  }
};

const fn = obj.sayHi;
fn(); // 输出: Hi, I am undefined (this丢失)

const boundFn = obj.sayHi.bind(obj);
boundFn(); // 输出: Hi, I am Alice
```

### 特点

1. `bind` 返回一个新的函数，不会立即执行。
2. 绑定的 `this` 一旦确定，无法再被更改。
3. 还可以 **预设参数**，形成偏函数。

   ```js
   function add(a, b) {
     return a + b;
   }
   const add5 = add.bind(null, 5);
   console.log(add5(3)); // 8
   ```

---

## 三、使用 **箭头函数** 固定 `this`

箭头函数没有自己的 `this`，**它的 `this` 来自定义时所在的词法作用域**。

### 示例

```js
const obj = {
  name: "Alice",
  sayHi: function() {
    const inner = () => {
      console.log("Hi, I am " + this.name);
    };
    inner();
  }
};

obj.sayHi(); // 输出: Hi, I am Alice
```

### 特点

1. 箭头函数不会创建自己的 `this`，直接用外层函数的 `this`。
2. 不能用作构造函数（不能 `new`）。
3. 常用于 **回调函数** 或 **事件监听器**，避免丢失 `this`。

</details>

## 9. 以下代码输出什么？解释原因 {#question-a363afe0-ce04-4c69-8221-a0b8e01c9452}

> 难度：1 · 类型：QA

```js
const obj = {
  objName: "百度",
  print: () => console.log(this.objName),
};
obj.print();
```

### 题目要点

* 箭头函数没有自己的 `this`，它继承自定义时的上下文。
* 在对象中定义箭头函数作为方法时，`this` **不会指向该对象**，而是外层作用域。
* 因此这段代码输出 `undefined`，而不是 `"百度"`。

<details>
<summary>参考答案</summary>

这段代码的执行结果是：

```
undefined
```

### 原因解析

1. **箭头函数的 `this` 特性**

   * 箭头函数不会创建自己的 `this`，它的 `this` 来自 **词法作用域**，即它定义时所在的上下文。
   * 在这段代码里，`print` 是用箭头函数定义的，所以它的 `this` 不是 `obj`，而是定义它时所在的环境。

2. **当前环境的 `this`**

   * 这段代码运行在模块或脚本的顶层环境：

     * 在严格模式下，顶层的 `this` 是 `undefined`。
     * 在非严格模式下，顶层的 `this` 是 `window`（浏览器）或 `global`（Node.js）。
   * 不论是哪种情况，顶层对象上都没有 `objName` 属性，因此 `this.objName` 是 `undefined`。

3. **为什么不是 "百度"**

   * 如果把 `print` 定义为普通函数：

     ```js
     print: function() { console.log(this.objName); }
     ```

     那么调用 `obj.print()` 时，`this` 会绑定到 `obj`，输出就是 `"百度"`。
   * 但是箭头函数丢失了这种绑定特性，它固定死了 `this`，因此取不到 `obj` 上的 `objName`。

</details>

## 10. 如何用Promise.all实现并发请求？如何处理部分请求失败？ {#question-0326987e-7ab5-4fb7-8bf2-462860cda4e9}

> 难度：2 · 类型：QA

### 题目要点

* **只要全部成功才继续 → 用 `Promise.all`**
* **要拿到每个请求的完整结果（成功 + 失败） → 用 `Promise.allSettled`**
* **需要容错或兜底值 → 在每个 Promise 上加 catch**

<details>
<summary>参考答案</summary>

## 1. 用 `Promise.all` 实现并发请求

`Promise.all` 的特性是：**等待所有 Promise 全部成功，才会进入 `.then`；如果有一个失败，会立刻进入 `.catch`**。

例子：

```js
function fetchData(url) {
  return fetch(url).then(res => res.json());
}

Promise.all([
  fetchData('/api/user'),
  fetchData('/api/order'),
  fetchData('/api/message'),
]).then(([user, order, message]) => {
  console.log('全部成功:', user, order, message);
}).catch(error => {
  console.error('有请求失败:', error);
});
```

这样就能同时发起多个请求（并发），等结果全部回来再统一处理。

---

## 2. 如何处理 **部分请求失败**

### 方案 A: `Promise.allSettled`（推荐）

* 它不会短路，所有 Promise 都会执行完。
* 返回结果包含 `status: "fulfilled"` 或 `"rejected"`。

```js
Promise.allSettled([
  fetchData('/api/user'),
  fetchData('/api/order'),
  fetchData('/api/message'),
]).then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log('成功:', result.value);
    } else {
      console.error('失败:', result.reason);
    }
  });
});
```

这样就能做到“部分成功也能拿到”。

---

### 方案 B: 手动封装 catch，让 `Promise.all` 不被短路

给每个请求加上 `.catch`，保证它不会抛错，而是返回一个标记：

```js
function safeFetch(promise) {
  return promise
    .then(res => ({ status: 'fulfilled', value: res }))
    .catch(err => ({ status: 'rejected', reason: err }));
}

Promise.all([
  safeFetch(fetchData('/api/user')),
  safeFetch(fetchData('/api/order')),
  safeFetch(fetchData('/api/message')),
]).then(results => {
  console.log(results);
});
```

输出结构和 `allSettled` 一样，但可以兼容旧浏览器（没有 `allSettled` 的情况）。

---

### 方案 C: 按需兜底（部分失败时用默认值）

比如请求失败时，给个默认数据继续用：

```js
Promise.all([
  fetchData('/api/user').catch(() => ({ name: '游客' })),
  fetchData('/api/order').catch(() => []),
  fetchData('/api/message').catch(() => []),
]).then(([user, order, message]) => {
  console.log('即使失败也有默认值:', user, order, message);
});
```

</details>

## 11. 下面代码的输出是什么？ {#question-f9b514b7-0eaf-46c7-b76d-5346ad7e99e8}

> 难度：1 · 类型：QA

```js
const numbers = [1, 2, 3, 4, 5, 6];

numbers.forEach((num, index) => {
  if (num === 3) {
    console.log(`遇到数字 3，使用 return 跳过`);
    return;
  }
  if (num === 5) {
    console.log(`遇到数字 5，使用 return 跳过`);
    return;
  }
  console.log(`处理数字: ${num}, 索引: ${index}`);
});
```

### 题目要点

forEach 中的 return 只相当于 continue，不是 break

<details>
<summary>参考答案</summary>

```
处理数字: 1, 索引: 0
处理数字: 2, 索引: 1
遇到数字 3，使用 return 跳过
处理数字: 4, 索引: 3
遇到数字 5，使用 return 跳过
处理数字: 6, 索引: 5
```

在 JavaScript 的 forEach 方法中使用 return 语句不会终止循环，它只是跳过当前迭代，继续执行下一次迭代。

</details>

## 12. 函数的原型和对象的原型分别是什么？它们之间有何关联？结合代码进行说明。 {#question-e1378bae-d0ab-4272-b381-6fe399b7f751}

> 难度：2 · 类型：QA

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

## 13. JavaScript 中循环有哪些常见方法？它们在遍历不同数据结构时的适用情况如何？ {#question-3957051d-dad2-46df-86bf-3b48cedda28b}

> 难度：1 · 类型：QA

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

## 14. 如何避免setInterval可能导致的定时器堆积问题？ {#question-d6e29125-16c6-4b50-b41e-74d42c489c21}

> 难度：1 · 类型：QA

### 题目要点

1. **根本问题**：`setInterval` 固定周期触发，任务未完成时仍会排队，可能造成堆积。
2. **推荐做法**：

   * 优先使用递归 `setTimeout`，保证任务顺序执行；
   * 或在 `setInterval` 中加标志位判断，避免重叠。
3. **额外优化**：对动画类或 UI 更新类任务，用 `requestAnimationFrame` 代替固定定时器，提高渲染效率。

<details>
<summary>参考答案</summary>

`setInterval` 在 JavaScript 中按照固定时间间隔重复执行回调，但由于 JS 单线程机制，如果回调执行时间超过间隔，就会导致 **定时器堆积**（多个回调排队等待执行），产生性能问题或逻辑异常。

下面介绍几种避免方法：

---

## 一、使用递归 `setTimeout` 替代 `setInterval`

原理：**在回调执行完后再启动下一次定时器**，保证不会重叠。

```js
function doTask() {
  // 执行异步或耗时操作
  console.log('任务执行');

  // 完成后再递归调用
  setTimeout(doTask, 1000); // 1000ms 后再次执行
}

setTimeout(doTask, 1000);
```

特点：

* 每次间隔从上一次任务结束时开始计算，更安全；
* 可根据实际执行时间动态调整间隔。

---

## 二、在 `setInterval` 回调中加入执行状态判断

原理：**用一个标志位判断任务是否正在执行**，避免重叠。

```js
let isRunning = false;

const interval = setInterval(() => {
  if (isRunning) return; // 上一次还没完成，跳过

  isRunning = true;
  doAsyncTask().finally(() => {
    isRunning = false;
  });
}, 1000);
```

特点：

* 任务仍然按照固定间隔触发，但不会堆积回调；
* 对耗时异步任务尤为重要。

---

## 三、使用 `requestAnimationFrame`（针对动画或 UI 刷新）

* 对于与渲染相关的循环任务，推荐 `requestAnimationFrame` 替代 `setInterval`，保证任务与浏览器渲染同步，避免不必要的重复调用。

```js
function animate() {
  // 更新动画逻辑
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

</details>

## 15. 使用 const 定义函数和直接用 function 声明有什么区别？ {#question-6a50cd3e-1ae3-4955-8288-646ca7eac360}

> 难度：2 · 类型：QA

### 题目要点

| 特性                       | `const` 定义函数                | `function` 声明                |
|----------------------------|---------------------------------|--------------------------------|
| 提升 (Hoisting)            | 不提升                         | 提升                          |
| 作用域                     | 块级作用域                     | 当前作用域                     |
| 是否支持箭头函数            | 支持                           | 不支持                        |
| `this` 绑定                | 静态绑定（若为箭头函数）         | 动态绑定                      |
| 是否可以重新赋值            | 不可以                         | 无重新赋值概念                 |

* 用const声明函数时，你可以避免函数被重新赋值，代码的可维护性会更高，特别是当你不希望函数被意外重写时，const更加安全。
* 用function声明函数时，你可以享受函数提升的好处，使代码看起来更灵活，适合在任何位置调用函数。

<details>
<summary>参考答案</summary>

### **1. 定义方式**
#### `const` 定义函数
- 是通过**函数表达式**来定义的。
- 函数本身是一个**变量**，且绑定在 `const` 定义的变量上，不能重新赋值。
- 示例：
  ```javascript
  const myFunction = function() {
      console.log("Hello!");
  };

  // 或使用箭头函数
  const myArrowFunction = () => {
      console.log("Hello from arrow function!");
  };
  ```

#### `function` 声明函数
- 是通过**函数声明**来定义的。
- 函数会在**定义时就绑定到作用域**，并且有函数名。
- 示例：
  ```javascript
  function myFunction() {
      console.log("Hello!");
  }
  ```

---

### **2. 提升行为 (Hoisting)**

#### `function` 声明
- **函数声明会被提升**到作用域的顶部。这意味着你可以在声明之前调用该函数。
- 示例：
  ```javascript
  myFunction(); // 输出: "Hello!"

  function myFunction() {
      console.log("Hello!");
  }
  ```

#### `const` 定义函数
- **函数表达式不会被提升**，变量 `const` 会被提升但不会初始化。这意味着在定义之前调用会抛出 `ReferenceError`。
- 示例：
  ```javascript
  myFunction(); // 抛出 ReferenceError: Cannot access 'myFunction' before initialization

  const myFunction = function() {
      console.log("Hello!");
  };
  ```

---

### **3. 作用域绑定**

#### `function` 声明
- 函数声明会绑定到当前的作用域，并且在全局作用域下，它会绑定到 `window` 对象（非严格模式）。

#### `const` 定义函数
- 函数表达式绑定在块级作用域中，而不是全局作用域。
- 示例：
  ```javascript
  {
      const myFunction = function() {
          console.log("Inside block!");
      };
      myFunction(); // 可以正常调用
  }
  myFunction(); // 抛出 ReferenceError: myFunction is not defined
  ```

---

### **4. 是否可以重新赋值**

#### `const` 定义函数
- 使用 `const` 定义的函数是一个不可重新赋值的常量。
- 示例：
  ```javascript
  const myFunction = function() {
      console.log("Hello!");
  };
  myFunction = () => console.log("New function!"); // 抛出 TypeError: Assignment to constant variable.
  ```

#### `function` 声明
- 函数声明本身没有重新赋值的概念，函数名是固定的。

---

### **5. 箭头函数支持**
- `const` 可以结合箭头函数定义，创建更简洁的函数表达方式。
- 示例：
  ```javascript
  const myArrowFunction = () => console.log("Hello, Arrow!");
  ```

- 而 `function` 声明是传统函数的定义形式，不支持箭头函数。

---

### **6. this 绑定的行为**

#### `function` 声明
- `function` 声明使用的是传统的 `this` 绑定规则，`this` 的值取决于函数的调用方式（动态绑定）。
- 示例：
  ```javascript
  function myFunction() {
      console.log(this);
  }
  myFunction(); // 在全局环境中调用，this 指向全局对象（严格模式下是 undefined）。
  ```

#### `const` 和箭头函数
- 如果使用 `const` 定义箭头函数，则 `this` 是静态绑定到定义该函数的作用域。
- 示例：
  ```javascript
  const myArrowFunction = () => {
      console.log(this);
  };
  myArrowFunction(); // this 指向定义时的环境
  ```

</details>

## 16. 说说你对高阶函数的理解 {#question-c5e64dfd-ab08-4fbc-9970-31772fe1d8ee}

> 难度：2.5 · 类型：QA

### 题目要点

高阶函数是 JavaScript 中重要的函数式编程工具，允许接收或返回函数，使得代码更简洁、模块化，且更具扩展性。在实际开发中，灵活运用高阶函数，可以显著提升代码的可读性和复用性。

<details>
<summary>参考答案</summary>

高阶函数（Higher-Order Function）是指**接受函数作为参数或返回一个函数作为结果**的函数。它是 JavaScript 函数式编程的核心概念之一，常见的高阶函数有 `map`、`filter`、`reduce`、`forEach` 等。<br>

### 高阶函数的特点
1. **接受函数作为参数**：高阶函数可以将其他函数作为参数传入，允许对行为进行参数化。
2. **返回一个函数作为结果**：高阶函数可以生成并返回新的函数，使得代码更加灵活和模块化。

### 常见的高阶函数示例

1. **数组的 map、filter、reduce**
   - `map`：接收一个回调函数，将回调函数应用到数组的每个元素上，返回新数组。
   - `filter`：接收一个回调函数，筛选符合条件的元素，返回新数组。
   - `reduce`：接收一个回调函数，将数组元素逐步累计到一个结果中，返回最终结果。

   ```javascript
   const numbers = [1, 2, 3, 4];
   const doubled = numbers.map(num => num * 2);    // [2, 4, 6, 8]
   const evens = numbers.filter(num => num % 2 === 0); // [2, 4]
   const sum = numbers.reduce((total, num) => total + num, 0); // 10
   ```

2. **函数柯里化（Currying）**
   - 通过返回一个新的函数，将参数拆分为多个独立调用的函数。

   ```javascript
   function add(x) {
       return function(y) {
           return x + y;
       }
   }
   const add5 = add(5);   // add5 是一个新函数
   console.log(add5(3));  // 8
   ```

3. **函数组合**
   - 组合多个函数，将一个函数的输出作为下一个函数的输入。

   ```javascript
   function compose(f, g) {
       return function(x) {
           return f(g(x));
       }
   }
   const addOne = x => x + 1;
   const square = x => x * x;
   const addOneThenSquare = compose(square, addOne);
   console.log(addOneThenSquare(2)); // 9
   ```

### 高阶函数的优势
1. **代码简洁**：通过复用高阶函数，可以减少冗余代码，提升可读性。
2. **扩展性强**：高阶函数可以轻松地扩展函数的功能，允许动态改变函数的行为。
3. **灵活性**：高阶函数可以动态生成新函数，提升函数的灵活性，适用于不同场景。

</details>

## 17. JS中本地对象、内置对象、宿主对象分别是什么，有什么区别？ {#question-58f33dfb-be76-4251-ad48-d661d65c4b28}

> 难度：1.5 · 类型：QA

### 题目要点

- **本地对象**是语言内置的基本构造对象，**内置对象**是本地对象的一部分，提供特定的功能，而**宿主对象**则是由环境提供的对象，通常用于与外部环境交互。三者各自的作用和使用场景有所不同。

<details>
<summary>参考答案</summary>

在 JavaScript 中，本地对象、内置对象和宿主对象的定义和区别如下：

### **1. 本地对象（Native Objects）**

- **定义**：本地对象是由 JavaScript 语言本身提供的对象，不依赖于任何外部环境。
- **例子**：`Object`、`Array`、`Function`、`Number`、`String`、`Boolean`、`RegExp` 等。
- **特点**：这些对象的构造函数和方法是 JavaScript 语言标准的一部分，能够在任何 JavaScript 环境中使用。

### **2. 内置对象（Built-in Objects）**

- **定义**：内置对象是本地对象的一部分，提供了标准的功能和方法，通常用来处理特定的数据类型或提供通用的功能。
- **例子**：`Math`、`JSON`、`Date`、`Promise` 等。
- **特点**：内置对象提供了用于特定任务的功能，比如数学计算、日期处理等，通常用于增强语言的功能。

### **3. 宿主对象（Host Objects）**

- **定义**：宿主对象是由宿主环境（如浏览器或 Node.js）提供的对象，通常用于与环境相关的功能。
- **例子**：在浏览器中，`window`、`document`、`XMLHttpRequest`、`console` 等；在 Node.js 中，`fs`、`http` 等模块。
- **特点**：宿主对象的实现和功能依赖于宿主环境，通常用于处理特定的环境交互。

## 用户贡献题目👏

贡献用户：**FlamingFall**

</details>

## 18. Js 中，有哪些方法可以退出循环 {#question-14482912-0586-436e-b1b9-4cf030c79faa}

> 难度：3 · 类型：QA

### 题目要点

- **`break`**：立即退出循环体。
- **`return`**：退出循环并返回函数的结果（适用于函数内）。
- **`throw`**：抛出异常，退出循环并转到异常处理部分（适用于错误处理）。

<details>
<summary>参考答案</summary>

一般使用以下几种方法退出循环：

### **1. `break`**

- **作用**：立即终止当前循环，跳出循环体并继续执行循环后的代码。
- **用法**：通常在循环内的条件判断中使用。
- **示例**：
  ```javascript
  for (let i = 0; i < 10; i++) {
    if (i === 5) {
      break; // 退出循环
    }
    console.log(i); // 输出 0, 1, 2, 3, 4
  }
  ```

### **2. `return`**

- **作用**：用于函数中，立即退出循环并返回函数的调用者。它不仅会退出循环，还会结束整个函数的执行。
- **用法**：适用于需要在函数中退出循环并返回值的情况。
- **示例**：
  ```javascript
  function findFirstNegative(nums) {
    for (let num of nums) {
      if (num < 0) {
        return num; // 退出循环并返回负数
      }
    }
    return null; // 如果没有负数，返回 null
  }

  console.log(findFirstNegative([1, 2, 3, -4, 5])); // 输出 -4
  ```

### **3. `throw`**

- **作用**：抛出一个异常，终止当前循环及其包含的函数，并跳转到异常处理代码块（`catch`）。
- **用法**：适用于需要通过异常机制退出循环并处理错误的情况。
- **示例**：
  ```javascript
  function processNumbers(numbers) {
    for (let num of numbers) {
      if (num < 0) {
        throw new Error('Negative number found'); // 退出循环并抛出错误
      }
      console.log(num);
    }
  }

  try {
    processNumbers([1, 2, 3, -4, 5]);
  } catch (e) {
    console.error(e.message); // 输出 'Negative number found'
  }
  ```

</details>

## 19. get 请求的参数是否能够使用数组？ {#question-b7e5c9a8-6756-4c79-9b75-a3cb680e12b4}

> 难度：2.5 · 类型：QA

### 题目要点

GET 请求中传递数组是可以实现的，但需要根据实际应用和后端处理的能力选择合适的方式。每种方式有其优缺点，选择时应考虑服务器端的解析能力、数据的复杂性及编码格式的可读性。

<details>
<summary>参考答案</summary>

GET 请求的参数可以使用数组。

虽然在 URL 查询字符串中直接表示数组略有复杂，但有几种常见的方式来实现数组的传递。以下是一些常见的处理数组参数的方法：

### 1. **使用重复的参数名**

最简单的方法是使用重复的参数名，每个数组元素作为一个独立的参数传递。例如，传递一个数组 `[1, 2, 3]` 可以表示为：

```
?numbers=1&numbers=2&numbers=3
```

这种方式常见于许多后端框架和库，它们能够解析这种格式的参数。

### 2. **使用方括号表示法**

在一些编程环境中，可以使用方括号表示法来传递数组，这种方式可以表示嵌套的数组和对象。例如：

```
?numbers[]=1&numbers[]=2&numbers[]=3
```

这种方式在 PHP 和 Ruby 等语言中非常常见，它们能够解析这样的查询字符串。

### 3. **使用逗号分隔的字符串**

另一种常见的方法是将数组元素用逗号或其他分隔符连接成一个字符串。例如：

```
?numbers=1,2,3
```

在服务器端，需要将这个字符串分隔开来以恢复原始数组。这种方式在 JavaScript 中也比较常见，尤其是当数组的顺序不需要保留时。

### 4. **使用 JSON 字符串**

在一些情况下，可以将数组序列化为 JSON 字符串进行传递。例如：

```
?numbers=%5B1%2C2%2C3%5D
```

这里的 `%5B`, `%2C`, 和 `%5D` 是 URL 编码形式的 `[`，`,` 和 `]`。在服务器端，需将 JSON 字符串解析回数组。

### **示例代码**

**前端示例：**

```javascript
// 使用重复的参数名
const array = [1, 2, 3];
const queryString = array.map(value => `numbers=${value}`).join('&');
const url = `https://example.com?${queryString}`;

// 使用方括号表示法
const queryStringBrackets = array.map(value => `numbers[]=${value}`).join('&');
const urlBrackets = `https://example.com?${queryStringBrackets}`;

// 使用逗号分隔的字符串
const queryStringComma = `numbers=${array.join(',')}`;
const urlComma = `https://example.com?${queryStringComma}`;

// 使用 JSON 字符串
const queryStringJSON = `numbers=${encodeURIComponent(JSON.stringify(array))}`;
const urlJSON = `https://example.com?${queryStringJSON}`;
```

**后端示例（Node.js Express）：**

```javascript
app.get('/', (req, res) => {
  // 使用重复的参数名
  const numbers = req.query.numbers; // [1, 2, 3] - 自动解析为数组

  // 使用方括号表示法
  const numbersBrackets = req.query['numbers[]']; // [1, 2, 3] - 自动解析为数组

  // 使用逗号分隔的字符串
  const numbersComma = req.query.numbers.split(','); // ['1', '2', '3'] - 需要转换为数字数组

  // 使用 JSON 字符串
  const numbersJSON = JSON.parse(req.query.numbers); // [1, 2, 3]
});
```

</details>

## 20. 说说你对 Promise 的了解？ {#question-d0fd3a52-1ddf-42b2-b9d8-f36fc885d237}

> 难度：2 · 类型：QA

### 题目要点

- **Promise** 用于处理异步操作，具有 `pending`、`fulfilled` 和 `rejected` 三种状态。
- **创建和使用**：通过 `new Promise()` 创建，使用 `.then()` 和 `.catch()` 处理结果和错误。
- **链式调用**：支持链式调用来处理多个异步操作。
- **静态方法**：提供了如 `Promise.all()`、`Promise.race()` 等用于处理多个 Promise 的方法。

<details>
<summary>参考答案</summary>

# Promise 对象

### 1、Promise 的含义
Promise 是异步编程的一种解决方案，比传统的解决方案 —— 回调函数和事件 —— 更合理和更强大。它由社区最早提出和实现， ES6 将其写进了语言标准，统一了用法，原生提供了Promise对象。

Promise对象有以下两个特点。<br>

**（ 1 ）对象的状态不受外界影响。**
Promise对象代表一个异步操作，**有三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled ）和Rejected（已失败）**。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是Promise这个名字的由来，它的英语意思就是 “ 承诺 ” ，表示其他手段无法改变。<br>

**（ 2 ）一旦状态改变，就不会再变，任何时候都可以得到这个结果。**
Promise对象的状态改变，**只有两种可能：从Pending变为Resolved和从Pending变为Rejected**。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果。就算改变已经发生了，你再对Promise对象添加回调函数，也会立即得到这个结果。这与事件（ Event ）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。<br>
有了Promise对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise对象提供统一的接口，使得控制异步操作更加容易。<br>
Promise也有一些缺点。首先，无法取消Promise，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise内部抛出的错误，不会反应到外部。第三，当处于Pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。<br>

### 2、基本用法

实例1：基本用法<br>
```javascript
    var promise = new Promise(function(resolve, reject) {
        // ... some code
        if (/*  异步操作成功 */){
            resolve(value);
        } else {
            reject(error);
        }
    });
```

实例2：只要一new Promise后就会立即执行。<br>
```javascript
    let promise = new Promise(function(resolve, reject) {
        console.log('Promise');
        resolve();
    });
    promise.then(function() {
        console.log('Resolved.');
    });
    console.log('Hi!');
    // Promise
    // Hi!
    // Resolved
```

实例3：下面是一个用 Promise 对象实现的 Ajax 操作的例子。（非常经典）<br>
```javascript
    var getJSON = function (url) {
        var promise = new Promise(function (resolve, reject) {
            var client = new XMLHttpRequest();
            client.open("GET", url);
            client.onreadystatechange = handler;
            client.responseType = "json";
            client.setRequestHeader("Accept", "application/json");
            client.send();

            function handler() {
                if (this.readyState !== 4) {
                    return;
                }
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error(this.statusText));
                }
            };
        });
        return promise;
    };

    getJSON("/posts.json").then(function (json) {
        console.log('Contents: ' + json);
    }, function (error) {
        console.error(' 出错了 ', error);
    });
```

### 3、Promise.prototype.then()

Promise 实例具有then方法，也就是说，then方法是定义在原型对象 Promise.prototype 上的。它的作用是为 Promise 实例添加状态改变时的回调函数。前面说过，then方法的第一个参数是 Resolved 状态的回调函数，第二个参数（可选）是 Rejected 状态的回调函数。<br>
then方法返回的是一个新的 Promise 实例（注意，不是原来那个 Promise 实例）。因此可以采用链式写法，即then方法后面再调用另一个then方法。<br>
```javascript
    getJSON("/posts.json").then(function(json) {
        return json.post;
    }).then(function(post) {
        // ...
    });
```

采用链式的then，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个 Promise 对象（即有异步操作），这时后一个回调函数，就会等待该 Promise 对象的状态发生变化，才会被调用。<br>
```javascript
    getJSON("/post/1.json").then(function (post) {
        return getJSON(post.commentURL);
    }).then(function funcA(comments) {
        console.log("Resolved: ", comments);
    }, function funcB(err) {
        console.log("Rejected: ", err);
    });
```

上面代码中，第一个then方法指定的回调函数，返回的是另一个 Promise 对象。这时，第二个then方法指定的回调函数，就会等待这个新的 Promise 对象状态发生变化。如果变为 Resolved ，就调用funcA，如果状态变为 Rejected ，就调用funcB。<br>

### 4、Promise.prototype.catch()<br>
Promise.prototype.catch方法是.then(null, rejection)的别名，用于指定发生错误时的回调函数。<br>
实例：<br>
```javascript
    getJSON("/posts.json").then(function (posts) {
        // ...
    }).catch(function (error) {
        //  处理 getJSON  和 前一个回调函数运行时发生的错误
        console.log(' 发生错误！ ', error);
    });
```

跟传统的try/catch代码块不同的是，如果没有使用catch方法指定错误处理的回调函数， Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。<br>
```javascript
    var someAsyncThing = function () {
        return new Promise(function (resolve, reject) {
        //  下面一行会报错，因为 x 没有声明
            resolve(x + 2);
        });
    };
    someAsyncThing().then(function () {
        console.log('everything is great');
    });
```

### 5、Promise.all()<br>
Promise.all方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。<br>
var p = Promise.all([p1, p2, p3]);<br>
上面代码中，Promise.all方法接受一个数组作为参数，p1、p2、p3都是 Promise 对象的实例。<br>

实例：<br>
```javascript
    Promise.all([checkLogin(),getUserInfo()]).then(([res1,res2])=>{
        console.log(`result1:${res1.result}, result2:${res2.userID}`)
    });
```

### 6、Promise.race()<br>
Promise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

### 7、Promise.resolve()<br>
有时需要将现有对象转为 Promise 对象，Promise.resolve方法就起到这个作用。<br>
```javascript
    var jsPromise = Promise.resolve($.ajax('/whatever.json'));
```

### 8、Promise.reject()<br>
Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected。它的参数用法与Promise.resolve方法完全一致。<br>

### 9、两个有用的附加方法<br>
ES6 的 Promise API 提供的方法不是很多，有些有用的方法可以自己部署。下面介绍如何部署两个不在 ES6 之中、但很有用的方法。<br>
#### 9.1、done()<br>
Promise 对象的回调链，不管以then方法或catch方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到（因为 Promise 内部的错误不会冒泡到全局）。因此，我们可以提供一个done方法，总是处于回调链的尾端，保证抛出任何可能出现的错误。<br>
```javascript
    asyncFunc()
        .then(f1)
        .catch(r1)
        .then(f2)
        .done();
```

#### 9.2、finally()<br>
finally方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。它与done方法的最大区别，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行。<br>
```javascript
    server.listen(0)
        .then(function () {
    // run test
        })
        .finally(server.stop);
```

### 10、Promise的使用<br>
使用 Generator 函数管理流程，遇到异步操作的时候，通常返回一个Promise对象。<br>
```javascript
    function getFoo() {
        return new Promise(function (resolve, reject) {
            resolve('foo');
        });
    }

    var g = function* () {
        try {
            var foo = yield getFoo();
            console.log(foo);
        } catch (e) {
            console.log(e);
        }
    };

    function run(generator) {
        var it = generator();

        function go(result) {
            if (result.done) return result.value;
            return result.value.then(function (value) {
                return go(it.next(value));
            }, function (error) {
                return go(it.throw(error));
            });
        }

        go(it.next());
    }

    run(g);
```

</details>

## 21. async/await 原理， 手写 async 函数？ {#question-abdeb82d-40b0-495f-9e06-093d1b74ea65}

> 难度：3 · 类型：QA

### 题目要点

- **`async/await`** 是 JavaScript 中处理异步操作的语法糖，使异步代码看起来更像同步代码。
- **`async` 函数** 总是返回一个 Promise，**`await`** 关键字用于等待 Promise 解析。
- **手写 `async` 函数** 需要模拟 Promise 的处理，并包装原函数以确保其返回 Promise 并处理错误。

<details>
<summary>参考答案</summary>

## async/await 的本质

async/await 是 ECMAScript 2017（ES8）中引入的一个语言特性，用于处理异步编程。async/await 实际上是对 Promise 的封装，通过让开发者以同步的方式编写异步代码，使得代码更加易读和易于维护。

async/await 是一种更加高级的异步编程方式，它使用了 Promise 作为底层实现，可以更好地处理异步编程中的错误和异常，避免了回调地狱和代码可读性差的问题。

## 手写 async/await 实现

async/await 的实现可以通过封装 Promise 和 Generator 函数来实现，下面是一个简单的手写实现示例：
```js
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function* generator() {
  console.log("start");
  yield delay(1000);
  console.log("after 1 second");
  yield delay(2000);
  console.log("after 2 more seconds");
}

function async(generatorFunc) {
  const iterator = generatorFunc();

  function handle(iteratorResult) {
    if (iteratorResult.done) {
      return Promise.resolve(iteratorResult.value);
    }

    return Promise.resolve(iteratorResult.value).then((res) => {
      return handle(iterator.next(res));
    });
  }

  return handle(iterator.next());
}

async(function () {
  return generator();
}).then(() => {
  console.log("all done");
});
```

</details>

## 22. 如何检测对象是否循环引用？ {#question-5ee52126-6153-4409-a930-a01d2d313605}

> 难度：3 · 类型：QA

例如下面的场景， 已经出现循环引用了， 如何检测？

```js
const foo = {
  foo: "Foo",
  bar: {
    bar: "Bar",
  },
};

foo.bar.baz = foo; // 循环引用！
```

### 题目要点

- **`Set`** 和 **`WeakMap`** 是比较通用和有效的方法，通过跟踪已经访问过的对象来检测循环引用。
- **JSON 序列化** 方法简单直观，但可能会丢失部分信息，且对于深度嵌套的对象不太适用。
- **手动跟踪引用** 方法灵活，但实现复杂度较高。

<details>
<summary>参考答案</summary>

检测对象是否循环引用通常是为了防止无限递归，特别是在处理 JSON 序列化、深拷贝或图遍历时。以下是几种常见的检测对象是否循环引用的方法：

### **1. 使用 `Set` 进行检测**

一种常见的方法是使用 `Set` 数据结构来跟踪已经访问过的对象。如果在遍历对象时发现某个对象已经在 `Set` 中存在，就可以确定存在循环引用。

**示例代码**：

```javascript
function hasCircularReference(obj) {
  const seen = new Set();

  function detect(obj) {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) {
        return true; // 循环引用
      }
      seen.add(obj);
      for (const key of Object.keys(obj)) {
        if (detect(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }

  return detect(obj);
}

// 测试循环引用
const a = {};
const b = { a };
a.b = b;

console.log(hasCircularReference(a)); // 输出：true
```

### **2. 使用 `WeakMap` 进行检测**

`WeakMap` 也可以用来检测循环引用，它与 `Set` 类似，但使用 `WeakMap` 可以避免内存泄漏，因为 `WeakMap` 的键是弱引用的。

**示例代码**：

```javascript
function hasCircularReference(obj) {
  const seen = new WeakMap();

  function detect(obj) {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) {
        return true; // 循环引用
      }
      seen.set(obj, true);
      for (const key of Object.keys(obj)) {
        if (detect(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }

  return detect(obj);
}

// 测试循环引用
const a = {};
const b = { a };
a.b = b;

console.log(hasCircularReference(a)); // 输出：true
```

### **3. 使用 JSON 序列化**

一种简单的检测方法是尝试将对象序列化为 JSON 字符串，如果对象中存在循环引用，则会抛出错误。这种方法的缺点是会丢失对象中无法序列化的部分。

**示例代码**：

```javascript
function isCircular(obj) {
  try {
    JSON.stringify(obj);
    return false;
  } catch (e) {
    return true;
  }
}

// 测试循环引用
const a = {};
const b = { a };
a.b = b;

console.log(isCircular(a)); // 输出：true
```

### **4. 手动跟踪引用**

你可以在遍历对象时手动维护一个引用列表，在遍历过程中检测到已经访问过的对象即可判定是否存在循环引用。这种方法通常较为复杂，但也可以实现。

</details>

## 23. postMessage 是如何解决跨域问题的？ {#question-6843e240-9534-4371-8b64-ba76b4aa8ed4}

> 难度：2 · 类型：QA

### 题目要点

`postMessage` 通过允许跨源通信，解决了传统的同源策略限制跨域问题的问题。它提供了一种安全、灵活的方式来在不同源的窗口之间交换数据。确保在使用 `postMessage` 时正确验证消息的来源和内容，可以有效地防止潜在的安全问题。

<details>
<summary>参考答案</summary>

`postMessage` 是一种在不同源（域）之间进行安全通信的机制，可以解决跨域问题。以下是 `postMessage` 解决跨域问题的原理及其使用方式：

### **1. 原理**

**`postMessage` 方法** 允许跨源通信，即使这些源在不同的域名、协议或端口下。这是通过以下方式实现的：

- **安全性**：`postMessage` 允许页面向另一个窗口（如 iframe、弹出窗口或另一个 tab）发送消息，而不管它们是否同源。消息的传递过程中，接收方可以验证消息的来源和内容，从而确保通信的安全。
- **目标窗口**：通过 `postMessage` 发送的消息可以指定目标窗口，通过其 `origin`（源）进行安全检查。接收方在接收消息时，可以检查 `origin` 属性来验证消息的来源。

### **2. 使用 `postMessage` 的步骤**

**1. 发送消息**

使用 `postMessage` 方法可以向目标窗口发送消息。消息可以是任何数据类型，如字符串、对象等。

**示例代码**：

```javascript
// 在发送消息的窗口中
const targetWindow = document.getElementById('myFrame').contentWindow;
const message = { type: 'greeting', text: 'Hello from parent' };

// 发送消息，指定目标窗口的 origin
targetWindow.postMessage(message, 'https://example.com');
```

**2. 接收消息**

在接收消息的窗口中，需要设置事件监听器来接收和处理消息。`message` 事件对象包含了消息的内容、来源和其他信息。

**示例代码**：

```javascript
// 在接收消息的窗口中
window.addEventListener('message', (event) => {
  // 检查消息的来源
  if (event.origin !== 'https://example.com') {
    return; // 忽略来自不可信源的消息
  }

  // 处理接收到的消息
  console.log('Message received:', event.data);
});
```

### **3. 安全注意事项**

- **检查 `origin`**：接收消息时，始终检查 `event.origin` 以确保消息来自可信源。
- **验证消息内容**：在处理消息时，验证消息的内容和结构，防止恶意数据造成问题。
- **限制目标窗口**：发送消息时，尽量指定精确的目标源，而不是使用 `*`，以提高安全性。

</details>

## 24. js 对象可以使用 for...of 迭代吗？ {#question-ee207d9a-ac6d-44dd-a8fc-e180fd37be36}

> 难度：1.5 · 类型：QA

### 题目要点

普通的 JavaScript 对象（`{}`）默认不支持 `for...of` 迭代。如果你需要使对象可迭代，你可以通过实现 `Symbol.iterator` 方法来创建自定义的迭代器。对于简单的对象键值对的迭代，可以使用 `Object.keys()`, `Object.values()`, 和 `Object.entries()` 方法。

<details>
<summary>参考答案</summary>

JavaScript **对象本身并不能直接使用 for...of 迭代**，因为它并不是一个可迭代对象（iterable）。

但是，如果我们想要遍历对象的属性，可以使用 for...in 循环，例如：
```js
const obj = {
  name: 'John',
  age: 30,
  city: 'New York'
};

for (let prop in obj) {
  console.log(prop + ': ' + obj[prop]);
}

// 这段代码可以输出：
name: John
age: 30
city: New York
```

需要注意的是，for...in 循环会遍历对象自身的所有可枚举属性，包括非数字键和继承的属性。如果只想遍历对象自身的属性，可以使用 hasOwnProperty() 方法进行判断，例如：
```js
const obj = {
  name: 'John',
  age: 30,
  city: 'New York'
};

for (let prop in obj) {
  if (obj.hasOwnProperty(prop)) {
    console.log(prop + ': ' + obj[prop]);
  }
}
```

这段代码和上面的代码功能是一样的，但是多了一个 hasOwnProperty() 判断，可以确保只输出对象自身的属性。

</details>

## 25. 解释一下原型、构造函数、实例、原型链 之间的关系？ {#question-818064e8-137a-4499-81f5-554f4890fb55}

> 难度：2 · 类型：QA

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

## 26. JS 内存泄露的问题该如何排查？ {#question-64279d15-4a32-42a1-809a-6e35d59c6e62}

> 难度：3.5 · 类型：QA

### 题目要点

- **检查快照**：使用开发者工具生成和分析内存快照。
- **监视分配**：跟踪内存分配情况，识别异常。
- **使用工具**：利用第三方工具和扩展进行深入分析。

<details>
<summary>参考答案</summary>

### **1. 了解常见的内存泄露类型**

- **全局变量**：未声明的变量被添加到全局作用域。
- **闭包**：长时间持有对外部作用域的引用。
- **事件监听器**：未正确移除的事件监听器。
- **定时器**：未清除的 `setInterval` 或 `setTimeout`。
- **DOM 引用**：移除 DOM 元素后仍有对其的引用。

### **2. 使用开发者工具进行排查**

**Chrome DevTools** 提供了内存分析工具，可以帮助检测和修复内存泄露问题。

**步骤**：

1. **检查内存快照**：
   - 打开 Chrome DevTools，转到 "Memory" 面板。
   - 使用 "Heap Snapshot" 生成内存快照，比较不同时间点的快照找出持续增长的对象。

2. **分析快照**：
   - 查找未释放的内存对象，特别是意外增长的数组、对象等。
   - 查看 DOM 节点和 JavaScript 对象的引用链，识别意外的引用保留。

3. **监视内存分配**：
   - 使用 "Allocation Timeline" 记录内存分配情况，观察是否存在不断增长的内存分配。

4. **使用“Find Leaks”工具**：
   - 在 "Memory" 面板中，使用 "Heap Snapshot" 功能找到泄露的对象并分析其引用链。

### **4. 使用第三方工具**

- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)**：用于性能分析和内存泄露检测。

</details>

## 27. 说说 axios 的拦截器原理及应用，并简单手写核心逻辑 {#question-b62ecffe-ff0d-4f65-8ea7-884ef5b8ddff}

> 难度：2 · 类型：QA

### 题目要点

`Axios` 拦截器的原理是通过在请求和响应的过程中插入自定义的处理逻辑来实现全局的处理和修改。通过注册拦截器，可以在请求发送之前或响应到达之后对数据进行处理，提供了强大的灵活性和可扩展性。

<details>
<summary>参考答案</summary>

`Axios` 的拦截器（interceptors）允许你在请求或响应被处理之前，进行一些自定义的处理或修改。拦截器提供了一个强大的机制来对请求和响应进行全局处理，比如添加认证信息、处理错误、或修改请求数据等。

### **1. 拦截器原理**

1. **请求拦截器**：在请求发送到服务器之前，可以对请求进行修改、添加头信息、处理请求数据等。
2. **响应拦截器**：在接收到响应数据之前，可以对响应数据进行修改或处理错误。

### **2. 拦截器应用**

**常见应用场景**：

- **请求拦截器**：
  - 添加认证令牌（Token）到请求头。
  - 对请求数据进行统一的格式化或加密。

- **响应拦截器**：
  - 统一处理错误码或异常情况。
  - 对响应数据进行统一的格式化或解密。

### **3. 简单手写核心逻辑**

手写核心逻辑可以帮助理解拦截器的基本实现原理。以下是一个简化的 `Axios` 拦截器的实现：

#### **简化 Axios 实现**

```javascript
class SimpleAxios {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // 添加请求拦截器
  useRequestInterceptor(fn) {
    this.requestInterceptors.push(fn);
  }

  // 添加响应拦截器
  useResponseInterceptor(fn) {
    this.responseInterceptors.push(fn);
  }

  // 发送请求
  async request(config) {
    // 执行请求拦截器
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    // 模拟发送请求
    let response = await this._sendRequest(config);

    // 执行响应拦截器
    for (const interceptor of this.responseInterceptors) {
      response = interceptor(response);
    }

    return response;
  }

  // 模拟请求发送
  async _sendRequest(config) {
    // 这里模拟返回一个响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: 'response data', config });
      }, 1000);
    });
  }
}

// 使用示例
const axios = new SimpleAxios();

// 添加请求拦截器
axios.useRequestInterceptor(config => {
  console.log('Request Interceptor:', config);
  config.headers = { Authorization: 'Bearer token' };
  return config;
});

// 添加响应拦截器
axios.useResponseInterceptor(response => {
  console.log('Response Interceptor:', response);
  response.data = `Processed: ${response.data}`;
  return response;
});

// 发送请求
axios.request({ url: '/api/data', method: 'GET' })
  .then(response => {
    console.log('Response:', response);
  });
```

### **4. 解释**

- **`SimpleAxios` 类**：模拟了 `Axios` 的核心功能，包括请求和响应拦截器的添加及处理。
- **`useRequestInterceptor` 和 `useResponseInterceptor`**：用于注册请求和响应拦截器。
- **`request` 方法**：在发送请求之前和之后分别执行请求和响应拦截器。
- **`_sendRequest` 方法**：模拟发送请求并返回响应。

</details>

## 28. WebWorker、SharedWorker 和 ServiceWorker 有哪些区别？ {#question-f18218c8-4c74-4631-b66d-e7ac65929f35}

> 难度：2 · 类型：QA

### 题目要点

- **WebWorker**：用于在后台线程执行 JavaScript 代码，适用于计算密集型任务。生命周期与页面关联。
- **SharedWorker**：允许多个页面或 iframe 共享一个 Worker 实例，适用于跨页面共享数据。生命周期与浏览器会话关联。
- **ServiceWorker**：用于拦截网络请求、缓存资源、实现离线功能等，适用于增强 Web 应用的离线体验和推送功能。生命周期与页面无关。

<details>
<summary>参考答案</summary>

`WebWorker`、`SharedWorker` 和 `ServiceWorker` 都是 Web API 提供的用于在后台线程执行 JavaScript 代码的机制，但它们有不同的用途和特性。下面是它们的主要区别：

### **1. WebWorker**

- **作用**：用于在后台线程中执行 JavaScript 代码，避免阻塞主线程（UI线程）。
- **生命周期**：与页面的生命周期关联，当页面关闭时，WebWorker 也会终止。
- **通信**：通过 `postMessage` 和 `onmessage` 进行通信，只能与创建它的页面进行通信，不能与其他页面或 Worker 进行直接通信。
- **共享数据**：不能直接与其他 WebWorkers 或页面共享数据。
- **应用场景**：适用于需要在后台执行计算密集型任务的场景，如数据处理、图像处理等。

**示例**：
```javascript
// main.js
const worker = new Worker('worker.js');
worker.postMessage('Hello, worker!');
worker.onmessage = (event) => console.log(event.data);

// worker.js
self.onmessage = (event) => {
  self.postMessage(`Received: ${event.data}`);
};
```

### **2. SharedWorker**

- **作用**：允许多个浏览器上下文（如不同的页面或 iframe）共享一个 Worker 实例。
- **生命周期**：与浏览器会话关联，不会随页面关闭而销毁，只要有一个页面或 iframe 仍在使用 SharedWorker，它就会保持活跃。
- **通信**：通过 `postMessage` 和 `onmessage` 进行通信，但可以在不同的页面或 iframe 之间进行通信。
- **共享数据**：可以在多个页面或 iframe 之间共享数据。
- **应用场景**：适用于需要在多个页面或 iframe 之间共享数据或状态的场景，如实时应用、共享缓存等。

**示例**：
```javascript
// main1.js
const worker = new SharedWorker('shared-worker.js');
worker.port.postMessage('Hello from page 1!');
worker.port.onmessage = (event) => console.log(event.data);

// main2.js
const worker = new SharedWorker('shared-worker.js');
worker.port.postMessage('Hello from page 2!');
worker.port.onmessage = (event) => console.log(event.data);

// shared-worker.js
self.onconnect = (event) => {
  const port = event.ports[0];
  port.onmessage = (event) => {
    port.postMessage(`Received: ${event.data}`);
  };
};
```

### **3. ServiceWorker**

- **作用**：主要用于拦截和处理网络请求，缓存资源，实现离线功能和推送通知等功能。
- **生命周期**：与页面的生命周期无关，可以在后台长时间运行，不会随页面的关闭而结束。可以在浏览器关闭时继续运行，用于处理推送通知等。
- **通信**：通过 `postMessage` 和 `onmessage` 与页面进行通信，但不能直接访问 DOM。
- **共享数据**：通过缓存机制（Cache API）和 IndexedDB 进行数据存储和共享。
- **应用场景**：适用于实现离线支持、缓存优化、后台同步、推送通知等功能。

**示例**：
```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/script/main.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

</details>

## 29. js 中对于超过 Number 最大值的数怎么处理？ {#question-de043b5a-d621-4278-abb8-b467310306a9}

> 难度：1.5 · 类型：QA

### 题目要点

- **`Infinity`**：表示超过最大值的数。
- **`BigInt`**：用于处理超大整数值。
- **字符串表示法**：用于表示和操作极大数值。
- **大数库**：提供更强大和精确的数值计算能力。

<details>
<summary>参考答案</summary>

在 JavaScript 中，`Number` 类型的最大值为 `Number.MAX_VALUE`。当计算结果超过这个最大值时，会出现以下情况：

### **1. 使用 `Infinity`**

- **描述**：当计算结果超出 `Number.MAX_VALUE`，JavaScript 会返回 `Infinity`。
- **示例**：
  ```javascript
  const largeNumber = Number.MAX_VALUE * 2; // 结果是 Infinity
  console.log(largeNumber); // Infinity
  ```

### **2. 使用 `BigInt`**

- **描述**：`BigInt` 是一种新的原生数据类型，可以表示任意精度的整数。适用于处理超出 `Number` 最大值的数值。
- **使用方法**：
  ```javascript
  const bigNumber = BigInt("123456789012345678901234567890");
  console.log(bigNumber); // 123456789012345678901234567890n
  ```

- **与 `Number` 的区别**：
  - `BigInt` 可以表示比 `Number` 更大的整数值，但不支持小数。
  - `BigInt` 与 `Number` 类型在操作和比较时需注意不同，`BigInt` 与 `Number` 不能直接进行算术运算。

### **3. 使用字符串表示法**

- **描述**：当处理极大的数值时，可以使用字符串来表示和操作这些数值，避免直接计算。
- **示例**：
  ```javascript
  const bigNumberStr = "123456789012345678901234567890";
  // 使用自定义函数或库来进行大数运算
  ```

### **4. 使用专门的大数库**

- **描述**：有一些 JavaScript 库专门用于处理大数运算，比如 `bignumber.js`、`decimal.js`。
- **示例**：
  ```javascript
  const BigNumber = require('bignumber.js');
  const largeNumber = new BigNumber('123456789012345678901234567890');
  console.log(largeNumber.toString()); // 123456789012345678901234567890
  ```

</details>

## 30. 全局作用域中，用 const 和 let 声明的变量不在 window 上，那到底在哪里？如何去获取？ {#question-1ac5429e-8c75-4ed0-be82-54404bcf4ca6}

> 难度：2 · 类型：QA

### 题目要点

- `const` 和 `let` 声明的变量在全局作用域中是块级作用域的，不会直接成为 `window` 对象的属性。
- 可以在声明它们的作用域内直接访问这些变量，但不能通过 `window` 对象来访问。
- 使用 `globalThis` 可以访问全局对象，但 `const` 和 `let` 变量不会显示在其中。

<details>
<summary>参考答案</summary>

在 JavaScript 中，`const` 和 `let` 声明的变量不直接添加到全局 `window` 对象上，这与 `var` 声明的变量不同。下面是对 `const` 和 `let` 的详细解释，以及如何访问这些变量的说明：

### **`const` 和 `let` 的声明和作用域**

1. **作用域**：
   - `const` 和 `let` 的作用域是块级作用域（block scope），意味着它们的作用范围是被它们声明的代码块（例如函数、循环或条件语句）内。

2. **全局作用域**：
   - 当 `const` 或 `let` 在全局作用域中声明时，它们不会成为 `window` 对象的属性。这与 `var` 不同，`var` 声明的变量会自动成为全局 `window` 对象的属性。

### **如何访问全局作用域中的 `const` 和 `let` 变量**

虽然 `const` 和 `let` 变量不直接在 `window` 对象上，但它们仍然存在于全局作用域中。访问这些变量的方法有：

1. **在同一作用域内直接访问**：
   - 在全局作用域中，可以直接访问这些变量：
     ```javascript
     let globalLet = 'Hello, world!';
     const globalConst = 42;

     console.log(globalLet);   // 输出: 'Hello, world!'
     console.log(globalConst); // 输出: 42
     ```

2. **使用 `globalThis`**：
   - 在现代 JavaScript 环境中，可以使用 `globalThis` 来访问全局对象。在浏览器环境中，`globalThis` 指向 `window` 对象；在 Node.js 环境中，`globalThis` 指向 `global` 对象。对于 `const` 和 `let` 变量，它们不会出现在 `globalThis` 上。

3. **`eval`（不推荐使用）**：
   - 在特定情况下，可以使用 `eval` 来访问全局作用域中的变量：
     ```javascript
     let globalLet = 'Hello, world!';
     const globalConst = 42;

     console.log(eval('globalLet'));   // 输出: 'Hello, world!'
     console.log(eval('globalConst')); // 输出: 42
     ```
   - 注意：`eval` 存在安全性和性能问题，一般不推荐使用。

### **为什么 `const` 和 `let` 不在 `window` 上？**

- **设计考虑**：
  - `const` 和 `let` 的设计目标是提供更严格的作用域控制和避免全局变量污染。为了减少意外的全局变量污染，它们不自动添加到 `window` 对象上。

- **全局对象的隔离**：
  - 通过不将 `const` 和 `let` 声明的变量添加到 `window` 对象，JavaScript 语言保证了全局作用域的变量不会被无意中修改。这有助于避免由于全局变量污染造成的潜在冲突和错误。

</details>

## 31. [3, 15, 8, 29, 102, 22].sort()，结果是多少，为什么？ {#question-5102cc7e-824a-4ecb-bcab-e04a5f32d522}

> 难度：0.5 · 类型：QA

### 题目要点

对于数组 `[3, 15, 8, 29, 102, 22]` 使用 `.sort()` 方法，结果是 ` [102, 15, 22, 29, 3, 8]`。

<details>
<summary>参考答案</summary>

对于数组 `[3, 15, 8, 29, 102, 22]` 使用 `.sort()` 方法，结果是 ` [102, 15, 22, 29, 3, 8]`。

### **原因**：

`Array.prototype.sort()` 方法默认是按字典顺序（即字符串的顺序）对数组元素进行排序的。它会将数组中的元素转换为字符串，然后按字典顺序比较这些字符串。

在这个例子中，排序过程如下：

1. **转换为字符串**：
   - `3` -> `"3"`
   - `15` -> `"15"`
   - `8` -> `"8"`
   - `29` -> `"29"`
   - `102` -> `"102"`
   - `22` -> `"22"`

2. **按字典顺序比较字符串**：
   - `"102"` > `"15"`
   - `"15"` > `"22"`
   - `"22"` > `"29"`
   - `"29"` > `"3"`
   - `"3"` > `"8"`

因此，排序后的结果是 `[102, 15, 22, 29, 3, 8]`。如果要按数值排序，需要传递一个比较函数给 `.sort()`，例如：

```javascript
[3, 15, 8, 29, 102, 22].sort((a, b) => a - b);
```

这将返回 `[3, 8, 15, 22, 29, 102]`。

</details>

## 32. 箭头函数为何不能作为构造函数使用？ {#question-82939890-c1de-45f8-b27d-b2675d58763e}

> 难度：1 · 类型：QA

### 题目要点

在箭头函数中，`this`指向的是定义时所在的对象，而不是使用时所在的对象。换句话说，**箭头函数没有自己的this，而是继承父作用域中的this**。

<details>
<summary>参考答案</summary>

在箭头函数中，`this`指向的是定义时所在的对象，而不是使用时所在的对象。换句话说，**箭头函数没有自己的this，而是继承父作用域中的this**。

看个例子:

```javascript
var person = {
  name:'张三',
  age:18,
  getName:function(){
     console.log('我的名字是：'+this.name)
  },
  getAge:()=>{
     console.log('我的年龄是：'+this.age)
  }
}

person.getName() // 我的名字是张三
person.getAge()  // 我的年龄是undefined

```

`person.getName()`中`this`指向函数的调用者，也就是`person`实例，因此`this.name = "张三"`。

`getAge()`通过箭头函数定义，而箭头函数是没有自己的`this`，会继承父作用域的`this`，因此`person.getAge()`执行时，此时的作用域指向`window`，而`window`没有定义`age`属性，所有报`undefined`。

从例子可以得出：**对象中定义的函数使用箭头函数是不合适的**。

**先解答下标题问题，为啥箭头函数不能作为构造函数？**

```javascript
// 构造函数生成实例的过程
function Person(name,age){
  this.name = name
  this.age = age
}
var p = new Person('张三',18)

//new关键字生成实例过程如下
// 1. 创建空对象p
var p = {}
// 2. 将空对象p的原型链指向构造器Person的原型
p.__proto__ = Person.prototype
// 3. 将Person()函数中的this指向p
// 若此处Person为箭头函数，而没有自己的this，call()函数无法改变箭头函数的指向，也就无法指向p。
Person.call(p)

```

构造函数是通过new关键字来生成对象实例，生成对象实例的过程也是通过构造函数给实例绑定this的过程，而箭头函数没有自己的this。创建对象过程，`new` 首先会创建一个空对象，并将这个空对象的`__proto__`指向构造函数的`prototype`，从而继承原型上的方法，但是箭头函数没有`prototype`。因此不能使用箭头作为构造函数，也就不能通过new操作符来调用箭头函数。

</details>

## 33. 对象取值中 a.b.c.d 和 a['b']['c']['d'] 有何区别？ {#question-ecfdaa1a-2747-4fc1-8b33-6bd338c84097}

> 难度：1 · 类型：QA

### 题目要点

在 JavaScript 中，对象的取值可以使用两种方式，即使用点号（.）和使用方括号（\[\]）。对于对象的多层嵌套属性，可以使用两种方式分别取值，例如：

<details>
<summary>参考答案</summary>

### 使用区别

在 JavaScript 中，对象的取值可以使用两种方式，即使用点号（.）和使用方括号（\[\]）。对于对象的多层嵌套属性，可以使用两种方式分别取值，例如：

```css
cssCopy codevar obj = {a: {b: {c: {d: 123}}}};
var d1 = obj.a.b.c.d;
var d2 = obj['a']['b']['c']['d'];
```

这两种方式获取的结果是相同的，都是 123。其中，使用点号取值的方式称为“点操作符”，使用方括号取值的方式称为“方括号操作符”。

两种方式的区别在于：

1. 点操作符必须使用标识符作为属性名，而方括号操作符可以使用任何字符串作为属性名。
2. 点操作符在代码书写上更加简洁直观，而方括号操作符可以动态地构造属性名。

因此，在使用时应根据具体的情况选择合适的方式。例如，如果属性名是固定的，建议使用点操作符；如果属性名需要根据变量或其他动态条件构造，则需要使用方括号操作符。

### 性能区别

在对象属性的取值操作中，使用点号`.`和中括号`[]`两种方式都能取到相应的属性值，它们在性能上也有些许的差别。

一般情况下，使用点号`.`来获取属性的性能要高于中括号`[]`，因为在解析的过程中使用点号`.`可以直接根据属性名获取到对应的属性值，而中括号`[]`需要先进行解析里面的属性名，然后再去查找相应的属性值，因此多了一个解析的过程。

但是在以下两种情况下，只能使用中括号`[]`来获取属性值：

1. 属性名包含特殊字符或者是关键字，比如 a\['class'\]。
2. 属性名是动态生成的，比如 a\[`${name}`\]。

在这两种情况下，使用点号`.`将会出现语法错误，只能使用中括号`[]`来获取属性值。

</details>

## 34. 为什么普通 for 循环的性能高于 forEach ？ {#question-c7265055-7375-4e20-b425-14d97fc27f9c}

> 难度：2 · 类型：QA

### 题目要点

- **性能差异**：普通的 `for` 循环通常比 `forEach` 更高效，因为它没有额外的函数调用开销和闭包管理。
- **可用性**：`forEach` 提供了更简洁的语法和函数式编程的便利，但对于性能要求较高的场景，普通的 `for` 循环通常是更好的选择。

<details>
<summary>参考答案</summary>

普通 `for` 循环通常在性能上优于 `forEach` 的原因有以下几点：

### **1. 函数调用开销**

- **`forEach`**：在每次迭代时，`forEach` 需要调用回调函数。这意味着每次迭代都会发生额外的函数调用开销，包括创建函数上下文、传递参数等。

- **`for`**：普通的 `for` 循环直接在循环体内执行代码，没有函数调用开销。

### **2. 函数创建和管理**

- **`forEach`**：`forEach` 需要创建一个回调函数并管理它。对于大量数据，创建和销毁函数会带来一定的性能开销。

- **`for`**：在普通的 `for` 循环中，不需要额外的函数创建和销毁，只需要简单的循环控制。

### **3. 函数闭包**

- **`forEach`**：`forEach` 的回调函数可能会涉及闭包，闭包的使用会引入额外的内存开销。

- **`for`**：普通的 `for` 循环没有这种闭包开销，代码直接在循环体内执行。

### **4. 编译优化**

- **`for`**：现代 JavaScript 引擎对普通 `for` 循环进行了高度优化，特别是可以进行更多的编译优化，如内联循环变量和减少循环体的计算量。

- **`forEach`**：回调函数的复杂性使得优化更具挑战，可能不如 `for` 循环容易优化。

### **5. 可控性**

- **`for`**：可以精确控制循环的行为，包括提前退出（使用 `break`）、跳过迭代（使用 `continue`），以及根据需要修改循环变量。

- **`forEach`**：`forEach` 无法直接提前退出或跳过迭代，尽管可以通过其他方式（如抛出异常）来间接实现，但这种方式较为繁琐和不直观。

### **性能对比示例**

以下是一个简单的性能对比示例：

```javascript
const array = new Array(1000000).fill(0);

// `for` loop
console.time('for');
for (let i = 0; i < array.length; i++) {
  array[i] = i;
}
console.timeEnd('for');

// `forEach` loop
console.time('forEach');
array.forEach((value, index) => {
  array[index] = index;
});
console.timeEnd('forEach');
```

在这个例子中，普通的 `for` 循环通常会比 `forEach` 更快。

</details>

## 35. 数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少？ {#question-9ba9d7cb-840a-4910-8596-88c6349ead1e}

> 难度：1 · 类型：QA

### 题目要点

在 JavaScript 中，访问数组的任意元素（如第一个或第十万个元素）是常数时间操作，即 O(1) 时间复杂度。这意味着不论数组的大小如何，访问数组的某个元素的时间复杂度都是固定的。

<details>
<summary>参考答案</summary>

在 JavaScript 中，访问数组的任意元素（如第一个或第十万个元素）是常数时间操作，即 O(1) 时间复杂度。这意味着不论数组的大小如何，访问数组的某个元素的时间复杂度都是固定的。

具体来说：

- **访问第一个元素**：`array[0]`
- **访问第十万个元素**：`array[99999]`

这两种访问方式的时间复杂度都是 O(1)。

在实际操作中，现代浏览器和 JavaScript 引擎对数组的随机访问优化得非常好，因此访问任何一个数组元素的时间差异通常非常微小，不会因数组大小的不同而显著变化。

</details>

## 36. JavaScript 对象的底层数据结构是什么？ {#question-dbea0a9d-c362-4c32-a4a0-820dfa88368c}

> 难度：4 · 类型：QA

### 题目要点

JavaScript 对象的底层数据结构主要是哈希表，但现代 JavaScript 引擎使用了多种优化技术来提高性能和内存使用效率。这些优化包括隐藏类、哈希表优化和内部表结构，这些都旨在确保对象属性的高效存取。

<details>
<summary>参考答案</summary>

JavaScript 对象的底层数据结构主要基于 **哈希表（Hash Table）**。哈希表是一种使用哈希函数将键映射到特定的存储位置的数据结构。JavaScript 对象的键值对存储机制的底层实现与哈希表有相似之处。以下是对 JavaScript 对象底层数据结构的详细解释：

### **1. 哈希表**

- **概念**：
  哈希表是一种数据结构，它通过哈希函数将键（通常是字符串或数字）映射到一个数组的索引位置。在 JavaScript 对象中，这种映射关系使得快速查找、插入和删除变得可能。

- **哈希函数**：
  哈希函数将对象的键（属性名）转换为一个整数索引，这个索引决定了数据在哈希表中的位置。对于 JavaScript 对象，键是字符串类型，虽然内部实现可能采用更复杂的哈希函数来确保高效的查找和冲突处理。

### **2. 内部实现**

- **属性存储**：
  在 JavaScript 中，对象的属性和值通常存储在一个散列的数据结构中。在现代 JavaScript 引擎中（如 V8 引擎），对象属性存储通常优化为不同的数据结构，如哈希表和字典表。

- **散列和优化**：
  为了提高性能，现代 JavaScript 引擎对哈希表进行了优化。它们可能使用链式哈希、开放寻址、或其他算法来处理哈希冲突，并提供高效的属性访问和修改。

- **内部表**：
  JavaScript 对象的属性和值可能存储在内部的表结构中，这些表结构可能包括：
  - **哈希表**：用于大多数普通属性的存储。
  - **隐藏类（Hidden Classes）**：一些引擎（如 V8）使用隐藏类来优化对象的属性访问。隐藏类用于跟踪对象的结构，并使属性访问变得更加高效。

### **3. 现代引擎中的优化**

- **隐藏类和内存布局**：
  为了提高性能，现代 JavaScript 引擎（如 V8）使用隐藏类和内存布局优化来减少属性访问的时间复杂度。隐藏类用于动态地优化对象的属性布局，以适应对象的实际使用模式。

- **散列表的优化**：
  引擎可能使用特殊的数据结构来存储和访问属性，特别是在属性较少的情况下。对于大量属性的对象，哈希表可能会转化为其他更适合的结构，以确保高效的操作。

### **4. 键的顺序**

- **属性顺序**：
  JavaScript 对象属性的顺序通常是有序的。ES2015（ES6）规定了属性遍历的顺序，包括：
  - 数字键：按照升序排序。
  - 字符串键：按照创建的顺序排序。
  - Symbol 键：按照创建的顺序排序。

</details>

## 37. JavaScript 中的变量在内存中的具体存储形式是什么 {#question-aacd4d9c-67fc-414a-ba12-9cd93e065786}

> 难度：3 · 类型：QA

### 题目要点

- **基本数据类型**：直接存储值，通常在栈内存中管理，分配和回收迅速。
- **引用数据类型**：存储对实际对象的引用，对象内容存储在堆内存中，内存管理更加复杂，依赖垃圾回收机制。

<details>
<summary>参考答案</summary>

在 JavaScript 中，变量在内存中的具体存储形式取决于变量的类型。JavaScript 变量主要有两种类型：基本数据类型和引用数据类型。它们的存储和管理方式有所不同。

### **1. 基本数据类型**

基本数据类型包括：`undefined`、`null`、`boolean`、`number`、`string` 、`symbol`和`bigint`。这些类型的变量直接存储值：

- **存储形式**：
  - **值存储**：基本数据类型的变量在内存中直接存储其值。例如，`let num = 42;` 中的 `num` 在内存中存储了值 `42`，而不是指向某个位置。

- **内存管理**：
  - **堆栈内存**：基本数据类型的值通常存储在栈内存（stack）中。这种存储方式使得访问基本数据类型的值非常高效，因为栈内存中的分配和回收速度非常快。

### **2. 引用数据类型**

引用数据类型包括：`object`、`array`、`function` 和 `class` 实例。引用数据类型的变量存储的是对内存中实际对象的引用，而不是对象本身：

- **存储形式**：
  - **引用存储**：引用数据类型的变量在内存中存储一个指向实际数据结构的引用（或指针）。例如，`let obj = {a: 1};` 中的 `obj` 存储的是指向 `{a: 1}` 对象的引用，而不是对象的实际内容。

- **内存管理**：
  - **堆内存**：引用数据类型的实际内容存储在堆内存（heap）中。堆内存允许动态分配和释放内存空间，这对引用数据类型尤为重要，因为它们的大小和结构可能在运行时发生变化。

### **3. 内存管理和垃圾回收**

- **栈内存**：用于存储基本数据类型的变量和函数调用的上下文。栈内存由 JavaScript 引擎自动管理，确保变量在函数调用时得到分配和回收。

- **堆内存**：用于存储引用数据类型的实际内容。堆内存的管理更加复杂，涉及到垃圾回收机制来自动回收不再使用的对象。

### **4. 内存分配与回收**

- **基本数据类型**：由于其固定大小和简单结构，基本数据类型的内存分配和回收较为直接。分配的内存空间会被保留到变量不再使用时。

- **引用数据类型**：内存分配更为复杂。JavaScript 引擎使用垃圾回收算法来自动管理堆内存中的对象，常见的垃圾回收算法包括标记-清除（Mark-and-Sweep）和标记-整理（Mark-and-Compact）。

</details>

## 38. 说说你对 eval 的理解 {#question-ca572564-4721-46ed-bc87-680d7ff47044}

> 难度：1 · 类型：QA

### 题目要点

- **功能**：`eval` 用于执行动态生成的 JavaScript 代码。
- **安全性**：由于其安全风险，通常不推荐使用。
- **性能**：会影响 JavaScript 引擎的优化，可能导致性能问题。
- **替代方案**：使用更安全的替代方法，如 `Function` 构造函数或 JSON 解析。

在绝大多数情况下，尽量避免使用 `eval`，以确保代码的安全性和可维护性。

<details>
<summary>参考答案</summary>

`eval` 是 JavaScript 的一个内置函数，用于将字符串作为 JavaScript 代码进行执行。它接受一个字符串作为参数，并在当前的作用域中执行这段代码。

### **基本用法**

```javascript
eval("console.log('Hello, world!');");  // 输出: Hello, world!
```

### **特性和影响**

1. **动态代码执行**：
   - `eval` 允许在运行时动态地执行代码。这对于一些需要动态生成和执行代码的场景可能有用。

2. **作用域**：
   - 在 `eval` 执行的代码中声明的变量会影响到 `eval` 外部的作用域。这意味着在 `eval` 中定义的变量和函数可以在外部作用域中访问，反之亦然。

3. **性能问题**：
   - 使用 `eval` 会使得 JavaScript 引擎的优化变得困难，因为它不能对动态生成的代码做出优化。结果可能会导致性能下降。

4. **安全风险**：
   - `eval` 会执行传入的任意代码，这可能导致严重的安全问题，例如代码注入攻击。如果 `eval` 执行了来自不可信来源的代码，可能会导致恶意代码的执行。

5. **替代方案**：
   - 通常，避免使用 `eval` 是一种更好的实践。可以使用 `Function` 构造函数、`JSON.parse`（用于解析 JSON 字符串），或其他更安全的动态代码执行方法。

### **示例**

```javascript
let x = 10;
eval("console.log(x);");  // 输出: 10
eval("let y = 20; console.log(y);");  // 输出: 20，y 在外部作用域也能访问
```

</details>

## 39. 说说对 new Function 的理解 {#question-af29b30f-fe4e-4cbf-99cc-c1886badda2a}

> 难度：2 · 类型：QA

### 题目要点

- **功能**：`new Function` 用于动态创建函数，并接受参数和函数体作为字符串。
- **作用域**：创建的函数只能访问全局变量，不会访问创建它的上下文中的局部变量。
- **安全性**：尽管比 `eval` 更受控制，但仍然需要注意来自不可信来源的代码。
- **性能**：可能会影响性能，因为动态生成和解析代码可能会导致优化困难。

总体而言，`new Function` 可以作为一种创建动态函数的手段，但在使用时需要小心，确保输入的代码安全并尽量避免不必要的性能开销。

<details>
<summary>参考答案</summary>

`new Function` 是 JavaScript 中创建函数的一种方式，它允许动态地生成和执行函数。与 `eval` 不同，`new Function` 主要用于创建函数，而不是执行任意的 JavaScript 代码。它接受一个或多个参数，最后一个参数是函数体，其余参数是函数的参数列表。

### **基本语法**

```javascript
new Function ([arg1, arg2, ..., argN], functionBody)
```

- **`arg1, arg2, ..., argN`**：函数的参数列表。
- **`functionBody`**：函数体，是一个包含函数代码的字符串。

### **示例**

```javascript
const add = new Function('a', 'b', 'return a + b;');
console.log(add(1, 2));  // 输出: 3
```

### **特性**

1. **动态函数创建**：
   - `new Function` 允许在运行时动态生成函数。这对于创建动态代码或在不知道函数具体内容的情况下生成函数可能有用。

2. **作用域**：
   - 使用 `new Function` 创建的函数不具有访问创建它的上下文中的变量。它们只能访问全局变量。

3. **字符串参数**：
   - 函数体是作为字符串传递的，这意味着无法在函数体中使用局部作用域内的变量。

4. **安全性**：
   - 虽然 `new Function` 比 `eval` 更受控制，但仍然存在安全隐患，特别是当函数体包含来自不可信来源的内容时。

5. **性能**：
   - `new Function` 会影响 JavaScript 引擎的优化，因为它需要解析和执行动态生成的代码。性能可能会受到影响。

### **对比 `eval`**

- **`eval`**：执行任意代码，并可以影响创建它的上下文的作用域。
- **`new Function`**：创建一个新的函数，它不访问创建它的上下文中的局部变量，只能访问全局变量。

### **例子：**

```javascript
// 创建一个计算乘积的函数
const multiply = new Function('x', 'y', 'return x * y;');
console.log(multiply(4, 5));  // 输出: 20

// 创建一个函数，访问全局变量
var globalVar = 10;
const addGlobal = new Function('return globalVar + 5;');
console.log(addGlobal());  // 输出: 15
```

</details>

## 40. Javascript 数组中有哪些方法可以改变自身，哪些不可以？ {#question-d50af40c-df41-4601-9935-c6aa3c89e3d7}

> 难度：1 · 类型：QA

### 题目要点

- **改变自身的方法**：直接对原数组进行修改，如 `push()`, `pop()`, `shift()`, `unshift()`, `splice()`, `sort()`, `reverse()`, `fill()`.
- **不改变自身的方法**：返回新数组或结果，不修改原数组，如 `concat()`, `slice()`, `map()`, `filter()`, `reduce()`, `find()`, `some()`, `every()`, `includes()`, `join()`.

<details>
<summary>参考答案</summary>

在 JavaScript 中，数组方法可以分为改变原数组的方法和不改变原数组的方法。下面是对这些方法的详细分类：

### **改变自身的方法**

这些方法会直接修改数组本身：

1. **`push()`**: 向数组末尾添加一个或多个元素。
   ```javascript
   let arr = [1, 2, 3];
   arr.push(4); // arr 是 [1, 2, 3, 4]
   ```

2. **`pop()`**: 从数组末尾删除一个元素，并返回该元素。
   ```javascript
   let arr = [1, 2, 3];
   arr.pop(); // arr 是 [1, 2]
   ```

3. **`shift()`**: 从数组开头删除一个元素，并返回该元素。
   ```javascript
   let arr = [1, 2, 3];
   arr.shift(); // arr 是 [2, 3]
   ```

4. **`unshift()`**: 向数组开头添加一个或多个元素。
   ```javascript
   let arr = [1, 2, 3];
   arr.unshift(0); // arr 是 [0, 1, 2, 3]
   ```

5. **`splice()`**: 从数组中添加或删除元素。
   ```javascript
   let arr = [1, 2, 3];
   arr.splice(1, 1, 4, 5); // arr 是 [1, 4, 5, 3]
   ```

6. **`sort()`**: 对数组进行排序，默认按字符编码排序。
   ```javascript
   let arr = [3, 1, 2];
   arr.sort(); // arr 是 [1, 2, 3]
   ```

7. **`reverse()`**: 反转数组的顺序。
   ```javascript
   let arr = [1, 2, 3];
   arr.reverse(); // arr 是 [3, 2, 1]
   ```

8. **`fill()`**: 用指定的值填充数组的指定部分。
   ```javascript
   let arr = [1, 2, 3];
   arr.fill(0, 1, 3); // arr 是 [1, 0, 0]
   ```

### **不改变自身的方法**

这些方法不会修改原数组，而是返回一个新数组或结果：

1. **`concat()`**: 合并两个或多个数组，返回一个新数组。
   ```javascript
   let arr1 = [1, 2];
   let arr2 = [3, 4];
   let result = arr1.concat(arr2); // result 是 [1, 2, 3, 4]
   ```

2. **`slice()`**: 提取数组的一部分，并返回一个新数组。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.slice(1, 2); // result 是 [2]
   ```

3. **`map()`**: 创建一个新数组，其结果是调用一个提供的函数对每个数组元素执行操作后的结果。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.map(x => x * 2); // result 是 [2, 4, 6]
   ```

4. **`filter()`**: 创建一个新数组，其中包含所有通过测试的数组元素。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.filter(x => x > 1); // result 是 [2, 3]
   ```

5. **`reduce()`**: 对数组中的每个元素执行一个提供的函数，返回单个值。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.reduce((sum, x) => sum + x, 0); // result 是 6
   ```

6. **`find()`**: 返回数组中满足提供测试函数的第一个元素。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.find(x => x > 1); // result 是 2
   ```

7. **`some()`**: 检查数组中是否至少有一个元素满足提供的测试函数。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.some(x => x > 2); // result 是 true
   ```

8. **`every()`**: 检查数组中的所有元素是否都满足提供的测试函数。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.every(x => x > 0); // result 是 true
   ```

9. **`includes()`**: 检查数组中是否包含指定的值。
   ```javascript
   let arr = [1, 2, 3];
   let result = arr.includes(2); // result 是 true
   ```

10. **`join()`**: 将数组中的所有元素连接成一个字符串。
    ```javascript
    let arr = [1, 2, 3];
    let result = arr.join('-'); // result 是 '1-2-3'
    ```

</details>

## 41. 一直在 window 上面挂内容（数据，方法等等），是否有什么风险？ {#question-4a14911d-182b-469d-986f-ad13b95e195e}

> 难度：1 · 类型：QA

### 题目要点

将内容一直挂在 `window` 对象上可能带来以下风险和问题：

<details>
<summary>参考答案</summary>

将内容一直挂在 `window` 对象上可能带来以下风险和问题：

### **1. **全局命名冲突****

`window` 对象是全局对象，将内容挂载到 `window` 上可能会导致命名冲突。不同的脚本或库可能会使用相同的全局变量名，导致冲突和意外的行为。

### **2. **性能问题****

频繁地在 `window` 对象上添加和修改属性可能会影响性能，特别是当这些操作涉及大量数据时。`window` 对象的复杂度增加可能会导致浏览器的内存使用和处理速度下降。

### **3. **内存泄漏**

如果在 `window` 对象上挂载了大量数据或引用，而这些数据不再使用但没有被正确清理，会导致内存泄漏。这会导致应用的内存占用逐渐增加，最终可能导致浏览器崩溃或变得不响应。

### **4. **安全性问题**

将敏感数据或功能暴露在 `window` 对象上可能会带来安全风险。如果恶意脚本能够访问或修改这些全局属性，可能会导致安全漏洞，例如数据泄露或功能被篡改。

### **5. **难以维护**

全局对象上的数据和功能可能会使代码变得难以维护。全局状态的管理变得复杂，特别是在大型应用或团队开发环境中，调试和追踪全局变量的来源可能会变得困难。

### **最佳实践**

- **使用局部作用域**：尽量将数据和功能限制在局部作用域内，避免直接操作 `window` 对象。
- **使用模块化**：利用 JavaScript 模块化方案（如 ES6 模块、CommonJS）来组织代码，避免全局污染。
- **清理和释放资源**：确保在不再需要全局属性时及时清理和释放相关资源，以避免内存泄漏。
- **安全审查**：审查所有挂载到 `window` 上的数据和功能，确保不会暴露敏感信息或引入安全风险。

通过这些措施，可以减少将内容挂在 `window` 对象上所带来的潜在问题和风险。

</details>

## 42. Object.prototype.hasOwnProperty() 作用是什么？ {#question-e4212521-3153-49c6-82ed-5f708c720a03}

> 难度：1 · 类型：QA

### 题目要点

`Object.prototype.hasOwnProperty()` 是一个用于检查对象是否具有某个指定的自有属性的方法。这个方法的作用是确认对象自身是否包含某个属性，而不是通过原型链继承的属性。

<details>
<summary>参考答案</summary>

`Object.prototype.hasOwnProperty()` 是一个用于检查对象是否具有某个指定的自有属性的方法。这个方法的作用是确认对象自身是否包含某个属性，而不是通过原型链继承的属性。

### **作用**

- **检查自有属性**：`hasOwnProperty` 只检查对象自身是否具有指定的属性，不会检查原型链上的属性。
- **防止属性冲突**：在遍历对象属性时（如使用 `for...in` 循环），可以使用 `hasOwnProperty` 来过滤掉从原型链继承来的属性，确保只处理对象自身的属性。

### **用法示例**

```javascript
const obj = {
  name: 'John',
  age: 30
};

console.log(obj.hasOwnProperty('name')); // true
console.log(obj.hasOwnProperty('age'));  // true
console.log(obj.hasOwnProperty('toString')); // false, 'toString' 是从原型链继承来的属性
```

### **注意**

- 这个方法不检查属性的值，只检查属性的存在性。
- `hasOwnProperty` 也是 `Object.prototype` 上的方法，因此可以在任何对象上使用，前提是不要重写或遮蔽这个方法。

</details>

## 43. 哪些原因会导致js里this指向混乱？ {#question-72fbbb97-d04c-48b4-b40e-26a645d28789}

> 难度：3.5 · 类型：QA

### 题目要点

`this` 的指向在 JavaScript 中是由调用上下文决定的，理解各种调用方式及其对 `this` 的影响有助于避免指向混乱。建议使用箭头函数、`.bind` 方法，以及在类和模块中注意 `this` 的绑定规则，以减少混淆。

<details>
<summary>参考答案</summary>

以下是一些常见的导致 `this` 指向混乱的原因：

### 1. **普通函数调用**

在普通函数调用中，`this` 的值取决于调用该函数的上下文。如果函数不是作为对象的方法调用，`this` 通常指向全局对象（在浏览器中是 `window`，在 Node.js 中是 `global`）。例如：

```javascript
function foo() {
  console.log(this);
}
foo(); // 在浏览器中输出 window
```

### 2. **事件处理程序中的 `this`**

在事件处理程序中，`this` 通常指向触发事件的 DOM 元素。例如：

```javascript
document.getElementById('myButton').addEventListener('click', function() {
  console.log(this); // 输出点击的按钮元素
});
```

### 3. **回调函数**

当将函数作为回调传递时，`this` 的指向可能与预期不同，因为回调函数的执行上下文通常会改变 `this` 的值。例如：

```javascript
const obj = {
  value: 42,
  method: function(callback) {
    callback();
  }
};

function callback() {
  console.log(this); // 输出 global 或 undefined（严格模式下）
}

obj.method(callback);
```

### 4. **箭头函数**

箭头函数不会绑定自己的 `this`。它们会从定义时的上下文中继承 `this`。如果箭头函数在对象的方法中使用，`this` 将不再指向该对象，而是指向定义时的上下文。例如：

```javascript
const obj = {
  value: 42,
  method: function() {
    setTimeout(() => {
      console.log(this.value); // 输出 42
    }, 1000);
  }
};

obj.method();
```

### 5. **`bind`, `call`, 和 `apply` 的使用**

`bind`, `call`, 和 `apply` 方法允许你明确地设置函数中的 `this` 值。如果这些方法被使用不当，可能会导致 `this` 指向混乱。例如：

```javascript
function foo() {
  console.log(this);
}

const boundFoo = foo.bind({name: 'Alice'});
boundFoo(); // 输出 { name: 'Alice' }
```

### 6. **构造函数**

在构造函数中，`this` 指向新创建的对象。如果你不使用 `new` 关键字调用构造函数，`this` 的指向将不会如预期。例如：

```javascript
function Person(name) {
  this.name = name;
}

const person = new Person('Alice');
console.log(person.name); // 输出 'Alice'

const notPerson = Person('Bob'); // 忘记使用 new
console.log(this.name); // 在严格模式下，this 是 undefined
```

### 7. **类方法**

在类中，`this` 指向类的实例。在类的静态方法中，`this` 指向类本身。例如：

```javascript
class MyClass {
  constructor(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  static staticMethod() {
    console.log(this); // 指向 MyClass
  }
}

const instance = new MyClass(42);
console.log(instance.getValue()); // 输出 42
MyClass.staticMethod(); // 输出 MyClass
```

### 8. **`with` 语句**

`with` 语句会扩展作用域链，可能会使 `this` 的指向变得混乱。在严格模式下，`with` 语句是禁止的，建议避免使用它。

</details>

## 44. 说说对 XMLHttpRequest 对象的了解 {#question-08628126-405a-4ffe-a85e-98ba028ca337}

> 难度：1 · 类型：QA

### 题目要点

`XMLHttpRequest` 是一个强大的 API，用于在浏览器中发起异步 HTTP 请求，提升用户体验并支持动态内容更新。然而，它的使用可能会增加代码复杂性，并且需处理跨域和安全性问题。

<details>
<summary>参考答案</summary>

`XMLHttpRequest` 对象用于在浏览器中发起异步 HTTP 请求，以便与服务器进行数据交换，而无需重新加载整个页面。

**主要功能**：
1. **发起请求**：支持 GET、POST、PUT、DELETE 等 HTTP 方法。
2. **异步处理**：可以以异步方式发送请求，避免阻塞用户界面。
3. **处理响应**：能够接收服务器返回的数据，并根据需要处理，比如更新页面内容。
4. **事件处理**：支持 `onreadystatechange` 事件，用于在请求状态变化时执行回调函数。常用的 `readyState` 属性值包括 0（未初始化）、1（加载中）、2（加载完成）、3（交互中）、4（完成）。

**常用方法**：
- `open(method, url, async, user, password)`：配置请求。
- `send(body)`：发送请求，可以包含数据。
- `setRequestHeader(header, value)`：设置请求头部。
- `abort()`：取消请求。

**常用属性**：
- `status`：返回 HTTP 状态码（如 200、404）。
- `statusText`：返回状态文本描述。
- `responseText`：返回响应内容（文本形式）。
- `responseXML`：返回响应内容（XML 形式）。

**优缺点**：
- **优点**：
  - **异步处理**：提高用户体验，不需要刷新页面。
  - **灵活性**：支持多种 HTTP 方法和数据格式。
- **缺点**：
  - **复杂性**：处理异步请求时，代码可能变得复杂。
  - **安全性**：容易受跨域问题影响，需要处理跨域请求。

</details>

## 45. 判断数组的方式有哪些？ {#question-25a1d366-42f6-42e2-9a41-b6dd4624fd55}

> 难度：1 · 类型：QA

### 题目要点

- **推荐方法**：使用 `Array.isArray()`，这是最简单、最可靠的方式来检查一个值是否为数组。
- **其他方法**：`instanceof` 和 `Object.prototype.toString.call()` 也很有效，但有一些特定的局限性。`constructor` 和 `isPrototypeOf()` 方法不如 `Array.isArray()` 可靠，且在某些情况下可能会出现问题。

<details>
<summary>参考答案</summary>

判断一个值是否为数组的方式有多种：

### 1. **`Array.isArray()` 方法**

- **描述**：这是 ES5 引入的标准方法，推荐用于检查一个值是否为数组。
- **语法**：`Array.isArray(value)`
- **示例**：
  ```javascript
  console.log(Array.isArray([1, 2, 3])); // true
  console.log(Array.isArray('hello')); // false
  ```

### 2. **`instanceof` 操作符**

- **描述**：使用 `instanceof` 操作符来判断对象是否是 `Array` 的实例。
- **语法**：`value instanceof Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3] instanceof Array); // true
  console.log('hello' instanceof Array); // false
  ```

### 3. **`Object.prototype.toString.call()` 方法**

- **描述**：使用 `Object.prototype.toString.call()` 可以准确判断一个对象的类型，包括数组。它返回 `[object Array]` 对于数组，其他类型则返回不同的结果。
- **语法**：`Object.prototype.toString.call(value)`
- **示例**：
  ```javascript
  console.log(Object.prototype.toString.call([1, 2, 3])); // [object Array]
  console.log(Object.prototype.toString.call('hello')); // [object String]
  ```

### 4. **`constructor` 属性**

- **描述**：检查 `constructor` 属性是否为 `Array`。这种方法不如 `Array.isArray()` 可靠，因为 `constructor` 可以被改变。
- **语法**：`value.constructor === Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3].constructor === Array); // true
  console.log('hello'.constructor === Array); // false
  ```

### 5. **`Array.prototype.isPrototypeOf()` 方法**

- **描述**：检查数组的 `prototype` 是否在目标对象的 `prototype` 链上。这种方法也可以用来判断一个对象是否为数组。
- **语法**：`Array.prototype.isPrototypeOf(value)`
- **示例**：
  ```javascript
  console.log(Array.prototype.isPrototypeOf([1, 2, 3])); // true
  console.log(Array.prototype.isPrototypeOf('hello')); // false
  ```

### 6. **使用 `constructor` 属性和原型链**

- **描述**：结合 `constructor` 属性和原型链检查。这个方法有一定的局限性，不推荐使用。
- **示例**：
  ```javascript
  function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
  }

  console.log(isArray([1, 2, 3])); // true
  console.log(isArray('hello')); // false
  ```

</details>

## 46. typeof null 的结果是什么，为什么？ {#question-234049cc-fdfc-4f73-ad2c-e1a03b6cea84}

> 难度：0.5 · 类型：QA

### 题目要点

`typeof null` 返回 `"object"` 是由于 JavaScript 语言早期设计的一个历史遗留问题。这一行为尽管不符合直觉，但它已成为语言的一部分，保持这种行为有助于确保旧代码的兼容性。

<details>
<summary>参考答案</summary>

`typeof null` 的结果是 `"object"`。这是一个 JavaScript 的古老错误，源于语言的早期实现。

### 原因

- **历史原因**：
  - 在 JavaScript 的早期版本中，`null` 的内部表示被实现为一个空对象指针（即所有位都为0）。在 `typeof` 操作符的实现中，空对象的类型被标记为 `"object"`，因此 `typeof null` 也返回 `"object"`。

- **语言规范**：
  - 这个行为是 ECMAScript 规范的一部分，尽管这是一个已知的错误，但为了兼容性和避免破坏旧代码，JavaScript 继续保持这个行为。

### 示例

```javascript
console.log(typeof null); // "object"
```

</details>

## 47. js 函数参数有默认值时，如果传递的参数是 undefined 那么会被默认值赋值吗？ {#question-9c288de3-0f6e-4a95-a243-d9d01e443b79}

> 难度：1.5 · 类型：QA

### 题目要点

在 JavaScript 中，当函数参数具有默认值时，传递 `undefined` 作为参数会导致该参数使用默认值。这种机制使得默认值能够在未提供参数或明确传递 `undefined` 时生效。

<details>
<summary>参考答案</summary>

在 JavaScript 中，如果函数参数有默认值，并且调用函数时传递的参数是 `undefined`，那么该参数会被赋予默认值。这是由于 JavaScript 的参数默认值机制的设计。

### 默认值机制

当函数参数具有默认值时，默认值机制会在以下情况下生效：

- **未传递参数**：如果调用函数时没有提供该参数，则会使用默认值。
- **传递 `undefined`**：如果显式地将 `undefined` 作为参数传递，默认值机制会将其视为未提供参数，从而使用默认值。

### 示例

```javascript
function greet(name = 'Guest') {
    console.log(`Hello, ${name}!`);
}

greet();             // 输出: Hello, Guest!
greet('Alice');      // 输出: Hello, Alice!
greet(undefined);    // 输出: Hello, Guest!
```

### 解释

- **`greet()`**：没有传递参数，因此 `name` 使用默认值 `'Guest'`。
- **`greet('Alice')`**：传递了 `'Alice'`，因此 `name` 的值是 `'Alice'`。
- **`greet(undefined)`**：显式传递了 `undefined`，所以 `name` 使用默认值 `'Guest'`。

### 注意事项

- 如果传递其他假值（如 `null`, `0`, `false`）作为参数，它们不会触发默认值机制，除非明确传递 `undefined`。

```javascript
function test(value = 'default') {
    console.log(value);
}

test(null);  // 输出: null
test(0);     // 输出: 0
test(false); // 输出: false
```

</details>

## 48. 什么是伪数组（类数组）？ {#question-51b79c37-fdda-46fe-9c79-4f2ac7a09206}

> 难度：2 · 类型：QA

### 题目要点

伪数组是指具有数组部分特性的对象，它可以像数组一样按索引访问元素和获取 `length` 属性，但本质上并不是 `Array` 实例，因而不具备数组的方法（如 `push`、`pop` 等）。

通过适当的转换，开发者可以像操作数组一样方便地使用这些数据。

<details>
<summary>参考答案</summary>

伪数组是指具有数组部分特性的对象，它可以像数组一样按索引访问元素和获取 `length` 属性，但本质上并不是 `Array` 实例，因而不具备数组的方法（如 `push`、`pop` 等）。

### 特点
1. **具有 `length` 属性**：伪数组对象包含一个 `length` 属性，表示其中的元素数量。
2. **可以按索引访问**：伪数组中的元素可以像数组一样通过索引访问，如 `obj[0]`、`obj[1]` 等。
3. **不继承数组的原型方法**：伪数组不继承 `Array.prototype` 上的方法，因此无法直接调用数组的方法。

### 常见的伪数组对象
在 JavaScript 中，常见的伪数组包括：
- **`arguments` 对象**：在函数中，可以通过 `arguments` 访问传入的参数，`arguments` 是伪数组。
- **DOM 方法返回的 `NodeList`、`HTMLCollection`**：例如 `document.querySelectorAll()` 返回的结果就是 `NodeList`，属于伪数组。
- **`字符串`**：严格来说，字符串也具有伪数组特性，因为它们支持按索引访问和 `length` 属性。

### 转换伪数组为数组
因为伪数组没有数组的方法，通常需要将它们转换为真正的数组。常见的转换方法有以下几种：

1. **使用 `Array.from()`**
   ```javascript
   function example() {
     const argsArray = Array.from(arguments);
     console.log(argsArray); // [1, 2, 3]
   }
   example(1, 2, 3);
   ```

2. **使用扩展运算符 `...`**
   ```javascript
   function example() {
     const argsArray = [...arguments];
     console.log(argsArray); // [1, 2, 3]
   }
   example(1, 2, 3);
   ```

3. **使用 `Array.prototype.slice.call()`**
   ```javascript
   function example() {
     const argsArray = Array.prototype.slice.call(arguments);
     console.log(argsArray); // [1, 2, 3]
   }
   example(1, 2, 3);
   ```

</details>

## 49. escape、encodeURI、encodeURIComponent 有什么区别？ {#question-b006d9ef-a87e-47c4-b5f9-6314204730e5}

> 难度：2 · 类型：QA

### 题目要点

- **`escape`**：已过时，不推荐使用。对非 ASCII 字符和某些特殊字符进行编码，但处理不完全准确。
- **`encodeURI`**：用于编码整个 URI，但保留 URI 中具有特殊意义的字符（如 `:`、`/`、`?`、`#`）。
- **`encodeURIComponent`**：用于编码 URI 组件（如查询参数），会编码所有非字母数字字符，包括具有特殊意义的字符。

选择哪个函数取决于你需要编码的内容是整个 URI 还是 URI 的一部分。如果是 URI 的一部分（如查询参数），使用 `encodeURIComponent`；如果是整个 URI，则使用 `encodeURI`。

<details>
<summary>参考答案</summary>

`escape`、`encodeURI` 和 `encodeURIComponent` 都是 JavaScript 中用于编码 URI 组件的函数，但它们的用途和处理方式有所不同。以下是对这三者的详细解释和区别：

### 1. `escape`

- **描述**：`escape` 是一个过时的函数，用于对字符串进行 URL 编码。它将非 ASCII 字符和一些特殊字符转换为百分号编码（%xx）格式。
- **语法**：`escape(string)`
- **用途**：在现代 Web 开发中，`escape` 已不推荐使用，因为它不能正确处理所有字符，并且对非 ASCII 字符和一些保留字符（如 `+`, `/`）的编码不完全准确。
- **示例**：
  ```javascript
  console.log(escape('Hello World!')); // 输出: Hello%20World%21
  ```

### 2. `encodeURI`

- **描述**：`encodeURI` 用于对整个 URI 进行编码，但保留 URI 中的特殊字符，如冒号、斜杠、问号和井号，这些字符在 URI 中有特定含义。
- **语法**：`encodeURI(uri)`
- **用途**：当你需要编码一个完整的 URI 时（例如，URL 中的查询参数），使用 `encodeURI` 是合适的，它会对 URI 中的非字母数字字符进行编码，但不会编码那些在 URI 中有特殊意义的字符。
- **示例**：
  ```javascript
  console.log(encodeURI('https://example.com/search?q=hello world'));
  // 输出: https://example.com/search?q=hello%20world
  ```

### 3. `encodeURIComponent`

- **描述**：`encodeURIComponent` 用于对 URI 组件（例如，查询字符串中的参数）进行编码。它会编码所有非字母数字字符，包括那些在 URI 中有特殊意义的字符。
- **语法**：`encodeURIComponent(component)`
- **用途**：当你需要编码 URI 的一部分，例如查询参数的值，使用 `encodeURIComponent` 是合适的。它会将所有非字母数字字符（包括 `&`, `=`, `?`, `#` 等）都进行编码。
- **示例**：
  ```javascript
  console.log(encodeURIComponent('hello world&foo=bar'));
  // 输出: hello%20world%26foo%3Dbar
  ```

</details>

## 50. use strict是什么，有什么用？ {#question-48d2a044-b6bd-469c-9122-f27ae6d0d74c}

> 难度：2.5 · 类型：QA

### 题目要点

`"use strict"` 启用严格模式，提供了更严格的代码执行环境，通过禁止一些不安全的行为、修复语言中的错误、提高代码性能等方式，帮助开发者编写更安全、可靠的代码。

<details>
<summary>参考答案</summary>

`"use strict"` 是 JavaScript 的严格模式声明，用于启用 ECMAScript 5 中引入的严格模式。严格模式提供了一种更严格的解析和执行 JavaScript 代码的方式，有助于提高代码的安全性和一致性。

### 主要功能和用途

1. **消除 JavaScript 中的一些不安全行为**：
   - 在严格模式下，某些不安全的行为被禁止。例如，不能使用未声明的变量，防止全局变量的无意创建。

2. **修复 JavaScript 的一些错误**：
   - 严格模式修复了语言中的一些设计缺陷，使得错误更容易被发现和调试。例如，`delete` 不能删除不可删除的属性。

3. **提高性能**：
   - 在某些 JavaScript 引擎中，启用严格模式可以提高代码执行的性能，因为引擎可以对代码进行更多优化。

4. **避免意外创建全局变量**：
   - 严格模式下，所有变量必须先声明才可以使用。如果未声明变量就使用，会导致错误，而不是隐式创建全局变量。

5. **禁止重复参数和对象属性**：
   - 在严格模式下，函数的参数不能有重复的名称，对象的属性名也不能重复，这有助于避免潜在的错误。

### 启用方式

- **全局启用**：
  在整个 JavaScript 文件的开头添加 `"use strict";`：
  ```javascript
  "use strict";
  // 全局范围内的代码
  ```

- **函数级别启用**：
  在函数内部添加 `"use strict";`，只对该函数内的代码有效：
  ```javascript
  function myFunction() {
      "use strict";
      // 函数范围内的代码
  }
  ```

### 示例

```javascript
"use strict";

// 错误：未声明的变量
x = 10; // ReferenceError: x is not defined

// 正确：必须先声明变量
let y = 20;

// 错误：不能删除不可删除的属性
delete Object.prototype; // TypeError: Cannot delete property 'prototype' of function Object() { [native code] }
```

</details>

## 51. JS 中的数组和函数在内存中是如何存储的？ {#question-30b5a8a5-5420-49cb-94b4-f45684eecba9}

> 难度：1.5 · 类型：QA

### 题目要点

- **数组**：在内存中通常以连续的块存储，支持动态大小和按索引访问。内存开销包括元素的实际数据和元数据（如长度）。

- **函数**：在内存中作为对象存储，包括代码块、作用域链和闭包变量。内存开销主要来自函数体和闭包变量。

JavaScript 引擎（如 V8）负责管理内存分配、垃圾回收和优化存储策略，以提高性能和有效使用内存。

<details>
<summary>参考答案</summary>

在 JavaScript 中，数组和函数在内存中的存储方式有所不同，但它们都遵循 JavaScript 引擎的内存管理机制。以下是对数组和函数在内存中存储的详细解释：

### 1. **数组**

- **内存存储**：
  - **连续内存**：数组通常在内存中是以连续的内存块存储的。每个元素在内存中都有一个固定的位置，这使得可以快速访问特定索引的元素。
  - **动态大小**：JavaScript 数组是动态的，即使在创建时给定了初始大小，数组的大小也可以根据需要自动增长或缩小。引擎内部会处理这种动态调整，但一般来说，数组的实际存储实现可能使用内存池或动态数组策略。

- **内存开销**：
  - 数组的元素是按照索引存储的，每个元素的内存开销取决于其数据类型（例如，整数、浮点数、对象等）。
  - 数组的内存开销还包括存储数组元数据的空间，例如长度和容量。

- **示例**：
  ```javascript
  let arr = [1, 2, 3];
  ```

  在内存中，`arr` 会有一个指向存储 `[1, 2, 3]` 的连续内存块的引用。

### 2. **函数**

- **内存存储**：
  - **函数对象**：函数在内存中是作为一个对象存储的，包括函数的代码、作用域链和其他内部属性。
  - **代码区**：函数的实际代码被存储在一个代码区域，通常由 JavaScript 引擎内部管理。这段代码是不可变的。
  - **闭包**：如果函数创建了闭包（例如，引用了外部作用域的变量），这些引用的变量也会被存储在内存中，通常与函数对象一起存储在堆内存中。

- **内存开销**：
  - **函数体**：函数的代码块占用内存，且这部分内存通常是固定的，取决于函数的复杂性。
  - **作用域链**：函数的作用域链或闭包变量会额外占用内存，用于保存函数执行时需要访问的外部变量。

- **示例**：
  ```javascript
  function greet(name) {
      console.log(`Hello, ${name}!`);
  }
  ```

  在内存中，`greet` 函数会有一个指向其代码块的引用，还会包含作用域链信息以及可能的闭包变量。

</details>

## 52. 普通函数动态参数 和 箭头函数的动态参数有什么区别？ {#question-b3c9e524-a1b4-4348-9ce5-f2beb80caf32}

> 难度：2 · 类型：QA

### 题目要点

- **普通函数**：
  - 使用 `arguments` 对象来处理不确定数量的参数。
  - `arguments` 是一个类数组对象，不具备数组的方法。
  - 支持传统的函数声明和函数表达式。

- **箭头函数**：
  - 使用剩余参数语法（`...args`）来处理不确定数量的参数。
  - `...args` 是一个真正的数组，具备数组的方法。
  - 不支持 `arguments` 对象，也不具备传统函数的 `this` 绑定行为。

选择使用普通函数还是箭头函数取决于具体的需求，例如是否需要 `arguments` 对象或是否需要处理动态参数。箭头函数通常更简洁，但普通函数在处理动态参数时提供了更多的灵活性。

<details>
<summary>参考答案</summary>

普通函数和箭头函数在处理动态参数（即不确定数量的参数）时，有一些重要的区别，主要体现在参数处理和 `this` 上下文的处理方式。以下是这两种函数在处理动态参数时的主要区别：

### 1. **普通函数的动态参数**

普通函数可以使用 `arguments` 对象来处理不确定数量的参数。`arguments` 是一个类数组对象，包含了传递给函数的所有参数。

- **示例**：

  ```javascript
  function normalFunction() {
      console.log(arguments); // 输出: 类数组对象
      for (let i = 0; i < arguments.length; i++) {
          console.log(arguments[i]);
      }
  }

  normalFunction(1, 2, 3); // 输出: 1 2 3
  ```

- **特点**：
  - `arguments` 对象在普通函数中自动可用，可以用来访问所有传入的参数。
  - `arguments` 是一个类数组对象，但不具备数组的方法（如 `push`, `pop`）。
  - `arguments` 在箭头函数中不可用。

### 2. **箭头函数的动态参数**

箭头函数不支持 `arguments` 对象。箭头函数的参数必须使用 ES6 的剩余参数语法（rest parameters）来处理不确定数量的参数。

- **示例**：

  ```javascript
  const arrowFunction = (...args) => {
      console.log(args); // 输出: 数组
      args.forEach(arg => console.log(arg));
  };

  arrowFunction(1, 2, 3); // 输出: 1 2 3
  ```

- **特点**：
  - 箭头函数使用剩余参数语法（`...args`）将所有传入的参数收集到一个数组中。
  - `args` 是一个真正的数组，可以使用数组的方法（如 `forEach`, `map`, `filter`）。
  - 没有 `arguments` 对象，如果需要访问所有参数，必须使用剩余参数语法。

</details>

## 53. 函数声明与函数表达式有什么区别 {#question-c830ad90-3291-4123-81db-223c81244f41}

> 难度：1 · 类型：QA

### 题目要点

- **函数声明**：
  - 通过关键字 `function` 定义。
  - 会被提升到作用域顶部，允许在声明之前调用。
  - 必须有一个函数名称。

- **函数表达式**：
  - 通过将一个函数赋值给一个变量来定义。
  - 不会被提升，只有在定义之后才能调用。
  - 可以是匿名函数或具名函数。

选择使用函数声明还是函数表达式取决于具体需求。函数声明适用于需要在作用域内的任何位置都能访问的情况，而函数表达式适用于需要在定义之后才使用的情况，或者用于回调、事件处理程序等场景。

<details>
<summary>参考答案</summary>

函数声明（Function Declaration）和函数表达式（Function Expression）是两种定义函数的方式，在 JavaScript 中有一些重要的区别。以下是它们的主要区别和特点：

### 1. **函数声明（Function Declaration）**

- **定义方式**：
  ```javascript
  function myFunction() {
      console.log('Function Declaration');
  }
  ```

- **特性**：
  - **提升（Hoisting）**：函数声明会被提升到其所在作用域的顶部。这意味着你可以在函数声明之前调用它。
  - **语法**：具有关键字 `function` 开头，后跟函数名、参数列表和函数体。
  - **名称**：函数声明需要一个名字。

- **示例**：
  ```javascript
  console.log(myFunction()); // 输出: 'Function Declaration'

  function myFunction() {
      return 'Function Declaration';
  }
  ```

### 2. **函数表达式（Function Expression）**

- **定义方式**：
  ```javascript
  const myFunction = function() {
      console.log('Function Expression');
  };
  ```

- **特性**：
  - **提升（Hoisting）**：函数表达式不会被提升，只有在函数表达式定义之后才能调用它。
  - **语法**：函数表达式是一个匿名函数（没有名称）或具名函数赋值给变量。
  - **名称**：可以是匿名函数或具名函数。匿名函数没有名字，而具名函数有名字。

- **示例**：
  ```javascript
  // 错误：调用函数表达式之前不能使用
  console.log(myFunction()); // TypeError: myFunction is not a function

  const myFunction = function() {
      return 'Function Expression';
  };

  console.log(myFunction()); // 输出: 'Function Expression'
  ```

### 3. **具名函数表达式**

具名函数表达式是函数表达式的一种形式，其中函数有一个名字。

- **定义方式**：
  ```javascript
  const myFunction = function namedFunction() {
      console.log('Named Function Expression');
  };
  ```

- **特性**：
  - **名称**：函数有一个名字（`namedFunction`），该名称仅在函数内部可用，用于递归调用或调试。
  - **提升**：函数的名称不会被提升，但函数表达式本身的提升规则与普通函数表达式相同。

- **示例**：
  ```javascript
  const myFunction = function namedFunction() {
      return 'Named Function Expression';
  };

  console.log(myFunction()); // 输出: 'Named Function Expression'
  ```

</details>

## 54. JS 创建对象的方式有哪些？ {#question-b4fc9495-91fc-4903-aab7-66a563637c1d}

> 难度：1.5 · 类型：QA

### 题目要点

- **对象字面量**：创建简单对象，语法简洁。
- **构造函数**：用于创建多个类似的对象，使用 `new` 关键字。
- **`Object.create`**：用于创建继承自指定原型的新对象。
- **类（Class）**：提供了现代的对象创建和继承语法，具有更好的可读性和组织结构。
- **`Object` 构造函数**：用于创建对象，但不常用。
- **工厂函数**：返回新对象，封装创建逻辑，避免使用 `new`。

选择创建对象的方法通常取决于你的具体需求，包括对象的复杂性、继承关系和可读性要求。

<details>
<summary>参考答案</summary>

以下是创建对象的主要方法：

### 1. **对象字面量（Object Literal）**

- **定义**：直接使用花括号 `{}` 来创建对象。
- **示例**：
  ```javascript
  const person = {
      name: 'John',
      age: 30,
      greet() {
          console.log('Hello!');
      }
  };
  ```

- **特点**：
  - 语法简洁。
  - 适合创建简单对象或用于字面量初始化。

### 2. **构造函数（Constructor Function）**

- **定义**：使用函数作为构造函数来创建对象，通过 `new` 关键字实例化对象。
- **示例**：
  ```javascript
  function Person(name, age) {
      this.name = name;
      this.age = age;
      this.greet = function() {
          console.log('Hello!');
      };
  }

  const john = new Person('John', 30);
  ```

- **特点**：
  - 适用于创建具有相同结构和行为的多个对象。
  - 使用 `new` 关键字实例化。

### 3. **`Object.create` 方法**

- **定义**：使用 `Object.create` 方法创建新对象，并指定其原型对象。
- **示例**：
  ```javascript
  const personPrototype = {
      greet() {
          console.log('Hello!');
      }
  };

  const john = Object.create(personPrototype);
  john.name = 'John';
  john.age = 30;
  ```

- **特点**：
  - 新创建的对象继承指定的原型对象。
  - 可用于创建对象继承层次结构。

### 4. **类（Class）**

- **定义**：使用 ES6 引入的 `class` 语法来定义对象的构造函数和方法。
- **示例**：
  ```javascript
  class Person {
      constructor(name, age) {
          this.name = name;
          this.age = age;
      }

      greet() {
          console.log('Hello!');
      }
  }

  const john = new Person('John', 30);
  ```

- **特点**：
  - 提供了更清晰和现代的语法来定义对象。
  - 类的语法是构造函数的语法糖，实际底层仍然使用原型链。

### 5. **`Object` 构造函数**

- **定义**：使用 `Object` 构造函数来创建一个空对象或从现有对象创建新对象。
- **示例**：
  ```javascript
  const person = new Object();
  person.name = 'John';
  person.age = 30;
  person.greet = function() {
      console.log('Hello!');
  };
  ```

- **特点**：
  - 与对象字面量相比，语法稍显冗长。
  - `Object` 构造函数通常不用于创建对象，更多是用于处理对象的属性。

### 6. **工厂函数（Factory Function）**

- **定义**：使用普通函数返回一个新对象，工厂函数可以有多个返回值并提供封装。
- **示例**：
  ```javascript
  function createPerson(name, age) {
      return {
          name: name,
          age: age,
          greet() {
              console.log('Hello!');
          }
      };
  }

  const john = createPerson('John', 30);
  ```

- **特点**：
  - 提供了与构造函数类似的功能，但不需要使用 `new` 关键字。
  - 可以返回不同结构的对象。

</details>

## 55. hasOwnProperty 与 instanceof 有什么区别 {#question-55beb2ca-b7a6-4c28-8f75-14d43e2bda4a}

> 难度：1.5 · 类型：QA

### 题目要点

- **`hasOwnProperty`**：
  - **用途**：检查对象是否具有特定的自有属性。
  - **返回值**：`true` 或 `false`，表示属性是否存在于对象自身（非原型链上）。
  - **用法**：检查属性存在性。

- **`instanceof`**：
  - **用途**：检查对象是否是特定构造函数或类的实例。
  - **返回值**：`true` 或 `false`，表示对象是否在构造函数的原型链上。
  - **用法**：确定对象的类型或构造函数。

这两者都在不同的场景下使用：`hasOwnProperty` 用于检查对象属性的存在性，而 `instanceof` 用于检测对象的实例类型。

<details>
<summary>参考答案</summary>

`hasOwnProperty` 和 `instanceof` 是 JavaScript 中两个用于处理对象的不同方法，它们用于不同的目的。以下是它们的主要区别和使用场景：

### 1. **`hasOwnProperty`**

- **定义**：`hasOwnProperty` 是所有 JavaScript 对象继承自 `Object` 的一个方法，用于检查对象自身是否具有特定的属性（即，该属性是否是对象本身的属性，而不是继承自原型链上的属性）。

- **用法**：
  ```javascript
  const obj = {
      name: 'John'
  };

  console.log(obj.hasOwnProperty('name')); // 输出: true
  console.log(obj.hasOwnProperty('toString')); // 输出: false
  ```

- **特点**：
  - **检查自身属性**：只检查对象自身的属性，不检查原型链上的属性。
  - **参数**：接受一个字符串作为参数，表示要检查的属性名。
  - **返回值**：返回布尔值 `true` 或 `false`。
  - **通用性**：可以用于所有继承自 `Object` 的对象，包括自定义对象和内置对象。

- **注意**：`hasOwnProperty` 可以被对象的原型链上的属性覆盖，因此在实际使用中，可能需要使用 `Object.prototype.hasOwnProperty.call` 来确保不受覆盖影响：
  ```javascript
  Object.prototype.hasOwnProperty.call(obj, 'name');
  ```

### 2. **`instanceof`**

- **定义**：`instanceof` 是一个操作符，用于检查对象是否是某个构造函数的实例，或者说对象是否通过指定的构造函数创建。

- **用法**：
  ```javascript
  class Person {
      constructor(name) {
          this.name = name;
      }
  }

  const john = new Person('John');

  console.log(john instanceof Person); // 输出: true
  console.log(john instanceof Object); // 输出: true
  console.log(john instanceof Array); // 输出: false
  ```

- **特点**：
  - **检查原型链**：检查对象是否在构造函数的原型链上。如果对象是通过指定构造函数创建的实例，则返回 `true`。
  - **参数**：`instanceof` 右侧是一个构造函数（或类），左侧是要检查的对象。
  - **返回值**：返回布尔值 `true` 或 `false`。
  - **用途**：用于确定对象的类型或构造函数。

- **注意**：
  - `instanceof` 可以用于检测对象的原型链中是否包含指定构造函数的 `prototype` 对象。
  - `instanceof` 可以与类和构造函数一起使用，但不能直接用于检测对象是否包含特定属性。

</details>

## 56. 原型链的终点是什么？ {#question-32a74e6c-fc06-4f61-b3c4-95a7760157a6}

> 难度：1 · 类型：QA

### 题目要点

- **原型链的终点**：`Object.prototype` 是原型链的终点，它的 `[[Prototype]]` 指向 `null`。
- **`Object.prototype`**：提供了所有对象共有的属性和方法。
- **`null`**：表示原型链的最末端，没有更多的原型链。

<details>
<summary>参考答案</summary>

原型链的终点是 `Object.prototype`。

在 JavaScript 中，所有对象的原型链最终都会归结到 `Object.prototype`，这是原型链的最后一个环节。

### 原型链的结构

1. **对象实例**：每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`（在代码中通过 `__proto__` 或 `Object.getPrototypeOf` 可以访问），这个属性指向该对象的原型。

2. **构造函数的原型**：构造函数创建的对象实例的原型指向构造函数的 `prototype` 对象。例如：
   ```javascript
   function Person(name) {
       this.name = name;
   }

   const john = new Person('John');
   ```

   在这个例子中，`john` 的原型指向 `Person.prototype`。

3. **`Object.prototype`**：每个对象的原型链最终都会指向 `Object.prototype`。这是 JavaScript 原型链的终点。`Object.prototype` 是所有对象的共同祖先，它提供了所有对象共有的属性和方法，如 `toString`, `hasOwnProperty` 等。

4. **`null`**：`Object.prototype` 的 `[[Prototype]]` 是 `null`，这是原型链的终点。`null` 表示没有更多的原型链。

### 原型链的终点示例

```javascript
const obj = {};

// 访问 obj 的原型
console.log(Object.getPrototypeOf(obj)); // 输出: {}
console.log(Object.getPrototypeOf(Object.getPrototypeOf(obj))); // 输出: null
```

在上面的代码中，`Object.getPrototypeOf(obj)` 返回 `Object.prototype`，而 `Object.getPrototypeOf(Object.prototype)` 返回 `null`，标志着原型链的终点。

</details>

## 57. 如何冻结一个 JS 对象？ {#question-212e760b-fb9a-4dc6-9175-c2053e96cd16}

> 难度：2 · 类型：QA

### 题目要点

- **`Object.freeze()`**：用于冻结对象，阻止修改、添加或删除属性。
- **深度冻结**：对于嵌套对象，需使用递归函数来完全冻结对象及其所有嵌套属性。
- **冻结效果**：冻结后，尝试修改、添加或删除属性将不会生效。

冻结对象可以提高代码的安全性和稳定性，防止对象被意外或恶意修改。

<details>
<summary>参考答案</summary>

可以使用 `Object.freeze()` 方法冻结一个 JavaScript 对象。

冻结对象会阻止对对象的修改，包括添加新属性、删除现有属性以及修改现有属性的值。

### 使用 `Object.freeze()`

```javascript
// 创建一个对象
const person = {
    name: 'Alice',
    age: 25
};

// 冻结对象
Object.freeze(person);

// 尝试修改对象的属性
person.name = 'Bob'; // 不会改变，因为对象已被冻结
person.gender = 'female'; // 不会添加，因为对象已被冻结
delete person.age; // 不会删除属性，因为对象已被冻结

console.log(person); // 输出: { name: 'Alice', age: 25 }
```

### `Object.freeze()` 方法的特性

1. **不可变性**：
   - 对象被冻结后，现有的属性变得不可修改。
   - 新属性不能被添加。
   - 现有属性不能被删除。

2. **嵌套对象**：
   - `Object.freeze()` 只会冻结对象的第一层。嵌套的对象属性不会被递归冻结。

   ```javascript
   const person = {
       name: 'Alice',
       address: {
           city: 'Wonderland'
       }
   };

   Object.freeze(person);

   // 修改嵌套对象的属性不会被阻止
   person.address.city = 'New Wonderland';
   console.log(person.address.city); // 输出: 'New Wonderland'
   ```

### 深度冻结

要完全冻结对象及其所有嵌套属性，可以编写一个递归函数来实现深度冻结：

```javascript
function deepFreeze(obj) {
    // 获取对象的所有属性名
    const propNames = Object.getOwnPropertyNames(obj);

    // 遍历所有属性
    propNames.forEach(name => {
        const value = obj[name];

        // 如果属性值是对象，则递归冻结
        if (typeof value === 'object' && value !== null) {
            deepFreeze(value);
        }
    });

    // 冻结对象本身
    return Object.freeze(obj);
}

const person = {
    name: 'Alice',
    address: {
        city: 'Wonderland'
    }
};

deepFreeze(person);

// 尝试修改嵌套对象的属性
person.address.city = 'New Wonderland'; // 不会改变，因为对象及其嵌套对象已被冻结

console.log(person.address.city); // 输出: 'Wonderland'
```

</details>

## 58. 原生 js 如何进行监听路由的变化？ {#question-93c12e43-114e-41b0-9515-5c13e5bf3e0b}

> 难度：2.5 · 类型：QA

### 题目要点

1. **hash 路由**：使用 `hashchange` 事件即可监听。
2. **history 路由**：使用 `popstate` 事件，并重写 `pushState` 和 `replaceState` 方法触发自定义事件。

<details>
<summary>参考答案</summary>

在原生 JavaScript 中，可以通过监听 `hashchange` 事件和 `popstate` 事件来监听路由变化。以下是常见的方法：

### 1. 监听 `hashchange` 事件
`hashchange` 事件适用于基于哈希的路由（即 `#` 形式的路由，如 `example.com/#/home`）。

```javascript
window.addEventListener('hashchange', function() {
    console.log('Hash changed to:', location.hash);
});
```

- **原理**：当 URL 中的 `#` 部分发生变化时，会触发 `hashchange` 事件。
- **优点**：简单、兼容性好。
- **缺点**：只能监听 `#` 部分的变化，不适用于 `history` API 模式的路由。

### 2. 监听 `popstate` 事件
`popstate` 事件适用于 `history` API（例如 `pushState`、`replaceState`）实现的前端路由。

```javascript
window.addEventListener('popstate', function(event) {
    console.log('Location changed to:', location.pathname);
    console.log('State data:', event.state);
});
```

- **原理**：当 `history` 堆栈发生变化（例如使用 `back`、`forward`、`go` 等方法）时，会触发 `popstate` 事件。
- **优点**：适用于 `history` API，能更好地支持现代路由方案。
- **缺点**：不包括直接调用 `pushState` 和 `replaceState` 的情况，需要手动触发。

### 3. 重写 `pushState` 和 `replaceState` 以触发自定义事件
`pushState` 和 `replaceState` 本身不会触发 `popstate`，可以重写它们并手动触发事件。

```javascript
const originalPushState = history.pushState;
history.pushState = function (...args) {
    originalPushState.apply(this, args);
    window.dispatchEvent(new Event('pushstate'));
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event('replacestate'));
};

// 监听自定义的 pushstate 和 replacestate 事件
window.addEventListener('pushstate', () => {
    console.log('URL changed (pushState):', location.pathname);
});
window.addEventListener('replacestate', () => {
    console.log('URL changed (replaceState):', location.pathname);
});
```

</details>

## 59. onpopstate 可以监听到 pushstate 的事件吗？ {#question-b7510525-d358-4b38-a29d-430524dc2dca}

> 难度：1.5 · 类型：QA

### 题目要点

- `popstate` 事件只在用户通过浏览器的前进和后退按钮进行导航时触发。
- `pushState` 和 `replaceState` 不会触发 `popstate` 事件。
- 如果需要在调用 `pushState` 或 `replaceState` 后执行操作，必须手动调用相关的处理函数。

<details>
<summary>参考答案</summary>

`onpopstate` 事件无法直接监听到 `pushState` 或 `replaceState` 方法的调用。这是因为 `pushState` 和 `replaceState` 方法本身不会触发 `popstate` 事件，它们只是修改浏览器的历史记录和 URL。

### **`popstate` 事件的触发条件**

`popstate` 事件只会在以下情况下触发：

- 用户通过浏览器的前进或后退按钮进行导航。
- 用户点击浏览器的历史记录（例如，通过前进、后退按钮或键盘快捷键）。

### **`pushState` 和 `replaceState` 的作用**

- **`pushState`**：将一个新的状态推入历史记录栈，并更新 URL。这不会触发 `popstate` 事件。

  ```javascript
  history.pushState({ page: 1 }, 'Title 1', '/page1');
  ```

- **`replaceState`**：修改当前历史记录项，并更新 URL。这也不会触发 `popstate` 事件。

  ```javascript
  history.replaceState({ page: 2 }, 'Title 2', '/page2');
  ```

### **手动触发更新**

如果你需要在调用 `pushState` 或 `replaceState` 时执行某些操作，可以在这些方法的调用后手动执行回调函数：

```javascript
function handleStateChange() {
  console.log('State changed:', history.state);
  // 更新页面内容或执行其他操作
}

function navigateTo(url, state = null) {
  history.pushState(state, '', url);
  handleStateChange();
}

function replaceState(url, state = null) {
  history.replaceState(state, '', url);
  handleStateChange();
}

// 使用示例
navigateTo('/page1', { page: 1 });
replaceState('/page2', { page: 2 });
```

</details>

## 60. for...of、for...in、for 循环， 三者有什么区别？ {#question-849cda15-e60a-43ed-984c-f873afdd174f}

> 难度：1 · 类型：QA

### 题目要点

- **`for` 循环**：最基础的循环结构，适用于各种情况，包括数组和对象，但需要手动控制循环变量和条件。
- **`for...in` 循环**：用于遍历对象的可枚举属性（包括继承的属性），不适用于数组。
- **`for...of` 循环**：用于遍历可迭代对象的值，适用于数组、字符串、Set、Map 等，但不适用于普通对象。

<details>
<summary>参考答案</summary>

`for...of`、`for...in` 和 `for` 是 JavaScript 中用于循环的三种不同结构，每种结构有不同的用途和特性。

### **1. `for` 循环**

- **作用**：最基本的循环结构，可以用于遍历数组、对象等。
- **用法**：需要初始化变量、设置循环条件和更新变量。
- **示例**：
  ```javascript
  for (let i = 0; i < 5; i++) {
    console.log(i); // 输出 0, 1, 2, 3, 4
  }
  ```

- **特点**：
  - 用于精确控制循环次数。
  - 可以用于遍历数组或其他可迭代对象，也适用于遍历对象的属性，但需要额外处理。

### **2. `for...in` 循环**

- **作用**：用于遍历对象的可枚举属性（包括继承的属性）。
- **用法**：遍历对象的所有属性（不包括 Symbol 属性）。
- **示例**：
  ```javascript
  const obj = { a: 1, b: 2, c: 3 };
  for (let key in obj) {
    console.log(key, obj[key]); // 输出 "a 1", "b 2", "c 3"
  }
  ```

- **特点**：
  - 遍历对象的属性名（键），不是数组元素。
  - 不保证属性的顺序。
  - 适合遍历对象的键，而不适用于遍历数组。

### **3. `for...of` 循环**

- **作用**：用于遍历可迭代对象（如数组、字符串、Set、Map 等）的元素。
- **用法**：直接遍历迭代对象的值。
- **示例**：
  ```javascript
  const array = [10, 20, 30];
  for (let value of array) {
    console.log(value); // 输出 10, 20, 30
  }
  ```

- **特点**：
  - 遍历可迭代对象的值。
  - 不适用于遍历对象的属性，只适用于数组或其他可迭代对象。
  - 保证了遍历的顺序。

</details>

## 61. 引用类型有哪些，有什么特点 {#question-ae4aa03a-06fe-41be-9c42-f53947f13f49}

> 难度：1 · 类型：QA

### 题目要点

在JavaScript中，引用类型是指非基本数据类型，它们是由对象、数组、函数等复杂数据结构组成的。

<details>
<summary>参考答案</summary>

在JavaScript中，引用类型是指非基本数据类型，它们是由对象、数组、函数等复杂数据结构组成的。

常见的引用类型包括：

1. `对象（Object）`：对象是JavaScript中最基本的引用类型，它可以用来存储键值对，也可以通过原型链实现继承。

2. `数组（Array）`：数组是一种有序的集合，可以存储任意类型的数据，它的长度是动态的，可以随时添加或删除元素。

3. `函数（Function）`：函数是一种可执行的对象，可以封装一段可重复使用的代码。函数可以接收参数并返回值。

引用类型的特点包括：

1. 引用类型的值是可变的：引用类型的值是存储在堆内存中的，当我们修改一个引用类型的值时，实际上是修改了它在内存中的地址，而不是修改了该值本身。

2. 引用类型值的比较是引用的比较：当使用"=="或"==="运算符比较两个引用类型的值时，它们会进行引用的比较，即判断它们是否指向同一个内存地址。只有当两个引用指向同一个对象时，它们才被认为是相等的。

3. 引用类型可以有自己的属性和方法：引用类型的值可以拥有自己的属性和方法。例如，数组对象有长度属性和一些常用的数组方法（例如push、pop、sort等），而函数对象有call、apply等方法。

4. 引用类型可以通过原型链实现继承：通过原型链，引用类型可以继承父类型的属性和方法。

基本类型（如数字、字符串、布尔值）在JavaScript中是按值传递的，而引用类型是按引用传递的。

这意味着当将一个引用类型的值赋给另一个变量时，实际上是将内存地址复制给了新的变量，两个变量引用的是同一对象。而基本类型的值赋给另一个变量时，会创建一个新的值并赋给新的变量。

</details>

## 62. 箭头函数解决了什么问题 {#question-bc85fae4-ca41-474a-be03-d670813510a3}

> 难度：1 · 类型：QA

### 题目要点

箭头函数是ES6中引入的一种新的函数语法，它主要解决了以下几个问题：

<details>
<summary>参考答案</summary>

箭头函数是ES6中引入的一种新的函数语法，它主要解决了以下几个问题：

1. **简化函数表达式**：箭头函数提供了一种更简洁的函数定义方式，可以用更短的语法来定义函数，减少了冗余的代码。例如，使用箭头函数可以将一个函数表达式 `function(x) { return x * x; }` 简化为 `(x) => x * x;`。

2. **简化this的指向**：在传统的函数定义中，函数内部的`this`指向的是调用该函数的对象。而在箭头函数中，`this`的指向是在定义函数时确定的，指向的是箭头函数所在的上下文。这解决了传统函数中`this`指向容易混淆的问题，使得代码更加易读和简洁。

3. **消除了`arguments`对象**：在箭头函数中，不存在`arguments`对象，这是因为箭头函数没有自己的`arguments`，它继承了所在上下文的`arguments`。这样可以避免在传统函数中使用`arguments`对象时出现的一些问题，如无法使用`arguments`对象的一些方法，以及与命名参数的冲突等。

4. **适用于回调函数**：箭头函数的简洁性和对`this`指向的处理使其特别适用于作为回调函数使用。在传统的函数定义中，由于`this`指向的问题，经常需要使用额外的变量来绑定`this`，而箭头函数可以直接使用外层作用域的`this`，减少了代码的复杂性。

箭头函数也有一些限制和注意事项，例如箭头函数没有自己的`arguments`、`super`和`new.target`，不能作为构造函数使用。

</details>

## 63. 副作用是什么概念 {#question-d9ef975e-fcc8-4034-b619-87c98802e021}

> 难度：2 · 类型：QA

### 题目要点

在 JavaScript 中，`副作用（side effect）`是指函数或表达式在执行过程中对外部环境产生的影响，而不仅仅是返回一个值。副作用可能包括但不限于对全局变量、参数、数据结构、文件系统、网络请求等进行修改。

<details>
<summary>参考答案</summary>

在 JavaScript 中，`副作用（side effect）`是指函数或表达式在执行过程中对外部环境产生的影响，而不仅仅是返回一个值。副作用可能包括但不限于对全局变量、参数、数据结构、文件系统、网络请求等进行修改。

副作用可以是有意为之，也可以是无意之间发生的。在函数式编程中，减少副作用是一种被推崇的编程风格，因为副作用使得代码的行为更难以跟踪和理解，容易引发不可预见的 bug。尽可能减少副作用有助于代码更加可靠、可测试和易于维护。

以下是一些常见的 JavaScript 中可能产生副作用的操作：

1. **修改全局变量**：直接对全局变量进行赋值或修改会导致副作用。
2. **修改函数参数**：修改传入函数的参数值也会引起副作用。
3. **`I/O` 操作**：与文件系统、网络请求等进行交互时，可能会对外部环境产生副作用。
4. **修改数据结构**：对数组、对象等数据结构进行添加、删除或修改操作会改变它们的状态，也属于副作用。

在函数式编程中，函数应该尽量避免产生副作用，而是通过纯函数的方式，根据输入返回一个确定的输出，不修改外部环境的状态。
这样可以提高代码的可测试性、可复用性和可维护性。

</details>

## 64. JS 中如何实现大对象深度对比 {#question-9dca4260-e672-471d-91b6-19a7cc16d876}

> 难度：2.5 · 类型：QA

### 题目要点

- **递归方法**：适合对比一般对象，能够控制对比过程，但实现复杂度较高。
- **`JSON.stringify()`**：实现简单，但有一定局限性，不支持特殊值、顺序敏感。
- **第三方库**：推荐使用 Lodash 或 `fast-deep-equal`，性能高、功能全面，适合处理复杂对象。

<details>
<summary>参考答案</summary>

深度对比两个大对象意味着要递归地比较对象中的所有属性，包括嵌套的对象和数组。由于 JavaScript 的对象是引用类型，我们需要比较对象的每个属性的值，而不仅仅是引用。

有以下几种方法来实现深度对比：

### **1. 使用递归实现深度对比**
通过递归遍历对象的每一层，比较它们的值，如果遇到嵌套的对象或数组，则继续递归比较。

#### 示例代码：
```javascript
function deepEqual(obj1, obj2) {
  // 如果两个对象引用相同，直接返回 true
  if (obj1 === obj2) return true;

  // 如果两个不是对象或其中一个是 null，返回 false
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // 获取对象的所有属性名
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  // 如果对象的属性数不同，返回 false
  if (keys1.length !== keys2.length) return false;

  // 递归对比每个属性
  for (let key of keys1) {
    if (!keys2.includes(key)) {
      return false; // 如果 obj2 中没有这个属性，返回 false
    }
    if (!deepEqual(obj1[key], obj2[key])) {
      return false; // 如果属性的值不同，返回 false
    }
  }

  return true;
}

// 示例
const obj1 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj2 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj3 = { a: 1, b: { x: 10, y: 30 }, c: [1, 2, 3] };

console.log(deepEqual(obj1, obj2)); // true
console.log(deepEqual(obj1, obj3)); // false
```

#### 解释：
- 首先判断 `obj1` 和 `obj2` 是否完全相等（包括引用类型的比较）。
- 如果有一个是基本类型（非对象），直接返回 `false`。
- 然后比较对象的属性数量，如果数量不等，直接返回 `false`。
- 最后，递归比较对象每一层的属性值，直到底层属性对比完成。

---

### **2. 使用 `JSON.stringify()` 方法实现深度对比**
这种方法将对象转为 JSON 字符串，再进行比较。简单高效，但有一定的局限性：
- **限制**：无法处理 `undefined`、`function`、`symbol` 等特殊值，且顺序不同的对象属性会导致不同的字符串。

#### 示例代码：
```javascript
function deepEqualJSON(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// 示例
const obj1 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj2 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj3 = { a: 1, b: { x: 10, y: 30 }, c: [1, 2, 3] };

console.log(deepEqualJSON(obj1, obj2)); // true
console.log(deepEqualJSON(obj1, obj3)); // false
```

#### 解释：
- `JSON.stringify()` 将对象转换为 JSON 字符串，简单地进行字符串比较。
- **注意**：该方法对于循环引用、`undefined`、`function` 等值有一定局限，且对象的键值顺序会影响结果。

---

### **3. 使用第三方库**
有很多第三方库提供了更为高效且全面的深度比较功能。例如：
- **Lodash** 提供了 `_.isEqual()` 方法。
- **Fast-deep-equal** 是一个专门用于深度对比的小型库，性能较高。

#### 示例：使用 Lodash
```javascript
// 安装 lodash
// npm install lodash

const _ = require('lodash');

const obj1 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj2 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj3 = { a: 1, b: { x: 10, y: 30 }, c: [1, 2, 3] };

console.log(_.isEqual(obj1, obj2)); // true
console.log(_.isEqual(obj1, obj3)); // false
```

#### 示例：使用 `fast-deep-equal`
```javascript
// 安装 fast-deep-equal
// npm install fast-deep-equal

const deepEqual = require('fast-deep-equal');

const obj1 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj2 = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] };
const obj3 = { a: 1, b: { x: 10, y: 30 }, c: [1, 2, 3] };

console.log(deepEqual(obj1, obj2)); // true
console.log(deepEqual(obj1, obj3)); // false
```

#### 解释：
- 使用 Lodash 或 `fast-deep-equal` 可以避免手动实现深度对比，性能较好，且支持更多复杂场景（如日期、循环引用等）。

</details>

## 65. 什么是匿名函数？ {#question-cd8610f3-6c27-4b95-a657-c9d018b4ad23}

> 难度：1 · 类型：QA

### 题目要点

在JavaScript中，匿名函数是一种没有名称的函数。它是一种可以直接被定义和使用的函数，而不需要通过函数名进行引用。匿名函数通常用于需要临时定义一个函数并在某个地方立即调用它的情况下使用。

<details>
<summary>参考答案</summary>

## 匿名函数

在JavaScript中，匿名函数是一种没有名称的函数。它是一种可以直接被定义和使用的函数，而不需要通过函数名进行引用。匿名函数通常用于需要临时定义一个函数并在某个地方立即调用它的情况下使用。

匿名函数可以使用两种方式进行定义：函数表达式和箭头函数。

1. 函数表达式：
   ```javascript
   var func = function() {
     // 函数的代码块
   };
   ```
   在上述代码中，我们定义了一个没有名称的函数，并将其赋值给了变量`func`。这个函数可以通过`func`变量进行调用。

2. 箭头函数：
   ```javascript
   var func = () => {
     // 函数的代码块
   };
   ```
   箭头函数是ES6引入的一种简化的函数表达式。它使用箭头（=>）来定义函数，并且没有自己的this值，继承了外层作用域的this值。

匿名函数常用于以下场景：

- 作为回调函数：匿名函数可以作为参数传递给其他函数，并在需要的时候被调用，例如事件处理函数、定时器回调等。
- 自执行函数：匿名函数可以在定义后立即调用，避免在全局作用域中定义过多的变量。
- 模块化开发：匿名函数可以用于封装私有变量和方法，实现模块化的开发和避免变量名冲突。

需要注意的是，由于匿名函数没有名字，所以在调试和异常追踪时可能会比较困难，因此在开发中建议给函数命名，以提高代码的可读性和可维护性。

**追问: function 是匿名函数吗?**

在JavaScript中，`function`关键字用于定义函数，而不是匿名函数。`function`关键字后面可以跟一个函数名，用于定义具名函数，也可以省略函数名，定义匿名函数。

具名函数示例：
```javascript
function add(a, b) {
  return a + b;
}
```
上述代码中的`add`函数是一个具名函数，可以通过函数名`add`进行引用和调用。

匿名函数示例：
```javascript
var sum = function(a, b) {
  return a + b;
};
```
上述代码中的`sum`是一个匿名函数，它没有名称，但可以通过变量`sum`进行引用和调用。

可以看到，具名函数和匿名函数的区别在于函数名的存在与否。具名函数可以在函数内部和外部通过函数名进行引用和调用，而匿名函数则需要通过赋值给变量或作为参数传递给其他函数来引用和调用。

需要注意的是，在使用函数表达式定义匿名函数时，函数名是可选的，但在使用函数声明定义具名函数时，函数名是必需的，且函数声明的语法要求将函数名和函数体写在一起。

</details>

## 66. splice 和 slice 有什么区别？ {#question-2290b1c2-ef7e-4152-81b0-5de2bb3c4adf}

> 难度：0.5 · 类型：QA

### 题目要点

- `splice` 可以修改数组本身
- `slice` 只是选取数组的一部分，只读的

<details>
<summary>参考答案</summary>

**关键词**：Array 方法 splice、Array 方法 slice、splice 和 slice 区别

`splice()` 和 `slice()` 是 JavaScript 中用于操作数组的两个方法，它们的功能和用法有一些区别。

1. `splice()` 方法：
   - 功能：从数组中添加、删除或替换元素。
   - 用法：`array.splice(start, deleteCount, item1, item2, ...)`。
   - 参数：
      - `start`：表示修改的起始位置的下标。
      - `deleteCount`：可选参数，表示要删除的元素数量。
      - `item1, item2, ...`：可选参数，表示要添加到数组的元素。
   - 返回值：返回一个被删除元素组成的数组。

2. `slice()` 方法：
   - 功能：从数组中提取指定范围内的元素，返回一个新的数组。
   - 用法：`array.slice(start, end)`。
   - 参数：
      - `start`：可选参数，表示提取的起始位置的下标。
      - `end`：可选参数，表示提取的结束位置的下标（不包含该位置的元素）。
   - 返回值：返回一个新的数组，包含提取出的元素。

主要区别：
- `splice()` 方法会对原数组进行修改，而 `slice()` 方法不会修改原数组，而是返回一个新的数组。
- `splice()` 方法可以在指定位置添加、删除或替换元素，而 `slice()` 方法只能提取指定范围内的元素。
- `splice()` 方法返回被删除的元素组成的数组，而 `slice()` 方法返回一个新的数组。

总结：
- 如果需要修改原数组，并且需要添加、删除或替换元素，可以使用 `splice()` 方法。
- 如果只是需要提取指定范围内的元素，并且不想修改原数组，可以使用 `slice()` 方法。

</details>

## 67. JavaScript 和 BOM、DOM 、ECMAScript、Nodejs 之间是什么关系 {#question-ac53c402-1c0b-4ccc-b8f0-c629bf0260bf}

> 难度：0.5 · 类型：QA

### 题目要点

**ECMAScript**

<details>
<summary>参考答案</summary>

**ECMAScript**

`ECMAScript`是`JavaScript`的标准化规范，它定义了`JavaScript`的语法、数据类型、函数、控制流等。`ECMAScript`最早在1997年发布，由欧洲计算机制造商协会（ECMA）负责制定和维护。

`ECMAScript`的目的是为了确保不同厂商的`JavaScript`实现在语法和行为方面保持一致性，以便开发者能够轻松地编写跨平台、跨浏览器的`JavaScript`代码。标准化的`ECMAScript`规范使得开发者可以在不同的`JavaScript`环境中编写相同的代码，而不必担心语法差异和行为不一致性。

`ECMAScript`规范每年进行一次更新，新版本通常包含了新的语法特性、API和改进。在每个`ECMAScript`版本发布之前，由各个浏览器厂商先行实现并测试新特性，然后将其添加到浏览器中。这就是为什么不同浏览器可能对同一版本的`ECMAScript`支持程度不同的原因。

常见的`ECMAScript`版本包括ES5（2009年发布）、ES6（2015年发布，也被称为ES2015）、ES7（2016年发布，也被称为ES2016）等。每个版本都引入了新的语法和功能，使得`JavaScript`变得更加强大和灵活。开发者可以根据目标浏览器的支持情况选择使用不同版本的`ECMAScript`特性。

**JavaScript**是一种高级编程语言，用于为网页添加交互和动态功能。它实现了ECMAScript标准，该标准定义了`JavaScript`的语法、数据类型、函数、控制流等。`JavaScript`是一种解释性脚本语言，代码在运行时由浏览器解析和执行。

**BOM**（Browser Object Model） 是浏览器对象模型，它提供了与浏览器交互的API。`BOM`并不是ECMAScript的一部分，而是浏览器厂商自行实现的一组对象和方法。通过`BOM`，开发者可以操作浏览器窗口、解析URL、发送HTTP请求、控制浏览器历史记录等。其中最常见的`BOM`对象是window对象，它代表了浏览器的窗口或框架。

**DOM**（Document Object Model） 是文档对象模型，它定义了用于访问和操作HTML、XML等文档的API。`DOM`提供了一组对象和方法，用于表示文档的结构和内容。通过`DOM`，开发者可以通过`JavaScript`动态地创建、修改和删除HTML元素，修改样式和属性，处理事件等。`DOM`也不是ECMAScript的一部分，而是由浏览器厂商实现的标准。

**Node.js**是一个基于V8引擎的`JavaScript`运行时环境，使`JavaScript`可以在服务器端运行。与浏览器中的`JavaScript`不同，`Node.js`提供了一组基于事件驱动的API，用于构建高性能和可伸缩的网络应用程序。`Node.js`可以执行文件操作、网络通信、数据库访问等服务器端任务，并且可以通过包管理器npm安装和管理第三方模块。

总结来说，`JavaScript`是一种编程语言，实现了ECMAScript标准。`BOM`和`DOM`是浏览器提供的API，用于与浏览器交互并操作文档。`Node.js`是一个独立的运行时环境，使`JavaScript`可以在服务器端运行，并提供了一组用于构建网络应用程序的API。

</details>

## 68. JavaScript 是怎么做内存管理的？ {#question-7e744ea0-1c66-4ef9-b984-bb8828d98279}

> 难度：3 · 类型：QA

### 题目要点

JavaScript 的内存管理主要依赖于自动垃圾回收机制，利用堆和栈两种内存区域来管理内存分配和释放。虽然开发者不需要手动管理内存，但仍需注意内存泄漏的可能性，通过良好的编程习惯和优化策略来提升内存使用效率。

<details>
<summary>参考答案</summary>

JavaScript 的内存管理主要依赖于自动垃圾回收机制。以下是内存管理的几个关键点：

### **1. 内存分配**

- **堆与栈**：JavaScript 使用堆（Heap）和栈（Stack）两种内存区域。基本数据类型（如数字、字符串、布尔值）通常存储在栈中，而对象和数组等复杂类型则存储在堆中。

### **2. 垃圾回收**

- **自动垃圾回收**：JavaScript 使用垃圾回收器（Garbage Collector，GC）自动管理内存。开发者不需要手动释放内存。

- **引用计数**：一种垃圾回收策略，通过跟踪对象的引用数量来判断是否可以回收。当引用计数为零时，对象会被回收。

- **标记-清除算法**：最常用的垃圾回收算法。首先，GC 标记活动对象（从根对象出发遍历），然后清除未被标记的对象，释放其占用的内存。

### **3. 内存泄漏**

- **内存泄漏**：当不再使用的对象仍被引用，导致内存无法被回收。常见原因包括：
  - 全局变量的使用。
  - 闭包中引用外部变量。
  - 事件监听器未被移除。

### **4. 优化内存使用**

- **减少全局变量**：尽量使用局部变量，避免全局作用域中的变量占用内存。

- **及时清理引用**：在不再需要对象时，及时将其引用设为 `null`，帮助 GC 识别可回收的对象。

- **避免循环引用**：确保对象之间的循环引用不会导致内存泄漏，特别是在使用闭包时。

</details>

## 69. JavaScript 中， 隐藏类是什么概念？ {#question-cd3ffbb1-582b-4d92-be2d-baeda2c8d050}

> 难度：1.5 · 类型：QA

### 题目要点

隐藏类是JavaScript引擎中的一种优化技术（**并不是JavaScript语言中的某个类**！！），用于提高对象访问的性能。隐藏类是一种数据结构，用于跟踪对象的属性和方法的布局和类型，以便在代码运行时能够快速访问它们。

<details>
<summary>参考答案</summary>

## JavaScript隐藏类

隐藏类是JavaScript引擎中的一种优化技术（**并不是JavaScript语言中的某个类**！！），用于提高对象访问的性能。隐藏类是一种数据结构，用于跟踪对象的属性和方法的布局和类型，以便在代码运行时能够快速访问它们。

当JavaScript引擎在执行代码时，会动态地创建对象的隐藏类。隐藏类会跟踪对象的属性和方法，并为它们分配固定的内存偏移量。每当对象的属性和方法发生变化时，隐藏类会根据变化的情况进行更新。

使用隐藏类可以提高代码的执行速度，因为JavaScript引擎可以根据隐藏类的信息来直接定位和访问对象的属性和方法，而不需要进行动态查找或解析。这种优化技术可以减少对象访问的开销，提高代码的性能。

需要注意的是，隐藏类是在运行时动态创建的，因此代码中创建对象的顺序和属性的添加顺序都会影响隐藏类的生成。如果对象的属性添加顺序不一致，可能会导致隐藏类的生成不一致，从而降低代码的性能。

隐藏类是现代JavaScript引擎（如V8、SpiderMonkey等）中的一项重要优化技术，可以显著提高JavaScript代码的执行速度。

下面是一个使用隐藏类的简单示例：

```javascript
function MyClass(a, b) {
  this.prop1 = a;
  this.prop2 = b;
}

MyClass.prototype.method1 = function() {
  console.log("Method 1");
};

MyClass.prototype.method2 = function() {
  console.log("Method 2");
};

var obj1 = new MyClass(10, 20);
var obj2 = new MyClass(30, 40);

obj1.method1(); // 输出 "Method 1"
obj2.method2(); // 输出 "Method 2"
```

在上面的示例中，我们创建了一个名为`MyClass`的类，它有两个属性`prop1`和`prop2`，以及两个方法`method1`和`method2`。我们用`new`关键字创建了两个实例`obj1`和`obj2`。

当我们使用隐藏类优化的JavaScript引擎运行这段代码时，它会动态地创建隐藏类来跟踪`MyClass`的属性和方法。每个实例都会有一个关联的隐藏类，它包含了实例的属性和方法的布局和类型信息。

在调用`obj1.method1()`和`obj2.method2()`时，JavaScript引擎会使用隐藏类的信息来直接定位并执行相应的方法，而不需要进行动态查找和解析，从而提高了代码的执行速度。

需要注意的是，这只是一个简单的示例，实际上隐藏类的优化是更复杂和细致的。不同的引擎可能会有不同的隐藏类实现方式，并且隐藏类的生成和优化过程会受到许多因素的影响，如代码的结构、对象的属性访问模式等。

</details>

## 70. 实现一个函数， 计算两个日期之间的天数差 {#question-5794f8b9-0953-450d-9035-1a1b2575d7d8}

> 难度：1 · 类型：QA

### 题目要点

以下是使用JavaScript实现计算两个日期之间的天数差的函数：

<details>
<summary>参考答案</summary>

以下是使用JavaScript实现计算两个日期之间的天数差的函数：

```javascript
function calculateDateDifference(date1, date2) {
  // 确保输入的日期是 Date 对象
    const startDate = new Date(date1);
    const endDate = new Date(date2);

    // 计算时间差（以毫秒为单位）
    const timeDifference = endDate - startDate;

    // 计算天数差
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}

// 示例用法
const date1 = '2022-01-01';
const date2 = '2022-01-10';

const difference = calculateDateDifference(date1, date2);
console.log(difference); // 输出结果为 9
```

上述函数首先将两个日期字符串转换为Date对象，然后计算两个日期对象之间的时间差（以毫秒表示），最后将时间差转换为天数。通过调用`calculateDateDifference`函数，可以获取两个日期之间的天数差。

</details>

## 71. 实现日期格式化 format 函数 {#question-9e75bdd5-d3aa-4840-8842-9d4dcf7b1c24}

> 难度：1 · 类型：QA

### 题目要点

以下是使用JavaScript实现日期格式化的`format`函数：

<details>
<summary>参考答案</summary>

```ts
// js 实现日期的  format 函数
//
// YYYY 对应年
// MM 对应月
// DD 对应日
//
// HH 对应 24 小时制度
// hh 对应 12 小时制度
// mm 对应分钟
// ss 对应秒

const date = new Date();
const formattedDate = date.format('YYYY-MM-DD HH:mm:ss');
console.log(formattedDate); // 输出结果为当前日期和时间的格式化字符串
```

以下是使用JavaScript实现日期格式化的`format`函数：

```javascript
// 挂载到Date对象原型上
Date.prototype.format = function (format) {
  const date = this;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  format = format.replace('YYYY', year);
  format = format.replace('MM', month.toString().padStart(2, '0'));
  format = format.replace('DD', day.toString().padStart(2, '0'));
  format = format.replace('HH', hours.toString().padStart(2, '0'));
  format = format.replace('hh', (hours % 12).toString().padStart(2, '0'));
  format = format.replace('mm', minutes.toString().padStart(2, '0'));
  format = format.replace('ss', seconds.toString().padStart(2, '0'));

  return format;
};

// 示例用法
const date = new Date();
const formattedDate = date.format('YYYY-MM-DD HH:mm:ss');
console.log(formattedDate); // 输出结果为当前日期和时间的格式化字符串
```

上述代码中，我们通过在`Date`对象的原型上定义`format`函数，使得所有的`Date`对象都可以调用`format`函数进行日期格式化。在函数内部，我们使用`getFullYear`、`getMonth`、`getDate`等方法获取日期的年、月、日、时、分、秒的值，并将其替换到传入的`format`字符串中对应的占位符。最后返回格式化后的字符串。

</details>

## 72. Object 对象有哪些场景 api ？ {#question-10e5f89d-fd0e-4064-8b41-951b25692c9c}

> 难度：0.5 · 类型：QA

### 题目要点

**关键词**：Object对象api

<details>
<summary>参考答案</summary>

**关键词**：Object对象api

| 方法/属性                      | 描述                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `Object.keys(obj)`             | 返回一个由给定对象的所有可枚举自身属性的名称组成的数组         |
| `Object.values(obj)`           | 返回一个给定对象所有可枚举属性值的数组                         |
| `Object.entries(obj)`          | 返回一个给定对象自身可枚举属性的 [key, value] 数组            |
| `Object.assign(target, ...sources)` | 将一个或多个源对象的可枚举属性复制到目标对象，并返回目标对象   |
| `Object.create(proto, [propertiesObject])` | 使用指定的原型对象和属性创建一个新对象                      |
| `Object.defineProperty(obj, prop, descriptor)` | 定义对象中的新属性或修改现有属性的配置                      |
| `Object.getOwnPropertyDescriptor(obj, prop)` | 返回指定对象上一个自有属性对应的属性描述符                  |
| `Object.freeze(obj)`           | 冻结一个对象，使其属性无法修改、添加或删除                     |
| `Object.is(value1, value2)`    | 判断两个值是否相同                                           |
| `Object.seal(obj)`             | 封闭一个对象，防止向对象添加新属性，但允许修改或删除现有属性    |
| `Object.getPrototypeOf(obj)`   | 返回指定对象的原型（`__proto__`）                            |
| `Object.setPrototypeOf(obj, proto)` | 设置指定对象的原型（`__proto__`）                            |

</details>

## 73. 如何拦截 web 应用的请求 {#question-7e472936-4590-4359-b936-396f6fce7125}

> 难度：2 · 类型：QA

### 题目要点

在前端拦截和处理 Web 应用的所有请求，可以使用以下方法：

<details>
<summary>参考答案</summary>

在前端拦截和处理 Web 应用的所有请求，可以使用以下方法：

1. **使用 Fetch 或 XMLHttpRequest**：在前端代码中使用 Fetch API 或 XMLHttpRequest 对象发送请求。通过拦截 Fetch 或 XMLHttpRequest 对象的 open 和 send 方法，可以在请求发出前进行拦截和修改。这样可以捕获请求的相关信息，并进行相应的处理。

示例代码（使用 Fetch API）：

```javascript
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  // 在请求发出前进行拦截和处理
  console.log('拦截到请求:', url);

  // 可以修改请求的相关信息
  // options.headers['Authorization'] = 'Bearer token';

  return originalFetch.apply(this, arguments);
};
```

2. **使用 Service Worker：Service Worker** 是一种在浏览器背后运行的脚本，可以拦截和处理网络请求。通过注册一个 Service Worker，可以在其中监听和处理请求事件。从而实现拦截和处理 Web 应用的所有请求。

示例代码：

```javascript
self.addEventListener('fetch', function(event) {
  // 在请求发出前进行拦截和处理
  console.log('拦截到请求:', event.request.url);

  // 可以修改请求的相关信息
  // event.request.headers.set('Authorization', 'Bearer token');

  event.respondWith(fetch(event.request));
});
```

需要注意的是，前端拦截和处理请求只能在客户端进行，对于服务器端的请求无法拦截。此外，拦截和处理请求可能会对性能产生一定的影响，因此要根据实际情况进行权衡和调优。同时，对于一些敏感信息（如密码、个人信息等），应该谨慎处理，确保安全性。

3. **如果是使用是三方请求库， 比如 aixos** ， 可以直接使用三方库提供的能力

是的，使用 axios 也可以拦截请求。axios 提供了拦截器（interceptors）的功能，可以在请求发出前进行拦截和处理。

示例代码：

```javascript
import axios from 'axios';

// 请求拦截器
axios.interceptors.request.use(function (config) {
  // 在请求发出前进行拦截和处理
  console.log('拦截到请求:', config.url);

  // 可以修改请求的相关信息
  // config.headers['Authorization'] = 'Bearer token';

  return config;
}, function (error) {
  return Promise.reject(error);
});

// 发送请求
axios.get('/api/data')
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
```
在上述代码中，通过使用 `interceptors.request` 方法，可以对请求进行拦截和处理。在拦截器函数中，可以修改请求的相关信息，并返回修改后的配置对象。

使用 axios 拦截请求只能在客户端进行，对服务器端的请求无法拦截。同样需要谨慎处理敏感信息，并确保安全性。

</details>

## 74. JS 代码放在 head 里和放在 body 里有什么区别？ {#question-782eb4eb-d0d0-4f72-a141-90167bab6cff}

> 难度：1 · 类型：QA

### 题目要点

JavaScript 脚本文件（JS）放置在 **`<head>`** 和 **`<body>`** 的位置会对页面的加载和性能产生不同的影响，主要区别在于 **加载顺序** 和 **页面渲染**。

<details>
<summary>参考答案</summary>

JavaScript 脚本文件（JS）放置在 **`<head>`** 和 **`<body>`** 的位置会对页面的加载和性能产生不同的影响，主要区别在于 **加载顺序** 和 **页面渲染**。

---

### **1. JS 放在 `<head>`**

#### **特点**：
- **优先加载脚本**：<br>
  浏览器在解析 HTML 时会先加载和执行 `<head>` 中的脚本文件，然后再继续解析和渲染后续的 HTML 文档。
- **可能阻塞页面渲染**：<br>
  如果脚本文件加载时间较长，可能会阻塞页面的解析，导致页面内容迟迟不能显示（**Render Blocking**）。

#### **适用场景**：
- **必须先加载的脚本**：<br>
  如页面需要依赖的基础框架、全局配置、`CSS` 处理脚本（如动态生成 CSS）、Polyfill 等。
- **必须立即执行的逻辑**：<br>
  如初始化代码（页面需要立刻依赖某些 JS 才能正常渲染）。

---

### **2. JS 放在 `<body>` 末尾**

#### **特点**：
- **优先渲染页面内容**：<br>
  浏览器会优先解析和渲染 HTML 和 CSS，然后再加载和执行 `<body>` 末尾的脚本。
- **避免阻塞渲染**：<br>
  将脚本放在文档的末尾，页面可以更快地显示内容，改善用户体验。

#### **适用场景**：
- **脚本依赖 DOM**：<br>
  脚本执行时需要操作页面的 DOM 元素，确保 DOM 已被完全解析。
- **非关键脚本**：<br>
  如统计工具、交互特效等非页面初始渲染所必须的脚本。

---

### **3. 使用 `&lt;script&gt;` 的属性调整加载方式**

如果希望控制脚本加载的顺序和方式，可以结合以下属性：

#### **1. `defer`**
- **延迟执行脚本**：<br>
  脚本会在 HTML 解析完成后才执行，但多个带 `defer` 的脚本会按照它们在页面中的顺序依次执行。
- **推荐放在 `<head>` 中**：<br>
  适合需要在 DOM 完全解析后运行的脚本。

#### 示例：
```html
<head>
  <script src="script.js" defer></script>
</head>
```

#### **2. `async`**
- **异步加载脚本**：<br>
  脚本会与 HTML 同时加载，加载完成后立即执行（不保证顺序）。
- **适用于独立脚本**：<br>
  如广告或统计脚本，不依赖其他资源或顺序。

#### 示例：
```html
<head>
  <script src="script.js" async></script>
</head>
```

---

### **对比总结**

| 放置位置      | 优点                                                 | 缺点                                       | 适用场景                            |
|---------------|-----------------------------------------------------|-------------------------------------------|-------------------------------------|
| `<head>`      | 优先加载关键脚本，确保全局依赖可用                   | 可能阻塞页面渲染，影响首屏性能             | 核心依赖、Polyfill                  |
| `<body>` 末尾 | 避免阻塞渲染，用户体验更好                          | 脚本加载延迟，需等待 DOM 解析完成          | DOM 操作脚本、非核心功能            |
| `defer`       | 避免阻塞渲染，且脚本按顺序执行                      | 仅支持外部脚本                            | DOM 依赖脚本、顺序执行的脚本         |
| `async`       | 加载速度最快，不阻塞渲染                             | 脚本执行顺序不确定，可能导致依赖错误       | 独立脚本（广告、分析工具等）         |

---

### **最佳实践**

1. **优先保证首屏性能**：<br>
   - 将影响页面内容渲染的脚本放在 `<head>` 中，结合 `defer`。
   - 将非必要脚本放在 `<body>` 末尾，或者使用 `async` 加载。

2. **分析依赖关系**：<br>
   - 如果脚本依赖 DOM 元素，确保脚本在 DOM 加载完成后再执行。
   - 如果脚本依赖其他脚本，使用 `defer` 确保执行顺序。

3. **结合工具优化**：<br>
   - 使用工具（如 Webpack 或 Vite）拆分脚本，按需加载，减少首次加载体积。

通过合理规划脚本的位置和加载方式，可以在确保功能的同时优化页面性能和用户体验。

</details>

## 75. JS 的严格模式有什么作用？ {#question-f8a8da26-5e61-430f-8a22-20f84e3fdbbb}

> 难度：1 · 类型：QA

### 题目要点

**JavaScript 的严格模式** 提供了一种更严格的执行环境，它可以帮助开发者：
- 捕获潜在的错误（如使用未声明的变量、删除不可删除的属性等）。
- 提高代码的安全性和性能。
- 强制遵循更严格的规范，从而使代码更加可靠和易于维护。

通过启用严格模式，开发者能够提前发现许多常见的 JavaScript 错误，使得代码更符合现代 JavaScript 的规范，减少潜在的漏洞。

<details>
<summary>参考答案</summary>

**JavaScript 严格模式（Strict Mode）** 是一种以更严格的规则来解析和执行 JavaScript 代码的模式。启用严格模式后，JavaScript 引擎会对代码中的一些不安全、不规范或不推荐使用的做法进行限制，从而提高代码的可靠性、可维护性和安全性。

### **启用严格模式**
严格模式可以通过两种方式启用：

1. **全局严格模式**：直接在脚本的最顶部启用。
   ```javascript
   'use strict';  // 在文件顶部启用严格模式
   ```

2. **函数严格模式**：在函数内部启用严格模式。
   ```javascript
   function myFunction() {
     'use strict';  // 在函数内部启用严格模式
     // 函数体
   }
   ```

### **严格模式的主要特点与用途**

1. **防止意外创建全局变量**
   - 在严格模式下，声明未使用 `var`, `let`, `const` 的变量会抛出错误。避免由于拼写错误或未声明的变量导致全局变量被创建。
   ```javascript
   'use strict';
   x = 10;  // 报错：x is not defined
   ```

2. **禁止删除变量、函数和函数参数**
   - 在严格模式下，不能删除变量、函数或函数的参数，删除操作会抛出错误。
   ```javascript
   'use strict';
   var x = 5;
   delete x;  // 报错：Cannot delete variable 'x'
   ```

3. **禁止使用 `with` 语句**
   - `with` 语句会导致作用域链的动态变化，增加代码理解的难度，容易产生意料之外的错误。严格模式下禁止使用 `with`。
   ```javascript
   'use strict';
   with (Math) {  // 报错：Strict mode code may not include a with statement
     x = cos(2);
   }
   ```

4. **更严格的 `this` 绑定**
   - 在非严格模式下，`this` 在全局上下文中会指向 `window`（浏览器中）或 `global`（Node.js 中）。在严格模式下，`this` 会被设置为 `undefined`，如果没有显式绑定 `this`，就不会隐式地指向全局对象。
   ```javascript
   'use strict';
   console.log(this);  // undefined
   ```

5. **禁用重复的参数名**
   - 在严格模式下，函数参数不能有重复的参数名。这样可以避免在函数内部对同一参数的混淆。
   ```javascript
   'use strict';
   function foo(a, a) {  // 报错：Duplicate parameter name not allowed in this context
     return a;
   }
   ```

6. **写保护的对象属性**
   - 严格模式下，试图修改一个 `readonly` 或 `getter` 只读属性时会抛出错误。
   ```javascript
   'use strict';
   const obj = Object.freeze({x: 10});
   obj.x = 20;  // 报错：Cannot assign to read only property 'x'
   ```

7. **`eval` 不会污染作用域**
   - 在严格模式下，`eval` 不会引入新的变量或函数，避免了 `eval` 的安全隐患。
   ```javascript
   'use strict';
   eval('var x = 2');
   console.log(x);  // 报错：x is not defined
   ```

8. **禁止使用 `arguments.callee` 和 `arguments.caller`**
   - 严格模式下，`arguments.callee`（指向当前正在执行的函数）和 `arguments.caller`（指向调用当前函数的函数）被禁用，减少了与函数调用栈的耦合，避免潜在的安全问题。
   ```javascript
   'use strict';
   function foo() {
     console.log(arguments.callee);  // 报错：arguments.callee is not allowed in strict mode
   }
   ```

9. **改进的错误处理**
   - 严格模式下，许多常见的 JavaScript 错误会抛出异常。例如，给只读属性赋值、对函数参数重新赋值等操作都会导致错误。
   ```javascript
   'use strict';
   function foo(a) {
     a = 10;  // 报错：Cannot assign to a function parameter
   }
   ```

10. **改进的垃圾回收**
    - 在严格模式下，垃圾回收会变得更有效，因为它禁止了某些不必要的语言特性（如 `with`），这会使得变量作用域的分析更加清晰，从而更容易进行垃圾回收。

### **严格模式的优点**

1. **减少错误**：
   严格模式能够捕获一些常见的错误，比如意外创建全局变量、禁止使用 `with` 等，从而避免了很多潜在的错误。

2. **提高性能**：
   由于严格模式消除了某些不安全的特性，JavaScript 引擎可以对严格模式下的代码进行更高效的优化。

3. **增强代码安全性**：
   禁止一些不安全的操作（如删除变量、修改只读属性等），有助于提高代码的安全性。

4. **代码更易于维护**：
   严格模式有助于减少代码中的不规范写法，使得代码风格更加统一、清晰，便于团队开发和维护。

5. **减少了全局作用域污染**：
   严格模式下，全局作用域污染问题被大大减少。未声明的变量会报错，避免了隐式的全局变量创建。

</details>

## 76. JS 的严格模式为什么会禁用 with 语句？ {#question-08a2eaf4-dafc-44a5-aee6-ad30d65a003d}

> 难度：3 · 类型：QA

### 题目要点

JavaScript 严格模式禁用 `with` 语句，主要是为了：
- 防止作用域不明确的问题，避免动态作用域带来的意外行为。
- 提高代码的可分析性和优化空间。
- 避免由于作用域链的动态变化引发变量冲突。
- 强制开发者书写更简洁、清晰、易于维护的代码。
- 降低代码的复杂度，提升代码的安全性和可预测性。

因此，尽管 `with` 语句在某些情况下看似方便，但它的使用会导致不可控的副作用，并且让代码变得更加难以维护。在严格模式中禁用它，是为了强制开发者使用更明确、更易维护的语法。

<details>
<summary>参考答案</summary>

主要是为了提高代码的可读性、可靠性和可维护性。`with` 语句会导致作用域的动态变化，从而给代码分析和调试带来很多困难。

具体原因可以总结为以下几点：

### 1. **作用域不明确，容易导致意外行为**
`with` 语句会修改当前作用域链，动态地将一个对象的属性添加到当前作用域中。这使得后续代码难以判断变量是来自 `with` 语句中的对象，还是来自外部的作用域，导致代码变得不直观且容易出错。

例如：
```javascript
var obj = {x: 10, y: 20};
with (obj) {
  console.log(x); // 10
  console.log(y); // 20
}
console.log(x); // 报错：x is not defined
```

在这个例子中，`x` 和 `y` 是从 `obj` 对象中提取的，但它们在外部作用域中并不存在。这种动态作用域的行为，使得程序员很难推测变量的来源，尤其是当代码变得复杂时。

### 2. **使得代码分析和优化变得困难**
在没有 `with` 的情况下，JavaScript 引擎可以更容易地分析代码的作用域和变量，进行静态分析和优化。使用 `with` 后，解释器必须做更多的动态查找和解析，这使得代码的优化变得更加复杂。

例如：
```javascript
var obj = {x: 10, y: 20};
with (obj) {
  x = 100; // 直接修改 obj.x
}
```

此时，`x` 可能会直接指向 `obj` 对象的属性，也可能被其他外部变量覆盖。引擎需要额外的步骤来判断代码意图，降低了性能优化的空间。

### 3. **易于引发变量冲突**
由于 `with` 语句会改变作用域链，可能会无意间覆盖外部的同名变量，导致不易察觉的错误。

例如：
```javascript
var x = 5;
var obj = {x: 10};
with (obj) {
  var x = 20;  // 这里覆盖了外部 x 变量
}
console.log(x);  // 20，而不是 5
```

在这个例子中，`with` 语句中的 `x` 会修改外部的 `x` 变量，这会让代码变得难以预测。开发者可能并不意识到这一点，导致程序逻辑出错。

### 4. **提升代码可读性**
使用 `with` 语句会增加代码的复杂性，降低代码的可读性和可维护性。严格模式的禁用 `with` 语句，强制开发者使用明确的作用域和变量声明，这有助于提高代码的清晰度，使得代码更易理解和维护。

例如，使用 `with` 会使得代码显得很不明确：
```javascript
with (obj) {
  x = 10;
  y = 20;
}
```

而如果没有 `with`，代码会变得更加直观和易于理解：
```javascript
obj.x = 10;
obj.y = 20;
```

### 5. **避免潜在的安全风险**
`with` 语句的作用域变化特性不仅让代码更难理解，也带来了一些潜在的安全风险。恶意的代码可以利用 `with` 来篡改或误用作用域中的变量，导致难以检测的漏洞。

</details>

## 77. 说说你对 API IntersectionObserver 的理解，它有什么使用场景？ {#question-c569f336-d60f-4fb7-88f3-7dbd61f1c435}

> 难度：2.5 · 类型：QA

### 题目要点

`IntersectionObserver` API 可以高效地处理页面中元素与视口的交集状态检测，特别适用于 **懒加载**、**无限滚动**、**广告跟踪**、**可见性监控** 和 **动画效果** 等场景。

它相比传统的滚动事件和手动计算位置的方式，具有更好的性能和响应速度，是实现现代 Web 应用时非常有价值的 API。

<details>
<summary>参考答案</summary>

`IntersectionObserver` 是一个用于监听元素与其祖先元素或视口（viewport）交叉状态的 Web API。它允许我们异步观察元素与其它元素（如视口）的交集变化，而无需通过滚动事件、resize 事件等手动监听和计算位置来实现。这使得它在处理大量元素交互或视图可见性检查时，效率更高，不容易导致性能瓶颈。

### **工作原理**

`IntersectionObserver` 主要通过以下两个概念来工作：

1. **观察目标元素**：`IntersectionObserver` 通过 `observe()` 方法开始监听一个或多个目标元素的交集变化。
2. **回调函数**：每当目标元素的可见区域或与指定视口的交集发生变化时，回调函数会被触发。回调函数会接收到一个包含多个 `IntersectionObserverEntry` 的数组，这些条目描述了每个目标元素与观察区域的交集情况。

```js
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    // entry.isIntersecting: 判断元素是否在视口内
    if (entry.isIntersecting) {
      console.log('元素进入视口');
    }
  });
}, {
  root: null,  // 视口为浏览器窗口
  rootMargin: '0px', // 视口的 margin
  threshold: 0.5 // 目标元素至少有50%进入视口时触发回调
});

// 监听目标元素
const target = document.querySelector('#target');
observer.observe(target);
```

### **主要参数说明：**

1. **root**：指定交集的根元素，通常设置为 `null`，表示视口。可以将其设置为某个容器元素，来监听该容器与目标元素的交集。
2. **rootMargin**：相对于根元素的 margin，可以通过它来拓宽或缩小视口边界（比如设置 `-100px` 来提前触发）。
3. **threshold**：一个数字或数字数组，表示目标元素与根元素交集的比例，只有交集比例满足这个阈值时，回调才会被触发。

### **返回值**

回调函数会接收到 `IntersectionObserverEntry` 的数组。每个 `IntersectionObserverEntry` 包含了以下信息：
- `target`：目标元素。
- `isIntersecting`：一个布尔值，表示目标元素是否与根元素发生交集（即是否在视口内）。
- `intersectionRatio`：交集比例，表示目标元素与根元素交集的面积占目标元素总面积的比例。
- `boundingClientRect`：目标元素的边界框（包括它的位置和尺寸）。
- `intersectionRect`：目标元素与根元素交集的区域。
- `time`：记录触发回调的时间戳。

### **使用场景**

`IntersectionObserver` 主要应用于检测元素是否在视口内，这在很多场景中都非常有用，尤其是在性能优化方面。以下是一些常见的使用场景：

#### 1. **懒加载（Lazy Loading）**
懒加载指的是只有当图片、视频、广告等元素接近视口时才加载它们。这种方式能显著提高页面加载速度，避免不必要的资源加载。

**示例：**

```js
const images = document.querySelectorAll('img.lazy-load');
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;  // 将图片的真实 src 地址设置到 img 标签上
      img.classList.remove('lazy-load');
      observer.unobserve(img);  // 停止观察该图片
    }
  });
}, {
  threshold: 0.1  // 图片至少 10% 进入视口时加载
});

images.forEach(img => {
  imageObserver.observe(img);
});
```

#### 2. **无限滚动（Infinite Scroll）**
通过 `IntersectionObserver` 来检测分页内容是否已被滚动到底部，可以触发加载更多内容的操作，优化用户体验。

**示例：**

```js
const loadMoreButton = document.querySelector('#load-more');
const loadMoreObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMore();  // 加载更多内容
    }
  });
}, {
  root: null, // 根元素为视口
  threshold: 1.0  // 目标元素完全进入视口时触发
});

loadMoreObserver.observe(loadMoreButton);
```

#### 3. **元素可见性检测（Visibility Tracking）**
可以使用 `IntersectionObserver` 检测元素是否进入视口，进而触发动画或记录元素是否被用户看到。这常用于广告展示、内容分析等场景。

**示例：**

```js
const adBanner = document.querySelector('#ad-banner');
const visibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('广告展示给用户看了');
      // 触发广告展示统计
    }
  });
}, {
  threshold: 0.5  // 至少 50% 的广告元素进入视口时触发
});

visibilityObserver.observe(adBanner);
```

#### 4. **动画效果**
`IntersectionObserver` 可用于触发滚动时的动画效果。当目标元素进入视口时，可以启动动画，例如淡入效果或平滑滚动效果。

**示例：**

```js
const elements = document.querySelectorAll('.fade-in');
const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
    }
  });
}, {
  threshold: 0.2  // 元素至少 20% 进入视口时触发动画
});

elements.forEach(element => {
  fadeInObserver.observe(element);
});
```

### **优点与性能**

- **性能优势**：与传统的 `scroll` 事件相比，`IntersectionObserver` 能更高效地处理大量元素的可见性检测。它是异步的，不会阻塞主线程，也不会频繁触发，因此能够显著减少性能开销。
- **避免不必要的计算**：使用 `IntersectionObserver`，我们可以避免在每次滚动或调整窗口大小时进行计算。它只在交集状态变化时才触发回调，使得页面响应速度更快。

</details>

## 78. documentFragment api 是什么， 有哪些使用场景？ {#question-a3c245eb-38d5-4f9d-a0f9-fea6836c292b}

> 难度：1 · 类型：QA

### 题目要点

`DocumentFragment` 是一个轻量级的 DOM 容器，允许在内存中构建 DOM 结构并进行操作，直到最后一步才将内容插入到实际页面中。它的主要优点是能够减少页面重排和重绘，提高性能，尤其适用于批量插入节点、动态内容生成和模板渲染等场景。

<details>
<summary>参考答案</summary>

### `DocumentFragment` API 介绍

`DocumentFragment` 是一个轻量级的 **Document** 对象，旨在将多个 DOM 元素操作批量化，从而提升性能。它可以理解为一个临时的“容器”，用于在内存中存储和操作 DOM 元素，但它本身并不会直接影响页面的渲染。`DocumentFragment` 的主要优势是可以减少频繁的重排（reflow）和重绘（repaint），因此在大规模操作 DOM 时，使用 `DocumentFragment` 可以显著提高性能。

### `DocumentFragment` 的特点
- **不引起页面重新渲染**：将元素添加到 `DocumentFragment` 中不会直接影响页面的渲染，直到 `DocumentFragment` 被插入到真实的 DOM 中。
- **轻量级容器**：`DocumentFragment` 是一个轻量级的容器，不会创建额外的节点，也不占据实际页面的渲染位置，因此不会对页面的性能造成额外的负担。
- **可以容纳多个 DOM 元素**：可以将多个节点、元素或文本节点等添加到 `DocumentFragment` 中，进行批量操作。

### `DocumentFragment` 常见用法

#### 1. **批量插入节点**
   当你需要一次性插入多个 DOM 元素时，使用 `DocumentFragment` 可以避免每次插入元素时都引发页面重排，提升性能。

   **示例：**

   ```javascript
   const fragment = document.createDocumentFragment();
   const ul = document.querySelector('ul');

   for (let i = 0; i < 1000; i++) {
     const li = document.createElement('li');
     li.textContent = `Item ${i + 1}`;
     fragment.appendChild(li); // 将元素添加到 fragment 中
   }

   ul.appendChild(fragment); // 一次性插入所有 li 元素
   ```

   这样，你将所有的 `<li>` 元素添加到 `DocumentFragment` 中，直到所有元素都准备好后，再将它们批量插入到 `<ul>` 中，避免了每次添加 `<li>` 时都会触发页面的重排和重绘。

#### 2. **提高动态内容插入的性能**
   如果你需要通过 JavaScript 动态生成大量内容并将它们插入 DOM，可以使用 `DocumentFragment` 来在内存中构建整个 DOM 结构，再一次性将其添加到页面中，避免频繁操作 DOM 带来的性能问题。

   **示例：**

   ```javascript
   const fragment = document.createDocumentFragment();

   // 假设你要插入的元素列表
   const items = ['Item 1', 'Item 2', 'Item 3'];

   items.forEach(item => {
     const div = document.createElement('div');
     div.textContent = item;
     fragment.appendChild(div); // 将元素添加到 DocumentFragment 中
   });

   document.body.appendChild(fragment); // 一次性插入到页面中
   ```

   在这种场景下，`DocumentFragment` 是一个在内存中完成所有 DOM 操作的临时容器，只有最后一步将所有内容插入到页面中。

#### 3. **避免影响现有 DOM 元素**
   你可以使用 `DocumentFragment` 来处理不希望立即影响现有 DOM 结构的情况。例如，当你需要在 DOM 中进行一系列修改，但又不希望用户看到这些修改的过程时，可以使用 `DocumentFragment`。

   **示例：**

   ```javascript
   const fragment = document.createDocumentFragment();

   // 创建新节点，并添加到 fragment 中
   const newElement = document.createElement('div');
   newElement.textContent = 'New Element';
   fragment.appendChild(newElement);

   // 进行其他 DOM 操作
   // 最后，将 fragment 插入到 DOM 中
   document.body.appendChild(fragment);
   ```

   在这个例子中，所有的元素操作都是在 `DocumentFragment` 内部进行的，只有在所有操作完成后，才将结果插入到页面中。

#### 4. **模板生成**
   `DocumentFragment` 也常用于从模板生成 DOM 元素。例如，结合 `<template>` 标签，可以在不立即渲染的情况下将模板内容批量处理。

   **示例：**

   ```html
   <template id="my-template">
     <div class="item">Item</div>
   </template>
   ```

   ```javascript
   const fragment = document.createDocumentFragment();
   const template = document.getElementById('my-template');

   // 创建多个实例
   for (let i = 0; i < 5; i++) {
     const clone = document.importNode(template.content, true); // 克隆模板内容
     fragment.appendChild(clone); // 添加到 DocumentFragment 中
   }

   document.body.appendChild(fragment); // 批量插入页面中
   ```

### 使用场景总结

- **批量 DOM 操作**：当需要插入多个元素时，通过 `DocumentFragment` 先在内存中完成所有 DOM 操作，最后一次性插入到页面中，避免频繁的页面重排和重绘。
- **动态内容生成**：在构建动态内容时，可以使用 `DocumentFragment` 在内存中处理这些内容，避免页面在处理过程中不断更新，提升性能。
- **高效的渲染**：使用 `DocumentFragment` 可以避免中途对页面造成不必要的影响，尤其在需要处理大量数据或复杂交互时，能够提升页面的响应速度和渲染效率。

</details>

## 79. 说说你对 MutationObserver 的理解 {#question-16ab8f97-8f58-4588-8bb6-c168bc830a01}

> 难度：2 · 类型：QA

### 题目要点

`MutationObserver` 是一个非常强大和高效的 API，用于监听 DOM 树的变化。它解决了 `Mutation Events` 的性能问题，并提供了更精细的 DOM 变更监听能力。常见的使用场景包括动态内容加载、UI 更新、动画实现和前端框架的内部优化。通过减少对 DOM 的重复操作，`MutationObserver` 可以显著提升 Web 应用的性能。

<details>
<summary>参考答案</summary>

### `MutationObserver` 介绍

`MutationObserver` 是一个 JavaScript API，用于监听 DOM 树中的变化。它提供了一种比传统的事件监听器更高效的方式，能够监控 DOM 的增删改等变化，并在发生变化时执行相应的回调函数。这个 API 主要用来监听对 DOM 树进行的修改，并且可以监控元素的属性、子元素、文本等的变化。

`MutationObserver` 的出现是为了替代旧的 `Mutation Events`（如 `DOMSubtreeModified`），后者在性能上存在较大的问题，特别是在对复杂或大型 DOM 进行频繁操作时，`MutationEvents` 可能会造成性能瓶颈。

### `MutationObserver` 基本用法

#### 创建 `MutationObserver` 实例
要使用 `MutationObserver`，你需要先创建一个观察器实例并传入一个回调函数。这个回调函数会在 DOM 发生变化时被触发。

```javascript
const observer = new MutationObserver((mutationsList, observer) => {
  // mutationsList 是一个 MutationRecord 对象的数组，记录了所有 DOM 变化
  mutationsList.forEach(mutation => {
    console.log(mutation);
  });
});
```

#### 配置观察的目标和类型
`MutationObserver` 需要配置哪些类型的 DOM 变化需要被观察。配置项通过传递一个配置对象来实现，常见的配置项包括：
- `childList`：监听子节点的变化（如增加、删除子节点）。
- `attributes`：监听元素属性的变化（如 `class` 或 `id` 的改变）。
- `subtree`：是否监听子树（即目标元素的后代元素）上的变化。
- `characterData`：监听文本内容的变化。

```javascript
const config = {
  childList: true,         // 监听子节点的变化
  attributes: true,        // 监听属性变化
  subtree: true,           // 监听所有后代节点的变化
  characterData: true,     // 监听文本节点的变化
};
```

#### 选择需要观察的目标元素
你需要指定一个 DOM 元素作为观察的目标。`MutationObserver` 会监听该元素及其子元素的变化（取决于配置项）。

```javascript
const targetNode = document.getElementById('my-element');
```

#### 开始观察
使用 `observe()` 方法来开始监听 DOM 变化：

```javascript
observer.observe(targetNode, config);
```

#### 停止观察
使用 `disconnect()` 方法可以停止对 DOM 变化的监听：

```javascript
observer.disconnect();
```

### 常见的 `MutationRecord` 属性
每当 `MutationObserver` 回调函数被触发时，会传入一个或多个 `MutationRecord` 对象，描述了发生的变化。常见的 `MutationRecord` 的属性有：
- `type`：变化的类型，可能是 `childList`、`attributes`、`subtree` 或 `characterData`。
- `target`：被修改的目标元素。
- `addedNodes`：新增的节点列表（仅在 `childList` 类型时有效）。
- `removedNodes`：移除的节点列表（仅在 `childList` 类型时有效）。
- `attributeName`：修改的属性名（仅在 `attributes` 类型时有效）。
- `oldValue`：变化之前的值（仅在 `attributes` 或 `characterData` 类型时有效）。

### 示例：监听 DOM 元素的子节点变化

```html
<div id="container">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

```javascript
const container = document.getElementById('container');

// 创建 MutationObserver 实例
const observer = new MutationObserver((mutationsList, observer) => {
  mutationsList.forEach(mutation => {
    console.log(mutation.type); // 'childList' 表示子节点变化
    if (mutation.type === 'childList') {
      console.log('Added nodes:', mutation.addedNodes);
      console.log('Removed nodes:', mutation.removedNodes);
    }
  });
});

// 配置观察目标为子节点变化
const config = { childList: true };

// 开始观察
observer.observe(container, config);

// 模拟子节点变化
const newItem = document.createElement('div');
newItem.textContent = 'Item 3';
container.appendChild(newItem);

// 停止观察
observer.disconnect();
```

在这个示例中，我们创建了一个 `MutationObserver` 实例，并配置它监听 `container` 元素的子节点变化。当我们动态添加了 `Item 3` 后，回调函数会被触发，记录新的节点。

### 使用场景

`MutationObserver` 在现代 Web 开发中有很多应用场景，尤其是在动态页面和复杂的用户交互中：

#### 1. **监听 DOM 更新**
   - 用于监听 DOM 中的动态变化。例如，监听某个元素的子节点变化，进而进行页面的更新或重新渲染。

#### 2. **自动化 UI 更新**
   - 可以在某些情况下，观察到 DOM 的变化后自动更新 UI，而不需要依赖 JavaScript 显式的调用。

#### 3. **实现无障碍功能**
   - 可以用于监听页面上元素的变化，并及时通知辅助技术（如屏幕阅读器）进行更新，从而改善无障碍体验。

#### 4. **动态内容加载**
   - 当内容动态插入页面时，可以通过 `MutationObserver` 监听新内容的插入，并进行进一步的处理（如懒加载图片、执行 JavaScript）。

#### 5. **实现动画效果**
   - 可以监听 DOM 元素的属性变化（如 `class` 或 `style`），并基于这些变化来触发动画效果。

#### 6. **React、Vue 等框架的内部实现**
   - 一些前端框架和库（如 React 或 Vue）可能会使用 `MutationObserver` 来处理视图更新，以检测 DOM 是否变化，并根据变化触发组件的重新渲染。

### `MutationObserver` 与 `setInterval` 和 `setTimeout` 的比较
`MutationObserver` 的优势在于它是 **事件驱动的**，即只有在 DOM 变化时才会回调，这比 `setInterval` 或 `setTimeout` 更高效。后者会不断轮询检测某个条件，导致 CPU 资源浪费，而 `MutationObserver` 只会在有变化时执行回调，避免了不必要的计算。

</details>

## 80. mouseEnter、mouseLeave、mouseOver、mouseOut 有什么区别？ {#question-0277f6fc-c0ef-4784-b552-bb6198c92e27}

> 难度：1 · 类型：QA

### 题目要点

- `mouseEnter` 和 `mouseLeave` 事件更精确，仅在目标元素上触发，并且不会冒泡。
- `mouseOver` 和 `mouseOut` 事件则会冒泡，并且会在鼠标进入或离开目标元素及其子元素时触发。

<details>
<summary>参考答案</summary>

`mouseEnter`、`mouseLeave`、`mouseOver` 和 `mouseOut` 都是与鼠标事件相关的 DOM 事件，常用于处理鼠标与页面元素的交互。它们之间有细微的区别，尤其是在事件的触发时机和作用范围上。下面详细介绍它们的区别。

### 1. **`mouseEnter`** 和 **`mouseLeave`**

这两个事件主要用于处理鼠标进入和离开元素时的情况，具有以下特点：

- **`mouseEnter`**：当鼠标指针进入某个元素时触发，**不会**冒泡（即不会传播到父元素）。只有当鼠标真正进入目标元素时，事件才会触发。

  - 事件触发的范围：仅限于当前目标元素。
  - **不冒泡**：这意味着它不会触发父元素的 `mouseenter` 事件。

- **`mouseLeave`**：当鼠标指针离开某个元素时触发，**不会**冒泡（即不会传播到父元素）。只有当鼠标真正离开目标元素时，事件才会触发。

  - 事件触发的范围：仅限于当前目标元素。
  - **不冒泡**：与 `mouseenter` 类似，它不会传播到父元素。

**总结：**
- `mouseEnter` 和 `mouseLeave` 是只对当前元素本身进行监听的事件，且不冒泡。
- 适用于需要精确控制某个元素的鼠标进入和离开时的场景。

**示例：**

```javascript
const element = document.querySelector('#myElement');

element.addEventListener('mouseenter', () => {
  console.log('Mouse entered the element');
});

element.addEventListener('mouseleave', () => {
  console.log('Mouse left the element');
});
```

### 2. **`mouseOver`** 和 **`mouseOut`**

这两个事件与 `mouseEnter` 和 `mouseLeave` 的不同之处在于它们是会冒泡的，并且它们还会在鼠标进入或离开元素的 **子元素** 时触发。

- **`mouseOver`**：当鼠标指针进入某个元素或其 **子元素** 时触发。与 `mouseEnter` 不同，`mouseOver` 会冒泡。

  - 事件触发的范围：不仅在目标元素上触发，还会在鼠标进入该元素的任何子元素时触发。
  - **会冒泡**：这意味着父元素上也可以监听 `mouseOver` 事件，并在鼠标进入子元素时触发。

- **`mouseOut`**：当鼠标指针离开某个元素或其 **子元素** 时触发。与 `mouseLeave` 不同，`mouseOut` 会冒泡。

  - 事件触发的范围：不仅在目标元素上触发，还会在鼠标离开该元素的任何子元素时触发。
  - **会冒泡**：与 `mouseOver` 类似，父元素上也会监听到 `mouseOut` 事件。

**总结：**
- `mouseOver` 和 `mouseOut` 会在鼠标进入或离开元素及其子元素时触发，且会冒泡。
- 适用于需要捕获鼠标在元素及其子元素之间的进入和离开事件。

**示例：**

```javascript
const element = document.querySelector('#myElement');

element.addEventListener('mouseover', () => {
  console.log('Mouse entered the element or one of its child elements');
});

element.addEventListener('mouseout', () => {
  console.log('Mouse left the element or one of its child elements');
});
```

### 3. **区别总结**

| 事件        | 描述                                                                 | 是否冒泡 | 触发范围                                                                 |
|-------------|----------------------------------------------------------------------|----------|--------------------------------------------------------------------------|
| `mouseEnter` | 鼠标进入元素时触发，只对目标元素有效                                   | 否       | 仅对目标元素本身有效                                                     |
| `mouseLeave` | 鼠标离开元素时触发，只对目标元素有效                                   | 否       | 仅对目标元素本身有效                                                     |
| `mouseOver`  | 鼠标进入元素或子元素时触发，适用于目标元素及其子元素                 | 是       | 目标元素及其所有子元素                                                   |
| `mouseOut`   | 鼠标离开元素或子元素时触发，适用于目标元素及其子元素                 | 是       | 目标元素及其所有子元素                                                   |

### 4. **选择哪个事件？**

- **精确控制**：如果只想监听鼠标进入和离开某个元素本身（不包括子元素），使用 `mouseEnter` 和 `mouseLeave`。
- **包括子元素**：如果需要监听鼠标进入或离开目标元素及其子元素，使用 `mouseOver` 和 `mouseOut`。
- **性能考虑**：`mouseEnter` 和 `mouseLeave` 比 `mouseOver` 和 `mouseOut` 性能好一些，因为后者会对子元素的变化进行监听，可能会触发更多次事件。

</details>

## 81. 微前端架构中，一般是如何做到 JavaScript 隔离的？ {#question-63b209be-9f39-4de8-aa1a-a8345e0851e9}

> 难度：3 · 类型：QA

### 题目要点

JavaScript 隔离是微前端实现稳定性的重要一环。具体实现方式取决于性能要求、场景需求和技术选型：
- 如果需要彻底隔离，可以使用 `iframe`。
- 如果需要较好的性能和灵活性，可以使用 `Proxy` 沙箱。
- 配合微前端框架（如 `qiankun`），可以更快速实现隔离和集成。

<details>
<summary>参考答案</summary>

在微前端架构中，为了防止子应用之间的 JavaScript 互相干扰，通常需要实现 **JavaScript 隔离**。

以下是常见的隔离方式和实现思路：

### **1. 沙箱隔离**
沙箱机制是微前端实现 JavaScript 隔离的核心，分为两种类型：

#### **（1）基于 iframe 的隔离**
- **原理**：每个子应用运行在独立的 iframe 中，浏览器会为 iframe 创建独立的 JavaScript 环境和 DOM。
- **优点**：
  - 完全隔离，防止子应用之间的变量污染。
  - 子应用可以完全独立加载自己的资源。
- **缺点**：
  - 性能较差，加载速度较慢。
  - 跨域通信比较复杂。

#### **（2）基于 JavaScript 沙箱的隔离**
通过动态劫持 JavaScript 执行环境，提供一个隔离的运行上下文。
- **常用方法**：
  1. **快照沙箱**：
     - 保存全局变量（如 `window`）的初始状态，在子应用执行代码时对全局变量的修改会被记录，卸载子应用时回滚这些修改。
     - **实现原理**：
       ```javascript
       const rawWindow = { ...window };
       function clearWindow() {
         for (const key in window) {
           if (!(key in rawWindow)) {
             delete window[key];
           } else {
             window[key] = rawWindow[key];
           }
         }
       }
       ```
     - **优点**：实现简单，性能较好。
     - **缺点**：不支持多实例运行（一个子应用的多实例无法隔离）。

  2. **Proxy 沙箱**：
     - 利用 ES6 的 `Proxy` 拦截对子应用全局变量的访问和修改，子应用操作的实际上是一个伪造的 `window` 对象。
     - **实现原理**：
       ```javascript
       const fakeWindow = {};
       const proxy = new Proxy(window, {
         get(target, prop) {
           return prop in fakeWindow ? fakeWindow[prop] : target[prop];
         },
         set(target, prop, value) {
           fakeWindow[prop] = value;
           return true;
         },
       });
       ```
     - **优点**：支持多实例运行，隔离效果较好。
     - **缺点**：实现复杂，兼容性依赖 Proxy 支持。

---

### **2. 样式隔离**
虽然这部分不直接属于 JavaScript，但为了避免 CSS 污染，也会使用样式隔离。
- **Scoped CSS**：通过为子应用的所有样式添加独立的前缀（如 `data-app="app1"`），实现样式隔离。
- **Shadow DOM**：通过 `Shadow DOM` 创建独立的样式作用域。

---

### **3. 子应用独立构建**
为了进一步隔离，通常子应用会独立构建自己的 JavaScript 和依赖：
- **独立打包**：子应用通过 Webpack、Vite 等工具独立打包，生成独立的 JS 文件。
- **避免共享依赖**：不同子应用尽量不共享同一个第三方库（如 React），以防止版本冲突。
- **Library 模式**：子应用打包为库形式，导出指定的模块接口。

---

### **4. 防止全局变量污染**
通过以下方法减少全局变量对主应用或其他子应用的影响：
- **严格模式**：子应用中启用 JavaScript 严格模式，减少意外的全局变量声明。
- **封闭作用域**：子应用中的 JavaScript 尽量封装在 IIFE（立即执行函数）或 ES6 模块中。
  ```javascript
  (function () {
    // 子应用代码
  })();
  ```

---

### **5. 使用微前端框架的支持**
现代微前端框架通常自带隔离机制：
- **single-spa**：通过生命周期函数加载和卸载子应用，配合沙箱实现隔离。
- **qiankun**：基于 `Proxy` 和快照沙箱，提供完善的 JavaScript 隔离方案。
- **Module Federation**：Webpack 5 的动态模块加载机制，可以隔离和动态加载模块。

</details>

## 82. qiankun 是如何实现 JS 隔离的？ {#question-f55df899-908c-406a-bca5-1bd9f3b4e8be}

> 难度：3.5 · 类型：QA

### 题目要点

`qiankun` 的 JS 隔离主要依赖于以下技术：
1. **快照沙箱**：适合简单场景，兼容性好，但不支持多实例。
2. **Proxy 沙箱**：适合复杂场景，支持多实例并行运行，性能更好。
3. **结合子应用生命周期**，动态启用和停用沙箱。
4. 配合 **CSS 隔离** 和其他隔离手段，全面防止子应用对全局的干扰。

<details>
<summary>参考答案</summary>

`qiankun` 是基于 `single-spa` 实现的微前端框架，它通过沙箱机制实现了 JavaScript 的隔离，主要依赖 **快照沙箱** 和 **Proxy 沙箱** 来管理子应用的 JavaScript 环境。

以下是 qiankun 实现 JS 隔离的具体原理：

### **1. 沙箱机制**
`qiankun` 使用沙箱技术隔离子应用的 JavaScript 执行环境，避免子应用之间以及子应用和主应用之间的全局变量污染。具体实现方式分为两种：

#### **（1）快照沙箱**
- **原理**：
  1. 在加载子应用之前，保存 `window` 和 `document` 上的所有全局变量的快照（初始状态）。
  2. 当子应用运行时，记录子应用对全局变量的修改。
  3. 当子应用被卸载时，恢复全局变量为快照保存的状态。

- **实现代码**：
  ```javascript
  class SnapshotSandbox {
    constructor() {
      this.active = false;
      this.windowSnapshot = {};
    }

    // 激活沙箱
    activate() {
      if (!this.active) {
        this.windowSnapshot = { ...window }; // 保存快照
        this.active = true;
      }
    }

    // 恢复沙箱
    deactivate() {
      if (this.active) {
        Object.keys(window).forEach((key) => {
          if (!(key in this.windowSnapshot)) {
            delete window[key]; // 删除新增的全局变量
          } else {
            window[key] = this.windowSnapshot[key]; // 恢复修改的全局变量
          }
        });
        this.active = false;
      }
    }
  }
  ```

- **优点**：
  - 实现简单，兼容性好。
  - 适用于子应用之间没有并行运行的场景。
- **缺点**：
  - 无法支持多实例并行运行。
  - 恢复状态时性能可能较差。

#### **（2）Proxy 沙箱**
- **原理**：
  通过 ES6 的 `Proxy` 拦截对子应用全局对象（`window`）的访问，创建一个伪造的全局对象供子应用使用。子应用操作的实际上是 `Proxy` 对象，而不是原生 `window`。

- **实现代码**：
  ```javascript
  class ProxySandbox {
    constructor() {
      this.proxy = new Proxy(window, {
        get(target, key) {
          return key in this.fakeWindow ? this.fakeWindow[key] : target[key];
        },
        set(target, key, value) {
          this.fakeWindow[key] = value;
          return true;
        },
      });
      this.fakeWindow = {}; // 伪造的全局对象
      this.active = false;
    }

    activate() {
      this.active = true;
    }

    deactivate() {
      this.active = false;
      this.fakeWindow = {};
    }
  }
  ```

- **优点**：
  - 支持多实例隔离（不同子应用实例可以运行在不同的 `Proxy` 上）。
  - 性能较好，且子应用与全局对象完全隔离。
- **缺点**：
  - 需要现代浏览器支持 `Proxy`。

---

### **2. 沙箱的动态绑定**
在 `qiankun` 中，沙箱会根据子应用的生命周期进行动态切换：
- **加载子应用时**：启用沙箱，挂载子应用代码，修改的全局变量会保留在沙箱中。
- **卸载子应用时**：停用沙箱，恢复主应用的全局环境。
- **并行运行多个子应用时**：通过独立的 `Proxy` 实例实现每个子应用的环境隔离。

---

### **3. 微前端框架的挂载和卸载流程**
结合沙箱，`qiankun` 的子应用加载流程如下：
1. **加载子应用资源**：
   - 通过 `fetch` 加载子应用的 HTML、CSS 和 JavaScript。
   - 动态插入 `script` 标签以运行子应用代码。

2. **运行子应用代码**：
   - 使用沙箱（`Proxy` 或快照）控制代码的执行环境。
   - 子应用的全局变量、事件监听等都仅限于其沙箱范围内。

3. **卸载子应用**：
   - 停用沙箱，清理子应用的副作用（如事件监听、全局变量）。

---

### **4. 样式隔离**
除了 JS 隔离，`qiankun` 还会对样式进行隔离，防止子应用的样式污染全局：
- **CSS 前缀隔离**：
  为子应用的样式规则添加特定的前缀（如 `data-app="app1"`），使其作用范围限制在子应用内。
- **Shadow DOM**：
  使用 `Shadow DOM` 为子应用创建独立的样式作用域。

</details>

## 83. 如何自定义鼠标右键菜单？ {#question-db70a2d5-b154-47dd-9b66-e0322787bf12}

> 难度：1.5 · 类型：QA

### 题目要点

- **捕获右键事件**：通过 `contextmenu` 事件来捕获鼠标右键点击。
- **自定义菜单**：通过动态创建菜单并控制其位置和显示隐藏，实现自定义的右键菜单。
- **交互处理**：可以为菜单项添加点击事件，处理用户的操作。

<details>
<summary>参考答案</summary>

自定义鼠标右键菜单的实现通常需要使用 JavaScript 来捕获右键事件 (`contextmenu`)，并阻止默认的浏览器菜单弹出，然后显示自定义菜单。

下面是实现的基本思路：

### 1. **捕获右键事件**
监听 `contextmenu` 事件，该事件在用户右键点击时触发。

### 2. **阻止默认菜单**
通过 `event.preventDefault()` 来阻止浏览器默认的右键菜单。

### 3. **创建自定义菜单**
通过动态创建一个菜单元素，并根据需要进行样式和交互逻辑的定制。

### 4. **显示菜单**
计算右键点击的位置，将自定义菜单显示在用户点击的位置。

### 5. **隐藏菜单**
当用户点击菜单外的区域或选择菜单项时，隐藏菜单。

### 示例代码：

#### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>自定义右键菜单</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }

    #custom-menu {
      position: absolute;
      display: none;
      background-color: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    }

    #custom-menu li {
      padding: 10px 20px;
      cursor: pointer;
    }

    #custom-menu li:hover {
      background-color: #f0f0f0;
    }
  </style>
</head>
<body>
  <h1>右键点击下面区域查看自定义菜单</h1>
  <div id="content" style="height: 200px; background-color: #f5f5f5; border: 1px solid #ccc; padding: 20px;">
    右键点击这里查看菜单
  </div>

  <!-- 自定义右键菜单 -->
  <ul id="custom-menu">
    <li id="menu-item-1">菜单项 1</li>
    <li id="menu-item-2">菜单项 2</li>
    <li id="menu-item-3">菜单项 3</li>
  </ul>

  <script>
    const content = document.getElementById('content');
    const customMenu = document.getElementById('custom-menu');

    // 显示自定义右键菜单
    content.addEventListener('contextmenu', (event) => {
      event.preventDefault();  // 阻止默认的右键菜单

      // 获取鼠标点击的位置
      const x = event.clientX;
      const y = event.clientY;

      // 设置自定义菜单的位置
      customMenu.style.left = `${x}px`;
      customMenu.style.top = `${y}px`;
      customMenu.style.display = 'block';  // 显示菜单
    });

    // 隐藏菜单（点击菜单外部）
    window.addEventListener('click', (event) => {
      if (!customMenu.contains(event.target)) {
        customMenu.style.display = 'none';  // 隐藏菜单
      }
    });

    // 菜单项点击事件
    document.getElementById('menu-item-1').addEventListener('click', () => {
      alert('选择了菜单项 1');
      customMenu.style.display = 'none';  // 隐藏菜单
    });

    document.getElementById('menu-item-2').addEventListener('click', () => {
      alert('选择了菜单项 2');
      customMenu.style.display = 'none';  // 隐藏菜单
    });

    document.getElementById('menu-item-3').addEventListener('click', () => {
      alert('选择了菜单项 3');
      customMenu.style.display = 'none';  // 隐藏菜单
    });
  </script>
</body>
</html>
```

### 解释：

1. **监听 `contextmenu` 事件**：
   - 在 `#content` 元素上监听 `contextmenu` 事件，当用户右键点击该区域时会触发该事件。
   - `event.preventDefault()` 阻止浏览器的默认右键菜单显示。

2. **自定义菜单显示**：
   - 通过 `clientX` 和 `clientY` 获取鼠标点击的坐标，动态计算并设置自定义菜单的 `left` 和 `top` 样式，使其显示在鼠标点击位置。
   - `customMenu.style.display = 'block';` 使菜单可见。

3. **点击菜单外部隐藏菜单**：
   - 在 `window` 上监听 `click` 事件，点击菜单外部时，隐藏菜单。

4. **菜单项操作**：
   - 给菜单项绑定点击事件，执行自定义的操作（比如弹出提示框），并在操作后隐藏菜单。

### 进一步优化和增强功能：

1. **支持多个右键菜单**：
   - 可以为不同的元素定义不同的右键菜单，只需在不同元素上监听 `contextmenu` 事件，并显示相应的菜单。

2. **动态菜单内容**：
   - 根据上下文动态生成菜单项，例如根据选中的文本或元素内容来决定显示哪些菜单项。

3. **自定义样式**：
   - 为菜单添加自定义样式，增加动画效果、图标等，提高交互体验。

4. **键盘导航**：
   - 实现键盘上的上下左右导航，让用户可以通过键盘控制选择菜单项。

</details>

## 84. 如何减少项目里的 if-else {#question-897c54a4-7dfb-4692-bbd9-4d29d7a125b4}

> 难度：2 · 类型：QA

### 题目要点

**适用场景**：根据不同类型执行不同行为

<details>
<summary>参考答案</summary>

#### 1. **多态与策略模式**
**适用场景**：根据不同类型执行不同行为<br>
```typescript
// 优化前
if (user.role === 'admin') {
    showAdminPanel();
} else if (user.role === 'editor') {
    showEditorTools();
} else {
    showGuestView();
}

// 优化后
const roleHandlers = {
    admin: () => showAdminPanel(),
    editor: () => showEditorTools(),
    default: () => showGuestView()
};
roleHandlers[user.role]?.() || roleHandlers.default();
```

#### 2. **查表法（Lookup Table）**
**适用场景**：状态/错误码映射<br>
```javascript
// 优化前
if (status === 200) return 'Success';
if (status === 404) return 'Not Found';
if (status === 500) return 'Server Error';

// 优化后
const statusMap = {
    200: 'Success',
    404: 'Not Found',
    500: 'Server Error'
};
return statusMap[status] || 'Unknown';
```

#### 3. **提前返回（Early Return）**
**适用场景**：参数校验/前置条件检查<br>
```typescript
// 优化前
function process(data) {
    if (data) {
        if (data.valid) {
            // 主要逻辑...
            return result;
        } else {
            throw Error('Invalid data');
        }
    } else {
        throw Error('No data');
    }
}

// 优化后
function process(data) {
    if (!data) throw Error('No data');
    if (!data.valid) throw Error('Invalid data');

    // 主要逻辑...
    return result;
}
```

#### 4. **责任链模式**
**适用场景**：多条件顺序处理<br>
```javascript
// 处理器链
const validators = [
    { check: (input) => !input, error: 'Input required' },
    { check: (input) => input.length < 6, error: 'Too short' },
    { check: (input) => !/\d/.test(input), error: 'Need number' }
];

function validate(input) {
    const failure = validators.find(v => v.check(input));
    return failure ? failure.error : null;
}
```

#### 5. **逻辑运算符简化**
**适用场景**：简单条件赋值<br>
```javascript
// 优化前
let value;
if (input !== null) {
    value = input;
} else {
    value = defaultValue;
}

// 优化后
const value = input ?? defaultValue; // 或 input || defaultValue
```

#### 6. **状态模式/状态机**
**适用场景**：复杂状态流转<br>
```typescript
// 订单状态处理
class Order {
    state: OrderState = new PendingState();

    nextState() {
        this.state = this.state.next();
    }
}

interface OrderState {
    next(): OrderState;
}

class ShippedState implements OrderState {
    next() { return new DeliveredState(); }
}
```

#### 7. **函数式编程**
**适用场景**：条件数据转换<br>
```javascript
// 优化前
const results = data.map(item => {
    if (item.score > 90) return 'A';
    if (item.score > 80) return 'B';
    return 'C';
});

// 优化后
const gradeRules = [
    [score => score > 90, 'A'],
    [score => score > 80, 'B'],
    [() => true, 'C'] // 默认值
];

const getGrade = (score) =>
    gradeRules.find(([rule]) => rule(score))[1];

const results = data.map(item => getGrade(item.score));
```

#### 8. **配置化规则**
**适用场景**：动态业务规则<br>
```javascript
// rules.config.js
export const DISCOUNT_RULES = [
    { condition: user => user.isVIP, discount: 0.3 },
    { condition: order => order.total > 1000, discount: 0.2 },
    { condition: () => true, discount: 0 } // 默认
];

// 业务逻辑
function getDiscount(user, order) {
    const rule = DISCOUNT_RULES.find(r => r.condition(user, order));
    return rule.discount;
}
```

</details>

## 85. ajax 和 xhr 是什么关系？ {#question-2ba40a99-a64e-444d-bf03-2bb9af8568fa}

> 难度：2 · 类型：QA

### 题目要点

1. **包含关系**：AJAX 是技术理念，XHR 是其最初的底层实现工具<br>
2. **发展关系**：现代 AJAX 应用可能使用 Fetch 或 WebSocket，但 XHR 仍是兼容性最广的方案<br>
3. **能力边界**：XHR 提供更底层的控制（如进度监控），而 AJAX 更关注整体数据交互体验

<details>
<summary>参考答案</summary>

### 一、概念定位差异
| **维度**       | **AJAX**                          | **XMLHttpRequest (XHR)**            |
|----------------|-----------------------------------|-------------------------------------|
| **本质**       | 一种前端技术范式/方法论           | 浏览器提供的底层 API 对象           |
| **层级**       | 应用层概念                        | 协议层实现                          |
| **诞生时间**   | 2005年（Jesse James Garrett提出） | 1999年（IE5首次实现）               |

### 二、技术实现关系
#### 1. **AJAX 依赖 XHR 实现**
AJAX 技术的核心是通过 **XHR 对象** 实现异步通信：
```javascript
// 经典 AJAX 实现（基于 XHR）
function ajaxRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseText); // 回调处理数据
        }
    };
    xhr.open('GET', url, true); // 异步请求
    xhr.send();
}
```

#### 2. **XHR 不限于 AJAX**
XHR 也可用于同步请求（尽管不推荐）：
```javascript
// 同步请求示例（阻塞主线程）
xhr.open('GET', '/api/data', false); // 第三个参数为 false
xhr.send();
console.log(xhr.responseText);
```

### 三、演进与替代方案
#### 1. **现代 AJAX 的实现方式**
| **技术**            | **特点**                          | **示例                          |
|---------------------|-----------------------------------|---------------------------------|
| Fetch API           | Promise-based，更现代的替代方案   | `fetch(url).then(res => res.json())` |
| Axios              | 基于 XHR 的封装库                 | `axios.get(url).then(...)`      |
| WebSocket          | 全双工通信                        | `new WebSocket('ws://...')`     |

#### 2. **XHR 的扩展能力**
即使在新标准下，XHR 仍保留独特功能：
```javascript
// 上传进度监控（Fetch API 需通过 ReadableStream 实现）
xhr.upload.onprogress = (e) => {
    console.log(`进度: ${(e.loaded / e.total) * 100}%`);
};
```

### 四、关键特性对比
| **特性**               | **AJAX 体系**                    | **原生 XHR**                     |
|------------------------|----------------------------------|----------------------------------|
| 异步支持               | 必须异步                         | 支持同步/异步                    |
| 数据格式               | 任意（JSON/XML/Text等）          | 依赖手动设置 `responseType`      |
| 跨域处理               | 依赖 CORS/JSONP                  | 需手动处理 `withCredentials`     |
| 事件机制               | 由封装库决定（如 Axios 拦截器）  | 原生事件（onload/onerror等）     |

### 五、工作流程图示
```mermaid
sequenceDiagram
    participant Client
    participant XHR
    participant Server

    Client->>XHR: 创建 new XMLHttpRequest()
    XHR->>Server: 发送 HTTP 请求（异步）
    Server-->>XHR: 返回响应数据
    XHR->>Client: 触发 onreadystatechange
    Client->>Client: 执行 AJAX 回调逻辑
```

### 六、历史演进
1. **1999**：IE5 引入 XHR 对象
2. **2005**：Google Maps/Gmail 应用 AJAX 技术
3. **2006**：XHR 被 W3C 标准化
4. **2015**：Fetch API 成为新标准

</details>

## 86. axios 请求的底层依赖是什么？ {#question-5ae6a85f-3dd6-49cd-bca9-7e400b936c9f}

> 难度：2 · 类型：QA

### 题目要点

* Axios 在浏览器中底层依赖 `XMLHttpRequest`，在 Node.js 中依赖 `http` / `https` 模块；
* 通过适配器模式抽象环境差异，使用统一的 API；
* 除了底层请求，Axios 提供了丰富的封装能力，增强了使用体验和灵活性。

<details>
<summary>参考答案</summary>

Axios 的请求底层依赖，其核心在于运行环境的差异化处理。

在 **浏览器端**，Axios 主要依赖的是 **`XMLHttpRequest`（XHR）对象**。当执行请求时，Axios 内部会构造一个配置对象并调用 `xhrAdapter`，这个适配器最终基于 `XMLHttpRequest` 实现请求的发送与响应的处理。它会自动处理请求头、响应数据解析（如 JSON 自动解析）、状态码判断、超时、取消请求等逻辑。

在 **Node.js 环境下**，Axios 不能使用 `XMLHttpRequest`，因此使用的是 **`http` 和 `https` 模块**。Axios 会根据请求的 URL 协议自动选择 `httpAdapter`，该适配器内部封装了 `http.request` 或 `https.request` 方法，同样提供配置项支持和响应封装（如 response 对象结构保持一致）。

Axios 使用了一种“适配器模式”来抽象环境差异，表现为对外统一的调用方式，内部根据运行环境动态选择适配器，使其在浏览器和 Node.js 中都能无缝工作。

此外，Axios 并不是直接透传底层请求能力，而是围绕请求流程做了很多增强，比如：

* 自动转换请求和响应的数据结构；
* 请求和响应拦截器；
* 请求取消机制（基于 AbortController 或 CancelToken）；
* 防止 CSRF 的默认设置；
* Promise 化的链式调用；
* 自定义实例（如带 baseURL、headers、timeout 的默认配置）等。

这些功能都建立在对底层请求能力的封装和抽象上。

</details>

## 87. 不会冒泡的事件有哪些？ {#question-69b606ac-e69b-4bb5-9997-21860904d29b}

> 难度：1 · 类型：QA

### 题目要点

### 题目解析

**回答思路**：先说一下**标准事件模型**都有哪3个阶段，然后根据题目要求阐述下不会 `冒泡`的事件有哪些。

**扩展知识**：

- 浏览器标准事件模型
- addEventListener一共有几个参数及含义
- React和Vue里事件监听是怎么处理的

### 思路和要点

1. **了解事件流模型**：
   - 事件流分为三个阶段：捕获阶段、目标阶段、冒泡阶段。
   - 大多数事件会按照这个顺序，从根节点到目标节点（捕获阶段），在目标节点上触发（目标阶段），然后从目标节点向上传播到根节点（冒泡阶段）。

2. **识别不会冒泡的事件**：
   - 不会冒泡的事件在目标元素上触发后，不会传播到父元素。
   - 候选人应了解具体哪些事件不会冒泡，并能够举出几个常见的例子。

3. **详细解释每个不会冒泡的事件**：
   - **`focus`** 和 **`blur`**：这些事件涉及元素的焦点变化，不会冒泡。通常在表单元素上使用。
   - **`load`** 和 **`unload`**：资源加载和页面卸载时触发，常用于执行初始化和清理工作。
   - **`stop`**：与媒体元素相关，当媒体播放停止时触发。
   - **`readystatechange`**：文档的 `readyState` 变化时触发，通常用于检测文档加载状态。
   - **`scroll`**：当元素滚动时触发，虽然在某些浏览器中可能会冒泡，但大多数情况下不会冒泡。

4. **解释例外情况**：
   - **`focusin`** 和 **`focusout`**：这两个事件是 `focus` 和 `blur` 的特例，它们会冒泡。

5. **应用场景和最佳实践**：
   - 了解这些事件在实际开发中的应用场景，例如表单验证、资源加载优化等。
   - 掌握如何使用事件委托处理冒泡事件，以及在不会冒泡的事件中如何手动处理。

<details>
<summary>参考答案</summary>

在 JavaScript 和浏览器中，绝大多数事件都会按照 DOM 事件流模型冒泡，即事件会从目标元素开始向上冒泡到它的父元素，并最终到达 `document` 元素。然而，也有一些事件是不会冒泡的。这些事件通常直接在目标元素上触发，并不会向上传播。

以下是一些不会冒泡的事件的示例：

1. **`focus`**：当元素获得焦点时触发，例如通过键盘或鼠标点击。这是一个不会冒泡的事件。

2. **`blur`**：当元素失去焦点时触发。这也是一个不会冒泡的事件。

3. **`focusin`**：与 `focus` 类似，但会在元素或其父元素上触发（冒泡），因此这个事件是特例。

4. **`focusout`**：与 `blur` 类似，但会在元素或其父元素上触发（冒泡），因此这个事件是特例。

5. **`load`**：当图像、音频、视频或其他资源加载完成时触发。例如，在 `img` 元素上触发的 `load` 事件不会冒泡。

6. **`unload`**：当页面即将被导航离开时触发。这通常用于执行清理工作，也不会冒泡。

7. **`stop`**：通常与 `media` 元素相关，例如 `audio` 或 `video` 元素。这是在媒体播放停止时触发的事件。

8. **`readystatechange`**：当 `document` 的 `readyState` 改变时触发。这通常在页面加载时使用。

9. **`scroll`**：当元素滚动时触发。这个事件在某些浏览器中可能会冒泡。

这些事件通常直接在目标元素上触发，并且不会传播到父元素上。

</details>

## 88. 如何让 var [a, b] = {a: 1, b: 2} 解构赋值成功？ {#question-97fda656-bfa1-4aa9-b1a5-1d0247178cfc}

> 难度：3 · 类型：QA

### 题目要点

### 思路和要点

1. **理解迭代协议**：
   - 迭代协议允许 JavaScript 对象定义或定制它们的迭代行为。
   - 对象要成为可迭代对象，必须实现 `@@iterator` 方法，即对象（或其原型链上的某个对象）必须有一个键为 `@@iterator` 的属性，可通过常量 `Symbol.iterator` 访问该属性。

2. **浏览器报错分析**：
   - 当 `var [a, b] = {a:1, b:2}` 运行时，会报错 "TypeError: obj is not iterable"，因为对象默认不可迭代。
   - 数组和 Map 是可迭代对象，因为它们有默认的 `Symbol.iterator` 方法。

3. **实现可迭代协议**：
   - 要使对象变得可迭代，需要在对象上实现 `Symbol.iterator` 方法。
   - 该方法应返回一个迭代器对象，该对象必须实现 `next` 方法。

4. **详细步骤**：
   - 在对象上添加 `Symbol.iterator` 方法。
   - 在 `Symbol.iterator` 方法中，返回一个具有 `next` 方法的迭代器对象。
   - `next` 方法在每次调用时返回一个对象，该对象具有 `value` 和 `done` 属性。

5. **示例代码**：
   - 创建一个对象，并实现其 `Symbol.iterator` 方法。
   - 通过迭代器对象的 `next` 方法，按序返回对象的属性值。

6. **示例实现**：

   ```javascript
   const obj = {
     a: '1',
     b: '2',
     [Symbol.iterator]() {
       let index = 0;
       const keys = Object.keys(this);
       return {
         next() {
           if (index < keys.length) {
             return {
               done: false,
               value: obj[keys[index++]]
             };
           }
           return { done: true, value: undefined };
         }
       };
     }
   };

   const [a, b] = obj;

<details>
<summary>参考答案</summary>

## 迭代协议

题目问怎么能让var \[a,b\] = {a:1,b:2} 成立，那么我们首先要运行一下，看看它是怎么个不成立法。

```js
const obj = {
    a:'1',
    b:'2',
}

const [a,b] = obj
```

![](https://static.ecool.fun//article/2e0932fb-2f62-41b7-b1cc-17df3a831f50.jpeg)

运行之后打开控制台可以发现报错信息，它告诉我们obj这个对象是不可迭代的，那么我们想办法把obj变成可迭代的是不是就能解决这个问题，这要怎么做呢？想要搞明白这点我们需要先了解一下可迭代协议。

**可迭代协议的概念（** **MDN** **）**

> 可迭代协议允许 JavaScript 对象定义或定制它们的迭代行为，例如，在一个 `for..of` 结构中，哪些值可以被遍历到。一些内置类型同时是[内置的可迭代对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E5%86%85%E7%BD%AE%E7%9A%84%E5%8F%AF%E8%BF%AD%E4%BB%A3%E5%AF%B9%E8%B1%A1 "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E5%86%85%E7%BD%AE%E7%9A%84%E5%8F%AF%E8%BF%AD%E4%BB%A3%E5%AF%B9%E8%B1%A1")，并且有默认的迭代行为，比如 `Array` 或者 `Map`，而其他内置类型则不是（比如 `Object`）。
>
> 要成为可迭代对象，该对象必须实现 `@@iterator` 方法，这意味着对象（或者它[原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain")上的某个对象）必须有一个键为 `@@iterator` 的属性，可通过常量 `Symbol.iterator` 访问该属性：
>
> `[Symbol.iterator]`
>
> 一个无参数的函数，其返回值为一个符合[迭代器协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E8%BF%AD%E4%BB%A3%E5%99%A8%E5%8D%8F%E8%AE%AE "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E8%BF%AD%E4%BB%A3%E5%99%A8%E5%8D%8F%E8%AE%AE")的对象。
>
> 当一个对象需要被迭代的时候（比如被置入一个 `for...of` 循环时），首先，会不带参数调用它的 `@@iterator` 方法，然后使用此方法返回的迭代器获得要迭代的值。

说人话就是，要想让obj成为一个可迭代的对象，就需要它实现 `@@iterator` 方法，具体表现为对象身上要有一个名为`[Symbol.iterator]` 的方法。而数组和Map则是一开始就有这个方法，所以它们是可迭代的。而对象身上则没有这个默认行为，所以不可迭代。真的是这样吗？我们创建一个数组，看看数组身上到底有没有`[Symbol.iterator]` 方法。

```js
const array = [1,2,3]
console.log(array)
```

![](https://static.ecool.fun//article/2174c1e1-7964-41ef-830e-22e876aa652b.jpeg)

点开原型查看

![](https://static.ecool.fun//article/0412f825-a681-48fb-905e-886514b24402.jpeg)

发现真的有一个Symbol.iterator()方法，该方法会返回一个迭代器对象。我们来调用一下

```js
const array = [1,2,3]
const iterator = array[Symbol.iterator]()
console.log(iterator)
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
```

![](https://static.ecool.fun//article/c0a94fec-8c05-43dc-9039-2b838abfa11c.jpeg)

打印iterator对象后发现在它的原型上有一个next()方法，调用next()方法，会得到一个对象value就是当前迭代的值，done则代表当前迭代器是否已经迭代完成。

**数组** **解构** **的本质**

```js
const array = [1,2,3]
var [a,b,c] = array
// 本质上是
const iterator = array[Symbol.iterator]()
var a = iterator.next().value
var b = iterator.next().value
var c = iterator.next().value
```

## 解决方法

到此为止我们可知，要想满足迭代协议需要对象身上有一个名为`[Symbol.iterator]`的方法。再使用for..of或者解构赋值的时候会隐式的调用这个方法，得到一个迭代对象，通过迭代对象的next方法判断当前是否完成迭代和具体迭代的值。

也就是说我们要在obj上添加`[Symbol.iterator]`方法并且完成next方法的逻辑

最终代码如下：

```js
 const obj = {
    a: '1',
    b: '2',
    [Symbol.iterator]() {
        let index = 0
        const keys = Object.keys(this)
        return {
            next() {
                if (index < keys.length) {
                    return {
                        done: false,
                        value: obj[keys[index++]]
                    }
                }
                return {done:true,value:undefined}
            }
        }
    }
}

const [a, b] = obj
```

当然，我们也可以用for...of去循环遍历这个对象，我看谁再说for...of不能遍历对象(doge)

```js
for(let i of obj){
    console.log(i)
}
// 1
// 2
```

</details>

## 89. MessageChannel 是什么，有什么使用场景？ {#question-a19a8ffa-8f33-4ca8-ba5d-31db4403b3f2}

> 难度：2 · 类型：QA

### 题目要点

`MessageChannel` 是一个 JavaScript API，用于在两个独立的执行环境（如 Web Workers 或者不同的 browsing contexts）之间建立双向通信的通道。`MessageChannel` 提供了两个通信端点（`port1` 和 `port2`），可以在两个不同的执行环境之间传递消息，并通过事件监听的方式来处理这些消息。

<details>
<summary>参考答案</summary>

`MessageChannel` 是一个 JavaScript API，用于在两个独立的执行环境（如 Web Workers 或者不同的 browsing contexts）之间建立双向通信的通道。`MessageChannel` 提供了两个通信端点（`port1` 和 `port2`），可以在两个不同的执行环境之间传递消息，并通过事件监听的方式来处理这些消息。

使用场景包括但不限于：

1. **Web Workers 通信**：在 Web 开发中，`MessageChannel` 通常用于在主线程和 Web Worker 之间建立通信通道，以便主线程与 Worker 之间传递消息和数据。

2. **不同浏览上下文（browsing context）之间的通信**：在现代浏览器中，多个标签页、iframe 或者其他类型的 browsing context 可以通过 `MessageChannel` 实现通信。

3. **SharedWorker 通信**：`MessageChannel` 可以用于在主线程和 Shared Worker 之间建立通信通道。

4. **服务端和客户端之间的通信**：`MessageChannel` 可以用于客户端（如浏览器）与服务端（如 WebSocket 服务器）之间的通信，特别是在与 WebSocket 或其他类似技术结合使用时。

5. **异步任务处理**：在某些场景中，使用 `MessageChannel` 可以更方便地处理异步任务，因为它提供了独立于主线程的通信通道。

### 使用示例

下面是一个简单的示例，展示如何使用 `MessageChannel` 在主线程和 Web Worker 之间建立通信通道：

```javascript
// 创建 MessageChannel
const channel = new MessageChannel();
const port1 = channel.port1;
const port2 = channel.port2;

// 在主线程中
const worker = new Worker('worker.js');
worker.postMessage({ port: port2 }, [port2]);

port1.onmessage = function(event) {
  console.log('Received message from worker:', event.data);
};

// 发送消息给 worker
port1.postMessage('Hello, Worker!');
```

在上面的示例中，我们创建了一个 `MessageChannel`，并通过 `port1` 和 `port2` 进行通信。我们将 `port2` 发送给 Web Worker，`port1` 留在主线程。然后，主线程可以通过监听 `port1` 的 `onmessage` 事件来接收来自 Web Worker 的消息，并通过 `port1.postMessage()` 向 Web Worker 发送消息。

扩展阅读：[2024 年了，你还不知道 MessageChannel 吗？
](https://mp.weixin.qq.com/s?__biz=Mzk0NTI2NDgxNQ==&mid=2247492054&idx=1&sn=c8c11868dbdd8ffba1e190d1719ae4d8&chksm=c31aa016f46d2900b040a3c139a8d70e28807ce0b7e03085a02e6cbdbce3af33b2af4aad899e&token=2103557006&lang=zh_CN&poc_token=HLrLIWajj9xhO8ZiA6U7wtv9LKPgLUyb2h3DRpH0)

</details>

## 90. try...catch 可以捕获到异步代码中的错误吗？ {#question-d17cf190-40d8-4405-bc82-eb54480ca38c}

> 难度：3 · 类型：QA

### 题目要点

### 思路和要点

1. **理解 try...catch 的局限性**：
   - `try...catch` 只能捕获同步代码块中的错误，对于异步代码中的错误无法捕获。

2. **示例分析**：
   - 分析给出的示例代码：

     ```javascript
     try {
       setTimeout(() => {
         throw new Error('err')
       }, 200);
     } catch (err) {
       console.log(err);
     }
     ```

   - 由于 `setTimeout` 是异步函数，其回调会在指定延时后被放入事件队列，当执行栈清空后才执行，因此 `try...catch` 无法捕获异步回调中的错误。

3. **处理异步代码中的错误**：
   - **使用 Promise**：
     - 在使用 Promise 时，可以通过 `.catch` 方法捕获错误。
     - 示例：

       ```javascript
       new Promise((resolve, reject) => {
         setTimeout(() => {
           reject(new Error('err'));
         }, 200);
       }).catch(err => {
         console.error(err);
       });
       ```

   - **使用 async/await**：
     - 使用 `async/await` 可以使异步代码看起来像同步代码，并结合 `try...catch` 捕获错误。
     - 示例：

       ```javascript
       async function asyncFunction() {
         try {
           await new Promise((resolve, reject) => {
             setTimeout(() => {
               reject(new Error('err'));
             }, 200);
           });
         } catch (err) {
           console.error(err);
         }
       }

       asyncFunction();
       ```

   - **使用事件监听器**：
     - 通过事件监听器捕获异步操作中的错误。
     - 示例：

       ```javascript
       window.addEventListener('error', (event) => {
         console.error(event.error);
       });

       setTimeout(() => {
         throw new Error('err');
       }, 200);
       ```

<details>
<summary>参考答案</summary>

不能。

以下面代码为例：

```js
try {
  setTimeout(() => {
    throw new Error('err')
  }, 200);
} catch (err) {
  console.log(err);
}
```

setTimeout是一个异步函数，它的回调函数会在指定的延时后被放入事件队列，等待当前执行栈清空后才执行。因此，当setTimeout的回调函数执行并抛出错误时，try...catch已经执行完毕，无法捕捉到异步回调中的错误。

对于异步代码，需要结合 Promise 、async/await 或者事件监听器等机制来处理错误。

</details>

## 91. 虚拟dom渲染到页面的时候，框架会做哪些处理？ {#question-73f4551c-2b47-4172-8c34-1c08d9adf30f}

> 难度：2 · 类型：QA

### 题目要点

### 题目解析

虚拟DOM技术现在无处无在，React/Vue这两大最流行的前端类库/框架都是基于虚拟DOM技术来实现。

候选人需要思考，为什么会要使用虚拟DOM技术，带来了哪些好处，有没有什么不好的地方？

#### 延伸问题

- React/Vue等虚拟DOM的diff算法
- 浏览器原生渲染上是否有使用DOM diff技术去更新？

<details>
<summary>参考答案</summary>

当虚拟DOM渲染到页面时，框架通常会执行以下动作：

1. **Diff算法**：框架会将新的虚拟DOM与旧的虚拟DOM进行对比，找出它们之间的差异。这个过程被称为Diff算法。Diff算法的目标是通过最小化操作次数来更新真实DOM，以提高性能。

2. **创建和更新DOM节点**：根据Diff算法的结果，框架会创建或更新需要改变的DOM节点。如果一个节点在新的虚拟DOM中存在但在旧的虚拟DOM中不存在，框架会创建该节点并添加到页面上。如果一个节点在新的虚拟DOM和旧的虚拟DOM中都存在，但其属性或子节点发生变化，框架会更新相应的DOM节点。这样可以确保只有实际需要更改的部分才会重新渲染，减少不必要的操作。

3. **处理事件绑定**：框架会重新绑定事件处理程序，以便在更新后正确响应用户交互。这包括添加、更新或删除事件监听器。

4. **卸载节点**：如果一个节点在新的虚拟DOM中不存在但在旧的虚拟DOM中存在，框架会从页面上移除该节点。这可以防止内存泄漏和资源浪费。

5. **触发生命周期钩子**：在渲染到页面后，框架会触发相应的生命周期钩子函数（如Vue中的`mounted`），以便开发人员可以在适当的时机执行自定义操作。

虚拟DOM渲染到页面时，框架会根据Diff算法的结果进行DOM的创建、更新和删除操作。这样可以最小化对真实DOM的改动，提高性能，并确保页面与新的虚拟DOM保持同步。此外，框架还会处理事件绑定和触发生命周期钩子函数，以便提供更多的开发扩展能力和灵活性。

</details>

## 92. setTimeout 延时写成0，一般可以什么场景下使用？ {#question-495c791c-c14e-43d6-ab82-b49829ce5591}

> 难度：1.5 · 类型：QA

### 题目要点

### 思路和要点

1. **UI 渲染后的回调**：
   - 使用 0 延时的 `setTimeout` 可以将回调函数推迟到当前事件循环结束之后。这样可以确保回调函数在浏览器完成当前 UI 渲染后执行。
   - 适用于需要在 UI 更新完成后执行一些操作的场景，例如确保界面元素已经更新或重新计算布局。

2. **异步操作处理**：
   - 将某些操作推迟到下一个事件循环周期，以确保它们在其他异步操作（如 Promise 或微任务）之后执行。
   - 这对于在执行某些计算或操作之前，等待其他异步操作完成的情况非常有用。

3. **性能优化**：
   - 在处理大量数据或进行复杂计算时，将操作拆分为多个较小的任务，放入 0 延时的 `setTimeout` 中，可以减少单次执行的时间，从而避免长时间的 JavaScript 执行阻塞。
   - 通过这种方式，可以使浏览器有机会处理其他任务和用户交互，提升页面响应性。

### 关键点

- `setTimeout(fn, 0)` 实际上不会立即执行 `fn`，而是将其放入任务队列中（**宏任务**），在当前事件循环结束后执行。
- 虽然延时设置为 0，但实际上存在微小的延迟，这取决于浏览器的实现和当前负载情况。
- 使用 `setTimeout(fn, 0)` 可以帮助改善 UI 响应性和异步操作的处理顺序，但过度使用可能导致复杂性增加或难以预测的行为。

### 延伸知识

掌握上述知识之后，还必须要清楚知道浏览器（包括nodejs）的**事件循环**机制，包括 **宏任务**和 **微任务** ，哪些属于宏任务、哪些属于微任务。

<details>
<summary>参考答案</summary>

将`setTimeout`的延时参数设置为0通常用于创建一个宏任务，使用0延时仍然会导致一些延迟，但它比较接近于立即执行。

以下是一些通常会使用0延时的情况：

1. **UI渲染后的回调**：当我们需要在当前事件循环结束后，等待浏览器完成UI渲染后再执行回调函数时，可以使用0延时。这样可以确保回调在界面更新之后执行，以避免阻塞UI线程。

2. **异步操作处理**：有时我们需要将某些操作推迟到下一个事件循环周期，以便让其他异步操作优先执行。通过将操作放置在0延时的`setTimeout`回调中，可以使其成为下一个事件循环周期的微任务，并确保在其他异步操作之后执行。

3. **性能优化**：在某些情况下，将操作延迟到下一个事件循环周期可以提高性能。例如，在处理大量数据或循环迭代时，通过将每个迭代步骤延迟到0延时的`setTimeout`中，可以分批处理，减少单次操作的执行时间，从而避免长时间的JavaScript执行阻塞。

</details>

## 93. 描述下列代码的执行结果 {#question-65cc7502-6364-4f96-9609-529d7c5c760a}

> 难度：2 · 类型：QA

```js
foo(typeof a);
function foo(p) {
  console.log(this);
  console.log(p);
  console.log(typeof b);
  let b = 0;
}
```

### 题目要点

* `typeof 未声明变量` 不会抛错，会返回 `'undefined'`；
* `let`/`const` 声明的变量在所在作用域内存在**暂时性死区（TDZ）**，在初始化之前访问会抛出 `ReferenceError`；
* 函数参数在执行前就已被初始化；
* 非严格模式下函数中的 `this` 指向全局对象。

<details>
<summary>参考答案</summary>

最终答案：**输出全局对象、'undefined'，然后抛出 ReferenceError 错误。**

这段代码涉及了几个关键点：**变量提升（Hoisting）**、**`typeof` 运算符的特性**、**函数作用域内的 `let` 声明的“暂时性死区”**，以及函数调用中的 **`this` 指向**。

### 一、代码分析

```js
foo(typeof a);

function foo(p) {
  console.log(this);
  console.log(p);
  console.log(typeof b);
  let b = 0;
}
```

---

### 二、运行步骤拆解

#### 步骤 1：全局执行环境解析阶段

* 函数 `foo` 被函数声明提升，因此在调用 `foo(...)` 时已可用；
* `a` 并未声明；
* 全局变量中没有 `b`，其声明在函数作用域内，且使用了 `let`，存在**暂时性死区（TDZ）**。

---

#### 步骤 2：执行 `foo(typeof a)`

* `typeof a`：虽然变量 `a` 未定义，但 **`typeof` 操作符在访问未声明变量时不会抛错**，而是返回 `'undefined'`；

  * 所以 `typeof a` 的值是 `'undefined'`；
* `foo` 被调用，参数 `p` 传入 `'undefined'`。

---

#### 步骤 3：函数 `foo` 开始执行

```js
function foo(p) {
  console.log(this);    // (1)
  console.log(p);       // (2)
  console.log(typeof b);// (3)
  let b = 0;
}
```

* `(1) console.log(this);`
  在非严格模式下，`this` 指向 **全局对象（浏览器中为 `window`，Node 中为 `global`）**；
  若开启严格模式，则为 `undefined`；由于题目未开启严格模式，这里输出全局对象。

* `(2) console.log(p);`
  输出参数值，即 `'undefined'`

* `(3) console.log(typeof b);`
  关键点：**变量 `b` 在此处已被创建，但尚未初始化（let 声明的特性）**，处于 TDZ（暂时性死区）。
  访问它会触发 `ReferenceError` 异常。

---

### 三、执行结果（非严格模式下）

```plaintext
<global object>  // console.log(this)
"undefined"      // console.log(p)
ReferenceError: Cannot access 'b' before initialization
```

</details>

## 94. 说说下面代码的输出结果 {#question-b42993a0-daf4-47df-b933-2fbded17cdff}

> 难度：3 · 类型：QA

```
Promise.resolve().then(() => {
  console.log(0)
  return Promise.resolve(4)
}).then((res) => {
  console.log(res)
})

Promise.resolve().then(() => {
  console.log(1)
}).then(() => {
  console.log(2)
}).then(() => {
  console.log(3)
}).then(() => {
  console.log(5)
}).then(() =>{
  console.log(6)
})
```

### 题目要点

输出结果是：

<details>
<summary>参考答案</summary>

输出结果是：

```
0
1
2
3
4
5
6
```

## 1、分析

一般遇到`Promise.resolve()`时，相当于`new Promise(resolve => {resolve()})`都是同步完成的，不会消耗微任务。 但以下情况时，需要注意，我们先看三组代码：

```js
//代码1
new Promise(resolve => {
    resolve(Promise.resolve(4));//resolve了一个Promise
})
.then((res) => {
    console.log(res)
})
```

```js
//代码2
Promise.resolve().then(() => {
    return Promise.resolve(4);//return了一个Promise
})
.then((res) => {
    console.log(res)
})
```

```js
//代码3
Promise.resolve().then(() => {
    return 4;//return了一个Number类型的4
})
.then((res) => {
    console.log(res)
})
```

这三个输出结果，打印出来的都是数字4。

我们可以看出不同，代码3是我们最常见的情况。代码3里打印的res是`4`，和上边`return`的是同样的数据类型。那么代码1和代码2的res为什么不是`Object`类型的`Promise{<fulfilled>: 4}`呢？

在一般情况下：

```js
Promise.resolve().then(() => {
    return 4;
})
```

这段代码中，`Promise.resolve().then`是一个构造函数,`() => {return 4;}`是这个函数的参数，这个函数调用，最后返回一个值为`4`的`Promise`(即`new Promise(resolve => resolve(4)`).

而在

```js
new Promise(resolve => {
    resolve(Promise.resolve(4));//resolve了一个Promise
})
```

```js
Promise.resolve().then(() => {
    return Promise.resolve(4);//return了一个Promise
})
```

中，因为js在遇到`resolve`或者`return`一个`Promise`对象时，会先求得这个`Promise`对象的值，也就是这个`Promise`的状态为`fulfilled`或`rejected`的值(假如这个值是`'a'`)，再用这个值作为返回的新的`Promised`的值，这个新的`Promsie`(就是`new Promise(resolve => resolve('a')`)作为下级链式调用的`Promise`。

## 2、结论

在chrome内部实现的Promise和标准的Promise/A+规范存在差异。浏览器内部实现的区别。我们可以理解为，resolve或者return遇到一个Promise对象时，得到这个Promise的值之后，会把这个值用微任务包装起来，在return值向外传递(因为后边没有.then()了，所以是向父级的外层传递)时，会产生第二个微任务。

所以代码

```js
//代码1
new Promise(resolve => {
    resolve(Promise.resolve(4));//resolve了一个Promise
})
.then((res) => {
    console.log(res)
})
```

可以理解为

```js
new Promise(resolve => {
    resolve(4);
})
.then()
.then()
.then((res) => {
    console.log(res)
})
```

对应的，代码

```js
//代码2
Promise.resolve().then(() => {
    return Promise.resolve(4);//return了一个Promise
})
.then((res) => {
    console.log(res)
})
```

可以理解为

```js
Promise.resolve()
.then(() => {
    return 4;
})
.then()
.then()
.then((res) => {
    console.log(res)
})
```

这样理解的，核心就是会比正常的return一个非Promise的值时，多两个微任务.then().then()

另外的

```js
Promise.resolve().then(() => {
    return Promise.resolve(Promise.resolve(Promise.resolve(4)))
})
.then(res => {
    console.log(res);
})
```

像这样的`return Promise.resolve(Promise.resolve(Promise.resolve(4)))`嵌套多层`Promise`，其实和`Promise.resolve(4)`是一样的，并不会多产生微任务。因为这两段代码的`Promsie`状态变为`fulfilled`的过程并不需要等待。而是拿到它的值之后，在向后运行的时候，会产生微任务。

但如果是

```js
Promise.resolve().then(() => {
    return new Promise(resolve => {
            resolve(4)
    })
    .then(res => {
            return 4.1
    })
    .then(res => {
            return 4.2
    })
})
.then(res => {
    console.log(res);
})
```

这时`.then(res => { console.log(res); })`想要运行，需要等待前边return 的Promise状态变为`fulfilled`才行，

```js
new Promise(resolve => {
        resolve(4)
})
.then(res => {
        return 4.1
})
.then(res => {
        return 4.2
})
```

本身是会注册两个微任务的，而拿到它的值之后，在向后运行的时候，又会产生两个任务(包装值一次，return传递一次)。

## 3、回顾

我们再来看这个题目

```js
Promise.resolve().then(() => {
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() =>{
    console.log(6);
})
```

按照上边的分析，可以对应转化为

```js
Promise.resolve().then(() => {
    console.log(0);
    return 4;
})
.then()
.then()
.then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() =>{
    console.log(6);
})
```
所以运行结果是0,1,2,3,4,5,6

</details>

## 95. 如何让 Proxy 去监听基本数据类型？ {#question-6d66ddb0-f53a-4286-b5e1-bf7ca3bcd34e}

> 难度：3 · 类型：QA

### 题目要点

`Proxy`无法直接监听基本数据类型（如字符串、数字、布尔值等），因为它们是不可变的。`Proxy`只能在对象级别上进行操作，而不是基本数据类型。

<details>
<summary>参考答案</summary>

`Proxy`无法直接监听基本数据类型（如字符串、数字、布尔值等），因为它们是不可变的。`Proxy`只能在对象级别上进行操作，而不是基本数据类型。

当我们尝试使用`Proxy`包装基本数据类型时，会得到一个`TypeError`错误，因为基本数据类型不具有属性和方法。

以下展示了尝试在基本数据类型上应用`Proxy`时会发生的错误：

```javascript
const value = 'Hello';

const handler = {
  set(target, property, value) {
    console.log(`Setting property '${property}' to '${value}'`);
    target[property] = value;
    return true;
  }
};

const proxyValue = new Proxy(value, handler); // TypeError: Cannot create proxy with a non-object as target
```

如果要监听基本数据类型的更改，最好使用其他方式，例如通过触发事件或调用回调函数来通知更改。可以创建一个自定义的数据包装器，将基本数据类型包装在对象中，并在该对象上实现监听逻辑。这样，可以在包装器对象上添加`Proxy`以监听其属性的更改。

以下是一个示例，演示如何使用自定义的数据包装器来监听基本数据类型的更改：

```javascript
function ValueWrapper(value) {
  this.value = value;
  this.onChange = null;
}

ValueWrapper.prototype.setValue = function(newValue) {
  this.value = newValue;
  if (typeof this.onChange === 'function') {
    this.onChange(this.value);
  }
};

const wrapper = new ValueWrapper('Hello');

const handler = {
  set(target, property, value) {
    console.log(`Setting property '${property}' to '${value}'`);
    target[property] = value;
    if (typeof target.onChange === 'function') {
      target.onChange(target.value);
    }
    return true;
  }
};

const proxyWrapper = new Proxy(wrapper, handler);

proxyWrapper.onChange = newValue => {
  console.log(`Value changed: ${newValue}`);
};

proxyWrapper.setValue('Hi'); // 输出: Setting property 'value' to 'Hi', Value changed: Hi
```

在上述示例中，我们创建了一个`ValueWrapper`对象作为数据包装器，并在其原型上定义了`setValue`方法来设置值并触发更改事件。然后，我们使用`Proxy`对该包装器对象进行拦截，以监听`value`属性的更改，并在适当时调用回调函数 `onChange`。

通过这种方式，可以实现对基本数据类型的更改进行监听和响应。

</details>

## 96. Proxy 能够监听到对象中的对象的引用吗？ {#question-d09f473f-e37f-4d6b-8208-2a0be8f87de7}

> 难度：2 · 类型：QA

### 题目要点

### 题目解析

`Proxy` 能够监听对象中的对象的引用。使用 `Proxy` 时，可以为对象的任何属性设置拦截器，包括属性值为对象的情况。这样，`Proxy` 不仅能够监听对象的直接属性，还能递归地监听嵌套对象的属性。

### 关键点

1. **嵌套对象的代理**：
   - 当 `Proxy` 代理一个对象时，任何对该对象的属性访问都可以被拦截。如果某个属性的值是一个对象，`Proxy` 可以通过**递归**创建新的 `Proxy` 实现对嵌套对象的监听。
   - 通过这种方式，可以实现对嵌套对象的属性进行拦截和监听。

2. **拦截器的使用**：
   - `get` 拦截器：用于拦截对对象属性的读取操作。可以在 `get` 拦截器中检查属性值是否为对象，如果是，则返回一个新的 `Proxy` 对象，这样嵌套对象也会被代理。
   - `set` 拦截器：用于拦截对对象属性的写入操作。可以在 `set` 拦截器中定义对属性赋值操作的处理逻辑。

<details>
<summary>参考答案</summary>

`Proxy`可以监听到对象中的对象的引用。

当使用`Proxy`包装一个对象时，可以为该对象的任何属性创建一个拦截器，包括属性值为对象的情况。

下面展示了如何使用`Proxy`来监听对象中对象引用的变化：

```javascript
const obj = {
  nestedObj: { foo: 'bar' }
}

const handler = {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, handler)
    }
    console.log('get', prop, target[prop])
    return value
  },
  set(target, property, value) {
    target[property] = value
    console.log(`Setting property '${property}' to '${value}'`)
    return true
  }
}

const proxyObj = new Proxy(obj, handler)
proxyObj.nestedObj.foo = 'baz'  // 输出: Setting property 'foo' to 'baz'
```

我们通过`Proxy`创建了一个代理对象`proxyObj`，它包装了原始的`obj`。然后，我们对`proxyObj`中的`nestedObj.foo`进行赋值操作，这会触发`set`拦截器，并打印相应的信息。

通过使用适当的拦截器函数，可以实现对对象中对象引用的监听和修改。这使得我们可以在需要时执行自定义的操作，例如记录更改、验证或触发其他事件等。

</details>

## 97. 需要在本地实现一个聊天室，多个tab页相互通信，不能用websocket，你会怎么做？ {#question-7053c84f-1316-43f2-a2ba-23fb00318220}

> 难度：2.5 · 类型：QA

### 题目要点

## 实现本地聊天室的三种方式

### 1. 使用 `BroadcastChannel` API

`BroadcastChannel` API 允许不同的浏览器标签页或窗口之间进行简单的广播通信。这种方式适用于需要在多个标签页之间广播消息的场景。

#### 思路

- **创建频道**：使用 `BroadcastChannel` 创建一个共享的频道，所有标签页都可以订阅这个频道。
- **发送消息**：在一个标签页中发送消息到频道。
- **接收消息**：在其他标签页中监听频道的消息，并处理接收到的消息。

#### 解析

- **简单直观**：`BroadcastChannel` 提供了简单的 API 来实现跨标签页通信，不需要额外的事件监听和数据管理。
- **浏览器支持**：适用于大多数现代浏览器，但可能不被某些老旧浏览器支持。
- **适用场景**：适合用于需要在多个标签页之间实时广播消息的应用，如聊天室。

### 2. 使用 `localStorage` 事件

`localStorage` 的 `storage` 事件可以在同一浏览器的不同标签页或窗口之间传递信息。每当一个标签页对 `localStorage` 进行写操作时，其他标签页会收到 `storage` 事件。

#### 思路

- **设置 `localStorage`**：在一个标签页中通过 `localStorage` 写入数据。
- **监听 `storage` 事件**：在其他标签页中监听 `storage` 事件，接收数据并处理消息。

#### 解析

- **兼容性**：`localStorage` 支持所有现代浏览器，因此兼容性较好。
- **消息管理**：需要处理 `localStorage` 中的数据管理和事件触发时的清理。
- **适用场景**：适合简单的跨标签页通信场景，但需要注意数据的同步和处理逻辑。

### 3. 使用 `SharedWorker`

`SharedWorker` 允许多个浏览器上下文（如标签页或窗口）共享一个单一的工作线程，适用于需要跨多个标签页共享状态或处理复杂逻辑的场景。

#### 思路

- **创建 `SharedWorker`**：编写一个 `SharedWorker` 脚本来处理消息传递和共享逻辑。
- **连接到 `SharedWorker`**：在每个标签页中创建 `SharedWorker` 实例，并与共享的工作线程进行通信。
- **处理消息**：在 `SharedWorker` 脚本中处理消息并将其广播到所有连接的标签页。

#### 解析

- **功能强大**：`SharedWorker` 允许在多个标签页之间共享工作线程，适合需要复杂通信和状态共享的应用。
- **资源共享**：能够有效地管理和共享数据，适合于需要持久化状态和复杂逻辑的场景。
- **浏览器支持**：较为现代，但可能不被所有浏览器支持，需要检查兼容性。

### 总结

- **`BroadcastChannel`**：简单直观，适合广播消息的场景。
- **`localStorage` 事件**：兼容性好，适合基本的跨标签页通信。
- **`SharedWorker`**：功能强大，适合复杂的跨标签页通信和状态共享需求。

根据具体的需求和浏览器支持，可以选择最适合的实现方式来构建本地聊天室应用。

<details>
<summary>参考答案</summary>

可以考虑使用以下方法：

1. 使用LocalStorage：这个存储API可在浏览器的不同标签页之间共享数据。当一个标签页发送消息时，将消息存储在LocalStorage中。其他标签页可以监听该存储区的变化，并读取最新的消息内容来实现通信效果。
```js
// 监听变化
window.addEventListener("storage", (e) => {
    // todo ...
});
```

2. 使用Broadcast Channel API：Broadcast Channel API 可以在浏览器的不同上下文（包括不同的标签页）之间进行双向通信。当一个标签页发送消息到广播频道时，其他标签页可以通过监听相同的广播频道来接收和响应消息。

3. 使用SharedWorker：SharedWorker 是一种在多个浏览器上下文之间共享脚本执行的机制，它可以在不同的标签页之间进行通信。可以创建一个SharedWorker，然后在各个标签页中连接到该SharedWorker，使它们能够共享数据和通信。

以上方法都可以实现在本地多个标签页之间进行通信，但需要根据具体需求和项目情况选择适合的解决方案。需要注意的是，这些方法只适用于本地通信，无法实现跨网络的实时通信效果，若需要实现更复杂的聊天室功能，WebSocket仍是更常用的选择。

</details>

## 98. 如果空数组调用reduce会发生什么？ {#question-a34f9f1b-c1b6-4660-b851-0b610c18e66e}

> 难度：1 · 类型：QA

### 题目要点

当空数组调用`reduce()`方法时，如果没有提供初始值参数，则会抛出一个`TypeError`错误。这是因为在空数组上调用`reduce()`方法时，无法得到初始累积值。

<details>
<summary>参考答案</summary>

当空数组调用`reduce()`方法时，如果没有提供初始值参数，则会抛出一个`TypeError`错误。这是因为在空数组上调用`reduce()`方法时，无法得到初始累积值。

例如：

```javascript
const emptyArray = [];
const result = emptyArray.reduce((accumulator, currentValue) => accumulator + currentValue);
// TypeError: Reduce of empty array with no initial value
```

要解决这个问题，可以提供一个初始值参数作为`reduce()`的第二个参数。这样，在空数组的情况下，将使用该初始值作为结果返回。

以下是对空数组使用`reduce()`并提供初始值的示例：

```javascript
const emptyArray = [];
const initialValue = 0;
const result = emptyArray.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue);

console.log(result); // 输出: 0
```

在上述代码中，我们通过将初始值设置为0，确保了在空数组的情况下也能正确返回结果。

</details>

## 99. 数组中的reduce方法有用过吗，说说它的具体用途？ {#question-9b464276-64d0-4c3b-b908-0b5e34da878b}

> 难度：1 · 类型：QA

### 题目要点

`reduce()`方法在JavaScript中是一个高阶函数，用于对数组中的每个元素进行累积操作，最终返回一个单一的值。

<details>
<summary>参考答案</summary>

`reduce()`方法在JavaScript中是一个高阶函数，用于对数组中的每个元素进行累积操作，最终返回一个单一的值。

具体来说，`reduce()`方法接受两个参数：回调函数和可选的初始值。回调函数在每个数组元素上被调用，并且可以接受四个参数：累积值（上一次回调函数的返回值或初始值）、当前值、当前索引和原始数组。

`reduce()`方法的执行过程如下：

1. 如果提供了初始值，则将其作为累积值（accumulator），否则使用数组的第一个元素作为初始累积值。
2. 对于数组中的每个元素，都调用回调函数，并传递当前累积值、当前值、当前索引和原始数组作为参数。
3. 回调函数返回的值作为下一次调用的累积值。
4. 最终，`reduce()`方法返回最后一次调用回调函数的返回值。

以下是一个示例，演示了如何使用`reduce()`方法计算数组中所有元素的总和：

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue);

console.log(sum); // 输出: 15
```

在上述代码中，使用`reduce()`方法对`numbers`数组中的每个元素进行累加操作，并将结果存储在`sum`变量中。

`reduce()`方法非常强大，可以用于解决各种累积计算问题，如求和、求平均值、查找最大/最小值等。

它提供了一种简洁而灵活的方式来处理数组数据，并生成一个单一的结果。

</details>

## 100. 改变this指向的方法有哪些？ {#question-9a1251b3-e4e9-4ef6-a960-14d1c399d3c5}

> 难度：1 · 类型：QA

### 题目要点

有以下几种常用的方法可以改变`this`的指向：

<details>
<summary>参考答案</summary>

有以下几种常用的方法可以改变`this`的指向：

1. 使用`bind()`方法：`bind()`方法会创建一个新的函数，并将其内部的`this`绑定到指定的对象。例如：

```javascript
function sayHello() {
  console.log("Hello, " + this.name);
}

const person = { name: "John" };
const boundFunction = sayHello.bind(person);
boundFunction(); // 输出: Hello, John
```

2. 使用箭头函数（Arrow Function）：箭头函数没有自己的`this`，它会继承外部作用域的`this`。因此，在箭头函数中使用`this`时，它会指向定义时所在的上下文。例如：

```javascript
const obj = {
  name: "Alice",
  sayHello: function() {
    setTimeout(() => {
      console.log("Hello, " + this.name);
    }, 1000);
  }
};

obj.sayHello(); // 输出: Hello, Alice
```

3. 使用`call()`或`apply()`方法：`call()`和`apply()`方法可以立即调用函数，并显式指定函数内部的`this`值。它们之间的区别在于参数的传递方式。例如：

```javascript
function sayHello() {
  console.log("Hello, " + this.name);
}

const person = { name: "John" };
sayHello.call(person); // 输出: Hello, John

// 或者使用 apply()
sayHello.apply(person); // 输出: Hello, John
```

</details>

## 101. addEventListener 第三个参数 {#question-8cbb58f4-7fb1-4c88-9e15-ed38eb0bd283}

> 难度：1.5 · 类型：QA

### 题目要点

<h2 style="text-align:start;text-indent:2em;" dir="auto">延伸知识</h2><p style="text-align:start;text-indent:2em;" dir="auto">在标准事件模型中，<code>stopPropagation()</code> 和 <code>stopImmediatePropagation()</code> 都用于控制事件的传播，但它们的作用略有不同。下面是对这两个方法的详细比较：</p><p></p><h3 style="text-align:start;text-indent:2em;" dir="auto">1. <code>stopPropagation()</code></h3><ul><li><strong>功能</strong>：<code>stopPropagation()</code> 方法用于阻止事件在当前阶段的传播（即阻止事件从目标节点向上传播到父节点或从根节点向目标节点的捕获阶段）。</li><li><strong>使用场景</strong>：适用于需要阻止事件冒泡到父元素的情况。例如，点击事件在嵌套元素上触发时，可以使用 <code>stopPropagation()</code> 来防止父元素的事件处理程序被调用。<br/></li></ul><h3 style="text-align:start;text-indent:2em;" dir="auto">2. <code>stopImmediatePropagation()</code></h3><ul><li><strong>功能</strong>：<code>stopImmediatePropagation()</code> 方法不仅阻止事件在当前阶段的传播，还会阻止当前节点上的其他事件处理程序的执行。这意味着如果一个元素上注册了多个事件处理程序，调用 <code>stopImmediatePropagation()</code> 将阻止该元素上后续的事件处理程序执行。</li><li><strong>使用场景</strong>：适用于需要完全停止当前事件处理程序的执行并阻止事件进一步传播的情况。例如，当一个事件处理程序需要确保不执行其他处理程序时，可以使用 <code>stopImmediatePropagation()</code>。</li><li><strong>示例</strong>：<br/></li></ul><h3 style="text-align:start;text-indent:2em;" dir="auto">3. 比较</h3><ul><li><strong><code>stopPropagation()</code></strong>：<br/></li><ul><li>阻止事件的冒泡和捕获阶段的传播。</li><li>不影响当前节点上的其他事件处理程序的执行。</li></ul></ul><p></p><ul><li><strong><code>stopImmediatePropagation()</code></strong>：<br/></li><ul><li>阻止事件的冒泡和捕获阶段的传播。</li><li>同时阻止当前节点上其他所有的事件处理程序的执行。</li></ul></ul><p></p><h3 style="text-align:start;text-indent:2em;" dir="auto">4. 注意事项</h3><ul><li>使用 <code>stopPropagation()</code> 时，其他事件处理程序仍然可以在当前节点上执行。</li><li>使用 <code>stopImmediatePropagation()</code> 时，除了阻止事件的传播外，还会阻止其他事件处理程序的执行，这可能会影响页面的行为和用户体验。</li></ul><p style="text-align:start;text-indent:2em;" dir="auto">理解这两个方法的区别，可以帮助你更精确地控制事件处理逻辑，确保事件处理符合预期。</p>

<details>
<summary>参考答案</summary>

<p></p><p>addEventListener 语法 </p><p></p><pre><code>addEventListener(type, listener); <br/>addEventListener(type, listener, options); <br/>addEventListener(type, listener, useCapture); </code></pre><p></p><h3 id="参数"><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#%E5%8F%82%E6%95%B0">参数</a></h3><p><code>type</code>表示监听<u><a href="https://developer.mozilla.org/zh-CN/docs/Web/Events">事件类型</a></u>的大小写敏感的字符串。</p><p><code>listener</code>当所监听的事件类型触发时，会接收到一个事件通知（实现了 <code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Event">Event</a></u></code> 接口的对象）对象。<code>listener</code> 必须是一个实现了 <code><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener" aria-current="page">EventListener</a></code> 接口的对象，或者是一个<u><a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions">函数</a></u>。有关回调本身的详细信息，请参阅<u><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#%E4%BA%8B%E4%BB%B6%E7%9B%91%E5%90%AC%E5%9B%9E%E8%B0%83">事件监听回调</a></u></p><p></p><p><code>options</code> <span style="font-size:var(px">可选</span>一个指定有关 <code>listener</code> 属性的可选参数对象。可用的选项如下：</p><ul><li><code>capture</code> <span style="font-size:var(px">可选</span>一个布尔值，表示 <code>listener</code> 会在该类型的事件捕获阶段传播到该 <code>EventTarget</code> 时触发。</li><li><code>once</code> <span style="font-size:var(px">可选</span>一个布尔值，表示 <code>listener</code> 在添加之后最多只调用一次。如果为 <code>true</code>，<code>listener</code> 会在其被调用之后自动移除。</li><li><code>passive</code> <span style="font-size:var(px">可选</span>一个布尔值，设置为 <code>true</code> 时，表示 <code>listener</code> 永远不会调用 <code>preventDefault()</code>。如果 listener 仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。查看<u><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#%E4%BD%BF%E7%94%A8_passive_%E6%94%B9%E5%96%84%E6%BB%9A%E5%B1%8F%E6%80%A7%E8%83%BD">使用 passive 改善滚屏性能</a></u>以了解更多。</li><li><code>signal</code> <span style="font-size:var(px">可选</span><code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/AbortSignal">AbortSignal</a></u></code>，该 <code>AbortSignal</code> 的 <code><u><a href="https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/abort">abort()</a></u></code> 方法被调用时，监听器会被移除。</li></ul><p><code>useCapture</code> <span style="font-size:var(px">可选</span>一个布尔值，表示在 DOM 树中注册了 <code>listener</code> 的元素，是否要先于它下面的 <code>EventTarget</code> 调用该 <code>listener</code>。当 useCapture（设为 true）时，沿着 DOM 树向上冒泡的事件不会触发 listener。当一个元素嵌套了另一个元素，并且两个元素都对同一事件注册了一个处理函数时，所发生的事件冒泡和事件捕获是两种不同的事件传播方式。事件传播模式决定了元素以哪个顺序接收事件。进一步的解释可以查看 <u><a href="https://www.w3.org/TR/DOM-Level-3-Events/#event-flow" target="_blank" class="external">DOM Level 3 事件</a></u>及 <u><a href="https://www.quirksmode.org/js/events_order.html#link4" target="_blank" class="external">JavaScript 事件顺序</a></u>文档。如果没有指定，<code>useCapture</code> 默认为 <code>false</code>。</p><p><br/><strong>备注：</strong> 对于事件目标上的事件监听器来说，事件会处于“目标阶段”，而不是冒泡阶段或者捕获阶段。捕获阶段的事件监听器会在任何非捕获阶段的事件监听器之前被调用。<br/></p>

</details>

## 102. 是否有使用过空值合并运算符（??），举几个可以使用的场景。 {#question-19719ee6-50b8-42fe-bf35-ef78f32fa209}

> 难度：1 · 类型：QA

### 题目要点

**空值合并操作符（??）** 是一个逻辑操作符，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作数，否则返回左侧操作数。

<details>
<summary>参考答案</summary>

**空值合并操作符（??）** 是一个逻辑操作符，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作数，否则返回左侧操作数。

与**逻辑或操作符（||）** 不同，逻辑或操作符会在左侧操作数为假值时返回右侧操作数。也就是说，如果使用 || 来为某些变量设置默认值，可能会遇到意料之外的行为。比如为假值（例如，'' 或 0）时。见下面的例子。

```js
const foo = null ?? 'default string';
console.log(foo);
// expected output: "default string"

const baz = 0 ?? 42;
console.log(baz);
// expected output: 0
```

## 示例场景

### 使用空值合并操作符

在这个例子中，我们使用空值合并操作符为常量提供默认值，保证常量不为 null 或者 undefined。

```js
const nullValue = null;
const emptyText = ""; // 空字符串，是一个假值，Boolean("") === false
const someNumber = 42;

const valA = nullValue ?? "valA 的默认值";
const valB = emptyText ?? "valB 的默认值";
const valC = someNumber ?? 0;

console.log(valA); // "valA 的默认值"
console.log(valB); // ""（空字符串虽然是假值，但不是 null 或者 undefined）
console.log(valC); // 42
```

### 为变量赋默认值

以前，如果想为一个变量赋默认值，通常的做法是使用逻辑或操作符（||）：

```js

let foo;

//  foo is never assigned any value so it is still undefined
let someDummyText = foo || 'Hello!';
```

然而，由于 || 是一个布尔逻辑运算符，左侧的操作数会被强制转换成布尔值用于求值。任何假值（0， ''， NaN， null， undefined）都不会被返回。这导致如果你使用0，''或NaN作为有效值，就会出现不可预料的后果。

```js
let count = 0;
let text = "";

let qty = count || 42;
let message = text || "hi!";
console.log(qty);     // 42，而不是 0
console.log(message); // "hi!"，而不是 ""
```

空值合并操作符可以避免这种陷阱，其只在第一个操作数为null 或 undefined 时（而不是其它假值）返回第二个操作数：

```
let myText = ''; // An empty string (which is also a falsy value)

let notFalsyText = myText || 'Hello world';
console.log(notFalsyText); // Hello world

let preservingFalsy = myText ?? 'Hi neighborhood';
console.log(preservingFalsy); // '' (as myText is neither undefined nor null)
```

### 短路

与 OR 和 AND 逻辑操作符相似，当左表达式不为 null 或 undefined 时，不会对右表达式进行求值。

```js
function A() { console.log('函数 A 被调用了'); return undefined; }
function B() { console.log('函数 B 被调用了'); return false; }
function C() { console.log('函数 C 被调用了'); return "foo"; }

console.log( A() ?? C() );
// 依次打印 "函数 A 被调用了"、"函数 C 被调用了"、"foo"
// A() 返回了 undefined，所以操作符两边的表达式都被执行了

console.log( B() ?? C() );
// 依次打印 "函数 B 被调用了"、"false"
// B() 返回了 false（既不是 null 也不是 undefined）
// 所以右侧表达式没有被执行
```

</details>

## 103. canvas 和 webgl 有什么区别？ {#question-984c0b83-46a5-4d36-ae41-8e612bac2943}

> 难度：3 · 类型：QA

### 题目要点

Canvas和WebGL都是用于在Web浏览器中绘制图形和动画的技术，但它们在实现和功能上有一些区别：

<details>
<summary>参考答案</summary>

Canvas和WebGL都是用于在Web浏览器中绘制图形和动画的技术，但它们在实现和功能上有一些区别：

1. 渲染方式：
   - Canvas：Canvas使用2D渲染上下文（2D context）来绘制图形和图像。它基于像素的绘图系统，通过JavaScript脚本控制渲染过程。
   - WebGL：WebGL（Web Graphics Library）是基于OpenGL ES标准的JavaScript API，它可以利用GPU进行硬件加速的3D图形渲染。WebGL使用着色器（shaders）编程，允许更复杂和高性能的图形渲染。

2. 功能和复杂性：
   - Canvas：Canvas提供了简单的2D图形绘制功能，包括绘制基本形状、路径、文本和图像等。它适用于绘制简单的图形和动画。
   - WebGL：WebGL提供了强大的3D图形渲染功能，包括高级的着色器编程、纹理映射、深度缓冲、光照效果等。它适用于创建复杂的3D图形、游戏和交互式可视化。

3. 编程难度：
   - Canvas：使用Canvas进行2D图形绘制相对简单，仅需基本的JavaScript知识和绘图API的了解即可开始绘制。
   - WebGL：WebGL的编程相对复杂，需要了解着色器编程和3D图形渲染的概念。使用WebGL需要掌握OpenGL ES或类似的图形编程知识。

选择Canvas还是WebGL取决于具体的需求。如果只需要简单的2D图形和动画，Canvas是一个不错的选择。但如果需要更高级的3D图形渲染和性能，或者开发复杂的游戏或可视化应用程序，那么WebGL可能更适合。

</details>

## 104. 说说下面代码的输出是什么？ {#question-03e6d443-bac2-40be-847b-3276b05bae4e}

> 难度：2 · 类型：QA

```js
function Foo(){
    Foo.a = function(){
        console.log(1);
    }
    this.a = function(){
        console.log(2)
    }
}

Foo.prototype.a = function(){
    console.log(3);
}

Foo.a = function(){
    console.log(4);
}

Foo.a();
let obj = new Foo();
obj.a();
Foo.a();
```

### 题目要点

运行以上代码，输出结果为：

<details>
<summary>参考答案</summary>

运行以上代码，输出结果为：

```
4
2
1
```

解析如下：

1. 首先，调用 Foo.a() 方法，输出 4。这是因为 Foo.a 是一个静态方法，直接在函数对象上定义的，所以可以通过函数名直接调用执行。

2. 然后，创建一个 Foo 类型的实例 obj，调用 obj.a() 方法，输出 2。这是因为在构造函数 Foo 中，使用 this.a 定义了实例属性 a，会覆盖原型中的同名属性。

3. 最后，再次调用 Foo.a() 方法，输出 1。虽然在上面已经定义了一个静态方法 Foo.a，但是在构造函数 Foo 中又重新定义了一个同名属性，导致静态方法被覆盖了，所以此时输出的是在构造函数中定义的方法。

</details>

## 105. 说说下面代码的执行过程 {#question-daa37c79-092b-4d02-a963-05a374864788}

> 难度：2 · 类型：QA

```js
var a=3;
 function c(){
    alert(a);
 }
 (function(){
  var a=4;
  c();
 })();
```

### 题目要点

这段代码的执行过程如下：

<details>
<summary>参考答案</summary>

这段代码的执行过程如下：

1. 定义变量 a 并赋值为 3。
2. 定义一个函数 c，该函数弹出一个对话框显示变量 a 的值。
3. 定义一个立即执行函数，并在其中定义变量 a 并赋值为 4。
4. 在立即执行函数中调用函数 c。
5. 函数 c 弹出一个对话框显示变量 a 的值，此时输出结果为 3。

原因是在立即执行函数中定义的变量 a 只在该函数作用域内有效，并没有改变全局作用域中的变量 a 的值，而函数 c 中使用的变量 a 是从全局作用域中查找的，因此输出的是全局作用域中的变量 a 的值。

</details>

## 106. generator 是怎么做到中断和恢复的？ {#question-231bf96d-c071-4e8e-9db8-cd0fa0763fc5}

> 难度：3 · 类型：QA

### 题目要点

Generator 是一种特殊的函数类型，可以在函数执行过程中暂停和恢复执行。它通过使用 yield 表达式来实现中断和恢复执行的功能。

<details>
<summary>参考答案</summary>

Generator 是一种特殊的函数类型，可以在函数执行过程中暂停和恢复执行。它通过使用 yield 表达式来实现中断和恢复执行的功能。

当 Generator 函数被调用时，它并不会立即执行，而是返回一个迭代器对象。每次调用迭代器对象的 next() 方法时，Generator 函数会从上一次执行的位置继续执行，直到遇到下一个 yield 表达式或函数结束。此时，Generator 函数将返回一个包含当前值和执行状态的对象，其中 value 属性表示 yield 表达式的结果，done 属性表示是否执行完毕。

例如，下面是一个简单的 Generator 函数示例：

```
function* myGenerator() {
  console.log('Step 1');
  yield;
  console.log('Step 2');
  yield;
  console.log('Step 3');
}

const gen = myGenerator();
gen.next(); // 输出 Step 1
gen.next(); // 输出 Step 2
gen.next(); // 输出 Step 3
```

在这个示例中，myGenerator() 函数包含三个 yield 表达式，每次调用迭代器对象的 next() 方法都会从上一次执行的位置继续执行，直到遇到下一个 yield 表达式或函数结束。

当执行第一个 gen.next() 方法时，输出 Step 1，并暂停执行，将控制权交回给调用者。当再次调用 gen.next() 方法时，继续执行后面的代码，输出 Step 2，并再次暂停执行。最后，再次调用 gen.next() 方法时，完成函数的执行，输出 Step 3，并返回一个包含 value 和 done 属性的对象。

通过使用 yield 表达式和迭代器对象，Generator 函数可以实现中断和恢复执行的功能，从而提供更灵活、更高效的 JavaScript 编程方式。

</details>

## 107. 为什么要区分宏任务和微任务？它们的执行优先级是什么？ {#question-d6b01c3c-e671-4edf-a739-35745ff5119e}

> 难度：3 · 类型：QA

### 题目要点

宏任务（macrotask）和微任务（microtask）的区分主要是为了解决 JavaScript 引擎中不同任务之间的执行优先级问题。

<details>
<summary>参考答案</summary>

宏任务（macrotask）和微任务（microtask）的区分主要是为了解决 JavaScript 引擎中不同任务之间的执行优先级问题。

宏任务通常包括以下几种：

- setTimeout 和 setInterval 定时器
- DOM 事件处理程序
- AJAX 请求的回调函数
- script 标签的加载和执行

对于宏任务，JavaScript 引擎会将其添加到任务队列（task queue）中，在当前任务执行完毕后按顺序依次执行。

而微任务通常包括以下几种：

- Promise 的 then 方法和 catch 方法
- async/await 中的 await 表达式
- MutationObserver 监听器

对于微任务，JavaScript 引擎也会将其添加到任务队列中，但是微任务的执行在当前宏任务执行结束后立即进行，也就是说微任务具有更高的执行优先级，可以优先于下一个宏任务执行。

通过区分宏任务和微任务，我们可以更好地控制任务的执行顺序，提高应用程序的性能和响应速度。例如，在处理一些异步操作时，可以使用 Promise 来代替普通的回调函数，并通过 then 方法和 catch 方法来实现更灵活、更高效的任务处理方式。同时，在编写代码时需要注意，尽量避免在宏任务中进行耗时操作，以免影响其他任务的执行。

总之，宏任务和微任务的区分是为了更好地协调任务的执行优先级，提高 JavaScript 的运行效率和代码的可读性。

</details>

## 108. 导致 JavaScript 中 this 指向混乱的原因是什么? {#question-dbf9172e-1193-44cb-a534-3c16ae07de2d}

> 难度：2 · 类型：QA

### 题目要点

JavaScript 中 this 指向混乱的原因主要有以下几点：

<details>
<summary>参考答案</summary>

JavaScript 中 this 指向混乱的原因主要有以下几点：

1. 函数调用方式不同：JavaScript 中函数的调用方式有多种，包括普通函数调用、方法调用、构造函数调用和箭头函数等。不同的调用方式会导致 this 的指向不同。

2. 丢失绑定：当一个函数被单独调用时，即没有任何对象或上下文与之相关联时，this 将指向全局对象（在浏览器环境中通常是 `window` 对象）。这种情况下，如果函数内部使用了 this，则可能会出现意外结果。

3. 隐式绑定丢失：当一个方法从对象中切割出来并作为独立函数调用时，隐式绑定将会丢失，导致 this 不再指向原对象。这往往发生在将对象方法作为回调函数传递给其他函数的情况下。

4. 显式绑定问题：使用 `.call()`、`.apply()` 或 `.bind()` 方法可以显式地绑定函数的 this，但如果不小心使用或错误地使用这些方法，也可能导致 this 指向混乱。

5. 箭头函数中的 this：箭头函数没有自己的 this 绑定机制，它会从外围作用域继承 this。这意味着箭头函数中的 this 与其定义时的上下文相关联，而不是调用时的上下文。

6. 异步操作中的 this：在异步函数或回调函数中，this 的指向可能会发生变化，因为它们的执行上下文可能会改变。

为了避免 this 指向混乱的问题，可以采取以下措施：

- 使用箭头函数，它能够继承外部作用域的 this。
- 使用 `.bind()`、`.call()` 或 `.apply()` 方法显式地绑定函数的 this。
- 使用闭包将需要引用的 this 缓存起来。
- 在方法调用时确保上下文正确。

> 面试题由“前端面试题宝典”（官网： https://fe.ecool.fun ）整理维护，如果您在其他网站或者小程序中使用，请向小助手（微信号：interview-fe）反馈。

</details>

## 109. 前端路由 `a -> b -> c`这样前进，也可以返回 `c -> b -> a`，用什么数据结构来存比较高效 {#question-58ceb7d9-5bcb-433a-acce-902aee7ef7f4}

> 难度：2 · 类型：QA

### 题目要点

在前端路由中，常用的存储方式是栈（Stack）数据结构。栈是一种线性数据结构，具有后进先出（LIFO）的特点，即最后入栈的元素最先弹出栈。

<details>
<summary>参考答案</summary>

在前端路由中，常用的存储方式是栈（Stack）数据结构。栈是一种线性数据结构，具有后进先出（LIFO）的特点，即最后入栈的元素最先弹出栈。

当用户访问一个新页面时，可以将当前页面路由信息压入栈中。例如，在访问页面 a 时，可以将 a 的路由信息存储在栈顶。当用户访问 b 页面时，再将 b 的路由信息压入栈中，此时 a 的路由信息就被挤到了栈底。以此类推，当用户访问 c 页面时，c 的路由信息被压入栈顶，a 和 b 的路由信息都被挤到了栈底。

如果用户想要返回上一个页面，可以从栈顶弹出最后一个路由信息，并显示对应的页面。例如，在 c 页面返回 b 页面时，可以从栈顶弹出 c 的路由信息，然后显示 b 页面。此时，a 和 b 的路由信息还保留在栈中。如果用户再次返回上一个页面，则从栈顶弹出 b 的路由信息，然后显示 a 页面。此时，只有 a 的路由信息剩余在栈中。

使用栈数据结构来存储前端路由信息具有以下优点：

- 简单直观：栈数据结构易于理解和实现，符合前端路由的基本需求。
- 高效快速：在栈中压入和弹出元素都是 O(1) 的时间复杂度，不会对页面加载和响应产生太大的影响。
- 可扩展性：栈数据结构可以很容易地扩展到支持浏览器的前进和后退按钮。

在使用栈数据结构来存储前端路由信息时，还需要考虑如何处理浏览器刷新、从历史记录中跳转等特殊情况，并进行相应的错误处理。

> 面试题由“前端面试题宝典”（官网： https://fe.ecool.fun ）整理维护，如果您在其他网站或者小程序中使用，请向小助手（微信号：interview-fe）反馈。

</details>

## 110. 如果要实现一个类似“谷歌图片”的系统，你会有哪些方面的考虑？ {#question-0bfc8fed-e416-4d1b-bbac-ab71ee678f1a}

> 难度：4.5 · 类型：QA

### 题目要点

可以从以下几个方面考虑：

<details>
<summary>参考答案</summary>

可以从以下几个方面考虑：

1. 设计界面和交互：首先需要设计一个美观、易用的用户界面，包括搜索框、图片展示区、分页、筛选器等。同时还需要设计一些交互细节，例如图片加载过程中的占位符、无结果时的提示信息、图片缩放和拖拽等。
2. 数据获取和处理：接下来需要考虑如何获取和处理图片数据。可以使用爬虫技术从其他网站抓取图片，也可以通过图片 API 或者图库合作获得。在获取到图片之后，还需要对其进行处理，例如压缩、裁剪、优化等。
3. 存储和管理图片：为了提高图片的访问速度和稳定性，需要将图片存储在 CDN 或者对象存储服务上，并建立相应的管理系统，包括上传、删除、修改、备份等功能。
4. 图片搜索和智能推荐：为了提高搜索体验和用户满意度，可以开发一些算法和模型，对图片进行分类、标记和关联，从而实现更精确的搜索和智能推荐功能。
5. 安全和隐私保护：在实现图片搜索和分享的同时，也需要注意安全和隐私保护。可以采用图像识别技术对涉黄、涉暴等不良内容进行过滤，防止违规图片的发布和传播。同时还需要保护用户隐私，避免非法获取和使用用户个人信息。
6. 图片渲染性能：图片预请求、列表图片使用小图显示、jpg图片格式注意选择渲染模式、列表图片采用多个子域名提高并行请求数

> 面试题由“前端面试题宝典”（官网： https://fe.ecool.fun ）整理维护，如果您在其他网站或者小程序中使用，请向小助手（微信号：interview-fe）反馈。

</details>

## 111. 前端的页面截图怎么实现？ {#question-e808ed13-2162-44ac-a70d-54d915cf901b}

> 难度：2.5 · 类型：QA

### 题目要点

前端实现页面截图主要有以下几种方式：

<details>
<summary>参考答案</summary>

前端实现页面截图主要有以下几种方式：

1. 使用浏览器自带的截图功能：在 Chrome 浏览器中，可以通过右键菜单或者快捷键 Ctrl + Shift + P 打开“命令菜单”，然后输入“截图”并选择相应选项即可。
2. 使用第三方插件或工具：例如 Awesome Screenshot、Nimbus Screenshot 等浏览器插件，或者 html2canvas、dom-to-image 等 JavaScript 库。
3. 使用 Canvas 绘制：通过 Canvas API 可以绘制出页面内容，并将其导出为图片格式。具体实现可以参考 Fabric.js、Puppeteer 等库。
4. 使用服务器端渲染：对于需要生成动态内容或者需要进行复杂操作的页面，可以使用服务器端渲染技术（如 Node.js 或 PHP）来生成网页截图。

 > 面试题由“前端面试题宝典”（官网： https://fe.ecool.fun ）整理维护，如果您在其他网站或者小程序中使用，请向小助手（微信号：interview-fe）反馈。

以上这些方法各有优缺点。

- 使用浏览器截图功能简单便捷，但是可能无法自定义截图范围和格式；
- 使用第三方插件或工具需要安装额外的软件，而且可能存在安全风险；
- 使用 Canvas 绘制需要掌握一定的 Canvas 编程知识，而且可能会影响性能；
- 使用服务器端渲染则需要对服务器编程有一定的了解。

</details>

## 112. 下面代码的输出是什么？ {#question-49ab4d36-c9e1-42c9-9df1-a610dc9dac8e}

> 难度：3 · 类型：QA

```js
const obj = {
 fn1: () => console.log(this),
 fn2: function() {console.log(this)}
}

obj.fn1();
obj.fn2();

const x = new obj.fn1();
const y = new obj.fn2();
```

### 题目要点

### 题目解析

**关键点**： 箭头函数不能作为构造函数来调用，即不能使用 `new` 来调用箭头函数！

1. **`obj.fn1()`**：
    - **输出**: `undefined`
    - **解释**: `fn1` 是一个箭头函数。箭头函数没有自己的 `this` 上下文，它们会从定义它们的词法环境中继承 `this`。在这个例子中，定义环境是全局作用域（或者是 ES 模块的模块作用域）。在严格模式或模块中，`this` 是 `undefined`，因此输出是 `undefined`。

2. **`obj.fn2()`**：
    - **输出**: `{ fn1: [Function: fn1], fn2: [Function: fn2] }`
    - **解释**: `fn2` 是一个常规函数。常规函数有自己的 `this` 上下文，`this` 的值取决于函数的调用方式。当作为对象的方法调用时，`this` 指向该对象。在这个例子中，`obj` 是调用 `fn2` 的对象，因此 `this` 在 `fn2` 中指向 `obj`。

3. **`new obj.fn1()`**：
    - **输出**: `TypeError: obj.fn1 is not a constructor`
    - **解释**: 箭头函数不能作为构造函数使用。箭头函数没有 `[[Construct]]` 方法，这是构造函数所必需的。尝试使用箭头函数作为构造函数会导致 `TypeError` 错误。

4. **`new obj.fn2()`**：
    - **输出**: `{ fn1: [Function: fn1], fn2: [Function: fn2] }`
    - **解释**: `fn2` 是一个常规函数，可以作为构造函数使用。使用 `new` 关键字调用它时，会创建 `fn2` 的新实例。由于 `fn2` 是 `obj` 的一个方法，新实例的原型是 `obj`。因此，新实例具有与 `obj` 相同的属性，并且 `this` 在 `fn2` 中指向新创建的实例。输出反映了创建的新实例。

<details>
<summary>参考答案</summary>

在上面的代码中，obj 对象包含两个方法 fn1 和 fn2。fn1 使用箭头函数定义，而 fn2 使用普通函数定义。

对于箭头函数，它没有自己的 this 值，也就是说它会捕获上下文中的 this 值，因此 fn1 中的 this 指向的是全局对象 window（或者 undefined，如果运行环境是严格模式）。因此，当我们调用 obj.fn1() 时，输出结果为 **window**（或 undefined）。

对于普通函数，它的 this 值是在运行时动态绑定的。因此，当我们调用 obj.fn2() 时，输出结果为 **obj 对象本身**。

接下来，代码中分别使用 new 运算符创建了 obj.fn1 和 obj.fn2 的实例 x 和 y。

**由于箭头函数没有自己的 this 值，所以尝试使用 new 运算符创建实例会导致 TypeError 错误。**也就是 `new obj.fn1() ` 会报错。

而对于普通函数，new 运算符可以正确地创建实例，并且 this 值指向新创建的实例对象。但因为上面执行  `new obj.fn1() `  时 js 已经报错，`new obj.fn2(); ` 并不会执行。

</details>

## 113. 浏览器有哪几种缓存，各种缓存的优先级是什么样的？ {#question-ac644e0a-1fbe-4e0a-9f9f-ecc373a13a87}

> 难度：3 · 类型：QA

### 题目要点

### 延伸知识

光记住这些理论是不够的，还需要深入在实际场景中去运用。至少要思考如下几个问题：

- HTML文件应该采用哪种缓存？强缓存还是协商缓存？
- JS/CSS/图片，应该采用哪种方式？
- webpack打包时的 contenthash 是做什么的？
- 有时候，JS文件名没法修改，我们会在JS的URL最后面加上类似 `xxx.js?v=20240719` 这种query参数，是做什么的？

<details>
<summary>参考答案</summary>

在浏览器中，有以下几种常见的缓存：

1. 强制缓存：通过设置 Cache-Control 和 Expires 等响应头实现，可以让浏览器直接从本地缓存中读取资源而不发起请求。
2. 协商缓存：通过设置 Last-Modified 和 ETag 等响应头实现，可以让浏览器发送条件请求，询问服务器是否有更新的资源。如果服务器返回 304 Not Modified 响应，则表示客户端本地缓存仍然有效，可直接使用缓存的资源。
3. Service Worker 缓存：Service Worker 是一种特殊的 JS 脚本，可以拦截网络请求并返回缓存的响应，以实现离线访问和更快的加载速度等功能。
4. Web Storage 缓存：包括 localStorage 和 sessionStorage。localStorage 用于存储用户在网站上的永久性数据，而 sessionStorage 则用于存储用户会话过程中的临时数据。

这些缓存的优先级如下：

1. Service Worker 缓存：由于其可以完全控制网络请求，因此具有最高的优先级，即使是强制缓存也可以被它所覆盖。
2. 强制缓存：如果存在强制缓存，并且缓存没有过期，则直接使用缓存，不需要向服务器发送请求。
3. 协商缓存：如果强制缓存未命中，但协商缓存可用，则会向服务器发送条件请求，询问资源是否更新。如果服务器返回 304 Not Modified 响应，则直接使用缓存。
4. Web Storage 缓存：Web Storage 缓存的优先级最低，只有在网络不可用或者其他缓存都未命中时才会生效。

</details>

## 114. Web Worker 是什么？ {#question-9ae6ebb4-5aae-4a1b-b0e8-15e1b12bc178}

> 难度：2 · 类型：QA

### 题目要点

### 题目解析

除了本题答案之外，还需要熟悉webworker本身使用上的一些限制，通常在面试中，都会涉及到，下面列举几个

### Web Worker 使用上的限制

1. **没有直接访问 DOM**：
    - Web Worker 无法直接操作 DOM 或访问 `window` 对象。它们是运行在后台线程中的，用于处理计算密集型任务或异步操作，不能直接对页面进行操作。

2. **不支持 `this` 上下文**：
    - Web Worker 中的 `this` 指向 `Worker` 对象本身，而不是全局上下文。这意味着在 Web Worker 内部不能使用传统的 `this` 机制来访问全局对象。

3. **限制的 API**：
    - Web Worker 只能访问有限的 Web API，例如 `XMLHttpRequest`、`fetch` 和 `WebSocket`。它们不能使用与 DOM 操作相关的 API，如 `document`、`window`、`localStorage` 等。

4. **不支持同步的 AJAX 请求**：
    - Web Worker 不支持同步的 `XMLHttpRequest` 请求。所有的网络请求都必须是异步的。

5. **传递的数据限制**：
    - Web Worker 和主线程之间的数据传递是通过消息传递机制完成的，数据需要被序列化和反序列化。不能直接传递函数或带有方法的对象，只能传递可序列化的数据（如基本数据类型、数组、对象）。

6. **不能使用 `alert`、`prompt` 和 `confirm`**：
    - Web Worker 中不能使用这些浏览器对话框方法，因为它们依赖于用户界面线程。

7. **不支持 `eval` 和 `document.write`**：
    - Web Worker 内部不能使用 `eval` 方法来执行字符串中的代码，也不能使用 `document.write` 方法。

8. **生命周期管理**：
    - Web Worker 的生命周期与主线程不同，必须显式地终止 Web Worker 使用 `terminate()` 方法。如果不再需要 Web Worker，需要手动管理它们的生命周期以释放资源。

9. **安全限制**：
    - Web Worker 在执行过程中受到严格的同源策略限制，不能访问跨域资源，除非使用适当的 CORS 设置。

这些限制是为了确保 Web Worker 的高效性和安全性，同时避免与主线程的直接交互，从而保持线程之间的隔离。

<details>
<summary>参考答案</summary>

Web Worker 是 HTML5 标准中提供的一项技术，它可以让 JavaScript 脚本在后台线程运行，从而避免阻塞 UI 线程。Web Worker 可以创建一个独立的线程来执行脚本，从而使得主线程可以专注于用户交互和响应。

Web Worker 的主要特点包括：

1. 独立线程：Web Worker 可以在独立的线程中运行 JavaScript 代码，从而避免了在主线程中运行耗时任务的风险。
2. 沙箱环境：Web Worker 运行的 JavaScript 代码在一个受限的沙箱环境中，不能访问与主线程共享的 DOM、全局变量等资源，从而保证了数据安全性和代码稳定性。
3. 事件通信：Web Worker 可以通过事件来与主线程进行通信，从而实现线程间的数据传递和同步操作。

使用 Web Worker 可以改善因大量 JS 计算导致的卡顿问题，增强页面的稳定性和用户体验。

Web Worker 不仅可以在浏览器中运行，还可以在 Node.js 中运行，在实际应用和开发中都有广泛的应用。

</details>

## 115. 说说你对 webpack5 模块联邦的了解？ {#question-e414a927-8d10-41e9-a56d-70493aff652d}

> 难度：2 · 类型：QA

### 题目要点

Webpack 5 的模块联邦（`Module Federation`）是一种新的技术，可以实现多个独立 Webpack 构建之间的共享模块和代码。它通过让每个构建的应用程序能够使用其他应用程序中的模块来提高代码共享和复用的效率。

<details>
<summary>参考答案</summary>

Webpack 5 的模块联邦（`Module Federation`）是一种新的技术，可以实现多个独立 Webpack 构建之间的共享模块和代码。它通过让每个构建的应用程序能够使用其他应用程序中的模块来提高代码共享和复用的效率。

Module Federation 基于 webpack 的远程容器特性。它允许将一个应用程序的某些模块打包为一个独立的、可远程加载的 bundle，并在运行时动态地加载这些模块。这样，在另一个应用程序中就可以通过远程容器加载这些模块，并直接使用它们。这种方式可以避免重复打包和加载相同的模块或库，提高了应用程序的性能和效率。

Module Federation 的主要优势包括：

1. 多个应用程序之间可以共享代码和模块，从而减少重复代码量。
2. 应用程序可以更加灵活地划分为更小的子应用程序，从而降低应用程序的复杂度。
3. 可以避免在应用程序之间传递大量数据，从而提高应用程序的性能和效率。
4. 可以支持应用程序的动态加载和升级，从而实现更好的版本管理和迭代。

总之，Webpack 5 的模块联邦是一项重要的技术创新，可以帮助开发者更好地共享和复用代码、降低应用程序的复杂度，并提高应用程序的性能和效率。

</details>

## 116. Promise 的 finally 怎么实现的？ {#question-7b82de7c-5c47-4e5a-9630-df2721d17edb}

> 难度：3.5 · 类型：QA

### 题目要点

Promise.prototype.finally 方法是 ES2018 引入的一个方法，用于在 Promise 执行结束后无论成功与否都会执行的操作。在实际应用中，finally 方法通常用于释放资源、清理代码或更新 UI 界面等操作。

<details>
<summary>参考答案</summary>

Promise.prototype.finally 方法是 ES2018 引入的一个方法，用于在 Promise 执行结束后无论成功与否都会执行的操作。在实际应用中，finally 方法通常用于释放资源、清理代码或更新 UI 界面等操作。

以下是一个简单的实现方式：

```js
Promise.prototype.finally = function(callback) {
  const P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
}
```

我们定义了一个名为 finally 的函数，它使用了 Promise 原型链的方式实现了 finally 方法。该函数接收一个回调函数作为参数，并返回一个新的 Promise 对象。如果原始 Promise 成功，则会先调用 callback 函数，然后将结果传递给下一个 Promise；如果失败，则会先调用 callback 函数，然后将错误信息抛出。

可以看到，在实现中，我们首先通过 this.constructor 获取当前 Promise 实例的构造函数，然后分别处理 Promise 的 resolved 和 rejected 状态的情况。在 resolved 状态时，我们先调用 callback 函数，然后将结果传递给新创建的 Promise 对象；在 rejected 状态时，我们也是先调用 callback 函数，然后将错误信息抛出。

这样，我们就完成了 Promise.prototype.finally 方法的实现。

</details>

## 117. Promise then 第二个参数和catch的区别是什么？ {#question-8169e336-3daa-4e6c-9f85-13c4a9a31467}

> 难度：2 · 类型：QA

### 题目要点

Promise 的 `then` 方法和 `catch` 方法都是用来处理 Promise 在变为 `rejected` 状态时的错误情况。以下是它们之间的区别和使用方式：

1. **then 方法的第二个参数**：
   - 当 Promise 被拒绝（rejected）时，`then` 方法的第二个参数，即错误处理函数，会被调用。
   - 这个错误处理函数接收一个参数，即 Promise 被拒绝时返回的错误信息。
   - 需要在每次调用 `then` 方法时提供第二个参数，以便处理可能出现的错误。

2. **catch 方法**：
   - `catch` 方法用于捕获 Promise 被拒绝时的错误，与 `then` 方法的第二个参数功能相同。
   - `catch` 方法可以链式调用，不需要在每次调用 `then` 方法时都传递错误处理函数。

<details>
<summary>参考答案</summary>

Promise 的 then 方法和 catch 方法都是用于处理 Promise 的 rejected 状态的情况。它们的区别在于：

1. then 方法的第二个参数

如果 Promise 的状态变为 rejected，then 方法的第二个参数会被调用。该参数是一个函数，可以接收一个参数，即 Promise 返回的错误信息。

例如：

```js
function asyncFunction() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Something went wrong'));
    }, 1000);
  });
}

asyncFunction()
  .then(
    result => console.log(result),
    error => console.error(error)
  );
```

在上述代码中，当 Promise 被 reject 时，then 方法的第二个参数会被调用，并打印出错误信息。

2. catch 方法

catch 方法相当于 then 方法的第二个参数，也是用于处理 Promise 的 rejected 状态的情况。不同之处在于，catch 方法可以链式调用，而不需要在每次调用 then 方法时都传递第二个参数。

例如：

```js
function asyncFunction() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Something went wrong'));
    }, 1000);
  });
}

asyncFunction()
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

在上述代码中，当 Promise 被 reject 时，catch 方法会被调用，并打印出错误信息。

因此，then 方法的第二个参数和 catch 方法都是用于处理 Promise 的 rejected 状态的情况，但前者需要在每次调用 then 方法时都传递第二个参数，而后者则可以链式调用。

</details>

## 118. 下面代码的输出是什么？ {#question-3734a9cd-2ef6-4b29-8eaf-f86ffc5dfdf7}

> 难度：1 · 类型：QA

```js
var name = '123';

var obj = {
 name: '456',
 print: function() {
  function a() {
    console.log(this.name);
  }
  a();
 }
}

obj.print();
```

### 题目要点

在JavaScript中，`this`指向通常是初中级前端面试的常考题目，这类题的变形点很多，但是大家只要抓住最本质的东西，就能轻松拿捏。

只记住一条：**JavaScript中，函数中的`this`指向，只和函数调用时所属的对象有关系。如果函数调用时前面没有任何对象，那么`this`就指向全局的（window或者global）；如果函数调用时前面有对象，比如 obj.foo() ，那么这时候 `this`就指向的是 `obj`这个对象**。当然也有特例，我们可以使用 *箭头函数* 或者 `bind()` ，在函数创建时就显示绑定了 `this`，这种情况就要分析 *函数创建时* 绑定的 `this`是谁了

<details>
<summary>参考答案</summary>

上述代码输出结果为 "123"。解释如下：

1. 在全局作用域中声明了变量 name，值为字符串 "123"。
2. 声明一个对象 obj，包含属性 name 和方法 print，其中 name 属性的值为字符串 "456"，print 方法中定义了函数 a。
3. 当执行 obj.print() 时，会调用 print 方法，并在其中定义了函数 a。
4. 函数 a 中调用 console.log(this.name) 方法。由于此时 this 指向全局对象（即 window 对象），因此执行 this.name 等价于执行 window.name。
5. 根据步骤1，window.name 的值为字符串 "123"，因此最终输出结果为 "123"。

需要注意的是，在JavaScript中，this 的值取决于函数在何处被调用。如果该函数是作为对象的方法进行调用的，则 this 指向该对象；否则，this 指向全局对象。在本例中，虽然函数 a 被定义在 print 方法中，但是它并没有作为 obj 的方法进行调用，因此 this 指向全局对象。

</details>

## 119. 下面代码的输出是什么？ {#question-6ff491bd-f4a7-4172-86f9-8530e89bfbb2}

> 难度：1 · 类型：QA

```js
console.log(typeof typeof typeof null);
console.log(typeof console.log(1));
```

### 题目要点

第一行代码输出结果为 "string"。解释如下：

<details>
<summary>参考答案</summary>

第一行代码输出结果为 "string"。解释如下：

1. typeof null 返回 "object"，因为在JavaScript中，null 被认为是一个空对象引用。
2. typeof "object" 返回 "string"。
3. typeof "string" 返回 "string"。

因此，最终结果为 "string"。

第二行代码先输出 1，然后输出结果为 "undefined"。解释如下：

1. console.log(1) 输出 1。
2. console.log 函数没有返回值，因此返回 undefined。
3. typeof undefined 返回 "undefined"。

因此，最终结果为：

```
string
1
undefined
```

</details>

## 120. 怎么使用 Math.max、Math.min 获取数组中的最值？ {#question-f1502312-3ac7-4089-b306-f64c301b7dd4}

> 难度：1 · 类型：QA

### 题目要点

`Math.min()`和`Math.max()`用法比较类似：

<details>
<summary>参考答案</summary>

`Math.min()`和`Math.max()`用法比较类似：

> console.log(Math.min(1, 5, 2, 7, 3)); // 输出：1

但它们不接受数组作为参数。

如果想使用数组作为参数，有以下两个方法：

* apply

```js
const arr = [1, 5, 2, 7, 3];
console.log(Math.min.apply(null, arr)); // 输出：1
```

* 扩展运算符

```js
const arr = [3, 5, 1, 6, 2, 8];

const maxVal = Math.max(...arr); // 获取数组中的最大值
```

</details>

## 121. 说说下面代码执行后的输出是什么？ {#question-e47771cd-99ca-4650-96ce-66087c1418a4}

> 难度：1 · 类型：QA

```js
var b = 10;
(function b(){
    b = 20;
    console.log(b);
})();
```

### 题目要点

先看浏览器中的执行结果：

<details>
<summary>参考答案</summary>

先看浏览器中的执行结果：

![](https://static.ecool.fun/others/619e2a00-4b97-4c4b-b4be-e8c847cc5dcb.png)

## 解析

* 代码预解析时，会将var b进行变量提升，此时b没有被赋值(b=undefined) (这里有人会说这里明明有个函数表达式呀，为什么没有进入变量提升，因为IIFE自带有词法作用域(我们常理解得作用域))
* 发现没有可以变量提升得时候将b赋值为10，此时会将b 赋值为10(b=10)
* 碰到了立即执行函数，会执行其内边的函数 function b()
* IIFE作用域中定义b = function b(){}
* 碰到了b = 20，会顺着作用域链寻找是否存在b，发现IIFE作用域中存在b，将IIFE作用域中的b赋值为20(b=20)(因为函数表达式特性，标识符无法被修改，所以这里执行失败)
* 执行console.log(b)，此时的b会找IIFE中的作用域看看是否存在b，发现其内边存在，将其返回

</details>

## 122. 怎么实现虚拟列表？ {#question-875d7fc5-bc05-44e7-a017-60849c426ec9}

> 难度：3 · 类型：QA

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

## 123. 如果要设计一个转盘组件，你会考虑哪些方面？有哪些是需要和业务方确认的技术细节？另外，如何从前端的角度进行防刷？ {#question-5a7e6ba9-31c0-45c2-8997-1ce10f2bf330}

> 难度：4 · 类型：QA

### 题目要点

### 设计转盘组件的考虑方面

1. **功能需求**：
   确定抽奖逻辑、转盘样式、动画效果等基本功能。
2. **技术选型**：
    根据需求选择 CSS3 动画、Canvas 绘图或其他技术栈。
3. **数据处理**：
   设计数据流程，处理与后端的数据交互，如抽奖次数、奖品信息等。
4. **用户体验**：
   优化加载速度、响应时间、错误处理和动画流畅度等。
5. **安全性**：
   防范刷奖、重复领奖等作弊行为，确保组件安全。

### 与业务方协调的技术细节

1. **抽奖规则**：
   商定奖品设置、库存、中奖概率、兑换方式等。
2. **后端接口**：
   制定接口规范，包括请求参数、返回格式和安全性。
3. **防刷策略**：
    确定防刷措施，如 IP 限制、验证码和前端加密。
4. **奖品发放**：
   确定奖品发放流程和细节，如邮寄、身份核验等。

### 前端防刷方法

1. **限制抽奖次数**：
    通过记录和限制用户的抽奖次数来防止刷奖。
2. **IP 地址验证**：
    验证 IP 地址，限制单个 IP 的抽奖次数。
3. **验证码验证**：
    引入验证码机制，防止自动化脚本攻击。
4. **前端 JS 加密**：
   对关键信息进行加密处理，提高安全性。
。

<details>
<summary>参考答案</summary>

设计一个转盘组件需要考虑以下几个方面：

1. 功能需求：明确组件的功能需求，例如抽奖逻辑、转盘样式和动画效果等。

2. 技术选型：选择合适的技术实现该组件，例如 CSS3 动画或 Canvas 绘图等。

3. 数据处理：处理与后端交互的数据流程和数据结构，例如抽奖机会计数、奖品种类和数量等。

4. 用户体验：优化用户体验，例如加载速度、响应时间、错误提示和动画效果等。

5. 安全性：确保组件的安全性，例如防止刷奖、重复领奖和作弊等。

需要与业务方协调好的技术细节包括：

1. 抽奖规则：确定抽奖规则和奖品设置，并与业务方协商奖品库存、中奖概率和兑换方式等。

2. 后端接口：制定与后端交互的接口规范，包括请求参数、返回结果和接口安全验证等。

3. 防刷策略：与业务方协商防刷策略，例如限制 IP 访问频率、验证码验证和前端 JS 加密等。

4. 奖品发放：与业务方协商奖品发放方式和时机，例如邮寄地址、核验身份和奖品兑换码等。

对于前端如何防刷，可以考虑以下几种方法：

1. 限制抽奖次数：记录用户的抽奖次数，并且在达到限制条件时禁止继续抽奖。

2. IP 地址验证：通过前端或后端对用户的 IP 地址进行验证，以确保每个 IP 地址只能抽奖一次。

3. 验证码验证：使用验证码来防止机器人或恶意程序的攻击。

4. 前端 JS 加密：使用前端 JS 对关键信息进行加密，防止信息被篡改或伪造。为了增强安全性，也可以使用 HTTPS 协议来保障数据传输的安全性。

需要注意的是，以上方法并不能完全杜绝作弊行为，但可以大大降低作弊的可能性，从而提高组件的可靠性和安全性。

</details>

## 124. async/await、generator、promise 这三者的关联和区别是什么? {#question-f355de02-e03c-4d97-ac11-cd1de62867ab}

> 难度：3 · 类型：QA

### 题目要点

### 异步编程的发展历程

- **回调函数**：最初的异步处理方式，但容易造成回调地狱，代码难以维护。
- **Promise**：ES6 引入，提供了一种链式调用的方式，解决了回调地狱问题。
- **Generator**：ES6 引入，通过 `yield` 可以暂停和继续函数执行，但需要手动控制流程。
- **Async/Await**：ES7 引入，建立在 Promise 和 Generator 之上，提供了更简洁的语法。

### 关联

- **Async/Await**：
  - 基于 Promise 和 Generator。
  - `async` 函数返回一个 Promise 对象。
  - `await` 可以暂停函数执行，直到 Promise 解决。
- **Promise**：
  - 异步编程模型，有三种状态：pending、fulfilled、rejected。
  - 通过 `then()` 和 `catch()` 处理成功和失败的情况。
  - `race()` 和 `all()` 方法用于处理多个 Promise。
- **Generator**：
  - 提供了一种可以暂停和恢复执行的函数。
  - `yield` 用于暂停，`next()` 用于恢复执行。
  - 可与 Promise 结合实现异步流程控制。

### 区别

- **Async/Await**：
  - 语法更接近同步代码，提高了代码的可读性。
  - 只能在 `async` 函数内部使用 `await`。
  - 在某些环境（如高版本 Node.js）中，可以在顶层代码中使用。
- **Promise**：
  - 提供了一种清晰的异步处理流程。
  - 链式调用，但需要使用 `then()` 和 `catch()`。
  - 有方法处理多个异步操作。
- **Generator**：
  - 需要手动控制执行流程，使用 `next()`。
  - 更灵活，但语法和使用上相对复杂。

<details>
<summary>参考答案</summary>

`promise`与`async/await` 函数都是用来解决`JavaScript`中的异步问题，从最开始的回调函数处理异步，到`Promise`处理异步，到`Generator`处理异步，再到`Async/await`处理异步，每一次的技术更新都使得`JavaScript`处理异步的方式更加优雅。

从目前来看，`Async/await`被认为是异步处理的终极解决方案，让JS的异步处理越来越像同步任务。

## 关联

- async/await：是建立在Generator函数的语法糖，可以更方便地实现异步编程。async 函数返回一个 Promise 对象，await 表达式会阻塞代码执行，直到 Promise 对象状态变为 resolved。

- Promise：是一种异步编程模型，可以将回调函数嵌套的代码转换为链式调用。Promise 由 pending、fulfilled 和 rejected 三种状态，分别代表进行中、已完成和已失败。

- Generator：是一种迭代器，可以通过 yield 表达式暂停代码执行，并通过 next() 方法恢复执行。Generator 可以配合 Promise 实现异步流程控制。

## 区别

- async/await：是 ES7 引入的新特性，可以让异步编程看起来像同步编程，更加易读易写。async/await 只能用于函数内部，不能用于顶层代码（例如全局作用域）。（PS：高版本的Node中，可以在顶层使用 await）

- Promise：是 ES6 引入的新特性，使用 then() 方法和 catch() 方法注册回调函数，实现异步编程。Promise 可以使用 race() 方法和 all() 方法处理多个异步操作。

- Generator：是 ES6 引入的新特性，可以通过 yield 表达式暂停和恢复代码执行，实现异步流程控制。Generator 需要手动执行 next() 方法，才能继续执行下一步操作。

</details>

## 125. mouseEnter 和 mouseOver 有什么区别？ {#question-d754a6cd-fffc-496b-92f2-b4a9bedcf15c}

> 难度：1 · 类型：QA

### 题目要点

### 事件冒泡

- **`mouseenter`**：不冒泡，仅在鼠标进入目标元素时触发一次。
- **`mouseover`**：会冒泡，在鼠标进入目标元素或其子元素时都会触发。

### 事件触发范围

- **`mouseenter`**：只在鼠标进入目标元素时触发，不考虑子元素。
- **`mouseover`**：在鼠标进入目标元素或其任何子元素时触发。

### 事件对象的属性

- **`mouseenter`** 和 **`mouseover`**：都包含 `relatedTarget` 属性，指向鼠标移动前的元素。

### 使用场景

- **`mouseenter`**：适合检测鼠标首次进入元素的行为。
- **`mouseover`**：适合检测鼠标在元素及其子元素间移动的行为。

<details>
<summary>参考答案</summary>

`mouseenter` 和 `mouseover` 是两个用于处理鼠标进入元素时的事件，但它们在一些关键点上有所不同：

1. **事件冒泡**：

    - `mouseenter`：这个事件在鼠标指针首次进入特定元素（或其子元素）时触发。当鼠标进入元素时，会触发该元素的 `mouseenter` 事件，但不会在元素的子元素上冒泡。因此，该事件通常用于检测鼠标首次进入元素时的动作。

    - `mouseover`：这个事件在鼠标指针移动到某个元素上时触发，不论它是直接在这个元素上触发还是在其子元素上触发。当鼠标进入一个元素时，它会在该元素上触发 `mouseover` 事件，然后冒泡到父元素。

2. **事件触发范围**：

    - `mouseenter`：当鼠标进入元素自身时触发，只在目标元素上触发，不会因为鼠标移动到其子元素上而再次触发。

    - `mouseover`：不仅在目标元素上触发，也在其子元素上触发。所以，如果鼠标从一个子元素移动到另一个子元素，这些元素的父元素会触发多个 `mouseover` 事件。

3. **事件对象的属性**：

    - `mouseenter`：事件对象通常会有 `relatedTarget` 属性，它指向鼠标移动前的那个元素。如果 `relatedTarget` 指向目标元素或为 `null`，那么事件就不会触发。

    - `mouseover`：事件对象也会有 `relatedTarget` 属性，通常指向从中离开的那个元素。

### 使用场景

- `mouseenter` 更适合用来检测鼠标首次进入某个元素时的行为。
- `mouseover` 更适合用来检测鼠标在元素或其子元素之间移动时的行为，因为它冒泡。

在实际使用时，如果你只想在鼠标首次进入元素时触发某些行为（比如显示一个提示），可以使用 `mouseenter`；如果你希望在鼠标移动到某个元素或其子元素上时都触发某些行为（比如动态改变样式），可以使用 `mouseover`。

</details>

## 126. 写出一个函数trans，将数字转换成汉语的输出，输入为不超过10000亿的数字。 {#question-903ad6ce-2c81-4d82-a356-536e4629cfa3}

> 难度：4 · 类型：QA

```js
trans(123456) —— 十二万三千四百五十六
trans（100010001）—— 一亿零一万零一
```

### 题目要点

23.12.18 更新，有同学投稿提供了自己的答案，更加简洁

<details>
<summary>参考答案</summary>

> 23.12.18 更新，有同学投稿提供了自己的答案，更加简洁

```js
function NumToChina(n) {
  n = n.toString();
  let numbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n === '0') return numbers[0];
  let units = ['', '十', '百', '千'];
  let len = n.length;
  let res = '';
  for (let i = 0; i < len; i++) {
    let num = Number(n[i]);
    if (num != 0) {
      if (n[i - 1] === '0') res = res + numbers[0];
      res = res + numbers[num] + units[len - i - 1];
    }
  }
  if (len == 2 && n[0] == '1') res = res.slice(1);
  return res;
}

function numTo(n) {
  const isLose = n < 0;
  n = Math.abs(n).toString();
  let res = [];
  let len = n.length;
  for (let i = len; i > 0; i -= 4) {
    res.push(NumToChina(n.slice(Math.max(0, i - 4), i)));
  }
  const units = ['', '万', '亿'];
  for (let i = 0; i < res.length; i++) {
    if (res[i] == '') continue;
    res[i] = res[i] + units[i];
  }
  isLose && res.push('负');
  return res.reverse().join('');
}
numTo(12345);
```

---

以下是原答案：

```javascript
/**
 * 阿拉伯数字转中文数字,
 * 如果传入数字时则最多处理到21位，超过21位js会自动将数字表示成科学计数法，导致精度丢失和处理出错
 * 传入数字字符串则没有限制
 * @param {number|string} digit
 */
function toZhDigit(digit) {
  digit = typeof digit === 'number' ? String(digit) : digit;
  const zh = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const unit = ['千', '百', '十', ''];
  const quot = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];

  let breakLen = Math.ceil(digit.length / 4);
  let notBreakSegment = digit.length % 4 || 4;
  let segment;
  let zeroFlag = [], allZeroFlag = [];
  let result = '';

  while (breakLen > 0) {
    if (!result) { // 第一次执行
      segment = digit.slice(0, notBreakSegment);
      let segmentLen = segment.length;
      for (let i = 0; i < segmentLen; i++) {
        if (segment[i] != 0) {
          if (zeroFlag.length > 0) {
            result += '零' + zh[segment[i]] + unit[4 - segmentLen + i];
            // 判断是否需要加上 quot 单位
            if (i === segmentLen - 1 && breakLen > 1) {
              result += quot[breakLen - 2];
            }
            zeroFlag.length = 0;
          } else {
            result += zh[segment[i]] + unit[4 - segmentLen + i];
            if (i === segmentLen - 1 && breakLen > 1) {
              result += quot[breakLen - 2];
            }
          }
        } else {
          // 处理为 0 的情形
          if (segmentLen == 1) {
            result += zh[segment[i]];
            break;
          }
          zeroFlag.push(segment[i]);
          continue;
        }
      }
    } else {
      segment = digit.slice(notBreakSegment, notBreakSegment + 4);
      notBreakSegment += 4;

      for (let j = 0; j < segment.length; j++) {
        if (segment[j] != 0) {
          if (zeroFlag.length > 0) {
            // 第一次执行zeroFlag长度不为0，说明上一个分区最后有0待处理
            if (j === 0) {
              result += quot[breakLen - 1] + zh[segment[j]] + unit[j];
            } else {
              result += '零' + zh[segment[j]] + unit[j];
            }
            zeroFlag.length = 0;
          } else {
            result += zh[segment[j]] + unit[j];
          }
          // 判断是否需要加上 quot 单位
          if (j === segment.length - 1 && breakLen > 1) {
            result += quot[breakLen - 2];
          }
        } else {
          // 第一次执行如果zeroFlag长度不为0, 且上一划分不全为0
          if (j === 0 && zeroFlag.length > 0 && allZeroFlag.length === 0) {
            result += quot[breakLen - 1];
            zeroFlag.length = 0;
            zeroFlag.push(segment[j]);
          } else if (allZeroFlag.length > 0) {
            // 执行到最后
            if (breakLen == 1) {
              result += '';
            } else {
              zeroFlag.length = 0;
            }
          } else {
            zeroFlag.push(segment[j]);
          }

          if (j === segment.length - 1 && zeroFlag.length === 4 && breakLen !== 1) {
            // 如果执行到末尾
            if (breakLen === 1) {
              allZeroFlag.length = 0;
              zeroFlag.length = 0;
              result += quot[breakLen - 1];
            } else {
              allZeroFlag.push(segment[j]);
            }
          }
          continue;
        }
      }

    --breakLen;
  }

  return result;
}

```

从左至右，先把数字按万分位分组，每组加上对应的单位(万，亿, ...)，然后每个分组进行迭代。

breakLen表示能够分成多少个分组，notBreakSegment表示当前已处理过的分组长度。

while循环中有一个if判断，如果不存在result，则说明是第一次处理，那么在处理上是有些不同的。

* 首先，在segment的赋值上，第一次是从0开始，取notBreakSegment的长度，后面每迭代一次notBreakSegment都要在上一个值上加4
* 其次，第一次处理不用判断上一个分组是否全为0的情形，这里zeroFlag表示每一个分组内存在0的个数，allZeroFalg表示当前分组前面出现的全为0的分组的个数。
* 此外，在第一次执行时，还处理了只传入为0的情形。

每次处理segment[i]时，都要先判断当前值是否为0，为0时则直接记录到zeroFlag，然后进入下一次迭代，如果不为0，首先得判断上一个数字是否为0, 然后还得根据上一个0是否位于上一个分组的末位，来添加quot，最后还需要清空标志位。如果当前分组全为0，则标记allZeroFlag，所以在下一个分组处理时，还需要判断上一个分组是否全为0。

</details>

## 127. 以下等式是成立的吗：1_000_000 === 1000000 ？ {#question-ea493a51-70e5-481b-b5ec-2ce6900a7eea}

> 难度：0.5 · 类型：QA

### 题目要点

`1_000_000 === 1000000` 的结果为 true

<details>
<summary>参考答案</summary>

`1_000_000 === 1000000` 的结果为 true

`1_000_000` 中使用了 `_`，这是数字分隔符规范(Numeric Separators)，也就是允许在数字值中使用下划线来提高数值的可读性。

如果我们尝试写十亿这样的值，可以通过用下划线分隔数字来提高可读性。

```js
let a = 1000000000000;
let b = 1_000_000_000_000;
console.log(a===b); // true
```

数字分隔符规范不仅支持整数，还支持各种数字格式：

```js
// Decimal
let dec = 1_000_000.220_720;

// Binary
let bin = 0b1010_0001_1000_0101;

// Octal
let oct = 0o1234_5670;

// Hexadecimal
let hex = 0xA0_B0_C0;

// BigInt
let bint = 9_223_372_036_854_775_807n;
```

</details>

## 128. 说说对 requestIdleCallback 的理解 {#question-fe737e1d-6ee1-4344-9ab7-7d3dafb749f6}

> 难度：1 · 类型：QA

### 题目要点

`requestIdleCallback` 是一个浏览器API，旨在优化网页性能和响应速度。

- **目的**：`requestIdleCallback` 允许开发者在浏览器空闲时执行任务，从而不会阻塞主线程，改善用户体验。
- **主线程问题**：JavaScript 代码运行在主线程上，执行复杂计算或大量DOM操作时，可能会导致页面响应缓慢或卡顿。
- **功能**：该API将非关键任务推迟到浏览器空闲时段执行，避免占用主线程资源。
- **使用方法**：调用时需传入一个回调函数，该函数将在浏览器空闲时执行。回调函数接收一个 `IdleDeadline` 对象作为参数，该对象提供剩余时间信息。
- **决策依据**：开发者可以根据 `IdleDeadline` 对象提供的时间信息来决定是否继续执行任务或推迟。
- **性能优化**：`requestIdleCallback` 有助于优化Web应用程序的性能，减少资源浪费，提升页面的流畅度。

<details>
<summary>参考答案</summary>

`requestIdleCallback` 是一个浏览器 API，它允许我们在浏览器空闲时执行一些任务，以提高网页的性能和响应速度。

通常情况下，JavaScript 代码会占用主线程，从而阻塞了其他的任务。当页面需要进行一些复杂计算、渲染大量的DOM元素等操作时，就会导致用户的交互体验变得缓慢和卡顿。

`requestIdleCallback` 的作用就是将一些非关键性的任务从主线程中分离出来，等到浏览器闲置时再执行。这样就可以避免占用主线程，提高页面的响应速度和流畅度。

使用 `requestIdleCallback` 需要传入一个回调函数，该函数会在浏览器空闲时被调用。回调函数的参数是一个 IdleDeadline 对象，它包含有关浏览器还剩余多少时间可供执行任务的信息。根据该对象的时间戳信息，开发人员可以自行决定是否继续执行任务或推迟执行。

`requestIdleCallback` 可以帮助我们优化 Web 应用程序的性能和响应速度，减少资源的浪费。

</details>

## 129. 说说你对 ToPrimitive 的理解 {#question-0e76f42e-3479-4aea-b00b-2388fd5ed8de}

> 难度：1 · 类型：QA

### 题目要点

`ToPrimitive` 是一个在 JavaScript 中用于将非原始值转换为原始值的内部操作。这个操作通常在以下情况下被隐式调用：

- 当一个对象需要被用作原始值时，比如在执行数学运算或字符串拼接时。
`ToPrimitive` 的转换过程如下：

1. **检查类型**：如果值已经是原始类型（字符串、数字或布尔值），则直接返回该值。
2. **对象转换**：
   - **valueOf() 方法**：首先尝试调用对象的 `valueOf()` 方法。如果 `valueOf()` 返回一个原始值，则直接使用这个值。
   - **toString() 方法**：如果 `valueOf()` 方法没有返回一个原始值，或者 `valueOf()` 方法不存在，那么接下来尝试调用 `toString()` 方法。如果 `toString()` 返回一个原始值，则使用这个值。
3. **异常抛出**：如果上述两个方法都没有返回一个原始值，则抛出 `TypeError` 异常。
此外，对象还可以定义一个特殊的 `Symbol.toPrimitive` 方法来自定义 `ToPrimitive` 转换的行为。这个方法接受一个字符串参数 `hint`，表示转换的期望类型，它可以是 `'number'`、`'string'` 或 `'default'`。

<details>
<summary>参考答案</summary>

ToPrimitive 是一个抽象操作，用于将一个值转换为原始值（primitive value），即字符串、数字或布尔值。

在 JavaScript 中，当需要将一个非原始值用作原始值时，会自动调用 `ToPrimitive` 操作。例如，在使用加法运算符时，如果其中一个操作数不是原始值，则会将其转换为原始值，这就是通过调用 `ToPrimitive` 来实现的。

ToPrimitive 操作的实现方式如下：

* 如果该值已经是原始类型，则直接返回该值。
* 如果该值是对象，则按照以下步骤进行转换：
    * 调用 valueOf() 方法并返回结果，如果结果是原始类型则直接返回该结果。
    * 调用 toString() 方法并返回结果，如果结果是原始类型则直接返回该结果。
* 如果都不是原始类型，则抛出 TypeError 异常。

示例：

```js
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return 123;
      case 'string':
        return 'str';
      case 'default':
        return 'default';
      default:
        throw new Error();
     }
   }
};

2 * obj // 246
3 + obj // '3default'
obj == 'default' // true
String(obj) // 'str'
```

</details>

## 130. 页面加载的过程中，JS 文件是不是一定会阻塞 DOM 和 CSSOM 的构建？ {#question-212703a8-43a2-426e-b9c4-b51053436d23}

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

## 131. 说说你对轮询的理解 {#question-e0f87b60-68d6-4ac6-9db9-eb35a0a6bc62}

> 难度：1 · 类型：QA

### 题目要点

**轮询（Polling）**：

- **定义**：轮询是指客户端按固定时间间隔向服务器发送请求，以获取最新数据的过程，常用于实现实时数据更新。
- **与长轮询的区别**：普通轮询无论服务器是否有数据更新都定时发送请求；而长轮询在服务器无数据更新时挂起请求，直到有更新才返回响应。

**前端轮询实现方式**：

- **基于定时器**：使用 `setInterval()` 方法按固定时间间隔发送请求。
- **基于递归**：使用 `setTimeout()` 方法在每次请求后设置下一次请求的时间，更加灵活。

**轮询的缺点**：

- 产生大量无效请求，浪费带宽和服务器资源。
- 对服务器压力大，频繁请求可能被视为恶意行为，导致 IP 被封禁。

**避免轮询缺点的方案**：

- **WebSocket**：双向通信协议，实现服务器与客户端间的实时通信，减少无效请求，提高传输效率。
- **SSE（Server-Sent Events）**：基于HTTP的单向通信协议，允许服务器主动向客户端推送实时数据，同样能减少无效请求，减轻服务器压力。

<details>
<summary>参考答案</summary>

## 什么是轮询？

轮询是指在一定的时间间隔内，定时向服务器发送请求，获取最新数据的过程。轮询通常用于从服务器获取实时更新的数据。

## 轮询和长轮询有什么区别？

轮询是在固定的时间间隔内向服务器发送请求，即使服务器没有数据更新也会继续发送请求。而长轮询是先发送一个请求，服务器如果没有数据更新，则不会立即返回，而是将请求挂起，直到有数据更新时再返回结果。

## 前端轮询的实现方式有哪些？

前端轮询的实现方式有两种：基于定时器的轮询和基于递归的轮询。基于定时器的轮询使用 setInterval() 方法来定时发送请求，而基于递归的轮询则使用 setTimeout() 方法来控制下一次请求的时间。

## 轮询有什么缺点？

轮询会产生大量的无效请求，浪费带宽和服务器资源，并且对服务器的压力比较大。同时，在短时间内频繁地发送请求可能会被服务器视为恶意行为，导致 IP 被封禁等问题。

## 如何避免轮询的缺点？

为了避免轮询的缺点，可以使用 WebSocket、SSE（Server-Sent Events）等技术来实现实时数据更新。

WebSocket 是一种双向通信协议，能够实现服务器与客户端之间的实时通信；而 SSE 则是一种基于 HTTP 的单向通信协议，可以实现服务器向客户端推送实时数据。

这些技术都能够减少无效请求，提高数据传输效率，并且对服务器资源的消耗也比较小。

</details>

## 132. js函数有哪几种声明方式？有什么区别？ {#question-86c1abd9-9552-42ab-93d5-16076a877db0}

> 难度：1 · 类型：QA

### 题目要点

#### 函数声明式写法

- 使用 `function` 关键字声明函数，例如 `function test(){}`
- 特点：
  - **函数提升**：函数声明会被提升到作用域顶部，可以在声明之前调用。
  - 必须有函数名。

#### 函数表达式写法

- 将一个匿名函数赋值给变量，例如 `var test = function(){}`
- 特点：
  - **不会提升**：必须先声明后调用，否则会报错。
  - 函数名是可选的，通常用于匿名函数。

#### 二者的区别

1. **声明提升**：函数声明会被提升，而函数表达式不会。
2. **函数名**：函数声明需要函数名，而函数表达式中的函数名是可选的。
3. **立即执行**：函数表达式可以在定义时直接后面加 `()` 立即执行，而函数声明不可以。
4. **自执行函数**：即使是带有函数名的自执行函数，它内部的函数仍然属于函数表达式。

<details>
<summary>参考答案</summary>

有 `表达式` 和 `声明式` 两种函数声明方式

* 函数的声明式写法为：`function test(){}`，这种写法会导致函数提升，所有通过`function`关键字声明的变量都会被解释器优先编译，不管声明在什么位置都可以调用它，但是它本身并不会被执行。

```js
test(); // 测试
function test() {
  console.log("测试");
}
test(); // 测试
```

* 函数的表达式写法为：`var test = function(){}`，这种写法不会导致函数提升，必须先声明后调用，不然就会报错。

```js
test(); // 报错：TypeError: test is not a function
var test = function() {
  console.log("测试");
};
```

## 二者的区别

```javascript
//函数声明式
function greeting(){
      console.log("hello world");
}
//函数表达式
var greeting = function(){
    console.log("hello world");
}
```

1. 函数声明式变量会声明提前 函数表达式变量不会声明提前
2. **函数声明**中的`函数名`是必需的，而**函数表达式**中的`函数名则是可选的`。
3. 函数表达式可以在定义的时候直接在表达式后面加()执行，而函数声明则不可以。<br>

```javascript
function fun(){
   console.log('我是一个函数声明式')
}();   //unexpected token

var foo = function (){
    console.log('我是一个函数表达式')
}();   //我是一个函数表达式

```

4. 自执行函数即使带有函数名，它里面的函数还是属于函数表达式。<br>

```javascript
(function fun(){
    console.log('我是一个函数表达式')
})()  //我是一个函数表达式
```

因为函数只是整个自执行函数的一部分。

</details>

## 133. 说说你对“立即执行函数”的理解 {#question-d66f9477-309f-4af7-b667-d39ad3525a5b}

> 难度：1 · 类型：QA

### 题目要点

立即执行函数（Immediately Invoked Function Expression，简称 IIFE）是一种在 JavaScript 中常见的模式，用于创建一个匿名函数，并在定义后立即执行它。

立即执行函数有两种常见的写法：

1. **匿名函数后跟小括号**，整个包裹在一个括号运算符中：

   ```js
   (function(){
       //...
   }())
   ```

2. **匿名函数包裹在一个括号运算符中**，后面跟一个小括号：

   ```js
   (function(){
       //...
   })()
   ```

#### 好处

- **避免全局污染**：不必为函数命名，因此不会污染全局命名空间。
- **私有作用域**：立即执行函数内部形成了一个单独的作用域，可以封装私有变量。
- **封装变量**：可以封装一些临时变量或局部变量，这些变量在外部无法访问。

<details>
<summary>参考答案</summary>

什么是立即执行函数？

JS立即执行函数模式是一种语法，可以让你的函数在定义后立即被执行，这种模式本质上就是函数表达式（命名的或者匿名的），在创建后立即执行。

**立即执行函数的两种常见写法**：

* 匿名函数包裹在一个括号运算符中，后面跟一个小括号

```js
(function(){
    //...
})()
```

* 匿名函数后面跟一个小括号，整个包裹在一个括号运算符中

```js
(function(){
    //...
}())
```

()，！，+，-，=等运算符都能起到立即执行的作用，这些运算符的作用就是将匿名函数或函数声明转换为函数表达式。

注意：

* 函数体后面要有小括号()
* 函数体必须是函数表达式而不能是函数声明

例：

```js
(function (test) {    //使用()运算符,输出123
    console.log(test);
})(123);

(function (test) {    //使用()运算符,输出123
    console.log(test);
}(123));

!function (test) {    //使用!运算符,输出123
    console.log(test);
}(123);
var fn = function (test) {  //使用=运算符,输出123
    console.log(test);
}(123);
```

**好处**：

* 不必为函数命名，避免了污染全局变量
* 立即执行函数内部形成了一个单独的作用域，可以封装一些外部无法读取的私有变量
* 封装变量

总之：立即执行函数会形成一个单独的作用域，可以封装一些临时变量或者局部变量，避免污染全局变量。

</details>

## 134. 如何把一个对象变成可迭代对象？ {#question-eda0c7a2-e591-4eeb-8bf0-69f8162c8db1}

> 难度：3 · 类型：QA

### 题目要点

在JavaScript中，一个普通的对象默认不是可迭代对象，因为它没有实现迭代器协议（即没有`Symbol.iterator`方法）。要使对象变得可迭代，你需要手动给该对象添加一个`Symbol.iterator`方法。

`Symbol.iterator`方法应该返回一个迭代器对象，该对象有一个`next()`方法，该方法返回一个对象，该对象包含`value`和`done`两个属性。`value`属性是当前迭代的值，`done`属性是一个布尔值，表示迭代是否完成。

可以通过几种方式来实现`Symbol.iterator`方法：

1. **直接编写迭代器逻辑**：在`Symbol.iterator`方法中编写逻辑来逐个返回对象的属性或值。这通常涉及到维护一个内部状态（如索引或迭代器位置）来跟踪当前迭代的位置。

2. **使用生成器函数**：生成器函数提供了一种更简洁的方式来编写迭代器。你可以使用`function*`语法定义一个生成器函数，并在其中使用`yield`语句来逐个返回值。如果你想要迭代对象的属性或值，你可以结合使用`Object.keys()`, `Object.values()`, 或 `Object.entries()`等方法来简化逻辑。

3. **委托迭代**：如果你的对象包含另一个可迭代对象（如数组或另一个实现了`Symbol.iterator`方法的对象），你可以在你的`Symbol.iterator`方法中简单地返回那个内部对象的迭代器。这可以通过使用`yield*`语句（在生成器函数中）来实现，它会委托迭代给另一个迭代器。

<details>
<summary>参考答案</summary>

可迭代对象（Iterable object）是数组的泛化，这个概念是在说任何对象都可以被定制为可在 `for..of` 循环中使用的对象。

也就是说，可以应用 `for..of` 的对象被称为 `可迭代对象`。

## 迭代器

在 JavaScript 中，**迭代器**是一个对象，它定义一个序列，并在终止时可能返回一个返回值。

更具体地说，迭代器是通过使用 `next()` 方法实现 `Iterator protocol` 的任何一个对象，该方法返回具有两个属性的对象：

* `value`，这是序列中的 `next` 值
* `done`，如果已经迭代到序列中的最后一个值，则它为 `true`

如果 `value` 和 `done` 一起存在，则它是迭代器的返回值。

一旦创建，迭代器对象可以通过重复调用 `next() `显式地迭代。

迭代一个迭代器被称为消耗了这个迭代器，因为它通常只能执行一次。

在产生终止值之后，对 `next()` 的额外调用应该继续返回 `{done: true}`。

Javascript 中最常见的迭代器是 Array 迭代器，它只是按顺序返回关联数组中的每个值。

虽然很容易想象所有迭代器都可以表示为数组，但事实并非如此。数组必须完整分配，但迭代器仅在必要时使用，因此可以表示无限大小的序列，例如 0 和无穷大之间的整数范围。

这是一个可以做到这一点的例子。它允许创建一个简单的范围迭代器，它定义了从开始（包括）到结束（独占）间隔步长的整数序列。它的最终返回值是它创建的序列的大小，由变量 iterationCount 跟踪。

```js
let index = 0
const bears = ['ice', 'panda', 'grizzly']

let iterator = {
  next() {
    if (index < bears.length) {
      return { done: false, value: bears[index++] }
    }

    return { done: true, value: undefined }
  }
}

console.log(iterator.next()) //{ done: false, value: 'ice' }
console.log(iterator.next()) //{ done: false, value: 'panda' }
console.log(iterator.next()) //{ done: false, value: 'grizzly' }
console.log(iterator.next()) //{ done: true, value: undefined }
```

## 实现可迭代对象

如果一个对象拥有 `[Symbol.iterator]` 方法，并且该方法返回一个迭代器对象，这样的对象即可称为`可迭代对象`。

```js
let info = {
  bears: ['ice', 'panda', 'grizzly'],
  [Symbol.iterator]: function() {
    let index = 0
    let _iterator = {
       //这里一定要箭头函数，或者手动保存上层作用域的this
       next: () => {
        if (index < this.bears.length) {
          return { done: false, value: this.bears[index++] }
        }

        return { done: true, value: undefined }
      }
    }

    return _iterator
  }
}

let iter = info[Symbol.iterator]()
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())
console.log(iter.next())

//符合可迭代对象协议 就可以利用 for of 遍历
for (let bear of info) {
  console.log(bear)
}
//ice panda grizzly
```

</details>

## 135. 编程实现温度转换，已知温度转换的关系式是：华氏度＝32＋摄氏度×1.8，现在要求输入摄氏度，输出对应的华氏度，小数保留两位 {#question-481c1ab4-ec43-4c80-9d04-e48930d67105}

> 难度：0.5 · 类型：QA

### 题目要点

核心考查：编程实现温度转换，已知温度转换的关系式是：华氏度＝32＋摄氏度×1.8，现在要求输入摄氏度，输出对应的华氏度，小数保留两位的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```js
function convertTemperature(centigrade){
    if(typeof centigrade !== 'number'){
        throw new Error('Wrong parameter type!')
    }

    return (32 + centigrade * 1.8).toFixed(2)
}
```

</details>

## 136. 版本号排序 {#question-dd99ac0b-0442-4b0e-aead-fe50315218f7}

> 难度：3.5 · 类型：QA

有一组版本号如下`['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5']`。

现在需要对其进行排序，排序的结果为 `['4.3.5','4.3.4.5','2.3.3','0.302.1','0.1.1']`

### 题目要点

```javascript
const versions = ['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5'];

versions.sort((a, b) => {
    // 将版本号拆分为数组
    const arrA = a.split('.').map(Number);
    const arrB = b.split('.').map(Number);

    // 找出需要比较的最长长度
    const maxLength = Math.max(arrA.length, arrB.length);

    // 逐位比较
    for (let i = 0; i < maxLength; i++) {
        // 如果某一方的版本号已经用完，则默认其后面的位都是0
        const numA = i < arrA.length ? arrA[i] : 0;
        const numB = i < arrB.length ? arrB[i] : 0;

        if (numA !== numB) {
            return numA - numB;
        }
    }

    // 如果所有位都相同，则视为相等
    return 0;
});

console.log(versions);
// 预期输出: ['0.1.1', '0.302.1', '2.3.3', '4.2', '4.3.5', '4.3.4.5']

<details>
<summary>参考答案</summary>

本题目的实现有很多不同的思路，在这里先给大家介绍一种非常简洁，也非常有意思的实现方案：

```js
const arr=['0.1.1', '2.3.3', '0.302.1', '4.2', '4.3.5', '4.3.4.5'];
arr.sort((a,b)=>a>b?-1:1);
console.log(arr); // ['4.3.5','4.3.4.5','2.3.3','0.302.1','0.1.1']
```

## 为什么字符串比较能够轻松的实现排序？

在JavaScript中，字符串之间无疑也是可以比较的。猜猜看下面这段代码输出的结果是什么？

```js
console.log('5'>'1')
console.log('5'>'10')
```

答案是`true`、`true`。

### 比较字符串是比较它们的 Unicode 值

这是因为在两个字符串进行比较时，是使用基于标准字典的 Unicode 值来进行比较的。通过`String.prototype.codePointAt()`方法我们能拿到字符串的 Unicode 值。所以`'5'>'1'`的结果是`true`;

而当字符串长度大于1的时候比较则是逐位进行，因此`'5'>'10'`进行比较时，首先比较第一位也就是`'5'>'1'`，如果有结果则返回，没有结果则继续比较第二位。所以`'5'>'10'`的结果与`'5'>'1'`相同，也是`true`。

回过头来看问题，就不难理解了：`.`的 Unicode 值为 46，`0`的 Unicode 值为 48，其它数字在此基础上递增。所以在比较的时候`10.1`是要大于`1.1`的。

### 字符串比较法适用范围很小

上文解释了为什么题目中的 case 能够通过字符串比较来实现。但是机智如你一定会发现，这种比较是存在问题的：如果修改题目中的arr如下:

```js
const arr=[
    '0.5.1',
    '0.1.1',
    '2.3.3',
    '0.302.1',
    '4.2',
    '4.3.5',
    '4.3.4.5'
];
```

那字符串比较法会出错：期望中版本号`'0.302.1'`应该大于`'0.5.1'`，但实际比较的结果则是相反的，原因就在于**逐位比较**。

所以字符串比较这个技巧需要限定条件为各个版本号均为1位数字，它得出的结果才是准备的，而常见的版本号并不符合这个条件。那么有没有适用性更强又简洁的比较方式呢？

## “大数”加权法

### 比较npm规则版本号

假设版本号遵循 npm 语义化规则，即版本号由`MAJOR.MINOR.PATCH`几个部分组成：：

```js
const arr=['2.3.3', '4.3.4', '0.3.1'];
```

通过如下公式得出待比较的目标版本号：

> MAJOR\*p2 \+ MINOR\*p + PATCH

代码如下：

```js
const p = 1000;
const gen = (arr) =>
    arr.split('.').reduce(reducer,0);

const reducer = (acc,value,index) =>
    acc+(+value)*Math.pow(p,arr.length-index-1);

arr.sort((a,b)=> gen(a)>gen(b)?-1:1);

console.log(arr)
```

其中`p`为常量，它的取值要大于`MAJOR/MINOR/PATCH`三者中最大值至少一个量级。譬如待比较的版本号为`1.0.1`、`'0.302.1'`，此时如果`p`取值为 10 那么计算出来的结果显然会不符合预期。而`p`取`1000`就能够避免各个子版本加权之后产生污染。

同理，有类似规则的版本号（如`'1.0.1.12'`）都可以通过上述方法进行排序。

### 更多的版本号

如果版本号数组如下:

```js
const arr=[
    '1.1',
    '2.3.3',
    '4.3.5',
    '0.3.1',
    '0.302.1',
    '4.20.0',
    '4.3.5.1',
    '1.2.3.4.5'
];
```

上述数组不但不遵循`MAJOR.MINOR.PATCH规`则，其长度也没有明显的规则，这时该如何比较呢？

可以在固定规则比较的方法基础上进行扩展，首先需要获取到版本号数组中子版本号最多有几位`maxLen`。这里我们通过`Math.max()`获取：

```js
const maxLen = Math.max(
    ...arr.map((item)=>item.split('.').length)
);
```

拿到`maxLen`之后即可改写 reducer 方法:

```js
const reducer = (acc,value,index) =>
    acc+(+value)*Math.pow(p,maxLen-index-1);

const gen = (arr) =>
    arr.split('.').reduce(reducer,0);

arr.sort((a,b)=> gen(a)>gen(b)?-1:1);

console.log(arr)
```

上述方法足够用于常规版本号的比较了。但是我们知道，JavaScript 的 number 类型为双精度64位浮点类型，如果`maxLen`特别大、每一位的值又很大（比如某个子版本号用时间戳来标记），那么上述方法则存在溢出而导致比较结果不准确的问题。

不过`BigInt`提案已经进入stage3规范，它能够表示任意大的整数。可以预见的是，在不久的将来我们无需考虑版本号取值范围带来的影响。

## 循环比较法

相对字符串比较法和大数加权法，循环比较法的适用性更强。思路仍然是逐位比较子版本号：如果当前版本号相同则比较下一位；如果版本号位数不相等而前几位值一致则认为位数多的版本号大。

代码如下：

```js
arr.sort((a, b) => {
    let i = 0;
    const arr1 = a.split('.');
    const arr2 = b.split('.');

    while (true) {
        const s1 = arr1[i];
        const s2 = arr2[i++];

        if (s1 === undefined || s2 === undefined) {
            return arr2.length - arr1.length;
        }

        if (s1 === s2) continue;

        return s2 - s1;
    }
});

console.log(arr)
```

## 思考

我们总结并且对比了几种用来比较版本号的方法，在不同的场景可以选择合适的方式：

* 字符串比较法
* 大数加权法
* 循环比较法

> 以上答案由 “前端面试题宝典” （官网地址：[https://fe.ecool.fun/](https://fe.ecool.fun/) ）整理收集

</details>

## 137. 给某个资源的链接，如 https://www.baidu.com/index.html ，请实现一个方法，获取该资源的后缀，如 html {#question-478e5483-7797-4844-be41-c7b96a383c00}

> 难度：1 · 类型：QA

### 题目要点

本题主要考察字符串相关的方法，实现比较简单，下面列举两个实现方法。

<details>
<summary>参考答案</summary>

本题主要考察字符串相关的方法，实现比较简单，下面列举两个实现方法。

```js
var fileName = "https://www.baidu.com/index.html";

function getFileExtension(url){
    if(typeof url !== 'string'){
        return ''
    }

    // 方法一
    return url.substring(url.lastIndexOf('.') + 1);

    // 方法二
    //return url.split('.').pop().toLowerCase();
}
```

</details>

## 138. 说说你对 Iterator, Generator 和 Async/Await 的理解 {#question-82b536ee-2a79-4e64-b238-061656ca8ca9}

> 难度：4 · 类型：QA

### 题目要点

#### Iterator

- **定义**：Iterator 是一个简单的循环接口，用于支持 `for...of` 循环遍历数据。
- **特点**：任何实现了 Iterator 接口的数据都可以被 `for...of` 循环遍历。
- **适用场景**：适用于任何需要循环遍历数据的情况。

#### Generator

- **定义**：Generator 是一种特殊的函数，可以暂停和继续执行，类似于状态机。
- **特点**：可以实现 Iterator 的功能，并且由于可以保存上下文，适合实现简单的状态机。
- **适用场景**：适合需要流程控制和状态管理的情况，尤其是需要进行异步操作时。

#### Async/Await

- **定义**：Async/Await 是 Generator 进行异步操作的语法糖。
- **特点**：通过 `async` 关键字和 `await` 关键字，使得异步代码的编写更加直观和易于理解。
- **适用场景**：适用于任何需要异步操作的情况，是目前最广泛使用的异步编程方式。

<details>
<summary>参考答案</summary>

这里重点理解他们三者分别是什么，有什么区别，以及分别适用什么场景

# Iterator

Iterator是最简单最好理解的。

简单的说，我们常用的 `for of` 循环，都是通过调用被循环对象的一个特殊函数 `Iterator` 来实现的，但是以前这个函数是隐藏的我们无法访问， 从 `Symbol` 引入之后，我们就可以通过 `Symbol.iterator` 来直接读写这个特殊函数。

对于循环语句来说，他并不关心被循环的对象到底是什么，他只负责调用 `data[Symbol.iterator]` 函数，然后根据返回值来进行循环。所以任何对象只要提供了标准的 Iterator 接口即可被循环，比如我们现在来创造一个自定义的数据：

```
var students = {}
students[Symbol.iterator] = function() {
  let index = 1;
  return { next() {
    return {done: index>100, value: index++} }
  }
}

for(var i of students) { console.log(i); }
```

除了这种方式外，我们也可以通过 `Generator` 来实现一个 `Iterator` 接口。

# Generator 基本语法

Generator 是ES6引入的新语法，Generator是一个可以暂停和继续执行的函数。简单的用法，可以当做一个Iterator来用，进行一些遍历操作。复杂一些的用法，他可以在内部保存一些状态，成为一个状态机。

Generator 基本语法包含两部分：
* 函数名前要加一个星号
* 函数内部用 `yield` 关键字返回值

下面是一个简单的示例：

```js
function * count() {
  yield 1
  yield 2
  return 3
}
var c = count()
console.log(c.next()) // { value: 1, done: false }
console.log(c.next()) // { value: 2, done: false }
console.log(c.next()) // { value: 3, done: true }
console.log(c.next()) // { value: undefined, done: true }
```

由于Generator也存在 `Symbol.iterator` 接口，所以他也可以被 `for` 循环调用：

```js
function * count() {
  yield 1
  yield 2
  return 3
}
var c = count()
for (i of c) console.log(i) // 1, 2
```
不过这里要注意一个不同点，调用 `next` 的时候能得到 `3` ，但是用 `for` 则会忽略最后的 `return` 语句。 也就是 `for` 循环会忽略 `generator` 中的 `return` 语句.

另外 `yeild*` 语法可以用来在 `Generator` 中调用另一个 `Generator`，参见 [yield* MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A)

# Generator VS Iterator

Generator 可以看做是一个更加灵活的 `Iterator` ，他们之间是可以互相替代的，但是， `Generator` 由于可以通过 `yield` 随时暂停，因此可以很方便进行流程控制和状态管理，而 `Iterator` 就可能需要你写更多的代码进行相同的操作：

比如 Stack Overflow 上的这个中序遍历代码：

```js
function* traverseTree(node) {
    if (node == null) return;
    yield* traverseTree(node.left);
    yield node.value;
    yield* traverseTree(node.right);
}
```
同样的功能用 `iterator` 实现就会变得麻烦很多。

Generator 也是实现简单的状态机的最佳选择，因为他是在函数内部进行 `yield` 操作，因此不会丢失当前状态：

```js
function * clock () {
  yield 'tick'
  yield 'tock'
}
```

同样的功能如果普通的函数，因为每次都是调用这个函数，所以函数内部并不能保存状态，因此就需要在函数外面用一个变量来保存当前状态：

```js
let tick = false
function clock() {
  tick = !tick
  return tick ? 'tick' : 'tock'
}
```

其实Babel编译 `Generator` 的时候，也是用了一个 `Context` 来保存当前状态的，可以看看Babel编译后的代码，其中的 `_context` 就是当前状态，这里通过 `_context.next` 的值来控制调用 `next` 的时候应该进入到哪一个流程：

```js

var _marked = /*#__PURE__*/regeneratorRuntime.mark(clock);

function clock() {
  return regeneratorRuntime.wrap(function clock$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'tick';

        case 2:
          _context.next = 4;
          return 'tock';

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked, this);
}
```

当然，如果是很复杂的，非线性状态变化的状态机，我还是会倾向于用一个类来实现。

# Generator 异步操作

Generator 的设计，可以很方便执行异步操作，现在我们需要写一个小函数，可以取到用户信息然后打印出来，我们用generator来写就是这样的：

```js
function * fetchUser () {
  const user = yield ajax()
  console.log(user)
}
```
但是，generator本身并不会自动进行 `next` 操作，也就是，我们如果此时这样调用并不能打印出用户信息:

```js
const f = fetchUser()
```
因为`Generator` 本身只是一个状态机，他需要由调用者来改变他的状态，所以我们需要额外加一段控制代码来控制 `fetchUser` 进行状态转换:

```js

function * fetchUser () {
  const user = yield ajax()
  console.log(user)
}

const f = fetchUser()

// 加入的控制代码
const result = f.next()
result.value.then((d) => {
  f.next(d)
})
```

但是写了这些代码之后， `Generator` 的实现就变得非常不优雅了，如果我们内部有多个异步操作，控制代码就会变得很长。我们可以选择 co 库来帮我们做这个操作。

# Async/Await

我最开始接触到 Async/Await 的时候把它当成了一个 `promise` 的语法糖，但是经过我们对 `Generator` 的理解后，明白了其实他就是 `Generator` 的一个语法糖：

* `async` 对应的是 `*`
* `await` 对应的是 `yield`

他只是自动帮我们进行了 `Generator` 的流程控制而已。

和上面的获取用户信息实现一样的功能的话，基本语法如下：

```js
async function fetchUser() {
  const user = await ajax()
  console.log(user)
}
```

因为有自动的流程控制，所以我们不用手动在ajax成功的时候手动调用 `next`。相比于 `Promise` 或者 `Generator` 的实现，代码要明显更加优雅。

如果有兴趣的话，可以参考一下 `Babel` 是如何编译 `Async/Await` 的，简单的说，代码分成了两部分，一部分是编译了一个 `Generator`，另一部分是通过 promise 实现了generator的流程控制。

对于如下代码：

```js
async function count () {
  let a = await 1;
  let b = await 2;
  return a+b
}
```

编译后的代码：

```js
var count = function () {
  // 下面这部分是 generator 的一个实现
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var a, b;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return 1;

            // 省略...
        }
      }
    }, _callee, this);
  }));

  return function count() {
    return _ref.apply(this, arguments);
  };
}();

// 下面这部分是用 promise 实现了流程控制。
function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
```

所以我们可以大约这么认为： **async/await == generator + promise**

# async/await 并发

我们的代码在执行到await的时候会等待结果返回才执行下一行，这样如果我们有很多需要异步执行的操作就会变成一个串行的流程，可能会导致非常慢。

比如如下代码，我们需要遍历获取redis中存储的100个用户的信息：

```js
const users=[]
for (var i=0;i<ids.length;i++) {
  users.push(await db.get(ids))
}
```
由于每次数据库读取操作都要消耗时间，这个接口将会变得非常慢。如果我们把它变成一个并行的操作，将会极大提升效率：

```js
const users = await Promise.all(ids.map(async (id) => await db.get(id)))
```

# 总结

* `Iterator` 是一个循环接口，任何实现了此接口的数据都可以被 `for of` 循环遍历
* `Generator` 是一个可以暂停和继续执行的函数，他可以完全实现 `Iterator` 的功能，并且由于可以保存上下文，他非常适合实现简单的状态机。另外通过一些流程控制代码的配合，可以比较容易进行异步操作。
* `Async/Await` 就是generator进行异步操作的语法糖。而这个语法糖反而是被使用最广泛的，比如著名的 `Koa`

</details>

## 139. Map 和 WeakMap 有什么区别？ {#question-b837af11-c26f-41d2-b2fc-3610a1575ec2}

> 难度：2.5 · 类型：QA

### 题目要点

#### Map

1. **键值对集合**：Map 是一个键值对的集合，不同于传统对象，其键可以不是字符串，可以是任何类型的值。
2. **优势**：
   - 键类型灵活：可以是非字符串类型。
   - 键值对个数可轻松获取：通过 `size` 属性。
   - 性能优势：在频繁增删键值对的场景下，性能优于传统对象。
3. **适用场景**：
   - 键名和对象默认键名冲突。
   - 需要使用非字符串类型作为键。
   - 需要计算键值对数量。
   - 频繁增删键值对。

#### WeakMap

1. **弱引用键**：WeakMap 的键是弱引用，意味着如果一个对象没有其他引用，那么这个键值对会自动从 WeakMap 中移除。
2. **特性**：
   - 只接受对象作为键：不能使用其他类型的值作为键。
   - 不可遍历：因为键值对的个数可能随垃圾回收机制的变化而变化。
3. **适用场景**：
   - 当某个对象的引用需要在其他地方被释放时，使用 WeakMap 可以避免内存泄漏。
   - 存储DOM节点时，使用 WeakMap 可以让这些节点在不再需要时被自动回收。

#### Map 和 WeakMap 区别

- **键的类型**：Map 的键可以是任意类型，WeakMap 只接受对象作为键。
- **键的引用强度**：Map 的键是强引用，WeakMap 的键是弱引用。
- **遍历能力**：Map 可以被遍历，WeakMap 不能被遍历。

<details>
<summary>参考答案</summary>

### Map

##### 1.传统对象结构
Map本质上是一个键值对的集合。和传统对象结构相比，传统对象只能用字符串作为键名，这在使用上造成了很大的限制。

```javascript
const data = {}
//element为节点对象
const element = document.querySelector('.node')
console.log(element)  //输出div.node对象
console.log(element.toString())
//用点操作符不能有空格，所以采用中括号的形式给对象赋值
data[element] = 'objectData'
//输出objectData，说明在对象中存在[object HTMLDivElement]键名
console.log(data['[object HTMLDivElement]'])

```
上面带代码中，我们创建了一个对象并将一个节点对象作为它的键名，并进行了代码测试，首先验证了获取到的element节点为一个对象，再确定了经过toString方法转化后的结果，以这个值为键名成功的输出了value值objectData。

上面的代码证明了传统对象的键名会通过toString方法转化为字符串类型

注意：在我们访问对象成员的时，键名有空格时不能采用点访问，例如data.ab c
这是错误的。我们可以用data['ab c']的形式访问

##### 2.Map结构

Map类似于对象，但是键名不限于字符串，可以说Object结构提供键值对应，Map提供值值对应，因此采用Map结构会优于传统对象。

```javascript
const dataMap = new Map()
const element = document.querySelector('.node')
dataMap.set(element,'objectData')
console.log(dataMap.get(element))
console.log(dataMap)
```
上面的代码中我们获取值时直接传入了element对象，成功将对象作为键名，弥补了传统对象的不足。

##### 3.Map的特点

1. Map默认情况下不包含任何键，所有键都是自己添加进去的。不同于Object原型链上有一写默认的键。
2. Map的键可以时任何类型数据，就连函数都可以。
3. Map的键值对个数可以轻易通过size属性获取，Object需要手动计算。
4. Map在频繁增删键值对的场景下性能比Object更好。

##### 4.什么时候用Map

1. 想要添加的键值名和Object上的默认键值名冲突，又不想改名，用Map。
2. 需要String和Symbol以外的数据类型做键值时，用Map。
3. 键值对很多，有时需要计算数量，用Map。
4. 需要频繁地增删键值对时，用Map。

### WeakMap
#### 什么是WeakMap

WeakMap是ES6中新增的一种集合类型，叫做'弱映射'。它和Map是兄弟关系，与Map的区别在于这个弱字，API还是Map那套API

#### WeakMap的特性

##### 1. WeakMap只能将对象作为键名
只接受对象作为键名(null除外)，不接受其它类型的值作为键名。

##### 2.WeakMap的键名引用的对象是弱引用

首先我们需要知道什么是强引用什么是弱引用

**强引用**

```javascript
const e1 = document.getElementById('foo')
const e2 = document.getElementById('bar')
const arr = [
    [e1,'foo'],
    [e2,'bar'],
];
```

上面的代码中e1和e2是两个对象，通过arr数组对这两个对象添加一些文字说明。但是这样就形成了arr对e1和e2的引用，而这种引用又是强引用。它的区别就体现在这。当我们不再需要这两个对象时，我们必须手动删除这个引用，接触arr对两个对象的引用关系，否则垃圾回收机制不会释放e1和e2占用的内存。因为arr仍然存在着对对象的引用。

```javascript
arr[0] = null;
arr[1] = null;
```

**弱引用**

是指不能确保其引用的对象不会被垃圾回收器回收的引用。一个对象若只被弱引用所引用，则被认为是不可访问的，并因此可能在任何时刻被回收。

也就是说当我们创建一个弱引用的对象时，我们就可以静静地等待其被垃圾回收器回收。

总的来说，局势WeakMap保持了对键名所引用对象的弱引用，即垃圾回收机制不将该引用考虑在内。只要所引用的对象的其它引用都被清除，垃圾回收机制就会释放该对象所占用的内存。也就是说，一旦不再需要，WeakMap里面的键名对象和所对应的键值对会自动消失，不需要手动删除引用。

##### 3.不可遍历

正因为WeakMap对键名引用的对象是弱引用关系 ，因此WeakMap内部成员是会取决于垃圾回收机制有没有执行，运行前后成员个数很可能是不一样的，而垃圾回收机制的执行又是不可预测的，因此不可遍历。

## Map和WeakMap区别

- Map的键可以是任意类型，WeakMap只接受对象作为键，不接受其它类型的值作为键
- Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键；WeakMap的键是弱引用，键所指向的对象是可以被垃圾回收，此时键是无效的。
- Map可以被遍历，WeakMap不能被遍历

</details>

## 140. 如何判断某个字符串长度（要求支持表情）？ {#question-53de0582-783d-490b-b7ca-7a20e9d13cb8}

> 难度：3 · 类型：QA

### 题目要点

在JavaScript中，传统的`String.prototype.length`属性返回的字符串长度是基于UTF-16代码单元的数目，而不是字符的“感知长度”（即用户所认为的字符数）。由于某些字符（特别是表情符号和一些其他Unicode字符）需要两个或更多的UTF-16代码单元来表示，直接使用`.length`可能不会得到预期的结果。

为了正确计算包含表情符号的字符串的“感知长度”，你可以使用`Array.from()`方法结合`String.prototype.codePointAt()`方法。`codePointAt()`方法返回给定索引处的字符的Unicode码点，这对于所有Unicode字符（包括表情符号）都是准确的。

下面是一个计算字符串“感知长度”的函数示例：

```javascript
function getPerceivedLength(str) {
  // 使用Array.from()和String.prototype.codePointAt()的回调函数来迭代字符串
  // codePointAt()的第二个参数用于指示是否考虑整个字符（对于多码点字符）
  // 但由于Array.from()调用codePointAt()时默认传递索引，我们不需要显式设置第二个参数
  // 直接获取所有码点，并计算其数量
  return Array.from(str, c => c.codePointAt(0)).length;
}

// 测试
const strWithEmoji = "Hello 🌍";
console.log(strWithEmoji.length); // 可能输出 7，因为🌍可能由两个UTF-16代码单元组成
console.log(getPerceivedLength(strWithEmoji)); // 输出 6，正确表示了字符串的“感知长度”

const strWithMultiEmoji = "👨‍👩‍👧‍👦"; // 家庭：男人、女人、女孩、男孩
console.log(strWithMultiEmoji.length); // 可能输出 8 或更多，因为每个角色可能由多个UTF-16代码单元组成
console.log(getPerceivedLength(strWithMultiEmoji)); // 输出 1，因为这是一个单独的“感知字符”
```

<details>
<summary>参考答案</summary>

大家看到题目，可能首先想到的是 `str.length` 获取字符串的长度。

其实 JS 中的字符串长度是个奇怪的设定，很多编程语言，获取字符串的长度是得到字节长度，比如一个正常的汉字是两个字节，但在 js 中，'汉'.length 是 **1** 。看上去很方便，殊不知，这个特性埋下的坑。

比如：

```
😀 : '😀'.length 得到的是 2
𠮷 : '𠮷''.length 得到的也是 2
```

ES6 里添加了一个东西叫字符串迭代器，还添加了一个东西叫 unicode 正则模式，它们也不能直接统计字符数，而是可以把字符串拆成一个字符的数组，你可以间接的计算出字符个数。

使用字符串的Iterator统计长度，如下例子：

```js
const testStr = '123 '

for(let c of testStr) {
  console.log(c)
}
// 1
// 2
// 3
//
console.log([...testStr].length)
// 4
```

使用 `Array.from` 替换，并且封装一下：

```js
function unicodeLength(str) {
    return Array.from(str).length
}
```

</details>

## 141. 说说你对模块化方案的理解，比如 CommonJS、AMD、CMD、ES Module 分别是什么？ {#question-f5f2f81e-c0c8-409e-ba00-3f3428ae535b}

> 难度：4 · 类型：QA

### 题目要点

时间轴上，JavaScript 模块系统经历了几个阶段的发展：CommonJS、AMD、CMD 和 ES Module。

以下是每个阶段的简要总结：

#### CommonJS

- **用途**：主要用于服务器端 JavaScript（Node.js），也被 webpack 等工具用于浏览器端的模块打包。
- **特点**：同步或运行时加载，磁盘读取速度快。
- **语法**：
  - 导出：通过 `module.exports` 或 `exports` 暴露模块。
  - 引用：使用 `require('x')`。

#### AMD (Asynchronous Module Definition)

- **用途**：虽然不常用，但它是 CommonJS 在浏览器端的实现。
- **特点**：异步加载，依赖前置。
- **语法**：
  - 导出：通过 `define` 定义模块，并可以指定依赖的其他模块。
  - 引用：使用 `require(['a'], function (a){ a.foo() });`。

#### CMD (Common Module Definition)

- **用途**：根据 CommonJS 和 AMD 实现，优化了加载方式。
- **特点**：异步加载，按需加载/依赖就近。
- **语法**：
  - 导出：通过 `define` 定义模块，并在用到的地方引用依赖。
  - 引用：使用 `var x = require('a'); a.foo();`。

#### ES Module

- **用途**：目前浏览器端的默认标准。
- **特点**：静态编译，编译时就能确定依赖关系，以及输入和输出的变量。
- **语法**：
  - 导出：通过 `export` 或 `export default` 输出模块。
  - 引用：使用 `import`。

#### 注意

- `export default` 在同一个文件中只能存在一个。
- 一个模块中可以同时使用 `export default` 和 `export`。

这些模块系统各有特点，适用于不同的场景。ES Module 作为现代浏览器端的标准，提供了一种更简洁、更易于管理的模块系统。

<details>
<summary>参考答案</summary>

`时间轴：CommonJS --> AMD --> CMD --> ES Module`

### CommonJS

* 常用于：`服务器端`，`node`，`webpack`
* 特点：`同步/运行时加载`，`磁盘读取速度快`
* 语法：<br>

```js
// 1. 导出：通过module.exports或exports来暴露模块
module.exports = {
  attr1,
  attr2
}
exports.attr = xx
```

**注意**<br>
不可以`exports = xxx`，这样写会无效，因为更改了exports的地址，而 `exports` 是 `module.exports` 的引用指向的是同一个内存，模块最后导出的是 `module.exports`<br>

```js
// 2. 引用：require('x')
const xx = require('xx') // 整体重命名
const { attr } = require('xx') // 解构某一个导出
```

### AMD

* 常用于：不常用，`CommonJs的浏览器端实现`
* 特点：<br>
   * `异步加载`：因为面向浏览器端，为了不影响渲染肯定是异步加载<br>
   * `依赖前置`：所有的依赖必须写在最初的依赖数组中，速度快，但是会浪费资源，预先加载了所有依赖不管你是否用到
* 语法：<br>

```js
// 1. 导出：通过define来定义模块
// 如果该模块还依赖其他模块，则将模块的路径填入第一个参数的数组中
define(['x'], function(x){
  function foo(){
      return x.fn() + 1
  }
  return {
      foo: foo
  };
});
// 2. 引用
require(['a'], function (a){
  a.foo()
});
```

### CMD

* 常用于：不常用，`根据CommonJs和AMD实现，优化了加载方式`
* 特点：<br>
   * `异步加载`<br>
   * `按需加载/依赖就近`：用到了再引用依赖，方便了开发，缺点是速度和性能较差
* 语法：<br>

```js
// 1. 导出：通过define来定义模块
// 如果该模块还依赖其他模块，在用到的地方引用即可
define(function(){
  function foo(){
      var x = require('x')
      return x.fn() + 1
  }
  return {
      foo: foo
  };
});
// 2. 引用
var x = require('a');
a.foo();
```

### ES module

* 常用于：`目前浏览器端的默认标准`
* 特点：`静态编译：` 在编译的时候就能确定依赖关系，以及输入和输出的变量
* 语法：<br>

```js
// 1. 导出：通过export 或 export default 输出模块
// 写法1: 边声明，边导出
export var m = 1;
export function m() {};
export class M {};

// 写法2：导出一个接口 export {}，形似导出对象但不是, 本质上是引用集合，最常用的导出方法

export {
  attr1,
  attr2
}

// 写法3：默认导出

export default fn

// 2. 引用
import { x } from 'test.js' // 导出模块中对应的值，必须知道值在模块中导出时的名字
import { x as myx } from 'test.js' // 改名字
import x from 'test.js' // 默认导出的引用方式
```

**注意**<br>

 1. `export default`在同一个文件中只可存在一个（一个模块只能有一个默认输出）<br>
 2. 一个模块中可以同时使用export default 和 export<br>

 ```js
 // 模块 test.js
 var info = {
   name: 'name',
   age: 18
 }
 export default info
 export var name= '海洋饼干'
 export var age = 18

 // 引用
 import person, {name, age as myAge} from 'test.js'
 console.log(person); // { name: 'name', age: 18 }
 console.log(name+ '=' + myAge); // 海洋饼干=18
 ```

</details>

## 142. 一个滚动公告组件，如何在鼠标滑入时停止播放，在鼠标离开时继续等待滑入时的剩余等待时间后播放？ {#question-d281c552-c5d1-4d42-b2fa-0e0774884bbf}

> 难度：1 · 类型：QA

### 题目要点

轮播图的定时滚动，一般是使用 setInterval 实现。

<details>
<summary>参考答案</summary>

轮播图的定时滚动，一般是使用 setInterval 实现。

可以监听轮播图的 `mouseover` 和 `mouseout` 事件，如果 `mouseover` 被触发，就清除定时轮播，并记录下一次轮播的剩余等待时间`xs`，如果 `mouseout` 被触发，就在 `xs` 的时间后立即进行切换，并且开启定时轮播。

当然其中的细节还比较多，比如 `mouseover` 的过程中手动切换了轮播图该怎么处理等等。

</details>

## 143. 如果使用 Math.random() 计算中奖概率会有什么问题吗？ {#question-96c01fd6-3a42-497e-aca3-4232d08b8e6b}

> 难度：4 · 类型：QA

### 题目要点

使用 `Math.random()` 在 JavaScript 中计算中奖概率通常是可行的，但它可能存在以下问题：

1. **均匀性问题**：虽然 `Math.random()` 设计用来提供一个均匀分布的伪随机数，但它的均匀性和随机性并不是完美的。对于大多数非专业的应用来说，这通常不是问题，但如果需要非常精确的随机性，可能需要更高级的随机数生成器。
2. **种子问题**：`Math.random()` 生成的是一个伪随机数序列，它基于一个初始种子值，但这个种子值通常是固定的或者是基于某个内部状态，这意味着每次运行程序时生成的随机数序列可能是相同的。这在需要不可预测的随机性时可能是一个问题。
3. **安全性问题**：`Math.random()` 不适合用于加密或安全性要求较高的场合，因为它不是加密安全的随机数生成器。

为了解决这些问题，可以考虑以下措施：

- 使用更高质量的随机数生成器，如 `crypto.getRandomValues()`，它提供了更好的随机性和均匀性。
- 对于需要高安全性和不可预测性的场景，使用专门的加密随机数生成器。
- 对于抽奖等应用，确保算法设计公平，且考虑到随机数生成器的局限性。

<details>
<summary>参考答案</summary>

### 一、引言

我们日常开发经常会用到随机数，基本上我接触下来，都是使用 `Math.random()` 生成的。

例如生成随机ID：

```js
document.body.id = ('_' + Math.random()).replace('0.', '');
``

请问这样实现有没有问题？

回答：没有问题。

例如随机排序：

```js
[1, 2, 3, 4, 5].sort(_ => Math.random() - .5);
```

请问这样实现有没有问题？

回答：没有问题。

但是，如果你希望实现加密操作，例如生成密钥，尤其是在 Node.js 服务层，则 `Math.random()` 就有问题了，会有潜在的安全风险，需要使用 `crypto.getRandomValues()` 方法。

### 二、Math.random的安全风险

提到 `Math.random()` 的安全风险，有开发人员会说因为 `Math.random()` 返回的是伪随机数。

这个解释似是而非，和伪随机数没有关系，`getRandomValues()` 方法返回的也是伪随机数。

还有人说因为 `Math.random()` 返回的随机值范围不是均匀的，这个回答就不是似是而非了，而是大错特错。

那究竟为何是不安全的呢？

这个就要讲讲 `Math.random()` 方法的底层实现了，这里有[一篇文章](https://www.anquanke.com/post/id/231799)有深入介绍，我简述下其中的要点。

`Math.random()` 函数返回一个范围0-1的伪随机浮点数，其在 V8 中的实现原理是这样的：

为了保证足够的性能，`Math.random()` 随机数并不是实时生成的，而是直接生成一组随机数（64个），并放在缓存中。

当这一组随机数取完之后再重新生成一批，放在缓存中。

由于 `Math.random()` 的底层算法是公开的（xorshift128+ 算法），V8 源码可见，因此，是可以使用其他语言模拟的，这就导致，如果攻击者知道了当前随机生成器的状态，那就可以知道缓存中的所有随机数，那就很容易匹配与破解。

例如抽奖活动，使用 `Math.random()` 进行随机，那么就可以估算出一段时间内所有的中奖结果，从而带来非常严重且致命的损失。

此时应该使用 `getRandomValues()` 方法。

### 三、了解getRandomValues方法

`Crypto.getRandomValues()` 方法返回的也是伪随机数，不是真随机，按照 MDN 的说法，是为了性能考虑，没有使用真随机。

实际上，按照我的认识，所有可以使用算法生成的随机数都可以看成是伪随机数，真随机数应该是存在自然界，例如粒子的起伏，声音的噪点，分子的分布等。

和 `Math.random()` 方法的区别在于，`getRandomValues()` 方法的随机种子生成器更加的无序，例如系统层面的无序源（有些硬件自带随机种子）。

然后不同浏览器下 `getRandomValues()` 方法生成的随机数可能是有区别的。

以及 `getRandomValues()` 方法的底层实现是没有缓存的，随机数都是实时生成的，因此，性能上是要比 `Math.random()` 差的，因此，如果是高并发的场景，同时随机数仅仅是用做随机，与安全和金钱不相关，请使用 `Math.random()` 而不是 `getRandomValues()`。

就 Web 前端而言，必须要使用 `getRandomValues()` 方法的场景很少，不过由于纯前端几乎不存在所谓的高并发，因此，你使用 `getRandomValues()` 方法也是可以的，有装逼的作用。

#### 语法和使用

```js
let randNumber = self.crypto.getRandomValues(new Uint32Array(1))[0];
// 一串随机整数，通常10位
console.log(randNumber);
```

语法为：

```js
crypto.getRandomValues(typedArray)
```

支持的参数 `typedArray` 表示整数型的类型数组，包括：Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array 或者 Uint32Array。

返回值回是所有被替换为随机数的新的数组。

不过 `getRandomValues()` 方法名称有些长，不利于记忆和敏捷使用，我们可以改造下，例如：

```js
Math.randomValue = function () {
    return self.crypto.getRandomValues(new Uint32Array(1))[0];
};
```

这样我们就可以使用 `Math.randomValue()` 方法返回足够安全的随机值了。

</details>

## 144. 怎么预防用户快速连续点击，造成数据多次提交？ {#question-a9413c3f-5575-464e-8c37-511bf9e32185}

> 难度：2 · 类型：QA

### 题目要点

为了防止重复提交，前端一般会在第一次提交的结果返回前，将提交按钮禁用。

<details>
<summary>参考答案</summary>

为了防止重复提交，前端一般会在第一次提交的结果返回前，将提交按钮禁用。

实现的方法有很多种：

* css设置 `pointer-events` 为 `none`
* 增加变量控制，当变量满足条件时才执行点击事件的后续代码（比如给按钮的点击事件增加防抖）
* 如果按钮使用 button 标签实现，可以使用 `disabled` 属性
* 加遮罩层，比如一个全屏的loading，避免触发按钮的点击事件
* ...

</details>

## 145. 相比于npm和yarn，pnpm的优势是什么？ {#question-b6d72acf-0360-4fc1-8835-6a6f8a3a4025}

> 难度：4 · 类型：QA

### 题目要点

pnpm 是一个现代化的包管理器，它在 npm 和 yarn 的基础上进行了改进，提供了更快的依赖下载速度和更高效的磁盘空间利用。

以下是 pnpm 相对于 npm 和 yarn 的主要优点：

1. **更快速的依赖下载**：pnpm 通过其高效的依赖管理机制，实现了快速的依赖安装。
2. **更高效的利用磁盘空间**：通过使用硬链接和内容寻址的文件系统，pnpm 能够避免重复安装相同的依赖文件，从而节省磁盘空间。
3. **更优秀的依赖管理**：pnpm 解决了 npm 和 yarn 中的幽灵依赖问题，确保了项目中的依赖结构清晰，不会出现未声明的依赖。
pnpm 的设计原理是通过全局仓库（store）和虚拟仓库（node_modules/.pnpm）之间的硬链接和软链接来组织依赖关系。这种设计避免了依赖的重复安装，解决了路径长度限制的问题，并且通过全局仓库的硬链接，提高了安装速度。

<details>
<summary>参考答案</summary>

pnpm对比npm/yarn的优点：

* 更快速的依赖下载
* 更高效的利用磁盘空间
* 更优秀的依赖管理

我们按照包管理工具的发展历史，从 npm2 开始讲起：

## npm2

用 node 版本管理工具把 node 版本降到 4，那 npm 版本就是 2.x 了。

![](https://static.ecool.fun//article/620fe3a0-bc84-4b25-a6f5-9ba9c86f6257.jpeg)

然后找个目录，执行下 npm init -y，快速创建个 package.json。

然后执行 npm install express，那么 express 包和它的依赖都会被下载下来：

![](https://static.ecool.fun//article/2887153a-9fe1-4b27-8225-9cf566d11485.jpeg)

展开 express，它也有 node\_modules：

![](https://static.ecool.fun//article/7e02c8f1-c18e-45e1-882e-3307595b9925.jpeg)

再展开几层，每个依赖都有自己的 node\_modules：

![](https://static.ecool.fun//article/27611a70-202f-4329-9531-67b95af51976.jpeg)

也就是说 npm2 的 node\_modules 是嵌套的。

这很正常呀？有什么不对么？

这样其实是有问题的，多个包之间难免会有公共的依赖，这样嵌套的话，同样的依赖会复制很多次，会占据比较大的磁盘空间。

这个还不是最大的问题，致命问题是 windows 的文件路径最长是 260 多个字符，这样嵌套是会超过 windows 路径的长度限制的。

当时 npm 还没解决，社区就出来新的解决方案了，就是 yarn：

## yarn

yarn 是怎么解决依赖重复很多次，嵌套路径过长的问题的呢？

铺平。所有的依赖不再一层层嵌套了，而是全部在同一层，这样也就没有依赖重复多次的问题了，也就没有路径过长的问题了。

我们把 node\_modules 删了，用 yarn 再重新安装下，执行 yarn add express：

这时候 node\_modules 就是这样了：

![](https://static.ecool.fun//article/30119adb-3912-443b-9af8-9f56da6be114.jpeg)

全部铺平在了一层，展开下面的包大部分是没有二层 node\_modules 的：

![](https://static.ecool.fun//article/8c053898-f3df-4457-ba3f-f832fb988dc4.jpeg)

当然也有的包还是有 node\_modules 的，比如这样：

![](https://static.ecool.fun//article/2bd3408f-5342-429d-bb5d-5b10df60879f.jpeg)

为什么还有嵌套呢？

因为一个包是可能有多个版本的，提升只能提升一个，所以后面再遇到相同包的不同版本，依然还是用嵌套的方式。

npm 后来升级到 3 之后，也是采用这种铺平的方案了，和 yarn 很类似：

![](https://static.ecool.fun//article/5060b347-202a-43ef-80d5-d0495f6bd0e0.jpeg)

当然，yarn 还实现了 yarn.lock 来锁定依赖版本的功能，不过这个 npm 也实现了。

yarn 和 npm 都采用了铺平的方案，这种方案就没有问题了么？

并不是，扁平化的方案也有相应的问题。

最主要的一个问题是幽灵依赖，也就是你明明没有声明在 dependencies 里的依赖，但在代码里却可以 require 进来。

这个也很容易理解，因为都铺平了嘛，那依赖的依赖也是可以找到的。

但是这样是有隐患的，因为没有显式依赖，万一有一天别的包不依赖这个包了，那你的代码也就不能跑了，因为你依赖这个包，但是现在不会被安装了。

这就是幽灵依赖的问题。

而且还有一个问题，就是上面提到的依赖包有多个版本的时候，只会提升一个，那其余版本的包不还是复制了很多次么，依然有浪费磁盘空间的问题。

那社区有没有解决这俩问题的思路呢？

当然有，这不是 pnpm 就出来了嘛。

那 pnpm 是怎么解决这俩问题的呢？

## pnpm

回想下 npm3 和 yarn 为什么要做 node\_modules 扁平化？不就是因为同样的依赖会复制多次，并且路径过长在 windows 下有问题么？

那如果不复制呢，比如通过 link。

首先介绍下 link，也就是软硬连接，这是操作系统提供的机制，硬连接就是同一个文件的不同引用，而软链接是新建一个文件，文件内容指向另一个路径。当然，这俩链接使用起来是差不多的。

如果不复制文件，只在全局仓库保存一份 npm 包的内容，其余的地方都 link 过去呢？

这样不会有复制多次的磁盘空间浪费，而且也不会有路径过长的问题。因为路径过长的限制本质上是不能有太深的目录层级，现在都是各个位置的目录的 link，并不是同一个目录，所以也不会有长度限制。

没错，pnpm 就是通过这种思路来实现的。

再把 node\_modules 删掉，然后用 pnpm 重新装一遍，执行 pnpm install。

你会发现它打印了这样一句话：

![](https://static.ecool.fun//article/ec4ef89e-6db5-464e-aff1-00fa6d6ad090.jpeg)

包是从全局 store 硬连接到虚拟 store 的，这里的虚拟 store 就是 node\_modules/.pnpm。

我们打开 node\_modules 看一下：

![](https://static.ecool.fun//article/5a782293-75d0-492a-a601-d2cdb1ce265b.jpeg)

确实不是扁平化的了，依赖了 express，那 node\_modules 下就只有 express，没有幽灵依赖。

展开 .pnpm 看一下：

![](https://static.ecool.fun//article/3abd2471-1e10-446b-9680-8d7dd3927c10.jpeg)

所有的依赖都在这里铺平了，都是从全局 store 硬连接过来的，然后包和包之间的依赖关系是通过软链接组织的。

比如 .pnpm 下的 expresss，这些都是软链接，

![](https://static.ecool.fun//article/4c97a538-7fc3-4143-a851-be795b5fe9a0.jpeg)

也就是说，所有的依赖都是从全局 store 硬连接到了 node\_modules/.pnpm 下，然后之间通过软链接来相互依赖。

官方给了一张原理图，配合着看一下就明白了：

![](https://static.ecool.fun//article/a682875c-e2c3-48a1-b31b-337114305806.jpeg)

这就是 pnpm 的实现原理。

那么回过头来看一下，pnpm 为什么优秀呢？

首先，最大的优点是节省磁盘空间呀，一个包全局只保存一份，剩下的都是软硬连接，这得节省多少磁盘空间呀。

其次就是快，因为通过链接的方式而不是复制，自然会快。

这也是它所标榜的优点：

![](https://static.ecool.fun//article/92adbade-99b2-46e9-b812-e7a7c3dcb1e7.jpeg)

相比 npm2 的优点就是不会进行同样依赖的多次复制。

相比 yarn 和 npm3+ 呢，那就是没有幽灵依赖，也不会有没有被提升的依赖依然复制多份的问题。

这就已经足够优秀了，对 yarn 和 npm 可以说是降维打击。

## 总结

pnpm 最近经常会听到，可以说是爆火。本文我们梳理了下它爆火的原因：

npm2 是通过嵌套的方式管理 node\_modules 的，会有同样的依赖复制多次的问题。

npm3+ 和 yarn 是通过铺平的扁平化的方式来管理 node\_modules，解决了嵌套方式的部分问题，但是引入了幽灵依赖的问题，并且同名的包只会提升一个版本的，其余的版本依然会复制多次。

pnpm 则是用了另一种方式，不再是复制了，而是都从全局 store 硬连接到 node\_modules/.pnpm，然后之间通过软链接来组织依赖关系。

这样不但节省磁盘空间，也没有幽灵依赖问题，安装速度还快，从机制上来说完胜 npm 和 yarn。

pnpm 就是凭借这个对 npm 和 yarn 降维打击的。

</details>

## 146. 说说你对 pnpm 的了解 {#question-92fa7f2d-4f03-469b-84bd-82d693022802}

> 难度：3.5 · 类型：QA

### 题目要点

pnpm 是一个快速且节省磁盘空间的包管理器，它在设计上旨在解决 npm 和 yarn 的一些局限性。

1. **快速包安装**：pnpm 设计了一套更高效的依赖结构，使得包的安装速度极快。
2. **节省磁盘空间**：通过使用硬链接和内容寻址的文件系统，pnpm 能够更高效地利用磁盘空间，避免重复安装相同的依赖文件。
3. **依赖结构**：pnpm 的依赖结构包括嵌套、扁平和 pnpm-lock.yaml 文件。嵌套指的是依赖之间的层级关系，扁平指的是依赖文件在磁盘上的存储方式，而 pnpm-lock.yaml 文件则类似于 yarn.lock 或 package-lock.json，用于锁定依赖版本。
4. **硬链接与复用**：pnpm 使用硬链接来指向缓存文件的实际内容，这减少了文件系统的 IO 开销，并且提高了文件存储效率。
5. **内容寻址的文件系统**：当遇到两个版本的依赖模块只有一个文件存在差异时，pnpm 只存储差异文件，而不是整个文件，从而进一步节省空间。

pnpm 的这些设计优化使其在处理大型项目和依赖管理时，相比 npm 和 yarn 具有明显的性能和存储优势。

<details>
<summary>参考答案</summary>

pnpm 的官方文档是这样说的:

> Fast, disk space efficient package manager

pnpm 本质上就是一个包管理器，这一点跟 npm/yarn 没有区别，但它作为杀手锏的两个优势在于:

* 包安装速度极快；
* 磁盘空间利用非常高效。

pnpm 与 npm/yarn 相似，也是一个包管理器，但与他们不同的是，作者设计了一套理论上更完善的依赖结构以及高效的文件复用，来解决 npm/yarn 未打算解决或还不够完善的问题。

### 嵌套 + 扁平 + pnpm-lock.yaml

打开通过 pnpm 安装的项目 node\_modules 文件夹，你会发现几乎只会有当前 **package.json** 中所声明的各个依赖（的软连接），而 "真正" 的模块文件，存在于 **node\_modules/.pnpm**，由 **模块名@版本号** 形式的文件夹**扁平化**存储（解决依赖重复安装）。

这样的设计，很好的避免了项目中 **跨声明访问** 的问题，因为当前项目 **node\_modules** 只有声明的依赖可以访问。

而 **pnpm-lock.yaml** 文件如同 yarn.lock、package-lock.json 一样，可以为项目提供一份各个依赖稳定的版本信息。

### 硬链接与更高效的复用

与 yarn 的 **PnP模式** 效果类似，为了提升**文件存储效率**以及降低文件**IO开销**，**node\_modules/.pnpm** 中存储的文件其实是 pnpm 实际缓存文件的 **硬链接**，从而避免了多个项目带来多份相同文件引起的空间浪费问题。

pnpm 还额外的使用了 **内容寻址的文件系统** 来存储依赖文件。当遇到**两个版本**的 **a模块** 依赖，但两个版本之前只有**一个文件**存在差异时，pnpm 只会新增一个差异文件，最大化的提升文件存储效率。

</details>

## 147. 如何判断页面是通过PC端还是移动端访问？ {#question-664e2875-26fa-45b0-89cd-9cb961ec8046}

> 难度：3 · 类型：QA

### 题目要点

#### 一、navigator.userAgent

通过检查 `navigator.userAgent` 字符串来识别移动设备。此方法简单但可能不可靠，因为用户代理字符串可以被修改。

```javascript
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  // 当前设备是移动设备
}
```

`navigator.userAgentData` 提供更详细的数据，但并非所有浏览器都支持。

#### 二、window.screen 和 window.innerWidth

使用屏幕宽度和浏览器窗口宽度来判断设备类型。这种方法简单，但可能不准确，尤其是当设备横屏使用时。

```javascript
if (window.screen.width < 500) {
  // 当前设备是移动设备
}
```

#### 三、window.orientation

检测屏幕方向，这是一个移动设备特有的属性。如果 `window.orientation` 不是 `undefined`，则可能是移动设备。

```javascript
if (typeof window.orientation !== 'undefined') {
  // 当前设备是移动设备
}
```

#### 四、touch 事件

检测 `ontouchstart` 属性或尝试创建 `TouchEvent` 来判断是否为移动设备。

```javascript
function isMobile() {
  return ('ontouchstart' in document.documentElement);
}
```

#### 五、window.matchMedia()

使用 CSS 媒体查询来检测设备类型。通过 `window.matchMedia()` 检查特定的 CSS 查询是否匹配。

```javascript
let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
```

#### 六、工具包

使用第三方工具包，如 `react-device-detect`，来检测设备类型。

```javascript
import {isMobile} from 'react-device-detect';
if (isMobile) {
  // 当前设备是移动设备
}
```

<details>
<summary>参考答案</summary>

## 一、navigator.userAgent

最简单的方法就是分析浏览器的 user agent 字符串，它包含了设备信息。

JS 通过`navigator.userAgent`属性拿到这个字符串，只要里面包含`mobi`、`android`、`iphone`等关键字，就可以认定是移动设备。

```javascript

if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  // 当前设备是移动设备
}

// 另一种写法
if (
  navigator.userAgent.match(/Mobi/i) ||
  navigator.userAgent.match(/Android/i) ||
  navigator.userAgent.match(/iPhone/i)
) {
  // 当前设备是移动设备
}

```

这种方法的优点是简单方便，缺点是不可靠，因为用户可以修改这个字符串，让手机浏览器伪装成桌面浏览器。

Chromium 系的浏览器，还有一个`navigator.userAgentData`属性，也是类似的作用。不同之处是它将 user agent 字符串解析为一个对象，该对象的`mobile`属性，返回一个布尔值，表示用户是否使用移动设备。

```javascript
const isMobile = navigator.userAgentData.mobile;
```

注意，苹果的 Safari 浏览器和 Firefox 浏览器都不支持这个属性，具体情况可以查看 [Caniuse 网站](https://caniuse.com/mdn-api%5Fnavigator%5Fuseragentdata)。

此外，还有一个已经废除的[navigator.platform属性](https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today)，所有浏览器都支持，所以也可以用。它返回一个字符串，表示用户的操作系统。

```javascript

if (/Android|iPhone|iPad|iPod/i.test(navigator.platform)) {
 // 当前设备是移动设备
}
```

## 二、window.screen，window.innerWidth

另一种方法是通过屏幕宽度，判断是否为手机。

`window.screen`对象返回用户设备的屏幕信息，该对象的`width`属性是屏幕宽度（单位为像素）。

```javascript

if (window.screen.width < 500) {
 // 当前设备是移动设备
}

```

上面示例中，如果屏幕宽度`window.screen.width`小于500像素，就认为是手机。

这个方法的缺点在于，如果手机横屏使用，就识别不了。

另一个属性`window.innerWidth`返回浏览器窗口里面的网页可见部分的宽度，比较适合指定网页在不同宽度下的样式。

```javascript
const getBrowserWidth = function() {
 if (window.innerWidth < 768) {
   return "xs";
 } else if (window.innerWidth < 991) {
   return "sm";
 } else if (window.innerWidth < 1199) {
   return "md";
 } else {
   return "lg";
 }
};
```

## 三、window.orientation

第三种方法是侦测屏幕方向，手机屏幕可以随时改变方向（横屏或竖屏），桌面设备做不到。

`window.orientation`属性用于获取屏幕的当前方向，只有移动设备才有这个属性，桌面设备会返回`undefined`。

```javascript

if (typeof window.orientation !== 'undefined') {
 // 当前设备是移动设备
}

```

注意，iPhone 的 Safari 浏览器不支持该属性。

## 四、touch 事件

第四种方法是，手机浏览器的 DOM 元素可以通过`ontouchstart`属性，为`touch`事件指定监听函数。桌面设备没有这个属性。

```javascript

function isMobile() {
 return ('ontouchstart' in document.documentElement);
}

// 另一种写法
function isMobile() {
try {
   document.createEvent("TouchEvent"); return true;
 } catch(e) {
   return false;
 }
}
```

## 五、window.matchMedia()

最后一种方法是结合 CSS 来判断。

CSS 通过 media query（媒介查询）为网页指定响应式样式。如果某个针对手机的 media query 语句生效了，就可以认为当前设备是移动设备。

`window.matchMedia()`方法接受一个 CSS 的 media query 语句作为参数，判断这个语句是否生效。

```javascript

let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

```

上面示例中，`window.matchMedia()`的参数是一个 CSS 查询语句，表示只对屏幕宽度不超过 700 像素的设备生效。它返回一个对象，该对象的`matches`属性是一个布尔值。如果是`true`，就表示查询生效，当前设备是手机。

除了通过屏幕宽度判断，还可以通过指针的精确性判断。

```javascript

let isMobile = window.matchMedia("(pointer:coarse)").matches;

```

上面示例中，CSS 语句`pointer:coarse`表示当前设备的指针是不精确的。由于手机不支持鼠标，只支持触摸，所以符合这个条件。

有些设备支持多种指针，比如同时支持鼠标和触摸。`pointer:coarse`只用来判断主指针，此外还有一个`any-pointer`命令判断所有指针。

```javascript

let isMobile = window.matchMedia("(any-pointer:coarse)").matches;

```

上面示例中，`any-pointer:coarse`表示所有指针里面，只要有一个指针是不精确的，就符合查询条件。

## 六、工具包

除了上面这些方法，也可以使用别人写好的工具包。这里推荐 [react-device-detect](https://www.npmjs.com/package/react-device-detect)，它支持多种粒度的设备侦测。

```javascript

import {isMobile} from 'react-device-detect';

if (isMobile) {
 // 当前设备是移动设备
}

```

</details>

## 148. 导致页面加载白屏时间长的原因有哪些，怎么进行优化？ {#question-841bfe02-d07d-45db-9e65-b9c250595d80}

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

## 149. 怎么使用 js 动态生成海报？ {#question-495d46ca-f2ed-4b5c-a34a-1fa80709f0f5}

> 难度：4 · 类型：QA

比如将当前页面生成一张海报，要求携带当前用户的登录信息。

### 题目要点

将目标 DOM 节点绘制到 canvas 画布，然后利用 canvas 相关的 API 以图片形式导出。

<details>
<summary>参考答案</summary>

## 方案一：DOM->canvas->image

将目标 DOM 节点绘制到 canvas 画布，然后利用 canvas 相关的 API 以图片形式导出。

可简单标记为绘制阶段和导出阶段两个步骤：

* 绘制阶段：选择希望绘制的 DOM 节点，根据 DOM 的 `nodeType` 属性调用 `canvas` 对象的对应 API，将目标 DOM 节点绘制到 `canvas` 画布（例如对于 img 标签的绘制使用 drawImage 方法)。
* 导出阶段：通过 canvas 的 `toDataURL` 或 `getImageData` 等对外接口，最终实现画布内容的导出。

## 方案二：DOM->svg->canvas->image

将 html 作为 svg 的外联元素，利用 svg 的 API 导出为图片

## 方案三：使用NodeJS 调用浏览器方法

在后端生成海报，比如可以使用nodeJS，通过 `puppter` 等库，调用浏览器的 page 对象，基于 page.screenshots 截图并保存到磁盘。

</details>

## 150. 怎么把十进制的 0.2 转换成二进制？ {#question-0ea76a47-8e0f-4d79-81a6-7ca371b1ea8c}

> 难度：1 · 类型：QA

### 题目要点

进制转换是比较基础的，如果大家熟悉 js 的 API ，那么会首先想到这两个方法：

<details>
<summary>参考答案</summary>

进制转换是比较基础的，如果大家熟悉 js 的 API ，那么会首先想到这两个方法：

* 十进制转二进制：num.toString(2)
* 二进制转十进制：parseInt(num, 2)

所以答案就是 `(0.2).toString(2)`，可以简写为 `0.2.toString(2)`

</details>

## 151. map和 filter 有什么区别？ {#question-2a46f54f-7445-44fa-90ec-0ce0d2b44711}

> 难度：1 · 类型：QA

### 题目要点

#### 参数

`map` 和 `filter` 函数在 JavaScript 中用于处理数组。它们都接受相同的三个参数：

1. **currentValue**：当前处理的数组元素。
2. **index**：当前元素在数组中的索引。
3. **arr**：包含所有元素的原始数组。
4. **thisValue**：可选参数，作为执行回调时使用的 `this` 的值。

#### 用途

尽管 `map` 和 `filter` 函数的参数相同，但它们的作用和使用场景却有所不同：

1. **map**：
   - **返回值**：返回一个新数组，其元素是原始数组中每个元素的映射版本。
   - **应用场景**：当你想要创建一个与原始数组具有相同长度的新数组，但每个元素都经过某种转换或处理时使用。
2. **filter**：
   - **返回值**：返回一个新数组，其包含原始数组中满足指定条件的所有元素。
   - **应用场景**：当你想要创建一个新数组，只包含原始数组中符合特定条件的元素时使用。

<details>
<summary>参考答案</summary>

## 参数

首先，map和filter函数的参数，是完全相同的

> array.map(function(currentValue,index,arr), thisValue)
>
> array.filter(function(currentValue,index,arr), thisValue)

* currentValue：数组元素；
* index：索引
* arr：原数组；
* thisValue：作为该执行回调时使用，传递给函数，用作 "this" 的值

## 用途

但是在用途上，它们是有区别的：<br>

1. map方法返回的新数组是原数组的映射，何为映射？就是和原数组的长度相同，数值做相应处理。<br>
2. filter方法返回的值是过滤原数组后的新数组，和原数组长度不同，数值不变。<br>

**示例**：

```
let arr = ["1","2","3"];
let a = arr.map((item,index,a) =>{
    return item + 1
});
console.log(a);//["11", "21", "31"]
let b = arr.filter((item,index,a) =>{
    return item > 1
})
console.log(b);//["2", "3"]
```

另外，filter可过滤NaN、null、undefined、0

```js
let arr = [NaN,null,undefined,"0",0,1,2,3];
let newArr = arr.filter(item => item);
console.log(newArr);//["0", 1, 2, 3]
```

</details>

## 152. map 和 forEach 有什么区别？ {#question-da41ddaa-57d7-405e-83d8-8cc56fca6ec1}

> 难度：1 · 类型：QA

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

## 153. 实现以下转换，合并连续的数字 {#question-b41d5c3e-04c4-4873-867c-62ebf28ce369}

> 难度：2 · 类型：QA

[1,2,3,4,6,7,9,13,15]=>['1->4','6->7','9','13','15']

### 题目要点

本题是一道比较简单的数组处理题目，主要有两个处理步骤：

<details>
<summary>参考答案</summary>

本题是一道比较简单的数组处理题目，主要有两个处理步骤：

* 将超过一个的连续数字元素，合并成 `x->y`，比如 [1,2,3,4] 转成 `['1->4']`
* 将非连续的数字元素，转成字符串

具体的实现代码如下：

```js
function shortenArray(arr) {
  // 处理边界
  if (!Array.isArray(arr) || arr.length <= 1) {
    return arr;
  }

  // 记录结果
  const result = [];

  // 记录连续数字的开始位置
  let start = 0;
  // 记录连续数字的结束位置
  let last = 0;

  function pushArr(arrStart, arrEnd) {
    if (arrStart === arrEnd) {
      result.push(arr[arrStart].toString());
    } else {
      result.push(`${arr[arrStart]}->${arr[arrEnd]}`);
    }
  }

  // 一次循环获取结果
  for (let i = 1; i < arr.length; i++) {
    const temp = arr[i];
    if (arr[last] + 1 === temp) {
      last = i;
    } else {
      pushArr(start, last);
      start = i;
      last = i;
    }
  }

  // 处理剩余数据
  pushArr(start, last);

  return result;
}

shortenArray([1, 2, 3, 4, 6, 7, 9, 13, 15]); // ['1->4','6->7','9','13','15']
```

</details>

## 154. JQuery中的$(​document).ready与window.onload有什么区别？ {#question-c4442ea9-cfe9-4ed5-a82c-8adc2e4e5d55}

> 难度：1 · 类型：QA

### 题目要点

#### $(document).ready() 和 $(window).load()

- **$(document).ready()**：在DOM结构绘制完毕后立即执行，不必等到所有资源（如图片、样式表等）加载完成。
- **$(window).load()**：在页面中所有元素（包括图片、CSS文件等）完全加载到浏览器后才执行。

#### 执行顺序

- **ready**：在DOM完全构建完成后执行，包括图片和样式表等资源的加载。
- **load**：在页面完全加载完成（包括所有资源）后执行。

#### 区别

1. **执行时间**：`load` 需要等待所有资源加载完毕，而 `ready` 在DOM构建完成后立即执行。
2. **编写个数**：`load` 只能编写一次，而 `ready` 可以编写多次且都能执行。
3. **简化写法**：`ready` 可以使用简写 `$(function(){})` 或 `$().ready(function(){})`。
4. **执行效率**：在某些情况下（如添加事件监听器），`ready` 比 `load` 更高效。

<details>
<summary>参考答案</summary>

## 定义

再说两者之前先简单说明一下window与document的区别：

* window<br>
   1. window对象表示浏览器中打开的窗口。<br>
   2. window对象可以省略，如:`window.console.log()`等价于`console.log()`
* document<br>
   1. document对象是window对象的一部分,如：`document.body` 等价于 `window.document.body`<br>
   2. 浏览器的html文档成为document对象

### $(document).ready()

从字面的意思上理解，就是文档准备好了，也就是浏览器已经加载并解析完整个html文档，DOM树已经建立起来了,然后执行此函数。

原生的JavaScript写法如下：

```
document.ready=function(){
 alert("ready");
}

```

jQuery中的写法如下：

```
$(document).ready(function(){
 alert("ready");
});
//或者简写为
$(function(){
 alert("ready");
});

```

### $(window).load

在网页中所有元素(包括页面中图片、css文件等所有关联文件)完全加载到浏览器后才执行。

原生JavaScript中的写法如下

```
window.onload = function(){
 alert("onload");
};

```

jQuery中的写法如下：

```
$(window).load(function(){
 alert("onload");
});

```

## ready与load执行顺序

先来看一下DOM文档加载的步骤：

```
    1.解析HTML结构
    2.加载外部脚本和样式表文件
    3.解析并执行脚本代码
    4.构造HTML DOM模型 //ready
    5.加载图片等外部文件
    6.页面加载完毕 //load

```

从上面的步骤中可以看出，ready在第4步完成之后就执行了，但是load要在第6步完成之后才执行。

## 两者区别

### 1.执行时间

* `$(window).load()`必须等到页面内包括图片的所有元素加载完毕后才能执行（比如图片和媒体资源，它们的加载速度远慢于DOM的加载速度）加载完成之后才执行。
* `$(document).ready()`是DOM结构绘制完毕后就执行，不必等到加载完毕。但这并不代表页面的所有数据已经全部加载完成，一些大的图片有会在建立DOM树之后很长一段时间才行加载完成

以浏览器装载文档为例，在页面加载完毕后，浏览器会通过 Javascript为DOM元素添加事件。在常规的Javascript 代码中，通常使用 window.onload 方法，而在 Jquery 中，使用的是 `$(document).ready()` 方法。 `$(document).ready()`方法是事件模块中最重要一个函数，可以极大的提高 Web 应用程序的速度。

### 2.编写个数不同

* `$(window).load`不能同时编写多个，如果有多个`$(window).load()`，那么只有最后一个`$(window).load()`里面的函数或者代码才会执行，之前的`$(window).load()`都将被覆盖。
* `$(document).ready()`可以同时编写多个，并且都可以得到执行。

示例如下：

以下代码无法正确执行,结果只输出第二个,:

```
$(window).load(function(){
    alert(“text1”);
});
$(window).load(function(){
    alert(“text2”);
});

```

`$(document).ready()`能同时编写多个,以下代码正确执行，结果两次都输出：

```
$(document).ready(function(){
    alert(“Hello World”);
});
$(document).ready(function(){
    alert(“Hello again”);
});

```

### 3.简化写法

* `$(window).load`没有简化写法
* `$(document).ready(function(){})`可以简写成`$(function(){})`或者`$().ready(function(){})`

### 4.执行的效率不同

* 如要在dom的元素节点中添加onclick属性节点，这时用`$(document).ready()`就要比用`$(window).load()`的效率高
* 但是在某些时候还必须得用`$(window).load()`才行，比如按钮图片出现后添加事件

</details>

## 155. 前端跨页面通信，你知道哪些方法？ {#question-16cd86d3-cdc5-4c8c-946b-19f72408525f}

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

## 156. 请对以下数组，根据 `born` 的值降序排列 {#question-17555ccc-83cf-4f7e-9834-8c1bb749e7d7}

> 难度：1 · 类型：QA

```js
const singers = [
  { name: 'Steven Tyler', band: 'Aerosmith', born: 1948 },
  { name: 'Karen Carpenter', band: 'The Carpenters', born: 1950 },
  { name: 'Kurt Cobain', band: 'Nirvana', born: 1967 },
  { name: 'Stevie Nicks', band: 'Fleetwood Mac', born: 1948 },
];
```

### 题目要点

`Array.prototype.sort()` 方法用原地算法对数组的元素进行排序，并返回数组。在很多排序场景下推荐使用。

<details>
<summary>参考答案</summary>

`Array.prototype.sort()` 方法用原地算法对数组的元素进行排序，并返回数组。在很多排序场景下推荐使用。

语法：

> arr.sort([compareFunction])

这道题在实现上也比较简单，我们直接看实现方法：

```js
function compare(a, b) {
  return a.born < b.born ? 1: -1
}

singers.sort(compare);

// 也可以进行简写
singers.sort((a,b) => b.born - a.born)

```

</details>

## 157. 遍历一个任意长度的list中的元素并依次创建异步任务，如何获取所有任务的执行结果？ {#question-1e753e43-2b36-405f-8267-f00afc7656c1}

> 难度：1 · 类型：QA

### 题目要点

看到这个题目，大家首先想到的是 `Promise.all` 或者 `Promise.allSettled`。

<details>
<summary>参考答案</summary>

看到这个题目，大家首先想到的是 `Promise.all` 或者 `Promise.allSettled`。

* `Promise.all`

`Promise.all` 需要传入一个数组，数组中的元素都是 `Promise` 对象。当这些对象都执行成功时，则 all 对应的 promise 也成功，且执行 then 中的成功回调。如果有一个失败了，则 all 对应的 `promise` 失败，且失败时只能获得第一个失败 `Promise` 的数据。

```js
const p1 = new Promise((resolve, reject) => {
  resolve('成功了')
})
const p2 = Promise.resolve('success')
const p3 = Promise.reject('失败')

Promise.all([p1, p2]).then((result) => {
  console.log(result)  //["成功了", "success"]
}).catch((error) => {
  //未被调用
})

Promise.all([p1, p3, p2]).then((result) => {
  //未被调用
}).catch((error) => {
  console.log(error)  //"失败"
});
```

* `Promise.allSettled`

`Promise.allSettled()` 可用于并行执行独立的异步操作，并收集这些操作的结果。

`Promise.allSettled()` 方法返回一个在所有给定的 promise 都已经 fulfilled 或 rejected 后的 promise，并带有一个对象数组，每个对象表示对应的 promise 结果。

```js
Promise.allSettled([p1, p2, p3])
.then(values => {
    console.log(values)
})
```

</details>

## 158. 如何顺序执行10个异步任务？ {#question-f72409bc-ca63-4891-8443-c68f48ff37e9}

> 难度：2.5 · 类型：QA

### 题目要点

### 解法1：for 循环 + await

使用 `for` 循环结合 `async/await` 可以实现顺序执行异步任务：

- **特点**：通过 `for` 循环的顺序性，确保了每个 `task` 函数都是在前一个任务完成后才执行。

### 解法2：Array.prototype.reduce

使用 `reduce` 方法也可以实现异步任务的顺序执行，其原理是利用 `reduce` 的累加器功能

- **特点**：`reduce` 方法中的 `prev` 代表前一个异步任务的结果，`task` 是当前的异步任务。通过 `await prev` 确保了任务的顺序执行。

这两种解法都有效地处理了异步任务的顺序执行问题，但它们在代码结构和执行逻辑上有所不同。`for` 循环 + `await` 更直观易懂，而 `reduce` 方法则提供了一种更函数式编程的解决方案。在实际应用中，可以根据具体需求和偏好来选择使用哪种方法。

<details>
<summary>参考答案</summary>

## 解法1：for 循环 + await

简单的 for 循环是依次进行循环的，不像 Array.forEach，Array.map 方法是并发执行的，利用这一特点加 async / await 很容易写出下面这样的代码：

```js
(async () => {
  const sleep = delay => {
    return new Promise((resolve, reject) => {
      setTimeout(_ => resolve(), delay)
    })
  }

  const task = (i) => {
    return new Promise(async (resolve, reject) => {
      await sleep(500)
      console.log(`now is ${i}`)
      ++i
      resolve(i)
    })
  }

  let param = 0
  for (let i = 0; i < 4; i++) {
    param = await task(param)
  }
})()
```

输出：

```
now is 0
now is 1
now is 2
now is 3
```

## 解法2：Array.prototype.reduce

关于 Array.prototype.reduce 方法相信大部分小伙伴初见时都是用来数组求和。

reduce有`初始值`，`积累值`，以及`当前值`的概念。其中 `积累值`可以看作是前一个值，通过返回`积累值`又可以看作是 下一个值。使用reduce来解决问题的代码为：

```js
const sleep = delay => {
  return new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), delay)
  })
}

const task = (i) => {
  return new Promise(async (resolve, reject) => {
    await sleep(500)
    console.log(`now is ${i}`)
    ++i
    resolve(i)
  })
}

[task, task, task, task].reduce(async (prev, task) => {
  const res = await prev
  return task(res)
}, 0)
```

输出：

```
now is 0
now is 1
now is 2
now is 3
```

可以这样理解 `prev` 和 `task`：

* prev：前一个 异步任务（promise）
* task：当前的异步任务

当前的异步任务需要上一个异步任务的结果作参数，故很显然要 await prev。

</details>

## 159. 怎么把函数中的 arguments 转成数组？ {#question-c51ba9d2-f3d9-4b38-8f33-f962fa4983ea}

> 难度：1 · 类型：QA

### 题目要点

### 转换 `arguments` 为数组的几种方法

#### 1. 调用数组的原型方法

通过 `Array.prototype.slice.call(arguments)`，可以借用数组的 `slice` 方法将 `arguments` 转换为数组。

```js
var foo = function(a, b) {
  var arr = Array.prototype.slice.call(arguments);
  console.log(arr); // [1, 2]
};
foo(1, 2);
```

#### 2. 使用 `Array.from()`

`Array.from()` 是 ES6 中新增的方法，用于将类数组对象转换为真正的数组。

```js
var foo = function(a, b) {
  var arr = Array.from(arguments);
  console.log(arr); // [1, 2]
};
foo(1, 2);
```

#### 3. 使用 `for` 循环

通过 `for` 循环遍历 `arguments` 对象，并将每个元素添加到新数组中。

```js
function toArray() {
  var args = [];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return args;
}
```

#### 4. 利用 ES6 的 rest 参数

ES6 引入了 rest 参数，允许我们将不定数量的参数表示为一个数组。

```js
let a = (...args) => args;
console.log(a(1, 2)); // [1, 2]
```

<details>
<summary>参考答案</summary>

函数中的 arguments 是一个对象，不是一个数组，严格来说它是一个类数组对象。

## 1、调用数组的原型方法来转换

```js
var foo = function(a,b){
    var arr = Array.prototype.slice.call(arguments);
    console.log(arr)
}
foo(1,2) //(2) [1, 2]
```

## 2、使用ES6的新语法 `Array.from()` 来转换

`Array.from` 方法用于将两类对象转为真正的数组：类似数组的对象和可遍历对象（包括Set和Map）。

```js
var foo = function(a,b){
    var arr = Array.from(arguments);
    console.log(arr)
}
foo(1,2) // (2) [1, 2]
```

## 3、使用 for

使用 for 循环挨个将 arguments 对象中的内容复制给新数组中

```js
function toArray(){
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    return args;
}
```

## 4、利用 ES6 中的 rest 参数转换

```js
let a = (…args) => args;
```

</details>

## 160. 如何获取页面的滚动距离值？ {#question-bae25a07-be25-4857-ae96-9f9e1130286e}

> 难度：2 · 类型：QA

### 题目要点

### 获取页面滚动距离的属性和方法

1. **`window.pageYOffset`**：

2. **`window.scrollY`**：

3. **`document.body.scrollTop`**：

4. **`document.documentElement.scrollTop`**：

### 获取滚动距离的优先级

- 优先使用 `window.pageYOffset`，因为它被大多数现代浏览器支持，且不依赖于DOCTYPE定义。
- 如果 `window.pageYOffset` 不可用，使用 `window.scrollY`。
- 如果上述两者都不可用，使用 `document.body.scrollTop`（仅在没有DOCTYPE的情况下）。
- 如果所有上述方法都不可用，使用 `document.documentElement.scrollTop`（仅在IE、Firefox、Opera（presto内核）下）。

<details>
<summary>参考答案</summary>

在获取页面滚动距离的高度时候，往往有不同的获取方式，而且不同的属性浏览器支持稍有差别：

_**pageYOffset**_：属window对象，IE9+、Firefox、Chrome、Opera均支持该方式获取页面滚动敢赌值，并且会忽略DOCTYPE定义规则。

```javascript
window.pageYOffset
```

_**scrollY**_：属于window对象，Firefox、Chrome、Opera均支持，IE不支持，忽略DOCTYPE定义规则。

```javascript
window.scrollY
```

页面如果未定义DOCTYPE文档头，所有浏览器都支持docume.body.scrollTop属性获取滚动高度。

```javascript
document.body.scrollTop
```

如果页面定义了DOCTYPE文档头，那么HTML元素上的scrollT属性在IE、Firefox、Opera（presto内核）下都可以获取滚动高度值，而在Chrome和Safari下其值为0。

```javascript
document.documentElement.scrollTop; //Chrome,Safari下为0
```

此在获取页面滚动高度的时候优先考虑使用 window.pageYOffset 然后在使用scrollTop。

```javascript
 var _scrollLeft = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft
 var _scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
```

</details>

## 161. 如何让Promise.all在抛出异常后依然有效 {#question-3526fff1-d92d-4568-b6dd-549bc6c2a92e}

> 难度：3 · 类型：QA

### 题目要点

在处理多个并发请求时，`Promise.all()` 方法可以同时等待所有传入的 `Promise` 对象完成。当所有 `Promise` 都已经完成或者第一个失败的 `Promise` 被拒绝时，它会返回一个完成状态的 `Promise`，并返回一个包含所有成功结果的数组。

然而，如果 `Promise.all()` 中的任何一个 `Promise` 被拒绝，那么整个 `Promise.all()` 操作会立即被拒绝，并且不会返回任何成功的结果。这意味着如果其中一个 `Promise` 失败，其他成功的 `Promise` 的结果也会被丢弃。

为了在 `Promise.all()` 中抛出异常后依然能够获取其他成功的 `Promise` 的结果，我们可以采取以下两种方案：

#### 方案一：使用 `map` 方法处理每个 `Promise`

在 `Promise.all()` 队列中，我们使用 `map` 方法对每个 `Promise` 进行处理。如果任何一个 `Promise` 失败，我们返回一个特定的值，以确保整个 `Promise.all()` 能够正常执行并走到 `.then()` 中。

#### 方案二：使用 `Promise.allSettled` 替代 `Promise.all()`

另一个解决方案是使用 `Promise.allSettled()` 方法。这个方法会返回一个新的 `Promise`，它在所有给定的 `Promise` 已经被解析或被拒绝后解析。每个对象都描述了每个 `Promise` 的结果。

<details>
<summary>参考答案</summary>

在处理多个并发请求时，我们一般会用`Promise.all()`方法。

该方法指当所有在可迭代参数中的 `promises` 已完成，或者第一个传递的 promise（指 reject）失败时，返回 promise。

但是当其中任何一个被拒绝的话。`Promise.all([..])`就会立即被拒绝，并丢弃来自其他所有promis的全部结果。

也就是说，`promise.all` 中任何一个 `promise` 出现错误的时候都会执行reject，导致其它正常返回的数据也无法使用。

如何让Promise.all在抛出异常后依然有效呢？

# 方案一

在promise.all队列中，使用map每一个过滤每一个promise任务，其中任意一个报错后，return一个返回值，确保promise能正常执行走到.then中。

```js
var p1 = new Promise((resolve, reject) => {
    resolve('p1');
});
var p2 = new Promise((resolve, reject) => {
    resolve('p2');
});
var p3 = new Promise((resolve, reject) => {
    reject('p3');
});
Promise.all([p1, p2, p3].map(p => p.catch(e => '出错后返回的值' )))
  .then(values => {
    console.log(values);
  }).catch(err => {
    console.log(err);
  })
```

# 方案二

使用 `Promise.allSettled` 替代 `Promise.all()`。

> `Promise.allSettled()`方法返回一个promise，该promise在所有给定的promise已被解析或被拒绝后解析，并且每个对象都描述每个promise的结果。

</details>

## 162. 实现一个数字转中文的方法 {#question-38114327-a110-4a75-8745-534924338657}

> 难度：3 · 类型：QA

### 题目要点

核心考查：实现一个数字转中文的方法的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```js
//阿拉伯数字转中文数字
function NoToChinese(num) {
    if (!/^\d*(\.\d*)?$/.test(num)) {
        alert("Number is wrong!");
        return "Number is wrong!";
    }
    var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
    var BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."),
        k = 0,
        re = "";
    for (var i = a[0].length - 1; i >= 0; i--) {
        switch (k) {
            case 0:
                re = BB[7] + re;
                break;
            case 4:
                if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
                    re = BB[4] + re;
                break;
            case 8:
                re = BB[5] + re;
                BB[7] = BB[5];
                k = 0;
                break;
        }
        if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
        if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
        k++;
    }
    if (a.length > 1) //加上小数部分(如果有小数部分)
    {
        re += BB[6];
        for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
    }
    return re;
};
```

</details>

## 163. 用js实现二叉树的定义和基本操作 {#question-68c29b20-6b2f-4efa-b6f7-772cc7958084}

> 难度：3 · 类型：QA

### 题目要点

二叉排序树是一种特殊的二叉树，它的每个节点都包含一个数据域、一个左指针域和一个右指针域。在二叉排序树中，每个节点的数据域都满足特定的顺序关系，即左子树的所有节点数据都小于根节点的数据，右子树的所有节点数据都大于根节点的数据。这种有序性使得二叉排序树在查找、插入和删除操作上具有很高的效率。

在JavaScript中实现二叉排序树，通常会定义一个节点类来表示树中的每个节点，这个类包含数据域、左指针域和右指针域。然后，会定义一个树类来封装对二叉排序树的操作，包括插入节点、删除节点、查找节点和获取最小值和最大值等。

**插入操作的思路是**：从根节点开始，按照数据的大小关系递归地在左子树或右子树中查找插入位置。如果找到一个空的节点位置，则创建一个新的节点并将其插入到该位置。

**删除操作的思路是**：根据待删除节点的数据值，递归地在树中查找对应的节点。如果找到该节点，则根据节点的子节点情况（无子节点、一个子节点或两个子节点）来决定如何删除该节点。如果节点有左子节点但没有右子节点，则将左子节点提升为父节点；如果节点有右子节点但没有左子节点，则将右子节点提升为父节点；如果节点有两个子节点，则找到右子树上的最小值，将其值复制到待删除节点，然后递归删除右子树上的最小值节点。

**查找操作的思路是**：从根节点开始，按照数据的大小关系递归地在左子树或右子树中查找。如果找到目标节点，则返回该节点；如果没有找到，则返回null。

<details>
<summary>参考答案</summary>

树是计算机科学中经常用到的一种数据结构。树是一种非线性的数据结构，以分层的方式存储数据。树被用来存储具有层级关系的数据，比如文件系统中的文件；树还被用来存储有序列表。

二叉树具有诸多优点。相对于链表来说，二叉树在进行查找时速度非常快，而相对于数组来说，为二叉树添加或删除元素也非常快。

## 二叉树

二叉树是一种特殊的树，表现在它的子节点个数不超过两个。且二叉树的子树有左右之分，其次序不能任意颠倒。

在实现二叉树时，采用的存储结构为链式存储结构，链式结构的意思是采用一个链表来存储一颗二叉树，二叉树中每一个节点用链表的一个节点来存储，在二叉树中，节点结构至少有三个域：数据域data，左指针域left，右指针域right，如下图所示：

![](https://static.ecool.fun//article/c2c927d0-7758-4e59-85ef-84a698e7c867.jpeg)

二叉链表的存储结构描述如下：

```js
class Node{
    constructor(data, left, right){
        this.data = data;
        this.left = left;
        this.right = right;
        this.count = 1;
    }
}

```

与图1不同之处在于多了一个count变量，这个变量的作用在于，在向二叉排序树中插入节点时，如果发现有已经有相同的节点值了，就放弃插入，但是将该节点的count变量加一，这是为了后面实现统计文本中不同的单词数量而设计的。

使用不同的存储结构，实现二叉树的链表的算法也不同。因此接下来的算法全都基于当前所选的存储结构。

其次，将要实现的并不是普通的二叉树，而是二叉排序树，其定义为：

> 二叉排序树或者是一棵空树，或者是具有下列性质的二叉树：<br>
> （1）若左子树不空，则左子树上所有结点的值均小于它的根结点的值；<br>
> （2）若右子树不空，则右子树上所有结点的值均大于它的根结点的值；<br>
> （3）左、右子树也分别为二叉排序树；<br>
> （4）没有键值相等的节点。

## 二叉排序树

在二叉排序树的实现了一些基本操作：插入节点，删除节点，寻找节点，以及获取最小值和最大值。

代码框架：

```js
class BSTree {
    constructor() {
        this.root = null;
    }

    // 删除一个节点
    _removeNode(node, data) {

    }

    // 删除给定的数据节点
    remove(data) {
        this.root = this._removeNode(this.root, data);
    }

    // 向二叉树中插入节点
    insert(data) {

    }

    // 寻找给定数据的节点
    find(data) {

    }

    // 获得最小值的节点
    getMinNode(node = this.root) {

    }

    // 获得最大值的节点
    getMaxNode(node = this.root) {

    }
}

```

## 实现二叉排序树的各种方法

首先是insert(data)方法，从总体上来说，插入操作可以分为两步，新建值为data的节点，然后在二叉排序树中找到合适的位置插入即可。

建立以data为值的新的节点比较容易，只要

```js
let newNode = new Node(data, null, null);

```

即可，关键就在于如何找到正确的插入位置。

这里使用parentNode来记录当前节点的父节点，初始时，该变量为null，当前节点为currNode，初始时为该二叉树的根节点。

* 如果在插入时，root节点为空，则直接将新节点赋给root节点即可。
* 如果新的节点值小于当前节点值，说明待插入的位置应在在当前节点的左子树上，那么在大于时，就应该在当前节点的右子树上。进而更新当前节点所指向的节点，直到当前节点为空时，说明找到了正确的插入位置。

insert()的具体代码如下：

```js
    // 向二叉树中插入节点
    insert(data) {
        let newNode = new Node(data, null, null);

        if (this.root == null) {
            this.root = newNode;
        } else {
            let currNode = this.root;
            let parentNode = null;

            while (true) {
                parentNode = currNode;

                if (newNode.data < currNode.data) {
                    currNode = currNode.left;  // 更新当前指点的指向

                    if (!currNode) {  // 当前节点为空时，说明找到了正确的插入位置
                        parentNode.left = newNode;
                        break;
                    }
                } else if (newNode.data > currNode.data) {
                    currNode = currNode.right;   // 更新当前指点的指向

                    if (!currNode) {  // // 当前节点为空时，说明找到了正确的插入位置
                        parentNode.right = newNode;
                        break;
                    }
                } else if (newNode.data == currNode.data) {
                    // 如果给定的数据再次出现，就更新计数值
                    currNode.count++;
                    break;
                }
            }
        }
    }

```

寻找最小值函数getMinNode()，该方法较为简单，因为是一个二叉排序树，所以最小值永远在最左边的分支上，故而一直沿着左分支走到头就是最小值了。

```js
   // 获得最小值的节点
    getMinNode(node = this.root) {
        let currNode = node;
        while (currNode.left) {
            currNode = currNode.left;
        }
        return currNode;
    }

```

最大值也是同样的道理：

```js
   // 获得最大值的节点
    getMaxNode(node = this.root) {
        let currNode = node;
        while (currNode.right) {
            currNode = currNode.right;
        }
        return currNode;
    }

```

find()方法，在二叉树排序树中寻找给定的数据，比较简单：

```js
    // 寻找给定数据的节点
    find(data) {
        let currNode = this.root;
        while (currNode) {
            if (currNode.data == data) {
                return currNode;
            } else if (data < currNode.data) {
                currNode = currNode.left;
            } else {
                currNode = currNode.right;
            }
        }
        return null;
    }

```

接下来时较为复杂一些的remove()方法，由于删除节点操作使用到了递归的操作，所以单独定义了一个函数：

```js
_removeNode(node, data){}

```

这里在\_removeNode()的方法中实现真正的删除操作。该函数的功能是删除以data为值的节点，函数名称前面有个下划线表示不应该在实例中调用此函数。

这里在remove()方法中调用了这个函数：

```js
remove(data){
    this.root = this._removeNode(this.root, data);
}

```

在删除节点时，一共可以分为三种情况：

1. 待删除的节点是叶子节点。
2. 待删除的节点没有左子节点，或者没有右子节点。
3. 待删除的节点的左右子节点均存在。

当待删除的节点时叶子节点时，这种情况比较简单，直接将待删除的节点置空返回即可。

当待删除的节点没有左子节点时，返回该节点的右孩子节点，并删除该节点。待删除节点没有右节点时类似处理。

比较麻烦的是最后一种情况，待删除的节点的左右子节点均存在时，可以有两种做法：要么查找待删除节点左子树上的最大值，要么查找其右子树上的最小值。

这里使用查找其右子树上的最小值的方法。在找到待删除节点的右子树上的最小值后，创建一个临时节点，将临时节点上的值复制到待删除节点，然后再删除临时节点。

```js
    // 删除一个节点
    _removeNode(node, data) {
        if (node == null) {
            return null;
        }
        if (data == node.data) {
            // 叶子节点
            if (node.left == null && node.right == null) {
                return null;
            }

            // 没有左节点的节点
            if (node.left == null) return node.right;


            //没有右节点的节点
            if (node.right == null) return node.left;


            // 有两个节点的节点
            /*
             做法：
                找到待删除节点的右子树上的最小值创建一个临时节点。
                将临时节点上的值复制到待删除节点，然后再删除临时节点
            */

            // 寻找右子树上的最小值
            let tmpNode = this.getMinNode(node.right);
            node.data = tmpNode.data;
            node.right = this._removeNode(node.right, tmpNode.data);
            return node;
        } else if (data < node.data) {  // 待删除节点在左子树上
            node.left = this._removeNode(node.left, data);
            return node;
        } else {  // 待删除节点在右子树上
            node.right = this._removeNode(node.right, data);
            return node;
        }
    }

```

该函数使用了递归的操作来删除一个节点，如果传入待删除的数据值正好等于传入的节点的数据值时，就开始判断是上面提到的3中情况的那一种。如果待删除数据值小于当前节点数据值，则说明待删除的数据在当前节点的左子树上，反之在右子树上。

## 测试

由于准备将二叉排序树的遍历操作写在下一篇中，所以担心方法可能写错了的小伙伴可能展示无法测试所写的插入和删除操作正确与否。先用写的获取最大值和最小值来测试下吧。

```js
let myTree = new BSTree();

myTree.insert(20);
myTree.insert(13);
myTree.insert(7);
myTree.insert(9);
myTree.insert(15);
myTree.insert(14);
myTree.insert(42);
myTree.insert(22);
myTree.insert(21);
myTree.insert(24);
myTree.insert(57);

```

新建后的二叉排序树如下图所示：

![](https://static.ecool.fun//article/fad63b51-599a-4113-a217-0c26201abf2a.jpeg)

获取最大值试一下：

```js
console.log(myTree.getMaxNode());  // Node {data: 57, left: null, right: null, count: 1}

```

可以看到值为57的节点确实没有左右子树。

最小值：

```js
console.log(myTree.getMinNode());  // Node {data: 7, left: null, right: Node, count: 1}

```

可以看到值为7的节点只有右子树，与上图所示相同。

删除节点7，模拟下删除时有右子节点的情况：

```js
myTree.remove(7);
console.log(myTree.getMinNode());  // Node {data: 9, left: null, right: null, count: 1}

```

可见值为9的节点取代了原来值为7的节点的位置。

删除节点42，模拟下删除时左右子树均存在的情况：

```js
myTree.remove(42);
console.log(myTree.getMaxNode());  // Node {data: 57, left: Node, right: null, count: 1}

```

在删除值为42的节点时，使用的方法时寻找其右子树上的最大值，为57。将待删除的节点的值修改为57，然后在其右子树上删除值为57的节点即可。

根据返回的结果来看，删除后最大值为57，其右子树为空。可见是正确的。

</details>

## 164. 非递归遍历二叉树 {#question-be48725a-798c-4ae8-bd7e-47197b789802}

> 难度：2 · 类型：QA

### 题目要点

1. **前序遍历（preorderTraversal）**：
   - 从根节点开始，将根节点压入栈中。
   - 每次循环，弹出栈顶元素，并将其值添加到结果数组中。
   - 然后将该节点的右子节点压入栈中，再将左子节点压入栈中。
   - 重复上述过程，直到栈为空。
2. **中序遍历（inorderTraversal）**：
   - 遍历左子树，将左子节点压入栈中。
   - 当左子节点为空时，弹出栈顶元素并将其值添加到结果数组中。
   - 然后将该节点的右子节点压入栈中，重复上述过程。
   - 如果栈顶元素没有左子节点，则将栈顶元素的右子节点压入栈中。
3. **后序遍历（postorderTraversal）**：
   - 遍历左子树，将左子节点压入栈中。
   - 当左子节点为空时，遍历右子树，将右子节点压入栈中。
   - 当左右子节点都为空时，弹出栈顶元素并将其值添加到结果数组中。
   - 然后将栈顶元素的左子节点或右子节点（如果存在）压入栈中，重复上述过程。

<details>
<summary>参考答案</summary>

二叉树使用递归实现前中后序遍历是非常容易的，本文给出非递归实现前中后序遍历的方法，核心的思想是使用一个栈，通过迭代来模拟递归的实现过程。

下面实现中root代表二叉树根节点，每个节点都具有left,right两个指针，分别指向当前节点左右子树，一个val属性代表当前节点的值

# 前序遍历（preorderTraversal）

```javascript
const preorderTraversal = function(root) {
    const stack = [], res = []
    root && stack.push(root)
    // 使用一个栈stack，每次首先输出栈顶元素，也就是当前二叉树根节点，之后依次输出二叉树的左孩子和右孩子
    while(stack.length > 0) {
        let cur = stack.pop()
        res.push(cur.val)
        // 先入栈的元素后输出，所以先入栈当前节点右孩子，再入栈左孩子
        cur.right && stack.push(cur.right)
        cur.left && stack.push(cur.left)
    }
    return res
};
```

# 中序遍历（inorderTraversal）

## 第一种方法

```javascript
const inorderTraversal = function(root) {
    const res = [], stack = []
    while(root || stack.length) {
        // 中序遍历，首先迭代左孩子，左孩子依次入栈
        if(root.left) {
            stack.push(root)
            root = root.left
        // 如果左孩子为空了，输出节点，去右孩子中迭代，
        } else if(root.right) {
            res.push(root.val)
            root = root.right
        // 如果左右孩子都为空了，输出当前节点，栈顶元素出栈，也就是回退到上一层，此时置空节点左孩子，防止while循环重复进入
        } else if(!root.left && !root.right) {
            res.push(root.val)
            root = stack.pop()
            root && (root.left = null)
        }
    }
    return res
};
```

## 第二种方法（第一种优化）

我们在上一种方法里，条件判断`root.left`,`root.right`,其实我们可以只考虑当前节点node，这样我们只需要判断node是否存在，简化代码

```javascript
 const inorderTraversal = function(root) {
    const res = [], stack = []
    let node = root;
    while (stack.length > 0 || node !== null) {
        // 这里用当前节点node是否存在，简化代码，
        if (node) {
            stack.push(node);
            node = node.left
        } else {
            node = stack.pop();
            res.push(node.val);
            node = node.right;
        }
    }
    return res;
};
```

# 后序遍历（postorderTraversal）

## 第一种方法

```javascript
// 1, 先依次遍历左孩子, 在栈中依次记录，当左孩子为空时，遍历到叶子节点 //跳回上一层节点, 为防止while循环重复进入，将上一层左孩子置为空
// 2, 接着遍历右孩子, 在栈中依次记录值，当右孩子为空时, 遍历到叶子节点
// 跳回上一层节点, 为防止while循环重复进入，将上一层右孩子置为空
const postorderTraversal = function(root) {
    let res = [], stack = []
    while (root || stack.length) {
        if (root.left) {
            stack.push(root)
            root = root.left
        } else if (root.right) {
            stack.push(root)
            root = root.right
        } else {
            res.push(root.val)
            root = stack.pop()
            if (root && root.left) root.left = null
            else if (root && root.right) root.right = null
        }
    }
    return res
};
```

## 第二种方法（逆序思维）

再回头看看前序遍历的代码，实际上后序遍历和前序遍历是一个逆序过程

```javascript
// 结果数组中依次进入的是节点的左孩子，右孩子，节点本身，注意使用的是
// unshift，与前序遍历push不同，每次数组头部添加元素，实际上就是前序 遍历的逆序过程
const postorderTraversal = function(root) {
    const res = [], stack = []
    while (root || stack.length) {
        res.unshift(root.val)
        root.left && stack.push(root.left)
        root.right && stack.push(root.right)
        root = stack.pop()
    }
    return res
};
```

## 第三种方法（逆序思维的另一种写法）

```javascript
// 和前序遍历区别在于，结果数组res中入栈顺序是当前节点，右孩子，左孩子，最后
// 使用js数组reverse方法反转（逆序），使得输出顺序变为左孩子，右孩子，当前节点，实现后序遍历
const postorderTraversal = function(root) {
    let stack = [], res = []
    root && stack.push(root)
    while(stack.length > 0) {
        let cur = stack.pop()
        res.push(cur.val)
        cur.left && stack.push(cur.left)
        cur.right && stack.push(cur.right)
    }
    return res.reverse()
};
```

本文详细介绍了二叉树前中后序遍历的非递归实现，核心是借助一个栈stack,使用迭代的方式模拟递归过程

</details>

## 165. 什么是同步和异步？ {#question-696a79c6-1e6d-4e66-ad11-2e072c9c62d7}

> 难度：2 · 类型：QA

### 题目要点

在JavaScript中，同步（Synchronous）和异步（Asynchronous）是两种处理代码执行的方式，它们主要影响了程序在等待某个操作（如文件读取、网络请求等）完成时的行为。

### 同步（Synchronous）

同步代码执行时，会按照代码的顺序一行一行地执行，直到程序结束。如果某一部分代码执行需要花费一些时间（如读取文件、等待用户输入、进行网络请求等），那么程序会在这里停下来，等待这一操作完成后再继续执行下一行代码。这种等待会导致程序的整体执行速度变慢，尤其是在处理耗时操作时。

### 异步（Asynchronous）

异步代码执行时，不会等待某个操作完成后再继续执行下一行代码。相反，它会立即继续执行后面的代码，同时让耗时操作在后台运行。当这个耗时操作完成时，它会通过回调函数、Promises、async/await等方式来通知程序。这样，程序的其他部分就可以在等待操作完成的同时继续执行，从而提高了程序的响应性和整体性能。

### 异步编程的优点

- **提高性能**：由于程序在等待耗时操作时不会停下来，因此可以同时处理多个任务，提高了程序的执行效率。
- **提升用户体验**：在Web开发中，异步编程使得页面在等待服务器响应时不会冻结，用户可以继续与页面交互。
- **简化代码**：通过Promise、async/await等现代JavaScript特性，异步代码可以写得更简洁、更易于理解。

<details>
<summary>参考答案</summary>

`JS` 是一门单线程的编程语言，这就意味着一个时间里只能处理一件事，也就是说**JS**引擎一次只能在一个线程里处理一条语句。

虽然单线程简化了编程代码，因为这样咱们不必太担心并发引出的问题，这也意味着在阻塞主线程的情况下执行长时间的操作，如网络请求。

想象一下从API请求一些数据，根据具体的情况，服务器需要一些时间来处理请求，同时阻塞主线程，使网页长时间处于无响应的状态。这就是引入异步 JS 的原因。使用异步 (如 回调函数、`promise`、`async/await`),可以不用阻塞主线程的情况下长时间执行网络请求。

了解异步的工作方式之前，咱们先来看看同步是怎么样工作的。

## 同步 JS 是如何工作的？

在深入研究异步`JS`之前，先来了解同步 `JS` 代码在 `JavaScript` 引擎中执行情况。例如：

```javascript
    const second = () => {
      console.log('Hello there!');
    }

    const first = () => {
      console.log('Hi there!');
      second();
      console.log('The End');
    }

    first();

复制代码
```

要理解上述代码如何在 `JS` 引擎中执行，咱们必须理解什么是**执行上下文**和**调用栈**(也称为执行堆栈)。

函数代码在函数执行上下文中执行，全局代码在全局执行上下文中执行。每个函数都有自己的执行上下文。

#### 调用栈

调用堆栈顾名思义是一个具有`LIFO`(后进先出)结构的堆栈，用于存储在代码执行期间创建的所有执行上下文。

`JS` 只有一个调用栈，因为它是一种单线程编程语言。调用堆栈具有 `LIFO` 结构，这意味着项目只能从堆栈顶部添加或删除。

回到上面的代码，尝试理解代该码是如何在`JS`引擎中执行。

```javascript
const second = () => {
  console.log('Hello there!');
}
const first = () => {
  console.log('Hi there!');
  second();
  console.log('The End');
}
first();
复制代码
```

![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/011b00fb335040b998711518badef78e~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 这里发生了什么?

当执行此代码时，将创建一个全局执行上下文(由main()表示)并将其推到调用堆栈的顶部。当遇到对`first()`的调用时，它会被推送到堆栈的顶部。

接下来,`console.log('Hi there!')`被推送到堆栈的顶部，当它完成时，它会从堆栈中弹出。之后，我们调用`second()`，因此`second()`函数被推到堆栈的顶部。

`console.log('Hello there!')`被推送到堆栈顶部，并在完成时弹出堆栈。`second()` 函数结束，因此它从堆栈中弹出。

`console.log(“the End”)`被推到堆栈的顶部，并在完成时删除。之后，`first()`函数完成，因此从堆栈中删除它。

程序在这一点上完成了它的执行，所以全局执行上下文(main())从堆栈中弹出。

## 异步 JS 是如何工作的?

现在咱们已经对调用堆栈和同步`JAS`的工作原理有了基本的了解，回到异步`JS`上。

#### 阻塞是什么?

假设咱们正在以同步的方式进行图像处理或网络请求。例如：

```scss
const processImage = (image) => {
  /**
  * doing some operations on image
  **/
  console.log('Image processed');
}
const networkRequest = (url) => {
  /**
  * requesting network resource
  **/
  return someData;
}
const greeting = () => {
  console.log('Hello World');
}
processImage(logo.jpg);
networkRequest('www.somerandomurl.com');
greeting();
复制代码
```

做图像处理和网络请求需要时间，当`processImage()`函数被调用时，它会根据图像的大小花费一些时间。

`processImage()` 函数完成后，将从堆栈中删除它。然后调用 `networkRequest()` 函数并将其推入堆栈。同样，它也需要一些时间来完成执行。

最后，当`networkRequest()`函数完成时，调用`greeting()`函数。

因此，咱们必须等待函数如`processImage()`或`networkRequest()`完成。这意味着这些函数阻塞了调用堆栈或主线程。因此，在执行上述代码时，咱们不能执行任何其他操作，这是不理想的。

#### 解决办法是什么?

最简单的解决方案是异步回调，各位使用异步回调使代码非阻塞。例如:

```javascript
const networkRequest = () => {
  setTimeout(() => {
    console.log('Async Code');
  }, 2000);
};
console.log('Hello World');
networkRequest();
复制代码
```

这里使用了`setTimeout`方法来模拟网络请求。请记住`setTimeout`不是`JS`引擎的一部分，它是**Web Api**的一部分。

为了理解这段代码是如何执行的，咱们必须理解更多的概念，比如事件轮询和回调队列(或消息队列)。

![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ca51b8264d114d83b3a9f84940297056~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

事件轮询、web api和消息队列不是`JavaScript`引擎的一部分，而是浏览器的`JavaScript`运行时环境或Nodejs JavaScript运行时环境的一部分(对于Nodejs)。在Nodejs中，web api被c/c++ api所替代。

现在让我们回到上面的代码，看看它是如何异步执行的。

```javascript
const networkRequest = () => {
  setTimeout(() => {
    console.log('Async Code');
  }, 2000);
};

console.log('Hello World');

networkRequest();

console.log('The End');
复制代码
```

![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf142df94784461eb8fcfefd3dded8bd~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

当上述代码在浏览器中加载时，`console.log(' Hello World ')` 被推送到堆栈中，并在完成后弹出堆栈。接下来，将遇到对 `networkRequest()` 的调用，因此将它推到堆栈的顶部。

下一个 `setTimeout()` 函数被调用，因此它被推到堆栈的顶部。`setTimeout()`有两个参数:

* 1. 回调和
* 1. 以毫秒(ms)为单位的时间。

`setTimeout()` 方法在web api环境中启动一个2s的计时器。此时，`setTimeout()`已经完成，并从堆栈中弹出。`cosole.log(“the end”)` 被推送到堆栈中，在完成后执行并从堆栈中删除。

同时，计时器已经过期，现在回调被推送到消息队列。但是回调不会立即执行，这就是事件轮询开始的地方。

## 事件轮询

事件轮询的工作是监听调用堆栈，并确定调用堆栈是否为空。如果调用堆栈是空的，它将检查消息队列，看看是否有任何挂起的回调等待执行。

在这种情况下，消息队列包含一个回调，此时调用堆栈为空。因此，事件轮询将回调推到堆栈的顶部。

然后是 `console.log(“Async Code”)` 被推送到堆栈顶部，执行并从堆栈中弹出。此时，回调已经完成，因此从堆栈中删除它，程序最终完成。

消息队列还包含来自DOM事件(如单击事件和键盘事件)的回调。例如:

```javascript
document.querySelector('.btn').addEventListener('click',(event) => {
  console.log('Button Clicked');
});
复制代码
```

对于DOM事件，事件侦听器位于web api环境中，等待某个事件(在本例中单击event)发生，当该事件发生时，回调函数被放置在等待执行的消息队列中。

同样，事件轮询检查调用堆栈是否为空，并在调用堆栈为空并执行回调时将事件回调推送到堆栈。

## 延迟函数执行

咱们还可以使用`setTimeout`来延迟函数的执行，直到堆栈清空为止。例如

```javascript
const bar = () => {
  console.log('bar');
}
const baz = () => {
  console.log('baz');
}
const foo = () => {
  console.log('foo');
  setTimeout(bar, 0);
  baz();
}
foo();
复制代码
```

打印结果：

```
foo
baz
bar
复制代码
```

当这段代码运行时，第一个函数`foo()`被调用，在`foo`内部我们调用`console.log('foo')`，然后`setTimeout()`被调用，`bar()`作为回调函数和时`0`秒计时器。

现在，如果咱们没有使用 `setTimeout`,` bar()` 函数将立即执行，但是使用 `setTimeout` 和`0`秒计时器，将`bar`的执行延迟到堆栈为空的时候。

`0`秒后，`bar()`回调被放入等待执行的消息队列中，但是它只会在堆栈完全空的时候执行，也就是在`baz`和`foo`函数完成之后。

## ES6 任务队列

我们已经了解了异步回调和DOM事件是如何执行的，它们使用消息队列存储等待执行所有回调。

ES6引入了任务队列的概念，任务队列是 `JS` 中的 `promise` 所使用的。消息队列和任务队列的区别在于，任务队列的优先级高于消息队列，这意味着任务队列中的`promise` 作业将在消息队列中的回调之前执行，例如：

```javascript
const bar = () => {
  console.log('bar');
};

const baz = () => {
  console.log('baz');
};

const foo = () => {
  console.log('foo');
  setTimeout(bar, 0);
  new Promise((resolve, reject) => {
    resolve('Promise resolved');
  }).then(res => console.log(res))
    .catch(err => console.log(err));
  baz();
};

foo();
复制代码
```

打印结果：

```
foo
baz
Promised resolved
bar
复制代码
```

咱们可以看到 `promise` 在 `setTimeout` 之前执行，因为 `promise` 响应存储在任务队列中，任务队列的优先级高于消息队列。

## 小结

因此，咱们了解了异步 `JS` 是如何工作的，以及调用堆栈、事件循环、消息队列和任务队列等概念，这些概念共同构成了 `JS` 运行时环境。虽然成为一名出色的`JS`开发人员并不需要学习所有这些概念，但是了解这些概念是有帮助的。

</details>

## 166. 说说你的ES6-ES12的了解 {#question-e9a726d4-0ce9-4e04-88c3-9e42bad984f7}

> 难度：4 · 类型：QA

### 题目要点

### ES6（2015）

1. **类（class）**：允许开发者使用类来定义对象的属性和方法。
2. **模块化（ES Module）**：允许开发者将代码分割成多个文件，并按需导入导出。
3. **箭头（Arrow）函数**：简化函数的写法，允许更简洁的匿名函数。
4. **函数参数默认值**：为函数参数设置默认值。
5. **模板字符串**：使用反引号（`）创建多行字符串，并允许在字符串中嵌入变量。
6. **解构赋值**：从数组或对象中提取值，赋给多个变量。
7. **延展操作符**：将数组或对象扩展为另一个数组或对象。
8. **对象属性简写**：在对象字面量中，简化属性的写法。
9. **Promise**：用于处理异步操作的结果。
10. **let和const**：引入了块级作用域的变量声明。

### ES7（2016）

1. **Array.prototype.includes()**：检查数组是否包含某个值。
2. **指数操作符**：允许使用**运算符快速计算指数。

### ES8（2017）

1. **async/await**：异步编程的终极解决方案，使异步代码看起来像是同步代码。
2. **Object.values()**：返回一个给定对象自身可枚举属性值的数组。
3. **Object.entries()**：返回一个给定对象自身可枚举属性的键值对数组。
4. **String padding**：允许在字符串的开始或结束添加空格或其他字符。
5. **函数参数列表结尾允许逗号**：允许在函数参数列表末尾添加逗号。
6. **Object.getOwnPropertyDescriptors()**：获取一个对象的所有自身属性的描述符。
7. **SharedArrayBuffer对象**：表示一个通用的，固定长度的原始二进制数据缓冲区。
8. **Atomics对象**：提供了一组静态方法用来对SharedArrayBuffer对象进行原子操作。

### ES9（2018）

1. **异步迭代**：await可以和for...of循环一起使用，以串行的方式运行异步操作。
2. **Promise.finally()**：Promise.finally()方法返回一个Promise，它在执行完成时都会执行，无论结果是fulfilled还是rejected。
3. **Rest/Spread 属性**：允许属性名作为字符串来访问对象属性。
4. **正则表达式命名捕获组**：允许给正则表达式中的捕获组命名。
5. **正则表达式反向断言**：允许在正则表达式中指定字符串的位置。
6. **正则表达式dotAll模式**：允许点.匹配任意字符，包括换行符。

### ES10（2019）

1. **Array.flat()和Array.flatMap()**：用于将嵌套数组展平为一维数组。
2. **String.trimStart()和String.trimEnd()**：去除字符串首尾空白字符。
3. **String.prototype.matchAll**：返回一个迭代器，可以匹配所有匹配项。
4. **Symbol.prototype.description**：获取Symbol对象的可选描述的字符串。
5. **Object.fromEntries()**：返回一个给定对象自身可枚举属性的键值对数组。
6. **可选 Catch**：在try...catch语句中，允许省略catch块的参数。

### ES11（2020）

1. **Nullish coalescing Operator（空值处理）**：在左侧运算符为null或undefined时，返回右侧的表达式。
2. **Optional chaining（可选链）**：通过点号（.）来访问对象和数组，并在访问失败时返回undefined。
3. **Promise.allSettled**：返回一个在所有给定的promise已被决议或被拒绝后决议的promise。
4. **import()**：按需导入模块。
5. **新基本数据类型

<details>
<summary>参考答案</summary>

### ES6（2015）

#### 1\. 类（class）

```bash
class Man {
  constructor(name) {
    this.name = '小豪';
  }
  console() {
    console.log(this.name);
  }
}
const man = new Man('小豪');
man.console(); // 小豪
```

#### 2\. 模块化(ES Module)

```bash
// 模块 A 导出一个方法
export const sub = (a, b) => a + b;
// 模块 B 导入使用
import { sub } from './A';
console.log(sub(1, 2)); // 3
```

#### 3\. 箭头（Arrow）函数

```bash
const func = (a, b) => a + b;
func(1, 2); // 3
```

#### 4\. 函数参数默认值

```bash
function foo(age = 25,){ // ...}
```

#### 5\. 模板字符串

```bash
const name = '小豪';
const str = `Your name is ${name}`;
```

#### 6\. 解构赋值

```bash
let a = 1, b= 2;
[a, b] = [b, a]; // a 2  b 1
```

#### 7\. 延展操作符

```bash
let a = [...'hello world']; // ["h", "e", "l", "l", "o", " ", "w", "o", "r", "l", "d"]
```

#### 8\. 对象属性简写

```bash
const name='小豪',
const obj = { name };
```

#### 9\. Promise

```bash
Promise.resolve().then(() => { console.log(2); });
console.log(1);
// 先打印 1 ，再打印 2
```

#### 10\. let和const

```bash
let name = '小豪'；
const arr = [];
```

### ES7（2016）

#### 1\. Array.prototype.includes()

```bash
[1].includes(1); // true
```

#### 2\. 指数操作符

```bash
2**10; // 1024
```

### ES8（2017）

#### 1\. async/await

异步终极解决方案

```bash
async getData(){
    const res = await api.getTableData(); // await 异步任务
    // do something
}
```

#### 2\. Object.values()

```bash
Object.values({a: 1, b: 2, c: 3}); // [1, 2, 3]
```

#### 3\. Object.entries()

```bash
Object.entries({a: 1, b: 2, c: 3}); // [["a", 1], ["b", 2], ["c", 3]]
```

#### 4\. String padding

```bash
// padStart
'hello'.padStart(10); // "     hello"
// padEnd
'hello'.padEnd(10) "hello     "
```

#### 5\. 函数参数列表结尾允许逗号

#### 6\. Object.getOwnPropertyDescriptors()

> 获取一个对象的所有自身属性的描述符,如果没有任何自身属性，则返回空对象。

#### 7\. SharedArrayBuffer对象

> SharedArrayBuffer 对象用来表示一个通用的，固定长度的原始二进制数据缓冲区，

```bash
/**
 *
 * @param {*} length 所创建的数组缓冲区的大小，以字节(byte)为单位。
 * @returns {SharedArrayBuffer} 一个大小指定的新 SharedArrayBuffer 对象。其内容被初始化为 0。
 */
new SharedArrayBuffer(10)
```

#### 8\. Atomics对象

> Atomics 对象提供了一组静态方法用来对 SharedArrayBuffer 对象进行原子操作。

### ES9（2018）

#### 1\. 异步迭代

await可以和for...of循环一起使用，以串行的方式运行异步操作

```bash
async function process(array) {
  for await (let i of array) {
    // doSomething(i);
  }
}
```

#### 2\. Promise.finally()

```bash
Promise.resolve().then().catch(e => e).finally();
```

#### 3\. Rest/Spread 属性

```bash
const values = [1, 2, 3, 5, 6];
console.log( Math.max(...values) ); // 6
```

#### 4\. 正则表达式命名捕获组

```bash
const reg = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/;
const match = reg.exec('2021-02-23');
```

#### 5\. 正则表达式反向断言

```bash
(?=p)、(?<=p)  p 前面(位置)、p 后面(位置)
(?!p)、(?<!p>) 除了 p 前面(位置)、除了 p 后面(位置)
```

#### 6\. 正则表达式dotAll模式

> 正则表达式中点.匹配除回车外的任何单字符，标记s改变这种行为，允许行终止符的出现

```bash
/hello.world/.test('hello\nworld');  // false
```

### ES10（2019）

#### 1\. Array.flat()和Array.flatMap()

flat()

```bash
[1, 2, [3, 4]].flat(Infinity); // [1, 2, 3, 4]
```

flatMap()

```bash
[1, 2, 3, 4].flatMap(a => [a**2]); // [1, 4, 9, 16]
```

#### 2\. String.trimStart()和String.trimEnd()

去除字符串首尾空白字符

#### 3\. String.prototype.matchAll

> matchAll（）为所有匹配的匹配对象返回一个迭代器

```bash
const raw_arr = 'test1  test2  test3'.matchAll((/t(e)(st(\d?))/g));
const arr = [...raw_arr];
```

#### 4\. Symbol.prototype.description

> 只读属性，回 Symbol 对象的可选描述的字符串。

```bash
Symbol('description').description; // 'description'
```

#### 5\. Object.fromEntries()

> 返回一个给定对象自身可枚举属性的键值对数组

```bash
// 通过 Object.fromEntries， 可以将 Map 转化为 Object:
const map = new Map([ ['foo', 'bar'], ['baz', 42] ]);
console.log(Object.fromEntries(map)); // { foo: "bar", baz: 42 }
```

#### 6\. 可选 Catch

### ES11（2020）

#### 1\. Nullish coalescing Operator(空值处理)

表达式在 ?? 的左侧 运算符求值为undefined或null，返回其右侧。

```bash
let user = {
    u1: 0,
    u2: false,
    u3: null,
    u4: undefined
    u5: '',
}
let u2 = user.u2 ?? '用户2'  // false
let u3 = user.u3 ?? '用户3'  // 用户3
let u4 = user.u4 ?? '用户4'  // 用户4
let u5 = user.u5 ?? '用户5'  // ''
```

#### 2\. Optional chaining（可选链）

?.用户检测不确定的中间节点

```bash
let user = {}
let u1 = user.childer.name // TypeError: Cannot read property 'name' of undefined
let u1 = user.childer?.name // undefined
```

#### 3\. Promise.allSettled

> 返回一个在所有给定的promise已被决议或被拒绝后决议的promise，并带有一个对象数组，每个对象表示对应的promise结果

```bash
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => reject('我是失败的Promise_1'));
const promise4 = new Promise((resolve, reject) => reject('我是失败的Promise_2'));
const promiseList = [promise1,promise2,promise3, promise4]
Promise.allSettled(promiseList)
.then(values=>{
  console.log(values)
});
```

#### 4\. import()

按需导入

#### 5\. 新基本数据类型BigInt

> 任意精度的整数

#### 6\. globalThis

-   浏览器：window
-   worker：self
-   node：global

### ES12（2021）

#### 1\. replaceAll

> 返回一个全新的字符串，所有符合匹配规则的字符都将被替换掉

```bash
const str = 'hello world';
str.replaceAll('l', ''); // "heo word"
```

#### 2\. Promise.any

> Promise.any() 接收一个Promise可迭代对象，只要其中的一个 promise 成功，就返回那个已经成功的 promise 。如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise

```bash
const promise1 = new Promise((resolve, reject) => reject('我是失败的Promise_1'));
const promise2 = new Promise((resolve, reject) => reject('我是失败的Promise_2'));
const promiseList = [promise1, promise2];
Promise.any(promiseList)
.then(values=>{
  console.log(values);
})
.catch(e=>{
  console.log(e);
});
```

#### 3\. WeakRefs

> 使用WeakRefs的Class类创建对对象的弱引用(对对象的弱引用是指当该对象应该被GC回收时不会阻止GC的回收行为)

#### 4\. 逻辑运算符和赋值表达式

> 逻辑运算符和赋值表达式，新特性结合了逻辑运算符（&&，||，??）和赋值表达式而JavaScript已存在的 复合赋值运算符有：

```bash
a ||= b
//等价于
a = a || (a = b)

a &&= b
//等价于
a = a && (a = b)

a ??= b
//等价于
a = a ?? (a = b)
```

#### 5\. 数字分隔符

> 数字分隔符，可以在数字之间创建可视化分隔符，通过\_下划线来分割数字，使数字更具可读性

```bash
const money = 1_000_000_000;
//等价于
const money = 1000000000;

1_000_000_000 === 1000000000; // true
```

</details>

## 167. ['1','2','3'].map(parseInt) 的返回值是什么？ {#question-3f897e08-e0f7-4b68-90ac-e643167754bf}

> 难度：1 · 类型：QA

### 题目要点

`['1','2','3'].map(parseInt)` 的返回值是 `[1, NaN, NaN]`，因为 `map` 方法调用 `parseInt` 时，不仅传递了数组中的字符串，还传递了索引作为 `parseInt` 的第二个参数（基数），导致 `'2'` 和 `'3'` 无法以非法的基数解析，从而返回 `NaN`。

正确的做法是使用箭头函数明确指定基数，如 `['1', '2', '3'].map(str => parseInt(str, 10))`，或者使用 `Number` 函数代替 `parseInt`，即 `['1', '2', '3'].map(Number)`。

<details>
<summary>参考答案</summary>

首先整个题目考校的是两个函数，和一个字符串转数字的概念

1. 数组的`map`函数，接受三个参数，当前值，当前索引，当前数组。
2. parseInt接受两个参数，需要转换的字符串，基数（基数取值范围2\~36）<br>

```js
var new_array = arr.map(function callback(currentValue, index, array) {
 // Return element for new_array
})
parseInt(string, radix)
```

3. 根据上面的两个函数的解释，我们可以发现实际上，上面的`['1','2','3'].map(parseInt)` 其实就是等价于下面的代码。<br>

```js
['1','2','3'].map((item, index) => {
    return parseInt(item, index)
})
//  parseInt('1', 0)  1
//  parseInt('2', 1)  NaN
//  parseInt('3', 2)  NaN
```

4. 如果我们需要返回1，2，3需要怎么办？<br>

```js
function parseIntFun(item) {
    return parseInt(item, 10)
}
['1','2','3'].map(parseIntFun)
//  parseInt('1', 10)  1
//  parseInt('2', 10)  2
//  parseInt('3', 10)  3
```

综上所述，返回值是 [1,NaN,NaN]

</details>

## 168. 怎么预防按钮的重复点击？ {#question-77336d84-243e-49a0-b4b2-47bad83292e9}

> 难度：3 · 类型：QA

### 题目要点

### 前端解决方案

1. **防抖（Debounce）**：在用户停止操作后一定时间（例如300毫秒）内，如果再次操作，则忽略新操作。
2. **节流（Throttle）**：限制函数在一定时间内只能执行一次，比如每300毫秒执行一次。
3. **控制按钮状态**：在按钮被点击后，立即禁用按钮，直到异步操作完成。
4. **设置请求间隔限制**：如果用户在短时间内多次发起相同请求，提示用户确认是否继续。

### 后端解决方案

1. **幂等性（Idempotence）**：确保一个操作可以被安全地执行多次，每次执行结果都是相同的。例如，删除操作可以是幂等的，因为多次删除同一项将只删除一次。
2. **唯一请求标识**：为每个请求生成一个唯一的标识符（如UUID），并在后续请求中携带这个标识符。如果后端检测到重复的请求，可以拒绝处理。
3. **请求限流**：在一段时间内，限制同一用户或IP地址可以发起的请求数量。
4. **使用缓存**：对于某些类型的请求，可以缓存结果，并检查请求是否是重复的。如果是，则返回缓存结果。

<details>
<summary>参考答案</summary>

先看看在那些场景会导致重复请求：

1. 手速快，不小心双击操作按钮。
2. 很小心的点击了一次按钮，因为请求响应比较慢，页面没有任何提示，怀疑上次点击没生效，再次点击操作按钮。
3. 很小心的点击了一次按钮，因为请求响应比较慢，页面没有任何提示，刷新页面，再次点击操作按钮。

## 前端方案

我们可以对症下药：

1. 控制按钮，在短时间内被多次点击，第一次以后的点击无效。
2. 控制按钮，在点击按钮触发的请求响应之前，再次点击无效。
3. 配置特殊的URL，然后控制这些URL请求的最小时间间隔。如果再次请求跟前一次请求间隔很小，弹窗二次提示，是否继续操作。

### 防止无意识重复点击按钮

给按钮添加控制，在`control` 毫秒内，第一次点击事件之后的点击事件不执行。

```text
<template>
    <button @click="handleClick"></button>
</templage>
<script>
export default {
    methods: {
        handleClick(event) {
            if (this.disabled) return;
            if (this.notAllowed) return;
            // 点击完多少秒不能继续点
            this.notAllowed = true;
            setTimeout(()=>{
                this.notAllowed = false;
            }, this.control)
            this.$emit('click', event, this);
        }
    }
}
</script>
```

当然时间间隔可以设置，默认为300毫秒。我们无意识的重复点击一般在300毫秒以内。

### 按钮点击立马禁用，等响应回来才能继续点击

触发点击的button实例传入fetch配置，代码如下：

```js
doQuery: function (button) {
    this.FesApi.fetch(`generalcard/query`, {
        sub_card_type: this.query.sub_card_type,
        code_type: this.query.code_type,
        title: this.query.title,
        card_id: this.query.card_id,
        page_info: {
            pageSize: this.paginationOption.page_info.pageSize,
            currentPage: this.paginationOption.page_info.currentPage
        }
    }, {
        //看这里，加上下面一行代码就行。。so easy
        button: button
    }).then(rst => {
        // 成功处理
    });
}

```

在fetch函数内部，设置button的`disabled=true`，当响应回来时，设置`disabled=false`代码如下：

```js
const action = function (url, data, option) {
    // 如果传了button
    if (option.button) {
        option.button.currentDisabled = true;
    }
    // 记录日志
    const log = requsetLog.creatLog(url, data);

    return param(url, data, option)
        .then(success, fail)
        .then((response) => {
            requsetLog.changeLogStatus(log, 'success');
            if (option && option.button) {
                option.button.currentDisabled = false;
            }
            return response;
        })
        .catch((error) => {
            requsetLog.changeLogStatus(log, 'fail');
            if (option && option.button) {
                option.button.currentDisabled = false;
            }
            error.message && window.Toast.error(error.message);
            throw error;
        });
};

```

### 从根本入手，一招击杀

当页面刷新，页面状态重置，此时再次点击按钮，会判定为初次点击，而且按钮状态恢复可点击。我们可以设置哪些请求地址是重要的，它们请求间隔不能过小。如果过小，页面弹出覆层询问用户时候继续执行。

 设置代码如下：

```js
this.FesApi.setImportant({
    'generalcard/action': {
        control: 10000,
        message: '您在十秒内重复发起手工清算操作，是否继续？'
    }
})

```

而实现代码如下：

```js
api.fetch = function (url, data, option) {
    if (requsetLog.importantApi[url]) {
        const logs = requsetLog.getLogByURL(url, data);
        if (logs.length > 0) {
            const compareLog = logs[logs.length - 1];
            if (compareLog.status === 'compare') {
                requsetLog.creatLog(url, data, 'notAllowed');
                return {
                    then: () => {}
                };
            }
            const importantApiOption = requsetLog.importantApi[url];
            const control = importantApiOption.control || 10000;
            const message = importantApiOption.message || util.format('fesMessages.importInterfaceTip', { s: control / 1000 });
            if (new Date().getTime() - compareLog.timestamp < control) {
                const oldStatus = compareLog.status;
                requsetLog.changeLogStatus(compareLog, 'compare');
                return new Promise(((resolve, reject) => {
                    window.Message.confirm(util.format('fesMessages.tip'), message).then((index) => {
                        if (compareLog.status === 'compare') {
                            requsetLog.changeLogStatus(compareLog, oldStatus);
                        }
                        if (index === 0) {
                            resolve(action(url, data, option));
                        } else {
                            reject(new Error('不允许相同操作间隔过小'));
                        }
                    });
                }));
            }
            return action(url, data, option);
        }
        return action(url, data, option);
    }
    return action(url, data, option);
};

```

攻击者可以绕过正常流程，模拟发起多次请求，所以仅仅在前端页面做好预防重复请求工作是不够的。后台接口需要设计得更健壮，具有幂等性。

</details>

## 169. JavaScript 中如何取消请求 {#question-97eb452e-5d81-4758-b6f2-027dcf43027c}

> 难度：2.5 · 类型：QA

### 题目要点

### 取消XMLHttpRequest请求

XMLHttpRequest的取消可以通过调用`abort()`方法来实现。这个方法会立即停止当前的请求，并释放相关资源。例如：

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '<http://127.0.0.1:3000/api/get>', true);
xhr.send();
setTimeout(() => {
  xhr.abort();
}, 1000);
```

当请求被取消时，`readyState`会变成`XMLHttpRequest.UNSENT`(0)，`status`会被设置为0。

### 取消Fetch请求

Fetch API使用`AbortController`来取消请求。`AbortController`的`signal`属性可以作为参数传递给fetch请求，以便在需要时取消请求。例如：

```javascript
const controller = new AbortController();
void (async function () {
  try {
    const response = await fetch('<http://127.0.0.1:3000/api/get>', {
      signal: controller.signal,
    });
    const data = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch request has been aborted.');
    } else {
      throw error;
    }
  }
})();
setTimeout(() => {
  controller.abort();
}, 1000);
```

在`AbortController`中，可以传递取消请求的原因，以便在取消时捕获这个信息。

### 取消axios请求

axios同样支持`AbortController`来取消请求。取消axios请求的代码示例如下：

```javascript
const controller = new AbortController();
const API_URL = '<http://127.0.0.1:3000/api/get>';
void (async function () {
  try {
    const response = await axios.get(API_URL, {
      signal: controller.signal,
    });
    const { data } = response;
  } catch (error) {
    if (error.isAxiosError && error.message === 'Canceled') {
      console.log('axios request has been canceled.');
    } else {
      throw error;
    }
  }
})();
setTimeout(() => {
  controller.abort();
}, 1000);
```

axios之前的`CancelToken`方法已经被弃用，建议使用`AbortController`。

<details>
<summary>参考答案</summary>

JavaScript 实现异步请求就靠浏览器提供的两个 API —— **XMLHttpRequest 和 Fetch**。我们平常用的较多的是 Promise 请求库 axios，它基于 XMLHttpRequest。

本篇带来 XMLHttpRequest、Fetch 和 axios 分别是怎样“取消请求”的。

### 取消 XMLHttpRequest 请求

当请求已经发送了，可以使用 **XMLHttpRequest.abort()** 方法取消发送，代码示例如下：

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '<http://127.0.0.1:3000/api/get>', true);
xhr.send();
setTimeout(() => {
     xhr.abort();
}, 1000);
```

取消请求，[readyState](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState) 会变成 `XMLHttpRequest.UNSENT`(0)；请求的 xhr.[status](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status) 会被设为 0 ；

不如在 Chrome DevTools Network 中，看看正常请求和取消请求的对比图：

![image.png](https://static.ecool.fun//article/86b6d8c6-1afb-465f-b084-bf4716fab7b2.png)

### 取消 Fetch 请求

取消 Fetch 请求，需要用到 [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API。我们可以构造一个 controller 实例：**`const controller = new AbortController()` ,** controller 它有一个只读属性 [AbortController.signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)，可以作为参数传入到 fetch 中，用于将控制器与获取请求相关联；

代码示例如下：

```js
const controller = new AbortController();
void (async function () {
    const response = await fetch('<http://127.0.0.1:3000/api/get>', {
        signal: controller.signal,
    });
    const data = await response.json();
})();

setTimeout(() => {
    controller.abort();
}, 1000);
```

浏览器控制台对比图：

![image.png](https://static.ecool.fun//article/3d2f4cfa-dd06-4e83-973a-a2c5c6fbfc7f.png)

我们其实可以在 controller.abort() 传入“取消请求的原因”参数，然后进行 try...catch 捕获

![image.png](https://static.ecool.fun//article/db951d09-396d-44e9-bd3c-5c1857dd0b28.png)

### 取消 axios 请求

axios 同样支持 [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

```js
const controller = new AbortController();
const API_URL = '<http://127.0.0.1:3000/api/get>';
void (async function () {
    const response = await axios.get(API_URL, {
        signal: controller.signal,
    });
    const { data } = response;
})();
setTimeout(() => {
    controller.abort();
}, 1000);
```

控制台截图：

![image.png](https://static.ecool.fun//article/fd990541-a05b-4d70-b802-130a83e47617.png)

错误捕获：

![image.png](https://static.ecool.fun//article/a917101b-364e-43a9-a80f-fe0030ebec20.png)

注意：axios 之前用于取消请求的 CancelToken 方法已经被弃用，更多请见文档 [axios-http.com/docs/cancel…](https://axios-http.com/docs/cancellation)；

</details>

## 170. 怎么实现大型文件上传？ {#question-8c5e8658-706c-448c-bce9-3bdbb615b625}

> 难度：3.5 · 类型：QA

### 题目要点

### 大文件快速上传的方案

1. **分片上传（Chunked Upload）**：将大文件分割成小块，客户端通过多个并行请求分别上传这些小块。服务器端接收并存储每个小块，最后将所有小块合并回完整的文件。
2. **流式上传（Streaming Upload）**：客户端通过流的方式逐步读取文件内容并发送给服务器。服务器端逐步接收和处理这些数据流，不需要等待整个文件上传完成。
3. **使用专门的文件上传服务**：利用云存储服务或专业的文件传输协议，这些服务通常优化了大文件上传的处理。
4. **压缩文件上传**：在客户端对文件进行压缩，减少上传时间和网络带宽消耗。
5. **并发上传**：通过多个并行请求同时上传文件的不同部分，加快上传速度。
6. **断点续传**：记录上传进度，以便在网络中断或上传失败后能够从上次中断的位置继续上传。

<details>
<summary>参考答案</summary>

大文件快速上传的方案，其实无非就是将 **文件变小**，也就是通过 **压缩文件资源** 或者 **文件资源分块** 后再上传。

具体来说，可以考虑以下几种方法：

1. **分片上传（Chunked Upload）**：将大文件拆分成小的文件块(chunk)，然后通过多个并行的请求依次上传这些文件块。服务器接收到每个文件块后进行存储，最后合并所有文件块以还原原始文件。这种方法可以降低单个请求的负载，并允许在网络中断或上传失败时可以从断点续传。

2. **流式上传（Streaming Upload）**：客户端使用流方式逐步读取文件的内容，并将数据流通过 POST 请求发送给服务器。服务器端能够逐步接收并处理这些数据流，而无需等待完整的文件上传完成。这种方法适用于较大的文件，减少了内存占用和传输延迟。

3. **使用专门的文件上传服务**：有一些第三方服务可供使用，例如云存储服务（如 Amazon S3、Google Cloud Storage）、文件传输协议（如 FTP、SFTP）等。这些服务通常提供了高可靠性、可扩展性和安全性，并且针对大文件上传进行了优化。

4. **压缩文件上传**：如果可能，可以在客户端先对文件进行压缩，然后再进行上传。压缩后的文件大小更小，可以减少上传时间和网络带宽消耗。

5. **并发上传**：通过多个并行的请求同时上传文件的不同部分，以加快整个上传过程。这需要服务器端支持并发上传并正确处理分片或部分文件的合并。

6. **断点续传**：记录上传进度和状态，以便在网络中断或上传失败后能够从上次中断的位置继续上传。可以使用客户端或服务器端的断点续传机制来实现。

## 补充知识点

问题 1：**谁负责资源分块？谁负责资源整合？**

当然这个问题也很简单，肯定是前端负责分块，服务端负责整合.

问题 2：**前端怎么对资源进行分块？**

首先是选择上传的文件资源，接着就可以得到对应的文件对象 **File**，而 **File.prototype.slice** 方法可以实现资源的分块，当然也有人说是 **Blob.prototype.slice** 方法，因为 **`Blob.prototype.slice === File.prototype.slice`**.

问题 3：**服务端怎么知道什么时候要整合资源？如何保证资源整合的有序性？**

由于前端会将资源分块，然后单独发送请求，也就是说，原来 1 个文件对应 1 个上传请求，现在可能会变成 1 个文件对应 n 个上传请求，所以前端可以基于 Promise.all 将这多个接口整合，上传完成在发送一个合并的请求，通知服务端进行合并。

合并时可通过 nodejs 中的读写流（readStream/writeStream），将所有切片的流通过管道（pipe）输入最终文件的流中。

在发送请求资源时，前端会定好每个文件对应的序号，并将当前分块、序号以及文件 hash 等信息一起发送给服务端，服务端在进行合并时，通过序号进行依次合并即可。

问题 4：**如果某个分块的上传请求失败了，怎么办？**

一旦服务端某个上传请求失败，会返回当前分块失败的信息，其中会包含文件名称、文件 hash、分块大小以及分块序号等，前端拿到这些信息后可以进行重传，同时考虑此时是否需要将 Promise.all 替换为 Promise.allSettled 更方便.

</details>

## 171. 说说你对JS的模块化方案的了解 {#question-8ecafda7-0ae6-40bd-b8c6-385d02fa7165}

> 难度：3 · 类型：QA

### 题目要点

JavaScript的模块化方案主要包括：

1. **CommonJS**：主要用于Node.js，通过`require`和`module.exports`实现同步加载模块。

2. **AMD（RequireJS）**：浏览器端异步加载模块，使用`define`定义模块，`require`加载依赖。

3. **ES6 Modules**：ECMAScript 2015标准引入，支持`import`和`export`语法，支持静态和动态加载。

4. **UMD**：兼容CommonJS、AMD和全局变量的模块定义方式。

5. **模块打包工具**：如Webpack、Rollup等，支持多种模块化标准，提供代码分割、懒加载等优化。

<details>
<summary>参考答案</summary>

## 前言

JavaScript 语言诞生至今，模块规范化之路曲曲折折。社区先后出现了各种解决方案，包括 AMD、CMD、CommonJS 等，而后 ECMA 组织在 JavaScript 语言标准层面，增加了模块功能（因为该功能是在 ES2015 版本引入的，所以在下文中将之称为 ES6 module）。<br>
今天我们就来聊聊，为什么会出现这些不同的模块规范，它们在所处的历史节点解决了哪些问题？

## 何谓模块化？

或根据功能、或根据数据、或根据业务，将一个大程序拆分成互相依赖的小文件，再用简单的方式拼装起来。

## 全局变量

### 演示项目

为了更好的理解各个模块规范，先增加一个简单的项目用于演示。

```
# 项目目录:
├─ js              # js文件夹
│  ├─ main.js      # 入口
│  ├─ config.js    # 项目配置
│  └─ utils.js     # 工具
└─  index.html     # 页面html
```

### Window

在刀耕火种的前端原始社会，JS 文件之间的通信基本完全依靠`window`对象（借助 HTML、CSS 或后端等情况除外）。

```js
// config.js
var api = 'https://github.com/ronffy';
var config = {
  api: api,
}

// utils.js
var utils = {
  request() {
    console.log(window.config.api);
  }
}

// main.js
window.utils.request();
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>小贼先生：【深度全面】JS模块规范进化论</title>
</head>
<body>

  <!-- 所有 script 标签必须保证顺序正确，否则会依赖报错 -->
  <script src="./js/config.js"></script>
  <script src="./js/utils.js"></script>
  <script src="./js/main.js"></script>
</body>
</html>
```

### IIFE

浏览器环境下，在全局作用域声明的变量都是全局变量。全局变量存在命名冲突、占用内存无法被回收、代码可读性低等诸多问题。

这时，IIFE（匿名立即执行函数）出现了：

```js
;(function () {
  ...
}());
```

用IIFE重构 config.js：

```js
;(function (root) {
  var api = 'https://github.com/ronffy';
  var config = {
    api: api,
  };
  root.config = config;
}(window));
```

IIFE的出现，使全局变量的声明数量得到了有效的控制。

### 命名空间

依靠`window`对象承载数据的方式是“不可靠”的，如`window.config.api`，如果`window.config`不存在，则`window.config.api`就会报错，所以为了避免这样的错误，代码里会大量的充斥`var api = window.config && window.config.api;`这样的代码。

这时，`namespace`登场了，简约版本的`namespace`函数的实现（只为演示，不要用于生产）：

```js
function namespace(tpl, value) {
  return tpl.split('.').reduce((pre, curr, i) => {
    return (pre[curr] = i === tpl.split('.').length - 1
      ? (value || pre[curr])
      : (pre[curr] || {}))
  }, window);
}
```

用`namespace`设置`window.app.a.b`的值：

```js
namespace('app.a.b', 3); // window.app.a.b 值为 3
```

用`namespace`获取`window.app.a.b`的值：

```js
var b = namespace('app.a.b');  // b 的值为 3

var d = namespace('app.a.c.d'); // d 的值为 undefined

```

`app.a.c`值为`undefined`，但因为使用了`namespace`, 所以`app.a.c.d`不会报错，变量`d`的值为`undefined`。

## AMD/CMD

随着前端业务增重，代码越来越复杂，靠全局变量通信的方式开始捉襟见肘，前端急需一种更清晰、更简单的处理代码依赖的方式，将 JS 模块化的实现及规范陆续出现，其中被应用较广的模块规范有 AMD 和 CMD。

面对一种模块化方案，我们首先要了解的是：1\. 如何导出接口；2\. 如何导入接口。

### AMD

> 异步模块定义规范（AMD）制定了定义模块的规则，这样模块和模块的依赖可以被异步加载。这和浏览器的异步加载模块的环境刚好适应（浏览器同步加载模块会导致性能、可用性、调试和跨域访问等问题）。

本规范只定义了一个函数`define`，它是全局变量。

```js
/**
 * @param {string} id 模块名称
 * @param {string[]} dependencies 模块所依赖模块的数组
 * @param {function} factory 模块初始化要执行的函数或对象
 * @return {any} 模块导出的接口
 */
function define(id?, dependencies?, factory): any
```

### RequireJS

AMD 是一种异步模块规范，RequireJS 是 AMD 规范的实现。

接下来，我们用 RequireJS 重构上面的项目。

在原项目 js 文件夹下增加 require.js 文件：

```
# 项目目录:
├─ js                # js文件夹
│  ├─ ...
│  └─ require.js     # RequireJS 的 JS 库
└─  ...
```

```js
// config.js
define(function() {
  var api = 'https://github.com/ronffy';
  var config = {
    api: api,
  };
  return config;
});

// utils.js
define(['./config'], function(config) {
  var utils = {
    request() {
      console.log(config.api);
    }
  };
  return utils;
});

// main.js
require(['./utils'], function(utils) {
  utils.request();
});
```

```html
<!-- index.html  -->
<!-- ...省略其他 -->
<body>

  <script data-main="./js/main" src="./js/require.js"></script>
</body>
</html>
```

可以看到，使用 RequireJS 后，每个文件都可以作为一个模块来管理，通信方式也是以模块的形式，这样既可以清晰的管理模块依赖，又可以避免声明全局变量。

特别说明：

先有 RequireJS，后有 AMD 规范，随着 RequireJS 的推广和普及，AMD 规范才被创建出来。

### CMD和AMD

* CMD 和 AMD 一样，都是 JS 的模块化规范，也主要应用于浏览器端。<br>
* AMD 是 RequireJS 在的推广和普及过程中被创造出来。<br>
* CMD 是 SeaJS 在的推广和普及过程中被创造出来。

二者的的主要区别是 CMD 推崇依赖就近，AMD 推崇依赖前置：

```js
// AMD
// 依赖必须一开始就写好
define(['./utils'], function(utils) {
  utils.request();
});

// CMD
define(function(require) {
  // 依赖可以就近书写
  var utils = require('./utils');
  utils.request();
});
```

AMD 也支持依赖就近，但 RequireJS 作者和官方文档都是优先推荐依赖前置写法。

考虑到目前主流项目中对 AMD 和 CMD 的使用越来越少，大家对 AMD 和 CMD 有大致的认识就好，此处不再过多赘述。

随着 ES6 模块规范的出现，AMD/CMD 终将成为过去，但毋庸置疑的是，AMD/CMD 的出现，是前端模块化进程中重要的一步。

## CommonJS

前面说了， AMD、CMD 主要用于浏览器端，随着 node 诞生，服务器端的模块规范 CommonJS 被创建出来。

还是以上面介绍到的 `config.js、utils.js、main.js` 为例，看看 CommonJS 的写法:

```js
// config.js
var api = 'https://github.com/ronffy';
var config = {
  api: api,
};
module.exports = config;

// utils.js
var config = require('./config');
var utils = {
  request() {
    console.log(config.api);
  }
};
module.exports = utils;

// main.js
var utils = require('./utils');
utils.request();
console.log(global.api)
```

执行`node main.js`，`https://github.com/ronffy`被打印了出来。<br>

在 main.js 中打印`global.api`，打印结果是`undefined`。node 用`global`管理全局变量，与浏览器的`window`类似。与浏览器不同的是，浏览器中顶层作用域是全局作用域，在顶层作用域中声明的变量都是全局变量，而 node 中顶层作用域不是全局作用域，所以在顶层作用域中声明的变量非全局变量。

### module.exports和exports

我们在看 node 代码时，应该会发现，关于接口导出，有的地方使用`module.exports`，而有的地方使用`exports`，这两个有什么区别呢?

CommonJS 规范仅定义了`exports`，但`exports`存在一些问题（下面会说到），所以`module.exports`被创造了出来，它被称为 CommonJS2 。<br>

每一个文件都是一个模块，每个模块都有一个`module`对象，这个`module`对象的`exports`属性用来导出接口，外部模块导入当前模块时，使用的也是`module`对象，这些都是 node 基于 CommonJS2 规范做的处理。

```js
// a.js
var s = 'i am ronffy'
module.exports = s;
console.log(module);
```

执行`node a.js`，看看打印的`module`对象：

```
{
  exports: 'i am ronffy',
  id: '.',                                // 模块id
  filename: '/Users/apple/Desktop/a.js',  // 文件路径名称
  loaded: false,                          // 模块是否加载完成
  parent: null,                           // 父级模块
  children: [],                           // 子级模块
  paths: [ /* ... */ ],                   // 执行 node a.js 后 node 搜索模块的路径
}
```

其他模块导入该模块时：

```js
// b.js
var a = require('./a.js'); // a --> i am ronffy
```

当在 a.js 里这样写时：

```js
// a.js
var s = 'i am ronffy'
exports = s;
```

a.js 模块的`module.exports`是一个空对象。

```js
// b.js
var a = require('./a.js'); // a --> {}
```

把`module.exports`和`exports`放到“明面”上来写，可能就更清楚了：

```js
var module = {
  exports: {}
}
var exports = module.exports;
console.log(module.exports === exports); // true

var s = 'i am ronffy'
exports = s; // module.exports 不受影响
console.log(module.exports === exports); // false
```

模块初始化时，`exports`和`module.exports`指向同一块内存，`exports`被重新赋值后，就切断了跟原内存地址的关系。

所以，`exports`要这样使用：

```js
// a.js
exports.s = 'i am ronffy';

// b.js
var a = require('./a.js');
console.log(a.s); // i am ronffy
```

CommonJS 和 CommonJS2 经常被混淆概念，一般大家经常提到的 CommonJS 其实是指 CommonJS2，本文也是如此，不过不管怎样，大家知晓它们的区别和如何应用就好。

### CommonJS与AMD

CommonJS 和 AMD 都是运行时加载，换言之：都是在运行时确定模块之间的依赖关系。

二者有何不同点：

1. CommonJS 是服务器端模块规范，AMD 是浏览器端模块规范。
2. CommonJS 加载模块是同步的，即执行`var a = require('./a.js');`时，在 a.js 文件加载完成后，才执行后面的代码。AMD 加载模块是异步的，所有依赖加载完成后以回调函数的形式执行代码。
3. \[如下代码\]`fs`和`chalk`都是模块，不同的是，`fs`是 node 内置模块，`chalk`是一个 npm 包。这两种情况在 CommonJS 中才有，AMD 不支持。

```js
var fs = require('fs');
var chalk = require('chalk');
```

## UMD

> Universal Module Definition.

存在这么多模块规范，如果产出一个模块给其他人用，希望支持全局变量的形式，也符合 AMD 规范，还能符合 CommonJS 规范，能这么全能吗？<br>
是的，可以如此全能，UMD 闪亮登场。

UMD 是一种通用模块定义规范，代码大概这样(假如我们的模块名称是 myLibName):

```js
!function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    // CommonJS2
    module.exports = factory()
    // define.amd 用来判断项目是否应用 require.js。
    // 更多 define.amd 介绍，请[查看文档](https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property-)
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory)
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.myLibName = factory()
  } else {
    // 全局变量
    root.myLibName = factory()
  }
}(window, function () {
  // 模块初始化要执行的代码
});
```

UMD 解决了 JS 模块跨模块规范、跨平台使用的问题，它是非常好的解决方案。

## ES6 module

AMD 、 CMD 等都是在原有JS语法的基础上二次封装的一些方法来解决模块化的方案，ES6 module（在很多地方被简写为 ESM）是语言层面的规范，ES6 module 旨在为浏览器和服务器提供通用的模块解决方案。长远来看，未来无论是基于 JS 的 WEB 端，还是基于 node 的服务器端或桌面应用，模块规范都会统一使用 ES6 module。

### 兼容性

目前，无论是浏览器端还是 node ，都没有完全原生支持 ES6 module，如果使用 ES6 module ，可借助 [babel](https://link.segmentfault.com/?enc=OURkG%2BIY5AFtYQSvk2oXpA%3D%3D.lln5vToJ82eedPfkBshKMEyE0fom4DKUYQxzvphPFmo%3D) 等编译器。本文只讨论 ES6 module 语法，故不对 babel 或 typescript 等可编译 ES6 的方式展开讨论。

### 导出接口

CommonJS 中顶层作用域不是全局作用域，同样的，ES6 module 中，一个文件就是一个模块，文件的顶层作用域也不是全局作用域。导出接口使用`export`关键字，导入接口使用`import`关键字。

`export`导出接口有以下方式：

#### 方式1

```js
export const prefix = 'https://github.com';
export const api = `${prefix}/ronffy`;
```

#### 方式2

```js
const prefix = 'https://github.com';
const api = `${prefix}/ronffy`;
export {
  prefix,
  api,
}
```

方式1和方式2只是写法不同，结果是一样的，都是把`prefix`和`api`分别导出。

#### 方式3（默认导出）

```js
// foo.js
export default function foo() {}

// 等同于：
function foo() {}
export {
  foo as default
}
```

`export default`用来导出模块默认的接口，它等同于导出一个名为`default`的接口。配合`export`使用的`as`关键字用来在导出接口时为接口重命名。

#### 方式4（先导入再导出简写）

```js
export { api } from './config.js';

// 等同于：
import { api } from './config.js';
export {
  api
}
```

如果需要在一个模块中先导入一个接口，再导出，可以使用`export ... from 'module'`这样的简便写法。

### 导入模块接口

ES6 module 使用`import`导入模块接口。

导出接口的模块代码1：

```js
// config.js
const prefix = 'https://github.com';
const api = `${prefix}/ronffy`;
export {
  prefix,
  api,
}
```

接口已经导出，如何导入呢：

#### 方式1

```js
import { api } from './config.js';

// or
// 配合`import`使用的`as`关键字用来为导入的接口重命名。
import { api as myApi } from './config.js';
```

#### 方式2（整体导入）

```js
import * as config from './config.js';
const api = config.api;
```

将 config.js 模块导出的所有接口都挂载在`config`对象上。

#### 方式3（默认导出的导入）

```js
// foo.js
export const conut = 0;
export default function myFoo() {}

// index.js
// 默认导入的接口此处刻意命名为cusFoo，旨在说明该命名可完全自定义。
import cusFoo, { count } from './foo.js';

// 等同于：
import { default as cusFoo, count } from './foo.js';
```

`export default`导出的接口，可以使用`import name from 'module'`导入。这种方式，使导入默认接口很便捷。

#### 方式4（整体加载）

import './config.js';

这样会加载整个 config.js 模块，但未导入该模块的任何接口。

#### 方式5（动态加载模块）

上面介绍了 ES6 module 各种导入接口的方式，但有一种场景未被涵盖：动态加载模块。比如用户点击某个按钮后才弹出弹窗，弹窗里功能涉及的模块的代码量比较重，所以这些相关模块如果在页面初始化时就加载，实在浪费资源，`import()`可以解决这个问题，从语言层面实现模块代码的按需加载。

ES6 module 在处理以上几种导入模块接口的方式时都是编译时处理，所以`import`和`export`命令只能用在模块的顶层，以下方式都会报错：

```js
// 报错
if (/* ... */) {
  import { api } from './config.js';
}

// 报错
function foo() {
  import { api } from './config.js';
}

// 报错
const modulePath = './utils' + '/api.js';
import modulePath;
```

使用`import()`实现按需加载：

```js
function foo() {
  import('./config.js')
    .then(({ api }) => {

    });
}

const modulePath = './utils' + '/api.js';
import(modulePath);

```

特别说明：<br>
该功能的提议目前处于 TC39 流程的第4阶段。更多说明，请查看[TC39/proposal-dynamic-import](https://link.segmentfault.com/?enc=u61kJdRaczxbmqQREX%2FCUw%3D%3D.j9rCDxYgxXMW%2FmIMJvWZqURrkN38%2FXqha2fZM6a3RRy61j%2BPqOJa7i5wATeqRqGR)。

### CommonJS 和 ES6 module

CommonJS 和 AMD 是运行时加载，在运行时确定模块的依赖关系。<br>

ES6 module 是在编译时（`import()`是运行时加载）处理模块依赖关系，。

#### CommonJS

CommonJS 在导入模块时，会加载该模块，所谓“CommonJS 是运行时加载”，正因代码在运行完成后生成`module.exports`的缘故。当然，CommonJS 对模块做了缓存处理，某个模块即使被多次多处导入，也只加载一次。

```js
// o.js
let num = 0;
function getNum() {
  return num;
}
function setNum(n) {
  num = n;
}
console.log('o init');
module.exports = {
  num,
  getNum,
  setNum,
}

// a.js
const o = require('./o.js');
o.setNum(1);

// b.js
const o = require('./o.js');
// 注意：此处只是演示，项目里不要这样修改模块
o.num = 2;

// main.js
const o = require('./o.js');

require('./a.js');
console.log('a o.num:', o.num);

require('./b.js');
console.log('b o.num:', o.num);
console.log('b o.getNum:', o.getNum());
```

命令行执行`node main.js`，打印结果如下：

```
1. `o init`
_模块即使被其他多个模块导入，也只会加载一次，并且在代码运行完成后将接口赋值到`module.exports`属性上。_
2. `a o.num: 0`
_模块在加载完成后，模块内部的变量变化不会反应到模块的`module.exports`。_
3. `b o.num: 2`
_对导入模块的直接修改会反应到该模块的`module.exports`。_
4. `b o.getNum: 1`
_模块在加载完成后即形成一个闭包。_
```

#### ES6 module

```js
// o.js
let num = 0;
function getNum() {
  return num;
}
function setNum(n) {
  num = n;
}
console.log('o init');
export {
  num,
  getNum,
  setNum,
}

// main.js
import { num, getNum, setNum } from './o.js';

console.log('o.num:', num);
setNum(1);

console.log('o.num:', num);
console.log('o.getNum:', getNum());
```

我们增加一个 index.js 用于在 node 端支持 ES6 module：

```js
// index.js
require("@babel/register")({
  presets: ["@babel/preset-env"]
});

module.exports = require('./main.js')
```

命令行执行`npm install @babel/core @babel/register @babel/preset-env -D`安装 ES6 相关 npm 包。

命令行执行`node index.js`，打印结果如下：

```
1. `o init`
_模块即使被其他多个模块导入，也只会加载一次。_
2. `o.num: 0`
3. `o.num: 1`
_编译时确定模块依赖的 ES6 module，通过`import`导入的接口只是值的引用，所以`num`才会有两次不同打印结果。_
4. `o.getNum: 1`
```

对于打印结果3，知晓其结果，在项目中注意这一点就好。这块会涉及到“Module Records（模块记录）”、“module instance（模快实例）” “linking（链接）”等诸多概念和原理，大家可查看[ES modules: A cartoon deep-dive](https://link.segmentfault.com/?enc=hJYZAxC5vGU2b7y9DswrNw%3D%3D.GLzrq10c45xH5q5ft4hV%2FfypqEagM9x1KX5sfe6PEYfk0n%2BDoqMPVqv23r5OHj1%2FPPpkj7AY0cgIX1dO%2B%2BNsMtCuUx27jMNt9Dq1LUmiBgs%3D)进行深入的研究，本文不再展开。

ES6 module 是编译时加载（或叫做“静态加载”），利用这一点，可以对代码做很多之前无法完成的优化：

1. 在开发阶段就可以做导入和导出模块相关的代码检查。
2. 结合 Webpack、Babel 等工具可以在打包阶段移除上下文中未引用的代码（dead-code），这种技术被称作“tree shaking”，可以极大的减小代码体积、缩短程序运行时间、提升程序性能。

</details>

## 172. 遍历数组的方式有哪些？ {#question-914e2cac-b426-467e-b61c-e0987031ea84}

> 难度：2 · 类型：QA

### 题目要点

1. **for循环**：这是最传统的循环语句，性能较好，但还可以通过使用临时变量缓存数组长度来优化。
2. **forEach**：数组自带的遍历方法，性能比普通for循环弱，常用于遍历数组元素。
3. **for...in**：用于遍历对象的属性，包括继承的属性，但性能较低。
4. **for...of**：ES6引入的方法，用于遍历可迭代对象，如数组，但不能遍历对象。
5. **map**：返回一个新数组，其中包含通过提供函数处理每个元素后的新值。
6. **every**：如果数组中的每个元素都满足测试函数，则返回true。
7. **some**：如果数组中至少有一个元素满足测试函数，则返回true。
8. **reduce**：对数组中的每个元素执行一个由你提供的reducer函数，将其结果汇总为单个返回值。
9. **filter**：返回一个新数组，包含通过提供函数的测试的所有元素。

<details>
<summary>参考答案</summary>

## 数组遍历的方法

### for

**标准的for循环语句，也是最传统的循环语句**

```js
var arr = [1,2,3,4,5]
for(var i=0;i<arr.length;i++){
  console.log(arr[i])
}
```

最简单的一种遍历方式，也是使用频率最高的，性能较好，但还能优化

**优化版for循环语句**

```js
var arr = [1,2,3,4,5]
for(var i=0,len=arr.length;i<len;i++){
  console.log(arr[i])
}
```

使用临时变量，将长度缓存起来，避免重复获取数组长度，尤其是当数组长度较大时优化效果才会更加明显。

**这种方法基本上是所有循环遍历方法中性能最高的一种**

### forEach

**普通forEach**

对数组中的每一元素运行给定的函数,没有返回值，常用来遍历元素

```js
var arr5 = [10,20,30]
var result5 = arr5.forEach((item,index,arr)=>{
    console.log(item)
})
console.log(result5)
/*
10
20
30
undefined   该方法没有返回值
*/
```

**数组自带的foreach循环，使用频率较高，实际上性能比普通for循环弱**

**原型forEach**

由于foreach是Array型自带的，对于一些非这种类型的，无法直接使用(如NodeList)，所以才有了这个变种，使用这个变种可以让类似的数组拥有foreach功能。

```js
const nodes = document.querySelectorAll('div')
Array.prototype.forEach.call(nodes,(item,index,arr)=>{
  console.log(item)
})
```

**实际性能要比普通foreach弱**

### for...in

任意顺序遍历一个对象的除[Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)以外的[可枚举](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)属性，包括继承的可枚举属性。

一般常用来遍历对象，包括非整数类型的名称和继承的那些原型链上面的属性也能被遍历。像 Array和 Object使用内置构造函数所创建的对象都会继承自Object.prototype和String.prototype的不可枚举属性就不能遍历了.

```js
var arr = [1,2,3,4,5]
for(var i in arr){
  console.log(i,arr[i])
}  //这里的i是对象属性，也就是数组的下标
/**
0 1
1 2
2 3
3 4
4 5 **/
```

**大部分人都喜欢用这个方法，但它的性能却不怎么好**

### for...of（不能遍历对象）

> 在可迭代对象（具有 iterator 接口）（Array，Map，Set，String，arguments）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句，不能遍历对象

```js
let arr=["前端","面试题宝典","真好用"];
    for (let item of arr){
        console.log(item)
    }

//遍历对象
let person={name:"前端面试题宝典",age:18,city:"上海"}
for (let item of person){
  console.log(item)
}
// 我们发现它是不可以的 我们可以搭配Object.keys使用
for(let item of Object.keys(person)){
    console.log(person[item])
}
// 南玖 18 上海
```

这种方式是es6里面用到的，性能要好于forin，但仍然比不上普通for循环

### map

> map: 只能遍历数组，不能中断，返回值是修改后的数组。

```js
let arr=[1,2,3];
const res = arr.map(item=>{
  return item+1
})
console.log(res) //[2,3,4]
console.log(arr) // [1,2,3]
```

### every

对数组中的每一运行给定的函数，如果该函数对每一项都返回true,则该函数返回true

````js
var arr = [10,30,25,64,18,3,9]
var result = arr.every((item,index,arr)=>{
      return item>3
})
console.log(result)  //false
````

### some

对数组中的每一运行给定的函数，如果该函数有一项返回true,就返回true，所有项返回false才返回false

````js
var arr2 = [10,20,32,45,36,94,75]
var result2 = arr2.some((item,index,arr)=>{
    return item<10
})
console.log(result2)  //false
````

### reduce

`reduce()`方法对数组中的每个元素执行一个由你提供的reducer函数（升序执行），将其结果汇总为单个返回值

```js
const array = [1,2,3,4]
const reducer = (accumulator, currentValue) => accumulator + currentValue;

// 1 + 2 + 3 + 4
console.log(array1.reduce(reducer));
```

### filter

对数组中的每一运行给定的函数，会返回满足该函数的项组成的数组

````js
// filter  返回满足要求的数组项组成的新数组
var arr3 = [3,6,7,12,20,64,35]
var result3 = arr3.filter((item,index,arr)=>{
    return item > 3
})
console.log(result3)  //[6,7,12,20,64,35]
````

## 性能测试

### 工具测试

使用工具测试[性能分析](http://tools.jb51.net/aideddesign/js_bianli)结果如下图所示

![性能测试1.png](https://static.ecool.fun//article/c6bf85bb-2291-44b8-9bf1-702d01ebe074.jpeg)

### 手动测试

我们也可以自己用代码测试：

```js
//测试函数
function clecTime(fn,fnName){
        const start = new Date().getTime()
        if(fn) fn()
        const end = new Date().getTime()
        console.log(`${fnName}执行耗时:${end-start}ms`)
}

function forfn(){
  let a = []
  for(var i=0;i<arr.length;i++){
    // console.log(i)
    a.push(arr[i])
  }
}
clecTime(forfn, 'for')   //for执行耗时:106ms

function forlenfn(){
  let a = []
  for(var i=0,len=arr.length;i<len;i++){
    a.push(arr[i])
  }
}
clecTime(forlenfn, 'for len')   //for len执行耗时:95ms

function forEachfn(){
  let a = []
  arr.forEach(item=>{
    a.push[item]
  })
}
clecTime(forEachfn, 'forEach')   //forEach执行耗时:201ms

function forinfn(){
  let a = []
  for(var i in arr){
    a.push(arr[i])
  }
}
clecTime(forinfn, 'forin') //forin执行耗时:2584ms (离谱)

function foroffn(){
  let a = []
  for(var i of arr){
    a.push(i)
  }
}
clecTime(foroffn, 'forof') //forof执行耗时:221ms

//  ...其余可自行测试
```

### 结果分析

经过工具与手动测试发现，结果基本一致，数组遍历各个方法的速度：**传统的for循环最快，for-in最慢**

> for-len `>` for ` > ` for-of ` > ` forEach  ` > ` map ` > ` for-in

#### javascript原生遍历方法的建议用法：

- 用`for`循环遍历数组
- 用`for...in`遍历对象
- 用`for...of`遍历类数组对象（ES6）
- 用`Object.keys()`获取对象属性名的集合

####  为何for… in会慢？

因为`for … in`语法是第一个能够迭代对象键的JavaScript语句，循环对象键（{}）与在数组（[]）上进行循环不同，引擎会执行一些额外的工作来跟踪已经迭代的属性。因此不建议使用`for...in`来遍历数组

</details>

## 173. 说说你对 new.target 的理解 {#question-838b4eda-1f58-4215-9bb5-3e59db973286}

> 难度：1 · 类型：QA

### 题目要点

`new.target` 属性是 JavaScript 中一个特殊的属性，它用于检测函数或构造函数是否是通过 `new` 运算符被调用的。这个属性在通过 `new` 运算符初始化的函数或构造方法中，会返回一个指向构造方法或函数的引用。如果函数不是通过 `new` 运算符被调用的，`new.target` 的值将是 `undefined`。

利用 `new.target`，我们可以编写代码来检查一个函数是否作为构造函数被 `new` 调用，从而确保函数的调用方式符合预期。

<details>
<summary>参考答案</summary>

`new.target` 属性是 JavaScript 中一个特殊的属性，它用于检测函数或构造函数是否是通过 `new` 运算符被调用的。这个属性在通过 `new` 运算符初始化的函数或构造方法中，会返回一个指向构造方法或函数的引用。如果函数不是通过 `new` 运算符被调用的，`new.target` 的值将是 `undefined`。
利用 `new.target`，我们可以编写代码来检查一个函数是否作为构造函数被 `new` 调用，从而确保函数的调用方式符合预期。例如，如果我们有一个函数，它应该总是作为构造函数被调用，那么我们可以在函数体内部使用 `new.target` 来抛出一个错误，如果它没有被以正确的方式调用。
```javascript
function Foo() {
  if (!new.target) {
    throw new Error("Foo() must be called with new");
  }
  console.log("Foo instantiated with new");
}
// 如果直接调用函数，会抛出错误
try {
  Foo();
} catch (error) {
  console.log(error.message); // 输出: Foo() must be called with new
}
// 如果使用 new 运算符调用函数，则不会抛出错误
try {
  new Foo();
} catch (error) {
  console.log(error.message); // 不会抛出错误
}
```
在上述代码中，当 `Foo()` 函数被直接调用时，由于 `new.target` 是 `undefined`，因此会抛出一个错误，提示必须使用 `new` 运算符来调用 `Foo()`。而当使用 `new` 运算符调用时，`new.target` 指向 `Foo` 函数本身，因此不会抛出错误，而是执行了 `console.log` 语句。

</details>

## 174. ​arguments 这种类数组，如何遍历类数组？ {#question-78f23cb3-8ee7-4f02-a995-e74ce3ad3836}

> 难度：1 · 类型：QA

### 题目要点

在 JavaScript 中，`arguments` 对象是一个类数组对象，它提供了访问函数参数的索引和长度。虽然它不是真正的数组，但可以通过一些方法来遍历它。

以下是几种遍历 `arguments` 对象的方法：

1. **使用 for 循环**：

   ```javascript
   function example() {
     for (var i = 0; i < arguments.length; i++) {
       console.log(arguments[i]);
     }
   }
   example(1, 2, 3);
   ```

2. **使用 forEach 方法**：
   首先将 `arguments` 对象转换为数组，然后使用 `forEach` 方法遍历。

   ```javascript
   function example() {
     Array.prototype.forEach.call(arguments, function(value, index) {
       console.log(value);
     });
   }
   example(1, 2, 3);
   ```

3. **使用 for...of 循环**：
   `for...of` 循环可以直接遍历类数组对象。

   ```javascript
   function example() {
     for (let value of arguments) {
       console.log(value);
     }
   }
   example(1, 2, 3);
   ```

4. **使用 Object.keys()**：
   使用 `Object.keys()` 方法获取 `arguments` 对象的键（索引），然后遍历这些键。

   ```javascript
   function example() {
     Object.keys(arguments).forEach(function(key) {
       console.log(arguments[key]);
     });
   }
   example(1, 2, 3);
   ```

5. **使用 Array.from()**：
   将 `arguments` 对象转换为真正的数组，然后使用数组的方法进行遍历。

   ```javascript
   function example() {
     Array.from(arguments).forEach(function(value) {
       console.log(value);
     });
   }
   example(1, 2, 3);
   ```

<details>
<summary>参考答案</summary>

## 类数组对象

所谓的类数组对象:

>拥有一个 length 属性和若干索引属性的对象

举个例子：

```js
var array = ['name', 'age', 'sex'];

var arrayLike = {
    0: 'name',
    1: 'age',
    2: 'sex',
    length: 3
}
```

即便如此，为什么叫做类数组对象呢？

那让我们从读写、获取长度、遍历三个方面看看这两个对象。

## 读写

```js
console.log(array[0]); // name
console.log(arrayLike[0]); // name

array[0] = 'new name';
arrayLike[0] = 'new name';
```

## 长度

```js
console.log(array.length); // 3
console.log(arrayLike.length); // 3
```

## 遍历

```js
for(var i = 0, len = array.length; i < len; i++) {
   ……
}
for(var i = 0, len = arrayLike.length; i < len; i++) {
    ……
}
```

是不是很像？

那类数组对象可以使用数组的方法吗？比如：

```js
arrayLike.push('4');
```

然而上述代码会报错: arrayLike.push is not a function

所以终归还是类数组呐……

## 调用数组方法

如果类数组就是任性的想用数组的方法怎么办呢？

既然无法直接调用，我们可以用 Function.call 间接调用：

```js
var arrayLike = {0: 'name', 1: 'age', 2: 'sex', length: 3 }

Array.prototype.join.call(arrayLike, '&'); // name&age&sex

Array.prototype.slice.call(arrayLike, 0); // ["name", "age", "sex"]
// slice可以做到类数组转数组

Array.prototype.map.call(arrayLike, function(item){
    return item.toUpperCase();
});
// ["NAME", "AGE", "SEX"]
```

## 类数组转数组

在上面的例子中已经提到了一种类数组转数组的方法，再补充三个：

```js
var arrayLike = {0: 'name', 1: 'age', 2: 'sex', length: 3 }
// 1. slice
Array.prototype.slice.call(arrayLike); // ["name", "age", "sex"]
// 2. splice
Array.prototype.splice.call(arrayLike, 0); // ["name", "age", "sex"]
// 3. ES6 Array.from
Array.from(arrayLike); // ["name", "age", "sex"]
// 4. apply
Array.prototype.concat.apply([], arrayLike)
```

那么为什么会讲到类数组对象呢？以及类数组有什么应用吗？

要说到类数组对象，Arguments 对象就是一个类数组对象。在客户端 JavaScript 中，一些 DOM 方法(document.getElementsByTagName()等)也返回类数组对象。

## Arguments对象

接下来重点讲讲 Arguments 对象。

Arguments 对象只定义在函数体中，包括了函数的参数和其他属性。在函数体中，arguments 指代该函数的 Arguments 对象。

举个例子：

```js
function foo(name, age, sex) {
    console.log(arguments);
}

foo('name', 'age', 'sex')
```

打印结果如下：

![arguments](https://static.ecool.fun//article/13abe176-2fb7-4838-aa09-6260cfe5dcb9.png)

我们可以看到除了类数组的索引属性和length属性之外，还有一个callee属性，接下来我们一个一个介绍。

## length属性

Arguments对象的length属性，表示实参的长度，举个例子：

```js
function foo(b, c, d){
    console.log("实参的长度为：" + arguments.length)
}

console.log("形参的长度为：" + foo.length)

foo(1)

// 形参的长度为：3
// 实参的长度为：1
```

## callee属性

Arguments 对象的 callee 属性，通过它可以调用函数自身。

讲个闭包经典面试题使用 callee 的解决方法：

```js
var data = [];

for (var i = 0; i < 3; i++) {
    (data[i] = function () {
       console.log(arguments.callee.i)
    }).i = i;
}

data[0]();
data[1]();
data[2]();

// 0
// 1
// 2
```

接下来讲讲 arguments 对象的几个注意要点：

## arguments 和对应参数的绑定

```js
function foo(name, age, sex, hobbit) {

    console.log(name, arguments[0]); // name name

    // 改变形参
    name = 'new name';

    console.log(name, arguments[0]); // new name new name

    // 改变arguments
    arguments[1] = 'new age';

    console.log(age, arguments[1]); // new age new age

    // 测试未传入的是否会绑定
    console.log(sex); // undefined

    sex = 'new sex';

    console.log(sex, arguments[2]); // new sex undefined

    arguments[3] = 'new hobbit';

    console.log(hobbit, arguments[3]); // undefined new hobbit

}

foo('name', 'age')
```

传入的参数，实参和 arguments 的值会共享，当没有传入时，实参与 arguments 值不会共享

除此之外，以上是在非严格模式下，如果是在严格模式下，实参和 arguments 是不会共享的。

## 传递参数

将参数从一个函数传递到另一个函数

```js
// 使用 apply 将 foo 的参数传递给 bar
function foo() {
    bar.apply(this, arguments);
}
function bar(a, b, c) {
   console.log(a, b, c);
}

foo(1, 2, 3)
```

## 强大的ES6

使用ES6的 ... 运算符，我们可以轻松转成数组。

```js
function func(...arguments) {
    console.log(arguments); // [1, 2, 3]
}

func(1, 2, 3);
```

## 应用

arguments的应用其实很多，在下个系列，也就是 JavaScript 专题系列中，我们会在 jQuery 的 extend 实现、函数柯里化、递归等场景看见 arguments 的身影。这篇文章就不具体展开了。

如果要总结这些场景的话，暂时能想到的包括：

1. 参数不定长
2. 函数柯里化
3. 递归调用
4. 函数重载
...

</details>

## 175. 连续 bind()多次，输出的值是什么？ {#question-b9bab51e-ab87-400a-9284-b996e853ecec}

> 难度：2 · 类型：QA

```js
var bar = function(){
    console.log(this.x);
}
var foo = {
    x:3
}
var sed = {
    x:4
}
var func = bar.bind(foo).bind(sed);
func(); //?

var fiv = {
    x:5
}
var func = bar.bind(foo).bind(sed).bind(fiv);
func(); //?
```

### 题目要点

两次都输出 **3**。

<details>
<summary>参考答案</summary>

两次都输出 **3**。

在Javascript中，多次 `bind()` 是无效的。

更深层次的原因， `bind()` 的实现，相当于使用函数在内部包了一个 `call` / `apply` ，第二次 `bind()` 相当于再包住第一次 `bind()` ,故第二次以后的 `bind` 是无法生效的。

</details>

## 176. new fn与new fn()有什么区别吗？ {#question-f2e93a54-e57f-4c52-bd8c-9b9474c437ac}

> 难度：1 · 类型：QA

### 题目要点

1. **带括号的情况**：
   - `new Parent()`：这是最常见的用法。调用 `Parent` 构造函数并返回一个新的 `Parent` 实例。
   - `new Parent().num`：这首先调用 `Parent` 构造函数，返回一个 `Parent` 实例，然后访问这个实例的 `num` 属性。

2. **不带括号的情况**：
   - `new Parent`：这在大多数情况下是有效的，因为 JavaScript 的解析器会将 `new Parent` 视为 `new (Parent())`。也就是说，它首先调用 `Parent` 函数（不带参数），然后使用返回的结果作为构造函数来创建新实例。
   - `new Parent` 和 `new Parent()` 通常在行为上是一致的，但具体取决于构造函数的实现。

3. **错误用法**：
   - `new Parent.num`：这是一个错误用法。这里的问题是 `Parent.num` 首先被解析，如果 `Parent` 上没有 `num` 属性，就会返回 `undefined`。然后 `new` 操作符尝试使用 `undefined` 作为构造函数，这将导致错误。

4. **优先级问题**：
   - `new Parent().num` 和 `(new Parent()).num` 是等价的，都是先创建 `Parent` 实例，然后访问其 `num` 属性。
   - `new Parent.num` 实际上是 `new (Parent.num)`，因为 `Parent.num` 首先被解析，然后 `new` 操作符尝试使用这个结果作为构造函数。

<details>
<summary>参考答案</summary>

用 `new` 创建构造函数的实例时，通常情况下 `new` 的构造函数后面需要带括号（譬如：`new Parent()`）。

有些情况下`new`的构造函数后带括号和不带括号的情况一致，譬如：

```js
function Parent(){
  this.num = 1;
}
console.log(new Parent());//输出Parent对象：{num:1}
console.log(new Parent);//输出Parent对象：{num:1}
```

但有些情况下new的构造函数后带括号和不带括号的情况并不一致，譬如：

```js
function Parent(){
  this.num = 1;
}
console.log(new Parent().num);//1
console.log(new Parent.num);//报错
```

结果分析：

从报错信息来看，`new Parent.num`执行顺序是这样的：先执行`Parent.num`，此时返回结果为`undefined`；后执行`new`，因`new`后面必须跟构造函数，所以`new undefined`会报错。

`new Parent().num`相当于`(new Parent()).num`，所以结果返回1。

从结果来看，`new Parent.num`代码相当于`new (Parent.num)；`，`new Parent().num`相当于`(new Parent()).num`。由此看来 `new` 的构造函数后跟括号优先级会提升。

</details>

## 177. Object与Map有什么区别？ {#question-7621c335-6645-4da0-bd71-cb81fe106f8f}

> 难度：1 · 类型：QA

### 题目要点

Object与Map的区别如下：

1. **键的类型**：Object的键只能是字符串或Symbol，而Map的键可以是任意类型。

2. **顺序**：Object的属性顺序在ES6之前是不确定的，在ES6及以后虽然有所改进，但通常还是认为是无序的。而Map保持键值对的插入顺序。

3. **大小**：Object的大小（键值对数量）需要手动计算，Map有`size`属性直接获取。

4. **操作**：Object通过点（`.`）或中括号（`[]`）访问属性，Map通过`get(key)`、`set(key, value)`等方法操作键值对。

5. **迭代**：Object需要通过函数或方法（如`Object.keys()`）获取可迭代对象，Map直接支持`for...of`循环遍历。

6. **JSON序列化**：Object可以直接被`JSON.stringify()`序列化，Map需要转换成数组等可序列化格式。

7. **性能**：在频繁增删键值对的场景下，Map通常表现更好；对于静态数据，Object可能更快。

这些区别使得Object和Map在JavaScript中有不同的应用场景：Object更适合用于存储静态或简单的键值对数据，而Map则更适用于需要保持顺序或键类型多样的复杂数据结构。

<details>
<summary>参考答案</summary>

### 概念

*   Object

在ECMAScript中，`Object`是一个特殊的对象。它本身是一个顶级对象，同时还是一个构造函数，可以通过它（如：`new Object()`）来创建一个对象。我们可以认为JavaScript中所有的对象都是`Object`的一个实例，对象可以用字面量的方法const obj = {}即可声明。<br>

*   Map

`Object`本质上是键值对的集合（Hash 结构），但是传统上只能用字符串当作键，这给它的使用带来了很大的限制。

为了解决这个问题，`ES6` 提供了 `Map` 数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。

也就是说，Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应，是一种更完善的 `Hash` 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适。

通过 `const m = new Map();` 即可得到一个map实例。

### 访问

map: 通过map.get(key)方法去属性, 不存在则返回undefined

object: 通过obj.a或者obj\['a'\]去访问一个属性, 不存在则返回undefined

### 赋值

map: 通过map.set去设置一个值，key可以是任意类型

object: 通过object.a = 1或者object\['a'\] = 1，去赋值，key只能是字符串，数字或symbol

### 删除

map: 通过map.delete去删除一个值，试图删除一个不存在的属性会返回false

object: 通过delete操作符才能删除对象的一个属性，诡异的是，即使对象不存在该属性，删除也返回true，当然可以通过**Reflect.deleteProperty(target, prop)** 删除不存在的属性还是会返回true。

    var obj = {}; // undefined
    delete obj.a // true

### 大小

map: 通过map.size即可快速获取到内部元素的总个数

object: 需要通过Object.keys的转换才能将其转换为数组，再通过数组的length方法去获得或者使用Reflect.ownKeys(obj)也可以获取到keys的集合

### 迭代

map: 拥有迭代器，可以通过`for-of`、`forEach`去直接迭代元素，而且遍历顺序是确定的

object: 并没有实现迭代器，需要自行实现，不实现只能通过for-in循环去迭代，遍历顺序是不确定的

### 使用场景

1.  如果只需要简单的存储key-value的数据，并且key不需要存储复杂类型的，直接用对象
2.  如果该对象必须通过JSON转换的，则只能用对象，目前暂不支持Map
3.  map的阅读性更好，所有操作都是通过api形式去调用，更有编程体验

</details>

## 178. cookie 的有效时间设置为 0 会怎么样 {#question-94393532-0d43-407f-8168-73bc6fd523a3}

> 难度：1 · 类型：QA

### 题目要点

Cookie过期时间设置为0，表示跟随系统默认，其销毁与Session销毁时间相同，会在浏览器关闭后删除。

<details>
<summary>参考答案</summary>

Cookie过期时间设置为0，表示跟随系统默认，其销毁与Session销毁时间相同，会在浏览器关闭后删除。

</details>

## 179. postMessage 有哪些使用场景？ {#question-c6530c46-d02f-40b2-8e6e-c11a6daf3f12}

> 难度：2 · 类型：QA

### 题目要点

postMessage的使用场景主要包括以下几个方面：

1. **跨域通信**：postMessage是HTML5引入的API，它允许来自不同源的脚本采用异步方式进行有效的通信。这意味着它可以在不同文档（如页面、iframe或弹出窗口）之间进行跨域消息传递，从而解决了传统跨域通信的限制。这是postMessage最为常见的使用场景之一。

2. **Web Worker通信**：在JavaScript中，Web Worker提供了一种在后台线程中运行脚本的方法，以避免复杂或耗时的计算阻塞用户界面。通过postMessage，主线程可以与Web Worker之间发送和接收消息，实现数据的交互和通信。

3. **iframe与父页面通信**：在Web开发中，iframe经常用于嵌入外部页面或内容。通过postMessage，iframe可以安全地向父页面发送消息，父页面也可以向iframe发送消息，实现两者之间的数据交换和通信。

4. **页面与浏览器插件通信**：如果Web页面需要与浏览器插件进行通信，postMessage同样是一个有效的解决方案。通过postMessage，页面可以向插件发送消息，插件也可以向页面发送消息，实现两者之间的数据传递和功能调用。

5. **跨窗口通信**：在Web应用中，可能需要在不同浏览器窗口或标签页之间进行通信。postMessage允许这些窗口通过发送和接收消息来实现数据的共享和状态的同步。

<details>
<summary>参考答案</summary>

# window.postMessage 定义

`window.postMessage()` 方法可以安全地实现跨源通信。`window.postMessage()` 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全

## 用途
可用于两个不同的Ifrom（不同源） 之间的通讯

## [语法](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage#syntax "Permalink to 语法")

```
otherWindow.postMessage(message, targetOrigin, [transfer]);
```

## 参数说明
-   `data`

    从其他 window 中传递过来的对象。

-   `origin`

    调用 `postMessage`  时消息发送方窗口的 [origin](https://developer.mozilla.org/en-US/docs/Origin "This is a link to an unwritten page") . 这个字符串由 协议、“://“、域名、“ : 端口号”拼接而成。例如 “`https://example.org` (隐含端口 `443`)”、“`http://example.net` (隐含端口 `80`)”、“`http://example.com:8080`”。请注意，这个origin不能保证是该窗口的当前或未来origin，因为postMessage被调用后可能被导航到不同的位置。

-   `source`

    对发送消息的[窗口](https://developer.mozilla.org/en-US/docs/Web/API/Window)对象的引用; 您可以使用此来在具有不同origin的两个窗口之间建立双向通信。

## 例子

### 子框架传递信息

```
<script>

// 子框架向父框架发送信息

function goParentIfromPostMessage(msg,parentUrl){

    var parentUrl = window.parent.location.origin;

        window.onload=function(){

        window.parent.postMessage(msg,parentUrl);

        }
    }
 }

    goParentIfromPostMessage('msgStr',parentIfromUrl)

</script>

```

### 父框架接收端

```
<script>

        window.addEventListener('message',function(e){

            console.log(e.origin,e.data);

            console.log(e.data);

        })

</script>

 ```
这样即可以实现简单的框架跨域通信，但是会有一些安全问题

## [安全问题](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage#security_concerns "Permalink to 安全问题")

**如果您不希望从其他网站接收message，请不要为message事件添加任何事件侦听器。** 这是一个完全万无一失的方式来避免安全问题。

如果您确实希望从其他网站接收message，请**始终使用origin和source属性验证发件人的身份**。 任何窗口（包括例如http://evil.example.com）都可以向任何其他窗口发送消息，并且您不能保证未知发件人不会发送恶意消息。 但是，验证身份后，您仍然应该**始终验证接收到的消息的语法**。 否则，您信任只发送受信任邮件的网站中的安全漏洞可能会在您的网站中打开跨网站脚本漏洞。

**当您使用postMessage将数据发送到其他窗口时，始终指定精确的目标origin，而不是*。** 恶意网站可以在您不知情的情况下更改窗口的位置，因此它可以拦截使用postMessage发送的数据。

### [示例](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage#example "Permalink to 示例")

```
/*
 * A窗口的域名是<http://example.com:8080>，以下是A窗口的script标签下的代码：
 */

var popup = window.open(...popup details...);

// 如果弹出框没有被阻止且加载完成

// 这行语句没有发送信息出去，即使假设当前页面没有改变location（因为targetOrigin设置不对）
popup.postMessage("The user is 'bob' and the password is 'secret'",
                  "https://secure.example.net");

// 假设当前页面没有改变location，这条语句会成功添加message到发送队列中去（targetOrigin设置对了）
popup.postMessage("hello there!", "http://example.org");

function receiveMessage(event)
{
  // 我们能相信信息的发送者吗?  (也许这个发送者和我们最初打开的不是同一个页面).
  if (event.origin !== "http://example.org")
    return;

  // event.source 是我们通过window.open打开的弹出页面 popup
  // event.data 是 popup发送给当前页面的消息 "hi there yourself!  the secret response is: rheeeeet!"
}
window.addEventListener("message", receiveMessage, false);
```

```
/*
 * 弹出页 popup 域名是<http://example.org>，以下是script标签中的代码:
 */

//当A页面postMessage被调用后，这个function被addEventListener调用
function receiveMessage(event)
{
  // 我们能信任信息来源吗？
  if (event.origin !== "http://example.com:8080")
    return;

  // event.source 就当前弹出页的来源页面
  // event.data 是 "hello there!"

  // 假设你已经验证了所受到信息的origin (任何时候你都应该这样做), 一个很方便的方式就是把event.source
  // 作为回信的对象，并且把event.origin作为targetOrigin
  event.source.postMessage("hi there yourself!  the secret response " +
                           "is: rheeeeet!",
                           event.origin);
}

window.addEventListener("message", receiveMessage, false);
```

</details>

## 180. async/await 怎么进行错误处理？ {#question-deb034d1-2a96-45b4-8576-132f2af9c797}

> 难度：2 · 类型：QA

### 题目要点

`async/await`进行错误处理的方式如下：

`async/await`允许你以几乎同步的方式编写异步代码，使得异步操作的流程更加清晰易懂。在`async`函数内部，你可以使用`await`来等待`Promise`的解决或拒绝。如果`Promise`被拒绝（即异步操作失败），`await`会抛出一个错误，这个错误可以像处理同步代码中的错误一样，通过外部的`try...catch`语句来捕获和处理。

具体来说，当你在`async`函数内部使用`await`等待一个`Promise`时，你应该将这个`await`调用包裹在`try...catch`语句中。这样，如果`Promise`被拒绝，`catch`块就会捕获到这个错误，允许你在其中进行错误处理，比如重试操作、记录日志、给用户显示错误消息等。

这种错误处理方式使得异步代码的错误处理变得更加直观和一致，减少了回调地狱（Callback Hell）的困扰，提高了代码的可读性和可维护性。

最后，需要注意的是，由于`async`函数总是返回一个`Promise`，因此如果在一个更外层的异步函数或事件处理器中调用这个`async`函数，你也可以在那个外层函数的`try...catch`中捕获到由这个`async`函数抛出的错误（如果它没有在内部被捕获的话）。这提供了更灵活的错误处理机制。

<details>
<summary>参考答案</summary>

一般情况下 async/await 在错误处理方面，主要使用 try/catch，像这样

```js
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is me')
        }, 1000)
    })
}

(async () => {
    try {
        const data = await fetchData()
        console.log('data is ->', data)
    } catch(err) {
        console.log('err is ->', err)
    }
})()

```

这么看，感觉倒是没什么问题，如果是这样呢？有多个异步操作，需要对每个异步返回的 error 错误状态进行不同的处理，以下是示例代码

```js
const fetchDataA = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is A')
        }, 1000)
    })
}

const fetchDataB = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is B')
        }, 1000)
    })
}

const fetchDataC = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is C')
        }, 1000)
    })
}

(async () => {
    try {
        const dataA = await fetchDataA()
        console.log('dataA is ->', dataA)
    } catch(err) {
        console.log('err is ->', err)
    }

    try {
        const dataB = await fetchDataB()
        console.log('dataB is ->', dataB)
    } catch(err) {
        console.log('err is ->', err)
    }

    try {
        const dataC = await fetchDataC()
        console.log('dataC is ->', dataC)
    } catch(err) {
        console.log('err is ->', err)
    }
})()

```

这样写代码里充斥着 try/catch，有代码洁癖的你能忍受的了吗？这时可能会想到只用一个 try/catch。

```js
// ... 这里 fetch 函数省略

(async () => {
    try {
        const dataA = await fetchDataA()
        console.log('dataA is ->', dataA)
        const dataB = await fetchDataB()
        console.log('dataB is ->', dataB)
        const dataC = await fetchDataC()
        console.log('dataC is ->', dataC)
    } catch(err) {
        console.log('err is ->', err)
        // 难道要定义 err 类型，然后判断吗？？
        /**
         * if (err.type === 'dataA') {
         *  console.log('dataA err is', err)
         * }
         * ......
         * */
    }
})()

```

如果是这样写只会增加编码的复杂度，而且要多写代码，这个时候就应该想想怎么优雅的解决，async/await 本质就是 promise 的语法糖，既然是 promise 那么就可以使用 then 函数了

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    const data = await fetchData().then(data => data ).catch(err => err)
    console.log(data)
})()

```

在上面写法中，如果 fetchData 返回 resolve 正确结果时，data 是我们要的结果，如果是 reject 了，发生错误了，那么 data 是错误结果，这显然是行不通的，再对其完善。

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    const [err, data] = await fetchData().then(data => [null, data] ).catch(err => [err, null])
    console.log('err', err)
    console.log('data', data)
    // err null
    // data fetch data is me
})()

```

这样是不是好很多了呢，但是问题又来了，不能每个 await 都写这么长，写着也不方便也不优雅，再优化一下

```js
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    // 抽离成公共方法
    const awaitWrap = (promise) => {
        return promise
            .then(data => [null, data])
            .catch(err => [err, null])
    }

    const [err, data] = await awaitWrap(fetchData())
    console.log('err', err)
    console.log('data', data)
    // err null
    // data fetch data is me
})()

```

将对 await 处理的方法抽离成公共的方法，在使用 await 调用 awaitWrap 这样的方法是不是更优雅了呢。如果使用 typescript 实现大概是这个样子

```ts
function awaitWrap<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, null]>(err => [err, null])
}
```

</details>

## 181. 将数组的length设置为0，取第一个元素会返回什么？ {#question-cbdbe075-a81e-4c8b-a264-1ffb95a7ee49}

> 难度：0.5 · 类型：QA

### 题目要点

设置 `length = 0` 会清空数组，所以会返回 `undefined`

<details>
<summary>参考答案</summary>

设置 `length = 0` 会清空数组，所以会返回 `undefined`

</details>

## 182. CSS动画和JS实现的动画分别有哪些优缺点？ {#question-0139d2e8-67c1-40f9-868e-5f277e223629}

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

## 183. 前端实现动画有哪些方式？ {#question-8b516cb7-fa94-4d68-929f-d3c628d1b7a2}

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

## 184. 写一个返回数据类型的函数，要求自定义的类实例化的对象返回定义的类名 {#question-c25081e4-6374-4e78-abec-1a31999e528e}

> 难度：2 · 类型：QA

### 题目要点

```js
function myTypeof(data) {
    var toString = Object.prototype.toString;
    var dataType = data instanceof Element ? "Element" : toString.call(data).replace(/\[object\s(.+)\]/, "$1")

    if(dataType === 'Object'){
        return data.constructor.name
    }

    return dataType
};
```

<details>
<summary>参考答案</summary>

Javascript是一门动态类型的语言，一个变量从声明到最后使用，可能经过了很多个函数，而数据类型也会发生改变，那么，对一个变量的数据类型判断就显得尤为重要。

# 获取数据类型

我们先来看下怎么获取一个数据的类型。

## typeof是否能正确判断类型？

由于由于历史原因，在判断原始类型时，`typeof null`会等于`object`。而且对于对象（Object）、数组（Array）来说，都会转换成`object`。例子如下：

```javascript
    typeof 1 // 'number'
    typeof "1" // 'string'
    typeof null // 'object'
    typeof undefined // 'undefined'

    typeof [] // 'object'
    typeof {} // 'object'
    typeof function() {} // 'function'
```
所以我们可以发现，typeof可以判断基本数据类型，但是难以判断除了函数以外的复杂数据类型。于是我们可以使用第二种方法，通常用来判断复杂数据类型，也可以用来判断基本数据类型。

对于返回值为`object`，有三种情况：
- 值为null
- 值为object
- 值为array

对于null，我们可以直接用===来进行判断，那么数组和对象呢？不急，我们接着说。

## instanceof是否能正确判断类型？

`instanceof`是通过原型链来判断的，但是对于对象来说，`Array`也会被转换成`Object`，而且也不能区分基本类型`string`和`boolean`。可以左边放你要判断的内容，右边放类型来进行JS类型判断，只能用来判断复杂数据类型,因为instanceof 是用于检测构造函数（右边）的 prototype 属性是否出现在某个实例对象（左边）的原型链上。例如：

```javascript
    function Func() {}
    const func = new Func()
    console.log(func instanceof Func) // true

    const obj = {}
    const arr = []
    obj instanceof Object // true
    arr instanceof Object // true
    arr instanceof Array // true

    const str = "abc"
    const str2 = new String("abc")
    str instanceof String // false
    str2 instanceof String // true
```

单独使用`instanceof`好像也是不行的，但是我们对于typeof已经得出结论，不能区分数组和对象，那么，我们结合下`instanceof`，来写一个完整的判断逻辑

```javascript
    function myTypeof(data) {
        const type = typeof data
        if (data === null) {
            return 'null'
        }
        if (type !== 'object') {
            return type
        }
        if (data instanceof Array) {
            return 'array'
        }
        return 'object'
    }
```
## constructor

constructor 判断方法跟instanceof相似,但是constructor检测Object与instanceof不一样,constructor还可以处理基本数据类型的检测,不仅仅是对象类型。

注意:

1. null和undefined没有constructor;
2. 判断数字时使用(),比如  (123).constructor,如果写成123.constructor会报错
3. constructor在类继承时会出错,因为Object被覆盖掉了,检测结果就不对了

```javascript
    function A() {};
    function B() {};
    A.prototype = new B();
    console.log(A.constructor === B)  // false

    var C = new A();
    console.log(C.constructor === B)  // true
    console.log(C.constructor === A)  // false

    C.constructor = A;
    console.log(C.constructor === A);  // true
    console.log(C.constructor === B);  // false
```

## Array.isArray()

Array.isArray() 用于确定传递的值是否是一个 Array。如果对象是 Array ，则返回true，否则为false。

```javascript
    Array.isArray([1, 2, 3]); // true
    Array.isArray({foo: 123}); // false
    Array.isArray("foobar"); // false
    Array.isArray(undefined); // false
```

## 正则判断

我们可以把对象和数组转成一个字符串，这样就可以做格式判断，从而得到最终的类型。

```javascript
    function myTypeof(data) {
        const str = JSON.stringify(data)
        if (/^{.*}$/.test(data)) {
            return 'object'
        }
        if (/^\[.*\]$/.test(data)) {
            return 'array'
        }
    }
```

## Object.prototype.toString.call()

上面我们通过`typeof`和`instanceof`实现了一版类型判断，那么是否有其他渠道，使我们的代码更加简洁吗？答案就是使用`Object.prototype.toString.call()`。

每个对象都有一个`toString()`方法，当要将对象表示为文本值或以预期字符串的方式引用对象时，会自动调用该方法。默认情况下，从`Object`派生的每个对象都会继承`toString()`方法。如果此方法未在自定义对象中被覆盖，则`toString()`返回`[Object type]`，其中`type`是对象类型。所以就有以下例子：

```javascript
    Object.prototype.toString.call(new Date()) // [object Date]
    Object.prototype.toString.call("1") // [object String]
    Object.prototype.toString.call(1) // [object Numer]
    Object.prototype.toString.call(undefined) // [object Undefined]
    Object.prototype.toString.call(null) // [object Null]
```

所以综合上述知识点，我们可以封装出以下通用类型判断方法：

```javascript
    function myTypeof(data) {
        var toString = Object.prototype.toString;
        var dataType = data instanceof Element ? "Element" : toString.call(data).replace(/\[object\s(.+)\]/, "$1")
        return dataType
    };

    myTypeof("a") // String
    myTypeof(1) // Number
    myTypeof(window) // Window
    myTypeof(document.querySelector("h1")) // Element
```

# 获取实例化对象的类名

题目中的第二个要求，是对于自定义的类实例化的对象，需要返回定义的类名。

这个也比较简单，我们对于上述获取的 Object 类型的数据，直接使用 `xx.constructor.name` 即可获取到这个数据对应的类名。

# 最终实现

```js
function myTypeof(data) {
    var toString = Object.prototype.toString;
    var dataType = data instanceof Element ? "Element" : toString.call(data).replace(/\[object\s(.+)\]/, "$1")

    if(dataType === 'Object'){
        return data.constructor.name
    }

    return dataType
};
```

</details>

## 185. e.target 和 e.currentTarget  有什么区别？ {#question-4b1cefdc-57fd-443e-94ff-df06135cf5ac}

> 难度：0.5 · 类型：QA

### 题目要点

在 JavaScript 中，事件对象（通常表示为 `e`）在事件处理函数中被传递，用于描述事件的具体信息。`e.target` 和 `e.currentTarget` 是事件对象中的两个属性，它们都提供了事件发生时相关联的 DOM 元素，但它们的指向略有不同。

1. **e.target**：
   - 它指的是触发事件的实际元素。
   - 举例来说，如果你有一个按钮点击事件，`e.target` 就是那个按钮元素。
   - 即使事件是委托给另一个元素（比如一个包含多个按钮的容器），`e.target` 仍然是那个触发点击的按钮。

2. **e.currentTarget**：
   - 它指的是事件处理函数正在被调用的元素。
   - 举例来说，如果你有一个按钮点击事件，并且这个事件处理函数被委托给一个容器元素，那么 `e.currentTarget` 就是那个容器元素。
   - 即使点击事件是由按钮触发的，`e.currentTarget` 仍然是那个容器元素，而不是按钮本身。

总结来说，`e.target` 是触发事件的元素，而 `e.currentTarget` 是事件处理函数所在的元素。在事件委托中，这两个属性通常会指向不同的元素。

<details>
<summary>参考答案</summary>

## 冒泡 & 捕获

当你触发一个元素的事件的时候，该事件从该元素的祖先元素传递下去，此过程为` 捕获 `，而到达此元素之后，又会向其祖先元素传播上去，此过程为` 冒泡 `

```html
    <div id="a">
      <div id="b">
        <div id="c">
          <div id="d">哈哈哈哈哈</div>
        </div>
      </div>
    </div>
```

![](https://static.ecool.fun//article/c3fdb11f-9b42-47af-841a-b933f383c6ee.jpeg)

## addEventListener

` addEventListener `是为元素绑定事件的方法，他接收三个参数：
- 第一个参数：绑定的事件名
- 第二个参数：执行的函数
- 第三个参数：
  - false：默认，代表冒泡时绑定
  - true：代表捕获时绑定

## target & currentTarget

### false

我们给四个div元素绑定事件，且` addEventListener `第三个参数不设置，则默认设置为` false `

```js
const a = document.getElementById('a')
const b = document.getElementById('b')
const c = document.getElementById('c')
const d = document.getElementById('d')
a.addEventListener('click', (e) => {
  const {
    target,
    currentTarget
  } = e
  console.log(`target是${target.id}`)
  console.log(`currentTarget是${currentTarget.id}`)
})
b.addEventListener('click', (e) => {
  const {
    target,
    currentTarget
  } = e
  console.log(`target是${target.id}`)
  console.log(`currentTarget是${currentTarget.id}`)
})
c.addEventListener('click', (e) => {
  const {
    target,
    currentTarget
  } = e
  console.log(`target是${target.id}`)
  console.log(`currentTarget是${currentTarget.id}`)
})
d.addEventListener('click', (e) => {
  const {
    target,
    currentTarget
  } = e
  console.log(`target是${target.id}`)
  console.log(`currentTarget是${currentTarget.id}`)
})
```

现在我们点击，看看输出的东西，可以看出触发的是d，而执行的元素是冒泡的顺序
```js
target是d currentTarget是d
target是d currentTarget是c
target是d currentTarget是b
target是d currentTarget是a
```

### true

我们把四个事件第三个参数都设置为` true `，我们看看输出结果，可以看出触发的是d，而执行的元素是捕获的顺序
```js
target是d currentTarget是a
target是d currentTarget是b
target是d currentTarget是c
target是d currentTarget是d
```

### 区别

我们可以总结出：
- ` e.target `：**触发**事件的元素
- ` e.currentTarget `：**绑定**事件的元素

</details>

## 186. ​const声明了数组，还能push元素吗，为什么？ {#question-e79d1df5-690b-428c-846d-9f076e2afae3}

> 难度：1 · 类型：QA

### 题目要点

可以

<details>
<summary>参考答案</summary>

可以

数组是引用类型，const声明的引用类型变量，不可以变的是变量引用始终指向某个对象，不能指向其他对象，但是所指向的某个对象本身是可以变的

</details>

## 187. 如何区分数组和对象？ {#question-c8997d09-6634-4e27-9f3f-5376a6e97f17}

> 难度：1 · 类型：QA

### 题目要点

核心考查：如何区分数组和对象？的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

## 方法1 ：通过 ES6 中的 Array.isArray 来识别

```
console.log(Array.isArray([]))//true
console.log(Array.isArray({}))//false
```
## 方法2 ：通过 instanceof 来识别

```
console.log([] instanceof Array)//true
console.log({} instanceof Array)//false
```
## 方法3 ：通过调用 constructor 来识别
```
console.log([].constructor)//[Function: Array]
console.log({}.constructor)//[Function: Object]
```
## 方法4 ：通过 Object.prototype.toString.call 方法来识别

```
console.log(Object.prototype.toString.call([]))//[object Array]
console.log(Object.prototype.toString.call({}))//[object Object]
```

</details>

## 188. async、await 实现原理 {#question-29821d8e-dc41-4581-91fe-9fde7658a559}

> 难度：4 · 类型：QA

### 题目要点

`async` 和 `await` 是 ES2017 (ES8) 中引入的，用于简化基于 Promise 的异步代码编写。它们使得异步代码看起来和写起来更像是同步代码，从而提高了代码的可读性和易维护性。

### 实现原理

#### 1. Promise

首先，理解 `async` 和 `await` 的实现原理需要先了解 Promise。Promise 是一个代表了异步操作最终完成或失败的对象。它有两种状态：pending（进行中）、fulfilled（已成功）或 rejected（已失败）。一旦 Promise 被 fulfilled 或 rejected，它的状态就不能再改变。Promise 通过 `.then()` 和 `.catch()` 方法来处理异步操作的结果或错误。

#### 2. async 函数

`async` 函数是一个返回 Promise 对象的函数。你可以使用 `await` 在 `async` 函数内部等待 Promise 解决。`async` 函数隐式地将返回值包装在一个 Promise 中，或者如果函数抛出异常，则返回一个被拒绝的 Promise。

```javascript
async function fetchData() {
  return 'some data';
}

// 相当于
function fetchData() {
  return Promise.resolve('some data');
}
```

#### 3. await 表达式

`await` 表达式会暂停 `async` 函数的执行，等待 Promise 解决（fulfilled 或 rejected），然后继续执行 `async` 函数并返回解决的值。如果 Promise 被拒绝，`await` 表达式会抛出一个错误，这个错误可以被 `async` 函数外部的 `try...catch` 捕获。

```javascript
async function asyncCall() {
  try {
    let result = await someAsyncCall(); // 等待 Promise 解决
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

#### 4. 生成器函数（Generator Functions）的灵感

虽然 `async`/`await` 的具体实现并不直接依赖于生成器函数（Generator Functions），但它们的设计受到了生成器函数的启发。生成器函数允许你通过 `yield` 表达式暂停和恢复函数的执行。`async`/`await` 可以看作是自动处理 Promise 的生成器函数的语法糖。

#### 5. 底层实现

在底层，JavaScript 引擎（如 V8）通过状态机（state machine）或类似的机制来管理 `async` 函数的执行和暂停。当 `await` 表达式被遇到时，JavaScript 引擎会将当前执行上下文（包括局部变量、调用栈帧等）保存起来，等待 Promise 解决。一旦 Promise 解决，JavaScript 引擎将恢复 `async` 函数的执行，并返回解决的值或抛出错误。

### 总结

`async` 和 `await` 的实现原理基于 Promise，通过自动处理 Promise 的解决和拒绝，以及使用底层机制来暂停和恢复函数的执行，来简化异步代码的编写。这使得异步代码看起来更像是同步代码，提高了代码的可读性和可维护性。

<details>
<summary>参考答案</summary>

# JavaScript 异步编程回顾

由于 JavaScript 是单线程执行模型，因此必须支持异步编程才能提高运行效率。异步编程的语法目标是让异步过程写起来像同步过程。

## 1. 回调函数

回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，就直接调用这个函数。

```js
const fs = require('fs')
fs.readFile('/etc/passwd', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data.toString())
})
```

回调函数最大的问题是容易形成回调地狱，即多个回调函数嵌套，降低代码可读性，增加逻辑的复杂性，容易出错。

```js
fs.readFile(fileA, function (err, data) {
  fs.readFile(fileB, function (err, data) {
    // ...
  })
})
```

## 2. Promise

为解决回调函数的不足，社区创造出 Promise。

```js
const fs = require('fs')

const readFileWithPromise = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

readFileWithPromise('/etc/passwd')
  .then(data => {
    console.log(data.toString())
    return readFileWithPromise('/etc/profile')
  })
  .then(data => {
    console.log(data.toString())
  })
  .catch(err => {
    console.log(err)
  })
```

简单的 Promise 实现，窥探下本质

Promise 实际上是利用编程技巧将回调函数的横向加载，改成纵向加载，达到链式调用的效果，避免回调地狱。最大问题是代码冗余，原来的任务被 Promise 包装了一下，不管什么操作，一眼看去都是一堆 then，原来的语义变得很不清楚。

## 3. async、await

为了解决 Promise 的问题，async、await 在 ES8 中被提了出来，是目前为止最好的解决方案

```js
const fs = require('fs')
async function readFile() {
  try {
    var f1 = await readFileWithPromise('/etc/passwd')
    console.log(f1.toString())
    var f2 = await readFileWithPromise('/etc/profile')
    console.log(f2.toString())
  } catch (err) {
    console.log(err)
  }
}\
```

async、await 函数写起来跟同步函数一样，条件是需要接收 Promise 或原始类型的值。异步编程的最终目标是转换成人类最容易理解的形式。

# async、await

分析 async、await 实现原理之前，先介绍下预备知识

## 1. generator

generator 函数是协程在 ES6 的实现。协程简单来说就是多个线程互相协作，完成异步任务。

![image-1-1620701628067.png](https://static.ecool.fun//article/466ad367-1f3f-4f4c-8fa1-bd5dace7bbb7.jpeg)

整个 generator 函数就是一个封装的异步任务，异步操作需要暂停的地方，都用 yield 语句注明。generator 函数的执行方法如下：

```js
function* gen(x) {
  console.log('start')
  const y = yield x * 2
  return y
}

const g = gen(1)
g.next()   // start { value: 2, done: false }
g.next(4)  // { value: 4, done: true }
```

* `gen()` 不会立即执行，而是一上来就暂停，返回一个 `Iterator` 对象（具体可以参考 [Iterator遍历器](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fwangfupeng1988%2Fjs-async-tutorial%2Fblob%2Fmaster%2Fpart4-generator%2F02-iterator.md "https://github.com/wangfupeng1988/js-async-tutorial/blob/master/part4-generator/02-iterator.md") ）
* 每次 `g.next()` 都会打破暂停状态去执行，直到遇到下一个 `yield` 或者 `return`
* 遇到 `yield` 时，会执行 `yield` 后面的表达式，并返回执行之后的值，然后再次进入暂停状态，此时 `done: false` 。
* `next` 函数可以接受参数，作为上个阶段异步任务的返回结果，被函数体内的变量接收
* 遇到 `return` 时，会返回值，执行结束，即 `done: true`
* 每次 `g.next()` 的返回值永远都是 `{value: ... , done: ...}` 的形式

## 2. thunk函数

JavaScript 中的 thunk 函数（译为转换程序）简单来说就是把带有回调函数的多参数函数转换成只接收回调函数的单参数版本

```js
const fs = require('fs')
const thunkify = fn => (...rest) => callback => fn(...rest, callback)
const thunk = thunkify(fs.readFile)
const readFileThunk = thunk('/etc/passwd', 'utf8')
readFileThunk((err, data) => {
   // ...
})
```

单纯的 thunk 函数并没有很大的用处， 大牛们想到了和 generator 结合：

```js
function* readFileThunkWithGen() {
  try {
    const content1 = yield readFileThunk('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileThunk('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
}

const g = readFileThunkWithGen()
g.next().value((err, data) => {
  if (err) {
    return g.throw(err).value
  }
  g.next(data.toString()).value((err, data) => {
    if (err) {
      return g.throw(err).value
    }
    g.next(data.toString())
  })
})
```

thunk 函数的真正作用是统一多参数函数的调用方式，在 next 调用时把控制权交还给 generator，使 generator 函数可以使用递归方式自启动流程

```js
const run = generator => {
  const g = generator()
  const next = (err, ...rest) => {
    if (err) {
      return g.throw(err).value
    }
    const result = g.next(rest.length > 1 ? rest : rest[0])
    if (result.done) {
      return result.value
    }
    result.value(next)
  }
  next()
}
run(readFileThunkWithGen)
```

有了自启动的加持之后，generator 函数内就可以写"同步"的代码了。generator 函数也可以与 Promise 结合：

```js
function* readFileWithGen() {
  try {
    const content1 = yield readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
}

const run = generator => {
  return new Promise((resolve, reject) => {
    const g = generator()
    const next = res => {
      const result = g.next(res)
      if (result.done) {
        return resolve(result.value)
      }
      result.value
        .then(
          next,
          err => reject(gen.throw(err).value)
        )
    }
    next()
  })
}

run(readFileWithGen)
  .then(res => console.log(res))
  .catch(err => console.log(err))
```

generator 可以暂停执行，很容易让它和异步操作产生联系，因为我们在处理异步操作时，在等待的时候可以暂停当前任务，把程序控制权交还给其他程序，当异步任务有返回时，在回调中再把控制权交还给之前的任务。generator 实际上并没有改变 JavaScript 单线程、使用回调处理异步任务的本质。

## 3. co 函数库

每次执行 generator 函数时自己写启动器比较麻烦。 [co函数库](https://github.com/tj/co) 是一个 generator 函数的自启动执行器，使用条件是 generator 函数的 yield 命令后面，只能是 thunk 函数或 Promise 对象，co 函数执行完返回一个 Promise 对象。

```js
const co = require('co')
co(readFileWithGen).then(res => console.log(res)) // 'done'
co(readFileThunkWithGen).then(res => console.log(res)) // 'done'
```

co 函数库的源码实现其实就是把上面两种情况做了综合:

```js
// 做了简化，与源码基本一致
const co = (generator, ...rest) => {
  const ctx = this
  return new Promise((resolve, reject) => {
    const gen = generator.call(ctx, ...rest)
    if (!gen || typeof gen.next !== 'function') {
      return resolve(gen)
    }

    const onFulfilled = res => {
      let ret
      try {
        ret = gen.next(res)
      } catch (e) {
        return reject(e)
      }
      next(ret)
    }

    const onRejected = err => {
      let ret
      try {
        ret = gen.throw(err)
      } catch (e) {
        return reject(e)
      }
      next(ret)
    }

    const next = result => {
      if (result.done) {
        return resolve(result.value)
      }
      toPromise(result.value).then(onFulfilled, onRejected)
    }

    onFulfilled()
  })
}

const toPromise = value => {
  if (isPromise(value)) return value
  if ('function' == typeof value) {
    return new Promise((resolve, reject) => {
      value((err, ...rest) => {
        if (err) {
          return reject(err)
        }
        resolve(rest.length > 1 ? rest : rest[0])
      })
    })
  }
}

```

## 4. 理解 async、await

一句话，async、await 是 co 库的官方实现。也可以看作自带启动器的 generator 函数的语法糖。不同的是，async、await 只支持 Promise 和原始类型的值，不支持 thunk 函数。

```js
// generator with co
co(function* () {
  try {
    const content1 = yield readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
})

// async await
async function readfile() {
  try {
    const content1 = await readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = await readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    throw(err)
  }
}
readfile().then(
  res => console.log(res),
  err => console.error(err)
)
```

# 总结

不论以上哪种方式，都没有改变 JavaScript 单线程、使用回调处理异步任务的本质。人类总是追求最简单易于理解的编程方式。

</details>

## 189. 岛屿数量 {#question-aa2840ae-f884-4fcb-a08b-e20310654dbd}

> 难度：3 · 类型：QA

给你一个由 `'1'`（陆地）和 `'0'`（水）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

**示例 1：**

**输入：**

```js
grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
```

**输出：** 1

**示例 2：**

**输入：**

```js
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
```

**输出：** 3

**提示：**

* `m == grid.length`
* `n == grid[i].length`
* `1 <= m, n <= 300`
* `grid[i][j]` 的值为 `'0'` 或 `'1'`

```js
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {

};
```

### 题目要点

我们可以将二维网格看成一个无向图，竖直或水平相邻的 11 之间有边相连。

<details>
<summary>参考答案</summary>

## 方法一：深度优先搜索

我们可以将二维网格看成一个无向图，竖直或水平相邻的 11 之间有边相连。

为了求出岛屿的数量，我们可以扫描整个二维网格。如果一个位置为 11，则以其为起始节点开始进行深度优先搜索。在深度优先搜索的过程中，每个搜索到的 11 都会被重新标记为 00。

最终岛屿的数量就是我们进行深度优先搜索的次数。

```js
const numIslands = (grid) => {
  let count = 0
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === '1') {
        count++
        turnZero(i, j, grid)
      }
    }
  }
  return count
}
function turnZero(i, j, grid) {
  if (i < 0 || i >= grid.length || j < 0
       || j >= grid[0].length || grid[i][j] === '0') return
  grid[i][j] = '0'
  turnZero(i, j + 1, grid)
  turnZero(i, j - 1, grid)
  turnZero(i + 1, j, grid)
  turnZero(i - 1, j, grid)
}
```

**复杂度分析**

* 时间复杂度：O(MN)，其中 M 和 N 分别为行数和列数。
* 空间复杂度：O(MN)，在最坏情况下，整个网格均为陆地，深度优先搜索的深度达到 MN。

## 方法二：广度优先搜索

同样地，我们也可以使用广度优先搜索代替深度优先搜索。

为了求出岛屿的数量，我们可以扫描整个二维网格。如果一个位置为 11，则将其加入队列，开始进行广度优先搜索。在广度优先搜索的过程中，每个搜索到的 11 都会被重新标记为 00。直到队列为空，搜索结束。

最终岛屿的数量就是我们进行广度优先搜索的次数。

```js
const numIslands = (grid) => {
  let count = 0
  let queue = []
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === '1') {
        count++
        grid[i][j] = '0' // 做标记，避免重复遍历
        queue.push([i, j])
        turnZero(queue, grid)
      }
    }
  }
  return count
}
function turnZero(queue, grid) {
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  while (queue.length) {
    const cur = queue.shift()
    for (const dir of dirs) {
      const x = cur[0] + dir[0]
      const y = cur[1] + dir[1]
      if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length || grid[x][y] !== '1') {
        continue
      }
      grid[x][y] = '0'
      queue.push([x, y])
    }
  }
}
```

**复杂度分析**

* 时间复杂度：O(MN)，其中 M 和 N 分别为行数和列数。
* 空间复杂度：O(min(M,N))，在最坏情况下，整个网格均为陆地，队列的大小可以达到 min(M,N)。

## 方法三：并查集

同样地，我们也可以使用并查集代替搜索。

为了求出岛屿的数量，我们可以扫描整个二维网格。如果一个位置为 1，则将其与相邻四个方向上的 1 在并查集中进行合并。

最终岛屿的数量就是并查集中连通分量的数目。

```js
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {
    const Y = grid.length;
    const X = grid[0].length;
    const uf = new UnionFind();

    for(let i = 0; i < Y; i++) {
        for(let j = 0; j < X; j++) {
            if(grid[i][j] == 1) uf.makeSet([i, j]);
        }
    }

    for(let i = 0; i < Y; i++) {
        for(let j = 0; j < X; j++) {
            if (grid[i][j] == 1) {
                console.log(i , j)
                if ((i + 1 < Y) && (grid[i + 1][j] == 1)) uf.union([i, j], [i + 1, j]); // 右侧
                if ((j + 1 < X) && (grid[i][j + 1] == 1)) uf.union([i, j], [i, j + 1]); // 下侧
            }
        }
    }

    return uf.getCount();
};
class UnionFind {
    constructor() {
        this.parents = {};
        this.count = 0;
    }
    makeSet(x) {
        this.parents[x] = x + '';
        this.count++;
    }
    findSet(x) { // 路径压缩，查x的根节点
        while (this.parents[x] !== (x + '')) {
            x = this.parents[x];
        }
        return x + '';
    }
    union(x, y) {
        this.link(this.findSet(x), this.findSet(y));
    }
    link(x, y) {
        if (x === y) return;
        this.parents[x] = y;
        this.count--;
    }
    getCount() {
        return this.count;
    }
}
```

**复杂度分析**

* 时间复杂度：O(MN×α(MN))，其中 MM 和 NN 分别为行数和列数。注意当使用路径压缩（见 find 函数）和按秩合并（见数组 rank）实现并查集时，单次操作的时间复杂度为 α(MN)，其中 α(x) 为反阿克曼函数，当自变量 xx 的值在人类可观测的范围内（宇宙中粒子的数量）时，函数 α(x) 的值不会超过 5，因此也可以看成是常数时间复杂度。
* 空间复杂度：O(MN)，这是并查集需要使用的空间。

</details>

## 190. 以下代码的输出是什么？ {#question-8ee27192-8ae7-4e03-a32c-b00db276a83f}

> 难度：1 · 类型：QA

```js
var name = 'window'
const obj = {
    name: 'obj',
    sayName:function() {
        console.log(this.name)
    },
}
obj.sayMyName = () => {
    console.log(this.name)
}
const fn1 = obj.sayName
const fn2 = obj.sayMyName
fn1()
obj.sayName()
fn2()
obj.sayMyName()
```

### 题目要点

依次输出：

<details>
<summary>参考答案</summary>

依次输出：

```
window
obj
window
window
```

本次主要考察对this指向的理解，题目比较简单，不做具体的分析。

> 本答案由“前端面试题宝典”收集整理，PC端访问请前往： https://fe.ecool.fun/

</details>

## 191. 给一个dom同时绑定两个点击事件，一个用捕获，一个用冒泡，说下会执行几次事件，然后会先执行冒泡还是捕获？ {#question-2022f7f8-f3ec-4f8a-9971-9d5572d3e106}

> 难度：1 · 类型：QA

### 题目要点

addEventListener绑定几次就执行几次

<details>
<summary>参考答案</summary>

addEventListener绑定几次就执行几次

 先捕获，后冒泡

</details>

## 192. promise.catch后面的.then还会执行吗？ {#question-3925cf74-ee93-49fd-8896-8bc7221f32a4}

> 难度：3 · 类型：QA

### 题目要点

答案： **会继续执行**。

<details>
<summary>参考答案</summary>

答案： **会继续执行**。

虽然**Promise**是开发过程中使用非常频繁的一个技术点，但是它的一些细节可能很多人都没有去关注过。我们都知道`.then`, `.catch`, `.finally`都可以链式调用，其本质上是因为返回了一个新的**Promise**实例。

catch的语法形式如下：

```javascript
p.catch(onRejected);
```

`.catch`只会处理`rejected`的情况，并且也会返回一个新的`Promise`实例。

`.catch(onRejected)`与`then(undefined, onRejected)`在表现上是一致的。

事实上，catch(onRejected)从内部调用了then(undefined, onRejected)。

* 如果`.catch(onRejected)`的`onRejected`回调中返回了一个状态为`rejected`的`Promise`实例，那么`.catch`返回的`Promise`实例的状态也将变成`rejected`。
* 如果`.catch(onRejected)`的`onRejected`回调中抛出了异常，那么`.catch`返回的`Promise`实例的状态也将变成`rejected`。
* 其他情况下，`.catch`返回的`Promise`实例的状态将是`fulfilled`。

</details>

## 193. 如何确保你的构造函数只能被new调用，而不能被普通调用？ {#question-2572a1d9-4018-49c3-9934-1fe1be0889b2}

> 难度：2.5 · 类型：QA

### 题目要点

`JavaScript` 中的函数一般有两种使用方式:

<details>
<summary>参考答案</summary>

## 明确函数的双重用途
`JavaScript` 中的函数一般有两种使用方式:
+ 当作构造函数使用: `new Func()`
+ 当作普通函数使用: `Func()`

但 `JavaScript` 内部并没有区分两者的方式，我们人为规定**构造函数名首字母要大写**作为区分。也就是说，构造函数被当成普通函数调用不会有报错提示。

下面来举个栗子:

```js
// 定义构造函数 Person
function Person(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = this.firstName + this.lastName;
}
// 使用 new 调用
console.log(new Person("战场", "小包"));
// 当作普通函数调用
console.log(Person("战场", "小包"))
```
输出结果:

![newFunc-Func.png](https://static.ecool.fun//article/71273689-7fdd-408c-a846-a59497aa53ae.jpeg)

通过输出结果可以发现，定义的构造函数被当作普通函数来调用，没有任何错误提示。

## 使用 instanceof 实现
### instanceof 基础知识
`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。

使用语法:
```js
object instanceof constructor
```

我们可以使用 `instanceof` 检测某个对象是不是另一个对象的实例，例如 ```new Person() instanceof Person --> true```

### new 绑定/ 默认绑定
+ 通过 `new` 来调用构造函数，会生成一个新对象，并且把这个新对象绑定为调用函数的 `this` 。
+ 如果普通调用函数，非严格模式 `this` 指向 `window`，严格模式指向 `undefined`

```js
function Test() {
    console.log(this)
}
// Window {...}
console.log(Test())
// Test {}
console.log(new Test())
```
使用 `new` 调用函数和普通调用函数最大的区别在于**函数内部 `this` 指向不同: `new` 调用后 `this` 指向实例，普通调用则会指向 `window`**。

`instanceof` 可以检测某个对象是不是另一个对象的实例。如果为 `new` 调用， `this` 指向实例，**this instanceof 构造函数** 返回值为 `true` ，普通调用返回值为 `false`。

### 代码实现

```js
function Person(firstName, lastName) {
    // this instanceof Person
    // 如果返回值为 false，说明为普通调用
    // 返回类型错误信息——当前构造函数需要使用 new 调用
    if (!(this instanceof Person)) {
        throw new TypeError('Function constructor A cannot be invoked without "new"')
    }
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = this.firstName + this.lastName;
}
// 当作普通函数调用
// Uncaught TypeError: Function constructor A cannot be invoked without "new"
console.log(Person("战场", "小包"));
```
通过输出结果，我们可以发现，定义的 `Person` 构造函数已经无法被普通调用了。撒花~~~

但这种方案并不是完美的，存在一点小小的瑕疵。我们可以通过伪造实例的方法骗过构造函数里的判断。

具体实现: `JavaScript` 提供的 `apply/call` 方法可以修改 `this` 指向，如果调用时将 `this` 指向修改为 `Person` 实例，就可以成功骗过上面的语法。
```js
// 输出结果 undefined
console.log(Person.call(new Person(), "战场", "小包"));
```
这点瑕疵虽说无伤大雅，但经过小包的学习，`ES6` 中提供了更好的方案。
## new.target
`JavaScript` 官方也发现了这个让人棘手的问题，因此 `ES6` 中提供了 `new.target` 属性。

《ECMAScript 6 入门》中讲到:
`ES6` 为 `new` 命令引入了一个 `new.target` 属性，该属性一般用在构造函数之中，返回 `new` 命令作用于的那个构造函数。如果构造函数不是通过 `new` 命令或 `Reflect.construct()` 调用的，`new.target` 会返回 `undefined` ，**因此这个属性可以用来确定构造函数是怎么调用的**。

`new.target` 就是为确定构造函数的调用方式而生的，太符合这个场景了，我们来试一下 `new.target` 的用法。
```js
function Person() {
    console.log(new.target);
}
// new: Person {}
console.log("new: ",new Person())
// not new: undefined
console.log("not new:", Person())
```
所以我们就可以使用 `new.target` 来非常简单的实现对构造函数的限制。

```js
function Person() {
    if (!(new.target)) {
        throw new TypeError('Function constructor A cannot be invoked without "new"')
    }
}
// Uncaught TypeError: Function constructor A cannot be invoked without "new"
console.log("not new:", Person())
```

## 使用ES6 Class

类也具备限制构造函数只能用 `new` 调用的作用。

`ES6` 提供 `Class` 作为构造函数的语法糖，来实现语义化更好的面向对象编程，并且对 `Class` 进行了规定：**类的构造器必须使用 new 来调用**。

因此后续在进行面向对象编程时，强烈推荐使用 `ES6` 的 `Class`。 `Class` 修复了很多 `ES5` 面向对象编程的缺陷，例如类中的所有方法都是不可枚举的；类的所有方法都无法被当作构造函数使用等。

```js
class Person {
    constructor (name) {
        this.name = name;
    }
}
// Uncaught TypeError: Class constructor Person cannot be invoked without 'new'
console.log(Person())
```
学到这里我就不由得好奇了，既然 `Class` 必须使用 `new` 来调用，那提供 `new.target` 属性的意义在哪里？
## new.target 实现抽象类
首先来看一下 `new.target` 在类中使用会返回什么？
```js
class Person {
    constructor (name) {
        this.name = name;
        console.log(new.target)
    }
}
new Person()
```
输出结果:

![new-target-class.png](https://static.ecool.fun//article/2f127a0c-478c-4d74-a795-df2656f32e43.jpeg)

`Class` 内部调用 `new.target`，会返回当前 `Class`。

《ECMAScript 6 入门》中又讲到: **需要注意的是，子类继承父类时，`new.target`会返回子类**。继承中的 `new.target` 好像有不一样的花样，我们来试一下。

```js
class Animal {
    constructor (type, name, age) {
        this.type = type;
        this.name = name;
        this.age = age;
        console.log(new.target)
    }
}
// extends 是 Class 中实现继承的关键字
class Dog extends Animal {
    constructor(name, age) {
        super("dog", "baobao", "1")
    }
}
const dog = new Dog()
```
输出结果:

![new-target-extends.png](https://static.ecool.fun//article/36c17124-4ebb-41e9-8c13-918fe82805b9.jpeg)

通过上面案例，我们可以发现子类调用和父类调用的返回结果是不同的，我们利用这个特性，就可以实现父类不可调用而子类可以调用的情况——面向对象中的**抽象类**

### 抽象类实现
什么是抽象类那？我们以动物世界为例。

我们定义了一个动物类 `Animal`，并且通过这个类来创建动物，动物是个抽象概念，当你提到动物类时，你并不知道我会创建什么动物。只有将动物实体化，比如说猫，狗，猪啊，这才是具体的动物，并且每个动物的行为都会有所不同。因此我们不应该通过创建 `Animal` 实例来生成动物，`Animal` 只是动物抽象概念的集合。

`Animal` 就是一个抽象类，我们不应该通过它来生成动物，而是通过它的子类，例如 `Dog、Cat` 等来生成对应的 `dog/cat` 实例。

`new.target` 子类调用和父类调用的返回值是不同的，所以我们可以借助 `new.target` 实现抽象类

> 抽象类也可以理解为不能独立使用、必须继承后才能使用的类。
```js
class Animal {
    constructor (type, name, age) {
        if (new.target === Animal) {
            throw new TypeError("abstract class cannot new")
        }
        this.type = type;
        this.name = name;
        this.age = age;
    }
}
// extends 是 Class 中实现继承的关键字
class Dog extends Animal {
    constructor(name, age) {
        super("dog", "baobao", "1")
    }
}
// Uncaught TypeError: abstract class cannot new
const dog = new Animal("dog", "baobao", 18)
```
## 总结

本文介绍了三种限制构造函数只能被 `new` 调用的方案

+ 借助 `instanceof` 和 `new` 绑定的原理，适用于低版本浏览器
+ 借助 `new.target` 属性，可与 `class` 配合定义抽象类
+ 面向对象编程使用 `ES6 class`——最佳方案

</details>

## 194. 如何获取到一个实例对象的原型对象？ {#question-1a143475-08ab-49cc-abc9-62a4bb9249c0}

> 难度：0.5 · 类型：QA

### 题目要点

从 `构造函数` 获得 原型对象：

<details>
<summary>参考答案</summary>

* 从 `构造函数` 获得 原型对象：

```
构造函数.prototype
```

* 从 `对象实例` 获得 `父级原型对象`：

```
方法一： 对象实例.__proto__        【 有兼容性问题，不建议使用】
方法二：Object.getPrototypeOf( 对象实例 )
```

</details>

## 195. 下面代码会输出什么？ {#question-7625104a-b9e7-4cab-915a-d1cccfa31d5c}

> 难度：1 · 类型：QA

```js
foo();
var foo;
function foo(){
  console.log(1);
}
foo = function(){
  console.log(2);
}
```

### 题目要点

答案是：1

<details>
<summary>参考答案</summary>

答案是：1

> 函数声明和变量声明都会被提升，但是有一个值得注意的细节，那就是，函数会首先提升，然后才是变量！

根据 JavaScript 的变量和函数提升规则，上述代码在执行时会被解析成以下形式：

```javascript
function foo(){
  console.log(1);
}

var foo; // 变量声明被提升至顶部

foo(); // 输出 1

foo = function(){
  console.log(2);
}
```

以下是代码的执行过程：

1. 首先，函数 `foo` 的函数声明被提升到作用域的顶部。所以，在调用 `foo()` 之前，函数 `foo` 已经可用。

2.然后，变量 `foo` 被声明，并且由于它已经被函数 `foo` 的定义所覆盖，因此这个变量声明没有改变函数 `foo` 的值。

3.  接下来，函数 `foo` 被调用，输出结果为 `1`。

4. 最后，变量 `foo` 被重新赋值为一个新的函数表达式，该函数输出结果为 `2`。

所以，最终输出结果为：
```
1
```

</details>

## 196. RESTful 接口规范是什么？ {#question-485b5052-3119-4ced-9473-940489629f99}

> 难度：2.5 · 类型：QA

### 题目要点

RESTful 接口规范是一种设计 Web 服务接口的风格和规范，它遵循 REST（Representational State Transfer）架构。RESTful 接口的设计原则包括以下几点：

1. **资源（Resources）**：将系统中的所有事物视为资源，每个资源都有一个唯一的标识符（通常是 URL），用于对其进行操作。
2. **统一接口（Uniform Interface）**：接口设计应该简单一致，包括以下几个方面：
   - 使用标准的 HTTP 方法（GET、POST、PUT、DELETE 等）来对资源进行操作。
   - 使用标准的 HTTP 状态码（如 200、404、500）来表示请求结果。
   - 使用资源的 URL 来唯一标识资源。
   - 使用适当的 MIME 类型（如 JSON、XML）来传输数据。
3. **状态无关（Stateless）**：每个请求都应该包含足够的信息，服务器不需要保存客户端的状态。这样可以使系统更加简单、可伸缩性更好。
4. **客户端 - 服务器分离（Client-Server Separation）**：客户端和服务器之间的交互应该通过标准化的接口进行，使得客户端和服务器可以独立地进行演化。
5. **可缓存性（Cacheability）**：对于经常不变的数据，应该使用合适的缓存机制，提高系统的性能和可伸缩性。
6. **按需代码（Code on Demand）**（可选）：服务器可以向客户端传输可执行代码，以提供更丰富的功能。

<details>
<summary>参考答案</summary>

RESTful 接口规范是一种设计 Web 服务接口的风格和规范，遵循 REST（Representational State Transfer）架构。它的设计原则包括以下几点：

1. **资源（Resources）**：将系统中的所有事物视为资源，每个资源都有一个唯一的标识符（通常是 URL），用于对其进行操作。

2. **统一接口（Uniform Interface）**：接口设计应该简单一致，包括以下几个方面：
   - 使用标准的 HTTP 方法（GET、POST、PUT、DELETE 等）来对资源进行操作。
   - 使用标准的 HTTP 状态码（如 200、404、500）来表示请求结果。
   - 使用资源的 URL 来唯一标识资源。
   - 使用适当的 MIME 类型（如 JSON、XML）来传输数据。

3. **状态无关（Stateless）**：每个请求都应该包含足够的信息，服务器不需要保存客户端的状态。这样可以使系统更加简单、可伸缩性更好。

4. **客户端 - 服务器分离（Client-Server Separation）**：客户端和服务器之间的交互应该通过标准化的接口进行，使得客户端和服务器可以独立地进行演化。

5. **可缓存性（Cacheability）**：对于经常不变的数据，应该使用合适的缓存机制，提高系统的性能和可伸缩性。

6. **按需代码（Code on Demand）**（可选）：服务器可以向客户端传输可执行代码，以提供更丰富的功能。

遵循 RESTful 接口规范能够使得系统具有良好的可维护性、可伸缩性和性能，并且更容易与其他系统进行集成。

</details>

## 197. ES5怎么实现继承 {#question-9b19862a-b226-4a56-95d4-5ab4b05024bb}

> 难度：3 · 类型：QA

### 题目要点

在 ES5 中，实现继承的方法主要包括：

1. **原型链继承**：通过原型链，一个对象继承另一个对象的属性和方法。
2. **借用构造函数继承**：通过调用父类的构造函数来继承其属性，但不继承方法。
3. **组合继承**：结合原型链继承和借用构造函数继承的优点，继承属性和方法。
4. **原型式继承**：使用 `Object.create()` 方法创建一个新对象，该对象继承自另一个对象。
5. **寄生式继承**：创建一个继承自原型的对象，然后扩展这个对象，最后返回这个扩展后的对象。
6. **寄生组合式继承**：结合原型链继承和寄生式继承的优点，通过调用超类型的构造函数来继承属性，然后通过原型链继承方法。

详细实现参考答案

<details>
<summary>参考答案</summary>

在 ES5 中，实现继承主要有以下几种方式：
1. **原型链继承**：
   通过将一个对象的 `__proto__` 属性指向另一个对象的 `prototype` 属性，可以实现继承。
   ```javascript
   function Parent() {
     this.parentProperty = true;
   }
   Parent.prototype.getParentProperty = function() {
     return this.parentProperty;
   };
   function Child() {
     this.childProperty = false;
   }
   // 继承 Parent
   Child.prototype = new Parent();
   Child.prototype.getChildProperty = function() {
     return this.childProperty;
   };
   var child = new Child();
   console.log(child.getParentProperty()); // true
   console.log(child.getChildProperty()); // false
   ```
2. **借用构造函数继承**：
   通过复制一个对象的属性和方法到另一个对象，实现继承。
   ```javascript
   function Parent(name) {
     this.name = name;
     this.colors = ['red', 'blue', 'green'];
   }
   Parent.prototype.sayName = function() {
     console.log(this.name);
   };
   function Child(name, age) {
     Parent.call(this, name); // 借用构造函数
     this.age = age;
   }
   var child = new Child('Nicholas', 29);
   console.log(child.colors); // ['red', 'blue', 'green']
   console.log(child.age); // 29
   ```
3. **组合继承**：
   结合原型链继承和借用构造函数继承的优点。
   ```javascript
   function Parent(name) {
     this.name = name;
     this.colors = ['red', 'blue', 'green'];
   }
   Parent.prototype.sayName = function() {
     console.log(this.name);
   };
   function Child(name, age) {
     Parent.call(this, name); // 借用构造函数
     this.age = age;
   }
   Child.prototype = new Parent(); // 原型链继承
   Child.prototype.sayAge = function() {
     console.log(this.age);
   };
   var child = new Child('Nicholas', 29);
   console.log(child.colors); // ['red', 'blue', 'green']
   console.log(child.age); // 29
   console.log(child.sayName()); // Nicholas
   console.log(child.sayAge()); // 29
   ```
4. **原型式继承**（`Object.create()`）：
   使用 `Object.create()` 方法创建一个新对象，该对象继承自另一个对象。
   ```javascript
   var parent = {
     colors: ['red', 'blue', 'green']
   };
   var child = Object.create(parent);
   child.name = 'Nicholas';
   console.log(child.colors); // ['red', 'blue', 'green']
   ```
5. **寄生式继承**：
   通过创建一个继承自原型的对象，然后扩展这个对象，最后返回这个扩展后的对象。
   ```javascript
   function createAnother(original) {
     var clone = Object.create(original);
     clone.sayHi = function() {
       console.log('hi');
     };
     return clone;
   }
   var person = {
     name: 'Nicholas'
   };
   var anotherPerson = createAnother(person);
   anotherPerson.sayHi(); // hi
   ```
6. **寄生组合式继承**：
   结合原型链继承和寄生式继承的优点，通过调用超类型的构造函数来继承属性，然后通过原型链继承方法。
   ```javascript
   function inheritPrototype(subType, superType) {
     var prototype = Object.create(superType.prototype);
     prototype.constructor = subType;
     subType.prototype = prototype;
   }
   function Parent(name) {
     this.name = name;
     this.colors = ['red', 'blue', 'green'];
   }
   Parent.prototype.sayName

</details>

## 198. 请简述 == 的机制 {#question-be6f7f8b-d386-4f99-a0bc-f9b5a0512f99}

> 难度：1 · 类型：QA

### 题目要点

以下是`==`操作符在比较不同类型值时的基本机制：

1. **如果两个值类型相同**，则比较它们的值是否相等。

2. **如果两个值类型不同**，则JavaScript会尝试进行类型转换，然后比较转换后的值是否相等。类型转换的规则如下：

   - **字符串和数字**：字符串会被尝试转换为数字，然后进行比较。例如，`"3" == 3` 的结果是 `true`，因为 `"3"` 被转换成了数字 `3`。

   - **布尔值**：布尔值 `true` 和 `false` 会被转换成数字 `1` 和 `0`，然后进行比较。

   - **对象与原始值**：如果一个值是对象（包括数组和函数），另一个值是原始值（数字、字符串或布尔值），则对象会被转换成原始值，然后再进行比较。对象的原始值转换通常通过调用对象的 `toString()` 或 `valueOf()` 方法（取决于具体的类型和上下文）来实现。例如，`[1] == "1"` 的结果是 `true`，因为数组 `[1]` 被转换成了字符串 `"1"`。

   - **`null` 和 `undefined`**：在JavaScript中，`null` 和 `undefined` 在使用 `==` 进行比较时被认为是相等的，即 `null == undefined` 的结果是 `true`。但是，请注意，它们与任何其他值比较时都不会相等（除了彼此），包括使用 `===` 进行严格比较时。

3. **特殊情况**：需要注意的是，`NaN`（Not-a-Number）是一个特殊的值，它表示某些数学运算的结果不是数字。然而，在JavaScript中，`NaN` 与自身使用 `==` 进行比较的结果是不相等的，即 `NaN == NaN` 的结果是 `false`。这是因为 `NaN` 被定义为与任何值（包括它自己）都不相等。

由于 `==` 的这种类型转换机制，它可能会导致一些令人困惑的行为，尤其是在处理复杂的数据结构或进行类型敏感的比较时。因此，在可能的情况下，建议使用 `===` 进行严格等值比较，以避免不必要的类型转换和潜在的错误。

<details>
<summary>参考答案</summary>

大家知道，==是JavaScript中比较复杂的一个运算符。它的运算规则奇怪，容易让人犯错，从而成为JavaScript中“最糟糕的特性”之一。

在仔细阅读了ECMAScript规范的基础上，我画了一张图，我想通过它你会彻底地搞清楚关于==的一切。同时，我也试图通过此文向大家证明==并不是那么糟糕的东西，它很容易掌握，甚至看起来很合理。

先上图：

![](https://static.ecool.fun//article/d0543ddc-0e72-4620-b427-ff7961e2cb3a.png)

**图1** \==运算规则的图形化表示

规范毕竟是给JavaScript运行环境的开发人员看的(比如V8引擎的开发人员们)，而不是给语言的使用者看的。而上图正是将规范中复杂的描述翻译成了更容易看懂的形式。

在详细介绍图1中的每个部分前，我们来复习一下JS中关于类型的知识：

1. JS中的值有两种类型：原始类型(Primitive)、对象类型(Object)。
2. 原始类型包括：Undefined、Null、Boolean、Number和String等五种。
3. Undefined类型和Null类型的都只有一个值，即undefined和null；Boolean类型有两个值：true和false；Number类型的值有很多很多；String类型的值理论上有无数个。
4. 所有对象都有valueOf()和toString()方法，它们继承自Object，当然也可能被子类重写。

现在考虑表达式：

```js
x == y

```

其中x和y是上述六种类型中某一种类型的值。

当x和y的类型相同时，x == y可以转化为x === y，而后者是很简单的(唯一需要注意的可能是NaN)，所以下面我们只考虑x和y的类型不同的情况。

## 一. 有和无

在图1中，JavaScript值的六种类型用蓝底色的矩形表示。它们首先被分成了两组：

* String、Number、Boolean和Object (对应左侧的大矩形框)
* Undefined和Null (对应右侧的矩形框)

分组的依据是什么？我们来看一下，右侧的Undefined和Null是用来表示**不确定**、**无**或者**空**的，而右侧的四种类型都是**确定的**、**有**和**非空**。我们可以这样说：

> 左侧是一个**存在**的世界，右侧是一个**空**的世界。

所以，左右两个世界中的任意值做==比较的结果都是false是很合理的。(见图1中连接两个矩形的水平线上标的false)

## 二. 空和空

JavaScript中的undefined和null是另一个经常让我们崩溃的地方。通常它被认为是一个设计缺陷，这一点我们不去深究。不过我曾听说，JavaScript的作者最初是这样想的：

> 假如你打算把一个变量赋予对象类型的值，但是现在还没有赋值，那么你可以用null表示此时的状态(证据之一就是typeof null 的结果是'object')；相反，假如你打算把一个变量赋予原始类型的值，但是现在还没有赋值，那么你可以用undefined表示此时的状态。

不管这个传闻是否可信，它们两者做==比较的结果是true是很合理的。(见图1中右侧垂直线上标的true)

在进行下一步之前，我们先来说一下图1中的两个符号：大写字母N和P。这两个符号并不是PN结中正和负的意思。而是：

* N表示ToNumber操作，即将操作数转为数字。它是规范中的抽象操作，但我们可以用JS中的Number()函数来等价替代。
* P表示ToPrimitive操作，即将操作数转为原始类型的值。它也是规范中的抽象操作，同样也可以翻译成等价的JS代码。不过稍微复杂一些，简单说来，对于一个对象obj：

> ToPrimitive(obj)等价于：先计算obj.valueOf()，如果结果为原始值，则返回此结果；否则，计算obj.toString()，如果结果是原始值，则返回此结果；否则，抛出异常。

注：此处有个例外，即Date类型的对象，它会先调用toString()方法，后调用valueOf()方法。

在图1中，标有N或P的线表示：当它连接的两种类型的数据做==运算时，标有N或P的那一边的操作数要先执行ToNumber或ToPrimitive变换。

## 三. 真与假

从图1可以看出，当布尔值与其他类型的值作比较时，布尔值会转化为数字，具体来说

```js
true -> 1
false -> 0

```

这一点也不需浪费过多口舌。想一下在C语言中，根本没有布尔类型，通常用来表示逻辑真假的正是整数1和0。

## 四. 字符的序列

在图1中，我们把String和Number类型分成了一组。为什么呢？在六种类型中，String和Number都是字符的序列(至少在字面上如此)。字符串是所有合法的字符的序列，而数字可以看成是符合特定条件的字符的序列。所以，数字可以看成字符串的一个子集。

根据图1，在字符串和数字做==运算时，需要使用ToNumber操作，把字符串转化为数字。假设x是字符串，y是数字，那么：

```js
x == y -> Number(x) == y

```

那么字符串转化为数字的规则是怎样的呢？规范中描述得很复杂，但是大致说来，就是把字符串两边的空白字符去掉，然后把两边的引号去掉，看它能否组成一个合法的数字。如果是，转化结果就是这个数字；否则，结果是NaN。例如：

```js
Number('123') // 结果123
Number('1.2e3') // 结果1200
Number('123abc') // 结果NaN
Number('123\v\f') // 结果123

```

当然也有例外，比如空白字符串转化为数字的结果是0。即

```js
Number('') // 结果0
Number('\v\f') // 结果0

```

## 五. 单纯与复杂

原始类型是一种单纯的类型，它们直接了当、容易理解。然而缺点是表达能力有限，难以扩展，所以就有了对象。对象是属性的集合，而属性本身又可以是对象。所以对象可以被构造得任意复杂，足以表示各种各样的事物。

但是，有时候事情复杂了也不是好事。比如一篇冗长的论文，并不是每个人都有时间、有耐心或有必要从头到尾读一遍，通常只了解其中心思想就够了。于是论文就有了关键字、概述。JavaScript中的对象也一样，我们需要有一种手段了解它的主要特征，于是对象就有了toString()和valueOf()方法。

> toString()方法用来得到对象的一段文字描述；而valueOf()方法用来得到对象的特征值。

当然，这只是我自己的理解。顾名思义，toString()方法倾向于返回一个字符串。那么valueOf()方法呢？根据规范中的描述，它倾向于返回一个数字——尽管内置类型中，valueOf()方法返回数字的只有Number和Date。

根据图1，当一个对象与一个非对象比较时，需要将对象转化为原始类型(虽然与布尔类型比较时，需要先将布尔类型变成数字类型，但是接下来还是要将对象类型变成原始类型)。这也是合理的，毕竟==是不严格的相等比较，我们只需要取出对象的主要特征来参与运算，次要特征放在一边就行了。

## 六. 万物皆数

我们回过头来看一下图1。里面标有N或P的那几条连线是没有方向的。假如我们在这些线上标上箭头，使得连线从标有N或P的那一端指向另一端，那么会得到(不考虑undefined和null)：

![](https://static.ecool.fun//article/1bd8d1bf-eeed-4834-b822-627094b0498d.png)

**图2** ==运算过程中类型转化的趋势

发现什么了吗？对，在运算过程中，所有类型的值都有一种向数字类型转化的趋势。毕竟曾经有名言曰：

> 万物皆数。

## 七. 举个栗子

前面废话太多了，这里还是举个例子，来证明图1确实是方便有效可以指导实践的。

例，计算下面表达式的值：

```js
[''] == false

```

首先，两个操作数分别是对象类型、布尔类型。根据图1，需要将布尔类型转为数字类型，而false转为数字的结果是0，所以表达式变为：

```js
[''] == 0

```

两个操作数变成了对象类型、数字类型。根据图1，需要将对象类型转为原始类型：

* 首先调用\[\].valueOf()，由于数组的valueOf()方法返回自身，所以结果不是原始类型，继续调用\[\].toString()。
* 对于数组来说，toString()方法的算法，是将每个元素都转为字符串类型，然后用逗号','依次连接起来，所以最终结果是空字符串''，它是一个原始类型的值。

此时，表达式变为：

```js
'' == 0

```

两个操作数变成了字符串类型、数字类型。根据图1，需要将字符串类型转为数字类型，前面说了空字符串变成数字是0。于是表达式变为：

```js
0 == 0

```

到此为止，两个操作数的类型终于相同了，结果明显是true。

从这个例子可以看出，要想掌握==运算的规则，除了牢记图1外，还需要记住那些内置对象的toString()和valueOf()方法的规则。包括Object、Array、Date、Number、String、Boolean等，幸好这没有什么难度。

## 八. 再次变形

其实，图一还不够完美。为什么呢？因为对象与字符串/数字比较时都由对象来转型，但是与同样是原始类型的布尔类型比较时却需要布尔类型转型。实际上，只要稍稍分析一下，全部让对象来转为原始类型也是等价的。所以我们得到了最终的更加完美的图形：

![](https://static.ecool.fun//article/5fd67afd-4393-4358-9e8f-ca8f36ae702f.png)

**图3** 更完美的==运算规则的图形化表示<br>

有一个地方可能让你疑惑：为什么Boolean与String之间标了两个N？虽然按照规则应该是由Boolean转为数字，但是下一步String就要转为数字了，所以干脆不如两边同时转成数字。

## 九. 总结一下

前面说得很乱，根据我们得到的最终的图3，我们总结一下==运算的规则：

* **undefined == null**，结果是**true**。且它俩与所有其他值比较的结果都是**false**。
* **String == Boolean**，需要两个操作数同时转为Number。
* **String/Boolean == Number**，需要String/Boolean转为Number。
* **Object == Primitive**，需要Object转为Primitive(具体通过**valueOf**和**toString**方法)。

瞧见没有，一共**只有4条规则**！是不是很清晰、很简单。

> 原答案链接： https://zhuanlan.zhihu.com/p/21650547
>
> 本答案由《前端面试题宝典》小程序整理和发布，PC端访问地址： https://fe.ecool.fun/

</details>

## 199. 说说sourcemap的原理？ {#question-2f8aa80e-e3b0-4d10-843d-83e947dda744}

> 难度：4 · 类型：QA

### 题目要点

SourceMap原理：

SourceMap是一个包含位置映射信息的文件，它记录了源代码与编译后代码（如压缩、混淆后的代码）之间的对应关系。这样，在调试时，开发者工具可以根据SourceMap将编译后的代码位置映射回原始的源代码位置，使得调试更为直观和方便。

SourceMap的核心在于其“mappings”字段，该字段通过一种高效的编码方式（如Base64 VLQ）来记录源码与编译后代码之间的行列对应关系。当浏览器开发者工具加载了SourceMap后，它可以根据这些映射信息将调试时的断点、错误堆栈等信息映射回原始的源代码上。

生成和使用SourceMap通常需要构建工具（如Webpack）的支持，这些工具会在构建过程中自动生成SourceMap文件，并在生成的代码中包含指向该文件的注释或HTTP响应头。浏览器在加载这些编译后的代码时，会检查并加载相应的SourceMap文件，以便在调试时使用。

需要注意的是，虽然SourceMap提高了调试的便利性，但也会增加一些性能开销和文件体积。因此，在生产环境中，通常需要根据实际情况选择是否生成和使用SourceMap。

<details>
<summary>参考答案</summary>

Source map 想必大家都不陌生。线上的代码多是压缩后的，如果线上有报错却只能调试那个代码多半是个噩梦。因此我们需要有一个桥梁帮助我们搭建起源代码及压缩后代码的联系，source map 就是起了这个作用。

以下是 MDN 对于 source map 的解释：

> 调试原始源代码会比浏览器下载的转换后的代码更加容易。 [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) 是从已转换的代码映射到原始源的文件，使浏览器能够重构原始源并在调试器中显示重建的原始源。

但是不知道大家有没有对 source map 的原理产生过疑问？先列出了四个疑问，不知道各位是不是也存在过这样的问题：

![Source map 四问](https://static.ecool.fun//article/05bdc382-77b5-4912-8dd4-bbe6452d1dac.jpeg)

接下来的内容会逐步为读者解答这四问。

## source map 文件是否影响网页性能

这个答案肯定是不会影响，否则构建相关的优化就肯定会涉及到对于 source map 的处理了，毕竟 source map 文件也不小。

其实 source map 只有在打开 dev tools 的情况下才会开始下载，相信大部分用户都不会去打开这个面板，所以这也就不是问题了。

这时可能会有读者想说：哎，但是我好像从来没有在 Network 里看到 source map 文件的加载呀？其实这只是浏览器隐藏了而已，如果大家使用抓包工具的话就能发现在打开 dev tools 的时候开始下载 source map 了。

## source map 存在标准嘛？

source map 是存在一个标准的，为 Google 及 Mozilla 的工程师制定，[文档地址](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)。正是因为存在这份标准，各个打包器及浏览器才能生成及使用 source map，否则就乱套了。

各个打包器基本都基于[该库](https://github.com/mozilla/source-map)来生成 source map，当然也存在一些魔改的方案，但是标准都是统一的。

通过上面的库生成出来的 source map 格式大致如下，大家也可以对比各个打包器的产物，格式及内容大部分都是一致的：

```json
{
  version: 3,
  file: "min.js",
  names: ["bar", "baz", "n"],
  sources: ["one.js", "two.js"],
  sourceRoot: "http://example.com/www/js/",
  mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA"
}
```

接下来介绍下重要字段的作用：

- version：顾名思义，指代了版本号，目前 source map 标准的版本为 3，也就是说这份 source map 使用的是第三版标准产出的
- file：编译后的文件名
- names：一个优化用的字段，后续会在 mappings 中用到
- sources：多个源文件名
- mappings：这是最重要的内容，表示了源代码及编译后代码的关系，但是先略过这块，下文中会详细解释

另外大部分应用都是由 webpack 来打包的，可能有些读者会发现 webpack 的 source map   产出的字段于上面的略微有些不一致。

这是因为 webpack 魔改了一些东西，但是底下还是基于这个库实现的，只是变动了一些不涉及核心的字段，[具体代码](https://github.com/webpack/webpack-sources/blob/master/lib/SourceMapSource.js)。

## 浏览器怎么知道源文件和 source map 的关系？

这里我们以 webpack 做个实验，通过 webpack5 对于以下代码进行打包：

```js
// index.js
const a = 1
console.log(a);
```

当我们开启 source map 选项以后，产物应该为两个文件，分别为 `bundle.js` 以及 `bundle.js.map`。

查看 `bundle.js` 文件以后我们会发现代码中存在这一一段注释：

```js
console.log(1);
//# sourceMappingURL=bundle.js.map
```

`sourceMappingURL` 就是标记了该文件的 source map 地址。

当然除此之外还有别的方式，通过查阅 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/SourceMap) 发现还可以通过 response header 的 `SourceMap: <url>` 字段来表明。

## source map 是如何对应到源代码的？

这是 source map 最核心的功能，也是最涉及知识盲区的一块内容。

大家应该还记得上文中没介绍的 `mapping` 字段吧，接下来我们就来详细了解这个字段的用处。

我们还是以刚才打包的文件为例，来看看产出的 source map 长啥样（去掉了无关紧要的）：

```json
{
  sources:["webpack://webpack-source-demo/./src/index.js"],
  names: ['console', 'log'],
  mappings: 'AACAA,QAAQC,IADE',
}
```

首先 `mappings` 的内容其实是 Base64 VLQ 的编码表示。

内容由三部分组成，分别为：

- 英文，表示源码及压缩代码的位置关联
- 逗号，分隔一行代码中的内容。比如说 `console.log(a)` 就由 `console` 、`log` 及 `a` 三部分组成，所以存在两个逗号。
- 分号，代表换行

逗号和分号想必大家没啥疑问，但是对于这几个英文内容应该会很困惑。

其实这就是一种压缩数字内容的编码方式，毕竟源代码可能很庞大，用数字表示行数及列数的话 source map 文件将也会很庞大，因此选用 Base 64 来代表数字用以减少文件体积。

比如说 `A` 代表了数字 0，`C` 代表了数字 2 等等，有兴趣的读者可以通过[该网站](https://www.murzwin.com/base64vlq.html)了解映射关系。

了解了这层编码的映射关系，我们再来聊聊这一串串英文到底代表了什么。

其实这每串英文中的字母都代表了一个位置：

1. 压缩代码的第几列
2. 哪个源代码文件，毕竟可以多个文件打包成一个，对应 `sources` 字段
3. 源代码第几行
4. 源代码第几列
5. `names` 字段里的索引

这时读者可能有个疑惑，为啥没有压缩代码的第几行表示？这是因为压缩后的代码就一行，所以只需要表示第几列就行了。

------

**更新：有读者询问 Base64 表达的数字是有上限的，如果需要表示的数字很大的话该怎么办。实际上除了每个分号中的第一串英文是用来表示代码的第几行第几列的绝对位置之外，后面的都是相对于之前的位置来做加减法的。**

------

了解完以上知识以后，我们就来根据上文的内容解析下 `AACAA` 的具体含义吧，通过[该网站](https://www.murzwin.com/base64vlq.html)我们可以知道 `AACAA` 对应了 `[0,0,1,0,0]`，这里需要注意的是数字都从 0 开始，笔者表述的时候会自动加一，毕竟代码第零行听起来怪怪的。

1. 压缩代码的第一列
2. 第一个源代码文件，也就是 `index.js` 文件了
3. 源代码第二行了
4. 源代码的第一列
5. `names` 数组中的第一个索引，也就是 `console`

通过以上的解析，我们就能知道 `console` 在源代码及压缩文件中的具体位置了。

但是为什么 source map 会知道编译后的代码具体在什么位置呢？这里就要用到 AST 了。让我们打开[网站](https://astexplorer.net/)输入 `console.log(a)` 后观察右边的内容，你应该会发现如图所示的数据：

![image-20210516214636867](https://static.ecool.fun//article/c05dd7b5-8f4b-4984-b02e-0041c2190368.jpeg)

因为 source map 是由 AST 产出的，所以我们能用上 AST 中的这个数据。

## source map 的应用

一般来说 source map 的应用都是在监控系统中，开发者构建完应用后，通过插件将源代码及 source map 上传至平台中。一旦客户端上报错误后，我们就可以通过[该库](https://github.com/mozilla/source-map)来还原源代码的报错位置（具体 API 看文档即可），方便开发者快速定位线上问题。

</details>

## 200. AST语法树是什么？ {#question-4b1c17f5-a42b-4853-9ff5-792a23d45050}

> 难度：3.5 · 类型：QA

### 题目要点

抽象语法树（AST，Abstract Syntax Tree）是一种用于表示程序源代码结构的数据结构。它将源代码解析成树形结构，每个节点代表源代码中的一个语法结构或语义概念。

在编译过程中，AST扮演了关键角色，主要用于以下几个方面：

1. **解析和验证**：通过解析源代码，生成AST，可以对代码进行验证和静态分析，包括检查语法错误、类型错误、变量引用等，以及发现潜在的问题或优化机会。
2. **优化和转换**：AST可以用于执行各种优化操作，如消除冗余代码、提取共享表达式、内联函数调用等。它还能进行代码转换，例如将ES6代码转换为ES5兼容的代码、将模板编译为渲染函数等。
3. **生成代码**：从AST中可以再次生成目标代码，如JavaScript、HTML、CSS等。这使得可以将源代码翻译为其他语言、在不同平台上执行代码等。

<details>
<summary>参考答案</summary>

AST是抽象语法树（Abstract Syntax Tree）的缩写，它是一种用于表示程序源代码结构的树状数据结构。AST可以将源代码解析为一个由节点组成的树形结构，每个节点代表着代码中的一个特定语法结构或语义概念。

在编译过程中，AST扮演了重要的角色。它被用于分析、转换和生成代码。以下是一些常见的使用情况：

1. **解析和验证**：通过解析源代码，将其转换为AST之后，可以对代码进行验证和静态分析。这包括检查语法错误、类型错误、变量引用等，并发现潜在的问题或优化机会。

2. **优化和转换**：AST可以用于执行各种优化操作，例如消除冗余代码、提取共享表达式、内联函数调用等。它还能够进行代码转换，例如将ES6代码转换为ES5兼容的代码、将模板编译为渲染函数等。

3. **生成代码**：从AST中可以再次生成目标代码，如JavaScript、HTML、CSS等。这使得可以将源代码翻译为其他语言、在不同平台上执行代码等。

AST通常是由多个节点组成的树状结构，每个节点代表一个语法单位或表达式。节点之间的关系通过父子关系或兄弟关系来表示程序的结构。在不同的编程语言和工具中，AST可能有不同的表示方式和节点类型。

通过使用AST，开发人员可以更好地理解和分析代码的结构，从而进行静态分析、优化和转换等操作。它也为很多编程工具提供了基础，如编译器、静态代码分析工具和IDE等。

</details>

## 201. flexible.js实现移动端适配的原理是什么？ {#question-3c003aad-68a0-4abf-8fbc-62e37b4f3b10}

> 难度：3 · 类型：QA

### 题目要点

`flexible.js` 是一个用于移动端适配的 JavaScript 库，它能够根据不同的屏幕尺寸动态地设置页面的根字体大小，从而实现响应式布局。其核心原理是利用了视口单位 `vw`（视口宽度）和 `vh`（视口高度）来定义布局。

`flexible.js` 的原理可以概括为以下几个步骤：

1. **设置视口宽度单位**：
   `flexible.js` 会首先将页面的根元素（通常是 `<html>`）的字体大小设置为 `100vw`，即视口宽度的100%。这样做的好处是，无论屏幕大小如何变化，根元素的大小总是与视口宽度成正比，从而保证了布局的响应性。
2. **计算根元素的实际字体大小**：
   `flexible.js` 会根据屏幕的宽度计算出根元素的实际字体大小。这个计算过程通常是基于设计稿的宽度（比如750px）和屏幕宽度之间的比例来进行的。例如，如果设计稿的宽度是750px，屏幕宽度是375px，那么根元素的字体大小就是 `750px / 375px = 2`。
3. **动态设置根元素字体大小**：
   `flexible.js` 会将计算出的根元素字体大小设置为实际的像素值，例如 `100px`。这样，整个页面的布局就会根据屏幕的宽度进行缩放，以适应不同的屏幕尺寸。
4. **确保页面元素的适配**：
   为了确保页面中的其他元素也能够适配不同屏幕尺寸，`flexible.js` 通常还会提供一个适配的函数，允许开发者为页面上的其他元素指定适配的像素值。这个函数会根据根元素的字体大小和设计稿的宽度来计算出相应的像素值。

<details>
<summary>参考答案</summary>

> flexible.js 官方已不再维护，目前推行 vw 适配方案，本答案只是为了分析它的原理。

flexible.js存在的目的，是为了让网页在各终端上的展示效果就像缩放设计稿图片一样，在不同屏幕上等比缩放，每一个元素与整体比例保持不变，真实还原设计稿。

# 基本原理

设页面宽度为P（单位px）

设计稿宽度为750px

设html基准值为X（单位px）

----

首先将页面分为100份，份的单位为F

设1F的像素值为A（单位px/F）

那么：

P = 100F * A

A = P/100F

当P为750时，A=7.5px/F，即一份为7.5px

有没有感觉这个A有点熟悉，没错它就是X，上面份的单位F其实就是rem。

（html font-size的基准值单位虽然写为px，但其实是px/F，这点你知道就可以了）

现在懂了吧。

rem的原理就是份，我们根据设计稿得到元素的份，写到代码中的也是份，现在只要动态改变html的基准值，就能够在不同屏幕下适配，从而还原设计稿尺寸了。

所以flexible.js的原理主要是：

window.onresize = function() {
    html.size = P/100 + 'px'
}

当然针对高清屏，它还会设置“viewport scale”，以缩放页面，解决类似高清屏下无法实现1px边框等问题。

需要注意的是，基准值其实是个动态值，只是在写代码时，我们是按照设计稿宽度计算的基准值写的rem，即以设计稿为标准进行屏幕适配的（将设计稿用代码还原成UI界面），但在实际运行时，页面宽度是动态的，所以基准值也是动态的哦。

# 源码解析

flexible.js 的源码并不多，总共不到 50 行：

```js
// 首先是一个立即执行函数，执行时传入的参数是window和document
(function flexible (window, document) {
  var docEl = document.documentElement // 返回文档的root元素
  var dpr = window.devicePixelRatio || 1
  // 获取设备的dpr，即当前设置下物理像素与虚拟像素的比值

  // 调整body标签的fontSize，fontSize = (12 * dpr) + 'px'
  // 设置默认字体大小，默认的字体大小继承自body
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px'
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize();

  // set 1rem = viewWidth / 10
  // 设置root元素的fontSize = 其clientWidth / 10 + ‘px’
  function setRemUnit () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
  }

  setRemUnit()

  // 当页面展示或重新设置大小的时候，触发重新
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit()
    }
  })

  // 检测0.5px的支持，支持则root元素的class中有hairlines
  if (dpr >= 2) {
    var fakeBody = document.createElement('body')
    var testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}(window, document))
```

</details>

## 202. JavaScript中的 sort 方法是怎么实现的？ {#question-807ac3c6-6e75-4cbf-9a5d-3084f860ea11}

> 难度：3.5 · 类型：QA

### 题目要点

JavaScript 中的 `sort` 方法用于对数组中的元素进行排序。它接受一个可选的比较函数作为参数，如果没有提供比较函数，则默认按照字符串Unicode码点进行升序排列。

以下是 `sort` 方法的实现原理：

1. **类型排序**：首先比较数组中相邻元素的类型。如果类型不同，则返回一个非零值，使得较小的类型在排序后位于前面。如果类型相同，则比较它们的原始值。
2. **原始值排序**：如果两个元素的类型相同，则比较它们的原始值。原始值指的是数组元素的值在 `sort` 方法被调用前的值。如果原始值不同，则返回一个非零值，使得较小的原始值在排序后位于前面。
3. **比较函数**：如果提供了比较函数，则 `sort` 方法会使用这个函数来比较数组中相邻元素的值。比较函数必须返回一个负、零或正整数，表示第一个参数应排在第二个参数之前、两者相等或之后。

下面是一个简单的 `sort` 方法实现的例子：

```javascript
function sort(array, compareFunction) {
  if (compareFunction) {
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        if (compareFunction(array[j], array[j + 1]) > 0) {
          // 如果 compareFunction 返回大于 0 的值，则交换 array[j] 和 array[j + 1]
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
  } else {
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        if (array[j] > array[j + 1]) {
          // 如果元素值大于相邻元素，则交换它们
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
  }
  return array;
}
```

这个例子展示了基本的冒泡排序算法，它是 `sort` 方法的一种可能的实现方式。需要注意的是，这个实现并不是 JavaScript 引擎内部 `sort` 方法的具体实现，而是一个简单的示例。实际上的实现可能会有所不同，并且可能使用了更高效的排序算法。

在 JavaScript 引擎内部，`sort` 方法通常会使用一个稳定的排序算法，如快速排序或归并排序，以保证排序的效率和稳定性。此外，JavaScript 引擎还会处理各种边界情况，如数组为空、数组只有一个元素等，以及可能的性能优化。

<details>
<summary>参考答案</summary>

本答案将介绍js中常用的几种排序算法，并结合v8中相关源码分析sort实现的策略

## 常见排序算法
首先温习下排序算法需要关注的两大要素

### 时间复杂度
描述该算法的运行时间，通常用`大O`描述，附上一张时间复杂度曲线图帮助理解

![image.png](https://static.ecool.fun//article/d64d13f8-0600-4d41-b958-cb3f0b96a9f8.jpeg)

### 空间复杂度
度量一个算法在运行过程中占用存储空间大小

### 常见排序
常见的[十大经典排序算法](https://gitee.com/webfrontup/javascript-algorithms)就不在这科普了，根据特性可将它们从不同角度进行分类

- 是否基于比较：比较类排序和非比较类排序

- 是否稳定：稳定类排序和不稳定类排序

通常我们`从是否基于排序`的视角进行分类

- 比较类排序

  通过比较来决定元素间的相对次序，其时间复杂度不能突破` O(nlogn)`，因此也称为`非线性时间比较`类排序。
- 非比较类排序

  不通过比较来决定元素间的相对次序，它可以突破基于比较排序的时间下界，以`线性时间运行`，因此也称为`线性时间非比较`类排序。

具体分类枚举可以结合下图理解

![image.png](https://static.ecool.fun//article/9ea8e675-8240-438a-b988-187c03dac21e.jpeg)

接下来我们写下几个常见的经典排序

#### 快速排序
快速排序主要使用`递归分支`的思想，通过一趟排序，将待排记录分隔成独立的两部分，其中一部分记录的关键字均比另一部分的关键字小，则可以分别对这两部分记录继续进行排序，以达到整个序列有序。

```js
var a = [ 25, 76, 34, 232, 6, 456, 221];
function quickSort(array) {
  var quick = function(arr) {
    if (arr.length <= 1) return arr
    const index = Math.floor(len >> 1)
    const pivot = arr.splice(index, 1)[0]
    const left = []
    const right = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > pivot) {
        right.push(arr[i])
      } else if (arr[i] <= pivot) {
        left.push(arr[i])
      }
    }
    return quick(left).concat([pivot], quick(right))
  }
  const result = quick(array)
  return result

}
quickSort(a);//  [ 6, 25, 34, 76, 221, 232, 456]
```

#### 堆排序
堆排序是指利用堆这种数据结构所设计的一种排序算法。堆积是一个近似完全二叉树的结构，并同时满足堆积的性质，即子结点的键值或索引总是小于（或者大于）它的父节点。堆的底层实际上就是一棵`完全二叉树`，可以用数组实现。

根节点最大的堆叫作`大根堆`，根节点最小的堆叫作`小根堆`，你可以根据从大到小排序或者从小到大来排序，分别建立对应的堆就可以。请看下面的代码。

```js
var a = [25, 76, 34, 232, 6, 456, 221];
function heap_sort(arr) {
  var len = arr.length
  var k = 0
  function swap(i, j) {
    var temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }

  function max_heapify(start, end) {
    var dad = start
    var son = dad * 2 + 1
    if (son >= end) return
    if (son + 1 < end && arr[son] < arr[son + 1]) {
      son++
    }
    if (arr[dad] <= arr[son]) {
      swap(dad, son)
      max_heapify(son, end)
    }
  }
  for (var i = Math.floor(len / 2) - 1; i >= 0; i--) {
    max_heapify(i, len)
  }

  for (var j = len - 1; j > k; j--) {
    swap(0, j)
    max_heapify(0, j)
  }
  return arr
}

heap_sort(a); // [6, 25, 34, 76, 221, 232, 456]
```

#### 归并排序
归并排序是建立在`归并`操作上的一种有效的排序算法，该算法是采用`分治法`的一个非常典型的应用。将已有序的子序列合并，得到完全有序的序列；先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为`二路归并`。

```js
var a = [25, 76, 34, 232, 6, 456, 221];
function mergeSort(array) {
  const merge = (right, left) => {
    const result = []
    let il = 0
    let ir = 0
    while (il < left.length && ir < right.length) {
      if (left[il] < right[ir]) {
        result.push(left[il++])
      } else {
        result.push(right[ir++])
      }
    }
    while (il < left.length) {
      result.push(left[il++])
    }
    while (ir < right.length) {
      result.push(right[ir++])
    }
    return result
  }
  const mergeSort = array => {
    if (array.length === 1) { return array }
    const mid = Math.floor(array.length / 2)
    const left = array.slice(0, mid)
    const right = array.slice(mid, array.length)
    return merge(mergeSort(left), mergeSort(right))
  }
  return mergeSort(array)
}
mergeSort(a); // [6, 25, 34, 76, 221, 232, 456]

```

最后附上一张各排序算法统计对照表:

![image.png](https://static.ecool.fun//article/139cfecc-7643-41c3-8b25-0113826c6ea6.jpeg)

## js中的sort方法

### sort方法基本使用

> arr.sort([compareFunction])

如果不传入 compareFunction，则元素按照转换为字符串的各个字符的 `Unicode` 位点进行排序，有些同学经常在整数排序上犯错误，多半是因为遗漏了这一规则

```js
const names = ['tom', 'jesse', 'jack'];
names.sort();

console.log(names);
// ["jack", "jesse", "tom"]

const array1 = [1, 30, 4, 21, 100000];
array1.sort();

console.log(array1);
// [1, 100000, 21, 30, 4]
```
如果指明了 compareFunction 参数 ，那么数组会按照调用该函数的`返回值排序`，即 a 和 b 是两个将要被比较的元素：
- compareFunction（a, b）< 0，a 会被排列到 b 之前
- compareFunction（a, b）=== 0，a 和 b 的相对位置不变
- compareFunction（a, b）> 0，b 会被排列到 a 之前

### sort源码分析
查阅 [v8源码sort部分](https://github.com/v8/v8/blob/98d735069d0937f367852ed968a33210ceb527c2/src/js/array.js#L709) 我们可以发现，对于需要排序的元素个数n，具体排序策略有几下中情形：

- 当 n<=10 时，采用`插入排序`；
- 当 n>10 时，采用`三路快速排序`；
- 10<n <=1000，采用中位数作为哨兵元素；
- n>1000，每隔 200~215 个元素挑出一个元素，放到一个新数组中，然后对它排序，找到中间位置的数，以此作为中位数。

乍一看结论你可能会纠结两个问题

##### 1、为何元素较少的时候要用快排

其实仔细分析一下不难究其原因。对于插排和快排，理论上的平均时间复杂度分别为O(n^2)和O(nlogn)，其中插排在最好情况下的时间复杂度是 O(n)。对比不难得出结论，当n足够小的时候，快排优势变小。事实上插排经优化后对于小数据集的排序性能可以超过快排。

##### 2、为何要选择哨兵元素

因为快速排序的性能瓶颈在于`递归的深度`，最坏的情况是每次的哨兵都是最小元素或者最大元素，那么进行 partition（一边是小于哨兵的元素，另一边是大于哨兵的元素）时，就会有一边是空的。如果这么排下去，递归的层数就达到了` n `, 而每一层的复杂度是` O(n)`，因此快排这时候会`退化`成` O(n^2) `级别。

这种情况是要尽力避免的，那么如何来避免？就是让哨兵元素尽可能地处于数组的中间位置，让最大或者最小的情况尽可能少

最后我们看下源码中的sort的基本结构

```js
function ArraySort(comparefn) {
    CHECK_OBJECT_COERCIBLE(this,"Array.prototype.sort");
    var array = TO_OBJECT(this);
    var length = TO_LENGTH(array.length);
    return InnerArraySort(array, length, comparefn);
}
function InnerArraySort(array, length, comparefn) {
// 比较函数未传入
if (!IS_CALLABLE(comparefn)) {
      comparefn = function (x, y) {
        if (x === y) return 0;
        if (%_IsSmi(x) && %_IsSmi(y)) {
          return %SmiLexicographicCompare(x, y);
        }
        x = TO_STRING(x);
        y = TO_STRING(y);
        if (x == y) return 0;
        else return x < y ? -1 : 1;
   };
}
function InsertionSort(a, from, to) {
  // 插入排序
  for (var i = from + 1; i < to; i++) {
        var element = a[i];
        for (var j = i - 1; j >= from; j--) {
          var tmp = a[j];
          var order = comparefn(tmp, element);
          if (order > 0) {
            a[j + 1] = tmp;
          } else {
            break;
          }
        }
      a[j + 1] = element;
   }
}
function GetThirdIndex(a, from, to) {   // 元素个数大于1000时寻找哨兵元素
  var t_array = new InternalArray();
  var increment = 200 + ((to - from) & 15);
  var j = 0;
  from += 1;
  to -= 1;
  for (var i = from; i < to; i += increment) {
     t_array[j] = [i, a[i]];
     j++;
  }
  t_array.sort(function(a, b) {
     return comparefn(a[1], b[1]);
  });
  var third_index = t_array[t_array.length >> 1][0];
  return third_index;
}
function QuickSort(a, from, to) {  // 快速排序实现
      //哨兵位置
      var third_index = 0;
      while (true) {
        if (to - from <= 10) {
          InsertionSort(a, from, to); // 数据量小，使用插入排序，速度较快
          return;
        }
        if (to - from > 1000) {
          third_index = GetThirdIndex(a, from, to);
        } else {
          // 小于1000 直接取中点
          third_index = from + ((to - from) >> 1);
        }
        // 下面开始快排
        var v0 = a[from];
        var v1 = a[to - 1];
        var v2 = a[third_index];
        var c01 = comparefn(v0, v1);
        if (c01 > 0) {
          var tmp = v0;
          v0 = v1;
          v1 = tmp;
        }
        var c02 = comparefn(v0, v2);
        if (c02 >= 0) {
          var tmp = v0;
          v0 = v2;
          v2 = v1;
          v1 = tmp;
        } else {
          var c12 = comparefn(v1, v2);
          if (c12 > 0) {
            var tmp = v1;
            v1 = v2;
            v2 = tmp;
          }
        }
        a[from] = v0;
        a[to - 1] = v2;
        var pivot = v1;
        var low_end = from + 1;
        var high_start = to - 1;
        a[third_index] = a[low_end];
        a[low_end] = pivot;
        partition: for (var i = low_end + 1; i < high_start; i++) {
          var element = a[i];
          var order = comparefn(element, pivot);
          if (order < 0) {
            a[i] = a[low_end];
            a[low_end] = element;
            low_end++;
          } else if (order > 0) {
            do {
              high_start--;
              if (high_start == i) break partition;
              var top_elem = a[high_start];
              order = comparefn(top_elem, pivot);
            } while (order > 0);
            a[i] = a[high_start];
            a[high_start] = element;
            if (order < 0) {
              element = a[i];
              a[i] = a[low_end];
              a[low_end] = element;
              low_end++;
            }
          }
        }
        // 快排的核心思路，递归调用快速排序方法
        if (to - high_start < low_end - from) {
          QuickSort(a, high_start, to);
          to = low_end;
        } else {
          QuickSort(a, from, low_end);
          from = high_start;
        }
    }
  }
```

</details>

## 203. cookie、localStorage和sessionStorage 三者之间有什么区别 {#question-718abe6b-08ab-4669-bc33-187fabad8fec}

> 难度：2 · 类型：QA

### 题目要点

是cookie、localStorage和sessionStorage三者的区别：

1. **存储时间**：
   - cookie：可设置有效期，甚至永久。
   - sessionStorage：当前会话有效，窗口或标签页关闭即失效。
   - localStorage：除非手动删除，否则永久存储。

2. **存储容量**：
   - cookie：较小，约4KB，且总数有限制。
   - sessionStorage和localStorage：较大，通常约5MB。

3. **与服务端通信**：
   - cookie：会随HTTP请求发送到服务器。
   - sessionStorage和localStorage：不参与与服务端的通信。

4. **数据共享性**：
   - cookie和localStorage：同源下所有窗口/标签页共享。
   - sessionStorage：仅当前窗口/标签页有效。

5. **操作便捷性**：
   - cookie：读写较繁琐，需手动解析字符串。
   - sessionStorage和localStorage：提供简单API（setItem, getItem等）进行读写操作。

<details>
<summary>参考答案</summary>

## 生命周期

* cookie：可设置失效时间，没有设置的话，默认是关闭浏览器后失效
* localStorage：除非被手动清除，否则将会永久保存。
* sessionStorage： 仅在当前网页会话下有效，关闭页面或浏览器后就会被清除。

## 存放数据大小

* cookie：4KB左右
* localStorage和sessionStorage：可以保存5MB的信息。

## http请求

* cookie：每次都会携带在HTTP头中，如果使用cookie保存过多数据会带来性能问题
* localStorage和sessionStorage：仅在客户端（即浏览器）中保存，不参与和服务器的通信

## 易用性

* cookie：需要程序员自己封装，原生的 Cookie API 不友好
* localStorage和sessionStorage：原生 API 可以接受，亦可再次封装来对Object和Array有更好的支持

## 应用场景

从安全性来说，因为每次http请求都会携带cookie信息，这样无形中浪费了带宽，所以cookie应该尽可能少的使用，另外cookie还需要指定作用域，不可以跨域调用（当前页面只能读取页面所在域的 `cookie`，即 `document.cookie` ），限制比较多。但是用来识别用户登录来说，cookie还是比storage更好用的。其他情况下，可以使用storage，就用storage。

storage在存储数据的大小上面秒杀了cookie，现在基本上很少使用cookie了。

localStorage和sessionStorage唯一的差别一个是永久保存在浏览器里面，一个是关闭网页就清除了信息。localStorage可以用来夸页面传递参数，sessionStorage用来保存一些临时的数据，防止用户刷新页面之后丢失了一些参数。

</details>

## 204. 使用js实现二分查找 {#question-4a29429d-d77e-46be-a4fd-099ba208c52f}

> 难度：2 · 类型：QA

### 题目要点

二分查找，也称为折半查找，是指在有序的数组里找出指定的值，返回该值在数组中的索引。

<details>
<summary>参考答案</summary>

二分查找，也称为折半查找，是指在有序的数组里找出指定的值，返回该值在数组中的索引。

查找步骤如下：

1. 从有序数组的最中间元素开始查找，如果该元素正好是指定查找的值，则查找过程结束。否则进行下一步;
2. 如果指定要查找的元素大于或者小于中间元素，则在数组大于或小于中间元素的那一半区域查找，然后重复第一步的操作;
3. 重复以上过程，直到找到目标元素的索引，查找成功;或者直到子数组为空，查找失败。

优点是比较次数少，查找速度快，平均性能好；
其缺点是要求待查表为**有序表**，且插入删除困难。因此，折半查找方法适用于不经常变动而查找频繁的有序列表。

## 实现方式

### 非递归

```js
//arr:数组;key:查找的元素
function search(arr, key) {
    //初始索引开始位置和结束位置
    var start = 0,
        end = arr.length - 1;
    while(start <= end) {
        //取上限和下限中间的索引
        var mid = parseInt((end + start) /2);
        if(key == arr[mid]) {
            //如果找到则直接返回
            return mid;
        } else if(key > arr[mid]) {
            //如果key是大于数组中间索引的值则将索引开始位置设置为中间索引+1
            start = mid + 1;
        } else {
            //如果key是小于数组中间索引的值则将索引结束位置设置为中间索引-1
            end = mid -1;
        }
    }
    //如果在循环内没有找到查找的key(start<=end)的情况则返回-1
    return -1;
}
var arr = [0,13,21,35,46,52,68,77,89,94];
search(arr, 68); //6
search(arr, 1); //-1
```

### 递归
```js
//arr:数组;key:查找的元素;start:开始索引;end:结束索引
function search2(arr,key,start,end){
    //首先判断当前起始索引是否大于结束索引,如果大于说明没有找到元素返回-1
    if(start > end) {
        return -1;
    }
    //如果手动调用不写start和end参数会当做第一次运行默认值
    //三元表达式:如果不写end参数则为undefined说明第一次调用所以结束索引为arr.length-1
    //如果是递归调用则使用传进来的参数end值
    var end= end===undefined ? arr.length-1 : end;
    //如果 || 前面的为真则赋值start,如果为假则赋值后面的0
    //所以end变量没有写var end = end || arr.length-1;这样如果递归调用时候传参end为0时会被转化为false,导致赋值给arr.length-1造成无限循环溢出;
    var start=start || 0;
    //取中间的索引
    var mid=parseInt((start+end)/2);
    if(key==arr[mid]){
        //如果找到则直接返回
        return mid;
    }else if(key<arr[mid]){
        //如果key小于则递归调用自身,将结束索引设置为中间索引-1
        return search2(arr,key,start,mid-1);
    }else{
        //如果key大于则递归调用自身,将起始索引设置为中间索引+1
        return search2(arr,key,mid+1,end);
    }
}
var arr = [0,13,21,35,46,52,68,77,89,94];
search2(arr, 77); //7
search2(arr, 99); //-1
```

</details>

## 205. 前端怎么实现跨域请求？ {#question-56e56a05-99c7-4701-ae72-e06d2c6a4d42}

> 难度：3 · 类型：QA

### 题目要点

**答题思路：**

跨域是指浏览器出于安全考虑，限制不同源之间的资源请求。同源策略限制存储内容、DOM节点和AJAX请求。但某些HTML标签如`<img>`、`<link>`、`&lt;script&gt;`可跨域加载资源。跨域并非请求发不出，而是响应被浏览器拦截。
跨域解决方案包括：

1. **CORS**：服务器设置`Access-Control-Allow-Origin`等头部，允许跨域请求。分为简单请求和非简单请求，后者需发送预检请求。
2. **Nginx代理**：配置代理服务器转发请求，修改请求头实现跨域。
3. **Node中间件代理**：在开发环境中使用中间件代理跨域请求。
4. **WebSocket**：HTML5协议，不实行同源策略，服务器支持即可跨域通信。
5. **postMessage**：HTML5 API，用于窗口间跨域数据传递。
6. **JSONP**：通过`&lt;script&gt;`标签跨域获取数据，只支持GET请求，存在安全隐患。

跨域时处理Cookie：

- 在Cookie设置`SameSite`属性，控制跨域请求是否发送Cookie。
- Chrome 80后默认`SameSite`为`lax`，之前为`none`。
- `SameSite=None`必须与`Secure`属性一起使用，表示Cookie只能通过HTTPS发送。

<details>
<summary>参考答案</summary>

## 什么是跨域？

### 1.什么是同源策略及其限制内容？

同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。所谓同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

同源策略限制内容有：

* Cookie、LocalStorage、IndexedDB 等存储性内容
* DOM 节点
* AJAX 请求发送后，结果被浏览器拦截了

但是有三个标签是允许跨域加载资源：

* `<img src=XXX>`
* `<link href=XXX>`
* `&lt;script src=XXX&gt;`

### 2.常见跨域场景

当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域。不同域之间相互请求资源，就算作“跨域”。

特别说明两点：

* 第一：如果是协议和端口造成的跨域问题“前台”是无能为力的。
* 第二：在跨域问题上，仅仅是通过“URL的首部”来识别而不会根据域名对应的IP地址是否相同来判断。“URL的首部”可以理解为“协议, 域名和端口必须匹配”。

跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。你可能会疑问明明通过表单的方式可以发起跨域请求，为什么 Ajax 就不会?因为归根结底，跨域是为了阻止用户读取到另一个域名下的内容，Ajax 可以获取响应，浏览器认为这不安全，所以拦截了响应。但是表单并不会获取新的内容，所以可以发起跨域请求。同时也说明了跨域并不能完全阻止 CSRF，因为请求毕竟是发出去了。

## 跨域有哪些方案？

这里只介绍几种开发中用的比较多的，几乎用不到的比如：

- document.domain + iframe：适用主域名相同，子域名不同的跨域场景
- window.name + iframe：利用name值最长可以 2M ，并用不同页面或不同域名加载后依然存在的特性
- location.hash + iframe：适用通过 C 页面来实现 A 页面与 B 页面通信的场景

就不过多展开了

### 1. **CORS**

CORS 通信过程都是浏览器自动完成，需要浏览器(都支持)和服务器都支持，所以关键在**只要服务器支持，就可以跨域通信**，CORS请求分两类，`简单请求`和`非简单请求`

另外CORS请求**默认不包含Cookie以及HTTP认证信息**，如果需要包含Cookie，需要满足几个条件：
- 服务器指定了 `Access-Control-Allow-Credentials: true`
- 开发者须在请求中打开withCredentials属性: `xhr.withCredentials = true`
- `Access-Control-Allow-Origin不要设为星号`，指定明确的与请求网页一致的域名，这样就不会把其他域名的Cookie上传

#### 简单请求

需要同时满足两个条件，就属于简单请求：

- 请求方法是：`HEAD`、`GET`、`POST`，三者之一
- 请求头信息不超过以下几个字段：
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-Id
    - Content-Type：值为三者之一application/x-www/form/urlencoded、multipart/form-data、text/plain

需要这些条件是为了兼容表单，因为历史上表单一直可以跨域

浏览器直接发出CORS请求，具体来说就是在头信息中增加Origin字段，表示请求来源来自哪个域(协议+域名+端口)，服务器根据这个值决定是否同意请求。如果同意，返回的响应会多出以下响应头信息

```js
Access-Control-Allow-Origin: http://juejin.com // 和 Orign 一致  这个字段是必须的
Access-Control-Allow-Credentials: true // 表示是否允许发送 Cookie  这个字段是可选的
Access-Control-Expose-Headers: FooBar // 指定返回其他字段的值   这个字段是可选的
Content-Type: text/html; charset=utf-8 // 表示文档类型
```

在简单请求中服务器至少需要设置：`Access-Control-Allow-Origin` 字段

#### 非简单请求

比如 PUT 或 DELETE 请求，或 Content-Type 为 application/json ，就是非简单请求。

非简单 CORS 请求，**正式请求前会发一次 OPTIONS 类型的查询请求**，称为`预检请求`，询问服务器是否支持网页所在域名的请求，以及可以使用哪些头信息字段。只有收到肯定的答复，才会发起正式XMLHttpRequest请求，否则报错

预检请求的方法是OPTIONS，它的头信息中有几个字段

- Origin: 表示请求来自哪个域，这个字段是必须的
- Access-Control-Request-Method：列出CORS请求会用到哪些HTTP方法，这个字段是必须的
- Access-Control-Request-Headers： 指定CORS请求会额外发送的头信息字段，用逗号隔开

OPTIONS请求次数过多也会损耗性能，所以要尽量减少OPTIONS请求，可以让服务器在请求返回头部添加
```js
Access-Control-Max-Age: Number // 数字 单位是秒
```
表示预检请求的返回结果可以被缓存多久，在这个时间范围内再请求就不需要预检了。不过这个缓存只对完全一样的URL才会生效

### 2. Nginx代理跨域

配置一个代理服务器向服务器请求，再将数据返回给客户端，实质和CORS跨域原理一样，需要配置请求响应头Access-Control-Allow-Origin等字段

```js
server {
    listen 81; server_name www.domain1.com;
    location / {
        proxy_pass http://xxxx1:8080; // 反向代理
        proxy_cookie_domain www.xxxx1.com www.xxxx2.com; // 修改cookie里域名
        index index.html index.htm;
        // 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.xxxx2.com; // 当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```

### 3. Node中间件代理跨域

在 Vue 中 vue.config.js 中配置
```js
module.export = {
    ...
    devServer: {
        proxy: {
            [ process.env.VUE_APP_BASE_API ]: {
                target: \'http://xxxx\',//代理跨域目标接口
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    [ \'^\' + process.env.VUE_APP_BASE_API ] : \'\'
                }
            }
        }
    }
}
```
Node + express
```js
const express = require(\'express\')
const proxy = require(\'http-proxy-middleware\')
const app = express()
app.use(\'/\', proxy({
    // 代理跨域目标接口
    target: \'http://xxxx:8080\',
    changeOrigin: true,
    // 修改响应头信息，实现跨域并允许带cookie
    onProxyRes: function(proxyRes, req, res) {
        res.header(\'Access-Control-Allow-Origin\', \'http://xxxx\')
        res.header(\'Access-Control-Allow-Credentials\', \'true\')
    },
    // 修改响应信息中的cookie域名
    cookieDomainRewrite: \'www.domain1.com\' // 可以为false，表示不修改
}));
app.listen(3000);
```

### 4. WebSocket

WebSocket是HTML5标准中的一种通信协议，以`ws://`(非加密)和`wss://`(加密)作为协议前缀，该协议不实行同源政策，只要服务器支持就行

因为WebSocket请求头信息中有Origin字段，表示请求源来自哪个域，服务器可以根据这个字段判断是否允许本次通信，如果在白名单内，就可以通信

### 5. postMessage

postMessage是HTML5标准中的API，它可以给我们解决如下问题：

- 页面和新打开的窗口间数据传递
- 多窗口之间数据传递
- 页面与嵌套的 iframe 之间数据传递
- 上面三个场景之间的`跨域传递`

postMessage 接受两个参数，用法如下：
- **参数一**：发送的数据
- **参数二**：你要发送给谁就写谁的地址`(协议 + 域名 +端口`)，也可以设置为`*`，表示任意窗口，为`/`表示与当前窗口同源的窗口

### 6. JSONP

原理就是通过添加一个&lt;script&gt;标签，向服务器请求JSON数据，这样不受同源政策限制。服务器收到请求后，将数据放在一个callback回调函数中传回来。比如axios。

不过`只支持GET请求`且`不安全`，**可能遇到XSS攻击，不过它的好处是可以向老浏览器或不支持CORS的网站请求数据**

```js
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://juejin.com/xxx?callback=handleCallback'
    document.body.appendChild(script)

    function handleCallback(res){
        console.log(res)
    }
```
服务器返回并立即执行
```js
handleCallback({ code: 200, msg: 'success', data: [] })
```

## 跨域时 Cookie 要做何处理？

指的就是对第三方使用 Cookie 的设置，在 Cookie 信息中添加 `SameSite` 属性

```js
Set-Cookie: widget_session=123456; SameSite=None; Secure
```

SameSite 有三个值：
- `strict`：严格模式，完全禁止使用Cookie
- `lax`：宽松模式，允许部分情况使用Cookie，`跨域的都行`，a标签跳转，link标签，GET提交的表单
- `none`：任何情况下都会发送Cookie，但必须同时设置Secure属性，意思是需要安全上下文，Cookie `只能通过https发送`，否则无效

Chrome 80之前默认值是none，之后是lax

不过在最新的 `Chrome91` 版本中这个`已经被移除`了，所以在 91之前的版本依然可以使用

如果 Chrome 或 Edge 版本大于91小于94的话，可以通过[Chromium支持的command-line flag](https://peter.sh/experiments/chromium-command-line-switches/)

- 右键 Chrome 或 Edge 浏览器，选择属性
- 在目标(Target)属性末尾加上

```js
 --disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure
```

并且官方说的到 94 版本会连 comman-line 也会移除

官方的说法是任由开发者控制这两个选项，容易被攻击

</details>

## 206. 怎么实现图片懒加载？ {#question-d3f21598-edfa-48f4-b2d3-d0c19d754b10}

> 难度：3 · 类型：QA

### 题目要点

#### HTML实现

最简单的方式是使用HTML5的`loading="lazy"`属性，这可以让浏览器自动识别哪些图片可以延迟加载。

```html
<img src="./example.jpg" loading="lazy">
```

这种方法简单易用，且兼容性较好。

#### JavaScript实现

通过JavaScript实现懒加载，需要监听页面的滚动事件，并在用户滚动到图片可见区域时加载图片。这通常涉及到获取页面中的所有图片元素，并判断它们是否在视口中。如果在，则设置图片的`src`属性，完成图片加载。

```html
<img data-src="http://xx.com/xx.png" src="" />
```

在图片进入可视区域时，将`data-src`属性中的值赋给`src`属性。

```js
function lazyload() {
  let viewHeight = window.innerHeight || document.documentElement.clientHeight;
  let imgs = document.querySelectorAll('img[data-src]');
  imgs.forEach((item, index) => {
    if (item.dataset.src === '') return;
    let rect = item.getBoundingClientRect();
    if (rect.bottom >= 0 && rect.top < viewHeight) {
      item.src = item.dataset.src;
      item.removeAttribute('data-src');
    }
  });
}
```

通过绑定`window`的`scroll`事件来实现。

#### IntersectionObserver

`IntersectionObserver`是一个现代浏览器API，可以自动检测元素是否在视口中。这可以避免使用`scroll`事件和计算视口位置的复杂性。

```js
let observer = new IntersectionObserver((entries, self) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      let img = entry.target;
      let src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
      self.unobserve(entry.target);
    }
  });
}, config);
imgs.forEach((image) => {
  observer.observe(image);
});
```

<details>
<summary>参考答案</summary>

懒加载是一种网页性能优化的方式，它能极大的提升用户体验。就比如说图片，图片一直是影响网页性能的主要元凶，现在一张图片超过几兆已经是很经常的事了。如果每次进入页面就请求所有的图片资源，那么可能等图片加载出来用户也早就走了。所以，我们需要懒加载，进入页面的时候，只请求可视区域的图片资源。

总结出来就两个点：

1. 全部加载的话会影响用户体验
2. 浪费用户的流量，有些用户并不想全部看完，全部加载会耗费大量流量。

# 实现方式

## html 实现

最简单的实现方式是给 `img` 标签加上 `loading="lazy"`，比如

```html
<img src="./example.jpg" loading="lazy">
```

该属性的兼容性也还行，大家生产环境可以使用。

![image.png](https://static.ecool.fun//article/d08ca711-557a-4da4-88c7-8bdcb20a7fab.png)

## js实现原理

我们通过js监听页面的滚动也能实现。

使用js实现的原理主要是判断当前图片是否到了可视区域：

* 拿到所有的图片 dom 。
* 遍历每个图片判断当前图片是否到了可视区范围内。
* 如果到了就设置图片的 src 属性。
* 绑定 window 的 scroll 事件，对其进行事件监听。

在页面初始化的时候，<img>图片的src实际上是放在data-src属性上的，当元素处于可视范围内的时候，就把data-src赋值给src属性，完成图片加载。

```html
// 在一开始加载的时候
<img data-src="http://xx.com/xx.png" src="" />

// 在进入可视范围内时
<img data-src="http://xx.com/xx.png" src="http://xx.com/xx.png" />
```

<div>使用背景图来实现，原理也是一样的，把图片链接存放在 `data-src` 中，在可视范围时，就把data-src赋值给 `background-image` 属性，完成图片加载。

```html
// 在一开始加载的时候
<div
  data-src="http://xx.com/xx.png"
  style="background-image: none;background-size: cover;"
></div>

// 在进入可视范围内时
<div
  data-src="http://xx.com/xx.png"
  style="background-image: url(http://xx.com/xx.png);background-size: cover;"
></div>
```

下面展示一个demo：

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Lazyload</title>
    <style>
      img {
        display: block;
        margin-bottom: 50px;
        height: 200px;
        width: 400px;
      }
    </style>
  </head>
  <body>
    <img src="./img/default.png" data-src="./img/1.jpg" />
    <img src="./img/default.png" data-src="./img/2.jpg" />
    <img src="./img/default.png" data-src="./img/3.jpg" />
    <img src="./img/default.png" data-src="./img/4.jpg" />
    <img src="./img/default.png" data-src="./img/5.jpg" />
    <img src="./img/default.png" data-src="./img/6.jpg" />
    <img src="./img/default.png" data-src="./img/7.jpg" />
    <img src="./img/default.png" data-src="./img/8.jpg" />
    <img src="./img/default.png" data-src="./img/9.jpg" />
    <img src="./img/default.png" data-src="./img/10.jpg" />
  </body>
</html>
```

先获取所有图片的 dom，通过 `window.innerHeight || document.documentElement.clientHeight|| document.body.clientHeight` 获取可视区高度，再使用 `element.getBoundingClientRect()` API 直接得到元素相对浏览的 top 值， 遍历每个图片判断当前图片是否到了可视区范围内。代码如下：

```js
function lazyload() {
  let viewHeight = window.innerHeight || document.documentElement.clientHeight|| document.body.clientHeight //获取可视区高度，兼容不同浏览器
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
```

最后给 window 绑定 onscroll 事件

```js
window.addEventListener('scroll', lazyload)
```

主要就完成了一个图片懒加载的操作了。但是这样存在较大的性能问题，因为 scroll 事件会在很短的时间内触发很多次，严重影响页面性能，为了提高网页性能，我们需要一个节流函数来控制函数的多次触发，在一段时间内（如 200ms）只执行一次回调。

下面实现一个节流函数

```js
function throttle(fn, delay) {
  let timer
  let prevTime
  return function (...args) {
    const currTime = Date.now()
    const context = this
    if (!prevTime) prevTime = currTime
    clearTimeout(timer)

    if (currTime - prevTime > delay) {
      prevTime = currTime
      fn.apply(context, args)
      clearTimeout(timer)
      return
    }

    timer = setTimeout(function () {
      prevTime = Date.now()
      timer = null
      fn.apply(context, args)
    }, delay)
  }
}
```

然后修改一下 srcoll 事件

```js
window.addEventListener('scroll', throttle(lazyload, 200))
```

## 拓展： IntersectionObserver

通过上面例子的实现，我们要实现懒加载都需要去监听 scroll 事件，尽管我们可以通过函数节流的方式来阻止高频率的执行函数，但是我们还是需要去计算 scrollTop，offsetHeight 等属性，有没有简单的不需要计算这些属性的方式呢，答案就是 `IntersectionObserver`。

`IntersectionObserver` 是一个比较新的 API，可以自动"观察"元素是否可见，Chrome 51+ 已经支持。由于可见（visible）的本质是，目标元素与视口产生一个交叉区，所以这个 API 叫做"交叉观察器"。我们来看一下它的用法：

```js
var io = new IntersectionObserver(callback, option)

// 开始观察
io.observe(document.getElementById('example'))

// 停止观察
io.unobserve(element)

// 关闭观察器
io.disconnect()

```

IntersectionObserver 是浏览器原生提供的构造函数，接受两个参数：callback 是可见性变化时的回调函数，option 是配置对象（该参数可选）。

目标元素的可见性变化时，就会调用观察器的回调函数 callback。callback 一般会触发两次。一次是目标元素刚刚进入视口（开始可见），另一次是完全离开视口（开始不可见）。

下面我们用 IntersectionObserver 实现图片懒加载

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

</details>

## 207. 我现在有一个canvas，上面随机布着一些黑块，请实现方法，计算canvas上有多少个黑块。 {#question-b866f9eb-e02a-4220-b35a-013db09ce0c2}

> 难度：3 · 类型：QA

### 题目要点

这一题可以转化成图的联通分量问题。通过getImageData获得像素数组，从头到尾遍历一遍，就可以判断每个像素是否是黑色。同时，准备一个width * height大小的二维数组，这个数组的每个元素是1/0。如果是黑色，二维数组对应元素就置1；否则置0。

<details>
<summary>参考答案</summary>

这一题可以转化成图的联通分量问题。通过getImageData获得像素数组，从头到尾遍历一遍，就可以判断每个像素是否是黑色。同时，准备一个width * height大小的二维数组，这个数组的每个元素是1/0。如果是黑色，二维数组对应元素就置1；否则置0。

然后问题就被转换成了图的连通分量问题。可以通过深度优先遍历或者并查集来实现。

</details>

## 208. 怎么解决canvas中获取跨域图片数据的问题？ {#question-87408912-b244-4727-951c-65993c6dbcff}

> 难度：3 · 类型：QA

### 题目要点

解决Canvas中获取跨域图片数据的问题，方法如下：

1. **配置CORS**：
   - 确保图片服务器支持CORS，并在HTTP响应中包含`Access-Control-Allow-Origin`头部，允许你的网站域名访问。

2. **使用代理**：
   - 如果无法控制图片服务器，设置一个代理服务器来转发请求，并在响应中添加CORS头部。

3. **使用同源图片**：
   - 尽可能使用与你的网站位于同一域或子域的图片，或者将图片保存在本地服务器上。

4. **HTML `crossOrigin` 属性**：
   - 在HTML的`<img>`标签中设置`crossOrigin="anonymous"`（或`"use-credentials"`，如果服务器需要认证），但这要求图片服务器支持CORS。

<details>
<summary>参考答案</summary>

## 背景

在一张图片添加相关文字，然后转化为base64数据，上传至服务器。当代码上线写完部署到测试环境，控制台报出如下错题：

```
Uncaught (in promise) DOMException: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported
```

这是因为页面在请求图片时产生跨域情况，canvas认为该图片数据为污染的数据，是不安全的数据，无法导出base64数据。

## 为什么 canvas 认为跨域图片数据为 污染的数据

当请求跨域图片数据，而未满足跨域请求资源的条件时。如果canvas使用未经跨域允许的图片的原始数据，这些是不可信的数据，可能会暴露页面的数据。

## 请求图片资源 - 同域

Request Headers带有cookie。图片数据是被canvas信任的。

## 请求图片资源 - 跨域

默认情况下，直接请求跨域图片。因为不符合跨域请求资源的条件，图片数据是不被canvas信任的。

为了解决图片跨域资源共享的问题， <img> 元素提供了支持的属性：crossOrigin，该属性一共有两个值可选：anonymous 和 use-credentials，下面列举了两者的使用场景，以及满足的条件。

| |anonymous|use-credentials|
|--|--|--|
|用途|匿名请求跨域图片资源，不会发送证书（比如cookie等）|具名请求跨域图片资源，会携带证书数据|
|Request Headers|	origin	|origin、cookie|
|Response headers|	Access-Control-Allow-Origin|	Access-Control-Allow-Origin、Access-Control-Allow-Credentials|
|所需条件|	Access-Control-Allow-Origin 字段值需要包含请求域。	|Access-Control-Allow-Origin 字段值需要包含请求域，且不能为通配符 *。Access-Control-Allow-Credentials 字段值需要为 true，表明允许请求发送证书数据。|

## 代码示例

```js
// page origin is https://a.com

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = function () {
   context.drawImage(this, 0, 0);
   context.getImageData(0, 0, img.width, img.height);
};
img.src = 'https://b.com/a.png';
```

另外，跨域图片能正常裁剪（图片未转化成base64），应该满足三个条件：

* img元素中设置crossorigin属性
* 图片允许跨域，设置响应头Access-Control-Allow-Origin
* 使用js方式请求图片资源, 需要避免使用缓存，设置url后加上时间戳，或者http头设置Cache-Control为no-cache

主要原因是：

* 如果使用跨域的资源画到canvas中，并且资源没有使用CORS去请求，canvas会被认为是被污染了, canvas可以正常展示，但是没办法使用toDataURL()或者toBlob()导出数据，见Allowing cross-origin use of images and canvas。 所以通过在img标签上设置crossorigin，启用CORS，属性值为anonymous，在CORS请求时不会发送认证信息,见HTML attribute: crossorigin。
* 在启用CORS请求跨域资源时，资源必须允许跨域，才能正常返回，最简单的方式设置响应头Access-Control-Allow-Origin
* 图片已经通过img标签加载过，浏览器默认会缓存下来，下次使用js方式再去请求，直接返回缓存的图片，如果缓存中的图片不是通过CORS 请求或者响应头中不存在Access-Control-Allow-Origin，都会导致报错。

</details>

## 209. es5 中的类和es6中的class有什么区别？ {#question-1036468a-13c7-49d5-af8f-31c31135ceea}

> 难度：3 · 类型：QA

### 题目要点

### ES5 vs ES6 类

#### ES5

- 使用构造函数和`prototype`来模拟类。
- 继承通过原型链或对象冒充实现。
- 没有专门的静态方法和属性的语法。
- 类（实际上是构造函数）可以像普通函数一样被调用（尽管不推荐）。

#### ES6

- 引入`class`关键字，使类的定义更加直观。
- 使用`constructor`方法定义构造函数。
- 使用`static`关键字定义静态方法和属性。
- 继承通过`extends`关键字和`super`调用实现。
- 类的定义必须使用`new`关键字来实例化。
- 类的内部方法（包括构造函数）自动添加到类的`prototype`上，但语法更简洁。

简而言之，ES6的类语法提供了更直观、面向对象的方式来定义和使用类，而ES5则需要通过构造函数和原型链来模拟这些特性。

<details>
<summary>参考答案</summary>

在es5中主要是通过构造函数方式和原型方式来定义一个类，在es6中我们可以通过class来定义类。

## 一、class类必须new调用，不能直接执行。

![image.png](https://static.ecool.fun//article/c1841b40-fce7-466c-9316-38c057419c40.png)

class类执行的话会报错，而es5中的类和普通函数并没有本质区别，执行肯定是ok的。

## 二、class类不存在变量提升

![image.png](https://static.ecool.fun//article/5378c86b-1d14-41d6-8661-e6bd762cd17a.png)

![image.png](https://static.ecool.fun//article/43a43e47-2362-4f57-9b4c-0461033ed0a6.png)

图2报错，说明class方式没有把类的定义提升到顶部。

## 三、class类无法遍历它实例原型链上的属性和方法

```js
function Foo (color) {
    this.color = color
}
Foo.prototype.like = function () {
    console.log(`like${this.color}`)
}
let foo = new Foo()

for (let key in foo) {
    // 原型上的like也被打印出来了
    console.log(key)  // color、like
}
```

```js
class Foo {
    constructor (color) {
        this.color = color
    }
    like () {
        console.log(`like${this.color}`)
    }
}
let foo = new Foo('red')

for (let key in foo) {
    // 只打印一个color,没有打印原型链上的like
    console.log(key)  // color
}
```

## 四、new.target属性

es6为new命令引入了一个new.target属性，它会返回new命令作用于的那个构造函数。如果不是通过new调用或Reflect.construct()调用的，new.target会返回undefined

```js
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('必须使用 new 命令生成实例');
  }
}

let obj = {}
Person.call(obj, 'red') // 此时使用非new的调用方式就会报错
```

## 五、class类有static静态方法

static静态方法只能通过类调用，不会出现在实例上；另外如果静态方法包含 this 关键字，这个 this 指的是类，而不是实例。static声明的静态属性和方法可以被子类继承，但不能被子类实例继承。

```js
class Foo {
  static bar() {
    this.baz(); // 此处的this指向类
  }
  static baz() {
    console.log('hello'); // 不会出现在实例中
  }
  baz() {
    console.log('world');
  }
}

Foo.bar() // hello
```

</details>

## 210. 背包问题 {#question-d7bda93c-f848-4818-a1b5-31a063ab15f7}

> 难度：3 · 类型：QA

有 N 件物品和一个容量是 V 的背包。每件物品有且只有一件。

第 i 件物品的体积是 v[i] ，价值是 w[i] 。

求解将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。

示例 1：

```
输入: N = 3, V = 4, v = [4,2,3], w = [4,2,3]
输出: 4
解释: 只选第一件物品，可使价值最大。
```

示例 2：

```
输入: N = 3, V = 5, v = [4,2,3], w = [4,2,3]
输出: 5
解释: 不选第一件物品，选择第二件和第三件物品，可使价值最大。
```

### 题目要点

背包问题是经典的动态规划问题，主要分为0-1背包、完全背包和多重背包等。对于这个问题，我们可以使用0-1背包问题的解法。

0-1背包问题是指：给定N种物品和一个容量为V的背包。物品i的重量是v[i]，其价值为w[i]，每种物品都只有一件。求解将哪些物品装入背包可使得这些物品的总重量不超过背包容量，且总价值最大。

### 动态规划解法

1. **定义状态**：`dp[j]` 表示容量为 `j` 的背包能装的最大价值。
2. **状态转移方程**：对于每个物品 `i`，我们有两种选择：
   - 不装物品 `i`，则 `dp[j] = dp[j]`（保持原值，因为没有使用该物品）。
   - 装物品 `i`，则 `dp[j] = max(dp[j], dp[j - v[i]] + w[i])`（如果剩余容量 `j - v[i]` 允许装下物品 `i`，则尝试装下该物品，并更新最大价值）。
3. **初始化**：`dp[0] = 0`（容量为0的背包价值为0），其他 `dp[j]` 初始化为一个较小的值（如 `-Infinity` 或0，但考虑到后续加法操作，一般初始化为0即可）。
4. **遍历顺序**：外层遍历物品（`i` 从 1 到 N），内层遍历背包容量（`j` 从 V 到 v[i]），注意这里 `j` 是从大到小遍历的，这是为了保证每个物品只被考虑一次。

### 代码实现

```javascript
function knapsack(N, V, v, w) {
    // 初始化dp数组
    const dp = new Array(V + 1).fill(0);

    // 遍历每件物品
    for (let i = 1; i <= N; i++) {
        // 逆序遍历背包容量
        for (let j = V; j >= v[i]; j--) {
            // 更新状态
            dp[j] = Math.max(dp[j], dp[j - v[i]] + w[i]);
        }
    }

    // 返回最大价值
    return dp[V];
}

// 示例
console.log(knapsack(3, 4, [4, 2, 3], [4, 2, 3])); // 输出: 4
console.log(knapsack(3, 5, [4, 2, 3], [4, 2, 3])); // 输出: 5
```

这段代码首先定义了一个动态规划数组 `dp`，然后通过两层循环（外层遍历物品，内层逆序遍历背包容量）来更新 `dp` 数组的值，最后返回 `dp[V]`，即背包容量为 `V` 时的最大价值。

<details>
<summary>参考答案</summary>

这是最为基础的背包问题，每种物品只有一件，可以选择取或者不取。

问题描述可以归结为：将N种物品有选择地放入容量为V的背包中，要求背包中的物品价值最大。

尝试提炼其子问题：将i种物品有选择地放入容量为V的背包中，要求背包中的物品价值最大。

那么由子问题转移到父问题的方程为：

```
f(i,V) = max{f(i-1,V), f(i-1,V-v[i]) + w[i]}
```

解释如下：“将前i件物品放入容量为V的背包中”这个子问题，若只考虑第i件物品的策略（放或者不放），那么就可以转化为一个只关系到前i-1件物品的问题。

* 如果不放第i件物品，那么问题就转化为“前i-1件物品放入容量为v的背包中”；
* 如果放第i件物品，那么问题就转化为“前i-1件物品放入剩下的容量为V-v[i]的背包中”，此时能获得的最大价值就是f(i-1, V-v[i])再加上通过放入第i件物品获得的价值w[i]。

时间复杂度已经无法优化，我们可以尝试优化空间复杂度。

观察状态转移方程，发现当前状态i只和前一个状态有关i-1，那么我们可以用滚动数组，逆序遍历的方式进行空间优化。

```js]
 function knapsack(weights, values, W){
    var n = weights.length -1
    var f = [[]]
    for(var j = 0; j <= W; j++){
        if(j < weights[0]){ //如果容量不能放下物品0的重量，那么价值为0
           f[0][j] = 0
        }else{ //否则等于物体0的价值
           f[0][j] = values[0]
        }
    }
    for(var j = 0; j <= W; j++){
        for(var i = 1; i <= n; i++ ){
            if(!f[i]){ //创建新一行
                f[i] = []
            }
            if(j < weights[i]){ //等于之前的最优值
                f[i][j] = f[i-1][j]
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i])
            }
        }
    }
    return f[n][W]
}
var a = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(a)
```

## 合并循环

现在方法里面有两个大循环，它们可以合并成一个。

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    for(var i = 0 ; i < n; i++){
        f[i] = []
    }
   for(var i = 0; i < n; i++ ){
       for(var j = 0; j <= W; j++){
            if(i === 0){ //第一行
                f[i][j] = j < weights[i] ? 0 : values[i]
            }else{
                if(j < weights[i]){ //等于之前的最优值
                    f[i][j] = f[i-1][j]
                }else{
                    f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i])
                }
            }
        }
    }
    return f[n-1][W]
}
```

然后我们再认真地思考一下，为什么要孤零零地专门处理第一行呢？f[i][j] = j < weights[i] ? 0 : values[i]是不是能适用于下面这一行f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i]) 。Math.max可以轻松转换为三元表达式，结构极其相似。而看一下i-1的边界问题，有的书与博客为了解决它，会添加第0行，全部都是0，然后i再往下挪。其实我们也可以添加一个${-1}$行。那么在我们的方程中就不用区分${i==0}$与${0>0}$的情况，方程与其他教科书的一模一样了！

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    f[-1] = new Array(W+1).fill(0)
    for(var i = 0 ; i < n ; i++){ //注意边界，没有等号
        f[i] = new Array(W).fill(0)
        for(var j=0; j<=W; j++){//注意边界，有等号
            if( j < weights[i] ){ //注意边界， 没有等号
                f[i][j] = f[i-1][j]
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]]+values[i]);//case 3
            }
        }
    }
    return f[n-1][W]
}
```

## 选择物品

上面讲解了如何求得最大价值，现在我们看到底选择了哪些物品，这个在现实中更有意义。许多书与博客很少提到这一点，就算给出的代码也不对，估计是在设计状态矩阵就出错了。

仔细观察矩阵，从${f(n-1,W)}$逆着走向${f(0,0)}$，设i=n-1,j=W，如果${f(i,j)}$==${f(i-1,j-w_i)+v_i}$说明包里面有第i件物品，因此我们只要当前行不等于上一行的总价值，就能挑出第i件物品，然后j减去该物品的重量，一直找到j = 0就行了。

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    f[-1] = new Array(W+1).fill(0)
    var selected = [];
    for(var i = 0 ; i < n ; i++){ //注意边界，没有等号
        f[i] = [] //创建当前的二维数组
        for(var j=0; j<=W; j++){ //注意边界，有等号
            if( j < weights[i] ){ //注意边界， 没有等号
                f[i][j] = f[i-1][j]//case 1
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]]+values[i]);//case 2
            }
        }
    }
    var j = W, w = 0
    for(var i=n-1; i>=0; i--){
         if(f[i][j] > f[i-1][j]){
             selected.push(i)
             console.log("物品",i,"其重量为", weights[i],"其价格为", values[i])
             j = j - weights[i];
             w +=  weights[i]
         }
     }
    console.log("背包最大承重为",W," 现在重量为", w, " 总价值为", f[n-1][W])
    return [f[n-1][W], selected.reverse() ]
}
var a = knapsack([2,3,4,1],[2,5,3, 2],5)
console.log(a)
var b = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(b)
```

## 使用滚动数组压缩空间

所谓滚动数组，目的在于优化空间，因为目前我们是使用一个${i*j}$的二维数组来储存每一步的最优解。在求解的过程中，我们可以发现，当前状态只与前一行的状态有关，那么更之前存储的状态信息已经无用了，可以舍弃的，我们只需要存储当前状态和前一行状态，所以只需使用${2*j}$的空间，循环滚动使用，就可以达到跟${i*j}$一样的效果。这是一个非常大的空间优化。

```js
function knapsack(weights, values, W){
    var n = weights.length
    var lineA = new Array(W+1).fill(0)
    var lineB = [], lastLine = 0, currLine
    var f = [lineA, lineB]; //case1 在这里使用es6语法预填第一行
    for(var i = 0; i < n; i++){
        currLine = lastLine === 0 ? 1 : 0 //决定当前要覆写滚动数组的哪一行
        for(var j=0; j<=W; j++){
            f[currLine][j] = f[lastLine][j] //case2 等于另一行的同一列的值
            if( j>= weights[i] ){
                var a = f[lastLine][j]
                var b = f[lastLine][j-weights[i]] + values[i]
                f[currLine][j] = Math.max(a, b);//case3
            }

        }
        lastLine = currLine//交换行
   }
   return f[currLine][W];
}

var a = knapsack([2,3,4,1],[2,5,3, 2],5)
console.log(a)
var b = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(b)
```

注意，这种解法由于丢弃了之前N行的数据，因此很难解出挑选的物品，只能求最大价值。

## 递归法解01背包

```js
function knapsack(n, W, weights, values, selected) {
    if (n == 0 || W == 0) {
        //当物品数量为0，或者背包容量为0时，最优解为0
        return 0;
    } else {
        //从当前所剩物品的最后一个物品开始向前，逐个判断是否要添加到背包中
        for (var i = n - 1; i >= 0; i--) {
            //如果当前要判断的物品重量大于背包当前所剩的容量，那么就不选择这个物品
            //在这种情况的最优解为f(n-1,C)
            if (weights[i] > W) {
                return knapsack(n - 1, W, weights, values, selected);
            } else {
                var a = knapsack(n - 1, W, weights, values, selected); //不选择物品i的情况下的最优解
                var b = values[i] + knapsack(n - 1, W - weights[i], weights, values, selected); //选择物品i的情况下的最优解
                //返回选择物品i和不选择物品i中最优解大的一个
                if (a > b) {
                    selected[i] = 0; //这种情况下表示物品i未被选取
                    return a;
                } else {
                    selected[i] = 1; //物品i被选取
                    return b;
                }
            }
        }
    }
}
var selected = [], ws = [2,2,6,5,4], vs = [6,3,5,4,6]
var b = knapsack( 5, 10, ws, vs, selected)
console.log(b) //15
selected.forEach(function(el,i){
    if(el){
        console.log("选择了物品"+i+ " 其重量为"+ ws[i]+" 其价值为"+vs[i])
    }
})
```

</details>

## 211. 全排列 {#question-0b9c52b4-71d9-46b9-ad7e-915c8b784d15}

> 难度：3 · 类型：QA

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 **按任意顺序** 返回答案。

示例 1：

```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

示例 2：

```
输入：nums = [0,1]
输出：[[0,1],[1,0]]
```

示例 3：
```
输入：nums = [1]
输出：[[1]]
```

提示：

* 1 <= nums.length <= 6
* -10 <= nums[i] <= 10
* nums 中的所有整数 互不相同

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {

};
```

### 题目要点

为了解决这个问题，我们可以使用回溯法（backtracking）来生成数组的所有排列。回溯法是一种通过探索所有可能的候选解来找出所有解的算法。如果候选解被确认不是一个解（或者至少不是最后一个解），回溯算法会通过在上一步进行一些变化来撤销上一步或上几步的计算，来获得新的候选解。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const result = [];
    const used = new Array(nums.length).fill(false); // 用于标记某个数字是否已经被使用

    // 递归函数，用于生成排列
    const backtrack = (path) => {
        // 如果路径长度等于数组长度，说明找到了一组排列，加入到结果中
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }

        // 遍历数组中的每个数字
        for (let i = 0; i < nums.length; i++) {
            // 如果该数字已经被使用过，则跳过
            if (used[i]) continue;

            // 标记该数字为已使用
            used[i] = true;

            // 将该数字加入到当前路径中
            path.push(nums[i]);

            // 递归调用，继续寻找下一个数字
            backtrack(path);

            // 回溯，撤销上一步操作
            path.pop();
            used[i] = false;
        }
    };

    // 调用递归函数，从空路径开始
    backtrack([]);

    return result;
};
```

<details>
<summary>参考答案</summary>

## 回溯 + DFS 思想

### 例子解析

先用 (1, 2, 3) 进行举例：

* 以 1 开头的全排列，它们是：[1, 2, 3], [1, 3, 2]，即 1 + [2, 3] 的全排列；
* 以 2 开头的全排列，它们是：[2, 1, 3], [2, 3, 1]，即 2 + [1, 3] 的全排列；
* 以 3 开头的全排列，它们是：[3, 1, 2], [3, 2, 1]，即 3 + [1, 2] 的全排列。

### 思路解析

* 按顺序枚举每一位可能出现的情况，已经选择的数字在 当前 要选择的数字中不能出现（设置一个 visited 数组）。

* 这样的思路，可以用一个树形结构表示。而树上的每一个结点表示了求解全排列问题的不同的阶段，这些阶段通过变量的「不同的值」体现，这些变量的不同的值，称之为「状态」；

* 使用深度优先遍历有「回头」的过程，在「回头」以后， 状态变量需要设置成为和先前一样 ，因此在回到上一层结点的过程中，需要撤销上一次的选择，这个操作称之为「状态重置」；

使用编程的方法得到全排列，就是在这样的一个树形结构中完成 遍历，从树的根结点到叶子结点形成的路径就是其中一个全排列。

### 要注意的地方

* 要注意遍历到相应的结点的时候，状态变量的值是正确的，具体的做法是：往下走一层的时候，path 变量在尾部追加，而往回走的时候，需要撤销上一次的选择，也是在尾部操作，因此 path 变量是一个栈；
* 深度优先遍历通过「回溯」操作，实现了全局使用一份状态变量的效果(因此，在每次遍历到叶子结点要将 path 数组拷贝到 result 返回数组，即 new 一个，或 [...push])

### 代码解释

* 首先这棵树除了根结点和叶子结点以外，每一个结点做的事情其实是一样的，即：在已经选择了一些数的前提下，在剩下的还没有选择的数中，依次选择一个数，这显然是一个 递归 结构；
* 递归的终止条件是： 一个排列中的数字已经选够了 ，因此我们需要一个变量来表示当前程序递归到第几层，我们把这个变量叫做 depth。
* 布尔数组 visited，初始化的时候都为 false 表示这些数还没有被选择，当我们选定一个数的时候，就将这个数组的相应位置设置为 true ，这样在进行下一层递归时，就能够以 O(1) 的时间复杂度判断这个数是否被选择过，这是一种「以空间换时间」的思想。
* 这些变量称为「状态变量」，它们表示了在求解一个问题的时候所处的阶段。需要根据问题的场景设计合适的状态变量。

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    let len = nums.length, result = [], visited = new Array(len).fill(false);

    const dfs = (nums, len, depth, path, visited) => {
        // 遍历到叶子结点了，可以返回了
        if(depth === len) {
            result.push([...path]);
        }

        for(let i = 0; i < len; i++) {
            // 如果没遍历过
            if(!visited[i]) {
                // 压入 path 数组，然后是否遍历过的数组此下标处变为 true
                path.push(nums[i]);
                visited[i] = true;
                // 继续 dfs，直到最后一层
                dfs(nums, len, depth + 1, path, visited);
                // 进行回溯，还原，以便下一次使用
                visited[i] = false;
                path.pop();
            }
        }
    }

    dfs(nums, len, 0, [], visited);
    return result;
};
```

</details>

## 212. ES6有哪些新特性？ {#question-5e131c75-d26e-4527-8f51-29d842f3c829}

> 难度：2 · 类型：QA

### 题目要点

### ES6 新特性分类

1. **解决原有语法不足**：例如 `let` 和 `const` 用于块级作用域，解决了 `var` 声明变量时的提升问题。
2. **原有语法增强**：如解构赋值、模板字符串、参数默认值等。
3. **新增对象、方法和功能**：如 `Promise`、`Proxy`、`Object.assign`、`is` 等。
4. **新增数据类型和数据结构**：如 `Symbol`、`Set`、`Map` 等。

### 具体特性

1. **let 和 const**：提供了块级作用域，并且声明的变量不会提升。
2. **解构**：允许快速提取数组或对象中的元素。
3. **模板字符串**：允许在字符串中嵌入表达式，并且可以换行。
4. **字符串扩展方法**：提供了 `includes`、`startsWith`、`endsWith` 等方法。
5. **参数默认值和剩余参数**：允许在函数定义时提供默认值，并收集剩余参数。
6. **展开数组**：使用 `...` 展开数组。
7. **箭头函数**：简化了函数的写法，并且 `this` 的绑定是静态的。
8. **对象字面量增强**：允许省略键值对中的键名，使用计算属性等。
9. **Object.assign**：用于复制和合并对象。
10. **Object.is**：比较两个值是否相等，不进行隐式类型转换。
11. **Proxy**：提供了对象代理，可以监控对象的读写操作。
12. **Reflect**：提供了一系列对象操作的方法。
13. **Promise**：用于解决异步编程中的回调嵌套问题。
14. **class**：用于类和继承的定义。
15. **Set**：类似数组的数据结构，元素唯一。
16. **Map**：类似 Object，以键值对形式存储数据。
17. **Symbol**：用于定义唯一的变量。
18. **for...of...**：用于遍历引用数据类型。
19. **迭代器模式**：通过 `Symbol.iterator` 提供统一的迭代接口。
20. **Generator 生成器**：用于惰性执行，解决异步回调过深的问题。
21. **includes 函数**：判断数组是否包含某个元素。
22. **指数运算符**：简化指数运算。
23. **values 函数**：返回对象的值数组。
24. **entries 函数**：返回对象的键值对数组。
25. **Object.getOwnPropertyDescriptors**：获取对象的描述信息。
26. **padStart 和 padEnd 函数**：在字符串前或后追加指定字符串。

<details>
<summary>参考答案</summary>

### 关于ES6和JavaScript的关系

##### 1、ES6是对于ES2015+的俗称，也可以说是通常叫法，那么，ES6是什么呢？

ES 全称是ECMAScript，它是JavaScript基础构建的一种语言，JavaScript正是建立在ECMAScript语言的基础规范中建立使用的，那么，ECMAScript的使用，对于JavaScript至关重要！

在我的理解中，ECMAScript是一种语言层面的东西，它只是定义了JavaScript以及在它基础之上建立的其他语言的语法规范，而JavaScript的语言，更关于一种平台性质在其中。

JavaScript包括 ECMAScript、DOM、BOM三个组成部分，DOM和BOM是web API提供的接口或者是JavaScript和浏览器之间进行交互的部分，实质就是操纵文档元素，进行展示布局，而ECMAScript在JavaScript中其中语法的作用，它不会去跟文档有直接的关系，但是他的数据处理完成后会通过web API展示在文档中。

### ES6新特性的分类

新特性主要归为四大类：

* 解决原有语法上的一些不足

比如let 和 const 的块级作用域

* 对原有语法进行增强

比如解构、展开、参数默认值、模板字符串

* 全新的对象、全新的方法、全新的功能

比如promise、proxy、object的assign、is

* 全新的数据类型和数据结构

比如symbol、set、map

下面具体进行介绍

## 1. let、const 块级作用域以及和 var 的区别

- let、const 声明的变量，在 for，if 语句中，会形成块级作用域，块级作用域内的变量，不能被作用域外部使用
- let、const 声明变量不再会有声明提升，在变量声明之前使用运行时会报错

```js
//块级作用域一级块级作用域的使用
if (true) {
  const param = 'param in if block'
  console.log(param) //param in if block
}
console.log(param) //块级作用域外访问内部定义的变量，ReferenceError: param is not defined
```

- 块级作用域声明变量，会出现“暂时性死区”，块级作用域声明变量前使用变量，将会报错

```js
// 暂时性死区
const i = 100
if (i) {
  console.log(i) //ReferenceError: Cannot access 'i' before initialization
  const i = 1000
}
```

- const 声明的是一个常量，声明必须初始化

```js

    // const常量声明必须初始化
    const i;
    i = 10;
    console.log(i) //SyntaxError: Missing initializer in const declaration

```

- 如果 const 声明的是基本类型常量，初始化之后不能修改；引用类型的常量，可以修改其成员变量；

```js
// 基本类型常量不能修改，引用类型常量能修改属性
const str = 'str'
str = 'str1' //TypeError: Assignment to constant variable.

const arr = [1, 2, 3]
arr[0] = 100
console.log(arr[0]) //100
```

- 和 var 的区别

| 声明方式 | 变量提升 | 作用域 | 初始值 | 重复定义 |
| -------- | -------- | ------ | ------ | -------- |
| var      | 是       | 函数级 | 不需要 | 允许     |
| let      | 否       | 块级   | 不需要 | 不允许   |
| const    | 否       | 块级   | 必需   | 不允许   |

## 2.解构-快速提取数组/对象中的元素

- **数组解构**

- 单独解构-根据数组索引，将数组解构成单独的元素

```js
const arr = [1, 2, 3]

const [a, b, c] = arr
console.log(a, b, c) //1,2,3
const [, , d] = arr
console.log(d) //3
```

- 默认值，解构时可以给变量设置默认值，数组没有这个元素的话

```js
const arr = [1, 2, 3]

const [, , , defaultVal = '4'] = arr
console.log('设置默认值', defaultVal)
```

- 剩余解构-用 "...+变量名" 解构剩余参数到新数组，只能用一次

```js
const arr = [1, 2, 3]

const [e, ...rest] = arr
console.log(rest) //[2, 3]
```

- 实例应用

```js
// 拆分字符串
const str = 'xiaobai/18/200'
const strArr = str.split('/')
const [, age] = strArr
console.log(age) //18
```

- **对象解构**

- 单个/多个解构-跟数组解构差不多

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name, age } = obj
console.log(name, age) // 'xiaohui', 18
```

- 解构+重命名-给解构出来的变量重命名

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { name: objName } = obj
console.log(objName)
```

- 默认值-给解构变量设置默认值

```js
const obj = { name: 'xiaohui', age: 18, height: undefined }
const { next = 'default' } = obj
console.log(next)
```

## 3.模板字符串

用法：使用``将字符串包裹起来

功能：可以换行、插值、使用标签函数进行字符串操作

示例：

- 换行/插值

```js
//换行
const str = `fdsjak
    fdsa`
console.log(str)

// 插值
const strs = `random: ${Math.random()}`
console.log(strs)
```

- 标签函数-可以对模板字符串的字符串和插值进行处理和过滤等操作

```js
/**
 * 字符串模板函数
 * @param {array} strs 以插值为分隔符组成的字符串数组
 * @param {string} name 插值的value，有多少个就会传入多少个
 */
const tagFunc = (strs, name, gender) => {
  const [str1, str2, str3] = strs
  const genderParsed = gender == '1' ? '男' : '女'
  // 可以在此做过滤，字符串处理，多语言等操作
  return str1 + name + str2 + str3 + genderParsed
}

// 带标签的模板字符串,
const person = {
  name: 'xiaohui',
  gender: 1,
}
// 返回值为标签函数的返回值
const result = tagFunc`my name is ${person.name}.gender is ${person.gender}`
console.log(result) //my name is xiaohui.gender is 男
```

## 4. 字符串扩展方法

- includes-是否包含
- startsWith-是否以什么开始
- endsWith-是否以什么结束

```js
const str = 'abcd'

console.log(str.includes('e')) //false
console.log(str.startsWith('a')) //true
console.log(str.endsWith('a')) //false
```

## 5.参数默认值&剩余参数

- 给函数形参设置默认值

```js
// 带默认参数的形参一般放在后面，减少传参导致的错误几率
const defaultParams = function (name, age = 0) {
  return [age, name]
}
console.log(defaultParams(1))
```

- 使用...rest 形式设置剩余形参，支持无限参数

```js
// 剩余参数，转化成数组
const restParams = function (...args) {
  console.log(args.toString()) //1, 2, 3, 4, 5
}

restParams(1, 2, 3, 4, 5)
```

## 6.展开数组

使用...将数组展开

```js
const arr = [1, 2, 3]

console.log(...arr)
// 等价于es5中以下写法
console.log.apply(console, arr)
```

## 7.箭头函数

**特性&优势：**

- 1、简化了函数的写法
- 2、没有 this 机制，this 继承自上一个函数的上下文，如果上一层没有函数，则指向 window
- 3、作为异步回调函数时，可解决 this 指向问题

```js
const inc = (n) => n + 1
console.log(inc(100))

const obj = {
  name: 'aa',
  func() {
    setTimeout(() => {
      console.log(this.name) //aa
    }, 0)
    setTimeout(function () {
      console.log(this.name) //undefined
    }, 0)
  },
}
obj.func()
```

## 8.对象字面量增强

- 同名属性可以省略 key:value 形式，直接 key，
- 函数可以省略 key：value 形式
- 可以直接 func(),
- 可以使用计算属性，比如：{[Math.random()]: value}

```js
/**
 * 1、增强了对象字面量：
 * 1，同名属性可以省略key:value形式，直接key，
 * 2，函数可以省略key：value形式
 * 3，可以直接func(),
 * 4，可以使用计算属性，比如：{[Math.random()]: value}
 */
const arr = [1, 2, 3]
const obj = {
  arr,
  func() {
    console.log(this.arr)
  },
  [Math.random()]: arr,
}

console.log(obj)
```

## 9.Object.assign(target1, target2, targetN)-复制/合并对象

```js
/**
 * Object.assign(target1, target2, ...targetn)
 * 后面的属性向前面的属性合并
 * 如果target1是空对象，可以创建一个全新对象，而不是对象引用
 */
const obj1 = {
  a: 1,
  b: 2,
}
const obj2 = {
  a: 1,
  b: 2,
}

const obj3 = Object.assign({}, obj1)
obj3.a = 5
console.log(obj3, obj2, obj1)
```

## 10.Object.is(value1, value2)

作用：比较两个值是否相等

特性：

- 没有隐式转换
- 可以比较+0,-0、NaN

```js
console.log(NaN === NaN) //false
console.log(Object.is(NaN, NaN)) //true
console.log(0 === -0) // true
console.log(Object.is(0, -0)) //false
console.log(Object.is(1, 1)) //true
```

## 11.Proxy(object, handler)

**作用：**

- 代理一个对象的所有，包括读写操作和各种操作的监听

**用法：**

```js
const P = {
  n: 'p',
  a: 19,
}

const proxy = new Proxy(P, {
  get(target, property) {
    console.log(target, property)
    return property in target ? target[property] : null
  },
  defineProperty(target, property, attrs) {
    console.log(target, property, attrs)
    //   throw new Error('不允许修改')
  },
  deleteProperty(target, property) {
    console.log(target, property)
    delete target[property]
  },
  set(target, property, value) {
    target[property] = value
  },
})

proxy.c = 100
console.log('pp', P)
```

与 Object.defineProperty 对比

优势：

- **拥有很多 defineProperty 没有的属性方法，比如：**
  - handler.getPrototypeOf() ---Object.getPrototypeOf 方法的监听器
  - handler.setPrototypeOf() ---Object.setPrototypeOf 方法的监听器。
  - handler.isExtensible() ---Object.isExtensible 方法的监听器。
  - handler.preventExtensions() ---Object.preventExtensions 方法的监听器。
  - handler.getOwnPropertyDescriptor() ---Object.getOwnPropertyDescriptor 方法的监听器。
  - handler.defineProperty() ---Object.defineProperty 方法的监听器。
  - handler.has() ---in 操作符的监听器。
  - handler.get() ---属性读取操作的监听器。
  - handler.set() ---属性设置操作的监听器。
  - handler.deleteProperty() ---delete 操作符的监听器
  - handler.ownKeys() ---Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的监听器。
  - handler.apply() ---函数调用操作的监听器。
  - handler.construct() ---new 操作符的监听器。
- **对数组的监视更方便**
- **以非侵入的访视监管对象的读写**

## 12.Reflect

作用：

集成 Object 操作的所有方法，统一、方便，具体方法如下：

用于对对象的统一操作，集成 Object 相关的所有方法

1、apply：类似 Function.prototype.apply

2、Reflect.construct()

对构造函数进行 new 操作，相当于执行 new target(...args)。

3、Reflect.defineProperty()

和 Object.defineProperty() 类似。

4、Reflect.deleteProperty()

作为函数的 delete 操作符，相当于执行 delete target[name]。

5、Reflect.get()

获取对象身上某个属性的值，类似于 target[name]。

6、Reflect.getOwnPropertyDescriptor()

类似于 Object.getOwnPropertyDescriptor()。

7、Reflect.getPrototypeOf()

类似于 Object.getPrototypeOf(), 获取目标对象的原型。

8、Reflect.has()

判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。

9、Reflect.isExtensible()

类似于 Object.isExtensible().判断对象是否可扩展，可以添加额外属性

Object.seal(封闭对象)， Object.freeze（冻结对象）是不可扩展的

10、Reflect.ownKeys()

返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受 enumerable 影响).

11、Reflect.preventExtensions()

类似于 Object.preventExtensions()。返回一个 Boolean。

12、Reflect.set()

将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true, 反之返回 false。

13、Reflect.setPrototypeOf()

类似于 Object.setPrototypeOf()。

示例：

```js
const obj = {
  name: 'reflect',
}
Reflect.preventExtensions(obj) //禁止扩展
console.log(Reflect.set(obj, 'age', 'xiaobai')) //false
console.log(obj) //{ name: 'reflect' }
console.log(Reflect.isExtensible(obj, 'name')) //false
console.log(Reflect.ownKeys(obj)) //[ 'name' ]
```

## 13.Promise

作用：解决异步编程中回调嵌套过深问题

## 14.class&静态方法&继承

**定义**

- 使用 class 关键字定义类

```js
class Person {
  constructor(props) {
    this.props = props
  }
}
```

**方法**

- 实例方法，需要实例化之后才能调用，this 指向实例
- 静态方法，用 static 修饰符修饰，可以直接通过类名调用，不需要实例化，this 不指向实例，而是指向当前类

```js
class Person {
  constructor(props) {
    this.props = props
  }
  // 实例方法
  eat() {}
  // 静态方法
  static run() {}
}
// 调用静态方法
Person.run()
const person = new Person('props')
// 调用实例方法
person.eat()
```

**继承：子类使用 extends 关键字实现继承，可以继承父类所有属性**

```js
class Student extends Person {
  constructor(props) {
    super(props)
  }
  printProps() {
    console.log(this.props)
  }
}

const student = new Student('student')
student.printProps()
```

## 15.Set

说明：

Set 是一种类似于数组的数据结构

特性：

- 元素唯一性，不允许重复元素
- 使用 add 增加重复元素，将会被忽略

用途：

- 数组去重
- 数据存储

```js
const arr = [1, 3, 1, 1, 1]
const set = new Set(arr)
set.add(1).add(1)
console.log(set.size) //2
const newArr = Array.from(set)
console.log(newArr) //[ 1, 3 ]
```

## 16.Map

说明：

类似 Object，以 key、value 形式存储数据

区别：

Map 键不会隐式转换成字符串，而是保持原有类型

实例：

```js
const map = new Map()
map.set(1, 1)
map.set('name', 'map')
map.set(obj, obj)
console.log(map.get(1)) //1
/**
        1 1
        name map
        { '1': 1, true: true, a: 'a' } { '1': 1, true: true, a: 'a' }
     */
map.forEach((val, key) => {
  console.log(key, val)
})
```

## 17.Symbol

说明：

JavaScript 第六种原始数据类型，用来定义一个唯一的变量

作用：

- 创建唯一的变量，解决对象键名重复问题
- 为对象、类、函数等创建私有属性

- 修改对象的 toString 标签
- 为对象添加迭代器属性

如何获取对象的 symbol 属性？

- Object.getOwnPropertySymbols(object)

实例

```js
// 对象属性重名问题；
const objSymbol = {
  [Symbol()]: 1,
  [Symbol()]: 2,
}
console.log(objSymbol)

// 2、为对象、类、函数等创建私有属性
const name = Symbol()
const obj2 = {
  [name]: 'symbol',
  testPrivate() {
    console.log(this[name])
  },
}

obj2.testPrivate()
// 定义toString标签；
console.log(obj2.toString())
obj2[Symbol.toStringTag] = 'xx'
console.log(obj2.toString()) //[object xx]
```

## 18.for...of...

用途：

已统一的方式，遍历所有引用数据类型

特性：

可以随时使用 break 终止遍历，而 forEach 不行

实例：

```js
// 基本用法
// 遍历数组
const arr = [1, 2, 3, 4]
for (const item of arr) {
  if (item > 3) {
    break
  }
  if (item > 2) {
    console.log(item)
  }
}

// 遍历set
const set = new Set()
set.add('foo').add('bar')
for (const item of set) {
  console.log('set for of', item)
}
// 遍历map
const map = new Map()
map.set('foo', 'one').set('bar', 'two')
for (const [key, val] of map) {
  console.log('for of map', key, val)
}
//迭代对象
const obj = {
  name: 'xiaohui',
  age: '10',
  store: [1, 2, 3],
  // 实现可迭代的接口
  [Symbol.iterator]: function () {
    const params = [this.name, this.age, this.store]
    let index = 0
    return {
      next() {
        const ret = {
          value: params[index],
          done: index >= params.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of obj) {
  console.log('obj for of', item)
}
```

## 19. 迭代器模式

作用：通过 Symbol.interator 对外提供统一的接口，获取内部的数据

外部可以通过 for...of...去迭代内部的数据

```js
const tods = {
  life: ['eat', 'sleep'],
  learn: ['js', 'dart'],
  // 增加的任务
  work: ['sale', 'customer'],
  [Symbol.iterator]: function () {
    const all = []
    Object.keys(this).forEach((key) => {
      all.push(...this[key])
    })
    let index = 0
    return {
      next() {
        const ret = {
          value: all[index],
          done: index >= all.length,
        }
        index++
        return ret
      },
    }
  },
}

for (const item of tods) {
  console.log(item)
}
```

## 20.Generator 生成器

- Generator
- 函数前添加 *，生成一个生成器
- 一般配合 yield 关键字使用
- 最大特点，惰性执行，调 next 才会往下执行
- 主要用来解决异步回调过深的问题

```js
// 生成迭代器方法
//  生成器Generator的应用

function* createIdGenerator() {
  let id = 1
  while (id < 3) yield id++
}
const createId = createIdGenerator()
console.log(createId.next()) //{ value: 1, done: false }
console.log(createId.next()) //{ value: 2, done: false }
console.log(createId.next()) //{ value: undefined, done: true }

const todos = {
  life: ['eat', 'sleep', 'baba'],
  learn: ['es5', 'es6', 'design pattern'],
  work: ['b', 'c', 'framework'],
  [Symbol.iterator]: function* () {
    const all = [...this.life, ...this.learn, ...this.work]
    for (const i of all) {
      yield i
    }
  },
}
for (const item of todos) {
  console.log(item)
}
```

## 21.includes 函数-es2016

判断数组是否包含某个元素，包含 NaN，解决 indexOf 无法查找 NaN 问题

```js
//  includes函数
const arr = ['foo', 'bar', 'baz', NaN]
console.log(arr.includes(NaN)) //true
console.log(arr.indexOf(NaN)) //-1
```

## 22. 运算符-es2016

指数运算

```js
// 指数运算符 **
// es5中2十次方
console.log(Math.pow(2, 10))
// es6中2十次方
console.log(2 ** 10)
```

## 23.values 函数-es2017

将对象的值以数组的形式返回

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}

console.log(Object.values(obj)) //[ 1, 2, 3 ]
```

## 24.entries 函数-es2017

将对象以键值对二维数组返回，使之可以使用 for...of...遍历

```js
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
}
console.log(Object.entries(obj))
const entry = Object.entries(obj)
for (const [key, value] of entry) {
  console.log(key, value)
}
```

## 25.Object.getOwnPropertyDescriptors(obj)-es2017

获取对象的描述信息

可以通过获得的描述信息，配合 Object.defineProperties 来完整复制对象，包含 get，set 方法

```js
// getOwnPropertyDescriptors

// 普通get方法
const objGet = {
  foo: 1,
  bar: 2,
  get getCount() {
    return this.foo + this.bar
  },
}
// assign方法会把getCount当做普通属性复制，从而getCount为3，修改bar不管用
const objGet1 = Object.assign({}, objGet)
objGet1.bar = 3
console.log(objGet1.getCount) //3
// descriptors
const descriptors = Object.getOwnPropertyDescriptors(objGet)
console.log('des', descriptors)
// 通过descriptors来复制对象，可以完整复制对象，包含get，set
const objGet2 = Object.defineProperties({}, descriptors)
objGet2.bar = 3
console.log(objGet2.getCount) //4
```

## 26.padStart, padEnd 函数-es2017

在字符串前，或者后面追加指定字符串

参数：

targetLenght: 填充后的目标长度

padString:填充的字符串

规则：

1、填充的字符串超过目标长度，会在规定长度时被截断

2、填充字符串太短会以空格填充

3、padString 未传值，以空格填充

作用：

一般用来对齐字符串输出

```js

    /**
     *  foo.................|1
        barbar..............|2
        bazbazbaz...........|3
     */
    console.log(`${key.padEnd(20, '.')}${value.toString().padStart(2, '|')}`)
```

</details>

## 213. jquery的链式调用是怎么实现的？ {#question-95cb0844-3e54-45c3-8809-1121bafc57ba}

> 难度：2 · 类型：QA

### 题目要点

jQuery的链式调用之所以能够实现，主要是因为它的每个方法在执行完自己的任务后，都会返回调用该方法的jQuery对象本身（即`return this;`）。这样，你就可以在这个返回的对象上继续调用其他方法，从而实现链式调用。

简而言之，链式调用的秘诀在于：**每个方法都返回`this`**。

<details>
<summary>参考答案</summary>

我们都知道 jQuery 可以链式调用，比如：

```js
$("div").eq(0).css("width", "200px").show();
```

链式调用的核心就在于调用完的方法将自身实例返回。

## 实现一个简单的链式调用

```js
// 定义一个对象
class listFunc {
 // 初始化
  constructor(val) {
    this.arr = [...val];
    return this;
  }
  // 打印这个数组
  get() {
    console.log(this.arr);
    return this;
  }
  // 向数组尾部添加数据
  push(val) {
    console.log(this.arr);
    this.arr.push(val);
    return this;
  }
  // 删除尾部数据
  pop() {
    console.log(this.arr);
    this.arr.pop();
    return this;
  }
}
const list = new listFunc([1, 2, 3]);
list.get().pop().push('ldq')
```

</details>

## 214. 写一个 repeat 方法，实现字符串的复制拼接 {#question-e797a169-0044-43d1-8fe6-4bad6e7372f9}

> 难度：1 · 类型：QA

### 题目要点

实现的方法有很多，以下介绍几种。

<details>
<summary>参考答案</summary>

实现的方法有很多，以下介绍几种。

## 方法一

空数组 join

```js
function repeat(target, n) {
  return (new Array(n + 1)).join(target);
}
```

## 方法二

改良方法1，省去创建数组这一步，提高性能。之所以创建一个带 length 属性的对象，是因为要调用数组的原型方法，需要指定 call 第一个参数为类数组对象。

```js
function repeat(target, n) {
  return Array.prototype.join.call({
    length: n + 1
  }, target);
}
```

## 方法三

改良方法 2，利用闭包缓存 join，避免重复创建对象、寻找方法。

```js
var repeat = (function () {
  var join = Array.prototype.join, obj = {};
  return function(target, n) {
    obj.length = n + 1;
    return join.call(obj, target);
  };
})();
```

## 方法四

使用二分法，减少操作次数

```js
function repeat(target, n) {
  var s = target, total = [];
  while (n > 0) {
    if (n % 2 === 1) {
      total[total.length] = s;
    }
    if (n === 1) {
      break;
    }

    s += s;
    n = n >> 1; // Math.floor(n / 2);
  }
  return total.join('');
}
```

## 方法五

方法 4 的变种，免去创建数组与使用 join。缺点是循环中创建的字符串比要求的长。

```js
function repeat(target, n) {
  var s = target, c = s.length * n;
  do {
    s += s;
  } while (n = n >> 1)
  s = s.substring(0, c);
  return s;
}
```

## 方法六

方法 4 的改良。

```js
function repeat(target, n) {
  var s = target, total = "";
  while (n > 0) {
    if (n % 2 === 1) {
      total += s;
    }
    if (n === 1) {
      break;
    }
    s += s;
    n = n >> 1;
  }
  return total;
}
```

## 方法七

与 6 相近，不过递归在浏览器中有优化。

```js
function repeat(target, n) {
  if (n === 1) {
    return target;
  }
  var s = repeat(target, Math.floor(n / 2));
  s += s;
  if (n % 2) {
    s += target;
  }
  return s;
}
```

## 方法八

一则反例，很慢，但是可行。

```js
function repeat(target, n) {
  return (n <= 0) ? "" : target.concat(repeat(target, --n));
}
```

最后给出 MDN 中的`String.prototype.repeat`的 polyfill 方法，大家也可以进行参考：

```js
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null)
      throw new TypeError('can\'t convert ' + this + ' to object');

    var str = '' + this;
    // To convert string to integer.
    count = +count;
    // Check NaN
    if (count != count)
      count = 0;

    if (count < 0)
      throw new RangeError('repeat count must be non-negative');

    if (count == Infinity)
      throw new RangeError('repeat count must be less than infinity');

    count = Math.floor(count);
    if (str.length == 0 || count == 0)
      return '';

    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28)
      throw new RangeError('repeat count must not overflow maximum string size');

    var maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while (count) {
       str += str;
       count--;
    }
    str += str.substring(0, maxCount - str.length);
    return str;
  }
}
```

</details>

## 215. 使用Promise实现：限制异步操作的并发个数，并尽可能快的完成全部 {#question-462ff8a8-29ba-4e49-88ad-d60e7b3f4ee8}

> 难度：4.5 · 类型：QA

有8个图片资源的url，已经存储在数组urls中。

urls类似于`['https://image1.png', 'https://image2.png', ....]`

而且已经有一个函数`function loadImg`，输入一个url链接，返回一个Promise，该Promise在图片下载完成的时候resolve，下载失败则reject。

但有一个要求，任何时刻同时下载的链接数量不可以超过3个。

请写一段代码实现这个需求，要求尽可能快速地将所有图片下载完成。

```js
var urls = [
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting1.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting2.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting3.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting4.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting5.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn6.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn7.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn8.png",
];
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      console.log("一张图片加载完成");
      resolve(img);
    };
    img.onerror = function() {
        reject(new Error('Could not load image at' + url));
    };
    img.src = url;
  });
}
```

### 题目要点

既然题目的要求是保证每次并发请求的数量为3，那么我们可以先请求urls中的前面三个(下标为0,1,2)，并且请求的时候使用`Promise.race()`来同时请求，三个中有一个先完成了，我们就把这个当前数组中已经完成的那一项(第1项)换成还没有请求的那一项(urls中下标为3)。

<details>
<summary>参考答案</summary>

既然题目的要求是保证每次并发请求的数量为3，那么我们可以先请求urls中的前面三个(下标为0,1,2)，并且请求的时候使用`Promise.race()`来同时请求，三个中有一个先完成了，我们就把这个当前数组中已经完成的那一项(第1项)换成还没有请求的那一项(urls中下标为3)。

直到urls已经遍历完了，然后将最后三个没有完成的请求(也就是状态没有改变的Promise)用`Promise.all()`来加载它们。

```js
function limitLoad(urls, handler, limit) {
  let sequence = [].concat(urls); // 复制urls
  // 这一步是为了初始化 promises 这个"容器"
  let promises = sequence.splice(0, limit).map((url, index) => {
    return handler(url).then(() => {
      // 返回下标是为了知道数组中是哪一项最先完成
      return index;
    });
  });
  // 注意这里要将整个变量过程返回，这样得到的就是一个Promise，可以在外面链式调用
  return sequence
    .reduce((pCollect, url) => {
      return pCollect
        .then(() => {
          return Promise.race(promises); // 返回已经完成的下标
        })
        .then(fastestIndex => { // 获取到已经完成的下标
            // 将"容器"内已经完成的那一项替换
          promises[fastestIndex] = handler(url).then(
            () => {
              return fastestIndex; // 要继续将这个下标返回，以便下一次变量
            }
          );
        })
        .catch(err => {
          console.error(err);
        });
    }, Promise.resolve()) // 初始化传入
    .then(() => { // 最后三个用.all来调用
      return Promise.all(promises);
    });
}
limitLoad(urls, loadImg, 3)
  .then(res => {
    console.log("图片全部加载完毕");
    console.log(res);
  })
  .catch(err => {
    console.error(err);
  });

```

</details>

## 216. 使用Promise封装一个异步加载图片的方法 {#question-584f7b53-5e4b-48b9-ad7b-ae4789647ada}

> 难度：3 · 类型：QA

### 题目要点

这个比较简单，只需要在图片的onload函数中，使用resolve返回一下就可以了。

<details>
<summary>参考答案</summary>

这个比较简单，只需要在图片的onload函数中，使用resolve返回一下就可以了。

```js
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      resolve(img);
    };
    img.onerror = function() {
        reject(new Error('Could not load image at' + url));
    };
    img.src = url;
  });

```

</details>

## 217. 实现mergePromise函数 {#question-9f0dbfc0-bd61-4956-8093-d604ac401983}

> 难度：4 · 类型：QA

实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中。

```js
const time = (timer) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timer)
  })
}
const ajax1 = () => time(2000).then(() => {
  console.log(1);
  return 1
})
const ajax2 = () => time(1000).then(() => {
  console.log(2);
  return 2
})
const ajax3 = () => time(1000).then(() => {
  console.log(3);
  return 3
})

function mergePromise () {
  // 在这里写代码
}

mergePromise([ajax1, ajax2, ajax3]).then(data => {
  console.log("done");
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]

```

### 题目要点

这道题有点类似于Promise.all()，不过.all()不需要管执行顺序，只需要并发执行就行了。但是这里需要等上一个执行完毕之后才能执行下一个。

<details>
<summary>参考答案</summary>

这道题有点类似于Promise.all()，不过.all()不需要管执行顺序，只需要并发执行就行了。但是这里需要等上一个执行完毕之后才能执行下一个。

解题思路：

* 定义一个数组data用于保存所有异步操作的结果
* 初始化一个`const promise = Promise.resolve()`，然后循环遍历数组，在promise后面添加执行ajax任务，同时要将添加的结果重新赋值到promise上。

```js
function mergePromise (ajaxArray) {
  // 存放每个ajax的结果
  const data = [];
  let promise = Promise.resolve();
  ajaxArray.forEach(ajax => {
    // 第一次的then为了用来调用ajax
    // 第二次的then是为了获取ajax的结果
    promise = promise.then(ajax).then(res => {
      data.push(res);
      return data; // 把每次的结果返回
    })
  })
  // 最后得到的promise它的值就是data
  return promise;
}
```

</details>

## 218. 【Promise第40题】下面代码的输出是什么？ {#question-dec780c4-3610-4673-b12f-add388ceec10}

> 难度：4 · 类型：QA

```js
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('resolve3');
    console.log('timer1')
  }, 0)
  resolve('resovle1');
  resolve('resolve2');
}).then(res => {
  console.log(res)
  setTimeout(() => {
    console.log(p1)
  }, 1000)
}).finally(res => {
  console.log('finally', res)
})

```

### 题目要点

Promise的状态一旦改变就无法改变

<details>
<summary>参考答案</summary>

## 解析

* Promise的状态一旦改变就无法改变
* finally不管Promise的状态是`resolved`还是`rejected`都会执行，且它的回调函数是接收不到Promise的结果的，所以finally()中的res是一个迷惑项。
* 最后一个定时器打印出的p1其实是`.finally`的返回值，我们知道`.finally`的返回值如果在没有抛出错误的情况下默认会是上一个Promise的返回值，而这道题中`.finally`上一个Promise是`.then()`，但是这个`.then()`并没有返回值，所以p1打印出来的Promise的值会是`undefined`，如果你在定时器的下面加上一个`return 1`，则值就会变成1。

## 结果
```
'resolve1'
'finally' undefined
'timer1'
Promise{<resolved>: undefined}

```

</details>

## 219. 【Promise第39题】下面代码的输出是什么？ {#question-41c2b7e0-3ab2-4a94-8017-1804b0ddf868}

> 难度：4 · 类型：QA

```js
const async1 = async () => {
  console.log('async1');
  setTimeout(() => {
    console.log('timer1')
  }, 2000)
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 end')
  return 'async1 success'
}
console.log('script start');
async1().then(res => console.log(res));
console.log('script end');
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then(res => console.log(res))
setTimeout(() => {
  console.log('timer2')
}, 1000)

```

### 题目要点

需要注意的点：

<details>
<summary>参考答案</summary>

## 解析

需要注意的点：

* async函数中await的`new Promise`要是没有返回值的话则不执行后面的内容
* .then函数中的参数期待的是函数，如果不是函数的话会发生透传
* 注意定时器的延迟时间

## 结果

```
'script start'
'async1'
'promise1'
'script end'
1
'timer2'
'timer1'

```

</details>

## 220. 【Promise第38题】下面代码的输出是什么？ {#question-570eed0a-2340-4c59-a6c0-967db6a7dc48}

> 难度：4 · 类型：QA

```js
const first = () => (new Promise((resolve, reject) => {
    console.log(3);
    let p = new Promise((resolve, reject) => {
        console.log(7);
        setTimeout(() => {
            console.log(5);
            resolve(6);
            console.log(p)
        }, 0)
        resolve(1);
    });
    resolve(2);
    p.then((arg) => {
        console.log(arg);
    });
}));
first().then((arg) => {
    console.log(arg);
});
console.log(4);

```

### 题目要点

第一段代码定义的是一个函数，所以我们得看看它是在哪执行的，发现它在4之前，所以可以来看看first函数里面的内容了。

<details>
<summary>参考答案</summary>

## 解析

* 第一段代码定义的是一个函数，所以我们得看看它是在哪执行的，发现它在4之前，所以可以来看看first函数里面的内容了。
* 函数first返回的是一个`new Promise()`，因此先执行里面的同步代码3
* 接着又遇到了一个`new Promise()`，直接执行里面的同步代码7
* 执行完7之后，在p中，遇到了一个定时器，先将它放到下一个宏任务队列里不管它，接着向下走
* 碰到了`resolve(1)`，这里就把p的状态改为了resolved，且返回值为1，不过这里也先不执行
* 跳出p，碰到了`resolve(2)`，这里的`resolve(2)`，表示的是把first函数返回的那个Promise的状态改了，也先不管它。
* 然后碰到了`p.then`，将它加入本次循环的微任务列表，等待执行
* 跳出first函数，遇到了`first().then()`，将它加入本次循环的微任务列表(p.then的后面执行)
* 然后执行同步代码4
* 本轮的同步代码全部执行完毕，查找微任务列表，发现`p.then`和`first().then()`，依次执行，打印出1和2
* 本轮任务执行完毕了，发现还有一个定时器没有跑完，接着执行这个定时器里的内容，执行同步代码5
* 然后又遇到了一个resolve(6)，它是放在p里的，但是p的状态在之前已经发生过改变了，因此这里就不会再改变，也就是说resolve(6)相当于没任何用处，因此打印出来的p为`Promise{<resolved>: 1}`。

## 结果

```
3
7
4
1
2
5
Promise{<resolved>: 1}
```

</details>

## 221. 【Promise第37题】下面代码的输出是什么？ {#question-59b71384-0a0a-4d2e-a63a-f4fb75650b60}

> 难度：3 · 类型：QA

```js
async function async1 () {
  try {
    await Promise.reject('error!!!')
  } catch(e) {
    console.log(e)
  }
  console.log('async1');
  return Promise.resolve('async1 success')
}
async1().then(res => console.log(res))
console.log('script start')

```

### 题目要点

核心考查：【Promise第37题】下面代码的输出是什么？的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```
'script start'
'error!!!'
'async1'
'async1 success'

```

</details>

## 222. 【Promise第36题】下面代码的输出是什么？ {#question-32b06302-58e6-44df-acb7-6c975dcc2957}

> 难度：3 · 类型：QA

```js
async function async1 () {
  await async2();
  console.log('async1');
  return 'async1 success'
}
async function async2 () {
  return new Promise((resolve, reject) => {
    console.log('async2')
    reject('error')
  })
}
async1().then(res => console.log(res))
```

### 题目要点

核心考查：【Promise第36题】下面代码的输出是什么？的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```
'async2'
Uncaught (in promise) error
```

</details>

## 223. 【Promise第35题】下面代码的输出是什么？ {#question-26bf47fe-07e4-4014-b3ea-8a745f70d718}

> 难度：3 · 类型：QA

```js
async function testSometing() {
  console.log("执行testSometing");
  return "testSometing";
}

async function testAsync() {
  console.log("执行testAsync");
  return Promise.resolve("hello async");
}

async function test() {
  console.log("test start...");
  const v1 = await testSometing();
  console.log(v1);
  const v2 = await testAsync();
  console.log(v2);
  console.log(v1, v2);
}

test();

var promise = new Promise(resolve => {
  console.log("promise start...");
  resolve("promise");
});
promise.then(val => console.log(val));

console.log("test end...");

```

### 题目要点

这儿直接给出答案：

<details>
<summary>参考答案</summary>

这儿直接给出答案：

```
'test start...'
'执行testSometing'
'promise start...'
'test end...'
'testSometing'
'执行testAsync'
'promise'
'hello async'
'testSometing' 'hello async'
```

</details>

## 224. 【Promise第34题】下面代码的输出是什么？ {#question-7fdc5ee0-1c5f-483b-927b-140536ea83f2}

> 难度：4 · 类型：QA

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log('script end')

```

### 题目要点

经过前面的题目解析，相信这道题可以很容易得出结果。

<details>
<summary>参考答案</summary>

经过前面的题目解析，相信这道题可以很容易得出结果。

## 结果

```
'script start'
'async1 start'
'async2'
'promise1'
'script end'
'async1 end'
'promise2'
'setTimeout'
```

</details>

## 225. 【Promise第33题】下面代码的输出是什么？ {#question-a1902422-cbf4-4551-9f88-891eb1777e8d}

> 难度：2.5 · 类型：QA

```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('promise resolve')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => {
  console.log(res)
})
new Promise(resolve => {
  console.log('promise2')
  setTimeout(() => {
    console.log('timer')
  })
})

```

### 题目要点

这道题也不难，不过有一点需要注意的，在async1中的`new Promise` resovle的值，和`async1().then()`里的值是没有关系的，很多小伙伴可能看到`resovle('promise resolve')`就会误以为是`async1().then()`中的返回值。

<details>
<summary>参考答案</summary>

## 解析

这道题也不难，不过有一点需要注意的，在async1中的`new Promise` resovle的值，和`async1().then()`里的值是没有关系的，很多小伙伴可能看到`resovle('promise resolve')`就会误以为是`async1().then()`中的返回值。

## 结果

```
'script start'
'async1 start'
'promise1'
'promise2'
'async1 success'
'async1 end'
'timer'
```

</details>

## 226. 【Promise第32题】下面代码的输出是什么？ {#question-52ba6f44-41dd-44cb-a2f4-2dc1589fb02b}

> 难度：2.5 · 类型：QA

```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')

```

### 题目要点

在async1中await后面的Promise是没有返回值的，也就是它的状态始终是pending状态，因此相当于一直在await，await，await却始终没有响应...

<details>
<summary>参考答案</summary>

## 解析

在async1中await后面的Promise是没有返回值的，也就是它的状态始终是pending状态，因此相当于一直在await，await，await却始终没有响应...

所以在await之后的内容是不会执行的，也包括async1后面的 .then。

## 结果

```
'script start'
'async1 start'
'promise1'
'script end'
```

</details>

## 227. 【Promise第31题】下面代码的输出是什么？ {#question-ced16bc7-215d-47a2-9bef-7e6ab67f303c}

> 难度：2.5 · 类型：QA

```js
async function fn () {
  // return await 1234
  // 等同于
  return 123
}
fn().then(res => console.log(res))
```

### 题目要点

正常情况下，async中的await命令是一个Promise对象，返回该对象的结果。

<details>
<summary>参考答案</summary>

## 解析

正常情况下，async中的await命令是一个Promise对象，返回该对象的结果。

但如果不是Promise对象的话，就会直接返回对应的值，相当于Promise.resolve()

## 结果

```
123
```

</details>

## 228. 【Promise第30题】下面代码的输出是什么？ {#question-2c14e603-0e2b-4a05-89b7-d5c45804527a}

> 难度：2 · 类型：QA

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('timer1')
  }, 0)
}
async function async2() {
  setTimeout(() => {
    console.log('timer2')
  }, 0)
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log('timer3')
}, 0)
console.log("start")

```

### 题目要点

定时器谁先执行，你只需要关注谁先被调用的以及延迟时间是多少，这道题中延迟时间都是0，所以只要关注谁先被调用的。

<details>
<summary>参考答案</summary>

## 解析

定时器谁先执行，你只需要关注谁先被调用的以及延迟时间是多少，这道题中延迟时间都是0，所以只要关注谁先被调用的。

## 结果

```
'async1 start'
'async2'
'start'
'async1 end'
'timer2'
'timer3'
'timer1'
```

</details>

## 229. 【Promise第29题】下面代码的输出是什么？ {#question-96feb2bc-cdd7-4b16-be8a-e9d5af64a27b}

> 难度：3 · 类型：QA

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  setTimeout(() => {
    console.log('timer')
  }, 0)
  console.log("async2");
}
async1();
console.log("start")

```

### 题目要点

定时器始终还是最后执行的，它被放到下一条宏任务的延迟队列中。

<details>
<summary>参考答案</summary>

## 解析
定时器始终还是最后执行的，它被放到下一条宏任务的延迟队列中。

## 结果
```
'async1 start'
'async2'
'start'
'async1 end'
'timer'
```

</details>

## 230. 【Promise第28题】下面代码的输出是什么？ {#question-2b7bc012-86d2-405a-8a26-778f5f1b6dfe}

> 难度：3 · 类型：QA

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')
```

### 题目要点

首先一进来是创建了两个函数的，我们先不看函数的创建位置，而是看它的调用位置

<details>
<summary>参考答案</summary>

## 解析

* 首先一进来是创建了两个函数的，我们先不看函数的创建位置，而是看它的调用位置
* 发现async1函数被调用了，然后去看看调用的内容
* 执行函数中的同步代码async1 start，之后碰到了await，它会阻塞async1后面代码的执行，因此会先去执行async2中的同步代码async2，然后跳出async1
* 跳出async1函数后，执行同步代码start
* 在一轮宏任务全部执行完之后，再来执行刚刚await后面的内容async1 end。

在这里，你可以理解为「紧跟着await后面的语句相当于放到了new Promise中，下一行及之后的语句相当于放在Promise.then中」。

## 结果
```
'async1 start'
'async2'
'start'
'async1 end'
```

</details>

## 231. 【Promise第27题】下面代码的输出是什么？ {#question-44b5f8c5-1d8c-4294-b668-7f7f096cd44c}

> 难度：2 · 类型：QA

```js

function runAsync(x) {
  const p = new Promise(r =>
    setTimeout(() => r(x, console.log(x)), 1000)
  );
  return p;
}
function runReject(x) {
  const p = new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
  return p;
}
Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log("result: ", res))
  .catch(err => console.log(err));

```

### 题目要点

.race()的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。

<details>
<summary>参考答案</summary>

## 解析

.race()的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。

## 结果

```
0
'Error: 0'
1
2
3
```

</details>

## 232. 【Promise第26题】下面代码的输出是什么？ {#question-613e333e-ffca-45ff-a13a-debd8053d913}

> 难度：2 · 类型：QA

```js
function runAsync (x) {
  const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
  return p
}
function runReject (x) {
  const p = new Promise((res, rej) => setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x))
  return p
}
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res))
  .catch(err => console.log(err))

```

### 题目要点

.catch是会捕获最先的那个异常，在这道题目中最先的异常就是runReject(2)的结果。

<details>
<summary>参考答案</summary>

## 解析

.catch是会捕获最先的那个异常，在这道题目中最先的异常就是runReject(2)的结果。

## 结果
```
// 1s后输出
1
3
// 2s后输出
2
Error: 2
// 4s后输出
4
```

</details>

## 233. 【Promise第25题】下面代码的输出是什么？ {#question-3489b960-4172-47f8-9ae2-93616d85009f}

> 难度：1.5 · 类型：QA

```js
function runAsync (x) {
    const p = new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
    return p
}
Promise.all([runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log(res))
```

### 题目要点

.all()的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调。

<details>
<summary>参考答案</summary>

## 解析

.all()的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调。

## 答案

```
1
2
3
[1, 2, 3]
```

</details>

## 234. 【Promise第24题】下面代码的输出是什么？ {#question-fa9e9946-de5b-4998-a224-8d512d3ccac2}

> 难度：4 · 类型：QA

```js
function promise1 () {
  let p = new Promise((resolve) => {
    console.log('promise1');
    resolve('1')
  })
  return p;
}
function promise2 () {
  return new Promise((resolve, reject) => {
    reject('error')
  })
}
promise1()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally2'))

```

### 题目要点

首先定义了两个函数`promise1`和`promise2`，先不管接着往下看。

<details>
<summary>参考答案</summary>

## 执行过程

* 首先定义了两个函数`promise1`和`promise2`，先不管接着往下看。
* `promise1`函数先被调用了，然后执行里面`new Promise`的同步代码打印出`promise1`
* 之后遇到了`resolve(1)`，将`p`的状态改为了`resolved`并将结果保存下来。
* 此时`promise1`内的函数内容已经执行完了，跳出该函数
* 碰到了`promise1().then()`，由于`promise1`的状态已经发生了改变且为`resolved`。因此将·promise1().then()·这条微任务加入本轮的微任务列表(这是第一个微任务)
* 这时候要注意了，代码并不会接着往链式调用的下面走，也就是不会先将`.finally`加入微任务列表，那是因为`.then`本身就是一个微任务，它链式后面的内容必须得等当前这个微任务执行完才会执行，因此这里我们先不管`.finally()`
* 再往下走碰到了`promise2()`函数，其中返回的`new Promise`中并没有同步代码需要执行，所以执行`reject('error')`的时候将`promise2`函数中的`Promise`的状态变为了`rejected`
* 跳出`promise2`函数，遇到了`promise2().catch()`，将其加入当前的微任务队列(这是第二个微任务)，且链式调用后面的内容得等该任务执行完后才执行，和`.then()`一样。
* 本轮的宏任务全部执行完了，来看看微任务列表，存在`promise1().then()`，执行它，打印出1，然后遇到了`.finally()`这个微任务将它加入微任务列表(这是第三个微任务)等待执行
* 再执行`promise2().catch()`打印出`error`，执行完后将`finally2`加入微任务加入微任务列表(这是第四个微任务)
* 本轮又全部执行完了，但是微任务列表还有两个新的微任务没有执行完，因此依次执行`finally1`和`finally2`。

## 结果

```
'promise1'
'1'
'error'
'finally1'
'finally2'
```

</details>

## 235. 【Promise第23题】下面代码的输出是什么？ {#question-e233c823-d125-4abe-b1da-878751a92cd9}

> 难度：2.5 · 类型：QA

```js
Promise.resolve('1')
  .then(res => {
    console.log(res)
  })
  .finally(() => {
    console.log('finally')
  })
Promise.resolve('2')
  .finally(() => {
    console.log('finally2')
    return '我是finally2返回的值'
  })
  .then(res => {
    console.log('finally2后面的then函数', res)
  })

```

### 题目要点

.finally()，这个功能一般不太用在面试中，不过如果碰到了你也应该知道该如何处理。

<details>
<summary>参考答案</summary>

## 解析

.finally()，这个功能一般不太用在面试中，不过如果碰到了你也应该知道该如何处理。

其实只要记住它三个很重要的知识点就可以了：

* .finally()方法不管Promise对象最后的状态如何都会执行
* .finally()方法的回调函数不接受任何的参数，也就是说你在.finally()函数中是没法知道Promise最终的状态是resolved还是rejected的
* 它最终返回的默认会是一个上一次的Promise对象值，不过如果抛出的是一个异常则返回异常的Promise对象。

上面的代码中，这两个Promise的.finally都会执行，且就算finally2返回了新的值，它后面的then()函数接收到的结果却还是'2'。

## 结果
```
'1'
'finally2'
'finally'
'finally2后面的then函数' '2'
```

</details>

## 236. 【Promise第22题】下面代码的输出是什么？ {#question-9656ede7-6815-4a00-9df3-60c0219e4383}

> 难度：2 · 类型：QA

```js
Promise.resolve()
  .then(function success (res) {
    throw new Error('error!!!')
  }, function fail1 (err) {
    console.log('fail1', err)
  }).catch(function fail2 (err) {
    console.log('fail2', err)
  })
```

### 题目要点

由于Promise调用的是resolve()，因此.then()执行的应该是success()函数，可是success()函数抛出的是一个错误，它会被后面的catch()给捕获到，而不是被fail1函数捕获。

<details>
<summary>参考答案</summary>

## 解析

由于Promise调用的是resolve()，因此.then()执行的应该是success()函数，可是success()函数抛出的是一个错误，它会被后面的catch()给捕获到，而不是被fail1函数捕获。

## 结果

```
fail2 Error: error!!!
    at success
```

</details>

## 237. 【Promise第21题】下面代码的输出是什么？ {#question-023f27d0-f90b-446d-bd6c-293e95f9c9b8}

> 难度：3 · 类型：QA

```js
Promise.reject('err!!!')
  .then((res) => {
    console.log('success', res)
  }, (err) => {
    console.log('error', err)
  }).catch(err => {
    console.log('catch', err)
  })

```

### 题目要点

.then函数中的两个参数。

<details>
<summary>参考答案</summary>

## 解析

.then函数中的两个参数。

第一个参数是用来处理Promise成功的函数，第二个则是处理失败的函数。

也就是说Promise.resolve('xxx')的值会进入成功的函数，Promise.reject('xxx')的值会进入失败的函数。

## 答案
```
'error' 'err!!!'
```

</details>

## 238. 【Promise第20题】下面代码的输出是什么？ {#question-7a27cdc8-5f66-4cea-8350-c20d0bd2836b}

> 难度：3.5 · 类型：QA

```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
```

### 题目要点

.then 或者 .catch 的参数期望是函数，传入非函数则会发生值透传。

<details>
<summary>参考答案</summary>

## 解析

.then 或者 .catch 的参数期望是函数，传入非函数则会发生值透传。

第一个then和第二个then中传入的都不是函数，一个是数字类型，一个是对象类型，因此发生了透传，将resolve(1) 的值直接传到最后一个then里。

## 结果

```
1
```

</details>

## 239. 【Promise第19题】下面代码的输出是什么？ {#question-090868ab-fef9-4759-8b81-20708a165fa1}

> 难度：3 · 类型：QA

```js
const promise = Promise.resolve().then(() => {
  return promise;
})
promise.catch(console.err)
```

### 题目要点

.then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环，因此结果会报错。

<details>
<summary>参考答案</summary>

## 解析

.then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环，因此结果会报错。

## 结果

```
Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>
```

</details>

## 240. 【Promise第18题】下面代码的输出是什么？ {#question-e0e3dbcd-2e8a-4756-9241-bbb23af9c2e8}

> 难度：3 · 类型：QA

```js
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})
```

### 题目要点

返回任意一个非 promise 的值都会被包裹成 promise 对象，因此这里的`return new Error('error!!!')`也被包裹成了`return Promise.resolve(new Error('error!!!'))`。

<details>
<summary>参考答案</summary>

## 解析

返回任意一个非 promise 的值都会被包裹成 promise 对象，因此这里的`return new Error('error!!!')`也被包裹成了`return Promise.resolve(new Error('error!!!'))`。

## 结果
```
"then: " "Error: error!!!"
```

此题中，当然如果想抛出一个错误的话，可以用下面的任意一种：

```js
return Promise.reject(new Error('error!!!'));
// or
throw new Error('error!!!')
```

</details>

## 241. 【Promise第17题】下面代码的输出是什么？ {#question-30dd1b36-496d-4a65-a3e7-75be59b36570}

> 难度：3 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('timer')
    resolve('success')
  }, 1000)
})
const start = Date.now();
promise.then(res => {
  console.log(res, Date.now() - start)
})
promise.then(res => {
  console.log(res, Date.now() - start)
})

```

### 题目要点

如果执行足够快的话，也可能两个都是1001。

<details>
<summary>参考答案</summary>

## 解析

如果执行足够快的话，也可能两个都是1001。

Promise 的 .then 或者 .catch 可以被调用多次，但这里 Promise 构造函数只执行一次。或者说 promise 内部状态一经改变，并且有了一个值，那么后续每次调用 .then 或者 .catch 都会直接拿到该值。

## 结果

```
'timer'
'success' 1001
'success' 1002
```

</details>

## 242. 【Promise第16题】下面代码的输出是什么？ {#question-58350841-57d6-4b0a-9e31-57f5f0e16357}

> 难度：3 · 类型：QA

```js
Promise.reject(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    console.log(err);
    return 3
  })
  .then(res => {
    console.log(res);
  });
```

### 题目要点

因为reject(1)，此时走的是catch，且第二个then中的res得到的就是catch中的返回值。

<details>
<summary>参考答案</summary>

## 解析

因为reject(1)，此时走的是catch，且第二个then中的res得到的就是catch中的返回值。

## 结果
```
1
3
```

</details>

## 243. 【Promise第15题】下面代码的输出是什么？ {#question-1b41e9cc-194a-4e0c-8bc5-17a83af9abad}

> 难度：3 · 类型：QA

```js
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
```

### 题目要点

Promise可以链式调用，不过promise 每次调用 .then 或者 .catch 都会返回一个新的 promise，从而实现了链式调用, 它并不像一般我们任务的链式调用一样return this。

<details>
<summary>参考答案</summary>

## 解析

Promise可以链式调用，不过promise 每次调用 .then 或者 .catch 都会返回一个新的 promise，从而实现了链式调用, 它并不像一般我们任务的链式调用一样return this。

上面的输出结果之所以依次打印出1和2，那是因为resolve(1)之后走的是第一个then方法，并没有走catch里，所以第二个then中的res得到的实际上是第一个then的返回值。

且return 2会被包装成resolve(2)。

## 结果
```
1
2
```

</details>

## 244. 【Promise第14题】下面代码的输出是什么？ {#question-31621982-633a-4254-a1a4-b518f734c674}

> 难度：2.5 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  reject("error");
  resolve("success2");
});
promise
.then(res => {
    console.log("then1: ", res);
  }).then(res => {
    console.log("then2: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  }).then(res => {
    console.log("then3: ", res);
  })
```

### 题目要点

catch不管被连接到哪里，都能捕获上层未捕捉过的错误。

<details>
<summary>参考答案</summary>

## 解析
catch不管被连接到哪里，都能捕获上层未捕捉过的错误。

至于then3也会被执行，那是因为catch()也会返回一个Promise，且由于这个Promise没有返回值，所以打印出来的是undefined。

## 结果
```
"catch: " "error"
"then3: " undefined
```

</details>

## 245. 【Promise第13题】下面代码的输出是什么？ {#question-f6f14b00-ae3f-43a9-9085-12333dd0cb8c}

> 难度：3 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  resolve("success1");
  reject("error");
  resolve("success2");
});
promise
.then(res => {
    console.log("then: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  })

```

### 题目要点

构造函数中的 resolve 或 reject 只有第一次执行有效，多次调用没有任何作用 ，Promise的状态一经改变就不能再改变。

<details>
<summary>参考答案</summary>

## 解析

构造函数中的 resolve 或 reject 只有第一次执行有效，多次调用没有任何作用 ，Promise的状态一经改变就不能再改变。

## 结果

```
"then: success1"
```

</details>

## 246. 【Promise第12题】下面代码的输出是什么？ {#question-37a4ad10-3819-4ab3-bb5f-26a6bf1ca07a}

> 难度：3 · 类型：QA

```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
    console.log("timer1");
  }, 1000);
  console.log("promise1里的内容");
});
const promise2 = promise1.then(() => {
  throw new Error("error!!!");
});
console.log("promise1", promise1);
console.log("promise2", promise2);
setTimeout(() => {
  console.log("timer2");
  console.log("promise1", promise1);
  console.log("promise2", promise2);
}, 2000);
```

### 题目要点

和之前的题目比较类似，不做详细分析

<details>
<summary>参考答案</summary>

和之前的题目比较类似，不做详细分析

```
'promise1里的内容'
'promise1' Promise{<pending>}
'promise2' Promise{<pending>}
'timer1'
test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
'timer2'
'promise1' Promise{<resolved>: "success"}
'promise2' Promise{<rejected>: Error: error!!!}

```

</details>

## 247. 【Promise第11题】下面代码的输出是什么？ {#question-d9a36bb7-972c-4afb-abb6-fcbaa30612cf}

> 难度：3 · 类型：QA

```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error!!!')
})
console.log('promise1', promise1)
console.log('promise2', promise2)
setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
}, 2000)
```

### 题目要点

从上至下，先执行第一个new Promise中的函数，碰到setTimeout将它加入下一个宏任务列表

<details>
<summary>参考答案</summary>

## 过程分析

* 从上至下，先执行第一个new Promise中的函数，碰到setTimeout将它加入下一个宏任务列表
* 跳出new Promise，碰到promise1.then这个微任务，但其状态还是为pending，这里理解为先不执行
* promise2是一个新的状态为pending的Promise
* 执行同步代码console.log('promise1')，且打印出的promise1的状态为pending
* 执行同步代码console.log('promise2')，且打印出的promise2的状态为pending
* 碰到第二个定时器，将其放入下一个宏任务列表
* 第一轮宏任务执行结束，并且没有微任务需要执行，因此执行第二轮宏任务
* 先执行第一个定时器里的内容，将promise1的状态改为resolved且保存结果并将之前的promise1.then推入微任务队列
* 该定时器中没有其它的同步代码可执行，因此执行本轮的微任务队列，也就是promise1.then，它抛出了一个错误，且将promise2的状态设置为了rejected
* 第一个定时器执行完毕，开始执行第二个定时器中的内容
* 打印出'promise1'，且此时promise1的状态为resolved
* 打印出'promise2'，且此时promise2的状态为rejected

## 结果

```
'promise1' Promise{<pending>}
'promise2' Promise{<pending>}
test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
'promise1' Promise{<resolved>: "success"}
'promise2' Promise{<rejected>: Error: error!!!}
```

</details>

## 248. 【Promise第10题】下面代码的输出是什么？ {#question-fa6c1ad8-274c-4830-aee9-6799d6a7fdc1}

> 难度：2.5 · 类型：QA

```js
Promise.resolve().then(() => {
  console.log('promise1');
  const timer2 = setTimeout(() => {
    console.log('timer2')
  }, 0)
});
const timer1 = setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
console.log('start');

```

### 题目要点

刚开始整个脚本作为第一次宏任务来执行，我们将它标记为宏1，从上至下执行

<details>
<summary>参考答案</summary>

## 过程分析

* 刚开始整个脚本作为第一次宏任务来执行，我们将它标记为宏1，从上至下执行
* 遇到Promise.resolve().then这个微任务，将then中的内容加入第一次的微任务队列标记为微1
* 遇到定时器timer1，将它加入下一次宏任务的延迟列表，标记为宏2，等待执行(先不管里面是什么内容)
* 执行宏1中的同步代码start
* 第一次宏任务(宏1)执行完毕，检查第一次的微任务队列(微1)，发现有一个promise.then这个微任务需要执行
* 执行打印出微1中同步代码promise1，然后发现定时器timer2，将它加入宏2的后面，标记为宏3
* 第一次微任务队列(微1)执行完毕，执行第二次宏任务(宏2)，首先执行同步代码timer1
* 然后遇到了promise2这个微任务，将它加入此次循环的微任务队列，标记为微2
* 宏2中没有同步代码可执行了，查找本次循环的微任务队列(微2)，发现了promise2，执行它
* 第二轮执行完毕，执行宏3，打印出timer2

## 结果

```
'start'
'promise1'
'timer1'
'promise2'
'timer2'
```

</details>

## 249. 【Promise第九题】下面两段代码分别输出什么？ {#question-a2c0b41f-1a7e-478b-9e0f-eba7e31a0b2c}

> 难度：3 · 类型：QA

代码一：
```js
setTimeout(() => {
  console.log('timer1');
  setTimeout(() => {
    console.log('timer3')
  }, 0)
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```

代码二：
```js
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => {
    console.log('promise')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```

### 题目要点

代码一输出：

<details>
<summary>参考答案</summary>

代码一输出：
```
'start'
'timer1'
'timer2'
'timer3'
```

代码二输出：
```
'start'
'timer1'
'promise'
'timer2'
```

这两个例子，看着好像只是把第一个定时器中的内容换了一下而已。

一个是为定时器timer3，一个是为Promise.then

但是如果是定时器timer3的话，它会在timer2后执行，而Promise.then却是在timer2之前执行。

你可以这样理解，Promise.then是微任务，它会被加入到本轮中的微任务列表，而定时器timer3是宏任务，它会被加入到下一轮的宏任务中。

</details>

## 250. 【Promise第八题】下面代码的输出是什么？ {#question-a7ccbacc-5415-4c3f-b168-5fcc4d7792ee}

> 难度：2 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```

### 题目要点

从上至下，先遇到new Promise，执行该构造函数中的代码1

<details>
<summary>参考答案</summary>

## 解析

* 从上至下，先遇到new Promise，执行该构造函数中的代码1
* 然后碰到了定时器，将这个定时器中的函数放到下一个宏任务的延迟队列中等待执行
* 执行同步代码2
* 跳出promise函数，遇到promise.then，但其状态还是为pending，这里理解为先不执行
* 执行同步代码4
* 一轮循环过后，进入第二次宏任务，发现延迟队列中有setTimeout定时器，执行它
* 首先执行timerStart，然后遇到了resolve，将promise的状态改为resolved且保存结果并将之前的promise.then推入微任务队列
* 继续执行同步代码timerEnd
* 宏任务全部执行完毕，查找微任务队列，发现promise.then这个微任务，执行它。

## 结果

```
1
2
4
"timerStart"
"timerEnd"
"success"
```

</details>

## 251. 【Promise第七题】下面代码的输出是什么？ {#question-c3d12ae7-e074-4072-a07a-aad43ec87e94}

> 难度：2 · 类型：QA

```js
console.log('start')
setTimeout(() => {
  console.log('time')
})
Promise.resolve().then(() => {
  console.log('resolve')
})
console.log('end')
```

### 题目要点

刚开始整个脚本作为一个宏任务来执行，对于同步代码直接压入执行栈进行执行，因此先打印出start和end。

<details>
<summary>参考答案</summary>

## 解析

* 刚开始整个脚本作为一个宏任务来执行，对于同步代码直接压入执行栈进行执行，因此先打印出start和end。
* setTimout作为一个宏任务被放入宏任务队列(下一个)
* Promise.then作为一个微任务被放入微任务队列
* 本次宏任务执行完，检查微任务，发现Promise.then，执行它
* 接下来进入下一个宏任务，发现setTimeout，执行。

## 结果

```
'start'
'end'
'resolve'
'time'
```

</details>

## 252. 【Promise第六题】下面代码的输出是什么？ {#question-1b7efa22-c54d-4dc9-a54e-7faa69f5b821}

> 难度：2 · 类型：QA

```js
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });
console.log("start");
fn().then(res => {
  console.log(res);
});
```

### 题目要点

start就在1之前打印出来了，因为fn函数是之后执行的。

<details>
<summary>参考答案</summary>

## 解析

start就在1之前打印出来了，因为fn函数是之后执行的。

注意：不要看到new Promise()，就以为执行它的第一个参数函数，我们还需要注意它是不是被包裹在函数当中，如果是的话，只有在函数调用的时候才会执行。

## 答案

```
"start"
1
"success"
```

</details>

## 253. 【Promise第四题】下面代码的输出是什么？ {#question-db6857d7-1559-4abe-816d-545b9be4e05e}

> 难度：2 · 类型：QA

```javascript
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('resolve1')
})
const promise2 = promise1.then(res => {
  console.log(res)
})
console.log('1', promise1);
console.log('2', promise2);
```

### 题目要点

从上至下，先遇到new Promise，执行该构造函数中的代码promise1

<details>
<summary>参考答案</summary>

## 过程分析

* 从上至下，先遇到new Promise，执行该构造函数中的代码promise1
* 碰到resolve函数, 将promise1的状态改变为resolved, 并将结果保存下来
* 碰到promise1.then这个微任务，将它放入微任务队列
* promise2是一个新的状态为pending的Promise
* 执行同步代码1， 同时打印出promise1的状态是resolved
* 执行同步代码2，同时打印出promise2的状态是pending
* 宏任务执行完毕，查找微任务队列，发现promise1.then这个微任务且状态为resolved，执行它。

## 结果

```
'promise1'
'1' Promise{<resolved>: 'resolve1'}
'2' Promise{<pending>}
'resolve1'
```

</details>

## 254. 【Promise第二题】下面代码的输出是什么？ {#question-3c969c35-6d25-4932-977e-d9ba31000ccd}

> 难度：1.5 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve('success')
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
```

### 题目要点

从上至下，先遇到`new Promise`，执行其中的同步代码1

<details>
<summary>参考答案</summary>

## 过程分析

* 从上至下，先遇到`new Promise`，执行其中的同步代码1
* 再遇到`resolve('success')`， 将promise的状态改为了resolved并且将值保存下来
* 继续执行同步代码2
* 跳出promise，往下执行，碰到`promise.then`这个微任务，将其加入微任务队列
* 执行同步代码4
* 本轮宏任务全部执行完毕，检查微任务队列，发现`promise.then`这个微任务且状态为resolved，执行它。

## 结果

```
1 2 4 3
```

</details>

## 255. 【Promise第一题】下面代码的输出是什么？ {#question-7579cdab-94b8-4a25-ab87-77569bb7d86d}

> 难度：1 · 类型：QA

```js
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
})
console.log('1', promise1);
```

### 题目要点

从上至下，先遇到new Promise，执行该构造函数中的代码promise1

<details>
<summary>参考答案</summary>

## 过程分析：

* 从上至下，先遇到new Promise，执行该构造函数中的代码promise1
* 然后执行同步代码1，此时promise1没有被resolve或者reject，因此状态还是pending

## 结果

```
'promise1'
'1' Promise{<pending>}
```

</details>

## 256. 怎么实现一个扫描二维码登录PC网站的需求？ {#question-e928aade-65d6-438d-be11-8250f7784f4d}

> 难度：3.5 · 类型：QA

### 题目要点

### 二维码登录的本质

二维码登录的目的是让用户能够在不输入账号密码的情况下登录系统，实现这一目的需要用户告诉系统自己的身份信息，并通过某种方式向系统证明自己的身份。

### 扫描二维码登录的一般步骤

1. **扫码前**：手机端应用已登录，PC端显示一个二维码等待扫描。
2. **手机端扫描**：用户用手机扫描PC端的二维码。
3. **手机端确认**：用户在手机端点击确认，完成登录过程。

### 具体流程

#### 生成二维码

1. **PC端请求**：PC端向服务端请求生成登录二维码，并传递PC端设备信息。
2. **服务端响应**：服务端生成二维码ID，与PC端设备信息绑定，返回二维码ID给PC端。
3. **PC端生成二维码**：PC端使用二维码ID生成二维码。
4. **PC端轮询**：PC端不断轮询服务端，查询二维码状态。

#### 扫描二维码

1. **用户扫描**：用户用手机扫描PC端二维码，获取二维码ID。
2. **手机端请求**：手机端将移动端身份信息与二维码ID发送给服务端。
3. **服务端处理**：服务端将身份信息与二维码ID绑定，生成临时token，返回给手机端。

#### 状态确认

1. **手机端确认**：手机端弹出确认登录界面，用户点击确认。
2. **服务端处理**：服务端根据确认信息生成PC端登录token，并通知PC端。
3. **登录成功**：PC端收到登录token，登录成功，可以使用token访问服务端资源。

<details>
<summary>参考答案</summary>

## 二维码登录本质

二维码登录本质上也是一种登录认证方式。既然是登录认证，要做的也就两件事情：

* 告诉系统我是谁
* 向系统证明我是谁

## 扫描二维码登录的一般步骤

* 扫码前，手机端应用是已登录状态，PC端显示一个二维码，等待扫描
* 手机端打开应用，扫描PC端的二维码，扫描后，会提示"已扫描，请在手机端点击确认"
* 用户在手机端点击确认，确认后PC端登录就成功了

## 具体流程

### 生成二维码

* PC端向服务端发起请求，告诉服务端，我要生成用户登录的二维码，并且把PC端设备信息也传递给服务端
* 服务端收到请求后，它生成二维码ID，并将二维码ID与PC端设备信息进行绑定
* 然后把二维码ID返回给PC端
* PC端收到二维码ID后，生成二维码(二维码中肯定包含了ID)
* 为了及时知道二维码的状态，客户端在展现二维码后，PC端不断的轮询服务端，比如每隔一秒就轮询一次，请求服务端告诉当前二维码的状态及相关信息，或者直接使用websocket，等待在服务端完成登录后进行通知

### 扫描二维码

* 用户用手机去扫描PC端的二维码，通过二维码内容取到其中的二维码ID
* 再调用服务端API将移动端的身份信息与二维码ID一起发送给服务端
* 服务端接收到后，它可以将身份信息与二维码ID进行绑定，生成临时token。然后返回给手机端
* 因为PC端一直在轮询二维码状态，所以这时候二维码状态发生了改变，它就可以在界面上把二维码状态更新为已扫描

### 状态确认

* 手机端在接收到临时token后会弹出确认登录界面，用户点击确认时，手机端携带临时token用来调用服务端的接口，告诉服务端，我已经确认
* 服务端收到确认后，根据二维码ID绑定的设备信息与账号信息，生成用户PC端登录的token
* 这时候PC端的轮询接口，它就可以得知二维码的状态已经变成了"已确认"。并且从服务端可以获取到用户登录的token
* 到这里，登录就成功了，后端PC端就可以用token去访问服务端的资源了

</details>

## 257. js中的undefined和 ReferenceError: xxx is not defined 有什么区别？ {#question-389f9946-a2d7-4bba-adde-f18330e5b2e4}

> 难度：1 · 类型：QA

### 题目要点

ReferenceError：当尝试引用一个未定义的变量/函数时，就会抛出ReferenceError。

<details>
<summary>参考答案</summary>

* ReferenceError：当尝试引用一个未定义的变量/函数时，就会抛出ReferenceError。
* undefined：当一个变量声明后，没有被赋值，那么它就是undefined类型。

</details>

## 258. Math.ceil()、Math.round()、Math.floor()三者的区别是什么？ {#question-257565c9-6179-4faa-a592-168f6269cc99}

> 难度：1 · 类型：QA

### 题目要点

Math.ceil()上取整

<details>
<summary>参考答案</summary>

* Math.ceil()上取整
* Math.round() 四舍五入
* Math.floor()下取整

</details>

## 259. 使用js生成1-10000的数组 {#question-fd0bb7e5-19a0-4473-8b07-4f0e385afd3c}

> 难度：1 · 类型：QA

### 题目要点

实现的方法很多，除了使用循环（for,while,forEach等）外，最简单的是使用`Array.from`

<details>
<summary>参考答案</summary>

实现的方法很多，除了使用循环（for,while,forEach等）外，最简单的是使用`Array.from`

```js
// 方法一
Array.from(new Array(10001).keys()).slice(1)

// 方法二
Array.from({length:10000},(node,i)=> i+1)
```

</details>

## 260. 解释下如下代码的意图：Array.prototype.slice.apply(arguments) {#question-d0625555-2b53-4edc-bf3f-2721eaf7af55}

> 难度：1 · 类型：QA

### 题目要点

arguments 为类数组对象，并不是真正的数组。

<details>
<summary>参考答案</summary>

arguments 为类数组对象，并不是真正的数组。

slice可以实现数组的浅拷贝。

由于 arguments不是真正的数组，所以没有slice方法，通过apply可以调用数组对象的slice方法，从而将arguments 类数组转换为数组。

</details>

## 261. js中数组是如何在内存中存储的？ {#question-7a9f621a-416f-4c2b-8d08-8f8e0a113c6a}

> 难度：3.5 · 类型：QA

### 题目要点

在JavaScript中，数组是一种特殊的对象，用于存储一系列的值。数组的内部实现细节由JavaScript引擎（如V8）决定

### 数组在内存中的存储

1. **对象基础**：在JavaScript中，数组和其他对象一样，都是对象。数组对象有一个特殊的键，即索引，它是一个整数。
2. **存储方式**：数组的值可以通过索引直接访问，这通常意味着它们是按照索引顺序存储在内存中的。但是，这并不意味着数组在内存中是一个连续的块。
3. **稀疏数组**：稀疏数组是指数组中存在空位的情况。对于稀疏数组，V8引擎优化了内存使用，将这些空位视为未分配的内存。
4. **元素存储**：数组中的元素可以是任意类型的数据，包括其他对象。这意味着数组可以包含各种类型的引用，这些引用指向堆内存中的其他对象。
5. **内存分配**：数组的大小可以在运行时动态增加。当数组中的元素超过其当前大小时，JavaScript引擎会重新分配内存以容纳更多的元素。
6. **索引访问**：数组的索引访问是通过哈希表来实现的，这意味着查找元素的过程是O(1)的。

### 参考资料

V8引擎的开发者博客提供了一些关于数组内部实现的细节，包括数组的存储方式、内存分配策略等。这些信息可以帮助我们更好地理解数组在内存中的存储方式。

### 总结

在JavaScript中，数组是一个复杂的数据结构，它在内存中的存储方式依赖于JavaScript引擎的具体实现。虽然数组看起来像是一个简单的数据结构，但其内部实现涉及了对象、哈希表和内存管理等复杂概念。通过了解这些细节，我们可以编写更高效的代码，并更好地利用JavaScript数组的功能。

<details>
<summary>参考答案</summary>

数组不是以一组连续的区域存储在内存中，而是一种哈希映射的形式。它可以通过多种数据结构来实现，其中一种是链表。

js分为基本类型和引用类型：

* 基本类型是保存在栈内存中的简单数据段，它们的值都有固定的大小，保存在栈空间，通过按值访问；
* 引用类型是保存在堆内存中的对象，值大小不固定，栈内存中存放的该对象的访问地址指向堆内存中的对象，JavaScript不允许直接访问堆内存中的位置，因此操作对象时，实际操作对象的引用

## js的数据类型

js的数据分为两种， 一种是原始类型（Boolean,Null,Undefined,Number,BigInt,String,Symbol）， 一种是对象（Object）。<br>
原始类型的数据放在栈中，对象的数据放在堆中。

### 堆栈的区别

* 堆（heap）是不连续的内存区域，即数据可以任意存放， 主要存放的是对象等。<br>

( 栈（stack）是一块连续的内存区域，每个区块按照一定次序存放（后进先出），栈中主要存放的是基本类型的变量的值以及指向堆中的数组或者对象的地址。

### 为什么要区分堆栈

> 变量主要是两种形式，一种内容短小（比如一个int整数），需要频繁访问，但是生命周期很短，通常只在一个方法内存活，而另一种内容可能很多（比如很长一个字符串），可能不需要太频繁的访问，但生命周期较长，通常很多个方法中可能都要用到，那么自然将这两类变量分开就显得比较理性，一类存储* 区，通常是局部变量、操作符栈、函数参数传递和返回值，另一类存储在堆区，通常是较大的结构体（或者OOP中的对象）、需要反复访问的全局变量。 堆区就是各种慢，申请内存慢，访问慢，修改慢，释放慢，整理慢（或者说GC垃圾回收），但优点也不言而喻，访问随机灵活，空间超大，在不超可用内存的情况下你要多大就给多大。 栈区就像临时工，干完就跑，所以超快，但是缺点也很多，比如生命周期短，一般只能在一个方法内存活，又比如你需要事先知道需要多大的栈（事实上绝大多数语言栈区要分配的大小编译期就确定了，Java就是这样），而且通常最大栈区可用内存都很小，你不可能往栈区里堆很多数据。

### 原始类型

原始类型有一个特点就是不可变。示例代码如下

```js
// 例子1
var str = "abc";
str[0] = "d";
console.log(str) // abc

// 例子2
var str2 = "abc";
str2 = "dbc";
console.log(str2) // dbc

```

例子1的数据没有改变， 例子2的数据却改变了， 实际上例子2是创建了一个新的字符串， 也就是内存开辟了一个新的区域给"dbc"使用。<br>

简单点来讲， 就是假设栈中存放了一个数据如"abc"， 那么这个数据就永远不会改变， 而如果是如例子2中赋值了一个其他的字符串或者任何其他改变值的情况下， 栈中都会保留原来的"abc"， 然后新开一个地方存放"dbc"。 类似下图：<br>

![image](https://static.ecool.fun//article/bb5d1191-ed99-40b7-b557-c70114208619.jpeg)

**为什么要把基础类型的值设成不可变**

1. 为了安全<br>
假设基础类型的值是可变的， 那么下面的代码会变得很奇怪

```
var strTest = "varaiable";
var fun = (str) => { str + "---ok" };
fun(strTest);
console.log(strTest) // varaiable---ok

// 可以看到strTest的值被改变了， 特别是在map之类的对象中更为显著
var map = new Map()
var strTest = "t1";
map.set(strTest, 10);
strTest = "notT1";
map.get("t1"); // undefined;
map.get("notT1"); // 10

```

这样的代码容易造成更多的bug，特别是像java之类的多线程语言， 更有可能造成线程不安全的问题。

1. 为了共享<br>
实际上， 基础类型中， 值一样的变量是共享一个内存区域的。<br>
![image](https://static.ecool.fun//article/c14cedeb-7b95-4d63-8b78-7337dff6398d.jpeg)

这样做的好处是避免额外的内存开销，提升效能。<br>
当然， 这个前提是基础类型不可变， 不然如果str1的值变化了， str2的值也会跟着变化（实际上并没有对其操作）。

### 对象类型

V8中的对象（数组也是对象）存储相对来说比较复杂，他们是存放在堆里面的数据。并且格式大致如下:<br>

![image](https://static.ecool.fun//article/f231cfc8-947c-4af7-9cd4-c4309206760e.jpeg)

这和很多资料说的是用Map实现不同， 很明显， 根据上图（[来自v8的博客](https://v8.dev/blog/fast-properties)）,起码可以说明不是使用Map来处理的。

V8是把对象中的属性分成两类， 一类是字符常量， 一类是数字or数字字符串（如"1"这种），并分别放在了两个数组，Properties和Elements。

**普通的字符常量**<br>
先从普通的字符常量说起， 字符常量的存放方式又细分为三类。

第一类： In-object<br>
实际上， 在生成一个对象的时候， v8会给该对象留下一些空间以分配属性（数量由对象的初始大小预先确定），这些属性直接存储在对象本身上。这些是V8中最快的属性，因为无需任何间接访问即可访问它们，如下图：

![image](https://static.ecool.fun//article/7ba6b644-2aa0-4d41-93fd-99fbba737e77.jpeg)

第二类： Fast properties<br>
v8的In-object空间并不多，通过对象字面量创建的无属性对象分配 4 个对象内属性存储（inobject\_properties）空间。当这些空间被使用完之后， 即会通过HideClass(隐藏类，有些也叫Map，这里统一叫隐藏类)来协助完成属性的快速访问。

HiddenClasses and DescriptorArrays<br>
HiddenClass存储有关对象的元信息，包括该对象上的属性数量以及对该对象原型的引用。除此之外，HiddenClasses里面还有一个DescriptorArrays数组， 该数组存储了对象属性的信息。<br>
即如下图：<br>

![image](https://static.ecool.fun//article/7a23abb3-5f63-4bdd-9c79-4f27c2d1f338.jpeg)

这里一般会有一个疑惑， 为什么需要一个隐藏类， 我直接搞一个hashTable不是更快吗？<br>
关于隐藏类及ICs的概率， 推荐阅读这一篇文章[JavaScript 引擎基础：Shapes 和 Inline Caches](https://zhuanlan.zhihu.com/p/38202123), 概念清晰易懂，图文并茂。<br>
这里简单说一下概念：<br>
首先看下， 隐藏类是怎么来的<br>

![image](https://static.ecool.fun//article/2010441b-9031-47ee-aee1-67466ad11094.jpeg)

从图中可以看出， 隐藏类是通过一颗树来不断生成的，每添加一个属性都会新生成一个隐藏类节点（添加数组索引属性不会创建新的）， 然后呢， 具有相同结构（相同属性，顺序相同）的对象具有相同的隐藏类。也就是说， 如果在上面的代码中加一个代码如下：

```
var a = {};
a.a = "ddd";

var b = {};
b.a = "3";
b.b = "test";

```

那么a的隐藏类是右边的第一个nofOwnDescriptors， b是第二个。对于程序代码来说， 实际上很多对象都是拥有相同的隐藏类。而隐藏类背后的主要动机是 Inline Caches 或 ICs 的概念。ICs 是促使 JavaScript 快速运行的关键因素！JavaScript 引擎利用 ICs 来记忆去哪里寻找对象属性的信息，以减少昂贵的查找次数。<br>
大致就是每次将代码编译成字节码并读取属性时，都会根据隐藏类把该属性的位置保存起来，在下一次读取或者遇到拥有相同隐藏类的对象读取时，可以根据隐藏类提供的属性位置直接读取，而避免查找过程。

第三类： Slow properties<br>
最后一种方式即是字典存储方式。字典存储模式相对来说比较简单， 先看下官方提供的图：<br>

![image](https://static.ecool.fun//article/8a8c9b4a-05d4-40c3-a17d-ebbb909165be.jpeg)

简单点说， 就是隐藏类里面的DescriptorArrays会直接置为空， 然后把属性的值和元信息直接存储在properties数组中，并通过hash的方式进行get和set。<br>
既然上面说了拥有隐藏类可以带来效能的提升， 为什么还要提供字典方式？<br>
v8的原文如下：

> However, if many properties get added and deleted from an object, it can generate a lot of time and memory overhead to maintain the descriptor array and HiddenClasses

大致意思是说，增加删除属性的操作过多会使用大量的时间和内存开销来维护descriptorArray 和 HiddenClasses。

最后， 什么时候是Fast properties（隐藏类）， 什么时候是slow properties(字典模式)?<br>
关于这一方面，推荐该系列文章[奇技淫巧学 V8 之一，对象访问模式优化](https://zhuanlan.zhihu.com/p/28777722), 以下部分为引用 新创建的小对象为Fast properties。执行如下操作的时候会变成slow properties

1. 动态添加过多的属性
2. 删除属性（delete）
3. 删除非最后添加的属性（V8 >= 6.0）

**数组类型**<br>
数组的话种类比较多， 按官方的话说多达20种类型。<br>
实际上， 数组一般是放到了一开始提的elements数组里面， 然后按索引读值， 这个比较简单， 说下其中比较典型的两种。

1. 存在缺失的元素，会按原型链串上去拿值，实际上就是对象原型链..

```
const o = ['a', 'b', 'c'];
console.log(o[1]);          // Prints 'b'.

delete o[1];                // Introduces a hole in the elements store.
console.log(o[1]);          // Prints 'undefined'; property 1 does not exist.
o.__proto__ = {1: 'B'};     // Define property 1 on the prototype.

console.log(o[0]);          // Prints 'a'.
console.log(o[1]);          // Prints 'B'.
console.log(o[2]);          // Prints 'c'.
console.log(o[3]);          // Prints undefined

```

![image](https://static.ecool.fun//article/093d9ed1-ffac-48f7-9633-dc5947400bab.jpeg)

1. 稀疏数组， 如果存在这种情况， 那么elements会存在大量的内存没有使用， 所以v8优化成字典模式，也就是和上面的字符串一样。

```
const sparseArray = [];
sparseArray[9999] = 'foo'; // Creates an array with dictionary elements.

```

除此之外， v8还在数组上做了各种优化，如Gc等， 这里不赘述。

</details>

## 262. 直接在script标签中写 export 为什么会报错？ {#question-bfffc416-1177-4c3c-bf93-622185a72fda}

> 难度：1 · 类型：QA

### 题目要点

现代浏览器可以支持用 script 标签引入模块或者脚本，如果要引入模块，必须给 script 标签添加 type=“module”。如果引入脚本，则不需要 type。

<details>
<summary>参考答案</summary>

现代浏览器可以支持用 script 标签引入模块或者脚本，如果要引入模块，必须给 script 标签添加 type=“module”。如果引入脚本，则不需要 type。

</details>

## 263. 【Promise第三题】下面代码的输出是什么？ {#question-214b0a32-c111-4c6c-aad6-4ecc14bd904a}

> 难度：1.5 · 类型：QA

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);

```

### 题目要点

和【Promise第二题】相似，只不过在promise中并没有resolve或者reject

<details>
<summary>参考答案</summary>

## 过程分析

* 和【Promise第二题】相似，只不过在promise中并没有resolve或者reject
* 因此promise.then并不会执行，它只有在被改变了状态之后才会执行。

## 结果：

```
1 2 4
```

</details>

## 264. 【Promise第五题】下面代码的输出是什么？ {#question-c363d879-8557-486c-89ef-2a0e02d2164e}

> 难度：1 · 类型：QA

```js
const fn = () => (new Promise((resolve, reject) => {
  console.log(1);
  resolve('success')
}))
fn().then(res => {
  console.log(res)
})
console.log('start')
```

### 题目要点

fn函数直接返回了一个new Promise的，而且fn函数的调用是在start之前，所以它里面的内容应该会先执行。

<details>
<summary>参考答案</summary>

## 分析

fn函数直接返回了一个new Promise的，而且fn函数的调用是在start之前，所以它里面的内容应该会先执行。

## 结果

```
1
'start'
'success'
```

</details>

## 265. js 中的倒计时，怎么实现纠正偏差？ {#question-7b48e19d-6596-4853-875f-067f9bb048a8}

> 难度：3.5 · 类型：QA

### 题目要点

在前端实现中我们一般通过 setTimeout 和 setInterval 方法来实现一个倒计时效果。但是使用这些方法会存在时间偏差的问题，这是由于 js 的程序执行机制造成的，setTimeout 和 setInterval 的作用是隔一段时间将回调事件加入到事件队列中，因此事件并不是立即执行的，它会等到当前执行栈为空的时候再取出事件执行，因此事件等待执行的时间就是造成误差的原因。

<details>
<summary>参考答案</summary>

在前端实现中我们一般通过 setTimeout 和 setInterval 方法来实现一个倒计时效果。但是使用这些方法会存在时间偏差的问题，这是由于 js 的程序执行机制造成的，setTimeout 和 setInterval 的作用是隔一段时间将回调事件加入到事件队列中，因此事件并不是立即执行的，它会等到当前执行栈为空的时候再取出事件执行，因此事件等待执行的时间就是造成误差的原因。

一般解决倒计时中的误差的有这样两种办法：

（1）第一种是通过前端定时向服务器发送请求获取最新的时间差，以此来校准倒计时时间。

（2）第二种方法是前端根据偏差时间来自动调整间隔时间的方式来实现的。这一种方式首先是以 setTimeout 递归的方式来实现倒计时，然后通过一个变量来记录已经倒计时的秒数。每一次函数调用的时候，首先将变量加一，然后根据这个变量和每次的间隔时间，我们就可以计算出此时无偏差时应该显示的时间。然后将当前的真实时间与这个时间相减，这样我们就可以得到时间的偏差大小，因此我们在设置下一个定时器的间隔大小的时候，我们就从间隔时间中减去这个偏差大小，以此来实现由于程序执行所造成的时间误差的纠正。

</details>

## 266. Math.ceil 和 Math.floor 有什么区别？ {#question-ed7cbf26-e39b-4de5-82f6-c1a60ff7ee15}

> 难度：0.5 · 类型：QA

### 题目要点

Math.ceil() ： 向上取整，函数返回一个大于或等于给定数字的最小整数。

<details>
<summary>参考答案</summary>

Math.ceil() ： 向上取整，函数返回一个大于或等于给定数字的最小整数。

Math.floor() ： 向下取整，函数返回一个小于或等于给定数字的最大整数。

</details>

## 267. 怎么使用 setTimeout 实现 setInterval？ {#question-1ea15cb6-7aa1-4d94-8bae-f20fa5594c87}

> 难度：3 · 类型：QA

### 题目要点

```javascript
function setIntervalWithSetTimeout(callback, interval) {
  let timeoutId;
  let lastExecutionTime = 0;
  function scheduleNextExecution() {
    timeoutId = setTimeout(() => {
      callback();
      lastExecutionTime = Date.now();
      scheduleNextExecution();
    }, interval - (Date.now() - lastExecutionTime));
  }
  scheduleNextExecution();
  return {
    cancel: function() {
      clearTimeout(timeoutId);
    }
  };
}
// 使用示例
const intervalId = setIntervalWithSetTimeout(() => {
  console.log('每隔500毫秒执行一次');
}, 500);
// 停止定时器
setTimeout(() => {
  intervalId.cancel();
}, 3000);
```

<details>
<summary>参考答案</summary>

setInterval 的作用是每隔一段指定时间执行一个函数，但是这个执行不是真的到了时间立即执行，它真正的作用是每隔一段时间将事件加入事件队列中去，只有当当前的执行栈为空的时候，才能去从事件队列中取出事件执行。所以可能会出现这样的情况，就是当前执行栈执行的时间很长，导致事件队列里边积累多个定时器加入的事件，当执行栈结束的时候，这些事件会依次执行，因此就不能到间隔一段时间执行的效果。

针对 setInterval 的这个缺点，我们可以使用 setTimeout 递归调用来模拟 setInterval，这样我们就确保了只有一个事件结束了，我们才会触发下一个定时器事件，这样解决了 setInterval 的问题。

```js
// 思路是使用递归函数，不断地去执行 setTimeout 从而达到 setInterval 的效果

function mySetInterval(fn, timeout) {
  // 控制器，控制定时器是否继续执行
  var timer = {
    flag: true
  };

  // 设置递归函数，模拟定时器执行。
  function interval() {
    if (timer.flag) {
      fn();
      setTimeout(interval, timeout);
    }
  }

  // 启动定时器
  setTimeout(interval, timeout);

  // 返回控制器
  return timer;
}

```

</details>

## 268. 怎么使用 js 实现拖拽功能？ {#question-6efa769a-3eb9-44ea-bd7c-01c5c991000f}

> 难度：1.5 · 类型：QA

### 题目要点

拖拽的核心原理是通过按下、移动、释放三个阶段的指针事件，基于坐标差值计算元素位移，并通过 transform 更新视觉位置。高频移动需要结合 requestAnimationFrame 进行性能优化，复杂场景涉及边界控制、碰撞检测和状态同步。其本质是连续输入驱动的实时渲染过程，而非浏览器提供的特殊机制。

<details>
<summary>参考答案</summary>

拖拽的本质不是“元素跟着鼠标动”，而是：**通过指针事件驱动位置计算，在连续渲染中不断更新元素的位移**。它是一个典型的“输入 → 计算 → 渲染”循环。

可以从事件流、坐标体系、性能控制三个层面理解。

---

## 一、事件模型：拖拽的基本生命周期

无论是鼠标还是触控，拖拽都遵循三段式流程：

1. 按下（mousedown / pointerdown）
2. 移动（mousemove / pointermove）
3. 释放（mouseup / pointerup）

核心逻辑是：

* 在按下时记录起始坐标
* 在移动时计算偏移量
* 在释放时清理监听

一个最简化的实现思路：

```js
let startX = 0;
let startY = 0;

element.addEventListener("mousedown", (e) => {
  startX = e.clientX;
  startY = e.clientY;

  function onMove(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
});
```

这里有两个关键点：

* move 事件必须绑定在 document 上，避免鼠标移出元素后丢失事件
* 位移是通过差值计算，而不是直接赋值坐标

---

## 二、坐标体系的选择

拖拽涉及多个坐标系：

* clientX / clientY（视口坐标）
* pageX / pageY（包含滚动）
* screenX / screenY（屏幕坐标）
* offsetLeft / offsetTop（相对定位父级）

一般拖拽使用 client 坐标即可。

如果页面存在滚动，需要结合 scrollTop 计算。

---

## 三、为什么通常使用 transform 而不是 left/top

直接修改 left/top 会触发：

* layout（回流）
* paint（重绘）

而 transform 属于：

* 只触发 composite（合成层）

性能更优，尤其在高频 move 事件中。

因此现代拖拽库基本都使用：

```js
transform: translate3d(...)
```

利用 GPU 加速。

---

## 四、性能优化：高频事件处理

mousemove / pointermove 触发频率极高。

如果每次都直接更新 DOM，会导致主线程阻塞。

优化方式包括：

1. 使用 requestAnimationFrame 节流

```js
let ticking = false;

function onMove(e) {
  if (!ticking) {
    requestAnimationFrame(() => {
      updatePosition(e);
      ticking = false;
    });
    ticking = true;
  }
}
```

2. 使用 pointer events 统一处理鼠标与触控

`pointerdown / pointermove / pointerup` 可以避免分别监听 mouse 和 touch。

---

## 五、HTML5 Drag and Drop API

浏览器原生提供了一套拖拽 API：

* dragstart
* dragover
* drop
* dataTransfer

但这套 API 主要用于：

* 文件拖入
* 浏览器内部元素拖拽

缺点：

* 自定义能力弱
* 在移动端支持不好
* 交互可控性有限

因此现代前端工程中，大多数复杂拖拽场景（例如可排序列表、画布编辑器）都采用“自定义拖拽实现”。

---

## 六、复杂拖拽的扩展问题

真实项目中拖拽通常还涉及：

### 1. 边界限制

限制元素只能在容器内移动，需要计算：

* 容器宽高
* 元素宽高
* 最大可移动范围

### 2. 吸附与碰撞检测

例如拖拽排序，需要判断当前位置与其他元素的重叠区域。

通常通过：

* getBoundingClientRect
* 计算中线
* 决定插入位置

### 3. 拖拽与虚拟 DOM 的协调

在 React / Vue 中：

* 频繁 setState 会导致重渲染
* 一般拖拽过程用 ref 直接操作 DOM
* 释放时再同步状态

否则性能会明显下降。

---

## 七、从底层理解拖拽

拖拽本质是：

* 监听连续输入事件
* 通过坐标差计算位移
* 更新视觉表现
* 在释放时完成状态确认

它不是一个特殊能力，而是“连续事件驱动动画”的一种形式。

本质上属于交互式动画的一种实现方式。

</details>

## 269. Js 动画与 CSS 动画区别及相应实现 {#question-af8d6439-598f-4317-8063-93349b83f2d3}

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

## 270. 异步编程有哪些实现方式？ {#question-59d7f771-83c9-4e85-a9a6-f348e6a547c9}

> 难度：3.5 · 类型：QA

### 题目要点

当然，以下是JavaScript异步编程方式的简洁概述：

1. **回调函数（Callbacks）**：
    最早的方式，通过函数作为参数传递来处理异步结果，但容易导致回调地狱。

2. **Promises**：
    解决了回调地狱问题，使用`.then()`、`.catch()`和`.finally()`链式调用处理异步结果。

3. **Async/Await**：
   基于Promises的语法糖，使异步代码看起来更像是同步代码，更加简洁易读。

4. **事件监听（Events）**：
    通过为对象添加事件监听器来处理异步事件，如DOM事件。

5. **Observables（RxJS）**：
   提供了强大的异步数据流处理能力，支持多个值、错误处理、取消等特性。

6. **Web Workers**：
    允许在后台线程中运行JavaScript代码，避免阻塞UI线程，通过消息传递与主线程通信。

<details>
<summary>参考答案</summary>

JavaScript异步编程是JavaScript编程中非常关键的一部分，尤其是在处理网络请求、文件读写、定时任务等场景时。JavaScript提供了多种实现异步编程的方式，以下是其中一些主要的实现方式：

1. **回调函数（Callbacks）**：
   - 最早的异步处理方式之一，通过在函数作为参数传递给另一个函数，并在该异步操作完成时调用该回调函数。
   - 缺点是会导致“回调地狱”（Callback Hell），即代码的可读性和维护性大大降低。

2. **Promises**：
   - 是一种代表异步操作最终完成或失败的对象。
   - 解决了回调地狱的问题，允许使用`.then()`、`.catch()`、`.finally()`等链式调用来处理异步操作的结果。
   - 提供了更清晰的错误处理机制。

3. **Async/Await**：
   - 基于Promises的语法糖，让异步代码看起来更像是同步代码。
   - 使用`async`关键字声明一个异步函数，该函数将返回一个Promise。
   - 在异步函数内部，可以使用`await`关键字等待一个Promise完成，`await`只能在`async`函数内部使用。
   - 使得异步代码更加简洁易读。

4. **Generators**：
   - 是一种特殊的函数，可以暂停执行和恢复执行，非常适合处理异步操作。
   - 需要结合其他库（如co）或`async/await`来使用，因为原生的Generators并不直接支持异步操作。
   - 在ES2017引入`async/await`之后，Generators在处理异步操作方面的使用变得较少。

5. **事件监听（Events）**：
   - 通过为对象添加事件监听器来处理异步事件，如DOM事件、自定义事件等。
   - 这种方式不是专门用于异步编程的，但在某些场景下（如UI交互）非常有用。

6. **Observables**：
   - 是RxJS（Reactive Extensions for JavaScript）库的核心概念，提供了一种处理异步数据流的方法。
   - 类似于Promises，但更加强大和灵活，支持多个值、错误处理、取消等特性。
   - 适用于复杂的异步数据流处理场景。

7. **Web Workers**：
   - 允许JavaScript代码在后台线程中运行，与主线程（通常是UI线程）并行执行。
   - 主要用于执行计算密集型任务，避免阻塞UI线程。
   - 通过消息传递机制与主线程通信。

每种方式都有其适用场景和优缺点，开发者可以根据具体需求选择合适的异步编程方式。在现代JavaScript开发中，`Promises`和`Async/Await`是最常用的异步编程方式。

</details>

## 271. offsetWidth/offsetHeight,clientWidth/clientHeight 与 scrollWidth/scrollHeight 的区别？ {#question-00cd5cd3-49a5-4057-937b-4190d66c8198}

> 难度：1 · 类型：QA

### 题目要点

offsetWidth/offsetHeight：包含元素的边框、内边距和滚动条（如果有）的总宽度/高度，但不包括外边距。

clientWidth/clientHeight：元素内部可视区域的宽度/高度，包含内边距，但不包括边框、外边距和滚动条。

scrollWidth/scrollHeight：元素内容的实际宽度/高度，包括因overflow而溢出的部分。如果内容未溢出，则与clientWidth/clientHeight相同。

<details>
<summary>参考答案</summary>

`offsetWidth`、`offsetHeight`、`clientWidth`、`clientHeight`与`scrollWidth`、`scrollHeight`是JavaScript中用于获取元素尺寸的几个重要属性，它们各自有不同的应用场景和返回值。以下是它们之间的区别：

### 1. offsetWidth/offsetHeight

- **定义**：这两个属性分别表示元素的布局宽度和高度，包括元素的边框（border）、内边距（padding）和垂直/水平滚动条（如果存在的话）。但不包括外边距（margin）。
- **用途**：常用于计算元素在页面中占用的总空间大小。
- **示例**：如果一个元素的CSS样式为`width: 100px; padding: 10px; border: 5px solid black;`，且存在垂直滚动条（假设滚动条宽度为15px），则`offsetWidth`将返回`130px`（100px + 2*10px + 2*5px - 不包括margin，但包括滚动条宽度）。

### 2. clientWidth/clientHeight

- **定义**：这两个属性分别表示元素内部的可视区域宽度和高度，即元素内容加上内边距（padding），但不包括边框（border）、外边距（margin）和滚动条（scrollbar）的尺寸。
- **用途**：常用于获取元素内容区域的大小。
- **示例**：对于相同的元素样式（如上所述），`clientWidth`将返回`120px`（100px + 2*10px - 不包括border和scrollbar）。

### 3. scrollWidth/scrollHeight

- **定义**：这两个属性分别表示元素内容的实际宽度和高度，包括由于`overflow`属性导致溢出而不可见的部分。如果元素内容没有溢出，则它们的值分别与`clientWidth`和`clientHeight`相等。
- **用途**：常用于判断元素内容是否溢出，以及获取元素内容的完整尺寸。
- **示例**：如果元素的内容宽度为`150px`，但元素的可视区域宽度（`clientWidth`）只有`120px`，则`scrollWidth`将返回`150px`。

### 总结表格

| 属性           | 描述                                                                           | 包括的部分                           | 不包括的部分                       |
|----------------|--------------------------------------------------------------------------------|------------------------------------|----------------------------------|
| offsetWidth    | 元素的布局宽度，包括边框、内边距和滚动条（如果存在）                             | 边框、内边距、滚动条（如果存在）       | 外边距、溢出内容（不占用额外空间） |
| offsetHeight   | 元素的布局高度，包括边框、内边距和滚动条（如果存在）                             | 边框、内边距、滚动条（如果存在）       | 外边距、溢出内容（不占用额外空间） |
| clientWidth    | 元素内部可视区域的宽度，包括内边距，但不包括边框、外边距和滚动条                 | 内边距                               | 边框、外边距、滚动条、溢出内容     |
| clientHeight   | 元素内部可视区域的高度，包括内边距，但不包括边框、外边距和滚动条                 | 内边距                               | 边框、外边距、滚动条、溢出内容     |
| scrollWidth    | 元素内容的实际宽度，包括溢出的部分                                             | 内容宽度（包括溢出部分）             | 边框、外边距、滚动条（不占用额外空间）|
| scrollHeight   | 元素内容的实际高度，包括溢出的部分                                             | 内容高度（包括溢出部分）             | 边框、外边距、滚动条（不占用额外空间）|

</details>

## 272. toPrecision 和 toFixed 和 Math.round 有什么区别？ {#question-dc584829-5c57-435d-9276-f971e479bd29}

> 难度：1 · 类型：QA

### 题目要点

toPrecision 用于处理精度，精度是从左至右第一个不为 0 的数开始数起。

<details>
<summary>参考答案</summary>

* toPrecision 用于处理精度，精度是从左至右第一个不为 0 的数开始数起。
* toFixed 是对小数点后指定位数取整，从小数点开始数起。
* Math.round 是将一个数字四舍五入到一个整数。

</details>

## 273. 什么是 Polyfill ？ {#question-a8cc1054-2087-4adb-992c-33b88a188ddf}

> 难度：1 · 类型：QA

### 题目要点

Polyfill 指的是用于实现浏览器并不支持的原生 API 的代码。

<details>
<summary>参考答案</summary>

Polyfill 指的是用于实现浏览器并不支持的原生 API 的代码。

比如说 `querySelectorAll` 是很多现代浏览器都支持的原生 Web API，但是有些古老的浏览器并不支持，那么假设有人写了一段代码来实现这个功能使这些浏览器也支持了这个功能，那么这就可以成为一个 Polyfill。

</details>

## 274. 怎么检测浏览器版本？ {#question-7ff627a9-0948-4352-9b70-69aad59fe2ec}

> 难度：2 · 类型：QA

### 题目要点

检测浏览器版本一共有两种方式：

<details>
<summary>参考答案</summary>

检测浏览器版本一共有两种方式：

一种是检测 `window.navigator.userAgent` 的值，但这种方式很不可靠，因为 `userAgent` 可以被改写，并且早期的浏览器如 ie，会通过伪装自己的 userAgent 的值为 Mozilla 来躲过服务器的检测。

第二种方式是功能检测，根据每个浏览器独有的特性来进行判断，如 ie 下独有的 `ActiveXObject`。

</details>

## 275. 什么是“前端路由”？什么时候适合使用“前端路由”？“前端路由”有哪些优点和缺点？ {#question-6b910440-48ae-49f9-8659-8aa880d239fb}

> 难度：3 · 类型：QA

### 题目要点

### “前端路由”是什么？

前端路由是在前端通过JavaScript实现的路由机制，允许在不刷新页面的情况下根据URL变化更新页面内容，常用于单页面应用（SPA）。

### 何时适合使用“前端路由”？

- 单页面应用（SPA）
- 需要快速响应和流畅体验的应用
- 希望通过SEO优化但仍保持SPA优势的应用（需配合SSR等技术）

### 优点

- 用户体验好，快速响应页面切换
- 初次加载后，页面切换无需重新加载，速度快
- 支持SPA架构，适合复杂应用

### 缺点

- 初次加载整个应用代码，可能较慢
- 对SEO不友好（可通过SSR等技术改善）
- 增加开发复杂度和代码量
- URL设计需合理，否则影响可维护性

<details>
<summary>参考答案</summary>

### “前端路由”是什么？

前端路由是指通过JavaScript在前端实现的一种路由机制，它允许在不重新加载整个页面的情况下，根据URL的变化来更新页面内容。这种机制主要通过监听URL的变化（如hash的变化或HTML5的History API），并在前端动态地加载和渲染相应的页面组件或内容来实现。前端路由通常用于单页面应用（SPA）中，以提供流畅的用户体验和快速的页面切换。

### 什么时候适合使用“前端路由”？

前端路由适合在以下场景中使用：

1. **单页面应用（SPA）**：SPA通常只有一个HTML页面，通过前端路由可以在不刷新页面的情况下实现页面的切换和导航，从而提升用户体验。
2. **需要快速响应和流畅体验的应用**：前端路由可以减少页面加载时间和网络请求次数，使得页面切换更加快速和流畅。
3. **需要良好SEO的应用**：虽然SPA在SEO方面存在一些挑战，但通过合理的前端路由配置和服务器端渲染（SSR）等技术，可以部分解决SPA在SEO方面的问题，提高应用在搜索引擎中的可见性。

### “前端路由”的优点

1. **用户体验好**：前端路由可以实现无需刷新整个页面就能完成页面切换，提高了用户的操作效率和体验。
2. **更快的响应速度**：由于不需要重新加载整个页面，前端路由可以快速响应用户的操作，只需要更新页面中部分的内容。
3. **更高的扩展性**：前端路由能够为网站提供更高的扩展性，使得更多的动态操作成为可能。
4. **实现灵活**：通过前端路由，设计师和开发者能够自由设计网站的布局和功能，更好地控制页面的跳转和加载。
5. **支持单页面应用（SPA）**：前端路由是SPA的核心技术之一，它使得SPA能够在不刷新页面的情况下实现页面的切换和导航。

### “前端路由”的缺点

1. **初次加载慢**：前端路由在初次加载时，需要先将整个应用的代码都加载完成后，才能完成路由的跳转，因此在第一次访问的时候，响应速度较慢。
2. **SEO不友好**：由于前端路由是在前端JavaScript中实现的，而搜索引擎通常只会解析HTML，因此对SEO不友好。不过，通过合理的前端路由配置和服务器端渲染（SSR）等技术，可以部分解决这一问题。
3. **增加复杂度**：前端路由需要开发人员额外的编码工作，增加了代码复杂度。在处理复杂页面的时候，往往需要更多的代码量和时间成本。
4. **可维护性差**：由于前端路由将应用的状态放在了URL中，因此一旦URL变更或者URL设计不合理，会导致代码难以维护的困难。

综上所述，前端路由在提升用户体验、加快响应速度、提高扩展性和实现灵活性等方面具有显著优势，但同时也存在初次加载慢、SEO不友好、增加复杂度和可维护性差等缺点。在开发过程中，需要根据实际需求和应用场景来权衡利弊，合理选择是否使用前端路由。

</details>

## 276. 什么是点击穿透，怎么解决？ {#question-eb451be3-dc88-481c-b8a8-da6c8d278e95}

> 难度：3 · 类型：QA

### 题目要点

在发生触摸动作约300ms之后，移动端会模拟产生click动作，它底下的具有点击特性的元素也会被触发，这种现象称为点击穿透。

<details>
<summary>参考答案</summary>

在发生触摸动作约300ms之后，移动端会模拟产生click动作，它底下的具有点击特性的元素也会被触发，这种现象称为点击穿透。

**常见场景**

1. 情景一：蒙层点击穿透问题，点击蒙层（mask）上的关闭按钮，蒙层消失后发现触发了按钮下面元素的click事件。
2. 情景二：跨页面点击穿透问题：如果按钮下面恰好是一个有href属性的a标签，那么页面就会发生跳转。
3. 情景三：另一种跨页面点击穿透问题：这次没有mask了，直接点击页内按钮跳转至新页，然后发现新页面中对应位置元素的click事件被触发了。
4. 情景四：不过概率很低，就是新页面中对应位置元素恰好是a标签，然后就发生连续跳转了。

**发生的条件**
* 上层元素监听了触摸事件，触摸之后该层元素消失
* 下层元素具有点击特性（监听了click事件或默认的特性（a标签、input、button标签））

**解决点击穿透的方法**
1. 方法一：书写规范问题，不要混用touch和click。既然touch之后300ms会触发click，只用touch或者只用click就自然不会存在问题了。
2. 方法二：吃掉（或者说是消费掉）touch之后的click，依旧用tap，只是在可能发生点击穿透的情形做额外的处理，拿个东西来挡住、或者tap后延迟350毫秒再隐藏mask、pointer-events、在下面元素的事件处理器里做检测（配合全局flag）等。

</details>

## 277. 移动端的点击事件的有延迟，时间是多久，为什么会有？ 怎么解决这个延时？ {#question-b43082e8-2312-4594-ac1c-4f0d2d5da81c}

> 难度：2 · 类型：QA

### 题目要点

移动端点击有 300ms 的延迟是因为移动端会有双击缩放的这个操作，因此浏览器在 click 之后要等待 300ms，看用户有没有下一次点击，来判断这次操作是不是双击。

<details>
<summary>参考答案</summary>

移动端点击有 300ms 的延迟是因为移动端会有双击缩放的这个操作，因此浏览器在 click 之后要等待 300ms，看用户有没有下一次点击，来判断这次操作是不是双击。

有三种办法来解决这个问题：

* 通过 meta 标签禁用网页的缩放。
* 通过 meta 标签将网页的 viewport 设置为 ideal viewport。
* 调用一些 js 库，比如 FastClick

click 延时问题还可能引起点击穿透的问题，就是如果我们在一个元素上注册了 touchStart 的监听事件，这个事件会将这个元素隐藏掉，我们发现当这个元素隐藏后，触发了这个元素下的一个元素的点击事件，这就是点击穿透。

</details>

## 278. 如何判断当前脚本运行在浏览器还是 node 环境中？ {#question-a09650c2-d9af-4f1a-ad05-8b33757cbca7}

> 难度：1.5 · 类型：QA

### 题目要点

通过判断 Global 对象是否为 window，如果不为 window，当前脚本没有运行在浏览器中。

<details>
<summary>参考答案</summary>

```js
this === window ? 'browser' : 'node';
```

通过判断 Global 对象是否为 window，如果不为 window，当前脚本没有运行在浏览器中。

</details>

## 279. setTimeout 为什么不能保证能够及时执行？ {#question-87af03ec-e30e-40fb-b193-b203d070c112}

> 难度：1 · 类型：QA

### 题目要点

![image.png](https://static.ecool.fun//article/e0655cd1-91f2-4cdf-9460-0094bdf47830.png)

<details>
<summary>参考答案</summary>

![image.png](https://static.ecool.fun//article/e0655cd1-91f2-4cdf-9460-0094bdf47830.png)

> 主线程从任务队列中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为Event Loop。

setTimeout 并不能保证执行的时间，是否及时执行取决于 JavaScript 线程是拥挤还是空闲。

浏览器的JS引擎遇到setTimeout，拿走之后不会立即放入异步队列，同步任务执行之后，timer模块会到设置时间之后放到异步队列中。js引擎发现同步队列中没有要执行的东西了，即运行栈空了就从异步队列中读取，然后放到运行栈中执行。所以setTimeout可能会多了等待线程的时间。

这时setTimeout函数体就变成了运行栈中的执行任务，运行栈空了，再监听异步队列中有没有要执行的任务，如果有就继续执行，如此循环，就叫Event Loop。

</details>

## 280. 介绍一下 setTimeout 的运行机制 {#question-cdeec2cc-5772-4c63-b7f0-34f864ea886d}

> 难度：3 · 类型：QA

### 题目要点

### setTimeout运行机制

setTimeout 和 setInterval的运行机制，其实就是将指定的代码移出本次执行，等到下一轮 Event Loop 时，再检查是否到了指定时间。如果到了，就执行对应的代码；如果不到，就等到再下一轮 Event Loop 时重新判断。

这意味着，setTimeout指定的代码，必须等到本次执行的所有同步代码都执行完，才会执行。

<details>
<summary>参考答案</summary>

## setTimeout简介

setTimeout()函数：用来指定某个函数或某段代码在多少毫秒之后执行。它返回一个整数，表示定时器timer的编号，可以用来取消该定时器。

先看个简单的例子：

```js
console.log(1);
setTimeout(function () {
    console.log(2);
}, 0);
console.log(3);
```

问：最后的打印顺序是什么？（如果不了解js的运行机制就会答错）

正确答案：`1 3 2`

解析：无论setTimeout的执行时间是0还是1000，结果都是先输出3后输出2，这就是面试官常常考查的js运行机制的问题，接下来我们要引入一个概念，JavaScript 是单线程的。

## JavaScript 单线程

JavasScript引擎是基于事件驱动和单线程执行的，JS引擎一直等待着任务队列中任务的到来，然后加以处理，浏览器无论什么时候都只有一个JS线程在运行程序，即主线程。那么单线程的JavasScript是怎么实现“非阻塞执行”呢？是通过**任务队列**。

所有任务可以分成两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）。

单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等着。但是如果有些任务很慢时（比如Ajax操作从网络读取数据），我还是要等结果在执行后一个任务吗？于是，有了一种异步任务。

同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；而异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有主线程执行完毕，主线程去通知"任务队列"，某个异步任务可以执行了，该任务才会进入主线程执行。

所以js的运行机制如下：

* 1) 所有同步任务都在主线程上执行，形成一个执行栈（Call Stack）
* 2) 主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件
* 3) 一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
* 4) 主线程不断重复上面的第三步。

## setTimeout运行机制

setTimeout 和 setInterval的运行机制，其实就是将指定的代码移出本次执行，等到下一轮 Event Loop 时，再检查是否到了指定时间。如果到了，就执行对应的代码；如果不到，就等到再下一轮 Event Loop 时重新判断。

这意味着，setTimeout指定的代码，必须等到本次执行的所有同步代码都执行完，才会执行。

</details>

## 281. ['10', '10', '10', '10', '10'].map(parseInt) {#question-01149afa-e389-4a9f-a534-204db829188b}

> 难度：2 · 类型：QA

### 题目要点

在 JavaScript 中，`map` 方法用于创建一个新数组，其结果是原始数组中每个元素经过回调函数处理后的值。

对于表达式 `['10', '10', '10', '10', '10'].map(parseInt)`，`parseInt` 函数被用来解析每个元素为整数。然而，这里的使用方式有些特殊，因为 `parseInt` 函数通常需要两个参数：要解析的字符串和基数（可选）。

当你使用 `map` 时，`parseInt` 只会接收到 `map` 回调函数的第一个参数，即当前元素的值。第二个参数（索引）不会被传递给 `parseInt`。

因此，这个表达式的行为如下：

1. `'10'` 被 `parseInt` 解析为 `10`。
2. 由于 `parseInt` 的第二个参数未提供，它默认为 `10`，这意味着 `parseInt` 会解析字符串并从索引位置开始解析，直到字符串的末尾。

最终，这个表达式的结果将是 `[10, NaN, NaN, NaN, NaN]`。这是因为第一个元素 `'10'` 被正确解析为 `10`，但后续元素由于索引值（从 1 开始）导致 `parseInt` 无法正确解析，结果为 `NaN`（Not a Number）。

<details>
<summary>参考答案</summary>

## parseInt

`parseInt()` 函数解析一个字符串参数，并返回一个指定基数的整数 (数学系统的基础)。

> const intValue = parseInt(string[, radix]);

* `string` 要被解析的值。如果参数不是一个字符串，则将其转换为字符串(使用 ToString 抽象操作)。字符串开头的空白符将会被忽略。

* `radix` 一个介于2和36之间的整数(数学系统的基础)，表示上述字符串的基数。默认为10。

* `返回值` 返回一个整数或NaN

## map

`map()` 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。

```js
var new_array = arr.map(function callback(currentValue[,index[, array]]) {
 // Return element for new_array
 }[, thisArg])
```

可以看到callback回调函数需要三个参数, 我们通常只使用第一个参数 (其他两个参数是可选的)。

* currentValue 是callback 数组中正在处理的当前元素。
* index可选, 是callback 数组中正在处理的当前元素的索引。
* array可选, 是callback map 方法被调用的数组。
* 另外还有thisArg可选, 执行 callback 函数时使用的this 值

```js
const arr = [1, 2, 3];
arr.map((num) => num + 1); // [2, 3, 4]
```

## 题目分析

回到真实的事例上：
```js
['1', '2', '3'].map(parseInt)
```

对于每个迭代map, parseInt()传递两个参数: 字符串和基数。

所以实际执行的的代码是：

```js
['1', '2', '3'].map((item, index) => {
    return parseInt(item, index)
})
```

即返回的值分别为：

```js
parseInt('1', 0) // 1
parseInt('2', 1) // NaN
parseInt('3', 2) // NaN, 3 不是二进制
```

所以：

```js
['1', '2', '3'].map(parseInt)
// 1, NaN, NaN
```

再回到我们的题目，很明显答案应该是：

```js
['10','10','10','10','10'].map(parseInt);
// [10, NaN, 2, 3, 4]
```

</details>

## 282. JavaScript中的错误有哪几种类型？ {#question-fff79f62-47be-438a-83bf-6f81bcc0dfe9}

> 难度：2 · 类型：QA

### 题目要点

### Error

- **描述**：`Error` 是所有其他错误类型的基类。当开发者需要自定义错误时，通常会创建一个继承自 `Error` 的类。

### EvalError

- **描述**：当 `eval()` 函数被不当使用时（例如尝试调用 `new eval()` 或将 `eval` 重新赋值给其他变量）会抛出此错误。

### RangeError

- **描述**：当数值超出JavaScript允许的范围时抛出，例如尝试创建一个长度超过 `Array.MAX_LENGTH` 的数组，或者尝试将字符串转换为一个超出其数值范围的整数。

### ReferenceError

- **描述**：当尝试访问一个未声明或未定义的变量时抛出。例如，在变量声明之前就尝试使用它。

### SyntaxError

- **描述**：当JavaScript解析器遇到无效的语法时抛出。这通常发生在解析代码时，如果代码不符合JavaScript语法规则，则抛出此错误。

### TypeError

- **描述**：当尝试执行操作，但操作数或运算对象不是预期的类型时抛出。例如，尝试对一个非字符串对象调用 `.toUpperCase()`。

### URIError

- **描述**：当尝试使用 `encodeURI()` 或 `decodeURI()` 对不合法的URI字符串进行编码或解码时抛出。
这些错误类型为开发者提供了详细的错误信息，帮助他们定位和修复代码中的问题。正确地处理错误是编写健壮和可靠JavaScript代码的关键部分。

<details>
<summary>参考答案</summary>

## JavaScript中的错误类型

* Error
* EvalError
* RangeError
* ReferenceError
* SyntaxError
* TypeError
* URIError

### Error

`Error`是最基本的错误类型，其他的错误类型都继承自该类型。因此，所有错误的类型共享了一组相同的属性。 这个类型的错误很少见。一般使用开发人员自定义抛出的错误。

### EvalError

这个错误会在使用`eval()`函数发生异常时候抛出。两种情况会出错：

```js
new eval();
eval = foo;
```

上面两个的意思结合就是没有直接调用`eval`函数，而是`new`或者是重新赋值
这个错误基本上不会遇到，因为`eval`函数本来用的就不多。不过需要注意的是，`eval`是一个关键字。

### RangeError

这个错误会在数值超出相应范围时触发。比如使用`new Array()`的时候传递一个负数或者是超过数组最大长度（4,294,967,295）的数，比如Number.MAX_VALUE，Number.MIN_VALUE。注意递归爆炸也有这个错误。

### ReferenceError

这个错误一般就是出现在变量找不到的情况，比如：
```js
var a = b;
Uncaught ReferenceError: b is not defined
```

这时候就需要检查一下一个变量了

### SyntaxError

当Javascript语言解析代码时,Javascript引擎发现了不符合语法规范的tokens或token顺序时抛出SyntaxError。

### TypeError

这个错误在JavaScript中是经常遇到的，不管是初学者还是老手。在变量中保存着以外的类型时，或者在访问不存在的方法时。都会导致这种错误。但是归根结底还是由于在执行特定于类型的操作时，变量的类型并不符合要求所致。比如：
```
var o = new 10;
a.style.widht = "10px";
```

关于设置样式这个东西，新手会遇到很多，一般这都是由获取不到元素导致的。

### URIError

在使用encodeURI或者decodeURI因为URL格式不正确时，就会导致URIError错误。这种错误也很少见。

</details>

## 283. Promise.all 和 Promise.allSettled 有什么区别？ {#question-4d19c9e2-7a80-40fd-83ee-ae6d9b531a0a}

> 难度：3 · 类型：QA

### 题目要点

### Promise.all

- **作用**：当所有给定的Promise都被解决时，`Promise.all` 返回一个包含所有解决值的数组。如果任何一个Promise被拒绝，则返回的Promise将被拒绝，并传递给拒绝原因。
- **示例**：

  ```javascript
  Promise.all([promise1, promise2, promise3]).then(values => {
    // values 是解决值数组
  }).catch(reason => {
    // reason 是第一个被拒绝的Promise的原因
  });
  ```

### Promise.allSettled

- **作用**：当所有给定的Promise都被解决或拒绝时，`Promise.allSettled` 返回一个包含每个Promise结果的数组。每个结果都是一个对象，其中包含 `status`（解决或拒绝的状态）和 `value`（如果解决，则是解决值；如果拒绝，则是拒绝原因）。
- **示例**：

  ```javascript
  Promise.allSettled([promise1, promise2, promise3]).then(results => {
    // results 是一个包含每个Promise结果的对象数组
  }).catch(reason => {
    // 不会被调用，因为所有Promise都已经被解决或拒绝
  });
  ```

### 区别

1. **结果类型**：`Promise.all` 返回一个数组，其中包含所有Promise的解决值。`Promise.allSettled` 返回一个数组，其中包含每个Promise的结果对象。
2. **处理拒绝**：`Promise.all` 会在任何Promise被拒绝时立即拒绝，而`Promise.allSettled` 会等待所有Promise都解决或拒绝后才返回结果。
3. **适用场景**：`Promise.all` 适用于你关心所有Promise是否解决的情况。`Promise.allSettled` 适用于你只关心所有Promise是否都解决或拒绝，而不关心解决值或拒绝原因的情况。

<details>
<summary>参考答案</summary>

一句话概括`Promise.allSettled`和`Promise.all`的最大不同：`Promise.allSettled`永远不会被**reject**。

## Promise.all的痛点

当需要处理多个Promise并行时，大多数情况下Promise.all用起来是非常顺手的，比如下面这样

```js
const delay = n => new Promise(resolve => setTimeout(resolve, n));

const promises = [
  delay(100).then(() => 1),
  delay(200).then(() => 2),
  ]

Promise.all(promises).then(values=>console.log(values))
// 最终输出： [1, 2]
```

可是，是一旦有一个promise出现了异常，被reject了，情况就会变的麻烦。

```js
const promises = [
  delay(100).then(() => 1),
  delay(200).then(() => 2),
  Promise.reject(3)
  ]

Promise.all(promises).then(values=>console.log(values))
// 最终输出： Uncaught (in promise) 3

Promise.all(promises)
.then(values=>console.log(values))
.catch(err=>console.log(err))
// 加入catch语句后，最终输出：3
```

尽管能用catch捕获其中的异常，但你会发现其他执行成功的Promise的消息都丢失了，仿佛石沉大海一般。

要么全部成功，要么全部重来，这是Promise.all本身的强硬逻辑，也是痛点的来源，不能说它错，但这的确给Promise.allSettled留下了立足的空间。

## Promise.allSettled

假如使用Promise.allSettled来处理这段逻辑会怎样呢?

```js
const promises = [
  delay(100).then(() => 1),
  delay(200).then(() => 2),
  Promise.reject(3)
  ]

Promise.allSettled(promises).then(values=>console.log(values))
// 最终输出：
//    [
//      {status: "fulfilled", value: 1},
//      {status: "fulfilled", value: 2},
//      {status: "rejected", value: 3},
//    ]
```

可以看到所有promise的数据都被包含在then语句中，且每个promise的返回值多了一个status字段，表示当前promise的状态，没有任何一个promise的信息被丢失。

因此，当用Promise.allSettled时，我们只需专注在then语句里，当有promise被异常打断时，我们依然能妥善处理那些已经成功了的promise，不必全部重来。

</details>

## 284. JS中怎么阻止事件冒泡和默认事件？ {#question-1b65452c-ab0b-41a8-8621-fc25704afa33}

> 难度：1 · 类型：QA

### 题目要点

这是阻止事件的冒泡方法，不让事件向 document 上蔓延，但是默认事件任然会执行，当你掉用这个方法的时候，如果点击一个连接，这个连接仍然会被打开，

<details>
<summary>参考答案</summary>

## event.stopPropagation()方法

这是阻止事件的冒泡方法，不让事件向 document 上蔓延，但是默认事件任然会执行，当你掉用这个方法的时候，如果点击一个连接，这个连接仍然会被打开，

## event.preventDefault()方法

这是阻止默认事件的方法，比如在a标签的绑定事件上调用此方法，链接则不会被打开，但是会发生冒泡，冒泡会传递到上一层的父元素；

## return false

这个方法比较暴力，他会同事阻止事件冒泡也会阻止默认事件；写上此代码，连接不会被打开，事件也不会传递到上一层的父元素；可以理解为return false就等于同时调用了event.stopPropagation()和event.preventDefault()

</details>

## 285. 什么是“事件代理” {#question-f24683ac-0366-41a2-a763-f90f447a78ee}

> 难度：1 · 类型：QA

### 题目要点

事件代理（Event Delegation）是一种在JavaScript中绑定事件的技巧，它允许开发者将事件监听器绑定到父元素上，而不是直接绑定到子元素上。事件代理的原理基于DOM事件流中的事件冒泡阶段。

事件流分为三个阶段：

1. **捕获阶段**：事件从窗口开始向下传播，直到目标元素。
2. **目标阶段**：事件在目标元素上触发。
3. **冒泡阶段**：事件从目标元素向上传播，直到窗口。

事件代理利用冒泡阶段来监听事件。将事件监听器绑定到父元素上，当子元素触发事件时，事件会冒泡到父元素，然后父元素上的事件监听器会处理事件。

事件代理的优点包括：

1. **减少内存占用和事件注册**：只需要给父元素绑定一个事件监听器，而不是为每个子元素都绑定一个。
2. **动态绑定事件**：当子元素动态添加或移除时，不需要重新绑定事件监听器。

注意事项：

- **事件委托的深度**：事件委托应谨慎使用，尤其是在DOM结构复杂或嵌套很深的情况下。因为事件冒泡会经过多个祖先元素，这可能会导致性能问题。
- **事件委托的适用性**：并不是所有事件都适合使用事件代理。对于那些不需要冒泡或需要立即处理的事件，直接绑定到目标元素上可能更高效。

<details>
<summary>参考答案</summary>

事件代理（Event Delegation）也称之为事件委托。是JavaScript中常用绑定事件的常用技巧。

顾名思义，“事件代理”即是把原本需要绑定在子元素的响应事件委托给父元素，让父元素担当事件监听的职务。

事件代理的原理是DOM元素的**事件冒泡**。

一个事件触发后，会在子元素和父元素之间传播（propagation）。这种传播分成三个阶段。

* 捕获阶段：从window对象传导到目标节点（上层传到底层）称为“捕获阶段”（capture phase），捕获阶段不会响应任何事件；
* 目标阶段：在目标节点上触发，称为“目标阶段”
* 冒泡阶段：从目标节点传导回window对象（从底层传回上层），称为“冒泡阶段”（bubbling phase）。事件代理即是利用事件冒泡的机制把里层所需要响应的事件绑定到外层。

## 事件委托的优点：

* 可以大量节省内存占用，减少事件注册。

比如在ul上代理所有li的click事件就非常棒

```html
<ul id="list">
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
  ......
  <li>item n</li>
</ul>
```

如上面代码所示，如果给每个li列表项都绑定一个函数，那对内存的消耗是非常大的，因此较好的解决办法就是将li元素的点击事件绑定到它的父元素ul身上，执行事件的时候再去匹配判断目标元素。

* 可以实现当新增子对象时无需再次对其绑定（动态绑定事件）

假设上述的例子中列表项li就几个，我们给每个列表项都绑定了事件；

在很多时候，我们需要通过 AJAX 或者用户操作动态的增加或者删除列表项li元素，那么在每一次改变的时候都需要重新给新增的元素绑定事件，给即将删去的元素解绑事件；

如果用了事件委托就没有这种麻烦了，因为事件是绑定在父层的，和目标元素的增减是没有关系的，执行到目标元素是在真正响应执行事件函数的过程中去匹配的；所以使用事件在动态绑定事件的情况下是可以减少很多重复工作的。

使用事件委托注意事项：使用“事件委托”时，并不是说把事件委托给的元素越靠近顶层就越好。事件冒泡的过程也需要耗时，越靠近顶层，事件的”事件传播链”越长，也就越耗时。如果DOM嵌套结构很深，事件冒泡通过大量祖先元素会导致性能损失。

</details>

## 286. 谈谈你对事件冒泡和捕获的理解 {#question-d8fe4e1f-93ef-440b-a06b-81d22897afa2}

> 难度：1 · 类型：QA

### 题目要点

### 事件冒泡（Event Bubbling）

- 事件从触发它的目标元素开始，然后逐级向上传播到DOM树中的父元素，直到最顶层（如`document`对象）。
- 在这个过程中，沿途的每个节点都可以处理这个事件。
- 如果没有节点调用`event.stopPropagation()`，事件会一直冒泡到顶层。

### 事件捕获（Event Capturing）

- 与冒泡相反，事件从DOM树的顶层（如`document`对象）开始，然后逐级向下传播到目标元素。
- 捕获阶段发生在冒泡之前，允许在事件到达目标元素之前进行拦截和处理。
- 默认情况下，事件监听器在冒泡阶段执行，但可以通过设置监听器的第三个参数为`true`来启用捕获阶段。

- 使用冒泡：当你希望在一个父元素上监听多个子元素的事件时。
- 使用捕获：当你需要在事件到达目标元素之前进行拦截或处理时。

<details>
<summary>参考答案</summary>

事件冒泡（Event Bubbling）和事件捕获（Event Capturing）是两种在DOM（Document Object Model）中处理事件传播机制的方式。它们定义了当一个事件（如点击、鼠标移入等）发生在某个元素上时，这个事件如何传播到DOM树的其他部分。理解这两种机制对于编写高效且可维护的Web应用程序至关重要。

### 事件冒泡（Event Bubbling）

事件冒泡是事件传播的一种方式，它指的是事件从目标元素开始，然后向上传播到DOM树中更高的层次，直到达到最顶层的元素（通常是`document`对象）。在冒泡过程中，事件会经过目标元素的父元素、祖父元素等，沿途的每个节点都有机会处理该事件。如果在某个节点上事件被处理并调用了`event.stopPropagation()`方法，则事件会停止继续冒泡。

**优点**：
- 简化了事件处理，因为你可以在一个父元素上设置事件监听器来管理多个子元素的事件。
- 易于理解和实现。

**缺点**：
- 如果DOM结构复杂，可能会不小心捕获到不应该处理的事件。
- 可能会导致事件处理函数在多个地方被调用，特别是在复杂的DOM结构中。

### 事件捕获（Event Capturing）

与事件冒泡相反，事件捕获是指事件从最顶层的元素（通常是`document`对象）开始，然后向下传播到目标元素。在捕获过程中，事件会经过目标元素的每个父元素，直到达到目标元素本身。在捕获阶段，每个节点同样有机会处理该事件。

**优点**：
- 在事件到达目标元素之前，可以在更高层次的元素上拦截和处理事件。
- 在某些情况下，它可以提供比事件冒泡更精细的控制。

**缺点**：
- 与冒泡相比，捕获阶段的使用较少，因为大多数Web开发人员更熟悉冒泡机制。
- 如果不正确地使用，可能会导致事件处理代码难以理解和维护。

### 如何选择使用冒泡还是捕获

- 默认情况下，大多数浏览器都会先执行捕获阶段，然后是冒泡阶段，但除非你明确指定了使用捕获（通过设置事件监听器的第三个参数为`true`），否则事件监听器默认是在冒泡阶段执行的。
- 捕获阶段通常用于需要在事件到达目标元素之前进行拦截的场景，比如阻止默认行为或阻止事件进一步传播。
- 冒泡阶段则更常用于在事件发生后执行操作，特别是当你想要在一个父元素上监听多个子元素的事件时。

总的来说，事件冒泡和捕获是Web开发中处理DOM事件的重要机制。理解它们的工作原理可以帮助你更好地控制事件的传播，并编写出更高效、更可维护的Web应用程序。

</details>

## 287. js中如何判断一个值是否是数组类型？ {#question-f53e39b7-9de1-4a49-b95d-6c73591d5512}

> 难度：1 · 类型：QA

### 题目要点

使用Object的原型方法isPrototypeOf，判断两个对象的原型是否一样, isPrototypeOf() 方法用于测试一个对象是否存在于另一个对象的原型链上。

<details>
<summary>参考答案</summary>

## instanceof

```js
const arr= [];
arr instanceof Array; // true
```

## Array.isArray

```js
const arr = []
Array.isArray(arr) // true

const obj = {}
Array.isArray(obj) // false
```

## Object.prototype.isPrototypeOf

使用Object的原型方法isPrototypeOf，判断两个对象的原型是否一样, isPrototypeOf() 方法用于测试一个对象是否存在于另一个对象的原型链上。

```js
const arr = [];
Object.prototype.isPrototypeOf(arr, Array.prototype); // true
```

## Object.getPrototypeOf

Object.getPrototypeOf() 方法返回指定对象的原型（内部[[Prototype]]属性的值）。

```js
const arr = []
Object.getPrototypeOf(arr) === Array.prototype // true
```

## Object.prototype.toString

借用Object原型的call或者apply方法，调用toString()是否为[object Array]

```js
const arr = []
Object.prototype.toString.call(arr) === '[object Array]' // true

const obj = {}
Object.prototype.toString.call(obj) // "[object Object]"
```

</details>

## 288. 浏览器为什么要有跨域限制？ {#question-b4001078-1e40-481b-8fcd-c4d48e6dd855}

> 难度：1 · 类型：QA

### 题目要点

浏览器之所以要有跨域限制，主要是出于安全性的考虑。这种限制正式的名称是“同源策略”（Same-Origin Policy），它是浏览器最核心也最基本的安全功能之一。以下是关于浏览器跨域限制的几个关键原因：

### 1. 防止数据泄露

* **Cookie和Session的保护**：同源策略限制了一个域的JavaScript脚本访问另一个域的Cookie和Session信息。这避免了恶意网站通过跨站脚本（XSS）等方式窃取用户的登录状态或敏感信息。
* **LocalStorage和IndexedDB的保护**：浏览器还限制了对LocalStorage和IndexedDB等存储器的跨域访问，进一步保护了用户数据的安全。

### 2. 防止跨站请求伪造（CSRF）

* CSRF攻击是一种利用用户已认证身份发起恶意请求的攻击方式。如果浏览器没有跨域限制，恶意网站可以伪造请求发送到受信任的网站，执行未经授权的操作。
* 同源策略通过限制跨域请求，降低了CSRF攻击的风险。

### 3. 维护Web应用的隔离性

* Web应用通常被设计为独立的、隔离的单元。跨域限制有助于保持这种隔离性，防止不同应用之间的不当交互。
* 它还防止了一个域的JavaScript脚本对另一个域的内容进行未经授权的修改或访问。

### 4. 符合Web安全最佳实践

* 同源策略是Web安全领域的一个基本和重要的原则，被广泛接受和应用。
* 遵循这一原则有助于构建更安全、更可靠的Web应用。

<details>
<summary>参考答案</summary>

因为存在浏览器同源策略，所以才会有跨域问题。那么浏览器是出于何种原因会有跨域的限制呢。其实不难想到，跨域限制主要的目的就是为了用户的上网安全。

如果浏览器没有同源策略，会存在什么样的安全问题呢。下面从 DOM 同源策略和 XMLHttpRequest 同源策略来举例说明：

**如果没有 DOM 同源策略**，也就是说不同域的 iframe 之间可以相互访问，那么黑客可以这样进行攻击：

* 做一个假网站，里面用 iframe 嵌套一个银行网站 http://mybank.com。
* 把 iframe 宽高啥的调整到页面全部，这样用户进来除了域名，别的部分和银行的网站没有任何差别。
* 这时如果用户输入账号密码，我们的主网站可以跨域访问到 http://mybank.com 的 dom 节点，就可以拿到用户的账户密码了。

**如果没有 XMLHttpRequest 同源策略**，那么黑客可以进行 CSRF（跨站请求伪造） 攻击：

* 用户登录了自己的银行页面 http://mybank.com，http://mybank.com 向用户的 cookie 中添加用户标识。
* 用户浏览了恶意页面 http://evil.com，执行了页面中的恶意 AJAX 请求代码。
* http://evil.com 向 http://mybank.com 发起 AJAX HTTP 请求，请求会默认把 http://mybank.com 对应 cookie 也同时发送过去。
* 银行页面从发送的 cookie 中提取用户标识，验证用户无误，response 中返回请求数据。此时数据就泄露了。
* 而且由于 Ajax 在后台执行，用户无法感知这一过程。

因此，有了浏览器同源策略，我们才能更安全的上网。

</details>

## 289. 浏览器的同源策略是什么？ {#question-4ca8dcc9-9ce6-457c-b6ef-3c2e322aeba5}

> 难度：0.5 · 类型：QA

### 题目要点

同源策略（Same origin policy）是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，则浏览器的正常功能可能都会受到影响。可以说 Web 是构建在同源策略基础之上的，浏览器只是针对同源策略的一种实现。

<details>
<summary>参考答案</summary>

同源策略（Same origin policy）是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，则浏览器的正常功能可能都会受到影响。可以说 Web 是构建在同源策略基础之上的，浏览器只是针对同源策略的一种实现。

它的核心就在于它认为自任何站点装载的信赖内容是不安全的。当被浏览器半信半疑的脚本运行在沙箱时，它们应该只被允许访问来自同一站点的资源，而不是那些来自其它站点可能怀有恶意的资源。

所谓同源是指：**域名**、**协议**、**端口**相同。

另外，同源策略又分为以下两种：

* DOM 同源策略：禁止对不同源页面 DOM 进行操作。这里主要场景是 iframe 跨域的情况，不同域名的 iframe 是限制互相访问的。
* XMLHttpRequest 同源策略：禁止使用 XHR 对象向不同源的服务器地址发起 HTTP 请求。

</details>

## 290. 浏览器的垃圾回收机制有哪些？ {#question-594f4864-1932-4020-aec6-a2ae0fb16765}

> 难度：3 · 类型：QA

### 题目要点

JS会在创建变量时自动分配内存，在不使用的时候会自动周期性的释放内存，释放的过程就叫 "垃圾回收"。

<details>
<summary>参考答案</summary>

JS会在创建变量时自动分配内存，在不使用的时候会自动周期性的释放内存，释放的过程就叫 "垃圾回收"。

一方面自动分配内存减轻了开发者的负担，开发者不用过多的去关注内存使用，但是另一方面，正是因为因为是自动回收，所以如果不清楚回收的机制，会很容易造成混乱，而混乱就很容易造成"内存泄漏"。

由于是自动回收，所以就存在一个 "内存是否需要被回收的" 的问题，但是这个问题的判定在程序中意味着无法通过某个算法去准确完整的解决，后面探讨的回收机制只能有限的去解决一般的问题。

## 回收算法

垃圾回收对是否需要回收的问题主要依赖于对变量的判定是否可访问，由此衍生出两种主要的回收算法：

* 标记清理
* 引用计数

### 标记清理

标记清理是js最常用的回收策略，2012年后所有浏览器都使用了这种策略，此后的对回收策略的改进也是基于这个策略的改进。其策略是：

* 变量进入上下文，也可理解为作用域，会加上标记，证明其存在于该上下文；
* 将所有在上下文中的变量以及上下文中被访问引用的变量标记去掉，表明这些变量活跃有用；
* 在此之后再被加上标记的变量标记为准备删除的变量，因为上下文中的变量已经无法访问它们；
* 执行内存清理，销毁带标记的所有非活跃值并回收之前被占用的内存；

局限：

* 由于是从根对象(全局对象)开始查找，对于那些无法从根对象查询到的对象都将被清除
* 回收后会形成内存碎片，影响后面申请大的连续内存空间

### 引用计数

引用计数策略相对而言不常用，因为弊端较多。其思路是对每个值记录它被引用的次数，通过最后对次数的判断(引用数为0)来决定是否保留，具体的规则有：

* 声明一个变量，赋予它一个引用值时，计数+1；
* 同一个值被赋予另外一个变量时，引用+1；
* 保存对该值引用的变量被其他值覆盖，引用-1；
* 引用为0，回收内存；

局限：

最重要的问题就是，循环引用 的问题

```js
function refProblem () {
    let a = new Object();
    let b = new Object();
    a.c = b;
    b.c = a;  //互相引用
}
```

根据之前提到的规则，两个都互相引用了，引用计数不为0，所以两个变量都无法回收。如果频繁的调用改函数，则会造成很严重的内存泄漏。

</details>

## 291. xml和json有什么区别？ {#question-9dc542a0-b323-4c7a-9199-f1f2678714cf}

> 难度：1 · 类型：QA

### 题目要点

### JSON 和 XML 之间的区别

- **语法**：JSON 使用更简洁的键值对格式，而 XML 使用标签和属性。
- **数据类型**：JSON 主要支持对象和数组，而 XML 支持更多复杂的数据结构。
- **可读性**：JSON 通常更易于阅读，因为它的格式更接近于代码。
- **安全性**：XML 通常被认为比 JSON 更安全，因为 XML 注入攻击是一个常见的安全问题。
- **解析**：JSON 更容易解析，因为它的结构更简单。
- **用途**：JSON 主要用于客户端和服务器之间的数据传输，而 XML 更常用于文档存储和数据交换。

<details>
<summary>参考答案</summary>

## JSON

> JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，它完全独立于语言。它基于JavaScript编程语言，易于理解和生成。

示例：
```json
{"Student":[
    { "Name":"Vivek", "age":"20" },
    { "Name":"Suraj", "age":"19" },
    { "Name":"John", "age":"21" },
    { "Name":"Peter", "age":"22" }
]}
```

## XML

XML（可扩展标记语言）旨在传输数据，而不是显示数据。这是W3C的推荐。可扩展标记语言（XML）是一种标记语言，它定义了一组规则，用于以人类可读和机器可读的格式编码文档。XML的设计目标侧重于Internet上的简单性，通用性和可用性。它是一种文本数据格式，通过Unicode为不同的人类语言提供强大的支持。尽管XML的设计侧重于文档，但该语言被广泛用于表示任意数据结构，例如Web服务中使用的那些数据结构。

示例：

```xml
<Students>
    <Student>
        <Name>Vivek</Name> <age>20</age>
    </Student>
    <Student>
        <Name>Suraj</Name> <age>19</age>
    </Student>
    <Student>
        <Name>John</Name> <age>21</age>
    </Student>
    <Student>
        <Name>Peter</Name> <age>22</age>
    </Student>
</Students>
```

这两者都是自描述的，可以被许多编程语言解析和使用。

## JSON和XML之间的区别

以下是JSON和XML之间的一些区别：

1、JSON是JavaScript Object Notation；XML是可扩展标记语言。

2、JSON是基于JavaScript语言；XML源自SGML。

3、JSON是一种表示对象的方式；XML是一种标记语言，使用标记结构来表示数据项。

4、JSON不提供对命名空间的任何支持；XML支持名称空间。

5、JSON支持数组；XML不支持数组。

6、XML的文件相对难以阅读和解释；与XML相比，JSON的文件非常易于阅读。

7、JSON不使用结束标记；XML有开始和结束标签。

8、JSON的安全性较低；XML比JSON更安全。

9、JSON不支持注释；XML支持注释。

10、JSON仅支持UTF-8编码；XML支持各种编码。

</details>

## 292. document.write和innerHTML有什么区别 {#question-1b0c8f90-9f1a-42bf-bd5a-d9efaf0d74eb}

> 难度：0.5 · 类型：QA

### 题目要点

- **使用时机**：`document.write` 通常用于服务器端脚本，在 HTML 页面完全加载之前向文档写入内容。`innerHTML` 用于在网页加载后动态地修改元素的内容。
- **内容替换**：`document.write` 会替换整个文档的内容，而 `innerHTML` 只会影响指定的元素及其子元素。
- **执行时机**：`document.write` 是同步的，会阻塞页面渲染；`innerHTML` 是异步的，不会阻塞页面渲染。

在实际应用中，建议使用 `innerHTML` 而不是 `document.write`，因为它更安全、更可控，并且不会影响页面的加载性能。

<details>
<summary>参考答案</summary>

* document.write是直接写入到页面的内容流，如果在写之前没有调用document.open, 浏览器会自动调用open。每次写完关闭之后重新调用该函数，会导致页面被重写。
* innerHTML则是DOM页面元素的一个属性，代表该元素的html内容。你可以精确到某一个具体的元素来进行更改。如果想修改document的内容，则需要修改document.documentElement.innerElement。
* innerHTML将内容写入某个DOM节点，不会导致页面全部重绘
* innerHTML很多情况下都优于document.write，其原因在于其允许更精确的控制要刷新页面的那一个部分。

</details>

## 293. 使用原生js给一个按钮绑定两个onclick事件 {#question-b4137265-8ebe-4fc8-be75-8dfaf125af6c}

> 难度：0.5 · 类型：QA

### 题目要点

核心考查：使用原生js给一个按钮绑定两个onclick事件的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```javascript
//事件监听 绑定多个事件
var btn = document.getElementById("btn");

btn.addEventListener("click",hello1);
btn.addEventListener("click",hello2);

function hello1(){
 alert("hello 1");
}
function hello2(){
 alert("hello 2");
}
```

</details>

## 294. 123['toString'].length + 123 的输出值是多少？ {#question-3dc3b575-dc56-47b6-87b3-e83315630812}

> 难度：2 · 类型：QA

### 题目要点

function的length，就是第一个具有默认值之前的参数个数。

<details>
<summary>参考答案</summary>

## function的length

```js
function fn1 (name) {}

function fn2 (name = '林三心') {}

function fn3 (name, age = 22) {}

function fn4 (name, age = 22, gender) {}

function fn5(name = '林三心', age, gender) { }

console.log(fn1.length) // 1
console.log(fn2.length) // 0
console.log(fn3.length) // 1
console.log(fn4.length) // 1
console.log(fn5.length) // 0
```

function的length，就是第一个具有默认值之前的参数个数。

在函数的形参中，还有剩余参数这个东西，那如果具有剩余参数，会是怎么算呢？

```
function fn1(name, ...args) {}

console.log(fn1.length) // 1
```

可以看出，剩余参数是不算进length的计算之中的。

所以，123['toString'].length + 123 = ?的答案是124

## 总结

length 是函数对象的一个属性值，指该函数有多少个必须要传入的参数，即形参的个数。形参的数量不包括剩余参数个数，仅包括第一个具有默认值之前的参数个数

</details>

## 295. ajax、axios、fetch有什么区别？ {#question-eb100f99-89d5-4cdf-958f-d257aeb92614}

> 难度：2 · 类型：QA

### 题目要点

### AJAX

- **定义**：AJAX 是一种用于创建交互式网页的技术，它通过在后台与服务器进行数据交换，实现网页的部分更新，而不需要重新加载整个页面。
- **优点**：
  - 提高网页的交互性和用户体验。
  - 减轻服务器和网络的负担，因为不需要每次交互都加载整个页面。
- **缺点**：
  - 原生 XHR 架构不清晰，配置和调用方式混乱。
  - 不符合关注分离的原则。
  - 不利于MVVM架构的前端开发。

### Fetch API

- **定义**：Fetch API 是现代浏览器提供的一种用于在浏览器中与服务器交换数据的机制，它取代了传统的 XMLHttpRequest 对象。
- **优点**：
  - 语法简洁，基于 Promise 实现，支持 async/await。
  - 提供丰富的 API，如 request 和 response。
  - 是 ES 规范中的新实现方式，与原生 JavaScript 更贴合。
- **缺点**：
  - 默认不处理错误状态码，如 400 或 500。
  - 不支持自动带上 cookie。
  - 不支持超时控制和取消请求。
  - 无法原生监测请求进度。

### Axios

- **定义**：Axios 是一个基于 Promise 的 HTTP 客户端，用于浏览器和 node.js，它可以拦截请求和响应，自动转换 JSON 数据，并且可以抵御 XSRF 攻击。
- **优点**：
  - 浏览器端和 node.js 端都可以使用。
  - 支持 Promise API，易于使用。
  - 支持拦截请求和响应。
  - 自动转换 JSON 数据。
  - 支持抵御 XSRF 攻击。
- **缺点**：
  - 虽然基于原生 XHR，但提供了更友好的 API。
  - 功能强大，但可能增加学习成本。

AJAX 是传统的解决方案，Fetch API 是现代浏览器推荐的新标准，而 Axios 是一个更强大的库，提供了一系列的便捷功能。在实际开发中，应根据项目需求和团队熟悉度选择合适的技术。

<details>
<summary>参考答案</summary>

## （1）AJAX

Ajax 即“AsynchronousJavascriptAndXML”（异步 JavaScript 和 XML），是指一种创建交互式网页应用的网页开发技术。它是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。通过在后台与服务器进行少量数据交换，Ajax 可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。传统的网页（不使用 Ajax）如果需要更新内容，必须重载整个网页页面。其缺点如下：

* 本身是针对MVC编程，不符合前端MVVM的浪潮
* 基于原生XHR开发，XHR本身的架构不清晰
* 不符合关注分离（Separation of Concerns）的原则
* 配置和调用方式非常混乱，而且基于事件的异步模型不友好。

## （2）Fetch
fetch号称是AJAX的替代品，是在ES6出现的，使用了ES6中的promise对象。Fetch是基于promise设计的。Fetch的代码结构比起ajax简单多。fetch不是ajax的进一步封装，而是原生js，没有使用XMLHttpRequest对象。

fetch的优点：

* 语法简洁，更加语义化
* 基于标准 Promise 实现，支持 async/await
* 更加底层，提供的API丰富（request, response）
* 脱离了XHR，是ES规范里新的实现方式

fetch的缺点：

* fetch只对网络请求报错，对400，500都当做成功的请求，服务器返回 400，500 错误码时并不会 reject，只有网络错误这些导致请求不能完成时，fetch 才会被 reject。
* fetch默认不会带cookie，需要添加配置项： fetch(url, {credentials: 'include'})
* fetch不支持abort，不支持超时控制，使用setTimeout及Promise.reject的实现的超时控制并不能阻止请求过程继续在后台运行，造成了流量的浪费
* fetch没有办法原生监测请求的进度，而XHR可以

## （3）Axios

Axios 是一种基于Promise封装的HTTP客户端，其特点如下：

* 浏览器端发起XMLHttpRequests请求
* node端发起http请求
* 支持Promise API
* 监听请求和返回
* 对请求和返回进行转化
* 取消请求
* 自动转换json数据
* 客户端支持抵御XSRF攻击

</details>

## 296. for...in和for...of有什么区别？ {#question-33d77817-96e1-4531-840c-26426223102c}

> 难度：2 · 类型：QA

### 题目要点

for…of 是ES6新增的遍历方式，允许遍历一个含有iterator接口的数据结构（数组、对象等）并且返回各项的值，和ES3中的for…in的区别如下：

<details>
<summary>参考答案</summary>

for…of 是ES6新增的遍历方式，允许遍历一个含有iterator接口的数据结构（数组、对象等）并且返回各项的值，和ES3中的for…in的区别如下：

* for…of 遍历获取的是 **可迭代对象**的键值，for…in 获取的是对象的键名（**键名必须是可枚举的**）；
* for… in 会遍历对象的整个原型链，性能非常差不推荐使用，而 for … of 只遍历当前对象不会遍历原型链；
* 对于数组的遍历，for…in 会返回数组中所有可枚举的属性(包括原型链上可枚举的属性)，for…of 只返回数组的下标对应的属性值；

总结： for...in 循环主要是为了遍历对象而生，不适用于遍历数组；for...of 循环可以用来遍历数组、类数组对象，字符串、Set、Map 以及 Generator 对象。

</details>

## 297. 什么是类数组对象？ {#question-1648c493-456c-426e-b57f-7a24ad14d40e}

> 难度：0.5 · 类型：QA

### 题目要点

一个拥有 length 属性和若干索引属性的对象就可以被称为类数组对象，类数组对象和数组类似，但是不能调用数组的方法。常见的类数组对象有 arguments 和 DOM 方法的返回结果，还有一个函数也可以被看作是类数组对象，因为它含有 length 属性值，代表可接收的参数个数。

<details>
<summary>参考答案</summary>

一个拥有 length 属性和若干索引属性的对象就可以被称为类数组对象，类数组对象和数组类似，但是不能调用数组的方法。常见的类数组对象有 arguments 和 DOM 方法的返回结果，还有一个函数也可以被看作是类数组对象，因为它含有 length 属性值，代表可接收的参数个数。

常见的类数组转换为数组的方法有这样几种：

（1）通过 call 调用数组的 slice 方法来实现转换

```js
Array.prototype.slice.call(arrayLike);
```

（2）通过 call 调用数组的 splice 方法来实现转换
```js
Array.prototype.splice.call(arrayLike, 0);
```

（3）通过 apply 调用数组的 concat 方法来实现转换
```js
Array.prototype.concat.apply([], arrayLike);
```

（4）通过 Array.from 方法来实现转换
```js
Array.from(arrayLike);
```

</details>

## 298. JavaScript脚本延迟加载的方式有哪些？ {#question-0d68ac37-7345-4813-a9cd-95a5089c61ba}

> 难度：3.5 · 类型：QA

### 题目要点

延迟加载就是等页面加载完成之后再加载 JavaScript 文件。 js 延迟加载有助于提高页面加载速度。

<details>
<summary>参考答案</summary>

延迟加载就是等页面加载完成之后再加载 JavaScript 文件。 js 延迟加载有助于提高页面加载速度。

一般有以下几种方式：

* defer 属性： 给 js 脚本添加 defer 属性，这个属性会让脚本的加载与文档的解析同步解析，然后在文档解析完成后再执行这个脚本文件，这样的话就能使页面的渲染不被阻塞。多个设置了 defer 属性的脚本按规范来说最后是顺序执行的，但是在一些浏览器中可能不是这样。
* async 属性： 给 js 脚本添加 async 属性，这个属性会使脚本异步加载，不会阻塞页面的解析过程，但是当脚本加载完成后立即执行 js 脚本，这个时候如果文档没有解析完成的话同样会阻塞。多个 async 属性的脚本的执行顺序是不可预测的，一般不会按照代码的顺序依次执行。
* 动态创建 DOM 方式： 动态创建 DOM 标签的方式，可以对文档的加载事件进行监听，当文档加载完成后再动态的创建 script 标签来引入 js 脚本。
* 使用 setTimeout 延迟方法： 设置一个定时器来延迟加载js脚本文件
* 让 JS 最后加载： 将 js 脚本放在文档的底部，来使 js 脚本尽可能的在最后来加载执行。

</details>

## 299. 箭头函数的 this 指向哪⾥？ {#question-33363940-179b-4ae3-9cd3-7bf0a5619df9}

> 难度：3 · 类型：QA

### 题目要点

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

<details>
<summary>参考答案</summary>

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

可以⽤Babel理解⼀下箭头函数:

```js
// ES6
const obj = {
  getArrow() {
    return () => {
      console.log(this === obj);
    };
  }
}
```

转化后：

```js
// ES5，由 Babel 转译
var obj = {
   getArrow: function getArrow() {
     var _this = this;
     return function () {
        console.log(_this === obj);
     };
   }
};
```

</details>

## 300. 如果new一个箭头函数会怎么样？ {#question-31134096-417d-48df-8030-68dd004c40d1}

> 难度：2 · 类型：QA

### 题目要点

箭头函数是ES6中的提出来的，它没有prototype，也没有自己的this指向，更不可以使用arguments参数，所以不能New一个箭头函数。

<details>
<summary>参考答案</summary>

箭头函数是ES6中的提出来的，它没有prototype，也没有自己的this指向，更不可以使用arguments参数，所以不能New一个箭头函数。

new操作符的实现步骤如下：

1、创建一个空的简单JavaScript对象（即{}）；

2、为步骤1新创建的对象添加属性__proto__，将该属性链接至构造函数的原型对象 ；

3、将步骤1新创建的对象作为this的上下文 ；

4、如果该函数没有返回对象，则返回this。

所以，上面的第二、三步，箭头函数都是没有办法执行的。

</details>

## 301. object.assign和扩展运算法是深拷贝还是浅拷贝，两者区别是什么？ {#question-8244fd41-2b94-4179-887f-177501ddf280}

> 难度：3 · 类型：QA

### 题目要点

扩展运算符

<details>
<summary>参考答案</summary>

* 扩展运算符

```js
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = {...outObj}
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

* Object.assign()

```js
let outObj = {
  inObj: {a: 1, b: 2}
}
let newObj = Object.assign({}, outObj)
newObj.inObj.a = 2
console.log(outObj) // {inObj: {a: 2, b: 2}}
```

可以看到，两者都是浅拷贝。

Object.assign()方法接收的第一个参数作为目标对象，后面的所有参数作为源对象。然后把所有的源对象合并到目标对象中。它会修改了一个对象，因此会触发 ES6 setter。

扩展操作符（…）使用它时，数组或对象中的每一个值都会被拷贝到一个新的数组或对象中。它不复制继承的属性或类的属性，但是它会复制ES6的 symbols 属性。

</details>

## 302. typeof NaN 的结果是什么？ {#question-0bd0c9bd-9e5f-47af-8a7d-3ba7aaa28dcd}

> 难度：0.5 · 类型：QA

### 题目要点

NaN 指“不是一个数字”（not a number），NaN 是一个“警戒值”（sentinel value，有特殊用途的常规值），用于指出数字类型中的错误情况，即“执行数学运算没有成功，这是失败后返回的结果”。

<details>
<summary>参考答案</summary>

NaN 指“不是一个数字”（not a number），NaN 是一个“警戒值”（sentinel value，有特殊用途的常规值），用于指出数字类型中的错误情况，即“执行数学运算没有成功，这是失败后返回的结果”。

```js
typeof NaN; // "number"
```

NaN 是一个特殊值，它和自身不相等，是唯一一个非自反（自反，reflexive，即 x === x 不成立）的值。而 NaN !== NaN 为 true。

</details>

## 303. null 和 undefined 有什么区别？ {#question-13d7618b-87b1-41c1-9dbe-dbc9991d71c5}

> 难度：1 · 类型：QA

### 题目要点

首先 Undefined 和 Null 都是基本数据类型，这两个基本数据类型分别都只有一个值，就是 undefined 和 null。

<details>
<summary>参考答案</summary>

首先 Undefined 和 Null 都是基本数据类型，这两个基本数据类型分别都只有一个值，就是 undefined 和 null。

undefined 代表的含义是未定义，null 代表的含义是空对象。一般变量声明了但还没有定义的时候会返回 undefined，null主要用于赋值给一些可能会返回对象的变量，作为初始化。

undefined 在 JavaScript 中不是一个保留字，这意味着可以使用 undefined 来作为一个变量名，但是这样的做法是非常危险的，它会影响对 undefined 值的判断。我们可以通过一些方法获得安全的 undefined 值，比如说 void 0。

当对这两种类型使用 typeof 进行判断时，Null 类型化会返回 “object”，这是一个历史遗留的问题。当使用双等号对两种类型的值进行比较时会返回 true，使用三个等号时会返回 false。

```js
typeof null; // "object" (not "null" for legacy reasons)
typeof undefined; // "undefined"
null === undefined; // false
null == undefined; // true
null === null; // true
null == null; // true
!null; // true
Number.isNaN(1 + null); // false
Number.isNaN(1 + undefined); // true
```

</details>

## 304. 数据类型检测的方式有哪些？ {#question-74d6fe86-2acf-4b0c-a588-0738302ced01}

> 难度：2 · 类型：QA

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

## 305. Object.is() 与比较操作符 “===”、“==” 的区别？ {#question-c29d2196-388f-48a1-9715-70f39cc92f4d}

> 难度：2 · 类型：QA

### 题目要点

使用双等号（==）进行相等判断时，如果两边的类型不一致，则会进行强制类型转化后再进行比较。

<details>
<summary>参考答案</summary>

* 使用双等号（==）进行相等判断时，如果两边的类型不一致，则会进行强制类型转化后再进行比较。
* 使用三等号（===）进行相等判断时，如果两边的类型不一致时，不会做强制类型准换，直接返回 false。
* 使用 Object.is 来进行相等判断时，一般情况下和三等号的判断相同，它处理了一些特殊的情况，比如 -0 和 +0 不再相等，两个 NaN 是相等的。

</details>

## 306. isNaN 和 Number.isNaN 函数有什么区别？ {#question-8200a6ae-94f7-4056-bdb8-6bd84b383500}

> 难度：2 · 类型：QA

### 题目要点

- `isNaN()` 函数会将传入的参数转换为数字，这可能会影响 NaN 的判断。
- `Number.isNaN()` 方法更为准确，因为它不会自动将参数转换为数字，只有在参数是值为 NaN 的数字时，才会返回 true。
- `Number.isNaN()` 方法用于确定传递的值是否为 NaN，并且检查其类型是否为 Number。它是原来的全局 `isNaN()` 的更稳妥的版本。

<details>
<summary>参考答案</summary>

## NaN

全局属性 NaN 的值表示不是一个数字（Not-A-Number）。

在 JavaScript 中，NaN 最特殊的地方就是，我们不能使用相等运算符（== (en-US) 和 === (en-US)）来判断一个值是否是 NaN，因为 NaN == NaN 和 NaN === NaN 都会返回 false。因此，必须要有一个判断值是否是 NaN 的方法。

## 方法简介

* 函数 isNaN 接收参数后，会尝试将这个参数转换为数值，任何不能被转换为数值的的值都会返回 true，因此非数字值传入也会返回 true ，会影响 NaN 的判断。
* 函数 Number.isNaN 会首先判断传入参数是否为数字，如果是数字再继续判断是否为 NaN ，不会进行数据类型的转换，这种方法对于 NaN 的判断更为准确。

## 总结

和全局函数 isNaN() 相比，Number.isNaN() 不会自行将参数转换成数字，只有在参数是值为 NaN 的数字时，才会返回 true。

Number.isNaN() 方法确定传递的值是否为NaN，并且检查其类型是否为Number。它是原来的全局isNaN() 的更稳妥的版本。

</details>

## 307. 说说你对以下几个页面生命周期事件的理解：DOMContentLoaded，load，beforeunload，unload {#question-43dad801-6c42-4638-9006-2c51a7cf0c91}

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

## 308. 使用Promise实现每隔1秒输出1,2,3 {#question-bff513af-f95f-481f-8bda-03f3515d0e08}

> 难度：3 · 类型：QA

### 题目要点

这道题比较简单的一种做法是可以用Promise配合着reduce不停的在promise后面叠加.then，请看下面的代码：

<details>
<summary>参考答案</summary>

这道题比较简单的一种做法是可以用Promise配合着reduce不停的在promise后面叠加.then，请看下面的代码：

```javascript
const arr = [1, 2, 3]
arr.reduce((p, x) => {
  return p.then(() => {
    return new Promise(r => {
      setTimeout(() => r(console.log(x)), 1000)
    })
  })
}, Promise.resolve())
```

还可以更简单一点写：

```javascript
const arr = [1, 2, 3]
arr.reduce((p, x) => p.then(() => new Promise(r => setTimeout(() => r(console.log(x)), 1000))), Promise.resolve())
```

</details>

## 309. Promise中的值穿透是什么？ {#question-154d4288-8195-4fd4-87bb-2844cb22a4e5}

> 难度：3.5 · 类型：QA

### 题目要点

解释：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透。

<details>
<summary>参考答案</summary>

解释：.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透。

当then中传入的不是函数，则这个then返回的promise的data，将会保存上一个的promise.data。这就是发生值穿透的原因。而且每一个无效的then所返回的promise的状态都为resolved。

```javascript
Promise.resolve(1)
      .then(2) // 注意这里
      .then(Promise.resolve(3))
      .then(console.log)
```

上面代码的输出是 `1`

</details>

## 310. 如何使用js计算一个html页面有多少种标签？ {#question-e84bcf8c-1ee4-4c28-8e64-875b485369b5}

> 难度：3 · 类型：QA

### 题目要点

这道题看似简单，但是是一个很有价值的一道题目。它包含了很多重要的知识：

<details>
<summary>参考答案</summary>

## 分析

这道题看似简单，但是是一个很有价值的一道题目。它包含了很多重要的知识：

* 如何获取所有DOM节点
* 伪数组如何转为数组
* 去重

## 解答

* 获取所有的DOM节点。

```javascript
document.querySelectorAll('*')
```

此时得到的是一个NodeList集合，我们需要将其转化为数组，然后对其筛选。

* 转化为数组
```javascript
[...document.querySelectorAll('*')]
```
一个拓展运算符就轻松搞定。

* 获取数组每个元素的标签名
```javascript
[...document.querySelectorAll('*')].map(ele => ele.tagName)
```
使用一个map方法，将我们需要的结果映射到一个新数组。

* 去重
```javascript
new Set([...document.querySelectorAll('*')].map(ele=> ele.tagName)).size
```

我们使用ES6中的Set对象，把数组作为构造函数的参数，就实现了去重，再使用Set对象的size方法就可以得到有多少种HTML元素了。

</details>

## 311. bind() 连续调用多次，this的绑定值是什么呢？ {#question-e253151b-a880-448b-9cd1-d869971a63e4}

> 难度：3 · 类型：QA

```javascript
var bar = function(){
    console.log(this.x);
}
var foo = {
    x:3
}
var sed = {
    x:4
}
var func = bar.bind(foo).bind(sed);
func(); //?

var fiv = {
    x:5
}
var func = bar.bind(foo).bind(sed).bind(fiv);
func(); //?
```

### 题目要点

答案是，两次都仍将输出 3 ，而非期待中的 4 和 5 。

<details>
<summary>参考答案</summary>

答案是，两次都仍将输出 3 ，而非期待中的 4 和 5 。

原因是，在Javascript中，多次 bind() 是无效的。

更深层次的原因， bind() 的实现，相当于使用函数在内部包了一个 call / apply ，第二次 bind() 相当于再包住第一次 bind() ,故第二次以后的 bind 是无法生效的。

</details>

## 312. 浏览器和 Node 中的事件循环有什么区别？ {#question-12240b0e-e285-422e-b6ac-b1e839af6cae}

> 难度：3.5 · 类型：QA

### 题目要点

**作答思路**：

在浏览器中，事件循环是单线程的，包括渲染线程和事件触发线程。事件被添加到事件队列中，然后按照优先级被渲染线程处理。而在Node.js中，事件循环是多线程的，包括主事件循环和I/O事件循环。主事件循环负责执行同步代码，而I/O事件循环则处理异步I/O操作。

**考察要点**：

1. **浏览器事件循环**：理解浏览器中事件循环的基本原理，包括渲染线程和事件触发线程的作用。
2. **Node.js事件循环**：理解Node.js中事件循环的特点，包括主事件循环和I/O事件循环的作用。
3. **线程模型差异**：理解浏览器和Node.js在事件循环方面线程模型的差异，以及这些差异如何影响编程模型。

<details>
<summary>参考答案</summary>

## 浏览器

关于微任务和宏任务在浏览器的执行顺序是这样的：

* 执行一只task（宏任务）
* 执行完micro-task队列 （微任务）

如此循环往复下去

常见的 task（宏任务） 比如：setTimeout、setInterval、script（整体代码）、 I/O 操作、UI 渲染等。
常见的 micro-task 比如: new Promise().then(回调)、MutationObserver(html5新特性) 等。

## Node

Node的事件循环是libuv实现的，引用一张官网的图：

![image.png](https://static.ecool.fun//article/b6d024fe-2847-4749-99ca-7c1a8d9faeba.png)

大体的task（宏任务）执行顺序是这样的：

* timers 定时器：本阶段执行已经安排的 setTimeout() 和 setInterval() 的回调函数。
* pending callbacks待定回调：执行延迟到下一个循环迭代的 I/O 回调。
* idle, prepare：仅系统内部使用。
* poll 轮询：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，它们由计时器 setImmediate() 排定的之外），其余情况 node 将在此处阻塞。
* check 检测：setImmediate() 回调函数在这里执行。
* close callbacks 关闭的回调函数：一些准备关闭的回调函数，如：socket.on('close', ...)。

微任务和宏任务在Node的执行顺序

Node 10 及以前：

* 执行完一个阶段的所有任务
* 执行完nextTick队列里面的内容
* 然后执行完微任务队列的内容

Node 11以后：
和浏览器的行为统一了，都是每执行一个宏任务就执行完微任务队列。

</details>

## 313. 谈谈对 window.requestAnimationFrame 的理解 {#question-828350f9-b3d1-4593-8306-e5bc567b5c28}

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

## 314. 浏览器一帧都会干些什么？ {#question-4585f639-0eff-4190-9fa0-e1c0838284e8}

> 难度：3 · 类型：QA

### 题目要点

### 浏览器刷新率与帧率

- **定义**：浏览器的刷新率通常指的是每秒绘制多少帧，单位是帧/秒（fps）。
- **当前标准**：目前大多数浏览器采用的刷新率是 60Hz，即每秒绘制 60 帧。
- **帧耗时**：在 60Hz 的刷新率下，每一帧大约耗时 16.6 毫秒（ms）。

### 浏览器一帧

- **输入事件**：浏览器接收用户的输入事件，如点击、滚动等。
- **事件回调**：处理与输入事件相关的回调函数，如点击事件、键盘事件等。
- **开始一帧**：开始新的一帧处理。
- **执行 RAF**：请求下一帧动画，通常用于平滑动画效果。
- **页面布局**：根据样式计算确定页面元素的位置和大小。
- **绘制渲染**：将布局后的元素绘制到屏幕上。
- **执行 RIC**：如果前一帧有剩余时间，则执行空闲回调函数。

<details>
<summary>参考答案</summary>

我们都知道，页面的内容都是一帧一帧绘制出来的，浏览器刷新率代表浏览器一秒绘制多少帧。原则上说 1s 内绘制的帧数也多，画面表现就也细腻。目前浏览器大多是 60Hz（60帧/s），每一帧耗时也就是在 16.6ms 左右。那么在这一帧的（16.6ms） 过程中浏览器又干了些什么呢？

![image.png](https://static.ecool.fun//article/8d7519c9-4540-4ec9-bce7-6afa21813061.png)

通过上面这张图可以清楚的知道，浏览器一帧会经过下面这几个过程：

* 接受输入事件
* 执行事件回调
* 开始一帧
* 执行 RAF (RequestAnimationFrame)
* 页面布局，样式计算
* 绘制渲染
* 执行 RIC (RequestIdelCallback)

第七步的 RIC 事件不是每一帧结束都会执行，只有在一帧的 16.6ms 中做完了前面 6 件事儿且还有剩余时间，才会执行。如果一帧执行结束后还有时间执行 RIC 事件，那么下一帧需要在事件执行结束才能继续渲染，所以 RIC 执行不要超过 30ms，如果长时间不将控制权交还给浏览器，会影响下一帧的渲染，导致页面出现卡顿和事件响应不及时。

</details>

## 315. 谈谈 Object.defineProperty 与 Proxy 的区别 {#question-09420ad4-4cd0-4c3d-9b56-970e21c8f208}

> 难度：3 · 类型：QA

### 题目要点

### Vue2.x 中的双向绑定实现

- **基于**：Vue2.x 的双向绑定是基于 `Object.defineProperty` 实现的。
- **问题**：这种方式存在一些局限性：
  1. **数组监听**：无法直接监听数组的变化，需要重写数组的方法来模拟。
  2. **属性遍历**：需要遍历对象的每个属性来定义属性描述符。
  3. **嵌套对象监听**：需要递归遍历嵌套对象的所有属性。

### Vue3.x 中的双向绑定实现

- **基于**：Vue3.x 使用 `Proxy` 代理的方式实现双向绑定。
- **优势**：
  1. **对象深度监听**：Proxy 可以针对整个对象进行代理，无需遍历每个属性，解决了深度递归的问题。
  2. **数组监听**：Proxy 可以直接监听数组的变化，无需重写数组方法。
  3. **拦截方法**：Proxy 提供更多的拦截方法，如 `get`、`set`、`deleteProperty` 等，使得数据劫持更加灵活。
  4. **性能优化**：Proxy 可能得到浏览器针对性的优化，有助于性能提升。

<details>
<summary>参考答案</summary>

在 Vue2.x 的版本中，双向绑定是基于 Object.defineProperty 方式实现的。而 Vue3.x 版本中，使用了 ES6 中的 Proxy 代理的方式实现。

## Object.defineProperty(obj, prop, descriptor)

使用 Object.defineProperty 会产生三个主要的问题：

* 不能监听数组的变化

在 Vue2.x 中解决数组监听的方法是将能够改变原数组的方法进行重写实现（比如：push、 pop、shift、unshift、splice、sort、reverse），举例：

```javascript
// 我们重写 push 方法
const originalPush = Array.prototype.push

Array.prototype.push = function() {
  // 我们在这个位置就可以进行 数据劫持 了
  console.log('数组被改变了')

  originalPush.apply(this, arguments)
}
```

* 必须遍历对象的每个属性

可以通过 Object.keys() 来实现

* 必须深层遍历嵌套的对象

通过递归深层遍历嵌套对象，然后通过 Object.keys() 来实现对每个属性的劫持

## Proxy

* Proxy 针对的整个对象，Object.defineProperty 针对单个属性，这就解决了 需要对对象进行深度递归（支持嵌套的复杂对象劫持）实现对每个属性劫持的问题

```javascript
// 定义一个复杂对象
const obj = {
    obj: {
        children: {
            a: 1
        }
    }
}

const objProxy = new Proxy(obj, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },

    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(objProxy.obj) // 输出 '-- target --'
console.log(objProxy.a = 2) // 输出 '-- set --'
```

* Proxy 解决了 Object.defineProperty 无法劫持数组的问题

```javascript
const ary = [1, 2, 3]

const aryProxy = new Proxy(ary, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(aryProxy[0]) // 输出 '-- target --'
console.log(aryProxy.push(1)) // 输出 '-- set --'
```

*  比 Object.defineProperty 有更多的拦截方法，对比一些新的浏览器，可能会对 Proxy 针正对性的优化，有助于性能提升

</details>

## 316. base64编码图片，为什么会让数据量变大？ {#question-a93416a5-73ab-49be-98d0-42c829616f9a}

> 难度：3 · 类型：QA

### 题目要点

Base64编码的思想是是采用64个基本的ASCII码字符对数据进行重新编码。它将需要编码的数据拆分成字节数组。以3个字节为一组。按顺序排列24位数据，再把这24位数据分成4组，即每组6位。再在每组的的最高位前补两个0凑足一个字节。这样就把一个3字节为一组的数据重新编码成了4个字节。当所要编码的数据的字节数不是3的整倍数，也就是说在分组时最后一组不够3个字节。这时在最后一组填充1到2个0字节。并在最后编码完成后在结尾添加1到2个"="。

<details>
<summary>参考答案</summary>

Base64编码的思想是是采用64个基本的ASCII码字符对数据进行重新编码。它将需要编码的数据拆分成字节数组。以3个字节为一组。按顺序排列24位数据，再把这24位数据分成4组，即每组6位。再在每组的的最高位前补两个0凑足一个字节。这样就把一个3字节为一组的数据重新编码成了4个字节。当所要编码的数据的字节数不是3的整倍数，也就是说在分组时最后一组不够3个字节。这时在最后一组填充1到2个0字节。并在最后编码完成后在结尾添加1到2个"="。

（ 注BASE64字符表：ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/）

从以上编码规则可以得知，通过Base64编码，原来的3个字节编码后将成为4个字节，即字节增加了33.3%，数据量相应变大。所以20M的数据通过Base64编码后大小大概为20M*133.3%=26.67M。

</details>

## 317. html文档渲染过程，css文件和js文件的下载，是否会阻塞渲染？ {#question-55af61ba-c3c4-4714-a047-02dedd49d0df}

> 难度：3 · 类型：QA

### 题目要点

### HTML 文档渲染过程

1. **解析 HTML**：浏览器开始解析 HTML 文档，构建 DOM 树。
2. **解析 CSS**：在解析过程中，浏览器会并行下载和解析 CSS 文件。
3. **解析 JS**：同样，浏览器会并行下载和解析 JS 文件。
4. **构建 Render Tree**：将 DOM 树和 CSSOM（CSS 对象模型）树合并，生成 Render Tree。
5. **布局**：计算 Render Tree 中每个节点的几何位置。
6. **绘制**：将 Render Tree 中的节点绘制到屏幕上。

### CSS 文件下载和解析

- **不会阻塞 HTML 解析**：CSS 文件的下载不会阻塞 HTML 的解析，但会阻塞 DOM 的渲染。
- **阻塞 DOM 渲染**：在 CSS 文件下载和解析完成之前，浏览器不会开始布局和绘制过程。
- **优先级**：为了优化性能，浏览器会尽可能早地渲染页面，而不是等待所有 CSS 文件都加载和解析完成。

### JS 文件下载和解析

- **阻塞渲染**：JS 文件的下载和解析会阻塞 GUI 渲染进程，包括 DOM 和 CSS 的解析和渲染。
- **执行顺序**：浏览器会等待 JS 文件下载和解析完成后，才会执行其中的代码。
- **影响**：JS 文件未下载和解析完成之前，后续的 HTML 和 CSS 无法解析。

### 总结

- **CSS 文件**：下载和解析不会阻塞 HTML 的解析，但会阻塞 DOM 的渲染。浏览器会尽可能早地渲染页面，而不是等待所有 CSS 文件都加载和解析完成。
- **JS 文件**：下载和解析会阻塞 GUI 渲染进程，包括 DOM 和 CSS 的解析和渲染。浏览器会等待 JS 文件下载和解析完成后，才会执行其中的代码。

<details>
<summary>参考答案</summary>

浏览器内有多个进程，其中渲染进程被称为浏览器内核，负责页面渲染和执行 JS 脚本等。渲染进程负责浏览器的解析和渲染，内部有 JS 引擎线程、 GUI 渲染线程、事件循环管理线程、定时器线程、HTTP 线程。

JS 引擎线程负责执行 JS 脚本，GUI 渲染线程负责页面的解析和渲染，两者是互斥的，也就是执行 JS 的时候页面是停止解析和渲染的。这是因为如果在页面渲染的同时 JS 引擎修改了页面元素，比如清空页面，会造成后续页面渲染的不必要和错误。而由于 JS 经常要操作 DOM ，就要涉及 JS 引擎线程和 GUI 渲染线程的通信，而线程间通信代价是非常昂贵的，这也是造成 JS 操作 DOM 效率不高的原因。

浏览器的 HTML/CSS 的解析和渲染都属于 GUI渲染线程，所以和 JS 引擎线程是互斥、阻塞的。下面从代码实际运行的角度分析浏览器解析和渲染的顺序，以及互相间的阻塞关系。

## CSS 阻塞

* css 文件的下载和解析不会影响 DOM 的解析，但是会阻塞 DOM 的渲染。因为 CSSOM Tree 要和 DOM Tree 合成 Render Tree 才能绘制页面。下面的 test1 在 css 下载并解析完成前是默认样式， test2 在 css 下载并解析完成之前不会显示：

```html
<button class="btn btn-primary">test1</button>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
<div>test2</div>
```

* css 文件没下载并解析完成之前，后续的 js 脚本不能执行。下面的 alert('ok') 在 css 下载并解析完成之前不会弹出来：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
<script>
    alert('ok')
</script>
```

* css 文件的下载不会阻塞前面的 js 脚本执行。下面的 alert('ok') 会在 css 下载完成前弹出：

```html
<script>
    alert('ok')
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
```

所以在需要提前执行不操作 dom 元素的 js 时，不妨把 js 放到 css 文件之前。

## js 阻塞

js 文件的下载和解析会阻塞 GUI 渲染进程，也就是会阻塞 DOM 和 CSS 的解析和渲染。

js 文件没下载并解析完成之前，后续的 HTML 和 CSS 无法解析：

```html
<script src="https://code.jquery.com/jquery-3.4.1.js"></script>
<div>test</div>
```

* js 文件的下载不会阻塞前面 HTML 和 CSS 的解析：

```html
<div>test</div>
<script src="https://code.jquery.com/jquery-3.4.1.js"></script>
```

## 需要注意的点

* 第一，GUI 渲染线程会尽可能早的将内容呈现到屏幕上，并不会等到所有的 HTML 都解析完成之后再去构建和布局 Render Tree，而是解析完一部分内容就显示一部分内容，同时，可能还在通过网络下载其余内容。下面 test1 会在 js 文件下载完成前渲染完成，而 test2 则会在 js 文件下载并执行完之后渲染：

```html
  <div>test1</div>
  <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
  <div>test2</div>
```

* 第二，文件的下载是不会被阻塞的，不管是 css 还是 js 文件，浏览器的主线程会在页面解析前开启下载，所以就算在外部脚本执行前删除脚本，脚本也还是会下载。

```html
<body>
  <script>
    document.body.remove()
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
  <script src="https://code.jquery.com/jquery-3.4.1.js"></script>
</body>
```

</details>

## 318. 谈谈你对浏览器中进程和线程的理解 {#question-fe257d38-7fa5-4062-bdc5-e11525b984a4}

> 难度：2 · 类型：QA

### 题目要点

### 浏览器的多进程结构

- **Browser 进程**：浏览器的主进程，负责创建和销毁其它进程、网络资源的下载与管理、浏览器界面的展示、前进后退等。
- **GPU 进程**：用于 3D 绘制等，最多一个。
- **第三方插件进程**：每种类型的插件对应一个进程，仅当使用该插件时才创建。
- **浏览器渲染进程**：也称为浏览器内核，用于页面渲染、脚本执行、事件处理等，每打开一个新网页就会创建一个进程。

### 渲染进程（浏览器内核）的线程

- **GUI 渲染线程**：负责渲染浏览器界面，当界面需要重绘或回流时，该线程执行。
- **JavaScript 引擎线程**：负责处理 JavaScript 脚本，解析和运行代码。
- **事件触发线程**：控制浏览器事件循环，处理事件并添加到待处理队列。
- **定时触发器线程**：处理 setInterval 和 setTimeout 事件。
- **异步 HTTP 请求线程**：处理 XMLHttpRequest 连接的异步请求。

### 线程间的交互

- **GUI 渲染线程与 JavaScript 引擎线程**：互斥的，JavaScript 引擎执行时，GUI 线程会被挂起。
- **事件触发线程与 JavaScript 引擎线程**：事件被添加到待处理队列，由 JavaScript 引擎执行。

### JavaScript 的单线程执行

- **单线程特性**：JavaScript 引擎中的代码执行是单线程的，同一时间只能执行一件任务。

<details>
<summary>参考答案</summary>

## 浏览器是多进程的

它主要包括以下进程：

* Browser 进程：浏览器的主进程，唯一，负责创建和销毁其它进程、网络资源的下载与管理、浏览器界面的展示、前进后退等。
* GPU 进程：用于 3D 绘制等，最多一个。
* 第三方插件进程：每种类型的插件对应一个进程，仅当使用该插件时才创建。
* 浏览器渲染进程（浏览器内核）：内部是多线程的，每打开一个新网页就会创建一个进程，主要用于页面渲染，脚本执行，事件处理等。

## 渲染进程（浏览器内核）

浏览器的渲染进程是多线程的，页面的渲染，JavaScript 的执行，事件的循环，都在这个进程内进行：

* GUI 渲染线程：负责渲染浏览器界面，当界面需要重绘（Repaint）或由于某种操作引发回流(Reflow)时，该线程就会执行。
* JavaScript 引擎线程：也称为 JavaScript 内核，负责处理 Javascript 脚本程序、解析 Javascript 脚本、运行代码等。（例如 V8 引擎）
* 事件触发线程：用来控制浏览器事件循环，注意这不归 JavaScript 引擎线程管，当事件被触发时，该线程会把事件添加到待处理队列的队尾，等待 JavaScript 引擎的处理。
* 定时触发器线程：传说中的 setInterval 与 setTimeout 所在线程，注意，W3C 在 HTML 标准中规定，规定要求 setTimeout 中低于 4ms 的时间间隔算为 4ms 。（PS：最小间隔4ms的说法是不准确的，或者说是有前提条件的，请看HTML标准：`11. If nesting level is greater than 5, and timeout is less than 4, then set timeout to 4.`，也就是说，循环嵌套超过5层的，并且延迟不到4ms，才会变成4ms）
* 异步 http 请求线程：在 XMLHttpRequest 连接后通过浏览器新开一个线程请求，将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由 JavaScript 引擎执行。

注意，GUI 渲染线程与 JavaScript 引擎线程是互斥的，当 JavaScript 引擎执行时 GUI 线程会被挂起（相当于被冻结了），GUI 更新会被保存在一个队列中等到 JavaScript 引擎空闲时立即被执行。所以如果 JavaScript 执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞。

## 单线程的 JavaScript

所谓单线程，是指在 JavaScript 引擎中负责解释和执行 JavaScript 代码的线程唯一，同一时间上只能执行一件任务。

</details>

## 319. 为什么JavaScript是单线程？ {#question-89dcd3da-6e76-4935-9232-ce96d2b801bb}

> 难度：1 · 类型：QA

### 题目要点

JavaScript语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。那么，为什么JavaScript不能有多个线程呢？这样能提高效率啊。

<details>
<summary>参考答案</summary>

JavaScript语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。那么，为什么JavaScript不能有多个线程呢？这样能提高效率啊。

JavaScript的单线程，与它的用途有关。作为浏览器脚本语言，JavaScript的主要用途是与用户互动，以及操作DOM。这决定了它只能是单线程，否则会带来很复杂的同步问题。比如，假定JavaScript同时有两个线程，一个线程在某个DOM节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？

所以，为了避免复杂性，从一诞生，JavaScript就是单线程，这已经成了这门语言的核心特征，将来也不会改变。

为了利用多核CPU的计算能力，HTML5提出Web Worker标准，允许JavaScript脚本创建多个线程，但是子线程完全受主线程控制，且不得操作DOM。所以，这个新标准并没有改变JavaScript单线程的本质。

</details>

## 320. 说说你对 Object.defineProperty 的理解 {#question-a493193e-48ff-4e9e-9e66-0bf55732db63}

> 难度：3 · 类型：QA

### 题目要点

### Object.defineProperty() 方法

- **定义**：`Object.defineProperty()` 方法在对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
- **参数**：
  - `obj`：要定义属性的对象。
  - `prop`：要定义或修改的属性的名称或 Symbol。
  - `descriptor`：要定义或修改的属性描述符。

### 属性描述符

- **数据描述符**：包含值和可选的 `writable` 和 `configurable` 键。
  - `value`：属性的值。
  - `writable`：控制属性值是否可被重写。
  - `configurable`：控制属性是否可被删除或重新定义。
- **存取描述符**：包含 `get` 和 `set` 函数。
  - `get`：访问属性时调用的函数。
  - `set`：属性值被修改时调用的函数。

### 总结

- `Object.defineProperty()` 方法提供了更精细的控制来定义或修改对象的属性。
- 描述符允许开发者控制属性的可配置性、可枚举性、值的可写性，以及是否需要 getter 和 setter。
- 使用这些选项可以创建更安全、更易于管理的对象属性。

<details>
<summary>参考答案</summary>

Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

该方法接受三个参数，第一个参数是 obj：要定义属性的对象，第二个参数是 prop：要定义或修改的属性的名称或 Symbol，第三个参数是 descriptor：要定义或修改的属性描述符。

```javascript
const obj = {};
Object.defineProperty(obj, "property", { value: 18 });
console.log(obj.property); // 18
```

虽然我们可以直接添加属性和值，但是使用这种方式，我们能进行更多的配置。

函数的第三个参数 descriptor 所表示的属性描述符有两种形式：数据描述符和存取描述符。数据描述符是一个具有值的属性，该值可以是可写的，也可以是不可写的。存取描述符是由 getter 函数和 setter 函数所描述的属性。一个描述符只能是这两者其中之一；不能同时是两者。

这两种同时拥有下列两种键值：

* configurable：是否可以删除目标属性或是否可以再次修改属性的特性（writable, configurable, enumerable）。设置为true可以被删除或可以重新设置特性；设置为false，不能被可以被删除或不可以重新设置特性。默认为false。
* enumerable：当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中。默认为 false。

```javascript
const obj = { property: 24 };
Object.defineProperty(obj, "property", { configurable: true });
delete obj["property"]; // true
obj; // {}
// 改变状态
const obj = { property: 24 };
Object.defineProperty(obj, "property", { configurable: false });
delete obj["property"]; // false
obj; // {'property': 24}
```

```javascript
const obj = { property1: 24, property2: 34, property3: 54 };
Object.defineProperty(obj, "property1", { enumerable: true });
for (i in obj) {
  console.log(i);
}
// property1
// property2
// property3
// 改状态

Object.defineProperty(obj, "property1", { enumerable: false });
for (i in obj) {
  console.log(i);
}
// property2
// property3

```

数据描述符还具有以下可选键值：

* value：该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。
* writable：当且仅当该属性的 writable 键值为 true 时，属性的值，也就是上面的 value，才能被赋值运算符改变。默认为 false。

```javascript
const obj = {};
Object.defineProperty(obj, "property1", { value: 18 });
obj; // {'property1': 18}
```

```javascript
const obj = {};
Object.defineProperty(obj, "property1", { value: 18, writable: false });
obj.property1 = 24;
obj; // {'property1': 18}

// 改变状态
const obj = {};
Object.defineProperty(obj, "property1", { value: 18, writable: true });
obj.property1 = 24;
obj; // {'property1': 24}

```

存取描述符还具有以下可选键值：

* get：属性的 getter 函数，如果没有 getter，则为 undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的 this 并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。默认为 undefined。
* set：属性的 setter 函数，如果没有 setter，则为 undefined。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象。默认为 undefined。

```javascript
const obj = {};
Object.defineProperty(obj, "property1", {
  get(value) {
    return value;
  },
  set(newValue) {
    value = newValue;
  },
});

```

</details>

## 321. ES6中的 Reflect 对象有什么用？ {#question-18682a73-0c4e-4859-96fd-2a6fde7587b7}

> 难度：3 · 类型：QA

### 题目要点

### Reflect 对象

- **定义**：Reflect 对象不是构造函数，因此在创建时不需要使用 `new` 关键字。
- **目的**：
  1. **统一内部方法**：将一些明显属于语言内部的方法（如 `Object.defineProperty`）从 `Object` 对象转移到 `Reflect` 对象上。
  2. **改进方法行为**：修改某些 `Object` 方法的返回结果，使其行为更合理。
  3. **命令式操作函数化**：将某些 `Object` 操作（如 `name in obj` 和 `delete obj[name]`）转换为函数行为。
  4. **与 Proxy 对象对应**：Reflect 对象的方法与 Proxy 对象的方法一一对应，提供了一种调用默认行为的机制。

### Reflect 对象与 Proxy 对象

- **对应关系**：Reflect 对象的方法与 Proxy 对象的方法一一对应。
- **功能**：Proxy 对象通过调用对应的 Reflect 方法来执行默认行为，同时可以修改行为。

<details>
<summary>参考答案</summary>

Reflect 对象不是构造函数，所以创建时不是用 new 来进行创建。

在 ES6 中增加这个对象的目的：

- 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
- 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc)则会返回 false。
- 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name]，而 Reflect.has(obj, name)和 Reflect.deleteProperty(obj, name)让它们变成了函数行为。
- Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

```javascript
var loggedObj = new Proxy(obj, {
  get(target, name) {
    console.log("get", target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log("delete" + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log("has" + name);
    return Reflect.has(target, name);
  },
});

```

上面代码中，每一个 Proxy 对象的拦截操作（get、delete、has），内部都调用对应的 Reflect 方法，保证原生行为能够正常执行。添加的工作，就是将每一个操作输出一行日志。

</details>

## 322. 什么是尾调用优化和尾递归？ {#question-246fb719-7819-481e-943d-480a219e29b4}

> 难度：2 · 类型：QA

### 题目要点

### 尾调用的定义

- **概念**：尾调用是指函数的最后一步是调用另一个函数。
- **示例**：`function f(x){ return g(x); }`，其中函数 `f` 的最后一步是调用 `g`。
- **非尾调用**：
  - `function f(x){ let y = g(x); return y; }`：调用 `g` 后还有其他操作。
  - `function f(x){ return g(x) + 1; }`：调用 `g` 后还有其他操作，即使写在一行内。

### 尾调用优化

- **调用记录**：函数调用会在内存中形成一个调用记录，即调用帧，用于保存调用位置和内部变量等信息。
- **优化机制**：由于尾调用是函数的最后一步，不需要保留外层函数的调用记录，只保留内层函数的调用记录。
- **内存节省**：优化后，每次执行时只保留一项调用记录，大大节省内存。

### 尾递归

- **定义**：函数调用自身称为递归，如果尾调用自身，就称为尾递归。
- **优化意义**：由于尾递归只存在一个调用记录，所以永远不会发生栈溢出错误。
- **示例**：阶乘函数 `factorial` 可以从非尾递归优化为尾递归，从而避免栈溢出问题。

### ES6 对尾调用的支持

- **规定**：ES6 明确规定，所有 ECMAScript 的实现都必须部署尾调用优化。
- **应用**：这意味着在 ES6 中，只要使用尾递归，就不会发生栈溢出，相对节省内存。

### 总结

- 尾调用是指函数的最后一步是调用另一个函数。
- 尾调用优化允许只保留内层函数的调用记录，从而节省内存。
- 尾递归是尾调用的特殊情况，即函数调用自身。
- ES6 明确规定了尾调用优化的支持，使得尾递归成为一种高效且安全的递归方式。

<details>
<summary>参考答案</summary>

## 什么是尾调用？

尾调用的概念非常简单，一句话就能说清楚，就是指某个函数的最后一步是调用另一个函数。

```javascript
function f(x){
  return g(x);
}
```

上面代码中，函数f的最后一步是调用函数g，这就叫尾调用。

以下两种情况，都不属于尾调用。

```javascript
// 情况一
function f(x){
  let y = g(x);
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
}
```

上面代码中，情况一是调用函数g之后，还有别的操作，所以不属于尾调用，即使语义完全一样。情况二也属于调用后还有操作，即使写在一行内。

尾调用不一定出现在函数尾部，只要是最后一步操作即可。

```
function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}
```

上面代码中，函数m和n都属于尾调用，因为它们都是函数f的最后一步操作。

## 尾调用优化

尾调用之所以与其他调用不同，就在于它的特殊的调用位置。

我们知道，函数调用会在内存形成一个"调用记录"，又称"调用帧"（call frame），保存调用位置和内部变量等信息。如果在函数A的内部调用函数B，那么在A的调用记录上方，还会形成一个B的调用记录。等到B运行结束，将结果返回到A，B的调用记录才会消失。如果函数B内部还调用函数C，那就还有一个C的调用记录栈，以此类推。所有的调用记录，就形成一个"调用栈"（call stack）。

尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用记录，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用记录，取代外层函数的调用记录就可以了。

```javascript
function f() {
  let m = 1;
  let n = 2;
  return g(m + n);
}
f();

// 等同于
function f() {
  return g(3);
}
f();

// 等同于
g(3);
```

上面代码中，如果函数g不是尾调用，函数f就需要保存内部变量m和n的值、g的调用位置等信息。但由于调用g之后，函数f就结束了，所以执行到最后一步，完全可以删除 f() 的调用记录，只保留 g(3) 的调用记录。

这就叫做"尾调用优化"（Tail call optimization），即只保留内层函数的调用记录。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用记录只有一项，这将大大节省内存。这就是"尾调用优化"的意义。

## 尾递归

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。

递归非常耗费内存，因为需要同时保存成千上百个调用记录，很容易发生"栈溢出"错误（stack overflow）。但对于尾递归来说，由于只存在一个调用记录，所以永远不会发生"栈溢出"错误。

```javascript
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```

上面代码是一个阶乘函数，计算n的阶乘，最多需要保存n个调用记录，复杂度 O(n) 。

如果改写成尾递归，只保留一个调用记录，复杂度 O(1) 。

```javascript
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

"尾调用优化"对递归操作意义重大，所以一些函数式编程语言将其写入了语言规格。ES6也是如此，第一次明确规定，所有 ECMAScript 的实现，都必须部署"尾调用优化"。这就是说，在 ES6 中，只要使用尾递归，就不会发生栈溢出，相对节省内存。

</details>

## 323. 简单介绍下 ES6 中的 Iterator 迭代器 {#question-c188ea2f-8882-413c-af52-3ccce36f35cf}

> 难度：3 · 类型：QA

### 题目要点

### Iterator 迭代器的作用

- **定义**：Iterator 迭代器是为了解决不同数据结构遍历问题而设计的，它提供了一个统一的访问机制。
- **数据结构**：目前 Map、Set、Array 都支持 Iterator。
- **接口**：迭代器提供了一个统一的接口，使得不同数据结构的遍历方式一致。
- **for...of 依赖**：for...of 循环依赖于 Iterator 迭代器来实现遍历。

### Iterator 规范

- **规范定义**：Iterator 规范定义了迭代器必须有一个 `next()` 方法。
- **next 方法返回**：`next()` 方法调用时，返回一个包含 `value` 和 `done` 属性的对象。
- **可迭代对象**：要成为可迭代对象，一个对象必须实现 `@@iterator` 方法，该方法可以通过 `Symbol.iterator` 访问。
- **应用场景**：通过定义一个对象的 `Symbol.iterator` 属性，可以将其修改为迭代器对象，支持 `for...of` 遍历。

### 总结

- Iterator 迭代器提供了一个统一的接口，为不同的数据结构提供了统一的访问机制。
- 通过定义对象的 `Symbol.iterator` 属性，可以使其成为可迭代对象，支持 `for...of` 遍历。
- Iterator 规范定义了迭代器必须有一个 `next()` 方法，该方法返回包含 `value` 和 `done` 属性的对象。

<details>
<summary>参考答案</summary>

想必大家使用过for循环、while循环等，遍历Array获取其中的值，那其他数据结构如何通过遍历获取呢？或者这样说，是否可以提供一个统一的访问机制？来访问Object、Map、Set等。

轮到Iterator迭代器出场，Iterator迭代器就是为了解决这个问题，它提供统一的接口，为不同的数据结构提供统一的访问机制。(目前Map、Set、Array支持Iterator)。

顾名思义，Iterator迭代器的出现就是为了迭代而生，为不同的集合：Object、Array、Map、Set，提供了一个统一的接口（这里接口可以简单的理解为方法，就是遍历方法）。像我们常用的for...of就是依赖与Iterator迭代器。

在这里顺便提一嘴，我理解到的遍历、迭代的关系：遍历就是访问数据结构的所有元素，而迭代是遍历的一种形式。

```javascript
// 阮一峰 ECMAScript 6 入门
// 模拟next方法返回值
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true}
    }
  }
}
```

上面的makeIterator函数，它就是一个迭代器生成函数，作用就是返回一个迭代器对象。对数组执行这个函数，就会返回该数组的迭代器对象it。

通过调用next函数，返回value和done两个属性；value属性返回当前位置的成员，done属性是一个布尔值，表示遍历是否结束，即是否还有必要再一次调用next方法；当done为true时，即遍历完成。

小结：Iterator迭代器就是一个接口方法，它为不同的数据结构提供了一个统一的访问机制；使得数据结构的成员能够按某种次序排列，并逐个被访问。

## Iterator规范

在上面的代码中，迭代器对象it包含一个next() 方法，调用next()方法，返回两个属性：布尔值done和值value，value的类型无限制。

迭代器对象包含的属性我们知道了，那么在日常开发中，我们如何让一个对象成为一个可迭代对象呢？（可迭代对象即支持迭代器规范的对象）

要成为可迭代对象， 一个对象必须实现@@iterator方法。这意味着对象（或者它原型链上的某个对象）必须有一个键为@@iterator的属性，可通过常量 Symbol.iterator 访问该属性。

```javascript
let myIterable = {
    a: 1,
    b: 2,
    c: 3
}
myIterable[Symbol.iterator] = function() {
  let self = this;
  let arr = Object.keys(self);
  let index = 0;
  return {
    next() {
      return index < arr.length ? {value: self[arr[index++]], done: false} : {value: undefined, done: true};
    }
  }
}

var it = myIterable[Symbol.iterator]();

it.next();

for(const i of myIterable) {
  console.log(i);
}
```

将myIterable对象添加Symbol.iterator属性，同时在返回的next方法中，添加两个属性，既让它成为了一个可迭代对象。（其实如果真的有这样的需求，可以考虑使用Map）。

小结：Iterator规范————Iterator迭代器包含一个next()方法，方法调用返回返回两个属性：done和value；通过定义一个对象的Symbol.iterator属性，即可将此对象修改为迭代器对象，支持for...of遍历。

</details>

## 324. js对象中，可枚举性（enumerable）是什么？ {#question-83b73455-d22c-43ac-844d-d92c5ac6b662}

> 难度：3 · 类型：QA

### 题目要点

可枚举性（enumerable）用来控制所描述的属性，是否将被包括在for...in循环之中（除非属性名是一个Symbol）。具体来说，如果一个属性的enumerable为false，下面三个操作不会取到该属性。

<details>
<summary>参考答案</summary>

可枚举性（enumerable）用来控制所描述的属性，是否将被包括在for...in循环之中（除非属性名是一个Symbol）。具体来说，如果一个属性的enumerable为false，下面三个操作不会取到该属性。

* for..in循环
* Object.keys方法
* JSON.stringify方法

```javascript
var o = { a: 1, b: 2 };

o.c = 3;
Object.defineProperty(o, "d", {
  value: 4,
  enumerable: false,
});

o.d;
// 4

for (var key in o) console.log(o[key]);
// 1
// 2
// 3

Object.keys(o); // ["a", "b", "c"]

JSON.stringify(o); // => "{a:1,b:2,c:3}"
```

上面代码中，d属性的enumerable为false，所以一般的遍历操作都无法获取该属性，使得它有点像“秘密”属性，但还是可以直接获取它的值。

至于for...in循环和Object.keys方法的区别，在于前者包括对象继承自原型对象的属性，而后者只包括对象本身的属性。如果需要获取对象自身的所有属性，不管enumerable的值，可以使用Object.getOwnPropertyNames方法。

可枚举属性是指那些内部 “可枚举” 标志设置为 true 的属性。对于通过直接的赋值和属性初始化的属性，该标识值默认为即为 true。但是对于通过 Object.defineProperty 等定义的属性，该标识值默认为 false。

</details>

## 325. forEach 中能否使用 await ？ {#question-d1d9bc22-287a-4fb0-9860-51fb461006de}

> 难度：3 · 类型：QA

### 题目要点

在JavaScript中，forEach 方法用于对数组中的每个元素执行一次提供的函数。然而，forEach 方法本身并不支持异步操作，也就是说，它不能在内部使用 await 关键字。await 只能在异步函数（使用 async 声明的函数）中使用。

如果你需要在循环中执行异步操作并等待每个操作完成，你应该使用 for...of 循环或 Promise.all 结合 map 方法。

#### 使用 for...of 循环

```js
async function processArray(array) {
  for (const item of array) {
    await someAsyncFunction(item); // 等待异步函数完成
  }
}
```

#### 使用 Promise.all 结合 map

如果你想要并行执行所有的异步操作，可以使用 map 方法来创建一个Promise数组，然后使用 Promise.all 等待它们全部完成。

```js
async function processArray(array) {
  const promises = array.map(item => someAsyncFunction(item)); // 创建Promise数组
  await Promise.all(promises); // 等待所有Promise完成
}
```

<details>
<summary>参考答案</summary>

```javascript
function test() {
  let arr = [3, 2, 1];
  arr.forEach(async (item) => {
    const res = await fetch(item);
    console.log(res);
  });
  console.log("end");
}

function fetch(x) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(x);
    }, 500 * x);
  });
}

test();
```

上面代码的输出结果是：

```javascript
end
1
2
3
```

## 为什么

其实原因很简单，那就是 forEach 只支持同步代码。

我们可以参考下 Polyfill 版本的 forEach，简化以后类似就是这样的伪代码

```javascript
while (index < arr.length) {
    callback(item, index)   //也就是我们传入的回调函数
}
```

从上述代码中我们可以发现，forEach 只是简单的执行了下回调函数而已，并不会去处理异步的情况。 并且即使你在 callback 中使用 break 也并不能结束遍历。

## 怎么解决

一般来说解决的办法有2种：

* for...of

因为 for...of 内部处理的机制和 forEach 不同，forEach 是直接调用回调函数，for...of 是通过迭代器的方式去遍历。

```javascript
async function test() {
  let arr = [3, 2, 1];
  for (const item of arr) {
    const res = await fetch(item);
    console.log(res);
  }
  console.log("end");
}
```

* for循环

```javascript
async function test() {
  let arr = [3, 2, 1];
  for (var i = 0; i < arr.length; i++) {
    const res = await fetch(arr[i]);
    console.log(res);
  }
  console.log("end");
}

function fetch(x) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(x);
    }, 500 * x);
  });
}

test();
```

</details>

## 326. 如何中断Promise？ {#question-ee457290-82ef-4c2b-b2f1-e6b1b28e9166}

> 难度：2 · 类型：QA

### 题目要点

首先我们要搞清楚一点，`Promise`有一个很明显的缺点：**一旦创建就无法取消**。所以从本质上来说`Promise`一旦创建就无法终止。这一点我们在答题的时候一定要提到。

## 思路

1.  当函数返回一个新的`Promise`对象时，原`Promise`对象的状态将跟新对象保持一致，因此，当新对象保持`Pending`状态时，原`Promise`链将会中止执行，所以我们可以利用这一特性中断调用链。
2.  把`pending`状态的`Promise`给`reject`掉，这个应该是比较熟悉的吧，不就是我们平时设置的网络超时吗，利用这一点也可以实中断`Promise`。
3.  在`then`中直接抛错，这样就不会执行后面的`then`，直接跳到`catch`方法打印`error`。

## 实现:

* 当新对象保持pending状态时，原Promise链会中止执行

```js
Promise.resolve().then(() => {
    console.log('1')
    return new Promise(() => {})
})
.then(() => console.log('2'))
.then(() => console.log('3'))
.catch((err) => console.log(err))
```

* 设置超时时间，一旦超时就中断，我们可以用定时器模拟一个网络请求,利用Promise.race()

```js
function fun(p,timeout) {
    const wait = new Promise((resolve,reject) => {
        setTimeout(() => {
            reject('请求超时')
        },timeout)
    })
    return Promise.race([p, wait])
}
fun(new Promise(() => console.log('1')), 2000)
```

* 在then中直接抛错

```js
Promise.resolve()
.then(() => console.log('1'))
.then(() => {
    console.log('2')
    throw '错误'
})
.then(() => console.log('3'))
.catch((err) => console.log(err))
```

**其实并不推荐这种做法，因为如果链路中对错误进行了捕获，后面的then函数还是会继续执行的。**

<details>
<summary>参考答案</summary>

Promise 有个缺点就是一旦创建就无法取消，所以本质上 Promise 是无法被终止的，但我们在开发过程中可能会遇到下面两个需求：

* 中断调用链

就是在某个 then/catch 执行之后，不想让后续的链式调用继续执行了。

```
somePromise
  .then(() => {})
  .then(() => {
    // 终止 Promise 链，让下面的 then、catch 和 finally 都不执行
  })
  .then(() => console.log('then'))
  .catch(() => console.log('catch'))
  .finally(() => console.log('finally'))
```

一种方法是在then中直接抛错, 这样就不会执行后面的then, 直接跳到catch方法打印err(但此方法并没有实际中断)。但如果链路中对错误进行了捕获，后面的then函数还是会继续执行。

Promise的then方法接收两个参数：
```javascript
Promise.prototype.then(onFulfilled, onRejected)
```

若onFulfilled或onRejected是一个函数，当函数返回一个新Promise对象时，原Promise对象的状态将跟新对象保持一致，详见Promises/A+标准。

因此，当新对象保持“pending”状态时，原Promise链将会中止执行。

```javascript
Promise.resolve().then(() => {
    console.log('then 1')
    return new Promise(() => {})
}).then(() => {
    console.log('then 2')
}).then(() => {
    console.log('then 3')
}).catch((err) => {
    console.log(err)
})
```

* 中断Promise

注意这里是中断而不是终止，因为 Promise 无法终止，这个中断的意思是：在合适的时候，把 pending 状态的 promise 给 reject 掉。例如一个常见的应用场景就是希望给网络请求设置超时时间，一旦超时就就中断，我们这里用定时器模拟一个网络请求，随机 3 秒之内返回。

```javascript
function timeoutWrapper(p, timeout = 2000) {
  const wait = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('请求超时')
    }, timeout)
  })
  return Promise.race([p, wait])
}
```

</details>

## 327. Object.create 和 new 有什么区别？ {#question-025b1291-525e-4605-ac8a-6a53baf94d5d}

> 难度：3 · 类型：QA

### 题目要点

- **`Object.create`** 主要用于基于一个现有对象创建一个新对象，设置其原型，并可以指定新的属性。它不涉及构造函数的执行。
- **`new`** 用于创建构造函数的实例，执行构造函数的逻辑，并将新对象的原型链接到构造函数的 `prototype` 上。

<details>
<summary>参考答案</summary>

js中创建对象的方式一般有两种Object.create和new

```javascript
const Base = function(){};
const o1 = Object.create(Base);
const o2 = new Base();
```

在讲述两者区别之前，我们需要知道：

* 构造函数Foo的原型属性Foo.prototype指向了原型对象。
* 原型对象保存着实例共享的方法，有一个指针constructor指回构造函数。
* js中只有函数有 prototype 属性，所有的对象只有 __proto__ 隐式属性。

那这样到底有什么不一样呢？

## Object.create

先来看看 `Object.create` 的实现方式

```javascript
Object.create =  function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
};
```

可以看出来。Object.create是内部定义一个对象，并且让F.prototype对象 赋值为引进的对象/函数 o，并return出一个新的对象。

## new

再看看 `const o2 = new Base()` 的时候，new做了什么。

```javascript
var o1 = new Object();
o1.[[Prototype]] = Base.prototype;
Base.call(o1);
```

new做法是新建一个obj对象o1，并且让o1的__proto__指向了Base.prototype对象。并且使用 call 进行强转作用环境。从而实现了实例的创建。

## 区别

看似是一样的。我们对原来的代码进行改进一下。

```javascript
var Base = function () {
    this.a = 2
}
var o1 = new Base();
var o2 = Object.create(Base);
console.log(o1.a); // 2
console.log(o2.a); // undefined
```

可以看到Object.create 失去了原来对象的属性的访问。

再进行下改造：
```javascript
var Base = function () {
    this.a = 2
}
Base.prototype.a = 3;
var o1 = new Base();
var o2 = Object.create(Base);
console.log(o1.a); // 2
console.log(o2.a); // undefined
```

## 小结

小结

|比较|new|Object.create|
|--|--|--|
|构造函数|保留原构造函数属性|丢失原构造函数属性|
|原型链|原构造函数prototype属性|原构造函数/（对象）本身|
|作用对象|function|function和object|

</details>

## 328. 堆与栈有什么区别？ {#question-adfb6812-fe80-4875-ae6f-bbcaab8e1a9e}

> 难度：2 · 类型：QA

### 题目要点

## 堆与栈的区别

堆（Heap）和栈（Stack）是计算机内存管理中的两种不同数据结构，具有以下主要区别：

### 栈（Stack）

- **数据结构**：遵循后进先出（LIFO）原则。
- **内存分配**：自动和快速，用于存储局部变量和函数调用上下文。
- **访问速度**：由于内存连续，访问速度快。
- **生命周期**：数据（如局部变量）在函数调用结束时自动销毁。
- **内存管理**：自动释放，不需要垃圾回收。

### 堆（Heap）

- **数据结构**：任意分配，非连续内存。
- **内存分配**：手动分配和释放，速度相对较慢。
- **访问速度**：可能较慢，因为内存可能不连续。
- **生命周期**：需要手动管理或通过垃圾回收机制处理。
- **内存管理**：通常需要垃圾回收器来识别和回收不再使用的对象。

### 区别总结

- **数据结构**：栈是LIFO结构，堆是任意分配的结构。
- **内存分配**：栈内存分配快速且自动，堆内存分配较慢且手动。
- **访问速度**：栈通常提供更快的数据访问速度。
- **生命周期管理**：栈上的数据生命周期明确，堆上的数据需要手动管理或垃圾回收。
- **使用场景**：栈通常用于函数调用和局部变量存储，堆用于动态内存分配。

<details>
<summary>参考答案</summary>

堆（Heap）与栈（Stack）是开发人员必须面对的两个概念，在理解这两个概念时，需要放到具体的场景下，因为不同场景下，堆与栈代表不同的含义。一般情况下，有两层含义：

- 程序内存布局场景下，堆与栈表示两种内存管理方式；
- 数据结构场景下，堆与栈表示两种常用的数据结构。

## 程序内存分区中的堆与栈

### 栈简介
栈由操作系统自动分配释放 ，用于存放函数的参数值、局部变量等，其操作方式类似于数据结构中的栈。

其中函数中定义的局部变量按照先后定义的顺序依次压入栈中，也就是说相邻变量的地址之间不会存在其它变量。栈的内存地址生长方向与堆相反，由高到底，所以后定义的变量地址低于先定义的变量，比如上面代码中变量 s 的地址小于变量 b 的地址，p2 地址小于 s 的地址。栈中存储的数据的生命周期随着函数的执行完成而结束。

### 堆简介

堆由开发人员分配和释放， 若开发人员不释放，程序结束时由 OS 回收，分配方式类似于链表。

堆的内存地址生长方向与栈相反，由低到高，但需要注意的是，后申请的内存空间并不一定在先申请的内存空间的后面，即 p2 指向的地址并不一定大于 p1 所指向的内存地址，原因是先申请的内存空间一旦被释放，后申请的内存空间则会利用先前被释放的内存，从而导致先后分配的内存空间在地址上不存在先后关系。堆中存储的数据若未释放，则其生命周期等同于程序的生命周期。

关于堆上内存空间的分配过程，首先应该知道操作系统有一个记录空闲内存地址的链表，当系统收到程序的申请时，会遍历该链表，寻找第一个空间大于所申请空间的堆节点，然后将该节点从空闲节点链表中删除，并将该节点的空间分配给程序。另外，对于大多数系统，会在这块内存空间中的首地址处记录本次分配的大小，这样，代码中的delete语句才能正确地释放本内存空间。由于找到的堆节点的大小不一定正好等于申请的大小，系统会自动地将多余的那部分重新放入空闲链表。

### 堆与栈区别

堆与栈实际上是操作系统对进程占用的内存空间的两种管理方式，主要有如下几种区别：

（1）管理方式不同。栈由操作系统自动分配释放，无需我们手动控制；堆的申请和释放工作由程序员控制，容易产生内存泄漏；

（2）空间大小不同。每个进程拥有的栈的大小要远远小于堆的大小。理论上，程序员可申请的堆大小为虚拟内存的大小，进程栈的大小 64bits 的 Windows 默认 1MB，64bits 的 Linux 默认 10MB；

（3）生长方向不同。堆的生长方向向上，内存地址由低到高；栈的生长方向向下，内存地址由高到低。

（4）分配方式不同。堆都是动态分配的，没有静态分配的堆。栈有2种分配方式：静态分配和动态分配。静态分配是由操作系统完成的，比如局部变量的分配。动态分配由alloca函数进行分配，但是栈的动态分配和堆是不同的，他的动态分配是由操作系统进行释放，无需我们手工实现。

（5）分配效率不同。栈由操作系统自动分配，会在硬件层级对栈提供支持：分配专门的寄存器存放栈的地址，压栈出栈都有专门的指令执行，这就决定了栈的效率比较高。堆则是由C/C++提供的库函数或运算符来完成申请与管理，实现机制较为复杂，频繁的内存申请容易产生内存碎片。显然，堆的效率比栈要低得多。

（6）存放内容不同。栈存放的内容，函数返回地址、相关参数、局部变量和寄存器内容等。当主函数调用另外一个函数的时候，要对当前函数执行断点进行保存，需要使用栈来实现，首先入栈的是主函数下一条语句的地址，即扩展指针寄存器的内容（EIP），然后是当前栈帧的底部地址，即扩展基址指针寄存器内容（EBP），再然后是被调函数的实参等，一般情况下是按照从右向左的顺序入栈，之后是被调函数的局部变量，注意静态变量是存放在数据段或者BSS段，是不入栈的。出栈的顺序正好相反，最终栈顶指向主函数下一条语句的地址，主程序又从该地址开始执行。堆，一般情况堆顶使用一个字节的空间来存放堆的大小，而堆中具体存放内容是由程序员来填充的。

从以上可以看到，堆和栈相比，由于大量malloc()/free()或new/delete的使用，容易造成大量的内存碎片，并且可能引发用户态和核心态的切换，效率较低。栈相比于堆，在程序中应用较为广泛，最常见的是函数的调用过程由栈来实现，函数返回地址、EBP、实参和局部变量都采用栈的方式存放。虽然栈有众多的好处，但是由于和堆相比不是那么灵活，有时候分配大量的内存空间，主要还是用堆。

无论是堆还是栈，在内存使用时都要防止非法越界，越界导致的非法内存访问可能会摧毁程序的堆、栈数据，轻则导致程序运行处于不确定状态，获取不到预期结果，重则导致程序异常崩溃，这些都是我们编程时与内存打交道时应该注意的问题。

## 数据结构中的堆与栈

数据结构中，堆与栈是两个常见的数据结构，理解二者的定义、用法与区别，能够利用堆与栈解决很多实际问题。

### 栈简介

栈是一种运算受限的线性表，其限制是指只仅允许在表的一端进行插入和删除操作，这一端被称为栈顶（Top），相对地，把另一端称为栈底（Bottom）。把新元素放到栈顶元素的上面，使之成为新的栈顶元素称作进栈、入栈或压栈（Push）；把栈顶元素删除，使其相邻的元素成为新的栈顶元素称作出栈或退栈（Pop）。这种受限的运算使栈拥有“先进后出”的特性（First In Last Out），简称FILO。

栈分顺序栈和链式栈两种。栈是一种线性结构，所以可以使用数组或链表（单向链表、双向链表或循环链表）作为底层数据结构。使用数组实现的栈叫做顺序栈，使用链表实现的栈叫做链式栈，二者的区别是顺序栈中的元素地址连续，链式栈中的元素地址不连续。

栈的基本操作包括初始化、判断栈是否为空、入栈、出栈以及获取栈顶元素等。

### 堆简介

堆是一种常用的树形结构，是一种特殊的完全二叉树，当且仅当满足所有节点的值总是不大于或不小于其父节点的值的完全二叉树被称之为堆。堆的这一特性称之为堆序性。因此，在一个堆中，根节点是最大（或最小）节点。如果根节点最小，称之为小顶堆（或小根堆），如果根节点最大，称之为大顶堆（或大根堆）。堆的左右孩子没有大小的顺序。

堆的存储一般都用数组来存储堆，i节点的父节点下标就为( i – 1 ) / 2 (i – 1) / 2(i–1)/2。它的左右子节点下标分别为 2 ∗ i + 1 2 * i + 12∗i+1 和 2 ∗ i + 2 2 * i + 22∗i+2。如第0个节点左右子节点下标分别为1和2。

</details>

## 329. “严格模式”是什么？ {#question-54538af6-dc63-4f34-a9c9-0d76482e5558}

> 难度：1 · 类型：QA

### 题目要点

除了正常运行模式，ECMAscript 5添加了第二种运行模式："严格模式"（strict mode）。顾名思义，这种模式使得Javascript在更严格的条件下运行。

<details>
<summary>参考答案</summary>

除了正常运行模式，ECMAscript 5添加了第二种运行模式："严格模式"（strict mode）。顾名思义，这种模式使得Javascript在更严格的条件下运行。

设立"严格模式"的目的，主要有以下几个：

```
- 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;
- 消除代码运行的一些不安全之处，保证代码运行的安全；
- 提高编译器效率，增加运行速度；
- 为未来新版本的Javascript做好铺垫。
```

"严格模式"体现了Javascript更合理、更安全、更严谨的发展方向，包括IE 10在内的主流浏览器，都已经支持它，许多大项目已经开始全面拥抱它。

另一方面，同样的代码，在"严格模式"中，可能会有不一样的运行结果；一些在"正常模式"下可以运行的语句，在"严格模式"下将不能运行。掌握这些内容，有助于更细致深入地理解Javascript，让你变成一个更好的程序员。

</details>

## 330. 为什么部分请求中，参数需要使用 encodeURIComponent 进行转码？ {#question-ea7dbe32-726d-4d21-a9bc-3df77e1ec853}

> 难度：3 · 类型：QA

### 题目要点

URL（统一资源定位符）在构成上有着严格的限制，只能使用英文字母（a-z，A-Z）、阿拉伯数字（0-9）以及某些特定的标点符号。这一限制源于网络标准RFC 1738的规定，该标准明确指出，URL中只能使用字母数字字符、特定的特殊字符（如"$-_.+!*'(),"，不包括引号），以及用于其预定目的的保留字符。

由于这一规定，URL中不能直接使用汉字或其他非ASCII字符。如果URL中包含这些字符，就必须进行编码处理。然而，RFC 1738并没有为URL编码指定一个统一的方法，而是将编码的实现交给了应用程序（如浏览器）自行决定。这导致了URL编码领域的混乱，因为不同的操作系统、浏览器和网页字符集可能会导致完全不同的编码结果。

为了确保客户端向服务器发送的数据格式统一，可以使用Javascript进行URL编码。Javascript提供以下三个函数用于URL编码：

1. **escape()**：这是最古老的Javascript编码函数，它对ASCII字母、数字和特定标点符号（"@ * _ + - . /"）之外的字符进行编码。虽然这个函数现在已经不推荐使用，但由于历史原因，它在一些地方仍然被采用。

2. **encodeURI()**：这个函数是专门用于对整个URL进行编码的。它不会对ASCII字母、数字、特定标点符号以及URL中有特殊含义的符号（如"; / ? : @ & = + $ , #"）进行编码。编码后，它会输出符号的UTF-8形式，并在每个字节前加上"%"符号。

3. **encodeURIComponent()**：这个函数用于对URL的组成部分进行个别编码，而不是对整个URL进行编码。与encodeURI()不同的是，encodeURIComponent()会对"; / ? : @ & = + $ , #"这些在encodeURI()中不被编码的符号进行编码。具体的编码方法与encodeURI()相同。

对于解码，encodeURIComponent()函数对应的解码函数是**decodeURIComponent()**，它用于将encodeURIComponent()编码的字符串解码回原始形式。

总结来说，为了避免因不同浏览器和系统导致的URL编码不一致问题，可以使用Javascript的encodeURI()和encodeURIComponent()函数来确保URL编码的统一性，并通过decodeURIComponent()函数进行相应的解码。

<details>
<summary>参考答案</summary>

一般来说，URL只能使用英文字母、阿拉伯数字和某些标点符号，不能使用其他文字和符号。

这是因为网络标准RFC 1738做了硬性规定：

> "...Only alphanumerics [0-9a-zA-Z], the special characters "$-_.+!*'()," [not including the quotes - ed], and reserved characters used for their reserved purposes may be used unencoded within a URL."

这意味着，如果URL中有汉字，就必须编码后使用。但是麻烦的是，RFC 1738没有规定具体的编码方法，而是交给应用程序（浏览器）自己决定。这导致"URL编码"成为了一个混乱的领域。

不同的操作系统、不同的浏览器、不同的网页字符集，将导致完全不同的编码结果。如果程序员要把每一种结果都考虑进去，是不是太恐怖了？有没有办法，能够保证客户端只用一种编码方法向服务器发出请求？

就是使用Javascript先对URL编码，然后再向服务器提交，不要给浏览器插手的机会。因为Javascript的输出总是一致的，所以就保证了服务器得到的数据是格式统一的。

Javascript语言用于编码的函数，一共有三个，最古老的一个就是escape()。虽然这个函数现在已经不提倡使用了，但是由于历史原因，很多地方还在使用它，所以有必要先从它讲起。

它的具体规则是，除了ASCII字母、数字、标点符号"@ * _ + - . /"以外，对其他所有字符进行编码。

encodeURI()是Javascript中真正用来对URL编码的函数。

它着眼于对整个URL进行编码，因此除了常见的符号以外，对其他一些在网址中有特殊含义的符号"; / ? : @ & = + $ , #"，也不进行编码。编码后，它输出符号的utf-8形式，并且在每个字节前加上%。

最后一个Javascript编码函数是encodeURIComponent()。与encodeURI()的区别是，它用于对URL的组成部分进行个别编码，而不用于对整个URL进行编码。

因此，"; / ? : @ & = + $ , #"，这些在encodeURI()中不被编码的符号，在encodeURIComponent()中统统会被编码。至于具体的编码方法，两者是一样。

它对应的解码函数是decodeURIComponent()。

</details>

## 331. JS代码中的use strict是什么意思？ {#question-c6027c9d-6c64-4765-9358-5d01c37149c4}

> 难度：2 · 类型：QA

### 题目要点

use strict是一种ECMAscript5添加的(严格）运行模式，这种模式使得Javascript 在更严格的条件下运行。

<details>
<summary>参考答案</summary>

use strict是一种ECMAscript5添加的(严格）运行模式，这种模式使得Javascript 在更严格的条件下运行。

设立"严格模式"的目的，主要有以下几个:

* 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;消除代码运行的一些不安全之处，保证代码运行的安全;
* 提高编译器效率，增加运行速度;
* 为未来新版本的Javascript 做好铺垫。

区别:

* 禁止使用with语句。
* 禁止this关键字指向全局对象。
* 对象不能有重名的属性。

</details>

## 332. 什么是变量提升 {#question-cf3a9965-7761-4d5e-8b0a-cbde804517b8}

> 难度：1.5 · 类型：QA

### 题目要点

函数在运行的时候，会首先创建执行上下文，然后将执行上下文入栈，然后当此执行上下文处于栈顶时，开始运行执行上下文。

<details>
<summary>参考答案</summary>

函数在运行的时候，会首先创建执行上下文，然后将执行上下文入栈，然后当此执行上下文处于栈顶时，开始运行执行上下文。

在创建执行上下文的过程中会做三件事：创建变量对象，创建作用域链，确定 this 指向，其中创建变量对象的过程中，首先会为 arguments 创建一个属性，值为 arguments，然后会扫码 function 函数声明，创建一个同名属性，值为函数的引用，接着会扫码 var 变量声明，创建一个同名属性，值为 undefined，这就是变量提升。

</details>

## 333. 箭头函数和普通函数有啥区别？箭头函数能当构造函数吗？ {#question-71f7613a-3703-4c0c-85c3-d8ad31fac232}

> 难度：3 · 类型：QA

### 题目要点

ES6中允许使用箭头=>来定义箭头函数，具体语法，我们来看一个简单的例子：

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

## 334. WebSocket 中的心跳是为了解决什么问题？ {#question-14ad497b-56ee-461b-8c82-110f4d1c04b0}

> 难度：3 · 类型：QA

### 题目要点

为了定时发送消息，使连接不超时自动断线，避免后端设了超时时间自动断线。所以需要定时发送消息给后端，让后端服务器知道连接还在通消息不能断。

<details>
<summary>参考答案</summary>

* 为了定时发送消息，使连接不超时自动断线，避免后端设了超时时间自动断线。所以需要定时发送消息给后端，让后端服务器知道连接还在通消息不能断。

* 为了检测在正常连接的状态下，后端是否正常。如果我们发了一个定时检测给后端，后端按照约定要下发一个检测消息给前端，这样才是正常的。如果后端没有正常下发，就要根据设定的超时进行重连。

</details>

## 335. 说说对 WebSocket 的了解 {#question-4449a399-c20d-49e7-aac6-05236ee28662}

> 难度：2.5 · 类型：QA

### 题目要点

WebSocket是一种在HTML5中引入的网络技术，允许浏览器与服务器之间进行全双工通信，属于应用层协议。它建立在TCP协议之上，并使用HTTP握手通道。

与HTTP协议相比，WebSocket的优点包括：

- **双向通信**：支持实时双向数据传输，实时性更强。
- **二进制支持**：对二进制数据有更好的支持。
- **控制开销小**：连接建立后，数据交换时的协议控制数据包头部较小，相比HTTP协议，减少了数据传输量。
- **支持扩展**：协议允许用户扩展或实现自定义子协议，如支持自定义压缩算法等，提高了可扩展性。

<details>
<summary>参考答案</summary>

## 什么是WebSocket

HTML5开始提供的一种浏览器与服务器进行全双工通讯的网络技术，属于应用层协议。它基于TCP传输协议，并复用HTTP的握手通道。

## 优点

说到优点，这里的对比参照物是HTTP协议，概括地说就是：支持双向通信，更灵活，更高效，可扩展性更好。

* 支持双向通信，实时性更强。
* 更好的二进制支持。
* 较少的控制开销。连接创建后，ws客户端、服务端进行数据交换时，协议控制的数据包头部较小。在不包含头部的情况下，服务端到客户端的包头只有2~10字节（取决于数据包长度），客户端到服务端的的话，需要加上额外的4字节的掩码。而HTTP协议每次通信都需要携带完整的头部。
* 支持扩展。ws协议定义了扩展，用户可以扩展协议，或者实现自定义的子协议。（比如支持自定义压缩算法等）

</details>

## 336. Service worker是什么？ {#question-f3a5d518-64e1-454a-80ec-5991c4cedeb0}

> 难度：2 · 类型：QA

### 题目要点

service worker是PWA的重要组成部分，W3C 组织早在 2014 年 5 月就提出过 Service Worker 这样的一个 HTML5 API ，主要用来做持久的离线缓存，也是Web Worker的升级版。

<details>
<summary>参考答案</summary>

service worker是PWA的重要组成部分，W3C 组织早在 2014 年 5 月就提出过 Service Worker 这样的一个 HTML5 API ，主要用来做持久的离线缓存，也是Web Worker的升级版。

Service worker (简称 SW) 是一个注册在指定源和路径下的事件驱动 Worker。它采用 JavaScript 控制关联的页面或者网站，拦截并修改访问和资源请求，细粒度地缓存资源。你可以完全控制应用在特定情形（最常见的情形是网络不可用）下的表现。

</details>

## 337. 什么是 PWA？ {#question-eea30dfd-e506-419d-9563-0f4c84abbbe8}

> 难度：3.5 · 类型：QA

### 题目要点

PWA的中文名叫做渐进式网页应用，早在2014年， W3C 公布过 Service Worker 的相关草案，但是其在生产环境被 Chrome 支持是在 2015 年。因此，如果我们把 PWA 的关键技术之一 Service Worker 的出现作为 PWA 的诞生时间，那就应该是 2015 年。

<details>
<summary>参考答案</summary>

PWA的中文名叫做渐进式网页应用，早在2014年， W3C 公布过 Service Worker 的相关草案，但是其在生产环境被 Chrome 支持是在 2015 年。因此，如果我们把 PWA 的关键技术之一 Service Worker 的出现作为 PWA 的诞生时间，那就应该是 2015 年。

自 2015 年以来，PWA 相关的技术不断升级优化，在用户体验和用户留存两方面都提供了非常好的解决方案。PWA 可以将 Web 和 App 各自的优势融合在一起：渐进式、可响应、可离线、实现类似 App 的交互、即时更新、安全、可以被搜索引擎检索、可推送、可安装、可链接。

需要特别说明的是，PWA 不是特指某一项技术，而是应用了多项技术的 Web App。其核心技术包括 App Manifest、Service Worker、Web Push，等等。

</details>

## 338. 如何判断一个对象是不是空对象？ {#question-b343227e-136a-405a-8a9d-b6d92259fa38}

> 难度：2 · 类型：QA

### 题目要点

核心考查：如何判断一个对象是不是空对象？的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```js
// 方法1
Object.keys(obj).length === 0

// 方法2
JSON.stringify(obj) === '{}'
```

</details>

## 339. NaN 是什么，用 typeof 会输出什么？ {#question-f555dca6-fcc1-433c-a4b5-bc0de8dba02b}

> 难度：1 · 类型：QA

### 题目要点

NaN：Not a Number，表示非数字

<details>
<summary>参考答案</summary>

NaN：Not a Number，表示非数字

typeof NaN === 'number'

</details>

## 340. async/await 和 Promise 有什么关系？ {#question-fbcd6444-9c0f-492a-b138-bd205bb4bf1d}

> 难度：3 · 类型：QA

### 题目要点

`async/await` 是 JavaScript 的一种语法糖，它建立在 `Promise` 之上，用于简化异步代码的编写和阅读。

- **`Promise`** 是 JavaScript 中处理异步操作的基本机制。
- **`async/await`** 是基于 `Promise` 的语法糖，使异步代码更简洁、易读。
- `async/await` 使得异步代码的编写更像同步代码，提高了可读性，同时错误处理也变得更为直观。

<details>
<summary>参考答案</summary>

## Promise

> Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象

## async/await

es2017的新语法，async/await就是generator + promise的语法糖

async/await 和 Promise 的关系非常的巧妙，await必须在async内使用，并装饰一个Promise对象，async返回的也是一个Promise对象。

async/await中的return/throw会代理自己返回的Promise的resolve/reject，而一个Promise的resolve/reject会使得await得到返回值或抛出异常。

* 如果方法内无await节点
    * return 一个字面量则会得到一个{PromiseStatus: resolved}的Promise。
    * throw 一个Error则会得到一个{PromiseStatus: rejected}的Promise。

* 如果方法内有await节点
    * async会返回一个{PromiseStatus: pending}的Promise（发生切换，异步等待Promise的执行结果）。
    * Promise的resolve会使得await的代码节点获得相应的返回结果，并继续向下执行。
    * Promise的reject 会使得await的代码节点自动抛出相应的异常，终止向下继续执行。

</details>

## 341. Promise中，resolve后面的语句是否还会执行？ {#question-aaee81ad-a128-4bbf-b60b-aa2c9c3396c3}

> 难度：3 · 类型：QA

### 题目要点

会被执行。如果不需要执行，可以在 resolve 语句前加上 return。

<details>
<summary>参考答案</summary>

在 JavaScript 中，当调用 `Promise.resolve(value)` 后，Promise 会立即变成已解决状态（fulfilled），`value` 会作为结果传递。但`resolve` 后面的语句会继续执行，因为 `resolve` 只是将 Promise 的状态更改为已解决，它不会中断或停止代码的执行。

以下是一个例子：

```javascript
new Promise((resolve, reject) => {
  console.log("Promise started");
  resolve("Resolved value");
  console.log("After resolve");
}).then(value => {
  console.log(value);
});
```

输出是：

```
Promise started
After resolve
Resolved value
```

这表明 `resolve` 后面的 `console.log("After resolve")` 语句确实会被执行。

</details>

## 342. 写一个 LRU 缓存函数 {#question-5ce5c660-5265-4185-8b12-f69d7fd4a270}

> 难度：3 · 类型：QA

### 题目要点

在JavaScript中实现一个LRU（Least Recently Used，最近最少使用）缓存函数，我们可以使用JavaScript的`Map`对象，因为`Map`对象可以保持键值对的插入顺序，这正好符合LRU缓存的需求。当缓存达到容量上限时，我们需要移除最老（最少使用）的元素来为新元素腾出空间。

```javascript
class LRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.capacity = capacity;
    }

    get(key) {
        if (!this.cache.has(key)) {
            return -1; // 或者null，根据你的需要返回
        }
        // 当访问某个元素时，我们认为它是最近使用的，所以删除旧的并重新插入
        let value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            // 如果key已存在，先删除旧的，再插入新的
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // 如果缓存已满，删除最老的元素
            this.cache.delete(this.cache.keys().next().value);
        }
        // 插入新的键值对
        this.cache.set(key, value);
    }
}

// 使用示例
const cache = new LRUCache(2);

cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));       // 返回  1

cache.put(3, 3);                 // 该操作会使密钥 2 作废
console.log(cache.get(2));       // 返回 -1 (未找到)

cache.put(4, 4);                 // 该操作会使密钥 1 作废
console.log(cache.get(1));       // 返回 -1 (未找到)

console.log(cache.get(3));       // 返回  3
console.log(cache.get(4));       // 返回  4
```

<details>
<summary>参考答案</summary>

关于缓存，有个常见的例子是，当用户访问不同站点时，浏览器需要缓存在对应站点的一些信息，这样当下次访问同一个站点的时候，就可以使访问速度变快（因为一部分数据可以直接从缓存读取）。 但是想想内存空间是有限的，所以必须有一些规则来管理缓存的使用，而LRU（Least Recently Used） Cache就是其中之一，直接翻译就是“最不经常使用的数据，重要性是最低的，应该优先删除”。

## 需求分析

假设我们要实现一个简化版的这个功能，先整理下需求：

* 需要提供put方法，用于写入不同的缓存数据，假设每条数据形式是{'域名','info'},例如{'https://segmentfault.com': '一些关键信息'}（如果是同一站点重复写入，就覆盖）;
* 当缓存达到上限时， 调用put写入缓存之前, 要删除最近最少使用的数据；
* 提供get方法，用于读取缓存数据，同时需要把被读取的数据，移动到最近使用数据 ；
* 考虑到读取性能，希望get操作的复杂度是O(1)（简单理解就是，读取缓存时不能去遍历所有数据）

## 数据选型

首先题目里很明显的提到了，需要能够标记数据的插入或使用顺序， 所以肯定不能简单使用object实现，需要借助数组，或者es6的Map和Set实现(Map和Set数据遍历是有序的，遍历顺序即插入顺序)；

其次需要实现O(1)复杂度，那就也无法用单纯使用数组来实现，所以可以考虑的只有Map和Set，那么最后再考虑下数据重复性的问题，会发现这道题不太需要考虑这个场景，所以我们可以先使用Map来实现。

由于Map的特性是：新插入的数据排在后面，旧数据放在前面， 所以我们只要专注于维持这个逻辑就好了:

* 如果遇到要删除数据，则优先从前面删除, 因为最前面的必定是最不常用数据；
* 如果读取某条数据，则应该把数据放到末尾，保证该数据变为最近使用数据；

## 算法实现

接下来就可以一步步是实现代码了，首先是最基本的 构造函数:

```js
// 第一步代码
class LRUCache {
    constructor(n){
        this.size = n; // 初始化最大缓存数据条数n
        this.data = new Map(); // 初始化缓存空间map
    }
}
```

接下来是put方法，put方法要处理3个逻辑：

1、如果待写入的域名，已存在于内存之中，直接更新数据并移动到末尾；
2、如果当前未达到缓存数量上限，直接写入新数据；
3、如果当前已经达到缓存数量上限， 要先删除最不经常使用的数据，再写入数据；

其他都可以直接操作，移动到末尾这个行为，可以拆成"先删除该数据，再从末尾重新插入一条该数据"，这样就简单多了。所以我们继续更新代码：
```js
// 第一步代码
class LRUCache {
    constructor(n){
        this.size = n; // 初始化最大缓存数据条数n
        this.data = new Map(); // 初始化缓存空间map
    }
    // 第二步代码
    put(domain, info){
        if(this.data.has(domain)){
            this.data.delete(domain); // 移除数据
            this.data.set(domain, info)// 在末尾重新插入数据
            return;
        }
        if(this.data.size >= this.size) {
            // 删除最不常用数据
            const firstKey= this.data.keys().next().value; // 不必当心data为空，因为this.size 一般不会取0，满足this.data.size >= this.size时，this.data自然也不为空。
            this.data.delete(firstKey);
        }
        this.data.set(domain, info) // 写入数据
    }
}
```

接着就只剩下get方法了，get方法同样也要处理2种逻辑：

1、根据给定的key，查找是否有对应的信息，若不存在则返回false；
2、若第一步结果存在，则把被访问数据移动到末尾；

```js
// 第一步代码
class LRUCache {
    constructor(n){
        this.size = n; // 初始化最大缓存数据条数n
        this.data = new Map(); // 初始化缓存空间map
    }

    // 第二步代码
    put(domain, info){
        if(this.data.size >= this.size) {
        // 删除最不常用数据
        const firstKey= [...this.data.keys()][0];// 次数不必当心data为空，因为this.size 一般不会取0，满足this.data.size >= this.size时，this.data自然也不为空。
        this.data.delete(firstKey);
        }
        this.data.set(domain, info) // 写入数据
    }

    // 第三步代码
    get(domain) {
        if(!this.data.has(domain)){
            return false;
        }
        const info = this.data.get(domain); //获取结果
        this.data.delete(domain); // 移除数据
        this.data.set(domain, info); // 重新添加该数据
        return info;
    }
}
```

这一步要稍微注意的是，我们是先移除数据后添加数据，严格遵循最大数量不超过n。

</details>

## 343. JSBridge是什么？ {#question-eab191f2-2cc4-4bb9-b04c-370d834b7a7f}

> 难度：2 · 类型：QA

### 题目要点

JSBridge是一种桥梁技术，用于连接JavaScript与原生应用（如Android和iOS）。它通过Webview或JS引擎实现Native端与Web端的双向通信。

主要作用：

- 实现Native与Web之间的双向通信。
- 提供跨平台兼容性，提升开发效率，降低成本。
- 方便集成第三方服务。

使用场景：

- 为原生应用增加Web功能。
- 在WebView中实现复杂交互。
- 集成原生应用与第三方服务。

实现方式：

- URL Schema：通过自定义URL请求。
- 注入API：向JavaScript注入对象或方法。
- 拦截JavaScript方法：拦截并执行原生代码。

<details>
<summary>参考答案</summary>

JSBridge（JavaScript Bridge）是一种用于连接不同技术平台和语言的桥梁，它允许JavaScript代码与原生应用程序（如Android和iOS应用）进行交互。以下是关于JSBridge的详细解释：

### 定义

* JSBridge是一种桥接器，通过JS引擎或Webview容器为媒介，约定协议进行通信，实现Native端（原生应用）和Web端（如HTML5页面）双向通信的一种机制。
* 它的主要作用是让Native可以调用Web的JavaScript代码，同时让Web可以调用原生的代码，实现数据通信。

### 主要作用

1. **实现双向通信**：JSBridge能够实现JavaScript与原生应用之间的双向通信，使得开发者可以在不修改原生代码的情况下，为原生应用添加丰富的Web功能。
2. **跨平台兼容**：提供跨平台的兼容性，使得JavaScript代码可以在不同的移动设备上运行，从而提高开发效率和降低开发成本。
3. **集成第三方服务**：方便原生应用与第三方服务（如微信、支付宝等）的集成。

### 使用场景

* 为原生应用添加Web功能，如在线支付、地图导航等。
* 在WebView中实现复杂的交互效果，如动画、拖拽等。
* 实现原生应用与第三方服务的集成。

### 实现方式

JSBridge的实现方式有多种，以下是一些常见的实现方式：

1. **URL Schema**：通过发送自定义的URL请求，Native端捕获并解析这些请求，然后执行相应的操作。这种方式简单但可能存在URL长度限制和安全性问题。
2. **注入API**：Native端通过WebView提供的接口，向JavaScript的Context（如window对象）中注入对象或方法，Web端通过这些注入的对象或方法调用Native代码。这种方式更直观且功能强大，但需要注意安全性问题，避免暴露敏感接口。
3. **拦截JavaScript方法**：Native端可以拦截WebView中的JavaScript方法（如alert、confirm、prompt等），并在这些方法被调用时执行原生代码。这种方式需要Native端和Web端约定好方法名和参数格式。

### 优缺点

* **优点**：提高开发效率，减少重复代码；实现跨平台兼容，降低开发成本；方便原生应用与第三方服务的集成。
* **缺点**：可能存在安全风险，因为JSBridge允许JavaScript代码访问原生API；如果JSBridge实现不当，可能导致性能下降或兼容性问题。

综上所述，JSBridge是一种强大的技术，它使得JavaScript代码与原生应用程序之间的交互变得更加容易和高效。然而，在使用JSBridge时，开发者需要注意安全性和性能问题，以确保应用的稳定性和用户体验。

</details>

## 344. Babel 是什么？ {#question-3c2be850-72a9-42fe-b9cc-60a632f8ac61}

> 难度：1 · 类型：QA

### 题目要点

Babel 是一个 JavaScript 编译器。

<details>
<summary>参考答案</summary>

Babel 是一个 JavaScript 编译器。

Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

</details>

## 345. CSR和SSR分别是什么？ {#question-c50852c5-6471-4bd3-8392-02ab58e4c726}

> 难度：3 · 类型：QA

### 题目要点

**CSR（客户端渲染）**：

- 浏览器接收数据后，用JavaScript动态生成页面内容。
- 优点：响应快，减少服务器负载，现代技术改善了SEO。
- 缺点：首屏加载时间长，依赖JavaScript。

**SSR（服务器端渲染）**：

- 服务器生成HTML后发送给浏览器。
- 优点：首屏加载快，有利于SEO，兼容性好。
- 缺点：服务器负载重，交互体验不如CSR，开发成本高。

<details>
<summary>参考答案</summary>

在前端开发中，CSR（Client-Side Rendering，客户端渲染）和SSR（Server-Side Rendering，服务器端渲染）是两种常见的页面渲染技术，它们各自有不同的特点和应用场景。

### 1. CSR（客户端渲染）

客户端渲染（Client-Side Rendering）是指网页的HTML结构、CSS样式和JavaScript代码等全部或部分由用户的浏览器在接收到服务器发送的原始数据后，通过JavaScript动态生成的过程。这种方式下，服务器主要发送原始数据（如JSON）到客户端，客户端的JavaScript代码负责将这些数据转换成用户可以看到的页面内容。

**优点**：
- **更好的用户体验**：页面可以更快地响应用户的操作，因为交互不需要等待服务器响应。
- **减少服务器负载**：服务器只需要处理数据的请求和发送，不需要渲染HTML。
- **有利于SEO（搜索引擎优化）**（随着技术进步，这一点正在逐渐改善）：虽然传统上CSR对SEO不友好，但现代前端框架（如React、Vue等）通过服务端渲染的预渲染（Pre-rendering）和静态站点生成（Static Site Generation, SSG）等技术，可以较好地解决SEO问题。

**缺点**：
- **首屏加载时间长**：用户需要等待JavaScript文件加载并执行完成才能看到页面内容。
- **对JavaScript的依赖性强**：如果浏览器禁用了JavaScript，页面将无法正常工作。

### 2. SSR（服务器端渲染）

服务器端渲染（Server-Side Rendering）是指网页的HTML结构在服务器端生成后，直接发送给客户端（浏览器）的过程。在这种方式下，用户的浏览器会接收到一个完整的、已经包含了所有必要内容的HTML页面，客户端的JavaScript主要用于页面的交互和动态内容的更新。

**优点**：
- **更快的首屏加载时间**：用户无需等待JavaScript执行就可以看到完整的页面内容。
- **有利于SEO**：因为搜索引擎爬虫能够直接获取到完整的HTML内容，不需要执行JavaScript。
- **更好的兼容性**：不依赖于客户端的JavaScript执行。

**缺点**：
- **服务器负载较重**：因为服务器需要处理HTML的渲染工作。
- **较差的用户交互体验**：页面交互需要等待服务器响应，不如CSR流畅。
- **开发成本较高**：需要同时处理服务器和客户端的代码。

### 总结

CSR和SSR各有优劣，选择哪种方式取决于具体的应用场景和需求。例如，对于需要快速首屏加载和良好SEO的电商网站，SSR可能是一个更好的选择；而对于需要高度交互和动态内容的单页应用（SPA），CSR则更为合适。随着前端技术的不断发展，也出现了许多结合CSR和SSR优点的解决方案，如同构应用（Isomorphic Application）和静态站点生成（Static Site Generation, SSG）等。

</details>

## 346. 微前端中的应用隔离是什么，一般是怎么实现的？ {#question-ee17c89a-9b7e-4246-8d68-1f28de980ab5}

> 难度：4 · 类型：QA

### 题目要点

在微前端架构中，**应用隔离**是指在同一个页面中运行多个微前端应用时，确保这些应用之间不会互相干扰。应用隔离的目标是使得各个微前端应用可以独立开发、部署和运行，同时避免它们之间的冲突，例如样式冲突、JavaScript 变量污染等。

### 实现应用隔离的常见方法

1. **JavaScript 命名空间隔离**：
   - **作用**：通过将应用的 JavaScript 代码封装在特定的命名空间中，避免全局变量污染。
   - **实现**：使用立即执行函数表达式（IIFE）、模块化（如 ES6 模块、CommonJS）来限制作用域。

   ```javascript
   (function() {
     // 微前端应用代码
     const app = {};
     window.appNamespace = app;
   })();
   ```

2. **CSS 样式隔离**：
   - **作用**：防止不同应用的 CSS 样式互相干扰。
   - **实现**：
     - **CSS 模块化**：使用 CSS 模块化工具（如 CSS Modules、Styled Components）来隔离样式。
     - **CSS-in-JS**：使用 JavaScript 中的 CSS（如 styled-components）来封装组件样式。
     - **Scoped CSS**：在 Vue 等框架中使用 scoped 属性，确保样式只影响当前组件。
     - **CSS 前缀**：使用工具（如 PostCSS）自动添加唯一前缀。

   ```css
   .app1-button {
     background-color: blue;
   }
   ```

3. **iframe 隔离**：
   - **作用**：将应用嵌套在 `iframe` 中，完全隔离应用之间的 JavaScript 和 CSS。
   - **实现**：每个微前端应用在不同的 `iframe` 中运行，从而确保它们的环境是完全独立的。

   ```html
   <iframe src="app1.html"></iframe>
   ```

4. **Web Components**：
   - **作用**：通过 Web Components 封装应用，使其具有独立的 DOM 和样式。
   - **实现**：使用自定义元素、Shadow DOM 和 HTML 模板来封装组件。

   ```javascript
   class MyComponent extends HTMLElement {
     constructor() {
       super();
       const shadow = this.attachShadow({ mode: 'open' });
       shadow.innerHTML = `<p>Hello, Shadow DOM!</p>`;
     }
   }
   customElements.define('my-component', MyComponent);
   ```

5. **动态脚本加载**：
   - **作用**：通过动态加载 JavaScript 代码和样式，避免在全局环境中存在不必要的冲突。
   - **实现**：使用 JavaScript 的 `import()`、动态加载 CSS 文件等方式来加载应用。

   ```javascript
   import('app1').then(module => {
     module.init();
   });
   ```

6. **应用容器与挂载点**：
   - **作用**：在主应用中创建挂载点（DOM 节点），微前端应用在这些挂载点上运行，确保彼此隔离。
   - **实现**：主应用在不同的挂载点上渲染微前端应用。

   ```html
   <div id="app1-container"></div>
   <div id="app2-container"></div>
   ```

### 总结

- **应用隔离** 确保微前端应用之间不会互相干扰，使得各个应用可以独立开发和运行。
- **常见实现方法** 包括 JavaScript 命名空间、CSS 样式隔离、iframe、Web Components、动态脚本加载和应用容器与挂载点。

<details>
<summary>参考答案</summary>

应用隔离问题主要分为主应用和微应用，微应用和微应用之间的JavaScript执行环境隔离，CSS样式隔离。

## CSS隔离

当主应用和微应用同屏渲染时，就可能会有一些样式会相互污染，如果要彻底隔离CSS污染，可以采用CSS Module 或者命名空间的方式，给每个微应用模块以特定前缀，即可保证不会互相干扰，可以采用webpack的postcss插件，在打包时添加特定的前缀。

而对于微应用与微应用之间的CSS隔离就非常简单，在每次应用加载时，将该应用所有的link和style 内容进行标记。在应用卸载后，同步卸载页面上对应的link和style即可。

## JavaScript隔离

每当微应用的JavaScript被加载并运行时，它的核心实际上是对全局对象Window的修改以及一些全局事件的改变，例如jQuery这个js运行后，会在Window上挂载一个window.$对象，对于其他库React，Vue也不例外。

为此，需要在加载和卸载每个微应用的同时，尽可能消除这种冲突和影响，最普遍的做法是采用沙箱机制（SandBox）。

沙箱机制的核心是让局部的JavaScript运行时，对外部对象的访问和修改处在可控的范围内，即无论内部怎么运行，都不会影响外部的对象。通常在Node.js端可以采用vm模块，而对于浏览器，则需要结合with关键字和window.Proxy对象来实现浏览器端的沙箱。

</details>

## 347. 实现微前端有哪些技术方案？ {#question-a93f6d22-f862-4d3c-8656-2adbdef9e96e}

> 难度：3 · 类型：QA

### 题目要点

单纯根据对概念的理解，很容易想到实现微前端的重要思想就是将应用进行拆解和整合，通常是一个父应用加上一些子应用，那么使用类似Nginx配置不同应用的转发，或是采用iframe来将多个应用整合到一起等等这些其实都属于微前端的实现方案：

<details>
<summary>参考答案</summary>

单纯根据对概念的理解，很容易想到实现微前端的重要思想就是将应用进行拆解和整合，通常是一个父应用加上一些子应用，那么使用类似Nginx配置不同应用的转发，或是采用iframe来将多个应用整合到一起等等这些其实都属于微前端的实现方案：

* Nginx路由转发

通过Nginx配置反向代理来实现不同路径映射到不同应用，例如www.abc.com/app1对应app1，www.abc.com/app2对应app2，这种方案本身并不属于前端层面的改造，更多的是运维的配置。

**优点**：简单，快速，易配置

**缺点**：在切换应用时会触发浏览器刷新，影响体验

* iframe嵌套

父应用单独是一个页面，每个子应用嵌套一个iframe，父子通信可采用postMessage或者contentWindow方式

**优点**：实现简单，子应用之间自带沙箱，天然隔离，互不影响

**缺点**：iframe的样式显示、兼容性等都具有局限性；太过简单而显得low

* Web Components

每个子应用需要采用纯Web Components技术编写组件，是一套全新的开发模式

**优点**：每个子应用拥有独立的script和css，也可单独部署

**缺点**：对于历史系统改造成本高，子应用通信较为复杂易踩坑

* 组合式应用路由分发

每个子应用独立构建和部署，运行时由父应用来进行路由管理，应用加载，启动，卸载，以及通信机制

**优点**：纯前端改造，体验良好，可无感知切换，子应用相互隔离

**缺点**：需要设计和开发，由于父子应用处于同一页面运行，需要解决子应用的样式冲突，变量对象污染，通信机制等技术点

</details>

## 348. 微前端可以解决什么问题？ {#question-d3411be6-a0be-4901-8f37-f418af1c0475}

> 难度：3 · 类型：QA

### 题目要点

任何新技术的产生都是为了解决现有场景和需求下的技术痛点，微前端也不例外：

<details>
<summary>参考答案</summary>

任何新技术的产生都是为了解决现有场景和需求下的技术痛点，微前端也不例外：

* 拆分和细化

当下前端领域，单页面应用（SPA）是非常流行的项目形态之一，而随着时间的推移以及应用功能的丰富，单页应用变得不再单一而是越来越庞大也越来越难以维护，往往是改一处而动全身，由此带来的发版成本也越来越高。微前端的意义就是将这些庞大应用进行拆分，并随之解耦，每个部分可以单独进行维护和部署，提升效率。

* 整合历史系统

在不少的业务中，或多或少会存在一些历史项目，这些项目大多以采用老框架类似（Backbone.js，Angular.js 1）的B端管理系统为主，介于日常运营，这些系统需要结合到新框架中来使用还不能抛弃，对此我们也没有理由浪费时间和精力重写旧的逻辑。而微前端可以将这些系统进行整合，在基本不修改来逻辑的同时来同时兼容新老两套系统并行运行。

## 微前端架构具备以下几个核心价值：

* 技术栈无关

主框架不限制接入应用的技术栈，微应用具备完全自主权

* 独立开发、独立部署

微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

* 增量升级

在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略

* 独立运行时

每个微应用之间状态隔离，运行时状态不共享

</details>

## 349. 什么是微前端？ {#question-0c0db5d1-e09a-4699-911a-3cfa4f4bd765}

> 难度：3 · 类型：QA

### 题目要点

微前端（Micro-Frontends）是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。

<details>
<summary>参考答案</summary>

微前端（Micro-Frontends）是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。

各个前端应用还可以独立运行、独立开发、独立部署。

微前端不是单纯的前端框架或者工具，而是一套架构体系，

</details>

## 350. npm 是什么？ {#question-1b2049cf-9800-420d-b4f3-09238226d162}

> 难度：1 · 类型：QA

### 题目要点

npm是Node.js的包管理工具，它的诞生也极大的促进了前端的发展，在现代前端开发中都离不开npm的身影。

<details>
<summary>参考答案</summary>

npm是Node.js的包管理工具，它的诞生也极大的促进了前端的发展，在现代前端开发中都离不开npm的身影。

常见的使用场景有以下几种：

* 允许用户从NPM服务器下载别人编写的第三方包到本地使用。
* 允许用户从NPM服务器下载并安装别人编写的命令行程序到本地使用。
* 允许用户将自己编写的包或命令行程序上传到NPM服务器供别人使用。

</details>

## 351. forEach中return有效果吗？如何中断forEach循环？ {#question-0356a1c0-f9a2-4fb1-98a5-fa409247fa8f}

> 难度：2.5 · 类型：QA

### 题目要点

在forEach中用return不会返回，函数会继续执行。

<details>
<summary>参考答案</summary>

在forEach中用return不会返回，函数会继续执行。

## 中断方法

* 使用try监视代码块，在需要中断的地方抛出异常。
* 官方推荐方法（替换方法）：用every和some替代forEach函数。
    * every在碰到return false的时候，中止循环。
    * some在碰到return true的时候，中止循环。

</details>

## 352. 下面执行后输出什么？ {#question-919bfdcc-3d20-469f-b789-f99cc15410fe}

> 难度：2 · 类型：QA

```js
for(var i = 1; i <= 5; i ++){
  setTimeout(function timer(){
    console.log(i)
  }, 0)
}
```

### 题目要点

结论： 输出5个6。

<details>
<summary>参考答案</summary>

结论： 输出5个6。

因为setTimeout为宏任务，由于JS中单线程eventLoop机制，在主线程同步任务执行完后才去执行宏任
务，因此循环结束后setTimeout中的回调才依次执行，但输出i的时候当前作用域没有，往上一级再找，发现了i,此时循环已经结束，i变成了6。因此会全部输出6。

</details>

## 353. [] == ![]结果是什么？ {#question-8edaa033-4005-41cc-a255-f175f6c4eb6b}

> 难度：2 · 类型：QA

### 题目要点

== 中，左右两边都需要转换为数字然后进行比较。

<details>
<summary>参考答案</summary>

== 中，左右两边都需要转换为数字然后进行比较。

[]转换为数字为0。

![] 首先是转换为布尔值，由于[]作为一个引用类型转换为布尔值为true, 因此![]为false，进而在转换成数字，变为0。 0 == 0 ， 结果为true

</details>

## 354. Object.is和===有什么区别？ {#question-7e7da360-d6e1-4f9f-b987-7e740b8d8d7e}

> 难度：2 · 类型：QA

### 题目要点

Object在严格等于的基础上修复了一些特殊情况下的失误，具体来说就是+0和-0，NaN和NaN。

<details>
<summary>参考答案</summary>

Object在严格等于的基础上修复了一些特殊情况下的失误，具体来说就是+0和-0，NaN和NaN。

源码如下：
```js
function is(x, y) {
if (x === y) {
//运行到1/x === 1/y的时候x和y都为0，但是1/+0 = +Infinity， 1/-0 = -Infinity, 是不
一样的
return x !== 0 || y !== 0 || 1 / x === 1 / y;
} else {
//NaN===NaN是false,这是不对的，我们在这里做一个拦截，x !== x，那么一定是 NaN, y 同理
//两个都是NaN的时候返回true
return x !== x && y !== y;
}

```

</details>

## 355. instanceof能否判断基本数据类型？ {#question-1d87535d-c1c8-4c6e-b6f5-583c80193217}

> 难度：2 · 类型：QA

### 题目要点

能。比如下面这种方式:

<details>
<summary>参考答案</summary>

能。比如下面这种方式:

```js
class PrimitiveNumber {
    static [Symbol.hasInstance](x) {
        return typeof x === 'number'
    }
}
console.log(111 instanceof PrimitiveNumber) // true

```

其实就是自定义instanceof行为的一种方式，这里将原有的instanceof方法重定义，换成了typeof，因此能够判断基本数据类型。

</details>

## 356. typeof 是否能正确判断类型？ {#question-a24f7d09-79df-4468-af94-654e8cfd3288}

> 难度：2 · 类型：QA

### 题目要点

`typeof` 是 JavaScript 中用于返回一个值的数据类型的一元操作符。它对于基本数据类型的判断通常是准确的，但在某些情况下可能不会返回你期望的结果。

### 基本数据类型的判断

```javascript
typeof undefined;  // "undefined"
typeof 42;         // "number"
typeof "Hello";     // "string"
typeof true;       // "boolean"
typeof null;       // "object" —— 这是一个常见的陷阱
typeof Symbol();   // "symbol"
```

### 对象和数组的判断

```js
typeof {};            // "object"
typeof [];            // "object" —— 数组是对象的一种类型
typeof new Date();    // "object" —— Date 对象是对象的一种类型
typeof function() {}; // "function" —— 函数在 JavaScript 中被归类为对象
```

### typeof 的限制

- null 的问题：typeof null 返回 "object"，因为 null 被视为一个空的对象引用。
- 函数问题：尽管函数是对象，typeof 会返回 "function"。
不能区分对象类型：typeof 无法区分数组、日期对象、自定义对象等，因为它们都被归类为 "object"。
- 不同上下文的对象：来自 iframe 或服务端动态加载的脚本创建的对象可能无法被 typeof 正确判断。
- 未定义的变量：对未声明的变量使用 typeof 会导致 ReferenceError。

### 总结

typeof 可以正确判断基本数据类型，但在处理复杂对象时可能有限制。如果需要更细致的类型检查，可以使用 instanceof 操作符或 Object.prototype.toString.call() 方法。

```js
// 使用 instanceof 进行更细致的类型检查
console.log([] instanceof Array); // true
console.log({} instanceof Object); // true

// 使用 Object.prototype.toString.call 检查对象的具体类型
console.log(Object.prototype.toString.call(new Date())); // "[object Date]"
console.log(Object.prototype.toString.call(function(){})); // "[object Function]"
```

instanceof 和 Object.prototype.toString.call 是处理复杂类型判断时的有用工具，它们可以提供更精确的结果。

<details>
<summary>参考答案</summary>

对于原始类型来说，除了 null 都可以调用typeof显示正确的类型。

```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'

```

但对于引用数据类型，除了函数之外，都会显示"object"。

```js
typeof [] // 'object'
typeof {} // 'object'
typeof console.log // 'function'

```

因此采用typeof判断对象数据类型是不合适的，采用instanceof会更好，instanceof的原理是基于原型链的查询，只要处于原型链中，判断永远为true

```js

const Person = function() {}
const p1 = new Person()
p1 instanceof Person // true
var str1 = 'hello world'
str1 instanceof String // false
var str2 = new String('hello world')
str2 instanceof String // true

```

</details>

## 357. 什么是BigInt? {#question-62bf96e4-7471-44d1-9c30-d22ccb98e1d3}

> 难度：2 · 类型：QA

### 题目要点

BigInt是一种新的数据类型，用于当整数值大于Number数据类型支持的范围时。这种数据类型允许我们安全地对 大整数 执行算术操作，表示高分辨率的时间戳，使用大整数id，等等，而不需要使用库。

<details>
<summary>参考答案</summary>

BigInt是一种新的数据类型，用于当整数值大于Number数据类型支持的范围时。这种数据类型允许我们安全地对 大整数 执行算术操作，表示高分辨率的时间戳，使用大整数id，等等，而不需要使用库。

</details>

## 358. 0.1+0.2为什么不等于0.3？ {#question-27491e6c-d92d-4d41-9bff-4781665945df}

> 难度：2 · 类型：QA

### 题目要点

0.1和0.2在转换成二进制后会无限循环，由于标准位数的限制后面多余的位数会被截掉，此时就已经出现了精度的损失，相加后因浮点数小数位的限制而截断的二进制数字在转换为十进制就会变成 0.30000000000000004。

<details>
<summary>参考答案</summary>

0.1和0.2在转换成二进制后会无限循环，由于标准位数的限制后面多余的位数会被截掉，此时就已经出现了精度的损失，相加后因浮点数小数位的限制而截断的二进制数字在转换为十进制就会变成 0.30000000000000004。

</details>

## 359. '1'.toString()为什么不会报错？ {#question-82a008f4-a9a4-4af6-aa6f-ec9d3b026487}

> 难度：1 · 类型：QA

### 题目要点

其实在这个语句运行的过程中做了这样几件事情：

<details>
<summary>参考答案</summary>

其实在这个语句运行的过程中做了这样几件事情：

```js
var s = new Object('1');
s.toString();
s = null;
```

* 第一步: 创建Object类实例。注意为什么不是String ？ 由于Symbol和BigInt的出现，对它们调用new都会报错，目前ES6规范也不建议用new来创建基本类型的包装类。
* 第二步: 调用实例方法。
* 第三步: 执行完方法立即销毁这个实例。

整个过程体现了 `基本包装类型` 的性质，而基本包装类型恰恰属于基本数据类型，包括Boolean, Number和String。

</details>

## 360. null是对象吗？为什么？ {#question-2caef7c7-6f12-4104-9a51-b360dc775357}

> 难度：1.5 · 类型：QA

### 题目要点

null不是对象。

<details>
<summary>参考答案</summary>

null不是对象。

虽然 typeof null 会输出 object，但是这只是 JS 存在的一个悠久 Bug。在 JS 的最初版本中使用的是 32 位系统，为了性能考虑使用低位存储变量的类型信息，000 开头代表是对象然而 null 表示为全零，所以将它错误的判断为 object 。

</details>

## 361. 什么是内存泄漏？什么原因会导致呢？ {#question-b9bd9552-5748-45b1-88a8-f36e45f6261f}

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

## 362. webSocket如何兼容低浏览器 {#question-9f860d42-8504-4562-8b9a-4a415ba5782a}

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

## 363. 如何实现浏览器内多个标签页之间的通信？ {#question-833fba72-1614-4502-adc3-1f5593ae6560}

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

## 364. 什么是跨域？ {#question-3538f4eb-5b78-4ffc-aeae-ccfdd45976a4}

> 难度：1 · 类型：QA

### 题目要点

**跨域**是指从一个网站（源）去请求另一个网站（目标）的资源时，由于浏览器的同源策略限制，这种请求可能会被阻止。同源策略要求协议、域名、端口号都相同。

为了解决跨域问题，有几种常用方法：

1. **CORS**：服务器设置响应头，允许特定源的跨域请求。
2. **JSONP**：利用`&lt;script&gt;`标签的跨域能力，但只支持GET请求且存在安全风险。
3. **代理服务器**：通过代理服务器转发请求和响应，客户端与代理服务器同源。
4. **postMessage**：HTML5 API，允许不同源的窗口或iframe之间进行安全通信。

<details>
<summary>参考答案</summary>

**跨域**（Cross-Origin）是指从一个域名的网页去请求另一个域名的资源。在Web开发中，出于安全考虑，同源策略（Same-Origin Policy）限制了文档或脚本如何与来自不同源的“资源”进行交互。这里的“源”指的是协议（如http或https）、域名（如www.example.com）和端口号（如80或443）的组合。如果协议、域名或端口号中的任何一个不同，那么两个资源就被认为是来自不同的源，即跨域。

跨域问题主要出现在前端开发中，尤其是当前端页面需要从不同源的服务器请求数据或服务时。由于浏览器的同源策略，这些跨域请求可能会被阻止，导致请求失败。

为了解决这个问题，有几种常见的跨域资源共享（CORS, Cross-Origin Resource Sharing）策略：

1. **JSONP**：一种早期的跨域技术，通过在客户端动态创建`&lt;script&gt;`标签并设置其`src`属性为跨域URL（该URL会返回一段JavaScript代码，该代码中包含需要的数据），然后利用`&lt;script&gt;`标签的跨域能力来执行返回的JavaScript代码，从而获取数据。但JSONP只支持GET请求，并且存在安全风险。

2. **CORS**：现代浏览器支持的跨域资源共享标准。服务器通过设置响应头（如`Access-Control-Allow-Origin`）来明确告知客户端哪些域的请求是被允许的。CORS支持更复杂的HTTP请求，如POST、PUT等，并且安全性更高。

3. **代理服务器**：在客户端和服务器之间设置一个代理服务器，客户端的请求先发送到代理服务器，代理服务器再将请求转发给目标服务器，并将响应返回给客户端。这样，从客户端的角度看，它始终在与同源的代理服务器进行交互，从而避免了跨域问题。

4. **Nginx反向代理**：一种常见的代理服务器解决方案，通过配置Nginx来实现对跨域请求的转发和响应。

5. **document.domain + iframe**：对于主域相同但子域不同的跨域问题，可以通过设置`document.domain`来使两个页面共享同一个域，然后通过iframe进行交互。但这种方法有一定的局限性，并且存在安全风险。

6. **postMessage**：HTML5引入的一种跨文档通信API，允许来自不同源的页面进行安全通信。通过监听`message`事件并检查事件的`origin`属性，可以确保消息来自预期的源。

</details>

## 365. Axios的原理是什么？ {#question-605ec5f7-3768-4aa4-8cdc-3b5bd90bebc3}

> 难度：3 · 类型：QA

### 题目要点

Axios 是一个基于 Promise 的 HTTP 客户端，用于浏览器和 node.js。它的原理可以概括为以下几个关键点：

1. **基于 Promise**：Axios 使用了 JavaScript 的 Promise 对象来处理异步请求，这意味着你可以使用链式调用和处理多个请求。
2. **拦截器**：Axios 提供了拦截器（interceptors）机制，允许你在请求或响应被处理之前进行自定义处理。这使得可以统一处理如添加认证、修改请求头、处理错误等操作。
3. **请求/响应转换**：Axios 允许你在发送请求之前或接收到响应之后对数据进行转换，这可以通过 `transformRequest` 和 `transformResponse` 函数来实现。
4. **取消请求**：Axios 支持取消请求，这可以通过 `CancelToken` 对象实现。这个对象允许你在请求执行过程中取消它，从而释放服务器资源。
5. **配置默认值**：Axios 允许你为请求设置默认配置，这些配置可以在每个请求中覆盖。
6. **请求和响应处理**：Axios 提供了请求和响应处理的方法，如 `dispatchRequest` 和 `transformData`，这些方法负责处理实际的网络请求和响应数据。
7. **错误处理**：Axios 提供了详细的错误处理机制，可以在请求失败时捕获错误并采取相应的操作。
8. **并发处理**：Axios 支持并发处理多个请求，通过 `all` 方法可以同时发送多个请求，并通过 `spread` 方法处理它们的响应。
9. **适配器模式**：Axios 使用适配器模式来处理不同环境下的 HTTP 请求，例如在浏览器中使用 XMLHttpRequest，在 node.js 中使用 http 模块。
10. **依赖模块**：Axios 依赖了多个模块，如 `es6-promise`（在 node.js 中是 `promise`）、`qs`（用于序列化查询字符串）、`lodash`（用于处理数组和对象）等。

Axios 的设计目的是为了简化网络请求的处理，并提供强大的功能来处理异步请求和响应。通过其丰富的 API 和灵活的配置选项，Axios 已经成为前端开发中处理 HTTP 请求的流行选择。

<details>
<summary>参考答案</summary>

## 一、axios的使用

关于`axios`的基本使用，上篇文章已经有所涉及，这里再稍微回顾下：

**发送请求**

```js
import axios from 'axios';

axios(config) // 直接传入配置
axios(url[, config]) // 传入url和配置
axios[method](url[, option]) // 直接调用请求方式方法，传入url和配置
axios[method](url[, data[, option]]) // 直接调用请求方式方法，传入data、url和配置
axios.request(option) // 调用 request 方法

const axiosInstance = axios.create(config)
// axiosInstance 也具有以上 axios 的能力

axios.all([axiosInstance1, axiosInstance2]).then(axios.spread(response1, response2))
// 调用 all 和传入 spread 回调

```

**请求拦截器**

```js
axios.interceptors.request.use(function (config) {
    // 这里写发送请求前处理的代码
    return config;
}, function (error) {
    // 这里写发送请求错误相关的代码
    return Promise.reject(error);
});
```

**响应拦截器**

```js
axios.interceptors.response.use(function (response) {
    // 这里写得到响应数据后处理的代码
    return response;
}, function (error) {
    // 这里写得到错误响应处理的代码
    return Promise.reject(error);
});
```

**取消请求**

```js
// 方式一
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('xxxx', {
  cancelToken: source.token
})
// 取消请求 (请求原因是可选的)
source.cancel('主动取消请求');

// 方式二
const CancelToken = axios.CancelToken;
let cancel;

axios.get('xxxx', {
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  })
});
cancel('主动取消请求');
```

## 二、实现一个简易版axios

构建一个`Axios`构造函数，核心代码为`request`

```js
class Axios {
    constructor() {

    }

    request(config) {
        return new Promise(resolve => {
            const {url = '', method = 'get', data = {}} = config;
            // 发送ajax请求
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.onload = function() {
                console.log(xhr.responseText)
                resolve(xhr.responseText);
            }
            xhr.send(data);
        })
    }
}
```

导出`axios`实例

```js
// 最终导出axios的方法，即实例的request方法
function CreateAxiosFn() {
    let axios = new Axios();
    let req = axios.request.bind(axios);
    return req;
}

// 得到最后的全局变量axios
let axios = CreateAxiosFn();
```

上述就已经能够实现`axios({ })`这种方式的请求

下面是来实现下`axios.method()`这种形式的请求

```js
// 定义get,post...方法，挂在到Axios原型上
const methodsArr = ['get', 'delete', 'head', 'options', 'put', 'patch', 'post'];
methodsArr.forEach(met => {
    Axios.prototype[met] = function() {
        console.log('执行'+met+'方法');
        // 处理单个方法
        if (['get', 'delete', 'head', 'options'].includes(met)) { // 2个参数(url[, config])
            return this.request({
                method: met,
                url: arguments[0],
                ...arguments[1] || {}
            })
        } else { // 3个参数(url[,data[,config]])
            return this.request({
                method: met,
                url: arguments[0],
                data: arguments[1] || {},
                ...arguments[2] || {}
            })
        }

    }
})
```

将`Axios.prototype`上的方法搬运到`request`上

首先实现个工具类，实现将`b`方法混入到`a`，并且修改`this`指向

```js
const utils = {
  extend(a,b, context) {
    for(let key in b) {
      if (b.hasOwnProperty(key)) {
        if (typeof b[key] === 'function') {
          a[key] = b[key].bind(context);
        } else {
          a[key] = b[key]
        }
      }

    }
  }
}
```

修改导出的方法

```js
function CreateAxiosFn() {
  let axios = new Axios();

  let req = axios.request.bind(axios);
  // 增加代码
  utils.extend(req, Axios.prototype, axios)

  return req;
}
```

构建拦截器的构造函数

```js
class InterceptorsManage {
  constructor() {
    this.handlers = [];
  }

  use(fullfield, rejected) {
    this.handlers.push({
      fullfield,
      rejected
    })
  }
}
```

实现`axios.interceptors.response.use`和`axios.interceptors.request.use`

```js
class Axios {
    constructor() {
        // 新增代码
        this.interceptors = {
            request: new InterceptorsManage,
            response: new InterceptorsManage
        }
    }

    request(config) {
        ...
    }
}
```

执行语句`axios.interceptors.response.use`和`axios.interceptors.request.use`的时候，实现获取`axios`实例上的`interceptors`对象，然后再获取`response`或`request`拦截器，再执行对应的拦截器的`use`方法

把`Axios`上的方法和属性搬到`request`过去

```js
function CreateAxiosFn() {
  let axios = new Axios();

  let req = axios.request.bind(axios);
  // 混入方法， 处理axios的request方法，使之拥有get,post...方法
  utils.extend(req, Axios.prototype, axios)
  // 新增代码
  utils.extend(req, axios)
  return req;
}
```

现在`request`也有了`interceptors`对象，在发送请求的时候，会先获取`request`拦截器的`handlers`的方法来执行

首先将执行`ajax`的请求封装成一个方法

```js
request(config) {
    this.sendAjax(config)
}
sendAjax(config){
    return new Promise(resolve => {
        const {url = '', method = 'get', data = {}} = config;
        // 发送ajax请求
        console.log(config);
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function() {
            console.log(xhr.responseText)
            resolve(xhr.responseText);
        };
        xhr.send(data);
    })
}
```

获得`handlers`中的回调

```js
request(config) {
    // 拦截器和请求组装队列
    let chain = [this.sendAjax.bind(this), undefined] // 成对出现的，失败回调暂时不处理

    // 请求拦截
    this.interceptors.request.handlers.forEach(interceptor => {
        chain.unshift(interceptor.fullfield, interceptor.rejected)
    })

    // 响应拦截
    this.interceptors.response.handlers.forEach(interceptor => {
        chain.push(interceptor.fullfield, interceptor.rejected)
    })

    // 执行队列，每次执行一对，并给promise赋最新的值
    let promise = Promise.resolve(config);
    while(chain.length > 0) {
        promise = promise.then(chain.shift(), chain.shift())
    }
    return promise;
}
```

`chains`大概是`['fulfilled1','reject1','fulfilled2','reject2','this.sendAjax','undefined','fulfilled2','reject2','fulfilled1','reject1']`这种形式

这样就能够成功实现一个简易版`axios`

## 三、源码分析

首先看看目录结构

 ![](https://static.ecool.fun//article/aa354d57-bb09-40c5-ba3e-cc5680443a28.png)

`axios`发送请求有很多实现的方法，实现入口文件为`axios.js `

```js
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);

  // instance指向了request方法，且上下文指向context，所以可以直接以 instance(option) 方式调用
  // Axios.prototype.request 内对第一个参数的数据类型判断，使我们能够以 instance(url, option) 方式调用
  var instance = bind(Axios.prototype.request, context);

  // 把Axios.prototype上的方法扩展到instance对象上，
  // 并指定上下文为context，这样执行Axios原型链上的方法时，this会指向context
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  // 把context对象上的自身属性和方法扩展到instance上
  // 注：因为extend内部使用的forEach方法对对象做for in 遍历时，只遍历对象本身的属性，而不会遍历原型链上的属性
  // 这样，instance 就有了  defaults、interceptors 属性。
  utils.extend(instance, context);
  return instance;
}

// Create the default instance to be exported 创建一个由默认配置生成的axios实例
var axios = createInstance(defaults);

// Factory for creating new instances 扩展axios.create工厂函数，内部也是 createInstance
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};
module.exports = axios;
```

主要核心是 `Axios.prototype.request`，各种请求方式的调用实现都是在 `request` 内部实现的， 简单看下 `request` 的逻辑

```js
Axios.prototype.request = function request(config) {
  // Allow for axios('example/url'[, config]) a la fetch API
  // 判断 config 参数是否是 字符串，如果是则认为第一个参数是 URL，第二个参数是真正的config
  if (typeof config === 'string') {
    config = arguments[1] || {};
    // 把 url 放置到 config 对象中，便于之后的 mergeConfig
    config.url = arguments[0];
  } else {
    // 如果 config 参数是否是 字符串，则整体都当做config
    config = config || {};
  }
  // 合并默认配置和传入的配置
  config = mergeConfig(this.defaults, config);
  // 设置请求方法
  config.method = config.method ? config.method.toLowerCase() : 'get';
  /*
    something... 此部分会在后续拦截器单独讲述
  */
};

// 在 Axios 原型上挂载 'delete', 'get', 'head', 'options' 且不传参的请求方法，实现内部也是 request
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

// 在 Axios 原型上挂载 'post', 'put', 'patch' 且传参的请求方法，实现内部同样也是 request
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

`request`入口参数为`config`，可以说`config`贯彻了`axios`的一生

`axios` 中的 `config `主要分布在这几个地方：

- 默认配置 `defaults.js`
- `config.method`默认为 `get`
- 调用 `createInstance` 方法创建 `axios `实例，传入的`config`
- 直接或间接调用 `request` 方法，传入的 `config`

```js
// axios.js
// 创建一个由默认配置生成的axios实例
var axios = createInstance(defaults);

// 扩展axios.create工厂函数，内部也是 createInstance
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Axios.js
// 合并默认配置和传入的配置
config = mergeConfig(this.defaults, config);
// 设置请求方法
config.method = config.method ? config.method.toLowerCase() : 'get';

```

从源码中，可以看到优先级：默认配置对象`default` < `method:get` < `Axios`的实例属性`this.default` < `request`参数

下面重点看看`request`方法

```js
Axios.prototype.request = function request(config) {
  /*
    先是 mergeConfig ... 等，不再阐述
  */
  // Hook up interceptors middleware 创建拦截器链. dispatchRequest 是重中之重，后续重点
  var chain = [dispatchRequest, undefined];

  // push各个拦截器方法 注意：interceptor.fulfilled 或 interceptor.rejected 是可能为undefined
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    // 请求拦截器逆序 注意此处的 forEach 是自定义的拦截器的forEach方法
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    // 响应拦截器顺序 注意此处的 forEach 是自定义的拦截器的forEach方法
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 初始化一个promise对象，状态为resolved，接收到的参数为已经处理合并过的config对象
  var promise = Promise.resolve(config);

  // 循环拦截器的链
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift()); // 每一次向外弹出拦截器
  }
  // 返回 promise
  return promise;
};
```

拦截器`interceptors`是在构建`axios`实例化的属性

```js
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(), // 请求拦截
    response: new InterceptorManager() // 响应拦截
  };
}
```

`InterceptorManager`构造函数

```js
// 拦截器的初始化 其实就是一组钩子函数
function InterceptorManager() {
  this.handlers = [];
}

// 调用拦截器实例的use时就是往钩子函数中push方法
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

// 拦截器是可以取消的，根据use的时候返回的ID，把某一个拦截器方法置为null
// 不能用 splice 或者 slice 的原因是 删除之后 id 就会变化，导致之后的顺序或者是操作不可控
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

// 这就是在 Axios的request方法中 中循环拦截器的方法 forEach 循环执行钩子函数
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
}
```

请求拦截器方法是被 `unshift`到拦截器中，响应拦截器是被`push`到拦截器中的。最终它们会拼接上一个叫`dispatchRequest`的方法被后续的 `promise` 顺序执行

```js
var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

// 判断请求是否已被取消，如果已经被取消，抛出已取消
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // 如果包含baseUrl, 并且不是config.url绝对路径，组合baseUrl以及config.url
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    // 组合baseURL与url形成完整的请求路径
    config.url = combineURLs(config.baseURL, config.url);
  }

  config.headers = config.headers || {};

  // 使用/lib/defaults.js中的transformRequest方法，对config.headers和config.data进行格式化
  // 比如将headers中的Accept，Content-Type统一处理成大写
  // 比如如果请求正文是一个Object会格式化为JSON字符串，并添加application/json;charset=utf-8的Content-Type
  // 等一系列操作
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // 合并不同配置的headers，config.headers的配置优先级更高
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  // 删除headers中的method属性
  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  // 如果config配置了adapter，使用config中配置adapter的替代默认的请求方法
  var adapter = config.adapter || defaults.adapter;

  // 使用adapter方法发起请求（adapter根据浏览器环境或者Node环境会有不同）
  return adapter(config).then(
    // 请求正确返回的回调
    function onAdapterResolution(response) {
      // 判断是否以及取消了请求，如果取消了请求抛出以取消
      throwIfCancellationRequested(config);

      // 使用/lib/defaults.js中的transformResponse方法，对服务器返回的数据进行格式化
      // 例如，使用JSON.parse对响应正文进行解析
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    },
    // 请求失败的回调
    function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }
      return Promise.reject(reason);
    }
  );
};
```

再来看看`axios`是如何实现取消请求的，实现文件在`CancelToken.js`

```js
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }
  // 在 CancelToken 上定义一个 pending 状态的 promise ，将 resolve 回调赋值给外部变量 resolvePromise
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  // 立即执行 传入的 executor函数，将真实的 cancel 方法通过参数传递出去。
  // 一旦调用就执行 resolvePromise 即前面的 promise 的 resolve，就更改promise的状态为 resolve。
  // 那么xhr中定义的 CancelToken.promise.then方法就会执行, 从而xhr内部会取消请求
  executor(function cancel(message) {
    // 判断请求是否已经取消过，避免多次执行
    if (token.reason) {
      return;
    }
    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

CancelToken.source = function source() {
  // source 方法就是返回了一个 CancelToken 实例，与直接使用 new CancelToken 是一样的操作
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  // 返回创建的 CancelToken 实例以及取消方法
  return {
    token: token,
    cancel: cancel
  };
};
```

实际上取消请求的操作是在 `xhr.js` 中也有响应的配合的

```js
if (config.cancelToken) {
    config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
            return;
        }
        // 取消请求
        request.abort();
        reject(cancel);
    });
}
```

巧妙的地方在 `CancelToken`中 `executor` 函数，通过`resolve`函数的传递与执行，控制`promise`的状态

### 小结

 ![](https://static.ecool.fun//article/e785c66f-b0a5-4816-b303-a1f638eda1b8.png)

## 参考文献

- https://juejin.cn/post/6856706569263677447#heading-4
- https://juejin.cn/post/6844903907500490766
- https://github.com/axios/axios

</details>

## 366. 说说你对SPA的理解 {#question-73413861-0e94-4d71-bff3-65e8515ddc17}

> 难度：2.5 · 类型：QA

### 题目要点

SPA是一种现代的网页应用模式，通过动态重写页面的部分内容，避免了页面的整体重新加载。以下是SPA的核心特点：

## 核心特点

- **单页面加载**：整个应用最初只是一个HTML页面，用户的所有操作不会引起页面整体刷新。
- **动态内容更新**：通过JavaScript动态与服务器通信，更新页面的某部分内容。
- **用户体验流畅**：避免了全页刷新，提供更流畅的用户体验。
- **前端路由**：使用前端路由管理不同的视图和状态，不触发页面刷新。
- **SEO挑战**：可能面临搜索引擎优化的挑战，因为内容是动态加载的。
- **性能优化**：需要优化性能，如懒加载和代码分割。
- **构建工具和框架**：实现通常依赖现代前端框架和构建工具。

## 工作流程

1. **初始加载**：用户访问应用，服务器返回HTML和JavaScript文件。
2. **前端路由控制**：JavaScript接管URL，根据变化加载组件或视图。
3. **异步数据请求**：根据用户操作，向服务器请求数据。
4. **内容更新**：使用JavaScript动态更新DOM。
5. **历史状态管理**：使用HTML5 History API管理会话历史。

## 优缺点

**优点**：

- 提供更流畅的用户体验，交互快速且响应迅速。
- 减轻服务器负担，只需加载必要资源。
- 前后端可以独立开发和部署，提高开发效率。

**缺点**：

- 面临SEO优化问题，动态内容可能不被搜索引擎正确索引。
- 初次加载可能较长，特别是JavaScript较多时。
- 状态管理和代码组织可能更复杂。

SPA提供了许多优势，但也带来了一些挑战，特别是在SEO和初次加载性能方面。开发者需要根据应用的需求和目标受众来选择是否使用SPA架构。

<details>
<summary>参考答案</summary>

## 一、什么是SPA

SPA（single-page application），翻译过来就是单页应用`SPA`是一种网络应用程序或网站的模型，它通过动态重写当前页面来与用户交互，这种方法避免了页面之间切换打断用户体验在单页应用中，所有必要的代码（`HTML`、`JavaScript`和`CSS`）都通过单个页面的加载而检索，或者根据需要（通常是为响应用户操作）动态装载适当的资源并添加到页面页面在任何时间点都不会重新加载，也不会将控制转移到其他页面举个例子来讲就是一个杯子，早上装的牛奶，中午装的是开水，晚上装的是茶，我们发现，变的始终是杯子里的内容，而杯子始终是那个杯子结构如下图

 ![](https://static.ecool.fun//article/d35464ad-3571-4e60-852a-c65146180338.png)

我们熟知的JS框架如`react`,`vue`,`angular`,`ember`都属于`SPA`

## 二、SPA和MPA的区别

上面大家已经对单页面有所了解了，下面来讲讲多页应用MPA（MultiPage-page application），翻译过来就是多页应用在`MPA`中，每个页面都是一个主页面，都是独立的当我们在访问另一个页面的时候，都需要重新加载`html`、`css`、`js`文件，公共文件则根据需求按需加载如下图

 ![](https://static.ecool.fun//article/834320df-dc4b-4ab8-8794-3957ad6c6abc.png)

#### 单页应用与多页应用的区别

|  | 单页面应用（SPA） | 多页面应用（MPA） |
| :-- | :-- | :-- |
| 组成 | 一个主页面和多个页面片段 | 多个主页面 |
| 刷新方式 | 局部刷新 | 整页刷新 |
| url模式 | 哈希模式 | 历史模式 |
| SEO搜索引擎优化 | 难实现，可使用SSR方式改善 | 容易实现 |
| 数据传递 | 容易 | 通过url、cookie、localStorage等传递 |
| 页面切换 | 速度快，用户体验良好 | 切换加载资源，速度慢，用户体验差 |
| 维护成本 | 相对容易 | 相对复杂 |

#### 单页应用优缺点

优点：

- 具有桌面应用的即时性、网站的可移植性和可访问性
- 用户体验好、快，内容的改变不需要重新加载整个页面
- 良好的前后端分离，分工更明确

缺点：

- 不利于搜索引擎的抓取
- 首次渲染速度相对较慢
-

## 三、实现一个SPA

#### 原理

1.  监听地址栏中`hash`变化驱动界面变化
2.  用`pushsate`记录浏览器的历史，驱动界面发送变化

 ![](https://static.ecool.fun//article/7f8f6dfb-74bb-4a6c-b81b-706d3555291d.png)

#### 实现

##### `hash` 模式

核心通过监听`url`中的`hash`来进行路由跳转

```js
// 定义 Router
class Router {
    constructor () {
        this.routes = {}; // 存放路由path及callback
        this.currentUrl = '';
        
        // 监听路由change调用相对应的路由回调
        window.addEventListener('load', this.refresh, false);
        window.addEventListener('hashchange', this.refresh, false);
    }
    
    route(path, callback){
        this.routes[path] = callback;
    }
    
    push(path) {
        this.routes[path] && this.routes[path]()
    }
}

// 使用 router
window.miniRouter = new Router();
miniRouter.route('/', () => console.log('page1'))
miniRouter.route('/page2', () => console.log('page2'))

miniRouter.push('/') // page1
miniRouter.push('/page2') // page2
```

##### history模式

`history` 模式核心借用 `HTML5 history api`，`api` 提供了丰富的 `router` 相关属性先了解一个几个相关的api

 -    `history.pushState` 浏览器历史纪录添加记录
 -    `history.replaceState`修改浏览器历史纪录中当前纪录
 -    `history.popState` 当 `history` 发生变化时触发

```js
// 定义 Router
class Router {
    constructor () {
        this.routes = {};
        this.listerPopState()
    }
    
    init(path) {
        history.replaceState({path: path}, null, path);
        this.routes[path] && this.routes[path]();
    }
    
    route(path, callback){
        this.routes[path] = callback;
    }
    
    push(path) {
        history.pushState({path: path}, null, path);
        this.routes[path] && this.routes[path]();
    }
    
    listerPopState () {
        window.addEventListener('popstate' , e => {
            const path = e.state && e.state.path;
            this.routers[path] && this.routers[path]()
        })
    }
}

// 使用 Router

window.miniRouter = new Router();
miniRouter.route('/', ()=> console.log('page1'))
miniRouter.route('/page2', ()=> console.log('page2'))

// 跳转
miniRouter.push('/page2')  // page2
```

### 四、题外话：如何给SPA做SEO

下面给出基于`Vue`的`SPA`如何实现`SEO`的三种方式

1.  **SSR服务端渲染**

将组件或页面通过服务器生成html，再返回给浏览器，如`nuxt.js`

2.  **静态化**

目前主流的静态化主要有两种：（1）一种是通过程序将动态页面抓取并保存为静态页面，这样的页面的实际存在于服务器的硬盘中（2）另外一种是通过WEB服务器的 `URL Rewrite`的方式，它的原理是通过web服务器内部模块按一定规则将外部的URL请求转化为内部的文件地址，一句话来说就是把外部请求的静态地址转化为实际的动态页面地址，而静态页面实际是不存在的。这两种方法都达到了实现URL静态化的效果

3.  **使用`Phantomjs`针对爬虫处理**

原理是通过`Nginx`配置，判断访问来源是否为爬虫，如果是则搜索引擎的爬虫请求会转发到一个`node server`，再通过`PhantomJS`来解析完整的`HTML`，返回给爬虫。下面是大致流程图

 ![](https://static.ecool.fun//article/3777728d-9583-4965-abc2-582e1b56afa3.png)

</details>

## 367. web常见的攻击方式有哪些，以及如何进行防御？ {#question-947278fd-7485-4e8c-a704-83d48280e05a}

> 难度：3 · 类型：QA

### 题目要点

**答题要点：**

Web攻击是针对用户上网行为或网站服务器等设备进行攻击的行为，目的包括植入恶意代码、修改网站权限或获取网站用户隐私信息。常见的Web攻击方式包括跨站脚本攻击（XSS）、跨站请求伪造（CSRF）和SQL注入攻击。

XSS攻击允许攻击者将恶意代码植入到提供给其他用户使用的页面中，目的是盗取存储在客户端的cookie或其他网站用于识别客户端身份的敏感信息。XSS攻击可以分为存储型、反射型和DOM型。

CSRF攻击是通过诱导受害者访问第三方网站，在第三方网站中向被攻击网站发送跨站请求，利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

SQL注入攻击是通过将恶意的SQL查询或添加语句插入到应用的输入参数中，在后台SQL服务器上解析执行进行的攻击。预防方式包括严格检查输入变量的类型和格式、过滤和转义特殊字符以及对访问数据库的Web应用程序采用Web应用防火墙。

Web应用程序的安全性是任何基于Web业务的重要组成部分，确保Web应用程序安全十分重要，即使是代码中很小的bug也可能导致隐私信息被泄露。站点安全就是为保护站点不受未授权的访问、使用、修改和破坏而采取的行为或实践。

<details>
<summary>参考答案</summary>

## 一、是什么

Web攻击（WebAttack）是针对用户上网行为或网站服务器等设备进行攻击的行为

如植入恶意代码，修改网站权限，获取网站用户隐私信息等等

Web应用程序的安全性是任何基于Web业务的重要组成部分

确保Web应用程序安全十分重要，即使是代码中很小的 bug 也有可能导致隐私信息被泄露

站点安全就是为保护站点不受未授权的访问、使用、修改和破坏而采取的行为或实践

我们常见的Web攻击方式有

- XSS (Cross Site Scripting) 跨站脚本攻击
- CSRF（Cross-site request forgery）跨站请求伪造
- SQL注入攻击

## 二、XSS

XSS，跨站脚本攻击，允许攻击者将恶意代码植入到提供给其它用户使用的页面中

`XSS`涉及到三方，即攻击者、客户端与`Web`应用

`XSS`的攻击目标是为了盗取存储在客户端的`cookie`或者其他网站用于识别客户端身份的敏感信息。一旦获取到合法用户的信息后，攻击者甚至可以假冒合法用户与网站进行交互

举个例子：

一个搜索页面，根据`url`参数决定关键词的内容

```html
<input type="text" value="<%= getParameter("keyword") %>">
<button>搜索</button>
<div>
  您搜索的关键词是：<%= getParameter("keyword") %>
</div>
```

这里看似并没有问题，但是如果不按套路出牌呢？

用户输入`">&lt;script&gt;alert('XSS');&lt;/script&gt;`，拼接到 HTML 中返回给浏览器。形成了如下的 HTML：

```html
<input type="text" value=""><script>alert('XSS');</script>">
<button>搜索</button>
<div>
  您搜索的关键词是："><script>alert('XSS');</script>
</div>
```

浏览器无法分辨出 `&lt;script&gt;alert('XSS');&lt;/script&gt;` 是恶意代码，因而将其执行，试想一下，如果是获取`cookie`发送对黑客服务器呢？

根据攻击的来源，`XSS`攻击可以分成：

- 存储型
- 反射型
- DOM 型

### 存储型

存储型 XSS 的攻击步骤：

1. 攻击者将恶意代码提交到目标网站的数据库中
2. 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

这种攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等

### 反射型 XSS

反射型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码
2. 用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

反射型 XSS 跟存储型 XSS 的区别是：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。

反射型 XSS 漏洞常见于通过 URL 传递参数的功能，如网站搜索、跳转等。

由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。

POST 的内容也可以触发反射型 XSS，只不过其触发条件比较苛刻（需要构造表单提交页面，并引导用户点击），所以非常少见

### DOM 型 XSS

DOM 型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码
2. 用户打开带有恶意代码的 URL
3. 用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞

### XSS的预防

通过前面介绍，看到`XSS`攻击的两大要素：

- 攻击者提交而恶意代码
- 浏览器执行恶意代码

针对第一个要素，我们在用户输入的过程中，过滤掉用户输入的恶劣代码，然后提交给后端，但是如果攻击者绕开前端请求，直接构造请求就不能预防了

而如果在后端写入数据库前，对输入进行过滤，然后把内容给前端，但是这个内容在不同地方就会有不同显示

例如：

一个正常的用户输入了 `5 < 7` 这个内容，在写入数据库前，被转义，变成了 `5 < 7`

在客户端中，一旦经过了 `escapeHTML()`，客户端显示的内容就变成了乱码( `5 < 7` )

在前端中，不同的位置所需的编码也不同。

- 当 `5 < 7` 作为 HTML 拼接页面时，可以正常显示：

```html
<div title="comment">5 &lt; 7</div>
```

- 当 `5 < 7` 通过 Ajax 返回，然后赋值给 JavaScript 的变量时，前端得到的字符串就是转义后的字符。这个内容不能直接用于 Vue 等模板的展示，也不能直接用于内容长度计算。不能用于标题、alert 等

可以看到，过滤并非可靠的，下面就要通过防止浏览器执行恶意代码：

在使用 `.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 HTML 插到页面上，而应尽量使用 `.textContent`、`.setAttribute()` 等

如果用 `Vue/React` 技术栈，并且不使用 `v-html`/`dangerouslySetInnerHTML` 功能，就在前端 `render` 阶段避免 `innerHTML`、`outerHTML` 的 XSS 隐患

DOM 中的内联事件监听器，如 `location`、`onclick`、`onerror`、`onload`、`onmouseover` 等，`<a>` 标签的 `href` 属性，JavaScript 的 `eval()`、`setTimeout()`、`setInterval()` 等，都能把字符串作为代码运行。如果不可信的数据拼接到字符串中传递给这些 API，很容易产生安全隐患，请务必避免

```js
<!-- 链接内包含恶意代码 -->
< a href=" ">1</ a>

<script>
// setTimeout()/setInterval() 中调用恶意代码
setTimeout("UNTRUSTED")
setInterval("UNTRUSTED")

// location 调用恶意代码
location.href = 'UNTRUSTED'

// eval() 中调用恶意代码
eval("UNTRUSTED")
```

## 三、CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求

利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目

一个典型的CSRF攻击有着如下的流程：

- 受害者登录a.com，并保留了登录凭证（Cookie）
- 攻击者引诱受害者访问了b.com
- b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带a.com的Cookie
- a.com接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求
- a.com以受害者的名义执行了act=xx
- 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让a.com执行了自己定义的操作

`csrf`可以通过`get`请求，即通过访问`img`的页面后，浏览器自动访问目标地址，发送请求

同样，也可以设置一个自动提交的表单发送`post`请求，如下：

```js
<form action="http://bank.example/withdraw" method=POST>
    <input type="hidden" name="account" value="xiaoming" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="for" value="hacker" />
</form>
<script> document.forms[0].submit(); </script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次`POST`操作

还有一种为使用`a`标签的，需要用户点击链接才会触发

访问该页面后，表单会自动提交，相当于模拟用户完成了一次POST操作

```html
< a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
    重磅消息！！
<a/>
```

### CSRF的特点

- 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生
- 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据
- 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”
- 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪

### CSRF的预防<br>

CSRF通常从第三方网站发起，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对CSRF的防护能力来提升安全性

防止`csrf`常用方案如下：

- 阻止不明外域的访问
  - 同源检测
  - Samesite Cookie
- 提交时要求附加本域才能获取的信息
  - CSRF Token
  - 双重Cookie验证

这里主要讲讲`token`这种形式，流程如下：

- 用户打开页面的时候，服务器需要给这个用户生成一个Token
- 对于GET请求，Token将附在请求地址之后。对于 POST 请求来说，要在 form 的最后加上

```html
<input type=”hidden” name=”csrftoken” value=”tokenvalue”/>
```

- 当用户从客户端得到了Token，再次提交给服务器的时候，服务器需要判断Token的有效性

## 四、SQL注入

Sql 注入攻击，是通过将恶意的 `Sql `查询或添加语句插入到应用的输入参数中，再在后台 `Sql `服务器上解析执行进行的攻击

 ![](https://static.ecool.fun//article/91d30bea-31a8-42c5-8037-4aac3ef14669.png)

流程如下所示：

- 找出SQL漏洞的注入点

- 判断数据库的类型以及版本
- 猜解用户名和密码
- 利用工具查找Web后台管理入口
- 入侵和破坏

预防方式如下：

- 严格检查输入变量的类型和格式
- 过滤和转义特殊字符
- 对访问数据库的Web应用程序采用Web应用防火墙

上述只是列举了常见的`web`攻击方式，实际开发过程中还会遇到很多安全问题，对于这些问题， 切记不可忽视

</details>

## 368. 如何实现上拉加载，下拉刷新？ {#question-0567a810-b795-4c41-84e2-cba8ae4b97ac}

> 难度：2 · 类型：QA

### 题目要点

- **下拉刷新** 通过监听触摸事件，检测下拉距离，触发数据刷新，适用于移动设备上的刷新操作。
- **上拉加载** 通过监听滚动事件，检测用户是否接近底部，触发加载更多数据，适用于滚动时加载更多内容的操作。
- 这两个功能的实现需要处理触发条件、数据请求、界面更新等操作，以提供流畅的用户体验。

<details>
<summary>参考答案</summary>

## 一、前言

下拉刷新和上拉加载这两种交互方式通常出现在移动端中

本质上等同于PC网页中的分页，只是交互形式不同

开源社区也有很多优秀的解决方案，如`iscroll`、`better-scroll`、`pulltorefresh.js`库等等

这些第三方库使用起来非常便捷

我们通过原生的方式实现一次上拉加载，下拉刷新，有助于对第三方库有更好的理解与使用

## 二、实现原理

上拉加载及下拉刷新都依赖于用户交互

最重要的是要理解在什么场景，什么时机下触发交互动作

### 上拉加载

首先可以看一张图

 ![](https://static.ecool.fun//article/2b902391-514d-4b1f-87e5-c5b4f17e7871.png)

上拉加载的本质是页面触底，或者快要触底时的动作

判断页面触底我们需要先了解一下下面几个属性

- `scrollTop`：滚动视窗的高度距离`window`顶部的距离，它会随着往上滚动而不断增加，初始值是0，它是一个变化的值

- `clientHeight`:它是一个定值，表示屏幕可视区域的高度；
- `scrollHeight`：页面不能滚动时是不存在的，`body`长度超过`window`时才会出现，所表示`body`所有元素的长度

综上我们得出一个触底公式：

```js
scrollTop + clientHeight >= scrollHeight
```

简单实现

```js
let clientHeight  = document.documentElement.clientHeight; //浏览器高度
let scrollHeight = document.body.scrollHeight;
let scrollTop = document.documentElement.scrollTop;

let distance = 50;  //距离视窗还用50的时候，开始触发；

if ((scrollTop + clientHeight) >= (scrollHeight - distance)) {
    console.log("开始加载数据");
}
```

### 下拉刷新

下拉刷新的本质是页面本身置于顶部时，用户下拉时需要触发的动作

关于下拉刷新的原生实现，主要分成三步：

- 监听原生`touchstart`事件，记录其初始位置的值，`e.touches[0].pageY`；
- 监听原生`touchmove`事件，记录并计算当前滑动的位置值与初始位置值的差值，大于`0`表示向下拉动，并借助CSS3的`translateY`属性使元素跟随手势向下滑动对应的差值，同时也应设置一个允许滑动的最大值；
- 监听原生`touchend`事件，若此时元素滑动达到最大值，则触发`callback`，同时将`translateY`重设为`0`，元素回到初始位置

举个例子：

`Html`结构如下：

```js
<main>
    <p class="refreshText"></p >
    <ul id="refreshContainer">
        <li>111</li>
        <li>222</li>
        <li>333</li>
        <li>444</li>
        <li>555</li>
        ...
    </ul>
</main>
```

监听`touchstart`事件，记录初始的值

```js
var _element = document.getElementById('refreshContainer'),
    _refreshText = document.querySelector('.refreshText'),
    _startPos = 0,  // 初始的值
    _transitionHeight = 0; // 移动的距离

_element.addEventListener('touchstart', function(e) {
    _startPos = e.touches[0].pageY; // 记录初始位置
    _element.style.position = 'relative';
    _element.style.transition = 'transform 0s';
}, false);
```

监听`touchmove`移动事件，记录滑动差值

```js
_element.addEventListener('touchmove', function(e) {
    // e.touches[0].pageY 当前位置
    _transitionHeight = e.touches[0].pageY - _startPos; // 记录差值

    if (_transitionHeight > 0 && _transitionHeight < 60) {
        _refreshText.innerText = '下拉刷新';
        _element.style.transform = 'translateY('+_transitionHeight+'px)';

        if (_transitionHeight > 55) {
            _refreshText.innerText = '释放更新';
        }
    }
}, false);
```

最后，就是监听`touchend`离开的事件

```js
_element.addEventListener('touchend', function(e) {
    _element.style.transition = 'transform 0.5s ease 1s';
    _element.style.transform = 'translateY(0px)';
    _refreshText.innerText = '更新中...';
    // todo...

}, false);
```

从上面可以看到，在下拉到松手的过程中，经历了三个阶段：

- 当前手势滑动位置与初始位置差值大于零时，提示正在进行下拉刷新操作
- 下拉到一定值时，显示松手释放后的操作提示
- 下拉到达设定最大值松手时，执行回调，提示正在进行更新操作

## 三、案例

在实际开发中，我们更多的是使用第三方库，下面以`better-scroll`进行举例：

HTML结构

```js
<div id="position-wrapper">
    <div>
        <p class="refresh">下拉刷新</p >
        <div class="position-list">
   <!--列表内容-->
        </div>
        <p class="more">查看更多</p >
    </div>
</div>
```

实例化上拉下拉插件，通过`use`来注册插件

```js
import BScroll from "@better-scroll/core";
import PullDown from "@better-scroll/pull-down";
import PullUp from '@better-scroll/pull-up';
BScroll.use(PullDown);
BScroll.use(PullUp);
```

实例化`BetterScroll`，并传入相关的参数

```js
let pageNo = 1,pageSize = 10,dataList = [],isMore = true;
var scroll= new BScroll("#position-wrapper",{
    scrollY:true,//垂直方向滚动
    click:true,//默认会阻止浏览器的原生click事件，如果需要点击，这里要设为true
    pullUpLoad:true,//上拉加载更多
    pullDownRefresh:{
        threshold:50,//触发pullingDown事件的位置
        stop:0//下拉回弹后停留的位置
    }
});
//监听下拉刷新
scroll.on("pullingDown",pullingDownHandler);
//监测实时滚动
scroll.on("scroll",scrollHandler);
//上拉加载更多
scroll.on("pullingUp",pullingUpHandler);

async function pullingDownHandler(){
    dataList=[];
    pageNo=1;
    isMore=true;
    $(".more").text("查看更多");
    await getlist();//请求数据
    scroll.finishPullDown();//每次下拉结束后，需要执行这个操作
    scroll.refresh();//当滚动区域的dom结构有变化时，需要执行这个操作
}
async function pullingUpHandler(){
    if(!isMore){
        $(".more").text("没有更多数据了");
        scroll.finishPullUp();//每次上拉结束后，需要执行这个操作
        return;
    }
    pageNo++;
    await this.getlist();//请求数据
    scroll.finishPullUp();//每次上拉结束后，需要执行这个操作
    scroll.refresh();//当滚动区域的dom结构有变化时，需要执行这个操作
}
function scrollHandler(){
    if(this.y>50) $('.refresh').text("松手开始加载");
    else $('.refresh').text("下拉刷新");
}
function getlist(){
    //返回的数据
    let result=....;
    dataList=dataList.concat(result);
    //判断是否已加载完
    if(result.length<pageSize) isMore=false;
    //将dataList渲染到html内容中
}
```

注意点：

使用`better-scroll `实现下拉刷新、上拉加载时要注意以下几点：

- `wrapper`里必须只有一个子元素
- 子元素的高度要比`wrapper`要高
- 使用的时候，要确定`DOM`元素是否已经生成，必须要等到`DOM`渲染完成后，再`new BScroll()`
- 滚动区域的`DOM`元素结构有变化后，需要执行刷新 `refresh() `
- 上拉或者下拉，结束后，需要执行`finishPullUp()`或者`finishPullDown()`，否则将不会执行下次操作
- `better-scroll`，默认会阻止浏览器的原生`click`事件，如果滚动内容区要添加点击事件，需要在实例化属性里设置`click:true`

### 小结

下拉刷新、上拉加载原理本身都很简单，真正复杂的是封装过程中，要考虑的兼容性、易用性、性能等诸多细节

</details>

## 369. 大文件怎么实现断点续传？ {#question-7b63d3a8-32c4-4561-95fc-77755ea629f1}

> 难度：3 · 类型：QA

### 题目要点

- **文件分块**：将大文件分成多个块，以便更好地管理和恢复。
- **客户端实现**：处理文件选择、分块上传/下载、保存进度、恢复操作。
- **服务器端实现**：支持接收文件块、合并块、处理断点续传请求。
- **技术支持**：使用 HTTP 头部（如 `Range`、`Content-Range`）和状态记录来实现断点续传。

<details>
<summary>参考答案</summary>

## 一、是什么

不管怎样简单的需求，在量级达到一定层次时，都会变得异常复杂

文件上传简单，文件变大就复杂

上传大文件时，以下几个变量会影响我们的用户体验

- 服务器处理数据的能力
- 请求超时
- 网络波动

上传时间会变长，高频次文件上传失败，失败后又需要重新上传等等

为了解决上述问题，我们需要对大文件上传单独处理

这里涉及到分片上传及断点续传两个概念

#### 分片上传

分片上传，就是将所要上传的文件，按照一定的大小，将整个文件分隔成多个数据块（Part）来进行分片上传

如下图

 ![](https://static.ecool.fun//article/601be6fe-4b6e-420b-b88a-0e54be051d02.png)

上传完之后再由服务端对所有上传的文件进行汇总整合成原始的文件

大致流程如下：

1. 将需要上传的文件按照一定的分割规则，分割成相同大小的数据块；
2. 初始化一个分片上传任务，返回本次分片上传唯一标识；
3. 按照一定的策略（串行或并行）发送各个分片数据块；
4. 发送完成后，服务端根据判断数据上传是否完整，如果完整，则进行数据块合成得到原始文件

#### 断点续传

断点续传指的是在下载或上传时，将下载或上传任务人为的划分为几个部分

每一个部分采用一个线程进行上传或下载，如果碰到网络故障，可以从已经上传或下载的部分开始继续上传下载未完成的部分，而没有必要从头开始上传下载。用户可以节省时间，提高速度

一般实现方式有两种：

- 服务器端返回，告知从哪开始
- 浏览器端自行处理

上传过程中将文件在服务器写为临时文件，等全部写完了（文件上传完），将此临时文件重命名为正式文件即可

如果中途上传中断过，下次上传的时候根据当前临时文件大小，作为在客户端读取文件的偏移量，从此位置继续读取文件数据块，上传到服务器从此偏移量继续写入文件即可

## 二、实现思路

整体思路比较简单，拿到文件，保存文件唯一性标识，切割文件，分段上传，每次上传一段，根据唯一性标识判断文件上传进度，直到文件的全部片段上传完毕

![](https://static.ecool.fun//article/a9b201e1-12dc-4598-a7a1-205a15d573f2.png)

下面的内容都是伪代码

读取文件内容：

```js
const input = document.querySelector('input');
input.addEventListener('change', function() {
    var file = this.files[0];
});
```

可以使用`md5`实现文件的唯一性

```js
const md5code = md5(file);
```

然后开始对文件进行分割

```js
var reader = new FileReader();
reader.readAsArrayBuffer(file);
reader.addEventListener("load", function(e) {
    //每10M切割一段,这里只做一个切割演示，实际切割需要循环切割，
    var slice = e.target.result.slice(0, 10*1024*1024);
});
```

h5上传一个（一片）

```js
const formdata = new FormData();
formdata.append('0', slice);
//这里是有一个坑的，部分设备无法获取文件名称，和文件类型，这个在最后给出解决方案
formdata.append('filename', file.filename);
var xhr = new XMLHttpRequest();
xhr.addEventListener('load', function() {
    //xhr.responseText
});
xhr.open('POST', '');
xhr.send(formdata);
xhr.addEventListener('progress', updateProgress);
xhr.upload.addEventListener('progress', updateProgress);

function updateProgress(event) {
    if (event.lengthComputable) {
        //进度条
    }
}
```

这里给出常见的图片和视频的文件类型判断

```js
function checkFileType(type, file, back) {
/**
* type png jpg mp4 ...
* file input.change=> this.files[0]
* back callback(boolean)
*/
    var args = arguments;
    if (args.length != 3) {
        back(0);
    }
    var type = args[0]; // type = '(png|jpg)' , 'png'
    var file = args[1];
    var back = typeof args[2] == 'function' ? args[2] : function() {};
    if (file.type == '') {
        // 如果系统无法获取文件类型，则读取二进制流，对二进制进行解析文件类型
        var imgType = [
            'ff d8 ff', //jpg
            '89 50 4e', //png

            '0 0 0 14 66 74 79 70 69 73 6F 6D', //mp4
            '0 0 0 18 66 74 79 70 33 67 70 35', //mp4
            '0 0 0 0 66 74 79 70 33 67 70 35', //mp4
            '0 0 0 0 66 74 79 70 4D 53 4E 56', //mp4
            '0 0 0 0 66 74 79 70 69 73 6F 6D', //mp4

            '0 0 0 18 66 74 79 70 6D 70 34 32', //m4v
            '0 0 0 0 66 74 79 70 6D 70 34 32', //m4v

            '0 0 0 14 66 74 79 70 71 74 20 20', //mov
            '0 0 0 0 66 74 79 70 71 74 20 20', //mov
            '0 0 0 0 6D 6F 6F 76', //mov

            '4F 67 67 53 0 02', //ogg
            '1A 45 DF A3', //ogg

            '52 49 46 46 x x x x 41 56 49 20', //avi (RIFF fileSize fileType LIST)(52 49 46 46,DC 6C 57 09,41 56 49 20,4C 49 53 54)
        ];
        var typeName = [
            'jpg',
            'png',
            'mp4',
            'mp4',
            'mp4',
            'mp4',
            'mp4',
            'm4v',
            'm4v',
            'mov',
            'mov',
            'mov',
            'ogg',
            'ogg',
            'avi',
        ];
        var sliceSize = /png|jpg|jpeg/.test(type) ? 3 : 12;
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener("load", function(e) {
            var slice = e.target.result.slice(0, sliceSize);
            reader = null;
            if (slice && slice.byteLength == sliceSize) {
                var view = new Uint8Array(slice);
                var arr = [];
                view.forEach(function(v) {
                    arr.push(v.toString(16));
                });
                view = null;
                var idx = arr.join(' ').indexOf(imgType);
                if (idx > -1) {
                    back(typeName[idx]);
                } else {
                    arr = arr.map(function(v) {
                        if (i > 3 && i < 8) {
                            return 'x';
                        }
                        return v;
                    });
                    var idx = arr.join(' ').indexOf(imgType);
                    if (idx > -1) {
                        back(typeName[idx]);
                    } else {
                        back(false);
                    }

                }
            } else {
                back(false);
            }

        });
    } else {
        var type = file.name.match(/\.(\w+)$/)[1];
        back(type);
    }
}
```

调用方法如下

```js
checkFileType('(mov|mp4|avi)',file,function(fileType){
    // fileType = mp4,
    // 如果file的类型不在枚举之列，则返回false
});
```

上面上传文件的一步，可以改成：

```js
formdata.append('filename', md5code+'.'+fileType);
```

有了切割上传后，也就有了文件唯一标识信息，断点续传变成了后台的一个小小的逻辑判断

后端主要做的内容为：根据前端传给后台的`md5`值，到服务器磁盘查找是否有之前未完成的文件合并信息（也就是未完成的半成品文件切片），取到之后根据上传切片的数量，返回数据告诉前端开始从第几节上传

如果想要暂停切片的上传，可以使用`XMLHttpRequest `的 `abort `方法

## 三、使用场景

- 大文件加速上传：当文件大小超过预期大小时，使用分片上传可实现并行上传多个 Part， 以加快上传速度
- 网络环境较差：建议使用分片上传。当出现上传失败的时候，仅需重传失败的Part
- 流式上传：可以在需要上传的文件大小还不确定的情况下开始上传。这种场景在视频监控等行业应用中比较常见

## 小结

当前的伪代码，只是提供一个简单的思路，想要把事情做到极致，我们还需要考虑到更多场景，比如

- 切片上传失败怎么办
- 上传过程中刷新页面怎么办
- 如何进行并行上传
- 切片什么时候按数量切，什么时候按大小切
- 如何结合 Web Work 处理大文件上传
- 如何实现秒传

人生又何尝不是如此，极致的人生体验有无限可能，越是后面才发现越是精彩 ~_~

</details>

## 370. 如何判断一个元素是否在可视区域中？ {#question-ccde1c25-c646-4521-bf81-fcb0a3581ce2}

> 难度：2 · 类型：QA

### 题目要点

- **`IntersectionObserver`**：性能优化的现代方法，适合检测视口内的元素。
- **`getBoundingClientRect()`**：传统方法，直接计算元素的边界与视口的相对位置。
- **`document.elementFromPoint()`**：通过坐标检查，适合用于特定情况下的元素检测。

选择方法时，可以根据需要的精确度、性能要求和兼容性来决定。

<details>
<summary>参考答案</summary>

## 一、用途

可视区域即我们浏览网页的设备肉眼可见的区域，如下图

 ![](https://static.ecool.fun//article/caa61e4f-745d-4519-9254-2c8e4640b536.png)

在日常开发中，我们经常需要判断目标元素是否在视窗之内或者和视窗的距离小于一个值（例如 100 px），从而实现一些常用的功能，例如：

- 图片的懒加载
- 列表的无限滚动
- 计算广告元素的曝光情况
- 可点击链接的预加载

## 二、实现方式

判断一个元素是否在可视区域，我们常用的有三种办法：

- offsetTop、scrollTop

- getBoundingClientRect
- Intersection Observer

### offsetTop、scrollTop

`offsetTop`，元素的上外边框至包含元素的上内边框之间的像素距离，其他`offset`属性如下图所示：

 ![](https://static.ecool.fun//article/617781ee-d43a-4173-a08f-e7a7312c97fd.png)

下面再来了解下`clientWidth`、`clientHeight`：

- `clientWidth`：元素内容区宽度加上左右内边距宽度，即`clientWidth = content + padding`
- `clientHeight`：元素内容区高度加上上下内边距高度，即`clientHeight = content + padding`

这里可以看到`client`元素都不包括外边距

最后，关于`scroll`系列的属性如下：

- `scrollWidth` 和 `scrollHeight` 主要用于确定元素内容的实际大小

- `scrollLeft` 和 `scrollTop` 属性既可以确定元素当前滚动的状态，也可以设置元素的滚动位置

- - 垂直滚动 `scrollTop > 0`
  - 水平滚动 `scrollLeft > 0`

- 将元素的 `scrollLeft` 和 `scrollTop` 设置为 0，可以重置元素的滚动位置

#### 注意

- 上述属性都是只读的，每次访问都要重新开始

下面再看看如何实现判断：

公式如下：

```js
el.offsetTop - document.documentElement.scrollTop <= viewPortHeight
```

代码实现：

```js
function isInViewPortOfOne (el) {
    // viewPortHeight 兼容所有浏览器写法
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    const offsetTop = el.offsetTop
    const scrollTop = document.documentElement.scrollTop
    const top = offsetTop - scrollTop
    return top <= viewPortHeight
}
```

### getBoundingClientRect

返回值是一个 `DOMRect`对象，拥有`left`, `top`, `right`, `bottom`, `x`, `y`, `width`, 和 `height`属性

```js
const target = document.querySelector('.target');
const clientRect = target.getBoundingClientRect();
console.log(clientRect);

// {
//   bottom: 556.21875,
//   height: 393.59375,
//   left: 333,
//   right: 1017,
//   top: 162.625,
//   width: 684
// }
```

属性对应的关系图如下所示：

 ![](https://static.ecool.fun//article/3c21ff35-b9e1-4009-920b-79460d148699.png)

当页面发生滚动的时候，`top`与`left`属性值都会随之改变

如果一个元素在视窗之内的话，那么它一定满足下面四个条件：

- top 大于等于 0
- left 大于等于 0
- bottom 小于等于视窗高度
- right 小于等于视窗宽度

实现代码如下：

```js
function isInViewPort(element) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const {
    top,
    right,
    bottom,
    left,
  } = element.getBoundingClientRect();

  return (
    top >= 0 &&
    left >= 0 &&
    right <= viewWidth &&
    bottom <= viewHeight
  );
}
```

### Intersection Observer

`Intersection Observer` 即重叠观察者，从这个命名就可以看出它用于判断两个元素是否重叠，因为不用进行事件的监听，性能方面相比`getBoundingClientRect `会好很多

使用步骤主要分为两步：创建观察者和传入被观察者

#### 创建观察者

```js
const options = {
  // 表示重叠面积占被观察者的比例，从 0 - 1 取值，
  // 1 表示完全被包含
  threshold: 1.0,
  root:document.querySelector('#scrollArea') // 必须是目标元素的父级元素
};

const callback = (entries, observer) => { ....}

const observer = new IntersectionObserver(callback, options);
```

通过`new IntersectionObserver`创建了观察者 `observer`，传入的参数 `callback` 在重叠比例超过 `threshold` 时会被执行`

关于`callback`回调函数常用属性如下：

```js
// 上段代码中被省略的 callback
const callback = function(entries, observer) {
    entries.forEach(entry => {
        entry.time;               // 触发的时间
        entry.rootBounds;         // 根元素的位置矩形，这种情况下为视窗位置
        entry.boundingClientRect; // 被观察者的位置举行
        entry.intersectionRect;   // 重叠区域的位置矩形
        entry.intersectionRatio;  // 重叠区域占被观察者面积的比例（被观察者不是矩形时也按照矩形计算）
        entry.target;             // 被观察者
    });
};
```

#### 传入被观察者

通过 `observer.observe(target)` 这一行代码即可简单的注册被观察者

```js
const target = document.querySelector('.target');
observer.observe(target);
```

### 三、案例分析

实现：创建了一个十万个节点的长列表，当节点滚入到视窗中时，背景就会从红色变为黄色

`Html`结构如下：

```js
<div class="container"></div>
```

`css`样式如下：

```css
.container {
    display: flex;
    flex-wrap: wrap;
}
.target {
    margin: 5px;
    width: 20px;
    height: 20px;
    background: red;
}
```

往`container`插入1000个元素

```js
const $container = $(".container");

// 插入 100000 个 <div class="target"></div>
function createTargets() {
  const htmlString = new Array(100000)
    .fill('<div class="target"></div>')
    .join("");
  $container.html(htmlString);
}
```

这里，首先使用`getBoundingClientRect `方法进行判断元素是否在可视区域

```js
function isInViewPort(element) {
    const viewWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewHeight =
          window.innerHeight || document.documentElement.clientHeight;
    const { top, right, bottom, left } = element.getBoundingClientRect();

    return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight;
}
```

然后开始监听`scroll`事件，判断页面上哪些元素在可视区域中，如果在可视区域中则将背景颜色设置为`yellow`

```js
$(window).on("scroll", () => {
    console.log("scroll !");
    $targets.each((index, element) => {
        if (isInViewPort(element)) {
            $(element).css("background-color", "yellow");
        }
    });
});
```

通过上述方式，可以看到可视区域颜色会变成黄色了，但是可以明显看到有卡顿的现象，原因在于我们绑定了`scroll`事件，`scroll`事件伴随了大量的计算，会造成资源方面的浪费

下面通过`Intersection Observer`的形式同样实现相同的功能

首先创建一个观察者

```js
const observer = new IntersectionObserver(getYellow, { threshold: 1.0 });
```

`getYellow`回调函数实现对背景颜色改变，如下：

```js
function getYellow(entries, observer) {
    entries.forEach(entry => {
        $(entry.target).css("background-color", "yellow");
    });
}
```

最后传入观察者，即`.target`元素

```js
$targets.each((index, element) => {
    observer.observe(element);
});
```

可以看到功能同样完成，并且页面不会出现卡顿的情况

</details>

## 371. 什么是防抖和节流，以及如何编码实现？ {#question-7fa82090-78a2-4445-a982-48ed95cb20c0}

> 难度：2 · 类型：QA

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

## 372. 说说 Javascript 为什么会存在数字精度丢失的问题，以及如何进行解决？ {#question-c141b446-0f24-4580-8594-f61f23dc5979}

> 难度：3 · 类型：QA

### 题目要点

## 原因

1. **IEEE 754标准**：JavaScript使用IEEE 754标准的双精度浮点数格式（64位）来表示数字，这意味着某些十进制小数无法精确表示成二进制小数。

2. **精度限制**：由于浮点数的表示方式，JavaScript中能精确表示的数字有限。当数字很大或者很小，或者进行复杂运算时，精度丢失尤为明显。

3. **运算误差**：在进行浮点数运算时，由于表示上的不精确，会产生累积误差。

## 解决方法

1. **使用整数**：如果问题允许，尽量使用整数进行计算，避免使用浮点数。

2. **固定小数点**：对于需要精确的小数计算，可以考虑将数值转换为固定的小数点表示，例如通过乘以一个基数（如100或1000）。

3. **使用第三方库**：使用如`decimal.js`或`big.js`等第三方库，这些库提供了更精确的十进制或任意精度浮点数运算。

4. **避免敏感操作**：避免进行可能导致精度问题的敏感操作，如减法和模运算。

5. **四舍五入**：在显示或使用前对数字进行四舍五入处理。

6. **科学记数法**：在适当的情况下，使用科学记数法表示大数字。

7. **避免不必要的运算**：减少不必要的运算，尤其是在循环中的浮点运算。

8. **使用内置方法**：利用JavaScript内置的`Math`对象的方法，如`Math.round()`, `Math.floor()`, `Math.ceil()`进行数值处理。

## 示例代码

```javascript
// 避免使用浮点数进行敏感计算
const a = 0.1 + 0.2;
console.log(a); // 0.30000000000000004 而不是精确的 0.3

// 使用整数或固定小数点
const b = (0.1 * 10 + 0.2 * 10) / 10; // 3
console.log(b); // 0.3

// 使用第三方库 decimal.js
const Decimal = require('decimal.js');
const sum = new Decimal('0.1').plus(0.2);
console.log(sum.toDecimalPlaces(1)); // '0.3'

<details>
<summary>参考答案</summary>

## 一、场景复现

一个经典的面试题

```js
0.1 + 0.2 === 0.3 // false
```

为什么是`false`呢?

先看下面这个比喻

比如一个数 1÷3=0.33333333......

3会一直无限循环，数学可以表示，但是计算机要存储，方便下次取出来再使用，但0.333333...... 这个数无限循环，再大的内存它也存不下，所以不能存储一个相对于数学来说的值，只能存储一个近似值，当计算机存储后再取出时就会出现精度丢失问题

## 二、浮点数

“浮点数”是一种表示数字的标准，整数也可以用浮点数的格式来存储

我们也可以理解成，浮点数就是小数

在`JavaScript`中，现在主流的数值类型是`Number`，而`Number`采用的是`IEEE754`规范中64位双精度浮点数编码

这样的存储结构优点是可以归一化处理整数和小数，节省存储空间

对于一个整数，可以很轻易转化成十进制或者二进制。但是对于一个浮点数来说，因为小数点的存在，小数点的位置不是固定的。解决思路就是使用科学计数法，这样小数点位置就固定了

而计算机只能用二进制（0或1）表示，二进制转换为科学记数法的公式如下：

 ![](https://static.ecool.fun//article/af4640ef-8762-4b7e-8bee-27be5e438afc.png)

其中，`a`的值为0或者1，e为小数点移动的位置

举个例子：

27.0转化成二进制为11011.0 ，科学计数法表示为：

 ![](https://static.ecool.fun//article/e2abc5db-7358-47a9-854e-86e15503fc82.png)

前面讲到，`javaScript`存储方式是双精度浮点数，其长度为8个字节，即64位比特

64位比特又可分为三个部分：

- 符号位S：第 1 位是正负数符号位（sign），0代表正数，1代表负数
- 指数位E：中间的 11 位存储指数（exponent），用来表示次方数，可以为正负数。在双精度浮点数中，指数的固定偏移量为1023
- 尾数位M：最后的 52 位是尾数（mantissa），超出的部分自动进一舍零

如下图所示：

 ![](https://static.ecool.fun//article/0172e7c7-4e85-4343-8d79-5ff91cb450e1.png)

举个例子：

27.5 转换为二进制11011.1

11011.1转换为科学记数法 ![[公式]](https://www.zhihu.com/equation?tex=1.10111%2A2%5E4)

符号位为1(正数)，指数位为4+，1023+4，即1027

因为它是十进制的需要转换为二进制，即 `10000000011`，小数部分为`10111`，补够52位即： 1011 1000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000`

所以27.5存储为计算机的二进制标准形式（符号位+指数位+小数部分 (阶数)），即下面所示

0+10000000011+1011 1000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000`

## 二、问题分析

再回到问题上

```js
0.1 + 0.2 === 0.3 // false
```

通过上面的学习，我们知道，在`javascript`语言中，0.1 和 0.2 都转化成二进制后再进行运算

```js
// 0.1 和 0.2 都转化成二进制后再进行运算
0.00011001100110011001100110011001100110011001100110011010 +
0.0011001100110011001100110011001100110011001100110011010 =
0.0100110011001100110011001100110011001100110011001100111

// 转成十进制正好是 0.30000000000000004
```

所以输出`false`

再来一个问题，那么为什么`x=0.1`得到`0.1`？

主要是存储二进制时小数点的偏移量最大为52位，最多可以表达的位数是`2^53=9007199254740992`，对应科学计数尾数是 `9.007199254740992`，这也是 JS 最多能表示的精度

它的长度是 16，所以可以使用 `toPrecision(16)` 来做精度运算，超过的精度会自动做凑整处理

```js
.10000000000000000555.toPrecision(16)
// 返回 0.1000000000000000，去掉末尾的零后正好为 0.1
```

但看到的 `0.1` 实际上并不是 `0.1`。不信你可用更高的精度试试：

```js
0.1.toPrecision(21) = 0.100000000000000005551
```

如果整数大于 `9007199254740992` 会出现什么情况呢？

由于指数位最大值是1023，所以最大可以表示的整数是 `2^1024 - 1`，这就是能表示的最大整数。但你并不能这样计算这个数字，因为从 `2^1024` 开始就变成了 `Infinity`

```
> Math.pow(2, 1023)
8.98846567431158e+307

> Math.pow(2, 1024)
Infinity
```

那么对于 `(2^53, 2^63)` 之间的数会出现什么情况呢？

- `(2^53, 2^54)` 之间的数会两个选一个，只能精确表示偶数
- `(2^54, 2^55)` 之间的数会四个选一个，只能精确表示4个倍数
- ... 依次跳过更多2的倍数

要想解决大数的问题你可以引用第三方库 `bignumber.js`，原理是把所有数字当作字符串，重新实现了计算逻辑，缺点是性能比原生差很多

### 小结

计算机存储双精度浮点数需要先把十进制数转换为二进制的科学记数法的形式，然后计算机以自己的规则{符号位+(指数位+指数偏移量的二进制)+小数部分}存储二进制的科学记数法

因为存储时有位数限制（64位），并且某些十进制的浮点数在转换为二进制数时会出现无限循环，会造成二进制的舍入操作(0舍1入)，当再转换为十进制时就造成了计算误差

## 三、解决方案

理论上用有限的空间来存储无限的小数是不可能保证精确的，但我们可以处理一下得到我们期望的结果

当你拿到 `1.4000000000000001` 这样的数据要展示时，建议使用 `toPrecision` 凑整并 `parseFloat` 转成数字后再显示，如下：

```
parseFloat(1.4000000000000001.toPrecision(12)) === 1.4  // True
```

封装成方法就是：

```js
function strip(num, precision = 12) {
  return +parseFloat(num.toPrecision(precision));
}
```

对于运算类操作，如 `+-*/`，就不能使用 `toPrecision` 了。正确的做法是把小数转成整数后再运算。以加法为例：

```js
/**
 * 精确加法
 */
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```

最后还可以使用第三方库，如`Math.js`、`BigDecimal.js`

</details>

## 373. Javascript中如何实现函数缓存？函数缓存有哪些应用场景？ {#question-0735b620-52b9-441a-9298-7dc2b54d2ef0}

> 难度：2 · 类型：QA

### 题目要点

函数缓存，就是将函数运算过的结果进行缓存

<details>
<summary>参考答案</summary>

## 一、是什么

函数缓存，就是将函数运算过的结果进行缓存

本质上就是用空间（缓存存储）换时间（计算过程）

常用于缓存数据计算结果和缓存对象

```js
const add = (a,b) => a+b;
const calc = memoize(add); // 函数缓存
calc(10,20);// 30
calc(10,20);// 30 缓存
```

缓存只是一个临时的数据存储，它保存数据，以便将来对该数据的请求能够更快地得到处理

## 二、如何实现

实现函数缓存主要依靠闭包、柯里化、高阶函数，这里再简单复习下：

### 闭包

闭包可以理解成，函数 + 函数体内可访问的变量总和

```js
(function() {
    var a = 1;
    function add() {
        const b = 2
        let sum = b + a
        console.log(sum); // 3
    }
    add()
})()
```

`add `函数本身，以及其内部可访问的变量，即 `a = 1 `，这两个组合在⼀起就形成了闭包

### 柯里化

把接受多个参数的函数转换成接受一个单一参数的函数

```js
// 非函数柯里化
var add = function (x,y) {
    return x+y;
}
add(3,4) //7

// 函数柯里化
var add2 = function (x) {
    //**返回函数**
    return function (y) {
        return x+y;
    }
}
add2(3)(4) //7
```

将一个二元函数拆分成两个一元函数

### 高阶函数

通过接收其他函数作为参数或返回其他函数的函数

```js
function foo(){
  var a = 2;

  function bar() {
    console.log(a);
  }
  return bar;
}
var baz = foo();
baz();//2
```

函数 `foo` 如何返回另一个函数 `bar`，`baz` 现在持有对 `foo` 中定义的`bar` 函数的引用。由于闭包特性，`a`的值能够得到

下面再看看如何实现函数缓存，实现原理也很简单，把参数和对应的结果数据存在一个对象中，调用时判断参数对应的数据是否存在，存在就返回对应的结果数据，否则就返回计算结果

如下所示

```js
const memoize = function (func, content) {
  let cache = Object.create(null)
  content = content || this
  return (...key) => {
    if (!cache[key]) {
      cache[key] = func.apply(content, key)
    }
    return cache[key]
  }
}
```

调用方式也很简单

```js
const calc = memoize(add);
const num1 = calc(100,200)
const num2 = calc(100,200) // 缓存得到的结果
```

过程分析：

- 在当前函数作用域定义了一个空对象，用于缓存运行结果
- 运用柯里化返回一个函数，返回的函数由于闭包特性，可以访问到`cache`
- 然后判断输入参数是不是在`cache`的中。如果已经存在，直接返回`cache`的内容，如果没有存在，使用函数`func`对输入参数求值，然后把结果存储在`cache`中

## 三、应用场景

虽然使用缓存效率是非常高的，但并不是所有场景都适用，因此千万不要极端的将所有函数都添加缓存

以下几种情况下，适合使用缓存：

- 对于昂贵的函数调用，执行复杂计算的函数
- 对于具有有限且高度重复输入范围的函数
- 对于具有重复输入值的递归函数
- 对于纯函数，即每次使用特定输入调用时返回相同输出的函数

</details>

## 374. 说说你对函数式编程的理解，以及优缺点？ {#question-a30c0639-0784-4326-85b5-0fd73e90b988}

> 难度：3 · 类型：QA

### 题目要点

# 函数式编程的理解

函数式编程是一种编程范式，其核心思想包括：

1. **不可变性**：在函数式编程中，数据是不可变的。一旦创建，数据就不能被改变。
2. **纯函数**：函数的输出只依赖于输入的参数，不依赖于任何外部状态或数据。
3. **高阶函数**：函数可以作为参数传递给其他函数，也可以作为结果返回。
4. **函数组合**：通过组合简单的函数来构建更复杂的功能。
5. **避免副作用**：尽量减少或避免产生副作用的操作，如修改全局变量或输出到控制台。

## 优点

1. **易于理解**：纯函数和不可变数据使得代码更易于理解和预测。
2. **易于测试**：由于函数不依赖于外部状态，因此更容易编写测试用例。
3. **并发编程**：函数式编程天然支持并发和并行处理，因为避免了共享状态和竞态条件。
4. **代码复用**：高阶函数和函数组合使得代码复用变得更加容易。
5. **避免错误**：减少副作用和状态管理有助于避免许多常见的编程错误。
6. **声明式编程**：函数式编程更侧重于描述“做什么”，而不是“怎么做”。

## 缺点

1. **学习曲线**：对于习惯于命令式编程的开发者来说，函数式编程可能需要一段时间来适应。
2. **性能问题**：在某些情况下，函数式编程可能会引入额外的性能开销，尤其是在频繁创建不可变数据时。
3. **代码冗长**：有时，函数式编程的代码可能会比命令式编程更加冗长和复杂。
4. **生态系统支持**：虽然许多现代编程语言支持函数式编程，但并不是所有的库和框架都提供了良好的函数式编程支持。
5. **调试困难**：由于高阶函数和闭包的使用，调试函数式编程代码可能会更加困难。

## 示例代码

```javascript
// 纯函数示例
const add = (a, b) => a + b;
console.log(add(2, 3)); // 5

// 高阶函数示例
const map = (arr, fn) => arr.map(fn);
const square = x => x * x;
console.log(map([1, 2, 3], square)); // [1, 4, 9]

// 函数组合示例
const multiply = (a, b) => a * b;
const increment = x => x + 1;
const multiplyAfterIncrement = multiply(increment);
console.log(multiplyAfterIncrement(5)); // 30

<details>
<summary>参考答案</summary>

## 一、是什么

函数式编程是一种"编程范式"（programming paradigm），一种编写程序的方法论

主要的编程范式有三种：命令式编程，声明式编程和函数式编程

相比命令式编程，函数式编程更加强调程序执行的结果而非执行的过程，倡导利用若干简单的执行单元让计算结果不断渐进，逐层推导复杂的运算，而非设计一个复杂的执行过程

举个例子，将数组每个元素进行平方操作，命令式编程与函数式编程如下

```js
// 命令式编程
var array = [0, 1, 2, 3]
for(let i = 0; i < array.length; i++) {
    array[i] = Math.pow(array[i], 2)
}

// 函数式方式
[0, 1, 2, 3].map(num => Math.pow(num, 2))
```

简单来讲，就是要把过程逻辑写成函数，定义好输入参数，只关心它的输出结果

即是一种描述集合和集合之间的转换关系，输入通过函数都会返回有且只有一个输出值

 ![](https://static.ecool.fun//article/8054e1a6-df46-4e8d-bc50-cf05f17db45c.png)

可以看到，函数实际上是一个关系，或者说是一种映射，而这种映射关系是可以组合的，一旦我们知道一个函数的输出类型可以匹配另一个函数的输入，那他们就可以进行组合

## 二、概念

### 纯函数

函数式编程旨在尽可能的提高代码的无状态性和不变性。要做到这一点，就要学会使用无副作用的函数，也就是纯函数

纯函数是对给定的输入返还相同输出的函数，并且要求你所有的数据都是不可变的，即纯函数=无状态+数据不可变

 ![](https://static.ecool.fun//article/7fed8364-372b-438b-902b-571577ee4e04.png)

举一个简单的例子

```js
let double = value=>value*2;
```

特性：

- 函数内部传入指定的值，就会返回确定唯一的值
- 不会造成超出作用域的变化，例如修改全局变量或引用传递的参数

优势：

- 使用纯函数，我们可以产生可测试的代码

```js
test('double(2) 等于 4', () => {
  expect(double(2)).toBe(4);
})
```

- 不依赖外部环境计算，不会产生副作用，提高函数的复用性

- 可读性更强 ，函数不管是否是纯函数  都会有一个语义化的名称，更便于阅读

- 可以组装成复杂任务的可能性。符合模块化概念及单一职责原则

### 高阶函数

在我们的编程世界中，我们需要处理的其实也只有“数据”和“关系”，而关系就是函数

编程工作也就是在找一种映射关系，一旦关系找到了，问题就解决了，剩下的事情，就是让数据流过这种关系，然后转换成另一个数据，如下图所示

 ![](https://static.ecool.fun//article/68c8cde0-0d1d-4601-a86c-a475338a6273.png)

在这里，就是高阶函数的作用。

高阶函数，就是以函数作为输入或者输出的函数被称为高阶函数

通过高阶函数抽象过程，注重结果，如下面例子

```js
const forEach = function(arr,fn){
    for(let i=0;i<arr.length;i++){
        fn(arr[i]);
    }
}
let arr = [1,2,3];
forEach(arr,(item)=>{
    console.log(item);
})
```

上面通过高阶函数 `forEach`来抽象循环如何做的逻辑，直接关注做了什么

高阶函数存在缓存的特性，主要是利用闭包作用

```js
const once = (fn)=>{
    let done = false;
    return function(){
        if(!done){
            fn.apply(this,fn);
        }else{
            console.log("该函数已经执行");
        }
        done = true;
    }
}
```

### 柯里化

柯里化是把一个多参数函数转化成一个嵌套的一元函数的过程

一个二元函数如下：

```js
let fn = (x,y)=>x+y;
```

转化成柯里化函数如下：

```js
const curry = function(fn){
    return function(x){
        return function(y){
            return fn(x,y);
        }
    }
}
let myfn = curry(fn);
console.log( myfn(1)(2) );
```

上面的`curry`函数只能处理二元情况，下面再来实现一个实现多参数的情况

```js
// 多参数柯里化；
const curry = function(fn){
    return function curriedFn(...args){
        if(args.length<fn.length){
            return function(){
                return curriedFn(...args.concat([...arguments]));
            }
        }
        return fn(...args);
    }
}
const fn = (x,y,z,a)=>x+y+z+a;
const myfn = curry(fn);
console.log(myfn(1)(2)(3)(1));
```

关于柯里化函数的意义如下：

- 让纯函数更纯，每次接受一个参数，松散解耦
- 惰性执行

### 组合与管道

组合函数，目的是将多个函数组合成一个函数

举个简单的例子：

```js
function afn(a){
    return a*2;
}
function bfn(b){
    return b*3;
}
const compose = (a,b)=>c=>a(b(c));
let myfn =  compose(afn,bfn);
console.log( myfn(2));
```

可以看到`compose`实现一个简单的功能：形成了一个新的函数，而这个函数就是一条从 `bfn -> afn` 的流水线

下面再来看看如何实现一个多函数组合：

```js
const compose = (...fns)=>val=>fns.reverse().reduce((acc,fn)=>fn(acc),val);
```

`compose`执行是从右到左的。而管道函数，执行顺序是从左到右执行的

```js
const pipe = (...fns)=>val=>fns.reduce((acc,fn)=>fn(acc),val);
```

组合函数与管道函数的意义在于：可以把很多小函数组合起来完成更复杂的逻辑

## 三、优缺点

#### 优点

- 更好的管理状态：因为它的宗旨是无状态，或者说更少的状态，能最大化的减少这些未知、优化代码、减少出错情况

- 更简单的复用：固定输入->固定输出，没有其他外部变量影响，并且无副作用。这样代码复用时，完全不需要考虑它的内部实现和外部影响

- 更优雅的组合：往大的说，网页是由各个组件组成的。往小的说，一个函数也可能是由多个小函数组成的。更强的复用性，带来更强大的组合性

- 隐性好处。减少代码量，提高维护性

#### 缺点：

- 性能：函数式编程相对于指令式编程，性能绝对是一个短板，因为它往往会对一个方法进行过度包装，从而产生上下文切换的性能开销

- 资源占用：在 JS 中为了实现对象状态的不可变，往往会创建新的对象，因此，它对垃圾回收所产生的压力远远超过其他编程方式

- 递归陷阱：在函数式编程中，为了实现迭代，通常会采用递归操作

</details>

## 375. Javascript本地存储的方式有哪些，有什么区别，及有哪些应用场景？ {#question-74cf701d-95e7-428a-a7c1-d746c6c0877c}

> 难度：1.5 · 类型：QA

### 题目要点

`javaScript`本地缓存的方法我们主要讲述以下四种：

<details>
<summary>参考答案</summary>

## 一、方式

`javaScript`本地缓存的方法我们主要讲述以下四种：

- cookie
- sessionStorage
- localStorage
- indexedDB

### cookie

`Cookie`，类型为「小型文本文件」，指某些网站为了辨别用户身份而储存在用户本地终端上的数据。是为了解决 `HTTP `无状态导致的问题

作为一段一般不超过 4KB 的小型文本数据，它由一个名称（Name）、一个值（Value）和其它几个用于控制 `cookie `有效期、安全性、使用范围的可选属性组成

但是`cookie`在每次请求中都会被发送，如果不使用 `HTTPS `并对其加密，其保存的信息很容易被窃取，导致安全风险。举个例子，在一些使用 `cookie `保持登录态的网站上，如果 `cookie `被窃取，他人很容易利用你的 `cookie `来假扮成你登录网站

关于`cookie`常用的属性如下：

- Expires 用于设置 Cookie 的过期时间

```js
Expires=Wed, 21 Oct 2015 07:28:00 GMT
```

- Max-Age 用于设置在 Cookie 失效之前需要经过的秒数（优先级比`Expires`高）

```js
Max-Age=604800
```

- `Domain `指定了 `Cookie` 可以送达的主机名
- `Path `指定了一个 `URL `路径，这个路径必须出现在要请求的资源的路径中才可以发送 `Cookie` 首部

```js
Path=/docs   # /docs/Web/ 下的资源会带 Cookie 首部
```

- 标记为 `Secure `的 `Cookie `只应通过被`HTTPS`协议加密过的请求发送给服务端

通过上述，我们可以看到`cookie`又开始的作用并不是为了缓存而设计出来，只是借用了`cookie`的特性实现缓存

关于`cookie`的使用如下：

```js
document.cookie = '名字=值';
```

关于`cookie`的修改，首先要确定`domain`和`path`属性都是相同的才可以，其中有一个不同得时候都会创建出一个新的`cookie`

```js
Set-Cookie:name=aa; domain=aa.net; path=/  # 服务端设置
document.cookie =name=bb; domain=aa.net; path=/  # 客户端设置
```

最后`cookie`的删除，最常用的方法就是给`cookie`设置一个过期的事件，这样`cookie`过期后会被浏览器删除

### localStorage

`HTML5`新方法，IE8及以上浏览器都兼容

### 特点

- 生命周期：持久化的本地存储，除非主动删除数据，否则数据是永远不会过期的
- 存储的信息在同一域中是共享的
- 当本页操作（新增、修改、删除）了`localStorage`的时候，本页面不会触发`storage`事件,但是别的页面会触发`storage`事件。
- 大小：5M（跟浏览器厂商有关系）
- `localStorage`本质上是对字符串的读取，如果存储内容多的话会消耗内存空间，会导致页面变卡
- 受同源策略的限制

下面再看看关于`localStorage`的使用

设置

```js
localStorage.setItem('username','cfangxu');
```

获取

```js
localStorage.getItem('username')
```

获取键名

```js
localStorage.key(0) //获取第一个键名
```

删除

```js
localStorage.removeItem('username')
```

一次性清除所有存储

```js
localStorage.clear()
```

`localStorage` 也不是完美的，它有两个缺点：

- 无法像` Cookie `一样设置过期时间
- 只能存入字符串，无法直接存对象

```js
localStorage.setItem('key', {name: 'value'});
console.log(localStorage.getItem('key')); // '[object, Object]'
```

### sessionStorage

`sessionStorage `和 `localStorage `使用方法基本一致，唯一不同的是生命周期，一旦页面（会话）关闭，`sessionStorage` 将会删除数据

### 扩展的前端存储方式

`indexedDB `是一种低级API，用于客户端存储大量结构化数据(包括, 文件/ blobs)。该API使用索引来实现对该数据的高性能搜索

虽然 `Web Storage `对于存储较少量的数据很有用，但对于存储更大量的结构化数据来说，这种方法不太有用。`IndexedDB`提供了一个解决方案

#### 优点：

- 储存量理论上没有上限
- 所有操作都是异步的，相比 `LocalStorage` 同步操作性能更高，尤其是数据量较大时
- 原生支持储存` JS `的对象
- 是个正经的数据库，意味着数据库能干的事它都能干

#### 缺点：

- 操作非常繁琐
- 本身有一定门槛

关于`indexedDB`的使用基本使用步骤如下：

- 打开数据库并且开始一个事务

- 创建一个 `object store`
- 构建一个请求来执行一些数据库操作，像增加或提取数据等。
- 通过监听正确类型的 `DOM` 事件以等待操作完成。
- 在操作结果上进行一些操作（可以在 `request `对象中找到）

关于使用`indexdb`的使用会比较繁琐，大家可以通过使用`Godb.js`库进行缓存，最大化的降低操作难度

## 二、区别

关于`cookie`、`sessionStorage`、`localStorage`三者的区别主要如下：

- 存储大小：` cookie`数据大小不能超过`4k`，`sessionStorage`和`localStorage `虽然也有存储大小的限制，但比`cookie`大得多，可以达到5M或更大

- 有效时间：` localStorage   `存储持久数据，浏览器关闭后数据不丢失除非主动删除数据； `sessionStorage  `数据在当前浏览器窗口关闭后自动删除；` cookie `设置的`cookie`过期时间之前一直有效，即使窗口或浏览器关闭

- 数据与服务器之间的交互方式，`  cookie`的数据会自动的传递到服务器，服务器端也可以写`cookie`到客户端； `sessionStorage`和`localStorage`不会自动把数据发给服务器，仅在本地保存

## 三、应用场景

在了解了上述的前端的缓存方式后，我们可以看看针对不对场景的使用选择：

- 标记用户与跟踪用户行为的情况，推荐使用`cookie`
- 适合长期保存在本地的数据（令牌），推荐使用`localStorage`
- 敏感账号一次性登录，推荐使用`sessionStorage`
- 存储大量数据的情况、在线文档（富文本编辑器）保存编辑历史的情况，推荐使用`indexedDB`

</details>

## 376. 说说 JavaScript 中内存泄漏有哪几种情况？ {#question-cecf2aa7-4281-4255-95c9-e8ae487760f1}

> 难度：3 · 类型：QA

### 题目要点

1. **全局变量**：无意中创建的全局变量可能不会被垃圾回收机制回收。
2. **未清理的定时器**：`setInterval` 或 `setTimeout` 未被清除。
3. **闭包引用**：闭包可能持续引用外部变量，阻止它们被回收。
4. **未断开的DOM引用**：即使DOM元素被移除，引用未被清除。
5. **事件监听器未移除**：事件监听器未在元素移除时一并移除。
6. **循环引用**：在某些情况下，循环引用可能阻止垃圾回收。
7. **第三方库**：不恰当使用第三方库可能导致内存泄漏。
8. **缓存数据未清理**：长时间存储的数据未及时清理。

## 解决方法

- 清理不再使用的全局变量和定时器。
- 移除不再需要的事件监听器。
- 避免不必要的闭包引用。
- 使用内存分析工具检测潜在的内存泄漏。
- 谨慎使用第三方库，确保及时清理资源。

<details>
<summary>参考答案</summary>

## 一、是什么

内存泄漏（Memory leak）是在计算机科学中，由于疏忽或错误造成程序未能释放已经不再使用的内存

并非指内存在物理上的消失，而是应用程序分配某段内存后，由于设计错误，导致在释放该段内存之前就失去了对该段内存的控制，从而造成了内存的浪费

程序的运行需要内存。只要程序提出要求，操作系统或者运行时就必须供给内存

对于持续运行的服务进程，必须及时释放不再用到的内存。否则，内存占用越来越高，轻则影响系统性能，重则导致进程崩溃

 ![](https://static.ecool.fun//article/5f67faa9-e84b-4076-b416-bc5a49bf5638.png)

在`C`语言中，因为是手动管理内存，内存泄露是经常出现的事情。

```clang
char * buffer;
buffer = (char*) malloc(42);

// Do something with buffer

free(buffer);
```

上面是 C 语言代码，`malloc`方法用来申请内存，使用完毕之后，必须自己用`free`方法释放内存。

这很麻烦，所以大多数语言提供自动内存管理，减轻程序员的负担，这被称为"垃圾回收机制"

## 二、垃圾回收机制

Javascript 具有自动垃圾回收机制（GC：Garbage Collecation），也就是说，执行环境会负责管理代码执行过程中使用的内存

原理：垃圾收集器会定期（周期性）找出那些不在继续使用的变量，然后释放其内存

通常情况下有两种实现方式：

- 标记清除
- 引用计数

### 标记清除

`JavaScript`最常用的垃圾收回机制

当变量进入执行环境是，就标记这个变量为“进入环境“。进入环境的变量所占用的内存就不能释放，当变量离开环境时，则将其标记为“离开环境“

垃圾回收程序运行的时候，会标记内存中存储的所有变量。然后，它会将所有在上下文中的变量，以及被在上下文中的变量引用的变量的标记去掉

在此之后再被加上标记的变量就是待删除的了，原因是任何在上下文中的变量都访问不到它们了

随后垃圾回收程序做一次内存清理，销毁带标记的所有值并收回它们的内存

举个例子：

```js
var m = 0,n = 19 // 把 m,n,add() 标记为进入环境。
add(m, n) // 把 a, b, c标记为进入环境。
console.log(n) // a,b,c标记为离开环境，等待垃圾回收。
function add(a, b) {
  a++
  var c = a + b
  return c
}
```

### 引用计数

语言引擎有一张"引用表"，保存了内存里面所有的资源（通常是各种值）的引用次数。如果一个值的引用次数是`0`，就表示这个值不再用到了，因此可以将这块内存释放

如果一个值不再需要了，引用数却不为`0`，垃圾回收机制无法释放这块内存，从而导致内存泄漏

```javascript
const arr = [1, 2, 3, 4];
console.log('hello world');
```

面代码中，数组`[1, 2, 3, 4]`是一个值，会占用内存。变量`arr`是仅有的对这个值的引用，因此引用次数为`1`。尽管后面的代码没有用到`arr`，它还是会持续占用内存

如果需要这块内存被垃圾回收机制释放，只需要设置如下：

```js
arr = null
```

通过设置`arr`为`null`，就解除了对数组`[1,2,3,4]`的引用，引用次数变为 0，就被垃圾回收了

### 小结

有了垃圾回收机制，不代表不用关注内存泄露。那些很占空间的值，一旦不再用到，需要检查是否还存在对它们的引用。如果是的话，就必须手动解除引用

## 三、常见内存泄露情况

意外的全局变量

```js
function foo(arg) {
    bar = "this is a hidden global variable";
}
```

另一种意外的全局变量可能由 `this` 创建：

```js
function foo() {
    this.variable = "potential accidental global";
}
// foo 调用自己，this 指向了全局对象（window）
foo();
```

上述使用严格模式，可以避免意外的全局变量

定时器也常会造成内存泄露

```js
var someResource = getData();
setInterval(function() {
    var node = document.getElementById('Node');
    if(node) {
        // 处理 node 和 someResource
        node.innerHTML = JSON.stringify(someResource));
    }
}, 1000);
```

如果`id`为Node的元素从`DOM`中移除，该定时器仍会存在，同时，因为回调函数中包含对`someResource`的引用，定时器外面的`someResource`也不会被释放

包括我们之前所说的闭包，维持函数内局部变量，使其得不到释放

```js
function bindEvent() {
  var obj = document.createElement('XXX');
  var unused = function () {
    console.log(obj, '闭包内引用obj obj不会被释放');
  };
  obj = null; // 解决方法
}
```

没有清理对`DOM`元素的引用同样造成内存泄露

```js
const refA = document.getElementById('refA');
document.body.removeChild(refA); // dom删除了
console.log(refA, 'refA'); // 但是还存在引用能console出整个div 没有被回收
refA = null;
console.log(refA, 'refA'); // 解除引用
```

包括使用事件监听`addEventListener`监听的时候，在不监听的情况下使用`removeEventListener`取消对事件监听

</details>

## 377. 举例说明你对尾递归的理解，以及有哪些应用场景 {#question-564a3475-d774-4956-9ea6-024e0e05062d}

> 难度：3.5 · 类型：QA

### 题目要点

尾递归是一种特殊的递归形式，其中函数的最后一个操作是递归调用。这种调用方式允许编译器或解释器优化递归，以避免增加堆栈空间，从而避免栈溢出错误。

尾递归是一种优化技术，其中函数的递归调用是其最后一个执行的操作。这意味着在递归调用之后不需要执行任何额外的操作。

## 特点

- **最后一个操作**：递归调用是函数体内的最后一个操作。
- **优化可能性**：编译器或解释器可以优化尾递归，将其转换为迭代，减少堆栈使用。
- **避免栈溢出**：由于避免了堆栈增长，尾递归可以处理更大的数据集。

## 示例代码

```javascript
// 非尾递归示例
function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1);
}

// 尾递归示例
function tailRecursiveFactorial(n, accumulator = 1) {
  if (n === 0) {
    return accumulator;
  }
  return tailRecursiveFactorial(n - 1, n * accumulator);
}
```

在这个例子中，tailRecursiveFactorial 是一个尾递归函数，它通过累加器 accumulator 来存储中间结果，避免了在每次递归调用中创建新的乘积。

## 应用场景

- 计算数学序列：如阶乘、斐波那契数列等。
- 解析和编译：在解析器或编译器中，尾递归用于解析复杂的语法结构。
- 数据结构遍历：在某些数据结构的遍历算法中，如深度优先搜索（DFS）。
- 动态规划：在解决动态规划问题时，尾递归可以用于避免显式存储所有状态。

## 注意事项

- 并非所有环境都支持尾递归优化，需要检查所用环境是否支持。
- 尾递归函数需要仔细设计，以确保递归调用是函数体中的最后一个操作。

尾递归是一种强大的技术，可以在保持代码清晰的同时，优化性能和内存使用。

<details>
<summary>参考答案</summary>

## 一、递归

递归（英语：Recursion）

在数学与计算机科学中，是指在函数的定义中使用函数自身的方法

在函数内部，可以调用其他函数。如果一个函数在内部调用自身本身，这个函数就是递归函数

其核心思想是把一个大型复杂的问题层层转化为一个与原问题相似的规模较小的问题来求解

一般来说，递归需要有边界条件、递归前进阶段和递归返回阶段。当边界条件不满足时，递归前进；当边界条件满足时，递归返回

下面实现一个函数 `pow(x, n)`，它可以计算 `x` 的 `n` 次方

使用迭代的方式，如下：

```js
function pow(x, n) {
  let result = 1;

  // 再循环中，用 x 乘以 result n 次
  for (let i = 0; i < n; i++) {
    result *= x;
  }
  return result;
}
```

使用递归的方式，如下：

```js
function pow(x, n) {
  if (n == 1) {
    return x;
  } else {
    return x * pow(x, n - 1);
  }
}
```

`pow(x, n)` 被调用时，执行分为两个分支：

```js
             if n==1  = x
             /
pow(x, n) =
             \
              else     = x * pow(x, n - 1)
```

也就是说`pow` 递归地调用自身 直到 `n == 1`

 ![](https://static.ecool.fun//article/6ba267f3-37a5-4134-b747-887d23c54c63.png)

为了计算 `pow(2, 4)`，递归变体经过了下面几个步骤：

1. `pow(2, 4) = 2 * pow(2, 3)`
2. `pow(2, 3) = 2 * pow(2, 2)`
3. `pow(2, 2) = 2 * pow(2, 1)`
4. `pow(2, 1) = 2`

因此，递归将函数调用简化为一个更简单的函数调用，然后再将其简化为一个更简单的函数，以此类推，直到结果

## 二、尾递归

尾递归，即在函数尾位置调用自身（或是一个尾调用本身的其他函数等等）。尾递归也是递归的一种特殊情形。尾递归是一种特殊的尾调用，即在尾部直接调用自身的递归函数

尾递归在普通尾调用的基础上，多出了2个特征：

- 在尾部调用的是函数自身
- 可通过优化，使得计算仅占用常量栈空间

在递归调用的过程当中系统为每一层的返回点、局部量等开辟了栈来存储，递归次数过多容易造成栈溢出

这时候，我们就可以使用尾递归，即一个函数中所有递归形式的调用都出现在函数的末尾，对于尾递归来说，由于只存在一个调用记录，所以永远不会发生"栈溢出"错误

实现一下阶乘，如果用普通的递归，如下：

```js
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```

如果`n`等于5，这个方法要执行5次，才返回最终的计算表达式，这样每次都要保存这个方法，就容易造成栈溢出，复杂度为`O(n)`

如果我们使用尾递归，则如下：

```js
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120
```

可以看到，每一次返回的就是一个新的函数，不带上一个函数的参数，也就不需要储存上一个函数了。尾递归只需要保存一个调用栈，复杂度 O(1)

## 二、应用场景

数组求和

```js
function sumArray(arr, total) {
    if(arr.length === 1) {
        return total
    }
    return sumArray(arr, total + arr.pop())
}
```

使用尾递归优化求斐波那契数列

```js
function factorial2 (n, start = 1, total = 1) {
    if(n <= 2){
        return total
    }
    return factorial2 (n -1, total, total + start)
}
```

数组扁平化

```js
let a = [1,2,3, [1,2,3, [1,2,3]]]
// 变成
let a = [1,2,3,1,2,3,1,2,3]
// 具体实现
function flat(arr = [], result = []) {
    arr.forEach(v => {
        if(Array.isArray(v)) {
            result = result.concat(flat(v, []))
        }else {
            result.push(v)
        }
    })
    return result
}
```

数组对象格式化

```js
let obj = {
    a: '1',
    b: {
        c: '2',
        D: {
            E: '3'
        }
    }
}
// 转化为如下：
let obj = {
    a: '1',
    b: {
        c: '2',
        d: {
            e: '3'
        }
    }
}

// 代码实现
function keysLower(obj) {
    let reg = new RegExp("([A-Z]+)", "g");
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let temp = obj[key];
            if (reg.test(key.toString())) {
                // 将修改后的属性名重新赋值给temp，并在对象obj内添加一个转换后的属性
                temp = obj[key.replace(reg, function (result) {
                    return result.toLowerCase()
                })] = obj[key];
                // 将之前大写的键属性删除
                delete obj[key];
            }
            // 如果属性是对象或者数组，重新执行函数
            if (typeof temp === 'object' || Object.prototype.toString.call(temp) === '[object Array]') {
                keysLower(temp);
            }
        }
    }
    return obj;
};
```

</details>

## 378. 说说你对BOM的理解，以及常见的BOM对象有哪些？ {#question-483e37bb-b761-4231-82e8-4f6345a6df78}

> 难度：2 · 类型：QA

### 题目要点

`BOM` (Browser Object Model)，浏览器对象模型，提供了独立于内容与浏览器窗口进行交互的对象

<details>
<summary>参考答案</summary>

## 一、是什么

`BOM` (Browser Object Model)，浏览器对象模型，提供了独立于内容与浏览器窗口进行交互的对象

其作用就是跟浏览器做一些交互效果,比如如何进行页面的后退，前进，刷新，浏览器的窗口发生变化，滚动条的滚动，以及获取客户的一些信息如：浏览器品牌版本，屏幕分辨率

浏览器的全部内容可以看成`DOM`，整个浏览器可以看成`BOM`。区别如下：

![](https://static.ecool.fun//article/cb0c5ea4-db38-4753-812e-297289372881.png)
## 二、window

`Bom`的核心对象是`window`，它表示浏览器的一个实例

在浏览器中，`window`对象有双重角色，即是浏览器窗口的一个接口，又是全局对象

因此所有在全局作用域中声明的变量、函数都会变成`window`对象的属性和方法

```js
var name = 'js每日一题';
function lookName(){
  alert(this.name);
}

console.log(window.name);  //js每日一题
lookName();                //js每日一题
window.lookName();         //js每日一题
```

关于窗口控制方法如下：

- `moveBy(x,y)`：从当前位置水平移动窗体x个像素，垂直移动窗体y个像素，x为负数，将向左移动窗体，y为负数，将向上移动窗体
- `moveTo(x,y)`：移动窗体左上角到相对于屏幕左上角的(x,y)点
- `resizeBy(w,h)`：相对窗体当前的大小，宽度调整w个像素，高度调整h个像素。如果参数为负值，将缩小窗体，反之扩大窗体
- `resizeTo(w,h)`：把窗体宽度调整为w个像素，高度调整为h个像素
- `scrollTo(x,y)`：如果有滚动条，将横向滚动条移动到相对于窗体宽度为x个像素的位置，将纵向滚动条移动到相对于窗体高度为y个像素的位置
- `scrollBy(x,y)`： 如果有滚动条，将横向滚动条向左移动x个像素，将纵向滚动条向下移动y个像素

 `window.open()` 既可以导航到一个特定的`url`，也可以打开一个新的浏览器窗口

如果 `window.open()` 传递了第二个参数，且该参数是已有窗口或者框架的名称，那么就会在目标窗口加载第一个参数指定的URL

```js
window.open('htttp://www.vue3js.cn','topFrame')
==> < a href=" " target="topFrame"></ a>
```

`window.open()` 会返回新窗口的引用，也就是新窗口的 `window` 对象

```js
const myWin = window.open('http://www.vue3js.cn','myWin')
```

`window.close()` 仅用于通过 `window.open()` 打开的窗口

新创建的 `window` 对象有一个 `opener` 属性，该属性指向打开他的原始窗口对象

## 三、location

`url`地址如下：

```js
http://foouser:barpassword@www.wrox.com:80/WileyCDA/?q=javascript#contents
```

`location`属性描述如下：

| 属性名   | 例子                                                   | 说明                                |
| -------- | ------------------------------------------------------ | ----------------------------------- |
| hash     | "#contents"                                            | utl中#后面的字符，没有则返回空串    |
| host     | www.wrox.com:80                                        | 服务器名称和端口号                  |
| hostname | www.wrox.com                                           | 域名，不带端口号                    |
| href     | http://www.wrox.com:80/WileyCDA/?q=javascript#contents | 完整url                             |
| pathname | "/WileyCDA/"                                           | 服务器下面的文件路径                |
| port     | 80                                                     | url的端口号，没有则为空             |
| protocol | http:                                                  | 使用的协议                          |
| search   | ?q=javascript                                          | url的查询字符串，通常为？后面的内容 |

除了 `hash `之外，只要修改` location `的一个属性，就会导致页面重新加载新` URL`

`location.reload()`，此方法可以重新刷新当前页面。这个方法会根据最有效的方式刷新页面，如果页面自上一次请求以来没有改变过，页面就会从浏览器缓存中重新加载

如果要强制从服务器中重新加载，传递一个参数`true`即可

## 四、navigator

`navigator` 对象主要用来获取浏览器的属性，区分浏览器类型。属性较多，且兼容性比较复杂

下表列出了`navigator`对象接口定义的属性和方法：

 ![](https://static.ecool.fun//article/546c5d88-2583-44b4-9d98-189cf23f3f42.png)

 ![](https://static.ecool.fun//article/89452e1d-6aba-4b51-9587-5da493a116db.png)

## 五、screen

保存的纯粹是客户端能力信息，也就是浏览器窗口外面的客户端显示器的信息，比如像素宽度和像素高度

 ![](https://static.ecool.fun//article/edcda89c-e6e1-4cb3-97e3-95478c640f59.png)

## 六、history

`history`对象主要用来操作浏览器`URL`的历史记录，可以通过参数向前，向后，或者向指定`URL`跳转

常用的属性如下：

- `history.go()`

接收一个整数数字或者字符串参数：向最近的一个记录中包含指定字符串的页面跳转，

```js
history.go('maixaofei.com')
```

当参数为整数数字的时候，正数表示向前跳转指定的页面，负数为向后跳转指定的页面

```js
history.go(3) //向前跳转三个记录
history.go(-1) //向后跳转一个记录
```

- `history.forward()`：向前跳转一个页面
- `history.back()`：向后跳转一个页面
- `history.length`：获取历史记录数

</details>

## 379. 谈谈你知道的DOM常见的操作 {#question-138cc142-490a-4ca9-8221-5f13429c807f}

> 难度：1.5 · 类型：QA

### 题目要点

文档对象模型 (DOM) 是 `HTML` 和 `XML` 文档的编程接口

<details>
<summary>参考答案</summary>

## 一、DOM

文档对象模型 (DOM) 是 `HTML` 和 `XML` 文档的编程接口

它提供了对文档的结构化的表述，并定义了一种方式可以使从程序中对该结构进行访问，从而改变文档的结构，样式和内容

任何 `HTML `或` XML `文档都可以用 `DOM `表示为一个由节点构成的层级结构

节点分很多类型，每种类型对应着文档中不同的信息和（或）标记，也都有自己不同的特性、数据和方法，而且与其他类型有某种关系，如下所示：

```html
<html>
    <head>
        <title>Page</title>
    </head>
    <body>
        <p>Hello World!</p >
    </body>
</html>
```

`DOM`像原子包含着亚原子微粒那样，也有很多类型的`DOM`节点包含着其他类型的节点。接下来我们先看看其中的三种：

```html
<div>
    <p title="title">
        content
    </p >
</div>
```

上述结构中，`div`、`p`就是元素节点，`content`就是文本节点，`title`就是属性节点

## 二、操作

日常前端开发，我们都离不开`DOM`操作

在以前，我们使用`Jquery`，`zepto`等库来操作`DOM`，之后在`vue`，`Angular`，`React`等框架出现后，我们通过操作数据来控制`DOM`（绝大多数时候），越来越少的去直接操作`DOM`

但这并不代表原生操作不重要。相反，`DOM`操作才能有助于我们理解框架深层的内容

下面就来分析`DOM`常见的操作，主要分为：

- 创建节点
- 查询节点
- 更新节点
- 添加节点
- 删除节点

### 创建节点

#### createElement

创建新元素，接受一个参数，即要创建元素的标签名

```js
const divEl = document.createElement("div");
```

#### createTextNode

创建一个文本节点

```js
const textEl = document.createTextNode("content");
```

#### createDocumentFragment

用来创建一个文档碎片，它表示一种轻量级的文档，主要是用来存储临时节点，然后把文档碎片的内容一次性添加到`DOM`中

```js
const fragment = document.createDocumentFragment();
```

当请求把一个`DocumentFragment` 节点插入文档树时，插入的不是 `DocumentFragment `自身，而是它的所有子孙节点

#### createAttribute

创建属性节点，可以是自定义属性

```js
const dataAttribute = document.createAttribute('custom');
consle.log(dataAttribute);
```

### 获取节点

#### querySelector

传入任何有效的` css` 选择器，即可选中单个 `DOM `元素（首个）：

```js
document.querySelector('.element')
document.querySelector('#element')
document.querySelector('div')
document.querySelector('[name="username"]')
document.querySelector('div + p > span')
```

如果页面上没有指定的元素时，返回 `null`

#### querySelectorAll

返回一个包含节点子树内所有与之相匹配的`Element`节点列表，如果没有相匹配的，则返回一个空节点列表

```js
const notLive = document.querySelectorAll("p");
```

需要注意的是，该方法返回的是一个 `NodeList `的静态实例，它是一个静态的“快照”，而非“实时”的查询

关于获取`DOM`元素的方法还有如下，就不一一述说

```js
document.getElementById('id属性值');返回拥有指定id的对象的引用
document.getElementsByClassName('class属性值');返回拥有指定class的对象集合
document.getElementsByTagName('标签名');返回拥有指定标签名的对象集合
document.getElementsByName('name属性值'); 返回拥有指定名称的对象结合
document/element.querySelector('CSS选择器');  仅返回第一个匹配的元素
document/element.querySelectorAll('CSS选择器');   返回所有匹配的元素
document.documentElement;  获取页面中的HTML标签
document.body; 获取页面中的BODY标签
document.all[''];  获取页面中的所有元素节点的对象集合型
```

除此之外，每个`DOM`元素还有`parentNode`、`childNodes`、`firstChild`、`lastChild`、`nextSibling`、`previousSibling`属性，关系图如下图所示

 ![](https://static.ecool.fun//article/9d682579-6386-4f28-8e4f-cd885beafb7f.png)

### 更新节点

#### innerHTML

不但可以修改一个`DOM`节点的文本内容，还可以直接通过`HTML`片段修改`DOM`节点内部的子树

```js
// 获取<p id="p">...</p >
var p = document.getElementById('p');
// 设置文本为abc:
p.innerHTML = 'ABC'; // <p id="p">ABC</p >
// 设置HTML:
p.innerHTML = 'ABC <span style="color:red">RED</span> XYZ';
// <p>...</p >的内部结构已修改
```

#### innerText、textContent

自动对字符串进行`HTML`编码，保证无法设置任何`HTML`标签

```
// 获取<p id="p-id">...</p >
var p = document.getElementById('p-id');
// 设置文本:
p.innerText = '<script>alert("Hi")</script>';
// HTML被自动编码，无法设置一个<script>节点:
// <p id="p-id">&lt;script&gt;alert("Hi")&lt;/script&gt;</p >
```

两者的区别在于读取属性时，`innerText`不返回隐藏元素的文本，而`textContent`返回所有文本

#### style

`DOM`节点的`style`属性对应所有的`CSS`，可以直接获取或设置。遇到`-`需要转化为驼峰命名

```js
// 获取<p id="p-id">...</p >
const p = document.getElementById('p-id');
// 设置CSS:
p.style.color = '#ff0000';
p.style.fontSize = '20px'; // 驼峰命名
p.style.paddingTop = '2em';
```

### 添加节点

#### innerHTML

如果这个DOM节点是空的，例如，`<div></div>`，那么，直接使用`innerHTML = '<span>child</span>'`就可以修改`DOM`节点的内容，相当于添加了新的`DOM`节点

如果这个DOM节点不是空的，那就不能这么做，因为`innerHTML`会直接替换掉原来的所有子节点

#### appendChild

把一个子节点添加到父节点的最后一个子节点

举个例子

```js
<!-- HTML结构 -->
<p id="js">JavaScript</p >
<div id="list">
    <p id="java">Java</p >
    <p id="python">Python</p >
    <p id="scheme">Scheme</p >
</div>
```

添加一个`p`元素

```js
const js = document.getElementById('js')
js.innerHTML = "JavaScript"
const list = document.getElementById('list');
list.appendChild(js);
```

现在`HTML`结构变成了下面

```js
<!-- HTML结构 -->
<div id="list">
    <p id="java">Java</p >
    <p id="python">Python</p >
    <p id="scheme">Scheme</p >
    <p id="js">JavaScript</p >  <!-- 添加元素 -->
</div>
```

上述代码中，我们是获取`DOM`元素后再进行添加操作，这个`js`节点是已经存在当前文档树中，因此这个节点首先会从原先的位置删除，再插入到新的位置

如果动态添加新的节点，则先创建一个新的节点，然后插入到指定的位置

```js
const list = document.getElementById('list'),
const haskell = document.createElement('p');
haskell.id = 'haskell';
haskell.innerText = 'Haskell';
list.appendChild(haskell);
```

#### insertBefore

把子节点插入到指定的位置，使用方法如下：

```js
parentElement.insertBefore(newElement, referenceElement)
```

子节点会插入到`referenceElement`之前

#### setAttribute

在指定元素中添加一个属性节点，如果元素中已有该属性改变属性值

```js
const div = document.getElementById('id')
div.setAttribute('class', 'white');//第一个参数属性名，第二个参数属性值。
```

### 删除节点

删除一个节点，首先要获得该节点本身以及它的父节点，然后，调用父节点的`removeChild`把自己删掉

```js
// 拿到待删除节点:
const self = document.getElementById('to-be-removed');
// 拿到父节点:
const parent = self.parentElement;
// 删除:
const removed = parent.removeChild(self);
removed === self; // true
```

删除后的节点虽然不在文档树中了，但其实它还在内存中，可以随时再次被添加到别的位置

</details>

## 380. 说说你对事件循环的理解 {#question-b1b488cb-0f79-4d12-bdab-4c070e0da072}

> 难度：3 · 类型：QA

### 题目要点

JavaScript本身是单线程，也就是同一时刻只能干一件事，JS任务包含了同步任务和异步任务，遇到执行函数会将其放入调用栈(先进后出)中，遇到setTimeout/setInterval等异步任务时，会把它放入到消息队列中，等主线程的任务执行完成以后，再回过头执行消息队列中的异步任务，如果异步任务中仍然有异步任务，会继续放入消息队列，以此类推，便形成了一个事件循环。

**异步任务：**

- setTimeout
- setInterval

异步任务又分为宏任务和微任务，promise就属于微任务.

<details>
<summary>参考答案</summary>

## 一、是什么
`JavaScript` 在设计之初便是单线程，即指程序运行时，只有一个线程存在，同一时间只能做一件事

为什么要这么设计，跟`JavaScript`的应用场景有关

`JavaScript` 初期作为一门浏览器脚本语言，通常用于操作 `DOM` ，如果是多线程，一个线程进行了删除 `DOM` ，另一个添加 `DOM`，此时浏览器该如何处理？

为了解决单线程运行阻塞问题，`JavaScript`用到了计算机系统的一种运行机制，这种机制就叫做事件循环（Event Loop）

#### 事件循环（Event Loop）

在`JavaScript`中，所有的任务都可以分为

- 同步任务：立即执行的任务，同步任务一般会直接进入到主线程中执行

- 异步任务：异步执行的任务，比如`ajax`网络请求，`setTimeout `定时函数等

同步任务与异步任务的运行流程图如下：

 ![](https://static.ecool.fun//article/85f7d058-08ee-4bb7-af03-610411a08581.png)

从上面我们可以看到，同步任务进入主线程，即主执行栈，异步任务进入任务队列，主线程内的任务执行完毕为空，会去任务队列读取对应的任务，推入主线程执行。上述过程的不断重复就是事件循环

## 二、宏任务与微任务

如果将任务划分为同步任务和异步任务并不是那么的准确，举个例子：

```js
console.log(1)

setTimeout(()=>{
    console.log(2)
}, 0)

new Promise((resolve, reject)=>{
    console.log('new Promise')
    resolve()
}).then(()=>{
    console.log('then')
})

console.log(3)
```

如果按照上面流程图来分析代码，我们会得到下面的执行步骤：

- `console.log(1) `，同步任务，主线程中执行
- `setTimeout()` ，异步任务，放到 `Event Table`，0 毫秒后`console.log(2) `回调推入 `Event Queue` 中
- `new Promise` ，同步任务，主线程直接执行
- `.then` ，异步任务，放到 `Event Table`
- `console.log(3)`，同步任务，主线程执行

所以按照分析，它的结果应该是 `1` => `'new Promise'` => `3` => `2` => `'then'`

但是实际结果是：`1`=>`'new Promise'`=> `3` => `'then'` => `2`

出现分歧的原因在于异步任务执行顺序，事件队列其实是一个“先进先出”的数据结构，排在前面的事件会优先被主线程读取

例子中 `setTimeout`回调事件是先进入队列中的，按理说应该先于 `.then` 中的执行，但是结果却偏偏相反

原因在于异步任务还可以细分为微任务与宏任务

### 微任务

一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前

常见的微任务有：

- Promise.then

- MutaionObserver

- Object.observe（已废弃；Proxy 对象替代）

- process.nextTick（Node.js）

### 宏任务

宏任务的时间粒度比较大，执行的时间间隔是不能精确控制的，对一些高实时性的需求就不太符合

常见的宏任务有：

- script (可以理解为外层同步代码)
- setTimeout/setInterval
- UI rendering/UI事件
- postMessage、MessageChannel
- setImmediate、I/O（Node.js）

这时候，事件循环，宏任务，微任务的关系如图所示

 ![](https://static.ecool.fun//article/698f38dc-0399-4a3b-b38a-126c9f5c221e.png)

按照这个流程，它的执行机制是：

- 执行一个宏任务，如果遇到微任务就将它放到微任务的事件队列中
- 当前宏任务执行完成后，会查看微任务的事件队列，然后将里面的所有微任务依次执行完

回到上面的题目

```js
console.log(1)
setTimeout(()=>{
    console.log(2)
}, 0)
new Promise((resolve, reject)=>{
    console.log('new Promise')
    resolve()
}).then(()=>{
    console.log('then')
})
console.log(3)
```

流程如下

```js
// 遇到 console.log(1) ，直接打印 1
// 遇到定时器，属于新的宏任务，留着后面执行
// 遇到 new Promise，这个是直接执行的，打印 'new Promise'
// .then 属于微任务，放入微任务队列，后面再执行
// 遇到 console.log(3) 直接打印 3
// 好了本轮宏任务执行完毕，现在去微任务列表查看是否有微任务，发现 .then 的回调，执行它，打印 'then'
// 当一次宏任务执行完，再去执行新的宏任务，这里就剩一个定时器的宏任务了，执行它，打印 2
```

## 三、async与await

`async` 是异步的意思，`await `则可以理解为等待

放到一起可以理解` async `就是用来声明一个异步方法，而 `await `是用来等待异步方法执行

### async

`async`函数返回一个`promise`对象，下面两种方法是等效的

```js
function f() {
    return Promise.resolve('TEST');
}

// asyncF is equivalent to f!
async function asyncF() {
    return 'TEST';
}
```

### await

正常情况下，`await`命令后面是一个 `Promise `对象，返回该对象的结果。如果不是 `Promise `对象，就直接返回对应的值

```js
async function f(){
    // 等同于
    // return 123
    return await 123
}
f().then(v => console.log(v)) // 123
```

不管`await`后面跟着的是什么，`await`都会阻塞后面的代码

```js
async function fn1 (){
    console.log(1)
    await fn2()
    console.log(2) // 阻塞
}

async function fn2 (){
    console.log('fn2')
}

fn1()
console.log(3)
```

上面的例子中，`await` 会阻塞下面的代码（即加入微任务队列），先执行 `async `外面的同步代码，同步代码执行完，再回到 `async` 函数中，再执行之前阻塞的代码

所以上述输出结果为：`1`，`fn2`，`3`，`2`

## 四、流程分析

通过对上面的了解，我们对`JavaScript`对各种场景的执行顺序有了大致的了解

这里直接上代码：

```js
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}
async function async2() {
    console.log('async2')
}
console.log('script start')
setTimeout(function () {
    console.log('settimeout')
})
async1()
new Promise(function (resolve) {
    console.log('promise1')
    resolve()
}).then(function () {
    console.log('promise2')
})
console.log('script end')
```

分析过程：

1. 执行整段代码，遇到 `console.log('script start')` 直接打印结果，输出 `script start`
2. 遇到定时器了，它是宏任务，先放着不执行
3. 遇到 `async1()`，执行 `async1` 函数，先打印 `async1 start`，下面遇到` await `怎么办？先执行 `async2`，打印 `async2`，然后阻塞下面代码（即加入微任务列表），跳出去执行同步代码
4. 跳到 `new Promise` 这里，直接执行，打印 `promise1`，下面遇到 `.then()`，它是微任务，放到微任务列表等待执行
5. 最后一行直接打印 `script end`，现在同步代码执行完了，开始执行微任务，即 `await `下面的代码，打印 `async1 end`
6. 继续执行下一个微任务，即执行 `then` 的回调，打印 `promise2`
7. 上一个宏任务所有事都做完了，开始下一个宏任务，就是定时器，打印 `settimeout`

所以最后的结果是：`script start`、`async1 start`、`async2`、`promise1`、`script end`、`async1 end`、`promise2`、`settimeout`

</details>

## 381. 正则表达式是什么，有哪些应用场景？ {#question-e3f52a7b-4c54-4b00-bd6c-b63f2b60421c}

> 难度：2 · 类型：QA

### 题目要点

正则表达式（Regular Expression，简称Regex）是一种用于匹配字符串中字符组合的模式。它由一系列字符组成，这些字符可以是普通字符（如字母、数字）或特殊字符（如`*`、`.`、`?`等），用于定义搜索模式。

## 特点

- **模式匹配**：能够识别字符串中的特定模式。
- **灵活性高**：支持复杂的匹配规则，如重复、选择、分组等。
- **跨平台**：大多数编程语言都支持正则表达式。

## 基本语法

- `.`：匹配任意单个字符（除换行符外）。
- `*`：匹配前面的字符或子模式零次或多次。
- `+`：匹配前面的字符或子模式一次或多次。
- `?`：匹配前面的字符或子模式零次或一次。
- `[]`：匹配括号内的任意一个字符。
- `()`：定义子模式或分组。
- `|`：表示逻辑“或”，匹配两个子模式中的任意一个。

## 应用场景

1. **文本搜索**：在大量文本中查找特定模式。
2. **数据验证**：验证输入数据的格式，如邮箱、电话号码、URL等。
3. **字符串替换**：在文本中替换或删除匹配的模式。
4. **编程语言**：在代码中实现复杂的文本处理功能。
5. **日志分析**：从日志文件中提取有用信息。
6. **自动化测试**：在测试脚本中匹配和验证文本输出。

## 示例代码

```javascript
// 匹配电子邮件地址
var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
var email = "example@example.com";
console.log(emailRegex.test(email)); // true

// 替换字符串中的电话号码
var text = "Contact us at 123-456-7890.";
var replacedText = text.replace(/(\d{3})-(\d{3})-(\d{4})/, "$1.$2.$3");
console.log(replacedText); // "Contact us at 123.456.7890."

// 提取URL中的域名
var url = "https://www.example.com/page";
var domain = url.match(/https?:\/\/(www\.)?(.+?)\//)[2];
console.log(domain); // "example.com"
```

<details>
<summary>参考答案</summary>

## 一、是什么

正则表达式是一种用来匹配字符串的强有力的武器

它的设计思想是用一种描述性的语言定义一个规则，凡是符合规则的字符串，我们就认为它“匹配”了，否则，该字符串就是不合法的

在 `JavaScript`中，正则表达式也是对象，构建正则表达式有两种方式：

1. 字面量创建，其由包含在斜杠之间的模式组成

```js
const re = /\d+/g;
```

2. 调用`RegExp`对象的构造函数

```js
const re = new RegExp("\\d+","g");

const rul = "\\d+"
const re1 = new RegExp(rul,"g");
```

使用构建函数创建，第一个参数可以是一个变量，遇到特殊字符`\`需要使用`\\`进行转义

## 二、匹配规则

常见的校验规则如下：

| 规则        | 描述                                                  |
| ----------- | ----------------------------------------------------- |
| \           | 转义                                                  |
| ^           | 匹配输入的开始                                        |
| $           | 匹配输入的结束                                        |
| *           | 匹配前一个表达式 0 次或多次                           |
| +           | 匹配前面一个表达式 1 次或者多次。等价于 `{1,}`        |
| ?           | 匹配前面一个表达式 0 次或者 1 次。等价于`{0,1}`       |
| .           | 默认匹配除换行符之外的任何单个字符                    |
| x(?=y)      | 匹配'x'仅仅当'x'后面跟着'y'。这种叫做先行断言         |
| (?<=y)x     | 匹配'x'仅当'x'前面是'y'.这种叫做后行断言              |
| x(?!y)      | 仅仅当'x'后面不跟着'y'时匹配'x'，这被称为正向否定查找 |
| (?<!*y*)*x* | 仅仅当'x'前面不是'y'时匹配'x'，这被称为反向否定查找   |
| x\|y        | 匹配‘x’或者‘y’                                        |
| {n}         | n 是一个正整数，匹配了前面一个字符刚好出现了 n 次     |
| {n,}        | n是一个正整数，匹配前一个字符至少出现了n次            |
| {n,m}       | n 和 m 都是整数。匹配前面的字符至少n次，最多m次       |
| [xyz\]      | 一个字符集合。匹配方括号中的任意字符                  |
| [^xyz\]     | 匹配任何没有包含在方括号中的字符                      |
| \b          | 匹配一个词的边界，例如在字母和空格之间                |
| \B          | 匹配一个非单词边界                                    |
| \d          | 匹配一个数字                                          |
| \D          | 匹配一个非数字字符                                    |
| \f          | 匹配一个换页符                                        |
| \n          | 匹配一个换行符                                        |
| \r          | 匹配一个回车符                                        |
| \s          | 匹配一个空白字符，包括空格、制表符、换页符和换行符    |
| \S          | 匹配一个非空白字符                                    |
| \w          | 匹配一个单字字符（字母、数字或者下划线）              |
| \W          | 匹配一个非单字字符                                    |

### 正则表达式标记

| 标志 | 描述                                                      |
| :--- | :-------------------------------------------------------- |
| `g`  | 全局搜索。                                                |
| `i`  | 不区分大小写搜索。                                        |
| `m`  | 多行搜索。                                                |
| `s`  | 允许 `.` 匹配换行符。                                     |
| `u`  | 使用`unicode`码的模式进行匹配。                           |
| `y`  | 执行“粘性(`sticky`)”搜索,匹配从目标字符串的当前位置开始。 |

使用方法如下：

```js
var re = /pattern/flags;
var re = new RegExp("pattern", "flags");
```

在了解下正则表达式基本的之外，还可以掌握几个正则表达式的特性：

### 贪婪模式

在了解贪婪模式前，首先举个例子：

```js
const reg = /ab{1,3}c/
```

在匹配过程中，尝试可能的顺序是从多往少的方向去尝试。首先会尝试`bbb`，然后再看整个正则是否能匹配。不能匹配时，吐出一个`b`，即在`bb`的基础上，再继续尝试，以此重复

如果多个贪婪量词挨着，则深度优先搜索

```js
const string = "12345";
const regx = /(\d{1,3})(\d{1,3})/;
console.log( string.match(reg) );
// => ["12345", "123", "45", index: 0, input: "12345"]
```

其中，前面的`\d{1,3}`匹配的是"123"，后面的`\d{1,3}`匹配的是"45"

### 懒惰模式

惰性量词就是在贪婪量词后面加个问号。表示尽可能少的匹配

```js
var string = "12345";
var regex = /(\d{1,3}?)(\d{1,3})/;
console.log( string.match(regex) );
// => ["1234", "1", "234", index: 0, input: "12345"]
```

其中`\d{1,3}?`只匹配到一个字符"1"，而后面的`\d{1,3}`匹配了"234"

### 分组

分组主要是用过`()`进行实现，比如`beyond{3}`，是匹配`d`字母3次。而`(beyond){3}`是匹配`beyond`三次

在`()`内使用`|`达到或的效果，如`(abc | xxx)`可以匹配`abc`或者`xxx`

反向引用，巧用`$`分组捕获

```js
let str = "John Smith";

// 交换名字和姓氏
console.log(str.replace(/(john) (smith)/i, '$2, $1')) // Smith, John
```

## 三、匹配方法

正则表达式常被用于某些方法，我们可以分成两类：

- 字符串（str）方法：`match`、`matchAll`、`search`、`replace`、`split`
- 正则对象下（regexp）的方法：`test`、`exec`

| 方法     | 描述                                                         |
| :------- | :----------------------------------------------------------- |
| exec     | 一个在字符串中执行查找匹配的RegExp方法，它返回一个数组（未匹配到则返回 null）。 |
| test     | 一个在字符串中测试是否匹配的RegExp方法，它返回 true 或 false。 |
| match    | 一个在字符串中执行查找匹配的String方法，它返回一个数组，在未匹配到时会返回 null。 |
| matchAll | 一个在字符串中执行查找所有匹配的String方法，它返回一个迭代器（iterator）。 |
| search   | 一个在字符串中测试匹配的String方法，它返回匹配到的位置索引，或者在失败时返回-1。 |
| replace  | 一个在字符串中执行查找匹配的String方法，并且使用替换字符串替换掉匹配到的子字符串。 |
| split    | 一个使用正则表达式或者一个固定字符串分隔一个字符串，并将分隔后的子字符串存储到数组中的 `String` 方法。 |

### str.match(regexp)

`str.match(regexp)` 方法在字符串 `str` 中找到匹配 `regexp` 的字符

如果 `regexp` 不带有 `g` 标记，则它以数组的形式返回第一个匹配项，其中包含分组和属性 `index`（匹配项的位置）、`input`（输入字符串，等于 `str`）

```js
let str = "I love JavaScript";

let result = str.match(/Java(Script)/);

console.log( result[0] );     // JavaScript（完全匹配）
console.log( result[1] );     // Script（第一个分组）
console.log( result.length ); // 2

// 其他信息：
console.log( result.index );  // 7（匹配位置）
console.log( result.input );  // I love JavaScript（源字符串）
```

如果 `regexp` 带有 `g` 标记，则它将所有匹配项的数组作为字符串返回，而不包含分组和其他详细信息

```js
let str = "I love JavaScript";

let result = str.match(/Java(Script)/g);

console.log( result[0] ); // JavaScript
console.log( result.length ); // 1
```

如果没有匹配项，则无论是否带有标记 `g` ，都将返回 `null`

```js
let str = "I love JavaScript";

let result = str.match(/HTML/);

console.log(result); // null
```

### str.matchAll(regexp)

返回一个包含所有匹配正则表达式的结果及分组捕获组的迭代器

```js
const regexp = /t(e)(st(\d?))/g;
const str = 'test1test2';

const array = [...str.matchAll(regexp)];

console.log(array[0]);
// expected output: Array ["test1", "e", "st1", "1"]

console.log(array[1]);
// expected output: Array ["test2", "e", "st2", "2"]
```

### str.search(regexp)

返回第一个匹配项的位置，如果未找到，则返回 `-1`

```js
let str = "A drop of ink may make a million think";

console.log( str.search( /ink/i ) ); // 10（第一个匹配位置）
```

这里需要注意的是，`search` 仅查找第一个匹配项

## str.replace(regexp)

替换与正则表达式匹配的子串，并返回替换后的字符串。在不设置全局匹配`g`的时候，只替换第一个匹配成功的字符串片段

```js
const reg1=/javascript/i;
const reg2=/javascript/ig;
console.log('hello Javascript Javascript Javascript'.replace(reg1,'js'));
//hello js Javascript Javascript
console.log('hello Javascript Javascript Javascript'.replace(reg2,'js'));
//hello js js js
```

### str.split(regexp)

使用正则表达式（或子字符串）作为分隔符来分割字符串

```js
console.log('12, 34, 56'.split(/,\s*/)) // 数组 ['12', '34', '56']
```

### regexp.exec(str)

`regexp.exec(str)` 方法返回字符串 `str` 中的 `regexp` 匹配项，与以前的方法不同，它是在正则表达式而不是字符串上调用的

根据正则表达式是否带有标志 `g`，它的行为有所不同

如果没有 `g`，那么 `regexp.exec(str)` 返回的第一个匹配与 `str.match(regexp)` 完全相同

如果有标记 `g`，调用 `regexp.exec(str)` 会返回第一个匹配项，并将紧随其后的位置保存在属性`regexp.lastIndex` 中。 下一次同样的调用会从位置 `regexp.lastIndex` 开始搜索，返回下一个匹配项，并将其后的位置保存在 `regexp.lastIndex` 中

```js
let str = 'More about JavaScript at https://javascript.info';
let regexp = /javascript/ig;

let result;

while (result = regexp.exec(str)) {
  console.log( `Found ${result[0]} at position ${result.index}` );
  // Found JavaScript at position 11
  // Found javascript at position 33
}
```

### regexp.test(str)

查找匹配项，然后返回 `true/false` 表示是否存在

```js
let str = "I love JavaScript";

// 这两个测试相同
console.log( /love/i.test(str) ); // true
```

## 四、应用场景

通过上面的学习，我们对正则表达式有了一定的了解

下面再来看看正则表达式一些案例场景：

验证QQ合法性（5~15位、全是数字、不以0开头）：

```js
const reg = /^[1-9][0-9]{4,14}$/
const isvalid = patrn.exec(s)
```

校验用户账号合法性（只能输入5-20个以字母开头、可带数字、“_”、“.”的字串）：

```js
var patrn=/^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;
const isvalid = patrn.exec(s)
```

将`url`参数解析为对象

```js
const protocol = '(?<protocol>https?:)';
const host = '(?<host>(?<hostname>[^/#?:]+)(?::(?<port>\\d+))?)';
const path = '(?<pathname>(?:\\/[^/#?]+)*\\/?)';
const search = '(?<search>(?:\\?[^#]*)?)';
const hash = '(?<hash>(?:#.*)?)';
const reg = new RegExp(`^${protocol}\/\/${host}${path}${search}${hash}$`);
function execURL(url){
    const result = reg.exec(url);
    if(result){
        result.groups.port = result.groups.port || '';
        return result.groups;
    }
    return {
        protocol:'',host:'',hostname:'',port:'',
        pathname:'',search:'',hash:'',
    };
}

console.log(execURL('https://localhost:8080/?a=b#xxxx'));
protocol: "https:"
host: "localhost:8080"
hostname: "localhost"
port: "8080"
pathname: "/"
search: "?a=b"
hash: "#xxxx"
```

再将上面的`search`和`hash`进行解析

```js
function execUrlParams(str){
    str = str.replace(/^[#?&]/,'');
    const result = {};
    if(!str){ //如果正则可能配到空字符串，极有可能造成死循环，判断很重要
        return result;
    }
    const reg = /(?:^|&)([^&=]*)=?([^&]*?)(?=&|$)/y
    let exec = reg.exec(str);
    while(exec){
        result[exec[1]] = exec[2];
        exec = reg.exec(str);
    }
    return result;
}
console.log(execUrlParams('#'));// {}
console.log(execUrlParams('##'));//{'#':''}
console.log(execUrlParams('?q=3606&src=srp')); //{q: "3606", src: "srp"}
console.log(execUrlParams('test=a=b=c&&==&a='));//{test: "a=b=c", "": "=", a: ""}
```

</details>

## 382. bind、call、apply 有什么区别？如何实现一个bind? {#question-8d391a9c-0573-4edd-bd5d-84b9af70bad5}

> 难度：1 · 类型：QA

### 题目要点

`bind`、`call` 和 `apply` 是 JavaScript 中 `Function` 对象的方法，用于改变函数的 `this` 绑定，并传递参数。它们之间有一些关键区别：

### 区别

1. **`bind`**：
   - **用途**：创建一个新函数，永久绑定 `this` 和给定的初始参数。
   - **返回值**：返回一个新的函数。
   - **调用方式**：函数不会立即执行，而是返回一个绑定了 `this` 和参数的新函数，直到该新函数被调用。

   **示例：**

   ```javascript
   function greet(greeting, name) {
     console.log(`${greeting}, ${name}`);
   }

   const greetHello = greet.bind(null, 'Hello');
   greetHello('Alice'); // 输出: "Hello, Alice"
   ```

2. **`call`**：
   - **用途**：调用函数并立即指定 `this` 和传递的参数。
   - **返回值**：函数的返回值。
   - **调用方式**：立即执行函数。

   **示例：**

   ```javascript
   function greet(greeting, name) {
     console.log(`${greeting}, ${name}`);
   }

   greet.call(null, 'Hi', 'Bob'); // 输出: "Hi, Bob"
   ```

3. **`apply`**：
   - **用途**：调用函数并立即指定 `this`，参数通过数组传递。
   - **返回值**：函数的返回值。
   - **调用方式**：立即执行函数。

   **示例：**

   ```javascript
   function greet(greeting, name) {
     console.log(`${greeting}, ${name}`);
   }

   greet.apply(null, ['Hey', 'Charlie']); // 输出: "Hey, Charlie"
   ```

<details>
<summary>参考答案</summary>

## 一、作用

`call `、`apply `、`bind `作用是改变函数执行时的上下文，简而言之就是改变函数运行时的`this`指向

那么什么情况下需要改变`this`的指向呢？下面举个例子

```js
var name="lucy";
var obj={
    name:"martin",
    say:function () {
        console.log(this.name);
    }
};
obj.say(); //martin，this指向obj对象
setTimeout(obj.say,0); //lucy，this指向window对象
```

从上面可以看到，正常情况`say`方法输出`martin`

但是我们把`say`放在`setTimeout`方法中，在定时器中是作为回调函数来执行的，因此回到主栈执行时是在全局执行上下文的环境中执行的，这时候`this`指向`window`，所以输出`luck`

> PS: 此处需要注意，如果外层改成 `const name="lucy";`，那么`setTimeout(obj.say,0);`的输出会是 undefined，因为 var 声明的变量会挂载在 window 上，而 let 和 const 声明的变量不会挂载到 window 上。

我们实际需要的是`this`指向`obj`对象，这时候就需要该改变`this`指向了

```js
setTimeout(obj.say.bind(obj),0); //martin，this指向obj对象
```

## 二、区别

下面再来看看`apply`、`call`、`bind`的使用

### apply

`apply`接受两个参数，第一个参数是`this`的指向，第二个参数是函数接受的参数，以数组的形式传入

改变`this`指向后原函数会立即执行，且此方法只是临时改变`this`指向一次

```js
function fn(...args){
    console.log(this,args);
}
let obj = {
    myname:"张三"
}

fn.apply(obj,[1,2]); // this会变成传入的obj，传入的参数必须是一个数组；
fn(1,2) // this指向window
```

当第一个参数为`null`、`undefined`的时候，默认指向`window`(在浏览器中)

```js
fn.apply(null,[1,2]); // this指向window
fn.apply(undefined,[1,2]); // this指向window
```

### call

`call`方法的第一个参数也是`this`的指向，后面传入的是一个参数列表

跟`apply`一样，改变`this`指向后原函数会立即执行，且此方法只是临时改变`this`指向一次

```js
function fn(...args){
    console.log(this,args);
}
let obj = {
    myname:"张三"
}

fn.call(obj,1,2); // this会变成传入的obj，传入的参数不是数组；
fn(1,2) // this指向window
```

同样的，当第一个参数为`null`、`undefined`的时候，默认指向`window`(在浏览器中)

```js
fn.call(null,1,2]); // this指向window
fn.call(undefined,1,2); // this指向window
```

### bind

bind方法和call很相似，第一参数也是`this`的指向，后面传入的也是一个参数列表(但是这个参数列表可以分多次传入)

改变`this`指向后不会立即执行，而是返回一个永久改变`this`指向的函数

```js
function fn(...args){
    console.log(this,args);
}
let obj = {
    myname:"张三"
}

const bindFn = fn.bind(obj); // this 也会变成传入的obj ，bind不是立即执行需要执行一次
bindFn(1,2) // this指向obj
fn(1,2) // this指向window
```

### 小结

从上面可以看到，`apply`、`call`、`bind`三者的区别在于：

- 三者都可以改变函数的`this`对象指向
- 三者第一个参数都是`this`要指向的对象，如果如果没有这个参数或参数为`undefined`或`null`，则默认指向全局`window`
- 三者都可以传参，但是`apply`是数组，而`call`是参数列表，且`apply`和`call`是一次性传入参数，而`bind`可以分为多次传入
- `bind `是返回绑定this之后的函数，`apply `、`call` 则是立即执行

## 三、实现

实现`bind`的步骤，我们可以分解成为三部分：

- 修改`this`指向
- 动态传递参数

```js
// 方式一：只在bind中传递函数参数
fn.bind(obj,1,2)()

// 方式二：在bind中传递函数参数，也在返回函数中传递参数
fn.bind(obj,1)(2)
```

- 兼容`new`关键字

整体实现代码如下：

```js
Function.prototype.myBind = function (context) {
    // 判断调用对象是否为函数
    if (typeof this !== "function") {
        throw new TypeError("Error");
    }

    // 获取参数
    const args = [...arguments].slice(1),
          fn = this;

    return function Fn() {

        // 根据调用方式，传入不同绑定值
        return fn.apply(this instanceof Fn ? new fn(...arguments) : context, args.concat(...arguments));
    }
}
```

</details>

## 383. 说说ajax的原理，以及如何实现？ {#question-bbcedbfa-a74f-411f-a309-01f7e590ee50}

> 难度：2.5 · 类型：QA

### 题目要点

`AJAX `全称(Async Javascript and XML)

<details>
<summary>参考答案</summary>

## 一、是什么

`AJAX `全称(Async Javascript and XML)

即异步的` JavaScript` 和` XML`，是一种创建交互式网页应用的网页开发技术，可以在不重新加载整个网页的情况下，与服务器交换数据，并且更新部分网页

`Ajax`的原理简单来说通过`XmlHttpRequest`对象来向服务器发异步请求，从服务器获得数据，然后用`JavaScript`来操作`DOM`而更新页面

流程图如下：

 ![](https://static.ecool.fun//article/b6c951d9-ba0f-4d0c-b6e8-1155797f29a9.png)

下面举个例子：

领导想找小李汇报一下工作，就委托秘书去叫小李，自己就接着做其他事情，直到秘书告诉他小李已经到了，最后小李跟领导汇报工作

`Ajax`请求数据流程与“领导想找小李汇报一下工作”类似，上述秘书就相当于`XMLHttpRequest`对象，领导相当于浏览器，响应数据相当于小李

浏览器可以发送`HTTP`请求后，接着做其他事情，等收到`XHR`返回来的数据再进行操作

## 二、实现过程

实现 `Ajax `异步交互需要服务器逻辑进行配合，需要完成以下步骤：

- 创建 `Ajax `的核心对象 `XMLHttpRequest `对象

- 通过 `XMLHttpRequest` 对象的 `open()` 方法与服务端建立连接

- 构建请求所需的数据内容，并通过` XMLHttpRequest` 对象的 `send()` 方法发送给服务器端

- 通过 `XMLHttpRequest` 对象提供的 `onreadystatechange` 事件监听服务器端你的通信状态

- 接受并处理服务端向客户端响应的数据结果

- 将处理结果更新到 `HTML `页面中

### 创建XMLHttpRequest对象

通过`XMLHttpRequest()` 构造函数用于初始化一个 `XMLHttpRequest` 实例对象

```js
const xhr = new XMLHttpRequest();
```

### 与服务器建立连接

通过 `XMLHttpRequest` 对象的 `open()` 方法与服务器建立连接

```js
xhr.open(method, url, [async][, user][, password])
```

参数说明：

- `method`：表示当前的请求方式，常见的有`GET`、`POST`

- `url`：服务端地址

- `async`：布尔值，表示是否异步执行操作，默认为`true`

-  `user`: 可选的用户名用于认证用途；默认为`null

- `password`: 可选的密码用于认证用途，默认为`null

### 给服务端发送数据

通过 `XMLHttpRequest` 对象的 `send()` 方法，将客户端页面的数据发送给服务端

```js
xhr.send([body])
```

`body`: 在 `XHR` 请求中要发送的数据体，如果不传递数据则为 `null`

如果使用`GET`请求发送数据的时候，需要注意如下：

- 将请求数据添加到`open()`方法中的`url`地址中
- 发送请求数据中的`send()`方法中参数设置为`null`

### 绑定onreadystatechange事件

`onreadystatechange` 事件用于监听服务器端的通信状态，主要监听的属性为`XMLHttpRequest.readyState` ,

关于`XMLHttpRequest.readyState`属性有五个状态，如下图显示

![](https://static.ecool.fun//article/bd7bf527-914d-4195-82a0-d0f1ea28e00a.png)

只要 `readyState `属性值一变化，就会触发一次 `readystatechange` 事件

`XMLHttpRequest.responseText`属性用于接收服务器端的响应结果

举个例子：

```js
const request = new XMLHttpRequest()
request.onreadystatechange = function(e){
    if(request.readyState === 4){ // 整个请求过程完毕
        if(request.status >= 200 && request.status <= 300){
            console.log(request.responseText) // 服务端返回的结果
        }else if(request.status >=400){
            console.log("错误信息：" + request.status)
        }
    }
}
request.open('POST','http://xxxx')
request.send()
```

## 三、封装

通过上面对`XMLHttpRequest `对象的了解，下面来封装一个简单的`ajax`请求

```js
//封装一个ajax请求
function ajax(options) {
    //创建XMLHttpRequest对象
    const xhr = new XMLHttpRequest()


    //初始化参数的内容
    options = options || {}
    options.type = (options.type || 'GET').toUpperCase()
    options.dataType = options.dataType || 'json'
    const params = options.data

    //发送请求
    if (options.type === 'GET') {
        xhr.open('GET', options.url + '?' + params, true)
        xhr.send(null)
    } else if (options.type === 'POST') {
        xhr.open('POST', options.url, true)
        xhr.send(params)

    //接收请求
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let status = xhr.status
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML)
            } else {
                options.fail && options.fail(status)
            }
        }
    }
}
```

使用方式如下

```js
ajax({
    type: 'post',
    dataType: 'json',
    data: {},
    url: 'https://xxxx',
    success: function(text,xml){//请求成功后的回调函数
        console.log(text)
    },
    fail: function(status){////请求失败后的回调函数
        console.log(status)
    }
})
```

</details>

## 384. 说说new操作符具体干了什么？ {#question-cbbef7f1-c87e-4c3c-9f0a-c8c2f0683075}

> 难度：2 · 类型：QA

### 题目要点

执行了以下几步操作：

1. **创建一个空对象**：首先，`new`操作符会创建一个空的简单JavaScript对象（即`{}`）。

2. **设置原型**：然后，这个新创建的对象的内部`[[Prototype]]`（也就是`__proto__`，但在现代JavaScript中更推荐使用`Object.getPrototypeOf()`来获取）会被赋值为构造函数的`prototype`属性。这一步使得新创建的对象能够继承构造函数原型链上的属性和方法。

3. **调用构造函数**：接下来，构造函数会被调用，且新创建的对象会被作为`this`的上下文（即构造函数内部的`this`指向这个新对象）。同时，如果构造函数返回一个对象，那么这个返回的对象会被用作`new`表达式的结果；如果构造函数没有返回对象（即返回`undefined`或`null`），则`new`表达式的结果就是步骤1中创建的那个对象。

4. **返回对象**：最后，如果构造函数没有显式返回一个对象，则返回步骤1中创建并被步骤2和步骤3处理过的对象。

<details>
<summary>参考答案</summary>

## 一、是什么

在`JavaScript`中，`new`操作符用于创建一个给定构造函数的实例对象

例子

```js
function Person(name, age){
    this.name = name;
    this.age = age;
}
Person.prototype.sayName = function () {
    console.log(this.name)
}
const person1 = new Person('Tom', 20)
console.log(person1)  // Person {name: "Tom", age: 20}
person1.sayName() // 'Tom'
```

从上面可以看到：

- `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数中的属性
- `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数原型链中的属性（即实例与构造函数通过原型链连接了起来）

现在在构建函数中显式加上返回值，并且这个返回值是一个原始类型

```js
function Test(name) {
  this.name = name
  return 1
}
const t = new Test('xxx')
console.log(t.name) // 'xxx'
```

可以发现，构造函数中返回一个原始值，然而这个返回值并没有作用

下面在构造函数中返回一个对象

```js
function Test(name) {
  this.name = name
  console.log(this) // Test { name: 'xxx' }
  return { age: 26 }
}
const t = new Test('xxx')
console.log(t) // { age: 26 }
console.log(t.name) // 'undefined'
```

从上面可以发现，构造函数如果返回值为一个对象，那么这个返回值会被正常使用

## 二、流程

从上面介绍中，我们可以看到`new`关键字主要做了以下的工作：

- 创建一个新的对象`obj`
- 将对象与构建函数通过原型链连接起来
- 将构建函数中的`this`绑定到新建的对象`obj`上

- 根据构建函数返回类型作判断，如果是原始值则被忽略，如果是返回对象，需要正常处理

举个例子：

```js
function Person(name, age){
    this.name = name;
    this.age = age;
}
const person1 = new Person('Tom', 20)
console.log(person1)  // Person {name: "Tom", age: 20}
person1.sayName() // 'Tom'
```

流程图如下：

 ![](https://static.ecool.fun//article/7004e072-f843-4db5-9501-a2311d81885a.png)

## 三、手写new操作符

现在我们已经清楚地掌握了`new`的执行过程

那么我们就动手来实现一下`new`

```js
function mynew(Func, ...args) {
    // 1.创建一个新对象
    const obj = {}
    // 2.新对象原型指向构造函数原型对象
    obj.__proto__ = Func.prototype
    // 3.将构建函数的this指向新对象
    let result = Func.apply(obj, args)
    // 4.根据返回值判断
    return result instanceof Object ? result : obj
}
```

测试一下

```js
function mynew(func, ...args) {
    const obj = {}
    obj.__proto__ = func.prototype
    let result = func.apply(obj, args)
    return result instanceof Object ? result : obj
}
function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.say = function () {
    console.log(this.name)
}

let p = mynew(Person, "huihui", 123)
console.log(p) // Person {name: "huihui", age: 123}
p.say() // huihui
```

可以发现，代码虽然很短，但是能够模拟实现`new`

</details>

## 385. 什么是事件代理，以及它的应用场景有哪些？ {#question-305a1520-b7df-4c05-a72b-a18c165250de}

> 难度：2 · 类型：QA

### 题目要点

### 事件代理（事件委托）

- **定义**：事件代理是一种事件处理技术，它允许将事件监听器绑定到父元素上，从而监听子元素的事件。
- **原理**：事件代理利用事件冒泡的机制，当子元素发生事件时，事件会传递给父元素，从而触发绑定在父元素上的事件监听器。
- **优点**：
  - **减少内存消耗**：只需要为父元素绑定事件监听器，而不需要为每个子元素都绑定，从而减少内存消耗。
  - **动态绑定**：当子元素动态增减时，不需要为新增的子元素重新绑定事件，也不需要为删除的子元素解绑事件。

### 应用场景

- **列表点击事件**：对于包含大量列表项的列表，使用事件代理可以减少内存消耗。
- **动态元素事件绑定**：当页面元素可以通过用户交互动态增减时，使用事件代理可以减少重复绑定和解绑事件的工作。

### 事件代理的局限性

- **非冒泡事件**：对于 `focus`、`blur` 这类没有事件冒泡机制的事件，无法使用事件代理。
- **定位性能问题**：对于 `mousemove`、`mouseout` 这类事件，虽然有事件冒泡，但频繁的计算定位会消耗大量性能，因此不适合使用事件代理。
- **事件误判**：如果所有事件都使用事件代理，可能会出现事件误判，即本不该被触发的事件被绑定上了事件监听器。

<details>
<summary>参考答案</summary>

## 一、是什么

事件代理，俗地来讲，就是把一个元素响应事件（`click`、`keydown`......）的函数委托到另一个元素

前面讲到，事件流的都会经过三个阶段： 捕获阶段 -> 目标阶段 -> 冒泡阶段，而事件委托就是在冒泡阶段完成

事件委托，会把一个或者一组元素的事件委托到它的父层或者更外层元素上，真正绑定事件的是外层元素，而不是目标元素

当事件响应到目标元素上时，会通过事件冒泡机制从而触发它的外层元素的绑定事件上，然后在外层元素上去执行函数

下面举个例子：

比如一个宿舍的同学同时快递到了，一种笨方法就是他们一个个去领取

较优方法就是把这件事情委托给宿舍长，让一个人出去拿好所有快递，然后再根据收件人一一分发给每个同学

在这里，取快递就是一个事件，每个同学指的是需要响应事件的 `DOM `元素，而出去统一领取快递的宿舍长就是代理的元素

所以真正绑定事件的是这个元素，按照收件人分发快递的过程就是在事件执行中，需要判断当前响应的事件应该匹配到被代理元素中的哪一个或者哪几个

## 二、应用场景

如果我们有一个列表，列表之中有大量的列表项，我们需要在点击列表项的时候响应一个事件

```js
<ul id="list">
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
  ......
  <li>item n</li>
</ul>
```

如果给每个列表项一一都绑定一个函数，那对于内存消耗是非常大的

```js
// 获取目标元素
const lis = document.getElementsByTagName("li")
// 循环遍历绑定事件
for (let i = 0; i < lis.length; i++) {
    lis[i].onclick = function(e){
        console.log(e.target.innerHTML)
    }
}
```

这时候就可以事件委托，把点击事件绑定在父级元素`ul`上面，然后执行事件的时候再去匹配目标元素

```js
// 给父层元素绑定事件
document.getElementById('list').addEventListener('click', function (e) {
    // 兼容性处理
    var event = e || window.event;
    var target = event.target || event.srcElement;
    // 判断是否匹配目标元素
    if (target.nodeName.toLocaleLowerCase === 'li') {
        console.log('the content is: ', target.innerHTML);
    }
});
```

还有一种场景是上述列表项并不多，我们给每个列表项都绑定了事件

但是如果用户能够随时动态的增加或者去除列表项元素，那么在每一次改变的时候都需要重新给新增的元素绑定事件，给即将删去的元素解绑事件

如果用了事件委托就没有这种麻烦了，因为事件是绑定在父层的，和目标元素的增减是没有关系的，执行到目标元素是在真正响应执行事件函数的过程中去匹配的

举个例子：

下面`html`结构中，点击`input`可以动态添加元素

```html
<input type="button" name="" id="btn" value="添加" />
<ul id="ul1">
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
    <li>item 4</li>
</ul>
```

使用事件委托

```js
const oBtn = document.getElementById("btn");
const oUl = document.getElementById("ul1");
const num = 4;

//事件委托，添加的子元素也有事件
oUl.onclick = function (ev) {
    ev = ev || window.event;
    const target = ev.target || ev.srcElement;
    if (target.nodeName.toLowerCase() == 'li') {
        console.log('the content is: ', target.innerHTML);
    }

};

//添加新节点
oBtn.onclick = function () {
    num++;
    const oLi = document.createElement('li');
    oLi.innerHTML = `item ${num}`;
    oUl.appendChild(oLi);
};
```

可以看到，使用事件委托，在动态绑定事件的情况下是可以减少很多重复工作的

## 三、总结

适合事件委托的事件有：`click`，`mousedown`，`mouseup`，`keydown`，`keyup`，`keypress`

从上面应用场景中，我们就可以看到使用事件委托存在两大优点：

- 减少整个页面所需的内存，提升整体性能
- 动态绑定，减少重复工作

但是使用事件委托也是存在局限性：

- `focus`、`blur `这些事件没有事件冒泡机制，所以无法进行委托绑定事件

- `mousemove`、`mouseout `这样的事件，虽然有事件冒泡，但是只能不断通过位置去计算定位，对性能消耗高，因此也是不适合于事件委托的

如果把所有事件都用事件代理，可能会出现事件误判，即本不该被触发的事件被绑定上了事件

</details>

## 386. typeof 与 instanceof 有什么区别 {#question-4354687c-2600-4b62-98ec-2bef8df9a171}

> 难度：1.5 · 类型：QA

### 题目要点

### typeof 与 instanceof 的区别

- **返回值**：`typeof` 返回字符串，`instanceof` 返回布尔值。
- **基础数据类型**：`typeof` 可以判断基础数据类型（除 `null` 外），`instanceof` 不能。
- **引用数据类型**：`instanceof` 可以判断复杂引用数据类型，`typeof` 对非 `function` 类型的引用数据类型判断不准确。

<details>
<summary>参考答案</summary>

## 一、typeof

`typeof` 操作符返回一个字符串，表示未经计算的操作数的类型

使用方法如下：

```js
typeof operand
typeof(operand)
```

`operand`表示对象或原始值的表达式，其类型将被返回

举个例子

```js
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof null // 'object'
typeof [] // 'object'
typeof {} // 'object'
typeof console // 'object'
typeof console.log // 'function'
```

从上面例子，前6个都是基础数据类型。虽然`typeof null`为`object`，但这只是` JavaScript` 存在的一个悠久 `Bug`，不代表`null `就是引用数据类型，并且`null `本身也不是对象

所以，`null `在 `typeof `之后返回的是有问题的结果，不能作为判断` null `的方法。如果你需要在 `if` 语句中判断是否为 `null`，直接通过`===null`来判断就好

同时，可以发现引用类型数据，用`typeof`来判断的话，除了`function`会被识别出来之外，其余的都输出`object`

如果我们想要判断一个变量是否存在，可以使用`typeof`：(不能使用`if(a)`， 若`a`未声明，则报错)

```js
if(typeof a != 'undefined'){
    //变量存在
}
```

## 二、instanceof

`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上

使用如下：

```js
object instanceof constructor
```

`object`为实例对象，`constructor`为构造函数

构造函数通过`new`可以实例对象，`instanceof `能判断这个对象是否是之前那个构造函数生成的对象

```js
// 定义构建函数
let Car = function() {}
let benz = new Car()
benz instanceof Car // true
let car = new String('xxx')
car instanceof String // true
let str = 'xxx'
str instanceof String // false
```

关于`instanceof`的实现原理，可以参考下面：

```js
function myInstanceof(left, right) {
    // 这里先用typeof来判断基础数据类型，如果是，直接返回false
    if(typeof left !== 'object' || left === null) return false;
    // getProtypeOf是Object对象自带的API，能够拿到参数的原型对象
    let proto = Object.getPrototypeOf(left);
    while(true) {
        if(proto === null) return false;
        if(proto === right.prototype) return true;//找到相同原型对象，返回true
        proto = Object.getPrototypeof(proto);
    }
}
```

也就是顺着原型链去找，直到找到相同的原型对象，返回`true`，否则为`false`

## 三、区别

`typeof`与`instanceof`都是判断数据类型的方法，区别如下：

- `typeof`会返回一个变量的基本类型，`instanceof`返回的是一个布尔值

- `instanceof` 可以准确地判断复杂引用数据类型，但是不能正确判断基础数据类型
- 而` typeof` 也存在弊端，它虽然可以判断基础数据类型（`null` 除外），但是引用数据类型中，除了` function` 类型以外，其他的也无法判断

可以看到，上述两种方法都有弊端，并不能满足所有场景的需求

如果需要通用检测数据类型，可以采用`Object.prototype.toString`，调用该方法，统一返回格式`“[object Xxx]” `的字符串

如下

```js
Object.prototype.toString({})       // "[object Object]"
Object.prototype.toString.call({})  // 同上结果，加上call也ok
Object.prototype.toString.call(1)    // "[object Number]"
Object.prototype.toString.call('1')  // "[object String]"
Object.prototype.toString.call(true)  // "[object Boolean]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(null)   //"[object Null]"
Object.prototype.toString.call(undefined) //"[object Undefined]"
Object.prototype.toString.call(/123/g)    //"[object RegExp]"
Object.prototype.toString.call(new Date()) //"[object Date]"
Object.prototype.toString.call([])       //"[object Array]"
Object.prototype.toString.call(document)  //"[object HTMLDocument]"
Object.prototype.toString.call(window)   //"[object Window]"
```

了解了`toString`的基本用法，下面就实现一个全局通用的数据类型判断方法

```js
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
    return type;
  }
  // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}
```

使用如下

```js
getType([])     // "Array" typeof []是object，因此toString返回
getType('123')  // "string" typeof 直接返回
getType(window) // "Window" toString返回
getType(null)   // "Null"首字母大写，typeof null是object，需toString来判断
getType(undefined)   // "undefined" typeof 直接返回
getType()            // "undefined" typeof 直接返回
getType(function(){}) // "function" typeof能判断，因此首字母小写
getType(/123/g)      //"RegExp" toString返回
```

</details>

## 387. JavaScript中的事件模型有哪些 {#question-82a3da79-23fb-42be-8f4b-9d52fc595954}

> 难度：1.5 · 类型：QA

### 题目要点

### 事件与事件流

- **事件定义**：JavaScript 中的事件可以理解是在 HTML 文档或浏览器中发生的一种交互操作，使得网页具备互动性。
- **事件流**：事件流描述的是事件在 DOM 树中的传播顺序，事件流会经历三个阶段：
  - 事件捕获阶段：事件从 `document` 开始，逐级向下传播到目标元素。
  - 目标阶段：事件到达目标元素并触发目标元素的监听函数。
  - 事件冒泡阶段：事件从目标元素开始，逐级向上传播到 `document`。
- **事件冒泡**：事件从最具体的元素开始，逐级向上传播到最不具体的元素。

### 事件模型

- **原始事件模型（DOM0级）**：
  - 绑定方式：通过 HTML 属性绑定或 JavaScript 代码绑定。
  - 特性：
    - 绑定速度快。
    - 只支持冒泡，不支持捕获。
    - 同一个类型的事件只能绑定一次。
- **标准事件模型（DOM2级）**：
  - 绑定方式：`addEventListener` 和 `removeEventListener`。
  - 特性：
    - 可以在一个 DOM 元素上绑定多个事件处理器。
    - 执行时机由 `useCapture` 参数决定。
- **IE事件模型**：
  - 绑定方式：`attachEvent` 和 `detachEvent`。
  - 特性：
    - 事件处理阶段：事件到达目标元素并触发目标元素的监听函数。
    - 事件冒泡阶段：事件从目标元素开始，逐级向上传播到 `document`。

<details>
<summary>参考答案</summary>

## 一、事件与事件流

`javascript`中的事件，可以理解就是在`HTML`文档或者浏览器中发生的一种交互操作，使得网页具备互动性， 常见的有加载事件、鼠标事件、自定义事件等

由于`DOM`是一个树结构，如果在父子节点绑定事件时候，当触发子节点的时候，就存在一个顺序问题，这就涉及到了事件流的概念

事件流都会经历三个阶段：

- 事件捕获阶段(capture phase)
- 处于目标阶段(target phase)
- 事件冒泡阶段(bubbling phase)

 ![](https://static.ecool.fun//article/cda1838d-f839-4588-9787-bbaa0bec65ea.png)

事件冒泡是一种从下往上的传播方式，由最具体的元素（触发节点）然后逐渐向上传播到最不具体的那个节点，也就是`DOM`中最高层的父节点

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Event Bubbling</title>
    </head>
    <body>
        <button id="clickMe">Click Me</button>
    </body>
</html>
```

然后，我们给`button`和它的父元素，加入点击事件

```js
var button = document.getElementById('clickMe');

button.onclick = function() {
  console.log('1.Button');
};
document.body.onclick = function() {
  console.log('2.body');
};
document.onclick = function() {
  console.log('3.document');
};
window.onclick = function() {
  console.log('4.window');
};
```

点击按钮，输出如下

```js
1.button
2.body
3.document
4.window
```

点击事件首先在`button`元素上发生，然后逐级向上传播

事件捕获与事件冒泡相反，事件最开始由不太具体的节点最早接受事件, 而最具体的节点（触发节点）最后接受事件

## 二、事件模型

事件模型可以分为三种：

- 原始事件模型（DOM0级）
- 标准事件模型（DOM2级）
- IE事件模型（基本不用）

### 原始事件模型

事件绑定监听函数比较简单, 有两种方式：

- HTML代码中直接绑定

```js
<input type="button" onclick="fun()">
```

- 通过`JS`代码绑定

```js
var btn = document.getElementById('.btn');
btn.onclick = fun;
```

#### 特性

- 绑定速度快

`DOM0`级事件具有很好的跨浏览器优势，会以最快的速度绑定，但由于绑定速度太快，可能页面还未完全加载出来，以至于事件可能无法正常运行

- 只支持冒泡，不支持捕获

- 同一个类型的事件只能绑定一次

```js
<input type="button" id="btn" onclick="fun1()">

var btn = document.getElementById('.btn');
btn.onclick = fun2;
```

如上，当希望为同一个元素绑定多个同类型事件的时候（上面的这个`btn`元素绑定2个点击事件），是不被允许的，后绑定的事件会覆盖之前的事件

删除 `DOM0` 级事件处理程序只要将对应事件属性置为`null`即可

```js
btn.onclick = null;
```

### 标准事件模型

在该事件模型中，一次事件共有三个过程:

- 事件捕获阶段：事件从`document`一直向下传播到目标元素, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行
- 事件处理阶段：事件到达目标元素, 触发目标元素的监听函数
- 事件冒泡阶段：事件从目标元素冒泡到`document`, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行

事件绑定监听函数的方式如下:

```
addEventListener(eventType, handler, useCapture)
```

事件移除监听函数的方式如下:

```
removeEventListener(eventType, handler, useCapture)
```

参数如下：

- `eventType`指定事件类型(不要加on)
- `handler`是事件处理函数
- `useCapture`是一个`boolean`用于指定是否在捕获阶段进行处理，一般设置为`false`与IE浏览器保持一致

举个例子：

```js
var btn = document.getElementById('.btn');
btn.addEventListener(‘click’, showMessage, false);
btn.removeEventListener(‘click’, showMessage, false);
```

#### 特性

- 可以在一个`DOM`元素上绑定多个事件处理器，各自并不会冲突

```js
btn.addEventListener(‘click’, showMessage1, false);
btn.addEventListener(‘click’, showMessage2, false);
btn.addEventListener(‘click’, showMessage3, false);
```

- 执行时机

当第三个参数(`useCapture`)设置为`true`就在捕获过程中执行，反之在冒泡过程中执行处理函数

下面举个例子：

```js
<div id='div'>
    <p id='p'>
        <span id='span'>Click Me!</span>
    </p >
</div>
```

设置点击事件

```js
var div = document.getElementById('div');
var p = document.getElementById('p');

function onClickFn (event) {
    var tagName = event.currentTarget.tagName;
    var phase = event.eventPhase;
    console.log(tagName, phase);
}

div.addEventListener('click', onClickFn, false);
p.addEventListener('click', onClickFn, false);
```

上述使用了`eventPhase`，返回一个代表当前执行阶段的整数值。1为捕获阶段、2为事件对象触发阶段、3为冒泡阶段

点击`Click Me!`，输出如下

```js
P 3
DIV 3
```

可以看到，`p`和`div`都是在冒泡阶段响应了事件，由于冒泡的特性，裹在里层的`p`率先做出响应

如果把第三个参数都改为`true`

```js
div.addEventListener('click', onClickFn, true);
p.addEventListener('click', onClickFn, true);
```

输出如下

```js
DIV 1
P 1
```

两者都是在捕获阶段响应事件，所以`div`比`p`标签先做出响应

### IE事件模型

IE事件模型共有两个过程:

- 事件处理阶段：事件到达目标元素, 触发目标元素的监听函数。
- 事件冒泡阶段：事件从目标元素冒泡到`document`, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行

事件绑定监听函数的方式如下:

```
attachEvent(eventType, handler)
```

事件移除监听函数的方式如下:

```
detachEvent(eventType, handler)
```

举个例子：

```js
var btn = document.getElementById('.btn');
btn.attachEvent(‘onclick’, showMessage);
btn.detachEvent(‘onclick’, showMessage);
```

</details>

## 388. JavaScript中执行上下文和执行栈是什么？ {#question-c137050b-10f5-4a4f-9941-820ad7a9894d}

> 难度：3 · 类型：QA

### 题目要点

## 执行上下文

执行上下文是JavaScript中定义变量或函数作用域的环境。它的主要类型包括：

1. **全局执行上下文**：代码在任何函数之外运行时的环境，是所有执行上下文的起点。
2. **函数执行上下文**：每当一个函数被调用时，都会创建一个新的函数执行上下文。
3. **评估上下文（Eval）**：`eval()` 函数内的代码执行环境，现代浏览器中很少使用。

## 执行栈

执行栈（Call Stack）是一个用于存储和管理 JavaScript 代码执行期间创建的所有执行上下文的栈结构。

### 特点

- **后进先出（LIFO）**：执行栈遵循后进先出的原则，即最后进入栈的执行上下文会最先被执行。
- **单线程执行**：JavaScript 引擎一次只能执行一个操作，即单线程执行。

### 执行过程

1. **全局代码执行**：全局执行上下文被推入执行栈。
2. **函数调用**：每当函数被调用，一个新的函数执行上下文被创建并推入栈顶。
3. **执行完成**：当函数执行完成，其执行上下文从栈中弹出，控制权返回给前一个执行上下文。
4. **错误发生**：如果在执行过程中发生错误，错误处理程序的执行上下文也会被推入栈中。

<details>
<summary>参考答案</summary>

## 一、执行上下文

简单的来说，执行上下文是一种对`Javascript`代码执行环境的抽象概念，也就是说只要有`Javascript`代码运行，那么它就一定是运行在执行上下文中

执行上下文的类型分为三种：

- 全局执行上下文：只有一个，浏览器中的全局对象就是 `window `对象，`this` 指向这个全局对象
- 函数执行上下文：存在无数个，只有在函数被调用的时候才会被创建，每次调用函数都会创建一个新的执行上下文
- Eval 函数执行上下文： 指的是运行在 `eval` 函数中的代码，很少用而且不建议使用

下面给出全局上下文和函数上下文的例子：

 ![](https://static.ecool.fun//article/dd48614d-e230-48e1-9ad4-e8d985420fbf.png)

紫色框住的部分为全局上下文，蓝色和橘色框起来的是不同的函数上下文。只有全局上下文（的变量）能被其他任何上下文访问

可以有任意多个函数上下文，每次调用函数创建一个新的上下文，会创建一个私有作用域，函数内部声明的任何变量都不能在当前函数作用域外部直接访问

## 二、生命周期

执行上下文的生命周期包括三个阶段：创建阶段 → 执行阶段 → 回收阶段

### 创建阶段

创建阶段即当函数被调用，但未执行任何其内部代码之前

创建阶段做了三件事：

- 确定 this 的值，也被称为 `This Binding`
- LexicalEnvironment（词法环境） 组件被创建
- VariableEnvironment（变量环境） 组件被创建

伪代码如下：

```js
ExecutionContext = {
  ThisBinding = <this value>,     // 确定this
  LexicalEnvironment = { ... },   // 词法环境
  VariableEnvironment = { ... },  // 变量环境
}
```

#### This Binding

确定`this`的值我们前面讲到，`this`的值是在执行的时候才能确认，定义的时候不能确认

#### 词法环境

词法环境有两个组成部分：

- 全局环境：是一个没有外部环境的词法环境，其外部环境引用为` null`，有一个全局对象，`this` 的值指向这个全局对象

- 函数环境：用户在函数中定义的变量被存储在环境记录中，包含了`arguments` 对象，外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境

伪代码如下：

```js
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {       // 词法环境
    EnvironmentRecord: {     // 环境记录
      Type: "Object",           // 全局环境
      // 标识符绑定在这里
      outer: <null>           // 对外部环境的引用
  }
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {     // 词法环境
    EnvironmentRecord: {    // 环境记录
      Type: "Declarative",      // 函数环境
      // 标识符绑定在这里      // 对外部环境的引用
      outer: <Global or outer function environment reference>
  }
}
```

#### 变量环境

变量环境也是一个词法环境，因此它具有上面定义的词法环境的所有属性

在 ES6 中，词法环境和变量环境的区别在于前者用于存储函数声明和变量（ `let` 和 `const` ）绑定，而后者仅用于存储变量（ `var` ）绑定

举个例子

```js
let a = 20;
const b = 30;
var c;

function multiply(e, f) {
 var g = 20;
 return e * f * g;
}

c = multiply(20, 30);
```

执行上下文如下：

```js
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {  // 词法环境
    EnvironmentRecord: {
      Type: "Object",
      // 标识符绑定在这里
      a: < uninitialized >,
      b: < uninitialized >,
      multiply: < func >
    }
    outer: <null>
  },

  VariableEnvironment: {  // 变量环境
    EnvironmentRecord: {
      Type: "Object",
      // 标识符绑定在这里
      c: undefined,
    }
    outer: <null>
  }
}

FunctionExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>
  },

  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
}
```

留意上面的代码，`let`和`const`定义的变量`a`和`b`在创建阶段没有被赋值，但`var`声明的变量从在创建阶段被赋值为`undefined`

这是因为，创建阶段，会在代码中扫描变量和函数声明，然后将函数声明存储在环境中

但变量会被初始化为`undefined`(`var`声明的情况下)和保持`uninitialized`(未初始化状态)(使用`let`和`const`声明的情况下)

这就是变量提升的实际原因

### 执行阶段

在这阶段，执行变量赋值、代码执行

如果 `Javascript` 引擎在源代码中声明的实际位置找不到变量的值，那么将为其分配 `undefined` 值

### 回收阶段

执行上下文出栈等待虚拟机回收执行上下文

## 二、执行栈

执行栈，也叫调用栈，具有 LIFO（后进先出）结构，用于存储在代码执行期间创建的所有执行上下文

 ![](https://static.ecool.fun//article/2c9b5dd1-450d-48fd-b22f-bfba63506111.png)

当`Javascript`引擎开始执行你第一行脚本代码的时候，它就会创建一个全局执行上下文然后将它压到执行栈中

每当引擎碰到一个函数的时候，它就会创建一个函数执行上下文，然后将这个执行上下文压到执行栈中

引擎会执行位于执行栈栈顶的执行上下文(一般是函数执行上下文)，当该函数执行结束后，对应的执行上下文就会被弹出，然后控制流程到达执行栈的下一个执行上下文

举个例子：

```js
let a = 'Hello World!';
function first() {
  console.log('Inside first function');
  second();
  console.log('Again inside first function');
}
function second() {
  console.log('Inside second function');
}
first();
console.log('Inside Global Execution Context');
```

转化成图的形式

 ![](https://static.ecool.fun//article/76b38335-fbef-4b39-b024-c8526b250dca.png)

简单分析一下流程：

- 创建全局上下文请压入执行栈
- `first`函数被调用，创建函数执行上下文并压入栈
- 执行`first`函数过程遇到`second`函数，再创建一个函数执行上下文并压入栈
- `second`函数执行完毕，对应的函数执行上下文被推出执行栈，执行下一个执行上下文`first`函数
- `first`函数执行完毕，对应的函数执行上下文也被推出栈中，然后执行全局上下文
- 所有代码执行完毕，全局上下文也会被推出栈中，程序结束

</details>

## 389. 谈谈对 this 对象的理解 {#question-fe97f51f-1d7d-49b7-acd2-83f345014633}

> 难度：3 · 类型：QA

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

## 390. Javascript如何实现继承？ {#question-21144fa1-41b7-4077-97cd-b0c6030b10e0}

> 难度：2.5 · 类型：QA

### 题目要点

## 1. 原型链继承

通过将一个构造函数的实例作为另一个构造函数的原型，实现属性和方法的继承。

### 特点

- 简单易实现。
- 缺点是父类实例的属性会被所有子类实例共享。

## 2. 借用构造函数（经典继承）

通过在子类构造函数中调用父类构造函数，实现属性的继承。

### 特点

- 避免了原型链继承共享属性的问题。
- 但无法继承父类的原型方法。

## 3. 组合继承（原型链+借用构造函数）

结合原型链继承和借用构造函数的方法，既调用父类构造函数，又将父类原型赋值给子类原型。

### 特点

- 可以继承实例属性和原型方法。
- 需要注意避免构造函数属性的多次调用。

## 4. 原型式继承

使用一个函数来创建一个新对象，并将这个新对象的原型指向另一个对象。

### 特点

- 适用于对象之间的属性继承，不涉及构造函数。

## 5. 寄生式继承

基于原型式继承，但添加了额外的包装函数，以提供更好的控制和灵活性。

### 特点

- 通过创建对象的副本来实现继承，避免修改原始对象。

## 6. ES6 类继承

使用`class`关键字和`extends`关键字实现继承。

### 特点

- 语法简洁，易于理解。
- 底层仍然是基于原型链实现。

<details>
<summary>参考答案</summary>

## 一、是什么

继承（inheritance）是面向对象软件技术当中的一个概念。

如果一个类别B“继承自”另一个类别A，就把这个B称为“A的子类”，而把A称为“B的父类别”也可以称“A是B的超类”

- 继承的优点

继承可以使得子类具有父类别的各种属性和方法，而不需要再次编写相同的代码

在子类别继承父类别的同时，可以重新定义某些属性，并重写某些方法，即覆盖父类别的原有属性和方法，使其获得与父类别不同的功能

虽然`JavaScript`并不是真正的面向对象语言，但它天生的灵活性，使应用场景更加丰富

关于继承，我们举个形象的例子：

定义一个类（Class）叫汽车，汽车的属性包括颜色、轮胎、品牌、速度、排气量等

```js
class Car{
    constructor(color,speed){
        this.color = color
        this.speed = speed
        // ...
    }
}
```

由汽车这个类可以派生出“轿车”和“货车”两个类，在汽车的基础属性上，为轿车添加一个后备厢、给货车添加一个大货箱

```js
// 货车
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.Container = true // 货箱
    }
}
```

这样轿车和货车就是不一样的，但是二者都属于汽车这个类，汽车、轿车继承了汽车的属性，而不需要再次在“轿车”中定义汽车已经有的属性

在“轿车”继承“汽车”的同时，也可以重新定义汽车的某些属性，并重写或覆盖某些属性和方法，使其获得与“汽车”这个父类不同的属性和方法

```js
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.color = "black" //覆盖
        this.Container = true // 货箱
    }
}
```

从这个例子中就能详细说明汽车、轿车以及卡车之间的继承关系

## 二、实现方式

下面给出`JavaScript`常见的继承方式：

- 原型链继承

- 构造函数继承（借助 call）
- 组合继承
- 原型式继承
- 寄生式继承
- 寄生组合式继承

### 原型链继承

原型链继承是比较常见的继承方式之一，其中涉及的构造函数、原型和实例，三者之间存在着一定的关系，即每一个构造函数都有一个原型对象，原型对象又包含一个指向构造函数的指针，而实例则包含一个原型对象的指针

举个例子

```js
 function Parent() {
    this.name = 'parent1';
    this.play = [1, 2, 3]
  }
  function Child() {
    this.type = 'child2';
  }
  Child1.prototype = new Parent();
  console.log(new Child())
```

上面代码看似没问题，实际存在潜在问题

```js
var s1 = new Child2();
var s2 = new Child2();
s1.play.push(4);
console.log(s1.play, s2.play); // [1,2,3,4]
```

改变`s1`的`play`属性，会发现`s2`也跟着发生变化了，这是因为两个实例使用的是同一个原型对象，内存空间是共享的

### 构造函数继承

借助 `call `调用`Parent`函数

```js
function Parent1(){
    this.name = 'parent1';
}

Parent.prototype.getName = function () {
    return this.name;
}

function Child(){
    Parent1.call(this);
    this.type = 'child'
}

let child = new Child();
console.log(child);  // 没问题
console.log(child.getName());  // 会报错
```

可以看到，父类原型对象中一旦存在父类之前自己定义的方法，那么子类将无法继承这些方法

相比第一种原型链继承方式，父类的引用属性不会被共享，优化了第一种继承方式的弊端，但是只能继承父类的实例属性和方法，不能继承原型属性或者方法

### 组合继承

前面我们讲到两种继承方式，各有优缺点。组合继承则将前两种方式继承起来

```js
function Parent3 () {
    this.name = 'parent3';
    this.play = [1, 2, 3];
}

Parent3.prototype.getName = function () {
    return this.name;
}
function Child3() {
    // 第二次调用 Parent3()
    Parent3.call(this);
    this.type = 'child3';
}

// 第一次调用 Parent3()
Child3.prototype = new Parent3();
// 手动挂上构造器，指向自己的构造函数
Child3.prototype.constructor = Child3;
var s3 = new Child3();
var s4 = new Child3();
s3.play.push(4);
console.log(s3.play, s4.play);  // 不互相影响
console.log(s3.getName()); // 正常输出'parent3'
console.log(s4.getName()); // 正常输出'parent3'
```

这种方式看起来就没什么问题，方式一和方式二的问题都解决了，但是从上面代码我们也可以看到` Parent3` 执行了两次，造成了多构造一次的性能开销

### 原型式继承

这里主要借助`Object.create`方法实现普通对象的继承

同样举个例子

```js
let parent4 = {
    name: "parent4",
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };

  let person4 = Object.create(parent4);
  person4.name = "tom";
  person4.friends.push("jerry");

  let person5 = Object.create(parent4);
  person5.friends.push("lucy");

  console.log(person4.name); // tom
  console.log(person4.name === person4.getName()); // true
  console.log(person5.name); // parent4
  console.log(person4.friends); // ["p1", "p2", "p3","jerry","lucy"]
  console.log(person5.friends); // ["p1", "p2", "p3","jerry","lucy"]
```

这种继承方式的缺点也很明显，因为`Object.create `方法实现的是浅拷贝，多个实例的引用类型属性指向相同的内存，存在篡改的可能

### 寄生式继承

寄生式继承在上面继承基础上进行优化，利用这个浅拷贝的能力再进行增强，添加一些方法

```js
let parent5 = {
    name: "parent5",
    friends: ["p1", "p2", "p3"],
    getName: function() {
        return this.name;
    }
};

function clone(original) {
    let clone = Object.create(original);
    clone.getFriends = function() {
        return this.friends;
    };
    return clone;
}

let person5 = clone(parent5);

console.log(person5.getName()); // parent5
console.log(person5.getFriends()); // ["p1", "p2", "p3"]
```

其优缺点也很明显，跟上面讲的原型式继承一样

### 寄生组合式继承

寄生组合式继承，借助解决普通对象的继承问题的` Object.create` 方法，在亲全面几种继承方式的优缺点基础上进行改造，这也是所有继承方式里面相对最优的继承方式

```js
function clone (parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
}
Parent6.prototype.getName = function () {
    return this.name;
}
function Child6() {
    Parent6.call(this);
    this.friends = 'child5';
}

clone(Parent6, Child6);

Child6.prototype.getFriends = function () {
    return this.friends;
}

let person6 = new Child6();
console.log(person6); //{friends:"child5",name:"parent6",play:[1,2,3],__proto__:Parent6}
console.log(person6.getName()); // parent6
console.log(person6.getFriends()); // child5
```

可以看到 person6 打印出来的结果，属性都得到了继承，方法也没问题

文章一开头，我们是使用`ES6` 中的`extends `关键字直接实现 `JavaScript `的继承

```js
class Person {
  constructor(name) {
    this.name = name
  }
  // 原型方法
  // 即 Person.prototype.getName = function() { }
  // 下面可以简写为 getName() {...}
  getName = function () {
    console.log('Person:', this.name)
  }
}
class Gamer extends Person {
  constructor(name, age) {
    // 子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    super(name)
    this.age = age
  }
}
const asuna = new Gamer('Asuna', 20)
asuna.getName() // 成功访问到父类的方法
```

利用`babel`工具进行转换，我们会发现`extends`实际采用的也是寄生组合继承方式，因此也证明了这种方式是较优的解决继承的方式

## 三、总结

下面以一张图作为总结：

 ![](https://static.ecool.fun//article/c15679e3-2c26-4aef-a14f-8d6a68179bce.png)

通过`Object.create` 来划分不同的继承方式，最后的寄生式组合继承方式是通过组合继承改造之后的最优继承方式，而 `extends` 的语法糖和寄生组合继承的方式基本类似

</details>

## 391. JavaScript中的原型，原型链分别是什么? {#question-d1bb4169-cd53-4398-b4a1-5e0c533c87dc}

> 难度：2.5 · 类型：QA

### 题目要点

## 原型（Prototype）

在JavaScript中，每个对象都有一个原型对象，这个原型对象包含了一组属性和方法。对象可以通过这个原型对象继承属性和方法。

### 特点

- 原型对象本身也是一个普通的对象。
- 可以通过`Object.getPrototypeOf()`获取对象的原型。
- 原型上添加的属性和方法可以被子对象继承。

## 原型链（Prototype Chain）

原型链是一种机制，用于在查找对象属性时，从对象自身的属性开始，沿着原型的链式结构向上查找，直到找到属性或到达链的末端（通常是一个`null`的原型）。

### 特点

- 原型链是由一系列原型对象组成的，每个对象都可能有自己的原型。
- 属性查找遵循链式结构，从下到上直到找到匹配的属性或到达链的末端。
- 原型链允许对象共享属性和方法，提高了内存效率。

## 原型链的查找过程

1. **对象属性查找**：首先在对象自身属性中查找。
2. **原型属性查找**：如果当前对象没有找到，沿着原型链向上查找。
3. **链式结构**：继续在原型的原型上查找，直到链的末端。

## 原型链的末端

- 原型链的末端通常是`Object.prototype`，其原型为`null`。

## 原型链的作用

- **属性继承**：允许对象继承原型链上属性和方法。
- **方法共享**：多个对象可以共享原型上定义的方法，避免重复定义。

<details>
<summary>参考答案</summary>

## 一、原型

`JavaScript` 常被描述为一种基于原型的语言——每个对象拥有一个原型对象

当试图访问一个对象的属性时，它不仅仅在该对象上搜寻，还会搜寻该对象的原型，以及该对象的原型的原型，依次层层向上搜索，直到找到一个名字匹配的属性或到达原型链的末尾

准确地说，这些属性和方法定义在Object的构造器函数（constructor functions）之上的`prototype`属性上，而非实例对象本身

下面举个例子：

函数可以有属性。 每个函数都有一个特殊的属性叫作原型`prototype`

```js
function doSomething(){}
console.log( doSomething.prototype );
```

控制台输出

```js
{
    constructor: ƒ doSomething(),
    __proto__: {
        constructor: ƒ Object(),
        hasOwnProperty: ƒ hasOwnProperty(),
        isPrototypeOf: ƒ isPrototypeOf(),
        propertyIsEnumerable: ƒ propertyIsEnumerable(),
        toLocaleString: ƒ toLocaleString(),
        toString: ƒ toString(),
        valueOf: ƒ valueOf()
    }
}
```

上面这个对象，就是大家常说的原型对象

可以看到，原型对象有一个自有属性`constructor`，这个属性指向该函数，如下图关系展示

 ![](https://static.ecool.fun//article/2deaaac4-9732-4c1c-a3dd-8506adf9d0fe.png)

## 二、原型链

原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为原型链 (prototype chain)，它解释了为何一个对象会拥有定义在其他对象中的属性和方法

在对象实例和它的构造器之间建立一个链接（它是`__proto__`属性，是从构造函数的`prototype`属性派生的），之后通过上溯原型链，在构造器中找到这些属性和方法

下面举个例子：

```js
function Person(name) {
    this.name = name;
    this.age = 18;
    this.sayName = function() {
        console.log(this.name);
    }
}
// 第二步 创建实例
var person = new Person('person')
```

根据代码，我们可以得到下图

 ![](https://static.ecool.fun//article/9db8820a-8e19-4755-8edf-fc09231ff6ef.png)

下面分析一下：

- 构造函数`Person`存在原型对象`Person.prototype`
- 构造函数生成实例对象`person`，`person`的`__proto__`指向构造函数`Person`原型对象
- `Person.prototype.__proto__` 指向内置对象，因为 `Person.prototype` 是个对象，默认是由 `Object `函数作为类创建的，而 `Object.prototype` 为内置对象

- `Person.__proto__` 指向内置匿名函数 `anonymous`，因为 Person 是个函数对象，默认由 Function 作为类创建

- `Function.prototype` 和 `Function.__proto__ `同时指向内置匿名函数 `anonymous`，这样原型链的终点就是 `null`

## 三、总结

下面首先要看几个概念：

`__proto__`作为不同对象之间的桥梁，用来指向创建它的构造函数的原型对象的

 ![](https://static.ecool.fun//article/0c2d0d47-2b06-43ed-92e4-129425b6af0c.png)

每个对象的`__proto__`都是指向它的构造函数的原型对象`prototype`的

```js
person1.__proto__ === Person.prototype
```

构造函数是一个函数对象，是通过 `Function `构造器产生的

```js
Person.__proto__ === Function.prototype
```

原型对象本身是一个普通对象，而普通对象的构造函数都是`Object`

```js
Person.prototype.__proto__ === Object.prototype
```

刚刚上面说了，所有的构造器都是函数对象，函数对象都是 `Function `构造产生的

```js
Object.__proto__ === Function.prototype
```

`Object `的原型对象也有`__proto__`属性指向`null`，`null`是原型链的顶端

```js
Object.prototype.__proto__ === null
```

下面作出总结：

- 一切对象都是继承自`Object`对象，`Object` 对象直接继承根源对象` null`

- 一切的函数对象（包括 `Object` 对象），都是继承自 `Function` 对象

- `Object` 对象直接继承自 `Function` 对象

- `Function`对象的`__proto__`会指向自己的原型对象，最终还是继承自`Object`对象

</details>

## 392. 什么是作用域链？ {#question-fa224d36-147a-4251-8033-dc1462e9527e}

> 难度：2 · 类型：QA

### 题目要点

简单理解就是从当前环境向父级一层一层查找变量的过程称之为作用域链。

<details>
<summary>参考答案</summary>

作用域链（Scope Chain）是 JavaScript 中用于查找变量和函数的一种机制。每个 JavaScript 函数都会创建一个作用域链。

作用域链是由当前执行环境（Execution Context）中的变量对象（Variable Object）以及其父级执行环境的变量对象组成的。当代码在一个执行环境中执行时，如果需要访问一个变量或者函数，JavaScript 引擎会首先在当前执行环境的变量对象中查找，如果找不到，它会沿着作用域链向上一级的执行环境中查找，直到找到对应的变量或者函数，或者达到全局执行环境为止。

作用域链的形成是由函数定义时的位置来决定的，而不是函数调用时的位置。这意味着函数的作用域链是在函数定义时确定的，而不是在函数调用时确定的。

作用域链的重要性在于它决定了变量和函数的访问权限。一个变量或者函数能否在当前执行环境中被访问到，取决于它是否在当前执行环境的作用域链上。

</details>

## 393. 说说你对闭包的理解，以及闭包使用场景 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

> 难度：3 · 类型：QA

### 题目要点

# 什么是闭包

简单理解就是函数中嵌套函数。我们都知道局部变量我们是无法访问的，但是通过闭包可以做到。

```js
// 正常访问
var lan = 'zh';
function hello(){
  var name = '前端未来';
}
console.log(name)//很明显'undefined'

// 换成闭包
function hello(){
    var name = '前端未来';
    function demo(){
      console.log(name)//打印：前端未来
    }
}
```

# 闭包的应用场景

## 1. 数据封装和隐私

闭包可以用来封装数据和功能，创建具有私有变量和公共接口的模块。

### 应用

- 创建具有私有状态的模块或对象。

## 2. 函数工厂

闭包用于创建返回函数的函数，这些返回的函数可以维持状态。

### 应用

- 生成具有特定配置或状态的函数。

## 3. 柯里化（Currying）

闭包允许将多参数的函数转换成一系列单参数的函数。

### 应用

- 简化函数调用，逐步应用参数。

## 4. 延迟计算

闭包可以用于延迟计算，只在必要时才执行计算。

### 应用

- 实现性能优化，如懒加载。

## 5. 迭代器和生成器

闭包在迭代器和生成器中用于维护状态。

### 应用

- 实现可重复使用的迭代器。

## 6. 异步编程

闭包在异步回调中保持状态，避免在多层嵌套回调中使用额外的参数。

### 应用

- 管理异步操作的状态和结果。

## 7. 事件处理器

闭包可以捕获事件处理器需要的局部变量。

### 应用

- 为事件绑定具有特定状态的处理器。

## 8. 缓存和记忆

闭包可以用来实现缓存逻辑，存储和复用计算结果。

### 应用

- 减少重复计算，提高性能。

## 注意事项

- 闭包可能会导致内存使用增加，因为它们会保持对外部变量的引用。
- 理解闭包的作用域链对于避免意外的行为和内存泄漏很重要。
- 闭包提供了强大的功能，但应谨慎使用，以保持代码的清晰和可维护性。

<details>
<summary>参考答案</summary>

## 一、是什么

一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）

也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域

在 `JavaScript `中，每当创建一个函数，闭包就会在函数创建的同时被创建出来，作为函数内部与外部连接起来的一座桥梁

下面给出一个简单的例子

```js
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

`displayName()` 没有自己的局部变量。然而，由于闭包的特性，它可以访问到外部函数的变量

## 二、使用场景

任何闭包的使用场景都离不开这两点：

- 创建私有变量
- 延长变量的生命周期

> 一般函数的词法环境在函数返回后就被销毁，但是闭包会保存对创建时所在词法环境的引用，即便创建时所在的执行上下文被销毁，但创建时所在词法环境依然存在，以达到延长变量的生命周期的目的

下面举个例子：

在页面上添加一些可以调整字号的按钮

```js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);

document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```

### 柯里化函数

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用

```js
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

### 使用闭包模拟私有方法

在`JavaScript`中，没有支持声明私有变量，但我们可以使用闭包来模拟私有方法

下面举个例子：

```js
var Counter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
};

var Counter1 = Counter();
var Counter2 = Counter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

上述通过使用闭包来定义公共函数，并令其可以访问私有函数和变量，这种方式也叫模块方式

两个计数器 `Counter1` 和 `Counter2` 是维护它们各自的独立性的，每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境，不会影响另一个闭包中的变量

### 其他

例如计数器、延迟调用、回调等闭包的应用，其核心思想还是创建私有变量和延长变量的生命周期

## 三、注意事项

如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响

例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。

原因在于每个对象的创建，方法都会被重新赋值

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

</details>

## 394. 深拷贝浅拷贝有什么区别？怎么实现深拷贝？ {#question-a5330a58-5be0-4f4f-8394-43392311ddaa}

> 难度：3.5 · 类型：QA

### 题目要点

JS数据类型分别基本数据类型和引用数据类型，基本数据类型保存的是值，引用类型保存的是引用地址(this指针)。

浅拷贝共用一个引用地址，深拷贝会创建新的内存地址。

#### 浅拷贝方法

- 直接对象复制
- Object.assign

#### 深拷贝

- JSON.stringify转为字符串再JSON.parse
- 深度递归遍历

<details>
<summary>参考答案</summary>

## 一、数据类型存储

前面文章我们讲到，`JavaScript`中存在两大数据类型：

- 基本类型
- 引用类型

基本类型数据保存在在栈内存中

引用类型数据保存在堆内存中，引用数据类型的变量是一个指向堆内存中实际对象的引用，存在栈中

## 二、浅拷贝

浅拷贝，指的是创建新的数据，这个数据有着原始数据属性值的一份精确拷贝

如果属性是基本类型，拷贝的就是基本类型的值。如果属性是引用类型，拷贝的就是内存地址

即浅拷贝是拷贝一层，深层次的引用类型则共享内存地址

下面简单实现一个浅拷贝

```js
function shallowClone(obj) {
    const newObj = {};
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop)){
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
}
```

在`JavaScript`中，存在浅拷贝的现象有：

- `Object.assign`
- `Array.prototype.slice()`, `Array.prototype.concat()`
- 使用拓展运算符实现的复制

### Object.assign

```js
var obj = {
    age: 18,
    nature: ['smart', 'good'],
    names: {
        name1: 'fx',
        name2: 'xka'
    },
    love: function () {
        console.log('fx is a great girl')
    }
}
var newObj = Object.assign({}, obj);
```

### slice()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.slice(0)
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### concat()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.concat()
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### 拓展运算符

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = [...fxArr]
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

## 三、深拷贝

深拷贝开辟一个新的栈，两个对象的属性完全相同，但是对应两个不同的地址，修改一个对象的属性，不会改变另一个对象的属性

常见的深拷贝方式有：

- _.cloneDeep()

- jQuery.extend()
- JSON.stringify()
- 手写循环递归

### _.cloneDeep()

```js
const _ = require('lodash');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
```

### jQuery.extend()

```js
const $ = require('jquery');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = $.extend(true, {}, obj1);
console.log(obj1.b.f === obj2.b.f); // false
```

### JSON.stringify()

```js
const obj2=JSON.parse(JSON.stringify(obj1));
```

但是这种方式存在弊端，会忽略`undefined`、`symbol`和`函数`

```js
const obj = {
    name: 'A',
    name1: undefined,
    name3: function() {},
    name4:  Symbol('A')
}
const obj2 = JSON.parse(JSON.stringify(obj));
console.log(obj2); // {name: "A"}
```

### 循环递归

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== "object") return obj;
  // 是对象的话就要进行深拷贝
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}
```

## 四、区别

下面首先借助两张图，可以更加清晰看到浅拷贝与深拷贝的区别

 ![](https://static.ecool.fun//article/8252919d-2855-4ccd-9b2e-d64ce5c07be2.png)

从上图发现，浅拷贝和深拷贝都创建出一个新的对象，但在复制对象属性的时候，行为就不一样

浅拷贝只复制属性指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存，修改对象属性会影响原对象

```js
// 浅拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj3=shallowClone(obj1) // 一个浅拷贝方法
obj3.name = "update";
obj3.arr[1] = [5,6,7] ; // 新旧对象还是共享同一块内存

console.log('obj1',obj1) // obj1 { name: 'init',  arr: [ 1, [ 5, 6, 7 ], 4 ] }
console.log('obj3',obj3) // obj3 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象

```js
// 深拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj4=deepClone(obj1) // 一个深拷贝方法
obj4.name = "update";
obj4.arr[1] = [5,6,7] ; // 新对象跟原对象不共享内存

console.log('obj1',obj1) // obj1 { name: 'init', arr: [ 1, [ 2, 3 ], 4 ] }
console.log('obj4',obj4) // obj4 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

### 小结

前提为拷贝类型为引用类型的情况下：

- 浅拷贝是复制内存中的地址，拷贝前后的对象，因为引用类型共享了同一块内存，修改会相互影响。
- 深拷贝是递归拷贝深层次，属性为对象时，深拷贝是新开栈，两个对象指向不同的地址

</details>

## 395. == 和 ===有什么区别，分别在什么情况使用？ {#question-ddec2e9f-993c-4298-8477-b7bc25db7713}

> 难度：1.5 · 类型：QA

### 题目要点

### 等于操作符（==）

- **定义**：使用两个等于号（==）表示，如果操作数相等，则返回 `true`。
- **隐式类型转换**：在比较中会先进行类型转换，再确定操作数是否相等。
- **类型转换规则**：
  - 布尔值转换为数值：`true` 转换为 `1`，`false` 转换为 `0`。
  - 字符串与数值比较：尝试将字符串转换为数值。
  - 对象与非对象比较：调用对象的 `valueOf()` 方法取得其原始值。
  - `null` 和 `undefined` 相等。
  - 存在 `NaN` 则返回 `false`。
  - 两个对象比较：比较它们是否指向同一个对象。

### 全等操作符（===）

- **定义**：使用三个等于号（===）表示，只有两个操作数在不转换的前提下相等才返回 `true`。
- **类型和值比较**：要求类型相同且值相等。
- **特殊值比较**：`undefined` 和 `null` 与自身严格相等。

### 相等操作符（==）与全等操作符（===）的区别

- **类型转换**：相等操作符会进行类型转换，全等操作符不会。
- **特殊值比较**：在比较 `null` 和 `undefined` 时，相等操作符返回 `true`，全等操作符返回 `false`。

### 总结

- **相等操作符（==）**：用于比较值，在必要的情况下进行类型转换。
- **全等操作符（===）**：用于比较值和类型，不进行类型转换。
在使用相等操作符时，需要注意其隐式类型转换可能带来的非直观结果。在大多数情况下，建议使用全等操作符以确保比较的准确性和可预测性。在特定情况下，如比较 `null` 或 `undefined`，可以使用相等操作符以简化代码。

<details>
<summary>参考答案</summary>

## 一、等于操作符

等于操作符用两个等于号（ == ）表示，如果操作数相等，则会返回 `true`

前面文章，我们提到在`JavaScript`中存在隐式转换。等于操作符（==）在比较中会先进行类型转换，再确定操作数是否相等

遵循以下规则：

如果任一操作数是布尔值，则将其转换为数值再比较是否相等

```js
let result1 = (true == 1); // true
```

如果一个操作数是字符串，另一个操作数是数值，则尝试将字符串转换为数值，再比较是否相等

```js
let result1 = ("55" == 55); // true
```

如果一个操作数是对象，另一个操作数不是，则调用对象的 `valueOf() `方法取得其原始值，再根据前面的规则进行比较

```js
let obj = {valueOf:function(){return 1}}
let result1 = (obj == 1); // true
```

`null `和` undefined `相等

```js
let result1 = (null == undefined ); // true
```

如果有任一操作数是 `NaN` ，则相等操作符返回 `false`

```js
let result1 = (NaN == NaN ); // false
```

如果两个操作数都是对象，则比较它们是不是同一个对象。如果两个操作数都指向同一个对象，则相等操作符返回` true `

```
let obj1 = {name:"xxx"}
let obj2 = {name:"xxx"}
let result1 = (obj1 == obj2 ); // false
```

下面进一步做个小结：

- 两个都为简单类型，字符串和布尔值都会转换成数值，再比较
- 简单类型与引用类型比较，对象转化成其原始类型的值，再比较

- 两个都为引用类型，则比较它们是否指向同一个对象

- null 和 undefined 相等
- 存在 NaN 则返回 false

## 二、全等操作符

全等操作符由 3 个等于号（ === ）表示，只有两个操作数在不转换的前提下相等才返回 `true`。即类型相同，值也需相同

```js
let result1 = ("55" === 55); // false，不相等，因为数据类型不同
let result2 = (55 === 55); // true，相等，因为数据类型相同值也相同
```

`undefined` 和 `null` 与自身严格相等

```js
let result1 = (null === null)  //true
let result2 = (undefined === undefined)  //true
```

## 三、区别

相等操作符（==）会做类型转换，再进行值的比较，全等运算符不会做类型转换

```js
let result1 = ("55" === 55); // false，不相等，因为数据类型不同
let result2 = (55 === 55); // true，相等，因为数据类型相同值也相同
```

`null` 和 `undefined` 比较，相等操作符（==）为`true`，全等为`false`

```js
let result1 = (null == undefined ); // true
let result2 = (null  === undefined); // false
```

### 小结

相等运算符隐藏的类型转换，会带来一些违反直觉的结果

```js
'' == '0' // false
0 == '' // true
0 == '0' // true

false == 'false' // false
false == '0' // true

false == undefined // false
false == null // false
null == undefined // true

' \t\r\n' == 0 // true
```

但在比较`null`的情况的时候，我们一般使用相等操作符`==`

```js
const obj = {};

if(obj.x == null){
  console.log("1");  //执行
}
```

等同于下面写法

```js
if(obj.x === null || obj.x === undefined) {
    ...
}
```

使用相等操作符（==）的写法明显更加简洁了

所以，除了在比较对象属性为`null`或者`undefined`的情况下，我们可以使用相等操作符（==），其他情况建议一律使用全等操作符（===）

</details>

## 396. 谈谈 Javascript 中的类型转换机制 {#question-5eb78861-d964-4825-8531-316eca1df596}

> 难度：2 · 类型：QA

### 题目要点

JavaScript 的类型转换由 ECMAScript 规范中的抽象操作定义。

核心转换机制包括 ToPrimitive、ToBoolean、ToNumber、ToString、ToObject 和 ToBigInt。

对象参与运算时会先执行 ToPrimitive，然后再进入后续类型转换流程。

不同语境会触发不同转换，例如条件判断触发布尔转换，算术运算触发数值转换。

工程实践中通常通过显式转换和严格比较减少隐式类型转换带来的不确定性。

<details>
<summary>参考答案</summary>

JavaScript 允许不同数据类型之间参与运算，因此在执行表达式时需要将值转换为目标类型。ECMAScript 规范通过一系列抽象操作定义了这种行为，这些抽象操作就是 JavaScript 类型转换机制的核心。

## 技术分析

从规范角度来看，JavaScript 的类型转换主要由几类 **抽象转换操作**构成。

首先是 **ToPrimitive**。当对象参与运算时，必须先转换为原始值（primitive）。转换过程会根据 hint（string / number / default）尝试调用对象的 valueOf() 或 toString() 方法。如果仍然无法得到原始值，则抛出异常。许多复杂的类型转换问题，本质都发生在这个阶段。

其次是 **ToBoolean**。该转换通常出现在条件判断中，例如 if、while、逻辑运算符等。JavaScript 中存在一组固定的 falsy 值：false、0、-0、0n、""、null、undefined、NaN，其余值都会被转换为 true。

第三类是 **ToNumber**。算术运算、比较运算以及部分 API 会触发数值转换。字符串如果能解析为合法数字则转换成功，否则得到 NaN。null 会转换为 0，undefined 会转换为 NaN，布尔值 true 和 false 分别转换为 1 和 0。

第四类是 **ToString**。字符串拼接、模板字符串以及部分 API 会触发字符串转换。例如数字会转换为对应的字符串形式，null 和 undefined 分别变成 "null" 和 "undefined"，对象则通常通过 toString() 转换。

第五类是 **ToObject**。当原始值需要表现为对象时会触发该转换，例如访问属性或调用方法时。比如 `"abc".length` 会先将字符串包装成 String 对象。

最后还有 **ToBigInt**，这是在 BigInt 引入后新增的一种转换方式，用于在特定语境下将值转换为 BigInt，但它不会像 Number 那样进行宽松转换，例如 Number 和 BigInt 不能直接混合运算。

## 工程实践

在实际开发中，大多数隐式转换发生在三个场景：运算表达式、比较运算和条件判断。例如字符串与数字相加会触发字符串拼接，而减法则会触发数字转换。对象参与运算时又会额外经历 ToPrimitive 过程。

因此工程实践通常会遵循两个原则：一是避免依赖隐式类型转换带来的副作用，二是在数据进入业务逻辑前进行显式类型规范化，例如统一转换为 Number 或 String，以保证逻辑稳定性。

</details>

## 397. Javascript字符串的常用方法有哪些？ {#question-39513146-d7a4-41ad-963f-ba32242ddc55}

> 难度：1 · 类型：QA

### 题目要点

我们也可将字符串常用的操作方法归纳为增、删、改、查，需要知道字符串的特点是一旦创建了，就不可变

<details>
<summary>参考答案</summary>

## 一、操作方法

我们也可将字符串常用的操作方法归纳为增、删、改、查，需要知道字符串的特点是一旦创建了，就不可变

### 增

这里增的意思并不是说直接增添内容，而是创建字符串的一个副本，再进行操作

除了常用`+`以及`${}`进行字符串拼接之外，还可通过`concat`

#### concat

用于将一个或多个字符串拼接成一个新字符串

```js
let stringValue = "hello ";
let result = stringValue.concat("world");
console.log(result); // "hello world"
console.log(stringValue); // "hello"
```

### 删

这里的删的意思并不是说删除原字符串的内容，而是创建字符串的一个副本，再进行操作

常见的有：

- slice()
- substr()
- substring()

这三个方法都返回调用它们的字符串的一个子字符串，而且都接收一或两个参数。

```js
let stringValue = "hello world";
console.log(stringValue.slice(3)); // "lo world"
console.log(stringValue.substring(3)); // "lo world"
console.log(stringValue.substr(3)); // "lo world"
console.log(stringValue.slice(3, 7)); // "lo w"
console.log(stringValue.substring(3,7)); // "lo w"
console.log(stringValue.substr(3, 7)); // "lo worl"
```

### 改

这里改的意思也不是改变原字符串，而是创建字符串的一个副本，再进行操作

常见的有：

- trim()、trimLeft()、trimRight()

- repeat()
- padStart()、padEnd()
- toLowerCase()、 toUpperCase()

#### trim()、trimLeft()、trimRight()

删除前、后或前后所有空格符，再返回新的字符串

```js
let stringValue = " hello world ";
let trimmedStringValue = stringValue.trim();
console.log(stringValue); // " hello world "
console.log(trimmedStringValue); // "hello world"
```

#### repeat()

接收一个整数参数，表示要将字符串复制多少次，然后返回拼接所有副本后的结果

```js
let stringValue = "na ";
let copyResult = stringValue.repeat(2) // na na
```

#### padEnd()

复制字符串，如果小于指定长度，则在相应一边填充字符，直至满足长度条件

```js
let stringValue = "foo";
console.log(stringValue.padStart(6)); // " foo"
console.log(stringValue.padStart(9, ".")); // "......foo"
```

### toLowerCase()、 toUpperCase()

大小写转化

```js
let stringValue = "hello world";
console.log(stringValue.toUpperCase()); // "HELLO WORLD"
console.log(stringValue.toLowerCase()); // "hello world"
```

### 查

除了通过索引的方式获取字符串的值，还可通过：

- chatAt()

- indexOf()

- startWith()

- includes()

#### charAt()

返回给定索引位置的字符，由传给方法的整数参数指定

```js
let message = "abcde";
console.log(message.charAt(2)); // "c"
```

#### indexOf()

从字符串开头去搜索传入的字符串，并返回位置（如果没找到，则返回 -1 ）

```js
let stringValue = "hello world";
console.log(stringValue.indexOf("o")); // 4
```

#### startWith()、includes()

从字符串中搜索传入的字符串，并返回一个表示是否包含的布尔值

```js
let message = "foobarbaz";
console.log(message.startsWith("foo")); // true
console.log(message.startsWith("bar")); // false
console.log(message.includes("bar")); // true
console.log(message.includes("qux")); // false
```

## 二、转换方法

### split

把字符串按照指定的分割符，拆分成数组中的每一项

```js
let str = "12+23+34"
let arr = str.split("+") // [12,23,34]
```

## 三、模板匹配方法

针对正则表达式，字符串设计了几个方法：

- match()
- search()
- replace()

### match()

接收一个参数，可以是一个正则表达式字符串，也可以是一个` RegExp `对象，返回数组

```js
let text = "cat, bat, sat, fat";
let pattern = /.at/;
let matches = text.match(pattern);
console.log(matches[0]); // "cat"
```

### search()

接收一个参数，可以是一个正则表达式字符串，也可以是一个` RegExp `对象，找到则返回匹配索引，否则返回 -1

```js
let text = "cat, bat, sat, fat";
let pos = text.search(/at/);
console.log(pos); // 1
```

### replace()

接收两个参数，第一个参数为匹配的内容，第二个参数为替换的元素（可用函数）

```js
let text = "cat, bat, sat, fat";
let result = text.replace("at", "ond");
console.log(result); // "cond, bat, sat, fat"
```

</details>

## 398. Javscript数组的常用方法有哪些？ {#question-4b009a64-6d98-4469-89d4-9c254d682fa6}

> 难度：1.5 · 类型：QA

### 题目要点

以下是一些常见的JavaScript数组方法：

<details>
<summary>参考答案</summary>

以下是一些常见的JavaScript数组方法：

1. `push()`: 在数组末尾添加一个或多个元素，并返回新数组的长度。
2. `pop()`: 移除并返回数组末尾的元素。
3. `unshift()`: 在数组开头添加一个或多个元素，并返回新数组的长度。
4. `shift()`: 移除并返回数组开头的元素。
5. `concat()`: 合并两个或更多数组，并返回新的合并后的数组，不会修改原始数组。
6. `slice()`: 从数组中提取指定位置的元素，返回一个新的数组，不会修改原始数组。
7. `splice()`: 从指定位置删除或替换元素，可修改原始数组。
8. `indexOf()`: 查找指定元素在数组中的索引，如果不存在则返回-1。
9. `lastIndexOf()`: 从数组末尾开始查找指定元素在数组中的索引，如果不存在则返回-1。
10. `includes()`: 检查数组是否包含指定元素，返回一个布尔值。
11. `join()`: 将数组中的所有元素转为字符串，并使用指定的分隔符连接它们。
12. `reverse()`: 颠倒数组中元素的顺序，会修改原始数组。
13. `sort()`: 对数组中的元素进行排序，默认按照字母顺序排序，会修改原始数组。
14. `filter()`: 创建一个新数组，其中包含符合条件的所有元素。
15. `map()`: 创建一个新数组，其中包含对原始数组中的每个元素进行操作后的结果。
16. `reduce()`: 将数组中的元素进行累积操作，返回一个单一的值。
17. `forEach()`: 对数组中的每个元素执行提供的函数。

</details>

## 399. 你是怎么理解ES6中 Decorator 的？使用场景有哪些？ {#question-5116f1a8-f1b2-49ec-bbfc-5550861762da}

> 难度：3.5 · 类型：QA

### 题目要点

Decorator，即装饰器，从名字上很容易让我们联想到装饰者模式

<details>
<summary>参考答案</summary>

## 一、介绍

Decorator，即装饰器，从名字上很容易让我们联想到装饰者模式

简单来讲，装饰者模式就是一种在不改变原类和使用继承的情况下，动态地扩展对象功能的设计理论。

`ES6`中`Decorator`功能亦如此，其本质也不是什么高大上的结构，就是一个普通的函数，用于扩展类属性和类方法

这里定义一个士兵，这时候他什么装备都没有

```js
class soldier{
}
```

定义一个得到 AK 装备的函数，即装饰器

```js
function strong(target){
    target.AK = true
}
```

使用该装饰器对士兵进行增强

```js
@strong
class soldier{
}
```

这时候士兵就有武器了

```js
soldier.AK // true
```

上述代码虽然简单，但也能够清晰看到了使用`Decorator`两大优点：

- 代码可读性变强了，装饰器命名相当于一个注释
- 在不改变原有代码情况下，对原来功能进行扩展

## 二、用法

`Docorator`修饰对象为下面两种：

- 类的装饰
- 类属性的装饰

### 类的装饰

当对类本身进行装饰的时候，能够接受一个参数，即类本身

将装饰器行为进行分解，大家能够有个更深入的了解

```js
@decorator
class A {}

// 等同于

class A {}
A = decorator(A) || A;
```

下面`@testable`就是一个装饰器，`target`就是传入的类，即`MyTestableClass`，实现了为类添加静态属性

```js
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

如果想要传递参数，可以在装饰器外层再封装一层函数

```js
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

### 类属性的装饰

当对类属性进行装饰的时候，能够接受三个参数：

- 类的原型对象
- 需要装饰的属性名
- 装饰属性名的描述对象

首先定义一个`readonly`装饰器

```js
function readonly(target, name, descriptor){
  descriptor.writable = false; // 将可写属性设为false
  return descriptor;
}
```

使用`readonly`装饰类的`name`方法

```javascript
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

相当于以下调用

```js
readonly(Person.prototype, 'name', descriptor);
```

如果一个方法有多个装饰器，就像洋葱一样，先从外到内进入，再由内到外执行

```javascript
function dec(id){
    console.log('evaluated', id);
    return (target, property, descriptor) =>console.log('executed', id);
}

class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// evaluated 1
// evaluated 2
// executed 2
// executed 1
```

外层装饰器`@dec(1)`先进入，但是内层装饰器`@dec(2)`先执行

### 注意

装饰器不能用于修饰函数，因为函数存在变量声明情况

```js
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

编译阶段，变成下面

```js
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

意图是执行后`counter`等于 1，但是实际上结果是`counter`等于 0

## 三、使用场景

基于`Decorator`强大的作用，我们能够完成各种场景的需求，下面简单列举几种：

使用`react-redux`的时候，如果写成下面这种形式，既不雅观也很麻烦

```js
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

通过装饰器就变得简洁多了

```js
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}
```

将`mixins`，也可以写成装饰器，让使用更为简洁了

```js
function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}

// 使用
const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

下面再讲讲`core-decorators.js`几个常见的装饰器

#### @antobind

`autobind`装饰器使得方法中的`this`对象，绑定原始对象

```javascript
import { autobind } from 'core-decorators';

class Person {
  @autobind
  getPerson() {
    return this;
  }
}

let person = new Person();
let getPerson = person.getPerson;

getPerson() === person;
// true
```

#### @readonly

`readonly`装饰器使得属性或方法不可写

```javascript
import { readonly } from 'core-decorators';

class Meal {
  @readonly
  entree = 'steak';
}

var dinner = new Meal();
dinner.entree = 'salmon';
// Cannot assign to read only property 'entree' of [object Object]
```

#### @deprecate

`deprecate`或`deprecated`装饰器在控制台显示一条警告，表示该方法将废除

```javascript
import { deprecate } from 'core-decorators';

class Person {
  @deprecate
  facepalm() {}

  @deprecate('功能废除了')
  facepalmHard() {}
}

let person = new Person();

person.facepalm();
// DEPRECATION Person#facepalm: This function will be removed in future versions.

person.facepalmHard();
// DEPRECATION Person#facepalmHard: 功能废除了

```

</details>

## 400. 你是怎么理解ES6中Module的？使用场景有哪些？ {#question-c9d672a0-9abe-46ec-812b-fd198f1e79f4}

> 难度：3 · 类型：QA

### 题目要点

### 延伸知识

面试中，ES module知识通常会和传统的 CommonJS 规范一起考察，特别是他们之间的差异。**最重要的差异**：ES Module是静态分析，CommonJS是运行时；ES导出的是 *引用*，CommonJS导出的是值拷贝。

关于导出引用和导出值拷贝，可以看这两个示例。

**ES Module**

```javascript
// moduleA.mjs
export let count = 0;

export const increment = () => {
    count++;
    console.log(`Module A count incremented to ${count}`);
};

export const getCount = () => count;

// moduleB.mjs
import { increment, getCount, count } from './moduleA.mjs';

console.log('Module B before increment:', getCount(), count);
increment();
console.log('Module B after increment:', getCount(), count);
```

```shell
# node ./moduleB.mjs
Module B before increment: 0 0
Module A count incremented to 1
Module B after increment: 1 1
```

**CommonJS**

```javascript
// moduleA.js
let count = 0;

exports.increment = () => {
    count++;
    console.log(`Module A count incremented to ${count}`);
};

exports.getCount = () => count;
exports.count = count;

// moduleB.js
const { increment, getCount, count } = require('./moduleA.js');

console.log('Module B before increment:', getCount(), count);
increment();
console.log('Module B after increment:', getCount(), count);
```

```shell
# node ./moduleB.js
Module B before increment: 0 0
Module A count incremented to 1
Module B after increment: 1 0
```

**注意看**，上面有2个主要差异：

- 在nodejs里，es module的JS文件后缀是 `.mjs`，普通的JS文件是 `.js`
- 导出的 `count`变量，在 es module下可以正确读取到更新后的值，但是commonjs下还是初始值

下面列出其他一些差异，也是要熟练掌握的：

1. **语法差异**:
   - **ES Module**: 使用 `import` 和 `export` 关键字进行模块导入和导出。
   - **CommonJS**: 使用 `require()` 函数导入模块，`module.exports` 或 `exports` 导出模块。

2. **加载时机**:
   - **ES Module**: 在静态分析阶段进行加载，可以在代码运行之前静态分析模块的依赖关系。
   - **CommonJS**: 在运行时加载模块，模块的导入和导出是动态的。

3. **异步加载**:
   - **ES Module**: 支持异步加载模块，可以使用 `import()` 函数动态加载模块。
   - **CommonJS**: 模块加载是同步的，不支持异步加载模块的语法。

4. **作用域**:
   - **ES Module**: 模块中的变量在模块级别上是私有的，不会污染全局作用域。
   - **CommonJS**: 模块中的变量是在模块作用域内，但可以通过 `module.exports` 或 `exports` 将变量暴露给其他模块。

5. **动态性**:
   - **ES Module**: 静态分析使得编译器可以进行优化，提前加载模块。
   - **CommonJS**: 运行时加载使得模块加载成本较高，不能进行像 ES Module 那样的静态优化。

6. **环境兼容性**:
   - **ES Module**: 主要用于现代浏览器和 Node.js 版本 12 以上的环境，需要通过 Babel 等工具进行转换以支持旧版浏览器或 Node.js。
   - **CommonJS**: 是 Node.js 的默认模块系统，广泛应用于 Node.js 的后端开发，不需要额外的转换工具。

7. **循环依赖处理**:
   - **ES Module**: 支持静态分析，可以检测和处理循环依赖。
   - **CommonJS**: 在运行时加载模块，循环依赖的处理需要开发者注意避免。

8. **默认导出**:
   - **ES Module**: 支持导出单个默认值，使用 `export default`。
   - **CommonJS**: 没有直接的默认导出语法，通常通过 `module.exports` 或 `exports` 导出单个值。

<details>
<summary>参考答案</summary>

## 一、介绍

模块，（Module），是能够单独命名并独立地完成一定功能的程序语句的**集合（即程序代码和数据结构的集合体）**。

两个基本的特征：外部特征和内部特征

- 外部特征是指模块跟外部环境联系的接口（即其他模块或程序调用该模块的方式，包括有输入输出参数、引用的全局变量）和模块的功能

- 内部特征是指模块的内部环境具有的特点（即该模块的局部数据和程序代码）

### 为什么需要模块化

- 代码抽象
- 代码封装
- 代码复用
- 依赖管理

如果没有模块化，我们代码会怎样？

- 变量和方法不容易维护，容易污染全局作用域
- 加载资源的方式通过script标签从上到下。
- 依赖的环境主观逻辑偏重，代码较多就会比较复杂。
- 大型项目资源难以维护，特别是多人合作的情况下，资源的引入会让人奔溃

因此，需要一种将` JavaScript `程序模块化的机制，如

- CommonJs (典型代表：node.js早期)
- AMD (典型代表：require.js)
- CMD (典型代表：sea.js)

### AMD

`Asynchronous ModuleDefinition`（AMD），异步模块定义，采用异步方式加载模块。所有依赖模块的语句，都定义在一个回调函数中，等到模块加载完成之后，这个回调函数才会运行

代表库为`require.js`

```js
/** main.js 入口文件/主模块 **/
// 首先用config()指定各模块路径和引用名
require.config({
  baseUrl: "js/lib",
  paths: {
    "jquery": "jquery.min",  //实际路径为js/lib/jquery.min.js
    "underscore": "underscore.min",
  }
});
// 执行基本操作
require(["jquery","underscore"],function($,_){
  // some code here
});
```

### CommonJs

`CommonJS` 是一套 `Javascript` 模块规范，用于服务端

```js
// a.js
module.exports={ foo , bar}

// b.js
const { foo,bar } = require('./a.js')
```

其有如下特点：

- 所有代码都运行在模块作用域，不会污染全局作用域
- 模块是同步加载的，即只有加载完成，才能执行后面的操作
- 模块在首次执行后就会缓存，再次加载只返回缓存结果，如果想要再次执行，可清除缓存
- `require`返回的值是被输出的值的拷贝，模块内部的变化也不会影响这个值

既然存在了`AMD`以及`CommonJs`机制，`ES6`的`Module`又有什么不一样？

ES6 在语言标准的层面上，实现了`Module`，即模块功能，完全可以取代 `CommonJS `和 `AMD `规范，成为浏览器和服务器通用的模块解决方案

`CommonJS` 和` AMD` 模块，都只能在运行时确定这些东西。比如，`CommonJS `模块就是对象，输入时必须查找对象属性

```javascript
// CommonJS模块
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

`ES6`设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量

```js
// ES6模块
import { stat, exists, readFile } from 'fs';
```

上述代码，只加载3个方法，其他方法不加载，即 `ES6` 可以在编译时就完成模块加载

由于编译加载，使得静态分析成为可能。包括现在流行的`typeScript`也是依靠静态分析实现功能

## 二、使用

`ES6`模块内部自动采用了严格模式，这里就不展开严格模式的限制，毕竟这是`ES5`之前就已经规定好

模块功能主要由两个命令构成：

- `export`：用于规定模块的对外接口
- `import`：用于输入其他模块提供的功能

### export

一个模块就是一个独立的文件，该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用`export`关键字输出该变量

```javascript
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;

或
// 建议使用下面写法，这样能瞬间确定输出了哪些变量
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export { firstName, lastName, year };
```

输出函数或类

```js
export function multiply(x, y) {
  return x * y;
};
```

通过`as`可以进行输出变量的重命名

```js
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
```

### import

使用`export`命令定义了模块的对外接口以后，其他 JS 文件就可以通过`import`命令加载这个模块

```javascript
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

同样如果想要输入变量起别名，通过`as`关键字

```javascript
import { lastName as surname } from './profile.js';
```

当加载整个模块的时候，需要用到星号`*`

```js
// circle.js
export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}

// main.js
import * as circle from './circle';
console.log(circle)   // {area:area,circumference:circumference}
```

输入的变量都是只读的，不允许修改，但是如果是对象，允许修改属性

```js
import {a} from './xxx.js'

a.foo = 'hello'; // 合法操作
a = {}; // Syntax Error : 'a' is read-only;
```

不过建议即使能修改，但我们不建议。因为修改之后，我们很难差错

`import`后面我们常接着`from`关键字，`from`指定模块文件的位置，可以是相对路径，也可以是绝对路径

```js
import { a } from './a';
```

如果只有一个模块名，需要有配置文件，告诉引擎模块的位置

```javascript
import { myMethod } from 'util';
```

在编译阶段，`import`会提升到整个模块的头部，首先执行

```javascript
foo();

import { foo } from 'my_module';
```

多次重复执行同样的导入，只会执行一次

```js
import 'lodash';
import 'lodash';
```

上面的情况，大家都能看到用户在导入模块的时候，需要知道加载的变量名和函数，否则无法加载

如果不需要知道变量名或函数就完成加载，就要用到`export default`命令，为模块指定默认输出

```js
// export-default.js
export default function () {
    console.log('foo');
}
```

加载该模块的时候，`import`命令可以为该函数指定任意名字

```js
// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

### 动态加载

允许您仅在需要时动态加载模块，而不必预先加载所有模块，这存在明显的性能优势

这个新功能允许您将`import()`作为函数调用，将其作为参数传递给模块的路径。 它返回一个 `promise`，它用一个模块对象来实现，让你可以访问该对象的导出

```js
import('/modules/myModule.mjs')
  .then((module) => {
    // Do something with the module.
  });
```

### 复合写法

如果在一个模块之中，先输入后输出同一个模块，`import`语句可以与`export`语句写在一起

```javascript
export { foo, bar } from 'my_module';

// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```

同理能够搭配`as`、`*`搭配使用

## 三、使用场景

如今，`ES6`模块化已经深入我们日常项目开发中，像`vue`、`react`项目搭建项目，组件化开发处处可见，其也是依赖模块化实现

`vue`组件

```js
<template>
  <div class="App">
      组件化开发 ---- 模块化
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
```

`react`组件

```js
function App() {
  return (
    <div className="App">
        组件化开发 ---- 模块化
    </div>
  );
}

export default App;
```

包括完成一些复杂应用的时候，我们也可以拆分成各个模块

</details>

## 401. 你是怎么理解ES6中Proxy的？使用场景有哪些? {#question-70db8e81-b858-4f3a-8bf9-d2bd1eb142e2}

> 难度：3.5 · 类型：QA

### 题目要点

**定义：** 用于定义基本操作的自定义行为

<details>
<summary>参考答案</summary>

## 一、介绍

**定义：** 用于定义基本操作的自定义行为

**本质：** 修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程`(meta programming)`

元编程（Metaprogramming，又译超编程，是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作

一段代码来理解
```bash
#!/bin/bash
# metaprogram
echo '#!/bin/bash' >program
for ((I=1; I<=1024; I++)) do
    echo "echo $I" >>program
done
chmod +x program
```
这段程序每执行一次能帮我们生成一个名为`program`的文件，文件内容为1024行`echo`，如果我们手动来写1024行代码，效率显然低效

- 元编程优点：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译

`Proxy` 亦是如此，用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）

## 二、用法

`Proxy`为 构造函数，用来生成 `Proxy `实例

```javascript
var proxy = new Proxy(target, handler)
```

### 参数

`target`表示所要拦截的目标对象（任何类型的对象，包括原生数组，函数，甚至另一个代理））

`handler`通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为

### handler解析

关于`handler`拦截属性，有如下：

- get(target,propKey,receiver)：拦截对象属性的读取
- set(target,propKey,value,receiver)：拦截对象属性的设置
- has(target,propKey)：拦截`propKey in proxy`的操作，返回一个布尔值
- deleteProperty(target,propKey)：拦截`delete proxy[propKey]`的操作，返回一个布尔值
- ownKeys(target)：拦截`Object.keys(proxy)`、`for...in`等循环，返回一个数组
- getOwnPropertyDescriptor(target, propKey)：拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象
- defineProperty(target, propKey, propDesc)：拦截`Object.defineProperty(proxy, propKey, propDesc）`，返回一个布尔值
- preventExtensions(target)：拦截`Object.preventExtensions(proxy)`，返回一个布尔值
- getPrototypeOf(target)：拦截`Object.getPrototypeOf(proxy)`，返回一个对象
- isExtensible(target)：拦截`Object.isExtensible(proxy)`，返回一个布尔值
- setPrototypeOf(target, proto)：拦截`Object.setPrototypeOf(proxy, proto)`，返回一个布尔值
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作

### Reflect

若需要在`Proxy`内部调用对象的默认行为，建议使用`Reflect`，其是`ES6`中操作对象而提供的新 `API`

基本特点：

- 只要`Proxy`对象具有的代理方法，`Reflect`对象全部具有，以静态方法的形式存在
- 修改某些`Object`方法的返回结果，让其变得更合理（定义不存在属性行为的时候不报错而是返回`false`）
- 让`Object`操作都变成函数行为<br>

下面我们介绍`proxy`几种用法：

### get()

`get`接受三个参数，依次为目标对象、属性名和 `proxy` 实例本身，最后一个参数可选

```javascript
var person = {
  name: "张三"
};

var proxy = new Proxy(person, {
  get: function(target, propKey) {
    return Reflect.get(target,propKey)
  }
});

proxy.name // "张三"
```

`get`能够对数组增删改查进行拦截，下面是试下你数组读取负数的索引

```js
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  };

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
arr[-1] // c
```

注意：如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则会报错

```js
const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed
```

### set()

`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 `Proxy` 实例本身

假定`Person`对象有一个`age`属性，该属性应该是一个不大于 200 的整数，那么可以使用`Proxy`保证`age`的属性值符合要求

```js
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // 对于满足条件的 age 属性以及其他属性，直接保存
    obj[prop] = value;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // 报错
person.age = 300 // 报错
```

如果目标对象自身的某个属性，不可写且不可配置，那么`set`方法将不起作用

```javascript
const obj = {};
Object.defineProperty(obj, 'foo', {
  value: 'bar',
  writable: false,
});

const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = 'baz';
  }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';
proxy.foo // "bar"
```

注意，严格模式下，`set`代理如果没有返回`true`，就会报错

```javascript
'use strict';
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    // 无论有没有下面这一行，都会报错
    return false;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
// TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

### deleteProperty()

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除

```javascript
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    Reflect.deleteProperty(target,key)
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`无法删除私有属性`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: 无法删除私有属性
```

注意，目标对象自身的不可配置（configurable）的属性，不能被`deleteProperty`方法删除，否则报错

### 取消代理

```
Proxy.revocable(target, handler);
```

## 三、使用场景

`Proxy`其功能非常类似于设计模式中的代理模式，常用功能如下：

- 拦截和监视外部对对象的访问
- 降低函数或类的复杂度
- 在复杂操作前对操作进行校验或对所需资源进行管理

使用 `Proxy` 保障数据类型的准确性

```js
let numericDataStore = { count: 0, amount: 1234, total: 14 };
numericDataStore = new Proxy(numericDataStore, {
    set(target, key, value, proxy) {
        if (typeof value !== 'number') {
            throw Error("属性只能是number类型");
        }
        return Reflect.set(target, key, value, proxy);
    }
});

numericDataStore.count = "foo"
// Error: 属性只能是number类型

numericDataStore.count = 333
// 赋值成功
```

声明了一个私有的 `apiKey`，便于 `api` 这个对象内部的方法调用，但不希望从外部也能够访问 `api._apiKey`

```js
let api = {
    _apiKey: '123abc456def',
    getUsers: function(){ },
    getUser: function(userId){ },
    setUser: function(userId, config){ }
};
const RESTRICTED = ['_apiKey'];
api = new Proxy(api, {
    get(target, key, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可访问.`);
        } return Reflect.get(target, key, proxy);
    },
    set(target, key, value, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可修改`);
        } return Reflect.get(target, key, value, proxy);
    }
});

console.log(api._apiKey)
api._apiKey = '987654321'
// 上述都抛出错误
```

还能通过使用`Proxy`实现观察者模式

观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行

`observable`函数返回一个原始对象的 `Proxy` 代理，拦截赋值操作，触发充当观察者的各个函数

```javascript
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}
```

观察者函数都放进`Set`集合，当修改`obj`的值，在会`set`函数中拦截，自动执行`Set`所有的观察者

</details>

## 402. 怎么理解ES6中 Generator的？使用场景有哪些？ {#question-6b4f3ad8-5cd8-49f3-941c-c916615546d0}

> 难度：3.5 · 类型：QA

### 题目要点

- **Generator 函数** 允许函数暂停和恢复执行，提供了强大的异步编程能力。
- **`yield`** 用于暂停函数并返回值，**`yield*`** 用于委托其他可迭代对象。
- 可以与 **`Promise`** 配合使用简化异步代码，处理异步操作和错误。

`Generator` 是 ES6 中的一个重要特性，虽然它在现代开发中不如 `async/await` 常用，但它在处理复杂的迭代和异步流程时仍然非常有用。

<details>
<summary>参考答案</summary>

## 一、介绍

Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同

回顾下上文提到的解决异步的手段：

- 回调函数
- promise

那么，上文我们提到`promsie`已经是一种比较流行的解决异步方案，那么为什么还出现`Generator`？甚至`async/await`呢？

该问题我们留在后面再进行分析，下面先认识下`Generator`

### Generator函数

执行 `Generator` 函数会返回一个遍历器对象，可以依次遍历 `Generator` 函数内部的每一个状态

形式上，`Generator `函数是一个普通函数，但是有两个特征：

- `function`关键字与函数名之间有一个星号
- 函数体内部使用`yield`表达式，定义不同的内部状态

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
```

## 二、使用

`Generator` 函数会返回一个遍历器对象，即具有`Symbol.iterator`属性，并且返回给自己

```javascript
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

通过`yield`关键字可以暂停`generator`函数返回的遍历器对象的状态

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
var hw = helloWorldGenerator();
```

上述存在三个状态：`hello`、`world`、`return`

通过`next`方法才会遍历到下一个内部状态，其运行逻辑如下：

- 遇到`yield`表达式，就暂停执行后面的操作，并将紧跟在`yield`后面的那个表达式的值，作为返回的对象的`value`属性值。
- 下一次调用`next`方法时，再继续往下执行，直到遇到下一个`yield`表达式
- 如果没有再遇到新的`yield`表达式，就一直运行到函数结束，直到`return`语句为止，并将`return`语句后面的表达式的值，作为返回的对象的`value`属性值。
- 如果该函数没有`return`语句，则返回的对象的`value`属性值为`undefined`

```javascript
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

`done`用来判断是否存在下个状态，`value`对应状态值

`yield`表达式本身没有返回值，或者说总是返回`undefined`

通过调用`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

正因为`Generator `函数返回`Iterator`对象，因此我们还可以通过`for...of`进行遍历
```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

原生对象没有遍历接口，通过`Generator `函数为它加上这个接口，就能使用`for...of`进行遍历了

```javascript
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

## 三、异步解决方案

回顾之前展开异步解决的方案：

- 回调函数
- Promise 对象
- generator 函数
- async/await

这里通过文件读取案例，将几种解决异步的方案进行一个比较：

### 回调函数

所谓回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，再调用这个函数

```javascript
fs.readFile('/etc/fstab', function (err, data) {
  if (err) throw err;
  console.log(data);
  fs.readFile('/etc/shells', function (err, data) {
    if (err) throw err;
    console.log(data);
  });
});
```

`readFile`函数的第三个参数，就是回调函数，等到操作系统返回了`/etc/passwd`这个文件以后，回调函数才会执行

### Promise

`Promise`就是为了解决回调地狱而产生的，将回调函数的嵌套，改成链式调用

```js
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};


readFile('/etc/fstab').then(data =>{
    console.log(data)
    return readFile('/etc/shells')
}).then(data => {
    console.log(data)
})
```

这种链式操作形式，使异步任务的两段执行更清楚了，但是也存在了很明显的问题，代码变得冗杂了，语义化并不强

### generator

`yield`表达式可以暂停函数执行，`next`方法用于恢复函数执行，这使得`Generator`函数非常适合将异步任务同步化

```javascript
const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

### async/await

将上面`Generator`函数改成`async/await`形式，更为简洁，语义化更强了

```js
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

### 区别：

通过上述代码进行分析，将`promise`、`Generator`、`async/await`进行比较：

- `promise`和`async/await`是专门用于处理异步操作的
- `Generator`并不是为异步而设计出来的，它还有其他功能（对象迭代、控制输出、部署`Interator`接口...）
- `promise`编写代码相比`Generator`、`async`更为复杂化，且可读性也稍差

- `Generator`、`async`需要与`promise`对象搭配处理异步情况
- `async`实质是`Generator`的语法糖，相当于会自动执行`Generator`函数
- `async`使用上更为简洁，将异步代码以同步的形式进行编写，是处理异步编程的最终方案

## 四、使用场景

`Generator`是异步解决的一种方案，最大特点则是将异步操作同步化表达出来

```js
function* loadUI() {
  showLoadingScreen();
  yield loadUIDataAsynchronously();
  hideLoadingScreen();
}
var loader = loadUI();
// 加载UI
loader.next()

// 卸载UI
loader.next()
```

包括`redux-saga `中间件也充分利用了`Generator`特性

```js
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import Api from '...'

function* fetchUser(action) {
   try {
      const user = yield call(Api.fetchUser, action.payload.userId);
      yield put({type: "USER_FETCH_SUCCEEDED", user: user});
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

function* mySaga() {
  yield takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

function* mySaga() {
  yield takeLatest("USER_FETCH_REQUESTED", fetchUser);
}

export default mySaga;
```

还能利用`Generator`函数，在对象上实现`Iterator`接口

```js
function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
  console.log(key, value);
}

// foo 3
// bar 7
```

</details>

## 403. 你是怎么理解ES6中 Promise的？使用场景有哪些？ {#question-34d5eef9-20cb-4aac-b34b-87ab513456a7}

> 难度：3 · 类型：QA

### 题目要点

## Promise是什么？

Promise是一个代表异步操作最终完成或失败的对象。它有三种状态：

- **Pending（进行中）**：初始状态，既未完成也未失败。
- **Fulfilled（已成功）**：操作成功完成。
- **Rejected（已失败）**：操作失败。

## 特点

- **单次使用**：一旦Promise的状态改变，它就变得不可逆。
- **链式调用**：可以链接多个`.then()`和`.catch()`方法。
- **错误冒泡**：错误可以从链中的一个Promise传递到下一个。

## 使用场景

1. **异步操作**：处理需要时间的异步操作，如网络请求、文件读写等。
2. **并发控制**：使用`Promise.all()`来并行处理多个异步操作，并等待它们全部完成。
3. **错误处理**：集中处理异步操作中的错误。
4. **串行任务**：按顺序执行一系列依赖前一个结果的异步操作。
5. **定时器**：使用`setTimeout()`或`setInterval()`与Promise结合，实现定时执行。

## 注意事项

- Promise是单次使用的，一旦状态改变，无法再次改变。
- 使用`.catch()`或`.finally()`来处理Promise链中的错误和清理资源。
- 避免在Promise链中混用`return`和`await`，这可能导致意外的行为。
- 理解Promise的状态和执行顺序对于编写高效的异步代码至关重要。

<details>
<summary>参考答案</summary>

## 一、介绍

`Promise `，译为承诺，是异步编程的一种解决方案，比传统的解决方案（回调函数）更加合理和更加强大

在以往我们如果处理多层异步操作，我们往往会像下面那样编写我们的代码

```js
doSomething(function(result) {
  doSomethingElse(result, function(newResult) {
    doThirdThing(newResult, function(finalResult) {
      console.log('得到最终结果: ' + finalResult);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```

阅读上面代码，是不是很难受，上述形成了经典的回调地狱

现在通过`Promise`的改写上面的代码

```js
doSomething().then(function(result) {
  return doSomethingElse(result);
})
.then(function(newResult) {
  return doThirdThing(newResult);
})
.then(function(finalResult) {
  console.log('得到最终结果: ' + finalResult);
})
.catch(failureCallback);
```

瞬间感受到`promise`解决异步操作的优点：

- 链式操作减低了编码难度
- 代码可读性明显增强

下面我们正式来认识`promise`：

### 状态

`promise`对象仅有三种状态

- `pending`（进行中）
- `fulfilled`（已成功）
- `rejected`（已失败）

### 特点

- 对象的状态不受外界影响，只有异步操作的结果，可以决定当前是哪一种状态
- 一旦状态改变（从`pending`变为`fulfilled`和从`pending`变为`rejected`），就不会再变，任何时候都可以得到这个结果

### 流程

认真阅读下图，我们能够轻松了解`promise`整个流程

 ![](https://static.ecool.fun//article/f4d1e317-abd6-499d-8ea4-8680ef2901ba.png)

## 二、用法

`Promise`对象是一个构造函数，用来生成`Promise`实例

```javascript
const promise = new Promise(function(resolve, reject) {});
```

`Promise`构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`

- `resolve`函数的作用是，将`Promise`对象的状态从“未完成”变为“成功”
- `reject`函数的作用是，将`Promise`对象的状态从“未完成”变为“失败”

### 实例方法

`Promise`构建出来的实例存在以下方法：

- then()
- then()
- catch()
- finally()

#### then()

`then`是实例状态发生改变时的回调函数，第一个参数是`resolved`状态的回调函数，第二个参数是`rejected`状态的回调函数

`then`方法返回的是一个新的`Promise`实例，也就是`promise`能链式书写的原因

```javascript
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

#### catch

`catch()`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数

```javascript
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

`Promise `对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止

```javascript
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});
```

一般来说，使用`catch`方法代替`then()`第二个参数

`Promise `对象抛出的错误不会传递到外层代码，即不会有任何反应

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};
```

浏览器运行到这一行，会打印出错误提示`ReferenceError: x is not defined`，但是不会退出进程

`catch()`方法之中，还能再抛出错误，通过后面`catch`方法捕获到

#### finally()

`finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作

```javascript
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

### 构造函数方法

`Promise`构造函数存在以下方法：

- all()
- race()
- allSettled()
- resolve()
- reject()
- try()

### all()

`Promise.all()`方法用于将多个 `Promise `实例，包装成一个新的 `Promise `实例

```javascript
const p = Promise.all([p1, p2, p3]);
```

接受一个数组（迭代对象）作为参数，数组成员都应为`Promise`实例

实例`p`的状态由`p1`、`p2`、`p3`决定，分为两种：

- 只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数
- 只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数

注意，如果作为参数的 `Promise` 实例，自己定义了`catch`方法，那么它一旦被`rejected`，并不会触发`Promise.all()`的`catch`方法

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```

如果`p2`没有自己的`catch`方法，就会调用`Promise.all()`的`catch`方法

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// Error: 报错了
```

### race()

`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例

```javascript
const p = Promise.race([p1, p2, p3]);
```

只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变

率先改变的 Promise 实例的返回值则传递给`p`的回调函数

```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

### allSettled()

`Promise.allSettled()`方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例

只有等到所有这些参数实例都返回结果，不管是`fulfilled`还是`rejected`，包装实例才会结束

```javascript
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```

#### resolve()

将现有对象转为 `Promise `对象

```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

参数可以分成四种情况，分别如下：

- 参数是一个 Promise 实例，`promise.resolve`将不做任何修改、原封不动地返回这个实例
- 参数是一个`thenable`对象，`promise.resolve`会将这个对象转为 `Promise `对象，然后就立即执行`thenable`对象的`then()`方法
- 参数不是具有`then()`方法的对象，或根本就不是对象，`Promise.resolve()`会返回一个新的 Promise 对象，状态为`resolved`
- 没有参数时，直接返回一个`resolved`状态的 Promise 对象

#### reject()

`Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected`

```javascript
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function (s) {
  console.log(s)
});
// 出错了
```

`Promise.reject()`方法的参数，会原封不动地变成后续方法的参数

```javascript
Promise.reject('出错了')
.catch(e => {
  console.log(e === '出错了')
})
// true
```

## 三、使用场景

将图片的加载写成一个`Promise`，一旦加载完成，`Promise`的状态就发生变化

```javascript
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};
```

通过链式操作，将多个渲染数据分别给个`then`，让其各司其职。或当下个异步请求依赖上个请求结果的时候，我们也能够通过链式操作友好解决问题

```js
// 各司其职
getInfo().then(res=>{
    let { bannerList } = res
    //渲染轮播图
    console.log(bannerList)
    return res
}).then(res=>{

    let { storeList } = res
    //渲染店铺列表
    console.log(storeList)
    return res
}).then(res=>{
    let { categoryList } = res
    console.log(categoryList)
    //渲染分类列表
    return res
})
```

通过`all()`实现多个请求合并在一起，汇总所有请求结果，只需设置一个`loading`即可

```js
function initLoad(){
    // loading.show() //加载loading
    Promise.all([getBannerList(),getStoreList(),getCategoryList()]).then(res=>{
        console.log(res)
        loading.hide() //关闭loading
    }).catch(err=>{
        console.log(err)
        loading.hide()//关闭loading
    })
}
//数据初始化
initLoad()
```

通过`race`可以设置图片请求超时

```js
//请求某个图片资源
function requestImg(){
    var p = new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
           resolve(img);
        }
        //img.src = "https://b-gold-cdn.xitu.io/v3/static/img/logo.a7995ad.svg"; 正确的
        img.src = "https://b-gold-cdn.xitu.io/v3/static/img/logo.a7995ad.svg1";
    });
    return p;
}

//延时函数，用于给请求计时
function timeout(){
    var p = new Promise(function(resolve, reject){
        setTimeout(function(){
            reject('图片请求超时');
        }, 5000);
    });
    return p;
}

Promise
.race([requestImg(), timeout()])
.then(function(results){
    console.log(results);
})
.catch(function(reason){
    console.log(reason);
});
```

</details>

## 404. ES6中新增的Set、Map两种数据结构怎么理解? {#question-4232c372-316f-4a53-99b9-6d9299b7e91f}

> 难度：2 · 类型：QA

### 题目要点

如果要用一句来描述，我们可以说

<details>
<summary>参考答案</summary>

如果要用一句来描述，我们可以说

`Set`是一种叫做集合的数据结构，`Map`是一种叫做字典的数据结构

什么是集合？什么又是字典？

- 集合<br>
是由一堆无序的、相关联的，且不重复的内存结构【数学中称为元素】组成的组合

- 字典<br>
是一些元素的集合。每个元素有一个称作key 的域，不同元素的key 各不相同

区别？

- 共同点：集合、字典都可以存储不重复的值
- 不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

## 一、Set

` Set`是`es6`新增的数据结构，类似于数组，但是成员的值都是唯一的，没有重复的值，我们一般称为集合

`Set`本身是一个构造函数，用来生成 Set 数据结构

```js
const s = new Set();
```

### 增删改查

`Set`的实例关于增删改查的方法：

- add()
- delete()

- has()
- clear()

### add()

添加某个值，返回 `Set` 结构本身

当添加实例中已经存在的元素，`set`不会进行处理添加

```js
s.add(1).add(2).add(2); // 2只被添加了一次
```

### delete()

删除某个值，返回一个布尔值，表示删除是否成功

```js
s.delete(1)
```

### has()

返回一个布尔值，判断该值是否为`Set`的成员

```js
s.has(2)
```

### clear()

清除所有成员，没有返回值

```js
s.clear()
```

### 遍历

`Set`实例遍历的方法有如下：

关于遍历的方法，有如下：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回键值对的遍历器
- forEach()：使用回调函数遍历每个成员

`Set`的遍历顺序就是插入顺序

`keys`方法、`values`方法、`entries`方法返回的都是遍历器对象

```javascript
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```

`forEach()`用于对每个成员执行某种操作，没有返回值，键值、键名都相等，同样的`forEach`方法有第二个参数，用于绑定处理函数的`this`

```javascript
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```

扩展运算符和` Set` 结构相结合实现数组或字符串去重

```javascript
// 数组
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)]; // [3, 5, 2]

// 字符串
let str = "352255";
let unique = [...new Set(str)].join(""); // "352"
```

实现并集、交集、和差集

```javascript
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// （a 相对于 b 的）差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

## 二、Map

`Map`类型是键值对的有序列表，而键和值都可以是任意类型

`Map`本身是一个构造函数，用来生成 `Map` 数据结构

```js
const m = new Map()
```

### 增删改查

`Map` 结构的实例针对增删改查有以下属性和操作方法：

- size 属性
- set()
- get()
- has()
- delete()
- clear()

### size

`size`属性返回 Map 结构的成员总数。

```javascript
const map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
```

### set()

设置键名`key`对应的键值为`value`，然后返回整个 Map 结构

如果`key`已经有值，则键值会被更新，否则就新生成该键

同时返回的是当前`Map`对象，可采用链式写法

```javascript
const m = new Map();

m.set('edition', 6)        // 键是字符串
m.set(262, 'standard')     // 键是数值
m.set(undefined, 'nah')    // 键是 undefined
m.set(1, 'a').set(2, 'b').set(3, 'c') // 链式操作
```

### get()

`get`方法读取`key`对应的键值，如果找不到`key`，返回`undefined`

```javascript
const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // 键是函数

m.get(hello)  // Hello ES6!
```

### has()

`has`方法返回一个布尔值，表示某个键是否在当前 Map 对象之中

```javascript
const m = new Map();

m.set('edition', 6);
m.set(262, 'standard');
m.set(undefined, 'nah');

m.has('edition')     // true
m.has('years')       // false
m.has(262)           // true
m.has(undefined)     // true
```

### delete()

`delete`方法删除某个键，返回`true`。如果删除失败，返回`false`

```javascript
const m = new Map();
m.set(undefined, 'nah');
m.has(undefined)     // true

m.delete(undefined)
m.has(undefined)       // false
```

### clear()

`clear`方法清除所有成员，没有返回值

```javascript
let map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
map.clear()
map.size // 0
```

### 遍历

`Map `结构原生提供三个遍历器生成函数和一个遍历方法：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回所有成员的遍历器
- forEach()：遍历 Map 的所有成员

遍历顺序就是插入顺序

```javascript
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

map.forEach(function(value, key, map) {
  console.log("Key: %s, Value: %s", key, value);
});
```

## 三、WeakSet 和 WeakMap

### WeakSet

创建`WeakSet`实例

```js
const ws = new WeakSet();
```

`WeakSet `可以接受一个具有 `Iterable `接口的对象作为参数

```js
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

在`API`中`WeakSet`与`Set`有两个区别：

- 没有遍历操作的`API`
- 没有`size`属性

`WeakSet`只能成员只能是引用类型，而不能是其他类型的值

```js
let ws=new WeakSet();

// 成员不是引用类型
let weakSet=new WeakSet([2,3]);
console.log(weakSet) // 报错

// 成员为引用类型
let obj1={name:1}
let obj2={name:1}
let ws=new WeakSet([obj1,obj2]);
console.log(ws) //WeakSet {{…}, {…}}
```

`WeakSet `里面的引用只要在外部消失，它在 `WeakSet `里面的引用就会自动消失

### WeakMap

`WeakMap`结构与`Map`结构类似，也是用于生成键值对的集合

在`API`中`WeakMap`与`Map`有两个区别：

- 没有遍历操作的`API`
- 没有`clear`清空方法

```javascript
// WeakMap 可以使用 set 方法添加成员
const wm1 = new WeakMap();
const key = {foo: 1};
wm1.set(key, 2);
wm1.get(key) // 2

// WeakMap 也可以接受一个数组，
// 作为构造函数的参数
const k1 = [1, 2, 3];
const k2 = [4, 5, 6];
const wm2 = new WeakMap([[k1, 'foo'], [k2, 'bar']]);
wm2.get(k2) // "bar"
```

`WeakMap`只接受对象作为键名（`null`除外），不接受其他类型的值作为键名

```javascript
const map = new WeakMap();
map.set(1, 2)
// TypeError: 1 is not an object!
map.set(Symbol(), 2)
// TypeError: Invalid value used as weak map key
map.set(null, 2)
// TypeError: Invalid value used as weak map key
```

`WeakMap`的键名所指向的对象，一旦不再需要，里面的键名对象和所对应的键值对会自动消失，不用手动删除引用

举个场景例子：

在网页的 DOM 元素上添加数据，就可以使用`WeakMap`结构，当该 DOM 元素被清除，其所对应的`WeakMap`记录就会自动被移除

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

注意：`WeakMap` 弱引用的只是键名，而不是键值。键值依然是正常引用

下面代码中，键值`obj`会在`WeakMap`产生新的引用，当你修改`obj`不会影响到内部

```js
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```

</details>

## 405. ES6中函数新增了哪些扩展? {#question-9cf9cb30-8864-4823-bf2d-d30b5f079f45}

> 难度：1.5 · 类型：QA

### 题目要点

`ES6`允许为函数的参数设置默认值

<details>
<summary>参考答案</summary>

## 一、参数

`ES6`允许为函数的参数设置默认值

```js
function log(x, y = 'World') {
  console.log(x, y);
}

console.log('Hello') // Hello World
console.log('Hello', 'China') // Hello China
console.log('Hello', '') // Hello
```

函数的形参是默认声明的，不能使用`let`或`const`再次声明

```js
function foo(x = 5) {
    let x = 1; // error
    const x = 2; // error
}
```

参数默认值可以与解构赋值的默认值结合起来使用

```js
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

上面的`foo`函数，当参数为对象的时候才能进行解构，如果没有提供参数的时候，变量`x`和`y`就不会生成，从而报错，这里设置默认值避免

```js
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

参数默认值应该是函数的尾参数，如果不是非尾部的参数设置默认值，实际上这个参数是没发省略的

```javascript
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined]
f(, 1) // 报错
f(undefined, 1) // [1, 1]
```

## 二、属性

### 函数的length属性

`length`将返回没有指定默认值的参数个数

```js
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

`rest` 参数也不会计入`length`属性

```js
(function(...args) {}).length // 0
```

如果设置了默认值的参数不是尾参数，那么`length`属性也不再计入后面的参数了

```js
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

### name属性

返回该函数的函数名

```js
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

如果将一个具名函数赋值给一个变量，则 `name`属性都返回这个具名函数原本的名字

```js
const bar = function baz() {};
bar.name // "baz"
```

`Function`构造函数返回的函数实例，`name`属性的值为`anonymous`

```javascript
(new Function).name // "anonymous"
```

`bind`返回的函数，`name`属性值会加上`bound`前缀

```javascript
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

## 三、作用域

一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域

等到初始化结束，这个作用域就会消失。这种语法行为，在不设置参数默认值时，是不会出现的

下面例子中，`y=x`会形成一个单独作用域，`x`没有被定义，所以指向全局变量`x`

```js
let x = 1;

function f(y = x) {
  // 等同于 let y = x
  let x = 2;
  console.log(y);
}

f() // 1
```

## 四、严格模式

只要函数参数使用了默认值、解构赋值、或者扩展运算符，那么函数内部就不能显式设定为严格模式，否则会报错

```js
// 报错
function doSomething(a, b = a) {
  'use strict';
  // code
}

// 报错
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// 报错
const doSomething = (...a) => {
  'use strict';
  // code
};

const obj = {
  // 报错
  doSomething({a, b}) {
    'use strict';
    // code
  }
};
```

## 五、箭头函数

使用“箭头”（`=>`）定义函数

```js
var f = v => v;

// 等同于
var f = function (v) {
  return v;
};
```

如果箭头函数不需要参数或需要多个参数，就使用一个圆括号代表参数部分

```js
var f = () => 5;
// 等同于
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// 等同于
var sum = function(num1, num2) {
  return num1 + num2;
};
```

如果箭头函数的代码块部分多于一条语句，就要使用大括号将它们括起来，并且使用`return`语句返回

```js
var sum = (num1, num2) => { return num1 + num2; }
```

如果返回对象，需要加括号将对象包裹

```js
let getTempItem = id => ({ id: id, name: "Temp" });
```

注意点：

- 函数体内的`this`对象，就是定义时所在的对象，而不是使用时所在的对象
- 不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误
- 不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用 `rest` 参数代替
- 不可以使用`yield`命令，因此箭头函数不能用作 Generator 函数

</details>

## 406. ES6中对象新增了哪些扩展? {#question-593b09fd-094f-44b7-a375-6ddc393113a5}

> 难度：1.5 · 类型：QA

### 题目要点

ES6中，当对象键名与对应值名相等的时候，可以进行简写

<details>
<summary>参考答案</summary>

## 一、属性的简写

ES6中，当对象键名与对应值名相等的时候，可以进行简写

```js
const baz = {foo:foo}

// 等同于
const baz = {foo}
```

方法也能够进行简写

```js
const o = {
  method() {
    return "Hello!";
  }
};

// 等同于

const o = {
  method: function() {
    return "Hello!";
  }
}
```

在函数内作为返回值，也会变得方便很多

```js
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

注意：简写的对象方法不能用作构造函数，否则会报错

```js
const obj = {
  f() {
    this.foo = 'bar';
  }
};

new obj.f() // 报错
```

## 二、属性名表达式

ES6 允许字面量定义对象时，将表达式放在括号内

```js
let lastWord = 'last word';

const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};

a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

表达式还可以用于定义方法名

```js
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

注意，属性名表达式与简洁表示法，不能同时使用，会报错

```js
// 报错
const foo = 'bar';
const bar = 'abc';
const baz = { [foo] };

// 正确
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

注意，属性名表达式如果是一个对象，默认情况下会自动将对象转为字符串`[object Object]`

```js
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

## 三、super关键字

`this`关键字总是指向函数所在的当前对象，ES6 又新增了另一个类似的关键字`super`，指向当前对象的原型对象

```javascript
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto); // 为obj设置原型对象
obj.find() // "hello"
```

## 四、扩展运算符的应用

在解构赋值中，未被读取的可遍历的属性，分配到指定的对象上面

```js
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

注意：解构赋值必须是最后一个参数，否则会报错

解构赋值是浅拷贝

```js
let obj = { a: { b: 1 } };
let { ...x } = obj;
obj.a.b = 2; // 修改obj里面a属性中键值
x.a.b // 2，影响到了结构出来x的值
```

对象的扩展运算符等同于使用`Object.assign()`方法

## 五、属性的遍历

ES6 一共有 5 种方法可以遍历对象的属性。

- for...in：循环遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）

- Object.keys(obj)：返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名

- Object.getOwnPropertyNames(obj)：回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名

- Object.getOwnPropertySymbols(obj)：返回一个数组，包含对象自身的所有 Symbol 属性的键名

- Reflect.ownKeys(obj)：返回一个数组，包含对象自身的（不含继承的）所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举

上述遍历，都遵守同样的属性遍历的次序规则：

- 首先遍历所有数值键，按照数值升序排列
- 其次遍历所有字符串键，按照加入时间升序排列
- 最后遍历所有 Symbol 键，按照加入时间升序排

```js
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

## 六、对象新增的方法

关于对象新增的方法，分别有以下：

- Object.is()
- Object.assign()
- Object.getOwnPropertyDescriptors()
- Object.setPrototypeOf()，Object.getPrototypeOf()
- Object.keys()，Object.values()，Object.entries()
- Object.fromEntries()

### Object.is()

严格判断两个值是否相等，与严格比较运算符（===）的行为基本一致，不同之处只有两个：一是`+0`不等于`-0`，二是`NaN`等于自身

```js
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

### Object.assign()

`Object.assign()`方法用于对象的合并，将源对象`source`的所有可枚举属性，复制到目标对象`target`

`Object.assign()`方法的第一个参数是目标对象，后面的参数都是源对象

```javascript
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

注意：`Object.assign()`方法是浅拷贝，遇到同名属性会进行替换

### Object.getOwnPropertyDescriptors()

返回指定对象所有自身属性（非继承属性）的描述对象

```js
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
```

### Object.setPrototypeOf()

`Object.setPrototypeOf`方法用来设置一个对象的原型对象

```js
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null);
```

### Object.getPrototypeOf()

用于读取一个对象的原型对象

```js
Object.getPrototypeOf(obj);
```

### Object.keys()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键名的数组

```js
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

### Object.values()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键对应值的数组

```js
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

### Object.entries()

返回一个对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对的数组

```js
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

### Object.fromEntries()

用于将一个键值对数组转为对象

```js
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

</details>

## 407. var、let、const之间有什么区别？ {#question-c843a307-4934-4fa2-9c16-9f06484b0021}

> 难度：1.5 · 类型：QA

### 题目要点

可以从以下要点来阐述：

### 1. **声明提升（Hoisting）**

- **`var`**：变量声明会被提升到作用域的顶部，但赋值不会。即在变量声明之前可以访问到变量，但值为 `undefined`。
- **`let` 和 `const`**：声明不会被提升。变量在声明之前不可访问（会导致“暂时性死区”，Temporal Dead Zone）。

### 2. **作用域（Scope）**

- **`var`**：具有函数作用域（function scope），即仅在函数内有效，或者在全局作用域中。
- **`let` 和 `const`**：具有块级作用域（block scope），即在 `{}` 代码块内有效。

### 3. **变量重声明（Re-declaration）**

- **`var`**：可以在相同作用域内多次声明同名变量，不会报错。
- **`let` 和 `const`**：在相同作用域内不能重复声明同名变量，会报错。

### 4. **变量赋值（Re-assignment）**

- **`var`** 和 **`let`**：允许重新赋值，即可以改变变量的值。
- **`const`**：声明的变量不能被重新赋值，但需要注意，`const` 对象的内容（如数组或对象的属性）是可以修改的。

### 5. **初始化**

- **`var`**：可以在声明时不初始化，默认为 `undefined`。
- **`let` 和 `const`**：必须在声明时初始化，`const` 不能不初始化。

### 6. **全局对象属性（Global Object Property）**

- **`var`**：在全局作用域中声明的变量会成为全局对象的属性（在浏览器中是 `window` 对象）。
- **`let` 和 `const`**：在全局作用域中声明的变量不会成为全局对象的属性。

<details>
<summary>参考答案</summary>

## 一、var

在ES5中，顶层对象的属性和全局变量是等价的，用`var`声明的变量既是全局变量，也是顶层变量

注意：顶层对象，在浏览器环境指的是`window`对象，在 `Node` 指的是`global`对象

```js
var a = 10;
console.log(window.a) // 10
```

使用`var`声明的变量存在变量提升的情况

```js
console.log(a) // undefined
var a = 20
```

在编译阶段，编译器会将其变成以下执行

```js
var a
console.log(a)
a = 20
```

使用`var`，我们能够对一个变量进行多次声明，后面声明的变量会覆盖前面的变量声明

```js
var a = 20
var a = 30
console.log(a) // 30
```

在函数中使用使用`var`声明变量时候，该变量是局部的

```js
var a = 20
function change(){
    var a = 30
}
change()
console.log(a) // 20
```

而如果在函数内不使用`var`，该变量是全局的

```js
var a = 20
function change(){
   a = 30
}
change()
console.log(a) // 30
```

## 二、let

`let`是`ES6`新增的命令，用来声明变量

用法类似于`var`，但是所声明的变量，只在`let`命令所在的代码块内有效

```js
{
    let a = 20
}
console.log(a) // ReferenceError: a is not defined.
```

不存在变量提升

```js
console.log(a) // 报错ReferenceError
let a = 2
```

这表示在声明它之前，变量`a`是不存在的，这时如果用到它，就会抛出一个错误

只要块级作用域内存在`let`命令，这个区域就不再受外部影响

```js
var a = 123
if (true) {
    a = 'abc' // ReferenceError
    let a;
}
```

使用`let`声明变量前，该变量都不可用，也就是大家常说的“暂时性死区”

最后，`let`不允许在相同作用域中重复声明

```js
let a = 20
let a = 30
// Uncaught SyntaxError: Identifier 'a' has already been declared
```

注意的是相同作用域，下面这种情况是不会报错的

```js
let a = 20
{
    let a = 30
}
```

因此，我们不能在函数内部重新声明参数

```js
function func(arg) {
  let arg;
}
func()
// Uncaught SyntaxError: Identifier 'arg' has already been declared
```

## 三、const

`const`声明一个只读的常量，一旦声明，常量的值就不能改变

```js
const a = 1
a = 3
// TypeError: Assignment to constant variable.
```

这意味着，`const`一旦声明变量，就必须立即初始化，不能留到以后赋值

```js
const a;
// SyntaxError: Missing initializer in const declaration
```

如果之前用`var`或`let`声明过变量，再用`const`声明同样会报错

```js
var a = 20
let b = 20
const a = 30
const b = 30
// 都会报错
```

`const`实际上保证的并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动

对于简单类型的数据，值就保存在变量指向的那个内存地址，因此等同于常量

对于复杂类型的数据，变量指向的内存地址，保存的只是一个指向实际数据的指针，`const`只能保证这个指针是固定的，并不能确保改变量的结构不变

```js
const foo = {};

// 为 foo 添加一个属性，可以成功
foo.prop = 123;
foo.prop // 123

// 将 foo 指向另一个对象，就会报错
foo = {}; // TypeError: "foo" is read-only
```

其它情况，`const`与`let`一致

## 四、区别

`var`、`let`、`const`三者区别可以围绕下面五点展开：

- 变量提升
- 暂时性死区
- 块级作用域
- 重复声明
- 修改声明的变量
- 使用

### 变量提升

`var `声明的变量存在变量提升，即变量可以在声明之前调用，值为`undefined`

// 2023.4.25 更新

~~`let`和`const`不存在变量提升，即它们所声明的变量一定要在声明后使用，否则报错~~

let / const 不存在变量提升是不完全正确的，只能说由于暂时性死区的存在使得我们无法直观感受到变量提升的效果。

let 和 const 定义的变量都会被提升，但是不会被初始化，不能被引用，不会像var定义的变量那样，初始值为undefined。

当进入let变量的作用域时，会立即给它创建存储空间，但是不会对它进行初始化。

变量的赋值可以分为三个阶段：

* 创建变量，在内存中开辟空间
* 初始化变量，将变量初始化为undefined
* 真正赋值

关于let、var和const：
* let 的「创建」过程被提升了，但是初始化没有提升。
* var 的「创建」和「初始化」都被提升了。
* const 的「创建」「初始化」和「赋值」都被提升了。

```js
// var
console.log(a)  // undefined
var a = 10

// let
console.log(b)  // Cannot access 'b' before initialization
let b = 10

// const
console.log(c)  // Cannot access 'c' before initialization
const c = 10
```

### 暂时性死区

`var`不存在暂时性死区

`let`和`const`存在暂时性死区，只有等到声明变量的那一行代码出现，才可以获取和使用该变量

```js
// var
console.log(a)  // undefined
var a = 10

// let
console.log(b)  // Cannot access 'b' before initialization
let b = 10

// const
console.log(c)  // Cannot access 'c' before initialization
const c = 10
```

### 块级作用域

`var`不存在块级作用域

`let`和`const`存在块级作用域

```js
// var
{
    var a = 20
}
console.log(a)  // 20

// let
{
    let b = 20
}
console.log(b)  // Uncaught ReferenceError: b is not defined

// const
{
    const c = 20
}
console.log(c)  // Uncaught ReferenceError: c is not defined
```

### 重复声明

`var`允许重复声明变量

`let`和`const`在同一作用域不允许重复声明变量

```js
// var
var a = 10
var a = 20 // 20

// let
let b = 10
let b = 20 // Identifier 'b' has already been declared

// const
const c = 10
const c = 20 // Identifier 'c' has already been declared
```

### 修改声明的变量

`var`和`let`可以

`const`声明一个只读的常量。一旦声明，常量的值就不能改变

```js
// var
var a = 10
a = 20
console.log(a)  // 20

//let
let b = 10
b = 20
console.log(b)  // 20

// const
const c = 10
c = 20
console.log(c) // Uncaught TypeError: Assignment to constant variable
```

### 使用
能用`const`的情况尽量使用`const`，其他情况下大多数使用`let`，避免使用`var`

</details>
