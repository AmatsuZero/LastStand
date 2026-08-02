+++
title = "字节-技术中台-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/76"
experienceId = 76
roundId = 121
roundOrder = 1
company = "字节跳动"
date = "2025-09-02T07:35:12.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-76/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-76/round-122/index.md" >}}) →

**本轮要点：** 本次面试主要考察校招生的前端基础知识、框架理解（Vue和React）、TypeScript应用、手写代码能力以及解决实际问题的能力。面试官重点关注以下几个方面：
1.  **前端框架深度理解与实践**：不仅要求掌握Vue和React的基础知识，更强调对框架设计原理（如Vue的响应式、虚拟DOM）的理解，以及在实际项目中的应用能力（如Vuex到Pinia的迁移，以及在React中模拟Vue特性的思路）。
2.  **JavaScript 核心与异步编程**：对`Object.defineProperty`的数据劫持原理、Promise的深入理解及其各种组合与错误处理方式（`Promise.all`、`Promise.allSettled`），以及`async/await`与Promise的关系是考察重点。手写算法题（数组扁平化、深拷贝）考验基础编码功底。
3.  **TypeScript 实际应用**：考察对TypeScript的熟练程度，包括基本类型、高级类型（如索引签名定义动态属性）的运用，以及如何在项目中利用TypeScript提升代码质量。
4.  **工程化与性能优化**：Monorepo 多包依赖管理及冲突解决是工程实践的体现。图片懒加载的实现方式（尤其是`Intersection Observer API`的应用）及其阈值优化，体现了对前端性能优化的关注和实践经验。

整体而言，面试不仅考察"是什么"，更侧重"为什么"和"如何做"，需要候选人能够结合实际项目经验进行深入分析和解答。

本轮共 20 道题。答案默认折叠，便于先自行作答。

## 1. 你刚才提到了一些项目经历，讲一个你觉的最有成就感的？ {#question-subjective-8d95efee0278}

### 题目要点

- 这道题是典型的主观题，面试官并不期待一个"唯一标准答案"。
- 主要考察的是答题者的表达能力、系统性思考问题的方式、对项目及技术的理解深度以及从项目中复盘和学习的能力。
- 答题结构建议：简述项目背景与挑战 → 描述你的解决方案及遇到的困难 → 总结项目成果与个人成长。

<details>
<summary>参考答案</summary>

在过去的项目经历中，让我最有成就感的是负责公司内部一个复杂的用户权限管理系统重构。这个系统当时面临着用户反馈权限配置混乱、性能瓶颈突出、以及新功能迭代困难等问题。

当时的核心挑战在于，我们有上百种细粒度的权限点，并且需要支持多维度、动态的权限组合，这在旧系统中已经形成了一个巨大的权限矩阵，任何改动都牵一发而动全身。我首先主导了权限模型的梳理和抽象，将权限点进行了归类和分级，并引入了基于角色的访问控制（RBAC）模型，同时考虑了自定义策略的扩展性。技术选型上，我们从传统的后端硬编码权限逻辑，逐步迁移到了前后端分离、统一鉴权服务的方式，并通过引入缓存机制优化了权限查询性能。

在实现过程中，最大的难点是如何在不影响现有业务的前提下，平滑地进行新旧权限系统的切换。为此，我设计了一套灰度发布方案，通过用户白名单和功能开关，逐步验证新系统的稳定性和准确性。在这个过程中，我们也遇到了一些意想不到的数据同步和兼容性问题，例如在特定场景下，新旧权限解析不一致导致的用户访问异常。我积极与后端团队、产品经理沟通，快速定位问题，并及时调整了数据同步策略和回滚机制，确保了业务的连续性。

最终，重构后的权限系统不仅将权限配置的效率提升了30%，还将核心鉴权接口的响应时间从原来的数百毫秒优化到了几十毫秒，极大地提升了系统的性能和稳定性。更重要的是，它为后续的新业务快速上线提供了坚实的基础，权限迭代周期缩短了50%以上。通过这个项目，我不仅深化了对权限系统设计的理解，也锻炼了我在复杂项目中进行技术选型、架构设计、风险管理和跨团队协作的能力。这次经历让我深切体会到，解决核心痛点并为业务带来实际价值，才是技术工作的最大成就感。

</details>

## 2. 项目里 Monorepo 管理多包依赖怎么实现的； {#question-subjective-d3991a27b3f9}

### 题目要点

- Monorepo 概念：理解 Monorepo 的基本思想和优势。
- 多包依赖管理工具：了解 Lerna、Yarn Workspaces 或 pnpm Workspaces 等工具。
- 实现方式：掌握如何配置和使用这些工具来管理多包依赖，包括安装、发布、运行脚本等。
- 软链接/硬链接：理解这些工具如何通过符号链接解决依赖共享和版本管理问题。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
Monorepo 是一种代码仓库管理策略，它将多个项目的代码存储在同一个版本控制仓库中，而不是为每个项目创建独立的仓库。这种方式的出现是为了解决多项目开发中代码共享、依赖管理、版本控制和协作效率等问题。它与传统的 Multirepo（多仓库）模式相对。

其核心原理在于通过特定的工具（如 Lerna、Yarn Workspaces 或 pnpm Workspaces）来管理仓库内的多个子包（package），实现：
*   **统一的依赖管理**：所有包的依赖都集中在一个地方（通常是根目录的 `package.json` 或各自的 `package.json` 结合工具配置），避免了重复安装和版本不一致的问题。工具会通过软链接或硬链接的方式将依赖安装到各个子包的 `node_modules` 中，实现依赖的共享和复用。
*   **统一的构建、测试、发布流程**：可以配置统一的脚本来执行所有或部分包的构建、测试和发布流程，简化 CI/CD。
*   **代码共享与重用**：各个子包可以直接相互引用，无需发布到 npm 等外部仓库，方便代码共享和模块化开发。

##### 1.2 核心用法 + 示例代码
以 Yarn Workspaces 为例，它作为 Yarn 包管理器的内置功能，提供了一种轻量级的 Monorepo 解决方案。

**使用场景**:
*   **前端组件库开发**: 一个 Monorepo 中可以包含多个 UI 组件、工具函数、文档站点等，方便组件的复用和管理。
*   **微前端架构**: 各个微应用可以作为独立包存在于同一个 Monorepo 中，便于协同开发和统一管理。
*   **全栈项目**: 前端、后端、公共工具库可以放在一个 Monorepo 中，实现紧密协作。

**实现步骤（以 Yarn Workspaces 为例）**:
1.  **在根目录的 `package.json` 中配置 `workspaces` 字段**:
    ```json
    {
      "name": "my-monorepo",
      "version": "1.0.0",
      "private": true, // 阻止根目录发布到 npm
      "workspaces": [
        "packages/*", // 指定子包所在的目录，支持 glob 模式
        "apps/*"
      ]
    }
    ```
2.  **创建子包目录和 `package.json`**:
    在 `packages/` 或 `apps/` 目录下创建子包，每个子包都有自己的 `package.json` 文件。
    例如，`packages/utils/package.json`:
    ```json
    {
      "name": "@my-monorepo/utils",
      "version": "1.0.0",
      "main": "index.js"
    }
    ```
    `apps/web/package.json`:
    ```json
    {
      "name": "@my-monorepo/web",
      "version": "1.0.0",
      "dependencies": {
        "@my-monorepo/utils": "^1.0.0" // 直接引用 Monorepo 内的包
      }
    }
    ```
3.  **在根目录运行 `yarn install`**:
    Yarn 会自动检测 `workspaces` 配置，将所有子包的依赖提升到根目录的 `node_modules`，并为子包创建软链接指向根目录的依赖。

**优势**:
*   **简化依赖管理**: 避免了不同项目间的依赖版本不一致问题。
*   **提高开发效率**: 本地引用无需发布，代码共享更便捷。
*   **统一的代码规范和工具**: 方便在整个 Monorepo 中应用 ESlint、Prettier 等工具。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 Monorepo 只是把所有代码放在一个文件夹里。
    *   **纠正**: Monorepo 不仅仅是物理上的集中，更重要的是需要有工具（如 Lerna, Yarn/pnpm Workspaces）来管理包之间的依赖、构建和发布。
*   **误区**: 盲目采用 Monorepo，认为它适用于所有场景。
    *   **纠正**: Monorepo 在项目数量较多、代码复用性高、团队协作紧密时优势明显。对于独立性强、团队分散的项目，可能维护成本更高。
*   **误区**: 不理解 `private: true` 的作用。
    *   **纠正**: 根目录的 `private: true` 字段是为了防止整个 Monorepo 根目录被误发布到 npm 上。
*   **误区**: 认为所有依赖都会被提升到根目录。
    *   **纠正**: 大部分依赖会被提升（hoisting），但如果不同子包对同一个依赖有不兼容的版本要求，该依赖可能会在子包内部单独安装。这需要包管理器智能处理。

</details>

## 3. 在使用 Monorepo 管理项目过程中，有没有遇到不同包之间依赖冲突的情况？是如何解决的？ {#question-subjective-2a3db74fd776}

### 题目要点

- Monorepo 依赖管理机制：理解依赖提升 (hoisting) 和非提升 (non-hoisting) 的场景。
- 依赖冲突产生的原因：版本不一致、peerDependencies 未满足等。
- 冲突解决策略：强制版本、nohoist、别名、包管理器特性等。
- 对包管理器（Yarn/pnpm/npm）依赖解析原理的理解。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
在 Monorepo 中，依赖冲突通常发生在不同的子包依赖了相同库的不同版本时。包管理器（如 Yarn Workspaces, pnpm Workspaces, Lerna）通常会尝试将共同的依赖版本"提升"（hoisting）到 Monorepo 的根目录，以减少磁盘占用和安装时间。然而，当某个子包需要一个特定版本的依赖，而这个版本与根目录提升的版本不兼容时，或者与另一个子包需要的版本冲突时，就会产生依赖冲突。

**冲突产生的原因主要包括**:
*   **版本不兼容**: 两个子包 A 和 B 都依赖了 `library-x`，但 A 依赖 `library-x@1.0.0`，B 依赖 `library-x@2.0.0`，且这两个版本之间存在不兼容的 API 变化。
*   **幽灵依赖 (Phantom Dependencies)**: 子包没有在其 `package.json` 中声明某个依赖，但由于根目录提升了其他包的依赖，该子包能够"意外地"使用到这个依赖。当这个提升的依赖版本发生变化或被移除时，就可能导致问题。
*   **`peerDependencies` 未满足**: 当一个库声明了 `peerDependencies`，而使用它的子包没有满足这些对等依赖的版本要求时。

##### 1.2 核心用法 + 示例代码
解决 Monorepo 依赖冲突的策略取决于冲突的具体性质和所使用的包管理器。

**常见解决策略**:

1.  **统一依赖版本**:
    这是最推荐和直接的方法。通过将所有子包对某个共享依赖的版本统一到 Monorepo 的根 `package.json` 中，或者通过自动化工具（如 `lerna fix`、`yarn upgrade-interactive`）来协调版本，确保所有子包使用兼容的版本。
    *   **场景**: 当不同子包只是因为历史原因使用了稍微不同的兼容版本时。
    *   **优势**: 根本上消除冲突，简化依赖树。

2.  **禁用依赖提升 (Nohoist)**:
    某些包管理器允许你配置特定的包或依赖不进行提升，而是将它们安装在子包自己的 `node_modules` 目录下。
    *   **场景**:
        *   当某个依赖在不同子包中确实需要使用不兼容的多个版本时。
        *   某些特定的工具或库在被提升后无法正常工作（例如，一些前端框架或构建工具可能对模块解析路径有严格要求）。
    *   **示例（Yarn Workspaces）**: 在根目录 `package.json` 的 `nohoist` 字段中指定。
        ```json
        {
          "name": "my-monorepo",
          "workspaces": {
            "packages": ["packages/*"],
            "nohoist": ["**/react", "**/react/**"] // 阻止 react 及其相关依赖被提升
          }
        }
        ```
    *   **注意**: 禁用提升会增加安装时间，并可能导致磁盘占用增加。

3.  **使用 `resolutions` (Yarn) / `overrides` (npm 8+)**:
    这些字段允许你强制所有子包使用特定版本的某个依赖，即使它们的 `package.json` 中声明了不同的版本。
    *   **场景**: 当你希望在整个 Monorepo 层面强制一个特定版本的依赖，以解决不兼容问题或安全漏洞时。
    *   **示例（Yarn `resolutions`）**:
        ```json
        // root package.json
        {
          "name": "my-monorepo",
          "version": "1.0.0",
          "private": true,
          "workspaces": ["packages/*"],
          "resolutions": {
            "lodash": "4.17.21" // 强制所有 lodash 依赖都使用 4.17.21
          }
        }
        ```
    *   **注意**: 强制版本可能会引入新的不兼容问题，需要谨慎使用。

4.  **调整 `peerDependencies`**:
    如果冲突是由 `peerDependencies` 引起的，确保子包的 `dependencies` 或 `devDependencies` 中包含了满足 `peerDependencies` 要求的依赖。
    *   **场景**: 在使用一些插件或框架（如 Babel 插件、Webpack loaders）时，它们通常要求宿主环境提供特定版本的依赖。

5.  **升级/降级依赖**:
    分析冲突原因，如果可能，统一升级或降级相关依赖到兼容版本。

6.  **包管理器特定的调试工具**:
    利用包管理器提供的诊断命令（如 `yarn why <package-name>`、`npm ls <package-name>`、`pnpm why <package-name>`）来查看依赖树，找出冲突的根源。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 Monorepo 自动解决了所有依赖问题。
    *   **纠正**: Monorepo 工具提供了更好的依赖管理能力，但并不能完全消除冲突，尤其是在不兼容的版本之间。开发者仍需主动管理和协调依赖。
*   **误区**: 滥用 `nohoist` 或 `resolutions`。
    *   **纠正**: 这些是解决特定冲突的"重型武器"，过度使用会导致依赖树复杂、安装缓慢或引入新的隐性问题。应优先考虑统一版本。
*   **面试陷阱**: 不了解不同包管理器在依赖解析和冲突处理上的细微差别。
    *   **纠正**: 例如，pnpm 默认采用非提升（non-hoisting）策略，它通过硬链接（hard links）和符号链接（symlinks）来管理依赖，这在一定程度上减少了幽灵依赖和依赖提升带来的冲突，因为它创建了一个严格且扁平的 `node_modules` 结构。了解这些差异能体现对工具更深层次的理解。

</details>

## 4. Vuex 替换为 Pinia 怎么实现，一开始是 Vue2 写的吗？ {#question-subjective-ff2df4889e1d}

### 题目要点

- Vuex 和 Pinia 的基本概念、作用和差异。
- Vue2 和 Vue3 的兼容性问题，尤其是在状态管理库迁移时的考量。
- Pinia 的主要特性（如 Options API/Composition API 兼容性、TypeScript 支持、模块化）。
- 实际迁移的步骤和注意事项。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
Vuex 和 Pinia 都是 Vue.js 生态中的状态管理库，用于集中管理应用程序中所有组件的共享状态。它们的出现是为了解决组件间状态共享和管理复杂性带来的问题，尤其是在大型应用中。

**Vuex** 是 Vue 2 的官方推荐状态管理库，其核心概念包括 State、Getter、Mutation、Action 和 Module。它设计了一套严格的单向数据流规则，确保状态的可预测性。

**Pinia** 是 Vue 3 的推荐状态管理库，它设计得更轻量、更简单，并且对 TypeScript 有原生支持。Pinia 的设计理念受到了 Vuex 5（未发布）的启发，旨在改进 Vuex 在类型推断、模块化和使用体验上的一些痛点。

**迁移的必要性**:
*   **Vue 3 兼容性**: Vuex 4 是为 Vue 3 设计的，但 Vuex 3 (用于 Vue 2) 在 Vue 3 中使用时可能存在一些限制或不便。Pinia 原生支持 Vue 3 的 Composition API 和 TypeScript，能更好地融入 Vue 3 生态。
*   **开发体验**: Pinia 提供了更友好的 API，更少的样板代码，以及更好的 TypeScript 类型推断，这可以显著提升开发效率和代码质量。
*   **模块化和代码拆分**: Pinia 的 store 默认就是模块化的，且支持动态注册，更便于代码拆分和按需加载。

