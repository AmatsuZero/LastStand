+++
title = "滴滴-社招-1年 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/56"
experienceId = 56
roundId = 86
roundOrder = 1
company = "滴滴"
date = "2025-07-28T01:45:16.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-56/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-87/index.md" >}}) →

**本轮要点：** 响应式原理、Webpack与Vite、https、浏览器渲染过程、浏览器的缓存机制

本轮共 19 道题。答案默认折叠，便于先自行作答。

## 1. 介绍一下简历中的组件库项目 {#question-subjective-1760562f8190}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 聊聊 vite 和 webpack 的区别 {#question-dc78e2f9-568a-445d-988c-594092179848}

> 题库原题：[聊聊 vite 和 webpack 的区别](https://fe.ecool.fun/topic/dc78e2f9-568a-445d-988c-594092179848)

### 题目要点

- **Webpack**：成熟的模块打包工具，功能强大但配置复杂，适合需要高度定制和复杂构建需求的项目。
- **Vite**：现代化的开发工具，提供快速的开发体验和优化的生产构建，适合追求开发效率和现代化特性的项目。

选择 Vite 还是 Webpack 取决于项目的需求和开发团队的偏好。如果重点是开发体验和快速反馈，Vite 是一个很好的选择。如果需要高度定制化和广泛的插件支持，Webpack 可能更适合。

<details>
<summary>参考答案</summary>

Vite 和 Webpack 都是前端打包工具，它们的作用类似，但实现方式和使用方法有所不同。以下是它们之间的一些区别：

1. **构建速度**：Vite 的构建速度比 Webpack 更快，因为 Vite 在开发环境下使用了浏览器原生的 ES 模块加载，而不是像 Webpack 一样使用打包后的文件进行模块加载。在 Vite 中，每个模块都可以独立地进行编译和缓存，这意味着它只需要重新编译修改过的模块，而不是整个应用程序。这使得 Vite 开发起来更加高效。

2. **配置复杂度**：Vite 的配置相对更简单，因为它无需进行大量的配置，只需指定一些基本的选项就可以开始开发。Webpack 的配置更加复杂，需要针对具体项目进行不同的配置，且需要理解各种插件、Loader 等概念。

3. **生态环境**：Webpack 的生态环境更加成熟，在社区中拥有广泛的支持和丰富的插件库。而 Vite 尚处于发展阶段，尽管其已经获得了很多关注，但其生态系统仍然不太完善。

4. **功能特性**：Webpack 是一个功能更加全面的打包工具，支持各种 Loader 和插件，可以处理多种类型的文件和资源。而 Vite 的设计初衷是专注于开发环境下的快速构建，因此其对一些高级特性的支持相对较少。

综上所述，Vite 更适合用于开发环境下的快速构建，而 Webpack 则更适合用于生产环境下的复杂应用程序的打包处理。选择使用哪种工具需要根据具体项目需求进行评估。

</details>

## 3. vite 打包可能会有什么问题呢？需要怎么处理 {#question-subjective-773030f0f44a}

### 题目要点

- 梳理常见 Vite 打包问题（依赖、路径、体积、样式、兼容性）<br>
- 给出每个问题的发生机制、根本原因、具体配置项解决方案<br>
- 辅以实践中的经验与优化建议<br>
- 强调调试技巧和常见陷阱避免

<details>
<summary>参考答案</summary>

### 考察点

#### ● 是否深入理解 Vite 的打包机制（基于 Rollup）<br>
#### ● 能识别 Vite 与 Webpack 在打包阶段的差异和潜在兼容问题<br>
#### ● 掌握产物优化、依赖处理、兼容性调优等实战经验<br>
#### ● 具备故障定位与跨平台构建能力<br>

---

### 参考答案

#### 一、Vite 打包常见问题分类与分析

---

#### ✅ 1. **第三方依赖未正确打包**

- **问题表现**：
  - 构建产物中缺少某些 npm 依赖。
  - 打包后页面报错 `xxx is not defined` 或 `Cannot find module`。

- **原因**：
  - Vite 默认使用 Rollup 打包，部分依赖需预编译。<br>
  - 某些 CommonJS 模块或动态引入逻辑不被 Rollup 支持。

- **解决方案**：
  - 使用 `optimizeDeps.include` 强制预构建指定依赖。
  - 如果依赖是 CommonJS 格式，添加到 `build.commonjsOptions.include`。
  - 使用 `@rollup/plugin-commonjs` 插件支持 CJS。

---

#### ✅ 2. **动态导入路径构建失败**

- **问题表现**：
  - 使用动态 `import(path)` 时打包失败或资源路径错误。

- **原因**：
  - Rollup 要求静态可分析的模块路径，动态变量会被忽略。

- **解决方案**：
  - 使用 Vite 的 `import.meta.glob` 替代动态路径导入。
  - 将路径范围限定，如 `import(`./views/${name}.vue`)` 应用具体路径控制。

---

#### ✅ 3. **打包体积过大，产物不合理**

- **问题表现**：
  - 构建后 `dist` 文件夹中 JS/CSS 体积过大，影响首屏。

- **原因**：
  - 没有进行分包/懒加载。
  - 第三方库未分离。
  - 多语言、图标、UI 库全部打包进主包。

- **解决方案**：
  - 使用 `build.rollupOptions.output.manualChunks` 拆包。
  - 大体积库单独分包（如 `vendor`）。
  - 使用 CDN 引入部分大库（可配合 `external`）。

---

#### ✅ 4. **CSS 文件未按需加载或样式错乱**

- **问题表现**：
  - 构建后某些样式未加载或加载顺序错乱。

- **原因**：
  - 动态样式导入未处理好、第三方 UI 框架样式未独立提取。

- **解决方案**：
  - 配置 `css.codeSplit: true` 开启样式分离。
  - 保证第三方样式统一在入口文件引入。
  - 使用 `vite-plugin-style-import` 实现组件库按需加载。

---

#### ✅ 5. **环境变量丢失或替换错误**

- **问题表现**：
  - 打包后环境变量未生效或 `import.meta.env` 值为空。

- **原因**：
  - 使用不规范的环境变量命名，或者 `.env` 文件未被正确加载。

- **解决方案**：
  - 确保环境变量以 `VITE_` 开头。
  - 使用 `define` 配置全局替换值：`define: { __APP_VERSION__: JSON.stringify(pkg.version) }`

---

#### ✅ 6. **构建后兼容性问题（如低版本浏览器不支持）**

- **问题表现**：
  - 生产环境在 IE/老安卓浏览器出现报错。

- **原因**：
  - Vite 默认构建目标是现代浏览器（ESModules）。

- **解决方案**：
  - 使用 `@vitejs/plugin-legacy` 插件生成兼容 ES5 的 fallback bundle。
  - 手动配置 `build.target: ['es2015']`。

---

#### 二、调试与处理建议

- 开启 `build.sourcemap: true` 帮助定位构建产物问题。
- 结合 `vite build --debug` 输出调试信息。
- 分析 `dist` 使用 `source-map-explorer`、`rollup-plugin-visualizer` 等工具评估优化点。
- 配合 CI 环境实现产物大小、构建时间的监控告警。

---

#### 三、常见误区或陷阱

- ❌ 忽视第三方依赖格式兼容性（如全量引入 moment）<br>
- ❌ 将开发时 `import.meta.glob` 动态导入误用于生产动态加载<br>
- ❌ 环境变量未加 `VITE_` 前缀，打包失效<br>
- ❌ 忽视现代构建目标对老设备的兼容问题<br>

---

### 总结观点

Vite 构建效率高，但其基于 Rollup 的打包机制与 Webpack 存在差异，需结合其现代化理念进行适配。识别常见打包问题并制定对应解决策略，是提升构建稳定性和产物质量的关键。

</details>

## 4. vue2 和 vue3 有哪些不同 {#question-subjective-5f41473235ad}

### 题目要点

* 结构化列举核心差异（响应式、API、性能、生态）
* 举例说明 Composition API 的优势与使用方式
* 对比分析 Vue3 为什么更适合现代前端工程
* 指出学习 Vue3 常见误解与注意事项

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望考察你对 Vue 框架版本演进的理解<br>
#### ● 能否准确掌握 Vue3 的核心特性、设计思想与 Vue2 的异同<br>
#### ● 理解响应式系统、组件结构、性能优化等方面的差异<br>
#### ● 是否能结合项目实践，做出合理的技术选型<br>

---

### 参考答案

## 一、核心区别概览

| 维度 | Vue2 | Vue3 |
|------|------|------|
| 响应式系统 | `Object.defineProperty` | `Proxy`（更强大、支持深层监听） |
| 组合能力 | Options API（data、methods、computed等分离） | Composition API（setup、hook 更好组织逻辑） |
| 性能 | 编译体积较大、运行时性能相对一般 | 更小、更快，Tree-shaking 支持更好 |
| 类型支持 | TS 支持不友好 | 从设计上原生支持 TypeScript |
| 虚拟 DOM | VNode 结构较老，Diff 算法未优化多层嵌套 | 新版 VDOM 更快、更轻、更易扩展 |
| Fragment | 不支持，组件必须有唯一根节点 | 支持多个根节点 |
| Teleport | 不支持 | 原生支持将元素渲染到外部容器 |
| Suspense | 不支持 | 支持异步组件占位处理（适合 SSR 场景） |

---

## 二、响应式系统的升级

### Vue2 使用 `Object.defineProperty`

- 不能检测对象新增属性/删除属性。
- 对数组的变更监听有限（如通过索引修改）。

### Vue3 使用 `Proxy`

- 可直接监听对象、数组、Map、Set 等任意结构。
- 性能更优，支持深层监听、按需追踪依赖。

---

## 三、组件 API 模式的变革

### Vue2：Options API

```js
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
}
````

### Vue3：Composition API

```js
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
}
```

#### 对比总结：

* Composition API 更适合逻辑复用和复杂场景（如 hooks 封装逻辑）。
* Options API 更适合初学者和简单组件。

---

## 四、性能优化与构建改进

* Vue3 构建基于 \[monorepo + Rollup]，采用 Tree-shaking，使未用功能不进入最终包。
* 模板编译时自动静态提升（Hoist static），减少渲染开销。
* 更优秀的服务端渲染（SSR）支持（结合 Suspense、Stream）。

---

## 五、生态与兼容性

* Vue3 不再向下兼容 Vue2 写法，需通过 Vue Bridge 或改造代码迁移。
* Vue3 核心生态（如 Vue Router 4.x、Pinia）也同步升级。
* Vue2 和 Vue3 的兼容层（Vue-Demi、@vue/composition-api）可做过渡。

---

## 六、常见误区

* ❌ 误以为 Vue3 完全舍弃了 Options API（其实仍支持）
* ❌ Composition API 与 Hooks 使用不当，导致逻辑混乱
* ❌ TS 使用不规范，setup 返回不一致类型报错
* ❌ 响应式数据未正确使用 `ref` / `reactive`，导致视图不更新

---

## 七、总结观点

Vue3 是 Vue 框架的一次底层重构与现代化升级，面向大型工程、类型安全和高性能场景优化。虽然学习曲线稍陡，但更适合复杂项目和未来架构演进方向。Vue2 则更加适合快速上手和中小型项目。

</details>

## 5. vue2 和 vue3 diff算法的区别是什么 {#question-subjective-b8c3abef0eee}

### 题目要点

- 说明 Diff 的本质作用及常见策略；
- 明确 Vue2 和 Vue3 在 Diff 实现上的关键区别；
- 能结合 `PatchFlag`、`LIS` 等术语深入讲解 Vue3 的优化点；
- 补充对比场景与实际开发性能收益；

<details>
<summary>参考答案</summary>

### 考察点

#### ● 能否理解 Vue 框架中的 Virtual DOM 核心机制<br>
#### ● 掌握 Vue2 和 Vue3 中 Diff 算法的实现原理与优化策略<br>
#### ● 是否具备深入的性能分析能力，能解释 Vue3 对渲染效率的提升<br>

---

### 参考答案

## 一、Diff 算法简介

**Diff（差分）算法**是 Virtual DOM 核心机制之一，它通过新旧虚拟节点树的对比，找出需要修改的 DOM 部分，实现**最小化 DOM 操作**以提升性能。

---

## 二、Vue2 的 Diff 算法实现

### 1. 基本机制

- 基于 **同层比较**（不跨层遍历 DOM）；
- 使用 **双端指针优化算法** 进行子节点对比；
- 判断依据：`tag`、`key`、`type`；
- 未命中时采用遍历寻找可复用节点，否则删除重建。

### 2. 特点与局限

- 手写递归遍历逻辑，性能中规中矩；
- **缺乏静态标记（静态提升）**，每次更新都需完整对比；
- 子节点列表较复杂时（如插入、移除、排序混合），性能下降显著；
- 无法很好利用现代 CPU 指令集和优化策略。

---

## 三、Vue3 的 Diff 算法优化

Vue3 对 Diff 算法进行了**底层重写**，主要采用 **Block Tree + PatchFlag + 最长递增子序列（LIS）** 的组合优化策略。

### 1. Block Tree & PatchFlag

- 在编译阶段标记每一个动态节点；
- 每次更新时只对有 PatchFlag 的节点进行比对；
- **静态节点跳过比对**，提升效率。

### 2. 使用最长递增子序列（LIS）

- 用于对比 key 相同但位置变化的子节点；
- 在尽量减少 DOM 移动操作的同时复用更多节点；
- 优化了移动最少操作路径，**时间复杂度从 O(n²) 降至 O(n)**。

### 3. 更合理的数据结构 &逻辑分离

- 编译产物与运行时分离，Diff 更轻量；
- 对比逻辑更清晰，利于后续扩展（如 Fragment、Teleport 支持）；

---

## 四、Diff 算法差异总结

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 静态提升 | ❌ 无 | ✅ 支持（PatchFlag） |
| 复用判断策略 | 基于 tag + key | 基于 PatchFlag + key |
| 移动节点优化 | O(n²)，手动比对 | O(n)，使用 LIS |
| 多根节点 Fragment | ❌ 不支持 | ✅ 完整支持 |
| 性能表现 | 一般 | 明显提升，减少不必要更新 |

---

## 五、使用场景与表现差异

- **Vue2** 在组件层级不深、节点结构稳定时表现良好；
- **Vue3** 在结构复杂、更新频繁的页面中性能更优，尤其适合：
  - 动态长列表；
  - 表格拖拽重排；
  - Fragment、Teleport 场景。

---

## 六、常见误区

- ❌ 认为 Vue2 与 Vue3 的 Diff 算法本质一样（Vue3 是全新设计）；
- ❌ 误以为 Vue3 不再需要 key（实际上依然推荐使用 key 明确标识）；
- ❌ 忽视了编译优化与运行时性能的协同配合；
- ❌ 把 PatchFlag 误认为是手动添加的，实际是 Vue 编译器自动生成；

</details>

## 6. 说说你对前端工程化的理解 {#question-a823157e-329e-4327-8d39-da935c091f20}

> 题库原题：[说说你对前端工程化的理解](https://fe.ecool.fun/topic/a823157e-329e-4327-8d39-da935c091f20)

### 题目要点

前端工程化通过规范化项目结构、使用现代工具链、自动化常见任务、实施代码质量管理和优化性能，来提高前端开发的效率和质量。

工程化的目标是让开发过程更加可控、可维护，并能够适应不断变化的技术和业务需求。

<details>
<summary>参考答案</summary>

前端工程化是指将前端开发中的设计、开发、测试和部署等环节进行标准化和自动化，以提高开发效率和代码质量，并降低维护成本。

具体而言，前端工程化包括以下方面：

1. 模块化：使用模块化思想可以将复杂的代码拆分成小的可重用的模块，并且使得不同模块之间的依赖关系更加清晰。

2. 自动化构建：通过使用构建工具（如 Gulp、Webpack、Rollup 等），可以自动化地完成代码编译、压缩、打包、转换、优化等任务，从而提高开发效率。

3. 自动化测试：通过使用自动化测试框架和工具（如 Jest、Mocha、Chai、Selenium 等），可以自动化地完成单元测试、集成测试、UI 测试等任务，从而提高代码质量并减少故障。

4. 自动化部署：通过使用自动化部署工具（如 Jenkins、Travis CI、GitLab CI/CD 等），可以自动化地完成代码上传、服务器部署、数据库更新等任务，从而减少手动操作产生的错误和漏洞。

5. 规范化管理：通过使用代码规范（如 ESLint、Stylelint、Prettier 等）和版本控制系统（如 Git），可以规范开发流程和代码风格，提高代码可读性和可维护性。

前端工程化是将前端开发中的设计、开发、测试和部署等环节进行标准化和自动化，以提高开发效率和代码质量，并降低维护成本。

它是一种现代化的开发方式，适用于各种大小项目的开发，并且可以在不断变化的技术环境中保持竞争力。

</details>

## 7. 工程化中对CSS会怎么处理 {#question-subjective-c01171efe4bb}

### 题目要点

* 分阶段说明构建、优化、管理策略；
* 掌握模块化、按需加载、样式隔离等工程手段；
* 提到实际项目场景中的策略和效果；
* 指出可能踩坑和最佳实践；

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官想确认你对 CSS 在现代前端工程化流程中的整体处理思路<br>
#### ● 是否熟悉构建工具中如何对 CSS 进行加载、模块化、压缩、优化等处理<br>
#### ● 是否了解大规模项目中 CSS 管理的痛点与解决方案（如作用域、命名冲突）<br>
#### ● 是否能结合实际项目，讲出不同阶段的 CSS 工程策略<br>

---

### 参考答案

## 一、CSS 工程化的核心问题

CSS 天然具有全局作用域，容易出现以下问题：

- 样式冲突：多个模块互相污染；
- 难以维护：选择器杂乱，缺乏统一规范；
- 体积过大：未使用的样式未清理，打包后浪费资源；
- 首屏渲染慢：样式加载阻塞渲染，影响用户体验；
- 无法模块复用：组件样式复用困难、依赖混乱；

因此需要通过工程化手段进行系统性管理与优化。

---

## 二、构建阶段的处理方式

### 1. CSS 模块化

- **方案：** 使用 CSS Modules、SCSS、PostCSS、CSS-in-JS 等方式
- **优点：** 样式局部作用域隔离，避免全局污染
- **示例：**
  ```js
  import styles from './button.module.css'
  <div className={styles.btn}></div>
