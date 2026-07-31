+++
title = "call、apply和bind"
date = '2024-10-01T00:00:00+08:00'
lastmod = '2024-11-08T00:00:00+08:00'
draft = true
weight = 19
tags = ["面试", "前端", "JavaScript", "call、apply和bind", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## `apply` 和 `call`简介

在 `javascript` 中，`call` 和 `apply` 都是为了改变某个函数运行时的上下文（`context`）而存在的，换句话说，就是为了改变函数体内部 `this` 的指向。

`JavaScript` 的一大特点是，函数存在「`定义时上下文`」和「`运行时上下文`」以及「`上下文是可以改变的`」这样的概念。

比如 `A` 对象有一个方法，而 `B` 对象因为某种原因，也需要用到同样的方法，那么这时候不用单独为 `B` 对象扩展一个方法，可以直接借用 A 对象的方法。这样既完成了需求，又减少了内存的占用。

直接来看个例子：

```plain
function fruits() {} fruits.prototype = {    color: "red",    say: function() {        console.log("My color is " + this.color);    }} var apple = new fruits();apple.say();    //My color is red
```

但是如果我们有一个对象 `banana= {color : "yellow"}` ,我们不想对它重新定义 `say` 方法，那么我们可以通过 `call` 或 `apply` 用 `apple` 的 `say` 方法：

```plain
banana = {    color: "yellow"}apple.say.call(banana);     //My color is yellowapple.say.apply(banana);    //My color is yellow
```

## apply、call 的区别

对于 apply、call 二者而言，作用完全一样，只是接受参数的方式不太一样。例如，有一个函数定义如下：

```plain
var func = function(arg1, arg2) {
     
};
```

就可以通过如下方式来调用：

```plain
func.call(this, arg1, arg2)
func.apply(this, [arg1, arg2])
```

其中 `this` 想指定的上下文，可以是任何一个 `JavaScript` 对象(`JavaScript` 中一切皆对象)，`call` 需要把参数按顺序传递进去，而 `apply` 则是把参数放在数组里。

`JavaScript` 中，某个函数的参数数量是不固定的，因此要说适用条件的话，当你的参数是明确知道数量时用 `call` 。

而不确定的时候用 `apply`，然后把参数 `push` 进数组传递进去。当参数数量不确定时，函数内部也可以通过 `arguments` 这个伪数组来遍历所有的参数。

## apply、call 的常见用法

- 数组之间追加

在 `ES6` 的扩展运算符出现之前，我们可以用 `Array.prototype.push` 来实现

```plain
var array1 = [12 , "foo" , {name "Joe"} , -2458]; 
var array2 = ["Doe" , 555 , 100]; 
Array.prototype.push.apply(array1, array2); 
/* array1 值为  [12 , "foo" , {name "Joe"} , -2458 , "Doe" , 555 , 100] */
```

ES6 中可以使用 `[...array1, ...array2]` 实现。

- 获取数组中的最大值和最小值

number 本身没有 max 方法，但是 Math 有，我们可以借助 `call` 或者 `apply` 使用其方法。

```plain
var  numbers = [5, 458 , 120 , -215 ]; 
var maxInNumbers = Math.max.apply(Math, numbers),   //458
    maxInNumbers = Math.max.call(Math,5, 458 , 120 , -215); //458
```

- 验证是否是数组（前提是toString()方法没有被重写过）

```plain
function isArray(obj){ 
    return Object.prototype.toString.call(obj) === '[object Array]' ;
}
```

- 类（伪）数组使用数组方法

Javascript中存在一种名为**伪数组**的对象结构。比较特别的是 `arguments` 对象，还有像调用 `getElementsByTagName` , `document.childNodes` 之类的，它们返回 `NodeList` 对象都属于伪数组。不能调用 `Array` 下的 `push` , `pop` 等方法。

但是我们能通过 `Array.prototype.slice.call` 转换为真正的数组的带有 `length` 属性的对象，这样 `domNodes` 就可以应用 `Array` 下的所有方法了。

```plain
var domNodes = Array.prototype.slice.call(document.getElementsByTagName("*"));
```

- 继承

```plain
function Animal(name){
    this.name = name;
    this.showName = function(){
        console.log(this.name);
    }
}

function Cat(name){
    Animal.call(this, name);
}
```

## 一道面试题

下面就借用一道面试题，让大家更深入理解 `apply` 和 `call` 。

定义一个 log 方法，让它可以代理 `console.log` 方法，并且每个log消息添加一个"`(面试题宝典)`"的前缀。

大家可能会想到下面这个方法：

```plain
function log(msg) {
  console.log(`(面试题宝典)${msg}`);
}

log(1);    //1
log(1,2);    //1
```

但是对于传入的参数数量不确定时，这个方法不能将传入的参数全部打印出来。这个时候就可以考虑使用 `apply` 或者 `call`，注意这里传入多少个参数是不确定的，所以使用apply是最好的，方法如下：

```plain
function log(){
  var args = Array.prototype.slice.call(arguments);
  args.unshift('(面试题宝典)');
  console.log.apply(console, arguments);
};
log(1);    //1
log(1,2);    //1 2
```

## bind

我们再来说说 `bind`。

`bind()` 方法与 `apply` 和 `call` 很相似，也是可以改变函数体内 `this` 的指向。

MDN的解释是：

> `bind()` 方法创建一个新的函数，在 `bind()` 被调用时，这个新函数的 `this` 被指定为 `bind()` 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。

语法：

> function.bind(thisArg[, arg1[, arg2[, ...]]])

`bind` **不是**立即调用函数，而是返回一个新的函数。

还有一点，如果 `bind` 函数的参数列表为空，或者第一个参数是 `null` 或 `undefined`，执行作用域的 `this` 将被视为新函数的 `thisArg`。`apply` 和 `call` 则是如果这个函数处于非严格模式下，则指定为 `null` 或 `undefined` 时会自动替换为指向全局对象，原始值会被包装。

我们来看一个 `bind` 的例子：

```plain
this.x = 9;    // 在浏览器中，this 指向全局的 "window" 对象
var module = {
  x: 81,
  getX: function() { return this.x; }
};

module.getX(); // 81

var retrieveX = module.getX;
retrieveX();
// 返回 9 - 因为函数是在全局作用域中调用的

// 创建一个新函数，把 'this' 绑定到 module 对象
// 新手可能会将全局变量 x 与 module 的属性 x 混淆
var boundGetX = retrieveX.bind(module);
boundGetX(); // 81
```

还有个有趣的问题，如果连续 `bind()` 多次，会有什么效果呢？像这样：

```plain
var bar = function(){
    console.log(this.x);
}
var foo = {
    x:3
}
var sed = {
    x:4
}
var func = bar.bind(foo).bind(sed);
func(); //?
 
var fiv = {
    x:5
}
var func = bar.bind(foo).bind(sed).bind(fiv);
func(); //?
```

答案是，两次都输出 **3** ，而非期待中的 4 和 5 。原因是多次 bind() 是无效的。更深层次的原因与 `bind()` 的实现有关，相当于使用函数在内部包了一个 `call / apply` ，第二次 `bind()` 相当于再包住第一次 `bind()`，故第二次以后的 `bind` 是无法生效的。

## 常见考点

### 1. **`call`、`apply` 和 `bind` 的基本概念**

- 你能解释一下 `call`、`apply` 和 `bind` 的作用吗？它们有什么共同点和不同点？
- 它们都用于改变函数的 `this` 指向，能否举一个简单的例子说明它们的用法？

### 2. **`call` 和 `apply` 的区别**

- `call` 和 `apply` 的参数传递方式有什么不同？如何理解这两者的区别？
- 请举一个例子，演示如何使用 `call` 和 `apply` 来调用一个函数并改变 `this` 的指向。

### 3. **`bind` 的工作原理**

- `bind` 是如何工作的？它与 `call` 和 `apply` 有什么区别？
- `bind` 返回的是一个新的函数，为什么它不会立即执行？它是如何绑定 `this` 的？

### 4. **`this` 和 `call`/`apply`/`bind` 的关系**

- 你能描述一下如何使用 `call` 和 `apply` 来改变 `this` 的指向吗？比如，在事件处理函数或回调函数中。
- 在 `bind` 中，`this` 是如何永久绑定的？与 `call`/`apply` 不同，`bind` 为什么需要返回一个新的函数？

### 5. **应用场景与实际问题**

- `call` 和 `apply` 如何用来借用其他对象的方法？举个例子说明。
- 请举例说明你在项目中如何使用 `bind` 来绑定 `this`，特别是在事件处理或回调函数中。
- 在使用 `call`、`apply` 或 `bind` 时，你是否遇到过 `this` 绑定错误的情况？如何调试和解决这个问题？

### 6. **`bind` 的偏函数应用**

- 你如何使用 `bind` 实现偏函数（Partial Application）？请举例说明。
- 偏函数和柯里化（Currying）有什么区别？它们在实际开发中如何配合使用？

### 7. **性能与优化**

- `bind` 返回的新函数可能会影响性能，特别是在大量绑定的情况下，你如何优化这种性能问题？
- 如果你需要频繁地改变 `this`，你会选择 `call`、`apply` 还是 `bind`？为什么？

### 8. **特殊情况：箭头函数**

- 箭头函数的 `this` 与 `call`、`apply`、`bind` 有什么关系？为什么箭头函数不需要这些方法来改变 `this` 指向？
- 你如何在回调函数中使用箭头函数以避免 `this` 指向错误？