**关于"一开始是 Vue2 写的吗？"**:
如果项目一开始是 Vue 2 写的，那么很可能使用的是 Vuex 3。在这种情况下，要替换为 Pinia，通常需要先将项目升级到 Vue 3（或者至少确保 Vue 2 环境下 Vuex 4 兼容，但这不常见且不推荐），然后进行状态管理库的迁移。直接在 Vue 2 项目中替换 Vuex 3 为 Pinia 可能会遇到兼容性问题，因为 Pinia 主要面向 Vue 3。不过，Pinia 官方宣称也支持 Vue 2.7+ 版本，但最佳实践通常是在 Vue 3 环境下使用。

##### 1.2 核心用法 + 示例代码

**迁移步骤**:

1.  **项目升级到 Vue 3 (如果尚未升级)**:
    如果项目是 Vue 2，且目标是使用 Pinia 的最佳实践，通常第一步是将项目核心升级到 Vue 3。这可能涉及构建工具、路由、UI 库等方面的迁移。

2.  **安装 Pinia**:
    ```bash
    npm install pinia
    # 或者 yarn add pinia
    ```

3.  **创建 Pinia 实例并挂载到 Vue 应用**:
    *   **Vue 3**:
        ```javascript
        // main.js
        import { createApp } from 'vue'
        import { createPinia } from 'pinia'
        import App from './App.vue'

        const app = createApp(App)
        const pinia = createPinia()

        app.use(pinia)
        app.mount('#app')
        ```
    *   **Vue 2.7+ (需要 `@vue/composition-api` 插件)**:
        ```javascript
        // main.js
        import Vue from 'vue'
        import VueCompositionAPI from '@vue/composition-api'
        import { createPinia, PiniaVuePlugin } from 'pinia'
        import App from './App.vue'

        Vue.use(VueCompositionAPI) // 必须在 Pinia 之前安装
        Vue.use(PiniaVuePlugin)

        const pinia = createPinia()

        new Vue({
          el: '#app',
          pinia, // 将 pinia 实例注入到 Vue 根实例
          render: h => h(App)
        })
        ```

4.  **将 Vuex Store 迁移到 Pinia Store**:
    **Vuex 示例**:
    ```javascript
    // store/index.js (Vuex)
    import Vue from 'vue';
    import Vuex from 'vuex';

    Vue.use(Vuex);

    export default new Vuex.Store({
      state: {
        count: 0
      },
      mutations: {
        increment(state) {
          state.count++;
        }
      },
      actions: {
        asyncIncrement({ commit }) {
          setTimeout(() => {
            commit('increment');
          }, 1000);
        }
      },
      getters: {
        doubleCount: state => state.count * 2
      }
    });
    ```

    **Pinia 迁移**:
    Pinia 使用 `defineStore` 定义 store，它支持两种风格：Options API 风格和 Composition API 风格。

    *   **Options API 风格 (更接近 Vuex)**:
        ```javascript
        // stores/counter.js (Pinia)
        import { defineStore } from 'pinia'

        export const useCounterStore = defineStore('counter', {
          state: () => ({
            count: 0
          }),
          getters: {
            doubleCount: (state) => state.count * 2,
            // 也可以访问其他 getters
            // doubleAndAddOne(): number {
            //   return this.doubleCount + 1
            // }
          },
          actions: {
            increment() {
              this.count++
            },
            async asyncIncrement() {
              await new Promise(resolve => setTimeout(resolve, 1000))
              this.count++
            }
          }
        })
        ```

    *   **Composition API 风格 (更灵活，推荐用于新项目)**:
        ```javascript
        // stores/counter.js (Pinia with Composition API)
        import { defineStore } from 'pinia'
        import { ref, computed } from 'vue'

        export const useCounterStore = defineStore('counter', () => {
          const count = ref(0)
          const doubleCount = computed(() => count.value * 2)

          function increment() {
            count.value++
          }

          async function asyncIncrement() {
            await new Promise(resolve => setTimeout(resolve, 1000))
            count.value++
          }

          return { count, doubleCount, increment, asyncIncrement }
        })
        ```

5.  **在组件中使用 Pinia Store**:
    *   **Vue 3 (Composition API)**:
        ```vue
        <template>
          <div>
            <p>Count: {{ counterStore.count }}</p>
            <p>Double Count: {{ counterStore.doubleCount }}</p>
            <button @click="counterStore.increment">Increment</button>
            <button @click="counterStore.asyncIncrement">Async Increment</button>
          </div>
        </template>

        &lt;script setup&gt;
        import { useCounterStore } from '../stores/counter'

        const counterStore = useCounterStore()
        &lt;/script&gt;
        ```
    *   **Vue 3 (Options API)**:
        ```vue
        <template>
          <div>
            <p>Count: {{ count }}</p>
            <p>Double Count: {{ doubleCount }}</p>
            <button @click="increment">Increment</button>
            <button @click="asyncIncrement">Async Increment</button>
          </div>
        </template>

        &lt;script&gt;
        import { mapState, mapActions } from 'pinia'
        import { useCounterStore } from '../stores/counter'

        export default {
          computed: {
            ...mapState(useCounterStore, ['count', 'doubleCount'])
          },
          methods: {
            ...mapActions(useCounterStore, ['increment', 'asyncIncrement'])
          }
        }
        &lt;/script&gt;
        ```

**优势**:
*   **更好的 TypeScript 支持**: Pinia 的设计从一开始就考虑了 TypeScript，提供了出色的类型推断，减少了手动类型声明的工作量，降低了运行时错误。
*   **更简单的 API**: 移除了 Mutations（直接修改 state），Action 可以直接修改 state，Getter 也可以直接访问其他 Getter，使得概念更少，更容易理解和使用。
*   **模块化设计**: 每个 store 都是独立的模块，无需嵌套，易于组织和维护，也方便按需加载。
*   **更小的体积**: Pinia 比 Vuex 更轻量。
*   **无需命名空间**: Pinia 默认就是模块化的，不再需要 `namespaced: true` 配置，通过导入 store 即可使用。
*   **Vue Devtools 集成**: 提供了出色的 Devtools 支持，可以方便地查看状态、追踪变化、进行时间旅行调试。

##### 1.3 常见误区或面试陷阱
*   **误区**: 将 Vuex 的 `mutations` 概念直接套用到 Pinia。
    *   **纠正**: Pinia 中没有 Mutations，直接在 Actions 或组件中修改 State 即可。Pinia 内部会自动追踪这些修改。
*   **误区**: 不理解 Pinia 中 State 的响应式特性。
    *   **纠正**: Pinia 的 State 也是响应式的，可以直接修改，无需像 Vuex 那样通过 Mutations。
*   **面试陷阱**: 在 Vue 2 项目中直接安装 Pinia 而不考虑兼容性。
    *   **纠正**: 虽然 Pinia 2.7+ 支持 Vue 2，但需要安装 `@vue/composition-api` 插件，并且这通常不是最佳实践，迁移到 Vue 3 是更理想的方案。
*   **面试陷阱**: 混淆 `storeToRefs` 和直接解构 store。
    *   **纠正**: 直接解构 Pinia store 会失去响应式。例如 `const { count } = useCounterStore()`。如果需要保持响应式，需要使用 `storeToRefs` 来解构 state 和 getter：`const { count } = storeToRefs(useCounterStore())`。而 actions 可以直接解构：`const { increment } = useCounterStore()`。

</details>

## 5. Pinia 提供了哪些 Vuex 不具备的关键特性或功能？ {#question-subjective-d913b4040efe}

### 题目要点

- Pinia 相较于 Vuex 的核心优势和新增特性。
- 对 Pinia 的设计哲学（轻量、简单、类型友好）的理解。
- Pinia 对 Vue 3 Composition API 和 TypeScript 的原生支持。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
Pinia 是 Vue.js 生态系统中一个新的状态管理库，旨在解决 Vuex 在大规模应用和 TypeScript 支持方面的一些痛点。它吸收了 Vuex 5（草案）的一些设计思想，并在此基础上进行了简化和优化。与 Vuex 相比，Pinia 更轻量、API 更直观，并提供了更好的类型推断。

Vuex 强制使用 `Mutations` 来修改 `State`，并通过 `Actions` 来处理异步逻辑和提交 `Mutations`，这种模式在一定程度上保证了状态变更的可追踪性。然而，这增加了额外的概念和样板代码，尤其是在小型应用中可能显得繁琐。

Pinia 的设计目标是提供一个更现代化、更符合 Vue 3 Composition API 风格的状态管理方案，同时原生支持 TypeScript，从而提升开发体验和代码质量。

##### 1.2 核心用法 + 示例代码
Pinia 提供了许多 Vuex 不具备或优化得更好的关键特性和功能：

1.  **无 Mutations**:
    *   **特性**: Pinia 移除了 Vuex 中的 `Mutations` 概念。可以直接在 `Actions` 中修改 `State`，甚至在组件中直接修改（但通常推荐通过 `Actions`）。这大大简化了状态管理的流程，减少了样板代码。
    *   **优势**: 概念更少，更容易理解和使用，降低了心智负担。开发者可以直接关注业务逻辑，而不需要在 `Actions` 和 `Mutations` 之间来回切换。
    *   **示例**:
        ```javascript
        // Pinia store
        export const useCounterStore = defineStore('counter', {
          state: () => ({ count: 0 }),
          actions: {
            increment() {
              this.count++ // 直接修改 state
            },
            decrementBy(amount) {
              this.count -= amount
            }
          }
        })
        ```

2.  **更好的 TypeScript 支持 (原生)**:
    *   **特性**: Pinia 对 TypeScript 的支持是开箱即用的，无需额外的配置或复杂的类型推导。无论是 `State`、`Getters` 还是 `Actions`，都能获得准确的类型提示和自动补全。
    *   **优势**: 提升了大型项目中的代码可维护性、可读性和协作效率，尤其对于强类型偏好的开发者来说，是巨大的福音。
    *   **示例**:
        ```typescript
        // Pinia store with TypeScript
        import { defineStore } from 'pinia'

        interface CounterState {
          count: number
          name: string
        }

        export const useCounterStore = defineStore('counter', {
          state: (): CounterState => ({
            count: 0,
            name: 'Eduardo'
          }),
          getters: {
            doubleCount: (state): number => state.count * 2,
            // 类型推断：doubleCount 自动推断为 number
            // this 关键字在 Options API 风格中也能得到良好类型推断
            getSum: function(this: CounterState): number {
              return this.count + 10;
            }
          },
          actions: {
            increment(value: number = 1) {
              this.count += value // `value` 参数有类型提示
            },
            // 异步 Action 也有良好类型推断
            async fetchSomething(): Promise<void> {
              // ...
            }
          }
        })
        ```
3.  **模块化设计 (无需命名空间)**:
    *   **特性**: Pinia 的 `Store` 默认就是模块化的。每个 `Store` 都是独立的，通过 `defineStore` 定义并导出，在需要的地方直接导入使用，无需像 Vuex 那样通过 `namespaced: true` 配置命名空间。
    *   **优势**: 更清晰的模块组织方式，避免了命名冲突，也方便了代码拆分和按需加载。在大型应用中，无需层层嵌套的模块结构，维护成本更低。
    *   **示例**:
        ```javascript
        // stores/user.js
        export const useUserStore = defineStore('user', { /* ... */ })

        // stores/product.js
        export const useProductStore = defineStore('product', { /* ... */ })

        // In a component
        import { useUserStore } from './stores/user'
        import { useProductStore } from './stores/product'
        const userStore = useUserStore()
        const productStore = useProductStore()
        ```

4.  **更小的体积**: Pinia 的核心代码比 Vuex 更精简，因此打包后的体积更小，有助于优化应用性能。

5.  **Vue Devtools 集成**: Pinia 提供了出色的 Vue Devtools 集成，可以方便地查看状态、追踪变化、进行时间旅行调试，并且 `Actions` 会以清晰的树形结构显示，调试体验更佳。

6.  **`storeToRefs` 辅助函数**: 在 Composition API 中，直接解构 `store` 会失去响应式。Pinia 提供了 `storeToRefs` 辅助函数，可以方便地将 `state` 和 `getters` 解构出来并保持响应式。
    *   **示例**:
        ```javascript
        import { storeToRefs } from 'pinia'
        import { useCounterStore } from '../stores/counter'

        const counterStore = useCounterStore()
        const { count, doubleCount } = storeToRefs(counterStore) // 保持响应式
        const { increment } = counterStore // actions 直接解构不会失去响应式
        ```

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 Pinia 取消了 `Mutations` 意味着可以随意修改状态。
    *   **纠正**: 虽然 Pinia 移除了 `Mutations` 这个概念，但仍然推荐在 `Actions` 中封装状态修改逻辑，以便更好地追踪和管理状态变化。直接在组件中修改 `State` 虽然可行，但在复杂场景下可能导致状态来源不清晰。
*   **误区**: 不理解 Pinia 的模块化与 Vuex 命名空间的根本区别。
    *   **纠正**: Pinia 的模块化是基于 ES Module 的导入导出机制，每个 `store` 都是一个独立的模块，而 Vuex 的命名空间是在一个大的 `Store` 实例内部对模块进行组织。Pinia 的方式更符合现代 JavaScript 模块开发的习惯。
*   **面试陷阱**: 在 Vue 3 Composition API 中直接解构 Pinia 的 `State` 或 `Getters` 而没有使用 `storeToRefs`。
    *   **纠正**: 这是一个常见的错误，会导致解构出的响应式数据丢失。务必强调 `storeToRefs` 的作用。

</details>

## 6. 在使用过程中，你觉得 Pinia 哪些方面比 Vuex 更具优势？ {#question-subjective-c246a696de7e}

### 题目要点

- 结合实际开发经验，阐述 Pinia 在开发效率、代码可维护性、类型安全和调试体验等方面的具体优势。
- 能够对比 Vuex 的痛点，说明 Pinia 如何解决这些问题。
- 对 Pinia 社区生态和未来发展趋势的认知。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
在实际开发中，我发现 Pinia 相较于 Vuex 在多个方面提供了显著的优势，这些优势不仅仅体现在理论上，更深入地影响了日常的开发效率、代码质量和团队协作体验。Pinia 的设计理念更贴近现代前端开发的需求，尤其是在 Vue 3 和 TypeScript 的背景下。

Vuex 固有的 `Mutations` 概念，虽然在严格的状态管理方面有其优点，但在实践中常常导致代码冗余和心智负担，尤其对于简单的状态变更。而其对 TypeScript 的支持相对滞后，需要额外的类型声明和工具来弥补，使得在大型 TypeScript 项目中集成 Vuex 变得复杂。

Pinia 的优势正是基于解决这些痛点而设计的，它通过简化 API、原生支持 TypeScript 和优化模块化机制，提供了一种更高效、更愉悦的状态管理体验。

##### 1.2 核心用法 + 示例代码

以下是我在使用过程中，觉得 Pinia 比 Vuex 更具优势的几个方面：

1.  **极简的 API 设计，减少样板代码，提高开发效率**:
    *   **优势**: Pinia 移除了 `Mutations`，使得状态修改可以直接在 `Actions` 中进行，减少了需要编写和维护的代码量。对于简单的数据读写，可以直接操作 `state`，使得代码更加简洁直观。
    *   **实际体验**: 在开发过程中，我不再需要为每个状态变更定义一个 `Mutation`，这使得编写新功能或修改现有功能时，可以更快地实现业务逻辑，减少了"胶水代码"。
    *   **举例**: 比如实现一个简单的计数器，在 Vuex 中可能需要 `INCREMENT` 这个 `Mutation` 和 `increment` 这个 `Action`，而在 Pinia 中，一个 `increment` `Action` 就可以完成，甚至可以直接在组件中修改 `state.count++`。

2.  **原生且完善的 TypeScript 支持，提升代码质量和可维护性**:
    *   **优势**: Pinia 对 TypeScript 的支持是开箱即用的，无需额外的配置或复杂的类型推导。无论 `State`、`Getters` 还是 `Actions`，都能获得准确的类型提示和自动补全。
    *   **实际体验**: 在大型团队协作中，TypeScript 的强类型检查能够有效避免类型相关的运行时错误，尤其是在 refactoring (重构) 代码时，IDE 会立即指出类型不匹配的地方，大大降低了出错率。这使得代码更健壮，更易于理解和维护。
    *   **举例**: 当我在组件中使用 `store` 时，可以直接通过点语法访问 `state` 和 `getters`，并且能够得到精确的类型提示，这让开发过程更加顺畅和自信。

