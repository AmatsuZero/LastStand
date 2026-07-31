# ECool 面试资料 Markdown 迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ECool“面试资料”栏目中的 10 个分类、191 篇静态知识页忠实转换为带分类、标签和本地图片的 Hugo Markdown 草稿。

**Architecture:** 使用 Chrome 登录态逐页选择 Ant Design 知识树节点；浏览器侧只读取 DOM 并生成结构化 AST，Node 侧负责可测试的 Markdown 渲染、frontmatter、原子写入和验收。任务按单篇样例、20 篇批次和最终全量校验推进，并在 `.omc/state/` 保存断点状态。

**Tech Stack:** Chrome browser-client、Node.js 26 内置模块与 `node:test`、Hugo 0.164、TOML frontmatter

## Global Constraints

- 只使用当前 Chrome 登录态，不读取 Cookie、密码、本地存储或认证令牌。
- 只处理 `https://fe.ecool.fun/knowledge-learn` 的“面试资料”知识树，不进入 `/topic/...` 刷题页面。
- 新增文章一律 `draft = true`，不推送、不发布、不修改现有面试文章。
- 正文包含主文章和“常见考点”，排除“关联面试题”、导航、VIP 标记、难度控件和页脚。
- 浏览器每次切换页面后必须核对 `#info-title` 与清单标题一致。
- 首篇样例通过 Node 测试和 `hugo --minify --buildDrafts` 后才允许全量运行。
- 全量运行每批最多 20 篇，并在批次之间向用户报告进度。

---

## File Structure

- `scripts/ecool/model.mjs`：分类映射、slug、frontmatter、目标路径和目录清单校验。
- `scripts/ecool/model.test.mjs`：元数据与路径单元测试。
- `scripts/ecool/markdown.mjs`：将浏览器返回的块级/行内 AST 渲染为 Markdown。
- `scripts/ecool/markdown.test.mjs`：标题、列表、表格、代码、图片和链接渲染测试。
- `scripts/ecool/browser-extractor.mjs`：知识树读取、节点选择、DOM 转 AST、图片资产归档。
- `scripts/ecool/importer.mjs`：批处理、原子写入、断点状态与栏目索引生成。
- `scripts/ecool/importer.test.mjs`：使用临时目录测试写入、跳过、冲突和恢复行为。
- `scripts/ecool/verify-import.mjs`：全量数量、frontmatter、正文、代码围栏和图片引用检查。
- `scripts/ecool/catalog.json`：从页面读取的 191 项稳定清单与顺序。
- `scripts/ecool/import-report.json`：最终成功、跳过、失败和图片统计。
- `.omc/state/ecool-import.json`：运行期断点文件，不纳入最终提交。
- `content/posts/interview/ecool/`：来源栏目、10 个分类栏目和 191 个 page bundle。

### Task 1: 元数据模型与路径规则

**Files:**
- Create: `scripts/ecool/model.mjs`
- Create: `scripts/ecool/model.test.mjs`

**Interfaces:**
- Produces: `CATEGORY_CONFIG`, `slugify(title, fallback)`, `buildFrontmatter(record)`, `articleRelativePath(record)`, `validateCatalog(entries)`。
- Consumes: 设计文档中的 10 类映射和 191 篇数量约束。

- [ ] **Step 1: 写失败测试**

使用 `node:test` 覆盖以下确定行为：

```js
assert.equal(slugify('React 生命周期', 'react-001'), 'react-lifecycle');
assert.equal(slugify('call、apply和bind', 'javascript-020'), 'call-apply-bind');
assert.equal(slugify('数据类型', 'javascript-001'), 'javascript-001');
assert.equal(articleRelativePath({ category: 'JavaScript', slug: 'javascript-001' }),
  'content/posts/interview/ecool/javascript/javascript-001/index.md');
assert.match(buildFrontmatter(sample), /draft = true/);
assert.match(buildFrontmatter(sample), /tags = \["面试", "前端", "JavaScript"/);
assert.throws(() => validateCatalog([{ category: '未知', title: 'x' }]), /未知分类/);
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test scripts/ecool/model.test.mjs`

