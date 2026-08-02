+++
title = "百度-APP产品研发-秋招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "百度", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/69"
experienceId = 69
roundId = 115
roundOrder = 1
company = "百度"
date = "2025-08-20T14:54:45.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-69/round-112/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-69/_index.md" >}}) · 已是最后一轮 →

**面试时间：** 60分钟

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你在官网开发中的主要职责，开发的模块以及你觉的比较亮点的地方 {#question-subjective-81b93f8982e5}

### 题目要点

如果是面试官问到“官网开发中的主要职责、开发的模块以及比较亮点的地方”，一般可以从以下几个角度来回答，既展示你的全局把控能力，又体现你在某些点上有深度。

<details>
<summary>参考答案</summary>

如果是面试官问到“官网开发中的主要职责、开发的模块以及比较亮点的地方”，一般可以从以下几个角度来回答，既展示你的全局把控能力，又体现你在某些点上有深度。

下面是一个参考思路：

---

### 1. 主要职责

* **官网整体架构搭建**：根据业务和设计稿，使用 React/Vue + Vite/Next.js/Nuxt.js 等技术栈完成整体框架搭建，包括路由、状态管理、多语言支持等。
* **公共模块封装**：抽象公共组件（如导航栏、页脚、轮播、富文本渲染、内容卡片等），提高复用率，减少重复开发。
* **性能优化**：处理首屏加载速度、资源拆分、图片懒加载、SSR/SSG、SEO 优化。
* **协作沟通**：与产品、UI、后端保持沟通，保证页面上线节奏和质量。

---

### 2. 负责的模块（可根据实际情况举例）

* **首页**：承担品牌形象展示，涉及 banner 动效、动态数据展示、视频播放等。
* **产品/解决方案页**：结合后端接口，展示不同产品模块，支持筛选、搜索、动态路由。
* **活动/新闻动态页**：接入 CMS（如 Strapi、Sanity、WordPress 等），支持运营人员通过后台直接发布。
* **多语言切换模块**：基于 i18n 实现官网多语言，支持自动识别浏览器语言，静态资源跟随切换。
* **SEO 优化模块**：处理 meta 信息、OG 标签、站点地图、robots.txt，提升搜索引擎收录效果。

---

### 3. 亮点/难点突破

* **性能优化亮点**

  * 利用 SSR/SSG（Next.js/Nuxt.js）提升首屏渲染速度，Lighthouse 分数提升到 90+。
  * 使用图片 CDN + WebP 格式，首页加载时间缩短 30%。
  * 按需加载组件、拆分 bundle，减少首次请求体积。

* **可配置化思路**

  * 引入 **CMS 系统**，实现官网内容可配置，避免频繁改代码上线，运营可直接维护。
  * 封装通用“模块化组件”，如 Banner、富文本、图文组合，做到拖拽/配置式渲染。

* **前端体验优化**

  * 首页/产品页引入 **动效**（基于 Lottie 或 GSAP），提升视觉冲击力。
  * 交互细节（滚动吸附、视差动画、过渡效果）增强用户沉浸感。

* **工程化实践**

  * Monorepo 管理（pnpm + Turborepo），保证组件库与官网复用。
  * GitLab CI/CD 实现自动化部署，配合灰度发布。

</details>

## 2. 你所在的团队有多少人？团队成员的分工和协作方式。 {#question-subjective-4afbf719d2d1}

### 题目要点

**回答示例：**

<details>
<summary>参考答案</summary>

**回答示例：**
我所在的团队大概有 **6 个人**，包括 1 位产品经理、1 位设计师、3 位前端工程师和 1 位后端工程师。

* **产品经理** 负责需求梳理和优先级排期，会在迭代开始前组织需求评审，确保大家对目标一致。
* **设计师** 负责交互和视觉稿，并且在开发过程中会跟进设计还原度。
* **前端团队** 内部分工比较灵活，会根据模块复杂度来分配，每个人主导几个核心功能模块，同时会互相 Code Review 保证代码质量。
* **后端工程师** 负责接口的设计与实现，并和前端保持接口对齐，通常通过接口文档或 Swagger 管理。

在协作方式上：

* 我们遵循 **敏捷迭代**，每两周一个 Sprint。
* 每天会有 **站会** 汇报进展和问题。
* 项目管理工具使用 **Jira / 飞书项目管理** 来跟踪任务。
* 代码托管在 **GitLab/GitHub**，采用 **分支开发 + Merge Request + Code Review** 流程。
* 前后端对接会通过 **Mock 数据** 或者 **接口联调环境** 提前解耦开发进度。

这样的分工和协作方式可以保证团队效率，同时也能让大家各自负责的模块有充分的沉淀和优化空间。

</details>

## 3. 你的具体角色是什么？你主要负责哪些任务？ {#question-subjective-138757713273}

### 题目要点

核心考查：你的具体角色是什么？你主要负责哪些任务？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

略

</details>

## 4. 为什么需要对学校工作室网站进行重构？ {#question-subjective-99794f6a5033}

### 题目要点

网站重构不是“换个皮肤”，而是出于 **技术更新、体验优化、功能扩展、安全保障和团队发展** 的综合考虑。

<details>
<summary>参考答案</summary>

进行项目重构，通常有以下几个主要原因：

1. **技术老旧，维护困难**

   * 网站可能是几年前开发的，使用的框架或库已经过时，不再有社区支持或安全更新。
   * 旧代码可读性差、耦合度高，新成员难以上手维护。

2. **性能与兼容性问题**

   * 页面加载速度慢、移动端适配不佳，影响用户体验。
   * 在新浏览器或不同设备上的兼容性差，可能出现布局错乱或功能失效。

3. **功能扩展受限**

   * 随着工作室活动的增多，网站需要承载更多功能（报名系统、作品展示、动态发布等）。
   * 原有架构设计不足，扩展功能需要大量重构甚至“打补丁”，难以长期维持。

4. **设计与交互过时**

   * UI/UX 不符合当前审美和使用习惯，缺少响应式设计、交互体验单一。
   * 网站整体风格无法体现工作室的形象和专业性。

5. **安全性隐患**

   * 老旧框架可能存在已知漏洞，容易被攻击。
   * 缺乏完善的权限管理、数据防护措施。

6. **提升品牌和影响力**

   * 一个现代化、体验良好的官网能展示工作室的专业度，吸引更多学生和外部合作方。
   * 也是工作室对外展示成果和吸纳新成员的重要窗口。

7. **便于团队协作和持续迭代**

   * 采用现代工程化工具（如 monorepo、CI/CD）能提升开发效率。
   * 重构后代码更清晰，适合新同学学习和参与，利于工作室传承。

</details>

## 5. 在重构过程中，你重点关注了哪些方面？ {#question-subjective-1cf1d29570ab}

### 题目要点

核心考查：在重构过程中，你重点关注了哪些方面？的概念、原理与实际应用。

<details>
<summary>参考答案</summary>

略

</details>

## 6. 什么是min.js文件，它在项目中的作用是什么？ {#question-subjective-9e6a196c4e47}

### 题目要点

* `.min.js` 文件是 **压缩后的 JavaScript 文件**，体积更小，功能等价。
* 核心价值：**减少带宽占用、提升页面加载性能**。
* 一般作为 **生产环境部署的标准文件**，并结合 **Source Map** 保持可调试性。

<details>
<summary>参考答案</summary>

在前端工程中，常常可以看到 `.min.js` 文件，它是 **JavaScript 源文件的压缩版本（minified JavaScript）**。

## 一、什么是 `.min.js` 文件

* **来源**：由正常的 `.js` 文件通过构建工具（如 Webpack、Rollup、esbuild、UglifyJS、Terser）压缩生成。
* **压缩方式**：

  * 删除所有空格、换行、缩进；
  * 去掉注释；
  * 压缩变量和函数名（如 `function calculateValue` → `function a`）；
  * 合并表达式，减少冗余代码。
* **结果**：代码功能不变，但体积更小、可读性降低。

示例：

```js
// 原始文件 app.js
function sum(a, b) {
  return a + b;
}
console.log(sum(10, 20));
```

```js
// 压缩文件 app.min.js
function sum(n,o){return n+o}console.log(sum(10,20));
```

## 二、在项目中的作用

1. **减少文件体积**

   * 体积缩小通常能达到 30%–70%，直接减少网络传输开销。

2. **提升加载速度**

   * 体积更小 → 下载更快；
   * 解析和执行速度也有提升（尤其是移动端网络环境差的情况下）。

3. **代码混淆（一定程度上）**

   * 虽然压缩的主要目的不是安全，但由于变量名、函数名被替换，阅读难度增加，对直接篡改有一定阻碍作用。

4. **生产环境最佳实践**

   * 在开发阶段使用 `.js` 文件，保留注释和格式，方便调试；
   * 在生产部署阶段使用 `.min.js` 文件，提升性能。
   * 若需要调试生产代码，可以配合 **Source Map** 使用，保持线上代码可追溯到源码。

</details>

## 7. 为什么需要对JavaScript文件进行压缩（minification）？这会带来哪些好处？ {#question-subjective-df83174cf8c1}

### 题目要点

JavaScript 文件压缩的核心作用是：
* **减少文件大小**，降低网络传输压力；
* **加快页面加载速度**，提升性能与用户体验；
* **节省带宽成本**，对大规模业务尤为重要；
* 同时还能 **增加源码阅读难度**，起到一定保护作用。

<details>
<summary>参考答案</summary>

对 JavaScript 文件进行 **压缩（minification）** 是前端工程中一种常见的性能优化手段，它的核心目标是：**减少传输体积、提升加载速度、改善用户体验**。

压缩能带来的好处：

1. **减少网络传输体积**

   * 去掉空格、换行、注释，缩短变量名，常常能缩小 **30%–70% 的体积**；
   * 体积更小意味着资源加载更快，特别是在弱网或移动端环境下优势明显。

2. **提升页面加载速度**

   * 脚本下载更快 → 首屏渲染时间缩短；
   * 浏览器解析、执行代码时也能稍微受益。

3. **改善用户体验**

   * 减少页面白屏、卡顿的概率，降低用户流失率。

4. **节省带宽与服务器成本**

   * 小文件意味着更少的数据传输，能有效降低 CDN/服务器的带宽开销。

5. **代码混淆效果（附带的）**

   * 压缩工具会将函数名、变量名缩短（如 `calculateTotal` → `a`），一定程度上提升源码阅读难度，降低直接被复制利用的风险。

</details>

## 8. 设计和封装一个下拉框中的Tab组件 {#question-subjective-6f8e3def1f47}

### 题目要点

* **分层设计**：Dropdown 管理容器逻辑，Tabs 管理切换逻辑，组合层统一暴露接口。
* **高复用性**：Tabs 不依赖 Dropdown，可单独使用。
* **解耦性**：父组件通过 props/emit 传递数据和事件，不侵入子组件逻辑。
* **可扩展性**：Tabs 可以扩展为动态增加、异步数据加载等，Dropdown 可以加动画、定位优化。

<details>
<summary>参考答案</summary>

这是一个挺常见的前端组件设计题，考察点通常集中在 **UI 交互抽象能力、组件解耦、可复用性和扩展性**。

## 一、需求分析

1. 下拉框（Dropdown）作为外层容器，负责：

   * 控制展开/收起
   * 管理定位、动画、点击外部区域关闭
2. Tab 作为内部的切换区域，负责：

   * 维护当前激活的 tab
   * 支持内容区域随 tab 切换变化
   * 提供事件（onChange）供外层业务订阅

组合需求：

* 下拉框内的内容是 **Tab 切换面板**；
* 外层只关心业务数据和回调，不需要了解内部逻辑。

---

## 二、设计思路

采用 **组合式组件设计**：

* **Dropdown**：只关心下拉容器逻辑，不关心里面放的是什么；
* **Tabs**：独立封装 tab 切换逻辑，可在任何地方使用；
* **DropdownWithTabs**：是一个组合层，把 `Dropdown + Tabs` 拼起来对外暴露。

这种设计的好处：

* **职责单一**，Dropdown 不被 Tab 污染；
* Tabs 可以独立在页面其他区域复用；
* 业务方只需传入数据和事件即可。

---

## 三、核心实现（以 Vue3 为例，React 思路类似）

### 1. Dropdown 组件

```vue
<template>
  <div class="dropdown" ref="dropdownRef">
    <button @click="toggle">{{ label }}</button>
    <div v-if="visible" class="dropdown-menu">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({ label: String });
const visible = ref(false);
const dropdownRef = ref(null);

const toggle = () => visible.value = !visible.value;
const close = () => visible.value = false;

// 点击外部关闭
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    close();
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>
```

---

### 2. Tabs 组件

```vue
<template>
  <div class="tabs">
    <div class="tab-header">
      <div
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        :class="{ active: activeKey === tab.key }"
        @click="setActive(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tab-content">
      <slot :activeKey="activeKey" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  tabs: Array,
  defaultActiveKey: String
});
const emit = defineEmits(['change']);

const activeKey = ref(props.defaultActiveKey || props.tabs[0]?.key);

const setActive = (key) => {
  activeKey.value = key;
  emit('change', key);
};
</script>
```

---

### 3. 组合：DropdownWithTabs

```vue
<template>
  <Dropdown :label="label">
    <Tabs :tabs="tabs" :defaultActiveKey="defaultActiveKey" @change="onTabChange">
      <template #default="{ activeKey }">
        <slot :activeKey="activeKey" />
      </template>
    </Tabs>
  </Dropdown>
</template>

<script setup>
import Dropdown from './Dropdown.vue';
import Tabs from './Tabs.vue';

const props = defineProps({
  label: String,
  tabs: Array,
  defaultActiveKey: String
});
const emit = defineEmits(['tabChange']);

const onTabChange = (key) => emit('tabChange', key);
</script>
```

---

## 四、使用示例

```vue
<DropdownWithTabs
  label="选择分类"
  :tabs="[
    { key: 'user', label: '用户' },
    { key: 'order', label: '订单' }
  ]"
  defaultActiveKey="user"
  @tabChange="(k) => console.log('active tab:', k)"
>
  <template #default="{ activeKey }">
    <div v-if="activeKey === 'user'">用户列表</div>
    <div v-else-if="activeKey === 'order'">订单列表</div>
  </template>
</DropdownWithTabs>
```

</details>

## 9. 实现跟随鼠标移动和滚动的视觉差效果 {#question-subjective-bcdb11086d01}

### 题目要点

把鼠标位置和滚动量归一化，在 requestAnimationFrame 中统一更新 transform；避免高频事件直接改布局，并兼顾 passive 监听和减少动态效果偏好。

<details>
<summary>参考答案</summary>

核心做法是只在事件中记录状态，再由 `requestAnimationFrame` 每帧最多更新一次合成属性：

```js
const layer = document.querySelector('.parallax-layer');
let mouseX = 0;
let mouseY = 0;
let scrollY = window.scrollY;
let scheduled = false;

function render() {
  scheduled = false;
  const x = (mouseX / innerWidth - 0.5) * 24;
  const y = (mouseY / innerHeight - 0.5) * 16 + scrollY * 0.08;
  layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function schedule() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(render);
  }
}

addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  schedule();
});
addEventListener('scroll', () => {
  scrollY = window.scrollY;
  schedule();
}, { passive: true });
```

样式侧应优先使用 `transform`，并可设置 `will-change: transform`。同时用 `prefers-reduced-motion` 为不希望看到动态效果的用户关闭或减弱视差。

</details>

## 10. CSS变量的概念，如何通过命名方式来提高代码的可维护性。 {#question-subjective-9a7add833f91}

### 题目要点

* **CSS 变量是运行时可修改的样式值**，区别于预处理器变量的静态特性。
* **维护性提升靠命名规范**：

  * 分层（基础 → 语义 → 组件）；
  * 命名空间（全局与局部区分）；
  * 语义化（避免硬编码颜色名/值）。
* 这种设计类似 **Design Token** 思路，有助于统一设计语言、支持主题切换和长远维护。

<details>
<summary>参考答案</summary>

## 一、CSS 变量的概念

CSS 变量是 **可在整个样式表中复用的自定义属性**，通过 `--variable-name` 定义，并用 `var(--variable-name)` 调用。

例如：

```css
:root {
  --primary-color: #3498db;
  --font-size-base: 16px;
}

button {
  color: var(--primary-color);
  font-size: var(--font-size-base);
}
```

特点：

* **动态性**：运行时可被修改（如在 JS 中 `element.style.setProperty('--primary-color', 'red')`）。
* **继承性**：CSS 变量会随 DOM 层级继承，方便局部覆盖。
* **区别于预处理器变量**（Sass/Less）：预处理器变量在编译时确定，CSS 变量在运行时仍有效。

---

## 二、通过命名方式提升可维护性

在大型项目中，CSS 变量往往会非常多，如果没有规范，后续维护会很混乱。因此 **命名策略是核心**。

### 1. 分层命名（Design Token 思路）

把变量分层组织，比如：

* **色彩层**（原子值）：`--color-red-500`
* **语义层**（场景值）：`--color-primary`, `--color-success`
* **组件层**（具体使用）：`--button-bg`, `--card-border-radius`

这样如果某个主题色需要修改，只需改语义层，不会影响其他地方。

### 2. 命名空间化

* 公共变量用全局前缀：`--app-*`
* 组件私有变量用组件名前缀：`--button-*`, `--modal-*`
  避免全局变量过度污染。

### 3. 层级与作用域结合

* 在 `:root` 中定义全局基础变量（颜色、字号、间距）；
* 在组件作用域内覆盖变量（如 `:host { --button-color: var(--color-primary); }`）。

### 4. 命名语义化而不是硬编码

错误：

```css
--blue: #3498db;
```

这样如果主题从蓝色改为绿色，就需要全局替换。

正确：

```css
--color-primary: #3498db;
```

只需替换一次即可全局生效。

</details>

## 11. 前端中实现异步操作的主要方案有哪些？ {#question-subjective-e6a719b42632}

### 题目要点

异步操作的方案可以按**复杂度和应用场景**选择：

1. **简单一次性异步**：`setTimeout / XMLHttpRequest 回调`
2. **可链式处理和错误集中**：`Promise`
3. **可同步化书写异步逻辑**：`async / await`
4. **事件驱动、多值流处理**：`Observable / 事件监听`

现代前端项目中，最常用的是 **Promise + async/await**，配合事件监听或 WebSocket 处理实时异步场景。

<details>
<summary>参考答案</summary>

在前端开发中，异步操作非常常见，例如网络请求、定时器、文件读取、动画等。实现异步操作的主要方案可以从 **历史演进和现代用法** 两个角度理解：

---

## 一、回调函数（Callback）

最原始的异步实现方式。

* **原理**：将需要在异步操作完成后执行的逻辑作为函数参数传入。
* **示例**：

```js
setTimeout(() => {
  console.log('异步执行完成');
}, 1000);
```

* **优点**：简单直观，兼容所有环境。
* **缺点**：容易出现“回调地狱”，嵌套深层逻辑难以维护；错误处理复杂。

---

## 二、事件监听（Event）

异步操作通过事件通知结果。

* **应用场景**：DOM 事件、WebSocket、文件读取等。
* **示例**：

```js
const button = document.querySelector('button');
button.addEventListener('click', () => {
  console.log('按钮点击异步处理');
});
```

* **特点**：适合多次触发、可移除监听、解耦发送方与处理方。

---

## 三、Promise

ES6 引入的标准化异步解决方案。

* **原理**：异步操作返回一个 Promise 对象，通过 `.then` / `.catch` 注册回调。
* **示例**：

```js
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

* **优点**：链式调用，解决回调嵌套；错误处理集中。
* **特点**：Promise 是**一次性执行**的，只能 resolve 或 reject 一次。

---

## 四、async / await

基于 Promise 的语法糖，ES2017 引入。

* **原理**：在 `async` 函数中使用 `await` 等待 Promise 结果，看起来像同步代码。
* **示例**：

```js
async function getData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch(err) {
    console.error(err);
  }
}
getData();
```

* **优点**：

  * 代码可读性高，逻辑清晰；
  * 异常可直接用 `try/catch` 捕获；
  * 易于顺序执行或并行控制。

---

## 五、Observable / RxJS（可选方案）

* **原理**：推模型，通过订阅（subscribe）来处理异步事件流。
* **应用场景**：复杂事件流、数据流管理、实时更新（如前端表格、滚动事件）。
* **特点**：可组合、可取消、支持多值异步流，适合复杂异步逻辑。

</details>

## 12. 在实际项目中，你更倾向于使用哪种异步方案？为什么？ {#question-subjective-69cab9ec84c8}

### 题目要点

**首选**：Promise + async/await

<details>
<summary>参考答案</summary>

* **首选**：Promise + async/await
* **理由**：可读性好、逻辑清晰、错误处理集中、便于组合与扩展，同时兼容性强。
* **特殊场景**：事件流或多值异步流（如 WebSocket、滚动/鼠标事件）仍会配合 Observable 或事件监听处理。

</details>

## 13. setTimeout和setInterval的区别 {#question-subjective-e273916fb9ea}

### 题目要点

* **执行次数**：`setTimeout` 一次，`setInterval` 循环；
* **调用方式**：`setTimeout` 可递归实现可控循环，`setInterval` 固定周期，可能重叠；
* **停止方式**：`clearTimeout` vs `clearInterval`；
* **最佳实践**：如果需要保证任务不重叠、每次执行间隔可动态调整，使用递归 `setTimeout` 更安全。

<details>
<summary>参考答案</summary>

`setTimeout` 和 `setInterval` 都是 JavaScript 提供的定时器 API，用于异步执行代码，但它们在**触发机制、使用场景和行为特性**上存在明显区别。

---

## 一、触发机制

1. **setTimeout**

* 用于 **延迟执行一次** 某段代码。
* 语法：

```js
const timer = setTimeout(() => {
  console.log('延迟执行一次');
}, 1000);
```

* 执行一次后自动停止，需要重复执行必须在回调中再次调用 `setTimeout`。

2. **setInterval**

* 用于 **按照固定时间间隔重复执行** 某段代码。
* 语法：

```js
const interval = setInterval(() => {
  console.log('每隔 1 秒执行一次');
}, 1000);
```

* 会不断循环，直到手动调用 `clearInterval(interval)` 停止。

---

## 二、执行特点

| 特性   | setTimeout            | setInterval                |
| ---- | --------------------- | -------------------------- |
| 次数   | 执行一次                  | 重复执行                       |
| 时间间隔 | 延迟后执行一次               | 每隔固定时间执行（注意：间隔是从上一次执行开始计时） |
| 控制停止 | `clearTimeout`        | `clearInterval`            |
| 递归调用 | 可在回调内部再次调用实现周期执行（更灵活） | 固定周期，可能出现重叠调用问题            |

> 注意：JavaScript 是单线程，定时器并不是精确计时。
>
> * 如果上一次回调还未执行完，`setInterval` 的下一次调用不会等待回调完成，会导致回调重叠。
> * 使用 `setTimeout` 递归调用可以避免这种重叠问题，保证每次执行完成后再计算下一次延迟。

---

## 三、使用场景

1. **setTimeout**

* 延迟某个操作，如接口请求延迟、动画延迟启动、提示框自动关闭等。

2. **setInterval**

* 周期性任务，如轮播图、定时刷新数据、心跳检测等。
* 对于需要严格避免重叠的任务，推荐使用递归 `setTimeout` 替代 `setInterval`。

</details>

## 14. 如何避免setInterval可能导致的定时器堆积问题？ {#question-d6e29125-16c6-4b50-b41e-74d42c489c21}

> 题库原题：[如何避免setInterval可能导致的定时器堆积问题？](https://fe.ecool.fun/topic/d6e29125-16c6-4b50-b41e-74d42c489c21)

### 题目要点

1. **根本问题**：`setInterval` 固定周期触发，任务未完成时仍会排队，可能造成堆积。
2. **推荐做法**：

   * 优先使用递归 `setTimeout`，保证任务顺序执行；
   * 或在 `setInterval` 中加标志位判断，避免重叠。
3. **额外优化**：对动画类或 UI 更新类任务，用 `requestAnimationFrame` 代替固定定时器，提高渲染效率。

<details>
<summary>参考答案</summary>

`setInterval` 在 JavaScript 中按照固定时间间隔重复执行回调，但由于 JS 单线程机制，如果回调执行时间超过间隔，就会导致 **定时器堆积**（多个回调排队等待执行），产生性能问题或逻辑异常。

下面介绍几种避免方法：

---

## 一、使用递归 `setTimeout` 替代 `setInterval`

原理：**在回调执行完后再启动下一次定时器**，保证不会重叠。

```js
function doTask() {
  // 执行异步或耗时操作
  console.log('任务执行');

  // 完成后再递归调用
  setTimeout(doTask, 1000); // 1000ms 后再次执行
}

