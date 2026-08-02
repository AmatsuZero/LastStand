+++
title = "阿里巴巴-社招-2年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/62"
experienceId = 62
roundId = 99
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-07-28T12:07:25.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-62/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-62/round-100/index.md" >}}) →

**本轮要点：** react hooks、WeakMap 和 WeakSet

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. ES6相关属性都用过那些 {#question-subjective-fb756a4e7c84}

### 题目要点

* 熟悉 ES6 关键新特性和语法糖
* 了解特性设计目的，提升代码可维护性和性能
* 结合项目场景合理运用，避免滥用带来的副作用
* 使用 ESLint 及 Babel 保证兼容性和规范

<details>
<summary>参考答案</summary>

## 一、考察点

* **全面了解 ES6（ECMAScript 2015）新特性**
* **掌握模块化、变量声明、函数、对象、数组、字符串、类、Promise 等核心特性**
* **能说明特性使用场景、优势及与旧版本对比**
* **具备在项目中合理应用 ES6 特性的能力**

---

## 二、参考答案

### 1.1 变量声明

* `let` 和 `const`：块级作用域，解决 `var` 变量提升和重复声明问题
* 推荐使用 `const` 声明常量，`let` 声明可变变量，避免全局污染

### 1.2 模板字符串（Template Literals）

* 使用反引号 `` ` `` 支持多行字符串和内嵌表达式 `${expr}`
* 替代传统字符串拼接，提升可读性

### 1.3 解构赋值（Destructuring）

* 支持数组和对象解构，简化变量赋值
* 常用于函数参数处理、数据提取

### 1.4 箭头函数（Arrow Functions）

* 简洁函数表达式，自动绑定 `this`
* 不可作为构造函数，不绑定 `arguments`
* 常用于回调和函数简写

### 1.5 扩展运算符（Spread）和剩余参数（Rest）

* 扩展运算符 `...` 用于数组和对象展开
* 剩余参数用于函数参数收集

### 1.6 对象字面量增强

* 属性简写、方法简写、计算属性名
* 支持简洁声明和动态键名

### 1.7 类（Class）

* ES6 引入基于原型的语法糖，支持继承、构造函数、静态方法
* 提升面向对象编程体验

### 1.8 Promise 和异步编程

* 用于异步流程控制，解决回调地狱
* 支持链式调用和错误捕获

### 1.9 模块（Module）

* `import` 和 `export` 语法，支持静态分析和按需加载
* 替代传统的 CommonJS、AMD 模块规范

### 1.10 Symbol 类型

* 新增基本类型，表示独一无二的值
* 常用于定义对象的私有属性和常量

### 1.11 Set 和 Map 数据结构

* Set：无重复元素集合
* Map：键值对集合，键可以是任意类型

### 1.12 Iterator 和 Generator

* 统一遍历接口
* Generator 生成器函数，用于异步流程和惰性计算

### 1.13 其他

* `for...of` 循环：遍历可迭代对象
* 默认参数和函数参数尾逗号
* 数组新增方法如 `Array.from`、`find`、`findIndex`

---

## 三、常见使用场景及优势

| 特性            | 使用场景               | 优势与改进点           |
| ------------- | ------------------ | ---------------- |
| `let`/`const` | 代替 `var`，块级作用域变量声明 | 避免变量提升和作用域污染     |
| 模板字符串         | 拼接复杂字符串和多行文本       | 可读性高，减少错误        |
| 解构赋值          | 参数提取、数组拆包、函数返回值拆分  | 代码简洁，语义清晰        |
| 箭头函数          | 回调函数、简化函数定义        | 自动绑定 `this`，代码更短 |
| 扩展运算符         | 数组合并、对象拷贝          | 简化代码，避免手动循环      |
| Promise       | 异步请求、链式调用          | 解决回调地狱，增强异步流程可读性 |
| 模块化           | 项目拆分、代码复用          | 标准化模块，支持静态分析     |
| Set/Map       | 需要高效查找、去重、键值映射的场景  | 性能优于传统对象和数组      |

---

## 四、常见误区或面试陷阱

#### ❌ 误区一：滥用箭头函数导致 `this` 绑定错误

* 不适合需要动态 `this` 的场景（如对象方法）

#### ❌ 误区二：未充分利用解构赋值，写出冗长代码

* 理解解构赋值提升代码清晰度

#### ❌ 误区三：Promise 误用未捕获异常，导致异常丢失

* 应正确使用 `.catch` 或 `try...catch` 包裹 `async/await`

</details>

## 2. 为什么WeakMap的键必须是对象 {#question-subjective-5fadc194d07e}

### 题目要点

* WeakMap 键必须是对象，因为弱引用机制只能作用于对象
* 对基本类型无法进行弱引用，无法参与垃圾回收机制
* WeakMap 设计用于保存对象私有数据，避免内存泄漏
* 与普通 Map 区别在于弱引用和不可枚举特性

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 WeakMap 的设计初衷和底层实现机制**
* **掌握 WeakMap 与普通 Map 的区别**
* **了解 JavaScript 垃圾回收机制与弱引用的关系**
* **能说明 WeakMap 键限制为对象的技术原因及应用场景**

---

## 二、参考答案

### 1.1 WeakMap 的基本概念

* WeakMap 是一种键为对象，值任意的数据结构
* 与普通 Map 不同，WeakMap 对键对象的引用是“弱引用”
* 当键对象不存在其它引用时，能被垃圾回收器回收，避免内存泄漏

### 1.2 键必须是对象的原因

#### 1）弱引用必须指向对象

* JavaScript 的弱引用机制只能对对象类型生效
* 基本类型（如字符串、数字）是值类型，无法被弱引用追踪和回收

#### 2）垃圾回收机制要求

* 只有对象才存在垃圾回收标记和生命周期管理
* WeakMap 通过弱引用允许键对象在无外部引用时自动回收
* 如果允许基本类型作为键，则无法做到弱引用，违背 WeakMap 设计初衷

#### 3）设计意图和使用场景

* 用于存储与对象相关联的私有数据，避免内存泄漏
* 例如框架中保存某个 DOM 节点的元数据，DOM 节点销毁时对应数据自动释放

---

### 1.3 WeakMap 与 Map 的区别

| 特性    | Map            | WeakMap         |
| ----- | -------------- | --------------- |
| 键类型   | 任意类型           | 只能是对象           |
| 是否可枚举 | 可遍历所有键值        | 不可遍历            |
| 引用强度  | 对键保持强引用，阻止垃圾回收 | 对键保持弱引用，不阻止垃圾回收 |
| 适用场景  | 普通键值映射         | 关联对象私有数据，自动回收   |

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为 WeakMap 可以用基本类型作为键

* 会导致运行时错误，WeakMap 只能接受对象作为键

#### ❌ 误区二：误用 WeakMap 导致内存泄漏

* 忽略 WeakMap 不可遍历特性，误判数据存在与否

</details>

## 3. Map支持哪些非对象键 {#question-subjective-bf18925ca33f}

### 题目要点

* Map 支持所有基本类型和对象作为键
* 包括字符串、数字、布尔值、Symbol、null、undefined
* 与 WeakMap 只能用对象键不同，Map 更灵活
* 理解键类型和对应的行为差异，避免键冲突

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 JavaScript Map 的键类型及其存储机制**
* **掌握 Map 与 WeakMap 键的差异**
* **了解基本类型和对象类型作为键的行为和区别**
* **能说明非对象键在 Map 中的实际使用场景**

---

## 二、参考答案

### 1.1 Map 键的类型支持

* Map 的键可以是任意值，包括基本类型和对象类型
* 支持的非对象键主要包括：

  * **字符串**（`'abc'`）
  * **数字**（如 `123`，注意 `-0` 和 `+0` 被视为相同键）
  * **布尔值**（`true`、`false`）
  * **Symbol**（独一无二的标识符）
  * **`null` 和 `undefined`**

### 1.2 Map 中非对象键的表现

* 与普通对象不同，Map 不会将字符串键转换为字符串类型，它保持键的原始类型
* 例如，`map.set('1', 'a')` 与 `map.set(1, 'b')` 是两个不同的键
* `Symbol` 作为键可以保证唯一性，适用于需要唯一标识的场景

### 1.3 与 WeakMap 的对比

| 特性   | Map           | WeakMap       |
| ---- | ------------- | ------------- |
| 键类型  | 任意类型（基本类型和对象） | 只能是对象         |
| 键的引用 | 强引用           | 弱引用           |
| 可遍历性 | 可遍历所有键值对      | 不可遍历          |
| 适用场景 | 任意键值映射        | 关联对象私有数据，自动回收 |

---

### 1.4 非对象键的使用场景示例

```js
const map = new Map();

map.set('name', 'Alice');      // 字符串键
map.set(42, 'The answer');     // 数字键
map.set(true, 'Yes');          // 布尔键
const sym = Symbol('id');
map.set(sym, 'Unique Symbol'); // Symbol键
map.set(null, 'null value');   // null键
map.set(undefined, 'undef');   // undefined键
```

* 适合用作缓存、状态存储、配置项等需要多类型键的场景

---

### 1.5 常见误区或面试陷阱

#### ❌ 误区一：认为 Map 只能用对象作为键

* Map 支持所有 JavaScript 值作为键，包括基本类型

#### ❌ 误区二：忽略数字与字符串键的区别

* `'1'` 与 `1` 是不同的键，避免混淆

</details>

## 4. React hooks解决了什么问题 {#question-subjective-474c1deddcbb}

### 题目要点

* Hooks 让函数组件支持状态和副作用，替代类组件
* 简化组件逻辑复用，避免复杂 HOC 和 render props
* 消除 `this` 绑定烦恼，提升代码可读性和维护性
* 支持细粒度状态和副作用管理，提高性能和灵活性

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React Hooks 引入的背景和目的**
* **掌握类组件存在的问题及 Hooks 的改进点**
* **了解 Hooks 如何优化组件状态管理和副作用处理**
* **能够结合项目开发说明 Hooks 的实际优势**

---

## 二、参考答案

### 1.1 React Hooks 背景及核心问题

* React 16 之前，状态和副作用只能在类组件中管理，带来若干问题：

  * **组件逻辑复用困难**：需要用高阶组件（HOC）、render props 等模式，导致代码复杂且难维护
  * **组件代码臃肿**：生命周期函数中逻辑分散，难以维护和理解
  * **类组件理解门槛高**：`this` 绑定容易出错，语法繁琐
* 函数组件仅能用于无状态展示，缺乏状态管理能力

### 1.2 Hooks 解决的关键问题

#### 1）函数组件支持状态和副作用

* Hooks 让函数组件拥有了状态（`useState`）、副作用（`useEffect`）等能力
* 函数组件变得功能齐全，写法简洁

#### 2）更好的组件逻辑复用

* 通过自定义 Hook，实现状态逻辑复用，避免 HOC 和 render props 的嵌套和复杂性
* 逻辑关注点聚合，代码可读性和复用性提升

#### 3）消除类组件的复杂性

* 避免 `this` 绑定错误，减少样板代码
* 生命周期函数被副作用 Hook 代替，代码结构更清晰

#### 4）更细粒度的状态和副作用管理

* Hooks 可在组件内按需拆分状态和副作用逻辑
* 提高性能和维护性

---

### 1.3 Hooks 具体功能解决点示例

| 问题               | Hooks 解决方案           | 优势            |
| ---------------- | -------------------- | ------------- |
| 复杂生命周期管理         | `useEffect` 替代多个生命周期 | 统一副作用处理，更直观   |
| 状态逻辑难复用          | 自定义 Hook             | 状态逻辑模块化，易复用   |
| 类组件中 `this` 绑定混乱 | 函数组件无 `this`         | 减少错误，简洁语法     |
| 状态分散，难维护         | 多个 `useState` 管理独立状态 | 细粒度状态管理，增强灵活性 |

---

### 1.4 常见误区或面试陷阱

#### ❌ 误区一：认为 Hooks 只是语法糖

* Hooks 是 React 设计全新状态管理和副作用机制，不只是语法糖

#### ❌ 误区二：误用 Hooks 导致性能问题

* 不合理使用 Hooks（如依赖遗漏）会导致无限渲染或性能下降

#### ❌ 误区三：滥用自定义 Hook 导致代码耦合

* 自定义 Hook 应该专注单一职责，避免逻辑臃肿

</details>

## 5. useEffect底层机制讲一下 {#question-subjective-76e881dd54ce}

### 题目要点

* useEffect 在 DOM 更新后异步执行副作用
* 依赖数组控制副作用的重新执行时机
* 返回清理函数用于资源释放，防止副作用累积
* React 内部分 render 和 commit 阶段管理副作用
* Concurrent Mode 下保证副作用执行一致性

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 useEffect 的核心原理及执行时机**
* **掌握 React 如何管理副作用及清理函数的机制**
* **了解依赖数组对 useEffect 行为的影响**
* **理解 useEffect 在不同渲染阶段的调度流程**

---

## 二、参考答案

### 1.1 useEffect 的核心概念

* `useEffect` 是 React Hook，用于在函数组件中执行副作用操作（如数据获取、事件绑定、DOM 操作等）
* 它模拟类组件的生命周期方法 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount`

### 1.2 useEffect 执行时机

* useEffect 的回调函数在 **浏览器完成 DOM 更新后（commit 阶段）异步执行**
* 这意味着 effect 不阻塞浏览器渲染，保证页面渲染流畅
* 每次渲染完成后，React 会根据依赖变化决定是否执行 effect

### 1.3 依赖数组的作用

* 依赖数组告诉 React 只有当数组中指定的依赖发生变化时，才重新执行 effect
* 如果依赖数组为空 `[]`，则 effect 只在组件挂载时执行一次
* 不传依赖数组，effect 每次渲染后都会执行（类似 componentDidUpdate）

### 1.4 清理函数机制

* useEffect 支持返回一个清理函数
* 清理函数在下一次执行 effect 之前调用，也在组件卸载时调用
* 解决副作用资源释放、事件解绑、定时器清除等问题

### 1.5 React 内部调度机制

* React 在 render 阶段会执行组件函数，收集 effect
* commit 阶段结束后，React 会异步调用所有收集的 effect
* 多个 effect 会按声明顺序执行
* React 保证清理函数在新 effect 执行前运行，保证副作用一致性

### 1.6 Concurrent Mode 下的特殊行为

* 在 React Concurrent Mode（并发模式）下，渲染可能被中断和重启
* useEffect 不会在中断的渲染中执行，保证副作用只在最终渲染完成后执行

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：误以为 useEffect 立即同步执行

* 实际是异步执行，执行时机在 DOM 更新后

#### ❌ 误区二：忽略清理函数导致资源泄漏

* 副作用需要正确清理，避免内存泄漏和事件重复绑定

#### ❌ 误区三：依赖数组写法不完整导致重复执行或遗漏执行

* 依赖项必须完整且稳定，建议配合 ESLint React Hooks 插件使用

</details>

## 6. react渲染后异步执行的具体流程 {#question-subjective-8cb55ee1673a}

### 题目要点

* React 分 Render（可中断）和 Commit（同步）两个阶段
* useEffect 副作用在 Commit 后通过宏任务异步执行
* useLayoutEffect 在 Commit 阶段同步执行，阻塞渲染
* React Fiber 支持任务调度，保证界面响应性能
* 浏览器事件循环负责调度 useEffect 回调执行时机

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React 渲染（Render）和提交（Commit）阶段的区别**
* **掌握 React Fiber 架构中任务调度和更新机制**
* **了解副作用（Effects）如何异步执行及其流程**
* **熟悉 React 如何保证 UI 渲染与副作用执行的顺序与一致性**

---

## 二、参考答案

### 1.1 React 渲染流程概述

React 渲染分为两个主要阶段：

* **Render 阶段（Reconciliation）**

  * 计算 React 元素树的新状态（Fiber 树）
  * 这个阶段可以被中断和恢复，属于纯计算过程，不产生副作用
  * 执行函数组件、计算新的虚拟 DOM，生成新的 Fiber 树

* **Commit 阶段**

  * 将 Render 阶段计算结果同步到真实 DOM
  * 执行副作用，包括 useEffect 回调、生命周期方法、Ref 赋值等
  * 不可中断，必须同步执行完成，保证 UI 与状态一致

---

### 1.2 异步执行副作用的流程（useEffect为例）

1. **Render 阶段收集副作用**

   * React 执行函数组件，遇到 `useEffect`
   * 收集 `useEffect` 的回调函数（effect），但不执行

2. **Commit 阶段 DOM 更新**

   * React 将 Fiber 树的变更应用到真实 DOM，完成界面更新
   * 完成 DOM 变更后，调用所有 `useLayoutEffect` 副作用（同步执行）

3. **浏览器绘制完成后执行 useEffect**

   * `useEffect` 的回调通过浏览器的宏任务异步调用（类似 `setTimeout(fn, 0)`）
   * 这保证页面先渲染完成，再执行副作用，避免阻塞 UI 更新

4. **清理旧副作用**

   * 如果组件更新，先执行上一次 `useEffect` 返回的清理函数
   * 再执行新的 `useEffect` 回调，确保副作用状态一致

---

### 1.3 React Fiber 和调度机制

* React Fiber 将渲染任务拆分为多个小任务，支持任务调度和中断
* Render 阶段可以暂停，优先保证高优先级任务（如用户交互）
* Commit 阶段同步执行，确保副作用与 UI 同步
* useEffect 副作用通过浏览器事件循环的宏任务异步执行，避免阻塞渲染

---

### 1.4 事件循环与 useEffect 执行

* `useEffect` 回调在 Commit 阶段结束后，进入浏览器宏任务队列
* 浏览器完成当前渲染和绘制后，执行宏任务，调用 useEffect 回调
* 保证了页面渲染流畅，副作用不会阻塞界面刷新

---

## 三、常见误区或面试陷阱

#### ❌ 误区一：认为 useEffect 是同步执行

* 实际 useEffect 是异步执行，DOM 已更新，浏览器已绘制后才执行

#### ❌ 误区二：忽略 useLayoutEffect 的存在

* useLayoutEffect 在 Commit 阶段同步执行，优先于 useEffect

#### ❌ 误区三：副作用执行顺序不明确

* React 保证按声明顺序执行所有副作用，避免竞态问题

</details>

## 7. 与useLayoutEffect的渲染阻塞差异 {#question-subjective-9b902625c890}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 8. 实现useDeepEffect {#question-subjective-12c5d7e87526}

```js
// 要求：依赖项深度比对变化后才执行副作用
function useDeepEffect(callback, deps) {
  // 补充实现
}
```

### 题目要点

* React 默认依赖浅比较，深度依赖需自定义比较
* 利用 useRef 保存上次依赖快照
* 使用深度比较函数判断依赖变化
* 变化时才执行副作用，提升性能
* 注意深度比较的性能开销和回调函数的稳定性

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React Hook useEffect 的依赖更新机制**
* **掌握浅比较与深比较的区别及应用场景**
* **能够实现深度比较函数用于复杂依赖项的变化检测**
* **熟悉 React Hook 的状态和引用管理**

---

## 二、参考答案

### 2.1 需求分析

* React 自带的 `useEffect` 依赖项是浅比较（`Object.is`），对象/数组引用改变即触发 effect
* 某些场景下，依赖项为深层对象，浅比较会导致不必要的副作用执行
* 需要自定义 Hook，使用**深度比较**判断依赖是否变化，从而决定是否执行副作用

---

### 2.2 核心思路

* 使用 `useRef` 保存上一次的依赖项快照
* 自定义深度比较函数比较新旧依赖
* 只有深度不相等时，才更新保存的依赖并触发 effect

---

### 2.3 示例代码

```jsx
import { useEffect, useRef } from 'react';

// 简易深度比较函数，适用于常见对象/数组
function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

function useDeepEffect(callback, deps) {
  const prevDepsRef = useRef();

  // 判断依赖是否深度变化
  const hasChanged = !prevDepsRef.current ||
    deps.length !== prevDepsRef.current.length ||
    deps.some((dep, i) => !isDeepEqual(dep, prevDepsRef.current[i]));

  useEffect(() => {
    if (hasChanged) {
      callback();
      prevDepsRef.current = deps;
    }
  }, [hasChanged, callback, deps]);
}
```

---

### 2.4 说明与注意点

* `isDeepEqual` 为简化版深度比较，实际可使用成熟库如 `lodash.isequal` 替代
* 在 `useEffect` 内依赖了 `hasChanged`，保证只有变化时触发副作用
* `prevDepsRef.current` 保存的是上一次的依赖引用
* 该方案适合对复杂对象依赖进行深度监测，避免不必要副作用执行
* 注意：深度比较本身有性能成本，慎重使用，针对性能敏感场景做优化

---

### 2.5 常见误区或面试陷阱

#### ❌ 误区一：直接在依赖数组放复杂对象，期待浅比较生效

* 浅比较只检测引用，复杂对象可能无意义导致频繁触发

#### ❌ 误区二：使用深度比较时忽略性能问题

* 频繁深度比较会导致性能下降，必要时做节流或使用 memo 化

#### ❌ 误区三：未正确处理回调函数引用变化

* `callback` 应用 `useCallback` 包装，避免无谓触发

</details>

## 9. 前端路由如何监听URL变化 {#question-subjective-603e4631f75a}

### 题目要点

* Hash 路由监听用 `hashchange` 事件
* History 路由监听用 `popstate` 事件 + 劫持 `pushState`/`replaceState`
* 劫持时保持原函数执行和上下文
* 结合路由模式选择合适监听方案，确保监听全面且无副作用

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解单页应用（SPA）前端路由的实现原理**
* **掌握 URL 变化的触发机制及监听手段**
* **了解 Hash 路由与 History 路由的区别及监听方法**
* **能结合实际项目说明如何高效捕获路由变化**

---

## 二、参考答案

### 2.1 URL 变化类型及监听方式

#### 1）Hash 变化监听

* URL 中 `#` 号后面的部分改变不会导致页面刷新
* 监听方式：使用浏览器内置的 `hashchange` 事件

```js
window.addEventListener('hashchange', () => {
  console.log('Hash changed to:', location.hash);
});
```

* 适用场景：传统 SPA 路由，兼容性好

#### 2）History 路由变化监听

* 利用 HTML5 History API（`pushState`、`replaceState`）改变 URL，但不会触发页面刷新
* 浏览器没有原生事件监听 `pushState` 和 `replaceState` 的变化
* 需通过**劫持**这两个方法，并监听 `popstate` 事件捕获用户点击浏览器前进后退按钮

```js
// 监听浏览器前进后退事件
window.addEventListener('popstate', () => {
  console.log('History changed to:', location.pathname);
});

// 劫持 pushState 和 replaceState
const originalPushState = history.pushState;
history.pushState = function (...args) {
  originalPushState.apply(this, args);
  window.dispatchEvent(new Event('pushstate'));
  window.dispatchEvent(new Event('locationchange'));
};
const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  originalReplaceState.apply(this, args);
  window.dispatchEvent(new Event('replacestate'));
  window.dispatchEvent(new Event('locationchange'));
};

// 统一监听自定义 locationchange 事件
window.addEventListener('locationchange', () => {
  console.log('URL changed to:', location.pathname);
});
```

* 适用场景：现代 SPA 路由，URL 美观，支持浏览器历史管理

---

### 2.2 路由监听总结

| 路由模式       | URL 变化方式                               | 监听手段                                         | 说明               |
| ---------- | -------------------------------------- | -------------------------------------------- | ---------------- |
| Hash 路由    | 修改 `location.hash`                     | `hashchange` 事件                              | 简单易用，兼容性好        |
| History 路由 | `pushState` / `replaceState` + 浏览器前进后退 | `popstate` + 劫持 `pushState` 和 `replaceState` | URL 干净，无 `#`，更灵活 |

---

### 2.3 常见误区或面试陷阱

#### ❌ 误区一：只监听 `popstate` 事件，忽略了 `pushState` 和 `replaceState` 导致监听不完整

* `popstate` 只监听浏览器历史前进后退，不监听程序调用的 `pushState`、`replaceState`

#### ❌ 误区二：直接重写 `pushState` 导致原有功能失效

* 重写时需用 `apply` 保持原函数上下文和功能

#### ❌ 误区三：误用 `hashchange` 监听 History 路由

* `hashchange` 不触发 History API URL 变化事件，二者互不干扰

</details>

## 10. useRoutes如何实现按需加载？如何避免组件闪动 {#question-subjective-d7648522f57c}

### 题目要点

* useRoutes 结合 React.lazy 实现按需加载
* 使用 Suspense fallback 显示加载状态避免白屏
* 设计合理的骨架屏或占位元素降低闪动感知
* 结合预加载、组件缓存和页面过渡动画优化体验
* 注意避免 fallback 过于简单或缺失导致闪烁

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 React Router 中 useRoutes 的路由配置与动态加载机制**
* **掌握 React 组件的按需加载（代码分割）技术及 Suspense 组件的用法**
* **了解避免组件闪动（闪烁、白屏）常见手段和优化策略**
* **能结合具体场景讲解加载过程及用户体验提升方法**

---

## 二、参考答案

### 2.1 useRoutes 实现按需加载的核心原理

* `useRoutes` 是 React Router v6 的 Hook，用于基于配置数组生成路由对应的组件树
* 通过配合 React 的动态 `lazy` 加载实现按需加载（代码分割）

```jsx
import React, { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

const routes = [
  { path: '/', element: <Home /> },
  { path: 'about', element: <About /> },
];

function App() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<Loading />}>
      {element}
    </Suspense>
  );
}
```

* React 的 `lazy` 会自动拆分代码块，首次访问时才加载对应组件
* `Suspense` 提供加载期间的占位 UI（如转圈、骨架屏）

---

### 2.2 避免组件闪动的常用方案

#### 1）合理设计 Suspense fallback

* fallback 组件应设计成简洁且接近目标页面布局的骨架屏或占位元素
* 避免直接显示空白，降低感知闪烁

#### 2）预加载与缓存

* 结合路由预加载（如 `React.lazy` 预加载函数，或手动触发动态 import）
* 利用浏览器缓存减少重复加载，提升切换速度

#### 3）保持状态或动画过渡

* 使用页面切换动画（如 `react-transition-group`）隐藏加载过程
* 保持上一个页面显示，渐变到新页面，平滑体验

#### 4）避免频繁卸载组件

* 对路由组件做状态缓存（如 `react-router-cache-route`）
* 减少因组件销毁重建引起的闪烁

---

### 2.3 结合 useRoutes 的具体注意点

* `useRoutes` 本身不会缓存组件，切换时会重新挂载目标组件
* 使用 `Suspense` + `lazy` 是实现按需加载的官方推荐方式
* fallback 设计决定了加载感知体验，合理设计很关键
* 对重要路由可采用预加载策略（如用户交互触发或提前加载）

---

### 2.4 代码示例

```jsx
import React, { lazy, Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

const LoadingSkeleton = () => (
  <div style={{ padding: 20, fontSize: 18, color: '#888' }}>加载中...</div>
);

const routes = [
  { path: '/', element: <Home /> },
  { path: 'about', element: <About /> },
];

function App() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {element}
    </Suspense>
  );
}
```

* 在 `LoadingSkeleton` 中可设计更接近页面结构的骨架屏
* 结合预加载可用 `Home.preload = () => import('./Home')` 手动触发加载

---

### 2.5 常见误区或面试陷阱

#### ❌ 误区一：忽略 Suspense fallback，导致白屏闪动明显

* 不设置 fallback，懒加载组件初次加载时无占位，体验差

#### ❌ 误区二：fallback 设计过于简单或与页面差异大

* 产生明显闪烁和布局跳动，影响用户体验

#### ❌ 误区三：忽略组件缓存和动画过渡，切换生硬闪动

* 影响 SPA 的流畅性，降低产品质量感

</details>

## 11. 代码输出结果： {#question-subjective-bcfbca87ab06}

```js
console.log('script start');
setTimeout(() => { console.log('setTimeout') }, 0);
Promise.resolve().then(() => console.log('promise1'));
(async function() {
  console.log('async start');
  await Promise.resolve();
  console.log('async end');
})();
new Promise(resolve => {
  console.log('promise2');
  resolve();
}).then(() => console.log('promise3'));
console.log('script end');
```

### 题目要点

* JS 先执行同步代码
* Promise.then 和 async/await await 后续代码均是微任务
* 微任务先于宏任务执行
* async 函数遇到 await 会暂停，await 后代码变微任务
* setTimeout 回调放宏任务，最后执行

<details>
<summary>参考答案</summary>

## 一、考察点

* **理解 JS 事件循环（Event Loop）中同步代码、宏任务和微任务的执行顺序**
* **掌握 Promise、async/await、setTimeout 等异步机制的调度优先级**
* **分析微任务链与宏任务队列执行的区别**
* **理解 async 函数中 await 对微任务的影响**

---

## 二、参考答案

### 2.1 代码逐行执行流程与输出解释

1. `console.log('script start');`

   * 立即执行，输出：`script start`

2. `setTimeout(() => { console.log('setTimeout') }, 0);`

   * 宏任务，注册一个延时 0ms 的定时器，回调进入宏任务队列，稍后执行

3. `Promise.resolve().then(() => console.log('promise1'));`

   * 创建 resolved Promise，`.then` 注册微任务，微任务队列等待执行

4. 异步 IIFE `(async function() { ... })()` 执行：

   * 立即执行同步部分：`console.log('async start');` 输出：`async start`
   * 执行到 `await Promise.resolve();`，`await` 会暂停当前 async 函数，后续代码（`console.log('async end');`）进入微任务队列

5. `new Promise(resolve => { console.log('promise2'); resolve(); }).then(() => console.log('promise3'));`

   * 创建新 Promise，立即执行同步部分 `console.log('promise2');`，输出：`promise2`
   * `resolve()` 后 `.then()` 注册微任务，等待执行

6. `console.log('script end');`

   * 立即执行，输出：`script end`

---

### 2.2 微任务执行顺序

微任务队列依次执行：

* `promise1` 对应的 `.then` 回调
* async 函数中 `await` 后续代码的微任务，即输出 `async end`
* `promise3` 对应的 `.then` 回调

顺序依照它们注册的先后：

* `promise1` 最早注册
* async 函数的 await 后续代码
* `promise3` 最后注册

因此微任务执行顺序：

* `promise1`
* `async end`
* `promise3`

---

### 2.3 宏任务执行

* 微任务执行完毕后，执行宏任务队列
* 只有一个宏任务，即 `setTimeout` 回调，输出：`setTimeout`

---

## 三、最终输出顺序

```txt
script start
async start
promise2
script end
promise1
async end
promise3
setTimeout
```

---

## 四、总结

| 输出           | 类型  | 说明                    |
| ------------ | --- | --------------------- |
| script start | 同步  | 主线程同步代码首行             |
| async start  | 同步  | async 函数同步部分执行        |
| promise2     | 同步  | 新 Promise 同步执行部分      |
| script end   | 同步  | 同步代码尾部                |
| promise1     | 微任务 | Promise.then 微任务队列第1个 |
| async end    | 微任务 | async 函数 await 后续微任务  |
| promise3     | 微任务 | Promise.then 微任务队列第3个 |
| setTimeout   | 宏任务 | 定时器回调，放宏任务队列末尾        |

</details>

## 12. 算法题：对象结构转换 {#question-subjective-60d8eba0fd67}

```js
// 输入：{ 'A.B.C': 1, 'A.B.D': 2, 'E.F': 3 }
// 输出：{ A: { B: { C: 1, D: 2 } }, E: { F: 3 } }
function transform(obj) {
  // 补充实现
}
```

### 题目要点

* 通过键路径拆分实现多层嵌套赋值
* 逐层检查并创建中间对象，防止覆盖
* 保持原始值在最终路径赋值

<details>
<summary>参考答案</summary>

```js
// 算法题：对象结构转换
// 输入：{ 'A.B.C': 1, 'A.B.D': 2, 'E.F': 3 }
// 输出：{ A: { B: { C: 1, D: 2 } }, E: { F: 3 } }

function transform(obj) {
  const result = {};

  for (const key in obj) {
    const keys = key.split('.'); // 分割键路径
    let current = result;

    // 遍历路径中的每一层
    keys.forEach((k, index) => {
      // 如果是最后一级，赋值
      if (index === keys.length - 1) {
        current[k] = obj[key];
      } else {
        // 如果当前层不存在，初始化为对象
        if (!current[k]) {
          current[k] = {};
        }
        current = current[k];
      }
    });
  }

  return result;
}

// 测试
console.log(transform({ 'A.B.C': 1, 'A.B.D': 2, 'E.F': 3 }));
// 输出：{ A: { B: { C: 1, D: 2 } }, E: { F: 3 } }
```

---

### 说明

* 利用 `split('.')` 将扁平键拆解为路径数组
* 逐层遍历路径，在结果对象中递归创建对应的嵌套对象
* 最后一级路径对应的值直接赋值

---

### 复杂度分析

* 时间复杂度：O(n \* k)，n 为输入对象键数量，k 为最大路径深度
* 空间复杂度：O(n \* k)，用于存储转换后的嵌套对象

---

### 常见误区

* 忽略路径中间层未初始化，导致访问报错
* 直接覆盖对象，导致后续属性丢失
* 未考虑路径中包含空字符串或非法字符（题目简单忽略）

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-62/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-62/round-100/index.md" >}}) →
