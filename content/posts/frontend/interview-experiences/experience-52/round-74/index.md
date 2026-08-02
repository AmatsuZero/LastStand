+++
title = "字节-商业化-社招-4年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/52"
experienceId = 52
roundId = 74
roundOrder = 1
company = "字节跳动"
date = "2025-07-27T09:13:11.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-52/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-52/round-75/index.md" >}}) →

**本轮要点：** 全方位解读this、作用域链与闭包、事件循环、call、apply和bind、前端存储、react hooks、react 渲染机制、React函数组件更新

本轮共 25 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你平常使用的React Hooks {#question-subjective-6827d12cb118}

### 题目要点

* 熟练掌握常用 Hook（useState/useEffect/useRef/useMemo/useCallback/useContext）
* 能结合实际项目说明每个 Hook 的使用动机和实现效果
* 理解 Hook 的核心机制（闭包陷阱、依赖数组规则、执行时机等）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 React Hooks 的基本使用场景及原理<br>
面试官关注候选人是否掌握了常用 Hook 的使用规范与时机。

#### ● 能否结合项目实际表达 Hooks 的应用能力<br>
考察是否具备将 React 函数组件与 Hooks 结合的实际经验与思维能力。

---

### 参考答案

### 一、常用 React Hooks 介绍

#### 1. `useState` —— 管理组件内部状态

- **功能**：定义响应式的本地状态。
- **典型使用场景**：表单输入值、按钮开关、局部 UI 状态等。
- **示例**：

```js
const [count, setCount] = useState(0);
````

---

#### 2. `useEffect` —— 副作用逻辑处理

* **功能**：用于处理副作用逻辑，如数据请求、DOM 操作、订阅事件等。
* **依赖数组决定副作用执行时机**。
* **常见场景**：

  * 页面初始化请求数据（空依赖数组）
  * 监听某个状态变化触发逻辑（依赖项更新）
  * 组件卸载时清理订阅（返回 cleanup 函数）

```js
useEffect(() => {
  const id = setInterval(() => {
    console.log('tick');
  }, 1000);
  return () => clearInterval(id);
}, []);
```

---

#### 3. `useRef` —— 获取 DOM 或存储跨渲染变量

* **功能**：可以持久保存可变值而不触发组件重新渲染；或获取 DOM 元素引用。
* **典型场景**：

  * 保存上一次的值
  * 获取某个 input 元素 DOM
  * 节流、防抖中存储 timer 等

```js
const inputRef = useRef(null);
<input ref={inputRef} />
```

---

#### 4. `useCallback` —— 记忆函数引用避免不必要渲染

* **功能**：缓存函数定义，避免子组件重复渲染（尤其配合 `React.memo`）。
* **场景**：高频定义函数，传递给依赖 props 的子组件，防止因函数引用变化而重新渲染。

```js
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

---

#### 5. `useMemo` —— 记忆计算结果，避免重复计算

* **功能**：缓存一个计算结果，仅当依赖变化时重新计算。
* **场景**：计算复杂值、避免渲染期间每次都重新计算。

```js
const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

---

#### 6. `useContext` —— 读取全局上下文状态

* **功能**：跨组件共享状态（替代 props 层层传递）。
* **场景**：全局主题、登录状态、权限控制等。

```js
const theme = useContext(ThemeContext);
```

---

### 二、结合项目实践讲述

在我参与的多个 React 项目中，我广泛使用了 Hooks 来增强组件逻辑的清晰度和复用性。例如：

* 页面级组件使用 `useEffect` 拉取初始数据。
* 表单组件中使用 `useState` 记录输入值状态。
* 防抖函数用 `useRef` 存定时器。
* 子组件配合 `useCallback` 提升渲染性能。
* 一些全局配置通过 `useContext` 获取配置项如主题色、权限等。
* 对于复杂渲染的组件，利用 `useMemo` 避免不必要的列表重渲染。

</details>

## 2. useEffect空依赖数组的作用？如何避免依赖遗漏 {#question-subjective-34dddb22f16a}

### 题目要点

* 空依赖数组表示副作用只在组件挂载时执行一次
* 正确处理依赖项避免闭包陷阱和状态过期
* 配合 lint 规则和稳定引用避免依赖遗漏

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 `useEffect` 的执行机制和依赖数组的作用<br>
确认候选人是否理解副作用执行时机，能否正确使用依赖数组。

#### ● 理解空依赖数组的特殊含义以及依赖管理的正确方式<br>
验证是否具备避免闭包陷阱、依赖遗漏等常见问题的能力。

---

### 参考答案

### 一、`useEffect` 的依赖数组机制简介

```js
useEffect(() => {
  // 副作用逻辑
}, [dep1, dep2]);
````

* React 会比较依赖数组 `[dep1, dep2]` 与上一次渲染时的值。
* 如果有变更，才会执行副作用函数；否则跳过。
* 如果依赖数组为空 `[]`，表示**只在组件挂载（首次渲染）时执行一次**。

---

### 二、空依赖数组 `[]` 的作用

```js
useEffect(() => {
  console.log('组件挂载时执行一次');
}, []);
```

#### ✅ 等价于 `componentDidMount` 生命周期钩子：

* 用于只执行一次的副作用逻辑，例如初始化请求、订阅事件、定时器等。
* **不会在依赖项变化时重新执行，也不会在状态变化后重复执行。**

#### 注意：

* 虽然只执行一次，但要确保**闭包中的变量是最新值**或可控的静态值，否则容易出现“依赖遗漏”或“闭包陷阱”问题。

---

### 三、如何避免依赖遗漏问题

#### ✅ 推荐做法 1：**使用 ESLint + `eslint-plugin-react-hooks`**

* 开启规则 `react-hooks/exhaustive-deps`。
* 能自动提示遗漏依赖项，防止因手动遗漏造成 bug。

```json
"rules": {
  "react-hooks/exhaustive-deps": "warn"
}
```

#### ✅ 推荐做法 2：**通过 `useCallback` / `useMemo` 固定引用**

* 如果依赖函数、对象引用频繁变动，导致 useEffect 重复执行或难以静态分析，可使用 `useCallback` 或 `useMemo` 缓存引用。

```js
const stableFn = useCallback(() => {
  console.log('something');
}, []);

useEffect(() => {
  stableFn();
}, [stableFn]); // 不会反复触发
```

#### ✅ 推荐做法 3：**封装副作用逻辑**

* 将副作用逻辑封装成独立函数，减少闭包捕获上下文的复杂性。

---

### 四、常见误区与陷阱

| 误区              | 说明                                            |
| --------------- | --------------------------------------------- |
| 忽略依赖数组          | 不加依赖数组，副作用函数每次 render 都会执行，可能性能开销大            |
| 手动指定错误的依赖项      | 人为省略依赖项导致逻辑错乱，变量不是最新值                         |
| 使用空依赖数组但引用了外部状态 | 实际副作用用到了外部 state/props，却没有声明为依赖，会使用过期数据       |
| 对象/函数作为依赖反复变化   | 未用 `useMemo/useCallback` 缓存，导致 useEffect 一直触发 |

---

### 五、总结

* `useEffect(() => {...}, [])` 是**只在组件挂载时执行副作用**的常见模式。
* 使用空依赖需确保副作用逻辑中**不依赖变化的外部状态**。
* 避免遗漏依赖建议借助 lint 工具 + `useMemo/useCallback`。
* 谨慎处理闭包陷阱和依赖变化，保持副作用函数的稳定性和正确性。

</details>

## 3. useMemo和useCallback的区别是什么 {#question-subjective-e13c91036800}

### 题目要点

* 明确 `useMemo` 缓存“值”，`useCallback` 缓存“函数”
* 掌握各自使用场景与目的
* 能结合项目场景讲出实际使用例子
* 避免滥用，配合 `React.memo` 时才体现最大价值

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 `useMemo` 与 `useCallback` 的核心用途和使用差异<br>
判断候选人是否清楚两者的语义、返回值以及使用目的不同。

#### ● 掌握在性能优化中的实际应用场景<br>
考察是否能将其用于防止不必要的重新渲染、函数重复创建等问题。

---

### 参考答案

### 一、定义与作用区别

| Hook         | 定义与返回值                     | 使用目的                           |
|--------------|----------------------------------|------------------------------------|
| `useMemo`    | 返回**计算结果的缓存值**         | **缓存计算值**，避免重复计算        |
| `useCallback`| 返回**函数的缓存引用**           | **缓存函数引用**，避免函数重复创建 |

---

### 二、语法及使用示例

#### ✅ `useMemo` —— 缓存值（用于性能优化）

```js
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
````

* 当 `a` 或 `b` 改变时，重新执行函数计算；否则复用缓存值。
* 常用于避免**复杂计算**重复执行。

---

#### ✅ `useCallback` —— 缓存函数（用于防止函数引用变化）

```js
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

* 返回的是函数的**稳定引用**，适合传递给依赖 `props` 的子组件（如 `React.memo`）。
* 可避免子组件因接收到新的函数引用而重复渲染。

---

### 三、核心区别对比

| 对比维度   | `useMemo`                | `useCallback`     |
| ------ | ------------------------ | ----------------- |
| 返回类型   | 计算结果（值）                  | 函数引用              |
| 使用目的   | 缓存“值”，避免重复计算             | 缓存“函数”，避免重复创建     |
| 使用场景   | 计算开销大时，如复杂循环、过滤等         | 函数作为 props 传递给子组件 |
| 替代方式   | 可以用变量代替（若不依赖 React 生命周期） | 可以用内联函数代替（若不传子组件） |
| 性能优化重点 | 避免不必要的值计算                | 避免子组件因函数引用变化而重新渲染 |

---

### 四、实际应用建议

* **组件性能优化**：`useCallback` 常用于稳定回调函数引用，配合 `React.memo` 使用。
* **列表渲染优化**：`useMemo` 常用于缓存过滤排序后的结果，防止每次渲染都重新计算。
* **避免滥用**：两者是优化工具，不要盲目使用，可能导致**性能开销 > 节省的开销**。

---

### 五、误区与陷阱

| 常见误区                 | 说明                                 |
| -------------------- | ---------------------------------- |
| 混淆两者作用               | `useMemo` 是缓存值，`useCallback` 是缓存函数 |
| 所有函数都用 `useCallback` | 实际上无必要传递给子组件的函数可直接声明               |
| 缓存计算本身就提升性能          | 若计算很轻，反而增加不必要开销                    |
| 忽视依赖项变化导致缓存不更新       | 两者都需正确设置依赖数组，否则使用“旧值”              |

</details>

## 4. 如何避免子组件因父组件重渲染而意外更新 {#question-subjective-16399c71025a}

### 题目要点

* 明确 React 组件更新的触发机制：**props/状态变更会触发重新执行**
* 使用 `React.memo` 避免不必要的子组件更新
* 配合 `useCallback` / `useMemo` 保持传入 props 的引用稳定
* 拆分组件结构，避免全局更新影响局部渲染

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 React 组件的渲染机制与性能优化手段<br>
判断候选人是否清楚 React 的组件更新触发机制以及如何精准控制子组件更新。

#### ● 掌握 `React.memo`、`useCallback`、`useMemo` 等优化工具的正确使用方式<br>
考察能否在实际项目中通过手段避免不必要的重新渲染，提升性能。

---

### 参考答案

### 一、问题背景说明

在 React 中，**函数组件每次父组件更新时都会重新执行**，如果子组件的 `props` 是函数、对象或数组等引用类型，每次 render 都会产生新引用，哪怕值没变，也会被认为 props 变化，从而触发子组件更新。

这可能会导致性能浪费，特别是在子组件渲染复杂或列表很多的情况下。

---

### 二、避免子组件不必要渲染的方案

#### ✅ 1. 使用 `React.memo` 包裹子组件（浅对比 props）

```js
const Child = React.memo(({ name }) => {
  console.log('Child render');
  return <div>{name}</div>;
});
````

* `React.memo` 会比较 props 的浅层变化，如果相同则跳过渲染。
* 适用于纯渲染组件（无副作用）。

---

#### ✅ 2. 使用 `useCallback` 缓存函数 props

```js
const handleClick = useCallback(() => {
  doSomething();
}, [/*依赖*/]);

<Child onClick={handleClick} />
```

* 避免函数每次 render 时引用变化。
* 搭配 `React.memo` 的子组件非常有效。

---

#### ✅ 3. 使用 `useMemo` 缓存对象或数组 props

```js
const options = useMemo(() => {
  return [{ label: 'A' }, { label: 'B' }];
}, [/*依赖*/]);

<Child options={options} />
```

* 对象/数组类型的 props，必须用 `useMemo` 保持稳定引用。

---

#### ✅ 4. 拆分组件结构，保持局部更新

* 将静态内容、长列表等从频繁更新的父组件中抽离为独立组件。
* 使用组合代替嵌套，减少无关组件重渲染。

---

#### ✅ 5. 搭配开发工具分析重渲染来源

* 使用 React DevTools 或 `why-did-you-render` 等工具分析是否由于 props 改变或组件内部状态引起了不必要的更新。

---

### 三、示例演示

```js
const Child = React.memo(({ name, onClick }) => {
  console.log('Child render');
  return <button onClick={onClick}>{name}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <>
      <Child name="Click Me" onClick={handleClick} />
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </>
  );
}
```

* 父组件 `setCount` 触发重新渲染
* 子组件使用 `React.memo` + `useCallback`，不会因为 `onClick` 变化而重新渲染

---

### 四、常见误区与陷阱

| 误区                  | 说明                               |
| ------------------- | -------------------------------- |
| ❌ 忘记使用 `React.memo` | 即使缓存函数，props 对比仍然认为子组件变化         |
| ❌ 未使用 `useCallback` | 每次 render 生成新函数，导致子组件 props 改变   |
| ❌ 忽略对象/数组 props 变化  | 即使内容一样，引用地址变了也会触发子组件更新           |
| ❌ 滥用优化手段            | 如果组件轻量或 render 成本低，不需要强行 memo 优化 |

---

### 五、总结

* 子组件因父组件渲染意外更新的核心原因是 **props 引用变化**。
* 使用 `React.memo` 可跳过无必要渲染；配合 `useCallback` / `useMemo` 保证 props 引用稳定。
* 优化目标应针对**中重型子组件**，并配合性能分析工具精确定位。

</details>

## 5. 如何自定义一个Hook（如useFetch）？需考虑哪些边界情况 {#question-subjective-2945ab0af2c2}

### 题目要点

* 自定义 Hook 是逻辑复用的核心机制，需使用 `use` 前缀。
* `useFetch` 通常包含 `loading`、`error`、`data` 状态，以及 `refetch` 方法。
* 关键边界处理包括：中断请求、错误捕获、避免竞态、参数变化等。
* 通过抽象提升代码复用性，同时保持 Hook 单一职责清晰。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解自定义 Hook 的语法、封装思路与复用意义<br>
确认候选人是否掌握自定义 Hook 的编写规范、用途和场景。

#### ● 是否具备处理异步逻辑、状态管理、边界清理的能力<br>
考察候选人能否处理常见异常、竞态请求、组件卸载等复杂情况。

---

### 参考答案

### 一、什么是自定义 Hook？

- **自定义 Hook 是对 React 内部 Hook 的封装与组合**，用于复用组件逻辑。
- 命名规范：必须以 `use` 开头，且只能在函数组件或其他 Hook 中调用。
- 自定义 Hook 本质上是一个普通的 JS 函数，内部可以使用 `useState`、`useEffect`、`useRef` 等 React Hook。

---

### 二、以 `useFetch` 为例 —— 实现一个封装数据请求的 Hook

```js
import { useState, useEffect, useRef } from 'react';

function useFetch(url, options = {}, auto = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auto && url) {
      fetchData();
    }

    return () => {
      // 清理中断请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
````

---

### 三、核心设计要点与边界处理

#### ✅ 1. **避免组件卸载后状态更新**

* 使用 `AbortController` 中断请求，防止请求完成后执行 `setState` 报错或内存泄漏。

#### ✅ 2. **防止重复请求与竞态条件**

* 通过唯一请求 ID 或 abort 控制，避免并发请求状态被后来的请求覆盖。

#### ✅ 3. **错误捕获与展示**

* `try/catch` 包裹异步逻辑，记录 `error`，由组件决定展示方式。

#### ✅ 4. **支持手动刷新和自动加载**

* 设置 `auto` 参数控制是否组件加载即请求，同时返回 `refetch` 方法支持手动调用。

#### ✅ 5. **参数变化触发重新请求**

* 依赖 `url`，当地址变化时重新触发请求。

#### ✅ 6. **缓存处理（可选）**

* 可基于 `Map` 或其他机制实现缓存逻辑，避免重复加载相同数据。

---

### 四、使用示例

```js
function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useFetch(`/api/user/${userId}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>刷新</button>
    </div>
  );
}
```

---

### 五、常见误区与陷阱

| 误区                  | 说明                           |
| ------------------- | ---------------------------- |
| ❌ 异步请求未中断，组件卸载后更新状态 | 会导致控制台 warning 或内存泄漏         |
| ❌ 不捕获异常，接口失败时页面崩溃   | 必须有 `try/catch` 和 error 状态处理 |
| ❌ 缓存/重复请求问题未考虑      | 数据来源重复或依赖变化引发不必要请求           |
| ❌ Hook 逻辑太重或参数耦合过高  | 建议职责单一、参数解耦，便于复用与测试          |

</details>

## 6. 如何实现请求取消 {#question-subjective-4d552862637d}

### 题目要点

* 请求取消可使用原生 `AbortController`，推荐用于 fetch 和 axios
* 组件卸载时应取消未完成请求以避免副作用
* 需处理取消后的错误判断，防止 UI 更新错误
* Axios 老版本 `CancelToken` 已废弃，应使用原生替代方案

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器请求生命周期和取消机制<br>
考察候选人是否掌握如何优雅地在请求进行中取消它，防止无效响应或资源浪费。

#### ● 掌握请求取消的具体实现方式<br>
包括使用 `AbortController`、取消 token、拦截器等方式。

---

### 参考答案

### 一、为什么需要取消请求？

- **防止组件卸载后仍然调用 `setState`，引发内存泄漏或控制台警告**
- **防止快速切换页面或条件变更时，前一次请求结果覆盖后一次数据**
- **节省带宽资源，提升用户体验**

---

### 二、主流实现方式

#### ✅ 方法一：使用原生 `AbortController`（推荐）

- `AbortController` 是原生 Web API，支持标准的 fetch 请求取消。

```js
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/user', { signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    }
  });

