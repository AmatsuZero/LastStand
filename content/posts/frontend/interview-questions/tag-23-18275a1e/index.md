+++
title = "选择题 面试题"
draft = false
tags = ["面试", "前端", "选择题", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T05:15:34.566Z"
+++

共 154 道 选择题 面试题。答案默认折叠，便于先自行作答。

## 1. 对以下代码说法正确的是？ {#question-fa065548-704b-4428-b784-6a038acde5b4}

> 难度：1 · 类型：Choice

```js
let arr = [1,2,3,4,5];
let arr2 = [1, , 3];
```

- A. 执行 arr.length = 3，此时数组为 [1,2,3]
- B. 执行 arr[10] = 11，此时 arr.length 为 6
- C. 执行 delete arr[2]，此时 arr.length 为 4，数组为 [1,2,4,5]
- D. arr2.length 的长度为 2

### 题目要点

考察的是数组的length属性：

<details>
<summary>参考答案</summary>

**正确答案：A**
考察的是数组的length属性：

- 设置数组的length值为小于当前值的非负整数n，则任何索引大于或等于n的数组元素都会从数组中被删除
- 如果给一个索引为i​的数组元素赋值，而i大于或等于数组当前的length，则数组的length属性会被设 置为i+1​
- 对数组元素使用delete操作符不会修改length属性，使用splice()​会
- 如果省略数组字面量中的一个值，被省略的元素是不存在的，但它的索引是存在的

</details>

## 2. 下列哪些不可以实现浏览器存储数据？ {#question-96eb9035-e189-4403-a370-eccca4a16345}

> 难度：1 · 类型：Choice

- A. cookie
- B. localStorage
- C. session
- D. sessionStorage

### 题目要点

session 不是浏览器端 API，指的是服务端会话机制，不能直接用于浏览器存储

<details>
<summary>参考答案</summary>

**正确答案：C**
session 不是浏览器端 API，指的是服务端会话机制，不能直接用于浏览器存储

</details>

## 3. 下面不可以继承的属性有哪些？ {#question-ae19c36b-5312-4299-b371-8c61e96cbb8d}

> 难度：1 · 类型：Choice

- A. font-size
- B. background
- C. color
- D. cursor

### 题目要点

默认继承的 ("Inherited: Yes") 的属性：

<details>
<summary>参考答案</summary>

**正确答案：B**
默认继承的 ("Inherited: Yes") 的属性：

- 所有元素默认继承：visibility、cursor
- 文本属性默认继承：letter-spacing、word-spacing、white-space、line-height、color、font、 font-family、font-size、font-style、font-variant、font-weight、text-indent、text-align、text-shadow、text-transform、direction
- 列表元素默认继承：list-style、list-style-type、list-style-position、list-style-image
- 表格元素默认继承：border-collapse

默认不继承的("Inherited: No") 的属性：

- 所有元素默认不继承：all、display、overflow、contain
- 文本属性默认不继承：vertical-align、text-decoration、text-overflow
- 盒子属性默认不继承：width、height、padding、margin、border、min-width、min-height、max-width、max-height
- 背景属性默认不继承：background、background-color、background-image、background-repeat、background-position、background-attachment
- 定位属性默认不继承：float、clear、position、top、right、bottom、left、z-index
- 内容属性默认不继承：content、counter-reset、counter-increment
- 轮廓属性默认不继承：outline-style、outline-width、outline-color、outline
- 页面属性默认不继承：size、page-break-before、page-break-after
- 声音属性默认不继承：pause-before、pause-after、pause、cue-before、cue-after、cue、play-during

</details>

## 4. 在点击p标签时，会输出什么？ {#question-70dbc6db-7714-4ba9-9913-cf8cc2a444f7}

> 难度：1 · 类型：Choice

```html
<div onclick="console.log('div')">
  <p onclick="console.log('p')">
    Click here!
  </p>
</div>
```

- A. p div
- B. div p
- C. p
- D. div

### 题目要点

在事件传播过程中，有3个阶段：**捕获**、**目标**和**冒泡**。

<details>
<summary>参考答案</summary>

**正确答案：A**
在事件传播过程中，有3个阶段：**捕获**、**目标**和**冒泡**。

默认情况下，事件处理程序在冒泡阶段执行（除非将 `useCapture` 设置为 `true`），它从最深的嵌套元素向外。

</details>

## 5. 在点击 button 时，触发的 event.target 是哪个？ {#question-51f267dd-1550-48e2-9710-7cc8103dcc41}

> 难度：1 · 类型：Choice

```html
<div onclick="console.log('first div')">
  <div onclick="console.log('second div')">
    <button onclick="console.log('button')">
      Click!
    </button>
  </div>
</div>
```

- A. 最外层div
- B. 第二层的div
- C. button
- D. 上面三个元素

### 题目要点

event.target 是触发事件的对象 (某个DOM元素) 的引用。

<details>
<summary>参考答案</summary>

**正确答案：C**
event.target 是触发事件的对象 (某个DOM元素) 的引用。

当事件处理程序在事件的冒泡或捕获阶段被调用时，它与event.currentTarget不同。

</details>

## 6. 输出什么? {#question-f1a7b0d9-bb14-4d85-97e2-a1668c60098c}

> 难度：1 · 类型：Choice

```javascript
let randomValue = { name: "Lydia" }
randomValue = 23

if (!typeof randomValue === "string") {
    console.log("It's not a string!")
} else {
    console.log("Yay it's a string!")
}
```

- A. It's not a string!
- B. Yay it's a string!
- C. TypeError
- D. undefined

### 题目要点

`if` 语句的条件判断 `!typeof randomValue` 的值是否等于 `"string"`。 `!` 操作符将这个值转化为一个布尔值。如果值是truthy的话，返回值会是 `false`，如果值是falsy，返回值会是 `true`。在这里， `typeof randomValue` 的返回值是一个truthy值 `"number"`，意味着 `!typeof randomValue` 的值是一个布尔值 `false`。 `!typeof randomValue…

<details>
<summary>参考答案</summary>

**正确答案：B**
`if` 语句的条件判断 `!typeof randomValue` 的值是否等于 `"string"`。 `!` 操作符将这个值转化为一个布尔值。如果值是truthy的话，返回值会是 `false`，如果值是falsy，返回值会是 `true`。在这里， `typeof randomValue` 的返回值是一个truthy值 `"number"`，意味着 `!typeof randomValue` 的值是一个布尔值 `false`。
 `!typeof randomValue === "string"` 总是返回false，因为我们实际上是在执行 `false === "string"`。因为条件返回的是 `false`，所以 `else` 语句中的代码块会被运行，因此打印 `Yay it's a string!` 。

</details>

## 7. 输出什么? {#question-a84229a5-810b-463d-9d53-d22fc59fc528}

> 难度：1 · 类型：Choice

```javascript
const createMember = ({ email, address = {}}) => {
    const validEmail = /.+\@.+\..+/.test(email)
    if (!validEmail) throw new Error("Valid email pls")

    return {
        email,
        address: address ? address : null
    }
}

const member = createMember({ email: "my@email.com" })
console.log(member)
```

- A. { email: "my@email.com", address: null }
- B. { email: "my@email.com" }
- C. { email: "my@email.com", address: {} }
- D. { email: "my@email.com", address: undefined }

### 题目要点

`address` 的默认值是一个空对象 `{}`。当我们设置 `member` 变量为 `createMember` 函数返回的对象，我们没有为address参数传值，意味着address的值为默认的空对象 `{}`。一个空对象是一个truthy值，意味着 `address ? address : null` 条件会返回 `true`。address的值为空对象 `{}`。

<details>
<summary>参考答案</summary>

**正确答案：C**
`address` 的默认值是一个空对象 `{}`。当我们设置 `member` 变量为 `createMember` 函数返回的对象，我们没有为address参数传值，意味着address的值为默认的空对象 `{}`。一个空对象是一个truthy值，意味着 `address ? address : null` 条件会返回 `true`。address的值为空对象 `{}`。

</details>

## 8. method 的值选择哪个时，会输出 { name: "Lydia", age: 22 } ? {#question-c08daadf-ef79-48b0-8cda-3ab379624fa5}

> 难度：1 · 类型：Choice

```javascript
const keys = ["name", "age"]
const values = ["Lydia", 22]

const method = /* ?? */
Object[method](keys.map((_, i) => {
    return [keys[i], values[i]]
})) // { name: "Lydia", age: 22 }
```

- A. entries
- B. values
- C. fromEntries
- D. forEach

### 题目要点

`fromEntries` 方法可以将二维数组转换为对象。在每个子数组的第一个元素是key，在每个子数组的第二个元素是value。在这个例子中，我们映射了 `keys` 数组，它返回了一个数组，数组的第一个元素为keys数组当前索引的值，第二个元素为values数组当前索引的值。 这样就创建了一个包含正确keys和values的子数组的数组，因此结果为`{ name: "Lydia", age: 22 }`。

<details>
<summary>参考答案</summary>

**正确答案：C**
`fromEntries` 方法可以将二维数组转换为对象。在每个子数组的第一个元素是key，在每个子数组的第二个元素是value。在这个例子中，我们映射了 `keys` 数组，它返回了一个数组，数组的第一个元素为keys数组当前索引的值，第二个元素为values数组当前索引的值。
这样就创建了一个包含正确keys和values的子数组的数组，因此结果为`{ name: "Lydia", age: 22 }`。

</details>

## 9. 输出什么? {#question-849fda3c-2d6b-4192-8ea3-d8bc23541599}

> 难度：0.5 · 类型：Choice

```javascript
const promise1 = Promise.resolve('First')
const promise2 = Promise.resolve('Second')
const promise3 = Promise.reject('Third')
const promise4 = Promise.resolve('Fourth')

const runPromises = async () => {
    const res1 = await Promise.all([promise1, promise2])
    const res2  = await Promise.all([promise3, promise4])
    return [res1, res2]
}

runPromises()
    .then(res => console.log(res))
    .catch(err => console.log(err))
```

- A. [['First', 'Second'], ['Fourth']]
- B. [['First', 'Second'], ['Third', 'Fourth']]
- C. [['First', 'Second']]
- D. 'Third'

### 题目要点

`Promise.all` 方法可以并行式运行promise。如果其中一个promise失败了，`Promise.all` 方法会带上被reject的promise的值_rejects_。在这个例子中， `promise3` 带着 `"Third"` 值reject。我们在调用 `runPromises` 时在 `runPromises` 函数内部的 `catch` 方法去捕获任意error从而捕获到被reject的值。因为 `promise3` 带着 `"Third"` 被…

<details>
<summary>参考答案</summary>

**正确答案：D**
`Promise.all` 方法可以并行式运行promise。如果其中一个promise失败了，`Promise.all` 方法会带上被reject的promise的值_rejects_。在这个例子中， `promise3` 带着 `"Third"` 值reject。我们在调用 `runPromises` 时在 `runPromises` 函数内部的 `catch` 方法去捕获任意error从而捕获到被reject的值。因为 `promise3` 带着 `"Third"` 被reject，所以只有 `"Third"` 打印。

</details>

## 10. 输出什么? {#question-b77c84b0-6353-4eaa-ad71-6b75df79b94c}

> 难度：0.5 · 类型：Choice

```javascript
const user = {
    email: "my@email.com",
    updateEmail: email => {
        this.email = email
    }
}

user.updateEmail("new@email.com")
console.log(user.email)
```

- A. my@email.com
- B. new@email.com
- C. undefined
- D. ReferenceError

### 题目要点

`updateEmail` 函数是一个箭头函数，它没有和 `user` 对象绑定。这就意味着 `this` 关键字不会引用到 `user` 对象，但是会引用到全局对象。 `user` 对象内部的 `email` 的值不会更新。当打印 `user.email` 的时候， 原始值 `my@email.com` 被返回。

<details>
<summary>参考答案</summary>

**正确答案：A**
`updateEmail` 函数是一个箭头函数，它没有和 `user` 对象绑定。这就意味着 `this` 关键字不会引用到 `user` 对象，但是会引用到全局对象。 `user` 对象内部的 `email` 的值不会更新。当打印 `user.email` 的时候， 原始值 `my@email.com` 被返回。

</details>

## 11. 输出什么? {#question-321642db-58ca-47ab-9d2a-9cebc24a9bb1}

> 难度：0.5 · 类型：Choice

```javascript
const animals = {};
let dog = { emoji: '🐶' }
let cat = { emoji: '🐈' }

animals[dog] = { ...dog, name: "Mara" }
animals[cat] = { ...cat, name: "Sara" }

console.log(animals[dog])
```

- A. { emoji: "🐶", name: "Mara" }
- B. { emoji: "🐈", name: "Sara" }
- C. undefined
- D. ReferenceError

### 题目要点

对象的键会被转换为字符串。 因为 `dog` 的值是一个对象， `animals[dog]` 实际上意味着我们创建了一个叫做 `"object Object"` 的属性来代表新的对象。 `animals["object Object"]` 现在等于 `{ emoji: "🐶", name: "Mara"}`。 `cat` 也是一个对象，`animals[cat]` 实际上意味着我们在用新的cat的属性覆盖 `animals[``"``object Object``"``]` …

<details>
<summary>参考答案</summary>

**正确答案：B**
对象的键会被转换为字符串。
因为  `dog` 的值是一个对象，   `animals[dog]` 实际上意味着我们创建了一个叫做 `"object Object"` 的属性来代表新的对象。  `animals["object Object"]` 现在等于 `{ emoji: "🐶", name: "Mara"}`。
`cat` 也是一个对象，`animals[cat]` 实际上意味着我们在用新的cat的属性覆盖  `animals[``"``object Object``"``]` 的值。
打印  `animals[dog]`，实际上是`animals["object Object"]`，这是因为转化`dog`对象为一个字符串结果 `"object Object"` ，所以返回 `{ emoji: "🐈", name: "Sara" }`。

</details>

## 12. 输出什么? {#question-6836d3b0-9007-4946-a113-cc77fe8d8ace}

> 难度：0.5 · 类型：Choice

```javascript
const fruit = ['🍌', '🍊', '🍎']

fruit.slice(0, 1)
fruit.splice(0, 1)
fruit.unshift('🍇')

console.log(fruit)
```

- A. ['🍌', '🍊', '🍎']
- B. ['🍊', '🍎']
- C. ['🍇', '🍊', '🍎']
- D. ['🍇', '🍌', '🍊', '🍎']

### 题目要点

首先，我们在fruit数组上调用 `slice` 方法。 slice方法不会修改原始数组，但是会返回从数组切片下来的值：香蕉emoji。 其次，我们在fruit数组上调用 `splice` 方法。 splice方法会修改原始数组，也就意味着fruit数组此时为 `['🍊', '🍎']`。 最后，我们在fruit数组上调用 `unshift` 方法，通过添加一个值的方式改变了原始数组，添加的是'🍇'，它成为了数组的第一个元素。现在fruit数组的组成为 `['🍇', '🍊', …

<details>
<summary>参考答案</summary>

**正确答案：C**
首先，我们在fruit数组上调用 `slice` 方法。 slice方法不会修改原始数组，但是会返回从数组切片下来的值：香蕉emoji。
其次，我们在fruit数组上调用 `splice` 方法。 splice方法会修改原始数组，也就意味着fruit数组此时为 `['🍊', '🍎']`。
最后，我们在fruit数组上调用 `unshift` 方法，通过添加一个值的方式改变了原始数组，添加的是'🍇'，它成为了数组的第一个元素。现在fruit数组的组成为 `['🍇', '🍊', '🍎']`。

</details>

## 13. 输出什么? {#question-7483f06b-131e-43cd-b01b-96e3621a59f8}

> 难度：0.5 · 类型：Choice

```javascript
const user = {
    email: "e@mail.com",
    password: "12345"
}

const updateUser = ({ email, password }) => {
    if (email) {
        Object.assign(user, { email })
    }

    if (password) {
        user.password = password
    }

    return user
}

const updatedUser = updateUser({ email: "new@email.com" })

console.log(updatedUser === user)
```

- A. false
- B. true
- C. TypeError
- D. ReferenceError

### 题目要点

`updateUser` 函数更新user的 `email` 和 `password` 属性的值， 如果它们的值传入函数， 函数返回的就是 `user` 对象。 `updateUser` 函数的返回值是 `user` 对象，意味着updatedUser的值与 `user` 指向的是同一个 `user` 对象。`updatedUser === user` 为 `true`.

<details>
<summary>参考答案</summary>

**正确答案：B**
`updateUser` 函数更新user的 `email` 和 `password` 属性的值， 如果它们的值传入函数， 函数返回的就是 `user` 对象。 `updateUser` 函数的返回值是 `user` 对象，意味着updatedUser的值与 `user` 指向的是同一个 `user` 对象。`updatedUser === user` 为 `true`.

</details>

## 14. 输出什么？ {#question-1e8328ad-0ecd-428e-862c-a75c50e1a205}

> 难度：0.5 · 类型：Choice

```javascript
class Calc {
    constructor() {
        this.count = 0
    }

    increase() {
        this.count ++
    }
}

const calc = new Calc()
new Calc().increase()

console.log(calc.count)
```

- A. 0
- B. 1
- C. undefined
- D. ReferenceError

### 题目要点

我们设置 `calc` 变量为 `Calc` 类的一个新实例。 然后，我们初始化一个 `Calc` 的新实例，而且调用了这个实例的 `increase` 方法。因为count属性是在 `Calc` class的constructor内部的，所以count属性不会在 `Calc` 的原型链上共享出去。这就意味着calc实例的count值不会被更新，count仍然是 `0`。

<details>
<summary>参考答案</summary>

**正确答案：A**
我们设置 `calc` 变量为 `Calc` 类的一个新实例。 然后，我们初始化一个 `Calc` 的新实例，而且调用了这个实例的 `increase` 方法。因为count属性是在 `Calc` class的constructor内部的，所以count属性不会在 `Calc` 的原型链上共享出去。这就意味着calc实例的count值不会被更新，count仍然是 `0`。

</details>

## 15. 输出是什么？ {#question-91d69ce5-0958-4c4c-b181-ef99c58aa053}

> 难度：0.5 · 类型：Choice

```javascript
function getFruit(fruits) {
    console.log(fruits?.[1]?.[1])
}

getFruit([['🍊', '🍌'], ['🍍']])
getFruit()
getFruit([['🍍'], ['🍊', '🍌']])
```

- A. null, undefined, 🍌
- B. [], null, 🍌
- C. [], [], 🍌
- D. undefined, undefined, 🍌

### 题目要点

`?` 允许我们去选择性地访问对象内部更深层的嵌套属性。 我们尝试打印 `fruits` 数组索引值为 `1` 的子数组内部的索引值为 `1` 的元素。 如果在 `fruits` 数组索引值 为 `1` 的位置不存在元素，会直接返回 `undefined`。 如果 `fruits` 数组在索引值为 `1` 的位置存在元素，但是子数组在索引值为 `1` 的位置不存在元素，也会返回 `undefined`。 首先，我们尝试打印 `[['🍊', '🍌'], ['🍍']]` 的子数组…

<details>
<summary>参考答案</summary>

**正确答案：D**
`?` 允许我们去选择性地访问对象内部更深层的嵌套属性。 我们尝试打印 `fruits` 数组索引值为 `1` 的子数组内部的索引值为 `1` 的元素。 如果在 `fruits` 数组索引值 为 `1` 的位置不存在元素，会直接返回 `undefined`。 如果 `fruits` 数组在索引值为 `1` 的位置存在元素，但是子数组在索引值为 `1` 的位置不存在元素，也会返回 `undefined`。
首先，我们尝试打印 `[['🍊', '🍌'], ['🍍']]` 的子数组 `['🍍']` 的第2个元素。这个子数组只包含一个元素，也就意味着在索引值为 `1` 的位置不存在元素，所以返回的是 `undefined` 。
其次，我们在没有传入任何参数调用了 `getFruits` 函数，也就意味着形参 `fruits` 的默认值为`undefined`。因为我们选择性地链接了 `fruits` 在索引值为 `1` 的元素，因为在索引值为 `1` 的位置不存在元素，因此返回的是 `undefined` 。
最后，我们尝试打印 `['🍍'], ['🍊', '🍌']` 的子数组 `['🍊', '🍌']` 的第2个元素。子数组索引值为 `1`的位置为 `🍌` ，因此它被打印出了。

</details>

## 16. 输出什么？ {#question-a0908792-bdd8-4de6-bb2e-3480a753c3d3}

> 难度：0.5 · 类型：Choice

```javascript
let count = 0;
const nums = [0, 1, 2, 3];

nums.forEach(num => {
    if (num) count += 1
})

console.log(count)
```

- A. 1
- B. 2
- C. 3
- D. 4

### 题目要点

在 `forEach` 循环内部的 `if` 会判断 `num` 的值是truthy或者是falsy。因为 `nums` 数组的第一个数字是 `0`，一个falsy值， `if` 语句代码块不会被执行。`count` 仅仅在 `nums` 数组的其他3个数字 `1`，`2`，`3` 时加1。因为 `count` 执行了3次加 `1` 运算，所以 `count` 的值为 `3`。

<details>
<summary>参考答案</summary>

**正确答案：C**
在 `forEach` 循环内部的 `if` 会判断 `num` 的值是truthy或者是falsy。因为 `nums` 数组的第一个数字是 `0`，一个falsy值， `if` 语句代码块不会被执行。`count` 仅仅在 `nums` 数组的其他3个数字 `1`，`2`，`3` 时加1。因为 `count` 执行了3次加 `1` 运算，所以 `count` 的值为 `3`。

</details>

## 17. 向对象 person 添加什么时，可以通过执行 [...person] 获得类似 ["Lydia Hallie", 21] 的输出？ {#question-8313f0e7-db8e-4ecd-bf57-099dca7656fb}

> 难度：2 · 类型：Choice

```javascript
const person = {
  name: "Lydia Hallie",
  age: 21
}

[...person] // ["Lydia Hallie", 21]
```

- A. 不需要，对象默认就是可迭代的
- B. *[Symbol.iterator]() { for (let x in this) yield this[x] }
- C. *[Symbol.iterator]() { for (let x in this) yield* Object.values(this) }
- D. *[Symbol.iterator]() { for (let x in this) yield this }

### 题目要点

对象默认并不是可迭代的。

<details>
<summary>参考答案</summary>

**正确答案：B**
对象默认并不是可迭代的。

如果迭代规则被定义，则一个对象是可迭代的（An iterable is an iterable if the iterator protocol is present）。

我们可以通过添加迭代器symbol `[Symbol.iterator]` 来定义迭代规则，其返回一个 generator 对象，比如说构建一个 generator 函数 `*[Symbol.iterator]() {}`。

如果我们想要返回数组 `["Lydia Hallie", 21]`: `yield* Object.values(this)`，这个 generator 函数一定要 yield 对象 `person` 的 values 。

另外，本题还需要注意的一个点：

* yield 关键字用来暂停和恢复一个生成器函数（function*）
* yield* 表达式用于委托给另一个 generator 或可迭代对象。

```js
const person = {
  name: 'lzh',
  age: 21
}

// 方法一
person[Symbol.iterator] = function* () {
    yield* Object.values(this)
}

// 方法二
person[Symbol.iterator] = function* () {
  for (let x in this) {
    yield this[x]
  }
}

console.log([...person]); //['lzh', 21]
```

</details>

## 18. 哪一个选项会导致报错？ {#question-5c7d7b86-addd-4e6c-92c7-5cf7bd0a6092}

> 难度：1 · 类型：Choice

```javascript
const emojis = ["🎄", "🎅🏼", "🎁", "⭐"];

/* 1 */ emojis.push("🦌");
/* 2 */ emojis.splice(0, 2);
/* 3 */ emojis = [...emojis, "🥂"];
/* 4 */ emojis.length = 0;
```

- A. 1
- B. 1 and 2
- C. 3 and 4
- D. 3

### 题目要点

`const` 关键字意味着我们不能 _重定义_ 变量中的值，它 _仅可读_。而然，值本身不可修改。数组 `emojis` 中的值可被修改，如 push 新的值, 拼接，又或者将数组的长度设置为0。

<details>
<summary>参考答案</summary>

**正确答案：D**
`const` 关键字意味着我们不能 _重定义_ 变量中的值，它 _仅可读_。而然，值本身不可修改。数组 `emojis` 中的值可被修改，如 push 新的值, 拼接，又或者将数组的长度设置为0。

</details>

## 19. 输出什么？ {#question-a7afe475-998a-4be3-97a0-c8c7ccabd6e6}

> 难度：0.5 · 类型：Choice

```javascript
class Bird {
    constructor() {
        console.log("I'm a bird. 🦢");
    }
}

class Flamingo extends Bird {
    constructor() {
        console.log("I'm pink. 🌸");
        super();
    }
}

const pet = new Flamingo();
```

- A. I'm pink. 🌸
- B. I'm pink. 🌸 I'm a bird. 🦢
- C. I'm a bird. 🦢 I'm pink. 🌸
- D. Nothing, we didn't call any method

### 题目要点

我们创建了类 `Flamingo` 的实例 `pet`。

<details>
<summary>参考答案</summary>

**正确答案：B**
我们创建了类 `Flamingo` 的实例 `pet`。

当我们实例化这个实例，`Flamingo` 中的 `constructor` 被调用。

首先，输出 `"I'm pink. 🌸"`, 之后我们调用`super()`。`super()` 调用父类的构造函数，`Bird`。`Bird` 的构造函数被调用，并输出 `"I'm a bird. 🦢"`。

</details>

## 20. 输出什么？ {#question-aa20fdd3-2a4b-44a6-a97b-7bdbc6dd30d4}

> 难度：0.5 · 类型：Choice

```javascript
const person = {
    name: "Lydia Hallie",
    hobbies: ["coding"]
};

function addHobby(hobby, hobbies = person.hobbies) {
    hobbies.push(hobby);
    return hobbies;
}

addHobby("running", []);
addHobby("dancing");
addHobby("baking", person.hobbies);

console.log(person.hobbies);
```

- A. ["coding"]
- B. ["coding", "dancing"]
- C. ["coding", "dancing", "baking"]
- D. ["coding", "running", "dancing", "baking"]

### 题目要点

函数 `addHobby` 接受两个参数，`hobby` 和 `hobbies`，其中 `hobbies` 的默认值是 `person` 对象中的 `hobbies` 属性。

<details>
<summary>参考答案</summary>

**正确答案：C**
函数 `addHobby` 接受两个参数，`hobby` 和 `hobbies`，其中 `hobbies` 的默认值是 `person` 对象中的 `hobbies` 属性。

首先，我们调用函数 `addHobby`，并给 `hobby` 传递 `"running"` 以及给 `hobbies` 传递一个空数组。因为我们给 `hobbies` 传递了空数组，`"running"` 被添加到这个空数组，该操作不影响 `person` 对象中的 `hobbies` 属性。

然后，我们调用函数 `addHobby`，并给 `hobby` 传递 `"dancing"`。我们不向 `hobbies` 传递值，因此它获取其默认值 —— 对象 `person` 的属性 `hobbies`。我们向数组 `person.hobbies` push `dancing`。

最后，我们调用函数 `addHobby`，并向 `hobby` 传递值 `"baking"`，并且向 `hobbies` 传递 `person.hobbies`。我们向数组 `person.hobbies` push `dancing`。

pushing `dancing` 和 `baking` 之后，`person.hobbies` 的值为 `["coding", "dancing", "baking"]`

</details>

## 21. 选择哪一个？ {#question-b586c729-13ac-45ae-807c-8a7a0a23c7a4}

> 难度：0.5 · 类型：Choice

```javascript
const teams = [
    { name: "Team 1", members: ["Paul", "Lisa"] },
    { name: "Team 2", members: ["Laura", "Tim"] }
];

function* getMembers(members) {
    for (let i = 0; i < members.length; i++) {
        yield members[i];
    }
}

function* getTeams(teams) {
    for (let i = 0; i < teams.length; i++) {
        // ✨ SOMETHING IS MISSING HERE ✨
    }
}

const obj = getTeams(teams);
obj.next(); // { value: "Paul", done: false }
obj.next(); // { value: "Lisa", done: false }
```

- A. yield getMembers(teams[i].members)
- B. yield* getMembers(teams[i].members)
- C. return getMembers(teams[i].members)
- D. return yield getMembers(teams[i].members)

### 题目要点

为了遍历 `teams` 数组中对象的属性 `members` 中的每一项，我们需要将 `teams[i].members` 传递给 Generator 函数 `getMembers`。Generator 函数返回一个 generator 对象。为了遍历这个 generator 对象中的每一项，我们需要使用 `yield*`. 如果我们没有写 `yield`，`return yield` 或者 `return`，整个 Generator 函数不会第一时间 return 当我们…

<details>
<summary>参考答案</summary>

**正确答案：B**
为了遍历 `teams` 数组中对象的属性 `members` 中的每一项，我们需要将 `teams[i].members` 传递给 Generator 函数 `getMembers`。Generator 函数返回一个 generator 对象。为了遍历这个 generator 对象中的每一项，我们需要使用 `yield*`.
如果我们没有写 `yield`，`return yield` 或者 `return`，整个 Generator 函数不会第一时间 return 当我们调用 `next` 方法.

</details>

## 22. 输出是什么？ {#question-cb23ddfc-db2e-4d2a-b859-9238d30daed9}

> 难度：1 · 类型：Choice

```javascript
class Counter {
  #number = 10

  increment() {
    this.#number++
  }

  getNum() {
    return this.#number
  }
}

const counter = new Counter()
counter.increment()

console.log(counter.#number)
```

- A. 10
- B. 11
- C. undefined
- D. SyntaxError

### 题目要点

在 ES2020 中，通过 `#` 我们可以给 class 添加私有变量。在 class 的外部我们无法获取该值。当我们尝试输出 `counter.#number`，语法错误被抛出：我们无法在 class `Counter` 外部获取它!

<details>
<summary>参考答案</summary>

**正确答案：D**
在 ES2020 中，通过 `#` 我们可以给 class 添加私有变量。在 class 的外部我们无法获取该值。当我们尝试输出 `counter.#number`，语法错误被抛出：我们无法在 class `Counter` 外部获取它!

## 注意

有同学反馈，上面的代码在 Chrome console里，是可以打印出 `11` 这个值的，测试之后确实能看到，这一点在MDN上也有明确说明（**只在Chrome的console控制台里，才能够访问到私有属性，这是为了开发调试的便利**）：

>Note: Code run in the Chrome console can access private properties outside the class. This is a DevTools-only relaxation of the JavaScript syntax restriction.

MDN链接：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties#description

</details>

## 23. 输出什么？ {#question-1ddb78cb-2581-4995-8c0e-a6ea22b564ca}

> 难度：1 · 类型：Choice

```javascript
const add = x => x + x;

function myFunc(num = 2, value = add(num)) {
    console.log(num, value);
}

myFunc();
myFunc(3);
```

- A. 2 4 and 3 6
- B. 2 NaN and 3 NaN
- C. 2 Error and 3 6
- D. 2 4 and 3 Error

### 题目要点

首先我们不传递任何参数调用 `myFunc()`。因为我们没有传递参数，`num` 和 `value` 获取它们各自的默认值：num 为 `2`, 而 `value` 为函数 `add` 的返回值。对于函数 `add`，我们传递值为2的 `num` 作为参数。函数 `add` 返回 `4` 作为 `value` 的值。 然后，我们调用 `myFunc(3)` 并传递值 `3` 参数 `num` 的值。我们没有给 `value` 传递值。因为我们没有给参数 `value` 传递…

<details>
<summary>参考答案</summary>

**正确答案：A**
首先我们不传递任何参数调用 `myFunc()`。因为我们没有传递参数，`num` 和 `value` 获取它们各自的默认值：num 为 `2`, 而 `value` 为函数 `add` 的返回值。对于函数 `add`，我们传递值为2的 `num` 作为参数。函数 `add` 返回 `4` 作为 `value` 的值。
然后，我们调用 `myFunc(3)` 并传递值 `3` 参数 `num` 的值。我们没有给 `value` 传递值。因为我们没有给参数 `value` 传递值，它获取默认值：函数 `add` 的返回值。对于函数 `add`，我们传递值为3的 `num`给它。函数 `add` 返回 `6` 作为 `value` 的值。

</details>

## 24. 以下哪一项会对对象 `person` 有副作用？ {#question-6612daa5-7854-4379-bdb9-46398ef4f87c}

> 难度：0.5 · 类型：Choice

```javascript
const person = {
    name: "Lydia Hallie",
    address: {
        street: "100 Main St"
    }
};

Object.freeze(person);
```

- A. person.name = "Evan Bacon"
- B. delete person.address
- C. person.address.street = "101 Main St"
- D. person.pet = { name: "Mara" }

### 题目要点

使用方法 `Object.freeze` 对一个对象进行 _冻结_。不能对属性进行添加，修改，删除。 然而，它仅 对对象进行 _浅_ 冻结，意味着只有 对象中的 _直接_ 属性被冻结。如果属性是另一个 object，像案例中的 `address`，`address` 中的属性没有被冻结，仍然可以被修改。

<details>
<summary>参考答案</summary>

**正确答案：C**
使用方法 `Object.freeze` 对一个对象进行 _冻结_。不能对属性进行添加，修改，删除。
然而，它仅 对对象进行 _浅_ 冻结，意味着只有 对象中的 _直接_ 属性被冻结。如果属性是另一个 object，像案例中的 `address`，`address` 中的属性没有被冻结，仍然可以被修改。

</details>

## 25. 以下哪一项会对对象 `person` 有副作用？ {#question-e7e3a667-d380-4b69-aa9b-aa80e86937f0}

> 难度：1 · 类型：Choice

```javascript
const person = { name: "Lydia Hallie" };

Object.seal(person);
```

- A. person.name = "Evan Bacon"
- B. person.age = 21
- C. delete person.name
- D. Object.assign(person, { age: 21 })

### 题目要点

使用 `Object.seal` 我们可以防止新属性 _被添加_，或者存在属性 _被移除_. 然而，你仍然可以对存在属性进行更改。

<details>
<summary>参考答案</summary>

**正确答案：A**
使用 `Object.seal` 我们可以防止新属性 _被添加_，或者存在属性 _被移除_.
然而，你仍然可以对存在属性进行更改。

</details>

## 26. 输出什么？ {#question-6a8b4695-3386-491a-8711-2dd53eba399e}

> 难度：0.5 · 类型：Choice

```javascript
const handler = {
    set: () => console.log("Added a new property!"),
    get: () => console.log("Accessed a property!")
};

const person = new Proxy({}, handler);

person.name = "Lydia";
person.name;
```

- A. Added a new property!
- B. Accessed a property!
- C. Added a new property! Accessed a property!
- D. 没有任何输出

### 题目要点

使用 Proxy 对象，我们可以给一个对象添加自定义行为。在这个 case，我们传递一个包含以下属性的对象 `handler` : `set` and `get`。每当我们 _设置_ 属性值时 `set` 被调用，每当我们 _获取_ 时 `get` 被调用。 第一个参数是一个空对象 `{}`，作为 `person` 的值。对于这个对象，自定义行为被定义在对象 `handler`。如果我们向对象 `person` 添加属性，`set` 将被调用。如果我们获取 `person` …

<details>
<summary>参考答案</summary>

**正确答案：C**
使用 Proxy 对象，我们可以给一个对象添加自定义行为。在这个 case，我们传递一个包含以下属性的对象 `handler` : `set` and `get`。每当我们 _设置_ 属性值时 `set` 被调用，每当我们 _获取_ 时 `get` 被调用。
第一个参数是一个空对象 `{}`，作为 `person` 的值。对于这个对象，自定义行为被定义在对象 `handler`。如果我们向对象 `person` 添加属性，`set` 将被调用。如果我们获取 `person` 的属性, `get` 将被调用。
首先，我们向 proxy 对象(`person.name = "Lydia"`)添加一个属性 `name`。`set` 被调用并输出 `"Added a new property!"`。
然后，我们获取 proxy 对象的一个属性，对象 handler 的属性 `get` 被调用。输出 `"Accessed a property!"`。

</details>

## 27. 怎样能在 index.js 中调用 sum.js 中的 sum 方法？ {#question-79eaaf8e-f456-4527-847e-58bad43fd47a}

> 难度：1 · 类型：Choice

```javascript
// sum.js
export default function sum(x) {
    return x + x;
}

// index.js
import * as sum from "./sum";
```

- A. sum(4)
- B. sum.sum(4)
- C. sum.default(4)
- D. 默认导出不用 * 来导入，只能具名导出

### 题目要点

使用符号 `*`，我们引入文件中的所有值，包括默认和具名。如果我们有以下文件：

<details>
<summary>参考答案</summary>

**正确答案：C**
使用符号 `*`，我们引入文件中的所有值，包括默认和具名。如果我们有以下文件：
```javascript
// info.js
export const name = "Lydia";
export const age = 21;
export default "I love JavaScript";
// index.js
import * as info from "./info";
console.log(info);
```
将会输出以下内容：
```javascript
{
  default: "I love JavaScript",
  name: "Lydia",
  age: 21
}
```
以 `sum` 为例，相当于以下形式引入值 `sum`：
```javascript
{ default: function sum(x) { return x + x } }
```
我们可以通过调用 `sum.default` 来调用该函数

</details>

## 28. 输出什么？ {#question-3cfca707-0c28-403b-bf3a-c2b892010ade}

> 难度：2.5 · 类型：Choice

```javascript
const myPromise = Promise.resolve(Promise.resolve("Promise!"));

function funcOne() {
    myPromise.then(res => res).then(res => console.log(res));
    setTimeout(() => console.log("Timeout!"), 0);
    console.log("Last line!");
}

async function funcTwo() {
    const res = await myPromise;
    console.log(await res);
    setTimeout(() => console.log("Timeout!"), 0);
    console.log("Last line!");
}

funcOne();
funcTwo();
```

- A. Promise! Last line! Promise! Last line! Last line! Promise!
- B. Last line! Timeout! Promise! Last line! Timeout! Promise!
- C. Promise! Last line! Last line! Promise! Timeout! Timeout!
- D. Last line! Promise! Promise! Last line! Timeout! Timeout!

### 题目要点

// 2023-03-04 更新解析

<details>
<summary>参考答案</summary>

**正确答案：D**
// 2023-03-04 更新解析

首先，我们调用 `funcOne`。

在函数 `funcOne` 的第一行，我们调用`myPromise` promise _异步操作_。当JS引擎在忙于执行 promise，它继续执行函数 `funcOne`。下一行 _异步操作_ `setTimeout`，其回调函数被 Web API 调用。

promise 和 timeout 都是异步操作，函数继续执行当JS引擎忙于执行 promise 和 处理 `setTimeout` 的回调。相当于 `Last line!` 首先被输出， 因为它不是异步操作。

执行完 `funcOne` 的最后一行，继续往后执行 `funcTwo`，但 `funcTwo` 函数内部第一行就是 `await` 阻止了后面代码的执行，所以才会去执行`funcOne`中`myPromise`的第一个`then`。`funcOne` 中第一行的 `promise` 状态转变为 resolved，`Promise!` 被打印。

然而，我们调用了 `funcTwo()`, 调用栈不为空，`setTimeout` 的回调仍不能入栈。

我们现在处于 `funcTwo`，先 _awaiting_ myPromise。通过 `await` 关键字， 我们暂停了函数的执行直到 promise 状态变为 resolved (或 rejected)。然后，我们输出 `res` 的 awaited 值（因为 promise 本身返回一个 promise）。 接着输出 `Promise!`。

下一行就是 _异步操作_ `setTimeout`，其回调函数被 Web API 调用。

我们执行到函数 `funcTwo` 的最后一行，输出 `Last line!`。现在，因为 `funcTwo` 出栈，调用栈为空。在事件队列中等待的回调函数（`() => console.log("Timeout!")` from `funcOne`, and `() => console.log("Timeout!")` from `funcTwo`）以此入栈。第一个回调输出 `Timeout!`，并出栈。然后，第二个回调输出 `Timeout!`，并出栈。得到结果 `Last line! Promise! Promise! Last line! Timeout! Timeout!`

大家还可以想想，下面会输出什么：

```js
const myPromise = Promise.resolve(Promise.resolve("Promise!"));

function funcOne() {
  myPromise.then(res => {
     console.log("执行第一个then", res)
     return res
  }).then(res => {
      console.log('执行第二个then', res)
  });
  setTimeout(() => console.log("Timeout!"), 0);
  console.log("Last line!");
}

async function funcTwo() {
  console.log('进入funcTwo')
  const res = await myPromise;
  console.log('执行完第一个await，继续往下执行')
  console.log(await res);
  console.log('执行完第二个await，继续往下执行')
  setTimeout(() => console.log("Timeout!"), 0);
  console.log("Last line!");
}

funcOne();
funcTwo();
```

</details>

## 29. 输出什么？ {#question-b752b91f-930f-43b6-8017-83d56392dc7e}

> 难度：1 · 类型：Choice

```javascript
class Counter {
    constructor() {
        this.count = 0;
    }

    increment() {
        this.count++;
    }
}

const counterOne = new Counter();
counterOne.increment();
counterOne.increment();

const counterTwo = counterOne;
counterTwo.increment();

console.log(counterOne.count);
```

- A. 0
- B. 1
- C. 2
- D. 3

### 题目要点

输出是 `3`。

<details>
<summary>参考答案</summary>

**正确答案：D**
输出是 `3`。

在这段代码中，我们定义了一个名为 `Counter` 的类，它具有一个 `count` 属性和一个 `increment` 方法。当我们创建一个 `counterOne` 实例时，它的 `count` 属性被初始化为 `0`。

然后，我们通过调用 `counterOne.increment()` 两次来增加 `counterOne` 对象的 `count` 值，使其变为 `2`。

接下来，我们将 `counterOne` 赋值给 `counterTwo`，这实际上是将对同一个对象的引用赋值给了另一个变量。因此，`counterTwo` 和 `counterOne` 引用相同的对象。

然后，我们调用 `counterTwo.increment()`，这会导致 `count` 属性再次增加 `1`，所以最终 `counterOne.count` 的值为 `3`。

由于 `counterOne` 和 `counterTwo` 都引用同一个对象，因此无论通过哪个引用来修改属性，都会反映在该对象上。

</details>

## 30. 输出什么？ {#question-524c782b-11d8-4be0-9ba6-6fcfd487ace0}

> 难度：0.5 · 类型：Choice

```javascript
const emojis = ["🥑", ["✨", "✨", ["🍕", "🍕"]]];

console.log(emojis.flat(1));
```

- A. ['🥑', ['✨', '✨', ['🍕', '🍕']]]
- B. ['🥑', '✨', '✨', ['🍕', '🍕']]
- C. ['🥑', ['✨', '✨', '🍕', '🍕']]
- D. ['🥑', '✨', '✨', '🍕', '🍕']

### 题目要点

通过方法 `flat`， 我们可以创建一个新的, 已被扁平化的数组。被扁平化的深度取决于我们传递的值。在这个case里，我们传递了值 `1` (并不必要，这是默认值)，相当于只有第一层的数组才会被连接。即这个 case 里的 `['🥑']` and `['✨', '✨', ['🍕', '🍕']]`。连接这两个数组得到结果 `['🥑', '✨', '✨', ['🍕', '🍕']]`.

<details>
<summary>参考答案</summary>

**正确答案：B**
通过方法 `flat`， 我们可以创建一个新的, 已被扁平化的数组。被扁平化的深度取决于我们传递的值。在这个case里，我们传递了值 `1` (并不必要，这是默认值)，相当于只有第一层的数组才会被连接。即这个 case 里的 `['🥑']` and `['✨', '✨', ['🍕', '🍕']]`。连接这两个数组得到结果 `['🥑', '✨', '✨', ['🍕', '🍕']]`.

</details>

## 31. 输出什么？ {#question-6a5130e7-9c13-4dce-9ab5-07ace7597d59}

> 难度：0.5 · 类型：Choice

```javascript
const myPromise = Promise.resolve("Woah some cool data");

(async () => {
    try {
        console.log(await myPromise);
    } catch {
        throw new Error(`Oops didn't work`);
    } finally {
        console.log("Oh finally!");
    }
})();
```

- A. Woah some cool data
- B. Oh finally!
- C. Woah some cool data Oh finally!
- D. Oops didn't work Oh finally!

### 题目要点

在 `try` 块区，我们打印 `myPromise` 变量的 awaited 值： `"Woah some cool data"`。因为`try` 块区没有错误抛出，`catch` 块区的代码并不执行。`finally` 块区的代码 _总是_ 执行，`"Oh finally!"` 被输出。

<details>
<summary>参考答案</summary>

**正确答案：C**
在 `try` 块区，我们打印 `myPromise` 变量的 awaited 值： `"Woah some cool data"`。因为`try` 块区没有错误抛出，`catch` 块区的代码并不执行。`finally` 块区的代码 _总是_ 执行，`"Oh finally!"` 被输出。

</details>

## 32. 输出什么？ {#question-462a3a5d-0364-41c1-b437-d8f63587ae1c}

> 难度：0.5 · 类型：Choice

```javascript
const randomValue = 21;

