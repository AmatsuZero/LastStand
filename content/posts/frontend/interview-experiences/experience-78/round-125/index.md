+++
title = "腾讯-2年社招-前端面试 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/78"
experienceId = 78
roundId = 125
roundOrder = 1
company = "腾讯"
date = "2025-09-07T02:17:29.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-78/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-78/round-126/index.md" >}}) →

本轮共 23 道题。答案默认折叠，便于先自行作答。

## 1. Vue 3.0 相比 Vue 2.0 有哪些改进？ {#question-subjective-d92deba5d64c}

### 题目要点

响应式系统升级、Composition API、性能优化、TypeScript支持、Fragment支持

<details>
<summary>参考答案</summary>

Vue 3.0 在架构层面进行了重大重构，采用了基于 Proxy 的响应式系统替代了 Object.defineProperty，这使得可以直接监听数组变化和动态属性添加。组合式 API 的引入提供了更好的逻辑复用和类型推导能力。在性能方面，通过 Tree-shaking 支持、更小的包体积、以及编译时优化显著提升了运行效率。

</details>

## 2. Composition API 解决了 Options API 的哪些问题？ {#question-subjective-0fc6cee72f3d}

### 题目要点

逻辑聚合、代码复用、类型推导、避免mixin问题

<details>
<summary>参考答案</summary>

Options API 在处理复杂组件时会出现逻辑分散的问题，相关的数据、方法、计算属性被强制分离到不同的选项中。Composition API 通过 setup 函数将相关逻辑聚合在一起，提高了代码的可维护性。同时解决了 mixin 命名冲突和来源不清晰的问题，提供了更好的 TypeScript 类型推导支持。

</details>

## 3. Proxy 相比 Object.defineProperty 在响应式上有何优势？ {#question-subjective-3c46deb606e6}

### 题目要点

对象级别监听、动态属性支持、数组监听、更多拦截操作

<details>
<summary>参考答案</summary>

Proxy 可以直接监听整个对象而不需要遍历每个属性，支持动态属性的添加和删除监听。对于数组操作，Proxy 可以直接监听数组的变化，而 Object.defineProperty 需要重写数组方法。Proxy 还支持更多的拦截操作，如 has、deleteProperty 等，提供了更完整的响应式能力。

</details>

## 4. nextTick 如何保证 DOM 更新后执行回调？ {#question-subjective-8d6eee18b772}

### 题目要点

事件循环、微任务队列、异步更新、降级策略

<details>
<summary>参考答案</summary>

nextTick 利用了浏览器的事件循环机制，将回调函数推入微任务队列。Vue 的更新策略是异步的，当数据变化时会将更新任务推入队列，在下一个事件循环中批量执行。nextTick 确保回调在 DOM 更新完成后执行，内部优先使用 Promise.then，降级到 MutationObserver、setImmediate，最后是 setTimeout。

</details>

## 5. 如何手动触发依赖收集（track）和更新触发（trigger）？ {#question-subjective-b503f2568f9c}

### 题目要点

依赖收集机制、副作用函数、getter/setter、手动控制响应式

<details>
<summary>参考答案</summary>

在 Vue 3 的响应式系统中，track 函数负责收集当前正在执行的副作用函数作为依赖，通常在 getter 中调用。trigger 函数负责触发相关依赖的重新执行，在 setter 中调用。可以通过 @vue/reactivity 包中的 track 和 trigger 函数手动控制依赖收集和触发过程，这在自定义响应式逻辑时非常有用。

</details>

## 6. 用 Vuex 实现一个输入框的双向绑定 {#question-subjective-34325a1b99b6}

### 题目要点

计算属性双向绑定、mutation提交、单向数据流

<details>
<summary>参考答案</summary>

通过计算属性的 getter 和 setter 实现双向绑定，getter 返回 store 中的状态，setter 提交 mutation 更新状态。这种方式保持了 Vuex 的单向数据流原则，同时实现了表单控件的双向绑定效果。

```javascript
computed: {
  inputValue: {
    get() {
      return this.$store.state.inputValue
    },
    set(value) {
      this.$store.commit('updateInput', value)
    }
  }
}

```

</details>

## 7. Vue 组件间通信有哪些方式？ {#question-a88670ef-a898-4676-a272-cabf8bdfade7}

