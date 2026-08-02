+++
title = "滴滴-社招-2年 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "滴滴", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/57"
experienceId = 57
roundId = 90
roundOrder = 1
company = "滴滴"
date = "2025-07-28T02:28:18.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-57/round-89/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-57/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** WebWorker、Canvas 和 SVG

本轮共 10 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍，项目介绍 {#question-subjective-ee1b2317997f}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 2. 为什么选择Vue3+TS而非React {#question-subjective-5057de803a73}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 3. 你们用的是什么脚手架，脚手架的基本原理了解么 {#question-subjective-d894c5540f67}

### 题目要点

* 脚手架是提升工程效率、统一规范的工具
* 底层通过 Node.js 实现文件复制、模板注入、命令执行
* 常用工具：Vue CLI、CRA、Vite、自研 CLI（基于 Plop、Yeoman）
* 企业通常自研脚手架实现快速初始化、统一配置和组件生成
* 掌握核心原理（模板渲染、交互、文件操作）有助于二次开发

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望了解你是否具备工程化思维<br>
- 是否熟悉当前项目所用的脚手架工具及其底层实现原理<br>
- 是否理解脚手架在项目初始化、规范约定、自动化等方面的作用<br>
- 是否具备定制或维护脚手架的能力<br>

---

### 参考答案

#### 一、常用脚手架工具及我们团队的选择

我们项目主要使用的是：

- **Vue 项目**：使用 `@vue/cli`、`vite` 或公司自研的内部模板系统
- **React 项目**：早期使用 `create-react-app`，后续迁移为 `Vite + 自定义模板`<br>
- **自研脚手架**：基于 `Plop.js`、`Yeoman`、`Commander` 或 `create-*` 实现，通过 Node.js 实现项目初始化、目录结构生成、依赖安装、git 初始化等功能

#### 二、脚手架的核心功能

- **初始化项目结构**（生成项目目录和基础文件）<br>
- **注入标准化配置**（eslint、prettier、commitlint、husky、tsconfig等）<br>
- **自动安装依赖**（npm/yarn/pnpm install）<br>
- **选择模板和功能模块**（用户选择功能特性，动态生成对应模块）<br>
- **自定义交互式命令行（CLI）**（使用 inquirer 等库实现配置选择）<br>
- **生成代码片段/组件**（如 `plop generate component`）

#### 三、脚手架的实现原理

脚手架本质上是基于 Node.js 脚本，通过命令行交互完成初始化和代码生成，主要原理包括：

- **文件模板引擎**：如 EJS、Handlebars，将用户输入注入模板，动态生成文件
- **文件系统操作**：如 `fs-extra` 创建文件夹、复制模板、写入内容
- **命令行交互**：如 `inquirer` 获取用户输入，决定生成逻辑
- **执行系统命令**：如 `child_process.spawn()` 执行 `git init`、`npm install`
- **模块化组织**：每种模板或功能模块作为一个插件独立维护，可组合可扩展

示例脚手架代码简化：
```js
const inquirer = require('inquirer');
const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');

async function init() {
  const answers = await inquirer.prompt([
    { name: 'projectName', message: '项目名称？' },
    { name: 'useTypeScript', type: 'confirm', message: '是否使用 TypeScript？' },
  ]);

  const templateDir = path.resolve(__dirname, 'templates');
  const targetDir = path.resolve(process.cwd(), answers.projectName);

  await fs.copy(templateDir, targetDir);

  // 替换模板变量
  const pkgPath = path.join(targetDir, 'package.json');
  const content = await fs.readFile(pkgPath, 'utf-8');
  const result = ejs.render(content, { projectName: answers.projectName });
  await fs.writeFile(pkgPath, result);
}

init();
````

#### 四、团队为何自研脚手架

* 提高初始化效率，统一开发规范
* 内置企业级配置（如私有 npm 源、CI/CD 脚本、权限管理模板等）
* 避免重复工作，提高开发一致性和可维护性
* 可集成 UI 工程、服务端 Node 脚手架、监控配置等组件

</details>

## 4. ESLint做了哪些规范，有没有自定义规则 {#question-subjective-82344726bf4a}

### 题目要点

* ESLint 通过规则检查保障代码质量与规范性
* 常用规则体系：Recommended、Airbnb、TypeScript、Vue/React、Prettier
* 项目中结合 lint-staged + husky 实现提交前检查
* 支持自定义规则（基于 AST 实现）以满足项目特定约束
* 实践中需注意规则优先级、团队协作一致性、格式类交由 Prettier 管控

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望确认你是否了解 ESLint 在项目质量控制中的作用
- 是否掌握常见的 ESLint 规则体系（如 Airbnb、Standard、Prettier 结合）
- 是否参与过规则的定制与团队代码风格约束
- 是否具备通过 AST 编写自定义 ESLint 规则的能力

---

### 参考答案

#### 一、ESLint 的核心作用

- **统一团队代码风格**（如缩进、引号、分号等）
- **捕捉潜在的代码错误和反模式**（如未使用变量、异步未处理）
- **在CI流程中强制规范，避免低质量代码入库**
- **配合Prettier实现格式和语义的双重控制**

---

#### 二、我们项目中的 ESLint 规范体系

项目采用如下配置策略：

- **继承社区标准规则**：
  - `eslint:recommended`
  - `plugin:vue/recommended` 或 `plugin:react/recommended`
  - `@typescript-eslint/recommended`（TS 项目）
  - `plugin:prettier/recommended`（配合 Prettier）

- **统一代码风格**：
  - 使用双引号 `"quotes": ["error", "double"]`
  - 必须使用 `const` 优先（如 `"prefer-const"`）
  - 禁止未使用变量（如 `"no-unused-vars"`）
  - 箭头函数强制一致的括号风格 `"arrow-parens": ["error", "always"]`

- **强制代码安全和性能实践**：
  - 禁止直接修改 props（Vue 项目） `"vue/no-mutating-props"`
  - 禁止 `eval` 使用 `"no-eval": "error"`
  - 禁止直接调用 `setTimeout(fn, 0)`（改用 `requestIdleCallback`）

- **CI集成**：
  - 配合 `lint-staged` + `husky` 实现 **提交前自动格式化校验**
  - CI 阶段执行 `eslint . --ext .js,.ts,.vue` 保障上线前质量

---

#### 三、自定义 ESLint 规则经验

我们项目中根据业务特性自定义过 ESLint 规则，例如：

##### ✅ 自定义规则示例：禁止直接使用 `console.log`

```js
// eslint-rules/no-console-log.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止使用 console.log',
    },
    fixable: null,
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.name === 'console' &&
          node.property.name === 'log'
        ) {
          context.report({
            node,
            message: '禁止使用 console.log，请使用 logger 封装方法',
          });
        }
      },
    };
  },
};
````

