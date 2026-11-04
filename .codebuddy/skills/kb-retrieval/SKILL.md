---
name: kb-retrieval
description: 检索本仓库沉淀的开发经验 / 踩坑笔记。当用户遇到构建报错、依赖管理、CI/CD、GitLab、CocoaPods、迁移、调试、安全扫描等工程化问题，或提到「之前踩过坑 / 之前记录过 / 查一下经验库」时，先用 kb 检索再回答。
---

# 开发经验知识库检索

本仓库沉淀了大量开发经验笔记（绿联工作笔记、依赖迁移、CI/CD、CocoaPods、LFS、安全扫描等踩坑记录）。在回答工程化 / 踩坑类问题前，先检索知识库，避免重复踩坑。

## 使用方法

通过环境变量 KB_HOME 调用 LastStand 的 kb 内核（需在 shell 中 export KB_HOME）：

```bash
# 检索（中英文均可，按空格分词，多词为「与」关系）
python3 "$KB_HOME/scripts/kb.py" search "GitLab LFS"
python3 "$KB_HOME/scripts/kb.py" search "CocoaPods 私有源"

# 查看某篇命中笔记的全文（id 来自 search 结果的 [id]）
python3 "$KB_HOME/scripts/kb.py" show <id>

# 按标签浏览
python3 "$KB_HOME/scripts/kb.py" tags --tag 凭证
```

## 工作流程

1. 用户描述一个工程问题（构建失败、依赖冲突、迁移、CI 报错、调试等）。
2. 提取 1-3 个关键术语，运行 `python3 "$KB_HOME/scripts/kb.py" search "<术语>"`。
3. 若命中，用 `python3 "$KB_HOME/scripts/kb.py" show <id>` 读取全文，把其中的解决方案 / 命令 / 注意事项纳入你的回答。
4. 若无命中，`kb` 会明确提示「知识库无相关记录」，此时按通用知识正常回答，不要臆造知识库内容。

## 注意事项

- 索引是本地增量生成的（`kb.db`，gitignore）。首次使用或索引缺失时，`search` 会自动 `build`。
- 如需纳入更多文章，编辑仓库根目录 `kb.toml` 的 `include_categories` / `include_tags`。
- 添加 / 修改笔记后，git commit / pull 会通过 hook 自动重建索引；也可手动 `python3 "$KB_HOME/scripts/kb.py" build`。
