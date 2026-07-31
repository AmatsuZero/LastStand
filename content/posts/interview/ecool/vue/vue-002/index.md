+++
title = "数据绑定"
date = '2024-10-04T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = true
weight = 2
tags = ["面试", "前端", "Vue", "数据绑定", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
### 1. 定义

#### **1.1 双向绑定 & 单向绑定**

vue的双向绑定，即数据与视图的`响应式`设计。具体表现为：`View`的改变能实时让`Model`发生变化，而`Model`的变化也能实时更新`View`。

什么情况下用户可以更新View呢？如：`填写表单`。当用户填写表单时，View的状态就被更新了，如果此时MVVM框架可以自动更新Model的状态，那就相当于把Model和View做了双向绑定。

注意区别：`单向数据绑定`，所有数据只有一份，一旦数据变化，就去更新页面(只有data-->DOM，没有DOM-->data)。

- 用户在页面作出更新，需要用户手动收集(双向绑定是自动收集)，在合并到原有的数据中。

Vue.js中的v-model主要用在表单的input输入框，完成视图和数据的双向绑定：

```html
<!DOCTYPE html>
<html>
<head></head>
<body>
    <div id="app">
        <input type="text" v-model="message">
        <p>{{message}}</p>
    </div>
    <script>
        var app = new Vue({
            el: '#app',
            data: {
                message: ''
            }
        });
    </script>
</body>
</html>
```

#### **1.2 v-model来添加双向绑定**

```html
<input v-model="xxx">

<!-- 上面的代码等价于 -->
<input :value="xxx" @input="xxx = $event.target.value">
<!-- 双向绑定 = 单向绑定 + UI事件监听 -->
```

#### **1.3 双向绑定、单向绑定的优缺点**

- **单向绑定**：数据流也是单向的，对于复杂应用来说是实施统一状态管理（如redux）的前提。
- **双向绑定**：在一些需要`实时`反应用户输入的场合会非常方便（如多级联动菜单）。但常认为复杂应用中这种便利比不上引入状态管理带来的优势。因为不知道状态什么时候发生改变，是谁造成的改变，数据变更也不会通知。

响应式的思路：`mvvm` **Model，View，View-Model**

---

### 2. 原理概述

Vue 数据双向绑定原理是通过 `数据劫持` + `发布者-订阅者模式` 的方式来实现的，首先是通过 `ES5` 提供的 `Object.defineProperty()` 方法来劫持（监听）各属性的 **getter、setter**，并在当监听的属性发生变动时通知订阅者，是否需要更新，若更新就会执行对应的更新函数。详见 [vue源码](https://github.com/vuejs/vue)。

- 常见的`基于数据劫持`的**双向绑定**有两种实现  
  - 一个是目前Vue在用的 `Object.defineProperty`
  - 一个是ES2015中新增的 `Proxy`，而在Vue3.0版本后加入Proxy从而代替Object.defineProperty

---

### 3. 基于数据劫持实现的双向绑定

#### 3.1 几种实现双向绑定的做法

目前几种主流的`mvc(vm)框架`都实现了**单向数据绑定**，而**双向数据绑定**可以理解为是在单向绑定的基础上给可输入元素（input、textarea等）添加了change(input)事件，来动态修改model和 view。

实现`数据绑定`的做法有大致如下几种：

> 发布者-订阅者模式（backbone.js）

> 脏值检查（angular.js）

> 数据劫持（vue.js）

`发布者-订阅者模式:` 一般通过**sub**，**pub**的方式实现数据和视图的绑定监听，更新数据方式通常做法是 **vm.set('property', value)**。而我们更希望通过 **vm.property = value** 这种方式更新数据，同时自动更新视图，于是有了下面两种方式。

`脏值检查:` angular.js 是通过**脏值检测的方式**比对数据是否有变更，来决定是否更新视图，最简单的方式就是通过 **setInterval()** 定时轮询检测数据变动，当然Google 限制 angular只有在指定的事件触发时进入脏值检测，大致如下：

- DOM事件，如用户输入文本，点击按钮等。( ng-click )
- XHR响应事件 ( `$http` )
- 浏览器Location变更事件 ( `$location` )
- Timer事件( `$timeout` , `$interval` )
- 执行 `$digest()` 或 `$apply()`

`数据劫持:` vue.js 则是采用**数据劫持**结合**发布者-订阅者模式**的方式，通过**Object.defineProperty()** 来劫持各个属性的 **setter**，**getter**，在数据变动时发布消息给订阅者，触发相应的 **监听回调**。

#### 3.2 数据劫持

##### 3.2.1 什么是数据劫持

数据劫持比较好理解，通常我们利用`Object.defineProperty`劫持对象的访问器，在属性值发生变化时我们可以获取变化，从而进行进一步操作。

##### 3.2.2 数据劫持的优势

目前业界分为两个大的流派，一个是以React为首的单向数据绑定，另一个是以Angular、Vue为主的双向数据绑定。

> 三大框架都是既可以双向绑定 也可以单向绑定，如React可以手动绑定onChange和value实现双向绑定，也可以调用一些双向绑定库；Vue也加入了props这种单向流的api。

对比其他双向绑定的实现方法，**数据劫持**的优势所在：

1. **无需显示调用**: 例如Vue运用数据劫持+发布订阅，直接可以通知变化并驱动视图，而如Angular的脏检测则需要显示调用markForCheck(可以用zone.js避免显示调用,不展开)，react需要显示调用setState。
2. **可精确得知变化数据**：劫持了属性的setter,当属性值改变,可以精确获知变化的内容`newVal`，因此在这部分不需要额外的diff操作，否则只知道数据发生了变化而不知道具体哪些数据变化了，这个时候需要大量diff来找出变化值是额外性能损耗。

#### 3.3 实现思路

基于数据劫持双向绑定的实现思路：**数据劫持**是双向绑定各种方案中比较流行的一种，最著名的实现是Vue。

要实现一个完整的双向绑定需要以下几个要点：

1. 利用`Proxy`或`Object.defineProperty`生成的`Observer`针对对象/对象的属性进行"劫持",在属性发生变化后通知订阅者
2. 解析器`Compile`解析模板中的`Directive`(指令)，收集指令所依赖的方法和数据,等待数据变化然后进行渲染
3. `Watcher`属于`Observer`和`Compile`桥梁,它将接收到的`Observer`产生的数据变化,并根据`Compile`提供的指令进行视图渲染,使得数据变化促使视图变化

#### 3.4 特点

基于Object.defineProperty双向绑定的特点：

> 对Object.defineProperty还不了解的请阅读[文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

```javascript
const object1 = {};
 Object.defineProperty(object1, 'property1', {
  value: 11,
  writable: false
 });
 object1.property1 = 2;
 *// throws an error in strict mode*
 console.log(object1.property1);
 *// expected output: 11*
```

**Object.defineProperty()** 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

---

### 4. 深入vue的双向数据绑定原理以及核心代码模块

#### 4.1 准备知识

**1 [ ].slice.call(lis): 将伪数组转换为真数组**

```html
<body>
  <ul>
    <li>111</li>
    <li>222</li>
    <li>333</li>
  </ul>
</body>
```

```javascript
//1.  [].slice.call(lis):通过实例调用方法，将伪数组转换为真数组   
//.call()让一个函数在指定对象上调用
  const lis = document.getElementsByTagName('li')     //lis是伪数组
  console.log(lis instanceof Array, lis[1].innerHTML, lis.forEach)
  //false    "222"    undefined             
  //对象属性（lis.forEach）查找的是原型链，找不到就是undefined (因为是伪数组，不具备数组的方法)
  
  //ES6中将伪数组转换为真数组：Array.from(lis)
  //ES5中Array.prototype.slice(begin,end)相当于（ 浅拷贝,但是原数组不变这点类似深拷贝），若是不指定begin,end，就是全部
  //slice在数组原型上，call()让一个函数在指定对象上面调用
  const lis2 = Array.prototype.slice.call(lis)  //推荐  
  //.call(lis) 让一个函数成为指定对象的方法进行调用
  console.log(lis2 instanceof Array,lis2[1].innerHTML,lis2.forEach)
  //true    "222"     ƒ forEach() { [native code] }          
  //这样就可以通过.forEach来遍历数组了
```

**2 node.nodeType: 得到节点类型**

```
 *//2. node.nodeType:得到节点类型，最大的节点document    //document,element,attr,text*
 const elementNode = document.getElementById('test')    *//元素节点*
 const attrNode = elementNode.getAttributeNode('id')    *//属性节点*
 const textNode = elementNode.firstChild          *//文本节点*
 *//不同节点的nodeType是不同的，是他们的标识。当要调用getAttr()(只有元素节点才有)时就需要知道nodeType了,nodeType=1*

 console.log(elementNode.nodeType, attrNode.nodeType, textNode.nodeType) *//1 2 3*
```

**3 属性描述符分为：**数据描述符**(其他都是)，**访问描述符**（get,set）**

Object.defineProperty(obj,propName,{}): 给对象添加/修改属性(指定描述符)

```javascript
//3.Object.defineProperty(obj,propertyName,{}):给对象添加属性（指定描述符）
  const obj={
    firstName:'A',
    lastName:'B'
  }
  //给obj添加fullName属性，且能自动同步
  /*
  属性描述符：
    2.访问描述符
      get：回调函数，根据其他相关的属性，动态计算得到当前属性值
      set：回调函数，监视当前属性值的变化，更新其他相关属性
  */
  Object.defineProperty(obj,'fullName',{
    get(){
      return this.firstName + '-' + this.lastName
    },
    set(value){
      //更新firstName,lastName
      const names =value.split('-')
      this.firstName = names[0],
      this.lastName = names[1]
    }
  })
  console.log(obj.fullName)     //A-B
  //修改属性
  obj.firstName = 'C'
  obj.lastName = 'D'
  console.log(obj.fullName)     //C-D
  obj.fullName = 'E-F'
  console.log(obj.firstName, obj.lastName)    //E  F
   /*
  属性描述符：
  1.数据描述符
      configurable:是否可以重新定义
      enumerable:是否可以枚举
      value：初始值
      writable：是否可以修改属性值,默认为 false。*/
  Object.defineProperty(obj,'fullName2',{
    configurable:false,
    enumerable:true,
    value:'G-H',
    writable:false
  })
  console.log(obj.fullName2)      //G-H
  obj.fullName2 = 'J-K'
  console.log(obj.fullName2)      //G-H  不能修改
```

**4 Object.keys(obj): 得到对象自身**可枚举**的属性名的数组**

```javascript
  //4.Object.keys(obj):得到对象自身可枚举属性组成的数组
    //枚举 for in
  const names = Object.keys(obj)//返回所有对象组成的数组
  console.log(names)//  ["firstName","lastName","fullName2"]
```

**5 obj.hasOwnProperty(prop): 判断 prop 是否是 obj 自身的属性**

```javascript
//5.obj.hasOwnProperty(prop):判断prop是否是obj自身的属性
  console.log(obj.hasOwnProperty('fullName'), obj.hasOwnProperty('toString'))
  //true false      
  //toString也可能是原型链上的
```

**6 DocumentFragment: 文档碎片(高效**批量更新**多个节点)**

```html
<body>
  <ul>
    <li>111</li>
    <li>222</li>
    <li>333</li>
  </ul>
</body>
```

```javascript
//6.DocumentFragment:文档碎片（高效批量更新多个节点）
    //Document对应显示的页面，包含 n个element,一旦更新 Document内部的某个元素界面更新
    //DocumentFragment：内存中保存 n个element的容器对象（不与界面关联），如果更新Fragment中的某个element，界面不变
    //将多次更新变成了一次批量更新，减少更新的次数
    /*
     <ul id="fragment_test">
    <li>111</li>
    <li>222</li>
    <li>333</li>
  </ul>
    */
  const ul = document.getElementById('fragment_test')
  //1)创建fragment
  const fragment = document.createDocumentFragment()
  //2)取出ul中所有子节点，取出保存到fragment----转移
  let child
  while (child = ul.firstChild) {     //一个节点只能有一个父亲
    fragment.appendChild(child)       //先将child从ul中移出，添加为fragment的子节点
  }
  //3)更新fragment中所有li的文本      //childNode得到所有子节点   //children得到所有子标签  //fragment.childNodes通过dom方式得到的都是伪数组
      //fragment.childNodes
  //Array.prototype.slice.call(fragment.childNodes) 真数组  拿到的节点有两种可能性（1.换行的文本2.标签<li>）
  Array.prototype.slice.call(fragment.childNodes).forEach(node =>{
    if(node.nodeType===1){        //元素节点----<li>  即判断是不是标签节点
      node.textContent = 'dddddd' //此时页面不显示。不更新---与页面不相关，仅仅是内存独立的东西
    }
  })
  //4)将fragment插入到ul
  ul.appendChild(fragment)  //.appendChild() 接收node类型
```

#### 4.2 数据代理

- `数据代理:` 通过**一个对象代理** 对 **另一个对象(在前一个对象内部)中属性的操作(读/写)**
- vue 数据代理: 通过 **vm 对象**来代理 data 对象中所有属性的操作
- 好处: 更方便的操作 data 中的数据
- 基本实现流程  
  - 通过 **Object.defineProperty(vm, key, { })** 给vm添加与data对象的属性对应的属性
  - 所有 **添加的属性都包含get/set方法**
  - 在get/set方法中去操作data中对应的属性

```html
<body>
  <div id="test"></div>
</body>
<script type="text/javascript" src="js/vue.js"></script>
<script type="text/javascript">
const vm = new Vue({
  el:'#test',
  data:{
    name:'feifei'
  }
})
console.log(vm.name)//feifei
console.log(vm)       //vm代理对data数据的“读”操作
vm.name = 'xiaoxiao'  //vm代理对data数据的“写”操作
console.log(vm._data.name)//xiaoxiao    注意这里是vm._data.name
console.log(vm.name)//xiaoxiao
</script>
```

**案例**

```html
<body>
<div id="test"></div>
<!--实现 数据代理-->
<script type="text/javascript" src="js/mvvm/compile.js"></script> <!--编译解析模板-->
<script type="text/javascript" src="js/mvvm/mvvm.js"></script>
<script type="text/javascript" src="js/mvvm/observer.js"></script>  <!--观察-->
<script type="text/javascript" src="js/mvvm/watcher.js"></script> <!--监视-->
<script type="text/javascript">
  const vm = new MVVM({         //这里的MVVM只是定义的名字
    el: "#test",
    data: {
      name: '张三'
    }
  })
  console.log(vm.name)        // 读取的是data中的name,  vm代理对data的读操作
  vm.name = '李四'           // 数据保存到data中的name上, vm代理对data的写操作
  console.log(vm.name, vm._data.name)
</script>
</body>
```

#### 4.3 MVVM.js

```javascript
/*
相关于Vue的构造函数
 */
function MVVM(options) {
  // 将选项对象保存到vm
  this.$options = options;
  // 将data对象保存到vm和data变量中
  var data = this._data = this.$options.data;
  //将vm保存在me变量中
  var me = this;
  // 遍历data中所有属性
  Object.keys(data).forEach(function (key) { // key是data的某个属性名: name
    // 对指定属性实现代理
    me._proxy(key);
  });

  // 对data中所有层次的属性通过 数据劫持 实现 数据绑定。进行监视
  observe(data, this);

  // 创建一个编译对象，来解析模板 的compile对象
  //如果左边有值传左边的，没有则传右边的
  this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
  $watch: function (key, cb, options) {
    new Watcher(this, key, cb);
  },

  // 对指定属性实现代理
  _proxy: function (key) {
    // 保存vm
    var me = this;
    // 给vm添加指定属性名的属性(使用属性描述)
    Object.defineProperty(me, key, {
      configurable: false,    // 不能再重新定义
      enumerable: true,       // 可以枚举
      // 当通过vm.name读取属性值时自动调用,从data中获取对应的属性值返回
      get: function proxyGetter() {
        // 读取data中对应属性值返回(实现代理 读 操作)
        return me._data[key];
      },
      // 当通过vm.name = 'xxx'时自动调用
      set: function proxySetter(newVal) {
        // 将xxx最新的值保存到data中对应的属性上(实现代理 写 操作)
        me._data[key] = newVal;
      }
    });
  }
};
```

`proxy:` vue 有一个特点，可以通过访问 vm 的实例属性，直接访问到 vm 初始化时 data 的属性值。这个其实是一个代理模式的实现, 对 vm 实例进行**键值**的代理

#### 4.4 proxy代理

```javascript
 let a = {
    data: {
      b: 123
    }
  }; 
/**   * 实现访问 a.b === 123   */
  function proxy(target: Object, sourceKey: string): void {
    let data = target[sourceKey];
    let keys = Object.keys(data);
    for (let i = 0, l = keys.length; i < l; i++) {
      let key = keys[i];
      Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        set(val) {
          this[sourceKey][key] = val;
        },
        get() {
          return this[sourceKey][key];
        }
      });
    }
  }
  proxy(a, "data");
 console.log(a.b); // 123
```

---

### 5. 模板解析

```javascript
  // 创建一个编译对象，来解析模板 的compile对象
  //如果左边有值传左边的，没有则传右边的
  this.$compile = new Compile(options.el || document.body, this)
```

`模板：` html嵌套了js代码（1.指令代码2.表达式）

#### 5.1 模板解析的基本流程

1. 将 el 的所有子节点取出, 添加到一个新建的文档 fragment 对象中
2. 对 fragment 中的所有层次子节点递归进行编译解析处理  
  1. 对大括号表达式文本节点进行解析
  2. 对元素节点的指令属性进行解析  
    1. 事件指令解析
    2. 一般指令解析
3. 将解析后的 fragment 添加到 el 中显示

#### 5.2 模板解析

##### 5.2.1 大括号表达式解析 {{msg}}

**1.根据 正则对象 得到匹配出的 表达式字符串: 子匹配/RegExp.$1 name**

> var reg = /{{(.*)}}/;
>
> me.compileText(node, RegExp.$1);

**2.从 data 中取出表达式对应的属性值**

> // 将data对象保存到vm和data变量中
>
> var data = this._data = this.$options.data;

**3.将属性值设置为文本节点的 textContent**

> // 更新节点的textContent
>
> textUpdater: function (node, value) {
>
> node.textContent = typeof value == 'undefined' ? '' : value;
>
> },

##### 5.2.2 **编译模板**

**1.compile.js**

> //编译模板最重要的3步：
>
> this.`$fragment` = this.node2Fragment(this.`$el`);
>
> this.init();
>
> this.`$el`.appendChild(this.`$fragment`);

```javascript
  function Compile(el, vm) {
    // 保存vm
    this.$vm = vm;
    // 保存el元素
    //this是compile实例(编译对象)，$el存的是dom元素
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    // 如果el元素存在
    if (this.$el) {
      //模板解析最重要的3步： 2表示to,node2Fragment--->nodeToFragment将node转换为Fragment
      // 1. 取出el中所有子节点, 封装在一个framgment对象中
      this.$fragment = this.node2Fragment(this.$el);
      // 2. 初始化显示，解析模板（在内存中进行编译），编译fragment中所有层次子节点
      this.init();
      // 3. 将fragment添加到页面的el元素中
      this.$el.appendChild(this.$fragment); //编译完后再将其塞回页面中
    }
  }
```

##### 5.2.3 debug

要取对象的属性有两种方式：

**1.点.出属性**

**2.使用[ ] ,若属性值是变量(变化的值),则必须采用[ ]的方式**

由于 vue 的 parsePath 方法是用 split('.') 来做的属性分割，所以不支持abc['bbc']

##### 5.2.4 解析 v-on:click="show"

```html
<body>
    <div id="test">
        <p>{{msg}}</p>
        <!--给button绑定点击事件：要指定事件名，指定回调函数-->
        <button v-on:click="show">提示</button>
    </div>
<script type="text/javascript">
new MVVM({
    el: '#test',
    methods: {
        show () {
            alert(this.msg)
        }
    }
})
</script>
</body>
```

**核心：**

**1.从指令名中取出事件名 click**

> var eventType = dir.split(':')[1],

**2.根据指令的值(表达式)从 methods 中得到对应的事件处理函数对象 show ，exp表达式**

> fn = vm.`$options`.methods && vm.`$options`.methods[exp];

**3.给当前元素节点绑定指定事件名和回调函数的 dom 事件监听eventHandler中的**

> if (eventType && fn) {
>
> ​ node.addEventListener(eventType, fn.bind(vm), false);
>
> }

**4.指令解析完后, 移除此指令属性**

> node.removeAttribute(attrName);

**isDirective()** 判断是不是属性名，有v-的都是属性名

**subString(2)** 从`下标为2` 的地方开始截，例如 `v-on:click`，截取完后为 `on:click`

**isEventDirective()** 判断 是不是事件指令

```javascript
// 解析事件指令
compileUtil.eventHandler(node, me.$vm, exp, dir);
// 事件处理(器)
.eventHandler
```

##### 5.2.5 一般指令解析

```html
<style>
.aclass {
    color: red;
}
.bClass {
    font-size: 30px;
}
</style>
</head>
<body>
    <div id="test">
        <p v-text="msg"></p>
        <p v-html="msg">123</p>
        <p class="bClass" v-class="myClass">xxxxxx</p>
    </div>
<script type="text/javascript" src="js/mvvm/compile.js"></script>
<script type="text/javascript" src="js/mvvm/mvvm.js"></script>
<script type="text/javascript" src="js/mvvm/observer.js"></script>
<script type="text/javascript" src="js/mvvm/watcher.js"></script>
<script type="text/javascript">
new MVVM({
	el: '#test',
	data: {
		msg: '<a href="http://www.atguigu.com">xxx</a>',
		myClass: 'aclass'
	},
	methods: {
		test () {
			alert(this.msg)
		}
	}
})
</script>
```

> // 解析普通指令
>
> compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);

上面的代码：**有几个指令属性，就执行几次**。此处是v-text="msg"，v-html="msg"，v-class="myClass"有3个，就执行3次。

1. 得到指令名和指令值(表达式) text/html/class msg/myClass
2. 从 data 中根据表达式得到对应的值
3. 根据指令名确定需要操作元素节点的什么属性

- v-text---textContent 属性
- v-html---innerHTML 属性
- v-class--className 属性

1. 将得到的表达式的值设置到对应的属性上
2. 移除元素的指令属性

#### 5.3 compile.js

> // 解析普通指令
>
> compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);

```javascript
 // 更新节点的className
  classUpdater: function (node, value, oldValue) {
    //静态class属性的值
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    var space = className && String(value) ? ' ' : '';
    //将静态class属性的值与动态class值进行合并后设置为新的className属性值
    node.className = className + space + value;
    // node.className = className + (className?' ':'' )+ value;   //可能是空串或者空格
  },
```

详情见下方6.1四个重要对象。

#### 5.4 数据绑定

一旦更新了 data 中的某个属性数据, 所有界面上直接使用或间接使用了此属性的节点都会`更新`。即 **自动更新界面**。

---

### 6. 数据劫持

**observe(data, this)**

1.  `数据劫持是` vue 中用来 **实现数据绑定** 的一种 **技术** 
2.  基本思想: 通过 defineProperty()来监视 **data 中所有属性**(任意层次)数据的变化, 一旦变化就去更新界面 即，给data中的属性**添加set(监视变化)，get方法** 

例如:this.xxx = 3,此时this是vm,改变vm的set的值，然后这里的set变化了，会改变data中xxx的值。(`vm`——>`M`)

当data中xxx的值改变时，data的set值也发生变化，就会去更新界面了。(数据绑定：`M`——>`V` )

即：

-  **vm**中的`set` 是用来**实现 数据代理**的 
-  **data**中的`set` 是用来实现 **数据绑定** 的（界面会变） 

#### 6.1四个重要对象

##### 流程

- **模板编译(Compile)**
- **数据劫持(Observer)**
- **发布的订阅(Dep)**
- **观察者(Watcher)**

> MVVM模式就要将这些板块进行整合,实现**模板和数据**的**绑定**！

##### 6.1.1 Compiler

-  用来解析模板页面的对象的构造函数(一个实例) 
-  利用 compile 对象解析模板页面 
-  每解析一个表达式(非事件指令)都会创建一个对应的watcher对象, 并建立watcher 与 dep 的关系 
-  `complie 与 watcher 关系:` 一对多的关系 

MVVM中调用了Compile类来编译我们的页面,开始来实现模板编译

###### 6.1.1.1. 搭建基础的架子

```javascript
 class Compile {
    constructor(el, vm) {
      // 看看传递的元素是不是DOM,不是DOM我就来获取一下~
      this.el = this.isElementNode(el) ? el : document.querySelector(el);
      this.vm = vm;
      if (this.el) {
        // 如果这个元素能获取到 我们才开始编译
        // 1.先把这些真实的DOM移入到内存中 fragment (性能优化)
        let fragment = this.node2fragment(this.el);
        // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{}}
        this.compile(fragment);
        // 3.把编译号的fragment在塞回到页面里去
        this.el.appendChild(fragment);
      }
    }
    /* 专门写一些辅助的方法 */
    isElementNode(node) {
      return node.nodeType === 1;
    }
    /* 核心的方法 */
    compileElement(node) {}
    compileText(node) {}
    compile(fragment) {}
    node2fragment(el) {}
  }
```

接下来一个个的方法来搞

###### 6.1.1.2. node2fragment

```javascript
node2fragment(el) { // 需要将el中的内容全部放到内存中
    // 文档碎片 内存中的dom节点
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
      // appendChild具有移动性
    }
    return fragment; // 内存中的节点
  }
```

###### 6.1.1.3. compile

```javascript
compile(fragment) {
    // 需要递归 每次拿子元素
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 是元素节点，还需要继续深入的检查
        // 这里需要编译元素
        this.compileElement(node);
        this.compile(node)
      } else {
        // 文本节点
        // 这里需要编译文本
        this.compileText(node);
      }
    });
  }
```

###### 6.1.1.4. compileElement、compileText

再弄出两个方法**compileElement**，**compileText** 来专门处理对应的逻辑

```javascript
 /*辅助的方法*/
  // 是不是指令
  isDirective(name) {
    return name.includes('v-');
  }
  //————————————————————————————
  compileElement(node) {
    // 带v-model v-text
    let attrs = node.attributes; // 取出当前节点的属性
    Array.from(attrs).forEach(attr => {
      // 判断属性名字是不是包含v-model
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // 取到对应的值放到节点中
        let expr = attr.value;
        let [, type] = attrName.split('-'); //
        // 调用对应的编译方法 编译哪个节点,用数据替换掉表达式
        CompileUtil[type](node, this.vm, expr);
      }
    })
  }
  compileText(node) {
    let expr = node.textContent; // 取文本中的内容
    let reg = /\{\{([^}]+)\}\}/g; // {{a}} {{b}} {{c}}
    if (reg.test(expr)) {
      // 调用编译文本的方法 编译哪个节点,用数据替换掉表达式
      CompileUtil['text'](node, this.vm, expr);
    }
  }
```

###### 6.1.1.5. CompileUtil

我们要实现一个专门用来配合**Complie类**的工具对象。

先只处理文本和输入框的情况

```javascript
CompileUtil = {
    text(node, vm, expr) { // 文本处理
      let updateFn = this.updater['textUpdater'];
      // 用处理好的节点和内容进行编译
      updateFn && updateFn(node, value)
    },
    model(node, vm, expr) { // 输入框处理
      let updateFn = this.updater['modelUpdater'];
      // 用处理好的节点和内容进行编译
      updateFn && updateFn(node, value);
    },
    updater: {
      // 文本更新
      textUpdater(node, value) {
        node.textContent = value
      },
      // 输入框更新
      modelUpdater(node, value) {
        node.value = value;
      }
    }
  }
```

###### 6.1.1.6. 实现text方法

```javascript
 text(node, vm, expr) { // 文本处理
      let updateFn = this.updater['textUpdater'];
      // 文本比较特殊 expr可能是'{{message.a}} {{b}}'
      // 调用getTextVal方法去取到对应的结果
      let value = this.getTextVal(vm, expr);
      updateFn && updateFn(node, value)
    },
    getTextVal(vm, expr) { // 获取编译文本后的结果
      return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
        // 依次去取数据对应的值
        return this.getVal(vm, arguments[1]);
      })
    },
    getVal(vm, expr) { // 获取实例上对应的数据
      expr = expr.split('.'); // {{message.a}} [message,a] 实现依次取值
      // vm.$data.message => vm.$data.message.a
      return expr.reduce((prev, next) => {
        return prev[next];
      }, vm.$data);
    }
```

###### 6.1.1.7. 实现Model方法

```javascript
model(node, vm, expr) { // 输入框处理
    let updateFn = this.updater['modelUpdater'];
    // 这里应该加一个监控 数据变化了 应该调用这个watch的callback
    updateFn && updateFn(node, this.getVal(vm, expr));
  }
```

##### 6.1.2 Observer

（观察到了然后去“劫持”数据，定义get/set，创建dep对象）

-  用来对 data 所有属性数据**进行劫持**的构造函数 
-  给 data 中所有属性重新定义属性描述(get/set) 
-  为 data 中的每个属性创建对应的 dep 对象 

> 可以利用`Obeject.defineProperty()`来监听属性变动 那么将需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 `setter`和`getter` 这样的话，给这个对象的某个值赋值，就会触发`setter`，那么就能监听到了数据变化

接下来我们就来写下一个**类Observer**

```javascript
 // 在MVVM加上Observe的逻辑
  if (this.$el) {
    // 数据劫持 就是把对象的所有属性 改成get和set方法
    new Observer(this.$data);
    // 用数据和元素进行编译
    new Compile(this.$el, this);
  }
 // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  class Observer {
    constructor(data) {
      this.observe(data);
    }
    observe(data) {
      // 要将这个data数据原有的属性改成set和get的形式
      // defineProperty针对的是对象
      if (!data || typeof data !== 'object') {
        return;
      }
      // 要将数据 一一劫持 先获取到data的key和value
      Object.keys(data).forEach(key => {
        // 定义响应式变化
        this.defineReactive(data, key, data[key]);
        this.observe(data[key]); // 深度递归劫持
      });
    }
    // 定义响应式
    defineReactive(obj, key, value) {
      // 在获取某个值的时候，想弹个框
      let that = this;
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() { // 当取值时调用的方法
          return value;
        },
        set(newValue) { // 当给data属性中设置值的适合 更改获取的属性的值
          if (newValue != value) {
            // 这里的this不是实例
            that.observe(newValue); // 如果设置的是对象，则继续劫持
            value = newValue;
          }
        }
      });
    }
  }
```

##### 6.1.3 Dep(Depend)

（存放watcher的数组，即subscribes——subs）

-  data 中的每个属性(所有层次)都对应一个 dep 对象 
-  创建的时机:  
  - 在初始化 definedata 中各个属性时创建对应的 dep 对象
  - 在 data 中的某个属性值被设置为新的对象时
-  对象的结构 

> {
>
> id, // 每个 dep 都有一个唯一的 id
>
> subs //包含 n 个对应 watcher 的 数组 (**subscribes 的简写**)
>
> }

- subs 属性说明  
  - 当 watcher 被创建时, 内部将当前 watcher对象添加到对应的 dep对象的 subs中
  - 当此 data 属性的值发生改变时,subs 中所有的 watcher 都会收到更新的通知,从而最终更新对应的界面

发布订阅：Dep实现

```javascript
 class Dep {
    constructor() {
      // 订阅的数组
      this.subs = []
    }
    addSub(watcher) {
      this.subs.push(watcher);
    }
    notify() {
      this.subs.forEach(watcher => watcher.update());
    }
  }
```

##### 6.1.4 Watcher

更新显示内容的

-  模板中每个非事件指令或表达式都对应一个 watcher **对象** 
-  监视当前表达式数据的变化 
-  创建的时机: 在初始化编译模板时 
-  对象的组成 

> {
>
> vm, //vm 对象
>
> exp, //对应指令的表达式
>
> cb, //当表达式所对应的数据发生改变的回调函数 （更新界面的回调函数）
>
> value, //表达式当前的值
>
> depIds //表达式中各级属性所对应的 dep 对象的集合对象 //属性名为 dep 的 > id, 属性值为 dep
>
> }

观察者的目的就是给需要变化的那个元素增加一个观察者，用新值和老值进行比对，如果数据变化就执行对应的方法

```javascript
class Watcher { // 因为要获取老值 所以需要 "数据" 和 "表达式"
    constructor(vm, expr, cb) {
      this.vm = vm;
      this.expr = expr;
      this.cb = cb;
      // 先获取一下老的值 保留起来
      this.value = this.get();
    }
    // 老套路获取值的方法，这里先不进行封装
    getVal(vm, expr) {
      expr = expr.split('.');
      return expr.reduce((prev, next) => {
        return prev[next];
      }, vm.$data);
    }
    get() {
      let value = this.getVal(this.vm, this.expr);
      return value;
    }
    // 对外暴露的方法，如果值改变就可以调用这个方法来更新
    update() {
      let newValue = this.getVal(this.vm, this.expr);
      let oldValue = this.value;
      if (newValue != oldValue) {
        this.cb(newValue); // 对应watch的callback
      }
    }
  }
```

在哪里使用watcher?

答案肯定是：compile， 给需要重新编译的DOM增加watcher

```javascript
text(node, vm, expr) { // 文本处理
      let updateFn = this.updater['textUpdater'];
      let value = this.getTextVal(vm, expr); +
      expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
        new Watcher(vm, arguments[1], (newValue) => {
          // 如果数据变化了，文本节点需要重新获取依赖的属性更新文本中的内容
          updateFn && updateFn(node, this.getTextVal(vm, expr));
        });
      })
      updateFn && updateFn(node, value)
    },
    model(node, vm, expr) { // 输入框处理
      let updateFn = this.updater['modelUpdater'];
      new Watcher(vm, expr, (newValue) => {
        // 当值变化后会调用cb 将新的值传递过来
        updateFn && updateFn(node, newValue);
      });
      updateFn && updateFn(node, this.getVal(vm, expr));
    }
```

##### 6.1.5 dep 与 watcher 的关系

**多对多**

-  a .data 中的一个属性对应一个 dep, 一个 dep 中可能包含多个 watcher(模板中有几个 表达式使用到了同一个属性) 
-  b.模板中一个非事件表达式对应一个 watcher, 一个 watcher 中可能包含多个 dep(表 达式是多层:a.b) 
-  c.**数据绑定**使用到 2 个核心技术  
  -  **defineProperty()** 
  -  **消息订阅与发布** `Dep与Watch之间的关系 ：多对多` dep先创建，watcher后创建。一旦watcher创建，关系就有限制条件了  
    - `1data属性` ---> `1Dep` ---> `n个watcher(模板中有多个表达式使用了此属性)`
    - 例如：在模板中写了多次表达式：{{name}}/ v-text="name" ，则此时`1个name` --->`1个Dep` ---> `2个watcher`
    - `1表达式` ---> `1Watcher` ---> `n个Dep(多层表达式)`
    - 例如：a.b.c 对应`1个watcher`，但对应 `3个dep` (a.b.c有3层)

同一个属性对应同一个dep

如何建立的？

-  data中属性的get()中建立 
-  **vm.name = 'abc' --->data中的name属性值变化 ---> name的set()调用 ---> dep --->相关的所有watcher --->cb() --->updater** 

什么时候建立？

-  初始化的解析模板中的表达式创建watcher对象时 
-  通过get:建立dep与watcher的关系 

关联dep和watcher，watcher中有个重要的逻辑就是this.get()；每个watcher被实例化时都会获取数据从而会调用当前属性的get方法

```javascript
Object.defineProperty(data, key, {
	enumerable: true, // 可枚举
	configurable: false, // 不能再define
	get: function() {
		// 建立dep与watcher的关系
		if (Dep.target) {
			dep.depend();
		}
		// 返回属性值
		return val;
	},
	set: function(newVal) {
		if (newVal === val) {
			return;
		}
		val = newVal;
		// 新的值是object的话，进行监听
		childObj = observe(newVal);//observe观察data中的所有属性
		// 通过dep ,通知订阅者
		dep.notify();
	}
});
```

到此数据和视图就关联起来了！

##### 6.1.6 发布订阅：**监听输入事件**

```javascript
 setVal(vm, expr, value) {
      expr = expr.split('.');
      return expr.reduce((prev, next, currentIndex) => {
        if (currentIndex === expr.length - 1) {
          return prev[next] = value;
        }
        return prev[next];
      }, vm.$data);
    },
    model(node, vm, expr) {
      let updateFn = this.updater['modelUpdater'];
      new Watcher(vm, expr, (newValue) => {
        // 当值变化后会调用cb 将新的值传递过来 （）
        updateFn && updateFn(node, this.getVal(vm, expr));
      });
      node.addEventListener('input', (e) => {
        let newValue = e.target.value;
        // 监听输入事件将输入的内容设置到对应数据上
        this.setVal(vm, expr, newValue)
      });
      updateFn && updateFn(node, this.getVal(vm, expr));
    }
```

##### 6.1.7 发布订阅：**代理数据**

```javascript
class MVVM {
    constructor(options) {
      this.$el = options.el;
      this.$data = options.data;
      if (this.$el) {
        new Observer(this.$data);
        // 将数据代理到实例上直接操作实例即可，不需要通过vm.$data来进行操作
        this.proxyData(this.$data);
        new Compile(this.$el, this);
      }
    }
    proxyData(data) {
      Object.keys(data).forEach(key => {
        Object.defineProperty(this, key, {
          get() {
            return data[key]
          },
          set(newValue) {
            data[key] = newValue
          }
        })
      })
    }
  }
```

##### 拓展

**回调函数**

此处不深入展开，可思考如下问题：

1.什么时候调，

2.做了什么事情，

3.回调函数的this是什么

---

### 7. MVVM 原理分析

#### 7.1原理分析

要实现`mvvm的双向绑定`，就必须要实现以下几点：

1. 实现一个数据监听器**Observer**，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
2. 实现一个指令解析器**Compile**，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
3. 实现一个**Watcher**，作为连接**Observer**和**Compile**的桥梁，能够`订阅并收到`每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图
4. mvvm入口函数，整合以上三者

---

### 8. 双向数据绑定

> 双向数据绑定=单向数据绑定+input 监听

#### 8.1 v-model

1.  **双向数据绑定**是建立在**单向数据绑定**(**model==>View**)的基础之上的 
2.  双向数据绑定的实现流程: a. 在解析 v-model 指令时, 给当前元素添加 **input 监听** （从View==>model） b. 当 input 的 value 发生改变时, 将最新的值赋值给当前表达式所对应的 data 属性 

```html
<div id="test">
<input type="text" v-model="msg">
<p>{{msg}}</p>
</div>
<script type="text/javascript">
new MVVM({
	el: '#test',
	data: {
		msg: 'haha'
	}
})
</script>
```

## 常见考点

### **1. 数据绑定的基础概念**

#### **问题**：

- Vue 的数据绑定是什么？它有哪些方式？
- 数据绑定是单向还是双向的？具体应用场景有哪些？

#### **关键点**：

- Vue 提供了 **单向数据绑定** 和 **双向数据绑定**：  
  - **单向绑定**：`{{}}` 插值表达式、`v-bind`（简称 `:`）语法，常用于父组件向子组件传递数据。
  - **双向绑定**：`v-model`，通常用于表单控件的用户输入处理。
- 单向绑定的优势是明确数据流动方向，双向绑定更适合快速开发但需注意复杂性和调试困难。

---

### **2. 数据绑定的原理**

#### **问题**：

- Vue 是如何实现响应式数据绑定的？
- `Object.defineProperty` 和 Proxy 在 Vue 数据绑定中的作用是什么？
- 为什么 Vue2 不能检测数组的变动？

#### **关键点**：

- **Vue2**：  
  - 通过 `Object.defineProperty` 劫持数据的 `getter` 和 `setter`。
  - 数据变化时，触发依赖收集（订阅者更新视图）。
  - 局限性：  
    - 无法直接检测数组下标变化。
    - 无法检测对象的属性新增或删除。
- **Vue3**：  
  - 使用 `Proxy` 实现深层次的数据劫持。
  - Proxy 的优势：  
    - 能直接监听数组变化。
    - 对动态添加属性的对象支持更好。

---

### **3. 表单与 `v-model`**

#### **问题**：

- `v-model` 的底层是如何实现双向数据绑定的？
- 如何实现自定义组件的 `v-model`？
- 如何绑定复选框、单选框和选择框？

#### **关键点**：

- Vue 通过监听 DOM 事件（如 `input`、`change`）实现双向绑定。
- 自定义组件中的 `v-model`，需要使用 `model` 选项或 `prop` + `emit` 组合：  
```javascript
props: ['value'],
methods: {
  updateValue(newValue) {
    this.$emit('input', newValue);
  }
}
```
- 表单绑定示例：  
  - 单选框：`<input type="radio" v-model="value">`
  - 复选框：`<input type="checkbox" v-model="checked">`
  - 多选框：`<select multiple v-model="selected"></select>`

---

### **4. 父子组件之间的数据绑定**

#### **问题**：

- 父组件如何向子组件传递数据？子组件如何向父组件发送数据？
- 子组件中的数据变化是否会影响父组件？为什么？

#### **关键点**：

- 父组件向子组件传递数据：通过 `props`。
- 子组件向父组件传递数据：  
  - 使用 `$emit` 触发事件。
  - 使用 `v-model` 实现双向绑定。
- 子组件的 `props` 是单向数据流，直接修改 `props` 会触发警告。

---

### **5. 数据绑定中的异步更新机制**

#### **问题**：

- Vue 为什么使用异步更新 DOM？
- 如何通过 `$nextTick` 获取最新的 DOM？
- 如果在同一事件中多次更新数据，Vue 如何处理？

#### **关键点**：

- Vue 将数据更新操作缓存起来，并在下一个事件循环（microtask）中统一执行，以优化性能。
- 示例：  
```javascript
this.value = 1;
this.value = 2;
console.log(this.value); // 输出 2
this.$nextTick(() => {
  console.log(this.$refs.dom.innerText); // 最新 DOM
});
```

---

### **6. 深入数据绑定的优化**

#### **问题**：

- 如何避免对不必要的数据设置响应式？
- 如何优化大型数据集的绑定性能？
- Vue 数据绑定对性能的影响有哪些？

#### **关键点**：

- 避免不必要的响应式：使用 `Object.freeze` 或 `nonReactive` 对象。
- 优化数据结构：  
  - 将大列表拆分为分页加载。
  - 使用 `key` 确保高效的 DOM 更新。
- 在 Vue3 中，响应式系统性能显著提升，特别是对 Proxy 的全面支持。

---

### **7. 常见问题与解决方案**

#### **问题**：

- 为什么 Vue2 无法检测数组的下标变化？如何解决？
- 数据绑定失效的常见原因有哪些？如何调试？
- 双向绑定导致数据混乱时，如何排查和修复？

#### **关键点**：

- Vue2 数组变动问题：  
  - 使用 Vue 提供的数组变异方法，如 `splice`。
  - 或者手动触发视图更新：`this.$set(array, index, value)`。
- 数据绑定失效：  
  - 数据未在响应式系统内。
  - 数据对象层级过深但未使用深度监听。
  - 直接修改 `props` 数据。

---

### **8. 实践问题**

#### **问题**：

- 在项目中，遇到过数据绑定相关的 bug 吗？如何解决？
- 如何在 Vue 中实现一个双向绑定的时间选择组件？

#### **关键点**：

- 实现双向绑定的自定义组件：  
```javascript
props: ['value'],
methods: {
  updateTime(event) {
    this.$emit('input', event.target.value);
  }
}
```

---

### **9. 开放性问题**

#### **问题**：

- Vue 的数据绑定与 React 的状态管理相比，有何优劣？
- 你认为 Vue 的数据绑定机制是否存在改进空间？如果有，你会如何设计？

#### **关键点**：

- 对比 Vue 的响应式与 React 的单向数据流：  
  - Vue：数据变化自动更新视图（响应式）。
  - React：通过 `setState` 手动触发更新（受控组件）。
- 改进空间：  
  - 更灵活的响应式选择（如按需响应）。
  - 提供更丰富的调试工具。

---

### 总结

**Vue 数据绑定**考察能够帮助面试官了解候选人对 Vue 响应式系统、单向与双向数据流、性能优化、实际问题解决等方面的理解深度，以及对前端框架设计的思考能力。优秀的候选人不仅能回答理论问题，还能结合项目经验展示实践能力。