// 取消请求
controller.abort();
````

* 可用于组件卸载时自动取消：

```js
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal });

  return () => {
    controller.abort(); // 组件卸载时取消
  };
}, []);
```

---

#### ✅ 方法二：Axios 的取消机制（基于 CancelToken，已废弃，需自行封装）

> Axios 6.x 版本已推荐使用 `AbortController` 替代 `CancelToken`。

老版本用法如下：

```js
const source = axios.CancelToken.source();

axios.get('/api/data', {
  cancelToken: source.token,
})
.catch(thrown => {
  if (axios.isCancel(thrown)) {
    console.log('请求取消', thrown.message);
  }
});

// 取消请求
source.cancel('请求被取消');
```

---

#### ✅ 方法三：配合封装的请求管理工具进行批量控制（如 request-id）

可为每个请求添加唯一标识符，维护请求池，在切换页面时取消未完成的请求。

```js
const requestMap = new Map();

function cancellableFetch(url, key) {
  const controller = new AbortController();
  requestMap.set(key, controller);
  return fetch(url, { signal: controller.signal });
}

function cancelRequest(key) {
  requestMap.get(key)?.abort();
  requestMap.delete(key);
}
```

---

### 三、注意的边界问题

| 边界问题           | 应对方式                            |
| -------------- | ------------------------------- |
| 多个请求同时发起怎么管理   | 使用 `Map` 存储多个 controller        |
| 组件卸载后是否还在请求    | 在 `useEffect` 的清理函数中取消请求        |
| 用户主动切换页签       | 在路由跳转时统一取消请求                    |
| 请求取消后 UI 是否还更新 | 请求失败时要检测是否是 `AbortError` 决定是否更新 |

