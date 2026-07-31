+++
title = "状态管理"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-17T00:00:00+08:00'
draft = false
weight = 19
tags = ["面试", "前端", "Vue", "状态管理", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
本知识点将以 `Pinia` 为例，介绍 Vue 中的状态管理。

## 前言

[Pinia](https://pinia.vuejs.org/zh/)简称小菠萝🍍，是一个专为Vue 3设计的现代化状态管理库，为`Vue 3`开发的，它提供了一种简单、可扩展和类型安全的方式来管理应用程序的状态。

与`Vue 2`中的Vuex相比，`Pinia`提供了更好的`TypeScrip`t支持，具有更好的类型定义和类型推断，可在编译时捕获错误，提供更高的代码可靠性和开发体验。它是专为`Vue 3`设计的，充分利用了`Vue 3`的新特性，如`Composition API`，以提供更直接、自然和灵活的状态管理体验。`Pinia`的核心概念是`Store`，它类似于`Vuex`中的模块，用于管理应用程序的状，可以将相关的状态和逻辑组合到单个`Store`中，使代码更清晰、结构更有组织性。除此之外海提供了许多有用的特性和功能，例如模块化组织、状态持久化、插件扩展等。

总的来说，`Pinia`是一个功能强大而灵活的状态管理解决方案，适用于各种规模的`Vue 3`应用程序。它提供了现代化的特性和工具，帮助我们更好地组织、管理和扩展应用程序的状态，同时提供了更好的类型安全和开发体验。

## 安装

运行安装命令

```bash
npm install pinia
```

在`main.ts`中引入

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

## 初始化Store

新建`stores`文件，用于存放所有的`store`，然后创建`index.ts`。

同过 `defineStore()` 定义一个`store`，它接受一个参数作为仓库名称，也就是`Id`。它返回一个函数，默认我们使用`user`开头的风格来接收。第二个参数为一个`Setup`函数或者`Option`对象。

```ts
import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
  // 其他配置...

})
```

## Option Store

这种方式熟悉`Vuex`的很了解，传入一个带有 `state`、`actions` 与 `getters` 属性的 `Option` 对象

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 100
    }
  },

  getters: {
    getName: (state) => state.name + '🐔你好帅'
  },

  actions:{
    getUserInfo {
      ...
    }
  }
})
```

在 `Option Store` 中：

- `state` 是 `store` 的数据 `data`
- `getters` 是 `store` 的计算属性 `computed`
- `actions` 则是方法 `methods`

## Setup Store

和[Vue3 Composition API](https://juejin.cn/post/7277836494298152994)组合式`API`里`setup`函数相似，传入一个函数，该函数定义了一些响应式属性和方法，并且返回一个带有我们想要暴露出去的属性和方法的对象。

```ts
export const userUsersStore = defineStore('users', () => {
  const name = ref('inkun')
  function getInkun() {
    getInkun.value + '🐔你好帅'
  }

  return { name, getInkun }
})
```

在 `Setup Store` 中：

- `ref()` 就是 `state` 属性
- `computed()` 就是 `getters`
- `function()` 就是 `actions`

## 使用Store

定义一个`store`后，在组件里引入这个`store`然后就行使用，不需要像`ref`一样使用`.value`，可以直接修改访问。

```ts
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
// 可以在组件中的任意位置访问 `store` 变量 ✨

const store = useCounterStore()
</script>
```

## State

`state`定义一个返回初始状态的函数，函数内返回一个对象，里面是需要定义的数据。

对于基础类型而言，[[../TypeScript|TypeScript]]可以自行推断出它们的数据类型，也可以接口，定义`state`函数返回值。

```ts
interface State {
  userList: UserInfo[]
  user: UserInfo | null
}

interface UserInfo {
  name: string
  age: number
}
export const userUsersStore = defineStore('users', {
  state: (): State => {
    return {
      userList: [],
      user: null
    }
  }
})
```

## 修改State

默认情况下可以直接通过`store`实例访问`state`，并且可以直接对其进行读写操作。

在`Vuex`中，如果要对`state`进行修改必须要定一个`mutation`，通过`mutation`进行提交，太过于繁琐。

```ts
const store = useStore()

