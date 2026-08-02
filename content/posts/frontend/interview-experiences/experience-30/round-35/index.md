+++
title = "阿里-智能产品事业部-暑期实习 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/30"
experienceId = 30
roundId = 35
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T05:57:10.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-30/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 18 道题。答案默认折叠，便于先自行作答。

## 1. 请介绍一下你在 [具体项目名称] 中主要做了哪些工作？ {#question-subjective-0583a5eb88da}

### 题目要点

项目经验。

<details>
<summary>参考答案</summary>

回答参考：

1. 项目架构设计：参与设计项目的整体架构，选择前端技术栈。考虑到项目规模和性能需求，选择了 Vue.js 作为前端框架，Vuex 进行状态管理，Vue Router 实现单页面应用的路由管理，Vite 作为构建工具。这些技术的选择旨在提高开发效率和应用性能。

2. 核心模块开发：负责开发用户认证模块，实现了基于 JWT（JSON Web Token）的登录、注册和权限管理功能。通过与后端 API 的紧密协作，确保了用户数据的安全传输和存储。同时，开发了数据可视化模块，利用 ECharts 库展示复杂的业务数据，帮助用户更直观地理解和分析数据。

3. 性能优化：通过分析页面的性能瓶颈，实施了一系列优化措施。例如，采用代码分割技术将应用拆分成多个小块，实现按需加载；使用懒加载技术延迟加载非首屏资源；对图片资源进行压缩和格式优化，减少页面加载时间。这些优化显著提升了页面的加载速度，改善了用户体验。

4. 代码审查与测试：积极参与代码审查过程，遵循项目编码规范，确保代码质量。编写了大量的单元测试和集成测试用例，使用测试框架（如 Jest）进行自动化测试，确保代码的稳定性和可靠性，减少上线后的潜在问题。

</details>

## 2. 在 [具体项目名称] 中，遇到了哪些技术难点？你是如何解决的？ {#question-subjective-8c38cc2d315c}

### 题目要点

问题解决能力。

<details>
<summary>参考答案</summary>

回答参考：

1. 跨浏览器兼容性：项目需要支持多个主流浏览器，包括一些旧版本的浏览器。为了解决这一问题，使用 Babel 将 ES6+ 代码转译为 ES5，确保大部分现代 JavaScript 特性能够在旧浏览器中运行。同时，引入 Polyfill 库来补充那些浏览器原生不支持的 API，例如 Promise、fetch 等。此外，使用 Autoprefixer 工具为 CSS 添加必要的浏览器前缀，确保 CSS 样式在不同浏览器中的一致性。

2. 性能优化：随着项目规模的扩大，页面的加载时间和交互响应时间面临着挑战。通过分析，发现主要的性能瓶颈在于大量的初始 JavaScript 包和未优化的图片资源。为解决此问题，实施了代码分割策略，将应用的代码分割成多个小块，按需加载，减少了初始加载的包大小。同时，将图片资源转换为 WebP 格式，并实现了图片的懒加载，只有在用户滚动到图片位置时才加载图片，从而显著缩短了页面的初始加载时间。

3. 后端 API 集成：在开发过程中，遇到了 API 响应数据格式不一致的问题，这给前端的数据处理带来了困难。为了解决这个问题，设计了一个统一的数据处理中间层，对后端返回的数据进行预处理和格式化，使其符合前端的要求。同时，与后端团队进行了深入沟通，推动他们优化 API 设计，以更好地满足前端的需求。

</details>

## 3. [具体项目名称] 中有哪些你觉得值得分享的亮点或经验？ {#question-subjective-4cec67ddc627}

### 题目要点

项目亮点。

<details>
<summary>参考答案</summary>

回答参考：

1. 组件化开发：引入组件化开发模式，将项目中的 UI 界面拆分为多个独立的、可复用的组件。例如，设计了一个通用的表格组件，它可以适应不同的数据展示需求，并且可以在多个页面中复用。这不仅提高了开发效率，还减少了重复代码的编写，提高了代码的一致性和可维护性。

2. 测试策略：实施了完整的单元测试和集成测试策略。通过编写测试用例，及时发现和修复潜在的 bug，确保代码的稳定性和可靠性。这在项目的持续迭代过程中发挥了重要作用，为新功能的添加提供了信心，确保不会影响现有的功能。

3. 性能监测与优化：建立了一套前端性能监测和优化流程。通过使用性能分析工具（如 Lighthouse 和 Chrome DevTools），定期对应用的性能进行监测，并根据监测结果进行针对性的优化。这种持续的关注确保了应用在各种设备和网络条件下都能提供良好的用户体验。

4. 团队协作与知识共享：强调团队协作和知识共享。组织了多次技术分享会，将项目中积累的经验和知识分享给团队成员。同时，也从团队成员那里学到了很多，这种相互学习的氛围有助于整个团队的成长和技术水平的提升。

</details>

## 4. 对于 [具体项目名称] 的具体技术实现，能否详细介绍一下？ {#question-subjective-166608bb2749}

### 题目要点

技术实现。

<details>
<summary>参考答案</summary>

回答参考：

1. 前端技术栈：选择了 Vue.js 作为前端框架，利用其响应式的数据绑定和组件化的开发模式，提高开发效率和代码的可维护性。Vuex 用于管理应用的状态，将应用的状态集中存储在一个全局的 store 中，方便各个组件之间的状态共享和管理。Vue Router 负责页面的路由管理，实现了单页面应用的流畅导航体验。Vite 作为构建工具，提供了快速的热模块替换（HMR）功能，大大提高了开发效率。

2. 路由设计：采用了嵌套路由的方式，将应用的不同功能模块组织成父子路由结构。这种设计可以更好地体现页面的层次关系，方便页面的导航和管理。例如，将用户管理、订单管理等功能模块设计为子路由，而将登录、注册等公共页面设计为独立路由。

3. 组件设计：遵循高内聚、低耦合的原则，设计每个组件都有明确的职责和接口。例如，设计了一个通用的表单组件，它可以适应不同的表单数据和验证规则，并且可以在多个页面中复用。这减少了重复代码的编写，提高了代码的可维护性和可测试性。

4. 用户认证：实现了基于 JWT 的用户认证流程。当用户登录时，前端向后端发送登录请求，后端验证用户身份后返回一个 JWT 令牌。前端收到令牌后，将其存储在 localStorage 中，并在后续的 API 请求中将令牌放入 HTTP 请求头中，以此来验证用户的身份。这种方法确保了用户身份验证的安全性和有效性。

5. 异常处理：建立了一个全局的异常处理机制。通过一个全局的错误处理器捕获应用中的错误，并根据错误的类型显示相应的错误提示信息给用户。同时，错误信息也会被记录下来，方便开发人员进行问题排查和修复，提高了应用的稳定性和用户体验。

</details>

## 5. JavaScript中的原型，原型链分别是什么? {#question-d1bb4169-cd53-4398-b4a1-5e0c533c87dc}

