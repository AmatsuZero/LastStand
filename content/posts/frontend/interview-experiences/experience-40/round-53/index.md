+++
title = "360集团-24年-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "360集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/40"
experienceId = 40
roundId = 53
roundOrder = 1
company = "360集团"
date = "2025-07-09T08:05:48.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-40/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本次面试主要考察校招生的前端基础内容和项目经验。

本轮共 20 道题。答案默认折叠，便于先自行作答。

## 1. 前端学习路径 {#question-subjective-8af01cadfebb}

### 题目要点

* 本题为主观题，没有标准答案，主要考察候选人的学习能力、知识体系构建能力以及持续学习的动力。
* 面试官希望了解候选人获取新知识、解决问题的途径和习惯，以及对前端知识的理解是否系统、全面。
* 建议回答结构：我的前端启蒙与基础学习阶段 → 深入学习特定框架/技术 → 通过项目实践巩固与提升 → 持续学习与关注前沿技术。

<details>
<summary>参考答案</summary>

我的前端学习路径可以分为几个阶段。最初，我对互联网技术充满好奇，通过[提及学习方式，例如：慕课网上的入门课程和MDN文档]开始了前端的启蒙。在这个阶段，我扎实掌握了HTML、CSS和JavaScript这"三驾马车"的基础知识，理解了DOM操作、盒模型、BFC等核心概念。为了更好地实践，我还搭建了一些简单的静态页面和交互功能，这让我对前端有了初步的认识。

随着学习的深入，我意识到框架在大型项目开发中的重要性。我选择了[提及选择的框架，例如：React作为第一个深入学习的框架]，因为它在业界应用广泛且社区活跃。我通过[提及学习方式，例如：阅读官方文档、跟随开源项目教程，以及阅读《React设计模式与最佳实践》等书籍]，系统学习了React的组件化思想、生命周期、Hooks、状态管理（如Redux或Context API）等。为了融会贯通，我模仿并实现了一些[提及实践项目，例如：电商网站的商品详情页、用户管理后台界面]，并在其中积极实践了组件复用和性能优化。

在掌握React后，我又学习了Vue，主要是为了拓宽技术栈，了解不同框架的设计哲学。通过对比学习，我能更好地理解它们在数据响应式、模板语法、生态系统等方面的差异，这让我在技术选型时能有更全面的考量。项目实践是检验学习成果的最佳方式，我总是尝试将所学知识应用到实际项目中，例如[提及具体项目中的实践，例如：在一个数据可视化项目中，我负责了图表组件的封装和数据渲染优化，并解决了跨域请求等问题]，通过解决实际问题来加深理解和提升能力。

此外，我始终保持持续学习的习惯。我关注前端技术社区，如GitHub Trending、掘金、知乎专栏等，定期阅读技术博客和行业报告，了解最新的前端趋势和技术发展，比如[提及关注的新技术，例如：WebAssembly、微前端、Serverless等]。我认为前端技术发展迅速，只有不断学习和实践，才能保持竞争力。当遇到新的技术挑战时，我通常会先查阅官方文档，然后搜索相关的技术文章和社区讨论，如果依然无法解决，会向有经验的同事或社区前辈请教。这个过程不仅帮助我解决了问题，也锻炼了我独立思考和解决问题的能力。

</details>

## 2. 你提到对React和Vue都了解，对比两者的差异？在项目中如何选择？ {#question-subjective-db69e6e99255}

### 题目要点

* 框架基础掌握：确认候选人对React和Vue两大主流前端框架的核心概念、工作原理有深入理解。
* 异同点辨析：考察候选人能否准确对比两者在数据管理、模板语法、生态系统等方面的差异。
* 项目选型能力：评估候选人是否具备根据项目需求、团队情况等因素，合理选择技术栈的决策能力。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

React和Vue都是目前主流的前端UI框架，用于构建用户界面。它们都采用了组件化的开发思想和虚拟DOM技术来提高开发效率和性能。

*   **React：** React是一个由Facebook开发的用于构建用户界面的JavaScript库。它强调"一次学习，随处编写"，以其声明式视图、组件化、以及单向数据流而闻名。React的核心是JSX（JavaScript XML），一种允许在JavaScript中编写类似HTML结构的语法，这使得UI的逻辑和视图紧密结合。React的更新机制是基于状态的变化，当组件状态更新时，React会创建一个新的虚拟DOM树，然后与旧的虚拟DOM树进行对比（diff算法），最后只更新真实DOM中发生变化的部分。
*   **Vue：** Vue是一个渐进式JavaScript框架，用于构建用户界面。它被设计为可以自底向上逐层应用。Vue的核心库只关注视图层，易于上手，同时也方便与其他库或现有项目整合。Vue的主要特点包括双向数据绑定、基于HTML的模板语法（也可以使用JSX）、组件化以及响应式系统。Vue的响应式系统基于`Object.defineProperty`（Vue 2.x）或Proxy（Vue 3.x），能够追踪数据的变化并自动更新视图。

**相关概念之间的联系和区别：**

*   **共同点：**
    *   **组件化：** 两者都提倡组件化开发，将UI拆分为独立的、可复用的组件。
    *   **虚拟DOM：** 都使用虚拟DOM来提高性能，减少直接操作真实DOM的开销。
    *   **响应式：** 都提供了响应式的数据绑定机制，数据变化时视图自动更新。
    *   **生态系统：** 都拥有庞大且活跃的社区，提供丰富的工具、库和插件。
*   **区别：**
    *   **数据流：** React推崇单向数据流（从父组件到子组件），而Vue支持双向数据绑定（v-model），使得表单处理等场景更为便捷。
    *   **模板语法：** React倾向于使用JSX，将HTML和JS逻辑写在一起；Vue默认使用基于HTML的模板语法，通过指令（如`v-if`, `v-for`）增强HTML功能，也可以选择使用JSX或渲染函数。
    *   **状态管理：** React通常结合Redux或Context API进行状态管理；Vue有官方的Vuex。两者都有各自的解决方案来管理复杂应用的状态。
    *   **学习曲线：** 通常认为Vue的学习曲线相对平缓，对前端新手更友好；React由于其JSX和函数式编程的理念，可能需要一定的学习成本。
    *   **性能优化：** Vue的响应式系统在很多情况下能自动进行细粒度的更新，减少开发者手动优化的工作；React的性能优化则更多依赖于`shouldComponentUpdate`、`React.memo`等手动优化手段。

##### 1.2 核心用法 + 示例代码（如题目涉及）

由于题目是对比差异和选择，这里主要通过对比说明其在项目中的选择场景：

**在项目中如何选择？**

选择React还是Vue，通常没有绝对的优劣之分，更多是基于项目具体需求、团队技术栈、开发习惯和生态系统考量：

*   **项目规模和复杂度：**
    *   **小型到中型项目：** Vue通常是一个很好的选择，其上手快，开发效率高，特别适合快速迭代和MVP开发。
    *   **大型或企业级应用：** React在大型应用中表现出色，其灵活的架构和丰富的第三方库使其能够应对复杂的业务逻辑和性能要求。
*   **团队技术栈和经验：**
    *   如果团队成员更熟悉原生JavaScript或对HTML模板更习惯，Vue可能更容易被接受。
    *   如果团队有Java或C#等后端背景，或对函数式编程、组件化、JSX等概念有一定了解，React可能更容易上手。
*   **生态系统和社区支持：**
    *   **React：** 拥有庞大的生态系统，围绕React有大量的第三方库、工具和解决方案（如Next.js用于SSR，React Native用于移动端）。
    *   **Vue：** 也有非常活跃的社区和完善的官方支持，其官方库（如Vue Router, Vuex, Vite）功能强大且易于集成。
*   **特定需求：**
    *   如果项目需要高度定制化的动画或更灵活的UI控制，React的JSX可能提供更大的自由度。
    *   如果强调快速原型开发、表单处理等场景，Vue的双向绑定和简洁的模板语法可能更有优势。
    *   如果需要服务端渲染（SSR），两者都有成熟的解决方案（React的Next.js，Vue的Nuxt.js）。
*   **长期维护和趋势：**
    *   两者都在持续发展，都有大公司支持。React的Facebook背景和Vue的独立开源社区使其发展路径不同，但都保持着强劲的生命力。

**示例代码（简要展示风格差异）：**

**React组件示例 (JSX):**

```jsx
// src/components/Counter.jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default Counter;
```

**Vue组件示例 (Template):**

```html
<!-- src/components/Counter.vue -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>

<style scoped>
/* 样式 */
</style>
```

##### 1.3 常见误区或面试陷阱

*   **性能误区：** 很多人会简单地认为虚拟DOM一定比直接操作真实DOM快，或者Vue比React性能更好。实际上，这取决于具体的应用场景和优化手段。在某些复杂场景下，频繁的虚拟DOM diff操作也可能成为性能瓶颈。重要的是理解虚拟DOM的原理及其优化机制，而不是盲目认为它总是最优解。
*   **单向/双向绑定混淆：** 混淆React的单向数据流和Vue的双向数据绑定。面试中可能要求解释为什么React不直接支持双向绑定，或者Vue双向绑定的实现原理。
*   **生命周期/钩子函数理解不透彻：** 很多候选人只停留在记住生命周期名称，但对其在实际应用中的作用、触发时机、以及在不同框架中的对应关系理解不深入。
*   **生态系统理解不足：** 仅仅知道框架本身，而对围绕框架的路由器、状态管理、构建工具等生态组件缺乏了解，无法在实际项目中进行技术选型。
*   **选择原因过于片面：** 在选择框架时，只强调个人喜好或某个单一优势，而没有从项目、团队、未来维护等多个维度进行综合考量。例如，只说"Vue易上手"而忽略其在大规模应用中的可维护性挑战，或只说"React社区大"而未考虑团队是否能驾驭其灵活性。

</details>

## 3. 介绍项目中如何应用Amaze UI实现跨屏适配 {#question-subjective-b9e24b982853}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● 响应式设计原理：考察候选人对媒体查询、流式布局、弹性图片等响应式核心技术的理解。

● UI框架实践：验证候选人如何利用前端UI框架（如Amaze UI的网格系统、组件）高效实现跨屏适配。

● 项目问题解决：了解候选人能否结合具体项目，阐述在跨屏适配过程中遇到的挑战、技术选型理由及解决方案。

● 性能与用户体验：评估候选人在实现适配时，是否考虑了不同设备下的资源加载性能和用户体验优化。

● 该题所考知识点中有哪些高频实际应用点？

● **网格系统应用：** 如何基于UI框架的栅格系统快速构建响应式布局，实现不同屏幕下的内容排列。

● **组件自适应：** 利用框架提供的响应式组件，或者通过自定义CSS使组件在不同设备上表现良好。

● **图片与媒体适配：** 针对不同屏幕尺寸加载不同分辨率图片，或优化媒体元素的显示。

● **性能考量：** 在适配过程中，如何通过懒加载、图片优化等手段提升页面加载速度和渲染性能。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

"跨屏适配"通常指的是**响应式网页设计（Responsive Web Design, RWD）**，其核心理念是让网站能够根据用户设备的屏幕尺寸、分辨率和方向等特性，自动调整布局、内容和功能，以提供最佳的用户体验。这与为每个设备单独开发不同版本网站的方式形成对比，RWD通过一套代码适应所有设备。

实现响应式设计的主要技术手段包括：
*   **媒体查询（Media Queries）：** 根据设备的特性（如屏幕宽度、高度、设备方向等）应用不同的CSS样式。
*   **流式布局（Fluid Grids）：** 使用百分比而不是固定像素来定义元素的宽度，使布局能够灵活伸缩。
*   **弹性图片（Flexible Images）：** 图片宽度设置为百分比，使其能随容器大小调整，配合`srcset`和`sizes`属性可实现响应式图片加载。
*   **Flexbox和Grid布局：** 现代CSS布局方式，能够更灵活、高效地实现复杂的响应式布局。

**Amaze UI**作为一款轻量级、面向HTML5的国产前端UI框架，它将上述响应式设计原则集成到其核心架构中。它提供了一套开箱即用的响应式网格系统和预设的UI组件，极大地简化了前端开发者在不同设备上进行布局适配的工作。它通过预定义的CSS类和少量的JavaScript，帮助开发者快速构建兼容PC、平板和手机的界面，从而解决了传统开发中为不同设备编写多套CSS代码的繁琐和维护成本高的问题。

##### 1.2 核心用法 + 示例代码（如题目涉及）

在[项目名称，例如：某电商平台的移动端营销活动页]中，我们主要利用Amaze UI的以下特性来实现跨屏适配：

1.  **响应式网格系统：**
    Amaze UI提供了一套基于12列的栅格系统，通过`am-u-{device}-{cols}`的CSS类来控制元素在不同设备（`sm` - 小屏幕/手机, `md` - 中屏幕/平板, `lg` - 大屏幕/PC）上的列宽。例如，在一个产品展示区域，我们希望在手机端每行显示1个产品，在平板上显示2个，在PC上显示4个。我们可以这样布局：

    ```html
    <div class="am-g"> <!-- Amaze UI的行容器 -->
      <div class="am-u-sm-12 am-u-md-6 am-u-lg-3">
        <div class="product-item">产品A</div>
      </div>
      <div class="am-u-sm-12 am-u-md-6 am-u-lg-3">
        <div class="product-item">产品B</div>
      </div>
      <!-- 更多产品项... -->
    </div>
    &lt;style&gt;
      .product-item {
        border: 1px solid #ccc;
        padding: 15px;
        text-align: center;
        margin-bottom: 10px;
      }
    &lt;/style&gt;
    ```
    通过这种方式，我们无需手动编写大量媒体查询，只需通过简单的类名组合，即可实现复杂的响应式布局。

2.  **响应式组件和媒体查询辅助：**
    Amaze UI的许多内置组件本身就具备响应式特性。例如，它的导航组件在小屏幕下会自动折叠成汉堡菜单，而在大屏幕下则展开为横向导航条。对于一些需要更精细控制的场景，我们也会结合CSS的媒体查询进行微调，以覆盖框架的默认行为或添加特定样式。例如，调整某个文字在小屏幕下的字号：

    ```css
    .my-title {
      font-size: 20px;
    }
    @media only screen and (max-width: 640px) { /* Amaze UI sm-only breakpoint */
      .my-title {
        font-size: 16px;
        padding: 5px 10px; /* 调整内边距 */
      }
    }
    ```

3.  **图片懒加载与自适应：**
    在营销活动页中，图片资源非常多。我们采用了Amaze UI结合的图片懒加载方案，并配合`data-am-media`属性来提供不同分辨率的图片。当用户滚动到图片区域时才加载，并根据屏幕尺寸加载合适的图片，避免了不必要的带宽消耗。

    ```html
    <img class="am-img-responsive" data-am-src="path/to/small-image.jpg" data-am-media="(max-width: 640px)" src="path/to/large-image.jpg" alt="Responsive Image">
    ```
    这里，`am-img-responsive`确保图片宽度自适应容器，`data-am-media`则根据媒体查询加载不同图片。

**优势总结：**
*   **提升开发效率：** 预设的网格系统和组件大大减少了手动编写响应式CSS的工作量。
*   **统一规范：** 框架提供了统一的设计语言和组件行为，保证了不同模块和页面的一致性。
*   **移动优先：** Amaze UI设计理念倾向移动端，使其在H5等移动优先场景表现突出。
*   **优化用户体验：** 页面在各种设备上都能以友好的方式呈现，提升了用户满意度。

##### 1.3 常见误区或面试陷阱

*   **只停留在框架层面：** 仅仅知道Amaze UI能做响应式，但无法深入解释其底层如何实现（如媒体查询、百分比布局等），或者不清楚为何要使用这些技术。
*   **忽略`meta viewport`：** 忘记在HTML头部设置正确的`meta name="viewport"`标签，这对于浏览器正确渲染响应式页面至关重要。
    *   `content="width=device-width, initial-scale=1.0"`：`width=device-width`表示页面宽度等于设备宽度，`initial-scale=1.0`表示初始缩放比例为1.0，防止浏览器自动缩放。
