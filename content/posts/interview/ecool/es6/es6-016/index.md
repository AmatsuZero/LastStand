+++
title = "数组扩展"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2025-07-17T00:00:00+08:00'
draft = true
weight = 16
tags = ["面试", "前端", "ES6", "JavaScript", "数组扩展", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
ES6（ECMAScript 2015）为JavaScript数组引入了多项扩展功能，这些功能不仅简化了数组操作，还提高了代码的可读性和效率。本文将详细介绍ES6数组扩展的主要功能和用法。

#### 一、扩展运算符（...）

扩展运算符可以用于数组的赋值、合并、解构赋值以及将字符串转为数组。

1.  **赋值数组**：  
```javascript
let arr1 = [100, 200, 300, [500]];
let arr2 = [...arr1]; // 浅拷贝
console.log(arr2 == arr1); // false
arr1[0] = 400;
console.log(arr2); // 不受影响
arr1[3][0] = 600;
console.log(arr2); // 受影响（只拷贝了一层）
```
2.  **合并数组**：  
```javascript
console.log([...[1, 2, 3], ...[4, 5, 6]]); // [1, 2, 3, 4, 5, 6]
```
3.  **解构赋值**：  
```javascript
let [a, ...list] = [1, ...["a", "b"]];
console.log(a); // 1
console.log(list); // ["a", "b"]
```
4.  **将字符串转为数组**：  
```javascript
console.log([..."str"]); // ["s", "t", "r"]
```

#### 二、Array.from()

`Array.from()`方法用于将类数组对象或可迭代对象转换为真正的数组。

```javascript
let arrLike = {
  "0": "内容",
  "1": "内容2",
  "2": "内容3",
  length: 3
};
console.log(Array.from(arrLike)); // ["内容", "内容2", "内容3"]
```

此外，`Array.from()`还可以接受一个回调函数，用于对数组中的每个元素进行处理。

```javascript
let arr = Array.from({ length: 2 }, () => "jack");
console.log(arr); // ["jack", "jack"]
```

#### 三、Array.of()

`Array.of()`方法用于将一组值转换为数组，与Array构造函数的行为不同，Array.of()不会把一个参数作为数组的长度。

```javascript
console.log(Array.of(1, 2, "内容")); // [1, 2, "内容"]
console.log(Array.of(3)); // [3]
```

#### 四、copyWithin()

`copyWithin()`方法用于复制数组的一部分到同一数组中的另一个位置，并返回这个数组。它不会改变数组的长度。

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.copyWithin(2)); // [1, 2, 1, 2, 3]
console.log(arr.copyWithin(2, 1)); // [1, 2, 2, 1, 2]
console.log(arr.copyWithin(2, 1, 3)); // [1, 2, 2, 2, 2]
```

#### 五、fill()

`fill()`方法用于用一个静态值填充一个数组从起始索引到终止索引内的全部元素。不包括终止索引。

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.fill("a")); // ["a", "a", "a", "a", "a"]
console.log(arr.fill("a", 0, 1)); // ["a", 2, 3, 4, 5]
```

#### 六、find() 和 findIndex()

`find()`方法返回数组中满足提供的测试函数的第一个元素的值。否则返回undefined。

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.find(a => a > 2)); // 3
```

`findIndex()`方法返回数组中满足提供的测试函数的第一个元素的索引。否则返回-1。

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.findIndex(a => a > 2)); // 2
```

#### 七、includes()

`includes()`方法用来判断一个数组是否包含一个指定的值，根据情况返回true或false。

```javascript
let arr = ["苹果", "橘子", "香蕉"];
console.log(arr.includes("橘子")); // true
```

#### 八、flat() 和 flatMap()

`flat()`方法用于将嵌套的数组“拉平”成一维数组。可以传入一个参数指定拉平的层数。

```javascript
let arr = [1, 2, [3, [4, 5]]];
console.log(arr.flat(2)); // [1, 2, 3, 4, 5]
```

`flatMap()`方法首先使用映射函数映射每个元素，然后将结果展平成一个新数组。

```javascript
let arr = [{ name: "A", list: ["安庆", "安阳", "鞍山"] }, { name: "B", list: ["北京", "保定", "包头"] }];
let res = arr.flatMap(function(item) {
  return item.list;
});
console.log(res); // ["安庆", "安阳", "鞍山", "北京", "保定", "包头"]
```

#### 九、遍历方法

- `keys()`：返回数组索引的迭代器。
- `values()`：返回数组元素的迭代器。
- `entries()`：返回数组的键值对迭代器。

```javascript
let arr = [100, 200, 300, 400, 500];
for (const [index, value] of arr.entries()) {
  console.log(value, index);
}
```

#### 十、其他方法

- `at()`：返回指定位置的元素，允许使用负数索引从数组末尾开始计数。
- `toReversed()`：返回一个新数组，该数组是原数组的反转副本。
- `toSorted()`（假设为`sort()`的扩展说明）：用于对数组的元素进行排序。
- `toSpliced()`（假设为`splice()`的扩展说明）：用于添加/删除数组的元素，并返回被删除的元素。

## 常见考点

1.  **扩展运算符**：  
  - 用途：数组转参数、数组复制、数组合并、字符串转数组。
  - 注意：浅拷贝。
2.  **Array.from()**：  
  - 用途：类数组对象、可迭代对象转数组。
  - 参数：可传入处理函数。
3.  **Array.of()**：  
  - 用途：一组值转数组。
  - 注意：无参数时返回空数组。
4.  **copyWithin()**：  
  - 用途：数组内部复制元素。
  - 参数：target（目标起始索引）、start（起始位置）、end（结束位置，不包括）。
5.  **find() 和 findIndex()**：  
  - 用途：查找符合条件的元素或索引。
  - 参数：回调函数（可绑定this）。
6.  **fill()**：  
  - 用途：用给定值填充数组。
  - 参数：值、起始索引、结束索引（不包括）。
7.  **keys()、values()、entries()**：  
  - 用途：遍历数组键名、键值、键值对。
8.  **解构赋值**：  
  - 用途：从数组或对象中提取值进行变量赋值。
9.  **for...of循环**：  
  - 用途：遍历数组、Set、Map、类数组对象、对象和字符串。
