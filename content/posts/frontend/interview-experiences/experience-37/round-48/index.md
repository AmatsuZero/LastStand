+++
title = "腾讯-暑期实习 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/37"
experienceId = 37
roundId = 48
roundOrder = 1
company = "腾讯"
date = "2025-06-29T13:39:17.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-37/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 主要几种在以下几个方向：

- vue3原理
- 前端工程化：webpack、vite、pnpm、monorepo
- 前端安全
- 计算机网络

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. JSON数组扁平化&数据过滤 {#question-subjective-20e6c69e8673}

假设有一个模拟接口 `fetchData()`，返回 Promise 对象，数据格式为：<br>

```json
{
"data": [
    { "id": 1, "value": 5 },
    { "id": 2, "value": 10, "children": [
        { "id": 3, "value": 8 } ]
    }
]
}
```
要求：<br>
1. **将接口返回的嵌套数据结构扁平化为一维数组**；<br>
2.  **筛选出 **`value`** 大于等于 8 的元素**；<br>
3. **按 **`id`** 升序排列后，渲染为 **`<ul>`** 列表**。<br>

示例输出：

```html
<ul>
<li>id:2, value:10</li>
<li>id:3, value:8</li>
</ul>
```

### 题目要点

- **递归与数据结构处理**：考查候选人是否理解如何处理嵌套结构。
- **数组操作基础**：filter/sort/map 等高阶方法掌握情况。
- **异步处理能力**：是否熟悉 `Promise` 的使用。
- **原生 DOM 操作**：不用框架的情况下渲染 HTML。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

此题本质是一个数据处理与 DOM 渲染综合题，目标包括：

- 从嵌套数据结构中提取出所有元素（需递归）。
- 处理业务条件（筛选 value >= 8）。
- 排序并使用 DOM API 渲染 `<ul><li>...</li></ul>`。

##### 1.2 核心用法 + 示例代码

```javascript

async function renderList() {
  const result = await fetchData();
  const flatList = [];

  function flatten(data) {
    data.forEach(item => {
      const { children, ...rest } = item;
      flatList.push(rest);
      if (children) flatten(children);
    });
  }

  flatten(result.data);

  const filtered = flatList
    .filter(item => item.value >= 8)
    .sort((a, b) => a.id - b.id);

  const ul = document.createElement('ul');
  filtered.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `id:${item.id}, value:${item.value}`;
    ul.appendChild(li);
  });

  document.body.appendChild(ul);
}
```

</details>

## 2. Vue 3在框架层面在模板编译的时候做了哪些优化 {#question-subjective-740ac08da00d}

### 题目要点

Vue3/编译优化/静态提升/PatchFlag/AST

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

Vue 3 在模板编译阶段做了系统性优化，以提升运行时性能，核心优化包括：

- **静态提升（Hoisting）**：将不会变的节点标记为静态，提升到函数外部，只生成一次虚拟 DOM，减少渲染成本。
- **Patch Flag 标记机制**：运行时精准追踪变动内容，避免全量 diff。
- **事件缓存**：静态事件绑定仅生成一次函数，避免重复创建。

##### 1.2 核心用法 + 示例代码

```vue
<!-- 静态内容 -->
<div>
  <h1>欢迎使用 Vue 3</h1>
  <p>{{ count }}</p>
</div>
```
编译生成的 render 函数中，h1 会被标记为静态并提取为常量，p 则带有 patch flag 指示为动态节点。

</details>

## 3. 如何区分静态变量还是动态变量，如何识别 {#question-subjective-a1ee90389a79}

小编注解：这里的上下文，应该问的还是Vue3的优化，在这方面是怎么做的

### 题目要点

Vue3/编译优化/静态提升/AST/PatchFlag/模板性能

<details>
<summary>参考答案</summary>

#### 一、考察点

- Vue3 编译阶段的静态提升机制
- 静态与动态节点的识别规则
- AST 编译分析与 PatchFlag 标记策略
- 开发中如何写出更高性能的模板

#### 二、参考答案

##### 1.1 原理说明

Vue3 在模板编译阶段会分析每一个节点是否是“静态节点”，从而进行 **静态提升（hoisting）**，提高运行时性能。

Vue3 主要通过**AST（抽象语法树）分析**来判断静态或动态节点，并在运行时通过 **PatchFlag（补丁标记）** 精准更新。

**静态节点的判断规则包括**：

- 内容完全不依赖响应式数据；
- 不包含插值表达式（如 `{{ msg }}`）；
- 不使用动态属性绑定（如 `:class="..."`、`:style="..."`）；
- 不包含控制流指令（如 `v-if`、`v-for`）；
- 子节点也是静态的。

如果一个节点满足上述所有条件，它就会被 Vue 编译器标记为静态，并提升到 render 函数外部，仅创建一次，复用渲染。

##### 1.2 核心用法 + 示例代码

示例1：静态节点

```vue
<div class="title">欢迎访问</div>
````

这是一个纯静态节点，不绑定任何响应式数据，会被静态提升。

示例2：动态节点

```vue
<div :class="themeClass">{{ username }}</div>
```

* 使用了 `:class` 动态绑定
* 使用了插值表达式 `{{ username }}`
  \=> 被识别为动态节点，不做静态提升。

如何识别（实操角度）：

* 编写模板时尽量将静态内容与动态内容拆开。
* 通过运行时的 `__DEV__` 编译输出 render 函数查看是否存在 `HOISTED` 标记。
* 使用 Vue DevTools 或编译器工具分析 patch flag 标记（例如 `TEXT`, `CLASS`, `STYLE` 等）。

##### 1.3 常见误区或面试陷阱

* 认为所有未绑定数据的元素都是静态节点，忽略 `v-if` 或父级动态作用。
* 误以为 Vue2 也具有相同静态提升机制（Vue2 的静态分析不够精细）。
* 忽略 `v-for` 中的节点，即使内容写死也会被视作动态节点。

</details>

## 4. 模板编译这一块具体是如何编译的？模板编译里AST抽象语法树了解吗 {#question-subjective-33e49efeaa4f}

### 题目要点

Vue编译/模板编译/AST/Parse-Transform-Generate/render函数

<details>
<summary>参考答案</summary>

#### 一、考察点

- Vue 模板编译原理：从模板到 render 函数的全过程
- AST 抽象语法树的结构与作用
- 编译阶段和运行阶段的分工理解
- 实际应用中如何通过编译优化提升性能

#### 二、参考答案

##### 1.1 原理说明

Vue 的模板编译过程主要发生在构建阶段，核心目的是将 `.vue` 文件中的模板字符串，**编译成可执行的 `render()` 渲染函数**。

这个过程分为 **三步**，每一步都以 **AST（抽象语法树）** 为基础中间产物进行处理：

1. **Parse（解析）**：将模板字符串解析成 AST（抽象语法树）结构，描述 DOM 元素、指令、文本等。
2. **Transform（转换）**：对 AST 进行结构分析与优化，包括静态标记、表达式处理、v-if/v-for 转换等。
3. **Generate（生成）**：将优化后的 AST 转换为 JavaScript 代码，即渲染函数 `render()`。

AST 是模板编译的“桥梁”，它使得模板能够像代码一样被分析和优化。

##### 1.2 核心用法 + 示例代码

简单模板：

```vue
<template>
  <div>{{ msg }}</div>
</template>
````

编译为 AST（结构简化）：

```json
{
  type: 'Root',
  children: [
    {
      type: 'Element',
      tag: 'div',
      children: [
        {
          type: 'Interpolation',
          content: { type: 'Expression', content: 'msg' }
        }
      ]
    }
  ]
}
```

编译生成的渲染函数大致如下：

```js
function render(ctx) {
  return h('div', null, ctx.msg);
}
```

**AST 的作用包括：**

* 静态节点识别（配合静态提升）
* PatchFlag 标记生成（用于运行时优化）
* 各类指令的处理（如 v-if/v-for）

##### 1.3 常见误区或面试陷阱

* 混淆 AST 与虚拟 DOM（AST 是编译期中间产物，虚拟 DOM 是运行时结构）
* 不知道 Vue 使用自己的模板编译器，非浏览器原生语法
* 忽视 AST 是 Vue 编译优化的核心，如静态提升、patchFlag 都基于 AST 标记

</details>

## 5. UnoCSS 了解过吗？ {#question-subjective-58443f0d56e2}

### 题目要点

- 是否了解现代原子化 CSS 方案的设计理念
- UnoCSS 的按需生成机制
- UnoCSS 与 Tailwind CSS 的区别与优势
- 构建性能优化与工具链集成能力

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

UnoCSS 是一个现代原子化 CSS 引擎，其最大特点是 **即时按需生成样式**，而不是像传统原子类框架那样预生成一整套 CSS 文件。

UnoCSS 的核心机制：

- **零运行时开销**：开发时分析源码中用到的 class，构建时生成对应的 CSS，生产环境中不包含无用样式。
- **完全自定义规则**：支持自己定义规则、主题、变体等，底层采用插件架构，非常灵活。
- **即时热更新**：在 Vite 等现代工具中配合使用时，体验非常快，改一个类名就能马上看到样式变化。

##### 1.2 核心用法 + 示例代码

使用示例：

```html
<!-- 不需要预定义 w-100 和 text-red，UnoCSS 会自动生成 -->
<div class="w-100 text-red"></div>
````

这段代码会动态生成如下 CSS：

```css
.w-100 { width: 100px; }
.text-red { color: red; }
```

集成到 Vite 中（vite.config.ts）：

```ts
import UnoCSS from 'unocss/vite';

export default {
  plugins: [UnoCSS()]
}
```

UnoCSS 常见的 Preset（预设）：

* `@unocss/preset-uno`: 默认类 Tailwind 风格原子类
* `@unocss/preset-attributify`: 支持属性式写法，例如 `<div text="red-500" />`
* `@unocss/preset-icons`: 快速使用图标字体

##### 1.3 常见误区或面试陷阱

* **误解为“只是另一个 Tailwind”**：UnoCSS 是类库无关的原子引擎，Tailwind 是一个具体原子类库，它甚至可以用 UnoCSS 来实现。
* **以为样式是预生成的**：UnoCSS 并不会生成全量 CSS，而是**用到一个生成一个**。
* **不理解属性式写法是如何兼容的**：通过 AST 分析模板，解析 attribute 语法再生成类名。

</details>

## 6. 介绍Promise.all()、Promise.allSettled()、Promise.race() {#question-subjective-a7246ca86f89}

### 题目要点

Promise.all/Promise.allSettled/Promise.race/并发控制/异常处理/API对比/竞态控制

- 掌握 Promise 并发控制方法的差异与使用场景
- 是否了解 Promise 状态行为在集合操作中的传播机制
- 面试者是否能清晰表达 API 的行为边界
- 能否结合项目场景选择合适的 API 使用

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

JavaScript 中的 `Promise.all()`、`Promise.allSettled()` 和 `Promise.race()` 是三种常用的 Promise 组合方法，它们用于处理多个 Promise 并发时的不同需求。

---

**`Promise.all()`**

- 接收一个 Promise 数组。
- **只要有一个 Promise 被 reject，整体就立即 reject**。
- 所有都 fulfilled 时，返回所有结果组成的数组，顺序与原数组一致。
- 常用于：所有任务都必须成功时的并发请求。

示例：

```js
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => { /* 全部成功 */ })
  .catch(err => { /* 任意失败 */ });
