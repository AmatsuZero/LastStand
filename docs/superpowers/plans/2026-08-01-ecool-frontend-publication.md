# ECool frontend 发布与 master 合并实施计划

> 设计依据：`docs/superpowers/specs/2026-08-01-ecool-frontend-publication-design.md`

## 约束

- 功能分支：`codex/ecool-interview-import`
- 合并目标：本地 `master`
- 正式内容根：`content/posts/frontend/`
- 保留 `scripts/ecool`、测试、catalog、报告和历史迁移文档。
- 不推送远端。
- 先在功能分支提交并验收，合并后再次验收，最后才清理 worktree/分支。

## Task 1：更新路径与发布状态契约

**修改：**

- `scripts/ecool/model.test.mjs`
- `scripts/ecool/importer.test.mjs`

**步骤：**

1. 将文章路径期望改为 `content/posts/frontend/<category>/<slug>/index.md`。
2. 将文章、根栏目和分类栏目 frontmatter 期望改为 `draft = false`。
3. 将 importer 安全、恢复和并发测试中的临时目标路径统一改为新根目录。
4. 运行 ECool 测试，确认旧实现因路径或草稿状态不符而失败。

## Task 2：更新可复用迁移工具

**修改：**

- `scripts/ecool/model.mjs`
- `scripts/ecool/importer.mjs`

**步骤：**

1. `buildFrontmatter()` 默认生成 `draft = false`。
2. `articleRelativePath()` 输出 `content/posts/frontend/...`。
3. 根栏目与分类栏目生成器输出新目录并生成 `draft = false`。
4. 运行 ECool 全套测试，直到新契约全部通过。

## Task 3：移动正式内容并同步记录

**移动：**

- `content/posts/interview/ecool/` → `content/posts/frontend/`

**修改：**

- `content/posts/frontend/**/index.md`
- `content/posts/frontend/**/_index.md`
- `scripts/ecool/import-report.json`
- `docs/superpowers/specs/2026-07-31-ecool-interview-materials-design.md`
- `docs/superpowers/plans/2026-07-31-ecool-interview-materials.md`
- `docs/superpowers/plans/2026-08-01-ecool-frontend-publication.md`

**步骤：**

1. 移动前记录 1,087 张本地图片的相对 bundle 路径与 SHA-256，并记录 191 篇文章和 11 个栏目的 Markdown 基线。
2. 移动完整目录，确保旧目录消失且图片随 page bundle 一起移动。
3. 把 191 个文章 `index.md` 和 11 个栏目 `_index.md` 的 `draft = true` 改为 `draft = false`；断言恰好修改 202 个文件。
4. 以去掉旧根/新根前缀的路径比较移动前后清单：图片 SHA-256 必须一致；Markdown 除路径移动与 frontmatter 的 `draft` 行外，其他字节必须一致。
5. 更新导入报告中的 6 个文章路径。
6. 在两份历史文档开头增加最终发布说明，指向 2026-08-01 设计；保留原过程描述不变。
7. 搜索旧路径与 `draft = true`，只允许历史过程正文中保留旧描述，不允许工具、测试、报告或正式内容残留旧默认值。

## Task 4：功能分支验收与提交

**验证：**

1. `node --test scripts/ecool/*.test.mjs`
2. Hugo 非草稿构建：`hugo --minify`
3. 内容审计：
   - 新目录 191 篇文章、11 个栏目、1,087 张本地图片；
   - 旧目录不存在；
   - 202 个 Markdown 文件全部 `draft = false`；
   - 分类计数与 catalog/report 一致；
   - 相对图片全部存在、6 个外链例外仍在报告中；
   - 无路径越界、本机绝对路径、UI chrome 或未闭合围栏。
4. 独立 reviewer/verifier 审查改动和证据。
5. 运行 `git diff --check`。
6. 仅暂存本任务文件（包括本实施计划）。
7. 运行 `git diff --cached --check`。
8. 提交已暂存改动。
9. 以 `git merge-base master HEAD` 动态得到基线并运行 `git diff --check <merge-base>..HEAD`。
10. 确认功能 worktree 干净。

## Task 5：合并到 master 并复验

**前置检查：**

1. 记录功能 worktree、Git common dir 和分支状态。
2. 确认 `/Users/samzhjiang/Github/LastStand` 位于 `master` 且工作树干净。
3. 确认 `content/posts/frontend/` 在 master 不存在，功能分支以 master 为基线且无意外分叉。

**合并与验证：**

1. 在主工作树执行非交互快进合并 `git merge --ff-only codex/ecool-interview-import`；如果无法快进则停止并保留现场。不执行 `git pull` 或远程推送，因为用户只授权本地合并且当前任务不需要网络更新。
2. 在合并后的 master 重跑 Task 4 的测试、Hugo 和内容审计。
3. 失败则保留 worktree 和功能分支并修复；不得宣称完成。
4. 全部通过且确认功能 worktree 干净后，从主工作树移除精确路径 `.worktrees/ecool-interview-import`，运行 `git worktree prune`，最后用 `git branch -d codex/ecool-interview-import` 删除已合并分支；不得使用强制删除，任一步失败都保留现场并报告。
5. 报告 master 最终提交、验证结果和未推送状态。
