+++
title = "架构"
date = '2024-10-10T00:00:00+08:00'
lastmod = '2024-11-18T00:00:00+08:00'
draft = true
weight = 22
tags = ["面试", "前端", "CSS", "架构", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 前言

在项目中经常存在如下问题：

- 1.模块拆分不合理
- 2.变量和函数命名不知所云
- 3.缺少注释或者是写了一堆描述不清的内容
- 4.重复的代码遍布各个角落等

因为这些不良的编程习惯，导致了项目越来越难以维护，程序性能越来越低，大大降低了日常的工作效率以及提高了公司的开发成本。

下面就以CSS在Vue3项目中的架构为切入点，通过减少CSS代码的冗余度和增强CSS代码的维护性、扩展性来提高我们的编程能力和项目架构能力。

## CSS的设计模式

在学习CSS架构之前，我们先简单看一下常见的5种CSS设计模式，这些设计模式都为我们的CSS架构提供了一定的开发思路。

### 1.OOCSS模式

OOCSS(Object-Oriented CSS)字面意思是面向对象的CSS，在开发中它有如下的规范约定

- 减少对 HTML 结构的依赖

```shell
# bad
# 1.匹配效率低，影响css性能
# 2.和html耦合度高，维护性和扩展性低
.container-list ul li a {}

<div class="container-list">
  <ul>
    <li>
      <a>...</a>
    </li>
  </ul>
</div>

# good
.container-list .list-item {}

<div class="container-list">
  <ul>
    <li>
      <a class="list-item">...</a>
    </li>
  </ul>
</div>
```

- 增加样式的复用性

```shell
.label {
  # 公共代码
}
.label-danger {
  # 特定代码
}
.label-info {
  # 特定代码
}
<div>
  <p class="label label-danger"></p>
  <p class="label label-info"></p>
</div>
```

### 2.BEM模式

BEM 是进阶版的OOCSS，是一个分层系统，它把我们的网站分为三层，这三层正好对应着 BEM 三个英文单词的简写 block, element, modifier，分为为 块层、元素层、修饰符层。

把 BEM 体现到代码上，我们需要遵循三个原则：

- 使用__两个下划线将块名称与元素名称分开
- 使用--两个破折号分隔元素名称及其修饰符
- 一切样式都是一个类，不能嵌套。

```shell
<div class="menu">
  <div class="menu__tab menu__tab--style1">tab1</div>
  <div class="menu__tab menu__tab--style1">tab2</div>
</div>
```

但是，由于两个下划线__和两个破折号--在实际开发中不是那么的顺手，影响开发效率，不过要严格控制CSS命名规范的话，这无疑是一个好的选择。并且在写CSS的时候我们可以通过Sass的混合指令封装一个BEM.scss文件来减少类名的输入以及增强CSS结构

### 3.SMACSS模式

BEM 简单的三层分法，在应对小中型网站没有问题，但是去应对复杂网站的样式可能就比较困难了，我们需要寻求一个更好的办法。

SMACSS(Scalable and Modular Architecture for CSS)是要编写模块化、结构化和可扩展的 CSS。它对项目中的CSS分为五大类

-  Base: 默认属性样式重置，知名库为normalize.css
-  Layout：布局样式
-  Modules：可复用模块的样式，比如一些列表展示
-  State：状态样式，比如按钮的置灰或高亮的展示
-  Theme：皮肤样式，比如有些网站具有换肤的功能

### 4.ITCSS模式

ITCSS(Inverted Triangle Cascading Style Sheets)可以翻译为`"倒三角CSS"`，它基于分层的概念把我们项目中的样式分为七层

-  Settings: 项目样式变量，如主题色、字体等
-  Tools：工具类样式，比如定义一个函数，表示字数过多出现省略号等
-  Generic：重置和/或标准化样式、框大小定义等，对应的是normalize.css
-  Base：重置浏览器元素属性默认值
-  Objects：维护OOCSS的样式
-  Components：公共组件样式
-  Trumps：让样式权重变得最高，实用程序和辅助类，能够覆盖三角形中前面的任何内容，唯一 important! 的地方

### 5.ACSS模式

ACSS(Atomic CSS)翻译为`"原子化CSS"`，是一种 CSS 的架构方式，它倾向于小巧且用途单一的 class，并且会以视觉效果进行命名。是一个不强调逻辑，而更侧重表现的一门所见即所得的语言，它出现的背景是——前端组件化时代的到来，各个组件的CSS可以做到互相独立，互不影响。因此就有这样的代码出现

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">按钮</button>
```

目前市场上比较成熟的ACSS库有：[Tailwind CSS](https://tailwindcss.com/)和[Windi CSS](https://cn.windicss.org/)

**ACSS的优点**

- CSS文件停止增长：使用传统方法，每次添加新功能时，您的 CSS 文件都会变大。使用实用程序，一切都是可重用的，因此您很少需要编写新的 CSS，一套样式全局通用。
- 不再浪费精力命名，不再添加愚蠢的类名：例如 sidebar-inner-wrapper 只是为了能够设置样式，也不再为真正只是一个 flex 容器的东西的完美抽象名称而苦恼。
- 灵活，易读：CSS 是全球性的，当你做出改变时，你永远不知道你破坏了什么。HTML 中的类是本地的，因此可以 插拔式改变样式 而不必担心其他问题，CSS 样式很多缩写更加符合大脑的记忆。
- 永远不用担心命名冲突，永远不用担心样式覆盖。

**ACSS的缺点**

- 会增加HTML 的体积
- 破坏了CSS命名的语义化
- 熟悉命名 ACSS 命名会有一定成本

综上，我们可以看出ACSS 劣处是非常小的，而好处有非常大，没有理由在项目中不适用。下面我们通过使用BEM、ITCSS和ACSS模式打造一套CSS架构方案。

## 项目搭建

### 创建vue3项目和安装依赖

-  1.创建vue3项目
-  2.安装：`npm i sass@1.26.5 sass-loader@8.0.2 --save`

### CSS目录结构展示与说明

```shell
src
  style
    acss         # 存放boder、margin、padding等基于acss模式的代码
    base         # 存放元素(input、p、h1等)的重置样式
    settings     # 存放项目统一规范的文本颜色、边框颜色等变量
    theme        # 存放项目特定主题下的元素样式
    tools        # 存放封装好的mixin(混合指令)和function(函数)样式
    global.scss  # 需要项目全局引用的CSS
    index.scss   # 需要Vue文件引用的CSS
```

1.关于mixin(混合指令)和function(函数)的区别

- 函数是有计算逻辑，返回计算的结果，不输出css块
- mixin主要是根据计算结果输出css块

```css
/* mixin */
@mixin center-translate($direction: both) {
  position: absolute;
  @if $direction == both {
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  } @else if $direction == horizontal {
    left: 50%;
    transform: translate3d(-50%, 0, 0);
  } @else if $direction == vertical {
    top: 50%;
    transform: translate3d(0, -50%, 0);
  }
}

/* function */
@function am($module, $trait: false) {
  @if $trait==false {
    @return '[am-' + $module + ']';
  } @else {
    @return '[am-' + $module + '~="' + $trait + '"]';
  }
}
```

2.关于style/global.scss和style/index.scss

- global.scss中导入的代码不仅在Vue文件中使用，而且在style中scss定义文件里也会被引用到

```css
# style/global.scss
@import "./settings/var.scss";

# style/settings/var.scss
$background-color-primary: #F1F1F1;
$background-color-secondary: $color-white;

# style/acss/color.scss
@each $style in (primary $background-color-primary, secondary $background-color-secondary) {
  [bg-#{nth($style, 1)}] {
    background-color: #{nth($style, 2)};
  }
}
```

- 全局引入style/global.scss

```js
// 根目录下：vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        // @/ 是 src/ 的别名
        // 注意：在 sass-loader v8 中，这个选项名是 "prependData"
        prependData: `@import "@/style/global.scss";`
      },
    }
  }
}
```

- style/index.scss定义的代码只是不被style中其他css文件引用到而已，其他的都和global.scss一致
- 引入style/index.scss

```js
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style/index.scss'