Expected: FAIL，原因是 `model.mjs` 尚不存在或导出未定义。

- [ ] **Step 3: 实现最小模型**

实现固定分类表；中文或无法稳定音译的标题必须使用 `<category>-NNN` fallback，英文标题转小写 kebab-case。TOML 字符串必须转义反斜杠和双引号；`date`、`lastmod` 固定补 `T00:00:00+08:00`；每篇增加标题细分 tag 与 `source`。

- [ ] **Step 4: 运行测试并检查格式**

Run: `node --test scripts/ecool/model.test.mjs && git diff --check`

Expected: PASS，且无空白错误。

- [ ] **Step 5: 提交任务**

```bash
git add scripts/ecool/model.mjs scripts/ecool/model.test.mjs
git commit -m "feat: add ecool interview metadata model" \
  -m "Constraint: Preserve deterministic paths for 191 imported pages
Confidence: high
Scope-risk: narrow"
```

### Task 2: 可测试的 Markdown 渲染器

**Files:**
- Create: `scripts/ecool/markdown.mjs`
- Create: `scripts/ecool/markdown.test.mjs`

**Interfaces:**
- Consumes: 浏览器侧生成的 `BlockNode[]`，行内节点类型为 `text|code|strong|em|del|link|image|br`，块节点类型为 `heading|paragraph|blockquote|list|code|table|image|hr`。
- Produces: `renderMarkdown(blocks)` 和 `normalizeMarkdown(markdown)`。

- [ ] **Step 1: 写失败测试**

建立一个同时包含二级标题、嵌套列表、引用、JavaScript 代码块、表格、外链和图片的 AST fixture，并断言：

```js
assert.match(markdown, /^## 前言/m);
assert.match(markdown, /```javascript\nconst value = 1;\n```/);
assert.doesNotMatch(markdown, /复制|react-syntax-highlighter-line-number/);
assert.match(markdown, /\| 名称 \| 说明 \|/);
assert.match(markdown, /!\[示意图\]\(image-01\.jpeg\)/);
assert.ok(markdown.endsWith('\n'));
assert.ok(!markdown.endsWith('\n\n'));
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test scripts/ecool/markdown.test.mjs`

Expected: FAIL，原因是渲染器尚不存在。

- [ ] **Step 3: 实现 AST 渲染**

标题按原层级输出，正文最高从 `##` 开始；行内反引号根据内容自动选择长度；代码围栏长度必须大于代码中连续反引号长度；表格单元格转义 `|`；图片只引用归档后的相对文件名；连续空行压缩为一行。

- [ ] **Step 4: 运行 Markdown 测试**

Run: `node --test scripts/ecool/markdown.test.mjs`

Expected: PASS。

- [ ] **Step 5: 提交任务**

```bash
git add scripts/ecool/markdown.mjs scripts/ecool/markdown.test.mjs
git commit -m "feat: render ecool article AST as markdown" \
  -m "Constraint: Preserve code, tables, links, and local image references
Confidence: high
Scope-risk: moderate"
```

### Task 3: 浏览器提取器与单篇样例

**Files:**
- Create: `scripts/ecool/browser-extractor.mjs`
- Create: `scripts/ecool/catalog.json`
- Create: `content/posts/interview/ecool/javascript/javascript-001/index.md`
- Create: `content/posts/interview/ecool/javascript/javascript-001/image-01.jpeg` and other images observed on the sample page

**Interfaces:**
- Produces: `readCatalog(tab)`, `selectEntry(tab, entry)`, `extractCurrentArticle(tab)`, `archiveCurrentImages(tab, record, articleDirectory)`。
- Consumes: `tab` from Chrome browser-client、`renderMarkdown()`、`model.mjs` 路径与 frontmatter 接口。

- [ ] **Step 1: 实现知识树清单读取**

在一次只读 `tab.playwright.evaluate()` 中读取 `.ant-tree-node-content-wrapper`。一级节点用深度 `0` 建立分类上下文，叶子节点记录 `treeIndex`、标题文本、分类、分类内 `weight`、VIP 标记。将结果交给 `validateCatalog()`，必须得到 10 类、191 项和设计文档中的逐类数量。