*   **不考虑性能：** 在多屏适配时，只关注布局调整，而忽视了图片、视频等大尺寸资源在移动端加载的性能开销。应考虑图片压缩、懒加载、WebP格式等优化手段。
*   **过度定制：** 对于框架提供的样式，过度地使用`!important`或大量覆盖样式，可能导致框架的优势被削弱，且后期维护困难。应尽可能利用框架提供的定制化机制或预留的接口。
*   **测试不充分：** 仅在模拟器或少数设备上测试，没有充分考虑到不同操作系统、不同浏览器版本、不同屏幕分辨率下的兼容性问题。这可能导致在实际用户使用中出现意外布局或交互问题。
*   **混淆"自适应"和"响应式"：** 虽然在口语中常混用，但严格意义上，自适应通常指通过检测设备类型提供不同的固定布局（如PC版和移动版），而响应式则是通过流式布局和媒体查询在不同尺寸下**灵活伸缩**。Amaze UI更偏向于响应式。

</details>

## 4. 为何选择Amaze UI而非Bootstrap？ {#question-subjective-5cc0eac15519}

### 题目要点

● 本题为主观题，没有标准答案，旨在考察候选人进行技术选型时的思考过程、决策依据以及对不同UI框架的理解与对比能力。

● 面试官希望了解候选人是否具备批判性思维，能对技术方案进行深入分析和比较，而非盲目选择。

● 建议回答结构：简述项目需求与技术选型背景 → 对比Amaze UI和Bootstrap的特点 → 结合项目特点说明选择Amaze UI的具体原因 → 总结该选择带来的优势。

<details>
<summary>参考答案</summary>

在[项目名称，例如：我们之前的活动营销H5页面项目]中，我们最终选择了Amaze UI而非当时同样流行的Bootstrap，这主要是基于我们项目的一些特定需求和团队的技术栈考量。

当时，我们项目的一个核心需求是**轻量化和面向移动端的优化**。Bootstrap虽然功能强大且生态庞大，但它的体积相对较大，包含了许多我们项目可能用不到的组件和样式。而Amaze UI则更侧重于国产化、轻量级和对HTML5的兼容性，它更适合我们这种需要快速加载、性能敏感的移动端H5页面。在移动设备上，更小的资源包意味着更快的加载速度和更好的用户体验。

其次，Amaze UI在**中文排版和组件风格**上与我们的设计规范更贴近。Bootstrap的默认样式偏向于西方设计风格，如果我们选择它，可能需要花费更多的时间去定制和覆盖其默认样式，以符合项目的视觉要求。而Amaze UI在设计之初就考虑到了中文用户的习惯和审美，其提供的组件样式和字体排版更符合国内项目的设计趋势，这在一定程度上减少了我们的定制成本和前端设计的工作量。

此外，Amaze UI在**与HTML5新特性的结合**上表现得更好，例如它对一些响应式图片、视频等HTML5元素的处理，以及其提供的移动端手势支持等，都更符合我们项目对现代Web特性的需求。虽然Bootstrap也在不断更新以支持这些特性，但在当时，Amaze UI在这方面显得更为成熟和开箱即用。

总结来说，我们选择Amaze UI而非Bootstrap，并非是简单地否定Bootstrap的价值，而是基于项目对**轻量级、移动优先、中文友好以及HTML5特性支持**等方面的综合考量。Amaze UI更好地满足了这些需求，使得我们能够更高效地完成项目开发，并提供了更好的用户体验。

</details>

## 5. 项目中遇到的最大技术难点是什么？如何优化组件复用性和样式隔离？ {#question-subjective-fab79c750b1b}

### 题目要点

● 本题为主观题，没有标准答案，旨在考察候选人解决复杂技术问题的能力、对组件化和样式管理的理解与实践，以及从项目中复盘和学习的能力。

● 面试官希望了解候选人面对技术挑战时的分析、解决和总结过程，以及在组件复用和样式隔离方面的具体实践和思考。

● 建议回答结构：明确指出最大技术难点（描述问题、挑战）→ 阐述解决思路与具体方案 → 重点说明在其中如何优化组件复用性 → 重点说明如何优化样式隔离 → 总结与反思。

<details>
<summary>参考答案</summary>

在[项目名称，例如：我们负责的前端微前端改造项目]中，我遇到的最大技术难点主要集中在**跨团队协作下的组件标准统一与样式冲突管理**。由于项目体量较大，涉及多个业务团队并行开发不同的子应用，虽然我们约定了统一的技术栈（例如React），但随着项目深入，各团队独立开发的组件在复用和样式隔离方面暴露出不少问题。

具体来说，我们发现：一是不同团队开发的类似功能组件，实现方式和API设计差异大，难以在不同子应用间复用；二是各子应用打包后，全局CSS样式容易互相污染，导致某些样式优先级错乱，出现不可预期的视觉问题，尤其是在微前端环境下，这种冲突更加明显。这不仅降低了开发效率，也增加了后期维护的难度和潜在的Bug风险。

为了优化组件复用性，我们采取了以下措施：首先，我们**建立了统一的组件库**。通过抽离各业务通用组件，进行标准化设计和开发，并维护统一的版本管理。我们定义了严格的组件开发规范和文档，包括Props定义、事件回调、插槽使用等，确保组件API的一致性。其次，我们引入了**Monorepo（多包仓库）** 的管理方式，将组件库作为一个独立的包进行管理，并通过Lerna或Yarn Workspaces等工具，方便地在不同子应用中引用和发布。这样，当组件库更新时，所有依赖的子应用都能及时获取到最新版本，并能通过版本控制追溯问题。

在样式隔离方面，我们主要采用了**CSS Modules**的方案。对于组件库中的所有组件，我们强制使用CSS Modules来编写样式。CSS Modules会在编译时将类名进行局部化处理（例如`header_title__abc12`），确保每个组件的样式都只作用于其自身，从而从根本上解决了全局样式污染的问题。即使在不同的子应用中存在同名类，经过CSS Modules处理后，它们也不会互相影响。对于一些必须使用全局样式的场景（例如第三方库的样式覆盖，或者全局主题变量），我们则通过一套严格的命名规范和少量全局CSS文件进行管理，并尽可能地限制其作用范围，同时通过CSS变量来统一主题色等，减少硬编码。

通过上述优化，我们显著提升了组件的复用率，减少了重复开发，新组件的开发效率提高了约30%。同时，样式冲突问题基本消除，降低了调试成本，保证了各子应用UI的稳定性和一致性。这个过程也让我们团队对前端工程化和多团队协作有了更深刻的理解。

</details>

## 6. 表单的重复提交是怎么做的 ？ {#question-subjective-a36129f3e588}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● 前端交互安全：考察候选人对表单提交常见问题（如重复提交）的认识。

● 防抖/节流概念：验证候选人对防抖和节流等前端性能优化手段的理解和应用。

● 用户体验优化：评估候选人能否从用户角度考虑，提升表单提交的友好性。

● 后端配合：了解候选人对前后端协作解决重复提交问题的整体思路。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

表单重复提交是前端开发中常见的问题，通常发生在用户快速点击提交按钮、重复刷新页面、网络延迟导致多次点击等场景。如果不加以处理，可能导致数据重复创建、业务逻辑错误（如重复扣款、重复下单）等问题，严重影响用户体验和系统数据完整性。

解决表单重复提交的核心原理是：**在用户提交表单后，阻止其在短时间内再次提交，直到前一次提交操作完成并返回结果。** 这可以通过多种前端和后端技术相结合的方式实现。

##### 1.2 核心用法 + 示例代码（如题目涉及）

防止表单重复提交的常见方法：

1.  **提交按钮禁用 (Disabling Button):**
    *   **原理：** 在用户点击提交按钮后，立即将按钮设置为禁用状态（`disabled`），并显示加载指示器，直到请求响应返回。
    *   **优点：** 最简单直观的方法，用户体验好，能明确告知用户正在处理中。
    *   **缺点：** 只能防止用户主动再次点击，无法防止用户通过刷新页面或浏览器回退等方式再次提交。如果网络请求失败或JS执行异常，按钮可能一直保持禁用状态。
    *   **使用场景：** 适用于大多数常规表单提交。

    ```javascript
    // HTML
    // <button id="submitBtn">提交</button>

    // JavaScript
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true; // 禁用按钮
      submitBtn.textContent = '提交中...'; // 更改按钮文本

      try {
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('表单提交成功！');
        // 成功后恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = '提交';
      } catch (error) {
        console.error('提交失败：', error);
        // 失败后也恢复按钮状态，并提示用户
        submitBtn.disabled = false;
        submitBtn.textContent = '提交';
        alert('提交失败，请重试！');
      }
    });
    ```

2.  **设置提交状态 (Submitting State Flag):**
    *   **原理：** 在客户端维护一个布尔变量（如 `isSubmitting`），在提交前检查此变量，如果为 `true` 则阻止提交。提交开始时设置为 `true`，请求结束后（无论成功或失败）设置为 `false`。
    *   **优点：** 可以在逻辑层面进行控制，比单纯禁用按钮更灵活，可以处理非按钮触发的提交。
    *   **缺点：** 仍无法完全防止用户刷新页面导致的重复提交。
    *   **使用场景：** 适用于通过JavaScript动态提交的表单，或需要更细粒度控制提交逻辑的场景。

    ```javascript
    let isSubmitting = false;

    async function handleSubmit() {
      if (isSubmitting) {
        console.log('正在提交中，请勿重复操作！');
        return;
      }

      isSubmitting = true;
      console.log('开始提交表单...');

      try {
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('表单提交成功！');
      } catch (error) {
        console.error('提交失败：', error);
      } finally {
        isSubmitting = false; // 无论成功失败，都重置状态
      }
    }

    // 例如，绑定到表单的 submit 事件
    // document.querySelector('form').addEventListener('submit', (e) => {
    //   e.preventDefault(); // 阻止默认提交
    //   handleSubmit();
    // });
    ```

3.  **防抖 (Debounce) 或 节流 (Throttle) (适用于防止短时间内多次点击触发):**
    *   **原理：**
        *   **防抖：** 在事件触发后，等待一个固定的时间，如果这段时间内没有再次触发该事件，则执行回调函数。如果在这段时间内再次触发，则重新计时。
        *   **节流：** 在事件触发后，规定一个时间周期，在该周期内，无论事件触发多少次，都只执行一次回调函数。
    *   **优点：** 能够有效控制事件触发频率，减少不必要的请求。
    *   **缺点：** 主要用于优化用户操作频率，对用户刷新页面等行为无效。
    *   **使用场景：** 适用于实时搜索、输入框联想、按钮点击（如多次点击会触发多次请求）等场景。对于表单提交，防抖更常见，确保用户停止点击后才触发一次。

    ```javascript
    // 简易防抖函数
    function debounce(func, delay) {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
      };
    }

    // 假设这是提交表单的函数
    async function submitFormRequest() {
      console.log('发送表单请求...');
      // 模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('请求完成。');
    }

    const debouncedSubmit = debounce(submitFormRequest, 1000); // 1秒内只触发一次

    // 绑定到按钮点击事件
    // document.getElementById('submitBtn').addEventListener('click', debouncedSubmit);
    ```

4.  **Token 机制 (后端配合):**
    *   **原理：** 每次加载表单页面时，后端生成一个唯一的Token（如UUID），并将其嵌入到表单的隐藏字段中，同时将该Token存储在服务器端（如Session或Redis）。前端提交表单时，将Token一并提交到后端。后端在处理请求时，会校验提交的Token是否与服务器端存储的Token一致，并确保该Token只使用一次。使用后立即从服务器删除或标记为已使用。
    *   **优点：** 从根本上防止了重复提交，即使客户端通过刷新页面或回退也能有效阻止。安全性高。
    *   **缺点：** 增加了前后端交互的复杂度。
    *   **使用场景：** 对数据一致性要求极高的业务场景，如支付、订单创建等。

5.  **Redirect after POST (PRG模式，后端配合):**
    *   **原理：** 当用户通过POST请求提交表单后，服务器处理完数据，不是直接返回一个页面，而是向浏览器发送一个302（Found）或303（See Other）重定向响应，将用户重定向到另一个页面（通常是展示结果或成功页面）。这样，即使用户刷新，也只是刷新重定向后的页面，而不是再次发送POST请求。
    *   **优点：** 遵循HTTP规范，有效防止刷新导致的重复提交。
    *   **缺点：** 需要后端配合实现重定向逻辑。
    *   **使用场景：** 几乎所有需要处理表单提交的场景。

##### 1.3 常见误区或面试陷阱

*   **只考虑前端：** 很多候选人只想到前端的禁用按钮、防抖等方法，而忽略了后端Token或PRG模式的根本性解决方案。面试官可能会追问如何从根本上避免，这时需要强调后端策略。
*   **混淆防抖和节流：** 虽然两者都能控制事件频率，但应用场景和效果不同。防抖是"延迟执行，最后一次生效"，节流是"周期执行，规定时间内只执行一次"。在表单提交场景，防抖通常更适用。
*   **禁用按钮的缺陷：** 仅仅禁用按钮无法完全解决问题，因为用户可以通过多种方式绕过前端限制（如通过开发者工具修改DOM，或者使用浏览器回退/刷新）。需要强调这只是第一层防护。
*   **Token的安全性考虑：** 在解释Token机制时，除了防止重复提交，还应该提及它对CSRF攻击的防御作用，以及Token的生成、存储、校验和销毁的安全性考虑。
*   **未考虑异常情况：** 在禁用按钮或设置状态时，如果请求失败或发生JavaScript错误，状态没有及时恢复，可能导致按钮一直禁用，用户无法再次提交。需要在 `finally` 块中确保状态的恢复。

</details>

## 7. 项目中的性能优化：虚拟滚动、懒加载是如何实现？ {#question-subjective-2ab62ed05527}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● 前端性能优化意识：考察候选人对网站性能重要性的理解以及常见的优化手段。

● 虚拟DOM与虚拟滚动：验证候选人对虚拟DOM原理的掌握，以及如何将其应用于优化长列表渲染。

● 懒加载技术：了解候选人对图片、组件等资源懒加载的实现方式和适用场景。

● 实践经验与原理理解：评估候选人是否能结合实际项目，深入阐述优化方案的实现细节和原理。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

前端性能优化是提升用户体验、降低服务器压力的关键环节。其中，针对大量数据渲染和资源加载的优化尤为重要。**虚拟滚动（Virtual Scrolling）** 和 **懒加载（Lazy Loading）** 是两种常用的优化策略，它们的核心思想都是**按需加载和渲染，减少不必要的资源消耗和DOM操作。**

*   **虚拟滚动（Virtual Scrolling / Windowing）：**
    *   **原理：** 当页面中需要渲染大量（成百上千甚至更多）相同或类似结构的列表项时，如果一次性将所有DOM元素都渲染出来，会导致浏览器性能急剧下降，造成页面卡顿甚至崩溃。虚拟滚动的核心思想是**只渲染可视区域内（或接近可视区域）的列表项，非可视区域的列表项则不渲染或只渲染占位符。** 随着用户滚动，动态计算当前应该显示哪些数据，并复用（或创建）DOM元素来展示这些数据。这样，无论列表数据量多大，DOM元素的数量始终保持在一个较小的、可控的范围内，极大地提高了渲染性能。
    *   **为什么会出现这个技术需求或问题：** 传统的列表渲染方式是将所有数据映射为DOM节点，当数据量巨大时，DOM节点数量会随之暴增。DOM操作是昂贵的，过多的DOM节点会导致：
        *   内存占用过高。
        *   回流（reflow）和重绘（repaint）频繁，导致页面卡顿。
        *   JavaScript处理大量数据和DOM操作的耗时增加。
    *   **相比其他方案有什么优势：** 相较于一次性渲染所有列表项，虚拟滚动能够将DOM节点的数量从"与数据量成正比"降低到"与可视区域大小成正比"，从而实现对大型列表的高性能渲染，尤其是在移动端或性能较弱的设备上效果显著。