````

### 2. 预处理器支持

* 使用 Less / Sass 提供变量、嵌套、Mixin，提高开发效率与可维护性。
* 配合 PostCSS 支持自动前缀、兼容性增强。

### 3. 自动化工具链整合

* **通过构建工具加载器处理：**

  * `webpack`: 使用 `css-loader`、`style-loader`、`postcss-loader`
  * `Vite`: 使用 `vite:css` 插件，原生支持 PostCSS

### 4. CSS Tree-Shaking / PurgeCSS

* 删除未使用的样式，减小体积；
* 结合框架约定式命名（如 Tailwind）更高效；

---

## 三、优化策略

### 1. 样式按需加载

* 组件级样式拆分，与组件一起懒加载；
* 使用 Vite / Webpack 的代码分割机制；
* 利于首屏渲染与减少初始体积；

### 2. Critical CSS 提取

* 抽取首屏关键样式，内联进 HTML；
* 其余样式延迟加载，提高首屏渲染速度；
* 工具：`critters`（Vite 插件）、`webpack-plugin-critical`；

### 3. CSS 压缩和去重

* 使用 `cssnano` 或 `clean-css` 自动压缩；
* 重复样式压缩合并，减少传输体积；
* Webpack 中使用 `mini-css-extract-plugin` 抽离样式文件；

