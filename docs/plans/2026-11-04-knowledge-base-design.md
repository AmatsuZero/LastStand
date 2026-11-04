# 开发经验知识库 / 检索系统设计

- 日期：2026-11-04
- 状态：设计已确认，待实现

## 1. 背景与目标

本仓库（Hugo 博客）沉淀了 645 篇开发经验文章，涵盖绿联工作笔记（GitLab 迁移、CocoaPods、LFS 等踩坑）、前端、AI Agent 算法、Cocos、Electron、MCP 等。

日常使用 AI 工具（**codex / codebuddy / cursor CLI**）时，经常重复踩到已经记录过的坑。目标：建立一套**可被任意 AI 工具检索的知识库**，让 AI 在「遇到相关问题时先检索一遍经验」，避免重复踩坑。

设计原则：**工具无关的内核 + 各工具薄适配层**；YAGNI，不预支向量检索等复杂度。

## 2. 整体架构

```
content/posts/**/*.md ──build(增量)──▶ kb.db (SQLite FTS5)
                                          │
 codebuddy skill  ┐                        │ search
 codex AGENTS.md  ├──── kb search ────────┘
 cursor rules    ┘         │
                     命中片段 → 注入 AI 上下文
```

- **内核**：单文件 `scripts/kb.py`（Python 标准库，零第三方依赖），负责建索引 + 检索。
- **适配层**：给三个工具各写一段轻量规则，告诉模型「遇到某类问题时先跑 `kb search`」。

## 3. 索引构建（build）

- 遍历 `content/posts`，纳入范围由 `kb.toml` 配置（默认聚焦踩坑/经验类：含「绿联工作笔记」分类，以及迁移/踩坑/debug/故障 等标签；可后续扩展）。
- 每篇文章解析：
  - frontmatter（`---` 块手动解析，避开 PyYAML 依赖）→ `title / date / categories / tags`
  - 提取 `## / ###` 标题 + 正文首段作为摘要
- 写入 `kb.db` 的 **FTS5 全文虚拟表**，标题、标签、正文均可被检索。
- **增量索引**：以「文件路径 + mtime + 内容哈希」为缓存键，仅重新索引新增/改动的文件；首建几秒，后续毫秒级。
- `kb.db` **gitignore，仅本地**；提供 `kb build` 随时重建。

## 4. 检索 CLI（search）

- `kb search "<关键词>"` → FTS5 匹配，返回 Top-N：`标题 / 相对路径 / 标签 / 命中片段`。
- `kb show <id>` → 输出某篇全文，供 AI 深入读取。
- `kb list --tag <tag>` → 按标签浏览。
- 纯文本/markdown 输出，任意工具可读。
- 兜底：`search` 时若 `kb.db` 不存在，自动先 `build` 再搜。

## 5. 各工具适配（触发）

- **CodeBuddy**：`.codebuddy/skills/kb-retrieval/SKILL.md`，描述写明「遇到依赖迁移 / 构建报错 / 踩坑类问题时自动调用 `kb search`」；可加 `/kb` 命令。
- **Codex / Cursor CLI**：仓库根 `AGENTS.md`（Cursor 也读），写规则：「遇到 build / 依赖 / 迁移 / debug 类问题，先 `python3 scripts/kb.py search "<关键词>"`，把命中内容纳入回答。」
- 三个入口都指向同一个 `kb` CLI，维护点唯一。

## 6. 自动重建时机

- 本地 git `post-commit` hook：commit 添加/修改笔记后自动 `kb build`。
- `post-merge` hook：`git pull` 拉到他人新增笔记后自动重建。
- 首次 clone/pull 后由 hook 或兜底逻辑自动生成 `kb.db`。

## 7. 错误处理

- `kb.db` 缺失 → 提示/自动 `build`。
- 无命中 → 明确告知「知识库无相关记录」，不臆造。

## 8. 测试验证

- 运行 `kb build`，确认 `kb.db` 生成、文章数符合预期。
- 用已知踩坑验证命中：`kb search "GitLab LFS"`、`kb search "CocoaPods"` 应能返回对应文章。
- 在 codebuddy / codex / cursor 中分别触发一次检索，确认适配规则生效。

## 9. 后续可选增强（非 MVP）

- AI 批量生成「问题现象 / 报错 / 解决思路」结构化字段，提升命中语义。
- 叠加向量语义检索（RAG）。
- 将同一内核包成 MCP Server，支持更多客户端自动发现。