store.count++
```

### 变更

除了用 `store.count++` 直接改变 `store`，还可以调用 `$patch` 方法。它允许你用一个 `state` 的补丁对象在同一时间更改多个属性：

```ts
store.$patch({
  count: store.count + 1,
  name: 'ff',
})
```

### 重置

可以通过调用 `store` 的 `$reset()` 方法将 `state` 重置为初始值。

```ts
const store = useStore()

store.$reset()
```

### 监听

类似于 `Vuex` 的 `subscribe` 方法，可以通过 `store` 的 `$subscribe()` 方法侦听 `state` 及其变化。

```ts
store.$subscribe((mutation, state) => {

  mutation.storeId // 'cart'

  console.log('state change', state)
  console.log('mutation', mutation.type)  // 'direct' | 'patch object' | 'patch function'
  console.log('mutation2', mutation.storeId) // 'users'
  // 只有 mutation.type === 'patch object'的情况下才可用
  // mutation.payload // 传递给 cartStore.$patch() 的补丁对象。
  console.log('mutation3', mutation.payload)
}, {
  detached: true
})
```

默认情况下，`state subscription` 会被绑定到添加它们的组件上，当该组件被卸载时，它们将被自动删除。如果想在组件卸载后依旧保留它们，将 { `detached: true }` 作为第二个参数，以将 `state subscription` 从当前组件中分离，此时组件卸载后，订阅器还可以使用。

## 结构State

在使用`state`时是不允许直接从`store`中结构数据，这样会导致数据失去响应式和`props`一样。

解构出来的数据是可以正常访问，当数据修改时是不会发生任何变化。

```ts
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const {current, name} = useCounterStore() // 数据不会发生变化

function change() {
  store.current++
}
</script>
```

解决方案是通过`storeToRefs`将数据重新变回响应式。

```ts
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const store= useCounterStore() // 数据不会发生变化
const {name, current} = storeToRefs(store)
function change() {
  store.current = 1
  name.value = 'ff'
}
</script>
```

## Getter

`getter`相当于计算属性，接收一个函数，函数参数为当前`store`里的`state`，也可以通过`this`去访问。

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 100
    }
  },
    getUserName(state) {
        return state.name + '🐔你好帅'
    },
    getName(): string {
        return this.name + '🐔你实在太帅'
    }

})
```

然后就可以通过`store`实例访问`getter`

```html
<template>
  {{ store.getUserName }}
  {{ store.getName }}
</template>

<script setup lang="ts">
import { userUsersStore } from './stores'

const store = userUsersStore()
</script>
```

## 访问其他Getter

通过`this`可以访问其他的`getter`

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 100
    }
  },
    getUserName(state) {
        return '大家好，我是' + state.name
    },
    getName(): string {
        return this.getUserName + '🐔你实在太帅'
    }

})
```

## 向Getter传递参数

`getter` 只是幕后的计算属性，所以不可以向它们传递任何参数。不过，可以从 `getter` 返回一个函数，该函数可以接受任意参数：

```ts
export const userUsersStore = defineStore('users', {
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
  },
})

<template>
  <p>User 2: {{ getUserById(2) }}</p>
</template>
```

## 访问其他Store里的Getter

将要访问的`store`引入并实例就可以

```ts
import { useOtherStore } from './other-store'

export const useStore = defineStore('main', {
  state: () => ({
    // ...
  }),
  getters: {
    otherGetter(state) {
      const otherStore = useOtherStore()
      return state.localData + otherStore.data
    },
  },
})
```

## action

`action`相当于`method`，和`Vuex`不同的是它异步同步都可以定义。

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 100
    }
  },
  actions:{
    async getUserInfo {
      ...
    }
  }
})
```