---

## 四、大型项目中的实践策略

### 1. 统一样式规范（如 BEM、设计系统）

* 命名规范统一，降低维护成本；
* 搭配设计系统 / 组件库统一样式变量；
* 可结合 CSS 变量实现动态主题（如换肤）；

### 2. 动态样式处理

* 使用 CSS 变量 (`:root { --theme-color: #000 }`) 支持动态主题切换；
* 配合 JS 设置 `&lt;style&gt;` 标签注入，或运行时替换变量值；

### 3. 多端兼容方案

* 使用 PostCSS 插件如 `autoprefixer`；
* 或引入 TailwindCSS 等现代工具自动处理兼容问题；

---

## 五、常见误区

* ❌ 样式文件没有拆分，导致全量加载影响性能；
* ❌ 只用全局样式不考虑作用域隔离；
* ❌ 样式依赖混乱，多个组件共享同一命名空间；
* ❌ 忽视构建后的产物体积，没有进行压缩与 Tree-shaking；
* ❌ 未区分开发环境和生产环境样式策略；

</details>

## 8. 说说你对打包优化的理解 {#question-subjective-3c30c1eda9b8}

### 题目要点

* 从体积、速度、缓存、资源等多个角度展开
* 能结合具体场景（如首屏优化、移动端）做出合理策略选择
* 说明背后的构建工具机制（如 Tree Shaking、内容哈希）
* 引用实际使用过的工具或插件，突出经验落地能力

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望了解你是否掌握现代前端构建流程及打包工具（如Webpack、Vite）的核心原理<br>
#### ● 能否识别项目中打包体积大的成因，并通过合理策略优化输出资源<br>
#### ● 是否具有系统化思维，从构建体积、加载性能、缓存利用等多维度进行优化<br>

---

### 参考答案

## 一、打包优化的目标是什么？

打包优化的最终目标是：

- 减小构建产物体积
- 提升构建速度
- 提升首屏加载速度
- 提升资源缓存利用率
- 提高浏览器解析效率和运行效率

---

## 二、常见的打包优化方向

### 1. **体积优化（减包）**

#### ▍Tree Shaking（摇树优化）

- 清除未被使用的模块导出（只对 ESModule 生效）
- Webpack 默认开启（mode=production）

#### ▍代码压缩

- 使用 `terser-webpack-plugin`（Webpack）或 `esbuild`（Vite）进行 JS 压缩
- CSS 使用 `cssnano` 或 `clean-css` 进行压缩

#### ▍移除无用代码 / 注释 / Console

- 生产环境中使用插件如 `babel-plugin-transform-remove-console`

#### ▍PurgeCSS / unocss

- 对 Tailwind / UI 框架中未使用的样式做清理，减少 CSS 体积

#### ▍CDN 外部引入公共依赖

- 如 `react`、`vue`、`lodash` 等大体积依赖通过 `&lt;script&gt;` 方式从 CDN 加载，减少 bundle 大小

---

### 2. **构建优化（提速）**

#### ▍按需加载组件和模块

- 使用动态 `import()` 实现路由、模块懒加载
- 配合组件库的按需引入，如 `babel-plugin-import`（antd、element）

#### ▍第三方依赖预构建（Vite）

- 利用 `optimizeDeps` 提前打包依赖，避免重复分析

#### ▍模块缓存

- `babel-loader` 设置缓存 `cacheDirectory: true`
- Webpack 配置 `cache: { type: 'filesystem' }` 提升二次构建速度

#### ▍多线程构建 / 构建并行化

- 使用 `thread-loader`、`parallel-webpack` 等多进程提升编译效率

---

### 3. **资源拆分与懒加载**

#### ▍代码分割（Code Splitting）

- 按路由、页面、模块拆分 Bundle
- Webpack 提供 `SplitChunksPlugin` 支持自动分包

#### ▍动态导入（Dynamic Import）

