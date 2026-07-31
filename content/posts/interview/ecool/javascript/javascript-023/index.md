+++
title = "正则表达式"
date = '2024-10-01T00:00:00+08:00'
lastmod = '2024-11-08T00:00:00+08:00'
draft = true
weight = 23
tags = ["面试", "前端", "JavaScript", "正则表达式", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 前言

> 正则表达式使用单个[字符串]来描述、匹配一系列匹配某个[句法规则]的字符串，通常被用来检索、替换那些符合某个模式（规则）的文本。

## 创建

## 1.构造函数创建

> new RegExp('正则表达式','修饰符')

```js
var reg = new RegExp('hello','igm');
```

## 2.直接直面量创建

> /正则表达式/修饰符

```js
var reg = /hello/igm;
```

## 字符分类

## 1.普通字符

> 字母、数字、下划线、汉字、没有特殊含义的符号（,;!@等）
>
> 实际上不是特殊字符的字符都是普通字符

## 2.特殊字符

> \：将特殊字符转义成普通字符

## 3.模式修饰符

> i：ignoreCase，匹配时忽视大小写
>
> m：multiline，多行匹配
>
> g：global，全局匹配
>
> 字面量创建正则时，模式修饰符写在一对反斜线后

## 实例方法

## 1.exec()

> 用来匹配字符串中符合正则表达式的字符串
>
> 如果匹配到，返回值是一个result数组:
>
> [匹配的内容，index: 在str中匹配的起始位置，input: 参数字符串，groups: undefined]
>
> 否则返回null

```js
var str = 'Hello world javascript hello';
var reg = new RegExp('hello','igm');
var res = reg.exec(str);
console.log(res);

输出结果为：
[
    'Hello',
    index: 0,
    input: 'hello world javascript hello',
    groups: undefined
]
```

## 2.test()

> 用来测试待检测的字符串中是否有可以匹配到正则表达式的字符串
>
> 如果有返回true，否则返回false

```js
var reg = /hello/;
var str = 'hello world';
console.log(reg.test(str));  //true
```

## 3.toSting() toLocaleString()

> 把正则表达式的内容转化成**字面量形式字符串**/有本地特色的字符串

```js
var reg = /hello/;
var str = 'hello world';
console.log(reg.toString(),typeof reg.toString());   // /hello/ string
console.log(reg.toLocaleString(),typeof reg.toLocaleString());   // /hello/ string
```

## 4.valueOf()

> 返回正则表达式本身

```js
var reg = /hello/;
var str = 'hello world';
console.log(reg,typeof reg);   // /hello/ object
console.log(reg.valueOf(),typeof reg.valueOf());  // /hello/ object
```

## 正则表达式实例属性

## 1.lastIndex

> 当没设置全局匹配时，该属性值**始终为0**
>
> 设置了全局匹配时，每执行一次exec/test来匹配，lastIndex就会移向匹配到的字符串的下一个位置，当指向的位置后没有可以再次匹配的字符串时，下一次执行exec返回**null**，test执行返回**false**，然后lastIndex**归零**，从字符串的开头重新匹配一轮
>
> 可以理解成，每次正则**查找的起点**就是lastIndex

```js
var str = 'hello hello hello';
var reg1 = /hello/;
var reg2 = /hello/g;
console.log(reg1.lastIndex);  // 0
console.log(reg1.exec(str));  // 返回第一个hello
console.log(reg1.lastIndex);  // 0

console.log(reg2.lastIndex);  // 0
console.log(reg2.exec(str));  // 返回第一个hello
console.log(reg2.lastIndex);  // 5

console.log(reg2.lastIndex);  // 5
console.log(reg2.exec(str));  // 返回第二个hello
console.log(reg2.lastIndex);  // 11

console.log(reg2.lastIndex);  // 11
console.log(reg2.exec(str));  // 返回第三个hello
console.log(reg2.lastIndex);  // 17

console.log(reg2.exec(str));  //返回 null

console.log(reg2.lastIndex);  // 0
console.log(reg2.exec(str));  // 返回第一个hello
```

## 2.ignoreCase、global、multiline

> 判断正则表达式中是否有**忽略大小写**、**全局匹配**、**多行匹配**三个模式修饰符

```js
var pattern = /hello/igm;
console.log(pattern.ignoreCase); //true
console.log(pattern.global); //true
console.log(pattern.multiline); //true
```

## 3.source

> 返回**字面量形式**的正则表达式（**类似于toString**）

```js
var pattern = /hello/igm; 
console.log(pattern.source,typeof pattern.source);  //hello string
```

## 正则表达式语法

## 1.直接量字符

> 正则表达式中的所有字母和数字都是按照字面含义进行匹配的，Javascript正则表达式语法也支持非字母的字符匹配，这些字符需要通过反斜线\作为前缀进行转义。

| 字符 | 匹配 |
| --- | --- |
| 字母和数字字符 | 自身 |
| \o | Null字符 |
| \t | 制表符 |
| \n | 换行符 |
| \v | 垂直制表符 |
| \f | 换页符 |
| \r | 回车符 |

```js
var reg = /\n/;
console.log(reg.test('hello \n world'));  //true
console.log('hello \n world'); 
结果为：
hello
 world
```

## 2.字符集合

> 字符集合，也叫字符组。匹配集合中的任意一个字符。 可以使用连字符‘-’指定一个范围。
>
> [^xyz] 反义或补充字符集，也叫反义字符组。匹配任意不在括号内的字符。也可以通过使用连字符 '-' 指定一个范围内的字符。
>
> ##### 注意：^写在[]里面是反义字符组

```js
var reg = /[abc]/; //匹配括号中任意一个字母
console.log(reg.test('aaa hello world1'));  //true

var reg = /[0-9]/; //匹配任意一个数字
console.log(reg.test('aaa hello world1')); //true

var reg = /[^xyz]/; //包含xyz返回false 匹配除xyz之外的任何字符
console.log(reg.test('xyz'));  //false
```

## 3.边界符

> ^ 匹配输入开始。表示匹配行首的文本（以谁开始)。如果多行（multiline）标志被设为 true，该字符也会匹配一个断行（line break）符后的开始处。