和`getter`一样，也可以通过`this`访问`state`数据

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 100
    }
  },
  actions:{
    randomizeCounter() {
      this.count = Math.round(100 * Math.random())
    },
  }
})
```

在模版上也是和其他一样通过`store`直接访问。

```html
<template>
  <button type="button" @click="getUserInfo">获取</button>
</template>
```

## 监听

可以通过`store.$onAction()`来监听 `action` 和它们的结果。第一个参数为回调函数，可以获取`action 的一些信息，第二个参数如果想在组件卸载后依旧保留它们，将` true`作为第二个参数传递给`action` 订阅器。

它返回一个函数，可以在必要的时候调用函数，此时会删除订阅器取消监听。

```ts
<script setup lang="ts">
import { userUsersStore } from './stores'

const store = userUsersStore()

const unsubscribe = store.$onAction(({ name, store, args, after, onError }) => {})

// 取消监听
unsubscribe()

</script>
```

## 数据持久化

和`Vuex`一样，都存在刷新后数据就会丢失，可以通过[pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)插件来解决。

通过在将数据存储到本地`storage`中，避免数据刷新丢失。储存位子有两个一个是`LocalStorage`和`SessionStorage`，具体看个人情况使用。

针对存储的位置，在使用的时候需要考虑项目是否真的要存储在某个位置，合理使用。不能说将用户头像、名称等信息存储在`SessionStorage`中，网站关闭后数据也还是会丢失。也不能说将`IM`聊天室消息、所有用户信息等数据存储在`LocalStorage`中，存储的大小也有限制，这是时候就要使用`IndexDB`、`web SQL`等方式。所以需要结合项目功能情况。合理选择存储，而不是一股脑的使用。

## 安装

```bash
npm i pinia-plugin-persistedstate
```

将插件添加到`pinia`实例上

```ts
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

## 使用

在创建`store`时，设置`persist: true`

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 1
    }
  },
  getters: {
    ...
  },
  actions: {
    ...
  },
  persist: true
})
```

设置完后可以在网页中看到数据存储在`localStorage`中

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32c34dabc1714f8e81b6446b4a9ae76e~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=911&h=759&s=76353&e=png&b=fefefe)

## 配置persist

`persist`可以接收一个对象

```ts
export const userUsersStore = defineStore('users', {
  state: () => {
    return {
      name: 'inkun',
      current: 1
    }
  },

  persist: {
    key: 'my-custom-key',
    storage: sessionStorage,
    paths: ['current'],
    serializer: {
      deserialize: parse,
      serialize: stringify,
    },
    beforeRestore: (ctx) => {
      console.log(`即将恢复 '${ctx.store.$id}'`)
    },
     afterRestore: (ctx) => {
      console.log(`刚刚恢复完 '${ctx.store.$id}'`)
    },
  }
})
```

- `key`： 用于引用 `storage` 中的数据，默认使用`store`中的`Id`
- `storage`：数据存储位置，默认`localStorage`，可以该为`sessionStorage`
- `paths`：指定`state`中哪些数据需要持久化
- `serializer`：指定持久化时所使用的序列化方法，以及恢复 `store` 时的反序列化方法。
- `beforeRestore`：该 `hook` 将在从 `storage` 中恢复数据之前触发，并且它可以访问整个 `PiniaPluginContext`，这可用于在恢复数据之前强制地执行特定的操作。
- `afterRestore`：该 `hook` 将在从 `storage` 中恢复数据之后触发，并且它可以访问整个 `PiniaPluginContext`，这可用于在恢复数据之后强制地执行特定的操作。

## 全局配置

使用全局配置，就不用单独在每个`store`里面做配置，在使用`pinia use`的时候就可以通过`createPersistedState`函数设置。

```ts
// main.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

pinia.use(
  createPersistedState({
    storage: sessionStorage,
    paths: ['current'],
  })
)
```

`createPersistedState`里的配置会将每个申明`persist: true`的`store`添加上配置，但是**每个单独`store`里的配置将会覆盖调全局声明中的对应项**。