##### 配置方式：

```js
// .eslintrc.js
module.exports = {
  rules: {
    'no-console-log': 'error',
  },
  plugins: ['eslint-plugin-custom'], // 自定义插件
};
```

> 自定义规则本质上是通过遍历 AST 抽象语法树，拦截特定语法结构并报错或警告。

---

### 四、实践注意点

* 使用 **Prettier 统一格式类规则**，避免与 ESLint 冲突
* 在多人协作项目中，应使用 `.editorconfig` + `.eslintrc` + `.prettierrc` 组合统一风格
* **避免过度规则化**：过严可能阻碍开发；推荐使用 `warn` 而非 `error` 起步
* 若规则冲突，应优先保证一致性与可维护性，兼顾团队习惯和框架约定

</details>

## 5. 动态表单中的JSON Schem是如何设计的 {#question-subjective-893dc63984b1}

### 题目要点

- JSON Schema 定义表单结构与校验逻辑
- 可映射 UI 组件、校验规则，实现配置化动态表单
- 支持嵌套结构、数组字段、联动配置等复杂场景
- 前后端协作中，schema 可作为统一契约，支持版本控制

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望确认你是否理解 **JSON Schema 在动态表单系统中的核心作用**
- 是否具备通过 JSON Schema 建模的能力（字段类型、校验规则、组件映射）
- 是否有设计或使用基于 JSON Schema 的动态表单系统的经验
- 是否了解前后端协作、低代码、配置驱动的表单能力