---

### 四、使用场景总结

| 场景             | 描述                          |
| -------------- | --------------------------- |
| 表单联动搜索（实时查询）   | 每次输入发请求，应取消上一次未完成请求         |
| 页面快速切换或离开      | 离开前取消请求，避免无效响应              |
| 路由变化时需要中止旧数据请求 | 在路由 `beforeEach` 或组件卸载中处理取消 |

</details>

## 7. 发布订阅模式与观察者模式有何区别 {#question-subjective-1b5394edddfc}

### 题目要点

* 理解两种模式的核心结构及职责划分
* 能从“是否解耦”、“是否中介”两个维度区分
* 能结合 Vue、EventBus、Redux 等项目应用作类比
* 不机械记忆概念，能解释“为什么使用发布订阅而不是观察者”

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解两种设计模式的基本定义与核心结构<br>
确认候选人是否能分清二者的机制、参与角色及使用方式。

#### ● 理解两者在实际应用中的差异与联系<br>
考察能否结合具体应用场景（如事件总线、Vue响应式、消息中心）说明其适用性。

---

### 参考答案

### 一、基本概念解释

#### ✅ 观察者模式（Observer Pattern）

- **定义**：对象之间一对多依赖关系，**被观察者（Subject）状态变化时，主动通知所有观察者（Observers）更新**。
- **特点**：被观察者**直接持有观察者引用**，通知是**同步、主动**触发的。

```js
class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notify(data) {
    this.observers.forEach(o => o.update(data));
  }
}

class Observer {
  update(data) {
    console.log('更新收到：', data);
  }
}
````

---

#### ✅ 发布订阅模式（Pub-Sub Pattern）

* **定义**：通过**事件中心（调度器/中介者）解耦发布者与订阅者**，发布者发布事件，订阅者注册感兴趣的事件，由事件中心统一管理调度。
* **特点**：**发布者和订阅者互不感知**，事件中心中转，支持异步通知。

```js
class EventBus {
  constructor() {
    this.events = {};
  }

  subscribe(event, fn) {
    (this.events[event] ||= []).push(fn);
  }

  publish(event, data) {
    (this.events[event] || []).forEach(fn => fn(data));
  }
}
```

---

### 二、对比维度详细分析

| 对比维度   | 观察者模式                 | 发布订阅模式                             |
| ------ | --------------------- | ---------------------------------- |
| 中间媒介   | ❌ 没有中间媒介，观察者直接注册到目标对象 | ✅ 有事件中心或调度器做中介                     |
| 关系结构   | **一对多**，观察者依赖被观察者     | **多对多**，发布者和订阅者完全解耦                |
| 通知方式   | 被观察者主动调用观察者的方法（同步）    | 发布者通知事件中心，事件中心异步/同步广播              |
| 解耦性    | 耦合度较高（直接调用观察者）        | 解耦良好，适合复杂架构和分布式系统                  |
| 应用典型场景 | Vue2 响应式系统、DOM 事件绑定等  | Vue 的事件总线、Node.js 的 EventEmitter 等 |

---

### 三、结合实际项目说明

#### Vue 2 的响应式系统（观察者模式）：

* 数据变化会触发依赖它的 watcher 更新；
* `Dep` 是被观察者，`Watcher` 是观察者；
* 每次 `data.xxx` 变化都会主动通知观察者。

#### Vue/React 中的 EventBus / Redux / 自定义消息中心（发布订阅模式）：

* 各组件通过事件中心注册事件或触发事件，彼此不需要知道对方是谁；
* 适用于兄弟组件通信、模块间解耦。

---

### 四、常见误区与陷阱

| 误区             | 说明                    |
| -------------- | --------------------- |
| 将两者等同视之        | 虽然结构相似，但解耦程度与参与角色不同   |
| 发布订阅也会直接通知订阅者  | 发布订阅者之间不直接通信，是中介转发    |
| 观察者模式一定是同步的    | 通常是同步，但也可以异步实现        |
| 事件中心只是“多余一层封装” | 实则是核心设计，使系统具备可扩展性和解耦性 |

---

### 五、总结

| 特点   | 观察者模式       | 发布订阅模式    |
| ---- | ----------- | --------- |
| 是否解耦 | ❌（耦合）       | ✅（完全解耦）   |
| 是否中介 | ❌（无）        | ✅（事件中心）   |
| 触发方式 | 主动通知        | 事件广播      |
| 通知时机 | 多为同步        | 可异步       |
| 典型应用 | Vue响应式、MVVM | 消息系统、事件总线 |

</details>

## 8. 实现once功能 {#question-subjective-1285948c1fab}

### 题目要点

* 能写出正确闭包结构 + 状态标记的实现
* 明确函数只运行一次并缓存第一次结果
* 能列出实际使用场景如事件绑定/初始化
* 可处理边界与异常情况（如类型判断）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解闭包与函数执行上下文<br>
确认候选人是否掌握闭包原理、作用域保留机制。

#### ● 掌握高阶函数封装能力<br>
考察是否能封装一个只执行一次的函数，并理解函数调用控制的思想。

#### ● 代码鲁棒性与边界处理能力<br>
是否能正确处理参数传递、返回值、多次调用、错误场景等。

---

### 参考答案

### 一、题目要求说明

实现一个 `once(fn)` 函数，使传入的 `fn` 只会被调用一次，后续再次调用返回第一次的执行结果，不再执行原始函数体。

```js
const runOnce = once((a, b) => {
  console.log('running');
  return a + b;
});

runOnce(2, 3); // 输出 running，返回 5
runOnce(4, 5); // 不再输出 running，仍返回 5
````

---

### 二、实现思路与代码示例

```js
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      result = fn.apply(this, args);
      called = true;
    }
    return result;
  };
}
```

#### ✅ 核心要点解释：

* 使用闭包保存 `called` 状态和第一次的 `result`
* 使用 `apply` 绑定上下文并传参，兼容更多使用场景
* 确保函数体只在第一次执行时运行，后续都返回缓存值

---

### 三、扩展场景与应用举例

#### 📌 使用场景 1：事件绑定防止重复

```js
const bindOnce = once(() => {
  window.addEventListener('scroll', handleScroll);
});
bindOnce(); // 绑定成功
bindOnce(); // 无效
```

#### 📌 使用场景 2：初始化操作（如只初始化一次 SDK）

```js
const initSDK = once(() => {
  console.log('SDK Initialized');
});
```

---

### 四、进阶优化与类型校验（可选）

```js
function once(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }

  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      result = fn.apply(this, args);
      called = true;
    }
    return result;
  };
}
```

---

### 五、常见误区与陷阱

| 误区        | 说明                                                   |
| --------- | ---------------------------------------------------- |
| 忘记缓存返回值   | 只防止了函数重复执行，但未返回第一次执行结果                               |
| 没有保留执行上下文 | 使用 `fn(args)` 而非 `fn.apply(this, args)`，导致 `this` 错误 |
| 传入非函数时未处理 | 最好加上类型校验提升健壮性                                        |

---

### 六、总结

* `once` 是闭包 + 状态持久化的典型应用
* 核心点在于只执行一次原始函数体并缓存返回值
* 常用于初始化、事件绑定、资源懒加载等场景
* 优秀实现应具备**参数透传、上下文兼容、类型校验**

</details>

## 9. MVC和MVVM的核心差异是什么 {#question-subjective-2b4b107c3eb4}

### 题目要点

* 能准确描述 MVC 和 MVVM 的职责划分与数据流动
* 强调 MVVM 的双向绑定核心优势
* 能结合 Vue、React 框架进行类比说明
* 对比视图更新机制、代码组织方式和解耦效果

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解前端架构模式的基本原理<br>
判断候选人是否掌握 MVC 和 MVVM 各自的设计思想和职责划分。

#### ● 能准确比较两种模式的本质区别<br>
重点考察是否理解 View 与 Model 的耦合方式，以及数据流动方向的不同。

#### ● 能结合实际开发框架理解其背后采用的架构模式<br>
例如 React/Vue 属于哪种范式，其运作机制是否符合 MVC/MVVM 理念。

---

### 参考答案

### 一、MVC 和 MVVM 是什么？

#### ✅ MVC（Model-View-Controller）

- **Model**：负责业务数据与逻辑处理
- **View**：界面呈现层，显示数据
- **Controller**：用户输入与操作的调度中心，控制 View 和 Model 的交互

数据流动：<br>
`用户操作 → Controller → 操作 Model → Model 通知 View → View 渲染更新`

---

#### ✅ MVVM（Model-View-ViewModel）

- **Model**：数据模型（通常来自后端 API）
- **View**：用户界面
- **ViewModel**：桥梁，负责连接 Model 和 View，**通过双向绑定同步数据**

数据流动：<br>
`Model ←→ ViewModel ←→ View`

---

### 二、核心差异对比

| 对比点           | MVC                                 | MVVM                                      |
|------------------|--------------------------------------|-------------------------------------------|
| 架构理念         | 三层分离，强调控制器的职责              | 双向绑定，强调状态同步                    |
| 数据流方向       | 单向（用户触发 Controller 控制更新）    | 双向（数据变化与视图变化互相驱动）        |
| 视图更新机制     | View 由 Controller 显式更新             | View 与 ViewModel 自动双向同步            |
| 控制权位置       | Controller 负责调度和业务协调            | ViewModel 负责状态绑定，控制逻辑相对较少 |
| 典型框架         | AngularJS（早期）、后端 Java MVC 模式等  | Vue、Knockout、Angular（后期）            |
| 开发体验         | 需要手动操作 DOM 或调用更新方法         | 更偏声明式开发，数据驱动 UI               |

---

### 三、实例举例说明

#### ✅ MVC 场景示意

