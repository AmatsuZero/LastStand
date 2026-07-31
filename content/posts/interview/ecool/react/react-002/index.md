+++
title = "元素、组件、实例和节点"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2024-12-26T00:00:00+08:00'
draft = true
weight = 2
tags = ["面试", "前端", "React", "元素、组件、实例和节点", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
React 中的元素、组件、实例和节点，是React中关系密切的4个概念，也是很容易让React 初学者迷惑的4个概念。现在，老干部就来详细地介绍这4个概念，以及它们之间的联系和区别，满足喜欢咬文嚼字、刨根问底的同学（老干部就是其中一员）的好奇心。

#### 元素 (Element)

**React 元素其实就是一个简单JavaScript对象，一个React 元素和界面上的一部分DOM对应，描述了这部分DOM的结构及渲染效果**。一般我们通过JSX语法创建React 元素，例如：

```js
const element = <h1 className='greeting'>Hello, world</h1>;
```

element是一个React 元素。在编译环节，JSX 语法会被编译成对React.createElement()的调用，从这个函数名上也可以看出，JSX语法返回的是一个React 元素。上面的例子编译后的结果为：

```js
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

最终，element的值是类似下面的一个简单JavaScript对象：

```js
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world'
  }
}
```

React 元素可以分为两类：DOM类型的元素和组件类型的元素。DOM类型的元素使用像h1、div、p等DOM节点创建React 元素，前面的例子就是一个DOM类型的元素；组件类型的元素使用React 组件创建React 元素，例如：

```js
const buttonElement = <Button color='red'>OK</Button>;
```

buttonElement就是一个组件类型的元素，它的值是：

```js
const buttonElement = {
  type: 'Button',
  props: {
    color: 'red',
    children: 'OK'
  }
}
```

对于DOM类型的元素，因为和页面的DOM节点直接对应，所以React知道如何进行渲染。但是对于组件类型的元素，如buttonElement，React是无法直接知道应该把buttonElement渲染成哪种结构的页面DOM，这时就需要组件自身提供React能够识别的DOM节点信息，具体实现方式在介绍组件时会详细介绍。

有了React 元素，我们应该如何使用它呢？其实，绝大多数情况下，我们都不会直接使用React 元素，React 内部会自动根据React 元素，渲染出最终的页面DOM。更确切地说，React元素描述的是React虚拟DOM的结构，React会根据虚拟DOM渲染出页面的真实DOM。

#### 组件 (Component)

React 组件，应该是大家最熟悉的React中的概念。React通过组件的思想，将界面拆分成一个个可以复用的模块，每一个模块就是一个React 组件。一个React 应用由若干组件组合而成，一个复杂组件也可以由若干简单组件组合而成。

React组件和React元素关系密切，**React组件最核心的作用是返回React元素**。这里你也许会有疑问：React元素不应该是由React.createElement() 返回的吗？但React.createElement()的调用本身也是需要有“人”负责的，React组件正是这个“责任人”。React组件负责调用React.createElement()，返回React元素，供React内部将其渲染成最终的页面DOM。

既然组件的核心作用是返回React元素，那么最简单的组件就是一个返回React元素的函数：

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

Welcome是一个用函数定义的组件。如果使用类（class）定义组件，返回React元素的工作具体就由组件的render方法承担，例如：

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

其实，使用类定义的组件，render方法是唯一必需的方法，其他组件的生命周期方法都只不过是为render服务而已，都不是必需的。

现在来考虑下面这个例子：

```js
class Home extends React.Component {
  render() {
    return (
      <div>
        <Welcome name='老干部' />
        <p>Anything you like</p>
      </div>
    )
  }
}
```

Home 组件使用了Welcome组件，返回的React元素为：

```js
{
  type: 'div',
  props: {
    children: [
      {
        type: 'Welcome',
        props: {
          name: '老干部'
        }
      },
      {
        type: 'p',
        props: {
          children: 'Anything you like'
        }
      }，
    ]
  }
}
```

对于这个结构，React 知道如何渲染type = 'div' 和 type = 'p' 的节点，但不知道如何渲染type='Welcome'的节点，当React 发现Welcome 是一个React 组件时（判断依据是Welcome首字母为大写），会根据Welcome组件返回的React 元素决定如何渲染Welcome节点。Welcome组件返回的React 元素为：

```js
{
  type: 'h1',
  props: {
    children: 'Hello, 老干部'
  }
}
```

这个结构中只包含DOM节点，React是知道如何渲染的。如果这个结构中还包含其他组件节点，React 会重复上面的过程，继续解析对应组件返回的React 元素，直到返回的React 元素中只包含DOM节点为止。这样的递归过程，让React 获取到页面的完整DOM结构信息，渲染的工作自然就水到渠成了。

另外，如果仔细思考的话，可以发现，**React 组件的复用，本质上是为了复用这个组件返回的React 元素，React 元素是React 应用的最基础组成单位**。

#### 实例 (Instance）

这里的实例特指React组件的实例。React 组件是一个函数或类，实际工作时，发挥作用的是React 组件的实例对象。只有组件实例化后，每一个组件实例才有了自己的props和state，才持有对它的DOM节点和子组件实例的引用。在传统的面向对象的开发方式中，实例化的工作是由开发者自己手动完成的，但在React中，组件的实例化工作是由React自动完成的，组件实例也是直接由React管理的。换句话说，开发者完全不必关心组件实例的创建、更新和销毁。

#### 节点 (Node)

在使用PropTypes校验组件属性时，有这样一种类型：

```js
MyComponent.propTypes = {
  optionalNode: PropTypes.node,
}
```

PropTypes.node又是什么类型呢？这表明optionalNode是一个React 节点。React 节点是指可以被React渲染的数据类型，包括数字、字符串、React 元素，或者是一个包含这些类型数据的数组。例如：

```js
// 数字类型的节点
function MyComponent(props) {
  return 1;
}

