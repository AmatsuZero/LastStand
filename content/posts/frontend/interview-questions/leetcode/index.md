+++
title = "leetcode 面试题"
draft = false
tags = ["面试", "前端", "leetcode", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/topic-list"
generatedAt = "2026-08-01T05:15:03.341Z"
+++

共 38 道 leetcode 面试题。答案默认折叠，便于先自行作答。

## 1. 最大公共前缀 {#question-8dcdf90d-46d4-4466-a96b-c684806e90f3}

> 难度：2 · 类型：QA

编写一个函数，接收一个字符串数组作为输入，找出这些字符串的最大公共前缀。如果没有公共前缀，则返回空字符串。
+ **输入输出要求**：
    - 输入：一个字符串数组。
    - 输出：一个字符串，表示最大公共前缀。

+ **示例**：
```javascript
const input = ["flower", "flow", "flight"];
const result = longestCommonPrefix(input);
console.log(result); // 输出：'fl'
```

### 题目要点

最大公共前缀问题的核心是逐步缩小候选前缀；横向扫描通过不断用后续字符串修剪前缀，实现简单且高效；在最坏情况下时间复杂度为 O(n·m)，空间复杂度为 O(1)，非常适合在实际工程和面试中使用。

<details>
<summary>参考答案</summary>

这个问题本质是在**多个字符串之间求一个公共的、连续的前缀子串**，并且要求尽可能长。关键不在于字符串操作技巧，而在于**如何逐步收敛搜索空间**。

---

## 一、整体思路说明（横向扫描）

横向扫描的核心思想是：
**先假设第一个字符串是公共前缀，然后不断用后续字符串去“修剪”它**。

执行过程可以概括为：

* 取第一个字符串作为初始前缀
* 从第二个字符串开始，逐个比较
* 如果当前字符串不以该前缀开头，就不断缩短前缀
* 一旦前缀缩短为空，说明不存在公共前缀，可以提前结束

这个过程的好处是逻辑直观，且在工程中可读性和可维护性都很好。

---

## 二、示例代码实现（横向扫描）

```js
function longestCommonPrefix(strs) {
  if (!strs || strs.length === 0) return "";

  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }

  return prefix;
}
```

### 示例验证

```js
const input = ["flower", "flow", "flight"];
console.log(longestCommonPrefix(input)); // "fl"
```

---

## 三、时间与空间复杂度分析

* **时间复杂度**：
  最坏情况下为 `O(n * m)`

  * `n` 是字符串数量
  * `m` 是最短字符串长度

* **空间复杂度**：
  `O(1)`，只使用了常量级额外空间

在大多数实际业务场景下，这个复杂度是完全可接受的。

---

## 四、分治法的思路补充（理解用）

分治法的核心思想是：

* 将字符串数组一分为二
* 分别求左右两部分的公共前缀
* 再对两个前缀求公共前缀

这种方式在理论上更“算法化”，但在 JavaScript 场景下，递归开销和实现复杂度都更高，通常不如横向扫描直观，除非在面试中被明确要求。

---

## 五、工程细节与常见注意点

* 需要处理空数组或包含空字符串的情况
* 使用 `startsWith` 语义更清晰，避免 `indexOf === 0` 的可读性问题
* 一旦前缀为空，立即返回，避免无意义循环
* 默认以第一个字符串作为基准，是最简单且安全的选择

</details>

## 2. 对英文句子进行逆序处理（例如：how old are you => you are old how）。分析该算法的空间复杂度，并说明如何将空间复杂度降到 O(1)。 {#question-e54f3760-5c7b-4e6f-b61d-252f748cfc2f}

> 难度：1 · 类型：QA

### 题目要点

* **常规开销**：普通分割法由于需要存储中间结果，空间复杂度为 。
* **策略选择**：通过“二次反转法”（先整体反转，再局部反转单词）可以巧妙地在原地完成处理。
* **空间优化**： 方案的关键在于直接在原始字符数组上操作，避免了新字符串或数组的内存分配。
* **指针逻辑**：利用双指针确定单词边界，是处理此类字符串问题的标准工程实践。

<details>
<summary>参考答案</summary>

在处理字符串逆序的问题时，常规思路往往涉及字符串的分割与重新拼接。

但在面试场景下，考察的重点通常是如何在不依赖高级语言内置函数（如 `split().reverse().join()`）的情况下，利用底层指针操作实现极致的内存优化。

### 1. 基础方案：辅助空间法

最直观的方法是遍历字符串，利用空格识别每个单词，将其提取出来存入一个数组或栈中，最后再按逆序重新拼接。

* **逻辑**：遍历一遍输入字符串 O(n) ，存储单词列表。
* **空间复杂度**：由于需要创建一个新的数组来存储所有单词，或者最终生成一个新的结果字符串，其空间开销与原字符串长度成正比，即 O(n)。

### 2. 空间复杂度 O(1) 的优化方案

要实现原地（In-place）逆序，核心思路是利用**“局部逆序 + 整体逆序”**的数学特性。

#### 算法步骤：

1. **整体反转**：首先将整个字符串的首尾字符进行对调，彻底反转。此时，单词的位置已经排到了最后，但单词内部的字母顺序也是反的（例如：`how old`  `dlo woh`）。
2. **局部反转**：利用双指针遍历这个已经反转的字符串，找到每个空格的位置，从而锁定每个单词的边界。对每个单独的单词再次执行首尾对调反转。
3. **结果**：经过两次反转，单词内部的顺序恢复正常，而单词在句子中的顺序实现了逆序（例如：`dlo woh`  `old how`）。

#### 代码逻辑实现：

```javascript
function reverseWords(s) {
    // 假设 s 是字符数组，以便原地修改
    let n = s.length;

    // 1. 翻转整个字符串
    reverse(s, 0, n - 1);

    // 2. 翻转每个单词
    let start = 0;
    for (let end = 0; end < n; end++) {
        if (s[end] === ' ') {
            reverse(s, start, end - 1);
            start = end + 1;
        } else if (end === n - 1) {
            reverse(s, start, end);
        }
    }
    return s;
}

function reverse(arr, left, right) {
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
}

```

### 3. 复杂度分析

* **时间复杂度**：虽然进行了两次翻转，但本质上每个字符被访问的次数是常数级别的，因此时间复杂度依然是 O(n)。
* **空间复杂度**：在翻转过程中，我们只使用了极少数的辅助变量（如指针 `left`, `right`, `start`），没有开辟与输入规模相关的额外空间。因此，空间复杂度达到了 O(1)。

</details>

## 3. 有效的变位词 {#question-e834149b-923e-4565-8c26-2a43a5b98085}

> 难度：1 · 类型：QA

给定两个字符串 `s` 和 `t` ，编写一个函数来判断它们是不是一组变位词（字母异位词）。

**注意：**若 `s` 和 `t`中每个字符出现的次数都相同且**字符顺序不完全相同**，则称 `s` 和 `t`互为变位词（字母异位词）。

**示例 1:**

**输入:** s = "anagram", t = "nagaram"

**输出:** true

**示例 2:**

**输入:** s = "rat", t = "car"

**输出:** false

**示例 3:**

**输入:** s = "a", t = "a"

**输出:** false

**提示:**

* `1 <= s.length, t.length <= 5 * 104`
* `s` and `t` 仅包含小写字母

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {

};
```

### 题目要点

判断s和t的长度是否相等，若不相等，则s和t绝对不是变位词

<details>
<summary>参考答案</summary>

## 题目分析

* 判断s和t的长度是否相等，若不相等，则s和t绝对不是变位词
* 判断s和t是否相等，若相等，则s和t中每个字符出现的次数相同且字符顺序完全相同，s和t不是变位词
* 若s和t不相等但长度相等，可以使用多种方法进行判断

下面介绍两种常见的实现方法：

## 方法一

* 搜集s字符串各个字符数量
* 遍历t字符串，递减数组各个字符数量
* 若有字符数量为负，则为无效，否则是有效

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    if(s === t || s.length != t.length) {
        return false
    }
    let table = new Array(26).fill(0)
    for(let i = 0; i < s.length; i ++) {
        table[s.charCodeAt(i) - 'a'.charCodeAt(0)] ++
    }
    for(let i = 0; i < t.length; i ++) {
        table[t.charCodeAt(i) - 'a'.charCodeAt(0)] --
        if(table[t.charCodeAt(i) - 'a'.charCodeAt(0)] < 0) {
            return false
        }
    }
    return true
};
```

##  方法二

我们可以对字符串 s 和 t 分别排序，看排序后的字符串是否相等。

```js
var isAnagram = function(s, t) {
    return s.length == t.length && s !== t && [...s].sort().join('') === [...t].sort().join('')
};
```

PS：面试题由 “[前端面试题宝典（https://fe.ecool.fun/）](https://fe.ecool.fun/)” 整理和录入，未授权任何机构或其他刷题工具引用。推荐官网刷题，题库更全，题目答案不定时更新~

</details>

## 4. 两个字符串的删除操作 {#question-97758079-03f4-40ce-9b71-8c3c4e5db338}

> 难度：3 · 类型：QA

给定两个单词 `word1` 和 `word2` ，返回使得 `word1` 和 `word2`**相同**所需的**最小步数**。

**每步** 可以删除任意一个字符串中的一个字符。

**示例 1：**

**输入:** word1 = "sea", word2 = "eat"
**输出:** 2
**解释:** 第一步将 "sea" 变为 "ea" ，第二步将 "eat "变为 "ea"

**示例 2:**

**输入：** word1 = "leetcode", word2 = "etco"
**输出：** 4

**提示：**

* `1 <= word1.length, word2.length <= 500`
* `word1` 和 `word2` 只包含小写英文字母

```js
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {

};
```

### 题目要点

dp数组含义

<details>
<summary>参考答案</summary>

### 解题思路

1. dp数组含义

    dp[i][j] 表示长度为[0,i-1]的字符串word1和长度为[0,j-1]的字符串word2想要达到相等，删除元素的最少次数

2. 递推公式

    - 如果word1[i - 1] === word2[j - 1] 那么不用删除
        dp[i][j] = dp[i - 1][j - 1];
    - 如果不同，有三种情况
        1. 删除word1[i-1],最少次数为dp[i-1][j]+1;
        2. 删除word2[j-1],最少次数为dp[i][j-1]+1;
        3. 同时删除，最少次数为dp[i-1][j-1]+2;

        最后取三者中的最小值

3. 初始化

对于[i][0]跟[0][j]都需要初始化为对应i,j数值

### 代码

```javascript
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
    let len1 = word1.length, len2 = word2.length;

    let dp = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(Infinity));

    for (let i = 0; i <= len1; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 2);
            }
        }
    }

    return dp[len1][len2]
};
```

</details>

## 5. x 的平方根 {#question-b68ef5ec-9d4c-4702-b7f7-33917340b6eb}

> 难度：1 · 类型：QA

给你一个非负整数 `x` ，计算并返回 `x` 的 **算术平方根** 。

由于返回类型是整数，结果只保留 **整数部分** ，小数部分将被 **舍去 。**

**注意：** 不允许使用任何内置指数函数和算符，例如 `pow(x, 0.5)` 或者 `x ** 0.5` 。

**示例 1：**

**输入：** x = 4

**输出：** 2

**示例 2：**

**输入：** x = 8

**输出：** 2

**解释：** 8 的算术平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。

**提示：**

* `0 <= x <= 2^31 - 1`

```
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {

};
```

### 题目要点

整数x的平方根一定小于或等于x

<details>
<summary>参考答案</summary>

## 二分法

* 整数x的平方根一定小于或等于x
* 除0之外的所有整数的平方根都大于或等于1
* 整数x的平方根一定是在1到x的范围内，取这个范围内的中间数字mid，并判断mid的平方是否小于或等于x，如果mid的平方小于x
* 那么接着判断(mid+1)的平方是否大于x，如果(mid+1)的平方大于x，那么mid就是x的平方根
* 如果mid的平方小于x并且(mid+1)的平方小于x，那么x的平方根比mid大，接下来搜索从mid+1到x的范围
* 如果mid的平方大于x，则x的平方根小于mid，接下来搜索1到mid-1的范围
* 然后在相应的范围内重复这个过程，总是取出位于范围中间的mid

```js
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  // 整数x的平方根一定是在1到x的范围内
  let left = 1,
    right = x;
  while (left <= right) {
    // 中间值  下面这样写是防止溢出
    let mid = left + ((right - left) >> 1);
    // 判断mid的平方是否小于或等于x，如果mid的平方小于x
    if (mid <= x / mid) {
      // 判断(mid+1)的平方是否大于x，如果(mid+1)的平方大于x，那么mid就是x的平方根
      if (mid + 1 > x / (mid + 1)) {
        return mid;
      }
      // 如果mid的平方小于x并且(mid+1)的平方小于x，那么x的平方根比mid大，接下来搜索从mid+1到x的范围
      left = mid + 1;
    } else {
      // 如果mid的平方大于x，则x的平方根小于mid，接下来搜索1到mid-1的范围
      right = mid - 1;
    }
  }
  // 如果输入参数是0，left等于1而right等于0，就直接返回0
  return 0;
};
```

</details>

## 6. 环形链表 {#question-b6b259e0-f798-4fb3-92cf-76c22d7fdf7f}

> 难度：1 · 类型：QA

给你一个链表的头节点 `head` ，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 `next` 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 `pos` 来表示链表尾连接到链表中的位置（索引从 0 开始）。**注意：`pos` 不作为参数进行传递** 。仅仅是为了标识链表的实际情况。

_如果链表中存在环_ ，则返回 `true` 。 否则，返回 `false` 。

**示例 1：**

![](https://static.ecool.fun/article/aefe67d2-1969-41a6-acc9-0c03a901302f.png)

**输入：** head = [3,2,0,-4], pos = 1
**输出：** true
**解释：** 链表中有一个环，其尾部连接到第二个节点。

**示例 2：**

![](https://static.ecool.fun/article/ba5d3f1b-fad9-4343-8caa-77624e0894d3.png)

**输入：** head = [1,2], pos = 0
**输出：** true
**解释：** 链表中有一个环，其尾部连接到第一个节点。

**示例 3：**

![](https://static.ecool.fun/article/427b79ba-bc65-4e4e-aa35-30885de75b73.png)

**输入：** head = [1], pos = -1
**输出：** false
**解释：** 链表中没有环。

**提示：**

* 链表中节点的数目范围是 `[0, 104]`
* `-105 <= Node.val <= 105`
* `pos` 为 `-1` 或者链表中的一个 **有效索引** 。

**进阶：** 你能用 `O(1)`（即，常量）内存解决此问题吗？

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {

};
```

### 题目要点

给每个已遍历过的节点加标志位，遍历链表，当出现下一个节点已被标志时，则证明单链表有环

<details>
<summary>参考答案</summary>

## 解法一：标志法

给每个已遍历过的节点加标志位，遍历链表，当出现下一个节点已被标志时，则证明单链表有环

```bash
var hasCycle = function(head) {
    while(head) {
        if(head.flag) return true
        head.flag = true
        head = head.next
    }
    return false
};
```

时间复杂度：O(n) 空间复杂度：O(n)

## 解法二：利用 JSON.stringify() 不能序列化含有循环引用的结构

```javascript
var hasCycle = function(head) {
    try{
        JSON.stringify(head);
        return false;
    }
    catch(err){
        return true;
    }
};
```

时间复杂度：O(n) 空间复杂度：O(n)

## 解法三：快慢指针（双指针法）

设置快慢两个指针，遍历单链表，快指针一次走两步，慢指针一次走一步，如果单链表中存在环，则快慢指针终会指向同一个节点，否则直到快指针指向 null 时，快慢指针都不可能相遇

```lua
var hasCycle = function(head) {
    if(!head || !head.next) {
        return false
    }
    let fast = head.next.next, slow = head
    while(fast !== slow) {
        if(!fast || !fast.next) return false
        fast = fast.next.next
        slow = slow.next
    }
    return true
};
```

时间复杂度：O(n) 空间复杂度：O(1)

</details>

## 7. 找出数组中重复的数字 {#question-69360791-290f-44c8-ba87-6bfe7a5260ad}

> 难度：1 · 类型：QA

在一个长度为 n 的数组 `nums` 里的所有数字都在 `0～n-1` 的范围内。

数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。

请找出数组中任意一个重复的数字。

**示例 1：**

**输入：**
[2, 3, 1, 0, 2, 5, 3]

**输出：** 2 或 3

**限制：**

`2 <= n <= 100000`

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function(nums) {

};
```

### 题目要点

核心考查：找出数组中重复的数字的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```js
var findRepeatNumber = function(nums) {
   let map = new Map();
   for(let i of nums){
       if(map.has(i)) return i;
       map.set(i, 1);
   }
   return null;
};
```

</details>

## 8. 二叉树的最近公共祖先 {#question-b927e10f-2e07-4cf6-9005-54c1c3ed73ea}

> 难度：3 · 类型：QA

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。

[百度百科](https://baike.baidu.com/item/%E6%9C%80%E8%BF%91%E5%85%AC%E5%85%B1%E7%A5%96%E5%85%88/8918834?fr=aladdin)中最近公共祖先的定义为：“对于有根树 T 的两个节点 p、q，最近公共祖先表示为一个节点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（**一个节点也可以是它自己的祖先**）。”

**示例 1：**

![](https://static.ecool.fun/article/771e5d00-61f3-49a7-9d57-ccde4ae5358a.png)

**输入：** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1

**输出：** 3

**解释：** 节点 `5 `和节点 `1 `的最近公共祖先是节点 `3 。`

**示例 2：**

![](https://static.ecool.fun/article/771e5d00-61f3-49a7-9d57-ccde4ae5358a.png)

**输入：** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4

**输出：** 5

**解释：** 节点 `5 `和节点 `4 `的最近公共祖先是节点 `5 。`因为根据定义最近公共祖先节点可以为节点本身。

**示例 3：**

**输入：** root = [1,2], p = 1, q = 2

**输出：** 1

**提示：**

* 树中节点数目在范围 `[2, 105]` 内。
* `-109 <= Node.val <= 109`
* 所有 `Node.val` `互不相同` 。
* `p != q`
* `p` 和 `q` 均存在于给定的二叉树中。

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function(root, p, q) {

};
```

### 题目要点

我们使用递归，当节点为null或者节点等于p或q向上返回此节点。

<details>
<summary>参考答案</summary>

- 我们使用递归，当节点为null或者节点等于p或q向上返回此节点。
- 在结果向上回溯的过程中，要对左右节点的返回值进行判断：
  1. 如果左右节点返回的值都不为null（如图中紫色箭头所示），
![image.png](https://static.ecool.fun/article/d088d5a5-e713-4117-977d-5030c527024e.png)

# 复杂度

- 时间复杂度: O(n)
- 空间复杂度: O(1)

# Code

```JavaScript

/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
    var travelTree = function (node, p, q) {
        if (node == null || node == p || node == q) return node;
        let left = travelTree(node.left, p, q);
        let right = travelTree(node.right, p, q);
        if (left && right) {
            return node;
        }
        else if (left && right == null) {
            return left;
        } else if (left == null && right) {
            return right
        } else {
            return null
        }
    }
    return travelTree(root, p, q)
};
```

</details>

## 9. 二叉树的层序遍历 {#question-d82af9bd-ac3b-4948-b7c5-83ed83e08e2e}

> 难度：3 · 类型：QA

给你二叉树的根节点 `root` ，返回其节点值的 **层序遍历** 。 （即逐层地，从左到右访问所有节点）。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

**输入：**root = [3,9,20,null,null,15,7]
**输出：**[[3],[9,20],[15,7]]

**示例 2：**

**输入：**root = [1]
**输出：**[[1]]

**示例 3：**

**输入：**root = []
**输出：**[]

**提示：**

* 树中节点数目在范围 `[0, 2000]` 内
* `-1000 <= Node.val <= 1000`

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {

};
```

### 题目要点

思路：准备一个队列，将根节点加入队列，当队列不为空的时候循环队列，每次循环拿到当前队列的大小，在循环当前层的每个元素，然后加入输出数组ret中，如果这个元素存在左右节点则将左右节点加入队列

<details>
<summary>参考答案</summary>

## 方法1：广度优先遍历

- 思路：准备一个队列，将根节点加入队列，当队列不为空的时候循环队列，每次循环拿到当前队列的大小，在循环当前层的每个元素，然后加入输出数组ret中，如果这个元素存在左右节点则将左右节点加入队列
- 复杂度分析：时间复杂度 `O(n)`，每个点进队出队各一次，故渐进时间复杂度为 `O(n)`。空间复杂度`O(n)`，队列中元素的个数不超过 n 个

```js
var levelOrder = function(root) {
    const ret = [];
    if (!root) {
        return ret;
    }

    const q = [];
    q.push(root);//初始队列
    while (q.length !== 0) {
        const currentLevelSize = q.length;//当前层节点的数量
        ret.push([]);//新的层推入数组
        for (let i = 1; i <= currentLevelSize; ++i) {//循环当前层的节点
            const node = q.shift();
            ret[ret.length - 1].push(node.val);//推入当前层的数组
            if (node.left) q.push(node.left);//检查左节点，存在左节点就继续加入队列
            if (node.right) q.push(node.right);//检查左右节点，存在右节点就继续加入队列
        }
    }

    return ret;
};

```

## 方法2：深度优先遍历

- 思路：从根节点开始不断递归左右子树，透传step层数和res输出数组。
- 复杂度分析：时间复杂度`O(n)`,n是节点的个数。空间复杂度`O(n)`，n是树的高度。

```js
var levelOrder = function(root) {
    if(!root) return []
    let res = []
    dfs(root, 0, res)
    return res
};

function dfs(root, step, res){//每层透传当前节点，层数，和输出数组
  if(root){
    if(!res[step]) res[step] = []//初始化当前层数组
    res[step].push(root.val)//当前节点加入当前层数组
    dfs(root.left, step + 1, res)//step+1，递归左节点
    dfs(root.right, step + 1, res)//step+1，递归右节点
  }
}
```

</details>

## 10. 只出现一次的数字 {#question-d1556373-ae6c-4145-9111-e5cd74417497}

> 难度：1 · 类型：QA

给定一个**非空**整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

**说明：**

你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？

**示例 1:**

**输入:** [2,2,1]

**输出:** 1

**示例 2:**

**输入:** [4,1,2,1,2]

**输出:** 4

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {

};
```

### 题目要点

标签：位运算

<details>
<summary>参考答案</summary>

### 思路

- 标签：位运算
- 本题根据题意，线性时间复杂度 `O(n)`，很容易想到使用 Hash 映射来进行计算，遍历一次后结束得到结果，但是在空间复杂度上会达到 `O(n)`，需要使用较多的额外空间
- 既满足时间复杂度又满足空间复杂度，就要提到位运算中的异或运算 XOR，主要因为异或运算有以下几个特点：
  - 一个数和 0 做 XOR 运算等于本身：a⊕0 = a
  - 一个数和其本身做 XOR 运算等于 0：a⊕a = 0
  - XOR 运算满足交换律和结合律：a⊕b⊕a = (a⊕a)⊕b = 0⊕b = b
- 故而在以上的基础条件上，将所有数字按照顺序做抑或运算，最后剩下的结果即为唯一的数字
- 时间复杂度：`O(n)`，空间复杂度：`O(1)`

### 代码

```JavaScript
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    let ans = 0;
    for(const num of nums) {
        ans ^= num;
    }
    return ans;
};
```

</details>

## 11. 路径总和 {#question-39b2d340-18bd-464a-a0b7-6e45a3f0538b}

> 难度：1 · 类型：QA

给你二叉树的根节点 `root` 和一个表示目标和的整数 `targetSum` 。判断该树中是否存在 **根节点到叶子节点** 的路径，这条路径上所有节点值相加等于目标和 `targetSum` 。如果存在，返回 `true` ；否则，返回 `false` 。

**叶子节点** 是指没有子节点的节点。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/01/18/pathsum1.jpg)

**输入：** root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22

**输出：** true

**解释：** 等于目标和的根节点到叶节点路径如上图所示。

**示例 2：**

![](https://assets.leetcode.com/uploads/2021/01/18/pathsum2.jpg)

**输入：** root = [1,2,3], targetSum = 5

**输出：** false

**解释：** 树中存在两条根节点到叶子节点的路径：

```
(1 --> 2): 和为 3
(1 --> 3): 和为 4
```
不存在 sum = 5 的根节点到叶子节点的路径。

**示例 3：**

**输入：** root = [], targetSum = 0

**输出：** false

**解释：** 由于树是空的，所以不存在根节点到叶子节点的路径。

**提示：**

* 树中节点的数目在范围 `[0, 5000]` 内
* `-1000 <= Node.val <= 1000`
* `-1000 <= targetSum <= 1000`

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {boolean}
 */
var hasPathSum = function(root, targetSum) {

};
```

### 题目要点

**思路**： 将问题转化为，当前节点的子节点到叶子节点的路径和是否等于`targetSum - root.val`。递归遍历到叶子节点为止。 **递归分析**

<details>
<summary>参考答案</summary>

### 方法一：DFS（递归）
**思路**：
将问题转化为，当前节点的子节点到叶子节点的路径和是否等于`targetSum - root.val`。递归遍历到叶子节点为止。
**递归分析**
- 终止条件：当前节点为null，返回false；当前节点为叶子节点，判断sum是否等于val
- 递归推进：递归判断左右子节点，返回结果

### 代码

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {boolean}
 */
var hasPathSum = function (root, targetSum) {
  if (!root) {
    return false;
  }

  if (!root.left && !root.right) {
    return root.val === targetSum;
  }

  return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
};
```
时间复杂度O(N)：其中 N 是树的节点数。对每个节点访问一次。

空间复杂度O(H)：其中 HH 是树的高度。空间复杂度主要取决于递归时栈空间的开销，最坏情况下，树呈现链状，空间复杂度为 O(N)。平均情况下树的高度与节点数的对数正相关，空间复杂度为 O(logN)。

### 方法二：BFS（队列或栈）
**思路**：
进行广度优先遍历，使用两个队列，一个队列用于保存节点，一个队列用于保存对应节点到根节点的路径和。如果当前节点是叶子节点，则判断路径和是否等于sum。（使用栈也一样，只不过顺序不同而已，队列先遍历左子树，栈先遍历右子树）

### 代码：
```
var hasPathSum = function(root, targetSum) {
    if(root == null){
        return false;
    }
    var queue1 = [root];
    var queue2 = [root.val];
    while(queue1.length !== 0){
        var node = queue1.shift();
        var rootVal = queue2.shift();
        if(node.left == null && node.right == null && rootVal == targetSum){
            return true;
        }
        if(node.left){
            queue1.push(node.left);
            queue2.push(node.left.val + rootVal);
        }
        if(node.right){
            queue1.push(node.right);
            queue2.push(node.right.val + rootVal);
        }
    }
    return false;
};
```

时间复杂度O(N)：其中 N 是树的节点数。对每个节点访问一次。

空间复杂度O(N)：其中 N 是树的节点数。空间复杂度主要取决于队列的开销，队列中的元素个数不会超过树的节点数。

</details>

## 12. 编辑距离 {#question-6ed21b1e-7f81-422b-94b4-0d2250b39ed9}

> 难度：5 · 类型：QA

给你两个单词 `word1` 和 `word2`， _请返回将 `word1` 转换成 `word2` 所使用的最少操作数_ 。

你可以对一个单词进行如下三种操作：

* 插入一个字符
* 删除一个字符
* 替换一个字符

**示例 1：**

**输入：** word1 = "horse", word2 = "ros"

**输出：** 3

**解释：**

```
horse -> rorse (将 'h' 替换为 'r')
rorse -> rose (删除 'r')
rose -> ros (删除 'e')
```

**示例 2：**

**输入：** word1 = "intention", word2 = "execution"

**输出：** 5

**解释：**

```
intention -> inention (删除 't')
inention -> enention (将 'i' 替换为 'e')
enention -> exention (将 'n' 替换为 'x')
exention -> exection (将 'n' 替换为 'c')
exection -> execution (插入 'u')
```

**提示：**

* `0 <= word1.length, word2.length <= 500`
* `word1` 和 `word2` 由小写英文字母组成

```js
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {

};
```

### 题目要点

此题是一个最短编辑距离问题，我们在工作中用到工具和框架有很多也是类似的算法。比如`Git`提交，对比差异。`vue`中将更新前的`虚拟dom`改成更新后的虚拟dom（vue中对此做了取舍，有优化）

<details>
<summary>参考答案</summary>

此题是一个最短编辑距离问题，我们在工作中用到工具和框架有很多也是类似的算法。比如`Git`提交，对比差异。`vue`中将更新前的`虚拟dom`改成更新后的虚拟dom（vue中对此做了取舍，有优化）

首先对题意要有个理解：

#### 一、分析题意

三种操作，`增，删，改`，都是针对`word1`的。但是其实此题目中只要求求出`最短操作`。所以<br>
`word1`和`word2`之间，`操作互换`一样可以达到同样的效果。

比如`word1`为`people`，`word2`为`peopl`，此时，`word1`末尾`删除e` 或者 `word2`末尾`增加e`都可以达到 `word1 == word2` 的效果。

所以针对`word1`的`增删`操作可以转化为对`word1`或者`word2`的`增`操作<br>
 再加上对`word1`的`改`操作

#### 二、解题思路

假如当word1和word2末尾相同的时候，其实是相当于没有操作。 比如 `people 到peopl` 和`peoplee到people` 二者所需要的操作都是`相同`的。

根据题目意思，我们需要找到最少操作数，最少最优，基本上都和贪心及动态规划有关系。

此题需要对比word1和word2进行对比操作。先使用动态规划解决。

1. 首先构建一个二维数组用来记录子问题的解。

| dp           | “” | **r** | (ro) **o** | (ros) **s** |
| ------------ | -- | ----- | ---------- | ----------- |
| “”           | 0  | 1     | 2          | 3           |
| **h**        | 1  |       |            |             |
| (ho) **o**   | 2  |       |            |             |
| (hor)**r**   | 3  |       |            |             |
| (hors)**s**  | 4  |       |            |             |
| (horse)**e** | 5  |       |            |             |

> `dp[i][j]` 表示 `i` 到 `j` 所需要的步数，以`dp[2][1]`为例子，表示`“ho”`转换到`“r”` 所需要的操作数

如表，是我们要初始化出来的`dp二维数组`。表内数字，分别代表`竖列`到达`横排`所需要的操作数。<br>
 有了dp数组，我们先来操作一次。求出`dp[1][1]`的值。

1. dp\[1\]\[1\]处，`word1`为`h`，`word2`为`r`。两位`不同`,那么有三种处理方式<br>
   1. `h -> r` 更改`h`,操作数为`1`，修改之后变成了 `r`和`r`，参照`说明中的第二条`，我们再加上`dp[0][0]`即可<br>
   2. `word2`增加`h`变为`rh`,操作数为`1`, `h`和`rh`参照`说明中的第二条`，就变成了`‘’ => "r"`所用的步数，`dp[0][1]`<br>
   3. `word1`增加`r`变为`hr`,操作数为`1`, `hr`和`r`参照`说明中的第二条`，就变成了`‘h’ => ""`所用的步数，`dp[1][0]`
2. 当我们分析出了以上三种情况后，我们肯定要取最小值作为我们此次dp\[1\]\[1\]所要求出来的值了。
3. 转换为代码就是 `1 + Math.min(dp[0][0],dp[0][1],dp[1][0])`
4. 以上是末尾不相同的情况，如果相同，请参照`说明第二条`。实际上就是和横纵各退一步的情况相同
5. 最后我们将`dp[i][j]`看作此次`dp[1][1]`时。实际代码就出来了

```js
dp[i][j] = word1[i-1] === word2[j-1] ?
    dp[i-1][j-1] :
    (1 + Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]))
```

#### 最终完成的dp

| dp           | “” | **r** | (ro) **o** | (ros) **s** |
| ------------ | -- | ----- | ---------- | ----------- |
| “”           | 0  | 1     | 2          | 3           |
| **h**        | 1  | 1     | 2          | 3           |
| (ho) **o**   | 2  | 2     | 1          | 2           |
| (hor)**r**   | 3  | 2     | 2          | 2           |
| (hors)**s**  | 4  | 3     | 3          | 2           |
| (horse)**e** | 5  | 4     | 4          | 3           |

### 代码实现

```js
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {
    let length1 = word1.length;
    let length2 = word2.length;

    let dp = new Array(length1 + 1).fill(0).map((item) => {return new Array(length2 + 1).fill(0)});

    for (let i = 0; i < dp.length; i++) {
        dp[i][0] = i;
    }
    for (let i = 0; i < dp[0].length; i++) {
        dp[0][i] = i;
    }
    //初始化工作结束
    for (let i = 1; i <= length1; i++) {
        for (let j = 1; j <= length2; j++) {
            dp[i][j] = word1[i-1] === word2[j-1] ? dp[i-1][j-1] : (1 + Math.min(
                dp[i-1][j],
                dp[i][j-1],
                dp[i-1][j-1]
            ))
        }
    }
    return dp[length1][length2]

};
```

### 总结

我们知道vue的diff算法被优化到了`O(n)`，而此题我们观察发现除了两层循环对比每个元素，还需要min操作，实际时间复杂度到达了O(n^3)。

那么vue是如何做到的呢？还记得我们循环节点时需要设置的key。通过这个key，我们就可以一一对应前后节点之间的关系。那我们只需要遍历一次节点就可以了。

</details>

## 13. 数组中的第 k 大的数字 {#question-f196bf54-110a-4440-896a-a678835bea83}

> 难度：3 · 类型：QA

给定整数数组 `nums` 和整数 `k`，请返回数组中第 `**k**` 个最大的元素。

请注意，你需要找的是数组排序后的第 `k` 个最大的元素，而不是第 `k` 个不同的元素。

**示例 1:**

**输入:** `[3,2,1,5,6,4],` k = 2
**输出:** 5

**示例 2:**

**输入:** `[3,2,3,1,2,4,5,5,6], `k = 4
**输出:** 4

**提示：**

* `1 <= k <= nums.length <= 10^4`
* `-10^4 <= nums[i] <= 10^4`

```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(nums, k) {

};
```

### 题目要点

Array.sort从大到小排序，并取值

<details>
<summary>参考答案</summary>

## 解题1
Array.sort从大到小排序，并取值
```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(nums, k) {
    nums.sort((a, b) => b - a)
    return nums[k - 1]
};
```

## 解题2
推排序

1. 思路是维持一个单调递减堆stack
2. 循环nums数组，
3. 判断堆顶元素是否小于数组元素n，满足，则推入tmp中
4. 直到stack为空或不满足上一步判断
5. 如果stack的长度小于k，则推入n
6. 如果stack的长度还小于k，并tmp有值，持续将tmp中的值填入stack
7. 最后返回stack栈顶元素

```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(nums, k) {
    let stack = []

    for (let i = 0; i < nums.length; i++) {
        const n = nums[i], tmp = []
        while(stack.length && stack[stack.length - 1] < n) {
            tmp.push(stack.pop())
        }
        if (stack.length < k) stack.push(n)
        while(tmp.length && stack.length < k) {
            stack.push(tmp.pop())
        }
    }
    return stack[stack.length - 1]
};
```
- 时间复杂度：O(NK)，N = nums.length，K = k
- 空间复杂度：O(K)

## 解题3
快速排序，从大到小，取数组下标k-1的元素，即为所求。
因为题目只要求第K大的数字，所以不需要全部排序，只需要比较左右分的下标pos和k-1的大小，对部分区间进行排序即可
```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(nums, k) {
    quickSort(0, nums.length - 1)
    return nums[k-1]

    function quickSort(left, right) {
        if (left < right) {
            let pos = partition(left, right)
            if (pos < k-1)  quickSort(pos + 1, right)
            if (pos > k-1)  quickSort(left, pos - 1)
        }
    }

    function partition(left, right) {
        const pivot = nums[right]
        let i = left
        for(let j = left; j < right; j++) {
            if (nums[j] >= pivot) {
                swap(i++, j)
            }
        }
        swap(i, right)

        return i
    }

    function swap(i, j) {
        const tmp = nums[i]
        nums[i] = nums[j]
        nums[j]  = tmp
    }
};
```

</details>

## 14. 合并两个有序数组 {#question-e1f26ce6-71ba-4f91-b9a6-42d732799863}

> 难度：1 · 类型：QA

给你两个按 **非递减顺序** 排列的整数数组 `nums1`和 `nums2`，另有两个整数 `m` 和 `n` ，分别表示 `nums1` 和 `nums2` 中的元素数目。

请你 **合并** `nums2`到 `nums1` 中，使合并后的数组同样按 **非递减顺序** 排列。

**注意：** 最终，合并后数组不应由函数返回，而是存储在数组 `nums1` 中。为了应对这种情况，`nums1` 的初始长度为 `m + n`，其中前 `m` 个元素表示应合并的元素，后 `n` 个元素为 `0` ，应忽略。`nums2` 的长度为 `n` 。

**示例 1：**

**输入：** nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3

**输出：** [1,2,2,3,5,6]

**解释：** 需要合并 [1,2,3] 和 [2,5,6] 。

合并结果是 [_**1**_,_**2**_,2,_**3**_,5,6] ，其中斜体加粗标注的为 nums1 中的元素。

**示例 2：**

**输入：** nums1 = [1], m = 1, nums2 = [], n = 0

**输出：** [1]

**解释：** 需要合并 [1] 和 [] 。

合并结果是 [1] 。

**示例 3：**

**输入：**nums1 = [0], m = 0, nums2 = [1], n = 1
**输出：**[1]
**解释：**需要合并的数组是 [] 和 [1] 。
合并结果是 [1] 。
注意，因为 m = 0 ，所以 nums1 中没有元素。nums1 中仅存的 0 仅仅是为了确保合并结果可以顺利存放到 nums1 中。

**提示：**

* `nums1.length == m + n`
* `nums2.length == n`
* `0 <= m, n <= 200`
* `1 <= m + n <= 200`
* `-109 <= nums1[i], nums2[j] <= 109`

**进阶：**你可以设计实现一个时间复杂度为 `O(m + n)` 的算法解决此问题吗？

```js
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {

};
```

### 题目要点

标签：从后向前数组遍历

<details>
<summary>参考答案</summary>

## 思路

- 标签：从后向前数组遍历
- 因为 `nums1` 的空间都集中在后面，所以从后向前处理排序的数据会更好，节省空间，一边遍历一边将值填充进去
- 设置指针 `len1` 和 `len2` 分别指向 `nums1` 和 `nums2` 的有数字尾部，从尾部值开始比较遍历，同时设置指针 `len` 指向 `nums1` 的最末尾，每次遍历比较值大小之后，则进行填充
- 当 `len1<0` 时遍历结束，此时 `nums2` 中海油数据未拷贝完全，将其直接拷贝到 `nums1` 的前面，最后得到结果数组
- 时间复杂度：O(m+n)

## 代码

```JavaScript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
    let len1 = m - 1;
    let len2 = n - 1;
    let len = m + n - 1;
    while(len1 >= 0 && len2 >= 0) {
        // 注意--符号在后面，表示先进行计算再减1，这种缩写缩短了代码
        nums1[len--] = nums1[len1] > nums2[len2] ? nums1[len1--] : nums2[len2--];
    }
    function arrayCopy(src, srcIndex, dest, destIndex, length) {
        dest.splice(destIndex, length, ...src.slice(srcIndex, srcIndex + length));
    }
    // 表示将nums2数组从下标0位置开始，拷贝到nums1数组中，从下标0位置开始，长度为len2+1
    arrayCopy(nums2, 0, nums1, 0, len2 + 1);
};
```

</details>

## 15. 有效的括号 {#question-2c3871df-1368-4abe-943d-6cf5695620bc}

> 难度：1 · 类型：QA

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s` ，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。

**示例 1：**

**输入：** s = "()"

**输出：** true

**示例 2：**

**输入：** s = "()[]{}"

**输出：** true

**示例 3：**

**输入：** s = "(]"

**输出：** false

**示例 4：**

**输入：** s = "([)]"

**输出：** false

**示例 5：**

**输入：** s = "{[]}"

**输出：** true

**提示：**

* `1 <= s.length <= 104`
* `s` 仅由括号 `'()[]{}'` 组成

```js
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {

};
```

### 题目要点

判断括号的有效性可以使用「栈」这一数据结构来解决。

<details>
<summary>参考答案</summary>

判断括号的有效性可以使用「栈」这一数据结构来解决。

我们遍历给定的字符串 s。当我们遇到一个左括号时，我们会期望在后续的遍历中，有一个相同类型的右括号将其闭合。由于**后遇到的左括号要先闭合**，因此我们可以将这个左括号放入栈顶。

当我们遇到一个右括号时，我们需要将一个相同类型的左括号闭合。此时，我们可以取出栈顶的左括号并判断它们是否是相同类型的括号。如果不是相同的类型，或者栈中并没有左括号，那么字符串 s 无效，返回 false。为了快速判断括号的类型，我们可以使用哈希表存储每一种括号。哈希表的键为右括号，值为相同类型的左括号。

在遍历结束后，如果栈中没有左括号，说明我们将字符串 s 中的所有左括号闭合，返回 true，否则返回 false。

注意到有效字符串的长度一定为偶数，因此如果字符串的长度为奇数，我们可以直接返回 false，省去后续的遍历判断过程。

```JavaScript
var isValid = function(s) {
    const n = s.length;
    if (n % 2 === 1) {
        return false;
    }
    const pairs = new Map([
        [')', '('],
        [']', '['],
        ['}', '{']
    ]);
    const stk = [];
    for (let ch of s){
        if (pairs.has(ch)) {
            if (!stk.length || stk[stk.length - 1] !== pairs.get(ch)) {
                return false;
            }
            stk.pop();
        }
        else {
            stk.push(ch);
        }
    };
    return !stk.length;
};
```

**复杂度分析**

- 时间复杂度：O(n)，其中 n 是字符串 s 的长度。

- 空间复杂度：O(n+∣Σ∣)，其中 Σ 表示字符集，本题中字符串只包含 6 种括号，Σ = 6。栈中的字符数量为 O(n)，而哈希表使用的空间为 O(|Σ|)，相加即可得到总空间复杂度。

</details>

## 16. 二叉树中和为某一值的路径 {#question-f0664776-84fa-45ea-800d-3873b9180d36}

> 难度：3 · 类型：QA

给你二叉树的根节点 `root` 和一个整数目标和 `targetSum` ，找出所有 **从根节点到叶子节点** 路径总和等于给定目标和的路径。

**叶子节点** 是指没有子节点的节点。

**示例 1：**

![](https://pic.rmb.bdstatic.com/bjh/8771ad1c0da043e18c975fe618d70489.png)

**输入：** root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
**输出：** [[5,4,11,2],[5,8,4,5]]

**示例 2：**

![](https://pic.rmb.bdstatic.com/bjh/2c1a1aabf2e37caf1fb5d7f5b3efd5f6.png)

**输入：** root = [1,2,3], targetSum = 5
**输出：** []

**示例 3：**

**输入：** root = [1,2], targetSum = 0
**输出：** []

**提示：**

* 树中节点总数在范围 `[0, 5000]` 内
* `-1000 <= Node.val <= 1000`
* `-1000 <= targetSum <= 1000`

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} target
 * @return {number[][]}
 */
var pathSum = function(root, target) {

};
```

### 题目要点

深度优先遍历

<details>
<summary>参考答案</summary>

## 解题思路

深度优先遍历

* 每层都三个参数，一个是当前结点，一个是 target 剩余值，一个是总路径数组
* 当往二叉树深处进行遍历时，如果 target 剩余值跟结点值相等且左右子树为空(叶子结点)，则满足要求，往 result 压入当前总路径数组 path
* 对于左右子树不为空的结点，继续往左或右子树进行遍历，直到叶子结点

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} target
 * @return {number[][]}
 */

var pathSum = function (root, sum) {
    if (!root) return [];
    const res = [];

    const dfs = (root, sum, path) => {
      if(!root) return;
      // 到了叶子节点并且当前节点的值跟剩余sum相等，则推入结果集中
      if (root.val === sum && !root.left && !root.right) {
        res.push(path);
      }
      // 路径中加入当前节点的值
      path.push(root.val);
      dfs(root.left, sum - root.val, path.slice());
      dfs(root.right, sum - root.val, path.slice());
    };

    dfs(root, sum, []);
    return res;
};
```

</details>

## 17. 二叉树的层序遍历 {#question-d545f64f-073b-4e71-bc08-59a5aea4d269}

> 难度：3 · 类型：QA

给你二叉树的根节点 `root` ，返回其节点值的 **层序遍历** 。 （即逐层地，从左到右访问所有节点）。

**示例 1：**

![](https://pic.rmb.bdstatic.com/bjh/f887a426462de1984fe2ec643db1051e.png)

**输入：** root = [3,9,20,null,null,15,7]

**输出：** [[3],[9,20],[15,7]]

**示例 2：**

**输入：** root = [1]

**输出：** [[1]]

**示例 3：**

**输入：** root = []

**输出：** []

**提示：**

* 树中节点数目在范围 `[0, 2000]` 内
* `-1000 <= Node.val <= 1000`

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {

};
```

### 题目要点

思路：准备一个队列，将根节点加入队列，当队列不为空的时候循环队列，每次循环拿到当前队列的大小，在循环当前层的每个元素，然后加入输出数组ret中，如果这个元素存在左右节点则将左右节点加入队列

<details>
<summary>参考答案</summary>

### 方法1.广度优先遍历

- 思路：准备一个队列，将根节点加入队列，当队列不为空的时候循环队列，每次循环拿到当前队列的大小，在循环当前层的每个元素，然后加入输出数组ret中，如果这个元素存在左右节点则将左右节点加入队列
- 复杂度分析：时间复杂度 `O(n)`，每个点进队出队各一次，故渐进时间复杂度为 `O(n)`。空间复杂度`O(n)`，队列中元素的个数不超过 n 个

```js
var levelOrder = function(root) {
    const ret = [];
    if (!root) {
        return ret;
    }

    const q = [];
    q.push(root);//初始队列
    while (q.length !== 0) {
        const currentLevelSize = q.length;//当前层节点的数量
        ret.push([]);//新的层推入数组
        for (let i = 1; i <= currentLevelSize; ++i) {//循环当前层的节点
            const node = q.shift();
            ret[ret.length - 1].push(node.val);//推入当前层的数组
            if (node.left) q.push(node.left);//检查左节点，存在左节点就继续加入队列
            if (node.right) q.push(node.right);//检查左右节点，存在右节点就继续加入队列
        }
    }

    return ret;
};

```

### 方法2：深度优先遍历

- 思路：从根节点开始不断递归左右子树，透传step层数和res输出数组。
- 复杂度分析：时间复杂度`O(n)`,n是节点的个数。空间复杂度`O(n)`，n是树的高度。

```js
var levelOrder = function(root) {
    if(!root) return []
    let res = []
    dfs(root, 0, res)
    return res
};

function dfs(root, step, res){//每层透传当前节点，层数，和输出数组
  if(root){
    if(!res[step]) res[step] = []//初始化当前层数组
    res[step].push(root.val)//当前节点加入当前层数组
    dfs(root.left, step + 1, res)//step+1，递归左节点
    dfs(root.right, step + 1, res)//step+1，递归右节点
  }
}
```

</details>

## 18. 字符串相加 {#question-94c6d4eb-76c3-4756-956e-9cc277d9d93f}

> 难度：1 · 类型：QA

给定两个字符串形式的非负整数 `num1` 和`num2` ，计算它们的和并同样以字符串形式返回。

你不能使用任何內建的用于处理大整数的库（比如 `BigInteger`）， 也不能直接将输入的字符串转换为整数形式。

**示例 1：**

**输入：** num1 = "11", num2 = "123"

**输出：** "134"

**示例 2：**

**输入：** num1 = "456", num2 = "77"

**输出：** "533"

**示例 3：**

**输入：** num1 = "0", num2 = "0"

**输出：** "0"

**提示：**

* `1 <= num1.length, num2.length <= 104`
* `num1` 和`num2` 都只包含数字 `0-9`
* `num1` 和`num2` 都不包含任何前导零

```js
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
var addStrings = function(num1, num2) {

};
```

### 题目要点

**思路与算法**

<details>
<summary>参考答案</summary>

**思路与算法**

本题我们只需要对两个大整数模拟「竖式加法」的过程。竖式加法就是我们平常学习生活中常用的对两个整数相加的方法，回想一下我们在纸上对两个整数相加的操作，是不是如下图将相同数位对齐，从低到高逐位相加，如果当前位和超过 $10$，则向高位进一位？因此我们只要将这个过程用代码写出来即可。

![fig1](https://static.ecool.fun//article/eb044344-8910-4cc7-918a-28e8dab4061d.png)

具体实现也不复杂，我们定义两个指针 `i` 和 `j` 分别指向 `num1` 和 `num2` 的末尾，即最低位，同时定义一个变量 `add` 维护当前是否有进位，然后从末尾到开头逐位相加即可。你可能会想两个数字位数不同怎么处理，这里我们统一在指针当前下标处于负数的时候返回 `0`，等价于 **对位数较短的数字进行了补零操作**，这样就可以除去两个数字位数不同情况的处理，具体可以看下面的代码。

```JavaScript
var addStrings = function(num1, num2) {
    let i = num1.length - 1, j = num2.length - 1, add = 0;
    const ans = [];
    while (i >= 0 || j >= 0 || add != 0) {
        const x = i >= 0 ? num1.charAt(i) - '0' : 0;
        const y = j >= 0 ? num2.charAt(j) - '0' : 0;
        const result = x + y + add;
        ans.push(result % 10);
        add = Math.floor(result / 10);
        i -= 1;
        j -= 1;
    }
    return ans.reverse().join('');
};
```

**复杂度分析**

- 时间复杂度：`O(max(len1,len2))`，其中 `len1=num1.length`，`len2=num2.length`。竖式加法的次数取决于较大数的位数。
- 空间复杂度：`O(1)`。除答案外我们只需要常数空间存放若干变量。

</details>

## 19. 数据流中的中位数 {#question-be6669ec-4d94-4c6a-9fc9-1b243e6ea777}

> 难度：5 · 类型：QA

如何得到一个数据流中的中位数？如果从数据流中读出奇数个数值，那么中位数就是所有数值排序之后位于中间的数值。如果从数据流中读出偶数个数值，那么中位数就是所有数值排序之后中间两个数的平均值。

例如，

[2,3,4] 的中位数是 3

[2,3] 的中位数是 (2 + 3) / 2 = 2.5

设计一个支持以下两种操作的数据结构：

* void addNum(int num) - 从数据流中添加一个整数到数据结构中。
* double findMedian() - 返回目前所有元素的中位数。

**示例 1：**

**输入：**
["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
[[],[1],[2],[],[3],[]]
**输出：**[null,null,null,1.50000,null,2.00000]

**示例 2：**

**输入：**
["MedianFinder","addNum","findMedian","addNum","findMedian"]
[[],[2],[],[3],[]]
**输出：**[null,null,2.00000,null,2.50000]

**限制：**

* 最多会对 `addNum、findMedian` 进行 `50000` 次调用。

```js
/**
 * initialize your data structure here.
 */
var MedianFinder = function() {

};

/**
 * @param {number} num
 * @return {void}
 */
MedianFinder.prototype.addNum = function(num) {

};

/**
 * @return {number}
 */
MedianFinder.prototype.findMedian = function() {

};

/**
 * Your MedianFinder object will be instantiated and called as such:
 * var obj = new MedianFinder()
 * obj.addNum(num)
 * var param_2 = obj.findMedian()
 */
```

### 题目要点

每次取出中位数的时候，都先将所有元素进行排序，然后再计算中位数。代码如下：

<details>
<summary>参考答案</summary>

## 解法 1:暴力法

每次取出中位数的时候，都先将所有元素进行排序，然后再计算中位数。代码如下：

```javascript

var MedianFinder = function() {
    this.data = [];
};

MedianFinder.prototype.addNum = function(num) {
    this.data.push(num);
};

MedianFinder.prototype.findMedian = function() {
    const length = this.data.length;
    if (!length) {
        return null;
    }
    this.data.sort((a, b) => a - b);

    const mid = Math.floor((length - 1) / 2);
    if (length % 2) {
        return this.data[mid];
    }
    return (this.data[mid] + this.data[mid + 1]) / 2;
};
```

也可以在添加元素的时候直接排序。时间复杂度一样，均是 O(NlogN)，**无法 ac**。

## 解法 2: 二分查找

其实不需要每次添加元素的时候，都对全部元素重新排序。如果之前一直保证元素是有序的，那么添加新元素的时候，只需要将元素插入到正确位置即可，查找正确位置可以通过「二分搜索」来完成。

为了保证之前的元素有序，针对每个新添加的元素都将其放入正确位置。

代码实现如下：

```javascript

var MedianFinder = function() {
    this.data = [];
};

MedianFinder.prototype.addNum = function(num) {
    if (!this.data.length) {
        this.data.push(num);
        return;
    }

    let left = 0,
        right = this.data.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (this.data[mid] === num) {
            this.data.splice(mid, 0, num);
            return;
        } else if (this.data[mid] < num) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    this.data.splice(right + 1, 0, num);
};

MedianFinder.prototype.findMedian = function() {
    const length = this.data.length;
    if (!length) {
        return null;
    }

    const mid = Math.floor((length - 1) / 2);
    if (length % 2) {
        return this.data[mid];
    }
    return (this.data[mid] + this.data[mid + 1]) / 2;
};
```

二分查找需要O(logN)的复杂度，移动元素需要O(N)复杂度，所以时间复杂度是O(N)。

## 解法 3: 最大堆 + 最小堆

对于这种动态数据，堆是极好的解决方案。准备两个堆：

-   最大堆：存放数据流中较小的一半元素
-   最小堆：存放数据流中较大的一半元素

需要保证这 2 个堆的“平衡”。这里的平衡指得是：最大堆的大小 = 最小堆的大小， 或者 最大堆的大小 = 最小堆的大小 + 1。

当调用 findMedian 查询中位数的时候，中位数就是最大堆的堆顶元素，或者 (最大堆的堆顶元素 + 最小堆的堆顶元素)/2

剩下的问题就是怎么保证堆的平衡？步骤如下：

-   先让 num 入 maxHeap
-   取出 maxHeap 的堆顶元素，放入 minHeap
-   若此时`最大堆的大小 < 最小堆的大小`，取出 minHeap 的堆顶元素，让入 maxHeap

由于 JavaScript 中没有堆，所以要自己实现。**在实现的时候，堆的代码其实只需要一份，堆中进行判定的比较函数由外界传入即可**。

```javascript

const defaultCmp = (x, y) => x > y; // 默认是最大堆

const swap = (arr, i, j) => ([arr[i], arr[j]] = [arr[j], arr[i]]);

class Heap {
    /**
     * 默认是最大堆
     * @param {Function} cmp
     */
    constructor(cmp = defaultCmp) {
        this.container = [];
        this.cmp = cmp;
    }

    insert(data) {
        const { container, cmp } = this;

        container.push(data);
        let index = container.length - 1;
        while (index) {
            let parent = Math.floor((index - 1) / 2);
            if (!cmp(container[index], container[parent])) {
                return;
            }
            swap(container, index, parent);
            index = parent;
        }
    }

    extract() {
        const { container, cmp } = this;
        if (!container.length) {
            return null;
        }

        swap(container, 0, container.length - 1);
        const res = container.pop();
        const length = container.length;
        let index = 0,
            exchange = index * 2 + 1;

        while (exchange < length) {
            // // 以最大堆的情况来说：如果有右节点，并且右节点的值大于左节点的值
            let right = index * 2 + 2;
            if (right < length && cmp(container[right], container[exchange])) {
                exchange = right;
            }
            if (!cmp(container[exchange], container[index])) {
                break;
            }
            swap(container, exchange, index);
            index = exchange;
            exchange = index * 2 + 1;
        }

        return res;
    }

    top() {
        if (this.container.length) return this.container[0];
        return null;
    }
}
```

整体的代码逻辑如下：

```javascript

var MedianFinder = function() {
    this.maxHeap = new Heap();
    this.minHeap = new Heap((x, y) => x < y);
};

MedianFinder.prototype.addNum = function(num) {
    this.maxHeap.insert(num);
    this.minHeap.insert(this.maxHeap.top());
    this.maxHeap.extract();

    if (this.maxHeap.container.length < this.minHeap.container.length) {
        this.maxHeap.insert(this.minHeap.top());
        this.minHeap.extract();
    }
};

MedianFinder.prototype.findMedian = function() {
    return this.maxHeap.container.length > this.minHeap.container.length
        ? this.maxHeap.top()
        : (this.maxHeap.top() + this.minHeap.top()) / 2;
};
```

时间复杂度是O(logN)，空间复杂度是O(N)。

</details>

## 20. 最小的k个数 {#question-43899450-bd19-491c-b9b0-0277f61725b0}

> 难度：1 · 类型：QA

输入整数数组 `arr` ，找出其中最小的 `k` 个数。例如，输入4、5、1、6、2、7、3、8这8个数字，则最小的4个数字是1、2、3、4。

**示例 1：**

**输入：** arr = [3,2,1], k = 2

**输出：** [1,2] 或者 [2,1]

**示例 2：**

**输入：** arr = [0,1,2,1], k = 1

**输出：** [0]

**限制：**

* `0 <= k <= arr.length <= 10000`
* `0 <= arr[i] <= 10000`

```js
/**
 * @param {number[]} arr
 * @param {number} k
 * @return {number[]}
 */
var getLeastNumbers = function(arr, k) {

};
```

### 题目要点

虽然这题在 leetcode 上标注的「简单」，但是本题还是很有研究意义的。本文介绍了 3 种解法，时间复杂度依次降低，都是基于经典的算法或者数据结构。

<details>
<summary>参考答案</summary>

## 题目分析

虽然这题在 leetcode 上标注的「简单」，但是本题还是很有研究意义的。本文介绍了 3 种解法，时间复杂度依次降低，都是基于经典的算法或者数据结构。

## 解法 1: 直接排序

先说最简单、最直观的做法：直接排序。将数组按照从小到大的顺序排序，并且返回前 k 个数字。代码实现如下：

```javascript
/**
 * @param {number[]} arr
 * @param {number} k
 * @return {number[]}
 */
var getLeastNumbers = function(arr, k) {
    return arr.sort((a, b) => a - b).slice(0, k);
};
```

使用高级排序（代码用的是快排），时间复杂度是`O(NlogN)`，空间复杂度是`O(logN)`。

## 解法 2: 最大堆

堆是一种非常常用的数据结构。最大堆的性质是：节点值大于子节点的值，堆顶元素是最大元素。利用这个性质，整体的算法流程如下：

-   创建大小为 k 的最大堆
-   将数组的前 k 个元素放入堆中
-   从下标 k 继续开始依次遍历数组的剩余元素：
    -   如果元素小于堆顶元素，那么取出堆顶元素，将当前元素入堆
    -   如果元素大于/等于堆顶元素，不做操作

由于堆的大小是 K，空间复杂度是`O(K)`，时间复杂度是`O(NlogK)`。

由于 JavaScript 中没有堆，所以需要手动实现。代码如下：

```javascript
function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
}

class MaxHeap {
    constructor(arr = []) {
        this.container = [];
        if (Array.isArray(arr)) {
            arr.forEach(this.insert.bind(this));
        }
    }

    insert(data) {
        const { container } = this;

        container.push(data);
        let index = container.length - 1;
        while (index) {
            let parent = Math.floor((index - 1) / 2);
            if (container[index] <= container[parent]) {
                break;
            }
            swap(container, index, parent);
            index = parent;
        }
    }

    extract() {
        const { container } = this;
        if (!container.length) {
            return null;
        }

        swap(container, 0, container.length - 1);
        const res = container.pop();
        const length = container.length;
        let index = 0,
            exchange = index * 2 + 1;

        while (exchange < length) {
            // 如果有右节点，并且右节点的值大于左节点的值
            let right = index * 2 + 2;
            if (right < length && container[right] > container[exchange]) {
                exchange = right;
            }
            if (container[exchange] <= container[index]) {
                break;
            }
            swap(container, exchange, index);
            index = exchange;
            exchange = index * 2 + 1;
        }

        return res;
    }

    top() {
        if (this.container.length) return this.container[0];
        return null;
    }
}

/**
 * @param {number[]} arr
 * @param {number} k
 * @return {number[]}
 */
var getLeastNumbers = function(arr, k) {
    const length = arr.length;
    if (k >= length) {
        return arr;
    }

    const heap = new MaxHeap(arr.slice(0, k));
    for (let i = k; i < length; ++i) {
        if (heap.top() > arr[i]) {
            heap.extract();
            heap.insert(arr[i]);
        }
    }
    return heap.container;
};
```

## 解法 3: 基于快速排序的 partition

解法 1 中使用了快速排序，但其实并需要对全部元素进行排序，题目只需要前 k 个元素。

回顾快速排序中的 partition 操作，可以将元素`arr[0]`放入排序后的正确位置，并且返回这个位置`index`。利用 partition 的特点，算法流程如下：

-   如果`index = k`，说明第 k 个元素已经放入正确位置，返回前 k 个元素
-   如果`k < index`，前 k 个元素在`[left, index - 1]`之间，缩小查找范围，继续查找
-   如果`index < k`，前 k 个元素在`[index + 1, right]` 之间，缩小查找范围，继续查找

为了方便理解，可以使用`2, 8, 1, 1, 0, 11, -1, 0`这个例子在纸上画一下过程。

代码实现如下：

```javascript
/**
 *
 * @param {number[]} arr
 * @param {number} start
 * @param {number} end
 * @return {number}
 */
function partition(arr, start, end) {
    const k = arr[start];
    let left = start + 1,
        right = end;
    while (1) {
        while (left <= end && arr[left] <= k) ++left;
        while (right >= start + 1 && arr[right] >= k) --right;

        if (left >= right) {
            break;
        }

        [arr[left], arr[right]] = [arr[right], arr[left]];
        ++left;
        --right;
    }
    [arr[right], arr[start]] = [arr[start], arr[right]];
    return right;
}

/**
 * @param {number[]} arr
 * @param {number} k
 * @return {number[]}
 */
var getLeastNumbers = function(arr, k) {
    const length = arr.length;
    if (k >= length) return arr;
    let left = 0,
        right = length - 1;
    let index = partition(arr, left, right);
    while (index !== k) {
        if (index < k) {
            left = index + 1;
            index = partition(arr, left, right);
        } else if (index > k) {
            right = index - 1;
            index = partition(arr, left, right);
        }
    }

    return arr.slice(0, k);
};
```

时间复杂度是`O(N)`，空间复杂度是`O(N)`。

</details>

## 21. 搜索二维矩阵 {#question-488b81cf-45fc-44e2-b839-8d80dce61636}

> 难度：3 · 类型：QA

编写一个高效的算法来判断 `m x n` 矩阵中，是否存在一个目标值。该矩阵具有如下特性：

* 每行中的整数从左到右按升序排列。
* 每行的第一个整数大于前一行的最后一个整数。

**示例 1：**

![](https://pic.rmb.bdstatic.com/bjh/b55182231d6c4c2a26069ba9b80483ad.png)

**输入：** matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3

**输出：** true

**示例 2：**

![](https://pic.rmb.bdstatic.com/bjh/c17493cc0065ece0f4fd02fbea646eee.png)

**输入：** matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13

**输出：** false

**提示：**

* `m == matrix.length`
* `n == matrix[i].length`
* `1 <= m, n <= 100`
* `-104 <= matrix[i][j], target <= 104`

```js
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {

};
```

### 题目要点

**思路**

<details>
<summary>参考答案</summary>

## 方法一：两次二分查找

**思路**

由于每行的第一个元素大于前一行的最后一个元素，且每行元素是升序的，所以每行的第一个元素大于前一行的第一个元素，因此矩阵第一列的元素是升序的。

我们可以对矩阵的第一列的元素二分查找，找到最后一个不大于目标值的元素，然后在该元素所在行中二分查找目标值是否存在。

**代码**

```JavaScript
var searchMatrix = function(matrix, target) {
    const rowIndex = binarySearchFirstColumn(matrix, target);
    if (rowIndex < 0) {
        return false;
    }
    return binarySearchRow(matrix[rowIndex], target);
};

const binarySearchFirstColumn = (matrix, target) => {
    let low = -1, high = matrix.length - 1;
    while (low < high) {
        const mid = Math.floor((high - low + 1) / 2) + low;
        if (matrix[mid][0] <= target) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }
    return low;
}

const binarySearchRow = (row, target) => {
    let low = 0, high = row.length - 1;
    while (low <= high) {
        const mid = Math.floor((high - low) / 2) + low;
        if (row[mid] == target) {
            return true;
        } else if (row[mid] > target) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return false;
}
```

**复杂度分析**

- 时间复杂度：O(log m + log n)=O(log mn)，其中 m 和 n 分别是矩阵的行数和列数。

- 空间复杂度：O(1)。

## 方法二：一次二分查找

**思路**

若将矩阵每一行拼接在上一行的末尾，则会得到一个升序数组，我们可以在该数组上二分找到目标元素。

代码实现时，可以二分升序数组的下标，将其映射到原矩阵的行和列上。

**代码**

```JavaScript
var searchMatrix = function(matrix, target) {
    const m = matrix.length, n = matrix[0].length;
    let low = 0, high = m * n - 1;
    while (low <= high) {
        const mid = Math.floor((high - low) / 2) + low;
        const x = matrix[Math.floor(mid / n)][mid % n];
        if (x < target) {
            low = mid + 1;
        } else if (x > target) {
            high = mid - 1;
        } else {
            return true;
        }
    }
    return false;
};
```

**复杂度分析**

- 时间复杂度：O(log mn)，其中 m 和 n 分别是矩阵的行数和列数。

- 空间复杂度：O(1)。

## 结语

两种方法殊途同归，都利用了二分查找，在二维矩阵上寻找目标值。值得注意的是，若二维数组中的一维数组的元素个数不一，方法二将会失效，而方法一则能正确处理。

</details>

## 22. 删除排序链表中的重复元素 {#question-07bfb2a3-8a44-492e-9dd2-96c8d85b3cb2}

> 难度：1 · 类型：QA

给定一个已排序的链表的头 `head` ， _删除所有重复的元素，使每个元素只出现一次_ 。返回 _已排序的链表_ 。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/01/04/list1.jpg)

**输入：** head = [1,1,2]
**输出：** [1,2]

**示例 2：**

![](https://assets.leetcode.com/uploads/2021/01/04/list2.jpg)

**输入：** head = [1,1,2,3,3]
**输出：** [1,2,3]

**提示：**

* 链表中节点数目在范围 `[0, 300]` 内
* `-100 <= Node.val <= 100`
* 题目数据保证链表已经按升序 **排列**

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function(head) {

};
```

### 题目要点

**思路与算法**

<details>
<summary>参考答案</summary>

**思路与算法**

由于给定的链表是排好序的，因此**重复的元素在链表中出现的位置是连续的**，因此我们只需要对链表进行一次遍历，就可以删除重复的元素。

具体地，我们从指针 cur 指向链表的头节点，随后开始对链表进行遍历。如果当前 cur 与 cur.next 对应的元素相同，那么我们就将 cur.next 从链表中移除；否则说明链表中已经不存在其它与 cur 对应的元素相同的节点，因此可以将 cur 指向 cur.next。

当遍历完整个链表之后，我们返回链表的头节点即可。

**细节**

当我们遍历到链表的最后一个节点时，cur.next 为空节点，如果不加以判断，访问 cur.next 对应的元素会产生运行错误。因此我们只需要遍历到链表的最后一个节点，而不需要遍历完整个链表。

```JavaScript
var deleteDuplicates = function(head) {
    if (!head) {
        return head;
    }

    let cur = head;
    while (cur.next) {
        if (cur.val === cur.next.val) {
            cur.next = cur.next.next;
        } else {
            cur = cur.next;
        }
    }
    return head;
};
```

**复杂度分析**

- 时间复杂度 O(n)，其中 n 是链表的长度。

- 空间复杂度 O(1)。

</details>

## 23. 最大子序和 {#question-1df909e2-185f-453d-ab48-7832c604d551}

> 难度：1 · 类型：QA

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

**子数组** 是数组中的一个连续部分。

**示例 1：**

**输入：** nums = [-2,1,-3,4,-1,2,1,-5,4]
**输出：** 6
**解释：** 连续子数组 [4,-1,2,1] 的和最大，为 6 。

**示例 2：**

**输入：** nums = [1]
**输出：** 1

**示例 3：**

**输入：** nums = [5,4,-1,7,8]
**输出：** 23

**提示：**

* `1 <= nums.length <= 105`
* `-104 <= nums[i] <= 104`

**进阶：**如果你已经实现复杂度为 `O(n)` 的解法，尝试使用更为精妙的 **分治法** 求解。

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {

};
```

### 题目要点

**思路和算法**

<details>
<summary>参考答案</summary>

## 方法一：动态规划

**思路和算法**

假设 `nums` 数组的长度是 `n`，下标从 `0` 到 `n-1`。

我们用 `f(i)` 代表以第 `i` 个数结尾的「连续子数组的最大和」，那么很显然我们要求的答案就是：

![image.png](https://static.ecool.fun//article/9015919d-f6c8-4b2c-aba5-9ee90986b235.png)

因此我们只需要求出每个位置的 `f(i)`，然后返回 `f` 数组中的最大值即可。那么我们如何求 `f(i)` 呢？我们可以考虑 `nums[i]` 单独成为一段还是加入 `f(i-1)` 对应的那一段，这取决于 `nums[i]` 和 `f(i-1) + nums[i]` 的大小，我们希望获得一个比较大的，于是可以写出这样的动态规划转移方程：

![image.png](https://static.ecool.fun//article/98994b34-7f5c-411b-be8f-d5e0b1a2d125.png)

不难给出一个时间复杂度 `O(n)`、空间复杂度 `O(n)` 的实现，即用一个 `f` 数组来保存 `f(i)` 的值，用一个循环求出所有 `f(i)`。考虑到 `f(i)` 只和 `f(i-1)` 相关，于是我们可以只用一个变量 `pre` 来维护对于当前 `f(i)` 的 `f(i-1)` 的值是多少，从而让空间复杂度降低到 `O(1)`，这有点类似「滚动数组」的思想。

**代码**

```JavaScript
var maxSubArray = function(nums) {
    let pre = 0, maxAns = nums[0];
    nums.forEach((x) => {
        pre = Math.max(pre + x, x);
        maxAns = Math.max(maxAns, pre);
    });
    return maxAns;
};
```

**复杂度**

+ 时间复杂度：`O(n)`，其中 `n` 为 `nums` 数组的长度。我们只需要遍历一遍数组即可求得答案。
+ 空间复杂度：`O(1)`。我们只需要常数空间存放若干变量。

#### 方法二：分治

**思路和算法**

**这个分治方法类似于「线段树求解最长公共上升子序列问题」的 `pushUp` 操作。**

我们定义一个操作 `get(a, l, r)` 表示查询 `a` 序列 `[l,r]` 区间内的最大子段和，那么最终我们要求的答案就是 `get(nums, 0, nums.size() - 1)`。如何分治实现这个操作呢？对于一个区间 `[l,r]`，我们取 `m = (l + r)/2`，对区间 `[l,m]` 和 `[m+1,r]` 分治求解。当递归逐层深入直到区间长度缩小为 `1` 的时候，递归「开始回升」。这个时候我们考虑如何通过 `[l,m]` 区间的信息和 `[m+1,r]` 区间的信息合并成区间 `[l,r]` 的信息。最关键的两个问题是：

+ 我们要维护区间的哪些信息呢？
+ 我们如何合并这些信息呢？

对于一个区间 `[l,r]`，我们可以维护四个量：

+ `lSum` 表示 `[l,r]` 内以 `l` 为左端点的最大子段和
+ `rSum` 表示 `[l,r]` 内以 `r` 为右端点的最大子段和
+ `mSum` 表示 `[l,r]` 内的最大子段和
+ `iSum` 表示 `[l,r]` 的区间和

以下简称 `[l,m]` 为 `[l,r]` 的「左子区间」，`[m+1,r]` 为 `[l,r]` 的「右子区间」。我们考虑如何维护这些量呢（如何通过左右子区间的信息合并得到 `[l,r]` 的信息）？对于长度为 `1` 的区间 `[i, i]`，四个量的值都和 `nums}[i]` 相等。对于长度大于 `1` 的区间：

+ 首先最好维护的是 `iSum`，区间 `[l,r]` 的 `iSum` 就等于「左子区间」的 `iSum` 加上「右子区间」的 `iSum`。
+ 对于 `[l,r]` 的 `lSum`，存在两种可能，它要么等于「左子区间」的 `lSum`，要么等于「左子区间」的 `iSum` 加上「右子区间」的 `lSum`，二者取大。
+ 对于 `[l,r]` 的 `rSum`，同理，它要么等于「右子区间」的 `rSum`，要么等于「右子区间」的 `iSum` 加上「左子区间」的 `rSum`，二者取大。
+ 当计算好上面的三个量之后，就很好计算 `[l,r]` 的 `mSum` 了。我们可以考虑 `[l,r]` 的 `mSum` 对应的区间是否跨越 `m`——它可能不跨越 `m`，也就是说 `[l,r]` 的 `mSum` 可能是「左子区间」的 `mSum` 和 「右子区间」的 `mSum` 中的一个；它也可能跨越 `m`，可能是「左子区间」的 `rSum` 和 「右子区间」的 `lSum` 求和。三者取大。

这样问题就得到了解决。

**代码**

```js
function Status(l, r, m, i) {
    this.lSum = l;
    this.rSum = r;
    this.mSum = m;
    this.iSum = i;
}

const pushUp = (l, r) => {
    const iSum = l.iSum + r.iSum;
    const lSum = Math.max(l.lSum, l.iSum + r.lSum);
    const rSum = Math.max(r.rSum, r.iSum + l.rSum);
    const mSum = Math.max(Math.max(l.mSum, r.mSum), l.rSum + r.lSum);
    return new Status(lSum, rSum, mSum, iSum);
}

const getInfo = (a, l, r) => {
    if (l === r) {
        return new Status(a[l], a[l], a[l], a[l]);
    }
    const m = (l + r) >> 1;
    const lSub = getInfo(a, l, m);
    const rSub = getInfo(a, m + 1, r);
    return pushUp(lSub, rSub);
}

var maxSubArray = function(nums) {
    return getInfo(nums, 0, nums.length - 1).mSum;
};
```

**复杂度分析**

假设序列 `a` 的长度为 `n`。

+ 时间复杂度：假设我们把递归的过程看作是一颗二叉树的先序遍历，那么这颗二叉树的深度的渐进上界为 `O(log n)`，这里的总时间相当于遍历这颗二叉树的所有节点，故总时间的渐进上界是 `O(\sum_{i=1}^{\log n} 2^{i-1})=O(n)`，故渐进时间复杂度为 `O(n)`。
+ 空间复杂度：递归会使用 `O(log n)` 的栈空间，故渐进空间复杂度为 `O(log n)`。

## 题外话

「方法二」相较于「方法一」来说，时间复杂度相同，但是因为使用了递归，并且维护了四个信息的结构体，运行的时间略长，空间复杂度也不如方法一优秀，而且难以理解。那么这种方法存在的意义是什么呢？

对于这道题而言，确实是如此的。但是仔细观察「方法二」，它不仅可以解决区间 `[0, n-1]`，还可以用于解决任意的子区间 `[l,r]` 的问题。如果我们把 `[0, n-1]` 分治下去出现的所有子区间的信息都用堆式存储的方式记忆化下来，即建成一颗真正的树之后，我们就可以在 `O(log n)` 的时间内求到任意区间内的答案，我们甚至可以修改序列中的值，做一些简单的维护，之后仍然可以在 `O(log n)` 的时间内求到任意区间内的答案，对于大规模查询的情况下，这种方法的优势便体现了出来。这棵树就是上文提及的一种神奇的数据结构——线段树。

</details>

## 24. 翻转二叉树 {#question-77ad8b60-34a2-4f8c-8fcf-c86db1a57e3b}

> 难度：1 · 类型：QA

给你一棵二叉树的根节点 `root` ，翻转这棵二叉树，并返回其根节点。

**示例 1：**

![](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

**输入：** root = [4,2,7,1,3,6,9]

**输出：** [4,7,2,9,6,3,1]

**示例 2：**

![](https://assets.leetcode.com/uploads/2021/03/14/invert2-tree.jpg)

**输入：** root = [2,1,3]

**输出：** [2,3,1]

**示例 3：**

**输入：** root = []

**输出：** []

**提示：**

* 树中节点数目范围在 `[0, 100]` 内
* `-100 <= Node.val <= 100`

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {

};
```

### 题目要点

**思路与算法**

<details>
<summary>参考答案</summary>

**思路与算法**

这是一道很经典的二叉树问题。显然，我们从根节点开始，递归地对树进行遍历，并从叶子节点先开始翻转。如果当前遍历到的节点 root 的左右两棵子树都已经翻转，那么我们只需要交换两棵子树的位置，即可完成以 root 为根节点的整棵子树的翻转。

**代码**

```JavaScript
var invertTree = function(root) {
    if (root === null) {
        return null;
    }
    const left = invertTree(root.left);
    const right = invertTree(root.right);
    root.left = right;
    root.right = left;
    return root;
};
```

**复杂度分析**

- 时间复杂度：O(N)，其中 N 为二叉树节点的数目。我们会遍历二叉树中的每一个节点，对每个节点而言，我们在常数时间内交换其两棵子树。

- 空间复杂度：O(N)。使用的空间由递归栈的深度决定，它等于当前节点在二叉树中的高度。在平均情况下，二叉树的高度与节点个数为对数关系，即 O(log N)。而在最坏情况下，树形成链状，空间复杂度为 O(N)。

> 本答案由“前端面试题宝典”收集整理，PC端访问请前往： https://fe.ecool.fun/

</details>

## 25. 时钟指针的夹角 {#question-bab18dbe-9168-4ef5-a1d7-e063a762cf50}

> 难度：3 · 类型：QA

给你两个数 `hour` 和 `minutes` 。请你返回在时钟上，由给定时间的时针和分针组成的较小角的角度（60 单位制）。

**示例 1：**

![image.png](https://pic.rmb.bdstatic.com/bjh/d0120f6dcc249b00a8a6c6cc5df878d0.png)

**输入：** hour = 12, minutes = 30

**输出：** 165

**示例 2：**

![image.png](https://pic.rmb.bdstatic.com/bjh/481eaa09c42b10bc5b16f608063d818c.png)

**输入：** hour = 3, minutes = 30

**输出；** 75

**示例 3：**

![image.png](https://pic.rmb.bdstatic.com/bjh/c12b35ca6dc6462b4460a8e7dbfdeae0.png)

**输入：** hour = 3, minutes = 15

**输出：** 7.5

**示例 4：**

**输入：** hour = 4, minutes = 50

**输出：** 155

**示例 5：**

**输入：** hour = 12, minutes = 0

**输出：** 0

**提示：**

* `1 <= hour <= 12`
* `0 <= minutes <= 59`
* 与标准答案误差在 `10^-5` 以内的结果都被视为正确结果。

```js
/**
 * @param {number} hour
 * @param {number} minutes
 * @return {number}
 */
var angleClock = function(hour, minutes) {

};
```

### 题目要点

以12点为界限来计算角度，首先计算时针到12点的角度，就等于整数点数模12（因为12应该取0）加上分钟/60在乘上360/12。比如12:30 就是(0+1/2)360/12=15度。

<details>
<summary>参考答案</summary>

# 解题思路

以12点为界限来计算角度，首先计算时针到12点的角度，就等于整数点数模12（因为12应该取0）加上分钟/60在乘上360/12。比如12:30 就是(0+1/2)360/12=15度。

在计算分钟到12点的角度，就是分钟数360/60。之后求这两个角度差的绝对值就是夹角，如果夹角大于180则再求一次补角返回即可。

# 代码

```js
/**
 * @param {number} hour
 * @param {number} minutes
 * @return {number}
 */
var angleClock = function(hour, minutes) {
    // 每分移动6°
    let oneMinAngle = 6;
    // 每小时移动30°
    let oneHourAngle = 30;
    // 分针移动的角度
    let minutesAngle = oneMinAngle * minutes;
    // 时针移动的角度 并且防止12点 所以 hour % 12
    let hourAngle = (hour % 12 + minutes / 60.0) * oneHourAngle
    // 用时针的角度减去分针的角度，得其绝对值
    let diff = Math.abs(hourAngle - minutesAngle);
    // 返回最小值
    return Math.min(diff, 360 - diff);
}
```

</details>

## 26. 回文子串 {#question-025af56b-5ff8-4da3-9a86-b889693a596f}

> 难度：3 · 类型：QA

给你一个字符串 `s` ，请你统计并返回这个字符串中 **回文子串** 的数目。

**回文字符串** 是正着读和倒过来读一样的字符串。

**子字符串** 是字符串中的由连续字符组成的一个序列。

具有不同开始位置或结束位置的子串，即使是由相同的字符组成，也会被视作不同的子串。

**示例 1：**

**输入：** s = "abc"

**输出：** 3

**解释：** 三个回文子串: "a", "b", "c"

**示例 2：**

**输入：** s = "aaa"

**输出：** 6

**解释：** 6个回文子串: "a", "a", "a", "aa", "aa", "aaa"

**提示：**

* `1 <= s.length <= 1000`
* `s` 由小写英文字母组成

```js
/**
 * @param {string} s
 * @return {number}
 */
var countSubstrings = function(s) {

};
```

### 题目要点

**思路与算法**

<details>
<summary>参考答案</summary>

#### 方法一：中心拓展

**思路与算法**

计算有多少个回文子串的最朴素方法就是枚举出所有的回文子串，而枚举出所有的回文字串又有两种思路，分别是：

+ 枚举出所有的子串，然后再判断这些子串是否是回文；
+ 枚举每一个可能的回文中心，然后用两个指针分别向左右两边拓展，当两个指针指向的元素相同的时候就拓展，否则停止拓展。

假设字符串的长度为 n。我们可以看出前者会用 O(n^2) 的时间枚举出所有的子串 s[l(i) ...r(i)]$，然后再用 O(r(i) - l(i) + 1)$ 的时间检测当前的子串是否是回文，整个算法的时间复杂度是 `O(n^3)`。而后者枚举回文中心的是 `O(n)` 的，对于每个回文中心拓展的次数也是 `O(n)` 的，所以时间复杂度是 `O(n^2)`。所以我们选择第二种方法来枚举所有的回文子串。

在实现的时候，我们需要处理一个问题，即如何有序地枚举所有可能的回文中心，我们需要考虑回文长度是奇数和回文长度是偶数的两种情况。如果回文长度是奇数，那么回文中心是一个字符；如果回文长度是偶数，那么中心是两个字符。当然你可以做两次循环来分别枚举奇数长度和偶数长度的回文，但是我们也可以用一个循环搞定。我们不妨写一组出来观察观察，假设 n = 4，我们可以把可能的回文中心列出来：

| 编号 i | 回文中心左起始位置 l(i) | 回文中心右起始位置 r(i) |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 2 | 1 | 1 |
| 3 | 1 | 2 |
| 4 | 2 | 2 |
| 5 | 2 | 3 |
| 6 | 3 | 3 |

由此我们可以看出长度为 n 的字符串会生成 `2n-1` 组回文中心 [l(i), r(i)]，其中 l(i) = Math.floor(i/2)，r(i) = l(i) + (i mod 2)。这样我们只要从 0 到 2n - 2 遍历 i，就可以得到所有可能的回文中心，这样就把奇数长度和偶数长度两种情况统一起来了。

代码如下。

**代码**

```JavaScript
var countSubstrings = function(s) {
    const n = s.length;
    let ans = 0;
    for (let i = 0; i < 2 * n - 1; ++i) {
        let l = i / 2, r = i / 2 + i % 2;
        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {
            --l;
            ++r;
            ++ans;
        }
    }
    return ans;
};
```

**复杂度分析**

+ 时间复杂度：O(n^2)。

+ 空间复杂度：O(1)。

#### 方法二：Manacher 算法

**思路与算法**

Manacher 算法是在线性时间内求解最长回文子串的算法。在本题中，我们要求解回文串的个数，为什么也能使用 Manacher 算法呢？这里我们就需要理解一下 Manacher 的基本原理。

Manacher 算法也会面临「方法一」中的奇数长度和偶数长度的问题，它的处理方式是在所有的相邻字符中间插入 #，比如 abaa 会被处理成 #a#b#a#a#，这样可以保证所有找到的回文串都是奇数长度的，以任意一个字符为回文中心，既可以包含原来的奇数长度的情况，也可以包含原来偶数长度的情况。假设原字符串为 S，经过这个处理之后的字符串为 s。

我们用 f(i) 来表示以 s 的第 i 位为回文中心，可以拓展出的最大回文**半径**，那么 `f(i) - 1` 就是以 i 为中心的最大回文串长度 **（想一想为什么）**。

Manacher 算法依旧需要枚举 s 的每一个位置并先假设它是回文中心，但是它会利用已经计算出来的状态来更新 f(i)，而不是向「中心拓展」一样盲目地拓展。具体地说，假设我们已经计算好了 [1, i - 1] 区间内所有点的 f（即我们知道 [1, i - 1] 这些点作为回文中心时候的最大半径）， 那么我们也就知道了 [1, i - 1] 拓展出的回文达到最大半径时的回文右端点。例如 i = 4 的时候 f(i) = 5，说明以第 4 个元素为回文中心，最大能拓展到的回文半径是 5，此时右端点为 `4 + 5 - 1 = 8`。所以当我们知道一个 i 对应的 f(i) 的时候，我们就可以很容易得到它的右端点为 `i + f(i) - 1`。

Manacher 算法如何通过已经计算出的状态来更新 f(i) 呢？Manacher 算法要求我们维护「当前最大的回文的右端点 r(m)」以及这个回文右端点对应的回文中心 i(m)。我们需要顺序遍历 s，假设当前遍历的下标为 i。**我们知道在求解 f(i) 之前我们应当已经得到了从 [1, i - 1] 所有的 f，并且当前已经有了一个最大回文右端点 r(m) 以及它对应的回文中心 i(m)。**

+ 初始化 f(i)
  + 如果 i <= r(m)，说明 i 被包含在当前最大回文子串内，假设 j 是 i 关于这个最大回文的回文中心 i(m) 的对称位置（即 j + i = 2 * i(m)），我们可以得到 f(i) 至少等于 min{f(j), r(m) - i + 1}。这里将 f(j) 和 r(m) - i + 1 取小，是先要保证这个回文串在当前最大回文串内。**（思考：为什么 f(j) 有可能大于 r(m) - i + 1？）**

  + 如果 i > r(m)，那就先初始化 f(i) = 1。
+ 中心拓展
  + 做完初始化之后，我们可以保证此时的 `s[i + f(i) - 1] = s[i - f(i) + 1]`，要继续拓展这个区间，我们就要继续判断 `s[i + f(i)]` 和 `s[i - f(i)]` 是否相等，如果相等将 `f(i)` 自增；这样循环直到 `s[i + f(i)] ≠ s[i - f(i)]`，以此类推。**我们可以看出循环每次结束时都能保证 `s[i + f(i) - 1] = s[i - f(i) + 1]`，而循环继续（即可拓展的条件）一定是 `s[i + f(i)] = s[i - f(i)]`。** 这个时候我们需要注意的是不能让下标越界，有一个很简单的办法，就是在开头加一个 $，并在结尾加一个 !，这样开头和结尾的两个字符一定不相等，循环就可以在这里终止。

这样我们可以得到 s 所有点为中心的最大回文半径，也就能够得到 S 中所有可能的回文中心的的最大回文半径，把它们累加就可以得到答案。

**代码**

```JavaScript
var countSubstrings = function(s) {
    let n = s.length;
    let t = ['$', '#'];
    for (let i = 0; i < n; ++i) {
        t.push(s.charAt(i));
        t.push('#');
    }
    n = t.length;
    t.push('!');
    t = t.join('');

    const f = new Array(n);
    let iMax = 0, rMax = 0, ans = 0;
    for (let i = 1; i < n; ++i) {
        // 初始化 f[i]
        f[i] = i <= rMax ? Math.min(rMax - i + 1, f[2 * iMax - i]) : 1;
        // 中心拓展
        while (t.charAt(i + f[i]) == t.charAt(i - f[i])) {
            ++f[i];
        }
        // 动态维护 iMax 和 rMax
        if (i + f[i] - 1 > rMax) {
            iMax = i;
            rMax = i + f[i] - 1;
        }
        // 统计答案, 当前贡献为 (f[i] - 1) / 2 上取整
        ans += Math.floor(f[i] / 2);
    }

    return ans;
};
```

**复杂度分析**

+ 时间复杂度：O(n)。即 Manacher 算法的时间复杂度，由于最大回文右端点 r(m) 只会增加而不会减少，故中心拓展进行的次数最多为 O(n)，此外我们只会遍历字符串一次，故总复杂度为 O(n)。

+ 空间复杂度：O(n)。

</details>

## 27. 爱吃香蕉的珂珂 {#question-d2d0e132-7fb3-44c6-9db6-e4e86d76656b}

> 难度：3 · 类型：QA

珂珂喜欢吃香蕉。这里有 `N` 堆香蕉，第 `i` 堆中有 `piles[i]` 根香蕉。警卫已经离开了，将在 `H` 小时后回来。

珂珂可以决定她吃香蕉的速度 `K` （单位：根/小时）。每个小时，她将会选择一堆香蕉，从中吃掉 `K` 根。如果这堆香蕉少于 `K` 根，她将吃掉这堆的所有香蕉，然后这一小时内不会再吃更多的香蕉。

珂珂喜欢慢慢吃，但仍然想在警卫回来前吃掉所有的香蕉。

返回她可以在 `H` 小时内吃掉所有香蕉的最小速度 `K`（`K` 为整数）。

**示例 1：**

**输入:** piles = [3,6,7,11], H = 8

**输出:** 4

**示例 2：**

**输入:** piles = [30,11,23,4,20], H = 5

**输出:** 30

**示例 3：**

**输入:** piles = [30,11,23,4,20], H = 6

**输出:** 23

**提示：**

* `1 <= piles.length <= 10^4`
* `piles.length <= H <= 10^9`
* `1 <= piles[i] <= 10^9`

```js
/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
var minEatingSpeed = function(piles, h) {

};
```

### 题目要点

**思路**

<details>
<summary>参考答案</summary>

#### 方法：二分查找

**思路**

如果珂珂能以 `K` 的进食速度最终吃完所有的香蕉（在 `H` 小时内），那么她也可以用更快的速度吃完。

当珂珂能以 `K` 的进食速度吃完香蕉时，我们令 `possible(K)` 为 `true`，那么就存在 `X` 使得当 `K >= X` 时， `possible(K) = True`。

举个例子，当初始条件为 `piles = [3, 6, 7, 11]` 和 `H = 8` 时，存在 `X = 4` 使得 `possible(1) = possible(2) = possible(3) = False`，且 `possible(4) = possible(5) = ... = True`。

**算法**

我们可以二分查找 `possible(K)` 的值来找到第一个使得 `possible(X)` 为 `True` 的 `X`：这将是我们的答案。我们的循环中，不变量 `possible(hi)` 总为 `True`， `lo` 总小于等于答案。

为了找到 `possible(K)` 的值， (即`珂珂`是否能以 `K` 的进食速度在 `H` 小时内吃完所有的香蕉），我们模拟这一情景。对于每一堆（大小 `p > 0`），我们可以推断出珂珂将在 `Math.ceil(p / K) = ((p-1) // K) + 1` 小时内吃完这一堆，我们将每一堆的完成时间加在一起并与 `H` 进行比较。

```js
/**
 * @param {number[]} piles
 * @param {number} H
 * @return {number}
 */
var minEatingSpeed = function (piles, H) {
    let l = 0,
        r = Math.max(...piles),
        mid = 0,
        res = 0;

    while (l <= r) {
        mid = ((l + r) / 2) << 0;
        if (isPossible(piles, H, mid)) {
            res = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return res;
};

function isPossible(piles, H, K) {
  let time = 0;
  piles.forEach(p => {
    time += Math.ceil(p / K);
  });
  return time <= H;
}
```

**复杂度分析**

* 时间复杂度：O(N log W)，其中 N 是香蕉堆的数量，W 最大的香蕉堆的大小。
* 空间复杂度：O(1)。

</details>

## 28. 爬楼梯 {#question-4fae3374-d530-49b9-b626-c176eb5ee22b}

> 难度：1.5 · 类型：QA

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。

每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶呢？

**示例 1：**

**输入：** n = 2

**输出：** 2

**解释：** 有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶

**示例 2：**

**输入：** n = 3

**输出：** 3

**解释：** 有三种方法可以爬到楼顶。

1. 1 阶 + 1 阶 + 1 阶
2. 1 阶 + 2 阶
3. 2 阶 + 1 阶

**提示：**

* `1 <= n <= 45`

```js
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {

};
```

### 题目要点

我们用 `f(x)` 表示爬到第 x 级台阶的方案数，考虑最后一步可能跨了一级台阶，也可能跨了两级台阶，所以我们可以列出如下式子：

<details>
<summary>参考答案</summary>

## 方法一：动态规划

### 思路和算法

我们用 `f(x)` 表示爬到第 x 级台阶的方案数，考虑最后一步可能跨了一级台阶，也可能跨了两级台阶，所以我们可以列出如下式子：

`f(x)=f(x−1)+f(x−2)`

它意味着爬到第 x 级台阶的方案数是爬到第 `x−1` 级台阶的方案数和爬到第 `x−2` 级台阶的方案数的和。

很好理解，因为每次只能爬 1 级或 2 级，所以 f(x) 只能从 `f(x - 1)` 和 `f(x - 2)` 转移过来，而这里要统计方案总数，我们就需要对这两项的贡献求和。

以上是动态规划的转移方程，下面我们来讨论边界条件。我们是从第 0 级开始爬的，所以从第 0 级爬到第 0 级我们可以看作只有一种方案，即 `f(0) = 1`；从第 0 级到第 1 级也只有一种方案，即爬一级，`f(1) = 1`。这两个作为边界条件就可以继续向后推导出第 n 级的正确结果。我们不妨写几项来验证一下，根据转移方程得到 `f(2) = 2`，`f(3) = 3`，`f(4) = 5`，……，我们把这些情况都枚举出来，发现计算的结果是正确的。

我们不难通过转移方程和边界条件给出一个时间复杂度和空间复杂度都是 `O(n)` 的实现，但是由于这里的 f(x) 只和 `f(x - 1)` 与 `f(x - 2)` 有关，所以我们可以用「滚动数组思想」把空间复杂度优化成 O(1)。下面的代码中给出的就是这种实现。

```js
var climbStairs = function(n) {
    let p = 0, q = 0, r = 1;
    for (let i = 1; i <= n; ++i) {
        p = q;
        q = r;
        r = p + q;
    }
    return r;
};
```

### 复杂度分析

* 时间复杂度：循环执行 n 次，每次花费常数的时间代价，故渐进时间复杂度为 O(n)。
* 空间复杂度：这里只用了常数个变量作为辅助空间，故渐进空间复杂度为 O(1)。

## 方法二：通项公式

### 思路

之前的方法我们已经讨论了 f(n) 是齐次线性递推，根据递推方程 `f(n) = f(n - 1) + f(n - 2)`，我们可以写出这样的特征方程：
`x^2=x+1`

我们得到了这个递推数列的通项公式：

![WX20220320-194804.png](https://static.ecool.fun//article/03dc37f9-0de5-4957-9d3d-bf5014c29c4a.png)

```js
var climbStairs = function(n) {
    const sqrt5 = Math.sqrt(5);
    const fibn = Math.pow((1 + sqrt5) / 2, n + 1) - Math.pow((1 - sqrt5) / 2, n + 1);
    return Math.round(fibn / sqrt5);
};
```

### 复杂度分析

代码中使用的 pow 函数的时空复杂度与 CPU 支持的指令集相关，这里不深入分析。

## 总结

这里形成的数列正好是斐波那契数列，答案要求的 f(n) 即是斐波那契数列的第 n 项（下标从 0 开始）。我们来总结一下斐波那契数列第 n 项的求解方法：

* n 比较小的时候，可以直接使用过递归法求解，不做任何记忆化操作，时间复杂度是 O(2^n)，存在很多冗余计算。
* 一般情况下，我们使用「记忆化搜索」或者「迭代」的方法，实现这个转移方程，时间复杂度和空间复杂度都可以做到 O(n)。
* 为了优化空间复杂度，我们可以不用保存 `f(x - 2)` 之前的项，我们只用三个变量来维护 `f(x)`、`f(x - 1)` 和 `f(x - 2)`，你可以理解成是把「滚动数组思想」应用在了动态规划中，也可以理解成是一种递推，这样把空间复杂度优化到了 O(1)。
* 随着 n 的不断增大 O(n) 可能已经不能满足我们的需要了，我们可以用「矩阵快速幂」的方法把算法加速到 O(logn)。
* 我们也可以把 n 代入斐波那契数列的通项公式计算结果，但是如果我们用浮点数计算来实现，可能会产生精度误差。

</details>

## 29. 背包问题 {#question-d7bda93c-f848-4818-a1b5-31a063ab15f7}

> 难度：3 · 类型：QA

有 N 件物品和一个容量是 V 的背包。每件物品有且只有一件。

第 i 件物品的体积是 v[i] ，价值是 w[i] 。

求解将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。

示例 1：

```
输入: N = 3, V = 4, v = [4,2,3], w = [4,2,3]
输出: 4
解释: 只选第一件物品，可使价值最大。
```

示例 2：

```
输入: N = 3, V = 5, v = [4,2,3], w = [4,2,3]
输出: 5
解释: 不选第一件物品，选择第二件和第三件物品，可使价值最大。
```

### 题目要点

背包问题是经典的动态规划问题，主要分为0-1背包、完全背包和多重背包等。对于这个问题，我们可以使用0-1背包问题的解法。

0-1背包问题是指：给定N种物品和一个容量为V的背包。物品i的重量是v[i]，其价值为w[i]，每种物品都只有一件。求解将哪些物品装入背包可使得这些物品的总重量不超过背包容量，且总价值最大。

### 动态规划解法

1. **定义状态**：`dp[j]` 表示容量为 `j` 的背包能装的最大价值。
2. **状态转移方程**：对于每个物品 `i`，我们有两种选择：
   - 不装物品 `i`，则 `dp[j] = dp[j]`（保持原值，因为没有使用该物品）。
   - 装物品 `i`，则 `dp[j] = max(dp[j], dp[j - v[i]] + w[i])`（如果剩余容量 `j - v[i]` 允许装下物品 `i`，则尝试装下该物品，并更新最大价值）。
3. **初始化**：`dp[0] = 0`（容量为0的背包价值为0），其他 `dp[j]` 初始化为一个较小的值（如 `-Infinity` 或0，但考虑到后续加法操作，一般初始化为0即可）。
4. **遍历顺序**：外层遍历物品（`i` 从 1 到 N），内层遍历背包容量（`j` 从 V 到 v[i]），注意这里 `j` 是从大到小遍历的，这是为了保证每个物品只被考虑一次。

### 代码实现

```javascript
function knapsack(N, V, v, w) {
    // 初始化dp数组
    const dp = new Array(V + 1).fill(0);

    // 遍历每件物品
    for (let i = 1; i <= N; i++) {
        // 逆序遍历背包容量
        for (let j = V; j >= v[i]; j--) {
            // 更新状态
            dp[j] = Math.max(dp[j], dp[j - v[i]] + w[i]);
        }
    }

    // 返回最大价值
    return dp[V];
}

// 示例
console.log(knapsack(3, 4, [4, 2, 3], [4, 2, 3])); // 输出: 4
console.log(knapsack(3, 5, [4, 2, 3], [4, 2, 3])); // 输出: 5
```

这段代码首先定义了一个动态规划数组 `dp`，然后通过两层循环（外层遍历物品，内层逆序遍历背包容量）来更新 `dp` 数组的值，最后返回 `dp[V]`，即背包容量为 `V` 时的最大价值。

<details>
<summary>参考答案</summary>

这是最为基础的背包问题，每种物品只有一件，可以选择取或者不取。

问题描述可以归结为：将N种物品有选择地放入容量为V的背包中，要求背包中的物品价值最大。

尝试提炼其子问题：将i种物品有选择地放入容量为V的背包中，要求背包中的物品价值最大。

那么由子问题转移到父问题的方程为：

```
f(i,V) = max{f(i-1,V), f(i-1,V-v[i]) + w[i]}
```

解释如下：“将前i件物品放入容量为V的背包中”这个子问题，若只考虑第i件物品的策略（放或者不放），那么就可以转化为一个只关系到前i-1件物品的问题。

* 如果不放第i件物品，那么问题就转化为“前i-1件物品放入容量为v的背包中”；
* 如果放第i件物品，那么问题就转化为“前i-1件物品放入剩下的容量为V-v[i]的背包中”，此时能获得的最大价值就是f(i-1, V-v[i])再加上通过放入第i件物品获得的价值w[i]。

时间复杂度已经无法优化，我们可以尝试优化空间复杂度。

观察状态转移方程，发现当前状态i只和前一个状态有关i-1，那么我们可以用滚动数组，逆序遍历的方式进行空间优化。

```js]
 function knapsack(weights, values, W){
    var n = weights.length -1
    var f = [[]]
    for(var j = 0; j <= W; j++){
        if(j < weights[0]){ //如果容量不能放下物品0的重量，那么价值为0
           f[0][j] = 0
        }else{ //否则等于物体0的价值
           f[0][j] = values[0]
        }
    }
    for(var j = 0; j <= W; j++){
        for(var i = 1; i <= n; i++ ){
            if(!f[i]){ //创建新一行
                f[i] = []
            }
            if(j < weights[i]){ //等于之前的最优值
                f[i][j] = f[i-1][j]
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i])
            }
        }
    }
    return f[n][W]
}
var a = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(a)
```

## 合并循环

现在方法里面有两个大循环，它们可以合并成一个。

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    for(var i = 0 ; i < n; i++){
        f[i] = []
    }
   for(var i = 0; i < n; i++ ){
       for(var j = 0; j <= W; j++){
            if(i === 0){ //第一行
                f[i][j] = j < weights[i] ? 0 : values[i]
            }else{
                if(j < weights[i]){ //等于之前的最优值
                    f[i][j] = f[i-1][j]
                }else{
                    f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i])
                }
            }
        }
    }
    return f[n-1][W]
}
```

然后我们再认真地思考一下，为什么要孤零零地专门处理第一行呢？f[i][j] = j < weights[i] ? 0 : values[i]是不是能适用于下面这一行f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]] + values[i]) 。Math.max可以轻松转换为三元表达式，结构极其相似。而看一下i-1的边界问题，有的书与博客为了解决它，会添加第0行，全部都是0，然后i再往下挪。其实我们也可以添加一个${-1}$行。那么在我们的方程中就不用区分${i==0}$与${0>0}$的情况，方程与其他教科书的一模一样了！

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    f[-1] = new Array(W+1).fill(0)
    for(var i = 0 ; i < n ; i++){ //注意边界，没有等号
        f[i] = new Array(W).fill(0)
        for(var j=0; j<=W; j++){//注意边界，有等号
            if( j < weights[i] ){ //注意边界， 没有等号
                f[i][j] = f[i-1][j]
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]]+values[i]);//case 3
            }
        }
    }
    return f[n-1][W]
}
```

## 选择物品

上面讲解了如何求得最大价值，现在我们看到底选择了哪些物品，这个在现实中更有意义。许多书与博客很少提到这一点，就算给出的代码也不对，估计是在设计状态矩阵就出错了。

仔细观察矩阵，从${f(n-1,W)}$逆着走向${f(0,0)}$，设i=n-1,j=W，如果${f(i,j)}$==${f(i-1,j-w_i)+v_i}$说明包里面有第i件物品，因此我们只要当前行不等于上一行的总价值，就能挑出第i件物品，然后j减去该物品的重量，一直找到j = 0就行了。

```js
function knapsack(weights, values, W){
    var n = weights.length;
    var f = new Array(n)
    f[-1] = new Array(W+1).fill(0)
    var selected = [];
    for(var i = 0 ; i < n ; i++){ //注意边界，没有等号
        f[i] = [] //创建当前的二维数组
        for(var j=0; j<=W; j++){ //注意边界，有等号
            if( j < weights[i] ){ //注意边界， 没有等号
                f[i][j] = f[i-1][j]//case 1
            }else{
                f[i][j] = Math.max(f[i-1][j], f[i-1][j-weights[i]]+values[i]);//case 2
            }
        }
    }
    var j = W, w = 0
    for(var i=n-1; i>=0; i--){
         if(f[i][j] > f[i-1][j]){
             selected.push(i)
             console.log("物品",i,"其重量为", weights[i],"其价格为", values[i])
             j = j - weights[i];
             w +=  weights[i]
         }
     }
    console.log("背包最大承重为",W," 现在重量为", w, " 总价值为", f[n-1][W])
    return [f[n-1][W], selected.reverse() ]
}
var a = knapsack([2,3,4,1],[2,5,3, 2],5)
console.log(a)
var b = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(b)
```

## 使用滚动数组压缩空间

所谓滚动数组，目的在于优化空间，因为目前我们是使用一个${i*j}$的二维数组来储存每一步的最优解。在求解的过程中，我们可以发现，当前状态只与前一行的状态有关，那么更之前存储的状态信息已经无用了，可以舍弃的，我们只需要存储当前状态和前一行状态，所以只需使用${2*j}$的空间，循环滚动使用，就可以达到跟${i*j}$一样的效果。这是一个非常大的空间优化。

```js
function knapsack(weights, values, W){
    var n = weights.length
    var lineA = new Array(W+1).fill(0)
    var lineB = [], lastLine = 0, currLine
    var f = [lineA, lineB]; //case1 在这里使用es6语法预填第一行
    for(var i = 0; i < n; i++){
        currLine = lastLine === 0 ? 1 : 0 //决定当前要覆写滚动数组的哪一行
        for(var j=0; j<=W; j++){
            f[currLine][j] = f[lastLine][j] //case2 等于另一行的同一列的值
            if( j>= weights[i] ){
                var a = f[lastLine][j]
                var b = f[lastLine][j-weights[i]] + values[i]
                f[currLine][j] = Math.max(a, b);//case3
            }

        }
        lastLine = currLine//交换行
   }
   return f[currLine][W];
}

var a = knapsack([2,3,4,1],[2,5,3, 2],5)
console.log(a)
var b = knapsack([2,2,6,5,4],[6,3,5,4,6],10)
console.log(b)
```

注意，这种解法由于丢弃了之前N行的数据，因此很难解出挑选的物品，只能求最大价值。

## 递归法解01背包

```js
function knapsack(n, W, weights, values, selected) {
    if (n == 0 || W == 0) {
        //当物品数量为0，或者背包容量为0时，最优解为0
        return 0;
    } else {
        //从当前所剩物品的最后一个物品开始向前，逐个判断是否要添加到背包中
        for (var i = n - 1; i >= 0; i--) {
            //如果当前要判断的物品重量大于背包当前所剩的容量，那么就不选择这个物品
            //在这种情况的最优解为f(n-1,C)
            if (weights[i] > W) {
                return knapsack(n - 1, W, weights, values, selected);
            } else {
                var a = knapsack(n - 1, W, weights, values, selected); //不选择物品i的情况下的最优解
                var b = values[i] + knapsack(n - 1, W - weights[i], weights, values, selected); //选择物品i的情况下的最优解
                //返回选择物品i和不选择物品i中最优解大的一个
                if (a > b) {
                    selected[i] = 0; //这种情况下表示物品i未被选取
                    return a;
                } else {
                    selected[i] = 1; //物品i被选取
                    return b;
                }
            }
        }
    }
}
var selected = [], ws = [2,2,6,5,4], vs = [6,3,5,4,6]
var b = knapsack( 5, 10, ws, vs, selected)
console.log(b) //15
selected.forEach(function(el,i){
    if(el){
        console.log("选择了物品"+i+ " 其重量为"+ ws[i]+" 其价值为"+vs[i])
    }
})
```

</details>

## 30. 全排列 {#question-0b9c52b4-71d9-46b9-ad7e-915c8b784d15}

> 难度：3 · 类型：QA

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 **按任意顺序** 返回答案。

示例 1：

```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

示例 2：

```
输入：nums = [0,1]
输出：[[0,1],[1,0]]
```

示例 3：
```
输入：nums = [1]
输出：[[1]]
```

提示：

* 1 <= nums.length <= 6
* -10 <= nums[i] <= 10
* nums 中的所有整数 互不相同

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {

};
```

### 题目要点

为了解决这个问题，我们可以使用回溯法（backtracking）来生成数组的所有排列。回溯法是一种通过探索所有可能的候选解来找出所有解的算法。如果候选解被确认不是一个解（或者至少不是最后一个解），回溯算法会通过在上一步进行一些变化来撤销上一步或上几步的计算，来获得新的候选解。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const result = [];
    const used = new Array(nums.length).fill(false); // 用于标记某个数字是否已经被使用

    // 递归函数，用于生成排列
    const backtrack = (path) => {
        // 如果路径长度等于数组长度，说明找到了一组排列，加入到结果中
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }

        // 遍历数组中的每个数字
        for (let i = 0; i < nums.length; i++) {
            // 如果该数字已经被使用过，则跳过
            if (used[i]) continue;

            // 标记该数字为已使用
            used[i] = true;

            // 将该数字加入到当前路径中
            path.push(nums[i]);

            // 递归调用，继续寻找下一个数字
            backtrack(path);

            // 回溯，撤销上一步操作
            path.pop();
            used[i] = false;
        }
    };

    // 调用递归函数，从空路径开始
    backtrack([]);

    return result;
};
```

<details>
<summary>参考答案</summary>

## 回溯 + DFS 思想

### 例子解析

先用 (1, 2, 3) 进行举例：

* 以 1 开头的全排列，它们是：[1, 2, 3], [1, 3, 2]，即 1 + [2, 3] 的全排列；
* 以 2 开头的全排列，它们是：[2, 1, 3], [2, 3, 1]，即 2 + [1, 3] 的全排列；
* 以 3 开头的全排列，它们是：[3, 1, 2], [3, 2, 1]，即 3 + [1, 2] 的全排列。

### 思路解析

* 按顺序枚举每一位可能出现的情况，已经选择的数字在 当前 要选择的数字中不能出现（设置一个 visited 数组）。

* 这样的思路，可以用一个树形结构表示。而树上的每一个结点表示了求解全排列问题的不同的阶段，这些阶段通过变量的「不同的值」体现，这些变量的不同的值，称之为「状态」；

* 使用深度优先遍历有「回头」的过程，在「回头」以后， 状态变量需要设置成为和先前一样 ，因此在回到上一层结点的过程中，需要撤销上一次的选择，这个操作称之为「状态重置」；

使用编程的方法得到全排列，就是在这样的一个树形结构中完成 遍历，从树的根结点到叶子结点形成的路径就是其中一个全排列。

### 要注意的地方

* 要注意遍历到相应的结点的时候，状态变量的值是正确的，具体的做法是：往下走一层的时候，path 变量在尾部追加，而往回走的时候，需要撤销上一次的选择，也是在尾部操作，因此 path 变量是一个栈；
* 深度优先遍历通过「回溯」操作，实现了全局使用一份状态变量的效果(因此，在每次遍历到叶子结点要将 path 数组拷贝到 result 返回数组，即 new 一个，或 [...push])

### 代码解释

* 首先这棵树除了根结点和叶子结点以外，每一个结点做的事情其实是一样的，即：在已经选择了一些数的前提下，在剩下的还没有选择的数中，依次选择一个数，这显然是一个 递归 结构；
* 递归的终止条件是： 一个排列中的数字已经选够了 ，因此我们需要一个变量来表示当前程序递归到第几层，我们把这个变量叫做 depth。
* 布尔数组 visited，初始化的时候都为 false 表示这些数还没有被选择，当我们选定一个数的时候，就将这个数组的相应位置设置为 true ，这样在进行下一层递归时，就能够以 O(1) 的时间复杂度判断这个数是否被选择过，这是一种「以空间换时间」的思想。
* 这些变量称为「状态变量」，它们表示了在求解一个问题的时候所处的阶段。需要根据问题的场景设计合适的状态变量。

```js
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    let len = nums.length, result = [], visited = new Array(len).fill(false);

    const dfs = (nums, len, depth, path, visited) => {
        // 遍历到叶子结点了，可以返回了
        if(depth === len) {
            result.push([...path]);
        }

        for(let i = 0; i < len; i++) {
            // 如果没遍历过
            if(!visited[i]) {
                // 压入 path 数组，然后是否遍历过的数组此下标处变为 true
                path.push(nums[i]);
                visited[i] = true;
                // 继续 dfs，直到最后一层
                dfs(nums, len, depth + 1, path, visited);
                // 进行回溯，还原，以便下一次使用
                visited[i] = false;
                path.pop();
            }
        }
    }

    dfs(nums, len, 0, [], visited);
    return result;
};
```

</details>

## 31. Z 字形变换 {#question-87bd71f8-a515-4c4d-bf74-fd7dfe9ff68a}

> 难度：3 · 类型：QA

将一个给定字符串 `s` 根据给定的行数 `numRows` ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"PAYPALISHIRING"` 行数为 3 时，排列如下：

```
P   A   H   N
A P L S I I G
Y   I   R
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"PAHNAPLSIIGYIR"`。

请你实现这个将字符串进行指定行数变换的函数：

string convert(string s, int numRows);

## 示例 1：

```
输入：s = "PAYPALISHIRING", numRows = 3
输出："PAHNAPLSIIGYIR"
```

## 示例 2：

```
输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"
解释：
P     I    N
A   L S  I G
Y A   H R
P     I
```

## 示例 3：

```
输入：s = "A", numRows = 1
输出："A"
```

## 提示：

* 1 <= s.length <= 1000
* `s` 由英文字母（小写和大写）、',' 和 '.' 组成
* 1 <= numRows <= 1000

### 题目要点

通过从左向右迭代字符串，我们可以轻松地确定字符位于 Z 字形图案中的哪一行。

<details>
<summary>参考答案</summary>

## 方法一：按行排序

### 思路

通过从左向右迭代字符串，我们可以轻松地确定字符位于 Z 字形图案中的哪一行。

### 算法

我们可以使用 `min(numRows,len(s))` 个列表来表示 Z 字形图案中的非空行。

从左到右迭代 s，将每个字符添加到合适的行。可以使用当前行和当前方向这两个变量对合适的行进行跟踪。

只有当我们向上移动到最上面的行或向下移动到最下面的行时，当前方向才会发生改变。

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
     // 行数为1直接返回
    if (numRows === 1) return s;
    let res = '';
    // 遍历行数
    for (let i = 0; i < numRows; i++) {
        let next, // 下一个字符
            dire = i === numRows - 1 ? false : true, // 添加的方向
            nextIndex = i;
        // 添加当前行下一个直达不存在
        while (next = s[nextIndex]) {
            res += next;
            nextIndex = nextIndex + 2 * (dire ? numRows - i : i + 1) - 2;
            if (i !== 0 && i !== numRows - 1) {
                dire = !dire
            }
        }
    }
    return res;
};
```

### 复杂度分析

* 时间复杂度：O(n)，其中 n == len(s)
* 空间复杂度：O(n)

## 方法二：按行访问

### 思路

按照与逐行读取 Z 字形图案相同的顺序访问字符串。

### 算法

首先访问 `行0` 中的所有字符，接着访问 `行1`，然后 `行2`，依此类推...

对于所有整数 k，

* `行0` 中的字符位于索引 `k(2⋅numRows−2)` 处;
* `行numRows−1` 中的字符位于索引 `k(2⋅numRows−2)+numRows−1` 处;
* 内部的 `行 i` 中的字符位于索引 `k(2⋅numRows−2)+i` 以及 `(k+1)(2⋅numRows−2)−i` 处;

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
    if(numRows===1) return s;
    let row = [],// 存储对应行的字符
        cur = numRows-2, // 代表当前行数（0 <= cur <= numRows-1）
        curDire = true; // 方向
    for (let i = 0; i < s.length; i++) {
        if (i < numRows) {
            // 每一行的首位元素
            row[i] = s[i];
        }else{
            // 达到拐角的元素，变更方向
             if(cur===(numRows-1) || cur===0){
                curDire = !curDire;
            }
            // 添加行数到对应行
            row[cur] += s[i]
            // 行数变化
            if(curDire){
                cur--;
            }else{
                cur++;
            }

        }
    }
    // 合并每一行的字符串
    let res = row.reduce((pre,cur)=>pre+cur,'')
    return res;
};
```

</details>

## 32. 最长回文子串 {#question-b1d982b1-a2fc-44b7-9124-7f47ba2a4707}

> 难度：3 · 类型：QA

给你一个字符串 s，找到 s 中最长的回文子串。

* 示例 1：

```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```

* 示例 2：

```
输入：s = "cbbd"
输出："bb"
```

* 示例 3：

```
输入：s = "a"
输出："a"
```

* 示例 4：

```
输入：s = "ac"
输出："a"
```

* 提示：

```
1 <= s.length <= 1000
s 仅由数字和英文字母（大写和/或小写）组成
```

### 题目要点

暴力解法虽然时间复杂度高，但是思路清晰、编写简单，因为编写的正确性高，完全可以使用暴力匹配算法检验我们编写的算法的正确性。

<details>
<summary>参考答案</summary>

# 暴力枚举法

## 思路

暴力解法虽然时间复杂度高，但是思路清晰、编写简单，因为编写的正确性高，完全可以使用暴力匹配算法检验我们编写的算法的正确性。

## 代码

```js
var longestPalindrome_bf = function(s) {
  if (!s) return '';
  var longest = s[0], str, i, j, len;
  var isPalindrom = function (left, right) {
    while (left < right && s[left] === s[right]) {
      left++;
      right--;
    }
    return left >= right;
  }
  for (len = 2; len <= s.length; len++) {
    for (i = 0; i < s.length; i++) {
      j = i + len - 1;
      if (isPalindrom(i, j)) {
        str = s.slice(i, j + 1);
        if (longest.length < str.length) longest = str;
      }
    }
  }
  return longest;
}
```

## 复杂度

* 时间复杂度O(n^3)
* 空间复杂度O(1)

# 中心扩散法

## 思路

暴力法时间复杂度比较高，除此之外，还容易想到的是枚举可能出现的回文子串的“中心位置”，从“中心位置”尝试尽可能扩散出去，得到一个回文串。

遍历原字符串，每个字符或每两个字符中间，都可能被当成回文子串的中心，利用回文串的中心对称的特点，尽量往两边扩散，获取最大的“扩散面积”

因此，中心扩散法的思路是：遍历每一个索引，以这个索引为中心，利用“回文串”中心对称的特点，往两边扩散，看最多能扩散多远。

枚举“中心位置”时间复杂度为 O(n) ，从“中心位置”扩散得到“回文子串”的时间复杂度为 O(n) ，因此时间复杂度可以降到 O(n^2)。

在这里要注意一个细节：回文串在长度为奇数和偶数的时候，“回文中心”的形式是不一样的。

* 奇数回文串的“中心”是一个具体的字符，例如：回文串 "aba" 的中心是字符 "a"；
* 偶数回文串的“中心”是位于中间的两个字符的“空隙”，例如：回文串串 "abba" 的中心是两个 "b" 中间的那个“空隙”。

## 代码

```js
/**
* @param {string} s
* @return {string}
*/
var longestPalindrome = function (s) {
    if (!s) return ''
    if (s.length === 1) return s;
    if (s.length === 2) return s[0] === s[1] ? s : s[1];
    let maxStr = '',
        len = s.length;
    for (let i = 0; i < len; i++) {
        let even = '', // 定义偶数中心回文
            odd = ''; // 定义奇数中心回文
        if (s[i] === s[i + 1]) { // 若是偶数中心回文
            let evenIndex = center(s, i - 1, i + 2); // 比较中心的前一项和后一项
            even = s.slice(evenIndex.left, evenIndex.right)
        }
        let oddIndex = center(s, i - 1, i + 1); // 奇数中心回文
        odd = s.slice(oddIndex.left, oddIndex.right);
        let longer = even.length > odd.length ? even : odd; // 比较奇、偶
        maxStr = maxStr.length > longer.length ? maxStr : longer
    }
    return maxStr
}
// 中心扩展
function center(s, left, right) {
    let len = s.length;
    while (left >= 0 && right < len && s[left] === s[right]) {
        left--;
        right++;
    }
    return { left: left + 1, right: right }
}
```

# 动态规划

DP可能是解这个问题的一个好方法，然而算法复杂度依然是 O(N^2) 的，而且空间复杂度也是 O(N^2)。

我们假设用 P[i][j] 来表示 s[i..j] 是否是一个回文子串。

它的计算公式长这样：

> P[i][j] = s[i] === s[j] && P[i + 1][j - 1] ? true : false;

```js
var longestPalindrome_dp = function(s) {
  var i, j, len;
  // isPalindrom[i][j] represent s[i..j] is a parlindrom string or not.
  var isPalindrom = new Array(s.length);
  for (i = 0; i < s.length; i++) {
    isPalindrom[i] = new Array(s.length).fill(false);
  }
  var maxLen = 1, longestBegin = 0;
  // initialize
  for (i = 0; i < s.length; i++) {
    isPalindrom[i][i] = true;
    if (i < s.length - 1 && s[i] === s[i + 1]) {
      isPalindrom[i][i + 1] = true;
      maxLen = 2;
      longestBegin = i;
    }
  }
  // compute
  for (len = 3; len <= s.length; len++) {
    for (i = 0; i < s.length; i++) {
      j = len + i - 1;
      if (s[i] === s[j] && isPalindrom[i + 1][j - 1]) {
        isPalindrom[i][j] = true;
        maxLen = len;
        longestBegin = i;
      }
    }
  }
  return s.slice(longestBegin, longestBegin + maxLen);
}

```

# 动态规划 2

## 思路

DP 的空间复杂度是 O(N^2) 的，主要用来保存二维数组 P[i][j]，而且只用了一半。

我们可以把空间复杂度降到 O(1)，只存找到的最长回文串即可。枚举轴心位置，并进行扩展。如果是回文，则轴心两边的字符应该对称相等。

需要考虑到长度奇偶情况的不同，如果是奇数长度，轴心就是一个字符；如果是偶数长度，轴心则不在字符串中

## 实现

```js
var longestPalindrome_enum = function(s) {
  if (!s) return '';
  var longest = s[0];
  var expandAroundCenter = function (left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return s.slice(left + 1, right);
  }
  for (var i = 0; i < s.length; i++) {
    // 奇数
    var odd = expandAroundCenter(i, i);
    if (odd.length > longest.length) longest = odd;
    // 偶数
    var even = expandAroundCenter(i, i + 1);
    if (longest.length < even.length) longest = even;
  }
  return longest;
}

```

# Manacher 算法

相比降低空间复杂度，降低时间复杂度要难得多。这里有一个 O(N) 时间复杂度的算法，叫做 Manacher 算法。

能够从 O(N^2) 降到 O(N)，这个算法很巧妙。它首先解决了长度奇偶不同的问题。

通过向字符串中加入一些特殊字符来使长度均为奇数。特殊字符即为原字符串的字符集中没有的字符。如 'aba' 中插入 '#'，变成'#a#b#a#'。

然后提出了一个回文半径（P）的概念：

```
T = # a # b # a # a # b # a #
P = 0 1 0 3 0 1 6 1 0 3 0 1 0
```

它代表了以该字符为轴心的回文串对折后的长度。由于插入了特殊字符，如果最长回文字符串的长度为偶数，则轴心会出现在 '#' 上。

容易看出上面的例子中，最大回文子串的轴心就是 P 为 6 的字符。最大回文子串为 'abaaba' ，长度刚好为 6.

这显然不是巧合，接下来就是要计算 P，记下其最大值及对应下标，即可。目标时间复杂度 O(N)。当然，这个算法最难的部分，就是计算 P。

正常计算 P 的话，时间复杂度依然是 O(N^2)，但是如果利用回文串的对称特性，减少搜索，就可以将复杂度降至 O(N)。

计算 P 就是以每一个字符为轴心计算回文半径，也就是从每一个字符开始向两边搜索，那么右边必然会搜索到尚未遍历到的字符，如果我们记下最大能搜索到的右边界 R
。在后面的遍历搜索中，如果当前 T[i] 在边界内，即比最大右边界小，那么也就是在一个已搜索的回文子串中，假设 i' 是 i 对应当前最大 R 的轴心 C 的对称位置（即 T[i] == T[i']）， 可以做出下面的结论：

```
if P[i'] < R-i
then P[i] = P[i']
else P[i] >= P[i'] （需要进一步扩展搜索得出）
```

另一种情况，如果当前字符 T[i] 不在边界内，即我们不能得出任何结论，所以 P[i] = 0。

## 代码

```js
var longestPalindrome_manacher = function(s) {
  s = '^#' + s.split('').join('#') + '#$';
  var radius = new Array(s.length).fill(0);
  var C = 0, centerIndex = 0, maxRight = 0, maxLen = 0;

  for (var i = 1; i < s.length - 1; i++) {
    // 计算初始回文半径, i' = 2 * C - i
    radius[i] = (maxRight > i) ? Math.min(maxRight - i, radius[2 * C - i]) : 0;
    // 扩展半径
    while (s[i + 1 + radius[i]] && s[i - 1 - radius[i]] && s[i + 1 + radius[i]] === s[i - 1 - radius[i]]) radius[i]++;
    // 更新当前搜索的最大右边界和位置
    if (i + radius[i] > maxRight) {
      C = i;
      maxRight = i + radius[i];
    }
    // 更新最大回文串长度及位置
    if (maxLen < radius[i]) {
      maxLen = radius[i];
      centerIndex = i;
    }
  }

  return s.slice((centerIndex - maxLen), (centerIndex + maxLen + 1)).split('#').join('');
};

```

</details>

## 33. 寻找两个正序数组的中位数 {#question-bde6a595-899a-453a-85c4-0b774b75fb9e}

> 难度：4 · 类型：QA

给定两个大小分别为 `m` 和 `n` 的正序（从小到大）数组 `nums1` 和 `nums2`。请你找出并返回这两个正序数组的**中位数**。

* 示例 1：

```
输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3] ，中位数 2
```

* 示例 2：

```
输入：nums1 = [1,2], nums2 = [3,4]
输出：2.50000
解释：合并数组 = [1,2,3,4] ，中位数 (2 + 3) / 2 = 2.5
```

* 示例 3：

```
输入：nums1 = [0,0], nums2 = [0,0]
输出：0.00000
```

* 示例 4：

```
输入：nums1 = [], nums2 = [1]
输出：1.00000
```

* 示例 5：

```
输入：nums1 = [2], nums2 = []
输出：2.00000
```
 
* 提示：

```
nums1.length == m
nums2.length == n
0 <= m <= 1000
0 <= n <= 1000
1 <= m + n <= 2000
-106 <= nums1[i], nums2[i] <= 106
```

### 题目要点

合并两个代码后从小到大排序，数组总数是奇数取nums[n/2]，是偶数则取(nums[n/2] + nums[n/2-1]) / 2

<details>
<summary>参考答案</summary>

# 暴力解法

## 思路

合并两个代码后从小到大排序，数组总数是奇数取nums[n/2]，是偶数则取(nums[n/2] + nums[n/2-1]) / 2

## 代码

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    let n = nums1.length + nums2.length;
    let nums = nums1.concat(nums2).sort((a, b) => a - b);

    let result = n % 2 == 0
        ? (nums[n/2] + nums[n/2-1]) / 2
        : nums[Math.floor(n/2)];

    return result;
};
```

## 复杂度

* 时间复杂度 O(NlogN)，N为两数组的长度和
* 空间复杂度 O(N)

# 双指针法

## 思路

因为两个数组有序，求中位数不需要把两个数组合并

当合并后的数组总长度len为奇数时，只要知道索引为len/2位置上的数就行了，如果数偶数，只要知道索引为len/2 - 1和len/2上的数就行，所以不管是奇数还是偶数只要遍历len/2次即可，用两个值来存遍历过程中len/2-1和len/2上的数即可

两个指针point1和point2分别指向nums1和nums2，当nums1[point1] < nums2[point2]，则point1指针移动，否则point2指针移动

## 代码

```js
/**
 *
 *
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    let n1 = nums1.length;
    let n2 = nums2.length;

    // 两个数组总长度
    let len = n1 + n2;

    // 保存当前移动的指针的值(在nums1或nums2移动)，和上一个值
    let preValue = -1;
    let curValue = -1;

    //  两个指针分别在nums1和nums2上移动
    let point1 = 0;
    let point2 = 0;

    // 需要遍历len/2次，当len是奇数时，最后取curValue的值，是偶数时，最后取(preValue + curValue)/2的值
    for (let i = 0; i <= Math.floor(len/2); i++) {
        preValue = curValue;
        // 需要在nums1上移动point1指针
        if (point1 < n1 && (point2 >= n2 || nums1[point1] < nums2[point2])) {
            curValue = nums1[point1];
            point1++;
        } else {
            curValue = nums2[point2];
            point2++;
        }
    }

    return len % 2 === 0
        ? (preValue + curValue) / 2
        : curValue
};
```

## 复杂度

* 时间复杂度O(n+m)，n为nums1的长度，m为nums2的长度
* 空间复杂度O(1)

# 二分查找

## 思路

### 对于中位数的简单分析

如果两个数组长度和为奇数，那么最终这个中位数是由一位数确定的。

如果两个数组长度和为偶数，那么最终这个中位数是由两位数取平均值确定的。

### 对两个数组的简单分析：

两个数组应该有一个长一点，另一个点一点(等长也不影响)。

中位数可能让两个数组都分成两部分：一部分小于中位数，一部分大于中位数。但两个部分合起来总数量应该一致。

### 对两数组和中位数位置分析：

我们知道两数组虽然可能等长(不影响)，但正常情况应该是一个长(m)一个短(n)。长短数组分别对应的坐标m1和n1和中位数坐标有什么关系？

无论总和奇数偶数，都满足(m1+n1)=(m+n)/2;因为两个数组都是有序的所以总共小于中位数的占一半。其中m和n是定值。也就是不管你怎么变动，这两个坐标编号总和为定值。

### 如何分析为定值得坐标

既然两个坐标的总和为定值，那么可不可以把其中一个当为自变量，一个看成自变量呢？

比如x+y=5你不好分析但是y=5-x，你分析x同时y就确定了。对吧？

那么选择长的那个作为变量还是短的那个作为变量呢？短的。

为啥？主要因为如果从长的当成变量咱们有些区域无法对应到短的(因为长度即使加上短的所有也到不了一半，处理起来麻烦，但是短的就可以很好避免这种情况。

所以我们就用二分去查找小的这个区间，找到最终的结果，你可能会问：什么样情况能够满足确定这条线的附近就是产生中位数的？

二分进行查找编号的时候，满足左侧都比线右侧小才行。这种情况在二分查找就是一个平衡的结果。

最后找到这个index线了。取值比较你还要有注意的地方：取左侧的时候左侧如果有index为0，取右侧的时候index为最大值。

所以在最后取值的时候，需要考虑左右侧是否有值。同时取长的那个也要比较，因为可能出现等长情况例如：1 2 3 4,和5 6 7 8这种去到临界。需要判断当然在实现过程用三目运算简化！

总结：
* 根据短的进行二分查找位置，先找到线index，说明中位数在附近产生。（奇数偶数在查找因为要除2可以通用表达式）
* 如果总个数奇数，那么就是线左侧最大的那个(两个比较或只有一个)
* 如果总个数偶数，那么就是线左侧最大的那个(两个比较或只有一个)和线右侧最小的那个(两个比较或只有一个)的值取平均，注意是double类型。
* 其他注意点，搞清index从0开始，搞清逻辑上的第几个和数组显示使用的第几个的index的区别。

## 代码
```js
/**
 *
 *
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    // nums1长度比nums2小
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }

    let m = nums1.length;
    let n = nums2.length;
    // 在0～m中查找
    let left = 0;
    let right = m;

    // median1：前一部分的最大值
    // median2：后一部分的最小值
    let median1 = 0;
    let median2 = 0;

    while(left <= right) {
        // 前一部分包含 nums1[0 .. i-1] 和 nums2[0 .. j-1]
        // 后一部分包含 nums1[i .. m-1] 和 nums2[j .. n-1]
        const i = left + Math.floor((right - left) / 2);
        const j = Math.floor((m + n + 1) / 2) - i;

        const maxLeft1 = i === 0 ? -Infinity : nums1[i - 1];
        const minRight1 = i === m ? Infinity : nums1[i];

        const maxLeft2 = j === 0 ? -Infinity : nums2[j - 1];
        const minRight2 = j === n ? Infinity : nums2[j];

        if (maxLeft1 <= minRight2) {
            median1 = Math.max(maxLeft1, maxLeft2);
            median2 = Math.min(minRight1, minRight2);
            left = i + 1;
        } else{
            right = i - 1;
        }
    }
    return (m + n) % 2 == 0 ? (median1 + median2) / 2 : median1;
};
```

## 复杂度

* 时间复杂度O(log(min(m, n)))，n为nums1的长度，m为nums2的长度
* 空间复杂度O(1)

</details>

## 34. 无重复字符的最长子串 {#question-3ae5a790-ccaf-468c-b829-e38dfd572582}

> 难度：3 · 类型：QA

给定一个字符串 **s** ，请你找出其中不含有重复字符的 **最长子串** 的长度。

* 示例 1:

```
输入: s = "abcabcbb"
输出: 3
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

* 示例 2:

```
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
```

* 示例 3:

```
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
```

* 示例 4:

```
输入: s = ""
输出: 0
```

* 提示：
    * 0 <= s.length <= 5 * 104
    * s 由英文字母、数字、符号和空格组成

### 题目要点

我们先用一个例子考虑如何在较优的时间复杂度内通过本题。

<details>
<summary>参考答案</summary>

## 滑动窗口

### 思路和算法

我们先用一个例子考虑如何在较优的时间复杂度内通过本题。

我们不妨以示例一中的字符串 abcabcbb 为例，找出从每一个字符开始的，不包含重复字符的最长子串，那么其中最长的那个字符串即为答案。对于示例一中的字符串，我们列举出这些结果，其中括号中表示选中的字符以及最长的字符串：

* 以 (a)bcabcbb 开始的最长字符串为 (abc)abcbb；
* 以 a(b)cabcbb 开始的最长字符串为 a(bca)bcbb；
* 以 ab(c)abcbb 开始的最长字符串为 ab(cab)cbb；
* 以 abc(a)bcbb 开始的最长字符串为 abc(abc)bb；
* 以 abca(b)cbb 开始的最长字符串为 abca(bc)bb；
* 以 abcab(c)bb 开始的最长字符串为 abcab(cb)b；
* 以 abcabc(b)b 开始的最长字符串为 abcabc(b)b；
* 以 abcabcb(b) 开始的最长字符串为 abcabcb(b)。

发现了什么？如果我们依次递增地枚举子串的起始位置，那么子串的结束位置也是递增的！这里的原因在于，假设我们选择字符串中的第 k 个字符作为起始位置，并且得到了不包含重复字符的最长子串的结束位置为 r(k) ，。那么当我们选择第 k+1 个字符作为起始位置时，首先从 k+1 到 r(k) 的字符显然是不重复的，并且由于少了原本的第 k 个字符，我们可以尝试继续增大 r(k)，直到右侧出现了重复字符为止。

这样一来，我们就可以使用「滑动窗口」来解决这个问题了：

我们使用两个指针表示字符串中的某个子串（或窗口）的左右边界，其中左指针代表着上文中「枚举子串的起始位置」，而右指针即为上文中的 r(k)；

在每一步的操作中，我们会将左指针向右移动一格，表示 我们开始枚举下一个字符作为起始位置，然后我们可以不断地向右移动右指针，但需要保证这两个指针对应的子串中没有重复的字符。在移动结束后，这个子串就对应着 以左指针开始的，不包含重复字符的最长子串。我们记录下这个子串的长度；

在枚举结束后，我们找到的最长的子串的长度即为答案。

```js
var lengthOfLongestSubstring = function(s) {
    // 哈希集合，记录每个字符是否出现过
    const occ = new Set();
    const n = s.length;
    // 右指针，初始值为 -1，相当于我们在字符串的左边界的左侧，还没有开始移动
    let rk = -1, ans = 0;
    for (let i = 0; i < n; ++i) {
        if (i != 0) {
            // 左指针向右移动一格，移除一个字符
            occ.delete(s.charAt(i - 1));
        }
        while (rk + 1 < n && !occ.has(s.charAt(rk + 1))) {
            // 不断地移动右指针
            occ.add(s.charAt(rk + 1));
            ++rk;
        }
        // 第 i 到 rk 个字符是一个极长的无重复字符子串
        ans = Math.max(ans, rk - i + 1);
    }
    return ans;
};
```

### 复杂度分析

时间复杂度：O(N)，其中 N 是字符串的长度。左指针和右指针分别会遍历整个字符串一次。

空间复杂度：O(∣Σ∣)，其中 Σ 表示字符集（即字符串中可以出现的字符），∣Σ∣ 表示字符集的大小。在本题中没有明确说明字符集，因此可以默认为所有 ASCII 码在 [0,128) 内的字符，即 ∣Σ∣=128。我们需要用到哈希集合来存储出现过的字符，而字符最多有 ∣Σ∣ 个，因此空间复杂度为 O(∣Σ∣)。

</details>

## 35. 两数相加 {#question-a4eeac78-8db1-44df-ae79-a5adb65eb55b}

> 难度：3 · 类型：QA

给你两个 **非空** 的链表，表示两个非负的整数。它们每位数字都是按照 **逆序** 的方式存储的，并且每个节点只能存储 **一位** 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

* 示例 1：

![image.png](https://i.loli.net/2021/09/05/68MQqU7exR4YzTr.png)

```
输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807.
```

* 示例 2：

```
输入：l1 = [0], l2 = [0]
输出：[0]
```

* 示例 3：

```
输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
输出：[8,9,9,9,0,0,0,1]
```

* 提示：
    * 每个链表中的节点数在范围 [1, 100] 内
    * 0 <= Node.val <= 9
    * 题目数据保证列表表示的数字不含前导零

```
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
```

### 题目要点

由于输入的两个链表都是**逆序**存储数字的位数的，因此两个链表中同一位置的数字可以直接相加。

<details>
<summary>参考答案</summary>

## 思路与算法

由于输入的两个链表都是**逆序**存储数字的位数的，因此两个链表中同一位置的数字可以直接相加。

我们同时遍历两个链表，逐位计算它们的和，并与当前位置的进位值相加。具体而言，如果当前两个链表处相应位置的数字为 n1,n2，进位值为 carry，则它们的和为 n1+n2+carry；其中，答案链表处相应位置的数字为 (n1+n2+carry) mod 10，而新的进位值为
 (n1+n2+carry) / 10 。

如果两个链表的长度不同，则可以认为长度短的链表的后面有若干个 00 。

此外，如果链表遍历结束后，有 carry > 0，还需要在答案链表的后面附加一个节点，节点的值为 carry。

## 代码

```javascript
var addTwoNumbers = function(l1, l2) {
    let head = null, tail = null;
    let carry = 0;
    while (l1 || l2) {
        const n1 = l1 ? l1.val : 0;
        const n2 = l2 ? l2.val : 0;
        const sum = n1 + n2 + carry;
        if (!head) {
            head = tail = new ListNode(sum % 10);
        } else {
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
        }
        carry = Math.floor(sum / 10);
        if (l1) {
            l1 = l1.next;
        }
        if (l2) {
            l2 = l2.next;
        }
    }
    if (carry > 0) {
        tail.next = new ListNode(carry);
    }
    return head;
};
```

## 复杂度分析

* 时间复杂度：O(max(m,n))，其中 m 和 n 分别为两个链表的长度。我们要遍历两个链表的全部位置，而处理每个位置只需要 O(1) 的时间。

* 空间复杂度：O(1)。注意返回值不计入空间复杂度。

</details>

## 36. 两数之和 {#question-f92a10a6-897f-46ca-992a-d31bcce5e5f1}

> 难度：1.5 · 类型：QA

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出 **和为目标值** `target`  的那 **两个** 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

示例 1：
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

示例 2：

```
输入：nums = [3,2,4], target = 6
输出：[1,2]
```

示例 3：

```
输入：nums = [3,3], target = 6
输出：[0,1]
```
 
提示：

* 2 <= nums.length <= 104
* -109 <= nums[i] <= 109
* -109 <= target <= 109
* 只会存在一个有效答案

### 题目要点

最容易想到的方法是枚举数组中的每一个数 `x`，寻找数组中是否存在 `target - x`。

<details>
<summary>参考答案</summary>

## 暴力解法

### 思路及算法

最容易想到的方法是枚举数组中的每一个数 `x`，寻找数组中是否存在 `target - x`。

当我们使用遍历整个数组的方式寻找 `target - x` 时，需要注意到每一个位于 `x` 之前的元素都已经和 `x` 匹配过，因此不需要再进行匹配。而每一个元素不能被使用两次，所以我们只需要在 `x` 后面的元素中寻找 `target - x`。

```js
var twoSum = function (nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[i] === target) {
        return [i, j];
      }
    }
  }
  return [];
};
```

### 复杂度分析

* 时间复杂度：O(N^2)，其中 N 是数组中的元素数量。最坏情况下数组中任意两个数都要被匹配一次。
* 空间复杂度：O(1)。

## 方法二：哈希表

### 思路及算法

注意到方法一的时间复杂度较高的原因是寻找 `target - x` 的时间复杂度过高。因此，我们需要一种更优秀的方法，能够快速寻找数组中是否存在目标元素。如果存在，我们需要找出它的索引。

使用哈希表，可以将寻找 `target - x` 的时间复杂度降低到从 O(N) 降低到 O(1)。

这样我们创建一个哈希表，对于每一个 `x`，我们首先查询哈希表中是否存在 `target - x`，然后将 `x` 插入到哈希表中，即可保证不会让 `x` 和自己匹配。

```js
var twoSum = function(nums, target) {
    let map = new Map();
    for(let i = 0, len = nums.length; i < len; i++){
        if(map.has(target - nums[i])){
            return [map.get(target - nums[i]), i];
        }else{
            map.set(nums[i], i);
        }
    }
    return [];
};
```

### 复杂度分析

* 时间复杂度：O(N)，其中 N 是数组中的元素数量。对于每一个元素 `x`，我们可以 O(1) 地寻找 `target - x`。
* 空间复杂度：O(N)，其中 N 是数组中的元素数量。主要为哈希表的开销。

</details>

## 37. 反转链表 {#question-e9f01da3-63b7-4098-ab32-89df1dca2ec4}

> 难度：2 · 类型：QA

给你单链表的头节点 `head` ，请你反转链表，并返回反转后的链表。

示例 1：

```
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]
```

示例 2：
```
输入：head = [1,2]
输出：[2,1]
```

示例 3：

```
输入：head = []
输出：[]
```

提示：

* 链表中节点的数目范围是 [0, 5000]
* -5000 <= Node.val <= 5000

```

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {

};

### 题目要点

核心考查：反转链表的基本概念、实现原理与实际应用。

<details>
<summary>参考答案</summary>

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    if (head == null || head.next == null) return head;
    let last = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return last;
};
```

</details>

## 38. 回文链表 {#question-8ee26123-8081-423b-bb77-b45b500facbf}

> 难度：2 · 类型：QA

请判断一个链表是否为回文链表。

示例 1:
```
输入: 1->2
输出: false
```

示例 2:
```
输入: 1->2->2->1
输出: true
```

### 题目要点

利用链表的后续遍历，使用函数调用栈作为后序遍历栈，来判断是否回文

<details>
<summary>参考答案</summary>

## 方案一

利用链表的后续遍历，使用函数调用栈作为后序遍历栈，来判断是否回文
```javascript
var isPalindrome = function(head) {
    let left = head;
    function traverse(right) {
        if (right == null) return true;
        let res = traverse(right.next);
        res = res && (right.val === left.val);
        left = left.next;
        return res;
    }
    return traverse(head);
};
```

## 方案二

通过快、慢指针找链表中点，然后反转链表，比较两个链表两侧是否相等，来判断是否是回文链表

```javascript
var isPalindrome = function(head) {
    // 反转 slower 链表
    let right = reverse(findCenter(head));
    let left = head;
    // 开始比较
    while (right != null) {
        if (left.val !== right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }
    return true;
}
function findCenter(head) {
    let slower = head, faster = head;
    while (faster && faster.next != null) {
        slower = slower.next;
        faster = faster.next.next;
    }
    // 如果 faster 不等于 null，说明是奇数个，slower 再移动一格
    if (faster != null) {
        slower = slower.next;
    }
    return slower;
}
function reverse(head) {
    let prev = null, cur = head, nxt = head;
    while (cur != null) {
        nxt = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

```

</details>