3.  **模块化更自然，无需命名空间，管理更清晰**:
    *   **优势**: Pinia 的每个 `Store` 都是一个独立的模块，通过 `defineStore` 定义，并像普通 JavaScript 模块一样导入和导出。这种设计避免了 Vuex 中通过 `namespaced: true` 来划分模块可能带来的理解成本和模块嵌套过深的问题。
    *   **实际体验**: 在一个包含几十个 `Store` 的大型应用中，Pinia 的扁平化模块结构使得 `Store` 的查找和管理变得非常容易。我可以清晰地知道每个 `Store` 负责什么，而无需担心命名冲突或复杂的路径引用。
    *   **举例**: 之前在 Vuex 中，如果要访问一个嵌套模块的 `getter`，可能需要 `this.$store.getters['moduleA/moduleB/someGetter']`，而在 Pinia 中，只需 `useModuleBStore().someGetter`，更简洁明了。

4.  **更好的 Vue Devtools 集成，调试体验更佳**:
    *   **优势**: Pinia 在 Vue Devtools 中提供了更友好的展示。`Actions` 的调用、`State` 的变化都清晰可见，并且可以进行时间旅行调试，方便追踪和回溯状态。
    *   **实际体验**: 在调试复杂的状态流时，Devtools 的清晰展示帮助我快速定位问题。尤其是在异步操作中，我可以清晰地看到 `Action` 的执行过程和每次状态变更的具体内容。

5.  **更小的体积和更好的性能**:
    *   **优势**: Pinia 比 Vuex 更轻量，打包后的体积更小，有助于提升应用的加载性能。它也利用了 Vue 3 的新特性，如 Proxy，在响应式方面表现更优。
    *   **实际体验**: 对于追求极致性能的项目，Pinia 提供了更好的基础。同时，由于其底层响应式原理的优化，在处理大量状态更新时，也能保持较好的性能。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 Pinia 是 Vuex 的简单替代，直接复制代码即可。
    *   **纠正**: 虽然 Pinia 旨在简化 Vuex 的使用，但其核心概念和 API 有所不同。尤其是在 `Mutations` 的移除和 `State` 直接修改方面，需要调整思维模式。不理解这些差异可能导致迁移时出现问题。
*   **误区**: 认为 Pinia 彻底抛弃了 Vuex 的所有优点。
    *   **纠正**: Pinia 借鉴了 Vuex 的优点，并在其基础上进行了改进，例如状态的集中管理、可预测的状态变更等核心思想仍然保留。它并非颠覆，而是进化。
*   **面试陷阱**: 仅仅罗列功能点，没有结合实际开发场景说明优势。
    *   **纠正**: 面试官更希望听到的是你如何通过 Pinia 解决实际问题，提升开发效率的经验，而不是单纯的功能列表。要结合具体的项目或场景来阐述其优势。

</details>

## 7. Vue2 和 Vue3 的区别 {#question-subjective-40176c9ff118}

### 题目要点

- 掌握 Vue 2 和 Vue 3 在核心概念、API、性能和设计哲学上的主要差异。
- 对 Vue 3 Composition API 和 Options API 的理解及适用场景。
- 对 Vue 3 响应式原理（Proxy）与 Vue 2（Object.defineProperty）的对比。
- 对 Vue 3 新特性（如 Fragment, Teleport, Suspense）的认知。
- Vue 3 在性能优化方面的改进。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
Vue 2 和 Vue 3 是 Vue.js 框架的两个主要版本，Vue 3 是 Vue 2 的一次重大升级，它在性能、开发体验和功能上都带来了显著的改进。虽然 Vue 3 保持了与 Vue 2 的大部分 API 兼容性，但也引入了许多新特性和底层优化，以适应现代前端开发的需求。

**核心升级驱动因素**:
*   **性能提升**: 提升渲染性能、打包体积和响应速度。
*   **更好的 TypeScript 支持**: 增强对 TypeScript 的原生支持，提供更好的类型推断。
*   **Composition API**: 解决 Options API 在大型组件中逻辑复用和代码组织的问题。
*   **新功能**: 引入 Teleport、Suspense、Fragment 等新功能，以应对更复杂的 UI 场景。
*   **可维护性**: 内部代码重构，使核心代码更易于维护和扩展。

##### 1.2 核心用法 + 示例代码

以下是 Vue 2 和 Vue 3 的主要区别：

1.  **响应式原理 (Reactive System)**:
    *   **Vue 2**: 基于 `Object.defineProperty()` 实现数据劫持。这种方式的局限性在于无法检测到对象属性的添加和删除，也无法直接监听数组的索引和长度变化（Vue 2 通过重写数组方法来解决）。
    *   **Vue 3**: 基于 ES6 的 `Proxy` 实现数据劫持。`Proxy` 可以劫持整个对象，能够完整地监听对象属性的添加、删除以及数组索引和长度的变化。这使得 Vue 3 的响应式系统更加强大和彻底。
    *   **优势**: `Proxy` 提供了更全面的响应式能力，解决了 Vue 2 中 `Object.defineProperty()` 的一些限制，使得 API 设计更简洁，且性能更好。

2.  **API 风格 (Composition API vs Options API)**:
    *   **Vue 2**: 主要使用 **Options API**。通过 `data`、`methods`、`computed`、`watch` 等选项来组织组件逻辑。在大型组件中，相关逻辑可能分散在不同的选项中，导致代码难以阅读和维护。
    *   **Vue 3**: 引入了 **Composition API** (组合式 API)。它允许开发者根据逻辑关注点来组织代码，将相关联的逻辑封装到可复用的函数中。Options API 在 Vue 3 中仍然支持，可以根据项目需求选择使用，或者与 Composition API 混合使用。
    *   **优势**: Composition API 解决了 Options API 在大型组件中逻辑复用和代码组织上的痛点，提高了代码的可读性和可维护性，特别适合复杂组件和大型项目。
    *   **示例 (Composition API)**:
        ```vue
        <template>
          <button @click="increment">Count: {{ count }}</button>
        </template>

        &lt;script setup&gt;
        import { ref, computed } from 'vue'

        const count = ref(0)
        const doubleCount = computed(() => count.value * 2)

        function increment() {
          count.value++
        }
        &lt;/script&gt;
        ```

3.  **性能优化 (Performance Improvements)**:
    *   **虚拟 DOM 重写**: Vue 3 对虚拟 DOM 进行了重写，采用了**静态提升 (Static Hoisting)** 和 **块树 (Block Tree)** 等优化策略。它能够识别出哪些部分是静态的，并在首次渲染后跳过这些部分的更新，只关注动态部分。这大大减少了不必要的比较和更新，提升了渲染性能。
    *   **Tree-shaking 支持**: Vue 3 核心包的模块化程度更高，支持更好的 Tree-shaking，这意味着最终打包文件中只会包含你实际使用的模块，从而显著减小了打包体积。
    *   **编译器优化**: 编译器在编译模板时能生成更高效的渲染函数代码。

4.  **新的内置组件和特性**:
    *   **Fragment (片段)**: Vue 3 支持组件返回多个根节点，无需像 Vue 2 那样必须有一个唯一的根节点。这使得编写更灵活的组件成为可能。
    *   **Teleport (传送门)**: 允许你将组件的内容渲染到 DOM 树中的不同位置，而无需改变组件在 Vue 组件树中的逻辑位置。这对于模态框、通知等场景非常有用。
    *   **Suspense (实验性)**: 允许组件等待异步操作完成（例如数据获取）后再进行渲染，并在等待期间显示一个 fallback 内容。这有助于改善用户体验。

5.  **生命周期钩子变化**:
    *   Vue 3 的生命周期钩子在 Composition API 中有对应的命名变化，例如 `beforeDestroy` 变为 `beforeUnmount`，`destroyed` 变为 `unmounted`。
    *   新的 `setup` 函数在组件创建时执行，替代了 `beforeCreate` 和 `created`。

6.  **`createApp` API (应用实例)**:
    *   **Vue 2**: 通过 `new Vue()` 创建应用实例，所有配置都是全局的。
    *   **Vue 3**: 引入 `createApp` 函数来创建应用实例。每个应用实例都有自己的独立作用域，允许在同一个页面上挂载多个独立的 Vue 应用，避免了全局污染。
    *   **优势**: 更好的模块化和隔离性，方便构建微前端应用或在多框架环境中集成 Vue。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 Vue 3 废弃了 Options API。
    *   **纠正**: Vue 3 仍然完全支持 Options API，并与 Composition API 可以混合使用。Composition API 是一种补充，旨在解决 Options API 在特定场景下的痛点。
*   **误区**: 混淆 `Object.defineProperty()` 和 `Proxy` 的原理和局限性。
    *   **纠正**: 强调 `Proxy` 是 ES6 新特性，它能够代理整个对象，从而解决了 `Object.defineProperty()` 的局限性，可以监听属性的添加、删除、数组索引/长度变化等所有操作。这是 Vue 3 采用 `Proxy` 的主要原因。
*   **面试陷阱**: 只知道新特性名称，但不知道其解决的问题或适用场景。
    *   **纠正**: 除了列举新特性，更重要的是阐述这些特性解决了哪些实际开发问题，以及它们的应用场景。

</details>

## 8. Object.defineProperty() 具体怎么进行数据劫持？ {#question-subjective-444e16cb5d2f}

### 题目要点

- 理解 `Object.defineProperty()` 的基本用法和功能。
- 掌握数据劫持的核心概念：`getter` 和 `setter`。
- 理解 Vue 2 响应式原理中 `Object.defineProperty()` 的应用方式和局限性。
- 能够通过代码示例说明其工作原理。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
`Object.defineProperty()` 是 JavaScript ES5 中提供的一个方法，允许我们精确地添加或修改对象上的属性。它是 Vue 2 实现数据响应式（即当数据发生变化时，视图能够自动更新）的核心机制。通过这个方法，Vue 2 能够"劫持"对象的属性，即在属性被访问或修改时，执行特定的逻辑。

**数据劫持的核心概念是**:
*   **`getter` (读取器)**: 当我们尝试读取对象的某个属性时，`getter` 函数会被调用。Vue 利用 `getter` 来收集依赖（即哪些组件或 watcher 使用了当前属性）。
*   **`setter` (设置器)**: 当我们尝试修改对象的某个属性时，`setter` 函数会被调用。Vue 利用 `setter` 来通知之前收集到的依赖，告诉它们相关数据已发生变化，从而触发视图的重新渲染。

**工作机制**:
1.  **遍历数据对象**: Vue 在初始化时，会递归遍历 `data` 对象中的所有属性。
2.  **为每个属性添加 `getter`/`setter`**: 对于每个属性，Vue 会使用 `Object.defineProperty()` 为其定义 `getter` 和 `setter`。
3.  **依赖收集**: 当组件的渲染函数（或 watcher）访问某个响应式数据时，该属性的 `getter` 会被触发。此时，Vue 会将当前的渲染 watcher 添加到该属性的"依赖列表"中。这个"依赖列表"通常由一个 `Dep` (Dependency) 类来管理。
4.  **派发更新**: 当响应式数据发生变化时，该属性的 `setter` 会被触发。`setter` 会通知其"依赖列表"中所有的 watcher，这些 watcher 收到通知后会触发组件的重新渲染或执行相应的回调。

##### 1.2 核心用法 + 示例代码

下面是一个简单的示例，展示 `Object.defineProperty()` 如何进行数据劫持：

```javascript
function defineReactive(obj, key, val) {
  // 递归处理嵌套对象，确保所有子属性也是响应式的
  if (typeof val === 'object' && val !== null) {
    observe(val);
  }

  let dep = []; // 用于存储依赖（简化的依赖列表）

  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举
    configurable: true, // 可配置
    get() {
      console.log(`你访问了属性 ${key}，值为 ${val}`);
      // 在这里进行依赖收集，例如将当前的 watcher 添加到 dep 数组中
      // dep.push(currentWatcher);
      return val;
    },
    set(newVal) {
      // 如果新值和旧值相同，则不进行更新
      if (newVal === val) {
        return;
      }
      console.log(`你设置了属性 ${key}，旧值为 ${val}，新值为 ${newVal}`);
      val = newVal;
      // 如果新值是对象，需要对其进行响应式处理
      if (typeof newVal === 'object' && newVal !== null) {
        observe(newVal);
      }
      // 在这里通知依赖进行更新，例如遍历 dep 数组执行 watcher 的回调
      // dep.forEach(watcher => watcher.update());
    }
  });
}

function observe(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key]);
  });
  return data;
}

// 示例使用
let myData = {
  name: 'Alice',
  age: 30,
  address: {
    city: 'New York',
    zip: '10001'
  },
  hobbies: ['reading', 'coding']
};

observe(myData);

console.log(myData.name); // 访问 name，触发 getter
myData.age = 31; // 修改 age，触发 setter
console.log(myData.age); // 访问 age，触发 getter

// 注意：以下操作在 Vue 2 中无法被 Object.defineProperty 监听
myData.gender = 'female'; // 新增属性，无法触发响应式
console.log(myData.gender);

delete myData.address.zip; // 删除属性，无法触发响应式

// 对于数组，修改索引和长度也无法直接监听
myData.hobbies[0] = 'gaming'; // 无法直接监听
myData.hobbies.length = 1; // 无法直接监听
```

**该技术方案解决了什么问题**:
*   **数据变化自动更新视图**: 最核心的问题是实现了数据与视图的自动化同步，极大地简化了前端开发中手动操作 DOM 的繁琐工作。
*   **可预测的状态管理**: 通过 `getter`/`setter` 的劫持，可以精确地追踪到数据的读写操作，为后续的依赖收集和派发更新提供了基础。

**相比其他方案的优势**:
*   **侵入性相对较低**: 相较于脏检查（如 AngularJS 1.x），`Object.defineProperty` 只需要在初始化时对数据进行一次处理，运行时性能开销相对较小。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 `Object.defineProperty()` 可以检测到对象属性的添加和删除。
    *   **纠正**: 这是 `Object.defineProperty()` 的主要局限性。它只能监听对象上已存在的属性的读写，对于新添加的属性或删除的属性，它无法直接感知。Vue 2 中需要使用 `Vue.set` 或 `this.$set` 来解决新增属性的响应式问题，以及通过数组变异方法（如 `push`, `splice` 等）来解决数组的响应式问题。
*   **误区**: 不理解 `getter` 和 `setter` 的作用。
    *   **纠正**: 明确 `getter` 用于依赖收集，`setter` 用于派发更新，这是响应式系统的两个核心环节。
*   **面试陷阱**: 将 `Object.defineProperty()` 与 Vue 3 的 `Proxy` 混淆。
    *   **纠正**: 强调 `Proxy` 是 ES6 新特性，它能够代理整个对象，从而解决了 `Object.defineProperty()` 的局限性，可以监听属性的添加、删除、数组索引/长度变化等所有操作。这是 Vue 3 采用 `Proxy` 的主要原因。
*   **误区**: 认为 `Object.defineProperty()` 在处理深层嵌套对象时没有性能问题。
    *   **纠正**: `Object.defineProperty()` 在初始化时需要递归遍历整个数据对象并对其所有属性进行劫持，对于非常深或非常大的对象，这可能会导致一定的性能开销。这也是 Vue 3 采用 `Proxy` 的一个优势，因为 `Proxy` 是惰性劫持的，只有当属性被访问时才会进行递归代理。

</details>

## 9. 对 React 有了解吗？ {#question-subjective-f105acb933f5}

### 题目要点

- React 的核心概念：组件化、JSX、虚拟 DOM、单向数据流。
- 对 React 生态的认知：React Router、Redux/Context API、Hooks 等。
- React 与 Vue 的基本对比，说明对两者差异的理解。
- 能够阐述 React 的设计哲学和优势。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
我对 React 有比较深入的了解和实践经验。React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 及其社区维护。它以声明式、组件化的方式构建 UI，旨在解决大型、复杂应用中视图层的开发效率和可维护性问题。

**核心设计理念包括**:
*   **组件化 (Component-Based)**: React 将 UI 拆分成独立、可复用的组件。每个组件只关注自身的状态和渲染逻辑，这使得 UI 的构建更加模块化和易于管理。
*   **声明式 (Declarative)**: 开发者只需描述 UI 的最终状态，React 会负责处理 DOM 的实际操作，从而简化了 UI 的开发。当状态改变时，React 会自动更新 UI，而不是手动操作 DOM。
*   **虚拟 DOM (Virtual DOM)**: React 在内存中维护一个轻量级的 JavaScript 对象树，它与真实的 DOM 结构一一对应。当状态发生变化时，React 会先比较新旧虚拟 DOM 树的差异 (Diff 算法)，然后将最小的变更批量更新到真实 DOM 上，从而减少直接操作真实 DOM 的开销，提高性能。
*   **单向数据流 (Unidirectional Data Flow)**: 数据从父组件流向子组件（通过 props），状态的改变通常通过事件回调函数或状态管理库（如 Redux、Context API）从上层传递下去。这种模式使得数据流清晰可追踪，降低了程序复杂性。

