+++
title = "$nextTick"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = true
weight = 16
tags = ["面试", "前端", "Vue", "$nextTick", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
`nextTick` 是 Vue 的一个核心实现，`$nextTick`方法将回调延迟到下次DOM更新循环之后执行。**Vue 的 nextTick 其本质是对 JavaScript 执行原理 EventLoop 的一种应用。**

nextTick 的核心是利用了如 Promise 、MutationObserver、setImmediate、setTimeout的原生 JavaScript 方法来模拟对应的微/宏任务的实现，本质是为了利用 JavaScript 的这些异步回调任务队列来实现 Vue 框架中自己的异步回调队列

## 前置知识 - js事件循环

## JS 运行机制

JS 执行是单线程的，基于事件循环。事件循环大致分为以下步骤：

1. 所有同步任务都在主线程上执行，形成一个执行栈。
2. 异步任务放进任务队列，异步任务分为宏任务和微任务
3. 执行栈所有同步任务执行完成，就会执行任务队列。对应的异步任务，结束等待状态，进入执行栈，开始执行。
4. 主线程不断重复上面的第三步。

主线程的执行过程就是一个 tick，而所有的异步结果都是通过 “任务队列” 来调度。 消息队列中存放的是一个个的任务（task）。 task 分为两大类，分别是 macro task 和 micro task，并且每个 macro task(宏任务) 结束后，都要清空所有的 micro task(微任务)。

如图所示

```javascript
for (macroTask of macroTaskQueue) {
    // 执行宏任务
    handleMacroTask();
      
    // 执行所有微任务
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
}
```

`宏任务`： script、setTimeout、setInterval、Node中的setImmediate 等  
 `微任务`： Promise.then、MutationObserver、Node 中的 Process.nextTick等

## nextTick的具体实现原理

**上源码**

源码分为两部分，一是判断当前环境能使用的 `API` 并保存异步函数，二是调用异步函数执行回调队列

`timerFunc`函数定义，根**据当前环境支持什么方法则确定调用哪个**，分别有：

```
Promise.then`、`MutationObserver`、`setImmediate`、`setTimeout
```

通过上面任意一种方法，进行降级操作

```javascript
export let isUsingMicroTask = false 
const callbacks = [] // 回调队列
let pending = false

// 该方法执行队列中的全部回调
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 执行任务队列
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
let timerFunc // 用来保存调用异步任务方法
// 判断1：是否原生支持Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 保存一个异步任务
  const p = Promise.resolve()
  timerFunc = () => {
    // 执行回调函数
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // 判断2：是否原生支持MutationObserver
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
  //判断3：是否原生支持setImmediat
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

```javascript
export function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
​
  // cb 回调函数会经统一处理压入 callbacks 数组
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
​
  // 执行异步延迟函数 timerFunc
  if (!pending) {
    pending = true;
    timerFunc();
  }
​
  // 当 nextTick 没有传入函数参数的时候，返回一个 Promise 化的调用
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}
```

`callbacks`就是异步操作队列

`callbacks`新增回调函数后又执行了`timerFunc`函数，`pending`是用来标识同一个时间只能执行一次

```javascript
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

把回调函数放入callbacks等待执行，将执行函数放到微任务或者宏任务中 无论是微任务还是宏任务，都会放到`flushCallbacks`使用，这里将`callbacks`里面的函数复制一份，同时`callbacks`置空

循环遍历执行`callbacks`里面的函数

## 总结

1.  Vue 的 nextTick 其本质是对 JavaScript 执行原理 EventLoop 的一种应用 
2.  nextTick核心是利用了如 Promise 、MutationObserver、setImmediate、setTimeout的原生 JavaScript 方法来模拟对应的微/宏任务的实现，根据当前环境支持什么方法则确定调用哪个 

## 常见考点

### **1. 基本概念与使用场景**

#### **问题：**

1. Vue 中的 `$nextTick` 是什么？它有什么用？
2. 你能举一个实际项目中使用 `$nextTick` 的例子吗？

#### **考察点：**

-  **基本概念**： `$nextTick` 用于在下次 DOM 更新时执行回调。在 Vue 中，数据变化会触发视图更新，但视图更新是异步的，`$nextTick` 提供了一种在 DOM 更新后执行操作的方式。  
```javascript
this.$nextTick(() => {
  // 在 DOM 更新之后执行的代码
});
```
-  **常见使用场景**：  
  - **访问更新后的 DOM 元素**：当你需要访问更新后的 DOM（如获取元素的尺寸、位置等），可以使用 `$nextTick` 来确保在 DOM 更新完成后再执行操作。
  - **与第三方库的集成**：有时候需要与第三方库（如 jQuery、D3.js 等）进行交互，通常它们需要在 DOM 完全渲染后才能操作，因此 `$nextTick` 也非常有用。
  - **动画**：在某些情况下，DOM 更新后需要立刻应用动画样式，`$nextTick` 确保样式更新后再执行动画。