function getInfo() {
    console.log(typeof randomValue);
    const randomValue = "Lydia Hallie";
}

getInfo();
```

- A. "number"
- B. "string"
- C. undefined
- D. ReferenceError

### 题目要点

通过 `const` 关键字声明的变量在被初始化之前不可被引用：这被称之为 _暂时性死区_。在函数 `getInfo` 中, 变量 `randomValue` 声明在`getInfo` 的作用域的此法环境中。在想要对 `typeof randomValue` 进行log之前，变量 `randomValue` 仍未被初始化： 错误`ReferenceError` 被抛出! JS引擎并不会根据作用域链网上寻找该变量，因为我们已经在 `getInfo` 函数中声明了 `random…

<details>
<summary>参考答案</summary>

**正确答案：D**
通过 `const` 关键字声明的变量在被初始化之前不可被引用：这被称之为 _暂时性死区_。在函数 `getInfo` 中, 变量 `randomValue` 声明在`getInfo` 的作用域的此法环境中。在想要对 `typeof randomValue` 进行log之前，变量 `randomValue` 仍未被初始化： 错误`ReferenceError` 被抛出! JS引擎并不会根据作用域链网上寻找该变量，因为我们已经在 `getInfo` 函数中声明了 `randomValue` 变量。

</details>

## 33. 输出什么？ {#question-274fa7ad-e6d3-43e7-8841-6d68c280166b}

> 难度：1 · 类型：Choice

```javascript
const name = "Lydia Hallie";
const age = 21;

console.log(Number.isNaN(name));
console.log(Number.isNaN(age));

console.log(isNaN(name));
console.log(isNaN(age));
```

- A. true false true false
- B. true false false false
- C. false false true false
- D. false true false true

### 题目要点

`isNaN`函数是用来确定一个值是否是`NaN`，可以在全局直接使用，返回值是一个布尔值`true`或`false`：

<details>
<summary>参考答案</summary>

**正确答案：C**
## 1\. isNaN()

`isNaN`函数是用来确定一个值是否是`NaN`，可以在全局直接使用，返回值是一个布尔值`true`或`false`：

```js
// 基础用法
isNaN(1)     // false
isNaN(NaN)   // true
```

但是`isNaN`方法有一些怪异的行为，不然也不会有`Number.isNaN`函数什么事了：

```js
isNaN(undefined); // true
isNaN({});        // true
isNaN("37,5")     // true
isNaN("123ABC")   // true
isNaN("abc")      // true
```

可以看到，以上的这些`isNaN`函数的参数都不是`NaN`,怎么还返回`true`呢？ MDN的解释是这样的：**如果`isNaN`函数的参数不是`Number`类型， `isNaN`函数会首先尝试将这个参数转换为数值，然后才会对转换后的结果是否是`NaN`进行判断**, 也就是说，`isNaN`的参数首先会执行`Number()`进行强制转换，然后再去判断是否是`NaN`:

```js
isNaN(true)       // false 因为Number(true)值为1，而1不是NaN, 所以返回false
isNaN(undefined); // true  因为Number(undefined)值为NaN, 所以返回true
isNaN({});        // true  因为Number({})值为NaN, 所以返回true
isNaN('abc');     // true  因为Number(abc)值为NaN, 所以返回true
isNaN('');        // false 因为Number('')值为0, 所以返回false
复制代码
```

## 2\. Number.isNaN()

**`Number.isNaN()`** 方法确定传递的值是否为 `NaN`，并且检查其类型是否为 `Number`,它的返回值是布尔类型。它是原来的全局 `isNaN()`的更稳妥的版本（注意：`ECMAScript 2015`版本才有`Number.isNaN()`）。

也就是说，`Number.isNaN`函数会先检查参数是不是`Number`类型，如果不是，直接会返回`false`,只有参数是`Number`类型才会去判断是不是`NaN`,我们用`Number.isNaN`再验证下之前的例子：

```js
// 基本使用
Number.isNaN(NaN)    // true
Number.isNaN(1)      // false

// 特殊情况
Number.isNaN(true)        // false 因为true不是Number类型
Number.isNaN(undefined)   // false 因为undefined不是Number类型
Number.isNaN({})          // false 因为{}不是Number类型
Number.isNaN("abc")       // false 因为"abc"不是Number类型
Number.isNaN("")          // false 因为""不是Number类型
```

## 3\. 推荐使用Number.isNaN()

通过上述的几个例子可以看到，`Number.isNaN`用来判断某个值是否是NaN更像是我们理想型用法，不会产生一些比较怪异的行为，使我们的代码更加的严谨，防止出现bug, 所以在写代码的时候更推荐使用`Number.isNaN`这个方法来确定一个值是否是`NaN`。

</details>

## 34. 输出什么？ {#question-e9b3318a-4d50-437b-8a59-532532cd7dc3}

> 难度：0.5 · 类型：Choice

```javascript
const spookyItems = ["👻", "🎃", "🕸"];
({ item: spookyItems[3] } = { item: "💀" });

console.log(spookyItems);
```

- A. ["👻", "🎃", "🕸"]
- B. ["👻", "🎃", "🕸", "💀"]
- C. ["👻", "🎃", "🕸", { item: "💀" }]
- D. ["👻", "🎃", "🕸", "[object Object]"]

### 题目要点

通过解构对象们，我们可以从右手边的对象中拆出值，并且将拆出的值分配给左手边对象同名的属性。在这种情况下，我们将值 "💀" 分配给 `spookyItems[3]`。相当于我们正在篡改数组 `spookyItems`，我们给它添加了值 "💀"。当输出 `spookyItems` 时，结果为 `["👻", "🎃", "🕸", "💀"]`。

<details>
<summary>参考答案</summary>

**正确答案：B**
通过解构对象们，我们可以从右手边的对象中拆出值，并且将拆出的值分配给左手边对象同名的属性。在这种情况下，我们将值 "💀" 分配给 `spookyItems[3]`。相当于我们正在篡改数组 `spookyItems`，我们给它添加了值 "💀"。当输出 `spookyItems` 时，结果为 `["👻", "🎃", "🕸", "💀"]`。

</details>

## 35. 输出什么？ {#question-f7527bab-1200-4c68-86d9-bab157c66156}

> 难度：0.5 · 类型：Choice

```javascript
function getFine(speed, amount) {
  const formattedSpeed = new Intl.NumberFormat('en-US', {
    style: 'unit', unit: 'mile-per-hour'
  }).format(speed)

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(amount)

  return `The driver drove ${formattedSpeed} and has to pay ${formattedAmount}`
}

console.log(getFine(130, 300))
```

- A. The driver drove 130 and has to pay 300
- B. The driver drove 130 mph and has to pay $300.00
- C. The driver drove undefined and has to pay undefined
- D. The driver drove 130.00 and has to pay 300.00

### 题目要点