setTimeout(doTask, 1000);
```

特点：

* 每次间隔从上一次任务结束时开始计算，更安全；
* 可根据实际执行时间动态调整间隔。

---

## 二、在 `setInterval` 回调中加入执行状态判断

原理：**用一个标志位判断任务是否正在执行**，避免重叠。

```js
let isRunning = false;

const interval = setInterval(() => {
  if (isRunning) return; // 上一次还没完成，跳过

  isRunning = true;
  doAsyncTask().finally(() => {
    isRunning = false;
  });
}, 1000);
```

特点：

* 任务仍然按照固定间隔触发，但不会堆积回调；
* 对耗时异步任务尤为重要。

---

## 三、使用 `requestAnimationFrame`（针对动画或 UI 刷新）

* 对于与渲染相关的循环任务，推荐 `requestAnimationFrame` 替代 `setInterval`，保证任务与浏览器渲染同步，避免不必要的重复调用。

```js
function animate() {
  // 更新动画逻辑
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

</details>

## 15. JavaScript中的事件循环机制，它如何解决异步任务的执行问题 {#question-subjective-7b315502783f}

### 题目要点

* **事件循环（Event Loop）** 是 JS 异步任务调度的核心机制。
* **单线程 + 队列**模型保证了异步任务按顺序、非阻塞地执行。
* **微任务优先**，宏任务后执行，这一规则决定了 Promise、setTimeout 等的执行顺序。
* 正确理解事件循环，有助于优化异步逻辑、解决回调顺序和定时器问题。

<details>
<summary>参考答案</summary>

JavaScript 是 **单线程** 执行的语言，也就是说在同一时间只能执行一个任务。但前端开发中经常会有异步操作（网络请求、定时器、用户交互等），如果没有机制管理异步任务，UI 会被阻塞或逻辑无法按预期执行。事件循环（Event Loop）就是用来协调这些异步任务执行的核心机制。

---

## 一、事件循环的基本概念

事件循环可以理解为一个 **循环队列机制**，不断检查任务队列中是否有待执行的任务，并在主线程空闲时执行它们。

* **调用栈（Call Stack）**：存放正在执行的函数。
* **任务队列（Task Queue / Callback Queue）**：存放待执行的异步回调函数。
* **微任务队列（Microtask Queue）**：存放 Promise 的 `.then/.catch` 回调、`queueMicrotask` 等高优先级任务。

事件循环的核心规则：

1. 执行栈为空时，从 **微任务队列**取出所有任务执行；
2. 微任务队列清空后，再从 **宏任务队列**（如 `setTimeout`、`setInterval`、I/O 回调）取一个任务执行；
3. 每次执行完宏任务后，再执行微任务队列，如此循环。

---

## 二、异步任务的执行流程示例

```js
console.log('script start');

setTimeout(() => {
  console.log('setTimeout'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('promise1'); // 微任务
}).then(() => {
  console.log('promise2'); // 微任务
});

console.log('script end');
```

**执行顺序分析**：

1. 主线程执行同步代码：输出 `script start` 和 `script end`；
2. 微任务队列执行：输出 `promise1` → `promise2`；
3. 宏任务队列执行：输出 `setTimeout`；

**最终输出**：

```
script start
script end
promise1
promise2
setTimeout
```

---

## 三、事件循环解决异步问题的方式

1. **保证单线程安全**

   * 异步任务不会打断当前执行的函数，主线程不会被阻塞；

2. **控制执行顺序**

   * 微任务优先于宏任务，保证 Promise 等异步操作能尽快执行，符合开发者预期；

3. **协调多种异步来源**

   * 将回调统一排入队列，按优先级和空闲时机依次执行，避免竞态条件和线程冲突；

</details>

## 16. 如何实现一个可以监听任何事件的React Hooks？ {#question-4521b97d-12af-4be1-ba6e-c32c6db75925}

> 题库原题：[如何实现一个可以监听任何事件的React Hooks？](https://fe.ecool.fun/topic/4521b97d-12af-4be1-ba6e-c32c6db75925)

### 题目要点

* 核心是 **用 useEffect 管理绑定和解绑、用 useRef 保存最新回调**；
* 可以监听任意事件类型和事件源，保持 Hook 高复用性；
* 保证清理机制，防止内存泄漏。

<details>
<summary>参考答案</summary>

在 React 中，如果想实现一个可以 **监听任意 DOM 或全局事件的 Hook**，核心思路是：

1. 利用 `useEffect` 做生命周期管理，确保事件绑定和解绑正确；
2. 使用 `useRef` 保存回调函数，避免每次渲染都重新绑定；
3. 支持可配置的事件源（`window`、`document`、任意 DOM 元素）。

## 一、核心 Hook 实现

```js
import { useEffect, useRef } from 'react';

/**
 * useEventListener - 通用事件监听 Hook
 * @param {string} eventName - 事件名
 * @param {function} handler - 事件回调
 * @param {EventTarget} element - 监听目标，默认 window
 */
function useEventListener(eventName, handler, element = window) {
  // 保存 handler 的最新引用，避免每次 render 重新绑定
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // 确保 element 可用
    const targetElement = element && 'addEventListener' in element ? element : window;
    if (!targetElement) return;

    // 定义事件回调，保证调用最新 handler
    const eventListener = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener);

    // 清理函数
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

export default useEventListener;
```

---

## 二、使用示例

### 1. 监听窗口大小变化

```js
import useEventListener from './useEventListener';
import { useState } from 'react';

function WindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEventListener('resize', () => {
    setSize({ width: window.innerWidth, height: window.innerHeight });
  });

  return <div>窗口大小: {size.width} x {size.height}</div>;
}
```

### 2. 监听键盘事件

```js
function KeyLogger() {
  useEventListener('keydown', (e) => {
    console.log('按下的键:', e.key);
  });

  return <div>按下任意键查看控制台日志</div>;
}
```

---

## 三、设计要点

1. **避免重复绑定**：

   * `useRef` 保存 handler，`useEffect` 只在事件类型或目标改变时绑定/解绑；

2. **清理事件**：

   * `useEffect` 返回清理函数，保证组件卸载时不会造成内存泄漏；

3. **支持灵活事件源**：

   * 默认绑定到 `window`，也可以传入任意 `EventTarget` 或 DOM 元素。

4. **可复用性高**：

   * 这个 Hook 可用于监听任意事件，如鼠标、滚动、键盘、拖拽、自定义事件等。

</details>

## 17. 简述 html 页面渲染过程 {#question-61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6}

> 题库原题：[简述 html 页面渲染过程](https://fe.ecool.fun/topic/61b47ff6-9c4d-4fa2-b126-dc5ffff3e7c6)

### 题目要点

1. **解析 HTML** -> 构建 DOM 树。
2. **解析 CSS** -> 构建 CSSOM 树。
3. **合并 DOM 和 CSSOM** -> 构建渲染树。
4. **计算布局** -> 生成布局信息。
5. **绘制页面** -> 将内容绘制到屏幕。
6. **合成和显示** -> 合成图层并显示页面。
7. **JavaScript 执行** -> 执行脚本可能导致重绘或回流。

<details>
<summary>参考答案</summary>

整个渲染过程其实就是将URL对应的各种资源，通过浏览器渲染引擎的解析，输出可视化的图像。

## 基本概念

* HTML解释器：解释HTML语言的解释器，本质是将HTML文本解释成DOM树（文档对象模型）。
* CSS解释器：解释样式表的解释器，其作用是将DOM中的各个元素对象加上样式信息，从而为计算最后结果的布局提供依据。
* 布局：将DOM和css样式信息结合起来，计算它们的大小位置等布局信息，形成一个能够表示这所有信息的内部表示模型即渲染树。
* JavaScript引擎：JavaScript可以修改网页的内容，也能修改CSS的信息，JavaScript引擎解释JavaScript代码并把代码的逻辑和对DOM和CSS的改动信息应用到布局中去，从而改变渲染的结果。

## 基本过程

* 1.解析HTML文件，创建DOM树

浏览器解析html源码，然后创建一个 DOM树。并行请求 css/image/js在DOM树中，每一个HTML标签都有一个对应的节点，并且每一个文本也都会有一个对应的文本节点。DOM树的根节点就是 documentElement，对应的是html标签。

* 2.解析CSS,形成CSS对象模型

浏览器解析CSS代码，计算出最终的样式数据。构建CSSOM树。对CSS代码中非法的语法它会直接忽略掉。解析CSS的时候会按照如下顺序来定义优先级：

> 浏览器默认设置 < 用户设置 < 外链样式 < 内联样式 &lt; html中的style。

* 3.将CSS与DOM合并，构建渲染树（renderingtree）

DOM Tree + CSSOM –> 渲染树（rendering tree）。渲染树和DOM树有点像，但是是有区别的。DOM树完全和html标签一一对应，但是渲染树会忽略掉不需要渲染的元素，比如head、display:none的元素等。而且一大段文本中的每一个行在渲染树中都是独立的一个节点。渲染树中的每一个节点都存储有对应的css属性。

* 4.布局和绘制

一旦渲染树创建好了，浏览器就可以根据渲染树直接把页面绘制到屏幕上。

以上四个步骤并不是一次性顺序完成的。如果DOM或者CSSOM被修改，以上过程会被重复执行。实际上，CSS和JavaScript往往会多次修改DOM或者CSSOM。

### Repaint(重绘)

重绘是改变不影响元素在网页中的位置的元素样式时，譬如background-color(背景色)， border-color(边框色)，visibility(可见性)，浏览器会根据元素的新属性重新绘制一次(这就是重绘，或者说重新构造样式)，使元素呈现新的外观。

重绘不会带来重新布局，所以并不一定伴随重排。

### Reflow（重排）

渲染对象在创建完成并添加到渲染树时，并不包含位置和大小信息。计算这些值的过程称为布局或重排。

"重绘"不一定需要"重排"，比如改变某个网页元素的颜色，就只会触发"重绘"，不会触发"重排"，因为布局没有改变。

但是，"重排"必然导致"重绘"，比如改变一个网页元素的位置，就会同时触发"重排"和"重绘"，因为布局改变了。

## 引申问题：浏览器如何优化渲染？

* 将多次改变样式属性的操作合并成一次操作
* 将需要多次重排的元素，position属性设为absolute或fixed，这样此元素就脱离了文档流，它的变化不会影响到其他元素。例如有动画效果的元素就最好设置为绝对定位。
* 由于display属性为none的元素不在渲染树中，对隐藏的元素操作不会引发其他元素的重排。如果要对一个元素进行复杂的操作时，可以先隐藏它，操作完成后再显示。这样只在隐藏和显示时触发2次重排。

</details>

## 18. 在 html 页面渲染过程中，哪些因素可能会影响页面的渲染性能？如何优化？ {#question-abd67a8c-15c5-421f-9d48-c4aa19869a88}

> 题库原题：[在 html 页面渲染过程中，哪些因素可能会影响页面的渲染性能？如何优化？](https://fe.ecool.fun/topic/abd67a8c-15c5-421f-9d48-c4aa19869a88)

### 题目要点

* **渲染性能瓶颈**：DOM 复杂度、CSS 复杂度、JS 阻塞、资源加载慢、回流重绘频繁。
* **优化思路**：减少 DOM/样式复杂度，避免阻塞 JS，压缩和懒加载资源，优化动画和频繁操作。
* **原则**：减少浏览器计算量，合理使用 GPU 加速，提升首屏渲染速度和流畅度。

<details>
<summary>参考答案</summary>

在 HTML 页面渲染过程中，性能瓶颈主要出现在 **浏览器的渲染流水线**上，包括 **解析 HTML/CSS/JS、构建 DOM/CSSOM、布局（Layout）、绘制（Paint）、合成（Composite）** 等阶段。

## 一、影响渲染性能的主要因素

1. **DOM 结构复杂度**

* 节点过多、层级过深会增加浏览器的 **DOM 构建时间** 和 **布局计算成本**。
* **表现**：页面渲染慢，回流（reflow）和重绘（repaint）频繁。

2. **CSS 复杂度**

* 复杂选择器（如通配符 `*`、嵌套选择器）会增加匹配成本。
* 使用大量动画、阴影、滤镜（filter）也会增加绘制开销。

3. **JavaScript 阻塞**

* `&lt;script&gt;` 默认阻塞 HTML 解析，影响 DOM 构建。
* JS 操作 DOM、频繁修改样式，会触发回流和重绘。

4. **图片和资源大小**

* 大图、未压缩资源会延长页面加载时间。
* 网络请求阻塞 CSS/JS 渲染也会延迟首屏显示。

5. **布局抖动与频繁回流**

* 通过 JS 修改 DOM 或样式属性（如 `offsetWidth`, `scrollTop`）会触发同步回流，频繁操作会严重拖慢渲染。

6. **浏览器重绘与合成成本**

* CSS 动画使用会触发重绘或合成，复杂的 DOM 树和层叠关系会增加 GPU 开销。

---

## 二、优化策略

1. **优化 DOM 结构**

* 减少节点数量、避免过深层级。
* 使用文档碎片（`DocumentFragment`）或虚拟 DOM 批量更新。

2. **优化 CSS**

* 避免低效选择器，尽量使用类选择器；
* CSS 动画优先使用 `transform` 和 `opacity`，利用 GPU 加速；
* 减少不必要的样式属性，避免触发回流。

3. **优化 JavaScript**

* 将 `&lt;script&gt;` 放在 `<body>` 底部，或使用 `defer` / `async` 属性；
* 批量修改 DOM，减少频繁的读取/写入混合操作；
* 使用防抖/节流优化滚动、resize 等频繁触发的事件。

4. **资源优化**

* 图片压缩、使用 WebP 格式；
* CSS/JS 文件压缩、按需加载、使用 HTTP/2 或 CDN；
* 图片懒加载，减少首屏阻塞。

5. **减少回流和重绘**

* 使用 `class` 批量修改样式而不是逐条修改；
* 避免在循环中频繁读取 layout 信息；
* 对动画使用 `transform`、`opacity`，避免改变布局属性。

6. **使用浏览器优化技术**

* CSS will-change 提前告知浏览器将要变化的属性；
* 合理使用硬件加速（GPU layer）处理动画；
* 对长列表使用虚拟滚动（Virtual Scroll）或分页加载。

</details>

## 19. 页面加载的过程中，JS 文件是不是一定会阻塞 DOM 和 CSSOM 的构建？ {#question-212703a8-43a2-426e-b9c4-b51053436d23}

> 题库原题：[页面加载的过程中，JS 文件是不是一定会阻塞 DOM 和 CSSOM 的构建？](https://fe.ecool.fun/topic/212703a8-43a2-426e-b9c4-b51053436d23)

### 题目要点

**作答思路：**

页面加载的过程中，JS文件不一定会阻塞DOM和CSSOM的构建。具体取决于以下几个因素：

1. **并行加载**：浏览器通常会并行加载多个资源，包括HTML、CSS和JavaScript文件。这意味着DOM和CSSOM的构建可以在加载JS文件的同时进行。
2. **异步加载**：如果JavaScript文件使用`async`或`defer`属性进行异步加载，那么它不会阻塞DOM和CSSOM的构建。`async`属性会使脚本在下载完成后立即执行，而`defer`属性会使脚本在HTML解析完成后执行。
3. **内联JavaScript**：如果JavaScript代码内联在HTML文档中，它会在DOM构建完成后立即执行，这可能会阻塞DOM的构建，但不会阻塞CSSOM的构建。
4. **阻塞行为**：如果JavaScript文件没有使用`async`或`defer`属性，或者使用了`&lt;script&gt;`标签的`type="text/javascript"`属性，它可能会阻塞DOM和CSSOM的构建，直到脚本加载并执行完毕。

**考察要点**：

1. **浏览器资源加载机制**：理解浏览器如何并行加载多个资源，包括HTML、CSS和JavaScript文件。
2. **异步加载**：了解如何使用`async`和`defer`属性来异步加载JavaScript文件，以及它们对DOM和CSSOM构建的影响。
3. **内联JavaScript的影响**：理解内联JavaScript如何影响DOM和CSSOM的构建。
4. **阻塞行为**：了解没有使用`async`或`defer`属性的JavaScript文件如何阻塞DOM和CSSOM的构建。

<details>
<summary>参考答案</summary>

答案：**不一定**

JavaScript阻塞DOM和CSSOM的构建的情况主要集中在以下两个方面：

* JavaScript文件被放置在head标签内部

当JavaScript文件被放置在head标签内部时，浏览器会先加载JavaScript文件并执行它，然后才会继续解析HTML文档。因此，如果JavaScript文件过大或服务器响应时间过长，就会导致页面一直处于等待状态，进而影响DOM和CSSOM的构建。

* JavaScript代码修改了DOM结构

在JavaScript代码执行时，如果对DOM结构进行了修改，那么浏览器需要重新计算布局（reflow）和重绘（repaint），这个过程会较为耗时，并且会阻塞DOM和CSSOM的构建。

除此之外，还有一些情况下JavaScript并不会阻塞DOM和CSSOM的构建：

* 通过设置 script 标签的 async 、defer 属性避免阻塞DOM和CSSOM的构建
    * **async**：异步加载JavaScript文件，脚本的下载和执行将与其他工作同时进行（例如从服务器请求其他资源、渲染页面等），而不必等到脚本下载完成才开始这些操作。因此，在使用 async 属性时，脚本的加载和执行是异步的，并且不保证脚本在页面中的顺序。
    * **defer属性** ：属性也告诉浏览器立即下载脚本文件，但有一个重要的区别：当文档解析时，脚本不会执行，直到文档解析完成后才执行。这意味着脚本将按照它们在页面上出现的顺序执行，并且在执行之前，整个文档已经被解析完毕了。
* Web Workers ：Web Workers 是一种运行在后台线程的JavaScript脚本，它不会阻塞DOM和CSSOM的构建，并且可以利用多核CPU提高JavaScript代码执行速度。

## 总结

在一定情况下，JavaScript的执行会阻塞DOM和CSSOM的构建。

但是，在实际应用中，我们可以通过设置 script 标签的 async、defer 属性、使用Web Workers等方式来避免这个问题。

</details>

## 20. 如何避免JavaScript代码对浏览器渲染的阻塞？ {#question-9cf927ac-d134-4590-9a2a-0cb73bc3e2c8}

> 题库原题：[如何避免JavaScript代码对浏览器渲染的阻塞？](https://fe.ecool.fun/topic/9cf927ac-d134-4590-9a2a-0cb73bc3e2c8)

### 题目要点

1. **优化加载顺序**：`defer` / `async` / 脚本底部，减少 HTML 解析阻塞；
2. **拆分长任务**：将大任务分块执行或异步调度，避免阻塞渲染；
3. **按需加载 JS**：减少首屏加载体积，延迟非关键脚本；
4. **使用 Web Worker**：处理耗时任务，不占用主线程；
5. **减少回流重绘**：避免频繁读写 layout、批量操作 DOM。

<details>
<summary>参考答案</summary>

JavaScript 是单线程执行的，如果不加控制，会 **阻塞浏览器解析 HTML 和渲染页面**，导致首屏渲染延迟。避免阻塞的策略主要有以下几类：

## 一、调整 `&lt;script&gt;` 加载方式

1. **`defer`**

* 解析 HTML 时不会阻塞，脚本在 DOM 构建完成后按顺序执行。
* 适合有依赖关系、需要操作 DOM 的脚本。

```html
<script src="main.js" defer></script>
```

2. **`async`**

* 脚本异步加载，加载完成立即执行，可能会打乱执行顺序。
* 适合无依赖关系、独立的脚本（如统计、广告）。

```html
<script src="analytics.js" async></script>
```

3. **将脚本放在 `<body>` 底部**

* HTML 解析完成后才执行 JS，减少首屏阻塞。

---

## 二、减少同步、长时间运行的 JS

1. **避免长任务**

* 单次执行时间过长的 JS 会阻塞渲染。
* 可以将大任务拆分成小块，用 `setTimeout` 或 `requestIdleCallback` 异步执行。

```js
function processLargeArray(arr) {
  let i = 0;
  function chunk() {
    const end = Math.min(i + 1000, arr.length);
    for (; i < end; i++) {
      // 处理逻辑
    }
    if (i < arr.length) {
      setTimeout(chunk, 0);
    }
  }
  chunk();
}
```

2. **避免阻塞样式计算**

* 避免在循环中频繁读写 layout 属性（如 `offsetWidth`、`scrollTop`），这会触发同步回流。
* 通过 **缓存 DOM 信息** 或 **批量修改样式** 避免回流。

---

## 三、按需加载资源

1. **动态按需加载 JS**

* 仅加载当前页面需要的模块，减少阻塞。
* 可以使用 **Code Splitting** 或动态 `import()`。

```js
button.addEventListener('click', async () => {
  const module = await import('./heavyModule.js');
  module.doSomething();
});
```

2. **延迟加载非关键 JS**

* 将统计、广告等第三方脚本延迟加载，保证首屏渲染。

---

## 四、利用 Web Worker 执行耗时任务

* Web Worker 在**独立线程**执行 JS，主线程不会被阻塞。
* 适合 CPU 密集型计算，如数据处理、图片处理等。

```js
const worker = new Worker('worker.js');
worker.postMessage(largeData);
worker.onmessage = (e) => console.log('处理结果:', e.data);
```

</details>

## 21. 不重复最大子串 {#question-0c2e2466-54ef-47b7-99f1-1064ea325a0b}

> 题库原题：[不重复最大子串](https://fe.ecool.fun/topic/0c2e2466-54ef-47b7-99f1-1064ea325a0b)

给定一个字符串，请实现一个函数来找到其中的不重复最大子串。例如，对于字符串"abcabcbb"，不重复最大子串是"abc"，长度为3。

* 请写出实现该功能的代码，并说明其时间复杂度。
* 考虑到性能优化，你认为还有哪些改进空间？请提出优化思路并实现优化后的代码。

### 题目要点

1. **滑动窗口** 是解决最长不重复子串问题的核心思想。
2. **Set 方法**简单直观，但每遇到重复字符可能多次移动左指针。
3. **Map 优化**通过记录字符索引，**直接跳过重复区域**，减少不必要操作。
4. 时间复杂度 O(n)，空间复杂度 O(Σ)。

<details>
<summary>参考答案</summary>

## 一、滑动窗口实现

```js
function lengthOfLongestSubstring(s) {
  let set = new Set();
  let left = 0, maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 测试
console.log(lengthOfLongestSubstring("abcabcbb")); // 输出 3
```

### 思路

* 使用 **滑动窗口** `[left, right]` 遍历字符串。
* 用 `Set` 存储当前窗口内字符。
* 当遇到重复字符时，移动左指针，直到窗口内无重复字符。
* 每次窗口扩大时更新最大长度。

### 时间复杂度

* 每个字符 **最多进出窗口一次** → O(n)
* 空间复杂度：O(min(n, Σ))，Σ 是字符集大小。

---

## 二、性能优化

上面方法每遇到重复字符，需要 **逐个删除左边字符**。可以进一步优化为 **直接跳过重复字符的索引**，使用 **Map 存储字符上次出现的索引**。

### 优化实现（使用 Map）

```js
function lengthOfLongestSubstringOptimized(s) {
  const map = new Map();
  let maxLen = 0, left = 0;

  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left) {
      left = map.get(s[right]) + 1; // 直接跳过重复字符
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 测试
console.log(lengthOfLongestSubstringOptimized("abcabcbb")); // 输出 3
```

### 优化说明

* **直接跳过重复字符**，减少了删除操作。
* 对比 `Set` 方法，尤其在遇到长重复序列时性能更好。
* 时间复杂度仍然是 O(n)，但常数时间更低。
* 空间复杂度 O(min(n, Σ))，Σ 是字符集大小。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-69/round-112/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-69/_index.md" >}}) · 已是最后一轮 →
