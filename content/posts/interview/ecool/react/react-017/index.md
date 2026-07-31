+++
title = "错误边界"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-03-20T00:00:00+08:00'
draft = true
weight = 17
tags = ["面试", "前端", "React", "错误边界", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
人无完人，代码总会出错，出错并不可怕，关键是怎么处理。

我就想问问大家react的应用的错误怎么捕捉呢？ 这个时候：

- 小白+++：怎么处理？
- 小白++： ErrorBoundary
- 小白+： ErrorBoundary, try catch
- 小黑#: ErrorBoundary, try catch, window.onerror
- 小黑##: 这个是个严肃的问题，我知道N种处理方式，你有什么更好的方案?

## ErrorBoundary

EerrorBoundary是16版本出来的，有人问那我的15版本呢，我不听我不听，反正我用16，当然15有`unstable_handleError`。

关于ErrorBoundary官网介绍比较详细，这个不是重点，重点是他能捕捉哪些异常。

- 子组件的渲染
- 生命周期函数
- 构造函数

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

开源世界就是好，早有大神封装了[react-error-boundary](https://www.npmjs.com/package/react-error-boundary) 这种优秀的库。  
 你只需要关心出现错误后需要关心什么，还以来个 `Reset`, 完美。

```js
import {ErrorBoundary} from 'react-error-boundary'

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

const ui = (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      // reset the state of your app so the error doesn't happen again
    }}
  >
    <ComponentThatMayError />
  </ErrorBoundary>
)
```

遗憾的是，error boundaries并不会捕捉这些错误：

- 事件处理程序
- 异步代码 (e.g. setTimeout or requestAnimationFrame callbacks)
- 服务端的渲染代码
- error boundaries自己抛出的错误

原文可见参见官网[introducing-error-boundaries](https://reactjs.org/docs/error-boundaries.html#introducing-error-boundaries)

本文要捕获的就是 事件处理程序的错误。  
 官方其实也是有方案的[how-about-event-handlers](https://reactjs.org/docs/error-boundaries.html#how-about-event-handlers)， 就是 try catch.  
 但是，那么多事件处理程序，我的天，得写多少，。。。。。。。。。。。。。。。。。。。。

```js
  handleClick() {
    try {
      // Do something that could throw
    } catch (error) {
      this.setState({ error });
    }
  }
```

## Error Boundary 之外

我们先看看一张表格，罗列了我们能捕获异常的手段和范围。

| 异常类型 | 同步方法 | 异步方法 | 资源加载 | Promise | async/await |
| --- | --- | --- | --- | --- | --- |
| try/catch | √ |  |  |  | √ |
| window.onerror | √ | √ |  |  |  |
| error | √ | √ | √ |  |  |
| unhandledrejection |  |  |  | √ | √ |

### try/catch

可以捕获同步和async/await的异常。

### window.onerror , error事件

```js
    window.addEventListener('error', this.onError, true);
    window.onerror = this.onError
```

`window.addEventListener('error')` 这种可以比 `window.onerror` 多捕获资源记载异常. 请注意最后一个参数是 `true`, `false`的话可能就不如你期望。

当然你如果问题这第三个参数的含义，我就有点不想理你了。拜。

### unhandledrejection

请注意最后一个参数是 `true`。

```js
window.removeEventListener('unhandledrejection', this.onReject, true)
```

其捕获未被捕获的Promise的异常。

### XMLHttpRequest 与 fetch

`XMLHttpRequest` 很好处理，自己有onerror事件。 当然你99.99%也不会自己基于`XMLHttpRequest`封装一个库， `axios` 真香，有这完毕的错误处理机制。

至于`fetch`, 自己带着catch跑，不处理就是你自己的问题了。

这么多，太难了。  
 还好，其实有一个库 [react-error-catch](https://www.npmjs.com/package/react-error-catch) 是基于ErrorBoudary,error与unhandledrejection封装的一个组件。

其核心如下

```js
   ErrorBoundary.prototype.componentDidMount = function () {
        // event catch
        window.addEventListener('error', this.catchError, true);
        // async code
        window.addEventListener('unhandledrejection', this.catchRejectEvent, true);
    };
```

使用：

```js
import ErrorCatch from 'react-error-catch'

const App = () => {
  return (
  <ErrorCatch
      app="react-catch"
      user="cxyuns"
      delay={5000}
      max={1}
      filters={[]}
      onCatch={(errors) => {
        console.log('报错咯');
        // 上报异常信息到后端，动态创建标签方式
        new Image().src = `http://localhost:3000/log/report?info=${JSON.stringify(errors)}`
      }}
    >
      <Main />
    </ErrorCatch>)
}

export default 
```

鼓掌，鼓掌。

其实不然： 利用error捕获的错误，其最主要的是提供了错误堆栈信息，对于分析错误相当不友好，尤其打包之后。

错误那么多，我就先好好处理React里面的事件处理程序。  
 至于其他，待续。

## 事件处理程序的异常捕获

### 示例

我的思路原理很简单，使用[decorator](http://es6.ruanyifeng.com/#docs/decorator)来重写原来的方法。

先看一下使用：

```js
   @methodCatch({ message: "创建订单失败", toast: true, report:true, log:true })
    async createOrder() {
        const data = {...};
        const res = await createOrder();
        if (!res || res.errCode !== 0) {
            return Toast.error("创建订单失败");
        }
        
        .......
        其他可能产生异常的代码
        .......
        
       Toast.success("创建订单成功");
    }
```

注意四个参数：

- message： 出现错误时，打印的错误
- toast： 出现错误，是否Toast
- report: 出现错误，是否上报
- log: 使用使用console.error打印

可能你说，这这，消息定死，不合理啊。我要是有其他消息呢。  
 此时我微微一笑别急， 再看一段代码

```js
  @methodCatch({ message: "创建订单失败", toast: true, report:true, log:true })
    async createOrder() {
        const data = {...};
        const res = await createOrder();
        if (!res || res.errCode !== 0) {
            return Toast.error("创建订单失败");
        }
       
        .......
        其他可能产生异常的代码
        .......
        
       throw new CatchError("创建订单失败了，请联系管理员", {
           toast: true,
           report: true,
           log: false
       })
       
       Toast.success("创建订单成功");

    }
```

是都，没错，你可以通过抛出 自定义的`CatchError`来覆盖之前的默认选项。

这个`methodCatch`可以捕获，同步和异步的错误，我们来一起看看全部的代码。

### 类型定义

```typescript
export interface CatchOptions {
    report?: boolean;
    message?: string;
    log?: boolean;
    toast?: boolean;
}

// 这里写到 const.ts更合理
export const DEFAULT_ERROR_CATCH_OPTIONS: CatchOptions = {
    report: true,
    message: "未知异常",
    log: true,
    toast: false
}
```

### 自定义的CatchError

```typescript
import { CatchOptions, DEFAULT_ERROR_CATCH_OPTIONS } from "@typess/errorCatch";

export class CatchError extends Error {

    public __type__ = "__CATCH_ERROR__";
    /**
     * 捕捉到的错误
     * @param message 消息
     * @options 其他参数
     */
    constructor(message: string, public options: CatchOptions = DEFAULT_ERROR_CATCH_OPTIONS) {
        super(message);
    }
}
```

### 装饰器

```typescript
import Toast from "@components/Toast";
import { CatchOptions, DEFAULT_ERROR_CATCH_OPTIONS } from "@typess/errorCatch";
import { CatchError } from "@util/error/CatchError";

const W_TYPES = ["string", "object"];
export function methodCatch(options: string | CatchOptions = DEFAULT_ERROR_CATCH_OPTIONS) {

    const type = typeof options;

    let opt: CatchOptions;

    if (options == null || !W_TYPES.includes(type)) { // null 或者 不是字符串或者对象
        opt = DEFAULT_ERROR_CATCH_OPTIONS;
    } else if (typeof options === "string") {  // 字符串
        opt = {
            ...DEFAULT_ERROR_CATCH_OPTIONS,
            message: options || DEFAULT_ERROR_CATCH_OPTIONS.message,
        }
    } else { // 有效的对象
        opt = { ...DEFAULT_ERROR_CATCH_OPTIONS, ...options }
    }

    return function (_target: any, _name: string, descriptor: PropertyDescriptor): any {

        const oldFn = descriptor.value;

        Object.defineProperty(descriptor, "value", {
            get() {
                async function proxy(...args: any[]) {
                    try {
                        const res = await oldFn.apply(this, args);
                        return res;
                    } catch (err) {
                        // if (err instanceof CatchError) {
                        if(err.__type__ == "__CATCH_ERROR__"){
                            err = err as CatchError;
                            const mOpt = { ...opt, ...(err.options || {}) };

                            if (mOpt.log) {
                                console.error("asyncMethodCatch:", mOpt.message || err.message , err);
                            }

                            if (mOpt.report) {
                                // TODO::
                            }

                            if (mOpt.toast) {
                                Toast.error(mOpt.message);
                            }

                        } else {
                            
                            const message = err.message || opt.message;
                            console.error("asyncMethodCatch:", message, err);

                            if (opt.toast) {
                                Toast.error(message);
                            }
                        }
                    }
                }
                proxy._bound = true;
                return proxy;
            }
        })
        return descriptor;
    }
}
```

## 总结一下

1. 利用装饰器重写原方法，达到捕获错误的目的
2. 自定义错误类，抛出它，就能达到覆盖默认选项的目的。增加了灵活性。

```js
  @methodCatch({ message: "创建订单失败", toast: true, report:true, log:true })
    async createOrder() {
        const data = {...};
        const res = await createOrder();
        if (!res || res.errCode !== 0) {
            return Toast.error("创建订单失败");
        }
       Toast.success("创建订单成功");
       
        .......
        其他可能产生异常的代码
        .......
        
       throw new CatchError("创建订单失败了，请联系管理员", {
           toast: true,
           report: true,
           log: false
       })
    }
```

## 下一步

啥下一步，走一步看一步啦。

不，接下来的路，还很长。 这才是一个基础版本。

1. 扩大成果，支持更多类型，以及hooks版本。

```typescript
@XXXCatch
classs AAA{
    @YYYCatch
    method = ()=> {
    }
}
```

2. 抽象，再抽象，再抽象

玩笑开完了，严肃一下：

**当前方案存在的问题:**

1. 功能局限
2. 抽象不够  
 获取选项,代理函数, 错误处理函数完全可以分离，变成通用方法。
3. 同步方法经过转换后会变为异步方法。  
 所以理论上，要区分同步和异步方案。
4. 错误处理函数再异常怎么办

之后，我们会围绕着这些问题，继续展开。

## Hooks版本

有掘友说，这个年代了，谁还不用Hooks。  
 是的，大佬们说得对，我们得与时俱进。  
 Hooks的基础版本已经有了，先分享使用，后续的文章跟上。

Hook的名字就叫useCatch

```typescript
const TestView: React.FC<Props> = function (props) {

    const [count, setCount] = useState(0);

    const doSomething  = useCatch(async function(){
        console.log("doSomething: begin");
        throw new CatchError("doSomething error")
        console.log("doSomething: end");
    }, [], {
        toast: true
    })

    const onClick = useCatch(async (ev) => {
        console.log(ev.target);
        setCount(count + 1);

        doSomething();

        const d = delay(3000, () => {
            setCount(count => count + 1);
            console.log()
        });
        console.log("delay begin:", Date.now())

        await d.run();
        
        console.log("delay end:", Date.now())
        console.log("TestView", this)
        throw new CatchError("自定义的异常，你知道不")
    },
        [count],
        {
            message: "I am so sorry",
            toast: true
        });

    return <div>
        <div><button onClick={onClick}>点我</button></div>
        <div>{count}</div>
    </div>
}

export default React.memo(TestView);
```

至于思路，基于`useMemo`,可以先看一下代码：

```typescript
export function useCatch<T extends (...args: any[]) => any>(callback: T, deps: DependencyList, options: CatchOptions =DEFAULT_ERRPR_CATCH_OPTIONS): T {    

    const opt =  useMemo( ()=> getOptions(options), [options]);
    
    const fn = useMemo((..._args: any[]) => {
        const proxy = observerHandler(callback, undefined, function (error: Error) {
            commonErrorHandler(error, opt)
        });
        return proxy;

    }, [callback, deps, opt]) as T;

    return fn;
}
```

## 常见考点

## **1. 错误边界的基本概念**

-  **考察点**：  
  - 什么是错误边界？
  - 错误边界的作用及其工作原理。
  - 为什么 React 需要错误边界？
-  **问题示例**：  
  - 什么是 React 的错误边界？它的作用是什么？
  - React 组件中的错误会影响整个应用吗？为什么？
  - React 中哪些错误可以被错误边界捕获？哪些不能？
  - 错误边界能捕获异步代码（如 `setTimeout` 或 `fetch`）中的错误吗？如果不能，该如何处理？

---

## **2. 如何实现错误边界**

-  **考察点**：  
  - 如何正确实现错误边界组件？
  - `componentDidCatch` 和 `getDerivedStateFromError` 的作用。
  - 错误边界的基本用法。
-  **问题示例**：  
  - 如何在 React 组件中创建一个错误边界？
  - `componentDidCatch` 和 `getDerivedStateFromError` 的区别是什么？
  - `componentDidCatch` 的参数有哪些？如何使用？
  - 错误边界的 `componentDidCatch` 是否可以在函数组件中使用？为什么？

---

## **3. 错误边界的适用范围**

-  **考察点**：  
  - 错误边界的作用范围及其对不同组件的影响。
  - 是否应该在应用的根组件上设置错误边界？
  - 错误边界的最佳实践。
-  **问题示例**：  
  - 错误边界应该放在应用的哪个层级？为什么？
  - 如何在大型应用中合理使用错误边界？
  - 在 React 16 之前，如何处理组件中的错误？
  - `StrictMode` 是否会影响错误边界的行为？

---

## **4. 错误边界的局限性**

-  **考察点**：  
  - 错误边界的局限性，如无法捕获事件处理函数中的错误。
  - 不能捕获错误的场景及解决方案。
-  **问题示例**：  
  - React 错误边界不能捕获哪些类型的错误？如何处理？
  - 为什么错误边界无法捕获 `setTimeout` 里的错误？如何解决？
  - 在错误边界无法捕获的场景下，如何进行全局错误监控？

---

## **5. 错误边界与 Hooks**

-  **考察点**：  
  - React Hooks 不能直接使用 `componentDidCatch`，如何在函数组件中实现错误边界？
  - `useEffect` 是否可以替代 `componentDidCatch`？
-  **问题示例**：  
  - 为什么 React Hooks 不能使用 `componentDidCatch`？
  - 在 Hooks 组件中如何实现类似错误边界的功能？
  - `useEffect` 能够捕获组件渲染过程中的错误吗？为什么？

---

## **6. 错误边界与 React Router 结合**

-  **考察点**：  
  - 在路由跳转时如何确保错误边界生效？
  - 发生错误时，如何跳转到错误页面？
-  **问题示例**：  
  - 如何结合 React Router 让某个页面在发生错误时跳转到 `/error`？
  - 在 `Suspense` 组件中，错误边界如何影响懒加载组件？

---

## **7. 错误边界与日志记录**

-  **考察点**：  
  - 结合日志系统（如 Sentry、LogRocket）记录错误信息。
-  **问题示例**：  
  - 如何在错误边界中上报错误日志？
  - `componentDidCatch` 中的错误信息如何存储到日志系统？
  - 错误边界如何与 Sentry 结合？

---

## **8. 错误边界在生产环境中的应用**

-  **考察点**：  
  - 在实际项目中如何使用错误边界保证应用的健壮性？
  - 在组件库或 UI 框架中如何利用错误边界提升用户体验？
-  **问题示例**：  
  - 在生产环境中，如何合理使用错误边界？
  - 如何在 UI 组件库（如 Ant Design）中使用错误边界？
  - 错误边界如何配合 `fallback UI` 提供良好的用户体验？
