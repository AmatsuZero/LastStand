# ECool 前端资料发布与 master 合并设计

## 目标

将已验收的 191 篇 ECool 前端面试资料从临时迁移位置发布到 Hugo 的正式前端栏目，并把完整迁移能力合并到 `master`。

最终内容根目录为：

```text
content/posts/frontend/
```

所有文章、栏目页和分类页均公开发布，不再保留草稿状态。

## 内容结构

现有 `content/posts/interview/ecool/` 整体移动为 `content/posts/frontend/`，内部结构保持不变：

```text
content/posts/frontend/
├── _index.md
├── javascript/
├── css/
├── html/
├── react/
├── vue/
├── network/
├── performance/
├── security/
├── es6/
└── engineering/
```

每篇文章继续使用 Hugo page bundle：`<slug>/index.md` 与本地图片放在同一目录。图片是页面资源，不会成为独立文章。`content/posts/frontend/` 内只保留 Hugo 展示所需的栏目页、文章和图片。

旧目录不会保留副本或重定向。它从未进入 `master` 或正式发布，因此没有需要兼容的公开旧 URL。

## 发布状态

- 191 篇文章的 `draft` 全部改为 `false`。
- 根 `_index.md` 与 10 个分类 `_index.md` 的 `draft` 全部改为 `false`。
- 标题、日期、更新时间、权重、标签、分类、来源、正文和图片引用保持不变。
- 已确认源站失效的 6 张外部图片继续保留原始外链和报告记录，不伪造本地内容。

## 可复用迁移工具

以下内容全部保留并随分支合并：

- `scripts/ecool/` 下的抓取、转换、断点导入、测试、catalog 和导入报告。
- 原迁移设计与实施计划，作为历史过程记录。
- 新增本设计作为最终发布决策记录。

工具的正式默认行为同步调整：

- 新文章路径输出到 `content/posts/frontend/<category>/<slug>/index.md`。
- 新文章和新栏目默认生成 `draft = false`。
- 栏目索引写入 `content/posts/frontend/`。
- 测试、导入报告路径和恢复校验同步使用新目录。

原 2026-07-31 设计和计划保留其当时的 `draft = true` 与临时路径描述，不做全局改写；在文件开头增加最终发布说明，指向本设计，避免未来把历史约束误当成当前默认行为。

## Hugo 范围

本次新增和移动的 Hugo 内容只位于 `content/posts/frontend/`。站点仍照常处理整个 `content/`；迁移脚本、测试、catalog、报告和设计文档位于 `scripts/` 或 `docs/`，不会进入文章列表或生成无用页面，因此不需要额外 Hugo ignore 配置。

## 实施与合并

1. 在 `codex/ecool-interview-import` worktree 中先更新测试，覆盖新路径与公开状态。
2. 更新路径模型、栏目生成器、报告和历史文档发布说明。
3. 使用 Git 感知的移动把内容根目录改为 `content/posts/frontend/`，批量将 191 个文章 `index.md` 和 11 个栏目 `_index.md` 的 `draft` 改为 `false`。
4. 验证旧目录不存在、新目录内容计数准确、图片引用与签名不变。
5. 运行 ECool 全套测试、`git diff --check`、非草稿 Hugo 构建。
6. 提交工具更新、内容移动和发布状态改动，并确认功能 worktree 干净。
7. 合并前确认 `master` 工作树干净、`master` 是预期基线、目标目录不存在冲突，再在本地主仓库合并迁移分支；不执行远程推送。
8. 在合并后的 `master` 再运行测试、内容审计和 Hugo 构建；仅在全部通过后清理 worktree 和功能分支。

## 验收标准

- `master` 包含且只包含一个 ECool 内容根：`content/posts/frontend/`。
- 10 个分类、191 篇文章、1,087 张本地图片和 6 个已记录外部例外保持完整。
- 191 个文章 `index.md` 和 11 个栏目 `_index.md` 均为 `draft = false`。
- `scripts/ecool` 后续导入默认写入新目录并生成公开内容。
- ECool 测试、完整 diff 检查、内容审计和 Hugo 非草稿构建全部通过。
- `master` 合并后工作树干净；不自动推送远端。