*   **懒加载（Lazy Loading）：**
    *   **原理：** 懒加载是一种延迟加载技术，其核心思想是**按需加载资源**。当页面加载时，只加载当前视口（或即将进入视口）所需的资源（如图片、组件、数据等），而将其他资源推迟到用户滚动到它们所在位置或需要时再加载。
    *   **为什么会出现这个技术需求或问题：** 传统的页面加载方式是同步加载所有资源，这可能导致首次加载时间过长，页面空白期增加，用户体验差，并且浪费带宽（用户可能没有滚动到所有资源）。
    *   **相比其他方案有什么优势：** 减少了首次加载时间，提高了页面响应速度，节约了带宽，提升了用户体验，尤其是在包含大量图片或复杂组件的页面中效果明显。

##### 1.2 核心用法 + 示例代码（如题目涉及）

1.  **虚拟滚动实现：**
    实现虚拟滚动通常需要以下几个关键步骤：
    *   **确定可视区域的高度和每个列表项的高度：** 用于计算当前可视区域能显示多少个列表项。
    *   **监听滚动事件：** 当用户滚动时，触发重新计算。
    *   **计算当前显示区域的起始索引和结束索引：** 根据滚动位置和项高计算出当前应该渲染哪些数据。
    *   **维护一个固定高度的容器：** 模拟整个列表的滚动高度，确保滚动条的正确显示。
    *   **动态调整内部偏移：** 通过CSS `transform` 或 `top` 属性，将可视区域的列表项定位到正确的位置，模拟滚动效果。

    **示例代码 (React Hooks 简易实现思路):**

    ```jsx
    import React, { useState, useEffect, useRef, useMemo } from 'react';

    const ITEM_HEIGHT = 50; // 每个列表项的高度

    function VirtualList({ items }) {
      const [scrollTop, setScrollTop] = useState(0);
      const containerRef = useRef(null);

      // 可视区域可以渲染的项数
      const visibleCount = useMemo(() => {
        if (!containerRef.current) return 0;
        return Math.ceil(containerRef.current.clientHeight / ITEM_HEIGHT);
      }, [containerRef.current?.clientHeight]); // 依赖容器高度变化

      // 渲染区域的起始索引
      const startIndex = useMemo(() => {
        return Math.floor(scrollTop / ITEM_HEIGHT);
      }, [scrollTop]);

      // 渲染区域的结束索引
      const endIndex = useMemo(() => {
        return Math.min(items.length - 1, startIndex + visibleCount);
      }, [startIndex, visibleCount, items.length]);

      // 实际渲染的列表项
      const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex + 1);
      }, [items, startIndex, endIndex]);

      // 列表总高度 (用于撑开滚动条)
      const totalHeight = items.length * ITEM_HEIGHT;

      // 偏移量 (用于将可视区域的元素正确放置)
      const paddingTop = startIndex * ITEM_HEIGHT;

      useEffect(() => {
        const handleScroll = () => {
          if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
          }
        };
        const container = containerRef.current;
        if (container) {
          container.addEventListener('scroll', handleScroll);
        }
        return () => {
          if (container) {
            container.removeEventListener('scroll', handleScroll);
          }
        };
      }, []);

      return (
        &lt;div
          ref={containerRef}
          style={{
            height: '400px', // 可视区域高度
            overflowY: 'auto',
            border: '1px solid #ccc',
            position: 'relative', // 确保内部元素可以定位
          }}
        >
          &lt;div
            style={{
              height: totalHeight, // 整个列表的实际高度
              position: 'relative', // 确保内部元素可以定位
            }}
          >
            &lt;div
              style={{
                paddingTop: paddingTop, // 上方空白区域
              }}
            >
              {visibleItems.map((item, index) => (
                &lt;div
                  key={startIndex + index} // 关键：使用原始索引作为key
                  style={{
                    height: ITEM_HEIGHT,
                    lineHeight: `${ITEM_HEIGHT}px`,
                    borderBottom: '1px dashed #eee',
                    paddingLeft: '10px',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 使用示例
    // const data = Array.from({ length: 10000 }, (_, i) => `List Item ${i}`);
    // <VirtualList items={data} />
    ```

2.  **懒加载实现：**
    *   **图片懒加载：**
        *   **原生支持：** `loading="lazy"` 属性（现代浏览器支持）。
        *   **Intersection Observer API：** 监听元素是否进入可视区域，进入后替换真实图片URL。
        *   **滚动事件监听：** 传统方法，监听 `scroll` 事件，判断元素位置。
    *   **组件/模块懒加载：**
        *   **动态 `import()`：** 结合Webpack/Rollup等打包工具，将代码分割成按需加载的块。
        *   **React.lazy / Vue 异步组件：** 框架层面的懒加载支持。

    **示例代码 (Intersection Observer API 图片懒加载):**

    ```html
    <!-- HTML -->
    <img data-src="path/to/real-image.jpg" src="path/to/placeholder.gif" alt="Lazy Image" class="lazy-image">
    <!-- 更多图片... -->
    ```

    ```javascript
    // JavaScript
document.addEventListener("DOMContentLoaded", function() {
      const lazyImages = [].slice.call(document.querySelectorAll("img.lazy-image"));

      if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              let lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src; // 替换为真实图片
              lazyImage.classList.remove("lazy-image");
              lazyImageObserver.unobserve(lazyImage); // 停止观察已加载的图片
            }
          });
        });

        lazyImages.forEach(function(lazyImage) {
          lazyImageObserver.observe(lazyImage);
        });
      } else {
        // Fallback for older browsers (e.g., using scroll event)
        // ...
      }
    });
    ```

    **示例代码 (React 组件懒加载):**

    ```jsx
    // App.js
    import React, { Suspense, lazy } from 'react';

    // 动态导入组件
    const LazyComponent = lazy(() => import('./LazyComponent'));

    function App() {
      const [showComponent, setShowComponent] = useState(false);

      return (
        <div>
          <h1>Welcome</h1>
          <button => setShowComponent(true)}>Load Component</button>
          {showComponent && (
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent />
            </Suspense>
          )}
        </div>
      );
    }
    export default App;

    // LazyComponent.js
    // export default function LazyComponent() {
    //   return <div>This is a lazily loaded component!</div>;
    // }
    ```

##### 1.3 常见误区或面试陷阱

*   **过度优化：** 不是所有列表或图片都需要虚拟滚动或懒加载。对于数据量小、一次性渲染无压力的场景，过度引入这些复杂方案反而会增加代码复杂度，得不偿失。
*   **虚拟滚动 Key 的使用：** 在虚拟滚动中，为列表项设置 `key` 是非常重要的。如果 `key` 使用不当（例如使用 `index` 且列表项会增删改），会导致DOM复用错误，出现渲染问题。正确的做法是使用数据的唯一ID作为 `key`。
*   **懒加载的占位符：** 图片懒加载时，需要考虑图片加载前的占位符（`placeholder`）问题，避免页面布局跳动（Cumulative Layout Shift, CLS）。可以使用与图片实际尺寸相同的空白图片、CSS背景色或小尺寸模糊图作为占位符。
*   **Intersection Observer API 的兼容性：** 虽然现代浏览器支持良好，但对于旧版浏览器，需要提供降级方案（如通过监听 `scroll` 事件）。
*   **懒加载的 SEO 影响：** 早期懒加载可能对搜索引擎爬虫不友好，因为它无法立即获取所有内容。但现在主流搜索引擎（如Google）已经支持执行JavaScript，能够抓取懒加载内容。不过，仍需注意确保重要内容不会被过度延迟加载，影响SEO排名。
*   **虚拟滚动对交互的影响：** 在实现虚拟滚动时，需要考虑用户在滚动过程中可能遇到的交互问题，例如滚动到顶部/底部加载更多、快速滚动时的卡顿感等，可能需要额外的优化（如增加缓存区域、防抖节流滚动事件）。

</details>

## 8. BFC的触发条件及解决布局问题的场景 {#question-subjective-d58326aea610}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● CSS布局原理：确认候选人对CSS盒模型、流体布局等核心概念的深入理解。

● BFC概念与作用：验证候选人对BFC（块级格式化上下文）的定义、触发条件和其解决布局问题的能力。

● 实际问题解决：考察候选人能否将理论知识应用于解决实际前端布局难题。

● 兼容性与替代方案：了解候选人对不同浏览器兼容性问题的考量，以及是否有其他替代的布局方案。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

**BFC (Block Formatting Context)**，即**块级格式化上下文**，是CSS视觉渲染的一部分，它是一个独立的渲染区域，规定了内部块级盒子的布局方式，并且不与外部元素相互影响。在一个BFC中，盒子的垂直方向上会一个接一个地放置，从包含块的顶部开始。这些盒子之间的垂直距离由它们的 `margin` 属性决定。更重要的是，在同一个BFC中，相邻块级元素的 `margin` 会发生折叠。

**BFC的特点：**

*   **内部元素布局不受外部影响：** BFC内部的元素不会影响到外部的元素布局。
*   **清除浮动：** BFC可以包含浮动元素，防止浮动元素脱离文档流导致父元素高度塌陷。
*   **阻止 `margin` 折叠：** 在同一个BFC中，相邻的块级元素之间的垂直外边距会发生折叠。如果两个元素处于不同的BFC中，它们的 `margin` 不会折叠。
*   **阻止元素被浮动元素覆盖：** BFC可以阻止自身与浮动元素重叠。

**为什么会出现这个技术需求或问题：**

在传统的文档流布局中，一些特定的CSS行为（如浮动、外边距折叠）可能会导致非预期的布局问题。BFC机制提供了一种"沙盒"化的布局环境，通过创建独立的格式化上下文来隔离这些行为，从而帮助开发者更可控地解决复杂的布局难题。

##### 1.2 核心用法 + 示例代码（如题目涉及）

**BFC的触发条件：**

当一个元素满足以下任一条件时，会创建一个新的BFC：

1.  **根元素 (`<html>`)：** 根元素本身就创建了一个BFC。
2.  **`float` 属性不为 `none`：** 比如 `float: left;` 或 `float: right;`。
3.  **`position` 属性为 `absolute` 或 `fixed`：** 绝对定位和固定定位的元素。
4.  **`display` 属性为 `inline-block`, `table-cell`, `table-caption`, `flex`, `grid`：**
    *   `inline-block`：行内块级元素。
    *   `table-cell`：表格单元格（`<td>`）。
    *   `table-caption`：表格标题（`<caption>`）。
    *   `flex`：Flex容器（`display: flex;` 或 `display: inline-flex;`）。
    *   `grid`：Grid容器（`display: grid;` 或 `display: inline-grid;`）。
5.  **`overflow` 属性不为 `visible`：** 比如 `overflow: hidden;`, `overflow: scroll;`, `overflow: auto;`。这是最常用且副作用最小的触发BFC的方式。

**解决布局问题的场景：**

1.  **清除浮动（解决父元素高度塌陷）：**
    当父元素内部有浮动子元素时，父元素如果没有设置高度，其高度会塌陷，导致背景色或边框无法包裹浮动元素。通过为父元素创建BFC，可以使其包含浮动子元素。

    ```html
    <div class="parent">
      <div class="float-child"></div>
    </div>

    &lt;style&gt;
      .parent {
        border: 1px solid red;
        /* 触发BFC，清除浮动 */
        overflow: hidden; /* 最常用且副作用小 */
      }
      .float-child {
        float: left;
        width: 100px;
        height: 100px;
        background-color: lightblue;
      }
    &lt;/style&gt;
    ```

2.  **阻止垂直 `margin` 折叠：**
    在同一个BFC中，相邻块级元素的垂直外边距会折叠。要阻止折叠，可以将其中一个元素放入新的BFC中。

    ```html
    <div class="box1">Box 1</div>
    <div class="box2">Box 2</div>

    &lt;style&gt;
      .box1 {
        margin-bottom: 20px;
        background-color: yellow;
      }
      .box2 {
        margin-top: 30px;
        background-color: lightgreen;
        /* box1和box2的margin会折叠为30px */
      }

      /* 阻止折叠的方案：将其中一个放入新的BFC */
      .container {
        overflow: hidden; /* 触发BFC */
      }
    &lt;/style&gt;

    <!-- 使用方案： -->
    <div class="box1">Box 1</div>
    <div class="container">
      <div class="box2">Box 2</div>
    </div>
    <!-- 此时box1的margin-bottom和box2的margin-top不会折叠 -->
    ```

3.  **自适应两栏布局（或多栏布局）防止被浮动元素覆盖：**
    当左侧元素浮动，右侧元素与浮动元素处于同一BFC时，右侧元素的内容会环绕浮动元素。如果希望右侧元素的内容区域不被浮动元素覆盖，可以将右侧元素创建为新的BFC。

    ```html
    <div class="container">
      <div class="left-float">左侧浮动</div>
      <div class="right-content">右侧内容区域</div>
    </div>

    &lt;style&gt;
      .container {
        width: 400px;
        border: 1px solid purple;
      }
      .left-float {
        float: left;
        width: 100px;
        height: 150px;
        background-color: orange;
      }
      .right-content {
        /* 触发BFC */
        overflow: hidden; /* 最常用 */
        /* 或者 display: flex; */
        /* 或者 position: absolute; (如果适合定位需求) */
        background-color: lightcoral;
        height: 200px; /* 示例高度 */
      }
    &lt;/style&gt;
    ```
    在上述代码中，`.right-content` 触发BFC后，其盒模型会独立于浮动元素，其内容区域将不会与浮动元素重叠，而是紧挨着浮动元素（如果宽度足够）或者在浮动元素下方。

##### 1.3 常见误区或面试陷阱

*   **对BFC概念的理解不深入：** 很多候选人只停留在记住BFC的触发条件，而没有真正理解其"独立渲染区域"、"隔离"的本质，以及它如何影响盒模型的布局。
*   **清除浮动只知道 `clear: both;` 或伪元素：** 虽然这些方法也有效，但BFC提供了一种更优雅、副作用更小的清除浮动方式。面试官可能会问BFC清除浮动的原理。
*   **混淆 `margin` 折叠：** 垂直 `margin` 折叠只发生在同一个BFC中的相邻块级元素。子元素与父元素的 `margin-top` 折叠，也是因为它们处于同一个BFC中。
*   **不清楚 `overflow: hidden;` 的副作用：** 使用 `overflow: hidden;` 触发BFC时，如果子元素内容溢出，会被裁剪，这在某些情况下可能不是期望的行为。需要了解其优缺点，并在适当的场景下使用。
*   **BFC与其他布局模式的替代关系：** 在现代CSS布局中，Flexbox和Grid布局在很多情况下可以更直观、灵活地解决BFC能解决的布局问题。面试时，可以提及在Flexbox/Grid普及之前BFC的重要性，以及现在它们如何简化了一些布局。例如，Flex容器本身就创建了一个BFC，其内部的子元素不会发生 `margin` 折叠。

</details>

## 9. calc()在动态布局中的使用场景 {#question-subjective-851fa5b52db3}

### 题目要点

● CSS函数 `calc()` 的掌握：验证候选人对 `calc()` 函数的基本语法、功能和计算能力的理解。

● 动态布局能力：考察候选人如何使用 `calc()` 来实现响应式、自适应布局，处理复杂尺寸计算。

● 布局灵活性：评估候选人能否利用 `calc()` 解决固定-流体布局、百分比-像素混合计算等实际问题。

● 兼容性考虑：了解候选人对 `calc()` 在不同浏览器中的兼容性支持情况。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

`calc()` 是 CSS3 中引入的一个函数，允许在 CSS 属性值中执行基本的数学运算（加 `+`、减 `-`、乘 `*`、除 `/`）。它的强大之处在于，可以在一个表达式中混合使用不同单位的值，例如百分比、像素、em、rem、vw、vh 等，这在实现动态和响应式布局时非常有用。

**`calc()` 的核心原理：**
浏览器在解析CSS时，会计算 `calc()` 表达式的结果，然后将最终的计算值作为属性值应用。这意味着 `calc()` 允许我们在运行时（浏览器渲染时）进行尺寸计算，而不是在编写CSS时就固定死值。

