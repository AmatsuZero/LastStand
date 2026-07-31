+++
title = "响应式设计"
date = '2024-10-08T00:00:00+08:00'
lastmod = '2024-11-18T00:00:00+08:00'
draft = true
weight = 18
tags = ["面试", "前端", "CSS", "响应式设计", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 引言

响应式布局指的是同一页面在不同屏幕尺寸下有不同的布局。传统的开发方式是PC端开发一套，手机端再开发一套，而使用响应式布局只要开发一套就够，缺点就是`CSS`比较重。下面是博客网站对不同设备适配后的结果，分别是`iPhone5/SE`,`iphone6/7/8`,`iphone 6/7/8 plus`,`ipad pro`,`dell台式宽屏(1440 X 900)`。

> 响应式设计与自适应设计的区别：响应式开发一套界面，通过检测视口分辨率，针对不同客户端在客户端做代码处理，来展现不同的布局和内容；自适应需要开发多套界面，通过检测视口分辨率，来判断当前访问的设备是pc端、平板、手机，从而请求服务层，返回不同的页面。

![](image-01.webp)

![](image-02.webp)

![](image-03.webp)

## 响应式布局的实现方案

### 1. 媒体查询

`CSS3`媒体查询可以让我们针对不同的媒体类型定义不同的样式，当重置浏览器窗口大小的过程中，页面也会根据浏览器的宽度和高度重新渲染页面。

#### 如何选择屏幕大小分割点

如何确定媒体查询的分割点也是一个开发中会遇到的问题，下面是市场上的移动设备和电脑屏幕分辨率的分布情况，可以发现不同品牌和型号的设备屏幕分辨率一般都不一样

![](image-04.webp)

如果我们选择`600px`,`900px`,`1200px`,`1800px`作为分割点，可以适配到常见的14个机型：

![](image-05.webp)

当然这只是其中的一种分割方案，我们还可以这样划分：`480px`,`800px`,`1400px`,`1400px`

![](image-06.webp)

而作为曾经典型的响应式布局框架，`Bootstrap`是怎么进行断点的呢？

![](image-07.webp)

上面的分割方案不一定满足项目中的实际需求，我们可以先用跨度大的分割点进行分割，如果出现不适配的情况可以再根据实际情况增加新的分割点。

#### 移动优先 OR PC优先

不管是移动优先还是PC优先，都是依据当随着屏幕宽度增大或减小的时候，后面的样式会覆盖前面的样式。因此，移动端优先首先使用的是`min-width`，PC端优先使用的`max-width`。

**移动优先:**

```css
/* iphone6 7 8 */
body {
    background-color: yellow;
}
/* iphone 5 */
@media screen and (max-width: 320px) {
    body {
      background-color: red;
    }
}
/* iphoneX */
@media screen and (min-width: 375px) and (-webkit-device-pixel-ratio: 3) {
    body {
      background-color: #0FF000;
    }
}
/* iphone6 7 8 plus */
@media screen and (min-width: 414px) {
    body {
      background-color: blue;
    }
}
/* ipad */
@media screen and (min-width: 768px) {
    body {
      background-color: green;
    }
}
/* ipad pro */
@media screen and (min-width: 1024px) {
    body {
      background-color: #FF00FF;
    }
}
/* pc */
@media screen and (min-width: 1100px) {
    body {
      background-color: black;
    }
}
```

**PC优先：**

```css
/* pc width > 1024px */
    body {
        background-color: yellow;
    }
/* ipad pro */
@media screen and (max-width: 1024px) {
    body {
        background-color: #FF00FF;
    }
}
/* ipad */
@media screen and (max-width: 768px) {
    body {
        background-color: green;
    }
}
/* iphone6 7 8 plus */
@media screen and (max-width: 414px) {
    body {
        background-color: blue;
    }
}
/* iphoneX */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 3) {
    body {
        background-color: #0FF000;
    }
}
/* iphone6 7 8 */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 2) {
    body {
        background-color: #0FF000;
    }
}
/* iphone5 */
@media screen and (max-width: 320px) {
    body {
        background-color: #0FF000;
    }
}
```

### 2.百分比布局

通过百分比单位，可以使得浏览器中组件的宽和高随着浏览器的高度的变化而变化，从而实现响应式的效果。Bootstrap里面的栅格系统就是利用百分比来定义元素的宽高，`CSS3`支持最大最小高，可以将百分比和`max(min)`一起结合使用来定义元素在不同设备下的宽高。

```css
/* pc width > 1100px */
html, body { margin: 0;padding: 0;width: 100%;height: 100%;}
aside {
    width: 10%;
    height: 100%;
    background-color: red;
    float: left;
}
main {
    height: 100%;
    background-color: blue;
    overflow: hidden;
}
/* ipad pro */
@media screen and (max-width: 1024px) {
    aside {
      width: 8%;
      background-color: yellow;
    }
}
/* ipad */
@media screen and (max-width: 768px) {
    aside {
      float: none;
      width: 100%;
      height: 10%;
      background-color: green;
    }
    main {
      height: calc(100vh - 10%);
      background-color: red;
    }
}
/* iphone6 7 8 plus */
@media screen and (max-width: 414px) {
    aside {
      float: none;
      width: 100%;
      height: 5%;
      background-color: yellow;
    }
    main {
      height: calc(100vh - 5%);
      background-color: red;
    }
}
/* iphoneX */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 3) {
    aside {
      float: none;
      width: 100%;
      height: 10%;
      background-color: blue;
    }
    main {
      height: calc(100vh - 10%);
      background-color: red;
    }
}
/* iphone6 7 8 */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 2) {
    aside {
      float: none;
      width: 100%;
      height: 3%;
      background-color: black;
    }
    main {
      height: calc(100vh - 3%);
      background-color: red;
    }
}
/* iphone5 */
@media screen and (max-width: 320px) {
    aside {
      float: none;
      width: 100%;
      height: 7%;
      background-color: green;
    }
    main {
      height: calc(100vh - 7%);
      background-color: red;
    }
}
```

但是我们必须要弄清楚css中子元素的百分比到底是相对谁的百分比。直接上结论吧：

子元素的`height`或`width`中使用百分比，是相对于子元素的直接父元素，`width`相对于父元素的`width`，`height`相对于父元素的`height`；子元素的`top`和`bottom`如果设置百分比，则相对于直接非`static`定位(默认定位)的父元素的高度，同样子元素的`left`和`right`如果设置百分比，则相对于直接非`static`定位(默认定位的)父元素的宽度；子元素的`padding`如果设置百分比，不论是垂直方向或者是水平方向，都相对于直接父亲元素的`width`，而与父元素的`height`无关。跟`padding`一样，`margin`也是如此，子元素的`margin`如果设置成百分比，不论是垂直方向还是水平方向，都相对于直接父元素的`width`；`border-radius`不一样，如果设置`border-radius`为百分比，则是相对于自身的宽度，除了`border-radius`外，还有比如`translate`、`background-size`等都是相对于自身的；

从上述对于百分比单位的介绍我们很容易看出如果全部使用百分比单位来实现响应式的布局，有明显的以下两个缺点：

- 计算困难，如果我们要定义一个元素的宽度和高度，按照设计稿，必须换算成百分比单位。
- 可以看出，各个属性中如果使用百分比，相对父元素的属性并不是唯一的。比如`width`和`height`相对于父元素的`width`和`height`，而`margin`、`padding`不管垂直还是水平方向都相对比父元素的宽度、`border-radius`则是相对于元素自身等等，造成我们使用百分比单位容易使布局问题变得复杂。

### 3.rem布局

`REM`是`CSS3`新增的单位，并且移动端的支持度很高，Android2.x+,ios5+都支持。`rem`单位都是相对于根元素html的`font-size`来决定大小的,根元素的`font-size`相当于提供了一个基准，当页面的size发生变化时，只需要改变`font-size`的值，那么以`rem`为固定单位的元素的大小也会发生响应的变化。 因此，如果通过`rem`来实现响应式的布局，只需要根据视图容器的大小，动态的改变`font-size`即可（而`em`是相对于父元素的）。

**rem响应式的布局思想：**

- 一般不要给元素设置具体的宽度，但是对于一些小图标可以设定具体宽度值
- 高度值可以设置固定值，设计稿有多大，我们就严格有多大
- 所有设置的固定值都用`rem`做单位（首先在HTML总设置一个基准值：`px`和`rem`的对应比例，然后在效果图上获取`px`值，布局的时候转化为`rem`值)
- js获取真实屏幕的宽度，让其除以设计稿的宽度，算出比例，把之前的基准值按照比例进行重新的设定，这样项目就可以在移动端自适应了