```js
const Chart = () => import('@/components/Chart.vue')
````

* 配合 Vue/React 的异步组件使用，提高页面初次加载速度

---

### 4. **缓存优化（长效缓存）**

#### ▍利用浏览器强缓存 + 哈希策略

* 文件名加上 `contenthash`（如 main.1d2a.js）用于缓存命中控制
* 避免修改一处导致整个包缓存失效

#### ▍合理拆分 runtime 和 vendor

* runtime-chunk 单独提取，避免每次打包都变 hash
* vendor 依赖单独打包，缓存稳定

---

### 5. **资源优化**

#### ▍图片优化

* 使用 WebP、AVIF 等新格式
* 使用 `image-webpack-loader` 或 `vite-imagetools` 自动压缩

#### ▍字体优化

* 使用子集字体（Subset Font）工具，如 fontmin
* 避免全量加载中文字体

#### ▍懒加载 & 预加载

* 图片懒加载：`<img loading="lazy">`
* 使用 `&lt;link rel="preload"&gt;` 优化关键资源加载顺序

---

### 6. **构建分析工具**

* Webpack：`webpack-bundle-analyzer`
* Vite：`rollup-plugin-visualizer`
* 可视化打包体积，识别大文件和重复依赖

---

## 三、常见误区

* ❌ 忽略 Tree Shaking 的前提（必须是 ESModule）
* ❌ 所有第三方依赖都打入主包，导致首页包体积过大
* ❌ 不拆分 runtime，hash 每次都变，缓存失效
* ❌ 图片、字体未压缩或未做懒加载处理
* ❌ Dev 和 Prod 构建策略一致，未根据环境优化配置

</details>

## 9. 在你看来性能优化要做的事情是什么 {#question-subjective-ff6d8d9c1c7e}

### 题目要点

- 强调性能优化是系统性工程，分阶段、分层次开展<br>
- 能针对不同场景给出合理手段（如移动端、弱网环境）<br>
- 熟悉工具链，数据驱动优化而非凭经验猜<br>
- 有实际落地经验和效果衡量能力

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望了解你是否具备系统性性能优化思维<br>
#### ● 能否从用户体验出发，定位并解决关键性能瓶颈<br>
#### ● 是否熟悉前端各个阶段的性能优化手段（构建、加载、渲染、交互）<br>
#### ● 是否具备实战经验、能结合项目场景制定优化策略<br>

---

### 参考答案

## 一、性能优化的核心目标

性能优化的终极目标是 **提升用户体验**，体现在：

- 首屏加载快<br>
- 页面交互流畅<br>
- 渲染不卡顿<br>
- 网络请求高效<br>
- 移动端体验佳<br>

它不是单点的“改某个代码”，而是一个**系统性工程**，需要从多个阶段着手优化：

---

## 二、性能优化的系统拆解

### 1. **构建阶段优化**

- 减少打包体积（Tree Shaking、代码压缩、图片压缩、按需加载）<br>
- 提高构建效率（缓存、并行编译、多线程、Vite等新工具）<br>
- 模块分包（SplitChunks、路由懒加载）<br>

### 2. **网络传输优化**

- 使用 CDN 加速静态资源分发<br>
- 压缩资源：Gzip、Brotli<br>
- 合理设置 Cache-Control / ETag，利用浏览器缓存<br>
- 优先加载关键资源（Preload / Prefetch）<br>
- 图片使用 WebP / AVIF、懒加载<br>

### 3. **渲染性能优化**

- 避免重排重绘（合理使用 `transform` 替代 `top/left`）<br>
- 减少 DOM 数量、避免频繁操作 DOM<br>
- 虚拟列表（虚拟滚动）优化长列表<br>
- 适当使用 `will-change` 或触发 GPU 加速<br>
- 减少复杂动画或用 `requestAnimationFrame` 控制节奏<br>

### 4. **交互响应优化**

- 使用事件节流 / 防抖优化频繁触发（如 scroll、resize）<br>
- Web Worker 异步处理计算任务，避免阻塞主线程<br>
- 复杂组件异步加载（异步组件）<br>
- 合理分离状态管理，避免组件不必要重渲染<br>

### 5. **首屏优化**

- SSR / SSG 预渲染页面，减少白屏时间<br>
- Critical CSS 内联<br>
- Skeleton 骨架屏占位<br>
- 按需加载资源 & 延迟加载非关键模块<br>

### 6. **框架层优化（如 React、Vue）**

- 避免父组件更新导致子组件无意义重渲染<br>
- 使用 `memo` / `shouldComponentUpdate` / `watch` 等手段<br>
- React 的 `useMemo`、`useCallback` 控制副作用<br>

---

## 三、性能优化的实用工具

- Lighthouse：性能评分与优化建议<br>
- Chrome DevTools：Performance/Network 分析瓶颈<br>
- WebPageTest / PageSpeed Insights：外部环境真实测试<br>
- SourceMap + Sentry：分析线上性能和错误信息<br>

---

## 四、性能优化不是“优化一行代码”，而是策略思维

优秀的性能优化，需要从：

- 用户视角出发：什么对体验影响最大？
- 成本收益比：优化代价 vs 效果是否合理？
- 持续性能力：如何避免回归？是否构建指标监控？

</details>

## 10. 有做过代码执行上的性能优化吗 {#question-subjective-c488fa7f45da}

### 题目要点

* 能指出常见代码执行瓶颈及其成因（算法、重复执行、阻塞主线程）
* 表现出你在实际项目中识别并解决这些问题的能力
* 突出思路系统性 + 工具分析支撑 + 可衡量的结果

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官想确认你是否具备深入理解代码执行性能瓶颈的能力<br>
#### ● 是否有实战经验，能识别并优化高频执行逻辑、重计算、内存浪费等问题<br>
#### ● 是否能用合适的分析工具定位代码层面的问题，并评估优化效果<br>

---

### 参考答案

## 一、代码执行性能优化的理解

代码执行性能问题，通常体现在以下方面：

- **频繁执行 / 重复执行的逻辑过重**
- **数据结构和算法不当，导致不必要的循环、遍历、查找**
- **内存使用过多、泄漏，造成卡顿甚至崩溃**
- **阻塞主线程的同步操作，影响渲染流畅性**

优化的目标是让“必须执行的代码”**更快、更少、更轻**。

---

## 二、典型优化场景和实战经验

### 1. **高频函数防抖/节流**

在项目中处理如 `scroll`、`resize`、`input` 事件时：

- 使用 `lodash.debounce` 或 `throttle` 限制触发频率
- 配合 `requestAnimationFrame` 控制回调节奏（尤其是动画相关）

> 示例：

```js
const handleScroll = throttle(() => {
  // 逻辑优化后避免不必要的 DOM 查询
}, 200)
````

---

### 2. **避免不必要的重计算（缓存结果）**

* 对高计算成本的操作使用 **memoization**（记忆化）
* React/Vue 中使用 `useMemo`、`computed` 缓存派生状态

> 真实案例：项目中有个商品价格分段算法，原本每次渲染都重新计算，后来改为基于输入值的缓存映射，大幅降低卡顿

---

### 3. **选择高效的数据结构和算法**

* 频繁查询场景使用 `Map` 代替 `Array.find()` 进行 O(1) 索引
* 数组处理时避免 `filter + map + reduce` 多次遍历合并为一次循环

---

### 4. **避免深层嵌套循环与递归**

* 优化算法复杂度，减少 O(n²) 及以上代码路径
* 使用迭代代替深递归，避免堆栈溢出

---

### 5. **使用 Web Worker 异步处理计算**

对于图表数据聚合、批量加密处理等 CPU 密集型任务：

* 利用 Web Worker 解耦主线程，防止 UI 卡顿

---

### 6. **避免重复绑定和无意义执行**

* 将绑定事件移出 `render` 函数
* 避免每次渲染都创建新函数（可使用 useCallback/memo 包裹）

---

## 三、性能分析工具使用

