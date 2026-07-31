+++
title = "模版字符串"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2024-12-17T00:00:00+08:00'
draft = true
weight = 2
tags = ["面试", "前端", "ES6", "JavaScript", "模版字符串", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
未见过的函数用法：

```
function fun(strings,params1){
    console.log(strings);
    console.log(params1)
}

fun`params1 = ${333}`
//  输出分别为
//  ['params1 = ', '']
//  333
```

不知道各位在学习或开发中有没有遇到过这样的函数调用方式呢？秉承着我没遇到的东西就要发文章来分享分享的原则，经过我查阅资料并加以学习，就让本文来带大家了解一下JS中的标签函数吧。

## 模板字符串

标签函数的主要作用就是处理模板字符串，所以在了解标签函数之前先了解一下模板字符串（模板字面量）吧。

### 基本用法

模板字符串是ES6新增的使用模板字面量定义字符串的能力，用反引号```````` 进行分隔。与使用`''`或`""`的定义的字符串字面量不同是模板字面量保留换行字符，可以跨行定义字符串。 例如：

```
let str1 = 'xxhh\n2233'
let str2 = `xxhh
2233`
console.log(str1 === str2) // 结果为true
```

要注意的是模板字符串中的所有字符都会包含在字符串中，特别在使用缩进的时候，缩进的空格都会包含在字符串中。

```
let str = `
    <div>
        <h1>xxhh</h1>
    </div>
`
console.log(str.length)  // 结果为44，包含了缩进所产出的所有空格
```

### 字符串插值

在没有模板字符串时，我们通常会使用`+`加法运算符来进行字符串的拼接，但有了模板字符串后我们并可通过插值占位符`${}`来将各字面量、变量或表达式结果来进行拼接，这样可以更容易地创建复杂和动态的字符串，同时保持代码的可读性和简洁性。这是模板字符串最常用的一个特性。

```
let name = 'xxhh';
let str1 = "name:"+name;
let str2 = `name:${name}`;
console.log(str1,str2) // name:xxhh name:xxhh
console.log(str1 === str2) // true
```

要注意的是使用字符串插值的所有插入的值都会使用`toString()`强制转型为字符串，而且任何JavaScript 表达式都可以用于插值。

## 标签函数

在JS中，标签函数（Tagged Template Functions）是一种特殊类型的函数（带标签的模板），它允许你以一种更灵活、更强大的方式处理字符串模板。当你使用反引号(````````)创建模板字符串时，如果在前面加上一个函数名，那么这个函数就会成为一个标签函数。

### 函数的参数

标签函数的第一个参数包含一个字符串数组，其余的参数与表达式相关。 例如：

```
let name = 'xxhh';
let age = 18;
function tagTemplate(...args){
    console.log(args)
}
tagTemplate`name:${name},age:${age}`
// 输出的三个参数分别为
// ['name:', ',age:', '', raw: Array(3)]
// "xxhh"
// 18
```

从上例可以看出函数的参数中第一个是包含了模板字符串中的除插值外的字符部分（通常用`strings`接收），其余参数为模板字符串中各插值表达式的结果(`values`)。

### 标签函数的作用

使用标签函数可以对所接收的参数执行任何操作，并返回被操作过的字符串。例如我要对一个模板中的时间进行补`0`操作

```
let time = new Date()

function handlerTime(strings,nowDate,nowTime){
    // 处理现在的日期
    let newDate = nowDate.split('/').map(item=>{
        return item.length<2?'0'+item:item
    }).join('/');
    // 处理现在具体的时间
    let newTime = nowTime.split(':').map(item=>{
        return item.length<2?'0'+item:item
    }).join(':')

    // 返回处理后的字符串
    return `${strings[0]}${newDate}${strings[1]}${newTime}${strings[2]}`
}

let now = handlerTime`现在是北京时间：${time.toLocaleDateString()}  ${time.toLocaleTimeString()}`

console.log(now)
```

要注意的是标签不必是普通的标识符，你可以使用包括属性访问、函数调用、`new` 表达式，甚至其他带标签的模板字面量。

```
console.log`xxhh`; // [ 'xxhh' ]

new Function("console.log(arguments)")`Hello`; // [Arguments] { '0': [ 'Hello' ] }

function myTag(strings, ...values) {
  console.log(strings, values);
  return myTag;
}
myTag`xxhh``2233`;
// [ 'xxhh' ] []
// [ '2233' ] []
```

所以标签函数可以用来做很多事情，其中包括但不限于：

-  标签函数可以处理模板字符串中的表达式，允许你对这些表达式的结果进行操作，这意味着你可以在表达式被插入之前对其进行修改或格式化。 
-  库中使用标签函数来创建类型安全的字符串构建器，确保只有特定类型的表达式才能被插入到模板字符串中。 
-  标签函数可用于动态生成代码片段，例如在元编程中，可以用来生成并执行特定的代码模板。 

## 常见考点

1.  **基本语法**：  
  - 使用反引号创建模板字符串。
  - 使用`${}`嵌入变量或表达式。
2.  **多行字符串**：  
  - 模板字符串支持多行，保留空格和缩进。
3.  **字符串插值**：  
  - 在模板字符串中嵌入变量和表达式。
4.  **转义字符**：  
  - 使用反斜杠转义特殊字符。
5.  **嵌套模板**：  
  - 在模板字符串中嵌套其他模板。
6.  **性能考虑**：  
  - 了解模板字符串在处理大量字符串时的性能。