**rem布局的缺点：**

在响应式布局中，必须通过js来动态控制根元素`font-size`的大小，也就是说css样式和js代码有一定的耦合性，且必须将改变`font-size`的代码放在`css`样式之前

```javascript
/*上述代码中将视图容器分为10份，font-size用十分之一的宽度来表示，最后在header标签中执行这段代码，就可以动态定义font-size的大小，从而1rem在不同的视觉容器中表示不同的大小，用rem固定单位可以实现不同容器内布局的自适应。*/
function refreshRem() {
    var docEl = doc.documentElement;
    var width = docEl.getBoundingClientRect().width;
    var rem = width / 10;
    docEl.style.fontSize = rem + 'px';
    flexible.rem = win.rem = rem;
}
win.addEventListener('resize', refreshRem);
```

`REM`布局也是目前多屏幕适配的最佳方式。默认情况下我们html标签的`font-size`为16px,我们利用媒体查询，设置在不同设备下的字体大小。

```javascript
/* pc width > 1100px */
html{ font-size: 100%;}
body {
    background-color: yellow;
    font-size: 1.5rem;
}
/* ipad pro */
@media screen and (max-width: 1024px) {
    body {
      background-color: #FF00FF;
      font-size: 1.4rem;
    }
}
/* ipad */
@media screen and (max-width: 768px) {
    body {
      background-color: green;
      font-size: 1.3rem;
    }
}
/* iphone6 7 8 plus */
@media screen and (max-width: 414px) {
    body {
      background-color: blue;
      font-size: 1.25rem;
    }
}
/* iphoneX */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 3) {
    body {
      background-color: #0FF000;
      font-size: 1.125rem;
    }
}
/* iphone6 7 8 */
@media screen and (max-width: 375px) and (-webkit-device-pixel-ratio: 2) {
    body {
      background-color: #0FF000;
      font-size: 1rem;
    }
}
/* iphone5 */
@media screen and (max-width: 320px) {
    body {
      background-color: #0FF000;
      font-size: 0.75rem;
    }
}
```