```js
// Controller 接收事件并更新 Model
button.onclick = function () {
  controller.handleClick();
};

controller.handleClick = function () {
  model.count++;
  view.render(model.count);
};
````

* 用户点击按钮（View）
* Controller 接管逻辑，修改 Model
* 调用 View 更新 UI

---

#### ✅ MVVM 场景示意（Vue）

```html
<input v-model="name" />
<p>{{ name }}</p>
```

```js
data() {
  return {
    name: ''
  }
}
```

* 用户修改 input，数据自动更新（View → ViewModel）
* 数据变更自动反映在视图中（ViewModel → View）
* 无需手动调用任何更新方法，**框架自动完成响应式同步**

---

### 四、常见误区与陷阱

| 误区                        | 说明                                      |
| ------------------------- | --------------------------------------- |
| 以为 MVVM 就是比 MVC 多一个 VM    | 实际上是**数据驱动理念 + 双向绑定机制的结合**              |
| 以为 React 是 MVVM 框架        | React 实为**单向数据流**的 MV\*架构，不属于 MVVM      |
| 以为 Controller = ViewModel | Controller 是调度中心，ViewModel 是数据中介，两者职责不同 |

---

### 五、实际应用分析

| 框架      | 模式类别        | 说明                        |
| ------- | ----------- | ------------------------- |
| Vue     | MVVM        | 核心是响应式数据 + v-model 双向绑定   |
| React   | 自定义范式       | 类似 MV\*，但强调**单向数据流**和函数组件 |
| Angular | 类 MVVM（带注解） | 提供双向绑定 + DI + 控制器等组合能力    |

---

### 六、总结

* **MVC**：结构清晰、控制逻辑明确，但视图更新需手动调用，适用于复杂控制逻辑
* **MVVM**：响应式驱动 UI，适用于**以界面状态为核心**的现代 Web 应用，代码更简洁
* 实际项目中可灵活组合：如 React 项目中引入 Controller-like 层处理业务逻辑

</details>

## 10. React是否属于MVVM {#question-subjective-5060b4a6fd93}

### 题目要点

* React 并不属于传统 MVVM 架构：**无 ViewModel、无自动双向绑定**
* React 倾向于函数式、组件化、**单向数据流**
* Vue 是典型的 MVVM，适合状态与 UI 强绑定场景
* React 的优势在于灵活、可控、与业务逻辑深度融合
* 如果在 React 中封装表单绑定、自动状态管理，也**可以模拟出 MVVM 行为**，但不推荐

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 MVVM 架构核心思想与应用特征<br>
确认候选人是否清楚什么是“真正”的 MVVM 架构，MVVM 的三层职责分工，以及双向绑定机制的本质。

#### ● 判断 React 的架构特征与 MVVM 的异同<br>
考察是否能从数据流、状态管理、UI 更新机制等角度判断 React 是否符合 MVVM。

---

### 参考答案

### 一、什么是 MVVM？

MVVM（Model-View-ViewModel）是一种界面开发架构模式，特点如下：

- **Model**：数据模型层，通常由 API 或业务逻辑提供。
- **View**：视图层，负责展示 UI。
- **ViewModel**：视图模型层，连接 Model 与 View，通过双向绑定实现状态同步。

**核心机制：双向数据绑定**<br>
用户修改 UI 会自动更新数据，数据变化也会自动更新 UI —— 框架自动处理绑定和渲染。

---

### 二、React 的核心特征

| 特性                  | 描述                                                  |
|-----------------------|-------------------------------------------------------|
| 数据流                | 明确的**单向数据流（unidirectional data flow）**     |
| 状态更新              | 通过 `setState` 或 `useState` 手动更新状态           |
| 视图更新              | 状态变更后，由 React 触发重新渲染视图                 |
| 双向绑定              | 不内建支持（需手动绑定事件处理函数）                 |
| ViewModel 概念        | 没有 ViewModel 层，组件本身集成状态和逻辑处理        |

#### 示例对比：

**Vue (MVVM)**

```html
<input v-model="username" />
<p>{{ username }}</p>
````

**React (非 MVVM)**

```jsx
<input value={username} onChange={e => setUsername(e.target.value)} />
<p>{username}</p>
```

👉 React 需要**手动设置 value 和 onChange**，Vue 则通过 `v-model` 自动实现双向绑定。

---

### 三、React 属于 MVVM 吗？

**结论：不属于传统意义上的 MVVM。**

#### ❌ 不属于 MVVM 的原因：

* 没有 ViewModel 概念，组件既负责视图，又处理业务逻辑
* 状态更新需要开发者主动调用 `setState` 或 `useState`
* **数据是单向流动的**，从父组件传入 props，不能反向修改
* 不具备自动的双向绑定机制（除非人为封装）

#### ✅ 但具备 MVVM 的某些理念：

* **组件化** —— 组件将视图与状态绑定在一起
* **声明式视图渲染** —— UI 由状态驱动更新
* **数据响应式** —— 虽非自动，但状态更新立即触发视图变化

---

### 四、实际项目开发中如何理解？

| 特性      | Vue（MVVM）  | React（MV\*）                 |
| ------- | ---------- | --------------------------- |
| 架构范式    | 明确 MVVM 架构 | 更偏向 View + State + Logic 组合 |
| 状态与视图绑定 | 自动绑定，双向数据流 | 手动绑定，单向数据流                  |
| UI 驱动方式 | 声明式 + 数据绑定 | 声明式 + 手动事件处理                |
| 控制反转    | 框架掌控状态逻辑   | 开发者掌控更新逻辑和数据变更路径            |

</details>

## 11. 工厂模式讲一下。工厂模式与依赖注入(DI)有何关联 {#question-subjective-35259c7a81fa}

### 题目要点

* 明确工厂模式的“创建者”角色和依赖注入的“提供者”角色
* 能说出两者的区别和联系，并能举例说明实际协作方式
* 理解设计模式与架构思想的层次差异
* 能结合前端框架或项目中的具体实践加以说明

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解设计模式中工厂模式的概念与应用场景<br>
考察候选人是否理解工厂模式的核心思想、目的及其在实际开发中的价值。

#### ● 掌握依赖注入（DI）的概念及实现方式<br>
考察对 DI 解耦思想的理解，及其与工厂模式的关系。

#### ● 能结合两者进行对比与关联分析<br>
看是否能理解两者在架构设计中的协作与区别。

---

### 参考答案

### 一、什么是工厂模式？

#### 1.1 定义

- **工厂模式（Factory Pattern）** 是一种创建型设计模式，旨在定义一个创建对象的接口，由子类决定实例化哪一个类。它使得类的实例化推迟到子类进行，达到解耦和扩展的目的。

#### 1.2 作用

- 将对象的创建逻辑从使用者中分离出来，用户不直接使用 `new`，而是通过工厂方法获取实例。
- 方便对产品族进行管理和扩展。
- 隐藏复杂对象的创建细节。

---

### 二、工厂模式的实现示例

```js
// 产品接口及具体产品
class Car {
  drive() { console.log('开车'); }
}
class Bike {
  drive() { console.log('骑自行车'); }
}

// 工厂类
class VehicleFactory {
  static createVehicle(type) {
    switch(type) {
      case 'car': return new Car();
      case 'bike': return new Bike();
      default: throw new Error('未知交通工具');
    }
  }
}

// 使用
const vehicle = VehicleFactory.createVehicle('car');
vehicle.drive(); // 开车
````

---

### 三、什么是依赖注入（DI）？

#### 3.1 定义

* 依赖注入是一种设计思想，强调将组件的依赖关系由外部传入（注入），而非由组件自己创建。
* 目的是降低组件间的耦合度，提高模块的可测试性和可维护性。

#### 3.2 形式

* 构造函数注入、属性注入、接口注入等。

---

### 四、工厂模式与依赖注入的关联

| 维度   | 工厂模式               | 依赖注入（DI）           |
| ---- | ------------------ | ------------------ |
| 关注点  | **负责创建对象**         | **负责提供对象（依赖）**     |
| 目的   | 解耦对象创建，封装实例化逻辑     | 解耦组件间依赖关系，提升灵活性    |
| 实现方式 | 使用工厂类或方法返回对象实例     | 通过容器或框架注入对象依赖      |
| 使用关系 | 工厂模式可作为 DI 的实现手段之一 | DI 可能借助工厂或容器完成依赖管理 |
| 设计层次 | 偏向创建型设计模式          | 是一种架构设计理念，包含多种实现方案 |

---

### 五、举例说明两者协作

* **工厂模式** 负责统一管理和创建对象实例，隐藏复杂实例化过程。
* **依赖注入** 将工厂或其他实例作为依赖注入给使用者，避免使用者直接 new。

例如在 React 组件中：

```js
// 工厂函数
function createLogger(level) {
  return {
    log: (msg) => console[level](msg)
  };
}

// 依赖注入
function App({ logger }) {
  logger.log('应用启动');
  return <div>App</div>;
}

// 注入
const logger = createLogger('info');
ReactDOM.render(<App logger={logger} />, root);
```

---

### 六、常见误区与陷阱

| 误区                | 说明                          |
| ----------------- | --------------------------- |
| 认为工厂模式和依赖注入是同一个概念 | 两者目标不同：工厂关注对象创建，DI 关注依赖关系管理 |
| 依赖注入一定需要工厂模式      | DI 可直接注入实例，也可通过工厂等多种方式实现    |
| 工厂模式会增加代码复杂度      | 适度使用可提升代码解耦和扩展性，但滥用反而繁琐     |

---

### 七、总结

* **工厂模式** 是面向对象中用来“创建对象”的设计模式，强调封装创建逻辑。
* **依赖注入** 是一种架构设计理念，强调“依赖的提供和管理”，关注对象之间的解耦。
* 工厂模式可以作为依赖注入的一种实现方式，但 DI 范畴更广泛。
* 两者结合可有效提升系统的可扩展性、灵活性和测试性。

</details>

## 12. 实现EventEmitter类（含on/emit/off/once）。如何避免内存泄漏 {#question-subjective-a8f9f92c9359}

### 题目要点

* 实现 `on/emit/off/once`，结构清晰且代码健壮
* 说明 `once` 的自动解绑机制
* 解释内存泄漏产生的根本原因是监听器未解绑导致的引用未释放
* 给出实际防范措施，如主动解绑、组件销毁清理、使用弱引用等

<details>
<summary>参考答案</summary>

### 考察点

#### ● 掌握事件发布-订阅机制<br>
考察候选人是否理解事件监听、触发与移除的原理。

#### ● 编写健壮的事件管理类<br>
能实现常见的事件绑定（on）、触发（emit）、解绑（off）、只触发一次（once）方法。

#### ● 理解内存泄漏产生原因及防范手段<br>
考察对事件监听器管理的意识和释放机制。

---

### 参考答案

---

### 一、EventEmitter 类实现

```js
class EventEmitter {
  constructor() {
    // 事件名 -> 监听函数数组
    this.events = new Map();
  }