> $ 匹配输入结尾。表示匹配行尾的文本（以谁结束）。如果多行（multiline）标志被设为 true，该字符也会匹配一个断行（line break）符的前的结尾处。

> 如果 ^和 $ 在一起，表示必须是精确匹配。

```js
var rg = /abc/; 
// /abc/ 只要包含有abc这个字符串返回的都是true
console.log(rg.test('abc'));  //true
console.log(rg.test('abcd')); //true
console.log(rg.test('aabcd'));//true
console.log('---------------------------');
// 必须是以abc开头的字符串才会满足
var reg = /^abc/;
console.log(reg.test('abc')); // true
console.log(reg.test('abcd')); // true
console.log(reg.test('aabcd')); // false
console.log('---------------------------');
// 必须是以abc结尾的字符串才会满足
var reg = /abc$/;
console.log(reg.test('abc')); // true
console.log(reg.test('qweabc')); // true
console.log(reg.test('aabcd')); // false
console.log('---------------------------');
var reg1 = /^abc$/; // 精确匹配 要求必须是 abc字符串才符合规范
console.log(reg1.test('abc')); // true
console.log(reg1.test('abcd')); // false
console.log(reg1.test('aabcd')); // false
console.log(reg1.test('abcabc')); // false
```

## 4.字符集与边界符一起使用

```js
//// 三选一 只有是a 或者是 b  或者是c 这三个字母才返回 true
var reg = /^[abc]$/;
console.log(reg.test('a')); //true
console.log(reg.test('b')); //true
console.log(reg.test('c')); //true
console.log(reg.test('aa')); //false

// 26个英文字母(大写和小写都可以)任何一个字母返回 true
var reg = /^[0-9A-Za-z]$/;
console.log(reg.test('a')); //true
console.log(reg.test('A')); //true
console.log(reg.test('2')); //true
console.log(reg.test('!')); //false

var reg = /^[^0-9A-Za-z]$/; //^反义字符 只要包含方括号内的字符，都返回 false
console.log(reg.test('a')); //false
console.log(reg.test('A')); //false
console.log(reg.test('2')); //false
console.log(reg.test('!')); //true
```

## 5.零宽单词和非零宽单词的边界