### 4.视口单位

`css3`中引入了一个新的单位`vw/vh`，与视图窗口有关，`vw`表示相对于视图窗口的宽度，`vh`表示相对于视图窗口高度，除了`vw`和`vh`外，还有`vmin`和`vmax`两个相关的单位。各个单位具体的含义如下：

| 单位 | 含义 |
| --- | --- |
| vw | 相对于视窗的宽度，1vw 等于视口宽度的1%，即视窗宽度是100vw |
| vh | 相对于视窗的高度，1vh 等于视口高度的1%，即视窗高度是100vh |
| vmin | vw和vh中的较小值 |
| vmax | vw和vh中的较大值 |

![](image-08.webp)

用视口单位度量，视口宽度为100vw，高度为100vh（左侧为竖屏情况，右侧为横屏情况）。例如，在桌面端浏览器视口尺寸为650px，那么 1vw = 650 * 1% = 6.5px（这是理论推算的出，如果浏览器不支持0.5px，那么实际渲染结果可能是7px）。

那么vw或者vh很类似百分比单位。vw和%的区别为：

| 单位 | 含义 |
| --- | --- |
| % | 大部分相对于祖先元素，也有相对于自身的情况比如（border-radius、translate等) |
| vw/vh | 相对于视窗的尺寸 |

从对比中我们可以发现，`vw`单位与百分比类似，单确有区别，前面我们介绍了百分比单位的换算困难，这里的`vw`更像"理想的百分比单位"。任意层级元素，在使用`vw`单位的情况下，1vw都等于视图宽度的百分之一。

使用视口单位来实现响应式有两种做法：

##### 1.仅使用vw作为CSS单位

