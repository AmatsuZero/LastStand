+++
title = "阿里-国际电商-校招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/32"
experienceId = 32
roundId = 39
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T06:02:07.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-32/round-38/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-32/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 9 道题。答案默认折叠，便于先自行作答。

## 1. React/Vue/Angular框架熟悉哪个？对比一下 {#question-subjective-52145ae489ef}

### 题目要点

前端框架。

<details>
<summary>参考答案</summary>

我对React和Vue较为熟悉，以下是对这三大框架的对比：

1. React：
    1. 优点：
        1. 组件化：React采用组件化开发，将复杂的用户界面拆分为多个可复用的组件，提高代码的可维护性和复用性。
        2. 虚拟DOM：使用虚拟DOM优化DOM操作，减少页面重绘和回流，提升性能。
        3. 生态丰富：拥有庞大的生态系统，如Redux、React Router等，可满足各种复杂的开发需求。
        4. 社区活跃：社区庞大，更新迅速，遇到问题时容易找到解决方案。
    2. 缺点：
        1. 学习曲线：对初学者来说，需要学习JSX语法和组件化的思想，有一定学习成本。
        2. 配置繁琐：项目搭建和配置相对复杂，需要手动配置Webpack等构建工具。
2. Vue：
    1. 优点：
        1. 易上手：语法简洁，文档清晰，容易上手，适合初学者快速入门。
        2. 渐进式框架：可以逐步引入Vue，与现有项目或其他技术结合使用，灵活性高。
        3. 模板语法：使用HTML模板，对熟悉HTML和JavaScript的开发者更友好。
        4. 性能优化：也采用虚拟DOM，性能表现良好。
    2. 缺点：
        1. 生态不够丰富：相较于React，生态和社区稍小，插件和库的选择相对有限。
        2. 大型项目支持：在处理大型复杂项目时，可能不如React和Angular成熟。
3. Angular：
    1. 优点：
        1. 全栈解决方案：提供从前端到后端的一整套解决方案，包括路由、状态管理、表单处理等。
        2. 强类型系统：基于TypeScript开发，具有强类型检查，有助于大型项目的代码维护和团队协作。
        3. 依赖注入：内置依赖注入系统，方便管理组件和服务之间的依赖关系。
        4. 适合企业级应用：在开发大型企业级应用时，提供了一套完整的架构和规范。
    2. 缺点：
        1. 学习曲线陡峭：对初学者来说，需要掌握TypeScript、依赖注入、模块化等概念，学习成本较高。
        2. 灵活性较低：框架较为庞大，定制化程度不如React和Vue高，不适合小型项目快速开发。
        3. 社区相对较小：相较于React，社区活跃度和更新速度稍逊一筹。

</details>

## 2. React Hooks闭包陷阱的产生原因？ {#question-f1a76998-d6bd-487e-ae2e-06a045f8e7aa}

