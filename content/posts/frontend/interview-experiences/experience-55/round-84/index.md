+++
title = "京东-物流-秋招 · 第 1 轮 · 第一轮"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "京东", "第一轮", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/55"
experienceId = 55
roundId = 84
roundOrder = 1
company = "京东"
date = "2025-07-27T15:38:59.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-55/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-55/round-85/index.md" >}}) →

**本轮概述：** 比较简单，主要考察一些前端基础知识。

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 请你简单介绍一下自己，你研究生期间学了哪些课程？ {#question-subjective-f23da9a1e66b}

### 题目要点

计算机专业研究生，系统学习了相关理论课程，对前端技术有浓厚兴趣并有实践经验。

<details>
<summary>参考答案</summary>

本科学习计算机科学与技术专业，研究生阶段继续深入学习相关领域知识。研究生期间的核心课程包括高级数据结构与算法分析、分布式系统、软件架构设计、人工智能原理、计算机图形学、高级数据库系统等。同时选修了前端开发相关的课程，如Web技术与应用、用户界面设计等。在学习过程中，对前端技术产生了浓厚兴趣，通过自学掌握了React、Vue等主流框架，并在多个课程项目中实践应用。研究方向偏向Web技术和用户体验，毕业论文也是围绕前端性能优化展开的研究。

</details>

## 2. 在之前参与的项目里，你主要担任什么职责，都负责了哪些模块的开发呀？ {#question-subjective-63d61ea69e66}

### 题目要点

主要通过课程项目、实验室项目和实习积累经验，担任前端开发角色，涉及多种常见功能模块。

<details>
<summary>参考答案</summary>

主要参与过学校的课程项目、实验室项目以及一段实习经历。在课程项目中，通常担任前端开发的主要负责人，负责整体页面架构设计和核心功能实现。具体开发过在线学习平台的用户界面、数据可视化展示模块、以及实时聊天功能。在实验室项目中，参与开发了一个科研数据管理系统，主要负责数据录入界面、图表展示组件和用户权限管理前端部分。实习期间，在导师指导下参与了公司内部管理系统的开发，负责表单处理、文件上传和基础的增删改查功能。虽然项目规模不算很大，但通过这些实践对前端开发的完整流程有了较好的理解。

</details>

## 3. HTML5 相较于之前的版本有哪些新特性？ {#question-subjective-a7d3a7ebf4fb}

### 题目要点

语义化标签、原生多媒体支持、Canvas绘图、增强表单、Web存储、丰富的API等新特性。

<details>
<summary>参考答案</summary>

HTML5相比之前版本引入了很多重要特性。语义化标签是最显著的改进，新增了header、nav、main、article、section、aside、footer等标签，让页面结构更清晰，也有利于SEO优化。多媒体支持方面，audio和video标签可以直接嵌入音视频内容，不再依赖Flash等插件。Canvas元素提供了强大的2D绘图能力，可以用JavaScript动态绘制图形和动画。表单功能得到增强，新增了email、url、date、range等输入类型，以及内置的表单验证功能。Web存储API包括localStorage和sessionStorage，提供了比cookie更好的本地存储方案。还有地理位置API、拖拽API、Web Workers等，为Web应用提供了更丰富的功能支持。

</details>

## 4. 浏览器缓存这块，你是怎么理解的？ {#question-subjective-401fcfdeaad6}

### 题目要点

性能优化机制，通过HTTP头部控制，能减少网络请求但需要合理配置避免更新问题。

<details>
<summary>参考答案</summary>

浏览器缓存是Web性能优化的重要机制，通过在本地存储已请求的资源来减少网络请求，提升页面加载速度。在学习过程中了解到，缓存主要通过HTTP协议的相关头部来控制。当浏览器首次请求资源时，服务器会返回资源内容以及缓存相关的响应头，浏览器根据这些头部信息决定是否缓存资源以及缓存多长时间。再次请求相同资源时，浏览器会先检查本地缓存，如果缓存有效就直接使用，否则向服务器发起请求。这个机制在减少服务器负载、节省带宽、提升用户体验方面都有重要作用。在实际项目中也遇到过缓存导致的问题，比如更新代码后用户看不到最新内容。

</details>

## 5. 浏览器缓存主要有哪些类型？ {#question-subjective-b745ed31e9e0}

### 题目要点

HTTP缓存（强缓存、协商缓存）、内存缓存、磁盘缓存、Service Worker缓存等多层次缓存机制。

<details>
<summary>参考答案</summary>

浏览器缓存可以分为几个层次。HTTP缓存是最主要的类型，包括强缓存和协商缓存两种机制。强缓存通过Cache-Control和Expires头部设置过期时间，在有效期内直接使用本地缓存。协商缓存则通过ETag和Last-Modified与服务器确认资源是否有更新。除了HTTP缓存，还有内存缓存和磁盘缓存的区别，内存缓存速度快但容量小，磁盘缓存容量大但速度相对较慢。Service Worker缓存是比较新的技术，可以通过编程方式控制缓存策略，支持离线应用。另外还有DNS缓存、CDN缓存等，虽然不在浏览器内部，但也是整个缓存体系的组成部分。

</details>

## 6. 你有没有遇到过因为浏览器缓存带来的问题？比如，用户没有获取到最新的资源这种情况，你是怎么解决的？ {#question-subjective-ebecd58cb4a6}

### 题目要点

通过版本号、时间戳、文件hash等方式解决缓存更新问题，构建工具可以自动化处理。

<details>
<summary>参考答案</summary>

在做课程项目和实习期间确实遇到过这类问题。最典型的情况是修改了CSS或JavaScript文件后，浏览器仍然加载旧版本的文件，导致页面显示异常或功能不正常。刚开始遇到这种问题时比较困惑，后来学习了解到是缓存机制导致的。解决方法主要有几种：最简单的是在开发阶段使用浏览器的强制刷新功能，或者在开发者工具中禁用缓存。对于生产环境，学会了在文件名后添加版本号或时间戳参数来强制更新，比如style.css?v=1.0.1。后来了解到webpack等构建工具可以自动为文件生成hash值，这样文件内容改变时文件名也会改变，从而绕过缓存。这个问题让我深刻理解了缓存机制的重要性和复杂性。

</details>

## 7. 说说 sessionStorage 和 localStorage 的区别 {#question-subjective-853dc4839edf}

### 题目要点

主要区别在生命周期和作用域，sessionStorage会话级，localStorage持久化且可跨页面共享。

<details>
<summary>参考答案</summary>

这两个都是HTML5提供的Web存储API，在项目中都有使用过。

最主要的区别是生命周期不同：sessionStorage只在当前浏览器标签页的会话期间有效，关闭标签页后数据就会被清除；而localStorage的数据会持久保存在用户设备上，除非主动删除或者达到存储限制。

作用域方面也不同，sessionStorage的数据只能在当前标签页内访问，不同标签页之间是隔离的；localStorage则可以在同一域名下的所有页面间共享数据。

在实际使用中，sessionStorage适合存储临时的会话相关数据，比如表单的临时保存；localStorage更适合存储用户偏好设置、购物车内容等需要跨会话保持的信息。

</details>

## 8. 除了它们的存储大小区别外，还有哪些不同？ {#question-subjective-b0d84ff50371}

### 题目要点

事件机制、安全特性、使用场景和数据共享能力等方面存在差异。

<details>
<summary>参考答案</summary>

除了生命周期差异，还有一些其他区别。数据共享机制上，localStorage支持storage事件，当其他页面修改localStorage数据时，当前页面可以监听到这个变化，这在多标签页应用中很有用；而sessionStorage不支持这种跨页面的事件通知。安全性方面，sessionStorage由于其会话特性，数据泄露的风险相对较小。在浏览器兼容性上，两者的支持程度基本一致，都是HTML5的特性。使用场景也有明显区别：sessionStorage常用于单页面应用的状态管理、表单数据的临时保存等；localStorage则用于用户设置、主题偏好、离线数据缓存等需要持久化的场景。在移动端开发中，还需要考虑存储空间限制和清理策略。

</details>

## 9. 对 Promise 了解多少？ {#question-subjective-80403ba36697}

### 题目要点

异步处理机制，三种状态，支持链式调用，有丰富的静态方法，与async/await配合使用。

<details>
<summary>参考答案</summary>

Promise是JavaScript处理异步操作的重要机制，在学习现代前端开发时深入学习过。Promise解决了传统回调函数嵌套造成的"回调地狱"问题，让异步代码更易读和维护。Promise对象有三种状态：pending（等待中）、fulfilled（已完成）、rejected（已拒绝），状态一旦改变就不可逆。通过then方法可以链式处理异步结果，catch方法处理错误，finally方法无论成功失败都会执行。Promise还提供了一些静态方法，如Promise.all可以并行处理多个异步操作，Promise.race返回最先完成的结果。在实际项目中经常使用Promise处理API请求、文件读取等异步操作。配合async/await语法，可以让异步代码看起来像同步代码一样简洁。

</details>

## 10. 实现一个 Promise.all {#question-subjective-e65ac8160274}

### 题目要点

核心是并行执行、全部成功才成功、保持结果顺序、任一失败即整体失败的逻辑。

<details>
<summary>参考答案</summary>

```js
function myPromiseAll<T>(promises: (Promise<T> | T)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    // 处理空数组的情况
    if (promises.length === 0) {
      resolve([])
      return
    }

    const results: T[] = new Array(promises.length)
    let completedCount = 0

    promises.forEach((promise, index) => {
      // 将非Promise值也包装成Promise
      Promise.resolve(promise)
        .then((value) => {
          results[index] = value
          completedCount++

          // 当所有Promise都完成时，resolve结果数组
          if (completedCount === promises.length) {
            resolve(results)
          }
        })
        .catch((error) => {
          // 任何一个Promise失败，整个Promise.all就失败
          reject(error)
        })
    })
  })
}

// 测试用例
function testPromiseAll() {
  const promise1 = Promise.resolve(1)
  const promise2 = new Promise<number>((resolve) => {
    setTimeout(() => resolve(2), 1000)
  })
  const promise3 = Promise.resolve(3)

  console.log("开始测试 Promise.all...")

  myPromiseAll([promise1, promise2, promise3])
    .then((results) => {
      console.log("所有Promise都成功:", results) // 应该输出 [1, 2, 3]
    })
    .catch((error) => {
      console.error("有Promise失败:", error)
    })

  // 测试失败情况
  const failingPromise = Promise.reject("出错了")
  myPromiseAll([promise1, failingPromise, promise3])
    .then((results) => {
      console.log("不应该执行到这里")
    })
    .catch((error) => {
      console.log("捕获到错误:", error) // 应该输出 "出错了"
    })
}

// 执行测试
testPromiseAll()

export { myPromiseAll }

```
实现Promise.all的关键是要理解它的行为特点：所有Promise都成功时才成功，任何一个失败就立即失败，并且要保持结果的顺序。使用计数器来跟踪完成状态，用数组按索引存储结果确保顺序正确。

</details>

## 11. 在 Promise 链中，若 Promise.all 的某个子 Promise 抛出错误，是否会中断后续链式操作？ {#question-subjective-5f0fcbd9d26b}

### 题目要点

Promise.all失败会触发catch，但不一定中断链式调用，取决于错误处理方式和返回值。

<details>
<summary>参考答案</summary>

Promise.all中任何一个子Promise失败时，Promise.all会立即变为rejected状态，这会触发链式调用中的catch处理器。但是否中断后续链式操作取决于catch处理器的处理方式。如果catch处理器正常处理了错误（比如返回一个值或者resolved的Promise），那么链式调用会继续执行后面的then操作；如果catch处理器重新抛出错误或者返回rejected的Promise，那么错误会继续向下传播。这种机制允许在链式调用中进行错误恢复，比如在catch中提供默认值或者重试逻辑。在实际项目中，这种特性很有用，可以让程序在部分操作失败时仍然能够继续执行。

</details>

## 12. 讲一下盒模型，外边距坍塌这种情况你会怎么解决 {#question-subjective-ff6598f99bd6}

### 题目要点

盒模型包含四个区域，外边距坍塌可通过BFC、边框、新布局方式等方法解决。

<details>
<summary>参考答案</summary>

CSS盒模型定义了元素的空间结构，包括内容区域、内边距、边框和外边距四个部分。有两种盒模型：标准盒模型中width和height只包含内容区域；IE盒模型（border-box）中width和height包含内容、内边距和边框。外边距坍塌是指相邻元素的垂直外边距会合并成较大的那个值，而不是相加。在学习过程中了解到几种解决方法：可以给父元素添加border或padding来阻止坍塌；使用overflow: hidden创建BFC（块级格式化上下文）；使用flexbox或grid布局，这些新的布局方式不会产生外边距坍塌；或者将元素设置为inline-block。在实际项目中，有时候会利用外边距坍塌的特性来实现更自然的间距效果。

</details>

## 13. 常见的跨域方式都有哪些？ {#question-subjective-c6351b089427}

### 题目要点

CORS、JSONP、代理服务器、postMessage、document.domain等，CORS和代理是主流方案。

<details>
<summary>参考答案</summary>

CORS是现在最主流的方式，通过服务器设置Access-Control-Allow-Origin等响应头来允许跨域请求。

JSONP是比较传统的方法，利用script标签不受同源策略限制的特点，但只支持GET请求。

代理服务器是开发中常用的方案，通过同域的服务器转发请求来避免跨域问题，webpack-dev-server就提供了这种代理功能。
postMessage API可以实现不同窗口间的安全通信，在iframe嵌入场景中很有用。

document.domain方法适用于主域相同但子域不同的情况。

在实习期间主要使用CORS和开发代理两种方式，CORS需要后端配合，开发代理在前端就能解决。

</details>

## 14. CORS（跨源资源共享） 是怎么实现跨域请求的呢？ {#question-subjective-197fa7495b2a}

### 题目要点

通过HTTP头部控制，分简单请求和预检请求，服务器配置相应头部实现跨域授权。

<details>
<summary>参考答案</summary>

CORS通过HTTP头部机制来实现跨域资源共享。浏览器会将跨域请求分为简单请求和复杂请求两类。简单请求（如GET、POST且满足特定条件）会直接发送，服务器通过Access-Control-Allow-Origin头部指定允许访问的域名，浏览器检查这个头部来决定是否允许访问响应数据。复杂请求（如PUT、DELETE或包含自定义头部）会先发送OPTIONS预检请求，服务器返回Access-Control-Allow-Methods、Access-Control-Allow-Headers等头部，告诉浏览器允许的HTTP方法和头部。只有预检通过后，浏览器才会发送实际请求。如果需要携带cookie等凭证信息，还需要设置Access-Control-Allow-Credentials。

</details>

## 15. 小程序开发和 H5 开发，有哪些区别？ {#question-subjective-bf3c2aabc8c4}

### 题目要点

运行环境、架构模式、开发语法、API能力、性能表现、发布方式等方面存在显著差异。

<details>
<summary>参考答案</summary>

运行环境不同是最根本的区别，小程序运行在特定的宿主环境中（如微信、支付宝），有自己的运行时和API；H5运行在标准浏览器环境中。

架构上，小程序采用双线程模型，逻辑层和渲染层分离，通过JSBridge通信；H5是单线程执行。开发语言方面，小程序使用类似Vue的模板语法和组件化开发，但有自己的语法规范；H5可以使用任何前端框架。

API能力上，小程序提供了丰富的原生功能接口，如支付、定位、摄像头等，这些在H5中需要通过浏览器API或第三方SDK实现。

性能表现上，小程序由于预加载和原生组件的优势，通常有更好的启动速度。发布方式也不同，小程序需要通过平台审核，H5可以直接部署。

</details>

## 16. 遇到过哪些兼容性问题，怎么解决的？ {#question-subjective-aa29193294e5}

### 题目要点

通过转译工具、polyfill、autoprefixer、fallback方案等技术手段解决兼容性问题。

<details>
<summary>参考答案</summary>

CSS方面，flexbox在一些老版本浏览器中支持不完整，通过使用autoprefixer自动添加厂商前缀解决，或者为老浏览器提供float布局的fallback方案。

JavaScript方面，ES6的一些新特性如箭头函数、Promise等在老版本浏览器中不支持，通过Babel转译和polyfill解决。

移动端适配中遇到过iOS Safari的100vh问题，通过CSS自定义属性和JavaScript动态计算视口高度解决。

还有不同浏览器对事件处理的差异，通过使用标准化的事件处理方法和事件委托来解决。

虽然现在大部分用户使用的都是现代浏览器，但在项目中还是会考虑基本的兼容性处理，使用工具链来自动化处理这些问题。

</details>

## 17. v-if 和 v-show 有什么区别？ {#question-subjective-d39447eba114}

### 题目要点

v-if控制DOM创建销毁，v-show控制CSS显示隐藏，在性能开销和使用场景上有区别。

<details>
<summary>参考答案</summary>

v-if是条件渲染，当条件为false时，对应的DOM元素根本不会被创建，条件变为true时才会创建并插入到DOM中。

v-show则是通过控制CSS的display属性来显示或隐藏元素，DOM元素始终存在。

这导致了性能上的差异：v-if有更高的切换开销，因为涉及DOM的创建和销毁，但如果初始条件为false，则没有渲染开销；v-show有更高的初始渲染开销，但切换时开销很小，只是修改CSS属性。

功能上，v-if支持与template标签和v-else配合使用，v-show不支持。在组件生命周期方面，v-if控制的组件在条件变化时会触发完整的生命周期，v-show不会。

</details>

## 18. 你一般会根据什么情况来选择使用 v-if 或者 v-show？ {#question-subjective-600552ce153f}

### 题目要点

基于切换频率、组件复杂度、性能要求和状态保持需求来选择合适的指令。

<details>
<summary>参考答案</summary>

如果条件很少改变，比如基于用户权限的显示控制，会选择v-if，因为可以避免不必要的DOM创建和组件初始化开销。如果需要频繁切换显示状态，比如标签页切换、模态框的显示隐藏，会选择v-show，避免重复的DOM操作开销。对于包含复杂子组件或大量数据的元素，如果不经常显示，使用v-if可以节省初始化成本。在移动端项目中，考虑到性能限制，对于复杂组件更倾向于使用v-if。还要考虑用户体验，如果希望保持组件状态（比如表单输入内容），v-show更合适；如果希望每次显示都是全新状态，v-if更合适。在实际开发中会根据具体需求权衡选择。

</details>

## 19. JavaScript 实现继承有哪些方法？实现一个 {#question-subjective-9f83b0b29f90}

### 题目要点

多种继承实现方式，组合继承和ES6 class是主流，需要理解原型链机制和super关键字。

<details>
<summary>参考答案</summary>

```js
// 1. 原型链继承
function prototypeInheritance() {
  function Animal(name: string) {
    this.name = name
    this.colors = ["red", "blue"]
  }

  Animal.prototype.sayName = function () {
    console.log("My name is " + this.name)
  }

  function Dog(name: string, breed: string) {
    this.breed = breed
  }

  // 设置原型链
  Dog.prototype = new Animal("")
  Dog.prototype.constructor = Dog

  return { Animal, Dog }
}

// 2. 构造函数继承
function constructorInheritance() {
  function Animal(name: string) {
    this.name = name
    this.colors = ["red", "blue"]
  }

  Animal.prototype.sayName = function () {
    console.log("My name is " + this.name)
  }

  function Dog(name: string, breed: string) {
    // 调用父构造函数
    Animal.call(this, name)
    this.breed = breed
  }

  return { Animal, Dog }
}

// 3. 组合继承（最常用的方式）
function combinationInheritance() {
  function Animal(name: string) {
    this.name = name
    this.colors = ["red", "blue"]
  }

  Animal.prototype.sayName = function () {
    console.log("My name is " + this.name)
  }

  Animal.prototype.eat = function () {
    console.log(this.name + " is eating")
  }

  function Dog(name: string, breed: string) {
    // 继承实例属性
    Animal.call(this, name)
    this.breed = breed
  }

  // 继承原型方法
  Dog.prototype = Object.create(Animal.prototype)
  Dog.prototype.constructor = Dog

  // 添加子类特有方法
  Dog.prototype.bark = function () {
    console.log(this.name + " is barking")
  }

  return { Animal, Dog }
}

// 4. ES6 Class继承（现代推荐方式）
class ModernAnimal {
  name: string
  colors: string[]

  constructor(name: string) {
    this.name = name
    this.colors = ["red", "blue"]
  }

  sayName() {
    console.log(`My name is ${this.name}`)
  }

  eat() {
    console.log(`${this.name} is eating`)
  }
}

class ModernDog extends ModernAnimal {
  breed: string

  constructor(name: string, breed: string) {
    super(name) // 调用父类构造函数
    this.breed = breed
  }

  bark() {
    console.log(`${this.name} is barking`)
  }

  // 重写父类方法
  eat() {
    console.log(`${this.name} the ${this.breed} is eating dog food`)
  }
}

// 演示和测试
function demonstrateInheritance() {
  console.log("=== 组合继承演示 ===")
  const { Animal, Dog } = combinationInheritance()

  const animal = new Animal("Generic Animal")
  const dog = new Dog("Buddy", "Golden Retriever")

  console.log("Animal name:", animal.name)
  animal.sayName()
  animal.eat()

  console.log("Dog name:", dog.name)
  console.log("Dog breed:", dog.breed)
  dog.sayName() // 继承的方法
  dog.eat() // 继承的方法
  dog.bark() // 自己的方法

  // 验证继承关系
  console.log("dog instanceof Dog:", dog instanceof Dog)
  console.log("dog instanceof Animal:", dog instanceof Animal)

  console.log("\n=== ES6 Class继承演示 ===")
  const modernAnimal = new ModernAnimal("Modern Animal")
  const modernDog = new ModernDog("Max", "Labrador")

  modernAnimal.sayName()
  modernAnimal.eat()

  modernDog.sayName() // 继承的方法
  modernDog.eat() // 重写的方法
  modernDog.bark() // 自己的方法

  console.log("modernDog instanceof ModernDog:", modernDog instanceof ModernDog)
  console.log("modernDog instanceof ModernAnimal:", modernDog instanceof ModernAnimal)
}

// 执行演示
demonstrateInheritance()

export { combinationInheritance, ModernAnimal, ModernDog }

```

</details>

## 20. 你有什么想问我的吗？ {#question-subjective-8d3d8fc6900f}

### 题目要点

关注工作内容、团队培养、技术环境、协作方式和发展前景等关键信息。

<details>
<summary>参考答案</summary>

希望了解几个方面的信息。首先想了解这个岗位的具体工作内容，主要会参与哪些类型的项目，使用什么技术栈？

其次是团队情况，前端团队的规模如何，新人会有怎样的培养计划和成长路径？

技术方面，公司对新技术的接受度如何，是否鼓励学习和尝试新的前端技术？

工作环境方面，团队的协作方式是怎样的，与后端、设计、产品等团队如何配合？

最后想了解一下公司的发展前景，以及对校招生的期望是什么？

作为应届生，希望能在一个有良好学习氛围和成长空间的环境中开始职业生涯，不断提升技术能力和解决问题的能力。

</details>

## 21. 你怎么看待 AI 与前端的未来呢？ {#question-subjective-0c5021866da9}

### 题目要点

AI是强有力的辅助工具而非替代者，需要学会与AI协作，同时培养高层次的技术能力和思维。

<details>
<summary>参考答案</summary>

作为即将进入前端行业的新人，对AI与前端的结合充满期待和思考。目前已经看到AI在代码生成、设计稿转代码、自动化测试等方面的应用，这些工具确实能提高开发效率。比如GitHub Copilot可以帮助编写代码，一些AI工具可以根据设计稿生成基础的HTML和CSS代码。

认为AI不会完全替代前端开发者，而是会成为强有力的辅助工具。AI擅长处理重复性、规律性的工作，但在创意设计、复杂业务逻辑、用户体验优化等方面，还是需要人的思考和判断。未来的前端开发者可能需要更多地关注架构设计、用户体验、性能优化等高层次的工作。

作为新人，计划在掌握扎实基础技能的同时，也要学会与AI工具协作，提高工作效率。同时要培养批判性思维，能够评估和优化AI生成的代码。相信AI的发展会让前端开发变得更加高效和有趣，也会为行业带来新的机遇和挑战。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-55/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-55/round-85/index.md" >}}) →