---

### **2. 工作原理**

#### **问题：**

1. `$nextTick` 是如何工作的？为什么它能保证在 DOM 更新后执行回调？
2. 如果你有多个 `$nextTick` 调用，它们的执行顺序是什么？

#### **考察点：**

-  **工作原理**： 在 Vue 中，数据更新触发视图更新是异步的，Vue 会将这些视图更新操作放入一个队列中。`$nextTick` 提供的回调会被推入一个队列，确保它会在下次 DOM 更新完成后执行。 
-  **多个 `$nextTick` 调用的执行顺序**： 如果在同一个事件循环中调用多个 `$nextTick`，它们会被推到同一个队列中，依次执行。Vue 会在下次 DOM 更新完成后，按顺序依次执行所有的 `$nextTick` 回调。  
```javascript
this.$nextTick(() => {
  console.log('Next tick 1');
});

this.$nextTick(() => {
  console.log('Next tick 2');
});

// 输出顺序是：
// 'Next tick 1'
// 'Next tick 2'
```

---

### **3. 与异步更新的关系**

#### **问题：**

1. 为什么 Vue 的数据更新是异步的？`$nextTick` 与异步更新有何关系？
2. 如何利用 `$nextTick` 来保证 DOM 更新后的操作？

#### **考察点：**

-  **异步更新的原因**： Vue 会批量更新 DOM 来提高性能，而不是每次数据变化都立即更新 DOM。这种异步更新机制意味着你不能立即在数据更新后访问到更新后的 DOM，`$nextTick` 就是为了解决这个问题，提供了一种方法来等待 DOM 更新完成后再执行操作。 
-  **操作顺序**： 在数据更新后，如果你需要立即访问更新后的 DOM，应该使用 `$nextTick` 来确保在 DOM 更新完成后再执行相关操作。  
```javascript
this.someData = 'new data';
this.$nextTick(() => {
  console.log(this.$refs.someElement); // 确保获取到最新的 DOM
});
```

---

### **4. 与 Vue 生命周期的结合**

#### **问题：**

1. `$nextTick` 如何与 Vue 生命周期钩子一起使用？
2. 在 Vue 生命周期中的哪些时机适合使用 `$nextTick`？

#### **考察点：**

-  **生命周期钩子与 `$nextTick`**： `$nextTick` 在 Vue 中非常有用，尤其是在生命周期钩子中，尤其是在一些视图更新相关的钩子（如 `mounted`、`updated`）中。   
  - **`mounted`**：在组件实例被挂载到 DOM 后调用，此时 DOM 渲染已经完成，但如果你需要等 DOM 完全更新后再执行某些操作，可以使用 `$nextTick`。
  - **`updated`**：在数据变化后，DOM 更新完成时调用。如果你需要在数据变化后执行一些操作（如操作 DOM），可以使用 `$nextTick` 来确保操作的是最新的 DOM。
```javascript
mounted() {
  this.$nextTick(() => {
    console.log('DOM has been mounted');
  });
}
```

---

### **5. 与 `setTimeout` 和 `Promise` 的区别**

#### **问题：**

1. `$nextTick` 和 `setTimeout` 有什么区别？它们的执行时机如何？
2. `$nextTick` 和 `Promise` 的 `then` 有什么区别？

#### **考察点：**

-  **`$nextTick` 与 `setTimeout`**： `setTimeout` 是将回调推入宏任务队列中，而 `$nextTick` 则是将回调推入微任务队列中。微任务会在当前事件循环结束时立即执行，而宏任务会在下一轮事件循环时执行。因此，`$nextTick` 的回调比 `setTimeout` 的回调执行得更早。  
```javascript
this.$nextTick(() => {
  console.log('nextTick');
});
setTimeout(() => {
  console.log('setTimeout');
}, 0);

// 输出顺序：
// 'nextTick'
// 'setTimeout'
```
-  **`$nextTick` 与 `Promise.then`**： `$nextTick` 和 `Promise.then` 都是微任务，但它们的使用场景有所不同。`$nextTick` 是 Vue 特有的，它确保在数据更新后立即执行回调，而 `Promise.then` 是 JavaScript 原生的异步处理方法。 

---

### **总结**

`$nextTick` 是 Vue 中一个非常重要的工具，它使得在 DOM 更新后执行回调成为可能，避免了直接访问尚未更新的 DOM。理解 `$nextTick` 的工作原理，以及它如何与 Vue 的生命周期、异步更新和事件循环机制相结合，是深入理解 Vue 的关键之一。在面试中，考察点通常涉及它的使用场景、工作原理、生命周期钩子中的结合，以及与其他异步机制（如 `setTimeout` 和 `Promise`）的区别。
