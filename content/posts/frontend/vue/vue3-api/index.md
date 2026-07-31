+++
title = "Vue3 API"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-18T00:00:00+08:00'
draft = false
weight = 21
tags = ["面试", "前端", "Vue", "Vue3 API", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 📍前言

最近在一次理解`vue`项目的代码时，发现周一对好多`API`都不太熟悉。这间接导致的问题是，代码理解速度要比平常要慢很多。于是乎，赶忙把`vue API`的学习提上了日程。

在下面的文章中，将地板式地扫盲`vue3`文档中`API`模块的所有内容，融入周一的理解进行深入介绍。下面就来一起看看吧~🍬

## 一、🖇框架搭建

## 1、关于文档

首先附上官方文档的具体材料：[cn.vuejs.org/api/](https://cn.vuejs.org/api/)

## 2、VUE3 API整体盘点

在`vue3`的全新`API`中，有部分在`vue2`的基础上沿用了。还有另外一部分，是`vue3`所新增加的。我们先来看`vue3 API`文档主要包含哪些内容？

`vue3 API`主要包含以下六个部分：

- 全局API —— 全局会用到的API
- 组合式API —— vue3所拥有的组合式API
- 选项式API —— vue2所拥有的选项式API
- 内置内容 —— 指令、组件、特殊元素和特殊属性
- 单文件组件 —— 语法定义、
- 进阶API —— 渲染函数、服务端渲染、TS工具类型和自定义渲染

![](image-01.webp)

下面将依据上面提到的六大点内容，来进行相应的剖析和讲解。

## 二、🎨全局API

vue3的全局API包含两个部分：应用实例和通用API。那它们各自都有哪些内容呢？

## 1、应用实例

![](image-02.webp)

## 2、通用API

![](image-03.webp)

## 三、🚲组合式API

谈到`vue3` ，相信大家最为熟悉的就是 `composition API` 了，也就是 `组合式 API` 。那么，`vue3` 的 `组合式 API` 都给我们带来了什么呢？

## 1、setup

![](image-04.webp)

## 2、响应式：核心

![](image-05.webp)

## 3、响应式：工具函数

![](image-06.webp)

## 4、响应式：进阶

![](image-07.webp)

## 5、生命周期钩子

![](image-08.webp)

## 6、依赖注入

![](image-09.webp)

## 四、🌠选项式API

`选项式API` 即 `options API` 。可能有的小伙伴会觉得它在 `vue2` 项目下会更为常见一些。但在 `vue3` 项目中，也是有一些 `选项式API` 值得我们去挖掘的。那都有哪些内容呢，我们来一探究竟。

## 1、状态选项

![](image-10.webp)

## 2、渲染选项

![](image-11.webp)

## 3、生命周期选项

![](image-12.webp)

## 4、组合选项

![](image-13.webp)

## 5、其他杂项

![](image-14.webp)

## 6、组件实例

![](image-15.webp)

## 五、🏕内置内容

`vue3` 的内置内容包括**指令**、**组件**、**特殊元素element**和**特殊属性attributes**。如果要谈在什么场景下会用到内置内容，那周一可能觉得，在一般的 `vue` 项目开发中，基本都会用到**内置内容**。较为常见的是用v-if和v-else-if来判断什么时候显示某个组件，什么时候不显示某个组件。

还有像 `v-model` 、`v-on` 和 `v-for` 等指令，都是在 `vue` 项目中非常高频率使用的指令。那 `vue3` 的内置内容都还有哪些东西呢？请看下方介绍。

## 1、指令

![](image-16.webp)

## 2、组件

![](image-17.webp)

## 3、特殊元素

![](image-18.webp)

## 4、特殊属性Attributes

![](image-19.webp)

## 六、📸单文件组件

对于 `vue` 来说，相信大家都会非常熟悉它的组件化思想，似乎有一种理念是：万物皆可组件。那对于一个组件来说，我们都需要了解它的什么内容呢？比如，我们写的 `<template>` 是什么，用 `<script setup>` 和 `<script lang="ts">` 都分别是什么含义，`<style>` 用了 `scoped` 是什么意思，`:slotted` 插槽选择器又在什么情况下使用呢？我们一起来一探究竟。

## 1、SFC语法定义

![](image-20.webp)

## 2、单文件组件script setup

![](image-21.webp)

## 3、css功能

![](image-22.webp)

## 七、📈进阶API

上面我们了解了 `vue3` 的基础API，准确来说，上面的 `API` 可以解决实际工作中 `80%` 的问题。那下面，我们就再来看一些较为进阶的 `api` 操作。下面所涉及到的这些 `API` ，更多的是可以在**某些定制化的场景**下，做一些高阶的操作。比如：我们可以在一个 `headless` 组件里，用 `render` 和 `h()` 函数，来渲染自定义的页面。那 `进阶 API` 都还有哪些东西呢，来看下面的内容。

## 1、渲染函数

![](image-23.webp)

## 2、服务端渲染

![](image-24.webp)

## 3、TypeScript工具类型

![](image-25.webp)

## 4、自定义渲染

![](image-26.webp)

## 常见考点

### **1. Composition API**

#### **问题：**

1. 解释一下 Vue 3 中的 `setup()` 函数，它是什么时候被调用的？
2. `reactive()` 和 `ref()` 的区别是什么？
3. 如何在 Vue 3 中使用 `computed()` 和 `watch()`？
4. `provide` 和 `inject` 在 Composition API 中如何使用？
5. 什么是组合函数（Composables）？如何在项目中创建和使用它们？

#### **考察点：**

- **`setup()`**：Vue 3 中的核心函数，组件实例创建之前执行，用于定义响应式数据和逻辑。
- **`reactive()`** 和 **`ref()`**：分别用于创建响应式对象和基本类型的响应式引用。
- **`computed()`** 和 **`watch()`**：分别用于创建计算属性和观察响应式数据的变化。
- **`provide` 和 `inject`**：用于组件间的依赖注入，`provide` 在父组件中提供值，`inject` 在子组件中获取。
- **组合函数**：封装业务逻辑的函数，可以在多个组件中复用。

---

### **2. Vue 3 生命周期钩子**

#### **问题：**

1. Vue 3 的生命周期钩子有何变化？
2. 如何使用 `onMounted`、`onUpdated` 和 `onUnmounted`？
3. `beforeCreate` 和 `created` 在 Vue 3 中如何替代？

#### **考察点：**

- Vue 3 采用 Composition API 中的生命周期钩子函数，例如 `onMounted`、`onUpdated`、`onUnmounted`，取代了 Vue 2 的 `beforeCreate`、`created` 等选项。
- 生命周期钩子函数在 `setup()` 函数中使用。

---

### **3. 响应式系统**

#### **问题：**

1. Vue 3 是如何实现响应式的？与 Vue 2 有什么区别？
2. `reactive()` 和 `ref()` 的响应式机制有何不同？
3. Vue 3 如何实现性能优化，特别是在响应式的性能上？

#### **考察点：**

- **Vue 3 的响应式**：使用 Proxy 替代 Vue 2 的 `Object.defineProperty`，使得响应式更加高效。
- **响应式引用的差异**：`reactive()` 用于对象，`ref()` 用于基本数据类型。
- **性能优化**：Vue 3 对响应式系统进行了多方面的优化，例如通过 Proxy 提高了性能，并支持懒加载和更细粒度的依赖追踪。

---

### **4. `Teleport` 和 `Suspense`**

#### **问题：**

1. `Teleport` 是什么？它有什么实际应用场景？
2. `Suspense` 的作用是什么，如何与异步组件配合使用？

#### **考察点：**

- **`Teleport`**：允许将组件的 DOM 内容传送到 DOM 树的其他位置。常用于弹窗、模态框等 UI 元素的渲染。
- **`Suspense`**：用于处理异步组件加载的状态，允许在组件加载时展示占位内容。

---

### **5. 其他新增的 Vue 3 API**

#### **问题：**

1. `v-model` 在 Vue 3 中有什么变化？
2. `defineComponent` 和 `defineAsyncComponent` 有什么作用？
3. Vue 3 中的 `emits` 配置是如何工作的？

#### **考察点：**

- **`v-model`**：Vue 3 改进了 `v-model` 的 API，支持多个 `v-model` 的使用，并且可以通过 `modelValue` 和 `update:modelValue` 自定义事件。
- **`defineComponent`**：在 Vue 3 中，`defineComponent` 是一个类型推导函数，帮助 TypeScript 用户更好地推导组件类型。
- **`defineAsyncComponent`**：允许定义异步组件，支持 `Suspense` 和 `loading` 插槽来处理异步加载状态。
- **`emits`**：Vue 3 允许在组件选项中定义 `emits` 选项，用于明确声明组件可能触发的事件，有助于类型推导和更好的代码维护。

---

### **6. Vue Router 和 Vuex 适配**

#### **问题：**

1. Vue Router 4 和 Vuex 4 相比 Vue 2 版本有什么变化？
2. 如何在 Vue 3 中配置 Vue Router，支持嵌套路由和动态路由？
3. Vuex 4 是否和 Vue 2 版本兼容？如何在 Vue 3 中使用 Vuex 进行状态管理？

#### **考察点：**

- **Vue Router 4**：支持 Vue 3，提供更强大的路由功能，支持嵌套路由、路由守卫等功能。
- **Vuex 4**：与 Vue 3 兼容，采用 Composition API 的方式组织状态管理，支持模块化和插件。

---

### **7. TypeScript 在 Vue 3 中的使用**

#### **问题：**

1. Vue 3 如何支持 TypeScript？
2. Vue 3 中如何使用 `defineComponent` 来提升类型推导？
3. Vue 3 中如何在组件中使用强类型的 `props`、`data` 和 `emits`？

#### **考察点：**

- Vue 3 提供了更好的 TypeScript 支持，`defineComponent` 可以帮助组件类型推导，`ref()` 和 `reactive()` 等 API 都支持类型推导。
- **`props`**、**`data`** 和 **`emits`** 都可以在组件中指定类型，从而帮助静态检查和自动补全。

---

### **8. Composition API 与 Options API 结合使用**

#### **问题：**

1. 在 Vue 3 中，如何在同一个组件中结合使用 Composition API 和 Options API？
2. 你如何在项目中决定何时使用 Composition API，何时使用 Options API？
3. Composition API 和 Options API 在 Vue 3 中的协作如何影响组件的可维护性？

#### **考察点：**

- **协作使用**：Vue 3 支持在同一组件中同时使用 Options API 和 Composition API，可以根据业务需要灵活选择。
- **最佳实践**：对于简单的组件，Options API 更为直观；对于复杂的逻辑，Composition API 更加灵活和可复用。

---

### **9. 性能优化与懒加载**

#### **问题：**

1. Vue 3 中有哪些性能优化特性？
2. 如何在 Vue 3 中使用懒加载优化组件？
3. Vue 3 如何通过 `Suspense` 和 `defineAsyncComponent` 优化异步加载组件的性能？

#### **考察点：**

- **性能优化**：Vue 3 在响应式系统、虚拟 DOM 等方面进行了优化，提升了性能。
- **懒加载**：使用 `defineAsyncComponent` 和 `Suspense` 使得异步组件的加载更加高效，避免了在应用启动时加载所有组件。

---

### **10. 测试与调试**

#### **问题：**

1. Vue 3 中如何使用 Vue DevTools 调试组件？
2. 如何为使用 Composition API 的 Vue 3 组件编写单元测试？
3. Vue 3 是否有更好的错误提示和调试支持？

#### **考察点：**

- **Vue DevTools**：支持 Vue 3 的调试，可以查看组件的状态、事件和路由信息。
- **单元测试**：对于 Vue 3 组件，可以使用 `@vue/test-utils` 进行单元测试，特别是结合 Composition API 时，测试和调试的工具更为丰富。
