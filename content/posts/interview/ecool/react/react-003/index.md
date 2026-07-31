+++
title = "state 与 props"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-01-07T00:00:00+08:00'
draft = true
weight = 3
tags = ["面试", "前端", "React", "state 与 props", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## state

### 基本定义

state是组件内部的状态（数据），不能够直接修改，必须要通过setState来改变值的状态，从而达到更新组件内部数据的作用。

## props

### 基本定义

props是指组件间传递的一种方式，props自然也可以传递state。由于React的数据流是自上而下的，所以是从父组件向子组件进行传递；另外组件内部的this.props属性是只读的不可修改。

## 代码示例

```js
// 父组件
import stateJj from './stateJj.js'; // 引入子组件
class stateJjFather extends React.Component {
    constructor(props) {
        super(props);
        // 设置state的默认值 且只能在constructor中设置
        this.state = {
            mes: '给子组件的信息',
            obj： {

            },
            arr: []
        }
    }
    fun(e) {

    }
    render() {
        const {mes, obj, arr} = this.state;
        return (
            <div>
                // 不写箭头函数 this指向会发生错误 也可以使用bind的方式绑定this
                <stateJj name={'给子组件的信息'} name1={mes}  fun={(e) => this.fun(e)}  obj={obj}  arr={arr} />
            </div>
        );
    }
}
// 子组件
class stateJj extends React.Component {
    constructor(props) {
        super(props);
        this.props; // 这里面就有父组件传的值
        // 设置 默认state
        this.state = {
            text: props.initialValue || 'placeholder'
        };

        // ES6 类中函数必须手动绑定
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            text: event.target.value
        });
    }

    render() {
        return (
            <div>
                {mes}
            </div>
        );
    }
}
// 设置props值的类型
stateJj.propTypes = {
    optionalArray: PropTypes.array,
    optionalBool: PropTypes.bool,
    optionalFunc: PropTypes.func,
    optionalNumber: PropTypes.number,
    optionalObject: PropTypes.object,
    optionalString: PropTypes.string,
    optionalSymbol: PropTypes.symbol,   // 目前可以声明的所有变量类型
};
// 设置默认的props值
stateJj.defaultProps = {
};
```

## props的特性

1. 只读性

props经常被用作渲染组件和初始化状态，当一个组件被实例化之后，它的props是只读的，不可改变的。如果props在渲染过程中可以被改变，会导致这个组件显示的形态变得不可预测。只有通过父组件重新渲染的方式才可以把新的props传入组件中。

2. 不变性

只能通过外部组件主动传入新的props来重新渲染子组件，否则子组件的props以及展现形式不会改变。

## 通过setState改变state的值

state不同于props的一点是，state是可以被改变的。不过，不可以直接通过this.state=的方式来修改，而需要通过this.setState()方法来修改state。

注意： state 只能在constructor中设置默认值

### setState基础用法

通常我们通过ajax请求数据后，在走通请求后，通过setState方法改变state的值,React会更新组件的数据状态state，并且重新调用render方法，也就是会对组件进行重新渲染。

```js
    // 这是封装的fetch方法
    APIHelper.shipInfo({
        shipName: value
    }).then(res => {
        let datas = res.data;
        this.setState({
            dataList: datas,
        })
    }).catch(err => {
        this.setState({
            isLoading: false,ue
        });
    })
```

### setState使用的注意事项

1. 当我们调用这个函数的时候，React.js 会更新组件的状态 state ，并且重新调用 render 方法，然后再把 render 方法所渲染的最新的内容显示到页面上
2. React.js 并不会马上修改 state。而是把这个对象放到一个更新队列里面，稍后才会从队列当中把新的状态提取出来合并到 state 当中，然后再触发组件更新，也就是说setState的更新是异步的

### 即时更新state的方法：

1. 使用setState的第二个参数

```js
    setState({
       mes: '123'
    }, function() {
        console.log(this.state.mes); // 此时state中的mes为 123
    });
```

2. 使用react监测不到的方法调用setState

```js
    setTimeOut(function() {
        setState({
            mes: 123
        })
    }, 500); // 里面的值会即时更新 因为react并能监测定时器、延时器里面的方法

    // 在调用事件的时候使用原生事件
    componentDidMount() {
      document.querySelector('#btn-raw').addEventListener('click', this.onClick);
    }
    onClick() {
      this.setState({count: this.state.count + 1});
      console.log('# this.state', this.state);  // 打印的为即时值
    }
    // ......
    render() {
      console.log('#enter render');
      return (
        <div>
          <div>{this.state.count}
            <button id="btn-raw">Increment Raw</button>
          </div>
        </div>
      )
    }

```

## 总结

1. props用于定义外部接口，state用于记录内部状态
2. props的赋值在于外部世界使用组件，state的赋值在于组件内部
3. 组件不应该改变props的值，而state存在的目的就是让组件来修改的
4. state 只能在constructor中设置默认值
5. setState修改state的值是异步的

## 常见考点

### **1. `state` 和 `props` 的基本概念与区别**

- **`state`**：用于存储组件内部的可变数据。`state` 是局部的，每个组件可以有自己的状态，且可以在组件内部被修改。
- **`props`**：用于传递父组件到子组件的数据，是只读的，子组件不能修改 `props`。

**考察点**：

- **`state` 与 `props` 的区别**：什么时候使用 `state`，什么时候使用 `props`？
- **如何通过 `state` 更新组件的渲染？**
- **`props` 是只读的，为什么？如何改变传递给子组件的 `props`？**

**示例问题**：

- `state` 和 `props` 有什么区别？什么时候应该使用 `state`，什么时候应该使用 `props`？
- 你如何在 React 中改变 `state`？

**代码示例**：

```javascript
// state 示例
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

// props 示例
function ChildComponent(props) {
  return <h1>{props.message}</h1>;
}

function ParentComponent() {
  return <ChildComponent message="Hello, World!" />;
}
```

---

### **2. `state` 的更新**

React 的 **`setState`** 方法用于更新组件的 `state`，而 `setState` 是异步的，这意味着 React 会批量处理 `setState` 的调用。

**考察点**：

- **`setState` 是异步的**：候选人需要理解 `setState` 可能不会立刻更新 `state`，而是会被 React 合并并异步更新。
- **`setState` 的回调函数**：`setState` 提供了一个回调函数，可以在状态更新并重新渲染后执行某些操作。
- **`prevState` 和 `state` 的更新**：如何使用 `prevState` 来确保更新是基于最新的 `state`。

**示例问题**：

- `setState` 是同步还是异步的？为什么它是异步的？
- 如何确保在更新 `state` 时使用最新的 `state` 值？

**代码示例**：

```javascript
this.setState((prevState) => ({
  count: prevState.count + 1
}), () => {
  console.log('State updated');
});
```

---

### **3. `props` 的传递与更新**

`props` 是从父组件传递到子组件的数据，子组件不能直接修改 `props`，但可以根据 `props` 来渲染 UI。

**考察点**：

- **`props` 是只读的**：如何确保子组件不能直接修改 `props`？
- **如何通过 `props` 将数据传递给子组件？**
- **`props` 和 `state` 的关系**：当 `props` 改变时，组件如何重新渲染？

**示例问题**：

- 如果你需要在子组件中修改 `props`，该如何做？
- 组件在渲染时，`props` 和 `state` 会有何影响？

**代码示例**：

```javascript
function ChildComponent(props) {
  return <h1>{props.name}</h1>;
}

function ParentComponent() {
  const [name, setName] = useState('John');
  return <ChildComponent name={name} />;
}
```

---

### **4. `state` 和 `props` 的传递链**

`props` 是单向数据流的，数据从父组件传递到子组件，而 `state` 是局部的，只在组件内部有效。候选人需要理解如何在复杂的组件树中管理和传递数据。

**考察点**：

- **单向数据流**：理解数据流动的方向以及如何通过 `props` 将父组件的状态传递到子组件。
- **传递函数作为 `props`**：父组件可以将函数作为 `props` 传递给子组件，使得子组件可以调用父组件的函数来修改父组件的状态。

**示例问题**：

- 你如何从子组件更新父组件的状态？
- 在 React 中，如何管理跨多个层级组件的数据流？

**代码示例**：

```javascript
function ParentComponent() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);

  return <ChildComponent increment={increment} />;
}

function ChildComponent({ increment }) {
  return <button onClick={increment}>Increment</button>;
}
```

---

### **5. 受控组件与非受控组件**

**受控组件**：组件的 `state` 由 React 控制，用户输入的值会同步到 `state`。 **非受控组件**：组件的 `state` 由 DOM 控制，React 不干预。

**考察点**：

- **受控组件的概念**：组件的值通过 `state` 管理，输入框的值由 `state` 控制。
- **非受控组件的概念**：使用 `ref` 来直接访问 DOM 元素的值。
- **什么时候使用受控组件，什么时候使用非受控组件？**

**示例问题**：

- 什么是受控组件和非受控组件？请给出例子。
- 受控组件和非受控组件的优缺点是什么？

**代码示例**：

```javascript
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef();

  const handleSubmit = () => {
    alert(inputRef.current.value);
  };

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

---

### **6. `state` 的合并与批量更新**

React 会在更新多个 `setState` 时进行 **批量更新**，即多个 `setState` 调用会合并为一次更新。

**考察点**：

- **`setState` 的合并**：多个调用 `setState` 后，React 会合并更新，而不是每次都重新渲染。
- **`setState` 批量更新的性能优化**：理解如何利用批量更新提高性能。

**示例问题**：

- `setState` 是如何合并更新的？如何在多个 `setState` 调用时避免不必要的渲染？

---

### **7. `state` 的优化**

`state` 的更新和重新渲染会影响性能，特别是在大型应用中。候选人需要了解如何优化 `state` 的管理和更新。

**考察点**：

- **React.memo 与 `shouldComponentUpdate`**：如何防止不必要的重新渲染。
- **局部更新 `state`**：如何优化 `state` 的结构，避免更新整个对象导致不必要的渲染。

**示例问题**：

- 如何优化 React 中的 `state` 更新，避免不必要的重新渲染？

---

### **8. `props` 的变化**

父组件的 `props` 发生变化时，子组件会重新渲染。候选人需要理解如何通过 `props` 传递数据以及 `props` 变化时如何影响渲染。

**考察点**：

- **父组件的 `props` 变化如何影响子组件**：理解 React 的渲染机制，父组件的 `props` 变化会触发子组件的重新渲染。
- **`React.memo` 优化**：如何使用 `React.memo` 避免子组件因 `props` 的变化而重新渲染。

**示例问题**：

- 当父组件的 `props` 发生变化时，子组件如何重新渲染？