全局配置支持一下属性：

- **storage**
- **serializer**
- **beforeRestore**
- **afterRestore**

## 启用所有 Store 默认持久化

该配置将会使所有 `store` 持久化存储，且必须配置 `persist: false` 显式禁用持久化。

```ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

pinia.use(
  createPersistedState({
    auto: true,
  })
)
```

## Store多个持久化配置

在一些特殊情况下，每个`store`中的数据存储的位置不一样，可以将`persist`设置为接收多个配置形式。

```ts
import { defineStore } from 'pinia'

defineStore('store', {
  state: () => ({
    toLocal: '',
    toSession: '',
    toNowhere: '',
  }),
  persist: [
    {
      paths: ['toLocal'],
      storage: localStorage,
    },
    {
      paths: ['toSession'],
      storage: sessionStorage,
    },
  ],
})
```

## 强制恢复数据

每个 `store` 都有 `$hydrate` 方法来手动触发数据恢复。默认情况下，调用此方法还将触发 `beforeRestore` 和 `afterRestore` 钩子。但是可以通过配置方法来避免这两个钩子触发。

```ts
import { defineStore } from 'pinia'

const useStore = defineStore('store', {
  state: () => ({
    someData: '你好 Pinia',
  }),
})
```

调用 `$hydrate` 方法：

```ts
const store = useStore()

store.$hydrate({ runHooks: false })
```

这将从 `storage` 中获取数据并用它替换当前的 `state`。并且在上面的示例中，配置了`runHooks: false`，所以 `beforeRestore` 和 `afterRestore` 钩子函数不会被触发。

## 强制持久化

除了通过`persist`方式设置持久化，每个`store`都有`$persist`方法来手动触发持久化，这会强制将 `store state` 保存在已配置的 `storage` 中。

```ts
import { defineStore } from 'pinia'

const useStore = defineStore('store', {
  state: () => ({
    someData: '你好 Pinia',
  }),
})

// App.vue
const store = useStore()

store.$persist()
```

## 常见考点

### **1. 基本概念**

#### **问题：**

1. 什么是状态管理？为什么需要状态管理工具？
2. Vue 的状态管理有哪些解决方案？

#### **考察点：**

-  **定义**：<br>
  - 状态管理是为了管理应用中的共享状态，特别是在组件间需要频繁通信或多级传递的情况下。
-  **状态管理的解决方案**：<br>
  - 简单项目：通过 `props` 和 `$emit` 实现父子通信。
  - 中等复杂项目：通过 **事件总线** 或 **依赖注入**（`provide` 和 `inject`）。
  - 大型项目：借助 Vuex 或 Pinia 实现全局状态管理。

---

### **2. 组件间通信**

#### **问题：**

1. Vue 父子组件如何通信？
2. 如何实现兄弟组件的通信？
3. 多层级组件间的数据传递有哪些方法？

#### **考察点：**

-  **父子通信**：<br>
  - 父传子：通过 `props`。
  - 子传父：通过 `$emit` 触发事件。
-  **兄弟组件通信**：<br>
  - 使用 **事件总线**。<br>
```javascript
// EventBus.js
import Vue from 'vue';
export const EventBus = new Vue();

// 在组件 A 中
EventBus.$emit('eventName', data);

// 在组件 B 中
EventBus.$on('eventName', callback);
```
-  **跨层级通信**：<br>
  - 使用 `provide` 和 `inject`：<br>
```javascript
// 父组件
provide('key', value);

// 子组件
inject('key');
```
-  **状态共享**：<br>
  - 利用 Vuex、Pinia 或全局变量。

---

### **3. Vuex（集中式状态管理）**

#### **问题：**

1. Vuex 的核心概念是什么？
2. Vuex 中 `state`、`getters`、`mutations`、`actions` 的作用是什么？
3. Vuex 的状态是如何注入组件的？

#### **考察点：**

