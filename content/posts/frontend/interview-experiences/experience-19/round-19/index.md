+++
title = "字节-本地生活-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/19"
experienceId = 19
roundId = 19
roundOrder = 1
company = "字节跳动"
date = "2025-06-24T14:45:10.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-19/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-19/round-20/index.md" >}}) →

**本轮要点：** 本轮面试侧重考察候选人前端基础知识的系统掌握程度，包括 CSS 盒模型、选择器机制、ES6 语法、异步任务队列、响应式原理与网络协议等，同时会通过算法题考查思维能力与编码规范。

重点关注以下几个方面：
1. CSS布局与样式：考察对盒模型、选择器的深入理解，以及实际应用中的最佳实践
2. JavaScript核心：重点关注ES6特性、闭包、异步编程等基础概念的掌握程度
3. 框架原理：主要考察Vue3响应式系统的实现原理与优化思路
4. 工程化思维：通过HTTP、缓存、性能优化等问题考察工程实践经验
5. 算法能力：通过字符串处理等典型题目考察基本编程功底

本轮共 17 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍 {#question-subjective-12b75c445924}

### 题目要点

这是一道主观性问题，没有标准答案。面试官主要考察：
- 表达能力：语言组织、逻辑清晰度
- 职业规划：技术深度、发展方向
- 项目经验：技术栈匹配度、解决问题能力
- 个人特质：学习能力、团队协作

<details>
<summary>参考答案</summary>

"您好，我是XXX，有5年前端开发经验。毕业于XXX大学计算机科学专业，目前在一家互联网公司担任高级前端工程师。

我擅长的技术栈是 Vue 和 React 生态，对前端工程化和性能优化有深入研究。最近两年主要负责公司的低代码平台建设，带领团队完成了从0到1的平台搭建。在这个项目中，我们解决了很多技术难题，比如大型JSON-Schema的渲染性能优化、自定义组件的实时预览等。通过这些优化，平台的页面渲染性能提升了60%，现在支持了超过100个业务团队的日常工作。

在技术深度上，我特别关注前端框架底层原理，写过几篇关于Vue3响应式系统的技术文章，并给社区贡献过几个PR。同时我也在公司内部主导了前端性能监控体系的建设，建立了从采集、分析到报警的完整链路。

选择字节跳动是因为被这里浓厚的技术氛围吸引，也认可公司在前端领域的技术实力。我希望能在更大的平台上，和优秀的团队一起解决更有挑战的问题。"

答题建议结构
1. **基本信息与技术栈**（15-20秒）
   - 教育背景
   - 工作年限
   - 技术栈概览

2. **核心项目经历**（30-40秒）
   - 1-2个最有代表性的项目
   - 突出个人贡献和技术难点

3. **技术深度展示**（20-30秒）
   - 专注的技术领域
   - 技术产出或开源贡献

4. **职业规划**（10-15秒）
   - 对岗位的理解
   - 个人发展诉求

答题要点提示
1. 时间控制在90秒左右
2. 按照时间重要性安排内容比重
3. 突出个人特色，避免平铺直述
4. 适度准备，保持自然流畅
5. 结合岗位特点，突出匹配度

</details>

## 2. 标准盒模型与IE盒模型的区别，如何通过CSS切换两种模型？ {#question-subjective-45ad807cb4c3}

### 题目要点

考察对CSS盒模型的深入理解，包括两种盒模型的区别、计算方式及其对布局的影响。同时也考察在工程实践中如何合理使用box-sizing，以及不同盒模型在响应式布局中的应用场景和性能影响。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
1. **两种盒模型的区别**：
   - **标准盒模型 (content-box)**：
     • `width/height` 仅包含内容区域
     • 实际占用空间 = width + padding + border + margin
     • 优点：精确控制内容区域大小
     • 缺点：需要额外计算实际占用空间

   - **IE 盒模型 (border-box)**：
     • `width/height` 包含内容区域 + padding + border
     • 实际占用空间 = width + margin
     • 优点：直观控制元素实际大小
     • 缺点：需要额外计算内容区域大小

2. **历史与标准化**：
   - CSS2.1 标准采用 content-box
   - IE5.5 引入替代盒模型
   - CSS3 通过 box-sizing 统一标准

##### 1.2 核心用法 + 示例代码
1. **全局配置最佳实践**：
```css
/* 方案1：全局 border-box */
html {
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}

/* 方案2：特定容器隔离 */
.container {
  box-sizing: content-box;
}
.container * {
  box-sizing: inherit;
}
```

2. **响应式布局示例**：
```css
/* 弹性布局中的应用 */
.flex-container {
  display: flex;
  gap: 20px;
}

.flex-item {
  box-sizing: border-box; /* 内边距不会撑大元素 */
  flex: 1;
  padding: 20px;
}

/* 栅格系统示例 */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

.col {
  box-sizing: border-box;
  padding: 15px;
  border: 1px solid #ddd;
}
```

3. **实际应用场景**：
```css
/* 1. 固定宽度布局 */
.sidebar {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 1px solid #eee;
}

/* 2. 表单控件处理 */
.form-control {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
}

/* 3. 弹窗居中定位 */
.modal {
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  padding: 20px;
}
```

##### 1.3 常见误区或面试陷阱
1. **概念误区**：
   - 误以为 `box-sizing: border-box` 会影响 `margin`
   - 认为切换 box-sizing 会影响元素的视觉表现
   - 混淆 `width: 100%` 在不同盒模型下的计算基准

2. **继承问题**：
   - 忽略伪元素的继承：`*` 选择器不包含伪元素
   - 第三方组件可能重置 box-sizing 值
   - iframe 内容不继承父页面的 box-sizing

3. **性能考量**：
   - 过度使用 box-sizing 切换导致重排
   - 未考虑浏览器对不同盒模型的渲染优化
   - 混用两种盒模型导致的计算开销

4. **兼容性陷阱**：
   - 低版本 IE 的怪异模式盒模型行为
   - flex/grid 布局中的盒模型特殊性
   - 某些 CSS 属性对盒模型的隐式影响

##### 1.4 实践建议
1. **选择依据**：
   - 新项目推荐默认使用 border-box
   - 组件库开发考虑提供盒模型重置选项
   - 特殊场景（如画布）可选用 content-box

2. **性能优化**：
   - 避免频繁切换盒模型
   - 利用 CSS 预处理器管理盒模型配置
   - 考虑使用 CSS Containment 优化渲染

3. **维护策略**：
   - 在样式重置文件中统一配置
   - 编写清晰的盒模型文档
   - 使用 CSS Modules 或 Scoped CSS 隔离样式

</details>

## 3. 计算 #nav .item:hover 与 div.item.active 的选择器权重。 {#question-subjective-58010415b775}

### 题目要点

考察对CSS选择器优先级计算规则的掌握程度，包括不同类型选择器的权重值和复合选择器的权重计算。同时关注在实际开发中如何通过合理的选择器设计来避免样式冲突，以及CSS模块化的实践经验。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
Specificity 由四元组 `(a,b,c,d)` 表示：
- `a` 行内样式 `style=""` → 1
- `b` ID 选择器 `#id` 个数
- `c` 类、伪类、属性选择器数量
- `d` 元素、伪元素数量
比较时自左向右逐位对比。

##### 1.2 核心用法 + 示例代码
- `#nav .item:hover` → `(0,1,1,1)`：1 个 ID，1 个类，1 个伪类，1 个元素。
- `div.item.active` → `(0,0,2,1)`：0 ID，2 类，1 元素。
因此前者权重更高，样式覆盖后者。

##### 1.3 常见误区或面试陷阱
- 误把伪类当作元素权重；伪类属于 `c`。
- 低估 `!important`：它会提升至最高但仍服从权重比较序列。
- 忽视层叠顺序：相同权重时后定义者生效。

</details>

## 4. 如何避免因选择器优先级过高导致的样式污染？ {#question-subjective-b5e5c6ad2816}

### 题目要点

- 样式组织策略（BEM、CSS Module、Scoped CSS）
- 选择器层次优化与命名规范
- 架构层面的样式隔离方案

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
选择器优先级高会导致组件难以覆写、样式串扰。通过**降低指定性**+**作用域隔离**两手段解决。

##### 1.2 核心用法 + 示例代码
1. **BEM 命名**：只使用类选择器，避免标签嵌套。
```html
<div class="btn btn--primary"></div>
```
2. **CSS Modules / Scoped**：构建阶段给类名加哈希，天然避免全局冲突。
3. **原子化 CSS**：如 Tailwind，属性即类名，无级联。

##### 1.3 常见误区或面试陷阱
- 使用深层后代选择器提高权重，只是暂时掩盖问题。
- 滥用 `!important` 会造成维护地狱。
- 只在组件外层加 ID，但内部仍深层嵌套，权重依然过高。

</details>

## 5. let、const 与 var 的区别？ {#question-subjective-a9edba7f9ea4}

### 题目要点

考察对ES6变量声明的理解，重点关注变量提升、暂时性死区、块级作用域等概念。同时考察对JavaScript内存管理的认识，包括变量在内存中的存储方式和垃圾回收机制。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
| 特性 | var | let | const |
| --- | --- | --- | --- |
| 作用域 | 函数 | 块级 | 块级 |
| 提升 | 有，初始化为 `undefined` | 有，处于 TDZ | 有，处于 TDZ |
| 重新声明 | 允许 | 报错 | 报错 |
| 全局声明 | 挂载 `window` | 不挂载 | 不挂载 |
| 赋值 | 可多次赋值 | 可多次赋值 | 必须初始化且不可重新赋值（对象属性可变） |

##### 1.2 核心用法 + 示例代码
```js
function demo() {
  console.log(a); // undefined
  var a = 1;

  // console.log(b); // ReferenceError (TDZ)
  let b = 2;
}
```
##### 1.3 常见误区或面试陷阱
- `const` 并非不可变，只是绑定地址不可变；对对象属性仍可修改。
- 忽视 TDZ：在声明前访问 let/const 会抛错。
- 全局 `var` 污染命名空间，引发覆盖。

</details>

## 6. 闭包的概念，实现一个闭包的使用场景 {#question-subjective-94837e540de0}

### 题目要点

考察对JavaScript闭包机制的理解，包括词法作用域、作用域链等核心概念。同时考察在实际开发中如何合理使用闭包实现数据私有化、状态保持等功能，以及如何处理闭包相关的内存泄漏问题。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
闭包本质是**函数与其引用的外部变量组合**形成的执行环境，函数即使脱离原始作用域也能访问那些变量。

##### 1.2 核心用法 + 示例代码
典型场景：实现计数器。
```js
function createCounter() {
  let count = 0; // 私有变量
  return function () {
    return ++count;
  };
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```
##### 1.3 常见误区或面试陷阱
- 忽略内存泄漏：闭包长驻内存，注意及时置 null。
- 将闭包与立即执行函数混淆，两者不等同。
- 认为闭包只能在函数返回后才存在，其实事件监听也会产生闭包。

</details>

## 7. 以下代码的输出顺序 {#question-subjective-52944d170908}

```
setTimeout(() => console.log(1), 0);
Promise.resolve().then(() => console.log(2));
console.log(3);
```

### 题目要点

考察对JavaScript事件循环机制的理解，包括宏任务、微任务的执行顺序和优先级。同时考察对Promise、setTimeout等异步API的掌握程度，以及在实际开发中如何合理安排任务执行顺序。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
执行过程：
1. 同步代码 `console.log(3)` 立即输出 `3`。
2. 微任务队列插入 `Promise.then` 回调。
3. 宏任务队列插入 `setTimeout` 回调。
4. 当前宏任务结束后，清空微任务，输出 `2`。
5. 执行下一个宏任务，输出 `1`。
最终顺序：`3 → 2 → 1`。

##### 1.2 核心用法 + 示例代码
事件循环模型：**执行栈 → 微任务队列 → 渲染 → 下一宏任务**。

##### 1.3 常见误区或面试陷阱
- 认为 `setTimeout 0` 会立即执行；实际上至少等待下一轮宏任务。
- 忘记微任务在同周期内先于渲染。

</details>

## 8. 宏任务与微任务的区别是什么 {#question-subjective-ad0ac1046b7c}

### 题目要点

考察对浏览器事件循环机制的深入理解，包括不同类型任务的执行时机和触发条件。同时关注对渲染时机、性能优化的认识，以及如何在实际开发中合理使用异步任务队列。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
- **宏任务 (macro-task)**：整体脚本、setTimeout/Interval、I/O、MessageChannel 等。
- **微任务 (micro-task)**：Promise.then/catch/finally、MutationObserver、queueMicrotask。
浏览器每完成一个宏任务 → **清空当前所有微任务** → 可能进行一次布局/渲染。

##### 1.2 核心用法 + 示例代码
```js
queueMicrotask(() => console.log('micro'));
setTimeout(() => console.log('macro'));
```
输出先 `micro` 后 `macro`。

##### 1.3 常见误区或面试陷阱
- 把 `requestAnimationFrame` 归为微任务；它是独立的渲染帧回调。
- 认为每个微任务执行完都会立刻渲染；实际上渲染只在微任务清空后。

</details>

## 9. 如何通过 Object.create(null) 创建一个无原型的对象？ {#question-subjective-f637e6bd79ef}

### 题目要点

考察对JavaScript原型链机制的理解，以及Object.create方法的底层原理。同时考察在实际开发中如何正确使用无原型对象，以及其在字典对象、数据存储等场景中的应用。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
`Object.create(proto)` 返回一个新对象，并将其内部 `[[Prototype]]` 设为 `proto`。当传 `null` 时，新对象**没有原型**，不继承 `Object.prototype` 的方法。

##### 1.2 核心用法 + 示例代码
```js
const dict = Object.create(null);
dict["key"] = "value";
console.log("toString" in dict); // false
```
常用于**字典结构**防止键名与原型属性冲突。

##### 1.3 常见误区或面试陷阱
- 忽视 JSON 序列化：无原型对象可正常序列化，但 `instanceof Object` 为假。
- 试图直接调用 `dict.toString()` 会报错，因为方法不存在。

</details>

## 10. Promise.all 与 Promise.race 的适用场景分别是什么？ {#question-subjective-bb275f5278a0}

### 题目要点

考察对Promise并发控制的理解，包括不同场景下如何选择合适的Promise组合方法。同时考察错误处理策略、超时控制等实际应用场景的处理能力。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
- **Promise.all**：等待**全部** Promise 成功，任一失败即 reject；适合结果互相独立但缺一不可的场景。
- **Promise.race**：取**最先 settle** 的结果（resolve/reject）；可用于超时控制、兜底资源加载。

##### 1.2 核心用法 + 示例代码
```js
// all 示例：批量加载资源
Promise.all(urls.map(fetch)).then(render);

// race 示例：实现请求超时
const withTimeout = (p, ms) => Promise.race([
  p,
  new Promise((_, r) => setTimeout(() => r('timeout'), ms))
]);
```

**实际业务场景：**
- Promise.all：
  • 多个接口数据聚合展示
  • 批量上传文件并等待全部完成
  • 并行数据预加载
- Promise.race：
  • 请求超时控制
  • 多CDN资源加载竞速
  • 降级方案切换

##### 1.3 常见误区或面试陷阱
- 把 `Promise.all` 当串行使用；实际并行执行。
- 认为 `race` 只返回成功结果；它可能返回 reject。

</details>

## 11. 如何实现 Promise.all 的失败重试机制？ {#question-subjective-8e8db139b40f}

### 题目要点

考察对Promise异步流程控制的掌握，包括重试策略的设计和实现。同时考察对错误处理、并发控制的理解，以及如何在实际项目中实现可靠的重试机制。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
思路：对每个任务封装重试函数 `retry(fn, times)`，再交给 `Promise.all`。

##### 1.2 核心用法 + 示例代码
```js
function retry(task, times = 3) {
  return new Promise((resolve, reject) => {
    const attempt = () => task().then(resolve).catch(err => {
      if (times-- > 0) attempt();
      else reject(err);
    });
    attempt();
  });
}
// 使用
Promise.all(tasks.map(t => retry(t, 2)))
  .then(console.log)
  .catch(console.error);
```
##### 1.3 常见误区或面试陷阱
- 忘记返回任务的最终 Promise，导致 `Promise.all` 失效。
- 未处理重试间隔 & 退避策略，造成瞬时高并发。

</details>

## 12. 讲一下 301、302、304 状态码的含义及使用场景。 {#question-subjective-c589ce5d5044}

### 题目要点

考察对HTTP重定向和缓存机制的理解，包括不同状态码的应用场景和区别。同时考察在实际项目中如何正确使用这些状态码来优化用户体验和SEO。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
- **301 Moved Permanently**：永久重定向，浏览器/搜索引擎会缓存。
- **302 Found**：临时重定向，不应缓存。
- **304 Not Modified**：协商缓存命中，客户端使用本地副本。

##### 1.2 核心用法 + 示例代码
- 域名切换用 301 保留权重：`example.com → www.example.com`。
- 登录后跳转用 302：`/login → /dashboard`。
- 静态资源利用 `ETag/Last-Modified` 协商，返回 304 减少传输。

**实际应用场景补充：**
- 301：网站升级 HTTPS、多域名合并、历史页面迁移
- 302：A/B测试跳转、临时活动页面、负载均衡
- 304：图片/JS/CSS等静态资源缓存、API接口数据缓存

##### 1.3 常见误区或面试陷阱
- 把 302 当永久跳转，导致搜索排名丢失。
- 使用 301 但资源仍变动，浏览器因缓存导致加载错误。

</details>

## 13. 为什么Vue 3放弃Object.defineProperty？ {#question-subjective-380453598af3}

### 题目要点

考察对Vue响应式系统实现原理的理解，包括Object.defineProperty和Proxy的优劣对比。同时考察对框架升级决策的理解，以及如何处理新特性的兼容性问题。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
`Object.defineProperty` 只能劫持**已存在**的属性，新增/删除属性需 `Vue.set/delete`；深层嵌套需递归遍历，性能差。
`Proxy` 可劫持 **整个对象** 的读写，包括动态属性与数组索引，并提供 `deleteProperty`、`has` 等拦截，解决 Vue2 痛点。

##### 1.2 核心用法 + 示例代码
```js
const state = new Proxy({}, {
  get(target, key) { /* track */ return target[key]; },
  set(target, key, val) { /* trigger */ target[key] = val; return true; }
});
```
##### 1.3 常见误区或面试陷阱
- 认为 Proxy 一定比 defineProperty 慢；在多数场景下 Proxy 减少递归，综合性能更优。
- 忽视 IE11 不支持 Proxy，需要降级方案。

</details>

## 14. 如何实现嵌套对象的响应式？ {#question-subjective-9c931c9ff703}

### 题目要点

考察对响应式系统实现原理的深入理解，包括深度监听、性能优化等关键问题。同时考察在实际开发中如何处理复杂数据结构的响应式转换。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
通过 **惰性递归**：在第一次访问子对象时才代理，避免一次性深遍历。

##### 1.2 核心用法 + 示例代码
```js
function reactive(obj) {
  const cache = new WeakMap();
  const handler = {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (typeof res === 'object' && res !== null) {
        return cache.get(res) || reactive(res);
      }
      return res;
    },
    set(target, key, val, receiver) {
      const old = target[key];
      const result = Reflect.set(target, key, val, receiver);
      if (old !== val) triggerUpdate();
      return result;
    }
  };
  const observed = new Proxy(obj, handler);
  cache.set(obj, observed);
  return observed;
}
```
##### 1.3 常见误区或面试陷阱
- 在响应式对象内部重新赋普通对象导致丢失响应；应调用 `reactive` 包装。
- 深层次大量数据时全量代理，初始开销大；宜懒代理。

</details>

## 15. Proxy的兼容性问题如何解决 {#question-subjective-6c8b6aafe312}

### 题目要点

考察对现代JavaScript特性的兼容性处理能力，包括降级策略的设计和实现。同时考察如何在工程中平衡新特性使用和浏览器兼容性需求。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
ES6 Proxy 不可被完整 polyfill（需底层引擎支持）。IE11/低端浏览器不支持。

##### 1.2 核心用法 + 示例代码
解决策略：
1. **编译时降级**：对响应式库引入 `@vue/reactivity` + `@vue/reactivity-transform`，在构建阶段转为 getter/setter。
2. **运行时兼容**：
   - 检测 `window.Proxy`，不支持则回退到 `Object.defineProperty` 版本。
   - 或通过微前端/渐进式架构放弃旧浏览器支持。

##### 1.3 常见误区或面试陷阱
- 依赖第三方 polyfill 声称可兼容 Proxy，实际功能受限。
- 忽视打包体积：同时引入两套实现需树摇优化。

</details>

## 16. 介绍 AntV 开源贡献的具体内容 {#question-subjective-8b102f45cf22}

### 题目要点

考察对数据可视化技术的理解深度，以及在开源项目中的实际贡献经验。同时关注问题分析能力、代码质量意识，以及与开源社区的协作能力。

<details>
<summary>参考答案</summary>

"我在一个数据可视化项目中使用 AntV 的 G2 图表库时，发现了一个关于坐标轴标签自动旋转的问题。具体来说，当标签文本较长时，默认的自动旋转算法可能会导致标签重叠，影响图表的可读性。

经过源码分析，我发现这是因为旋转角度计算没有充分考虑文本宽度和容器空间的关系。于是我提交了一个PR，主要改进了以下几点：

1. 优化了标签旋转角度的计算逻辑，考虑了文本宽度、间距和容器宽度的动态关系
2. 添加了自定义旋转角度的配置选项，提供更灵活的调整能力
3. 补充了边界情况的单元测试，确保功能的稳定性
4. 更新了相关文档，添加了使用示例

这个改进被社区采纳后，解决了很多用户反馈的标签展示问题。通过这次贡献，我不仅深入理解了G2的渲染原理，也学习到了开源项目的协作流程。

后续我计划继续关注AntV的发展，特别是在图表交互性能优化方面，希望能为项目贡献更多力量。"

答题要点提示
1. 突出问题分析和解决思路
2. 说明技术方案的考量
3. 强调代码质量和测试覆盖
4. 体现与社区的良好互动
5. 展示持续学习的态度

</details>

## 17. 给定一个字符串，找出其中不包含重复字符的最长子串长度。 {#question-subjective-24e87b32fcf2}

### 题目要点

考察对字符串处理和滑动窗口算法的理解，包括时间复杂度优化和边界条件处理。同时考察代码的规范性和算法的可读性。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
使用 **双指针 + 哈希表** 记录字符最后出现位置，窗口内无重复字符。

##### 1.2 核心用法 + 示例代码
```js
function lengthOfLongestSubstring(s) {
  let left = 0, max = 0;
  const map = new Map();
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1; // 收缩窗口
    }
    map.set(ch, right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}
```
##### 1.3 常见误区或面试陷阱
- 只使用 Set 无法快速左指针跳跃，导致 O(n²)。
- 忘记更新字符索引，窗口无法正确移动。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-19/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-19/round-20/index.md" >}}) →
