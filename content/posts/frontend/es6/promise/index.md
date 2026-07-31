+++
title = "Promise"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2025-01-07T00:00:00+08:00'
draft = false
weight = 8
tags = ["面试", "前端", "ES6", "JavaScript", "Promise", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
Promise 是在 ES6 出现的新功能，并且是用来优化过去回调函式 callback 的写法。这篇面试详解中会讨论到， promise 是什么、为什么需要有 Promise，以及延伸到 async/await 相关问题。

## 为什么要使用 Promise？

在探讨 Promise 之前，我们先来看一下为什么需要它的出现。

JavaScript 中有一个重要概念 - 异步 (async)，它允许我们在执行耗时任务时，不必等待程式完成，而是继续执行下面的代码，直到任务完成再通知。常用的异步操作有：文件操作、数据库操作、AJAX 以及定时器等。

JavaScript 有两种实现异步的方式：

**第一种：回调函式 callback function**

在 ES6 promise 出现之前，通常使用回调函式 (callback) 实现异步操作。但使用回调函式 callback 存在一个明显的缺点，当需要执行多个异步操作时，代码会不断往内嵌套，这种情况通常被称为「callback 地狱」(callback hell)。

```js
callback(() => {
  console.log("Hello!");
  callback(() => {
    console.log("Hello!");
    callback(() => {
      console.log("Hello!");
      callback(() => {
        console.log("Hello!");
      }, 200);
    }, 200);
  }, 200);
}, 200);
```

而为了解决这种问题，就出现了第二种方法 - promise。

## 什么是 Promise？

上一段提到 Promise 出现的原因，这一段我们来看那到底 Promise 是什么。

Promise 照英文上的意思，是约定、承诺，它代表的意涵是这个约定请求会在未来每个时刻返回数据给调用者。在 MDN 文件中， Promise 是用来表示**一个异步操作的最终完成（或失败）及其结果值**。

### 怎么使用 Promise

Promise 是一个**构造函式**，我们需要透过 new 关键字建立一个 Promise。而 Promise 会接收一个函式作为参数，这个函式又称为 executor，executor 会立即执行。如下方代码，若丢入浏览器开发者工具执行，console 的结果会立刻被打印出来。

```js
new Promise((resolve, reject) => {
  console.log("executor 立即执行"); // executor 立即执行
});
```

而 executor 函式，会再接受另外两个函式参数

- resolve 实现函式：如下方代码，请求成功的例子，正确的时候会调用 resolve 函式，并回传结果。
- reject 拒绝函式：如下方代码，请求失败的例子，失败的时候会调用 reject 函式，并回传结果。

```js
function requestData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === "explainthis.io") {
        resolve("hello welcome to explainthis");
      } else {
        reject("it is not explainthis");
      }
    }, 3000);
  });
}
// 1. 请求成功
requestData("explainthis.io").then((res) => {
  console.log(res); //hello welcome to explainthis
});
//2. 请求失败
requestData("explainthis.com").catch((e) => console.log(e)); //it is not explainthis
```

### Promise 的状态

一个 Promise 一定会处于以下三种状态的其中一种

1. pending：初始状态，执行了 executor，但还在等待中。
2. fulfilled：表示操作完成，执行 resolve 函式。
3. rejected：表示操作失败，执行 reject 函式。

### `then` 的使用

1. 多次调用

延续前段谈到的，异步用第一种 callback 做法很容易有 callback hell 的产生，而使用 Promise 的好处则可以避免这种难以阅读的写法。

Promise 可以用一种链式 (chaining) 的方式将这些异步操作串连，如下方代码范例，我们可以透过 then 来将等完成之后的操作串起。

```js
function requestData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === "explainthis.io") {
        resolve("hello welcome to explainthis");
      } else {
        reject("it is not explainthis");
      }
    }, 3000);
  });
}
requestData("explainthis.io")
  .then((res) => {
    console.log(res); //hello welcome to explainthis
    return 1;
  })
  .then((res) => {
    console.log(res); // 1
    return 2; //hello welcome to explainthis
  })
  .then((res) => {
    console.log(res); // 2
  });
```

1. then 方法可以接受两个参数，一个为成功的回调，另一个为失败的回调

```js
function requestData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === "explainthis.io") {
        resolve("hello welcome to explainthis");
      } else {
        reject("it is not explainthis");
      }
    }, 0);
  });
}
requestData("explainthis.com").then(
  (res) => {
    console.log(res);
  },
  (reason) => {
    console.log(reason);
  }
);
//it is not explainthis
```

### 错误处理

Promise 的一个好处是错误处理，最简单的方式是在加上一个 catch 来捕捉错误，并执行一些错误处理代码。如下方代码，如果请求失败，例如由于网络故障，则 Promise 会被拒绝。在这种情况下，catch 方法将捕获错误，并输出错误讯息。

```js
fetch("https://explainthis.com/data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("oops!", error);
  })
  .finally(() => {
    console.log("close loader");
  });
```

### `finally` 方法

如果有加上 `finally`，那 Promise 状态不论是 fulfilled 还是 rejected 都会需要执行 `finally` 方法。 `finally` 是 Promise 处理流程中一个非常有用的方法，它可以帮助我们在不管 Promise 是否成功的状态下，执行一定必要的操作。

使用情境例如，一进入页面要先从服务器 fetch 资料，等待的同时会显示 loading 的画面，而最后不论是否有拿到资料，我们都需要把 loader 关闭。这时候，关闭 loader 的逻辑，就很适合放在 finally 中。如下方代码：

```js
fetch("https://explainthis.com/data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    console.log("close loader");
  });
```

## 什么是 async/await？

async/await 是一种基于 Promise 之上的语法糖，比 Promise 的写法更像是同步操作。

首先，我们会使用 async 关键字将函式标记为异步函式，异步函式就是指返回值为 Promise 物件的函式。

在异步函式中我们可以调用其他的异步函式，不过不是使用 then()，而是使用 await 语法，await 会等待 Promise 完成之后直接返回最终的结果。

```js
async function getData() {
  const res = await fetch("https://getsomedata");
  const data = await res.json();
  console.log(data);
}
getData();
```

## 常见考点

### 一、Promise的基本概念与状态

1.  **定义与用途**：<br>
  - Promise是什么？它解决了什么问题？
  - Promise在异步编程中的作用和重要性。
2.  **状态管理**：<br>
  - Promise的三种状态（Pending、Fulfilled、Rejected）及其含义。
  - 状态转换的规则：状态只能从Pending变为Fulfilled或Rejected，且一旦转变就不可再更改。

### 二、Promise的API及其使用

1.  **构造函数**：<br>
  - Promise构造函数的参数和执行器函数的作用。
  - 如何使用resolve和reject函数来改变Promise的状态。
2.  **链式调用**：<br>
  - `.then()`方法的使用：成功回调和失败回调的指定。
  - `.catch()`方法的使用：专门用于处理Promise被拒绝的情况。
  - `.finally()`方法（如果面试官提及）：无论Promise成功还是失败，都会执行的回调。
3.  **静态方法**：<br>
  - `Promise.all()`：用于并行执行多个Promise，并等待它们全部完成。
  - `Promise.race()`：用于并行执行多个Promise，并返回第一个完成的Promise的结果。
  - `Promise.allSettled()`：等待所有给定的Promise都成功或失败，并返回一个包含每个Promise结果的对象数组。
  - `Promise.any()`：只要有一个Promise成功，就返回那个已经成功的Promise的结果。
  - `Promise.resolve()`和`Promise.reject()`：快速创建已解决或已拒绝的Promise。

### 三、Promise的错误处理与异常捕获

1.  **错误传播**：<br>
  - 在Promise链中，如果一个`.then()`或`.catch()`中的回调函数抛出错误或返回一个被拒绝的Promise，这个错误会传播到下一个`.catch()`中。
2.  **异常捕获**：<br>
  - 使用`.catch()`方法来捕获Promise链中的错误。
  - 如何在异步操作中正确地捕获和处理异常。

### 四、Promise的实践应用与常见问题

1.  **避免回调地狱**：<br>
  - 通过Promise的链式调用来避免回调函数嵌套过深导致的回调地狱问题。
2.  **并行与串行执行**：<br>
  - 如何使用Promise来并行或串行执行多个异步操作。
3.  **资源管理与清理**：<br>
  - 在Promise链中，如何确保在异步操作完成后正确地释放资源或进行清理工作。
4.  **Promise与async/await的关系**：<br>
  - async/await是基于Promise的语法糖，它使得异步代码看起来更像是同步代码。
  - 如何将Promise转换为async/await风格，并理解其背后的原理。

### 五、手写Promise的实现（高级考点）

1.  **实现原理**：<br>
  - 理解Promise的内部工作原理，包括状态管理、回调函数的存储与调用等。
2.  **代码实现**：<br>
  - 手写一个简单的Promise实现，包括构造函数、`.then()`、`.catch()`等方法的实现。
