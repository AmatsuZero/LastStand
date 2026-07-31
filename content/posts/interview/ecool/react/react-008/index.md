+++
title = "列表和key"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-02-11T00:00:00+08:00'
draft = true
weight = 8
tags = ["面试", "前端", "React", "列表和key", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
当我们在 React 要渲染一个列表时，如果没有在每一个被渲染的元件加上 key 这个 prop，就会跳出 `Warning: Each child in a list should have a unique “key” prop.` 这个错误讯息。直到开发者把 `key` 加上后，这个警告讯息才会消失。为什么要加上 key? 以及 key 有什么原则需要遵守? 这是在开发 React 时需要有的重要概念，也是面试经常会问的基础题。

## 为什么需要 key？

key 就像一个独特身份，让 React 可以去分辨哪些子元件被新增、 移除，或是修改。 (编按：若要进一步说明此概念，推荐在面试时画下 Dan Abramov 的这个系列推文[例子](https://twitter.com/dan_abramov/status/1415279090446204929))

![](image-01.jpeg)

从上面的例子可以看到，当今天红黄蓝三个圈，变成红蓝黄；这会有两个可能性。可能性一第二个圈跟第三个圈的位置互换；可能性二是位置没互换，但第二个圈变蓝色、第三个圈变黄色。如果没有一个独特辨识的机制，我们会没办法知道，究竟是哪一个可能性。

如果没办法有效辨识，将可能出现 bug。举例来说，假如今天的圈圈是有状态的，例如里面有勾选方块，然后第个二圈有被勾选。假如今天换颜色是因为第二个圈被交换到第三个位置，这时表示新一次的渲染时，第三个圈要是被勾选的。不过假如我们没有一个辨识机制，要是 React 误以为换颜色不是因为换位置，而是单纯的第二个圈换颜色，那么将会渲染出仍是第二个圈是被勾选的；那么这就会是一个 bug。

然而，有了 key 这个辨识机制，React 就会知道在新的一次渲染时，原本的状态应该被保留在列表中的哪一个元件中。因此，React 之所以需要 key，正是因为 key 可以让 React 知道，哪些子元件被新增、 移除，或是修改。

除此之外，看到下面这段 React 官方文件的例子 (编按：面试时也推荐直接举这例子)。原本有个列表，我们在最上方新增一个 `<li>Connecticut</li>` ，如果没有 key，对 React 来说将会是，Duke 变成 Connecticut、Villanova 变成 Duke，而最后新增一个 Villanova。换句话说，整个列表都改变了，所以 React 会打掉旧的，重建一个新的列表。当列表变大时，就会很消耗效能。

```jsx
// 原本
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

// 改变后
<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```

然而，如果有了 key。 React 透过 key 发现 2015 与 2016 都没有变，所以不动他们。这时只会在最上面多加上

```jsx
<li key="2014">Connecticut</li>
```

这比起打掉整个列表再重建，会有效率非常多。

```jsx
// 原本
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

// 改变后
<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```

总结来说，key 可以让 React 知道，哪些子元件被新增、 移除，或是修改。这一来可以避免一些跟状态改变有关的 bug，二来也可以让 React 在更新时的渲染更有效率。

## 追问题：使用 key 有哪些原则要遵守?

### key 需要是独特唯一 (unique)

如上面提到 key 是让 React 用来辨认列表中的子元件的机制，因此 key 需要是独特唯一，不然会有潜在的 bug 的可能性。

### key 需要稳定且可预测，不然效能会变差

举例来说，不能用 `key= {Math.random()}` 。之所以不能用随机值，是因为 React 的渲染机制与背后的演算法，会再遇到`key` 时，去比对原本的节点，如果发现 key 不一样，React 就会把旧的节点销毁，然后创建一个新的节点。如果该节点根本没有改变，只因为 key 不同就被打掉重建，这将会造成不必要的重建，也会让效能变差(编按：有兴趣多了解可读[这篇 React 的官方文件](https://reactjs.org/docs/reconciliation.html#tradeoffs))。

### 避免把 index 当成 key

事实上，如果没有特别去设定 key，React 预设会把列表的 index 当成 key。如果这个列表都不会有顺序上的改变，例如上面的三个圈圈不会有位置交换，只有圈圈本身的颜色改变，那不会有什么问题。只是如果有位置的改变，把 index 当成 key 就可能产生 bug。

举例来说，今天如果有下面这样的列表，我们在 index 为 1 的地方加入一个项目，这时会导致原本 index 为 1 的变成 2。如果 index 为 1 的本来有一些状态，例如原本 Duke 有被勾选，这时会变成 Boston 被勾选，但是 Duke 反而没被勾选。这是我们要避免的 bug！

```jsx
// 插入新元件前
<ul>
  <li key="0">Connecticut</li>
  <li key="1">Duke</li>
  <li key="2">Villanova</li>
</ul>

// 插入新元件后
<ul>
  <li key="0">Connecticut</li>
    <li key="1">Boston</li>
  <li key="2">Duke</li>
  <li key="3">Villanova</li>
</ul>
```

总结来说，key 需要是独特唯一、key 需要是稳定可预测，以及避免用 index 作为 key。这三点是我们在使用 key 时需要避免的。

## 常见考点

## **1. 列表渲染**

### **(1) 使用 `map()` 渲染列表**

- React 通常使用 `map()` 方法来渲染列表。在 `map()` 方法中，返回的是一个 React 元素的数组。

**考察点：**

- `map()` 的基本用法。
- 如何正确地将数据渲染为组件。

```jsx
const items = ['apple', 'banana', 'cherry'];

return (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
```

### **(2) 列表渲染与条件渲染结合**

- 在渲染列表时，可能会与条件渲染结合，展示不同的内容。

**考察点：**

- 如何结合条件渲染控制渲染列表内容的显示或隐藏。
- 使用 `map()` 渲染时，如何使用条件判断来决定某个列表项是否展示。

```jsx
const items = ['apple', 'banana', 'cherry'];

return (
  <ul>
    {items.map((item, index) => (
      item !== 'banana' ? <li key={index}>{item}</li> : null
    ))}
  </ul>
);
```

### **(3) 渲染复杂的列表项**

- 如果列表项比较复杂，可能需要渲染组件而不是简单的元素。比如每个列表项可能是一个带有多个子组件的复杂结构。

**考察点：**

- 如何将每个列表项提取为单独的子组件来提高代码的可维护性。

```jsx
function ListItem({ item }) {
  return (
    <div>
      <h2>{item.title}</h2>
      <p>{item.description}</p>
    </div>
  );
}

const items = [{ title: 'Item 1', description: 'Description 1' }, { title: 'Item 2', description: 'Description 2' }];
return (
  <div>
    {items.map(item => (
      <ListItem key={item.title} item={item} />
    ))}
  </div>
);
```

---

## **2. `key` 的使用与优化**

### **(1) 为什么需要 `key`？**

- `key` 是 React 用来标识列表中每个元素的唯一标识符，它能帮助 React 高效地更新和重新渲染列表中的元素。

**考察点：**

- `key` 在列表渲染中的作用：帮助 React 判断哪些元素被修改、添加或删除。
- 如果没有 `key`，React 会依赖索引（`index`）进行优化，但这会导致一些潜在问题。

```jsx
// 正确示例
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// 错误示例：使用索引作为 key
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
```

### **(2) `key` 的性能优化**

- 使用 `key` 提高性能，减少不必要的 DOM 更新。
- 不同于常规的组件更新，React 会优先对比 `key` 的变化来优化渲染过程。

**考察点：**

- `key` 的优化如何影响性能。
- 如果不使用合适的 `key`，可能导致的问题。

### **(3) `key` 的唯一性与稳定性**

- `key` 的值应该在整个列表中是唯一的。为了确保列表正确更新，不应使用非唯一的 `key`，如使用 `index` 作为 `key`。
- 对于动态列表，使用 `id` 或其他可以唯一标识每个项的属性作为 `key`。

**考察点：**

- 为什么在动态更新的列表中，使用 `index` 作为 `key` 会有问题？（例如，插入、删除元素时，组件可能会被错误地复用）

### **(4) 使用 `key` 在渲染顺序变化时的影响**

- 当列表的渲染顺序发生变化时，React 会基于 `key` 来对比和复用 DOM 元素。

**考察点：**

- 如何确保正确使用 `key` 处理顺序变化的渲染问题？

```jsx
const items = [1, 2, 3];

const [state, setState] = useState(items);

// 在按下按钮时交换第一个和第三个项
const handleSwap = () => {
  setState([state[2], state[1], state[0]]);
};

return (
  <div>
    <button onClick={handleSwap}>Swap</button>
    <ul>
      {state.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);
```

---

## **3. 列表与 `key` 的性能优化**

### **(1) 批量更新与最小化重渲染**

- 通过正确使用 `key`，React 可以最小化每次更新时的 DOM 重排，提高性能。
- 如何避免频繁的重新渲染？例如，列表数据的更新可以通过局部更新而不是完全重新渲染。

**考察点：**

- `key` 如何帮助 React 识别和更新仅发生变化的元素？
- 如何确保高效更新组件，避免重新渲染整个列表？

### **(2) 列表更新时的 DOM 操作**

- 在 `key` 使用得当时，React 可以只更新被修改的 DOM 元素，不需要完全重渲染整个列表。

**考察点：**

- `key` 如何帮助 React 更智能地进行 DOM 比对和更新？

### **(3) 虚拟化大数据列表**

- 对于大数据列表的渲染，React 可能会通过 **虚拟化技术** 来优化渲染过程，仅渲染视口内可见的元素。
- 使用如 **react-window** 或 **react-virtualized** 等库，虚拟化列表提高性能。

**考察点：**

- 对于大数据量的列表，如何通过虚拟化减少 DOM 渲染，提高性能？
- `key` 在这些库中如何发挥作用？

---

## **4. 注意事项与常见问题**

### **(1) 不应使用索引作为 `key`**

- 在列表项发生动态变化（如排序、删除等）时，如果使用 `index` 作为 `key`，可能会导致不必要的 DOM 重渲染或渲染错误。
- 在列表项删除或排序时，React 会误将某些元素复用，导致状态丢失或样式错误。

**考察点：**

- 为什么使用 `index` 作为 `key` 可能会带来问题？举例说明。

### **(2) `key` 与组件状态**

- 在更新列表时，组件的状态也可能会受到影响，如何确保在更新时保持每个元素的状态。

**考察点：**

- 如何处理列表项状态在排序、插入、删除时不丢失？
