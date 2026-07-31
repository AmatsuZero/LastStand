+++
title = "默认参数"
date = '2024-10-02T00:00:00+08:00'
lastmod = '2024-12-17T00:00:00+08:00'
draft = true
weight = 3
tags = ["面试", "前端", "ES6", "JavaScript", "默认参数", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
一、参数传递

代码语言：javascript

```
function foo(a, b) {
    console.log([a, b]);
}

foo(1, 2); // 输出 [1, 2]
```

这个例子中，a 和 b 属于函数中的局部变量，只能在函数中访问。调用函数时，传递的数据会根据位置来匹配对应，分别赋值给 a 和 b。

创建函数时，function 函数名 后面括号中设定的参数被称为形参；调用函数时，函数名后面括号中传入的参数被称为实参。上面例子中，a 和 b 是形参，传入的 1 和 2 是实参。

因为形参是已声明的变量，所以不能再用 let 和 const 重复声明。

代码语言：javascript

```
function foo(a, b) {
    let a = 1; // 报错，a 已声明
    const b = 1; // 报错，b 已声明
}
```

JavaScript 中所有函数传递都是按值传递的，不会按引用传递。所谓的值，就是指直接保存在变量上的值，如果把对象作为参数传递，那么这个值就是这个对象的引用，而不是对象本身。这里实际上是一个隐式的赋值过程，所以给函数传递参数时，相当于从一个变量赋值到另一个变量。

原始值：

代码语言：javascript

```
function add(num) {
    return num + 1;
}

let count = 5;
let result = add(count); // 此处参数传递的过程可以看作是 num = count

console.log(count); // 5
console.log(result); // 6
```

引用值：

代码语言：javascript

```
function setName(obj) {
    obj.name = "小明";
}

let person = {};

setName(person); // 此处参数传递的过程可以看作是 obj = person;
console.log(person); // {name: "小明"}
```

二、理解参数 JavaScript 中的函数既不会检测参数的类型，也不会检测传入参数的个数。定义函数时设置两个形参，不意味着调用时必须传入两个参数。实际调用时不管是传了一个还是三个，甚至不传参数也不会报错。

所有函数（非箭头）中都有一个名为 arguments 的特殊的类数组对象（不是 Array 的实例），它保存着所有实参的副本，我们可以通过它按照数组的索引访问方式获取所有实参的值，也可以访问它的 arguments.length 属性来确定函数实际调用时传入的参数个数。

例如：

代码语言：javascript

```
function foo(a, b) {
	console.log(arguments[0]);
    console.log(arguments[1]);
    console.log(arguments.length);
}

foo(10, 20); // 依次输出 10、20、2 
```

上面例子中，foo() 函数的第一个参数是 a，第二个参数是b ，可以通过 arguments[x] 的方式来分别获取同样的值 。因此，你甚至可以在声明函数时不设置形参。

代码语言：javascript

```
function foo() {
	console.log(arguments[0]);
    console.log(arguments[1]);
}

foo(10, 20); // 依次输出 10、20 
```

由此可见，JavaScript 函数的形参只是方便使用才写出来的。想传多少个参数都不会产生错误。

还有一个要注意的是，arguments 可以跟形参一起使用，并且 arguments 对象中的值会和对应的形参保持同步。例如：

代码语言：javascript

```
function foo(a) {
	arguments[0] ++;
    console.log(a);
}

foo(10); // 输出 11
//------------------------------------
function foo2(a) {
	a++;
    console.log(arguments[0]);
}

foo2(10); // 输出 11
```

当修改 arguments[0] 或 a 的值时，另一个也被改变了。这并不意味着它们访问同一个内存地址，毕竟我们传入的是一个原始值。它们在内存中还是分开的，只是由于内部的机制使它们的值保持了同步。

另外，如果缺少传参，那这个形参的值就不会和 arguments 对象中的对应值进行同步。例如下面这个例子，只传了一个参数，那么arguments 中只有一个实参值，这时候在函数中把 arguments[1] 设置为某个值，这个值并不会同步给第二个形参，例如：

代码语言：javascript

```
function foo(a,b) {
    arguments[1] = 2;
    console.log(b);
}

foo(1); // 输出 undefined
```

这个例子中，形参 b 没有传入实参，它的值会默认为 undefined。但如果：

代码语言：javascript

```
foo(1, undefined); // 输出 2
```

手动传入 undefined 时， arguments 数组中会出现一个值为 undefined 的元素，依然能和 b 的值进行同步。

严格模式下，arguments 对象中的值和形参不会再同步，当然，如果传入的是引用值，它们依然会互相影响，但这只是引用值的特性而已。因此，在开发中最好不要依赖这种同步机制，也就是说不要同时使用形参和它在arguments 对象中的对应值。

箭头函数中没有 arguments 如果函数是使用箭头语法定义的，那么函数中是没有 arguments 对象的，只能通过定义的形参来访问。

代码语言：javascript

```
let foo = () => {
    console.log(arguments[0]);
}

foo(); // 报错，arguments 未定义
```

在某些情况可能会访问到 arguments ：

代码语言：javascript

```
function fn1(){
    let fn2 = () => {
    	console.log(arguments[0]);
    }
    fn2();
}
fn1(5);
```

但这个 arguments，并不是箭头函数的，而是属于外部普通函数的，当箭头函数中访问 arguments 时，顺着作用域链找到了外部函数的arguments。

三、将对象属性用作实参 当一个函数包含的形参有多个时，调用函数就成了一种麻烦，因为你总是要保证传入的参数放在正确的位置上，有没有办法解决传参顺序的限制呢？

由于对象属性是无序的，通过属性名来确定对应的值。因此可以通过传入对象的方式，以对象中的属性作为真正的实参，这样参数的顺序就无关紧要了。

代码语言：javascript

```
function foo(obj) {
    console.log(obj.name, obj.sex, obj.age);
}

foo({ sex: '男', age: 18, name: '小明' }); // 小明 男 18
```

四、参数默认值 如果调用函数时缺少提供实参，那么形参默认值为 undefined。

有时候我们想要设置特定的默认值，在 ES6 之前还不支持显式地设置默认值的时候，只能采用变通的方式：

代码语言：javascript

```
function sayHi(name) {
    name = name || 'everyone';
	console.log( 'Hello ' + name + '!');
}
sayHi(); // 输出 'Hello everyone!' 
```

通过检查参数值的方式判断有没有赋值，上面的做法虽然简便，但缺点在于如果传入的实参对应布尔值为 false ，实参就不起作用了。需要更精确的话可以用 if 语句或者三元表达式，判断参数是否等于 undefined，如果是则说明这个参数缺失 ：

代码语言：javascript

```
// if 语句判断
function sayHi(name) {
	if (name === undefined) {
		name = 'everyone';
	}
	console.log( 'Hello ' + name + '!');

}
// 三元表达式判断
function sayHi(name) {
	name =  (name !== undefined) ? name : 'everyone';

    console.log( 'Hello ' + name + '!');

}
```

ES6 就方便了许多，因为它支持了显式的设置默认值的方式，就像这样：

代码语言：javascript

```
function sayHi(name = 'everyone') { // 定义函数时，直接给形参赋值
	console.log( 'Hello ' + name + '!');
}

sayHi(); // 输出 'Hello everyone!' 
sayHi('Tony'); // 输出 'Hello Tony!' 
sayHi(undefined); // 输出 'Hello everyone!'
```

这些结果表明了，它也是通过参数是否等于 undefined 来判定参数是否缺失的。

默认值不但可以是一个值，它还可以是任意合法的表达式，甚至是函数调用：

代码语言：javascript

```
function sayHi(name = 'every'+'one') {
	console.log( 'Hello ' + name + '!');
}

sayHi(); // 输出 'Hello everyone!' 
//--------------------------------------
function foo() {
    console.log('调用foo');
    return 'Tony';
}

function sayHi(name = foo()) {
	console.log( 'Hello ' + name + '!');
}
		  
sayHi(); // 输出 '调用foo'
         // 输出 'Hello Tony!' 

sayHi(undefined); // 输出 '调用foo'
                  // 输出 'Hello Tony!' 

sayHi('John'); // 输出 'Hello John!'
```

可以看到，函数参数的默认值只有在函数调用时，参数的值缺失或者是 undefined 才会求值，不会在函数定义时求值。

参数默认值的位置 通常我们给参数设置默认值，是为了调用函数时可以适当省略参数的传入，这里要注意的是，有多个参数时，设置了默认值的参数如果不是放在尾部，实际上它是无法省略的。

代码语言：javascript

```
function fn(x = 1, y) {
	console.log([x, y]);
}

fn(); // 输出 [1, undefined]
fn(2); // 输出 [2, undefined]
fn(, 2); // 报错，语法错误（这里不支持像数组那样的空槽）
fn(undefined, 2); // 输出 [1, 2] （那还不如传个 1 方便呢!）
```

上面例子中，给形参 x 设置的默认值就显得没有任何意义了。因此，设置默认值的参数放在尾部是最好的做法：

代码语言：javascript

```
function fn(x, y = 2) {
	console.log([x, y]);
}

fn(); // 输出 [undefined, 2]
fn(1); // 输出 [1, 2]
fn(1, 1) // 输出 [1, 1]
```

参数的省略问题 在多个参数设置了默认值的情况下，那么问题又来了，你并不能省略比较靠前的参数，而只给最后的一个参数传入实参。

代码语言：javascript

```
function fn(x, y = 2, z = 3) {
	console.log([x, y, z]);
}

fn(1, , 10) // 报错
```

前面我们知道，可以通过传入对象的这种方式去避免参数顺序的限制。那参数默认值如何实现呢？用 || 、 if 语句或者三元表达式去判断也是解决办法，但这样就显得有些落后了。接下来要讨论的是另外两种 ES6 中的全新方式。

参数默认值和 Object.assign() 结合使用

代码语言：javascript

```
function fn(obj = {}) {
    let defaultObj = {
        x: undefined,
        y: 2,
        z: 3
    }

    let result = Object.assign(defaultObj, obj);
    
    console.log([result.x, result.y, result.z]);

}

fn(); // 输出 [undefined, 2, 3]
fn({ x: 1, z: 10 }); // 输出 [1, 2, 10]
```

上面的例子中，在函数中定义了一个对象 defaultObj ，变通地利用其中的属性作为参数的默认值，然后利用 Object.assagin() 把传入的对象和默认对象进行合并，defaultObj 中的属性会被 obj 的相同属性覆盖，obj 中如果有其他属性会分配给 defaultObj 。这里用一个变量接收返回的合并对象。

同时形参 obj 也设置了默认值为一个空对象，防止函数调用时不传任何参数，因为这会导致 Object.assign() 接收的第二个参数是 undefined ，从而产生报错。

参数默认值和解构赋值结合使用 函数调用时，实参和形参的匹配实际上是一个隐式的赋值过程，所以，参数传递也可以进行解构赋值：

代码语言：javascript

```
function fn({ x, y = 2, z = 3 }) {
    console.log([x, y, z]);
}

fn({}); // 输出 [undefined, 2, 3]
fn({ x: 1, z: 10 }); // 输出 [1, 2, 10]
```

在这个例子中，使用的只是对象的解构赋值默认值，还没有使用函数参数的默认值。如果函数调用时不传任何参数，也会产生报错，因为这导致了参数初始化时解构赋值失败，相当于执行了 {x, y = 2, z = 3} = undefined 这样的代码。

同样的，你可以利用参数默认值的语法，给 {x, y = 2, z = 3} 设置一个默认的解构对象，使得不传参函数也能够顺利执行：

代码语言：javascript

```
function fn({ x, y = 2, z = 3 } = {}) {
    console.log([x, y, z]);
}

fn(); // 输出 [undefined, 2, 3]
```

这里出现了双重的默认值，可能有些绕，那么用一段伪代码来解释以上的参数初始化过程就是：

代码语言：javascript

```
if( 实参 === {...} ) { // 当 fn({...});     
    { x, y = 2, z = 3 } = {...};
                        
} else if ( 实参 === undefined ){ // 当 fn();
    { x, y = 2, z = 3 } = {};
}
```

双重默认值有一点细节需要特别注意，就是解构赋值默认值和函数参数默认值的差别，看下面例子：

代码语言：javascript

```
function fn ({ x = 1 } = {}, { y } = { y: 2 }){
    console.log(x, y);
}

fn(); // 输出 1 2
fn({ x: 10 }, { y: 20 }); // 输出 10 20
fn({},{}); // 1 undefined
```

这个函数中，有两组参数采用了解构赋值的方式，看似 x 和 y 都设置了默认值，虽然是不同的两种形式，但显然不是任何情况下结果都相同的。当传入的参数是{}时，y 并没有获取到默认值 2 ，为什么会这样呢？结合前面的伪代码例子来看：

代码语言：javascript

```
fn({ x: 10 }, { y: 20 }); // 初始化时: { x = 1 } = { x: 10 }, { y } = { y: 20 }

fn({},{}); // 初始化时: { x = 1 } = {}, { y } = {}
```

当传入的参数是{}时，函数参数没有缺失也不是 undefined ，所以函数参数默认值是不起作用的。同时 {} 里面也没有 x 和 y 的对应值，x 得到的 1 是解构赋值默认值，而 y 由于没有设置解构赋值默认值，所以它默认是 undefined。

参数默认值的作用域与暂时性死区 还有一个小细节，一旦有参数设置了默认值，那么它们会形成自己的作用域（包裹在(…)中），因此不能引用函数体中的变量：

代码语言：javascript

```
function foo(a = b) {
    let b = 1;
}

foo(); // 报错，b 未定义
```

但这个作用域只是临时的，参数初始化完毕后，这个作用域就不存在了。

它也符合普通作用域的规则：

代码语言：javascript

```
let b = 2;

function foo(a = b) {
    let b = 1;
    return a;
}

foo(); // 2
```

上面例子中，存在一个全局变量 b，那么形参 a 会获取到全局变量 b 的值。

当然，如果形参作用域中存在一个形参 b 的话，它优先获取到的是当前作用域的：

代码语言：javascript

```
let b = 2;

function foo(b = 3 ,a = b) {
    return a;
}

foo(); // 3
```

给多个参数设置默认值，它们会按顺序初始化的，遵循“暂时性死区”的规则，即前面的参数不能引用后面的参数：

代码语言：javascript

```
function foo(a = b, b = 2) {
    return a + b;
}

foo(); // 报错，b 在初始化之前不能访问
```

五、参数的收集与展开 剩余参数 ES6 提供了**剩余参数（rest）**的语法（…变量名），它可以收集函数多余的实参（即没有对应形参的实参），这样就不再需要使用 arguments 对象来获取了。形参使用了 … 操作符会变成一个数组，多余的实参都会被放进这个数组中。

剩余参数基本用法：

代码语言：javascript

```
function sum(a, ...values) {

    for (let val of values) {
        a += val;
    }
    
    return a;

}

sum(0, 1, 2, 3); // 6
```

上面例子中，在参数初始化时，首先根据参数位置进行匹配，把 0 赋值给 a ，然后剩余的参数 1、2、3 都会被放进数组 values 中。

下面是分别用 arguments 对象和剩余参数来获取参数的对比例子：

代码语言：javascript

```
// arguments 的写法
function sortNumbers() {
	return Array.prototype.slice.call(arguments).sort();
}

// 剩余参数的写法
const sortNumbers = (...numbers) => {
    return numbers.sort();
}
可以看出剩余参数的写法更加简洁。尽管 arguments 是一个类数组，也是可迭代对象，但它终究不是数组。它不支持数组方法，当我们使用 arguments 时，如果想要调用数组方法，就必须使用Array.prototype.slice.call先将其转为数组。
```

而剩余参数它不同于 arguments 对象，它是真正的 Array 实例，能够很方便地使用数组方法。并且箭头函数也支持剩余参数。

另外，使用剩余参数不会影响 arguments 对象的功能，它仍然能够反映调用函数时传入的参数。

剩余参数的位置 剩余参数必须是最后一个形参，否则会报错。

代码语言：javascript

```
// 报错
function fn1(a, ...rest, b) {
	console.log([a, b, rest]);
} 

// 正确写法
function fn2(a, b, ...rest) {
    console.log([a, b, rest]);
}

fn2(1, 2, 3, 4) // 输出 [1, 2, [3, 4]]
```

展开语法 前面我们知道了如何把多余的参数收集为一个数组，但有时候我们需要做一些相反的事，例如要把一个数组中的元素分别传入给某个函数，而不是传入一个数组，像这样：

代码语言：javascript

```
function sum(...values) {
    let sum = 0;

    for (let val of values) {
        sum += val;
    }
    
    return sum;

}

let arr = [1, 2, 3, 4];

sum(arr); // "01,2,3,4"
```

上面例子的函数会把所有传进来的数值累加，如果直接传入一个数组，就得不到我们想要的结果。

例子中传入一个数组， values 的值会变成 [[1, 2, 3, 4]]，导致数组 values 中只有一个元素，而这个元素的类型是数组。那么函数返回值就是数值 0 和数组 [1, 2, 3, 4]相加的结果了，两者各自进行了类型的隐式转换变成字符串，然后再相加，是一个字符串拼接的效果。

要实现把数组拆解传入给函数，首先不可能一个个传入参数——sum(arr[0], arr[1], arr[2], arr[3]);，因为不是任何时候都知道数组中有多少个元素的，而且数组中可能会非常多的元素，手动传是不明智的。

比较可行的是借助 apply() 方法：

代码语言：javascript

```
sum.apply(null, arr); // 10
```

但这还不是最优解，那么重点来了！

ES6 新增的**展开语法（spread）**可以帮助我们面对这种情况。它也是使用 …变量名 的语法，虽然跟剩余参数语法一样，但是用途完全相反，它能够把一个可迭代对象拆分成逗号分隔的参数序列。

在函数调用时，它的应用是这样子的：

代码语言：javascript

```
sum(...arr); // 10

// 相当于 sum(1,2,3,4);
```

它甚至可以随意搭配常规值使用，没有前后位置限制，还可以同时传入多个可迭代对象：

代码语言：javascript

```
sum(-1, ...arr); // 9
sum(...arr, 5); // 15
sum(-1, ...arr, 5); // 14
sum(-1, ...arr, ...[5, 6, 7]); // 27
```

## 常见考点

1.  **定义与用法**：  
  - ES6中，函数参数可以使用`=`操作符设置默认值。
  - 当调用函数时未传递该参数或传递`undefined`，将使用默认值。
2.  **TypeScript中的默认参数**：  
  - TypeScript支持为函数参数添加类型注解，并同时设置默认值。
  - 有助于在编译阶段捕获错误。
3.  **应用**：  
  - 提高函数灵活性，减少代码冗余。
  - 处理可选参数，简化函数调用。
4.  **注意事项**：  
  - 默认值仅在参数未传递或传递`undefined`时生效。
  - 参数顺序：具有默认值的参数应位于没有默认值的参数之后（虽然这不是硬性规定，但通常建议这样做以提高代码可读性）。