##### 1.2 核心用法 + 示例代码

React 的核心是组件，组件可以通过函数组件或类组件的方式定义。现代 React 开发更推荐使用函数组件和 Hooks。

**基本使用示例 (函数组件和 State Hook)**:

```javascript
import React, { useState } from 'react';

function Counter() {
  // 使用 useState Hook 声明一个 state 变量 count，初始值为 0
  const [count, setCount] = useState(0);

  // 处理点击事件，更新 count
  const increment = () => {
    setCount(count + 1);
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

**场景应用**:
*   **构建交互式 UI**: 无论是简单的按钮点击还是复杂的数据可视化，React 的声明式和组件化特性都能高效构建。
*   **SPA (单页应用)**: 配合路由库 (如 React Router) 构建复杂的单页应用，提供流畅的用户体验。
*   **SSR (服务端渲染)**: 配合 Next.js 等框架实现服务端渲染，优化首屏加载性能和 SEO。
*   **移动应用开发**: 配合 React Native 开发跨平台的原生移动应用。

**相比 Vue 的优势 (我个人理解)**:
*   **更彻底的函数式编程思想**: React 更推崇函数式编程范式，尤其是在 Hooks 出现后，使得组件逻辑更清晰、可测试性更高。
*   **更大的生态系统和社区支持**: 虽然 Vue 生态发展迅速，但 React 作为最早出现的现代前端框架之一，拥有庞大且成熟的生态系统，遇到问题更容易找到解决方案和丰富的第三方库。
*   **更灵活的自由度**: React 提供了更底层的控制权，开发者可以根据项目需求选择不同的状态管理、路由、UI 组件库等，灵活性更高。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 React 性能一定比 Vue 好。
    *   **纠正**: 性能优化是一个复杂的话题，不能简单地比较。React 和 Vue 都使用了虚拟 DOM 和 Diff 算法，并在各自的内部进行了大量优化。最终性能取决于具体的应用实现和优化策略。React 在某些场景下可能需要开发者手动优化 (如 `useMemo`, `useCallback`, `React.memo`) 来达到最佳性能。
*   **误区**: 将 JSX 等同于 HTML 模板。
    *   **纠正**: JSX 是 JavaScript 的语法扩展，它允许在 JavaScript 代码中编写类似 HTML 的结构，但本质上是 JavaScript 对象，最终会被编译成 `React.createElement()` 调用。它比纯字符串模板更具表现力和灵活性。
*   **面试陷阱**: 对 Hooks 的理解停留在表面，不清楚其解决的问题和使用规则。
    *   **纠正**: 强调 Hooks 解决了类组件的痛点（如逻辑复用、`this` 指向问题），以及其使用规则（如只能在函数组件或自定义 Hook 中调用，不能在循环、条件或嵌套函数中调用）。
*   **误区**: 认为 React 强制使用 Redux 等状态管理库。
    *   **纠正**: React 本身只关注视图层，状态管理可以有多种选择，包括组件内部 `useState`、Context API、Redux、MobX、Recoil 等。Redux 只是其中一种非常流行的选择。

</details>

## 10. 如果让你用 React 实现一个类似 Vue 的组件，你会如何着手？ {#question-subjective-0442407e7941}

### 题目要点

- 对 Vue 和 React 核心特性的深刻理解和对比（数据绑定、模板/JSX、组件通信、生命周期）。
- 能够将 Vue 的特定模式（如 `v-model` 双向绑定、计算属性、侦听器）映射到 React 的实现方式。
- 掌握 React Hooks 的熟练运用，解决 Vue 特性在 React 中的实现。
- 具备跨框架思维，能够灵活运用不同框架的设计理念。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
要用 React 实现一个类似 Vue 的组件，核心在于理解 Vue 和 React 在设计哲学和实现机制上的差异，并找到在 React 中模拟 Vue 特定特性的方法。这并非是将 Vue 的代码直接翻译成 React，而是要理解其背后的功能意图，并用 React 的最佳实践去实现它。

**Vue 的特点**：
*   **双向数据绑定 (`v-model`)**：简化表单输入和组件间数据同步。
*   **计算属性 (`computed`)**：缓存依赖响应式数据的计算结果，只有依赖变化时才重新计算。
*   **侦听器 (`watch`)**：监听数据的变化并执行副作用操作。
*   **模板语法**：使用基于 HTML 的模板，学习曲线较平缓。

**React 的特点**：
*   **单向数据流 (props down, events up)**：数据从父组件通过 `props` 传递给子组件，子组件通过事件回调将数据回传给父组件。
*   **JSX**：JavaScript 的语法扩展，更具编程性。
*   **Hooks**：用于在函数组件中使用 `state` 和其他 React 特性。

目标是利用 React 的机制（特别是 Hooks），模拟出 Vue 在开发体验上的一些便利性，例如更便捷的双向绑定、响应式计算和副作用处理。

##### 1.2 核心用法 + 示例代码

我们将以一个常见的输入框组件为例，模拟 Vue 的 `v-model`、`computed` 和 `watch`。

**1. 模拟 `v-model` (双向绑定)**

Vue 的 `v-model` 是语法糖，本质上是 `value` 属性和 `input` 事件的组合。在 React 中，我们需要手动实现这种模式。

*   **Vue 实现**:
    ```vue
    <template>
      <input v-model="message" />
      <p>{{ message }}</p>
    </template>

    &lt;script&gt;
    export default {
      data() {
        return {
          message: 'Hello Vue'
        }
      }
    }
    &lt;/script&gt;
    ```

*   **React 实现 (使用 `useState`)**:
    ```jsx
    import React, { useState } from 'react';

    function MyInputComponent() {
      const [message, setMessage] = useState('Hello React');

      const handleChange = (event) => {
        setMessage(event.target.value);
      };

      return (
        <div>
          <input type="text" value={message} />
          <p>{message}</p>
        </div>
      );
    }

    export default MyInputComponent;
    ```

    *   **解释**: React 的实现是受控组件模式，通过 `value` 绑定状态，通过 `onChange` 更新状态。这与 Vue `v-model` 的本质是一致的，只是 React 要求手动连接 `value` 和 `onChange`。

**2. 模拟 `computed` (计算属性)**

Vue 的计算属性用于缓存基于响应式依赖的计算结果。在 React 中，我们可以使用 `useMemo` Hook 来实现类似的功能。

*   **Vue 实现**:
    ```vue
    <template>
      <p>Original: {{ rawValue }}</p>
      <p>Computed: {{ capitalizedValue }}</p>
    </template>

    &lt;script&gt;
    export default {
      data() {
        return {
          rawValue: 'hello'
        }
      },
      computed: {
        capitalizedValue() {
          return this.rawValue.toUpperCase();
        }
      }
    }
    &lt;/script&gt;
    ```

*   **React 实现 (使用 `useState` 和 `useMemo`)**:
    ```jsx
    import React, { useState, useMemo } from 'react';

    function MyComputedComponent() {
      const [rawValue, setRawValue] = useState('hello');

      // 使用 useMemo 模拟计算属性
      // 只有当 rawValue 变化时，才会重新计算 capitalizedValue
      const capitalizedValue = useMemo(() => {
        console.log('Recalculating capitalizedValue'); // 观察是否重复计算
        return rawValue.toUpperCase();
      }, [rawValue]); // 依赖数组，当 rawValue 变化时触发重新计算

      const handleChange = (event) => {
        setRawValue(event.target.value);
      };

      return (
        <div>
          <input type="text" value={rawValue} />
          <p>Original: {rawValue}</p>
          <p>Computed: {capitalizedValue}</p>
        </div>
      );
    }

    export default MyComputedComponent;
    ```

    *   **解释**: `useMemo` 接受一个函数和依赖数组。只有当依赖数组中的值发生变化时，`useMemo` 才会重新执行函数并返回新的结果，否则返回缓存的值，这与 Vue 计算属性的行为一致。

**3. 模拟 `watch` (侦听器)**

Vue 的侦听器允许你在数据变化时执行副作用操作。在 React 中，我们可以使用 `useEffect` Hook 来实现类似的功能。

*   **Vue 实现**:
    ```vue
    <template>
      <button @click="increment">Count: {{ count }}</button>
    </template>

    &lt;script&gt;
    export default {
      data() {
        return {
          count: 0
        }
      },
      watch: {
        count(newVal, oldVal) {
          console.log(`Count changed from ${oldVal} to ${newVal}`);
          // 执行一些副作用操作，例如发送请求
        }
      },
      methods: {
        increment() {
          this.count++;
        }
      }
    }
    &lt;/script&gt;
    ```

*   **React 实现 (使用 `useState` 和 `useEffect`)**:
    ```jsx
    import React, { useState, useEffect } from 'react';

    function MyWatcherComponent() {
      const [count, setCount] = useState(0);

      // 使用 useEffect 模拟 watch
      // 当 count 变化时，执行回调函数
      useEffect(() => {
        console.log(`Count is now: ${count}`);
        // 模拟副作用操作，例如发送数据到服务器
        if (count > 0) {
          console.log(`Sending count ${count} to server...`);
        }
        // 返回一个清理函数，在组件卸载或下次 effect 执行前执行
        return () => {
          console.log('Cleanup for count effect');
        };
      }, [count]); // 依赖数组，当 count 变化时触发 effect

      const increment = () => {
        setCount(prevCount => prevCount + 1);
      };

      return (
        <div>
          <p>Count: {count}</p>
          <button>Increment</button>
        </div>
      );
    }

    export default MyWatcherComponent;
    ```

    *   **解释**: `useEffect` 接受一个回调函数和依赖数组。当依赖数组中的值发生变化时，回调函数会重新执行。这与 Vue 侦听器的行为非常相似。`useEffect` 还提供了清理机制，可以返回一个函数用于清除副作用，这对于订阅、计时器等场景非常有用。

**总结如何着手**:
1.  **识别 Vue 特性**: 首先要识别 Vue 组件中使用了哪些核心特性（例如 `v-model`、`computed`、`watch`、生命周期钩子等）。
2.  **映射到 React Hook**: 将这些 Vue 特性与 React 中对应的 Hooks（`useState`、`useEffect`、`useMemo`、`useCallback` 等）进行映射。
3.  **遵循 React 数据流**: 确保数据流动遵循 React 的单向数据流原则 (`props down, events up`)。
4.  **使用受控组件**: 对于表单输入，始终使用受控组件模式。
5.  **考虑性能优化**: 对于计算量大的值或频繁更新的回调，考虑使用 `useMemo` 或 `useCallback` 进行优化。
6.  **组件拆分**: 将复杂逻辑拆分成更小的、可复用的自定义 Hooks 或子组件。

##### 1.3 常见误区或面试陷阱
*   **误区**: 试图在 React 中强行引入 Vue 的"模板"概念。
    *   **纠正**: React 使用 JSX，它更像是 JavaScript 代码，而不是纯粹的模板。应该利用 JSX 的编程能力来构建 UI，而不是尝试在其中复制 Vue 模板的语法。
*   **误区**: 不理解 `useMemo` 和 `useEffect` 的依赖数组的作用。
    *   **纠正**: 依赖数组是 Hooks 优化的关键。如果依赖数组为空 `[]`，则 `useEffect` 只会在组件挂载时执行一次（类似 `mounted`）。如果不提供依赖数组，则每次渲染都会执行。`useMemo` 和 `useEffect` 都会在依赖变化时重新计算或执行副作用。
*   **面试陷阱**: 对比 Vue 和 React 仅仅停留在表层语法，没有深入到其核心理念和实现原理。
    *   **纠正**: 深入理解两者在响应式、组件化、数据流等方面的根本差异，并能解释为什么它们会采用不同的实现方式，这才是高级面试官希望听到的答案。
*   **误区**: 认为实现"类似 Vue 组件"就是让 React 完全变成 Vue。
    *   **纠正**: 目标是**模拟** Vue 的一些开发体验上的便利性，而不是完全抹去 React 的特性。应该在保持 React 哲学的基础上，借鉴 Vue 的优点。

</details>

## 11. Ts 使用的如何？掌握的怎么样 {#question-subjective-180a59bb06d6}

### 题目要点

- 对 TypeScript 基础语法的掌握程度：基本类型、接口、类型别名、函数类型、类等。
- 对 TypeScript 高级特性的理解和应用：泛型、联合类型、交叉类型、类型守卫、类型推断、条件类型等。
- 在实际项目中如何使用 TypeScript 提升代码质量和可维护性。
- 对 TypeScript 编译配置 (`tsconfig.json`) 的了解。
- 对 TypeScript 在前端框架（如 React, Vue）中的应用经验。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
我对 TypeScript 有深入的理解和丰富的实战经验。在我的多个项目中，TypeScript 都是作为主要开发语言之一，用于提升代码质量、可维护性和开发效率。TypeScript 是 JavaScript 的一个超集，它为 JavaScript 添加了静态类型系统，最终会被编译成纯 JavaScript。

**引入 TypeScript 的核心目的在于**:
*   **类型安全**: 在编译阶段就能发现潜在的类型错误，避免了运行时错误，提高了代码的健壮性。
*   **代码可读性和可维护性**: 明确的类型定义使得代码意图更清晰，便于团队协作和后续维护，尤其是在大型复杂项目中。
*   **强大的开发工具支持**: 提供了更好的代码补全、智能提示、重构支持，极大地提升了开发体验和效率。
*   **代码重构更安全**: 在进行代码重构时，类型系统能够快速反馈修改对其他部分的影响，降低了重构风险。

我熟练掌握 TypeScript 的各项基本和高级特性，并能够将其灵活应用于不同的开发场景，包括前端框架（如 React、Vue）、Node.js 后端服务以及各种工具库的开发。

##### 1.2 核心用法 + 示例代码

1.  **基本类型与类型推断**:
    TypeScript 支持所有 JavaScript 基本类型，并能进行类型推断。
    ```typescript
    let num: number = 10; // 明确指定类型
    let str = "hello"; // 类型推断为 string
    let isActive: boolean = true;
    let arr: number[] = [1, 2, 3]; // 数组类型
    let tuple: [string, number] = ["test", 123]; // 元组类型
    enum Color { Red, Green, Blue }; // 枚举类型
    let c: Color = Color.Green;
    let anything: any = 4; // any 类型，避免类型检查
    ```

2.  **接口 (Interfaces)**:
    用于定义对象的结构、函数类型或类的契约。
    ```typescript
    interface User {
      id: number;
      name: string;
      email?: string; // 可选属性
      readonly age: number; // 只读属性
      [propName: string]: any; // 字符串索引签名，允许动态属性
    }

    const user1: User = {
      id: 1,
      name: "Alice",
      age: 25,
      city: "New York" // 符合字符串索引签名
    };

    // 定义函数类型
    interface SearchFunc {
      (source: string, subString: string): boolean;
    }
    const mySearch: SearchFunc = (src, sub) => src.includes(sub);
    ```

3.  **类型别名 (Type Aliases)**:
    为类型起一个新名字，常用于联合类型、交叉类型或复杂类型。
    ```typescript
    type StringOrNumber = string | number; // 联合类型
    let value: StringOrNumber = "hello";
    value = 123;

    type Point = { x: number; y: number }; // 对象类型别名
    const p: Point = { x: 10, y: 20 };

    type ButtonSize = "small" | "medium" | "large"; // 字面量联合类型
    let size: ButtonSize = "medium";
    ```

4.  **函数类型**:
    定义函数的参数和返回值类型。
    ```typescript
    function add(x: number, y: number): number {
      return x + y;
    }

    const subtract = (x: number, y: number): number => x - y;

    function greet(name: string, greeting?: string): string { // 可选参数
      return `${greeting || "Hello"}, ${name}!`
    }

    function sum(...numbers: number[]): number { // 剩余参数
      return numbers.reduce((acc, current) => acc + current, 0);
    }
    ```

5.  **类 (Classes)**:
    支持面向对象编程。
    ```typescript
    class Animal {
      protected name: string;
      constructor(theName: string) { this.name = theName; }
      move(distanceInMeters: number = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
      }
    }

    class Dog extends Animal {
      constructor(name: string) { super(name); }
      bark() {
        console.log('Woof! Woof!');
      }
    }
    const dog = new Dog("Buddy");
    dog.bark();
    dog.move(10);
    ```

6.  **泛型 (Generics)**:
    增强代码的重用性，允许在不指定具体类型的情况下编写可复用的组件或函数。
    ```typescript
    function identity<T>(arg: T): T {
      return arg;
    }

    let output1 = identity<string>("myString"); // 明确指定类型
    let output2 = identity(123); // 类型推断为 number

    // 泛型接口
    interface GenericIdentityFn<T> {
      (arg: T): T;
    }
    let myIdentity: GenericIdentityFn<number> = identity;
    ```

7.  **类型守卫 (Type Guards)**:
    在运行时检查类型，并缩小变量的类型范围。
    ```typescript
    function isString(value: any): value is string {
      return typeof value === 'string';
    }

    function printLength(x: string | number) {
      if (isString(x)) {
        console.log(x.length); // x 在这里被推断为 string
      } else {
        console.log(x); // x 在这里被推断为 number
      }
    }
    ```

8.  **条件类型 (Conditional Types)**:
    基于条件判断来选择类型的能力。
    ```typescript
    type TypeName<T> = T extends string ? "string" :
                       T extends number ? "number" :
                       T extends boolean ? "boolean" :
                       T extends undefined ? "undefined" :
                       T extends Function ? "function" :
                       "object";

    type T1 = TypeName<string>; // "string"
    type T2 = TypeName<() => void>; // "function"
    ```

**在实际项目中的应用经验**:
*   **React/Vue 组件开发**: 使用 TypeScript 编写组件的 props、state、methods 的类型，确保组件间数据传递的正确性。
*   **数据模型定义**: 定义 API 请求和响应的数据结构，减少后端接口联调时的错误。
*   **工具函数库**: 编写强类型的工具函数，提高其可复用性和健壮性。
*   **大型项目架构**: 利用接口和类型别名来定义模块间的契约，更好地管理复杂性。
*   **优化开发体验**: 结合 VS Code 等 IDE，享受到强大的类型提示、自动补全和错误检查。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 TypeScript 是另一个独立的语言，与 JavaScript 完全不相关。
    *   **纠正**: TypeScript 是 JavaScript 的超集，意味着所有合法的 JavaScript 代码都是合法的 TypeScript 代码。TypeScript 只是在 JavaScript 的基础上增加了类型系统。
*   **误区**: 滥用 `any` 类型。
    *   **纠正**: `any` 类型会跳过 TypeScript 的类型检查，失去了类型安全的优势。应尽量避免使用 `any`，除非在确实无法确定类型或处理第三方库时。优先使用 `unknown` 并进行类型收窄。
*   **面试陷阱**: 不了解 `interface` 和 `type` 的区别和适用场景。
    *   **纠正**: 它们都可以用来定义类型。`interface` 更侧重于定义对象的形状和类的实现，支持声明合并。`type` 更灵活，可以定义基本类型别名、联合类型、交叉类型、元组等，但不支持声明合并。
*   **误区**: 认为 TypeScript 只能用于前端开发。
    *   **纠正**: TypeScript 也可以用于后端开发（Node.js）、桌面应用（Electron）等，只要是 JavaScript 能运行的环境，TypeScript 都可以运行。
*   **误区**: 不理解类型断言 (`as`) 和类型守卫的区别。
    *   **纠正**: 类型断言是"相信我，我知道这个类型"，编译器不做检查，可能存在运行时风险。类型守卫是"运行时检查类型，并智能缩小类型范围"，是更安全和推荐的做法。

</details>

## 12. TypeScript 类型操作时，如何定义一个接口来描述一个具有动态属性的对象？比如对象的属性名是字符串，值是任意类型。 {#question-subjective-30ae2986fb1d}

### 题目要点

- 掌握 TypeScript 中"索引签名 (Index Signatures)"的概念和用法。
- 能够正确定义具有动态属性的对象类型，包括属性名类型和属性值类型。
- 理解索引签名的限制和注意事项。
- 在实际项目中，何时以及为何需要使用动态属性。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
在 TypeScript 中，如果我们需要描述一个对象的属性名是可变的（即在编写代码时无法预知所有的属性名），而属性值可以是某种特定类型或任意类型时，就需要使用"索引签名 (Index Signatures)"。索引签名允许我们定义对象可以拥有的属性类型，而不需要提前知道属性的具体名称。

这在以下场景中非常有用：
*   **字典 (Dictionary) 或哈希表 (Hash Map)**: 当对象被用作键值对的集合时，键（属性名）通常是字符串或数字，而值可以是任意类型或特定类型。
*   **来自后端接口的动态数据**: 当后端返回的数据结构中包含一些动态的、不确定的属性时。
*   **日志记录、配置对象**: 当需要一个可以灵活添加属性的对象来存储各种配置或日志信息时。

索引签名有两种类型：字符串索引签名和数字索引签名。在本题中，由于属性名是字符串，我们将主要关注字符串索引签名。

##### 1.2 核心用法 + 示例代码

要定义一个接口来描述一个具有动态属性的对象，属性名是字符串，值是任意类型，可以使用字符串索引签名。

**核心语法**:

```typescript
interface InterfaceName {
  [propName: string]: TypeOfValue;
}
```
*   `[propName: string]`：表示对象的属性名是字符串类型。`propName` 只是一个占位符，可以是任何有效的标识符，例如 `key`、`name` 等。
*   `: TypeOfValue`：表示所有匹配该索引签名的属性的值的类型。这里可以指定为 `any`、`string`、`number`、自定义类型等。

**示例**:

假设我们有一个配置对象，其属性名是字符串，属性值可以是任意类型（例如，因为我们不确定配置项的具体类型）。

```typescript
interface DynamicConfig {
  // 字符串索引签名：所有以字符串为键的属性，其值可以是任意类型
  [key: string]: any;

