+++
title = "react hooks"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-02-08T00:00:00+08:00'
draft = true
weight = 5
tags = ["面试", "前端", "React", "react hooks", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 一 前言

React hooks是react16.8 以后，react新增的钩子API，目的是增加代码的可复用性，逻辑性，弥补无状态组件没有生命周期，没有数据管理状态state的缺陷。

本章节将介绍目前 React 提供的所有 hooks ，介绍其功能类型和基本使用方法。

### 1.1 技术背景

**react hooks 解决了什么问题？**

先设想一下，如果没有 Hooks，函数组件能够做的只是接受 Props、渲染 UI ，以及触发父组件传过来的事件。所有的处理逻辑都要在类组件中写，这样会使 class 类组件内部错综复杂，每一个类组件都有一套独特的状态，相互之间不能复用，即便是 React 之前出现过 mixin 等复用方式，但是伴随出 mixin 模式下隐式依赖，代码冲突覆盖等问题，也不能成为 React 的中流砥柱的逻辑复用方案。所以 React 放弃 mixin 这种方式。

类组件是一种面向对象思想的体现，类组件之间的状态会随着功能增强而变得越来越臃肿，代码维护成本也比较高，而且不利于后期 tree shaking。所以有必要做出一套函数组件代替类组件的方案，于是 Hooks 也就理所当然的诞生了。

所以 Hooks 出现本质上原因是：

- **让函数组件也能做类组件的事，有自己的状态，可以处理一些副作用，能获取 ref ，也能做数据缓存。**
- **解决逻辑复用难的问题。**
- **放弃面向对象编程，拥抱函数式编程。**

**为什么要使用自定义 Hooks ？**

自定义 hooks 是在 React Hooks 基础上的一个拓展，可以根据业务需求制定满足业务需要的组合 hooks ，更注重的是逻辑单元。通过业务场景不同，到底需要React Hooks 做什么，怎么样把一段逻辑封装起来，做到复用，这是自定义 hooks 产生的初衷。

自定义 hooks 也可以说是 React Hooks 聚合产物，其内部有一个或者多个 React Hooks 组成，用于解决一些复杂逻辑。

### 1.2 技术愿景

目前 hooks 已经成为 React 主流的开发手段，React 生态也日益朝着 hooks 方向发展，比如 React Router, React Redux 等， hooks 也更契合 React 生态库的应用。

随着项目功能模块越来越复杂，一些公共逻辑不能有效的复用，这些逻辑需要和业务代码强关联到一起，这样会让整体工程臃肿，功能不能复用，如果涉及到修改逻辑，那么有可能牵一发动全身。

所以有必要使用自定义 hooks 的方式，hooks 可以把重复的逻辑抽离出去，根据需要创建和业务功能绑定的业务型 hooks ，或者是根据具体功能创建的功能型 hooks 。

### 1.3 功能概览

在 React 的世界中，不同的 hooks 使命也是不同的，我这里对 React hooks 按照功能分类，分成了 **数据更新驱动**，**状态获取与传递，执行副作用，状态派生与保存，和工具类型，** 具体功能划分和使用场景如下：

![](image-01.webp)

## 二 hooks 之数据更新驱动

### 2.1 useState

useState 可以使函数组件像类组件一样拥有 state，函数组件通过 useState 可以让组件重新渲染，更新视图。

**useState 基础介绍：**

```js
const [ ①state , ②dispatch ] = useState(③initData)
```

① state，目的提供给 UI ，作为渲染视图的数据源。

② dispatchAction 改变 state 的函数，可以理解为推动函数组件渲染的渲染函数。

③ initData 有两种情况，第一种情况是非函数，将作为 state 初始化的值。 第二种情况是函数，函数的返回值作为 useState 初始化的值。

**useState 基础用法：**

```js
const DemoState = (props) => {
   /* number为此时state读取值 ，setNumber为派发更新的函数 */
   let [number, setNumber] = useState(0) /* 0为初始值 */
   return (<div>
       <span>{ number }</span>
       <button onClick={ ()=> {
         setNumber(number+1)
         console.log(number) /* 这里的number是不能够即使改变的  */
       } } ></button>
   </div>)
}
```

**useState 注意事项：**

① 在函数组件一次执行上下文中，state 的值是固定不变的。

```js
function Index(){
    const [ number, setNumber ] = React.useState(0)
    const handleClick = () => setInterval(()=>{
        // 此时 number 一直都是 0
        setNumber(number + 1 )
    },1000)
    return <button onClick={ handleClick } > 点击 { number }</button>
}
```

② 如果两次 dispatchAction 传入相同的 state 值，那么组件就不会更新。

```js
export default function Index(){
    const [ state  , dispatchState ] = useState({ name:'alien' })
    const  handleClick = ()=>{ // 点击按钮，视图没有更新。
        state.name = 'Alien'
        dispatchState(state) // 直接改变 `state`，在内存中指向的地址相同。
    }
    return <div>
         <span> { state.name }</span>
        <button onClick={ handleClick }  >changeName++</button>
    </div>
}
```

③ 当触发 dispatchAction 在当前执行上下文中获取不到最新的 state, 只有再下一次组件 rerender 中才能获取到。

### 2.2 useReducer

useReducer 是 react-hooks 提供的能够在无状态组件中运行的类似redux的功能 api 。

**useReducer 基础介绍：**

```js
const [ ①state , ②dispatch ] = useReducer(③reducer)
```

① 更新之后的 state 值。

② 派发更新的 dispatchAction 函数, 本质上和 useState 的 dispatchAction 是一样的。

③ 一个函数 reducer ，我们可以认为它就是一个 redux 中的 reducer , reducer的参数就是常规reducer里面的state和action, 返回改变后的state, 这里有一个需要注意的点就是：**如果返回的 state 和之前的 state ，内存指向相同，那么组件将不会更新。**

**useReducer 基础用法：**

```js
const DemoUseReducer = ()=>{
    /* number为更新后的state值,  dispatchNumbner 为当前的派发函数 */
   const [ number , dispatchNumbner ] = useReducer((state,action)=>{
       const { payload , name  } = action
       /* return的值为新的state */
       switch(name){
           case 'add':
               return state + 1
           case 'sub':
               return state - 1
           case 'reset':
             return payload
       }
       return state
   },0)
   return <div>
      当前值：{ number }
      { /* 派发更新 */ }
      <button onClick={()=>dispatchNumbner({ name:'add' })} >增加</button>
      <button onClick={()=>dispatchNumbner({ name:'sub' })} >减少</button>
      <button onClick={()=>dispatchNumbner({ name:'reset' ,payload:666 })} >赋值</button>
      { /* 把dispatch 和 state 传递给子组件  */ }
      <MyChildren  dispatch={ dispatchNumbner } State={{ number }} />
   </div>
}
```

### 2.3 useSyncExternalStore

useSyncExternalStore 的诞生并非偶然，和 v18 的更新模式下外部数据的 tearing 有着十分紧密的关联。useSyncExternalStore 能够让 React 组件在 concurrent 模式下安全地有效地读取外接数据源，在组件渲染过程中能够检测到变化，并且在数据源发生变化的时候，能够调度更新。当读取到外部状态发生了变化，会触发一个强制更新，来保证结果的一致性。

**useSyncExternalStore 基础介绍：**

```js
useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
)
```

① subscribe 为订阅函数，当数据改变的时候，会触发 subscribe，在 useSyncExternalStore 会通过带有记忆性的 getSnapshot 来判别数据是否发生变化，如果发生变化，那么会强制更新数据。

② getSnapshot 可以理解成一个带有记忆功能的选择器。当 store 变化的时候，会通过 getSnapshot 生成新的状态值，这个状态值可提供给组件作为数据源使用，getSnapshot 可以检查订阅的值是否改变，改变的话那么会触发更新。

③ getServerSnapshot 用于 hydration 模式下的 getSnapshot。

**useSyncExternalStore 基础用法：**

```js
import { combineReducers , createStore  } from 'redux'

/* number Reducer */
function numberReducer(state=1,action){
    switch (action.type){
      case 'ADD':
        return state + 1
      case 'DEL':
        return state - 1
      default:
        return state
    }
}

/* 注册reducer */
const rootReducer = combineReducers({ number:numberReducer  })
/* 创建 store */
const store = createStore(rootReducer,{ number:1  })

function Index(){
    /* 订阅外部数据源 */
    const state = useSyncExternalStore(store.subscribe,() => store.getState().number)
    console.log(state)
    return <div>
        {state}
        <button onClick={() => store.dispatch({ type:'ADD' })} >点击</button>
    </div>
}
```

点击按钮，会触发 reducer ，然后会触发 store.subscribe 订阅函数，执行 getSnapshot 得到新的 number ，判断 number 是否发生变化，如果变化，触发更新。

### 2.4 useTransition

在 React v18 中，有一种新概念叫做过渡任务，这种任务是对比立即更新任务而产生的，通常一些影响用户交互直观响应的任务，例如按键，点击，输入等，这些任务需要视图上立即响应，所以可以称之为立即更新的任务，但是有一些更新不是那么急迫，比如页面从一个状态过渡到另外一个状态，这些任务就叫做过渡任务。 打个比方如下图当点击 tab 从 tab1 切换到 tab2 的时候，本质上产生了两个更新任务。

-  第一个就是 hover 状态由 tab1 变成 tab2。
-  第二个就是内容区域由 tab1 内容变换到 tab2 内容。

这两个任务，用户肯定希望 hover 状态的响应更迅速，而内容的响应有可能还需要请求数据等操作，所以更新状态并不是立马生效，通常还会有一些 loading 效果。所以第一个任务作为**立即执行任务**，而第二个任务就可以视为**过渡任务**。

![](image-02.webp)

**useTransition 基础介绍：**

useTransition 执行返回一个数组。数组有两个状态值：

- 第一个是，当处于过渡状态的标志——isPending。
- 第二个是一个方法，可以理解为上述的 startTransition。可以把里面的更新任务变成过渡任务。

```js
import { useTransition } from 'react'
/* 使用 */
const  [ isPending , startTransition ] = useTransition ()
```

**useTransition 基础用法：**

除了上述切换 tab 场景外，还有很多场景非常适合 useTransition 产生的过渡任务，比如输入内容，实时搜索并展示数据，这本质上也是有两个优先级的任务，第一个任务就是受控表单的实时响应；第二个就是输入内容改变,数据展示的变化。那么接下来我们写一个 demo 来看一下 useTransition 的基本使用。

```js
/* 模拟数据 */
const mockList1 = new Array(10000).fill('tab1').map((item,index)=>item+'--'+index )
const mockList2 = new Array(10000).fill('tab2').map((item,index)=>item+'--'+index )
const mockList3 = new Array(10000).fill('tab3').map((item,index)=>item+'--'+index )

const tab = {
  tab1: mockList1,
  tab2: mockList2,
  tab3: mockList3
}

export default function Index(){
  const [ active, setActive ] = React.useState('tab1') //需要立即响应的任务，立即更新任务
  const [ renderData, setRenderData ] = React.useState(tab[active]) //不需要立即响应的任务，过渡任务
  const [ isPending,startTransition  ] = React.useTransition()
  const handleChangeTab = (activeItem) => {
     setActive(activeItem) // 立即更新
     startTransition(()=>{ // startTransition 里面的任务优先级低
       setRenderData(tab[activeItem])
     })
  }
  return <div>
    <div className='tab' >
       { Object.keys(tab).map((item)=> <span className={ active === item && 'active' } onClick={()=>handleChangeTab(item)} >{ item }</span> ) }
    </div>
    <ul className='content' >
       { isPending && <div> loading... </div> }
       { renderData.map(item=> <li key={item} >{item}</li>) }
    </ul>
  </div>
}
```

如上当切换 tab 的时候，产生了两个优先级任务，第一个任务是 setActive 控制 tab active 状态的改变，第二个任务为 setRenderData 控制渲染的长列表数据 （在现实场景下长列表可能是一些数据量大的可视化图表）。

### 2.5 useDeferredValue

React 18 提供了 useDeferredValue 可以让状态滞后派生。useDeferredValue 的实现效果也类似于 transtion，当迫切的任务执行后，再得到新的状态，而这个新的状态就称之为 DeferredValue。

**useDeferredValue 基础介绍：**

useDeferredValue 和上述 useTransition 本质上有什么异同呢？

**相同点：** useDeferredValue 本质上和内部实现与 useTransition 一样都是标记成了过渡更新任务。

**不同点：** useTransition 是把 startTransition 内部的更新任务变成了过渡任务transtion,而 useDeferredValue 是把原值通过过渡任务得到新的值，这个值作为延时状态。 一个是处理一段逻辑，另一个是生产一个新的状态。

useDeferredValue 接受一个参数 value ，一般为可变的 state , 返回一个延时状态 deferrredValue。

```js
const deferrredValue = React.useDeferredValue(value)
```

**useDeferredValue 基础用法：**

接下来把上边那个例子用 useDeferredValue 来实现。

```js
export default function Index(){
  const [ active, setActive ] = React.useState('tab1') //需要立即响应的任务，立即更新任务
  const deferActive = React.useDeferredValue(active) // 把状态延时更新，类似于过渡任务
  const handleChangeTab = (activeItem) => {
     setActive(activeItem) // 立即更新
  }
  const renderData = tab[deferActive] // 使用滞后状态
  return <div>
    <div className='tab' >
       { Object.keys(tab).map((item)=> <span className={ active === item && 'active' } onClick={()=>handleChangeTab(item)} >{ item }</span> ) }
    </div>
    <ul className='content' >
       { renderData.map(item=> <li key={item} >{item}</li>) }
    </ul>
  </div>
  }
```

如上 active 为正常改变的状态，deferActive 为滞后的 active 状态，我们使用正常状态去改变 tab 的 active 状态，使用滞后的状态去更新视图，同样达到了提升用户体验的作用。

## 三 hooks 之执行副作用

### 3.1 useEffect

React hooks也提供了 api ，用于弥补函数组件没有生命周期的缺陷。其本质主要是运用了 hooks 里面的 useEffect ， useLayoutEffect，还有 useInsertionEffect。其中最常用的就是 useEffect 。我们首先来看一下 useEffect 的使用。

**useEffect 基础介绍：**

```js
useEffect(()=>{
    return destory
},dep)
```

useEffect 第一个参数 callback, 返回的 destory ， destory 作为下一次callback执行之前调用，用于清除上一次 callback 产生的副作用。

第二个参数作为依赖项，是一个数组，可以有多个依赖项，依赖项改变，执行上一次callback 返回的 destory ，和执行新的 effect 第一个参数 callback 。

对于 useEffect 执行， React 处理逻辑是采用异步调用 ，对于每一个 effect 的 callback， React 会向 setTimeout回调函数一样，放入任务队列，等到主线程任务完成，DOM 更新，js 执行完成，视图绘制完毕，才执行。所以 effect 回调函数不会阻塞浏览器绘制视图。

**useEffect 基础用法：**

```js
/* 模拟数据交互 */
function getUserInfo(a){
    return new Promise((resolve)=>{
        setTimeout(()=>{
           resolve({
               name:a,
               age:16,
           })
        },500)
    })
}

const Demo = ({ a }) => {
    const [ userMessage , setUserMessage ] :any= useState({})
    const div= useRef()
    const [number, setNumber] = useState(0)
    /* 模拟事件监听处理函数 */
    const handleResize =()=>{}
    /* useEffect使用 ，这里如果不加限制 ，会是函数重复执行，陷入死循环*/
    useEffect(()=>{
       /* 请求数据 */
       getUserInfo(a).then(res=>{
           setUserMessage(res)
       })
       /* 定时器 延时器等 */
       const timer = setInterval(()=>console.log(666),1000)
       /* 操作dom  */
       console.log(div.current) /* div */
       /* 事件监听等 */
       window.addEventListener('resize', handleResize)
         /* 此函数用于清除副作用 */
       return function(){
           clearInterval(timer)
           window.removeEventListener('resize', handleResize)
       }
    /* 只有当props->a和state->number改变的时候 ,useEffect副作用函数重新执行 ，如果此时数组为空[]，证明函数只有在初始化的时候执行一次相当于componentDidMount */
    },[ a ,number ])
    return (<div ref={div} >
        <span>{ userMessage.name }</span>
        <span>{ userMessage.age }</span>
        <div onClick={ ()=> setNumber(1) } >{ number }</div>
    </div>)
}
```

如上在 useEffect 中做的功能如下：

- ① 请求数据。
- ② 设置定时器,延时器等。
- ③ 操作 dom , 在 React Native 中可以通过 ref 获取元素位置信息等内容。
- ④ 注册事件监听器, 事件绑定，在 React Native 中可以注册 NativeEventEmitter 。
- ⑤ 还可以清除定时器，延时器，解绑事件监听器等。

### 3.2 useLayoutEffect

**useLayoutEffect 基础介绍：**

useLayoutEffect 和 useEffect 不同的地方是采用了同步执行，那么和useEffect有什么区别呢？

① 首先 useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前，这样可以方便修改 DOM，获取 DOM 信息，这样浏览器只会绘制一次，如果修改 DOM 布局放在 useEffect ，那 useEffect 执行是在浏览器绘制视图之后，接下来又改 DOM ，就可能会导致浏览器再次回流和重绘。而且由于两次绘制，视图上可能会造成闪现突兀的效果。

② useLayoutEffect callback 中代码执行会阻塞浏览器绘制。

**useEffect 基础用法：**

```js
const DemoUseLayoutEffect = () => {
    const target = useRef()
    useLayoutEffect(() => {
        /*我们需要在dom绘制之前，移动dom到制定位置*/
        const { x ,y } = getPositon() /* 获取要移动的 x,y坐标 */
        animate(target.current,{ x,y })
    }, []);
    return (
        <div >
            <span ref={ target } className="animate"></span>
        </div>
    )
}
```

### 3.3 useInsertionEffect

**useInsertionEffect 基础介绍：**

useInsertionEffect 是在 React v18 新添加的 hooks ，它的用法和 useEffect 和 useLayoutEffect 一样。那么这个 hooks 用于什么呢?

在介绍 useInsertionEffect 用途之前，先看一下 useInsertionEffect 的执行时机。

```js
React.useEffect(()=>{
    console.log('useEffect 执行')
},[])

React.useLayoutEffect(()=>{
    console.log('useLayoutEffect 执行')
},[])

React.useInsertionEffect(()=>{
    console.log('useInsertionEffect 执行')
},[])
```

打印： useInsertionEffect 执行 -> useLayoutEffect 执行 -> useEffect 执行

可以看到 useInsertionEffect 的执行时机要比 useLayoutEffect 提前，useLayoutEffect 执行的时候 DOM 已经更新了，但是在 useInsertionEffect 的执行的时候，DOM 还没有更新。本质上 useInsertionEffect 主要是解决 CSS-in-JS 在渲染中注入样式的性能问题。这个 hooks 主要是应用于这个场景，在其他场景下 React 不期望用这个 hooks 。

**useInsertionEffect 模拟使用：**

```js
export default function Index(){

  React.useInsertionEffect(()=>{
     /* 动态创建 style 标签插入到 head 中 */
     const style = document.createElement('style')
     style.innerHTML = `
       .css-in-js{
         color: red;
         font-size: 20px;
       }
     `
     document.head.appendChild(style)
  },[])

  return <div className="css-in-js" > hello , useInsertionEffect </div>
}
```

如上模拟了 useInsertionEffect 的使用。

## 四 hooks 之状态获取与传递

### 4.1 useContext

**useContext 基础介绍**

可以使用 useContext ，来获取父级组件传递过来的 context 值，这个当前值就是最近的父级组件 Provider 设置的 value 值，useContext 参数一般是由 createContext 方式创建的 ,也可以父级上下文 context 传递的 ( 参数为 context )。useContext 可以代替 context.Consumer 来获取 Provider 中保存的 value 值。

```js
const contextValue = useContext(context)
```

useContext 接受一个参数，一般都是 context 对象，返回值为 context 对象内部保存的 value 值。

**useContext 基础用法：**

```js
/* 用useContext方式 */
const DemoContext = ()=> {
    const value:any = useContext(Context)
    /* my name is alien */
return <div> my name is { value.name }</div>
}

/* 用Context.Consumer 方式 */
const DemoContext1 = ()=>{
    return <Context.Consumer>
         {/*  my name is alien  */}
        { (value)=> <div> my name is { value.name }</div> }
    </Context.Consumer>
}

export default ()=>{
    return <div>
        <Context.Provider value={{ name:'alien' , age:18 }} >
            <DemoContext />
            <DemoContext1 />
        </Context.Provider>
    </div>
}
```

### 4.2 useRef

**useRef 基础介绍：**

useRef 可以用来获取元素，缓存状态，接受一个状态 initState 作为初始值，返回一个 ref 对象 cur, cur 上有一个 current 属性就是 ref 对象需要获取的内容。

```js
const cur = React.useRef(initState)
console.log(cur.current)
```

**useRef 基础用法：**

**useRef 获取 DOM 元**素，在 React Native 中虽然没有 DOM 元素，但是也能够获取组件的节点信息（ fiber 信息 ）。

```js
const DemoUseRef = ()=>{
    const dom= useRef(null)
    const handerSubmit = ()=>{
        /*  <div >表单组件</div>  dom 节点 */
        console.log(dom.current)
    }
    return <div>
        {/* ref 标记当前dom节点 */}
        <div ref={dom} >表单组件</div>
        <button onClick={()=>handerSubmit()} >提交</button>
    </div>
}
```

如上通过 useRef 来获取 DOM 节点。

**useRef 保存状态，** 可以利用 useRef 返回的 ref 对象来保存状态，只要当前组件不被销毁，那么状态就会一直存在。

```js
const status = useRef(false)
/* 改变状态 */
const handleChangeStatus = () => {
  status.current = true
}
```

### 4.3 useImperativeHandle

**useImperativeHandle 基础介绍：**

useImperativeHandle 可以配合 forwardRef 自定义暴露给父组件的实例值。这个很有用，我们知道，对于子组件，如果是 class 类组件，我们可以通过 ref 获取类组件的实例，但是在子组件是函数组件的情况，如果我们不能直接通过 ref 的，那么此时 useImperativeHandle 和 forwardRef 配合就能达到效果。

useImperativeHandle 接受三个参数：

- ① 第一个参数ref: 接受 forWardRef 传递过来的 ref。
- ② 第二个参数 createHandle ：处理函数，返回值作为暴露给父组件的 ref 对象。
- ③ 第三个参数 deps : 依赖项 deps ，依赖项更改形成新的 ref 对象。

**useImperativeHandle 基础用法：**

我们来模拟给场景，用useImperativeHandle，使得父组件能让子组件中的input自动赋值并聚焦。

```js
function Son (props,ref) {
    console.log(props)
    const inputRef = useRef(null)
    const [ inputValue , setInputValue ] = useState('')
    useImperativeHandle(ref,()=>{
       const handleRefs = {
           /* 声明方法用于聚焦input框 */
           onFocus(){
              inputRef.current.focus()
           },
           /* 声明方法用于改变input的值 */
           onChangeValue(value){
               setInputValue(value)
           }
       }
       return handleRefs
    },[])
    return <div>
        <input
            placeholder="请输入内容"
            ref={inputRef}
            value={inputValue}
        />
    </div>
}

const ForwarSon = forwardRef(Son)

class Index extends React.Component{
    inputRef = null
    handerClick(){
       const { onFocus , onChangeValue } =this.cur
       onFocus()
       onChangeValue('let us learn React!')
    }
    render(){
        return <div style={{ marginTop:'50px' }} >
            <ForwarSon ref={node => (this.inputRef = node)} />
            <button onClick={this.handerClick.bind(this)} >操控子组件</button>
        </div>
    }
}
```

效果：

![](image-03.webp)

## 五 hooks 之状态派生与保存

### 5.1 useMemo

useMemo 可以在函数组件 render 上下文中同步执行一个函数逻辑，这个函数的返回值可以作为一个新的状态缓存起来。那么这个 hooks 的作用就显而易见了：

场景一：在一些场景下，需要在函数组件中进行大量的逻辑计算，那么我们不期望每一次函数组件渲染都执行这些复杂的计算逻辑，所以就需要在 useMemo 的回调函数中执行这些逻辑，然后把得到的产物（计算结果）缓存起来就可以了。

场景二：React 在整个更新流程中，diff 起到了决定性的作用，比如 Context 中的 provider 通过 diff value 来判断是否更新

**useMemo 基础介绍：**

```js
const cacheSomething = useMemo(create,deps)
```

- ① create：第一个参数为一个函数，函数的返回值作为缓存值，如上 demo 中把 Children 对应的 element 对象，缓存起来。
- ② deps： 第二个参数为一个数组，存放当前 useMemo 的依赖项，在函数组件下一次执行的时候，会对比 deps 依赖项里面的状态，是否有改变，如果有改变重新执行 create ，得到新的缓存值。
- ③ cacheSomething：返回值，执行 create 的返回值。如果 deps 中有依赖项改变，返回的重新执行 create 产生的值，否则取上一次缓存值。

**useMemo 基础用法：**

派生新状态：

```js
function Scope() {
    const keeper = useKeep()
    const { cacheDispatch, cacheList, hasAliveStatus } = keeper

    /* 通过 useMemo 得到派生出来的新状态 contextValue  */
    const contextValue = useMemo(() => {
        return {
            cacheDispatch: cacheDispatch.bind(keeper),
            hasAliveStatus: hasAliveStatus.bind(keeper),
            cacheDestory: (payload) => cacheDispatch.call(keeper, { type: ACTION_DESTORY, payload })
        }

    }, [keeper])
    return <KeepaliveContext.Provider value={contextValue}>
    </KeepaliveContext.Provider>
}
```

如上通过 useMemo 得到派生出来的新状态 contextValue ，只有 keeper 变化的时候，才改变 Provider 的 value 。

缓存计算结果：

```js
function Scope(){
    const style = useMemo(()=>{
      let computedStyle = {}
      // 经过大量的计算
      return computedStyle
    },[])
    return <div style={style} ></div>
}
```

缓存组件,减少子组件 rerender 次数：

```js
function Scope ({ children }){
   const renderChild = useMemo(()=>{ children()  },[ children ])
   return <div>{ renderChild } </div>
}
```

### 5.2 useCallback

**useCallback 基础介绍：**

useMemo 和 useCallback 接收的参数都是一样，都是在其依赖项发生变化后才执行，都是返回缓存的值，区别在于 useMemo 返回的是函数运行的结果，useCallback 返回的是函数，这个回调函数是经过处理后的也就是说父组件传递一个函数给子组件的时候，由于是无状态组件每一次都会重新生成新的 props 函数，这样就使得每一次传递给子组件的函数都发生了变化，这时候就会触发子组件的更新，这些更新是没有必要的，此时我们就可以通过 usecallback 来处理此函数，然后作为 props 传递给子组件。

**useCallback 基础用法：**

```js
/* 用react.memo */
const DemoChildren = React.memo((props)=>{
   /* 只有初始化的时候打印了 子组件更新 */
    console.log('子组件更新')
   useEffect(()=>{
       props.getInfo('子组件')
   },[])
   return <div>子组件</div>
})

const DemoUseCallback=({ id })=>{
    const [number, setNumber] = useState(1)
    /* 此时usecallback的第一参数 (sonName)=>{ console.log(sonName) }
     经过处理赋值给 getInfo */
    const getInfo  = useCallback((sonName)=>{
          console.log(sonName)
    },[id])
    return <div>
        {/* 点击按钮触发父组件更新 ，但是子组件没有更新 */}
        <button onClick={ ()=>setNumber(number+1) } >增加</button>
        <DemoChildren getInfo={getInfo} />
    </div>
}
```

## 六 hooks 之工具 hooks

### 6.1 useDebugValue

> 我们不推荐你向每个自定义 Hook 添加 debug 值。当它作为共享库的一部分时才最有价值。在某些情况下，格式化值的显示可能是一项开销很大的操作。除非需要检查 Hook，否则没有必要这么做。因此，useDebugValue 接受一个格式化函数作为可选的第二个参数。该函数只有在 Hook 被检查时才会被调用。它接受 debug 值作为参数，并且会返回一个格式化的显示值。

**useDebugValue 基础介绍：**

useDebugValue 可用于在 React 开发者工具中显示自定义 hook 的标签。这个hooks目的就是检查自定义hooks。

**useDebugValue 基本使用：**

```js
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  // ...
  // 在开发者工具中的这个 Hook 旁边显示标签
  // e.g. "FriendStatus: Online"
  useDebugValue(isOnline ? 'Online' : 'Offline');

  return isOnline;
}
```

### 6.2 useId

**useID 基础介绍:**

useId 也是 React v18 产生的新的 hooks , 它可以在 client 和 server 生成唯一的 id , 解决了在服务器渲染中，服务端和客户端产生 id 不一致的问题，更重要的是保障了 React v18 中 **streaming renderer （流式渲染）** 中 id 的稳定性。

**低版本 React ssr 存在的问题：**

比如在一些项目或者是开源库中用 Math.random() 作为 ID 的时候，可以会有一些随机生成 id 的场景：

```js
const rid = Math.random() + '_id_'  /* 生成一个随机id  */
function Demo (){
   // 使用 rid
   return <div id={rid} ></div>
}
```

这在纯客户端渲染中没有问题，但是在服务端渲染的时候，传统模式下需要走如下流程：

![](image-04.webp)

在这个过程中，当服务端渲染到 html 和 hydrate 过程分别在服务端和客户端进行，但是会走两遍 id 的生成流程，这样就会造成 id不一致的情况发生。useId 的出现能有效的解决这个问题。

**useId 基本用法:**

```js
function Demo (){
   const rid = useId() // 生成稳定的 id
   return <div id={rid} ></div>
}
```

**v18 ssr**

在 React v18 中 对 ssr 增加了流式渲染的特性 [New Suspense SSR Architecture in React 18](https://github.com/reactwg/react-18/discussions/37) ， 那么这个特性是什么呢？我们来看一下：

在传统 React ssr 中，如果正常情况下， hydrate 过程如下所示：

![](image-05.webp)

刚开始的时候，因为服务端渲染，只会渲染 html 结构，此时还没注入 js 逻辑，所以我们把它用灰色不能交互的模块表示。（如上灰色的模块不能做用户交互，比如点击事件之类的。）

hydrate js 加载之后，此时的模块可以正常交互，所以用绿色的模块展示。

但是如果其中一个模块，服务端请求数据，数据量比较大，耗费时间长，我们不期望在服务端完全形成 html 之后在渲染，那么 React 18 给了一个新的可能性。可以使用 包装页面的一部分，然后让这一部分的内容先挂起。

接下来会通过 script 加载 js 的方式 流式注入 html 代码的片段，来补充整个页面。接下来的流程如下所示：

![](image-06.webp)

在这个原理基础之上， React 个特性叫 Selective Hydration，可以**根据用户交互改变 hydrate 的顺序**。

比如有两个模块都是通过 Suspense 挂起的，当两个模块发生交互逻辑时，会根据交互来选择性地改变 hydrate 的顺序。

![](image-07.webp)

如上 C D 选择性的 hydrate 就是 Selective Hydration 的结果。那么回到主角 useId 上，如果在 hydrate 过程中，C D 模块 id 是动态生成的，比如如下：

```js
let id = 0
function makeId(){
  return id++
}
function Demo(){
  const id = useRef( makeId() )
  return <div id={id}  >...</div>
}
```

那么如果组件是 Selective Hydration , 那么注册组件的顺序服务端和客户端有可能不统一，这样表现就会不一致了。那么用 useId 动态生成 id 就不会有这个问题产生了，所以说 useId 保障了 React v18 中 **streaming renderer （流式渲染）** 中 id 的稳定性。

## 常见考点

## **1. Hooks 的基本概念**

### **考察点：**

- 什么是 Hooks？为什么 React 引入 Hooks？
- Hooks 的使用规则（只能在顶层调用、只能在函数组件中使用）
- Hooks 和类组件的生命周期对比

### **示例问题：**

- 为什么 React 引入 Hooks？它解决了什么问题？
- React Hooks 有哪些使用限制？

**示例代码：**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Click: {count}</button>;
}
```

---

## **2. 常见的核心 Hooks**

React 提供了多个内置 Hooks，面试中最常考的包括：

### **(1) `useState`**

### **考察点：**

- `useState` 的基本用法
- 什么时候使用函数式更新？
- `useState` 里的值为什么不能直接修改？

### **示例问题：**

- `useState` 更新状态是同步还是异步的？
- 下面代码有什么问题？

```jsx
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(count + 1);
console.log(count);
```

- 如何正确更新 `count` ？

**正确示例（使用函数式更新）：**

```jsx
setCount(prevCount => prevCount + 1);
setCount(prevCount => prevCount + 1);
```

---

### **(2) `useEffect`**

### **考察点：**

- `useEffect` 依赖数组 `[ ]`、`[deps]` 和无依赖时的区别
- 如何模拟 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount`
- `useEffect` 中 `return` 函数的作用（清理副作用）
- `useLayoutEffect` 和 `useEffect` 的区别

### **示例问题：**

- `useEffect(() => {}, [])` 和 `useEffect(() => {}, [deps])` 的区别？
- 下面代码会触发无限循环吗？

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]);
```

**正确写法（避免无限循环）：**

```jsx
useEffect(() => {
  setCount(prevCount => prevCount + 1);
}, []);
```

---

### **(3) `useRef`**

### **考察点：**

- `useRef` 如何获取 DOM 元素？
- `useRef` 和 `useState` 的区别？
- `useRef` 什么时候会引发重新渲染？

### **示例问题：**

- `useRef` 的值变了会触发组件重新渲染吗？
- `useRef` 在哪些场景下使用？

**示例代码（获取 DOM 元素）：**

```jsx
const inputRef = useRef(null);
useEffect(() => {
  inputRef.current.focus();
}, []);
return <input ref={inputRef} />;
```

---

### **(4) `useMemo` & `useCallback`**

### **考察点：**

- `useMemo` 和 `useCallback` 的区别？
- 如何避免不必要的组件重新渲染？
- `useMemo` 的返回值会缓存多久？

### **示例问题：**

- `useMemo` 什么时候使用？能优化什么问题？
- `useMemo(() => computeExpensiveValue(), [deps])` 和 `computeExpensiveValue()` 有什么区别？

**示例代码（缓存计算结果）：**

```jsx
const memoizedValue = useMemo(() => expensiveFunction(a, b), [a, b]);
```

**示例代码（缓存函数）：**

```jsx
const memoizedCallback = useCallback(() => handleClick(id), [id]);
```

---

### **(5) `useContext`**

### **考察点：**

- `useContext` 如何替代 `props` 传递？
- `useContext` 什么时候会重新渲染？

### **示例问题：**

- `useContext` 什么时候会导致组件重新渲染？
- `useContext` 和 `Redux` 该如何选择？

**示例代码（使用 `useContext` 共享数据）：**

```jsx
const ThemeContext = React.createContext('light');
const theme = useContext(ThemeContext);
```

---

### **(6) `useReducer`**

### **考察点：**

- `useReducer` 和 `useState` 的区别？
- 适合用 `useReducer` 的场景？
- `useReducer` 如何搭配 `useContext` 使用？

### **示例问题：**

- `useReducer` 和 `Redux` 的区别是什么？
- 如何使用 `useReducer` 管理复杂的状态？

**示例代码（用 `useReducer` 代替 `useState`）：**

```jsx
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    default: return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0 });
```

---

## **3. 自定义 Hooks**

### **考察点：**

- 如何封装一个 `useFetch` 自定义 Hook？
- 如何避免自定义 Hook 里的闭包陷阱？
- 如何在自定义 Hook 里使用 `useRef` 和 `useMemo`？

### **示例问题：**

- 什么情况下你会封装一个自定义 Hook？
- 如何在自定义 Hook 里处理副作用？

**示例代码（封装 `useFetch`）：**

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  return data;
}
```

---

## **4. Hooks 相关的常见问题**

### **(1) Hooks 规则**

- 只能在函数组件或自定义 Hook 顶层调用
- 不能在 `if` 语句、循环里调用

### **(2) `useState` 和 `useRef` 的区别**

| `useState` | `useRef` |
| --- | --- |
| 触发重新渲染 | 不会触发重新渲染 |
| 值存在组件的 `state` 里 | 值存在 `ref` 对象的 `current` 里 |

### **(3) `useEffect` 的依赖**

```jsx
useEffect(() => {
  console.log(count);
}, [count]); // 依赖 count，每次 count 变化时执行
```

- 依赖数组为空 `[]` -> 只在组件挂载时执行
- 没有依赖数组 -> 每次渲染都会执行
- 依赖 `[count]` -> `count` 变化时执行

---

## **5. Hooks 的性能优化**

### **考察点：**

- 避免不必要的 `useEffect`
- 使用 `useMemo` 缓存计算
- 使用 `useCallback` 避免函数重复创建
- 使用 `React.memo` 避免子组件重复渲染

### **示例问题：**

- `useEffect` 里如何避免不必要的 API 请求？
- `useMemo` 为什么能提高性能？
