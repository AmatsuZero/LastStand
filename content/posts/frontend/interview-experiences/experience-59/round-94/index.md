+++
title = "滴滴-社招-3年 · 第 1 轮 · 三面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "三面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/59"
experienceId = 59
roundId = 94
roundOrder = 1
company = "滴滴"
date = "2025-07-28T05:39:29.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-93/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 浏览器渲染过程、浏览器的缓存机制、浏览器的垃圾回收机制、浏览器的存储机制

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 在你做过的项目中，最值得说的是哪一个 {#question-subjective-98da1f5bbe94}

### 题目要点

STAR法则

<details>
<summary>参考答案</summary>

基于自己简历挖掘亮点项目

</details>

## 2. 在该项目中，你主要负责哪些模块的开发？这些模块的技术难点是什么 {#question-subjective-1a73c841fa54}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 请举例说明在项目中，你是如何通过技术手段解决业务问题的 {#question-subjective-5b176ffb091f}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 4. 在项目中，你采取了哪些性能优化措施？效果如何 {#question-subjective-0fdfb5bf5b6b}

### 题目要点

略

<details>
<summary>参考答案</summary>

可以参考 【性能优化】相关知识点，在面经最后

</details>

## 5. 在项目中遇到的最大技术挑战是什么？你是如何解决的 {#question-subjective-3fa86026797b}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 6. 在项目中，你是如何与团队成员协作的？请分享一个具体的协作案例 {#question-subjective-e967bea0e873}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 7. 在团队协作中，遇到过哪些冲突？你是如何解决的 {#question-subjective-fcdcf89f3234}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 8. 在项目中，你是如何进行项目管理和进度保障的 {#question-subjective-a4d9118359ba}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 9. 你的职业规划是什么样的？短期和长期目标分别是什么 {#question-subjective-723e5a28df32}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 10. 给定两个以字符串形式表示的非负整数 num1 和 num2，返回 num1 和 num2 的乘积，它们的乘积也表示为字符串形式 {#question-subjective-265243f3e08c}

注意：不能使用任何内置的 BigInteger 库或直接将输入转换为整数

示例 1:

```js
输入: num1 = "2", num2 = "3"
输出: "6"
```

示例 2:

```
输入: num1 = "123", num2 = "456"
输出: "56088"
```

### 题目要点

* 模拟多位数乘法的过程，按位乘积+进位合并
* 用数组保存每一位的计算结果，最终拼接成字符串
* 注意字符串转数字、进位处理、前导 0 清除等细节
* 不允许使用 BigInt、Number 等将字符串转换为数字

<details>
<summary>参考答案</summary>

### 考察点

- 考察对字符串操作的熟练程度和大数模拟乘法逻辑实现能力
- 掌握多位数相乘的数学原理，模拟竖式乘法
- 考察对数组操作、进位处理、边界情况的处理能力

---

### 参考答案

#### 一、原理说明

由于不能直接将字符串转为整数，需模拟“**逐位乘法 + 进位处理**”，如同手动计算多位乘法（竖式）一样：

假设有：
```

1  2  3
×     4  5  6
-------------

```
    7  3  8  （123×6）
 6  1  5     （123×5，向左移一位）
```

* 4  9  2       （123×4，向左移两位）

---

5  6  0  8  8

````

#### 二、核心实现（模拟乘法）

```js
function multiply(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";

  const len1 = num1.length;
  const len2 = num2.length;
  const result = new Array(len1 + len2).fill(0);

  // 从后向前遍历两个字符串
  for (let i = len1 - 1; i >= 0; i--) {
    const n1 = +num1[i];
    for (let j = len2 - 1; j >= 0; j--) {
      const n2 = +num2[j];
      const mul = n1 * n2;
      const p1 = i + j, p2 = i + j + 1;

      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10); // 进位加在前一位
    }
  }

  // 去掉前导 0
  while (result[0] === 0) result.shift();

  return result.join('');
}
````

---

#### 三、测试示例

```js
console.log(multiply("2", "3"));         // 输出: "6"
console.log(multiply("123", "456"));     // 输出: "56088"
console.log(multiply("0", "456"));       // 输出: "0"
console.log(multiply("999", "999"));     // 输出: "998001"
```

---

#### 四、常见误区与陷阱

* **不能直接使用 BigInt、parseInt、Number 等进行转换**
* **进位位置处理错误**，应将进位加在 `i + j` 位置，当前乘积位加在 `i + j + 1`
* **处理前导 0 要注意**，避免输出如 `"00056088"` 这样错误结果
* **对字符串字符转数字要用 `+num[i]` 或 `parseInt(num[i])`**，不能直接 `num[i] * num2[j]` 而不明确转型，虽然在JS中可自动转型，但应写清晰

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-59/round-93/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-59/_index.md" >}}) · 已是最后一轮 →
