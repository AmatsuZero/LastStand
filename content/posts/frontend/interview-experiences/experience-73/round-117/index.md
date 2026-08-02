+++
title = "百度-小程序-暑期实习 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/73"
experienceId = 73
roundId = 117
roundOrder = 1
company = "百度"
date = "2025-08-21T15:43:17.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-73/_index.md" >}}) · 已是最后一轮 →

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 深拷贝浅拷贝有什么区别？怎么实现深拷贝？ {#question-a5330a58-5be0-4f4f-8394-43392311ddaa}

> 题库原题：[深拷贝浅拷贝有什么区别？怎么实现深拷贝？](https://fe.ecool.fun/topic/a5330a58-5be0-4f4f-8394-43392311ddaa)

### 题目要点

JS数据类型分别基本数据类型和引用数据类型，基本数据类型保存的是值，引用类型保存的是引用地址(this指针)。

浅拷贝共用一个引用地址，深拷贝会创建新的内存地址。

#### 浅拷贝方法

- 直接对象复制
- Object.assign

#### 深拷贝

- JSON.stringify转为字符串再JSON.parse
- 深度递归遍历

<details>
<summary>参考答案</summary>

## 一、数据类型存储

前面文章我们讲到，`JavaScript`中存在两大数据类型：

- 基本类型
- 引用类型

基本类型数据保存在在栈内存中

引用类型数据保存在堆内存中，引用数据类型的变量是一个指向堆内存中实际对象的引用，存在栈中

## 二、浅拷贝

浅拷贝，指的是创建新的数据，这个数据有着原始数据属性值的一份精确拷贝

如果属性是基本类型，拷贝的就是基本类型的值。如果属性是引用类型，拷贝的就是内存地址

即浅拷贝是拷贝一层，深层次的引用类型则共享内存地址

下面简单实现一个浅拷贝

```js
function shallowClone(obj) {
    const newObj = {};
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop)){
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
}
```

在`JavaScript`中，存在浅拷贝的现象有：

- `Object.assign`
- `Array.prototype.slice()`, `Array.prototype.concat()`
- 使用拓展运算符实现的复制

### Object.assign

```js
var obj = {
    age: 18,
    nature: ['smart', 'good'],
    names: {
        name1: 'fx',
        name2: 'xka'
    },
    love: function () {
        console.log('fx is a great girl')
    }
}
var newObj = Object.assign({}, obj);
```

### slice()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.slice(0)
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### concat()

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.concat()
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### 拓展运算符

```js
const fxArr = ["One", "Two", "Three"]
const fxArrs = [...fxArr]
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

## 三、深拷贝

深拷贝开辟一个新的栈，两个对象的属性完全相同，但是对应两个不同的地址，修改一个对象的属性，不会改变另一个对象的属性

常见的深拷贝方式有：

- _.cloneDeep()

- jQuery.extend()
- JSON.stringify()
- 手写循环递归

### _.cloneDeep()

```js
const _ = require('lodash');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
```

### jQuery.extend()

```js
const $ = require('jquery');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = $.extend(true, {}, obj1);
console.log(obj1.b.f === obj2.b.f); // false
```

### JSON.stringify()

```js
const obj2=JSON.parse(JSON.stringify(obj1));
```

但是这种方式存在弊端，会忽略`undefined`、`symbol`和`函数`

```js
const obj = {
    name: 'A',
    name1: undefined,
    name3: function() {},
    name4:  Symbol('A')
}
const obj2 = JSON.parse(JSON.stringify(obj));
console.log(obj2); // {name: "A"}
```

### 循环递归

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== "object") return obj;
  // 是对象的话就要进行深拷贝
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}
```

## 四、区别

下面首先借助两张图，可以更加清晰看到浅拷贝与深拷贝的区别

 ![](https://static.ecool.fun//article/8252919d-2855-4ccd-9b2e-d64ce5c07be2.png)

从上图发现，浅拷贝和深拷贝都创建出一个新的对象，但在复制对象属性的时候，行为就不一样

浅拷贝只复制属性指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存，修改对象属性会影响原对象

```js
// 浅拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj3=shallowClone(obj1) // 一个浅拷贝方法
obj3.name = "update";
obj3.arr[1] = [5,6,7] ; // 新旧对象还是共享同一块内存

console.log('obj1',obj1) // obj1 { name: 'init',  arr: [ 1, [ 5, 6, 7 ], 4 ] }
console.log('obj3',obj3) // obj3 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象

```js
// 深拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj4=deepClone(obj1) // 一个深拷贝方法
obj4.name = "update";
obj4.arr[1] = [5,6,7] ; // 新对象跟原对象不共享内存

console.log('obj1',obj1) // obj1 { name: 'init', arr: [ 1, [ 2, 3 ], 4 ] }
console.log('obj4',obj4) // obj4 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

### 小结

前提为拷贝类型为引用类型的情况下：

- 浅拷贝是复制内存中的地址，拷贝前后的对象，因为引用类型共享了同一块内存，修改会相互影响。
- 深拷贝是递归拷贝深层次，属性为对象时，深拷贝是新开栈，两个对象指向不同的地址

</details>

## 2. 如何用JSON.parse(JSON.stringify())实现深拷贝？ {#question-subjective-8f7e845b1727}

### 题目要点

`JSON.parse(JSON.stringify())` 适合 **结构简单、数据类型基础** 的对象深拷贝，如果涉及函数、`Date`、`Map` 等复杂对象，就需要手写递归拷贝或用 `lodash.cloneDeep()` 这样的库。

<details>
<summary>参考答案</summary>

用 `JSON.parse(JSON.stringify(obj))` 实现深拷贝的原理和过程是这样的：

1. **序列化**

   * `JSON.stringify(obj)` 会把一个对象序列化成 JSON 字符串。
   * 这个过程中，所有可枚举的属性会被转换为字符串格式。

2. **反序列化**

   * `JSON.parse(...)` 会把字符串重新解析成一个新的对象。
   * 这样一来，新的对象和原来的对象在内存中是完全独立的，没有引用关系。

所以：

```js
const obj = {
  name: 'Tom',
  age: 20,
  info: {
    city: 'Beijing'
  }
};

const copy = JSON.parse(JSON.stringify(obj));

copy.info.city = 'Shanghai';

console.log(obj.info.city); // 'Beijing'
console.log(copy.info.city); // 'Shanghai'
```

可以看到，修改 `copy` 不会影响原对象，从而实现了“深拷贝”。

### 优点

* 语法简单，一行搞定。
* 能够处理嵌套对象和数组的场景。

### 缺点（局限性）

1. **无法拷贝函数**：函数会丢失（因为 `JSON` 只支持数据）。

   ```js
   const obj = { fn: () => {} };
   JSON.parse(JSON.stringify(obj)); // { }
   ```
2. **无法拷贝 `undefined`、`Symbol`、`BigInt`** 等非 JSON 支持的类型。

   ```js
   const obj = { a: undefined, b: Symbol('x') };
   console.log(JSON.parse(JSON.stringify(obj))); // {}
   ```
3. **无法正确处理特殊对象**：如 `Date` 会变成字符串，`RegExp` 变成空对象，`Map`/`Set` 丢失。

   ```js
   const obj = { d: new Date(), r: /abc/ };
   console.log(JSON.parse(JSON.stringify(obj)));
   // { d: "2025-08-28T08:00:00.000Z", r: {} }
   ```
4. **有循环引用会报错**：

   ```js
   const obj = {};
   obj.self = obj;
   JSON.parse(JSON.stringify(obj)); // 报错
   ```

</details>

## 3. 如何实现WebSocket的断线重连机制？ {#question-dabf3a5e-f0a0-4215-9248-ec012b3b722b}

> 题库原题：[如何实现WebSocket的断线重连机制？](https://fe.ecool.fun/topic/dabf3a5e-f0a0-4215-9248-ec012b3b722b)

### 题目要点

1. **重连时是否保留消息队列**

   * 可以在断开时缓存未发送的消息，等重连后再补发。
2. **避免服务端踢出**

   * 需要和服务端约定心跳协议（如 `ping/pong`），否则可能会被网关/代理关闭连接。
3. **区分“主动关闭”与“异常关闭”**

   * 主动关闭时不需要重连。
4. **移动端环境**

   * 在 App/浏览器后台时可能会被系统挂起，需要特别处理。

<details>
<summary>参考答案</summary>

实现 **WebSocket 的断线重连机制**，一般需要在客户端（浏览器/前端）做一些健壮性处理。核心思路就是：

1. **捕获异常/断开事件**

   * 监听 `onclose`、`onerror`，在连接关闭或出错时，启动重连逻辑。
   * 可选：在 `onmessage` 里做心跳检测，发现服务端长时间未响应也触发重连。

2. **指数退避/固定间隔重连**

   * 避免频繁重连给服务器造成压力。
   * 典型策略：

     * 每次重连延迟 `delay = Math.min(maxDelay, baseDelay * 2^attempt)`
     * 或者使用固定间隔（如 5 秒）。

3. **心跳机制（保持长连接）**

   * 定时发送心跳包（如 `ping`），服务端回应（如 `pong`）。
   * 如果心跳超时未响应，则主动关闭并重连。

### 示例实现（JavaScript）

```js
class ReconnectWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.ws = null;
    this.lockReconnect = false; // 防止重复重连
    this.reconnectDelay = options.reconnectDelay || 2000; // 初始重连间隔
    this.maxDelay = options.maxDelay || 30000; // 最大重连间隔
    this.heartbeatInterval = options.heartbeatInterval || 10000; // 心跳间隔
    this.heartbeatTimer = null;
    this.reconnectTimer = null;

    this.createWebSocket();
  }

  createWebSocket() {
    try {
      this.ws = new WebSocket(this.url);

      this.initEventHandlers();
    } catch (e) {
      this.reconnect();
    }
  }

  initEventHandlers() {
    this.ws.onopen = () => {
      console.log("WebSocket 连接成功");
      this.startHeartbeat();
    };

    this.ws.onmessage = (msg) => {
      console.log("收到消息:", msg.data);
      // 服务端 pong 响应时，重置心跳
      if (msg.data === "pong") {
        this.resetHeartbeat();
      }
    };

    this.ws.onerror = () => {
      console.log("WebSocket 出错");
      this.reconnect();
    };

    this.ws.onclose = () => {
      console.log("WebSocket 关闭");
      this.reconnect();
    };
  }

  reconnect() {
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    console.log("准备重连...");

    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.createWebSocket();
      this.lockReconnect = false;
      // 增加延迟，避免频繁重连
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
    }, this.reconnectDelay);
  }

  startHeartbeat() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log("发送心跳 ping");
        this.ws.send("ping");
      }
    }, this.heartbeatInterval);
  }

  resetHeartbeat() {
    console.log("收到 pong，心跳正常");
  }

  send(msg) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    } else {
      console.log("连接未建立，消息丢弃");
    }
  }
}

// 使用示例
const ws = new ReconnectWebSocket("wss://example.com/socket", {
  reconnectDelay: 2000,
  maxDelay: 30000,
  heartbeatInterval: 10000,
});
```

</details>

## 4. 如何通过虚拟列表解决小程序中长列表渲染卡顿问题？ {#question-subjective-ac0f1d50d1d8}

### 题目要点

小程序的 **渲染层（WebView）** 与 **逻辑层（JS）** 之间通信开销大。一次性渲染过多节点会阻塞页面。

<details>
<summary>参考答案</summary>

## 1. 问题原因

* 小程序的 **渲染层（WebView）** 与 **逻辑层（JS）** 之间通信开销大。一次性渲染过多节点会阻塞页面。
* 长列表滚动过程中，DOM 节点太多会导致渲染性能下降。

---

## 2. 虚拟列表的基本原理

虚拟列表的核心是：

1. **只渲染可见区域的数据**（比如屏幕高度能显示 10 条，就渲染 10\~15 条）；
2. **通过占位容器保持滚动条正确高度**，避免影响用户滚动体验；
3. **在滚动事件中计算可见范围**，动态替换需要渲染的那一段数据。

> 总结：渲染 1000 条 → 实际只渲染几十条，用户感受不到差异，但性能提升明显。

---

## 3. 在小程序中的实现方式

小程序官方提供了 **`<scroll-view>`** 和 **`<movable-view>`** 等组件，但直接放长列表性能差。常见做法：

### 方法一：手写虚拟列表

1. **计算可见区域**

   * 根据容器高度 / 每项高度，算出可显示多少条。
   * 滚动时通过 `scrollTop` 算出当前应该显示的起始索引。

2. **渲染可见数据**

   * `visibleData = list.slice(startIndex, endIndex)`
   * 在 WXML 里只绑定这部分数据。

3. **占位高度**

   * 给整个列表一个 `padding-top`（表示前面隐藏的部分高度）+ `padding-bottom`（表示后面未渲染的部分高度），保持滚动条长度。

示例（伪代码）：

```html
<scroll-view
  scroll-y
  style="height: 100vh;"
  bindscroll="onScroll">
  <view style="height: {{paddingTop}}px;"></view>

  <block wx:for="{{visibleData}}" wx:key="id">
    <view class="item">{{item.text}}</view>
  </block>

  <view style="height: {{paddingBottom}}px;"></view>
</scroll-view>
```

```js
Page({
  data: {
    list: [], // 原始数据
    visibleData: [],
    itemHeight: 50,
    containerHeight: 600,
    startIndex: 0,
    endIndex: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  onLoad() {
    const list = new Array(1000).fill(0).map((_, i) => ({ id: i, text: `item-${i}` }));
    this.setData({ list });
    this.updateVisible(0);
  },
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.updateVisible(scrollTop);
  },
  updateVisible(scrollTop) {
    const { itemHeight, list, containerHeight } = this.data;
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 5; // 多渲染几条，避免空白
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = startIndex + visibleCount;
    this.setData({
      visibleData: list.slice(startIndex, endIndex),
      paddingTop: startIndex * itemHeight,
      paddingBottom: (list.length - endIndex) * itemHeight
    });
  }
});
```

---

### 方法二：使用官方/第三方组件

* **微信小程序官方提供的 `wx.createSelectorQuery` + `scroll-view`** 可以实现，但要自己写逻辑。
* 有现成的 **第三方虚拟列表库**：

  * taro / uni-app 等框架也有现成的 VirtualList 组件。

---

## 4. 注意事项

* **固定高度项更容易实现**（计算快）。如果是动态高度，可以用懒加载 + `IntersectionObserver` 或在滚动时动态计算高度，但实现复杂。
* **提前渲染 buffer 区域**（上下多渲染几条，避免快速滚动出现空白）。
* **避免频繁 setData**，可以用 `requestAnimationFrame` 节流。

</details>

## 5. 对于虚拟滚动的场景，如何动态计算列表项高度？如何优化滚动时的白屏问题？ {#question-subjective-d3510054cac0}

### 题目要点

1. **动态高度计算**：用 DOM 测量 + 前缀和数组；未测量项先给预估值再修正。
2. **白屏优化**：

   * 增加上下 buffer 区域
   * 滚动计算节流（或 `requestAnimationFrame`）
   * 占位符保持滚动条连贯

<details>
<summary>参考答案</summary>

虚拟列表如果每一项高度是固定的，计算可见区非常简单；但在实际业务中（例如电商商品列表、动态内容流），列表项高度经常不一致，这就带来了两个核心问题：

1. **如何动态计算每一项的高度**
2. **滚动快速时如何避免白屏**

## 一、动态计算列表项高度

当列表项高度不固定时，不能只用“索引 × 固定高度”推算可见范围，需要实时统计高度。常见方法有：

### 1. 渲染后测量 DOM 高度

* 在小程序里，可以用 `wx.createSelectorQuery()`；在 Web/React 中可以用 `getBoundingClientRect()`。
* 每次列表项渲染完成后记录该项的实际高度。
* 用一个数组 `heights[]` 存储每项高度，用 `prefixSum[]`（高度前缀和）快速查找任意索引的累计高度。

这样就能在滚动时通过二分查找 `scrollTop` 对应的起始索引。

---

### 2. 逐步懒计算

* 如果一开始不知道全部项的高度，可以只计算“第一次渲染的部分”。
* 随着用户滚动，动态测量并填充剩余项的高度。
* 对未测量的项，可以先给一个 **预估高度**，等渲染后再修正。

这样首屏渲染更快，避免卡顿。

---

## 二、优化滚动时的白屏问题

白屏的本质原因是：

* 渲染区域计算不够快，用户滚动过快时，列表内容还没替换好。

解决办法：

### 1. 缓冲区（buffer）策略

* 除了渲染“正好可见区域”外，再上下额外多渲染几条（如 `+5 ~ +10`）。
* 用户快速滚动时还能看到 buffer 中的数据，避免瞬间空白。
* 代价是多渲染少量元素，但整体性能仍然远优于全量渲染。

---

### 2. 节流 / requestAnimationFrame

* 滚动事件非常频繁（几十次/秒），不能每次都重新计算和 `setData`。
* 最佳做法是用 **节流（throttle）** 或 **`requestAnimationFrame`** 来控制更新频率。
* 这样避免过度重排，提高流畅度。

---

### 3. 占位符容器

* 即使当前渲染的可见数据没准备好，也可以先渲染一个等高的空容器，保持滚动条正常，用户不会看到抖动或错位。
* 数据回来后替换真实内容，用户感知不到白屏。

---

## 三、综合实现思路（伪代码）

```js
class VirtualList {
  constructor(containerHeight) {
    this.containerHeight = containerHeight;
    this.itemHeights = [];  // 每项真实高度
    this.prefixSum = [0];   // 高度前缀和，prefixSum[i] = sum(0..i-1)
  }

  // 更新某项高度
  updateHeight(index, height) {
    this.itemHeights[index] = height;
    this.prefixSum[index + 1] = this.prefixSum[index] + height;
  }

  // 通过 scrollTop 找到可见起点
  findStartIndex(scrollTop) {
    // 二分查找 scrollTop 所在的区间
    let left = 0, right = this.prefixSum.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.prefixSum[mid] <= scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return Math.max(0, left - 1);
  }
}
```

配合滚动事件：

1. 获取 `scrollTop`。
2. 通过前缀和 + 二分查找确定起始索引。
3. 向下渲染可见区域 + buffer。

</details>

## 6. 判断数组的方式有哪些？ {#question-25a1d366-42f6-42e2-9a41-b6dd4624fd55}

> 题库原题：[判断数组的方式有哪些？](https://fe.ecool.fun/topic/25a1d366-42f6-42e2-9a41-b6dd4624fd55)

### 题目要点

- **推荐方法**：使用 `Array.isArray()`，这是最简单、最可靠的方式来检查一个值是否为数组。
- **其他方法**：`instanceof` 和 `Object.prototype.toString.call()` 也很有效，但有一些特定的局限性。`constructor` 和 `isPrototypeOf()` 方法不如 `Array.isArray()` 可靠，且在某些情况下可能会出现问题。

<details>
<summary>参考答案</summary>

判断一个值是否为数组的方式有多种：

### 1. **`Array.isArray()` 方法**

- **描述**：这是 ES5 引入的标准方法，推荐用于检查一个值是否为数组。
- **语法**：`Array.isArray(value)`
- **示例**：
  ```javascript
  console.log(Array.isArray([1, 2, 3])); // true
  console.log(Array.isArray('hello')); // false
  ```

### 2. **`instanceof` 操作符**

- **描述**：使用 `instanceof` 操作符来判断对象是否是 `Array` 的实例。
- **语法**：`value instanceof Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3] instanceof Array); // true
  console.log('hello' instanceof Array); // false
  ```

### 3. **`Object.prototype.toString.call()` 方法**

- **描述**：使用 `Object.prototype.toString.call()` 可以准确判断一个对象的类型，包括数组。它返回 `[object Array]` 对于数组，其他类型则返回不同的结果。
- **语法**：`Object.prototype.toString.call(value)`
- **示例**：
  ```javascript
  console.log(Object.prototype.toString.call([1, 2, 3])); // [object Array]
  console.log(Object.prototype.toString.call('hello')); // [object String]
  ```

### 4. **`constructor` 属性**

- **描述**：检查 `constructor` 属性是否为 `Array`。这种方法不如 `Array.isArray()` 可靠，因为 `constructor` 可以被改变。
- **语法**：`value.constructor === Array`
- **示例**：
  ```javascript
  console.log([1, 2, 3].constructor === Array); // true
  console.log('hello'.constructor === Array); // false
  ```

### 5. **`Array.prototype.isPrototypeOf()` 方法**

- **描述**：检查数组的 `prototype` 是否在目标对象的 `prototype` 链上。这种方法也可以用来判断一个对象是否为数组。
- **语法**：`Array.prototype.isPrototypeOf(value)`
- **示例**：
  ```javascript
  console.log(Array.prototype.isPrototypeOf([1, 2, 3])); // true
  console.log(Array.prototype.isPrototypeOf('hello')); // false
  ```

### 6. **使用 `constructor` 属性和原型链**

- **描述**：结合 `constructor` 属性和原型链检查。这个方法有一定的局限性，不推荐使用。
- **示例**：
  ```javascript
  function isArray(value) {
    return value && typeof value === 'object' && value.constructor === Array;
  }

  console.log(isArray([1, 2, 3])); // true
  console.log(isArray('hello')); // false
  ```

</details>

## 7. 如何用Promise.all实现并发请求？如何处理部分请求失败？ {#question-0326987e-7ab5-4fb7-8bf2-462860cda4e9}

> 题库原题：[如何用Promise.all实现并发请求？如何处理部分请求失败？](https://fe.ecool.fun/topic/0326987e-7ab5-4fb7-8bf2-462860cda4e9)

### 题目要点

* **只要全部成功才继续 → 用 `Promise.all`**
* **要拿到每个请求的完整结果（成功 + 失败） → 用 `Promise.allSettled`**
* **需要容错或兜底值 → 在每个 Promise 上加 catch**

<details>
<summary>参考答案</summary>

## 1. 用 `Promise.all` 实现并发请求

`Promise.all` 的特性是：**等待所有 Promise 全部成功，才会进入 `.then`；如果有一个失败，会立刻进入 `.catch`**。

例子：

```js
function fetchData(url) {
  return fetch(url).then(res => res.json());
}

Promise.all([
  fetchData('/api/user'),
  fetchData('/api/order'),
  fetchData('/api/message'),
]).then(([user, order, message]) => {
  console.log('全部成功:', user, order, message);
}).catch(error => {
  console.error('有请求失败:', error);
});
```

这样就能同时发起多个请求（并发），等结果全部回来再统一处理。

---

## 2. 如何处理 **部分请求失败**

### 方案 A: `Promise.allSettled`（推荐）

* 它不会短路，所有 Promise 都会执行完。
* 返回结果包含 `status: "fulfilled"` 或 `"rejected"`。

```js
Promise.allSettled([
  fetchData('/api/user'),
  fetchData('/api/order'),
  fetchData('/api/message'),
]).then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log('成功:', result.value);
    } else {
      console.error('失败:', result.reason);
    }
  });
});
```

这样就能做到“部分成功也能拿到”。

---

### 方案 B: 手动封装 catch，让 `Promise.all` 不被短路

给每个请求加上 `.catch`，保证它不会抛错，而是返回一个标记：

```js
function safeFetch(promise) {
  return promise
    .then(res => ({ status: 'fulfilled', value: res }))
    .catch(err => ({ status: 'rejected', reason: err }));
}

Promise.all([
  safeFetch(fetchData('/api/user')),
  safeFetch(fetchData('/api/order')),
  safeFetch(fetchData('/api/message')),
]).then(results => {
  console.log(results);
});
```

输出结构和 `allSettled` 一样，但可以兼容旧浏览器（没有 `allSettled` 的情况）。

---

### 方案 C: 按需兜底（部分失败时用默认值）

比如请求失败时，给个默认数据继续用：

```js
Promise.all([
  fetchData('/api/user').catch(() => ({ name: '游客' })),
  fetchData('/api/order').catch(() => []),
  fetchData('/api/message').catch(() => []),
]).then(([user, order, message]) => {
  console.log('即使失败也有默认值:', user, order, message);
});
```

</details>

## 8. 以下代码输出什么？解释原因 {#question-a363afe0-ce04-4c69-8221-a0b8e01c9452}

> 题库原题：[以下代码输出什么？解释原因](https://fe.ecool.fun/topic/a363afe0-ce04-4c69-8221-a0b8e01c9452)

```js
const obj = {
  objName: "百度",
  print: () => console.log(this.objName),
};
obj.print();
```

### 题目要点

* 箭头函数没有自己的 `this`，它继承自定义时的上下文。
* 在对象中定义箭头函数作为方法时，`this` **不会指向该对象**，而是外层作用域。
* 因此这段代码输出 `undefined`，而不是 `"百度"`。

<details>
<summary>参考答案</summary>

这段代码的执行结果是：

```
undefined
```

### 原因解析

1. **箭头函数的 `this` 特性**

   * 箭头函数不会创建自己的 `this`，它的 `this` 来自 **词法作用域**，即它定义时所在的上下文。
   * 在这段代码里，`print` 是用箭头函数定义的，所以它的 `this` 不是 `obj`，而是定义它时所在的环境。

2. **当前环境的 `this`**

   * 这段代码运行在模块或脚本的顶层环境：

     * 在严格模式下，顶层的 `this` 是 `undefined`。
     * 在非严格模式下，顶层的 `this` 是 `window`（浏览器）或 `global`（Node.js）。
   * 不论是哪种情况，顶层对象上都没有 `objName` 属性，因此 `this.objName` 是 `undefined`。

3. **为什么不是 "百度"**

   * 如果把 `print` 定义为普通函数：

     ```js
     print: function() { console.log(this.objName); }
     ```

     那么调用 `obj.print()` 时，`this` 会绑定到 `obj`，输出就是 `"百度"`。
   * 但是箭头函数丢失了这种绑定特性，它固定死了 `this`，因此取不到 `obj` 上的 `objName`。

</details>

## 9. 如何通过bind或箭头函数固定this指向？ {#question-94fc6ad9-ce15-4a8a-babb-1836bec46903}

> 题库原题：[如何通过bind或箭头函数固定this指向？](https://fe.ecool.fun/topic/94fc6ad9-ce15-4a8a-babb-1836bec46903)

### 题目要点

| 特点        | `bind`              | 箭头函数              |
| --------- | ------------------- | ----------------- |
| 绑定时机      | 调用 `bind` 时固定       | 定义时词法绑定           |
| 返回结果      | 返回一个新的函数            | 不生成新的 `this`      |
| 使用场景      | 需要显式传递 `this` 或预设参数 | 需要保持外层作用域的 `this` |
| 是否可作为构造函数 | 可以                  | 不可以               |

<details>
<summary>参考答案</summary>

## 一、问题背景

在 JavaScript 中，`this` 的指向不是在函数定义时确定的，而是 **在函数执行时，由调用方式决定**。
因此，很多情况下我们需要“固定”`this`，保证函数执行时内部的 `this` 始终指向期望的对象。

## 二、使用 **bind** 固定 `this`

`Function.prototype.bind` 会返回一个新的函数，**无论后续如何调用，内部的 `this` 都会固定为指定对象**。

### 示例

```js
const obj = {
  name: "Alice",
  sayHi: function() {
    console.log("Hi, I am " + this.name);
  }
};

const fn = obj.sayHi;
fn(); // 输出: Hi, I am undefined (this丢失)

const boundFn = obj.sayHi.bind(obj);
boundFn(); // 输出: Hi, I am Alice
```

### 特点

1. `bind` 返回一个新的函数，不会立即执行。
2. 绑定的 `this` 一旦确定，无法再被更改。
3. 还可以 **预设参数**，形成偏函数。

   ```js
   function add(a, b) {
     return a + b;
   }
   const add5 = add.bind(null, 5);
   console.log(add5(3)); // 8
   ```

---

## 三、使用 **箭头函数** 固定 `this`

箭头函数没有自己的 `this`，**它的 `this` 来自定义时所在的词法作用域**。

### 示例

```js
const obj = {
  name: "Alice",
  sayHi: function() {
    const inner = () => {
      console.log("Hi, I am " + this.name);
    };
    inner();
  }
};

obj.sayHi(); // 输出: Hi, I am Alice
```

### 特点

1. 箭头函数不会创建自己的 `this`，直接用外层函数的 `this`。
2. 不能用作构造函数（不能 `new`）。
3. 常用于 **回调函数** 或 **事件监听器**，避免丢失 `this`。

</details>

## 10. 实现 Function.prototype.bind {#question-c6c4c722-bd37-41dd-b736-e836260b7863}

> 题库原题：[实现 Function.prototype.bind](https://fe.ecool.fun/topic/c6c4c722-bd37-41dd-b736-e836260b7863)

### 题目要点

核心考查：实现 Function.prototype.bind的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

```js
Function.prototype.bind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new Error("Type Error");
  }
  // 保存this的值
  var self = this;

  return function F() {
    // 考虑new的情况
    if(this instanceof F) {
      return new self(...args, ...arguments)
    }
    return self.apply(context, [...args, ...arguments])
  }
}

```

</details>

## 11. 获取DOM元素的方法 {#question-subjective-f0611ddb91f6}

### 题目要点

* **性能最佳**：`getElementById`
* **灵活强大**：`querySelector / querySelectorAll`
* **适合批量元素**：`getElementsByClassName / getElementsByTagName`

<details>
<summary>参考答案</summary>

### 1. 通过 **ID** 获取

```js
const el = document.getElementById("myId");
```

* 返回单个元素（或 `null`）。
* **效率最高**，推荐在唯一 ID 的情况下使用。

---

### 2. 通过 **类名** 获取

```js
const els = document.getElementsByClassName("myClass");
```

* 返回 **HTMLCollection**（动态集合）。
* 可以通过下标访问，如 `els[0]`。

---

### 3. 通过 **标签名** 获取

```js
const els = document.getElementsByTagName("div");
```

* 返回所有指定标签的元素集合。

---

### 4. 通过 **选择器** 获取

```js
const el = document.querySelector(".myClass"); // 返回第一个匹配元素
const els = document.querySelectorAll(".myClass"); // 返回所有匹配元素（NodeList）
```

* `querySelector` 更加灵活，支持复杂选择器（如 `#id > .class span`）。
* `querySelectorAll` 返回 **静态 NodeList**，不会随 DOM 改变而更新。

---

### 5. 通过 **表单元素的 name 属性** 获取

```js
const els = document.getElementsByName("username");
```

* 返回 NodeList，一般用于表单元素（如 `<input name="username">`）。

---

### 6. 特殊 DOM 获取方式

* `document.body` 获取 `<body>` 元素
* `document.documentElement` 获取 `<html>` 根元素
* `document.forms` 获取页面所有 `&lt;form&gt;`
* `document.images` 获取页面所有 `<img>`
* `document.links` 获取所有 `<a>`（带 `href` 的）

---

### 7. 通过 **父子关系** 获取

```js
const parent = document.getElementById("container");
const children = parent.children; // HTMLCollection 子元素
const first = parent.firstElementChild;
const last = parent.lastElementChild;
```

</details>

## 12. 在Vue中，为什么推荐使用ref而非直接操作DOM？ {#question-965437c7-3f6d-4855-94f7-fa62c3e73196}

> 题库原题：[在Vue中，为什么推荐使用ref而非直接操作DOM？](https://fe.ecool.fun/topic/965437c7-3f6d-4855-94f7-fa62c3e73196)

### 题目要点

在 Vue 中推荐使用 `ref` 而非直接操作 DOM，是为了 **保持响应式编程思想、提高代码可维护性、避免全局污染、增强组件化支持，以及兼容 SSR 和未来扩展**。
直接操作 DOM 只能作为「最后手段」，通常用于操作第三方库或必须访问底层 DOM 的场景。

<details>
<summary>参考答案</summary>

### 1. **保持响应式编程思想**

* Vue 的核心理念是 **数据驱动视图**。
* 如果你频繁通过 `document.querySelector`、`getElementById` 等方式直接操作 DOM，就等于绕过了 Vue 的响应式系统，破坏了「数据变化 → 视图自动更新」的逻辑。
* `ref` 是 Vue 提供的 **在响应式体系内获取 DOM 或组件实例的方式**，不会违背 Vue 的设计哲学。

### 2. **保证可维护性和可读性**

* 使用 `ref` 获取 DOM 元素或子组件时，逻辑清晰，绑定关系一目了然：

```vue
<template>
  <input ref="inputEl" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const inputEl = ref(null)

onMounted(() => {
  inputEl.value.focus()
})
</script>
```

* 而如果用 `document.querySelector('input')`，就会出现以下问题：

  * 不直观，不知道选中的是不是自己想要的节点。
  * 如果 DOM 结构变化，选择器很容易失效。

### 3. **避免全局作用域污染**

* 原生 DOM 操作往往是「全局查询」的，比如 `document.querySelector`。
* 当页面很大时，可能会选中不该选的 DOM，造成隐蔽的 bug。
* `ref` 是 **组件作用域内的绑定**，不会误伤其它组件。

### 4. **更好地支持组件和生命周期**

* `ref` 不仅能绑定 DOM，还能绑定 **组件实例**：

```vue
<ChildComponent ref="child" />

onMounted(() => {
  console.log(child.value.someMethod())
})
```

* 这种方式比手动查找 DOM、再找对应组件要安全得多。
* 而且 `ref` 在 Vue 的生命周期中是有保证的（例如在 `onMounted` 之后才能访问），不会出现 DOM 还没挂载就被访问的情况。

### 5. **利于服务端渲染（SSR）和未来扩展**

* Vue 在 SSR 或虚拟 DOM 渲染时，不依赖真实 DOM，而是依赖 `ref` 提供的抽象。
* 直接操作 DOM 会导致 **不可移植**，在非浏览器环境下不可用，而 `ref` 更加通用。

</details>

## 13. Vue2中v-model的实现原理 {#question-e8f52755-fec1-4489-9163-a7fb4216b0b2}

> 题库原题：[Vue2中v-model的实现原理](https://fe.ecool.fun/topic/e8f52755-fec1-4489-9163-a7fb4216b0b2)

### 题目要点

1. **本质**：`v-model` = 数据绑定 + 事件监听（语法糖）
2. **核心机制**：

   * `Object.defineProperty` 劫持数据，实现响应式
   * 指令编译器绑定 `value/checked` 和事件
   * Watcher/Dep 通知视图更新
3. **在组件上**：约定 `value` + `input` 事件即可实现双向绑定

<details>
<summary>参考答案</summary>

在 Vue 2 中，`v-model` 的本质是 **语法糖**，它本质上是对 **`value`（或 `checked`）属性绑定 + `input` 事件监听** 的封装。理解它的实现原理，需要从 **指令编译机制** 和 **双向绑定逻辑** 入手。

---

## 1. `v-model` 的核心原理

假设在模板中写：

```vue
<input v-model="msg">
```

编译后的大致效果等价于：

```vue
<input
  :value="msg"
  @input="msg = $event.target.value"
/>
```

### 分析：

1. **`:value="msg"`**

   * 将 Vue 实例中的 `msg` 属性绑定到 input 的 value 上。
   * 当 `msg` 发生变化时，视图自动更新（单向绑定）。

2. **`@input="msg = $event.target.value"`**

   * 监听用户输入事件，将 input 的值同步回 Vue 实例的数据。
   * 完成从视图到数据的更新，实现双向绑定。

---

## 2. 内部实现机制

### 2.1 数据劫持（双向绑定）

* Vue 2 利用 **`Object.defineProperty`** 对 `data` 中的属性进行 getter/setter 劫持。
* 当数据发生变化时，会触发 **Watcher** 更新视图。
* 当用户输入触发 `input` 事件时，通过事件回调修改数据，setter 被触发，视图更新。

### 2.2 指令编译

* Vue 编译模板时，会检测到 `v-model` 指令：

  * 对 **文本输入框 (`input[type=text]`)**，绑定 `value` + `input`
  * 对 **复选框 (`input[type=checkbox]`)**，绑定 `checked` + `change`
  * 对 **单选框 (`input[type=radio]`)**，绑定 `checked` + `change`
  * 对 **`<select>`**，绑定 `value` + `change`
* 这些规则都是在 Vue 的 **`v-model` 指令编译器**里实现的。

### 2.3 Watcher 和 Dep

* 每个绑定的数据属性都有一个 **依赖收集器（Dep）**
* 当数据被访问时，收集依赖（Watcher）
* 当数据被修改时，Dep 通知所有 Watcher 更新视图

---

## 3. 自定义组件上的 v-model

在 Vue 2 中，`v-model` 也可以用于组件。原理是：

```vue
<my-input v-model="msg" />
```

* 编译后等价于：

```vue
<my-input
  :value="msg"
  @input="msg = $event"
/>
```

* 组件需要：

  * 接收 `value` 属性
  * 在内部触发 `this.$emit('input', newValue)`
* Vue 通过这个约定，实现组件上的双向绑定。

</details>

## 14. Vue3中v-model的改进是什么？如何用defineModel简化代码？ {#question-2446e942-5af4-4e38-98b5-5bb96b968a2c}

> 题库原题：[Vue3中v-model的改进是什么？如何用defineModel简化代码？](https://fe.ecool.fun/topic/2446e942-5af4-4e38-98b5-5bb96b968a2c)

### 题目要点

* **Vue 3 改进点**：

  1. 支持多 `v-model`（`v-model:propName`）
  2. 不再固定 `value`，绑定任意 prop
  3. 基于 Proxy 的响应式系统

* **defineModel 优势**：

  * 减少重复代码（无需手动定义 props/emits）
  * 直接操作变量即可触发双向绑定
  * 与 `&lt;script setup&gt;` 组合式 API 自然结合

<details>
<summary>参考答案</summary>

在 Vue 3 中，`v-model` 做了显著改进，相比 Vue 2，更加灵活和可配置，同时减少了模板中重复代码。

## 1. Vue 3 中 v-model 的改进

### 1.1 支持 **多 v-model**

* Vue 2 组件只能通过单个 `v-model` 绑定 `value` + `input`。
* Vue 3 支持给组件定义多个 `v-model`，可以绑定不同的属性和事件。

```vue
<MyComponent
  v-model:title="pageTitle"
  v-model:count="itemCount"
/>
```

对应组件内部：

```vue
defineProps(['title', 'count'])
const emit = defineEmits(['update:title', 'update:count'])

function updateTitle(newTitle) {
  emit('update:title', newTitle)
}
```

### 1.2 指定绑定的 **prop 名称**

* Vue 3 不再固定 `value` 属性，`v-model:propName` 可以绑定任意 prop，并生成 `update:propName` 事件。
* 语法更直观，避免只能用 `value` 的局限。

---

## 2. v-model 的原理变化

* Vue 3 不再依赖 `Object.defineProperty`，而是用 **Proxy** 实现响应式。
* `v-model` 的双向绑定原理依然是：

  1. **数据 → 视图**：绑定 prop
  2. **视图 → 数据**：通过触发 `update:propName` 事件，父组件更新数据

```vue
<!-- 父组件 -->
<MyInput v-model="msg" />

<!-- 子组件 -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

---

## 3. 使用 `defineModel` 简化代码

`defineModel` 是 Vue 3.3+ 提供的 **组合式 API**，用于在 `&lt;script setup&gt;` 中声明 `v-model` 绑定属性和事件，减少手动编写 `defineProps` + `defineEmits` 的模板。

### 示例

#### 传统方式

```vue
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>
```

#### 使用 `defineModel`

```vue
<script setup>
const modelValue = defineModel() // 自动生成 props + emits

function onInput(e) {
  modelValue.value = e.target.value // 自动触发 update:modelValue
}
</script>
```

### 特点

1. 自动生成 `props` + `emits`，简化模板和代码
2. 可直接使用 `ref` 风格修改值，内部会触发 `update:modelValue`
3. 支持默认值、类型声明和验证

</details>

## 15. 为什么Vue要求在使用v-for时提供唯一key？不设置key会导致什么问题？ {#question-subjective-e42b0101d4c1}

### 题目要点

1. **key 是虚拟 DOM 更新的标识**

   * 唯一且稳定的 `key` 能保证节点正确复用
2. **未设置或使用索引作为 key 的风险**

   * 数据复用错误 → 组件状态错乱
   * 性能下降 → DOM 被无谓销毁和重建
3. **最佳实践**

   * 优先使用数据唯一标识（如 `id`）作为 `key`
   * 仅当列表项是静态、不会变更时，索引可用作临时 key

<details>
<summary>参考答案</summary>

在 Vue 中，`v-for` 循环列表时要求提供唯一 `key`，这是因为 `key` 用于 **虚拟 DOM 的差异比较和高效更新**，直接影响渲染性能和正确性。

## 1. key 的作用

1. **标识每个节点的唯一性**

   * Vue 在渲染列表时，会对比前后两次虚拟 DOM（VNode）树。
   * `key` 告诉 Vue：这个节点对应同一个数据项，能安全复用 DOM 元素，而不是全部销毁重建。

2. **优化 DOM 更新**

   * 当列表项顺序发生变化或新增/删除时，Vue 使用 `key` 来 **最小化 DOM 操作**，只移动或更新真正变化的节点。
   * 如果没有 `key`，Vue 会采用默认的 **就地复用**（index 对应复用），可能导致不必要的 DOM 更新。

---

## 2. 不设置 key 的问题

假设有一个列表：

```vue
<div v-for="(item, index) in items" :key="index">
  {{ item.text }}
</div>
```

### 问题示例

1. **节点复用错误**

   * 如果列表顺序变化或删除/插入元素，Vue 会根据索引复用 DOM，而不是对应数据。
   * 结果可能出现：

     * 输入框内容被错误复用
     * 组件状态（如折叠、选中）被错误继承

2. **性能浪费**

   * 没有 `key` 时，Vue 可能需要 **销毁并重建整个列表**，而不是只移动或更新必要节点。
   * 大列表更新时，会明显卡顿。

---

### 示例

```vue
<template>
  <div v-for="(item, index) in items" :key="index">
    <input v-model="item.text" />
  </div>
</template>
```

操作：

* 删除列表中间一项
* 结果：后面的输入框值可能错乱，因为 Vue 用索引复用 DOM，而不是复用对应的数据项

正确做法：

```vue
<div v-for="item in items" :key="item.id">
  <input v-model="item.text" />
</div>
```

* `item.id` 唯一标识每个元素
* Vue 能准确复用 DOM，输入框内容不会错乱

</details>

## 16. 如何避免用数组索引作为key？ {#question-subjective-5d1f60913f35}

### 题目要点

1. **首选数据自带唯一 ID** 作为 key
2. **没有 ID** 时，初始化时生成唯一标识
3. **不要用数组索引**，除非列表完全静态
4. **稳定且唯一的 key** 可以保证：

   * 虚拟 DOM 高效更新
   * 表单或组件状态不会错乱

<details>
<summary>参考答案</summary>

在 Vue 中，避免用数组索引作为 `key`，主要是为了 **确保虚拟 DOM 正确复用节点，避免状态错乱**。

## 1. 使用数据唯一标识

* 每条数据如果有 **唯一 ID** 或其他天然唯一字段，应当直接使用它作为 `key`。

```vue
<template>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

* 优点：

  * 节点复用准确，DOM 更新最小化
  * 表单或组件状态不会错乱

---

## 2. 生成唯一标识（没有 id 时）

如果数据本身没有唯一 ID，可以在获取或初始化数据时生成唯一标识，例如：

### 2.1 使用 `uuid` 或类似库

```js
import { v4 as uuidv4 } from 'uuid'

items.forEach(item => {
  item._uid = uuidv4()
})
```

模板中：

```vue
<div v-for="item in items" :key="item._uid">
  {{ item.name }}
</div>
```

### 2.2 使用组合索引和内容（谨慎）

```js
<div v-for="item in items" :key="item.name + item.type">
  {{ item.name }}
</div>
```

* 适合数据内容天然唯一的场景
* 不保证稳定性，如果内容变化，仍可能触发 DOM 重建

---

## 3. 避免使用索引的场景

* 当列表可能 **增删或排序** 时，绝对不能使用索引，否则会导致：

  * 输入框值错乱
  * 组件状态错位
* 只有列表是 **静态且不会变化** 时，索引作为 key 才可接受。

</details>

## 17. Vue2中为什么需要$set方法？如何用它解决对象新增属性的响应性问题？ {#question-d6a85a95-95f9-4606-a98d-280bd6c82c9b}

> 题库原题：[Vue2中为什么需要$set方法？如何用它解决对象新增属性的响应性问题？](https://fe.ecool.fun/topic/d6a85a95-95f9-4606-a98d-280bd6c82c9b)

### 题目要点

* **问题来源**：Vue 2 的响应式依赖 `Object.defineProperty`，只能劫持已有属性
* **解决方案**：`$set` / `Vue.set`
* **作用**：新增属性或修改数组索引时，保证响应式生效并更新视图
* **使用场景**：对象动态添加字段、数组通过索引修改元素

<details>
<summary>参考答案</summary>

在 Vue 2 中，需要 `$set` 的核心原因是 **对象属性的新增在 Vue 2 中无法被自动侦测**，即响应式系统的局限性。

## 1. Vue 2 响应式原理回顾

* Vue 2 使用 `Object.defineProperty` 对 `data` 对象的每个属性进行 getter/setter 劫持，实现响应式。
* 但 **只能劫持已存在的属性**。
* 因此，对对象新增属性时，Vue 无法侦测到变化，也无法触发视图更新。

示例：

```js
data() {
  return {
    user: { name: 'Alice' }
  }
},
mounted() {
  this.user.age = 18 // ❌ 无法触发视图更新
}
```

---

## 2. `$set` 的作用

* Vue 提供 `$set`（或全局 `Vue.set`）来显式添加响应式属性。
* 它的作用是：

  1. 在对象或数组上新增属性
  2. 保证该属性是 **响应式的**
  3. 自动触发视图更新

### 示例

```js
this.$set(this.user, 'age', 18) // ✅ 响应式，视图会更新
```

等价于：

```js
Vue.set(this.user, 'age', 18)
```

---

## 3. `$set` 对数组的作用

* Vue 2 数组在某些操作（如通过索引直接赋值 `arr[index] = value`）也不会触发视图更新。
* 通过 `$set` 可以解决：

```js
this.$set(this.items, 1, 'newValue') // 正确更新视图
```

---

## 4. 使用场景总结

1. **对象新增属性**

```js
this.$set(obj, 'newProp', value)
```

2. **数组通过索引修改元素**

```js
this.$set(arr, index, newValue)
```

3. **保证响应式系统能够侦测到变化**

* 不用 `$set`，新增或修改可能导致视图不更新

---

## 5. Vue 3 的变化

* Vue 3 使用 **Proxy** 实现响应式，不再存在 `$set` 的限制
* 对象新增属性、数组索引赋值都可以自动触发视图更新

</details>

## 18. Vue3的响应式方案如何规避这一问题？ {#question-subjective-168f6debe0b8}

### 题目要点

1. **问题来源**：Vue 2 只能劫持已有属性，新增属性不响应
2. **Vue 3 解决方案**：

   * 使用 Proxy 拦截对象和数组所有操作
   * 新增属性或修改数组索引都能触发视图更新
3. **优势**：

   * 简化开发，无需 `$set`
   * 兼容动态添加字段或动态数组操作
   * 更稳定、更高效的响应式系统

<details>
<summary>参考答案</summary>

在 Vue 3 中，对象新增属性不再需要 `$set`，这是因为 Vue 3 **彻底重写了响应式系统**，从 `Object.defineProperty` 改为 **Proxy**，从根本上解决了 Vue 2 的局限性。

## 1. Vue 3 响应式原理

* Vue 3 使用 `Proxy` 包裹对象或数组，实现响应式：

```js
const state = reactive({ user: { name: 'Alice' } })
```

* **Proxy 拦截所有操作**，包括：

  1. 读取属性 (`get`)
  2. 设置属性 (`set`)
  3. 删除属性 (`deleteProperty`)
  4. 数组索引修改

* 因为 `set` 拦截器会捕获 **新增属性**，所以无需像 Vue 2 那样提前定义或使用 `$set`。

---

## 2. 对象新增属性也能响应式

### 示例

```js
import { reactive } from 'vue'

const state = reactive({ user: { name: 'Alice' } })

state.user.age = 18  // 自动响应，视图会更新
```

* 这里直接给 `user` 对象新增 `age` 属性，视图会立即响应更新。
* 不再需要 `Vue.set` 或 `$set`。

---

## 3. 数组索引修改也能响应式

```js
const arr = reactive([1, 2, 3])

arr[1] = 20  // 自动触发更新
arr.push(4)  // 同样响应式
```

* Proxy 拦截数组的 `set` 和常用方法（`push`, `pop`, `splice` 等），保证响应式更新。

</details>

## 19. 小程序如何实现rpx到px的转换？如何适配不同屏幕密度的设备（如Retina屏）？ {#question-4e5f6035-c1a8-48b1-a561-e2d4710e3698}

> 题库原题：[小程序如何实现rpx到px的转换？如何适配不同屏幕密度的设备（如Retina屏）？](https://fe.ecool.fun/topic/4e5f6035-c1a8-48b1-a561-e2d4710e3698)

### 题目要点

* **rpx → px**：根据屏幕宽度按比例转换
* **跨屏适配**：rpx 自动适配宽度，但涉及绘制或图片时需考虑 `devicePixelRatio`
* **优势**：使用 rpx 可以让布局在各种屏幕上保持一致，开发成本低

<details>
<summary>参考答案</summary>

在小程序开发中，为了实现 **界面自适应**，官方提供了 `rpx` 单位，而最终在渲染时需要转换为实际像素（`px`），同时需要兼顾不同屏幕密度的设备（如 Retina 屏）。

## 1. rpx 的概念

* `rpx`（responsive pixel）是微信小程序特有的单位。
* **设计初衷**：统一不同屏幕宽度的布局，使页面在各种设备上都能按比例显示。
* **转换规则**：

  * 以 **iPhone 6/7/8 宽度 750rpx** 作为设计稿参考宽度
  * 小程序会根据设备屏幕宽度自动计算比例

示例：

* 设备屏幕宽度：375px
* 1rpx = 375 / 750 = 0.5px

---

## 2. rpx → px 转换公式

```js
px = rpx * (屏幕宽度 / 750)
```

### 小程序官方 API

```js
const systemInfo = wx.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth  // 单位 px

function rpxToPx(rpx) {
  return rpx * screenWidth / 750
}
```

* 可以在 JS 中动态计算尺寸
* 结合 `wx.createSelectorQuery()` 获取元素实际宽度，实现动态布局

---

## 3. 适配高密度屏（Retina、2K、4K 屏）

* **Retina 屏** 的特征是物理像素比（`devicePixelRatio`）大于 1

* 微信小程序渲染引擎会自动处理 **设备像素比**，所以在大部分情况下：

  * 使用 rpx → px 转换后，页面显示正常
  * 不必手动乘 `devicePixelRatio`

* 如果涉及 **Canvas 绘制或图片显示**：

  * 需要手动乘上 `devicePixelRatio`，保证在高分屏上清晰

```js
const dpr = wx.getSystemInfoSync().pixelRatio
const canvasWidth = rpxToPx(300) * dpr
const canvasHeight = rpxToPx(200) * dpr
```

* 这样绘制的 Canvas 在 Retina 屏上不会模糊

---

## 4. 实践建议

1. **布局元素**：

   * 使用 `rpx` 单位，自动适配不同屏幕宽度
   * 避免直接使用 px

2. **图片和 Canvas**：

   * 对图片可用多分辨率资源（@2x、@3x）
   * 对 Canvas 绘制手动乘 `devicePixelRatio`

3. **字体适配**：

   * 小程序的 `rpx` 也可以用在 `font-size`，保证文字大小随屏幕缩放

</details>

## 20. 如何在小程序中实现一套代码兼容Web和移动端？ {#question-subjective-6f525cdf0caf}

### 题目要点

1. **选择跨端框架**（Taro/Uni-app）统一开发语言和组件
2. **封装跨平台 API**，屏蔽 wx/uni/fetch 差异
3. **条件编译**解决平台差异渲染
4. **样式单位适配**，rpx 或 rem/vw
5. **组件复用与封装**，针对不同平台做必要分支

<details>
<summary>参考答案</summary>

在小程序开发中，如果希望 **同一套代码既能运行在小程序环境，又能运行在 Web/移动端浏览器**，核心思路是 **跨端抽象、条件编译和适配平台 API**。

## 1. 使用跨端框架

### 1.1 Taro

* Taro 是凹凸实验室开源的 **多端统一开发框架**
* 核心特点：

  * 编写 React/Vue 风格的组件
  * 支持编译到：微信小程序、支付宝小程序、字节小程序、H5（Web）、React Native
  * 提供跨端 API 封装（网络请求、存储、路由等）

示例：

```js
import Taro from '@tarojs/taro'

Taro.request({ url: '/api/data' }).then(res => console.log(res))
```

* 编译后会自动替换为小程序 `wx.request` 或浏览器 `fetch`

### 1.2 Uni-app

* 使用 Vue 语法，支持多端编译
* 提供 `uni` 全局 API，统一封装跨端差异

---

## 2. 条件编译

在小程序和 Web 环境中，有些 API 或组件差异明显，需要使用条件编译：

```vue
<template>
  <!-- #ifdef H5 -->
  <div>这是 Web 端内容</div>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view>这是微信小程序端内容</view>
  <!-- #endif -->
</template>
```

* 可针对不同平台渲染不同元素
* 在 JS 中也可以判断：

```js
if (process.env.TARO_ENV === 'h5') {
  console.log('Web 环境')
} else if (process.env.TARO_ENV === 'weapp') {
  console.log('小程序环境')
}
```

---

## 3. 封装跨平台 API

* 对于网络请求、存储、路由等操作，建议统一封装接口，屏蔽平台差异：

```js
// api.js
import Taro from '@tarojs/taro'

export function request(url, options) {
  if (process.env.TARO_ENV === 'h5') {
    return fetch(url, options).then(res => res.json())
  } else {
    return Taro.request({ url, ...options })
  }
}
```

* 上层组件无需关心当前平台

---

## 4. 样式适配

* 使用 **响应式单位**：

  * rpx 在小程序端自动适配屏幕
  * H5 可使用 vw/vh 或 rem 替代
* 可以通过 **预处理器** 或 **跨端框架** 做统一转换

---

## 5. 组件适配

* 公共组件尽量用跨端框架提供的组件库
* 针对特定平台差异，使用条件编译或封装多版本组件

```vue
<template>
  <common-button v-if="isWeapp" />
  <button v-else>Web按钮</button>
</template>
```

</details>

## 21. 项目中如何选择路由模式？如何解决history模式的404问题？ {#question-subjective-671517036fb4}

### 题目要点

1. **Hash 模式**：简单、兼容性好，无需服务器配置
2. **History 模式**：

   * URL 更美观，SEO 更友好
   * 需要服务器 **URL 重写** 以避免刷新 404
3. **选择依据**：

   * 服务器可控且 SEO 重要 → History
   * 部署在静态服务器或兼容性要求高 → Hash

<details>
<summary>参考答案</summary>

Vue 或 React 等 SPA 项目通常有两种路由模式：**hash 模式** 和 **history 模式**。

## 1. 路由模式对比

| 特性     | Hash 模式             | History 模式          |
| ------ | ------------------- | ------------------- |
| URL 形式 | `/#/home`           | `/home`             |
| 页面刷新   | 无需服务器配置，直接刷新不会报 404 | 直接刷新需要服务器支持，否则会 404 |
| SEO    | 不友好，锚点形式            | 相对友好，可配合服务端渲染       |
| 浏览器支持  | 所有现代浏览器             | 现代浏览器支持（IE9+）       |

### 选择建议

1. **Hash 模式**：

   * 项目部署在 **静态服务器**，无法修改服务器配置
   * 对 SEO 要求不高
   * 使用简单、兼容性好

2. **History 模式**：

   * 项目对 **SEO 有要求**
   * 可在服务器做 **URL 重写**
   * URL 美观，无 `#`

## 2. History 模式的 404 问题

* SPA 项目在 History 模式下，页面刷新或直接访问 `/about` 时，浏览器向服务器请求该路径。
* 如果服务器没有配置 URL 重写，返回的不是 index.html，而是 404。

### 解决方法

#### 2.1 Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;

    root /usr/share/nginx/html;

    location / {
        try_files $uri /index.html;
    }
}
```

* `try_files $uri /index.html;` 会优先查找静态资源，如果不存在，则返回 `index.html`
* SPA 前端接管路由，实现页面渲染

#### 2.2 Apache 配置（.htaccess）

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 2.3 静态托管（如 GitHub Pages / Netlify）

* GitHub Pages: 在项目根目录添加 `404.html` 并重定向到 `index.html`
* Netlify: 配置 `_redirects` 文件

```
/* /index.html 200

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-73/_index.md" >}}) · 已是最后一轮 →