---

### 参考答案

#### 一、核心原理说明：为什么用 JSON Schema 表达表单结构

- JSON Schema 是一种 **结构化数据定义语言**，本质上用来描述数据格式（字段、类型、校验、嵌套等）。
- 在动态表单中，JSON Schema 起到**模型驱动（model-driven）**的作用，能够从结构层表达 UI 组件的渲染内容。
- 优势：
  - 结构清晰、通用性强、可用于前后端传输
  - 可根据 schema 自动生成 UI（借助渲染引擎）
  - 易于存储、版本控制、权限控制

---

#### 二、JSON Schema 的基础结构

一个典型的动态表单 JSON Schema 长这样：

```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "title": "用户名",
      "minLength": 3,
      "maxLength": 20
    },
    "age": {
      "type": "number",
      "title": "年龄",
      "minimum": 0,
      "maximum": 100
    },
    "gender": {
      "type": "string",
      "enum": ["male", "female"],
      "title": "性别"
    }
  },
  "required": ["username", "age"]
}
````

* `type`: 当前 schema 的类型，通常为 `object`
* `properties`: 各字段定义
* 每个字段的定义包含 `title`（label）、`type`（数据类型）、校验规则（minLength 等）
* `required`: 必填字段

---

#### 三、如何扩展 JSON Schema 表达组件信息

标准 JSON Schema 是无 UI 概念的，动态表单通常会扩展如下：

```json
{
  "type": "string",
  "title": "邮箱",
  "ui:widget": "email",
  "ui:placeholder": "请输入邮箱地址",
  "ui:rules": [
    { "required": true, "message": "必填" },
    { "pattern": "^[\\w.-]+@[\\w.-]+\\.\\w+$", "message": "邮箱格式错误" }
  ]
}
```

* `"ui:widget"`：映射组件，如 `input`、`select`、`date`、`switch` 等
* `"ui:rules"`：配合组件库（如 Element、AntD）指定校验规则
* `"ui:*"`：属于 UI 配置部分，不影响后端字段校验

---

#### 四、复杂结构的 Schema 表达能力

1. **嵌套字段**：

```json
{
  "type": "object",
  "properties": {
    "address": {
      "type": "object",
      "title": "地址",
      "properties": {
        "province": { "type": "string", "title": "省份" },
        "city": { "type": "string", "title": "城市" }
      }
    }
  }
}
```

2. **数组类型字段（如动态增加联系人）**：

```json
{
  "type": "array",
  "title": "联系人",
  "items": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "title": "姓名" },
      "phone": { "type": "string", "title": "电话" }
    }
  }
}
```

---

#### 五、Schema 驱动表单的渲染流程（简要描述）

1. **前端 JSON Schema 解析器**将 schema 转换为渲染组件树
2. 每个字段通过 `type + ui:widget` 映射到对应组件
3. 表单值通过 `v-model` / `state` 实时绑定 schema 对应字段
4. 校验规则可基于 schema 自动生成

---

#### 六、与后端协作的典型模式

* 前端动态表单系统仅负责“渲染 +收集 + 校验”，schema 可由后端存储并管理版本
* 可支持“表单配置平台”，使非开发者通过 UI 拖拽方式生成 schema
* 表单结果与 schema 可做强类型校验（例如后端校验）

---

### 常见误区与陷阱

* ❌ 将 JSON Schema 当成单纯的“静态模板”，忽略其动态能力（如联动、条件字段）
* ❌ 直接写嵌套 JSON 结构，导致 schema 可读性差、难维护
* ❌ 忽略了 UI 表达能力（需配合组件库扩展字段）

</details>

## 6. 表单联动校验问题是如何解决的 {#question-subjective-7ec54e0014d4}

### 题目要点

- 表单联动校验指字段值变更影响其他字段的显示、可用性、校验规则
- 关键是定义字段之间的依赖关系，并在变更时触发联动更新
- 校验规则应动态设置，可使用响应式框架实现联动机制
- 隐藏字段需清理值并移除校验，避免表单提交失败
- 常见实现方式：配置式依赖、响应式监听、第三方库能力

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望确认你是否理解 **动态表单中字段之间的联动与校验机制**
- 是否有能力设计和实现可维护、可扩展的联动规则系统
- 是否能分析 **联动字段更新/重置/校验触发的时机与机制**
- 是否了解 Vue/React 等框架下响应式系统如何帮助联动逻辑实现

---

### 参考答案

#### 一、什么是表单联动校验

表单联动校验是指：

- **字段 A 的值发生变化，字段 B 的可见性、选项、校验规则等跟着联动更新**
- 常见场景：
  - 下拉框选择“是”后，出现一个额外字段
  - 地区选择后，联动城市字段
  - 用户类型为“企业”时，要求填写“企业名称”，否则不校验该字段

---

#### 二、联动机制的设计关键点

1. **依赖声明方式**

   - 在 schema 中显式声明字段间依赖（推荐做法）<br>
     ```json
     {
       "type": "string",
       "title": "公司名称",
       "ui:visibleIf": {
         "userType": "company"
       },
       "ui:rulesIf": {
         "userType": "company"
       }
     }
     ```
   - 或通过配置规则函数：
     ```js
     visible: (formData) => formData.userType === 'company'
     ```

2. **值变化后，触发依赖字段更新**

   - 当某字段值变更时，遍历依赖该字段的其他字段：
     - 判断是否需要显示/隐藏
     - 判断是否需要重新设置校验规则
     - 判断是否需要清空旧值或初始化新值

3. **配合响应式系统自动触发 UI 更新**

   - Vue：使用 `computed` / `watch` 监听依赖字段变化
   - React：使用 `useEffect` + `form.getFieldValue()` 订阅字段变化

---

#### 三、动态表单联动校验的实现方式（以 Vue 为例）

```vue
<template>
  <form>
    <select v-model="form.userType">
      <option value="person">个人</option>
      <option value="company">企业</option>
    </select>

    <input v-if="isCompany" v-model="form.companyName" required />
  </form>