> \b 零宽单词边界 单词和空格之间位置 （取一个完整单词）
>
> \B单词边界和单词边界中间的位置 不匹配单词边界 （取某个单词中间部分）

```js
var  str = 'hello world javascript';

var reg = /\brld\b/;
console.log(reg.exec(str)); //null

var reg = /\bhello\b/;
console.log(reg.exec(str)); 
//[
    //'hello',
    //index: 0,
    //input: 'hello world javascript',
    //groups: undefined
//]

var reg = /\Brld\B/;
console.log(reg.exec(str)); //null

var reg = /\Borl\B/;
console.log(reg.exec(str)); //[ 'orl', index: 7, input: 'hello world javascript', groups: undefined ]
```

## 6.字符类

> 将直接量字符单独放进方括号内就组成了字符类，一个字符类可以匹配它所包含的任意字符。

| 字符类 | 含义 |
| --- | --- |
| . | 匹配除换行符\n和回车符之外的任何单个字符，等效于 **[^\n\r]** |
| \d | 匹配一个数字字符，等效于[0-9] |
| \D | [^0-9] |
| \w | 匹配包括下划线的任何单个字符，包括A~~Z，a~~z，0~9和下划线 **"_"** ，等效于 [a-zA-Z0-9_] |
| \W | [^a-zA-Z0-9_] |
| \s | 匹配任何Unicode空白字符，包括空格、制表符、换页符等，等效于[\f\t\n\r] |
| \S | [^\f\t\n\r] |

> 记忆： d ==> digit（数字） s ==> space（空白） w ==> word（单词）

```js
var reg = /./; //匹配除\n\r 之外的任意字符
var str = '\nhello\r world js'; 
console.log(reg.test(str)); //true

var str = '\n\r '; 
console.log(reg.test(str)); //true

var str = '\n\r'; 
console.log(reg.test(str)); //false

var reg = /\d/; //\d 等同于[0-9] 匹配任意数字
console.log(reg.test('12'));
console.log(reg.test('0'));
console.log(reg.test('1a'));
console.log(reg.test('a')); //false

var reg = /\D/; //\D等同于[0-9] 不匹配数字
console.log(reg.test('1')); //false
console.log(reg.test('a'));
console.log(reg.test('!'));
console.log(reg.test(' '));

var reg = /\w/; //\w 匹配[0-9A-Za-z_]
console.log(reg.test('a'));
console.log(reg.test('A'));
console.log(reg.test('_'));
console.log(reg.test('1'));
console.log(reg.test('!')); //false
console.log(reg.test(' ')); //false

var reg = /\W/; //\W 匹配[^0-9A-Za-z_]
console.log(reg.test('0'));
console.log(reg.test('a'));
console.log(reg.test('_'));
console.log(reg.test('@')); //true
console.log(reg.test(' ')); //true

var reg = /\s/; //\s 匹配任何unicode空白符 空格 制表符 换行符 [\f\n\t\r]
console.log(reg.test(' '));
console.log(reg.test('\n'));
console.log(reg.test('a')); //false
console.log(reg.test('1')); //false

var reg = /\S/; //\S 等效于 [^\f\t\n\r]
console.log(reg.test('1'));
console.log(reg.test('a'));
console.log(reg.test('!')); 
console.log(reg.test(' ')); //false 
console.log(reg.test('\n')); //false
```

## 数量词

| 字符 | 含义 |
| --- | --- |
| * | >=0次 |
| + | ≥1 次 |
| ？ | 0或1次 |
| {n} | n 次 |
| {n,} | ≥n 次 |
| {n,m} | n到m 次 |