````

---

**`Promise.allSettled()`**

* 接收一个 Promise 数组。
* **等待所有 Promise 都 settle（无论成功还是失败）**。
* 返回一个数组，数组元素为 `{ status: 'fulfilled' | 'rejected', value | reason }`。
* 常用于：需要获取每个 Promise 的最终状态，而不是中途被打断。

示例：

```js
Promise.allSettled([p1, p2])
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(result.value);
      } else {
        console.error(result.reason);
      }
    });
  });
```

---

**`Promise.race()`**

* 接收一个 Promise 数组。
* **返回第一个完成（fulfilled 或 rejected）的结果**。
* 常用于：设置超时逻辑或竞态控制。

示例：

```js
const timeout = new Promise((_, reject) => setTimeout(() => reject('timeout'), 1000));
Promise.race([fetch('/api'), timeout])
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

##### 1.2 常见误区或面试陷阱

* **误把 allSettled 当成 all**：在错误处理逻辑中使用 allSettled，却期待其在某个失败时直接 reject。
* **错误理解 race 行为**：race 并不会等所有 Promise，只取第一个“settle”的，无论成功还是失败。
* **忽视数组顺序问题**：Promise.all 返回值的顺序与传入的数组顺序严格一致，哪怕某些 Promise 更快。

</details>

## 7. Nginx如何进行流量按比例转发 {#question-subjective-35be8e1c857d}

### 题目要点

是否掌握 Nginx 的流量分流机制

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握 Nginx 的流量分流机制
- 理解 `weight` 权重配置和 `split_clients` 模块的区别与用途
- 能否结合实际场景（灰度发布、AB测试）选择合适方案
- 是否清楚请求如何按一定比例被稳定路由到不同后端

#### 二、参考答案

##### 1.1 原理说明

Nginx 支持多种方式实现流量按比例转发，常见的有两种：

---

**方式一：使用 `upstream` 的 `weight` 实现权重分流（请求级别）**

这是最常用的一种后端负载均衡方式。配置多个上游服务器，通过设置不同的 `weight` 值来实现按比例转发请求。

```nginx
upstream backend {
  server backend-v1.example.com weight=8;
  server backend-v2.example.com weight=2;
}

server {
  location / {
    proxy_pass http://backend;
  }
}
````

上面配置表示约 80% 请求转发到 v1，20% 转发到 v2。但注意它是**请求级别**的随机分发，**无法保证用户级别的稳定性**。

---

**方式二：使用 `split_clients` 实现用户级灰度或 AB 测试（用户级别）**

该模块可按变量（如用户 ID、cookie、IP 等）**稳定地将用户映射到某个分支**，适用于灰度发布、AB 测试等场景。

```nginx
split_clients "${remote_addr}" $variant {
  80%     v1;
  20%     v2;
}

server {
  location / {
    if ($variant = v1) {
      proxy_pass http://backend-v1;
    }
    if ($variant = v2) {
      proxy_pass http://backend-v2;
    }
  }
}
```

* `split_clients` 基于 hash 算法，用户每次访问都会落到同一版本上。
* 可将 `$remote_addr` 换成 cookie 等标识，提高灰度控制粒度。

##### 1.2 使用建议与对比

| 方法             | 粒度  | 是否稳定 | 场景         |
| -------------- | --- | ---- | ---------- |
| weight         | 请求级 | 否    | 普通负载均衡     |
| split\_clients | 用户级 | 是    | 灰度发布、AB 测试 |

##### 1.3 常见误区或面试陷阱

* **误用 weight 做灰度发布**：weight 是随机请求分发，用户不稳定落到多个版本。
* **不了解 split\_clients 模块**：该模块默认未启用，需编译或使用支持的 Nginx。
* **将流量比例和性能负载混为一谈**：比例控制是流量逻辑，不等于性能均衡。

</details>

## 8. 面试官：说说Loader和Plugin的区别？编写Loader，Plugin的思路？ {#question-89eda79c-6cfb-4593-86d3-69d9ce9eb43d}