</template>

<script setup>
import { computed, reactive } from 'vue'

const form = reactive({
  userType: 'person',
  companyName: ''
})

const isCompany = computed(() => form.userType === 'company')
</script>
````

* `isCompany` 是一个联动条件
* 隐藏字段 `companyName` 时，常见做法：

  * 清空 `companyName` 字段值
  * 移除其必填校验

---

#### 四、常见校验规则联动方案

1. **动态设置规则（规则随依赖变化）**

   ```js
   const rules = computed(() => {
     return {
       companyName: form.userType === 'company'
         ? [{ required: true, message: '必填' }]
         : []
     }
   })
   ```

2. **第三方表单库中的支持**

   * `react-jsonschema-form`：依赖字段变化时自动重新校验
   * `vue-formily / vue3-form`：提供 `dependencies`、`effect` 等联动机制
   * `vee-validate / yup`：通过 Schema 转换实现条件性校验规则

---

#### 五、注意事项与边界处理

* **字段隐藏时应自动清空值并跳过校验**
* **避免出现循环依赖字段链（A 依赖 B，B 又依赖 A）**
* **联动逻辑应配置化，避免硬编码在页面逻辑中**
* **如果异步依赖（如根据用户ID加载选项），要处理 loading 状态与兜底值**

---

### 常见误区

* ❌ 忽视字段被隐藏后仍参与校验，导致提交失败
* ❌ 将联动逻辑写在业务组件内，造成耦合混乱
* ❌ 对异步依赖处理不全，出现“选项未加载”问题
* ❌ 未处理联动时值重置逻辑，旧值遗留带来风险

</details>

## 7. 抽象8类数据组件的原则是什么？举例说明一下 {#question-subjective-b6a4ae04157c}