* Chrome DevTools > Performance：分析执行耗时和帧率
* Performance.mark/measure：代码段精细打点
* memory 面板：识别泄漏对象、观察垃圾回收频率
* Lighthouse：识别长任务和主线程阻塞

---

## 四、代码执行优化的结果

在多个实际项目中，我通过以上优化：

* 页面卡顿帧率由 <30fps 提升至 >55fps
* 高计算表格滚动性能提升显著
* 大量用户数据聚合任务延迟减少 30\~50%
* 首次交互时间（TTI）提前约 300\~500ms

</details>

## 11. 在vue开发中需要关注哪些要点来避免性能劣化的情况 {#question-subjective-7e707805f957}

### 题目要点

* 突出你对 Vue 响应式机制的理解（如依赖收集、副作用触发）
* 能结合项目经验，说明哪些优化提升明显、如何落地
* 分析问题要有“前因后果”逻辑，优化前 vs 优化后效果对比
* 不只是性能意识，更要有“可执行”的操作细节

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望确认你是否具备良好的 Vue 性能意识和实践经验<br>
#### ● 是否了解 Vue 的响应式机制、渲染流程和组件更新机制<br>
#### ● 能否识别项目中可能导致性能下降的代码模式并加以避免<br>
#### ● 是否掌握实际的优化技巧并知道在什么场景下使用<br>

---

### 参考答案

## 一、Vue 性能劣化的常见来源

Vue 是基于响应式和虚拟 DOM 的框架，但以下常见因素可能引发性能问题：

- **数据响应式追踪粒度过细或过粗**
- **模板渲染层级深、频繁更新**
- **组件更新链条过长，未做适当断流**
- **使用 v-for 过多、未加 key 或 key 使用不当**
- **watcher 数量庞大、计算属性重计算频繁**
- **DOM 操作或第三方插件引发不必要的更新**

---

## 二、避免性能劣化的关键要点

### 1. **避免不必要的数据响应式追踪**

#### ✅ 使用 `Object.freeze` 标记静态对象为不可变，减少响应式开销<br>
#### ✅ 合理划分 data 中响应式数据与普通变量