> 题库原题：[面试官：说说Loader和Plugin的区别？编写Loader，Plugin的思路？](https://fe.ecool.fun/topic/89eda79c-6cfb-4593-86d3-69d9ce9eb43d)

### 题目要点

前面两节我们有提到`Loader`与`Plugin`对应的概念，先来回顾下

<details>
<summary>参考答案</summary>

## 一、区别

前面两节我们有提到`Loader`与`Plugin`对应的概念，先来回顾下

- loader 是文件加载器，能够加载资源文件，并对这些文件进行一些处理，诸如编译、压缩等，最终一起打包到指定的文件中
- plugin 赋予了 webpack 各种灵活的功能，例如打包优化、资源管理、环境变量注入等，目的是解决 loader 无法实现的其他事

从整个运行时机上来看，如下图所示：

![](https://static.ecool.fun//article/28ef0747-02ae-4903-bb2a-7ee56c19ce7d.png)

可以看到，两者在运行时机上的区别：

-  loader 运行在打包文件之前
-  plugins 在整个编译周期都起作用

在` Webpack` 运行的生命周期中会广播出许多事件，`Plugin` 可以监听这些事件，在合适的时机通过` Webpack `提供的 `API `改变输出结果

对于`loader`，实质是一个转换器，将A文件进行编译形成B文件，操作的是文件，比如将`A.scss`或`A.less`转变为`B.css`，单纯的文件转换过程

## 二、编写loader

在编写 `loader` 前，我们首先需要了解 `loader` 的本质

其本质为函数，函数中的 `this` 作为上下文会被 `webpack` 填充，因此我们不能将 `loader`设为一个箭头函数

函数接受一个参数，为 `webpack` 传递给 `loader` 的文件源内容

函数中 `this` 是由 `webpack` 提供的对象，能够获取当前 `loader` 所需要的各种信息

函数中有异步操作或同步操作，异步操作通过 `this.callback` 返回，返回值要求为 `string` 或者 `Buffer`

代码如下所示：

```js
// 导出一个函数，source为webpack传递给loader的文件源内容
module.exports = function(source) {
    const content = doSomeThing2JsString(source);

    // 如果 loader 配置了 options 对象，那么this.query将指向 options
    const options = this.query;

    // 可以用作解析其他模块路径的上下文
    console.log('this.context');

    /*
     * this.callback 参数：
     * error：Error | null，当 loader 出错时向外抛出一个 error
     * content：String | Buffer，经过 loader 编译后需要导出的内容
     * sourceMap：为方便调试生成的编译后内容的 source map
     * ast：本次编译生成的 AST 静态语法树，之后执行的 loader 可以直接使用这个 AST，进而省去重复生成 AST 的过程
     */
    this.callback(null, content); // 异步
    return content; // 同步
}
```

一般在编写`loader`的过程中，保持功能单一，避免做多种功能

如` less `文件转换成 `css `文件也不是一步到位，而是 `less-loader`、`css-loader`、` style-loader `几个 `loader `的链式调用才能完成转换

## 三、编写plugin

由于`webpack`基于发布订阅模式，在运行的生命周期中会广播出许多事件，插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务

在之前也了解过，`webpack`编译会创建两个核心对象：

- compiler：包含了 webpack 环境的所有的配置信息，包括 options，loader 和 plugin，和 webpack 整个生命周期相关的钩子
- compilation：作为 plugin 内置事件回调函数的参数，包含了当前的模块资源、编译生成资源、变化的文件以及被跟踪依赖的状态信息。当检测到一个文件变化，一次新的 Compilation 将被创建

如果自己要实现`plugin`，也需要遵循一定的规范：

- 插件必须是一个函数或者是一个包含 `apply` 方法的对象，这样才能访问`compiler`实例
- 传给每个插件的 `compiler` 和 `compilation` 对象都是同一个引用，因此不建议修改
- 异步的事件需要在插件处理完任务时调用回调函数通知 `Webpack` 进入下一个流程，不然会卡住

实现`plugin`的模板如下：

```js
class MyPlugin {
    // Webpack 会调用 MyPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply (compiler) {
    // 找到合适的事件钩子，实现自己的插件功能
    compiler.hooks.emit.tap('MyPlugin', compilation => {
        // compilation: 当前打包构建流程的上下文
        console.log(compilation);

        // do something...
    })
  }
}
```

在 `emit` 事件发生时，代表源文件的转换和组装已经完成，可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容

</details>

## 9. pnpm跟npm有什么区别？包管理工具Corepack了解吗 {#question-subjective-c70f7dc42e2a}

### 题目要点

pnpm/npm对比/硬链接/包隔离/磁盘优化/Corepack/包管理器代理

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否了解不同包管理器（npm、pnpm、yarn）的核心区别
- 理解 pnpm 的独特机制：硬链接、不可变缓存、node_modules 结构优化
- 是否了解 Corepack 的定位与使用方式
- 能否结合实际项目选择合适的包管理工具

#### 二、参考答案

##### 1.1 原理说明

---

### ✅ pnpm 与 npm 的主要区别

| 特性 | pnpm | npm |
|------|------|-----|
| 安装机制 | 使用内容寻址的 **全局存储 + 硬链接** | 每次复制依赖到项目目录 |
| node_modules 结构 | 创建带 symlink 的 **扁平结构（但隔离依赖）** | 扁平结构，可能产生依赖冲突 |
| 安装速度 | 快，具有缓存、并行处理等优化 | 较慢，重复安装较多 |
| 磁盘空间占用 | 小，相同依赖只存一份 | 大，每个项目重复依赖 |
| 是否严格 | 是，默认启用 hoisting 限制 | 否，可能隐藏依赖错误 |

**pnpm 最大的特性是**：使用全局存储 + 硬链接的方式复用依赖，节省空间并加速安装，同时保持依赖隔离，避免“幽灵依赖”。

示例：初始化一个项目使用 pnpm

```bash
pnpm init
pnpm install lodash
````

---

### ✅ Corepack 是什么？

Corepack 是 Node.js 自带的一个**包管理器代理工具**，用来统一管理 `npm` / `pnpm` / `yarn` 的版本。

* 默认内置于 Node.js 16.9+，但需手动启用（Node 20+ 默认启用）。
* **目标**：让项目中可以声明所用包管理器和版本，并自动安装对应版本，避免不同开发者、CI 环境版本不一致。

项目中通过 `packageManager` 字段指定：

```json
{
  "packageManager": "pnpm@8.6.0"
}
```

启用 Corepack：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

##### 1.3 常见误区或面试陷阱

* **误以为 pnpm 是 yarn 的一个变种**：pnpm 是完全独立的包管理器，设计思想与 npm/yarn 完全不同。
* **忽视 pnpm 的 hoist 行为**：使用 pnpm 时引用未显式安装的包会报错，暴露幽灵依赖，反而更安全。
* **不理解 Corepack 与 nvm、Volta 的区别**：Corepack 管理的是“包管理器版本”，不是 Node.js 版本。

</details>

## 10. 单体仓库monorepo解决了哪些问题？单体仓库有哪些工具及它们的对比优劣势 {#question-subjective-1985f6ff389f}

### 题目要点

monorepo/单体仓库/依赖管理/构建优化/lerna/nx/turborepo/pnpm workspaces/工具对比

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否理解 monorepo 的基本概念和适用场景
- 能否说清 monorepo 相比多仓结构带来的具体好处
- 是否了解主流 monorepo 工具及其核心机制
- 是否具备选型能力：能结合项目场景选择合适的 monorepo 工具

#### 二、参考答案

##### 1.1 原理说明：monorepo 解决了哪些问题？

Monorepo（单体仓库）是一种将多个项目模块（packages）统一维护在一个 Git 仓库中的项目结构，主要用于中大型团队中多模块协同开发场景。

它主要解决以下问题：

1. **依赖版本一致性**<br>
   - 所有模块共用一个依赖树，防止出现多个版本冲突。

2. **统一构建与测试流程**<br>
   - 可以集中执行构建/测试脚本，提高 CI/CD 效率。

3. **模块协同开发与强隔离**<br>
   - 在本地同步开发多个模块，避免频繁发布 npm 包；但也支持强模块边界。

4. **跨模块代码复用和变更追踪**<br>
   - 改动能方便地影响所有依赖模块，同时能精确追踪影响范围。

5. **版本发布管理更清晰**<br>
   - 可以集中管理各模块版本，支持按模块或统一版本发布。

---

##### 1.2 主流 monorepo 工具对比

| 工具 | 特点 | 优势 | 劣势 | 适合场景 |
|------|------|------|------|----------|
| **Lerna** | 基础型 monorepo 工具 | 适配 npm/yarn/pnpm，支持独立版本管理（independent mode） | 原生构建能力较弱，社区维护不活跃 | 传统多包项目管理 |
| **Nx** | 集成式 monorepo 工具 | 内置构建缓存、依赖图分析、任务调度系统 | 上手曲线稍陡，生态较重 | 企业级大型应用、微前端项目 |
| **Turborepo** | 高性能构建系统 | 超快并行任务执行、缓存重用、增量构建 | 官方推荐使用 Vercel 生态 | CI 性能瓶颈、多团队协作 |
| **Rush.js** | 微软出品 | 多包构建/发布高度可控，支持 Git Hooks、安全锁版本 | 配置复杂、文档较晦涩 | 多团队复杂依赖管理 |
| **pnpm workspaces** | 轻量原生支持 | 无需额外工具，结构简单，依赖隔离强 | 缺乏版本发布能力 | 单人或小团队组件开发 |

---

##### 1.3 建议与使用示例（以 pnpm 为例）

使用 `pnpm` 创建 monorepo：

```bash
pnpm init
````

`pnpm-workspace.yaml`：

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

每个子包都有独立 `package.json`，支持跨包依赖。

---

##### 1.4 常见误区或面试陷阱

* **将 monorepo 简单理解为“放在一起”**：实际需要工具支持依赖管理、构建缓存、发布机制。
* **误以为 monorepo 会破坏隔离性**：好的工具能同时支持共享与隔离。
* **只看重工具热度**，忽略自身团队规模、CI 能力、开发复杂度等实际因素。

</details>

## 11. 谈谈你对Vue中keep-alive的理解 {#question-800f499d-75d2-4f3b-9bb3-542cf21721a5}

> 题库原题：[谈谈你对Vue中keep-alive的理解](https://fe.ecool.fun/topic/800f499d-75d2-4f3b-9bb3-542cf21721a5)

### 题目要点

`<keep-alive>` 是 Vue 提供的内置组件，用于缓存那些不需要频繁创建和销毁的组件实例。这样，当这些组件再次被需要时，可以避免重新创建和渲染，从而提高性能。

- **include** 和 **exclude** 属性用于指定哪些组件需要被缓存或排除在外。
- **activated** 和 **deactivated** 钩子函数会在组件被激活或失活时触发。

`<keep-alive>` 常用于以下场景：

- 详情页：当用户查看表格中的某条数据详情时，返回时希望保持之前的筛选结果或页面状态。
- 表单：用户填写了表单内容后，如果路由跳转，返回时希望表单内容仍然保持，无需用户重新填写。

原理上，`<keep-alive>` 内部维护了一个包含组件实例的列表。当一个组件被切换到时，它会将该组件的实例添加到列表中，并记录下组件的名称。当该组件再次被切换到时，它会检查组件名称是否已经在列表中，如果是，则直接使用缓存的组件实例，而不是重新创建一个新的组件实例。

<details>
<summary>参考答案</summary>

## 什么是 keep-alive

在平常开发中，有部分组件没有必要多次初始化，这时，我们需要将组件进行持久化，使组件的状态维持不变，在下一次展示时，也不会进行重新初始化组件。

也就是说，keepalive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，或避免重新渲染，也就是所谓的组件缓存。

<keep-alive>是Vue的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染DOM。

> <keep-alive> 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 <transition> 相似，<keep-alive> 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

## include和exclude指定是否缓存某些组件

* include属性

include 包含的意思。值为字符串或正则表达式或数组。只有组件的名称与include的值相同的才会被缓存，即指定哪些被缓存，可以指定多个被缓存。这里以字符串为例，指定多个组件缓存，语法是用逗号隔开。如下：

```js
// 指定home组件和about组件被缓存
<keep-alive include="home,about" >
    <router-view></router-view>
</keep-alive>
```

* exclude属性

exclude相当于include的反义词，就是除了的意思，指定哪些组件不被缓存，用法和include类似，如下：

```js
// 除了home组件和about组件别的都缓存，本例中就是只缓存detail组件
<keep-alive exclude="home,about" >
    <router-view></router-view>
</keep-alive>
```

## 使用keep-alive的钩子函数执行顺序问题

首先使用了keep-alive的组件以后，组件上就会自动加上了`activated`钩子和`deactivated`钩子。

* `activated` 当组件被激活（使用）的时候触发 可以简单理解为进入这个页面的时候触发
* `deactivated` 当组件不被使用（inactive状态）的时候触发 可以简单理解为离开这个页面的时候触发

假设我们只缓存home组件，我们先看一下代码，再在钩子中打印出对应的顺序。就知道钩子执行的顺序了，自己动手印象深刻

```js
<template>
<div>
  <el-checkbox v-model="checked">备选项</el-checkbox>
</div>
</template>
<script>
export default {
name: "home",
data() { return { checked: false } },
created() {
  console.log("我是created钩子");
},
mounted() {
  console.log("我是mounted钩子");
},
activated() {
  console.log("我是activated钩子");
},
deactivated() {
  console.log("我是deactivated钩子");
},
beforeDestroy() {
  console.log("我是beforeDestroy钩子");所以我们可以得出结论：
},
};
</script>
```

进入组件打印结果如下：

```
我是created钩子
我是mounted钩子
我是activated钩子
```

离开组件打印结果如下：

```
我是deactivated钩子
```

得出结论：

```
初始进入和离开 created ---> mounted ---> activated --> deactivated
后续进入和离开 activated --> deactivated
```

## keep-alive的应用场景举例

* 查看表格某条数据详情页，返回还是之前的状态，比如还是之前的筛选结果，还是之前的页数等
* 填写的表单的内容路由跳转返回还在，比如input框、下选择拉框、开关切换等用户输入了一大把东西，跳转再回来不能清空啊，不用让用户再写一遍

</details>

## 12. VueUse这个hooks库了解吗 {#question-subjective-36b157c9030f}

### 题目要点

VueUse/组合式API/hooks库/工具函数/副作用封装/useMouse/useLocalStorage/useDebounce

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否熟悉组合式 API 思维和 hooks 封装方式
- 是否了解 VueUse 在 Vue3 项目中的常见使用场景
- 是否理解 VueUse 与 React Hooks 或原生 API 的关系与区别
- 能否实际举例 VueUse 提供的核心能力和开发便利性

#### 二、参考答案

##### 1.1 原理说明

**VueUse** 是一个专为 Vue3 设计的组合式函数（hooks）工具库，构建在 Vue Composition API 之上，目的是提升开发效率、统一常见逻辑的封装风格。

**核心特点：**

- 函数式风格，与 `setup()` 完美配合；
- 关注领域广泛：状态、事件监听、媒体查询、网络请求、浏览器特性等；
- 具备极高的可组合性和扩展性；
- 支持 SSR 和 Tree-shaking；
- 高度自动化：许多 hooks 内置了监听、清理、副作用处理等。

---

##### 1.2 核心用法 + 示例代码

**示例 1：响应式鼠标位置**

```ts
import { useMouse } from '@vueuse/core';

const { x, y } = useMouse();
// x 和 y 是 ref 响应式坐标
````

**示例 2：防抖搜索输入**

```ts
import { ref } from 'vue';
import { useDebounce } from '@vueuse/core';

const search = ref('');
const debounced = useDebounce(search, 500);
```

**示例 3：与本地存储联动**

```ts
import { useLocalStorage } from '@vueuse/core';

const token = useLocalStorage('token', '');
```

常用功能分类包括：

* 状态类：`useToggle`, `useCounter`
* DOM 事件类：`useEventListener`, `useMouse`, `useWindowScroll`
* 存储类：`useLocalStorage`, `useSessionStorage`
* 网络类：`useFetch`, `useWebSocket`
* 工具类：`useDebounce`, `useThrottle`, `useIdle`

---

##### 1.3 常见误区或面试陷阱

* **误以为是“黑盒工具”**，实际 VueUse 全部源码开源，且高度透明。
* **滥用**：不理解内部实现就大量引用 hooks，可能导致副作用控制不当。
* **忽视 Tree-shaking**：VueUse 是模块化导出，未使用的函数不会被打包，但前提是正确配置打包工具（如 Vite、Rollup）。
* **不了解 VueUse 的依赖限制**：需要 Vue 3，并依赖 `@vue/reactivity` 等核心模块。

</details>

## 13. vite 和  webpack 在热更新的实现上有什么区别？ {#question-499b7dea-d215-42a1-9c08-44fa8f65e1ee}

> 题库原题：[vite 和  webpack 在热更新的实现上有什么区别？](https://fe.ecool.fun/topic/499b7dea-d215-42a1-9c08-44fa8f65e1ee)

### 题目要点

Vite 基于 ESM 架构，直接将模块提供给浏览器，因而在模块热更新时不需要重新打包，极大提高了 HMR 的速度和开发体验。相比之下，Webpack 由于打包依赖和插件管理，更新时需要重新构建部分代码，使得 HMR 速度在大型项目中有所限制。

因此，Vite 的 HMR 更轻量、响应更快，适合现代开发场景，而 Webpack 在大型、复杂应用中具备更灵活的配置支持。

<details>
<summary>参考答案</summary>

在热更新（HMR，Hot Module Replacement）实现上，Vite 和 Webpack 有显著的区别。Vite 采用了一种与 Webpack 不同的模块处理方式，使得开发体验更为迅速流畅。

以下是 Vite 和 Webpack 在 HMR 实现上的主要区别：

### 1. **开发服务器模式**
   - **Vite**：基于原生 ES 模块（ESM）的浏览器加载方式，利用浏览器的 ESM 能力直接从开发服务器中按需加载模块。Vite 将应用代码以模块的形式直接提供给浏览器，无需构建整个依赖图。这种模式减少了构建步骤，从而显著提升热更新的速度。
   - **Webpack**：使用内置的开发服务器将所有模块打包到一个 Bundle 中，然后由 HMR 插件管理模块更新。Webpack 构建时需要对整个应用依赖图进行一次性打包，因此初始启动和更新的速度相对较慢。

### 2. **模块重载机制**
   - **Vite**：当检测到文件变化时，Vite 会**精确地更新变动的模块**，仅重载发生变化的部分。由于 Vite 基于 ESM 设计，它可以通过 `import.meta.hot` API 将热更新精确定位到特定模块，大大减少了不必要的代码重新加载。
   - **Webpack**：HMR 插件会更新模块或模块树的整个部分，即使只是一个小的模块更改，Webpack 可能仍需重新打包相关的代码块并重新加载。

### 3. **依赖预构建**
   - **Vite**：在启动时，`esbuild` 会对依赖进行预构建并缓存，浏览器可直接请求缓存的模块。因为依赖模块基本不会变动，Vite 的 HMR 只需对应用模块进行热更新。依赖模块预构建避免了每次更改时的重复解析，使得热更新更轻量。
   - **Webpack**：没有预构建缓存机制，所有依赖在开发和更新时都要重新打包和处理。Webpack 的 HMR 需分析整个依赖图，并在变动时重新生成部分代码，影响热更新效率。

### 4. **构建和更新性能**
   - **Vite**：通过原生 ESM 和逐模块加载机制，初始构建时只加载应用代码，更新时只更新变动部分。热更新只需重载特定模块，整个过程无需打包，显著提升速度。
   - **Webpack**：初始构建会生成整个应用的 Bundle，更新时也需重新打包部分代码。模块热替换涉及打包、编译和代码注入，尤其在大型应用中，热更新速度较慢，且会随着应用增大而变慢。

### 5. **模块处理方式**
   - **Vite**：基于 ESM，无需插件即可实现模块热重载，Vite 通过 `import.meta.hot.accept()` 接受模块更新并应用，开发者可以在模块中使用 `import.meta.hot` 检查模块的热更新状态。
   - **Webpack**：需要 HMR 插件和 Webpack 特定配置来支持模块热更新。Webpack 的热更新依赖 `module.hot`，通过该 API 来管理模块更新和重新加载。

</details>

## 14. Vite是如何处理CommonJS模块格式的 {#question-subjective-0d155c2006ee}

### 题目要点

Vite/CommonJS/ESModule/esbuild/预构建/optimizeDeps/模块兼容

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否理解 CommonJS 与 ESModule 的根本差异
- 理解 Vite 原生使用 ESModule 时，为什么仍需支持 CommonJS
- 是否了解 Vite 中依赖预构建（pre-bundling）的处理机制
- 能否清晰解释 Vite 如何将 CJS 转换为浏览器可识别格式

#### 二、参考答案

##### 1.1 原理说明

Vite 本质上是基于浏览器 **原生 ES Module** 加载机制实现开发环境运行的。因此，在浏览器中运行的所有依赖必须是 ESModule 格式。

然而，**许多第三方依赖（特别是老包）仍采用 CommonJS 格式（require/module.exports）**，Vite 需要对其进行兼容转换。

---

### ✅ 核心机制：依赖预构建（Pre-bundling）

Vite 使用 **esbuild** 对所有非 ESM 格式的依赖进行“预构建”，将其 **转换为 ESM 格式**，以便浏览器加载。

具体流程如下：

1. **扫描依赖**：启动时 Vite 会扫描 `import` 的第三方依赖。
2. **判断格式**：如果是 CJS（如使用 `require`），则认为其需转换。
3. **使用 esbuild 转换**：Vite 调用 `esbuild` 将该依赖转成 ESM（静态 `import`），缓存到 `node_modules/.vite/`。
4. **浏览器加载**：Vite 将预构建模块作为中间代理，浏览器只接触到标准 ESM 格式。

---

##### 1.2 示例：引入一个 CommonJS 包

```ts
import _ from 'lodash'; // lodash 是 CJS 模块
````

在 Vite 中，启动时会自动将 lodash 使用 esbuild 转换为：

```js
// ESM 包装后的代码（简化）
import __require from 'vite:require';
const lodash = __require('lodash');
export default lodash;
```

但最终对外仍是 `export default` 格式，满足浏览器使用。

---

##### 1.3 常见误区或面试陷阱

* **以为浏览器能识别 require**：浏览器原生只支持 ESModule，不支持 CommonJS 的 require/exports。
* **误认为 Vite 不支持 CJS**：Vite 通过 esbuild 提前“转换”兼容了 CJS。
* **忽视预构建性能影响**：如果依赖过多、变化频繁，预构建过程可能耗时，建议手动优化 `optimizeDeps` 配置。
* **不理解为什么开发时要预构建但构建时不需要**：Vite 只在开发时做预构建，生产构建走的是 Rollup，统一打包优化。

</details>

## 15. ES 模块化管理打包的模式有哪些？ {#question-subjective-279d8e8eae0f}

### 题目要点

ESModule/CommonJS/UMD/IIFE/模块打包格式/format/es/cjs/rollup

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握现代 JavaScript 模块化发展历程
- 理解常见模块打包模式的输出格式及适用场景
- 能否根据项目需求选择合适的打包输出格式
- 熟悉 ESM 与 CJS 等模块系统的兼容策略

#### 二、参考答案

##### 1.1 原理说明

JavaScript 模块化从早期的 IIFE 模式，发展到 CommonJS（CJS）、AMD、UMD，再到现代标准的 ESModule（ESM）。在打包工具（如 Rollup、Webpack、Vite）中，打包输出格式通常称为 **模块化构建目标（module format）**。

主流的 ES 模块打包模式包括：

---

### ✅ 1. ESModule（ESM）

- 原生模块标准，使用 `import/export`。
- 可被现代浏览器、Node.js、Vite、Rollup 原生支持。
- 构建后文件保留模块结构（适合 tree-shaking）。
- 输出格式：`format: 'es'`

适合场景：现代浏览器环境、模块库发布。

---

### ✅ 2. CommonJS（CJS）

- Node.js 中的传统模块规范，使用 `require` 和 `module.exports`。
- 不支持浏览器直接运行（需打包转换）。
- 输出格式：`format: 'cjs'`

适合场景：Node.js 脚本、老项目兼容。

---

### ✅ 3. UMD（Universal Module Definition）

- 同时兼容 AMD、CJS 和浏览器全局变量。
- 结构复杂、体积较大，不支持 tree-shaking。
- 输出格式：`format: 'umd'`

适合场景：需在各种环境（Node、浏览器、RequireJS）中兼容运行的通用 JS 库。

---

### ✅ 4. IIFE（Immediately Invoked Function Expression）

- 自执行函数，最简单的浏览器兼容格式。
- 所有代码封装在一个函数中，挂载到 `window`。
- 不支持模块化、不可 tree-shake。

适合场景：老旧浏览器环境、快速嵌入脚本。

---

### ✅ 5. SystemJS（format: 'system'）

- 基于 ESModule 的运行时加载器，支持动态模块加载。
- 使用 `System.import()` 进行模块加载。
- 较冷门，主要用于动态运行模块的场景。

适合场景：模块懒加载、微前端架构、老的 SystemJS 项目。

---

##### 1.2 常见打包配置示例（以 Rollup 为例）

```js
export default {
  input: 'index.js',
  output: [
    { file: 'dist/index.esm.js', format: 'es' },
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.umd.js', format: 'umd', name: 'MyLib' },
  ]
}
````

---

##### 1.3 常见误区或面试陷阱

* **误以为 ESM 与 Tree-shaking 无关**：ESM 是实现 tree-shaking 的前提。
* **使用 CJS 发布前端库**：CJS 不支持浏览器直接使用，打包成本更高。
* **混用 export 与 module.exports**：ESM 和 CJS 的语法不可混用，除非通过 Babel/tsc 处理兼容性。
* **不理解 format 与运行环境的对应关系**，导致发布包无法被正确使用。

</details>

## 16. ESLint 9的新特性你知道哪些？性能具体做了哪些优化？ESLint是怎么做到用配置规则去检测代码的异常 {#question-subjective-ccd427452ca9}

### 题目要点

略过

<details>
<summary>参考答案</summary>

略过

</details>

## 17. 简单说下你对 HTTP2 的理解 {#question-8e0a5da4-74f1-4dcd-9217-bc151cd93870}

> 题库原题：[简单说下你对 HTTP2 的理解](https://fe.ecool.fun/topic/8e0a5da4-74f1-4dcd-9217-bc151cd93870)

### 题目要点

HTTP/1.1面临的问题主要包括TCP连接数限制、线头阻塞、Header内容冗余、资源优化困难以及明文传输的不安全性。

为了解决这些问题，HTTP/2引入了一系列优势：

1. **二进制分帧层**：通过二进制传输数据帧，替代了HTTP/1.1的明文传输。
2. **多路复用**：允许在单个TCP连接上并行发送多个请求和响应，解决了线头阻塞问题，减少了连接数。
3. **服务端推送**：服务器可以主动推送资源，优化了资源内联，提高了效率。
4. **Header压缩**：使用HPACK算法压缩Header，减少了传输数据量。
5. **应用层的重置连接**：通过RST_STREAM帧在不关闭连接的情况下取消请求，提升了连接效率。
6. **请求优先级设置**：允许为不同的流设置优先级，确保关键资源优先加载。
7. **流量控制**：每个流都有自己的流量窗口，控制数据传输，避免了网络拥塞。

由于HTTP/2的这些改进，一些HTTP/1.1中的优化手段，如文件合并、资源内联、雪碧图和域名分片，在HTTP/2中变得不再必要。HTTP/2鼓励将资源细粒化，以提高传输效率。

<details>
<summary>参考答案</summary>

## HTTP/1.1 存在的问题

* TCP 连接数限制

对于同一个域名，浏览器最多只能同时创建 6~8 个 TCP 连接 (不同浏览器不一样)。为了解决数量限制，出现了 域名分片 技术，其实就是资源分域，将资源放在不同域名下 (比如二级子域名下)，这样就可以针对不同域名创建连接并请求，以一种讨巧的方式突破限制，但是滥用此技术也会造成很多问题，比如每个 TCP 连接本身需要经过 DNS 查询、三步握手、慢启动等，还占用额外的 CPU 和内存，对于服务器来说过多连接也容易造成网络拥挤、交通阻塞等，对于移动端来说问题更明显。

* 线头阻塞 (Head Of Line Blocking) 问题

每个 TCP 连接同时只能处理一个请求 - 响应，浏览器按 FIFO 原则处理请求，如果上一个响应没返回，后续请求 - 响应都会受阻。为了解决此问题，出现了 管线化 - pipelining 技术，但是管线化存在诸多问题，比如第一个响应慢还是会阻塞后续响应、服务器为了按序返回相应需要缓存多个响应占用更多资源、浏览器中途断连重试服务器可能得重新处理多个请求、还有必须客户端 - 代理 - 服务器都支持管线化。

* Header 内容多，而且每次请求 Header 不会变化太多，没有相应的压缩传输优化方案

* 为了尽可能减少请求数，需要做合并文件、雪碧图、资源内联等优化工作，但是这无疑造成了单个请求内容变大延迟变高的问题，且内嵌的资源不能有效地使用缓存机制

* 明文传输不安全

## HTTP2 的优势

### 二进制分帧层 (Binary Framing Layer)

帧是数据传输的最小单位，以二进制传输代替原本的明文传输，原本的报文消息被划分为更小的数据帧。

### 多路复用 (MultiPlexing)

在一个 TCP 连接上，我们可以向对方不断发送帧，每帧的 stream identifier 的标明这一帧属于哪个流，然后在对方接收时，根据 stream identifier 拼接每个流的所有帧组成一整块数据。

把 HTTP/1.1 每个请求都当作一个流，那么多个请求变成多个流，请求响应数据分成多个帧，不同流中的帧交错地发送给对方，这就是 HTTP/2 中的多路复用。

流的概念实现了单连接上多请求 - 响应并行，解决了线头阻塞的问题，减少了 TCP 连接数量和 TCP 连接慢启动造成的问题
所以 http2 对于同一域名只需要创建一个连接，而不是像 http/1.1 那样创建 6~8 个连接。

### 服务端推送 (Server Push)

浏览器发送一个请求，服务器主动向浏览器推送与这个请求相关的资源，这样浏览器就不用发起后续请求。
Server-Push 主要是针对资源内联做出的优化，相较于 http/1.1 资源内联的优势:

* 客户端可以缓存推送的资源
* 客户端可以拒收推送过来的资源
* 推送资源可以由不同页面共享
* 服务器可以按照优先级推送资源

### Header 压缩 (HPACK)

使用 HPACK 算法来压缩首部内容

### 应用层的重置连接

对于 HTTP/1 来说，是通过设置 tcp segment 里的 reset flag 来通知对端关闭连接的。这种方式会直接断开连接，下次再发请求就必须重新建立连接。HTTP/2 引入 RST_STREAM 类型的 frame，可以在不断开连接的前提下取消某个 request 的 stream，表现更好。

### 请求优先级设置

HTTP/2 里的每个 stream 都可以设置依赖 (Dependency) 和权重，可以按依赖树分配优先级，解决了关键请求被阻塞的问题

### 流量控制

每个 http2 流都拥有自己的公示的流量窗口，它可以限制另一端发送数据。对于每个流来说，两端都必须告诉对方自己还有足够的空间来处理新的数据，而在该窗口被扩大前，另一端只被允许发送这么多数据。

### HTTP/1 的几种优化可以弃用

合并文件、内联资源、雪碧图、域名分片对于 HTTP/2 来说是不必要的，使用 h2 尽可能将资源细粒化，文件分解地尽可能散，不用担心请求数多

</details>

## 18. HTTP状态码中204和206是什么意思 {#question-subjective-81a846f19eb2}

### 题目要点

HTTP状态码/204/206/NoContent/PartialContent/断点续传/Range请求/响应优化

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握常见 HTTP 状态码的含义和用途
- 对无响应体响应（204）和部分响应（206）的区别是否理解清晰
- 能否结合实际场景（如前端优化、断点续传）准确使用状态码

#### 二、参考答案

##### 1.1 原理说明

HTTP 状态码用于表示客户端请求的响应状态。204 和 206 都是 2xx 成功状态，但用途完全不同：

---

### ✅ 204 No Content（无内容）

- 表示：服务器成功处理了请求，但**没有返回任何内容**。
- 响应体为空，浏览器不会更新页面或跳转。
- 常用于：
  - 表单异步提交成功后无需刷新页面
  - `PUT` 或 `DELETE` 请求处理成功但无需反馈内容
  - 前端轮询心跳请求，不需要返回数据

示例响应头：

```http
HTTP/1.1 204 No Content
Content-Length: 0
````

**注意**：如果响应头中不正确地包含内容（如 JSON），可能导致客户端解析错误。

---

### ✅ 206 Partial Content（部分内容）

* 表示：服务器成功返回了请求资源的一部分（按 `Range` 头部指定）。
* 典型应用场景：

  * 视频、音频、PDF 的**断点续传**
  * 懒加载大文件时按块分段请求
  * 浏览器缓存与 Range 请求配合

请求头示例：

```http
Range: bytes=0-999
```

响应头示例：

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-999/5000
```

**注意**：服务器必须支持 `Range` 请求，且需正确返回 `Content-Range` 和分块内容。

---

##### 1.3 常见误区或面试陷阱

* **误用 204 返回数据**：204 响应体必须为空，不能返回 JSON 或 HTML。
* **不了解 206 与 Range 的关联**：206 只在客户端发起带 Range 的请求时才会触发。
* **以为 206 是错误码**：206 是正常状态，表示部分内容成功返回。

</details>

## 19. CORS 请求中，什么情况下会触发预检请求？ {#question-db3a56f2-6e91-4ce0-bbff-f62cb11fe74f}

> 题库原题：[CORS 请求中，什么情况下会触发预检请求？](https://fe.ecool.fun/topic/db3a56f2-6e91-4ce0-bbff-f62cb11fe74f)

### 题目要点

预检请求是浏览器为安全地处理复杂跨域请求而引入的机制。它主要在非简单请求中被触发，用于确保目标服务器明确允许该跨域请求。通过优化请求方法、请求头以及服务器设置，可以减少不必要的预检请求，从而提升性能和用户体验。

<details>
<summary>参考答案</summary>

在 **CORS** (Cross-Origin Resource Sharing) 请求中，**预检请求（Preflight Request）** 是浏览器为确保跨域安全而发送的一种请求。它使用 `OPTIONS` 方法，在实际请求之前询问目标服务器是否允许这种跨域操作。

---

### **触发预检请求的条件**

预检请求会在以下情况下被触发：

1. **请求方法不属于简单方法**：<br>
   请求方法不在以下列表中时会触发预检请求：
   - `GET`
   - `POST`
   - `HEAD`

2. **请求头包含非简单头**：<br>
   如果请求中使用了自定义头或某些不被认为是“简单头”的 HTTP 请求头，浏览器会触发预检请求。例如：
   - 自定义头，如 `X-Custom-Header`。
   - 非简单头，如 `Content-Type` 设置为以下值之外的类型：
     - `text/plain`
     - `application/x-www-form-urlencoded`
     - `multipart/form-data`

3. **`Content-Type` 非简单类型**：<br>
   当 `Content-Type` 不属于以下简单类型时：
   - `text/plain`
   - `application/x-www-form-urlencoded`
   - `multipart/form-data`

4. **`credentials` 的使用**：<br>
   如果请求设置了跨域凭据标志（`credentials: include`），并且跨域时不符合简单请求规则，也可能触发预检请求。

5. **使用了其他 HTTP 方法**：<br>
   如果使用了如 `PUT`、`DELETE`、`PATCH` 等方法，通常会触发预检请求。

---

### **预检请求的作用**

1. **探测服务器支持的跨域规则**：<br>
   预检请求通过 `OPTIONS` 方法发送，包含浏览器希望执行的跨域请求的相关信息，如：
   - 请求方法
   - 请求头
   - 请求的源站

   服务器需要在响应中明确表明是否允许该跨域请求。

2. **确定跨域安全性**：<br>
   预检请求帮助浏览器在实际发送数据之前验证目标服务器是否允许该操作，以防止潜在的安全威胁。

---

### **预检请求示例**

#### **请求示例**
客户端请求：
```http
OPTIONS /api/resource HTTP/1.1
Host: example.com
Origin: https://my-origin.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-Custom-Header
```

#### **服务器响应**
如果服务器允许跨域，则会返回类似的响应：
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://my-origin.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Max-Age: 3600
```

---

### **如何避免触发预检请求？**

1. **使用简单请求**：
   - 确保使用 `GET`、`POST` 或 `HEAD` 方法。
   - 避免自定义请求头，使用默认的 `Content-Type`（如 `application/x-www-form-urlencoded`）。

2. **优化服务器设置**：
   - 在响应中添加 `Access-Control-Max-Age`，指定预检请求结果的缓存时间（单位为秒），减少频繁的预检请求。例如：
     ```http
     Access-Control-Max-Age: 3600
     ```

3. **合并请求**：
   - 如果可以，将多个复杂请求拆分为简单请求，以减少跨域复杂度。

</details>

## 20. 讲一讲你对前端安全的了解，内容安全策略CSP中有个属性不做拦截只做上报了解吗 {#question-subjective-5aab904197c2}

### 题目要点

前端安全/CSP/XSS防护/CSRF/CSP-Report-Only/内容安全策略/安全头部

<details>
<summary>参考答案</summary>

#### 一、考察点

- 是否掌握前端常见安全攻击类型及防护方法（XSS、CSRF 等）
- 是否理解 CSP（内容安全策略）的核心机制与配置
- 是否了解 CSP 中的 `report-only` 模式的使用场景
- 是否能结合实际项目进行安全策略部署与风险监控

#### 二、参考答案

##### 1.1 原理说明：前端常见安全问题

前端安全通常关注以下几类攻击与防护：

---

**1. XSS（跨站脚本攻击）**

攻击者通过注入恶意脚本控制用户浏览器行为。

防护方式：

- 对用户输入内容进行转义或编码
- 使用 CSP 限制脚本来源和执行方式
- 不使用 `innerHTML` 动态插入用户输入

---

**2. CSRF（跨站请求伪造）**

攻击者伪造用户请求，执行未授权操作。

防护方式：

- 设置 `SameSite` Cookie 策略
- 后端验证 Referer / Origin
- 使用 CSRF Token 做请求验证

---

**3. 点击劫持**

通过嵌套透明 iframe 欺骗用户点击。

防护方式：

- 设置 `X-Frame-Options: DENY` 或 CSP 的 `frame-ancestors` 限制页面嵌套来源

---

##### 1.2 CSP（内容安全策略）

**CSP（Content Security Policy）** 是浏览器支持的安全机制，用于防止 XSS 攻击和资源加载劫持。

CSP 通过设置响应头或 meta 标签控制允许加载的内容来源：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;
````

此策略表示仅允许页面加载自身及受信 CDN 的脚本资源。

---

##### 1.3 `Content-Security-Policy-Report-Only` 的作用

这个是 CSP 中的 **“仅上报不拦截”模式**，主要用于测试或监控：

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

* 浏览器不会拦截不符合策略的资源，而是将违规信息发送到指定接口；
* 常用于部署前评估影响、收集潜在安全风险、调试 CSP；
* 上报内容为 JSON 格式，包含违反策略的 URL、类型、触发源等。

这种方式有助于在不中断功能的情况下观察页面中存在的潜在 CSP 问题。

---

##### 1.4 常见误区或面试陷阱

* **误以为 report-only 会生效阻止加载**：它不会阻止任何资源加载，只做违规上报。
* **忽视 CSP 的维护成本**：过度严格的策略可能造成第三方资源加载失败。
* **不了解 `nonce` 或 `hash` 用法**：CSP 支持为内联脚本设置安全校验，常与构建工具结合自动生成。
* **以为设置 meta 就足够**：实际建议配合响应头设置，安全性更高，避免 HTML 被注入覆盖。

</details>

## 21. 说说 TypeScript 中，有哪些内置的类型方法和工具类型 {#question-6c124a2a-e930-4b13-a339-d9df86d4fea9}

> 题库原题：[说说 TypeScript 中，有哪些内置的类型方法和工具类型](https://fe.ecool.fun/topic/6c124a2a-e930-4b13-a339-d9df86d4fea9)

### 题目要点

TypeScript 内置的类型方法和工具类型非常丰富，主要用于：
1. **映射类型**（如 `Partial`、`Readonly`）：操作属性的可选性、只读性等。
2. **条件类型**（如 `Exclude`、`Extract`）：从联合类型中筛选或剔除类型。
3. **函数工具类型**（如 `Parameters`、`ReturnType`）：获取函数的参数和返回值类型。
4. **字符串类型工具**（如 `Uppercase`、`Capitalize`）：对字符串类型进行变换。

<details>
<summary>参考答案</summary>

## **1. 核心工具类型**
TypeScript 自带的一些通用工具类型，用于在类型系统中执行变换操作：

### **1.1. 映射类型**
- **`Partial<T>`**<br>
  将类型 `T` 的所有属性变为可选属性。<br>
  ```typescript
  type User = { name: string; age: number };
  type PartialUser = Partial<User>; // { name?: string; age?: number }
  ```

- **`Required<T>`**<br>
  将类型 `T` 的所有属性变为必需属性。<br>
  ```typescript
  type User = { name?: string; age?: number };
  type RequiredUser = Required<User>; // { name: string; age: number }
  ```

- **`Readonly<T>`**<br>
  将类型 `T` 的所有属性变为只读属性。<br>
  ```typescript
  type User = { name: string; age: number };
  type ReadonlyUser = Readonly<User>; // { readonly name: string; readonly age: number }
  ```

- **`Record<K, T>`**<br>
  构造一个对象类型，其键是类型 `K` 的属性，值是类型 `T`。<br>
  ```typescript
  type Role = "admin" | "user";
  type Permissions = Record<Role, boolean>; // { admin: boolean; user: boolean }
  ```

- **`Pick<T, K>`**<br>
  从类型 `T` 中选择指定的属性 `K`，构造新的类型。<br>
  ```typescript
  type User = { name: string; age: number; address: string };
  type UserName = Pick<User, "name">; // { name: string }
  ```

- **`Omit<T, K>`**<br>
  从类型 `T` 中剔除指定的属性 `K`，构造新的类型。<br>
  ```typescript
  type User = { name: string; age: number; address: string };
  type UserWithoutAddress = Omit<User, "address">; // { name: string; age: number }
  ```

---

### **1.2. 条件类型**
- **`Exclude<T, U>`**<br>
  从类型 `T` 中剔除可以赋值给 `U` 的类型。<br>
  ```typescript
  type T = "a" | "b" | "c";
  type Excluded = Exclude<T, "a">; // "b" | "c"
  ```

- **`Extract<T, U>`**<br>
  从类型 `T` 中提取可以赋值给 `U` 的类型。<br>
  ```typescript
  type T = "a" | "b" | "c";
  type Extracted = Extract<T, "a" | "b">; // "a" | "b"
  ```

- **`NonNullable<T>`**<br>
  移除类型 `T` 中的 `null` 和 `undefined`。<br>
  ```typescript
  type T = string | null | undefined;
  type NonNullableT = NonNullable<T>; // string
  ```

- **`ReturnType<T>`**<br>
  获取函数 `T` 的返回值类型。<br>
  ```typescript
  type Fn = () => number;
  type Result = ReturnType<Fn>; // number
  ```

- **`InstanceType<T>`**<br>
  获取构造函数类型 `T` 的实例类型。<br>
  ```typescript
  class User {
      name = "John";
  }
  type UserInstance = InstanceType<typeof User>; // User
  ```

---

### **1.3. 工具类型**
- **`Parameters<T>`**<br>
  获取函数 `T` 的参数类型的元组。<br>
  ```typescript
  type Fn = (name: string, age: number) => void;
  type Params = Parameters<Fn>; // [string, number]
  ```

- **`ConstructorParameters<T>`**<br>
  获取构造函数类型 `T` 的参数类型的元组。<br>
  ```typescript
  type Constructor = new (name: string, age: number) => {};
  type Params = ConstructorParameters<Constructor>; // [string, number]
  ```

- **`ThisParameterType<T>`**<br>
  提取函数类型 `T` 的 `this` 参数类型。<br>
  ```typescript
  function fn(this: { x: number }, y: number) {}
  type This = ThisParameterType<typeof fn>; // { x: number }
  ```

- **`OmitThisParameter<T>`**<br>
  从函数类型 `T` 中移除 `this` 参数。<br>
  ```typescript
  function fn(this: { x: number }, y: number) {}
  type Fn = OmitThisParameter<typeof fn>; // (y: number) => void
  ```

---

## **2. 内置的类型工具**

### **2.1. 基本类型辅助工具**
- **`Awaited<T>`**<br>
  获取 `Promise` 的解析值类型。<br>
  ```typescript
  type T = Promise<number>;
  type Resolved = Awaited<T>; // number
  ```

- **`Uppercase<S>` / `Lowercase<S>`**<br>
  转换字符串类型为大写或小写。<br>
  ```typescript
  type Upper = Uppercase<"hello">; // "HELLO"
  type Lower = Lowercase<"WORLD">; // "world"
  ```

- **`Capitalize<S>` / `Uncapitalize<S>`**<br>
  将字符串类型的首字母变为大写或小写。<br>
  ```typescript
  type Cap = Capitalize<"hello">; // "Hello"
  type Uncap = Uncapitalize<"World">; // "world"
  ```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-37/_index.md" >}}) · 已是最后一轮 →