- [ ] **Step 2: 实现稳定节点选择与页面校验**

对 `.ant-tree-node-content-wrapper` 先 `count()` 并确认等于清单生成时的节点总数，再使用已确认的 `treeIndex` 定位叶子并点击。点击后等待 `#info-title` 可见，并读取其文本；不等于目标标题时抛出 `PAGE_TITLE_MISMATCH`，禁止写文件。

- [ ] **Step 3: 实现 DOM 到 AST**

仅处理 `contentBox` 的前两个 `articleBox`：第一个的 `.markdown-body` 与第二个 `#test-points + .markdown-body`。排除第三个 `#related-questions`。DOM walker 必须覆盖设计中的行内/块级类型；读取代码时跳过 `.linenumber` 和复制按钮，语言来自 `code.className` 的 `language-*`；图片节点只返回 URL 与语义 alt，不读取认证状态。

- [ ] **Step 4: 用 pageAssets 归档样例图片**

调用当前 tab 的 `pageAssets.list()`，仅匹配 AST 中实际引用的图片 URL，再用同一 inventory 的 `bundle({assetIds})` 下载。按出现顺序命名 `image-01.<ext>`，复制进样例 page bundle，并把 AST URL 替换为相对文件名。任何失败写入样例报告并使任务失败。

- [ ] **Step 5: 写入“JavaScript / 数据类型”样例**

样例必须包含主正文与“常见考点”，不得包含“关联面试题”“复制”“VIP题目”“最近更新时间：”等网页 UI 文本；创建时间进入 `date`，更新时间进入 `lastmod`。

- [ ] **Step 6: 验证样例**

Run:

```bash
node --test scripts/ecool/model.test.mjs scripts/ecool/markdown.test.mjs
rg -n '关联面试题|VIP题目|复制|react-syntax-highlighter' content/posts/interview/ecool/javascript/javascript-001/index.md
hugo --minify --buildDrafts
```

Expected: Node 测试 PASS；`rg` 无匹配；Hugo 构建成功且生成样例页面。

- [ ] **Step 7: 提交任务**

```bash
git add scripts/ecool/browser-extractor.mjs scripts/ecool/catalog.json content/posts/interview/ecool/javascript/javascript-001
git commit -m "feat: extract first ecool interview article" \
  -m "Constraint: Sample-first gate before full migration
Confidence: medium
Scope-risk: moderate"
```

### Task 4: 批处理、断点续跑与栏目索引

**Files:**
- Create: `scripts/ecool/importer.mjs`
- Create: `scripts/ecool/importer.test.mjs`
- Create: `.omc/state/ecool-import.json` (runtime only)
- Create: `content/posts/interview/ecool/_index.md`
- Create: `content/posts/interview/ecool/{javascript,css,html,react,vue,network,performance,security,es6,engineering}/_index.md`

**Interfaces:**
- Produces: `runBatch({tab, root, catalog, start, limit})`, `writeArticleAtomically(root, record)`, `writeSectionIndexes(root, catalog)`。
- Consumes: Tasks 1-3 exports and page-assets bundling results。

- [ ] **Step 1: 写失败测试**

