+++
title = "腾讯-CSIG一校招 · 第 1 轮 · 第二轮"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "第二轮", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/66"
experienceId = 66
roundId = 109
roundOrder = 1
company = "腾讯"
date = "2025-07-28T14:52:54.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-66/round-108/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-66/_index.md" >}}) · 已是最后一轮 →

**本轮概述：** 第二轮对技术深度有一定的考察。
对构建工具有深入理解，能够分析技术选型原因
掌握React核心概念和性能优化技巧
具备网络协议和安全知识
代码实现能力强，能够设计合理的算法和架构
理解设计模式在实际场景中的应用

本轮共 14 道题。答案默认折叠，便于先自行作答。

## 1. Node中间件的作用和使用 {#question-subjective-f1c0f4f71588}

### 题目要点

请求拦截处理、横切关注点、链式执行、功能解耦

<details>
<summary>参考答案</summary>

中间件是在请求和响应之间执行的函数，用于处理横切关注点。在Express/Nest.js中，中间件按顺序执行，每个中间件可以修改请求对象、响应对象，或者终止请求-响应循环。

常用的中间件包括：

- 身份验证中间件：验证用户token
- 日志中间件：记录请求信息
- 错误处理中间件：统一处理异常
- CORS中间件：处理跨域请求
- 参数验证中间件：验证请求参数格式

</details>

## 2. 大模型的理解和应用 {#question-subjective-c12bd009cf82}

### 题目要点

语言模型、涌现能力、开发辅助、安全考虑

<details>
<summary>参考答案</summary>

大模型是基于Transformer架构的深度学习模型，通过大规模数据训练获得强大的语言理解和生成能力。主要特点是参数量巨大、涌现能力强、通用性好。

在开发中的应用：

- 代码生成和补全：提高开发效率
- 文档生成：自动生成API文档和注释
- 代码审查：发现潜在问题和优化建议
- 需求分析：辅助理解业务逻辑

使用时需要注意数据安全、结果准确性验证、成本控制等问题。

</details>

## 3. Webpack vs Vite 的理解和区别 {#question-subjective-0ea3ab62cd5f}

### 题目要点

构建原理差异、性能表现、生态成熟度、配置复杂度

<details>
<summary>参考答案</summary>

Webpack是基于模块打包的构建工具，通过入口文件分析依赖关系，将所有资源打包成bundle。Vite是基于ES模块的构建工具，开发时利用浏览器原生ES模块支持，生产时使用Rollup打包。

主要区别：

- **启动速度**：Vite利用ES模块按需加载，启动更快；Webpack需要预先打包
- **热更新**：Vite基于ES模块的HMR更精确；Webpack需要重新打包相关模块
- **生态系统**：Webpack生态更成熟，插件丰富；Vite相对较新但发展迅速
- **配置复杂度**：Vite开箱即用，配置简单；Webpack配置相对复杂

</details>

## 4. 项目选择构建工具的考虑 {#question-subjective-29f2b86eee7f}

### 题目要点

开发体验优先、项目延续性、团队熟悉度、稳定性考虑

<details>
<summary>参考答案</summary>

个人项目选择Vite主要考虑开发体验，启动快、热更新迅速，配置简单，适合快速原型开发。实习项目使用Webpack主要因为：

- 历史项目延续性，已有完整的配置和工作流
- 团队熟悉度高，维护成本低
- 生态系统成熟，特殊需求的插件支持更好
- 大型项目的稳定性考虑

</details>

## 5. Vite 开发环境与生产环境差异 {#question-subjective-4d144b12214f}

### 题目要点

按需加载vs完整打包、开发体验vs生产优化、不同构建工具

<details>
<summary>参考答案</summary>

开发环境：

- 不进行完整打包，利用ES模块按需加载
- 使用esbuild进行依赖预构建
- 支持热模块替换（HMR）
- 源码直接在浏览器中运行

生产环境：

- 使用Rollup进行完整打包
- 代码压缩、Tree shaking、代码分割
- 静态资源优化和缓存策略
- 兼容性处理和polyfill

</details>

## 6. Tree Shaking 对比 {#question-subjective-d091c51333f6}

### 题目要点

静态分析、配置差异、工具依赖、效果对比

