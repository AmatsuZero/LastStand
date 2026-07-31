+++
title = "watch与watchEffect"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-25T00:00:00+08:00'
draft = true
weight = 23
tags = ["面试", "前端", "Vue", "watch与watchEffect", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## Watch

### 基本用法

当我们需要在数据变化时执行一些“副作用”：如更改 DOM、执行异步操作，我们可以使用 `watch` 函数：

```xml
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('This is answer. ;-)')

// 侦听一个 ref
watch(question, async (newQuestion, oldQuestion) => {
  answer.value = 'Thinking...'
  const res = await fetch('https://...')
  answer.value = (await res.json()).answer
})
</script>

<template>
  <input v-model="question" />
  <p>{{ answer }}</p>
</template>
```

`watch()` 一共可以接受三个参数，侦听数据源、回调函数和配置选项。

### 侦听数据源

`watch` 的第一个参数可以是不同形式的“数据源”，它可以是：

- 一个 ref
- 一个计算属性
- 一个 getter 函数（有返回值的函数）
- 一个响应式对象
- 以上类型的值组成的数组

```javascript
const x = ref(1)
const y = ref(1)
const doubleX = computed(() => x.value * 2)
const obj = reactive({ count: 0 })

// 单个 ref
watch(x, (newValue) => {
  console.log(`x is ${newValue}`)
})

// 计算属性
watch(doubleX, (newValue) => {
  console.log(`doubleX is ${newValue}`)
})

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 响应式对象
watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：`newValue` 此处和 `oldValue` 是相等的
  // 因为它们是同一个对象！
})

// 以上类型的值组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})
```

注意，你不能直接侦听响应式对象的属性值，例如:

```javascript
const obj = reactive({ count: 0 })

// 错误，因为 watch() 得到的参数是一个 number
watch(obj.count, (count) => {
  console.log(`count is: ${count}`)
})
```

这里需要用一个返回该属性的 getter 函数：

```javascript
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`count is: ${count}`)
  }
)
```

### 回调函数

`watch` 的第二个参数是数据发生变化时执行的回调函数。

这个回调函数接受三个参数：新值、旧值，以及一个用于清理副作用的回调函数。该回调函数会在副作用下一次执行前调用，可以用来清除无效的副作用，如等待中的异步请求：

```js
const id = ref(1)
const data = ref(null)

watch(id, async (newValue, oldValue, onCleanup) => {
  const { response, cancel } = doAsyncWork(id.value)
  // `cancel` 会在 `id` 更改时调用
  // 以便取消之前未完成的请求
  onCleanup(cancel)
  data.value = await response.json()
})
```

`watch` 的返回值是一个用来停止该副作用的函数：

```js
const unwatch = watch(() => {})

// ...当该侦听器不再需要时
unwatch()
```

注意：使用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并且会在宿主组件卸载时自动停止。使用异步回调创建一个侦听器，则不会绑定到当前组件上，你必须手动停止它，以防内存泄漏。如下面这个例子：

```xml
<script setup>
import { watchEffect } from 'vue'

// 组件卸载会自动停止
watchEffect(() => {})

// 组件卸载不会停止！
setTimeout(() => {
  watchEffect(() => {})
}, 100)
</script>
```

### 配置选项

`watch` 的第三个参数是一个可选的对象，支持以下选项：

- `immediate`：在侦听器创建时立即触发回调。
- `deep`：深度遍历，以便在深层级变更时触发回调。
- `flush`：回调函数的触发时机。pre：默认，dom 更新前调用，post: dom 更新后调用，sync 同步调用。
- `onTrack / onTrigger`：用于调试的钩子。在依赖收集和回调函数触发时被调用。

### 深层侦听器

直接给 `watch()` 传入一个响应式对象，会默认创建一个深层侦听器 —— 所有嵌套的属性变更时都会被触发：

```scss
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：`newValue` 此处和 `oldValue` 是相等的
  // 因为它们是同一个对象！
})

obj.count++
```

相比之下，一个返回响应式对象的 getter 函数，只有在对象被替换时才会触发：

```php
const obj = reactive({
  someString: 'hello',
  someObject: { count: 0 }
})

watch(
  () => obj.someObject,
  () => {
    // 仅当 obj.someObject 被替换时触发
  }
)
```

当然，你也可以显式地加上 `deep` 选项，强制转成深层侦听器：

```javascript
watch(
  () => obj.someObject,
  (newValue, oldValue) => {
    // `newValue` 此处和 `oldValue` 是相等的
    // 除非 obj.someObject 被整个替换了
    console.log('deep', newValue.count, oldValue.count)
  },
  { deep: true }
)

obj.someObject.count++ // deep 1 1
```

深层侦听一个响应式对象或数组，新值和旧值是相等的。为了解决这个问题，我们可以对值进行深拷贝。

```javascript
watch(
  () => _.cloneDeep(obj.someObject),
  (newValue, oldValue) => {
    // 此时 `newValue` 此处和 `oldValue` 是不相等的
    console.log('deep', newValue.count, oldValue.count)
  },
  { deep: true }
)

obj.someObject.count++ // deep 1 0
```

注意：深层侦听需要遍历所有嵌套的属性，当数据结构庞大时，开销很大。所以我们要谨慎使用，并且留意性能。

## watchEffect

`watch()` 是懒执行的：当数据源发生变化时，才会执行回调。但在某些场景中，我们希望在创建侦听器时，立即执行一遍回调。当然使用 `immediate` 选项也能实现：

```csharp
const url = ref('https://...')
const data = ref(null)

async function fetchData() {
  const response = await fetch(url.value)
  data.value = await response.json()
}

// 立即执行一次，再侦听 url 变化
watch(url, fetchData, { immediate: true })
```

可以看到 `watch` 用到了三个参数，我们可以用 `watchEffect` 来简化上面的代码。`watchEffect` 会立即执行一遍回调函数，如果这时函数产生了副作用，Vue 会自动追踪副作用的依赖关系，自动分析出侦听数据源。上面的例子可以重写为：

```js
const url = ref('https://...')
const data = ref(null)

// 一个参数就可以搞定
watchEffect(async () => {
  const response = await fetch(url.value)
  data.value = await response.json()
})
```

`watchEffect` 接受两个参数，第一个参数是数据发生变化时执行的回调函数，用法和 `watch` 一样。第二个参数是一个可选的对象，支持 `flush` 和 `onTrack / onTrigger` 选项，功能和 `watch` 相同。

注意：`watchEffect` 仅会在其同步执行期间，才追踪依赖。使用异步回调时，只有在第一个 `await` 之前访问到的依赖才会被追踪。

## `watch` vs. `watchEffect`

`watch` 和 `watchEffect` 的主要功能是相同的，都能响应式地执行回调函数。它们的区别是追踪响应式依赖的方式不同：

- `watch` 只追踪明确定义的数据源，不会追踪在回调中访问到的东西；默认情况下，只有在数据源发生改变时才会触发回调；`watch` 可以访问侦听数据的新值和旧值。
- `watchEffect` 会初始化执行一次，在副作用发生期间追踪依赖，自动分析出侦听数据源；`watchEffect` 无法访问侦听数据的新值和旧值。

简单一句话，`watch` 功能更加强大，而 `watchEffect` 在某些场景下更加简洁。

## 常见考点

### **1. `watch` 的考察点**

#### **1.1 监听特定数据**

- **基本用法**：`watch` 用于观察一个特定的数据源（如 `ref`、`reactive` 或计算属性）的变化，并在数据变化时执行回调。  
  - **考察点**：候选人需要理解如何使用 `watch` 来观察数据的变化，并根据新旧值执行副作用。
  - **示例问题**：如何使用 `watch` 监听一个对象的某个属性变化并执行回调？在什么时候使用 `watch` 而不是 `watchEffect`？

#### **1.2 新旧值**

- **提供新旧值**：`watch` 在回调函数中会传入新值和旧值，帮助你处理数据变化。  
  - **考察点**：候选人需要理解如何获取 `watch` 的新旧值，以及如何根据这些值执行副作用。
  - **示例问题**：如何在 `watch` 回调中获取旧值和新值？如何基于这些值进行条件判断或操作？

#### **1.3 `immediate` 选项**

- **立即执行**：`watch` 可以通过 `immediate` 选项设置在观察开始时立即执行回调。  
  - **考察点**：候选人应该了解 `immediate` 的作用，以及何时需要立即执行回调而非等待数据变化。
  - **示例问题**：如何使用 `watch` 的 `immediate` 选项？什么时候会用到它？

#### **1.4 停止监听**

- **返回停止监听的函数**：`watch` 返回一个停止监听的函数，允许在需要时手动停止观察。  
  - **考察点**：候选人应该知道如何在组件卸载或其他特定场景下停止监听。
  - **示例问题**：如何在组件销毁时清理 `watch` 的副作用？

#### **1.5 深度监听**

- **深度监听**：`watch` 支持 `deep` 选项，可以监听对象的嵌套属性。  
  - **考察点**：候选人需要理解如何使用 `deep` 选项来深度监听对象变化，并可能需要讨论其性能开销。
  - **示例问题**：如何通过 `deep` 选项监听对象的嵌套变化？在什么情况下你会用到深度监听？

---

### **2. `watchEffect` 的考察点**

#### **2.1 自动追踪依赖**

- **自动依赖追踪**：`watchEffect` 会自动追踪内部使用的响应式数据，而不需要显式地声明要观察哪些数据。  
  - **考察点**：候选人需要理解 `watchEffect` 如何自动追踪依赖，并且无需手动指定监听哪些数据。
  - **示例问题**：`watchEffect` 是如何自动追踪依赖的？它与 `watch` 有何区别？

#### **2.2 惰性执行**

- **惰性执行**：`watchEffect` 在初次执行时会立即运行一次，然后在依赖发生变化时自动重新执行。  
  - **考察点**：候选人需要理解 `watchEffect` 的执行顺序及其惰性执行特性。
  - **示例问题**：`watchEffect` 的回调函数第一次会被执行吗？如果某个数据改变，回调函数是如何重新执行的？

#### **2.3 不提供新旧值**

- **没有新旧值**：与 `watch` 不同，`watchEffect` 不提供新旧值，回调函数只能通过内部的依赖自动更新。  
  - **考察点**：候选人需要理解为什么 `watchEffect` 不提供新旧值，以及如何在没有新旧值的情况下实现副作用。
  - **示例问题**：`watchEffect` 中无法获取新旧值，如何处理这种情况？

#### **2.4 对象依赖的自动清除**

- **自动清除副作用**：`watchEffect` 会在依赖发生变化时重新执行回调，并清理之前的副作用。  
  - **考察点**：候选人需要理解 `watchEffect` 如何自动清除和重新执行副作用，避免内存泄漏或无效的副作用执行。
  - **示例问题**：`watchEffect` 是如何清除之前的副作用并重新执行回调的？

#### **2.5 不需要显式传入依赖**

- **不需要手动指定依赖**：`watchEffect` 会自动追踪代码中访问的所有响应式数据。  
  - **考察点**：候选人需要理解 `watchEffect` 如何处理依赖自动追踪，以及与 `watch` 的区别。
  - **示例问题**：`watchEffect` 会自动追踪哪些数据变化？它与 `watch` 的依赖指定方式有何不同？

---

### **3. `watch` 和 `watchEffect` 的区别**

#### **3.1 触发机制**

- **`watch`**：当指定的响应式数据变化时，触发回调函数，并且提供新旧值。
- **`watchEffect`**：会自动追踪回调中的依赖，任何被访问到的响应式数据发生变化时，回调函数都会重新执行。

#### **3.2 依赖管理**

- **`watch`**：需要显式指定要观察的响应式数据或表达式。
- **`watchEffect`**：不需要显式指定依赖，它会自动追踪回调中访问的所有响应式数据。

#### **3.3 适用场景**

- **`watch`**：适用于需要监听特定数据变化，并需要新旧值进行处理的场景。
- **`watchEffect`**：适用于副作用逻辑简单，并且不需要新旧值的场景。

#### **3.4 性能**

- **`watch`**：能够对特定的数据变化进行精确控制，性能通常较优。
- **`watchEffect`**：由于自动依赖追踪，它会依赖于回调函数中所有访问的响应式数据，可能导致更多的不必要的副作用执行。

#### **示例问题**：

- 你会如何选择使用 `watch` 还是 `watchEffect` 来监听数据变化？分别在什么情况下更适合使用？
- `watchEffect` 如何自动追踪依赖？它与 `watch` 的区别是什么？
- `watch` 的 `immediate` 选项如何使用？有什么实际场景？

---

`watch` 和 `watchEffect` 在 Vue 3 中的主要区别在于它们如何管理和追踪依赖。`watch` 适用于需要精确监听特定数据变化并获取新旧值的场景，而 `watchEffect` 适合用来自动追踪所有依赖并在数据变化时自动执行副作用。面试时，通过提问这些考察点，面试官可以评估候选人对 Vue 响应式系统的理解、两者的区别以及它们的使用场景。