  // 可以同时定义已知属性
  version?: string;
  debugMode?: boolean;
}

const appConfig: DynamicConfig = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  enableLogging: true,
  version: "1.0.0",
  // 也可以添加其他动态属性
  customFeatureFlag: "enabled"
};

console.log(appConfig.apiUrl); // TypeScript 允许访问任何字符串属性
console.log(appConfig.timeout);
console.log(appConfig.nonExistentProperty); // 编译时不会报错，因为any类型

// 也可以给它赋值任意类型的值
appConfig.newSetting = { a: 1, b: "hello" };
appConfig.count = 100;

// 如果我们想更具体，例如属性值必须是字符串或数字
interface SpecificDynamicConfig {
  [key: string]: string | number;
  // version?: string; // 如果定义了已知属性，其类型必须兼容索引签名
}

const specificConfig: SpecificDynamicConfig = {
  user: "John Doe",
  age: 30,
  // isActive: true, // 错误：Type 'boolean' is not assignable to type 'string | number'.
};
```

**应用场景**:
*   **通用配置对象**: 当应用需要一个灵活的配置对象，包含多种类型的值时。
*   **插件系统**: 插件可能向主应用注册各种动态属性或方法。
*   **处理不确定结构的 JSON 数据**: 当从外部 API 获取到的 JSON 数据结构不完全确定，但知道其键值对大致类型时。
*   **缓存对象**: 用对象作为缓存，键是缓存的 `key`，值是缓存的数据。

**注意事项**:
*   **已知属性的兼容性**: 如果接口中同时存在明确定义的属性和索引签名，那么明确定义的属性的类型必须是索引签名类型的子类型。例如，如果 `[key: string]: string | number;`，那么 `version: string;` 是允许的，但 `isActive: boolean;` 则会报错。
*   **只能有一个字符串索引签名或一个数字索引签名**: 一个接口中只能有一个字符串索引签名和一个数字索引签名。
*   **数字索引签名**: 数字索引签名最终也会被转换为字符串（因为 JavaScript 对象的键总是字符串），所以 `[key: number]: TypeOfValue;` 实际上是 `[key: string]: TypeOfValue;` 的子集。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为只要使用了索引签名，就不能再定义其他明确的属性了。
    *   **纠正**: 索引签名和明确定义的属性可以共存，但明确属性的类型必须兼容索引签名的类型。
*   **误区**: 不理解 `[key: string]: any;` 的含义，误以为它是定义一个属性名为 `key`，类型为 `string` 的属性。
    *   **纠正**: `key` 只是一个占位符，表示所有字符串类型的属性名都将符合此索引签名。
*   **面试陷阱**: 在不需要动态属性的场景中滥用索引签名，导致类型检查变弱。
    *   **纠正**: 只有在确实需要灵活的、不确定的属性名时才使用索引签名。否则，应该明确地定义每个属性，以获得更严格的类型检查和更好的可读性。
*   **误区**: 将索引签名与映射类型 (Mapped Types) 混淆。
    *   **纠正**: 索引签名是定义一个对象可以具有的**未知**属性的类型。而映射类型是基于一个**已知**的类型，通过遍历其属性来创建新的类型（例如 `Partial<T>`, `Readonly<T>`）。两者是不同的概念，但都涉及对对象属性的操作。

</details>

## 13. 手写 flatten 函数，实现多维数组扁平化 {#question-subjective-16b265d2f1ae}

### 题目要点

- 掌握数组扁平化的多种方法：递归、`reduce`、栈、`flat()` 方法（ES6）。
- 理解不同方法的原理和适用场景。
- 对数组迭代和数据结构操作的熟练程度。
- 考虑性能和代码简洁性。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
数组扁平化（Flatten Array）是指将一个多维数组转换成一个一维数组的过程。例如，将 `[1, [2, 3], [4, [5, 6]]]` 扁平化为 `[1, 2, 3, 4, 5, 6]`。这个需求在处理树形结构数据、解析嵌套数据时非常常见。

实现数组扁平化有多种方法，核心原理都是通过遍历数组，并判断当前元素是否为数组。如果当前元素是数组，则需要对其进行进一步的扁平化处理；如果不是数组，则直接将其添加到结果数组中。主要区别在于遍历和处理嵌套数组的方式。

##### 1.2 核心用法 + 示例代码

以下是几种常见的实现 `flatten` 函数的方法：

**1. 递归实现 (最直观)**

这是最常见的实现方式，通过递归调用函数来处理嵌套数组。

```javascript
function flattenRecursive(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      // 如果是数组，则递归调用自身进行扁平化，并将结果展开添加到 result 中
      result = result.concat(flattenRecursive(arr[i]));
    } else {
      // 如果不是数组，直接添加到 result 中
      result.push(arr[i]);
    }
  }
  return result;
}

// 示例
const arr1 = [1, [2, 3], [4, [5, 6]], 7];
console.log(flattenRecursive(arr1)); // [1, 2, 3, 4, 5, 6, 7]

const arr2 = [1, [2, [3, [4, 5], 6], 7], 8];
console.log(flattenRecursive(arr2)); // [1, 2, 3, 4, 5, 6, 7, 8]
```
*   **优点**: 思路清晰，易于理解。
*   **缺点**: 当数组嵌套层级过深时，可能导致栈溢出 (Stack Overflow)。

**2. 使用 `reduce` 方法实现 (函数式)**

`reduce` 方法可以优雅地处理数组的迭代和累积操作。

```javascript
function flattenReduce(arr) {
  return arr.reduce((acc, current) => {
    if (Array.isArray(current)) {
      // 如果是数组，递归扁平化后，与累加器合并
      return acc.concat(flattenReduce(current));
    } else {
      // 如果不是数组，直接添加到累加器中
      return acc.concat(current);
    }
  }, []); // 初始累加器为空数组
}

// 示例
const arr3 = [1, [2, 3], [4, [5, 6]], 7];
console.log(flattenReduce(arr3)); // [1, 2, 3, 4, 5, 6, 7]
```
*   **优点**: 代码简洁，函数式编程风格。
*   **缺点**: 同递归实现，可能存在栈溢出问题。

**3. 栈 (Stack) 实现 (非递归)**

使用栈可以避免递归带来的栈溢出问题，适用于任意深度的数组扁平化。

```javascript
function flattenStack(arr) {
  const result = [];
  const stack = [...arr]; // 将原始数组的元素倒序推入栈中，以便按原顺序处理

  // 循环直到栈为空
  while (stack.length > 0) {
    const element = stack.pop(); // 弹出栈顶元素

    if (Array.isArray(element)) {
      // 如果是数组，将其所有元素（倒序）推回栈中
      // 注意：这里需要倒序推入，以保证最终结果的顺序正确
      for (let i = element.length - 1; i >= 0; i--) {
        stack.push(element[i]);
      }
    } else {
      // 如果不是数组，添加到结果数组的头部，因为我们是从栈顶（原数组的尾部）开始处理的
      result.unshift(element);
    }
  }
  return result;
}

// 示例
const arr4 = [1, [2, 3], [4, [5, 6]], 7];
console.log(flattenStack(arr4)); // [1, 2, 3, 4, 5, 6, 7]

const arr5 = [1, [2, [3, [4, 5], 6], 7], 8];
console.log(flattenStack(arr5)); // [1, 2, 3, 4, 5, 6, 7, 8]
```
*   **优点**: 避免了递归的栈溢出问题，适用于任意深度的数组。
*   **缺点**: 理解起来比递归稍复杂，需要注意入栈和出栈的顺序以保证最终结果的顺序。

**4. 使用 `flat()` 方法 (ES2019+ 内置方法)**

ES2019 引入了 `flat()` 方法，可以直接实现数组扁平化，这是最推荐的方式，因为它内置且高效。

```javascript
const arr6 = [1, [2, 3], [4, [5, 6]], 7];
console.log(arr6.flat(Infinity)); // [1, 2, 3, 4, 5, 6, 7]
// flat() 接受一个参数 depth，表示扁平化的深度。默认为 1。
// Infinity 表示扁平化所有嵌套层级。