> 题库原题：[JavaScript中的原型，原型链分别是什么?](https://fe.ecool.fun/topic/d1bb4169-cd53-4398-b4a1-5e0c533c87dc)

### 题目要点

## 原型（Prototype）

在JavaScript中，每个对象都有一个原型对象，这个原型对象包含了一组属性和方法。对象可以通过这个原型对象继承属性和方法。

### 特点

- 原型对象本身也是一个普通的对象。
- 可以通过`Object.getPrototypeOf()`获取对象的原型。
- 原型上添加的属性和方法可以被子对象继承。

## 原型链（Prototype Chain）

原型链是一种机制，用于在查找对象属性时，从对象自身的属性开始，沿着原型的链式结构向上查找，直到找到属性或到达链的末端（通常是一个`null`的原型）。

### 特点

- 原型链是由一系列原型对象组成的，每个对象都可能有自己的原型。
- 属性查找遵循链式结构，从下到上直到找到匹配的属性或到达链的末端。
- 原型链允许对象共享属性和方法，提高了内存效率。

## 原型链的查找过程

1. **对象属性查找**：首先在对象自身属性中查找。
2. **原型属性查找**：如果当前对象没有找到，沿着原型链向上查找。
3. **链式结构**：继续在原型的原型上查找，直到链的末端。

## 原型链的末端

- 原型链的末端通常是`Object.prototype`，其原型为`null`。

## 原型链的作用

- **属性继承**：允许对象继承原型链上属性和方法。
- **方法共享**：多个对象可以共享原型上定义的方法，避免重复定义。

<details>
<summary>参考答案</summary>

## 一、原型

`JavaScript` 常被描述为一种基于原型的语言——每个对象拥有一个原型对象

当试图访问一个对象的属性时，它不仅仅在该对象上搜寻，还会搜寻该对象的原型，以及该对象的原型的原型，依次层层向上搜索，直到找到一个名字匹配的属性或到达原型链的末尾

准确地说，这些属性和方法定义在Object的构造器函数（constructor functions）之上的`prototype`属性上，而非实例对象本身

下面举个例子：

函数可以有属性。 每个函数都有一个特殊的属性叫作原型`prototype`

```js
function doSomething(){}
console.log( doSomething.prototype );
```

控制台输出

```js
{
    constructor: ƒ doSomething(),
    __proto__: {
        constructor: ƒ Object(),
        hasOwnProperty: ƒ hasOwnProperty(),
        isPrototypeOf: ƒ isPrototypeOf(),
        propertyIsEnumerable: ƒ propertyIsEnumerable(),
        toLocaleString: ƒ toLocaleString(),
        toString: ƒ toString(),
        valueOf: ƒ valueOf()
    }
}
```

上面这个对象，就是大家常说的原型对象

可以看到，原型对象有一个自有属性`constructor`，这个属性指向该函数，如下图关系展示

 ![](https://static.ecool.fun//article/2deaaac4-9732-4c1c-a3dd-8506adf9d0fe.png)

## 二、原型链

原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为原型链 (prototype chain)，它解释了为何一个对象会拥有定义在其他对象中的属性和方法

在对象实例和它的构造器之间建立一个链接（它是`__proto__`属性，是从构造函数的`prototype`属性派生的），之后通过上溯原型链，在构造器中找到这些属性和方法

下面举个例子：

```js
function Person(name) {
    this.name = name;
    this.age = 18;
    this.sayName = function() {
        console.log(this.name);
    }
}
// 第二步 创建实例
var person = new Person('person')
```

根据代码，我们可以得到下图

 ![](https://static.ecool.fun//article/9db8820a-8e19-4755-8edf-fc09231ff6ef.png)

下面分析一下：

- 构造函数`Person`存在原型对象`Person.prototype`
- 构造函数生成实例对象`person`，`person`的`__proto__`指向构造函数`Person`原型对象
- `Person.prototype.__proto__` 指向内置对象，因为 `Person.prototype` 是个对象，默认是由 `Object `函数作为类创建的，而 `Object.prototype` 为内置对象

- `Person.__proto__` 指向内置匿名函数 `anonymous`，因为 Person 是个函数对象，默认由 Function 作为类创建

- `Function.prototype` 和 `Function.__proto__ `同时指向内置匿名函数 `anonymous`，这样原型链的终点就是 `null`

## 三、总结

下面首先要看几个概念：

`__proto__`作为不同对象之间的桥梁，用来指向创建它的构造函数的原型对象的

 ![](https://static.ecool.fun//article/0c2d0d47-2b06-43ed-92e4-129425b6af0c.png)

每个对象的`__proto__`都是指向它的构造函数的原型对象`prototype`的

```js
person1.__proto__ === Person.prototype
```

构造函数是一个函数对象，是通过 `Function `构造器产生的

```js
Person.__proto__ === Function.prototype
```

原型对象本身是一个普通对象，而普通对象的构造函数都是`Object`

```js
Person.prototype.__proto__ === Object.prototype
```

刚刚上面说了，所有的构造器都是函数对象，函数对象都是 `Function `构造产生的

```js
Object.__proto__ === Function.prototype
```

`Object `的原型对象也有`__proto__`属性指向`null`，`null`是原型链的顶端

```js
Object.prototype.__proto__ === null
```

下面作出总结：

- 一切对象都是继承自`Object`对象，`Object` 对象直接继承根源对象` null`

- 一切的函数对象（包括 `Object` 对象），都是继承自 `Function` 对象

- `Object` 对象直接继承自 `Function` 对象

- `Function`对象的`__proto__`会指向自己的原型对象，最终还是继承自`Object`对象

</details>

## 6. 原型和原型链出现的原因是什么？ {#question-subjective-ef6b83e04ab5}

### 题目要点

JavaScript 基础。

<details>
<summary>参考答案</summary>

原型和原型链的出现主要是为了解决 JavaScript 中代码复用和对象继承的问题。

在 JavaScript 的早期设计中，并没有类（Class）的概念，而是采用了一种基于原型的继承机制。这种机制允许开发者通过一个已有的对象来创建新对象，并且新对象可以继承原有对象的属性和方法。通过原型和原型链，不同的对象可以共享相同的属性和方法，从而实现了代码的复用。

此外，原型链还提供了一种灵活的机制，使得对象可以根据需要动态地继承其他对象的行为，这在某些场景下比基于类的继承更加灵活和强大。

这种基于原型的继承机制是 JavaScript 语言设计的一个重要特点，它允许开发者以一种简洁而高效的方式实现对象之间的代码复用和行为共享。

</details>

## 7. 说说你对闭包的理解，以及闭包使用场景 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

> 题库原题：[说说你对闭包的理解，以及闭包使用场景](https://fe.ecool.fun/topic/e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848)

### 题目要点

# 什么是闭包

简单理解就是函数中嵌套函数。我们都知道局部变量我们是无法访问的，但是通过闭包可以做到。

```js
// 正常访问
var lan = 'zh';
function hello(){
  var name = '前端未来';
}
console.log(name)//很明显'undefined'

// 换成闭包
function hello(){
    var name = '前端未来';
    function demo(){
      console.log(name)//打印：前端未来
    }
}
```

# 闭包的应用场景

## 1. 数据封装和隐私

闭包可以用来封装数据和功能，创建具有私有变量和公共接口的模块。

### 应用

- 创建具有私有状态的模块或对象。

## 2. 函数工厂

闭包用于创建返回函数的函数，这些返回的函数可以维持状态。

### 应用

- 生成具有特定配置或状态的函数。

## 3. 柯里化（Currying）

闭包允许将多参数的函数转换成一系列单参数的函数。

### 应用

- 简化函数调用，逐步应用参数。

## 4. 延迟计算

闭包可以用于延迟计算，只在必要时才执行计算。

### 应用

- 实现性能优化，如懒加载。

## 5. 迭代器和生成器

闭包在迭代器和生成器中用于维护状态。

### 应用

- 实现可重复使用的迭代器。

## 6. 异步编程

闭包在异步回调中保持状态，避免在多层嵌套回调中使用额外的参数。

### 应用

- 管理异步操作的状态和结果。

## 7. 事件处理器

闭包可以捕获事件处理器需要的局部变量。

### 应用

- 为事件绑定具有特定状态的处理器。

## 8. 缓存和记忆

闭包可以用来实现缓存逻辑，存储和复用计算结果。

### 应用

- 减少重复计算，提高性能。

## 注意事项

- 闭包可能会导致内存使用增加，因为它们会保持对外部变量的引用。
- 理解闭包的作用域链对于避免意外的行为和内存泄漏很重要。
- 闭包提供了强大的功能，但应谨慎使用，以保持代码的清晰和可维护性。

<details>
<summary>参考答案</summary>

## 一、是什么

一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）

也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域

在 `JavaScript `中，每当创建一个函数，闭包就会在函数创建的同时被创建出来，作为函数内部与外部连接起来的一座桥梁

下面给出一个简单的例子

```js
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

`displayName()` 没有自己的局部变量。然而，由于闭包的特性，它可以访问到外部函数的变量

## 二、使用场景

任何闭包的使用场景都离不开这两点：

- 创建私有变量
- 延长变量的生命周期

> 一般函数的词法环境在函数返回后就被销毁，但是闭包会保存对创建时所在词法环境的引用，即便创建时所在的执行上下文被销毁，但创建时所在词法环境依然存在，以达到延长变量的生命周期的目的

下面举个例子：

在页面上添加一些可以调整字号的按钮

```js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);

document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```

### 柯里化函数

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用

```js
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

### 使用闭包模拟私有方法

在`JavaScript`中，没有支持声明私有变量，但我们可以使用闭包来模拟私有方法

下面举个例子：

```js
var Counter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
};

var Counter1 = Counter();
var Counter2 = Counter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

上述通过使用闭包来定义公共函数，并令其可以访问私有函数和变量，这种方式也叫模块方式

两个计数器 `Counter1` 和 `Counter2` 是维护它们各自的独立性的，每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境，不会影响另一个闭包中的变量

### 其他

例如计数器、延迟调用、回调等闭包的应用，其核心思想还是创建私有变量和延长变量的生命周期

## 三、注意事项

如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响

例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。

原因在于每个对象的创建，方法都会被重新赋值

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

</details>

## 8. v-model 的原理是什么样的？ {#question-e7f68d8b-d130-415e-8f9d-a47deeb462f9}

> 题库原题：[v-model 的原理是什么样的？](https://fe.ecool.fun/topic/e7f68d8b-d130-415e-8f9d-a47deeb462f9)

### 题目要点

`v-model`的工作原理包括以下几个步骤：

1. **在模板中使用**：
   - 可以将`v-model`指令用于绑定变量到表单元素上，如`<input v-model="message">`。
2. **事件绑定**：
   - Vue解析模板时，将`v-model`指令转换为适当的属性和事件绑定。
   - 对于大多数表单元素，它将`value`属性与输入框的当前值绑定，并监听`input`事件来实时更新绑定的数据。
3. **数据同步**：
   - 当用户在输入框中键入或选择内容时，`input`事件被触发。
   - Vue捕获该事件并更新绑定的数据，根据数据的变化重新渲染视图。
4. **懒加载和`change`事件**：
   - 如果使用`v-model`的`lazy`修饰符，Vue将监听`change`事件而不是`input`事件。
   - 只有当用户完成输入并触发`change`事件时，才会更新绑定的数据。

<details>
<summary>参考答案</summary>

`v-model`是Vue.js框架中的一个指令，用于在表单元素和组件之间实现双向数据绑定。它提供了一种简洁的方式来将表单输入的值与Vue实例的属性进行关联。

当使用`v-model`指令时，Vue会根据表单元素的类型（如`input`、`select`、`textarea`等）自动为其添加相应的事件监听器，并在用户输入时更新绑定的数据。

具体地讲，`v-model`的原理如下：

1. 在模板中，我们可以使用`v-model`指令来绑定一个变量到表单元素（或组件）上，例如：`<input v-model="message">`。

2. Vue解析模板时，会将`v-model`指令转换成合适的属性和事件绑定。对于大多数表单元素，它会将`value`属性与输入框的当前值进行绑定，并监听`input`事件来实时更新绑定的数据。

3. 当用户在输入框中键入或选择内容时，触发`input`事件。Vue会捕获该事件并更新绑定的数据，以及根据数据的变化重新渲染视图。

4. 同样地，如果在表单元素上使用`v-model`的`lazy`修饰符，Vue会监听`change`事件而不是`input`事件。这样，只有当用户完成输入并触发`change`事件时，才会更新绑定的数据。

`v-model`指令实现双向绑定的原理是通过监听表单元素的输入事件（如`input`或`change`），将用户的输入同步到Vue实例中的属性，并在属性值变化时重新渲染视图。这使得我们可以轻松地将表单数据与Vue实例的状态保持同步，消除了手动监听和更新的冗余代码。

</details>

## 9. 你是否考虑过对 v-model 进行优化？有哪些优化方法？ {#question-subjective-d094756e4a98}

### 题目要点

核心考查：你是否考虑过对 v-model 进行优化？有哪些优化方法？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

1. 优化方法：

```html
<input v-model.lazy="message" />
```

```html
<input v-model.trim="message" />
```

1. 使用 `.lazy` 修饰符：这个修饰符会使数据更新只在用户离开输入框（即 `change` 事件触发时）才进行，而不是在每次输入时都更新数据。这样可以减少数据同步的频率，特别适用于大型表单或输入密集型的应用。
2. 使用 `.trim` 修饰符：自动去除用户输入的首尾空格。这对于处理用户输入的清洗非常有用，避免了在数据处理时额外的字符串操作。例如：
3. 结合计算属性和 `watch` 监听器：对于复杂的表单验证场景，可以使用 Vue 的计算属性和 `watch` 监听器来实现更精细的控制。例如，可以通过计算属性对输入数据进行格式化，或者在 `watch` 监听器中实现异步验证逻辑。这有助于提升表单的响应速度和用户体验。

</details>

## 10. 平常你是如何进行代码调试的？ {#question-1044b4d4-a095-4730-b911-8426b8667baf}

> 题库原题：[平常你是如何进行代码调试的？](https://fe.ecool.fun/topic/1044b4d4-a095-4730-b911-8426b8667baf)

### 题目要点

* **工具组合**：灵活切换浏览器断点、编辑器调试和第三方抓包工具。
* **性能视角**：不只关注报错，更通过 Performance 和 Memory 分析运行质量。
* **链路追踪**：利用 Source Map 还原源码，利用框架插件追踪状态流转。
* **环境覆盖**：针对移动端真机和线上环境，建立专项的监控与代理方案。

<details>
<summary>参考答案</summary>

调试代码早已不再局限于简单的 `console.log`。在复杂的工程环境下，调试是一套**由表及里、从工具链到运行机制**的综合诊断过程。

### 1. 浏览器开发者工具（Chrome DevTools）的深度应用

这是前端调试的“主战场”，但我会使用一些更高阶的特性：

* **条件断点（Conditional Breakpoints）**：在循环或者频繁触发的逻辑中，右键设置条件断点（例如 `i === 5`），避免无效的单步执行。
* **日志点（Logpoints）**：在不希望污染源码、不触发重新编译的情况下，直接在 DevTools 里插入日志输出。
* **性能分析（Performance Tab）**：针对页面卡顿，通过录制 Profile 观察火焰图，找出长任务（Long Task）和重排（Reflow）的根源。
* **内存分析（Memory Tab）**：利用 Heap Snapshot 对比，排查闭包或未销毁的事件监听导致的内存泄漏。

### 2. 源码映射与编辑器集成（Source Maps & VS Code）

在处理经过压缩（Minified）的生产环境代码时，Source Map 是还原真相的关键。

* **VS Code Debugger**：比起在浏览器里跳来跳去，我更倾向于直接在 VS Code 中配置 `.vscode/launch.json`。这样可以直接在编辑器内打断点，利用编辑器强大的上下文感知能力查看变量，实现“编写与调试”体验的无缝衔接。

### 3. 针对框架层面的专项调试

现代前端框架（React/Vue）有其独特的状态流转机制，通用工具往往难以直观追踪。

* **专项插件**：使用 **React Developer Tools** 观察组件树的 Fiber 结构和 Hooks 状态；使用 **Vue Devtools** 追踪 Pinia 状态的变化以及事件总线的触发。
* **时间旅行（Time Travel）**：在状态管理库（如 Redux/Vuex）中，通过快照回溯定位是哪一次 Action 导致了状态异常。

### 4. 网络层与接口模拟（Network & Proxy）

当后端接口尚未就绪或环境受限时：

* **Charles / Whistle / Fiddler**：作为代理抓包工具，用于截获并修改请求。特别是 **Whistle**，可以通过配置规则实现域名映射、注入调试脚本（如 Eruda/vConsole）到移动端页面。
* **Mock 服务**：在开发阶段使用 MSW (Mock Service Worker) 拦截 Fetch 请求，模拟各种极端情况（如 500 错误、请求超时）。

### 5. 移动端真机调试

这是前端开发中的痛点。

* **Safari/Chrome 远程调试**：通过 USB 连接，在桌面端浏览器控制真机中的 WebView。
* **微端/内建工具**：对于微信小程序或特定 App 内部的 H5，利用微信开发者工具的远程调试功能，或者在页面中植入 **vConsole** 这种轻量级面板查看日志。

### 6. 异常监控与日志溯源

对于线上偶发性问题：

* **Sentry / Fundebug**：通过上报的堆栈信息（Stack Trace）定位报错行数。
* **用户行为回放**：分析用户操作路径，重现报错前的上下文。

</details>

## 11. 你有使用过哪些开发调试工具？ {#question-subjective-8c53d314209b}

### 题目要点

浏览器开发者工具：使用 Chrome DevTools 和 Firefox Developer Edition 进行前端调试。这些工具提供了丰富的功能，包括控制台（Console）、元素检查（Elements）、网络请求分析（Network）、性能监测（Performance）等。通过这些功能，可以快速查看页面的 HTML 结构、CSS 样式、JavaScript 执行情况以及网络请求的详细信息。

<details>
<summary>参考答案</summary>

1. 浏览器开发者工具：使用 Chrome DevTools 和 Firefox Developer Edition 进行前端调试。这些工具提供了丰富的功能，包括控制台（Console）、元素检查（Elements）、网络请求分析（Network）、性能监测（Performance）等。通过这些功能，可以快速查看页面的 HTML 结构、CSS 样式、JavaScript 执行情况以及网络请求的详细信息。
2. 代码编辑器插件：在 VS Code 中使用 Prettier（代码格式化）、ESLint（代码质量检查）、Vetur（Vue 语言支持）等插件。这些插件可以帮助在编写代码时自动格式化代码、检查代码规范并提供语法高亮和智能提示，从而提高代码的可读性和质量。
3. Vue DevTools：调试 Vue 应用的组件结构和状态管理。它可以连接到 Vue 应用，提供组件的层级结构、状态数据、事件和路由信息等，帮助快速理解组件之间的关系和状态流动。
4. 性能分析工具：使用 Lighthouse 和 WebPageTest 评估和优化网站的性能。这些工具可以生成详细的性能报告，指出页面加载时间、渲染性能、资源优化等方面的改进建议。
5. API 调试工具：使用 Postman 进行 API 调试，测试后端接口的返回数据和响应状态，确保前后端数据交互的正确性。
6. Git 工具：使用 Git GUI 或命令行管理代码版本和调试合并冲突。这些工具帮助追踪代码的变更历史、比较不同版本之间的差异并解决团队成员之间的代码冲突问题。

</details>

## 12. 说说你对盒子模型的理解 {#question-dc607f56-c467-4cc2-8a0a-c79d498bee49}

> 题库原题：[说说你对盒子模型的理解](https://fe.ecool.fun/topic/dc607f56-c467-4cc2-8a0a-c79d498bee49)

### 题目要点

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）

<details>
<summary>参考答案</summary>

## 一、是什么

当对一个文档进行布局（layout）的时候，浏览器的渲染引擎会根据标准之一的 CSS 基础框盒模型（CSS basic box model），将所有元素表示为一个个矩形的盒子（box）

一个盒子由四个部分组成：`content`、`padding`、`border`、`margin`

![](https://static.ecool.fun//article/a2dd1ae4-1031-4391-b320-3d65c1fffb49.png)\r\n\r\n`content`，即实际内容，显示文本和图像

* `boreder`，即边框，围绕元素内容的内边距的一条或多条线，由粗细、样式、颜色三部分组成
* `padding`，即内边距，清除内容周围的区域，内边距是透明的，取值不能为负，受盒子的`background`属性影响
* `margin`，即外边距，在元素外创建额外的空白，空白通常指不能放其他元素的区域

上述是一个从二维的角度观察盒子，下面再看看看三维图：

![](https://static.ecool.fun//article/ade993de-6cb6-45e6-8750-7018df905d14.png)

下面来段代码：
```html
<style>
.box {
    width: 200px;
    height: 100px;
    padding: 20px;
}
</style>

<div class=\"box\">
盒子模型
</div>
```

当我们在浏览器查看元素时，却发现元素的大小变成了`240px`

这是因为，在`CSS`中，盒子模型可以分成：

- W3C 标准盒子模型
- IE 怪异盒子模型

默认情况下，盒子模型为`W3C` 标准盒子模型

## 二、标准盒子模型

标准盒子模型，是浏览器默认的盒子模型

下面看看标准盒子模型的模型图：

![](https://static.ecool.fun//article/bb71712f-4d36-49cc-a180-b08f4a536b9e.png)

从上图可以看到：

- 盒子总宽度 = width + padding + border + margin;
- 盒子总高度 = height + padding + border + margin

也就是，`width/height` 只是内容高度，不包含 `padding` 和 `border `值

所以上面问题中，设置`width`为200px，但由于存在`padding`，但实际上盒子的宽度有240px

## 三、IE 怪异盒子模型

同样看看IE 怪异盒子模型的模型图：

![](https://static.ecool.fun//article/39712bfa-735c-404d-9cfb-78a9873b0e38.png)

从上图可以看到：

- 盒子总宽度 = width + margin;
- 盒子总高度 = height + margin;

也就是，`width/height` 包含了 `padding `和 `border `值

## Box-sizing

CSS 中的 box-sizing 属性定义了引擎应该如何计算一个元素的总宽度和总高度

语法：

```css
box-sizing: content-box|border-box|inherit;
```

- content-box 默认值，元素的 width/height 不包含padding，border，与标准盒子模型表现一致
- border-box 元素的 width/height 包含 padding，border，与怪异盒子模型表现一致
- inherit 指定 box-sizing 属性的值，应该从父元素继承

回到上面的例子里，设置盒子为 border-box 模型

```html
<style>
.box {
    width: 200px;
    height: 100px;
    padding: 20px;
    box-sizing: border-box;
}
</style>
<div class=\"box\">
盒子模型
</div>
```

这时候，就可以发现盒子的所占据的宽度为200px

</details>

## 13. 未知高度和宽度元素的水平垂直居中的方案有哪些， 简单手写一下？ {#question-596703db-a53c-43bd-8d22-0cfb21fcd059}

> 题库原题：[未知高度和宽度元素的水平垂直居中的方案有哪些， 简单手写一下？](https://fe.ecool.fun/topic/596703db-a53c-43bd-8d22-0cfb21fcd059)

### 题目要点

- **Flexbox** 和 **Grid** 是现代 CSS 布局的强大工具，适用于大多数情况。
- **Absolute + Transform** 是一个经典的解决方案，适用于任何情况。
- **Line-Height** 是用于简单文本居中的方法。

<details>
<summary>参考答案</summary>

要在未知高度和宽度的元素中实现水平和垂直居中，可以使用多种 CSS 技巧。以下是几种常见的方案以及它们的简单手写实现：

### **1. Flexbox**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  /* 元素的样式 */
}
```

### **2. Grid**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  display: grid;
  place-items: center;     /* 同时水平和垂直居中 */
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  /* 元素的样式 */
}
```

### **3. Absolute + Transform**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  position: relative;
  height: 100vh;           /* 使容器填满视口 */
}

.centered-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 使元素居中 */
}
```

### **4. Line-Height (适用于单行文本)**

**HTML：**

```html
<div class="container">
  <div class="centered-element">Centered</div>
</div>
```

**CSS：**

```css
.container {
  height: 100vh;           /* 使容器填满视口 */
  line-height: 100vh;      /* 设置行高为容器高度 */
  text-align: center;      /* 水平居中 */
}

.centered-element {
  display: inline-block;
  vertical-align: middle; /* 垂直居中 */
  line-height: normal;    /* 恢复正常行高 */
}
```

</details>

## 14. 怎么触发BFC，BFC有什么应用场景？ {#question-e87bce7c-af1c-41f3-ae56-142be0e3c999}

> 题库原题：[怎么触发BFC，BFC有什么应用场景？](https://fe.ecool.fun/topic/e87bce7c-af1c-41f3-ae56-142be0e3c999)

### 题目要点

BFC（Block Formatting Context）是 CSS 中的一个概念，它定义了元素如何与其它元素相互作用，尤其是在布局和定位方面。触发 BFC 的常见方式包括：

1. **浮动元素**：`float` 属性不为 `none` 的元素。
2. **绝对定位元素**：`position` 属性为 `absolute` 或 `fixed`。
3. **`inline-block` 元素**：`display` 属性为 `inline-block`。
4. **`table-cell`, `table-caption` 元素**：`display` 属性为 `table-cell` 或 `table-caption`。
5. **`overflow` 不为 `visible` 的块级元素**：`overflow` 属性为 `hidden`、`auto` 或 `scroll`。

#### BFC 的应用场景

1. **防止外边距折叠**：
   - 当两个垂直方向的块级元素的外边距相遇时，会发生外边距折叠。通过创建 BFC 可以防止这种情况。

2. **自适应多栏布局**：
   - 利用 BFC 可以创建多栏布局，每栏内容自适应容器宽度。

3. **防止元素被浮动元素覆盖**：
   - 通过创建 BFC，可以确保块级元素不会被浮动元素覆盖。

4. **创建独立的布局容器**：
   - 将一个区域与页面上的其他部分隔离，实现独立的布局控制。

5. **实现清除浮动**：
   - 清除浮动元素的影响，确保后续元素的布局不受影响。

#### 考察重点

- 理解：BFC 的概念及其触发方式。
- 应用：能够根据实际需求利用 BFC 解决布局问题。

<details>
<summary>参考答案</summary>

## 文档流

在介绍BFC之前，需要先给大家介绍一下文档流。

我们常说的文档流其实分为`定位流`、`浮动流`、`普通流`三种。

## 绝对定位(Absolute positioning)

如果元素的属性 `position` 为 `absolute` 或 `fixed`，它就是一个绝对定位元素。

在绝对定位布局中，元素会整体脱离普通流，因此绝对定位元素不会对其兄弟元素造成影响，而元素具体的位置由绝对定位的坐标决定。

它的定位相对于它的包含块，相关CSS属性：`top`、`bottom`、`left`、`right`；

对于 `position: absolute`，元素定位将相对于上级元素中最近的一个`relative、fixed、absolute`，如果没有则相对于html；

对于 `position:fixed`，正常来说是相对于浏览器窗口定位的，但是当**元素祖先的 `transform` 属性非 `none` 时，会相对于该祖先进行定位**。

## 浮动 (float)

在浮动布局中，元素首先按照普通流的位置出现，然后根据浮动的方向尽可能的向左边或右边偏移，其效果与印刷排版中的文本环绕相似。

## 普通流 (normal flow)

普通流其实就是指BFC中的FC。FC(`Formatting Context`)，直译过来是格式化上下文，它是页面中的一块渲染区域，有一套渲染规则，决定了其子元素如何布局，以及和其他元素之间的关系和作用。

在普通流中，元素按照其在 HTML 中的先后位置至上而下布局，在这个过程中，行内元素水平排列，直到当行被占满然后换行。块级元素则会被渲染为完整的一个新行。

除非另外指定，否则所有元素默认都是普通流定位，也可以说，普通流中元素的位置由该元素在 HTML 文档中的位置决定。

## BFC 概念

先看下MDN上关于BFC的定义：

> 块格式化上下文（`Block Formatting Context`，`BFC`） 是Web页面的可视CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

具有 `BFC` 特性的元素可以看作是隔离了的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 `BFC` 具有普通容器所没有的一些特性。

通俗一点来讲，可以把 `BFC` 理解为一个封闭的大箱子，箱子内部的元素无论如何翻江倒海，都不会影响到外部。

除了 BFC，还有：

* `IFC`（行级格式化上下文）- `inline` 内联
* `GFC`（网格布局格式化上下文）- `display: grid`
* `FFC`（自适应格式化上下文）- `display: flex`或`display: inline-flex`

**注意**：同一个元素不能同时存在于两个 `BFC` 中。

## BFC的触发方式

MDN上对于[BFC的触发条件](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context)写的很多，总结一下常见的触发方式有（只需要满足一个条件即可触发 BFC 的特性）：

* 根元素，即 `<html>`
* 浮动元素：`float` 值为 `left` 、`right`
* `overflow` 值不为 `visible`，即为 `auto`、`scroll`、`hidden`
* `display` 值为 `inline-block`、`table-cell`、`table-caption`、`table`、`inline-table`、`flex`、`inline-flex`、`grid`、`inline-grid`
* 绝对定位元素：`position` 值为 `absolute`、`fixed`

## BFC的特性

* BFC 是页面上的一个独立容器，容器里面的子元素不会影响外面的元素。
* BFC 内部的块级盒会在垂直方向上一个接一个排列
* 同一 BFC 下的相邻块级元素可能发生外边距折叠，创建新的 BFC 可以避免外边距折叠
* 每个元素的外边距盒（`margin box`）的左边与包含块边框盒（`border box`）的左边相接触（从右向左的格式的话，则相反），即使存在浮动
* 浮动盒的区域不会和 BFC 重叠
* 计算 BFC 的高度时，浮动元素也会参与计算

## 应用

BFC是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面元素，反之亦然。我们可以利用BFC的这个特性来做很多事。

### 自适应两列布局

左列浮动（定宽或不定宽都可以），给右列开启 BFC。

```html
<div>
    <div class="left">浮动元素，无固定宽度</div>
    <div class="right">自适应</div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.left {
    float: left;
    height: 200px;
    margin-right: 10px;
    background-color: red;
}
.right {
    overflow: hidden;
    height: 200px;
    background-color: yellow;
}
```

效果：
![](https://static.ecool.fun//article/56dfc6e4-a6bd-4b57-a4ad-74611753ac45.jpeg)

* 将左列设为左浮动，将自身高度塌陷，使得其它块级元素可以和它占据同一行的位置。
* 右列为 div 块级元素，利用其自身的流特性占满整行。
* 右列设置overflow: hidden,触发 BFC 特性，使其自身与左列的浮动元素隔离开，不占满整行。

这即是上面说的 BFC 的特性之一：**浮动盒的区域不会和 BFC 重叠**

### 防止外边距（margin）重叠

兄弟元素之间的外边距重叠

```html
<div>
    <div class="child1"></div>
    <div class="child2"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.child1 {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    background-color: red;
}
.child2 {
    width: 100px;
    height: 100px;
    margin-top: 20px;
    background-color: green;
}
```

效果：
![](https://static.ecool.fun//article/c1cf8faf-19df-4ba6-92e4-60eb0dbd5b2b.jpeg)

两个块级元素，红色 div 距离底部 10px，绿色 div 距离顶部 20px，按道理应该两个块级元素相距 30px 才对，但实际却是取距离较大的一个，即 20px。

> 块级元素的上外边距和下外边距有时会合并（或折叠）为一个外边距，其大小取其中的较大者，这种行为称为外边距折叠（重叠），注意这个是发生在属于同一 BFC 下的块级元素之间

根据 BFC 特性，创建一个新的 BFC 就不会发生 margin 折叠了。比如我们在他们两个 div 外层再包裹一层容器，加属性 `overflow: hidden`，触发 BFC，那么两个 div 就不属于同个 BFC 了。

```html
<div>
    <div class="parent">
        <div class="child1"></div>
    </div>
    <div class="parent">
        <div class="child2"></div>
    </div>
</div>
```

```css
.parent {
    overflow: hidden;
}

/* ... */
```

![](https://static.ecool.fun//article/33e4f6b9-cb06-497a-b6f5-60e531cd65e7.jpeg)

这个关于兄弟元素外边距叠加的问题，除了触发 BFC 也有其他方案，比如你统一只用上边距或下边距，就不会有上面的问题。

### 父子元素的外边距重叠

这种情况存在父元素与其第一个或最后一个子元素之间（嵌套元素）。

如果在父元素与其第一个/最后一个子元素之间不存在边框、内边距、行内内容，也没有创建块格式化上下文、或者清除浮动将两者的外边距 分开，此时子元素的外边距会“溢出”到父元素的外面。

```html
<div id="parent">
  <div id="child"></div>
</div>
```
```css
* {
    margin: 0;
    padding: 0;
}
#parent {
    width: 200px;
    height: 200px;
    background-color: green;
    margin-top: 20px;
}
#child {
    width: 100px;
    height: 100px;
    background-color: red;
    margin-top: 30px;
}
```

![](https://static.ecool.fun//article/cf07826a-d756-49cf-a090-0e5deb9f729a.jpeg)

如上图，红色的 div 在绿色的 div 内部，且设置了 `margin-top` 为 30px，但我们发现红色 div 的顶部与绿色 div 顶部重合，并没有距离顶部 30px，而是溢出到父元素的外面计算。即本来父元素距离顶部只有 20px，被子元素溢出影响，外边距重叠，取较大的值，则距离顶部 30px。

解决办法：
* 给父元素触发 BFC（如添加overflow: hidden）
* 给父元素添加 border
* 给父元素添加 padding

这样就能实现我们期望的效果了：
![](https://static.ecool.fun//article/a0b5e69f-dc00-41dd-9aca-7feac4ea33b3.jpeg)

### 清除浮动解决令父元素高度坍塌的问题

当容器内子元素设置浮动时，脱离了文档流，容器中总父元素高度只有边框部分高度。

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.parent {
    border: 4px solid red;
}
.child {
    float: left;
    width: 200px;
    height: 200px;
    background-color: blue;
}
```

![](https://static.ecool.fun//article/76238cb3-62a5-466e-b9b5-6706ca911c9f.jpeg)

解决办法：给父元素触发 BFC，使其有 BFC 特性：**计算 BFC 的高度时，浮动元素也会参与计算**

```css
.parent {
    overflow: hidden;
    border: 4px solid red;
}
```

![](https://static.ecool.fun//article/e98368e4-45a8-4edb-bfbf-e6ef722fef2c.jpeg)

上面我们都是用的 `overflow: hidden` 触发 BFC，因为确实常用，但是触发 BFC 也不止是只有这一种方法。

如上面写的所示，可以设置`float: left;`，`float: right;`，`display: inline-block;`，`overflow: auto;`，`display: flex;`，`display: table;`，`position` 为 `absolute` 或 `fixed` 等等，这些都可以触发，不过父元素宽度表现不一定相同，但父元素高度都被撑出来了。

当然实际运用可不是随便挑一个走，还是根据场景选择。

</details>

## 15. 前端实现动画有哪些方式？ {#question-8b516cb7-fa94-4d68-929f-d3c628d1b7a2}

> 题库原题：[前端实现动画有哪些方式？](https://fe.ecool.fun/topic/8b516cb7-fa94-4d68-929f-d3c628d1b7a2)

### 题目要点

前端开发中，实现动画的方法多种多样，每种方法都有其适用场景和优缺点。以下是一些常见的实现方式：

1. **CSS 动画**：
   - 使用 `@keyframes` 和 `animation` 属性定义动画。
   - 优点：易于实现，性能好，易于维护。
   - 缺点：功能相对简单，难以实现复杂的交互动画。

2. **CSS 过渡（Transitions）**：
   - 使用 `transition` 属性在状态变化时实现平滑过渡。
   - 优点：简单易用，性能优秀。
   - 缺点：只能用于状态变化的过渡，不适合复杂动画。

3. **JavaScript 动画**：
   - 使用 JavaScript 直接操作 DOM 元素的样式属性实现动画。
   - 优点：灵活性高，可以控制动画的每一个细节。
   - 缺点：可能影响性能，需要更多的代码实现。

4. **Web Animations API**：
   - 使用 `Element.animate()` 方法实现动画。
   - 优点：提供更丰富的动画控制和更一致的跨浏览器支持。
   - 缺点：兼容性不如 CSS 动画。

5. **SVG 动画**：
   - 使用 SVG 元素和 SMIL（Synchronized Multimedia Integration Language）或 CSS 动画实现动画。
   - 优点：适合矢量图形动画，易于集成。
   - 缺点：浏览器支持和性能可能不如 CSS 动画。

6. **Canvas**：
   - 使用 HTML `<canvas>` 元素和 JavaScript 绘制动画。
   - 优点：适合复杂的图形和游戏动画。
   - 缺点：实现复杂，需要手动管理每一帧的绘制。

7. **CSS 3D 变换**：
   - 使用 `transform` 属性的 3D 变换实现动画效果。
   - 优点：可以触发硬件加速，提升性能。
   - 缺点：兼容性和浏览器支持有限。

8. **请求动画帧（requestAnimationFrame）**：
   - 使用 `requestAnimationFrame` 方法实现平滑的动画。
   - 优点：性能好，适合复杂的动画和游戏。
   - 缺点：实现相对复杂，需要手动控制每一帧。

9. **CSS Grid 和 Flexbox**：
   - 利用 CSS Grid 和 Flexbox 的布局特性实现动画效果。
   - 优点：易于实现，兼容性好。
   - 缺点：主要用于布局动画，不适合复杂的动画效果。

#### 考察重点

- 理解：不同动画实现方式的特点和适用场景。
- 选择：根据项目需求和目标选择合适的动画实现方式。

<details>
<summary>参考答案</summary>

前端常用的动画实现方式有以下种：

1. css3的`transition` 属性
2. css3的`animation` 属性
3. 原生JS动画
4. 使用`canvas`绘制动画
5. SVG动画
6. Jquery的`animate`函数
7. 使用gif图片

## 1. css3的`transition`

`transition`属性：

用来设置样式的属性值是如何从一种状态平滑过渡到另外一种状态

**语法：**

```css
transition: property duration timing-function delay;
```

`transition`是一种简写属性,它可以拆分为四个过渡属性。你可以 `transition: 值1，值2，值3，值4` 这样写，也可以：`transition-property: 值1;`，`transition-duration:值2;`，`transition-timing-function:值2;`，`transition-delay:值4;`这样写。

| 值 | 描述 |
| --|--|
|transition-property|规定设置过渡效果的 CSS 属性的名称。|
|transition-duration|规定完成过渡效果需要多少秒或毫秒。|
|transition-timing-function|规定速度效果的速度曲线。|
|transition-delay|定义过渡效果何时开始。|

**演示代码：**

```html
<div></div>

```

```css
div{
  width:50px;
  height: 50px;
  background-color: pink;
}

div:hover{
  width:200px;
}
```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d5cabe35b~tplv-t2oaga2asx-image.image)

由上图可看出：鼠标移入移出时,`width`状态的变化是瞬间完成的。

添加`transition: 1s;`后

```css
div{
  width:50px;
  height: 50px;
  background-color: pink;
  transition: 1s;
}
div:hover{
  width:200px;
}
```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d5de25bf8~tplv-t2oaga2asx-image.image)

`transition: 1s;` 设置了`width`属性状态变化的过渡时间为1秒。

`transition`属性默认为：`transition: all 0 ease 0;`

`transition:1s;` 等价于 `transition: all 1s ease 0;`

## 2. css3的`animation`

`animation`属性：比较类似于 flash 中的逐帧动画。学习过 `flash`的同学知道，这种逐帧动画是由关键帧组成，很多个关键帧连续的播放就组成了动画在 `CSS3` 中是由属性`keyframes`来完成逐帧动画的。

`animation`属性与`transition`属性的区别：

* `transition`只需指定动画的开始和结束状态，整个动画的过程是由特定的函数控制,你不用管它。
* `animation`可以对动画过程中的各个关键帧进行设置

**演示代码：**

```html
<div></div>

```

```css
div{
    width:50px;
    height:50px;
    background-color: pink;
}
div:hover{
    animation: change1 5s;
}
@keyframes change1{
    25%  {width:130px;background-color: red;}
    50%  {width:170px;background-color: blue;}
    75%  {width:210px;background-color: green;}
    100% {width:250px;background-color: yellow;}
}

```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d834ba42c~tplv-t2oaga2asx-image.image)

## 3. 原生`JS`动画

其主要思想是通过setInterval或setTimeout方法的回调函数来持续调用改变某个元素的CSS样式以达到元素样式变化的效果。

javascript 实现动画通常会导致页面频繁性重排重绘，消耗性能，一般应该在桌面端浏览器。在移动端上使用会有明显的卡顿。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style type="text/css">
        #rect {
            width: 200px;
            height: 200px;
            background: #ccc;
        }
    </style>
</head>
<body>
    <div id="rect"></div>
    <script>
        let elem = document.getElementById('rect');
        let left = 0;
        let timer = setInterval(function(){
            if(left<window.innerWidth-200){
                elem.style.marginLeft = left+'px';
                left ++;
            }else {
                clearInterval(timer);
            }
        },16);
    </script>
</body>
</html>

```

上面的例子中，我们设置的setInterval时间间隔是16ms。一般认为人眼能辨识的流畅动画为每秒60帧，这里16ms比(1000ms/60)帧略小一些，但是一般可仍为该动画是流畅的。

在很多移动端动画性能优化时，一般使用16ms来进行节流处理连续触发的浏览器事件。例如对touchmove、scroll事件进行节流等。通过这种方式减少持续事件的触发频率，可以大大提升动画的流畅性。

## 4. 使用`canvas`绘制动画

canvas作为H5新增元素，是借助Web API来实现动画的。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <style>
    *{
        margin:0;
        padding:0;
    }
    </style>
</head>
<body>
    <canvas id="canvas" width="700" height="550"></canvas>
    <script type="text/javascript">
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        let left = 0;
        let timer = setInterval(function(){
            ctx.clearRect(0,0,700,550);
            ctx.beginPath();
            ctx.fillStyle = "#ccc";
            ctx.fillRect(left,0,100,100);
            ctx.stroke();
            if(left>700){
                clearInterval(timer);
            }
            left += 1;
        },16);
    </script>
</body>
</html>
```

注释：通过getContext()获取元素的绘制对象，通过clearRect不断清空画布并在新的位置上使用fillStyle绘制新矩形内容实现页面动画效果。

Canvas主要优势是可以应对页面中多个动画元素渲染较慢的情况，完全通过javascript来渲染控制动画的执行。可用于实现较复杂动画。

## 5. SVG 动画

SVG是一种基于XML的图像格式，非常类似于HTML的工作方式。它为许多熟悉的几何形状定义了不同的元素，这些元素可以在标记中组合以产生二维图形。

同样高清的质地，矢量图不畏惧放大，体积小。

这里要说明一点就是，因为 SVG 中保存的是点、线、面的信息，与分辨率和图形大小无关，只是跟图像的复杂程度有关，所以图像文件所占的存储空间通常会比 png 小。

SVG动画的优势：

* 优化 SEO 和无障碍的利器，因为 SVG 图像是使用XML(可扩展标记语言【英语：Extensible Markup Language，简称：XML】标记指计算机所能理解的信息符号，通过此种标记，计算机之间可以处理包含各种信息的文章等)来标记构建的，浏览器通过绘制每个点和线来打印它们，而不是用预定义的像素填充某些空间。这确保 SVG 图像可以适应不同的屏幕大小和分辨率。
* 由于是在 XML 中定义的，SVG 图像比 JPG 或 PNG 图像更灵活，而且我们可以使用 CSS 和 JavaScript 与它们进行交互。SVG 图像设置可以包含 CSS 和 JavaScript。在 react、vue 这种数据驱动视图的框架下，对于 SVG 操作就更加如鱼得水了。（下文会跟大家分享一些小的 SVG 动画在我们项目中的实践）
* 在运用层面上，SVG 提供了一些图像编辑效果，比如屏蔽和剪裁、应用过滤器等等。并且 SVG 只是文本，因此可以使用 GZip 对其进行有效压缩。

## 6. Jquery的`animate()`方法

* `animate()` 方法执行 `CSS` 属性集的自定义动画。
* 该方法通过 CSS 样式将元素从一个状态改变为另一个状态。
* CSS属性值是逐渐改变的，这样就可以创建动画效果。
* 只有数字值可创建动画（比如 "`margin:30px`"）。字符串值无法创建动画（比如 "`background-color:red`"）。

**代码演示：**

```html
<button id="btn1">使用动画放大高度</button>
<button id="btn2">重置高度</button>
<div id="box" style="background:#98bf21;height:100px;width:100px;margin:6px;">
</div>

```

```css
$(document).ready(function(){
    $("#btn1").click(function(){
        $("#box").animate({height:"300px"});
    });
    $("#btn2").click(function(){
        $("#box").animate({height:"100px"});
    });
});

```

**效果图：**

![在这里插入图片描述](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/7/17/1735b47d89e475ad~tplv-t2oaga2asx-image.image)

##  7. 使用`gif`图片

gif图想必大家都接触过，前端使用也非常简单。

## 总结：

* **代码复杂度方面**简单动画：`css`代码实现会简单一些，`js`复杂一些。 复杂动画的话：`css`代码就会变得冗长，`js`实现起来更优。
* **动画运行时，对动画的控制程度上** `js` 比较灵活，能控制动画暂停，取消，终止等`css`动画不能添加事件，只能设置固定节点进行什么样的过渡动画。
* **兼容方面** `css` 有浏览器兼容问题`js`大多情况下是没有的。
* **性能方面** `css`动画相对于优一些，`css` 动画通过`GUI`解析`js`动画需要经过`js`引擎代码解析，然后再进行 `GUI` 解析渲染。

</details>

## 16. Sass、Less 是什么？为什么要使用他们？ {#question-e894262c-f9eb-495b-bb45-5016337f3af1}

> 题库原题：[Sass、Less 是什么？为什么要使用他们？](https://fe.ecool.fun/topic/e894262c-f9eb-495b-bb45-5016337f3af1)

### 题目要点

**Sass** 和 **Less** 是两种流行的 CSS 预处理器，它们扩展了 CSS 的功能，使得编写 CSS 更加高效和灵活。

#### 为什么要使用它们？

1. **提高开发效率**：
   - 通过变量和混合，减少重复代码，提高代码复用性。

2. **增强代码可维护性**：
   - 模块化和组件化使得代码结构更清晰，易于维护。

3. **增加样式控制**：
   - 函数和计算属性允许在 CSS 中进行更复杂的计算和逻辑处理。

4. **支持编程特性**：
   - 变量、条件语句、循环等编程特性使得 CSS 更加灵活和强大。

5. **自动化构建**：
   - 可以与构建工具（如 Webpack、Gulp）集成，自动化编译和优化过程。

6. **浏览器兼容性**：
   - 预处理器代码最终会被编译成标准的 CSS，确保在所有浏览器中的兼容性。

#### 考察重点

- 理解：Sass 和 Less 的基本概念和特性。
- 应用：能够根据项目需求选择合适的 CSS 预处理器。

<details>
<summary>参考答案</summary>

他们都是 CSS 预处理器，是 CSS 上的一种抽象层。他们是一种特殊的语法/语言编译成 CSS。 例如 Less 是一种动态样式语言，将 CSS 赋予了动态语言的特性，如变量，继承，运算， 函数，LESS 既可以在客户端上运行 (支持 IE 6+, Webkit, Firefox)，也可以在服务端运行 (借助 Node.js)。

**为什么要使用它们？**

- 结构清晰，便于扩展。 可以方便地屏蔽浏览器私有语法差异。封装对浏览器语法差异的重复处理， 减少无意义的机械劳动。
- 可以轻松实现多重继承。 完全兼容 CSS 代码，可以方便地应用到老项目中。LESS 只是在 CSS 语法上做了扩展，所以老的 CSS 代码也可以与 LESS 代码一同编译。

</details>

## 17. 在前端开发中，你了解哪些与安全性相关的内容？（提示：除了 HTTP 和 HTTPS） {#question-9476535c-2cd4-49e5-b3ee-f16a01a371ab}

> 题库原题：[在前端开发中，你了解哪些与安全性相关的内容？（提示：除了 HTTP 和 HTTPS）](https://fe.ecool.fun/topic/9476535c-2cd4-49e5-b3ee-f16a01a371ab)

### 题目要点

* **注入防御**：通过 CSP 和转义机制防止 XSS 脚本执行。
* **请求校验**：利用 SameSite 属性和 CSRF Token 防范身份伪造。
* **资源保护**：通过响应头控制页面嵌套（点击劫持）和资源加载策略。
* **工程安全**：关注 npm 依赖审计和 CDN 资源的完整性校验（SRI）。
* **存储安全**：审慎选择浏览器本地存储方案，隔离敏感数据。

<details>
<summary>参考答案</summary>

前端是防御的第一线，直接面对用户的输入和浏览器的各种执行环境。除了传输层的加密（HTTP/HTTPS），前端安全性主要集中在**注入攻击、跨站伪造、浏览器策略以及依赖项安全**四个维度。

### 1. XSS（跨站脚本攻击）

这是前端最常见的安全威胁。攻击者通过在页面中注入恶意脚本，窃取用户的 Cookie、Session 或劫持用户行为。

* **防御机制**：
* **输入过滤与输出转义**：对用户提交的所有内容进行校验，在渲染到 HTML 之前进行转义（如将 `<` 转为 `&lt;`）。现代框架（如 Vue 和 React）默认会对数据绑定进行转义，但需警惕 `v-html` 或 `dangerouslySetInnerHTML`。
* **内容安全策略（CSP）**：通过 HTTP 响应头配置 `Content-Security-Policy`，限制浏览器只能加载特定域名的资源，禁止执行内联脚本（inline script），从根本上遏制 XSS 的执行环境。

### 2. CSRF（跨站请求伪造）

攻击者诱导用户访问第三方恶意网站，利用浏览器自动携带 Cookie 的特性，冒充用户向目标服务器发送恶意请求（如转账、修改密码）。

* **防御机制**：
* **SameSite Cookie 属性**：将 Cookie 设置为 `SameSite=Lax` 或 `Strict`，限制第三方网站请求携带 Cookie。
* **CSRF Token**：服务器生成一个随机 Token，前端在发送非 GET 请求时将其放入请求头或表单中，服务器校验该 Token 的有效性。由于第三方网站无法跨域获取该 Token，攻击无法奏效。

### 3. 点击劫持（Clickjacking）

攻击者通过 `&lt;iframe&gt;` 将目标网站嵌入到一个透明层下，诱导用户点击看似无害的按钮，实则操作了底层被嵌入的网站。

* **防御机制**：
* **X-Frame-Options**：设置响应头为 `DENY` 或 `SAMEORIGIN`，告诉浏览器该页面不允许被嵌入到任何（或非同源）的 iframe 中。

### 4. 浏览器端数据安全与隐私

* **敏感信息泄露**：避免在 LocalStorage 或 SessionStorage 中存储未加密的敏感信息（如 Token、个人隐私），因为这些数据极易被 XSS 脚本读取。建议使用 `HttpOnly` 标识的 Cookie 来存储鉴权信息。
* **Window.opener 安全性**：在使用 `target="_blank"` 打开新窗口时，新页面可以通过 `window.opener` 操作原页面。应添加 `rel="noopener noreferrer"` 来阻断这种关联。

### 5. 供应链安全（Supply Chain Security）

现代前端高度依赖 npm 生态。一旦某个底层依赖包被植入木马，整个项目都会沦陷。

* **防御机制**：
* **定期审计**：使用 `npm audit` 检查已知漏洞。
* **锁定版本**：通过 `package-lock.json` 或 `yarn.lock` 确保团队及构建环境安装的包版本一致，防止意外升级到带有后门的版本。
* **子资源完整性（SRI）**：在引用 CDN 资源时，加入 `integrity` 属性（如文件的哈希值），浏览器会校验下载的内容是否被篡改。

</details>

## 18. HTTP和HTTPS的区别 {#question-4ce73150-a0ff-495a-a669-191b7bd7c830}

> 题库原题：[HTTP和HTTPS的区别](https://fe.ecool.fun/topic/4ce73150-a0ff-495a-a669-191b7bd7c830)

### 题目要点

<p><code>HTTPS</code>是在<code>HTTP</code>的基础上加入了<code>SSL</code>协议，<code>SSL</code>依靠证书来验证服务器的身份，并为浏览器和服务器之间的通信加密（在传输层）<br/> <code>HTTP</code> + 加密 + 认证 + 完整性保护 = <code>HTTPS</code><br/> </p><ol><li> <code>HTTPS</code>协议需要到CA申请证书或自制证书<br/> <…

<details>
<summary>参考答案</summary>

<p><code>HTTPS</code>是在<code>HTTP</code>的基础上加入了<code>SSL</code>协议，<code>SSL</code>依靠证书来验证服务器的身份，并为浏览器和服务器之间的通信加密（在传输层）<br/> <code>HTTP</code> + 加密 + 认证 + 完整性保护 = <code>HTTPS</code><br/> </p><ol><li> <code>HTTPS</code>协议需要到CA申请证书或自制证书<br/> </li><li> <code>HTTP</code>的信息是明文传输；<br/> <code>HTTPS</code>则是具有安全性的ssl加密<br/> </li><li> <code>HTTP</code>是直接与TCP进行数据传输；<br/> 而<code>HTTPS</code>运行在<code>SSL/TLS</code>(安全传输层协议)之上，<code>SSL/TLS</code>运行在<code>TCP</code>之上，用的端口也不一样，前者是80（需要国内备案），后者是443<br/> </li><li> <code>HTTP</code>的连接很简单，是无状态的；<br/> <code>HTTPS</code>协议是由<code>SSL+HTTP</code>协议构建的，可进行加密传输、身份认证的网络协议，比<code>HTTP</code>协议安全<br/> </li></ol><p> </p>

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-30/_index.md" >}}) · 已是最后一轮 →
