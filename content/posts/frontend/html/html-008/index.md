+++
title = "响应式图片"
date = '2024-09-27T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = false
weight = 8
tags = ["面试", "前端", "HTML", "响应式图片", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
响应式是指实现不同屏幕分辨率的终端上浏览网页的不同展示方式。

本知识点的主要内容有：

- 为什么要使用响应式图片
- 怎么实现响应式图片

## 1、为什么要使用响应式图片

假如有一张图片的显示宽度为200px，那么，它在 `1x`（即设备像素比为 1 的显示器） 的显示器上，是占了 200 个物理像素（即实际所占的像素）；它在 `2x` 的显示器上，实际上是占了 400 个物理像素；在 `3x` 的显示器上，实际上是占了 600 个物理像素；在 `4x` 的显示器上就是占了 800 个物理像素。

如果这个图片只提供 200 像素的尺寸，那么在 `2x~4x` 的显示器上看起来就很模糊。如果只提供 800 像素的版本，那么在 `1x~3x` 的设备上会显得多余，因为加载时间会相较长，所以我们要使用响应式图片。

再比如一个场景，相同的banner，在电脑上需要使用大图，但是手机上面使用小图，不然会造成手机上加载慢浪费流量等问题，这也可以使用响应式图片来解决。

## 2、实现方法

### css3 media query

一个办法是使用`backgound-image`结合媒体查询，如下所示：

```bash
.banner{
  background-image: url(/static/large.jpg);
}

@media screen and (max-width: 767px){
  background-image: url(/static/small.jpg);
}
```

这种方法的缺点是对SEO不太友好，因为如果使用img标签还可以写个alt属性。

### picture标签

```html
<picture>
    <source srcset="banner_w1000.jpg" media="(min-width: 801px)">
    <source srcset="banner_w800.jpg" media="(max-width: 800px)">
    <img src="banner_w800.jpg" alt="">
</picture>
```

如上，如果页面宽度大于800px（PC），则加载大图，而在手机上加载小图。这样写浏览器就只会加载source里面的一张图片。但是如果是用js动态插进去的，它还是会去加载两张，只有写在html里面加载初始化页面的时候才只加载一张。

picture必须要写img标签，否则无法显示，对picture的操作最后都是在img上面，例如onload事件是在img标签触发的，picture和source是不会进行layout的，它们的宽和高都是0。

另外使用source，还可以对图片格式做一些兼容处理：

```bash
<picture>
    <source type="image/webp" srcset="banner.webp">
    <img src="banner.jpg" alt="">
</picture>
```

webp在保持同等清晰度的情况下，体积可以减少一半，但是目前只有Chrome支持，Safari和firefox一直处于实验阶段，所以其它的浏览器如firefox将会加载jpg格式的照片：

### srcset

`srcset`是HTML5中`img`元素的一个属性，用于指定一组备选图像，并告诉浏览器根据设备的特性选择最合适的图像进行显示。

属性格式：图片地址 宽度描述w 像素密度描述x，多个资源之间用逗号分隔。

例如：

```bash
<img src="small.jpg " srcset="big.jpg 1440w, middle.jpg 800w, small.jpg 1x" />
```

表示浏览器宽度达到 800px 则加载 middle.jpg ，达到 1400px 则加载 big.jpg。

注意：像素密度描述只对固定宽度图片有效。

img 元素的 size 属性给浏览器提供一个预估的图片显示宽度。

属性格式：媒体查询 宽度描述（支持px），多条规则用逗号分隔。

```bash
<img src="images/gun.png"
         srcset="images/bg_star.jpg 1200w, images/share.jpg 800w, images/gun.png 320w"
         sizes="(max-width: 320px) 300w, 1200w"/>
```

上面的例子表示浏览器视口为 320px 时图片宽度为 300px，其他情况为 1200px。

### image-set

css属性`image-set()`支持根据用户分辨率适配图像。

```bash
body {
    background-image: -webkit-image-set( url(../images/pic-1.jpg) 1x, url(../images/pic-2.jpg) 2x, url(../images/pic-3.jpg) 600dpi);
    background-image:         image-set( url(../images/pic-1.jpg) 1x, url(../images/pic-2.jpg) 2x, url(../images/pic-3.jpg) 600dpi);
}
```

上面代码将会为普通屏幕使用 pic-1.jpg，为高分屏使用 pic-2.jpg，如果更高的分辨率则使用 pic-3.jpg，比如印刷。

不过，`image-set()` 的支持情况不如 `srcset` 和 `<picture>` 元素广泛，在使用时需注意兼容性。

## 常见考点

1.  **响应式设计的概念**：<br>
  - 理解什么是响应式设计，为什么在现代网页中重要。
2.  **常用的实现方法**：<br>
  - 讨论不同的实现方式，如使用 CSS（`max-width`）、`<picture>` 元素、`srcset` 和 `image-set()`。
3.  **浏览器兼容性**：<br>
  - 了解不同方法的浏览器支持情况，特别是 `image-set()` 和 `<picture>`。
4.  **性能优化**：<br>
  - 如何选择合适的图片格式和大小以优化加载速度和用户体验。
5.  **设备像素比（DPR）**：<br>
  - 理解设备像素比的概念以及如何利用它来加载适合的图像。
6.  **图像懒加载**：<br>
  - 讨论懒加载技术，如何推迟图像的加载以提高页面性能。
7.  **SEO 和可访问性**：<br>
  - 了解如何为响应式图片提供替代文本和其他 SEO 最佳实践。