**为什么会出现这个技术需求或问题：**
在 `calc()` 出现之前，复杂的布局通常需要通过 JavaScript 或 CSS 预处理器（如 Sass、Less）来计算元素尺寸，或者使用一些 hacky 的 CSS 技巧（如负 margin）。这些方法增加了代码的复杂性，并且可能导致性能问题或维护困难。
`calc()` 的引入，使得直接在CSS中进行动态尺寸计算成为可能，极大地提高了CSS布局的灵活性和表达能力，减少了对JavaScript的依赖，并简化了响应式设计中的尺寸调整。

##### 1.2 核心用法 + 示例代码（如题目涉及）

`calc()` 函数可以用于任何接受长度、频率、时间、角度、百分比或数字值的 CSS 属性，例如 `width`、`height`、`margin`、`padding`、`font-size` 等。

**主要使用场景：**

1.  **固定-流体布局 (Fixed-Fluid Layout)：**
    *   **场景：** 页面通常有固定宽度的侧边栏，剩余部分为自适应主内容区。
    *   **优势：** 无需浮动或绝对定位，可以直接计算出主内容区的宽度，布局简单清晰，避免了浮动带来的高度塌陷等问题。

    ```html
    <div class="wrapper">
      <div class="sidebar">固定侧边栏</div>
      <div class="main-content">自适应主内容</div>
    </div>

    &lt;style&gt;
      .wrapper {
        display: flex; /* 使用Flexbox更现代 */
        /* 或者使用传统BFC方式 */
        /* width: 100%; */
      }
      .sidebar {
        width: 200px; /* 固定宽度 */
        background-color: #f0f0f0;
        padding: 10px;
      }
      .main-content {
        /* 减去侧边栏宽度和一些间距 */
        width: calc(100% - 200px - 20px); /* 100% - 侧边栏宽度 - 间距 */
        margin-left: 20px; /* 间距 */
        background-color: #e0e0e0;
        padding: 10px;
      }
    &lt;/style&gt;
    ```

2.  **创建多列等高布局中的间距：**
    *   **场景：** 在多列布局中，希望每列之间有固定的间距，且每列宽度自适应。

    ```html
    <div class="columns-container">
      <div class="column-item">Column 1</div>
      <div class="column-item">Column 2</div>
      <div class="column-item">Column 3</div>
    </div>

    &lt;style&gt;
      .columns-container {
        display: flex;
        justify-content: space-between; /* 或其他对齐方式 */
      }
      .column-item {
        /* 三列，每列宽度为 (100% - 两个间距) / 3 */
        width: calc((100% - 2 * 20px) / 3); /* 20px 为每列之间的间距 */
        height: 100px;
        background-color: lightblue;
        text-align: center;
        line-height: 100px;
      }
      .column-item:not(:last-child) {
        margin-right: 20px; /* 只给除了最后一列的元素设置右外边距 */
      }
    &lt;/style&gt;
    ```

3.  **元素相对于视口或父元素的定位与偏移：**
    *   **场景：** 将一个元素定位在距离父元素右侧一定距离，同时又要保持一个最小宽度。
    *   **优势：** 可以精确控制元素的位置和大小，同时兼顾响应式。

    ```html
    <div class="parent-relative">
      <div class="positioned-element"></div>
    </div>

    &lt;style&gt;
      .parent-relative {
        position: relative;
        width: 80%;
        height: 300px;
        margin: 50px auto;
        border: 1px solid blue;
      }
      .positioned-element {
        position: absolute;
        top: 20px;
        right: 20px;
        /* 宽度为父元素宽度的50%，再减去20px */
        width: calc(50% - 20px);
        min-width: 150px; /* 最小宽度 */
        height: 80px;
        background-color: salmon;
      }
    &lt;/style&gt;
    ```

4.  **动态调整元素尺寸以适应剩余空间：**
    *   **场景：** 顶部有一个固定高度的Header，底部有一个固定高度的Footer，中间内容区高度自适应。

    ```html
    <div class="layout-container">
      <header>Header</header>
      <main>Content</main>
      <footer>Footer</footer>
    </div>

    &lt;style&gt;
      html, body, .layout-container {
        height: 100%;
        margin: 0;
      }
      .layout-container {
        display: flex;
        flex-direction: column;
      }
      header, footer {
        height: 50px; /* 固定高度 */
        background-color: #ccc;
        text-align: center;
        line-height: 50px;
      }
      main {
        flex: 1; /* 让内容区填充剩余空间 */
        /* 或者使用 calc() 计算高度 */
        /* height: calc(100vh - 50px - 50px); */
        background-color: #eee;
        overflow: auto;
      }
    &lt;/style&gt;
    ```
    这里使用Flexbox的 `flex: 1` 更优，但如果必须使用 `height`，`calc(100vh - 50px - 50px)` 也是一个方案。

##### 1.3 常见误区或面试陷阱

*   **运算符周围的空格：** `calc()` 函数中，加号 `+` 和减号 `-` 运算符的两侧**必须**有空格。乘号 `*` 和除号 `/` 则不是强制要求有空格，但为了可读性，建议加上。这是最常见的语法错误。
    *   正确: `width: calc(100% - 20px);`
    *   错误: `width: calc(100%-20px);`
*   **单位混用限制：** 虽然 `calc()` 允许不同单位混合计算，但加减法操作的单位必须是兼容的（例如，不能将 `px` 和 `s` 相加）。乘除法则可以混合使用，例如 `10px * 2` 或 `100% / 3`。
*   **嵌套 `calc()`：** `calc()` 函数可以嵌套使用，但不是所有浏览器都完美支持，且可读性会下降。通常一层 `calc()` 已经能解决大部分问题。
*   **兼容性问题：** 尽管 `calc()` 已经得到了广泛的支持，但在极老的浏览器（如IE9及以下）可能不支持。在生产环境中使用时，需要考虑是否需要提供降级方案或使用 `-webkit-` 等前缀。可以使用 Can I Use 网站查询兼容性。
*   **滥用 `calc()`：** 尽管 `calc()` 强大，但并不是所有尺寸计算都需要它。对于简单的固定尺寸或纯百分比布局，直接使用相应值即可。过度使用 `calc()` 可能会让CSS变得难以阅读和维护。
*   **百分比的基准：** `calc()` 中的百分比值仍然是相对于其父元素或包含块而言的，需要明确计算的基准。

</details>

## 10. 如何处理calc(100% - 50px)在低版本浏览器的兼容性？ {#question-subjective-354794e14a1f}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● CSS兼容性：考察候选人对CSS新特性兼容性问题的认知和解决方案。

● 渐进增强/优雅降级：验证候选人是否理解并能应用这些前端开发策略。

● CSS回退机制：了解候选人如何利用CSS的特性为不支持新属性的浏览器提供备用方案。

● 预处理器/JavaScript：考察候选人是否了解其他工具在处理兼容性问题上的作用。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

`calc()` 是 CSS3 的一个特性，允许在 CSS 属性值中进行数学运算。它极大地增强了 CSS 布局的灵活性，使得混合单位计算变得可能（例如 `100% - 50px`）。然而，像所有新的 CSS 特性一样，`calc()` 在低版本浏览器中可能不被支持。

**兼容性问题出现的原因：**
不同的浏览器在实现 CSS 标准时有自己的时间表。新的 CSS 属性或函数需要时间才能被所有浏览器完全支持。对于 `calc()`，IE9 及以下版本浏览器、一些老旧的移动端浏览器可能不支持，或者需要浏览器厂商前缀（如 `-webkit-calc()`, `-moz-calc()`, `-o-calc()`）才能使用。当浏览器不认识某个 CSS 属性或属性值时，它通常会直接忽略该规则，这会导致布局失效，页面显示异常。

处理兼容性的核心原理是：**为不支持新特性的浏览器提供一个可用的（通常是次优的）回退方案，同时允许支持新特性的浏览器使用最优方案。** 这通常通过 CSS 的级联特性（后定义的样式会覆盖先定义的样式，如果它们的选择器优先级相同）或 JavaScript 检测来实现。

##### 1.2 核心用法 + 示例代码（如题目涉及）

处理 `calc()` 在低版本浏览器兼容性的常见方法：

1.  **使用 CSS 降级方案（优先级覆盖）：**
    这是最常用且推荐的方法。CSS 具有层叠性，当浏览器遇到它不认识的属性或值时会跳过。我们可以先为低版本浏览器提供一个替代的固定值或百分比值，然后为支持 `calc()` 的浏览器提供 `calc()` 的值。

    ```css
    .element {
      /* 1. 为不支持 calc() 的浏览器提供回退方案 */
      /* 方案一：固定像素值 (如果可能接受固定宽度) */
      width: 950px; /* 例如，在不支持calc时，给一个固定的宽度 */
      /* 或者：使用百分比值，配合 padding 或 margin 模拟间距 */
      /* width: 100%; */
      /* padding-right: 50px; */
      /* box-sizing: border-box; */

      /* 2. 为支持 calc() 的浏览器提供最优方案（会被前面的覆盖） */
      width: calc(100% - 50px);
      /* 考虑浏览器前缀，虽然现代浏览器已普遍支持无前缀 */
      width: -webkit-calc(100% - 50px); /* Chrome, Safari */
      width: -moz-calc(100% - 50px);    /* Firefox */
    }

    /* 示例场景：固定侧边栏 + 流体内容 */
    .container {
      overflow: hidden; /* 触发BFC清除浮动 */
      /* 或者 display: flex; */
    }
    .sidebar {
      float: left;
      width: 200px;
      height: 200px;
      background-color: lightblue;
    }
    .main-content {
      /* 针对不支持 calc 的浏览器，给一个尽可能合理的百分比或固定值 */
      width: 80%; /* 示例值 */
      /* 或者如果主体区域需要精确计算，可能需要配合 margin-left 负值 */
      /* margin-left: 200px; */
      /* width: auto; */

      /* calc() 方案 */
      width: calc(100% - 200px); /* 100% 减去侧边栏宽度 */
      width: -webkit-calc(100% - 200px);
      width: -moz-calc(100% - 200px);

      height: 200px;
      background-color: lightcoral;
    }
    &lt;/style&gt;
    ```
    **优势：** 纯 CSS 实现，简单高效，无需 JavaScript 干预。支持 `calc()` 的浏览器会直接使用更精确的计算值，不支持的则回退到备用值。

2.  **使用 JavaScript 特性检测 (Modernizr):**
    *   **原理：** 通过 JavaScript 库（如 Modernizr）检测浏览器是否支持 `calc()`。如果不支持，则通过 JavaScript 动态计算元素的宽度并赋值。
    *   **优势：** 可以精确控制不支持时的行为，进行更复杂的降级处理。
    *   **缺点：** 增加了 JavaScript 依赖，可能会有 FOUC (Flash Of Unstyled Content) 问题，即页面先以无样式或降级样式显示，然后才被 JavaScript 修正。

    ```javascript
    // 假设引入了 Modernizr 库
    // if (Modernizr.csscalc) {
    //   // 浏览器支持 calc()
    // } else {
    //   // 浏览器不支持 calc()，使用 JavaScript 动态计算
    //   const element = document.querySelector('.element');
    //   if (element) {
    //     const parentWidth = element.parentElement.offsetWidth; // 获取父元素宽度
    //     element.style.width = (parentWidth - 50) + 'px';
    //   }
    // }
    ```

3.  **CSS 预处理器 (Sass/Less/Stylus):**
    *   **原理：** 预处理器本身不能解决浏览器兼容性，但它们可以方便地生成带有前缀的 CSS 代码（如 Autoprefixer）或通过混合（`mixin`）来封装兼容性处理逻辑。
    *   **优势：** 简化开发过程，自动化添加前缀。
    *   **缺点：** 仍然需要结合降级方案或JS检测来处理完全不支持的情况。

    ```scss
    /* Sass 示例 */
    @mixin calc($property, $expression) {
      #{$property}: -webkit-calc(#{$expression});
      #{$property}: -moz-calc(#{$expression});
      #{$property}: calc(#{$expression});
    }

    .element {
      width: 950px; /* 回退方案 */
      @include calc(width, '100% - 50px');
    }
    ```

4.  **Flexbox 布局 (现代布局方案):**
    *   **原理：** 对于像 "`100% - 50px`" 这种常见的固定-流体布局需求，现代浏览器中通常可以直接使用 Flexbox 或 Grid 布局来更优雅地实现，而无需 `calc()`。Flexbox 的 `flex-grow` 属性或 `flex: 1` 可以让元素自动填充剩余空间。
    *   **优势：** 代码更简洁，语义更明确，兼容性通常比 `calc()` 更好（对于现代浏览器）。
    *   **缺点：** 如果项目需要兼容 IE9/IE10，Flexbox 的语法可能有所不同或不完全支持。

    ```css
    .wrapper {
      display: flex; /* 创建 Flex 容器 */
      /* 或者 display: -webkit-box; display: -moz-box; display: -ms-flexbox; (兼容旧版 Flexbox) */
    }
    .sidebar {
      width: 200px; /* 固定宽度 */
    }
    .main-content {
      flex: 1; /* 占据剩余空间 */
      /* 或者 flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */
      margin-left: 20px; /* 如果需要间距 */
    }
    ```

##### 1.3 常见误区或面试陷阱

*   **只考虑浏览器前缀：** 很多候选人只知道加 `-webkit-`, `-moz-` 等前缀，而忽略了对于完全不支持 `calc()` 的浏览器（如 IE9 及以下）前缀也无效，需要提供完整的降级方案。
*   **不理解 CSS 层叠性：** 不清楚为什么先写回退值，后写 `calc()` 值能够生效。这涉及到 CSS 属性解析的优先级规则。
*   **滥用 JavaScript：** 对于可以通过纯 CSS 解决的兼容性问题，优先考虑 CSS 方案，避免不必要的 JavaScript 引入，影响页面加载性能和 FOUC。

</details>

## 11. 数组去重方法 {#question-subjective-fafb89ec8425}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● JavaScript 基础：考察候选人对数组操作、数据结构（Set、Map）的掌握。

● 算法与数据结构：验证候选人对去重算法的理解，以及不同方法的时间复杂度、空间复杂度。

● ES6新特性：了解候选人对Set、Spread Operator等ES6特性的应用。

● 性能与适用性：评估候选人能否根据数据特点（如包含对象、NaN等）选择最合适的去重方法。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

数组去重是前端开发中非常常见的操作，其目的是从一个包含重复元素的数组中，生成一个只包含不重复元素的新数组。这个需求在处理用户输入、数据清洗、优化渲染列表等场景中频繁出现。

去重的核心原理是：**遍历数组，记录已经出现过的元素，并将未出现过的元素添加到结果数组中。** 不同的方法通过不同的数据结构或算法来实现"记录已经出现过的元素"这一过程，从而影响其效率和适用范围。

##### 1.2 核心用法 + 示例代码（如题目涉及）

以下是常见的数组去重方法，及其使用场景和优势：

1.  **使用 `Set` (ES6 最简洁高效):**
    *   **原理：** `Set` 是 ES6 引入的一种新的数据结构，它类似于数组，但成员的值都是唯一的，没有重复的值。`Set` 的构造函数可以接受一个可迭代对象（如数组），会自动去重。
    *   **优点：** 代码最简洁、可读性高，性能通常最佳（时间复杂度接近 O(n)，因为它内部实现了哈希表）。能正确处理 `NaN` 和 `undefined`。
    *   **缺点：** 无法直接去重对象（会根据引用地址判断），低版本浏览器不兼容（需要 Polyfill）。
    *   **使用场景：** 推荐用于去重基本类型（字符串、数字、布尔值、`null`、`undefined`）的数组。

    ```javascript
    function uniqueArrayWithSet(arr) {
      return [...new Set(arr)];
    }

    const arr1 = [1, 2, 2, 3, 4, 4, 'a', 'a', undefined, undefined, null, null, NaN, NaN];
    console.log(uniqueArrayWithSet(arr1)); // [1, 2, 3, 4, "a", undefined, null, NaN]
    // 注意：Set 认为 NaN 是相等的
    ```