  // 订阅事件
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
  }

  // 触发事件，传入参数给监听函数
  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (!listeners) return false;

    // 复制一份，防止监听函数中调用 off 导致数组变化
    listeners.slice().forEach(listener => {
      listener.apply(this, args);
    });
    return true;
  }

  // 解绑事件
  off(event, listener) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      // 若无监听函数，清理事件名
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
  }

  // 只触发一次的事件监听
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}
````

---

### 二、代码说明

* **this.events** 用 `Map` 保存事件及对应的监听器列表
* `on`：添加事件监听器
* `emit`：触发事件，通知所有监听器
* `off`：移除指定事件的指定监听器，且自动清理空监听列表
* `once`：封装一个只执行一次的监听器，执行后自动解绑

---

### 三、避免内存泄漏的方法

| 漏洞点                | 解决方案                            |
| ------------------ | ------------------------------- |
| 监听器未解绑，事件绑定过多累积    | 1. 主动调用 `off` 解绑不再使用的监听器        |
|                    | 2. 对于临时监听，优先使用 `once`           |
| 持有大量闭包，阻止垃圾回收      | 1. 手动清理事件及监听器引用                 |
|                    | 2. 事件触发函数中避免长时间持有外部状态引用         |
| 长时间存活的全局事件或跨组件事件总线 | 1. 页面卸载或组件销毁时统一清理事件监听           |
|                    | 2. 使用弱引用（WeakMap、WeakRef）(高级用法) |

---

### 四、实际开发中注意点

* **合理设计事件生命周期**，避免无限期绑定事件
* **组件销毁时应解绑事件**，防止悬挂引用
* **避免在事件回调里创建大量闭包，防止内存泄漏**
* **对复杂项目可实现事件监听器数量限制，提示警告**

</details>

## 13. 手写解析URL函数，返回协议、主机、路径、参数对象等 {#question-subjective-099b0bf02688}

### 题目要点

* 清晰拆解 URL 结构
* 用字符串方法和数组操作解析各部分
* 构建查询参数对象，支持编码处理
* 代码可读且鲁棒，考虑边界情况

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 URL 结构及组成部分<br>
考察对 URL 各部分（协议、主机、端口、路径、查询参数、hash）的熟悉程度。

#### ● 字符串处理和正则表达式能力<br>
考察是否能用字符串方法或正则高效解析 URL。

#### ● 构建参数对象的能力<br>
考察对查询字符串解析成对象的理解与实现。

---

### 参考答案

### 一、URL 组成简述

一个典型 URL 结构：

```

协议://主机:端口/路径?查询参数#哈希

```

例：

```

[https://www.example.com:8080/path/to/page?name=alice\&age=20#section1](https://www.example.com:8080/path/to/page?name=alice&age=20#section1)

````

---

### 二、手写解析函数示例

```js
function parseURL(url) {
  const result = {
    protocol: '',
    host: '',
    port: '',
    path: '',
    query: {},
    hash: ''
  };

  // 1. 协议分割
  const protocolSplit = url.split('://');
  if (protocolSplit.length > 1) {
    result.protocol = protocolSplit[0];
    url = protocolSplit[1];
  }

  // 2. 取出hash
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    result.hash = url.slice(hashIndex + 1);
    url = url.slice(0, hashIndex);
  }

  // 3. 取出query
  const queryIndex = url.indexOf('?');
  let queryStr = '';
  if (queryIndex !== -1) {
    queryStr = url.slice(queryIndex + 1);
    url = url.slice(0, queryIndex);
  }

  // 4. 取出host和端口，剩余是路径
  // host 可能含端口，用 / 分割，第一个 / 之前是 host:port
  const firstSlash = url.indexOf('/');
  if (firstSlash !== -1) {
    result.host = url.slice(0, firstSlash);
    result.path = url.slice(firstSlash);
  } else {
    result.host = url;
    result.path = '/';
  }

  // 5. host拆分端口
  if (result.host.includes(':')) {
    const [host, port] = result.host.split(':');
    result.host = host;
    result.port = port;
  }

  // 6. 解析query参数字符串成对象
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        // decodeURIComponent 防止编码问题
        result.query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    });
  }

  return result;
}
````

---

### 三、示例测试

```js
const url = 'https://www.example.com:8080/path/to/page?name=alice&age=20#section1';

console.log(parseURL(url));
/* 输出：
{
  protocol: "https",
  host: "www.example.com",
  port: "8080",
  path: "/path/to/page",
  query: { name: "alice", age: "20" },
  hash: "section1"
}
*/
```

---

### 四、常见误区与注意点

| 误区          | 说明                               |
| ----------- | -------------------------------- |
| 只拆分协议，不处理端口 | 端口号也是主机信息的一部分，需要拆分               |
| query参数不解码  | 参数可能被编码，需要 decodeURIComponent 处理 |
| 未考虑无路径情况    | URL 可能无路径，默认路径应为 `/`             |
| hash 未处理    | # 后面的部分需要单独提取                    |

---

### 五、总结

* 手写解析主要靠字符串分割和索引查找
* 注意协议、hash、query、host、端口、路径各自边界
* query 参数需拆分键值并解码
* 代码逻辑清晰、健壮，可处理绝大多数常见 URL

</details>

## 14. 如何处理含特殊字符的查询参数 {#question-subjective-c511377d841a}

### 题目要点

* 理解特殊字符导致的问题（语法破坏、安全风险）
* 熟练使用 `encodeURIComponent` 和 `decodeURIComponent`
* 知道编码必须对“键”和“值”分别操作
* 注意编码和解码的正确时机与范围

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 URL 编码规范<br>
考察对 URL 编码（百分号编码）的认识及其在查询参数中的必要性。

#### ● 熟悉编码解码 API<br>
考察是否掌握 `encodeURIComponent` 和 `decodeURIComponent` 的使用。

#### ● 能正确处理查询参数的拼接与解析<br>
考察是否能防止特殊字符导致的解析错误或安全隐患。

---

### 参考答案

### 一、特殊字符为何需要处理？

- 查询参数中可能包含空格、中文、`&`、`=`、`+`、`%` 等特殊字符，这些字符在 URL 中有特殊含义或不合法。
- 如果直接拼接，会导致 URL 结构被破坏，解析错误，甚至出现安全风险（如注入攻击）。
- 因此，必须对参数名和值进行编码，确保传输安全和准确。

---

### 二、核心处理方法

#### 2.1 编码查询参数

- 使用 `encodeURIComponent()` 对参数的**键和值**分别编码。

示例：

```js
const params = {
  name: '张三 & 李四',
  city: '北京/Shanghai',
  info: 'a=1&b=2'
};

const queryString = Object.entries(params)
  .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
  .join('&');

console.log(queryString);
// 输出: name=%E5%BC%A0%E4%B8%89%20%26%20%E6%9D%8E%E5%9B%9B&city=%E5%8C%97%E4%BA%AC%2FShanghai&info=a%3D1%26b%3D2
````

#### 2.2 解析查询参数

* 使用 `decodeURIComponent()` 对 URL 中的查询参数进行解码。

示例：

```js
const raw = 'name=%E5%BC%A0%E4%B8%89%20%26%20%E6%9D%8E%E5%9B%9B&city=%E5%8C%97%E4%BA%AC%2FShanghai';
const params = {};

raw.split('&').forEach(pair => {
  const [key, val] = pair.split('=');
  params[decodeURIComponent(key)] = decodeURIComponent(val);
});

console.log(params);
// 输出: { name: "张三 & 李四", city: "北京/Shanghai" }
```

---

### 三、特殊注意点

| 注意点                                | 说明                                    |
| ---------------------------------- | ------------------------------------- |
| 使用 encodeURIComponent，不用 encodeURI | `encodeURI` 不会编码 `&`、`=` 等参数分隔符，导致错误。 |
| 解码时要保证参数完整，防止解码报错                  | 需要先判断参数是否存在，避免对空或异常字符串调用解码            |
| 对参数值为数组或对象时需序列化                    | 例如 JSON.stringify 后再编码，避免结构丢失         |
| 避免对整个查询字符串直接解码                     | 只对参数名和值分别解码，防止误解码 `&` 和 `=` 符号        |

---

### 四、总结

* 查询参数的特殊字符必须通过 `encodeURIComponent` 进行编码，避免 URL 语法冲突。
* 解析时要用 `decodeURIComponent` 还原原始值，保证数据准确性。
* 编码解码是前后端数据交互中必不可少的步骤，防止乱码和安全隐患。
* 处理复杂参数时需结合序列化与编码，确保传输和解析正确。

</details>

## 15. 修改函数this指向的三种方法。箭头函数的this能否被修改 {#question-subjective-b5893c9166ac}

### 题目要点

| 方法      | 是否立即执行 | 参数传递方式    | this 是否可改动 | 适用场景                 |
| ------- | ------ | --------- | ---------- | -------------------- |
| `call`  | 是      | 参数列表      | 是          | 需要立即调用并传递多个参数时       |
| `apply` | 是      | 参数数组      | 是          | 参数已是数组形式时更方便         |
| `bind`  | 否      | 参数列表（可预设） | 是          | 需要延迟调用，固定 this 或做柯里化 |
| 箭头函数    | —      | —         | 否          | 需要继承外层 this，避免动态绑定   |

* 理解 `call`、`apply`、`bind` 的异同和用法
* 明确箭头函数 this 是静态绑定，不能被修改
* 结合实例说明箭头函数与传统函数 this 行为差异

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 JavaScript 中 this 的动态绑定机制<br>
考察候选人是否清楚函数调用时 this 指向的动态变化。

#### ● 掌握常见修改 this 的方法及用法区别<br>
包括 `call`、`apply`、`bind` 三种函数方法。

#### ● 理解箭头函数的 this 绑定机制及限制<br>
考察是否知道箭头函数的 this 绑定不可被修改的特性。

---

### 参考答案

### 一、修改函数 this 指向的三种方法

#### 1. `call`

- **语法**：`fn.call(thisArg, arg1, arg2, ...)`
- **功能**：立即调用函数，指定函数内部的 `this` 指向为 `thisArg`，参数逐个传入。
- **特点**：执行函数，传参用逗号分隔。

```js
function greet(age) {
  console.log(this.name + ', ' + age);
}