-  **核心概念**：<br>
  - **单一状态树**：应用的所有状态都集中在一个对象中，便于追踪和管理。
  - **Vuex 的四个核心模块**：<br>
    - `state`：存储共享状态。
    - `getters`：计算属性，用于派生状态。
    - `mutations`：同步修改状态的方法。
    - `actions`：异步操作，通过提交 `mutations` 改变状态。
-  **代码示例**：<br>
```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  getters: {
    doubleCount: state => state.count * 2
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    }
  }
});
```
-  **状态注入组件**：<br>
  - 使用 `mapState`、`mapGetters` 辅助函数：<br>
```javascript
import { mapState, mapGetters } from 'vuex';
computed: {
  ...mapState(['count']),
  ...mapGetters(['doubleCount'])
}
```

---

### **4. Pinia（新一代状态管理工具）**

#### **问题：**

1. Pinia 与 Vuex 有什么区别？
2. Pinia 是如何定义和使用状态的？
3. 如何在 Pinia 中实现模块化管理？

#### **考察点：**

-  **Pinia 的特点**：<br>
  - 更简单的 API，基于 Composition API 实现。
  - 更好的开发体验（如类型推导、支持 SSR）。
  - 不再区分 `mutations` 和 `actions`，状态修改直接在 `actions` 中完成。
-  **代码示例**：<br>
```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: state => state.count * 2
  },
  actions: {
    increment() {
      this.count++;
    },
    asyncIncrement() {
      setTimeout(() => {
        this.increment();
      }, 1000);
    }
  }
});
```
-  **模块化管理**：<br>
  - 每个模块独立定义 `store`，通过 `useStore` 调用。

---

### **5. 状态持久化**

#### **问题：**

1. Vuex/Pinia 的状态刷新后如何保持？
2. 如何将 Vuex 的状态存储到 `localStorage` 或 `sessionStorage` 中？

#### **考察点：**

- **状态持久化方法**：<br>
  - 利用第三方库 `vuex-persistedstate`：<br>
```javascript
import createPersistedState from 'vuex-persistedstate';

const store = new Vuex.Store({
  plugins: [createPersistedState()]
});
```
  - 手动监听状态变化并保存：<br>
```javascript
store.subscribe((mutation, state) => {
  localStorage.setItem('state', JSON.stringify(state));
});
```

---

### **6. 状态管理中的性能问题**

#### **问题：**

1. Vuex 的状态管理可能会导致哪些性能问题？如何优化？
2. 组件依赖 Vuex 状态时如何避免不必要的更新？

#### **考察点：**

-  **性能问题**：<br>
  - 全局状态更新可能导致过多的组件重新渲染。
  - 状态树过大可能影响调试和开发效率。
-  **优化方法**：<br>
  - 拆分模块，按需加载状态。
  - 使用 `getters` 提取需要的部分状态。
  - 使用 `Vue.set` 确保响应性。

---

### **7. 状态管理的适用场景**

#### **问题：**

1. 在哪些情况下需要引入 Vuex 或 Pinia？哪些场景可以避免使用全局状态管理工具？
2. 如果项目非常简单，是否推荐直接使用 Vuex？

#### **考察点：**

-  **适用场景**：<br>
  - 当多个组件需要共享状态且层级较深时，引入 Vuex 或 Pinia。
  - 小型项目可以直接使用 `provide` 和 `inject`。
-  **避免滥用**：<br>
  - 不要将所有状态都放入 Vuex，应将仅需共享的部分存储到全局状态中。

---

### **8. 状态管理的替代方案**

#### **问题：**

1. 除了 Vuex 和 Pinia，还有哪些状态管理方案可以应用于 Vue 项目？
2. 使用第三方库（如 Redux）有什么优缺点？

#### **考察点：**

-  **其他方案**：<br>
  - 使用 `reactive` 或 `ref` 实现简单的状态共享。
  - 使用 RxJS 管理复杂的异步数据流。
-  **第三方库**：<br>
  - Redux：功能强大，但与 Vue 的风格不完全一致，可能增加学习成本。