```js
const staticData = Object.freeze({ foo: 123 }) // 不被响应式追踪
````

---

### 2. **控制组件更新范围**

#### ✅ 使用 `v-if` / `v-show` 控制渲染时机（区别在于销毁与隐藏）

#### ✅ 利用 `keep-alive` 缓存切换组件，避免重复渲染

#### ✅ 利用 `functional` 组件（Vue2）减少渲染开销

---

### 3. **使用合适的 `key` 避免频繁 diff**

#### ✅ 使用稳定唯一的 key，避免使用 index 作为 key

#### ✅ 避免 v-for 嵌套过深、一次渲染过多节点，可使用分页或虚拟列表

```vue
<li v-for="item in list" :key="item.id">...</li>
```

---

### 4. **合理使用计算属性和 watch**

#### ✅ 计算属性具有缓存机制，应优先使用而非 methods

#### ⚠️ watch 不宜滥用，应精确指定监听字段，避免误触发

```js
computed: {
  fullName() {
    return this.firstName + this.lastName
  }
}
```

---

### 5. **避免深层嵌套组件级联更新**

#### ✅ 使用 `shouldComponentUpdate`（Vue3 中是 `shallowReactive`、`readonly`）

#### ✅ Vue2 可使用 `v-once`、`:key` 控制组件复用策略

#### ✅ 利用异步组件分割大页面逻辑

---

### 6. **避免 watch 大对象或深层属性**

#### ✅ 使用精确路径监听，或 `immediate + deep: false` 避免递归开销

```js
watch: {
  'form.name'(newVal) {
    // OK
  },
  // ⚠️ 深层 watch 会追踪整个对象
  form: {
    handler(newVal) {},
    deep: true,
  }
}
```

---

### 7. **避免频繁 DOM 操作引发 patch**

#### ✅ 尽量避免 `this.$refs.xxx.innerText = ...` 直接操作 DOM

#### ✅ 若必须操作，请确保不触发响应式更新链

---

### 8. **控制组件生命周期行为**

#### ✅ 在 `beforeDestroy` / `unmounted` 阶段移除监听、定时器、事件等，防止内存泄漏

#### ✅ 注意组件重复挂载引发的状态残留

---

## 三、实战经验补充

* 在大型表格中使用虚拟滚动（如 vue-virtual-scroll-list）处理上千条数据
* 使用 Vue Devtools 和 Performance 面板追踪组件更新频率
* 抽离常驻数据模块为全局单例，避免多次创建影响响应式系统
* 将异步数据提前加载或 SSR 预渲染缓解首屏压力

</details>

## 12. 说说http不同版本的一些区别 {#question-subjective-ea3560db246b}

### 题目要点

- 不要只背版本号，要结合网络原理理解每一代协议的“**问题 → 优化**”演进路径<br>
- 强调**HTTP/2 的多路复用解决了什么痛点**，**HTTP/3 又为移动场景带来了哪些变化**<br>
- 说明你是否有实际接触过 HTTP/2 / 3 的部署或调试，提升可信度<br>
- 表达能力上可以使用对比图或类比帮助理解（如：高速公路车道类比多路复用）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望了解你对 Web 基础协议演进的理解<br>
#### ● 是否理解各版本提升性能、安全性和效率的关键点<br>
#### ● 是否能结合项目场景说明协议优化对性能的影响<br>
#### ● 是否具备实际配置或调优经验（如 Nginx、浏览器请求）<br>

---

### 参考答案

## 一、HTTP 各版本的核心区别概览

| 特性 | HTTP/1.0 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|----------|--------|--------|
| 连接复用 | ❌ 不支持 | ✅ 默认支持 | ✅ 多路复用 | ✅ 基于 QUIC 多路复用 |
| 传输协议 | TCP | TCP | TCP | QUIC (UDP) |
| 首部压缩 | ❌ | ❌ | ✅ HPACK | ✅ QPACK |
| 请求顺序阻塞 | ✅ 队头阻塞 | ✅ 队头阻塞 | ❌ | ❌ |
| 服务端推送 | ❌ | ❌ | ✅ 支持 | ✅（实验中） |
| 建连效率 | 慢（三次握手） | 较慢 | 较慢 | 快（0-RTT） |
| 明文 / 加密 | 明文 | 明文 | 建议加密（TLS） | 默认加密（TLS + QUIC） |

---

## 二、详细说明各版本的关键特性

### 1. HTTP/1.0 —— 最早的版本

- **特点**：每次请求都建立 TCP 连接，响应完即断开
- **缺点**：无法复用连接，频繁握手导致性能差<br>
- **实际应用**：已基本淘汰，但部分设备或老系统仍支持

---

### 2. HTTP/1.1 —— 主流的基础版本

- **持久连接（Connection: keep-alive）**：允许复用连接<br>
- **管道化请求（pipelining）**：多个请求可以连续发出，但响应仍要按顺序返回，存在队头阻塞（HOL Blocking）<br>
- **缓存控制（Cache-Control、ETag）**<br>
- **分块传输编码（chunked）**：支持动态响应体长度<br>

> 实际中，**队头阻塞**依旧是性能瓶颈，特别是在移动端弱网下

---

### 3. HTTP/2 —— 大幅提升性能的版本

- **多路复用（Multiplexing）**：一个 TCP 连接同时传多个流，互不干扰，彻底解决队头阻塞<br>
- **二进制分帧（frame）**：更高效、更易解析<br>
- **头部压缩（HPACK）**：极大减少请求体积，提升弱网体验<br>
- **服务器推送（Server Push）**：可主动推送资源（实践中较少使用）<br>
- **加密推荐**：非强制，但主流浏览器要求必须 HTTPS 才启用 HTTP/2<br>

---

### 4. HTTP/3 —— 面向未来的版本

- **基于 QUIC 协议（UDP 之上）**：替代 TCP，天然支持多路复用和连接迁移（IP 变化不丢连接）<br>
- **0-RTT 握手**：历史连接可实现“秒连”，提升移动端体验<br>
- **TLS 1.3 加密默认启用**，更快更安全<br>
- **服务端推送实验中**：性能不稳定，部分浏览器已弃用该特性<br>

> 实际中，**Chrome、Edge、Firefox 等主流浏览器已逐步支持 HTTP/3**，但服务端部署仍需特别配置（如 Nginx + QUIC）

---

## 三、协议演进背后的性能优化目标

1. **减少连接建立成本**
2. **提升并发请求能力**
3. **减少冗余（如请求头）传输体积**
4. **提升弱网环境下的可靠性**
5. **增强安全性（强制加密通信）**

</details>

## 13. http2.0有哪些缺点 {#question-subjective-63029a16c6dd}

### 题目要点

- 明确指出 HTTP/2 并非完美，TCP 层的队头阻塞依然是性能瓶颈<br>
- 结合实际场景分析加密和推送的实际挑战<br>
- 体现对部署调试复杂度的认识，表现实际工程视角<br>
- 体现对 HTTP/3 设计的理解（如基于 UDP 解决 TCP 队头阻塞）

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望了解你对 HTTP/2 的全面理解，尤其是其局限性和不足<br>
#### ● 是否能理性分析新技术的优缺点，具备实际项目中技术选型的判断力<br>
#### ● 是否了解 HTTP/2 在不同场景或部署上的挑战<br>

---

### 参考答案

## 一、HTTP/2 的缺点与局限性

### 1. **队头阻塞（Head-of-Line Blocking）仍存在于 TCP 层**

虽然 HTTP/2 在应用层通过多路复用解决了队头阻塞问题，但它依赖于 TCP 连接，而 TCP 本身存在队头阻塞：

- TCP 是面向连接的可靠协议，数据包必须按序到达，否则后续数据包会被阻塞等待重传<br>
- 当某个包丢失时，所有后续的数据都需等待重传完成，影响整体性能<br>
- 这在高丢包率的网络环境（如移动网络）表现尤为明显

---

### 2. **加密（TLS）成为常态，增加了服务器负担**

- 虽然 HTTP/2 并不强制使用 HTTPS，但主流浏览器要求 HTTP/2 必须在 TLS 上运行<br>
- TLS 握手、加密解密增加了服务器 CPU 负担<br>
- 对资源有限的服务器和旧设备可能有性能影响<br>

---

### 3. **服务器推送（Server Push）实际应用效果有限**

- 服务器主动推送资源虽然理论上能减少请求延迟，但实际中常出现推送了用户不需要的资源，反而浪费带宽<br>
- 管理和缓存策略复杂，导致使用门槛较高<br>
- 目前很多主流网站和浏览器对服务器推送支持不积极，甚至部分弃用<br>

---

### 4. **部署和调试复杂度较高**

- HTTP/2 的二进制分帧和多路复用机制使得网络抓包和分析更加困难<br>
- 一些老旧或中间网络设备（如代理、防火墙）可能对 HTTP/2 支持不佳，影响兼容性<br>
- 需要服务器和 CDN 升级支持，对运维成本和技术要求提升

---

### 5. **单一 TCP 连接的瓶颈**

- 虽然多路复用提高了并发能力，但所有请求共享同一个 TCP 连接<br>
- 当连接出现故障或被中断时，影响所有请求<br>
- 这也是 HTTP/3 转向 QUIC（UDP）协议的一个主要动因

---

## 二、总结

| 缺点                          | 说明                                                         |
|-----------------------------|------------------------------------------------------------|
| TCP 层队头阻塞               | 网络丢包导致所有请求阻塞，影响性能                                |
| 必须依赖 TLS                 | 加密带来性能开销，部署成本增加                                  |
| 服务器推送复杂且使用受限       | 推送资源管理困难，实际效果有限                                   |
| 部署调试复杂                 | 抓包分析困难，兼容性受限                                       |
| 单一 TCP 连接故障风险         | 连接断开影响所有请求                                          |

</details>

## 14. http1对同时并发请求的数量是有限制的，你了解吗 {#question-subjective-2809c9a2c7d1}

### 题目要点

- 明确浏览器对 HTTP/1.x 单域名并发连接数限制大约是 6 个左右<br>
- 说明限制的缘由与性能权衡<br>
- 结合实际开发中的优化策略，如域名分片、HTTP/2 升级、资源合并<br>
- 体现对协议层和浏览器行为的综合理解

<details>
<summary>参考答案</summary>

### 考察点

#### ● 面试官希望确认你对 HTTP/1.x 协议并发请求限制的理解<br>
#### ● 是否了解浏览器层面对并发连接的限制及其性能影响<br>
#### ● 能否结合协议特点说明为何会有该限制及实际优化策略<br>

---

### 参考答案

## 一、HTTP/1.x 并发请求限制的背景

- HTTP/1.0 和 HTTP/1.1 中，每个 TCP 连接一般只能处理一个请求（HTTP/1.0 不支持持久连接，HTTP/1.1 支持持久连接但无多路复用）<br>
- 浏览器为了避免过多打开 TCP 连接，**对同一域名的并发 TCP 连接数量有限制**<br>
- 该限制主要由浏览器厂商定义，不同浏览器限制数略有差异，通常为 6-8 个并发连接<br>

---

## 二、常见浏览器并发连接数限制举例

| 浏览器       | 同一域名最大并发连接数 |
|------------|-------------------|
| Chrome     | 6                 |
| Firefox    | 6                 |
| Edge       | 6                 |
| Safari     | 6-8               |
| IE 11      | 6                 |

---

## 三、限制产生的原因和影响

### 1. 资源和性能平衡

- 限制并发连接数避免因连接数过多导致服务器压力增大和客户端资源枯竭（如文件描述符耗尽）<br>
- 限制过低会造成请求排队，降低页面加载速度，尤其是多个资源并发请求时表现明显

### 2. 队头阻塞和阻塞现象

- 并发连接数限制导致后续请求必须排队等待空闲连接，形成“队头阻塞”<br>
- 对页面首屏加载性能有明显影响

---

## 四、解决方案和优化措施

### 1. **域名分片（Domain Sharding）**

- 利用多个子域名分散请求，突破单域名并发限制<br>
- 但会增加 DNS 查询、TCP 握手成本，且 HTTP/2 不建议使用此策略

### 2. **使用 HTTP/2**

- HTTP/2 支持单连接多路复用，彻底解决此类限制问题<br>
- 推荐升级到 HTTP/2 或以上版本

### 3. **资源合并和压缩**

- 合并 JS、CSS 减少请求数量<br>
- 使用雪碧图减少图片请求数

</details>

## 15. 说说http和https的区别 {#question-subjective-75fecca2b681}

### 题目要点

- 重点区分“传输协议和安全机制”的不同<br>
- 明确 HTTPS 使用证书和加密保障安全<br>
- 说明 HTTPS 带来的安全和信任优势<br>
- 知道 HTTPS 可能带来的性能影响及解决方案<br>
- 结合实际业务场景说明 HTTPS 的必要性

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 HTTP 和 HTTPS 的基本定义和区别<br>
#### ● 掌握 HTTPS 的安全机制及其工作流程<br>
#### ● 能说明 HTTPS 在实际项目中的必要性及影响<br>
#### ● 具备网络安全意识，理解数据传输安全的重要性<br>

---

### 参考答案

## 一、HTTP 和 HTTPS 的核心定义

- **HTTP（HyperText Transfer Protocol）**：超文本传输协议，基于 TCP，明文传输数据<br>
- **HTTPS（HTTP Secure）**：基于 HTTP 的安全传输协议，数据通过 TLS/SSL 加密传输，保障数据安全与完整性<br>

---

## 二、HTTP 与 HTTPS 的主要区别

| 维度           | HTTP                         | HTTPS                          |
|--------------|-----------------------------|------------------------------|
| 传输协议        | TCP                          | TCP + TLS/SSL                 |
| 数据传输安全性    | 明文传输，数据易被窃取或篡改           | 加密传输，防止窃听、中间人攻击、篡改  |
| 端口号          | 默认端口 80                   | 默认端口 443                  |
| 证书           | 无                           | 需申请数字证书，验证身份           |
| 性能开销        | 较低                         | 加密/解密带来一定计算开销           |
| SEO 优势        | 无                           | 搜索引擎倾向 HTTPS，提升排名         |
| 用户信任度       | 低                           | 高，浏览器地址栏显示安全标识         |

---

## 三、HTTPS 的工作流程（简要）

1. **客户端发起 HTTPS 请求**<br>
2. **服务器返回数字证书**（包含公钥和身份信息）<br>
3. **客户端验证证书合法性**（通过证书链信任根）<br>
4. **客户端生成对称加密密钥，用服务器公钥加密后发送给服务器**<br>
5. **服务器用私钥解密，双方获得共享的对称密钥**<br>
6. **接下来通信采用对称加密，保障数据机密和完整性**

---

## 四、为什么选择 HTTPS？

- 防止中间人攻击（MITM）、数据窃取和篡改<br>
- 保障用户隐私，尤其是涉及登录、支付等敏感操作<br>
- 浏览器对 HTTP 页面限制访问权限，HTTPS 享受更多新特性支持（如 Service Worker、HTTP/2）<br>
- 搜索引擎更偏好 HTTPS，提高网站权重和流量<br>
- 法规和合规要求（如 GDPR）推动使用 HTTPS

---

## 五、性能方面的考虑

- HTTPS 引入 TLS 握手，增加初始连接时间和计算开销<br>
- 现代技术（TLS 1.3、HTTP/2、多路复用）已显著减少性能损耗<br>
- CDN 和硬件加速普遍支持 HTTPS，影响微乎其微

</details>

## 16. 具体说一下https加密的方法和流程 {#question-subjective-364022cf3845}

### 题目要点

- 清晰区分**非对称加密用于密钥交换**，**对称加密用于数据传输**<br>
- 理解数字证书的身份验证作用<br>
- 熟悉握手过程的具体步骤和意义<br>
- 理解握手安全性及性能优化（Session 重用、TLS 1.3 特性）<br>
- 能结合项目场景谈 HTTPS 加密带来的安全保障

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 HTTPS 加密的核心原理和组成技术（TLS/SSL）<br>
#### ● 熟悉 HTTPS 握手和加密通信的具体流程<br>
#### ● 能解释对称加密、非对称加密和数字证书在 HTTPS 中的作用<br>
#### ● 掌握 HTTPS 安全性如何保障数据机密性、完整性和身份验证<br>

---

### 参考答案

## 一、HTTPS 加密的核心技术组成

### 1. **非对称加密（公钥加密）**

- 使用一对密钥：公钥（公开）和私钥（保密）<br>
- 用公钥加密的数据只能用私钥解密，反之亦然<br>
- 优点：解决密钥分发问题<br>
- 缺点：加解密速度慢，通常用于密钥交换

### 2. **对称加密**

- 双方使用同一密钥进行加密和解密<br>
- 加密速度快，适合大量数据传输<br>
- 需保证密钥安全传输

### 3. **数字证书和证书链**

- 由权威的证书颁发机构（CA）签发<br>
- 用于验证服务器身份，防止假冒<br>
- 包含公钥、持有者信息、有效期等

---

## 二、HTTPS 加密流程详解

### 1. 客户端发起 HTTPS 请求

- 浏览器向服务器发起 TCP 连接请求（通常 443 端口）

### 2. 服务器返回数字证书

- 服务器返回自己的数字证书（包含公钥）给客户端<br>
- 证书中带有 CA 签名，保证证书真实性

### 3. 客户端验证证书

- 客户端验证证书是否由受信任的 CA 签发<br>
- 验证证书是否过期、是否被吊销、是否域名匹配等<br>
- 验证失败则警告用户或拒绝连接

### 4. 客户端生成对称密钥（Session Key）

- 浏览器生成一个随机的对称密钥（称为“会话密钥”）<br>
- 使用服务器公钥对该密钥进行加密

### 5. 客户端发送加密的对称密钥给服务器

- 服务器用自己的私钥解密，获得客户端生成的对称密钥

### 6. 双方开始对称加密通信

- 接下来，所有通信均用该对称密钥加密，保证数据机密性和传输效率<br>
- 对称加密速度快，适合大数据量传输

### 7. 完成握手，传输加密数据

- 通过消息认证码（MAC）保障数据完整性<br>
- 利用随机数、防重放机制保障通信安全性

---

## 三、补充说明：TLS 握手的类型

- **完全握手（Full handshake）**：第一次连接时完整的密钥协商过程<br>
- **复用握手（Session resumption）**：重连时通过 Session ID 或 Session Ticket 快速恢复密钥，节省握手时间<br>
- **0-RTT（TLS 1.3）**：允许客户端提前发送加密数据，进一步减少延迟

---

## 四、HTTPS 加密流程图示意

```