const obj = { name: 'Alice' };
greet.call(obj, 25); // 输出：Alice, 25
````

---

#### 2. `apply`

* **语法**：`fn.apply(thisArg, [argsArray])`
* **功能**：与 `call` 类似，立即调用函数，指定 `this`，参数以数组形式传入。
* **特点**：传参以数组形式传递，适合参数已存在数组的情况。

```js
greet.apply(obj, [25]); // 输出：Alice, 25
```

---

#### 3. `bind`

* **语法**：`const boundFn = fn.bind(thisArg, arg1, arg2, ...)`
* **功能**：不立即调用，返回一个绑定了指定 `this` 的新函数，后续调用该函数时 `this` 固定。
* **特点**：创建新函数，支持函数柯里化。

```js
const boundGreet = greet.bind(obj, 25);
boundGreet(); // 输出：Alice, 25
```

---

### 二、箭头函数的 this 特性

* 箭头函数没有自己的 `this`，它的 `this` **继承自定义它的上下文环境（即定义时所在的作用域）**。
* 因此，**无法通过 `call`、`apply`、`bind` 修改箭头函数的 this**，这些方法传入的 `thisArg` 会被忽略。
* 箭头函数适合用作不需要动态 this 绑定的场景，避免因 this 绑定混乱导致错误。

```js
const obj = { name: 'Alice' };
const arrowFn = () => {
  console.log(this.name);
};

arrowFn.call(obj); // 输出：undefined（或全局对象的 name）
```

</details>

## 16. 实现二栏布局（左侧固定200px，右侧自适应） {#question-subjective-79f5533543b4}

### 题目要点

* 明确左侧固定宽度，右侧自适应宽度的需求
* 熟练掌握 flex 布局实现方式，优先推荐
* 理解其他方案的使用场景和缺点
* 代码结构清晰，考虑高度和溢出处理

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 CSS 布局基础<br>
考察对盒模型、宽度计算及布局方式（浮动、Flexbox、Grid 等）的掌握。

#### ● 掌握多种实现方案<br>
考察是否知道传统方案与现代方案的区别与优势。

#### ● 代码实现与兼容性考虑<br>
考察代码可读性、易维护性及浏览器兼容性。

---

### 参考答案

### 一、实现目标

- 左侧栏宽度固定 200px
- 右侧栏宽度自适应，撑满剩余空间
- 两栏并排显示，高度可根据内容自适应

---

### 二、实现方式及示例代码

#### 1. 使用 Flexbox（推荐）

```html
<div class="container">
  <div class="sidebar">左侧固定200px</div>
  <div class="content">右侧自适应</div>
</div>
````

```css
.container {
  display: flex;
  width: 100%;
  height: 100vh; /* 或根据需求设置高度 */
}

.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  /* 可选：固定高度或撑满父容器 */
}

.content {
  flex: 1; /* 自适应占满剩余空间 */
  background-color: #fff;
  overflow: auto; /* 内容溢出时显示滚动条 */
}
```

**说明：**

* `.container` 设为 `flex` 容器，默认主轴水平排列。
* `.sidebar` 宽度固定为 200px。
* `.content` 使用 `flex:1`，自动填满剩余空间。

---

#### 2. 使用 CSS Grid

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  width: 100%;
  height: 100vh;
}

.sidebar {
  background-color: #f0f0f0;
}

.content {
  background-color: #fff;
  overflow: auto;
}
```

---

#### 3. 传统浮动法（兼容旧浏览器）

```css
.sidebar {
  float: left;
  width: 200px;
  background-color: #f0f0f0;
  height: 100vh;
}

.content {
  margin-left: 200px; /* 避开左侧浮动 */
  background-color: #fff;
  height: 100vh;
  overflow: auto;
}
```

---

### 三、总结

| 方案       | 优点           | 缺点                |
| -------- | ------------ | ----------------- |
| Flexbox  | 简洁、语义清晰、适应性强 | IE10 以下支持有限       |
| CSS Grid | 灵活强大，布局更丰富   | 部分老浏览器支持不完全       |
| 浮动布局     | 兼容性好，传统方案    | 需要清除浮动，代码较复杂，灵活性差 |

</details>

## 17. BOM与DOM的核心区别是什么？window.location属于哪部分？如何重定向 {#question-subjective-518db7a3f473}

### 题目要点

- 清晰区分 BOM 与 DOM 概念和作用范围。<br>
- 明确 `window.location` 属于 BOM，掌握其属性及方法。<br>
- 讲出重定向的三种常用方式及区别。<br>
- 结合代码示例说明使用场景。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器对象模型（BOM）与文档对象模型（DOM）的区别<br>
考察对浏览器和页面结构的抽象理解。

#### ● 熟悉 window 对象及其常用属性、方法<br>
考察对浏览器全局对象的认识及其作用。

#### ● 掌握页面重定向的实现方法<br>
考察是否了解常见的页面跳转手段及区别。

---

### 参考答案

### 一、BOM 与 DOM 的核心区别

| 维度        | BOM（Browser Object Model）               | DOM（Document Object Model）           |
|-------------|------------------------------------------|----------------------------------------|
| 定义        | 浏览器提供的与页面无关的对象模型          | 表示 HTML/XML 文档的对象模型             |
| 关注点      | 浏览器窗口、浏览器控件、浏览器环境          | HTML 文档结构及内容元素的树形结构          |
| 作用范围    | 控制浏览器行为，如地址栏、历史、窗口大小等  | 操作文档内容、结构和样式                  |
| 主要对象    | `window`、`navigator`、`screen`、`location`、`history` 等 | `document` 对象及其子节点                 |
| 与页面关系  | 独立于具体页面，控制浏览器功能              | 依赖页面结构，操作页面 DOM 元素             |

---

### 二、window.location 属于哪部分？

- `window.location` 是 **BOM（浏览器对象模型）** 的一部分。<br>
- 它表示当前浏览器窗口的 URL 信息，包括协议、主机、路径、查询字符串等。<br>
- 提供对地址栏 URL 的读取和操作能力。

---

### 三、如何使用 window.location 实现重定向？

常用方式如下：

| 方法                          | 说明                                               | 示例                         |
|-------------------------------|----------------------------------------------------|------------------------------|
| `window.location.href = url`  | 直接赋值，页面跳转到新 URL，历史记录保留           | `window.location.href = 'https://example.com'` |
| `window.location.assign(url)` | 同 `href`，跳转新页面，历史记录保留                 | `window.location.assign('https://example.com')` |
| `window.location.replace(url)`| 替换当前页面，不保留当前页面在历史记录（无法回退）   | `window.location.replace('https://example.com')` |
| `window.location.reload()`     | 重新加载当前页面                                   | `window.location.reload()`    |

---

### 四、总结

- **BOM 关注浏览器环境和控制，DOM 关注页面文档结构**。<br>
- `window.location` 是 BOM 的核心接口，用于获取和设置当前页面 URL。<br>
- 页面重定向主要通过修改 `location.href` 或调用 `location.assign` 实现，若不希望保留历史记录，则使用 `location.replace`。

</details>

## 18. 事件循环中宏任务与微任务 {#question-subjective-e677a54aad51}

### 题目要点

* 宏任务包含整体代码执行、定时器回调、UI 渲染等；微任务包括 Promise 回调、MutationObserver 等。
* 每轮事件循环中先执行一个宏任务，再执行该宏任务产生的所有微任务，再进行渲染和下一轮宏任务。
* 微任务优先级高，保证异步操作的回调能尽快执行。
* 理解该机制有助于编写高性能、响应迅速的异步代码。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 JavaScript 单线程异步执行机制<br>
考察事件循环（Event Loop）的基本概念及其运行流程。

#### ● 掌握宏任务（Macro-task）和微任务（Micro-task）的区别和执行顺序<br>
考察对任务调度优先级及浏览器行为的理解。

#### ● 能结合实际示例解释任务执行顺序和场景应用

---

### 参考答案

### 一、事件循环（Event Loop）概述

- JavaScript 是单线程语言，异步操作通过事件循环机制实现非阻塞执行。
- 事件循环不断地从任务队列中取任务执行。

---

### 二、宏任务与微任务定义及区别

| 维度           | 宏任务（Macro-task）                    | 微任务（Micro-task）                     |
|----------------|----------------------------------------|------------------------------------------|
| 任务来源       | 定时器（setTimeout/setInterval）、I/O、UI渲染、script整体代码等 | Promise.then、MutationObserver、process.nextTick(Node.js) |
| 执行时机       | 每轮事件循环（tick）开始时执行            | 每轮事件循环中，当前宏任务执行完成后执行，执行完所有微任务才开始下一宏任务 |
| 优先级         | 优先级较低                             | 优先级高，保证微任务先于下一个宏任务执行  |
| 作用           | 执行主要代码块和异步任务                  | 处理异步结果回调、DOM变动观察等更快反馈   |

---

### 三、事件循环流程简述

1. 执行全局同步代码（属于宏任务）<br>
2. 宏任务执行完毕，执行当前微任务队列，直到微任务清空<br>
3. 浏览器执行渲染更新（如果需要）<br>
4. 开始下一轮宏任务循环，重复上述步骤

---

### 四、示例解析