> 题库原题：[说说你对 React Hook的闭包陷阱的理解，有哪些解决方案？](https://fe.ecool.fun/topic/f1a76998-d6bd-487e-ae2e-06a045f8e7aa)

### 题目要点

React Hook 的闭包陷阱是一个常见的问题,它发生在使用 Hook 时,特别是在处理事件处理函数或异步操作时。

闭包陷阱的本质是,在 Hook 内部定义的函数会捕获 Hook 函数执行时的状态,而不是最新的状态。这可能会导致一些意想不到的行为,比如事件处理函数无法访问最新的状态,或者异步操作使用了过期的数据。

造成这个问题的原因是,React Hook 的设计使得组件函数在每次渲染时都会重新定义内部的函数,而这些函数会关闭当时的状态。

解决这个问题的主要方案有以下几种:

1. **使用 useCallback Hook**:
   - `useCallback` 可以缓存函数引用,确保函数在依赖项不变的情况下保持不变。
   - 这样可以确保事件处理函数访问的是最新的状态。

2. **使用 useRef 保存引用**:
   - 可以使用 `useRef` Hook 保存状态的引用,并在需要访问最新状态时使用 `ref.current`。
   - 这样可以确保即使在事件处理函数或异步操作中,也能访问到最新的状态。

3. **使用 dependency array 进行优化**:
   - 在使用 `useEffect`、`useCallback` 等 Hook 时,仔细检查依赖项数组,确保它包含了所有需要的依赖项。
   - 这样可以确保 Hook 内部的函数能访问到最新的状态。

4. **使用 React 18 的 `useTransition` Hook**:
   - React 18 引入了 `useTransition` Hook,可以帮助开发者更好地控制状态更新的优先级。
   - 这样可以避免一些异步操作使用过期状态的问题。

5. **使用 ESLint 插件检查**:
   - 可以使用 ESLint 插件,如 `exhaustive-deps`,自动检查 Hook 依赖项的完整性。
   - 这可以帮助开发者及早发现闭包陷阱问题。

<details>
<summary>参考答案</summary>

本文从 一个hooks中 “奇怪”（其实符合逻辑） 的 “闭包陷阱” 的场景切入，试图讲清楚其背后的因果。同时，在许多 react hooks 奇技淫巧的文章里，也能看到 `useRef` 的身影，那么为什么使用 `useRef` 又能摆脱 这个 “闭包陷阱” ？ 搞清楚这些问题，将能较大的提升对 react hooks 的理解。

react hooks 一出现便受到了许多开发人员的追捧,或许在使用react hooks 的时候遇到 “闭包陷阱” 是每个开发人员在开发的时候都遇到过的事情，有的两眼懵逼、有的则稳如老狗瞬间就定义到了问题出现在何处。

(以下react示范demo，均为react 16.8.3 版本)

你一定遭遇过以下这个场景：
```js
function App(){
    const [count, setCount] = useState(1);
    useEffect(()=>{
        setInterval(()=>{
            console.log(count)
        }, 1000)
    }, [])
}
```
在这个定时器里面去打印 `count` 的值，会发现，不管在这个组件中的其他地方使用 `setCount` 将 `count` 设置为任何值，还是设置多少次，打印的都是1。是不是有一种，尽管历经千帆，我记得的还是你当初的模样的感觉？ hhh... 接下来，我将尽力的尝试将我理解的，为什么会发生这么个情况说清楚，并且浅谈一些hooks其他的特性。如果有错误，希望各位同学能救救孩子，不要让我带着错误的认知活下去了。。。

## 1、一个熟悉的闭包场景

首先从一个各位jser都很熟悉的场景入手。
```js
for ( var i=0; i<5; i++ ) {
    setTimeout(()=>{
        console.log(i)
    }, 0)
}
```

我就不说为什么最终，打印的都是5的原因了。直接贴出使用闭包打印 0...4的代码：
```js
for ( var i=0; i<5; i++ ) {
   (function(i){
         setTimeout(()=>{
            console.log(i)
        }, 0)
   })(i)
}
```

这个原理其实就是使用闭包，定时器的回调函数去引用立即执行函数里定义的变量，形成闭包保存了立即执行函数执行时 i 的值，异步定时器的回调函数才如我们想要的打印了顺序的值。

其实，`useEffect` 的哪个场景的原因，跟这个，简直是一样的，**`useEffect` 闭包陷阱场景的出现，是 react 组件更新流程以及 `useEffect` 的实现的自然而然结果**。

## 2 浅谈hooks原理，理解useEffect 的 “闭包陷阱” 出现原因。

首先，可能都听过react的 Fiber 架构，其实可以认为一个 Fiber节点就对应的是一个组件。对于 `classComponent` 而言，有 `state` 是一件很正常的事情，Fiber对象上有一个 `memoizedState` 用于存放组件的 `state`。ok，现在看 hooks 所针对的 `FunctionComponnet`。 无论开发者怎么折腾，一个对象都只能有一个 `state` 属性或者 `memoizedState`  属性，可是，谁知道可爱的开发者们会在 `FunctionComponent` 里写上多少个 `useState`，`useEffect` 等等 ? 所以，react用了链表这种数据结构来存储 `FunctionComponent` 里面的 hooks。比如：

```js
function App(){
    const [count, setCount] = useState(1)
    const [name, setName] = useState('chechengyi')
    useEffect(()=>{

    }, [])
    const text = useMemo(()=>{
        return 'ddd'
    }, [])
}
```
在组件第一次渲染的时候，为每个hooks都创建了一个对象

```ts
type Hook = {
  memoizedState: any,
  baseState: any,
  baseUpdate: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null,
  next: Hook | null,
};
```

最终形成了一个链表。
![](https://static.ecool.fun//article/7ca47e0d-4dad-4b07-86a4-5c399aec8b77.jpeg)

这个对象的`memoizedState`属性就是用来存储组件上一次更新后的 `state`,`next`毫无疑问是指向下一个hook对象。在组件更新的过程中，hooks函数执行的顺序是不变的，就可以根据这个链表拿到当前hooks对应的`Hook`对象，函数式组件就是这样拥有了state的能力。当前，具体的实现肯定比这三言两语复杂很多。

所以，知道为什么不能将hooks写到if else语句中了把？因为这样可能会导致顺序错乱，导致当前hooks拿到的不是自己对应的Hook对象。

`useEffect` 接收了两个参数，一个回调函数和一个数组。数组里面就是 `useEffect` 的依赖，当为 [] 的时候，回调函数只会在组件第一次渲染的时候执行一次。如果有依赖其他项，react 会判断其依赖是否改变，如果改变了就会执行回调函数。说回最初的场景：
```js
function App(){
    const [count, setCount] = useState(1);
    useEffect(()=>{
        setInterval(()=>{
            console.log(count)
        }, 1000)
    }, [])
    function click(){ setCount(2) }
}
```
好，开动脑袋开始想象起来，组件第一次渲染执行 `App()`，执行 `useState` 设置了初始状态为1，所以此时的 `count` 为1。然后执行了 `useEffect`，回调函数执行，设置了一个定时器每隔 1s 打印一次 `count`。

接着想象如果 `click` 函数被触发了，调用 `setCount(2)` 肯定会触发react的更新，更新到当前组件的时候也是执行 `App()`，之前说的链表已经形成了哈，此时 `useState` 将 `Hook` 对象 上保存的状态置为2， 那么此时 `count` 也为2了。然后在执行 `useEffect` 由于依赖数组是一个空的数组，所以此时回调并不会被执行。

ok，这次更新的过程中根本就没有涉及到这个定时器，这个定时器还在坚持的，默默的，每隔1s打印一次 `count`。 注意这里打印的 `count` ，是组件第一次渲染的时候 `App()` 时的 `count`， `count`的值为1，**因为在定时器的回调函数里面被引用了，形成了闭包一直被保存**。

## 2 难道真的要在依赖数组里写上的值，才能拿到新鲜的值？
仿佛都习惯性都去认为，只有在依赖数组里写上我们所需要的值，才能在更新的过程中拿到最新鲜的值。那么看一下这个场景：
```jsx
function App() {
  return <Demo1 />
}

function Demo1(){
  const [num1, setNum1] = useState(1)
  const [num2, setNum2] = useState(10)

  const text = useMemo(()=>{
    return `num1: ${num1} | num2:${num2}`
  }, [num2])

  function handClick(){
    setNum1(2)
    setNum2(20)
  }

  return (
    <div>
      {text}
      <div><button onClick={handClick}>click!</button></div>
    </div>
  )
}
```
`text` 是一个 `useMemo` ，它的依赖数组里面只有num2，没有num1，却同时使用了这两个state。当点击button 的时候，num1和num2的值都改变了。那么，只写明了依赖num2的 text 中能否拿到 num1 最新鲜的值呢？

如果你装了 `react` 的 eslint 插件，这里也许会提示你错误，因为在text中你使用了 num1 却没有在依赖数组中添加它。 但是执行这段代码会发现，是可以正常拿到num1最新鲜的值的。

如果理解了之前第一点说的“闭包陷阱”问题，肯定也能理解这个问题。

为什么呢，再说一遍，这个依赖数组存在的意义，是react为了判定，在**本次更新**中，是否需要执行其中的回调函数，这里依赖了的num2，而num2改变了。回调函数自然会执行， 这时形成的闭包引用的就是最新的num1和num2，所以，自然能够拿到新鲜的值。问题的关键，在于回调函数执行的时机，闭包就像是一个照相机，把回调函数执行的那个时机的那些值保存了下来。之前说的定时器的回调函数我想就像是一个从1000年前穿越到现代的人，虽然来到了现代，但是身上的血液、头发都是1000年前的。

## 3 为什么使用useRef能够每次拿到新鲜的值？
大白话说：因为初始化的 `useRef` 执行之后，返回的都是同一个对象。写到这里宝宝又不禁回忆起刚学js那会儿，捧着红宝书啃时候的场景了：

```js
var A = {name: 'chechengyi'}
var B = A
B.name = 'baobao'
console.log(A.name) // baobao
```

对，这就是这个场景成立的最根本原因。

也就是说，在组件每一次渲染的过程中。 比如 `ref = useRef()` 所返回的都是同一个对象，每次组件更新所生成的`ref`指向的都是同一片内存空间， 那么当然能够每次都拿到最新鲜的值了。犬夜叉看过把？一口古井连接了现代世界与500年前的战国时代，这个同一个对象也将这些个被保存于不同闭包时机的变量了联系了起来。

使用一个例子或许好理解一点：
```js
/* 将这些相关的变量写在函数外 以模拟react hooks对应的对象 */
let isC = false
let isInit = true; // 模拟组件第一次加载
let ref = {
    current: null
}

function useEffect(cb){
// 这里用来模拟 useEffect 依赖为 [] 的时候只执行一次。
if (isC) return
isC = true
cb()
}

function useRef(value){
// 组件是第一次加载的话设置值 否则直接返回对象
    if ( isInit ) {
        ref.current = value
        isInit = false
    }
    return ref
}

function App(){
    let ref_ = useRef(1)
    ref_.current++
    useEffect(()=>{
        setInterval(()=>{
            console.log(ref.current) // 3
        }, 2000)
    })
}

// 连续执行两次 第一次组件加载 第二次组件更新
App()
App()
```

所以，提出一个合理的设想。只要我们能保证每次组件更新的时候，`useState` 返回的是同一个对象的话？我们也能绕开闭包陷阱这个情景吗？ 试一下吧。

```jsx
function App() {
  // return <Demo1 />
  return <Demo2 />
}

function Demo2(){
  const [obj, setObj] = useState({name: 'chechengyi'})

  useEffect(()=>{
    setInterval(()=>{
      console.log(obj)
    }, 2000)
  }, [])

  function handClick(){
    setObj((prevState)=> {
      var nowObj = Object.assign(prevState, {
        name: 'baobao',
        age: 24
      })
      console.log(nowObj == prevState)
      return nowObj
    })
  }
  return (
    <div>
      <div>
        <span>name: {obj.name} | age: {obj.age}</span>
        <div><button onClick={handClick}>click!</button></div>
      </div>
    </div>
  )
}
```
简单说下这段代码，在执行 `setObj` 的时候，传入的是一个函数。这种用法就不用我多说了把？然后 `Object.assign` 返回的就是传入的第一个对象。总儿言之，就是在设置的时候返回了同一个对象。

执行这段代码发现，确实点击button后，定时器打印的值也变成了：
```js
{
    name: 'baobao',
    age: 24
}
```

</details>

## 3. 了解什么是单页面么 ？如何实现SPA首屏加载时间从5s优化到1s内？ {#question-subjective-11a8b44d99a4}

### 题目要点

前端性能优化。

<details>
<summary>参考答案</summary>

单页面应用（SPA）是一种只加载一个主HTML页面并在用户与应用程序交互时动态更新页面内容的应用程序。SPA的优点包括提供类似原生应用的用户体验、减少页面加载时间（因为不需要重新加载整个页面）和简化前后端分离的架构。然而，SPA的首屏加载时间通常较长，因为需要下载整个应用程序代码。要将SPA的首屏加载时间从5秒优化到1秒以内，可以采取以下措施：

通过以上这些措施的综合应用，可以有效减少SPA的首屏加载时间，提升用户体验。需要注意的是，每个项目的具体情况不同，可能需要根据实际项目的特点和需求，选择合适的优化策略并进行调整。

1. 代码分割和懒加载：通过将应用程序代码分割成多个小块，并实现按需加载，可以显著减少首屏加载的代码量。例如，使用React的React.lazy和Suspense组件来懒加载路由组件。
2. 优化构建配置：使用Webpack等构建工具的代码分割、Tree-shaking等功能，去除未使用的代码，减小打包文件的大小。
3. 使用CDN加速：将静态资源部署到CDN，利用CDN的分布式节点优势，加快资源的下载速度。
4. 资源预加载和预获取：使用或提前加载关键资源，如首屏所需的CSS和JavaScript文件。
5. 压缩和减少HTTP请求：压缩JavaScript、CSS和图片文件，减少文件大小；合并多个小文件请求，减少HTTP请求数量。
6. 服务端渲染（SSR）或静态站点生成（SSG）：对于首屏内容，可以采用服务端渲染或静态站点生成的方式，直接返回HTML内容给客户端，减少客户端的渲染时间。
7. 优化首屏渲染路径：只在首屏加载必要的组件和数据，将非首屏内容的加载延迟到首屏渲染完成后进行。
8. 利用浏览器缓存：通过设置合理的HTTP缓存头（如Cache-Control、ETag），使浏览器缓存静态资源，避免重复下载。
9. 减少JavaScript执行时间：优化JavaScript代码，避免在首屏渲染过程中执行耗时的操作，如复杂的计算或大量的DOM操作。
10. 性能监测和分析：使用性能分析工具（如Chrome DevTools的Performance面板、Lighthouse）定期监测和分析应用的加载性能，找出性能瓶颈并针对性地进行优化。

</details>

## 4. Node.js事件循环了解么 ？与浏览器事件循环什么不同 {#question-2b415f44-7a22-4e74-bef4-1b7c09e170d4}

> 题库原题：[说说对Nodejs中的事件循环机制理解?](https://fe.ecool.fun/topic/2b415f44-7a22-4e74-bef4-1b7c09e170d4)

### 题目要点

**作答思路**：

Node.js中的事件循环机制是一种异步编程模型，它基于事件驱动和非阻塞I/O。其核心是V8引擎和libuv库。V8负责执行JavaScript代码，而libuv负责处理系统调用和I/O操作。
事件循环的主要组成部分包括：

1. **主事件循环（Main Loop）**：负责处理异步任务，包括文件读写、网络请求等。
2. **事件队列**：存储等待处理的异步任务。
3. **观察者模式**：用于处理异步任务完成后的回调。
当有事件发生时，libuv会将事件放入事件队列，V8引擎会不断检查事件队列，如果有事件，则调用相应的回调函数。这种机制使得Node.js能够高效地处理大量的并发请求。

**考察要点**：

1. **事件循环概念**：理解事件循环在Node.js中的作用和基本原理。
2. **异步编程模型**：理解事件驱动和非阻塞I/O在Node.js中的应用。
3. **事件队列和观察者模式**：理解事件队列和观察者模式在事件循环中的作用。

<details>
<summary>参考答案</summary>

## 一、是什么

在[浏览器事件循环](https://github.com/febobo/web-interview/issues/73)中，我们了解到`javascript`在浏览器中的事件循环机制，其是根据`HTML5`定义的规范来实现

而在`NodeJS`中，事件循环是基于`libuv`实现，`libuv`是一个多平台的专注于异步IO的库，如下图最右侧所示：

 ![](https://static.ecool.fun//article/a3883f83-894a-475e-9352-2c6d5fe3dc2d.png)

上图`EVENT_QUEUE` 给人看起来只有一个队列，但`EventLoop`存在6个阶段，每个阶段都有对应的一个先进先出的回调队列

## 二、流程

上节讲到事件循环分成了六个阶段，对应如下：

 ![](https://static.ecool.fun//article/b120f48a-402c-4784-a78b-366151217ed5.png)

- timers阶段：这个阶段执行timer（setTimeout、setInterval）的回调
- 定时器检测阶段(timers)：本阶段执行 timer 的回调，即 setTimeout、setInterval 里面的回调函数
- I/O事件回调阶段(I/O callbacks)：执行延迟到下一个循环迭代的 I/O 回调，即上一轮循环中未被执行的一些I/O回调
- 闲置阶段(idle, prepare)：仅系统内部使用
- 轮询阶段(poll)：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外），其余情况 node 将在适当的时候在此阻塞
- 检查阶段(check)：setImmediate() 回调函数在这里执行
- 关闭事件回调阶段(close callback)：一些关闭的回调函数，如：socket.on('close', ...)

每个阶段对应一个队列，当事件循环进入某个阶段时, 将会在该阶段内执行回调，直到队列耗尽或者回调的最大数量已执行, 那么将进入下一个处理阶段

除了上述6个阶段，还存在`process.nextTick`，其不属于事件循环的任何一个阶段，它属于该阶段与下阶段之间的过渡, 即本阶段执行结束, 进入下一个阶段前, 所要执行的回调，类似插队

流程图如下所示：

 ![](https://static.ecool.fun//article/6ab9a805-9ff5-4a47-985f-e15c2e3442c2.png)

在`Node`中，同样存在宏任务和微任务，与浏览器中的事件循环相似

微任务对应有：

- next tick queue：process.nextTick
- other queue：Promise的then回调、queueMicrotask

宏任务对应有：

- timer queue：setTimeout、setInterval
- poll queue：IO事件
- check queue：setImmediate
- close queue：close事件

其执行顺序为：

- next tick microtask queue
- other microtask queue
- timer queue
- poll queue
- check queue
- close queue

## 三、题目

通过上面的学习，下面开始看看题目

```js
async function async1() {
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}

async function async2() {
    console.log('async2')
}

console.log('script start')

setTimeout(function () {
    console.log('setTimeout0')
}, 0)

setTimeout(function () {
    console.log('setTimeout2')
}, 300)

setImmediate(() => console.log('setImmediate'));

process.nextTick(() => console.log('nextTick1'));

async1();

process.nextTick(() => console.log('nextTick2'));

new Promise(function (resolve) {
    console.log('promise1')
    resolve();
    console.log('promise2')
}).then(function () {
    console.log('promise3')
})

console.log('script end')
```

分析过程：

- 先找到同步任务，输出script start
- 遇到第一个 setTimeout，将里面的回调函数放到 timer 队列中
- 遇到第二个 setTimeout，300ms后将里面的回调函数放到 timer 队列中
- 遇到第一个setImmediate，将里面的回调函数放到 check 队列中
- 遇到第一个 nextTick，将其里面的回调函数放到本轮同步任务执行完毕后执行

- 执行 async1函数，输出 async1 start
- 执行 async2 函数，输出 async2，async2 后面的输出 async1 end进入微任务，等待下一轮的事件循环
- 遇到第二个，将其里面的回调函数放到本轮同步任务执行完毕后执行
- 遇到 new Promise，执行里面的立即执行函数，输出 promise1、promise2
- then里面的回调函数进入微任务队列
- 遇到同步任务，输出 script end
- 执行下一轮回到函数，先依次输出 nextTick 的函数，分别是 nextTick1、nextTick2
- 然后执行微任务队列，依次输出 async1 end、promise3
- 执行timer 队列，依次输出 setTimeout0
- 接着执行 check  队列，依次输出 setImmediate
- 300ms后，timer 队列存在任务，执行输出 setTimeout2

执行结果如下：

```
script start
async1 start
async2
promise1
promise2
script end
nextTick1
nextTick2
async1 end
promise3
setTimeout0
setImmediate
setTimeout2
```

最后有一道是关于`setTimeout`与`setImmediate`的输出顺序

```js
setTimeout(() => {
  console.log("setTimeout");
}, 0);

setImmediate(() => {
  console.log("setImmediate");
});
```

输出情况如下：

```js
情况一：
setTimeout
setImmediate

情况二：
setImmediate
setTimeout
```

分析下流程：

- 外层同步代码一次性全部执行完，遇到异步API就塞到对应的阶段
- 遇到`setTimeout`，虽然设置的是0毫秒触发，但实际上会被强制改成1ms，时间到了然后塞入`times`阶段
- 遇到`setImmediate`塞入`check`阶段
- 同步代码执行完毕，进入Event Loop
- 先进入`times`阶段，检查当前时间过去了1毫秒没有，如果过了1毫秒，满足`setTimeout`条件，执行回调，如果没过1毫秒，跳过
- 跳过空的阶段，进入check阶段，执行`setImmediate`回调

这里的关键在于这1ms，如果同步代码执行时间较长，进入`Event Loop`的时候1毫秒已经过了，`setTimeout`先执行，如果1毫秒还没到，就先执行了`setImmediate`

</details>

## 5. 讲一下你在实习过程中了解到的前端工程化核心环节 {#question-subjective-5dd2c2f3f71f}

### 题目要点

前端工程化。

<details>
<summary>参考答案</summary>

在实习过程中，我了解到前端工程化的核心环节主要包括以下几个方面：

1. 模块化开发：将复杂的应用程序拆分为多个独立的模块，每个模块负责特定的功能。这不仅提高了代码的可维护性和复用性，也便于团队协作开发。在实际项目中，我们使用了ES6模块系统和Webpack等工具进行模块化开发和打包。
2. 构建工具的使用：借助Webpack、Vite等构建工具，可以对项目中的JavaScript、CSS、图片等资源进行编译、压缩、打包等处理。这些工具能够提高资源加载效率，优化应用性能。在实习期间，我参与了Webpack配置的优化，以适应项目的特定需求。
3. 自动化测试：编写单元测试和集成测试，确保代码质量并及时发现潜在的bug。我们使用了Jest和React Testing Library等工具进行测试，以提高代码的可靠性和稳定性。
4. 代码质量控制：通过ESLint、Prettier等工具对代码进行格式化和风格检查，保证团队代码风格的一致性，提升代码质量。同时，在代码审查过程中，团队成员会互相检查代码，确保代码符合规范。
5. 版本控制与协作：使用Git进行版本控制，管理代码变更历史，方便团队成员之间的协作开发。在实习期间，我熟悉了Git的常用操作，如分支管理、合并、冲突解决等，并遵循团队的工作流规范。
6. 性能优化：关注应用的性能指标，如页面加载时间、渲染速度、资源大小等，并采取相应的优化措施。例如，通过图片懒加载、代码分割、使用CDN等方法优化应用性能。
7. 前端架构设计：根据项目的规模和需求，设计合理的前端架构，选择合适的技术栈和设计模式。例如，在大型项目中采用微前端架构，以提高项目的可维护性和扩展性。
8. 文档编写与知识共享：编写清晰的项目文档，记录项目的架构设计、功能实现、接口文档等信息，方便团队成员之间的知识共享和新成员的快速上手。

</details>

## 6. 项目中为什么会选择使用Flutter {#question-subjective-f5bc38cf4107}

### 题目要点

Flutter应用。

<details>
<summary>参考答案</summary>

在项目中选择使用Flutter的原因主要包括以下几点：

1. 跨平台优势：Flutter允许开发者使用一套代码同时构建iOS和Android应用，显著提高了开发效率，减少了开发和维护成本。这对于需要同时发布多平台应用的项目来说是一个巨大的优势。
2. 高性能：Flutter采用自己的渲染引擎（Skia），不依赖平台原生组件，这使得它可以提供一致的高性能体验，尤其是在需要复杂动画和交互的应用中。
3. 丰富的组件库：Flutter提供了一套丰富的、可高度定制的组件库，这些组件在不同平台上具有一致的外观和行为，有助于创建具有统一用户体验的应用程序。
4. 热重载功能：在开发过程中，Flutter的热重载功能可以快速反映代码更改，无需重启应用，大大提高了开发效率。
5. 强大的生态和社区支持：随着Flutter的发展，其生态系统日益丰富，包括各种插件、包和第三方服务，能够满足项目中的各种需求。同时，活跃的社区也为开发者提供了丰富的学习资源和问题解决方案。
6. 现代化的开发语言：Flutter使用Dart语言进行开发，Dart是一种现代化的、易于学习的语言，具有简洁的语法和强大的特性，如异步编程支持等。
7. 适合多种应用场景：无论是在移动应用开发、桌面应用开发，还是Web应用开发中，Flutter都能提供良好的支持，具有广泛的应用前景。

</details>

## 7. 讲一下Flutter与React Native渲染原理的差异 {#question-subjective-8ddb26baeafd}

### 题目要点

跨平台框架。

<details>
<summary>参考答案</summary>

Flutter和React Native都是流行的跨平台开发框架，但它们在渲染原理上存在显著差异：

1. Flutter：
    1. 独立渲染引擎：Flutter使用自己的渲染引擎（Skia）和一套自定义的widget库，不依赖于平台原生的UI组件。这意味着Flutter应用在不同平台上具有一致的渲染效果，开发者可以完全控制应用的外观和行为。
    2. 直接绘制：Flutter的widget框架将用户界面转化为一系列的绘制命令，通过Skia引擎直接绘制到屏幕上。这种机制使得Flutter能够提供高性能的图形渲染和复杂的动画效果。
    3. 统一的UI组件：所有平台上的应用都使用相同的组件和布局方式，确保了应用在iOS和Android上的外观和交互方式一致。
2. React Native：
    1. 平台原生组件：React Native使用平台原生的UI组件进行渲染。例如，在iOS上使用UIKit组件，在Android上使用Android SDK组件。因此，React Native应用在不同平台上会呈现出各自的原生风格。
    2. 桥接通信：React Native通过JavaScript桥与原生平台进行通信。JavaScript代码负责应用的逻辑和状态管理，而原生代码负责UI渲染。这种桥接机制可能带来一定的性能开销，尤其是在频繁交互的场景中。
    3. 平台特定代码：由于依赖平台原生组件，React Native可能需要编写平台特定的代码来处理不同的UI行为和样式。这在一定程度上增加了开发的复杂性，但能够更好地利用平台的特性和功能。

</details>

## 8. Flutter中如何实现了高性能列表滚动？ {#question-subjective-792defd96da5}

### 题目要点

Flutter性能。

<details>
<summary>参考答案</summary>

Flutter通过多种优化技术实现了高性能的列表滚动体验：

1. 虚拟滚动技术：Flutter的ListView等滚动组件采用虚拟滚动技术，只渲染当前屏幕及其附近可见区域的列表项。未可见的列表项不会被构建或渲染，从而节省了内存和CPU资源。当用户滚动列表时，Flutter会动态创建和复用列表项的渲染对象，确保滚动过程流畅。
2. 高效的渲染引擎：Flutter基于自己的渲染引擎（Skia）和Dart语言开发，对渲染流程进行了深度优化。它采用即时模式（Immediate Mode）进行绘制，减少了渲染过程中的开销，并能够高效地处理大量的绘制操作。
3. 增量构建和渲染：Flutter框架在更新UI时，只会重新构建和渲染实际发生变化的部分。对于列表滚动场景，这意味着只有新滚动到视口中的项才会被重新渲染，而其他未变化的项会保持之前的渲染状态，避免了不必要的重绘和布局计算。
4. Dart语言的性能优势：Dart是一种高效的编程语言，其编译器可以将代码编译为接近原生性能的机器码。这使得Flutter应用在执行滚动等交互操作时能够获得更快的响应速度。
5. 合理的内存管理：Flutter对列表项的渲染对象进行有效的复用和回收，避免了频繁的内存分配和垃圾回收操作，从而提高了滚动的流畅度。

</details>

## 9. 如何实现Webpack的按需加载与预加载？ {#question-f48b91d1-6f40-44ef-899a-266c0c4da99f}

> 题库原题：[如何实现Webpack的按需加载与预加载？](https://fe.ecool.fun/topic/f48b91d1-6f40-44ef-899a-266c0c4da99f)

### 题目要点

Webpack 按需加载基于动态 `import()` 进行代码拆分；运行时通过 chunk 缓存保证只加载一次；预加载通过 `webpackPrefetch` 和 `webpackPreload` 控制资源提前加载；`preload` 高优先级、`prefetch` 低优先级；实际项目中应结合用户路径和网络条件谨慎使用预加载。

<details>
<summary>参考答案</summary>

在 Webpack 中，“按需加载”和“预加载”并不是两个孤立的能力，而是**围绕代码拆分（Code Splitting）建立的一套资源调度策略**。前者解决首屏体积和加载时机问题，后者解决“即将用到但还没用到”的性能窗口问题。

按需加载的基础是 **动态依赖**。Webpack 在构建阶段会分析 `import()` 语法或等价的动态引用形式，将其拆分为独立的 chunk。与静态 `import` 不同，`import()` 并不会在初始 bundle 中被直接执行，而是被转换为一个运行时加载函数：当代码路径真正走到这里时，Webpack 才会通过插入 `&lt;script&gt;` 标签的方式请求对应的 chunk。这样，路由级组件、低频功能模块就可以被延迟加载，从而显著降低首屏 JS 体积。在单页应用中，路由懒加载本质上就是对这一机制的工程化封装。

在运行时层面，Webpack 会维护一个 chunk 状态表，确保每个异步 chunk 只会被加载和执行一次。即使多个地方同时触发同一个动态 `import()`，最终也会复用同一份请求和执行结果，这一点与模块单次初始化的原则是一致的。

预加载则是在“按需加载”的基础上，**提前把未来可能用到的资源放入浏览器加载队列**。Webpack 通过在动态 `import()` 中添加魔法注释来声明加载意图。例如，`webpackPrefetch` 表示在浏览器空闲时低优先级加载该 chunk，而 `webpackPreload` 则表示与当前资源并行、高优先级加载。Webpack 会据此在主 bundle 中生成对应的 `&lt;link rel="prefetch"&gt;` 或 `&lt;link rel="preload"&gt;` 标签，把资源调度权交给浏览器。

两者的差异不在“是否提前加载”，而在于**加载优先级和时机**。`preload` 更适合首屏渲染后立即会用到的模块，例如首屏之后立刻进入的交互逻辑；`prefetch` 更适合不确定是否会用到、但命中概率较高的模块，例如下一个路由页面。在网络受限场景下，滥用 `preload` 反而可能挤占关键资源带宽，这是需要重点权衡的地方。

在工程实践中，按需加载通常是默认策略，而预加载是一种“精细化调优手段”。是否启用预加载，往往需要结合用户路径、页面停留时间和网络条件进行验证，而不是一次性全量配置。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-32/round-38/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-32/_index.md" >}}) · 已是最后一轮 →