客户端                                 服务器
\| ----- Client Hello -------------> |
\| <---- Server Hello, Cert -------- |
\| ----- Client Key Exchange (enc) -> |
\| <---- Server Finished ----------- |
\| ------ Client Finished ---------> |
\| <--------- 加密数据传输 ----------> |

```

</details>

## 17. Promise和async await的区别 {#question-subjective-eb11091a014d}

### 题目要点

* 重点理解 async/await 是 Promise 的语法糖
* 说明语法、可读性、异常处理上的差异
* 理解执行顺序和并发控制的区别
* 能举例说明典型用法和注意事项
* 避免常见误区，展现对异步机制深刻理解

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解 Promise 和 async/await 两种异步编程方式的基本概念<br>
#### ● 掌握它们在语法、执行机制和异常处理上的差异<br>
#### ● 能说明 async/await 是基于 Promise 的语法糖及其优势和限制<br>
#### ● 理解异步代码的可读性、调试、性能等方面的区别<br>

---

### 参考答案

## 一、核心概念

### 1. Promise

- 是 ES6 引入的异步编程方案<br>
- 表示一个异步操作的最终完成（或失败）及其结果值<br>
- 通过 `.then()`、`.catch()` 和 `.finally()` 链式调用处理异步结果和异常<br>
- 体现了回调的扁平化，避免“回调地狱”

### 2. async/await

- 是 ES2017（ES8）引入的异步编程语法糖，基于 Promise 实现<br>
- `async` 标记函数，表示函数内部可使用 `await`<br>
- `await` 用于等待一个 Promise 对象完成，并返回其结果，写法更接近同步代码<br>
- 使异步代码更直观、易读、易写，异常捕获更方便（try/catch）

---

## 二、区别详解

| 维度            | Promise                                    | async/await                              |
|---------------|------------------------------------------|----------------------------------------|
| 语法形式         | 基于回调 `.then()` 链式调用                      | 通过关键字 `async` 和 `await` 实现同步风格异步代码        |
| 可读性           | 链式调用，嵌套多时略显复杂                       | 更像同步代码，流程清晰，易于理解和维护                  |
| 异常处理         | 使用 `.catch()` 捕获异常                        | 可用 `try/catch` 语法捕获，更符合同步异常处理习惯          |
| 错误堆栈跟踪       | 堆栈信息可能丢失，调试不便                         | async/await 调试友好，错误堆栈更完整                    |
| 并行执行支持       | `.all()` 等方法支持多 Promise 并行执行               | 需显式使用 `Promise.all()`，单纯 `await` 会顺序执行          |
| 兼容性           | ES6，较早支持                                 | ES2017，较晚支持，旧环境需转译                          |
| 底层机制         | 直接使用 Promise 对象及其状态变化                      | 实际是基于 Promise 封装的生成器函数（Generator）             |

---

## 三、执行顺序和性能差异

- async/await 只是语法糖，底层仍是 Promise，性能无明显差异<br>
- 单纯连续使用多个 `await` 会导致顺序执行，可能影响性能<br>
- 需要并行时，仍需配合 `Promise.all()` 进行并发执行<br>

---

## 四、使用场景对比

| 场景                 | Promise                          | async/await                         |
|--------------------|--------------------------------|----------------------------------|
| 简单异步链条             | 适用，代码较短                     | 也适用，写法更清晰                    |
| 多层嵌套回调             | Promise 可减少嵌套，但链条长仍复杂            | async/await 极大提升可读性                |
| 并发多个异步操作           | `.all()` 易用且高效                   | 需结合 `Promise.all()` 使用               |
| 复杂错误处理             | `.catch()` 处理较为分散                 | `try/catch` 异常捕获更集中               |
| 调试与维护              | 堆栈信息可能丢失，不易调试                | 异常堆栈清晰，调试友好                   |

---

## 五、示例对比

```js
// Promise 方式
function fetchData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.error(err);
    });
}