```js
console.log('script start');

setTimeout(() => {
  console.log('setTimeout'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');  // 微任务
}).then(() => {
  console.log('promise2');  // 微任务
});

console.log('script end');
````

**执行顺序分析：**

* `script start` 立即执行（全局宏任务）
* `script end` 立即执行（全局宏任务）
* 执行微任务队列：

  * 输出 `promise1`
  * 输出 `promise2`
* 执行宏任务队列中 `setTimeout` 回调：

  * 输出 `setTimeout`

**最终输出顺序：**

```
script start
script end
promise1
promise2
setTimeout
```

</details>

## 19. setTimeout(fn, 0)和Promise.resolve().then(fn)的执行顺序 {#question-subjective-ca5044451a07}

### 题目要点

* 明确 `setTimeout` 是宏任务，`Promise.then` 是微任务
* 微任务先于同轮宏任务后续执行
* 结合代码示例说明执行顺序，强调事件循环中的调度机制
* 了解这一点有助于优化异步代码的执行效率与响应时机

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解宏任务（Macro-task）与微任务（Micro-task）调度机制<br>
考察对 JavaScript 事件循环中任务队列优先级的掌握。

#### ● 能够区分异步 API 的执行时机差异<br>
考察对不同异步操作在事件循环中的位置认知。

---

### 参考答案

### 一、基本结论

- `setTimeout(fn, 0)` 产生的回调属于 **宏任务**（Macro-task）队列。<br>
- `Promise.resolve().then(fn)` 产生的回调属于 **微任务**（Micro-task）队列。<br>
- 微任务的执行优先级高于宏任务，在当前执行栈清空后、下一轮宏任务执行前执行。

---

### 二、执行顺序详解

假设代码如下：

```js
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('end');
````

执行过程：

1. 执行同步代码
   输出：`start` → `end`
2. 同步代码执行完毕，开始执行微任务队列
   输出：`promise`
3. 微任务执行完毕，开始下一轮事件循环，执行宏任务队列中的回调
   输出：`timeout`

最终输出顺序：

```
start
end
promise
timeout
```

---

### 三、总结

| API                        | 任务类型 | 执行时机              |
| -------------------------- | ---- | ----------------- |
| `Promise.resolve().then()` | 微任务  | 当前宏任务执行完立即执行      |
| `setTimeout(fn, 0)`        | 宏任务  | 当前宏任务和所有微任务执行完后执行 |

* 微任务的优先级高于宏任务
* 事件循环机制保证微任务在宏任务之间执行，避免延迟回调响应

</details>

## 20. Cookie/LocalStorage/SessionStorage的异同 {#question-subjective-c1e8c032e336}

### 题目要点

- 清晰区分三者生命周期、容量、访问方式和安全性。<br>
- 说明 Cookie 的请求携带特性及安全属性（HttpOnly、Secure）。<br>
- 掌握何时用 LocalStorage、何时用 SessionStorage。<br>
- 能结合实际需求给出合理存储方案建议。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器端常用存储机制<br>
考察对三种常用存储方式的基本特性和区别的掌握。

#### ● 掌握存储容量、生命周期、作用域及安全性<br>
考察对数据持久化需求与安全控制的认识。

#### ● 能结合实际场景合理选择使用方案

---

### 参考答案

### 一、三者基本介绍

| 存储类型         | Cookie                      | LocalStorage                  | SessionStorage                 |
|------------------|-----------------------------|------------------------------|-------------------------------|
| 存储位置         | 浏览器自动管理，随请求发送   | 浏览器本地存储，不随请求发送  | 浏览器本地存储，不随请求发送   |
| 容量大小         | 约4KB（每个Cookie大小限制） | 5MB 以上（因浏览器不同而异） | 5MB 以上                      |
| 生命周期         | 设置有效期，可持久保存       | 永久保存，除非主动清除        | 会话级，窗口关闭即清除         |
| 作用域           | 域名 + 路径                 | 域名（同源）                  | 域名 + 窗口/标签页（同源）     |
| 访问方式         | `document.cookie`           | `window.localStorage`         | `window.sessionStorage`        |
| 是否随请求发送   | 是                          | 否                           | 否                            |
| 支持数据类型     | 只能存字符串（可编码JSON）  | 只能存字符串（可编码JSON）   | 只能存字符串（可编码JSON）    |

---

### 二、详细异同点解析

#### 1. 生命周期及作用域差异

- **Cookie**：可以通过设置 `expires` 或 `max-age` 指定过期时间，默认会话结束（浏览器关闭）即失效。<br>
- **LocalStorage**：永久保存，除非手动清除或浏览器清理缓存。<br>
- **SessionStorage**：数据仅在当前浏览器窗口或标签页生命周期内有效，窗口关闭即清除。

#### 2. 存储容量

- Cookie 存储容量受限（一般 4KB），适合存少量简单数据（如会话标识）。<br>
- LocalStorage 和 SessionStorage 容量大（一般 5MB 及以上），适合存储较大数据。

#### 3. 请求携带情况

- Cookie 会随每次 HTTP 请求自动携带发送（受域名、路径、Secure、HttpOnly 等限制）。<br>
- LocalStorage 和 SessionStorage 不会随请求发送，仅供客户端读取。

#### 4. 安全性

- Cookie 支持设置 `HttpOnly`，防止 JavaScript 访问，提高安全性。<br>
- LocalStorage 和 SessionStorage 只能被 JS 访问，存在 XSS 风险。

---

### 三、使用场景示例

| 存储方式       | 典型使用场景                                   |
|----------------|-----------------------------------------------|
| Cookie         | 用户登录凭证（带 HttpOnly）、跨页面会话管理     |
| LocalStorage   | 长期保存用户偏好配置、离线缓存数据             |
| SessionStorage | 单页面会话状态管理、临时表单数据保存           |

---

### 四、总结

- **Cookie**：轻量，随请求发送，支持过期时间，安全设置较多，适合身份认证和服务端交互。<br>
- **LocalStorage**：大容量，永久存储，客户端使用，适合持久化用户设置。<br>
- **SessionStorage**：类似 LocalStorage，但生命周期受限于标签页，适合临时会话数据。

</details>

## 21. 如何实现跨标签页数据同步 {#question-subjective-55f105dbd392}

### 题目要点

* 明确跨标签页通信需求和局限
* 熟练掌握 `localStorage` + `storage` 事件实现方法
* 理解 BroadcastChannel 的优势和适用条件
* 能根据需求选择合适方案并说明理由

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解浏览器多标签页/窗口间通信机制<br>
考察对跨页面通信方案及其原理的掌握。

#### ● 掌握常见跨标签页同步技术及优缺点<br>
考察事件监听、存储事件、广播通道等多种方案。

#### ● 能结合场景合理选择实现方案

---

### 参考答案

### 一、跨标签页数据同步需求背景

- 浏览器中多个标签页或窗口同时打开同一站点时，页面状态、用户操作或数据需要同步更新。
- 例如，多个标签页登录状态变化、购物车数据更新等场景。

---

### 二、常见实现方案

#### 1. `localStorage` 事件监听

- 浏览器支持 `storage` 事件，其他标签页在修改 `localStorage` 时，会触发该事件。
- 通过监听该事件实现数据同步。

**示例代码：**

```js
// A 标签页写数据并通知其他标签页
localStorage.setItem('syncData', JSON.stringify({ time: Date.now(), value: '更新数据' }));

// 其他标签页监听事件
window.addEventListener('storage', (event) => {
  if (event.key === 'syncData') {
    const newData = JSON.parse(event.newValue);
    console.log('接收到同步数据', newData);
    // 执行对应的更新逻辑
  }
});
````

**特点：**

* 简单、兼容性好（支持大多数现代浏览器）
* 仅跨同源标签页有效
* 事件只在其他标签页触发，当前标签页修改不会触发

---

#### 2. BroadcastChannel API

* 新兴的跨标签页通信接口，允许同源的多个浏览器上下文（标签页、iframe、worker）之间直接通信。

**示例代码：**

```js
// 创建频道
const channel = new BroadcastChannel('my_channel');

// 发送消息
channel.postMessage({ type: 'sync', data: '更新数据' });

// 接收消息
channel.onmessage = (event) => {
  console.log('收到广播消息:', event.data);
  // 处理数据同步
};
```

**特点：**

* 实时、简单，API 设计清晰
* 仅限现代浏览器支持（需兼容性检查）
* 不依赖存储机制，支持多种上下文间通信

---

#### 3. SharedWorker

* 允许多个同源浏览器上下文共享一个 Worker，实现更复杂的通信和状态共享。

**特点：**

* 适合复杂业务逻辑
* 兼容性较差，使用较少

---

#### 4. 轮询/服务器推送

* 标签页通过定时轮询或 WebSocket 与服务器通信，间接实现数据同步。

**特点：**

* 实现复杂、网络消耗大
* 适用于跨设备跨浏览器同步

---

### 三、总结与最佳实践

| 方案               | 优点            | 缺点              | 适用场景         |
| ---------------- | ------------- | --------------- | ------------ |
| `localStorage`事件 | 简单，兼容性好       | 当前标签页不触发事件，功能有限 | 简单数据同步，广泛支持  |
| BroadcastChannel | API 简洁，实时性强   | 兼容性较新           | 现代浏览器环境，实时通信 |
| SharedWorker     | 支持复杂通信，状态共享   | 兼容性差，复杂度高       | 复杂跨标签页协作     |
| 轮询/WebSocket     | 跨设备跨浏览器，实时性可控 | 网络开销大，复杂度高      | 跨客户端数据同步     |

</details>

## 22. 为什么Reducer必须是纯函数 {#question-subjective-c27205f9b140}

### 题目要点

* 定义纯函数及其特性
* 解释 Reducer 在状态管理中的作用
* 说明纯函数对可预测性、调试、状态不可变的影响
* 列举违反纯函数原则的示例及正确写法
* 强调副作用的分离设计

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解纯函数的定义及特性<br>
考察对函数式编程思想中“纯函数”概念的掌握。

#### ● 掌握 Redux 或类似状态管理中 Reducer 的设计原则<br>
考察对状态管理模式和数据不可变性的理解。

#### ● 理解纯函数对状态预测性、可维护性和调试的意义

---

### 参考答案

### 一、纯函数的定义

- **纯函数**是指：对于相同的输入，永远返回相同的输出，且没有任何副作用（不修改外部状态、不依赖外部可变数据）。<br>
- 纯函数不产生任何 I/O 操作、异步操作或随机数等影响结果的行为。

---

### 二、Reducer 的角色及设计要求

- Reducer 是负责根据**旧状态**和**动作（action）**生成**新状态**的函数。<br>
- 它是 Redux 等状态管理框架的核心，管理应用的状态变更。<br>
- 必须是纯函数才能保证状态变化的**可预测性和可追踪性**。

---

### 三、为什么 Reducer 必须是纯函数？

#### 1. 保证状态的可预测性

- 纯函数对同样的输入总返回同样的输出，方便理解和测试。<br>
- 如果 Reducer 不是纯函数，可能产生不确定的状态变化，难以调试。

#### 2. 支持时间旅行调试（Time-travel Debugging）

- Redux 等框架允许回退、重放状态，依赖纯函数确保每次计算结果一致。<br>
- 非纯函数会导致状态不一致，影响调试和恢复。

#### 3. 避免副作用，提高代码健壮性

- Reducer 只负责状态计算，不应产生副作用（如 API 调用、修改外部变量）。<br>
- 副作用应放在 middleware（如 Redux-thunk、Redux-saga）中处理。

#### 4. 保证状态不可变性

- 纯函数通常不修改原状态，而是返回新对象，避免状态共享引发的意外变化。

---

### 四、常见违背纯函数的错误示例

```js
// 错误示例：修改了传入的 state，导致副作用
function reducer(state, action) {
  state.count += 1;  // 直接修改输入参数
  return state;
}

