+++
title = "小红书-社招-5年 · 第 1 轮 · 技术面试"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "小红书", "技术面试", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/95"
experienceId = 95
roundId = 159
roundOrder = 1
company = "小红书"
date = "2026-02-01T14:42:25.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-95/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-95/round-160/index.md" >}}) →

**本轮概述：** 该轮面试主要考察了前端基础知识，包括BFC、浮动元素、作用域、异步编程、Webpack、Vue等多方面的内容。题目涉及理论知识和代码实现。

本轮共 18 道题。答案默认折叠，便于先自行作答。

## 1. BFC讲一下 {#question-5c174882-c1e7-4c08-a71a-f4c991be552f}

> 题库原题：[什么是BFC？](https://fe.ecool.fun/topic/5c174882-c1e7-4c08-a71a-f4c991be552f)

### 题目要点

**BFC（Block Formatting Context）** 是 CSS 中一个重要的布局概念，它描述了一个块级元素的内部布局和外部布局之间的关系。BFC 主要用于处理元素的布局、浮动、边距合并等问题。

### BFC 的作用

1. **阻止外边距折叠**：
   - **外边距折叠**：当两个块级元素垂直相邻时，它们的外边距会合并，形成一个更大的外边距。
   - **BFC**：在 BFC 内部的元素的外边距不会影响到外部 BFC 的元素，避免了外边距折叠的问题。

2. **包含浮动元素**：
   - **浮动元素**：通常会从其包含块中溢出。
   - **BFC**：具有 BFC 的元素可以包含其内部的浮动元素，确保其高度包括浮动元素的高度。

3. **控制元素的布局**：
   - **BFC**：在 BFC 内部，元素的布局（如浮动、定位）会受到影响和控制，避免与外部元素发生冲突。

4. **防止元素重叠**：
   - **BFC**：能够隔离不同的 BFC 区域，避免元素之间的重叠或干扰。

### 如何触发 BFC

BFC 会在以下情况中被触发：

1. **块级格式化上下文的创建**：
   - 元素的 `display` 属性值为 `block` 或 `inline-block`。
   - 元素的 `position` 属性值为 `absolute` 或 `fixed`。
   - 元素的 `float` 属性值为 `left` 或 `right`。
   - 元素的 `overflow` 属性值为 `hidden`、`scroll` 或 `auto`。

2. **其他常见触发情况**：
   - 使用 `overflow` 属性，设置为 `hidden`、`scroll`、`auto`。
   - 使用 `display: flow-root`。
   - 使用 Flexbox 或 Grid 布局的容器也会创建 BFC。

### 示例

**1. 防止外边距折叠**：

```html
<div style="margin: 0; padding: 0; background: lightgray;">
  <div style="margin: 20px; background: lightblue;">Inner</div>
</div>
```

**2. 包含浮动元素**：

```html
<div style="overflow: hidden;">
  <div style="float: left; width: 100px; height: 100px; background: lightblue;"></div>
</div>
```

### 总结

- **BFC（Block Formatting Context）** 是一种 CSS 布局概念，用于控制块级元素的布局和外部元素的影响。
- **主要作用** 包括防止外边距折叠、包含浮动元素、控制布局和防止重叠。
- **触发 BFC** 的常见方法包括设置 `overflow` 属性、`display` 属性、`float` 属性和特定的布局模式。

<details>
<summary>参考答案</summary>

BFC：block formatting context，块级格式化上下文。

BFC是Web页面的可视CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

定位方案：

* 内部的Box会在垂直方向上一个接一个放置。
* Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠。
* 每个元素的margin box 的左边，与包含块border box的左边相接触。
* BFC的区域不会与float box重叠。
* BFC是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。
* 计算BFC的高度时，浮动元素也会参与计算。

满足下列条件之一就可触发BFC:

* 根元素，即html
* float的值不为none（默认）
* overflow的值不为visible（默认）
* display的值为table-cell, table-caption, inline-block, flex, 或者 inline-flex 中的其中一个
* position的值为absolute或fixed

</details>

## 2. 浮动元素为何需要包裹在 BFC 容器中？ {#question-subjective-2c74c2d3728f}

### 题目要点

浮动元素, BFC容器, 布局问题, 高度塌陷

<details>
<summary>参考答案</summary>

将浮动元素包裹在BFC容器中可以防止浮动元素脱离文档流导致的布局问题，例如父元素高度塌陷。BFC容器能够包含浮动元素的高度，从而避免这些问题。

</details>

## 3. `display: flow-root` 与 `overflow: hidden` 创建 BFC 时，对滚动条和剪裁行为的影响有何差异？ {#question-subjective-f77ba64956e1}

### 题目要点

flow-root, overflow: hidden, 滚动条, 剪裁行为

<details>
<summary>参考答案</summary>

`display: flow-root` 创建BFC时不会产生滚动条或剪裁行为，而`overflow: hidden`则会隐藏溢出的内容并可能产生滚动条。因此，在需要创建BFC但不需要隐藏溢出内容时，使用`flow-root`更为合适。

</details>

## 4. 讲一下代码输出以及原因 {#question-e47771cd-99ca-4650-96ce-66087c1418a4}

> 题库原题：[说说下面代码执行后的输出是什么？](https://fe.ecool.fun/topic/e47771cd-99ca-4650-96ce-66087c1418a4)

```js
var b = 10;
(function b(){
    b = 20;
    console.log(b);
})();
```

### 题目要点

先看浏览器中的执行结果：

<details>
<summary>参考答案</summary>

先看浏览器中的执行结果：

![](https://static.ecool.fun/others/619e2a00-4b97-4c4b-b4be-e8c847cc5dcb.png)

## 解析

* 代码预解析时，会将var b进行变量提升，此时b没有被赋值(b=undefined) (这里有人会说这里明明有个函数表达式呀，为什么没有进入变量提升，因为IIFE自带有词法作用域(我们常理解得作用域))
* 发现没有可以变量提升得时候将b赋值为10，此时会将b 赋值为10(b=10)
* 碰到了立即执行函数，会执行其内边的函数 function b()
* IIFE作用域中定义b = function b(){}
* 碰到了b = 20，会顺着作用域链寻找是否存在b，发现IIFE作用域中存在b，将IIFE作用域中的b赋值为20(b=20)(因为函数表达式特性，标识符无法被修改，所以这里执行失败)
* 执行console.log(b)，此时的b会找IIFE中的作用域看看是否存在b，发现其内边存在，将其返回

</details>

## 5. 以下代码输出结果以及原因 {#question-7fdc5ee0-1c5f-483b-927b-140536ea83f2}

> 题库原题：[【Promise第34题】下面代码的输出是什么？](https://fe.ecool.fun/topic/7fdc5ee0-1c5f-483b-927b-140536ea83f2)

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log('script end')

```

### 题目要点

经过前面的题目解析，相信这道题可以很容易得出结果。

<details>
<summary>参考答案</summary>

经过前面的题目解析，相信这道题可以很容易得出结果。

## 结果

```
'script start'
'async1 start'
'async2'
'promise1'
'script end'
'async1 end'
'promise2'
'setTimeout'
```

</details>

## 6. async/await 实现机制讲一下 {#question-29821d8e-dc41-4581-91fe-9fde7658a559}

> 题库原题：[async、await 实现原理](https://fe.ecool.fun/topic/29821d8e-dc41-4581-91fe-9fde7658a559)

### 题目要点

`async` 和 `await` 是 ES2017 (ES8) 中引入的，用于简化基于 Promise 的异步代码编写。它们使得异步代码看起来和写起来更像是同步代码，从而提高了代码的可读性和易维护性。

### 实现原理

#### 1. Promise

首先，理解 `async` 和 `await` 的实现原理需要先了解 Promise。Promise 是一个代表了异步操作最终完成或失败的对象。它有两种状态：pending（进行中）、fulfilled（已成功）或 rejected（已失败）。一旦 Promise 被 fulfilled 或 rejected，它的状态就不能再改变。Promise 通过 `.then()` 和 `.catch()` 方法来处理异步操作的结果或错误。

#### 2. async 函数

`async` 函数是一个返回 Promise 对象的函数。你可以使用 `await` 在 `async` 函数内部等待 Promise 解决。`async` 函数隐式地将返回值包装在一个 Promise 中，或者如果函数抛出异常，则返回一个被拒绝的 Promise。

```javascript
async function fetchData() {
  return 'some data';
}

// 相当于
function fetchData() {
  return Promise.resolve('some data');
}
```

#### 3. await 表达式

`await` 表达式会暂停 `async` 函数的执行，等待 Promise 解决（fulfilled 或 rejected），然后继续执行 `async` 函数并返回解决的值。如果 Promise 被拒绝，`await` 表达式会抛出一个错误，这个错误可以被 `async` 函数外部的 `try...catch` 捕获。

```javascript
async function asyncCall() {
  try {
    let result = await someAsyncCall(); // 等待 Promise 解决
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

#### 4. 生成器函数（Generator Functions）的灵感

虽然 `async`/`await` 的具体实现并不直接依赖于生成器函数（Generator Functions），但它们的设计受到了生成器函数的启发。生成器函数允许你通过 `yield` 表达式暂停和恢复函数的执行。`async`/`await` 可以看作是自动处理 Promise 的生成器函数的语法糖。

#### 5. 底层实现

在底层，JavaScript 引擎（如 V8）通过状态机（state machine）或类似的机制来管理 `async` 函数的执行和暂停。当 `await` 表达式被遇到时，JavaScript 引擎会将当前执行上下文（包括局部变量、调用栈帧等）保存起来，等待 Promise 解决。一旦 Promise 解决，JavaScript 引擎将恢复 `async` 函数的执行，并返回解决的值或抛出错误。

### 总结

`async` 和 `await` 的实现原理基于 Promise，通过自动处理 Promise 的解决和拒绝，以及使用底层机制来暂停和恢复函数的执行，来简化异步代码的编写。这使得异步代码看起来更像是同步代码，提高了代码的可读性和可维护性。

<details>
<summary>参考答案</summary>

# JavaScript 异步编程回顾

由于 JavaScript 是单线程执行模型，因此必须支持异步编程才能提高运行效率。异步编程的语法目标是让异步过程写起来像同步过程。

## 1. 回调函数

回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，就直接调用这个函数。

```js
const fs = require('fs')
fs.readFile('/etc/passwd', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data.toString())
})
```

回调函数最大的问题是容易形成回调地狱，即多个回调函数嵌套，降低代码可读性，增加逻辑的复杂性，容易出错。

```js
fs.readFile(fileA, function (err, data) {
  fs.readFile(fileB, function (err, data) {
    // ...
  })
})
```

## 2. Promise

为解决回调函数的不足，社区创造出 Promise。

```js
const fs = require('fs')

const readFileWithPromise = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

readFileWithPromise('/etc/passwd')
  .then(data => {
    console.log(data.toString())
    return readFileWithPromise('/etc/profile')
  })
  .then(data => {
    console.log(data.toString())
  })
  .catch(err => {
    console.log(err)
  })
```

简单的 Promise 实现，窥探下本质

Promise 实际上是利用编程技巧将回调函数的横向加载，改成纵向加载，达到链式调用的效果，避免回调地狱。最大问题是代码冗余，原来的任务被 Promise 包装了一下，不管什么操作，一眼看去都是一堆 then，原来的语义变得很不清楚。

## 3. async、await

为了解决 Promise 的问题，async、await 在 ES8 中被提了出来，是目前为止最好的解决方案

```js
const fs = require('fs')
async function readFile() {
  try {
    var f1 = await readFileWithPromise('/etc/passwd')
    console.log(f1.toString())
    var f2 = await readFileWithPromise('/etc/profile')
    console.log(f2.toString())
  } catch (err) {
    console.log(err)
  }
}\
```

async、await 函数写起来跟同步函数一样，条件是需要接收 Promise 或原始类型的值。异步编程的最终目标是转换成人类最容易理解的形式。

# async、await

分析 async、await 实现原理之前，先介绍下预备知识

## 1. generator

generator 函数是协程在 ES6 的实现。协程简单来说就是多个线程互相协作，完成异步任务。

![image-1-1620701628067.png](https://static.ecool.fun//article/466ad367-1f3f-4f4c-8fa1-bd5dace7bbb7.jpeg)

整个 generator 函数就是一个封装的异步任务，异步操作需要暂停的地方，都用 yield 语句注明。generator 函数的执行方法如下：

```js
function* gen(x) {
  console.log('start')
  const y = yield x * 2
  return y
}

const g = gen(1)
g.next()   // start { value: 2, done: false }
g.next(4)  // { value: 4, done: true }
```

* `gen()` 不会立即执行，而是一上来就暂停，返回一个 `Iterator` 对象（具体可以参考 [Iterator遍历器](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fwangfupeng1988%2Fjs-async-tutorial%2Fblob%2Fmaster%2Fpart4-generator%2F02-iterator.md "https://github.com/wangfupeng1988/js-async-tutorial/blob/master/part4-generator/02-iterator.md") ）
* 每次 `g.next()` 都会打破暂停状态去执行，直到遇到下一个 `yield` 或者 `return`
* 遇到 `yield` 时，会执行 `yield` 后面的表达式，并返回执行之后的值，然后再次进入暂停状态，此时 `done: false` 。
* `next` 函数可以接受参数，作为上个阶段异步任务的返回结果，被函数体内的变量接收
* 遇到 `return` 时，会返回值，执行结束，即 `done: true`
* 每次 `g.next()` 的返回值永远都是 `{value: ... , done: ...}` 的形式

## 2. thunk函数

JavaScript 中的 thunk 函数（译为转换程序）简单来说就是把带有回调函数的多参数函数转换成只接收回调函数的单参数版本

```js
const fs = require('fs')
const thunkify = fn => (...rest) => callback => fn(...rest, callback)
const thunk = thunkify(fs.readFile)
const readFileThunk = thunk('/etc/passwd', 'utf8')
readFileThunk((err, data) => {
   // ...
})
```

单纯的 thunk 函数并没有很大的用处， 大牛们想到了和 generator 结合：

```js
function* readFileThunkWithGen() {
  try {
    const content1 = yield readFileThunk('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileThunk('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
}

const g = readFileThunkWithGen()
g.next().value((err, data) => {
  if (err) {
    return g.throw(err).value
  }
  g.next(data.toString()).value((err, data) => {
    if (err) {
      return g.throw(err).value
    }
    g.next(data.toString())
  })
})
```

thunk 函数的真正作用是统一多参数函数的调用方式，在 next 调用时把控制权交还给 generator，使 generator 函数可以使用递归方式自启动流程

```js
const run = generator => {
  const g = generator()
  const next = (err, ...rest) => {
    if (err) {
      return g.throw(err).value
    }
    const result = g.next(rest.length > 1 ? rest : rest[0])
    if (result.done) {
      return result.value
    }
    result.value(next)
  }
  next()
}
run(readFileThunkWithGen)
```

有了自启动的加持之后，generator 函数内就可以写"同步"的代码了。generator 函数也可以与 Promise 结合：

```js
function* readFileWithGen() {
  try {
    const content1 = yield readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
}

const run = generator => {
  return new Promise((resolve, reject) => {
    const g = generator()
    const next = res => {
      const result = g.next(res)
      if (result.done) {
        return resolve(result.value)
      }
      result.value
        .then(
          next,
          err => reject(gen.throw(err).value)
        )
    }
    next()
  })
}

run(readFileWithGen)
  .then(res => console.log(res))
  .catch(err => console.log(err))
```

generator 可以暂停执行，很容易让它和异步操作产生联系，因为我们在处理异步操作时，在等待的时候可以暂停当前任务，把程序控制权交还给其他程序，当异步任务有返回时，在回调中再把控制权交还给之前的任务。generator 实际上并没有改变 JavaScript 单线程、使用回调处理异步任务的本质。

## 3. co 函数库

每次执行 generator 函数时自己写启动器比较麻烦。 [co函数库](https://github.com/tj/co) 是一个 generator 函数的自启动执行器，使用条件是 generator 函数的 yield 命令后面，只能是 thunk 函数或 Promise 对象，co 函数执行完返回一个 Promise 对象。

```js
const co = require('co')
co(readFileWithGen).then(res => console.log(res)) // 'done'
co(readFileThunkWithGen).then(res => console.log(res)) // 'done'
```

co 函数库的源码实现其实就是把上面两种情况做了综合:

```js
// 做了简化，与源码基本一致
const co = (generator, ...rest) => {
  const ctx = this
  return new Promise((resolve, reject) => {
    const gen = generator.call(ctx, ...rest)
    if (!gen || typeof gen.next !== 'function') {
      return resolve(gen)
    }

    const onFulfilled = res => {
      let ret
      try {
        ret = gen.next(res)
      } catch (e) {
        return reject(e)
      }
      next(ret)
    }

    const onRejected = err => {
      let ret
      try {
        ret = gen.throw(err)
      } catch (e) {
        return reject(e)
      }
      next(ret)
    }

    const next = result => {
      if (result.done) {
        return resolve(result.value)
      }
      toPromise(result.value).then(onFulfilled, onRejected)
    }

    onFulfilled()
  })
}

const toPromise = value => {
  if (isPromise(value)) return value
  if ('function' == typeof value) {
    return new Promise((resolve, reject) => {
      value((err, ...rest) => {
        if (err) {
          return reject(err)
        }
        resolve(rest.length > 1 ? rest : rest[0])
      })
    })
  }
}

```

## 4. 理解 async、await

一句话，async、await 是 co 库的官方实现。也可以看作自带启动器的 generator 函数的语法糖。不同的是，async、await 只支持 Promise 和原始类型的值，不支持 thunk 函数。

```js
// generator with co
co(function* () {
  try {
    const content1 = yield readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = yield readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    console.error(err)
    return 'fail'
  }
})

// async await
async function readfile() {
  try {
    const content1 = await readFileWithPromise('/etc/passwd', 'utf8')
    console.log(content1)
    const content2 = await readFileWithPromise('/etc/profile', 'utf8')
    console.log(content2)
    return 'done'
  } catch (err) {
    throw(err)
  }
}
readfile().then(
  res => console.log(res),
  err => console.error(err)
)
```

# 总结

不论以上哪种方式，都没有改变 JavaScript 单线程、使用回调处理异步任务的本质。人类总是追求最简单易于理解的编程方式。

</details>

## 7. async function 返回的 Promise 状态何时变为 resolved？ {#question-f63d5da4-7797-4a48-920a-54e983e33bf3}

> 题库原题：[async function 返回的 Promise 状态何时变为 resolved？](https://fe.ecool.fun/topic/f63d5da4-7797-4a48-920a-54e983e33bf3)

### 题目要点

1. **`async` 函数本身不一定是异步执行的**

   * 只有 `await` 才会让出执行权

2. `return await` ≠ `return`

   * `return await` 会等待 Promise settle
   * `return` 直接包装 Promise（但结果通常一致）
3. resolved ≠ 同步

   * resolved 的回调一定是异步（微任务）

<details>
<summary>参考答案</summary>

`async function` **返回的 Promise 会在函数体内的执行流程“正常结束”时变为 `resolved`**。

更精确地说，可以从以下几种情况来理解。

---

## 一、基本结论（核心规则）

> **当 `async` 函数执行到 `return`，或函数体执行完且未抛出异常时，返回的 Promise 会被 `resolved`。**

同时遵循两个映射规则：

* `return value` → `Promise.resolve(value)`
* `throw error` → `Promise.reject(error)`

---

## 二、几种常见场景拆解

### 1. 显式 `return`（最常见）

```js
async function foo() {
  return 42;
}

foo().then(res => console.log(res)); // 42
```

等价于：

```js
function foo() {
  return Promise.resolve(42);
}
```

**Promise 在 `return` 语句执行时变为 resolved。**

---

### 2. 没有 `return`（隐式返回 `undefined`）

```js
async function foo() {}

foo().then(res => console.log(res)); // undefined
```

等价于：

```js
Promise.resolve(undefined);
```

**函数执行到末尾时，Promise resolved，值为 `undefined`。**

---

### 3. `return await xxx`

```js
async function foo() {
  return await Promise.resolve(10);
}
```

这里要注意：

* `await` 会“暂停”函数执行，等待 Promise settle
* **只有在 `await` 的 Promise fulfilled 后，函数才会继续执行并 `return`**

因此：

> Promise **在 `await` 的 Promise fulfilled 之后** 才会 resolved

等价逻辑：

```js
Promise.resolve(10).then(v => Promise.resolve(v));
```

---

### 4. 函数内部抛出异常

```js
async function foo() {
  throw new Error("err");
}

foo().catch(err => console.log(err.message));
```

此时：

* Promise **不会 resolved**
* 而是 **立即变为 rejected**

---

### 5. `await` 的 Promise 被 reject

```js
async function foo() {
  await Promise.reject("fail");
  return 1;
}
```

执行流程：

* `await` 等到 Promise reject
* 抛出异常
* 函数中断执行

结果：

```js
foo().catch(err => console.log(err)); // "fail"
```

**返回的 Promise 状态是 rejected，不是 resolved。**

---

## 三、时间点总结（一句话版）

> `async function` 返回的 Promise **在函数执行完毕且没有抛出异常时 resolved**，
> 如果函数中包含 `await`，则要等 **所有被 `await` 的 Promise fulfilled 后** 才会 resolved。

---

## 四、事件循环视角（进阶理解）

```js
async function foo() {
  return 1;
}

console.log("start");
foo().then(console.log);
console.log("end");
```

输出顺序：

```
start
end
1
```

说明：

* `async` 函数是 **同步开始执行**
* `resolved` 的回调（`.then`）**一定进入微任务队列**
* 即使是 `return 1`，也不会同步触发 `.then`

</details>

## 8. 若函数内抛出未捕获错误，Promise 如何变化？ {#question-subjective-a29d2e56b2dd}

### 题目要点

`async` 函数中只要有未捕获异常，返回的 Promise 就会变为 `rejected`；

try/catch 决定错误是否向外传播，finally 默认不改变最终状态。

<details>
<summary>参考答案</summary>

如果 **`async function` 内抛出了未捕获的错误**（包括同步 `throw`，或 `await` 的 Promise 被 reject 且未捕获），**返回的 Promise 会立刻变为 `rejected`**，并且 **错误对象就是 reject 的原因**。

---

## 一、结论先行

> **`async` 函数内任何未捕获异常 ⇒ 返回的 Promise 状态为 `rejected`**

映射规则非常直接：

* `throw error` → `Promise.reject(error)`
* `await rejectedPromise`（未 `try/catch`）→ `Promise.reject(reason)`

---

## 二、几种典型情况

### 1. 同步抛出错误

```js
async function foo() {
  throw new Error("boom");
}

foo().catch(err => {
  console.log(err.message); // boom
});
```

等价于：

```js
function foo() {
  return Promise.reject(new Error("boom"));
}
```

---

### 2. `await` 的 Promise 被 reject，且未捕获

```js
async function foo() {
  await Promise.reject("fail");
  return 1;
}

foo().catch(err => console.log(err)); // fail
```

执行流程：

1. `await` 等到 Promise reject
2. 抛出异常
3. 函数中断
4. 返回的 Promise 直接 rejected

---

### 3. try / catch 捕获后 **未重新抛出**

```js
async function foo() {
  try {
    await Promise.reject("fail");
  } catch (e) {
    console.log("handled");
  }
  return 1;
}

foo().then(res => console.log(res)); // 1
```

此时：

* 错误被吞掉
* Promise **resolved**

---

### 4. try / catch 捕获后 **重新抛出**

```js
async function foo() {
  try {
    await Promise.reject("fail");
  } catch (e) {
    throw e;
  }
}

foo().catch(err => console.log(err)); // fail
```

Promise 仍然是 **rejected**

---

## 三、finally 的影响（容易被问）

```js
async function foo() {
  try {
    throw new Error("err");
  } finally {
    console.log("cleanup");
  }
}

foo().catch(err => console.log(err.message));
```

* `finally` 一定会执行
* **但不会改变 Promise 的最终状态**
* 除非 `finally` 里：

  * `throw` 新错误
  * 或 `return` 一个值 / Promise

例如：

```js
async function foo() {
  try {
    throw new Error("A");
  } finally {
    return 1;
  }
}

foo().then(console.log); // 1
```

此时：

> `finally` 的 `return` **覆盖了原本的 reject**

---

## 四、与普通 Promise 的本质等价关系

```js
async function foo() {
  throw err;
}
```

等价于：

```js
new Promise((_, reject) => reject(err));
```

这也是为什么 async/await 只是 Promise 的语法糖。

</details>

## 9. webpack中Loader 与 Plugin讲一下 {#question-6ccbf43f-c512-4e3c-82ce-fe925b8a0c07}

> 题库原题：[webpack的Loader和Plugin的不同](https://fe.ecool.fun/topic/6ccbf43f-c512-4e3c-82ce-fe925b8a0c07)

### 题目要点

<p><strong>不同的作用:</strong><br/> </p><ul><li> <strong>Loader</strong>直译为&quot;加载器&quot;。Webpack将一切文件视为模块，但是webpack原生是只能解析js文件，如果想将其他文件也打包的话，就会用到<code>loader</code>。 所以Loader的作用是让webpack拥有了加载和解析<em>非JavaScript文件</em>的能力。</li><li> <strong>Plug…

<details>
<summary>参考答案</summary>

<p><strong>不同的作用:</strong><br/> </p><ul><li> <strong>Loader</strong>直译为&quot;加载器&quot;。Webpack将一切文件视为模块，但是webpack原生是只能解析js文件，如果想将其他文件也打包的话，就会用到<code>loader</code>。 所以Loader的作用是让webpack拥有了加载和解析<em>非JavaScript文件</em>的能力。</li><li> <strong>Plugin</strong>直译为&quot;插件&quot;。Plugin可以扩展webpack的功能，让webpack具有更多的灵活性。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。</li></ul><p> <strong>不同的用法:</strong><br/> </p><ul><li> <strong>Loader</strong>在<code>module.rules</code>中配置，也就是说他作为模块的解析规则而存在。 类型为数组，每一项都是一个<code>Object</code>，里面描述了对于什么类型的文件（<code>test</code>），使用什么加载(<code>loader</code>)和使用的参数（<code>options</code>）</li><li> <strong>Plugin</strong>在<code>plugins</code>中单独配置。 类型为数组，每一项是一个<code>plugin</code>的实例，参数都通过构造函数传入。</li></ul><p><br/></p>

</details>

## 10. webpack 中的 Loader ，链式调用顺序会影响编译结果吗？ {#question-7d4e4120-8c99-4e2e-a2c7-98d186c57289}

> 题库原题：[webpack 中的 Loader ，链式调用顺序会影响编译结果吗？](https://fe.ecool.fun/topic/7d4e4120-8c99-4e2e-a2c7-98d186c57289)

### 题目要点

Webpack Loader 是一个按流水线执行的源码转换系统，Loader 的链式顺序直接决定源码被处理的阶段；配置顺序为从左到右，但执行顺序为从右到左，每个 Loader 都处理前一个 Loader 的输出，因此顺序错误会导致语义阶段错乱甚至编译失败；通常应遵循“靠近源码的 Loader 放右侧，靠近运行时的 Loader 放左侧”的原则，同时 Loader 还存在 pitch 与 normal 两阶段执行机制，使顺序对最终编译结果具有决定性影响。

<details>
<summary>参考答案</summary>

会，而且这是 Webpack Loader 机制中**非常关键且经常被误解的一点**：

> **Loader 的链式调用顺序不仅会影响编译结果，而且很多语法是否能正确工作，完全取决于 Loader 的执行顺序。**

理解这个问题的关键在于：**Loader 本质是一个“源码转换流水线（transform pipeline）”。**

---

## 一、Loader 本质：源码的逐步转换

在 Webpack 中 hookup 的 Loader，并不是同时运行的，它们会对模块源码进行**一层一层的转换**：

```text
原始源码 → loaderA → loaderB → loaderC → 最终 JS 模块
```

每个 Loader：

* 接收上一个 Loader 的输出
* 返回新的源码字符串（或 AST 转换结果）
* 交给下一个 Loader

因此：

> Loader 顺序决定了“谁先处理源码”，自然会影响最终产物。

---

## 二、关键规则：执行顺序与书写顺序相反

Webpack Loader 的执行规则是：

```text
配置顺序：从左到右
执行顺序：从右到左
```

例如：

```js
use: ['style-loader', 'css-loader', 'postcss-loader']
```

真实执行顺序：

```text
postcss-loader
→ css-loader
→ style-loader
```

原因是：

* 最右侧 Loader 最先接触原始资源
* 每个 Loader 向左传递转换结果

可以把它理解为函数组合：

```js
style(css(postcss(source)))
```

---

## 三、为什么顺序会直接影响编译结果

因为不同 Loader 处理的是**不同语义阶段的代码**。

### 典型例子：CSS 处理链

```js
use: ['style-loader', 'css-loader']
```

职责：

* `css-loader`：解析 CSS → 转成 JS module
* `style-loader`：把 CSS 注入 DOM

正确流程：

```text
CSS → css-loader(变成JS) → style-loader(执行注入)
```

如果顺序写反：

```js
use: ['css-loader', 'style-loader']
```

执行变成：

```text
style-loader → css-loader
```

此时：

* style-loader 收到的是原始 CSS
* 它期望的是 JS 模块
* 编译或运行直接异常

---

### 再看 Babel + TypeScript

```js
use: ['babel-loader', 'ts-loader']
```

执行顺序：

```text
ts-loader → babel-loader
```

正确原因：

1. TypeScript 先转 JS
2. Babel 再做语法降级 / polyfill

如果反过来：

```text
babel-loader → ts-loader
```

Babel 无法解析 TS 类型语法，直接报错。

---

## 四、Loader 阶段不仅只有一个（高级理解）

Webpack Loader 实际存在多个执行阶段：

```text
pitch 阶段：从左 → 右
normal 阶段：从右 → 左
```

即：

```text
pitch(loader1)
pitch(loader2)
pitch(loader3)

normal(loader3)
normal(loader2)
normal(loader1)
```

`pitch` 可以：

* 提前终止后续 Loader
* 改写执行流程
* 返回自定义模块内容

这也是 `style-loader` 等 Loader 能实现高级能力的原因。

---

## 五、为什么 Webpack 采用“反向执行”

本质是为了符合编译直觉：

* 最靠近资源的 Loader 先处理原始文件
* 后续 Loader 处理已经转换后的结果

类似编译器 pipeline：

```text
源码 → 语法转换 → 模块化 → 运行时代码
```

---

## 六、工程实践中的顺序原则

经验上可以总结为一个规律：

> **越接近“源码形态”的 Loader 越靠右，越接近“运行时”的 Loader 越靠左**

例如：

```text
源码转换类      → 右侧
模块解析类      → 中间
运行时注入类    → 左侧
```

</details>

## 11. webpack 中，自定义 Plugin 如何监听 `emit` 阶段修改产物？ {#question-subjective-5ffef6ce4c1c}

### 题目要点

自定义 Plugin 通过在 `apply` 中订阅 `compiler.hooks.emit`，在资源写入磁盘之前获取 `compilation.assets`；在这一阶段，所有产物已生成但仍处于内存中，可以安全地进行内容修改、新增或删除；修改的本质是替换或重写 assets 对象，而非直接操作文件系统；在 Webpack 5 中，这类能力被进一步细化到 `processAssets`，但设计思想保持一致。

<details>
<summary>参考答案</summary>

在 Webpack 中，自定义 Plugin 之所以能够在 `emit` 阶段修改构建产物，本质上是**通过订阅编译生命周期钩子，在资源即将输出到文件系统之前，对内存中的 assets 进行读写操作**。

---

## 一、`emit` 阶段在编译流程中的位置

从整体流程看，Webpack 的一次构建大致经历：

模块解析 → 依赖构建 → Chunk 生成 → **产物封装** → `emit` → 输出到磁盘

`emit` 阶段的关键特征是：

* 所有模块、Chunk、代码分割已经完成
* 所有待输出文件已经生成并存放在 **内存中的 assets 对象**
* 文件尚未写入磁盘，是**修改产物的最后安全时机**

因此，任何希望**增删文件、修改文件内容、注入额外产物**的 Plugin，都会选择在 `emit` 或更晚的 `processAssets` 阶段完成。

---

## 二、自定义 Plugin 的基本结构

一个 Webpack Plugin 本质上是一个带有 `apply` 方法的类：

```js
class MyPlugin {
  apply(compiler) {
    // 订阅生命周期
  }
}
```

`compiler` 代表的是**整个构建过程的控制器**，而 `emit` 属于 `compiler.hooks` 上的一个钩子。

---

## 三、监听 `emit` 阶段的方式

### 1. Webpack 4 及早期常见写法

```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'MyPlugin',
      (compilation, callback) => {
        // 修改 compilation.assets
        callback();
      }
    );
  }
}
```

此时：

* `compilation.assets` 是一个对象
* key 是文件名
* value 是一个包含 `source()` / `size()` 方法的对象

---

### 2. Webpack 5 推荐方式（更细粒度）

Webpack 5 中更推荐使用 `processAssets`，但 `emit` 仍然存在：

```js
class MyPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('MyPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'MyPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        assets => {
          // 操作 assets
        }
      );
    });
  }
}
```

不过如果问题聚焦在 **“监听 emit 阶段修改产物”**，核心思想是一致的：**操作 compilation.assets**。

---

## 四、在 `emit` 阶段修改产物的常见操作

### 1. 修改已有文件内容

```js
const rawSource = compilation.assets['main.js'].source();

const newSource = rawSource.replace('__VERSION__', '1.0.0');

compilation.assets['main.js'] = {
  source: () => newSource,
  size: () => newSource.length
};
```

这类操作常用于：

* 注入构建信息
* 替换占位符
* 打补丁式修复产物代码

---

### 2. 新增一个产物文件

```js
compilation.assets['build-info.json'] = {
  source: () => JSON.stringify({ time: Date.now() }),
  size: () => 0
};
```

常见应用：

* 生成版本描述文件
* 输出构建清单
* 注入调试信息

---

### 3. 删除或过滤产物

```js
delete compilation.assets['unused.js'];
```

用于：

* 裁剪冗余产物
* 移除调试文件
* 按条件输出文件

---

## 五、为什么能直接修改 `assets`？

这是 Webpack 的一个重要设计点：

* `assets` 是**纯内存结构**
* 文件系统写入发生在 `emit` 之后
* Plugin 对 assets 的修改会直接反映到最终输出

因此 Plugin 并不是“改文件”，而是**改即将被写出的内存快照**。

---

## 六、`emit` 与 `processAssets` 的区别（面试加分点）

* `emit`：

  * 粒度粗
  * 所有产物已生成
  * Webpack 4 时代主流

* `processAssets`：

  * Webpack 5 引入
  * 支持多 stage
  * 更利于多个 Plugin 协同工作，避免互相覆盖

在新项目中，更推荐 `processAssets`；但理解 `emit` 依然非常重要，因为它代表了**产物可控的核心边界点**。

</details>

## 12. Vue的Diff为何采用同层比较，而非跨层？ {#question-53cc93d4-4b6d-46fc-a9b4-26d3ef075ea5}

> 题库原题：[Vue的Diff为何采用同层比较，而非跨层？](https://fe.ecool.fun/topic/53cc93d4-4b6d-46fc-a9b4-26d3ef075ea5)

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

## 13. 为何Proxy能解决Vue 2中`Object.defineProperty`的数组监听缺陷？ {#question-09420ad4-4cd0-4c3d-9b56-970e21c8f208}

> 题库原题：[谈谈 Object.defineProperty 与 Proxy 的区别](https://fe.ecool.fun/topic/09420ad4-4cd0-4c3d-9b56-970e21c8f208)

### 题目要点

### Vue2.x 中的双向绑定实现

- **基于**：Vue2.x 的双向绑定是基于 `Object.defineProperty` 实现的。
- **问题**：这种方式存在一些局限性：
  1. **数组监听**：无法直接监听数组的变化，需要重写数组的方法来模拟。
  2. **属性遍历**：需要遍历对象的每个属性来定义属性描述符。
  3. **嵌套对象监听**：需要递归遍历嵌套对象的所有属性。

### Vue3.x 中的双向绑定实现

- **基于**：Vue3.x 使用 `Proxy` 代理的方式实现双向绑定。
- **优势**：
  1. **对象深度监听**：Proxy 可以针对整个对象进行代理，无需遍历每个属性，解决了深度递归的问题。
  2. **数组监听**：Proxy 可以直接监听数组的变化，无需重写数组方法。
  3. **拦截方法**：Proxy 提供更多的拦截方法，如 `get`、`set`、`deleteProperty` 等，使得数据劫持更加灵活。
  4. **性能优化**：Proxy 可能得到浏览器针对性的优化，有助于性能提升。

<details>
<summary>参考答案</summary>

在 Vue2.x 的版本中，双向绑定是基于 Object.defineProperty 方式实现的。而 Vue3.x 版本中，使用了 ES6 中的 Proxy 代理的方式实现。

## Object.defineProperty(obj, prop, descriptor)

使用 Object.defineProperty 会产生三个主要的问题：

* 不能监听数组的变化

在 Vue2.x 中解决数组监听的方法是将能够改变原数组的方法进行重写实现（比如：push、 pop、shift、unshift、splice、sort、reverse），举例：

```javascript
// 我们重写 push 方法
const originalPush = Array.prototype.push

Array.prototype.push = function() {
  // 我们在这个位置就可以进行 数据劫持 了
  console.log('数组被改变了')

  originalPush.apply(this, arguments)
}
```

* 必须遍历对象的每个属性

可以通过 Object.keys() 来实现

* 必须深层遍历嵌套的对象

通过递归深层遍历嵌套对象，然后通过 Object.keys() 来实现对每个属性的劫持

## Proxy

* Proxy 针对的整个对象，Object.defineProperty 针对单个属性，这就解决了 需要对对象进行深度递归（支持嵌套的复杂对象劫持）实现对每个属性劫持的问题

```javascript
// 定义一个复杂对象
const obj = {
    obj: {
        children: {
            a: 1
        }
    }
}

const objProxy = new Proxy(obj, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },

    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(objProxy.obj) // 输出 '-- target --'
console.log(objProxy.a = 2) // 输出 '-- set --'
```

* Proxy 解决了 Object.defineProperty 无法劫持数组的问题

```javascript
const ary = [1, 2, 3]

const aryProxy = new Proxy(ary, {
    get(target, property, receiver){
        console.log('-- target --')
        return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
        console.log('-- set --')
        return Reflect.set(target, property, value, receiver)
    }
})

console.log(aryProxy[0]) // 输出 '-- target --'
console.log(aryProxy.push(1)) // 输出 '-- set --'
```

*  比 Object.defineProperty 有更多的拦截方法，对比一些新的浏览器，可能会对 Proxy 针正对性的优化，有助于性能提升

</details>

## 14. 如何拦截`arr[0] = 1`这类操作 {#question-09829c97-8c72-4436-a05f-f91355630197}

> 题库原题：[如何拦截`arr\[0\] = 1`这类操作](https://fe.ecool.fun/topic/09829c97-8c72-4436-a05f-f91355630197)

### 题目要点

**`arr[0] = 1` 本质是对象属性赋值，ES5 的 `defineProperty` 无法完整拦截动态下标，而 ES6 的 `Proxy` 可以通过 `set` trap 精确感知，因此成为现代响应式系统和状态管理的基础能力。**

<details>
<summary>参考答案</summary>

要拦截 `arr[0] = 1` 这类**通过下标直接修改数组元素的操作**，本质上需要拦截的是：

> **对象属性的 `set` 行为**

在 JavaScript 中，这类操作是否可拦截，取决于使用的是 **ES5 的 `Object.defineProperty`** 体系，还是 **ES6 的 `Proxy`** 体系。

---

## 一、结论先行

* **无法通过 `Object.defineProperty` 完整拦截 `arr[0] = 1`**
* **可以通过 `Proxy` 精确拦截 `arr[0] = 1`**

这也是 Vue2 与 Vue3 在数组响应式能力上的本质差异之一。

---

## 二、为什么 `defineProperty` 做不到

### 1. 数组下标是“动态属性”

```js
arr[0] = 1
```

等价于：

```js
arr['0'] = 1
```

而 `Object.defineProperty` 的限制是：

* 只能拦截**已存在的属性**
* 无法感知**新增属性**
* 无法批量监听所有未知 key

即使提前对 `0、1、2...` 做劫持：

* 无法预知数组未来长度
* `length` 的变化也无法可靠追踪

因此只能通过 **hack 原型方法**（push、splice 等）做“部分覆盖”。

---

### 2. Vue2 的实际策略（背景理解）

Vue2 对数组的处理是：

* 劫持 `push / pop / splice / shift / unshift / sort / reverse`
* 不支持 `arr[index] = value`
* 不支持 `arr.length = n`

这是能力边界，而不是遗漏。

---

## 三、Proxy 如何拦截 `arr[0] = 1`

### 1. 核心原理

`Proxy` 能拦截的是：

> **对象层面的“任意属性访问与修改”**

数组在 JS 中本质上是对象，因此：

```js
arr[0] = 1
```

一定会触发 `set` trap。

---

### 2. 示例实现

```js
const arr = new Proxy([], {
  set(target, key, value, receiver) {
    console.log('set:', key, value);
    return Reflect.set(target, key, value, receiver);
  }
});

arr[0] = 1;       // set: "0" 1
arr.length = 10; // set: "length" 10
```

可拦截的包括：

* 下标赋值
* length 变更
* 动态新增元素

---

## 四、为什么 Proxy 是“完整解法”

对比能力边界：

| 能力        | defineProperty | Proxy |
| --------- | -------------- | ----- |
| 下标赋值      | 不可行            | 可行    |
| 新增属性      | 不可感知           | 可感知   |
| 删除属性      | 不可感知           | 可感知   |
| length 修改 | 不稳定            | 可拦截   |
| 全量代理      | 需要逐个定义         | 一次代理  |

这也是 Vue3 全面转向 Proxy 的根本原因。

---

## 五、工程层面的注意点

### 1. 不要直接修改原数组引用

一旦做了 Proxy：

```js
const raw = [];
const observed = new Proxy(raw, ...);
```

后续逻辑必须**只使用代理对象**，否则拦截会失效。

---

### 2. 避免在 set 中直接操作 target

推荐使用：

```js
Reflect.set(target, key, value, receiver);
```

而不是：

```js
target[key] = value;
```

否则容易破坏 this 绑定和继承语义。

</details>

## 15. 当执行`state.count++`时，从数据修改到视图更新的完整链路是怎样的？ {#question-subjective-bac3c39762d6}

### 题目要点

`state.count++` 会先触发一次 get 用于依赖收集，再触发 set 用于派发更新；get 阶段通过 track 建立属性与组件渲染函数的依赖关系；set 阶段通过 trigger 标记相关 effect 需要更新；更新并非同步执行，而是进入调度队列进行批量合并；最终在微任务中重新执行 render，经过 Virtual DOM Diff 后，仅对必要的 DOM 节点进行最小化更新。

<details>
<summary>参考答案</summary>

以 **Vue3（基于 Proxy 的响应式系统）** 为背景，从执行 `state.count++` 到视图更新，可以把完整链路理解为一条**“写入 → 触发 → 调度 → 重新渲染”**的流水线。下面按真实执行顺序展开。

---

## 一、`state.count++` 在语言层面发生了什么

```js
state.count++
```

并不是一个原子操作，而是被拆解为三步：

1. 读取 `state.count`
2. 计算新值 `count + 1`
3. 将新值写回 `state.count`

也就是说，它同时触发了 **一次 get + 一次 set**。

---

## 二、读取阶段：依赖收集（get → track）

### 1. 触发 Proxy 的 `get`

`state` 是一个 Proxy，当执行读取时：

```js
const value = state.count
```

会进入：

```js
get(target, key, receiver)
```

### 2. 建立依赖关系（track）

在组件渲染阶段，Vue 会设置一个全局的 **activeEffect**（当前正在执行的副作用函数，通常是组件的 render effect）。

`get` 内部会调用：

```js
track(target, key)
```

这一步做的事情是：

* 用 `target + key` 作为索引
* 把当前组件的 render effect 收集进去

形成的数据结构可以抽象为：

```text
target (state)
  └── key: "count"
        └── effects: [ componentRenderEffect ]
```

这一步的结果是：

> **Vue 知道了：这个组件依赖 state.count**

---

## 三、写入阶段：触发更新（set → trigger）

### 1. 触发 Proxy 的 `set`

第三步写回新值时：

```js
state.count = newValue
```

会进入：

```js
set(target, key, value, receiver)
```

### 2. 判断是否真的发生变化

Vue 内部会做一次对比：

* 新值 !== 旧值
* 或者是首次设置

如果值未变化，直接 return，不触发更新。

---

### 3. 触发依赖（trigger）

当确认发生变化后，执行：

```js
trigger(target, key)
```

这一步会：

* 找到 `state.count` 对应的 effects
* 把这些 effect 标记为“需要重新执行”

但**并不会立刻执行 render**。

---

## 四、调度阶段：异步批量更新（scheduler）

### 1. 为什么不立刻更新视图

如果在一次事件中连续执行：

```js
state.count++
state.count++
state.count++
```

如果每次都同步更新视图，会造成：

* 重复渲染
* 性能浪费

因此 Vue 使用了 **调度器（scheduler）**。

---

### 2. effect 进入更新队列

`trigger` 并不是直接调用 effect，而是：

* 把 effect 放入一个 job queue
* 通过 `Promise.then` 创建一个微任务

这一层保证了：

> **同一轮事件循环内，多次状态修改只触发一次渲染**

---

## 五、渲染阶段：组件重新执行 render

### 1. 执行组件的 render effect

在微任务阶段，调度器统一执行队列中的 effect：

```js
componentRenderEffect()
```

这个 effect 会：

* 重新执行 render 函数
* 生成新的 Virtual DOM Tree

---

### 2. Virtual DOM Diff

新旧 VNode 进行 Diff：

* 节点类型是否变化
* 文本是否变化
* props 是否变化

对于 `count`：

```vue
<div>{{ count }}</div>
```

Diff 会发现：

* 文本节点内容发生变化

---

## 六、提交阶段：DOM 更新

最后一步是把 Diff 结果提交到真实 DOM：

* 更新对应的 textNode
* 不重建整个 DOM
* 只修改必要的最小节点

至此，用户看到页面上的数字发生变化。

---

## 七、从宏观角度总结这条链路

可以用一句工程化表述来概括：

> **`state.count++` 通过 Proxy 拦截 set 操作，触发依赖于该属性的 render effect，经调度器合并后重新执行 render，Diff 生成最小 DOM 更新并提交到浏览器。**

</details>

## 16. 动态绑定`v-bind:class="{ active: isActive }"`会被编译成何种JS代码？ {#question-efa108f0-e78a-48e7-b722-e6b67c32a494}

> 题库原题：[Vue3 中，动态绑定v-bind:class="{ active: isActive }"会被编译成什么样的JS代码？](https://fe.ecool.fun/topic/efa108f0-e78a-48e7-b722-e6b67c32a494)

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

## 17. `setup`函数中同步修改响应式数据，会触发子组件的`onBeforeUpdate`吗？为什么？ {#question-e82c31fa-cae7-499a-90a5-2fa56a7c3f59}

> 题库原题：[`setup`函数中同步修改响应式数据，会触发子组件的`onBeforeUpdate`吗？为什么？](https://fe.ecool.fun/topic/e82c31fa-cae7-499a-90a5-2fa56a7c3f59)

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

## 18. 实现一个EventEmitter {#question-9ee51dac-67c2-4181-b9a6-18a10b2a8f95}

> 题库原题：[说说Node中的EventEmitter? 如何实现一个EventEmitter?](https://fe.ecool.fun/topic/9ee51dac-67c2-4181-b9a6-18a10b2a8f95)

### 题目要点

**作答思路**：

Node.js中的`EventEmitter`是一个核心模块，用于实现事件驱动编程。它允许对象拥有多个事件监听器，当事件发生时，会通知所有注册的监听器。
实现一个简单的`EventEmitter`的基本步骤如下：

1. **定义构造函数**：创建一个构造函数，用于创建`EventEmitter`实例。
2. **创建事件监听器数组**：在构造函数内部，创建一个数组来存储事件监听器。
3. **添加事件监听器**：提供一个方法来添加事件监听器，该方法接收事件名称和回调函数。
4. **移除事件监听器**：提供一个方法来移除事件监听器，该方法接收事件名称和回调函数。
5. **触发事件**：提供一个方法来触发事件，该方法接收事件名称和可选的参数。
示例代码：

```javascript
class SimpleEventEmitter {
  constructor() {
    this.events = {};
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }
  off(eventName, callback) {
    if (this.events[eventName]) {
      const index = this.events[eventName].indexOf(callback);
      if (index > -1) {
        this.events[eventName].splice(index, 1);
      }
    }
  }
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(...args));
    }
  }
}
```

使用示例：

```javascript
const eventEmitter = new SimpleEventEmitter();
eventEmitter.on('event', (arg1, arg2) => {
  console.log(`Event triggered with arguments: ${arg1}, ${arg2}`);
});
eventEmitter.emit('event', 'Hello', 'World');
eventEmitter.off('event');
eventEmitter.emit('event', 'Hello', 'World'); // 不会触发事件
```

**考察要点**：

1. **EventEmitter概念**：理解`EventEmitter`的作用和用途。
2. **事件监听器管理**：理解如何添加、移除事件监听器。
3. **事件触发**：理解如何触发事件，以及事件触发时的参数传递。

<details>
<summary>参考答案</summary>

## 一、是什么

我们了解到，`Node `采用了事件驱动机制，而`EventEmitter `就是`Node`实现事件驱动的基础

在`EventEmitter`的基础上，`Node `几乎所有的模块都继承了这个类，这些模块拥有了自己的事件，可以绑定／触发监听器，实现了异步操作

`Node.js` 里面的许多对象都会分发事件，比如 fs.readStream 对象会在文件被打开的时候触发一个事件

这些产生事件的对象都是 events.EventEmitter 的实例，这些对象有一个 eventEmitter.on() 函数，用于将一个或多个函数绑定到命名事件上

## 二、使用方法

`Node `的`events`模块只提供了一个`EventEmitter`类，这个类实现了`Node`异步事件驱动架构的基本模式——观察者模式

在这种模式中，被观察者(主体)维护着一组其他对象派来(注册)的观察者，有新的对象对主体感兴趣就注册观察者，不感兴趣就取消订阅，主体有更新的话就依次通知观察者们

基本代码如下所示：

```js
const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter()

function callback() {
    console.log('触发了event事件！')
}
myEmitter.on('event', callback)
myEmitter.emit('event')
myEmitter.removeListener('event', callback);
```

通过实例对象的`on`方法注册一个名为`event`的事件，通过`emit`方法触发该事件，而`removeListener`用于取消事件的监听

关于其常见的方法如下：

- emitter.addListener/on(eventName, listener) ：添加类型为 eventName 的监听事件到事件数组尾部
- emitter.prependListener(eventName, listener)：添加类型为 eventName 的监听事件到事件数组头部<br>
- emitter.emit(eventName[, ...args])：触发类型为 eventName 的监听事件
- emitter.removeListener/off(eventName, listener)：移除类型为 eventName 的监听事件<br>
- emitter.once(eventName, listener)：添加类型为 eventName 的监听事件，以后只能执行一次并删除<br>
- emitter.removeAllListeners([eventName])： 移除全部类型为 eventName 的监听事件

## 三、实现过程

通过上面的方法了解，`EventEmitter`是一个构造函数，内部存在一个包含所有事件的对象

```js
class EventEmitter {
    constructor() {
        this.events = {};
    }
}
```

其中`events`存放的监听事件的函数的结构如下：

```js
{
  "event1": [f1,f2,f3]，
  "event2": [f4,f5]，
  ...
}
```

然后开始一步步实现实例方法，首先是`emit`，第一个参数为事件的类型，第二个参数开始为触发事件函数的参数，实现如下：

```js
emit(type, ...args) {
    this.events[type].forEach((item) => {
        Reflect.apply(item, this, args);
    });
}
```

当实现了`emit`方法之后，然后实现`on`、`addListener`、`prependListener`这三个实例方法，都是添加事件监听触发函数，实现也是大同小异

```js
on(type, handler) {
    if (!this.events[type]) {
        this.events[type] = [];
    }
    this.events[type].push(handler);
}

addListener(type,handler){
    this.on(type,handler)
}

prependListener(type, handler) {
    if (!this.events[type]) {
        this.events[type] = [];
    }
    this.events[type].unshift(handler);
}
```

紧接着就是实现事件监听的方法`removeListener/on`

```js
removeListener(type, handler) {
    if (!this.events[type]) {
        return;
    }
    this.events[type] = this.events[type].filter(item => item !== handler);
}

off(type,handler){
    this.removeListener(type,handler)
}
```

最后再来实现`once`方法， 再传入事件监听处理函数的时候进行封装，利用闭包的特性维护当前状态，通过`fired`属性值判断事件函数是否执行过

```js
once(type, handler) {
    this.on(type, this._onceWrap(type, handler, this));
  }

  _onceWrap(type, handler, target) {
    const state = { fired: false, handler, type , target};
    const wrapFn = this._onceWrapper.bind(state);
    state.wrapFn = wrapFn;
    return wrapFn;
  }

  _onceWrapper(...args) {
    if (!this.fired) {
      this.fired = true;
      Reflect.apply(this.handler, this.target, args);
      this.target.off(this.type, this.wrapFn);
    }
 }
```

完整代码如下：

```js
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(type, handler) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(handler);
    }

    addListener(type,handler){
        this.on(type,handler)
    }

    prependListener(type, handler) {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].unshift(handler);
    }

    removeListener(type, handler) {
        if (!this.events[type]) {
            return;
        }
        this.events[type] = this.events[type].filter(item => item !== handler);
    }

    off(type,handler){
        this.removeListener(type,handler)
    }

    emit(type, ...args) {
        this.events[type].forEach((item) => {
            Reflect.apply(item, this, args);
        });
    }

    once(type, handler) {
        this.on(type, this._onceWrap(type, handler, this));
    }

    _onceWrap(type, handler, target) {
        const state = { fired: false, handler, type , target};
        const wrapFn = this._onceWrapper.bind(state);
        state.wrapFn = wrapFn;
        return wrapFn;
    }

    _onceWrapper(...args) {
        if (!this.fired) {
            this.fired = true;
            Reflect.apply(this.handler, this.target, args);
            this.target.off(this.type, this.wrapFn);
        }
    }
}
```

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-95/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-95/round-160/index.md" >}}) →