使用 `fs.mkdtemp()` 创建临时根目录，断言：首次写入成功；相同 checksum 可安全跳过；不同内容遇到既有文件抛出 `TARGET_CONFLICT`；临时文件写入完成后才 rename；恢复状态不会重复覆盖已完成文章。

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test scripts/ecool/importer.test.mjs`

Expected: FAIL，原因是 importer 尚不存在。

- [ ] **Step 3: 实现原子写入与断点状态**

每篇先写同目录唯一临时文件，再 rename 为 `index.md`；成功后记录标题、路径、正文 SHA-256、图片数和完成时间。只在 checksum 相同时跳过；冲突和失败均保留错误详情，不删除用户文件。

- [ ] **Step 4: 实现栏目索引**

根 `_index.md` 使用 `title = "ECool 前端面试资料"`、`draft = true`、`weight = -90`；10 个分类 `_index.md` 使用映射后的标题、固定 tags/categories 和来源说明，分类顺序与原站一致。

- [ ] **Step 5: 运行 importer 测试**

Run: `node --test scripts/ecool/importer.test.mjs`

Expected: PASS，测试临时目录自动清理。

- [ ] **Step 6: 提交任务**

```bash
git add scripts/ecool/importer.mjs scripts/ecool/importer.test.mjs content/posts/interview/ecool/_index.md content/posts/interview/ecool/*/_index.md
git commit -m "feat: add resumable ecool import batches" \
  -m "Constraint: Limit browser batches to 20 pages and never overwrite conflicts
Confidence: high
Scope-risk: moderate"
```

### Task 5: 全量 191 篇迁移

**Files:**
- Create: `content/posts/interview/ecool/<category>/<slug>/index.md` for the remaining 190 articles
- Create: article-local image assets as referenced
- Create: `scripts/ecool/import-report.json`

**Interfaces:**
- Consumes: `runBatch()` and the validated `catalog.json`。
- Produces: 191 completed records and zero failures。

- [ ] **Step 1: 按 20 篇批次运行**

每次浏览器调用最多处理 20 篇；批次完成后读取 `.omc/state/ecool-import.json`，报告 `完成/191`、当前分类、图片数与失败数。若登录失效、验证码、标题错配或浏览器中断，立即停止该批次并保留状态。

- [ ] **Step 2: 处理失败清单**

对每个失败项重新定位当前知识树并只重试一次；必须使用原 `treeIndex + title` 双重校验。第二次仍失败则停止全量验收，不生成成功结论。

- [ ] **Step 3: 生成最终导入报告**

`scripts/ecool/import-report.json` 必须包含逐类期望数/成功数、总成功 191、跳过数、失败数组、图片成功/失败数和开始/结束时间；最终 `failures` 与 `imageFailures` 必须为空。

- [ ] **Step 4: 提交全量内容**

```bash
git add content/posts/interview/ecool scripts/ecool/import-report.json
git commit -m "content: import ecool frontend interview library" \
  -m "Constraint: Keep all 191 imported pages as drafts
Confidence: medium
Scope-risk: broad"
```

### Task 6: 自动验收与独立复核

**Files:**
- Create: `scripts/ecool/verify-import.mjs`
- Modify only if verification finds migration defects: files under `scripts/ecool/` or `content/posts/interview/ecool/`

**Interfaces:**
- Consumes: catalog、导入报告和实际 page bundles。
- Produces: 非零退出码表示任何数量、元数据、正文、资源或噪声检查失败。

- [ ] **Step 1: 实现验证脚本**

验证以下不变量：10 个分类；191 个文章 `index.md`；逐类数量精确匹配；路径唯一；TOML 包含 title/date/lastmod/draft/weight/tags/categories/source；`draft = true`；正文不少于 200 个非空字符；不含 UI 噪声；代码围栏成对；每个相对图片存在；无本机绝对路径；导入报告失败数组为空。

- [ ] **Step 2: 运行完整自动验证**

Run:

```bash
node --test scripts/ecool/*.test.mjs
node scripts/ecool/verify-import.mjs
git diff --check
hugo --minify --buildDrafts
git status --short
```

Expected: 所有测试 PASS；验证脚本报告 `10 categories / 191 articles / 0 failures`；Hugo 成功；Git 状态只包含本任务计划范围内文件。

- [ ] **Step 3: 使用独立 verifier 复核**

验证者只读检查清单、随机抽取每类至少一篇与来源页面对照、确认正文边界和图片引用，并复跑 Task 6 Step 2 的命令。作者不得在同一审查通道自批准。

- [ ] **Step 4: 修复并重新验证**

若 verifier 发现问题，只修改 `scripts/ecool/` 或 `content/posts/interview/ecool/`，然后完整重跑 Step 2 和 Step 3，直到零失败。

- [ ] **Step 5: 提交验证工具或修复**

```bash
git add scripts/ecool/verify-import.mjs scripts/ecool content/posts/interview/ecool
git commit -m "test: verify ecool interview migration" \
  -m "Constraint: Require exact catalog coverage and Hugo draft rendering
Confidence: high
Scope-risk: narrow"
```
