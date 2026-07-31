+++
title = "export/import"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2025-01-07T00:00:00+08:00'
draft = true
weight = 7
tags = ["面试", "前端", "ES6", "JavaScript", "export/import", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## export，import 是什么

我们知道，JS 模块导入导出，使用 `import` , `export` 这两个关键字

- **export** 用于对外输出本模块
- **import** 用于导入模块

> 也就是说使用 export 导出一个模块之后，其它文件就可以使用 import 导入相应的模块了

下面我们具体看看， import 和 export 到底怎么用？怎么导出模块（比如变量，函数，类，对象等）

### 1 导出单个变量

```js
//a.js 导出一个变量，语法如下
export var site = "www.helloworld.net"

//b.js 中使用import 导入上面的变量
import { site } from "/.a.js" //路径根据你的实际情况填写
console.log(site)	//输出： www.helloworld.net
```

### 2 导出多个变量

上面的例子是导出单个变量，那么如何导出多个变量呢

`````js
 //a.js 中定义两个变量，并导出
 var siteUrl="www.helloworld.net"
 var siteName="helloworld开发者社区"

 //将上面的变量导出
 export { siteUrl ,siteName }

 // b.js 中使用这两个变量
 import { siteUrl , siteName } from "/.a.js" //路径根据你的实际情况填写

 console.log(siteUrl)	//输出： www.helloworld.net
 console.log(siteName)	//输出： helloworld开发者社区

```

### 3 导出函数

导出函数和导出变量一样，需要添加`{ }`

````js
//a.js 中定义并导出一个函数
function sum(a, b) {
    return a + b
}
//将函数sum导出
export { sum }

//b.js 中导入函数并使用
import { sum } from "/.a.js" //路径根据你的实际情况填写
console.log( sum(4,6) ) //输出： 10

```

### 4 导出对象

js中一切皆对象，所以对象一定是可以导出的，并且有两种写法

#### 4.1 第一种写法

使用 `export default` 关键字导出，如下

````js
//a.js 中，定义对象并导出, 注意，使用export default 这两个关键字导出一个对象
export default {
    siteUrl:'www.helloworld.net',
    siteName:'helloworld开发者社区'
}

//b.js 中导入并使用
import obj from './a.js'   	//路径根据你的实际情况填写
console.log(obj.siteUrl)	//输出：www.helloworld.net
console.log(obj.siteName)	//输出：helloworld开发者社区

```

#### 4.2 第二种写法

同样是使用`export default` 关键字，如下

````js
//a.js 中定义对象，并在最后导出
var obj = {
    siteUrl:'www.helloworld.net',
    siteName:'helloworld开发者社区'
}

export default obj	//导出对象obj

//b.js 中导入并使用
import obj from './a.js'   	//路径根据你的实际情况填写
console.log(obj.siteUrl)	//输出：www.helloworld.net
console.log(obj.siteName)	//输出：helloworld开发者社区

```

### 5 导出类

导出类与上面的导出对象类似，同样是用 `export default` 关键字，同样有两种写法

#### 5.1 第一种写法

````js
//a.js 中定义一个类并直接导出
export default class Person {
    //类的属性
    site = "www.helloworld.net"

    //类的方法
    show(){
        console.log(this.site)
    }
}

//b.js 中导入并使用
//导入类
import Person from './a.js'

//创建类的一个对象person
let person = new Person()

//调用类的方法
person.show()  	//输出：www.helloworld.net

```

#### 5.2 第二种写法

````js
//a.js 中定义一个类，最后导出
class Person {
    //类的属性
    site = "www.helloworld.net"

    //类的方法
    show(){
        console.log(this.site)
    }
}

//导出这个类
export default Person

//b.js 中导入并使用
//导入类
import Person from './a.js'

//创建类的一个对象person
let person = new Person()

//调用类的方法
person.show()  	//输出：www.helloworld.net

```

### 小结

下面我们简单总结一下

`export`与`export default`的区别

*   export与export default均可用于导出常量、函数、文件、模块等
*   可以在其它文件或模块中通过import+(常量 | 函数 | 文件 | 模块)名的方式，将其导入，以便能够对其进行使用
*   export default后面不能跟const或let的关键词
*   export、import可以有多个，export default仅有一个。
*   通过export方式导出，在导入时要加 { }，export default则不需要
*   export具名导出xxx ，export default匿名。区别在于导入的时候，export需要一样的名称才能匹配，后者无论取什么名都可以。
*   模块化管理中一个文件就是一个模块，export可以导出多个方法和变量，export default只能导出当前模块，一个js文件中只支持出现一个

对于 `import` ,`export` , `export default` ，他们的用法上面的例子已经很详细的列出了，忘记的时候，可以当作参考看看

最重要的还是要明白为什么要这么写，实在不明白记住就行了。

`````

## 常见考点

### **1. `export` 的基本使用**

`export` 用于导出模块中的内容（如变量、函数、类等），使得其他模块能够导入这些内容。

**考察点**：

- **命名导出（Named Export）**：通过 `export` 导出多个内容，可以选择性地导入它们。
- **默认导出（Default Export）**：通过 `export default` 导出一个单一内容，可以通过自定义的名称导入。

**示例问题**：

- 什么是命名导出？请举个例子。
- 什么是默认导出？请举个例子，并解释两者的区别。

**代码示例**：

```javascript
// 命名导出
export const name = 'John';
export function greet() { return 'Hello!'; }

// 默认导出
export default function() { return 'I am a default exported function'; }
```

---

### **2. `import` 的基本使用**

`import` 用于从其他模块导入内容。可以导入命名导出或默认导出。

**考察点**：

- **导入命名导出**：使用 `{}` 来导入模块中命名的内容。
- **导入默认导出**：直接使用自定义名称导入默认导出的内容。
- **导入整个模块**：使用 `* as` 导入整个模块，通常用于导入包含多个导出的模块。

**示例问题**：

- 如何导入命名导出和默认导出？请举例说明。
- 如何导入一个模块的所有导出？给出一个例子。

**代码示例**：

```javascript
// 导入命名导出
import { name, greet } from './module';

// 导入默认导出
import greetFn from './greetFunction';

// 导入整个模块
import * as utils from './utils';
```

---

### **3. 默认导出与命名导出的区别**

候选人需要理解命名导出与默认导出的主要区别，尤其是在导入时的语法差异。

**考察点**：

- **命名导出**：模块可以有多个命名导出，通过 `{}` 导入，需要完全匹配导出的名字。
- **默认导出**：模块只有一个默认导出，可以导入时自定义名称。

**示例问题**：

- `export` 和 `export default` 有什么区别？哪个场景下使用它们更合适？

**代码示例**：

```javascript
// 文件: person.js
// 命名导出
export const name = 'Alice';
// 默认导出
export default { name: 'Bob' };

// 文件: app.js
import { name } from './person';  // 导入命名导出
import person from './person';     // 导入默认导出
```

---

### **4. 导入和导出时的重命名**

`import` 和 `export` 都允许在导入或导出时进行重命名，以避免命名冲突或为了方便使用。

**考察点**：

- **导出时重命名**：使用 `as` 进行重命名。
- **导入时重命名**：也可以使用 `as` 进行重命名。

**示例问题**：

- 如何导入一个命名导出并重命名？请举个例子。
- 如何在导出时进行重命名？

**代码示例**：

```javascript
// 重命名导出
const age = 30;
export { age as userAge };

// 重命名导入
import { userAge as age } from './person';
```

---

### **5. 动态导入（Dynamic Import）**

ES6 支持动态导入，它允许在运行时按需加载模块，而不是在页面加载时一次性加载所有模块。

**考察点**：

- **基本概念**：理解 `import()` 的语法和用法。
- **异步加载模块**：动态导入会返回一个 `Promise`，因此可以与 `async/await` 结合使用。

**示例问题**：

- 什么是动态导入？请展示如何使用 `import()` 来动态导入一个模块。
- 动态导入与静态导入的主要区别是什么？

**代码示例**：

```javascript
// 动态导入
async function loadModule() {
  const module = await import('./module.js');
  console.log(module);
}
```

---

### **6. 循环依赖问题**

ES6 模块化在处理模块间循环依赖时有其特性，候选人需要理解如何处理和避免循环依赖。

**考察点**：

- **循环依赖的处理**：ES6 模块会在解析时返回一个部分解析的对象，因此可以避免死锁或无限循环的问题。
- **理解导入时的行为**：了解模块在被导入时，未完全解析的部分会被返回，避免出现空对象或错误。

**示例问题**：

- 什么是循环依赖，如何避免在 ES6 模块中出现循环依赖？

---

### **7. 模块的静态分析**

ES6 模块是静态的，这意味着编译时可以确定模块的依赖关系，这对工具（如打包工具）有重要意义。

**考察点**：

- **静态依赖**：模块导入在编译时就已经明确，因此不可以在条件语句中动态地改变导入。
- **编译期的优化**：如何利用这一特点优化构建和打包过程。

**示例问题**：

- ES6 模块和 CommonJS 模块在导入时有什么区别？
- 为什么 ES6 模块是静态的？它对构建工具（如 Webpack）的优化有何意义？

---

### **8. 默认导出与命名导出混用**

可以在同一个模块中同时使用默认导出和命名导出，但两者的使用方式和适用场景需要理解。

**考察点**：

- **同时使用**：如何在一个模块中同时使用默认导出和命名导出，并理解使用场景。
- **导入时的区别**：如何导入默认导出和命名导出的内容。

**示例问题**：

- 一个模块中同时使用默认导出和命名导出时，如何正确导入它们？

**代码示例**：

```javascript
// 模块中同时使用默认导出和命名导出
export const foo = () => {};
export default function() {};

// 导入时
import myFunc, { foo } from './module';
```

---

### **9. 模块的缓存机制**

ES6 模块有缓存机制，即同一个模块在同一运行时只会被加载一次，之后的导入都从缓存中获取模块内容。

**考察点**：

- **模块缓存**：理解模块是如何被缓存的，尤其是在多次导入同一个模块时。
- **如何避免缓存带来的问题**：理解模块缓存的副作用，特别是在需要重新加载模块时。

**示例问题**：

- ES6 模块导入时的缓存机制是怎样的？如何处理缓存问题？

---

### **10. 模块导入和打包工具的集成**

了解 ES6 模块在现代构建工具（如 Webpack、Rollup）中的使用，尤其是如何通过 Tree Shaking 等技术优化最终的打包结果。

**考察点**：

- **Tree Shaking**：如何通过打包工具优化模块，只打包实际使用的模块。
- **模块按需加载**：如何通过 ES6 模块进行懒加载和优化构建过程。

**示例问题**：

- 解释 Tree Shaking 是如何工作的，如何与 ES6 模块配合使用？