const arr7 = [1, [2, [3, [4, 5]]], 6];
console.log(arr7.flat(2)); // [1, 2, 3, [4, 5], 6] (扁平化两层)
```
*   **优点**: 最简洁、最推荐、性能最好（C++ 实现）。
*   **缺点**: 浏览器兼容性（需要 ES2019 支持）。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 `flat()` 只能扁平化一层数组。
    *   **纠正**: `flat()` 方法可以接受一个 `depth` 参数来控制扁平化的深度，传入 `Infinity` 可以完全扁平化。
*   **误区**: 混淆 `concat` 和直接修改原数组。
    *   **纠正**: `concat` 方法会返回一个新数组，而不会修改原数组。在递归或 `reduce` 实现中，通常会使用 `concat` 来构建结果数组。
*   **面试陷阱**: 在手写实现时没有考虑栈溢出问题。
    *   **纠正**: 对于多维数组，递归实现可能存在栈溢出风险，非递归的栈实现是更健壮的选择。
*   **误区**: 性能问题。认为所有手写实现都比内置 `flat()` 性能差。
    *   **纠正**: 内置的 `flat()` 方法通常由底层 C++ 实现，性能远高于 JavaScript 手写实现。在实际项目中，优先考虑使用内置方法。

</details>

## 14. 实现一个函数，将数组的结构从 [a, b, c, d] 转换为 [[a, b], [c, d]] 这样的形式 {#question-subjective-934d6d662137}

### 题目要点

- 掌握数组分块或分组的算法。
- 熟悉数组的迭代方法，如 `for` 循环、`slice`、`reduce` 等。
- 能够处理不同长度的数组，包括奇数长度的情况。
- 考虑代码的简洁性和效率。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
这个题目要求将一个一维数组按照指定的大小（通常是2个元素一组）进行分块，并转换为一个二维数组。这在数据处理、UI布局（如网格布局）或批量操作时非常常见。核心原理是遍历原始数组，并每隔 N 个元素（题目中是2个）截取一个子数组，然后将这些子数组组合成一个新的数组。

需要注意的是，当原始数组的长度不能被 N 整除时，最后一个子数组的长度可能会小于 N。

##### 1.2 核心用法 + 示例代码

以下是几种实现将数组分块的函数的方法：

**1. 使用 `for` 循环和 `slice` 方法 (最常用和直观)**

这是最常见和容易理解的实现方式，通过 `for` 循环迭代，并使用 `slice` 方法截取子数组。

```javascript
function chunkArrayWithForLoop(arr, size) {
  if (!Array.isArray(arr) || size <= 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    // 使用 slice 截取从当前索引 i 开始，长度为 size 的子数组
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// 示例
const arr1 = ['a', 'b', 'c', 'd'];
console.log(chunkArrayWithForLoop(arr1, 2)); // [['a', 'b'], ['c', 'd']]

const arr2 = [1, 2, 3, 4, 5, 6, 7];
console.log(chunkArrayWithForLoop(arr2, 3)); // [[1, 2, 3], [4, 5, 6], [7]]

const arr3 = [];
console.log(chunkArrayWithForLoop(arr3, 2)); // []

console.log(chunkArrayWithForLoop(['a'], 2)); // [['a']]
```
*   **优点**: 思路清晰，易于理解，性能较好。
*   **缺点**: 相对不够"函数式"。

**2. 使用 `reduce` 方法 (函数式)**

`reduce` 方法可以用于累积结果，实现分组逻辑。

```javascript
function chunkArrayWithReduce(arr, size) {
  if (!Array.isArray(arr) || size <= 0) {
    return [];
  }

  return arr.reduce((acc, current, index) => {
    // 计算当前元素应该放在哪个子数组中
    const chunkIndex = Math.floor(index / size);

    // 如果当前子数组不存在，则创建一个新的空数组
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }

    // 将当前元素添加到对应的子数组中
    acc[chunkIndex].push(current);

    return acc;
  }, []); // 初始累加器为一个空数组，用于存放所有子数组
}

// 示例
const arr4 = ['a', 'b', 'c', 'd'];
console.log(chunkArrayWithReduce(arr4, 2)); // [['a', 'b'], ['c', 'd']]

const arr5 = [1, 2, 3, 4, 5, 6, 7];
console.log(chunkArrayWithReduce(arr5, 3)); // [[1, 2, 3], [4, 5, 6], [7]]
```
*   **优点**: 代码简洁，函数式编程风格。
*   **缺点**: 对 `reduce` 不熟悉的人来说可能理解成本稍高。

**3. 使用 `while` 循环 (效率高，适用于大数组)**

`while` 循环结合 `splice` 或 `slice` 可以在不创建新数组副本的情况下处理，但 `splice` 会修改原数组。

```javascript
function chunkArrayWithWhileLoop(arr, size) {
  if (!Array.isArray(arr) || size <= 0) {
    return [];
  }

  const result = [];
  let tempArr = [...arr]; // 创建一个副本，避免修改原数组

  while (tempArr.length > 0) {
    // 使用 slice 截取，或使用 splice 修改 tempArr
    result.push(tempArr.splice(0, size)); // splice 会修改 tempArr
  }
  return result;
}

// 示例
const arr6 = ['a', 'b', 'c', 'd', 'e'];
console.log(chunkArrayWithWhileLoop(arr6, 2)); // [['a', 'b'], ['c', 'd'], ['e']]
```
*   **优点**: 效率高，尤其在使用 `splice` 时，避免了大量 `slice` 带来的性能开销。
*   **缺点**: `splice` 会修改原始数组 (如果传入的是引用)。为了避免副作用，通常会先创建一份浅拷贝 (`[...arr]`)。

##### 1.3 常见误区或面试陷阱
*   **误区**: 只考虑数组长度能被 `size` 整除的情况，忽略了剩余元素。
    *   **纠正**: 必须考虑数组长度不能被 `size` 整除时，最后一个子数组的元素个数可能少于 `size`，但仍应作为一个独立的子数组存在。
*   **误区**: `slice()` 和 `splice()` 的区别。
    *   **纠正**: `slice()` 返回一个新的数组，不修改原数组。`splice()` 会修改原数组，并返回被删除的元素组成的数组。
*   **面试陷阱**: 在手写实现时没有处理输入参数的边界情况，例如 `size` 为 0 或负数，或者输入不是数组。
    *   **纠正**: 健壮的函数需要对输入参数进行校验，例如 `size <= 0` 或 `!Array.isArray(arr)`。
*   **误区**: 认为直接修改原数组是好的做法。
    *   **纠正**: 在大多数情况下，为了避免副作用，最好返回一个新数组，而不是修改原始数组。如果必须修改原数组，应明确告知使用者或在函数内部先进行浅拷贝。

</details>

## 15. 手写深拷贝 {#question-subjective-2dad66b20542}

### 题目要点

- 理解深拷贝和浅拷贝的区别。
- 掌握实现深拷贝的多种方法：JSON 方法、递归实现、考虑特殊对象（Date, RegExp, Map, Set, Symbol）和循环引用。
- 能够处理基本类型、引用类型、嵌套对象和数组。
- 对数据结构和递归算法的熟练运用。
- 考虑性能和边界情况。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
深拷贝（Deep Copy）是指创建一个新对象，新对象和原对象之间没有任何引用关系，它们是完全独立的副本。这意味着修改新对象不会影响到原对象，反之亦然。这与浅拷贝（Shallow Copy）不同，浅拷贝只复制对象的第一层，如果对象内部嵌套了引用类型（如对象、数组），浅拷贝只是复制了这些引用，新旧对象仍然共享内部的引用类型数据。

实现深拷贝的核心挑战在于：
1.  **递归复制**: 对于对象内部嵌套的引用类型（对象、数组），需要递归地进行复制，直到所有基本类型的值都被复制。
2.  **处理特殊对象**: 像 `Date`、`RegExp`、`Map`、`Set` 等内置对象，不能简单地递归复制其属性，需要特殊处理。
3.  **处理循环引用**: 如果对象中存在循环引用（例如，`obj.a = obj`），简单的递归复制会导致无限循环，最终栈溢出。需要机制来检测和处理这种情况。
4.  **性能考虑**: 对于非常大的对象，深拷贝可能会消耗大量时间和内存。

##### 1.2 核心用法 + 示例代码

以下是几种常见的实现深拷贝的方法，以及如何解决循环引用问题：

**1. 使用 `JSON.parse(JSON.stringify(obj))` (最简单，但有局限性)**

```javascript
function deepCopyJSON(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("JSON.stringify failed:", e);
    return null;
  }
}

// 示例
const obj1 = {
  name: 'Alice',
  age: 30,
  address: { city: 'New York' },
  hobbies: ['reading', 'coding']
};
const copy1 = deepCopyJSON(obj1);
obj1.address.city = 'London';
console.log(copy1.address.city); // New York (已深拷贝)

// 局限性示例
const obj2 = {
  name: 'Bob',
  date: new Date(),
  func: () => console.log('hello'),
  reg: /abc/g,
  sym: Symbol('test'),
  undef: undefined
};
const copy2 = deepCopyJSON(obj2);
console.log(copy2); // { name: 'Bob', date: '2023-10-27T...Z', reg: {} } (func, sym, undef 丢失，Date 变为字符串)

// 循环引用会报错
// const obj3 = {};
// obj3.self = obj3;
// deepCopyJSON(obj3); // TypeError: Converting circular structure to JSON
```
*   **优点**: 简单快捷，适用于只有基本数据类型、普通对象和数组组成的数据。
*   **缺点**: 无法复制 `undefined`、`function`、`Symbol`、`BigInt` 类型。无法复制 `RegExp`、`Date`、`Map`、`Set` 等特殊对象实例（它们会被转换为普通对象或字符串）。无法处理循环引用，会抛出错误。

**2. 递归实现 (通用方案，需处理循环引用)**

这种方法能够处理各种类型，并通过引入 `map` 来处理循环引用。

```javascript
function deepCopyRecursive(obj, hash = new WeakMap()) {
  // 1. 处理基本类型和 null、undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 2. 处理特殊内置对象（Date, RegExp等）
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 3. 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 4. 创建新对象或新数组
  let copy = Array.isArray(obj) ? [] : {};

  // 5. 存储已复制的对象，用于处理循环引用
  hash.set(obj, copy);

  // 6. 递归复制属性
  for (let key in obj) {
    // 确保是对象自身的属性，而不是原型链上的属性
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopyRecursive(obj[key], hash);
    }
  }

  // 7. 处理 Symbol 属性 (ES6)
  Object.getOwnPropertySymbols(obj).forEach(symbol => {
    copy[symbol] = deepCopyRecursive(obj[symbol], hash);
  });

  // 8. 处理 Map 和 Set (ES6) - 更复杂的场景，可选
  // if (obj instanceof Map) {
  //   const newMap = new Map();
  //   hash.set(obj, newMap);
  //   obj.forEach((value, key) => {
  //     newMap.set(deepCopyRecursive(key, hash), deepCopyRecursive(value, hash));
  //   });
  //   return newMap;
  // }
  // if (obj instanceof Set) {
  //   const newSet = new Set();
  //   hash.set(obj, newSet);
  //   obj.forEach(value => {
  //     newSet.add(deepCopyRecursive(value, hash));
  //   });
  //   return newSet;
  // }

  return copy;
}

// 示例：处理基本类型和普通对象/数组
const obj4 = {
  a: 1,
  b: 'hello',
  c: [1, 2, { d: 4 }],
  e: { f: { g: 5 } }
};
const copy4 = deepCopyRecursive(obj4);
obj4.c[2].d = 99;
console.log(copy4.c[2].d); // 4

// 示例：处理 Date 和 RegExp
const obj5 = {
  date: new Date(),
  regex: /test/gi
};
const copy5 = deepCopyRecursive(obj5);
console.log(copy5.date instanceof Date); // true
console.log(copy5.regex instanceof RegExp); // true

// 示例：处理循环引用
const obj6 = {};
obj6.a = obj6; // 循环引用
obj6.b = { c: obj6 }; // 间接循环引用
const copy6 = deepCopyRecursive(obj6);
console.log(copy6.a === copy6); // true (copy6.a 指向 copy6 自身)
console.log(copy6.b.c === copy6); // true (copy6.b.c 指向 copy6 自身)
console.log(copy6.a === obj6.a); // false (是新对象，但内部引用关系保持)
```
*   **优点**: 功能全面，可以处理各种类型数据，包括循环引用。
*   **缺点**: 相对复杂，需要考虑的边界情况较多。

**3. 使用结构化克隆算法 (Structured Clone Algorithm) (仅浏览器环境，非手写)**

浏览器环境提供了一种结构化克隆算法，常用于 `postMessage`、`IndexedDB`、`Notification.data` 等场景。它能够深拷贝各种复杂类型，包括循环引用。

```javascript
// 在浏览器环境运行
// const obj = { a: 1, date: new Date() };
// const copy = structuredClone(obj); // ES2022
// console.log(copy);

// 或者通过 MessageChannel
// function deepCopyStructuredClone(obj) {
//   return new Promise(resolve => {
//     const { port1, port2 } = new MessageChannel();
//     port2.onmessage = ev => resolve(ev.data);
//     port1.postMessage(obj);
//   });
// }

// // 使用 await 或 .then()
// const myObj = { a: 1, b: { c: 2 } };
// myObj.circular = myObj;
// deepCopyStructuredClone(myObj).then(copiedObj => {
//   console.log(copiedObj);
//   console.log(copiedObj.circular === copiedObj); // true
// });
```
*   **优点**: 功能最强大，可以深拷贝绝大多数内置类型和循环引用，性能优异。
*   **缺点**: 仅限于浏览器环境（或 Node.js v17+ 的 `structuredClone`），不能直接手写。

##### 1.3 常见误区或面试陷阱
*   **误区**: 混淆深拷贝和浅拷贝，认为 `Object.assign()` 或扩展运算符 (`...`) 是深拷贝。
    *   **纠正**: `Object.assign()` 和扩展运算符都是浅拷贝。它们只复制第一层属性，对于嵌套的引用类型，仍然是引用。
*   **误区**: 手写深拷贝时没有处理循环引用，导致栈溢出。
    *   **纠正**: 这是深拷贝的经典难题，务必使用 `WeakMap` 或 `Map` 来记录已拷贝的对象，避免重复拷贝和无限递归。
*   **面试陷阱**: 对特殊对象（如 `Date`, `RegExp`）没有特殊处理，导致拷贝结果不正确。
    *   **纠正**: 这些内置对象需要通过它们的构造函数来创建新的实例，而不是简单地复制属性。
*   **误区**: 认为 `JSON.parse(JSON.stringify(obj))` 是万能的深拷贝方法。
    *   **纠正**: 强调其局限性，尤其是在处理函数、`undefined`、`Symbol`、`Date`、`RegExp` 和循环引用时的不足。
*   **性能问题**: 对于超大对象或频繁调用的场景，深拷贝本身就是一项开销。面试时可能会问到优化思路。
    *   **纠正**: 如果仅仅是某些特定部分需要深拷贝，可以考虑只对那部分进行深拷贝。或者考虑使用不可变数据结构 (Immutable.js) 来避免深拷贝的需求。

</details>

## 16. 你的深拷贝函数如何处理循环引用的对象？有没有考虑过性能问题？ {#question-subjective-d99b221c6865}

### 题目要点

- 对循环引用问题的深刻理解：产生原因、危害。
- 掌握解决循环引用问题的核心机制：使用 `Map` 或 `WeakMap` 存储已拷贝对象。
- 能够解释 `Map` 和 `WeakMap` 在处理循环引用时的优缺点。
- 对深拷贝性能影响的认知，以及潜在的优化策略。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
循环引用是指一个或多个对象通过它们的属性相互引用，形成一个闭环，导致在深拷贝时如果不对其进行特殊处理，会陷入无限递归，最终导致栈溢出错误（`RangeError: Maximum call stack size exceeded`）。

例如：
```javascript
const objA = {};
const objB = {};
objA.b = objB;
objB.a = objA; // objA 和 objB 相互引用
```

在深拷贝过程中，当遇到一个对象时，如果这个对象已经被拷贝过（即已经存在于本次拷贝的映射关系中），那么我们就不需要再次递归地拷贝它，而是直接返回之前拷贝过的副本。这样就打破了循环递归，避免了栈溢出。

##### 1.2 核心用法 + 示例代码

处理循环引用的核心策略是使用一个数据结构（通常是 `Map` 或 `WeakMap`）来存储已经拷贝过的对象和它们的副本。在每次递归拷贝一个对象之前，先检查这个对象是否已经在映射表中。如果存在，直接返回其对应的副本；如果不存在，则将当前对象和其新创建的副本存入映射表，然后继续递归拷贝其属性。

**使用 `WeakMap` 处理循环引用**:

```javascript
function deepCopyWithCircular(obj, hash = new WeakMap()) {
  // 1. 处理基本类型和 null、undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 2. 处理特殊内置对象（Date, RegExp等）
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 3. 处理循环引用：检查 hash 中是否已存在当前对象
  if (hash.has(obj)) {
    return hash.get(obj); // 如果已存在，直接返回其对应的副本
  }

  // 4. 创建新对象或新数组
  // 这里使用 Object.create(Object.getPrototypeOf(obj)) 可以更好地保留原型链
  // 但为了简化，这里直接用 [] 或 {}，取决于 obj 是否是数组
  let copy = Array.isArray(obj) ? [] : {};

  // 5. 存储已拷贝的对象及其副本，建立映射关系，供后续循环引用时使用
  // 这一步必须在递归其属性之前完成，否则在循环引用时会进入无限递归
  hash.set(obj, copy);

  // 6. 递归复制属性
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopyWithCircular(obj[key], hash);
    }
  }

  // 7. 处理 Symbol 属性
  Object.getOwnPropertySymbols(obj).forEach(symbol => {
    copy[symbol] = deepCopyWithCircular(obj[symbol], hash);
  });

  // 8. 处理 Map 和 Set (可选，根据面试要求决定是否加入)
  if (obj instanceof Map) {
    obj.forEach((value, key) => {
      copy.set(deepCopyWithCircular(key, hash), deepCopyWithCircular(value, hash));
    });
  }
  if (obj instanceof Set) {
    obj.forEach(value => {
      copy.add(deepCopyWithCircular(value, hash));
    });
  }

  return copy;
}

// 示例：循环引用
const objCircular = {};
objCircular.a = objCircular; // 直接循环引用
objCircular.b = { c: objCircular }; // 间接循环引用
objCircular.d = [1, 2, objCircular]; // 数组中的循环引用

const copiedCircular = deepCopyWithCircular(objCircular);

console.log(copiedCircular.a === copiedCircular);       // true
console.log(copiedCircular.b.c === copiedCircular);   // true
console.log(copiedCircular.d[2] === copiedCircular);  // true