// 正确示例：返回新状态对象，不修改输入
function reducer(state, action) {
  return { ...state, count: state.count + 1 };
}
````

---

### 五、总结

* Reducer 必须是纯函数，确保相同输入获得相同输出且无副作用。
* 纯函数设计保证状态变更可预测、可调试，方便测试和维护。
* 副作用逻辑应分离，不写在 Reducer 中。
* 遵守纯函数原则是现代前端状态管理设计的重要基础。

</details>

## 23. React-Redux中connect函数的作用是什么 {#question-subjective-ed26dea42567}

### 题目要点

* 说明 connect 是连接 React 组件与 Redux store 的高阶函数
* 介绍订阅状态变化、注入状态和派发方法的功能
* 结合代码说明 mapStateToProps 和 mapDispatchToProps 用法
* 强调性能优化和解耦设计优势

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 React 与 Redux 状态管理的集成原理<br>
考察对 Redux 状态如何注入 React 组件的掌握。

#### ● 掌握 connect 函数的工作机制及参数用途<br>
考察是否了解 connect 如何连接组件与 Redux store。

#### ● 了解 connect 的优化原理和使用场景

---

### 参考答案

### 一、connect 函数的定义与作用

- `connect` 是 React-Redux 提供的高阶函数，用于将 React 组件与 Redux **store** 连接起来。<br>
- 它通过订阅 Redux store 的变化，自动将状态和派发方法注入组件的 props 中，实现视图与状态的同步更新。

---

### 二、connect 的核心功能

#### 1. 订阅 Redux store

- 监听 store 的状态变化，触发组件重新渲染，实现 UI 与状态的自动同步。

#### 2. 映射状态到组件 props

- 通过 `mapStateToProps` 函数，将 store 中的状态映射为组件的 props，组件可以直接访问需要的状态数据。

#### 3. 映射派发方法到组件 props

- 通过 `mapDispatchToProps` 函数或对象，将 action creators 映射为组件的 props，方便组件触发状态更新。

#### 4. 性能优化

- connect 内部实现了浅比较，避免不必要的组件重新渲染，提高性能。

---

### 三、connect 的基本用法示例

```js
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({
  count: state.counter.value
});

const mapDispatchToProps = {
  increment: () => ({ type: 'INCREMENT' }),
  decrement: () => ({ type: 'DECREMENT' })
};

function Counter({ count, increment, decrement }) {
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
````

---

### 四、connect 参数详解

| 参数                   | 作用                                        | 说明                  |
| -------------------- | ----------------------------------------- | ------------------- |
| `mapStateToProps`    | 读取 Redux 状态，映射为组件 props                   | 必须或可选，返回需要的状态对象     |
| `mapDispatchToProps` | 绑定 action creators，映射为组件 props            | 函数或对象形式，方便触发 action |
| `mergeProps`         | 自定义合并 stateProps、dispatchProps 和 ownProps | 可选，复杂需求时使用          |
| `options`            | 额外配置，如是否纯组件、是否前向引用 ref 等                  | 用于控制 connect 行为     |

---

### 五、总结

* `connect` 是 React-Redux 的桥梁，负责将 Redux 状态和动作派发绑定到 React 组件。
* 它使组件无需直接访问 store，解耦 UI 和状态管理逻辑。
* 通过参数灵活配置，实现精细控制组件状态获取和更新。
* 内置性能优化，确保只在相关状态改变时触发组件重渲染。

</details>

## 24. 如何用Hooks替代connect {#question-subjective-0c0e21f3097d}

### 题目要点

* 介绍 `useSelector` 和 `useDispatch` 两个核心 Hook
* 结合示例代码，说明如何替代 `connect`
* 对比两者的区别、优缺点及适用场景
* 强调 Hooks 只能用于函数组件和性能注意点

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 React-Redux 新的 Hook API 使用<br>
考察对 `useSelector` 和 `useDispatch` 等 Hook 的掌握。

#### ● 熟悉 Hook 方式与 connect 的区别与优劣<br>
考察对状态读取和派发操作的现代写法理解。

#### ● 能用 Hooks 实现状态管理的组件绑定，体现简洁和灵活性

---

### 参考答案

### 一、React-Redux Hooks 简介

- React-Redux 自 v7 起支持 Hook API，主要提供两个核心 Hook：<br>
  - `useSelector`：从 Redux store 中读取状态，类似于 `mapStateToProps`。<br>
  - `useDispatch`：获取 `dispatch` 函数，类似于 `mapDispatchToProps`。

- Hooks 替代了传统的 `connect` 高阶组件，更符合 React 函数组件开发思路。

---

### 二、用 Hooks 替代 connect 的实现示例

#### 使用 connect 的传统写法

```js
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({ count: state.count });
const mapDispatchToProps = { increment: () => ({ type: 'INCREMENT' }) };

function Counter({ count, increment }) {
  return <button onClick={increment}>{count}</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
````

#### 使用 Hooks 的写法

```js
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  const increment = () => dispatch({ type: 'INCREMENT' });

  return <button onClick={increment}>{count}</button>;
}
```

---

### 三、对比与优势

| 维度     | connect                                 | Hooks                     |
| ------ | --------------------------------------- | ------------------------- |
| 代码结构   | 高阶组件，外层包裹组件                             | 纯函数组件内直接调用 Hook           |
| 语法复杂度  | 需要编写 mapStateToProps、mapDispatchToProps | 简洁直观，直接使用 Hook API        |
| 适用组件类型 | 支持类组件和函数组件                              | 只支持函数组件                   |
| 性能优化   | 内置浅比较，避免无谓渲染                            | 依赖 `useSelector` 的自定义比较函数 |
| 灵活性    | 依赖 connect 参数配置                         | 灵活可组合，方便与其他 Hook 混合使用     |

---

### 四、使用 Hooks 需要注意的点

* `useSelector` 会订阅 Redux store，默认使用严格相等（===）进行比较，避免不必要重渲染。
* 可传入自定义比较函数来控制组件渲染。
* Hooks 只能在 React 函数组件或自定义 Hook 中调用。
* 由于去掉了 HOC 包裹层，组件层级更扁平，调试更直观。

---

### 五、总结

* React-Redux Hooks 是 `connect` 的现代替代方案，更符合函数组件开发范式。
* 通过 `useSelector` 和 `useDispatch`，直接读取状态和派发动作，代码简洁且灵活。
* Hooks 方式只支持函数组件，适合新项目或逐步迁移。
* 掌握 Hooks 用法有助于提升开发效率和代码可维护性。

</details>

## 25. 返回数组 output，其中 output[i] 是 nums 中除 nums[i] 外其余元素的乘积。 {#question-subjective-06ce63511c84}

要求：时间复杂度 O(n)，不使用除法。

示例：
输入：[1,2,3,4] → 输出：[24,12,8,6]

### 题目要点

* 清晰说明 prefix 和 suffix 乘积数组的作用。
* 解释为什么不能用除法（避免除零和性能问题）。
* 代码实现简洁且注释完整，符合线性复杂度要求。
* 优化空间使用，体现对性能的考虑。

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解数组遍历与空间优化思路<br>
考察对前缀积与后缀积的掌握及空间复杂度控制。

#### ● 掌握不使用除法实现乘积计算的技巧<br>
考察时间复杂度 O(n) 的线性解法设计。

#### ● 能结合代码示例进行清晰表达

---

### 参考答案

### 一、题目解析

- 输入数组 `nums`，要求返回一个新数组 `output`，其中 `output[i]` 是 `nums` 中除 `nums[i]` 外所有元素的乘积。<br>
- 限制：**不能使用除法**，时间复杂度需为 O(n)。

---

### 二、解决思路

- 采用两次遍历思想，分别计算每个元素左边所有元素的乘积（prefix），和右边所有元素的乘积（suffix）。<br>
- 最终 `output[i] = prefix[i] * suffix[i]`。<br>
- 优化空间：可以先用 `output` 存储 prefix，然后用一个变量累积 suffix，边遍历边更新 `output`。

---

### 三、示例代码

```js
function productExceptSelf(nums) {
  const n = nums.length;
  const output = new Array(n).fill(1);

  // 计算 prefix 乘积：output[i] = nums[0] * ... * nums[i-1]
  for (let i = 1; i < n; i++) {
    output[i] = output[i - 1] * nums[i - 1];
  }

  // 计算 suffix 乘积，同时乘入 output 中
  let suffixProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    output[i] = output[i] * suffixProduct;
    suffixProduct *= nums[i];
  }

  return output;
}

// 测试示例
console.log(productExceptSelf([1, 2, 3, 4])); // 输出: [24, 12, 8, 6]
````

---

### 四、复杂度分析

* 时间复杂度：O(n)，两次遍历数组。
* 空间复杂度：O(1)（忽略返回数组），只使用常数额外变量。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-52/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-52/round-75/index.md" >}}) →