2.  **使用 `filter()` 和 `indexOf()` (或 `findIndex()`):**
    *   **原理：** `filter()` 方法创建一个新数组，其中包含通过提供函数实现的测试的所有元素。`indexOf()` 方法返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回 -1。结合起来，如果一个元素在它之前没有出现过，那么它的 `indexOf` 就会等于它当前的索引。
    *   **优点：** 代码相对简洁易懂，兼容性好（ES5）。
    *   **缺点：** 对于大型数组，每次 `indexOf()` 都会从头遍历，导致时间复杂度为 O(n^2)，性能较差。不能正确去重 `NaN`（`indexOf(NaN)` 总是返回 -1）。
    *   **使用场景：** 适用于数据量不大的数组，且主要包含基本类型。

    ```javascript
    function uniqueArrayWithFilter(arr) {
      return arr.filter((item, index, self) => {
        return self.indexOf(item) === index;
      });
    }

    const arr2 = [1, 2, 2, 3, 4, 4, 'a', 'a', NaN, NaN];
    console.log(uniqueArrayWithFilter(arr2)); // [1, 2, 3, 4, "a", NaN, NaN] (注意 NaN)
    ```

3.  **使用 `Map` (去重对象数组或复杂数据类型):**
    *   **原理：** `Map` 是一种键值对的集合，它记住键的原始插入顺序。键可以是任何类型，包括对象。我们可以利用 `Map` 的键唯一性来去重对象数组，通过对象的某个唯一标识属性作为 `Map` 的键。
    *   **优点：** 能够去重包含对象的数组，性能通常是 O(n)。
    *   **缺点：** 相对 `Set` 而言代码略复杂，低版本浏览器不兼容。
    *   **使用场景：** 需要去重包含复杂数据类型（如对象）的数组，或者需要根据某个属性值来判断重复。

    ```javascript
    function uniqueObjectArrayWithMap(arr, key) {
      const map = new Map();
      return arr.filter(item => {
        // 如果map中不存在该key（或该item），则添加并返回true
        // 否则返回false（表示重复）
        if (!map.has(item[key])) {
          map.set(item[key], true);
          return true;
        }
        return false;
      });
    }

    const arr3 = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alicia' }, // 重复
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Robert' } // id重复，name不同
    ];
    console.log(uniqueObjectArrayWithMap(arr3, 'id'));
    // [
    //   { id: 1, name: 'Alice' },
    //   { id: 2, name: 'Bob' },
    //   { id: 3, name: 'Charlie' }
    // ]
    ```

4.  **使用 `reduce()` 和对象/数组辅助判断：**
    *   **原理：** `reduce()` 方法遍历数组并累积结果。结合一个对象（或另一个数组）作为辅助存储，用于记录已出现的元素。
    *   **优点：** 可以处理基本类型，性能优于 `indexOf` 版本（接近 O(n)）。
    *   **缺点：** 代码相对 `Set` 复杂，不能直接去重 `NaN`（作为对象键时，`NaN` 是不同的）。
    *   **使用场景：** 当需要兼容旧版本浏览器，且不能使用 `Set` 时，可以作为一种替代方案。

    ```javascript
    function uniqueArrayWithReduce(arr) {
      const seen = {}; // 使用对象存储已出现的元素
      return arr.reduce((acc, item) => {
        // 对于基本类型，直接用作键
        if (!seen[item]) {
          seen[item] = true;
          acc.push(item);
        }
        return acc;
      }, []);
    }

    const arr4 = [1, 2, 2, 3, 4, 4, 'a', 'a', undefined, undefined, null, null, NaN, NaN];
    console.log(uniqueArrayWithReduce(arr4)); // [1, 2, 3, 4, "a", undefined, null, NaN, NaN] (注意 NaN)
    // 这里的 NaN 两次都进来了，因为 NaN !== NaN
    ```

##### 1.3 常见误区或面试陷阱

*   **忽略 `NaN` 的特殊性：** 在 JavaScript 中，`NaN !== NaN`。因此，`indexOf()`、`includes()` 和直接作为对象键（`seen[NaN]`）的方式都无法正确去重 `NaN`。`Set` 是唯一能正确处理 `NaN` 去重的方法。
*   **不区分基本类型和引用类型：** 对于对象去重，简单地使用 `Set` 或 `indexOf` 是无法生效的，因为它们会比较对象的引用地址，而不是值。例如 `new Set([{a:1}, {a:1}])` 结果仍然是两个对象。需要通过遍历并根据对象的某个唯一属性（如 `id`）来判断重复。
*   **性能考量：** 在面试中，仅仅给出一种去重方法是不够的。需要分析不同方法的时间复杂度和空间复杂度，并说明在何种场景下选择哪种方法最优。例如，`indexOf()` 方法的 `O(n^2)` 复杂度在大数据量下是不可接受的。
*   **兼容性问题：** 提到 `Set` 和 `Map` 时，需要注意其是 ES6 特性，在旧版本浏览器中需要 Polyfill。
*   **修改原数组 vs 生成新数组：** 大多数去重方法会生成一个新数组。如果面试官有特殊要求（如原地去重），则需要注意。通常建议生成新数组，保持函数纯净。
*   **面试中手写实现：** 很多面试官会要求手写 `Set` 或 `Map` 出现之前的去重方法（如双层循环、`indexOf`+`filter`、`reduce`+`对象`），需要确保能正确实现。

</details>

## 12. 如何处理对象数组的去重？ {#question-subjective-c9b6d28df786}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● 复杂数据类型处理：考察候选人如何处理数组中包含非基本类型（如对象）的去重问题。

● 唯一标识符：验证候选人是否能识别并利用对象的唯一标识属性进行去重。

● 数据结构应用：了解候选人对 `Map` 或对象在处理键值对唯一性方面的应用。

● 性能与算法：评估候选人对不同去重方案的性能考量，以及选择合适算法的能力。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

对象数组的去重比基本类型数组的去重更为复杂，因为 JavaScript 在比较对象时，默认比较的是它们的**引用地址**，而不是它们的值。这意味着即使两个对象的内容完全相同，如果它们是不同的引用，JavaScript 也会认为它们是不同的。

例如：
`{ id: 1, name: 'A' } !== { id: 1, name: 'A' }`

因此，处理对象数组去重的核心原理是：**定义一个"重复"的标准**。通常，这个标准是基于对象的一个或多个**唯一标识属性**（如 `id`、`uuid`、`sku` 等）。我们通过遍历数组，并使用一个辅助的数据结构（如 `Map` 或普通对象）来记录已出现的唯一标识属性值，从而筛选出不重复的对象。

##### 1.2 核心用法 + 示例代码（如题目涉及）

处理对象数组去重的主要方法是使用 `Map` 或普通对象作为辅助结构，通过对象的唯一属性来判断是否重复。

1.  **使用 `Map` 存储唯一标识 (推荐，性能好，可读性高):**
    *   **原理：** `Map` 的键可以是任意类型，包括对象。但在这里，我们利用 `Map` 的键的唯一性，将每个对象的某个唯一属性值（如 `id`）作为 `Map` 的键，将整个对象作为值存储。在遍历时，如果 `Map` 中已经存在当前对象的 `id`，则说明该对象是重复的。
    *   **优势：** 性能接近 O(n)，因为 `Map` 的 `has()` 和 `set()` 操作是常数时间复杂度。能保持原数组的相对顺序。
    *   **使用场景：** 适用于绝大多数对象数组去重场景，特别是当对象有明确的唯一标识属性时。

    ```javascript
    /**
     * 根据对象的某个唯一属性对对象数组进行去重
     * @param {Array&lt;Object&gt;} arr - 待去重的对象数组
     * @param {string} key - 用于判断重复的唯一属性名
     * @returns {Array&lt;Object&gt;} - 去重后的新数组
     */
    function uniqueObjectArrayById(arr, key) {
      const map = new Map(); // 使用 Map 存储已处理的对象的唯一标识
      const result = []; // 存储去重后的结果

      for (const item of arr) {
        const identifier = item[key]; // 获取用于判断重复的属性值
        if (!map.has(identifier)) { // 如果 Map 中还没有这个标识
          map.set(identifier, item); // 将这个标识和对应的对象存入 Map
          result.push(item); // 将对象添加到结果数组
        }
      }
      return result;
    }

    // 示例数据
    const users = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 1, name: 'Alicia', age: 26 }, // id 重复，但 name 不同
      { id: 3, name: 'Charlie', age: 35 },
      { id: 2, name: 'Robert', age: 31 }  // id 重复，但 name 不同
    ];

    const uniqueUsers = uniqueObjectArrayById(users, 'id');
    console.log(uniqueUsers);
    // 输出:
    // [
    //   { id: 1, name: 'Alice', age: 25 },
    //   { id: 2, name: 'Bob', age: 30 },
    //   { id: 3, name: 'Charlie', age: 35 }
    // ]
    // 注意：这里的 { id: 1, name: 'Alicia', age: 26 } 和 { id: 2, name: 'Robert', age: 31 } 被去掉了，
    // 因为它们的 id 与前面出现的重复了。Map.set 总是以第一次遇到的值为准。
    ```

    **变种：使用 `filter` 和 `Map` 组合 (更函数式):**

    ```javascript
    function uniqueObjectArrayWithFilterMap(arr, key) {
      const map = new Map();
      return arr.filter(item => {
        // 如果 Map 中没有该 key 或者 Map 中存储的不是当前对象
        // （对于 Map，value也可以是布尔值，只是这里的做法更直观）
        if (!map.has(item[key])) {
          map.set(item[key], true); // 记录该 key 已出现
          return true; // 保留当前项
        }
        return false; // 过滤掉重复项
      });
    }
    // 使用方式同上
    ```

2.  **使用普通对象存储唯一标识 (适用于兼容 ES5 环境):**
    *   **原理：** 类似于 `Map` 的方法，但使用普通 JavaScript 对象作为哈希表。对象的键必须是字符串或 Symbol，因此通常将对象的唯一标识属性值转换为字符串作为键。
    *   **优势：** 兼容性好，可以在 ES5 环境中使用。
    *   **缺点：** 对象的键只能是字符串或 Symbol，如果 `key` 的值是数字等，会被隐式转换为字符串。如果 `key` 的值是对象或复杂类型，则无法直接作为键。性能通常也是 O(n)。
    *   **使用场景：** 当目标环境不支持 `Map`，且对象的唯一标识属性值是基本类型（字符串、数字）时。

    ```javascript
    /**
     * 根据对象的某个唯一属性对对象数组进行去重 (ES5 兼容)
     * @param {Array&lt;Object&gt;} arr - 待去重的对象数组
     * @param {string} key - 用于判断重复的唯一属性名
     * @returns {Array&lt;Object&gt;} - 去重后的新数组
     */
    function uniqueObjectArrayByObject(arr, key) {
      const seen = {}; // 使用对象存储已出现的标识
      const result = [];

      for (let i = 0; i &lt; arr.length; i++) {
        const item = arr[i];
        const identifier = item[key]; // 获取标识
        if (!seen[identifier]) { // 如果对象中还没有这个标识
          seen[identifier] = true; // 标记为已出现
          result.push(item);
        }
      }
      return result;
    }

    const users2 = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alicia' }
    ];
    console.log(uniqueObjectArrayByObject(users2, 'id'));
    // 输出同 Map 示例
    ```

3.  **对对象进行深层比较（不推荐，效率低，特殊场景）：**
    *   **原理：** 如果对象没有唯一标识属性，或者需要根据对象的所有属性值来判断是否重复（即深层相等），那么就需要对每个对象进行深层比较。这通常涉及到将对象转换为 JSON 字符串（如果对象可JSON序列化且顺序一致）或者递归遍历比较所有属性。
    *   **优势：** 可以处理没有明确唯一标识符的情况。
    *   **缺点：** 效率非常低（时间复杂度可能达到 O(n^2 * m)，m为对象深度或属性数量），且存在 `JSON.stringify` 无法处理循环引用、函数、`undefined` 等问题。
    *   **使用场景：** 极少数情况下，当确实需要基于所有属性值进行去重，且数据量非常小的时候。

    ```javascript
    function uniqueObjectArrayDeepCompare(arr) {
      const uniqueStrings = new Set();
      const result = [];

      for (const item of arr) {
        const itemString = JSON.stringify(item); // 转换为字符串进行比较
        if (!uniqueStrings.has(itemString)) {
          uniqueStrings.add(itemString);
          result.push(item);
        }
      }
      return result;
    }

    const arrWithSameContent = [
      { a: 1, b: 'x' },
      { b: 'x', a: 1 }, // JSON.stringify 结果可能不同，取决于属性顺序
      { a: 2, b: 'y' }
    ];
    // console.log(uniqueObjectArrayDeepCompare(arrWithSameContent));
    // ⚠️ 注意：属性顺序不同会导致 JSON.stringify 结果不同，去重失败
    // 需先对对象进行属性排序再 stringify，或者实现一个深层比较函数，非常复杂。
    ```

##### 1.3 常见误区或面试陷阱

*   **混淆对象引用和值：** 最常见的错误就是尝试用 `Set` 或 `indexOf` 直接去重对象数组，而没有理解它们比较的是引用地址。
*   **不考虑唯一标识：** 认为所有对象都可以直接去重，而没有意识到需要一个"判断重复"的依据（即唯一标识属性）。
*   **深层比较的性能问题：** 提到深层比较时，要强调其性能开销巨大，并且 `JSON.stringify` 有其局限性（不能处理循环引用、函数、Symbol、`undefined` 值会被忽略等）。这通常不是推荐的通用解决方案。
*   **`Map` 和普通对象的选择：** 区分 `Map` 和普通对象在用作哈希表时的异同，例如 `Map` 的键可以是任意类型，而普通对象的键会被转为字符串。
*   **去重后的顺序：** 不同的去重方法可能会保留第一次出现的元素，也可能保留最后一次出现的元素，或者打乱原始顺序。在面试中可以说明你的方法会如何保留顺序。通常 `Map` 和 `reduce` 方法能保持第一次出现的元素的顺序。
*   **完整性与健壮性：** 对于复杂场景，例如对象数组中可能存在 `null` 或 `undefined` 的情况，需要确保去重逻辑的健壮性。

</details>

## 13. 如何通过EventTarget实现自定义事件？ {#question-subjective-9f48eb0546b6}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

1.    JavaScript 事件机制：考察候选人对浏览器事件循环、事件冒泡/捕获、事件监听和派发的基本理解。
2.    `EventTarget` API：验证候选人对 `EventTarget` 接口及其 `addEventListener`、`removeEventListener`、`dispatchEvent` 方法的掌握。
3.   自定义事件：了解候选人如何创建和使用 `CustomEvent` 来实现组件间或模块间的通信。
4.    解耦与模块化：评估候选人能否利用自定义事件实现代码的解耦和更好的模块化设计。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

在前端开发中，事件是实现交互和模块间通信的关键机制。浏览器提供了许多内置事件（如 `click`, `mouseover`, `load` 等），但有时我们需要创建自己的事件，以便在特定的业务逻辑发生时通知其他部分的代码。这就是**自定义事件 (Custom Event)** 的作用。

`EventTarget` 是一个由 DOM 接口实现的接口，它提供了 `addEventListener()`, `removeEventListener()`, 和 `dispatchEvent()` 三个方法。几乎所有浏览器中支持事件的对象（如 `Element`, `Document`, `Window` 以及 `XMLHttpRequest` 等）都实现了 `EventTarget` 接口，这使得它们能够成为事件的监听者和派发者。

**实现自定义事件的核心原理是：**
1.  **创建事件派发者：** 任何实现了 `EventTarget` 接口的对象都可以派发事件。如果我们想创建一个纯粹用于事件通信的"发布/订阅"中心，可以实例化一个继承自 `EventTarget` 的对象。
2.  **定义自定义事件：** 使用 `CustomEvent` 构造函数创建一个自定义事件实例。`CustomEvent` 允许我们携带额外的数据（通过 `detail` 属性），这使得事件更有意义。
3.  **监听事件：** 使用 `addEventListener()` 方法在事件派发者上注册监听器，当特定事件被派发时执行回调函数。
4.  **派发事件：** 使用 `dispatchEvent()` 方法在事件派发者上触发自定义事件，从而通知所有注册的监听器。