// 验证原对象和拷贝对象是独立的
console.log(copiedCircular === objCircular); // false
console.log(copiedCircular.b === objCircular.b); // false
console.log(copiedCircular.d === objCircular.d); // false
```

**为什么使用 `WeakMap` 而不是 `Map`？**
*   **`WeakMap`**: 它的键只能是对象，并且是弱引用。这意味着如果 `WeakMap` 的键（原始对象）没有其他引用指向它时，垃圾回收机制可以回收这个原始对象和 `WeakMap` 中对应的键值对。这有助于防止内存泄漏。
*   **`Map`**: `Map` 的键可以是任意类型，并且是强引用。如果使用 `Map`，即使原始对象在外部已经没有引用，只要它还在 `Map` 中作为键存在，就不会被垃圾回收，可能导致内存泄漏。

因此，在深拷贝处理循环引用时，`WeakMap` 是更推荐的选择，因为它能更好地支持垃圾回收机制。

##### 1.3 常见误区或面试陷阱
*   **误区**: 仅仅通过简单的递归，没有引入 `hash` (或 `map`) 来存储已拷贝对象。
    *   **纠正**: 这是处理循环引用的关键步骤。没有它，递归就会无限进行下去，导致栈溢出。
*   **误区**: 不理解 `WeakMap` 和 `Map` 在垃圾回收方面的区别。
    *   **纠正**: 强调 `WeakMap` 的弱引用特性可以避免内存泄漏，这是其相对于 `Map` 在这种场景下的主要优势。
*   **性能问题考量**:
    *   **递归深度**: 深拷贝的性能与对象的嵌套深度和属性数量成正比。深度越深，属性越多，递归次数就越多，性能开销越大。
    *   **特殊对象处理**: 处理 `Date`、`RegExp`、`Map`、`Set` 等特殊对象时，会涉及到额外的构造函数调用或遍历，这也会增加开销。
    *   **`WeakMap` 的查找开销**: 虽然 `WeakMap` 解决了内存泄漏问题，但每次 `has` 和 `get` 操作也会有微小的开销。然而，相对于递归带来的巨大开销，这几乎可以忽略不计。
    *   **优化思路**:
        1.  **限制深度**: 如果业务场景允许，可以设置一个最大拷贝深度，超过该深度的对象只进行浅拷贝或直接跳过，以牺牲完整性换取性能。
        2.  **按需拷贝**: 如果只需要拷贝对象中的部分属性或特定结构，可以实现一个按需拷贝的函数，而不是整个对象都深拷贝。
        3.  **使用内置 API**: 如果是浏览器环境或 Node.js v17+，`structuredClone` 是最佳选择，因为它基于底层的结构化克隆算法，性能最高且能处理各种复杂情况。
        4.  **不可变数据结构**: 考虑使用 Immutable.js 等库，它们通过结构共享的方式避免了深拷贝的需求，每次修改都会返回一个新的数据结构，但只修改了变化的部分，未变化的部分仍然共享引用。

</details>

## 17. 项目里的图片懒加载怎么实现？有通过什么包吗？ {#question-subjective-2139e479b8ab}

### 题目要点

- 理解图片懒加载的原理：延迟加载非视口图片，减少首屏加载时间，优化用户体验。
- 掌握多种实现图片懒加载的方法：`scroll` 事件、`Intersection Observer API`。
- 了解常见的图片懒加载库及其优缺点。
- 考虑性能优化和用户体验。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
图片懒加载（Lazy Loading Images）是一种前端性能优化技术，其核心思想是：**延迟加载网页中可见区域（视口，Viewport）之外的图片资源，直到它们进入或即将进入视口时才进行加载。**

传统上，浏览器会一次性加载所有 `<img>` 标签的 `src` 属性指定的图片资源，无论这些图片是否在用户的当前屏幕可见范围内。这会导致以下问题：
*   **首屏加载时间长**: 页面加载了大量用户暂时看不到的图片，增加了网络请求和渲染时间。
*   **带宽浪费**: 用户可能只浏览了页面的一部分就离开了，未看到的图片资源被白白加载。
*   **性能下降**: 大量图片同时加载会占用浏览器资源，影响页面的响应速度和流畅度。

图片懒加载通过以下方式解决这些问题：
1.  **初始状态**: 在图片初始渲染时，将真实的图片地址存储在一个自定义属性中（例如 `data-src`），而 `src` 属性设置为一个占位图（如 `loading.gif`）或空白图片。
2.  **监听滚动或可见性**: 通过监听页面的滚动事件或使用 `Intersection Observer API` 来判断图片是否进入或即将进入视口。
3.  **动态加载**: 当图片进入视口时，将 `data-src` 中的真实图片地址赋值给 `src` 属性，从而触发图片的加载。

##### 1.2 核心用法 + 示例代码

实现图片懒加载主要有以下几种方法：

**1. 使用 `Intersection Observer API` (推荐)**

`Intersection Observer API` 提供了一种异步观察目标元素与祖先元素或顶级文档视口交叉状态的方法。它是目前实现图片懒加载最推荐的方式，因为它性能更高，代码更简洁，并且避免了频繁的 `scroll` 事件监听和计算。

*   **原理**: 创建一个 `IntersectionObserver` 实例，并为其注册一个回调函数。当目标元素（图片）进入或离开观察器的根（通常是视口）时，回调函数会被执行。在回调函数中，检查 `isIntersecting` 属性来判断元素是否可见。

*   **示例代码**:
    ```html
    <!-- HTML 结构 -->
    &lt;style&gt;
      .image-container {
        height: 200px;
        background-color: #f0f0f0;
        margin-bottom: 20px;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    &lt;/style&gt;

    <div class="image-container"><img data-src="https://via.placeholder.com/150/FF0000/FFFFFF?text=Image1" alt="Image 1"></div>
    <div class="image-container"><img data-src="https://via.placeholder.com/150/00FF00/000000?text=Image2" alt="Image 2"></div>
    <div class="image-container"><img data-src="https://via.placeholder.com/150/0000FF/FFFFFF?text=Image3" alt="Image 3"></div>
    <!-- 更多图片... -->

    &lt;script&gt;
      document.addEventListener('DOMContentLoaded', () => {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
          const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // 目标元素进入视口
                const img = entry.target;
                img.src = img.dataset.src; // 将真实图片地址赋值给 src
                img.removeAttribute('data-src'); // 移除 data-src 属性
                observer.unobserve(img); // 停止观察已加载的图片
              }
            });
          }, {
            // options.rootMargin: 用于扩大或缩小 root 的边界盒
            // 例如: '0px 0px 100px 0px' 表示底部扩大 100px
            // options.threshold: 阈值，表示目标元素可见性达到多少时触发回调
            // 例如: 0 表示只要有 1 像素可见就触发，1 表示完全可见才触发
            rootMargin: '0px 0px 50px 0px', // 预加载范围，图片进入视口前 50px 开始加载
            threshold: 0
          });

          lazyImages.forEach(img => {
            lazyLoadObserver.observe(img);
          });
        } else {
          // Fallback for browsers that don't support Intersection Observer
          // 可以使用 scroll 事件或直接全部加载
          console.log('Intersection Observer not supported, consider a fallback.');
          lazyImages.forEach(img => {
            img.src = img.dataset.src; // 直接加载所有图片
            img.removeAttribute('data-src');
          });
        }
      });
    &lt;/script&gt;
    ```

**2. 使用 `scroll` 事件监听 (传统方法，性能相对较差)**

*   **原理**: 监听页面或容器的 `scroll` 事件，在滚动时计算图片元素相对于视口的位置。如果图片顶部或底部进入视口范围，则加载图片。
*   **缺点**: 频繁触发 `scroll` 事件会导致性能问题（回流和重绘）。需要进行节流（throttle）或防抖（debounce）处理，并且计算元素位置需要使用 `getBoundingClientRect()`。

**3. 使用第三方库**

在实际项目中，为了简化开发、处理兼容性和提供更多功能（如占位图、错误处理、自定义加载动画等），通常会使用成熟的第三方图片懒加载库。

*   **`lazysizes`**: 一个高性能、SEO 友好的懒加载库，支持响应式图片、`srcset`、`picture` 元素，并且可以自动检测 `IntersectionObserver` 或使用 `scroll` 事件作为降级方案。它不需要手动初始化每张图片，只需添加特定类名。
    *   **使用方式**:
        ```html
        <img data-src="image.jpg" class="lazyload" alt="...">
        &lt;script src="lazysizes.min.js" async=""&gt;&lt;/script&gt;
        ```
*   **`vanilla-lazyload`**: 另一个轻量级且功能丰富的库，支持背景图、视频、iframe 懒加载，也利用 `Intersection Observer`。
*   **框架自带/生态库**: 如果使用 React、Vue 等框架，通常会有专门的懒加载组件或插件，例如 React 的 `react-lazyload`，Vue 的 `vue-lazyload`。

我个人在项目中更倾向于使用 **`lazysizes`**，因为它轻量、高性能、配置简单，并且对现代浏览器提供了开箱即用的 `Intersection Observer` 支持，同时也能很好地处理旧版本浏览器的降级。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为图片懒加载只是将 `src` 换成 `data-src` 就行了。
    *   **纠正**: 还需要 JavaScript 逻辑来监听元素的可见性，并在适当的时机将 `data-src` 赋值给 `src`。
*   **误区**: 滥用 `scroll` 事件，没有进行节流或防抖处理。
    *   **纠正**: 频繁的 `scroll` 事件回调会导致性能问题，必须进行节流或防抖优化。更推荐使用 `Intersection Observer API`。
*   **面试陷阱**: 不了解 `Intersection Observer API` 的优势和基本用法。
    *   **纠正**: 强调其异步、非阻塞、高性能的特点，以及如何通过 `isIntersecting` 和 `threshold`、`rootMargin` 等选项进行配置。
*   **误区**: 忽略了图片懒加载对 SEO 的影响。
    *   **纠正**: 搜索引擎爬虫可能无法正确解析 `data-src`，导致图片无法被索引。为了 SEO 友好，可以使用 `noscript` 标签提供备用内容，或者在服务端渲染 (SSR) 中直接输出完整的 `src`。
*   **误区**: 只考虑图片懒加载，忽略其他资源（如视频、iframe）的懒加载。
    *   **纠正**: 懒加载技术同样适用于视频、iframe 等其他非关键资源，原理类似。

</details>

## 18. 在使用图片懒加载时，如何确定图片的懒加载阈值？是否会根据不同的设备和网络环境进行调整？ {#question-subjective-e4badadd3fcc}

### 题目要点

- 理解懒加载阈值（`rootMargin`、`threshold`）在 `Intersection Observer API` 中的作用。
- 掌握根据不同场景（设备、网络、用户体验）调整阈值的策略。
- 对性能和用户体验的权衡思考。
- 具备数据驱动优化的意识。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
在图片懒加载中，**阈值（Threshold）**或更准确地说，**预加载范围**，是决定图片何时开始加载的关键参数。它直接影响着用户体验和性能优化之间的平衡。如果图片加载得太晚，用户可能会看到空白区域；如果加载得太早，则失去了懒加载的意义，增加了首屏加载负担。

对于使用 `Intersection Observer API` 实现的懒加载，主要通过 `options` 参数中的 `rootMargin` 和 `threshold` 来确定这个阈值：

*   **`rootMargin` (根外边距)**: 定义了 `root` 元素（通常是视口）的边界盒的扩展或收缩区域。它接受 CSS `margin` 语法的值（例如 `'100px 0px 50px 0px'`），表示在视口边缘之外提前或延后多少距离开始触发交叉。
    *   **正值**: 扩大了观察区域，意味着目标元素在进入视口前就会被加载（预加载）。这通常是为了优化用户体验，避免看到加载中的空白。
    *   **负值**: 缩小了观察区域，意味着目标元素需要进入视口更深的位置才会被加载。
*   **`threshold` (阈值)**: 定义了一个或多个表示 `target` 元素可见比例的数值。当 `target` 元素的任何部分与 `root` 元素发生交叉时，回调函数会触发。`threshold` 值为 0.0 表示当目标元素的任何部分进入（或离开）根元素时，回调函数将被调用。值为 1.0 意味着当目标元素完全进入（或完全离开）根元素时，回调函数将被调用。

##### 1.2 核心用法 + 示例代码

确定和调整图片懒加载阈值需要权衡用户体验和性能，并可以根据不同的设备和网络环境进行动态调整。

**1. 默认阈值设置**

通常，为了提供较好的用户体验，我们会设置一个正的 `rootMargin`，让图片在用户看到之前就加载好。

```javascript
const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '0px 0px 200px 0px', // 底部向下扩展 200px，意味着图片在距离视口底部 200px 时开始加载
  threshold: 0 // 只要有一点点进入视口（或 rootMargin 扩展区）就触发
});
```
*   **解释**: 这里的 `rootMargin: '0px 0px 200px 0px'` 意味着当图片距离视口底部还有 200px 的时候，就会开始加载。这个值是一个经验值，可以在实际测试中根据用户反馈和性能数据进行调整。

**2. 根据不同设备和网络环境调整**

动态调整阈值是一种更高级的优化策略，旨在为不同用户提供最佳体验。

*   **设备类型 (Desktop vs Mobile)**:
    *   **移动设备**: 通常屏幕较小，网络环境可能不稳定。可以考虑设置一个较小的 `rootMargin` 值，甚至为 0 或负值，以减少移动数据流量消耗和加快初始渲染速度。用户滚动速度通常较快，但网络延迟可能高，所以太晚加载也可能导致空白。
    *   **桌面设备**: 屏幕较大，网络通常更稳定。可以设置一个稍大的 `rootMargin`，以提供更流畅的滚动体验，避免图片加载的突兀感。
*   **网络环境 (慢速网络 vs 快速网络)**:
    *   **慢速网络 (Slow Network)**: 在 2G/3G 或弱网络环境下，应该优先考虑减少不必要的加载。可以将 `rootMargin` 设置得更小，甚至为 0 或负值，确保只有当图片即将进入视口时才加载，从而节省带宽和加快关键资源的加载。
    *   **快速网络 (Fast Network)**: 在 Wi-Fi 或 5G 等快速网络环境下，可以适当增大 `rootMargin`，让图片提前加载，提高用户体验。
*   **用户习惯/行为**: 如果通过分析用户行为数据发现用户通常会快速滚动，那么可能需要增大 `rootMargin` 以提前加载。如果用户更倾向于仔细浏览内容，那么可以适当减小。

**如何动态调整？**

1.  **客户端检测**:
    *   **网络状态**: 使用 `navigator.connection` (Network Information API) 或判断 `navigator.onLine` 来获取网络类型（如 `effectiveType`, `downlink`）。
    *   **设备类型**: 判断 `window.innerWidth` 或 `navigator.userAgent` 来区分移动端和桌面端。
    *   **`matchMedia`**: 根据媒体查询动态调整。
    ```javascript
    // 伪代码示例：根据网络类型调整 rootMargin
    let rootMarginValue = '0px 0px 100px 0px'; // 默认值
    if ('connection' in navigator && navigator.connection.effectiveType) {
      if (navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === '3g') {
        rootMarginValue = '0px 0px 0px 0px'; // 慢速网络不预加载
      } else if (navigator.connection.effectiveType === '4g') {
        rootMarginValue = '0px 0px 50px 0px';
      }
    }

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => { /* ... */ }, {
      rootMargin: rootMarginValue,
      threshold: 0
    });
    ```
2.  **服务端渲染 (SSR)**: 如果使用 SSR，可以在服务端根据请求头中的 `User-Agent` 判断设备类型，或者根据用户 IP 判断大致网络状况，然后在渲染时直接输出合适的图片 `src`，甚至完全跳过懒加载（对于首屏图片）。

**性能与用户体验的权衡**: 懒加载阈值的设置是一个平衡艺术。过小的阈值可能导致图片加载延迟，用户看到空白；过大的阈值则可能失去了懒加载的意义，增加了初始加载负担。最佳实践是在测试中观察用户行为和性能指标，找到一个最佳平衡点。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 `threshold` 只能是 0 或 1。
    *   **纠正**: `threshold` 可以是 0 到 1 之间的任何小数，也可以是一个数组（例如 `[0, 0.5, 1]`），表示在目标元素可见性达到这些比例时都触发回调。
*   **误区**: 盲目设置一个固定的 `rootMargin`，不考虑实际场景。
    *   **纠正**: 强调根据具体的业务需求、目标用户群体和预期的网络环境来调整 `rootMargin`。
*   **面试陷阱**: 不知道如何动态检测设备和网络环境。
    *   **纠正**: 熟悉 `navigator.connection` 和 `window.innerWidth` 等 API 的用法。
*   **误区**: 认为 `rootMargin` 只是用来控制图片是否加载，没有意识到它也是优化用户体验的关键。
    *   **纠正**: `rootMargin` 可以让图片在用户感知到之前就加载完成，从而避免加载抖动和空白区域，提升用户感知性能。
*   **只考虑了 `Intersection Observer`，没有提及传统懒加载方法的阈值控制。**
    *   **纠正**: 对于基于 `scroll` 事件的懒加载，阈值通常通过计算元素 `offsetTop` 和 `scrollTop` 以及视口高度来实现，例如当 `图片offsetTop < 滚动高度 + 视口高度 + 预加载距离` 时加载。

</details>

## 19. 在处理多个 Promise 时，你是如何管理它们的执行顺序和错误处理的？ {#question-subjective-18b08a8d9f0d}

### 题目要点

- 掌握 Promise 的基本概念和状态。
- 熟悉 Promise 链式调用和并行执行的方法。
- 理解 Promise 的错误冒泡机制和多种错误处理方式：`catch`、`finally`、`Promise.allSettled`。
- 能够根据业务需求选择合适的 Promise 组合方法（串行、并行、竞态）。
- 对异步编程的深度理解。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
在 JavaScript 异步编程中，`Promise` 是处理异步操作的核心工具。在实际应用中，我们经常需要处理多个异步任务，这就涉及到如何管理它们的执行顺序以及如何有效地处理可能发生的错误。合理的管理策略能够确保程序的健壮性、可预测性，并提供良好的用户体验。

**Promise 的基本状态**:
*   **Pending (待定)**: 初始状态，既没有成功，也没有失败。
*   **Fulfilled (已成功)**: 操作成功完成，带有结果值。
*   **Rejected (已失败)**: 操作失败，带有拒绝原因（错误信息）。

Promise 的错误处理遵循"冒泡"机制：一个 Promise 被拒绝后，它的拒绝状态会沿着 Promise 链一直向下传递，直到遇到一个 `catch()` 处理程序。如果没有 `catch()` 处理，错误最终会作为未捕获的 Promise 拒绝，通常会导致程序崩溃或在控制台打印错误。

管理多个 Promise 的执行顺序和错误处理，是异步流程控制的关键。

##### 1.2 核心用法 + 示例代码

处理多个 Promise 的执行顺序和错误处理，主要有以下几种策略：

**1. 串行执行 (Sequential Execution)**

当异步任务之间存在依赖关系，或者需要严格按照顺序执行时，可以使用串行执行。这通常通过 Promise 链式调用实现。

*   **方法**: 使用 `.then()` 进行链式调用，前一个 Promise 的结果作为后一个 Promise 的输入。
*   **优点**: 顺序执行，逻辑清晰，易于理解依赖关系。
*   **缺点**: 总执行时间是所有 Promise 执行时间的总和，效率较低。

```javascript
function fetchUserData() {
  return new Promise(resolve => setTimeout(() => resolve({ id: 1, name: 'Alice' }), 1000));
}