通过方法 `Intl.NumberFormat`，可以格式化任意区域的数字值。我们对数字值 `130` 进行 `mile-per-hour` 作为 `unit` 的 `en-US` 区域 格式化，结果为 `130 mph`。对数字值 `300` 进行 `USD` 作为 `currentcy` 的 `en-US` 区域格式化，结果为 `$300.00`.

<details>
<summary>参考答案</summary>

**正确答案：B**
通过方法 `Intl.NumberFormat`，可以格式化任意区域的数字值。我们对数字值 `130` 进行 `mile-per-hour` 作为 `unit` 的 `en-US` 区域 格式化，结果为 `130 mph`。对数字值 `300` 进行 `USD` 作为 `currentcy` 的 `en-US` 区域格式化，结果为 `$300.00`.

</details>

## 36. 输出什么？ {#question-c8a6250a-c30b-4ddc-8b5c-5313c04e136e}

> 难度：0.5 · 类型：Choice

```javascript
const myFunc = ({ x, y, z }) => {
    console.log(x, y, z);
};

myFunc(1, 2, 3);
```

- A. 1 2 3
- B. {1: 1} {2: 2} {3: 3}
- C. { 1: undefined } undefined undefined
- D. undefined undefined undefined

### 题目要点

`myFunc` 期望接收一个包含 `x`, `y` 和 `z` 属性的对象作为它的参数。因为我们仅仅传递三个单独的数字值 (1, 2, 3) 而不是一个含有 `x`, `y` 和 `z` 属性的对象 ({x: 1, y: 2, z: 3})， `x`, `y` 和 `z` 有着各自的默认值 `undefined`.

<details>
<summary>参考答案</summary>

**正确答案：D**
`myFunc` 期望接收一个包含 `x`, `y` 和 `z` 属性的对象作为它的参数。因为我们仅仅传递三个单独的数字值 (1, 2, 3) 而不是一个含有 `x`, `y` 和 `z` 属性的对象 ({x: 1, y: 2, z: 3})， `x`, `y` 和 `z` 有着各自的默认值 `undefined`.

</details>

## 37. 输出什么？ {#question-758b3c03-bac2-4d4f-a900-63f478a1e770}

> 难度：0.5 · 类型：Choice

```javascript
async function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield Promise.resolve(i);
    }
}

(async () => {
    const gen = range(1, 3);
    for await (const item of gen) {
        console.log(item);
    }
})();
```

- A. Promise {1} Promise {2} Promise {3}
- B. Promise {<pending>} Promise {<pending>} Promise {<pending>}
- C. 1 2 3
- D. undefined undefined undefined

### 题目要点

我们给 函数range 传递： `Promise{1}`, `Promise{2}`, `Promise{3}`，Generator 函数 `range` 返回一个全是 async object promise 数组。我们将 async object 赋值给变量 `gen`，之后我们使用`for await ... of` 进行循环遍历。我们将返回的 Promise 实例赋值给 `item`： 第一个返回 `Promise{1}`， 第二个返回 `Promise{2}`，之后…

<details>
<summary>参考答案</summary>

**正确答案：C**
我们给 函数range 传递： `Promise{1}`, `Promise{2}`, `Promise{3}`，Generator 函数 `range` 返回一个全是 async object promise 数组。我们将 async object 赋值给变量 `gen`，之后我们使用`for await ... of` 进行循环遍历。我们将返回的 Promise 实例赋值给 `item`： 第一个返回 `Promise{1}`， 第二个返回 `Promise{2}`，之后是 `Promise{3}`。因为我们正 _awaiting_ `item` 的值，resolved 状态的 promsie，promise数组的resolved _值_ 以此为： `1`，`2`，`3`.

</details>

## 38. 输出什么? {#question-a8d808be-7214-4540-bb33-594b23a5a9d3}

> 难度：0.5 · 类型：Choice

```javascript
const add = x => y => z => {
    console.log(x, y, z);
    return x + y + z;
};

add(4)(5)(6);
```

- A. 4 5 6
- B. 6 5 4
- C. 4 function function
- D. undefined undefined 6

### 题目要点

函数 `add` 是一个返回 返回箭头函数的箭头函数 的箭头函数（still with me?）。第一个函数接收一个值为 `4` 的参数 `x`。我们调用第二个函数，它接收一个值为 `5` 的参数 `y`。然后我们调用第三个函数，它接收一个值为 `6` 的参数 `z`。当我们尝试在最后一个箭头函数中获取 `x`, `y` 和 `z` 的值，JS 引擎根据作用域链去找 `x` 和 `y` 的值。得到 `4` `5` `6`.

<details>
<summary>参考答案</summary>

**正确答案：A**
函数 `add` 是一个返回 返回箭头函数的箭头函数 的箭头函数（still with me?）。第一个函数接收一个值为 `4` 的参数 `x`。我们调用第二个函数，它接收一个值为 `5` 的参数 `y`。然后我们调用第三个函数，它接收一个值为 `6` 的参数 `z`。当我们尝试在最后一个箭头函数中获取 `x`, `y` 和 `z` 的值，JS 引擎根据作用域链去找 `x` 和 `y` 的值。得到 `4` `5` `6`.

</details>

## 39. 输出什么？ {#question-13232ee2-18b7-45a3-a633-c796611934e8}

> 难度：0.5 · 类型：Choice

```javascript
const name = "Lydia Hallie";

console.log(!typeof name === "object");
console.log(!typeof name === "string");
```

- A. false true
- B. true false
- C. false false
- D. true true

### 题目要点

`typeof name` 返回 `"string"`。字符串 `"string"` 是一个 truthy 的值，因此 `!typeof name` 返回一个布尔值 `false`。 `false === "object"` 和 `false === "string"` 都返回 `false`。 （如果我们想检测一个值的类型，我们应该用 `!==` 而不是 `!typeof`）

<details>
<summary>参考答案</summary>

**正确答案：C**
`typeof name` 返回 `"string"`。字符串 `"string"` 是一个 truthy 的值，因此 `!typeof name` 返回一个布尔值 `false`。 `false === "object"` 和 `false === "string"` 都返回 `false`。
（如果我们想检测一个值的类型，我们应该用 `!==` 而不是 `!typeof`）

</details>

## 40. 输出什么? {#question-8b42c23f-1293-425d-87c2-c662a33b4f70}

> 难度：1 · 类型：Choice

```javascript
const config = {
    languages: [],
    set language(lang) {
        return this.languages.push(lang);
    }
};

console.log(config.language);
```

- A. function language(lang) { this.languages.push(lang }
- B. 0
- C. []
- D. undefined

### 题目要点

方法 `language` 是一个 `setter`。Setters 并不保存一个实际值，它们的使命在于 _修改_ 属性。当调用方法 `setter`， 返回 `undefined`。

<details>
<summary>参考答案</summary>

**正确答案：D**
方法 `language` 是一个 `setter`。Setters 并不保存一个实际值，它们的使命在于 _修改_ 属性。当调用方法 `setter`， 返回 `undefined`。

</details>

## 41. 输出什么？ {#question-22d88306-35f1-4538-898c-2ce3e5303fea}

> 难度：0.5 · 类型：Choice

```javascript
const groceries = ["banana", "apple", "peanuts"];

if (groceries.indexOf("banana")) {
    console.log("We have to buy bananas!");
} else {
    console.log(`We don't have to buy bananas!`);
}
```

- A. We have to buy bananas!
- B. We don't have to buy bananas
- C. undefined
- D. 1

### 题目要点

我们传递了一个状态 `groceries.indexOf("banana")` 给if条件语句。`groceries.indexOf("banana")` 返回 `0`， 一个 falsy 的值。因为if条件语句的状态为 falsy，`else` 块区内的代码执行，并且 `We don't have to buy bananas!` 被输出.

<details>
<summary>参考答案</summary>

**正确答案：B**
我们传递了一个状态 `groceries.indexOf("banana")` 给if条件语句。`groceries.indexOf("banana")` 返回 `0`， 一个 falsy 的值。因为if条件语句的状态为 falsy，`else` 块区内的代码执行，并且 `We don't have to buy bananas!` 被输出.

</details>

## 42. 下面的输出是什么？ {#question-289617b6-a28f-4528-be36-ac9e08e9d2c1}

> 难度：1 · 类型：Choice

```javascript
const person = {
    firstName: "Lydia",
    lastName: "Hallie",
    pet: {
        name: "Mara",
        breed: "Dutch Tulip Hound"
    },
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
};

console.log(person.pet?.name);
console.log(person.pet?.family?.name);
console.log(person.getFullName?.());
console.log(person.getLastName?.());
```

- A. undefined undefined undefined undefined
- B. Mara undefined Lydia Hallie undefined
- C. Mara null Lydia Hallie null
- D. null ReferenceError null ReferenceError

### 题目要点

通过逐行分析代码来看输出结果：

<details>
<summary>参考答案</summary>

**正确答案：B**
通过逐行分析代码来看输出结果：

1. `console.log(person.pet?.name);`
   - 这一行代码打印了`person.pet.name`的值，如果该值存在且不为`null`或`undefined`，则输出该值。
   - 在这种情况下，`person.pet.name`的值为`"Mara"`，因此输出将是`"Mara"`。

2. `console.log(person.pet?.family?.name);`
   - 这一行代码试图访问`person.pet.family.name`的值，但是由于使用了`?.`，即使`person.pet.family`不存在（为`null`或`undefined`），也不会抛出错误，而是返回`undefined`。
   - 因此，输出将是`undefined`。

3. `console.log(person.getFullName?.());`
   - 这一行代码调用`person.getFullName()`方法（如果存在）并输出其返回值。
   - 在这种情况下，`getFullName`方法存在，它会返回`"Lydia Hallie"`，因此输出将是`"Lydia Hallie"`。

4. `console.log(person.getLastName?.());`
   - 这一行代码试图调用一个名为`getLastName`的方法（如果存在），但是`person`对象中并不存在`getLastName`方法，所以它将返回`undefined`。
   - 因此，输出将是`undefined`。

</details>

## 43. 输出什么？ {#question-14437ae4-d571-4139-88ec-eb9825196c4d}

> 难度：0.5 · 类型：Choice

```javascript
let num = 1;
const list = ["🥳", "🤠", "🥰", "🤪"];

console.log(list[(num += 1)]);
```

- A. 🤠
- B. 🥰
- C. SyntaxError
- D. ReferenceError

### 题目要点

通过 `+=` 操作符，我们对值 `num` 进行加 `1` 操作。 `num` 有初始值 `1`，因此 `1 + 1` 的执行结果为 `2`。数组 `list` 的第二项为 🥰，`console.log(list[2])` 输出 🥰.

<details>
<summary>参考答案</summary>

**正确答案：B**
通过 `+=` 操作符，我们对值 `num` 进行加 `1` 操作。 `num` 有初始值 `1`，因此 `1 + 1` 的执行结果为 `2`。数组 `list` 的第二项为 🥰，`console.log(list[2])` 输出 🥰.

</details>

## 44. 下面那个选项将会返回 '6' ? {#question-f57f9350-c543-46e3-8419-1ea5ab453971}

> 难度：0.5 · 类型：Choice

```javascript
function sumValues(x, y, z) {
    return x + y + z;
}
```

- A. sumValues([...1, 2, 3])
- B. sumValues([...[1, 2, 3]])
- C. sumValues(...[1, 2, 3])
- D. sumValues([1, 2, 3])

### 题目要点

通过展开操作符 `...`，我们可以 _展开_ 单个可迭代的元素。函数 `sumValues` function 接收三个参数： `x`, `y` 和 `z`。`...[1, 2, 3]` 的执行结果为 `1, 2, 3`，将会传递给函数 `sumValues`。

<details>
<summary>参考答案</summary>

**正确答案：C**
通过展开操作符 `...`，我们可以 _展开_ 单个可迭代的元素。函数 `sumValues` function 接收三个参数： `x`, `y` 和 `z`。`...[1, 2, 3]` 的执行结果为 `1, 2, 3`，将会传递给函数 `sumValues`。

</details>

## 45. 输出什么？ {#question-7ce6573e-b10b-4962-a732-aec1ca3207a1}

> 难度：0.5 · 类型：Choice

```javascript
const person = {
  name: "Lydia",
  age: 21
}

const changeAge = (x = { ...person }) => x.age += 1
const changeAgeAndName = (x = { ...person }) => {
  x.age += 1
  x.name = "Sarah"
}

changeAge(person)
changeAgeAndName()

console.log(person)
```

- A. {name: "Sarah", age: 22}
- B. {name: "Sarah", age: 23}
- C. {name: "Lydia", age: 22}
- D. {name: "Lydia", age: 23}

### 题目要点

函数 `changeAge` 和函数 `changeAgeAndName` 有着不同的参数，定义一个 _新_ 生成的对象 `{ ...person }`。这个对象有着所有 `person` 对象 中 k/v 值的副本。 首项, 我们调用 `changeAge` 函数并传递 `person` 对象作为它的参数。这个函数对 `age` 属性进行加一操作。`person` 现在是 `{ name: "Lydia", age: 22 }`。 然后，我们调用函数 `changeAgeA…

<details>
<summary>参考答案</summary>

**正确答案：C**
函数 `changeAge` 和函数 `changeAgeAndName` 有着不同的参数，定义一个 _新_ 生成的对象 `{ ...person }`。这个对象有着所有 `person` 对象 中 k/v 值的副本。
首项, 我们调用 `changeAge` 函数并传递 `person` 对象作为它的参数。这个函数对 `age` 属性进行加一操作。`person` 现在是 `{ name: "Lydia", age: 22 }`。
然后，我们调用函数 `changeAgeAndName` ，然而我们没有传递参数。取而代之，`x` 的值等价 _new_ 生成的对象: `{ ...person }`。因为它是一个新生成的对象，它并不会对对象 `person` 造成任何副作用。`person` 仍然等价于 `{ name: "Lydia", age: 22 }`。

</details>

## 46. 哪一个方法会返回 'Hello world!' ？ {#question-fc6beb89-dcf0-456e-a4d0-746ec0968295}

> 难度：0.5 · 类型：Choice

```javascript
const myMap = new Map()
const myFunc = () => 'greeting'

myMap.set(myFunc, 'Hello world!')

//1
myMap.get('greeting')
//2
myMap.get(myFunc)
//3
myMap.get(() => 'greeting')
```

- A. 1
- B. 2
- C. 2 and 3
- D. All of them

### 题目要点

当通过 `set` 方法添加一个键值对，一个传递给 `set`方法的参数将会是键名，第二个参数将会是值。在这个case里，键名为 _函数_ `() => 'greeting'`，值为`'Hello world'`。 `myMap` 现在就是 `{ () => 'greeting' => 'Hello world!' }`。 1 是错的，因为键名不是 `'greeting'` 而是 `() => 'greeting'`。 3 是错的，因为我们给`get` 方法传递了一个新的函数…

<details>
<summary>参考答案</summary>

**正确答案：B**
当通过 `set` 方法添加一个键值对，一个传递给 `set`方法的参数将会是键名，第二个参数将会是值。在这个case里，键名为 _函数_ `() => 'greeting'`，值为`'Hello world'`。 `myMap` 现在就是 `{ () => 'greeting' => 'Hello world!' }`。
1 是错的，因为键名不是 `'greeting'` 而是 `() => 'greeting'`。
3 是错的，因为我们给`get` 方法传递了一个新的函数。对象受 _引用_ 影响。函数也是对象，因此两个函数严格上并不等价，尽管他们相同：他们有两个不同的内存引用地址。

</details>

## 47. 将会发生什么? {#question-6c0d11e8-a6cf-4f70-af8b-17f0490f36e2}

> 难度：1 · 类型：Choice

```javascript
let config = {
  alert: setInterval(() => {
    console.log('Alert!')
  }, 1000)
}

config = null
```

- A. setInterval 的回调不会被调用
- B. setInterval 的回调被调用一次
- C. setInterval 的回调仍然会被每秒钟调用
- D. 我们从没调用过 config.alert(), config 为 null

### 题目要点

一般情况下当我们将对象赋值为 `null`, 那些对象会被进行 _垃圾回收（garbage collected）_ 因为已经没有对这些对象的引用了。

<details>
<summary>参考答案</summary>

**正确答案：C**
一般情况下当我们将对象赋值为 `null`, 那些对象会被进行 _垃圾回收（garbage collected）_ 因为已经没有对这些对象的引用了。

但 setInterval 会有些例外，详见以下知识点：

* js创建的所有 Object 类型的对象存储于当前窗口的栈空间，其中包含定时器
* v8引擎有自动回收垃圾并释放当前窗口的栈内存的机制，但这个自动回收仅限于当变量的指针指向null时，才将变量不再使用的对象从栈空间及时回收，否则它会在窗口对象销毁时才回收。
* **interval对象或timeout对象，这两种定时器对象只会随着窗口对象的销毁才从栈空间回收。无法通过更改变量的指针指向null的方式通知垃圾回收机自动回收。** 如果打算在窗口对象关闭之前销毁窗口对象的栈内存中的interval对象只能通过interval的销毁函数销毁它，interval的销毁函数为clearInterval，timeout的销毁函数为clearTimeout。
* 浏览器的窗口存储于浏览器的栈空间，每打开一个浏览器窗口，浏览器就会创建一个window对象。

</details>

## 48. 输出什么？ {#question-fe5c8180-dafd-428e-86d7-4360811d5321}

> 难度：0.5 · 类型：Choice

```javascript
console.log(`${(x => x)('I love')} to program`)
```

- A. I love to program
- B. undefined to program
- C. ${(x => x)('I love') to program
- D. TypeError

### 题目要点

带有模板字面量的表达式首先被执行。相当于字符串会包含表达式，这个立即执行函数 `(x => x)('I love')` 返回的值. 我们向箭头函数 `x => x` 传递 `'I love'` 作为参数。`x` 等价于返回的 `'I love'`。这就是结果 `I love to program`。

<details>
<summary>参考答案</summary>

**正确答案：A**
带有模板字面量的表达式首先被执行。相当于字符串会包含表达式，这个立即执行函数 `(x => x)('I love')` 返回的值. 我们向箭头函数 `x => x` 传递 `'I love'` 作为参数。`x` 等价于返回的 `'I love'`。这就是结果 `I love to program`。

</details>

## 49. 输出什么？ {#question-d73bb354-253c-4832-80e1-0aa525bc7dc9}

> 难度：1 · 类型：Choice

```javascript
function* generatorOne() {
  yield ['a', 'b', 'c'];
}

function* generatorTwo() {
  yield* ['a', 'b', 'c'];
}

const one = generatorOne()
const two = generatorTwo()

console.log(one.next().value)
console.log(two.next().value)
```

- A. a and a
- B. a and undefined
- C. ['a', 'b', 'c'] and a
- D. a and ['a', 'b', 'c']

### 题目要点

通过 `yield` 关键字, 我们在 `Generator` 函数里执行`yield`表达式. 通过 `yield*` 关键字, 我们可以在一个`Generator` 函数里面执行（`yield`表达式）另一个 `Generator` 函数, 或可遍历的对象 (如数组). 在函数 `generatorOne` 中, 我们通过 `yield` 关键字 yield 了一个完整的数组 `['a', 'b', 'c']`。函数`one`通过`next`方法返回的对象的`value`…

<details>
<summary>参考答案</summary>

**正确答案：C**
通过 `yield` 关键字, 我们在 `Generator` 函数里执行`yield`表达式. 通过 `yield*` 关键字, 我们可以在一个`Generator` 函数里面执行（`yield`表达式）另一个 `Generator` 函数, 或可遍历的对象 (如数组).
在函数 `generatorOne` 中, 我们通过 `yield` 关键字 yield 了一个完整的数组 `['a', 'b', 'c']`。函数`one`通过`next`方法返回的对象的`value` 属性的值 (`one.next().value`) 等价于数组 `['a', 'b', 'c']`.
```javascript
console.log(one.next().value) // ['a', 'b', 'c']
console.log(one.next().value) // undefined
```
在函数 `generatorTwo` 中, 我们使用 `yield*` 关键字。就相当于函数`two`第一个`yield`的值, 等价于在迭代器中第一个 `yield` 的值。数组`['a', 'b', 'c']`就是这个迭代器. 第一个 `yield` 的值就是 `a`, 所以我们第一次调用 `two.next().value`时, 就返回`a`。
```javascript
console.log(two.next().value) // 'a'
console.log(two.next().value) // 'b'
console.log(two.next().value) // 'c'
console.log(two.next().value) // undefined
```

</details>

## 50. 输出什么? {#question-3bd8f12b-0050-4323-869c-4b63d7820276}

> 难度：1 · 类型：Choice

```javascript
let name = 'Lydia'

function getName() {
  console.log(name)
  let name = 'Sarah'
}

getName()
```

- A. Lydia
- B. Sarah
- C. undefined
- D. ReferenceError

### 题目要点

每个函数都有其自己的执行上下文。 `getName`函数首先在其自身的上下文（范围）内查找，以查看其是否包含我们尝试访问的变量`name`。 上述情况，`getName`函数包含其自己的`name`变量：我们用`let`关键字和`Sarah`的值声明变量`name`。 带有`let`关键字（和`const`）的变量被提升，但是与`var`不同，它不会被***初始化***。 在我们声明（初始化）它们之前，无法访问它们。 这称为“暂时性死区”。 当我们尝试在声明变量之前访问变量时…

<details>
<summary>参考答案</summary>

**正确答案：D**
每个函数都有其自己的执行上下文。 `getName`函数首先在其自身的上下文（范围）内查找，以查看其是否包含我们尝试访问的变量`name`。 上述情况，`getName`函数包含其自己的`name`变量：我们用`let`关键字和`Sarah`的值声明变量`name`。
带有`let`关键字（和`const`）的变量被提升，但是与`var`不同，它不会被***初始化***。 在我们声明（初始化）它们之前，无法访问它们。 这称为“暂时性死区”。 当我们尝试在声明变量之前访问变量时，JavaScript会抛出`ReferenceError: Cannot access 'name' before initialization`。
如果我们不在`getName`函数中声明`name`变量，则javascript引擎会查看原型链。会找到其外部作用域有一个名为`name`的变量，其值为`Lydia`。 在这种情况下，它将打印`Lydia`：
```javascript
let name = 'Lydia'
function getName() {
  console.log(name)
}
getName() // Lydia
```

</details>

## 51. 这个函数干了什么? {#question-696b2f96-57aa-49cc-9305-4d336e8365ef}

> 难度：1 · 类型：Choice

```javascript
JSON.parse()
```

- A. Parses JSON to a JavaScript value
- B. Parses a JavaScript object to JSON
- C. Parses any JavaScript value to JSON
- D. Parses JSON to a JavaScript object only

### 题目要点

使用`JSON.parse()`方法，我们可以将JSON字符串解析为JavaScript值。

<details>
<summary>参考答案</summary>

**正确答案：A**
使用`JSON.parse()`方法，我们可以将JSON字符串解析为JavaScript值。
```javascript
// 将数字字符串化为有效的JSON，然后将JSON字符串解析为JavaScript值:
const jsonNumber = JSON.stringify(4) // '4'
JSON.parse(jsonNumber) // 4
// 将数组值字符串化为有效的JSON，然后将JSON字符串解析为JavaScript值:
const jsonArray = JSON.stringify([1, 2, 3]) // '[1, 2, 3]'
JSON.parse(jsonArray) // [1, 2, 3]
// 将对象字符串化为有效的JSON，然后将JSON字符串解析为JavaScript值:
const jsonArray = JSON.stringify({ name: "Lydia" }) // '{"name":"Lydia"}'
JSON.parse(jsonArray) // { name: 'Lydia' }
```

</details>

## 52. 下面代码输出什么? {#question-c7c6762f-bc84-4b0c-9f05-79072db1e1ea}

> 难度：0.5 · 类型：Choice

```javascript
const food = ['🍕', '🍫', '🥑', '🍔']
const info = { favoriteFood: food[0] }

info.favoriteFood = '🍝'

console.log(food)
```

- A. ['🍕', '🍫', '🥑', '🍔']
- B. ['🍝', '🍫', '🥑', '🍔']
- C. ['🍝', '🍕', '🍫', '🥑', '🍔']
- D. ReferenceError

### 题目要点

我们将`info`对象上的`favoriteFood`属性的值设置为披萨表情符号“🍕”的字符串。字符串是原始数据类型。在JavaScript中，原始数据类型通过值起作用 在这种情况下，我们将`info`对象上的`favoriteFood`属性的值设置为等于`food`数组中的第一个元素的值，字符串为披萨表情符号（`'🍕'` ）。字符串是原始数据类型，并且通过值进行交互，我们更改`info`对象上`favoriteFood`属性的值。 food数组没有改变，因为favorite…

<details>
<summary>参考答案</summary>

**正确答案：A**
我们将`info`对象上的`favoriteFood`属性的值设置为披萨表情符号“🍕”的字符串。字符串是原始数据类型。在JavaScript中，原始数据类型通过值起作用
在这种情况下，我们将`info`对象上的`favoriteFood`属性的值设置为等于`food`数组中的第一个元素的值，字符串为披萨表情符号（`'🍕'` ）。字符串是原始数据类型，并且通过值进行交互，我们更改`info`对象上`favoriteFood`属性的值。 food数组没有改变，因为favoriteFood的值只是该数组中第一个元素的值的复制，并且与该元素上的元素没有相同的内存引用食物`[0]`。当我们记录食物时，它仍然是原始数组`['🍕'，'🍫'，'🥑'，'🍔']`。

</details>

## 53. 哪些方法修改了原数组? {#question-943c425e-0b59-4ef6-b22d-6596c19a962a}

> 难度：1 · 类型：Choice

```javascript
const emojis = ['✨', '🥑', '😍']

