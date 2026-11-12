# AGENTS / 项目协作指引

本仓库是开发经验博客（Hugo），沉淀了大量踩坑笔记。

## 遇到工程化问题时先检索知识库

在回答以下类型的问题前，**先检索本地知识库**，避免重复踩坑：

- 构建报错、依赖管理（CocoaPods / Gradle / SwiftPM / Nexus / PackageRegistry）
- CI/CD、GitLab、GitLab Runner、Jenkins、LFS
- 迁移、调试（debug）、故障排查
- 安全扫描（Semgrep / SAST / SCA / SBOM）
- 用户提到「之前踩过坑 / 之前记录过 / 查一下经验库」

### 检索方式

```bash
# 检索（中英文均可，空格分词，多词为「与」）
python3 "$KB_HOME/scripts/kb.py" search "GitLab LFS"
python3 "$KB_HOME/scripts/kb.py" search "CocoaPods 私有源"

# 查看命中笔记全文（id 来自 search 结果的 [id]）
python3 "$KB_HOME/scripts/kb.py" show <id>

# 按标签浏览
python3 "$KB_HOME/scripts/kb.py" tags --tag 凭证
```

### 流程

1. 从用户问题提取 1-3 个关键术语，运行 `python3 "$KB_HOME/scripts/kb.py" search`。
2. 命中后用 `python3 "$KB_HOME/scripts/kb.py" show <id>` 读全文，把解决方案 / 命令 / 注意事项纳入回答。
3. 无命中时，`kb` 会提示「知识库无相关记录」，按通用知识正常回答，不要臆造。

### 备注

- 索引 `kb.db` 为本地生成（gitignore），首次或缺失时 `search` 会自动构建。
- 纳入范围由根目录 `kb.toml` 的 `include_categories` / `include_tags` 控制。
- 安装自动重建 hook：`python3 "$KB_HOME/scripts/kb.py" init`（实际触发条件与验证方法见下文）。

## 新增与修订经验文章

- 写回时机：确认了可复用的成因与恢复方法，或发现会影响实现的 API/测量契约后，在当前修复验证完成、进入下一独立子任务或结束本轮交接前写回，不等待整个功能完成。未证实的猜测先留在任务台账，不写成知识库结论。
- 先检索去重：已有同一结论时复用原文；新增关键边界或反例时修订原文，独立问题再新增文章。主代理负责完成沉淀，helper 的台账或建议不等于已写回。
- 完成凭据：在任务台账或交接中保留文章路径、本地 commit 和 commit 后的检索结果；若写回受阻，列出具体待写结论与阻塞。无新增可复用经验时无需凑文章。
- 路径使用 `content/posts/ugreen-notes/<slug>/index.md`，沿用正文的现象、已验证成因、有效恢复、边界、证据结构，并对公开仓库内容脱敏。
- 经验文章默认保留为草稿，未经明确要求不要发布。使用以下 YAML front matter；Hugo 同时支持 TOML，但当前 `scripts/kb.py` 的解析器仅识别 `---` 包围的 YAML，不要直接改成 TOML。

```yaml
---
title: "经验文章标题"
date: 2026-11-10T10:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建"]
---
```

- `date` 使用真实撰写时间及明确时区，不得晚于当前时间；上面的时间仅为格式示例。标签从 `kb.toml` 的纳入范围选取。
- 用 `hugo server --buildDrafts` 验证文章 URL 和「绿联工作笔记」栏目列表；`--buildDrafts` 包含草稿，未来时间另受 `--buildFuture` 控制，不要靠开启后者掩盖误填时间。
- 首页按栏目聚合，栏目文章自动分页列出；新增草稿不必出现在首页，也不要把草稿链接加入生产可见的手写目录。还应确认普通 `hugo` 构建不生成草稿页。
- 写完后仅暂存本轮文章及约定文件，执行本地 commit，保留其他人的改动；不要只留下大量未跟踪文章。push 是单独的远端同步/发布动作，不是本地索引生效的前提。
- `kb.db` 是被 Git 忽略的本地生成物，索引纳入范围不按 `draft` 过滤，草稿也可被经验检索使用。已安装且生效的 `post-commit` 在 commit 后重建，`post-merge` 在合并后重建（包括产生合并或快进的 pull）。仅 fetch、push、无需更新的 pull 或 rebase 路径不保证触发这些钩子。
- 钩子未安装、被 `core.hooksPath` 改道，或尚未 commit 时，执行 `python3 "$KB_HOME/scripts/kb.py" build`。已有索引不会在每次 search 时自动刷新；缺失时才自动构建。钩子为避免阻断 Git 会忽略构建失败，commit 后仍需检索新文章确认命中。
- 索引更新回归：`python3 -m unittest discover -s scripts -p test_kb.py`，覆盖已索引草稿修改、移出纳入范围以及真实 commit 钩子；不要仅用空数据库首建成功判断增量更新可用。