**为什么会出现这个技术需求或问题：**
当应用程序变得复杂时，不同的模块或组件之间经常需要进行通信。如果直接通过修改共享状态或调用彼此的方法来通信，可能会导致紧耦合，代码难以维护和扩展。自定义事件提供了一种**发布/订阅 (Publish-Subscribe) 模式**的通信机制，它使得发送方和接收方彼此解耦，只关心事件的发送和监听，而不需要知道对方的具体实现。这有助于构建更灵活、可维护和可测试的代码。

##### 1.2 核心用法 + 示例代码（如题目涉及）

**步骤：**

1.  **创建一个继承自 `EventTarget` 的类（或实例）作为事件中心：**
    在现代浏览器环境中，可以直接 `new EventTarget()` 来创建。如果需要兼容旧版本浏览器或者希望添加更多自定义逻辑，可以创建一个继承自 `EventTarget` 的类。

    ```javascript
    // 方法一：直接使用 EventTarget 实例作为事件中心 (最常见且简洁)
    const eventBus = new EventTarget();

    // 方法二：创建自定义类继承 EventTarget (如果需要更多定制逻辑)
    class MyEventEmitter extends EventTarget {
      constructor() {
        super();
        console.log('My custom event emitter created.');
      }

      // 可以添加其他方法，例如方便地触发某个业务事件
      emitMyEvent(data) {
        const myEvent = new CustomEvent('myCustomEvent', { detail: data });
        this.dispatchEvent(myEvent);
      }
    }
    const customEmitter = new MyEventEmitter();
    ```

2.  **创建 `CustomEvent` 实例：**
    `CustomEvent` 构造函数接收两个参数：
    *   `type` (String): 事件的名称。
    *   `options` (Object, 可选): 一个包含事件属性的对象。最常用的是 `detail` 属性，用于传递自定义数据。
        *   `bubbles`: 布尔值，表示事件是否冒泡。默认为 `false`。
        *   `cancelable`: 布ool值，表示事件是否可以被取消。默认为 `false`。
        *   `composed`: 布尔值，表示事件是否可以穿透 Shadow DOM 的边界。默认为 `false`。
        *   `detail`: 任何类型的值，包含事件的自定义数据。

    ```javascript
    // 创建一个名为 'dataLoaded' 的自定义事件，并携带数据
    const dataLoadedEvent = new CustomEvent('dataLoaded', {
      detail: {
        userId: 123,
        data: { message: 'User data loaded successfully!' }
      },
      bubbles: true, // 允许事件冒泡
      cancelable: true // 允许事件被取消（如果事件处理器调用 preventDefault()）
    });

    // 创建另一个事件
    const userLoggedInEvent = new CustomEvent('userLoggedIn');
    ```

3.  **注册事件监听器：**
    使用 `addEventListener()` 方法。

    ```javascript
    // 监听 'dataLoaded' 事件
    eventBus.addEventListener('dataLoaded', (event) => {
      console.log('数据加载事件触发！', event.type);
      console.log('事件详情:', event.detail);
      if (event.detail.userId === 123) {
        console.log('特定用户数据加载。');
      }
    });

    // 监听 'userLoggedIn' 事件
    eventBus.addEventListener('userLoggedIn', () => {
      console.log('用户已登录事件触发！');
    });

    // 对于继承 EventTarget 的自定义类
    customEmitter.addEventListener('myCustomEvent', (e) => {
      console.log('Received myCustomEvent:', e.detail);
    });
    ```

4.  **派发事件：**
    使用 `dispatchEvent()` 方法在事件目标上触发事件。

    ```javascript
    console.log('开始派发 dataLoaded 事件...');
    eventBus.dispatchEvent(dataLoadedEvent); // 派发事件

    console.log('开始派发 userLoggedIn 事件...');
    eventBus.dispatchEvent(userLoggedInEvent); // 派发事件

    // 通过自定义类的方法派发
    customEmitter.emitMyEvent({ status: 'success', timestamp: Date.now() });
    ```

**完整示例：一个简单的组件通信场景**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Event Example</title>
</head>
<body>
    <div id="app">
        <button id="triggerButton">触发数据加载</button>
        <div id="statusDisplay">等待数据...</div>
    </div>

    <script>
        // 1. 创建一个事件中心（Event Bus）
        const eventBus = new EventTarget();

        // 2. 模拟一个数据加载模块
        function DataService(bus) {
            this.loadData = function() {
                console.log('DataService: 正在加载数据...');
                setTimeout(() => {
                    const data = { message: 'Hello from DataService!', timestamp: Date.now() };
                    // 3. 创建并派发自定义事件
                    const dataLoadedEvent = new CustomEvent('dataLoaded', {
                        detail: data,
                        bubbles: true // 允许事件冒泡，这里虽然不需要，但演示其用法
                    });
                    bus.dispatchEvent(dataLoadedEvent);
                    console.log('DataService: 数据加载完成，派发事件。');
                }, 1000);
            };
        }

        // 4. 模拟一个UI组件监听数据加载事件
        function UIComponent(bus, triggerBtnId, displayId) {
            const triggerButton = document.getElementById(triggerBtnId);
            const statusDisplay = document.getElementById(displayId);

            // 5. 注册事件监听器
            bus.addEventListener('dataLoaded', (event) => {
                console.log('UIComponent: 接收到 dataLoaded 事件！');
                statusDisplay.textContent = `数据已加载：${event.detail.message} (时间：${new Date(event.detail.timestamp).toLocaleTimeString()})`;
            });

            triggerButton.addEventListener('click', () => {
                dataService.loadData();
            });

            statusDisplay.textContent = '点击按钮加载数据。';
        }

        // 实例化
        const dataService = new DataService(eventBus);
        const uiComponent = new UIComponent(eventBus, 'triggerButton', 'statusDisplay');
    </script>
</body>
</html>
```

##### 1.3 常见误区或面试陷阱

*   **混淆 `Event` 和 `CustomEvent`：** `Event` 只能创建基本事件，无法携带自定义数据。`CustomEvent` 是 `Event` 的子类，专门用于创建可携带数据的自定义事件，通过 `detail` 属性传递数据。
*   **`bubbles` 和 `cancelable` 属性的理解：**
    *   `bubbles: true` 允许事件从子元素向父元素冒泡。对于纯粹的发布/订阅模式，如果事件目标不是DOM元素，这个属性通常设置为 `false` 或不设置（默认为 `false`），因为没有DOM层次结构可供冒泡。但如果事件是从DOM元素触发并希望向上通知，则需要设置为 `true`。
    *   `cancelable: true` 允许事件的默认行为被 `event.preventDefault()` 阻止。对于自定义事件，通常没有默认行为，所以这个属性常设置为 `false`。如果自定义事件确实有某种"默认行为"需要被阻止的语义，可以设置为 `true`。
*   **事件目标的选择：** 选择一个合适的 `EventTarget` 来派发和监听事件很重要。可以是 `document`、`window`，或者是专门创建的 `new EventTarget()` 实例，或者是自定义的组件实例。选择不当可能导致事件无法被正确接收。
*   **内存泄漏：** 如果频繁创建 `EventTarget` 实例或未正确移除事件监听器（尤其是在单页应用中组件销毁时），可能导致内存泄漏。始终记得在不需要时使用 `removeEventListener` 清除监听器。
*   **替代方案：** 在实际项目中，除了原生的 `EventTarget`，更常用的跨组件通信方案可能是：
    *   **状态管理库：** 如 Redux, Vuex, Zustand, Pinia 等。
    *   **Context API (React) / Provide/Inject (Vue):** 依赖注入。
    *   **Props/Emit (父子通信)：** 最直接的组件通信方式。
    面试时，提及这些更高级或更常用的通信方案，并说明原生自定义事件的适用场景（例如轻量级、不涉及复杂状态管理、纯粹的事件通知）。

</details>

## 14. 异步事件（如setTimeout）与微任务执行顺序？ {#question-subjective-24e31798182e}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● JavaScript 运行机制：考察候选人对事件循环 (Event Loop) 核心概念的理解。

● 宏任务与微任务：验证候选人是否能区分宏任务 (Macrotask) 和微任务 (Microtask)，并理解它们的调度机制。

● 任务队列：了解候选人对宏任务队列和微任务队列的认知，以及它们在事件循环中的优先级。

● 异步编程：评估候选人对 `setTimeout`, `Promise`, `async/await` 等异步操作执行顺序的掌握。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

JavaScript 是一种单线程语言，这意味着它一次只能执行一个任务。为了处理耗时的操作（如网络请求、定时器、用户交互），JavaScript 引入了**事件循环 (Event Loop)** 机制，这使得它能够以非阻塞的方式执行异步操作。

事件循环的核心在于区分两种任务：**宏任务 (Macrotask)** 和 **微任务 (Microtask)**。

*   **宏任务 (Macrotask / Task)：**
    *   代表一次宏观的、完整的事件处理过程。
    *   常见的宏任务源包括：`setTimeout`, `setInterval`, `setImmediate` (Node.js), I/O 操作 (如文件读写, 网络请求的回调), UI 渲染。
    *   每个宏任务执行完毕后，浏览器会检查微任务队列。
*   **微任务 (Microtask / Job)：**
    *   代表一个微观的、需要尽快执行的任务，通常在当前宏任务执行完毕后立即执行，优先级高于下一个宏任务。
    *   常见的微任务源包括：`Promise` 的 `then()`, `catch()`, `finally()` 回调，`async/await` 中的 `await` 后面的代码，`queueMicrotask`，`MutationObserver` 的回调。

**事件循环的执行顺序（简化版）：**

1.  **执行当前同步代码：** JavaScript 引擎会首先执行调用栈中的所有同步代码。
2.  **执行所有微任务：** 当同步代码执行完毕，调用栈清空后，事件循环会检查微任务队列。它会一次性地执行所有在当前周期内添加到微任务队列中的任务。
3.  **执行一个宏任务：** 当微任务队列清空后，事件循环会从宏任务队列中取出一个宏任务来执行。
4.  **重复步骤 2 和 3：** 宏任务执行完毕后，再次回到步骤 2（执行所有微任务），然后再执行下一个宏任务，如此循环，直到两个队列都清空。

**总结优先级：**
**同步代码 > 微任务 > 宏任务**

每个宏任务的执行，都会伴随着其内部产生的微任务的清空。这意味着在一个宏任务执行期间产生的所有微任务，都会在下一个宏任务开始之前全部执行完毕。

##### 1.2 核心用法 + 示例代码（如题目涉及）

理解 `setTimeout` (宏任务) 和 `Promise.then` (微任务) 的执行顺序是掌握事件循环的关键。

**示例 1：基本顺序**

```javascript
console.log('Start'); // 同步任务 1

setTimeout(() => {
  console.log('setTimeout'); // 宏任务 1
}, 0);

Promise.resolve().then(() => {
  console.log('Promise.then'); // 微任务 1
});

console.log('End'); // 同步任务 2

// 预期输出：
// Start
// End
// Promise.then
// setTimeout
```

**解析：**
1.  `console.log('Start')`：同步任务，立即执行。
2.  `setTimeout`：宏任务，其回调被添加到宏任务队列。
3.  `Promise.resolve().then()`：微任务，其回调被添加到微任务队列。
4.  `console.log('End')`：同步任务，立即执行。
5.  同步代码执行完毕，调用栈清空。事件循环检查微任务队列，发现 `Promise.then` 的回调，立即执行。
6.  微任务队列清空。事件循环检查宏任务队列，取出 `setTimeout` 的回调并执行。

**示例 2：宏任务中产生微任务**

```javascript
console.log('Global Start'); // 同步任务 1

setTimeout(() => {
  console.log('setTimeout 1'); // 宏任务 1
  Promise.resolve().then(() => {
    console.log('Promise.then 2 (from setTimeout 1)'); // 微任务 2 (从宏任务 1 产生)
  });
}, 0);

Promise.resolve().then(() => {
  console.log('Promise.then 1 (from global)'); // 微任务 1
});

setTimeout(() => {
  console.log('setTimeout 2'); // 宏任务 2
}, 0);

console.log('Global End'); // 同步任务 2

// 预期输出：
// Global Start
// Global End
// Promise.then 1 (from global)
// setTimeout 1
// Promise.then 2 (from setTimeout 1)
// setTimeout 2
```

**解析：**
1.  `Global Start`：同步执行。
2.  `setTimeout 1`：宏任务，入宏任务队列。
3.  `Promise.then 1`：微任务，入微任务队列。
4.  `setTimeout 2`：宏任务，入宏任务队列。
5.  `Global End`：同步执行。
6.  **第一轮事件循环：**
    *   同步代码执行完毕。
    *   清空微任务队列：执行 `Promise.then 1 (from global)`。
    *   清空微任务队列完毕。
    *   从宏任务队列取出一个宏任务：执行 `setTimeout 1`。
        *   在 `setTimeout 1` 内部，又产生一个微任务 `Promise.then 2 (from setTimeout 1)`，立即加入微任务队列。
7.  **第二轮事件循环：**
    *   `setTimeout 1` (宏任务) 执行完毕。
    *   清空微任务队列：执行 `Promise.then 2 (from setTimeout 1)`。
    *   清空微任务队列完毕。
    *   从宏任务队列取出一个宏任务：执行 `setTimeout 2`。

**示例 3：`async/await` 的执行顺序**

`async/await` 是 `Promise` 的语法糖，其本质也是基于 `Promise` 和微任务。`await` 关键字后面的表达式会立即执行，但 `await` 会暂停 `async` 函数的执行，并将 `async` 函数的剩余部分放入微任务队列。

```javascript
async function asyncFunc() {
  console.log('asyncFunc Start'); // 同步执行
  await Promise.resolve(); // 暂停 asyncFunc，其后的代码放入微任务队列
  console.log('asyncFunc End'); // 微任务
}

console.log('Script Start'); // 同步任务 1

setTimeout(() => {
  console.log('setTimeout'); // 宏任务
}, 0);

asyncFunc(); // 调用 async 函数

Promise.resolve().then(() => {
  console.log('Promise.then'); // 微任务
});

console.log('Script End'); // 同步任务 2