```js
var reg = /^a*$/; // * 允许出现0次或多次
console.log(reg.test("")); //true
console.log(reg.test("a")); //true
console.log(reg.test("aa")); //true

var reg = /^a+$/; // + 允许出现1次或多次
console.log(reg.test("")); //false
console.log(reg.test("a")); //true
console.log(reg.test("aa")); //true

var reg = /^a?$/; // ? 只允许a出现1次或0次
console.log(reg.test("")); //true
console.log(reg.test("a")); //true
console.log(reg.test("aa")); //flase
console.log(reg.test("aaa")); //false

var reg = /^a{3}$/; // {3} 允许重复3次
console.log(reg.test("aaa")); //true
console.log(reg.test("aaaa")); //false
console.log(reg.test("a")); //false

var reg = /^a{3,6}$/; // {3,6} 允许重复出现3次-6次之间，也就是>=3且<=6
console.log(reg.test('aa')); //false
console.log(reg.test('aaa'));
console.log(reg.test('aaaa'));
console.log(reg.test('aaaaa'));
console.log(reg.test('aaaaaa'));
console.log(reg.test('aaaaaaa')); //false

var reg = /^a{3,}$/;  // {3,} 允许重复出现3次或3次以上多次
console.log(reg.test('aa')); //false
console.log(reg.test('aaa'));
console.log(reg.test('aaaa'));
console.log(reg.test('aaaaa'));
console.log(reg.test('aaaaaa'));
console.log(reg.test('aaaaaaa'));
console.log(reg.test('aaaaaaaa'));
console.log(reg.test('aaaaaaaaaaaaaaaaaa'));

//案例
//匹配qq号:不能以数字0开始，只能由数字组成，长度为5-11位
var reg = /^[1-9]\d{4,10}$/;
console.log(reg.test("1112")); //false
console.log(reg.test("1440549324"));

//匹配身份证号：18位 不能以数字0开头，只能由数字组成，最后一位可能是x，X，数字
var reg = /^[1-9]\d{16}[xX\d]$/;
console.log(reg.test('142325202006283320'));
console.log(reg.test('14232520200628332x'));
console.log(reg.test('1423252020062833')); //false 
console.log(reg.test('1423252020062833xx')); //false
```

## 贪婪模式和非贪婪模式

> 贪婪模式：尽可能多的匹配（首先取最多可匹配的数量为一组进行匹配），当匹配剩余的字符串，还会继续尝试新的匹配，直到匹配不到为止，为默认模式。
>
> 非贪婪模式：尽可能少的匹配（每次取最少匹配的数量为一组进行匹配），直到匹配不到为止 (使用方法：在量词后加上?)

```js
//贪婪模式
var reg = /\d{3,6}/g;
var str = "12345678";
console.log(reg.exec(str)); //[ '123456', index: 0, input: '12345678', groups: undefined ]
console.log(reg.exec(str)); //null

//非贪婪模式
var reg = /\d{3,6}?/g;
var str = "123456789";
console.log(reg.exec(str)); //[ '123', index: 0, input: '123456789', groups: undefined ]
console.log(reg.exec(str)); //[ '456', index: 3, input: '123456789', groups: undefined ]
console.log(reg.exec(str)); //[ '789', index: 6, input: '123456789', groups: undefined ]
console.log(reg.exec(str)); //null
console.log(reg.exec(str)); //[ '123', index: 0, input: '123456789', groups: undefined ]
```

## 选择，分组，候选

## 选择

> 字符"|"用于分隔供选择的字符，选择项的尝试匹配次序是从左到右，直到发现了匹配项，如果左边的选择项匹配，就忽略右边的匹配项，即使它可以产生更好的匹配。

```js
var reg = /html|css|js/g;
var str = 'helloworldcsshtml'
console.log(reg.exec(str)); //[ 'css', index: 10, input: 'helloworldcsshtml', groups: undefined ]
console.log(reg.exec(str)); //[ 'html', index: 13, input: 'helloworldcsshtml', groups: undefined ]
```

## 分组

> 有圆括号包裹的一个小整体成为分组

```js
var reg = /briupbriupbriup/;
console.log(reg.test('briup')); //false
console.log(reg.test('briupbriup')); //false
console.log(reg.test('briupbriupbriup'));
console.log(reg.test('briupbriupbriupbriup'));

var reg = /^(briup){3}$/;
console.log(reg.test('briup')); //false 
console.log(reg.test('briupbriup')); //false
console.log(reg.test('briupbriupbriup')); //true
console.log(reg.test('briupbriupbriupbriup')); //false
```

## 候选

> 选择分组综合

```js
var reg = /I like (html|css|js)/;
console.log(reg.test('I like html'));
console.log(reg.test('I like css'));
console.log(reg.test('I like js'));
console.log(reg.test('I like table')); //false
```

## 捕获和引用

