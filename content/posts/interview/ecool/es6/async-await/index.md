+++
title = "Async/Await"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2025-07-17T00:00:00+08:00'
draft = true
weight = 10
tags = ["面试", "前端", "ES6", "JavaScript", "Async/Await", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## async/await用法

其实你要实现一个东西之前，最好是先搞清楚这两样东西

- 这个东西有什么用？
- 这个东西是怎么用的？

### 有什么用？

`async/await`的用处就是：**用同步方式，执行异步操作**，怎么说呢？举个例子

比如我现在有一个需求：先请求完`接口1`，再去请求`接口2`，我们通常会这么做

```js
function request(num) { // 模拟接口请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num * 2)
    }, 1000)
  })
}

request(1).then(res1 => {
  console.log(res1) // 1秒后 输出 2

  request(2).then(res2 => {
    console.log(res2) // 2秒后 输出 4
  })
})
```

或者我现在又有一个需求：先请求完`接口1`，再拿`接口1`返回的数据，去当做`接口2`的请求参数，那我们也可以这么做

```js
request(5).then(res1 => {
  console.log(res1) // 1秒后 输出 10

  request(res1).then(res2 => {
    console.log(res2) // 2秒后 输出 20
  })
})
```

其实这么做是没问题的，但是如果嵌套的多了，不免有点不雅观，这个时候就可以用`async/await`来解决了

```js
async function fn () {
  const res1 = await request(5)
  const res2 = await request(res1)
  console.log(res2) // 2秒后输出 20
}
fn()
```

### 是怎么用？

还是用刚刚的例子

需求一：

```js
async function fn () {
  await request(1)
  await request(2)
  // 2秒后执行完
}
fn()
```

需求二：

```js
async function fn () {
  const res1 = await request(5)
  const res2 = await request(res1)
  console.log(res2) // 2秒后输出 20
}
fn()
```

![](image-01.webp)

其实就类似于生活中的`排队`，咱们生活中排队买东西，肯定是要上一个人买完，才轮到下一个人。而上面也一样，在`async`函数中，`await`规定了异步操作只能一个一个排队执行，从而达到**用同步方式，执行异步操作**的效果，这里注意了：**await只能在async函数中使用，不然会报错哦**

刚刚上面的例子`await`后面都是跟着异步操作`Promise`，那如果不接`Promise`会怎么样呢？

```js
function request(num) { // 去掉Promise
  setTimeout(() => {
    console.log(num * 2)
  }, 1000)
}

async function fn() {
  await request(1) // 2
  await request(2) // 4
  // 1秒后执行完  同时输出
}
fn()
```

可以看出，如果`await`后面接的不是`Promise`的话，有可能其实是达不到`排队`的效果的

说完`await`，咱们聊聊`async`吧，`async`是一个位于function之前的前缀，只有`async函数`中，才能使用`await`。那`async`执行完是返回一个什么东西呢？

```js
async function fn () {}
console.log(fn) // [AsyncFunction: fn]
console.log(fn()) // Promise {<fulfilled>: undefined}
```

可以看出，`async函数`执行完会自动返回一个状态为`fulfilled`的Promise，也就是成功状态，但是值却是undefined，那要怎么才能使值不是undefined呢？很简单，函数有`return`返回值就行了

```js
async function fn (num) {
  return num
}
console.log(fn) // [AsyncFunction: fn]
console.log(fn(10)) // Promise {<fulfilled>: 10}
fn(10).then(res => console.log(res)) // 10
```

可以看出，此时就有值了，并且还能使用`then方法`进行输出

### 总结

总结一下`async/await`的知识点

- await只能在async函数中使用，不然会报错
- async函数返回的是一个Promise对象，有无值看有无return值
- await后面最好是接Promise，虽然接其他值也能达到排队效果
- async/await作用是**用同步方式，执行异步操作**

## 什么是语法糖？

前面说了，`async/await`是一种`语法糖`，诶！好多同学就会问，啥是`语法糖`呢？我个人理解就是，`语法糖`就是一个东西，这个东西你就算不用他，你用其他手段也能达到这个东西同样的效果，但是可能就没有这个东西这么方便了。

- 举个生活中的例子吧：你走路也能走到北京，但是你坐飞机会更快到北京。
- 举个代码中的例子吧：ES6的`class`也是语法糖，因为其实用普通`function`也能实现同样效果

回归正题，`async/await`是一种`语法糖`，那就说明用其他方式其实也可以实现他的效果，我们今天就是讲一讲怎么去实现`async/await`，用到的是ES6里的`迭代函数——generator函数`

## generator函数

### 基本用法

`generator函数`跟普通函数在写法上的区别就是，多了一个星号`*`，并且只有在`generator函数`中才能使用`yield`，什么是`yield`呢，他相当于`generator函数`执行的`中途暂停点`，比如下方有3个暂停点。而怎么才能暂停后继续走呢？那就得使用到`next方法`，`next方法`执行后会返回一个对象，对象中有`value 和 done`两个属性

- value：暂停点后面接的值，也就是yield后面接的值
- done：是否generator函数已走完，没走完为false，走完为true

```js
function* gen() {
  yield 1
  yield 2
  yield 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: undefined, done: true }
```

可以看到最后一个是undefined，这取决于你generator函数有无返回值

```js
function* gen() {
  yield 1
  yield 2
  yield 3
  return 4
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: 4, done: true }
```

![](image-02.webp)

### yield后面接函数

yield后面接函数的话，到了对应暂停点yield，会马上执行此函数，并且该函数的执行返回值，会被当做此暂停点对象的`value`

```js
function fn(num) {
  console.log(num)
  return num
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next())
// 1
// { value: 1, done: false }
console.log(g.next())
// 2
//  { value: 2, done: false }
console.log(g.next())
// { value: 3, done: true }
```

### yield后面接Promise

前面说了，函数执行返回值会当做暂停点对象的value值，那么下面例子就可以理解了，前两个的value都是pending状态的Promise对象

```js
function fn(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: 3, done: true }
```

![](image-03.webp)

其实我们想要的结果是，两个Promise的结果`1 和 2`，那怎么做呢？很简单，使用Promise的then方法就行了

```js
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后输出 { value: Promise { 1 }, done: false }
  console.log(res1) // 1秒后输出 1

  const next2 = g.next()
  next2.value.then(res2 => {
    console.log(next2) // 2秒后输出 { value: Promise { 2 }, done: false }
    console.log(res2) // 2秒后输出 2
    console.log(g.next()) // 2秒后输出 { value: 3, done: true }
  })
})
```

![](image-04.webp)

### next函数传参

generator函数可以用`next方法`来传参，并且可以通过`yield`来接收这个参数，注意两点

- 第一次next传参是没用的，只有从第二次开始next传参才有用
- next传值时，要记住顺序是，先右边yield，后左边接收参数

```js
function* gen() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g.next(22222))
// 22222
// { value: 3, done: true }
```

![](image-05.webp)

### Promise+next传参

前面讲了

- yield后面接Promise
- next函数传参

那这两个组合起来会是什么样呢？

```js
function fn(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}
function* gen() {
  const num1 = yield fn(1)
  const num2 = yield fn(num1)
  const num3 = yield fn(num2)
  return num3
}
const g = gen()
const next1 = g.next()
next1.value.then(res1 => {
  console.log(next1) // 1秒后同时输出 { value: Promise { 2 }, done: false }
  console.log(res1) // 1秒后同时输出 2

  const next2 = g.next(res1) // 传入上次的res1
  next2.value.then(res2 => {
    console.log(next2) // 2秒后同时输出 { value: Promise { 4 }, done: false }
    console.log(res2) // 2秒后同时输出 4

    const next3 = g.next(res2) // 传入上次的res2
    next3.value.then(res3 => {
      console.log(next3) // 3秒后同时输出 { value: Promise { 8 }, done: false }
      console.log(res3) // 3秒后同时输出 8

       // 传入上次的res3
      console.log(g.next(res3)) // 3秒后同时输出 { value: 8, done: true }
    })
  })
})
```

![](image-06.webp)

## 实现async/await

其实上方的`generator函数`的`Promise+next传参`，就很像`async/await`了，区别在于

- gen函数执行返回值不是Promise，asyncFn执行返回值是Promise
- gen函数需要执行相应的操作，才能等同于asyncFn的排队效果
- gen函数执行的操作是不完善的，因为并不确定有几个yield，不确定会嵌套几次

![](image-07.webp)

那我们怎么办呢？我们可以封装一个高阶函数。什么是`高阶函数`呢？`高阶函数`的特点是：**参数是函数，返回值也可以是函数**。下方的`highorderFn`就是一个`高阶函数`

```js
function highorderFn(函数) {
    // 一系列处理

    return 函数
}
```

我们可以封装一个高阶函数，接收一个generator函数，并经过一系列处理，返回一个具有async函数功能的函数

```js
function generatorToAsync(generatorFn) {
  // 经过一系列处理

  return 具有async函数功能的函数
}
```

### 返回值Promise

之前我们说到，async函数的执行返回值是一个Promise，那我们要怎么实现相同的结果呢

```js
function* gen() {

}

const asyncFn = generatorToAsync(gen)

console.log(asyncFn()) // 期望这里输出 Promise
```

其实很简单，`generatorToAsync函数`里做一下处理就行了

```js
function* gen() {

}
function generatorToAsync (generatorFn) {
  return function () {
    return new Promise((resolve, reject) => {

    })
  }
}

const asyncFn = generatorToAsync(gen)

console.log(asyncFn()) // Promise
```

### 加入一系列操作

咱们把之前的处理代码，加入`generatorToAsync函数`中

```js
function fn(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}
function* gen() {
  const num1 = yield fn(1)
  const num2 = yield fn(num1)
  const num3 = yield fn(num2)
  return num3
}
function generatorToAsync(generatorFn) {
  return function () {
    return new Promise((resolve, reject) => {
      const g = generatorFn()
      const next1 = g.next()
      next1.value.then(res1 => {

        const next2 = g.next(res1) // 传入上次的res1
        next2.value.then(res2 => {

          const next3 = g.next(res2) // 传入上次的res2
          next3.value.then(res3 => {

            // 传入上次的res3
            resolve(g.next(res3).value)
          })
        })
      })
    })
  }
}

const asyncFn = generatorToAsync(gen)

asyncFn().then(res => console.log(res)) // 3秒后输出 8
```

可以发现，咱们其实已经实现了以下的`async/await`的结果了

```js
async function asyncFn() {
  const num1 = await fn(1)
  const num2 = await fn(num1)
  const num3 = await fn(num2)
  return num3
}
asyncFn().then(res => console.log(res)) // 3秒后输出 8
```

### 完善代码

上面的代码其实都是死代码，因为一个async函数中可能有2个await，3个await，5个await ，其实await的个数是不确定的。同样类比，generator函数中，也可能有2个yield，3个yield，5个yield，所以咱们得把代码写成活的才行

```js
function generatorToAsync(generatorFn) {
  return function() {
    const gen = generatorFn.apply(this, arguments) // gen有可能传参

    // 返回一个Promise
    return new Promise((resolve, reject) => {

      function go(key, arg) {
        let res
        try {
          res = gen[key](arg) // 这里有可能会执行返回reject状态的Promise
        } catch (error) {
          return reject(error) // 报错的话会走catch，直接reject
        }

        // 解构获得value和done
        const { value, done } = res
        if (done) {
          // 如果done为true，说明走完了，进行resolve(value)
          return resolve(value)
        } else {
          // 如果done为false，说明没走完，还得继续走

          // value有可能是：常量，Promise，Promise有可能是成功或者失败
          return Promise.resolve(value).then(val => go('next', val), err => go('throw', err))
        }
      }

      go("next") // 第一次执行
    })
  }
}

const asyncFn = generatorToAsync(gen)

asyncFn().then(res => console.log(res))
```

这样的话，无论是多少个yield都会排队执行了，咱们把代码写成活的了

### 示例

`async/await`版本

```js
async function asyncFn() {
  const num1 = await fn(1)
  console.log(num1) // 2
  const num2 = await fn(num1)
  console.log(num2) // 4
  const num3 = await fn(num2)
  console.log(num3) // 8
  return num3
}
const asyncRes = asyncFn()
console.log(asyncRes) // Promise
asyncRes.then(res => console.log(res)) // 8
```

使用`generatorToAsync函数`的版本

```js
function* gen() {
  const num1 = yield fn(1)
  console.log(num1) // 2
  const num2 = yield fn(num1)
  console.log(num2) // 4
  const num3 = yield fn(num2)
  console.log(num3) // 8
  return num3
}

const genToAsync = generatorToAsync(gen)
const asyncRes = genToAsync()
console.log(asyncRes) // Promise
asyncRes.then(res => console.log(res)) // 8
```

## 常见考点

## 一、基本语法与原理

### 1. **定义与作用**

- `async`：声明一个函数为异步函数，返回一个 `Promise`。
- `await`：只能在 `async` 函数中使用，用于等待 `Promise` 的结果。

### 2. **语法示例**

```js
async function fetchData() {
  try {
    const res = await fetch('/api');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
```

### 3. **语法糖本质**

- `async/await` 是基于 **Generator + Promise** 的语法糖，底层依赖 `Promise`。

## 二、执行机制考点

### 1. **执行顺序**

- `async` 函数中的代码会同步执行到第一个 `await`。
- `await` 后的代码会被放入微任务队列，异步执行。

```js
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}
test();
console.log(3); // 输出顺序：1, 3, 2
```

### 2. **错误处理**

- 推荐配合 `try...catch` 使用，优于 `.catch()`。

## 三、常见使用场景

- 异步请求封装
- 顺序执行多个异步操作（替代 `.then()` 链式调用）
- 异步函数中循环控制（for、for...of 支持 `await`）

## 四、与 Promise 的对比考点

| 项目 | Promise | async/await |
| --- | --- | --- |
| 可读性 | 嵌套多时较差 | 更像同步代码，结构清晰 |
| 错误处理 | 通过 `.catch()` 捕获 | 使用 `try...catch` 更自然 |
| 并发控制 | `Promise.all` 支持并发 | 需要手动组合 `await Promise.all()` |
| 调试体验 | 调用栈信息易丢失 | 更好一些，但仍依赖浏览器实现 |

## 五、进阶考察点

### 1. **串行 vs 并行执行**

```js
// 串行（效率低）
await fetchA();
await fetchB();

// 并行（推荐）
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### 2. **await 后接非 Promise**

- `await 123` 会返回 `123`。
- `await` 会将普通值包装成 resolved 的 Promise。

### 3. **在非 async 函数中使用 await 会报错**

```js
// 错误：SyntaxError: await is only valid in async functions
function test() {
  await something();
}
```