// 预期输出：
// Script Start
// asyncFunc Start
// Script End
// Promise.then
// asyncFunc End
// setTimeout
```

**解析：**
1.  `Script Start`：同步执行。
2.  `setTimeout`：宏任务，入宏任务队列。
3.  `asyncFunc()` 调用：
    *   `console.log('asyncFunc Start')`：同步执行。
    *   `await Promise.resolve()`：`Promise.resolve()` 立即解决，`await` 会将 `asyncFunc` 的剩余代码（`console.log('asyncFunc End')`）作为微任务放入微任务队列。
4.  `Promise.resolve().then()`：微任务，入微任务队列。
5.  `Script End`：同步执行。
6.  **第一轮事件循环：**
    *   同步代码执行完毕。
    *   清空微任务队列：先执行 `Promise.then` 的回调，再执行 `asyncFunc` 剩余代码（`asyncFunc End`）。（微任务的执行顺序取决于它们被添加到队列的顺序）
    *   清空微任务队列完毕。
    *   从宏任务队列取出一个宏任务：执行 `setTimeout` 的回调。

##### 1.3 常见误区或面试陷阱

*   **`setTimeout(fn, 0)` 立即执行：** 误认为 `setTimeout(fn, 0)` 会立即执行。实际上，它仍然是一个宏任务，会等待当前所有同步代码和所有微任务执行完毕后，才会在下一个事件循环周期中执行。
*   **微任务和宏任务的混淆：** 对哪些是微任务，哪些是宏任务没有清晰的认识。例如，将 `Promise.then` 误认为是宏任务，或将 DOM 事件回调误认为是微任务。
*   **Promise 的 `new Promise` 内部是异步的：** 误认为 `new Promise` 构造函数内部的代码是异步的。实际上，`new Promise` 构造函数本身是同步执行的，只有 `then`/`catch`/`finally` 的回调才是微任务。
    ```javascript
    console.log(1);
    new Promise(resolve => {
      console.log(2); // 同步执行
      resolve();
    }).then(() => {
      console.log(3); // 微任务
    });
    console.log(4);
    // 输出：1 2 4 3
    ```
*   **`async/await` 等同于同步：** 误认为 `async/await` 会将异步代码转为同步执行。`await` 只是暂停了 `async` 函数的执行，其后面的代码仍会在微任务队列中异步执行，但它以同步的编写方式解决了回调地狱问题。
*   **任务队列的清空机制：** 不理解每个宏任务执行完毕后，会优先清空所有微任务，然后再执行下一个宏任务。这是一种"先清空微任务，再执行单个宏任务"的循环机制。
*   **不同环境下的差异：** 虽然浏览器和 Node.js 都实现了事件循环，但在细节上可能存在差异（如 Node.js 中的 `process.nextTick` 优先级高于 `Promise.then`，以及 `setImmediate` 的行为）。在面试中，通常主要讨论浏览器环境，但如果提及 Node.js 也会加分。

</details>

## 15. 手写Promise.all {#question-subjective-74804c618afa}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● Promise 基础：考察候选人对 Promise 状态（pending, fulfilled, rejected）和链式调用的理解。

● 异步并发控制：验证候选人如何处理多个异步操作的并发执行，并等待所有操作完成。

● 错误处理：了解候选人如何处理 Promise.all 中某个 Promise 失败的情况。

● JavaScript 核心：评估候选人对数组遍历、数据结构（如计数器、结果数组）的运用，以及函数封装能力。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

`Promise.all` 是 `Promise` 静态方法之一，它接收一个 Promise 可迭代对象（如数组）作为输入，并返回一个新的 Promise。
这个新的 Promise 在以下两种情况下会解析：
1.  **所有输入的 Promise 都解析 (fulfilled) 时：** 返回的 Promise 会以一个包含所有输入 Promise 解析值的数组作为其解析值，数组的顺序与输入 Promise 的顺序保持一致。
2.  **任何一个输入的 Promise 拒绝 (rejected) 时：** 返回的 Promise 会以第一个拒绝的 Promise 的拒绝原因作为其拒绝原因。

`Promise.all` 的核心思想是**并发执行**和**结果聚合**。它适用于需要同时发起多个异步请求，并等待所有请求都成功后才能进行下一步操作的场景。

手写 `Promise.all` 的主要挑战在于：
*   如何遍历输入的 Promise 数组。
*   如何收集每个 Promise 的解析结果，并保持原有顺序。
*   如何判断所有 Promise 都已完成（无论是解析还是拒绝）。
*   如何实现"有一个拒绝则全部拒绝"的错误处理机制。

##### 1.2 核心用法 + 示例代码（如题目涉及）

以下是手写 `Promise.myAll` 的实现及其测试用例：

```javascript
/**
 * 模拟实现 Promise.all
 * @param {Array<Promise>} promises - Promise 实例的可迭代对象
 * @returns {Promise} - 返回一个新的 Promise
 */
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    // 确保输入是可迭代对象，并转换为数组
    const promisesArray = Array.from(promises);
    const results = []; // 存储所有 Promise 的解析值
    let fulfilledCount = 0; // 记录已解析的 Promise 数量
    const totalPromises = promisesArray.length;

    // 如果没有 Promise，则直接返回一个解析为[]的 Promise
    if (totalPromises === 0) {
      resolve([]);
      return;
    }

    promisesArray.forEach((promise, index) => {
      // 将非 Promise 值包装成 Promise，以确保统一处理
      Promise.resolve(promise)
        .then(value => {
          results[index] = value; // 保持结果顺序
          fulfilledCount++;
          // 当所有 Promise 都解析时，resolve 最终结果
          if (fulfilledCount === totalPromises) {
            resolve(results);
          }
        })
        .catch(reason => {
          // 只要有一个 Promise 拒绝，整个 Promise.myAll 就会拒绝
          reject(reason);
        });
    });
  });
};

//   测试用例

// 1. 所有 Promise 都成功
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 50));
const p3 = Promise.resolve(3);

Promise.myAll([p1, p2, p3])
  .then(values => {
    console.log('Test 1 (All resolved):', values); // Expected: [1, 2, 3]
  })
  .catch(error => {
    console.error('Test 1 Error:', error);
  });

// 2. 有一个 Promise 失败
const p4 = Promise.resolve('A');
const p5 = Promise.reject('Error occurred'); // 这个会触发 catch
const p6 = new Promise(resolve => setTimeout(() => resolve('C'), 10));

Promise.myAll([p4, p5, p6])
  .then(values => {
    console.log('Test 2 (One rejected):', values);
  })
  .catch(error => {
    console.error('Test 2 Error (Expected):', error);
  });

// 3. 空数组
Promise.myAll([])
  .then(values => {
    console.log('Test 3 (Empty array):', values); // Expected: []
  })
  .catch(error => {
    console.error('Test 3 Error:', error);
  });

// 4. 包含非 Promise 值
Promise.myAll([1, Promise.resolve(2), 'hello', new Promise(resolve => setTimeout(() => resolve(4), 20))])
  .then(values => {
    console.log('Test 4 (Mixed values):', values); // Expected: [1, 2, "hello", 4]
  })
  .catch(error => {
    console.error('Test 4 Error:', error);
  });
```

##### 1.3 常见误区或面试陷阱

*   **结果顺序不一致：** 忘记使用 `results[index] = value` 而是简单地 `push`，导致最终结果数组的顺序与输入 Promise 的顺序不一致。
*   **没有处理非 Promise 值：** `Promise.all` 会将输入数组中的非 Promise 值自动包装成 Promise。手写时如果直接 `.then()` 可能会出错，需要使用 `Promise.resolve(promise)` 来统一处理。
*   **计数器逻辑错误：** `fulfilledCount` 的递增和判断条件写错，导致提前 `resolve` 或无法 `resolve`。
*   **错误处理不符合规范：**
    *   没有实现"有一个拒绝则全部拒绝"的机制，而是等待所有 Promise 完成。
    *   在 `catch` 中没有 `reject(reason)`，导致返回的 Promise 始终处于 `pending` 或 `fulfilled` 状态。
*   **空数组的处理：** 忘记处理输入为空数组 `[]` 的情况，在这种情况下 `Promise.all` 应该立即 `resolve([])`。
*   **同步 Promise 的处理：** 如果输入数组包含已经 `resolved` 或 `rejected` 的同步 Promise，它们的回调应该能够立即执行，而不是等待 `setTimeout` 或其他异步操作。`Promise.resolve()` 可以确保这一点。
*   **对 `Promise.all` 的误解：** 有些人会误认为 `Promise.all` 是串行执行 Promise，但它实际上是并发执行。面试时需要明确这一点。

</details>

## 16. 常见HTTP方法 {#question-subjective-14843f81e1d4}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● HTTP 协议基础：考察候选人对 HTTP 协议核心概念（请求方法、状态码等）的理解。

● RESTful API 设计：验证候选人是否能将 HTTP 方法与资源的 CRUD 操作对应起来。

● 方法特性：了解候选人对 HTTP 方法的安全性（Safe）和幂等性（Idempotent）的认识。

● 实际应用：评估候选人能否结合具体场景说明不同 HTTP 方法的使用。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

HTTP (Hypertext Transfer Protocol) 协议定义了客户端和服务器之间通信的规则。HTTP 方法（也称为动词）是客户端向服务器发送请求时，指示对指定资源执行操作的类型。这些方法是 RESTful API 设计的基础，它们将操作映射到 HTTP 请求上，使得 API 更加语义化和标准化。

在介绍 HTTP 方法时，通常会提及两个重要特性：
*   **安全性 (Safe):** 一个 HTTP 方法是安全的，意味着它**不会修改**服务器上的资源状态。多次调用安全方法，服务器上的资源状态都不会改变。例如，`GET` 和 `HEAD` 方法是安全的。
*   **幂等性 (Idempotent):** 一个 HTTP 方法是幂等的，意味着对同一个 URL 的同一请求执行多次，所产生的**副作用与执行一次是相同的**。简单来说，多次请求对资源的影响是相同的，不会创建额外的资源或产生不可预测的结果。例如，`GET`, `HEAD`, `PUT`, `DELETE` 方法是幂等的。`POST` 方法通常不是幂等的，因为多次提交可能会创建多个资源。

理解这些方法及其特性对于设计健壮、可预测和易于理解的 Web 服务至关重要。

##### 1.2 核心用法 + 示例代码（如题目涉及）

以下是常见的 HTTP 方法及其详细说明：

1.  **GET：**
    *   **用途：** 从服务器请求获取指定资源。
    *   **安全性：** **安全** (Safe)。
    *   **幂等性：** **幂等** (Idempotent)。
    *   **特点：** 请求参数通常通过 URL 的查询字符串传递。不应在 GET 请求中包含敏感数据，也不应用于修改资源。
    *   **使用场景：** 获取文章列表、查询用户信息、下载文件等。
    *   **示例：** `GET /api/users/123` (获取 ID 为 123 的用户数据)

2.  **POST：**
    *   **用途：** 向服务器提交数据，通常用于创建新资源。
    *   **安全性：** **不安全** (Not Safe)。
    *   **幂等性：** **不幂等** (Not Idempotent)（通常，多次 POST 同一数据可能创建多个资源）。
    *   **特点：** 请求参数通常通过请求体 (Request Body) 传递。
    *   **使用场景：** 创建新用户、提交表单数据、上传文件等。
    *   **示例：** `POST /api/users` (创建新用户，请求体中包含用户数据)

3.  **PUT：**
    *   **用途：** 更新指定资源，或者如果资源不存在则创建该资源（完全替换）。
    *   **安全性：** **不安全** (Not Safe)。
    *   **幂等性：** **幂等** (Idempotent)。多次 PUT 同一数据对资源的影响是相同的。
    *   **特点：** 请求体中包含资源的完整表示。
    *   **使用场景：** 更新用户所有信息、替换整个文档等。
    *   **示例：** `PUT /api/users/123` (更新 ID 为 123 的用户所有信息，请求体中包含完整的用户数据)

4.  **DELETE：**
    *   **用途：** 删除指定资源。
    *   **安全性：** **不安全** (Not Safe)。
    *   **幂等性：** **幂等** (Idempotent)。多次 DELETE 同一资源，结果都是该资源被删除。
    *   **特点：** 通常没有请求体。
    *   **使用场景：** 删除用户、删除文章等。
    *   **示例：** `DELETE /api/users/123` (删除 ID 为 123 的用户)

5.  **PATCH：**
    *   **用途：** 对指定资源进行部分修改。
    *   **安全性：** **不安全** (Not Safe)。
    *   **幂等性：** **不幂等** (Not Idempotent)（取决于服务器如何处理部分修改，但通常认为不是幂等的）。RFC 5789 中指出，如果 PATCH 请求的语义是幂等的，那么它就是幂等的。但普遍认为它的副作用可能不幂等。
    *   **特点：** 请求体中只包含需要修改的字段。
    *   **使用场景：** 只修改用户邮箱，不修改其他信息。
    *   **示例：** `PATCH /api/users/123` (只修改 ID 为 123 的用户的邮箱，请求体中只包含 `{ "email": "new@example.com" }`)

6.  **HEAD：**
    *   **用途：** 请求获取与 GET 请求相同的响应头，但不返回响应体。
    *   **安全性：** **安全** (Safe)。
    *   **幂等性：** **幂等** (Idempotent)。
    *   **特点：** 用于检查资源是否存在、检查资源大小、类型或最近修改时间，而无需下载整个资源。
    *   **使用场景：** 网站健康检查、预检测大文件下载、检查缓存有效性。
    *   **示例：** `HEAD /api/images/photo.jpg` (获取图片头信息，不下载图片)

7.  **OPTIONS：**
    *   **用途：** 用于获取目标资源所支持的通信选项。
    *   **安全性：** **安全** (Safe)。
    *   **幂等性：** **幂等** (Idempotent)。
    *   **特点：** 通常用于 CORS (跨域资源共享) 预检请求 (Preflight Request)，浏览器会先发送 OPTIONS 请求，询问服务器是否允许实际的跨域请求。
    *   **使用场景：** CORS 预检、查看服务器支持哪些 HTTP 方法。
    *   **示例：** 浏览器自动发送 `OPTIONS /api/users` (检查 `/api/users` 资源支持哪些方法)

##### 1.3 常见误区或面试陷阱

*   **混淆安全性和幂等性：** 很多人会把这两个概念混淆，或者认为安全就一定幂等。需要明确安全方法不改变资源状态，而幂等方法多次执行结果相同。
    *   `GET` 和 `HEAD` 是安全的，也是幂等的。
    *   `PUT` 和 `DELETE` 是不安全的，但它们是幂等的。
    *   `POST` 是不安全且通常不幂等的。
    *   `PATCH` 是不安全且通常不幂等的（取决于具体实现）。
*   **GET 请求用于修改数据：** 严格来说，GET 请求不应该用于修改服务器上的资源状态。如果面试者提到用 GET 修改数据，说明对 HTTP 规范理解不足。
*   **PUT 和 PATCH 的区别：** 混淆 PUT 是完全替换资源，而 PATCH 是部分更新资源。这是 RESTful API 设计中的重要区别。
*   **OPTIONS 方法的用途：** 不了解 OPTIONS 主要用于 CORS 预检请求，或者不知道它还能用来查询服务器支持的方法。
*   **幂等性实现细节：** 虽然 HTTP 规范定义了方法的幂等性，但在实际后端实现中，仍然需要开发者确保操作的幂等性。例如，更新操作需要确保是基于唯一标识的替换，而不是追加。
*   **HTTP/1.1 和 HTTP/2 对方法的影响：** 虽然 HTTP/2 引入了多路复用等特性，但它并没有改变 HTTP 方法的语义和特性。HTTP 方法是应用层协议的定义，与传输层无关。

</details>

## 17. HEAD请求的特点及与GET的区别 {#question-subjective-b69bea6700ed}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● HTTP 请求方法理解：考察候选人对 `HEAD` 方法的特定用途和工作原理的掌握。

● HTTP 协议细节：验证候选人对 HTTP 请求和响应结构（特别是响应头）的理解。

● 性能优化意识：了解候选人是否能识别并利用 `HEAD` 方法进行资源预检、缓存控制等性能优化。

● 实际应用场景：评估候选人能否举例说明 `HEAD` 方法在实际开发中的应用。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

`HEAD` 请求方法是 HTTP 协议中定义的一种请求，其行为与 `GET` 请求非常相似，但有一个关键区别：`HEAD` 请求只请求资源的响应头 (Response Headers)，而不会返回响应体 (Response Body)。

**`HEAD` 请求的特点：**
*   **无响应体：** 服务器在响应 `HEAD` 请求时，必须返回与对应 `GET` 请求相同的响应头，但响应体为空。
*   **安全性：** `HEAD` 方法是**安全**的，因为它不会对服务器上的资源产生任何修改。
*   **幂等性：** `HEAD` 方法是**幂等**的，多次发送 `HEAD` 请求，服务器上的资源状态不会改变，产生的副作用也相同。
*   **用于元数据检查：** 主要用于获取资源的元数据（如内容类型 `Content-Type`、内容长度 `Content-Length`、最后修改时间 `Last-Modified`、缓存控制 `Cache-Control`、ETag 等），而无需下载整个资源。

##### 1.2 核心用法 + 示例代码（如题目涉及）

**与 `GET` 请求的区别：**

| 特性         | GET 请求                                    | HEAD 请求                                      |
| :----------- | :------------------------------------------ | :--------------------------------------------- |
| **响应体**   | 返回资源的完整响应体                        | **不返回**响应体，只返回响应头                   |
| **安全性**   | 安全                                        | 安全                                           |
| **幂等性**   | 幂等                                        | 幂等                                           |
| **主要用途** | 获取资源内容                                | 获取资源元数据，不下载内容                       |
| **带宽消耗** | 较高（传输整个资源内容）                    | 较低（只传输响应头）                             |

**使用场景：**

1.  **检查资源是否存在 (文件或页面)：** 在下载大文件之前，可以发送 `HEAD` 请求来检查文件是否存在，避免不必要的带宽消耗。
    *   例如：在用户点击下载链接前，先用 `HEAD` 请求验证文件 URL 是否有效，如果返回 404，则提示文件不存在。

2.  **获取资源元信息 (文件大小、类型、修改时间)：** 客户端需要知道文件大小来显示下载进度，或判断文件类型以决定如何处理。
    *   例如：图片懒加载时，可以先用 `HEAD` 请求获取图片尺寸，根据尺寸预设占位符。
    *   断点续传前，客户端可以发送 `HEAD` 请求获取文件总大小，然后决定从哪里开始下载。

3.  **验证缓存有效性：** 结合 `If-Modified-Since` 或 `If-None-Match` 等请求头，可以发送 `HEAD` 请求来询问服务器资源是否被修改。如果未修改，服务器会返回 304 Not Modified 状态码，客户端可以使用本地缓存。
    *   **流程：** 客户端发送 `HEAD` 请求，并在请求头中带上上次获取到的 `Last-Modified` 或 `ETag`。服务器收到请求后，如果资源未修改，则返回 304，客户端继续使用本地缓存；如果资源已修改，则返回 200 OK 并带上新的响应头（但无响应体），客户端再决定是否发送 `GET` 请求获取新内容。

4.  **网站健康检查或爬虫：** 自动化工具（如爬虫、监控系统）可以使用 `HEAD` 请求来快速检查网站的连通性、页面是否存在、服务器状态码等，而无需下载整个页面内容，从而节省带宽和时间。

**示例代码 (JavaScript Fetch API 模拟):**

```javascript
async function checkResourceInfo(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD' // 使用 HEAD 方法
    });

    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

    if (response.ok) {
      const contentLength = response.headers.get('Content-Length');
      const contentType = response.headers.get('Content-Type');
      const lastModified = response.headers.get('Last-Modified');
      console.log(`文件大小: ${contentLength ? (parseInt(contentLength) / 1024).toFixed(2) + ' KB' : '未知'}`);
      console.log(`文件类型: ${contentType || '未知'}`);
      console.log(`最后修改时间: ${lastModified || '未知'}`);
      return true;
    } else {
      console.log('资源不可用或请求失败。');
      return false;
    }
  } catch (error) {
    console.error('HEAD 请求发生错误:', error);
    return false;
  }
}