> 被正则表达式匹配（捕获）到的字符串会被暂存起来。其中，由分组捕获的串会从1开始编号，于是我们可以引用这些串

```js
var reg = /(\d{4})-(\d{2})-(\d{2})/;
var str = '2023-06-28';
reg.exec(str);
console.log(RegExp.$1); //2023
console.log(RegExp.$2); //06
console.log(RegExp.$3); //28
```

> 嵌套分组的捕获 : 规则是以左括号出现的顺序进行捕获

```js
var reg = /((apple) is (a (fruit)))/;
reg.exec('apple is a fruit');
console.log(RegExp.$1); //apple is a fruit
console.log(RegExp.$2); //apple 
console.log(RegExp.$3); //a fruit
console.log(RegExp.$4); //fruit
```

> 引用： 正则表达式里也能进行引用，这称为反向引用

```js
var reg = /(\w{3}) is \1/
console.log(reg.test('kid is kid')); // true
console.log(reg.test('dik is dik')); // true
console.log(reg.test('kid is dik')); // false
console.log(reg.test('dik is kid')); // false
//\1引用了第一个被分组所捕获的串，换言之，表达式是动态决定的。

//注意，如果编号越界了，则会被当成普通的表达式：
var reg = /(\w{3}) is \6/;
reg.test( 'kid is kid' ); // false
reg.test( 'kid is \6' );  // true
```

## String对正则表达式的支持

## search

> 查找字符串中是否有匹配正则的字符串，有则返回字符串**第一次出现时的位置**，无则返回**null**
>
> 正则中无论是否有全局匹配都不会影响返回结果

```js
var str = 'hello world hello';
var reg = /hello/;
var reg2 = /hello/g;
console.log(str.search(reg)); //返回 0
console.log(str.search(reg2));//返回 0
```

## match

> 字符串匹配符合正则表达式字符串 匹配到返回数组，并返回该字符串的一个**数组**，其中包括字符串**内容**、**位置**
>
> 如果正则设置全局匹配，则**一次性返回所有**符合正则表达式的字符串数组
>
> 如果其中添加了分组，返回符合要求的字符串以及**分组**的一个数组，但如果同时开启全局匹配则**不会在数组中添加分组内容**

```js
var str = 'hello world hello';
var reg1 = /hello/;
var reg2 = /hello/g;
var reg3 = /(he)llo/;
var reg4 = /(he)llo/g;
// 匹配字符串中符合正则表达式的字符串，并返回该字符串的一个数组，其中包括字符串内容、位置
// [ 'hello', index: 0, input: 'hello world hello', groups: undefined ]
console.log(str.match(reg1));
// 如果正则设置全局匹配，则一次性返回所有符合正则表达式的字符串数组
// [ 'hello', 'hello' ]
console.log(str.match(reg2));
// 如果其中添加了分组，返回符合要求的字符串以及分组的一个数组
// [
//   'hello',
//   'he',
//   index: 0,
//   input: 'hello world hello',
//   groups: undefined
// ]
console.log(str.match(reg3));
// 如果同时开启全局匹配则不会在数组中添加分组内容
// [ 'hello', 'hello' ]
console.log(str.match(reg4));
```

## split

> 以某种形式分割字符串 将其转换为数组

```js
var str = 'terry123larry456tony';
var reg = /\d{3}/;
console.log(str.split(reg)); //[ 'terry', 'larry', 'tony' ]
```

## replace

> 满足正则表达式的内容会被替换

```js
var str = 'javascript';
var reg = /javascript/;
var res = str.replace(reg,'java');
console.log(res,str,reg); //java javascript /javascript/
```

## 前瞻表达式

| **表达式** | **名称** | **描述** |
| --- | --- | --- |
| (?=exp) | 正向前瞻 | 匹配后面满足表达式exp的位置 |
| (?!exp) | 负向前瞻 | 匹配后面不满足表达式exp的位置 |

```js
var str = 'Hello, Hi, I am Hilary.';
// 后面一定要匹配什么
var reg = /H(?=i)/g;
var newStr = str.replace(reg, "T");
console.log(newStr);//Hello, Ti, I am Tilary.
```