<details>
<summary>参考答案</summary>

**Webpack Tree Shaking**：

- 基于ES6模块的静态分析
- 需要配置mode: 'production'和optimization.usedExports
- 依赖UglifyJS或Terser进行死代码消除
- 支持sideEffects配置标记无副作用模块

**Vite Tree Shaking**：

- 开发环境不进行Tree Shaking，保持快速启动
- 生产环境使用Rollup的Tree Shaking
- 默认开启，无需额外配置
- 基于ES模块的静态分析，效果更好

</details>

## 7. React Fiber {#question-subjective-10487c123b06}

### 题目要点

可中断渲染、优先级调度、时间切片、性能优化

<details>
<summary>参考答案</summary>

Fiber是React 16引入的新协调算法，解决了之前递归调和过程不可中断的问题。

核心特性：

- **时间切片**：将渲染工作分割成小块，每个时间片执行一部分工作
- **优先级调度**：不同类型的更新有不同优先级，高优先级可以中断低优先级
- **可中断渲染**：长时间的渲染任务可以被中断，让出主线程给其他任务
- **双缓冲**：current树和workInProgress树交替工作

实现原理是将递归改为循环，通过链表结构连接Fiber节点，支持暂停和恢复。

</details>

## 8. React Hooks 作用和常用Hook {#question-subjective-2be84cff80f2}

### 题目要点

函数组件增强、状态管理、副作用处理、性能优化

<details>
<summary>参考答案</summary>

Hooks让函数组件能够使用状态和生命周期特性，解决了类组件的复杂性问题。

常用Hooks：

- **useState**：管理组件状态
- **useEffect**：处理副作用和生命周期
- **useContext**：消费Context数据
- **useReducer**：复杂状态管理
- **useMemo**：缓存计算结果
- **useCallback**：缓存函数引用
- **useRef**：访问DOM或保存可变值

</details>

## 9. useMemo、useCallback、useRef 区别 {#question-subjective-bc8fee90dd8e}

### 题目要点

缓存对象不同、使用场景差异、性能优化方式

<details>
<summary>参考答案</summary>

**useMemo**：

- 缓存计算结果，避免重复计算
- 依赖数组变化时重新计算
- 返回缓存的值

**useCallback**：

- 缓存函数引用，避免子组件不必要的重渲染
- 依赖数组变化时返回新函数
- 返回缓存的函数

**useRef**：

- 创建可变的ref对象，不会触发重渲染
- 常用于访问DOM元素或保存跨渲染的值
- 返回固定的ref对象

```js
// useMemo示例
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback示例
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useRef示例
const inputRef = useRef(null);
```

</details>

## 10. TCP vs UDP、三次握手、SYN攻击 {#question-subjective-c603495e71dd}

### 题目要点

协议特性差异、连接建立过程、安全攻击防护

<details>
<summary>参考答案</summary>

**TCP vs UDP**：

- TCP：面向连接、可靠传输、有序、流量控制、拥塞控制
- UDP：无连接、不可靠、无序、开销小、速度快

**TCP三次握手**：

1. 客户端发送SYN包，进入SYN_SENT状态
2. 服务器回复SYN+ACK包，进入SYN_RCVD状态
3. 客户端发送ACK包，连接建立，进入ESTABLISHED状态

**SYN攻击**：
攻击者发送大量SYN包但不回复ACK，导致服务器维护大量半连接状态，消耗资源。防护措施包括SYN Cookie、连接限制、防火墙过滤等。

</details>

## 11. 跨域和同源策略 {#question-subjective-a3d240618bc1}

### 题目要点

安全策略、同源定义、多种解决方案、应用场景

<details>
<summary>参考答案</summary>

**同源策略**：浏览器安全策略，限制不同源之间的资源访问。同源要求协议、域名、端口完全相同。

**跨域解决方案**：

- CORS：服务器设置Access-Control-Allow-Origin等头部
- JSONP：利用script标签不受同源策略限制
- 代理：开发环境通过webpack-dev-server代理
- postMessage：跨窗口通信

</details>

## 12. TypeScript中type 和 interface的区别 {#question-subjective-7a21733eef3f}

### 题目要点

