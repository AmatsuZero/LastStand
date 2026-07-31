+++
title = "条件渲染的常见方法和注意事项"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-02-11T00:00:00+08:00'
draft = true
weight = 7
tags = ["面试", "前端", "React", "条件渲染的常见方法和注意事项", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 条件渲染方式

### 1. if 语句

先从 React 最基本的条件类型来看。如果有数据就显示组件，如果没有数据就不显示任何内容。`posts` 为需要渲染的列表：

```javascript
export default function App() {
  const { posts } = usePosts();

  if (!posts) return null;

  return (
    <div>
      <PostList posts={posts} />
    </div>
  );
}
```

这种形式会生效的原因就是我们会提前返回，如果满足条件（`posts` 值不存在），就通过`return null` 在组件中不显示任何内容。

如果有多个要检查的条件时，也可以使用 `if` 语句。例如，在显示数据之前检查加载和错误状态：

```javascript
export default function App() {
  const { isLoading, isError, posts } = usePosts();
   
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error!</div>;

  return (
    <div>
      <PostList posts={posts} />
    </div>
  );
}
```

这里我们可以多次使用 `if` 语句，不需要再使用 `else` 或者 `if-eles` 语句，这样就减少了需要编写的代码，并且可读性更强。

### 2. 三元运算符

当我们想提前退出或者什么都不显示时，if 语句会很有用。但是，如果我们不想写一个与返回的 JSX 分开的条件，而是直接在其中写呢？那就可以使用三元表达式来编写条件。

在 React 中，我们必须在 JSX 中包含表达式，而不是语句。这就是为什么我们在 JSX 中只能使用三元表达式，而不是 if 语句来编写条件。

例如，在移动设备的屏幕上显示一个组件，而在更大的屏幕上显示另一个组件，就可以使用三元表达式来实现：

```javascript
export default function App() {
  const isMobile = useWindowSize()

  return (
    <main>
      <Header />
      {isMobile ? <MobileChat /> : <Chat />}
    </main>
  )
}
```

其实，不必将这些三元表达式包含在 JSX 中，可以将其结果分配给一个变量，然后在需要的地方使用即可：

```javascript
export default function App() {
  const isMobile = useWindowSize();
    
  const ChatComponent = isMobile ? <MobileChat /> : <Chat />;

  return (
    <main>
      <Header />
      <Sidebar />
      {ChatComponent}
    </main>
  )
}
```

### 3. &&运算符

在许多情况下，我们可能想要使用三元表达式，但是如果不满足条件，就不显示任何内容。那代码会是这样的：

```javascript
condition ? <Component /> : null.
```

可以使用 && 运算符来简化：

```javascript
export default function App() {
  const { posts, hasFinished } = usePosts()

  return (
    <>
      <PostList posts={posts} />
      {hasFinished && (
        <p>已经到底啦!</p>
      )}
    </>
  )
}
```

如果条件为真，则逻辑 && 运算符之后的表达式将是输出。如果条件为假，React 会忽略并跳过表达式.

### 4. switch

过多的 if 语句会导致组件变得混乱，可以将多个条件提取到包含 switch 语句的单独的组件中（根据组件逻辑的复杂程度来选择是否提取到单独的组件）。下面来看一个简单的菜单切换组件：

```javascript
export default function Menu() {
  const [menu, setMenu] = React.useState(1);

  const toggleMenu = () => {
    setMenu((m) => {
      if (m === 3) return 1;
      return m + 1;
    });
  }

  return (
    <>
      <MenuItem menu={menu} />
      <button onClick={toggleMenu}>切换菜单</button>
    </>
  );
}

function MenuItem({ menu }) {
  switch (menu) {
    case 1:
      return <Users />;
    case 2:
      return <Chats />;
    case 3:
      return <Rooms />;
    default:
      return null;
  }
}
```

由于使用带有 switch 语句的 MenuItem 组件父菜单组件不会被条件逻辑弄乱，可以很容易地看到给定 menu 状态将显示哪个组件。需要注意，必须为 switch case 运算符使用默认值，因为在 React 中，组件始终需要返回一个元素或 null。

### 5. 枚举

在 JavaScript 中，当对象用作键值对的映射时，它可以用作枚举：

```css
const ENUMOBJECT = {
  a: '1',
  b: '2',
  c: '3',
};
```

假如要创建三个不同的组件 Foo、Bar 和 Default，并根据某种状态显示这些组件：

```javascript
const Foo = () => {
  return <button>FOO</button>;
};
const Bar = () => {
  return <button>BAR</button>;
};
const Default = () => {
  return <button>DEFAULT</button>;
};
```

创建可用作枚举的对象：

```javascript
const ENUM_STATES = {
  foo: <Foo />,
  bar: <Bar />,
  default: <Default />
};
```

渲染这个枚举对象的函数：

```javascript
function EnumState({ state }) {
  return <div>{ENUM_STATES[state]}</div>;
}
```

上面的 `state` 属性可以从对象中检索值。可以看到，与 switch case 运算符相比，它更具可读性。

### 6. JSX 库

JSX Control Statements 库扩展了 JSX 的功能，从而可以直接使用 JSX 实现条件渲染。它是一个 Babel 插件，可以在转译过程中将类似组件的控制语句转换为对应的 JavaScript。

安装`babel-plugin-jsx-control-statements`包并修改 Babel 配置后，可以像这样重写应用程序：

```javascript
export default function App(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    //...

    return (
      <Choose>
        <When condition={isLoggedIn}>
        <button>Logout</button>;
        </When>
          <When condition={!isLoggedIn}>
          <button>Login</button>;
        </When>
      </Choose>
    );
}
```

当然，不建议这样来编写条件语句，这样会导致代码的可读性变差，并且 JSX 允许使用强大的 JavaScript 功能来自己处理条件渲染，无需添加模板组件即可启用它。

### 7. 高阶组件

高阶组件 (HOC)与 React 中的条件渲染完美匹配。HOC 可以帮助处理多个用例，但一个用例可能是使用条件渲染来改变组件的外观。让我们看看显示元素或组件的 HOC：

```javascript
function withLoadingIndicator(Component) {
  return function EnhancedComponent({ isLoading, ...props }) {
    if (!isLoading) {
      return <Component {...props} />;
    }

    return (
      <div>
        <p>Loading</p>
      </div>
    );
  };
}

const ListWithLoadingIndicator = withLoadingIndicator(List);

function App({ list, isLoading }) {
  return (
      <ListWithLoadingIndicator isLoading={isLoading} list={list} />
  );
}
```

在这个例子中，List 组件可以专注于呈现列表。而不必再加载状态。HOC 隐藏了实际组件中的所有干扰。最终，可以添加多个高阶组件来隐藏多个条件渲染边缘情况。

## 注意事项

### 1. 小心 0

来看一个常见的渲染示例，当数组中存在元素时才渲染内容：

```matlab
{gallery.length && <Gallery slides={gallery}>}
```

预想的结果是，数组存在元素时渲染内容，不存在元素时什么都不渲染。但是，页面上得到了 “0”。这是因为在使用与运算符时，一个假的左侧值（如 0）会立即返回。在JavaScript中，布尔运算法不会将其结果转化为布尔值。所以，React 将得到的值放入DOM中，与 false 不同的是，0 是一个有效的 React 节点，所以最终会渲染成0。

那该如何避免这个问题呢？可以显式的将条件转换为布尔值，当表达式结果为`false`时，就不会在页面中渲染了：

```matlab
gallery.length > 0 && jsx

!!gallery.length && jsx

Boolean(gallery.length) && jsx
```

或者使用三元表达式来实现：

```javascript
{gallery.length ? <Gallery slides={gallery} /> : null}
```

### 2. 优先级

与运算符（&&）比或运算符（||）具有更高的优先级。所以，要格外小心使用包含与运算符的 JSX 条件：

```ini
user.anonymous || user.restricted && <div className="error" />
```

这样写就相当于：

```ini
user.anonymous || (user.restricted && <div className="error" />)
```

这样，与运算符左侧为真时就会直接返回，而不会继续执行后面的代码。所以，多数情况下，看到或运算符时，就将其使用括号括起来，避免因为优先级问题而渲染出错：

```ini
{(user.anonymous || user.restricted) && <div className="error" />}
```

### 3. 嵌套三元表达式

三元表达式适合在两个JSX之间进行切换，一旦超过两个项目，代码就会变得糟糕：

```javascript
{
  isEmoji
    ? <EmojiButton />
    : isCoupon
        ? <CouponButton />
        : isLoaded && <ShareButton />
}
```

有时使用 && 来实现会更好，不过一些条件判断会重复：

```javascript
{isEmoji && <EmojiButton />}
{isCoupon && <CouponButton />}
{!isEmoji && !isCoupon && isLoaded && <ShareButton />}
```

当然，这种情况下，使用 if 语句可能是更好的选择：

```javascript
const getButton = () => {
    if (isEmoji) return <EmojiButton />;
    if (isCoupon) return <CouponButton />;
    return isLoaded ? <ShareButton /> : null;
};
```

### 4. 避免 JSX 作为条件

通过 props 传递的 React 元素能不能作为判断条件呢？来看一个简单的例子：

```javascript
const Wrap = (props) => {
    if (!props.children) return null;
    return <div>{props.children}</div>
};
```

我们希望 Wrap 在没有包含内容时呈现 null，但 React 不是这样工作的：

- `props.children` 可以是一个空数组，例如 `<Wrap>{[].map(e => <div />)}</Wrap>`
- `children.length` 也失败了：children 也可以是单个元素，而不是数组，例如：`(<Wrap><div /></Wrap>)`
- `React.Children.count(props.children)`支持单个子项和多个子项，但会认为 `<Wrap>{false && 'hi'}{false && 'there'}</Wrap>` 包含 2 个项，而实际上有没有任何子项
- `React.Children.toArray(props.children)` 移除无效节点，例如 false。然而，对于一个空片段，仍然是正确的：`<Wrap><></><Wrap>`
- 如果将条件渲染移动到组件内：`<Wrap><Div hide /></Wrap>` 与 `Div = (p) => p.hide ？null : <div />`，在 Wrap 渲染时永远无法知道它是否为空，因为 react 只会在父级之后渲染子级 div，而有状态的子级可以独立于其父级重新渲染。

因此，不要将JSX作为判断条件，避免出现一些难以预料的问题。

### 5. 重新挂载还是更新？

用三元表达式编写的 JSX 感觉就像是完全独立的代码：

```javascript
{hasItem ? <Item id={1} /> : <Item id={2} />}
```

当 `hasItem` 改变时会发生什么？我的猜测是 `<Item id={1} />` 卸载，然后 `<Item id={2} />` 安装，因为这里写了 2 个单独的 JSX 标签。然而，React 并不知道也不关心我们写了什么，它所看到的只是 `Item` 元素在同一个位置，所以它保持挂载的实例，更新 props。上面的代码等价于 `<Item id={hasItem ? 1：2} />`。

> 注意：如果三元表达式包含的是不同的组件，如 `{hasItem ? <Item1 /> : <Item2 />}`，hasItem改变时，React 会重新挂载，因为 Item1 无法更新为 Item2。

上述情况会导致一些意外的行为：

```ini
{
  mode === 'name'
    ? <input placeholder="name" />
    : <input placeholder="phone" />
}
```

这里，如果在 name 的 input 中输入了一些内容，然后切换模式（mode），在 name 中输入内容的就会泄漏到 phone 的 input 中，这可能会对依赖于先前状态的复杂更新机制造成更大的破坏。

这里的一种解决方法是使用 key。通常，我们用它来渲染列表，但它实际上是 React 的元素标识提示——具有相同 key 的元素是相同的逻辑元素：

```ini
{
  mode === 'name'
    ? <input placeholder="name" key="name" />
    : <input placeholder="phone" key="phone" />
}
```

另一种方法是用两个单独的 && 块来替换三元表达式。当 key 不存在时，React 会回退到子数组中项目的索引，因此将不同的元素放在不同的位置与显式定义 key 的效果是一样的：

```ini
{mode === 'name' && <input placeholder="name" />}
{mode !== 'name' && <input placeholder="phone" />}
```

## 常见考点

## **1. 条件渲染常见方法**

### **(1) 使用 `if`/`else` 语句**

- 最直观的条件渲染方式是通过 `if` 和 `else` 来控制要渲染的内容。

**考察点：**

- 适用场景：根据某些条件渲染不同的组件或元素。
- 语法：  
```jsx
let content;
if (isLoggedIn) {
  content = <h1>Welcome back!</h1>;
} else {
  content = <h1>Please log in</h1>;
}
return <div>{content}</div>;
```

### **(2) 使用三元运算符 (`? :`)**

- 三元运算符是条件渲染的常见方式，适用于简单的条件判断。

**考察点：**

- 简单的条件判断可以直接用三元运算符渲染。
- 语法：  
```jsx
return (
  <div>
    {isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in</h1>}
  </div>
);
```

### **(3) 使用 `&&` 运算符**

- 使用 `&&` 进行条件渲染时，当条件为 `true` 时，渲染右侧的内容。如果为 `false`，什么都不渲染。

**考察点：**

-  **适用场景：** 渲染某些内容时，只需在条件为 `true` 时显示。 
-  语法：  
```jsx
return (
  <div>
    {isLoggedIn && <h1>Welcome back!</h1>}
  </div>
);
```
-  **注意：** 如果条件为 `false`，什么也不会渲染。 

### **(4) 使用 `Switch` 和 `Case` 语法**

- 可以使用 `switch` 来根据不同的条件渲染多个选项，适用于需要多个不同条件判断的场景。

**考察点：**

- **适用场景：** 多条件判断。
- 语法：  
```jsx
const renderContent = () => {
  switch (status) {
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      return <div>Content loaded successfully!</div>;
    case 'error':
      return <div>Error loading content</div>;
    default:
      return <div>Unknown status</div>;
  }
};
return <div>{renderContent()}</div>;
```

---

## **2. 条件渲染的注意事项**

### **(1) 条件渲染中的 `null` 和 `false`**

- 在 React 中，如果条件渲染的内容是 `null` 或 `false`，它不会被渲染。  
  - 例如：`{condition && <SomeComponent />}`，当 `condition` 为 `false` 时，`<SomeComponent />` 不会被渲染。

**考察点：**

- 解释 `null` 和 `false` 在条件渲染中的表现。
- 如何避免渲染不必要的内容？

### **(2) 避免不必要的 `undefined` 渲染**

- 在 JSX 中直接使用 `undefined` 作为条件时，它会被忽略渲染，但是对于复杂条件，可能需要显式的检查 `null` 或 `undefined`。

```jsx
const content = undefined;
return <div>{content}</div>; // 什么都不渲染
```

**考察点：**

- 如何避免 `undefined` 或 `null` 的错误渲染？
- 使用条件渲染时，确保返回有效内容。

### **(3) 避免使用 `else` 或 `else if` 直接渲染多个分支**

- 使用 `else` 或 `else if` 时，会增加嵌套层级，使代码复杂，不易维护。一般推荐使用 **三元运算符** 或 **`&&` 运算符** 进行简洁的渲染。

**示例问题：**

- 为什么条件渲染时，建议避免使用 `else` 和 `else if` 嵌套？

### **(4) 异常情况的渲染**

- 在渲染时可能会遇到意外的情况（如加载错误），需要预先考虑处理错误或显示占位符内容。

```jsx
return (
  <div>
    {isLoading ? <LoadingSpinner /> : <ActualContent />}
  </div>
);
```

### **(5) 控制渲染的性能**

- **避免不必要的渲染**：条件渲染本身不会影响性能，但不必要的渲染会影响性能，尤其是当组件树较复杂时。
- 使用 `React.memo` 和 `useMemo` 来避免不必要的渲染。

**考察点：**

- 如何通过 **`React.memo`** 优化条件渲染？
- **`useMemo`** 是否能优化条件渲染性能？

---

## **3. 条件渲染的最佳实践与优化**

### **(1) 将条件渲染的逻辑提取到函数外部**

- 将复杂的条件渲染逻辑提取到组件外部的函数或变量中，能提高代码的可读性和可维护性。

```jsx
function renderContent(status) {
  if (status === 'loading') {
    return <Loading />;
  } else if (status === 'error') {
    return <Error />;
  }
  return <Content />;
}

return (
  <div>
    {renderContent(status)}
  </div>
);
```

**考察点：**

- 如何提升条件渲染代码的可读性和可维护性？
- 如何将复杂的条件渲染拆解成更小的函数或组件？

### **(2) 使用函数组件和 Hooks 进行条件渲染**

- 利用 **`useState`** 和 **`useEffect`** 来动态控制渲染内容。例如，在加载数据时显示加载动画，数据加载完成后再显示结果。

```jsx
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  fetchData().then(() => setIsLoading(false));
}, []);

return (
  <div>
    {isLoading ? <LoadingSpinner /> : <DataDisplay />}
  </div>
);
```

**考察点：**

- 如何利用 `useState` 和 `useEffect` 优化条件渲染的性能？

### **(3) 使用 Suspense 和 ErrorBoundary 处理异步条件渲染**

- **React Suspense** 和 **ErrorBoundary** 可以帮助你处理异步组件和错误渲染，确保在加载过程中展示加载占位符，加载失败时展示错误提示。

```jsx
<Suspense fallback={<LoadingSpinner />}>
  <MyAsyncComponent />
</Suspense>
```

**考察点：**

- 如何在 React 中使用 `Suspense` 进行异步渲染？
- `ErrorBoundary` 在条件渲染中的作用是什么？

---

## **4. 条件渲染与状态管理的结合**

### **(1) 使用 `useContext` 和条件渲染**

- 使用 React Context API 配合条件渲染实现更灵活的 UI。例如，根据用户身份展示不同的内容或组件。

```jsx
const UserContext = React.createContext(null);

function UserProfile() {
  const user = useContext(UserContext);

  return user ? <UserDetails /> : <LoginPrompt />;
}
```

**考察点：**

- 如何使用 `useContext` 和条件渲染结合来控制用户界面？