emojis.map(x => x + '✨')
emojis.filter(x => x !== '🥑')
emojis.find(x => x !== '🥑')
emojis.reduce((acc, cur) => acc + '✨')
emojis.slice(1, 2, '✨')
emojis.splice(1, 2, '✨')
```

- A. All of them
- B. map reduce slice splice
- C. map slice splice
- D. splice

### 题目要点

使用`splice`方法，我们通过删除，替换或添加元素来修改原始数组。 在这种情况下，我们从索引1中删除了2个元素（我们删除了`'🥑'`和`'😍'`），同时添加了✨emoji表情。 `map`，`filter`和`slice`返回一个新数组，`find`返回一个元素，而`reduce`返回一个减小的值。

<details>
<summary>参考答案</summary>

**正确答案：D**
使用`splice`方法，我们通过删除，替换或添加元素来修改原始数组。 在这种情况下，我们从索引1中删除了2个元素（我们删除了`'🥑'`和`'😍'`），同时添加了✨emoji表情。
`map`，`filter`和`slice`返回一个新数组，`find`返回一个元素，而`reduce`返回一个减小的值。

</details>

## 54. 输出什么? {#question-8769cc70-a32f-4b69-893d-40e819dd6c5f}

> 难度：0.5 · 类型：Choice

```javascript
console.log('❤️' === '❤️')
```

- A. true
- B. false

### 题目要点

在内部，表情符号是unicode。 heat表情符号的unicode是`“ U + 2764 U + FE0F”`。 对于相同的表情符号，它们总是相同的，因此我们将两个相等的字符串相互比较，这将返回true。

<details>
<summary>参考答案</summary>

**正确答案：A**
在内部，表情符号是unicode。 heat表情符号的unicode是`“ U + 2764 U + FE0F”`。 对于相同的表情符号，它们总是相同的，因此我们将两个相等的字符串相互比较，这将返回true。

</details>

## 55. 输出什么? {#question-71637418-9f70-4504-9eed-ab1f3d6c702d}

> 难度：0.5 · 类型：Choice

```javascript
const colorConfig = {
  red: true,
  blue: false,
  green: true,
  black: true,
  yellow: false,
}

const colors = ["pink", "red", "blue"]

console.log(colorConfig.colors[1])
```

- A. true
- B. false
- C. undefined
- D. TypeError

### 题目要点

在JavaScript中，我们有两种访问对象属性的方法：括号表示法或点表示法。 在此示例中，我们使用点表示法（`colorConfig.colors`）代替括号表示法（`colorConfig [“ colors”]`）。 使用点表示法，JavaScript会尝试使用该确切名称在对象上查找属性。 在此示例中，JavaScript尝试在colorconfig对象上找到名为colors的属性。 没有名为“colors”的属性，因此返回“undefined”。 然后，我们尝试使用`…

<details>
<summary>参考答案</summary>

**正确答案：D**
在JavaScript中，我们有两种访问对象属性的方法：括号表示法或点表示法。 在此示例中，我们使用点表示法（`colorConfig.colors`）代替括号表示法（`colorConfig [“ colors”]`）。
使用点表示法，JavaScript会尝试使用该确切名称在对象上查找属性。 在此示例中，JavaScript尝试在colorconfig对象上找到名为colors的属性。 没有名为“colors”的属性，因此返回“undefined”。
然后，我们尝试使用`[1]`访问第一个元素的值。 我们无法对未定义的值执行此操作，因此会抛出`Cannot read property '1' of undefined`。
JavaScript解释（或取消装箱）语句。 当我们使用方括号表示法时，它会看到第一个左方括号`[`并一直进行下去，直到找到右方括号`]`。 只有这样，它才会评估该语句。 如果我们使用了colorConfig [colors [1]]，它将返回colorConfig对象上red属性的值。

</details>

## 56. 输出什么? {#question-2a420371-13f4-46fc-a5d8-d2338682d8d6}

> 难度：0.5 · 类型：Choice

```javascript
function compareMembers(person1, person2 = person) {
  if (person1 !== person2) {
    console.log("Not the same!")
  } else {
    console.log("They are the same!")
  }
}

const person = { name: "Lydia" }

compareMembers(person)
```

- A. Not the same!
- B. They are the same!
- C. ReferenceError
- D. SyntaxError

### 题目要点

对象通过引用传递。 当我们检查对象的严格相等性（===）时，我们正在比较它们的引用。 我们将“person2”的默认值设置为“person”对象，并将“person”对象作为“person1”的值传递。 这意味着两个值都引用内存中的同一位置，因此它们是相等的。 运行“ else”语句中的代码块，并记录`They are the same!` 。

<details>
<summary>参考答案</summary>

**正确答案：B**
对象通过引用传递。 当我们检查对象的严格相等性（===）时，我们正在比较它们的引用。
我们将“person2”的默认值设置为“person”对象，并将“person”对象作为“person1”的值传递。
这意味着两个值都引用内存中的同一位置，因此它们是相等的。
运行“ else”语句中的代码块，并记录`They are the same!` 。

</details>

## 57. 结果是什么? {#question-be757fef-dbff-48f4-b401-d7f04238cc81}

> 难度：0.5 · 类型：Choice

```javascript
Promise.resolve(5)
```

- A. 5
- B. Promise {<pending>: 5}
- C. Promise {<fulfilled>: 5}
- D. Error

### 题目要点

我们可以将我们想要的任何类型的值传递`Promise.resolve`，无论是否`promise`。 该方法本身返回带有已解析值的`Promise` (`<fulfilled>`)。 如果您传递常规函数，它将是具有常规值的已解决`promise`。 如果你通过了promise，它将是一个已经resolved的且带有传的值的promise。 上述情况，我们传了数字5，因此返回一个resolved状态的promise，resolve值为`5`

<details>
<summary>参考答案</summary>

**正确答案：C**
我们可以将我们想要的任何类型的值传递`Promise.resolve`，无论是否`promise`。 该方法本身返回带有已解析值的`Promise` (`<fulfilled>`)。 如果您传递常规函数，它将是具有常规值的已解决`promise`。 如果你通过了promise，它将是一个已经resolved的且带有传的值的promise。
上述情况，我们传了数字5，因此返回一个resolved状态的promise，resolve值为`5`

</details>

## 58. 输出什么? {#question-8318d81a-7336-466e-9761-cbd175ccfd2c}

> 难度：0.5 · 类型：Choice

```javascript
const set = new Set()

set.add(1)
set.add("Lydia")
set.add({ name: "Lydia" })

for (let item of set) {
  console.log(item + 2)
}
```

- A. 3, NaN, NaN
- B. 3, 7, NaN
- C. 3, Lydia2, [object Object]2
- D. "12", Lydia2, [object Object]2

### 题目要点

这个JavaScript代码片段创建了一个 Set ，并将三个不同类型的元素添加到其中：数字1，字符串"Lydia"和一个包含属性`name`的对象 `{ name: "Lydia" }`。然后，使用`for...of`循环遍历Set中的每个元素，并将每个元素的值与2相加后打印出来。

<details>
<summary>参考答案</summary>

**正确答案：C**
这个JavaScript代码片段创建了一个 Set ，并将三个不同类型的元素添加到其中：数字1，字符串"Lydia"和一个包含属性`name`的对象 `{ name: "Lydia" }`。然后，使用`for...of`循环遍历Set中的每个元素，并将每个元素的值与2相加后打印出来。

让我们一步一步来看代码：

1. `const set = new Set()`: 创建了一个名为`set`的空Set。

2. `set.add(1)`: 将数字1添加到Set中。

3. `set.add("Lydia")`: 将字符串"Lydia"添加到Set中。

4. `set.add({ name: "Lydia" })`: 将包含属性`name`的对象 `{ name: "Lydia" }` 添加到Set中。

5. `for (let item of set) { ... }`: 这是一个`for...of`循环，用于遍历Set中的每个元素。它将遍历所有三个元素：数字1，字符串"Lydia"和对象 `{ name: "Lydia" }`。

6. `console.log(item + 2)`: 此行将在循环中打印每个元素（1，"Lydia"和 `{ name: "Lydia" }`），并在它们的值上加上2。

然而，由于Set中包含不同的数据类型（数字、字符串和对象），`+`运算符在不同类型的元素上的行为也不同：

1. 对于数字1：`1 + 2` 将得到 `3`。
2. 对于字符串"Lydia"：`"Lydia" + 2` 将把字符串和数字连接起来，结果是 `"Lydia2"`。
3. 对于对象 `{ name: "Lydia" }`：对象没有定义`+`运算符的行为，所以 `"[object Object]" + 2` 将被打印。

循环的输出结果将是：

```
3
Lydia2
[object Object]2
```

</details>

## 59. 依次输出什么? {#question-fe86322b-4990-4f6b-a473-d37a8e3ecb2d}

> 难度：1 · 类型：Choice

```javascript
const myPromise = () => Promise.resolve('I have resolved!')

function firstFunction() {
  myPromise().then(res => console.log(res))
  console.log('second')
}

async function secondFunction() {
  console.log(await myPromise())
  console.log('second')
}

firstFunction()
secondFunction()
```

- A. I have resolved!, second, I have resolved!, second
- B. second, I have resolved!, second, I have resolved!
- C. I have resolved!, second, second, I have resolved!
- D. second, I have resolved!, I have resolved!, second

### 题目要点

该题执行顺序为：

<details>
<summary>参考答案</summary>

**正确答案：D**
该题执行顺序为：

* 执行firstFunction()函数，进入函数执行MyPromise() ，然后将resolve()放入微队列，打印 second
* 继续执行 secondFunction()函数，执行await后面语句，mypromise()放入微队列，后续代码也放入。

此时同步任务执行完成，执行微任务队列中的任务因此最终结果为 `second, I have resolved, I have resolved, second`，所以答案为 `D`

</details>

## 60. 输出什么? {#question-a0544c68-4798-4f40-b233-bc3510170371}

> 难度：0.5 · 类型：Choice

```javascript
const one = (false || {} || null)
const two = (null || false || "")
const three = ([] || 0 || true)

console.log(one, two, three)
```

- A. false null []
- B. null "" true
- C. {} "" []
- D. null null true

### 题目要点

使用`||`运算符，我们可以返回第一个真值。 如果所有值都是假值，则返回最后一个值。 `（false || {} || null）`：空对象`{}`是一个真值。 这是第一个（也是唯一的）真值，它将被返回。`one`等于`{}`。 `（null || false ||“”）`：所有值都是假值。 这意味着返回传递的值`""`。 `two`等于`""`。 `（[] || 0 ||“”）`：空数组`[]`是一个真值。 这是第一个返回的真值。 `three`等于`[]`。

<details>
<summary>参考答案</summary>

**正确答案：C**
使用`||`运算符，我们可以返回第一个真值。 如果所有值都是假值，则返回最后一个值。
`（false || {} || null）`：空对象`{}`是一个真值。 这是第一个（也是唯一的）真值，它将被返回。`one`等于`{}`。
`（null || false ||“”）`：所有值都是假值。 这意味着返回传递的值`""`。 `two`等于`""`。
`（[] || 0 ||“”）`：空数组`[]`是一个真值。 这是第一个返回的真值。 `three`等于`[]`。

</details>

## 61. 输出什么? {#question-00146aa9-9e0e-4217-a99e-9404476520a1}

> 难度：0.5 · 类型：Choice

```javascript
// 🎉✨ This is my 100th question! ✨🎉

const output = `${[] && 'Im'}possible!
You should${'' && `n't`} see a therapist after so much JavaScript lol`
```

- A. possible! You should see a therapist after so much JavaScript lol
- B. Impossible! You should see a therapist after so much JavaScript lol
- C. possible! You shouldn't see a therapist after so much JavaScript lol
- D. Impossible! You shouldn't see a therapist after so much JavaScript lol

### 题目要点

`[]`是一个真值。 使用`&&`运算符，如果左侧值是真值，则返回右侧值。 在这种情况下，左侧值`[]`是一个真值，所以返回`Im`。 `""`是一个假值。 如果左侧值是假的，则不返回任何内容。 `n't`不会被退回。

<details>
<summary>参考答案</summary>

**正确答案：B**
`[]`是一个真值。 使用`&&`运算符，如果左侧值是真值，则返回右侧值。 在这种情况下，左侧值`[]`是一个真值，所以返回`Im`。
`""`是一个假值。 如果左侧值是假的，则不返回任何内容。 `n't`不会被退回。

</details>

## 62. 输出什么? {#question-80d02415-01b5-428f-a5a5-3021d2ce9b75}

> 难度：0.5 · 类型：Choice

```javascript
const name = "Lydia"

console.log(name())
```

- A. SyntaxError
- B. ReferenceError
- C. TypeError
- D. undefined

### 题目要点

变量`name`保存字符串的值，该字符串不是函数，因此无法调用。 当值不是预期类型时，会抛出`TypeErrors`。 JavaScript期望`name`是一个函数，因为我们试图调用它。 但它是一个字符串，因此抛出`TypeError`：`name is not a function` 当你编写了一些非有效的JavaScript时，会抛出语法错误，例如当你把`return`这个词写成`retrun`时。 当JavaScript无法找到您尝试访问的值的引用时，抛出`Refer…

<details>
<summary>参考答案</summary>

**正确答案：C**
变量`name`保存字符串的值，该字符串不是函数，因此无法调用。
当值不是预期类型时，会抛出`TypeErrors`。 JavaScript期望`name`是一个函数，因为我们试图调用它。 但它是一个字符串，因此抛出`TypeError`：`name is not a function`
当你编写了一些非有效的JavaScript时，会抛出语法错误，例如当你把`return`这个词写成`retrun`时。
当JavaScript无法找到您尝试访问的值的引用时，抛出`ReferenceErrors`。

</details>

## 63. 输出什么? {#question-da532e2b-898c-4a7d-b179-fbe8052c8c60}

> 难度：0.5 · 类型：Choice

```javascript
const getList = ([x, ...y]) => [x, y]
const getUser = user => ({ name: user.name, age: user.age })

const list = [1, 2, 3, 4]
const user = { name: "Lydia", age: 21 }

console.log(getList(list))
console.log(getUser(user))
```

- A. [1, [2, 3, 4]] 、 undefined
- B. [1, [2, 3, 4]] 、 { name: "Lydia", age: 21 }
- C. [1, 2, 3, 4] 、 { name: "Lydia", age: 21 }
- D. Error 、 { name: "Lydia", age: 21 }

### 题目要点

`getList`函数接收一个数组作为其参数。

<details>
<summary>参考答案</summary>

**正确答案：B**
`getList`函数接收一个数组作为其参数。

在`getList`函数的括号之间，我们立即解构这个数组。

可以将其视为：
 `[x, ...y] = [1, 2, 3, 4]`
使用剩余的参数`... y`，我们将所有剩余参数放在一个数组中。 在这种情况下，其余的参数是`2`，`3`和`4`。 `y`的值是一个数组，包含所有其余参数。 在这种情况下，`x`的值等于`1`，所以当我们打印`[x，y]`时，会打印`[1，[2,3,4]]`。

 `getUser`函数接收一个对象。对于箭头函数，如果只返回一个值，我们不必编写花括号。但是，如果一个箭头函数返回了一个对象，就必须在圆括号之间编写它，否则就会报错。

</details>

## 64. 输出什么? {#question-cac139d1-256d-4124-829d-5ca355a99144}

> 难度：0.5 · 类型：Choice

```javascript
const info = {
  [Symbol('a')]: 'b'
}

console.log(info)
console.log(Object.keys(info))
```

- A. {Symbol('a'): 'b'} and ["{Symbol('a')"]
- B. {} and []
- C. { a: "b" } and ["a"]
- D. {Symbol('a'): 'b'} and []

### 题目要点

`Symbol`类型是不可枚举的。`Object.keys`方法返回对象上的所有可枚举的键属性。`Symbol`类型是不可见的，并返回一个空数组。 记录整个对象时，所有属性都是可见的，甚至是不可枚举的属性。 这是`Symbol`的众多特性之一：除了表示完全唯一的值（防止对象意外名称冲突，例如当使用2个想要向同一对象添加属性的库时），您还可以`隐藏`这种方式对象的属性（尽管不完全。你仍然可以使用`Object.getOwnPropertySymbols()`方法访问 `Symb…

<details>
<summary>参考答案</summary>

**正确答案：D**
`Symbol`类型是不可枚举的。`Object.keys`方法返回对象上的所有可枚举的键属性。`Symbol`类型是不可见的，并返回一个空数组。 记录整个对象时，所有属性都是可见的，甚至是不可枚举的属性。
这是`Symbol`的众多特性之一：除了表示完全唯一的值（防止对象意外名称冲突，例如当使用2个想要向同一对象添加属性的库时），您还可以`隐藏`这种方式对象的属性（尽管不完全。你仍然可以使用`Object.getOwnPropertySymbols()`方法访问 `Symbol`。

</details>

## 65. 输出什么? {#question-3f8c30d2-789e-4108-80c2-30bc0f4ed50c}

> 难度：0.5 · 类型：Choice

```javascript
class Person {
  constructor() {
    this.name = "Lydia"
  }
}

Person = class AnotherPerson {
  constructor() {
    this.name = "Sarah"
  }
}

const member = new Person()
console.log(member.name)
```

- A. "Lydia"
- B. "Sarah"
- C. Error: cannot redeclare Person
- D. SyntaxError

### 题目要点

我们可以将类设置为等于其他类/函数构造函数。 在这种情况下，我们将`Person`设置为`AnotherPerson`。 这个构造函数的名字是`Sarah`，所以新的`Person`实例`member`上的name属性是`Sarah`。

<details>
<summary>参考答案</summary>

**正确答案：B**
我们可以将类设置为等于其他类/函数构造函数。 在这种情况下，我们将`Person`设置为`AnotherPerson`。 这个构造函数的名字是`Sarah`，所以新的`Person`实例`member`上的name属性是`Sarah`。

</details>

## 66. 输出是什么? {#question-73f2cb7c-2613-4f06-8777-f72b1778a28b}

> 难度：1 · 类型：Choice

```javascript
function nums(a, b) {
  if
  (a > b)
  console.log('a is bigger')
  else
  console.log('b is bigger')
  return
  a + b
}

console.log(nums(4, 2))
console.log(nums(1, 2))
```

- A. a is bigger, 6 and b is bigger, 3
- B. a is bigger, undefined and b is bigger, undefined
- C. undefined and undefined
- D. SyntaxError

### 题目要点

在JavaScript中，我们不必显式地编写分号(`;`)，但是JavaScript引擎仍然在语句之后自动添加分号。这称为**自动分号插入**。例如，一个语句可以是变量，或者像`throw`、`return`、`break`这样的关键字。 在这里，我们在新的一行上写了一个`return`语句和另一个值`a + b `。然而，由于它是一个新行，引擎并不知道它实际上是我们想要返回的值。相反，它会在`return`后面自动添加分号。你可以这样看:

<details>
<summary>参考答案</summary>

**正确答案：B**
在JavaScript中，我们不必显式地编写分号(`;`)，但是JavaScript引擎仍然在语句之后自动添加分号。这称为**自动分号插入**。例如，一个语句可以是变量，或者像`throw`、`return`、`break`这样的关键字。
在这里，我们在新的一行上写了一个`return`语句和另一个值`a + b `。然而，由于它是一个新行，引擎并不知道它实际上是我们想要返回的值。相反，它会在`return`后面自动添加分号。你可以这样看:
```javascript
  return;
  a + b
```
这意味着永远不会到达`a + b`，因为函数在`return`关键字之后停止运行。如果没有返回值，就像这里，函数返回`undefined`。注意，在`if/else`语句之后没有自动插入!

</details>

## 67. 输出什么? {#question-37021e43-c8e8-4664-afa2-0c16eee6e4b2}

> 难度：1 · 类型：Choice

```javascript
function getItems(fruitList, ...args, favoriteFruit) {
  return [...fruitList, ...args, favoriteFruit]
}

getItems(["banana", "apple"], "pear", "orange")
```

- A. ["banana", "apple", "pear", "orange"]
- B. [["banana", "apple"], "pear", "orange"]
- C. ["banana", "apple", ["pear"], "orange"]
- D. SyntaxError

### 题目要点

`... args`是剩余参数，剩余参数的值是一个包含所有剩余参数的数组，**并且只能作为最后一个参数**。上述示例中，剩余参数是第二个参数，这是不可能的，并会抛出语法错误。

<details>
<summary>参考答案</summary>

**正确答案：D**
`... args`是剩余参数，剩余参数的值是一个包含所有剩余参数的数组，**并且只能作为最后一个参数**。上述示例中，剩余参数是第二个参数，这是不可能的，并会抛出语法错误。
```javascript
function getItems(fruitList, favoriteFruit, ...args) {
  return [...fruitList, ...args, favoriteFruit]
}
getItems(["banana", "apple"], "pear", "orange")
```
上述例子是有效的，将会返回数组：`[ 'banana', 'apple', 'orange', 'pear' ]`

</details>

## 68. 输出什么? {#question-04705905-b7f4-41cc-8828-1b14f2f42af2}

> 难度：0.5 · 类型：Choice

```javascript
const person = {
  name: "Lydia",
  age: 21
}

for (const [x, y] of Object.entries(person)) {
  console.log(x, y)
}
```

- A. name Lydia and age 21
- B. ["name", "Lydia"] and ["age", 21]
- C. ["name", "age"] and undefined
- D. Error

### 题目要点

`Object.entries()`方法返回一个给定对象自身可枚举属性的键值对数组，上述情况返回一个二维数组，数组每个元素是一个包含键和值的数组： `[['name'，'Lydia']，['age'，21]]` 使用`for-of`循环，我们可以迭代数组中的每个元素，上述情况是子数组。 我们可以使用`const [x，y]`在`for-of`循环中解构子数组。 `x`等于子数组中的第一个元素，`y`等于子数组中的第二个元素。 第一个子阵列是`[“name”，“Lydia”]`…

<details>
<summary>参考答案</summary>

**正确答案：A**
`Object.entries()`方法返回一个给定对象自身可枚举属性的键值对数组，上述情况返回一个二维数组，数组每个元素是一个包含键和值的数组：
`[['name'，'Lydia']，['age'，21]]`
使用`for-of`循环，我们可以迭代数组中的每个元素，上述情况是子数组。 我们可以使用`const [x，y]`在`for-of`循环中解构子数组。 `x`等于子数组中的第一个元素，`y`等于子数组中的第二个元素。
第一个子阵列是`[“name”，“Lydia”]`，其中`x`等于`name`，而`y`等于`Lydia`。
第二个子阵列是`[“age”，21]`，其中`x`等于`age`，而`y`等于`21`。

</details>

## 69. 输出什么? {#question-dd7273e3-f9be-4cde-a77a-693a02fc967a}

> 难度：1 · 类型：Choice

```javascript
function giveLydiaPizza() {
  return "Here is pizza!"
}

const giveLydiaChocolate = () => "Here's chocolate... now go hit the gym already."

console.log(giveLydiaPizza.prototype)
console.log(giveLydiaChocolate.prototype)
```

- A. { constructor: ...} { constructor: ...}
- B. {} { constructor: ...}
- C. { constructor: ...} {}
- D. { constructor: ...} undefined

### 题目要点

常规函数，例如`giveLydiaPizza`函数，有一个`prototype`属性，它是一个带有`constructor`属性的对象（原型对象）。 然而，箭头函数，例如`giveLydiaChocolate`函数，没有这个`prototype`属性。 尝试使用`giveLydiaChocolate.prototype`访问`prototype`属性时会返回`undefined`。

<details>
<summary>参考答案</summary>

**正确答案：D**
常规函数，例如`giveLydiaPizza`函数，有一个`prototype`属性，它是一个带有`constructor`属性的对象（原型对象）。 然而，箭头函数，例如`giveLydiaChocolate`函数，没有这个`prototype`属性。 尝试使用`giveLydiaChocolate.prototype`访问`prototype`属性时会返回`undefined`。

</details>

## 70. 输出什么? {#question-8454a7ca-e1c0-4f25-abc3-4c8528593056}

> 难度：1 · 类型：Choice

```javascript
let newList = [1, 2, 3].push(4)

console.log(newList.push(5))
```

- A. [1, 2, 3, 4, 5]
- B. [1, 2, 3, 5]
- C. [1, 2, 3, 4]
- D. Error

### 题目要点

`.push`方法返回数组的长度，而不是数组本身！ 通过将`newList`设置为`[1,2,3].push(4)`，实际上`newList`等于数组的新长度：`4`。 然后，尝试在`newList`上使用`.push`方法。 由于`newList`是数值`4`，抛出TypeError。

<details>
<summary>参考答案</summary>

**正确答案：D**
`.push`方法返回数组的长度，而不是数组本身！ 通过将`newList`设置为`[1,2,3].push(4)`，实际上`newList`等于数组的新长度：`4`。
然后，尝试在`newList`上使用`.push`方法。 由于`newList`是数值`4`，抛出TypeError。

</details>

## 71. 输出什么? {#question-29c67c75-924b-461b-9a71-c5e0fd5e42ef}

> 难度：1 · 类型：Choice

```javascript
class Person {
  constructor(name) {
    this.name = name
  }
}

const member = new Person("John")
console.log(typeof member)
```

- A. "class"
- B. "function"
- C. "object"
- D. "string"

### 题目要点

类是构造函数的语法糖，如果用构造函数的方式来重写`Person`类则将是：

<details>
<summary>参考答案</summary>

**正确答案：C**
类是构造函数的语法糖，如果用构造函数的方式来重写`Person`类则将是：
```javascript
function Person() {
  this.name = name
}
```
通过`new`来调用构造函数，将会生成构造函数`Person`的实例，对实例执行`typeof`关键字将返回`"object"`，上述情况打印出`"object"`。

</details>

## 72. 输出什么? {#question-e8cd42a6-0df3-4e16-b6dd-d294756b5c21}

> 难度：0.5 · 类型：Choice

```javascript
// module.js
export default () => "Hello world"
export const name = "Lydia"

// index.js
import * as data from "./module"

console.log(data)
```

- A. { default: function default(), name: "Lydia" }
- B. { default: function default() }
- C. { default: "Hello world", name: "Lydia" }
- D. Global object of module.js

### 题目要点

