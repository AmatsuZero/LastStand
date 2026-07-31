+++
title = "插槽"
date = '2024-10-04T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = false
weight = 9
tags = ["面试", "前端", "Vue", "插槽", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 一、插槽的几种使用方式

### 1. 普通插槽

举例来说，这里有一个 `<FancyButton>` 组件，可以像这样使用：

```html
<FancyButton>
  Click me! <!-- 插槽内容 -->
</FancyButton>
```

而 `<FancyButton>` 的模板是这样的：

```html
<button class="fancy-btn">
  <slot></slot> <!-- 插槽出口 -->
</button>
```

`<slot>` 元素是一个 **插槽出口** (slot outlet)，标示了父元素提供的 **插槽内容** (slot content) 将在哪里被渲染。

最终渲染出的 DOM 是这样：

```html
<button class="fancy-btn">Click me!</button>
```

### 2. 具名插槽

有时在一个组件中包含多个插槽出口是很有用的。举例来说，在一个 `<BaseLayout>` 组件中，有如下模板：

```html
<div class="container">
  <header>
    <!-- 标题内容放这里 -->
  </header>
  <main>
    <!-- 主要内容放这里 -->
  </main>
  <footer>
    <!-- 底部内容放这里 -->
  </footer>
</div>
```

对于这种场景， `<slot>` 元素可以有一个特殊的 attribute `name`，用来给各个插槽分配唯一的 ID，以确定每一处要渲染的内容：

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

这类带 `name` 的插槽被称为具名插槽 (named slots)。没有提供 `name` 的 `<slot>` 出口会隐式地命名为“default”。

在父组件中使用 `<BaseLayout>` 时，我们需要一种方式将多个插槽内容传入到各自目标插槽的出口。此时就需要用到 **具名插槽** 了：

要为具名插槽传入内容，我们需要使用一个含 `v-slot` 指令的 `<template>` 元素，并将目标插槽的名字传给该指令

```html
<BaseLayout>
  <template v-slot:header>
    <!-- header 插槽的内容放这里 -->
  </template>
</BaseLayout>
```

`v-slot` 有对应的简写 `#`，因此 `<template v-slot:header>` 可以简写为 `<template #header>`。其意思就是“将这部分模板片段传入子组件的 header 插槽中”。

完整代码：

```html
<BaseLayout>
  <template #header>
    <h1>Here might be a page title</h1>
  </template>

  <template #default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>

  <template #footer>
    <p>Here's some contact info</p>
  </template>
</BaseLayout>
```

具体效果：

```html
<div class="container">
  <header>
    <h1>Here might be a page title</h1>
  </header>
  <main>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </main>
  <footer>
    <p>Here's some contact info</p>
  </footer>
</div>
```

### 3. 作用域插槽

#### （1） 渲染作用域

在介绍作用域插槽之前，我们必须先了解插槽的渲染作用域。

插槽内容可以访问到父组件的数据作用域，因为插槽内容本身是在父组件模板中定义的。举例来说：

```html
<span>{{ message }}</span>
<FancyButton>{{ message }}</FancyButton>
```

这里的两个 `{{ message }}` 插值表达式渲染的内容都是一样的。

但是，插槽内容 **无法访问** 子组件的数据。

Vue 模板中的表达式只能访问其定义时所处的作用域，这和 JavaScript 的词法作用域规则是一致的。

换言之：

> 父组件模板中的表达式只能访问父组件的作用域；子组件模板中的表达式只能访问子组件的作用域。

#### （2） 使用案例

前面提到过父组件中是无法访问到子组件作用域的，那在某些特殊场景，父组件需要用到子组件数据的时候该怎么办呢？也就是需要子组件在渲染的时候将数据提供给插槽。

我们也确实有办法这么做！可以像对组件传递 `props` 那样，向一个插槽的出口上传递 `attributes`：

```html
<!-- <MyComponent> 的模板 -->
<div>
  <slot :text="greetingMessage" :count="1"></slot>
</div>
```

当需要接收插槽 `props` 时，默认插槽和具名插槽的使用方式有一些小区别。下面我们将先展示默认插槽如何接受 props，通过子组件标签上的 `v-slot` 指令，直接接收到了一个插槽 props 对象：

```html
<MyComponent v-slot="slotProps">
  {{ slotProps.text }} {{ slotProps.count }}
</MyComponent>
```

你可以将作用域插槽类比为一个传入子组件的函数。子组件会将相应的 `props` 作为参数传给它：

```javascript
MyComponent({
  // 类比默认插槽，将其想成一个函数
  default: (slotProps) => {
    return `${slotProps.text} ${slotProps.count}`
  }
})

function MyComponent(slots) {
  const greetingMessage = 'hello'
  return `<div>${
    // 在插槽函数调用时传入 props
    slots.default({ text: greetingMessage, count: 1 })
  }</div>`
}
```

## 二、插槽的实现原理

插槽的实现其实可以分成两部分，一个是 **在父组件中准备好子组件插槽部分的模板内部**。一个在是 **在子组件渲染的时候，把这个模板内容填充到子组件对应的插槽中**。

但是问题来了，在父组件渲染时，是不能渲染子组件插槽部分的内容。所以我们需要先保存下来，等到子组件渲染的时候再取出来使用。

### 1. 父组件渲染时的处理

为了更方便的理解，我们先准备一个父组件模板：

```html
<layout>
  <template v-slot:header>
    <h1>{{ header }}</h1>
  </template>
  <template v-slot:default>
    <p>{{ main }}</p>
  </template>
  <template v-slot:footer>
    <p>{{ footer }}</p>
  </template>
</layout>
```

我们还是跟之前一样借助官方提供的 模板导出工具平台 查看它编译后的render函数：

```javascript
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock } from "vue"

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_layout = _resolveComponent("layout")

  return (_openBlock(), _createBlock(_component_layout, null, {
    header: _withCtx(() => [
      _createElementVNode("h1", null, _toDisplayString(_ctx.header), 1 /* TEXT */)
    ]),
    default: _withCtx(() => [
      _createElementVNode("p", null, _toDisplayString(_ctx.main), 1 /* TEXT */)
    ]),
    footer: _withCtx(() => [
      _createElementV
Node("p", null, _toDisplayString(_ctx.footer), 1 /* TEXT */)
    ]),
    _: 1 /* STABLE */
  }))
}
```

#### （1） createBlock

我们重点关注 `createBlock` 这个函数，第三个参数接收了一个对象。 `createBlock` 内部实际会调用 `createVNode` 函数，我们看它的实现：

```javascript
function createVNode(type,props = null,children = null) {
  if (props) {
    // 处理 props 相关逻辑，标准化 class 和 style
  }
  // 对 vnode 类型信息编码
    // 创建 vnode 对象
    const vnode = {
        type,
        props
        // 其他一些属性
    }
    // 标准化子节点，把不同数据类型的 children 转成数组或者文本类型
    normalizeChildren(vnode, children) return vnode
    }
```

其中， `normalizeChildren ` 就是用来处理传入的参数 `children`，我们来看一下它的实现：

```javascript
function normalizeChildren (vnode, children) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  }
  else if (isArray(children)) {
    type = 16 /* ARRAY_CHILDREN */
  }
  else if (typeof children === 'object') {
    // 标准化 slot 子节点
    if ((shapeFlag & 1 /* ELEMENT */ || shapeFlag & 64 /* TELEPORT */) && children.default) {
      // 处理 Teleport 的情况
      normalizeChildren(vnode, children.default())
      return
    }
    else {
      // 确定 vnode 子节点类型为 slot 子节点
      type = 32 /* SLOTS_CHILDREN */
      const slotFlag = children._
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance
      }
      else if (slotFlag === 3 /* FORWARDED */ && currentRenderingInstance) {
        // 处理类型为 FORWARDED 的情况
        if (currentRenderingInstance.vnode.patchFlag & 1024 /* DYNAMIC_SLOTS */) {
          children._ = 2 /* DYNAMIC */
          vnode.patchFlag |= 1024 /* DYNAMIC_SLOTS */
        }
        else {
          children._ = 1 /* STABLE */
        }
      }
    }
  }
  else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance }
    type = 32 /* SLOTS_CHILDREN */
  }
  else {
    children = String(children)
    if (shapeFlag & 64 /* TELEPORT */) {
      type = 16 /* ARRAY_CHILDREN */
      children = [createTextVNode(children)]
    }
    else {
      type = 8 /* TEXT_CHILDREN */
    }
  }
  vnode.children = children
  vnode.shapeFlag |= type
}
```

1.  往 `vnode.children` 属性上赋值传入的对象数据
2.  `vnode.shapeFlag` 会与 `slot` 子节点类型 `SLOTS_CHILDREN` 进行或运算，由于 `vnode` 本身的 `shapFlag ` 是 `STATEFUL_COMPONENT`，所以运算后的 ` shapeFlag` 是 ` SLOTS_CHILDREN | STATEFUL_COMPONENT`。
3.  不同的 ` shapeFlag` 会影响后续的 ` patch` 过程，我们知道在 ` patch` 中会根据 vnode 的 `type ` 和 `shapeFlag` 来决定后续的执行逻辑，我们来回顾一下它的实现：

#### （2）patch 函数

```javascript
const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => {
  // 如果存在新旧节点, 且新旧节点类型不同，则销毁旧节点
  if (n1 && !isSameVNodeType(n1, n2)) {
    anchor = getNextHostNode(n1)
    unmount(n1, parentComponent, parentSuspense, true)
    n1 = null
  }
  const { type, shapeFlag } = n2
  switch (type) {
    case Text:
      // 处理文本节点
      break
    case Comment:
      // 处理注释节点
      break
    case Static:
      // 处理静态节点
      break
    case Fragment:
      // 处理 Fragment 元素
      break
    default:
      if (shapeFlag & 1 /* ELEMENT */) {
        // 处理普通 DOM 元素
      }
      else if (shapeFlag & 6 /* COMPONENT */) {
        // 处理组件
        processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized)
      }
      else if (shapeFlag & 64 /* TELEPORT */) {
        // 处理 TELEPORT
      }
      else if (shapeFlag & 128 /* SUSPENSE */) {
        // 处理 SUSPENSE
      }
  }
}
```

这里由于 ` type` 是组件对象， `shapeFlag` 满足 `shapeFlag&6` 的情况，所以会走到 `processComponent` 的逻辑，递归去渲染子组件。

至此，带有子节点插槽的组件与普通的组件渲染并无区别，还是 **通过递归的方式去渲染子组件**。

渲染子组件又会执行组件的渲染逻辑了，这个流程我们在前面的章节已经分析过，其中有一个 `setupComponent` 的流程，我们来回顾一下它的实现：

#### （3）setupComponent 函数

```javascript
function setupComponent (instance, isSSR = false) {
  const { props, children, shapeFlag } = instance.vnode
  // 判断是否是一个有状态的组件
  const isStateful = shapeFlag & 4
  // 初始化 props
  initProps(instance, props, isStateful, isSSR)
  // 初始化插槽
  initSlots(instance, children)
  // 设置有状态的组件实例
  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined
  return setupResult
}
```

这里从 `vnode` 里面取出了 `props` 和 `children` 等等数据，然后在执行 `initSlots` 初始化 插槽的时候传入 `instance` 和 `children` 数据

#### （4）initSlots 函数

```javascript
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
    const type = children._
    if (type) {
      instance.slots = children
      def(children, '_', type)
    }
    else {
      normalizeObjectSlots(children, (instance.slots = {}))
    }
  }
  else {
    instance.slots = {}
    if (children) {
      normalizeVNodeSlots(instance, children)
    }
  }
  def(instance.slots, InternalObjectKey, 1)
}
```

`initSlots` 的实现逻辑很简单，这里的 `children` 就是前面传入的插槽对象数据，然后我们把它保留到 `instance.slots` 对象中，后续我们就可以从 ` instance.slots` 拿到插槽的数据了。

### 2. 子组件渲染时的处理

子组件在初始化过程中拿到父组件传入的插槽数据，现在就差最后一步，子组件将插槽数据渲染到页面上。

我们先来看子组件的模板

```html
<div class="layout">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

```javascript
import { renderSlot as _renderSlot, createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue"
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", { class: "layout" }, [
    _createVNode("header", null, [
      _renderSlot(_ctx.$slots, "header")
    ]),
    _createVNode("main", null, [
      _renderSlot(_ctx.$slots, "default")
    ]),
    _createVNode("footer", null, [
      _renderSlot(_ctx.$slots, "footer")
    ])
  ]))
}
```

#### （1） renderSlot 函数

通过编译后的代码我们可以看出，子组件的插槽部分的 `DOM ` 主要通过 `renderSlot` 方法渲染生成的，我们来看它的实现：

```javascript
function renderSlot(slots, name, props = {}, fallback) {
  let slot = slots[name];
  return (openBlock(),
    createBlock(Fragment, { key: props.key }, slot ? slot(props) : fallback ? fallback() : [], slots._ === 1 /* STABLE */
      ? 64 /* STABLE_FRAGMENT */
      : -2 /* BAIL */));
}
```

`renderSlot` 的实现非常简单，就是根据传入的 `name`，去 `slots` 中找到对应的 `slot` 插槽数据。 `slots` 也就是下面这个数据

```javascript
{
header: _withCtx(() => [
_createVNode("h1", null, _toDisplayString(_ctx.header), 1 /* TEXT */)
]),
default: _withCtx(() => [
_createVNode("p", null, _toDisplayString(_ctx.main), 1 /* TEXT */)
]),
footer: _withCtx(() => [
_createVNode("p", null, _toDisplayString(_ctx.footer), 1 /* TEXT */)
]),
_: 1
}
```

那么对于 `name` 为 `header`，它的值就是：

```javascript
_withCtx(() => [
  _createVNode("h1", null, _toDisplayString(_ctx.header), 1 /* TEXT */)
])
```

找到对应的slot插槽数据之后，会通过 `createBlock` 创建了 ` vnode` 节点

> 注意，它的类型是一个 Fragment，children 是执行 slot 插槽函数的返回值。

#### （2）withCtx

`slot` 函数其实是执行 ` _withCtx` 函数后的返回值，我们接着看 ` withCtx` 函数的实现：

```javascript
function withCtx(fn, ctx = currentRenderingInstance) {
  if (!ctx)
    return fn
  return function renderFnWithContext() {
    const owner = currentRenderingInstance
    setCurrentRenderingInstance(ctx)
    const res = fn.apply(null, arguments)
    setCurrentRenderingInstance(owner)
    return res
  }
}
```

1.  `withCtx` 的实现很简单，它支持传入一个函数 `fn` 和执行的上下文变量 ` ctx`，它的默认值是 `currentRenderingInstance`，也就是执行 `render` 函数时的当前组件实例。
2.  `withCtx` 会返回一个新的函数，这个函数执行的时候，会先保存当前渲染的组件实例 `owner`，然后把 `ctx ` 设置为当前渲染的组件实例，接着执行 ` f` n，执行完毕后，再把之前的 ` owner` 设置为当前组件实例。
3.  这么做就是为了保证在子组件中渲染具体插槽内容时，它的渲染组件实例是父组件实例，这样也就保证它的数据作用域也是父组件的了。

所以对于 ` header` 这个 ` slot`，它的 `slot` 函数的返回值是一个数组，如下：

```javascript
[
  _createVNode("h1", null, _toDisplayString(_ctx.header), 1 /* TEXT */)
]
```

我们回到 `renderSlot` 函数，最终插槽对应的 ` vnode` 渲染就变成了如下函数

```javascript
createBlock(Fragment, { key: props.key }, [_createVNode("h1", null, _toDisplayString(_ctx.header), 1 /* TEXT */)], 64 /* STABLE_FRAGMENT */)
```

我们知道， `createBlock ` 内部是会执行 ` createVNode` 创建 ` vnode`， `vnode` 创建完后，仍然会通过 `patch` 把 ` vnode` 挂载到页面上，那么对于插槽的渲染， `patch ` 过程又有什么不同呢？

#### （3）processFragment

注意这里我们的 ` vnode` 的 ` type` 是 `Fragement`，所以在执行 `patch` 的时候，会执行 `processFragment ` 逻辑，我们来看它的实现：

```javascript
const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
  const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''))
  const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''))
  let { patchFlag } = n2
  if (patchFlag > 0) {
    optimized = true
  }
  if (n1 == null) {
   //插入节点
    hostInsert(fragmentStartAnchor, container, anchor)
    hostInsert(fragmentEndAnchor, container, anchor)
    // 再挂载子节点
    mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, optimized)
  } else {
    // 更新节点
  }
}
```

我们只分析挂载子节点的过程，所以 n1 的值为 `null`，n2 就是我们前面创建的 `vnode ` 节点，它的 `children` 是一个数组。

`processFragment` 函数首先通过 `hostInsert` 在容器的前后插入两个空文本节点，然后在以尾文本节点作为参考锚点，通过 ` mountChildren` 把 `children` 挂载到 `container ` 容器中。

至此，我们就完成了子组件插槽内容的渲染。

## 常见考点

### **1. 插槽的基本概念和用法**

#### **问题：**

1. 什么是插槽？插槽的基本使用方式是怎样的？
2. 插槽和 `props` 的区别是什么？什么时候选择插槽而不是 `props`？
3. 如果父组件传递的内容为空，插槽会渲染什么？

#### **考察点：**

- 插槽的基础使用：<br>
  - 子组件使用 `<slot>` 定义插槽：<br>
```vue
<!-- 子组件 -->
<div>
  <slot></slot>