createApp(App).use(router).mount('#app')
```

下面简单分析和演示下各个style目录中的代码作用。

### 1.acss

该目录主要是定义一些简单的border、color、font-size、margin和padding等代码

```css
/* style/acss/border.scss */
@for $i from 1 through 100 {
  [radius#{$i}] {
    border-radius: #{$i}Px;
    overflow: hidden;
  }
}
[circle] {
  border-radius: 50%;
}

/* style/acss/font-size.scss */
@for $i from 12 through 30 {
  [fz#{$i}] {
    font-size: #{$i}px;
  }
}
```

使用acss代码

```html
<div class="container">
  <div class="item" radius20>border-radius: 20px;</div>
</div>
<div class="container">
  <div class="item" circle>border-radius: 50%;</div>
</div>
<div class="container">
  <div class="item" fz30>font-size: 30px;</div>
</div>
```

### 2.base

该目录主要是重置项目中一些元素的默认样式，比如input、hn、p、a等元素

```css
/* style/base/form.scss */
input {
  padding: 0;
  outline: none;
  border: none;
}

/* style/base/link.scss */
a {
  color: #ccc;
  text-decoration: none;
}
```

### 3.settings

该目录是定义全局的、项目统一规范的文本颜色、边框颜色等变量

```css
/* style/settings/var.scss */
/* 主题色调 */
$color-primary: #FF5777;
$color-white: #FFFFFF;