> 在这个DEMO中我们可以看出正向前瞻的作用，同样是字符"H"，但是只匹配"H"后面紧跟"i"的"H"。就相当于有一家公司reg，这时候有多名"H"人员前来应聘，但是reg公司提出了一个硬条件是必须掌握"i"这项技能，所以"Hello"就自然的被淘汰掉了。
>
> 那么负向前瞻呢？道理是相同的：

```js
var str = 'Hello, Hi, I am Hilary.';
// 后面一定不要匹配什么
var reg = /H(?!i)/g;
var newStr = str.replace(reg, "T");
console.log(newStr);//Tello, Hi, I am Hilary.
```

> 在这个DEMO中，我们把之前的正向前瞻换成了负向前瞻。这个正则的意思就是，匹配"H",且后面不能跟着一个"i"。这时候"Hello"就可以成功的应聘了，因为reg公司修改了他们的招聘条件，他们说"i"这门技术会有损公司的企业文化，所以我们不要了。

## 小练习

## 1.验证是否为11位有效手机号码？

> 以1为开头
>
> 第二位为3，4，5，7，8中的任意一位
>
> 最后以0-9的9个整数结尾

```js
var reg = /^[1][34578]\d{9}$/; 
console.log(reg.test('18412341225'));  //true
console.log(reg.test('1100'));
console.log(reg.test('12345678910'));
console.log(reg.test('02345678910'));
```

## 2.密码验证

> 匹配密码，必须包含大写，小写和数字,和特殊字符(!,@,#,%,&),且大于6位

```js
var reg = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#%&])^[A-Za-z\d!@#%&]{6,}$/;
var str = '1!1A3a';
console.log(reg.test(str)); //true
```

## 常见考点

### 1. **正则表达式的基本概念**

- 什么是正则表达式？它在 JavaScript 中的作用是什么？
- 正则表达式适用于哪些场景？请简要说明一些常见的应用场景。

### 2. **正则表达式的语法**

- 请解释一些常用的正则表达式符号，例如 `.`、`*`、`+`、`?`、`^`、`$` 等。
- 你如何使用字符类和字符组？比如 `[a-z]`、`[0-9]`、`\d`、`\w` 等符号的含义是什么？

### 3. **匹配的模式**

- 什么是贪婪匹配（Greedy Match）和懒惰匹配（Lazy Match）？如何切换这两种模式？
- 请解释如何使用正则表达式的边界匹配符，比如 `\b` 和 `\B`，以及它们在匹配单词边界中的应用。

### 4. **分组和捕获**

- 什么是捕获组（Capturing Group）？如何在正则表达式中使用括号 `()` 创建捕获组？
- 你如何使用非捕获组 `(?: … )`？它在什么场景下有用？
- 正则表达式中的反向引用是什么？你能举例说明它的使用方法吗？

### 5. **特殊符号与转义**

- 在正则表达式中，什么时候需要使用转义字符 `\`？请举例说明。
- 如何匹配像 `.`、`*` 等元字符自身？需要做哪些处理？

### 6. **常用方法**

- JavaScript 中常用的正则表达式方法有哪些？请简要说明 `test`、`exec`、`match`、`replace`、`split` 等方法的作用和区别。
- 请解释 `match` 和 `matchAll` 的区别，以及它们在什么场景下适用。

### 7. **正则表达式的性能优化**

- 正则表达式可能会导致性能问题，特别是在处理大文本时。你会如何优化正则表达式的性能？
- 在正则表达式匹配中，使用懒惰模式（非贪婪）能否有效提高性能？为什么？

### 8. **正则表达式的实际应用**

- 你在实际开发中是如何使用正则表达式的？可以举一个具体的例子说明吗？
- 常见的表单验证（如邮箱、电话号码、URL）正则表达式应该如何编写？请分享一个你常用的正则表达式模式。

### 9. **正则表达式调试与测试**

- 你是否使用过正则表达式的调试工具？如何调试和测试复杂的正则表达式？
- 在调试正则表达式时，遇到匹配不正确的情况你通常如何排查问题？

### 10. **正则表达式的局限性与替代方案**

- 在处理非常复杂的文本解析时，正则表达式可能不太适用。你遇到过这种情况吗？如何处理？
- 除了正则表达式，你是否使用过其他文本匹配或解析方法？这些方法的优缺点是什么？
