+++
title = "v-if/v-show"
date = '2024-10-04T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = false
weight = 10
tags = ["面试", "前端", "Vue", "v-if/v-show", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## v-show原理

```javascript
export const vShow: ObjectDirective<VShowElement> = {
  beforeMount(el, { value }, { transition }) {
    el._vod = el.style.display === 'none' ? '' : el.style.display
    if (transition && value) {
      transition.beforeEnter(el)
    } else {
      setDisplay(el, value)
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el)
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    // ...
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value)
  }
}
```

有`transition`就执行`transition`，没有`transition`就直接设置`display`。不管初始条件是什么，元素总是会被渲染。

## v-if原理

```javascript
export const transformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  (node, dir, context) => {
    return processIf(node, dir, context, (ifNode, branch, isRoot) => {
      // ...
      return () => {
        if (isRoot) {
          ifNode.codegenNode = createCodegenNodeForBranch(
            branch,
            key,
            context
          ) as IfConditionalExpression
        } else {
          // attach this branch's codegen node to the v-if root.
          const parentCondition = getParentCondition(ifNode.codegenNode!)
          parentCondition.alternate = createCodegenNodeForBranch(
            branch,
            key + ifNode.branches.length - 1,
            context
          )
        }
      }
    })
  }
)
```

返回一个`node`节点，`render`函数通过表达式的值来决定是否生成`DOM`

## 相同点

都能控住元素在页面上是否显示

```
<div v-show="isShow"></div>
<div v-if="isShow"></div>
```

## 不同点

- 控制手段不同：`v-show`是控制css的`display`是否为none来隐藏或展示，dom元素一直都是在的。而`v-if`显示隐藏是直接将整个dom元素添加或删除。
- 编译过程不同：`v-show`只是简单地基于css切换。而`v-if`的切换有一个局部编译/卸载的过程，切换过程中会销毁和重建内部的事件监听和子组件。
- 编译条件不同：`v-if`是真正的条件渲染，它会确保在切换过程中条件块内的事件监听器和子组件被销毁和重建，只有渲染条件为真时才渲染。
- `v-show`由false变为true的时候不会触发组件的生命周期。
- `v-if`由false变为true的时候，触发组件的`beforeCreate`、`create`、`beforeMount`、`mounted`钩子，由true变为false时触发组件的`beforeDestory`、`destoryed`方法。
- `v-if`有更高的切换消耗，`v-show`有更高的初始渲染消耗。

## 使用场景

1.  如果需要频繁地切换，则`v-show`较好。
2.  如果在运行时条件很少改变，则使用`v-if`较好。

## 常见考点

### **1. `v-if` 和 `v-show` 的基本用法**

#### **问题：**

1. `v-if` 和 `v-show` 有什么区别？它们是如何控制元素的显示和隐藏的？
2. 你通常会选择使用 `v-if` 还是 `v-show`，具体应用场景是什么？

#### **考察点：**

-  **`v-if` 的基本用法**：<br>
  - `v-if` 用来控制元素的渲染，只有条件为 `true` 时才会创建或销毁元素：<br>
```vue
<div v-if="isVisible">Hello, world!</div>
```
  - `v-if` 会在条件变化时触发 DOM 的销毁和重新渲染。
-  **`v-show` 的基本用法**：<br>
  - `v-show` 用来控制元素的显示与隐藏，通过设置元素的 `display` 样式：<br>
```vue
<div v-show="isVisible">Hello, world!</div>
```
  - `v-show` 会保留元素在 DOM 中，仅通过修改 `display` 样式来控制元素的可见性。

---

### **2. `v-if` 和 `v-show` 的性能差异**

#### **问题：**

1. `v-if` 和 `v-show` 在性能上有什么区别？
2. 在性能要求较高的场景下，你会选择使用 `v-if` 还是 `v-show`？

#### **考察点：**

-  **`v-if` 的性能开销**：<br>
  - `v-if` 会在条件变化时销毁并重新创建 DOM 元素。如果条件变化频繁，频繁的 DOM 操作可能会带来性能问题。
-  **`v-show` 的性能开销**：<br>
  - `v-show` 只会切换元素的 `display` 样式，因此无需重新渲染元素，性能开销较小。但如果元素内容复杂，使用 `v-show` 时，元素仍然存在于 DOM 中，可能会造成不必要的内存占用。
-  **选择依据**：<br>
  - 如果条件变化不频繁，且元素较复杂（例如绑定了复杂事件或子组件），使用 `v-show` 更合适。
  - 如果条件变化较频繁或元素简单（例如简单的文本或图标），使用 `v-if` 更合适，避免不必要的渲染。

---

### **3. 应用场景**

#### **问题：**

1. 在动态列表、分页组件或其他多次更新的场景中，应该如何选择使用 `v-if` 还是 `v-show`？
2. `v-if` 和 `v-show` 在如何处理过渡动画上有区别吗？

#### **考察点：**

-  **动态列表或分页场景**：<br>
  - 如果一个列表或分页项的显示与隐藏变化频繁，且列表项较简单，使用 `v-show` 会更高效。
  - 如果列表项的渲染涉及较为复杂的逻辑（例如数据请求、组件创建等），使用 `v-if` 会更适合，避免不必要的渲染。
-  **过渡动画**：<br>
  - `v-if` 和 `v-show` 都支持 Vue 的过渡动画。不同的是，`v-if` 会在元素进入和离开时触发过渡，而 `v-show` 仅会在元素显示与隐藏时触发过渡。
  - 对于复杂的过渡效果，如果需要元素完全消失并重新创建，`v-if` 更合适。对于简单的显隐效果，`v-show` 更加轻便。

---

### **4. 内部机制**

#### **问题：**

1. `v-if` 和 `v-show` 在 Vue 内部是如何实现的？它们的底层差异是什么？
2. `v-if` 和 `v-show` 会如何影响事件监听和生命周期钩子？

#### **考察点：**

-  **`v-if` 的实现**：<br>
  - `v-if` 会根据条件动态添加或移除元素及其子组件。当条件为 `true` 时，Vue 会创建该元素，并在条件为 `false` 时销毁它。这意味着它会完全消耗性能进行创建和销毁。
-  **`v-show` 的实现**：<br>
  - `v-show` 会通过 CSS 控制元素的 `display` 属性，元素一直存在于 DOM 中，只是通过修改样式来控制其显示与隐藏。
-  **生命周期钩子**：<br>
  - 使用 `v-if` 时，元素及其组件的生命周期钩子（如 `mounted` 和 `destroyed`）会在元素渲染和销毁时被触发。
  - 使用 `v-show` 时，元素的生命周期钩子不会被触发，元素始终存在于 DOM 中，只是其样式被修改。

---

### **5. 组合与嵌套**

#### **问题：**

1. 在同一个组件中，能同时使用 `v-if` 和 `v-show` 吗？这种做法有什么潜在问题？
2. 如果在一个父组件中同时使用 `v-if` 和 `v-show` 来控制不同的子组件，如何保证性能和可维护性？

#### **考察点：**

- **`v-if` 和 `v-show` 混合使用**：<br>
  - 在同一元素或同一组件上混合使用 `v-if` 和 `v-show` 是不建议的。由于它们控制元素显示的方式不同，可能会导致代码的复杂性和不易维护性。
- **父子组件的 `v-if` 和 `v-show` 使用**：<br>
  - 在父组件中控制子组件的显示隐藏时，可以根据场景选择 `v-if` 或 `v-show`。对于频繁变化的子组件，推荐使用 `v-show`；而对于不频繁显示的复杂子组件，推荐使用 `v-if`。

---

### **总结**

`v-if` 和 `v-show` 都用于控制元素的显示与隐藏，但它们的实现方式和性能差异决定了它们适用于不同的场景。在面试中，考察候选人对 **基本用法**、**性能差异**、**应用场景** 和 **内部机制** 的理解，能帮助评估其对 Vue 渲染机制的掌握程度。