/* 文本色调 */
$color-text-primary: green;
$color-text-secondary: #FF4533;
$color-text-tertiary: $color-white;
$color-text-quaternary: $color-primary;

/* 盒子边框色调 */
$border-color-base: #E5E5E5;

/* 盒子背景色色调 */
$background-color-primary: #F1F1F1;
$background-color-secondary: $color-white;
$background-color-tertiary: $color-primary;

/* 盒子默认边框 */
$border-width-base: 1Px !default;
$border-style-base: solid !default;
$border-base: $border-width-base $border-style-base $border-color-base !default;
```

### 4.theme

该目录定义项目各个主题下相关模块的样式

```css
/* style/theme/default.scss */
[data-theme='default'] .header {
  background: #FF5777;
}
[data-theme='default'] .footer {
  color: #FF5777;
  border: 2px solid #FF5777;;
}

/* style/theme/cool.scss */
[data-theme='cool'] .header {
  background: #409EFF;
}
[data-theme='cool'] .footer {
  color: #409EFF;
  border: 2px solid #409EFF;;
}
```

我们通过添加html元素上的data-theme属性和值，即可达到项目主题的变换

```html
<!-- Theme.vue -->
<template>
  <div class="theme">
    <div class="header"></div>
    <div class="theme__set">
      <div class="set set--default" @click="changeTheme('default')"></div>
      <div class="set set--cool" @click="changeTheme('cool')"></div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script>
export default {
  name: "Theme",
  setup() {
    const changeTheme = (theme = 'default') => {
      window.document.documentElement.setAttribute("data-theme", theme);
    }
    return {
      changeTheme
    }
  }
}
</script>

<!-- Other.vue -->
<template>
  <div class="about">
    <div class="header"></div>
    <div class="about-title">This is an about page title</div>
    <div class="about-content">This is an about page content</div>
    <div class="footer"></div>
  </div>
</template>
```

### 5.tools

该目录是定义一些全局的公共mixin和function，目前这块内容比较完善就是[SassMagic](https://github.com/W3cplus/SassMagic)，感兴趣的可以点进来看一下。下面简单看一下BEM模式的应用

```scss
$elementSeparator: '__';
$modifierSeparator: '--';

// 判断`$selector`中是否包含BEM中Modify
@function containsModifier($selector) {
  $selector: selectorToString($selector);
  @if str-index($selector, $modifierSeparator) {
    @return true;
  } @else {
    @return false;
  }
}

// 将`$selector`转换成String
@function selectorToString($selector) {
  $selector: inspect($selector); //cast to string
  $selector: str-slice($selector, 2, -2); //remove brackets
  @return $selector;
}

// @param  {String}  $selector
@function getBlock($selector) {
  $selector: selectorToString($selector);
  $modifierStart: str-index($selector, $modifierSeparator) - 1;
  @return str-slice($selector, 0, $modifierStart);
}

@mixin b($block) {
  .#{$block} {
    @content;
  }
}

@mixin e($element) {
  $selector: &;
  @if containsModifier($selector) {
    $block: getBlock($selector);
    @at-root {
      #{$selector} {
        #{$block + $elementSeparator + $element} {
          @content;
        }
      }
    }
  } @else {
    @at-root {
      #{$selector + $elementSeparator + $element} {
        @content;
      }
    }
  }
}

@mixin m($modifier) {
  @at-root {
    #{&}#{$modifierSeparator + $modifier} {
      @content;
    }
  }
}

// @param {string} $block - BEM中的Block
// <div class="block">
//   <div class="block__header">
//     <div class="block__header--css"></div>
//   </div>
// </div>

//  @include b(block) {
//    background: red;
//    @include e(header){
//       font-size: 14px;
//       @include m(css) {
//         font-size: 18px;
//      }
//   };
// }