</div>
```
  - 父组件传递内容：<br>
```vue
<!-- 父组件 -->
<MyComponent>
  <p>插槽中的内容</p>
</MyComponent>
```
- 插槽的默认内容：<br>
  - 当父组件没有传递内容时，渲染插槽的默认内容：<br>
```vue
<slot>默认内容</slot>
```

---

### **2. 具名插槽**

#### **问题：**

1. 具名插槽如何使用？如何在一个组件中定义多个插槽？
2. 如果未传递具名插槽内容，会渲染什么？
3. 如何为默认插槽和具名插槽同时传递内容？

#### **考察点：**

- 定义具名插槽：<br>
```vue
<!-- 子组件 -->
<div>
  <slot name="header">默认头部内容</slot>
  <slot>默认主体内容</slot>
  <slot name="footer">默认底部内容</slot>
</div>
```
- 传递具名插槽内容：<br>
```vue
<!-- 父组件 -->
<MyComponent>
  <template #header>
    <h1>自定义头部</h1>
  </template>
  <template #footer>
    <p>自定义底部</p>
  </template>
</MyComponent>
```

---

### **3. 作用域插槽**

#### **问题：**

1. 什么是作用域插槽？作用域插槽的主要使用场景是什么？
2. 如何在父组件中访问子组件传递的数据？
3. `v-slot` 的语法糖是什么？

#### **考察点：**

- **作用域插槽定义和使用**：<br>
  - 子组件通过 `<slot>` 将数据暴露给父组件：<br>
```vue
<!-- 子组件 -->
<slot :data="someData"></slot>
```
  - 父组件通过作用域插槽接收数据：<br>
```vue
<!-- 父组件 -->
<MyComponent>
  <template #default="slotProps">
    <p>{{ slotProps.data }}</p>
  </template>