### 题目要点

略

<details>
<summary>参考答案</summary>

略

</details>

## 8. 针对大量数据的渲染，Web Workers是怎么优化的 {#question-subjective-feae08e1e6e0}

### 题目要点

- 大数据渲染容易造成主线程阻塞，影响 FPS、交互响应
- Web Worker 可用于将耗时计算任务放到独立线程中处理
- Worker 不能访问 DOM，适合配合虚拟滚动、分页等前端方案使用
- Worker 与主线程通过 postMessage 通信，有序列化/异步限制
- 常见使用场景包括表格、图表、地图、Excel 解析等数据密集型场景

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望了解你是否掌握前端中 **大数据量渲染** 的性能瓶颈与优化手段<br>
- 是否理解 Web Worker 的工作原理以及其适合处理的任务类型<br>
- 能否结合项目实际说明 Web Worker 在前端性能优化中的作用<br>
- 能否识别主线程阻塞和 UI 卡顿之间的联系，并给出对应的拆分方案<br>

---

### 参考答案

#### 一、为什么大量数据渲染会卡顿？

在前端渲染大数据时（如：渲染10万条表格数据、做复杂图表、处理日志/报表等），主要会出现以下问题：

- **主线程阻塞**：浏览器的 UI 渲染、JS 执行、用户交互都在主线程中进行<br>
- **数据处理耗时长**：如排序、聚合、过滤、转格式等，JS 处理大数据本身就慢<br>
- **渲染任务重**：DOM 大量更新、节点重复创建，触发频繁重排重绘<br>

这些问题最终会导致：

- 页面卡顿、白屏、UI 不响应<br>
- 滚动卡顿，交互延迟<br>

---

#### 二、Web Worker 是什么？如何优化这些问题？

**Web Worker** 是浏览器提供的线程机制，允许 JS 脚本在后台线程中运行，从而不阻塞主线程。

适合用于处理：

- 复杂或大数据量的 **计算任务**
- **异步化** 数据转换、排序、预处理
- 与主线程通信以实现**数据预处理 + 主线程渲染解耦**

##### 使用方式示例：