function fetchUserOrders(userId) {
  return new Promise(resolve => setTimeout(() => resolve([`Order for ${userId}`]), 800));
}

function processOrder(order) {
  return new Promise(resolve => setTimeout(() => resolve(`Processed: ${order}`), 500));
}

fetchUserData()
  .then(user => {
    console.log('User fetched:', user);
    return fetchUserOrders(user.id); // 返回下一个 Promise
  })
  .then(orders => {
    console.log('Orders fetched:', orders);
    // 进一步处理每个订单，例如再次串行执行
    return Promise.all(orders.map(order => processOrder(order)));
  })
  .then(processedResults => {
    console.log('All orders processed:', processedResults);
  })
  .catch(error => {
    console.error('Error in sequential promise chain:', error);
  });
```
*   **错误处理**: 任何一个 `.then()` 中抛出的错误或返回的被拒绝的 Promise 都会被链中后续的 `catch()` 捕获。一个 `catch()` 可以处理整个链条上任何位置的错误。

**2. 并行执行 (Parallel Execution)**

当多个异步任务之间没有依赖关系，可以同时开始执行，并且需要等待所有任务都完成后才能进行下一步操作时，可以使用并行执行。

*   **方法**: `Promise.all()`。
*   **优点**: 效率高，总执行时间取决于最慢的那个 Promise。
*   **缺点**: **"all or nothing"**：如果其中任何一个 Promise 被拒绝，`Promise.all()` 就会立即拒绝，并返回第一个拒绝的原因，而其他 Promise 的结果将被忽略。

```javascript
const promise1 = new Promise(resolve => setTimeout(() => resolve('Value 1'), 1500));
const promise2 = new Promise(resolve => setTimeout(() => resolve('Value 2'), 1000));
const promise3 = new Promise((resolve, reject) => setTimeout(() => reject('Error 3'), 500)); // 故意制造一个错误

Promise.all([promise1, promise2, promise3])
  .then(values => {
    console.log('All promises resolved:', values);
  })
  .catch(error => {
    console.error('At least one promise rejected in Promise.all:', error); // 立即捕获到 Error 3
  });

// 另一个 Promise.all 成功示例
Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 1000)),
  new Promise(resolve => setTimeout(() => resolve(2), 500))
]).then(results => {
  console.log('All successful promises:', results); // [1, 2]
});
```

**3. 并行执行并获取所有结果 (不管成功或失败)**

当需要等待所有 Promise 都完成（无论成功或失败），并且希望获取所有 Promise 的最终状态和结果时，可以使用 `Promise.allSettled()`。

*   **方法**: `Promise.allSettled()` (ES2020)。
*   **优点**: 不会因为某个 Promise 拒绝而中断，可以获取所有 Promise 的状态和结果。
*   **缺点**: 需要遍历结果数组来判断每个 Promise 的状态。

```javascript
const promiseA = new Promise(resolve => setTimeout(() => resolve('A'), 1000));
const promiseB = new Promise((resolve, reject) => setTimeout(() => reject('B Error'), 500));
const promiseC = new Promise(resolve => setTimeout(() => resolve('C'), 1200));

Promise.allSettled([promiseA, promiseB, promiseC])
  .then(results => {
    console.log('All settled results:', results);
    // results 结构：
    // [
    //   { status: 'fulfilled', value: 'A' },
    //   { status: 'rejected', reason: 'B Error' },
    //   { status: 'fulfilled', value: 'C' }
    // ]

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index + 1} succeeded with value:`, result.value);
      } else {
        console.error(`Promise ${index + 1} failed with reason:`, result.reason);
      }
    });
  });
```

**4. 竞态 (Race Condition)**

当只需要获取最快完成（无论成功或失败）的 Promise 的结果时，可以使用 `Promise.race()`。

*   **方法**: `Promise.race()`。
*   **优点**: 快速响应，适用于需要设置超时或获取最快结果的场景。
*   **缺点**: 只能获取到第一个完成的 Promise 的结果，其他 Promise 的结果会被忽略。

```javascript
const slowPromise = new Promise(resolve => setTimeout(() => resolve('Slow Done'), 2000));
const fastPromise = new Promise(resolve => setTimeout(() => resolve('Fast Done'), 500));
const errorPromise = new Promise((resolve, reject) => setTimeout(() => reject('Timeout'), 100)); // 最快拒绝

Promise.race([slowPromise, fastPromise, errorPromise])
  .then(value => {
    console.log('The first promise resolved or rejected:', value); // 如果 errorPromise 最快，这里会打印 'Timeout' (如果是 reject)
  })
  .catch(error => {
    console.error('The first promise rejected:', error); // 如果 errorPromise 最快且是 reject，这里会捕获到 'Timeout'
  });
```

**错误处理的几种方式总结**:
*   **`.catch()`**: 处理 Promise 链中任何一个被拒绝的 Promise。它是推荐的错误处理方式。
*   **`.then(onFulfilled, onRejected)`**: `then` 方法的第二个参数也可以作为拒绝回调，但通常推荐使用独立的 `catch`，因为它能捕获到 `onFulfilled` 中可能抛出的错误，而 `then` 的第二个参数不能。
*   **`.finally()`**: 无论 Promise 成功或失败，都会执行的回调函数。常用于资源清理，不接收任何参数。
*   **`try...catch` with `async/await`**: 在 `async` 函数中使用 `try...catch` 语法来同步地捕获异步错误，使错误处理更直观。

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 `Promise.all()` 会等待所有 Promise 完成，即使有失败的。
    *   **纠正**: `Promise.all()` 是"有容乃大，一损俱损"。一旦有 Promise 拒绝，它就会立即拒绝，不会等待其他 Promise 完成。要等待所有 Promise 完成，无论成功失败，请使用 `Promise.allSettled()`。
*   **误区**: 在 Promise 链中每个 `.then()` 都写一个 `catch`。
    *   **纠正**: 这会导致重复的错误处理，并且可能无法将错误传递给更高级的统一错误处理逻辑。一个链条末尾的 `catch()` 通常足够处理整个链条的错误，因为错误会冒泡。
*   **面试陷阱**: 不了解 `Promise.allSettled()` 的作用和应用场景。
    *   **纠正**: 强调其在需要获取所有异步操作结果（无论成功失败）时的重要性，例如批量发送邮件、并行请求互不依赖的数据。
*   **误区**: 混淆 `Promise.race()` 和 `Promise.any()`。
    *   **纠正**: `Promise.race()` 只要有任何一个 Promise 完成（`fulfilled` 或 `rejected`）就会立即结束。`Promise.any()` (ES2021) 则是只要有一个 Promise `fulfilled` 就会结束，如果所有 Promise 都 `rejected` 才会 `rejected`。
*   **性能问题**: 并行执行虽然快，但也要考虑服务器并发处理能力，避免过度请求导致服务过载。对于大量并发请求，可以考虑分批处理 (batching)。

</details>

## 20. Async/await 和 promise 的关系？ {#question-subjective-3b2a0d49733f}

### 题目要点

- 理解 `async/await` 是基于 Promise 的语法糖，而不是替代品。
- 掌握 `async/await` 的基本语法和优势：同步化的异步代码、错误处理、可读性。
- 能够将 Promise 链式调用改写为 `async/await` 形式。
- 了解 `async/await` 的局限性。

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
`async/await` 是 ES2017 (ES8) 引入的异步编程语法，它们是基于 `Promise` 的**语法糖 (Syntactic Sugar)**。这意味着 `async/await` 的底层实现仍然是 `Promise`，它并没有引入新的异步机制，而是让异步代码的编写方式看起来更像是同步代码，从而提高了代码的可读性和可维护性，简化了 Promise 链的编写。

在 `async/await` 出现之前，处理多个异步操作通常需要使用回调函数（Callback Hell）或 Promise 链式调用。虽然 Promise 解决了回调地狱问题，但在处理复杂的异步流程时，Promise 链仍然可能变得冗长，阅读起来不够直观。

`async/await` 的目的正是为了解决这个问题，它使得异步代码的编写和阅读更加线性、直观，就像同步代码一样。

**核心概念**:
*   **`async` 关键字**: 用于定义一个异步函数。一个 `async` 函数总是返回一个 `Promise`。如果 `async` 函数内部返回一个非 Promise 的值，该值会被自动包装成一个已解决的 Promise。如果 `async` 函数内部抛出错误，该错误会被自动包装成一个被拒绝的 Promise。
*   **`await` 关键字**: 只能在 `async` 函数内部使用。它会暂停 `async` 函数的执行，直到其后面的 `Promise` 解决（resolved）或拒绝（rejected）。如果 `Promise` 解决了，`await` 表达式的值就是 `Promise` 的解决值；如果 `Promise` 拒绝了，`await` 表达式会抛出错误，可以被 `try...catch` 捕获。

##### 1.2 核心用法 + 示例代码

以下是 `async/await` 和 `Promise` 关系的具体体现：

**1. `async` 函数返回 Promise**

```javascript
async function myFunction() {
  return "Hello";
}

// myFunction 实际上返回一个 Promise
myFunction().then(value => {
  console.log(value); // Hello
});

async function myErrorFunction() {
  throw new Error("Something went wrong");
}

// myErrorFunction 返回一个被拒绝的 Promise
myErrorFunction().catch(error => {
  console.error(error.message); // Something went wrong
});
```

**2. `await` 等待 Promise 解决**

`await` 关键字会等待一个 Promise 完成，并获取其结果。

```javascript
function fetchData(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Fetching data for ID: ${id}`);
      resolve(`Data for ID ${id}`);
    }, 1000);
  });
}

// 使用 Promise 链式调用
fetchData(1)
  .then(data1 => {
    console.log(data1);
    return fetchData(2);
  })
  .then(data2 => {
    console.log(data2);
  })
  .catch(error => {
    console.error('Promise Error:', error);
  });

// 使用 async/await (等价于上面的 Promise 链)
async function processData() {
  try {
    const data1 = await fetchData(1); // 等待 fetchData(1) 完成
    console.log(data1);

    const data2 = await fetchData(2); // 等待 fetchData(2) 完成
    console.log(data2);

    // 模拟一个错误
    // throw new Error("Simulated error");

    return "All data processed";
  } catch (error) {
    console.error('Async/await Error:', error); // 错误会被 try...catch 捕获
    throw error; // 重新抛出，让外层的 Promise 链也能捕获
  }
}

processData().then(msg => console.log(msg)).catch(err => console.error(err.message));
```

**3. 错误处理**

`async/await` 结合 `try...catch` 语句，可以像处理同步错误一样处理异步错误，使得错误处理逻辑更加直观。

**4. 并行执行 `Promise` (结合 `Promise.all` 或 `Promise.allSettled`)**

虽然 `await` 使得代码看起来是串行执行，但我们仍然可以通过结合 `Promise.all` 或 `Promise.allSettled` 来实现并行执行。

```javascript
function fetchItem(item) {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 2000;
    setTimeout(() => {
      if (item === 'error') {
        reject(`Failed to fetch ${item}`);
      } else {
        resolve(`Fetched ${item} in ${delay.toFixed(0)}ms`);
      }
    }, delay);
  });
}

async function fetchAllItems() {
  try {
    console.log("Starting parallel fetches...");
    const results = await Promise.all([
      fetchItem('item1'),
      fetchItem('item2'),
      fetchItem('item3')
      // fetchItem('error') // 如果这里有错误，Promise.all 会立即拒绝
    ]);
    console.log("All items fetched successfully:", results);
  } catch (error) {
    console.error("Error fetching items in parallel:", error);
  }
}
fetchAllItems();

async function fetchAllItemsSettled() {
  console.log("Starting parallel fetches (settled)...");
  const results = await Promise.allSettled([
    fetchItem('settled-item1'),
    fetchItem('settled-item2'),
    fetchItem('error') // 即使有错误，也会等待所有完成
  ]);
  console.log("All items settled:", results);
  results.forEach(res => {
    if (res.status === 'fulfilled') {
      console.log("Success:", res.value);
    } else {
      console.error("Failure:", res.reason);
    }
  });
}
fetchAllItemsSettled();
```

##### 1.3 常见误区或面试陷阱
*   **误区**: 认为 `async/await` 替代了 `Promise`。
    *   **纠正**: `async/await` 是建立在 `Promise` 之上的更高层抽象，是 `Promise` 的语法糖，它使得 `Promise` 的使用更加方便。没有 `Promise`，就没有 `async/await`。
*   **误区**: 滥用 `await`，导致串行执行。
    *   **纠正**: 如果多个异步操作之间没有依赖关系，应该考虑并行执行它们（例如使用 `Promise.all()`），而不是一个接一个地 `await`，这会降低效率。
*   **面试陷阱**: 不清楚 `async` 函数内部抛出的错误如何被捕获。
    *   **纠正**: `async` 函数内部抛出的错误会被自动捕获并作为一个被拒绝的 Promise 返回，因此可以使用 `try...catch` 语句来捕获，或者在调用 `async` 函数时使用 `.catch()`。
*   **误区**: 认为 `await` 可以直接用在全局作用域。
    *   **纠正**: `await` 关键字只能在 `async` 函数内部使用。在顶级模块中使用 `await` 需要特定的环境支持（如 ES Modules 中的 Top-level await）。
*   **只字不提 Generator 函数和 Promise 的关系。**
    *   **纠正**: `async/await` 实际上是 Generator 函数和 Promise 的语法糖。Generator 函数提供了暂停和恢复执行的能力，Promise 提供了异步操作的解决方案。两者结合形成了 `async/await` 的基础。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-76/_index.md" >}}) · [第 2 轮]({{< relref "/posts/frontend/interview-experiences/experience-76/round-122/index.md" >}}) →