</MyComponent>
```
- **简化语法（v-slot）**：<br>
```vue
<MyComponent v-slot:default="slotProps">
  <p>{{ slotProps.data }}</p>
</MyComponent>
```

#### **深入考察：**

- **用途**：<br>
  - 动态渲染列表内容。
  - 通过插槽传递逻辑控制权。
- **性能问题**：<br>
  - 子组件频繁重新渲染时，是否影响插槽内容的更新。

---

### **4. 动态插槽**

#### **问题：**

1. 如何动态指定插槽名？动态插槽的使用场景有哪些？
2. 如果动态插槽未匹配到插槽名，插槽内容会如何处理？

#### **考察点：**

- 动态插槽的定义：<br>
```vue
<!-- 父组件 -->
<MyComponent>
  <template v-slot:[dynamicSlotName]>
    <p>动态插槽内容</p>
  </template>
</MyComponent>
```
- 使用场景：<br>
  - 动态生成不同的内容区域。
  - 在开发组件库时为插槽提供更多灵活性。

---

### **5. 插槽的使用限制与注意事项**

#### **问题：**

1. 如果子组件的插槽定义在 `v-if` 的分支中，插槽内容会如何表现？
2. 插槽内容是父组件的一部分，为什么会影响父组件的作用域？
3. 是否可以为插槽内容绑定动态事件？如果可以，如何实现？

#### **考察点：**

- 插槽内容始终属于父组件的作用域：<br>
```vue
<slot></slot>
<!-- 插槽内容的表达式，例如 {{ value }}，引用的是父组件的数据 -->
```
- 插槽与子组件的生命周期：<br>
  - 插槽内容在父组件和子组件生命周期的交互中可能造成意外的行为。
- 动态事件绑定：<br>
  - 使用 `$listeners` 或 `$attrs` 将事件转发到插槽内容。

---

### **6. Vue 3 插槽的新特性**

#### **问题：**

1. Vue 3 中插槽的主要改进是什么？
2. Vue 3 如何优化插槽的性能问题？

#### **考察点：**

- **默认插槽的优化**：<br>
  - Vue 3 中插槽内容按需渲染，而不是提前编译所有内容。
- **动态插槽改进**：<br>
  - 提供更高的灵活性，支持动态键值的插槽名。
- **插槽传递（Slot forwarding）**：<br>
  - 子组件可以将插槽内容传递给其嵌套的子组件。

---

### **7. 开放性问题**

#### **问题：**

1. 项目中你是如何使用插槽来提高组件的复用性和灵活性的？
2. 插槽与其他通信方式（如 props）相比，有哪些优劣势？

#### **考察点：**

- 候选人对插槽使用场景的理解。
- 是否能灵活运用插槽解决实际开发问题，如构建表格、布局、或动态内容。

---

### **总结**

插槽是 Vue 的重要功能，能够极大提高组件复用性和灵活性。考察插槽时，可以通过 **基本用法**、**具名插槽**、**作用域插槽**、**动态插槽** 及 **性能优化** 等多个层次测试候选人的理解和实际运用能力。同时开放性问题能够帮助评估候选人解决复杂场景问题的能力。