主线程：
```js
const worker = new Worker('worker.js')
worker.postMessage(largeData) // 传入数据

worker.onmessage = (event) => {
  renderToDOM(event.data) // 主线程负责渲染
}
````

worker.js：

```js
self.onmessage = (e) => {
  const processed = heavyCompute(e.data) // 大量计算
  self.postMessage(processed) // 发送回主线程
}
```

---

#### 三、如何配合虚拟列表、分页渲染等方案使用？

Web Worker **只负责数据处理**，不涉及 DOM。主线程可以：

* 接收到 Worker 处理后的数据，再结合虚拟滚动组件渲染（如：vue-virtual-scroller、react-window）
* 处理后的数据分页传入 UI，减少每一帧渲染负担

---

#### 四、常见项目使用场景

* 渲染万级别以上的数据表格
* 实时图表中的数据预计算
* 地图场景中复杂点位聚合（如 geo clustering）
* 实时日志/报表处理
* Excel 大数据量导入前的数据转换（如 xlsx 文件转 JSON）

---

#### 五、注意事项与边界问题

* **Worker 与主线程之间通信是异步的**，通过`postMessage()`传值（需序列化）
* **不能操作 DOM**，只适合数据逻辑计算
* 在高频操作中通信开销不能忽视（特别是传大量数据）
* 主线程仍需合理使用虚拟列表、分批渲染等机制

</details>

## 9. 为什么选用Canvas分层而非SVG {#question-subjective-14867387a007}

### 题目要点

- SVG 基于 DOM，适合小型静态图形；Canvas 基于像素渲染，适合高性能大图渲染<br>
- Canvas 分层可以减少全图重绘，按需渲染不同内容，提高性能<br>
- 分层结构如：背景层、图形层、交互层，互不影响<br>
- 典型应用场景包括地图、白板、大屏、实时图形渲染等<br>
- SVG 易操作但性能差；Canvas 控制强但复杂，需结合业务场景选型

<details>
<summary>参考答案</summary>

### 考察点

- 面试官希望了解你对 Canvas 与 SVG 渲染原理和性能差异的理解<br>
- 是否能从“分层渲染”、“性能瓶颈”、“重绘开销”等角度进行技术选型<br>
- 能否结合具体业务场景，说明 Canvas 分层相较 SVG 的优势和适用场景<br>

---

### 参考答案

#### 一、Canvas 与 SVG 的基本区别

| 特性             | Canvas                                  | SVG                                     |
|------------------|------------------------------------------|------------------------------------------|
| 渲染方式         | 基于像素点的**位图渲染**                 | 基于**DOM + 矢量图形**的结构化渲染      |
| 事件绑定         | 需要手动计算命中区域                     | 可以直接给元素绑定事件                  |
| 适合场景         | 高性能绘图（游戏、粒子系统、动画）       | 图表、图形编辑器、结构化图形展示        |
| 更新成本         | 需要**整体重绘**                         | 只需更新对应 DOM 节点                   |
| 复杂场景下性能   | 表现更优，**可控性高**                    | DOM 节点多时**性能下降严重**             |

---

#### 二、为什么在复杂渲染中使用 Canvas 分层而不是 SVG？

##### 1. **SVG 在复杂场景下性能劣化严重**

- SVG 每一个图形都是 DOM 元素，当图形数达到上千级别时，页面存在大量 DOM 节点，**操作和重绘性能急剧下降**
- CSS 操作、交互绑定、样式计算都会随 DOM 增多而变慢

##### 2. **Canvas 的像素级渲染，适合“分层缓存 + 局部刷新”**

- 使用多层 `<canvas>`，将不同图层内容（如背景层、图形层、文字层、交互层）独立渲染在不同 canvas 上：
  - 背景层：一次绘制静态背景，避免每次重绘
  - 图形层：仅在图形变化时更新
  - UI层 / 选中态层：只渲染交互时内容

  通过这种方式能有效 **避免全部重绘**，提升渲染性能

##### 3. **粒度可控 + 支持离屏渲染**

- Canvas 可以配合 **离屏Canvas（OffscreenCanvas）** 或 **缓存 Canvas**，将复杂计算或绘制在后台完成，提高流畅性<br>
- Canvas 可按需渲染 + 手动控制刷新节奏，更适合动态场景（如动画、大图拖拽、实时画布）

---

#### 三、使用Canvas分层的具体优势

- **减轻主绘制层负担**：多个 canvas 独立渲染，互不干扰<br>
- **减少无效重绘区域**：如拖动时只重绘动态层，背景层不动<br>
- **提升帧率与性能**：避免每帧都操作整个 DOM 或主 canvas<br>
- **增强用户体验**：拖动、绘制等更流畅，避免卡顿<br>

---

#### 四、适合Canvas分层的典型业务场景

- 大屏数据可视化系统<br>
- 地图系统（点位、覆盖物、轨迹等分层）<br>
- 在线白板、绘图系统<br>
- 游戏场景、动态效果控制<br>
- 高密度图形编辑工具（如连线图、流程图）<br>

---

#### 五、常见误区和注意点

- Canvas 并非总比 SVG 好：**结构化图形**、需要频繁交互绑定的图表工具，SVG 更方便<br>
- Canvas 缺少 DOM 的语义化、无障碍支持，**可访问性较差**<br>
- Canvas 分层时需注意层级逻辑、事件穿透处理，可能需手动计算命中区域进行事件响应

</details>

## 10. 实现 debounce（防抖）函数 {#question-c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c}

> 题库原题：[实现 debounce（防抖）函数](https://fe.ecool.fun/topic/c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c)

### 题目要点

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

<details>
<summary>参考答案</summary>

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

```js
const debounce = (fn, time) => {
  let timeout = null;
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
};

```

防抖常应用于用户进行搜索输入节约请求资源，window触发resize事件时进行防抖只触发一次。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-57/round-89/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-57/_index.md" >}}) · 已是最后一轮 →
