+++
title = "Vue.js 面试题"
draft = false
tags = ["面试", "前端", "Vue.js", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T04:28:40.476Z"
+++

共 123 道 Vue.js 面试题。答案默认折叠，便于先自行作答。

## 1. 为何`setup()`中直接解构`props`会丢失响应性？ {#question-0eb08245-5227-41ee-8dc4-f35a8e3b3748}

> 难度：2 · 类型：QA

### 题目要点

`setup` 中直接解构 `props` 会丢失响应性，是因为解构会把属性值拷贝为普通变量，打断了与 `props` Proxy 的引用关系，导致 Vue 无法进行依赖收集。正确做法是直接使用 `props.xxx`，或通过 `toRefs / toRef` 将属性转换为保持响应性的 `ref`。

<details>
<summary>参考答案</summary>

在 Vue 3 中，`setup()` 里**直接解构 `props` 会丢失响应性**，根本原因在于：**响应式是依赖引用关系实现的，而解构会打断这种引用关系**。

下面从原理、示例和正确做法三个层面说明。

---

## 一、根本原因：解构会“拷贝值”，不再是响应式引用

在 `setup(props)` 中：

* `props` 本身是一个 **浅只读的响应式对象（Proxy）**
* Vue 的响应式系统是 **基于 getter / setter（Proxy 拦截）+ 依赖收集** 实现的
* **解构会把属性的当前值“取出来”，赋值给一个普通变量**

一旦解构：

```js
const { title } = props;
```

此时：

* `title` 是一个 **普通变量**
* 它不再通过 `props.title` 访问
* Vue 无法拦截 `title` 的读取
* 依赖收集链路断裂 → 响应性丢失

---

## 二、对比示例：为什么一个会更新，一个不会

### ❌ 错误示例（丢失响应性）

```js
export default {
  props: {
    title: String
  },
  setup(props) {
    const { title } = props;

    return { title };
  }
};
```

父组件更新 `title` 时：

* `props.title` 变了
* 但 `title` 变量不会重新赋值
* 模板中使用 `{{ title }}` 不会更新

---

### ✅ 正确示例 1：不解构，直接使用 props

```js
setup(props) {
  return { props };
}
```

模板中：

```html
{{ props.title }}
```

说明：

* 每次访问都走 `props.title`
* 响应式链路完整

---

### ✅ 正确示例 2：使用 `toRefs`（官方推荐）

```js
import { toRefs } from 'vue';

setup(props) {
  const { title } = toRefs(props);
  return { title };
}
```

这里：

* `title` 是一个 `Ref`
* 内部仍然指向 `props.title`
* 响应式未被破坏

模板中：

```html
{{ title }}
```

---

### ✅ 正确示例 3：使用 `toRef`（单个字段）

```js
import { toRef } from 'vue';

setup(props) {
  const title = toRef(props, 'title');
  return { title };
}
```

适合只需要一个 prop 的场景。

---

## 三、为什么 Vue 不“自动处理解构”？

这是一个**语言层面的限制**，不是 Vue 的设计疏忽：

```js
const { title } = props;
```

在 JavaScript 语义上等价于：

```js
const title = props.title;
```

* JS 本身没有“解构后仍保持 getter 引用”的能力
* Vue 无法在不破坏 JS 语义的前提下自动劫持

因此 Vue 选择：

* **明确规则**
* **显式 API（toRefs / toRef）**
* 避免“隐式魔法”带来的不可预测行为

</details>

## 2. Vue 中，多个组件复用同一响应式对象时，如何避免不必要的重新渲染？ {#question-90552483-d460-409a-9f1a-1c6613393bab}

> 难度：2 · 类型：QA

### 题目要点

多个组件复用同一响应式对象时，是否发生不必要的重新渲染，取决于依赖收集是否精确；应避免在 render 中访问整对象或做遍历操作，而是通过 `toRef`、`computed` 或 props 传递单个字段来缩小依赖范围；对于职责复杂的共享状态，应主动拆分响应式对象；必要时可使用 `shallowReactive`、`shallowRef` 或 `v-memo` 显式控制更新边界，从而避免无关字段变更引发组件重渲染。

<details>
<summary>参考答案</summary>

在 Vue 中，**多个组件复用同一个响应式对象**时，真正的风险并不是“复用”本身，而是：

> **响应式粒度过粗，导致无关字段变更也触发组件更新**

避免不必要的重新渲染，本质上是**控制依赖收集的边界**，让组件只订阅“自己真正用到的那一部分状态”。

---

## 一、先明确触发更新的根因

在 Vue 3 中，组件是否重新渲染取决于：

* render 过程中 **读取了哪些响应式 key**
* 这些 key 在后续是否被 `set`

也就是说：

> **组件更新是“按 key 精确触发的”，而不是“按对象整体触发的”**

但前提是：**不要在 render 中做“整对象读取”**。

---

## 二、最常见的误区：传递整对象 / 解构丢失响应性

### 1. 直接使用整对象

```js
const state = reactive({
  a: 1,
  b: 2
})
```

```vue
<Child :state="state" />
```

在子组件中：

```js
{{ state.a }}
```

表面上只用到了 `a`，但如果在 render 中做了：

```js
const { a } = state
```

或：

```js
Object.values(state)
```

就会导致：

* render 阶段访问了整个对象
* 组件订阅了 `a`、`b` 等所有 key
* 任意字段变化都会触发更新

---

## 三、控制更新的核心策略

### 1. 精确到属性级别的依赖

最重要的一条原则是：

> **在 render 中，只访问必要的 key**

推荐做法包括：

* 使用 `toRef / toRefs` 拆分依赖
* 通过 props 传递单个字段，而不是整对象

```js
const a = toRef(state, 'a')
```

这样组件只会订阅 `state.a`。

---

### 2. 使用 `computed` 作为“依赖隔离层”

当多个组件共享一个复杂状态对象时，可以通过 `computed` 做中间层：

```js
const visibleCount = computed(() => state.count)
```

组件只依赖 `visibleCount`：

* state 中其他字段变化
* 不会影响该组件

这在复杂业务中非常有效。

---

### 3. 合理拆分响应式对象

如果一个对象被多个组件复用，但字段职责完全不同，应考虑：

```js
const userState = reactive({ ... })
const uiState = reactive({ ... })
```

而不是一个“全局大对象”。

响应式拆分是**最基础也是最有效的优化**。

---

## 四、避免“被动更新”的工程实践

### 1. 避免在 render 中遍历对象

如下写法非常容易引入无意义更新：

```js
Object.keys(state)
Object.values(state)
JSON.stringify(state)
```

这些操作会触发对所有 key 的依赖收集。

---

### 2. 谨慎使用 `shallowReactive` / `shallowRef`

在一些场景中，可以用：

* `shallowReactive`：只追踪第一层
* `shallowRef`：只在 `.value` 改变时触发

这适用于：

* 大对象
* 外部不可控数据
* 只关心引用变化的场景

---

### 3. 使用 `v-memo`（Vue 3.2+）

```vue
<div v-memo="[state.a]">
  {{ state.a }}
</div>
```

含义是：

* 只有当 `state.a` 变化时，才重新渲染该子树
* 其他字段变化会被忽略

这是一种**显式声明渲染依赖**的手段。

---

## 五、共享响应式对象的“正确姿势”

一个推荐的组合模式是：

* **store 层**：维护最小化、拆分后的响应式状态
* **selector 层（computed）**：对外暴露精确字段
* **组件层**：只消费 selector，而不是原始 state

这与状态管理中的“selector / derived state”思想是一致的。

</details>

## 3. Vue2中，为什么在`beforeCreate`阶段，无法访问`data`？ {#question-7a2e44a2-1e37-4b5c-98c4-15a049422ea5}

> 难度：1 · 类型：QA

### 题目要点

Vue 2 的 `beforeCreate` 执行时，组件实例尚未完成状态初始化；`data()` 尚未执行，响应式系统也未建立，数据属性尚未代理到实例上；这是由 Vue 2 的初始化顺序和 `Object.defineProperty` 响应式实现决定的设计结果，而非生命周期设计失误；`beforeCreate` 被刻意保留为一个“无状态”的早期钩子，主要用于插件注入和底层扩展。

<details>
<summary>参考答案</summary>

在 Vue 2 中，`beforeCreate` 阶段**无法访问 `data`**，并不是设计疏忽，而是由 **Vue 2 实例初始化顺序与响应式实现方式共同决定的必然结果**。

---

## 一、结论先行

> **`beforeCreate` 执行时，`data` 尚未初始化，也尚未被代理到实例上，因此既不存在响应式数据，也不存在 `this.xxx` 的访问入口。**

---

## 二、Vue 2 实例初始化的真实顺序

Vue 2 创建组件实例时，核心初始化流程可以简化为：

```text
initLifecycle
initEvents
initRender
→ beforeCreate
initInjections
initState（data / props / computed / methods）
→ created
```

关键点在于：

> **`beforeCreate` 在 `initState` 之前执行**

而 `data`、`props`、`computed` 等，全部是在 `initState` 阶段完成的。

---

## 三、`data` 在 Vue 2 中是如何“变得可访问”的

### 1. data 本身只是一个 option

在 `beforeCreate` 时：

* `this.$options.data` 可能存在
* 但 `data()` **尚未执行**
* `data` 对象尚未生成

---

### 2. 响应式与代理发生在 `initState`

在 `initState` 内部，Vue 2 会做三件关键事情：

1. **执行 `data()`，得到原始数据对象**
2. 通过 `Object.defineProperty` 将数据变成响应式
3. 将每个 data key 代理到实例上：

```js
Object.defineProperty(vm, 'count', {
  get() { return vm._data.count },
  set(val) { vm._data.count = val }
})
```

在这一步完成之前：

* `this._data` 不存在
* `this.count` 也不存在

---

## 四、为什么 Vue 2 不提前初始化 data

这是一个**设计取舍**，而不是技术限制。

### 1. injections / props 优先级问题

在 Vue 2 中：

* `inject` 依赖 `provide`
* `data` 可以依赖 `props`
* `props` 又可能依赖注入结果

因此 Vue 必须保证：

> **依赖链路已准备好，再执行 data()**

而 `beforeCreate` 被刻意放在这些初始化之前，用来做**最原始的实例配置**。

---

### 2. 保留一个“无状态”的生命周期钩子

`beforeCreate` 的定位是：

* 无响应式
* 无数据
* 无依赖
* 仅用于插件或底层逻辑注入

这为插件系统提供了稳定的切入点。

---

## 五、为什么在 `created` 就可以访问 data

因为在 `created` 之前：

* `initState` 已完成
* `data` 已响应式化
* 所有 data key 已代理到实例

因此在 `created` 中：

```js
this.count // 可用
```

---

## 六、对比 Vue 3（加分理解）

Vue 3 中：

* 不再依赖 `this`
* 使用 `setup` 明确划分初始化边界
* 响应式数据在 `setup` 内显式创建

本质上是把 Vue 2 中**隐式的初始化顺序问题，转为显式 API 设计**。

</details>

## 4. `setup`函数中同步修改响应式数据，会触发子组件的`onBeforeUpdate`吗？为什么？ {#question-e82c31fa-cae7-499a-90a5-2fa56a7c3f59}

> 难度：2 · 类型：QA

### 题目要点

`setup` 执行时组件尚未完成首次渲染，所有同步的响应式修改都会被合并进初始 render，而不是触发一次更新；`onBeforeUpdate` 只会在组件已经 mounted 且即将进行一次更新渲染时触发；因此，在 `setup` 中同步修改响应式数据，不会触发子组件的 `onBeforeUpdate`，因为更新阶段尚未开始。

<details>
<summary>参考答案</summary>

**结论先行：不会。**
在 `setup` 函数中**同步修改响应式数据，不会触发子组件的 `onBeforeUpdate`**。原因在于：**此时组件尚未完成首次渲染，更新还没有进入“更新阶段”**。

下面从 Vue 3 的真实执行链路解释这个结论。

---

## 一、先明确 `onBeforeUpdate` 的触发前提

`onBeforeUpdate` 的语义是：

> **组件已经完成过一次挂载（mount），因为响应式状态变更，即将触发一次“更新渲染”之前**

因此，它有一个隐含前提：

* 组件 **已经 mounted**
* 当前这次 render 属于 **update，而不是 initial render**

如果组件还没完成首次渲染，就不存在“更新”，也就不存在 `beforeUpdate`。

---

## 二、`setup` 所处的生命周期位置

Vue 3 中，组件初始化的大致流程是：

```text
createComponentInstance
→ setup()
→ render effect 创建
→ 首次 render
→ patch
→ mounted
```

关键点在于：

> **`setup` 执行时，组件还没有开始渲染，更不可能已经 mounted**

此时：

* render effect 还没真正执行
* 子组件实例甚至可能尚未创建
* 更新调度系统（scheduler）还未介入

---

## 三、为什么同步修改不会触发更新

来看一个典型场景：

```js
setup() {
  const count = ref(0)
  count.value++
  return { count }
}
```

这里发生的事情是：

1. `setup` 中创建响应式数据
2. 同步修改 `count.value`
3. **此修改发生在首次 render 之前**
4. render effect 第一次执行时，直接读取的是**最终值**

也就是说：

> **这次修改被“吸收”进了首次渲染，而不是一次更新**

从 Vue 的角度看：

* 没有“旧 VNode”
* 没有 diff
* 没有 update 阶段
* 自然也不会触发 `onBeforeUpdate`

---

## 四、对子组件的影响

子组件的 `onBeforeUpdate` 触发条件更严格：

* 父组件已经 mounted
* 父组件更新导致子组件进入 update 流程
* 子组件的 props 或依赖发生变化

而在 `setup` 阶段：

* 父组件尚未 mounted
* 子组件通常尚未完成创建
* 不存在一次“父 → 子”的更新传播

因此：

> **`setup` 中的同步修改，不可能触发子组件的 `onBeforeUpdate`**

---

## 五、对比：什么情况下会触发 `onBeforeUpdate`

```js
setup() {
  const count = ref(0)

  onMounted(() => {
    count.value++
  })

  return { count }
}
```

这时链路是：

1. 首次 render 完成
2. 组件 mounted
3. `count` 在 mounted 后被修改
4. 触发更新调度
5. 父组件 `onBeforeUpdate`
6. 子组件 `onBeforeUpdate`
7. render → diff → patch

这才是一个完整的 **update 生命周期**。

---

## 六、工程化视角的总结

Vue 对生命周期的区分本质是：

* **initial render**：状态准备阶段
* **update render**：响应式变更驱动阶段

`setup` 属于前者，而 `onBeforeUpdate` 属于后者，两者不会交叉。

</details>

## 5. Vue3 中，动态绑定v-bind:class="{ active: isActive }"会被编译成什么样的JS代码？ {#question-efa108f0-e78a-48e7-b722-e6b67c32a494}

> 难度：3.5 · 类型：QA

### 题目要点

`v-bind:class="{ active: isActive }"` 在 Vue 3 中会被编译为 render 函数中的普通 props 表达式，核心形式是 `class: normalizeClass({ active: _ctx.isActive })`；模板变量通过 `_ctx` 访问；对象结构不会在编译期被拍平，而是交由运行时统一归一化为字符串；这种设计保证了 class 多种写法的统一处理，并与响应式系统自然衔接。

<details>
<summary>参考答案</summary>

以 **Vue 3（编译器 + 运行时分离架构）** 为背景，`v-bind:class="{ active: isActive }"` 在编译阶段并不会以“指令”的形式存在到运行时，而是被**直接编译成普通的 JavaScript 表达式 + 运行时辅助函数调用**。

下面从**模板 → render 函数 → 运行时执行**三个层次把这件事讲清楚。

---

## 一、模板层的输入

模板代码：

```vue
<div v-bind:class="{ active: isActive }"></div>
```

等价的简写形式是：

```vue
<div :class="{ active: isActive }"></div>
```

---

## 二、编译阶段：模板如何被转换

### 1. AST 阶段的识别

编译器在解析模板 AST 时会识别出：

* `class` 是一个 **动态绑定**
* 表达式是一个 **对象字面量**
* key 是静态字符串 `"active"`
* value 是作用域变量 `isActive`

这一步不会生成字符串拼接，而是保留**表达式语义**。

---

### 2. 转换为 render 函数中的 props 表达式

在 Vue 3 中，模板最终会被编译为类似下面的 render 函数（示意）：

```js
import { openBlock, createElementBlock, normalizeClass } from "vue";

export function render(_ctx, _cache) {
  return openBlock(), createElementBlock(
    "div",
    {
      class: normalizeClass({ active: _ctx.isActive })
    },
    null
  );
}
```

这是回答这个问题时**最关键的一段代码形态**。

---

## 三、关键点拆解

### 1. `isActive` 如何访问

```js
_ctx.isActive
```

说明几点：

* 模板中的变量会被提升为 render 函数的上下文 `_ctx`
* 编译阶段并不关心它是 `ref`、`reactive` 还是普通值
* 取值逻辑完全交给运行时响应式系统

---

### 2. 为什么要调用 `normalizeClass`

```js
normalizeClass({ active: _ctx.isActive })
```

这是因为 Vue 允许 `class` 接受多种类型：

* 字符串：`"a b"`
* 数组：`["a", condition && "b"]`
* 对象：`{ a: true, b: false }`
* 以上形式的任意嵌套组合

`normalizeClass` 的职责是：

> **把任意合法的 class 表达式，规范化为最终可直接写入 DOM 的字符串**

例如：

```js
{ active: true, disabled: false }
```

会被规范化为：

```text
"active"
```

---

### 3. 为什么 class 不会直接写成字符串拼接

一个直觉实现可能是：

```js
class: _ctx.isActive ? "active" : ""
```

但 Vue 不这样做，原因是：

* 会破坏数组 / 对象 / 混合写法的统一处理
* 会导致多 class 合并逻辑分散在编译阶段
* 不利于运行时复用和优化

因此 Vue 选择：

> **编译期保留结构，运行时统一归一化**

---

## 四、运行时执行时发生了什么

当组件 render effect 执行时：

1. 访问 `_ctx.isActive`
2. 触发响应式 `get`，建立依赖
3. `normalizeClass` 返回字符串
4. Virtual DOM 中的 `class` 属性发生变化
5. Diff 阶段只更新该元素的 `className`

当 `isActive` 变化时：

* render effect 重新执行
* class 重新计算
* DOM class 被最小化更新

---

## 五、Vue 2 与 Vue 3 的差异补充（加分点）

在 Vue 2 中，生成的是类似：

```js
_c('div', {
  class: { active: isActive }
})
```

对象结构在运行时由 `updateClass` 处理。

Vue 3 把这一步拆得更明确：

* 编译期更“纯”
* 运行时通过 `normalizeClass` 明确边界
* 更利于 tree-shaking 和静态分析

</details>

## 6. Vue的Diff为何采用同层比较，而非跨层？ {#question-53cc93d4-4b6d-46fc-a9b4-26d3ef075ea5}

> 难度：2 · 类型：QA

### 题目要点

Vue 采用同层比较而非跨层 Diff，是为了将 Diff 的时间复杂度稳定在 O(n)，避免跨层搜索带来的高昂性能成本；同时 DOM 的层级变化往往意味着语义变化，强行复用节点收益有限且风险较高；同层 Diff 配合 key 已经覆盖绝大多数高频场景；限制 Diff 能力可以保证组件边界、状态模型和生命周期的确定性，是一种典型的工程化取舍。

<details>
<summary>参考答案</summary>

Vue 的 Diff 之所以**采用同层比较（Tree Diff）而不是跨层比较**，并不是能力上的限制，而是一次**在性能、实现复杂度与实际收益之间的工程取舍**。

---

### 一、先明确问题本质

虚拟 DOM Diff 的目标不是“找出最少操作次数”，而是：

> **在可接受的时间复杂度内，快速生成一组足够接近最优的 DOM 更新操作**

如果允许**跨层级移动节点**，理论上可以减少部分 DOM 操作，但代价是 Diff 过程本身会变得极其昂贵。

---

### 二、跨层 Diff 的成本远大于收益

#### 1. 时间复杂度会急剧上升

* 同层比较：
  每一层只在当前 children 列表中做对比，复杂度可以控制在 **O(n)**

* 跨层比较：
  需要在整棵子树中寻找“可复用节点”，本质上接近 **O(n²)** 或更高

在真实业务中，DOM 节点数量往往远大于 Diff 次数本身，**Diff 变慢会直接拖慢每一次更新**。

---

#### 2. DOM 结构语义本身是分层的

HTML 天然是一个**强层级语义结构**：

```html
<ul>
  <li>
    <span />
  </li>
</ul>
```

如果一个节点从 `ul > li` 被移动到 `div > p`：

* 这通常意味着**语义和布局已经发生改变**
* 强行做跨层复用，反而容易带来状态错乱和不可预期行为

Vue 更倾向于把这种变化视为：

> **删除旧节点 + 创建新节点**

而不是“智能迁移”。

---

### 三、同层 Diff + Key 已经覆盖绝大多数场景

Vue 的核心优化并不是“跨层移动”，而是：

* **同层节点的精准复用**
* **借助 key 提升可预测性**

```vue
<li v-for="item in list" :key="item.id" />
```

在同一层级中：

* 节点重排
* 插入
* 删除
* 移动

都可以通过 key 在 **O(n)** 时间内完成最小化更新。

这已经覆盖了列表更新、拖拽排序、分页切换等**90% 以上的真实业务场景**。

---

### 四、跨层 Diff 会破坏组件边界与状态模型

Vue 的组件实例、响应式依赖、生命周期，都**强依赖于稳定的父子关系**：

* 组件的 `provide / inject`
* 响应式依赖收集
* 生命周期顺序

如果允许跨层复用 DOM 或组件实例：

* 组件实例“瞬移”到另一棵子树
* 依赖关系需要整体重建
* 生命周期语义变得不清晰

这会让框架的心智模型变得非常复杂。

---

### 五、Vue 的策略：限制能力，换取确定性

Vue 的 Diff 策略可以概括为：

> **只在“合理且高频”的变化范围内做极致优化**

* 不追求理论最优
* 不做低概率、高复杂度的智能判断
* 把复杂度交给开发者（通过结构设计和 key）

这也是为什么 Vue 官方文档强调：

> 不要随意改变节点层级结构

---

### 六、与 React 的对比（加分点）

* Vue 与 React 在这一点上其实是一致的
* React Fiber 也不会做跨层 Diff
* Fiber 的优化方向是“可中断更新”，而不是“更聪明的 Diff”

两者都选择了：

> **牺牲跨层复用能力，换取可预测性能**

</details>

## 7. Vue.use 如何注册插件 {#question-ef9dbd6c-d3c1-4087-8431-fafa2a68a74c}

> 难度：2 · 类型：QA

### 题目要点

`Vue.use` 通过约定的 `install` 协议注册插件；内部通过缓存保证插件只会安装一次；插件的能力注入发生在 `install` 中，可扩展原型、全局配置或组件；该机制提供了统一且可控的插件接入时机；Vue3 中演进为 `app.use`，但核心思想保持一致。

<details>
<summary>参考答案</summary>

从机制上看，`Vue.use` 并不是一个“魔法 API”，而是 Vue 在框架层提供的一套**插件注册协议**。它解决的核心问题是：**如何在全局范围内、以可控且只执行一次的方式，扩展 Vue 的能力**。

在 Vue2 中，`Vue.use` 接收一个插件对象或函数，并在内部维护一个已安装插件的缓存。当调用 `Vue.use(plugin)` 时，Vue 首先会判断该插件是否已经被注册过，如果存在于缓存中，则直接返回，确保插件的安装逻辑只会执行一次。这一步从框架层面避免了重复注册带来的副作用。

通过校验后，Vue 会根据插件的形态执行不同的安装流程。如果插件是一个对象，Vue 会查找其是否定义了 `install` 方法，并以 `Vue` 构造函数作为第一个参数调用该方法；如果插件本身是一个函数，则直接将其当作 `install` 方法执行。额外传入的参数会原样传递给安装函数，从而支持插件的可配置化。这种约定式设计，使插件既可以保持结构化，也能保持使用上的简洁。

插件的“注册”本身并不意味着做某一件固定的事，而是完全由 `install` 的实现决定。在 `install` 内部，插件通常会通过向 `Vue.prototype` 注入方法或属性来扩展实例能力，通过 `Vue.mixin` 注入全局混入逻辑，或通过 `Vue.component`、`Vue.directive` 注册全局组件和指令。从运行时角度看，这些行为本质上都是在修改 Vue 的全局配置或原型链，因此必须在应用初始化之前完成。

从设计角度看，`Vue.use` 的价值在于提供了一个**统一的生命周期入口**。所有插件都在同一个阶段、以同一种方式接入框架，这使得插件之间可以形成约定，也让框架本身能够控制执行顺序和幂等性。这也是为什么官方插件和第三方生态都严格遵循 `Vue.use` 这一模式。

在 Vue3 中，这一机制被迁移到了 `app.use` 上，但设计理念并未改变。只是插件不再直接操作全局的 `Vue` 构造函数，而是作用于某一个应用实例，从“全局单例扩展”转向“应用级扩展”，以适应多应用并存的场景。

</details>

## 8. Vue3和Vue2的响应式原理有什么差别？ {#question-d3cd6795-d550-4e53-b97e-52d79c93f8f0}

> 难度：2 · 类型：QA

### 题目要点

Vue2 基于 `Object.defineProperty`，以属性为中心进行依赖收集，无法天然支持新增属性和复杂结构；Vue3 基于 `Proxy`，以访问行为为中心动态追踪依赖；Vue3 将 watcher 统一为 effect，提升了可组合性和扩展性；两者的核心目标一致，但在能力边界、性能模型和工程取舍上存在明显差异。

<details>
<summary>参考答案</summary>

从设计目标上看，Vue2 和 Vue3 的响应式系统都试图解决同一个问题：**在不显式声明依赖的情况下，建立数据与视图之间的自动更新关系**。区别不在于“是否响应式”，而在于**依赖的收集方式、更新触发的时机以及系统的可扩展性**。

在 Vue2 中，响应式的核心建立在 `Object.defineProperty` 之上。每一个被观测的对象属性，都会被单独劫持其 `getter` 和 `setter`。当组件渲染时，`getter` 会触发依赖收集，将当前的渲染 watcher 记录到该属性的依赖列表中；当属性被修改时，`setter` 触发依赖通知，相关 watcher 重新执行。这个模型是“以属性为中心”的：每个属性维护自己的依赖集合。它的优势是实现直观、行为稳定，但代价也很明显——必须在初始化阶段递归遍历对象，无法感知属性的新增和删除，对数组的支持需要通过方法重写来间接实现。

Vue3 则彻底重构了这一套机制，响应式的基础从“属性劫持”转向了“对象代理”。通过 `Proxy` 拦截对象的读写、枚举和结构性操作，Vue3 可以在运行时动态感知属性的访问和变化，而不需要在初始化阶段预先处理所有字段。依赖收集不再绑定在某个具体的 `getter` 上，而是通过一个全局的依赖追踪机制，将“当前正在执行的副作用函数”与“被访问的目标对象 + key”建立映射关系。这种设计让响应式系统从“属性驱动”升级为“访问驱动”，在能力上覆盖了新增、删除属性、Map / Set 等复杂数据结构。

在更新模型上，两者也存在本质差异。Vue2 的 watcher 是以组件为主的，计算属性、侦听器和渲染 watcher 在语义上是不同类型，但底层机制相对分散。Vue3 将这些概念统一为 effect，通过调度器控制执行时机，使响应式系统更具可组合性。这种统一模型也是 Composition API 得以成立的前提。

从性能和可维护性角度看，Vue2 的响应式成本主要体现在初始化阶段和深层对象遍历上，而 Vue3 将成本更多地推迟到“真正发生访问和修改时”。同时，Proxy 的存在让代码路径更加集中，减少了针对数组和特殊场景的补丁式实现。但相应地，Vue3 放弃了对 IE 等不支持 Proxy 环境的兼容，这也是一次明确的技术取舍。

总结来看，Vue2 的响应式是“静态劫持 + 属性级依赖”，而 Vue3 的响应式是“动态代理 + 访问级依赖”。前者在早期浏览器环境下是工程最优解，后者则为复杂状态管理和更强的表达能力打开了空间。

</details>

## 9. 假设你正在开发一个 Vue 项目，需要在组件加载完成后执行一个数据初始化操作，并在组件销毁前清理一些资源（如定时器或事件监听）。你会使用哪些生命周期钩子来实现这些功能，并简述每个钩子的作用。 {#question-c176e5d4-a42e-4e1c-afb6-d7f8f4faa1d3}

> 难度：1 · 类型：QA

### 题目要点

* **`onMounted`**：组件挂载到真实 DOM 后触发，用于异步请求、DOM 操作及第三方库初始化。
* **`onBeforeUnmount`**：组件销毁前触发，用于移除定时器、注销全局事件监听及断开长连接。
* **内存管理**：在销毁阶段手动清理外部资源是预防前端内存溢出（Memory Leak）的行业标准实践。
* **执行顺序**：确保“谁开启，谁关闭”的逻辑闭环，维护组件的纯净性。

<details>
<summary>参考答案</summary>

以下将基于 **Vue 3 组合式 API (Composition API)** 这一现代主流范式进行说明。

### 1. 数据初始化：使用 `onMounted`

为了在组件加载完成后执行数据初始化（如发起 API 请求、访问 DOM 节点），会选择 **`onMounted`** 钩子。

* **作用**：该钩子在组件完成初始渲染并创建了真实的 DOM 节点后触发。此时，模板中的所有元素已挂载到页面上，是进行异步数据抓取、初始化第三方插件（如 ECharts）的最佳时机。
* **为何不在 `setup` 或 `created` 中做？**：虽然在 `setup` 阶段可以发起网络请求，但如果初始化逻辑涉及到对 DOM 的操作（例如获取元素的宽高），则必须等到 `onMounted` 阶段，否则会因为 DOM 尚未生成而报错。

### 2. 资源清理：使用 `onBeforeUnmount`

为了在组件销毁前清理资源（如 `setInterval` 定时器、`window` 全局事件监听、WebSocket 连接），会选择 **`onBeforeUnmount`** 钩子。

* **作用**：该钩子在组件卸载（Unmount）发生之前触发。此时组件实例依然完全可用，所有的响应式数据、计算属性和方法都处于可访问状态。
* **工程价值**：这是防止内存泄漏的最后一道防线。如果在组件内开启了定时器而不在销毁前 `clearInterval`，该定时器会在后台持续运行，占用内存并可能导致逻辑冲突。

---

### 3. 代码实现示例

在 Composition API 风格下，通常会将逻辑封装在一起，提高代码的可维护性：

```javascript
import { onMounted, onBeforeUnmount, ref } from 'vue';

export default {
  setup() {
    const timer = ref(null);

    onMounted(() => {
      // 1. 执行数据初始化
      fetchData();
      // 2. 开启资源
      timer.value = setInterval(() => {
        console.log('执行轮询任务');
      }, 1000);
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      // 3. 清理资源，避免内存泄漏
      clearInterval(timer.value);
      window.removeEventListener('resize', handleResize);
      console.log('资源已释放');
    });

    return { /* ... */ };
  }
};

```

### 4. Vue 2 风格的对应关系

如果是维护旧项目，对应的钩子分别是：

* **`mounted`**：对应 Vue 3 的 `onMounted`。
* **`beforeDestroy`**：对应 Vue 3 的 `onBeforeUnmount`。

</details>

## 10. 在Vue项目中，如何实现全局状态管理？ {#question-bb28cc54-ee38-4d6c-bb9c-cc2116d8948a}

> 难度：3 · 类型：QA

### 题目要点

* **首选方案**：Vue 3 优先使用 **Pinia**，因其轻量化、模块化和完美的 TS 支持。
* **版本适配**：Vue 2 依然推荐 **Vuex** 以保持单向数据流的严谨性。
* **按需选择**：中小型项目可利用 **Composition API** 导出响应式对象实现自研状态管理，降低复杂度。
* **依赖注入**：利用 **Provide/Inject** 解决特定组件树内的状态共享问题，避免属性钻取（Props Drilling）

<details>
<summary>参考答案</summary>

在 Vue 的工程化实践中，全局状态管理经历了从简单的全局对象到复杂框架的演进。

实现方式的选择通常取决于项目的规模、团队的习惯以及所使用的 Vue 版本。

以下是几种主流的实现方案及其底层逻辑。

### 1. Pinia：官方推荐的现代方案

在 Vue 3 生态中，Pinia 已经取代 Vuex 成为官方首选。它抛弃了冗长的 Mutation，采用了更扁平、更符合直觉的设计。

* **实现机制**：Pinia 本质上是利用了 Vue 3 的 `reactive` 和 `ref` 来创建跨组件共享的响应式存储。
* **工程优势**：
* **极佳的 TypeScript 支持**：无需复杂的类型定义即可获得完善的类型推断。
* **模块化架构**：每个 Store 都是独立的，可以按需引入，避免了大型项目中状态树过于臃肿的问题。
* **符合组合式 API**：其 `setup` 风格的 Store 定义方式与 Vue 3 的开发习惯高度一致。

### 2. Vuex：经典的集中式存储

对于现存的 Vue 2 项目或特定架构的大型应用，Vuex 依然是核心。

* **设计模式**：采用严格的单向数据流。通过 `State` 定义数据，`Getter` 处理派生状态，`Mutation` 同步修改数据，`Action` 处理异步逻辑。
* **核心价值**：这种严格的约束虽然增加了代码量，但在多人协作的大型项目中，能够提供清晰的调试轨迹。配合 Vue Devtools，可以实现“时光旅行”式的状态回溯。

### 3. Composition API (Reactive/Ref)：轻量级原生实现

如果项目逻辑简单，不需要调试工具支持或复杂的模块拆分，完全可以利用 Vue 3 的响应式原生能力实现一个微型状态管理。

* **实现方式**：创建一个独立的 JS 文件，使用 `reactive` 或 `ref` 定义状态并导出。
* **逻辑**：
```javascript
// store.js
import { reactive } from 'vue';
export const globalState = reactive({
    count: 0,
    increment() { this.count++ }
});

```

* **优点**：无需引入额外库，打包体积小，性能极高。

### 4. Provide / Inject：跨层级依赖注入

适用于父组件向深层嵌套的子组件传递状态，而非真正意义上的“全局”状态。

* **场景**：常用于开发组件库或局部复杂的插件架构。
* **响应式配合**：通过 `provide` 传递一个响应式的 `ref` 或 `reactive` 对象，子组件通过 `inject` 接收，从而实现跨组件的同步。

### 5. 外部状态总线 (EventBus)

在 Vue 3 中，由于官方移除了 `$on` 和 `$emit` 实例方法，传统的 EventBus 已不再推荐使用。如果必须使用，通常需要引入第三方库如 `mitt`。这更多用于非父子组件间的瞬时消息通信，而非状态持久化。

</details>

## 11. Vue路由的原理是什么？请简述Vue Router如何实现页面跳转和组件的动态加载。 {#question-86e910ba-7ddf-4664-9b5d-d4076da14992}

> 难度：2 · 类型：QA

### 题目要点

* **路由监听**：Hash 模式靠 `hashchange` 事件，History 模式靠 `pushState` API 和 `popstate` 事件。
* **视图同步**：利用 Vue 的响应式原理，通过修改全局路由对象触发 `<router-view>` 组件的重绘。
* **懒加载机制**：利用 ES6 动态导入语法，配合打包工具实现代码分包，按需从服务器拉取组件代码。
* **流程控制**：通过一套复杂的导航守卫体系，控制跳转过程中的权限验证和逻辑处理。

<details>
<summary>参考答案</summary>

在 Vue 的单页面应用（SPA）架构中，Vue Router 的核心目标是：**改变 URL 但不刷新页面，并根据 URL 映射对应的组件进行渲染**。

这主要依赖于浏览器提供的原生能力以及 Vue 的响应式系统。

### 1. 核心原理：监听 URL 的变化

Vue Router 主要支持两种模式来拦截 URL 的变动：

* **Hash 模式**：
利用 URL 中 `#` 及其后面的部分。当 `#` 后的路径发生变化时，浏览器不会向服务器发送请求，但会触发 `hashchange` 事件。Vue Router 通过监听该事件来感知路由变化。
* **History 模式**：
利用 HTML5 提供的 `history.pushState` 和 `history.replaceState` API。这两个 API 允许开发者在不刷新页面的前提下修改浏览器的历史记录栈和当前的 URL。同时，通过监听 `popstate` 事件，可以捕获用户点击浏览器前进/后退按钮的行为。

### 2. 实现页面跳转的逻辑

当用户触发跳转（如点击 `<router-link>` 或调用 `router.push`）时，Vue Router 执行以下流程：

1. **路径匹配**：根据目标 URL，在预先定义的路由映射表（Routes Map）中查找对应的路由记录。
2. **执行导航守卫**：依次触发全局守卫、路由独享守卫和组件内守卫，确认是否允许本次跳转。
3. **更新响应式状态**：一旦确认跳转，Vue Router 会更新内部的一个响应式变量（通常是 `_route`）。
4. **触发视图渲染**：由于 `<router-view>` 组件强依赖于这个响应式的路由对象，当该对象变化时，Vue 的响应式系统会触发 `<router-view>` 的重新渲染，从而替换展示的组件。

### 3. 组件的动态加载（路由懒加载）

为了优化首屏加载速度，Vue Router 支持路由懒加载，其核心结合了 **ES 模块的动态导入（Dynamic Import）** 和 **Webpack/Vite 的代码分包（Code Splitting）** 功能。

* **定义方式**：在路由配置中使用 `component: () => import('./Home.vue')`。
* **实现原理**：
* **构建阶段**：打包工具识别出 `import()` 语法，会将对应的组件及其依赖单独打包成一个独立的 JS 文件（Chunk）。
* **运行阶段**：当路由匹配到该路径时，Vue Router 会执行这个函数。此时浏览器会通过网络请求去下载对应的 Chunk 文件。
* **异步渲染**：下载完成后，Vue Router 会将加载到的组件内容缓存起来，并渲染到 `<router-view>` 中。

</details>

## 12. Vue3 中的 Teleport 是什么，有哪些应用场景？ {#question-064f60ae-a57b-4a78-bba1-36b2138ff704}

> 难度：3 · 类型：QA

### 题目要点

1. `Teleport` 的核心作用是**逻辑内聚、渲染分离**。
2. 常用于弹窗、提示、抽屉、全局蒙层、浮动工具栏等场景。
3. 保持了组件的响应式逻辑与上下文一致，同时解决了 DOM 层级与布局限制问题。

<details>
<summary>参考答案</summary>

`Teleport` 是 Vue 3 引入的一个内置组件，用于**将组件模板的一部分渲染到 DOM 树中的任意位置**，而不是受限于父组件的层级结构。它的核心价值在于「逻辑结构」与「渲染位置」的分离。

在日常开发中，`Teleport` 常用于处理那些**在视觉层面需要脱离当前组件层级、但逻辑上仍属于当前组件的 UI 元素**。

### 一、典型应用场景

**1. 全局弹窗、对话框、抽屉**
在模态弹窗、消息提示、全局遮罩等场景中，若直接将内容嵌入在业务组件内，会导致层级受限（例如被父容器的 `overflow:hidden`、`z-index` 影响）。
使用 `Teleport` 可以将弹窗节点渲染到 `body` 下，确保显示层级最高，同时又能与业务逻辑组件保持同一个上下文。

```vue
<template>
  <button @click="visible = true">打开弹窗</button>
  <teleport to="body">
    <div v-if="visible" class="dialog-mask">
      <div class="dialog">
        <p>这是一个弹窗</p>
        <button @click="visible = false">关闭</button>
      </div>
    </div>
  </teleport>
</template>
```

---

**2. 全局提示、通知组件（如 Message / Toast）**
这类组件需要在页面顶层渲染，但往往由业务组件触发。
通过 `Teleport`，消息组件可始终固定渲染在 `body` 下，避免受局部布局影响。

---

**3. 固定在页面某个容器外的元素**
在布局复杂的页面中，有时需要将某些内容渲染到页面顶部或侧边固定栏（例如固定操作条、侧边工具栏、悬浮按钮）。
使用 `Teleport` 可以轻松将这部分内容渲染到指定容器，而无需打乱父组件结构。

---

**4. 嵌入第三方容器（如 iframe 内部或独立 DOM 节点）**
在微前端、图表系统等场景中，`Teleport` 可以将 Vue 组件渲染进非 Vue 管理的 DOM 节点内，实现跨框架或跨区域渲染。

### 二、注意点与机制

1. `Teleport` 仅影响渲染位置，不影响组件的响应式逻辑和上下文作用域。
   被传送的节点仍然处于原组件的响应系统中，可直接访问响应式数据、计算属性、方法等。

2. 可以动态切换 `to` 的目标容器，实现“动态挂载目标”的场景，例如某个模块在不同布局下挂载到不同的区域。

3. 若使用 SSR，需要注意目标容器是否在服务端存在；一般建议在客户端挂载时再执行传送。

</details>

## 13. 为什么需要Pinia或Vuex？如果不使用状态管理工具，如何实现跨组件通信？替代方案有哪些？ {#question-2652fd1d-bf4b-436f-a213-76cd8a5af4b9}

> 难度：3 · 类型：QA

### 题目要点

Pinia 和 Vuex的价值在于集中化、可追踪、可维护的状态管理，适合复杂项目。
如果不使用状态管理工具，也能通过 props/emits、事件总线、provide/inject、全局对象等实现跨组件通信。但这些方式在状态规模扩大后往往会导致维护成本增加，因此在项目复杂度提升时，引入专业的状态管理工具是更优解。

<details>
<summary>参考答案</summary>

在 Vue 应用中，Pinia 和 Vuex 这样的状态管理工具，本质上是为了解决复杂场景下的 **状态一致性、跨组件通信和可维护性** 问题。

**一、为什么需要 Pinia 或 Vuex**

在大型应用里，状态往往不再局限于单个组件，而是需要在多个页面、多个模块之间共享。例如：用户登录信息、全局配置、权限信息、主题设置等。

* **集中管理**：通过统一的 Store 管理状态，避免数据分散在各个组件中，难以追踪和维护。
* **响应式更新**：状态变更后，依赖它的所有组件能自动响应更新，避免手动传参或事件触发。
* **调试与可追踪**：Vuex 提供了严格的 Mutations 流程，Pinia 结合 DevTools，也能很方便地追踪数据流转，利于调试。
* **团队协作**：在多人开发时，全局状态集中管理能减少数据不一致、逻辑重复等问题。

**二、不使用状态管理工具的跨组件通信方式**

如果项目不大或者场景简单，不一定非要引入 Vuex/Pinia。常见替代方案包括：

1. **Props 与 Emits（父子通信）**

   * 最基础的方式，父组件通过 Props 下发数据，子组件通过 Emits 通知父组件更新。
   * 适合层级不深、关系紧密的组件间通信。

2. **自定义事件总线（Event Bus）**

   * 可以通过一个独立的 mitt 实例（轻量事件库）在任意组件间发布/订阅事件。
   * 例如：A 组件触发 `bus.emit('update')`，B 组件监听 `bus.on('update')`。
   * 缺点是随着事件增多，维护成本会变高。

3. **依赖注入（provide/inject）**

   * Vue3 提供了 `provide/inject`，允许祖先组件向任意后代组件注入数据，而无需逐层传递。
   * 适合做全局配置、主题、上下文等场景。
   * 但不具备像 Vuex/Pinia 那样的调试工具和模块化能力。

4. **全局单例对象**

   * 在外部定义一个普通的对象或 reactive 状态，然后在各个组件中直接引用。
   * 简单粗暴，但可维护性差，缺乏规范。

5. **URL/路由参数或 LocalStorage**

   * 对于一些页面级数据，可以通过路由 query 或 localStorage/sessionStorage 实现共享。
   * 更适合持久化数据，而不是高频率更新的数据。

**三、替代方案的适用场景**

* **小型项目/简单状态**：直接用 props/emits、provide/inject 就足够。
* **中型项目/事件驱动场景**：可以用 mitt 或全局对象，快速实现跨组件通信。
* **大型项目/多人协作/状态复杂**：推荐使用 Pinia（更轻量现代）或 Vuex（规范性强）。

</details>

## 14. Vue3的addRoute与React Router的动态useRoutes有何区别？如何解决动态路由刷新后失效的问题？ {#question-fb3f4b9d-6d6c-4b51-8c8d-105a621b420b}

> 难度：3 · 类型：QA

### 题目要点

Vue3 的 `addRoute` 属于“增量挂载”，可以在运行时动态向现有路由表中追加新配置；React Router 的 `useRoutes` 则是基于配置对象动态生成，强调整体渲染而不是单点挂载。动态路由刷新后失效的根本原因是路由配置只存在于内存中，需要在应用初始化时通过本地存储或接口请求恢复路由数据，才能保证页面刷新后仍能正确访问。

<details>
<summary>参考答案</summary>

在 Vue3 和 React Router 中，动态路由的思路相似，都是在运行时根据权限或数据来生成路由，但实现方式和运行机制存在明显差异。

**一、Vue3 的 `addRoute`**

Vue Router 提供了 `router.addRoute(record)` 方法，可以在运行时直接向路由系统注册新的路由配置：

* 可以单独添加一级路由，也可以通过指定父路由 `name` 向某个已有的路由下添加子路由。
* 添加后的路由与静态声明的路由没有区别，后续导航都能正常识别。
* 这种方式下，路由记录会被持久挂载在内存的路由表中，因此在应用运行期间，只要不刷新页面，动态路由都能生效。

**二、React Router 的 `useRoutes`**

React Router v6 并没有提供类似 `addRoute` 的 API，而是通过函数式的 `useRoutes(routeObjects)` 来接收一份路由配置对象数组。

* 本质上，每次调用 `useRoutes` 都是根据传入的配置重新生成路由树。
* 动态路由需要通过状态管理（如 Redux、Context）来保存路由配置，然后传入 `useRoutes`，从而实现动态渲染。
* 不同于 Vue 的“增量挂载”，React 的方式更接近“整体重绘”，配置变动时需要重新计算路由树。

**三、动态路由刷新后失效的问题**

无论 Vue 还是 React，都可能遇到：用户登录后动态挂载了路由，但刷新浏览器页面后，这些动态路由丢失，导致页面无法匹配的问题。根本原因在于：动态路由信息是运行时添加的，刷新会导致内存状态丢失。

解决思路一般有两类：

1. **持久化动态路由信息**：

   * 在用户登录时，将权限或路由信息存储在本地（localStorage/sessionStorage）或 Vuex/Redux，并在应用初始化时根据这些数据重新生成动态路由。
   * 例如 Vue 中可以在 `router.beforeEach` 守卫里检查是否需要重新添加路由，React 中则在根组件初始化时恢复路由配置再传入 `useRoutes`。
2. **后端兜底校验与白屏避免**：

   * 在首屏渲染前先请求权限数据或路由数据，等数据回来后再生成路由结构，这样能避免刷新导致的“无路由”问题。
   * 结合 Loading 页面或骨架屏，让用户体验平滑。

</details>

## 15. Vue2中为什么需要$set方法？如何用它解决对象新增属性的响应性问题？ {#question-d6a85a95-95f9-4606-a98d-280bd6c82c9b}

> 难度：3 · 类型：QA

### 题目要点

* **问题来源**：Vue 2 的响应式依赖 `Object.defineProperty`，只能劫持已有属性
* **解决方案**：`$set` / `Vue.set`
* **作用**：新增属性或修改数组索引时，保证响应式生效并更新视图
* **使用场景**：对象动态添加字段、数组通过索引修改元素

<details>
<summary>参考答案</summary>

在 Vue 2 中，需要 `$set` 的核心原因是 **对象属性的新增在 Vue 2 中无法被自动侦测**，即响应式系统的局限性。

## 1. Vue 2 响应式原理回顾

* Vue 2 使用 `Object.defineProperty` 对 `data` 对象的每个属性进行 getter/setter 劫持，实现响应式。
* 但 **只能劫持已存在的属性**。
* 因此，对对象新增属性时，Vue 无法侦测到变化，也无法触发视图更新。

示例：

```js
data() {
  return {
    user: { name: 'Alice' }
  }
},
mounted() {
  this.user.age = 18 // ❌ 无法触发视图更新
}
```

---

## 2. `$set` 的作用

* Vue 提供 `$set`（或全局 `Vue.set`）来显式添加响应式属性。
* 它的作用是：

  1. 在对象或数组上新增属性
  2. 保证该属性是 **响应式的**
  3. 自动触发视图更新

### 示例

```js
this.$set(this.user, 'age', 18) // ✅ 响应式，视图会更新
```

等价于：

```js
Vue.set(this.user, 'age', 18)
```

---

## 3. `$set` 对数组的作用

* Vue 2 数组在某些操作（如通过索引直接赋值 `arr[index] = value`）也不会触发视图更新。
* 通过 `$set` 可以解决：

```js
this.$set(this.items, 1, 'newValue') // 正确更新视图
```

---

## 4. 使用场景总结

1. **对象新增属性**

```js
this.$set(obj, 'newProp', value)
```

2. **数组通过索引修改元素**

```js
this.$set(arr, index, newValue)
```

3. **保证响应式系统能够侦测到变化**

* 不用 `$set`，新增或修改可能导致视图不更新

---

## 5. Vue 3 的变化

* Vue 3 使用 **Proxy** 实现响应式，不再存在 `$set` 的限制
* 对象新增属性、数组索引赋值都可以自动触发视图更新

</details>

## 16. Vue3中v-model的改进是什么？如何用defineModel简化代码？ {#question-2446e942-5af4-4e38-98b5-5bb96b968a2c}

> 难度：3 · 类型：QA

### 题目要点

* **Vue 3 改进点**：

  1. 支持多 `v-model`（`v-model:propName`）
  2. 不再固定 `value`，绑定任意 prop
  3. 基于 Proxy 的响应式系统

* **defineModel 优势**：

  * 减少重复代码（无需手动定义 props/emits）
  * 直接操作变量即可触发双向绑定
  * 与 `&lt;script setup&gt;` 组合式 API 自然结合

<details>
<summary>参考答案</summary>

在 Vue 3 中，`v-model` 做了显著改进，相比 Vue 2，更加灵活和可配置，同时减少了模板中重复代码。

## 1. Vue 3 中 v-model 的改进

### 1.1 支持 **多 v-model**

* Vue 2 组件只能通过单个 `v-model` 绑定 `value` + `input`。
* Vue 3 支持给组件定义多个 `v-model`，可以绑定不同的属性和事件。

```vue
<MyComponent
  v-model:title="pageTitle"
  v-model:count="itemCount"
/>
```

对应组件内部：

```vue
defineProps(['title', 'count'])
const emit = defineEmits(['update:title', 'update:count'])

function updateTitle(newTitle) {
  emit('update:title', newTitle)
}
```

### 1.2 指定绑定的 **prop 名称**

* Vue 3 不再固定 `value` 属性，`v-model:propName` 可以绑定任意 prop，并生成 `update:propName` 事件。
* 语法更直观，避免只能用 `value` 的局限。

---

## 2. v-model 的原理变化

* Vue 3 不再依赖 `Object.defineProperty`，而是用 **Proxy** 实现响应式。
* `v-model` 的双向绑定原理依然是：

  1. **数据 → 视图**：绑定 prop
  2. **视图 → 数据**：通过触发 `update:propName` 事件，父组件更新数据

```vue
<!-- 父组件 -->
<MyInput v-model="msg" />

<!-- 子组件 -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

---

## 3. 使用 `defineModel` 简化代码

`defineModel` 是 Vue 3.3+ 提供的 **组合式 API**，用于在 `&lt;script setup&gt;` 中声明 `v-model` 绑定属性和事件，减少手动编写 `defineProps` + `defineEmits` 的模板。

### 示例

#### 传统方式

```vue
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

#### 使用 `defineModel`

```vue
<script setup>
const modelValue = defineModel() // 自动生成 props + emits

function onInput(e) {
  modelValue.value = e.target.value // 自动触发 update:modelValue
}
</script>
```

### 特点

1. 自动生成 `props` + `emits`，简化模板和代码
2. 可直接使用 `ref` 风格修改值，内部会触发 `update:modelValue`
3. 支持默认值、类型声明和验证

</details>

## 17. Vue2中v-model的实现原理 {#question-e8f52755-fec1-4489-9163-a7fb4216b0b2}

> 难度：2 · 类型：QA

### 题目要点

1. **本质**：`v-model` = 数据绑定 + 事件监听（语法糖）
2. **核心机制**：

   * `Object.defineProperty` 劫持数据，实现响应式
   * 指令编译器绑定 `value/checked` 和事件
   * Watcher/Dep 通知视图更新
3. **在组件上**：约定 `value` + `input` 事件即可实现双向绑定

<details>
<summary>参考答案</summary>

在 Vue 2 中，`v-model` 的本质是 **语法糖**，它本质上是对 **`value`（或 `checked`）属性绑定 + `input` 事件监听** 的封装。理解它的实现原理，需要从 **指令编译机制** 和 **双向绑定逻辑** 入手。

---

## 1. `v-model` 的核心原理

假设在模板中写：

```vue
<input v-model="msg">
```

编译后的大致效果等价于：

```vue
<input
  :value="msg"
  @input="msg = $event.target.value"
/>
```

### 分析：

1. **`:value="msg"`**

   * 将 Vue 实例中的 `msg` 属性绑定到 input 的 value 上。
   * 当 `msg` 发生变化时，视图自动更新（单向绑定）。

2. **`@input="msg = $event.target.value"`**

   * 监听用户输入事件，将 input 的值同步回 Vue 实例的数据。
   * 完成从视图到数据的更新，实现双向绑定。

---

## 2. 内部实现机制

### 2.1 数据劫持（双向绑定）

* Vue 2 利用 **`Object.defineProperty`** 对 `data` 中的属性进行 getter/setter 劫持。
* 当数据发生变化时，会触发 **Watcher** 更新视图。
* 当用户输入触发 `input` 事件时，通过事件回调修改数据，setter 被触发，视图更新。

### 2.2 指令编译

* Vue 编译模板时，会检测到 `v-model` 指令：

  * 对 **文本输入框 (`input[type=text]`)**，绑定 `value` + `input`
  * 对 **复选框 (`input[type=checkbox]`)**，绑定 `checked` + `change`
  * 对 **单选框 (`input[type=radio]`)**，绑定 `checked` + `change`
  * 对 **`<select>`**，绑定 `value` + `change`
* 这些规则都是在 Vue 的 **`v-model` 指令编译器**里实现的。

### 2.3 Watcher 和 Dep

* 每个绑定的数据属性都有一个 **依赖收集器（Dep）**
* 当数据被访问时，收集依赖（Watcher）
* 当数据被修改时，Dep 通知所有 Watcher 更新视图

---

## 3. 自定义组件上的 v-model

在 Vue 2 中，`v-model` 也可以用于组件。原理是：

```vue
<my-input v-model="msg" />
```

* 编译后等价于：

```vue
<my-input
  :value="msg"
  @input="msg = $event"
/>
```

* 组件需要：

  * 接收 `value` 属性
  * 在内部触发 `this.$emit('input', newValue)`
* Vue 通过这个约定，实现组件上的双向绑定。

</details>

## 18. 在Vue中，为什么推荐使用ref而非直接操作DOM？ {#question-965437c7-3f6d-4855-94f7-fa62c3e73196}

> 难度：3 · 类型：QA

### 题目要点

在 Vue 中推荐使用 `ref` 而非直接操作 DOM，是为了 **保持响应式编程思想、提高代码可维护性、避免全局污染、增强组件化支持，以及兼容 SSR 和未来扩展**。
直接操作 DOM 只能作为「最后手段」，通常用于操作第三方库或必须访问底层 DOM 的场景。

<details>
<summary>参考答案</summary>

### 1. **保持响应式编程思想**

* Vue 的核心理念是 **数据驱动视图**。
* 如果你频繁通过 `document.querySelector`、`getElementById` 等方式直接操作 DOM，就等于绕过了 Vue 的响应式系统，破坏了「数据变化 → 视图自动更新」的逻辑。
* `ref` 是 Vue 提供的 **在响应式体系内获取 DOM 或组件实例的方式**，不会违背 Vue 的设计哲学。

### 2. **保证可维护性和可读性**

* 使用 `ref` 获取 DOM 元素或子组件时，逻辑清晰，绑定关系一目了然：

```vue
<template>
  <input ref="inputEl" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const inputEl = ref(null)

onMounted(() => {
  inputEl.value.focus()
})
</script>
```

* 而如果用 `document.querySelector('input')`，就会出现以下问题：

  * 不直观，不知道选中的是不是自己想要的节点。
  * 如果 DOM 结构变化，选择器很容易失效。

### 3. **避免全局作用域污染**

* 原生 DOM 操作往往是「全局查询」的，比如 `document.querySelector`。
* 当页面很大时，可能会选中不该选的 DOM，造成隐蔽的 bug。
* `ref` 是 **组件作用域内的绑定**，不会误伤其它组件。

### 4. **更好地支持组件和生命周期**

* `ref` 不仅能绑定 DOM，还能绑定 **组件实例**：

```vue
<ChildComponent ref="child" />

onMounted(() => {
  console.log(child.value.someMethod())
})
```

* 这种方式比手动查找 DOM、再找对应组件要安全得多。
* 而且 `ref` 在 Vue 的生命周期中是有保证的（例如在 `onMounted` 之后才能访问），不会出现 DOM 还没挂载就被访问的情况。

### 5. **利于服务端渲染（SSR）和未来扩展**

* Vue 在 SSR 或虚拟 DOM 渲染时，不依赖真实 DOM，而是依赖 `ref` 提供的抽象。
* 直接操作 DOM 会导致 **不可移植**，在非浏览器环境下不可用，而 `ref` 更加通用。

</details>

## 19. vue3 中 ref 和 reactive 有什么区别? {#question-b1973f12-5610-430d-9f0b-6c081eda334c}

> 难度：3 · 类型：QA

### 题目要点

`ref` 是对单个值进行响应式包装，通过 `.value` 进行依赖追踪，适合基本类型或需要整体替换的数据；`reactive` 是对对象进行 Proxy 代理，按属性粒度建立响应关系，适合结构化状态；二者在解构行为、替换能力以及依赖收集粒度上存在本质差异，实际工程中通常组合使用，以在可维护性与更新性能之间取得平衡。

<details>
<summary>参考答案</summary>

在 Vue 3 中，`ref` 与 `reactive` 都用于创建响应式数据，但二者并不是简单的“语法差异”，而是**响应式模型设计层面的两种不同抽象**。

理解它们的区别，需要从数据包装方式、依赖追踪粒度以及使用场景来看。

---

## 一、本质区别：响应式包装模型不同

### `ref` —— 对“值”的响应式封装

`ref` 的核心思想是：**把一个值包装成一个带 `.value` 的响应式容器**。

```js
const count = ref(0);
```

内部结构可以抽象理解为：

```js
{
  value: 0  // getter/setter 被 Proxy 或响应系统追踪
}
```

Vue 追踪的是：

```text
count.value
```

也就是说，响应性绑定在 `.value` 上。

它既可以包裹：

* 基本类型（number、string、boolean）
* 对象
* 数组

---

### `reactive` —— 对“对象结构”的代理

`reactive` 的核心思想是：**直接代理一个对象本身**。

```js
const state = reactive({
  count: 0
});
```

Vue 会通过 Proxy 拦截：

```text
state.count 的 get / set
```

依赖追踪粒度是 **对象属性级别**。

---

## 二、最关键的设计差异

### 1. 响应式单位不同

* `ref`：以“单值”为响应单位
* `reactive`：以“对象属性”为响应单位

例如：

```js
const r = ref({ a: 1 });
const s = reactive({ a: 1 });
```

更新方式：

```js
r.value = { a: 2 }; // 整体替换
s.a = 2;            // 属性级修改
```

---

### 2. 是否需要 `.value`

这是使用体验上的明显区别。

```js
count.value++   // ref
state.count++   // reactive
```

原因在于：

* `ref` 是容器对象
* `reactive` 本身就是代理对象

不过在模板中 Vue 会自动解包 ref：

```html
{{ count }}  <!-- 自动访问 .value -->
```

---

### 3. 对解构的影响不同

这是实际开发中非常重要的一点。

#### reactive 解构会丢失响应性

```js
const state = reactive({ count: 0 });
const { count } = state; // 非响应式
```

因为解构得到的是普通值。

需要：

```js
toRefs(state);
```

---

#### ref 不存在这个问题

```js
const count = ref(0);
```

变量本身就是响应式引用。

---

### 4. 替换能力不同（非常关键）

`reactive` 不能安全整体替换：

```js
state = { count: 1 }; // 响应性丢失
```

因为 Proxy 已绑定旧对象。

而 `ref` 天然支持整体替换：

```js
stateRef.value = newState;
```

这也是为什么在很多 store 设计中优先使用 ref。

---

## 三、依赖收集粒度差异

Vue 3 的更新是基于访问路径追踪的：

* `reactive` → `target + key`
* `ref` → 单一 dep

因此：

* `reactive` 更适合复杂结构
* `ref` 更适合频繁整体替换的数据

---

## 四、工程实践中的选择原则

通常不是二选一，而是组合使用：

* 基础类型状态 → `ref`
* 局部对象状态 → `reactive`
* 可整体替换的数据源 → `ref`
* 表单或结构化状态 → `reactive`

很多状态管理库（如 Pinia）内部实际上大量使用 `ref` 来避免对象替换问题。

---

## 五、为什么 Vue 3 同时保留两套 API

Vue 2 的响应式基于 `Object.defineProperty`，只能处理对象属性。

Vue 3 引入 Proxy 后，本可以统一模型，但仍保留 `ref`，原因是：

1. JavaScript 基本类型无法被 Proxy
2. 需要显式的“引用语义”
3. 提供更可控的依赖粒度
4. 支持函数式组合（Composition API）

本质上：

> `ref` 提供值语义（value semantics），`reactive` 提供对象语义（object semantics）。

</details>

## 20. template 标签为什么不可以使用 v-show？ {#question-438de2d9-956c-42b4-bdad-eadd89ddaca6}

> 难度：1.5 · 类型：QA

### 题目要点

- **`<template>`** 是一个 **占位符标签**，它本身不会被渲染成 DOM 元素，所以无法使用 `v-show`。
- 如果要控制条件渲染或显示/隐藏，应该将 `v-show` 或 `v-if` 应用到实际的 DOM 元素（如 `<div>`、`<span>` 等）上，而不是 `<template>` 本身。

<details>
<summary>参考答案</summary>

`<template>` 标签在 Vue 中是一个 **占位符元素**，它本身在渲染时不会生成任何实际的 DOM 元素，只是为了包裹一些结构或逻辑，帮助开发者更好地组织模板内容。因此，`<template>` 标签没有实际的渲染结果，它的存在只在编译和渲染过程中起到作用。

### 为什么 `v-show` 不能直接用于 `<template>`？

1. **`v-show` 是基于 `display` 样式控制元素的显示和隐藏的**：
   - 当使用 `v-show` 时，Vue 会动态控制绑定元素的 `display` 样式。如果元素被隐藏，`display: none` 会被应用到该元素，反之则会恢复为正常的显示状态。
   - 然而，`<template>` 本身并不会渲染任何真实的 DOM 元素。它的作用仅限于包裹其他元素，并不生成实际的 HTML 元素。因此，`v-show` 并不适用于 `<template>` 标签。

2. **`<template>` 没有实际的 DOM 元素**：
   - `v-show` 操作的是 DOM 元素的样式，而 `<template>` 本身并不渲染为一个真实的 DOM 元素，因此 `v-show` 无法对 `<template>` 标签本身进行样式控制。

### 示例：
如果你在 Vue 中使用 `v-show` 绑定到 `<template>` 上，会得到一个警告，并且不会起作用：

```vue
<template v-show="isVisible">
  <div>内容</div>
</template>
```
这种情况下，Vue 会提示 `v-show` 不能直接应用在 `<template>` 标签上，因为 `<template>` 并不渲染任何实际的 DOM 元素。

### 正确的使用方式：
如果你想根据条件控制 `<template>` 中的内容的显示与隐藏，可以将 `v-show` 或 `v-if` 应用到 `<template>` 内部的实际渲染元素上：

```vue
<template>
  <div v-show="isVisible">
    内容
  </div>
</template>
```

或者使用 `v-if` 来实现条件渲染：

```vue
<template>
  <div v-if="isVisible">
    内容
  </div>
</template>
```

</details>

## 21. watch与watchEffect 有什么区别，分别在什么场景下使用？ {#question-a75d5604-a4f4-410b-9ec9-f5f5f90de35e}

> 难度：2.5 · 类型：QA

### 题目要点

- **`watch`**：适用于需要明确指定哪些响应式数据变化时才执行副作用的场景。它适用于监听特定数据并获取旧值，通常用于执行需要依赖旧值或多个源数据的逻辑。
- **`watchEffect`**：适用于需要自动响应多个响应式数据变化并立即执行副作用的场景，尤其是在你不关心旧值时，它简化了代码结构。

在选择时，如果你需要明确控制哪些数据触发副作用，或者需要旧值，可以使用 `watch`。如果你希望自动跟踪并响应多个数据的变化，可以使用 `watchEffect`，这样可以避免手动列出所有依赖。

<details>
<summary>参考答案</summary>

`watch` 和 `watchEffect` 是 Vue 3 中用于响应式数据变化的两个 API，它们都可以用于监听和响应数据的变化，但有一些关键的区别。理解这两个 API 的不同用途和行为对于有效地使用 Vue 3 的响应式系统非常重要。

### **1. `watch`**
`watch` 是 Vue 3 中用于监听特定的响应式数据变化的 API。你可以选择一个或多个响应式源，并在其变化时执行相应的回调函数。

#### **基本用法**
```javascript
import { ref, watch } from 'vue';

const count = ref(0);

watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`);
});

// 修改 count 时触发 watch
count.value = 1;
```

#### **特点**
- **监听指定的响应式数据**：你需要明确指定要监听的目标，可以是一个响应式数据、多个响应式数据或 getter 函数。
- **手动触发回调**：`watch` 只会在你指定的数据变化时触发回调函数，而不是自动运行。需要显式指定要监听的数据。
- **获取旧值**：你可以通过 `watch` 获取到变化前的旧值。

#### **用例**
- 监听单个或多个响应式数据的变化。
- 当数据变化时执行副作用，且可能需要使用旧值。
- 监听复杂的 getter 函数。

#### **示例**
```javascript
import { ref, watch } from 'vue';

const count = ref(0);
const message = ref('Hello');

watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log(`count: ${oldCount} -> ${newCount}, message: ${oldMessage} -> ${newMessage}`);
});

count.value = 1;
message.value = 'World';
```

### **2. `watchEffect`**
`watchEffect` 是 Vue 3 中的一种更简洁的 API，它会自动追踪其内部使用的所有响应式数据并在这些数据变化时执行副作用。它通常用于执行副作用，而不需要显式声明你要监听的响应式数据。

#### **基本用法**
```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);

watchEffect(() => {
  console.log(`count is: ${count.value}`);
});

// 修改 count 时自动触发 watchEffect
count.value = 1;
```

#### **特点**
- **自动追踪响应式数据**：`watchEffect` 会自动追踪其作用域内的所有响应式数据（如 `ref`、`reactive`）的变化，不需要显式指定要监听的数据。
- **立即执行**：`watchEffect` 在注册时会立即执行一次，且执行副作用时会跟踪其内部使用的响应式数据。
- **没有旧值**：`watchEffect` 不会提供旧值，它只关心当前的变化和执行副作用。

#### **用例**
- 执行副作用，如更新 DOM、进行计算或触发其他操作。
- 自动追踪所需的响应式数据，简化监听逻辑。

#### **示例**
```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);
const message = ref('Hello');

watchEffect(() => {
  console.log(`count is: ${count.value}, message is: ${message.value}`);
});

count.value = 1;
message.value = 'World';
```

### **主要区别**

| 特性               | `watch`                                         | `watchEffect`                                   |
|--------------------|------------------------------------------------|------------------------------------------------|
| **触发时机**       | 当指定的数据变化时才触发                      | 在注册时立即执行一次，之后每次所依赖的响应式数据变化时触发 |
| **数据追踪**       | 需要明确指定监听的目标（响应式数据或 getter） | 自动追踪其内部使用的所有响应式数据           |
| **旧值**           | 提供旧值和新值                                | 只有新值，没有旧值                           |
| **用途**           | 用于处理特定数据的变化，如执行计算、API 请求等 | 用于执行副作用，自动反应数据变化             |
| **性能开销**       | 因为明确指定数据，所以可能性能上更高效        | 更方便，但由于自动追踪所有数据，性能上稍高于 `watch` |

</details>

## 22. Pinia 有哪些使用场景？ {#question-532a249c-5130-48c4-ac7e-35c5e5ec4637}

> 难度：2 · 类型：QA

### 题目要点

Pinia 适用的场景非常广泛，涵盖全局状态管理、异步请求、模块化管理、状态持久化、TypeScript 支持等功能。在现代 Vue 3 项目中，Pinia 是轻量、高效、易用的状态管理工具，能够帮助开发者更好地组织和维护复杂的应用逻辑。

<details>
<summary>参考答案</summary>

Pinia 是 Vue.js 官方推荐的状态管理工具，它的设计简单、轻量，适合多种场景使用，特别是在 Vue 3 的项目中。

以下是 Pinia 的主要使用场景及具体说明：

---

### **1. 全局状态管理**
Pinia 的核心功能是管理全局状态，适用于以下场景：
- **跨组件共享数据**：当多个组件需要共享同一份状态时（如用户信息、权限等）。
- **全局状态存储**：如用户登录态、应用设置（语言、主题）、权限配置等。

**示例**：
```javascript
// store/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    username: '',
  }),
  actions: {
    login(username) {
      this.isLoggedIn = true;
      this.username = username;
    },
    logout() {
      this.isLoggedIn = false;
      this.username = '';
    },
  },
});
```

---

### **2. 持久化数据存储**
在需要跨页面或跨会话保留某些数据时，Pinia 可以与持久化插件结合（如 `pinia-plugin-persistedstate`）实现状态持久化。

**适用场景**：
- 保留登录信息、用户配置、购物车数据等。
- 恢复应用的上一次操作状态。

**示例**：
```javascript
import { defineStore } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
  }),
  persist: true, // 开启持久化
});
```

---

### **3. 模块化管理复杂项目**
在大型项目中，Pinia 通过独立 Store 文件管理不同模块的数据和逻辑，避免代码耦合，使代码更清晰。

**适用场景**：
- 项目中存在多个功能模块（如用户、权限、订单、商品管理等），需要对状态进行模块化划分。
- 不同模块间需要数据共享或依赖。

**示例**：
```javascript
// stores/user.js
export const useUserStore = defineStore('user', { /* 用户模块 */ });
// stores/product.js
export const useProductStore = defineStore('product', { /* 商品模块 */ });
```

---

### **4. 异步数据管理**
Pinia 支持直接在 Store 中使用异步操作，可以在 actions 中执行 API 请求，并更新状态。

**适用场景**：
- 处理异步请求（如从后端获取数据并更新全局状态）。
- 在状态管理中封装业务逻辑，避免将复杂逻辑直接写在组件中。

**示例**：
```javascript
import axios from 'axios';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
  }),
  actions: {
    async fetchProducts() {
      const response = await axios.get('/api/products');
      this.products = response.data;
    },
  },
});
```

---

### **5. 组件解耦与状态分离**
Pinia 提供响应式的状态管理，能够让组件逻辑与数据状态分离，适用于以下场景：
- 当组件的数据和逻辑复杂，需要抽离到 Store 中管理。
- 多个组件依赖同一逻辑和数据时，通过 Store 提供统一的接口。

**示例**：
```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});

// 在多个组件中使用：
const counterStore = useCounterStore();
counterStore.increment();
```

---

### **6. 替代 Vuex 进行状态管理**
Pinia 是 Vuex 的现代化替代品，在以下场景中可以选择 Pinia：
- **新项目**：在 Vue 3 项目中推荐直接使用 Pinia。
- **迁移项目**：将旧 Vuex 项目迁移至 Vue 3 时，使用 Pinia 替代 Vuex。

**示例**：
```javascript
// 使用 Pinia 替代 Vuex 语法更简洁
const useStore = defineStore('main', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

---

### **7. 适配 TypeScript 项目**
Pinia 对 TypeScript 支持友好，适合以下场景：
- 项目使用 TypeScript，状态和逻辑需要严格的类型约束。
- 需要提升开发效率，通过类型推导减少错误。

**示例**：
```typescript
import { defineStore } from 'pinia';

interface State {
  count: number;
}

export const useCounterStore = defineStore<'counter', State>('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

---

### **8. 动态创建 Store**
Pinia 支持动态创建 Store，可以根据实际需求动态生成状态管理实例。适用于以下场景：
- 动态模块加载或组件实例化时创建独立的状态实例。

**示例**：
```javascript
import { defineStore } from 'pinia';

export const createDynamicStore = (id) => {
  return defineStore(id, {
    state: () => ({
      data: null,
    }),
  });
};

const storeA = createDynamicStore('moduleA');
const storeB = createDynamicStore('moduleB');
```

</details>

## 23. 说说 Pinia 与 Vuex 的区别 {#question-ae11a7eb-f3b1-487a-9ddc-8c4e29b9d81a}

> 难度：3.5 · 类型：QA

### 题目要点

| 对比点            | Pinia                               | Vuex                              |
|-------------------|-------------------------------------|-----------------------------------|
| **易用性**       | 轻量简单，贴合 Vue3 API             | 配置严格，学习成本较高            |
| **类型支持**     | 内置类型推导，TypeScript 友好        | 类型支持需手动实现                |
| **性能**         | 基于 Vue3 响应式系统，性能更优       | Vue2 响应式性能稍逊              |
| **模块化**       | 扁平化设计，模块更灵活               | 嵌套模块，适合大型项目             |

在 Vue3 中，**Pinia 是官方推荐的状态管理库**，相比 Vuex 更轻量、现代，适合新项目开发；而 Vuex 在一些老旧的 Vue2 项目中仍有广泛使用。

<details>
<summary>参考答案</summary>

Pinia 和 Vuex 是 Vue 生态中两种状态管理工具，它们的功能类似，但在设计理念、用法和性能上存在一些区别。Pinia 是 Vuex 的替代者，并在 Vue3 生态中逐渐成为推荐的状态管理工具。

以下是它们的对比分析：

---

### **1. 基本对比**
| 特性                | Pinia                         | Vuex                          |
|---------------------|-------------------------------|-------------------------------|
| **作者**           | Vue 核心团队成员尤雨溪         | Vue 核心团队                 |
| **版本支持**       | Vue 3（也支持 Vue 2）         | Vue 2 和 Vue 3               |
| **模块化设计**     | 扁平结构，模块化更灵活         | 嵌套模块，需显式声明         |
| **学习成本**       | 简单，语法贴近 Vue 3 Composition API | 较复杂，语法严格             |
| **状态持久化**     | 不支持直接内置功能（需插件）     | 无内置支持                   |
| **开发体验**       | 支持 TypeScript 的类型推导优化  | 支持但需要手动配置           |

---

### **2. 核心区别**

#### **2.1 状态的定义方式**
- **Pinia**：
  - 使用函数形式的 `defineStore` 定义 Store。
  - 状态是基于 `reactive` 的，天然响应式，支持直接解构使用。
  ```javascript
  import { defineStore } from 'pinia';

  const useStore = defineStore('main', {
    state: () => ({
      count: 0,
    }),
    actions: {
      increment() {
        this.count++;
      },
    },
  });
  ```
  解构使用：
  ```javascript
  const { count, increment } = useStore();
  ```

- **Vuex**：
  - 需要严格按模块化、`state`, `mutations`, `actions` 分离定义。
  - 必须通过 `store.commit` 或 `store.dispatch` 修改状态。
  ```javascript
  const store = new Vuex.Store({
    state: {
      count: 0,
    },
    mutations: {
      increment(state) {
        state.count++;
      },
    },
    actions: {
      increment({ commit }) {
        commit('increment');
      },
    },
  });
  ```

---

#### **2.2 模块化**
- **Pinia**：<br>
  没有嵌套模块的概念，推荐按功能模块划分 Store，每个 Store 都是独立的。模块之间通过 Store 引用即可，逻辑清晰。

- **Vuex**：<br>
  通过嵌套的 `modules` 管理状态，每个模块有自己的 `state`、`mutations`、`actions`，适合大型项目，但可能出现层级过深的问题。

---

#### **2.3 使用 TypeScript**
- **Pinia**：<br>
  天然支持 TypeScript，通过 `defineStore` 自动推导类型，开发者无需额外配置，类型友好。
  ```typescript
  const useStore = defineStore('main', {
    state: () => ({
      count: 0,
    }),
  });

  const store = useStore();
  store.count; // TypeScript 自动推断为 number
  ```

- **Vuex**：<br>
  TypeScript 支持较弱，需要手动定义类型，且需要大量模板代码来维护类型定义。
  ```typescript
  interface State {
    count: number;
  }

  const store = new Vuex.Store<State>({
    state: {
      count: 0,
    },
  });

  store.state.count; // 需手动指定类型
  ```

---

#### **2.4 状态修改方式**
- **Pinia**：<br>
  支持直接修改状态，无需通过 `mutations`。逻辑更简单，易于维护。
  ```javascript
  const store = useStore();
  store.count++; // 直接修改状态
  ```

- **Vuex**：<br>
  必须通过 `mutations` 修改状态，不能直接改变 `state`，使得代码较为冗长。
  ```javascript
  store.commit('increment'); // 必须通过 mutations
  ```

---

#### **2.5 开发体验**
- **Pinia**：<br>
  - API 设计对 Vue3 Composition API 友好。
  - 更少的模板代码，逻辑更简洁。
  - 支持更好的开发者工具（devtools）。

- **Vuex**：<br>
  - 使用 Vue2 Options API 更友好。
  - 需要模板代码配置（如 `state`、`mutations`）。

---

### **3. 性能对比**
- **Pinia**：<br>
  - 基于 Vue3 的响应式系统（`reactive` + `ref`），性能更优。
  - 更轻量，设计现代化。

- **Vuex**：<br>
  - 基于 Vue2 的响应式系统（`Object.defineProperty`），性能稍逊。

</details>

## 24. 说说你对 Vue 中异步组件的理解 {#question-3589263a-683a-47d2-8716-191cd1d393bf}

> 难度：3 · 类型：QA

### 题目要点

Vue 中的异步组件是一个非常强大的特性，允许按需加载组件，减少应用的初始加载时间，提高性能。通过使用 `defineAsyncComponent` 和动态 `import()`，开发者可以轻松地实现这一特性，并通过加载状态提高用户体验。然而，使用异步组件时也要注意网络请求带来的开销、管理复杂性以及可能的 SEO 问题。

<details>
<summary>参考答案</summary>

在 Vue 中，**异步组件**是指那些在需要时才加载的组件，而不是在应用初始化时就立即加载。这种机制可以显著提升页面加载速度和用户体验，尤其是在大型单页应用（SPA）中，通过懒加载的方式按需加载组件，避免不必要的资源浪费。

---

### **1. 异步组件的基本概念**
异步组件是在首次访问某个组件时，才通过网络请求或其他方式动态加载的组件。它允许将某些不常用的功能模块延迟加载，只有在用户触发相应操作时才加载相应的组件，从而优化性能。

### **2. 在 Vue 中使用异步组件**
Vue 提供了几种方式来定义异步组件：

#### **2.1. 使用 `defineAsyncComponent`**
在 Vue 3 中，可以使用 `defineAsyncComponent` 函数来定义异步组件。

```javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
);

export default {
  components: {
    AsyncComponent
  }
}
```
在这个例子中，`MyComponent.vue` 组件只有在 `AsyncComponent` 被渲染时才会被加载。

#### **2.2. 使用 `import()` 动态导入**
Vue 也支持通过 JavaScript 的 `import()` 动态导入语法来实现异步组件加载。

```javascript
export default {
  components: {
    // 使用 dynamic import() 语法来实现异步加载
    AsyncComponent: () => import('./components/MyComponent.vue')
  }
}
```
在这个例子中，`MyComponent.vue` 组件将在首次渲染时才会被异步加载。

---

### **3. 异步组件的加载过程**
当你使用异步组件时，组件的加载过程如下：
1. 当 Vue 渲染页面时，如果遇到异步组件，Vue 会立即返回一个占位符（通常是一个空的组件或 `loading` 状态）。
2. Vue 会发起一个请求加载该组件，直到组件加载完成后，Vue 会用加载完成的组件替换占位符并渲染页面。

---

### **4. 异步组件的配合加载状态**
为了提升用户体验，异步组件加载时可以显示一个加载状态（如加载动画）。Vue 提供了几个钩子来管理这些状态：

- **`loading`**：组件正在加载时显示的内容。
- **`error`**：加载失败时显示的内容。
- **`delay`**：设置延迟显示加载状态的时间，避免瞬间加载显示加载状态。
- **`timeout`**：设置加载超时时间，超过时间仍未加载完成会显示错误。

```javascript
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./components/MyComponent.vue'),
  loadingComponent: Loading, // 加载中的组件
  errorComponent: ErrorComponent, // 错误组件
  delay: 200, // 延迟 200ms 显示加载状态
  timeout: 3000 // 超过 3 秒显示错误组件
});
```

---

### **5. 异步组件的优势**
1. **减少初始加载时间**<br>
   将不常用的组件异步加载，减少首次渲染时的资源请求，提升页面加载速度。

2. **按需加载**<br>
   组件只有在需要时才会被加载，避免不必要的资源浪费。

3. **提高用户体验**<br>
   使用 `loading` 和 `error` 占位组件，能够使用户在等待时看到反馈，避免空白或卡顿的情况。

---

### **6. 异步组件的劣势与挑战**
1. **增加 HTTP 请求**<br>
   异步组件会导致额外的网络请求，尤其是在低网络带宽情况下，可能会影响性能。

2. **可能增加复杂性**<br>
   异步加载带来了一些额外的配置，如错误处理、加载状态管理等，可能会增加应用的复杂度。

3. **SEO 问题**<br>
   在传统的服务端渲染（SSR）中，异步组件的内容在初始加载时可能不可见，这会影响搜索引擎的爬取和索引。

</details>

## 25. 怎么理解 Vue3 提供的 markRaw ？ {#question-f8da672c-4231-4dff-990d-9a4a6daebe2c}

> 难度：3 · 类型：QA

### 题目要点

`markRaw` 是 Vue 3 提供的一个重要工具，允许开发者在需要的情况下绕过响应式系统，以提升性能并减少不必要的开销。它适用于那些不需要被 Vue 观察的对象，帮助开发者更灵活地管理应用中的响应式数据。

<details>
<summary>参考答案</summary>

在 Vue 3 中，`markRaw` 是一个用于标记对象的 API，主要用于优化性能和防止 Vue 的响应式系统对某些对象的处理。以下是对 `markRaw` 的详细理解：

### **1. 功能**

- **标记为非响应式**：`markRaw` 可以将一个对象标记为非响应式对象。使用该 API 后，Vue 不会将这个对象转换为响应式对象，任何对其属性的修改都不会触发 Vue 的响应式系统。

### **2. 用法场景**

- **性能优化**：在某些情况下，某些对象（如大型库的实例、第三方插件等）不需要响应式特性，因为它们的属性变化不需要 Vue 进行监测。这时可以使用 `markRaw` 来优化性能。
- **避免不必要的代理**：使用 `markRaw` 可以避免 Vue 对某些对象的代理开销，尤其是当这些对象不会被 Vue 观察或更新时。

### **3. 例子**

```javascript
import { markRaw } from 'vue';

// 一个非响应式的对象
const nonReactiveObj = markRaw({ someProperty: 'value' });

// 使用这个对象
console.log(nonReactiveObj.someProperty); // 'value'

// 修改属性不会触发 Vue 的响应式系统
nonReactiveObj.someProperty = 'new value';
```

### **4. 结合其他 API 使用**

- `markRaw` 通常与 Vue 的响应式 API（如 `reactive`、`ref`）结合使用，用于明确哪些对象需要被监测，哪些对象不需要。

</details>

## 26. Vue 中的 h 函数有什么用？ {#question-ead2f5e6-525a-4faf-956f-d97d90e933fe}

> 难度：2 · 类型：QA

### 题目要点

- `h` 函数是 Vue 中创建虚拟 DOM 的核心工具，灵活性高，支持动态组件、嵌套结构和属性传递。
- 它使得开发者可以在没有模板的情况下，以编程的方式构建组件，适用于复杂的渲染逻辑。
- 在性能上，通过虚拟 DOM 的机制，提升了应用的响应速度和渲染效率。

<details>
<summary>参考答案</summary>

### **1. `h` 函数概述**

在 Vue 中，`h` 函数是一个用于创建虚拟 DOM 节点的工厂函数。它的全称是 `createElement`，在 Vue 3 中，它通常被直接引用为 `h`。

### **2. 基本用法**

`h` 函数的基本语法如下：

```javascript
h(tag, props, children)
```

- **tag**: 字符串或组件对象，表示要创建的 HTML 标签或组件。
- **props**: 可选的属性对象，包含要传递给组件或元素的属性。
- **children**: 可选的子节点，可以是字符串、虚拟 DOM 节点数组或嵌套的 `h` 函数调用。

### **3. 创建虚拟 DOM 示例**

下面是一个简单的使用 `h` 函数创建虚拟 DOM 的示例：

```javascript
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'MyComponent',
  render() {
    return h('div', { class: 'my-class' }, [
      h('h1', 'Hello World'),
      h('p', 'This is a paragraph.'),
    ]);
  },
});
```

在这个例子中，`h` 函数用于创建一个 `div` 元素，包含一个 `h1` 和一个 `p` 标签。返回的结果是一个虚拟 DOM 树。

### **4. 动态组件示例**

使用 `h` 函数可以方便地创建动态组件。例如：

```javascript
import { defineComponent, h, ref } from 'vue';

const MyButton = { template: '<button>Button</button>' };
const MyLink = { template: '<a href="#">Link</a>' };

export default defineComponent({
  name: 'DynamicComponent',
  setup() {
    const isButton = ref(true);

    return { isButton };
  },
  render() {
    const component = this.isButton ? MyButton : MyLink;
    return h(component);
  },
});
```

在这个例子中，根据 `isButton` 的值动态决定渲染哪个组件。

### **5. 与 JSX 结合**

在 Vue 3 中，可以使用 JSX 来书写组件，`h` 函数在这里起到关键作用。示例如下：

```javascript
/** @jsx h */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MyComponent',
  render() {
    return (
      <div class="my-class">
        <h1>Hello World</h1>
        <p>This is a paragraph.</p>
      </div>
    );
  },
});
```

在 JSX 中，每个标签会被转换为 `h` 函数的调用。

### **6. 性能优化**

`h` 函数通过创建虚拟 DOM，Vue 可以在数据变化时比较新旧虚拟 DOM，计算出最小的 DOM 更新，优化性能。这种方式避免了频繁的实际 DOM 操作，从而提升了应用的性能。

</details>

## 27. 手写 vue 的双向绑定 {#question-2ea94d0f-e412-4db2-9d42-20c7eb50284f}

> 难度：4 · 类型：QA

### 题目要点

- **Vue 2**：使用 `Object.defineProperty()` 实现响应式数据，并利用 `watcher` 更新 DOM。
- **Vue 3**：使用 `Proxy` 实现响应式数据，直接代理数据对象，提高性能和简化实现。

<details>
<summary>参考答案</summary>

手写 Vue 的双向绑定可以通过使用 JavaScript 的 `Object.defineProperty()`（在 Vue 2 中）或 `Proxy`（在 Vue 3 中）来实现数据响应式。下面是一个简单的实现示例，展示了如何手动实现双向绑定。

### **1. 使用 `Object.defineProperty()` 实现 Vue 2 风格的双向绑定**

**步骤**：
1. **创建一个 Vue 实例**。
2. **实现数据的响应式**。
3. **创建一个简单的 `watcher` 用于更新 DOM**。
4. **实现双向绑定**。

**示例代码**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue-like Two-way Binding</title>
</head>
<body>
    <div id="app">
        <input type="text" v-model="message">
        <p>{{ message }}</p>
    </div>

    <script>
        // 实现 Vue 实例
        class Vue {
            constructor(options) {
                this.data = options.data;
                this.el = document.querySelector(options.el);
                this.bindings = [];

                // 数据响应式
                this.observe(this.data);

                // 编译模板
                this.compile(this.el);
            }

            // 将数据转换为响应式
            observe(data) {
                Object.keys(data).forEach(key => {
                    let value = data[key];
                    const bindings = [];

                    Object.defineProperty(data, key, {
                        get() {
                            // 这里添加依赖
                            if (Dep.target) {
                                bindings.push(Dep.target);
                            }
                            return value;
                        },
                        set(newValue) {
                            value = newValue;
                            bindings.forEach(fn => fn());
                        }
                    });
                });
            }

            // 编译模板
            compile(el) {
                const nodes = el.childNodes;
                nodes.forEach(node => {
                    if (node.nodeType === 1) { // 处理元素节点
                        const attr = node.getAttribute('v-model');
                        if (attr) {
                            this.bindings.push({
                                node,
                                key: attr,
                                update: () => {
                                    node.value = this.data[attr];
                                }
                            });
                            node.addEventListener('input', e => {
                                this.data[attr] = e.target.value;
                            });
                        }
                    } else if (node.nodeType === 3) { // 处理文本节点
                        const text = node.textContent.trim();
                        const regExp = /\{\{\s*(\w+)\s*\}\}/;
                        const match = text.match(regExp);
                        if (match) {
                            const key = match[1];
                            this.bindings.push({
                                node,
                                key,
                                update: () => {
                                    node.textContent = this.data[key];
                                }
                            });
                        }
                    }
                });

                // 更新绑定
                this.updateBindings();
            }

            // 更新所有绑定
            updateBindings() {
                this.bindings.forEach(binding => binding.update());
            }
        }

        // 依赖管理
        class Dep {
            static target = null;
        }

        // 创建 Vue 实例
        new Vue({
            el: '#app',
            data: {
                message: 'Hello Vue!'
            }
        });
    </script>
</body>
</html>
```

### **2. 使用 `Proxy` 实现 Vue 3 风格的双向绑定**

**步骤**：
1. **创建一个 Vue 实例**。
2. **实现数据的响应式使用 `Proxy`**。
3. **实现双向绑定**。

**示例代码**：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue-like Two-way Binding</title>
</head>
<body>
    <div id="app">
        <input type="text" data-bind="message">
        <p>{{ message }}</p>
    </div>

    <script>
        // 实现 Vue 实例
        function Vue(options) {
            this.data = options.data;
            this.el = document.querySelector(options.el);

            // 数据响应式
            this.proxyData(this.data);

            // 编译模板
            this.compile(this.el);
        }

        Vue.prototype.proxyData = function(data) {
            this._data = new Proxy(data, {
                get: (target, key) => {
                    // 返回数据值
                    return target[key];
                },
                set: (target, key, value) => {
                    // 更新数据
                    target[key] = value;
                    // 触发视图更新
                    this.update();
                    return true;
                }
            });
        };

        Vue.prototype.compile = function(el) {
            const nodes = el.childNodes;
            nodes.forEach(node => {
                if (node.nodeType === 1) { // 处理元素节点
                    const attr = node.getAttribute('data-bind');
                    if (attr) {
                        node.value = this._data[attr];
                        node.addEventListener('input', e => {
                            this._data[attr] = e.target.value;
                        });
                    }
                } else if (node.nodeType === 3) { // 处理文本节点
                    const text = node.textContent.trim();
                    const regExp = /\{\{\s*(\w+)\s*\}\}/;
                    const match = text.match(regExp);
                    if (match) {
                        const key = match[1];
                        node.textContent = this._data[key];
                    }
                }
            });
        };

        Vue.prototype.update = function() {
            const nodes = this.el.querySelectorAll('[data-bind]');
            nodes.forEach(node => {
                const key = node.getAttribute('data-bind');
                node.value = this._data[key];
            });

            const textNodes = this.el.querySelectorAll('p');
            textNodes.forEach(node => {
                const regExp = /\{\{\s*(\w+)\s*\}\}/;
                const text = node.textContent.trim();
                const match = text.match(regExp);
                if (match) {
                    const key = match[1];
                    node.textContent = this._data[key];
                }
            });
        };

        // 创建 Vue 实例
        new Vue({
            el: '#app',
            data: {
                message: 'Hello Vue!'
            }
        });
    </script>
</body>
</html>
```

</details>

## 28. vue2 中的虚拟 dom 是怎么实现的？ {#question-0d79b365-4f76-4bf2-9ec1-f55fdfc83fb7}

> 难度：2 · 类型：QA

### 题目要点

- **虚拟 DOM**：Vue 2 使用 VNode 对象来表示虚拟 DOM 节点，优化了真实 DOM 操作。
- **diff 算法**：高效比较新旧虚拟 DOM 树，找到并应用差异。
- **渲染与更新**：首次渲染时创建真实 DOM，后续更新时根据 diff 算法更新真实 DOM。

<details>
<summary>参考答案</summary>

Vue 2 中的虚拟 DOM 实现机制基于以下几个核心概念和技术：

### **1. 虚拟 DOM 节点**

- **VNode（虚拟节点）**：Vue 2.x 中的虚拟 DOM 使用 VNode 对象来表示 DOM 元素。每个 VNode 对象包含标签名、属性、子节点等信息。

### **2. 创建虚拟 DOM**

- **`_c`（createElement）函数**：Vue 的编译器在编译模板时，会将模板转换成渲染函数，这些渲染函数调用 `_c` 函数来创建 VNode 对象。

- **`_v`（createTextVNode）函数**：用于创建文本节点的 VNode 对象。

- **示例代码**：
  ```javascript
  // 示例渲染函数生成的 VNode
  function render() {
    return _c('div', { id: 'app' },
      [_c('h1', null, ['Hello, Vue!']),
       _c('p', null, ['This is a virtual DOM example.'])]
    );
  }
  ```

### **3. 更新虚拟 DOM**

- **diff 算法**：Vue 使用一种高效的 diff 算法来比较新旧虚拟 DOM 树的差异。这个算法基于以下几个原则：

  - **同层比较**：仅比较同一层的节点，而不是递归地比较所有层级。
  - **同类比较**：对相同类型的节点进行比较，避免不必要的节点创建和销毁。
  - **key 属性**：通过 `key` 属性来标识节点，帮助高效地重用和移动节点，特别是在列表渲染时。

### **4. 渲染和更新**

- **渲染**：首次渲染时，Vue 会根据 VNode 创建真实的 DOM 节点，并插入到文档中。

- **更新**：当数据变化时，Vue 会重新生成一个新的 VNode 树，并使用 diff 算法与旧的 VNode 树进行比较。找到的差异会被转化为操作真实 DOM 的指令，然后应用到真实 DOM 上。

### **5. 关键代码**

- **创建 VNode**：
  ```javascript
  function createElement(tag, data, children) {
    return { tag, data, children };
  }
  ```

- **虚拟 DOM diff**：
  ```javascript
  function diff(oldVNode, newVNode) {
    if (!oldVNode) return newVNode;
    if (!newVNode) return null;
    if (oldVNode.tag !== newVNode.tag) return newVNode;
    if (oldVNode.tag === 'TEXT') {
      if (oldVNode.text !== newVNode.text) return newVNode;
      return null;
    }
    const patch = {};
    const propChanges = {};
    for (let key in newVNode.data) {
      if (oldVNode.data[key] !== newVNode.data[key]) {
        propChanges[key] = newVNode.data[key];
      }
    }
    if (Object.keys(propChanges).length > 0) {
      patch.props = propChanges;
    }
    const children = [];
    for (let i = 0; i < Math.max(oldVNode.children.length, newVNode.children.length); i++) {
      const childPatch = diff(oldVNode.children[i], newVNode.children[i]);
      if (childPatch) children[i] = childPatch;
    }
    if (children.length > 0) {
      patch.children = children;
    }
    return Object.keys(patch).length > 0 ? patch : null;
  }
  ```

- **更新真实 DOM**：
  ```javascript
  function patch(node, patch) {
    if (patch === null) return;
    if (patch.props) {
      for (let key in patch.props) {
        node[key] = patch.props[key];
      }
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
  ```

</details>

## 29. Vue 是如何实现 MVVM 的？ {#question-782db61c-8d50-4def-a133-98f8c9154c1c}

> 难度：3 · 类型：QA

### 题目要点

- **Model**：数据层通过响应式系统来实现，确保数据变化能够通知视图。
- **View**：视图层通过模板语法和指令来自动更新展示的数据。
- **ViewModel**：Vue 实例作为 ViewModel，处理数据和视图之间的交互，管理数据、计算属性和侦听属性。

<details>
<summary>参考答案</summary>

Vue.js 实现 MVVM（Model-View-ViewModel）模式的方式可以通过以下几个核心部分来理解：

### **1. MVVM 架构概述**

- **Model**：数据层，代表应用的状态。
- **View**：视图层，用户界面部分，展示数据。
- **ViewModel**：中介层，负责处理视图与模型之间的绑定和交互。

### **2. Vue 的实现机制**

**Vue.js** 通过以下技术和机制实现了 MVVM 架构：

#### **1. 数据绑定（Data Binding）**

- **响应式系统**：Vue 的响应式系统通过 `Object.defineProperty`（Vue 2.x）或者 `Proxy`（Vue 3.x）实现。它使得数据模型（Model）与视图（View）保持同步，当数据变化时，视图会自动更新。

  - **Vue 2.x**：使用 `Object.defineProperty` 对数据进行 getter 和 setter 的定义，以便在数据变化时能够通知视图更新。
  - **Vue 3.x**：使用 `Proxy` 实现更高效的响应式系统，支持更细粒度的依赖追踪和性能优化。

  ```javascript
  // Vue 2.x
  Object.defineProperty(data, 'key', {
    get() { /* 返回属性值 */ },
    set(value) { /* 设置属性值并通知视图更新 */ }
  });

  // Vue 3.x
  const reactiveData = new Proxy(data, {
    get(target, key) { /* 处理获取操作 */ },
    set(target, key, value) { /* 处理设置操作并通知视图更新 */ }
  });
  ```

#### **2. 双向数据绑定（Two-Way Data Binding）**

- **`v-model` 指令**：Vue 提供了 `v-model` 指令来实现双向数据绑定。它在表单控件和组件之间自动同步数据。

  ```html
  <!-- Vue 2.x -->
  <input v-model="message" />

  <!-- Vue 3.x -->
  <input v-model="message" />
  ```

#### **3. 数据与视图的绑定**

- **模板语法**：Vue 使用声明式模板语法（例如 `{{ message }}`）来绑定数据到视图中。这些模板会被编译成渲染函数，这些函数在每次数据变化时被调用以更新视图。

  ```html
  <p>{{ message }}</p>
  ```

- **计算属性（Computed Properties）**：计算属性可以基于依赖的响应式数据自动计算和缓存结果，并且在依赖的数据变化时自动更新。

  ```javascript
  computed: {
    reversedMessage() {
      return this.message.split('').reverse().join('');
    }
  }
  ```

- **侦听属性（Watchers）**：侦听属性可以监视数据变化并执行特定的操作，例如异步操作或复杂计算。

  ```javascript
  watch: {
    message(newVal, oldVal) {
      console.log(`Message changed from ${oldVal} to ${newVal}`);
    }
  }
  ```

#### **4. 视图模型（ViewModel）**

- **Vue 实例**：Vue 实例（通过 `new Vue()`）是 MVVM 中的 ViewModel，它将数据（Model）和视图（View）结合在一起。Vue 实例管理数据、计算属性、侦听属性以及视图的更新逻辑。

  ```javascript
  new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!'
    },
    computed: {
      reversedMessage() {
        return this.message.split('').reverse().join('');
      }
    }
  });
  ```

#### **5. 更新机制**

- **虚拟 DOM 和 diff 算法**：Vue 使用虚拟 DOM 和 diff 算法来高效地更新视图。虚拟 DOM 表示了当前视图的快照，而 diff 算法比较新旧虚拟 DOM 以找出差异，并将这些差异应用到真实 DOM 上。

  ```javascript
  // 渲染函数示例
  function render() {
    return _c('div', null, [ _c('p', null, [ _v(this.message) ]) ]);
  }
  ```

</details>

## 30. Proxy 和 Object.defineProperty 的区别是啥？ {#question-82d187ea-2abe-4ad5-bffc-429098f18d25}

> 难度：3 · 类型：QA

### 题目要点

- **`Object.defineProperty`**：
  - **作用**：用于设置或修改对象的单个属性的详细特性。
  - **限制**：只对指定的属性生效，无法处理对象的其他操作。

- **`Proxy`**：
  - **作用**：用于创建代理对象，拦截并自定义对目标对象的各种操作。
  - **优点**：提供了全面的拦截功能和更灵活的操作方式，适合复杂的拦截需求。

选择使用 `Proxy` 还是 `Object.defineProperty` 主要取决于需求的复杂性和需要拦截的操作范围。

<details>
<summary>参考答案</summary>

`Proxy` 和 `Object.defineProperty` 都可以用来拦截和操作对象的属性访问，但它们在功能、灵活性和适用场景上有显著的区别。

### **1. `Object.defineProperty`**

#### **功能**
- 用于定义或修改对象的属性，包括属性的值、可写性、可枚举性、可配置性等。
- 主要用于对单个属性进行细粒度的控制。

#### **使用场景**
- 对象属性的拦截和修改，例如：
  - 定义 getter 和 setter。
  - 修改属性的配置。

#### **示例代码**

```javascript
const obj = {};
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true,
});

console.log(obj.name); // Alice

Object.defineProperty(obj, 'name', {
  get() {
    return 'Bob';
  }
});

console.log(obj.name); // Bob
```

#### **限制**
- 只对定义的属性有效，不能拦截对对象的整体访问或操作。
- 需要针对每个属性分别进行定义，无法一次性处理多个属性或整个对象。

### **2. `Proxy`**

#### **功能**
- 用于创建一个代理对象，该对象可以拦截并自定义对目标对象的基本操作（如属性访问、赋值、删除等）。
- 提供了更多的拦截能力和灵活性，支持对整个对象的操作。

#### **使用场景**
- 可以用来拦截和修改对象的所有操作，例如：
  - 属性的读取、赋值、删除。
  - 函数调用。
  - 目标对象的创建和扩展。

#### **示例代码**

```javascript
const target = {
  name: 'Alice'
};

const handler = {
  get(target, property) {
    return property in target ? target[property] : 'Default';
  },
  set(target, property, value) {
    target[property] = value.toUpperCase();
    return true;
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // Alice
proxy.name = 'Bob';
console.log(proxy.name); // BOB
console.log(proxy.age); // Default
```

#### **优点**
- 可以拦截对象的所有操作，提供更全面的控制。
- 可以动态地应用拦截逻辑，不需要修改原始对象的定义。

</details>

## 31. Vue 的响应式数据流驱动页面和传统的事件绑定命令式驱动页面，分别有什么优缺点？ {#question-2724b7d8-c161-4106-9c54-956d14b4b1b0}

> 难度：2 · 类型：QA

### 题目要点

- **响应式数据流（Vue）**：提供了声明式编程，简化了数据和视图的一致性问题，提高了代码的可维护性和开发效率，但可能引入一定的性能开销和学习成本。
- **命令式事件绑定（传统方法）**：提供了对 DOM 的直接控制，灵活性高，可能在某些情况下获得更好的性能，但代码复杂且难以维护，容易出现数据和视图不同步的问题。

<details>
<summary>参考答案</summary>

### **1. Vue 响应式数据流驱动页面**

#### **优点**

1. **声明式编程**：
   - **自动更新**：数据变化自动驱动视图更新，无需手动操作 DOM。
   - **简化代码**：减少了手动操作 DOM 的代码量，代码更简洁和易读。

2. **数据驱动**：
   - **一致性**：数据和视图的一致性更高，减少了因数据和视图不同步而导致的错误。
   - **调试方便**：可以通过 Vue 的开发者工具轻松查看组件的状态和数据流动。

3. **可维护性**：
   - **高效开发**：组件化的设计和响应式的数据流使得代码的维护和扩展变得更容易。
   - **更少的副作用**：减少了手动操作 DOM 带来的副作用问题。

4. **响应式**：
   - **自动化**：视图的更新是自动的，减少了程序员的手动干预。
   - **高效性能**：Vue 使用虚拟 DOM 和高效的 diff 算法来最小化实际 DOM 操作，提高性能。

#### **缺点**

1. **学习曲线**：
   - **新概念**：需要学习和理解 Vue 的响应式系统和组件化编程。
   - **复杂性**：在复杂的应用中，响应式数据流可能需要更复杂的状态管理方案，如 Vuex。

2. **性能开销**：
   - **响应式系统**：虽然 Vue 对性能进行了优化，但响应式系统的性能开销仍然存在，尤其是在处理大量数据时。

### **2. 传统的事件绑定命令式驱动页面**

#### **优点**

1. **直接控制**：
   - **手动操作**：程序员可以直接操作 DOM，获得对页面的精细控制。
   - **灵活性**：可以根据需要编写复杂的交互逻辑和事件处理代码。

2. **熟悉性**：
   - **传统方法**：许多开发者对传统的事件绑定和 DOM 操作方法比较熟悉，学习曲线相对较低。

3. **性能优化**：
   - **细粒度控制**：能够对每个 DOM 操作进行手动优化，可能在某些情况下能获得更好的性能。

#### **缺点**

1. **代码复杂性**：
   - **重复代码**：需要手动管理 DOM 和事件，导致代码重复和复杂。
   - **难以维护**：随着应用的复杂性增加，代码维护变得更加困难。

2. **数据和视图不同步**：
   - **手动更新**：需要手动更新视图和数据，容易出现数据和视图不一致的问题。
   - **副作用**：手动操作 DOM 可能引入副作用和意外的行为。

3. **错误处理**：
   - **调试困难**：调试数据和视图的不一致性问题可能更加困难。

</details>

## 32. Vue 中的双向绑定和单向数据流原则是否冲突？ {#question-9b0272bb-d110-45f6-a9e9-7e426c8288d5}

> 难度：2 · 类型：QA

### 题目要点

Vue 的双向绑定和单向数据流原则在设计上是兼容的。双向绑定是单向数据流的一个便利封装，使得处理表单控件等场景时更为简便。总的来说，Vue 在设计上维护了单向数据流的原则，同时提供了双向绑定的语法糖来简化数据管理。

<details>
<summary>参考答案</summary>

在 Vue 中，双向绑定和单向数据流原则并不冲突，而是可以协同工作的。

### **双向绑定（Two-Way Data Binding）**

- **定义**：允许视图（UI）和模型（数据）之间的双向同步。即，当数据变化时，视图自动更新；当视图中的数据（如用户输入）变化时，模型也会相应更新。
- **实现**：Vue 使用 `v-model` 指令实现双向绑定，适用于表单输入元素，使得数据和视图之间能够同步更新。

### **单向数据流（One-Way Data Flow）**

- **定义**：数据从父组件流向子组件，数据流动方向是单向的。子组件不能直接修改父组件的数据，而是通过事件将数据变化通知给父组件，父组件再根据需要更新数据。
- **实现**：Vue 组件的设计遵循单向数据流，数据通过 props 从父组件传递到子组件，子组件通过事件向父组件发送通知。

### **如何协调两者**

1. **双向绑定** 在表单控件中的使用（如 `v-model`）实际是 Vue 对单向数据流的封装。尽管 `v-model` 使得视图和数据双向绑定，但其本质上仍然遵循单向数据流原则：
   - **数据流动**：数据流动从父组件传递到子组件，`v-model` 只是将数据和视图的同步简化。
   - **更新机制**：当用户输入变化时，视图更新数据，数据的变化再传递回父组件，确保数据的统一管理和维护。

2. **实现细节**：
   - **内部实现**：`v-model` 在内部使用了事件监听（如 `input` 事件）和数据绑定（如 `value` 属性）来实现双向同步，但在组件设计层面，数据流动仍然是单向的。

</details>

## 33. Vue 2 的响应式原理中 Object.defineProperty 有什么缺陷 {#question-263e22e5-d2ea-4a3d-bd3a-5b35678c06ee}

> 难度：1 · 类型：QA

### 题目要点

Vue 2 中使用`Object.defineProperty`来实现其响应式系统存在一些限制和问题：

<details>
<summary>参考答案</summary>

Vue 2 中使用`Object.defineProperty`来实现其响应式系统存在一些限制和问题：

1. **深度检测**：
   Vue 2中对于对象的处理是递归的；对于每个属性，Vue会逐层使用`Object.defineProperty`将其转换成 getter/setter。这样，当你访问或修改嵌套较深的属性时（如`a.b.c`），Vue已经提前将`a`、`a.b`和`a.b.c`的属性转换为响应式，能够追踪它们的变化。

2. **数组限制**：
   `Object.defineProperty`无法检测到数组索引的变化，因此Vue重写了数组的变异方法（如`push`、`pop`、`splice`等）来实现对数组的响应式监听。

3. **对象属性添加或删除的限制**：
   因为`Object.defineProperty`只能在初始化的时候应用于属性，当你在一个已经创建的Vue实例上添加新属性时，这个新属性是非响应式的。如果你想要它是响应式的，需要使用`Vue.set()`或`this.$set()`方法添加新属性。

4. **性能问题**：
   因为`Object.defineProperty`是递归地对对象的每一个属性进行处理，所以在处理具有大量属性或深层嵌套对象时，可能会有较大的性能开销。

关于处理`a.b.c`类型的属性，Vue 2内部会递归地遍历对象`a`的所有属性，为它们各自使用`Object.defineProperty`定义getter和setter。如果`b`是`a`的属性，那么同样会针对`b`做这样的处理，以及它的所有属性，包括`c`等。这样，在访问或修改`a.b.c`时，Vue可以追踪到这些变化并触发相关的更新。

```javascript
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 依赖收集等操作
      return val;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 触发更新视图等操作
    }
  });

  // 如果val本身还是对象，则递归处理
  if (typeof val === 'object') {
    reactive(val);
  }
}

function reactive(obj) {
  for (let key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}
```

在上面的`reactive`函数中，我们将一个对象转换成响应式对象。这是Vue内部实现响应式的简化版原理。不过，Vue的响应式系统要复杂得多，它还涉及依赖收集和派发更新等机制。

</details>

## 34. vue 文件中，在 v-for 时给每项元素绑定事件需要用事件代理吗，为什么？ {#question-a7da8658-3b6f-4417-8ff0-66e078fa09b9}

> 难度：3 · 类型：QA

### 题目要点

- 对于较小的列表，直接绑定事件是简洁和容易理解的方式。
- 对于较大的列表，使用事件代理能有效减少事件处理函数的数量，提高性能。

<details>
<summary>参考答案</summary>

在 Vue 文件中，`v-for` 遍历数组时，为每项元素绑定事件通常不需要事件代理，但使用事件代理有其优势。这里是两种方式的对比：

### **直接绑定事件**

```vue
<div v-for="item in items" :key="item.id">
  <button @click="handleClick(item)">Click me</button>
</div>
```

**优点**：
- **简洁**：直接在每个元素上绑定事件，代码易于理解。
- **独立处理**：每个元素的事件处理函数可以独立定义和处理。

**缺点**：
- **性能问题**：如果列表非常大（如上万项），每个元素上都会绑定事件，可能导致性能开销和内存占用增加。

### **事件代理**

事件代理是将事件绑定到一个父元素上，并利用事件冒泡机制处理子元素的事件。

```vue
<div @click="handleParentClick">
  <div v-for="item in items" :key="item.id">
    <button :data-id="item.id">Click me</button>
  </div>
</div>
```

在方法中：
```javascript
methods: {
  handleParentClick(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
      const id = target.getAttribute('data-id');
      const item = this.items.find(item => item.id === id);
      this.handleClick(item);
    }
  }
}
```

**优点**：
- **性能优化**：只在一个父元素上绑定事件，减少了绑定的事件处理函数数量，适用于大型列表。
- **内存使用**：降低内存消耗，因为不需要为每个元素分配一个事件处理函数。

**缺点**：
- **代码复杂度**：处理事件逻辑变得复杂，需要通过事件目标属性（如 `data-id`）来判断和处理具体的元素。

</details>

## 35. vue3 的响应式库是独立出来的，如果单独使用是什么样的效果？ {#question-5680ca8b-077f-445e-b38c-ac64356163c7}

> 难度：3.5 · 类型：QA

### 题目要点

使用 `@vue/reactivity` 库，您可以在 Vue 组件之外管理响应式状态，进行依赖追踪和副作用处理。它提供了 Vue 3 的核心响应式功能，可以用于构建库或工具，而无需使用完整的 Vue 框架。

<details>
<summary>参考答案</summary>

在 Vue 3 中，响应式系统被抽离到一个独立的库中，名为 `@vue/reactivity`。这个库可以单独使用来管理响应式状态，类似于 Vue 的响应式系统，但不依赖于 Vue 组件或 Vue 实例。

### **独立使用效果**

1. **创建响应式对象**：

   使用 `reactivity` 库可以创建响应式对象，类似于 Vue 的 `ref` 和 `reactive`。

   ```javascript
   import { reactive, effect } from '@vue/reactivity';

   const state = reactive({
     count: 0
   });

   effect(() => {
     console.log(`Count is: ${state.count}`);
   });

   state.count++;
   // 输出: Count is: 1
   ```

2. **使用 `ref`**：

   对于基本类型的数据，可以使用 `ref` 来创建响应式数据。

   ```javascript
   import { ref } from '@vue/reactivity';

   const count = ref(0);

   effect(() => {
     console.log(`Count is: ${count.value}`);
   });

   count.value++;
   // 输出: Count is: 1
   ```

3. **依赖追踪和计算属性**：

   使用 `effect` 可以创建响应式的副作用，类似于 Vue 组件中的计算属性。

   ```javascript
   import { reactive, effect, computed } from '@vue/reactivity';

   const state = reactive({
     count: 0
   });

   const doubled = computed(() => state.count * 2);

   effect(() => {
     console.log(`Doubled count is: ${doubled.value}`);
   });

   state.count++;
   // 输出: Doubled count is: 2
   ```

</details>

## 36. vue 是如何识别和解析指令的？ {#question-b4e5ffc9-9149-42bc-859c-8f179695eb9a}

> 难度：2.5 · 类型：QA

### 题目要点

1. **编译阶段**：Vue 将模板解析为 AST，并识别和处理指令，将指令逻辑转换成渲染函数。

2. **运行时阶段**：Vue 使用渲染函数生成虚拟 DOM，并根据指令逻辑来更新实际的 DOM。

Vue 通过这种方式，能够高效地处理和更新模板中的指令，实现数据驱动的视图更新。

<details>
<summary>参考答案</summary>

Vue 在处理模板中的指令（如 `v-if`、`v-for`、`v-bind` 等）时，主要依赖于编译阶段和虚拟 DOM 机制来识别和解析指令。以下是 Vue 识别和解析指令的主要步骤：

### **1. 编译阶段**

在 Vue 中，模板会被编译成 JavaScript 渲染函数。编译过程包括以下几个步骤：

#### **1.1 模板解析**

Vue 使用 `compiler`（编译器）将模板字符串转换成抽象语法树（AST）。在这个阶段，模板中的所有指令、元素、插值等都会被解析成 AST 节点。

```javascript
const ast = parse(template); // 将模板转换为 AST
```

#### **1.2 指令处理**

在解析过程中，Vue 会检查 AST 节点的属性，识别指令并将它们转换成指令对象。每个指令对象都包含处理该指令的逻辑，比如 `v-if` 指令会被处理成一个条件判断节点。

```javascript
const directives = {
  'v-if': processIf,
  'v-for': processFor,
  'v-bind': processBind,
  'v-model': processModel,
  // 其他指令
};

function processIf(node, dir) {
  // 处理 v-if 指令的逻辑
}

function processFor(node, dir) {
  // 处理 v-for 指令的逻辑
}
```

#### **1.3 生成渲染函数**

经过处理的 AST 会被转换成渲染函数，这个函数用于创建虚拟 DOM。渲染函数中会包含指令的逻辑，例如，`v-if` 的条件判断逻辑会被编译到渲染函数中。

```javascript
const renderFunction = generateRenderFunction(ast); // 生成渲染函数
```

### **2. 运行时阶段**

在运行时，Vue 使用渲染函数来生成虚拟 DOM。每当数据发生变化时，Vue 会重新渲染组件，并根据指令的逻辑来更新视图。

#### **2.1 指令更新**

Vue 在虚拟 DOM 的 `patch` 阶段，会根据指令的逻辑来更新实际的 DOM。例如，对于 `v-if` 指令，Vue 会根据条件判断是否在 DOM 中插入或删除节点。

```javascript
function patch(oldVNode, newVNode) {
  // 更新虚拟 DOM
  // 根据指令逻辑更新实际 DOM
}
```

#### **2.2 生命周期钩子**

某些指令可能需要在组件的生命周期钩子中进行处理。例如，`v-show` 指令会根据绑定的条件来控制元素的 `display` 属性，这会在组件的生命周期中进行设置。

```javascript
function updateDisplay(el, value) {
  el.style.display = value ? '' : 'none';
}
```

</details>

## 37. vue3 相比较于 vue2，在编译阶段有哪些改进？ {#question-9fd648c4-daf6-48a2-94f2-11249191597e}

> 难度：3.5 · 类型：QA

### 题目要点

Vue 3 在编译阶段相较于 Vue 2 的改进主要集中在响应式系统的提升、编译器的优化、更高效的模板编译和对 TypeScript 的更好支持。这些改进使得 Vue 3 在性能和开发体验上都得到了显著提升。

<details>
<summary>参考答案</summary>

以下是一些主要的改进：

### 1. **虚拟 DOM 的优化**

- **Proxy 代理**：Vue 3 使用 `Proxy` 对象来实现响应式系统，而 Vue 2 使用 `Object.defineProperty`。`Proxy` 提供了更灵活和高效的方式来追踪对象的变化。
- **静态节点提升**：Vue 3 在编译阶段对静态节点进行了优化，将其提升到静态节点，以减少重复渲染。

### 2. **编译器的改进**

- **更小的编译器体积**：Vue 3 的编译器经过了重构，减少了体积，并且更快。
- **更高效的编译策略**：使用了更高效的编译策略和优化手段，生成的渲染函数代码更简洁。

### 3. **模板编译**

- **新的编译器**：Vue 3 引入了新的模板编译器，与 Vue 2 相比，编译后的代码更加高效，生成的虚拟 DOM 更简洁。
- **编译时优化**：Vue 3 的编译器能够识别和优化模板中的常见模式，比如静态节点提升，减少不必要的重新渲染。

### 4. **响应式系统的改进**

- **基于 Proxy 的响应式系统**：Vue 3 的响应式系统基于 `Proxy` 实现，比 Vue 2 使用的 `Object.defineProperty` 更高效，支持更广泛的对象操作，并且不需要 `Object.defineProperty` 的限制。
- **更快的依赖追踪**：`Proxy` 能够更高效地追踪依赖关系，减少了性能开销。

### 5. **编译时类型检查**

- **TypeScript 支持**：Vue 3 从设计之初就考虑了对 TypeScript 的支持，编译器和核心库的类型定义更加完善，提升了开发时的类型检查和 IDE 支持。

### 6. **组件的改进**

- **更强大的组件编译**：Vue 3 对组件的编译做了大量的优化，使得组件在运行时更高效。
- **编译时的插件支持**：Vue 3 支持更多的编译时插件，能够在构建过程中处理组件的特定需求。

### 7. **编译时常量折叠**

- **常量折叠**：编译器会对模板中的常量进行折叠优化，减少运行时的计算开销。

### 8. **更简洁的代码生成**

- **优化的代码生成**：Vue 3 编译器生成的代码比 Vue 2 更简洁，减少了冗余的代码，提高了执行效率。

</details>

## 38. Vue 项目中，你做过哪些性能优化？ {#question-2e9b8935-fd13-4625-9934-c5f91d39b400}

> 难度：3.5 · 类型：QA

### 题目要点

- **组件和模板优化**：减少不必要的重渲染，利用计算属性和异步组件。
- **性能分析工具**：使用 Vue Devtools 和浏览器开发者工具定位瓶颈。
- **数据和事件处理**：使用 Vuex 管理状态，优化事件处理。

<details>
<summary>参考答案</summary>

在 Vue 项目中，进行性能优化通常包括以下几个方面：

### 1. **组件优化**
   - **使用 `v-show` 替代 `v-if`**：`v-show` 仅切换 `display` 属性，而 `v-if` 会添加和删除 DOM 元素，适用于频繁切换的组件。
   - **组件懒加载**：利用 Vue 的异步组件加载功能 (`defineAsyncComponent`) 或 `webpack` 的代码分割（dynamic imports）来减少初始加载时间。

   ```javascript
   const AsyncComponent = defineAsyncComponent(() =>
     import('./components/AsyncComponent.vue')
   );
   ```

   ```html
   <router-view v-if="componentLoaded" />
   ```

   - **避免不必要的重渲染**：通过 `computed` 属性避免不必要的组件更新。

   ```javascript
   computed: {
     filteredItems() {
       return this.items.filter(item => item.active);
     }
   }
   ```

### 2. **性能分析**
   - **使用 Vue Devtools**：检查组件的渲染性能、事件监听和状态管理。
   - **浏览器开发者工具**：利用 Performance 面板分析应用的性能瓶颈。

### 3. **减少计算量**
   - **使用 `computed` 代替 `methods`**：`computed` 是基于依赖的缓存计算结果，而 `methods` 每次调用都会重新计算。

   ```javascript
   computed: {
     itemCount() {
       return this.items.length;
     }
   }
   ```

### 4. **优化事件处理**
   - **防止不必要的事件触发**：使用事件修饰符（如 `.stop`、`.prevent`）来优化事件处理。

   ```html
   <button @click.stop="handleClick">Click Me</button>
   ```

   - **节流和防抖**：对频繁触发的事件（如滚动、输入）使用节流或防抖技术。

   ```javascript
   methods: {
     handleScroll: _.throttle(function() {
       // handle scroll event
     }, 200)
   }
   ```

### 5. **合理使用 Vuex**
   - **避免直接修改状态**：使用 Vuex 的 mutation 和 action 管理状态变更，避免全局状态的不必要更新。

   ```javascript
   mutations: {
     setUser(state, user) {
       state.user = user;
     }
   }
   ```

### 6. **优化模板**
   - **使用 `v-for` 的 `key`**：为 `v-for` 循环的元素提供唯一的 `key`，提升渲染性能。

   ```html
   <div v-for="item in items" :key="item.id">{{ item.name }}</div>
   ```

   - **避免复杂的模板表达式**：将复杂的表达式移到计算属性中，避免每次渲染都重新计算。

### 7. **异步数据处理**
   - **按需加载数据**：只在需要时加载数据，避免不必要的 API 请求。

   ```javascript
   async mounted() {
     const data = await fetchData();
     this.data = data;
   }
   ```

### 8. **缓存和懒加载**
   - **图片和静态资源缓存**：利用浏览器缓存策略或 CDN 来加速静态资源的加载。
   - **懒加载**：对图片和组件使用懒加载技术。

   ```javascript
   <img v-lazy="image.url" />
   ```

### 9. **减少第三方库使用**
   - **精简依赖**：仅引入必要的第三方库，减少包体积，提升加载速度。

</details>

## 39. vue-cli 有哪些功能？ {#question-b3e1a9a2-6cde-43a9-a095-7ff2e555a111}

> 难度：3 · 类型：QA

### 题目要点

Vue CLI 提供了一套完整的解决方案，涵盖了项目初始化、配置管理、开发环境、构建打包、插件系统等多个方面。通过 Vue CLI，开发者可以快速高效地构建 Vue.js 应用，专注于业务逻辑而不必花费过多时间在项目配置上。

<details>
<summary>参考答案</summary>

Vue CLI 是 Vue.js 官方提供的一个工具，用于快速构建和管理 Vue.js 项目。它提供了一系列功能，使得开发者能够高效地创建、配置和管理 Vue 应用。

以下是 Vue CLI 的主要功能和所做的事情：

### **1. 项目初始化**

- **快速创建项目**：使用命令行工具快速生成新的 Vue 项目结构，包括基础的配置文件和示例代码。

  ```bash
  vue create my-project
  ```

- **选择预设**：在创建项目时，可以选择预定义的配置预设，或者根据项目需求自定义选择功能（如 Vue Router、Vuex、TypeScript 等）。

### **2. 配置管理**

- **Webpack 配置**：Vue CLI 内置了对 Webpack 的配置，开发者可以在不深入理解 Webpack 的情况下，使用预配置的功能。

- **可扩展性**：通过 `vue.config.js` 文件，允许开发者自定义和扩展默认配置。

### **3. 开发环境**

- **开发服务器**：提供内置的开发服务器，支持热重载（Hot Module Replacement），使得开发过程更加高效和流畅。

  ```bash
  npm run serve
  ```

### **4. 构建和打包**

- **生产构建**：支持一键构建项目并输出到 `dist` 文件夹，适合部署到生产环境。

  ```bash
  npm run build
  ```

- **优化功能**：内置了多种优化功能，如代码压缩、Tree Shaking、懒加载等，提高最终构建产物的性能。

### **5. 插件系统**

- **插件生态**：支持官方和社区开发的插件，可以在项目中方便地安装和使用，如 Vue Router、Vuex、PWA 支持等。

  ```bash
  vue add router
  ```

- **自定义插件**：开发者可以创建自定义插件，扩展 Vue CLI 的功能。

### **6. 脚手架功能**

- **生成组件**：提供命令生成 Vue 组件、页面、路由等代码片段，减少重复工作。

  ```bash
  vue generate component MyComponent
  ```

### **7. 统一的工具链**

- **支持多种语言和工具**：支持 TypeScript、Sass、Less、Pug 等多种语言和工具，简化开发流程。

### **8. 代码质量管理**

- **Linting**：集成 ESLint，可以在开发过程中实时检查代码质量。

- **测试框架**：支持集成测试框架，如 Jest 和 Mocha，以提高代码的可靠性。

### **9. 文档生成**

- **自动生成文档**：支持生成 API 文档和组件文档，便于开发和维护。

### **10. Vue UI**

- **图形化界面**：提供 Vue UI 工具，允许开发者通过图形界面管理项目配置、插件、依赖等，无需手动编辑配置文件。

  ```bash
  vue ui
  ```

</details>

## 40. Vue2 动态给 data 添加一个新的属性时会发生什么 {#question-3a91fb38-d634-4bd1-85a7-3961884ed3ef}

> 难度：2 · 类型：QA

### 题目要点

**直接添加属性的问题**

<details>
<summary>参考答案</summary>

**直接添加属性的问题**

我们从一个例子开始

定义一个`p`标签，通过`v-for`指令进行遍历

然后给`botton`标签绑定点击事件，我们预期点击按钮时，数据新增一个属性，界面也 新增一行

```vue

<template>
  <p v-for="(value,key) in item" :key="key">
    {{ value }}
  </p>
  <button @click="addProperty">动态添加新属性</button>
</template>
```

实例化一个`vue`实例，定义`data`属性和`methods`方法

```js
const app = new Vue({
  el: "#app",
  data: () => {
    item:{
      oldProperty:"旧属性"
    }
  },
  methods: {
    addProperty() {
      this.item.newProperty = "新属性"  // 为items添加新属性
      console.log(this.items)  // 输出带有newProperty的items
    }
  }
})
```

点击按钮，发现结果不及预期，数据虽然更新了（console打印出了新属性），但页面并没有更新

**原理分析**

为什么产生上面的情况呢？

下面来分析一下

`vue2`是用过`Object.defineProperty`实现数据响应式

```js
const obj = {}
Object.defineProperty(obj, 'foo', {
  get() {
    console.log(`get foo:${val}`);
    return val
  },
  set(newVal) {
    if (newVal !== val) {
      console.log(`set foo:${newVal}`);
      val = newVal
    }
  }
})
```

当我们访问`foo`属性或者设置`foo`值的时候都能够触发`setter与getter`

```js
obj.foo
obj.foo = 'new'
```

但是我们为`obj`添加新属性的时候，却无法触发事件属性的拦截

```js
obj.bar  = '新属性'
```

原因是一开始`obj`的`foo`属性被设成了响应式数据，而`bar`是后面新增的属性，并没有通过`Object.defineProperty`设置成响应式数据

**解决方案**

`Vue` 不允许在已经创建的实例上动态添加新的响应式属性

若想实现数据与视图同步更新，可采取下面三种解决方案：

- `Vue.set()`
- `Object.assign()`
- `$forcecUpdated()`

**`Vue.set()`**

`Vue.set( target, propertyName/index, value )`

参数

- `{Object | Array} target`
- `{string | number} propertyName/index`
- `{any} value`

返回值：设置的值

通过`Vue.set`向响应式对象中添加一个`property`，并确保这个新 `property` 同样是响应式的，且触发视图更新

关于`Vue.set`源码

源码位置：`src\core\observer\index.js`
```js
function set (target: Array<any> | Object, key: any, val: any): any {
  ...
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

这里无非再次调用 `defineReactive` 方法，实现新增属性的响应式

关于 `defineReactive` 方法，内部还是通过 `Object.defineProperty` 实现属性拦截

```js
function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            console.log(`get ${key}:${val}`);
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                console.log(`set ${key}:${newVal}`);
                val = newVal
            }
        }
    })
}
```

**`Object.assign()`**

直接使用Object.assign()添加到对象的新属性不会触发更新

应创建一个新的对象，合并原对象和混入对象的属性
```js
this.someObject = Object.assign({},this.someObject,{newProperty1:1,newProperty2:2 ...})
```

**`$forceUpdate`**

如果你发现你自己需要在 Vue 中做一次强制更新，99.9% 的情况，是你在某个地方做错了事

`$forceUpdate` 迫使 Vue 实例重新渲染

PS：仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。

**小结**

如果为对象添加少量的新属性，可以直接采用`Vue.set()`

如果需要为新对象添加大量的新属性，则通过`Object.assign()`创建新对象

如果你实在不知道怎么操作时，可采取`$forceUpdate()`进行强制刷新 (不建议)

</details>

## 41. Vue中的 ref、toRef 和 toRefs 有什么区别？ {#question-a18d9351-fc9a-45b4-8ccd-3870299d5cd8}

> 难度：3 · 类型：QA

### 题目要点

- **`ref`**：用于创建单个响应式引用。
- **`toRef`**：用于从响应式对象中提取单个属性，并保持响应性。
- **`toRefs`**：用于将整个响应式对象的所有属性转换为响应式引用，便于解构使用。

<details>
<summary>参考答案</summary>

在 Vue 3 中，`ref`、`toRef` 和 `toRefs` 是与响应式系统相关的 API，它们用于处理响应式数据，但各自有不同的用途和场景：

### **1. ref**

- **定义**：`ref` 用于创建一个响应式的引用对象。它可以是基本类型或对象类型。
- **用法**：当你需要将一个值（如字符串、数字、对象等）转换为响应式数据时使用。
- **返回值**：返回一个包含 `.value` 属性的对象，通过该属性访问和修改其值。

```javascript
import { ref } from 'vue';

const count = ref(0); // 创建响应式的引用
count.value++; // 修改值
```

### **2. toRef**

- **定义**：`toRef` 用于将响应式对象中的某个属性转换为一个响应式引用。它适用于在 setup 函数中解构响应式对象时，保持响应性。
- **用法**：当你需要从一个响应式对象中提取一个属性，并希望这个属性依然是响应式的时使用。
- **返回值**：返回一个响应式引用对象。

```javascript
import { ref, reactive, toRef } from 'vue';

const state = reactive({ count: 0 });
const countRef = toRef(state, 'count'); // 转换为响应式引用
countRef.value++; // 修改值
```

### **3. toRefs**

- **定义**：`toRefs` 用于将一个响应式对象的所有属性转换为响应式引用，返回一个新对象。
- **用法**：适用于将整个响应式对象解构为单独的响应式引用，保持各属性的响应性。
- **返回值**：返回一个新对象，其中每个属性都是响应式引用。

```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({ count: 0, name: 'Vue' });
const { count, name } = toRefs(state); // 解构为响应式引用
count.value++; // 修改 count
```

</details>

## 42. Vue 中的路由守卫是什么，可以在什么场景下使用？ {#question-333a617e-1a0b-4c3e-b6f2-1f627430360e}

> 难度：2 · 类型：QA

### 题目要点

Vue 中的路由守卫通过拦截路由的导航过程，提供了对页面跳转前、跳转时、跳转后进行控制的能力。它常用于身份验证、数据加载、页面跳转控制、SEO 优化等场景，是实现复杂路由逻辑的关键机制。

<details>
<summary>参考答案</summary>

路由守卫（Route Guards）是 Vue Router 提供的一种功能，用来在路由跳转过程中控制导航的行为。它可以帮助开发者在用户访问某个路由之前、路由发生变化时或路由完成之后，进行一些特定的逻辑处理。

#### **路由守卫的分类**
Vue 中的路由守卫分为三类：

1. **全局守卫**：作用于整个应用的路由系统，影响所有路由的导航。
   - `beforeEach`：在每个路由跳转前触发。
   - `beforeResolve`：在所有组件内守卫和异步路由组件被解析后触发。
   - `afterEach`：路由跳转结束后触发。

2. **路由独享守卫**：作用于单个路由定义。
   - `beforeEnter`：当进入某个特定路由前触发，仅作用于配置此守卫的路由。

3. **组件内守卫**：在路由组件内使用，针对组件级别的导航控制。
   - `beforeRouteEnter`：在路由进入该组件之前触发，可以访问组件实例。
   - `beforeRouteUpdate`：当复用的组件接收到新的参数或路由时触发。
   - `beforeRouteLeave`：在离开当前路由组件时触发，可以阻止导航。

---

### **常见使用场景**

1. **身份验证与权限控制**
   - 在用户进入某个页面前验证其身份，确保只有登录用户才能访问某些页面。如果未登录，可以在路由守卫中重定向到登录页面。
   ```js
   router.beforeEach((to, from, next) => {
     if (to.meta.requiresAuth && !isLoggedIn()) {
       next('/login'); // 未登录则重定向到登录页面
     } else {
       next(); // 继续导航
     }
   });
   ```

2. **数据加载与异步请求**
   - 在路由跳转时，预先获取页面所需的数据，在数据加载完成后再进行路由跳转。这样可以确保进入页面时所需的数据已经准备好。
   ```js
   router.beforeEach((to, from, next) => {
     fetchDataForRoute(to).then(data => {
       to.params.data = data;
       next();
     });
   });
   ```

3. **阻止路由跳转**
   - 在某些情况下，需要阻止用户离开页面，比如表单内容未保存时提醒用户确认，避免数据丢失。
   ```js
   beforeRouteLeave(to, from, next) {
     if (this.formHasUnsavedChanges) {
       const answer = window.confirm('您有未保存的更改，是否确认离开？');
       if (!answer) next(false); // 阻止跳转
       else next();
     } else {
       next();
     }
   }
   ```

4. **动态修改页面标题或元信息**
   - 可以通过守卫在每次路由跳转时动态更改页面标题或 SEO 相关的 meta 信息。
   ```js
   router.beforeEach((to, from, next) => {
     document.title = to.meta.title || '默认标题';
     next();
   });
   ```

5. **访问日志**
   - 在全局守卫中记录用户的路由访问历史或进行埋点统计，帮助分析用户行为。
   ```js
   router.afterEach((to, from) => {
     console.log(`Navigated from ${from.path} to ${to.path}`);
   });
   ```

</details>

## 43. vue 中 Scoped Styles 是如何实现样式隔离的？说说具体的原理 {#question-092f3e21-56b2-45bd-a88b-d0320c48e8d2}

> 难度：3 · 类型：QA

### 题目要点

Vue 中的 **Scoped Styles** 通过在组件样式中自动生成唯一的类名，并将其应用到 DOM 元素上，从而实现了样式隔离。这种方式确保了组件样式不会相互干扰，避免了全局样式污染的问题。通过这种机制，Vue 使得每个组件的样式和逻辑更加独立，有利于提高代码的可维护性和可复用性。

<details>
<summary>参考答案</summary>

在 Vue 中，**Scoped Styles**（作用域样式）是通过在组件的 `&lt;style&gt;` 标签中添加 `scoped` 属性来实现的，它的核心思想是确保该组件的样式只影响当前组件的 DOM，而不影响全局样式或其他组件的样式。

### 原理

1. **生成唯一的类名**：
   Vue 会通过编译器自动为组件的每个元素生成一个唯一的类名。这个类名通常会在组件的 `&lt;style scoped&gt;` 标签中定义的 CSS 规则上附加一个特定的作用域标识符（hash 值）。这些唯一的类名确保样式只作用于当前组件，而不会与其他组件的样式发生冲突。

2. **CSS 样式的自动作用域绑定**：
   在编译过程中，Vue 会遍历 `&lt;style scoped&gt;` 标签中的所有 CSS 选择器，并通过增加一个动态生成的属性（如 `data-v-xxxxxx`）来确保这些样式只应用于当前组件。这个属性会被自动加到所有 HTML 元素的 `class` 属性上，从而达到样式隔离的目的。

3. **如何生成唯一的作用域标识符**：
   Vue 会在编译时根据当前组件的 ID 或文件名生成一个唯一的哈希值（例如 `data-v-123abc`），这个哈希值会被附加到样式选择器和元素的 `class` 属性中。

   例如，如果我们有如下的 Vue 组件：

   ```vue
   <template>
     <div class="button">
       Click me
     </div>
   </template>

   <style scoped>
     .button {
       background-color: blue;
     }
   </style>
   ```

   编译后的 DOM 可能会变成这样：

   ```html
   <div class="button" data-v-123abc>
     Click me
   </div>
   ```

   Vue 会在 `&lt;style scoped&gt;` 中的 `.button` 选择器前自动加上哈希值 `data-v-123abc`，并将其加到生成的 HTML 元素上，从而确保样式只应用于该组件内的 `.button` 类，而不会影响其他组件。

   编译后的 CSS 会变成这样：

   ```css
   .button[data-v-123abc] {
     background-color: blue;
   }
   ```

4. **作用域样式的限制性**：
   - **仅限当前组件**：`scoped` 样式只会影响当前组件的 DOM。它不会影响父组件或子组件的样式。
   - **全局样式**：如果你想使用全局样式（例如，定义一个字体大小、通用布局等），你可以通过在 `&lt;style&gt;` 标签中不加 `scoped` 或者使用 `>>>`（深度选择器）来让某些样式穿透到子组件。

### 使用示例

```vue
<template>
  <div class="my-component">
    <p class="message">Hello, Vue!</p>
  </div>
</template>

<style scoped>
.my-component {
  background-color: lightblue;
}

.message {
  color: white;
}
</style>
```

编译后的效果如下：

```html
<div class="my-component" data-v-abc123>
  <p class="message" data-v-abc123>Hello, Vue!</p>
</div>
```

```css
.my-component[data-v-abc123] {
  background-color: lightblue;
}

.message[data-v-abc123] {
  color: white;
}
```

- `data-v-abc123` 是 Vue 自动生成的哈希值，它确保 `.my-component` 和 `.message` 的样式只应用于当前组件。
- 通过这种方式，Vue 的 Scoped Styles 有效地避免了样式污染。

### 样式穿透

如果需要修改子组件的样式，可以使用深度选择器 `>>>` 或 `/deep/`，来让某些样式穿透到子组件中。比如：

```css
/* 通过深度选择器覆盖子组件中的样式 */
.my-component >>> .child {
  color: red;
}
```

### 优点

1. **避免全局污染**：Scoped 样式使得组件的样式与其他组件完全隔离，避免了全局样式污染问题。
2. **增强可维护性**：每个组件的样式都与组件逻辑紧密结合，便于维护和重构。
3. **自动生成唯一类名**：无需手动管理命名空间，Vue 会自动处理。
4. **提高可读性**：每个组件都有自己独立的样式，清晰可见，易于理解和调试。

### 缺点

1. **性能开销**：生成唯一类名和样式时，会增加一些计算开销，尤其是当有大量组件时。
2. **深度选择器限制**：某些场景下需要穿透子组件的样式，可能会增加复杂度和维护成本。

</details>

## 44. Vue 有了数据响应式，为何还要 diff ？ {#question-cd026df0-0b62-47dc-93e3-c30a1c3d8ab5}

> 难度：3.5 · 类型：QA

### 题目要点

Vue 的数据响应式系统和虚拟 DOM 的 diff 算法是两个不同的概念，解决的是不同的问题：

1. **数据响应式**：Vue 的响应式系统通过 `Object.defineProperty`（Vue 2.x）或 `Proxy`（Vue 3.x）实现，它使得数据的变化能够自动通知视图更新。这种响应式机制确保了数据和视图的一致性，但并不直接处理 DOM 的更新。

2. **虚拟 DOM 和 diff 算法**：虚拟 DOM 是 Vue 用来高效更新实际 DOM 的机制。每次数据发生变化时，Vue 会生成一个新的虚拟 DOM 树，并与上一次的虚拟 DOM 树进行比较（diffing）。这一步骤帮助 Vue 识别哪些部分的 DOM 需要更新，从而减少不必要的 DOM 操作，提高性能。

总结来说，数据响应式确保数据变化能够被捕获，而 diff 算法确保 DOM 的更新是高效的。两者配合使用，提升了 Vue 应用的性能和用户体验。

<details>
<summary>参考答案</summary>

Vue 中的数据响应式和虚拟 DOM 的 diff 算法是两个不同的概念，它们分别解决了不同的问题，相互协作以提高页面渲染的效率和性能。

### 数据响应式

Vue 的数据响应式系统通过 `Object.defineProperty` 或者 ES6 的 `Proxy` 来实现，主要解决了以下问题：

1. **数据绑定**：保证了视图与数据的同步更新，当数据发生变化时，视图会自动更新，避免了手动操作 DOM 的繁琐和易出错性。

2. **依赖追踪**：Vue 能够追踪每个数据的依赖关系，即哪些组件或者计算属性依赖于某个数据。当数据变化时，自动更新依赖的组件或者计算属性。

### 虚拟 DOM 和 Diff 算法

虚拟 DOM 是一种内存中的表示结构，它是对真实 DOM 的抽象。Diff 算法是一种高效更新 DOM 的策略，它通过比较新旧虚拟 DOM 树的差异，最小化了更新操作，提高了页面的渲染效率。

#### 为什么还需要 Diff 算法？

1. **性能优化**：直接操作真实 DOM 是非常昂贵的，而虚拟 DOM 可以在内存中快速进行比较和计算差异。Diff 算法帮助减少了更新操作的次数和范围，从而提升了页面渲染的性能。

2. **批量更新**：Diff 算法能够将多次 DOM 更新操作合并为一次，避免了频繁的 DOM 操作，减少了浏览器的重排和重绘。

3. **跨平台兼容**：虚拟 DOM 和 Diff 算法使得 Vue 可以运行在不同的平台上，例如浏览器、Weex 等，统一了渲染逻辑和数据响应式的实现。

4. **更新效率**：即使是响应式系统可以自动更新视图，但是如果每次数据变化都直接操作真实 DOM，可能会带来性能问题。Diff 算法可以智能地比较新旧 DOM 树的变化，只更新必要的部分，从而提高了更新效率。

### 综合作用

Vue 的数据响应式系统和虚拟 DOM + Diff 算法是紧密协作的：

- **数据响应式**：保证了数据和视图的同步更新，提供了便捷的开发方式。
- **虚拟 DOM + Diff 算法**：提高了页面渲染的效率和性能，减少了不必要的 DOM 操作，确保了页面的流畅性和响应性。

总体来说，数据响应式和 Diff 算法是为了解决不同层面的问题，结合起来使得 Vue 能够提供高效、流畅的用户体验。

</details>

## 45. vue3 为什么不需要时间分片？ {#question-944d0ea6-53f8-426b-b583-7010d1639860}

> 难度：3 · 类型：QA

### 题目要点

Vue 3 通过异步渲染和优化的虚拟 DOM diff 算法来提升性能，从而减少了对时间分片的需求。其异步渲染机制允许 Vue 将渲染任务拆分为小块，并在浏览器空闲时执行，避免了长时间阻塞主线程。这种方法有效地提高了更新效率，避免了传统时间分片的复杂性。

<details>
<summary>参考答案</summary>

Vue 3 不需要时间分片（time slicing）主要是因为它的核心渲染机制和性能优化策略已经足够高效，能够在大多数情况下提供流畅的用户体验。以下是详细的原因：

### 1. **编译器优化**

Vue 3 引入了一个全新的编译器，能够生成更高效的渲染函数。这个编译器在编译过程中进行了一系列优化，例如：

- **静态提升**：将不变的节点提升为常量，只在初次渲染时计算一次。
- **预字符串化**：将静态内容直接转化为字符串，减少了运行时的开销。
- **缓存事件处理程序**：避免了不必要的重新绑定。

这些优化措施大大减少了 Vue 3 在更新 DOM 时的计算量，使得渲染过程更加高效。

### 2. **响应式系统的改进**

Vue 3 使用了基于代理的响应式系统，替代了 Vue 2 中基于 `Object.defineProperty` 的实现。新的响应式系统更加高效，具备以下优点：

- **精细的依赖追踪**：只追踪实际使用的属性，避免了不必要的依赖收集。
- **懒惰计算**：仅在需要时才计算依赖，减少了计算量。

这些改进使得 Vue 3 能够更快速地响应数据变化，从而减少了渲染开销。

### 3. **虚拟 DOM 和 Diff 算法的优化**

Vue 3 对虚拟 DOM 及其 diff 算法进行了优化，使得差异计算更加高效：

- **静态标记**：编译期间标记静态节点，跳过不变的部分。
- **块级优化**：将动态节点分块，只对发生变化的块进行更新。

这些优化措施减少了 DOM 更新的频率和范围，提高了整体渲染性能。

### 4. **单次异步队列**

Vue 3 的更新机制基于单次异步队列（single asynchronous queue），它确保在同一事件循环中只进行一次批量更新。这种方式减少了不必要的重复计算和 DOM 操作，使得更新过程更加高效。

### 5. **自动批处理**

Vue 3 实现了自动批处理机制，在同一个事件循环中对多次数据更新进行合并，从而减少了渲染次数。这种机制在避免频繁重绘的同时，保证了界面的流畅性。

### 6. **现代浏览器的性能**

现代浏览器的性能已经得到了极大的提升，尤其是在处理 JavaScript 和 DOM 操作方面。Vue 3 的优化能够充分利用这些性能改进，从而在绝大多数情况下不需要时间分片。

### 总结

Vue 3 通过编译器优化、响应式系统改进、虚拟 DOM 和 Diff 算法优化、单次异步队列、自动批处理等技术手段，大幅提升了渲染效率和性能。再加上现代浏览器的性能提升，使得 Vue 3 能够在大多数情况下提供流畅的用户体验，而无需借助时间分片等复杂的技术。

</details>

## 46. vue3 为什么要引入 Composition API ？ {#question-7b8e4d40-609a-4e52-96e0-a4515709125c}

> 难度：2 · 类型：QA

### 题目要点

Vue 3 引入 Composition API 主要是为了提高代码的组织性和复用性。它允许开发者使用函数式的方式组织组件逻辑，从而更好地处理复杂的逻辑和状态共享，尤其在大型项目中。这种方法也提供了更好的类型推断支持（在 TypeScript 中尤为重要），并改善了代码的可维护性和可读性。

<details>
<summary>参考答案</summary>

Vue 3 引入 Composition API 的原因主要是为了更好地解决以下几个问题：

### 1. 更好的代码组织和重用

在 Vue 2 中，使用选项式 API（Options API）来定义组件的逻辑，通常将数据、方法、计算属性和生命周期钩子分开写在不同的配置对象中。当组件变得复杂时，不同功能的代码可能会散落在各个部分，难以维护和重用。

#### 示例：

```javascript
// Vue 2 中使用 Options API
export default {
  data() {
    return {
      count: 0,
      message: 'Hello World'
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  created() {
    console.log(this.message);
  }
};
```

通过 Composition API，可以将相关功能的逻辑组织在一起，从而提高代码的可读性和可维护性。

#### 示例：

```javascript
// Vue 3 中使用 Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const message = ref('Hello World');

    const doubleCount = computed(() => count.value * 2);

    const increment = () => {
      count.value++;
    };

    onMounted(() => {
      console.log(message.value);
    });

    return {
      count,
      doubleCount,
      increment,
      message
    };
  }
};
```

### 2. 更好的逻辑复用

在 Vue 2 中，逻辑复用主要通过 mixins 和 scoped slots 实现，但它们都有一些缺点，比如命名冲突和代码可读性差。

Composition API 通过组合函数（composable functions）来实现逻辑复用，这些函数可以在多个组件之间共享和复用逻辑，避免了 mixins 的缺点。

#### 示例：

```javascript
// 一个组合函数，可以在多个组件中复用
import { ref, onMounted } from 'vue';

export function useMessage() {
  const message = ref('Hello World');

  onMounted(() => {
    console.log(message.value);
  });

  return {
    message
  };
}
```

#### 在组件中使用：

```javascript
import { ref } from 'vue';
import { useMessage } from './useMessage';

export default {
  setup() {
    const count = ref(0);
    const { message } = useMessage();

    const increment = () => {
      count.value++;
    };

    return {
      count,
      message,
      increment
    };
  }
};
```

### 3. 更好的 TypeScript 支持

Composition API 天然地支持 TypeScript，使得类型推断和类型检查更为自然和方便。相比于 Options API，通过 Composition API 定义的逻辑更容易进行类型声明和类型推断，提升了开发体验。

#### 示例：

```typescript
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref<number>(0);
    const doubleCount = computed<number>(() => count.value * 2);

    const increment = (): void => {
      count.value++;
    };

    return {
      count,
      doubleCount,
      increment
    };
  }
};
```

### 4. 适应函数式编程趋势

Composition API 借鉴了函数式编程的思想，将逻辑封装成函数，使得代码更加简洁、模块化、可测试，同时也更符合现代 JavaScript 开发趋势。

### 总结

Vue 3 引入 Composition API 主要是为了提升代码组织和复用性、提供更好的 TypeScript 支持、适应函数式编程趋势，并且解决 Vue 2 中存在的一些问题。通过 Composition API，可以让组件逻辑更加清晰、灵活和易于维护。

</details>

## 47. 谈谈 Vue 事件机制，并手写$on、$off、$emit、$once {#question-b63832ef-77c7-4507-baf5-1134957368c0}

> 难度：3 · 类型：QA

### 题目要点

Vue 的事件机制是实现组件间通信的重要方式，它通过`$on`、`$off`、`$emit`和`$once`等方法允许组件之间进行事件的订阅、取消订阅、触发和一次性订阅。这些方法的工作原理可以通过手写它们的实现来更深入地理解。

#### Vue 事件机制的工作原理

1. **`$on(event, callback)`**：当监听器`$on`被调用时，它将回调函数`callback`存储在一个事件监听列表中。这个列表通常保存在一个对象中，例如`this.events`。
2. **`$off(event, callback)`**：当取消监听器`$off`被调用时，它会从事件监听列表中移除之前通过`$on`存储的回调函数。如果`callback`参数没有提供，则移除所有与`event`相关的事件监听器。
3. **`$emit(event, ...args)`**：当事件发射器`$emit`被调用时，它会遍历事件监听列表，并调用所有存储在该列表中的回调函数。它将这些回调函数作为参数传递，以便它们可以访问事件数据。
4. **`$once(event, callback)`**：当一次性监听器`$once`被调用时，它与`$on`类似，但是它会返回一个函数。当这个返回的函数被调用时，它会触发事件，并执行回调函数。之后，它将自动从事件监听列表中移除该回调函数，确保它只被调用一次。

手写实现参考详细答案

<details>
<summary>参考答案</summary>

Vue 的事件机制允许组件之间进行通信，通过 `$on`、`$off`、`$emit` 和 `$once` 等方法进行事件的订阅、取消订阅、触发和一次性订阅。我们可以通过手写这些方法来理解其工作原理。

### Vue 事件机制

1. **`$on(event, callback)`**：监听特定事件。
2. **`$off(event, callback)`**：停止监听特定事件。
3. **`$emit(event, ...args)`**：触发特定事件。
4. **`$once(event, callback)`**：只监听一次特定事件。

### 手写实现

下面是手写这些方法的简单实现：

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 监听事件
  $on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 停止监听事件
  $off(event, callback) {
    if (!this.events[event]) return;

    if (!callback) {
      // 如果没有传递 callback，移除所有事件监听
      this.events[event] = [];
    } else {
      // 移除特定的事件监听
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // 触发事件
  $emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback.apply(this, args));
    }
  }

  // 只监听一次事件
  $once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.$off(event, wrapper);
    };
    this.$on(event, wrapper);
  }
}

// 示例
const eventBus = new EventEmitter();

// 监听事件
eventBus.$on('test', (msg) => console.log('test event:', msg));

// 触发事件
eventBus.$emit('test', 'Hello, World!');

// 监听一次事件
eventBus.$once('once', (msg) => console.log('once event:', msg));

// 触发一次性事件
eventBus.$emit('once', 'This should appear once');
eventBus.$emit('once', 'This should not appear');

// 停止监听事件
eventBus.$off('test');

// 触发事件（已经移除监听）
eventBus.$emit('test', 'This should not appear');
```

### 解释

1. **`$on`**：将事件和回调函数添加到 `events` 对象中。
2. **`$off`**：如果没有传递回调函数，则移除所有监听。如果传递了回调函数，则只移除特定的回调。
3. **`$emit`**：触发事件，调用所有注册的回调函数并传递参数。
4. **`$once`**：使用一个包装函数 (`wrapper`) 包装原始回调函数，确保回调只执行一次，然后移除事件监听。

</details>

## 48. computed 计算值为什么还可以依赖另外一个 computed 计算值？ {#question-b5d40614-89d3-42c7-823a-2102ef8006b1}

> 难度：3 · 类型：QA

### 题目要点

`computed` 属性可以依赖其他 `computed` 计算值，因为 Vue 的计算属性是基于依赖追踪的。

具体原因包括：

1. **依赖追踪机制**：Vue 的计算属性会自动跟踪它们依赖的数据。一个计算属性在计算时，会注册它依赖的数据和其他计算属性。这意味着当这些依赖项发生变化时，相关的计算属性会重新计算。

2. **自动更新**：当一个计算属性依赖于其他计算属性时，这些计算属性的依赖关系会被记录。当依赖项发生变化时，Vue 会自动触发所有依赖于这些计算属性的计算属性重新计算，从而确保它们始终保持最新状态。

3. **性能优化**：计算属性是基于缓存的，只有当它们的依赖项发生变化时才会重新计算。这使得即使计算属性之间存在依赖关系，也不会引起性能问题，因为每个计算属性会在需要时才进行重新计算。

总结来说，`computed` 属性可以依赖其他 `computed` 属性，因为 Vue 的计算属性机制能够自动处理依赖关系，并在数据变化时正确地触发更新。

<details>
<summary>参考答案</summary>

在 Vue 中，`computed` 计算属性可以依赖其他 `computed` 计算属性，因为 Vue 的响应式系统能够正确地追踪依赖关系。

以下是具体的原理和机制：

### 响应式系统的依赖追踪

Vue 的响应式系统通过依赖收集和依赖追踪来实现。当一个响应式属性被读取时，Vue 会记录下当前的依赖（即哪个组件或者计算属性正在读取这个值）。当这个属性发生变化时，Vue 会通知这些依赖进行更新。

### `computed` 计算属性的实现

`computed` 计算属性本质上是具有缓存功能的特殊方法。它们只有在其依赖的响应式属性发生变化时才会重新计算，否则返回缓存的值。

### 依赖其他计算属性

当一个 `computed` 计算属性依赖于另一个 `computed` 计算属性时，Vue 能够正确地追踪这些依赖关系。这是因为：

1. **依赖收集**：
   当第一个计算属性被访问时，它的 getter 会被调用，并且 Vue 会记录下这个依赖关系。这个过程包括记录依赖的其他计算属性。

2. **缓存机制**：
   如果另一个计算属性的值没有改变，Vue 不会重复计算它，而是直接使用缓存值。这保证了性能优化。

3. **更新机制**：
   当基础的响应式属性发生变化时，所有依赖它的计算属性都会被重新计算，并且最终更新到组件的渲染中。

### 示例

下面是一个具体的例子来说明这个过程：

```javascript
new Vue({
  data() {
    return {
      a: 1,
      b: 2
    };
  },
  computed: {
    sum() {
      return this.a + this.b;
    },
    doubleSum() {
      return this.sum * 2;
    }
  }
});
```

在这个例子中：

1. **依赖收集**：
   - 当 `doubleSum` 被访问时，Vue 会调用其 getter，发现它依赖于 `sum`。
   - 然后 Vue 会访问 `sum`，记录下 `sum` 依赖于 `a` 和 `b`。

2. **缓存机制**：
   - 如果 `a` 和 `b` 没有改变，再次访问 `doubleSum` 时，Vue 直接返回缓存的值，不会重复计算 `sum`。

3. **更新机制**：
   - 如果 `a` 或 `b` 发生改变，Vue 会重新计算 `sum`，然后更新 `doubleSum`。

### 总结

Vue 的响应式系统能够正确地追踪 `computed` 计算属性之间的依赖关系，因为它使用了依赖收集和缓存机制。当基础的响应式属性发生变化时，所有依赖关系都会被重新计算并更新，从而保持应用状态的一致性。

</details>

## 49. 说一下 vm.$set 原理 {#question-3622c49b-aa21-46f9-8818-b03eb41b0745}

> 难度：3 · 类型：QA

### 题目要点

`vm.$set` 是 Vue.js 提供的一个方法，用于向 Vue 实例中添加新的响应式属性。其原理如下：

1. **响应式系统**：Vue 的响应式系统是通过 `Object.defineProperty`（Vue 2.x）或 `Proxy`（Vue 3.x）来实现的。它使得对象的属性变化能够被 Vue 监控，从而自动更新视图。

2. **动态添加属性**：在 Vue 中，直接向一个已经创建的对象中添加新属性时，这些新属性不会自动成为响应式的。`vm.$set` 通过 `Object.defineProperty` 将新属性添加到对象中，并确保这个新属性也是响应式的。

3. **更新视图**：`vm.$set` 不仅添加了新的响应式属性，还会触发 Vue 的视图更新机制，确保视图与数据保持同步。

`vm.$set` 通过以下步骤工作：
1. 使用 `Object.defineProperty` 将 `newProperty` 添加到 `someObject` 中，并将其设置为响应式。
2. 触发视图的更新，确保新属性的变化能够反映在界面上。

在 Vue 3.x 中，`vm.$set` 不再使用，取而代之的是 `reactive` 和 `ref` API 来处理响应式数据。

<details>
<summary>参考答案</summary>

`vm.$set` 是 Vue 中用于在对象上设置属性并确保新属性是响应式的方法。其实现原理可以简化为以下几个步骤：

1. **处理数组情况**：
   如果目标是数组，并且键是有效的数组索引，使用 `splice` 方法添加新元素以保持响应性。

2. **处理已有属性**：
   如果属性已经存在于对象中，直接赋值。

3. **处理新属性**：
   如果目标对象不是响应式对象，直接赋值新属性。

4. **添加响应式新属性**：
   如果目标对象是响应式的，通过 `defineReactive` 方法将新属性定义为响应式。这包括定义 getter 和 setter。

5. **通知依赖更新**：
   调用 `ob.dep.notify()` 通知所有依赖于该对象的 watchers 执行更新。

### `defineReactive` 简要实现

`defineReactive` 方法定义对象属性为响应式，主要步骤：

- **依赖管理**：
  创建一个 `Dep` 实例管理依赖。
- **递归观察**：
  使用 `observe` 递归地将属性值转化为响应式。
- **定义 getter 和 setter**：
  使用 `Object.defineProperty` 定义属性的 getter 和 setter。在 getter 中收集依赖，在 setter 中通知依赖更新。

### 总结

`vm.$set` 使得在运行时动态添加的新属性能够响应数据变化，从而保持 Vue 的响应式特性。

</details>

## 50. 怎么在 Vue 中定义全局方法？ {#question-eb80a3e8-2384-4a8b-ad8f-e3ea159a9317}

> 难度：3 · 类型：QA

### 题目要点

在 Vue.js 中定义全局方法，可以通过多种方式实现：

1. **在 Vue 2 中通过 Vue.prototype 定义全局方法**：直接在 Vue 的原型对象上添加方法，使得所有 Vue 实例都能访问这个方法。
2. **在 Vue 3 中通过 `app.config.globalProperties` 定义全局方法**：Vue 3 提供了一个新的全局 API，允许在应用实例上定义全局属性或方法。
3. **使用混入（Mixin）**：创建一个混入对象并将其全局注册，可以在所有组件中使用这个混入对象定义的方法。
4. **创建插件**：创建一个 Vue 插件来封装全局方法，并在 `main.js` 中安装插件。

这些方法可以用于创建和共享代码片段、添加自定义指令、提供全局的数据和功能等。

<details>
<summary>参考答案</summary>

在 Vue.js 中定义全局方法，可以通过多种方式实现，包括直接在 Vue 的原型对象上添加方法、使用 Vue 3 的全局 API (`app.config.globalProperties`)、以及通过混入 (mixin) 等方法。

以下是几种常见的方法：

### 方法一：在 Vue 2 中通过 Vue.prototype 定义全局方法

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// 定义全局方法
Vue.prototype.$myGlobalMethod = function () {
  console.log('这是一个全局方法');
};

new Vue({
  render: h => h(App),
}).$mount('#app');
```

#### 在组件中使用

```javascript
<template>
  <div>
    <button @click="useGlobalMethod">调用全局方法</button>
  </div>
</template>

<script>
export default {
  methods: {
    useGlobalMethod() {
      this.$myGlobalMethod();
    }
  }
}
</script>
```

### 方法二：在 Vue 3 中通过 `app.config.globalProperties` 定义全局方法

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// 定义全局方法
app.config.globalProperties.$myGlobalMethod = function () {
  console.log('这是一个全局方法');
};

app.mount('#app');
```

#### 在组件中使用

```vue
<template>
  <div>
    <button @click="useGlobalMethod">调用全局方法</button>
  </div>
</template>

<script>
export default {
  methods: {
    useGlobalMethod() {
      this.$myGlobalMethod();
    }
  }
}
</script>
```

### 方法三：使用混入（Mixin）

你可以创建一个混入对象并将其全局注册，从而在所有组件中使用这个混入对象定义的方法。

```javascript
// globalMixin.js
export const globalMixin = {
  methods: {
    $myGlobalMethod() {
      console.log('这是一个全局方法');
    }
  }
};
```

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';
import { globalMixin } from './globalMixin';

Vue.config.productionTip = false;

// 全局混入
Vue.mixin(globalMixin);

new Vue({
  render: h => h(App),
}).$mount('#app');
```

#### 在组件中使用

```vue
<template>
  <div>
    <button @click="useGlobalMethod">调用全局方法</button>
  </div>
</template>

<script>
export default {
  methods: {
    useGlobalMethod() {
      this.$myGlobalMethod();
    }
  }
}
</script>
```

### 方法四：创建插件

你可以创建一个 Vue 插件来封装全局方法，并在 `main.js` 中安装插件。

```javascript
// myPlugin.js
export default {
  install(Vue) {
    Vue.prototype.$myGlobalMethod = function () {
      console.log('这是一个全局方法');
    }
  }
};
```

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';
import myPlugin from './myPlugin';

Vue.config.productionTip = false;

// 安装插件
Vue.use(myPlugin);

new Vue({
  render: h => h(App),
}).$mount('#app');
```

#### 在组件中使用

```vue
<template>
  <div>
    <button @click="useGlobalMethod">调用全局方法</button>
  </div>
</template>

<script>
export default {
  methods: {
    useGlobalMethod() {
      this.$myGlobalMethod();
    }
  }
}
</script>
```

</details>

## 51. Vue3 中父组件怎么监听到子组件的生命周期？ {#question-126917b6-56bc-4c94-81b7-f39263395546}

> 难度：3 · 类型：QA

### 题目要点

父组件监听子组件生命周期通常有三种方式：

1. **子组件 emit 生命周期事件（推荐）**

   * 最符合组件通信设计
2. **Vue3 vnode 生命周期事件 `@vue:mounted`**

   * 无侵入监听
3. **ref + defineExpose**

   * 父组件主动查询子组件状态

核心原则：

> 生命周期属于组件内部行为，应由子组件主动暴露，而不是父组件强行探测。

<details>
<summary>参考答案</summary>

在 **Vue3** 中，父组件**不能直接“监听”子组件生命周期钩子**（不像 DOM 事件那样天然可监听），但可以通过几种设计模式间接感知或控制子组件生命周期阶段。

本质上，这是一个 **组件通信 + 生命周期暴露策略** 的问题。

## 一、子组件主动通知（emit 事件）

### 思想

生命周期属于子组件内部行为，因此应由 **子组件在生命周期中主动向父组件发送事件**。

### 子组件

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['mounted', 'unmounted'])

onMounted(() => {
  emit('mounted')
})

onUnmounted(() => {
  emit('unmounted')
})
</script>
```

---

### 父组件

```vue
<Child
  @mounted="handleChildMounted"
  @unmounted="handleChildUnmounted"
/>
```

```js
function handleChildMounted() {
  console.log('子组件已挂载')
}
```

---

### 优点

* 符合 Vue 单向数据流
* 解耦
* 可维护性强
* 最符合组件设计哲学

这是 **生产环境标准方案**。

---

## 二、通过 `ref` + `expose` 访问子组件状态

如果父组件需要在某些时机判断子组件是否已经初始化，可以让子组件暴露状态。

---

### 子组件

```vue
<script setup>
import { ref, onMounted } from 'vue'

const ready = ref(false)

onMounted(() => {
  ready.value = true
})

defineExpose({
  ready
})
</script>
```

---

### 父组件

```vue
<Child ref="childRef" />
```

```js
const childRef = ref(null)

watchEffect(() => {
  if (childRef.value?.ready) {
    console.log('子组件 mounted 完成')
  }
})
```

---

### 适用场景

* 父组件需要调用子组件方法
* 类似 imperative 控制（例如播放器、图表实例）

---

## 三、利用组件 VNode 生命周期（底层方式）

Vue 内部其实支持 vnode hook：

```vue
<Child
  @vue:mounted="onMounted"
  @vue:unmounted="onUnmounted"
/>
```

---

### 示例

```vue
<Child @vue:mounted="handleMounted" />
```

---

### 注意

这是 **Vue3 提供的 vnode 生命周期监听**，很多人不知道。

可监听：

| 事件               | 含义      |
| ---------------- | ------- |
| `@vue:mounted`   | 子组件挂载完成 |
| `@vue:updated`   | 子组件更新   |
| `@vue:unmounted` | 子组件卸载   |

---

### 优点

* 无需改子组件代码
* 父组件直接监听

### 缺点

* 偏底层 API
* 可读性较弱
* 不适合复杂业务通信

---

## 四、Provide / Inject（跨层级监听）

当组件层级很深时：

子组件生命周期中修改 provide 的状态：

```js
onMounted(() => {
  injectedStore.childReady = true
})
```

父组件监听该响应式状态。

适用于：

* 表单系统
* 编辑器
* 插件架构

---

## 五、不推荐方案（了解即可）

### 1️⃣ 直接访问内部实例

```js
childRef.value.$.isMounted
```

问题：

* 依赖内部实现
* 非稳定 API
* 升级可能失效

</details>

## 52. vue组件里写的原生addEventListeners监听事件，要手动去销毁吗？为什么？ {#question-0f2dd6c7-8484-4b6c-b081-f241376cef77}

> 难度：1 · 类型：QA

### 题目要点

在 Vue 组件中，如果你使用 `addEventListener` 添加了原生的 DOM 事件监听器，通常需要在组件销毁时手动移除这些监听器，以避免以下问题：

1. **内存泄漏**：如果不手动移除事件监听器，它们会继续存在于内存中，即使对应的 DOM 元素已经被移除。这会导致内存泄漏，因为监听器持有对 DOM 元素的引用，导致垃圾回收机制无法回收这些元素。
2. **意外行为**：如果监听器没有被移除，在组件销毁后这些监听器可能会继续响应事件，这可能导致应用程序的意外行为或错误。
3. **性能问题**：随着时间的推移，未移除的事件监听器会堆积，导致性能下降，尤其是在频繁创建和销毁组件的情况下。

在 Vue 组件中，可以利用生命周期钩子来添加和移除事件监听器，例如在 `mounted` 钩子中添加事件监听器，在 `beforeDestroy` 钩子中移除事件监听器。这样可以确保在组件销毁时不会留下任何未清理的监听器，从而避免上述问题。

<details>
<summary>参考答案</summary>

在 Vue 组件中，如果你使用 `addEventListener` 添加了原生的 DOM 事件监听器，通常需要在组件销毁时手动移除这些监听器。

原因如下：

1. **内存泄漏**：
   如果不手动移除事件监听器，监听器会继续存在于内存中，即使对应的 DOM 元素已经被移除。这会导致内存泄漏，因为监听器持有对 DOM 元素的引用，导致垃圾回收机制无法回收这些元素。

2. **意外行为**：
   如果监听器没有被移除，在组件销毁后这些监听器可能会继续响应事件，这可能导致应用程序的意外行为或错误。

3. **性能问题**：
   随着时间的推移，未移除的事件监听器会堆积，导致性能下降，尤其是在频繁创建和销毁组件的情况下。

在 Vue 组件中，可以利用生命周期钩子来添加和移除事件监听器：

```vue
<template>
  <div ref="myElement">点击我</div>
</template>

<script>
export default {
  mounted() {
    // 在组件挂载时添加事件监听器
    this.$refs.myElement.addEventListener('click', this.handleClick);
  },
  beforeDestroy() {
    // 在组件销毁前移除事件监听器
    this.$refs.myElement.removeEventListener('click', this.handleClick);
  },
  methods: {
    handleClick(event) {
      console.log('元素被点击了');
    }
  }
};
</script>
```

</details>

## 53. vue中，推荐在哪个生命周期发起请求？ {#question-a9e3ac89-9ecf-4b22-bcbb-e51d0197005b}

> 难度：1 · 类型：QA

### 题目要点

在 Vue 组件中，推荐在 `mounted` 生命周期钩子中发起请求。这样做的主要原因包括：

1. **确保 DOM 已被渲染**：`mounted` 钩子在组件的 DOM 已经被插入文档之后调用，这意味着可以安全地依赖 DOM 元素进行数据请求和操作。
2. **避免不必要的请求**：如果在 `created` 钩子中发起请求，可能会在组件尚未挂载时请求数据，如果组件在请求完成前被销毁，可能会导致内存泄漏或不必要的资源浪费。
3. **处理组件状态**：在 `mounted` 钩子中发起请求，可以在请求开始前设置加载状态，在请求完成后更新组件状态，如显示数据或处理错误。

尽管 `mounted` 是推荐的生命周期钩子，但在特定场景下，如服务器端渲染（SSR）或依赖数据初始化，可能需要在 `created` 钩子中发起请求。

<details>
<summary>参考答案</summary>

推荐在 `mounted` 生命周期钩子中发起请求。这样做有几个重要的理由：

1. **确保 DOM 已经被渲染**：
   - `mounted` 钩子在组件的 DOM 已经被插入文档之后调用。这意味着你可以确保所有的 DOM 元素都已经存在，如果你的请求结果需要直接操作或依赖这些 DOM 元素，那么在 `mounted` 中发起请求是安全的。

2. **避免不必要的请求**：
   - 在 `created` 钩子中发起请求有时会导致在组件还没有挂载时请求数据。如果组件在请求完成之前被销毁，可能会引发内存泄漏或不必要的资源浪费。因此，等待组件挂载完成再发起请求可以减少这些潜在问题。

3. **处理组件状态**：
   - 在 `mounted` 钩子中发起请求，能够确保你有机会在请求开始前处理组件的状态（例如设置加载状态），并且在请求完成后更新组件的状态（例如显示数据或处理错误）。

尽管 `mounted` 是推荐的生命周期钩子，但也有一些特定场景可能需要在 `created` 钩子中发起请求，例如：

- **SSR（服务器端渲染）**：在服务器端渲染中，Vue 实例的 `mounted` 钩子不会被调用，因为 DOM 并不会被真正挂载。在这种情况下，你可能需要在 `created` 钩子中发起请求。
- **依赖数据初始化**：如果组件在挂载之前就需要某些数据来初始化，可以在 `created` 钩子中发起请求，以确保数据在组件挂载时已经可用。

### 代码示例

```javascript
export default {
  data() {
    return {
      items: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get('/api/items');
        this.items = response.data;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  }
};
```

</details>

## 54. Vue中，created和mounted两个钩子之间调用时间差值受什么影响？ {#question-5c92d261-ffeb-41fc-80fb-7a523f680cd8}

> 难度：3 · 类型：QA

### 题目要点

1. **异步操作**：如在 `created` 中发起的数据请求会延迟 `mounted` 的调用时间。
2. **DOM 渲染**：复杂的模板或大量子组件会增加 DOM 渲染时间。
3. **浏览器渲染**：不同浏览器和设备的渲染性能可能不同。

<details>
<summary>参考答案</summary>

`created` 和 `mounted` 这两个生命周期钩子，分别在实例创建和挂载的不同阶段被调用。

它们之间的时间差值主要受以下几个因素的影响：

1. **模板编译时间**：
   - 当实例被创建时，Vue 会编译模板（或将模板转换为渲染函数），这个过程在 `created` 钩子之前完成。如果模板非常复杂或包含大量指令、组件，这个过程会更耗时，从而延长 `created` 和 `mounted` 之间的时间差。

2. **虚拟 DOM 渲染时间**：
   - 在 `mounted` 钩子调用之前，Vue 会将虚拟 DOM 渲染为实际的 DOM 元素。渲染复杂的组件树或处理大量数据绑定会增加这段时间。

3. **异步操作**：
   - 如果在 `created` 钩子中发起了异步操作（如 API 请求），这些操作本身不会直接影响 `created` 和 `mounted` 的时间差，但如果这些操作涉及数据更新，可能会间接增加挂载时间。

4. **浏览器性能**：
   - 浏览器的性能和设备的硬件配置也会影响模板编译和 DOM 渲染的速度，从而影响这两个钩子之间的时间差。

5. **其他钩子执行时间**：
   - 在 `beforeCreate`、`created`、`beforeMount` 等钩子中执行的代码也会影响到 `mounted` 钩子的触发时间。如果这些钩子中有大量计算或耗时操作，也会增加时间差。

总结起来，`created` 和 `mounted` 之间的时间差主要受到模板编译、虚拟 DOM 渲染的复杂性、异步操作、浏览器性能及其他生命周期钩子中执行代码的影响。在编写 Vue 应用时，优化这些方面可以减少 `created` 和 `mounted` 之间的时间差，提高应用性能。

</details>

## 55. 为什么 react 需要 fiber 架构，而 Vue 却不需要？ {#question-84265789-cf7a-4d95-b724-665234c6eb10}

> 难度：3 · 类型：QA

### 题目要点

React引入Fiber架构的主要原因是实现更好的异步渲染和更高效的任务调度。Fiber架构使得React能够更细粒度地控制和中断渲染过程，以便更好地响应用户交互、实现懒加载等功能。Vue在设计上采用了不同的策略，因此并不需要类似于Fiber的架构。

以下是React选择Fiber架构，而Vue没有类似架构的原因：

1. **异步渲染和任务优先级**：React的Fiber架构支持异步渲染和任务优先级，这对于复杂的用户界面和大规模应用中的性能优化非常重要。
2. **更好的中断和恢复机制**：Fiber架构提供了一种更灵活的中断和恢复机制，允许React在渲染过程中暂停、中断，然后根据优先级恢复。
3. **增量更新**：Fiber允许React实现增量更新，即只更新变化的部分而不必重新渲染整个组件树。

Vue的设计上采用了不同的响应式系统和渲染机制，不需要像React那样进行复杂的中断和任务调度。Vue的设计目标可能更注重简洁性和开发体验，而React的目标之一是提供更灵活和强大的性能优化工具。每个框架在设计上都有权衡和取舍，选择适合其目标和使用场景的策略。

<details>
<summary>参考答案</summary>

React引入Fiber架构的主要原因是为了实现更好的异步渲染和更高效的任务调度。Fiber架构使得React能够更细粒度地控制和中断渲染过程，以便更好地响应用户交互、实现懒加载等功能。Vue在设计上采用了不同的策略，因此并不需要类似于Fiber的架构。

以下是一些原因解释为什么React选择了Fiber架构，而Vue没有类似的架构：

1. **异步渲染和任务优先级：** React的Fiber架构使得实现异步渲染和任务优先级变得更加容易。这对于复杂的用户界面和大规模应用中的性能优化非常重要。React可以通过中断和恢复渲染过程，根据任务的优先级调度渲染工作，从而更好地响应用户输入和满足实时性要求。

2. **更好的中断和恢复机制：** Fiber架构提供了一种更灵活的中断和恢复机制，允许React在渲染过程中暂停、中断，然后根据优先级恢复。这使得React能够更好地处理复杂的渲染逻辑，并在需要时放弃低优先级的工作。

3. **增量更新：** Fiber允许React实现增量更新，即只更新变化的部分而不必重新渲染整个组件树。这对于提高渲染性能和减少不必要的工作非常有帮助。

Vue在设计上采用了一种不同的响应式系统和渲染机制，不需要像React那样进行复杂的中断和任务调度。Vue的设计目标可能更注重简洁性和开发体验，而React的目标之一是提供更灵活和强大的性能优化工具。每个框架在设计上都有权衡和取舍，选择适合其目标和使用场景的策略。

</details>

## 56. 说说你对渐进式框架的理解 {#question-4c0c461d-35da-4944-be7a-88e75e861d62}

> 难度：1 · 类型：QA

### 题目要点

渐进式框架（Progressive Frameworks）是指那些可以逐步引入和扩展的框架。它们允许开发者从小的、简单的功能开始，逐步增加复杂性而不会影响应用的现有部分。具体来说：

1. **模块化**：渐进式框架通常提供了一个基础的核心功能，开发者可以根据需要引入额外的模块或插件，来扩展框架的功能，而不是一开始就需要使用整个框架的所有功能。

2. **灵活性**：这种框架允许开发者在不需要完全重构现有应用的情况下，逐步集成和采用框架的特性。例如，Vue.js 就是一个渐进式框架，你可以先从简单的组件开始使用，逐步引入更复杂的功能如路由和状态管理。

3. **渐进增强**：框架的设计旨在支持逐步增强，开发者可以先实现最基本的功能，然后再逐步添加复杂的功能，而不需要立即掌握和应用框架的所有特性。

4. **集成能力**：渐进式框架通常易于与其他库和框架集成，使得在现有项目中引入新技术变得更加平滑。

这种设计使得渐进式框架非常适合逐步改进现有系统或逐步引入新技术，增强了开发的灵活性和效率。

<details>
<summary>参考答案</summary>

渐进式的含义：没有多做职责之外的事，只做了自己该做的事，没有做不该做的事，仅此而已。

更直白一点就是，用你想用或者能用的功能特性，你不想用的部分功能可以先不用。VUE不强求你一次性接受并使用它的全部功能特性。

比如以下两种场景，Vue 发挥了很大的优点：

* 场景一：公司刚开始一个项目，技术人员对Vue的掌握也不足够。那么我们就不能使用VUE了么？当然不是，如果你只是使用VUE做些基础操作，如：页面渲染、表单处理提交功能，那还是非常简单的，成熟技术人员上手也就一两天。完全可以用它去代替jquery。并不需要你去引入其他复杂特性功能。

* 场景二：我们的项目规模逐渐的变大了，我们可能会逐渐用到前端路由、状态集中管理、并最终实现一个高度工程化的前端项目。这些功能特性我们可以逐步引入，当然不用也可以。

Vue 的适用面很广，你可以用它代替老项目中的JQuery。也可以在新项目启动初期，有限的使用VUE的功能特性，从而降低上手的成本。

</details>

## 57. vue的祖孙组件的通信方案有哪些？ {#question-e492260e-4dc9-43cf-a2ee-315edadeb931}

> 难度：2.5 · 类型：QA

### 题目要点

在 Vue 中，祖孙组件之间的通信可以通过以下几种方式实现：

1. **Props / $emit**：通过 `props` 在祖组件中传递数据给子组件，子组件通过 `$emit` 触发事件将数据传递回祖组件。这种方式适用于简单的数据传递。
2. **Provide / Inject**：祖组件使用 `provide` 功能提供数据，孙组件使用 `inject` 功能注入这些数据。这种方式允许祖组件向下级组件共享数据，无需显式传递。
3. **Event Bus**：创建一个全局的事件总线，在祖孙组件之间发送和接收事件。通过在事件总线上注册事件监听器和触发器，组件可以相互通信。
4. **Vuex**：使用 Vuex 进行状态管理，可以在祖孙组件之间共享和更新数据。Vuex 是 Vue 的官方状态管理库，提供了集中式存储管理和响应式更新。

<details>
<summary>参考答案</summary>

在 Vue 中，祖孙组件之间的通信可以通过以下几种方式来实现：

1. **Props / $emit**:
   - 祖组件通过 `props` 将数据传递给子组件，并且子组件通过 `$emit` 触发事件将数据传递回祖组件。
   - 这是一种常见的父子组件通信方式，通过属性(props)和自定义事件($emit)进行数据交流。

2. **Provide / Inject**:
   - 使用 `provide` 在祖组件中提供数据，然后使用 `inject` 在孙组件中注入这些数据。
   - 这种方式允许祖组件向下级组件共享数据，无需显式地将数据逐层传递。但要注意潜在的耦合性。

3. **Event Bus**:
   - 创建一个全局的事件总线(Event Bus)，用于在祖孙组件之间发送和接收事件。
   - 通过在事件总线上注册事件监听器和触发器，组件可以相互通信，传递数据和触发特定操作。

4. **Vuex**:
   - 使用 Vuex 进行状态管理，可以在祖孙组件之间共享和更新数据。
   - Vuex 是 Vue 的官方状态管理库，提供了集中式存储管理和响应式更新，使得不同组件之间的通信更加简单和可预测。

这些通信方式各有特点，可以根据具体情况选择合适的方式来实现祖孙组件之间的通信。对于简单的父子组件通信，Props / $emit 是常用的方式；而对于更复杂的应用程序状态管理和跨层级通信，使用 Vuex 或 Event Bus 可能更适合。

</details>

## 58. 如何打破 scope 对样式隔离的限制？ {#question-68243618-bcf1-4cfa-a5c1-544dee6ac436}

> 难度：2 · 类型：QA

### 题目要点

以下是一些打破作用域限制的方法：

1. **使用 `/deep/` 或 `::v-deep`**：
   在样式中使用 `/deep/` 或 `::v-deep` 选择器可以覆盖作用域限制，使得样式选择器的范围扩大到所有子组件，甚至是整个应用程序的 DOM 树。

2. **使用全局样式**：在 Vue 单文件组件中，可以在 `&lt;style&gt;` 标签外部或使用 `@import` 引入全局样式文件，这样样式将不受作用域限制。
3. **使用类名继承**： 在子组件的 `&lt;style&gt;` 标签中使用 `@extend` 来继承父组件或其他组件的样式，

<details>
<summary>参考答案</summary>

在 Vue 中，作用域样式（Scoped Styles）的目的是将样式限制在单个组件的作用域中，以确保样式不会被其他组件影响。然而，有时候你可能需要打破作用域限制，让样式能够在组件外部生效。以下是几种打破作用域限制的方式：

1. **使用 /deep/ 或 ::v-deep**：
   - 在样式中使用 `/deep/` 或 `::v-deep`（Vue 2.x 中的别名）选择器可以覆盖作用域限制。
   - 这样可以使得样式选择器的范围扩大到所有子组件，甚至是整个应用程序的 DOM 树。
   - 例如，使用 `.container /deep/ .child` 可以选择 `.child` 类名的元素，即使 `.child` 是在另一个组件中定义的。

2. **使用全局样式**：
   - 如果你希望一些样式在多个组件之间共享，并且不受作用域限制，可以使用全局样式。
   - 在 Vue 单文件组件中，可以在 `&lt;style&gt;` 标签外部或使用 `@import` 引入全局样式文件，这样样式将不受作用域限制。

3. **使用类名继承**：
   - 如果你希望某些样式继承自父组件或特定组件的样式，可以使用类名继承。
   - 在子组件的 `&lt;style&gt;` 标签中使用 `@extend` 来继承父组件或其他组件的样式，这样可以打破作用域限制。

需要注意的是，打破作用域限制可能会导致样式冲突和不可预测的结果。建议尽量遵循作用域限制，仅在必要时才使用上述方法来打破限制。同时，合理地组织组件结构和样式层级，可以更好地管理样式和避免冲突。

</details>

## 59. Scoped Styles 为什么可以实现样式隔离？ {#question-bcfc6fa0-1f1c-4aa4-b412-fd305db93c58}

> 难度：2 · 类型：QA

### 题目要点

在 Vue 中，作用域样式（Scoped Styles）通过以下原理实现：

1. **唯一选择器**：当 Vue 编译单文件组件时，在样式中使用 `scoped` 特性或 `module` 特性时，Vue 会为每个样式选择器生成一个唯一的属性选择器。这通常是一个类似 `[data-v-xxxxxxx]` 的属性选择器，其中 `xxxxxxx` 是一个唯一的标识符。
2. **编译时转换**：Vue 在编译过程中会解析单文件组件的模板，并对样式进行处理。对于具有 `scoped` 特性的样式，Vue 会将选择器转换为带有唯一属性选择器的形式，例如 `.class` 会被转换为 `.class[data-v-xxxxxxx]`。对于具有 `module` 特性的样式，Vue 会为每个选择器生成一个唯一的类名，并将类名与元素关联起来。
3. **渲染时应用**：在组件渲染过程中，Vue 会为组件的根元素添加一个属性值为唯一标识符的属性，例如 `data-v-xxxxxxx`。当组件渲染完成后，样式选择器中的唯一属性选择器或唯一类名将与组件根元素的属性匹配，从而实现样式的隔离。这样，只有具有相同属性值的元素才会应用相应的样式，避免了样式冲突和泄漏。

<details>
<summary>参考答案</summary>

在 Vue 中，作用域样式（Scoped Styles）是通过以下原理实现的：

1. **唯一选择器**：
   - 当 Vue 编译单文件组件时，在样式中使用 `scoped` 特性或 `module` 特性时，Vue 会为每个样式选择器生成一个唯一的属性选择器。
   - 这里的唯一选择器是类似于 `[data-v-xxxxxxx]` 的属性选择器，其中 `xxxxxxx` 是一个唯一的标识符。

2. **编译时转换**：
   - Vue 在编译过程中会解析单文件组件的模板，并对样式进行处理。
   - 对于具有 `scoped` 特性的样式，Vue 会将选择器转换为带有唯一属性选择器的形式，例如 `.class` 会被转换为 `.class[data-v-xxxxxxx]`。
   - 对于具有 `module` 特性的样式，Vue 会为每个选择器生成一个唯一的类名，并将类名与元素关联起来。

3. **渲染时应用**：
   - 在组件渲染过程中，Vue 会为组件的根元素添加一个属性值为唯一标识符的属性，例如 `data-v-xxxxxxx`。
   - 当组件渲染完成后，样式选择器中的唯一属性选择器或唯一类名将与组件根元素的属性匹配，从而实现样式的隔离。
   - 这样，只有具有相同属性值的元素才会应用相应的样式，避免了样式冲突和泄漏。

通过以上原理，Vue 实现了作用域样式的隔离。每个组件的样式都被限制在自己的作用域内，不会影响其他组件或全局样式。这种方式实现了组件级别的样式隔离，使得组件可以更好地封装和重用，同时减少了样式冲突的可能性。

</details>

## 60. vue 中怎么实现样式隔离？ {#question-d23c0c59-8096-4636-8c77-e74279986a18}

> 难度：2 · 类型：QA

### 题目要点

Vue 提供了几种方式来实现样式的隔离：

1. **作用域样式（Scoped Styles）**：
   - 在 Vue 单文件组件中，使用 `scoped` 特性将样式限定于当前组件的作用域。
   - `&lt;style scoped&gt;` 中的样式只对当前组件内的元素有效，不会影响到其他组件或全局样式。
   - Vue 通过添加唯一属性选择器来实现作用域样式的隔离。
2. **CSS Modules**：
   - Vue 支持使用 CSS Modules 来实现样式的模块化和隔离。
   - 通过 `module` 特性启用 CSS Modules，使用局部类名来定义样式。
   - CSS Modules 自动生成唯一的类名，并编译时与元素关联，实现样式的局部作用域。
3. **CSS-in-JS 方案**：
   - Vue 结合 CSS-in-JS 库（如 `styled-components`、`emotion` 等）来实现样式的隔离。
   - 在组件中直接编写样式，并通过 JavaScript 对象或模板字符串动态生成样式。
   - CSS-in-JS 方案将样式与组件紧密关联，实现样式的高效隔离和重用。

<details>
<summary>参考答案</summary>

Vue 提供了几种方式来实现样式的隔离：

1. **作用域样式（Scoped Styles）**：
   - 在 Vue 单文件组件中，可以使用 `scoped` 特性将样式限定于当前组件的作用域。
   - 使用`&lt;style scoped&gt;`标签包裹的样式只对当前组件起作用，不会影响其他组件或全局样式。
   - Vue 实现作用域样式的方式是通过给每个选择器添加一个唯一的属性选择器，以确保样式仅适用于当前组件。

2. **CSS Modules**：
   - Vue 支持使用 CSS Modules 来实现样式的模块化和隔离。
   - 在 Vue 单文件组件中，可以借助 `module` 特性启用 CSS Modules 功能，在样式文件中使用类似 `:local(.className)` 的语法来定义局部样式。
   - CSS Modules 会自动生成唯一的类名，并在编译时将类名与元素关联起来，从而实现样式的隔离和局部作用域。

3. **CSS-in-JS 方案**：
   - Vue 也可以结合 CSS-in-JS 库（如 `styled-components`、`emotion` 等）来实现样式的隔离。
   - 使用这种方式，可以直接在组件代码中编写样式，并通过 JavaScript 对象或模板字符串的形式动态生成样式。
   - CSS-in-JS 方案将样式与组件紧密关联，实现了更高程度的样式隔离和可重用性。

这些方法各有特点，可以根据实际需求选择合适的方式来实现样式的隔离。作用域样式和 CSS Modules 是 Vue 官方提供的内置功能，而 CSS-in-JS 则是通过第三方库来实现。根据项目的规模和需求，选择适合的方式可以更好地管理和维护样式。

</details>

## 61. created 和 mounted 有什么区别？ {#question-b11685c7-d458-4225-a5b1-40a34631a8d1}

> 难度：1 · 类型：QA

### 题目要点

在Vue中，`created`和`mounted`是两个常用的生命周期钩子函数，它们在组件的生命周期中扮演着不同的角色：

**created**：

- `created`钩子在组件实例创建后立即被调用。
- 此时，Vue实例已经完成了数据观测，但还未渲染真实DOM。
- 适合用于数据请求、事件监听等非DOM操作。

**mounted**：

- `mounted`钩子在组件实例挂载到DOM后调用。
- 此时，Vue实例已经将模板编译成真实DOM并渲染到页面。
- 适合用于对DOM进行操作，如初始化第三方库、绑定事件监听等。

区别总结：

- `created`适合非DOM相关的初始化操作。
- `mounted`适合对DOM进行操作和初始化第三方库。

<details>
<summary>参考答案</summary>

在Vue中，`created`和`mounted`是两个常用的生命周期钩子函数，它们在组件的生命周期中扮演着不同的角色：

**created**：
- `created`是组件生命周期中的一个钩子函数，在Vue实例被创建后立即调用。
- 在`created`钩子函数中，Vue实例已经完成了数据观测（data observation），但尚未渲染真实DOM。这意味着你可以访问实例中的数据、方法、计算属性等，但不能保证实例已经被插入到DOM中。
- `created`常用于一些初始化操作，例如数据请求、事件监听或其他非DOM相关的任务。因为此时，组件的模板还未被编译成真实DOM。

**mounted**：
- `mounted`是组件生命周期中的一个钩子函数，在Vue实例挂载到DOM后调用。
- 在`mounted`钩子函数中，Vue实例已经完成了模板编译，并且已经将生成的虚拟DOM渲染到真实DOM中。
- `mounted`常用于需要对DOM进行操作的任务，例如初始化第三方库、绑定事件监听器、执行动画等。因为此时，组件已经被插入到DOM中，可以安全地访问和操作DOM元素。

区别总结：
- `created`在实例创建后被调用，适合处理数据初始化和非DOM相关的任务。
- `mounted`在实例挂载到DOM后被调用，适合进行DOM操作、初始化第三方库和绑定事件监听。

</details>

## 62. Vue是怎么把template模版编译成render函数的？ {#question-926774f3-32a9-453c-84e4-0c873323b3ee}

> 难度：3 · 类型：QA

### 题目要点

Vue的编译过程将模板转换为渲染函数，这是Vue在运行时动态编译和渲染组件的关键步骤。Vue的编译过程大致如下：

1. **解析模板**：Vue解析模板字符串，将其转化为抽象语法树（AST）。AST是一个表示模板结构和内容的树状数据结构。
2. **优化AST**：Vue对AST进行优化处理，标记静态节点、静态属性和静态文本等，以提升渲染性能。
3. **生成渲染函数**：利用优化后的AST，Vue生成渲染函数，这是一个JavaScript函数，接收一个上下文对象作为参数，并返回一个虚拟DOM树（VNode）。
4. **渲染虚拟DOM**：执行渲染函数生成新的虚拟DOM树。Vue通过比较新旧VNode来计算最小的更新操作并应用在真实DOM上，进行局部更新。
5. **生成DOM**：根据最新的VNode生成真实的DOM元素，并插入到页面中，完成渲染。

<details>
<summary>参考答案</summary>

Vue的编译过程将模板转换为渲染函数，这是Vue在运行时动态编译和渲染组件的关键步骤。下面是Vue将模板编译成渲染函数的大致过程：

1. **解析模板**：首先，Vue会解析模板字符串，将其转化为抽象语法树（AST）。AST是一个表示模板结构和内容的树状数据结构。

2. **优化AST**：接下来，Vue会对AST进行优化处理，以提升渲染性能。这包括标记静态节点、静态属性和静态文本等。

3. **生成渲染函数**：利用优化后的AST，Vue会生成渲染函数。渲染函数是一个JavaScript函数，它接收一个上下文对象作为参数，并返回一个虚拟DOM树（VNode）。

4. **渲染虚拟DOM**：当执行渲染函数时，它将生成一个新的虚拟DOM树。如果之前已经存在真实的DOM树，Vue将通过比较新旧VNode来计算最小的更新操作并应用在真实DOM上，从而进行局部更新，提高效率。

5. **生成DOM**：最后，Vue将根据最新的VNode生成真实的DOM元素，并将其插入到页面中，完成渲染。

Vue的编译过程通常在构建时（比如使用Vue CLI）或运行时的初始阶段完成，以便在实际渲染组件时获得更好的性能。这样一来，渲染函数会被缓存并重复使用，而不需要每次重新编译模板。

Vue还可以使用`render`函数直接编写组件而不依赖于模板。这种情况下，手动编写的`render`函数会跳过模板解析和优化的步骤，直接生成渲染函数并进行渲染。这种方式可以在需要更高级别的动态和灵活性时使用。

</details>

## 63. v-model 的原理是什么样的？ {#question-e7f68d8b-d130-415e-8f9d-a47deeb462f9}

> 难度：3 · 类型：QA

### 题目要点

`v-model`的工作原理包括以下几个步骤：

1. **在模板中使用**：
   - 可以将`v-model`指令用于绑定变量到表单元素上，如`<input v-model="message">`。
2. **事件绑定**：
   - Vue解析模板时，将`v-model`指令转换为适当的属性和事件绑定。
   - 对于大多数表单元素，它将`value`属性与输入框的当前值绑定，并监听`input`事件来实时更新绑定的数据。
3. **数据同步**：
   - 当用户在输入框中键入或选择内容时，`input`事件被触发。
   - Vue捕获该事件并更新绑定的数据，根据数据的变化重新渲染视图。
4. **懒加载和`change`事件**：
   - 如果使用`v-model`的`lazy`修饰符，Vue将监听`change`事件而不是`input`事件。
   - 只有当用户完成输入并触发`change`事件时，才会更新绑定的数据。

<details>
<summary>参考答案</summary>

`v-model`是Vue.js框架中的一个指令，用于在表单元素和组件之间实现双向数据绑定。它提供了一种简洁的方式来将表单输入的值与Vue实例的属性进行关联。

当使用`v-model`指令时，Vue会根据表单元素的类型（如`input`、`select`、`textarea`等）自动为其添加相应的事件监听器，并在用户输入时更新绑定的数据。

具体地讲，`v-model`的原理如下：

1. 在模板中，我们可以使用`v-model`指令来绑定一个变量到表单元素（或组件）上，例如：`<input v-model="message">`。

2. Vue解析模板时，会将`v-model`指令转换成合适的属性和事件绑定。对于大多数表单元素，它会将`value`属性与输入框的当前值进行绑定，并监听`input`事件来实时更新绑定的数据。

3. 当用户在输入框中键入或选择内容时，触发`input`事件。Vue会捕获该事件并更新绑定的数据，以及根据数据的变化重新渲染视图。

4. 同样地，如果在表单元素上使用`v-model`的`lazy`修饰符，Vue会监听`change`事件而不是`input`事件。这样，只有当用户完成输入并触发`change`事件时，才会更新绑定的数据。

`v-model`指令实现双向绑定的原理是通过监听表单元素的输入事件（如`input`或`change`），将用户的输入同步到Vue实例中的属性，并在属性值变化时重新渲染视图。这使得我们可以轻松地将表单数据与Vue实例的状态保持同步，消除了手动监听和更新的冗余代码。

</details>

## 64. 说说 Vuex 的原理 {#question-06ed39d5-65ff-4276-a2f3-b7dc9cebf52e}

> 难度：3 · 类型：QA

### 题目要点

Vuex是Vue.js应用程序开发的状态管理模式和库，用于集中式管理应用程序的状态。通过以下核心概念工作：

1. **State（状态）**：应用程序的数据存储在一个单一的状态树中，即`state`。状态树是响应式的，状态变化时相关组件自动更新。
2. **Getter（获取器）**：从`state`派生出衍生状态，类似于计算属性，可以处理和计算状态并暴露给组件使用。
3. **Mutation（突变）**：修改`state`的唯一途径，定义了一些操作函数，每个函数有一个特定的名称（称为`type`），可以在这些函数中改变`state`的值。
4. **Action（动作）**：用于处理异步操作和复杂业务逻辑。类似于`mutation`，但可以包含异步操作，可以触发多个`mutation`，也可以调用其他`action`。
5. **Module（模块）**：为了更好地组织和拆分大型应用程序，Vuex允许将`state`、`getter`、`mutation`和`action`划分为模块。每个模块有自己的`state`、`getter`、`mutation`和`action`，可以嵌套和组合。

<details>
<summary>参考答案</summary>

Vuex是Vue.js应用程序开发的状态管理模式和库。它为Vue应用程序提供了一个集中式的存储机制，用于管理应用程序的所有组件的状态。Vuex的设计受到了Flux和Redux的影响，它通过以下几个核心概念来工作：

1. **State（状态）**：应用程序的数据存储在一个单一的状态树中，即`state`。这个状态树是响应式的，当状态发生变化时，相关的组件将自动更新。

2. **Getter（获取器）**：`getter`允许从`state`中派生出一些衍生的状态，类似于计算属性。可以使用`getter`来对`state`进行处理和计算，并将其暴露给组件使用。

3. **Mutation（突变）**：`mutation`是用于修改`state`的唯一途径。它定义了一些操作函数，每个函数都有一个特定的名称（称为`type`），并且可以在这些函数中改变`state`的值。`mutation`必须是同步的，以确保状态变更是可追踪的。

4. **Action（动作）**：`action`用于处理异步操作和复杂的业务逻辑。类似于`mutation`，但`action`可以包含异步操作，可以在`action`中触发多个`mutation`，也可以在`action`中调用其他`action`。

5. **Module（模块）**：为了更好地组织和拆分大型的应用程序，Vuex允许将`state`、`getter`、`mutation`和`action`划分为模块。每个模块都有自己的`state`、`getter`、`mutation`和`action`，并且可以被嵌套和组合。

通过以上的核心概念，Vuex提供了一种可预测的状态管理方式，使得多个组件之间共享和同步状态变得更加容易和可控。它简化了应用程序的状态管理，提高了代码的可维护性和复用性。

</details>

## 65. vue 的响应式开发比命令式有哪些优势？ {#question-c578d161-5468-4577-90c2-98e46cb82604}

> 难度：2 · 类型：QA

### 题目要点

Vue 的响应式开发相较于命令式开发有以下优势：

1. **简化代码**：Vue 通过数据绑定自动更新视图，减少了手动操作 DOM 的需求，简化了开发流程。
2. **提高可维护性**：响应式系统使得状态管理更加集中和可控，提高了代码的可读性和可维护性，方便进行测试。
3. **增强用户体验**：Vue 的局部更新和异步加载功能提升了性能和用户体验，如列表的局部更新和图片的懒加载。
4. **支持复杂组件设计**：Vue 的组件化设计使得大型应用可以被拆分为小型、可重用的组件，支持更复杂的 UI 设计。

<details>
<summary>参考答案</summary>

Vue 的响应式开发相较于命令式开发有以下优势：

1. 简化代码：在 Vue 中，通过将数据和模板绑定起来实现视图更新的自动化，从而避免了手动操作 DOM 的繁琐和容易出错的操作。因此，可以大幅减少编写样板代码和调试代码所需的时间。

2. 提高可维护性：使用 Vue 的响应式开发可以帮助我们更方便地管理应用程序的状态，并对状态变化进行统一处理。这不仅可以提高代码的可读性和可维护性，还可以更方便地进行单元测试和集成测试。

3. 增强用户体验：通过 Vue 的响应式开发，可以实现局部更新、异步加载等功能，从而提升用户体验。例如，在列表中添加或删除项目时，只需要更新相应的项目，而不是重新渲染整个列表。又比如，在加载大量图片时，可以通过异步加载和懒加载的方式，提高页面加载速度和用户体验。

4. 支持复杂组件设计：Vue 的响应式开发支持组件化设计，它能够轻松地将一个大型应用程序拆分成多个小型、可重用的组件。这些组件可以根据需要进行嵌套和组合，形成更为复杂和丰富的 UI 界面，而且每个组件都具有独立的状态和生命周期。

总之，Vue 的响应式开发可以帮助我们更高效、更方便、更灵活地进行前端开发，从而提供更好的用户体验和更高的代码质量。

</details>

## 66. React 和 Vue 在技术层面有哪些区别？ {#question-a97eb340-1a7f-4456-aff3-a187d9570421}

> 难度：3 · 类型：QA

### 题目要点

React 和 Vue 是当前流行的前端框架，它们在技术层面有以下区别：

- **组件化方式**：React 采用组件化，组件封装了状态和行为，共享状态树。Vue 组件也有自己的状态，数据和行为绑定更简单。
- **数据驱动**：React 使用单向数据流，从父组件到子组件，数据交互更复杂。Vue 采用双向数据绑定，数据交互更简洁。
- **模板语法**：React 使用 JSX，结合 HTML 和 JavaScript，编写组件更直观。Vue 使用模板语法，支持表达式和指令，可读性和维护性更高。
- **生命周期**：React 生命周期分为初始化、更新、卸载三个阶段。Vue 生命周期包括创建、挂载、更新、销毁等八个阶段。
- **状态管理**：React 通常使用 Redux 或 MobX 管理状态。Vue 则使用 Vuex 管理共享状态。
- **性能优化**：React 使用虚拟 DOM 优化渲染性能。Vue 使用模板编译和响应式系统，并提供懒加载和缓存等技术。

<details>
<summary>参考答案</summary>

React 和 Vue 是当前比较流行的前端框架，它们在技术层面有以下区别：

- 组件化方式不同：React 是基于组件实现的，组件包含了状态和行为，所有组件共享一个状态树。Vue 也是基于组件实现的，但是每个组件都有自己的状态，并且可以很容易地将数据和行为绑定在一起。

- 数据驱动方式不同：React 使用单向数据流来管理数据，即从父组件到子组件的传递，所以 React 中组件之间的数据交互相对更加复杂。Vue 则使用双向数据绑定来管理数据，使得组件之间的数据交互更加简洁。

- 模板语法不同：React 使用 JSX 语法，将 HTML 和 JavaScript 结合在一起，使得编写组件更加直观和灵活。Vue 则使用模板语法，并且支持模板内的表达式和指令，使得编写组件具有更高的可读性和可维护性。

- 生命周期不同：React 组件的生命周期分为三个阶段：初始化、更新和卸载。Vue 组件的生命周期分为八个阶段：创建、挂载、更新、销毁等。

- 状态管理方式不同：React 使用 Redux 或者 MobX 来管理应用程序的状态。Vue 则提供了自己的状态管理库 Vuex，可以更方便地管理组件之间的共享状态。

- 性能优化方式不同：React 使用虚拟 DOM 技术来实现高效的渲染性能，可以减少每次渲染时需要操作真实 DOM 的次数。Vue 则使用模板编译和响应式系统来实现高效的渲染性能，并且还提供了一些优化技术，例如懒加载和缓存等。

开发人员可以根据项目需求和个人喜好选择合适的框架。

</details>

## 67. 单页应用如何提高加载速度？ {#question-6b8fcb09-74e7-4ced-97a0-ba7b12575684}

> 难度：2 · 类型：QA

### 题目要点

提高单页应用（SPA）加载速度可以通过以下几种方法实现：

1. **代码分割**：
   - **动态导入**：使用动态导入（`import()`）将应用代码拆分成多个文件，按需加载。这样可以减少初始加载时的 JavaScript 文件大小。
   - **路由懒加载**：对不同的路由组件进行懒加载，只有在用户访问特定路由时才加载相关组件。

2. **优化资源**：
   - **压缩和混淆**：使用工具（如 Webpack、Terser）压缩和混淆 JavaScript 和 CSS 文件，减少文件大小。
   - **图像优化**：对图像进行压缩和优化，使用适当的格式和尺寸，并考虑使用响应式图像或懒加载技术。

3. **缓存策略**：
   - **浏览器缓存**：使用缓存策略（如 HTTP 缓存头）来缓存静态资源，减少重复加载。
   - **Service Worker**：使用 Service Worker 实现离线缓存和更复杂的缓存策略。

4. **使用 CDN**：
   - **内容分发网络**：将静态资源（如 JavaScript、CSS、图像）托管在 CDN 上，利用 CDN 的全球分发能力，提高资源加载速度。

5. **减少 HTTP 请求**：
   - **合并文件**：合并多个 CSS 和 JavaScript 文件，减少 HTTP 请求次数。
   - **使用内联资源**：对于小的 CSS 和 JavaScript 资源，可以考虑内联到 HTML 文件中。

6. **懒加载和预加载**：
   - **懒加载**：懒加载资源（如图片和组件），仅在需要时加载，减少初始加载的负担。
   - **预加载**：预加载关键资源，如在用户可能访问的页面上预加载必要的 JavaScript 和 CSS 文件。

7. **性能优化**：
   - **代码优化**：避免不必要的重新渲染和计算，优化渲染性能。
   - **异步操作**：尽量将耗时的操作（如数据获取）放在异步任务中，避免阻塞主线程。

8. **分析和监控**：
   - **性能分析**：使用工具（如 Lighthouse、WebPageTest）分析应用性能，识别瓶颈并进行优化。
   - **实时监控**：监控应用性能指标，及时发现和解决性能问题。

通过以上方法，可以显著提高单页应用的加载速度和整体性能。

<details>
<summary>参考答案</summary>

为了提高网页性能，可以采取以下优化措施：

1. **代码分割**：将代码拆分为小块，按需加载，减少加载时间。
2. **缓存资源**：利用浏览器缓存重复使用的文件，如CSS、JS、图片等。
3. **预加载关键资源**：提前加载首页所需的关键资源，如JS、CSS或数据。
4. **图片格式优化**：选择合适的图片格式，压缩文件大小，使用字体文件代替小图标。
5. **Gzip压缩**：使用Gzip压缩减少文件大小，提高传输效率。
6. **CDN使用**：通过CDN缓存和传递文件，加快下载速度和提高可靠性。
7. **API请求优化**：减少API调用次数，使用缓存和延迟加载技术优化API效率。
8. **服务器端渲染**：使用SSR生成HTML，减少客户端渲染时间，但可能增加服务器负担。

</details>

## 68. 说说 Vue 中 CSS scoped 的原理 {#question-3e12b5bf-53ed-4b71-a199-49d7935f87b4}

> 难度：3.5 · 类型：QA

### 题目要点

在 Vue.js 中，使用 `scoped` 属性可以为组件的样式创建一个局部作用域。这意味着组件的样式只会应用于该组件内部，而不会泄漏到其他组件。

#### 原理解析

1. **模块化**：
   - Vue 组件设计为自包含的模块，包括模板、JavaScript 和 CSS。

2. **深度选择器**：
   - 当 CSS 被标记为 `scoped` 时，Vue 会使用 CSS 选择器的深度（例如 `>>>` 或 `/deep/`）来确保样式只影响当前组件。

3. **编译时处理**：
   - 在构建过程中，Vue 会对 `scoped` 的 CSS 进行编译，将所有选择器替换为具有更高特异性的选择器。

4. **动态作用域**：
   - 在运行时，Vue 通过动态生成唯一的属性（如 `data-v-xxx`）来标识组件的元素，确保样式的作用域。

5. **避免全局污染**：
   - 通过 `scoped`，可以避免样式全局污染，提高组件的可重用性和可维护性。

#### 考察重点

- 理解：Vue 中 scoped 的作用和工作原理。
- 应用：在组件开发中使用 scoped 来实现样式隔离。

<details>
<summary>参考答案</summary>

## 前言

在日常的Vue项目开发过程中，为了让项目更好的维护一般都会使用模块化开发的方式进行。也就是每个组件维护独立的`template`，`script`，`style`。今天主要介绍一下使用`&lt;style scoped&gt;`为什么在页面渲染完后样式之间并不会造成污染。

## 示例

搭建一个简单的Vue项目测试一下：

![](https://static.ecool.fun//article/a05b22d7-2657-486f-a20c-896b7f1b54b2.jpeg)

给个目录结构吧，代码并不是我们讲解的重点，如果需要源码测试的话后续我放到github上去。<br>
终端执行`npx webpack`输出dist目录，我们在浏览器打开index.html调试一下看看现象：

![](https://static.ecool.fun//article/5150ea02-e887-4120-9e29-8a57fe9c0223.jpeg)

1. 每个组件都会拥有一个`[data-v-hash:8]`插入HTML标签，子组件标签上也具体父组件`[data-v-hash:8]`;
2. 如果style标签加了`scoped属性`，里面的选择器都会变成`(Attribute Selector) [data-v-hash:8]`;
3. 如果子组件选择器跟父组件选择器完全一样，那么就会出现子组件样式被父组件覆盖，因为`子组件会优先于父组件mounted`，有兴趣可以测试一下哦。

## webpack.config.js配置

我们先看看在`webpack.config.js`中的配置：

![](https://static.ecool.fun//article/7d7879fb-5772-4ede-b015-8bc9ccc832ee.jpeg)

## vue-loader工作流

以下就是vue-loader工作大致的处理流程：

![](https://static.ecool.fun//article/1148995d-c04f-49bf-a353-f7090a0554ca.jpeg)

开启`node调试模式`进行查看阅读，package.json中配置如下：

```
"scripts": {
    "debug": "node --inspect-brk ./node_modules/webpack/bin/webpack.js"
 },

```

## VueLoaderPlugin

先从入口文件`lib/index.js`开始分析，因为我的Webpack是4.x版本，所以`VueLoaderPlugin = require('./plugin-webpack4')`，重点来看看这个`lib/plugin-webpack4.js`文件:

```
const qs = require('querystring')
const RuleSet = require('webpack/lib/RuleSet')

const id = 'vue-loader-plugin'
const NS = 'vue-loader'
// 很明显这就是一个webpack插件写法
class VueLoaderPlugin {
  apply (compiler) {
    if (compiler.hooks) {
      // 编译创建之后，执行插件
      compiler.hooks.compilation.tap(id, compilation => {
        const normalModuleLoader = compilation.hooks.normalModuleLoader
        normalModuleLoader.tap(id, loaderContext => {
          loaderContext[NS] = true
        })
      })
    } else {
      // webpack < 4
      compiler.plugin('compilation', compilation => {
        compilation.plugin('normal-module-loader', loaderContext => {
          loaderContext[NS] = true
        })
      })
    }

    // webpack.config.js 中配置好的 module.rules
    const rawRules = compiler.options.module.rules
    // 对 rawRules 做 normlized
    const { rules } = new RuleSet(rawRules)

    // 从 rawRules 中检查是否有规则去匹配 .vue 或 .vue.html
    let vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue`))
    if (vueRuleIndex < 0) {
      vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue.html`))
    }
    const vueRule = rules[vueRuleIndex]
    if (!vueRule) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching rule for .vue files found.\n` +
        `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }
    if (vueRule.oneOf) {
      throw new Error(
        `[VueLoaderPlugin Error] vue-loader 15 currently does not support vue rules with oneOf.`
      )
    }

    // 检查 normlized rawRules 中 .vue 规则中是否具有 vue-loader
    const vueUse = vueRule.use
    const vueLoaderUseIndex = vueUse.findIndex(u => {
      return /^vue-loader|(\/|\\|@)vue-loader/.test(u.loader)
    })

    if (vueLoaderUseIndex < 0) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching use for vue-loader is found.\n` +
        `Make sure the rule matching .vue files include vue-loader in its use.`
      )
    }

    // make sure vue-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??vue-loader-options
    const vueLoaderUse = vueUse[vueLoaderUseIndex]
    vueLoaderUse.ident = 'vue-loader-options'
    vueLoaderUse.options = vueLoaderUse.options || {}

    // 过滤出 .vue 规则，其他规则调用 cloneRule 方法重写了 resource 和 resourceQuery 配置
    // 用于编译vue文件后匹配依赖路径 query 中需要的loader
    const clonedRules = rules
      .filter(r => r !== vueRule)
      .map(cloneRule)

    // 加入全局 pitcher-loader，路径query有vue字段就给loader添加pitch方法
    const pitcher = {
      loader: require.resolve('./loaders/pitcher'),
      resourceQuery: query => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null
      },
      options: {
        cacheDirectory: vueLoaderUse.options.cacheDirectory,
        cacheIdentifier: vueLoaderUse.options.cacheIdentifier
      }
    }

    // 修改原始的 module.rules 配置
    compiler.options.module.rules = [
      pitcher,
      ...clonedRules,
      ...rules
    ]
  }
}

```

以上大概就是`VueLoaderPlugin`所做的事情。也就是说`VueLoaderPlugin`主要就是修改module.rules的配置。总的来说就是对vue单文件编写做的一个扩展(比如我们可以写less文件，在vue style中也可以写less)

## vue-loader

继续来看看`vue-loader`是如何操作.vue文件的，目前只关心`style`部分，逻辑在`lib/index.js`：

### vue文件解析

```
// 很明显这就是一个loader写法
module.exports = function (source) {
    const loaderContext = this
    // ...
    const {
        target,
        request, // 请求资源路径
        minimize,
        sourceMap,
        rootContext, // 根路径
        resourcePath, // vue文件的路径
        resourceQuery // vue文件的路径 query 参数
      } = loaderContext
    // ...

    // 解析 vue 文件，descriptor 是AST抽象语法树的描述
    const descriptor = parse({
        source,
        compiler: options.compiler || loadTemplateCompiler(loaderContext),
        filename,
        sourceRoot,
        needMap: sourceMap
    })
    /**
    *
    */
    // hash(文件路径 + 开发环境 ？文件内容 : "")生成 id
    const id = hash(
        isProduction
          ? (shortFilePath + '\n' + source)
          : shortFilePath
    )
    // descriptor.styles 解析后是否具有 attrs: {scoped: true}
    const hasScoped = descriptor.styles.some(s => s.scoped)
    /**
    *
    */
    let stylesCode = ``
    if (descriptor.styles.length) {
        // 最终生成一个import依赖请求
        stylesCode = genStylesCode(
            loaderContext,
            descriptor.styles,
            id,
            resourcePath,
            stringifyRequest,
            needsHotReload,
            isServer || isShadow // needs explicit injection?
        )
    }
}

```

可以看到解析完vue文件的结果大概就是这样的：

![](https://static.ecool.fun//article/27e47892-fad8-4f98-bfa2-899428688dbb.jpeg)

### 依赖解析

vue文件解析完之后template，script，style等都有个依赖的路径，后续可以通过配置的loader进行解析了，因为我们已经在`VuePluginLoader`中修改了module.rules的配置，而且依赖的路径中query中都拥有vue字段，所以会先走到pitcher-loader,现在来分析`lib/loaders/pitcher.js`中的逻辑：

```
/**
 *
*/
module.exports = code => code

module.exports.pitch = function (remainingRequest) {
    const options = loaderUtils.getOptions(this)
    const { cacheDirectory, cacheIdentifier } = options
    const query = qs.parse(this.resourceQuery.slice(1))

    let loaders = this.loaders
    if (query.type) {
        if (/\.vue$/.test(this.resourcePath)) {
            // 过滤eslint-loader
            loaders = loaders.filter(l => !isESLintLoader(l))
        } else {
            loaders = dedupeESLintLoader(loaders)
        }
    }
    // 过滤pitcher-loader
    loaders = loaders.filter(isPitcher)

    const genRequest = loaders => {
        const seen = new Map()
        const loaderStrings = []

        loaders.forEach(loader => {
          const identifier = typeof loader === 'string'
            ? loader
            : (loader.path + loader.query)
          const request = typeof loader === 'string' ? loader : loader.request
          if (!seen.has(identifier)) {
            seen.set(identifier, true)
            // loader.request contains both the resolved loader path and its options
            // query (e.g. ??ref-0)
            loaderStrings.push(request)
          }
        })

        return loaderUtils.stringifyRequest(this, '-!' + [
          ...loaderStrings,
          this.resourcePath + this.resourceQuery
        ].join('!'))
    }


    if (query.type === `style`) {
        const cssLoaderIndex = loaders.findIndex(isCSSLoader)
        // 调整loader执行顺序
        if (cssLoaderIndex > -1) {
            const afterLoaders = loaders.slice(0, cssLoaderIndex + 1)
            const beforeLoaders = loaders.slice(cssLoaderIndex + 1)
            const request = genRequest([
                ...afterLoaders, // [style-loader,css-loader]
                stylePostLoaderPath, // style-post-loader
                ...beforeLoaders // [vue-loader]
            ])
            return `import mod from ${request}; export default mod; export * from ${request}`
        }
   }
   /**
   *
   */
   const request = genRequest(loaders)
   return `import mod from ${request}; export default mod; export * from ${request}`
}

```

可以看到解析带scoped属性的style的结果大概就是这样的：

![](https://static.ecool.fun//article/67b0bf0e-cf0f-4d2b-bc90-89213de288e1.jpeg)

### 新的依赖解析

分析`{tyep：style}`的处理流程顺序：

* vue-loader、style-post-loader、css-loader、style-loader。

处理资源的时候先走的是`vue-loader`，这时vue-loader中的处理逻辑与第一次解析vue文件不一样了：

```
const incomingQuery = qs.parse(rawQuery)
// 拥有{type:style}
if (incomingQuery.type) {
    return selectBlock(
      descriptor,
      loaderContext,
      incomingQuery,
      !!options.appendExtension
    )
 }


 // lib/select.js
 module.exports = function selectBlock (
  descriptor,
  loaderContext,
  query,
  appendExtension
) {
   // ...
  if (query.type === `style` && query.index != null) {
    const style = descriptor.styles[query.index]
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (style.lang || 'css')
    }
    loaderContext.callback(
      null,
      style.content,
      style.map
    )
    return
  }

```

> **可以看到vue-loader处理完后返回的就是style.content，也就是style标签下的内容，然后交给后续的loader继续处理**

再来看一下`style-post-loader`是如何生成`data-v-hash:8`的,逻辑主要在`lib/loaders/stylePostLoaders.js`中：

```
const qs = require('querystring')
const { compileStyle } = require('@vue/component-compiler-utils')

module.exports = function (source, inMap) {
  const query = qs.parse(this.resourceQuery.slice(1))
  const { code, map, errors } = compileStyle({
    source,
    filename: this.resourcePath,
    id: `data-v-${query.id}`,
    map: inMap,
    scoped: !!query.scoped,
    trim: true
  })

  if (errors.length) {
    this.callback(errors[0])
  } else {
    this.callback(null, code, map)
  }
}

```

处理最终返回的code是这样的：

![](https://static.ecool.fun//article/021f3c9e-2b42-4398-98e0-cffafaf70ce4.jpeg)

</details>

## 69. Vue 模板是如何编译的 {#question-418ef81f-96c6-4c4e-b218-df29be84890d}

> 难度：3.5 · 类型：QA

### 题目要点

在Vue中，`render`函数的生成过程涉及模板编译，它将`.vue`文件中的模板转换为浏览器可识别的代码。这个过程主要包括三个步骤：

1. **模板解析**：使用正则等方法提取模板中的原生HTML和非原生HTML，如绑定的属性、事件、指令等，并解析成抽象语法树（AST）。
2. **优化**：遍历AST，找出其中的静态节点和静态根节点，并添加标记。
3. **代码生成**：根据AST生成渲染函数`render`。

此外，Vue还支持自定义`render`函数，这种方式可以跳过模板编译的过程，直接生成渲染函数。自定义`render`函数的优先级高于模板编译生成的`render`函数。

<details>
<summary>参考答案</summary>

```js
new Vue({
  render: h => h(App)
})
```

这个大家都熟悉，调用 render 就会得到传入的模板(`.vue`文件)对应的虚拟 DOM，那么这个 render 是哪来的呢？它是怎么把 `.vue` 文件转成浏览器可识别的代码的呢？

render 函数是怎么来的有两种方式

- 第一种就是经过模板编译生成 render 函数
- 第二种是我们自己在组件里定义了 render 函数，这种会跳过模板编译的过程

本文将为大家分别介绍这两种，以及详细的编译过程原理

## 认识模板编译

我们知道 `<template></template>` 这个是模板，不是真实的 HTML，浏览器是不认识模板的，所以我们需要把它编译成浏览器认识的原生的 HTML

这一块的主要流程就是

1. 提取出模板中的原生 HTML 和非原生 HTML，比如绑定的属性、事件、指令等等
2. 经过一些处理生成 render 函数
3. render 函数再将模板内容生成对应的 vnode
4. 再经过 patch 过程( Diff )得到要渲染到视图中的 vnode
5. 最后根据 vnode 创建真实的 DOM 节点，也就是原生 HTML 插入到视图中，完成渲染

上面的 1、2、3 条就是模板编译的过程了

那它是怎么编译，最终生成 render 函数的呢？

## 模板编译详解——源码

### baseCompile()

这就是模板编译的入口函数，它接收两个参数

- `template`：就是要转换的模板字符串
- `options`：就是转换时需要的参数

编译的流程，主要有三步：

1. 模板解析：通过正则等方式提取出 `<template></template>` 模板里的标签元素、属性、变量等信息，并解析成抽象语法树 `AST`
2. 优化：遍历 `AST` 找出其中的静态节点和静态根节点，并添加标记
3. 代码生成：根据 `AST` 生成渲染函数 `render`

这三步分别对应三个函数，后面会一一下介绍，先看一下 `baseCompile` 源码中是在哪里调用的

源码地址：`src/complier/index.js - 11行`

```js
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string, // 就是要转换的模板字符串
  options: CompilerOptions //就是转换时需要的参数
): CompiledResult {
  // 1. 进行模板解析，并将结果保存为 AST
  const ast = parse(template.trim(), options)

  // 没有禁用静态优化的话
  if (options.optimize !== false) {
    // 2. 就遍历 AST，并找出静态节点并标记
    optimize(ast, options)
  }
  // 3. 生成渲染函数
  const code = generate(ast, options)
  return {
    ast,
    render: code.render, // 返回渲染函数 render
    staticRenderFns: code.staticRenderFns
  }
})
```

就这么几行代码，三步，调用了三个方法很清晰

我们先看一下最后 return 出去的是个啥，再来深入上面这三步分别调用的方法源码，也好更清楚的知道这三步分别是要做哪些处理

### 编译结果

比如有这样的模板

```html
<template>
    <div id="app">{{name}}</div>
</template>
```

打印一下编译后的结果，也就是上面源码 return 出去的结果，看看是啥

```js
{
  ast: {
    type: 1,
    tag: 'div',
    attrsList: [ { name: 'id', value: 'app' } ],
    attrsMap: { id: 'app' },
    rawAttrsMap: {},
    parent: undefined,
    children: [
      {
        type: 2,
        expression: '_s(name)',
        tokens: [ { '@binding': 'name' } ],
        text: '{{name}}',
        static: false
      }
    ],
    plain: false,
    attrs: [ { name: 'id', value: '"app"', dynamic: undefined } ],
    static: false,
    staticRoot: false
  },
  render: `with(this){return _c('div',{attrs:{"id":"app"}},[_v(_s(name))])}`,
  staticRenderFns: [],
  errors: [],
  tips: []
}
```

看不明白也没有关系，注意看上面提到的三步都干了啥

- `ast` 字段，就是第一步生成的
- `static` 字段，就是标记，是在第二步中根据 `ast` 里的 `type` 加上去的
- `render` 字段，就是第三步生成的

有个大概的印象了，然后再来看源码

### 1. parse()

源码地址：`src/complier/parser/index.js - 79行`

就是这个方法就是解析器的主函数，就是它通过正则等方法提取出 `<template></template>` 模板字符串里所有的 `tag`、`props`、`children` 信息，生成一个对应结构的 ast 对象

`parse` 接收两个参数
- `template` ：就是要转换的模板字符串
- `options`：就是转换时需要的参数。它包含有四个钩子函数，就是用来把 `parseHTML` 解析出来的字符串提取出来，并生成对应的 `AST`

核心步骤是这样的：

调用 `parseHTML` 函数对模板字符串进行解析

- 解析到开始标签、结束标签、文本、注释分别进行不同的处理
- 解析过程中遇到文本信息就调用文本解析器 `parseText` 函数进行文本解析
- 解析过程中遇到包含过滤器，就调用过滤器解析器 `parseFilters` 函数进行解析

每一步解析的结果都合并到一个对象上(就是最后的 AST)

这个地方的源码实在是太长了，有大几百行代码，我就只贴个大概吧，有兴趣的自己去看一下

```js
export function parse (
  template: string, // 要转换的模板字符串
  options: CompilerOptions // 转换时需要的参数
): ASTElement | void {
  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    // 解析到开始标签时调用，如 <div>
    start (tag, attrs, unary, start, end) {
        // unary 是否是自闭合标签，如 <img />
        ...
    },
    // 解析到结束标签时调用，如 </div>
    end (tag, start, end) {
        ...
    },
    // 解析到文本时调用
    chars (text: string, start: number, end: number) {
      // 这里会判断判断很多东西，来看它是不是带变量的动态文本
      // 然后创建动态文本或静态文本对应的 AST 节点
      ...
    },
    // 解析到注释时调用
    comment (text: string, start, end) {
      // 注释是这么找的
      const comment = /^<!\--/
      if (comment.test(html)) {
      // 如果是注释，就继续找 '-->'
      const commentEnd = html.indexOf('-->')
      ...
    }
  })
  // 返回的这个就是 AST
  return root
}
```

上面解析文本时调用的 `chars()` 会根据不同类型节点加上不同 `type`，来标记 `AST` 节点类型，这个属性在下一步标记的时候会用到

| type | AST 节点类型 |
| --- | --- |
| 1 | 元素节点 |
| 2 | 包含变量的动态文本节点 |
| 3 | 没有变量的纯文本节点 |

### 2. optimize()

这个函数就是在 `AST` 里找出静态节点和静态根节点，并添加标记，为了后面 `patch` 过程中就会跳过静态节点的对比，直接克隆一份过去，从而优化了 `patch` 的性能

函数里面调用的外部函数就不贴代码了，大致过程是这样的

- **标记静态节点(markStatic)**。就是判断 type，上面介绍了值为 1、2、3的三种类型

    - type 值为1：就是包含子元素的节点，设置 static 为 false 并递归标记子节点，直到标记完所有子节点
    - type 值为 2：设置 static 为 false
    - type 值为 3：就是不包含子节点和动态属性的纯文本节点，把它的 static = true，patch 的时候就会跳过这个，直接克隆一份去

- **标记静态根节点(markStaticRoots)**，这里的原理和标记静态节点基本相同，只是需要满足下面条件的节点才能算作是静态根节点
    - 节点本身必须是静态节点
    - 必须有子节点
    - 子节点不能只有一个文本节点

源码地址：`src/complier/optimizer.js - 21行`

```js
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // 标记静态节点
  markStatic(root)
  // 标记静态根节点
  markStaticRoots(root, false)
}
```

### 3. generate()

这个就是生成 render 的函数，就是说最终会返回下面这样的东西

```js
// 比如有这么个模板
<template>
    <div id="app">{{name}}</div>
</template>

// 上面模板编译后返回的 render 字段 就是这样的
render: `with(this){return _c('div',{attrs:{"id":"app"}},[_v(_s(name))])}`

// 把内容格式化一下，容易理解一点
with(this){
  return _c(
    'div',
    { attrs:{"id":"app"} },
    [  _v(_s(name))  ]
  )
}
```

这个结构是不是有点熟悉？

了解虚拟 DOM 就可以看出来，上面的 render 正是虚拟 DOM 的结构，就是把一个标签分为 `tag`、`props`、`children`，没有错

在看 `generate` 源码之前，我们要先了解一下上面这最后返回的 `render` 字段是什么意思，再来看 `generate` 源码，就会轻松得多，不然连函数返回的东西是干嘛的都不知道怎么可能看得懂这个函数呢

#### render

我们来翻译一下上面编译出来的 `render`

这个 `with` 在 《**你不知道的JavaScript**》上卷里介绍的是，用来欺骗词法作用域的关键字，它可以让我们更快的引用一个对象上的多个属性

看个例子

```js
const name = '掘金'
const obj = { name:'沐华', age: 18 }
with(obj){
    console.log(name) // 沐华  不需要写 obj.name 了
    console.log(age) // 18   不需要写 obj.age 了
}
```

上面的 `with(this){}` 里的 `this` 就是当前组件实例。因为通过 `with` 改变了词法作用域中属性的指向，所以标签里使用 `name` 直接用就是了，而不需要 `this.name` 这样

那 `_c`、 `_v` 和 `_s` 是什么呢？

在源码里是这样定义的，格式是：**`_c`(缩写) = `createElement`(函数名)**

源码地址：`src/core/instance/render-helpers/index.js - 15行`

```js
// 其实不止这几个，由于本文例子中没有用到就没都复制过来占位了
export function installRenderHelpers (target: any) {
  target._s = toString // 转字符串函数
  target._l = renderList // 生成列表函数
  target._v = createTextVNode // 创建文本节点函数
  target._e = createEmptyVNode // 创建空节点函数
}
// 补充
_c = createElement // 创建虚拟节点函数
```

再来看是不是就清楚多了呢

```js
with(this){ // 欺骗词法作用域，将该作用域里所有属姓和方法都指向当前组件
  return _c( // 创建一个虚拟节点
    'div', // 标签为 div
    { attrs:{"id":"app"} }, // 有一个属性 id 为 'app'
    [  _v(_s(name))  ] // 是一个文本节点，所以把获取到的动态属性 name 转成字符串
  )
}
```

接下来我们再来看 `generate()` 源码

#### generate

源码地址：`src/complier/codegen/index.js - 43行`

这个流程很简单，只有几行代码，就是先判断 `AST` 是不是为空，不为空就根据 AST 创建 vnode，否则就创建一个空div 的 vnode

```js
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  // 就是先判断 AST 是不是为空，不为空就根据 AST 创建 vnode，否则就创建一个空div的 vnode
  const code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")'

  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}
```

可以看出这里面主要就是通过 `genElement()` 方法来创建 `vnode` 的，所以我们来看一下它的源码，看是怎么创建的

#### genElement()

源码地址：`src/complier/codegen/index.js - 56行`

这里的逻辑还是很清晰的，就是一堆 `if/else` 判断传进来的 AST 元素节点的属性来执行不同的生成函数

>这里还可以发现另一个知识点 v-for 的优先级要高于 v-if，因为先判断 for 的

```js
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) { // v-once
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) { // v-for
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) { // v-if
    return genIf(el, state)

    // template 节点 && 没有插槽 && 没有 pre 标签
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') { // v-slot
    return genSlot(el, state)
  } else {
    // component or element
    let code
    // 如果有子组件
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      let data
      // 获取元素属性 props
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData(el, state)
      }
      // 获取元素子节点
      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    // 返回上面作为 with 作用域执行的内容
    return code
  }
}
```

每一种类型调用的生成函数就不一一列举了，总的来说最后创建出来的 vnode 节点类型无非就三种，元素节点、文本节点、注释节点

## 自定义的 render

先举个例子吧，三种情况如下

```js
// 1. test.vue
<template>
    <h1>我是沐华</h1>
</template>
<script>
  export default {}
</script>
```
```js
// 2. test.vue
<script>
  export default {
    render(h){
      return h('h1',{},'我是沐华')
    }
  }
</script>
```
```js
// 3. test.js
export default {
  render(h){
    return h('h1',{},'我是沐华')
  }
}
```

**上面三种，最后渲染的出来的就是完全一模一样的**，因为这个 `h` 就是上面模板编译后的那个 `_c`

这时有人可能就会问，为什么要自己写呢，不是有模板编译自动生成吗？

这个问题问得好！自己写肯定是有好处的

1. 自己把 vnode 给写了，就会直接跳过了模板编译，不用去解析模板里的动态属性、事件、指令等等了，所以性能上会有那么一丢丢提升。这一点在下面的渲染的优先级上就有体现
2. 还有一些情况，能让我们代码写法的更加灵活，更加方便简洁，不会冗余

比如 `Element-UI` 里面的组件源码里就有大量直接写 render 函数

接下来分别看下这两点是如何体现的

### 1. 渲染优先级

先看一下在官网的生命周期里，关于模板编译的部分

![](https://static.ecool.fun//article/0a8b7327-b0fd-4042-b4bc-526c05ab9c89.jpeg)

如图可以知道，如果有 `template`，就不会管 `el` 了，所以 **template 比 el 的优先级更高**，比如

那我们自己写了 render 呢？

```js
<div id='app'>
    <p>{{ name }}</p>
</div>
<script>
    new Vue({
        el:'#app',
        data:{ name:'沐华' },
        template:'<div>掘金</div>',
        render(h){
            return h('div', {}, '好好学习，天天向上')
        }
    })
</script>
```

这个代码执行后页面渲染出来只有 `<div>好好学习，天天向上</div>`

可以得出 **render 函数的优先级更高**

因为不管是 `el` 挂载的，还是 `template` 最后都会被编译成 `render` 函数，而如果已经有了 `render` 函数了，就跳过前面的编译了

这一点在源码里也有体现

在源码中找到答案：`dist/vue.js - 11927行`

```js
  Vue.prototype.$mount = function ( el, hydrating ) {
    el = el && query(el);
    var options = this.$options;
    // 如果没有 render
    if (!options.render) {
      var template = options.template;
      // 再判断，如果有 template
      if (template) {
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') {
            template = idToTemplate(template);
          }
        } else if (template.nodeType) {
          template = template.innerHTML;
        } else {
          return this
        }
      // 再判断，如果有 el
      } else if (el) {
        template = getOuterHTML(el);
      }
    }
    return mount.call(this, el, hydrating)
  };
```

### 2. 更灵活的写法

比如说我们需要写很多 if 判断的时候

```js
<template>
    <h1 v-if="level === 1">
      <a href="xxx">
        <slot></slot>
      </a>
    </h1>
    <h2 v-else-if="level === 2">
      <a href="xxx">
        <slot></slot>
      </a>
    </h2>
    <h3 v-else-if="level === 3">
      <a href="xxx">
        <slot></slot>
      </a>
    </h3>
</template>
<script>
  export default {
    props:['level']
  }
</script>
```

不知道你有没有写过类似上面这样的代码呢？

我们换一种方式来写出和上面一模一样的代码看看，直接写 render

```js
<script>
  export default {
    props:['level'],
    render(h){
      return h('h' + this.level, this.$slots.default())
    }
  }
</script>
```

搞定！就这！就这？

没错，就这！

或者下面这样，多次调用的时候就很方便

```js
<script>
  export default {
    props:['level'],
    render(h){
      const tag = 'h' + this.level
      return (<tag>{this.$slots.default()}</tag>)
    }
  }
</script>
```

</details>

## 70. vue3中怎么设置全局变量？ {#question-3e2c519b-9142-40e9-bef6-6b1d975be351}

> 难度：1.5 · 类型：QA

### 题目要点

在 Vue 3 中，全局方法或属性的挂载和访问方式与 Vue 2 有所不同。以下是两种在 Vue 3 中实现全局访问的方法：

1. **使用 `config.globalProperties`**：
   - Vue 3 引入了一个新的配置选项 `app.config.globalProperties`，允许你在应用实例上定义全局属性或方法。

2. **使用 `provide` 和 `inject`**：
   - Vue 3 提供了 `provide` 和 `inject` 功能，可以穿透多层组件，实现数据从父组件传递到子组件。

   - 如果需要变量是响应式的，需要在 `provide` 的时候使用 `ref` 或 `reactive` 包装变量。

<details>
<summary>参考答案</summary>

## 方法一 config.globalProperties

`vue2.x`挂载全局是使用 `Vue.prototype.$xxxx=xxx` 的形式来挂载，然后通过 `this.$xxx`来获取挂载到全局的变量或者方法。

这在 `Vue 3` 中，就等同于 `config.globalProperties`。这些 `property` 将被复制到应用中作为实例化组件的一部分。

```js
// 之前 (Vue 2.x)
Vue.prototype.$http = () => {}

// 之后 (Vue 3.x)
const app = createApp({})
app.config.globalProperties.$http = () => {}
```

## 方法二 Provide / Inject

vue3新的 `provide/inject` 功能可以穿透多层组件，实现数据从父组件传递到子组件。

可以将全局变量放在根组件的 `provide` 中，这样所有的组件都能使用到这个变量。

如果需要变量是响应式的，就需要在 `provide` 的时候使用 `ref` 或者 `reactive` 包装变量。

</details>

## 71. 刷新浏览器后，Vuex的数据是否存在？如何解决？ {#question-7e9fd9a8-e8d8-44e6-8ffd-73faf1372a1b}

> 难度：2 · 类型：QA

### 题目要点

在 Vue 项目中使用 Vuex 进行全局状态管理时，如果页面刷新，保存在 Vuex 实例 `store` 里的数据会丢失，因为这些数据是保存在运行内存中的。为了解决这个问题，有几种方法可以考虑：

1. **使用 `vuex-along`**：
   - `vuex-along` 是一个插件，它可以将 Vuex 中的数据存放到 `localStorage` 或者 `sessionStorage` 中。
   - 在 `store/index.js` 文件中配置 `vuex-along`，指定存储的名称和是否使用 `localStorage` 或 `sessionStorage`。
   - 使用 `vuex-along` 后，你仍然可以使用 Vuex 的读取数据方式来操作，插件会自动处理数据的存储和恢复。

2. **使用 `localStorage` 或者 `sessionStorage`**：
   - 在 Vue 组件的 `created` 钩子中，读取 `sessionStorage` 中的状态信息，并将其合并到 Vuex 的状态中。
   - 在页面刷新前，将 Vuex 的状态保存到 `sessionStorage` 中。
   - 通过监听 `beforeunload` 事件，在页面即将卸载时保存状态，并在页面加载时读取状态。

<details>
<summary>参考答案</summary>

在vue项目中用vuex来做全局的状态管理， 发现当刷新网页后，保存在vuex实例store里的数据会丢失。

原因：因为 `store` 里的数据是保存在运行内存中的，当页面刷新时，页面会重新加载vue实例，store里面的数据就会被重新赋值初始化。

我们有两种方法解决该问题：

1. 使用 `vuex-along`
2. 使用 `localStorage` 或者 `sessionStroage`

## 使用vuex-along

`vuex-along` 的实质也是将 `vuex` 中的数据存放到 `localStorage` 或者 `sessionStroage` 中，只不过这个存取过程组件会帮我们完成，我们只需要用vuex的读取数据方式操作就可以了，简单介绍一下 `vuex-along` 的使用方法。

安装 `vuex-along`:

> npm install vuex-along --save

配置 `vuex-along`: 在 `store/index.js` 中最后添加以下代码:

```js
import VueXAlong from 'vuex-along' //导入插件
export default new Vuex.Store({
    //modules: {
        //controler  //模块化vuex
    //},
    plugins: [VueXAlong({
        name: 'store',     //存放在localStroage或者sessionStroage 中的名字
        local: false,      //是否存放在local中  false 不存放 如果存放按照下面session的配置
        session: { list: [], isFilter: true } //如果值不为false 那么可以传递对象 其中 当isFilter设置为true时， list 数组中的值就会被过滤调,这些值不会存放在seesion或者local中
    })]
});
```

## 使用 `localStorage` 或者 `sessionStroage`

```js
created() {
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionStorage.getItem("store")) {
      this.$store.replaceState(
        Object.assign(
          {},
          this.$store.state,
          JSON.parse(sessionStorage.getItem("store"))
        )
      );
    }
    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("store", JSON.stringify(this.$store.state));
    });
},
```

</details>

## 72. 说下Vite的原理 {#question-0d0de429-d6eb-4eda-a614-0a3a22c05237}

> 难度：3.5 · 类型：QA

### 题目要点

Vite 是一个基于 ESbuild 和 Rollup 的新一代前端构建工具，它旨在提供极致的开发体验。Vite 的工作原理包括依赖预构建、按需加载和文件系统缓存等，这些特性使得 Vite 在开发环境中能够快速启动和响应。Vite 的主要特点包括：

1. **快速启动**：Vite 利用浏览器原生的 ES Module 解析能力，直接提供开发环境源码，无需等待整个应用的构建。
2. **按需编译**：Vite 只在浏览器请求相关模块时进行编译，从而实现真正的按需加载。
3. **依赖预构建**：Vite 使用 esbuild 对项目依赖进行预构建，以提高编译速度。
4. **缓存优化**：Vite 利用 HTTP 缓存和文件系统缓存来优化性能。
5. **生产环境集成**：Vite 集成 Rollup 进行生产环境打包，提供成熟的插件机制。
6. **高度集成**：Vite 提供了开箱即用的配置，简化了开发流程。
7. **支持多种框架**：Vite 不仅支持 Vue，也支持 React 等其他框架。
8. **内置 SSR 支持**：Vite 内置了服务端渲染支持。
9. **TypeScript 支持**：Vite 原生支持 TypeScript。

Vite 与 Webpack 的主要区别在于 Vite 更注重开发环境的性能，而 Webpack 则提供了更丰富的配置和更灵活的构建流程。尽管 Vite 在生产环境中使用 Rollup 打包，但它的开发环境体验已经足够强大，适合大多数前端开发需求。

<details>
<summary>参考答案</summary>

# 背景
这里的背景介绍会从与`Vite`紧密相关的两个概念的发展史说起，一个是`JavaScript`的模块化标准，另一个是前端构建工具。

### 共存的模块化标准
为什么`JavaScript`会有多种共存的模块化标准？因为js在设计之初并没有模块化的概念，随着前端业务复杂度不断提高，模块化越来越受到开发者的重视，社区开始涌现多种模块化解决方案，它们相互借鉴，也争议不断，形成多个派系，从`CommonJS`开始，到`ES6`正式推出`ES Modules`规范结束，所有争论，终成历史，`ES Modules`也成为前端重要的基础设施。

- **CommonJS**：现主要用于Node.js（Node@13.2.0开始支持直接使用ES Module）
- **AMD**：`require.js` 依赖前置，市场存量不建议使用
- **CMD**：`sea.js` 就近执行，市场存量不建议使用
- **ES Module**：ES语言规范，标准，趋势，未来

对模块化发展史感兴趣的可以看下[《前端模块化开发那点历史》@玉伯](https://github.com/seajs/seajs/issues/588 "《前端模块化开发那点历史》")，而`Vite`的核心正是依靠浏览器对ES Module规范的实现。

### 发展中的构建工具

近些年前端工程化发展迅速，各种构建工具层出不穷，目前`Webpack`仍然占据统治地位，npm 每周下载量达到两千多万次。下面是我按 npm 发版时间线列出的开发者比较熟知的一些构建工具。

![](https://static.ecool.fun//article/26d74f82-9f1b-4788-b290-c8c60d95829d.jpeg)

### 当前工程化痛点

现在常用的构建工具如`Webpack`，主要是通过抓取-编译-构建整个应用的代码（也就是常说的打包过程），生成一份编译、优化后能良好兼容各个浏览器的的生产环境代码。在开发环境流程也基本相同，需要先将整个应用构建打包后，再把打包后的代码交给`dev server`（开发服务器）。

`Webpack`等构建工具的诞生给前端开发带来了极大的便利，但随着前端业务的复杂化，js代码量呈指数增长，打包构建时间越来越久，`dev server`（开发服务器）性能遇到瓶颈：
- **缓慢的服务启动：** 大型项目中`dev server`启动时间达到几十秒甚至几分钟。

- **缓慢的HMR热更新：** 即使采用了 HMR 模式，其热更新速度也会随着应用规模的增长而显著下降，已达到性能瓶颈，无多少优化空间。

**缓慢的开发环境，大大降低了开发者的幸福感，在以上背景下`Vite`应运而生。**

---

# 什么是Vite？
**基于esbuild与Rollup，依靠浏览器自身ESM编译功能， 实现极致开发体验的新一代构建工具！**

### 概念
先介绍以下文中会经常提到的一些基础概念：
- **依赖：** 指开发不会变动的部分(npm包、UI组件库)，esbuild进行预构建。
- **源码：** 浏览器不能直接执行的非js代码(.jsx、.css、.vue等)，vite只在浏览器请求相关源码的时候进行转换，以提供ESM源码。

### 开发环境
- 利用浏览器原生的`ES Module`编译能力，省略费时的编译环节，直给浏览器开发环境源码，`dev server`只提供轻量服务。
- 浏览器执行ESM的`import`时，会向`dev server`发起该模块的`ajax`请求，服务器对源码做简单处理后返回给浏览器。
- `Vite`中HMR是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块失活，使得无论应用大小如何，HMR 始终能保持快速更新。
- 使用`esbuild`处理项目依赖，`esbuild`使用go编写，比一般`node.js`编写的编译器快几个数量级。

### 生产环境
- 集成`Rollup`打包生产环境代码，依赖其成熟稳定的生态与更简洁的插件机制。

### 处理流程对比
`Webpack`通过先将整个应用打包，再将打包后代码提供给`dev server`，开发者才能开始开发。

![](https://static.ecool.fun//article/c159b719-6035-40b8-87c9-c2fda4897e6d.jpeg)

`Vite`直接将源码交给浏览器，实现`dev server`秒开，浏览器显示页面需要相关模块时，再向`dev server`发起请求，服务器简单处理后，将该模块返回给浏览器，实现真正意义的按需加载。
![](https://static.ecool.fun//article/7f76d868-8c12-4b0b-aca8-929cb4a6a4ca.jpeg)

---
# 基本用法
### 创建vite项目
```shell
$ npm create vite@latest
```
### 选取模板
`Vite` 内置6种常用模板与对应的TS版本，可满足前端大部分开发场景，可以点击下列表格中模板直接在 [StackBlitz](https://vite.new/ "StackBlitz") 中在线试用，还有其他更多的 [社区维护模板](https://github.com/vitejs/awesome-vite#templates "社区维护模板")可以使用。
|JavaScript                          | TypeScript                                |
| ----------------------------------- | ----------------------------------------- |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
| [vue](https://vite.new/vue)         | [vue-ts](https://vite.new/vue-ts)         |
| [react](https://vite.new/react)     | [react-ts](https://vite.new/react-ts)     |
| [preact](https://vite.new/preact)   | [preact-ts](https://vite.new/preact-ts)   |
| [lit](https://vite.new/lit)         | [lit-ts](https://vite.new/lit-ts)         |
| [svelte](https://vite.new/svelte)   | [svelte-ts](https://vite.new/svelte-ts)|

### 启动
```json
{
  "scripts": {
    "dev": "vite", // 启动开发服务器，别名：`vite dev`，`vite serve`
    "build": "vite build", // 为生产环境构建产物
    "preview": "vite preview" // 本地预览生产构建产物
  }
}
```
---
# 实现原理

### ESbuild 编译
`esbuild` 使用go编写，cpu密集下更具性能优势，编译速度更快，以下摘自官网的构建速度对比：<br>
**浏览器：“开始了吗？”**<br>
**服务器：“已经结束了。”**<br>
**开发者：“好快，好喜欢！！”**

![image.png](https://static.ecool.fun//article/f42c375f-9822-4c22-ba5b-ab3ac46b0045.jpeg)

### 依赖预构建

- **模块化兼容：** 如开头背景所写，现仍共存多种模块化标准代码，`Vite`在预构建阶段将依赖中各种其他模块化规范(CommonJS、UMD)转换 成ESM，以提供给浏览器。
- **性能优化：** npm包中大量的ESM代码，大量的`import`请求，会造成网络拥塞。`Vite`使用`esbuild`，将有大量内部模块的ESM关系转换成单个模块，以减少 `import`模块请求次数。

### 按需加载

- 服务器只在接受到import请求的时候，才会编译对应的文件，将ESM源码返回给浏览器，实现真正的按需加载。

### 缓存

- **HTTP缓存：** 充分利用`http`缓存做优化，依赖（不会变动的代码）部分用max-age,immutable **强缓存**，源码部分用304**协商缓存**，提升页面打开速度。
- **文件系统缓存：** `Vite`在预构建阶段，将构建后的依赖缓存到`node_modules/.vite` ，相关配置更改时，或手动控制时才会重新构建，以提升预构建速度。

### 重写模块路径

浏览器`import`只能引入相对/绝对路径，而开发代码经常使用`npm`包名直接引入`node_module`中的模块，需要做路径转换后交给浏览器。
- `es-module-lexer` 扫描 import 语法
- `magic-string` 重写模块的引入路径

```js
// 开发代码
import { createApp } from 'vue'

// 转换后
import { createApp } from '/node_modules/vue/dist/vue.js'
```

# 源码分析
与`Webpack-dev-server`类似`Vite`同样使用`WebSocket`与客户端建立连接，实现热更新，源码实现基本可分为两部分，源码位置在:

- `vite/packages/vite/src/client` client（用于客户端）
- `vite/packages/vite/src/node` server（用于开发服务器）

client 代码会在启动服务时注入到客户端，用于客户端对于`WebSocket`消息的处理（如更新页面某个模块、刷新页面）；server 代码是服务端逻辑，用于处理代码的构建与页面模块的请求。

简单看了下源码（vite@2.7.2），核心功能主要是以下几个方法（以下为源码截取，部分逻辑做了删减）：<br>
1. 命令行启动服务`npm run dev`后，源码执行`cli.ts`，调用`createServer`方法，创建http服务，监听开发服务器端口。

```js
// 源码位置 vite/packages/vite/src/node/cli.ts
const { createServer } = await import('./server')
try {
    const server = await createServer({
        root,
        base: options.base,
        ...
    })
    if (!server.httpServer) {
        throw new Error('HTTP server not available')
    }
    await server.listen()
}
```
2. `createServer`方法的执行做了很多工作，如整合配置项、创建http服务（早期通过koa创建）、创建`WebSocket`服务、创建源码的文件监听、插件执行、optimize优化等。下面注释中标出。

```js
// 源码位置 vite/packages/vite/src/node/server/index.ts
export async function createServer(
    inlineConfig: InlineConfig = {}
): Promise<ViteDevServer> {
    // Vite 配置整合
    const config = await resolveConfig(inlineConfig, 'serve', 'development')
    const root = config.root
    const serverConfig = config.server

    // 创建http服务
    const httpServer = await resolveHttpServer(serverConfig, middlewares, httpsOptions)

    // 创建ws服务
    const ws = createWebSocketServer(httpServer, config, httpsOptions)

    // 创建watcher，设置代码文件监听
    const watcher = chokidar.watch(path.resolve(root), {
        ignored: [
            '**/node_modules/**',
            '**/.git/**',
            ...(Array.isArray(ignored) ? ignored : [ignored])
        ],
        ...watchOptions
    }) as FSWatcher

    // 创建server对象
    const server: ViteDevServer = {
        config,
        middlewares,
        httpServer,
        watcher,
        ws,
        moduleGraph,
        listen,
        ...
    }

    // 文件监听变动，websocket向前端通信
    watcher.on('change', async (file) => {
        ...
        handleHMRUpdate()
    })

    // 非常多的 middleware
    middlewares.use(...)

    // optimize
    const runOptimize = async () => {...}

    return server
}
```
3. 使用[chokidar](https://www.npmjs.com/package/chokidar "chokidar")监听文件变化，绑定监听事件。

```js
// 源码位置 vite/packages/vite/src/node/server/index.ts
  const watcher = chokidar.watch(path.resolve(root), {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      ...(Array.isArray(ignored) ? ignored : [ignored])
    ],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    disableGlobbing: true,
    ...watchOptions
  }) as FSWatcher
```

4. 通过 [ws](https://www.npmjs.com/package/ws "ws") 来创建`WebSocket`服务，用于监听到文件变化时触发热更新，向客户端发送消息。

```js
// 源码位置 vite/packages/vite/src/node/server/ws.ts
export function createWebSocketServer(...){
    let wss: WebSocket
    const hmr = isObject(config.server.hmr) && config.server.hmr
    const wsServer = (hmr && hmr.server) || server

    if (wsServer) {
        wss = new WebSocket({ noServer: true })
        wsServer.on('upgrade', (req, socket, head) => {
            // 服务就绪
            if (req.headers['sec-websocket-protocol'] === HMR_HEADER) {
                wss.handleUpgrade(req, socket as Socket, head, (ws) => {
                    wss.emit('connection', ws, req)
                })
            }
        })
    } else {
        ...
    }
    // 服务准备就绪，就能在浏览器控制台看到熟悉的打印 [vite] connected.
    wss.on('connection', (socket) => {
        socket.send(JSON.stringify({ type: 'connected' }))
        ...
    })
    // 失败
    wss.on('error', (e: Error & { code: string }) => {
        ...
    })
    // 返回ws对象
    return {
        on: wss.on.bind(wss),
        off: wss.off.bind(wss),
        // 向客户端发送信息
        // 多个客户端同时触发
        send(payload: HMRPayload) {
            const stringified = JSON.stringify(payload)
            wss.clients.forEach((client) => {
                // readyState 1 means the connection is open
                client.send(stringified)
            })
        }
    }
}
```
5. 在服务启动时会向浏览器注入代码，用于处理客户端接收到的`WebSocket`消息，如重新发起模块请求、刷新页面。

```js
//源码位置 vite/packages/vite/src/client/client.ts
async function handleMessage(payload: HMRPayload) {
  switch (payload.type) {
    case 'connected':
      console.log(`[vite] connected.`)
      break
    case 'update':
      notifyListeners('vite:beforeUpdate', payload)
      ...
      break
    case 'custom': {
      notifyListeners(payload.event as CustomEventName<any>, payload.data)
      ...
      break
    }
    case 'full-reload':
      notifyListeners('vite:beforeFullReload', payload)
      ...
      break
    case 'prune':
      notifyListeners('vite:beforePrune', payload)
      ...
      break
    case 'error': {
      notifyListeners('vite:error', payload)
      ...
      break
    }
    default: {
      const check: never = payload
      return check
    }
  }
}
```
---

# 优势

- 快！快！非常快！！
- 高度集成，开箱即用。
- 基于ESM急速热更新，无需打包编译。
- 基于`esbuild`的依赖预处理，比`Webpack`等node编写的编译器快几个数量级。
- 兼容`Rollup`庞大的插件机制，插件开发更简洁。
- 不与`Vue`绑定，支持`React`等其他框架，独立的构建工具。
- 内置SSR支持。
- 天然支持TS。

# 不足
- `Vue`仍为第一优先支持，量身定做的编译插件，对`React`的支持不如`Vue`强大。
- 虽然已经推出2.0正式版，已经可以用于正式线上生产，但目前市场上实践少。
- 生产环境集成`Rollup`打包，与开发环境最终执行的代码不一致。
---
# 与 webpack 对比
由于`Vite`主打的是开发环境的极致体验，生产环境集成`Rollup`，这里的对比主要是`Webpack-dev-server`与`Vite-dev-server`的对比：

- 到目前很长时间以来`Webpack`在前端工程领域占统治地位，`Vite`推出以来备受关注，社区活跃，GitHub star 数量激增，目前达到37.4K
![image.png](https://static.ecool.fun//article/784d0787-a1ec-4b8e-b295-8a8e28ec4293.jpeg)
- `Webpack`配置丰富使用极为灵活但上手成本高，`Vite`开箱即用配置高度集成
- `Webpack`启动服务需打包构建，速度慢，`Vite`免编译可秒开
- `Webpack`热更新需打包构建，速度慢，`Vite`毫秒响应
- `Webpack`成熟稳定、资源丰富、大量实践案例，`Vite`实践较少
- `Vite`使用`esbuild`编译，构建速度比`webpack`快几个数量级
---
# 兼容性
- 默认目标浏览器是在`script`标签上支持原生 ESM 和 原生 ESM 动态导入
- 可使用官方插件 `@vitejs/plugin-legacy`，转义成传统版本和相对应的`polyfill`
---
# 未来探索
- 传统构建工具性能已到瓶颈，主打开发体验的`Vite`，可能会受到欢迎。
- 主流浏览器基本支持ESM，ESM将成为主流。
- `Vite`在`Vue3.0`代替`vue-cli`，作为官方脚手架，会大大提高使用量。
- `Vite2.0`推出后，已可以在实际项目中使用`Vite`。
- 如果觉得直接使用`Vite`太冒险，又确实有`dev server`速度慢的问题需要解决，可以尝试用`Vite`单独搭建一套`dev server`
---
# 相关资源
### 官方插件
除了支持现有的`Rollup`插件系统外，官方提供了四个最关键的插件
- `@vitejs/plugin-vue` 提供 Vue3 单文件组件支持
- `@vitejs/plugin-vue-jsx`  提供 Vue3 JSX 支持（专用的 Babel 转换插件）
- `@vitejs/plugin-react` 提供完整的 React 支持
- `@vitejs/plugin-legacy` 为打包后的文件提供传统浏览器兼容性支持

</details>

## 73. vue 中 $route 和 $router 有什么区别？ {#question-7f131792-7ef0-47c3-b794-c03b5339867c}

> 难度：1 · 类型：QA

### 题目要点

1. $route：$route 是一个当前路由信息的对象，包括当前 URL 路径、查询参数、路径参数等信息。$route 对象是只读的，不可以直接修改其属性值，而需要通过路由跳转来更新。

2. $router：$router 是 Vue Router 的实例对象，包括了许多用于导航控制和路由操作的 API，例如 push、replace、go、forward 等方法。$router 可以用来动态地改变 URL，从而实现页面间的无刷新跳转。

因此，$route 和 $router 在功能上有所不同，$route 主要用于获取当前路由信息，$router 则是用于进行路由操作，例如跳转到指定的路由、前进、后退等。通常来说，$route 和 $router 是紧密关联的，并且常常一起使用。

<details>
<summary>参考答案</summary>

在 Vue.js 中，`$route` 和 `$router` 是 Vue Router 提供的两个不同的对象，分别用于不同的目的：

1. **`$route`**：
   - **功能**：`$route` 对象包含当前路由的信息，包括路径、参数、查询字符串、路由名称等。
   - **使用**：用于访问当前路由的详细信息和状态。你可以从 `$route` 对象中获取路由参数、查询参数等。
   - **示例**：
     ```javascript
     console.log(this.$route.path);        // 当前路由的路径
     console.log(this.$route.params);      // 路由参数
     console.log(this.$route.query);       // 查询字符串
     ```

2. **`$router`**：
   - **功能**：`$router` 对象提供了控制路由的功能，例如导航到不同的路由、替换当前路由等。
   - **使用**：用于编程式导航，控制路由的跳转。
   - **示例**：
     ```javascript
     this.$router.push('/new-path');       // 导航到新路径
     this.$router.replace('/another-path'); // 替换当前路径
     ```

### 总结

- **`$route`**：提供关于当前路由的信息。
- **`$router`**：提供操作路由的方法，控制路由导航。

</details>

## 74. 说说 vue3 中的响应式设计原理 {#question-ea676360-c8f5-4ce4-bc66-5c3e4f7eddb6}

> 难度：4 · 类型：QA

### 题目要点

Vue 3 的响应式系统通过使用 Proxy 和 Reflect API，以及引入 activeEffect 和 ref 方法，实现了对数据变化的自动追踪和更新。

Vue 3 的响应式系统主要包括以下几个核心概念：

1. **Proxy**：使用 Proxy 对象来拦截对象的读取和修改操作，通过定义 get 和 set 方法来实现对数据变化的自动追踪。
2. **Reflect**：通过 Reflect API 来实现对对象属性的读取和修改操作，提供了与 `Object.defineProperty` 类似的功能，但更加强大和灵活。
3. **activeEffect**：一个全局变量，用于保存当前正在执行的 effect 函数，以便在追踪依赖时使用。
4. **ref**：将普通值转换为响应式可变的 ref 对象，其值可以通过 `.value` 属性访问和修改。

<details>
<summary>参考答案</summary>

Vue 3 中的响应式原理可谓是非常之重要，通过学习 Vue3 的响应式原理，不仅能让我们学习到 Vue.js 的一些设计模式和思想，还能**帮助我们提高项目开发效率和代码调试能力**。<br>

## 一、Vue 3 响应式使用

### 1. Vue 3 中的使用

当我们在学习 Vue 3 的时候，可以通过一个简单示例，看看什么是 Vue 3 中的响应式：

```html
<!-- HTML 内容 -->
<div id="app">
    <div>Price: {{price}}</div>
    <div>Total: {{price * quantity}}</div>
    <div>getTotal: {{getTotal}}</div>
</div>
```

```javascript
const app = Vue.createApp({ // ① 创建 APP 实例
    data() {
        return {
            price: 10,
            quantity: 2
        }
    },
    computed: {
        getTotal() {
            return this.price * this.quantity * 1.1
        }
    }
})
app.mount('#app')  // ② 挂载 APP 实例
```

通过创建 APP 实例和挂载 APP 实例即可，这时可以看到页面中分别显示对应数值：
![image.png](https://static.ecool.fun//article/614ad328-3096-4f32-bbb7-8373f950ed1d.jpeg)

当我们修改 `price` 或 `quantity` 值的时候，页面上引用它们的地方，内容也能正常展示变化后的结果。这时，我们会好奇为何数据发生变化后，相关的数据也会跟着变化，那么我们接着往下看。

### 2. 实现单个值的响应式

在普通 JS 代码执行中，并不会有响应式变化，比如在控制台执行下面代码：

```javascript
let price = 10, quantity = 2;
const total = price * quantity;
console.log(`total: ${total}`); // total: 20
price = 20;
console.log(`total: ${total}`); // total: 20
```

从这可以看出，在修改 `price` 变量的值后， `total` 的值并没有发生改变。

那么如何修改上面代码，让 `total` 能够自动更新呢？我们其实可以将修改 `total` 值的方法保存起来，等到与 `total` 值相关的变量（如 `price` 或 `quantity` 变量的值）发生变化时，触发该方法，更新 `total` 即可。我们可以这么实现：

```javascript
let price = 10, quantity = 2, total = 0;
const dep = new Set(); // ①
const effect = () => { total = price * quantity };
const track = () => { dep.add(effect) };  // ②
const trigger = () => { dep.forEach( effect => effect() )};  // ③

track();
console.log(`total: ${total}`); // total: 0
trigger();
console.log(`total: ${total}`); // total: 20
price = 20;
trigger();
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `Set` 类型的 `dep` 变量，用来存放需要执行的副作用（ `effect` 函数），这边是修改 `total` 值的方法；

② 创建 `track()` 函数，用来将需要执行的副作用保存到 `dep` 变量中（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行 `dep` 变量中的所有副作用；

在每次修改 `price` 或 `quantity` 后，调用 `trigger()` 函数执行所有副作用后， `total` 值将自动更新为最新值。
![image.png](https://static.ecool.fun//article/098e3ad6-2db4-440a-b0a6-7e20c36479c1.jpeg)

（图片来源：Vue Mastery）

### 3. 实现单个对象的响应式

通常，**我们的对象具有多个属性，并且每个属性都需要自己的 `dep`。我们如何存储这些？比如：**

```javascript
let product = { price: 10, quantity: 2 };
```

从前面介绍我们知道，我们将所有副作用保存在一个 `Set` 集合中，而该集合不会有重复项，这里我们引入一个 `Map` 类型集合（即 `depsMap` ），其 `key` 为对象的属性（如： `price` 属性）， `value` 为前面保存副作用的 `Set` 集合（如： `dep` 对象），大致结构如下图：

![image.png](https://static.ecool.fun//article/a658efdb-5daa-45ef-bcce-6647bc29021e.jpeg)
（图片来源：Vue Mastery）

实现代码：

```javascript
let product = { price: 10, quantity: 2 }, total = 0;
const depsMap = new Map(); // ①
const effect = () => { total = product.price * product.quantity };
const track = key => {     // ②
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = key => {  // ③
  let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

track('price');
console.log(`total: ${total}`); // total: 0
effect();
console.log(`total: ${total}`); // total: 20
product.price = 20;
trigger('price');
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `Map` 类型的 `depsMap` 变量，用来保存每个需要响应式变化的对象属性（`key` 为对象的属性， `value` 为前面 `Set` 集合）；

② 创建 `track()` 函数，用来将需要执行的副作用保存到 `depsMap` 变量中对应的对象属性下（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行 `dep` 变量中指定对象属性的所有副作用；

这样就实现监听对象的响应式变化，在 `product` 对象中的属性值发生变化， `total` 值也会跟着更新。

### 4. 实现多个对象的响应式

如果我们有多个响应式数据，比如同时需要观察对象 `a` 和对象 `b`  的数据，那么又要如何跟踪每个响应变化的对象？

这里我们引入一个 [WeakMap 类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)的对象，将需要观察的对象作为 `key` ，值为前面用来保存对象属性的 Map 变量。代码如下：

```javascript
let product = { price: 10, quantity: 2 }, total = 0;
const targetMap = new WeakMap();     // ① 初始化 targetMap，保存观察对象
const effect = () => { total = product.price * product.quantity };
const track = (target, key) => {     // ② 收集依赖
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = (target, key) => {  // ③ 执行指定对象的指定属性的所有副作用
  const depsMap = targetMap.get(target);
  if(!depsMap) return;
    let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

track(product, 'price');
console.log(`total: ${total}`); // total: 0
effect();
console.log(`total: ${total}`); // total: 20
product.price = 20;
trigger(product, 'price');
console.log(`total: ${total}`); // total: 40
```

上面代码通过 3 个步骤，实现对 `total` 数据进行响应式变化：

① 初始化一个 `WeakMap` 类型的 `targetMap` 变量，用来要观察每个响应式对象；

② 创建 `track()` 函数，用来将需要执行的副作用保存到指定对象（ `target` ）的依赖中（也称收集副作用）；

③ 创建 `trigger()` 函数，用来执行指定对象（ `target` ）中指定属性（ `key` ）的所有副作用；

这样就实现监听对象的响应式变化，在 `product` 对象中的属性值发生变化， `total` 值也会跟着更新。

大致流程如下图：

![image.png](https://static.ecool.fun//article/4ca05d1f-3d74-4d3a-a716-1a54bc6c7ac4.jpeg)
（图片来源：Vue Mastery）

## 二、Proxy 和 Reflect

在上一节内容中，介绍了如何在数据发生变化后，自动更新数据，但存在的问题是，每次需要手动通过触发 `track()` 函数搜集依赖，通过 `trigger()` 函数执行所有副作用，达到数据更新目的。

这一节将来解决这个问题，实现这两个函数自动调用。

### 1. 如何实现自动操作

这里我们引入 JS 对象访问器的概念，解决办法如下：

- 在读取（GET 操作）数据时，自动执行 `track()` 函数自动收集依赖；
- 在修改（SET 操作）数据时，自动执行 `trigger()` 函数执行所有副作用；

那么如何拦截 GET 和 SET 操作？接下来看看 Vue2 和 Vue3 是如何实现的：

- 在 Vue2 中，使用 ES5 的 [`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 函数实现；
- 在 Vue3 中，使用 ES6 的 [`Proxy`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 和 [`Reflect`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect) API 实现；

需要注意的是：Vue3 使用的 `Proxy` 和 `Reflect` API 并不支持 IE。

[`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 函数这边就不多做介绍，可以阅读文档，下文将主要介绍 [`Proxy`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 和 [`Reflect`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect) API。

### 2. 如何使用 Reflect

通常我们有三种方法读取一个对象的属性：

1. 使用 `.` 操作符：`leo.name` ；
2. 使用 `[]` ： `leo['name']` ；
3. 使用 `Reflect` API： `Reflect.get(leo, 'name')` 。

这三种方式输出结果相同。

### 3. 如何使用 Proxy

Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。语法如下：

```javascript
const p = new Proxy(target, handler)
```

参数如下：

- target : 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler : 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为。

我们通过官方文档，体验一下 [Proxy API](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)：

```javascript
let product = { price: 10, quantity: 2 };
let proxiedProduct = new Proxy(product, {
    get(target, key){
      console.log('正在读取的数据：',key);
    return target[key];
  }
})
console.log(proxiedProduct.price);
// 正在读取的数据： price
// 10
```

这样就保证我们每次在读取 `proxiedProduct.price` 都会执行到其中代理的 get 处理函数。其过程如下：

![image.png](https://static.ecool.fun//article/c65b6a63-6e61-44e0-a56f-04c4eb63bf3e.jpeg)
（图片来源：Vue Mastery）

然后结合 Reflect 使用，只需修改 get 函数：

```javascript
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
    return Reflect.get(target, key, receiver);
  }
```

输出结果还是一样。

接下来增加 set 函数，来拦截对象的修改操作：

```javascript
let product = { price: 10, quantity: 2 };
let proxiedProduct = new Proxy(product, {
  get(target, key, receiver){
    console.log('正在读取的数据：',key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver){
    console.log('正在修改的数据：', key, ',值为：', value);
    return Reflect.set(target, key, value, receiver);
  }
})
proxiedProduct.price = 20;
console.log(proxiedProduct.price);
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 20
```

这样便完成 get 和 set 函数来拦截对象的读取和修改的操作。为了方便对比 Vue 3 源码，我们将上面代码抽象一层，使它看起来更像 Vue3 源码：

```javascript
function reactive(target){
  const handler = {  // ① 封装统一处理函数对象
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver){
      console.log('正在修改的数据：', key, ',值为：', value);
      return Reflect.set(target, key, value, receiver);
    }
  }

  return new Proxy(target, handler); // ② 统一调用 Proxy API
}

let product = reactive({price: 10, quantity: 2}); // ③ 将对象转换为响应式对象
product.price = 20;
console.log(product.price);
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 20
```

这样输出结果仍然不变。

### 4. 修改 track 和 trigger 函数

通过上面代码，我们已经实现一个简单 `reactive()` 函数，用来**将普通对象转换为响应式对象**。但是还缺少自动执行 `track()` 函数和 `trigger()` 函数，接下来修改上面代码：

```javascript
const targetMap = new WeakMap();
let total = 0;
const effect = () => { total = product.price * product.quantity };
const track = (target, key) => {
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if(!depsMap) return;
    let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

const reactive = (target) => {
  const handler = {
    get(target, key, receiver){
      console.log('正在读取的数据：',key);
      const result = Reflect.get(target, key, receiver);
      track(target, key);  // 自动调用 track 方法收集依赖
      return result;
    },
    set(target, key, value, receiver){
      console.log('正在修改的数据：', key, ',值为：', value);
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if(oldValue != result){
         trigger(target, key);  // 自动调用 trigger 方法执行依赖
      }
      return result;
    }
  }

  return new Proxy(target, handler);
}

let product = reactive({price: 10, quantity: 2});
effect();
console.log(total);
product.price = 20;
console.log(total);
// 正在读取的数据： price
// 正在读取的数据： quantity
// 20
// 正在修改的数据： price ,值为： 20
// 正在读取的数据： price
// 正在读取的数据： quantity
// 40
```

![image.png](https://static.ecool.fun//article/2a941233-fd37-4967-8ce3-3c14746580e2.jpeg)
（图片来源：Vue Mastery）

## 三、activeEffect 和 ref

在上一节代码中，还存在一个问题： `track` 函数中的依赖（ `effect` 函数）是外部定义的，当依赖发生变化， `track` 函数收集依赖时都要手动修改其依赖的方法名。

比如现在的依赖为 `foo` 函数，就要修改 `track` 函数的逻辑，可能是这样：

```javascript
const foo = () => { /**/ };
const track = (target, key) => {     // ②
  // ...
  dep.add(foo);
}
```

那么如何解决这个问题呢？

### 1. 引入 activeEffect 变量

接下来引入 `activeEffect` 变量，来保存当前运行的 effect 函数。

```javascript
let activeEffect = null;
const effect = eff => {
  activeEffect = eff; // 1. 将 eff 函数赋值给 activeEffect
  activeEffect();     // 2. 执行 activeEffect
  activeEffect = null;// 3. 重置 activeEffect
}
```

然后在 `track` 函数中将 `activeEffect` 变量作为依赖：

```javascript
const track = (target, key) => {
    if (activeEffect) {  // 1. 判断当前是否有 activeEffect
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);  // 2. 添加 activeEffect 依赖
    }
}
```

使用方式修改为：

```javascript
effect(() => {
    total = product.price * product.quantity
});
```

这样就可以解决手动修改依赖的问题，这也是 Vue3 解决该问题的方法。完善一下测试代码后，如下：

```javascript
const targetMap = new WeakMap();
let activeEffect = null; // 引入 activeEffect 变量

const effect = eff => {
  activeEffect = eff; // 1. 将副作用赋值给 activeEffect
  activeEffect();     // 2. 执行 activeEffect
  activeEffect = null;// 3. 重置 activeEffect
}

const track = (target, key) => {
    if (activeEffect) {  // 1. 判断当前是否有 activeEffect
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);  // 2. 添加 activeEffect 依赖
    }
}

const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    let dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => effect());
    }
};

const reactive = (target) => {
    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue != result) {
                trigger(target, key);
            }
            return result;
        }
    }

    return new Proxy(target, handler);
}

let product = reactive({ price: 10, quantity: 2 });
let total = 0, salePrice = 0;
// 修改 effect 使用方式，将副作用作为参数传给 effect 方法
effect(() => {
    total = product.price * product.quantity
});
effect(() => {
    salePrice = product.price * 0.9
});
console.log(total, salePrice);  // 20 9
product.quantity = 5;
console.log(total, salePrice);  // 50 9
product.price = 20;
console.log(total, salePrice);  // 100 18
```

思考一下，如果把第一个 `effect` 函数中 `product.price` 换成 `salePrice` 会如何：

```javascript
effect(() => {
    total = salePrice * product.quantity
});
effect(() => {
    salePrice = product.price * 0.9
});
console.log(total, salePrice);  // 0 9
product.quantity = 5;
console.log(total, salePrice);  // 45 9
product.price = 20;
console.log(total, salePrice);  // 45 18
```

得到的结果完全不同，因为 `salePrice` 并不是响应式变化，而是需要调用第二个 `effect` 函数才会变化，也就是 `product.price` 变量值发生变化。

> 代码地址：
> [https://github.com/Code-Pop/vue-3-reactivity/blob/master/05-activeEffect.js](https://github.com/Code-Pop/vue-3-reactivity/blob/master/05-activeEffect.js)

### 2. 引入 ref 方法

熟悉  Vue3 Composition API 的朋友可能会想到 Ref，它接收一个值，并返回一个响应式可变的[ Ref 对象](https://v3.cn.vuejs.org/api/refs-api.html)，其值可以通过 `value` 属性获取。

> ref：接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象具有指向内部值的单个 property .value。

官网的使用示例如下：

```javascript
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```
我们有 2 种方法实现 ref 函数：

1. **使用 `reactive` 函数**

```javascript
const ref = intialValue => reactive({value: intialValue});
```

这样是可以的，虽然 Vue3 不是这么实现。

2. **使用对象的属性访问器（计算属性）**

属性方式包括：[getter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get) 和 [setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set)。

```javascript
const ref = raw => {
  const r = {
    get value(){
      track(r, 'value');
      return raw;
    },

    set value(newVal){
        raw = newVal;
      trigger(r, 'value');
    }
  }
  return r;
}
```

使用方式如下：

```javascript
let product = reactive({ price: 10, quantity: 2 });
let total = 0, salePrice = ref(0);
effect(() => {
    salePrice.value = product.price * 0.9
});
effect(() => {
    total = salePrice.value * product.quantity
});
console.log(total, salePrice.value); // 18 9
product.quantity = 5;
console.log(total, salePrice.value); // 45 9
product.price = 20;
console.log(total, salePrice.value); // 90 18
```

在 Vue3 中 ref 实现的核心也是如此。

> 代码地址：
> [https://github.com/Code-Pop/vue-3-reactivity/blob/master/06-ref.js](https://github.com/Code-Pop/vue-3-reactivity/blob/master/06-ref.js)

## 四、实现简易 Computed 方法

用过 Vue 的同学可能会好奇，上面的 `salePrice` 和 `total` 变量为什么不使用 `computed` 方法呢？

没错，这个可以的，接下来一起实现个简单的 `computed` 方法。

```javascript
const computed = getter => {
    let result = ref();
    effect(() => result.value = getter());
    return result;
}

let product = reactive({ price: 10, quantity: 2 });
let salePrice = computed(() => {
    return product.price * 0.9;
})
let total = computed(() => {
    return salePrice.value * product.quantity;
})

console.log(total.value, salePrice.value);
product.quantity = 5;
console.log(total.value, salePrice.value);
product.price = 20;
console.log(total.value, salePrice.value);
```

这里我们将一个函数作为参数传入 `computed` 方法，`computed` 方法内通过 `ref` 方法构建一个 ref 对象，然后通过 `effct` 方法，将 `getter` 方法返回值作为 `computed` 方法的返回值。

这样我们实现了个简单的 `computed` 方法，执行效果和前面一样。

## 五、源码学习建议

### 1. 构建 reactivity.cjs.js

这一节介绍如何去从[ Vue 3 仓库](https://github.com/vuejs/vue-next)打包一个 Reactivity 包来学习和使用。

准备流程如下：

1. 从[ Vue 3 仓库](https://github.com/vuejs/vue-next)下载最新 Vue3 源码；

```bash
git clone https://github.com/vuejs/vue-next.git
```

2. 安装依赖：

```bash
yarn install
```

3. 构建 Reactivity 代码：

```bash
yarn build reactivity
```

4. 复制 reactivity.cjs.js 到你的学习 demo 目录：

上一步构建完的内容，会保存在 `packages/reactivity/dist`目录下，我们只要在自己的学习 demo 中引入该目录的  reactivity.cjs.js  文件即可。

5. 学习 demo 中引入：

```javascript
const { reactive, computed, effect } = require("./reactivity.cjs.js");
```

### 2. Vue3 Reactivity 文件目录

在源码的 `packages/reactivity/src`目录下，有以下几个主要文件：

1. effect.ts：用来定义 `effect` / `track` / `trigger` ；
1. baseHandlers.ts：定义 Proxy 处理器（ get 和 set）；
1. reactive.ts：定义 `reactive` 方法并创建 ES6 Proxy；
1. ref.ts：定义 reactive 的 ref 使用的对象访问器；
1. computed.ts：定义计算属性的方法；

![image.png](https://static.ecool.fun//article/53093dcc-fa06-464a-bb7c-72242bd868b0.jpeg)
（图片来源：Vue Mastery）

</details>

## 75. vue路由中，history和hash两种模式有什么区别？ {#question-e3a135b5-e6d4-4f1f-8e02-0c977e2ce768}

> 难度：2 · 类型：QA

### 题目要点

前端路由有 hash 模式和 history 模式两种。

#### hash 模式

- **实现方式**：通过在 URL 后面添加井号 `#` 加上路径来切换页面，例如 `http://example.com/#/a`。
- **优缺点**：
  - **优点**：兼容性好，支持老版本的浏览器。
  - **缺点**：URL 中存在井号 `#`，不够美观。

#### history 模式

- **实现方式**：使用 HTML5 的 History API 直接更改 URL，例如 `http://example.com/a`。
- **优缺点**：
  - **优点**：URL 更美观，没有井号 `#`。
  - **缺点**：兼容性不如 hash 模式，且需要服务端支持，否则刷新页面会返回 404。

<details>
<summary>参考答案</summary>

前端路由有两种模式：hash 模式和 history 模式，接下来分析这两种模式的实现方式和优缺点。

## hash 模式

hash 模式是一种把前端路由的路径用井号 `#` 拼接在真实 URL 后面的模式。当井号 `#` 后面的路径发生变化时，浏览器并不会重新发起请求，而是会触发 `hashchange` 事件。

**示例**：

我们新建一个 `hash.html` 文件，内容为：

```html
<a href="#/a">A页面</a>
<a href="#/b">B页面</a>
<div id="app"></div>
<script>
  function render() {
    app.innerHTML = window.location.hash
  }
  window.addEventListener('hashchange', render)
  render()
</script>
```

在上面的例子中，我们利用 `a` 标签设置了两个路由导航，把 `app` 当做视图渲染容器，当切换路由的时候触发视图容器的更新，这其实就是大多数前端框架哈希路由的实现原理。

总结一下 hash 模式的优缺点：

- **优点**：浏览器兼容性较好，连 IE8 都支持
- **缺点**：路径在井号 `#` 的后面，比较丑

## history 模式

history API 是 H5 提供的新特性，允许开发者直接更改前端路由，即更新浏览器 URL 地址而不重新发起请求。

**示例**：

我们新建一个 `history.html`，内容为：

```html
<a href="javascript:toA();">A页面</a>
<a href="javascript:toB();">B页面</a>
<div id="app"></div>
<script>
  function render() {
    app.innerHTML = window.location.pathname
  }
  function toA() {
    history.pushState({}, null, '/a')
    render()
  }
  function toB() {
    history.pushState({}, null, '/b')
    render()
  }
  window.addEventListener('popstate', render)
</script>
```

history API 提供了丰富的函数供开发者调用，我们不妨把控制台打开，然后输入下面的语句来观察浏览器地址栏的变化：

```js
history.replaceState({}, null, '/b') // 替换路由
history.pushState({}, null, '/a') // 路由压栈
history.back() // 返回
history.forward() // 前进
history.go(-2) // 后退2次
```

上面的代码监听了 `popstate` 事件，该事件能监听到：

- 用户点击浏览器的前进和后退操作
- 手动调用 history 的 `back`、`forward` 和 `go` 方法

监听不到：

- history 的 `pushState` 和 `replaceState`方法

这也是为什么上面的 `toA` 和 `toB` 函数内部需要手动调用 `render` 方法的原因。另外，大家可能也注意到 `light-server` 的命令多了 `--historyindex '/history.html'` 参数，这是干什么的呢？

浏览器在刷新的时候，会按照路径发送真实的资源请求，如果这个路径是前端通过 history API 设置的 URL，那么在服务端往往不存在这个资源，于是就返回 404 了。上面的参数的意思就是如果后端资源不存在就返回 `history.html` 的内容。

因此在线上部署基于 history API 的单页面应用的时候，一定要后端配合支持才行，否则会出现大量的 404。以最常用的 Nginx 为例，只需要在配置的 `location /` 中增加下面一行即可：

```
try_files $uri /index.html;
```

总结一下 history 模式的优缺点：

- **优点**：路径比较正规，没有井号 `#`
- **缺点**：兼容性不如 hash，且需要服务端支持，否则一刷新页面就404了

[history-mdn]: https://developer.mozilla.org/zh-CN/docs/Web/API/History

> 本答案由“前端面试题宝典”收集整理，PC端访问请前往： https://fe.ecool.fun/

</details>

## 76. VNode 有哪些属性？ {#question-20be1725-4902-4135-8b80-7be60507fc13}

> 难度：3 · 类型：QA

### 题目要点

Vue内部定义的Vnode对象包含了多个属性，用于描述虚拟节点（Virtual DOM）的各个方面。这些属性包括：

1. **内部属性**：
   - `__v_isVNode: true`：标识该对象是一个Vnode。
   - `__v_skip: true`：标识是否跳过响应式转换。
   - `isCompatRoot?: true`：用于判断是否进行了兼容处理。
2. **类型和属性**：
   - `type`：虚拟节点的类型。
   - `props`：虚拟节点的props，包括静态和动态属性。
   - `key`：用于diff算法的key。
   - `ref`：虚拟节点的引用。
   - `scopeId`：单文件组件的scopeId。
   - `slotScopeIds`：与单文件组件的插槽有关。
   - `children`：子节点。
   - `component`：组件实例。
   - `dirs`：当前Vnode绑定的指令。
   - `transition`：TransitionHooks。
3. **DOM相关属性**：
   - `el`：宿主阶段的节点。
   - `anchor`：fragment的锚点。
   - `target`：teleport的目标。
   - `targetAnchor`：teleport的目标锚点。
   - `staticCount`：静态节点的数量。
4. **suspense相关属性**：
   - `suspense`：SuspenseBoundary。
   - `ssContent`：VNode。
   - `ssFallback`：VNode。
5. **优化属性**：
   - `shapeFlag`：表示节点的形状。
   - `patchFlag`：表示节点的patch标记。
   - `dynamicProps`：动态属性列表。
   - `dynamicChildren`：动态子节点列表。
6. **根节点属性**：
   - `appContext`：实例上下文。

<details>
<summary>参考答案</summary>

Vue内部定义的Vnode对象包含了以下属性：

* __v_isVNode: *true*，内部属性，有该属性表示为Vnode
* __v_skip: true，内部属性，表示跳过响应式转换，reactive转换时会根据此属性进行判断
* isCompatRoot?: *true*，用于是否做了兼容处理的判断
* type: VNodeTypes，虚拟节点的类型
* props: (VNodeProps & ExtraProps) | *null*，虚拟节点的props
* key: *string* | *number* | *null*，虚拟阶段的key，可用于diff
* ref: VNodeNormalizedRef | *null*，虚拟阶段的引用
* scopeId: *string* | *null*，仅限于SFC(单文件组件)，在设置currentRenderingInstance当前渲染实例时，一期设置
* slotScopeIds: *string*[] | *null*，仅限于单文件组件，与单文件组件的插槽有关
* children: VNodeNormalizedChildren，子节点
* component: ComponentInternalInstance | null，组件实例
* dirs: DirectiveBinding[] | null，当前Vnode绑定的指令
* transition: TransitionHooks<HostElement> | null，TransitionHooks
* DOM相关属性
    * el: HostNode | *null*，宿主阶段
    * anchor: HostNode | *null* // fragment anchor
    * target: HostElement | *null* ，teleport target 传送的目标
    * targetAnchor: HostNode | *null* // teleport target anchor
    * staticCount: *number*，包含的静态节点的数量
* suspense 悬挂有关的属性
    * suspense: SuspenseBoundary | *null*
    * ssContent: VNode | *null*
    * ssFallback: VNode | *null*
* optimization only 用于优化的属性
    * shapeFlag: *number*
    * patchFlag: *number*
    * dynamicProps: *string*[] | *null*
    * dynamicChildren: VNode[] | *null*
* 根节点会有的属性
    * appContext: AppContext | *null*，实例上下文

可以看到在Vue内部，对于一个Vnode描述对象的属性大概有二十多个。

Vue为了给用于减轻一定的负担，但又不至于太封闭，就创建了渲染h。可以在用户需要的时候，通过h函数创建对应的Vnode即可。

这样就给为一些高阶玩家保留了自由发挥的空间。

</details>

## 77. Vue2.0为什么不能检查数组的变化，该怎么解决？ {#question-26f1a1e7-1bfd-4a0c-91b1-4e1c8455f60a}

> 难度：3 · 类型：QA

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

## 78. 说说Vue 页面渲染流程 {#question-6201f33e-f962-4cdc-ab01-59d03993fed8}

> 难度：4 · 类型：QA

### 题目要点

Vue 视图渲染流程涉及组件挂载、构建 VNode、生成真实 DOM 等多个步骤。这个过程从调用 `$mount` 开始，最终将 VNode 转换为真实 DOM 并挂载到页面。

1. **挂载组件**：Vue 实例通过 `$mount` 方法进行挂载，该方法内部调用 `mountComponent`。
2. **构建 VNode**：`mountComponent` 调用 `_render` 方法，创建并返回 VNode。VNode 是虚拟节点，包含组件的类型、属性、子节点等信息。
3. **生成真实 DOM**：`_update` 方法接收 VNode 并调用 `__patch__` 方法，将 VNode 转换为真实 DOM。`__patch__` 内部使用 `createElm` 方法创建真实节点，并根据 VNode 的子节点递归创建子节点树。最后将节点插入到父节点中。
4. **更新流程**：在数据更新时，Vue 会再次调用 `_update` 方法，根据新的 VNode 更新 DOM。

Vue 使用了递归和钩子函数来处理不同的渲染场景，例如组件渲染、文本节点处理等。这个过程保证了 Vue 能够高效地更新视图，同时保持了代码的清晰和可维护性。

<details>
<summary>参考答案</summary>

## 前言

在 `Vue` 核心中除了响应式原理外，视图渲染也是重中之重。我们都知道每次更新数据，都会走视图渲染的逻辑，而这当中牵扯的逻辑也是十分繁琐。

本文主要解析的是初始化视图渲染流程，你将会了解到从挂载组件开始，`Vue` 是如何构建 `VNode`，又是如何将 `VNode` 转为真实节点并挂载到页面。

## 挂载组件($mount)

`Vue` 是一个构造函数，通过 `new` 关键字进行实例化。

```js
// src/core/instance/index.js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

在实例化时，会调用 `_init` 进行初始化。

```js
// src/core/instance/init.js
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // ...
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
```

`_init` 内会调用 `$mount` 来挂载组件，而 `$mount` 方法实际调用的是 `mountComponent`。

```js
// src/core/instance/lifecycle.js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // ...
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    // ...
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)  // 渲染页面函数
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, { //  渲染watcher
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

`mountComponent` 除了调用一些生命周期的钩子函数外，最主要是 `updateComponent`，它就是负责渲染视图的核心方法，其只有一行核心代码：

```js
vm._update(vm._render(), hydrating)
```

`vm._render` 创建并返回 `VNode`，`vm._update` 接受 `VNode` 将其转为真实节点。

`updateComponent` 会被传入 `渲染Watcher`，每当数据变化触发 `Watcher` 更新就会执行该函数，重新渲染视图。`updateComponent` 在传入 `渲染Watcher` 后会被执行一次进行初始化页面渲染。

所以我们着重分析的是 `vm._render` 和 `vm._update` 两个方法，这也是本文主要了解的原理——`Vue` 视图渲染流程。

## 构建VNode(_render)

首先是 `_render` 方法，它用来构建组件的 `VNode`。

```js
// src/core/instance/render.js
Vue.prototype._render = function () {
    const { render, _parentVnode } = vm.$options
    vnode = render.call(vm._renderProxy, vm.$createElement)
    return vnode
}
```

`_render` 内部会执行 `render` 方法并返回构建好的 `VNode`。`render` 一般是模板编译后生成的方法，也有可能是用户自定义。

```js
// src/core/instance/render.js
export function initRender (vm) {
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```

`initRender` 在初始化就会执行为实例上绑定两个方法，分别是 `vm._c` 和 `vm.$createElement`。它们两者都是调用 `createElement` 方法，它是创建 `VNode` 的核心方法，最后一个参数用于区别是否为用户自定义。

`vm._c` 应用场景是在编译生成的 `render` 函数中调用，`vm.$createElement` 则用于用户自定义 `render` 函数的场景。就像上面 `render` 在调用时会传入参数 `vm.$createElement`，我们在自定义 `render` 函数接收到的参数就是它。

### createElement

```js
// src/core/vdom/create-elemenet.js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

`createElement` 方法实际上是对 `_createElement` 方法的封装，它允许传入的参数更加灵活。

```js
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

`_createElement` 参数中会接收 `children`，它表示当前 `VNode` 的子节点，因为它是任意类型的，所以接下来需要将其规范为标准的 `VNode` 数组；

```js
// 这里规范化 children
if (normalizationType === ALWAYS_NORMALIZE) {
  children = normalizeChildren(children)
} else if (normalizationType === SIMPLE_NORMALIZE) {
  children = simpleNormalizeChildren(children)
}
```

`simpleNormalizeChildren` 和 `normalizeChildren`   均用于规范化 `children`。由 `normalizationType` 判断 `render` 函数是编译生成的还是用户自定义的。

```js
// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
export function simpleNormalizeChildren (children: any) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
export function normalizeChildren (children: any): ?Array<VNode> {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}
```

`simpleNormalizeChildren` 方法调用场景是 render 函数当函数是编译生成的。`normalizeChildren` 方法的调用场景主要是 render 函数是用户手写的。

经过对 `children` 的规范化，`children` 变成了一个类型为 `VNode` 的数组。之后就是创建 `VNode` 的逻辑。

```js
// src/core/vdom/patch.js
let vnode, ns
if (typeof tag === 'string') {
  let Ctor
  ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  if (config.isReservedTag(tag)) {
    // platform built-in elements
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    // unknown or unlisted namespaced elements
    // check at runtime because it may get assigned a namespace when its
    // parent normalizes children
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
```

如果 `tag` 是 `string` 类型，则接着判断如果是内置的一些节点，创建一个普通 `VNode`；如果是为已注册的组件名，则通过 `createComponent` 创建一个组件类型的 `VNode`；否则创建一个未知的标签的 `VNode`。

如果 `tag` 不是 `string` 类型，那就是 `Component` 类型, 则直接调用 `createComponent` 创建一个组件类型的 `VNode` 节点。

最后 `_createElement` 会返回一个 `VNode`，也就是调用 `vm._render` 时创建得到的`VNode`。之后 `VNode` 会传递给 `vm._update` 函数，用于生成真实dom。

## 生成真实dom(_update)

```js
// src/core/instance/lifecycle.js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const prevActiveInstance = activeInstance
  activeInstance = vm
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  activeInstance = prevActiveInstance
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
  // updated hook is called by the scheduler to ensure that children are
  // updated in a parent's updated hook.
}
```

`_update` 里最核心的方法就是 `vm.__patch__` 方法，不同平台的 `__patch__` 方法的定义会稍有不同，在 web 平台中它是这样定义的：

```js
// src/platforms/web/runtime/index.js
import { patch } from './patch'
// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

可以看到 `__patch__` 实际调用的是 `patch` 方法。

```js
// src/platforms/web/runtime/patch.js
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

而 `patch` 方法是由 `createPatchFunction` 方法创建返回出来的函数。

```js
// src/core/vdom/patch.js
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export function createPatchFunction (backend) {
  let i, j
  const cbs = {}
  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  // ...
  return function patch (oldVnode, vnode, hydrating, removeOnly){}
}
```

这里有两个比较重要的对象 `nodeOps` 和 `modules`。`nodeOps` 是封装的原生dom操作方法，在生成真实节点树的过程中，dom相关操作都是调用 `nodeOps` 内的方法。

`modules` 是待执行的钩子函数。在进入函数时，会将不同模块的钩子函数分类放置到 `cbs` 中，其中包括自定义指令钩子函数，ref 钩子函数。在 `patch` 阶段，会根据操作节点的行为取出对应类型进行调用。

### patch

```js
// initial render
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
```

在首次渲染时，`vm.$el` 对应的是根节点 dom 对象，也就是我们熟知的 id 为 app 的 div。它作为 `oldVNode` 参数传入 `patch`：

```js
return function patch (oldVnode, vnode, hydrating, removeOnly) {
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue = []

  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
    } else {
      if (isRealElement) {
        // mounting to a real element
        // check if this is server-rendered content and if we can perform
        // a successful hydration.
        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
          oldVnode.removeAttribute(SSR_ATTR)
          hydrating = true
        }
        if (isTrue(hydrating)) {
          if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
            invokeInsertHook(vnode, insertedVnodeQueue, true)
            return oldVnode
          } else if (process.env.NODE_ENV !== 'production') {
            warn(
              'The client-side rendered virtual DOM tree is not matching ' +
              'server-rendered content. This is likely caused by incorrect ' +
              'HTML markup, for example nesting block-level elements inside ' +
              '<p>, or missing <tbody>. Bailing hydration and performing ' +
              'full client-side render.'
            )
          }
        }
        // either not server-rendered, or hydration failed.
        // create an empty node and replace it
        oldVnode = emptyNodeAt(oldVnode)
      }

      // replacing existing element
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)

      // create new node
      createElm(
        vnode,
        insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )

      // update parent placeholder node element, recursively
      if (isDef(vnode.parent)) {
        let ancestor = vnode.parent
        const patchable = isPatchable(vnode)
        while (ancestor) {
          for (let i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](ancestor)
          }
          ancestor.elm = vnode.elm
          if (patchable) {
            for (let i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, ancestor)
            }
            // #6513
            // invoke insert hooks that may have been merged by create hooks.
            // e.g. for directives that uses the "inserted" hook.
            const insert = ancestor.data.hook.insert
            if (insert.merged) {
              // start at index 1 to avoid re-invoking component mounted hook
              for (let i = 1; i < insert.fns.length; i++) {
                insert.fns[i]()
              }
            }
          } else {
            registerRef(ancestor)
          }
          ancestor = ancestor.parent
        }
      }

      // destroy old node
      if (isDef(parentElm)) {
        removeVnodes([oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode)
      }
    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```

通过检查属性 `nodeType`（真实节点才有的属性）， 判断 `oldVnode` 是否为真实节点。

```js
const isRealElement = isDef(oldVnode.nodeType)
if (isRealElement) {
  // ...
  oldVnode = emptyNodeAt(oldVnode)
}
```

很明显第一次的 `isRealElement` 是为 `true`，因此会调用 `emptyNodeAt` 将其转为 `VNode`：

```js
function emptyNodeAt (elm) {
  return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
}
```

接着会调用 `createElm` 方法，它就是将 `VNode` 转为真实dom 的核心方法：

```js
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  if (isDef(vnode.elm) && isDef(ownerArray)) {
    // This vnode was used in a previous render!
    // now it's used as a new node, overwriting its elm would cause
    // potential patch errors down the road when it's used as an insertion
    // reference node. Instead, we clone the node on-demand before creating
    // associated DOM element for it.
    vnode = ownerArray[index] = cloneVNode(vnode)
  }

  vnode.isRootInsert = !nested // for transition enter check
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }

  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  if (isDef(tag)) {
    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode)
    setScope(vnode)

    /* istanbul ignore if */
    if (__WEEX__) {
      // ...
    } else {
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      insert(parentElm, vnode.elm, refElm)
    }

    if (process.env.NODE_ENV !== 'production' && data && data.pre) {
      creatingElmInVPre--
    }
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  }
}
```

一开始会调用 `createComponent` 尝试创建组件类型的节点，如果成功会返回 `true`。在创建过程中也会调用 `$mount` 进行组件范围内的挂载，所以走的还是 `patch` 这套流程。

```js
if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
  return
}
```

如果没有完成创建，代表该 `VNode` 对应的是真实节点，往下继续创建真实节点的逻辑。

```js
vnode.elm = vnode.ns
    ? nodeOps.createElementNS(vnode.ns, tag)
    : nodeOps.createElement(tag, vnode)
```

根据 `tag` 创建对应类型真实节点，赋值给 `vnode.elm`，它作为父节点容器，创建的子节点会被放到里面。

然后调用 `createChildren` 创建子节点：

```js
function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(children)
    }
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}
```

内部进行遍历子节点数组，再次调用 `createElm` 创建节点，而上面创建的 `vnode.elm` 作为父节点传入。如此循环，直到没有子节点，就会创建文本节点插入到 `vnode.elm` 中。

执行完成后出来，会调用 `invokeCreateHooks`，它负责执行 dom 操作时的 `create` 钩子函数，同时将 `VNode` 加入到 `insertedVnodeQueue` 中：

```js
function invokeCreateHooks (vnode, insertedVnodeQueue) {
  for (let i = 0; i < cbs.create.length; ++i) {
    cbs.create[i](emptyNode, vnode)
  }
  i = vnode.data.hook // Reuse variable
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode)
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
  }
}
```

最后一步就是调用 `insert` 方法将节点插入到父节点：

```js
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (nodeOps.parentNode(ref) === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}
```

可以看到 `Vue` 是通过递归调用 `createElm` 来创建节点树的。同时也说明最深的子节点会先调用 `insert` 插入节点。所以整个节点树的插入顺序是“先子后父”。插入节点方法就是原生dom的方法 `insertBefore` 和 `appendChild`。

```js
if (isDef(parentElm)) {
  removeVnodes([oldVnode], 0, 0)
}
```

`createElm` 流程走完后，构建完成的节点树已经插入到页面上了。其实 `Vue` 在初始化渲染页面时，并不是把原来的根节点 `app` 给真正替换掉，而是在其后面插入一个新的节点，接着再把旧节点给移除掉。

所以在 `createElm` 之后会调用 `removeVnodes` 来移除旧节点，它里面同样是调用的原生dom方法 `removeChild`。

```js
invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
```

```js
function invokeInsertHook (vnode, queue, initial) {
  // delay insert hooks for component root nodes, invoke them after the
  // element is really inserted
  if (isTrue(initial) && isDef(vnode.parent)) {
    vnode.parent.data.pendingInsert = queue
  } else {
    for (let i = 0; i < queue.length; ++i) {
      queue[i].data.hook.insert(queue[i])
    }
  }
}
```

在 `patch` 的最后就是调用 `invokeInsertHook` 方法，触发节点插入的钩子函数。

至此整个页面渲染的流程完毕~

## 总结

![](https://static.ecool.fun//article/9f3602e1-b65b-4bc0-bdff-d226d4575634.png)

初始化调用 `$mount` 挂载组件。

`_render` 开始构建 `VNode`，核心方法为 `createElement`，一般会创建普通的 `VNode` ，遇到组件就创建组件类型的 `VNode`，否则就是未知标签的 `VNode`，构建完成传递给 `_update`。

`patch` 阶段根据 `VNode` 创建真实节点树，核心方法为 `createElm`，首先遇到组件类型的 `VNode`，内部会执行 `$mount`，再走一遍相同的流程。普通节点类型则创建一个真实节点，如果它有子节点开始递归调用 `createElm`，使用 `insert` 插入子节点，直到没有子节点就填充内容节点。最后递归完成后，同样也是使用 `insert` 将整个节点树插入到页面中，再将旧的根节点移除。

</details>

## 79. react 和 vue 有什么区别？ {#question-44305e95-4103-4ec6-b6e4-9b2b75014bdc}

> 难度：3 · 类型：QA

### 题目要点

React和Vue的区别：

1. **设计理念**：
   - React：强调组件化，使用JSX语法，适合构建大型应用。
   - Vue：渐进式框架，易于上手，也支持组件化，适合从简单到复杂的各种应用。

2. **数据绑定**：
   - React：单向数据流，通过props和state传递数据。
   - Vue：默认双向数据绑定，通过v-model等指令实现。

3. **模板语法**：
   - React：使用JSX，需要编译成JavaScript。
   - Vue：基于HTML的模板语法，更加直观。

4. **性能优化**：
   - React：通过虚拟DOM和生命周期方法优化。
   - Vue：通过getter/setter的依赖追踪系统优化。

5. **生态系统**：
   - 两者都拥有庞大的生态系统和活跃的社区支持，但React的生态系统可能更为庞大，包含更多第三方库和工具。

6. **学习曲线**：
   - React可能因其JSX和函数式编程的概念而具有较高的学习曲线。
   - Vue则因其更直观的模板语法和接近原生JavaScript的语法而可能更容易上手。

<details>
<summary>参考答案</summary>

# 前言

React 是由Facebook创建的JavaScript UI框架，React推广了 Virtual DOM( 虚拟 DOM )并创造了 JSX 语法。JSX 语法的出现允许我们在 javascript 中书写 HTML 代码。

VUE 是由尤雨溪开发的，VUE 使用了模板系统而不是JSX，因其实模板系统都是用的普通的 HTML，所以对应用的升级更方便、更容易，而不需要整体重构。

VUE 相较于 React 更容易上手，如果是一个有一定开发经验的开发者，甚至都不需要花额外的时间去学习，直接一遍开发一遍查文挡即可。

# VUE 与 React 区别

React 的思路是 HTML in JavaScript 也可以说是 All in JavaScript，通过 JavaScript 来生成 HTML，所以设计了 JSX 语法，还有通过 JS 来操作 CSS，社区的styled-component、JSS等。

Vue 是把 HTML，CSS，JavaScript 组合到一起，用各自的处理方式，Vue 有单文件组件，可以把 HTML、CSS、JS 写到一个文件中，HTML 提供了模板引擎来处理。

React 整体是函数式的思想，在 React 中是单向数据流，推崇结合 immutable 来实现数据不可变。

而 Vue 的思想是响应式的，也就是基于是数据可变的，通过对每一个属性建立 Watcher 来监听，当属性变化的时候，响应式的更新对应的虚拟 DOM。

如上，所以 React 的性能优化需要手动去做，而Vue的性能优化是自动的，但是Vue的响应式机制也有问题，就是当 state 特别多的时候，Watcher 会很多，会导致卡顿。

# React 与 VUE 共同点

React 与 Vue 存在很多共同点，例如他们都是 JavaScript 的 UI 框架，专注于创造前端的富应用。不同于早期的 JavaScript 框架“功能齐全”，Reat 与 Vue 只有框架的骨架，其他的功能如路由、状态管理等是框架分离的组件。

## 优势

### React<br>

* 灵活性和响应性：它提供最大的灵活性和响应能力。
* 丰富的JavaScript库：来自世界各地的贡献者正在努力添加更多功能。
* 可扩展性：由于其灵活的结构和可扩展性，React已被证明对大型应用程序更好。
* 不断发展： React得到了Facebook专业开发人员的支持，他们不断寻找改进方法。
* Web或移动平台： React提供React Native平台，可通过相同的React组件模型为iOS和Android开发本机呈现的应用程序。

### Vue

* 易于使用： Vue.js包含基于HTML的标准模板，可以更轻松地使用和修改现有应用程序。
* 更顺畅的集成：无论是单页应用程序还是复杂的Web界面，Vue.js都可以更平滑地集成更小的部件，而不会对整个系统产生任何影响。
* 更好的性能，更小的尺寸：它占用更少的空间，并且往往比其他框架提供更好的性能。
* 精心编写的文档：通过详细的文档提供简单的学习曲线，无需额外的知识; HTML和JavaScript将完成工作。
* 适应性：整体声音设计和架构使其成为一种流行的JavaScript框架。
* 它提供无障碍的迁移，简单有效的结构和可重用的模板。

# 总结

如上所说的 Vue 的响应式机制也有问题，当 state 特别多的时候，Watcher 会很多，会导致卡顿，所以大型应用（状态特别多的）一般用 React，更加可控。

可对于易用性来说，VUE 是更容易上手的，对于项目来说新人更容易接手。

使用 React 的公司：Facebook，Instagram，Netflix，纽约时报，雅虎，WhatsApp，Codecademy，Dropbox，Airbnb，Asana，微软等。

使用 Vue 的公司：Facebook，Netflix，Adobe，Grammarly，Behance，小米，阿里巴巴，Codeship，Gitlab和Laracasts等。

所以，技术没有哪个更好或者是更优秀，只要适合自己的才是最合适的。

</details>

## 80. computed怎么实现的缓存 {#question-ca2af24f-1516-4fd7-b979-e2f1d09ccb20}

> 难度：3 · 类型：QA

### 题目要点

在Vue 2.x版本中，计算属性（computed）的实现涉及了几个关键步骤，包括初始化计算属性、依赖收集和派发更新。下面是这些步骤的详细解释：

1. **初始化计算属性**：
   - Vue在实例化时会调用`initState`方法，其中包含了对计算属性的初始化。
   - 对于每个计算属性，Vue会创建一个`Watcher`实例，并将其保存在`vm._computedWatchers`对象中。
   - 这些`Watcher`实例被标记为`lazy`，意味着它们的值只有在首次读取时才会计算。
2. **依赖收集**：
   - 当执行渲染watcher的getter时，它会访问计算属性的值，从而触发计算属性的getter。
   - 计算属性的getter会将当前的渲染watcher添加到`Dep.target`中，即当前激活的依赖收集器。
   - 计算属性的getter还会访问其依赖的数据（在这个例子中是`this.count`），从而触发数据属性的getter，将当前的渲染watcher添加到数据属性的dep中。
3. **派发更新**：
   - 当依赖的数据发生变化时，数据属性的setter会被触发，它会通知所有依赖它的dep。
   - 计算属性的dep会调用其`notify`方法，通知所有依赖它的watcher进行更新。
   - 计算属性的watcher会检查自己的`dirty`状态，如果为`true`，则执行`evaluate`方法重新计算值。
   - 重新计算的值会被返回给依赖它的渲染watcher，从而触发视图的更新。

整个流程可以总结为：

- 初始化时，Vue创建计算属性的watcher并收集其依赖。
- 当依赖的数据变化时，计算属性的dep通知watcher重新计算。
- 计算出的新值会被返回给依赖它的渲染watcher，触发视图更新。
这个流程确保了计算属性的值只有在需要时才会被计算，并且只有当依赖的数据变化时才会触发更新，从而提高了性能。

<details>
<summary>参考答案</summary>

下面将围绕一个例子，讲解一下computed初始化及更新时的流程，来看看计算属性是怎么实现的缓存，及依赖是怎么被收集的。

```js
<div id="app">
  <span @click="change">{{sum}}</span>
</div>
<script src="./vue2.6.js"></script>
<script>
  new Vue({
    el: "#app",
    data() {
      return {
        count: 1,
      }
    },
    methods: {
      change() {
        this.count = 2
      },
    },
    computed: {
      sum() {
        return this.count + 1
      },
    },
  })
</script>
```

## 初始化 computed

vue初始化时先执行init方法，里面的initState会进行计算属性的初始化

```js
if (opts.computed) {initComputed(vm, opts.computed);}
```

下面是initComputed的代码

```js
var watchers = vm._computedWatchers = Object.create(null);
// 依次为每个 computed 属性定义一个计算watcher
for (const key in computed) {
  const userDef = computed[key]
  watchers[key] = new Watcher(
      vm, // 实例
      getter, // 用户传入的求值函数 sum
      noop, // 回调函数 可以先忽视
      { lazy: true } // 声明 lazy 属性 标记 computed watcher
  )
  // 用户在调用 this.sum 的时候，会发生的事情
  defineComputed(vm, key, userDef)
}
```

每个计算属性对应的计算watcher的初始状态如下：

```js
{
    deps: [],
    dirty: true,
    getter: ƒ sum(),
    lazy: true,
    value: undefined
}
```

可以看到它的 value 刚开始是 undefined，lazy 是 true，说明它的值是惰性计算的，只有到真正在模板里去读取它的值后才会计算。

这个 dirty 属性其实是缓存的关键，先记住它。

接下来看看比较关键的 defineComputed，它决定了用户在读取 this.sum 这个计算属性的值后会发生什么，继续简化，排除掉一些不影响流程的逻辑。

```js
Object.defineProperty(target, key, {
    get() {
        // 从刚刚说过的组件实例上拿到 computed watcher
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
          // 只有dirty了才会重新求值
          if (watcher.dirty) {
            // 这里会求值，会调用get，会设置Dep.target
            watcher.evaluate()
          }
          // 这里也是个关键 等会细讲
          if (Dep.target) {
            watcher.depend()
          }
          // 最后返回计算出来的值
          return watcher.value
        }
    }
})
```

这个函数需要仔细看看，它做了好几件事，我们以初始化的流程来讲解它：

首先 dirty 这个概念代表脏数据，说明这个数据需要重新调用用户传入的 sum 函数来求值了。我们暂且不管更新时候的逻辑，第一次在模板中读取到 {{sum}} 的时候它一定是 true，所以初始化就会经历一次求值。

```js
evaluate () {
  // 调用 get 函数求值
  this.value = this.get()
  // 把 dirty 标记为 false
  this.dirty = false
}
```

这个函数其实很清晰，它先求值，然后把 dirty 置为 false。再回头看看我们刚刚那段 Object.defineProperty 的逻辑，下次没有特殊情况再读取到 sum 的时候，发现 dirty是false了，是不是直接就返回 watcher.value 这个值就可以了，这其实就是计算属性缓存的概念。

## 依赖收集

初始化完成之后，最终会调用render进行渲染，而render函数会作为watcher的getter，此时的watcher为渲染watcher。

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
// 创建一个渲染watcher，渲染watcher初始化时，就会调用其get()方法，即render函数，就会进行依赖收集
new Watcher(vm, updateComponent, noop, {}, true /* isRenderWatcher */)
```

看一下watcher中的get方法

```js
get () {
    // 将当前watcher放入栈顶，同时设置给Dep.target
    pushTarget(this)
    let value
    const vm = this.vm
    // 调用用户定义的函数，会访问到this.count，从而访问其getter方法，下面会讲到
    value = this.getter.call(vm, vm)
    // 求值结束后，当前watcher出栈
    popTarget()
    this.cleanupDeps()
    return value
 }
```

渲染watcher的getter执行时（render函数），会访问到this.sum，就会触发该计算属性的getter，即在initComputed时定义的该方法，会把与sum绑定的计算watcher得到之后，因为初始化时dirty为true，会调用其evaluate方法，最终会调用其get()方法，把该计算watcher放入栈顶，此时Dep.target也为该计算watcher。

接着调用其get方法，就会访问到this.count，会触发count属性的getter（如下），就会将当前Dep.target存放的watcher收集到count属性对应的dep中。此时求值结束，调用`popTarget()`将该watcher出栈，此时上个渲染watcher就在栈顶了，Dep.target重新为渲染watcher。

```js
// 在闭包中，会保留对于 count 这个 key 所定义的 dep
const dep = new Dep()

// 闭包中也会保留上一次 set 函数所设置的 val
let val

Object.defineProperty(obj, key, {
  get: function reactiveGetter () {
    const value = val
    // Dep.target 此时就是计算watcher
    if (Dep.target) {
      // 收集依赖
      dep.depend()
    }
    return value
  },
})
```

```js
// dep.depend()
depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}
```

```js
// watcher 的 addDep函数
addDep (dep: Dep) {
  // 这里做了一系列的去重操作 简化掉

  // 这里会把 count 的 dep 也存在自身的 deps 上
  this.deps.push(dep)
  // 又带着 watcher 自身作为参数
  // 回到 dep 的 addSub 函数了
  dep.addSub(this)
}
```

```js
class Dep {
  subs = []

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
}
```

通过这两段代码，计算watcher就被属性所绑定dep所收集。watcher依赖dep，dep同时也依赖watcher，它们之间的这种相互依赖的数据结构，可以方便知道一个watcher被哪些dep依赖和一个dep依赖了哪些watcher。

接着执行`watcher.depend()`

```js
// watcher.depend
depend () {
  let i = this.deps.length
  while (i--) {
    this.deps[i].depend()
  }
}
```

还记得刚刚的 计算watcher 的形态吗？它的 deps 里保存了 count 的 dep。也就是说，又会调用 count 上的 dep.depend()

```js
class Dep {
  subs = []

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
}
```

这次的 Dep.target 已经是 渲染watcher 了，所以这个 count 的 dep 又会把 渲染watcher 存放进自身的 subs 中。

最终count的依赖收集完毕，它的dep为:

```js
{
    subs: [ sum的计算watcher，渲染watcher ]
}
```

## 派发更新

那么来到了此题的重点，这时候 count 更新了，是如何去触发视图更新的呢？

再回到 count 的响应式劫持逻辑里去：

```js
// 在闭包中，会保留对于 count 这个 key 所定义的 dep
const dep = new Dep()

// 闭包中也会保留上一次 set 函数所设置的 val
let val

Object.defineProperty(obj, key, {
  set: function reactiveSetter (newVal) {
      val = newVal
      // 触发 count 的 dep 的 notify
      dep.notify()
    }
  })
})
```

好，这里触发了我们刚刚精心准备的 count 的 dep 的 notify 函数。

```js
class Dep {
  subs = []

  notify () {
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```

这里的逻辑就很简单了，把 subs 里保存的 watcher 依次去调用它们的 update 方法，也就是

1. 调用 计算watcher 的 update
2. 调用 渲染watcher 的 update

计算watcher的update

```js
update () {
  if (this.lazy) {
    this.dirty = true
  }
}
```

仅仅是把 计算watcher 的 dirty 属性置为 true，静静的等待下次读取即可（再次执行render函数时，会再次访问到sum属性，此时的dirty为true，就会进行再次求值）。

渲染watcher的update

这里其实就是调用 vm.\_update(vm.\_render()) 这个函数，重新根据 render 函数生成的 vnode 去渲染视图了。<br>
而在 render 的过程中，一定会访问到su 这个值，那么又回到sum定义的get上：

```js
Object.defineProperty(target, key, {
    get() {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
          // 上一步中 dirty 已经置为 true, 所以会重新求值
          if (watcher.dirty) {
            watcher.evaluate()
          }
          if (Dep.target) {
            watcher.depend()
          }
          // 最后返回计算出来的值
          return watcher.value
        }
    }
})
```

由于上一步中的响应式属性更新，触发了 计算 watcher 的 dirty 更新为 true。所以又会重新调用用户传入的 sum 函数计算出最新的值，页面上自然也就显示出了最新的值。

至此为止，整个计算属性更新的流程就结束了。

## 总结一下

1. 初始化data和computed,分别代理其set以及get方法, 对data中的所有属性生成唯一的dep实例。
2. 对computed中的sum生成唯一watcher,并保存在vm.\_computedWatchers中
3. 执行render函数时会访问sum属性，从而执行initComputed时定义的getter方法，会将Dep.target指向sum的watcher,并调用该属性具体方法sum。
4. sum方法中访问this.count，即会调用this.count代理的get方法，将this.count的dep加入sum的watcher,同时该dep中的subs添加这个watcher。
5. 设置vm.count = 2，调用count代理的set方法触发dep的notify方法，因为是computed属性，只是将watcher中的dirty设置为true。
6. 最后一步vm.sum，访问其get方法时，得知sum的watcher.dirty为true,调用其watcher.evaluate()方法获取新的值。

</details>

## 81. ​vue中computed和watch区别 {#question-f8de3a13-fb8b-44fd-9a8c-460a36998902}

> 难度：2 · 类型：QA

### 题目要点

### computed 计算属性

- **定义**：基于其他响应式数据计算得出新值。
- **特点**：
  - **缓存**：依赖数据不变时，不会重新计算，直接使用缓存结果。
  - **高效**：只有相关数据变化时才会重新计算。
  - **读写分离**：具有getter和setter方法，可以分别处理读取和设置操作。
- **使用场景**：用于模板内的复杂逻辑计算。

### watch 监听属性

- **定义**：用于观察和响应Vue实例上的数据变动。
- **特点**：
  - **实时性**：数据变化时立即执行回调函数。
  - **异步操作**：适合执行数据变化后的异步操作。
  - **深度监听**：可以监听对象内部属性的变化。
- **使用场景**：用于数据变化后执行的业务逻辑，特别是异步操作。

### 区别

- **缓存**：computed有缓存，watch没有。
- **使用方式**：computed更侧重于计算得出新值，watch更侧重于观察变化后执行操作。
- **场景**：computed适合计算密集型操作，watch适合观察变化后执行的业务逻辑。

<details>
<summary>参考答案</summary>

computed 和 watch看似都能实现对数据的监听，但还是有区别。

以下通过一个小栗子来理解一下这两者的区别。

## **computed 计算属性**<br>

计算属性基于 data 中声明过或者父组件传递的 props 中的数据通过计算得到的一个**新值**，这个新值只会根据已知值的变化而变化，简言之：这个属性依赖其他属性，由**其他属性计算而来**的。

```js
<p>姓名：{{ fullName }}</p>
... ...
data: {
    firstName: 'David',
    lastName: 'Beckham'
},
computed: {
    fullName: function() { //方法的返回值作为属性值
            return this.firstName + ' ' + this.lastName
    }
}
```

在 computed 属性对象中定义计算属性的方法，和取data对象里的数据属性一样以**属性访问**的形式调用，即在页面中使用 {{ 方法名 }} 来显示计算的结果。

**注**：计算属性 fullName 不能在 data 中定义，而计算属性值的相关已知值在data中；<br>
如果 fullName 在 data 中定义了会报错如下图：

![image.png](https://static.ecool.fun//article/6900ccea-aa97-463e-ae1f-bd6682dcc000.png)

因为如果 computed 属性值是一个函数，那么默认会走 get 方法，必须要有一个返回值，函数的返回值就是属性的属性值。计算属性定义了 fullName 并返回对应的结果给这个变量，变量不可被重复定义和赋值。

在官方文档中，还强调了 computed 一个重要的特点，就是 **computed 带有缓存功能**。比如我在页面中多次显示 fullName：

```js
<p>姓名：{{ fullName }}</p>
<p>姓名：{{ fullName }}</p>
<p>姓名：{{ fullName }}</p>
<p>姓名：{{ fullName }}</p>
<p>姓名：{{ fullName }}</p>
... ...

computed: {
    fullName: function () {
         console.log('computed') // 在控制台只打印了一次
         return this.firstName + ' ' + this.lastName
    }
}
```

我们知道 computed 内定义的 function 只执行一次，仅当初始化显示或者相关的 data、props 等属性数据发生变化的时候调用；<br>
而 computed 属性值默认会缓存计算结果，计算属性是基于它们的响应式依赖进行缓存的；<br>
只有当 computed 属性被使用后，才会执行 computed 的代码，在重复的调用中，只要依赖数据不变，直接取缓存中的计算结果。只有**依赖型数据**发生**改变**，computed 才会重新计算。

## **计算属性的高级**：<br>
 在computed 中的属性都有一个 **get** 和一个 **set** 方法，当数据变化时，调用 set 方法。下面我们通过计算属性的 getter/setter 方法来实现对属性数据的显示和监视，即双向绑定。

```js
computed: {
    fullName: {
        get() { //读取当前属性值的回调，根据相关的数据计算并返回当前属性的值
            return this.firstName + ' ' + this.lastName
        },
        set(val) { // 当属性值发生改变时回调，更新相关的属性数据，val就是fullName的最新属性值
            const names = val ? val.split(' ') : [];
            this.firstName = names[0]
            this.lastName = names[1]
        }
    }
}
```

## **watch 监听属性**<br>

通过 vm 对象的 $watch() 或 watch 配置来监听 Vue 实例上的属性变化，或某些特定数据的变化，然后执行某些具体的业务逻辑操作。当属性变化时，回调函数自动调用，在函数内部进行计算。其可以监听的数据来源：data，props，computed 内的数据。

以上示例通过 watch 来实现：

```js
watch: {
    // 监听 data 中的 firstName，如果发生了变化，就把变化的值给 data 中的 fullName， val 就是 firstName 的最新值
    firstName: function(val) {
        this.fullName = val + ' ' + this.lastName
    },
    lastName: function(val) {
        this.fullName = this.firstName + ' ' + val
    }
}
// 由上可以看出 watch 要监听两个数据，而且代码是同类型的重复的，所以相比用 computed 更简洁
```

**注：** 监听函数有两个参数，第一个参数是最新的值，第二个参数是输入之前的值，顺序一定是**新值，旧值**，如果只写一个参数，那就是最新属性值。

在使用时选择 watch 还是 computed，还有一个参考点就是官网说的：当需要在数据变化时执行异步或开销较大的操作时，watch方式是最有用的。所以 watch 一定是**支持异步**的。

上面仅限监听简单数据类型，监听复杂数据类型就需要用到深度监听 deep。<br>

**deep：**为了发现对象内部值的变化，可以在选项参数中指定 deep: true。注意监听数组的变更不需要这么做。

```js
data: {
    fullName: {
        firstName: 'David',
        lastName: 'Beckham'
    }
},
watch: {
    fullName: {
        handler(newVal, oldVal) {
            console.log(newVal);
            console.log(oldVal);
        },
        deep: true
    }
}
```

以上打印结果：<br>

![image.png](https://static.ecool.fun//article/24940fc3-0709-4fa1-8fec-b21eafef35c3.png)

打印出来的 newVal 和 oldVal 值是一样的，所以深度监听虽然可以监听到对象的变化，但是无法监听到对象里面哪个具体属性的变化。这是因为它们的引用指向同一个对象/数组。Vue 不会保留变更之前值的副本。

若果要监听对象的单个属性的变化，有两种方法：<br>
1.直接监听对象的属性

```js
watch:{
    fullName.firstName: function(newVal,oldVal){
        console.log(newVal,oldVal);
    }
}
```

2.与 computed 属性配合使用，computed 返回想要监听的属性值，watch 用来监听

```js
computed: {
    firstNameChange() {
    return this.fullName.firstName
    }
},
watch: {
    firstNameChange() {
        console.log(this.fullName)
    }
}
```

## **总结：**

**watch和computed都是以Vue的依赖追踪机制为基础**的，当某一个依赖型数据（依赖型数据：简单理解即放在 data 等对象下的实例数据）发生变化的时候，所有依赖这个数据的相关数据会自动发生变化，即自动调用相关的函数，来实现数据的变动。

**当依赖的值变化时，在watch中，是可以做一些复杂的操作的，而computed中的依赖，仅仅是一个值依赖于另一个值，是值上的依赖。**

### 应用场景：<br>
 computed：用于处理复杂的逻辑运算；一个数据受一个或多个数据影响；用来处理watch和methods无法处理的，或处理起来不方便的情况。例如处理模板中的复杂表达式、购物车里面的商品数量和总金额之间的变化关系等。<br>
 watch：用来处理当一个属性发生变化时，需要执行某些具体的业务逻辑操作，或要在数据变化时执行异步或开销较大的操作；一个数据改变影响多个数据。例如用来监控路由、inpurt 输入框值的特殊处理等。

### 区别：

#### **computed**

* 初始化显示或者相关的 data、props 等属性数据发生变化的时候调用；
* 计算属性不在 data 中，它是基于data 或 props 中的数据通过计算得到的一个新值，这个新值根据已知值的变化而变化；
* 在 computed 属性对象中定义计算属性的方法，和取data对象里的数据属性一样，以属性访问的形式调用；
* 如果 computed 属性值是函数，那么默认会走 get 方法，必须要有一个返回值，函数的返回值就是属性的属性值；
* computed 属性值默认会**缓存**计算结果，在重复的调用中，只要依赖数据不变，直接取缓存中的计算结果，只有**依赖型数据**发生**改变**，computed 才会重新计算；
* 在computed中的，属性都有一个 get 和一个 set 方法，当数据变化时，调用 set 方法。

#### **watch**

* 主要用来监听某些特定数据的变化，从而进行某些具体的业务逻辑操作，可以看作是 computed 和 methods 的结合体；
* 可以监听的数据来源：data，props，computed内的数据；
* watch**支持异步**；
* **不支持缓存**，监听的数据改变，直接会触发相应的操作；
* 监听函数有两个参数，第一个参数是最新的值，第二个参数是输入之前的值，顺序一定是新值，旧值。

</details>

## 82. vue-loader做了哪些事情？ {#question-d32689f1-49ec-4eae-97f4-583fe5362c3b}

> 难度：3 · 类型：QA

### 题目要点

vue-loader主要做了以下几件事：

1. **解析Vue单文件组件**：将`.vue`文件中的模板、脚本、样式分别处理，模板编译成渲染函数，脚本和样式转换成可执行的JavaScript和CSS。

2. **支持预处理器**：允许使用如Pug、SCSS等预处理器编写模板和样式，通过webpack配置相应loader来处理这些预处理器。

3. **开发环境优化**：提供热重载功能，让开发者在修改`.vue`文件时能实时预览效果，无需手动刷新。

4. **模块化组件**：封装Vue组件的模板、脚本、样式为一个文件，支持组件间的嵌套和组合，提升代码可维护性和重用性。

5. **动态加载**：支持异步加载组件，提高应用性能和加载速度。

<details>
<summary>参考答案</summary>

## vue-loader 的使用配置

使用 **vue-loader** 的之前， 我们需要安装一些必要的 **loader**。。

必需的 **loader** 包括：**vue-loader**、**vue-style-loader**、**vue-template-compiler**、**css-loader**。 可能需要的 **loader** 包含：**sass-loader**、**less-loader**、**url-loader** 等。

一个包含 **vue-loader** 的简单 **webpack配置** 如下：

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const isProduction = process.env.NODE_ENV === 'production'
const extractLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
        publicPath: '../',
        hmr: process.env.NODE_ENV === 'development'
    },
}
const cssExtractplugin = new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
    ignoreOrder: false
})
const webpackConfig = {
    entry: {...},
    output: {...},
    optimization: {...},
    resolve: {...},
    modules: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.css$/,
            oneOf: [{
                resourceQuery: /\?vue/,
                use: [isProduction ? extractLoader  : 'vue-style-loader', 'css-loader']
            }, {
                use: [isProduction ? extractLoader  : 'style-loader', 'css-loader']
            }]
        },
        ...
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        isProduction ? cssExtractplugin : ''
    ]

}


```

注意，当使用的 **vue-loader** 版本为 **15.x.x** 时， 必须使用 **vue-loader** 提供的 **VueLoaderPlugin**。

### vue-loader 工作原理

通过 **vue-loader**， **webpack** 可以将 **.vue 文件** 转化为 **浏览器可识别的javascript**。

**vue-loader** 的工作流程， 简单来说，分为以下几个步骤:

1. 将一个 **.vue 文件** 切割成 **template**、**script**、**styles** 三个部分。
2. **template 部分** 通过 **compile** 生成 **render**、 **staticRenderFns**。
3. 获取 **script 部分** 返回的配置项对象 **scriptExports**。
4. **styles 部分**，会通过 **css-loader**、**vue-style-loader**， 添加到 **head** 中， 或者通过 **css-loader**、**MiniCssExtractPlugin** 提取到一个 **公共的css文件** 中。
5. 使用 **vue-loader** 提供的 **normalizeComponent** 方法， **合并 scriptExports、render、staticRenderFns**， 返回 **构建vue组件需要的配置项对象 - options**， 即 **{data, props, methods, render, staticRenderFns...}**。

通过 **vue-loader** 生成的 **js 文件** 如下:

```
// 从 template区域块 获取 render、 staticRenderFns 方法
import { render, staticRenderFns } from "./App.vue?vue&type=template&id=7ba5bd90&scoped=true&"
// 从 script区域块 获取 组件的配置项对象
import script from "./App.vue?vue&type=script&lang=js&"
export * from "./App.vue?vue&type=script&lang=js&"
// 获取 styles区域块的内容
import style0 from "./App.vue?vue&type=style&index=0&lang=css&"
// 获取 styles(scoped)区域块的内容
import style1 from "./App.vue?vue&type=style&index=1&id=7ba5bd90&scoped=true&lang=css&"


/* normalize component */
import normalizer from "!../node_modules/_vue-loader@15.7.1@vue-loader/lib/runtime/componentNormalizer.js"
// 返回构建组件需要的配置项对象， 包含 data、props、render、staticRenderFns 等
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  null,
  "7ba5bd90",
  null

)

component.options.__file = "src/App.vue"
// 输出组件完整的配置项
export default component.exports

```

### css scoped

当 **.vue 文件** 中的 **style 标签** 有 **scoped** 属性时，它的 **css 样式** 只作用于当前 **组件** 中的 **元素**。

**css scoped** 的 **工作流程** 如下:

1. 使用 **vue-loader** 处理 **.vue** 文件， 根据 **.vue 文件** 的 **请求路径** 和 **文件内容**， 生成 **.vue 文件** 的 **hash** 值, 如：**7ba5bd90**；
2. 如果 **.vue 文件** 的 **某一个 style 标签** 有 **scoped** 属性， 为 **.vue 文件** 生成一个 **scopedId**，**scopedId** 的格式为 **data-v-hash**， 如：**data-v-7ba5bd90**；
3. 使用 **vue-loader** 从 **.vue 文件** 中获取 **style区域块(scoped)** 的 **样式内容(字符串)**；如果使用了 **less** 或者 **sass**， 要使用 **less-loader** 或者 **sass-loader** 处理 **样式内容**，使 **样式内容** 变为 **浏览器可识别的css样式**； 然后使用 **PostCSS** 提供的 **parser** 处理 **样式内容**， 为 **样式内容** 中的每一个 **css选择器** 添加 **\[data-v-hash\]**； 再使用 **css-loader**；最后使用 **style-loader** 把 **css 样式** 添加到 **head** 中或者通过 **miniCssExtractPlugin** 将 **css 样式** 提取一个公共的 **css** 文件中。
4. 通过 **normalizer** 方法返回 **完整的组件配置项 options**， **options** 中有属性 **\_scopeId**, 如 **\_scopedId: data-v-7ba5bd90**;
5. 使用 **组件配置项 options** 构建组件实例， 给 **组件** 中每一个 **dom元素** 添加属性: **data-v-hash**。

经历上述过程，**style(scoped)** 中的样式就变成了 **组件的私有样式**。

### 深度作用选择器

我们可以通过 **\>>>** 操作符， 在 **组件** 中修改 **子组件** 的 **私有样式**。

```
// child component
.hello {...}

// parent component
<style scoped>
    .parant .hello {...}
    .parent >>> .hello {...}
</style>

// 进过 postCSS 处理以后的 css
.parent .hello[data-v-xxx] {...}  // 无法影响子组件

.parant[data-v-xxx] .hello {....} // 可影响子组件

```

有些像 **Sass** 之类的 **预处理器** 无法 **正确解析 >>>**。这种情况下我们可以使用 **/deep/** 或 **::v-deep** 操作符取而代之，两者都是 **\>>>** 的 **别名**，同样可以正常工作。

**深度作用选择器， 必须在含有 scoped 属性 的 style 标签中使用，否则无效**。 这是因为 **\>>>、/deep/、::v-deep** 需要被 **postCSS** 解析才能起作用。 只有 **style 标签** 中有 **scoped 属性**， **样式内容** 才会被 **postCSS** 解析。

**postCSS** 解析样式内容的时候， 会给 **\>>**\> 操作符 **前面** 的 **css选择器** 添加 **\[data-v-hash\]**。

> 注意： **父组件** 中修改 **子组件** 的 **私有样式** 时， **父组件** 中的 **样式的优先级** 要大于 **子组件** 中的 **样式的优先级**， 否则会导致 **父组件中定义的样式不生效**。

### CSS Modules

我们也可以在 **.vue 文件** 的 **style 标签** 上添加 **module 属性**， 使得 **style 标签** 中的 **样式** 变为 **组件私有**，具体使用方法详见 - [官网](https://vue-loader.vuejs.org/zh/guide/css-modules.html#%E7%94%A8%E6%B3%95)。

**css modules** 和 **css scoped** 都可以使 **样式** 变为 **组件私有**，但是 **原理** 不一样。

**css scoped** 的实质是利用 **css属性选择器** 使得 **样式** 称为 **局部样式**，而 **css modules** 的实质是让 **样式的类名、id名唯一** 使得 **样式** 称为 **局部样式**。

**css modules** 的 **工作流程** 如下:

1. 使用 **vue-loader** 处理 **.vue** 文件， 将 **.vue 文件内容** 转化为 **js 代码**。 如果 **.vue 文件** 中的 **style 标签** 中有 **module** 属性， 向 **js 代码** 中注入一个 **injectStyle** 方法， 如下：<br>
```
import { render, staticRenderFns } from "./App.vue?vue&type=template&id=3512ffa2&scoped=true&"
import script from "./App.vue?vue&type=script&lang=js&"
export * from "./App.vue?vue&type=script&lang=js&"
import style0 from "./App.vue?vue&type=style&index=0&module=a&lang=css&"
import style1 from "./App.vue?vue&type=style&index=1&id=3512ffa2&module=true&scoped=true&lang=css&"
// 通过injectStyle方法， 会向vue实例中添加属性
function injectStyles (context) {
    // 对应 <style module="a">...</style>
    // 给vue实例添加属性a， 对应的值为使用css-loader处理样式内容以后返回的对象
    this["a"] = (style0.locals || style0)
    // 对应 <style module>...</style>
    // 给vue实例添加属性$style, 对应的值为使用css-loader处理样式内容以后返回的对象
    this["$style"] = (style1.locals || style1)
}
/* normalize component */
import normalizer from "!../node_modules/_vue-loader@15.7.1@vue-loader/lib/runtime/componentNormalizer.js"
// normalize 会返回一个组件完整配置项对象
// 在执行过程中， 会将render方法重新包装成 renderWithStyleInjection 方法
// 执行 renderWithStyleInjection 方法时的时候， 先执行 injectStyles 方法， 再执行 原来的render 方法
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  injectStyles,
  "3512ffa2",
  null

)
export default component.exports"
```
2. 使用 **css-loader** 处理 **.vue 文件** 的 **style 区域块**，会将 **style 区域块** 中的样式内容， 转化为 **js 代码**， 如下:<br>
```
exports = module.exports = require("../node_modules/_css-loader@3.2.0@css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.id, "\n#_3cl756BP8kssTYTEsON-Ao {\n  font-family: 'Avenir', Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-align: center;\n  color: #2c3e50;\n  margin-top: 60px;\n}\n._3IbrnaW__7RJMXk4rh9tW- {\n  background-color: blue;\n}\n", ""]);
// Exports
exports.locals = {
    // app是id名
    "app": "_3cl756BP8kssTYTEsON-Ao",
    // class 是 类名
    "class1": "_3IbrnaW__7RJMXk4rh9tW-"
}
```
在处理过程中， **css-loader** 会将样式中的 **类名**、**id名** 等用一个 **唯一的命名代替**。<br>
在执行 **步骤1** 的代码时，会执行上面的代码， 返回一个 **对象**， 即 **步骤一** 中的 **style0** 、**style1**， 格式如下:<br>
```
// css样式内容会通过 style-loader 提供的方法添加到 head 中
// 或者被 miniCssExtractPlugin 提取到一个 公共的css文件 中
style0 = [[css模块 id, css样式内容字符串, ''], ...]
style0.locals = {
    "app": "_3cl756BP8kssTYTEsON-Ao",
    "class1": "_3IbrnaW__7RJMXk4rh9tW-"
}
```
3. **运行项目执行打包以后的js代码**， 即 **步骤1中的代码**， 获取 **render**、**staticRenderFns**、**scriptExprots**、 **style0**、**style1**， 然后通过 **normalizer** 方法返回 **组件完整配置项 - options**。 在执行过程中，将 **render** 方法重新包装成 **renderWithStyleInjection** 方法。<br>
构建 **vue 实例** 时，执行 **renderWithStyleInjection** 方法， 此时会 **先** 执行 **injectStyles** 方法，给 **vue 实例** 添加 **$style**、**a** 属性，属性值为 **stlye0.locals**、**style1.locals**， 再执行原来的 **render** 方法。<br>
这样， 我们就可以通过 **vue 实例** 的 **$styl**e、**a** 属性访问 **样式** 的 **类名**、**id**名。

### 热更新

**开发模式** 下，当使用 **vue-loader**、 **vue-style-loader** 处理 **.vue 文件** 的时候， 会向 **生成的js代码** 中注入与 **热更新** 相关的代码逻辑。 当我们修改 **.vue 文件** 时， **dev-server** 会通知 **浏览器** 进行 **热更新**。

**.vue 文件** 的 **各个区域块(template、script、styles)** 对应的 **热更新逻辑** 都不一样。

* #### template & script<br>
**vue-loader** 会在 **打包代码** 中注入 **热更新 template、script 区域块** 的代码，如下:<br>
```
// 从 template区域块 获取 render、 staticRenderFns 方法
import { render, staticRenderFns } from "./App.vue?vue&type=template&id=7ba5bd90&scoped=true&"
// 从 script区域块 获取 组件的配置项对象
import script from "./App.vue?vue&type=script&lang=js&"
export * from "./App.vue?vue&type=script&lang=js&"
// 获取 styles区域块的内容
import style0 from "./App.vue?vue&type=style&index=0&lang=css&"
// 获取 styles(scoped)区域块的内容
import style1 from "./App.vue?vue&type=style&index=1&id=7ba5bd90&scoped=true&lang=css&"
/* normalize component */
import normalizer from "!../node_modules/_vue-loader@15.7.1@vue-loader/lib/runtime/componentNormalizer.js"
// 返回构建组件需要的配置项对象， 包含 data、props、render、staticRenderFns 等
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  null,
  "7ba5bd90",
  null

)
/* hot reload */
// .vue 文件的 script 区域块更改时， 客户端执行这一段代码
if (module.hot) {
  var api = require("D:\\study\\demo\\webpack\\webpack-4-demo\\node_modules\\_vue-hot-reload-api@2.3.3@vue-hot-reload-api\\dist\\index.js")
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!api.isRecorded('7ba5bd90')) {
      api.createRecord('7ba5bd90', component.options)
    } else {
      // 执行 reload 方法， 触发更新
      // 使用 新的 options 替换原来的 options
      api.reload('7ba5bd90', component.options)
    }
    module.hot.accept("./App.vue?vue&type=template&id=7ba5bd90&scoped=true&", function () {
      // 当 .vue 文件的 template 区域块更改时， 客户端执行这一段代码
      // 使用新的 render、staticRenderFns 更新原来的render、staticRenderFns
      api.rerender('7ba5bd90', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  }
}
component.options.__file = "src/App.vue"
// 输出组件完整的配置项
export default component.exports
```
如果我们只修改了 **.vue 文件** 的 **script** 部分， **客户端(即浏览器)** 会进行 **热更新**， 过程如下：<br>
   1. **服务端** 通过 **websocket 连接** 通知 **客户端** 更新；<br>
   2. **客户端** 通过 **动态添加script元素** 的方式获取 **更新以后的打包文件**；<br>
   3. **安装打包文件**，即执行 **新的打包文件** 中的 **js 代码**， 使用 **打包文件中的 module 更新浏览器缓存的同名 module**；<br>
   4. **重新安装组件对应的 module**， 即 **重新执行组件对应的js代码**， 获取 **render**、**staticRenderFns** 和 新的 **scriptExports**， 重新生成 **组件** 对应的 **完整配置项**；<br>
   5. 执行 **api** 提供的 **reload** 方法， **更新组件**。<br>
   在 **reload** 方法中，会通过执行 **父组件实例** 的 **$forceUpdate** 方法来 **更新组件**。<br>
   更新组件的时候， 由于**组件** 的 **配置项(data、props、methods等属性)** 发生变化， 需要为 **组件** 生成 **新的构造函数 VueComponent**， 然后使用 **新的构造函数**，构建 **新的组件实例**。<br>
   即， 每次修改 **.vue 文件** 的 **script** 部分， 都会为 **组件** 生成一个 **新的实例对象**， **销毁旧的实例对象**。<br>
如果我们只修改了 **.vue 文件** 的 **template** 部分, **客户端(即浏览器)** 会进行 **热更新**， 过程如下：<br>
   1. **同上**，**服务端** 通过 **websocket 连接** 通知 **客户端** 更新；<br>
   2. **同上**， **客户端** 通过 **动态添加script元素** 的方式获取 **更新以后的打包文件**；<br>
   3. **同上**， **安装打包文件**，即执行 **新的打包文件** 中的 **js 代码**， 使用 **打包文件中的 module 更新浏览器缓存的同名 module**；<br>
   4. 触发通过 **module.hot.accept** 注册的 **callback**；<br>
   5. 执行 **api** 提供的 **rerender** 方法， **更新组件**。<br>
   执行 **rerender** 方法时， 会先获取 **修改以后的template区域块** 对应的 **render**、**staticRenderFns**， 然后 **更新原组件的 render、staticRenderFns**， 然后执行 **组件实例** 的 **$forceUpdate** 方法来更新 **组件(更新组件的时候， 会使用新的render方法， 生成新的vnode节点树)**。<br>
如果我们 **同时** 修改了 **.vue 文件**的 **template**、 **script**部分， 会按照上面 **第一种情况** 进行 **热更新**，并且不会触发上面代码中通过 **module.hot.accept** 注册的 **callback**。
* #### style<br>
**vue-style-loader** 会在 **打包代码** 中注入 **热更新 style区域块** 的代码， 如下:<br>
```
...
var add = require("!../node_modules/_vue-style-loader@4.1.2@vue-style-loader/lib/addStylesClient.js").default
var update = add("05835b6f", content, false, {});
// Hot Module Replacement
if(module.hot) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../node_modules/_css-loader@3.1.0@css-loader/dist/cjs.js!../node_modules/_vue-loader@15.7.1@vue-loader/lib/loaders/stylePostLoader.js!../node_modules/_vue-loader@15.7.1@vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=style&index=0&lang=css&", function() {
     // 当 .vue 文件的 styles 区域块更改时， 客户端执行这一段代码
     var newContent = require("!!../node_modules/_css-loader@3.1.0@css-loader/dist/cjs.js!../node_modules/_vue-loader@15.7.1@vue-loader/lib/loaders/stylePostLoader.js!../node_modules/_vue-loader@15.7.1@vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=style&index=0&lang=css&");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     // 执行update方法， 更新styles
     update(newContent);
   });
 }
}
...
```
如果我们修改了 **.vue 文件** 的 **styles 区域块**，**客户端(即浏览器)** 会进行 **热更新**， 过程如下：<br>
   1. 同上，**服务端** 通过 **websocket 连接** 通知 **客户端** 更新；<br>
   2. 同上，**客户端** 通过 **动态添加script元素** 的方式获取 **更新以后的打包文件**；<br>
   3. 同上，**安装打包文件**，即执行 **新的打包文件** 中的 **js 代码**， 使用 **打包文件中的 module 更新浏览器缓存的同名 module**;<br>
   4. 触发通过 **module.hot.accept** 注册的 **callback**；<br>
   5. 执行 **update** 方法， **更新样式**。<br>
   **更新样式** 的时候， 会先 **移除原来的 style 标签**， 然后 **添加新的 style 标签**。<br>
如果 **style 标签** 上有 **module 属性**，除了 **vue-style-loader** 会注入 **热更新代码** 外，**vue-loader** 也会在 **打包代码** 中注入 **热更新代码**，如下:<br>
```
    // 热更新代码
    module.hot && module.hot.accept(["./App.vue?vue&type=style&index=1&id=7ba5bd90&module=true&scoped=true&lang=css&"], function () {
      // 当.vue的style区域块发生变化， 且style标签有module属性， 执行这一段逻辑
      var oldLocals = cssModules["$style"]
      if (oldLocals) {
        // 获取新的唯一类名、id名
        var newLocals = require("./App.vue?vue&type=style&index=1&id=7ba5bd90&module=true&scoped=true&lang=css&")
        if (JSON.stringify(newLocals) !== JSON.stringify(oldLocals)) {
          // 更新vue实例的$style属性
          cssModules["$style"] = newLocals
          // 执行vue实例的 $forceUpdate 方法，重新执行 render 方法
          require("D:\\study\\demo\\webpack\\webpack-4-demo\\node_modules\\_vue-hot-reload-api@2.3.3@vue-hot-reload-api\\dist\\index.js").rerender("7ba5bd90")
        }
      }
    })
```
执行上述 **热更新代码**， 会 **更新 vue实例 的 $style 属性**， 然后触发 **vue 实例** 的 **$forceUpdate** 方法， **重新渲染**。<br>
一个 **style 区域块** 对应一个 **style 标签**。修改某一个 **style 区域块** 之后，会更新对应的 **style 标签**。<br>
**style 区域块** 的 **热更新** 和 **template**、**script 区域块**的 **热更新** 互不影响。

### tree shaking 副作用

**生产模式** 下， **webpack** 默认启用 **tree shaking**。如果此时项目 **根目录** 中的 **package.json** 中的 **sideEffects** 的值为 **false**，且 **.vue 文件** 的 **style 标签** 没有 **module 属性**，使用 **vue-loader** 处理 **.vue 文件** 的时候， 会产生 **样式丢失** 的情况，即 **styles 区域块 不会添加到 head 中或者 被提取到公共的css文件中**。

首先，先看一下 **.vue 文件** 经过处理以后生成的 **js代码**， 如下:

```
// 从 template区域块 获取 render、 staticRenderFns 方法
import { render, staticRenderFns } from "./App.vue?vue&type=template&id=7ba5bd90&scoped=true&"
// 从 script区域块 获取 组件的配置项对象
import scriptExports from "./App.vue?vue&type=script&lang=js&"
export * from "./App.vue?vue&type=script&lang=js&"
// 获取 styles区域块的内容
import style0 from "./App.vue?vue&type=style&index=0&lang=css&"
// 获取 styles(scoped)区域块的内容
import style1 from "./App.vue?vue&type=style&index=1&id=7ba5bd90&scoped=true&lang=css&"


/* normalize component */
import normalizer from "!../node_modules/_vue-loader@15.7.1@vue-loader/lib/runtime/componentNormalizer.js"
// 返回构建组件需要的配置项对象， 包含 data、props、render、staticRenderFns 等
var component = normalizer(
  scriptExports,
  render,
  staticRenderFns,
  false,
  null,
  "7ba5bd90",
  null

)

component.options.__file = "src/App.vue"
// 输出组件完整的配置项
export default component.exports

```

在上面的代码中，**template 区域块** 返回的 **render**、**staticRenderFns**， **script 区域块** 返回的 **scriptExports**， 都有被 **normalizer** 方法使用， 而 **styles 区域块** 返回的 **style0**、**style1** 则没有被使用。 在 **打包代码** 的时候， **tree shaking** 就会自动移除 **styles 区域块** 对应的代码，导致 **样式丢失**。

**解决方法**:

1. 修改 **package.json** 文件中的 **sideEffects 属性**， 告诉 **webpack** **.vue 文件**在使用 **tree shaking** 的时候会有 **副作用**， 如下:<br>
```
"sideEffects": [
    "*.vue"
 ]
```
有了上述配置， **webpack** 在处理 **.vue** 文件的时候， 不会使用 **tree shaking**， **不会出现样式丢失的问题**。<br>
但是这种解决方法有一个问题， 如果 **script 区域块** 中通过 **import** 的方式引入了 **未使用的模块**，**未使用的模块在最后打包代码的时候不会被删除**。
2. 通过 **rule.sideEffects** 指定 **具体的模块** 在使用 **tree shaking** 的时候会有 **副作用**， 如下:<br>
```
    // webpackConfig：
    {
        test: /\.css$/,
        oneOf: [{
            resourceQuery: /\?vue/,
            // 指定.vue文件的 style区域块 使用 tree shaking 时会有副作用
            sideEffects: true,
            use: [isProduction ? MiniCssExtractPlugin.loader  : 'vue-style-loader', 'css-loader']
        }, {
            use: [isProduction ? MiniCssExtractPlugin.loader  : 'style-loader', 'css-loader']
        }]
    },
    {
        test: /\.scss$/,
        oneOf: [{
            resourceQuery: /\?vue/,
            // 指定.vue文件的 style(lang=scss)区域块 使用 tree shaking 时会有副作用
            sideEffects: true,
            use: [isProduction ? MiniCssExtractPlugin.loader  : 'vue-style-loader', 'css-loader', 'sass-loader']
        }, {
            use: [isProduction ? MiniCssExtractPlugin.loader  : 'style-loader', 'css-loader', 'sass-loader']
        }]
    }

    // package.json
    {
        sideEffects: false
    }
```
上述配置， 明确说明了 **.vue 文件** 的 **style 区域块** 在使用 **tree shaking** 的时候， 会有 **副作用**，**在打包的时候不会删除**。<br>
这样的话，样式不会丢失， 并且如果 **script 区域块** 中通过 **import** 的方式引入了 **未使用的模块**，**未使用的模块在最后打包代码的时候会被删除**

</details>

## 83. Vue 中，假设 data 中有一个数组对象，修改数组元素时，是否会触发视图更新？ {#question-e9f00b7b-d638-4d98-8166-7f056fb2b6a1}

> 难度：1.5 · 类型：QA

### 题目要点

在Vue中，直接通过索引修改数组元素（如`vm.items[index] = newValue`）不会立即触发视图更新，因为Vue的响应式系统默认不追踪这种变化。为了触发更新，应使用Vue提供的方法如`Vue.set`（Vue 2.x）或`this.$set`（Vue 2.x和Vue 3.x），或使用Vue重写的数组方法（如`splice`、`push`等）。这些方法会确保Vue能够检测到数组的变化，并触发视图更新。

<details>
<summary>参考答案</summary>

在Vue中，数组元素的修改与视图更新的关系是一个重要且常见的关注点。Vue的响应式系统基于ES5的`Object.defineProperty`（Vue 2.x）或Proxy（Vue 3.x）来实现，它允许Vue追踪数据的变化，并在数据变化时自动更新视图。然而，对于数组，Vue的响应式系统有一些特定的规则和限制。

### 直接通过索引修改数组元素

当你直接通过索引修改数组元素时（如`vm.items[index] = newValue`），Vue的响应式系统默认情况下无法检测到这种变化，因此不会触发视图更新。这是因为Vue在初始化时，仅对数组的长度和特定的索引访问进行了拦截，但并未拦截通过索引直接设置元素的操作。

### 如何触发视图更新

为了在修改数组元素后触发视图更新，Vue提供了几种方法：

1. **使用`Vue.set`或`vm.$set`方法**：
   这两个方法都是Vue提供的，用于向响应式对象中添加属性，并确保新属性也是响应式的，同时触发视图更新。对于数组，你可以将索引作为第二个参数来使用这两个方法。

   ```javascript
   Vue.set(vm.items, index, newValue)
   // 或者
   this.$set(this.items, index, newValue)
   ```

   这样，Vue就会检测到数组元素的变化，并触发相应的视图更新。

2. **使用Vue重写的数组方法**：
   Vue重写了数组的一些方法（如`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`等），以便在调用这些方法时能够触发视图更新。因此，你可以使用这些方法来修改数组，并确保视图能够响应这些变化。

   ```javascript
   this.items.splice(index, 1, newValue)
   // 或者
   this.items.push(newValue) // 如果是在数组末尾添加元素
   ```

   使用这些方法修改数组时，Vue的响应式系统会检测到数组的变化，并自动更新视图。

### 注意事项

- 在Vue 3.x中，由于引入了Proxy作为响应式系统的核心，Vue能够更全面地拦截数组的变化，包括通过索引直接设置元素的操作。然而，出于兼容性和性能考虑，Vue 3.x仍然推荐使用上述方法来修改数组。
- 直接修改数组的长度（如`vm.items.length = newLength`）也不会触发视图更新。如果你需要修改数组的长度，并希望触发视图更新，可以使用`splice`方法或其他Vue重写的数组方法。
- 异步更新队列：Vue是异步执行DOM更新的。这意味着当你修改数据后，DOM不会立即更新。Vue会在下一个“事件循环”更新DOM。如果你需要等待DOM更新完成后再执行某些操作，可以使用`Vue.nextTick`（Vue 2.x和Vue 3.x）或`this.$nextTick`（Vue 2.x和Vue 3.x）方法。

综上所述，为了确保在修改数组元素后能够触发视图更新，建议使用Vue提供的方法或重写的数组方法来修改数组。这样可以确保Vue的响应式系统能够检测到数组的变化，并自动更新视图。

</details>

## 84. vuex中的辅助函数怎么使用？ {#question-b3e35cf9-1939-4c79-8415-8168c5532779}

> 难度：2 · 类型：QA

### 题目要点

Vuex 辅助函数是用于简化 Vuex 状态管理和方法调用的语法糖。这些函数可以将 Vuex 状态和操作映射到 Vue 组件中，从而简化代码，提高开发效率。

辅助函数包括：

1. **mapState**：将 Vuex 状态映射到组件的计算属性上。
2. **mapGetters**：将 Vuex 计算属性（getters）映射到组件的计算属性上。
3. **mapMutations**：将 Vuex 方法（mutations）映射到组件的方法（methods）上。
4. **mapActions**：将 Vuex 方法（actions）映射到组件的方法（methods）上。
使用这些辅助函数，可以在组件中直接使用映射后的属性和方法，而不需要每次都手动调用 Vuex 的方法。

辅助函数的使用方式是在组件的 `computed` 或 `methods` 对象中通过 `...` 语法引入，并将映射关系作为参数传递。

命名空间是 Vuex 4.0 引入的一个新特性，用于模块化 Vuex 状态管理。通过设置模块的 `namespaced: true`，可以给每个模块设置独立的命名空间，避免不同模块间状态和方法的命名冲突。

在引入命名空间后，模块内的状态和方法访问方式会发生变化，需要在模块名前加上 `/` 来访问模块内的状态和方法。

例如，如果模块名为 `todo`，那么访问模块内的状态 `inputVal` 需要写成 `this.$store.state.todo.inputVal`。

<details>
<summary>参考答案</summary>

在实际开发中，我们经常会用到 vuex 来对数据进行管理，随着数据越来越多，我们逐渐开始使用一些语法糖来帮助我们快速开发。 即 vuex 中的 mapState、mapGetters、mapMutations、mapActions 等辅助函数是我们经常使用到的。

## 辅助函数

通过辅助函数`mapState`、`mapActions`、`mapMutations`，把`vuex.store`中的属性映射到`vue`实例身上，这样在`vue`实例中就能访问`vuex.store`中的属性了，对于操作`vuex.store`就很方便了。

`state`辅助函数为`mapState`，`actions`辅助函数为`mapActions`，`mutations`辅助函数为`mapMutations`。（`Vuex`实例身上有`mapState`、`mapActions`、`mapMutations`属性，属性值都是函数）

## 如何使用辅助函数

首先，需要在当前组件中引入`Vuex`。

然后，通过Vuex来调用辅助函数。

## 辅助函数如何去映射vuex.store中的属性

### 1、mapState:把state属性映射到computed身上

```js
computed:{
  ...Vuex.mapState({
    input:state=>state.inputVal,
    n:state=>state.n
  })
}

```

`state`：用来存储公共的状态  在`state`中的数据都是响应式的。

响应式原因：`state`里面有一个`getters`、`setters`方法；`data`中的数据也是响应式的，因为里面也有`getters`和`setters`方法

在`computed`属性中来接收`state`中的数据,接收方式有2种（数组和对象，推荐对象）.

优点：

*   本身key值是别名，要的是val的值，key的值a 和 val="a"一样就行，随意写。减少state里面长的属性名。
*   可以在函数内部查看state中的数据，数组方式的话，必须按照state中的属性名。

```js
  computed:Vuex.mapState({
    key:state=>state.属性
  })
```

如果自身组件也需要使用computed的话，通过解构赋值去解构出来

```js
  computed:{
    ...Vuex.mapState({
       key:state=>state.属性
    })
  }
```

### 2、mapAcions：把actions里面的方法映射到methods中

```js
methods:{
        ...Vuex.mapActions({
            add:"handleTodoAdd",    //val为actions里面的方法名称
            change:"handleInput"
        })
    }

```

add、change为action方法别名，直接代用add和change方法就行，不过要记得在actions里面做完数据业务逻辑的操作。

等价于如下的函数调用，

```js
methods: {
    handleInput(e){
        let val = e.target.value;
        this.$store.dispatch("handleInput",val )
    },
    handleAdd(){
        this.$store.dispatch("handleTodoAdd")
    }
}

```

`actions`里面的函数主要用来处理异步的函数以及一些业务逻辑,每一个函数里面都有一个形参，这个形参是一个对象，里面有一个`commit`方法，这个方法用来触发mutations里面的方法

### 3、mapMutations：把mutations里面的方法映射到methods中

只是做简单的数据修改（例如n++），它没有涉及到数据的处理，没有用到业务逻辑或者异步函数，可以直接调用mutations里的方法修改数据。

```js
methods:{
        ...Vuex.mapMutations({
            handleAdd:"handlMutationseAdd"
        })
    }

```

`mutations`里面的函数主要用来修改`state`中的数据。`mutations`里面的所有方法都会有2个参数，一个是`store`中的`state`，另外一个是需要传递的参数。

理解`state`、`actions`、`mutations`，可以参考`MVC`框架。

*   `state`看成一个数据库，只是它是响应式的，刷新页面数据就会改变；
*   `actions`看成controller层，做数据的业务逻辑；
*   `mutations`看成model层，做数据的增删改查操作。

### 4、mapGetters:把getters属性映射到computed身上

```js
 computed:{
        ...Vuex.mapGetters({
            NumN:"NumN"
        })
    }

```

`getters`类似于组件里面`computed`，同时也监听属性的变化，当`state`中的属性发生改变的时候就会触发`getters`里面的方法。`getters`里面的每一个方法中都会有一个参数 `state`。

### 5、modules属性:  模块

把公共的状态按照模块进行划分

* 每个模块都相当于一个小型的Vuex
* 每个模块里面都会有`state` `getters` `actions` `mutations`
* 切记在导出模块的时候加一个 `namespaced:true` 主要的作用是将每个模块都有独立命名空间
* `namespace：true`在多人协作开发的时候，可能子模块和主模块中的函数名字会相同，这样在调用函数的时候，相同名字的函数都会被调用，就会发生问题。为了解决这个问题，导出模块的时候要加`namespace：true`.

那么怎么调用子模块中的函数呢？假如我的子模块名字为todo.js。 函数名字就需要改成todo/函数名字。输出模块后的store实例如下图所示：

![image.png](https://static.ecool.fun//article/00e48252-2d3b-4dd5-9a39-97112785b566.png)

可以看到模块化后，store实例的state属性的访问方式也改变了，`this.$store.state.todo.inputVal`

可以简单总结一下辅助函数通过vuex使用，比喻成映射关系为：

*   `mapState/mapGettes---&gt;computed` ；
*   `mapAcions/mapMutations----&gt;methods`

## 命名空间

模块开启命名空间后，享有独自的命名空间。示例代码如下：

```js
export default {
    namespaced: true,
    ....
}
```

`mapState`、`mapGetters`、`mapMutations`、`mapActions`第一个参数是字符串（命名空间名称），第二个参数是数组（不需要重命名）/对象（需要重命名）。

```js
mapXXXs('命名空间名称',['属性名1','属性名2'])

mapXXXs('命名空间名称',{

　　'组件中的新名称1':'Vuex中的原名称1',

　　'组件中的新名称2':'Vuex中的原名称2',

})
```

</details>

## 85. Vuex有几种属性，它们存在的意义分别是什么？ {#question-48c834b2-fe33-42ce-8a99-f25235cbbcb6}

> 难度：1.5 · 类型：QA

### 题目要点

Vuex 是一个 Vue.js 的状态管理工具，由以下五个核心概念组成：

1. **State**：存储应用程序所有状态的单一对象。
2. **Getter**：派生状态的计算属性，类似于 Vue 的 computed 属性。
3. **Mutation**：同步更改状态的唯一方法，通过提交 mutation 实现。
4. **Action**：提交 mutation 的异步操作，可以包含任意异步操作。
5. **Module**：将状态分割成模块，用于组织和管理复杂的应用状态。

<details>
<summary>参考答案</summary>

有五种，分别是 State、 Getter、Mutation 、Action、 Module。

## State

Vuex 使用单一状态树——是的，用一个对象就包含了全部的应用层级状态。至此它便作为一个“唯一数据源 (SSOT)”而存在。这也意味着，每个应用将仅仅包含一个 store 实例。单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。

State属性是Vuex的单一状态树

## Getter

有时候我们需要从 store 中的 state 中派生出一些状态，例如对列表进行过滤并计数

Getter类似于Vue的 computed 对象。是根据业务逻辑来处理State，使得生成业务所需的属性。

## Mutation

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。

Mutation是唯一用来更改Vuex中状态的方法。

## Action

Action 类似于 mutation，不同在于：

* Action 提交的是 mutation，而不是直接变更状态。
* Action 可以包含任意异步操作。

Action是用来解决异步操作而产生的，它提交的是Mutation。

## Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。
为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割

Module是将Vuex模块化的对象，目的是更好的维护。

</details>

## 86. Vuex 是什么？ {#question-35165e2d-0ef5-4c15-8b4c-a895c59216dc}

> 难度：1 · 类型：QA

### 题目要点

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

<details>
<summary>参考答案</summary>

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

简单点总结，Vuex是一种状态管理模式，存在的目的是共享可复用的组件状态。

</details>

## 87. 谈谈你对Vue中keep-alive的理解 {#question-800f499d-75d2-4f3b-9bb3-542cf21721a5}

> 难度：2.5 · 类型：QA

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

## 88. 如果使用Vue3.0实现一个 Modal，你会怎么进行设计？ {#question-977b3a64-29e7-4085-a05a-26e78bdefcea}

> 难度：3.5 · 类型：QA

### 题目要点

Vue3.0 实现一个 Modal 组件的思路和要点总结如下：

**一、组件设计**

- 组件是将各种逻辑抽象为一个统一的概念，提高开发效率，减少Bug和程序体积。
- 对于相似功能（如新增与编辑弹框），可以通过传入不同参数实现同一组件的不同显示，避免重复开发。

**二、需求分析**

- 需要实现遮罩层、标题内容、主体内容、确定和取消按钮。
- 主体内容需灵活，可以是字符串或HTML代码。
- 组件通常挂载于body之上，可通过import引入或API形式调用。
- 可配置全局样式、支持国际化、与TypeScript结合。

**三、实现流程**

- **目录结构**：合理规划组件相关文件，如Modal.vue、Content.tsx、config.ts等。
- **组件内容**：
  - 使用Vue3的Teleport组件将Modal内容传送至body。
  - 实现遮罩层、标题、内容和按钮。
  - 根据content类型显示不同内容，支持字符串、默认插槽、h函数和JSX。
- **实现API形式**：
  - 使用createVNode和render函数创建和渲染组件。
  - 通过app.config.globalProperties挂载全局API。
- **事件处理**：
  - 使用Composition API处理确定和取消事件。
  - 通过emit和_hub属性实现事件监听。

- **其他完善**：根据需求实现国际化、与TypeScript结合等功能。

<details>
<summary>参考答案</summary>

## 一、组件设计

组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式

现在有一个场景，点击新增与编辑都弹框出来进行填写，功能上大同小异，可能只是标题内容或者是显示的主体内容稍微不同

这时候就没必要写两个组件，只需要根据传入的参数不同，组件显示不同内容即可

这样，下次开发相同界面程序时就可以写更少的代码，意义着更高的开发效率，更少的 `Bug `和更少的程序体积

## 二、需求分析

实现一个`Modal`组件，首先确定需要完成的内容：

- 遮罩层

- 标题内容
- 主体内容
- 确定和取消按钮

主体内容需要灵活，所以可以是字符串，也可以是一段 `html` 代码

特点是它们在当前`vue`实例之外独立存在，通常挂载于`body`之上

除了通过引入`import`的形式，我们还可通过`API`的形式进行组件的调用

还可以包括配置全局样式、国际化、与`typeScript`结合

## 三、实现流程

首先看看大致流程：

- 目录结构
- 组件内容
- 实现 API 形式
- 事件处理

- 其他完善

### 目录结构

`Modal`组件相关的目录结构

```
├── plugins
│   └── modal
│       ├── Content.tsx // 维护 Modal 的内容，用于 h 函数和 jsx 语法
│       ├── Modal.vue // 基础组件
│       ├── config.ts // 全局默认配置
│       ├── index.ts // 入口
│       ├── locale // 国际化相关
│       │   ├── index.ts
│       │   └── lang
│       │       ├── en-US.ts
│       │       ├── zh-CN.ts
│       │       └── zh-TW.ts
│       └── modal.type.ts // ts类型声明相关
```

因为 Modal 会被 `app.use(Modal)` 调用作为一个插件，所以都放在`plugins`目录下

### 组件内容

首先实现`modal.vue`的主体显示内容大致如下

```html
<Teleport to="body" :disabled="!isTeleport">
    <div v-if="modelValue" class="modal">
        <div
             class="mask"
             :style="style"
             @click="maskClose && !loading && handleCancel()"
             ></div>
        <div class="modal__main">
            <div class="modal__title line line--b">
                <span>{{ title || t("r.title") }}</span>
                <span
                      v-if="close"
                      :title="t('r.close')"
                      class="close"
                      @click="!loading && handleCancel()"
                      >✕</span
                    >
            </div>
            <div class="modal__content">
                <Content v-if="typeof content === 'function'" :render="content" />
                <slot v-else>
                    {{ content }}
                </slot>
            </div>
            <div class="modal__btns line line--t">
                <button :disabled="loading" @click="handleConfirm">
                    <span class="loading" v-if="loading"> ❍ </span>{{ t("r.confirm") }}
                </button>
                <button @click="!loading && handleCancel()">
                    {{ t("r.cancel") }}
                </button>
            </div>
        </div>
    </div>
</Teleport>
```

最外层上通过Vue3 `Teleport` 内置组件进行包裹，其相当于传送门，将里面的内容传送至`body`之上

并且从`DOM`结构上来看，把`modal`该有的内容（遮罩层、标题、内容、底部按钮）都实现了

关于主体内容

```html
<div class="modal__content">
    <Content v-if="typeof content==='function'"
             :render="content" />
    <slot v-else>
        {{content}}
    </slot>
</div>
```

可以看到根据传入`content`的类型不同，对应显示不同得到内容

最常见的则是通过调用字符串和默认插槽的形式

```html
// 默认插槽
<Modal v-model="show"
       title="演示 slot">
    <div>hello world~</div>
</Modal>

// 字符串
<Modal v-model="show"
       title="演示 content"
       content="hello world~" />
```

通过 API 形式调用`Modal`组件的时候，`content`可以使用下面两种

- h 函数

```js
$modal.show({
  title: '演示 h 函数',
  content(h) {
    return h(
      'div',
      {
        style: 'color:red;',
        onClick: ($event: Event) => console.log('clicked', $event.target)
      },
      'hello world ~'
    );
  }
});
```

- JSX

```js
$modal.show({
  title: '演示 jsx 语法',
  content() {
    return (
      <div
        onClick={($event: Event) => console.log('clicked', $event.target)}
      >
        hello world ~
      </div>
    );
  }
});
```

### 实现 API 形式

那么组件如何实现`API`形式调用`Modal`组件呢？

在`Vue2`中，我们可以借助`Vue`实例以及`Vue.extend`的方式获得组件实例，然后挂载到`body`上

```js
import Modal from './Modal.vue';
const ComponentClass = Vue.extend(Modal);
const instance = new ComponentClass({ el: document.createElement("div") });
document.body.appendChild(instance.$el);
```

虽然`Vue3`移除了`Vue.extend`方法，但可以通过`createVNode`实现

```js
import Modal from './Modal.vue';
const container = document.createElement('div');
const vnode = createVNode(Modal);
render(vnode, container);
const instance = vnode.component;
document.body.appendChild(container);
```

在`Vue2`中，可以通过`this`的形式调用全局 API

```js
export default {
    install(vue) {
       vue.prototype.$create = create
    }
}
```

而在 Vue3 的 `setup` 中已经没有 `this `概念了，需要调用`app.config.globalProperties`挂载到全局

```js
export default {
    install(app) {
        app.config.globalProperties.$create = create
    }
}
```

### 事件处理

下面再看看看`Modal`组件内部是如何处理「确定」「取消」事件的，既然是`Vue3`，当然采用`Compositon API` 形式

```js
// Modal.vue
setup(props, ctx) {
  let instance = getCurrentInstance(); // 获得当前组件实例
  onBeforeMount(() => {
    instance._hub = {
      'on-cancel': () => {},
      'on-confirm': () => {}
    };
  });

  const handleConfirm = () => {
    ctx.emit('on-confirm');
    instance._hub['on-confirm']();
  };
  const handleCancel = () => {
    ctx.emit('on-cancel');
    ctx.emit('update:modelValue', false);
    instance._hub['on-cancel']();
  };

  return {
    handleConfirm,
    handleCancel
  };
}
```

在上面代码中，可以看得到除了使用传统`emit`的形式使父组件监听，还可通过`_hub`属性中添加 `on-cancel`，`on-confirm`方法实现在`API`中进行监听

```js
app.config.globalProperties.$modal = {
   show({}) {
     /* 监听 确定、取消 事件 */
   }
}
```

下面再来目睹下`_hub`是如何实现

```js
// index.ts
app.config.globalProperties.$modal = {
    show({
        /* 其他选项 */
        onConfirm,
        onCancel
    }) {
        /* ... */

        const { props, _hub } = instance;

        const _closeModal = () => {
            props.modelValue = false;
            container.parentNode!.removeChild(container);
        };
        // 往 _hub 新增事件的具体实现
        Object.assign(_hub, {
            async 'on-confirm'() {
            if (onConfirm) {
                const fn = onConfirm();
                // 当方法返回为 Promise
                if (fn && fn.then) {
                    try {
                        props.loading = true;
                        await fn;
                        props.loading = false;
                        _closeModal();
                    } catch (err) {
                        // 发生错误时，不关闭弹框
                        console.error(err);
                        props.loading = false;
                    }
                } else {
                    _closeModal();
                }
            } else {
                _closeModal();
            }
        },
            'on-cancel'() {
                onCancel && onCancel();
                _closeModal();
            }
    });
}
};
```

### 其他完善

关于组件实现国际化、与`typsScript`结合，大家可以根据自身情况在此基础上进行更改

</details>

## 89. 什么是虚拟DOM？ {#question-6db4a7aa-877e-4ec6-966f-3ada571e2fbf}

> 难度：1 · 类型：QA

### 题目要点

虚拟DOM（VDOM）它是真实DOM的内存表示,一种编程概念，一种模式。它会和真实的DOM同步，比如通过ReactDOM这种库，这个同步的过程叫做调和(reconcilation)。

<details>
<summary>参考答案</summary>

虚拟DOM（VDOM）它是真实DOM的内存表示,一种编程概念，一种模式。它会和真实的DOM同步，比如通过ReactDOM这种库，这个同步的过程叫做调和(reconcilation)。

虚拟DOM更多是一种模式，不是一种特定的技术。

</details>

## 90. Vue 3.0中Treeshaking特性是什么，并举例进行说明？ {#question-c1ee1a9b-5955-4dc1-a89d-2ce7b017616a}

> 难度：3 · 类型：QA

### 题目要点

Tree shaking是一种通过消除多余代码来优化项目打包体积的技术，也称为Dead code elimination。它通过在编译阶段利用ES6模块的静态特性，识别并删除未被使用的代码。

Vue3引入了tree shaking特性，使得不使用的功能不会被包含在基础包中，从而减小项目体积和提高执行效率。

在Vue2中，所有功能无论是否使用都会出现在生产代码中，而Vue3则通过模块化实现了按需引入，减少了不必要的代码。

例如，在Vue3项目中，只有当实际使用到`computed`和`watch`等功能时，它们才会被包含在打包文件中，导致文件体积增加。

Tree shaking的作用主要包括减少程序体积、减少执行时间，以及对程序架构进行优化提供了便利。通过这种方式，Vue3为开发者带来了更高效、更友好的开发体验。

<details>
<summary>参考答案</summary>

## 一、是什么

`Tree shaking` 是一种通过清除多余代码方式来优化项目打包体积的技术，专业术语叫 `Dead code elimination`

简单来讲，就是在保持代码运行结果不变的前提下，去除无用的代码

如果把代码打包比作制作蛋糕，传统的方式是把鸡蛋（带壳）全部丢进去搅拌，然后放入烤箱，最后把（没有用的）蛋壳全部挑选并剔除出去

而` treeshaking `则是一开始就把有用的蛋白蛋黄（import）放入搅拌，最后直接作出蛋糕

也就是说 ，`tree shaking` 其实是找出使用的代码

在`Vue2`中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是`Vue`实例在项目中是单例的，捆绑程序无法检测到该对象的哪些属性在代码中被使用到

```js
import Vue from 'vue'

Vue.nextTick(() => {})
```

而`Vue3`源码引入`tree shaking`特性，将全局 API 进行分块。如果您不使用其某些功能，它们将不会包含在您的基础包中

```js
import { nextTick, observable } from 'vue'

nextTick(() => {})
```

## 二、如何做

`Tree shaking`是基于`ES6`模板语法（`import`与`export`），主要是借助`ES6`模块的静态编译思想，在编译时就能确定模块的依赖关系，以及输入和输出的变量

`Tree shaking`无非就是做了两件事：

- 编译阶段利用`ES6 Module`判断哪些模块已经加载
- 判断那些模块和变量未被使用或者引用，进而删除对应代码

下面就来举个例子：

通过脚手架`vue-cli`安装`Vue2`与`Vue3`项目

```c
vue create vue-demo
```

### Vue2 项目

组件中使用`data`属性

```vue
<script>
    export default {
        data: () => ({
            count: 1,
        }),
    };
</script>
```

对项目进行打包，体积如下图

![](https://static.ecool.fun//article/e298c1f6-7390-4d24-a25a-8d93cdb45fec.png)

为组件设置其他属性（`compted`、`watch`）

```js
export default {
    data: () => ({
        question:"",
        count: 1,
    }),
    computed: {
        double: function () {
            return this.count * 2;
        },
    },
    watch: {
        question: function (newQuestion, oldQuestion) {
            this.answer = 'xxxx'
        }
};
```

再一次打包，发现打包出来的体积并没有变化

![](https://static.ecool.fun//article/a6a130d6-001e-4ef4-b347-59cdeb6b2d63.png)

### Vue3 项目

组件中简单使用

```js
import { reactive, defineComponent } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    return {
      state,
    };
  },
});
```

将项目进行打包

![](https://static.ecool.fun//article/b8da6cec-2639-4cda-a399-920d0863ebe5.png)

在组件中引入`computed`和`watch`

```js
import { reactive, defineComponent, computed, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    const double = computed(() => {
      return state.count * 2;
    });

    watch(
      () => state.count,
      (count, preCount) => {
        console.log(count);
        console.log(preCount);
      }
    );
    return {
      state,
      double,
    };
  },
});
```

再次对项目进行打包，可以看到在引入`computer`和`watch`之后，项目整体体积变大了

 ![](https://static.ecool.fun//article/fb53f810-4993-409a-b295-20ae93c11028.png)

## 三、作用

通过`Tree shaking`，`Vue3`给我们带来的好处是：

- 减少程序体积（更小）
- 减少程序执行时间（更快）
- 便于将来对程序架构进行优化（更友好）

</details>

## 91. Vue3.0 所采用的 Composition Api 与 Vue2.x 使用的 Options Api 有什么不同？ {#question-3707a3b3-2330-4833-9c9b-b427887f8ee9}

> 难度：3 · 类型：QA

### 题目要点

`Composition API`是Vue3的一个重要特性，旨在解决Vue2中代码可读性下降、复用方式不足和TypeScript支持有限的问题。

它通过以下方式改进了代码的组织和复用：

1. **逻辑组织**：与`Options API`相比，`Composition API`按逻辑功能组织代码，将相关API放在一起，提高了代码的内聚性和可维护性。在处理复杂组件时，避免了选项块的碎片化，使得代码更加集中和易于理解。

2. **逻辑复用**：在Vue2中，逻辑复用通常通过`mixins`实现，但这会导致命名冲突和数据来源不清晰。`Composition API`通过自定义hooks（如`useMove`）来复用逻辑，使得代码更加清晰，避免了命名冲突，并且对`tree-shaking`友好，有助于减少最终包的体积。

总结来说，`Composition API`在逻辑组织和复用方面优于`Options API`，提供了更好的TypeScript支持，减少了`this`的指向问题，并且在代码压缩和优化方面表现更佳。尽管如此，对于小型组件，`Options API`仍然是一个友好且有效的选择。

<details>
<summary>参考答案</summary>

## 开始之前
`Composition API` 可以说是`Vue3`的最大特点，那么为什么要推出`Composition Api`，解决了什么问题？

通常使用`Vue2`开发的项目，普遍会存在以下问题：

- 代码的可读性随着组件变大而变差
- 每一种代码复用的方式，都存在缺点
- TypeScript支持有限

以上通过使用`Composition Api`都能迎刃而解

## 正文
### 一、Options Api

`Options API`，即大家常说的选项API，即以`vue`为后缀的文件，通过定义`methods`，`computed`，`watch`，`data`等属性与方法，共同处理页面逻辑

如下图：

 ![](https://static.ecool.fun//article/0d90d923-095d-4458-bef6-a004d604e541.png)

可以看到`Options`代码编写方式，如果是组件状态，则写在`data`属性上，如果是方法，则写在`methods`属性上...

用组件的选项 (`data`、`computed`、`methods`、`watch`) 组织逻辑在大多数情况下都有效

然而，当组件变得复杂，导致对应属性的列表也会增长，这可能会导致组件难以阅读和理解

### 二、Composition Api

在 Vue3 Composition API 中，组件根据逻辑功能来组织的，一个功能所定义的所有 API 会放在一起（更加的高内聚，低耦合）

即使项目很大，功能很多，我们都能快速的定位到这个功能所用到的所有 API

 ![](https://static.ecool.fun//article/5262c66c-648b-475e-b31e-8e114ff3ce6f.png)

### 三、对比

下面对`Composition Api `与`Options Api`进行两大方面的比较

- 逻辑组织
- 逻辑复用

#### 逻辑组织

##### Options API

假设一个组件是一个大型组件，其内部有很多处理逻辑关注点（对应下图不用颜色）

 ![](https://static.ecool.fun//article/870e1f09-36ad-4ad9-9045-d2d3d453f8c8.png)

可以看到，这种碎片化使得理解和维护复杂组件变得困难

选项的分离掩盖了潜在的逻辑问题。此外，在处理单个逻辑关注点时，我们必须不断地“跳转”相关代码的选项块

##### Compostion API

而`Compositon API`正是解决上述问题，将某个逻辑关注点相关的代码全都放在一个函数里，这样当需要修改一个功能时，就不再需要在文件中跳来跳去

下面举个简单例子，将处理`count`属性相关的代码放在同一个函数了

```js
function useCount() {
    let count = ref(10);
    let double = computed(() => {
        return count.value * 2;
    });

    const handleConut = () => {
        count.value = count.value * 2;
    };

    console.log(count);

    return {
        count,
        double,
        handleConut,
    };
}
```

组件上中使用`count`

```js
export default defineComponent({
    setup() {
        const { count, double, handleConut } = useCount();
        return {
            count,
            double,
            handleConut
        }
    },
});
```

再来一张图进行对比，可以很直观地感受到 `Composition API `在逻辑组织方面的优势，以后修改一个属性功能的时候，只需要跳到控制该属性的方法中即可

![](https://static.ecool.fun//article/5f280222-fe00-4cda-8f88-32528e7c4d91.png)

#### 逻辑复用

在`Vue2`中，我们是用过`mixin`去复用相同的逻辑

下面举个例子，我们会另起一个`mixin.js`文件

```js
export const MoveMixin = {
  data() {
    return {
      x: 0,
      y: 0,
    };
  },

  methods: {
    handleKeyup(e) {
      console.log(e.code);
      // 上下左右 x y
      switch (e.code) {
        case "ArrowUp":
          this.y--;
          break;
        case "ArrowDown":
          this.y++;
          break;
        case "ArrowLeft":
          this.x--;
          break;
        case "ArrowRight":
          this.x++;
          break;
      }
    },
  },

  mounted() {
    window.addEventListener("keyup", this.handleKeyup);
  },

  unmounted() {
    window.removeEventListener("keyup", this.handleKeyup);
  },
};

```

然后在组件中使用

```js
<template>
  <div>
    Mouse position: x {{ x }} / y {{ y }}
  </div>
</template>
<script>
import mousePositionMixin from './mouse'
export default {
  mixins: [mousePositionMixin]
}
</script>
```

使用单个` mixin `似乎问题不大，但是当我们一个组件混入大量不同的 `mixins` 的时候

```js
mixins: [mousePositionMixin, fooMixin, barMixin, otherMixin]
```

会存在两个非常明显的问题：

- 命名冲突
- 数据来源不清晰

现在通过`Compositon API`这种方式改写上面的代码

```js
import { onMounted, onUnmounted, reactive } from "vue";
export function useMove() {
  const position = reactive({
    x: 0,
    y: 0,
  });

  const handleKeyup = (e) => {
    console.log(e.code);
    // 上下左右 x y
    switch (e.code) {
      case "ArrowUp":
        // y.value--;
        position.y--;
        break;
      case "ArrowDown":
        // y.value++;
        position.y++;
        break;
      case "ArrowLeft":
        // x.value--;
        position.x--;
        break;
      case "ArrowRight":
        // x.value++;
        position.x++;
        break;
    }
  };

  onMounted(() => {
    window.addEventListener("keyup", handleKeyup);
  });

  onUnmounted(() => {
    window.removeEventListener("keyup", handleKeyup);
  });

  return { position };
}
```

在组件中使用

```js
<template>
  <div>
    Mouse position: x {{ x }} / y {{ y }}
  </div>
</template>

<script>
import { useMove } from "./useMove";
import { toRefs } from "vue";
export default {
  setup() {
    const { position } = useMove();
    const { x, y } = toRefs(position);
    return {
      x,
      y,
    };

  },
};
</script>
```

可以看到，整个数据来源清晰了，即使去编写更多的 hook 函数，也不会出现命名冲突的问题

### 小结

- 在逻辑组织和逻辑复用方面，`Composition API`是优于`Options  API`
- 因为`Composition API`几乎是函数，会有更好的类型推断。
- `Composition API `对 `tree-shaking` 友好，代码也更容易压缩
- `Composition API`中见不到`this`的使用，减少了`this`指向不明的情况
- 如果是小型组件，可以继续使用`Options API`，也是十分友好的

</details>

## 92. Vue3.0里为什么要用 Proxy API 替代 defineProperty API ？ {#question-cf173a5c-bf67-4121-ad14-ed7404bc77a4}

> 难度：3.5 · 类型：QA

### 题目要点

在Vue 3.0中，使用Proxy API替代defineProperty API对响应式系统进行了性能和功能上的优化：

1. **性能提升**：Proxy API相较于defineProperty API在性能上有所提高，因为它拦截的是整个对象，而不需要像defineProperty那样遍历每个属性。

2. **更全面的拦截能力**：Proxy API提供了更广泛的拦截操作，包括但不限于属性的读取、设置、删除和枚举，以及对函数调用和构造函数实例化的拦截。

3. **更好的数组变化检测**：利用Proxy API，Vue 3.0能够更有效地检测数组变化，直接拦截数组索引的访问和修改。

4. **更易于处理嵌套对象**：Proxy API能够递归地拦截嵌套对象，而defineProperty则需要手动处理嵌套属性。

5. **更好的错误提示**：Proxy API提供了更佳的错误追踪和调试信息，使得开发过程中更容易发现和解决问题。

<details>
<summary>参考答案</summary>

在 Vue 3.0 中，使用 Proxy API 替代 defineProperty API 是为了改进响应式系统的性能和功能：

1. **性能提升**：Proxy API 比 defineProperty API 在许多情况下具有更好的性能。defineProperty 使用 Object.defineProperty 方法来拦截对象属性的访问和修改，但它需要遍历每个属性进行拦截。而 Proxy API 允许拦截整个对象，可以更高效地捕获对对象的访问和修改。

2. **更全面的拦截能力**：Proxy API 提供了更多的拦截方法，比 defineProperty API 更灵活、丰富。它支持拦截目标的各种操作，包括读取、设置、删除、枚举等，甚至还可以拦截函数调用和构造函数实例化。

3. **更好的数组变化检测**：Vue 3.0 使用 Proxy API 改善了数组的变化检测机制。Proxy 可以直接拦截数组的索引访问和修改，使得对数组的变化更容易被监听到，从而提供了更可靠的响应式行为。

4. **更易于处理嵌套对象**：Proxy API 能够递归地拦截对象的嵌套属性，而 defineProperty 无法自动递归处理嵌套对象。这使得在 Vue 3.0 中处理嵌套对象更加简单和方便。

5. **更好的错误提示**：相比于 defineProperty，Proxy API 提供了更好的错误追踪和调试信息。当使用 Proxy API 时，如果访问或修改了一个不存在的属性，会直接抛出错误，从而更容易发现和修复问题。

使用 Proxy API 取代 defineProperty API 是为了提升性能、增强功能，并提供更好的开发体验和错误提示。这些改进使得 Vue 3.0 的响应式系统更加高效、灵活和可靠。

</details>

## 93. Vue3.0 性能提升主要是通过哪几方面体现的？ {#question-9f19f171-7071-42e6-82d5-35b19bd83928}

> 难度：3 · 类型：QA

### 题目要点

在Vue 3.0中，编译阶段和源码体积都得到了优化，同时响应式系统也经历了重大改进：

#### 一、编译阶段优化

- **diff算法优化**：通过增加静态标记，Vue 3.0的diff算法只比较可能发生变化的部分，减少了不必要的比较，提高了性能。
- **静态提升**：静态节点在渲染函数外部创建并复用，减少了重复创建节点的开销，优化了内存使用。
- **事件监听缓存**：默认情况下，事件监听器会被缓存，避免了不必要的重复绑定，减少了性能开销。
- **SSR优化**：对于大量静态内容，Vue 3.0使用`createStaticVNode`在客户端生成静态节点，通过`innerHTML`直接渲染，减少了对象创建和渲染的开销。

#### 二、源码体积减小

- **Tree shaking**：得益于ES6模块的静态特性，Vue 3.0利用tree shaking技术，使得未使用的模块不会被包含在最终的打包文件中，从而减小了整体体积。

#### 三、响应式系统改进

- **Proxy API**：Vue 3.0使用Proxy API替代了Vue 2中的`defineProperty`，实现了更高效和全面的响应式系统。Proxy可以监听整个对象，而不需要深度遍历，支持动态属性添加、数组索引和长度变化，以及属性删除的监听。
- **性能提升**：由于Proxy的引入，Vue 3.0的响应式系统在性能上有所提升，且更加灵活和可靠。

<details>
<summary>参考答案</summary>

## 一、编译阶段

回顾`Vue2`，我们知道每个组件实例都对应一个 `watcher` 实例，它会在组件渲染的过程中把用到的数据`property`记录为依赖，当依赖发生改变，触发`setter`，则会通知`watcher`，从而使关联的组件重新渲染

 ![](https://static.ecool.fun//article/2ff51544-a944-4b18-a4fe-abbd3160888e.png)

试想一下，一个组件结构如下图

```html
<template>
    <div id="content">
        <p class="text">静态文本</p>
        <p class="text">静态文本</p>
        <p class="text">{{ message }}</p>
        <p class="text">静态文本</p>
        ...
        <p class="text">静态文本</p>
    </div>
</template>
```

可以看到，组件内部只有一个动态节点，剩余一堆都是静态节点，所以这里很多 `diff` 和遍历其实都是不需要的，造成性能浪费

因此，`Vue3`在编译阶段，做了进一步优化。主要有如下：

- diff算法优化
- 静态提升
- 事件监听缓存
- SSR优化

#### diff算法优化

`vue3`在`diff`算法中相比`vue2`增加了静态标记

关于这个静态标记，其作用是为了会发生变化的地方添加一个`flag`标记，下次发生变化的时候直接找该地方进行比较

下图这里，已经标记静态节点的`p`标签在`diff`过程中则不会比较，把性能进一步提高

 ![](https://static.ecool.fun//article/4d63cf01-fda3-4567-9779-2c0c519cea4e.png)

关于静态类型枚举如下

```js
export const enum PatchFlags {
  TEXT = 1,// 动态的文本节点
  CLASS = 1 << 1,  // 2 动态的 class
  STYLE = 1 << 2,  // 4 动态的 style
  PROPS = 1 << 3,  // 8 动态属性，不包括类名和样式
  FULL_PROPS = 1 << 4,  // 16 动态 key，当 key 变化时需要完整的 diff 算法做比较
  HYDRATE_EVENTS = 1 << 5,  // 32 表示带有事件监听器的节点
  STABLE_FRAGMENT = 1 << 6,   // 64 一个不会改变子节点顺序的 Fragment
  KEYED_FRAGMENT = 1 << 7, // 128 带有 key 属性的 Fragment
  UNKEYED_FRAGMENT = 1 << 8, // 256 子节点没有 key 的 Fragment
  NEED_PATCH = 1 << 9,   // 512
  DYNAMIC_SLOTS = 1 << 10,  // 动态 solt
  HOISTED = -1,  // 特殊标志是负整数表示永远不会用作 diff
  BAIL = -2 // 一个特殊的标志，指代差异算法
}
```

#### 静态提升

`Vue3`中对不参与更新的元素，会做静态提升，只会被创建一次，在渲染时直接复用

这样就免去了重复的创建节点，大型应用会受益于这个改动，免去了重复的创建操作，优化了运行时候的内存占用

```js
<span>你好</span>

<div>{{ message }}</div>
```

没有做静态提升之前

```js
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock(_Fragment, null, [
    _createVNode("span", null, "你好"),
    _createVNode("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}
```

做了静态提升之后

```js
const _hoisted_1 = /*#__PURE__*/_createVNode("span", null, "你好", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock(_Fragment, null, [
    _hoisted_1,
    _createVNode("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}

// Check the console for the AST
```

静态内容`_hoisted_1`被放置在`render` 函数外，每次渲染的时候只要取 `_hoisted_1` 即可

同时 `_hoisted_1` 被打上了 `PatchFlag` ，静态标记值为 -1 ，特殊标志是负整数表示永远不会用于 Diff

#### 事件监听缓存

默认情况下绑定事件行为会被视为动态绑定，所以每次都会去追踪它的变化

```text
<div>
  <button @click = 'onClick'>点我</button>
</div>
```

没开启事件监听器缓存

```js
export const render = /*#__PURE__*/_withId(function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", { onClick: _ctx.onClick }, "点我", 8 /* PROPS */, ["onClick"])
                                             // PROPS=1<<3,// 8 //动态属性，但不包含类名和样式
  ]))
})
```

开启事件侦听器缓存后

```js
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", {
      onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick(...args)))
    }, "点我")
  ]))
}
```

上述发现开启了缓存后，没有了静态标记。也就是说下次`diff`算法的时候直接使用

#### SSR优化

当静态内容大到一定量级时候，会用`createStaticVNode`方法在客户端去生成一个static node，这些静态`node`，会被直接`innerHtml`，就不需要创建对象，然后根据对象渲染

```js
div>
    <div>
        <span>你好</span>
    </div>
    ...  // 很多个静态属性
    <div>
        <span>{{ message }}</span>
    </div>
</div>
```

编译后

```js
import { mergeProps as _mergeProps } from "vue"
import { ssrRenderAttrs as _ssrRenderAttrs, ssrInterpolate as _ssrInterpolate } from "@vue/server-renderer"

export function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _cssVars = { style: { color: _ctx.color }}
  _push(`<div${
    _ssrRenderAttrs(_mergeProps(_attrs, _cssVars))
  }><div><span>你好</span>...<div><span>你好</span><div><span>${
    _ssrInterpolate(_ctx.message)
  }</span></div></div>`)
}
```

## 二、源码体积

相比`Vue2`，`Vue3`整体体积变小了，除了移出一些不常用的API，再重要的是`Tree shanking`

任何一个函数，如`ref`、`reavtived`、`computed`等，仅仅在用到的时候才打包，没用到的模块都被摇掉，打包的整体体积变小

```js
import { computed, defineComponent, ref } from 'vue';
export default defineComponent({
    setup(props, context) {
        const age = ref(18)

        let state = reactive({
            name: 'test'
        })

        const readOnlyAge = computed(() => age.value++) // 19

        return {
            age,
            state,
            readOnlyAge
        }
    }
});
```

## 三、响应式系统

`vue2`中采用 `defineProperty`来劫持整个对象，然后进行深度遍历所有属性，给每个属性添加`getter`和`setter`，实现响应式

`vue3`采用`proxy`重写了响应式系统，因为`proxy`可以对整个对象进行监听，所以不需要深度遍历

- 可以监听动态属性的添加
- 可以监听到数组的索引和数组`length`属性
- 可以监听删除属性

关于这两个 API 具体的不同，我们下篇文章会进行一个更加详细的介绍

</details>

## 94. Vue3.0的设计目标是什么？做了哪些优化? {#question-ca63a7ef-8e3d-4fe4-b697-28138bd96f74}

> 难度：3 · 类型：QA

### 题目要点

Vue 3.0的设计目标是解决实际业务痛点，提供更小、更快、更友好的开发体验。它通过以下几个方面的优化来实现这一目标：

#### 更小

- 移除不常用的API，减少代码体积。
- 引入tree-shaking，仅打包需要的模块，减小整体体积。

#### 更快

- 编译方面进行了diff算法优化、静态提升、事件监听缓存和SSR优化，以提高性能。

#### 更友好

- 同时支持Options API和Composition API，增加了代码的逻辑组织和代码复用能力。
- 基于TypeScript编写，提供更好的类型检查和类型推导。

#### 优化方案

- 源码管理：采用monorepo方式，将不同功能拆分到不同的子目录中，提高代码的可维护性。
- TypeScript：提供更好的类型检查和类型推导。
- 性能：从体积、编译和数据劫持三个方面进行优化。
- 语法API：Composition API优化了逻辑组织和逻辑复用。

<details>
<summary>参考答案</summary>

## 一、设计目标

不以解决实际业务痛点的更新都是耍流氓，下面我们来列举一下`Vue3`之前我们或许会面临的问题

- 随着功能的增长，复杂组件的代码变得越来越难以维护

- 缺少一种比较「干净」的在多个组件之间提取和复用逻辑的机制

- 类型推断不够友好

- `bundle`的时间太久了

而 `Vue3` 经过长达两三年时间的筹备，做了哪些事情？

我们从结果反推

- 更小
- 更快
- TypeScript支持
- API设计一致性
- 提高自身可维护性
- 开放更多底层功能

一句话概述，就是更小更快更友好了

### 更小

`Vue3`移除一些不常用的 `API`

引入`tree-shaking`，可以将无用模块“剪辑”，仅打包需要的，使打包的整体体积变小了

### 更快

主要体现在编译方面：

- diff算法优化
- 静态提升
- 事件监听缓存
- SSR优化

下篇文章我们会进一步介绍

### 更友好

`vue3`在兼顾`vue2`的`options API`的同时还推出了`composition API`，大大增加了代码的逻辑组织和代码复用能力

这里代码简单演示下：

存在一个获取鼠标位置的函数

```js
import { toRefs, reactive } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

我们只需要调用这个函数，即可获取`x`、`y`的坐标，完全不用关注实现过程

试想一下，如果很多类似的第三方库，我们只需要调用即可，不必关注实现过程，开发效率大大提高

同时，`VUE3`是基于`typescipt`编写的，可以享受到自动的类型定义提示

## 三、优化方案

`vue3`从很多层面都做了优化，可以分成三个方面：

- 源码
- 性能
- 语法 API

### 源码

源码可以从两个层面展开：

- 源码管理
- TypeScript

#### 源码管理

`vue3`整个源码是通过 `monorepo `的方式维护的，根据功能将不同的模块拆分到`packages `目录下面不同的子目录中

 ![](https://static.ecool.fun//article/aeff110f-4dd5-4bf0-aaf4-4ad74f6a53ab.png)

这样使得模块拆分更细化，职责划分更明确，模块之间的依赖关系也更加明确，开发人员也更容易阅读、理解和更改所有模块源码，提高代码的可维护性

另外一些 `package`（比如 `reactivity` 响应式库）是可以独立于 `Vue` 使用的，这样用户如果只想使用 `Vue3 `的响应式能力，可以单独依赖这个响应式库而不用去依赖整个 `Vue`

#### TypeScript

`Vue3`是基于`typeScript`编写的，提供了更好的类型检查，能支持复杂的类型推导

### 性能

`vue3`是从什么哪些方面对性能进行进一步优化呢？

- 体积优化
- 编译优化
- 数据劫持优化

这里讲述数据劫持：

在`vue2`中，数据劫持是通过`Object.defineProperty `，这个 API 有一些缺陷，并不能检测对象属性的添加和删除

```js
Object.defineProperty(data, 'a',{
  get(){
    // track
  },
  set(){
    // trigger
  }
})
```

尽管` Vue`为了解决这个问题提供了 `set `和`delete `实例方法，但是对于用户来说，还是增加了一定的心智负担

同时在面对嵌套层级比较深的情况下，就存在性能问题

```js
default {
  data: {
    a: {
      b: {
          c: {
          d: 1
        }
      }
    }
  }
}
```

相比之下，`vue3`是通过`proxy`监听整个对象，那么对于删除还是监听当然也能监听到

同时`Proxy ` 并不能监听到内部深层次的对象变化，而 `Vue3` 的处理方式是在` getter` 中去递归响应式，这样的好处是真正访问到的内部对象才会变成响应式，而不是无脑递归

### 语法 API

这里当然说的就是`composition API`，其两大显著的优化：

- 优化逻辑组织
- 优化逻辑复用

#### 逻辑组织

一张图，我们可以很直观地感受到 `Composition API `在逻辑组织方面的优势

 ![](https://static.ecool.fun//article/37d16502-5b20-4059-a321-09ac1201cd70.png)

相同功能的代码编写在一块，而不像`options API`那样，各个功能的代码混成一块

#### 逻辑复用

在`vue2`中，我们是通过`mixin`实现功能混合，如果多个`mixin`混合，会存在两个非常明显的问题：命名冲突和数据来源不清晰

而通过`composition`这种形式，可以将一些复用的代码抽离出来作为一个函数，只要的使用的地方直接进行调用即可

同样是上文的获取鼠标位置的例子

```js
import { toRefs, reactive, onUnmounted, onMounted } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

组件使用

```js
import useMousePosition from './mouse'
export default {
    setup() {
        const { x, y } = useMousePosition()
        return { x, y }
    }
}
```

可以看到，整个数据来源清晰了，即使去编写更多的` hook `函数，也不会出现命名冲突的问题

</details>

## 95. Vue3有了解过吗？能说说跟Vue2的区别吗？ {#question-870c404a-b200-43c7-8955-922b39de704f}

> 难度：2 · 类型：QA

### 题目要点

- Proxy 重构响应式系统解决 Vue 2 的响应式限制
- Composition API 提供更好的逻辑组织和复用
- 编译器优化带来显著的运行时性能提升
- 更友好的 TypeScript 集成体验
- 设计上更注重可维护性和扩展性

<details>
<summary>参考答案</summary>

Vue 3 是对 Vue 2 的架构级升级，其核心改进体现在以下几个方面：

### 响应式系统重构
1. **实现机制**<br>
Vue 2 使用 Object.defineProperty 实现响应式，存在无法检测属性新增/删除的限制。Vue 3 改用 Proxy 代理，实现了真正的全属性响应追踪，同时提升了性能表现。

2. **依赖追踪优化**<br>
引入 effect scope 概念，支持更细粒度的依赖收集。与 Vue 2 的 Watcher 实例相比，Vue 3 的响应式系统内存占用降低约50%。

### 组合式 API
1. **逻辑复用革新**<br>
Options API 的碎片化问题通过 setup() 和 Composition API 解决。相关逻辑可以聚合到独立 composable 函数中，实现比 mixins 更灵活且无冲突的复用方式。

2. **TypeScript 支持**<br>
基于函数式的 API 设计使类型推导更为自然，相比 Vue 2 的 Options API 获得了完整的类型支持。

### 性能优化

 **编译时改进**<br>

- 模板编译生成更高效的渲染函数（Block Tree 优化）
- 静态节点提升（Hoist Static）减少运行时开销
- Patch Flag 标记实现靶向更新

**体积减少**<br>

通过 Tree-shaking 支持，最小化打包体积从 Vue 2 的 ~20KB 降至 ~10KB。

### 其他重要差异
1. **生命周期调整**<br>
beforeDestroy 更名为 beforeUnmount，destroyed 改为 unmounted，与语义更匹配。

2. **Fragment/Teleport 支持**<br>
新增多根节点组件和跨 DOM 渲染能力，解决 Vue 2 的模板限制。

3. **自定义渲染器**<br>
提供 createRenderer API 实现非 DOM 环境的渲染能力，扩展性显著增强。

</details>

## 96. 你是怎么处理vue项目中的错误的？ {#question-0cc5abe2-7798-40a6-b930-7dacdb404b8d}

> 难度：2 · 类型：QA

### 题目要点

以下是 Vue 错误处理的主要方式：

#### 错误类型

Vue 中的错误主要来源于两个方面：

- 后端接口错误：如网络请求失败等。
- 代码逻辑错误：如函数调用错误、变量使用错误等。

#### 处理方法

#### 后端接口错误

通过 `axios` 的 `interceptor` 功能，可以在网络请求的响应阶段进行错误拦截，并进行相应的处理。

#### 代码逻辑问题

1. **全局设置错误处理**：Vue 提供了全局的 `errorHandler` 函数，可以在组件渲染和观察期间未捕获错误时调用。这个函数可以自定义错误处理逻辑。
2. **生命周期钩子**：Vue 提供了 `errorCaptured` 生命周期钩子，用于捕获子孙组件的错误，并在调用时返回 `false` 以阻止错误继续向上传播。

### 源码分析

Vue 的错误处理源码位于 `src/core/util/error.js`。该文件定义了全局的错误处理逻辑，包括错误捕获、异步错误处理、全局错误处理函数以及错误输出函数。

- `handleError` 函数负责递归调用父组件的 `errorCaptured` 钩子，并在所有钩子调用完毕或出现错误时调用全局错误处理函数。
- `globalHandleError` 函数负责调用全局的错误处理函数，并在必要时输出错误信息。
- `invokeWithErrorHandling` 函数用于处理异步函数中的错误，确保错误被正确处理。
- `logError` 函数根据当前环境决定如何输出错误信息，生产环境直接抛出错误，非生产环境则通过 `warn` 输出。

<details>
<summary>参考答案</summary>

## 一、错误类型

任何一个框架，对于错误的处理都是一种必备的能力

在`Vue` 中，则是定义了一套对应的错误处理规则给到使用者，且在源代码级别，对部分必要的过程做了一定的错误处理。

主要的错误来源包括：

- 后端接口错误
- 代码中本身逻辑错误

## 二、如何处理

### 后端接口错误

通过`axios`的`interceptor`实现网络请求的`response`先进行一层拦截

```js
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response.status == 401) {
      router.push({ name: "Login" });
    } else {
      message.error("出错了");
      return Promise.reject(error);
    }
  }
);
```

### 代码逻辑问题

#### 全局设置错误处理

设置全局错误处理函数

```js
Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  // 只在 2.2.0+ 可用
}
```

`errorHandler`指定组件的渲染和观察期间未捕获错误的处理函数。这个处理函数被调用时，可获取错误信息和 `Vue` 实例

不过值得注意的是，在不同` Vue` 版本中，该全局 `API` 作用的范围会有所不同：

> 从 2.2.0 起，这个钩子也会捕获组件生命周期钩子里的错误。同样的，当这个钩子是 `undefined` 时，被捕获的错误会通过 `console.error` 输出而避免应用崩

> 从 2.4.0 起，这个钩子也会捕获 Vue 自定义事件处理函数内部的错误了

> 从 2.6.0 起，这个钩子也会捕获 `v-on` DOM 监听器内部抛出的错误。另外，如果任何被覆盖的钩子或处理函数返回一个 Promise 链 (例如 async 函数)，则来自其 Promise 链的错误也会被处理

#### 生命周期钩子

`errorCaptured`是 2.5.0 新增的一个生命钩子函数，当捕获到一个来自子孙组件的错误时被调用

基本类型

```js
(err: Error, vm: Component, info: string) => ?boolean
```

此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 `false` 以阻止该错误继续向上传播

参考官网，错误传播规则如下：

- 默认情况下，如果全局的 `config.errorHandler` 被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报
- 如果一个组件的继承或父级从属链路中存在多个 `errorCaptured` 钩子，则它们将会被相同的错误逐个唤起。
- 如果此 `errorCaptured` 钩子自身抛出了一个错误，则这个新错误和原本被捕获的错误都会发送给全局的 `config.errorHandler`
- 一个 `errorCaptured` 钩子能够返回 `false` 以阻止错误继续向上传播。本质上是说“这个错误已经被搞定了且应该被忽略”。它会阻止其它任何会被这个错误唤起的 `errorCaptured` 钩子和全局的 `config.errorHandler`

下面来看个例子

定义一个父组件`cat`

```js
Vue.component('cat', {
    template:`
        <div>
            <h1>Cat: </h1>
            <slot></slot>
        </div>`,
    props:{
        name:{
            required:true,
            type:String
        }
    },
    errorCaptured(err,vm,info) {
        console.log(`cat EC: ${err.toString()}\ninfo: ${info}`);
        return false;
    }

});
```

定义一个子组件`kitten`，其中`dontexist()`并没有定义，存在错误

```js
Vue.component('kitten', {
    template:'<div><h1>Kitten: {{ dontexist() }}</h1></div>',
    props:{
        name:{
            required:true,
            type:String
        }
    }
});
```

页面中使用组件

```html
<div id="app" v-cloak>
    <cat name="my cat">
        <kitten></kitten>
    </cat>
</div>
```

在父组件的`errorCaptured`则能够捕获到信息

```js
cat EC: TypeError: dontexist is not a function
info: render
```

### 三、源码分析

异常处理源码

源码位置：/src/core/util/error.js

```js
// Vue 全局配置,也就是上面的Vue.config
import config from '../config'
import { warn } from './debug'
// 判断环境
import { inBrowser, inWeex } from './env'
// 判断是否是Promise，通过val.then === 'function' && val.catch === 'function', val ！=== null && val !== undefined
import { isPromise } from 'shared/util'
// 当错误函数处理错误时，停用deps跟踪以避免可能出现的infinite rendering
// 解决以下出现的问题https://github.com/vuejs/vuex/issues/1505的问题
import { pushTarget, popTarget } from '../observer/dep'

export function handleError (err: Error, vm: any, info: string) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    pushTarget()
    try {
        // vm指当前报错的组件实例
        if (vm) {
            let cur = vm
            // 首先获取到报错的组件，之后递归查找当前组件的父组件，依次调用errorCaptured 方法。
            // 在遍历调用完所有 errorCaptured 方法、或 errorCaptured 方法有报错时，调用 globalHandleError 方法
            while ((cur = cur.$parent)) {
                const hooks = cur.$options.errorCaptured
                // 判断是否存在errorCaptured钩子函数
                if (hooks) {
                    // 选项合并的策略，钩子函数会被保存在一个数组中
                    for (let i = 0; i < hooks.length; i++) {
                        // 如果errorCaptured 钩子执行自身抛出了错误，
                        // 则用try{}catch{}捕获错误，将这个新错误和原本被捕获的错误都会发送给全局的config.errorHandler
                        // 调用globalHandleError方法
                        try {
                            // 当前errorCaptured执行，根据返回是否是false值
                            // 是false，capture = true，阻止其它任何会被这个错误唤起的 errorCaptured 钩子和全局的 config.errorHandler
                            // 是true capture = fale，组件的继承或父级从属链路中存在的多个 errorCaptured 钩子，会被相同的错误逐个唤起
                            // 调用对应的钩子函数，处理错误
                            const capture = hooks[i].call(cur, err, vm, info) === false
                            if (capture) return
                        } catch (e) {
                            globalHandleError(e, cur, 'errorCaptured hook')
                        }
                    }
                }
            }
        }
        // 除非禁止错误向上传播，否则都会调用全局的错误处理函数
        globalHandleError(err, vm, info)
    } finally {
        popTarget()
    }
}
// 异步错误处理函数
export function invokeWithErrorHandling (
handler: Function,
 context: any,
 args: null | any[],
    vm: any,
        info: string
        ) {
            let res
            try {
                // 根据参数选择不同的handle执行方式
                res = args ? handler.apply(context, args) : handler.call(context)
                // handle返回结果存在
                // res._isVue an flag to avoid this being observed，如果传入值的_isVue为ture时(即传入的值是Vue实例本身)不会新建observer实例
                // isPromise(res) 判断val.then === 'function' && val.catch === 'function', val ！=== null && val !== undefined
                // !res._handled  _handle是Promise 实例的内部变量之一，默认是false，代表onFulfilled,onRejected是否被处理
                if (res && !res._isVue && isPromise(res) && !res._handled) {
                    res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
                    // avoid catch triggering multiple times when nested calls
                    // 避免嵌套调用时catch多次的触发
                    res._handled = true
                }
            } catch (e) {
                // 处理执行错误
                handleError(e, vm, info)
            }
            return res
        }

//全局错误处理
function globalHandleError (err, vm, info) {
    // 获取全局配置，判断是否设置处理函数，默认undefined
    // 已配置
    if (config.errorHandler) {
        // try{}catch{} 住全局错误处理函数
        try {
            // 执行设置的全局错误处理函数，handle error 想干啥就干啥💗
            return config.errorHandler.call(null, err, vm, info)
        } catch (e) {
            // 如果开发者在errorHandler函数中手动抛出同样错误信息throw err
            // 判断err信息是否相等，避免log两次
            // 如果抛出新的错误信息throw err Error('你好毒')，将会一起log输出
            if (e !== err) {
                logError(e, null, 'config.errorHandler')
            }
        }
    }
    // 未配置常规log输出
    logError(err, vm, info)
}

// 错误输出函数
function logError (err, vm, info) {
    if (process.env.NODE_ENV !== 'production') {
        warn(`Error in ${info}: "${err.toString()}"`, vm)
    }
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
        console.error(err)
    } else {
        throw err
    }
}
```

### 小结

- `handleError`在需要捕获异常的地方调用，首先获取到报错的组件，之后递归查找当前组件的父组件，依次调用`errorCaptured` 方法，在遍历调用完所有 `errorCaptured` 方法或 `errorCaptured` 方法有报错时，调用 `globalHandleError` 方法
- `globalHandleError `调用全局的 `errorHandler` 方法，再通过`logError`判断环境输出错误信息
- `invokeWithErrorHandling`更好的处理异步错误信息
- `logError`判断环境，选择不同的抛错方式。非生产环境下，调用`warn`方法处理错误

</details>

## 97. Vue项目如何进行部署？是否有遇到部署服务器后刷新404问题？ {#question-252525e4-0c4c-4e41-9279-41bc59f06f85}

> 难度：2 · 类型：QA

### 题目要点

Vue 项目部署的步骤和 404 错误解决方法：

#### 部署步骤

1. **构建静态文件**：在本地开发环境中，使用 Vue CLI 或其他构建工具构建项目，生成静态文件。
2. **上传文件**：使用 `scp` 或 `ftp` 等工具将 `dist` 目录中的文件上传到服务器的指定静态目录。
3. **配置 Web 服务器**：根据服务器的类型（如 Nginx、Apache）配置 Web 服务器，确保可以正确访问 `dist` 目录中的 `index.html` 文件。
4. **重启 Web 服务器**：修改配置后，需要重启 Web 服务器以确保配置生效。

#### 404 问题解决

1. **问题原因**：Vue 项目部署后，如果访问非根路径（如 `/login`）并刷新页面，由于服务端没有相应的文件，因此会返回 404 错误。
2. **解决方法**：
   - **Nginx 配置**：在 Nginx 配置中添加 `try_files` 指令，将所有路径重定向到 `index.html`。

     ```nginx
     server {
       listen  80;
       server_name  www.xxx.com;
       location / {
         index  /data/dist/index.html;
         try_files $uri $uri/ /index.html;
       }
     }
     ```

   - **前端路由覆盖**：在 Vue 项目中，配置前端路由以覆盖所有可能的路径，并在找不到对应路由时返回 404 页面。

     ```javascript
     const router = new VueRouter({
       mode: 'history',
       routes: [
         { path: '*', component: NotFoundComponent }
       ]
     })
     ```

<details>
<summary>参考答案</summary>

## 一、如何部署

前后端分离开发模式下，前后端是独立布署的，前端只需要将最后的构建物上传至目标服务器的`web`容器指定的静态目录下即可

我们知道`vue`项目在构建后，是生成一系列的静态文件

常规布署我们只需要将这个目录上传至目标服务器即可

```bash
// scp 上传 user为主机登录用户，host为主机外网ip, xx为web容器静态资源路径
scp dist.zip user@host:/xx/xx/xx
```

让`web`容器跑起来，以`nginx`为例

```bash
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /data/dist/index.html;
  }
}
```
配置完成记得重启`nginx`
```bash
// 检查配置是否正确
nginx -t

// 平滑重启
nginx -s reload
```

操作完后就可以在浏览器输入域名进行访问了

当然上面只是提到最简单也是最直接的一种布署方式

什么自动化，镜像，容器，流水线布署，本质也是将这套逻辑抽象，隔离，用程序来代替重复性的劳动，本文不展开

## 二、404问题

这是一个经典的问题，相信很多同学都有遇到过，那么你知道其真正的原因吗？

我们先还原一下场景：

- `vue`项目在本地时运行正常，但部署到服务器中，刷新页面，出现了404错误

先定位一下，HTTP 404 错误意味着链接指向的资源不存在

问题在于为什么不存在？且为什么只有`history`模式下会出现这个问题？

### 为什么history模式下有问题

`Vue`是属于单页应用（single-page application）

而`SPA`是一种网络应用程序或网站的模型，所有用户交互是通过动态重写当前页面，前面我们也看到了，不管我们应用有多少页面，构建物都只会产出一个`index.html`

现在，我们回头来看一下我们的`nginx`配置

```js
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /data/dist/index.html;
  }
}
```

可以根据 `nginx` 配置得出，当我们在地址栏输入 `www.xxx.com` 时，这时会打开我们 `dist` 目录下的 `index.html` 文件，然后我们在跳转路由进入到 `www.xxx.com/login`

关键在这里，当我们在 `website.com/login` 页执行刷新操作，`nginx location` 是没有相关配置的，所以就会出现 404 的情况

### 为什么hash模式下没有问题

`router hash` 模式我们都知道是用符号#表示的，如  `website.com/#/login`, `hash` 的值为 `#/login`

它的特点在于：`hash` 虽然出现在 `URL` 中，但不会被包括在 `HTTP` 请求中，对服务端完全没有影响，因此改变 `hash` 不会重新加载页面

`hash` 模式下，仅 `hash` 符号之前的内容会被包含在请求中，如 `website.com/#/login` 只有 `website.com` 会被包含在请求中 ，因此对于服务端来说，即使没有配置`location`，也不会返回404错误

## 解决方案

看到这里我相信大部分同学都能想到怎么解决问题了，

产生问题的本质是因为我们的路由是通过JS来执行视图切换的，

当我们进入到子路由时刷新页面，`web`容器没有相对应的页面此时会出现404

所以我们只需要配置将任意页面都重定向到 `index.html`，把路由交由前端处理

对`nginx`配置文件`.conf`修改，添加`try_files $uri $uri/ /index.html;`

```bash
server {
  listen  80;
  server_name  www.xxx.com;

  location / {
    index  /data/dist/index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

修改完配置文件后记得配置的更新

```bash
nginx -s reload
```

这么做以后，你的服务器就不再返回 404 错误页面，因为对于所有路径都会返回 `index.html` 文件

为了避免这种情况，你应该在 `Vue` 应用里面覆盖所有的路由情况，然后在给出一个 404 页面

```js
const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '*', component: NotFoundComponent }
  ]
})
```

关于后端配置方案还有：`Apache`、`nodejs`等，思想是一致的，这里就不展开述说了

</details>

## 98. Vue项目中如何解决跨域问题？ {#question-38c7340e-cb35-43e0-8ea0-20e75b2780a5}

> 难度：2 · 类型：QA

### 题目要点

在Vue项目中，解决跨域问题通常采用CORS（跨域资源共享）或Proxy（代理）两种方法。

#### CORS（跨域资源共享）

CORS是一种机制，它允许服务器声明哪些网站可以访问哪些资源。通过在服务器端设置特定的HTTP头部，可以允许或拒绝跨域请求。

#### Proxy（代理）

代理是一种网络服务，它可以将请求转发到目标服务器，并转发响应给前端。

**Vue CLI中通过Webpack配置代理**：

1. 在`vue.config.js`中配置开发服务器（devServer）。
2. 设置代理规则，将特定的URL前缀（如`/api`）代理到目标服务器。
3. 在前端项目中配置`axios`的默认基础URL。

```javascript
module.exports = {
  devServer: {
    host: '127.0.0.1',
    port: 8084,
    open: true,
    proxy: {
      '/api': {
        target: 'http://xxx.xxx.xx.xx:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 重写路径，去掉代理前缀
        }
      }
    }
  }
};
```

**通过Nginx配置代理**：

1. 定义一个服务器块。
2. 设置监听端口和主机名。
3. 在`location`块中设置代理规则。

```nginx
server {
  listen 80;
  location / {
    root /var/www/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

<details>
<summary>参考答案</summary>

解决跨域的方法有很多，下面列举了三种：

- JSONP
- CORS
- Proxy

而在`vue`项目中，我们主要针对`CORS`或`Proxy`这两种方案进行展开

### CORS

CORS （Cross-Origin Resource Sharing，跨域资源共享）是一个系统，它由一系列传输的HTTP头组成，这些HTTP头决定浏览器是否阻止前端 JavaScript 代码获取跨域请求的响应

`CORS` 实现起来非常方便，只需要增加一些 `HTTP` 头，让服务器能声明允许的访问来源

只要后端实现了 `CORS`，就实现了跨域

 ![](https://static.ecool.fun//article/1dab26ff-003d-49b3-ab94-f25032f40170.png)

以` koa`框架举例

添加中间件，直接设置`Access-Control-Allow-Origin`请求头

```js
app.use(async (ctx, next)=> {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
})
```

ps: `Access-Control-Allow-Origin` 设置为*其实意义不大，可以说是形同虚设，实际应用中，上线前我们会将`Access-Control-Allow-Origin` 值设为我们目标`host`

### Proxy
代理（Proxy）也称网络代理，是一种特殊的网络服务，允许一个（一般为客户端）通过这个服务与另一个网络终端（一般为服务器）进行非直接的连接。一些网关、路由器等网络设备具备网络代理功能。一般认为代理服务有利于保障网络终端的隐私或安全，防止攻击

**方案一**

如果是通过`vue-cli`脚手架工具搭建项目，我们可以通过`webpack`为我们起一个本地服务器作为请求的代理对象

通过该服务器转发请求至目标服务器，得到结果再转发给前端，但是最终发布上线时如果web应用和接口服务器不在一起仍会跨域

在`vue.config.js`文件，新增以下代码

```js
amodule.exports = {
    devServer: {
        host: '127.0.0.1',
        port: 8084,
        open: true,// vue项目启动时自动打开浏览器
        proxy: {
            '/api': { // '/api'是代理标识，用于告诉node，url前面是/api的就是使用代理的
                target: "http://xxx.xxx.xx.xx:8080", //目标地址，一般是指后台服务器地址
                changeOrigin: true, //是否跨域
                pathRewrite: { // pathRewrite 的作用是把实际Request Url中的'/api'用""代替
                    '^/api': ""
                }
            }
        }
    }
}
```

通过`axios`发送请求中，配置请求的根路径

```js
axios.defaults.baseURL = '/api'
```

**方案二**

此外，还可通过服务端实现代理请求转发

以`express`框架为例

```js
var express = require('express');
const proxy = require('http-proxy-middleware')
const app = express()
app.use(express.static(__dirname + '/'))
app.use('/api', proxy({ target: 'http://localhost:4000', changeOrigin: false
                      }));
module.exports = app
```

**方案三**

通过配置`nginx`实现代理

```js
server {
    listen    80;
    # server_name www.josephxia.com;
    location / {
        root  /var/www/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass  http://127.0.0.1:3000;
        proxy_redirect   off;
        proxy_set_header  Host       $host;
        proxy_set_header  X-Real-IP     $remote_addr;
        proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
}
```

</details>

## 99. Vue怎么实现权限管理？控制到按钮级别的权限怎么做？ {#question-f43b7906-f51f-454f-8028-ea027ae3e121}

> 难度：3 · 类型：QA

### 题目要点

前端权限控制主要是确保用户只能访问到被分配的资源，其实现方式可以分为接口权限、按钮权限、菜单权限和路由权限四个方面。

#### 接口权限

接口权限通常通过`JWT`进行验证，未通过验证时返回`401`，要求用户重新登录。登录后，将`token`存入cookie或localStorage，并通过`axios`请求拦截器携带`token`发送请求。

#### 路由权限控制

路由权限控制可以通过两种方案实现：

1. 初始化时挂载全部路由，并在路由上标记权限信息，每次路由跳转前进行校验。
2. 初始化时挂载不需要权限控制的路由，登录后获取用户权限信息，筛选有权限访问的路由，并通过全局路由守卫的`addRoutes`方法动态添加路由。

#### 菜单权限

菜单权限可以通过以下两种方案实现：

1. 菜单与路由分离，菜单由后端返回，前端根据路由的`name`字段与后端返回的菜单进行关联。
2. 菜单和路由都由后端返回，前端统一定义路由组件，后端返回的路由组件中包含`component`字段。

#### 按钮权限

按钮权限可以通过以下两种方案实现：

1. 每个页面获取用户权限和路由表里的`meta.btnPermissions`，并通过`v-if`判断按钮是否显示。
2. 通过自定义指令进行按钮权限的判断，首先配置路由的`meta`字段，然后在按钮上使用`v-has`指令。

<details>
<summary>参考答案</summary>

## 一、是什么

权限是对特定资源的访问许可，所谓权限控制，也就是确保用户只能访问到被分配的资源

而前端权限归根结底是请求的发起权，请求的发起可能有下面两种形式触发

- 页面加载触发
- 页面上的按钮点击触发

总的来说，所有的请求发起都触发自前端路由或视图

所以我们可以从这两方面入手，对触发权限的源头进行控制，最终要实现的目标是：

- 路由方面，用户登录后只能看到自己有权访问的导航菜单，也只能访问自己有权访问的路由地址，否则将跳转 `4xx` 提示页

- 视图方面，用户只能看到自己有权浏览的内容和有权操作的控件

- 最后再加上请求控制作为最后一道防线，路由可能配置失误，按钮可能忘了加权限，这种时候请求控制可以用来兜底，越权请求将在前端被拦截

## 二、如何做

前端权限控制可以分为四个方面：

- 接口权限
- 按钮权限
- 菜单权限
- 路由权限

### 接口权限

接口权限目前一般采用`jwt`的形式来验证，没有通过的话一般返回`401`，跳转到登录页面重新进行登录

登录完拿到`token`，将`token`存起来，通过`axios`请求拦截器进行拦截，每次请求的时候头部携带`token`

```js
axios.interceptors.request.use(config => {
    config.headers['token'] = cookie.get('token')
    return config
})
axios.interceptors.response.use(res=>{},{response}=>{
    if (response.data.code === 40099 || response.data.code === 40098) { //token过期或者错误
        router.push('/login')
    }
})
```

### 路由权限控制

**方案一**

初始化即挂载全部路由，并且在路由上标记相应的权限信息，每次路由跳转前做校验

```js
const routerMap = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/index',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: 'permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [{
      path: 'page',
      component: () => import('@/views/permission/page'),
      name: 'pagePermission',
      meta: {
        title: 'pagePermission',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    }, {
      path: 'directive',
      component: () => import('@/views/permission/directive'),
      name: 'directivePermission',
      meta: {
        title: 'directivePermission'
        // if do not set roles, means: this page does not require permission
      }
    }]
  }]

```

这种方式存在以下四种缺点：

- 加载所有的路由，如果路由很多，而用户并不是所有的路由都有权限访问，对性能会有影响。

- 全局路由守卫里，每次路由跳转都要做权限判断。

- 菜单信息写死在前端，要改个显示文字或权限信息，需要重新编译

- 菜单跟路由耦合在一起，定义路由的时候还有添加菜单显示标题，图标之类的信息，而且路由不一定作为菜单显示，还要多加字段进行标识

**方案二**

初始化的时候先挂载不需要权限控制的路由，比如登录页，404等错误页。如果用户通过URL进行强制访问，则会直接进入404，相当于从源头上做了控制

登录后，获取用户的权限信息，然后筛选有权限访问的路由，在全局路由守卫里进行调用`addRoutes`添加路由

```js
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login', '/authredirect']// no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  if (getToken()) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(res => { // 拉取user_info
          const roles = res.data.roles // note: roles must be a array! such as: ['editor','develop']
          store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()//
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
        // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

```

按需挂载，路由就需要知道用户的路由权限，也就是在用户登录进来的时候就要知道当前用户拥有哪些路由权限

这种方式也存在了以下的缺点：

- 全局路由守卫里，每次路由跳转都要做判断
- 菜单信息写死在前端，要改个显示文字或权限信息，需要重新编译
- 菜单跟路由耦合在一起，定义路由的时候还有添加菜单显示标题，图标之类的信息，而且路由不一定作为菜单显示，还要多加字段进行标识

### 菜单权限

菜单权限可以理解成将页面与理由进行解耦

#### 方案一

菜单与路由分离，菜单由后端返回

前端定义路由信息

```js
{
    name: "login",
    path: "/login",
    component: () => import("@/pages/Login.vue")
}
```

`name`字段都不为空，需要根据此字段与后端返回菜单做关联，后端返回的菜单信息中必须要有`name`对应的字段，并且做唯一性校验

全局路由守卫里做判断

```js
function hasPermission(router, accessMenu) {
  if (whiteList.indexOf(router.path) !== -1) {
    return true;
  }
  let menu = Util.getMenuByName(router.name, accessMenu);
  if (menu.name) {
    return true;
  }
  return false;

}

Router.beforeEach(async (to, from, next) => {
  if (getToken()) {
    let userInfo = store.state.user.userInfo;
    if (!userInfo.name) {
      try {
        await store.dispatch("GetUserInfo")
        await store.dispatch('updateAccessMenu')
        if (to.path === '/login') {
          next({ name: 'home_index' })
        } else {
          //Util.toDefaultPage([...routers], to.name, router, next);
          next({ ...to, replace: true })//菜单权限更新完成,重新进一次当前路由
        }
      }
      catch (e) {
        if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
          next()
        } else {
          next('/login')
        }
      }
    } else {
      if (to.path === '/login') {
        next({ name: 'home_index' })
      } else {
        if (hasPermission(to, store.getters.accessMenu)) {
          Util.toDefaultPage(store.getters.accessMenu,to, routes, next);
        } else {
          next({ path: '/403',replace:true })
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next('/login')
    }
  }
  let menu = Util.getMenuByName(to.name, store.getters.accessMenu);
  Util.title(menu.title);
});

Router.afterEach((to) => {
  window.scrollTo(0, 0);
});
```

每次路由跳转的时候都要判断权限，这里的判断也很简单，因为菜单的`name`与路由的`name`是一一对应的，而后端返回的菜单就已经是经过权限过滤的

如果根据路由`name`找不到对应的菜单，就表示用户有没权限访问

如果路由很多，可以在应用初始化的时候，只挂载不需要权限控制的路由。取得后端返回的菜单后，根据菜单与路由的对应关系，筛选出可访问的路由，通过`addRoutes`动态挂载

这种方式的缺点：

- 菜单需要与路由做一一对应，前端添加了新功能，需要通过菜单管理功能添加新的菜单，如果菜单配置的不对会导致应用不能正常使用
- 全局路由守卫里，每次路由跳转都要做判断

#### 方案二

菜单和路由都由后端返回

前端统一定义路由组件

```js
const Home = () => import("../pages/Home.vue");
const UserInfo = () => import("../pages/UserInfo.vue");
export default {
    home: Home,
    userInfo: UserInfo
};
```

后端路由组件返回以下格式

```js
[
    {
        name: "home",
        path: "/",
        component: "home"
    },
    {
        name: "home",
        path: "/userinfo",
        component: "userInfo"
    }
]
```

在将后端返回路由通过`addRoutes`动态挂载之间，需要将数据处理一下，将`component`字段换为真正的组件

如果有嵌套路由，后端功能设计的时候，要注意添加相应的字段，前端拿到数据也要做相应的处理

这种方法也会存在缺点：

- 全局路由守卫里，每次路由跳转都要做判断
- 前后端的配合要求更高

### 按钮权限

#### 方案一

按钮权限也可以用`v-if`判断

但是如果页面过多，每个页面页面都要获取用户权限`role`和路由表里的`meta.btnPermissions`，然后再做判断

这种方式就不展开举例了

#### 方案二

通过自定义指令进行按钮权限的判断

首先配置路由

```js
{
    path: '/permission',
    component: Layout,
    name: '权限测试',
    meta: {
        btnPermissions: ['admin', 'supper', 'normal']
    },
    //页面需要的权限
    children: [{
        path: 'supper',
        component: _import('system/supper'),
        name: '权限测试页',
        meta: {
            btnPermissions: ['admin', 'supper']
        } //页面需要的权限
    },
    {
        path: 'normal',
        component: _import('system/normal'),
        name: '权限测试页',
        meta: {
            btnPermissions: ['admin']
        } //页面需要的权限
    }]
}
```

自定义权限鉴定指令

```js
import Vue from 'vue'
/**权限指令**/
const has = Vue.directive('has', {
    bind: function (el, binding, vnode) {
        // 获取页面按钮权限
        let btnPermissionsArr = [];
        if(binding.value){
            // 如果指令传值，获取指令参数，根据指令参数和当前登录人按钮权限做比较。
            btnPermissionsArr = Array.of(binding.value);
        }else{
            // 否则获取路由中的参数，根据路由的btnPermissionsArr和当前登录人按钮权限做比较。
            btnPermissionsArr = vnode.context.$route.meta.btnPermissions;
        }
        if (!Vue.prototype.$_has(btnPermissionsArr)) {
            el.parentNode.removeChild(el);
        }
    }
});
// 权限检查方法
Vue.prototype.$_has = function (value) {
    let isExist = false;
    // 获取用户按钮权限
    let btnPermissionsStr = sessionStorage.getItem("btnPermissions");
    if (btnPermissionsStr == undefined || btnPermissionsStr == null) {
        return false;
    }
    if (value.indexOf(btnPermissionsStr) > -1) {
        isExist = true;
    }
    return isExist;
};
export {has}
```

在使用的按钮中只需要引用`v-has`指令

```js
<el-button @click='editClick' type="primary" v-has>编辑</el-button>
```

### 小结

关于权限如何选择哪种合适的方案，可以根据自己项目的方案项目，如考虑路由与菜单是否分离

权限需要前后端结合，前端尽可能的去控制，更多的需要后台判断

</details>

## 100. 大型项目中，Vue项目怎么划分结构和划分组件比较合理呢？ {#question-fe2b8ddc-c302-4179-a215-edcec1e80f3c}

> 难度：3 · 类型：QA

### 题目要点

在Vue项目中，良好的目录结构对于提高开发效率和项目可维护性至关重要。遵循一些基本原则可以帮助我们更清晰地组织代码和配置文件：

#### 划分原则

1. **文件夹和文件夹内部文件的语义一致性**：确保目录和文件命名清晰，易于理解其功能和用途。
2. **单一入口/出口**：每个模块应该有一个入口文件，所有对外的接口或组件都应该从这个入口文件引入。
3. **就近原则**：紧密相关的文件应该放在一起，并且使用相对路径引用。
4. **公共文件绝对路径引用**：共享的文件或组件应该从根目录引用，以保持一致性。
5. **/src 外的文件不应被引入**：将项目代码和配置文件清晰地分开，有助于管理和维护。

<details>
<summary>参考答案</summary>

## 一、为什么要划分

使用`vue`构建项目，项目结构清晰会提高开发效率，熟悉项目的各种配置同样会让开发效率更高

在划分项目结构的时候，需要遵循一些基本的原则：

- 文件夹和文件夹内部文件的语义一致性
- 单一入口/出口
- 就近原则，紧耦合的文件应该放到一起，且应以相对路径引用
- 公共的文件应该以绝对路径的方式从根目录引用
- `/src` 外的文件不应该被引入

### 文件夹和文件夹内部文件的语义一致性

我们的目录结构都会有一个文件夹是按照路由模块来划分的，如`pages`文件夹，这个文件夹里面应该包含我们项目所有的路由模块，并且仅应该包含路由模块，而不应该有别的其他的非路由模块的文件夹

这样做的好处在于一眼就从 `pages`文件夹看出这个项目的路由有哪些

### 单一入口/出口

举个例子，在`pages`文件夹里面存在一个`seller`文件夹，这时候`seller` 文件夹应该作为一个独立的模块由外部引入，并且 `seller/index.js` 应该作为外部引入 seller 模块的唯一入口

```js
// 错误用法
import sellerReducer from 'src/pages/seller/reducer'

// 正确用法
import { reducer as sellerReducer } from 'src/pages/seller'
```

这样做的好处在于，无论你的模块文件夹内部有多乱，外部引用的时候，都是从一个入口文件引入，这样就很好的实现了隔离，如果后续有重构需求，你就会发现这种方式的优点

### 就近原则，紧耦合的文件应该放到一起，且应以相对路径引用

使用相对路径可以保证模块内部的独立性

```js
// 正确用法
import styles from './index.module.scss'
// 错误用法
import styles from 'src/pages/seller/index.module.scss'
```

举个例子

假设我们现在的 seller 目录是在 `src/pages/seller`，如果我们后续发生了路由变更，需要加一个层级，变成 `src/pages/user/seller`。

如果我们采用第一种相对路径的方式，那就可以直接将整个文件夹拖过去就好，`seller` 文件夹内部不需要做任何变更。

但是如果我们采用第二种绝对路径的方式，移动文件夹的同时，还需要对每个 `import` 的路径做修改

### 公共的文件应该以绝对路径的方式从根目录引用

公共指的是多个路由模块共用，如一些公共的组件，我们可以放在`src/components`下

在使用到的页面中，采用绝对路径的形式引用

```js
// 错误用法
import Input from '../../components/input'
// 正确用法
import Input from 'src/components/input'
```

同样的，如果我们需要对文件夹结构进行调整。将 `/src/components/input` 变成 `/src/components/new/input`，如果使用绝对路径，只需要全局搜索替换

再加上绝对路径有全局的语义，相对路径有独立模块的语义

### /src 外的文件不应该被引入

`vue-cli`脚手架已经帮我们做了相关的约束了，正常我们的前端项目都会有个` src `文件夹，里面放着所有的项目需要的资源，`js`,` css`, `png`, `svg` 等等。`src` 外会放一些项目配置，依赖，环境等文件

这样的好处是方便划分项目代码文件和配置文件

## 二、目录结构

单页面目录结构

```js
project
│  .browserslistrc
│  .env.production
│  .eslintrc.js
│  .gitignore
│  babel.config.js
│  package-lock.json
│  package.json
│  README.md
│  vue.config.js
│  yarn-error.log
│  yarn.lock
│
├─public
│      favicon.ico
│      index.html
│
|-- src
    |-- components
        |-- input
            |-- index.js
            |-- index.module.scss
    |-- pages
        |-- seller
            |-- components
                |-- input
                    |-- index.js
                    |-- index.module.scss
            |-- reducer.js
            |-- saga.js
            |-- index.js
            |-- index.module.scss
        |-- buyer
            |-- index.js
        |-- index.js
```

多页面目录结构

```js
my-vue-test:.
│  .browserslistrc
│  .env.production
│  .eslintrc.js
│  .gitignore
│  babel.config.js
│  package-lock.json
│  package.json
│  README.md
│  vue.config.js
│  yarn-error.log
│  yarn.lock
│
├─public
│      favicon.ico
│      index.html
│
└─src
    ├─apis //接口文件根据页面或实例模块化
    │      index.js
    │      login.js
    │
    ├─components //全局公共组件
    │  └─header
    │          index.less
    │          index.vue
    │
    ├─config //配置（环境变量配置不同passid等）
    │      env.js
    │      index.js
    │
    ├─contant //常量
    │      index.js
    │
    ├─images //图片
    │      logo.png
    │
    ├─pages //多页面vue项目，不同的实例
    │  ├─index //主实例
    │  │  │  index.js
    │  │  │  index.vue
    │  │  │  main.js
    │  │  │  router.js
    │  │  │  store.js
    │  │  │
    │  │  ├─components //业务组件
    │  │  └─pages //此实例中的各个路由
    │  │      ├─amenu
    │  │      │      index.vue
    │  │      │
    │  │      └─bmenu
    │  │              index.vue
    │  │
    │  └─login //另一个实例
    │          index.js
    │          index.vue
    │          main.js
    │
    ├─scripts //包含各种常用配置，工具函数
    │  │  map.js
    │  │
    │  └─utils
    │          helper.js
    │
    ├─store //vuex仓库
    │  │  index.js
    │  │
    │  ├─index
    │  │      actions.js
    │  │      getters.js
    │  │      index.js
    │  │      mutation-types.js
    │  │      mutations.js
    │  │      state.js
    │  │
    │  └─user
    │          actions.js
    │          getters.js
    │          index.js
    │          mutation-types.js
    │          mutations.js
    │          state.js
    │
    └─styles //样式统一配置
        │  components.less
        │
        ├─animation
        │      index.less
        │      slide.less
        │
        ├─base
        │      index.less
        │      style.less
        │      var.less
        │      widget.less
        │
        └─common
                index.less
                reset.less
                style.less
                transition.less
```

### 小结

项目的目录结构很重要，因为目录结构能体现很多东西，怎么规划目录结构可能每个人有自己的理解，但是按照一定的规范去进行目录的设计，能让项目整个架构看起来更为简洁，更加易用

</details>

## 101. SSR是什么？Vue中怎么实现？ {#question-4a0ca854-e576-4046-a740-f1ef8d4060c9}

> 难度：3.5 · 类型：QA

### 题目要点

服务器端渲染（SSR，Server-Side Rendering）是一种技术，用于在服务器上预先生成 HTML 页面，然后将完整的 HTML 页面发送到客户端，以提供更好的性能和搜索引擎优化。Vue 框架支持 SSR，通过 Vue Server Renderer 模块实现。

以下是使用 Vue 实现 SSR 的基本步骤：

1. **安装相关依赖**：确保你的项目中已经安装了 Vue、Vue Router、Vue Server Renderer 等依赖。
2. **创建服务器入口文件**：创建一个服务器入口文件，如 `server.js`。在文件中引入必要的模块，包括 Vue、Vue Server Renderer、Express（或其他后端框架）等。
3. **编写服务器端渲染逻辑**：
   - 创建一个 Vue 实例，配置路由、数据等。
   - 使用 Vue Server Renderer 的 `createRenderer` 方法创建一个 renderer 实例。
   - 在路由处理器中调用 renderer 实例的 `renderToString` 方法来将 Vue 实例渲染为字符串。
4. **处理静态资源**：在服务器端渲染时，需要处理静态资源的加载和引用。可以使用 Webpack 进行服务器端渲染的配置，以处理静态资源的导出和加载。
5. **客户端激活**：在服务器端渲染后，需要在客户端激活 Vue 实例，以便能够响应交互事件和更新页面。可以在 HTML 中插入一个 JavaScript 脚本，并在脚本中使用 `createApp` 方法来创建客户端应用程序实例。

<details>
<summary>参考答案</summary>

## 什么是 SSR
SSR（Server-Side Rendering，服务器端渲染）是一种将应用程序的界面在服务器上进行预先渲染并以 HTML 形式发送到客户端的技术。与传统的客户端渲染（CSR）相比，SSR 在服务器端生成完整的 HTML 页面，然后将其发送到浏览器，以提供更好的性能和搜索引擎优化。

在传统的客户端渲染中，浏览器会下载一个包含 JavaScript 代码的文件，并在客户端执行该代码来构建和呈现页面。这意味着页面初始加载时只是一个空壳，页面内容需要在浏览器中通过 JavaScript 进行渲染。

而在 SSR 中，服务器接收到请求后，会根据请求的路由和数据，预先生成完整的 HTML 页面，其中包含了初始状态下的页面内容。服务器将这个完整的 HTML 页面发送给浏览器，浏览器无需再执行额外的 JavaScript，即可直接展示出页面内容。

SSR 的优势包括：
- 更快的首次渲染：由于服务器在响应请求时已经生成了完整的 HTML 页面，所以用户打开页面时可以立即看到内容，无需等待 JavaScript 下载和执行。
- 更好的搜索引擎优化（SEO）：搜索引擎爬虫能够抓取到完整的 HTML 页面，并且页面内容可直接被搜索引擎索引。
- 更好的用户体验：页面内容在服务器端渲染完成后即可展示，减少了白屏时间和加载等待。

需要注意的是，SSR 可能会增加服务器负载和响应时间，并且涉及到一些复杂性，例如处理路由、状态管理等。因此，在选择是否使用 SSR 时，需要根据项目需求和复杂性来权衡利弊。

## 怎么使用 Vue 框架实现 SSR

可以按照以下步骤进行操作：

1. **安装相关依赖**:
   - 首先，确保你的项目中已经安装了 Vue 相关的依赖和构建工具，如 Vue、Vue Router、Vue Server Renderer 等。

2. **创建服务器入口文件**:
   - 在项目中创建一个服务器入口文件，通常命名为 `server.js` 或类似名称。
   - 在该文件中，引入必要的模块，包括 Vue、Vue Server Renderer、Express（或其他后端框架）等。
   - 创建一个 Express 应用实例，并设置路由处理器来处理不同请求。

3. **编写服务器端渲染逻辑**:
   - 在服务器入口文件中，编写服务器端渲染的逻辑。
   - 创建一个 Vue 实例，并配置路由、数据等相关内容。
   - 使用 Vue Server Renderer 的 `createRenderer` 方法创建一个 renderer 实例。
   - 在路由处理器中调用 renderer 实例的 `renderToString` 方法来将 Vue 实例渲染为字符串。

4. **处理静态资源**:
   - 在服务器端渲染时，需要处理静态资源（如样式表、图片等）的加载和引用。
   - 可以使用 Webpack 进行服务器端渲染的配置，以处理静态资源的导出和加载。

5. **客户端激活**:
   - 在服务器端渲染后，需要在客户端激活 Vue 实例，以便能够响应交互事件和更新页面。
   - 可以通过在 HTML 中插入一个 JavaScript 脚本，并在脚本中使用 `createApp` 方法来创建客户端应用程序实例。

以上步骤是一个简单的 SSR 实现流程，可以参考 Vue 官方文档中提供的 [SSR 指南](https://ssr.vuejs.org/)获取更详细的信息和示例代码。

</details>

## 102. Vue项目中有封装过axios吗？怎么封装的？ {#question-71d2fd07-2629-4ffd-a9ea-750ee912f912}

> 难度：2 · 类型：QA

### 题目要点

封装axios的要点主要包括以下几个方面：

1. **创建axios实例**：
   - 使用`axios.create()`方法创建一个axios实例，这样可以根据不同的需求配置多个axios实例。
   - 设置基础URL（`baseURL`），这样请求时就不需要重复指定URL的前缀部分。
   - 设置请求超时时间（`timeout`），避免请求长时间无响应。

2. **请求拦截器（Request Interceptors）**：
   - 在发送请求之前进行预处理，比如添加认证token、设置请求头等。
   - 可以对请求进行错误处理，比如请求参数校验失败时直接取消请求。

3. **响应拦截器（Response Interceptors）**：
   - 在接收到响应后进行预处理，比如统一处理状态码、转换数据格式等。
   - 可以在这里处理全局的错误信息，比如网络错误、服务器错误等，并给用户友好的提示。

4. **错误处理**：
   - 在拦截器中，使用`Promise.reject()`将错误传递到调用链的下一层，方便调用者进行错误处理。
   - 可以在全局或组件级别添加错误处理逻辑，比如显示错误提示、重试请求等。

5. **模块化**：
   - 将封装的axios实例导出为模块，方便在项目中其他地方引入和使用。
   - 可以根据业务需求将不同的API请求封装成单独的函数或模块，提高代码的组织性和可维护性。

6. **环境变量**：
   - 使用环境变量（如`.env`文件）来管理API的基础URL等配置信息，便于在不同环境下（开发、测试、生产）使用不同的配置。

7. **可扩展性**：
   - 封装时考虑未来的扩展性，比如添加请求重试机制、日志记录等。

<details>
<summary>参考答案</summary>

## 一、axios是什么

`axios` 是一个轻量的 `HTTP`客户端

基于 `XMLHttpRequest` 服务来执行 `HTTP` 请求，支持丰富的配置，支持 `Promise`，支持浏览器端和 `Node.js` 端。自`Vue`2.0起，尤大宣布取消对 `vue-resource` 的官方推荐，转而推荐 `axios`。现在 `axios` 已经成为大部分 `Vue` 开发者的首选

### 特性

- 从浏览器中创建 `XMLHttpRequests`
- 从 `node.js` 创建 `http`请求
- 支持 `Promise` API
- 拦截请求和响应
- 转换请求数据和响应数据
- 取消请求
- 自动转换` JSON` 数据
- 客户端支持防御`XSRF`

### 基本使用

安装

```js
// 项目中安装
npm install axios --S
// cdn 引入
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

导入

```js
import axios from 'axios'
```

发送请求

```js
axios({
  url:'xxx',    // 设置请求的地址
  method:"GET", // 设置请求方法
  params:{      // get请求使用params进行参数凭借,如果是post请求用data
    type: '',
    page: 1
  }
}).then(res => {
  // res为后端返回的数据
  console.log(res);
})
```

并发请求`axios.all([])`

```js
function getUserAccount() {
    return axios.get('/user/12345');
}

function getUserPermissions() {
    return axios.get('/user/12345/permissions');
}

axios.all([getUserAccount(), getUserPermissions()])
    .then(axios.spread(function (res1, res2) {
    // res1第一个请求的返回的内容，res2第二个请求返回的内容
    // 两个请求都执行完成才会执行
}));
```

## 二、为什么要封装

`axios` 的 API 很友好，你完全可以很轻松地在项目中直接使用。

不过随着项目规模增大，如果每发起一次`HTTP`请求，就要把这些比如设置超时时间、设置请求头、根据项目环境判断使用哪个请求地址、错误处理等等操作，都需要写一遍

这种重复劳动不仅浪费时间，而且让代码变得冗余不堪，难以维护。为了提高我们的代码质量，我们应该在项目中二次封装一下 `axios` 再使用

举个例子：

```js
axios('http://localhost:3000/data', {
  // 配置代码
  method: 'GET',
  timeout: 1000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'xxx',
  },
  transformRequest: [function (data, headers) {
    return data;
  }],
  // 其他请求配置...
})
.then((data) => {
  // todo: 真正业务逻辑代码
  console.log(data);
}, (err) => {
  // 错误处理代码
  if (err.response.status === 401) {
  // handle authorization error
  }
  if (err.response.status === 403) {
  // handle server forbidden error
  }
  // 其他错误处理.....
  console.log(err);
});
```

如果每个页面都发送类似的请求，都要写一堆的配置与错误处理，就显得过于繁琐了

这时候我们就需要对`axios`进行二次封装，让使用更为便利

## 三、如何封装

封装的同时，你需要和 后端协商好一些约定，请求头，状态码，请求超时时间.......

设置接口请求前缀：根据开发、测试、生产环境的不同，前缀需要加以区分

请求头 :  来实现一些具体的业务，必须携带一些参数才可以请求(例如：会员业务)

状态码:   根据接口返回的不同`status` ， 来执行不同的业务，这块需要和后端约定好

请求方法：根据`get`、`post`等方法进行一个再次封装，使用起来更为方便

请求拦截器:  根据请求的请求头设定，来决定哪些请求可以访问

响应拦截器： 这块就是根据 后端`返回来的状态码判定执行不同业务

### 设置接口请求前缀

利用`node`环境变量来作判断，用来区分开发、测试、生产环境

```js
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://dev.xxx.com'
} else if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'http://prod.xxx.com'
}
```

在本地调试的时候，还需要在`vue.config.js`文件中配置`devServer`实现代理转发，从而实现跨域

```js
devServer: {
    proxy: {
      '/proxyApi': {
        target: 'http://dev.xxx.com',
        changeOrigin: true,
        pathRewrite: {
          '/proxyApi': ''
        }
      }
    }
  }
```

### 设置请求头与超时时间

大部分情况下，请求头都是固定的，只有少部分情况下，会需要一些特殊的请求头，这里将普适性的请求头作为基础配置。当需要特殊请求头时，将特殊请求头作为参数传入，覆盖基础配置

```js
const service = axios.create({
    ...
    timeout: 30000,  // 请求 30s 超时
      headers: {
        get: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
          // 在开发中，一般还需要单点登录或者其他功能的通用请求头，可以一并配置进来
        },
        post: {
          'Content-Type': 'application/json;charset=utf-8'
          // 在开发中，一般还需要单点登录或者其他功能的通用请求头，可以一并配置进来
        }
  },
})
```

### 封装请求方法

先引入封装好的方法，在要调用的接口重新封装成一个方法暴露出去

```js
// get 请求
export function httpGet({
  url,
  params = {}
}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params
    }).then((res) => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

// post
// post请求
export function httpPost({
  url,
  data = {},
  params = {}
}) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'post',
      transformRequest: [function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      }],
      // 发送的数据
      data,
      // url参数
      params

    }).then(res => {
      resolve(res.data)
    })
  })
}
```

把封装的方法放在一个`api.js`文件中

```js
import { httpGet, httpPost } from './http'
export const getorglist = (params = {}) => httpGet({ url: 'apps/api/org/list', params })
```

页面中就能直接调用

```js
// .vue
import { getorglist } from '@/assets/js/api'

getorglist({ id: 200 }).then(res => {
  console.log(res)
})
```

这样可以把`api`统一管理起来，以后维护修改只需要在`api.js`文件操作即可

### 请求拦截器

请求拦截器可以在每个请求里加上token，做了统一处理后维护起来也方便

```js
// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 每次发送请求之前判断是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况，此处token一般是用户完成登录后储存到localstorage里的
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  })
```

### 响应拦截器

响应拦截器可以在接收到响应后先做一层操作，如根据状态码判断登录状态、授权

```js
// 响应拦截器
axios.interceptors.response.use(response => {
  // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
  // 否则的话抛出错误
  if (response.status === 200) {
    if (response.data.code === 511) {
      // 未授权调取授权接口
    } else if (response.data.code === 510) {
      // 未登录跳转登录页
    } else {
      return Promise.resolve(response)
    }
  } else {
    return Promise.reject(response)
  }
}, error => {
  // 我们可以在这里对异常状态作统一处理
  if (error.response.status) {
    // 处理请求失败的情况
    // 对不同返回码对相应处理
    return Promise.reject(error.response)
  }
})
```

### 小结

- 封装是编程中很有意义的手段，简单的`axios`封装，就可以让我们可以领略到它的魅力
- 封装 `axios` 没有一个绝对的标准，只要你的封装可以满足你的项目需求，并且用起来方便，那就是一个好的封装方案

</details>

## 103. 说说vue中的diff算法 {#question-7d27dc57-5d95-4e3f-88a7-eb685b7c21e4}

> 难度：3 · 类型：QA

### 题目要点

`diff`算法是一种高效的比较算法，主要用于比较虚拟`DOM`节点，以确定如何更新真实`DOM`。它具有两个特点：只会在同层级进行比较，不会跨层级比较；在比较的过程中，循环从两边向中间收拢。

在Vue中，`diff`算法用于比较新旧`VNode`节点，以决定如何更新真实`DOM`。

这个过程分为以下几个步骤：

1. **比较新旧`VNode`节点**：如果新旧节点相同，则不做任何操作；如果新旧节点都不存在子节点，则直接结束比较；如果新旧节点都有子节点，则进入`updateChildren`函数比较子节点。
2. **更新子节点**：在`updateChildren`函数中，设置新旧`VNode`的头尾指针，然后从两边向中间比较。如果新旧头尾指针相同，则直接`patchVnode`；如果新旧头尾指针不同，则根据情况调用`patchVnode`、`createElm`创建新节点，或者从哈希表寻找`key`一致的旧`VNode`节点再进行分情况操作。
3. **`patchVnode`方法**：如果新旧节点都有文本节点且不相等，则设置真实`dom`的文本节点为新节点的文本节点；如果旧节点有子节点而新节点没有，则删除旧节点的子节点；如果旧节点没有子节点而新节点有，则将新节点的子节点真实化后添加到旧节点；如果两者都有子节点，则进入`updateChildren`函数比较子节点。

通过`diff`算法，Vue能够高效地比较新旧`VNode`节点，以决定如何更新真实`DOM`，从而提高页面渲染的性能。

<details>
<summary>参考答案</summary>

## 一、是什么

`diff` 算法是一种通过同层的树节点进行比较的高效算法

其有两个特点：
- 比较只会在同层级进行, 不会跨层级比较
- 在diff比较的过程中，循环从两边向中间比较

`diff` 算法的在很多场景下都有应用，在 `vue` 中，作用于虚拟 `dom` 渲染成真实 `dom` 的新旧 `VNode` 节点比较

## 二、比较方式

`diff`整体策略为：深度优先，同层比较

1. 比较只会在同层级进行, 不会跨层级比较

![](https://static.ecool.fun//article/6366ea3c-b5f9-4add-a1d9-8fb1e7b6c726.png)

2. 比较的过程中，循环从两边向中间收拢

![](https://static.ecool.fun//article/66a1b47c-6fd5-4a1a-80a9-a7bbfdf30022.png)

下面举个`vue`通过`diff`算法更新的例子：

新旧`VNode`节点如下图所示：

![](https://static.ecool.fun//article/d64ad3e5-4892-415d-92ce-e5556dd0548e.png)

第一次循环后，发现旧节点D与新节点D相同，直接复用旧节点D作为`diff`后的第一个真实节点，同时旧节点`endIndex`移动到C，新节点的 `startIndex` 移动到了 C

![](https://static.ecool.fun//article/5ff039e0-4bb9-49ee-9921-85a11476131b.png)

第二次循环后，同样是旧节点的末尾和新节点的开头(都是 C)相同，同理，`diff` 后创建了 C 的真实节点插入到第一次创建的 B 节点后面。同时旧节点的 `endIndex` 移动到了 B，新节点的 `startIndex` 移动到了 E

![](https://static.ecool.fun//article/5d753795-ae75-441e-9f57-cc55a62a1a6d.png)

第三次循环中，发现E没有找到，这时候只能直接创建新的真实节点 E，插入到第二次创建的 C 节点之后。同时新节点的 `startIndex` 移动到了 A。旧节点的 `startIndex` 和 `endIndex` 都保持不动

![](https://static.ecool.fun//article/4b863487-0c0b-4993-9222-cc5ce85c4a7b.png)

第四次循环中，发现了新旧节点的开头(都是 A)相同，于是 `diff` 后创建了 A 的真实节点，插入到前一次创建的 E 节点后面。同时旧节点的 `startIndex` 移动到了 B，新节点的` startIndex` 移动到了 B

![](https://static.ecool.fun//article/e88197ab-c05d-4e10-98e9-bf35d87e3ebc.png)

第五次循环中，情形同第四次循环一样，因此 `diff` 后创建了 B 真实节点 插入到前一次创建的 A 节点后面。同时旧节点的 `startIndex `移动到了 C，新节点的 startIndex 移动到了 F

![](https://static.ecool.fun//article/53b186bb-dde2-424b-b331-bfe72e63da8c.png)

新节点的 `startIndex` 已经大于 `endIndex` 了，需要创建 `newStartIdx` 和 `newEndIdx` 之间的所有节点，也就是节点F，直接创建 F 节点对应的真实节点放到 B 节点后面

![](https://static.ecool.fun//article/08429a13-7804-4a75-a0e9-4073600676a4.png)

## 三、原理分析

当数据发生改变时，`set`方法会调用`Dep.notify`通知所有订阅者`Watcher`，订阅者就会调用`patch`给真实的`DOM`打补丁，更新相应的视图

源码位置：src/core/vdom/patch.js

```js
function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) { // 没有新节点，直接执行destory钩子函数
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
        isInitialPatch = true
        createElm(vnode, insertedVnodeQueue) // 没有旧节点，直接用新节点生成dom元素
    } else {
        const isRealElement = isDef(oldVnode.nodeType)
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
            // 判断旧节点和新节点自身一样，一致执行patchVnode
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
        } else {
            // 否则直接销毁及旧节点，根据新节点生成dom元素
            if (isRealElement) {

                if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                    oldVnode.removeAttribute(SSR_ATTR)
                    hydrating = true
                }
                if (isTrue(hydrating)) {
                    if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                        invokeInsertHook(vnode, insertedVnodeQueue, true)
                        return oldVnode
                    }
                }
                oldVnode = emptyNodeAt(oldVnode)
            }
            return vnode.elm
        }
    }
}
```

`patch`函数前两个参数位为`oldVnode` 和 `Vnode` ，分别代表新的节点和之前的旧节点，主要做了四个判断：

- 没有新节点，直接触发旧节点的`destory`钩子
- 没有旧节点，说明是页面刚开始初始化的时候，此时，根本不需要比较了，直接全是新建，所以只调用 `createElm`
- 旧节点和新节点自身一样，通过 `sameVnode` 判断节点是否一样，一样时，直接调用 `patchVnode `去处理这两个节点
- 旧节点和新节点自身不一样，当两个节点不一样的时候，直接创建新节点，删除旧节点

下面主要讲的是`patchVnode`部分

```js
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 如果新旧节点一致，什么都不做
    if (oldVnode === vnode) {
      return
    }

    // 让vnode.el引用到现在的真实dom，当el修改时，vnode.el会同步变化
    const elm = vnode.elm = oldVnode.elm

    // 异步占位符
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }
    // 如果新旧都是静态节点，并且具有相同的key
    // 当vnode是克隆节点或是v-once指令控制的节点时，只需要把oldVnode.elm和oldVnode.child都复制到vnode上
    // 也不用再有其他操作
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // 如果vnode不是文本节点或者注释节点
    if (isUndef(vnode.text)) {
      // 并且都有子节点
      if (isDef(oldCh) && isDef(ch)) {
        // 并且子节点不完全一致，则调用updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)

        // 如果只有新的vnode有子节点
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // elm已经引用了老的dom节点，在老的dom节点上添加子节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)

        // 如果新vnode没有子节点，而vnode有子节点，直接删除老的oldCh
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)

        // 如果老节点是文本节点
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }

      // 如果新vnode和老vnode是文本节点或注释节点
      // 但是vnode.text != oldVnode.text时，只需要更新vnode.elm的文本内容就可以
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

`patchVnode`主要做了几个判断：

- 新节点是否是文本节点，如果是，则直接更新`dom`的文本内容为新节点的文本内容
- 新节点和旧节点如果都有子节点，则处理比较更新子节点
- 只有新节点有子节点，旧节点没有，那么不用比较了，所有节点都是全新的，所以直接全部新建就好了，新建是指创建出所有新`DOM`，并且添加进父节点
- 只有旧节点有子节点而新节点没有，说明更新后的页面，旧节点全部都不见了，那么要做的，就是把所有的旧节点删除，也就是直接把`DOM` 删除

子节点不完全一致，则调用`updateChildren`

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0 // 旧头索引
    let newStartIdx = 0 // 新头索引
    let oldEndIdx = oldCh.length - 1 // 旧尾索引
    let newEndIdx = newCh.length - 1 // 新尾索引
    let oldStartVnode = oldCh[0] // oldVnode的第一个child
    let oldEndVnode = oldCh[oldEndIdx] // oldVnode的最后一个child
    let newStartVnode = newCh[0] // newVnode的第一个child
    let newEndVnode = newCh[newEndIdx] // newVnode的最后一个child
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    // 如果oldStartVnode和oldEndVnode重合，并且新的也都重合了，证明diff完了，循环结束
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 如果oldVnode的第一个child不存在
      if (isUndef(oldStartVnode)) {
        // oldStart索引右移
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left

      // 如果oldVnode的最后一个child不存在
      } else if (isUndef(oldEndVnode)) {
        // oldEnd索引左移
        oldEndVnode = oldCh[--oldEndIdx]

      // oldStartVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // patch oldStartVnode和newStartVnode， 索引左移，继续循环
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]

      // oldEndVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // patch oldEndVnode和newEndVnode，索引右移，继续循环
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]

      // oldStartVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // patch oldStartVnode和newEndVnode
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldStartVnode.eml移动到oldEndVnode.elm之后
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        // oldStart索引右移，newEnd索引左移
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]

      // 如果oldEndVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // patch oldEndVnode和newStartVnode
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldEndVnode.elm移动到oldStartVnode.elm之前
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        // oldEnd索引左移，newStart索引右移
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]

      // 如果都不匹配
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)

        // 尝试在oldChildren中寻找和newStartVnode的具有相同的key的Vnode
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

        // 如果未找到，说明newStartVnode是一个新的节点
        if (isUndef(idxInOld)) { // New element
          // 创建一个新Vnode
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)

        // 如果找到了和newStartVnodej具有相同的key的Vnode，叫vnodeToMove
        } else {
          vnodeToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !vnodeToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          }

          // 比较两个具有相同的key的新节点是否是同一个节点
          //不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // patch vnodeToMove和newStartVnode
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            // 清除
            oldCh[idxInOld] = undefined
            // 如果removeOnly是false，则将找到的和newStartVnodej具有相同的key的Vnode，叫vnodeToMove.elm
            // 移动到oldStartVnode.elm之前
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)

          // 如果key相同，但是节点不相同，则创建一个新的节点
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          }
        }

        // 右移
        newStartVnode = newCh[++newStartIdx]
      }
    }
```

`while`循环主要处理了以下五种情景：

- 当新老 `VNode` 节点的 `start` 相同时，直接 `patchVnode` ，同时新老 `VNode` 节点的开始索引都加 1
- 当新老 `VNode` 节点的 `end`相同时，同样直接 `patchVnode` ，同时新老 `VNode` 节点的结束索引都减 1
- 当老 `VNode` 节点的 `start` 和新 `VNode` 节点的 `end` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldEndVnode` 的后面，同时老 `VNode` 节点开始索引加 1，新 `VNode` 节点的结束索引减 1
- 当老 `VNode` 节点的 `end` 和新 `VNode` 节点的 `start` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldStartVnode` 的前面，同时老 `VNode` 节点结束索引减 1，新 `VNode` 节点的开始索引加 1
- 如果都不满足以上四种情形，那说明没有相同的节点可以复用，则会分为以下两种情况：
  - 从旧的 `VNode` 为 `key` 值，对应 `index` 序列为 `value` 值的哈希表中找到与 `newStartVnode` 一致 `key` 的旧的 `VNode` 节点，再进行`patchVnode `，同时将这个真实 `dom `移动到 `oldStartVnode` 对应的真实 `dom` 的前面
  - 调用 `createElm` 创建一个新的 `dom` 节点放到当前 `newStartIdx` 的位置

### 小结

- 当数据发生改变时，订阅者`watcher`就会调用`patch`给真实的`DOM`打补丁
- 通过`isSameVnode`进行判断，相同则调用`patchVnode`方法
- `patchVnode`做了以下操作：
  - 找到对应的真实`dom`，称为`el`
  - 如果都有都有文本节点且不相等，将`el`文本节点设置为`Vnode`的文本节点
  - 如果`oldVnode`有子节点而`VNode`没有，则删除`el`子节点
  - 如果`oldVnode`没有子节点而`VNode`有，则将`VNode`的子节点真实化后添加到`el`
  - 如果两者都有子节点，则执行`updateChildren`函数比较子节点
- `updateChildren`主要做了以下操作：
  - 设置新旧`VNode`的头尾指针
  - 新旧头尾指针进行比较，循环向中间靠拢，根据情况调用`patchVnode`进行`patch`重复流程、调用`createElem`创建一个新节点，从哈希表寻找 `key`一致的`VNode` 节点再分情况操作

</details>

## 104. 什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路 {#question-d5acd6cf-38c3-4afb-965d-be79f03cd045}

> 难度：3.5 · 类型：QA

### 题目要点

虚拟DOM（Virtual DOM）是一种抽象层，它将真实的DOM操作转换为JavaScript对象的操作，这些对象被称为VNode（虚拟节点）。

VNode对象通常包含标签名、属性、子节点和文本等属性，以模拟真实的DOM节点。通过这种方式，可以对虚拟DOM进行高效操作，比如创建、删除和修改节点，而无需直接操作真实的DOM，从而提高了性能。

Vue.js 框架使用虚拟DOM来实现高效的DOM更新。在Vue中，每当数据变化时，会通过一系列操作（如创建VNode、更新VNode等）来更新虚拟DOM，然后通过diff算法比较新旧虚拟DOM，找出需要更新的最小单位，最后将这些更新应用到真实的DOM上。

虚拟DOM的主要优势在于它提供了一种高效的DOM操作方式，并且具有跨平台的能力。通过虚拟DOM，Vue能够支持如React Native和Weex等跨平台应用的开发。

在Vue中，`createElement`函数用于创建VNode。这个函数接收几个参数，包括上下文环境、标签名、数据对象（包含属性、事件监听器等）、子节点等，并返回一个VNode对象。VNode对象可以包含子节点，形成一个虚拟树结构，这个结构最终会被映射到真实的DOM树上。

<details>
<summary>参考答案</summary>

## 一、什么是虚拟DOM

虚拟 DOM （`Virtual DOM` ）这个概念相信大家都不陌生，从 `React` 到 `Vue` ，虚拟 `DOM` 为这两个框架都带来了跨平台的能力（`React-Native` 和 `Weex`）

实际上它只是一层对真实`DOM`的抽象，以`JavaScript` 对象 (`VNode` 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上

在`Javascript`对象中，虚拟`DOM` 表现为一个 `Object `对象。并且最少包含标签名 (`tag`)、属性 (`attrs`) 和子元素对象 (`children`) 三个属性，不同框架对这三个属性的名命可能会有差别

创建虚拟`DOM`就是为了更好将虚拟的节点渲染到页面视图中，所以虚拟`DOM`对象的节点与真实`DOM`的属性一一照应

在`vue`中同样使用到了虚拟`DOM`技术

定义真实`DOM`

```html
<div id="app">
    <p class="p">节点内容</p>
    <h3>{{ foo }}</h3>
</div>
```

实例化`vue`

```js
const app = new Vue({
    el:"#app",
    data:{
        foo:"foo"
    }
})
```

观察`render`的`render`，我们能得到虚拟`DOM`

```js
(function anonymous(
) {
    with(this){return _c('div',{attrs:{"id":"app"}},[_c('p',{staticClass:"p"},
                      [_v("节点内容")]),_v(" "),_c('h3',[_v(_s(foo))])])}})
```

通过`VNode`，`vue`可以对这颗抽象树进行创建节点,删除节点以及修改节点的操作， 经过`diff`算法得出一些需要修改的最小单位,再更新视图，减少了`dom`操作，提高了性能

## 二、为什么需要虚拟DOM

`DOM`是很慢的，其元素非常庞大，页面的性能问题，大部分都是由`DOM`操作引起的

真实的`DOM`节点，哪怕一个最简单的`div`也包含着很多属性，可以打印出来直观感受一下：
 ![](https://static.ecool.fun//article/2967524b-26f4-44a1-ae01-818bd4283f23.png)

由此可见，操作`DOM`的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户的体验

**举个例子：**

你用传统的原生`api`或`jQuery`去操作`DOM`时，浏览器会从构建`DOM`树开始从头到尾执行一遍流程

当你在一次操作时，需要更新10个`DOM`节点，浏览器没这么智能，收到第一个更新`DOM`请求后，并不知道后续还有9次更新操作，因此会马上执行流程，最终执行10次流程

而通过`VNode`，同样更新10个`DOM`节点，虚拟`DOM`不会立即操作`DOM`，而是将这10次更新的`diff`内容保存到本地的一个`js`对象中，最终将这个`js`对象一次性`attach`到`DOM`树上，避免大量的无谓计算

> 很多人认为虚拟 DOM 最大的优势是 diff 算法，减少 JavaScript 操作真实 DOM 的带来的性能消耗。虽然这一个虚拟 DOM 带来的一个优势，但并不是全部。虚拟 DOM 最大的优势在于抽象了原本的渲染过程，实现了跨平台的能力，而不仅仅局限于浏览器的 DOM，可以是安卓和 IOS 的原生组件，可以是近期很火热的小程序，也可以是各种GUI

## 三、如何实现虚拟DOM

首先可以看看`vue`中`VNode`的结构

源码位置：src/core/vdom/vnode.js

```js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    /*当前节点的标签名*/
    this.tag = tag
    /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.data = data
    /*当前节点的子节点，是一个数组*/
    this.children = children
    /*当前节点的文本*/
    this.text = text
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm
    /*当前节点的名字空间*/
    this.ns = undefined
    /*编译作用域*/
    this.context = context
    /*函数化组件作用域*/
    this.functionalContext = undefined
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key
    /*组件的option选项*/
    this.componentOptions = componentOptions
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined
    /*当前节点的父节点*/
    this.parent = undefined
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false
    /*静态节点标志*/
    this.isStatic = false
    /*是否作为跟节点插入*/
    this.isRootInsert = true
    /*是否为注释节点*/
    this.isComment = false
    /*是否为克隆节点*/
    this.isCloned = false
    /*是否有v-once指令*/
    this.isOnce = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next https://github.com/answershuto/learnVue*/
  get child (): Component | void {
    return this.componentInstance
  }
}
```

这里对`VNode`进行稍微的说明：

- 所有对象的 `context` 选项都指向了 `Vue` 实例
- `elm` 属性则指向了其相对应的真实 `DOM` 节点

`vue`是通过`createElement`生成`VNode`

源码位置：src/core/vdom/create-element.js

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

上面可以看到`createElement` 方法实际上是对 `_createElement` 方法的封装，对参数的传入进行了判断

```javascript
export function _createElement(
    context: Component,
    tag?: string | Class<Component> | Function | Object,
    data?: VNodeData,
    children?: any,
    normalizationType?: number
): VNode | Array<VNode> {
    if (isDef(data) && isDef((data: any).__ob__)) {
        process.env.NODE_ENV !== 'production' && warn(
            `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
            context`
        )
        return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
        tag = data.is
    }
    if (!tag) {
        // in case of component :is set to falsy value
        return createEmptyVNode()
    }
    ...
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
        typeof children[0] === 'function'
    ) {
        data = data || {}
        data.scopedSlots = { default: children[0] }
        children.length = 0
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children)
    } else if ( === SIMPLE_NORMALIZE) {
        children = simpleNormalizeChildren(children)
    }
    // 创建VNode
    ...
}
```

可以看到`_createElement`接收5个参数：

- `context` 表示 `VNode` 的上下文环境，是 `Component` 类型
- tag 表示标签，它可以是一个字符串，也可以是一个 `Component`

- `data` 表示 `VNode` 的数据，它是一个 `VNodeData` 类型

- `children` 表示当前 `VNode `的子节点，它是任意类型的

- `normalizationType` 表示子节点规范的类型，类型不同规范的方法也就不一样，主要是参考 `render` 函数是编译生成的还是用户手写的

根据`normalizationType` 的类型，`children`会有不同的定义

```js
if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
} else if ( === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
}
```

`simpleNormalizeChildren`方法调用场景是 `render` 函数是编译生成的

`normalizeChildren`方法调用场景分为下面两种：

-  `render` 函数是用户手写的
- 编译 `slot`、`v-for` 的时候会产生嵌套数组

无论是`simpleNormalizeChildren`还是`normalizeChildren`都是对`children`进行规范（使`children` 变成了一个类型为 `VNode` 的 `Array`），这里就不展开说了

规范化`children`的源码位置在：src/core/vdom/helpers/normalzie-children.js

在规范化`children`后，就去创建`VNode`

```js
let vnode, ns
// 对tag进行判断
if (typeof tag === 'string') {
  let Ctor
  ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  if (config.isReservedTag(tag)) {
    // 如果是内置的节点，则直接创建一个普通VNode
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    // 如果是component类型，则会通过createComponent创建VNode节点
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
```

`createComponent`同样是创建`VNode`

源码位置：src/core/vdom/create-component.js

```js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
 // 构建子类构造函数
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
    if (Ctor === undefined) {
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // 安装组件钩子函数，把钩子函数合并到data.hook中
  installComponentHooks(data)

  //实例化一个VNode返回。组件的VNode是没有children的
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}
```

稍微提下`createComponent`生成`VNode`的三个关键流程：

- 构造子类构造函数`Ctor `
- `installComponentHooks`安装组件钩子函数
- 实例化 `vnode`

### 小结

`createElement` 创建 `VNode` 的过程，每个 `VNode` 有 `children`，`children` 每个元素也是一个`VNode`，这样就形成了一个虚拟树结构，用于描述真实的`DOM`树结构

</details>

## 105. 自定义指令是什么？有哪些应用场景？ {#question-7f41c072-39f8-4785-ad16-992bf7cacfb7}

> 难度：2 · 类型：QA

### 题目要点

在Vue中，自定义指令是一种强大的工具，它允许开发者创建可复用的DOM操作，并在不同的组件中重用这些操作。以下是对自定义指令的总结：

1. **定义和注册**：自定义指令通过`Vue.directive`函数进行定义和注册。它接受两个参数：指令名称和包含钩子函数的选项对象。钩子函数定义了指令的生命周期，包括元素插入、更新和移除时应执行的操作。
2. **应用场景**：自定义指令可以应用于多种场景，包括但不限于：
   - **操作DOM**：允许开发者直接在DOM元素上添加自定义行为，如修改样式、属性或添加事件监听器。
   - **表单验证**：实现表单输入的实时验证，提供即时反馈给用户。
   - **权限控制**：根据用户权限控制元素显示或功能，如显示/隐藏元素或禁用某些功能。
   - **第三方库集成**：简化第三方库或插件的集成过程，减少重复代码。
   - **动画和过渡效果**：与Vue的过渡系统结合，创建自定义的动画和过渡效果。
3. **钩子函数**：自定义指令的主要组成部分是钩子函数，它们定义了指令的生命周期和行为。常见的钩子函数包括：
   - `bind`：在元素插入到DOM时执行，仅执行一次。
   - `inserted`：在元素插入到父元素时执行，在`bind`之后。
   - `update`：在元素数据更新时执行，可能会触发多次。
   - `componentUpdated`：在组件的数据和子元素更新后执行，在`update`之后。
   - `unbind`：在元素移除时执行，仅执行一次。

<details>
<summary>参考答案</summary>

在 Vue 中，自定义指令（Custom Directive）是一种用于扩展 Vue 的模板语法的机制。通过自定义指令，你可以在 DOM 元素上添加自定义行为，并在元素插入、更新和移除时进行相应的操作。

自定义指令由 Vue.directive 函数定义，它接收两个参数：指令名称和指令选项对象。指令选项对象包含一系列钩子函数，用于定义指令的行为。

以下是一些常见的自定义指令应用场景：

1. **操作 DOM**：自定义指令可以用于直接操作 DOM 元素，例如修改元素的样式、属性、事件绑定等。你可以通过在指令的钩子函数中访问和操作 DOM 元素。

2. **表单验证**：你可以创建自定义指令来实现表单验证逻辑。通过自定义指令，你可以监听输入框的值变化，并根据自定义的验证规则进行验证，以便提供实时的反馈。

3. **权限控制**：自定义指令可以用于权限控制场景，例如根据用户权限来隐藏或禁用某些元素。你可以在自定义指令中根据用户权限进行条件判断，并修改元素的显示或行为。

4. **第三方库集成**：当你需要在 Vue 中使用第三方库或插件时，可以使用自定义指令来进行集成。你可以创建一个自定义指令，在其中初始化和配置第三方库，并在适当的时机调用库的方法。

5. **动画和过渡效果**：自定义指令可以与 Vue 的过渡系统一起使用，实现自定义的动画和过渡效果。你可以在自定义指令中监听过渡钩子函数，并根据需要操作元素的样式或类名来实现过渡效果。

这只是一些常见的应用场景，实际上自定义指令的应用范围非常广泛，可以根据具体需求进行灵活的使用。通过自定义指令，你可以扩展 Vue 的能力，实现更复杂和灵活的交互行为。

</details>

## 106. Vue常用的修饰符有哪些？分别有什么应用场景？ {#question-ef148af4-31d3-457d-b8ad-4a257ab0bb40}

> 难度：2 · 类型：QA

### 题目要点

在Vue中，修饰符（Modifiers）是一种简写形式，用于给指令添加特殊的行为或约束。它们通过在指令名后面添加一个点（`.`）和一个特定的修饰符名来实现。以下是对Vue中修饰符的总结：

### 表单修饰符

- `.lazy`：将`v-model`的更新触发时机延迟到`change`事件。
- `.trim`：自动过滤用户输入的首尾空格。
- `.number`：自动将输入值转为数值类型。

### 事件修饰符

- `.stop`：阻止事件冒泡。
- `.prevent`：阻止事件的默认行为。
- `.self`：确保只有当事件是从元素本身触发时才触发回调。
- `.once`：事件将只会触发一次。
- `.capture`：添加事件监听器时使用捕获模式。
- `.passive`：指定事件监听器使用被动模式。
- `.native`：监听组件根元素的原生事件。

### 鼠标按钮修饰符

- `.left`：只当点击鼠标左键时触发。
- `.right`：只当点击鼠标右键时触发。
- `.middle`：只当点击鼠标中键时触发。

### 键盘修饰符

- `.enter`：当按下回车键时触发。
- `.tab`：当按下tab键时触发。
- `.delete`：当按下delete键时触发。
- `.space`：当按下空格键时触发。
- `.esc`：当按下esc键时触发。
- `.up`、`.down`、`.left`、`.right`：当按下方向键时触发。

### v-bind修饰符

- `.sync`：实现props的双向绑定。
- `.prop`：将数据属性绑定到DOM属性上，并转换为驼峰命名。
- `.camel`：将数据属性绑定到DOM属性上，并转换为小驼峰命名。

### 应用场景

- 使用`.stop`和`.prevent`来阻止事件冒泡和默认行为。
- 使用`.self`来确保事件仅在元素本身上触发。
- 使用`.once`来减少重复事件监听器的数量。
- 使用`.capture`来从父元素开始捕获事件。
- 使用`.passive`来减少内存使用和提高事件处理性能。
- 使用`.native`来监听组件根元素的原生事件。
- 使用`.enter`、`.tab`等键值修饰符来响应特定的键盘事件。
- 使用`.sync`来实现props的双向绑定。
- 使用`.prop`和`.camel`来更准确地控制数据属性和DOM属性的绑定。
、

<details>
<summary>参考答案</summary>

## 一、修饰符是什么

在程序世界里，修饰符是用于限定类型以及类型成员的声明的一种符号

在`Vue`中，修饰符处理了许多`DOM`事件的细节，让我们不再需要花大量的时间去处理这些烦恼的事情，而能有更多的精力专注于程序的逻辑处理

`vue`中修饰符分为以下五种：

- 表单修饰符
- 事件修饰符
- 鼠标按键修饰符
- 键值修饰符
- v-bind修饰符

## 二、修饰符的作用

### 表单修饰符

在我们填写表单的时候用得最多的是`input`标签，指令用得最多的是`v-model`

关于表单的修饰符有如下：

- lazy
- trim
- number

#### lazy

在我们填完信息，光标离开标签的时候，才会将值赋予给`value`，也就是在`change`事件之后再进行信息同步

```js
<input type="text" v-model.lazy="value">
<p>{{value}}</p>
```

#### trim

自动过滤用户输入的首空格字符，而中间的空格不会过滤

```js
<input type="text" v-model.trim="value">
```

#### number

自动将用户的输入值转为数值类型，但如果这个值无法被`parseFloat`解析，则会返回原来的值

```js
<input v-model.number="age" type="number">
```

### 事件修饰符

事件修饰符是对事件捕获以及目标进行了处理，有如下修饰符：

- stop
- prevent
- self
- once
- capture
- passive
- native

#### stop

阻止了事件冒泡，相当于调用了`event.stopPropagation`方法

```js
<div @click="shout(2)">
  <button @click.stop="shout(1)">ok</button>
</div>
//只输出1
```

#### prevent

阻止了事件的默认行为，相当于调用了`event.preventDefault`方法

```js
<form v-on:submit.prevent="onSubmit"></form>
```

#### self

只当在 `event.target` 是当前元素自身时触发处理函数

```js
<div v-on:click.self="doThat">...</div>
```

> 使用修饰符时，顺序很重要；相应的代码会以同样的顺序产生。因此，用 `v-on:click.prevent.self` 会阻止**所有的点击**，而 `v-on:click.self.prevent` 只会阻止对元素自身的点击

#### once

绑定了事件以后只能触发一次，第二次就不会触发

```js
<button @click.once="shout(1)">ok</button>
```

#### capture

使事件触发从包含这个元素的顶层开始往下触发

```js
<div @click.capture="shout(1)">
    obj1
<div @click.capture="shout(2)">
    obj2
<div @click="shout(3)">
    obj3
<div @click="shout(4)">
    obj4
</div>
</div>
</div>
</div>
// 输出结构: 1 2 4 3
```

#### passive

在移动端，当我们在监听元素滚动事件的时候，会一直触发`onscroll`事件会让我们的网页变卡，因此我们使用这个修饰符的时候，相当于给`onscroll`事件整了一个`.lazy`修饰符

```js
<!-- 滚动事件的默认行为 (即滚动行为) 将会立即触发 -->
<!-- 而不会等待 `onScroll` 完成  -->
<!-- 这其中包含 `event.preventDefault()` 的情况 -->
<div v-on:scroll.passive="onScroll">...</div>
```

> 不要把 `.passive` 和 `.prevent` 一起使用,因为 `.prevent` 将会被忽略，同时浏览器可能会向你展示一个警告。
>
> `passive` 会告诉浏览器你不想阻止事件的默认行为

#### native

让组件变成像`html`内置标签那样监听根元素的原生事件，否则组件上使用 `v-on` 只会监听自定义事件

```js
<my-component v-on:click.native="doSomething"></my-component>
```

> 使用.native修饰符来操作普通HTML标签是会令事件失效的

### 鼠标按钮修饰符

鼠标按钮修饰符针对的就是左键、右键、中键点击，有如下：

- left 左键点击
- right 右键点击
- middle 中键点击

```js
<button @click.left="shout(1)">ok</button>
<button @click.right="shout(1)">ok</button>
<button @click.middle="shout(1)">ok</button>
```

### 键盘修饰符

键盘修饰符是用来修饰键盘事件（`onkeyup`，`onkeydown`）的，有如下：

`keyCode`存在很多，但`vue`为我们提供了别名，分为以下两种：

- 普通键（enter、tab、delete、space、esc、up...）
- 系统修饰键（ctrl、alt、meta、shift...）

```js
// 只有按键为keyCode的时候才触发
<input type="text" @keyup.keyCode="shout()">
```

还可以通过以下方式自定义一些全局的键盘码别名

```js
Vue.config.keyCodes.f2 = 113
```

### v-bind修饰符

v-bind修饰符主要是为属性进行操作，用来分别有如下：

- sync
- prop
- camel

#### sync

能对`props`进行一个双向绑定

```js
//父组件
<comp :myMessage.sync="bar"></comp>
//子组件
this.$emit('update:myMessage',params);
```

以上这种方法相当于以下的简写

```js
//父亲组件
<comp :myMessage="bar" @update:myMessage="func"></comp>
func(e){
 this.bar = e;
}
//子组件js
func2(){
  this.$emit('update:myMessage',params);
}
```

使用`sync`需要注意以下两点：

- 使用`sync`的时候，子组件传递的事件名格式必须为`update:value`，其中`value`必须与子组件中`props`中声明的名称完全一致

- 注意带有 `.sync` 修饰符的 `v-bind` 不能和表达式一起使用

- 将 `v-bind.sync` 用在一个字面量的对象上，例如 `v-bind.sync=”{ title: doc.title }”`，是无法正常工作的

#### props

设置自定义标签属性，避免暴露数据，防止污染HTML结构

```js
<input id="uid" title="title1" value="1" :index.prop="index">
```

#### camel

将命名变为驼峰命名法，如将` view-Box`属性名转换为 `viewBox`

```js
<svg :viewBox="viewBox"></svg>
```

## 三、应用场景

根据每一个修饰符的功能，我们可以得到以下修饰符的应用场景：

- .stop：阻止事件冒泡
- .native：绑定原生事件
- .once：事件只执行一次
- .self ：将事件绑定在自身身上，相当于阻止事件冒泡
- .prevent：阻止默认事件
- .capture：用于事件捕获
- .once：只触发一次
- .keyCode：监听特定键盘按下
- .right：右键

</details>

## 107. 说说你对Vue中 keep-alive 的理解 {#question-7cefdb7e-8b8a-429f-be44-45b346de6f3f}

> 难度：3 · 类型：QA

### 题目要点

`keep-alive`是Vue.js中一个内置组件，用于缓存不活动的组件实例，以避免重复渲染DOM，提高性能。它可以在组件切换时保持组件的状态，并在需要时重新使用之前的组件实例。`keep-alive`可以配合Vue的路由系统使用，以保持路由切换时页面的状态。

`keep-alive`组件可以设置一些属性，如`include`、`exclude`和`max`，来控制哪些组件需要被缓存，以及缓存的最大数量。

- `include`：设置需要被缓存的组件名称，可以是字符串、正则表达式或数组。
- `exclude`：设置不需要被缓存的组件名称，可以是字符串、正则表达式或数组。
- `max`：设置缓存的最大数量。
在使用`keep-alive`时，通常会将其包裹在动态组件周围，如`<keep-alive><component :is="view"></component></keep-alive>`，这样被包裹的组件就会被缓存。

`keep-alive`组件内部实现了一个缓存机制，它使用一个`cache`对象来存储缓存的组件实例，并通过一个`keys`数组来维护缓存组件的顺序。当组件被激活时，它会检查当前组件是否已经在缓存中，如果已经存在，则直接使用缓存的组件实例；如果不存在，则将其添加到缓存中。

当组件被缓存时，它会多出两个生命周期钩子：`activated`和`deactivated`。`activated`钩子在组件被激活时调用，而`deactivated`钩子在组件被移除缓存时调用。

在使用`keep-alive`时，需要注意以下几点：

- `include`和`exclude`属性可以用来控制缓存逻辑，确保只缓存需要的组件。
- `max`属性可以用来限制缓存数量，防止缓存过多。
- 服务器端渲染期间，`activated`钩子不会被调用，因为组件实例是在服务器端创建的。

在使用`keep-alive`时，可以配合Vue的路由系统，在路由配置中设置`meta`属性，以控制是否需要缓存该路由对应的组件。例如，在路由配置中设置`meta: { keepAlive: true }`，则该路由对应的组件会被缓存。

<details>
<summary>参考答案</summary>

## 一、Keep-alive 是什么

`keep-alive`是`vue`中的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染`DOM`

`keep-alive` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们

`keep-alive`可以设置以下`props`属性：

- `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存
- `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存
- `max` - 数字。最多可以缓存多少组件实例

关于`keep-alive`的基本用法：

```js
<keep-alive>
  <component :is="view"></component>
</keep-alive>
```

使用`includes`和`exclude`：

```js
<keep-alive include="a,b">
  <component :is="view"></component>
</keep-alive>

<!-- 正则表达式 (使用 `v-bind`) -->
<keep-alive :include="/a|b/">
  <component :is="view"></component>
</keep-alive>

<!-- 数组 (使用 `v-bind`) -->
<keep-alive :include="['a', 'b']">
  <component :is="view"></component>
</keep-alive>
```

匹配首先检查组件自身的 `name` 选项，如果 `name` 选项不可用，则匹配它的局部注册名称 (父组件 `components` 选项的键值)，匿名组件不能被匹配

设置了 keep-alive 缓存的组件，会多出两个生命周期钩子（`activated`与`deactivated`）：

- 首次进入组件时：`beforeRouteEnter` > `beforeCreate` > `created`> `mounted` > `activated` > ... ... > `beforeRouteLeave` > `deactivated`

- 再次进入组件时：`beforeRouteEnter` >`activated` > ... ... > `beforeRouteLeave` > `deactivated`

## 二、使用场景

使用原则：当我们在某些场景下不需要让页面重新加载时我们可以使用`keepalive`

举个栗子:

当我们从`首页`–>`列表页`–>`商详页`–>`再返回`，这时候列表页应该是需要`keep-alive`

从`首页`–>`列表页`–>`商详页`–>`返回到列表页(需要缓存)`–>`返回到首页(需要缓存)`–>`再次进入列表页(不需要缓存)`，这时候可以按需来控制页面的`keep-alive`

在路由中设置`keepAlive`属性判断是否需要缓存

```js
{
  path: 'list',
  name: 'itemList', // 列表页
  component (resolve) {
    require(['@/pages/item/list'], resolve)
 },
 meta: {
  keepAlive: true,
  title: '列表页'
 }
}
```

使用`<keep-alive>`

```js
<div id="app" class='wrapper'>
    <keep-alive>
        <!-- 需要缓存的视图组件 -->
        <router-view v-if="$route.meta.keepAlive"></router-view>
     </keep-alive>
      <!-- 不需要缓存的视图组件 -->
     <router-view v-if="!$route.meta.keepAlive"></router-view>
</div>
```

## 三、原理分析

`keep-alive`是`vue`中内置的一个组件

源码位置：src/core/components/keep-alive.js

```js
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render() {
    /* 获取默认插槽中的第一个组件节点 */
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot)
    /* 获取该组件节点的componentOptions */
    const componentOptions = vnode && vnode.componentOptions

    if (componentOptions) {
      /* 获取该组件节点的名称，优先获取组件的name字段，如果name不存在则获取组件的tag */
      const name = getComponentName(componentOptions)

      const { include, exclude } = this
      /* 如果name不在inlcude中或者存在于exlude中则表示不缓存，直接返回vnode */
      if (
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      /* 获取组件的key值 */
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
     /*  拿到key值后去this.cache对象中去寻找是否有该值，如果有则表示该组件有缓存，即命中缓存 */
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      }
        /* 如果没有命中缓存，则将其设置进缓存 */
        else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        /* 如果配置了max并且缓存的长度超过了this.max，则从缓存中删除第一个 */
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

可以看到该组件没有`template`，而是用了`render`，在组件渲染的时候会自动执行`render`函数

`this.cache`是一个对象，用来存储需要缓存的组件，它将以如下形式存储：

```js
this.cache = {
    'key1':'组件1',
    'key2':'组件2',
    // ...
}
```

在组件销毁的时候执行`pruneCacheEntry`函数

```js
function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  /* 判断当前没有处于被渲染状态的组件，将其销毁*/
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```

在`mounted`钩子函数中观测 `include` 和 `exclude` 的变化，如下：

```javascript
mounted () {
    this.$watch('include', val => {
        pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
        pruneCache(this, name => !matches(val, name))
    })
}
```

如果`include` 或`exclude` 发生了变化，即表示定义需要缓存的组件的规则或者不需要缓存的组件的规则发生了变化，那么就执行`pruneCache`函数，函数如下：

```javascript
function pruneCache (keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode = cache[key]
    if (cachedNode) {
      const name = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
```

在该函数内对`this.cache`对象进行遍历，取出每一项的`name`值，用其与新的缓存规则进行匹配，如果匹配不上，则表示在新的缓存规则下该组件已经不需要被缓存，则调用`pruneCacheEntry`函数将其从`this.cache`对象剔除即可

关于`keep-alive`的最强大缓存功能是在`render`函数中实现

首先获取组件的`key`值：

```javascript
const key = vnode.key == null?
componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
: vnode.key
```

拿到`key`值后去`this.cache`对象中去寻找是否有该值，如果有则表示该组件有缓存，即命中缓存，如下：

```javascript
/* 如果命中缓存，则直接从缓存中拿 vnode 的组件实例 */
if (cache[key]) {
    vnode.componentInstance = cache[key].componentInstance
    /* 调整该组件key的顺序，将其从原来的地方删掉并重新放在最后一个 */
    remove(keys, key)
    keys.push(key)
}
```

直接从缓存中拿 `vnode` 的组件实例，此时重新调整该组件`key`的顺序，将其从原来的地方删掉并重新放在`this.keys`中最后一个

`this.cache`对象中没有该`key`值的情况，如下：

```javascript
/* 如果没有命中缓存，则将其设置进缓存 */
else {
    cache[key] = vnode
    keys.push(key)
    /* 如果配置了max并且缓存的长度超过了this.max，则从缓存中删除第一个 */
    if (this.max && keys.length > parseInt(this.max)) {
        pruneCacheEntry(cache, keys[0], keys, this._vnode)
    }
}
```

表明该组件还没有被缓存过，则以该组件的`key`为键，组件`vnode`为值，将其存入`this.cache`中，并且把`key`存入`this.keys`中

此时再判断`this.keys`中缓存组件的数量是否超过了设置的最大缓存数量值`this.max`，如果超过了，则把第一个缓存组件删掉

## 四、思考题：缓存后如何获取数据

解决方案可以有以下两种：

- beforeRouteEnter
- actived

### beforeRouteEnter

每次组件渲染的时候，都会执行`beforeRouteEnter`

```js
beforeRouteEnter(to, from, next){
    next(vm=>{
        console.log(vm)
        // 每次进入路由执行
        vm.getData()  // 获取数据
    })
},
```

### actived

在`keep-alive`缓存的组件被激活的时候，都会执行`actived`钩子

```js
activated(){
      this.getData() // 获取数据
},
```

注意：服务器端渲染期间`avtived`不被调用

</details>

## 108. 说说vue中，key的原理 {#question-17f833d6-5312-4150-abb8-f3a320581109}

> 难度：2.5 · 类型：QA

### 题目要点

在 Vue 中，`key` 是用于帮助 Vue 识别和跟踪虚拟 DOM 的变化的特殊属性。当 Vue 更新渲染真实 DOM 时，它使用 `key` 属性来比较新旧节点，并尽可能地复用已存在的真实 DOM 节点，以提高性能。

<details>
<summary>参考答案</summary>

在 Vue 中，`key` 是用于帮助 Vue 识别和跟踪虚拟 DOM 的变化的特殊属性。当 Vue 更新渲染真实 DOM 时，它使用 `key` 属性来比较新旧节点，并尽可能地复用已存在的真实 DOM 节点，以提高性能。

Vue 在进行虚拟 DOM 的 diff 算法时，会使用 `key` 来匹配新旧节点，以确定节点的更新、移动或删除。它通过 `key` 属性来判断两个节点是否代表相同的实体，而不仅仅是根据它们的内容是否相同。这样可以保留节点的状态和避免不必要的 DOM 操作。

`key` 的工作原理如下：

1. 当 Vue 更新渲染真实 DOM 时，它会对新旧节点进行比较，找出它们之间的差异。
2. 如果两个节点具有相同的 `key` 值，则 Vue 认为它们是相同的节点，会尝试复用已存在的真实 DOM 节点。
3. 如果节点具有不同的 `key` 值，Vue 会将其视为不同的节点，并进行适当的更新、移动或删除操作。

使用 `key` 可以提供更准确的节点识别和跟踪，避免出现一些常见的问题，比如在列表中重新排序时导致的元素闪烁、输入框内容丢失等。

`key` 必须是唯一且稳定的，最好使用具有唯一标识的值，例如使用数据的唯一 ID。同时，不推荐使用随机数作为 `key`，因为在每次更新时都会生成新的 `key`，导致所有节点都重新渲染，无法复用已有的节点，降低性能。

</details>

## 109. Vue.observable是什么？ {#question-adaa5c02-f04c-4247-b6d6-0fe3f1bd439c}

> 难度：2 · 类型：QA

### 题目要点

Observable（可观察对象）是Vue.js中一个用于创建响应式数据的对象。它通过Vue.observable函数创建，可以将一个普通对象转化为响应式对象，从而在数据发生变化时触发相应的更新。Observable

在Vue 2.x和3.x版本中略有不同，但在2.x版本中，被传入的对象会直接被Vue.observable变更，而在3.x版本中，会返回一个可响应的代理，对源对象直接进行变更仍然是不可响应的。

Observable的使用场景通常是在非父子组件之间进行通信，尤其是在需要跨组件共享状态但不涉及复杂业务逻辑时。通过Observable，可以创建一个全局状态管理对象，并在多个组件中直接使用。

在Vue 2.x中，Observable的原理是通过Vue.observable函数对传入的对象进行处理，使其成为响应式对象。在Vue 3.x中，则返回一个可响应的代理，对源对象直接进行变更仍然是不可响应的。

Observable的核心原理是定义响应式对象。当数据发生变化时，会通知所有的观察者（watchers）进行更新。

在Vue中，Observable的实现是通过定义getter和setter来监听对象属性的变化，并在变化时通知观察者。

<details>
<summary>参考答案</summary>

## 一、Observable 是什么

`Observable` 翻译过来我们可以理解成**可观察的**

我们先来看一下其在`Vue`中的定义

> `Vue.observable`，让一个对象变成响应式数据。`Vue` 内部会用它来处理 `data` 函数返回的对象

返回的对象可以直接用于渲染函数和计算属性内，并且会在发生变更时触发相应的更新。也可以作为最小化的跨组件状态存储器

```js
Vue.observable({ count : 1})
```

其作用等同于

```js
new vue({ count : 1})
```

在 `Vue 2.x` 中，被传入的对象会直接被 `Vue.observable` 变更，它和被返回的对象是同一个对象

在 `Vue 3.x` 中，则会返回一个可响应的代理，而对源对象直接进行变更仍然是不可响应的

## 二、使用场景

在非父子组件通信时，可以使用通常的`bus`或者使用`vuex`，但是实现的功能不是太复杂，而使用上面两个又有点繁琐。这时，`observable`就是一个很好的选择

创建一个`js`文件

```js
// 引入vue
import Vue from 'vue
// 创建state对象，使用observable让state对象可响应
export let state = Vue.observable({
  name: '张三',
  'age': 38
})
// 创建对应的方法
export let mutations = {
  changeName(name) {
    state.name = name
  },
  setAge(age) {
    state.age = age
  }
}
```

在`.vue`文件中直接使用即可

```js
<template>
  <div>
    姓名：{{ name }}
    年龄：{{ age }}
    <button @click="changeName('李四')">改变姓名</button>
    <button @click="setAge(18)">改变年龄</button>
  </div>
</template>
import { state, mutations } from '@/store
export default {
  // 在计算属性中拿到值
  computed: {
    name() {
      return state.name
    },
    age() {
      return state.age
    }
  },
  // 调用mutations里面的方法，更新数据
  methods: {
    changeName: mutations.changeName,
    setAge: mutations.setAge
  }
}
```

## 三、原理分析

源码位置：src\core\observer\index.js

```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 判断是否存在__ob__响应式属性
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 实例化Observer响应式对象
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

`Observer`类

```js
export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; // number of vms that have this object as root $data

    constructor (value: any) {
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0
        def(value, '__ob__', this)
        if (Array.isArray(value)) {
            if (hasProto) {
                protoAugment(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
            this.observeArray(value)
        } else {
            // 实例化对象是一个对象，进入walk方法
            this.walk(value)
        }
}
```

`walk`函数

```js
walk (obj: Object) {
    const keys = Object.keys(obj)
    // 遍历key，通过defineReactive创建响应式对象
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
```

`defineReactive`方法

```js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  // 接下来调用Object.defineProperty()给对象定义响应式属性
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      // 对观察者watchers进行通知,state就成了全局响应式对象
      dep.notify()
    }
  })
}
```

</details>

## 110. 说说你对slot的理解？slot使用场景有哪些？ {#question-28305428-953c-4daa-9b4e-f3d01b694017}

> 难度：2 · 类型：QA

### 题目要点

在Vue中，`slot`（插槽）是一种特殊的组件语法，用于允许父组件向子组件传递内容。它允许子组件定义插槽，而父组件可以在子组件的标签内指定要填充的内容。

### 一、什么是slot

- 在HTML中，`slot`元素是Web组件的一部分，作为占位符使用。
- 在Vue中，`slot`被称为插槽，允许父组件向子组件传递内容。

### 二、使用场景

- 复用组件时，子组件可以在不同场景下有少量差异。
- 布局组件、表格列、下拉菜单、弹框显示内容等。

### 三、分类

- 默认插槽：父组件使用子组件时，如果没有指定内容，则使用默认插槽中的内容。
- 具名插槽：父组件可以通过`slot`属性指定内容要填充到子组件的哪个插槽。
- 作用域插槽：子组件可以向父组件传递数据，这些数据可以通过`v-slot`在父组件中使用。

### 四、原理分析

- `slot`本质上是返回VNode的函数。
- `Vue`的组件渲染流程是`template -> render function -> VNode -> DOM`。
- 子组件通过`slot`定义插槽，父组件通过`v-slot`指定要填充的内容。
- `v-slot`可以简写为`#`，用于指定作用域插槽。
使用`slot`可以使得组件更加灵活和可复用，同时允许父组件对子组件进行定制化。

<details>
<summary>参考答案</summary>

## 一、slot是什么

在HTML中 `slot` 元素 ，作为 `Web Components` 技术套件的一部分，是Web组件内的一个占位符

该占位符可以在后期使用自己的标记语言填充

举个栗子
```html
<template id="element-details-template">
  <slot name="element-name">Slot template</slot>
</template>
<element-details>
  <span slot="element-name">1</span>
</element-details>
<element-details>
  <span slot="element-name">2</span>
</element-details>
```
`template`不会展示到页面中，需要用先获取它的引用，然后添加到`DOM`中，

```js
customElements.define('element-details',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document
        .getElementById('element-details-template')
        .content;
      const shadowRoot = this.attachShadow({mode: 'open'})
        .appendChild(template.cloneNode(true));
  }
})
```

在`Vue`中的概念也是如此

`Slot` 艺名插槽，花名“占坑”，我们可以理解为`solt`在组件模板中占好了位置，当使用该组件标签时候，组件标签里面的内容就会自动填坑（替换组件模板中`slot`位置），作为承载分发内容的出口

可以将其类比为插卡式的FC游戏机，游戏机暴露卡槽（插槽）让用户插入不同的游戏磁条（自定义内容）

放张图感受一下
![](https://static.ecool.fun//article/86be4e75-6050-44a1-8dbc-72e2d493834a.png)

## 二、使用场景

通过插槽可以让用户可以拓展组件，去更好地复用组件和对其做定制化处理

如果父组件在使用到一个复用组件的时候，获取这个组件在不同的地方有少量的更改，如果去重写组件是一件不明智的事情

通过`slot`插槽向组件内部指定位置传递内容，完成这个复用组件在不同场景的应用

比如布局组件、表格列、下拉选、弹框显示内容等

## 三、分类

`slot`可以分来以下三种：

- 默认插槽
- 具名插槽
- 作用域插槽

### 默认插槽

子组件用`<slot>`标签来确定渲染的位置，标签里面可以放`DOM`结构，当父组件使用的时候没有往插槽传入内容，标签内`DOM`结构就会显示在页面

父组件在使用的时候，直接在子组件的标签内写入内容即可

子组件`Child.vue`

```js
<template>
    <slot>
      <p>插槽后备的内容</p>
    </slot>
</template>
```

父组件

```js
<Child>
  <div>默认插槽</div>
</Child>
```

### 具名插槽

子组件用`name`属性来表示插槽的名字，不传为默认插槽

父组件中在使用时在默认插槽的基础上加上`slot`属性，值为子组件插槽`name`属性值

子组件`Child.vue`

```js
<template>
    <slot>插槽后备的内容</slot>
  <slot name="content">插槽后备的内容</slot>
</template>
```

父组件

```js
<child>
    <template v-slot:default>具名插槽</template>
    <!-- 具名插槽⽤插槽名做参数 -->
    <template v-slot:content>内容...</template>
</child>
```

### 作用域插槽

子组件在作用域上绑定属性来将子组件的信息传给父组件使用，这些属性会被挂在父组件`v-slot`接受的对象上

父组件中在使用时通过`v-slot:`（简写：#）获取子组件的信息，在内容中使用

子组件`Child.vue`

```js
<template>
  <slot name="footer" testProps="子组件的值">
          <h3>没传footer插槽</h3>
    </slot>
</template>
```

父组件

```js
<child>
    <!-- 把v-slot的值指定为作⽤域上下⽂对象 -->
    <template v-slot:default="slotProps">
      来⾃⼦组件数据：{{slotProps.testProps}}
    </template>
  <template #default="slotProps">
      来⾃⼦组件数据：{{slotProps.testProps}}
    </template>
</child>
```

### 小结：

- `v-slot`属性只能在`<template>`上使用，但在只有默认插槽时可以在组件标签上使用
- 默认插槽名为`default`，可以省略default直接写`v-slot`
- 缩写为`#`时不能不写参数，写成`#default`
- 可以通过解构获取`v-slot={user}`，还可以重命名`v-slot="{user: newName}"`和定义默认值`v-slot="{user = '默认值'}"`

## 四、原理分析

`slot`本质上是返回`VNode`的函数，一般情况下，`Vue`中的组件要渲染到页面上需要经过`template -> render function -> VNode -> DOM` 过程，这里看看`slot`如何实现：

编写一个`buttonCounter`组件，使用匿名插槽

```js
Vue.component('button-counter', {
  template: '<div> <slot>我是默认内容</slot></div>'
})
```

使用该组件

```js
new Vue({
    el: '#app',
    template: '<button-counter><span>我是slot传入内容</span></button-counter>',
    components:{buttonCounter}
})
```

获取`buttonCounter`组件渲染函数

```js
(function anonymous(
) {
with(this){return _c('div',[_t("default",[_v("我是默认内容")])],2)}
})
```

`_v`表示穿件普通文本节点，`_t`表示渲染插槽的函数

渲染插槽函数`renderSlot`（做了简化）

```js
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  // 得到渲染插槽内容的函数
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  // 如果存在插槽渲染函数，则执行插槽渲染函数，生成nodes节点返回
  // 否则使用默认值
  nodes = scopedSlotFn(props) || fallback;
  return nodes;
}
```

`name`属性表示定义插槽的名字，默认值为`default`，`fallback`表示子组件中的`slot`节点的默认值

关于`this.$scopredSlots`是什么，我们可以先看看`vm.slot`

```js
function initRender (vm) {
  ...
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  ...
}
```

`resolveSlots`函数会对`children`节点做归类和过滤处理，返回`slots`

```js
function resolveSlots (
    children,
    context
  ) {
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        // 如果slot存在(slot="header") 则拿对应的值作为key
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        // 如果是tempalte元素 则把template的children添加进数组中，这也就是为什么你写的template标签并不会渲染成另一个标签到页面
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        // 如果没有就默认是default
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
}
```

`_render`渲染函数通过`normalizeScopedSlots`得到`vm.$scopedSlots`

```js
vm.$scopedSlots = normalizeScopedSlots(
  _parentVnode.data.scopedSlots,
  vm.$slots,
  vm.$scopedSlots
);
```

作用域插槽中父组件能够得到子组件的值是因为在`renderSlot`的时候执行会传入`props`，也就是上述`_t`第三个参数，父组件则能够得到子组件传递过来的值

</details>

## 111. 说说你对vue的mixin的理解，以及有哪些应用场景？ {#question-c1bcc1f1-3375-4c66-b3af-1ba1b937c01f}

> 难度：2 · 类型：QA

### 题目要点

在Vue中，`mixin`是一种将可复用功能分发给Vue组件的机制。它允许你定义一个`mixin`对象，该对象可以包含组件的任意功能选项，如`data`、`methods`、`created`、`computed`等。当你将一个`mixin`对象混入到一个Vue组件中时，该组件将自动获得`mixin`对象中的所有功能选项。

##### 局部混入

可以定义一个`mixin`对象，并将其作为组件的`mixins`选项之一。这样，当你创建这个组件时，它将继承并使用这个`mixin`对象的功能。

##### 全局混入

如果你想要在整个项目中应用`mixin`，你可以通过`Vue.mixin()`进行全局混入。这种混入会影响到项目中每一个组件实例，包括第三方组件。

#### 注意事项

- 当组件和`mixin`对象具有相同的选项时，组件的选项会覆盖`mixin`的选项。
- 如果选项是生命周期钩子，它们会被合并成一个数组，先执行`mixin`的钩子，再执行组件的钩子。

#### 使用场景

`mixin`通常用于封装可复用的功能，比如表单验证、数据加载逻辑、事件处理等。

#### 源码分析

Vue的`mixin`实现是通过`Vue.mixin()`函数进行的。它会将`mixin`对象中的所有选项合并到Vue组件的选项中。在合并时，Vue使用了不同的策略来处理不同类型的选项。

- 替换型策略：`props`、`methods`、`inject`、`computed`，它们会替换掉组件中的同名选项。
- 合并型策略：`data`，它通过递归合并两个数据对象。
- 队列型策略：生命周期钩子和`watch`，它们被合并成一个数组。
- 叠加型策略：`component`、`directives`、`filters`，它们通过原型链进行层层的叠加。

<details>
<summary>参考答案</summary>

## 一、mixin是什么

`Mixin`是面向对象程序设计语言中的类，提供了方法的实现。其他类可以访问`mixin`类的方法而不必成为其子类

`Mixin`类通常作为功能模块使用，在需要该功能时“混入”，有利于代码复用又避免了多继承的复杂

### Vue中的mixin
先来看一下官方定义
> `mixin`（混入），提供了一种非常灵活的方式，来分发 `Vue` 组件中的可复用功能。

本质其实就是一个`js`对象，它可以包含我们组件中任意功能选项，如`data`、`components`、`methods `、`created`、`computed`等等

我们只要将共用的功能以对象的方式传入 `mixins`选项中，当组件使用 `mixins`对象时所有`mixins`对象的选项都将被混入该组件本身的选项中来

在`Vue`中我们可以**局部混入**跟**全局混入**

### 局部混入

定义一个`mixin`对象，有组件`options`的`data`、`methods`属性

```js
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    }
  }
}
```

组件通过`mixins`属性调用`mixin`对象

```js
Vue.component('componentA',{
  mixins: [myMixin]
})
```

该组件在使用的时候，混合了`mixin`里面的方法，在自动执行`create`生命钩子，执行`hello`方法

### 全局混入

通过`Vue.mixin()`进行全局的混入

```js
Vue.mixin({
  created: function () {
      console.log("全局混入")
    }
})
```

使用全局混入需要特别注意，因为它会影响到每一个组件实例（包括第三方组件）

PS：全局混入常用于插件的编写

### 注意事项：

当组件存在与`mixin`对象相同的选项的时候，进行递归合并的时候组件的选项会覆盖`mixin`的选项

但是如果相同选项为生命周期钩子的时候，会合并成一个数组，先执行`mixin`的钩子，再执行组件的钩子

## 二、使用场景

在日常的开发中，我们经常会遇到在不同的组件中经常会需要用到一些相同或者相似的代码，这些代码的功能相对独立

这时，可以通过`Vue`的`mixin`功能将相同或者相似的代码提出来

举个例子

定义一个`modal`弹窗组件，内部通过`isShowing`来控制显示

```js
const Modal = {
  template: '#modal',
  data() {
    return {
      isShowing: false
    }
  },
  methods: {
    toggleShow() {
      this.isShowing = !this.isShowing;
    }
  }
}
```

定义一个`tooltip`提示框，内部通过`isShowing`来控制显示

```js
const Tooltip = {
  template: '#tooltip',
  data() {
    return {
      isShowing: false
    }
  },
  methods: {
    toggleShow() {
      this.isShowing = !this.isShowing;
    }
  }
}
```

通过观察上面两个组件，发现两者的逻辑是相同，代码控制显示也是相同的，这时候`mixin`就派上用场了

首先抽出共同代码，编写一个`mixin`

```js
const toggle = {
  data() {
    return {
      isShowing: false
    }
  },
  methods: {
    toggleShow() {
      this.isShowing = !this.isShowing;
    }
  }
}
```

两个组件在使用上，只需要引入`mixin`

```js
const Modal = {
  template: '#modal',
  mixins: [toggle]
};

const Tooltip = {
  template: '#tooltip',
  mixins: [toggle]
}
```

通过上面小小的例子，让我们知道了`Mixin`对于封装一些可复用的功能如此有趣、方便、实用

## 三、源码分析

首先从`Vue.mixin`入手

源码位置：/src/core/global-api/mixin.js

```js
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

主要是调用`merOptions`方法

源码位置：/src/core/util/options.js

```js
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {

if (child.mixins) { // 判断有没有mixin 也就是mixin里面挂mixin的情况 有的话递归进行合并
    for (let i = 0, l = child.mixins.length; i < l; i++) {
    parent = mergeOptions(parent, child.mixins[i], vm)
    }
}

  const options = {}
  let key
  for (key in parent) {
    mergeField(key) // 先遍历parent的key 调对应的strats[XXX]方法进行合并
  }
  for (key in child) {
    if (!hasOwn(parent, key)) { // 如果parent已经处理过某个key 就不处理了
      mergeField(key) // 处理child中的key 也就parent中没有处理过的key
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key) // 根据不同类型的options调用strats中不同的方法进行合并
  }
  return options
}
```
从上面的源码，我们得到以下几点：

- 优先递归处理 `mixins`
- 先遍历合并`parent` 中的`key`，调用`mergeField`方法进行合并，然后保存在变量`options`
- 再遍历 `child`，合并补上 `parent` 中没有的`key`，调用`mergeField`方法进行合并，保存在变量`options`
- 通过 `mergeField` 函数进行了合并

下面是关于`Vue`的几种类型的合并策略

- 替换型
- 合并型
- 队列型
- 叠加型

### 替换型

替换型合并有`props`、`methods`、`inject`、`computed`

```js
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (!parentVal) return childVal // 如果parentVal没有值，直接返回childVal
  const ret = Object.create(null) // 创建一个第三方对象 ret
  extend(ret, parentVal) // extend方法实际是把parentVal的属性复制到ret中
  if (childVal) extend(ret, childVal) // 把childVal的属性复制到ret中
  return ret
}
strats.provide = mergeDataOrFn
```

同名的`props`、`methods`、`inject`、`computed`会被后来者代替

### 合并型

和并型合并有：`data`

```js
strats.data = function(parentVal, childVal, vm) {
    return mergeDataOrFn(
        parentVal, childVal, vm
    )
};

function mergeDataOrFn(parentVal, childVal, vm) {
    return function mergedInstanceDataFn() {
        var childData = childVal.call(vm, vm) // 执行data挂的函数得到对象
        var parentData = parentVal.call(vm, vm)
        if (childData) {
            return mergeData(childData, parentData) // 将2个对象进行合并
        } else {
            return parentData // 如果没有childData 直接返回parentData
        }
    }
}

function mergeData(to, from) {
    if (!from) return to
    var key, toVal, fromVal;
    var keys = Object.keys(from);
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        toVal = to[key];
        fromVal = from[key];
        // 如果不存在这个属性，就重新设置
        if (!to.hasOwnProperty(key)) {
            set(to, key, fromVal);
        }
        // 存在相同属性，合并对象
        else if (typeof toVal =="object" && typeof fromVal =="object") {
            mergeData(toVal, fromVal);
        }
    }
    return to
}
```

`mergeData`函数遍历了要合并的 data 的所有属性，然后根据不同情况进行合并：

- 当目标 data 对象不包含当前属性时，调用 `set` 方法进行合并（set方法其实就是一些合并重新赋值的方法）
- 当目标 data 对象包含当前属性并且当前值为纯对象时，递归合并当前对象值，这样做是为了防止对象存在新增属性

### 队列性

队列性合并有：全部生命周期和`watch`

```js
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

// watch
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};
```

生命周期钩子和`watch`被合并为一个数组，然后正序遍历一次执行

### 叠加型

叠加型合并有：`component`、`directives`、`filters`

```js
strats.components=
strats.directives=

strats.filters = function mergeAssets(
    parentVal, childVal, vm, key
) {
    var res = Object.create(parentVal || null);
    if (childVal) {
        for (var key in childVal) {
            res[key] = childVal[key];
        }
    }
    return res
}
```

叠加型主要是通过原型链进行层层的叠加

### 小结：

- 替换型策略有`props`、`methods`、`inject`、`computed`，就是将新的同名参数替代旧的参数
- 合并型策略是`data`, 通过`set`方法进行合并和重新赋值
- 队列型策略有生命周期函数和`watch`，原理是将函数存入一个数组，然后正序遍历依次执行
- 叠加型有`component`、`directives`、`filters`，通过原型链进行层层的叠加

</details>

## 112. Vue中的$nextTick有什么作用？ {#question-a0c75651-7e44-437d-9f1f-38775698091b}

> 难度：2 · 类型：QA

### 题目要点

`nextTick`是Vue.js中一个重要的API，用于在数据变化后立即获取更新后的DOM结构。它的基本原理是在数据变化后，将需要执行的操作放入一个异步队列中，等到当前事件循环结束后再执行这些操作。这样可以避免频繁地更新DOM，提高性能。

#### 一、什么是nextTick

- 当Vue的数据发生变化时，它会开启一个异步更新队列。
- 队列中的数据变化操作不会立即执行，而是等待队列中所有的数据变化完成后再统一进行更新。
- `nextTick`允许我们在数据变化后立即执行回调函数，此时DOM已经更新完毕，可以获取到最新的DOM结构。

#### 二、使用场景

- 当你需要获取更新后的DOM结构时，可以使用`nextTick`。
- 在某些情况下，使用`nextTick`可以避免不必要的DOM更新，从而提高性能。

#### 三、实现原理

- `nextTick`的实现依赖于微任务或宏任务队列。它会将需要执行的操作放入队列中，等待队列执行完毕后再执行。
- `nextTick`的实现使用了`Promise.then`、`MutationObserver`、`setImmediate`、`setTimeout`等不同的技术，以适应不同的浏览器环境。
- 具体实现上，`nextTick`会将需要执行的操作放入一个数组`callbacks`中，然后在适当的时候执行这个数组中的操作。

<details>
<summary>参考答案</summary>

## 一、NextTick是什么

官方对其的定义

> 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM

什么意思呢？

我们可以理解成，`Vue` 在更新 `DOM` 时是异步执行的。当数据发生变化，`Vue`将开启一个异步更新队列，视图需要等队列中所有数据变化完成之后，再统一进行更新

举例一下

`Html`结构

```html
<div id="app"> {{ message }} </div>
```

构建一个`vue`实例

```js
const vm = new Vue({
  el: '#app',
  data: {
    message: '原始值'
  }
})
```

修改`message`

```js
this.message = '修改后的值1'
this.message = '修改后的值2'
this.message = '修改后的值3'
```

这时候想获取页面最新的`DOM`节点，却发现获取到的是旧值

```js
console.log(vm.$el.textContent) // 原始值
```

这是因为`message`数据在发现变化的时候，`vue`并不会立刻去更新`Dom`，而是将修改数据的操作放在了一个异步操作队列中

如果我们一直修改相同数据，异步操作队列还会进行去重

等待同一事件循环中的所有数据变化完成之后，会将队列中的事件拿来进行处理，进行`DOM`的更新

#### 为什么要有nexttick

举个例子
```js
{{num}}
for(let i=0; i<100000; i++){
    num = i
}
```
如果没有 `nextTick` 更新机制，那么 `num` 每次更新值都会触发视图更新(上面这段代码也就是会更新10万次视图)，有了`nextTick`机制，只需要更新一次，所以`nextTick`本质是一种优化策略

## 二、使用场景

如果想要在修改数据后立刻得到更新后的`DOM`结构，可以使用`Vue.nextTick()`

第一个参数为：回调函数（可以获取最近的`DOM`结构）

第二个参数为：执行函数上下文

```js
// 修改数据
vm.message = '修改后的值'
// DOM 还没有更新
console.log(vm.$el.textContent) // 原始的值
Vue.nextTick(function () {
  // DOM 更新了
  console.log(vm.$el.textContent) // 修改后的值
})
```

组件内使用 `vm.$nextTick()` 实例方法只需要通过`this.$nextTick()`，并且回调函数中的 `this` 将自动绑定到当前的 `Vue` 实例上

```js
this.message = '修改后的值'
console.log(this.$el.textContent) // => '原始的值'
this.$nextTick(function () {
    console.log(this.$el.textContent) // => '修改后的值'
})
```

`$nextTick()` 会返回一个 `Promise` 对象，可以是用`async/await`完成相同作用的事情

```js
this.message = '修改后的值'
console.log(this.$el.textContent) // => '原始的值'
await this.$nextTick()
console.log(this.$el.textContent) // => '修改后的值'
```

## 三、实现原理

源码位置：`/src/core/util/next-tick.js`

`callbacks`也就是异步操作队列

`callbacks`新增回调函数后又执行了`timerFunc`函数，`pending`是用来标识同一个时间只能执行一次

```js
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;

  // cb 回调函数会经统一处理压入 callbacks 数组
  callbacks.push(() => {
    if (cb) {
      // 给 cb 回调函数执行加上了 try-catch 错误处理
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  // 执行异步延迟函数 timerFunc
  if (!pending) {
    pending = true;
    timerFunc();
  }

  // 当 nextTick 没有传入函数参数的时候，返回一个 Promise 化的调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}
```

`timerFunc`函数定义，这里是根据当前环境支持什么方法则确定调用哪个，分别有：

`Promise.then`、`MutationObserver`、`setImmediate`、`setTimeout`

通过上面任意一种方法，进行降级操作

```js
export let isUsingMicroTask = false
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  //判断1：是否原生支持Promise
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  //判断2：是否原生支持MutationObserver
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  //判断3：是否原生支持setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  //判断4：上面都不行，直接用setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

无论是微任务还是宏任务，都会放到`flushCallbacks`使用

这里将`callbacks`里面的函数复制一份，同时`callbacks`置空

依次执行`callbacks`里面的函数

```js
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

**小结：**

1. 把回调函数放入callbacks等待执行
2. 将执行函数放到微任务或者宏任务中
3. 事件循环到了微任务或者宏任务，执行函数依次执行callbacks中的回调

</details>

## 113. Vue组件间通信方式都有哪些? {#question-a88670ef-a898-4676-a272-cabf8bdfade7}

> 难度：2 · 类型：QA

### 题目要点

#### 组件间通信的方案

1. **props传递数据**：父组件通过props向子组件传递数据。
2. **$emit触发自定义事件**：子组件通过$emit向父组件发送通知。
3. **ref**：通过ref获取子组件实例，从而访问子组件的数据和方法。
4. **EventBus**：创建一个中央事件总线，用于兄弟组件之间的通信。
5. **$parent或$root**：通过共同的祖辈组件进行通信。
6. **$attrs与$listeners**：祖先组件通过$attrs传递数据给子孙组件，通过$listeners传递事件监听器。
7. **Provide与Inject**：祖先组件通过Provide提供数据，后代组件通过Inject接收数据。
8. **Vuex**：用于复杂关系的组件数据共享。

<details>
<summary>参考答案</summary>

## 一、组件间通信的概念<br>

开始之前，我们把**组件间通信**这个词进行拆分

- 组件
- 通信

都知道组件是`vue`最强大的功能之一，`vue`中每一个`.vue`我们都可以视之为一个组件。

通信指的是发送者通过某种媒体以某种格式来传递信息到收信者以达到某个目的。

广义上，任何信息的交通都是通信。

**组件间通信**，即指组件\(`.vue`\)通过某种方式来传递信息以达到某个目的。

举个栗子我们在使用`UI`框架中的`table`组件，可能会往`table`组件中传入某些数据，这个本质就形成了组件之间的通信。

## 二、组件间通信解决了什么

在古代，人们通过驿站、飞鸽传书、烽火报警、符号、语言、眼神、触碰等方式进行信息传递，到了今天，随着科技水平的飞速发展，通信基本完全利用有线或无线电完成，相继出现了有线电话、固定电话、无线电话、手机、互联网甚至视频电话等各种通信方式从上面这段话，我们可以看到通信的本质是信息同步，共享。

回到`vue`中，每个组件之间的都有独自的作用域，组件间的数据是无法共享的但实际开发工作中我们常常需要让组件之间共享数据，这也是组件通信的目的要让它们互相之间能进行通讯，这样才能构成一个有机的完整系统

## 二、组件间通信的分类

组件间通信的分类可以分成以下

- 父子组件之间的通信
- 兄弟组件之间的通信
- 祖孙与后代组件之间的通信
- 非关系组件间之间的通信

关系图:

 ![](https://static.ecool.fun//article/b2f13367-d035-4870-b2e0-779d5909620a.png)

## 三、组件间通信的方案

整理`vue`中8种常规的通信方案

1.  通过 props 传递
2.  通过 \$emit 触发自定义事件
3.  使用 ref
4.  EventBus
5.  $parent 或$root
6.  attrs 与 listeners
7.  Provide 与 Inject
8.  Vuex

### props传递数据

 ![](https://static.ecool.fun//article/028189f8-0df1-4af0-b541-a6439f488209.png)

- 适用场景：父组件传递数据给子组件
- 子组件设置`props`属性，定义接收父组件传递过来的参数
- 父组件在使用子组件标签中通过字面量来传递值

`Children.vue`

```js
props:{
    // 字符串形式
 name:String // 接收的类型参数
    // 对象形式
    age:{  
        type:Number, // 接收的类型为数值
        defaule:18,  // 默认值为18
       require:true // age属性必须传递
    }
}
```

`Father.vue`组件

```js
<Children name="jack" age=18 />
```

### \$emit 触发自定义事件

- 适用场景：子组件传递数据给父组件
- 子组件通过`$emit触发`自定义事件，`$emit`第二个参数为传递的数值
- 父组件绑定监听器获取到子组件传递过来的参数

`Chilfen.vue`

```js
this.$emit('add', good)
```

`Father.vue`

```js
<Children @add="cartAdd($event)" />
```

### ref

- 父组件在使用子组件的时候设置`ref`
- 父组件通过设置子组件`ref`来获取数据

父组件

```js
<Children ref="foo" />

this.$refs.foo  // 获取子组件实例，通过子组件实例我们就能拿到对应的数据
```

### EventBus

- 使用场景：兄弟组件传值
- 创建一个中央事件总线`EventBus`
- 兄弟组件通过`$emit`触发自定义事件，`$emit`第二个参数为传递的数值
- 另一个兄弟组件通过`$on`监听自定义事件

`Bus.js`

```js
// 创建一个中央时间总线类
class Bus {
  constructor() {
    this.callbacks = {};   // 存放事件的名字
  }
  $on(name, fn) {
    this.callbacks[name] = this.callbacks[name] || [];
    this.callbacks[name].push(fn);
  }
  $emit(name, args) {
    if (this.callbacks[name]) {
      this.callbacks[name].forEach((cb) => cb(args));
    }
  }
}

// main.js
Vue.prototype.$bus = new Bus() // 将$bus挂载到vue实例的原型上
// 另一种方式
Vue.prototype.$bus = new Vue() // Vue已经实现了Bus的功能
```

`Children1.vue`

```js
this.$bus.$emit('foo')
```

`Children2.vue`

```js
this.$bus.$on('foo', this.handle)
```

### $parent 或 $root

- 通过共同祖辈`$parent`或者`$root`搭建通信侨联

兄弟组件

`this.$parent.$on('add',this.add)<br>
`

另一个兄弟组件

`this.$parent.$emit('add')<br>
`

### $attrs  与$ listeners

 -    适用场景：祖先传递数据给子孙
 -    设置批量向下传属性`$attrs`和 `$listeners`
 -    包含了父级作用域中不作为 `prop` 被识别 \(且获取\) 的特性绑定 \( class 和 style 除外\)。
 -    可以通过 `v-bind="$attrs"` 传⼊内部组件

```js
// child：并未在props中声明foo
<p>{{$attrs.foo}}</p>

// parent
<HelloWorld foo="foo"/>
```

```js
// 给Grandson隔代传值，communication/index.vue
<Child2 msg="lalala" @some-event="onSomeEvent"></Child2>

// Child2做展开
<Grandson v-bind="$attrs" v-on="$listeners"></Grandson>

// Grandson使⽤
<div @click="$emit('some-event', 'msg from grandson')">
{{msg}}
</div>
```

### provide 与 inject

- 在祖先组件定义`provide`属性，返回传递的值
- 在后代组件通过`inject`接收组件传递过来的值

祖先组件

```js
provide(){
    return {
        foo:'foo'
    }
}
```

后代组件

```js
inject:['foo'] // 获取到祖先组件传递过来的值
```

### `vuex`

- 适用场景: 复杂关系的组件数据传递
- `Vuex`作用相当于一个用来存储共享变量的容器
 ![](https://static.ecool.fun//article/3073480a-ca41-4937-a711-5237a7c73506.png)

- `state`用来存放共享变量的地方
- `getter`，可以增加一个`getter`派生状态，\(相当于`store`中的计算属性），用来获得共享变量的值
- `mutations`用来存放修改`state`的方法。
- `actions`也是用来存放修改state的方法，不过`action`是在`mutations`的基础上进行。常用来做一些异步操作

### 小结

- 父子关系的组件数据传递选择 `props`  与 `$emit`进行传递，也可选择`ref`
- 兄弟关系的组件数据传递可选择`$bus`，其次可以选择`$parent`进行传递
- 祖先与后代组件数据传递可选择`attrs`与`listeners`或者 `Provide`与 `Inject`
- 复杂关系的组件数据传递可以通过`vuex`存放共享的变量

</details>

## 114. Vue中组件和插件有什么区别？ {#question-51699bda-02be-4433-b2bf-450c2655594f}

> 难度：1 · 类型：QA

### 题目要点

在Vue.js中，组件和插件是两个重要的概念，它们各自有不同的用途和编写方式。

#### 组件

组件是Vue.js的核心概念之一，用于构建应用程序的各个部分。在Vue中，`.vue`文件可以视为一个组件。

#### 插件

插件是用来扩展Vue.js功能的外部库或工具，它可以添加全局方法、属性、指令、过渡效果等。

插件的主要用途包括：

- 添加全局方法或属性。
- 添加全局资源，如指令、过滤器、过渡效果等。
- 通过全局混入来添加组件选项。
- 添加Vue实例方法。
- 提供自己的API，同时提供以上功能。
插件的编写方式通常包括暴露一个`install`方法，该方法接收Vue构造器和可选的选项对象作为参数。

插件的注册方式是通过`Vue.use`方法：

- `Vue.use(插件名, {选项})`：第一个参数是插件的名字，第二个参数是可选的配置项。

#### 区别

组件和插件的区别主要体现在编写形式、注册形式和使用场景上：

- **编写形式**：组件通常通过`.vue`文件或`template`属性定义；插件则需要定义一个`install`方法。
- **注册形式**：组件可以通过`Vue.component`全局注册或通过局部注册；插件则通过`Vue.use`方法注册。
- **使用场景**：组件用于构建应用的业务模块；插件用于增强或补充Vue.js的功能。

<details>
<summary>参考答案</summary>

## 一、组件是什么

回顾以前对组件的定义：

组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式，在`Vue`中每一个`.vue`文件都可以视为一个组件

组件的优势

- 降低整个系统的耦合度，在保持接口不变的情况下，我们可以替换不同的组件快速完成需求，例如输入框，可以替换为日历、时间、范围等组件作具体的实现

- 调试方便，由于整个系统是通过组件组合起来的，在出现问题的时候，可以用排除法直接移除组件，或者根据报错的组件快速定位问题，之所以能够快速定位，是因为每个组件之间低耦合，职责单一，所以逻辑会比分析整个系统要简单

- 提高可维护性，由于每个组件的职责单一，并且组件在系统中是被复用的，所以对代码进行优化可获得系统的整体升级

## 二、插件是什么

插件通常用来为 `Vue` 添加全局功能。插件的功能范围没有严格的限制——一般有下面几种：

- 添加全局方法或者属性。如: `vue-custom-element`
- 添加全局资源：指令/过滤器/过渡等。如 `vue-touch`
- 通过全局混入来添加一些组件选项。如` vue-router`
- 添加 `Vue` 实例方法，通过把它们添加到 `Vue.prototype` 上实现。
- 一个库，提供自己的 `API`，同时提供上面提到的一个或多个功能。如` vue-router`

## 三、两者的区别

两者的区别主要表现在以下几个方面：

- 编写形式
- 注册形式
- 使用场景

### 编写形式

#### 编写组件

编写一个组件，可以有很多方式，我们最常见的就是`vue`单文件的这种格式，每一个`.vue`文件我们都可以看成是一个组件

`vue`文件标准格式

```vue
<template>
</template>
<script>
export default{
    ...
}
</script>
<style>
</style>
```

我们还可以通过`template`属性来编写一个组件，如果组件内容多，我们可以在外部定义`template`组件内容，如果组件内容并不多，我们可直接写在`template`属性上

```js
<template id="testComponent">     // 组件显示的内容
    <div>component!</div>
</template>

Vue.component('componentA',{
    template: '#testComponent'
    template: `<div>component</div>`  // 组件内容少可以通过这种形式
})
```

#### 编写插件
`vue`插件的实现应该暴露一个 `install` 方法。这个方法的第一个参数是 `Vue` 构造器，第二个参数是一个可选的选项对象

```js
MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或 property
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2. 添加全局资源
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
    }
    ...
  })

  // 3. 注入组件选项
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
}
```

### 注册形式

#### 组件注册

`vue`组件注册主要分为全局注册与局部注册

全局注册通过`Vue.component`方法，第一个参数为组件的名称，第二个参数为传入的配置项

```js
Vue.component('my-component-name', { /* ... */ })
```

局部注册只需在用到的地方通过`components`属性注册一个组件

```
const component1 = {...} // 定义一个组件

export default {
    components:{
        component1   // 局部注册
    }
}
```

#### 插件注册
插件的注册通过`Vue.use()`的方式进行注册（安装），第一个参数为插件的名字，第二个参数是可选择的配置项

```
Vue.use(插件名字,{ /* ... */} )
```

注意的是：

注册插件的时候，需要在调用 `new Vue()` 启动应用之前完成

`Vue.use`会自动阻止多次注册相同插件，只会注册一次

### 使用场景

具体的其实在插件是什么章节已经表述了，这里在总结一下

组件 `(Component)` 是用来构成你的 `App` 的业务模块，它的目标是 `App.vue`

插件 `(Plugin)` 是用来增强你的技术栈的功能模块，它的目标是 `Vue` 本身

简单来说，插件就是指对`Vue`的功能的增强或补充

</details>

## 115. Vue中给对象添加新属性时，界面不刷新怎么办? {#question-c0ba0aa2-8660-4049-9a1a-9264259f3182}

> 难度：2 · 类型：QA

### 题目要点

在Vue.js中，直接向已创建的Vue实例的响应式数据对象中添加新属性时，可能会遇到一个问题：这些新属性不会自动变为响应式，因此不会触发视图的更新。这是因为Vue 2.x版本使用`Object.defineProperty`来实现数据响应式，该方法只对预先定义的属性起作用。

#### 原理分析

Vue 2.x使用`Object.defineProperty`来创建对象的响应式属性。这意味着当您访问或设置一个已通过这种方式定义的属性时，Vue会拦截这些操作并执行相应的getter和setter，从而使数据保持响应式。然而，当您添加一个新属性时，Vue不会自动将其设置为响应式，因为`Object.defineProperty`只对已经存在的属性有效。

#### 解决方案

为了解决这个问题，Vue提供了几种方法来确保新添加的属性也是响应式的：

1. **Vue.set()**：Vue提供了一个全局的`Vue.set`方法，它可以用来向响应式对象中添加新的响应式属性。
2. **Object.assign()**：如果您需要向对象添加多个新属性，可以创建一个新的对象，然后使用`Object.assign`方法将原对象和新属性合并。
3. **$forceUpdate()**：这是一个不太推荐的方法，它迫使Vue实例重新渲染，包括其所有子组件。

<details>
<summary>参考答案</summary>

## 一、直接添加属性的问题

我们从一个例子开始

定义一个`p`标签，通过`v-for`指令进行遍历

然后给`botton`标签绑定点击事件，我们预期点击按钮时，数据新增一个属性，界面也 新增一行

```html
<p v-for="(value,key) in item" :key="key">
    {{ value }}
</p>
<button @click="addProperty">动态添加新属性</button>
```

实例化一个`vue`实例，定义`data`属性和`methods`方法

```js
const app = new Vue({
    el:"#app",
    data:()=>{
        item:{
            oldProperty:"旧属性"
        }
    },
    methods:{
        addProperty(){
            this.items.newProperty = "新属性"  // 为items添加新属性
            console.log(this.items)  // 输出带有newProperty的items
        }
    }
})
```

点击按钮，发现结果不及预期，数据虽然更新了（`console`打印出了新属性），但页面并没有更新

## 二、原理分析

为什么产生上面的情况呢？

下面来分析一下

`vue2`是用过`Object.defineProperty`实现数据响应式

```js
const obj = {}
Object.defineProperty(obj, 'foo', {
    get() {
        console.log(`get foo:${val}`);
        return val
    },
    set(newVal) {
        if (newVal !== val) {
            console.log(`set foo:${newVal}`);
            val = newVal
        }
    }
})
```

当我们访问`foo`属性或者设置`foo`值的时候都能够触发`setter`与`getter`

```js
obj.foo
obj.foo = 'new'
```

但是我们为`obj`添加新属性的时候，却无法触发事件属性的拦截

```js
obj.bar  = '新属性'
```

原因是一开始`obj`的`foo`属性被设成了响应式数据，而`bar`是后面新增的属性，并没有通过`Object.defineProperty`设置成响应式数据

## 三、解决方案

`Vue` 不允许在已经创建的实例上动态添加新的响应式属性

若想实现数据与视图同步更新，可采取下面三种解决方案：

- Vue.set()
- Object.assign()
- $forcecUpdated()

### Vue.set()

Vue.set( target, propertyName/index, value )

参数

- `{Object | Array} target`
- `{string | number} propertyName/index`
- `{any} value`

返回值：设置的值

通过`Vue.set`向响应式对象中添加一个`property`，并确保这个新 `property `同样是响应式的，且触发视图更新

关于`Vue.set`源码（省略了很多与本节不相关的代码）

源码位置：`src\core\observer\index.js`

```js
function set (target: Array<any> | Object, key: any, val: any): any {
  ...
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

这里无非再次调用`defineReactive`方法，实现新增属性的响应式

关于`defineReactive`方法，内部还是通过`Object.defineProperty`实现属性拦截

大致代码如下：

```js
function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            console.log(`get ${key}:${val}`);
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                console.log(`set ${key}:${newVal}`);
                val = newVal
            }
        }
    })
}
```

### Object.assign()

直接使用`Object.assign()`添加到对象的新属性不会触发更新

应创建一个新的对象，合并原对象和混入对象的属性

```js
this.someObject = Object.assign({},this.someObject,{newProperty1:1,newProperty2:2 ...})
```

### $forceUpdate

如果你发现你自己需要在 `Vue `中做一次强制更新，99.9% 的情况，是你在某个地方做错了事

`$forceUpdate`迫使` Vue` 实例重新渲染

PS：仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。

### 小结

- 如果为对象添加少量的新属性，可以直接采用`Vue.set()`

- 如果需要为新对象添加大量的新属性，则通过`Object.assign()`创建新对象

- 如果你实在不知道怎么操作时，可采取`$forceUpdate()`进行强制刷新 (不建议)

PS：`vue3`是用过`proxy`实现数据响应式的，直接动态添加新属性仍可以实现数据响应式

</details>

## 116. 为什么Vue中的data属性是一个函数而不是一个对象？ {#question-7e8c5dd0-90cc-451b-afdb-0c4150704768}

> 难度：2 · 类型：QA

### 题目要点

在Vue中，实例和组件的`data`定义有一些区别。对于根Vue实例，`data`可以是一个对象或者函数。然而，对于Vue组件，`data`必须是一个函数。

#### 组件`data`定义函数与对象的区别

组件中的`data`必须是一个函数，这是因为在Vue组件创建时，它会通过`Vue.extend()`创建组件构造函数，然后实例化多个组件实例。如果`data`定义为对象，这些组件实例将共享同一个`data`对象，导致数据污染。而如果`data`定义为函数，每个组件实例在创建时都会调用该函数，得到一个新的`data`对象，从而避免数据污染。

#### 原理分析

当组件创建时，Vue会进行选项合并，其中包括`data`选项。如果在合并过程中发现`data`类型不是函数，Vue会发出警告。这是因为Vue期望每个组件实例都有自己独立的`data`对象，以保证组件间的数据隔离。

<details>
<summary>参考答案</summary>

## 一、实例和组件定义data的区别

`vue`实例的时候定义`data`属性既可以是一个对象，也可以是一个函数

```js
const app = new Vue({
    el:"#app",
    // 对象格式
    data:{
        foo:"foo"
    },
    // 函数格式
    data(){
        return {
             foo:"foo"
        }
    }
})
```

组件中定义`data`属性，只能是一个函数

如果为组件`data`直接定义为一个对象

```js
Vue.component('component1',{
    template:`<div>组件</div>`,
    data:{
        foo:"foo"
    }
})
```

则会得到警告信息

 ![image.png](https://static.ecool.fun//article/c401c122-b612-4693-bc1a-5d4744f89d8b.png)

警告说明：返回的`data`应该是一个函数在每一个组件实例中

## 二、组件data定义函数与对象的区别

上面讲到组件`data`必须是一个函数，不知道大家有没有思考过这是为什么呢？

在我们定义好一个组件的时候，`vue`最终都会通过`Vue.extend()`构成组件实例

这里我们模仿组件构造函数，定义`data`属性，采用对象的形式

```js
function Component(){

}
Component.prototype.data = {
    count : 0
}
```

创建两个组件实例

```
const componentA = new Component()
const componentB = new Component()
```

修改`componentA`组件`data`属性的值，`componentB`中的值也发生了改变

```js
console.log(componentB.data.count)  // 0
componentA.data.count = 1
console.log(componentB.data.count)  // 1
```

产生这样的原因这是两者共用了同一个内存地址，`componentA`修改的内容，同样对`componentB`产生了影响

如果我们采用函数的形式，则不会出现这种情况（函数返回的对象内存地址并不相同）

```js
function Component(){
    this.data = this.data()
}
Component.prototype.data = function (){
    return {
        count : 0
    }
}
```

修改`componentA`组件`data`属性的值，`componentB`中的值不受影响

```js
console.log(componentB.data.count)  // 0
componentA.data.count = 1
console.log(componentB.data.count)  // 0
```

`vue`组件可能会有很多个实例，采用函数返回一个全新`data`形式，使每个实例对象的数据不会受到其他实例对象数据的污染

## 三、原理分析

首先可以看看`vue`初始化`data`的代码，`data`的定义可以是函数也可以是对象

源码位置：`/vue-dev/src/core/instance/state.js`

```js
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
    ...
}
```
`data`既能是`object`也能是`function`，那为什么还会出现上文警告呢？

别急，继续看下文

组件在创建的时候，会进行选项的合并

源码位置：`/vue-dev/src/core/util/options.js`

自定义组件会进入`mergeOptions`进行选项合并

```js
Vue.prototype._init = function (options?: Object) {
    ...
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    ...
  }
```

定义`data`会进行数据校验

源码位置：`/vue-dev/src/core/instance/init.js`

这时候`vm`实例为`undefined`，进入`if`判断，若`data`类型不是`function`，则出现警告提示

```js
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    if (childVal && typeof childVal !== "function") {
      process.env.NODE_ENV !== "production" &&
        warn(
          'The "data" option should be a function ' +
            "that returns a per-instance value in component " +
            "definitions.",
          vm
        );

      return parentVal;
    }
    return mergeDataOrFn(parentVal, childVal);
  }
  return mergeDataOrFn(parentVal, childVal, vm);
};
```

### 四、结论

- 根实例对象`data`可以是对象也可以是函数（根实例是单例），不会产生数据污染情况
- 组件实例对象`data`必须为函数，目的是为了防止多个组件实例对象之间共用一个`data`，产生数据污染。采用函数的形式，`initData`时会将其作为工厂函数都会返回全新`data`对象

</details>

## 117. SPA（单页应用）首屏加载速度慢怎么解决？ {#question-a5032eb9-6a53-4792-852f-3f9417631c47}

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

## 118. 为什么Vue中的v-if和v-for不建议一起用? {#question-8688fc18-d0c2-4122-ac6f-ea86d8798d42}

> 难度：1 · 类型：QA

### 题目要点

在Vue中，`v-if`和`v-for`是两个常用的指令，用于条件渲染和列表渲染。

#### 一、作用

- `v-if`：根据表达式的值决定是否渲染元素。当表达式为`true`时，元素被渲染；为`false`时，元素被移除。
- `v-for`：基于数据数组渲染一个列表。`v-for`需要使用`item in items`语法，其中`items`是源数据数组或对象，而`item`是对数组元素的别名。

#### 二、优先级

- 在Vue 2.x中，`v-for`的优先级高于`v-if`，意味着如果`v-for`和`v-if`同时用在同一个元素上，`v-for`会先执行。
- 在Vue 3.x中，`v-if`的优先级高于`v-for`，这意味着在列表渲染中，`v-if`可以先于`v-for`执行。

#### 三、注意事项

- 不要在同一个元素上同时使用`v-if`和`v-for`，因为这会导致性能问题，每次渲染都会先执行`v-for`循环，然后再执行`v-if`条件判断。
- 为了避免这个问题，可以将`v-if`放在一个外层的`<template>`标签上，然后在这个模板内部使用`v-for`进行循环。
- 如果`v-if`条件出现在`v-for`循环内部，可以通过计算属性`computed`提前过滤掉不需要显示的项，提高渲染效率。
总之，合理使用`v-if`和`v-for`可以有效提高Vue应用的性能和渲染效率。

<details>
<summary>参考答案</summary>

## 一、作用

`v-if` 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 `true`值的时候被渲染

`v-for` 指令基于一个数组来渲染一个列表。`v-for` 指令需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据数组或者对象，而 `item` 则是被迭代的数组元素的别名

在 `v-for` 的时候，建议设置`key`值，并且保证每个`key`值是独一无二的，这便于`diff`算法进行优化

两者在用法上

```js
<Modal v-if="isShow" />

<li v-for="item in items" :key="item.id">
    {{ item.label }}
</li>
```

## 二、优先级

`v-if`与`v-for`都是`vue`模板系统中的指令

在`vue`模板编译的时候，会将指令系统转化成可执行的`render`函数

在 `Vue2` 当中，v-for的优先级更高，而在 `Vue3` 当中，则是v-if的优先级更高。

在 `Vue3` 当中，做了v-if的提升优化，去除了没有必要的计算，但同时也会带来一个无法取到 `v-for` 当中遍历的item问题，这就需要开发者们采取其他灵活的方式去解决这种问题。

## 三、注意事项

1. 永远不要把 `v-if` 和 `v-for` 同时用在同一个元素上，带来性能方面的浪费（每次渲染都会先循环再进行条件判断）
2. 如果避免出现这种情况，则在外层嵌套`template`（页面渲染不生成`dom`节点），在这一层进行v-if判断，然后在内部进行v-for循环

```js
<template v-if="isShow">
    <p v-for="item in items">
</template>
```

3. 如果条件出现在循环内部，可通过计算属性`computed`提前过滤掉那些不需要显示的项

```js
computed: {
    items: function() {
      return this.list.filter(function (item) {
        return item.isShow
      })
    }
}
```

</details>

## 119. 说说你对Vue生命周期的理解 {#question-cf1e843f-9005-42dc-b204-194dd3d1fc42}

> 难度：2 · 类型：QA

### 题目要点

#### 一、生命周期是什么

生命周期可以通俗地理解为组件从创建、初始化数据、编译模板、挂载到DOM、渲染、更新、销毁等一系列过程。这些生命周期钩子提供了一个时间点，允许开发者执行特定任务，例如数据获取、事件绑定、状态管理等。

#### 二、生命周期有哪些

Vue的生命周期钩子包括以下阶段：

- `beforeCreate`：组件实例被创建之初，`data`和`methods`还未定义。
- `created`：组件实例已经完全创建，`data`和`methods`已经定义，但尚未挂载到DOM上。
- `beforeMount`：组件挂载之前，模板已编译完成，但DOM还未被渲染。
- `mounted`：组件已经挂载到DOM上，`el`选项对应的真实DOM元素已被替换，可以访问和操作DOM元素。
- `beforeUpdate`：组件数据发生变化，即将重新渲染之前。
- `updated`：组件数据更新完成，所有状态都是最新的。
- `beforeDestroy`：组件实例销毁之前，可以清理定时器、解绑事件监听器等。
- `destroyed`：组件实例完全销毁，`data`和`methods`不可访问。
此外，还有特殊的生命周期钩子：
- `activated`：`keep-alive`缓存的组件激活时调用。
- `deactivated`：`keep-alive`缓存的组件停用时调用。
- `errorCaptured`：捕获一个来自子孙组件的错误时调用。

#### 三、生命周期整体流程

Vue的生命周期流程可以分为以下几个阶段：

1. **beforeCreate -> created**：初始化`Vue`实例，进行数据观测。
2. **created**：完成数据观测，属性与方法的运算，`watch`、`event`事件回调的配置。可以调用`methods`中的方法，访问和修改`data`数据触发响应式渲染`dom`，可通过`computed`和`watch`完成数据计算。
3. **created -> beforeMount**：判断是否存在`el`选项，若不存在则停止编译，直到调用`vm.$mount(el)`才会继续编译。
4. **beforeMount -> mounted**：此阶段`vm.el`完成挂载，`vm.$el`生成的`DOM`替换了`el`选项所对应的`DOM`。
5. **mounted**：`vm.el`已完成`DOM`的挂载与渲染。
6. **beforeUpdate**：更新的数据必须是被渲染在模板上的（`el`、`template`、`rende`r之一）。
7. **updated**：完成`view`层的更新。
8. **beforeDestroy**：实例被销毁前调用。
9. **destroyed**：组件实例完全销毁。

#### 四、题外话：数据请求在`created`和`mounted`的区别

`created`钩子在组件实例创建完成时立刻调用，此时页面`DOM`节点还未生成。而`mounted`钩子在页面`DOM`节点渲染完毕后立刻执行。

- `created`更适合用于数据请求，因为它在`mounted`之前调用，可以避免页面闪动。
- `mounted`适合用于页面交互，因为它在页面渲染完毕后调用，可以确保页面已经完全加载。

<details>
<summary>参考答案</summary>

## 一、生命周期是什么<br>

生命周期`（Life Cycle）`的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓”`（Cradle-to-Grave）`的整个过程在`Vue`中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、卸载等一系列过程我们可以把组件比喻成工厂里面的一条流水线，每个工人（生命周期）站在各自的岗位，当任务流转到工人身边的时候，工人就开始工作PS：在`Vue`生命周期钩子会自动绑定 `this` 上下文到实例中，因此你可以访问数据，对 `property` 和方法进行运算这意味着**你不能使用箭头函数来定义一个生命周期方法** \(例如 `created: () => this.fetchTodos()`\)

## 二、生命周期有哪些

Vue生命周期总共可以分为8个阶段：创建前后, 载入前后,更新前后,销毁前销毁后，以及一些特殊场景的生命周期

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 组件实例被创建之初 |
| created | 组件实例已经完全创建 |
| beforeMount | 组件挂载之前 |
| mounted | 组件挂载到实例上去之后 |
| beforeUpdate | 组件数据发生变化，更新之前 |
| updated | 数据数据更新之后 |
| beforeDestroy | 组件实例销毁之前 |
| destroyed | 组件实例销毁之后 |
| activated | keep-alive 缓存的组件激活时 |
| deactivated | keep-alive 缓存的组件停用时调用 |
| errorCaptured | 捕获一个来自子孙组件的错误时被调用 |

## 三、生命周期整体流程

`Vue`生命周期流程图

 ![](https://static.ecool.fun//article/a3ce0701-cd4c-4486-9dfc-4aa32628b63a.png)

#### 具体分析

**beforeCreate -> created**

- 初始化`vue`实例，进行数据观测

**created**

- 完成数据观测，属性与方法的运算，`watch`、`event`事件回调的配置
- 可调用`methods`中的方法，访问和修改data数据触发响应式渲染`dom`，可通过`computed`和`watch`完成数据计算
- 此时`vm.$el` 并没有被创建

**created -> beforeMount**

- 判断是否存在`el`选项，若不存在则停止编译，直到调用`vm.$mount(el)`才会继续编译
- 优先级：`render` > `template` > `outerHTML`
- `vm.el`获取到的是挂载`DOM`的

**beforeMount**

- 在此阶段可获取到`vm.el`
- 此阶段`vm.el`虽已完成DOM初始化，但并未挂载在`el`选项上

**beforeMount -> mounted**

- 此阶段`vm.el`完成挂载，`vm.$el`生成的`DOM`替换了`el`选项所对应的`DOM`

**mounted**

- `vm.el`已完成`DOM`的挂载与渲染，此刻打印`vm.$el`，发现之前的挂载点及内容已被替换成新的DOM

**beforeUpdate**

- 更新的数据必须是被渲染在模板上的（`el`、`template`、`rende`r之一）
- 此时`view`层还未更新
- 若在`beforeUpdate`中再次修改数据，不会再次触发更新方法

**updated**

- 完成`view`层的更新
- 若在`updated`中再次修改数据，会再次触发更新方法（`beforeUpdate`、`updated`）

**beforeDestroy**

- 实例被销毁前调用，此时实例属性与方法仍可访问

**destroyed**

- 完全销毁一个实例。可清理它与其它实例的连接，解绑它的全部指令及事件监听器
- 并不能清除DOM，仅仅销毁实例

**使用场景分析**

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 执行时组件实例还未创建，通常用于插件开发中执行一些初始化任务 |
| created | 组件初始化完毕，各种数据可以使用，常用于异步数据获取 |
| beforeMount | 未执行渲染、更新，dom未创建 |
| mounted | 初始化结束，dom已创建，可用于获取访问数据和dom元素 |
| beforeUpdate | 更新前，可用于获取更新前各种状态 |
| updated | 更新后，所有状态已是最新 |
| beforeDestroy | 销毁前，可用于一些定时器或订阅的取消 |
| destroyed | 组件已销毁，作用同上 |

## 四、题外话：数据请求在created和mouted的区别

`created`是在组件实例一旦创建完成的时候立刻调用，这时候页面`dom`节点并未生成`mounted`是在页面`dom`节点渲染完毕之后就立刻执行的触发时机上`created`是比`mounted`要更早的两者相同点：都能拿到实例对象的属性和方法讨论这个问题本质就是触发的时机，放在`mounted`请求有可能导致页面闪动（页面`dom`结构已经生成），但如果在页面加载前完成则不会出现此情况建议：放在`create`生命周期当中

</details>

## 120. Vue实例挂载的过程中发生了什么？ {#question-41132096-4901-45d1-a453-6119931a083e}

> 难度：2 · 类型：QA

### 题目要点

当创建一个新的Vue实例时，Vue会执行一系列的初始化步骤，这些步骤构成了Vue的生命周期。以下是Vue实例化过程中发生的主要步骤：

1. **创建Vue实例**：使用`new Vue()`创建一个新的Vue实例，实例会接收一个配置对象，该对象包含了数据、方法、生命周期钩子等信息。
2. **合并选项**：Vue会合并用户传递的配置选项，包括`data`、`methods`、`props`、`computed`等，同时会处理如`mixins`、`extends`等高级选项。
3. **初始化数据响应式**：Vue使用`Object.defineProperty`或`Proxy`来将`data`中的属性转换为响应式，以便数据变化时能够自动更新视图。
4. **生命周期钩子**：Vue会调用`beforeCreate`钩子，在这个阶段，实例的数据和事件等属性还没有被创建。然后调用`created`钩子，在这个阶段，实例已经创建完成，可以访问和修改数据。
5. **挂载组件**：如果配置了`el`属性，Vue会调用`$mount`方法将组件挂载到指定的DOM元素上。这个过程中，Vue会编译模板、生成虚拟DOM，并将虚拟DOM渲染到真实DOM上。
6. **渲染视图**：Vue的`render`方法会返回一个虚拟DOM树，`_update`方法会根据虚拟DOM树生成真实的DOM树，并替换旧的DOM树。
7. **更新视图**：当数据变化时，Vue会重新执行`render`方法，生成新的虚拟DOM，并通过`_update`方法更新真实DOM。
8. **销毁组件**：当组件需要被销毁时，Vue会调用`beforeDestroy`钩子，在这个阶段，实例仍然可以访问。然后调用`destroyed`钩子，在这个阶段，实例的数据和事件等属性已经被销毁，不能被访问。

Vue的生命周期提供了一个清晰的时间线，允许开发者在这个时间线上的特定时刻执行特定任务。例如，可以在`created`钩子中进行数据获取，在`mounted`钩子中进行DOM操作，在`updated`钩子中进行数据更新后的逻辑处理。

<details>
<summary>参考答案</summary>

## 一、思考

我们都听过知其然知其所以然这句话

那么不知道大家是否思考过`new Vue()`这个过程中究竟做了些什么？

过程中是如何完成数据的绑定，又是如何将数据渲染到视图的等等

## 一、分析

首先找到`vue`的构造函数

源码位置：src\core\instance\index.js

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

`options`是用户传递过来的配置项，如`data、methods`等常用的方法

`vue`构建函数调用`_init`方法，但我们发现本文件中并没有此方法，但仔细可以看到文件下方定定义了很多初始化方法

```js
initMixin(Vue);     // 定义 _init
stateMixin(Vue);    // 定义 $set $get $delete $watch 等
eventsMixin(Vue);   // 定义事件  $on  $once $off $emit
lifecycleMixin(Vue);// 定义 _update  $forceUpdate  $destroy
renderMixin(Vue);   // 定义 _render 返回虚拟dom
```

首先可以看`initMixin`方法，发现该方法在`Vue`原型上定义了`_init`方法

源码位置：src\core\instance\init.js

```js
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 合并属性，判断初始化的是否是组件，这里合并主要是 mixins 或 extends 的方法
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else { // 合并vue属性
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      // 初始化proxy拦截器
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化组件生命周期标志位
    initLifecycle(vm)
    // 初始化组件事件侦听
    initEvents(vm)
    // 初始化渲染方法
    initRender(vm)
    callHook(vm, 'beforeCreate')
    // 初始化依赖注入内容，在初始化data、props之前
    initInjections(vm) // resolve injections before data/props
    // 初始化props/data/method/watch/methods
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 挂载元素
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
```

仔细阅读上面的代码，我们得到以下结论：

- 在调用`beforeCreate`之前，数据初始化并未完成，像`data`、`props`这些属性无法访问到

- 到了`created`的时候，数据已经初始化完成，能够访问`data`、`props`这些属性，但这时候并未完成`dom`的挂载，因此无法访问到`dom`元素
- 挂载方法是调用`vm.$mount`方法

`initState`方法是完成`props/data/method/watch/methods`的初始化

源码位置：src\core\instance\state.js

```js
export function initState (vm: Component) {
  // 初始化组件的watcher列表
  vm._watchers = []
  const opts = vm.$options
  // 初始化props
  if (opts.props) initProps(vm, opts.props)
  // 初始化methods方法
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    // 初始化data
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

我们和这里主要看初始化`data`的方法为`initData`，它与`initState`在同一文件上

```js
function initData (vm: Component) {
  let data = vm.$options.data
  // 获取到组件上的data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      // 属性名不能与方法名重复
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    // 属性名不能与state名称重复
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) { // 验证key值的合法性
      // 将_data中的数据挂载到组件vm上,这样就可以通过this.xxx访问到组件上的数据
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 响应式监听data是数据的变化
  observe(data, true /* asRootData */)
}
```

仔细阅读上面的代码，我们可以得到以下结论：

- 初始化顺序：`props`、`methods`、`data`

- `data`定义的时候可选择函数形式或者对象形式（组件只能为函数形式）

关于数据响应式在这就不展开详细说明

上文提到挂载方法是调用`vm.$mount`方法

源码位置：

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 获取或查询元素
  el = el && query(el)

  /* istanbul ignore if */
  // vue 不允许直接挂载到body或页面文档上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    // 存在template模板，解析vue模板文件
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 通过选择器获取元素内容
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      /**
       *  1.将temmplate解析ast tree
       *  2.将ast tree转换成render语法字符串
       *  3.生成render方法
       */
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```

阅读上面代码，我们能得到以下结论：

- 不要将根元素放到`body`或者`html`上

- 可以在对象中定义`template/render`或者直接使用`template`、`el`表示元素选择器

- 最终都会解析成`render`函数，调用`compileToFunctions`，会将`template`解析成`render`函数

对`template`的解析步骤大致分为以下几步：

- 将`html`文档片段解析成`ast`描述符

- 将`ast`描述符解析成字符串

- 生成`render`函数

生成`render`函数，挂载到`vm`上后，会再次调用`mount`方法

源码位置：src\platforms\web\runtime\index.js

```js
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // 渲染组件
  return mountComponent(this, el, hydrating)
}
```

调用`mountComponent`渲染组件

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 如果没有获取解析的render函数，则会抛出警告
  // render是解析模板文件生成的
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        // 没有获取到vue的模板文件
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // 执行beforeMount钩子
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    // 定义更新函数
    updateComponent = () => {
      // 实际调⽤是在lifeCycleMixin中定义的_update和renderMixin中定义的_render
      vm._update(vm._render(), hydrating)
    }
  }
  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 监听当前组件状态，当有数据变化时，更新组件
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        // 数据更新引发的组件更新
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

阅读上面代码，我们得到以下结论：

- 会触发`boforeCreate`钩子
- 定义`updateComponent`渲染页面视图的方法
- 监听组件数据，一旦发生变化，触发`beforeUpdate`生命钩子

`updateComponent`方法主要执行在`vue`初始化时声明的`render`，`update`方法

`render`的作用主要是生成`vnode`

源码位置：src\core\instance\render.js

```js
// 定义vue 原型上的render方法
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    // render函数来自于组件的option
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
            _parentVnode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
        )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm
        // 调用render方法，自己的独特的render方法， 传入createElement参数，生成vNode
        vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
        handleError(e, vm, `render`)
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
            try {
                vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
            } catch (e) {
                handleError(e, vm, `renderError`)
                vnode = vm._vnode
            }
        } else {
            vnode = vm._vnode
        }
    } finally {
        currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
        if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
            warn(
                'Multiple root nodes returned from render function. Render function ' +
                'should return a single root node.',
                vm
            )
        }
        vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
}
```

`_update`主要功能是调用`patch`，将`vnode`转换为真实`DOM`，并且更新到页面中

源码位置：src\core\instance\lifecycle.js

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    // 设置当前激活的作用域
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      // 执行具体的挂载逻辑
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }
```

## 三、结论

- `new Vue`的时候调用会调用`_init`方法
  - 定义 `$set`、` $get` 、`$delete`、`$watch` 等方法
  - 定义 `$on`、`$off`、`$emit`、`$off `等事件
  - 定义 `_update`、`$forceUpdate`、`$destroy`生命周期

- 调用`$mount`进行页面的挂载
- 挂载的时候主要是通过`mountComponent`方法
- 定义`updateComponent`更新函数
- 执行`render`生成虚拟`DOM`
- `_update`将虚拟`DOM`生成真实`DOM`结构，并且渲染到页面中

</details>

## 121. Vue中的 v-show 和 v-if 有什么区别 {#question-db22b09c-fdbb-4a6c-8fdd-2ad65bb11846}

> 难度：2 · 类型：QA

### 题目要点

`v-if` 和 `v-show` 的区别：

- `v-if`：
  - 惰性加载：条件为假时不编译和渲染元素。
  - 显示/隐藏：条件变化时，元素会被添加或移除出 DOM。
  - 开销：条件切换时涉及 DOM 操作，开销较大。
  - 适用场景：元素不需要频繁切换显示状态。
- `v-show`：
  - 非惰性加载：无论条件真假，元素总是被编译和渲染。
  - 显示/隐藏：通过 CSS 控制显示状态，元素始终在 DOM 中。
  - 开销：条件切换时仅修改 CSS，开销较小。
  - 适用场景：元素需要频繁切换显示状态。

<details>
<summary>参考答案</summary>

`v-if` 和 `v-show` 是 Vue.js 中用于条件渲染的指令，它们的作用是根据条件来控制元素的显示和隐藏。它们之间有一些重要的区别：

1. 编译时刻 vs 运行时刻：<br>
   * `v-if` 是一个“惰性”指令，在编译时刻，Vue.js 会根据条件决定是否编译或挂载元素到 DOM 中。如果条件为 `false`，元素根本不会被编译和渲染到 DOM 中。<br>
   * `v-show` 是一个“非惰性”指令，在编译时刻，元素总是会被编译和渲染到 DOM 中。但是，根据条件的值，`v-show` 会通过 CSS 控制元素的显示和隐藏，不会从 DOM 中移除元素。
2. 显示隐藏方式：<br>
   * `v-if` 在条件为 `true` 时会渲染元素到 DOM，而在条件为 `false` 时会从 DOM 中移除元素。`v-if`也可以触发组件创建和销毁的生命钩子。<br>
   * `v-show` 在条件为 `true` 时会通过 CSS 设置元素的 `display` 属性为可见（通常是 `display: block`），在条件为 `false` 时设置为隐藏（`display: none`）。元素始终存在于 DOM 中，只是通过 CSS 控制其显示状态。
3. 切换开销：<br>
   * `v-if` 在条件切换时，如果条件从 `true` 切换为 `false`，会销毁并重新创建元素，这涉及到 DOM 的删除和重新插入，可能会有一定的性能开销。<br>
   * `v-show` 在条件切换时，只是简单地通过 CSS 控制元素的显示和隐藏，不会销毁和重新创建元素，因此切换的开销较小。
4. 初始渲染开销：<br>
   * `v-if` 在初始渲染时，如果条件为 `false`，元素不会被渲染到 DOM 中，因此在初始渲染时可能会有一定的性能优势。<br>
   * `v-show` 在初始渲染时，元素总是会被渲染到 DOM 中，因此在初始渲染时可能会有一些额外的开销。

综上所述，当需要频繁切换元素的显示状态时，且元素可能处于不同的状态，推荐使用 `v-show`。而当条件不会频繁改变，且希望在条件为 `false` 时不渲染元素到 DOM 中，推荐使用 `v-if`。在实际使用中，根据具体的场景和性能需求来选择合适的指令。

</details>

## 122. 谈谈对Vue中双向绑定的理解 {#question-da1881cc-64b9-40f8-8a25-a6256c1349ed}

> 难度：2 · 类型：QA

### 题目要点

Vue中的双向绑定是其核心特性之一，它极大地简化了数据在视图（View）和模型（Model）之间的同步过程。双向绑定意味着当数据发生变化时，视图会自动更新以反映这些变化，反之亦然，用户在视图上的操作（如输入）也会自动更新到数据中。

#### 实现原理

Vue的双向绑定主要依赖于其响应式系统（Reactivity System）和模板引擎（Template Engine）。

1. **响应式系统**：Vue使用Object.defineProperty（在Vue 3中使用了Proxy）来劫持（或说“代理”）对象的getter和setter。当组件的data中的属性被访问或修改时，Vue会拦截这些操作，并执行相应的依赖更新逻辑。这样，Vue就能追踪到数据的变化，并在需要时更新视图。

2. **模板引擎**：Vue的模板引擎使用基于HTML的模板语法，允许开发者声明式地将DOM绑定到底层Vue实例的数据上。当数据变化时，Vue的模板引擎会重新渲染模板，生成新的虚拟DOM树，并通过高效的DOM diff算法更新真实的DOM，以反映数据的最新状态。

<details>
<summary>参考答案</summary>

## 一、什么是双向绑定

我们先从单向绑定切入单向绑定非常简单，就是把`Model`绑定到`View`，当我们用`JavaScript`代码更新`Model`时，`View`就会自动更新双向绑定就很容易联想到了，在单向绑定的基础上，用户更新了`View`，`Model`的数据也自动被更新了，这种情况就是双向绑定举个栗子

 ![](https://static.ecool.fun//article/129e9076-eae0-4f4c-87e5-3330cbb35e23.png)

当用户填写表单时，`View`的状态就被更新了，如果此时可以自动更新`Model`的状态，那就相当于我们把`Model`和`View`做了双向绑定关系图如下

 ![](https://static.ecool.fun//article/042320e1-1cc9-4439-ac9d-bf6a7ababccf.png)

## 二、双向绑定的原理是什么

我们都知道 `Vue` 是数据双向绑定的框架，双向绑定由三个重要部分构成

- 数据层（Model）：应用的数据及业务逻辑
- 视图层（View）：应用的展示效果，各类UI组件
- 业务逻辑层（ViewModel）：框架封装的核心，它负责将数据与视图关联起来

而上面的这个分层的架构方案，可以用一个专业术语进行称呼：`MVVM`这里的控制层的核心功能便是 “数据双向绑定” 。自然，我们只需弄懂它是什么，便可以进一步了解数据绑定的原理

### 理解ViewModel

它的主要职责就是：

- 数据变化后更新视图
- 视图变化后更新数据

当然，它还有两个主要部分组成

- 监听器（Observer）：对所有数据的属性进行监听
- 解析器（Compiler）：对每个元素节点的指令进行扫描跟解析,根据指令模板替换数据,以及绑定相应的更新函数

### 三、实现双向绑定

我们还是以`Vue`为例，先来看看`Vue`中的双向绑定流程是什么的

1.  `new Vue()`首先执行初始化，对`data`执行响应化处理，这个过程发生`Observe`中
2.  同时对模板执行编译，找到其中动态绑定的数据，从`data`中获取并初始化视图，这个过程发生在`Compile`中
3.  同时定义⼀个更新函数和`Watcher`，将来对应数据变化时`Watcher`会调用更新函数
4.  由于`data`的某个`key`在⼀个视图中可能出现多次，所以每个`key`都需要⼀个管家`Dep`来管理多个`Watcher`
5.  将来data中数据⼀旦发生变化，会首先找到对应的`Dep`，通知所有`Watcher`执行更新函数

流程图如下：

 ![](https://static.ecool.fun//article/7e2d907a-e80d-4e00-ab72-4f829010bd47.png)

### 实现

先来一个构造函数：执行初始化，对`data`执行响应化处理

```js
class Vue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
      
    // 对data选项做响应式处理
    observe(this.$data);
      
    // 代理data到vm上
    proxy(this);
      
    // 执行编译
    new Compile(options.el, this);
  }
}
```

对`data`选项执行响应化具体操作

```js
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }
  new Observer(obj);
}

class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value);
  }
  walk(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}
```

#### 编译`Compile`

对每个元素节点的指令进行扫描跟解析,根据指令模板替换数据,以及绑定相应的更新函数

 ![](https://static.ecool.fun//article/81fac2e4-25a8-4a51-adff-143803d0099a.png)

```
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);  // 获取dom
    if (this.$el) {
      this.compile(this.$el);
    }
  }
  compile(el) {
    const childNodes = el.childNodes; 
    Array.from(childNodes).forEach((node) => { // 遍历子元素
      if (this.isElement(node)) {   // 判断是否为节点
        console.log("编译元素" + node.nodeName);
      } else if (this.isInterpolation(node)) {
        console.log("编译插值⽂本" + node.textContent);  // 判断是否为插值文本 {{}}
      }
      if (node.childNodes && node.childNodes.length > 0) {  // 判断是否有子元素
        this.compile(node);  // 对子元素进行递归遍历
      }
    });
  }
  isElement(node) {
    return node.nodeType == 1;
  }
  isInterpolation(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
}

```

#### 依赖收集

视图中会用到`data`中某`key`，这称为依赖。同⼀个`key`可能出现多次，每次都需要收集出来用⼀个`Watcher`来维护它们，此过程称为依赖收集多个`Watcher`需要⼀个`Dep`来管理，需要更新时由`Dep`统⼀通知

 ![](https://static.ecool.fun//article/7a337c07-fe16-4da1-ba47-28c28a4a61c6.png)

实现思路

 1. `defineReactive`时为每⼀个`key`创建⼀个`Dep`实例
 2. 初始化视图时读取某个`key`，例如`name1`，创建⼀个`watcher1`
 3. 由于触发`name1`的`getter`方法，便将`watcher1`添加到`name1`对应的Dep中
 4. 当`name1`更新，`setter`触发时，便可通过对应`Dep`通知其管理所有`Watcher`更新

```js
// 负责更新视图
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updaterFn = updater

    // 创建实例时，把当前实例指定到Dep.target静态属性上
    Dep.target = this
    // 读一下key，触发get
    vm[key]
    // 置空
    Dep.target = null
  }

  // 未来执行dom更新函数，由dep调用的
  update() {
    this.updaterFn.call(this.vm, this.vm[this.key])
  }
}
```

声明`Dep`

```js
class Dep {
  constructor() {
    this.deps = [];  // 依赖管理
  }
  addDep(dep) {
    this.deps.push(dep);
  }
  notify() { 
    this.deps.forEach((dep) => dep.update());
  }
}
```

创建`watcher`时触发`getter`

```js
class Watcher {
  constructor(vm, key, updateFn) {
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
}

```

依赖收集，创建`Dep`实例

```js
function defineReactive(obj, key, val) {
  this.observe(val);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addDep(Dep.target);// Dep.target也就是Watcher实例
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      dep.notify(); // 通知dep执行更新方法
    },
  });
}
```

</details>

## 123. 说说你对vue的理解? {#question-052ca3d3-2a82-4f99-87fb-ccf6c4a8e630}

> 难度：1.5 · 类型：QA

### 题目要点

1. **渐进式框架**：Vue.js是一个渐进式MVVM（模型-视图-视图模型）框架，其“渐进式”意味着它不强求开发者一次性接受所有功能，而是允许开发者根据项目需求逐步采用Vue的不同特性。

2. **功能特点**：
   - **声明式渲染**：Vue.js通过声明式的方式让开发者描述应用的状态，框架会自动渲染视图。
   - **组件化系统**：Vue.js采用组件化架构，使得代码更加模块化和可复用。
   - **客户端路由**：Vue提供了Vue Router，用于单页应用的路由管理。
   - **状态管理**：通过Vuex等工具实现大规模状态的管理。
   - **构建工具**：Vue提供了Vue CLI等构建工具，以提升开发效率。
   - **数据持久化**：Vue可以与其他库或服务结合使用，以实现数据的持久化。
   - **跨平台支持**：Vue.js可以与Weex等平台结合，实现跨平台应用的开发。
3. **视图层关注**：Vue.js主要关注MVC模式中的视图层，简化了视图与模型的交互过程。
4. **响应式系统**：
   - Vue.js的核心库实现了声明式渲染引擎，将模板编译成渲染函数。
   - 在运行时或预编译阶段，Vue.js的响应式系统会通过数据的getter和setter方法实现数据的依赖收集和通知更新。
   - 当数据变化时，观察者（Watcher）会触发组件的重新渲染，Vue.js会通过Diff算法比较新旧虚拟DOM树，并只更新必要的真实DOM元素。

<details>
<summary>参考答案</summary>

Vue.js（/vjuː/，或简称为Vue）是一个用于创建用户界面的开源JavaScript框架，也是一个创建单页应用的Web应用框架。

Vue 是一套用于构建用户界面的渐进式MVVM框架。那怎么理解渐进式呢？渐进式含义：强制主张最少。

Vue.js包含了声明式渲染、组件化系统、客户端路由、大规模状态管理、构建工具、数据持久化、跨平台支持等，但在实际开发中，并没有强制要求开发者使用某一特定功能，而是根据需求逐渐扩展。

Vue所关注的核心是MVC模式中的视图层，同时，它也能方便地获取数据更新，并通过组件内部特定的方法实现视图与模型的交互。

Vue.js的核心库只关心视图渲染，且由于渐进式的特性，Vue.js便于与第三方库或既有项目整合。Vue.js 实现了一套声明式渲染引擎，并在runtime或者预编译时将声明式的模板编译成渲染函数，挂载在观察者 Watcher 中，在渲染函数中（touch），响应式系统使用响应式数据的getter方法对观察者进行依赖收集（Collect as Dependency），使用响应式数据的setter方法通知（notify）所有观察者进行更新，此时观察者 Watcher 会触发组件的渲染函数（Trigger re-render），组件执行的 render 函数，生成一个新的 Virtual DOM Tree，此时 Vue 会对新老 Virtual DOM Tree 进行 Diff，查找出需要操作的真实 DOM 并对其进行更新。

</details>
