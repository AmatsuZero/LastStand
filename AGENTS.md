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
- 安装自动重建 hook：`python3 "$KB_HOME/scripts/kb.py" init`（commit / pull 后自动增量重建索引）。