// 示例调用：
// 检查一个存在的图片
checkResourceInfo('https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png');

// 检查一个可能不存在的资源
// checkResourceInfo('https://example.com/nonexistent-file.txt');
```

##### 1.3 常见误区或面试陷阱

*   **误认为 `HEAD` 也是修改操作：** 有些人会混淆 `HEAD` 和 `GET`，甚至错误地认为 `HEAD` 也会对资源进行修改。强调其安全性和幂等性。
*   **不了解 `HEAD` 的具体用途：** 仅仅知道 `HEAD` 没有响应体，但说不出具体的应用场景。能够举例说明在文件上传前的预检、缓存验证、健康检查等场景，会显示更深入的理解。
*   **与 `OPTIONS` 的混淆：** 虽然都只返回头信息，但 `OPTIONS` 用于查询服务器支持的方法，而 `HEAD` 是获取特定资源的元数据。
*   **服务器不支持 `HEAD`：** 尽管 `HEAD` 是 HTTP 规范的一部分，但某些不规范的服务器或 Web 应用可能没有正确实现 `HEAD` 方法，或者将其重定向到 `GET` 请求并返回空响应体。这在实际中需要注意。
*   **前端滥用 `HEAD`：** 不是所有情况下都适合用 `HEAD`。例如，如果每次检查都要发起新的网络请求，而后续紧接着就是 `GET` 请求，那么两次请求的开销可能不如一次 `GET` 请求。需要权衡网络开销和实际需求。

</details>

## 18. 状态码301/302/401/403的区别 {#question-subjective-7f2dd92e8f6f}

### 题目要点

● 面试官出这道题主要想确认哪些知识维度？

● HTTP 协议基础：考察候选人对 HTTP 状态码的理解，特别是重定向和认证授权相关的状态码。

● 网络请求流程：验证候选人对浏览器处理不同状态码时的行为。

● SEO 影响：了解候选人对 301 和 302 在搜索引擎优化方面的区别。

● 安全与鉴权：评估候选人对 401 和 403 在用户认证和权限控制中的作用。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明

HTTP 状态码是服务器对客户端请求的响应，它由一个三位数字组成，表示请求的结果。理解这些状态码对于 Web 开发人员至关重要，因为它能帮助我们诊断问题、设计正确的重定向策略以及实现安全的认证和授权机制。

这里主要区分的四种状态码分别涉及**重定向**和**认证/授权**。

*   **重定向 (Redirection - 3xx 系列):**
    当客户端请求的资源位于另一个 URL 时，服务器会发送重定向状态码，并告知客户端新的资源位置。
*   **客户端错误 (Client Error - 4xx 系列):**
    表示客户端发送的请求有错误，服务器无法处理。
*   **服务器错误 (Server Error - 5xx 系列):**
    表示服务器在处理请求时发生了错误。

##### 1.2 核心用法 + 示例代码（如题目涉及）

以下是 301、302、401、403 状态码的区别：

1.  **301 Moved Permanently (永久重定向)**
    *   **含义：** 表示请求的资源已被**永久**移动到新的 URL。
    *   **特点：**
        *   搜索引擎会将旧 URL 的所有权重（如 PR 值）转移到新 URL，对 SEO 友好。
        *   浏览器和客户端会**缓存**新的 URL，下次直接访问新 URL，不再访问旧 URL。
        *   重定向后，请求方法可能会从 POST 变为 GET。
    *   **使用场景：**
        *   网站改版，页面 URL 结构发生永久性改变。
        *   网站域名变更。
        *   强制 HTTPS（将 HTTP 请求永久重定向到 HTTPS）。
    *   **示例 (Nginx 配置):**
        ```nginx
        server {
            listen 80;
            server_name old-domain.com;
            return 301 https://new-domain.com$request_uri; # 永久重定向到新域名
        }
        ```

2.  **302 Found (临时重定向)**
    *   **含义：** 表示请求的资源已被**临时**移动到新的 URL。
    *   **特点：**
        *   搜索引擎**不会**将旧 URL 的权重转移到新 URL，因为是临时性的。对 SEO 不友好。
        *   浏览器和客户端**不会缓存**新的 URL，下次仍然会访问旧 URL。
        *   重定向后，请求方法通常会从 POST 变为 GET（尽管 HTTP/1.1 规范允许保持原方法，但大多数浏览器会改为 GET）。
    *   **使用场景：**
        *   A/B 测试：根据用户特征临时重定向到不同版本的页面。
        *   负载均衡：将请求临时分发到不同的服务器。
        *   短时维护页面：网站临时维护，重定向到维护通知页。
        *   登录成功后的跳转：用户登录后，跳转到之前请求的页面。
    *   **示例 (Express.js 后端):**
        ```javascript
        app.get('/old-path', (req, res) => {
          res.redirect(302, '/new-temporary-path'); // 临时重定向
        });
        ```
    *   **注意：** HTTP/1.1 引入了 303 See Other 和 307 Temporary Redirect 来更明确地处理 302 的歧义性：
        *   **303 See Other：** 明确指示客户端使用 `GET` 方法请求新的 URI。通常用于 `POST` 请求后，避免用户刷新页面导致重复提交。
        *   **307 Temporary Redirect：** 明确指示客户端使用**原始请求方法**（GET/POST 等）请求新的 URI。

3.  **401 Unauthorized (未授权)**
    *   **含义：** 表示客户端的请求需要**用户认证**。通常意味着客户端没有提供有效的认证凭据（如用户名、密码或 Token）。
    *   **特点：**
        *   服务器会要求客户端进行身份验证。
        *   响应头中通常会包含 `WWW-Authenticate` 字段，指示客户端应使用何种认证方式（如 Basic, Digest, Bearer 等）。
        *   客户端收到 401 后，通常会弹窗让用户输入凭据，或重定向到登录页面。
    *   **使用场景：**
        *   访问需要登录才能查看的页面或 API。
        *   提供的 API Token 无效或已过期。
    *   **示例 (后端模拟):**
        ```javascript
        app.get('/protected-resource', (req, res) => {
          if (!req.headers.authorization) {
            res.status(401).set('WWW-Authenticate', 'Bearer realm="Protected Area"').send('Unauthorized: Missing token');
            return;
          }
          // 验证 token 逻辑...
          // ...
          res.send('Welcome to protected resource!');
        });
        ```

4.  **403 Forbidden (禁止访问)**
    *   **含义：** 表示服务器理解客户端的请求，但**拒绝执行**它。通常意味着用户没有足够的权限访问该资源，即使提供了认证凭据。
    *   **特点：**
        *   服务器**不会**要求客户端进行身份验证，因为服务器已经知道你是谁，但你就是没权限。
        *   与 401 不同，403 表示**权限不足**，而不是身份未验证。
    *   **使用场景：**
        *   普通用户尝试访问管理员页面。
        *   用户没有某个特定资源的读写权限。
        *   IP 黑名单。
    *   **示例 (后端模拟):**
        ```javascript
        app.get('/admin-dashboard', (req, res) => {
          // 假设 req.user 是通过认证获取的用户信息
          if (!req.user || req.user.role !== 'admin') {
            res.status(403).send('Forbidden: You do not have administrator privileges.');
            return;
          }
          res.send('Admin Dashboard Content');
        });
        ```

##### 1.3 常见误区或面试陷阱

*   **混淆 301 和 302 的 SEO 影响和缓存行为：** 这是最常见的误区。强调 301 是永久的、会传递权重、会被缓存；302 是临时的、不传递权重、不被缓存。
*   **混淆 401 和 403：** 简单理解为 401 是"未登录"，403 是"没权限"是不够的。更准确的说法是，401 是"需要认证"（你还没证明你是谁），403 是"禁止访问"（我已经知道你是谁，但你没有权限）。
*   **HTTP 方法在重定向后的变化：** 很多人不清楚 301/302 重定向后，POST 请求通常会变为 GET。虽然 HTTP 规范对此有更细致的定义 (303/307)，但面试时理解浏览器默认行为很重要。
*   **后端实现重定向的细节：** 不仅仅知道状态码，还需要了解如何在后端（如 Nginx、Node.js Express、Java Spring 等）配置或代码实现这些重定向。
*   **认证与授权的区别：** 401 涉及到**认证 (Authentication)**，即你是谁。403 涉及到**授权 (Authorization)**，即你有什么权限。这是信息安全中的两个核心概念。
*   **浏览器对状态码的自动处理：** 客户端（浏览器）接收到 3xx 状态码后会自动进行跳转，开发者通常不需要手动处理。但对于 4xx 和 5xx 状态码，则需要前端进行错误提示或相应处理。

</details>

## 19. 对node的了解 {#question-subjective-e4e7b618f116}

### 题目要点

● 本题为主观题，没有标准答案，旨在考察候选人对Node.js的理解深度、应用场景认知以及实际项目经验。

● 面试官希望了解候选人对Node.js作为运行时环境的特点（如非阻塞I/O、事件驱动）、其在前端工程化、BFF、Web服务等方面的应用，并能结合自身经验阐述。

● 建议回答结构：Node.js的定位与核心特点 → 在项目中的应用场景（前端工程化/BFF/小型服务）→ 结合具体例子说明实践经验与所解决的问题 → 总结对Node.js的看法。

<details>
<summary>参考答案</summary>

我对Node.js的理解是，它是一个基于Chrome V8引擎的JavaScript运行时环境。与传统的JavaScript只能在浏览器中运行不同，Node.js使得JavaScript能够脱离浏览器环境，在服务器端进行开发，这极大地拓展了JavaScript的应用场景。

Node.js最核心的特点是其**非阻塞I/O和事件驱动**的架构。这意味着它在处理大量并发请求时表现出色，因为它不会等待一个I/O操作完成才去处理下一个，而是通过事件循环机制，将耗时的I/O操作放入后台，待其完成时触发回调函数。这种异步、事件驱动的模式，使得Node.js非常适合构建高性能、可伸缩的网络应用，特别是I/O密集型的应用。

在实际项目中，我主要在以下两个方面应用了Node.js：

首先，在**前端工程化**方面，Node.js是不可或缺的基石。我所在的项目中，我们使用Node.js环境下的NPM/Yarn进行包管理，通过Webpack、Rollup等构建工具进行代码打包、模块化管理、代码压缩和Babel转译。例如，我曾参与配置Webpack，优化了项目的构建速度，通过Tree Shaking减少了打包体积，并实现了按需加载，这些都离不开Node.js环境的支持。此外，一些前端自动化脚本，如代码检查（ESLint）、单元测试（Jest）以及部署脚本，也都是基于Node.js环境运行的。

其次，我也有一些在**BFF (Backend For Frontend)** 层面的实践经验。在[项目名称，例如：一个内部管理系统]中，我们利用Node.js搭建了一个轻量级的BFF层。这个BFF层的主要作用是聚合多个后端微服务的API数据，进行数据适配和裁剪，然后统一返回给前端。这避免了前端直接与多个复杂的后端服务交互，减少了前端的请求次数和数据处理复杂度。例如，在用户列表页面，BFF层会同时调用用户服务、权限服务和部门服务，将返回的数据进行整合和格式化，再发送给前端，大大简化了前端的数据获取逻辑。这种模式提升了前端开发效率，也使前后端职责更加清晰。

总的来说，Node.js对于我来说，不仅仅是一个后端技术，更是连接前端与后端、赋能前端开发效率提升的重要工具。它的非阻塞特性和庞大的NPM生态系统，让JavaScript在全栈开发中变得更加强大和灵活。

</details>

## 20. 对Linux 的熟悉情况 {#question-subjective-870950ade441}

### 题目要点

● 本题为主观题，没有标准答案，旨在考察候选人对Linux操作系统基础知识、常用命令的掌握，以及在开发和部署环境中的实际应用经验。

● 面试官希望了解候选人是否参与过项目在Linux服务器上的部署、日志查看、进程管理等操作，以及在Linux环境下进行简单故障排查的能力。

● 建议回答结构：简述对Linux的整体认知 → 常用Linux命令的掌握程度与应用场景 → 在项目部署、运维或开发环境中的实践经验 → 遇到问题时的排查思路。

<details>
<summary>参考答案</summary>

我对Linux的熟悉程度主要体现在日常开发和项目部署维护中。虽然我主要从事前端开发，但由于很多项目最终都会部署在Linux服务器上，所以我对Linux的基础操作和常用命令有比较扎实的了解。

在日常工作中，我经常使用一些基本的Linux命令来管理文件和目录，例如`ls`用于列出文件、`cd`用于切换目录、`cp`和`mv`用于复制和移动文件、`rm`用于删除。为了查找文件内容或日志信息，我会频繁使用`grep`命令配合正则表达式进行筛选，比如`grep -r "error" /var/log/nginx/`来快速定位Nginx的错误日志。此外，`cat`、`head`、`tail`等命令用于查看文件内容，对于查看实时日志，`tail -f`更是必不可少。对于一些权限问题，我也会使用`chmod`和`chown`来调整文件或目录的权限和所有者。

在项目部署和维护方面，我参与过将前端项目打包后的静态资源部署到Linux服务器的经验。这个过程通常涉及到通过`ssh`远程连接服务器，然后使用`scp`或`rsync`将本地打包好的文件上传到服务器指定目录。在服务器上，我会使用`tar`命令进行文件的解压和打包。对于Node.js后端服务或者一些需要后台运行的前端服务（如SSR应用），我会使用`pm2`这样的进程管理工具来管理应用的启动、停止、重启和查看运行状态，确保服务稳定运行。当服务出现问题时，我首先会检查应用程序的日志，结合`journalctl`或`systemctl status`查看系统服务状态，如果涉及到端口占用，还会使用`netstat`或`lsof`来查找占用端口的进程，然后通过`kill`命令终止它。

总的来说，我对Linux的熟悉主要集中在开发、部署和初步故障排查的层面。我认为理解Linux环境对于前端工程师来说也非常重要，它能帮助我们更好地理解项目从开发到上线的全过程，并能在出现问题时具备一定的独立排查能力。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-40/_index.md" >}}) · 已是最后一轮 →