// 编译后
// .block {
//   background: red;
// }
// .block__header {
//   font-size: 14px;
// }
// .block__header--css {
//   font-size: 18px;
// }
```

> 原文：[https://juejin.cn/post/7058968306048303111](https://juejin.cn/post/7058968306048303111)

## 常见考点

### **1. CSS 架构的基本概念**

- **问题**：<br>
  - 什么是 CSS 架构？为什么需要在项目中构建 CSS 架构？
  - 面对复杂项目，直接写样式会出现什么问题？CSS 架构如何解决这些问题？

### **2. 常见的 CSS 架构方法论**

#### **BEM（Block Element Modifier）**

- **问题**：<br>
  - 什么是 BEM？请解释 Block、Element、Modifier 的含义。
  - BEM 的命名规则是什么？如何在大型项目中保持一致性？
  - BEM 的优缺点是什么？在实际项目中遇到过哪些挑战？
  - 举例：请写出一个按钮组件的 HTML 和 BEM 风格的 CSS。

#### **OOCSS（Object-Oriented CSS）**

- **问题**：<br>
  - 什么是 OOCSS？核心思想是什么？
  - 如何将样式拆分为“结构（Structure）”和“皮肤（Skin）”？
  - 在 OOCSS 中，如何实现组件复用？有什么典型的例子？

#### **SMACSS（Scalable and Modular Architecture for CSS）**

- **问题**：<br>
  - 什么是 SMACSS？SMACSS 提倡将样式分为哪些类别？
  - 在使用 SMACSS 时，如何区分模块化样式与主题样式？
  - SMACSS 与 BEM 的主要区别是什么？

#### **Atomic CSS**

- **问题**：<br>
  - 什么是 Atomic CSS？它的核心思想是什么？
  - 使用原子化 CSS 有哪些优点和缺点？
  - Tailwind CSS 是如何实现原子化的？
  - 面对复杂场景时，Atomic CSS 会不会导致难以维护？如何解决？

#### **ITCSS（Inverted Triangle CSS）**

- **问题**：<br>
  - ITCSS 的核心理念是什么？为什么叫“倒三角”？
  - ITCSS 的层级划分是什么（如全局样式、工具类、组件样式等）？
  - 如何在实际项目中使用 ITCSS？

#### **Utility-First CSS**

- **问题**：<br>
  - 什么是 Utility-First CSS？与传统 CSS 架构相比有何不同？
  - 在使用工具类 CSS（如 Tailwind CSS）时，如何保持样式的可维护性？
  - Utility-First CSS 是否会影响代码的可读性？如何权衡？

### **3. CSS 模块化**

- **问题**：<br>
  - 如何在大型项目中组织 CSS 文件？是否有推荐的目录结构？
  - CSS Modules 是什么？与传统的全局 CSS 有什么不同？
  - 在 CSS Modules 中，如何处理全局样式和模块化样式的冲突？
  - 使用 CSS-in-JS 和模块化 CSS 各有哪些优缺点？

### **4. 代码复用与可维护性**

- **问题**：<br>
  - 如何在 CSS 架构中实现代码复用？Mixin、变量、函数的使用场景有哪些？
  - 在团队协作中，如何制定样式规范以保证样式一致性？
  - 当项目规模变大时，如何避免样式冲突和冗余？

### **5. 响应式设计与适配**

- **问题**：<br>
  - 在 CSS 架构中，如何高效地支持响应式设计？
  - 栅格系统（Grid System）如何在架构中发挥作用？
  - 如何在样式体系中支持多主题（如暗黑模式和浅色模式）？

### **6. 样式的动态化**

- **问题**：<br>
  - 动态样式（如主题切换）如何与 CSS 架构结合？
  - 使用 CSS 变量（Custom Properties）如何提升架构的灵活性？
  - 动态样式切换与预处理器（如 Sass）能否配合使用？

### **7. 架构的性能优化**

- **问题**：<br>
  - 在 CSS 架构中，如何避免样式的层叠和优先级问题导致的性能问题？
  - 如何利用关键路径渲染（Critical Path Rendering）优化首屏加载速度？
  - 使用工具（如 PurgeCSS）清理无用样式时，有哪些注意事项？

### **8. 架构与工具链集成**

- **问题**：<br>
  - 如何在 Webpack、Vite 等工具链中集成 CSS 模块化或预处理器？
  - 使用 PostCSS 时，如何配置插件以支持现代 CSS 特性？
  - 在构建过程中，如何自动化地生成架构规范（如 CSS 命名规则）？

### **9. 代码实践问题**

- **问题**：<br>
  - 如果给你一个已有的样式文件，其中没有任何架构，请设计一个合理的架构来重构。
  - 如何为一个表单组件设计 CSS 架构，使其支持主题切换和响应式设计？
  - 在多团队协作下，如何通过 CSS 架构实现代码风格的统一？

### **10. 架构的迭代与演进**

- **问题**：<br>
  - 随着项目增长，CSS 架构需要不断调整。你是否参与过架构调整？遇到过什么问题？
  - 如果团队中不同成员使用不同的命名规则或框架风格，你会如何规范化？