// async/await 方式
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
````

---

## 六、常见误区和面试陷阱

* **误区1**：async 函数内部代码是同步的，实际上 `await` 后的代码是异步微任务
* **误区2**：连续多个 `await` 自动并行，实际是顺序执行，需使用 `Promise.all`
* **误区3**：async 函数一定返回普通值，实为返回 Promise 对象
* **陷阱**：忽略错误捕获导致未捕获 Promise 拒绝异常

</details>

## 18. async await具体是怎么实现的 {#question-subjective-ca0cae3b73dc}

### 题目要点

* async/await 是基于 Generator + Promise 的语法糖
* async 函数返回 Promise，await 负责暂停和恢复异步操作
* await 实际等待一个 Promise 的解析
* 通过内部自动执行 Promise 的 `.then()` 推进 Generator，简化异步流程
* 错误处理可用同步风格的 `try/catch`，异常会反映在返回的 Promise 中

<details>
<summary>参考答案</summary>

### 考察点

#### ● 深入理解 async/await 的底层实现机制<br>
#### ● 掌握 async/await 与 Generator、Promise 的关系<br>
#### ● 理解 async 函数的执行流程和状态管理<br>
#### ● 能解释 await 如何暂停和恢复异步操作<br>

---

### 参考答案

## 一、async/await 的核心思想

- `async/await` 是基于 **Generator** 函数和 **Promise** 的语法糖，目的是让异步代码写得像同步代码一样简洁、直观<br>
- async 函数本质上会返回一个 Promise 对象<br>
- `await` 用于等待一个 Promise 解析，暂停 async 函数的执行，直到 Promise 解决（fulfilled）或拒绝（rejected）

---

## 二、async/await 的底层实现原理

### 1. async 函数返回 Promise

- 编译后，async 函数会自动包装成一个返回 Promise 的函数<br>
- 函数内部执行的同步代码正常执行，遇到 `await` 会暂停，并挂起后续操作，直到等待的 Promise 解析完成<br>

### 2. await 实现原理

- `await` 实际等待的是一个 Promise<br>
- 当遇到 `await promise` 时，async 函数暂停执行，将控制权返回给调用者（挂起执行上下文）<br>
- 当 Promise 状态变为 fulfilled 或 rejected，恢复函数执行并将结果（或错误）返回<br>

### 3. 结合 Generator 函数模拟 async/await

- Generator 通过 `yield` 暂停函数，外部驱动执行（`next()`）<br>
- async/await 类似于 Generator + Promise 的结合：<br>
  - `await` 相当于 `yield` 一个 Promise<br>
  - 通过递归调用 `.then()` 来自动推进 Generator 的执行<br>

```js
// 简化版 async/await 实现示例（基于 Generator）
function asyncToGenerator(generatorFunc) {
  return function () {
    const gen = generatorFunc.apply(this, arguments);
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let info;
        try {
          info = gen[key](arg);
        } catch (error) {
          reject(error);
          return;
        }
        const { value, done } = info;
        if (done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            val => step("next", val),
            err => step("throw", err)
          );
        }
      }
      step("next");
    });
  };
}
````

---

## 三、async 函数执行流程

1. **调用 async 函数**，立即返回一个 Promise
2. 函数内部代码同步执行，遇到 `await` 时暂停，返回控制权
3. 等待 `await` 后的 Promise 解析完成（fulfilled 或 rejected）
4. 根据 Promise 结果，恢复函数执行（执行下一步）
5. 最终函数执行完毕，Promise 变为 resolved 或 rejected，返回对应值或异常

---

## 四、错误处理机制

* async 函数中，`await` 后的 Promise 如果 reject，会抛出异常
* 可以通过 `try/catch` 捕获这些异常，类似同步代码异常处理
* 未捕获异常会导致返回的 Promise 变为 rejected，触发外部 `.catch()`

</details>

## 19. 算法题：最大并发数控制 {#question-subjective-78b12bde9d11}

### 题目要点

* 明确并发数控制的业务场景和重要性
* 理解异步任务队列和并发数计数管理
* 代码实现要保证任务顺序和结果对应
* 异常捕获和保证全部任务结束的 Promise 机制
* 说明优化点和实际应用价值

<details>
<summary>参考答案</summary>

### 考察点

#### ● 理解并发控制的概念及其在异步任务调度中的应用<br>
#### ● 掌握如何通过代码限制同时执行的异步任务数量<br>
#### ● 能实现基于 Promise 的最大并发数控制器（限流器）<br>
#### ● 理解任务队列管理、执行顺序和状态更新的机制<br>
#### ● 熟悉实际场景如接口请求并发限制、资源调度优化<br>

---

### 参考答案

## 一、问题定义

- 给定多个异步任务（通常是返回 Promise 的函数），限制同一时间最多只能有 N 个任务并发执行<br>
- 当一个任务完成后，从队列中取下一个任务开始执行<br>
- 直到所有任务完成

---

## 二、核心原理与实现思路

1. **任务队列管理**<br>
   - 所有待执行的任务放入一个队列<br>
2. **并发数计数**<br>
   - 维护当前正在执行的任务数量（计数器）<br>
3. **任务调度机制**<br>
   - 当并发数未达到上限，取出队列中的任务执行<br>
   - 任务完成后减少并发数，触发队列继续执行<br>
4. **返回一个 Promise，保证所有任务执行完后通知结果**

---

## 三、代码示例

```js
function limitConcurrency(tasks, maxConcurrent) {
  let index = 0; // 当前任务索引
  let activeCount = 0; // 当前并发数
  const results = [];
  return new Promise((resolve, reject) => {
    function next() {
      if (index === tasks.length && activeCount === 0) {
        // 所有任务执行完毕
        resolve(results);
        return;
      }
      while (activeCount < maxConcurrent && index < tasks.length) {
        const currentIndex = index;
        const task = tasks[currentIndex];
        index++;
        activeCount++;
        Promise.resolve(task())
          .then(result => {
            results[currentIndex] = result;
          })
          .catch(err => {
            results[currentIndex] = err;
          })
          .finally(() => {
            activeCount--;
            next(); // 递归触发下一个任务
          });
      }
    }
    next();
  });
}
````

---

## 四、使用示例

```js
// 模拟异步任务
function createTask(time, id) {
  return () => new Promise(res => {
    setTimeout(() => {
      console.log(`任务${id}完成`);
      res(id);
    }, time);
  });
}

const tasks = [
  createTask(3000, 1),
  createTask(2000, 2),
  createTask(1000, 3),
  createTask(4000, 4),
  createTask(500, 5),
];

limitConcurrency(tasks, 2).then(results => {
  console.log('所有任务完成', results);
});
```

---

## 五、扩展思考

* 支持任务优先级调度（优先执行重要任务）
* 支持任务失败重试机制
* 结合事件或信号实现动态调整最大并发数
* 用于接口请求限流，避免服务器压力过大

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-56/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-56/round-87/index.md" >}}) →