-  对于设计稿的尺寸转换为为单位，我们使用`Sass`函数编译<br>
```css
//iPhone 6尺寸作为设计稿基准
$vm_base: 375;
@function vw($px) {
    @return ($px / 375) * 100vw;
}
```
-  无论是文本还是布局宽度、间距等都使用`vw`作为单位<br>
```css
.mod_nav {
    background-color: #fff;
    &_list {
        display: flex;
        padding: vm(15) vm(10) vm(10); // 内间距
        &_item {
            flex: 1;
            text-align: center;
            font-size: vm(10); // 字体大小
            &_logo {
                display: block;
                margin: 0 auto;
                width: vm(40); // 宽度
                height: vm(40); // 高度
                img {
                    display: block;
                    margin: 0 auto;
                    max-width: 100%;
                }
            }
            &_name {
                margin-top: vm(2);
            }
        }
    }
}
```
-  1物理像素线（也就是普通屏幕下1px,高清屏幕下0.5px的情况）采用`transform`属性`scale`实现<br>
```css
.mod_grid {
    position: relative;
    &::after {
        // 实现1物理像素的下边框线
        content: '';
        position: absolute;
        z-index: 1;
        pointer-events: none;
        background-color: #ddd;
        height: 1px;
        left: 0;
        right: 0;
        top: 0;
        @media only screen and (-webkit-min-device-pixel-ratio: 2) {
            -webkit-transform: scaleY(0.5);
            -webkit-transform-origin: 50% 0%;
        }
    }
    ...
}
```
-  对于需要保持宽高比的图，应该用`padding-top`实现<br>
```css
.mod_banner {
    position: relative;
    padding-top: percentage(100/700); // 使用padding-top
    height: 0;
    overflow: hidden;
    img {
        width: 100%;
        height: auto;
        position: absolute;
        left: 0;
        top: 0;
    }
}
```

##### 2.搭配vw和rem

虽然采用`vw`适配后的页面效果很好，但是它是利用视口单位实现的布局，依赖视口大小而自动缩放，无论视口过大还是过小，它也随着时候过大或者过小，失去了最大最小宽度的限制，此时我们可以结合`rem`来实现布局

-  给根元素大小设置随着视口变化而变化的`vw`单位，这样就可以实现动态改变其大小
-  限制根元素字体大小的最大最小值，配合`body`加上最大宽度和最小宽度<br>
```css
// rem 单位换算：定为 75px 只是方便运算，750px-75px、640-64px、1080px-108px，如此类推
$vm_fontsize: 75; // iPhone 6尺寸的根元素大小基准值
@function rem($px) {
     @return ($px / $vm_fontsize ) * 1rem;
}
// 根元素大小使用 vw 单位
$vm_design: 750;
html {
    font-size: ($vm_fontsize / ($vm_design / 2)) * 100vw;
    // 同时，通过Media Queries 限制根元素最大最小值
    @media screen and (max-width: 320px) {
        font-size: 64px;
    }
    @media screen and (min-width: 540px) {
        font-size: 108px;
    }
}
// body 也增加最大最小宽度限制，避免默认100%宽度的 block 元素跟随 body 而过大过小
body {
    max-width: 540px;
    min-width: 320px;
}
```

### 5.图片响应式

这里的图片响应式包括两个方面，一个就是大小自适应，这样能够保证图片在不同的屏幕分辨率下出现压缩、拉伸的情况；一个就是根据不同的屏幕分辨率和设备像素比来尽可能选择高分辨率的图片，也就是当在小屏幕上不需要高清图或大图，这样我们用小图代替，就可以减少网络带宽了。

##### 1.使用max-width（图片自适应）:

图片自适应意思就是图片能随着容器的大小进行缩放，可以采用如下代码：

```css
img {
    display: inline-block;
    max-width: 100%;
    height: auto;
}
```

`inline-block` 元素相对于它周围的内容以内联形式呈现，但与内联不同的是，这种情况下我们可以设置宽度和高度。 `max-width`保证了图片能够随着容器的进行等宽扩充（即保证所有图片最大显示为其自身的 100%。此时，如果包含图片的元素比图片固有宽度小，图片会缩放占满最大可用空间），而`height`为`auto`可以保证图片进行等比缩放而不至于失真。如果是背景图片的话要灵活运用`background-size`属性。

那么为什么不能用`width：100%`呢？因为这条规则会导致它显示得跟它的容器一样宽。在容器比图片宽得多的情况下，图片会被无谓地拉伸。

##### 2.使用srcset

```javascript
<img srcset="photo_w350.jpg 1x, photo_w640.jpg 2x" src="photo_w350.jpg" alt="">
```