使用场景差异、功能特性、声明合并、类型操作

<details>
<summary>参考答案</summary>

**interface**：

- 主要用于定义对象结构
- 支持声明合并
- 可以被类实现
- 只能描述对象类型

**type**：

- 可以定义任何类型别名
- 支持联合类型、交叉类型
- 不支持声明合并
- 更灵活的类型操作

```js
// interface示例
interface User {
  name: string;
  age: number;
}

interface User {
  email: string; // 声明合并
}

// type示例
type Status = 'loading' | 'success' | 'error';
type UserWithStatus = User & { status: Status };
```

</details>

## 13. 对算术表达式求值 {#question-subjective-b59d817f11ad}

给定一个字符串，输出对应的计算结果，包括加减乘除，小括号，只考虑正整数，例如"2+3*2" => 输出8

例如：1+2*(5-2)+4 => 1+2*3+4 => 1+6+4 => 11

### 题目要点

括号优先级、运算符优先级、字符串解析、递归处理

<details>
<summary>参考答案</summary>

```js
function calculate(expression) {
  // 去除空格
  expression = expression.replace(/\s/g, '');

  // 处理括号
  while (expression.includes('(')) {
    let start = -1;
    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        start = i;
      } else if (expression[i] === ')') {
        let subExpr = expression.substring(start + 1, i);
        let result = evaluateSimple(subExpr);
        expression = expression.substring(0, start) + result + expression.substring(i + 1);
        break;
      }
    }
  }

  return evaluateSimple(expression);
}

function evaluateSimple(expr) {
  // 处理乘除
  while (expr.includes('*') || expr.includes('/')) {
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '*' || expr[i] === '/') {
        let left = getLeftNumber(expr, i);
        let right = getRightNumber(expr, i);
        let result = expr[i] === '*' ? left.value * right.value : left.value / right.value;
        expr = expr.substring(0, left.start) + result + expr.substring(right.end);
        break;
      }
    }
  }

  // 处理加减
  while (expr.includes('+') || (expr.includes('-') && expr.lastIndexOf('-') > 0)) {
    for (let i = 1; i < expr.length; i++) {
      if (expr[i] === '+' || expr[i] === '-') {
        let left = getLeftNumber(expr, i);
        let right = getRightNumber(expr, i);
        let result = expr[i] === '+' ? left.value + right.value : left.value - right.value;
        expr = expr.substring(0, left.start) + result + expr.substring(right.end);
        break;
      }
    }
  }

  return parseFloat(expr);
}

function getLeftNumber(expr, pos) {
  let start = pos - 1;
  while (start >= 0 && /\d/.test(expr[start])) {
    start--;
  }
  start++;
  return {
    value: parseFloat(expr.substring(start, pos)),
    start: start
  };
}

function getRightNumber(expr, pos) {
  let end = pos + 1;
  while (end < expr.length && /\d/.test(expr[end])) {
    end++;
  }
  return {
    value: parseFloat(expr.substring(pos + 1, end)),
    end: end
  };
}
```

</details>

## 14. 手写题2: 有一种花，两种鸟，花定时开放，鸟看到花开会叫，鸟的叫声不一样，用代码来实现这样一种场景 {#question-subjective-ba5c7dabedd1}

### 题目要点

观察者模式、事件通知、对象交互、定时触发

<details>
<summary>参考答案</summary>

```js
// 观察者模式实现
class Flower {
  constructor() {
    this.observers = [];
    this.isOpen = false;
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  bloom() {
    this.isOpen = true;
    console.log('花开了！');
    this.notifyObservers();
  }

  notifyObservers() {
    this.observers.forEach(observer => observer.onFlowerBloom());
  }
}

class Bird {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  onFlowerBloom() {
    console.log(`${this.name}看到花开了，发出声音：${this.sound}`);
  }
}

// 使用示例
const flower = new Flower();
const bird1 = new Bird('喜鹊', '喳喳喳');
const bird2 = new Bird('黄鹂', '啾啾啾');

flower.addObserver(bird1);
flower.addObserver(bird2);

// 定时开花
setInterval(() => {
  flower.bloom();
}, 3000);
```

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-66/round-108/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-66/_index.md" >}}) · 已是最后一轮 →
