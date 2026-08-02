+++
title = "百度-文库-校招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/45"
experienceId = 45
roundId = 62
roundOrder = 1
company = "百度"
date = "2025-07-19T07:40:07.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-45/round-61/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-45/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 二面深入考察了前端核心知识的应用和原理理解。重点包括CSS优先级、闭包与内存管理、JavaScript继承的多种实现方式、原型链的深层理解、虚拟DOM的性能优化原理以及Vue框架的高级特性。题目更侧重于“为什么”和“如何实现”，要求候选人不仅知其然，更要知其所以然。

本轮共 12 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍，没有实习过。 {#question-subjective-c29ace3f619f}

### 题目要点

1. **沟通表达能力**：能否清晰、自信地介绍自己。
2. **潜力与热情**：在没有实习经历的情况下，如何通过个人项目、技术博客、开源贡献等来证明自己的技术热情和学习能力。
3. **求职动机**：为什么选择这个岗位和公司。

<details>
<summary>参考答案</summary>

此题为个人经验总结，请根据自身情况作答。核心是突出自己的优势、学习能力和对前端的热情，用项目经验或学习成果来弥补实习经历的不足。

</details>

## 2. 最终颜色是什么？为什么？ {#question-subjective-0245f98e0d8a}

```html
<div class="box" id="content" style="color:red"></div>
```
```css
.box { color: blue }
#content { color: green }
```

### 题目要点

1. **CSS优先级（Specificity）**：这是CSS核心概念之一，考察对不同选择器权重的理解和计算能力。
2. **CSS规则来源**：是否了解行内样式、内部样式表、外部样式表的优先级关系。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

CSS的**优先级（Specificity）**，也常被称为**特殊性**或**权重**，是浏览器用来决定当多个规则应用到同一个元素上时，哪一条规则生效的计算方法。

优先级的计算规则可以总结为一个四元组 `(a, b, c, d)`：

* **a: 行内样式（Inline styles）**：如 `style="color: red;"`。如果存在，`a`为1，否则为0。
* **b: ID选择器**：如 `#content`。`b`为ID选择器的数量。
* **c: 类选择器、属性选择器、伪类选择器**：如 `.box`, `[type="text"]`, `:hover`。`c`为这些选择器的总数量。
* **d: 标签选择器、伪元素选择器**：如 `div`, `::before`。`d`为这些选择器的总数量。

**比较规则**：从`a`开始，逐位比较。`a`大的胜出；如果`a`相同，则比较`b`，`b`大的胜出；以此类推。只有在优先级完全相同时，才会根据样式在代码中出现的**顺序**来决定，“后来者居上”。

另外，`!important`声明拥有最高优先级，它会覆盖任何其他声明，但应避免滥用。

##### 1.2 核心用法 + 示例代码

我们来分析题目中的三个样式规则：

1. **行内样式**：`style="color:red"`<br>
   * 优先级计算：`a=1, b=0, c=0, d=0` \-> **(1, 0, 0, 0)**
2. **ID选择器**：`#content { color: green }`<br>
   * 优先级计算：`a=0, b=1, c=0, d=0` \-> **(0, 1, 0, 0)**
3. **类选择器**：`.box { color: blue }`<br>
   * 优先级计算：`a=0, b=0, c=1, d=0` \-> **(0, 0, 1, 0)**

**比较结果**：

* 首先比较`a`位，行内样式的`a`为1，其他都为0。
* 因此，行内样式的优先级最高。

**最终颜色是：`red`**

**追问**：如果不考虑行内样式，仅比较ID选择器和类选择器，那么`#content` (0,1,0,0) 的优先级高于 `.box` (0,0,1,0)，颜色会是`green`。

##### 1.3 常见误区或面试陷阱

1. **错误的权重计算**：比如错误地认为10个class选择器（0,0,10,0）的权重能超过1个ID选择器（0,1,0,0）。这是不对的，优先级比较是按位进行的，不存在进位。
2. **忽略行内样式**：下意识地只去比较CSS文件中的选择器，而忘记了HTML `style`属性具有最高的优先级（`a`位）。
3. **混淆优先级与书写顺序**：只有在优先级完全相同的情况下，书写顺序才起作用。例如，两个类选择器`.class1 {color: red;}`和`.class2 {color: blue;}`应用到同一个元素上，如果它们在CSS文件中出现的顺序是这样，那么蓝色会覆盖红色。

</details>

## 3. 代码题：以下代码输出什么？是否存在内存泄漏风险？如何优化？ {#question-subjective-5de2b6710fe5}

```js
function createCounter() {
  let count = 0;
  return function() { return count++; };
}
const counter = createCounter();
console.log(counter()); console.log(counter());
```

### 题目要点

1. **闭包的实际应用**：考察对闭包核心功能——封装私有变量和状态——的理解。
2. **内存管理与垃圾回收**：能否区分闭包的正常内存占用和真正的内存泄漏。
3. **代码优化意识**：在特定场景下，如何主动释放不再需要的内存。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

* **闭包（Closure）**：`createCounter`函数返回了一个内部的匿名函数。这个返回的函数能够访问并操作其定义时所在的词法作用域中的变量`count`。即使`createCounter`已经执行完毕，`count`变量也不会被销毁，因为它被返回的函数所引用。这种“函数”和“其对周围状态的引用”的组合就是闭包。
* **内存泄漏（Memory Leak）**：指程序中已动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。在JavaScript中，内存泄漏通常发生在当一块内存不再需要时，由于仍然存在对它的引用，导致垃圾回收机制无法回收它。

##### 1.2 核心用法 + 示例代码

**1\. 输出结果**

* `const counter = createCounter();`：调用`createCounter`，创建了一个闭包。变量`counter`引用了返回的匿名函数。此时，一个私有的`count`变量（值为0）被创建并被这个闭包“锁住”。
* `console.log(counter());`：第一次调用`counter`。它访问并返回了它闭包中的`count`（当前为0），然后将`count`自增为1。所以，第一次输出 **`0`**。
* `console.log(counter());`：第二次调用`counter`。它访问并返回了同一个闭包中的`count`（当前为1），然后将`count`自增为2。所以，第二次输出 **`1`**。

**最终输出：`0`，然后是 `1`。**

**2\. 内存泄漏风险分析**

* **在这个例子中，本身并不构成内存泄漏。** 闭包的设计目的就是为了让`count`变量持久化存在于内存中，以便`counter`函数可以持续跟踪状态。只要`counter`变量还存在且可访问，那么它所引用的闭包环境（包括`count`变量）就**不应该**被垃圾回收。这是**预期内的内存占用**。
* **潜在的内存泄漏场景**：内存泄漏会发生在这个模式被不恰当使用时。例如，如果`counter`与一个DOM元素相关联，而这个DOM元素后来被移除了，但JavaScript代码中仍然保留着对`counter`的引用，那么这个闭包以及它可能间接引用的（现已无用的）DOM元素就都无法被回收。<br>

``` js
// 潜在泄漏示例
function attachCounter(element) {
  let count = 0;
  element.addEventListener('click', function counterHandler() {
    console.log(++count);
  });
  // counterHandler 闭包了 element 和 count
}
let myDiv = document.getElementById('myDiv');
attachCounter(myDiv);
// ...后来...
myDiv.parentNode.removeChild(myDiv);
// 此时，myDiv 已经从DOM树移除，但 attachCounter 中的 counterHandler 仍然存在
// 它对 myDiv 的引用（通过element参数）可能会阻止 myDiv 被垃圾回收。
```

**3\. 如何优化**对于题目中的原始代码，因为它本身不是泄漏，所以“优化”的含义是“在不再需要时主动释放内存”。

* 当`counter`的功能使用完毕，不再需要保留其状态时，可以手动解除对它的引用，这样垃圾回收器就能在下一次运行时回收该闭包占用的内存。

```js
let counter = createCounter();
console.log(counter()); // 0
console.log(counter()); // 1

// ... 假设 counter 的生命周期到此结束 ...
counter = null; // 解除引用，让垃圾回收器可以回收闭包


```

##### 1.3 常见误区或面试陷阱

1. **将所有闭包都视为内存泄漏**：这是最常见的误解。闭包是JS的一个强大且正常的功能，它本身不是问题。只有当闭包导致了**不再需要的内存**无法被释放时，才构成内存泄漏。
2. **无法举出具体的泄漏场景**：能说出“闭包可能导致内存泄漏”，但无法给出一个具体的、合乎逻辑的例子（如与DOM事件监听器、定时器等结合的场景），说明理解不够实践化。
3. **对“优化”的理解偏差**：对于这个特定的题目，优化不是指改写`createCounter`函数，而是指在使用层面，如何管理`counter`的生命周期。

</details>

## 4. 代码题：实现一个`Animal`类及其子类`Dog`的继承关系，要求使用ES5和ES6两种方式。 {#question-subjective-eeb0b51d4242}

### 题目要点

1. **JavaScript继承**：对JS核心特性——基于原型的继承——的理解深度。
2. **ES5继承的实现**：是否掌握最经典的继承模式——组合寄生继承。
3. **ES6 `class`语法**：是否能熟练使用`class`、`extends`、`super`等语法糖。
4. **对比能力**：能否说出ES6 `class`相比ES5实现的优点。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

* **ES5 继承**：JavaScript在ES6之前没有类的概念，继承是通过**原型链**来实现的。核心思想是让子类的原型对象指向父类的一个实例或者父类的原型对象，从而继承父类原型上的方法；同时，在子类的构造函数中调用父类的构造函数（借用构造函数），来继承父类的实例属性。最常用且完善的方案是**组合寄生继承**。
* **ES6 继承**：ES6引入了`class`关键字，提供了更清晰、更面向对象的语法来创建对象和实现继承。`class`本质上是语法糖，其底层仍然是基于原型继承。它使用`extends`关键字实现继承，`super`关键字来调用父类的构造函数和方法。

##### 1.2 核心用法 + 示例代码

**方案一：ES5 实现（组合寄生继承）**

```
// 父类 Animal
function Animal(name) {
  this.name = name;
  this.colors = ['black', 'white']; // 引用类型属性，用于测试继承
}

Animal.prototype.sayName = function() {
  console.log('My name is ' + this.name);
};

// 子类 Dog
function Dog(name, age) {
  // 步骤1：借用父类构造函数，继承实例属性
  // 确保每个实例都有自己的colors属性，避免共享
  Animal.call(this, name);

  this.age = age;
}

// 步骤2：寄生式继承，继承父类原型方法
// 创建一个空对象，其原型指向父类原型，避免调用父类构造函数
Dog.prototype = Object.create(Animal.prototype);

// 步骤3：修复构造函数指向
// 将子类原型的constructor属性指回子类自身
Dog.prototype.constructor = Dog;

// 在子类原型上添加自己的方法
Dog.prototype.bark = function() {
  console.log('Woof! Woof!');
};

// 测试
var dog1 = new Dog('Teddy', 3);
dog1.colors.push('brown');
dog1.sayName(); // My name is Teddy
dog1.bark();    // Woof! Woof!
console.log(dog1.colors); // ["black", "white", "brown"]

var dog2 = new Dog('Lucy', 2);
console.log(dog2.colors); // ["black", "white"] (证明实例属性是独立的)


```

**方案二：ES6 实现**

```
// 父类 Animal
class Animal {
  constructor(name) {
    this.name = name;
    this.colors = ['black', 'white'];
  }

  sayName() {
    console.log('My name is ' + this.name);
  }
}

// 子类 Dog
class Dog extends Animal {
  constructor(name, age) {
    // 步骤1：调用父类的constructor
    // 必须在访问this之前调用super()
    super(name);

    this.age = age;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}

// 测试
const dog1 = new Dog('Teddy', 3);
dog1.colors.push('brown');
dog1.sayName(); // My name is Teddy
dog1.bark();    // Woof! Woof!
console.log(dog1.colors); // ["black", "white", "brown"]

const dog2 = new Dog('Lucy', 2);
console.log(dog2.colors); // ["black", "white"]


```

##### 1.3 常见误区或面试陷阱

1. **ES5继承方案不完整**：<br>
   * **只用原型链继承**：`Dog.prototype = new Animal()`。缺点是创建子类原型时会调用父类构造函数，且所有子类实例会共享父类的引用类型属性。<br>
   * **只用借用构造函数**：`Animal.call(this, name)`。缺点是无法继承父类原型上的方法。<br>
   * **忘记修复`constructor`指向**：`Dog.prototype.constructor = Dog`这一步虽然不影响功能，但它保证了原型链的完整性，是专业性的体现。
2. **ES6 `super`的使用错误**：<br>
   * 在子类的`constructor`中，在使用`this`之前**必须**调用`super()`。<br>
   * 忘记调用`super()`，或者在错误的位置调用。
3. **无法解释ES6 `class`的本质**：如果被追问，需要能答出`class`只是语法糖，其`constructor`对应构造函数，类方法定义在`prototype`上，`extends`主要通过修改原型链实现继承。

</details>

## 5. `instanceof`的原理是什么？如何实现深拷贝并处理原型链？ {#question-subjective-5d4b500b377d}

### 题目要点

1. **原型链的深入理解**：`instanceof`是检验原型链理解程度的试金石。
2. **手动实现原生操作符**：考察将理论知识转化为代码的能力。
3. **深拷贝的复杂性**：深拷贝是前端面试高频手写题，考察对引用类型、循环引用、特殊数据类型处理的全面性。
4. **原型链与拷贝**：一个非常深入的追问，考察在拷贝对象时，是否考虑到了其原型。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**`instanceof` 的原理** `A instanceof B` 的工作机制是：**检查构造函数 `B` 的 `prototype` 属性，是否存在于实例对象 `A` 的原型链上。**

换句话说，它会从 `A.__proto__` 开始，沿着原型链向上查找，看是否能找到一个原型等于 `B.prototype`。如果找到了，就返回 `true`；如果查找到原型链的末端（即 `null`）还没找到，就返回 `false`。

**深拷贝（Deep Clone）**

* **浅拷贝**：只复制对象的第一层属性。如果属性值是引用类型（如对象、数组），则只复制其引用（内存地址），而不是值本身。修改拷贝后的对象的引用类型属性，会影响到原对象。
* **深拷贝**：递归地复制一个对象的所有层级的属性。对于引用类型的属性，会创建一个新的对象或数组，并将原有的值复制过去。这样，拷贝后的对象与原对象完全独立，互不影响。

**深拷贝并处理原型链**标准的深拷贝通常只复制对象的“自有属性”（own properties）。一个更完善的深拷贝，在复制对象时，还应该正确地处理其原型。这意味着新拷贝出来的对象，其原型应该和原对象的原型保持一致。这可以通过 `Object.getPrototypeOf()` 来获取原对象的原型，并通过 `Object.create()` 来创建一个继承了该原型的新对象。

##### 1.2 核心用法 + 示例代码

**手动实现 `myInstanceof`**

```js
function myInstanceof(left, right) {
  // 基本类型直接返回false
  if (typeof left !== 'object' || left === null) return false;

  // 获取右侧构造函数的原型
  let proto = right.prototype;

  // 获取左侧实例对象的原型
  let currentProto = Object.getPrototypeOf(left);

  // 沿着原型链向上查找
  while (true) {
    // 查找到原型链末端，还没找到
    if (currentProto === null) return false;

    // 找到了
    if (currentProto === proto) return true;

    // 继续向上查找
    currentProto = Object.getPrototypeOf(currentProto);
  }
}

// 测试
function Animal() {}
function Dog() {}
Dog.prototype = new Animal();
const dog = new Dog();
console.log(myInstanceof(dog, Dog));    // true
console.log(myInstanceof(dog, Animal)); // true
console.log(myInstanceof(dog, Object)); // true


```

**实现一个考虑原型链的深拷贝函数 `deepClone`**

```js
function deepClone(obj, hash = new WeakMap()) {
  // 处理null和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理特殊对象：Date 和 RegExp
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 创建一个新对象，其原型与原对象一致
  const cloneObj = Object.create(Object.getPrototypeOf(obj));

  hash.set(obj, cloneObj); // 存入哈希表

  // 遍历自有属性（包括Symbol）进行递归拷贝
  for (const key of Reflect.ownKeys(obj)) {
    cloneObj[key] = deepClone(obj[key], hash);
  }

  return cloneObj;
}

// 测试
function Animal(name) { this.name = name; }
Animal.prototype.say = function() { console.log('I am an animal'); };
const cat = new Animal('cat');
cat.friend = { name: 'dog' };
cat.self = cat; // 循环引用

const clonedCat = deepClone(cat);
console.log(clonedCat);
console.log(clonedCat.name); // 'cat'
console.log(clonedCat.friend.name); // 'dog'
console.log(clonedCat.self === clonedCat); // true
clonedCat.say(); // 'I am an animal' (原型链被保留)
console.log(Object.getPrototypeOf(clonedCat) === Animal.prototype); // true


```

##### 1.3 常见误区或面试陷阱

1. **`instanceof` 原理说错**：错误地理解为检查构造函数，而不是检查原型。
2. **深拷贝实现不完整**：<br>
   * 最常见的错误是使用 `JSON.parse(JSON.stringify(obj))`。必须能主动说出它的缺点：会忽略`undefined`、`function`、`symbol`，无法处理循环引用，无法处理`Date`等特殊对象。<br>
   * 没有处理循环引用。这是深拷贝的核心难点，使用`Map`或`WeakMap`来解决是标准做法。<br>
   * 没有考虑原型链。这是一个加分项，能考虑到说明对JS对象的理解非常深入。
3. **对`Reflect.ownKeys`不熟**：它能获取对象自身的所有属性键，包括常规字符串键和`Symbol`键，比`Object.keys`或`Object.getOwnPropertyNames`更全面。

</details>

## 6. 讲一下虚拟DOM {#question-subjective-b243b4e563b9}

### 题目要点

1. **前端性能优化**：是否理解DOM操作的性能瓶颈。
2. **抽象思维**：能否理解用JavaScript对象来描述UI结构的这种抽象概念。
3. **框架核心原理**：虚拟DOM（VDOM）是现代前端框架（React, Vue）的基石，考察对此是否有基本认知。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**虚拟DOM（Virtual DOM, VDOM）** 是一种编程概念和模式。它不是一个具体的技术，而是一种思想：**用JavaScript对象来模拟和描述真实的DOM树结构**。

可以把虚拟DOM理解为真实DOM在内存中的一个轻量级、纯粹的JavaScript对象副本。

**为什么需要虚拟DOM？**

1. **真实DOM操作的性能瓶颈**：在浏览器中，直接操作DOM对象是相对“昂贵”的。因为每次对DOM的增、删、改，都可能触发浏览器的**回流（Reflow/Layout）和重绘（Repaint）**，这些过程会消耗大量计算资源，尤其是在频繁操作时，会导致页面卡顿。
2. **提升开发效率和体验**：它使得开发者可以不必关心底层的DOM操作细节。我们只需要关心数据（State）的变化，当数据变化后，框架会自动根据新的数据生成新的虚拟DOM树，然后通过高效的算法计算出与旧树的差异，最后只把这些差异应用到真实DOM上。这实现了数据驱动视图，大大简化了UI开发。

**虚拟DOM的工作流程**：

1. **首次渲染**：框架根据初始数据（State），构建一个完整的虚拟DOM树。然后，根据这个虚拟DOM树，生成对应的真实DOM，并渲染到页面上。
2. **更新过程**： a. 当应用的状态（State）发生变化时，框架会根据新的数据，重新构建一棵**新的虚拟DOM树**。 b. 框架会比较**新的虚拟DOM树**和**旧的虚拟DOM树**之间的差异。这个比较过程被称为 **Diffing**。 c. Diff算法会计算出最小的、必要的DOM操作（如“修改这个节点的文本”、“添加那个节点”、“删除这个节点”等）。这个计算出的差异集合被称为**补丁（Patch）**。 d. 最后，框架将这些补丁**一次性地**、**批量地**应用到真实的DOM树上，完成UI更新。

##### 1.2 核心用法 + 示例代码

一个简单的虚拟DOM节点可以用JS对象表示：

```
// 真实的DOM
<div id="container" class="main">
  <p>Hello, Virtual DOM!</p>
  <ul>
    <li>Item 1</li>
  </ul>
</div>

// 对应的虚拟DOM (简化表示)
const vdom = {
  tagName: 'div',
  props: {
    id: 'container',
    class: 'main'
  },
  children: [
    {
      tagName: 'p',
      props: {},
      children: ['Hello, Virtual DOM!']
    },
    {
      tagName: 'ul',
      props: {},
      children: [
        { tagName: 'li', props: {}, children: ['Item 1'] }
      ]
    }
  ]
};


```

**解决了什么问题**：

1. **性能优化**：<br>
   * **减少DOM操作次数**：通过Diff算法，将多次数据变化合并为一次批量DOM更新。<br>
   * **减少回流和重绘**：DOM操作的减少直接带来了回流和重绘的减少。<br>
   * **在JS层面进行计算**：比较两棵JS对象的差异，远比直接操作和查询真实DOM要快得多。
2. **跨平台能力**：虚拟DOM是对真实UI的抽象。这套描述UI的JS对象，不仅可以被渲染为浏览器的DOM，理论上也可以被渲染为其他平台的UI元素，如Native（React Native）、Canvas等，为跨平台开发提供了可能性。

##### 1.3 常见误区或面试陷阱

1. **认为虚拟DOM一定比原生DOM快**：这是一个绝对化的错误说法。对于单次、少量的DOM操作，原生API（如`document.getElementById`）的速度是无与伦比的。虚拟DOM的优势在于**处理频繁和复杂的UI更新**，它通过“批处理”和“智能计算”来减少总体开销，而不是在单次操作上更快。
2. **将虚拟DOM与具体框架混淆**：虚拟DOM是一种思想，React和Vue都有自己的实现。虽然理念相通，但具体的Diff算法和实现细节上存在差异。
3. **无法解释其工作流程**：只知道“虚拟DOM”这个名词，但说不清“State变化 -> 新VDOM -> Diff -> Patch -> 更新真实DOM”这个核心流程，说明理解停留在表面。

</details>

## 7. 虚拟DOM如何提升性能？vue的Diff算法优化策略有哪些？ {#question-subjective-fa4a92eef985}

### 题目要点

1. **VDOM性能原理的深入理解**：从“为什么快”深入到“如何做到快”。
2. **Vue框架的实现细节**：考察对Vue底层Diff算法优化策略的了解，这是衡量候选人是否对框架有深入研究的重要标志。
3. **算法思维**：Diff算法本身是一种高效的比较算法，考察对此是否有概念性的理解。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**虚拟DOM提升性能的核心在于两点**：

1. **将DOM操作从“多次”变为“一次”**：在没有虚拟DOM的情况下，每次数据变化都可能触发一次DOM操作，从而导致回流和重绘。例如，更新10个列表项，可能会操作DOM 10次。而虚拟DOM会将这10次更新累积起来，通过Diff算法计算出最终的差异，然后一次性地应用到真实DOM上。这个“批量更新”的思想，是其性能提升的关键。
2. **在JavaScript层面进行高效计算**：直接操作DOM涉及浏览器底层渲染引擎的复杂工作，开销很大。而虚拟DOM的Diff过程，是在纯JavaScript层面比较两个JS对象的差异，这个计算速度非常快，远胜于频繁地查询和修改真实DOM的状态。

**Vue的Diff算法优化策略**传统的树比较算法，其时间复杂度是 O(n³)，这是无法在Web应用中接受的。Vue和React的Diff算法都进行了一些大胆的假设，将复杂度优化到了 O(n)。Vue的优化策略主要体 现于 `patch` 过程，核心思想是**同层比较，不跨级**。

##### 1.2 核心用法 + 示例代码

**1\. 只进行同级比较（Tree Diff）**

* **策略**：Diff算法在比较新旧两棵虚拟DOM树时，只会对同一层级的节点进行比较，不会跨层级移动节点。
* **原因**：在前端开发实践中，很少出现将一个DOM节点从一个层级移动到另一个遥远层级的操作。这个假设极大地简化了算法。
* **结果**：如果一个节点在Diff过程中发现类型不同（例如`<div>`变成了`<p>`），那么Vue不会再去比较它们的子节点，而是直接将旧的节点（包括其所有子孙）整个销毁，并用新的节点来替换。这虽然在某些极端情况下可能不是最优的，但在绝大多数场景下，效率非常高。

**2\. 双端比较算法（Double-Ended Diff，主要用于列表比较）**这是Vue Diff算法的精髓所在，尤其是在处理列表（如`v-for`渲染的节点）时。当新旧两个子节点列表需要比较时，Vue不会简单地从头到尾一一对比，而是同时从新旧列表的**头部和尾部**进行比较。

它维护四个指针：`oldStartIdx`, `oldEndIdx`, `newStartIdx`, `newEndIdx`，分别指向新旧列表的头尾。在每一轮比较中，会尝试以下四种匹配：

1. `oldStartVnode` vs `newStartVnode` (头对头)
2. `oldEndVnode` vs `newEndVnode` (尾对尾)
3. `oldStartVnode` vs `newEndVnode` (旧头对新尾)
4. `oldEndVnode` vs `newStartVnode` (旧尾对新头)
* **策略**：只要有一种匹配成功，就移动对应的指针，并对匹配的节点进行`patch`。这种方式可以高效地处理节点的**前移、后移、反转**等常见操作。
* **如果四种比较都失败了**：才会退回到一个传统的查找，即用新节点的`key`去旧列表中查找是否存在可复用的节点。

**3\. `key`属性的重要性（Element Diff）**

* **策略**：当Vue用`v-for`更新一个列表时，它会使用`key`来跟踪每个节点的身份。`key`必须是**唯一的、稳定的**字符串或数字。
* **作用**：在上述双端比较和后续的查找过程中，`key`是判断两个节点是否为“同一个节点”的依据。有了`key`，Vue可以准确地知道哪些节点是新增的、哪些是删除的、哪些是需要移动位置的。
* **不使用`key`的后果**：如果不提供`key`（或使用`index`作为`key`），Vue会采用一种“就地复用”的策略。这在列表项顺序不变时没有问题，但一旦发生顺序改变（如在列表头部插入一项），Vue会错误地复用节点，只更新其内容，可能导致状态混乱和性能下降。例如，一个带输入框的列表项，顺序打乱后，输入框里的内容会停留在原来的位置，而不是跟随数据移动。

##### 1.3 常见误区或面试陷阱

1. **对`key`的作用理解模糊**：只知道`v-for`要加`key`，但说不清`key`在Diff过程中的具体作用。一定要能结合双端比较算法来解释`key`是如何帮助Vue识别和复用节点的。
2. **错误地使用`index`作为`key`**：这是一个非常常见的反面教材。必须能解释清楚为什么用`index`作`key`在列表项顺序会改变的场景下是有害的。
3. **对双端比较算法一无所知**：如果能清晰地说出“头对头、尾对尾、头对尾、尾对头”这四种比较策略，会是面试中的一个巨大亮点，表明你对Vue的理解超越了绝大多数候选人。

</details>

## 8. Vue3中静态提升（Static Hoisting）如何进一步优化渲染？ {#question-subjective-4a18a03a21b1}

### 题目要点

1. **Vue 3编译时优化**：考察对Vue 3在编译阶段所做的性能优化的了解。
2. **渲染性能的深度思考**：从“减少Diff操作”到“跳过Diff操作”的思维进阶。
3. **对框架新特性的关注度**：表明候选人有持续学习、跟进技术发展的习惯。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**静态提升（Static Hoisting）** 是 Vue 3 编译器在将模板（template）编译为渲染函数（render function）的过程中，进行的一项重要的性能优化。

**核心思想**：编译器会分析模板，找出其中**完全静态、永不改变**的部分（包括节点和属性），并将它们的创建过程**提升**到渲染函数之外。这意味着这些静态内容只会被创建一次，在后续的组件重新渲染时，可以直接复用，而**无需**在每次渲染时都重新创建它们的虚拟节点对象。

**它解决了什么问题？**在Vue 2中，即使一个节点是完全静态的，在每次组件重新渲染时，依然会为它创建一个新的VNode对象。虽然在Diff时，Vue 2能够通过一些标记跳过对这个静态节点的深度比较，但**创建VNode对象本身的开销**是无法避免的。

Vue 3的静态提升则更进一步，它从根源上减少了这种开销。

##### 1.2 核心用法 + 示例代码

**一个简单的例子**：

```
<template>
  <div>
    <!-- 这部分是静态的 -->
    <h1>这是一个标题</h1>
    <p>这是一个不会改变的段落。</p>

    <!-- 这部分是动态的 -->
    <p>{{ message }}</p>
  </div>
</template>


```

**Vue 3 编译器的行为**：

1. **分析**：编译器会识别出`<h1>`和第一个`<p>`节点及其内容是完全静态的。
2. **提升**：它会将这两个静态节点的VNode创建代码，从`render`函数内部“提升”到外部，作为常量保存起来。

**编译结果的伪代码**：

```
// 静态内容被提升到render函数外部，只创建一次
const _hoisted_1 = createVNode("h1", null, "这是一个标题");
const _hoisted_2 = createVNode("p", null, "这是一个不会改变的段落。");

// render函数在每次渲染时被调用
function render(_ctx, _cache) {
  return createVNode("div", null, [
    _hoisted_1, // 直接复用
    _hoisted_2, // 直接复用
    createVNode("p", null, _ctx.message) // 动态部分每次都创建
  ]);
}


```

**静态提升带来的优化**：

1. **减少VNode创建开销**：对于静态内容，VNode对象只在初始化时创建一次，后续渲染直接复用。这减少了函数调用和对象创建的开销，降低了内存占用。
2. **跳过Diff过程**：由于静态内容被特殊标记，在进行Diff时，Vue 3可以完全跳过对这些节点的比较，因为知道它们永远不会改变。这使得Diff过程更快，尤其是在一个组件包含大量静态内容时，效果非常显著。

这项优化是自动进行的，开发者无需任何额外操作，只要编写模板即可享受其带来的性能提升。

##### 1.3 常见误区或面试陷阱

1. **与JavaScript的变量提升混淆**：虽然都叫“提升”（Hoisting），但此处的静态提升是Vue编译器的特定优化策略，与JS语言层面的变量提升完全是两回事。
2. **与Vue 2的静态节点优化混淆**：Vue 2也有静态节点优化，但它只是在Diff时跳过子节点的比较。Vue 3的静态提升更彻底，它连父级静态节点的VNode创建都省掉了。能说出这个区别是关键。
3. **无法解释“为什么能优化”**：需要清晰地指出优化的两个层面：1）节省了每次重新渲染时创建VNode对象的开销；2）让Diff算法可以完全跳过对这部分静态树的比较。

</details>

## 9. 强缓存与协商缓存的适用场景 {#question-subjective-29eff8472d49}

### 题目要点

1. **缓存策略的实际应用**：从理论转向实践，考察在真实项目中如何为不同类型的资源选择合适的缓存策略。
2. **性能与更新的权衡**：能否理解在“加载速度”和“内容新鲜度”之间做权衡的必要性。
3. **前端工程化**：是否了解现代前端构建工具如何利用缓存策略（例如通过文件名哈希）。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
* **强缓存** (`Cache-Control: max-age=...`, `Expires`)：在有效期内，浏览器**不发请求**，直接使用本地缓存。它的优点是**速度最快**，缺点是在缓存有效期内，无法获取到服务器上资源的最新版本。
* **协商缓存** (`ETag`/`If-None-Match`, `Last-Modified`/`If-Modified-Since`)：浏览器**总是会发请求**到服务器，但服务器可以根据情况返回`304 Not Modified`，让浏览器继续使用本地缓存，从而节省下载内容的带宽。它的优点是能**保证获取到最新版本**（如果资源已更新），缺点是总有一次HTTP请求的延迟。

##### 1.2 核心用法 + 示例代码

**核心原则**：根据资源的**变化频率**和**重要性**来选择策略。

**1\. 适用强缓存的场景：不变的资源**对于那些内容基本不会改变，或者改变后会通过改变URL来引用的资源，应该使用强缓存，并设置一个很长的缓存时间。

* **资源类型**：<br>
   * **通过构建工具打包生成的、带哈希值的文件**：如 `main.a1b2c3d4.js`, `style.e5f6g7h8.css`。文件名中的哈希是根据文件内容生成的，一旦内容有变，文件名就会变，浏览器会将其视为一个全新的资源发起请求。<br>
   * **第三方库文件**：如 `react.min.js`, `vue.js`, `lodash.js` 等。这些库的版本是固定的。<br>
   * **图片、字体、音视频等媒体文件**：这些资源通常不常变动。
* **推荐配置**：<br>
```
Cache-Control: max-age=31536000, immutable
```
   * `max-age=31536000`：设置为一年，相当于永久缓存。<br>
   * `immutable`：一个额外的标记，告诉浏览器这个资源永远不会变，可以更加放心地使用缓存，即使用户刷新页面，也不用去发起协商缓存请求。

**2\. 适用协商缓存的场景：经常变化或需要保证新鲜度的资源**对于那些内容可能会改变，且希望用户尽快看到更新的资源，应该使用协商缓存。

* **资源类型**：<br>
   * **主入口HTML文件**：如 `index.html`。这个文件是所有资源的入口，通常不带哈希，内容可能会随着新版本的发布而改变（比如引用的JS/CSS文件名变了）。我们需要保证用户总能获取到最新的HTML文件，但如果它没变，又希望能利用缓存。<br>
   * **需要频繁更新的API数据接口**：虽然API缓存通常由业务逻辑控制，但如果某个接口的数据可以短时间缓存，协商缓存是一个好的选择。
* **推荐配置**：<br>
```
Cache-Control: no-cache
ETag: "some-unique-identifier"
```
   * `Cache-Control: no-cache`：这个名字有误导性，它**不是不缓存**，而是强制浏览器在每次使用缓存前，都必须向服务器发起一次协商缓存的验证请求。<br>
   * `ETag`：使用`ETag`而不是`Last-Modified`，因为它更精确。

##### 1.3 常见误区或面试陷阱

1. **对`no-cache`和`no-store`的理解混淆**：<br>
   * `no-cache`：表示使用协商缓存。<br>
   * `no-store`：才是真正地禁止浏览器缓存任何内容，每次都必须从服务器请求全新的资源。
2. **无法结合前端工程化来谈**：现代前端开发离不开Webpack/Vite等构建工具。能主动提到“文件名哈希+永久强缓存”是现代前端最佳缓存实践之一，会非常加分。
3. **场景选择不合理**：例如，为一个带哈希的JS文件设置协商缓存，或者为一个HTML主文件设置长期强缓存，这都是不合理的，体现了对缓存策略理解不够深入。

</details>

## 10. 如何通过Service Worker实现离线缓存？ {#question-subjective-8a205b1e7cee}

### 题目要点

1. **PWA（渐进式Web应用）**：考察对PWA核心技术之一Service Worker的了解。
2. **Service Worker生命周期**：是否清楚`install`, `activate`, `fetch`等关键事件。
3. **Cache API**：是否了解如何使用`caches`对象来操作缓存。
4. **网络代理概念**：能否理解Service Worker作为浏览器和网络之间的“代理”的角色。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**Service Worker (SW)** 是一个在浏览器后台独立于网页运行的脚本。它扮演着一个**网络代理**的角色，能够拦截、处理和响应其作用域下所有页面发出的网络请求。这个能力使得实现离线缓存、消息推送等功能成为可能。

**离线缓存的实现核心**：

1. **拦截请求**：利用Service Worker的`fetch`事件，拦截页面发出的所有网络请求。
2. **查询缓存**：当一个请求被拦截后，首先检查**Cache Storage**（一个由Service Worker控制的、独立于浏览器标准HTTP缓存的存储空间）中是否存在该请求对应的响应。
3. **响应请求**：<br>
   * 如果缓存中存在匹配的响应，则直接将缓存的响应返回给页面，从而实现离线访问。<br>
   * 如果缓存中不存在，则通过网络去请求资源。请求成功后，一方面将响应返回给页面，另一方面可以将响应的副本存入缓存中，以备下次离线时使用。

##### 1.2 核心用法 + 示例代码

实现一个基本的离线缓存通常包含以下步骤：

**1\. 注册Service Worker**在主应用的JavaScript文件（如`main.js`）中，检查浏览器支持并注册SW文件。

```
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}


```

**2\. 编写Service Worker脚本 (`sw.js`)**

```
// sw.js

// 定义缓存名称和需要缓存的“应用外壳”资源
const CACHE_NAME = 'my-app-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

// 监听 install 事件：在SW安装时，缓存应用外壳
self.addEventListener('install', event => {
  // waitUntil() 确保install事件在缓存操作完成前不会结束
  event.waitUntil(
    caches.open(CACHE_NAME) // 打开一个缓存空间
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE); // 将资源列表添加到缓存
      })
  );
});

// 监听 activate 事件：用于清理旧版本的缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // 删除不在此白名单中的旧缓存
          }
        })
      );
    })
  );
});

// 监听 fetch 事件：拦截网络请求并实现缓存策略
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. 尝试在缓存中查找匹配的响应
    caches.match(event.request)
      .then(response => {
        // 2. 如果缓存中存在，则直接返回缓存的响应
        if (response) {
          return response;
        }

        // 3. 如果缓存中不存在，则通过网络请求
        return fetch(event.request).then(
          networkResponse => {
            // 4. 请求成功后，克隆一份响应并存入缓存，然后返回原始响应
            // (需要克隆是因为Request和Response对象都是流，只能被消费一次)
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // 如果网络也失败了（例如，真正的离线状态），可以返回一个预备的离线页面
        // return caches.match('/offline.html');
      })
  );
});


```

这种策略被称为“缓存优先，网络回退”（Cache First, then Network）。

##### 1.3 常见误区或面试陷阱

1. **不了解Service Worker的生命周期**：`install`（安装）、`activate`（激活）、`waiting`（等待）等状态转换是SW工作的基础，不清楚这些就无法正确编写SW。
2. **混淆Cache Storage和浏览器HTTP缓存**：Service Worker的`caches` API操作的是一个独立的、可编程的缓存空间，它与浏览器基于HTTP头控制的标准缓存是完全隔离的。
3. **对`respondWith`和`waitUntil`的作用不清楚**：`event.respondWith()`用于劫持`fetch`事件并提供一个自定义的响应；`event.waitUntil()`用于延长事件的生命周期，直到传入的Promise完成，这在`install`和`activate`事件中至关重要。
4. **不知道缓存策略的多样性**：除了“缓存优先”，还有“网络优先，缓存回退”（Network First, then Cache）、“仅缓存”（Cache Only）、“仅网络”（Network Only）等多种策略，能说出并比较它们的适用场景会是加分项。

</details>

## 11. 千分位格式化函数 {#question-subjective-68ee00bc8494}

输入`1234567.89`，输出`1,234,567.89`，支持负数与小数。

### 题目要点

1. **字符串和数字处理**：考察对基本数据类型操作的熟练度。
2. **正则表达式**：这是一个典型的可以用正则表达式优雅解决的问题，考察对正则，特别是正向先行断言（lookahead）的掌握。
3. **算法逻辑**：如果不使用正则，能否设计出清晰的循环或分割算法来解决问题。
4. **代码的健壮性**：能否考虑到各种边界情况，如负数、小数、整数、非数字输入等。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

千分位格式化的核心是在一个数字的整数部分的每三位数字之间插入一个逗号（从右往左数）。

**主要实现思路**：

1. **`toLocaleString()` API**：这是JavaScript内置的、最简单、最推荐的方法。它可以根据指定的语言环境格式化数字，天然支持千分位、小数、货币等。
2. **正则表达式**：通过一个巧妙的正则表达式，可以一次性地找到所有需要插入逗号的位置。关键是使用**正向先行断言 `(?=...)`**，它匹配一个位置，这个位置后面需要满足某个模式，但这个模式本身不被包含在匹配结果中。
3. **循环/字符串分割**：将数字转为字符串，分割成整数和小数部分。对整数部分进行循环处理，从后往前每三位插入一个逗号。

##### 1.2 核心用法 + 示例代码

**方案一：使用 `toLocaleString()` (最佳实践)**

```js
function formatNumber(num) {
  if (isNaN(num)) {
    return 'Invalid Number';
  }
  return Number(num).toLocaleString('en-US');
}

// 测试
console.log(formatNumber(1234567.89));   // "1,234,567.89"
console.log(formatNumber(-1234567.89));  // "-1,234,567.89"
console.log(formatNumber(1234));         // "1,234"
console.log(formatNumber(123.45));       // "123.45"


```

**方案二：使用正则表达式 (面试高频手写)**

```js
function formatNumberWithRegex(num) {
  if (isNaN(num)) {
    return 'Invalid Number';
  }
  const parts = num.toString().split('.');
  // 对整数部分使用正则进行格式化
  // 正则解析:
  // \B: 匹配一个非单词边界，防止在字符串开头添加逗号
  // (?=(\d{3})+(?!\d)): 正向先行断言。匹配一个位置，这个位置后面跟着的是一组或多组的3个数字，并且这组数字后面不能再有数字了（即到字符串末尾或小数点）。
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

// 测试
console.log(formatNumberWithRegex(1234567.89));   // "1,234,567.89"
console.log(formatNumberWithRegex(-1234567.89));  // "-1,234,567.89"
console.log(formatNumberWithRegex(1234));         // "1,234"


```

**方案三：使用循环 (考验基础逻辑)**

```js
function formatNumberWithLoop(num) {
  if (isNaN(num)) return 'Invalid Number';
  let [integerPart, decimalPart] = String(num).split('.');
  let result = '';
  let count = 0;

  // 从后往前遍历整数部分
  for (let i = integerPart.length - 1; i >= 0; i--) {
    count++;
    result = integerPart.charAt(i) + result;
    // 每三位并且不是在最开头的位置，就加一个逗号
    if (count % 3 === 0 && i !== 0 && integerPart.charAt(i-1) !== '-') {
      result = ',' + result;
    }
  }

  return decimalPart ? result + '.' + decimalPart : result;
}

// 测试
console.log(formatNumberWithLoop(1234567.89));   // "1,234,567.89"
console.log(formatNumberWithLoop(-1234567.89));  // "-1,234,567.89"


```

##### 1.3 常见误区或面试陷阱

1. **不知道`toLocaleString`**：虽然面试官可能想考察手写能力，但不知道有这个便捷的内置API会显得知识面不够广。最好的做法是先给出`toLocaleString`方案，然后表示也可以手写实现。
2. **正则表达式写错**：特别是`\B`的使用，如果没有它，像`123456`会被错误地格式化为`,123,456`。以及对先行断言的理解不深，无法解释其工作原理。
3. **边界情况处理不全**：<br>
   * 忘记处理小数部分。<br>
   * 忘记处理负数（特别是循环法和正则法，要确保负号不会被错误处理）。<br>
   * 没有对输入进行校验（如输入非数字）。

</details>

## 12. 如何学习前端的 ？后续的规划是什么 {#question-subjective-25d293604377}

### 题目要点

1. **学习能力与方法论**：考察你是否有一套行之有效的学习方法，是主动学习者还是被动接受者。
2. **技术热情与广度**：从你的学习路径和关注点，可以看出你对技术的热情和视野。
3. **职业规划与自我认知**：考察你对前端领域的认知，以及对自己未来发展的思考，是否有清晰的目标。

<details>
<summary>参考答案</summary>

* **学习方法**：<br>
   * **打好基础**：通过阅读权威书籍（如《JavaScript高级程序设计》）、官方文档（MDN、Vue/React官网）系统学习HTML/CSS/JS核心知识。<br>
   * **项目驱动**：将所学知识用于实践，通过做个人项目、模仿优秀网站来巩固和深化理解。<br>
   * **深入原理**：对于重点知识（如V8引擎、事件循环、框架原理），会通过阅读源码、优秀博客、技术分享来探究其底层实现。<br>
   * **保持更新**：关注行业动态，通过社区（GitHub, Twitter）、技术周刊、大会等渠道，了解最新的技术和趋势。
* **后续规划**：<br>
   * **短期（1-2年）**：深入业务，成为团队中可靠的前端工程师。在熟练使用现有技术栈（如Vue/React）的基础上，深入理解其源码和设计思想。同时，加强在工程化（Webpack/Vite）、性能优化、Node.js等方面的能力。<br>
   * **中期（3-5年）**：目标是成为一名高级前端工程师或某一领域的专家。可能会在某个方向上深耕，如可视化、前端架构、跨端开发（Flutter/React Native）等，并期望能产出一些有影响力的技术成果或开源项目，提升自己的技术影响力。<br>
   * **长期**：保持对技术的好奇心，希望能成长为一名具备广阔视野的架构师或技术管理者，能够解决更复杂的问题，并为团队和业务创造更大的价值。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-45/round-61/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-45/_index.md" >}}) · 已是最后一轮 →