如果屏幕的dpi = 1的话则加载1倍图，而dpi = 2则加载2倍图，手机和mac基本上dpi都达到了2以上，这样子对于普通屏幕来说不会浪费流量，而对于视网膜屏来说又有高清的体验。

如果浏览器不支持`srcset`，则默认加载src里面的图片。

但是你会发现实际情况并不是如此，在Mac上的Chrome它会同时加载`srcset`里面的那张2x的，还会再去加载src里面的那张，加载两张图片。顺序是先把所有`srcset`里面的加载完了，再去加载src的。这个策略比较奇怪，它居然会加载两张图片，如果不写src，则不会加载两张，但是兼容性就没那么好。这个可能是因为浏览器认为，既然有`srcset`就不用写src了，如果写了src，用户可能是有用的。而使用`picture`就不会加载两张

##### 3.使用background-image

```css
.banner{
  background-image: url(/static/large.jpg);
}

@media screen and (max-width: 767px){
  background-image: url(/static/small.jpg);
}
```

##### 4.使用picture标签

[picturefill.min.js](https://scottjehl.github.io/picturefill/) ：解决IE等浏览器不支持 的问题

```javascript
<picture>
    <source srcset="banner_w1000.jpg" media="(min-width: 801px)">
    <source srcset="banner_w800.jpg" media="(max-width: 800px)">
    <img src="banner_w800.jpg" alt="">
</picture>

<!-- picturefill.min.js 解决IE等浏览器不支持 <picture> 的问题 -->
<script type="text/javascript" src="js/vendor/picturefill.min.js"></script>
```

`picture`必须要写img标签，否则无法显示，对`pictur`e的操作最后都是在img上面，例如onload事件是在img标签触发的，`picture`和`source`是不会进行layout的，它们的宽和高都是0。

另外使用`source`，还可以对图片格式做一些兼容处理：

```javascript
<picture>
    <source type="image/webp" srcset="banner.webp">
    <img src="banner.jpg" alt="">
</picture>
```

**总结**：响应式布局的实现可以通过媒体查询+`px`,媒体查询+百分比，媒体查询+`rem`+`js`,`vm/vh`,`vm/vh` +`rem`这几种方式来实现。但每一种方式都是有缺点的，媒体查询需要选取主流设备宽度尺寸作为断点针对性写额外的样式进行适配，但这样做会比较麻烦，只能在选取的几个主流设备尺寸下呈现完美适配，另外用户体验也不友好，布局在响应断点范围内的分辨率下维持不变，而在响应断点切换的瞬间，布局带来断层式的切换变化，如同卡带的唱机般“咔咔咔”地一下又一下。通过百分比来适配首先是计算麻烦，第二各个属性中如果使用百分比，其相对的元素的属性并不是唯一的，这样就造成我们使用百分比单位容易使布局问题变得复杂。通过采用`rem`单位的动态计算的弹性布局，则是需要在头部内嵌一段脚本来进行监听分辨率的变化来动态改变根元素字体大小，使得`CSS`与`JS` 耦合了在一起。通过利用纯`css`视口单位实现适配的页面，是既能解决响应式断层问题，又能解决脚本依赖的问题的，但是兼容性还没有完全能结构接受。

## 响应式布局的成型方案

现在的css，UI框架等都已经考虑到了适配不同屏幕分辨率的问题，实际项目中我们可以直接使用这些新特性和框架来实现响应式布局。可以有以下选择方案：

- 利用上面的方法自己来实现，比如CSS3 Media Query,rem，vw等
- Flex弹性布局，兼容性较差
- Grid网格布局，兼容性较差
- Columns栅格系统，往往需要依赖某个UI库，如Bootstrap

## 响应式布局的要点

在实际项目中，我们可能需要综合上面的方案，比如用`rem`来做字体的适配，用`srcset`来做图片的响应式，宽度可以用`rem`，`flex`，栅格系统等来实现响应式，然后可能还需要利用媒体查询来作为响应式布局的基础，因此综合上面的实现方案，项目中实现响应式布局需要注意下面几点：

- 设置viewport
- 媒体查询
- 字体的适配（字体单位）
- 百分比布局
- 图片的适配（图片的响应式）
- 结合flex，grid，BFC，栅格系统等已经成型的方案

## 常见考点

### 1. **响应式设计概念**

- 请简述什么是响应式设计？为什么需要响应式设计？
- 响应式设计与自适应设计有什么区别？它们各自的优缺点是什么？

### 2. **响应式设计的核心原则**

- 响应式设计的基本原则是什么？如何实现内容在不同设备上自动适应？
- 请解释 **流式布局**（fluid layouts）、**弹性盒布局**（flexible grids）和 **媒体查询**（media queries）在响应式设计中的作用。

### 3. **媒体查询**

- 请解释什么是媒体查询，它是如何工作的？它的基本语法是什么？
- 如何使用媒体查询针对不同的设备尺寸（如手机、平板、桌面等）应用不同的样式？
- 请举例说明常用的媒体查询条件，如 `max-width`、`min-width`，以及如何针对不同的视口宽度来修改布局。
- 你如何使用媒体查询来实现不同屏幕大小上的字体和间距调整？

### 4. **视口单位**

- 请解释视口单位（如 `vw`、`vh`、`vmin`、`vmax`）在响应式设计中的应用。
- 如何利用视口单位实现响应式布局中的自适应元素尺寸？

### 5. **弹性布局（Flexbox）与 Grid**

- 如何使用 **Flexbox** 布局来实现响应式设计？请举例说明如何通过调整 `flex` 和 `align-items` 来适应不同设备尺寸。
- CSS Grid 与 Flexbox 在响应式设计中的应用场景有什么不同？请举例说明如何用 Grid 创建自适应的布局。

### 6. **图片响应式设计**

- 如何在响应式设计中处理图片的显示，以适应不同的屏幕分辨率？
- 请解释 `srcset` 和 `sizes` 属性的作用，它们是如何帮助实现响应式图片的？
- 你如何使用 `picture` 元素来为不同的设备选择不同的图片格式或分辨率？

### 7. **移动优先与桌面优先**

- 请解释 **移动优先设计**（mobile-first）和 **桌面优先设计**（desktop-first）的区别及其各自的优势。
- 在实际开发中，你如何决定使用哪种方法来进行响应式设计？
- 移动优先设计时，如何通过媒体查询逐步扩展到更大的屏幕（例如从手机到平板、桌面）？

### 8. **弹性字体与视口单位**

- 如何使用 CSS 设置弹性字体，确保文本在不同设备上保持可读性？
- 如何使用 `rem`, `em` 或视口单位（如 `vw` 和 `vh`）来创建响应式字体？

### 9. **响应式设计的测试与调试**

- 如何在开发过程中测试响应式设计的效果？你是否有过使用开发者工具进行模拟不同设备的经验？
- 在测试响应式页面时，你如何确保元素在不同屏幕尺寸下的正确显示和布局？

### 10. **常见的响应式设计问题**

- 在实际开发中，响应式设计可能会遇到哪些常见的挑战？你如何解决这些问题？<br>
  - 例如：元素重叠、字体过小、布局错乱、图片加载慢等问题。
- 当你遇到布局不适应或不稳定的问题时，如何进行调试和优化？

### 11. **CSS Frameworks**

- 你是否使用过响应式设计框架（如 **Bootstrap** 或 **Foundation**）？它们如何帮助加速响应式布局的开发？
- 请简述你使用过的框架在响应式设计中的优势与局限性。
- 如果不使用框架，你如何手动实现响应式设计？

### 12. **响应式设计中的性能优化**

- 如何优化响应式设计中的性能，特别是在移动设备上？
- 在响应式设计中，如何通过图片、字体、JavaScript 等资源的加载优化提高页面的响应速度？

### 13. **视差滚动与响应式设计**

- 视差滚动（parallax scrolling）效果在响应式设计中的应用有什么挑战？你如何保证在不同设备上实现良好的体验？
- 如何处理视差效果中的元素定位与滚动，在不同分辨率下保持平滑效果？

### 14. **实际案例**

- 请描述一个你使用响应式设计的项目。你是如何确保该项目在手机、平板和桌面上都有良好表现的？
- 在某个实际项目中，你遇到过哪些特定的响应式设计问题？你是如何解决这些问题的？

### 15. **现代响应式设计技术**

- 请介绍一些响应式设计的现代技术，如 **CSS Container Queries**、**CSS Logical Properties**，以及它们在响应式设计中的应用。
- 如何利用这些新技术实现更加灵活和精确的布局？
