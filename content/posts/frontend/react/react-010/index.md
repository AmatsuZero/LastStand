+++
title = "受控组件和非受控组件"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-03-14T00:00:00+08:00'
draft = false
weight = 10
tags = ["面试", "前端", "React", "受控组件和非受控组件", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
前端开发经常会涉及表单的处理，或者其他一些用于输入的组件，比如日历组件。

涉及到输入，就绕不开受控模式和非受控模式的概念。

什么是受控，什么是非受控呢？

想一下，改变表单值只有两种情况：

![](image-01.webp)

用户去改变 value 或者代码去改变 value。

如果不能通过代码改表单值 value，那就是非受控，也就是不受我们控制。

但是代码可以给表单设置初始值 defaultValue。

![](image-02.webp)

代码设置表单的初始 value，但是能改变 value 的只有用户，代码通过监听 onChange 来拿到最新的值，或者通过 ref 拿到 dom 之后读取 value。

这种就是非受控模式。

反过来，代码可以改变表单的 value，就是受控模式。

![](image-03.webp)

注意，value 和 defaultValue 不一样：

defaultValue 会作为 value 的初始值，后面用户改变的是 value。

而一旦你给 input 设置了 value，那用户就不能修改它了，可以输入触发 onChange 事件，但是表单的值不会变。

用户输入之后在 onChange 事件里拿到输入，然后通过代码去设置 value。

这就是受控模式。

其实绝大多数情况下，非受控就可以了，因为我们只是要拿到用户的输入，不需要手动去修改表单值。

但有的时候，你需要根据用户的输入做一些处理，然后设置为表单的值，这种就需要受控模式。

或者你想同步表单的值到另一个地方的时候，类似 Form 组件，也可以用受控模式。

**value 由用户控制就是非受控模式，由代码控制就是受控模式**。

我们写代码试一下：

```lua
npx create-vite
```

![](image-04.webp)

创建 vite + react 的项目。

去掉 main.tsx 的 index.css 和 StrictMode：

![](image-05.webp)

改下 App.tsx

```javascript
import { ChangeEvent } from "react"

function App() {

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value);
  }

  return <input defaultValue={'guang'} onChange={onChange}/>
}

export default App
```

跑一下开发服务：

```arduino
npm install
npm run dev
```

![](image-06.webp)

看下效果：

![](image-07.webp)

defaultValue 作为 value 的初始值，然后用户输入触发 onChange 事件，通过 event.target 拿到了 value。

当然，非受控模式也不一定通过 onChange 拿到最新 value，通过 ref 也可以。

```javascript
import { useEffect, useRef } from "react"

function App() {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      console.log(inputRef.current?.value);
    }, 2000);
  }, []);

  return <input defaultValue={'guang'} ref={inputRef}/>
}

export default App
```

![](image-08.webp)

接下来看下受控模式的写法：

```javascript
import { ChangeEvent, useState } from "react"

function App() {

  const [value, setValue] = useState('guang');

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value);
    // setValue(event.target.value);
  }

  return <input value={value} onChange={onChange}/>
}

export default App
```

我们先把 setValue 注释掉，看下用户可不可以改：

![](image-09.webp)

可以看到，用户可以输入，onChange 也可以拿到输入后的表单值，但是 value 并没有变。

把 setValue 那一行注释去掉就可以了。

![](image-10.webp)

虽然功能上差不多，但这种写法并不推荐：

![](image-11.webp)

你不让用户自己控制，而是通过代码控制，绕了一圈结果也没改 value 的值，还是原封不动的，图啥呢？

而且受控模式每次 setValue 都会导致组件重新渲染。

试一下：

![](image-12.webp)

![](image-13.webp)

每次输入都会 setValue，然后触发组件重新渲染：

而非受控模式下只会渲染一次：

![](image-14.webp)

![](image-15.webp)

绕了一圈啥也没改，还导致很多组件的重新渲染，那你用受控模式图啥呢？

那什么情况用受控模式呢？

当然是你**需要对输入的值做处理之后设置到表单的时候，或者是你想实时同步状态值到父组件。**

比如把用户输入改为大写：

```javascript
import { ChangeEvent, useState } from "react"

function App() {

  const [value, setValue] = useState('guang');

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value)
    setValue(event.target.value.toUpperCase());
  }

  return <input value={value} onChange={onChange}/>
}

export default App
```

![](image-16.webp)

这种，需要把用户的输入修改一下再设置 value 的。

但这种场景其实很少。

有的同学可能会说 Form 组件，确实，用 Form.Item 包裹的表单项都是受控组件：

![](image-17.webp)

确实，那是因为 Form 组件内有一个 Store，会把表单值同步过去，然后集中管理和设置值：

![](image-18.webp)

但也因为都是受控组件，随着用户的输入，表单重新渲染很多次，性能会不好。

如果是单独用的组件，比如 Calendar，那就没必要用受控模式了，用非受控模式，设置 defaultValue 就可以了。

很多人上来就设置 value，然后监听 onChange，但是绕了一圈又原封不动的把用户输入转为 value。

没啥意义，还平白导致组件的很多次重新渲染。

除了原生表单元素外，组件也需要考虑受控和非受控的情况。

比如日历组件：

![](image-19.webp)

它的参数就要考虑是支持非受控模式的 defaultValue，还是用受控模式的 value + onChange。

如果这是一个业务组件，那基本就是用非受控模式的 defaultValue 了，调用方只要拿到用户的输入就行。

用受控模式的 value 还要 setValue 触发额外的渲染。

但是基础组件不能这样，你得都支持，让调用者自己去选择。

ant design 的 Calendar 组件就是这样的：

![](image-20.webp)

![](image-21.webp)

ColorPicker 组件也是： ![](image-22.webp)

![](image-23.webp)

它同时支持了受控组件和非受控组件。

咋做到的呢？

我们来试试：

首先写下非受控组件的写法：

```javascript
import { ChangeEvent, useState } from "react"

interface CalendarProps{
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}
function Calendar(props: CalendarProps) {

  const {
    defaultValue = new Date(),
    onChange
  } = props;

  const [value, setValue] = useState(defaultValue);

  function changeValue(date: Date) {
    setValue(date);
    onChange?.(date);
  }

  return <div>
    {value.toLocaleDateString()}
    <div onClick={()=> {changeValue(new Date('2024-5-1'))}}>2023-5-1</div>
    <div onClick={()=> {changeValue(new Date('2024-5-2'))}}>2023-5-2</div>
    <div onClick={()=> {changeValue(new Date('2024-5-3'))}}>2023-5-3</div>
  </div>
}

function App() {
  return <Calendar defaultValue={new Date('2024-5-1')} onChange={(date) => {
    console.log(date.toLocaleDateString());
  }}/>
}

export default App
```

这里 Calendar 组件传入 defaultValue 和 onChange 参数。

defaultValue 会作为 value 的初始值，然后用户点击不同日期会修改 value，然后回调 onChange 函数。

这种情况，调用者只能设置 defaultValue 初始值，不能直接修改 value，所以是非受控模式。

试一下；

![](image-24.webp)

然后再来写下受控模式的版本：

```javascript
import { ChangeEvent, useEffect, useState } from "react"

interface CalendarProps{
  value: Date;
  onChange?: (date: Date) => void;
}
function Calendar(props: CalendarProps) {

  const {
    value,
    onChange
  } = props;

  function changeValue(date: Date) {
    onChange?.(date);
  }

  return <div>
    {value.toLocaleDateString()}
    <div onClick={()=> {changeValue(new Date('2024-5-1'))}}>2023-5-1</div>
    <div onClick={()=> {changeValue(new Date('2024-5-2'))}}>2023-5-2</div>
    <div onClick={()=> {changeValue(new Date('2024-5-3'))}}>2023-5-3</div>
  </div>
}

function App() {
  const [value, setValue] = useState(new Date('2024-5-1'));

  return <Calendar value={value} onChange={(date) => {
    console.log(date.toLocaleDateString());
    setValue(date);
  }}/>
}

export default App
```

直接用 props 传入的 value，然后切换日期的时候回调 onChange 函数：

![](image-25.webp)

value 的值的维护在调用方。

这就是受控组件的写法：

![](image-26.webp)

那能不能同时支持受控和非受控模式呢？

可以的，组件库基本都是这么做的：

```javascript
import { useEffect, useRef, useState } from "react"

interface CalendarProps{
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}

function Calendar(props: CalendarProps) {

  const {
    value: propsValue,
    defaultValue,
    onChange
  } = props;

  const [value, setValue] = useState(() => {
    if (propsValue !== undefined) {
      return propsValue;
    } else {
      return defaultValue;
    }
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if(propsValue === undefined && !isFirstRender.current) {
      setValue(propsValue);
    }
    isFirstRender.current = false;
  }, [propsValue]);

  const mergedValue = propsValue === undefined ? value : propsValue;

  function changeValue(date: Date) {
    if (propsValue === undefined) {
      setValue(date);
    }
    onChange?.(date);
  }

  return <div>
    {mergedValue?.toLocaleDateString()}
    <div onClick={()=> {changeValue(new Date('2024-5-1'))}}>2023-5-1</div>
    <div onClick={()=> {changeValue(new Date('2024-5-2'))}}>2023-5-2</div>
    <div onClick={()=> {changeValue(new Date('2024-5-3'))}}>2023-5-3</div>
  </div>
}

function App() {
  return <Calendar defaultValue={new Date('2024-5-1')} onChange={(date) => {
    console.log(date.toLocaleDateString());
  }}/>
}

export default App
```

参数同时支持 value 和 defaultValue，通过判断 value 是不是 undefined 来区分受控模式和非受控模式。

![](image-27.webp)

如果是受控模式，useState 的初始值设置 props.value，然后渲染用 props.value。

如果是非受控模式，那渲染用内部 state 的 value，然后 changeValue 里 setValue。

当不是首次渲染，但 value 变为 undefined 的情况，也就是从受控模式切换到了非受控模式，要同步设置 state 为 propsValue。

这样，组件就同时支持了受控和非受控模式。

测试下：

非受控模式：

![](image-28.webp)

![](image-29.webp)

受控模式：

![](image-30.webp)

![](image-31.webp)

其实组件库也都是这么做的。

比如 [arco design 的 useMergeValue 的 hook](https://github.com/arco-design/arco-design/blob/1e677c3c5bba72728668c40d78faea6536c480a8/components/_util/hooks/useMergeValue.ts)：

![](image-32.webp)

代码差不多，它也是 useState 根据 value 是不是 undefined 来设置 value 或者 defaultValue。

不过它这里又加了一个默认值，没有 defaultValue 的时候用它哪个 defaultStateValue。

然后渲染用的 state 根据 value 是不是 undefind 来判断受控非受控从而决定用 props 的 value 还是 state 的 value。

它也处理了 value 从别的值变为 undefined 的情况：

![](image-33.webp)

保存了之前的 value，判断是从 props.value 别的值变为 undefined 的情况再修改内部 state 为这个 value。

这里保存之前的值是用的 useRef：

![](image-34.webp)

ref 的特点是修改了 current 属性不会导致渲染。

我们是判断非首次渲染，但是 props.value 变为了 undefined，效果一样。

再比如 ant design 的工具包 rc-util 里的 [useMergedValue](https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts) 的 hook：

![](image-35.webp)

它也是 useState 根据 value 是不是 undefined 来设置 value 或者 defaultValue

然后又加了一个默认值，没有 defaultValue 的时候用它那个 defaultStateValue。

渲染的时候也是判断 value 是不是 undefind 来决定用 props.value 还是 state 的 value：

![](image-36.webp)

并且也做了别的值变为 undefined 的处理。

![](image-37.webp)

大家都这么搞，我们也来封装个 hook：

```javascript
function useMergeState<T>(
  defaultStateValue: T,
  props?: {
    defaultValue?: T,
    value?: T
  }
): [T, React.Dispatch<React.SetStateAction<T>>,] {
  const { defaultValue, value: propsValue } = props || {};

  const isFirstRender = useRef(true);

  const [stateValue, setStateValue] = useState<T>(() => {
    if (propsValue !== undefined) {
      return propsValue!;
    } else if(defaultValue !== undefined){
      return defaultValue!;
    } else {
      return defaultStateValue;
    }
  });

  useEffect(() => {
    if(propsValue === undefined && !isFirstRender.current) {
      setStateValue(propsValue!);
    }

    isFirstRender.current = false;
  }, [propsValue]);

  const mergedValue = propsValue === undefined ? stateValue : propsValue;

  return [mergedValue, setStateValue]
}
```

用一下：

```javascript
interface CalendarProps{
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}

function Calendar(props: CalendarProps) {
  const {
    value: propsValue,
    defaultValue,
    onChange
  } = props;

  const [mergedValue, setValue] = useMergeState(new Date(), {
    value: propsValue,
    defaultValue
  });

  function changeValue(date: Date) {
    if (propsValue === undefined) {
      setValue(date);
    }
    onChange?.(date);
  }

  return <div>
    {mergedValue?.toLocaleDateString()}
    <div onClick={()=> {changeValue(new Date('2024-5-1'))}}>2023-5-1</div>
    <div onClick={()=> {changeValue(new Date('2024-5-2'))}}>2023-5-2</div>
    <div onClick={()=> {changeValue(new Date('2024-5-3'))}}>2023-5-3</div>
  </div>
}
```

试试效果：

非受控模式：

![](image-38.webp)

![](image-39.webp)

受控模式：

![](image-40.webp)

![](image-41.webp)

再就是这个 onChange 部分，也应该封装进来：

![](image-42.webp)

不然用户用的时候还要想着去处理非受控组件的情况。

我看 arco design 里是没封装进去：

![](image-43.webp)

但是 ahooks 的 useControllableValue 就封装进去了：

![](image-44.webp)

我们也加一下：

```javascript
import {  SetStateAction, useCallback, useEffect, useRef, useState } from "react"

function useMergeState<T>(
  defaultStateValue: T,
  props?: {
    defaultValue?: T,
    value?: T,
    onChange?: (value: T) => void;
  },
): [T, React.Dispatch<React.SetStateAction<T>>,] {
  const { defaultValue, value: propsValue, onChange } = props || {};

  const isFirstRender = useRef(true);

  const [stateValue, setStateValue] = useState<T>(() => {
    if (propsValue !== undefined) {
      return propsValue!;
    } else if(defaultValue !== undefined){
      return defaultValue!;
    } else {
      return defaultStateValue;
    }
  });

  useEffect(() => {
    if(propsValue === undefined && !isFirstRender.current) {
      setStateValue(propsValue!);
    }

    isFirstRender.current = false;
  }, [propsValue]);

  const mergedValue = propsValue === undefined ? stateValue : propsValue;

  function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }

  const setState = useCallback((value: SetStateAction<T>) => {
    let res = isFunction(value) ? value(stateValue) : value

    if (propsValue === undefined) {
      setStateValue(res);
    }
    onChange?.(res);
  }, [stateValue]);

  return [mergedValue, setState]
}

interface CalendarProps{
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}

function Calendar(props: CalendarProps) {
  const {
    value: propsValue,
    defaultValue,
    onChange
  } = props;

  const [mergedValue, setValue] = useMergeState(new Date(), {
    value: propsValue,
    defaultValue,
    onChange
  });

  return <div>
    {mergedValue?.toLocaleDateString()}
    <div onClick={()=> {setValue(new Date('2024-5-1'))}}>2023-5-1</div>
    <div onClick={()=> {setValue(new Date('2024-5-2'))}}>2023-5-2</div>
    <div onClick={()=> {setValue(new Date('2024-5-3'))}}>2023-5-3</div>
  </div>
}

function App() {
  const [value, setValue] = useState(new Date('2024-5-1'));

  return <Calendar value={value} onChange={(date) => {
    console.log(date.toLocaleDateString());
    setValue(date);
  }}/>
  // return <Calendar defaultValue={new Date('2024-5-1')} onChange={(date) => {
  //   console.log(date.toLocaleDateString());
  // }}/>
}

export default App
```

![](image-45.webp)

这里把 onChange 传入了，然后 setState 的时候拿到新的状态值，如果是非受控模式就 setStateValue，然后调用 onChange。

这里要拿到之前的 value 值，考虑闭包陷阱的问题，所以用 useCallback 加上 stateValue 作为依赖来解决。

用的时候就不用区分受控非受控了，直接 setState 就行：

![](image-46.webp)

试试效果：

非受控模式：

![](image-47.webp)

![](image-48.webp)

受控模式：

![](image-49.webp)

![](image-50.webp)

完美！

这样，我们的组件就同时支持了受控模式和非受控模式。

## 总结

涉及到用户输入的组件都要考虑用受控模式还是非受控模式。

**value 由用户控制就是非受控模式，由代码控制就是受控模式**。

非受控模式就是完全用户自己修改 value，我们只是设置个 defaultValue，可以通过 onChange 或者 ref 拿到表单值。

受控模式是代码来控制 value，用户输入之后通过 onChange 拿到值然后 setValue，触发重新渲染。

单独用的组件，绝大多数情况下，用非受控模式就好了，因为你只是想获取到用户的输入。

受控模式只在需要对用户的输入做一些修改然后再设置到 value 的情况用，再就是实时同步表单值到父组件的时候，比如 Form。

如果需要结合 Form 表单用，那是要支持受控模式，因为 Form 会通过 Store 来统一管理所有表单项。

封装业务组件的话，用非受控模式或者受控都行。

但是基础组件还是都要支持，也就是支持 defaultValue 和 value + onChange 两种参数，内部通过判断 value 是不是 undefined 来区分。

写组件想同时支持受控和非受控，可以直接用 ahooks 的 useControllableValue，也可以自己实现。

arco design、ant design 等组件库都是这么做的，并且不约而同封装了 useMergedValue 的 hook，我们也封装了一个。

理清受控模式和非受控模式的区别，在写组件的时候灵活选用或者都支持。

## 常见考点

1.  **受控组件与非受控组件**：<br>
  - 请解释什么是受控组件和非受控组件，并给出它们的使用场景。
  - 在React中，如何实现一个受控组件和一个非受控组件？
2.  **表单状态管理**：<br>
  - 在React中，通常如何管理表单的状态？
  - 能否给出一个使用`useState` Hook管理表单状态的示例？
3.  **表单验证**：<br>
  - 请描述在React中实现表单验证的常见方法。
  - 能否给出一个使用自定义Hook或第三方库（如Formik、Yup）进行表单验证的示例？
4.  **表单提交**：<br>
  - 在React中，如何优雅地处理表单提交事件？
  - 能否展示一个包含表单验证和提交逻辑的完整表单组件示例？
5.  **性能优化**：<br>
  - 在处理大型表单或频繁更新的表单时，有哪些性能优化的技巧？
  - 如何避免不必要的重新渲染和性能瓶颈？
