+++
title = "变量"
date = '2024-10-10T00:00:00+08:00'
lastmod = '2024-11-18T00:00:00+08:00'
draft = true
weight = 19
tags = ["面试", "前端", "CSS", "变量", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 一、变量的声明

声明变量的时候，变量名前面要加两根连词线（`--`）。

> ```css
> body {
>   --foo: #7F583F;
>   --bar: #F7EFD2;
> }
> ```

上面代码中，`body`选择器里面声明了两个变量：`--foo`和`--bar`。

它们与`color`、`font-size`等正式属性没有什么不同，只是没有默认含义。所以 CSS 变量（CSS variable）又叫做**"CSS 自定义属性"**（CSS custom properties）。因为变量与自定义的 CSS 属性其实是一回事。

你可能会问，为什么选择两根连词线（`--`）表示变量？因为`$foo`被 Sass 用掉了，`@foo`被 Less 用掉了。为了不产生冲突，官方的 CSS 变量就改用两根连词线了。

各种值都可以放入 CSS 变量。

> ```css
> :root{
>   --main-color: #4d4e53;
>   --main-bg: rgb(255, 255, 255);
>   --logo-border-color: rebeccapurple;
>
>   --header-height: 68px;
>   --content-padding: 10px 20px;
>
>   --base-line-height: 1.428571429;
>   --transition-duration: .35s;
>   --external-link: "external link";
>   --margin-top: calc(2vh + 20px);
> }
> ```

变量名大小写敏感，`--header-color`和`--Header-Color`是两个不同变量。

## 二、var() 函数

`var()`函数用于读取变量。

> ```css
> a {
>   color: var(--foo);
>   text-decoration-color: var(--bar);
> }
> ```

`var()`函数还可以使用第二个参数，表示变量的默认值。如果该变量不存在，就会使用这个默认值。

> ```css
> color: var(--foo, #7F583F);
> ```

第二个参数不处理内部的逗号或空格，都视作参数的一部分。

> ```apache
> var(--font-stack, "Roboto", "Helvetica");
> var(--pad, 10px 15px 20px);
> ```

`var()`函数还可以用在变量的声明。

> ```css
> :root {
>   --primary-color: red;
>   --logo-text: var(--primary-color);
> }
> ```

注意，变量值只能用作属性值，不能用作属性名。

> ```css
> .foo {
>   --side: margin-top;
>   /* 无效 */
>   var(--side): 20px;
> }
> ```

上面代码中，变量`--side`用作属性名，这是无效的。

## 三、变量值的类型

如果变量值是一个字符串，可以与其他字符串拼接。

> ```css
> --bar: 'hello';
> --foo: var(--bar)' world';
> ```

利用这一点，可以 debug。

> ```css
> body:after {
>   content: '--screen-category : 'var(--screen-category);
> }
> ```

如果变量值是数值，不能与数值单位直接连用。

> ```css
> .foo {
>   --gap: 20;
>   /* 无效 */
>   margin-top: var(--gap)px;
> }
> ```

上面代码中，数值与单位直接写在一起，这是无效的。必须使用`calc()`函数，将它们连接。

> ```css
> .foo {
>   --gap: 20;
>   margin-top: calc(var(--gap) * 1px);
> }
> ```

如果变量值带有单位，就不能写成字符串。

> ```css
> /* 无效 */
> .foo {
>   --foo: '20px';
>   font-size: var(--foo);
> }
>
> /* 有效 */
> .foo {
>   --foo: 20px;
>   font-size: var(--foo);
> }
> ```

## 四、作用域

同一个 CSS 变量，可以在多个选择器内声明。读取的时候，优先级最高的声明生效。这与 CSS 的"层叠"（cascade）规则是一致的。

下面是一个例子

> ```xml
> <style>
>   :root { --color: blue; }
>   div { --color: green; }
>   #alert { --color: red; }
>   * { color: var(--color); }
> </style>
>
> <p>蓝色</p>
> <div>绿色</div>
> <div id="alert">红色</div>
> ```

上面代码中，三个选择器都声明了`--color`变量。不同元素读取这个变量的时候，会采用优先级最高的规则，因此三段文字的颜色是不一样的。

这就是说，变量的作用域就是它所在的选择器的有效范围。

> ```css
> body {
>   --foo: #7F583F;
> }
>
> .content {
>   --bar: #F7EFD2;
> }
> ```

上面代码中，变量`--foo`的作用域是`body`选择器的生效范围，`--bar`的作用域是`.content`选择器的生效范围。

由于这个原因，全局的变量通常放在根元素`:root`里面，确保任何选择器都可以读取它们。

> ```css
> :root {
>   --main-color: #06c;
> }
> ```

## 五、响应式布局

CSS 是动态的，页面的任何变化，都会导致采用的规则变化。

利用这个特点，可以在响应式布局的`media`命令里面声明变量，使得不同的屏幕宽度有不同的变量值。

> ```css
> body {
>   --primary: #7F583F;
>   --secondary: #F7EFD2;
> }
>
> a {
>   color: var(--primary);
>   text-decoration-color: var(--secondary);
> }
>
> @media screen and (min-width: 768px) {
>   body {
>     --primary:  #F7EFD2;
>     --secondary: #7F583F;
>   }
> }
> ```

## 六、兼容性处理

对于不支持 CSS 变量的浏览器，可以采用下面的写法。

> ```css
> a {
>   color: #7F583F;
>   color: var(--primary);
> }
> ```

也可以使用`@support`命令进行检测。

> ```scss
> @supports ( (--a: 0)) {
>   /* supported */
> }
>
> @supports ( not (--a: 0)) {
>   /* not supported */
> }
> ```

## 七、JavaScript 操作

JavaScript 也可以检测浏览器是否支持 CSS 变量。

> ```sas
> const isSupported =
>   window.CSS &&
>   window.CSS.supports &&
>   window.CSS.supports('--a', 0);
>
> if (isSupported) {
>   /* supported */
> } else {
>   /* not supported */
> }
> ```

JavaScript 操作 CSS 变量的写法如下。

> ```awk
> // 设置变量
> document.body.style.setProperty('--primary', '#7F583F');
>
> // 读取变量
> document.body.style.getPropertyValue('--primary').trim();
> // '#7F583F'
>
> // 删除变量
> document.body.style.removeProperty('--primary');
> ```

这意味着，JavaScript 可以将任意值存入样式表。下面是一个监听事件的例子，事件信息被存入 CSS 变量。

> ```reasonml
> const docStyle = document.documentElement.style;
>
> document.addEventListener('mousemove', (e) => {
>   docStyle.setProperty('--mouse-x', e.clientX);
>   docStyle.setProperty('--mouse-y', e.clientY);
> });
> ```

那些对 CSS 无用的信息，也可以放入 CSS 变量。

> ```css
> --foo: if(x > 5) this.width = 10;
> ```

上面代码中，`--foo`的值在 CSS 里面是无效语句，但是可以被 JavaScript 读取。这意味着，可以把样式设置写在 CSS 变量中，让 JavaScript 读取。

所以，CSS 变量提供了 JavaScript 与 CSS 通信的一种途径。

> 原文：[www.ruanyifeng.com](http://www.ruanyifeng.com/)

## 常见考点

### 1. **CSS变量基础**

- 请简述什么是 CSS 变量？它如何工作？
- 如何声明和使用 CSS 变量？请提供一个简单的例子。  
```css
:root {
  --main-color: #3498db;
}

body {
  background-color: var(--main-color);
}
```

### 2. **作用域与继承**

- CSS 变量的作用域是什么？它是如何继承的？
- 在什么情况下，CSS 变量会被继承？如果你在一个父元素中定义了 CSS 变量，它会影响子元素吗？
- 如何使用 `:root` 来定义全局变量，或者在某个特定元素中定义局部变量？

### 3. **动态修改与计算**

- CSS 变量是否可以动态修改？请举例说明如何使用 JavaScript 修改 CSS 变量的值。
- 请解释如何通过 `calc()` 函数与 CSS 变量结合使用，来进行动态计算。

### 4. **CSS 变量与浏览器兼容性**

- 你如何处理不同浏览器对 CSS 变量的兼容性问题？哪些浏览器支持 CSS 变量？
- 如果需要兼容不支持 CSS 变量的浏览器，通常的解决方案是什么？

### 5. **CSS变量与主题切换**

- 你如何使用 CSS 变量实现网站主题的切换（如明暗主题）？请提供一个实现的示例。
- 当切换主题时，如何通过 CSS 变量动态修改页面的颜色、字体或其他样式？

### 6. **多级作用域与优先级**

- 如果在局部作用域内重新定义了一个变量，它会覆盖全局定义的变量吗？
- 请解释 CSS 变量在作用域中是如何工作的，局部变量如何覆盖全局变量？

### 7. **支持的类型**

- CSS 变量的值可以是什么类型？可以是颜色、长度、百分比、关键字、URL 等吗？
- 你能给出一些使用 CSS 变量来控制颜色、间距、字体大小等样式的示例吗？

### 8. **与常规 CSS 属性的结合**

- CSS 变量与其他常规 CSS 属性（如 `background-color`、`font-size`）结合时，有哪些常见的应用场景？
- 如何在一个元素的 `background` 或 `border` 样式中使用 CSS 变量来动态改变外观？

### 9. **继承与局部作用域**

- CSS 变量是如何继承的？它们与其他属性（如 `color` 或 `font-size`）的继承机制有何不同？
- 如何在子元素中使用父元素定义的 CSS 变量？如果父元素未定义变量，子元素可以使用什么默认值？

### 10. **性能优化**

- 使用 CSS 变量与常规 CSS 样式相比，是否有性能上的差异？如果有，如何优化性能？
- 在页面大量使用 CSS 变量时，如何避免性能瓶颈？例如，避免对复杂变量进行频繁的计算。

### 11. **CSS 变量与 JavaScript 的交互**

- 如何在 JavaScript 中读取和修改 CSS 变量的值？请举例说明。
- 你如何通过 JavaScript 动态更改页面样式并改变 CSS 变量的值？

### 12. **与预处理器（如 Sass）比较**

- 与 CSS 预处理器（如 Sass、LESS）中的变量相比，CSS 变量有什么优势和劣势？
- 当使用 CSS 变量时，如何确保样式在多个组件或页面间保持一致性？

### 13. **使用场景**

- 请举例说明你在实际项目中如何使用 CSS 变量来优化样式管理，例如在大型项目中的主题系统或组件库中。
- 你如何通过 CSS 变量改善样式的可维护性和可重用性？

### 14. **对计算和动画的支持**

- CSS 变量能否用于 CSS 动画中的动画属性？如何在动画过程中动态修改变量的值？
- 当我们在 CSS 动画中使用 CSS 变量时，动画的流畅性和表现会如何？

### 15. **调试与可维护性**

- 在开发中，如何有效调试 CSS 变量的值，确保它们被正确使用和应用？
- 如果 CSS 变量的值出现错误，如何迅速定位和修复问题？