使用`import * as name`语法，我们将`module.js`文件中所有`export`导入到`index.js`文件中，并且创建了一个名为`data`的新对象。 在`module.js`文件中，有两个导出：默认导出和命名导出。 默认导出是一个返回字符串“Hello World”的函数，命名导出是一个名为`name`的变量，其值为字符串`“Lydia”`。 `data`对象具有默认导出的`default`属性，其他属性具有指定exports的名称及其对应的值。

<details>
<summary>参考答案</summary>

**正确答案：A**
使用`import * as name`语法，我们将`module.js`文件中所有`export`导入到`index.js`文件中，并且创建了一个名为`data`的新对象。 在`module.js`文件中，有两个导出：默认导出和命名导出。 默认导出是一个返回字符串“Hello World”的函数，命名导出是一个名为`name`的变量，其值为字符串`“Lydia”`。
`data`对象具有默认导出的`default`属性，其他属性具有指定exports的名称及其对应的值。

</details>

## 73. 输出什么? {#question-8bfd0ee4-896b-4e7e-bf7f-234a54344dd7}

> 难度：1 · 类型：Choice

```javascript
function sum(num1, num2 = num1) {
  console.log(num1 + num2)
}

sum(10)
```

- A. NaN
- B. 20
- C. ReferenceError
- D. undefined

### 题目要点

您可以将默认参数的值设置为函数的另一个参数，只要另一个参数定义在其之前即可。 我们将值`10`传递给`sum`函数。 如果`sum`函数只接收1个参数，则意味着没有传递`num2`的值，这种情况下，`num1`的值等于传递的值`10`。 `num2`的默认值是`num1`的值，即`10`。 ```num1 + num2```返回`20`。 如果您尝试将默认参数的值设置为后面定义的参数，则可能导致参数的值尚未初始化，从而引发错误。比如：

<details>
<summary>参考答案</summary>

**正确答案：B**
您可以将默认参数的值设置为函数的另一个参数，只要另一个参数定义在其之前即可。 我们将值`10`传递给`sum`函数。 如果`sum`函数只接收1个参数，则意味着没有传递`num2`的值，这种情况下，`num1`的值等于传递的值`10`。 `num2`的默认值是`num1`的值，即`10`。 ```num1 + num2```返回`20`。
如果您尝试将默认参数的值设置为后面定义的参数，则可能导致参数的值尚未初始化，从而引发错误。比如：
```js
function test(m = n, n = 2) {
    console.log(m, n)
}
test() // Uncaught ReferenceError: Cannot access 'n' before initialization
test(3) // 3 2
test(3, 4) // 3 4
```

</details>

## 74. 输出什么? {#question-2e7f32d3-6c83-42f0-adbc-262e4dd53db1}

> 难度：0.5 · 类型：Choice

```javascript
console.log("I want pizza"[0])
```