> 题库原题：[Vue组件间通信方式都有哪些?](https://fe.ecool.fun/topic/a88670ef-a898-4676-a272-cabf8bdfade7)

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

## 8. Vue.use 如何注册插件 {#question-ef9dbd6c-d3c1-4087-8431-fafa2a68a74c}

> 题库原题：[Vue.use 如何注册插件](https://fe.ecool.fun/topic/ef9dbd6c-d3c1-4087-8431-fafa2a68a74c)

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

## 9. JavaScript 调用栈的工作原理 {#question-subjective-59e16ff12547}

### 题目要点

LIFO结构、执行上下文、栈溢出、异步处理

<details>
<summary>参考答案</summary>

JavaScript 引擎使用调用栈来跟踪函数的执行上下文，采用后进先出（LIFO）的数据结构。当函数被调用时，其执行上下文被推入栈顶，函数执行完毕后从栈中弹出。调用栈的大小有限制，递归过深会导致栈溢出错误。异步操作不会阻塞调用栈，而是通过事件循环机制处理。

</details>

## 10. 实现一个深拷贝函数 {#question-a6a869f2-a5f5-451e-8f1d-eb25cea4750f}

> 题库原题：[实现深拷贝](https://fe.ecool.fun/topic/a6a869f2-a5f5-451e-8f1d-eb25cea4750f)

### 题目要点

核心考查：实现一个深拷贝函数的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
const cloneDeep1 = (target, hash = new WeakMap()) => {
  // 对于传入参数处理
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  // 哈希表中存在直接返回
  if (hash.has(target)) return hash.get(target);

  const cloneTarget = Array.isArray(target) ? [] : {};
  hash.set(target, cloneTarget);

  // 针对Symbol属性
  const symKeys = Object.getOwnPropertySymbols(target);
  if (symKeys.length) {
    symKeys.forEach(symKey => {
      if (typeof target[symKey] === 'object' && target[symKey] !== null) {
        cloneTarget[symKey] = cloneDeep1(target[symKey]);
      } else {
        cloneTarget[symKey] = target[symKey];
      }
    })
  }

  for (const i in target) {
    if (Object.prototype.hasOwnProperty.call(target, i)) {
      cloneTarget[i] =
        typeof target[i] === 'object' && target[i] !== null
        ? cloneDeep1(target[i], hash)
        : target[i];
    }
  }
  return cloneTarget;
}

```

</details>

## 11. 实现 new 的功能 {#question-cbbef7f1-c87e-4c3c-9f0a-c8c2f0683075}

> 题库原题：[说说new操作符具体干了什么？](https://fe.ecool.fun/topic/cbbef7f1-c87e-4c3c-9f0a-c8c2f0683075)

### 题目要点

执行了以下几步操作：

1. **创建一个空对象**：首先，`new`操作符会创建一个空的简单JavaScript对象（即`{}`）。

2. **设置原型**：然后，这个新创建的对象的内部`[[Prototype]]`（也就是`__proto__`，但在现代JavaScript中更推荐使用`Object.getPrototypeOf()`来获取）会被赋值为构造函数的`prototype`属性。这一步使得新创建的对象能够继承构造函数原型链上的属性和方法。

3. **调用构造函数**：接下来，构造函数会被调用，且新创建的对象会被作为`this`的上下文（即构造函数内部的`this`指向这个新对象）。同时，如果构造函数返回一个对象，那么这个返回的对象会被用作`new`表达式的结果；如果构造函数没有返回对象（即返回`undefined`或`null`），则`new`表达式的结果就是步骤1中创建的那个对象。

4. **返回对象**：最后，如果构造函数没有显式返回一个对象，则返回步骤1中创建并被步骤2和步骤3处理过的对象。

<details>
<summary>参考答案</summary>

## 一、是什么

在`JavaScript`中，`new`操作符用于创建一个给定构造函数的实例对象

例子

```js
function Person(name, age){
    this.name = name;
    this.age = age;
}
Person.prototype.sayName = function () {
    console.log(this.name)
}
const person1 = new Person('Tom', 20)
console.log(person1)  // Person {name: "Tom", age: 20}
person1.sayName() // 'Tom'
```

从上面可以看到：

- `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数中的属性
- `new` 通过构造函数 `Person` 创建出来的实例可以访问到构造函数原型链中的属性（即实例与构造函数通过原型链连接了起来）

现在在构建函数中显式加上返回值，并且这个返回值是一个原始类型

```js
function Test(name) {
  this.name = name
  return 1
}
const t = new Test('xxx')
console.log(t.name) // 'xxx'
```

可以发现，构造函数中返回一个原始值，然而这个返回值并没有作用

下面在构造函数中返回一个对象

```js
function Test(name) {
  this.name = name
  console.log(this) // Test { name: 'xxx' }
  return { age: 26 }
}
const t = new Test('xxx')
console.log(t) // { age: 26 }
console.log(t.name) // 'undefined'
```

从上面可以发现，构造函数如果返回值为一个对象，那么这个返回值会被正常使用

## 二、流程

从上面介绍中，我们可以看到`new`关键字主要做了以下的工作：

- 创建一个新的对象`obj`
- 将对象与构建函数通过原型链连接起来
- 将构建函数中的`this`绑定到新建的对象`obj`上

- 根据构建函数返回类型作判断，如果是原始值则被忽略，如果是返回对象，需要正常处理

举个例子：

```js
function Person(name, age){
    this.name = name;
    this.age = age;
}
const person1 = new Person('Tom', 20)
console.log(person1)  // Person {name: "Tom", age: 20}
person1.sayName() // 'Tom'
```

流程图如下：

 ![](https://static.ecool.fun//article/7004e072-f843-4db5-9501-a2311d81885a.png)

## 三、手写new操作符

现在我们已经清楚地掌握了`new`的执行过程

那么我们就动手来实现一下`new`

```js
function mynew(Func, ...args) {
    // 1.创建一个新对象
    const obj = {}
    // 2.新对象原型指向构造函数原型对象
    obj.__proto__ = Func.prototype
    // 3.将构建函数的this指向新对象
    let result = Func.apply(obj, args)
    // 4.根据返回值判断
    return result instanceof Object ? result : obj
}
```

测试一下

```js
function mynew(func, ...args) {
    const obj = {}
    obj.__proto__ = func.prototype
    let result = func.apply(obj, args)
    return result instanceof Object ? result : obj
}
function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.say = function () {
    console.log(this.name)
}

let p = mynew(Person, "huihui", 123)
console.log(p) // Person {name: "huihui", age: 123}
p.say() // huihui
```

可以发现，代码虽然很短，但是能够模拟实现`new`

</details>

## 12. 箭头函数和普通函数的 this 绑定有何不同 {#question-33363940-179b-4ae3-9cd3-7bf0a5619df9}

> 题库原题：[箭头函数的 this 指向哪⾥？](https://fe.ecool.fun/topic/33363940-179b-4ae3-9cd3-7bf0a5619df9)

### 题目要点

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

<details>
<summary>参考答案</summary>

箭头函数不同于传统JavaScript中的函数，箭头函数并没有属于⾃⼰的this，它所谓的this是捕获其所在上下⽂的 this 值，作为⾃⼰的 this 值，并且由于没有属于⾃⼰的this，所以是不会被new调⽤的，这个所谓的this也不会被改变。

可以⽤Babel理解⼀下箭头函数:

```js
// ES6
const obj = {
  getArrow() {
    return () => {
      console.log(this === obj);
    };
  }
}
```

转化后：

```js
// ES5，由 Babel 转译
var obj = {
   getArrow: function getArrow() {
     var _this = this;
     return function () {
        console.log(_this === obj);
     };
   }
};
```

</details>

## 13. 为何箭头函数不能用作构造函数 {#question-82939890-c1de-45f8-b27d-b2675d58763e}

> 题库原题：[箭头函数为何不能作为构造函数使用？](https://fe.ecool.fun/topic/82939890-c1de-45f8-b27d-b2675d58763e)

### 题目要点

在箭头函数中，`this`指向的是定义时所在的对象，而不是使用时所在的对象。换句话说，**箭头函数没有自己的this，而是继承父作用域中的this**。

<details>
<summary>参考答案</summary>

在箭头函数中，`this`指向的是定义时所在的对象，而不是使用时所在的对象。换句话说，**箭头函数没有自己的this，而是继承父作用域中的this**。

看个例子:

```javascript
var person = {
  name:'张三',
  age:18,
  getName:function(){
     console.log('我的名字是：'+this.name)
  },
  getAge:()=>{
     console.log('我的年龄是：'+this.age)
  }
}

person.getName() // 我的名字是张三
person.getAge()  // 我的年龄是undefined

```

`person.getName()`中`this`指向函数的调用者，也就是`person`实例，因此`this.name = "张三"`。

`getAge()`通过箭头函数定义，而箭头函数是没有自己的`this`，会继承父作用域的`this`，因此`person.getAge()`执行时，此时的作用域指向`window`，而`window`没有定义`age`属性，所有报`undefined`。

从例子可以得出：**对象中定义的函数使用箭头函数是不合适的**。

**先解答下标题问题，为啥箭头函数不能作为构造函数？**

```javascript
// 构造函数生成实例的过程
function Person(name,age){
  this.name = name
  this.age = age
}
var p = new Person('张三',18)

//new关键字生成实例过程如下
// 1. 创建空对象p
var p = {}
// 2. 将空对象p的原型链指向构造器Person的原型
p.__proto__ = Person.prototype
// 3. 将Person()函数中的this指向p
// 若此处Person为箭头函数，而没有自己的this，call()函数无法改变箭头函数的指向，也就无法指向p。
Person.call(p)

```

构造函数是通过new关键字来生成对象实例，生成对象实例的过程也是通过构造函数给实例绑定this的过程，而箭头函数没有自己的this。创建对象过程，`new` 首先会创建一个空对象，并将这个空对象的`__proto__`指向构造函数的`prototype`，从而继承原型上的方法，但是箭头函数没有`prototype`。因此不能使用箭头作为构造函数，也就不能通过new操作符来调用箭头函数。

</details>

## 14. Set 和 Map 解决了哪些循环引用对象的问题 {#question-subjective-97a85669b007}

### 题目要点

弱引用特性、避免内存泄漏、记录访问状态、递归终止条件

<details>
<summary>参考答案</summary>

Set 和 Map 可以存储对象引用而不会造成内存泄漏，WeakSet 和 WeakMap 更是提供了弱引用特性。在处理循环引用时，可以使用 Set 或 Map 记录已访问的对象，避免无限递归。这在深拷贝、序列化等场景中特别有用。

</details>

## 15. Vue Router 的 history 模式如何实现无刷新跳转 {#question-subjective-b6da30f77854}

### 题目要点

pushState API、popstate事件、服务器配置、前端路由接管

<details>
<summary>参考答案</summary>

history 模式利用 HTML5 的 pushState 和 replaceState API 改变 URL 而不触发页面刷新，同时监听 popstate 事件处理浏览器前进后退。服务器需要配置将所有路由都指向 index.html，由前端路由接管页面渲染。这种方式提供了更友好的 URL 格式。

</details>

## 16. Promise 如何解决回调地狱（Callback Hell） {#question-subjective-79957c25b13c}

### 题目要点

链式调用、线性结构、async/await、统一错误处理

<details>
<summary>参考答案</summary>

Promise 通过链式调用将嵌套的回调函数转换为线性的 then 调用，每个 then 返回新的 Promise 对象。配合 async/await 语法可以让异步代码看起来像同步代码，大大提高了代码的可读性和可维护性。错误处理也更加统一，可以通过 catch 集中处理。

</details>

## 17. 如果没有 Promise，如何用 setTimeout 模拟 setInterval？ {#question-subjective-777fdf1c371d}

### 题目要点

递归调用、避免任务堆积、间隔准确性、清理机制

<details>
<summary>参考答案</summary>

通过递归调用 setTimeout 实现定时重复执行，这种方式可以避免 setInterval 可能出现的任务堆积问题。每次执行完任务后再设置下一次的定时器，确保任务执行间隔的准确性。

```javascript
function mySetInterval(callback, delay) {
  let timer = null
  function interval() {
    callback()
    timer = setTimeout(interval, delay)
  }
  timer = setTimeout(interval, delay)
  return () => clearTimeout(timer)
}
```

</details>

## 18. Vite 和 Webpack 的区别 {#question-dc78e2f9-568a-445d-988c-594092179848}

> 题库原题：[聊聊 vite 和 webpack 的区别](https://fe.ecool.fun/topic/dc78e2f9-568a-445d-988c-594092179848)

### 题目要点

- **Webpack**：成熟的模块打包工具，功能强大但配置复杂，适合需要高度定制和复杂构建需求的项目。
- **Vite**：现代化的开发工具，提供快速的开发体验和优化的生产构建，适合追求开发效率和现代化特性的项目。

选择 Vite 还是 Webpack 取决于项目的需求和开发团队的偏好。如果重点是开发体验和快速反馈，Vite 是一个很好的选择。如果需要高度定制化和广泛的插件支持，Webpack 可能更适合。

<details>
<summary>参考答案</summary>

Vite 和 Webpack 都是前端打包工具，它们的作用类似，但实现方式和使用方法有所不同。以下是它们之间的一些区别：

1. **构建速度**：Vite 的构建速度比 Webpack 更快，因为 Vite 在开发环境下使用了浏览器原生的 ES 模块加载，而不是像 Webpack 一样使用打包后的文件进行模块加载。在 Vite 中，每个模块都可以独立地进行编译和缓存，这意味着它只需要重新编译修改过的模块，而不是整个应用程序。这使得 Vite 开发起来更加高效。

2. **配置复杂度**：Vite 的配置相对更简单，因为它无需进行大量的配置，只需指定一些基本的选项就可以开始开发。Webpack 的配置更加复杂，需要针对具体项目进行不同的配置，且需要理解各种插件、Loader 等概念。

3. **生态环境**：Webpack 的生态环境更加成熟，在社区中拥有广泛的支持和丰富的插件库。而 Vite 尚处于发展阶段，尽管其已经获得了很多关注，但其生态系统仍然不太完善。

4. **功能特性**：Webpack 是一个功能更加全面的打包工具，支持各种 Loader 和插件，可以处理多种类型的文件和资源。而 Vite 的设计初衷是专注于开发环境下的快速构建，因此其对一些高级特性的支持相对较少。

综上所述，Vite 更适合用于开发环境下的快速构建，而 Webpack 则更适合用于生产环境下的复杂应用程序的打包处理。选择使用哪种工具需要根据具体项目需求进行评估。

</details>

## 19. Webpack 有哪些常见的性能优化手段 {#question-4cf47e01-92e5-4e04-ab83-f4eca1953e23}

> 题库原题：[如何提高webpack的构建速度？](https://fe.ecool.fun/topic/4cf47e01-92e5-4e04-ab83-f4eca1953e23)

### 题目要点

* Webpack 构建慢的根源在于**模块数量多、体积大、处理流程长**；
* 提升构建速度需从**缓存、并发、范围控制、按需加载**四个方向优化；
* 区分开发和生产环境进行有针对性的配置调整；
* 借助生态工具（如 thread-loader、BundleAnalyzer、TerserPlugin）提升自动化与调试效率；
* 保持依赖精简、代码可维护，有助于从源头优化构建时间。

<details>
<summary>参考答案</summary>

Webpack 的构建过程本质上包括**模块解析、加载、编译、优化、输出**等多个阶段，因此优化手段也需从多个维度入手。

以下从**开发模式（`webpack-dev-server`）和生产模式（`webpack build`）两个阶段**，分别分析提高构建速度的关键策略。

---

## 一、通用优化策略

### 1. **合理使用缓存**

* **开启持久化缓存**（Webpack 5）：

  ```js
  module.exports = {
    cache: {
      type: 'filesystem',
    },
  };
  ```

  能将模块编译结果缓存到磁盘，避免重复编译。

* **`babel-loader` 开启缓存**：

  ```js
  {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true
    }
  }
  ```

### 2. **减少模块解析范围**

* **使用 `include` / `exclude` 精准匹配**

  ```js
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: path.resolve(__dirname, 'src'),
    exclude: /node_modules/
  }
  ```

* **配置 `resolve.extensions` 精简后缀解析**

  ```js
  resolve: {
    extensions: ['.js', '.ts']
  }
  ```

* **配置 `resolve.alias` 减少深层查找**

  ```js
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
  ```

### 3. **并行/多进程处理**

* **使用 `thread-loader`** 处理 JS/TS 转译等耗时任务：

  ```js
  {
    test: /\.js$/,
    use: ['thread-loader', 'babel-loader']
  }
  ```

* **使用 `terser-webpack-plugin` 的并行压缩**：
  Webpack 5 中默认已启用，手动配置时可设置：

  ```js
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ parallel: true })]
  }
  ```

---

## 二、开发阶段优化（提升热更新和增量编译速度）

### 1. **使用 `webpack-dev-server` + HMR**

* 启用热模块替换（HMR），只更新变更部分，提高效率；
* 配合 React Fast Refresh、Vue HMR 插件，提升开发体验。

### 2. **开启 `source-map` 优化模式**

* 开发阶段推荐：

  ```js
  devtool: 'cheap-module-source-map'
  ```

  比 `eval-source-map` 更快，调试体验仍可接受。

### 3. **使用模块缓存机制**

* Webpack 会将未变更模块缓存，如果未配置 `module.id`，建议开启：

  ```js
  optimization: {
    moduleIds: 'deterministic'
  }
  ```

---

## 三、生产阶段优化（压缩构建产物）

### 1. **Tree Shaking（摇树优化）**

* 确保使用 `ESModule` 规范（`import`/`export`），否则无法移除无用代码；
* 设置 `sideEffects: false`，移除副作用模块（需谨慎）：

  ```json
  // package.json
  {
    "sideEffects": false
  }
  ```

### 2. **合理分包 + 动态引入**

* 利用 `SplitChunksPlugin` 拆分公共依赖和第三方库，减少重复打包：

  ```js
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
  ```

* 对大型路由模块按需加载，减少初始构建体积。

### 3. **缩小构建目标范围**

* 使用 `IgnorePlugin` 忽略无用语言包等：

  ```js
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  });
  ```

* 精简 polyfill，例如使用 `core-js-pure` 或按需引入。

---

## 四、其他技巧与工具

### 1. **使用 `webpack-bundle-analyzer` 分析体积**

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
```

定位冗余依赖和重复打包问题。

### 2. **使用轻量替代库**

* 用 `dayjs` 替代 `moment`；
* 用 `lodash-es` + Tree Shaking 替代整个 lodash。

### 3. **升级到 Webpack 5**

Webpack 5 提供了更好的缓存机制、更快的构建性能和内置优化能力。

</details>

## 20. Tree Shaking 原理 {#question-402c1f77-c556-4a1b-984f-07004305fba2}

> 题库原题：[webpack treeShaking机制的原理是什么？](https://fe.ecool.fun/topic/402c1f77-c556-4a1b-984f-07004305fba2)

### 题目要点

- **Tree Shaking** 是一种优化技术，通过静态分析 ES6 模块来识别和去除未使用的代码。
- **Webpack** 通过分析模块的依赖关系和导入/导出语句，标记未使用的代码，并在构建过程中移除这些死代码。
- **前提条件**：需要使用 ES6 模块，并确保在生产模式下构建。

Tree Shaking 是现代 JavaScript 构建工具的重要特性，能够显著减少最终代码包的体积，提升应用性能。

<details>
<summary>参考答案</summary>

> Tree shaking 是一种通过清除多余代码方式来优化项目打包体积的技术，专业术语叫 Dead code elimination

## tree shaking如何工作的呢?

虽然 tree shaking 的概念在 1990 就提出了，但直到 ES6 的 ES6-style 模块出现后才真正被利用起来。

在ES6以前，我们可以使用CommonJS引入模块：require()，这种引入是动态的，也意味着我们可以基于条件来导入需要的代码：

```js
let dynamicModule;
// 动态导入
if (condition) {
  myDynamicModule = require("foo");
} else {
  myDynamicModule = require("bar");
}
```

但是CommonJS规范无法确定在实际运行前需要或者不需要某些模块，所以CommonJS不适合tree-shaking机制。在 ES6 中，引入了完全静态的导入语法：import。这也意味着下面的导入是不可行的：

```js
// 不可行，ES6 的import是完全静态的
if (condition) {
  myDynamicModule = require("foo");
} else {
  myDynamicModule = require("bar");
}
```

我们只能通过导入所有的包后再进行条件获取。如下：

```js
import foo from "foo";
import bar from "bar";

if (condition) {
  // foo.xxxx
} else {
  // bar.xxx
}
```

ES6的import语法可以完美使用tree shaking，因为可以在代码不运行的情况下就能分析出不需要的代码。

看完上面的分析，你可能还是有点懵，这里我简单做下总结：因为tree shaking只能在静态modules下工作。ECMAScript 6 模块加载是静态的,因此整个依赖树可以被静态地推导出解析语法树。所以在 ES6 中使用 tree shaking 是非常容易的。

## tree shaking的原理是什么?

看完上面的分析，相信这里你可以很容易的得出题目的答案了：

* ES6 Module引入进行静态分析，故而编译的时候正确判断到底加载了那些模块
* 静态分析程序流，判断那些模块和变量未被使用或者引用，进而删除对应代码

## common.js 和 es6 中模块引入的区别？

从这道题目我们可以很容易的引申出来另外一道“明星”面试题：common.js 和 es6 中模块引入的区别？

CommonJS 是一种模块规范，最初被应用于 Nodejs，成为 Nodejs 的模块规范。运行在浏览器端的 JavaScript 由于也缺少类似的规范，在 ES6 出来之前，前端也实现了一套相同的模块规范 (例如: AMD)，用来对前端模块进行管理。自 ES6 起，引入了一套新的 ES6 Module 规范，在语言标准的层面上实现了模块功能，而且实现得相当简单，有望成为浏览器和服务器通用的模块解决方案。但目前浏览器对 ES6 Module 兼容还不太好，我们平时在 Webpack 中使用的 export 和 import，会经过 Babel 转换为 CommonJS 规范。在使用上的差别主要有：

1、CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。

2、CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

3、CommonJs 是单个值导出，ES6 Module可以导出多个

4、CommonJs 是动态语法可以写在判断里，ES6 Module 静态语法只能写在顶层

5、CommonJs 的 this 是当前模块，ES6 Module的 this 是 undefined

</details>

## 21. 实现只执行一次的函数 {#question-subjective-f14ad288377d}

### 题目要点

闭包状态保存、执行标记、结果缓存、this绑定

<details>
<summary>参考答案</summary>

通过闭包保存执行状态，确保函数只在第一次调用时执行，后续调用直接返回第一次的结果。

```javascript
function once(fn) {
  let called = false
  let result
  return function(...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}
```

</details>

## 22. 用 reduce 实现 map {#question-6bf1144c-42b2-4337-bb00-090ead8350cc}

> 题库原题：[使用 reduce 实现 map](https://fe.ecool.fun/topic/6bf1144c-42b2-4337-bb00-090ead8350cc)

### 题目要点

`map` 的本质是等长映射并返回新数组；`reduce` 可以通过累加器承载结果数组来实现同样行为；实现时在每次迭代中 push 映射结果并返回累加器；工程实践中应优先使用语义更明确的 `map`，`reduce` 更适合复杂聚合逻辑。

<details>
<summary>参考答案</summary>

从语义上看，`map` 的核心并不是“遍历”，而是**基于原集合生成一个等长的新集合，并保持索引顺序不变**。`reduce` 本身并不限定结果结构，它只是提供了一种“逐步累积结果”的机制，因此完全可以用来表达 `map` 的行为。

在实现上，关键在于：把 `reduce` 的累加器当作“结果数组”，在每一次迭代中，将当前元素经过映射函数处理后追加到累加器中。这样，累加器最终就变成了 `map` 的返回值。

一个等价且语义清晰的实现如下：

```js
function mapByReduce(array, mapper) {
  return array.reduce((result, current, index, source) => {
    result.push(mapper(current, index, source))
    return result
  }, [])
}
```

这个实现与原生 `Array.prototype.map` 在行为上是一致的：不会修改原数组，返回一个新数组，映射函数能够拿到当前值、索引以及原数组。`reduce` 在这里承担的角色，是把“每一步的映射结果”持续累积到同一个输出容器中。

需要注意的是，用 `reduce` 实现 `map` 更多是一种**表达能力上的练习**，而不是工程上的推荐写法。在可读性和意图表达上，直接使用 `map` 更清晰，也更符合团队协作中的直觉。`reduce` 更适合用于那些无法直接用单一高阶函数表达的聚合场景，而不是替代已经存在、语义明确的 API。

从底层角度看，这两者在复杂度上并无本质差异，时间复杂度同为 O(n)，空间复杂度也都需要一个新的结果数组。差别更多体现在抽象层级和代码可维护性上。

</details>

## 23. sleep 函数实现 {#question-subjective-d592820e249d}

### 题目要点

Promise封装、setTimeout延迟、async/await配合、异步控制

<details>
<summary>参考答案</summary>

通过 Promise 和 setTimeout 实现异步延迟函数，可以配合 async/await 使用。

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用方式
async function example() {
  console.log('开始')
  await sleep(1000)
  console.log('1秒后执行')
}
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-78/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-78/round-126/index.md" >}}) →