// 字符串类型的节点
function MyComponent(props) {
  return 'MyComponent';
}

// React元素类型的节点
function MyComponent(props) {
  return <div>React Element</div>;
}

// 数组类型的节点，数组的元素只能是其他合法的React节点
function MyComponent(props) {
  const element = <div>React Element</div>;
  const arr = [1, 'MyComponent', element];
  return arr;
}

// 错误，不是合法的React节点
function MyComponent(props) {
  const obj = { a : 1}
  return obj;
}
```

最后总结一下，React 元素和组件的概念最重要，也最容易混淆；React 组件实例的概念大家了解即可，几乎使用不到；React 节点有一定使用场景，但看过本文后应该也就不存在理解问题了。

## 常见考点

### **1. React 元素（Element）**

**React 元素**是构建 React 应用的最小单位，它是 JavaScript 对象，代表了 UI 的一种描述，类似于虚拟 DOM。React 元素包含了组件的结构、样式和属性，但它不是 DOM 节点。

- **基本概念**：React 元素是不可变的，一旦创建就不能修改它的子元素或属性。React 会使用这些元素描述来渲染 UI。<br>
  - **考察点**：候选人是否知道 React 元素与 DOM 元素的区别，理解 React 元素是如何构成的。
  - **示例问题**：<br>
    - 什么是 React 元素？它和 DOM 元素有什么区别？
    - 解释 React 元素的不可变性。如何使用 JSX 创建一个 React 元素？
- **创建方式**：React 元素可以通过 `React.createElement` 或 JSX 来创建。<br>
  - **考察点**：候选人应该理解 JSX 语法最终会转化为 `React.createElement` 调用，并且能够手动写出 `createElement` 的代码。
  - **示例问题**：<br>
    - 请写出一个 JSX 元素和一个 `React.createElement` 元素等效的代码。
- **虚拟 DOM**：React 元素是虚拟 DOM 的一部分，React 会根据这些元素构建虚拟 DOM 树，从而对比实际 DOM 的变化并进行高效更新。<br>
  - **考察点**：候选人是否理解虚拟 DOM 是如何通过 React 元素描述 UI，并与真实 DOM 进行对比更新的。
  - **示例问题**：<br>
    - React 的虚拟 DOM 是如何工作的？React 元素如何与虚拟 DOM 关联？

---

### **2. React 组件（Component）**

React 组件是 React 应用的核心单位，它是一个 JavaScript 类或函数，控制着视图的渲染。组件可以接受 `props`（外部数据）和 `state`（内部状态）来控制它的输出。

-  **基本概念**：组件是 UI 的抽象，通常会返回一个 React 元素，并将其渲染到页面中。组件有两种类型：**类组件**和**函数组件**。<br>
  - **考察点**：候选人是否理解组件的生命周期，`props` 和 `state`，以及它们如何影响组件的渲染。
  - **示例问题**：<br>
    - 什么是 React 组件？组件是如何接受和使用 `props` 和 `state` 的？
    - 函数组件与类组件的主要区别是什么？如何实现相同的功能？
-  **生命周期**：类组件有生命周期方法（如 `componentDidMount`、`shouldComponentUpdate` 等），而函数组件可以通过 Hooks（如 `useEffect`）来处理副作用。<br>
  - **考察点**：候选人是否知道组件的生命周期方法，以及如何使用 Hooks 处理副作用。
  - **示例问题**：<br>
    - React 组件的生命周期方法有哪些？它们分别在什么时机执行？
    - 如何在函数组件中模拟类组件的生命周期？
-  **高阶组件（HOC）**：高阶组件是一个函数，它接受一个组件并返回一个新的组件，通常用于增强或修改组件的行为。<br>
  - **考察点**：候选人是否了解高阶组件的概念，以及如何使用它来增强组件的功能。
  - **示例问题**：<br>
    - 什么是高阶组件（HOC）？它是如何工作的？

---

### **3. React 实例（Instance）**

React 实例通常指的是一个组件的实例。对于类组件，实例是该组件类的一个对象，可以通过该对象访问组件的状态、方法等。

-  **基本概念**：组件实例代表了组件在 UI 中的一个实际存在，每次组件渲染时都会生成一个新的实例。<br>
  - **考察点**：候选人是否理解组件实例是如何产生的，类组件和函数组件的实例化方式是否有区别。
  - **示例问题**：<br>
    - 在 React 中，如何获取一个类组件的实例？函数组件有实例吗？
-  **实例方法**：类组件的实例具有一些方法，比如 `setState`，`forceUpdate` 等，可以通过这些方法来更新组件的状态和强制刷新组件。<br>
  - **考察点**：候选人是否理解如何使用组件实例中的方法来更新组件。
  - **示例问题**：<br>
    - 你如何在类组件中访问组件实例？`this.setState()` 和 `this.forceUpdate()` 的区别是什么？
-  **组件实例的生命周期**：实例在组件挂载、更新和卸载过程中会经历不同的生命周期阶段。<br>
  - **考察点**：候选人是否了解组件实例在整个生命周期中的行为，尤其是组件的挂载和卸载过程。
  - **示例问题**：<br>
    - 当组件实例被销毁时，会发生什么？React 如何清理组件的资源？

---

### **4. React 节点（Node）**

React 节点是指 React 元素在页面上渲染后的实际 DOM 节点，React 会将虚拟 DOM 转换为真实 DOM。

-  **基本概念**：React 节点是虚拟 DOM 与实际 DOM 之间的桥梁，它是真实的 DOM 元素，代表了 React 元素渲染后的最终输出。<br>
  - **考察点**：候选人是否知道 React 节点与 React 元素的区别，以及节点是如何与虚拟 DOM 进行交互的。
  - **示例问题**：<br>
    - React 元素和 React 节点有什么区别？
    - 你如何访问 React 节点（DOM 节点）？
-  **渲染到 DOM**：React 通过 `ReactDOM.render` 将虚拟 DOM 渲染成真实的 DOM 节点，并将其插入到页面中。<br>
  - **考察点**：候选人是否理解 `ReactDOM.render` 的工作原理，以及它如何将虚拟 DOM 转换为实际的 DOM 元素。
  - **示例问题**：<br>
    - `ReactDOM.render` 是如何工作的？它将虚拟 DOM 转换为实际 DOM 的过程是什么？
-  **节点与组件的关系**：组件通过返回 React 元素来定义它们的视图结构，而元素最终会被转换成 DOM 节点显示在页面上。<br>
  - **考察点**：候选人是否理解组件与节点之间的关系，并知道如何管理节点的更新。
  - **示例问题**：<br>
    - 组件中的 React 元素如何转化为实际 DOM 节点？React 是如何管理节点的更新的？