- A. """
- B. "I"
- C. SyntaxError
- D. undefined

### 题目要点

可以使用方括号表示法获取字符串中特定索引的字符，字符串中的第一个字符具有索引0，依此类推。 在这种情况下，我们想要得到索引为0的元素，字符`'I'`被记录。 请注意，IE7及更低版本不支持此方法。 在这种情况下，应该使用`.charAt（）`

<details>
<summary>参考答案</summary>

**正确答案：B**
可以使用方括号表示法获取字符串中特定索引的字符，字符串中的第一个字符具有索引0，依此类推。 在这种情况下，我们想要得到索引为0的元素，字符`'I'`被记录。
请注意，IE7及更低版本不支持此方法。 在这种情况下，应该使用`.charAt（）`

</details>

## 75. 哪个选项是将 hasName 设置为 true 的方法（不能将true作为参数传递）? {#question-0b4af1f7-d0bc-4a85-8c28-f620b5d6d23e}

> 难度：1 · 类型：Choice

```javascript
function getName(name) {
  const hasName = //
}
```

- A. !!name
- B. name
- C. new Boolean(name)
- D. name.length

### 题目要点

使用逻辑非运算符`!`，将返回一个布尔值，使用`!! name`，我们可以确定`name`的值是真的还是假的。 如果`name`是真实的，那么`!name`返回`false`。 `!false`返回`true`。 通过将`hasName`设置为`name`，可以将`hasName`设置为等于传递给`getName`函数的值，而不是布尔值`true`。 `new Boolean（true）`返回一个对象包装器，而不是布尔值本身。 `name.length`返回传递的参数的长度，…

<details>
<summary>参考答案</summary>

**正确答案：A**
使用逻辑非运算符`!`，将返回一个布尔值，使用`!! name`，我们可以确定`name`的值是真的还是假的。 如果`name`是真实的，那么`!name`返回`false`。 `!false`返回`true`。
通过将`hasName`设置为`name`，可以将`hasName`设置为等于传递给`getName`函数的值，而不是布尔值`true`。
`new Boolean（true）`返回一个对象包装器，而不是布尔值本身。
`name.length`返回传递的参数的长度，而不是布尔值`true`。

</details>

## 76. 下面代码的输出是什么？ {#question-0180cac7-51ae-4cc6-afe2-bfecf5448123}

> 难度：1 · 类型：Choice

```javascript
fetch('https://www.website.com/api/user/1')
  .then(res => res.json())
  .then(res => console.log(res))
```

- A. fetch方法的结果
- B. 第二次调用fetch方法的结果
- C. 前一个.then()中回调方法返回的结果
- D. 总是undefined

### 题目要点

第二个`.then`中`res`的值等于前一个`.then`中的回调函数返回的值。 你可以像这样继续链接`.then`，将值传递给下一个处理程序。

<details>
<summary>参考答案</summary>

**正确答案：C**
第二个`.then`中`res`的值等于前一个`.then`中的回调函数返回的值。 你可以像这样继续链接`.then`，将值传递给下一个处理程序。

</details>

## 77. 输出什么? {#question-59d6fb97-59bc-4f6c-ba90-cb16b96478ee}

> 难度：0.5 · 类型：Choice

```javascript
function checkAge(age) {
  if (age < 18) {
    const message = "Sorry, you're too young."
  } else {
    const message = "Yay! You're old enough!"
  }

  return message
}

console.log(checkAge(21))
```

- A. "Sorry, you're too young."
- B. "Yay! You're old enough!"
- C. ReferenceError
- D. undefined

### 题目要点

`const`和`let`声明的变量是具有**块级作用域**的，块是大括号（`{}`）之间的任何东西, 即上述情况`if / else`语句的花括号。 由于块级作用域，我们无法在声明的块之外引用变量，因此抛出`ReferenceError`。

<details>
<summary>参考答案</summary>

**正确答案：C**
`const`和`let`声明的变量是具有**块级作用域**的，块是大括号（`{}`）之间的任何东西, 即上述情况`if / else`语句的花括号。 由于块级作用域，我们无法在声明的块之外引用变量，因此抛出`ReferenceError`。

</details>

## 78. 输出什么? {#question-ca78ecad-b7a0-4d2c-ac4e-650f86800a77}

> 难度：1 · 类型：Choice

```javascript
const person = {
  name: "Lydia",
  age: 21
}

let city = person.city
city = "Amsterdam"

console.log(person)
```

- A. { name: "Lydia", age: 21 }
- B. { name: "Lydia", age: 21, city: "Amsterdam" }
- C. { name: "Lydia", age: 21, city: undefined }
- D. "Amsterdam"

### 题目要点

我们将变量`city`设置为等于`person`对象上名为`city`的属性的值。 这个对象上没有名为`city`的属性，因此变量`city`的值为`undefined`。 请注意，我们没有引用`person`对象本身，只是将变量`city`设置为等于`person`对象上`city`属性的当前值。 然后，我们将`city`设置为等于字符串`“Amsterdam”`。 这不会更改person对象：没有对该对象的引用。 因此打印`person`对象时，会返回未修改的对象。

<details>
<summary>参考答案</summary>

**正确答案：A**
我们将变量`city`设置为等于`person`对象上名为`city`的属性的值。 这个对象上没有名为`city`的属性，因此变量`city`的值为`undefined`。
请注意，我们没有引用`person`对象本身，只是将变量`city`设置为等于`person`对象上`city`属性的当前值。
然后，我们将`city`设置为等于字符串`“Amsterdam”`。 这不会更改person对象：没有对该对象的引用。
因此打印`person`对象时，会返回未修改的对象。

</details>

## 79. 输出什么? {#question-62b96cb2-ea9a-489f-9547-7bc8832a5913}

> 难度：1 · 类型：Choice

```javascript
var status = "😎"

setTimeout(() => {
  const status = "😍"

  const data = {
    status: "🥑",
    getStatus() {
      return this.status
    }
  }

  console.log(data.getStatus())
  console.log(data.getStatus.call(this))
}, 0)
```

- A. "🥑" and "😍"
- B. "🥑" and "😎"
- C. "😍" and "😎"
- D. "😎" and "😎"

### 题目要点

`this`关键字的指向取决于使用它的位置。 在**函数**中，比如`getStatus`，`this`指向的是调用它的对象，上述例子中`data`对象调用了`getStatus`，因此`this`指向的就是`data`对象。 当我们打印`this.status`时，`data`对象的`status`属性被打印，即`"🥑"`。 使用`call`方法，可以更改`this`指向的对象。`data.getStatus.call(this)`是将`this`的指向由`data`对象更…

<details>
<summary>参考答案</summary>

**正确答案：B**
`this`关键字的指向取决于使用它的位置。 在**函数**中，比如`getStatus`，`this`指向的是调用它的对象，上述例子中`data`对象调用了`getStatus`，因此`this`指向的就是`data`对象。 当我们打印`this.status`时，`data`对象的`status`属性被打印，即`"🥑"`。
使用`call`方法，可以更改`this`指向的对象。`data.getStatus.call(this)`是将`this`的指向由`data`对象更改为全局对象。在全局对象上，有一个名为`status`的变量，其值为`”😎“`。 因此打印`this.status`时，会打印`“😎”`。

</details>

## 80. 输出什么? {#question-50a3f8fb-9e65-4a24-b4e4-60c02bb26cdc}

> 难度：0.5 · 类型：Choice

```javascript
function sayHi(name) {
  return `Hi there, ${name}`
}

console.log(sayHi())
```

- A. Hi there,
- B. Hi there, undefined
- C. Hi there, null
- D. ReferenceError

### 题目要点

默认情况下，如果不给函数传参，参数的值将为`undefined`。 上述情况，我们没有给参数`name`传值。 `name`等于`undefined`，并被打印。 在ES6中，我们可以使用默认参数覆盖此默认的`undefined`值。 例如： `function sayHi（name =“Lydia”）{...}` 在这种情况下，如果我们没有传递值或者如果我们传递`undefined`，`name`总是等于字符串`Lydia`

<details>
<summary>参考答案</summary>

**正确答案：B**
默认情况下，如果不给函数传参，参数的值将为`undefined`。 上述情况，我们没有给参数`name`传值。 `name`等于`undefined`，并被打印。
在ES6中，我们可以使用默认参数覆盖此默认的`undefined`值。 例如：
`function sayHi（name =“Lydia”）{...}`
在这种情况下，如果我们没有传递值或者如果我们传递`undefined`，`name`总是等于字符串`Lydia`

</details>

## 81. 输出什么? {#question-37918a0a-0874-45e3-b510-4579e5941845}

> 难度：1 · 类型：Choice

```javascript
const list = [1 + 2, 1 * 2, 1 / 2]
console.log(list)
```

- A. ["1 + 2", "1 * 2", "1 / 2"]
- B. ["12", 2, 0.5]
- C. [3, 2, 0.5]
- D. [1, 1, 1]

### 题目要点

数组元素可以包含任何值。 数字，字符串，布尔值，对象，数组，`null`，`undeifned`, 以及其他表达式，如日期，函数和计算。 元素将等于返回的值。 `1 + 2`返回`3`，`1 * 2`返回'2`，'1 / 2`返回`0.5`。

<details>
<summary>参考答案</summary>

**正确答案：C**
数组元素可以包含任何值。 数字，字符串，布尔值，对象，数组，`null`，`undeifned`, 以及其他表达式，如日期，函数和计算。
元素将等于返回的值。 `1 + 2`返回`3`，`1 * 2`返回'2`，'1 / 2`返回`0.5`。

</details>

## 82. 输出什么? {#question-6dd078d0-5728-4901-acab-bda0f365347d}

> 难度：1 · 类型：Choice

```javascript
const myLifeSummedUp = ["☕", "💻", "🍷", "🍫"]

for (let item in myLifeSummedUp) {
  console.log(item)
}

for (let item of myLifeSummedUp) {
  console.log(item)
}
```

- A. 0 1 2 3 and "☕"  "💻" "🍷" "🍫"
- B. "☕"  "💻" "🍷" "🍫" and "☕"  "💻" "🍷" "🍫"
- C. "☕"  "💻" "🍷" "🍫" and 0 1 2 3
- D. 0 1 2 3 and {0: "☕", 1: "💻", 2: "🍷", 3: "🍫"}

### 题目要点

通过`for-in`循环，我们可以遍历一个对象**自有的**、**继承的**、**可枚举的**、**非Symbol的**属性。 在数组中，可枚举属性是数组元素的“键”， 即它们的索引。 类似于下面这个对象： `{0: "☕", 1: "💻", 2: "🍷", 3: "🍫"}` 其中键则是可枚举属性，因此 `0`，`1`，`2`，`3`被记录。 通过`for-of`循环，我们可以迭代**可迭代对象**（包括 `Array`，`Map`，`Set`，`String`，`argum…

<details>
<summary>参考答案</summary>

**正确答案：A**
通过`for-in`循环，我们可以遍历一个对象**自有的**、**继承的**、**可枚举的**、**非Symbol的**属性。 在数组中，可枚举属性是数组元素的“键”， 即它们的索引。 类似于下面这个对象：
`{0: "☕", 1: "💻", 2: "🍷", 3: "🍫"}`
其中键则是可枚举属性，因此 `0`，`1`，`2`，`3`被记录。
通过`for-of`循环，我们可以迭代**可迭代对象**（包括 `Array`，`Map`，`Set`，`String`，`arguments`等）。当我们迭代数组时，在每次迭代中，不同属性的值将被分配给变量`item`, 因此`“☕”`，`“💻”`，`“🍷”`，`“🍫”`被打印。

</details>

## 83. 输出什么? {#question-56056900-f049-488c-a973-9788cc708e7b}

> 难度：1.5 · 类型：Choice

```javascript
const add = () => {
  const cache = {};
  return num => {
    if (num in cache) {
      return `From cache! ${cache[num]}`;
    } else {
      const result = num + 10;
      cache[num] = result;
      return `Calculated! ${result}`;
    }
  };
};

const addFunction = add();
console.log(addFunction(10));
console.log(addFunction(10));
console.log(addFunction(5 * 2));
```

- A. Calculated! 20 Calculated! 20 Calculated! 20
- B. Calculated! 20 From cache! 20 Calculated! 20
- C. Calculated! 20 From cache! 20 From cache! 20
- D. Calculated! 20 From cache! 20 Error

### 题目要点

`add`函数是一个记忆函数。 通过记忆化，我们可以缓存函数的结果，以加快其执行速度。上述情况，我们创建一个`cache`对象，用于存储先前返回过的值。

<details>
<summary>参考答案</summary>

**正确答案：C**
`add`函数是一个记忆函数。 通过记忆化，我们可以缓存函数的结果，以加快其执行速度。上述情况，我们创建一个`cache`对象，用于存储先前返回过的值。

如果我们使用相同的参数多次调用`addFunction`函数，它首先检查缓存中是否已有该值，如果有，则返回缓存值，这将节省执行时间。如果没有，那么它将计算该值，并存储在缓存中。

我们用相同的值三次调用了`addFunction`函数：

* 在第一次调用，`num`等于`10`时函数的值尚未缓存，if语句`num in cache`返回`false`，else块的代码被执行：`Calculated! 20`，并且其结果被添加到缓存对象，`cache`现在看起来像`{10：20}`。
* 第二次，`cache`对象包含`10`的返回值。 if语句 `num in cache` 返回`true`，`From cache! 20`被打印。
* 第三次，我们将`5 * 2`(值为10)传递给函数。 `cache`对象包含`10`的返回值。 if语句 `num in cache` 返回`true`，`From cache! 20`被打印。

</details>

## 84. 以下是个纯函数么? {#question-3172f055-5f37-4a60-9940-bb15c6a7d4b6}

> 难度：0.5 · 类型：Choice

```javascript
function sum(a, b) {
  return a + b;
}
```

- A. Yes
- B. No

### 题目要点

纯函数在相同的输入值时，需产生相同的输出，其输出的结果，与输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关。 纯函数不会产生副作用。 纯函数与副作用的定义可参考： https://zh.wikipedia.org/wiki/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)

<details>
<summary>参考答案</summary>

**正确答案：A**
纯函数在相同的输入值时，需产生相同的输出，其输出的结果，与输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关。
纯函数不会产生副作用。
纯函数与副作用的定义可参考：
https://zh.wikipedia.org/wiki/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)

</details>

## 85. 输出什么? {#question-4d6b5cd5-7b0d-460a-9a20-010d885349a0}

> 难度：0.5 · 类型：Choice

```javascript
const { name: myName } = { name: "Lydia" };

console.log(name);
```

- A. "Lydia"
- B. "myName"
- C. undefined
- D. ReferenceError

### 题目要点

当我们从右侧的对象解构属性`name`时，我们将其值`Lydia`分配给名为`myName`的变量。 使用`{name：myName}`，我们是在告诉JavaScript我们要创建一个名为`myName`的新变量，并且其值是右侧对象的`name`属性的值。 当我们尝试打印`name`，一个未定义的变量时，就会引发`ReferenceError`。

<details>
<summary>参考答案</summary>

**正确答案：D**
当我们从右侧的对象解构属性`name`时，我们将其值`Lydia`分配给名为`myName`的变量。
使用`{name：myName}`，我们是在告诉JavaScript我们要创建一个名为`myName`的新变量，并且其值是右侧对象的`name`属性的值。
当我们尝试打印`name`，一个未定义的变量时，就会引发`ReferenceError`。

</details>

## 86. 输出什么? {#question-58313b6b-5983-4414-8b85-81057f1c7d9a}

> 难度：1.5 · 类型：Choice

```javascript
const box = { x: 10, y: 20 };

Object.freeze(box);

const shape = box;
shape.x = 100;
console.log(shape)
```

- A. { x: 100, y: 20 }
- B. { x: 10, y: 20 }
- C. { x: 100 }
- D. ReferenceError

### 题目要点

`Object.freeze`使得无法添加、删除或修改对象的属性（除非属性的值是另一个对象）。 当我们创建变量`shape`并将其设置为等于冻结对象`box`时，`shape`指向的也是冻结对象。你可以使用`Object.isFrozen`检查一个对象是否被冻结，上述情况，`Object.isFrozen（shape）`将返回`true`。 由于`shape`被冻结，并且`x`的值不是对象，所以我们不能修改属性`x`。 `x`仍然等于`10`，`{x：10，y：20}`被打印…

<details>
<summary>参考答案</summary>

**正确答案：B**
`Object.freeze`使得无法添加、删除或修改对象的属性（除非属性的值是另一个对象）。
当我们创建变量`shape`并将其设置为等于冻结对象`box`时，`shape`指向的也是冻结对象。你可以使用`Object.isFrozen`检查一个对象是否被冻结，上述情况，`Object.isFrozen（shape）`将返回`true`。
由于`shape`被冻结，并且`x`的值不是对象，所以我们不能修改属性`x`。 `x`仍然等于`10`，`{x：10，y：20}`被打印。
注意，上述例子我们对属性`x`进行修改，可能会导致抛出TypeError异常（最常见但不仅限于严格模式下时）。

</details>

## 87. 输出什么? {#question-4d2b6272-e362-4c49-bf69-7f2c2e253e61}

> 难度：0.5 · 类型：Choice

```javascript
function addToList(item, list) {
  return list.push(item);
}

const result = addToList("apple", ["banana"]);
console.log(result);
```

- A. ['apple', 'banana']
- B. 2
- C. true
- D. undefined

### 题目要点

`push()`方法返回新数组的长度。一开始，数组包含一个元素（字符串`"banana"`），长度为1。 在数组中添加字符串`"apple"`后，长度变为2，并将从`addToList`函数返回。 `push`方法修改原始数组，如果你想从函数返回数组而不是数组长度，那么应该在push `item`之后返回`list`。

<details>
<summary>参考答案</summary>

**正确答案：B**
`push()`方法返回新数组的长度。一开始，数组包含一个元素（字符串`"banana"`），长度为1。 在数组中添加字符串`"apple"`后，长度变为2，并将从`addToList`函数返回。
`push`方法修改原始数组，如果你想从函数返回数组而不是数组长度，那么应该在push `item`之后返回`list`。

</details>

## 88. 输出什么? {#question-fa5c044e-7c3c-4995-b929-09b950d82a16}

> 难度：1 · 类型：Choice

```javascript
async function getData() {
  return await Promise.resolve("I made it!");
}

const data = getData();
console.log(data);
```

- A. "I made it!"
- B. Promise {<resolved>: "I made it!"}
- C. Promise {<pending>}
- D. undefined

### 题目要点

异步函数始终返回一个promise。`await`仍然需要等待promise的解决：当我们调用`getData()`并将其赋值给`data`，此时`data`为`getData`方法返回的一个挂起的promise，该promise并没有解决。 如果我们想要访问已解决的值`"I made it!"`，可以在`data`上使用`.then()`方法： `data.then(res => console.log(res))` 这样将打印 `"I made it!"`

<details>
<summary>参考答案</summary>

**正确答案：C**
异步函数始终返回一个promise。`await`仍然需要等待promise的解决：当我们调用`getData()`并将其赋值给`data`，此时`data`为`getData`方法返回的一个挂起的promise，该promise并没有解决。
如果我们想要访问已解决的值`"I made it!"`，可以在`data`上使用`.then()`方法：
`data.then(res => console.log(res))`
这样将打印 `"I made it!"`

</details>

## 89. 输出什么? {#question-69fc3145-fc55-4a19-87be-9dd486c16eae}

> 难度：0.5 · 类型：Choice

```javascript
console.log(String.raw`Hello\nworld`);
```

- A. Hello world!
- B. Hello <br />&nbsp; &nbsp; &nbsp;world
- C. Hello\nworld
- D. Hello\n <br /> &nbsp; &nbsp; &nbsp;world

### 题目要点

`String.raw`函数是用来获取一个模板字符串的原始字符串的，它返回一个字符串，其中忽略了转义符（`\n`，`\v`，`\t`等）。但反斜杠可能造成问题，因为你可能会遇到下面这种类似情况：

<details>
<summary>参考答案</summary>

**正确答案：C**
`String.raw`函数是用来获取一个模板字符串的原始字符串的，它返回一个字符串，其中忽略了转义符（`\n`，`\v`，`\t`等）。但反斜杠可能造成问题，因为你可能会遇到下面这种类似情况：
```javascript
const path = `C:\Documents\Projects\table.html`
String.raw`${path}`
```
这将导致：
`"C:DocumentsProjects able.html"`
直接使用`String.raw`
```javascript
String.raw`C:\Documents\Projects\table.html`
```
它会忽略转义字符并打印：`C:\Documents\Projects\table.html`
上述情况，字符串是`Hello\nworld`被打印出。

</details>

## 90. 如何能打印出 console.log 语句后注释掉的值？ {#question-3476a4fe-f6a3-4a70-a364-edef0bb45fa8}

> 难度：1 · 类型：Choice

```javascript
function* startGame() {
  const answer = yield "Do you love JavaScript?";
  if (answer !== "Yes") {
    return "Oh wow... Guess we're gone here";
  }
  return "JavaScript loves you back ❤️";
}

const game = startGame();
console.log(/* 1 */); // Do you love JavaScript?
console.log(/* 2 */); // JavaScript loves you back ❤️
```

- A. game.next("Yes").value and game.next().value
- B. game.next.value("Yes") and game.next.value()
- C. game.next().value and game.next("Yes").value
- D. game.next.value() and game.next.value("Yes")

### 题目要点

`generator`函数在遇到`yield`关键字时会“暂停”其执行。 首先，我们需要让函数产生字符串`Do you love JavaScript?`，这可以通过调用`game.next().value`来完成。上述函数的第一行就有一个`yield`关键字，那么运行立即停止了，`yield`表达式本身没有返回值，或者说总是返回`undefined`, 这意味着此时变量 `答案` 为`undefined` `next`方法可以带一个参数，该参数会被当作上一个 `yield`…

<details>
<summary>参考答案</summary>

**正确答案：C**
`generator`函数在遇到`yield`关键字时会“暂停”其执行。 首先，我们需要让函数产生字符串`Do you love JavaScript?`，这可以通过调用`game.next().value`来完成。上述函数的第一行就有一个`yield`关键字，那么运行立即停止了，`yield`表达式本身没有返回值，或者说总是返回`undefined`, 这意味着此时变量 `答案` 为`undefined`
`next`方法可以带一个参数，该参数会被当作上一个 `yield` 表达式的返回值。当我们调用`game.next("Yes").value`时，先前的 `yield` 的返回值将被替换为传递给`next()`函数的参数`"Yes"`。此时变量 `答案` 被赋值为 `"Yes"`，`if`语句返回`false`，所以`JavaScript loves you back ❤️`被打印。

</details>

## 91. 输出什么? {#question-e28517a7-ce0d-41af-b7a0-94a0baeb1477}

> 难度：0.5 · 类型：Choice

```javascript
console.log("🥑" + "💻");
```

- A. "🥑💻"
- B. 257548
- C. A string containing their code points
- D. Error

### 题目要点

使用`+`运算符，您可以连接字符串。 上述情况，我们将字符串`“🥑”`与字符串`”💻“`连接起来，产生`”🥑💻“`。

<details>
<summary>参考答案</summary>

**正确答案：A**
使用`+`运算符，您可以连接字符串。 上述情况，我们将字符串`“🥑”`与字符串`”💻“`连接起来，产生`”🥑💻“`。

</details>

## 92. 输出什么? {#question-1915f55c-162b-46ee-bf06-11194d67730c}

> 难度：0.5 · 类型：Choice

```javascript
const name = "Lydia Hallie"
console.log(name.padStart(13))
console.log(name.padStart(2))
```

- A. "Lydia Hallie", "Lydia Hallie"
- B. "           Lydia Hallie", "  Lydia Hallie" ("[13x whitespace]Lydia Hallie", "[2x whitespace]Lydia Hallie")
- C. " Lydia Hallie", "Lydia Hallie" ("[1x whitespace]Lydia Hallie", "Lydia Hallie")
- D. "Lydia Hallie", "Lyd"

### 题目要点

使用`padStart`方法，我们可以在字符串的开头添加填充。传递给此方法的参数是字符串的总长度（包含填充）。字符串`Lydia Hallie`的长度为`12`, 因此`name.padStart（13）`在字符串的开头只会插入1（`13 - 12 = 1`）个空格。 如果传递给`padStart`方法的参数小于字符串的长度，则不会添加填充。

<details>
<summary>参考答案</summary>

**正确答案：C**
使用`padStart`方法，我们可以在字符串的开头添加填充。传递给此方法的参数是字符串的总长度（包含填充）。字符串`Lydia Hallie`的长度为`12`, 因此`name.padStart（13）`在字符串的开头只会插入1（`13 - 12 = 1`）个空格。
如果传递给`padStart`方法的参数小于字符串的长度，则不会添加填充。

</details>

## 93. 输出什么? {#question-7f433ba8-03d7-4cab-b94b-535819249561}

> 难度：0.5 · 类型：Choice

```javascript
console.log(Number(2) === Number(2))
console.log(Boolean(false) === Boolean(false))
console.log(Symbol('foo') === Symbol('foo'))
```

- A. true, true, false
- B. false, true, false
- C. true, false, true
- D. true, true, true

### 题目要点

每个`Symbol`都是完全唯一的。传递给`Symbol`的参数只是给`Symbol`的一个描述。 `Symbol`的值不依赖于传递的参数。 当我们测试相等时，我们创建了两个全新的符号：第一个`Symbol（'foo'）`，第二个`Symbol（'foo'）`, 这两个值是唯一的，彼此不相等，因此返回`false`。

<details>
<summary>参考答案</summary>

**正确答案：A**
每个`Symbol`都是完全唯一的。传递给`Symbol`的参数只是给`Symbol`的一个描述。 `Symbol`的值不依赖于传递的参数。 当我们测试相等时，我们创建了两个全新的符号：第一个`Symbol（'foo'）`，第二个`Symbol（'foo'）`, 这两个值是唯一的，彼此不相等，因此返回`false`。

</details>

## 94. 输出什么? {#question-10cbc287-0f93-4fc0-8dde-a57ad1ec9208}

> 难度：0.5 · 类型：Choice

```javascript
// index.js
console.log('running index.js');
import { sum } from './sum.js';
console.log(sum(1, 2));

// sum.js
console.log('running sum.js');
export const sum = (a, b) => a + b;
```

- A. running index.js, running sum.js, 3
- B. running sum.js, running index.js, 3
- C. running sum.js, 3, running index.js
- D. running index.js, undefined, running sum.js

### 题目要点

`import`命令是编译阶段执行的，在代码运行之前。因此这意味着被导入的模块会先运行，而导入模块的文件会后执行。 这是CommonJS中`require（）`和`import`之间的区别。使用`require()`，您可以在运行代码时根据需要加载依赖项。 如果我们使用`require`而不是`import`，`running index.js`，`running sum.js`，`3`会被依次打印。

<details>
<summary>参考答案</summary>

**正确答案：B**
`import`命令是编译阶段执行的，在代码运行之前。因此这意味着被导入的模块会先运行，而导入模块的文件会后执行。
这是CommonJS中`require（）`和`import`之间的区别。使用`require()`，您可以在运行代码时根据需要加载依赖项。 如果我们使用`require`而不是`import`，`running index.js`，`running sum.js`，`3`会被依次打印。

</details>

## 95. 使用哪个构造函数可以成功继承 Dog 类? {#question-c591d4b9-eff8-4a29-b01b-50130bde5d3b}

> 难度：1 · 类型：Choice

```javascript
class Dog {
  constructor(name) {
    this.name = name;
  }
};

class Labrador extends Dog {
  // 1
  constructor(name, size) {
    this.size = size;
  }
  // 2
  constructor(name, size) {
    super(name);
    this.size = size;
  }
  // 3
  constructor(size) {
    super(name);
    this.size = size;
  }
  // 4
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }

};
```

- A. 1
- B. 2
- C. 3
- D. 4

### 题目要点

在子类中，在调用`super`之前不能访问到`this`关键字。 如果这样做，它将抛出一个`ReferenceError`：1和4将引发一个引用错误。 使用`super`关键字，需要用给定的参数来调用父类的构造函数。 父类的构造函数接收`name`参数，因此我们需要将`name`传递给`super`。 `Labrador`类接收两个参数，`name`参数是由于它继承了`Dog`，`size`作为`Labrador`类的额外属性，它们都需要传递给`Labrador`的构造函数，…

<details>
<summary>参考答案</summary>

**正确答案：B**
在子类中，在调用`super`之前不能访问到`this`关键字。 如果这样做，它将抛出一个`ReferenceError`：1和4将引发一个引用错误。
使用`super`关键字，需要用给定的参数来调用父类的构造函数。 父类的构造函数接收`name`参数，因此我们需要将`name`传递给`super`。
`Labrador`类接收两个参数，`name`参数是由于它继承了`Dog`，`size`作为`Labrador`类的额外属性，它们都需要传递给`Labrador`的构造函数，因此使用构造函数2正确完成。

</details>

## 96. 输出什么? {#question-30ae1cd5-9a7f-409b-9839-181f42fa6a15}

> 难度：0.5 · 类型：Choice

```javascript
[1, 2, 3, 4].reduce((x, y) => console.log(x, y));
```

- A. 1 2 and 3 3 and 6 4
- B. 1 2 and 2 3 and 3 4
- C. 1 undefined and 2 undefined and 3 undefined and 4 undefined
- D. 1 2 and undefined 3 and undefined 4

### 题目要点

`reducer` 函数接收4个参数:

<details>
<summary>参考答案</summary>

**正确答案：D**
`reducer` 函数接收4个参数:
1. Accumulator (acc) (累计器)
2. Current Value (cur) (当前值)
3. Current Index (idx) (当前索引)
4. Source Array (src) (源数组)
`reducer` 函数的返回值将会分配给累计器，该返回值在数组的每个迭代中被记住，并最后成为最终的单个结果值。
`reducer` 函数还有一个可选参数`initialValue`, 该参数将作为第一次调用回调函数时的第一个参数的值。如果没有提供`initialValue`，则将使用数组中的第一个元素。
在上述例子，`reduce`方法接收的第一个参数(Accumulator)是`x`, 第二个参数(Current Value)是`y`。
在第一次调用时，累加器`x`为`1`，当前值`“y”`为`2`，打印出累加器和当前值：`1`和`2`。
例子中我们的回调函数没有返回任何值，只是打印累加器的值和当前值。如果函数没有返回值，则默认返回`undefined`。 在下一次调用时，累加器为`undefined`，当前值为“3”, 因此`undefined`和`3`被打印出。
在第四次调用时，回调函数依然没有返回值。 累加器再次为 `undefined` ，当前值为“4”。 `undefined`和`4`被打印出。

</details>

## 97. 输出什么? {#question-16a99f71-99b2-4611-8d11-07e6b294660e}

> 难度：0.5 · 类型：Choice

```javascript
const value = { number: 10 };

const multiply = (x = { ...value }) => {
  console.log(x.number *= 2);
};

multiply();
multiply();
multiply(value);
multiply(value);
```

- A. 20, 40, 80, 160
- B. 20, 40, 20, 40
- C. 20, 20, 20, 40
- D. NaN, NaN, 20, 40

### 题目要点

在ES6中，我们可以使用默认值初始化参数。如果没有给函数传参，或者传的参值为 `"undefined"` ，那么参数的值将是默认值。上述例子中，我们将 `value` 对象进行了解构并传到一个新对象中，因此 `x` 的默认值为 `{number：10}` 。 默认参数在调用时才会进行计算，每次调用函数时，都会创建一个新的对象。我们前两次调用 `multiply` 函数且不传递值，那么每一次 `x` 的默认值都为 `{number：10}` ，因此打印出该数字的乘积值为`20`…

<details>
<summary>参考答案</summary>

**正确答案：C**
在ES6中，我们可以使用默认值初始化参数。如果没有给函数传参，或者传的参值为 `"undefined"` ，那么参数的值将是默认值。上述例子中，我们将 `value` 对象进行了解构并传到一个新对象中，因此 `x` 的默认值为 `{number：10}` 。
默认参数在调用时才会进行计算，每次调用函数时，都会创建一个新的对象。我们前两次调用 `multiply` 函数且不传递值，那么每一次 `x` 的默认值都为 `{number：10}` ，因此打印出该数字的乘积值为`20`。
第三次调用 `multiply` 时，我们传递了一个参数，即对象`value`。 `*=`运算符实际上是`x.number = x.number * 2`的简写，我们修改了`x.number`的值，并打印出值`20`。
第四次，我们再次传递`value`对象。 `x.number`之前被修改为`20`，所以`x.number * = 2`打印为`40`。

</details>

## 98. 输出是什么? {#question-baac6d08-4161-4949-a058-e1c5696791e0}

> 难度：1 · 类型：Choice

```javascript
let num = 10;

const increaseNumber = () => num++;
const increasePassedNumber = number => number++;

const num1 = increaseNumber();
const num2 = increasePassedNumber(num1);

console.log(num1);
console.log(num2);
```

- A. 10, 10
- B. 10, 11
- C. 11, 11
- D. 11, 12

### 题目要点

一元操作符 `++` _先返回_ 操作值, _再累加_ 操作值。`num1`的值是`10`, 因为`increaseNumber`函数首先返回`num`的值，也就是`10`，随后再进行 `num`的累加。 `num2`是`10`因为我们将 `num1`传入`increasePassedNumber`. `number`等于`10`（`num1`的值。同样道理，`++` _先返回_ 操作值, _再累加_ 操作值。） `number`是`10`，所以`num2`也是`10`.

<details>
<summary>参考答案</summary>

**正确答案：A**
一元操作符 `++` _先返回_ 操作值, _再累加_ 操作值。`num1`的值是`10`, 因为`increaseNumber`函数首先返回`num`的值，也就是`10`，随后再进行 `num`的累加。
`num2`是`10`因为我们将 `num1`传入`increasePassedNumber`. `number`等于`10`（`num1`的值。同样道理，`++` _先返回_ 操作值, _再累加_ 操作值。） `number`是`10`，所以`num2`也是`10`.

</details>

## 99. 输出是什么? {#question-2eb7d8d6-731e-444d-9f2f-c8bdea7f50eb}

> 难度：0.5 · 类型：Choice

```javascript
const settings = {
  username: "lydiahallie",
  level: 19,
  health: 90
};

const data = JSON.stringify(settings, ["level", "health"]);
console.log(data);
```

- A. "{"level":19, "health":90}"
- B. "{"username": "lydiahallie"}"
- C. "["level", "health"]"
- D. "{"username": "lydiahallie", "level":19, "health":90}"

### 题目要点

`JSON.stringify`的第二个参数是 _替代者(replacer)_. 替代者(replacer)可以是个函数或数组，用以控制哪些值如何被转换为字符串。 如果替代者(replacer)是个 _数组_ ，那么就只有包含在数组中的属性将会被转化为字符串。在本例中，只有名为`"level"` 和 `"health"` 的属性被包括进来， `"username"`则被排除在外。 `data` 就等于 `"{"level":19, "health":90}"`. 而如果替代者…

<details>
<summary>参考答案</summary>

**正确答案：A**
`JSON.stringify`的第二个参数是 _替代者(replacer)_. 替代者(replacer)可以是个函数或数组，用以控制哪些值如何被转换为字符串。
如果替代者(replacer)是个 _数组_ ，那么就只有包含在数组中的属性将会被转化为字符串。在本例中，只有名为`"level"` 和 `"health"` 的属性被包括进来， `"username"`则被排除在外。 `data` 就等于 `"{"level":19, "health":90}"`.
而如果替代者(replacer)是个 _函数_，这个函数将被对象的每个属性都调用一遍。
函数返回的值会成为这个属性的值，最终体现在转化后的JSON字符串中（译者注：Chrome下，经过实验，如果所有属性均返回同一个值的时候有异常，会直接将返回值作为结果输出而不会输出JSON字符串），而如果返回值为`undefined`，则该属性会被排除在外。

</details>

## 100. 输出是什么? {#question-576883a2-f601-4c53-9f8c-be61a07168bf}

> 难度：1 · 类型：Choice

```javascript
const person = { name: "Lydia" };

Object.defineProperty(person, "age", { value: 21 });

console.log(person);
console.log(Object.keys(person));
```

- A. { name: "Lydia", age: 21 }, ["name", "age"]
- B. { name: "Lydia", age: 21 }, ["name"]
- C. { name: "Lydia"}, ["name", "age"]
- D. { name: "Lydia"}, ["age"]

### 题目要点

通过`defineProperty`方法，我们可以给对象添加一个新属性，或者修改已经存在的属性。而我们使用`defineProperty`方法给对象添加了一个属性之后，属性默认为 _不可枚举(not enumerable)_. `Object.keys`方法仅返回对象中 _可枚举(enumerable)_ 的属性，因此只剩下了`"name"`. 用`defineProperty`方法添加的属性默认不可变。你可以通过`writable`, `configurable` 和 `e…

<details>
<summary>参考答案</summary>

**正确答案：B**
通过`defineProperty`方法，我们可以给对象添加一个新属性，或者修改已经存在的属性。而我们使用`defineProperty`方法给对象添加了一个属性之后，属性默认为 _不可枚举(not enumerable)_. `Object.keys`方法仅返回对象中 _可枚举(enumerable)_ 的属性，因此只剩下了`"name"`.
用`defineProperty`方法添加的属性默认不可变。你可以通过`writable`, `configurable` 和 `enumerable`属性来改变这一行为。这样的话， 相比于自己添加的属性，`defineProperty`方法添加的属性有了更多的控制权。

</details>

## 101. 输出是什么? {#question-43fc5697-d7c8-4d68-9ac7-f074d8a7b185}

> 难度：1 · 类型：Choice

```javascript
const user = { name: "Lydia", age: 21 };
const admin = { admin: true, ...user };

console.log(admin);
```

- A. { admin: true, user: { name: "Lydia", age: 21 } }
- B. { admin: true, name: "Lydia", age: 21 }
- C. { admin: true, user: ["Lydia", 21] }
- D. { admin: true }

### 题目要点

扩展运算符`...`为对象的组合提供了可能。你可以复制对象中的键值对，然后把它们加到另一个对象里去。在本例中，我们复制了`user`对象键值对，然后把它们加入到`admin`对象中。`admin`对象就拥有了这些键值对，所以结果为`{ admin: true, name: "Lydia", age: 21 }`.

<details>
<summary>参考答案</summary>

**正确答案：B**
扩展运算符`...`为对象的组合提供了可能。你可以复制对象中的键值对，然后把它们加到另一个对象里去。在本例中，我们复制了`user`对象键值对，然后把它们加入到`admin`对象中。`admin`对象就拥有了这些键值对，所以结果为`{ admin: true, name: "Lydia", age: 21 }`.

</details>

## 102. 输出是什么? {#question-a44172d8-ec2b-42f2-9efe-52af96e97ef8}

> 难度：0.5 · 类型：Choice

```javascript
const numbers = [1, 2, 3, 4, 5];
const [y] = numbers;

console.log(y);
```

- A. [[1, 2, 3, 4, 5]]
- B. [1, 2, 3, 4, 5]
- C. 1
- D. [1]

### 题目要点

输出是 `1`。

<details>
<summary>参考答案</summary>

**正确答案：C**
输出是 `1`。

在这段代码中，我们定义了一个名为 `numbers` 的数组，并使用解构赋值从 `numbers` 中提取第一个元素。解构赋值 `[y]` 将数组的第一个元素赋值给变量 `y`。

因此，当我们打印 `y` 时，它的值为 `1`，表示数组中的第一个元素。

</details>

## 103. 输出是什么? {#question-5fd03a9b-274c-4ea1-be11-e9b042022693}

> 难度：1 · 类型：Choice

```javascript
const name = "Lydia";
age = 21;

console.log(delete name);
console.log(delete age);
```

- A. false, true
- B. "Lydia", 21
- C. true, true
- D. undefined, undefined

### 题目要点

`delete` 操作符用于删除对象的某个属性；如果没有指向这个属性的引用，那它最终会被释放。

<details>
<summary>参考答案</summary>

**正确答案：A**
`delete` 操作符用于删除对象的某个属性；如果没有指向这个属性的引用，那它最终会被释放。

`delete`操作符返回一个布尔值： `true`指删除成功，否则返回`false`。但是通过 `var`, `const` 或 `let` 关键字声明的变量无法用 `delete` 操作符来删除。

`name`变量由`const`关键字声明，所以删除不成功:返回 `false`。

而我们设定`age`等于`21`时,我们实际上添加了一个名为`age`的属性给全局对象。对象中的属性是可以删除的，全局对象也是如此，所以`delete age`返回`true`.

----

20230201 更新：

有同学反馈， ”var 定义的变量可以使用 delete 操作符删除“，其实这个理解是错误的，大家可以直接试验，

```js
var a = 2
delete a  // false
```

而且 MDN 上也对 delete 的一些特殊情况有说明：

* 如果你试图删除的属性不存在，那么 delete 将不会起任何作用，但仍会返回 true
* 如果对象的原型链上有一个与待删除属性同名的属性，那么删除属性之后，对象会使用原型链上的那个属性（也就是说，`delete` 操作只会在自身的属性上起作用）
* 任何使用 var 声明的属性不能从全局作用域或函数的作用域中删除。
    * 这样的话，delete 操作不能删除任何在全局作用域中的函数（无论这个函数是来自于函数声明或函数表达式）
    * 除了在全局作用域中的函数不能被删除，在对象 (`object`) 中的函数是能够用 delete 操作删除的。
* 任何用 `let` 或 `const` 声明的属性不能够从它被声明的作用域中删除。
* 不可设置的 (`Non-configurable`) 属性不能被移除。这意味着像 `Math, Array, Object` 内置对象的属性以及使用`Object.defineProperty()` 方法设置为不可设置的属性不能被删除。

</details>

## 104. 输出是什么? {#question-19462061-029d-4111-a94e-a3b3ca87a1e1}

> 难度：1 · 类型：Choice

```javascript
// counter.js
let counter = 10;
export default counter;

// index.js
import myCounter from './counter';
myCounter += 1;
console.log(myCounter);
```

- A. 10
- B. 11
- C. Error
- D. NaN

### 题目要点

引入的模块是 _只读_ 的: 你不能修改引入的模块。只有导出他们的模块才能修改其值。 当我们给`myCounter`增加一个值的时候会抛出一个异常： `myCounter`是只读的，不能被修改。

<details>
<summary>参考答案</summary>

**正确答案：C**
引入的模块是 _只读_ 的: 你不能修改引入的模块。只有导出他们的模块才能修改其值。
当我们给`myCounter`增加一个值的时候会抛出一个异常： `myCounter`是只读的，不能被修改。

</details>

## 105. 输出是什么? {#question-e3c4f27f-343c-4b70-b95e-6163888c6eb5}

> 难度：0.5 · 类型：Choice

```javascript
const set = new Set([1, 1, 2, 3, 4]);

console.log(set);
```

- A. [1, 1, 2, 3, 4]
- B. [1, 2, 3, 4]
- C. {1, 1, 2, 3, 4}
- D. {1, 2, 3, 4}

### 题目要点

`Set`对象是独一无二的值的集合：也就是说同一个值在其中仅出现一次。 我们传入了数组`[1, 1, 2, 3, 4]`，他有一个重复值`1`.以为一个集合里不能有两个重复的值，其中一个就被移除了。所以结果是 `{1, 2, 3, 4}`.

<details>
<summary>参考答案</summary>

**正确答案：D**
`Set`对象是独一无二的值的集合：也就是说同一个值在其中仅出现一次。
我们传入了数组`[1, 1, 2, 3, 4]`，他有一个重复值`1`.以为一个集合里不能有两个重复的值，其中一个就被移除了。所以结果是 `{1, 2, 3, 4}`.

</details>

## 106. 下面代码的输出是什么? {#question-e5696d2f-2fdb-474a-b6d0-52f180eee942}

> 难度：0.5 · 类型：Choice

```javascript
class Dog {
  constructor(name) {
    this.name = name;
  }
}

Dog.prototype.bark = function() {
  console.log(`Woof I am ${this.name}`);
};

const pet = new Dog("Mara");

pet.bark();

delete Dog.prototype.bark;

pet.bark();
```

- A. "Woof I am Mara", TypeError
- B. "Woof I am Mara","Woof I am Mara"
- C. "Woof I am Mara", undefined
- D. TypeError, TypeError

### 题目要点

我们可以用`delete`关键字删除对象的属性，对原型也是适用的。删除了原型的属性后，该属性在原型链上就不可用了。在本例中，函数`bark`在执行了`delete Dog.prototype.bark`后不可用, 然而后面的代码还在调用它。 当我们尝试调用一个不存在的函数时`TypeError`异常会被抛出。在本例中就是 `TypeError: pet.bark is not a function`，因为`pet.bark`是`undefined`.

<details>
<summary>参考答案</summary>

**正确答案：A**
我们可以用`delete`关键字删除对象的属性，对原型也是适用的。删除了原型的属性后，该属性在原型链上就不可用了。在本例中，函数`bark`在执行了`delete Dog.prototype.bark`后不可用, 然而后面的代码还在调用它。
当我们尝试调用一个不存在的函数时`TypeError`异常会被抛出。在本例中就是 `TypeError: pet.bark is not a function`，因为`pet.bark`是`undefined`.

</details>

## 107. 输出是什么? {#question-30a6a5e1-fc54-4f16-b102-5a174ae023dd}

> 难度：1.5 · 类型：Choice

```javascript
(() => {
  let x = (y = 10);
})();

console.log(typeof x);
console.log(typeof y);
```

- A. "undefined", "number"
- B. "number", "number"
- C. "object", "number"
- D. "number", "undefined"

### 题目要点

`let x = y = 10;` 是下面这个表达式的缩写:

<details>
<summary>参考答案</summary>

**正确答案：A**
`let x = y = 10;` 是下面这个表达式的缩写:
```javascript
y = 10;
let x = y;
```
我们设定`y`等于`10`时,我们实际上增加了一个属性`y`给全局对象(浏览器里的`window`, Nodejs里的`global`)。在浏览器中， `window.y`等于`10`.
然后我们声明了变量`x`等于`y`,也是`10`.但变量是使用 `let`声明的，它只作用于 _块级作用域_, 仅在声明它的块中有效；就是案例中的立即调用表达式(IIFE)。使用`typeof`操作符时, 操作值 `x`没有被定义：因为我们在`x`声明块的外部，无法调用它。这就意味着`x`未定义。未分配或是未声明的变量类型为`"undefined"`. `console.log(typeof x)`返回`"undefined"`.
而我们创建了全局变量`y`，并且设定`y`等于`10`.这个值在我们的代码各处都访问的到。 `y`已经被定义了，而且有一个`"number"`类型的值。 `console.log(typeof y)`返回`"number"`.

</details>

## 108. 输出是什么? {#question-f03cba69-b0fd-4450-b3e0-cb6a1f855bac}

> 难度：1 · 类型：Choice

```javascript
function Car() {
  this.make = "Lamborghini";
  return { make: "Maserati" };
}

const myCar = new Car();
console.log(myCar.make);
```

- A. "Lamborghini"
- B. "Maserati"
- C. ReferenceError
- D. TypeError

### 题目要点

返回属性的时候，属性的值等于 _返回的_ 值，而不是构造函数中设定的值。我们返回了字符串 `"Maserati"`，所以 `myCar.make`等于`"Maserati"`.

<details>
<summary>参考答案</summary>

**正确答案：B**
返回属性的时候，属性的值等于 _返回的_ 值，而不是构造函数中设定的值。我们返回了字符串 `"Maserati"`，所以 `myCar.make`等于`"Maserati"`.

</details>

## 109. 输出是什么? {#question-78f63a99-87f9-4162-b932-3bdb38e4b166}

> 难度：1 · 类型：Choice

```javascript
function greeting() {
  throw "Hello world!";
}

function sayHi() {
  try {
    const data = greeting();
    console.log("It worked!", data);
  } catch (e) {
    console.log("Oh no an error:", e);
  }
}

sayHi();
```

- A. "It worked! Hello world!"
- B. "Oh no an error: undefined
- C. SyntaxError: can only throw Error objects
- D. "Oh no an error: Hello world!

### 题目要点

通过`throw`语句，我么可以创建自定义错误。 而通过它，我们可以抛出异常。异常可以是一个<b>字符串</b>, 一个 <b>数字</b>, 一个 <b>布尔类型</b> 或者是一个 <b>对象</b>。在本例中，我们的异常是字符串`'Hello world'`. 通过 `catch`语句，我们可以设定当`try`语句块中抛出异常后应该做什么处理。在本例中抛出的异常是字符串`'Hello world'`. `e`就是这个字符串，因此被输出。最终结果就是`'Oh an err…

<details>
<summary>参考答案</summary>

**正确答案：D**
通过`throw`语句，我么可以创建自定义错误。 而通过它，我们可以抛出异常。异常可以是一个<b>字符串</b>, 一个 <b>数字</b>, 一个 <b>布尔类型</b> 或者是一个 <b>对象</b>。在本例中，我们的异常是字符串`'Hello world'`.
通过 `catch`语句，我们可以设定当`try`语句块中抛出异常后应该做什么处理。在本例中抛出的异常是字符串`'Hello world'`. `e`就是这个字符串，因此被输出。最终结果就是`'Oh an error: Hello world'`.

</details>

## 110. 输出的是什么? {#question-19bf40bd-7685-4eba-bd6e-9c7d00e0ec55}

> 难度：1 · 类型：Choice

```javascript
function getInfo(member, year) {
  member.name = "Lydia";
  year = "1998";
}

const person = { name: "Sarah" };
const birthYear = "1997";

getInfo(person, birthYear);

console.log(person, birthYear);
```

- A. { name: "Lydia" }, "1997"
- B. { name: "Sarah" }, "1998"
- C. { name: "Lydia" }, "1998"
- D. { name: "Sarah" }, "1997"

### 题目要点

普通参数都是 _值_ 传递的，而对象则不同，是 _引用_ 传递。所以说，`birthYear`是值传递，因为他是个字符串而不是对象。当我们对参数进行值传递时，会创建一份该值的 _复制_ 。（可以参考问题46） 变量`birthYear`有一个对`"1997"`的引用，而传入的参数也有一个对`"1997"`的引用，但二者的引用并不相同。当我们通过给 `year`赋值`"1998"`来更新`year`的值的时候我们只是更新了`year`（的引用）。此时`birthYear`仍然是…

<details>
<summary>参考答案</summary>

**正确答案：A**
普通参数都是 _值_ 传递的，而对象则不同，是 _引用_ 传递。所以说，`birthYear`是值传递，因为他是个字符串而不是对象。当我们对参数进行值传递时，会创建一份该值的 _复制_ 。（可以参考问题46）
变量`birthYear`有一个对`"1997"`的引用，而传入的参数也有一个对`"1997"`的引用，但二者的引用并不相同。当我们通过给 `year`赋值`"1998"`来更新`year`的值的时候我们只是更新了`year`（的引用）。此时`birthYear`仍然是`"1997"`.
而`person`是个对象。参数`member`引用与之 _相同的_ 对象。当我们修改`member`所引用对象的属性时,`person`的相应属性也被修改了,因为他们引用了相同的对象. `person`的 `name`属性也变成了 `"Lydia"`.

</details>

## 111. 输出是什么? {#question-ff764705-09da-45ff-8678-56ab75fce6de}

> 难度：1 · 类型：Choice

```javascript
[1, 2, 3].map(num => {
  if (typeof num === "number") return;
  return num * 2;
});
```

- A. []
- B. [null, null, null]
- C. [undefined, undefined, undefined]
- D. [ 3 x empty ]

### 题目要点

对数组进行映射的时候,`num`就是当前循环到的元素. 在这个例子中，所有的映射都是number类型，所以if中的判断`typeof num === "number"`结果都是`true`.map函数创建了新数组并且将函数的返回值插入数组。 但是，没有任何值返回。当函数没有返回任何值时，即默认返回`undefined`.对数组中的每一个元素来说，函数块都得到了这个返回值，所以结果中每一个元素都是`undefined`.

<details>
<summary>参考答案</summary>

**正确答案：C**
对数组进行映射的时候,`num`就是当前循环到的元素. 在这个例子中，所有的映射都是number类型，所以if中的判断`typeof num === "number"`结果都是`true`.map函数创建了新数组并且将函数的返回值插入数组。
但是，没有任何值返回。当函数没有返回任何值时，即默认返回`undefined`.对数组中的每一个元素来说，函数块都得到了这个返回值，所以结果中每一个元素都是`undefined`.

</details>

## 112. num的值是什么? {#question-90fb24f5-8333-44a9-b3b7-ef199eeaaaeb}

> 难度：0.5 · 类型：Choice

```javascript
const num = parseInt("7*6", 10);
```

- A. 42
- B. "42"
- C. 7
- D. NaN

### 题目要点

只返回了字符串中第一个字母. 设定了 _进制_ 后 (也就是第二个参数，指定需要解析的数字是什么进制: 十进制、十六机制、八进制、二进制等等……),`parseInt` 检查字符串中的字符是否合法. 一旦遇到一个在指定进制中不合法的字符后，立即停止解析并且忽略后面所有的字符。 `*`就是不合法的数字字符。所以只解析到`"7"`，并将其解析为十进制的`7`. `num`的值即为`7`.

<details>
<summary>参考答案</summary>

**正确答案：C**
只返回了字符串中第一个字母. 设定了 _进制_ 后 (也就是第二个参数，指定需要解析的数字是什么进制: 十进制、十六机制、八进制、二进制等等……),`parseInt` 检查字符串中的字符是否合法. 一旦遇到一个在指定进制中不合法的字符后，立即停止解析并且忽略后面所有的字符。
`*`就是不合法的数字字符。所以只解析到`"7"`，并将其解析为十进制的`7`. `num`的值即为`7`.

</details>

## 113. 输出是什么? {#question-32bf429e-2cda-408b-905c-f6149bbb972b}

> 难度：0.5 · 类型：Choice

```javascript
console.log(3 + 4 + "5");
```

- A. "345"
- B. "75"
- C. 12
- D. "12"

### 题目要点

当所有运算符的 _优先级_ 相同时，计算表达式需要确定运算符的结合顺序，即从右到左还是从左往右。在这个例子中，我们只有一类运算符`+`，对于加法来说，结合顺序就是从左到右。 `3 + 4`首先计算，得到数字`7`. 由于类型的强制转换，`7 + '5'`的结果是`"75"`. JavaScript将`7`转换成了字符串，可以参考问题15.我们可以用`+`号把两个字符串连接起来。 `"7" + "5"` 就得到了`"75"`.

<details>
<summary>参考答案</summary>

**正确答案：B**
当所有运算符的 _优先级_ 相同时，计算表达式需要确定运算符的结合顺序，即从右到左还是从左往右。在这个例子中，我们只有一类运算符`+`，对于加法来说，结合顺序就是从左到右。
`3 + 4`首先计算，得到数字`7`.
由于类型的强制转换，`7 + '5'`的结果是`"75"`. JavaScript将`7`转换成了字符串，可以参考问题15.我们可以用`+`号把两个字符串连接起来。 `"7" + "5"` 就得到了`"75"`.

</details>

## 114. 输出是什么? {#question-ac5c3d92-55a9-4c88-b452-e0b583f13385}

> 难度：0.5 · 类型：Choice

```javascript
const person = {
  name: "Lydia",
  age: 21
};

for (const item in person) {
  console.log(item);
}
```

- A. { name: "Lydia" }, { age: 21 }
- B. "name", "age"
- C. "Lydia", 21
- D. ["name", "Lydia"], ["age", 21]

### 题目要点

在`for-in`循环中,我们可以通过对象的key来进行迭代,也就是这里的`name`和`age`。在底层，对象的key都是字符串（如果他们不是Symbol的话）。在每次循环中，我们将`item`设定为当前遍历到的key.所以一开始，`item`是`name`，之后 `item`输出的则是`age`。

<details>
<summary>参考答案</summary>

**正确答案：B**
在`for-in`循环中,我们可以通过对象的key来进行迭代,也就是这里的`name`和`age`。在底层，对象的key都是字符串（如果他们不是Symbol的话）。在每次循环中，我们将`item`设定为当前遍历到的key.所以一开始，`item`是`name`，之后 `item`输出的则是`age`。

</details>

## 115. 输出是什么? {#question-e110762f-dcc0-41a2-bd28-866b0c798cc5}

> 难度：1 · 类型：Choice

```javascript
let person = { name: "Lydia" };
const members = [person];
person = null;

console.log(members);
```

- A. null
- B. [null]
- C. [{}]
- D. [{ name: "Lydia" }]

### 题目要点

首先我们声明了一个拥有`name`属性的对象 `person`。

<details>
<summary>参考答案</summary>

**正确答案：D**
首先我们声明了一个拥有`name`属性的对象 `person`。

![](https://static.ecool.fun//article/37365590-420d-4091-9a63-e6f097a7f75d.png)

然后我们又声明了一个变量`members`. 将首个元素赋值为变量`person`。 当设置两个对象彼此相等时，它们会通过 _引用_ 进行交互。但是当你将引用从一个变量分配至另一个变量时，其实只是执行了一个 _复制_ 操作。（注意一点，他们的引用 _并不相同_!）

![](https://static.ecool.fun//article/bf3168b8-81d1-4876-82cb-0f79f171034d.png)

接下来我们让`person`等于`null`。

![](https://static.ecool.fun//article/d5f3049b-322b-4933-b449-56019678cf7d.png)

我们没有修改数组第一个元素的值，而只是修改了变量`person`的值,因为元素（复制而来）的引用与`person`不同。`members`的第一个元素仍然保持着对原始对象的引用。当我们输出`members`数组时，第一个元素会将引用的对象打印出来。

</details>

## 116. 返回值是什么? {#question-322d4cf7-d372-4963-87d3-173a058c4099}

> 难度：1 · 类型：Choice

```javascript
const firstPromise = new Promise((res, rej) => {
  setTimeout(res, 500, "one");
});

const secondPromise = new Promise((res, rej) => {
  setTimeout(res, 100, "two");
});

Promise.race([firstPromise, secondPromise]).then(res => console.log(res));
```

- A. "one"
- B. "two"
- C. "two" "one"
- D. "one" "two"

### 题目要点

当我们向`Promise.race`方法中传入多个`Promise`时，会进行 _优先_ 解析。在这个例子中，我们用`setTimeout`给`firstPromise`和`secondPromise`分别设定了500ms和100ms的定时器。这意味着`secondPromise`会首先解析出字符串`two`。那么此时`res`参数即为`two`，是为输出结果。

<details>
<summary>参考答案</summary>

**正确答案：B**
当我们向`Promise.race`方法中传入多个`Promise`时，会进行 _优先_ 解析。在这个例子中，我们用`setTimeout`给`firstPromise`和`secondPromise`分别设定了500ms和100ms的定时器。这意味着`secondPromise`会首先解析出字符串`two`。那么此时`res`参数即为`two`，是为输出结果。

</details>

## 117. 输出是什么? {#question-c99dea56-2532-41b6-8ec2-68fec71da84a}

> 难度：1 · 类型：Choice

```javascript
function* generator(i) {
  yield i;
  yield i * 2;
}

const gen = generator(10);

console.log(gen.next().value);
console.log(gen.next().value);
```

- A. [0, 10], [10, 20]
- B. 20, 20
- C. 10, 20
- D. 0, 10 and 10, 20

### 题目要点

一般的函数在执行之后是不能中途停下的。但是，生成器函数却可以中途“停下”，之后可以再从停下的地方继续。当生成器遇到`yield`关键字的时候，会生成`yield`后面的值。注意，生成器在这种情况下不 _返回_ (_return_ )值，而是 _生成_ (_yield_)值。 首先，我们用`10`作为参数`i`来初始化生成器函数。然后使用`next()`方法一步步执行生成器。第一次执行生成器的时候，`i`的值为`10`，遇到第一个`yield`关键字，它要生成`i`的值。此时，…

<details>
<summary>参考答案</summary>

**正确答案：C**
一般的函数在执行之后是不能中途停下的。但是，生成器函数却可以中途“停下”，之后可以再从停下的地方继续。当生成器遇到`yield`关键字的时候，会生成`yield`后面的值。注意，生成器在这种情况下不 _返回_ (_return_ )值，而是 _生成_ (_yield_)值。
首先，我们用`10`作为参数`i`来初始化生成器函数。然后使用`next()`方法一步步执行生成器。第一次执行生成器的时候，`i`的值为`10`，遇到第一个`yield`关键字，它要生成`i`的值。此时，生成器“暂停”，生成了`10`。
然后，我们再执行`next()`方法。生成器会从刚才暂停的地方继续，这个时候`i`还是`10`。于是我们走到了第二个`yield`关键字处，这时候需要生成的值是`i*2`，`i`为`10`，那么此时生成的值便是`20`。所以这道题的最终结果是`10,20`。

</details>

## 118. 输出是什么？ {#question-d0fd0142-dd09-4d9a-9465-012c30cd921e}

> 难度：1 · 类型：Choice

```javascript
[...'Lydia']
```

- A. ["L", "y", "d", "i", "a"]
- B. ["Lydia"]
- C. [[], "Lydia"]
- D. [["L", "y", "d", "i", "a"]]

### 题目要点

string 类型是可迭代的。扩展运算符将迭代的每个字符映射成一个元素。

<details>
<summary>参考答案</summary>

**正确答案：A**
string 类型是可迭代的。扩展运算符将迭代的每个字符映射成一个元素。

</details>

## 119. setInterval 方法的返回值是什么？ {#question-343c64fa-f996-4d17-a20f-dec32f7b256b}

> 难度：0.5 · 类型：Choice

```javascript
setInterval(() => console.log('Hi'), 1000)
```

- A. 一个唯一的id
- B. 该方法指定的毫秒数
- C. 传递的函数
- D. undefined

### 题目要点

`setInterval` 返回一个唯一的 id。此 id 可被用于 `clearInterval` 函数来取消定时。

<details>
<summary>参考答案</summary>

**正确答案：A**
`setInterval` 返回一个唯一的 id。此 id 可被用于 `clearInterval` 函数来取消定时。

</details>

## 120. 输出是什么？ {#question-a762c5d6-5e0b-4b4c-b1c3-eea744b38d3d}

> 难度：0.5 · 类型：Choice

```javascript
!!null
!!''
!!1
```

- A. false true false
- B. false false true
- C. false true true
- D. true true false

### 题目要点

`null` 是 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)。 `!null` 的值是 `true`。 `!true` 的值是 `false`。 `""` 是 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)。 `!""` 的值是 `true`。 `!true` 的值是 `false`。 `1` 是 [truth…

<details>
<summary>参考答案</summary>

**正确答案：B**
`null` 是 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)。 `!null` 的值是 `true`。 `!true` 的值是 `false`。
`""` 是 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)。 `!""` 的值是 `true`。  `!true` 的值是 `false`。
`1` 是 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)。 `!1` 的值是 `false`。 `!false` 的值是 `true`。

</details>

## 121. 下面代码的输出是什么？ {#question-e4de3d64-0a56-4bdc-b07f-d310987218e9}

> 难度：0.5 · 类型：Choice

```javascript
[[0, 1], [2, 3]].reduce(
  (acc, cur) => {
    return acc.concat(cur)
  },
  [1, 2]
)
```

- A. [0, 1, 2, 3, 1, 2]
- B. [6, 1, 2]
- C. [1, 2, 0, 1, 2, 3]
- D. [1, 2, 6]

### 题目要点

`[1, 2]`是初始值。

<details>
<summary>参考答案</summary>

**正确答案：C**
`[1, 2]`是初始值。

初始值将会作为首次调用时第一个参数 `acc` 的值。

* 在第一次执行时， `acc` 的值是 `[1, 2]`， `cur` 的值是 `[0, 1]`。合并它们，结果为 `[1, 2, 0, 1]`。
* 第二次执行， `acc` 的值是 `[1, 2, 0, 1]`， `cur` 的值是 `[2, 3]`。合并它们，最终结果为 `[1, 2, 0, 1, 2, 3]`

</details>

## 122. 输出是什么？ {#question-7288dc5d-1485-4275-8a19-acf2bdc7f909}

> 难度：0.5 · 类型：Choice

```javascript
(() => {
  let x, y
  try {
    throw new Error()
  } catch (x) {
    (x = 1), (y = 2)
    console.log(x)
  }
  console.log(x)
  console.log(y)
})()
```

- A. 1 undefined 2
- B. undefined undefined undefined
- C. 1 1 2
- D. 1 undefined undefined

### 题目要点

`catch` 代码块接收参数 `x`。当我们传递参数时，这与之前定义的变量 `x` 不同 。这个 `x` 是属于 `catch` 块级作用域的。 然后，我们将块级作用域中的变量赋值为 `1`，同时也设置了变量 `y` 的值。现在，我们打印块级作用域中的变量 `x`，值为 `1`。 `catch` 块之外的变量 `x` 的值仍为 `undefined`， `y` 的值为 `2`。当我们在 `catch` 块之外执行 `console.log(x)` 时，返回 `undefin…

<details>
<summary>参考答案</summary>

**正确答案：A**
`catch` 代码块接收参数 `x`。当我们传递参数时，这与之前定义的变量 `x` 不同 。这个 `x` 是属于 `catch` 块级作用域的。
然后，我们将块级作用域中的变量赋值为 `1`，同时也设置了变量 `y` 的值。现在，我们打印块级作用域中的变量 `x`，值为 `1`。
`catch` 块之外的变量 `x` 的值仍为 `undefined`， `y` 的值为 `2`。当我们在 `catch` 块之外执行 `console.log(x)` 时，返回 `undefined`，`y` 返回 `2`。

</details>

## 123. 输出是什么？ {#question-95dd5690-238f-46ab-b232-6bff6520240a}

> 难度：1 · 类型：Choice

```javascript
const numbers = [1, 2, 3]
numbers[10] = 11
console.log(numbers)
```

- A. [1, 2, 3, 7 x null, 11]
- B. [1, 2, 3, 11]
- C. [1, 2, 3, 7 x empty, 11]
- D. SyntaxError

### 题目要点

当你为数组设置超过数组长度的值的时候， JavaScript 会创建名为 "empty slots" 的东西。它们的值实际上是 `undefined`。你会看到以下场景： `[1, 2, 3, 7 x empty, 11]` 这取决于你的运行环境（每个浏览器，以及 node 环境，都有可能不同）

<details>
<summary>参考答案</summary>

**正确答案：C**
当你为数组设置超过数组长度的值的时候， JavaScript 会创建名为 "empty slots" 的东西。它们的值实际上是 `undefined`。你会看到以下场景：
`[1, 2, 3, 7 x empty, 11]`
这取决于你的运行环境（每个浏览器，以及 node 环境，都有可能不同）

</details>

## 124. 输出是什么？ {#question-88f7458f-418d-4362-bafa-f3ed98083d02}

> 难度：0.5 · 类型：Choice

```javascript
console.log(typeof typeof 1)
```

- A. "number"
- B. "string"
- C. "object"
- D. "undefined"

### 题目要点

`typeof 1` 返回 `"number"`。 `typeof "number"` 返回 `"string"`。

<details>
<summary>参考答案</summary>

**正确答案：B**
`typeof 1` 返回 `"number"`。
`typeof "number"` 返回 `"string"`。

</details>

## 125. 下面哪些值是 falsy? {#question-f6b74eb2-442e-4a56-904f-bee79587138c}

> 难度：1 · 类型：Choice

```javascript
0
new Number(0)
('')
(' ')
new Boolean(false)
undefined
```

- A. 0, '', undefined
- B. 0, new Number(0), '', new Boolean(false), undefined
- C. 0, '', new Boolean(false), undefined
- D. All of them are falsy

### 题目要点

只有 6 种 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy) 值:

<details>
<summary>参考答案</summary>

**正确答案：A**
只有 6 种 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy) 值:
- `undefined`
- `null`
- `NaN`
- `0`
- `''` (empty string)
- `false`
`Function` 构造函数, 比如 `new Number` 和 `new Boolean`，是 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)。

</details>

## 126. 输出是什么？ {#question-aa12e754-f3cd-47f5-b1f0-1e0f746527cd}

> 难度：1 · 类型：Choice

```javascript
function sayHi() {
  return (() => 0)()
}

console.log(typeof sayHi());
```

- A. "object"
- B. "number"
- C. "function"
- D. "undefined"

### 题目要点

`sayHi` 方法返回的是立即执行函数(IIFE)的返回值。此立即执行函数的返回值是 `0`， 类型是 `number`。

<details>
<summary>参考答案</summary>

**正确答案：B**
`sayHi` 方法返回的是立即执行函数(IIFE)的返回值。此立即执行函数的返回值是 `0`， 类型是 `number`。

其他参考资料：

`typeof` 运算符返回一个字符串，表示操作数的类型。

下表总结了 `typeof` 可能的返回值

|类型|结果|
|--|--|
|Undefined|	"undefined"|
|Null|	"object"|
|Boolean	|"boolean"|
|Number	|"number"|
|BigInt	|"bigint"|
|String	|"string"|
|Symbol	|"symbol"|
|Function|	"function"|
|其他任何对象| "object"|

</details>

## 127. 下面会输出什么？ {#question-e39e2c86-5e5d-4412-907b-e40d98fbfb4c}

> 难度：1 · 类型：Choice

```javascript
const person = { name: 'Lydia' }

function sayHi(age) {
  console.log(`${this.name} is ${age}`)
}

sayHi.call(person, 21)
sayHi.bind(person, 21)
```

- A. undefined is 21 Lydia is 21
- B. function function
- C. Lydia is 21 Lydia is 21
- D. Lydia is 21 function

### 题目要点

使用这两种方法，我们都可以传递我们希望 `this` 关键字引用的对象。但是，`.call` 是**立即执行**的。 `.bind` 返回函数的**副本**，但带有绑定上下文！它不是立即执行的。

<details>
<summary>参考答案</summary>

**正确答案：D**
使用这两种方法，我们都可以传递我们希望 `this` 关键字引用的对象。但是，`.call` 是**立即执行**的。
`.bind` 返回函数的**副本**，但带有绑定上下文！它不是立即执行的。

</details>

## 128. 输出是什么？ {#question-c3f69ef3-ab4e-456f-869f-3e6ef470d0f3}

> 难度：1 · 类型：Choice

```javascript
const foo = () => console.log('First')
const bar = () => setTimeout(() => console.log('Second'))
const baz = () => console.log('Third')

bar()
foo()
baz()
```

- A. First Second Third
- B. First Third Second
- C. Second First Third
- D. Second Third First

### 题目要点

输出的顺序将会是：

<details>
<summary>参考答案</summary>

**正确答案：B**
输出的顺序将会是：

```
First
Third
Second
```

这是因为在这段代码中，`bar()` 函数包含了一个 `setTimeout`，它会在一定时间后执行回调函数。而在这段代码中，`setTimeout` 的回调函数是异步执行的。

以下是代码执行的详细步骤：

1. 调用 `bar()`，它启动了一个计时器，并注册了一个在计时结束后执行的回调函数。
2. 然后调用 `foo()`，它会立即打印出 `'First'`。
3. 接着调用 `baz()`，它会立即打印出 `'Third'`。
4. 当计时器结束后，回调函数被执行，打印出 `'Second'`。

由于 `setTimeout` 是异步的，所以在执行完 `foo()` 和 `baz()` 后，会先打印出它们的输出，然后再执行 `setTimeout` 的回调函数并打印出 `'Second'`。

</details>

## 129. 输出是什么？ {#question-3928ae37-e2f5-49ba-bfc1-7076ebc049f3}

> 难度：0.5 · 类型：Choice

```javascript
const a = {}
const b = { key: 'b' }
const c = { key: 'c' }

a[b] = 123
a[c] = 456

console.log(a[b])
```

- A. 123
- B. 456
- C. undefined
- D. ReferenceError

### 题目要点

对象的键被自动转换为字符串。我们试图将一个对象 `b` 设置为对象 `a` 的键，且相应的值为 `123`。 然而，当字符串化一个对象时，它会变成 `"[object Object]"`。因此这里说的是，`a["[object Object]"] = 123`。然后，我们再一次做了同样的事情，`c` 是另外一个对象，这里也有隐式字符串化，于是，`a["[object Object]"] = 456`。 然后，我们打印 `a[b]`，也就是 `a["[object Object…

<details>
<summary>参考答案</summary>

**正确答案：B**
对象的键被自动转换为字符串。我们试图将一个对象 `b` 设置为对象 `a` 的键，且相应的值为 `123`。
然而，当字符串化一个对象时，它会变成 `"[object Object]"`。因此这里说的是，`a["[object Object]"] = 123`。然后，我们再一次做了同样的事情，`c` 是另外一个对象，这里也有隐式字符串化，于是，`a["[object Object]"] = 456`。
然后，我们打印 `a[b]`，也就是 `a["[object Object]"]`。之前刚设置为 `456`，因此返回的是 `456`。

</details>

## 130. 输出是什么？ {#question-0d44a9d0-574d-4043-99a0-374df956d562}

> 难度：1 · 类型：Choice

```javascript
String.prototype.giveLydiaPizza = () => {
  return 'Just give Lydia pizza already!'
}

const name = 'Lydia'

name.giveLydiaPizza()
```

- A. "Just give Lydia pizza already!"
- B. TypeError: not a function
- C. SyntaxError
- D. undefined

### 题目要点

`String` 是内置的构造函数，我们可以向它添加属性。我只是在它的原型中添加了一个方法。基本类型字符串被自动转换为字符串对象，由字符串原型函数生成。因此，所有 string(string 对象)都可以访问该方法！

<details>
<summary>参考答案</summary>

**正确答案：A**
`String` 是内置的构造函数，我们可以向它添加属性。我只是在它的原型中添加了一个方法。基本类型字符串被自动转换为字符串对象，由字符串原型函数生成。因此，所有 string(string 对象)都可以访问该方法！

</details>

## 131. 下面的输出是什么？ {#question-643af0aa-f567-45df-89ac-aaa8b4d8f927}

> 难度：1 · 类型：Choice

```javascript
for (let i = 1; i < 5; i++) {
  if (i === 3) continue
  console.log(i)
}
```

- A. 1 2
- B. 1 2 3
- C. 1 2 4
- D. 1 3 4

### 题目要点

如果某个条件返回 `true`，则 `continue` 语句跳过本次迭代。

<details>
<summary>参考答案</summary>

**正确答案：C**
如果某个条件返回 `true`，则 `continue` 语句跳过本次迭代。

</details>

## 132. 输出是什么？ {#question-ecb779c3-a28f-45c8-bcdc-25b8d7948e1a}

> 难度：1 · 类型：Choice

```javascript
const obj = { a: 'one', b: 'two', a: 'three' }
console.log(obj)
```

- A. { a: "one", b: "two" }
- B. { b: "two", a: "three" }
- C. { a: "three", b: "two" }
- D. SyntaxError

### 题目要点

如果你有两个名称相同的键，则键会被替换掉。它仍然位于第一个键出现的位置，但是值是最后出现那个键的值。

<details>
<summary>参考答案</summary>

**正确答案：C**
如果你有两个名称相同的键，则键会被替换掉。它仍然位于第一个键出现的位置，但是值是最后出现那个键的值。

</details>

## 133. 输出是什么？ {#question-979c6688-b432-487d-81bb-7250ae59840a}

> 难度：0.5 · 类型：Choice

```javascript
const obj = { 1: 'a', 2: 'b', 3: 'c' }
const set = new Set([1, 2, 3, 4, 5])

obj.hasOwnProperty('1')
obj.hasOwnProperty(1)
set.has('1')
set.has(1)
```

- A. false true false true
- B. false true true true
- C. true true false true
- D. true true true true

### 题目要点

所有对象的键（不包括 Symbol）在底层都是字符串，即使你自己没有将其作为字符串输入。这就是为什么 `obj.hasOwnProperty('1')` 也返回 `true`。 对于集合，它不是这样工作的。在我们的集合中没有 `'1'`：`set.has('1')` 返回 `false`。它有数字类型为 `1`，`set.has(1)` 返回 `true`。

<details>
<summary>参考答案</summary>

**正确答案：C**
所有对象的键（不包括 Symbol）在底层都是字符串，即使你自己没有将其作为字符串输入。这就是为什么 `obj.hasOwnProperty('1')` 也返回 `true`。
对于集合，它不是这样工作的。在我们的集合中没有 `'1'`：`set.has('1')` 返回 `false`。它有数字类型为 `1`，`set.has(1)` 返回 `true`。

</details>

## 134. 输出是什么？ {#question-368a4fdc-4c5f-4a97-81a8-eab34a3fcb7c}

> 难度：1 · 类型：Choice

```javascript
var num = 8
var num = 10

console.log(num)
```

- A. 8
- B. 10
- C. SyntaxError
- D. ReferenceError

### 题目要点

使用 `var` 关键字，你可以用相同的名称声明多个变量。然后变量将保存最新的值。 你不能使用 `let` 或 `const` 来实现这一点，因为它们是块作用域的。

<details>
<summary>参考答案</summary>

**正确答案：B**
使用 `var` 关键字，你可以用相同的名称声明多个变量。然后变量将保存最新的值。
你不能使用 `let` 或 `const` 来实现这一点，因为它们是块作用域的。

</details>

## 135. cool_secret 可访问多长时间？ {#question-78102227-0f8f-4f64-b2b2-17c35b6873e6}

> 难度：1 · 类型：Choice

```javascript
sessionStorage.setItem('cool_secret', 123)
```

- A. 永远，数据不会丢失。
- B. 当用户关掉标签页时。
- C. 当用户关掉整个浏览器，而不只是关掉标签页。
- D. 当用户关闭电脑时。

### 题目要点

关闭 **tab 标签页** 后，`sessionStorage` 存储的数据才会删除。 如果使用 `localStorage`，那么数据将永远在那里，除非调用了 `localStorage.clear()`。

<details>
<summary>参考答案</summary>

**正确答案：B**
关闭 **tab 标签页** 后，`sessionStorage` 存储的数据才会删除。
如果使用 `localStorage`，那么数据将永远在那里，除非调用了 `localStorage.clear()`。

</details>

## 136. 下面代码中，sum 的值是什么？ {#question-8d375b34-4323-48a3-9d02-9419cbf08f4e}

> 难度：0.5 · 类型：Choice

```javascript
const sum = eval('10*10+5')
```

- A. 105
- B. "105"
- C. TypeError
- D. "10*10+5"

### 题目要点

代码以字符串形式传递进来，`eval` 对其求值。如果它是一个表达式，就像本例中那样，它对表达式求值。表达式是 `10 * 10 + 5`。这将返回数字 `105`。

<details>
<summary>参考答案</summary>

**正确答案：A**
代码以字符串形式传递进来，`eval` 对其求值。如果它是一个表达式，就像本例中那样，它对表达式求值。表达式是 `10 * 10 + 5`。这将返回数字 `105`。

</details>

## 137. 输出是什么？ {#question-56761806-2660-4eac-8e8a-ced03357c95d}

> 难度：1 · 类型：Choice

```javascript
function getAge() {
  'use strict'
  age = 21
  console.log(age)
}

getAge()
```

- A. 21
- B. undefined
- C. ReferenceError
- D. TypeError

### 题目要点

使用 `"use strict"`，你可以确保不会意外地声明全局变量。我们从来没有声明变量 `age`，因为我们使用 `"use strict"`，它将抛出一个引用错误。如果我们不使用 `"use strict"`，它就会工作，因为属性 `age` 会被添加到全局对象中了。

<details>
<summary>参考答案</summary>

**正确答案：C**
使用 `"use strict"`，你可以确保不会意外地声明全局变量。我们从来没有声明变量 `age`，因为我们使用 `"use strict"`，它将抛出一个引用错误。如果我们不使用 `"use strict"`，它就会工作，因为属性 `age` 会被添加到全局对象中了。

</details>

## 138. 输出是什么？ {#question-2dec0eee-6b2c-4d4a-920b-6acef97924b7}

> 难度：1 · 类型：Choice

```javascript
function getAge(...args) {
  console.log(typeof args)
}

getAge(21)
```

- A. "number"
- B. "array"
- C. "object"
- D. "NaN"

### 题目要点

扩展运算符（`...args`）会返回实参组成的数组。而数组是对象，因此 `typeof args` 返回 `"object"`。

<details>
<summary>参考答案</summary>

**正确答案：C**
扩展运算符（`...args`）会返回实参组成的数组。而数组是对象，因此 `typeof args` 返回 `"object"`。

</details>

## 139. 输出是什么？ {#question-b8242a9b-8f0f-4c56-ab8f-cc092b3f1db3}

> 难度：1 · 类型：Choice

```javascript
function checkAge(data) {
  if (data === { age: 18 }) {
    console.log('You are an adult!')
  } else if (data == { age: 18 }) {
    console.log('You are still an adult.')
  } else {
    console.log(`Hmm.. You don't have an age I guess`)
  }
}

checkAge({ age: 18 })
```

- A. You are an adult!
- B. You are still an adult.
- C. Hmm.. You don't have an age I guess

### 题目要点

在测试相等性时，基本类型通过它们的值（value）进行比较，而对象通过它们的引用（reference）进行比较。JavaScript 检查对象是否具有对内存中相同位置的引用。 题目中我们正在比较的两个对象不是同一个引用：作为参数传递的对象引用的内存位置，与用于判断相等的对象所引用的内存位置并不同。 这也是 `{ age: 18 } === { age: 18 }` 和 `{ age: 18 } == { age: 18 }` 都返回 `false` 的原因。

<details>
<summary>参考答案</summary>

**正确答案：C**
在测试相等性时，基本类型通过它们的值（value）进行比较，而对象通过它们的引用（reference）进行比较。JavaScript 检查对象是否具有对内存中相同位置的引用。
题目中我们正在比较的两个对象不是同一个引用：作为参数传递的对象引用的内存位置，与用于判断相等的对象所引用的内存位置并不同。
这也是 `{ age: 18 } === { age: 18 }` 和 `{ age: 18 } == { age: 18 }` 都返回 `false` 的原因。

</details>

## 140. 输出是什么？ {#question-2f15c826-8011-46de-9c27-864728b75432}

> 难度：1 · 类型：Choice

```javascript
function getPersonInfo(one, two, three) {
  console.log(one)
  console.log(two)
  console.log(three)
}

const person = 'Lydia'
const age = 21

getPersonInfo`${person} is ${age} years old`
```

- A. "Lydia" 21 ["", " is ", " years old"]
- B. ["", " is ", " years old"] "Lydia" 21
- C. "Lydia" ["", " is ", " years old"] 21

### 题目要点

如果使用标记模板字面量，第一个参数的值总是包含字符串的数组。其余的参数获取的是传递的表达式的值！

<details>
<summary>参考答案</summary>

**正确答案：B**
如果使用标记模板字面量，第一个参数的值总是包含字符串的数组。其余的参数获取的是传递的表达式的值！

</details>

## 141. 输出是什么？ {#question-ffb601c8-7b57-4a0b-892a-f1935cfb528e}

> 难度：1 · 类型：Choice

```javascript
let number = 0
console.log(number++)
console.log(++number)
console.log(number)
```

- A. 1 1 2
- B. 1 2 2
- C. 0 2 2
- D. 0 1 2

### 题目要点

一元**后自增**运算符 `++`：

<details>
<summary>参考答案</summary>

**正确答案：C**
一元**后自增**运算符 `++`：
1. 返回值（返回 `0`）
2. 值自增（number 现在是 `1`）
一元**前自增**运算符 `++`：
1. 值自增（number 现在是 `2`）
2. 返回值（返回 `2`）
结果是 `0 2 2`.

</details>

## 142. 以下代码的输出是什么？ {#question-9be3e346-ff10-44b3-b98d-057669a266c4}

> 难度：1 · 类型：Choice

```javascript
function sum(a, b) {
  return a + b
}

sum(1, '2')
```

- A. NaN
- B. TypeError
- C. "12"
- D. 3

### 题目要点

JavaScript 是一种**动态类型语言**：我们不指定某些变量的类型。值可以在你不知道的情况下自动转换成另一种类型，这种类型称为**隐式类型转换**（implicit type coercion）。**Coercion** 是指将一种类型转换为另一种类型。 在本例中，JavaScript 将数字 `1` 转换为字符串，以便函数有意义并返回一个值。在数字类型（`1`）和字符串类型（`'2'`）相加时，该数字被视为字符串。我们可以连接字符串，比如 `"Hello" + "W…

<details>
<summary>参考答案</summary>

**正确答案：C**
JavaScript 是一种**动态类型语言**：我们不指定某些变量的类型。值可以在你不知道的情况下自动转换成另一种类型，这种类型称为**隐式类型转换**（implicit type coercion）。**Coercion** 是指将一种类型转换为另一种类型。
在本例中，JavaScript 将数字 `1` 转换为字符串，以便函数有意义并返回一个值。在数字类型（`1`）和字符串类型（`'2'`）相加时，该数字被视为字符串。我们可以连接字符串，比如 `"Hello" + "World"`，这里发生的是 `"1" + "2"`，它返回 `"12"`。

</details>

## 143. 输出是什么？ {#question-a58a7800-e751-4664-9c9c-b342b21c701a}

> 难度：1 · 类型：Choice

```javascript
function Person(firstName, lastName) {
  this.firstName = firstName
  this.lastName = lastName
}

const lydia = new Person('Lydia', 'Hallie')
const sarah = Person('Sarah', 'Smith')

console.log(lydia)
console.log(sarah)
```

- A. Person {firstName: "Lydia", lastName: "Hallie"} and undefined
- B. Person {firstName: "Lydia", lastName: "Hallie"} and Person {firstName: "Sarah", lastName: "Smith"}
- C. Person {firstName: "Lydia", lastName: "Hallie"} and {}
- D. Person {firstName: "Lydia", lastName: "Hallie"} and ReferenceError

### 题目要点

对于 `sarah`，我们没有使用 `new` 关键字。当使用 `new` 时，`this` 引用我们创建的空对象。当未使用 `new` 时，`this` 引用的是**全局对象**（global object）。 我们说 `this.firstName` 等于 `"Sarah"`，并且 `this.lastName` 等于 `"Smith"`。实际上我们做的是，定义了 `global.firstName = 'Sarah'` 和 `global.lastName = 'Smi…

<details>
<summary>参考答案</summary>

**正确答案：A**
对于 `sarah`，我们没有使用 `new` 关键字。当使用 `new` 时，`this` 引用我们创建的空对象。当未使用 `new` 时，`this` 引用的是**全局对象**（global object）。
我们说 `this.firstName` 等于 `"Sarah"`，并且 `this.lastName` 等于 `"Smith"`。实际上我们做的是，定义了 `global.firstName = 'Sarah'` 和 `global.lastName = 'Smith'`。而 `sarah` 本身是 `undefined`。

</details>

## 144. 输出是什么？ {#question-90a39d35-309c-4699-a1f7-bd352899965b}

> 难度：0.5 · 类型：Choice

```javascript
function Person(firstName, lastName) {
  this.firstName = firstName;
  this.lastName = lastName;
}

const member = new Person("Lydia", "Hallie");
Person.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
}

console.log(member.getFullName());
```

- A. TypeError
- B. SyntaxError
- C. Lydia Hallie
- D. undefined undefined

### 题目要点

你不能像常规对象那样，给构造函数添加属性。如果你想一次性给所有实例添加特性，你应该使用原型。因此本例中，使用如下方式：

<details>
<summary>参考答案</summary>

**正确答案：A**
你不能像常规对象那样，给构造函数添加属性。如果你想一次性给所有实例添加特性，你应该使用原型。因此本例中，使用如下方式：
```js
Person.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
}
```
这才会使 `member.getFullName()` 起作用。为什么这么做有益的？假设我们将这个方法添加到构造函数本身里。也许不是每个 `Person` 实例都需要这个方法。这将浪费大量内存空间，因为它们仍然具有该属性，这将占用每个实例的内存空间。相反，如果我们只将它添加到原型中，那么它只存在于内存中的一个位置，但是所有实例都可以访问它！

</details>

## 145. 当我们这么做时，会发生什么？ {#question-2def1d2a-3f39-4d07-b61d-1ae6f0f66e7c}

> 难度：1 · 类型：Choice

```javascript
function bark() {
  console.log('Woof!')
}

bark.animal = 'dog'
```

- A. 正常运行!
- B. SyntaxError. 你不能通过这种方式给函数增加属性。
- C. undefined
- D. ReferenceError

### 题目要点

这在 JavaScript 中是可以的，因为函数是对象！（除了基本类型之外其他都是对象） 函数是一个特殊的对象。你写的这个代码其实不是一个实际的函数。函数是一个拥有属性的对象，并且属性也可被调用。

<details>
<summary>参考答案</summary>

**正确答案：A**
这在 JavaScript 中是可以的，因为函数是对象！（除了基本类型之外其他都是对象）
函数是一个特殊的对象。你写的这个代码其实不是一个实际的函数。函数是一个拥有属性的对象，并且属性也可被调用。

</details>

## 146. 输出是什么？ {#question-c3272068-de10-428e-8e99-27b2cba2dfe5}

> 难度：0.5 · 类型：Choice

```javascript
let greeting
greetign = {} // Typo!
console.log(greetign)
```

- A. {}
- B. ReferenceError: greetign is not defined
- C. undefined

### 题目要点

代码打印出了一个对象，这是因为我们在全局对象上创建了一个空对象！当我们将 `greeting` 写错成 `greetign` 时，JS 解释器实际在上浏览器中将它视为 `global.greetign = {}` （或者 `window.greetign = {}`）。 为了避免这个为题，我们可以使用 `"use strict"。这能确保当你声明变量时必须赋值。

<details>
<summary>参考答案</summary>

**正确答案：A**
代码打印出了一个对象，这是因为我们在全局对象上创建了一个空对象！当我们将 `greeting` 写错成 `greetign` 时，JS 解释器实际在上浏览器中将它视为 `global.greetign = {}` （或者 `window.greetign = {}`）。
为了避免这个为题，我们可以使用 `"use strict"。这能确保当你声明变量时必须赋值。

</details>

## 147. 输出是什么？ {#question-efc1c0ee-16ae-4c57-bef7-324a7747919c}

> 难度：0.5 · 类型：Choice

```javascript
class Chameleon {
  static colorChange(newColor) {
    this.newColor = newColor
    return this.newColor
  }

  constructor({ newColor = 'green' } = {}) {
    this.newColor = newColor
  }
}

const freddie = new Chameleon({ newColor: 'purple' })

console.log(freddie.colorChange('orange'));
```

- A. orange
- B. purple
- C. green
- D. TypeError

### 题目要点

`colorChange` 是一个静态方法。静态方法被设计为只能被创建它们的构造器使用（也就是 `Chameleon`），并且不能传递给实例。因为 `freddie` 是一个实例，静态方法不能被实例使用，因此抛出了 `TypeError` 错误。

<details>
<summary>参考答案</summary>

**正确答案：D**
`colorChange` 是一个静态方法。静态方法被设计为只能被创建它们的构造器使用（也就是 `Chameleon`），并且不能传递给实例。因为 `freddie` 是一个实例，静态方法不能被实例使用，因此抛出了 `TypeError` 错误。

</details>

## 148. 输出是什么？ {#question-5a76ab56-d02a-4d74-b8ed-946d1f59ce14}

> 难度：1 · 类型：Choice

```javascript
let a = 3
let b = new Number(3)
let c = 3

console.log(a == b)
console.log(a === b)
console.log(b === c)
```

- A. true false true
- B. false false true
- C. true false false
- D. false true true

### 题目要点

`new Number()` 是一个内建的函数构造器。虽然它看着像是一个 number，但它实际上并不是一个真实的 number：它有一堆额外的功能并且它是一个对象。 当我们使用 `==` 操作符时，它只会检查两者是否拥有相同的*值*。因为它们的值都是 `3`，因此返回 `true`。 然后，当我们使用 `===` 操作符时，两者的值以及*类型*都应该是相同的。`new Number()` 是一个对象而不是 number，因此返回 `false`。

<details>
<summary>参考答案</summary>

**正确答案：C**
`new Number()` 是一个内建的函数构造器。虽然它看着像是一个 number，但它实际上并不是一个真实的 number：它有一堆额外的功能并且它是一个对象。
当我们使用 `==` 操作符时，它只会检查两者是否拥有相同的*值*。因为它们的值都是 `3`，因此返回 `true`。
然后，当我们使用 `===` 操作符时，两者的值以及*类型*都应该是相同的。`new Number()` 是一个对象而不是 number，因此返回 `false`。

</details>

## 149. 输出是什么？ {#question-3bf627cd-6b02-4904-9d4c-979794d6cde3}

> 难度：2 · 类型：Choice

```javascript
let c = { greeting: 'Hey!' }
let d

d = c
c.greeting = 'Hello'
console.log(d.greeting)
```

- A. Hello
- B. undefined
- C. ReferenceError
- D. TypeError

### 题目要点

输出是 `'Hello'`。

<details>
<summary>参考答案</summary>

**正确答案：A**
输出是 `'Hello'`。

在这段代码中，变量 `c` 是一个对象，并且变量 `d` 与 `c` 引用同一个对象。当我们将 `c` 赋值给 `d` 时，它们引用的是同一个对象，在内存中只有一个对象存在。

因此，当我们修改 `c.greeting` 的值为 `'Hello'` 时，实际上也修改了原始对象，而 `d` 引用的仍然是该对象。所以，最后打印 `d.greeting` 的值时，会输出 `'Hello'`。

</details>

## 150. 哪一个是正确的？ {#question-c9e06422-43a4-4dc7-8a07-35b878896123}

> 难度：2 · 类型：Choice

```javascript
const bird = {
  size: 'small'
}

const mouse = {
  name: 'Mickey',
  small: true
}
```

- A. mouse.bird.size是无效的
- B. mouse[bird.size]是无效的
- C. mouse[bird["size"]]是无效的
- D. 以上三个选项都是有效的

### 题目要点

在 JavaScript 中，所有对象的 keys 都是字符串（除非对象是 Symbol）。尽管我们可能不会定义它们为字符串，但它们在底层总会被转换为字符串。 当我们使用括号语法时（[]），JavaScript 会解释（或者 unboxes）语句。它首先看到第一个开始括号 `[` 并继续前进直到找到结束括号 `]`。只有这样，它才会计算语句的值。 `mouse[bird.size]`：首先计算 `bird.size`，这会得到 `small`。`mouse["small"]`…

<details>
<summary>参考答案</summary>

**正确答案：A**
在 JavaScript 中，所有对象的 keys 都是字符串（除非对象是 Symbol）。尽管我们可能不会定义它们为字符串，但它们在底层总会被转换为字符串。
当我们使用括号语法时（[]），JavaScript 会解释（或者 unboxes）语句。它首先看到第一个开始括号 `[` 并继续前进直到找到结束括号 `]`。只有这样，它才会计算语句的值。
`mouse[bird.size]`：首先计算 `bird.size`，这会得到 `small`。`mouse["small"]` 返回 `true`。
然后使用点语法的话，上面这一切都不会发生。`mouse` 没有 `bird` 这个 key，这也就意味着 `mouse.bird` 是 `undefined`。然后当我们使用点语法 `mouse.bird.size` 时，因为 `mouse.bird` 是 `undefined`，这也就变成了 `undefined.size`。这个行为是无效的，并且会抛出一个错误类似 `Cannot read property "size" of undefined`。

</details>

## 151. 输出是什么？ {#question-ef8a8acb-e2bd-42d0-87b0-0414126a9ec0}

> 难度：1 · 类型：Choice

```javascript
console.log(+true,!"Lydia");
```

- A. 1 false
- B. false NaN
- C. false false

### 题目要点

一元操作符加号尝试将 bool 转为 number。`true` 转换为 number 的话为 `1`，`false` 为 `0`。 字符串 `'Lydia'` 是一个真值，真值取反那么就返回 `false`。

<details>
<summary>参考答案</summary>

**正确答案：A**
一元操作符加号尝试将 bool 转为 number。`true` 转换为 number 的话为 `1`，`false` 为 `0`。
字符串 `'Lydia'` 是一个真值，真值取反那么就返回 `false`。

</details>

## 152. 输出是什么？ {#question-06e95561-9b06-4cd8-b700-4305c1743808}

> 难度：1.5 · 类型：Choice

```javascript
const shape = {
  radius: 10,
  diameter() {
    return this.radius * 2
  },
  perimeter: () => 2 * Math.PI * this.radius
}

console.log(shape.diameter())
console.log(shape.perimeter())
```

- A. 20 and 62.83185307179586
- B. 20 and NaN
- C. 20 and 63
- D. NaN and 63

### 题目要点

注意 `diameter` 的值是一个常规函数，但是 `perimeter` 的值是一个箭头函数。 对于箭头函数，`this` 关键字指向的是它当前周围作用域（简单来说是包含箭头函数的常规函数，如果没有常规函数的话就是全局对象），这个行为和常规函数不同。这意味着当我们调用 `perimeter` 时，`this` 不是指向 `shape` 对象，而是它的周围作用域（在例子中是 `window`）。 在 `window` 中没有 `radius` 这个属性，因此返回 `unde…

<details>
<summary>参考答案</summary>

**正确答案：B**
注意 `diameter` 的值是一个常规函数，但是 `perimeter` 的值是一个箭头函数。
对于箭头函数，`this` 关键字指向的是它当前周围作用域（简单来说是包含箭头函数的常规函数，如果没有常规函数的话就是全局对象），这个行为和常规函数不同。这意味着当我们调用 `perimeter` 时，`this` 不是指向 `shape` 对象，而是它的周围作用域（在例子中是 `window`）。
在 `window` 中没有 `radius` 这个属性，因此返回 `undefined`。

</details>

## 153. 输出是什么？ {#question-1df4a6af-27bf-4e9e-a990-bd7e4c96399a}

> 难度：2 · 类型：Choice

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1)
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1)
}
```

- A. 0 1 2 和 0 1 2
- B. 0 1 2 和 3 3 3
- C. 3 3 3 和 0 1 2

### 题目要点

由于 JavaScript 的事件循环，`setTimeout` 回调会在*遍历结束后*才执行。因为在第一个遍历中遍历 `i` 是通过 `var` 关键字声明的，所以这个值是全局作用域下的。在遍历过程中，我们通过一元操作符 `++` 来每次递增 `i` 的值。当 `setTimeout` 回调执行的时候，`i` 的值等于 3。 在第二个遍历中，遍历 `i` 是通过 `let` 关键字声明的：通过 `let` 和 `const` 关键字声明的变量是拥有块级作用域（指的是任何在 …

<details>
<summary>参考答案</summary>

**正确答案：C**
由于 JavaScript 的事件循环，`setTimeout` 回调会在*遍历结束后*才执行。因为在第一个遍历中遍历 `i` 是通过 `var` 关键字声明的，所以这个值是全局作用域下的。在遍历过程中，我们通过一元操作符 `++` 来每次递增 `i` 的值。当 `setTimeout` 回调执行的时候，`i` 的值等于 3。
在第二个遍历中，遍历 `i` 是通过 `let` 关键字声明的：通过 `let` 和 `const` 关键字声明的变量是拥有块级作用域（指的是任何在 {} 中的内容）。在每次的遍历过程中，`i` 都有一个新值，并且每个值都在循环内的作用域中。

</details>

## 154. 输出是什么？ {#question-a4b9ded4-e430-4df9-8857-4d870e9c35cc}

> 难度：0.5 · 类型：Choice

```javascript
function sayHi() {
  console.log(name)
  console.log(age)
  var name = 'Lydia'
  let age = 21
}

sayHi()
```

- A. Lydia 和 undefined
- B. Lydia 和 ReferenceError
- C. ReferenceError 和 21
- D. undefined 和 ReferenceError

### 题目要点

在函数内部，我们首先通过 `var` 关键字声明了 `name` 变量。这意味着变量被提升了（内存空间在创建阶段就被设置好了），直到程序运行到定义变量位置之前默认值都是 `undefined`。因为当我们打印 `name` 变量时还没有执行到定义变量的位置，因此变量的值保持为 `undefined`。

<details>
<summary>参考答案</summary>

**正确答案：D**
在函数内部，我们首先通过 `var` 关键字声明了 `name` 变量。这意味着变量被提升了（内存空间在创建阶段就被设置好了），直到程序运行到定义变量位置之前默认值都是 `undefined`。因为当我们打印 `name` 变量时还没有执行到定义变量的位置，因此变量的值保持为 `undefined`。

通过 `let` 和 `const` 关键字声明的变量也会提升，但是和 `var` 不同，它们**不会被初始化**。在我们声明（初始化）之前是不能访问它们的。这个行为被称之为暂时性死区。当我们试图在声明之前访问它们时，JavaScript 将会抛出一个 `ReferenceError` 错误。

</details>
