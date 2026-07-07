# 面试题全量迁移到 Hugo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/Users/jiangzhenhua/Tencent/awesome-ios-interview/articles/` 下约 157 篇 Markdown 文章迁移到 Hugo 站的 `content/posts/interview/` 目录，按新分类体系重组，自动生成 TOML frontmatter。

**Architecture:** 编写 Python 迁移脚本，遍历源目录所有 `.md` 文件，根据源路径映射到 Hugo page bundle 目录结构，自动提取标题、生成 slug、添加 frontmatter、创建 `_index.md` 导航页。

**Tech Stack:** Python 3 + Hugo page bundle + TOML frontmatter

---

## 分类映射表

### 目录映射 (源路径 → 目标路径)

| 源路径模式 | 目标目录 | slug 规则 |
|-----------|---------|----------|
| `ai/*.md` | `content/posts/interview/ai/<slug>/` | 文件名去扩展名去特殊字符 |
| `ai/openclaw/*.md` | `content/posts/interview/ai/openclaw-<slug>/` | 去 `OpenClaw源码导读-` 前缀 |
| `ios-basics/*.md` | `content/posts/interview/ios-basics/<slug>/` | 文件名去扩展名去特殊字符 |
| `ios-advanced/包瘦身/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去 `包瘦身-` 前缀 |
| `ios-advanced/启动优化/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去 `启动优化-` 前缀 |
| `ios-advanced/卡顿/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去 `卡顿-` 前缀 |
| `ios-advanced/耗电/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去 `耗电-` 前缀 |
| `ios-advanced/崩溃/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去 `崩溃-` 前缀 |
| `ios-advanced/死锁/*.md` | `content/posts/interview/ios-performance/<slug>/` | 文件名去目录名前缀 |
| `ios-advanced/编译优化/*.md` | `content/posts/interview/ios-build/<slug>/` | 文件名去 `编译优化-` 前缀 |
| `ios-advanced/architecture/*.md` | `content/posts/interview/ios-architecture/<slug>/` | 文件名去扩展名，转小写 |
| `ios-advanced/CocoaPods/*.md` | `content/posts/interview/ios-source-analysis/cocoapods-<slug>/` | 文件名去 `CocoaPods源码导读-` 前缀 |
| `ios-advanced/三方库源码/*.md` | `content/posts/interview/ios-source-analysis/<slug>/` | 文件名去 `源码导读` 后缀 |
| `ios-advanced/design-patterns/*.md` | `content/posts/interview/ios-design/patterns/<slug>/` | 文件名去 `模式` 后缀 |
| `ios-advanced/design-principles/*.md` | `content/posts/interview/ios-design/principles/<slug>/` | 文件名去 `原则`/`法则` 后缀 |
| `ios-advanced/cross-platform/*.md` | `content/posts/interview/ios-cross-platform/<slug>/` | 文件名去扩展名 |
| `ios-advanced/APM/*.md` | `content/posts/interview/ios-apm/<slug>/` | 文件名去扩展名 |
| `ios-advanced/<standalone>/*.md` | `content/posts/interview/ios-advanced/<slug>/` | 文件名去扩展名 |

### categories 和 tags 映射

| 源路径关键词 | categories | 附加 tags |
|-------------|-----------|----------|
| `ai/` | `['AI', '面试']` | `['AI', 'LLM', '面试']` |
| `ios-basics/` | `['iOS开发', '面试']` | `['iOS', '面试', '基础']` |
| 包瘦身 | `['iOS开发', '性能优化']` | `['iOS', '性能优化', '包瘦身']` |
| 启动优化 | `['iOS开发', '性能优化']` | `['iOS', '性能优化', '启动']` |
| 卡顿 | `['iOS开发', '性能优化']` | `['iOS', '性能优化', '卡顿']` |
| 耗电 | `['iOS开发', '性能优化']` | `['iOS', '性能优化', '耗电']` |
| 崩溃 | `['iOS开发', '性能优化', '稳定性']` | `['iOS', '性能优化', '稳定性', '崩溃']` |
| 死锁 | `['iOS开发', '多线程']` | `['iOS', '多线程', '死锁']` |
| 编译优化 | `['iOS开发', '工程化']` | `['iOS', '工程化', '编译']` |
| architecture | `['iOS开发', '架构']` | `['iOS', '架构']` |
| CocoaPods | `['iOS开发', '源码分析']` | `['iOS', '源码分析', 'CocoaPods']` |
| 三方库源码 | `['iOS开发', '源码分析']` | `['iOS', '源码分析']` |
| design-patterns | `['设计模式', '面试']` | `['设计模式', '面试']` |
| design-principles | `['设计原则', '面试']` | `['设计原则', '面试']` |
| cross-platform | `['跨平台', '面试']` | `['跨平台', '面试']` |
| APM | `['iOS开发', 'APM']` | `['iOS', 'APM', '监控']` |
| standalone (音视频/Instruments等) | `['iOS开发', '面试']` | `['iOS', '面试']` |

### 文件名到 title 的映射

- 移除 `.md` 扩展名
- 将目录名前缀（如 `包瘦身-`）用全称替换（如 `包瘦身 - `）
- 保留原始中文标题

### 图片处理

- 源文件中的图片引用（如 `images/isa_graph.png`）需要更新为相对路径 `../images/isa_graph.png`（因为文章中多了 `index.md` 一层）
- 图片文件复制到对应 article bundle 目录

---

## 任务列表

### Task 1: 创建迁移脚本

**Files:**
- Create: `scripts/migrate-interviews.py`

- [ ] **Step 1: 编写完整迁移脚本**

```python
#!/usr/bin/env python3
"""将 awesome-ios-interview 文章迁移到 Hugo page bundle 格式"""

import os
import re
import shutil
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import OrderedDict

SOURCE = Path(os.path.expanduser("~/Tencent/awesome-ios-interview/articles"))
TARGET = Path(os.path.expanduser("~/Github/last-stand/content/posts/interview"))
SOURCE_REPO = Path(os.path.expanduser("~/Tencent/awesome-ios-interview"))


def get_git_date(filepath: Path) -> str:
    """获取文件的 git 最后修改日期，失败则返回今天"""
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ai", "--", str(filepath)],
            cwd=str(SOURCE_REPO),
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            dt_str = result.stdout.strip()
            # Format: 2025-06-15 10:30:00 +0800
            return dt_str.replace(" ", "T").replace(" +0800", "+08:00").replace(" -", "-")
    except Exception:
        pass
    return datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00")


def slugify(filename: str, prefix: str = "") -> str:
    """从文件名生成 URL 安全的 slug"""
    name = filename.replace(".md", "")
    # 移除目录前缀
    if prefix and name.startswith(prefix):
        name = name[len(prefix):]
    # 去特殊字符，保留字母数字和中文
    name = re.sub(r'[^\w\u4e00-\u9fff-]', '-', name)
    name = re.sub(r'-+', '-', name).strip('-')
    return name if name else "untitled"


def extract_title(filepath: Path) -> str:
    """从 markdown 提取一级标题"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('# '):
                    return line[2:].strip()
    except Exception:
        pass
    return filepath.stem


# 目录映射定义
DIR_MAPPING = OrderedDict([
    # (源相对路径模式, 目标相对路径, categories, tags, 标题前缀去除, 子目录slug处理)
    ("ai/openclaw", "ai", ['AI', '面试'], ['AI', 'LLM', '面试', 'OpenClaw'], "OpenClaw源码导读-", "openclaw-"),
    ("ai", "ai", ['AI', '面试'], ['AI', 'LLM', '面试'], "", ""),
    ("ios-basics", "ios-basics", ['iOS开发', '面试'], ['iOS', '面试', '基础'], "", ""),
    ("ios-advanced/包瘦身", "ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '包瘦身'], "包瘦身-", ""),
    ("ios-advanced/启动优化", "ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '启动'], "启动优化-", ""),
    ("ios-advanced/卡顿", "ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '卡顿'], "卡顿-", ""),
    ("ios-advanced/耗电", "ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '耗电'], "耗电-", ""),
    ("ios-advanced/崩溃", "ios-performance", ['iOS开发', '性能优化', '稳定性'], ['iOS', '性能优化', '稳定性', '崩溃'], "崩溃-", ""),
    ("ios-advanced/死锁", "ios-performance", ['iOS开发', '多线程'], ['iOS', '多线程', '死锁'], "死锁-", ""),
    ("ios-advanced/编译优化", "ios-build", ['iOS开发', '工程化'], ['iOS', '工程化', '编译'], "编译优化-", ""),
    ("ios-advanced/architecture", "ios-architecture", ['iOS开发', '架构'], ['iOS', '架构'], "", ""),
    ("ios-advanced/CocoaPods", "ios-source-analysis", ['iOS开发', '源码分析'], ['iOS', '源码分析', 'CocoaPods'], "CocoaPods源码导读-", "cocoapods-"),
    ("ios-advanced/三方库源码", "ios-source-analysis", ['iOS开发', '源码分析'], ['iOS', '源码分析'], "源码导读", ""),
    ("ios-advanced/design-patterns", "ios-design/patterns", ['设计模式', '面试'], ['设计模式', '面试'], "模式", ""),
    ("ios-advanced/design-principles", "ios-design/principles", ['设计原则', '面试'], ['设计原则', '面试'], "", ""),
    ("ios-advanced/cross-platform", "ios-cross-platform", ['跨平台', '面试'], ['跨平台', '面试'], "", ""),
    ("ios-advanced/APM", "ios-apm", ['iOS开发', 'APM'], ['iOS', 'APM', '监控'], "APM-", ""),
])


def get_mapping(filepath: Path) -> tuple:
    """根据源路径获取映射信息"""
    rel = filepath.relative_to(SOURCE)
    rel_str = str(rel).replace("\\", "/")

    for pattern, target_dir, categories, tags, strip_prefix, sub_slug in DIR_MAPPING.items():
        if rel_str.startswith(pattern + "/") or rel_str.startswith(pattern + "."):
            filename = os.path.basename(rel_str)
            if rel_str.startswith(pattern + "/"):
                slug_base = slugify(filename, strip_prefix)
            else:
                # Single file in directory
                slug_base = slugify(filename, strip_prefix)
            if sub_slug:
                slug_base = sub_slug + slug_base
            return target_dir, categories, tags, slug_base

    # 兜底: ios-advanced 下的独立文件
    if "ios-advanced" in rel_str:
        target_dir = "ios-advanced"
        categories = ['iOS开发', '面试']
        tags = ['iOS', '面试']
        slug_base = slugify(os.path.basename(rel_str), "")
        return target_dir, categories, tags, slug_base

    # 最终兜底
    return "misc", ['面试'], ['面试'], slugify(os.path.basename(rel_str), "")


def copy_images(source_file: Path, target_dir: Path):
    """复制源文件相关的图片到目标目录"""
    source_dir = source_file.parent
    # 查找同级或子目录的图片
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']:
        for img in source_dir.rglob(f'*{ext}'):
            rel = img.relative_to(source_dir)
            target_img = target_dir / rel
            target_img.parent.mkdir(parents=True, exist_ok=True)
            if not target_img.exists():
                shutil.copy2(str(img), str(target_img))
                print(f"  Copied image: {rel}")


def fix_image_paths(content: str) -> str:
    """修复文章内的相对图片路径（从 index.md 往上一级）"""
    # 将 images/xxx.png 替换为 ../images/xxx.png
    # 匹配 markdown 图片语法和 HTML img 标签
    def replacer(match):
        prefix = match.group(1)  # ![alt](
        path = match.group(2)
        suffix = match.group(3)  # )
        # 如果已经是 ../ 或 http 开头，不修改
        if path.startswith('../') or path.startswith('http'):
            return match.group(0)
        return f'{prefix}../{path}{suffix}'

    content = re.sub(r'(!\[.*?\]\()([^)http][^)]*)(\))', replacer, content)
    content = re.sub(r'(<img[^>]*src=")([^"http][^"]*)(")', replacer, content)
    return content


def generate_frontmatter(title: str, date: str, categories: list, tags: list, weight: int) -> str:
    """生成 TOML frontmatter"""
    cats = str(categories).replace("'", '"')
    tgs = str(tags).replace("'", '"')
    return f"""+++
title = "{title}"
date = '{date}'
draft = false
weight = {weight}
tags = {cats}
categories = {tgs}
+++"""


def write_article(source_file: Path, target_dir: Path, title: str, date: str,
                  categories: list, tags: list, weight: int):
    """写入单个文章"""
    target_dir.mkdir(parents=True, exist_ok=True)

    # 读取源内容
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除第一行的 # Title（已经提取为 frontmatter title）
    lines = content.split('\n')
    if lines and lines[0].startswith('# '):
        content = '\n'.join(lines[1:]).lstrip('\n')

    # 修复图片路径
    content = fix_image_paths(content)

    # 生成 frontmatter
    fm = generate_frontmatter(title, date, categories, tags, weight)

    # 写入 index.md
    target_file = target_dir / "index.md"
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(fm + "\n" + content)

    print(f"  Created: {target_file.relative_to(TARGET)}")

    # 复制图片
    copy_images(source_file, target_dir)


def generate_section_index(target_section: Path, title: str, description: str,
                           categories: list, tags: list, articles: list = None):
    """生成 _index.md 导航页"""
    fm = generate_frontmatter(title, datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00"),
                              categories, tags, -100)
    content = f"{fm}\n\n{description}\n\n"

    if articles:
        content += "## 文章列表\n\n"
        for article_path in sorted(articles):
            name = article_path.name if article_path.is_dir() else article_path.stem
            rel = f"./{article_path.name}/" if article_path.is_dir() else f"./{article_path.name}"
            content += f"- [{name}]({rel})\n"

    target_section.mkdir(parents=True, exist_ok=True)
    index_file = target_section / "_index.md"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Created section index: {index_file.relative_to(TARGET.parent)}")


def main():
    print("=" * 60)
    print("Interview Article Migration Script")
    print("=" * 60)

    # 清理旧目录（如果存在）
    if TARGET.exists():
        print(f"\nRemoving existing target: {TARGET}")
        shutil.rmtree(TARGET)

    TARGET.mkdir(parents=True, exist_ok=True)

    # 遍历所有 markdown 文件
    weight_counter = {}
    stats = {"total": 0, "skipped": 0, "created": 0}

    for root, dirs, files in os.walk(SOURCE):
        # 跳过 images 目录
        dirs[:] = [d for d in dirs if d != 'images']

        for file in sorted(files):
            if not file.endswith('.md'):
                continue

            source_file = Path(root) / file
            stats["total"] += 1

            # 跳过非文章文件
            if file in ['README.md', 'CATALOG.md', '_index.md']:
                stats["skipped"] += 1
                continue

            # 获取映射信息
            target_rel_dir, categories, tags, slug = get_mapping(source_file)
            target_dir = TARGET / target_rel_dir / slug

            # 计算 weight
            section_key = target_dir.parent
            if section_key not in weight_counter:
                weight_counter[section_key] = 1
            else:
                weight_counter[section_key] += 1

            # 提取标题
            title = extract_title(source_file)
            date = get_git_date(source_file)

            print(f"\n[{stats['total']}] {source_file.relative_to(SOURCE)}")
            print(f"  → {target_dir.relative_to(TARGET.parent)}")

            write_article(source_file, target_dir, title, date, categories, tags,
                         weight_counter[section_key])
            stats["created"] += 1

    # 生成各级 _index.md
    print("\n" + "=" * 60)
    print("Generating section index pages...")
    print("=" * 60)

    section_configs = [
        ("interview", "面试专题", "iOS 和 AI 面试题知识库", ['面试'], ['面试', 'iOS', 'AI']),
        ("interview/ai", "AI 面试", "AI/LLM 相关面试题", ['AI', '面试'], ['AI', 'LLM', '面试']),
        ("interview/ios-basics", "iOS 基础", "iOS 基础面试题", ['iOS开发', '面试'], ['iOS', '面试', '基础']),
        ("interview/ios-performance", "性能优化", "iOS 性能优化面试题 - 启动/卡顿/耗电/崩溃/包瘦身/死锁", ['iOS开发', '性能优化'], ['iOS', '性能优化']),
        ("interview/ios-build", "编译工程", "iOS 编译优化面试题", ['iOS开发', '工程化'], ['iOS', '工程化', '编译']),
        ("interview/ios-architecture", "架构设计", "iOS 架构设计面试题", ['iOS开发', '架构'], ['iOS', '架构']),
        ("interview/ios-source-analysis", "源码分析", "iOS 第三方库源码分析", ['iOS开发', '源码分析'], ['iOS', '源码分析']),
        ("interview/ios-design/patterns", "设计模式", "设计模式面试题", ['设计模式', '面试'], ['设计模式']),
        ("interview/ios-design/principles", "设计原则", "设计原则面试题", ['设计原则', '面试'], ['设计原则']),
        ("interview/ios-cross-platform", "跨平台", "跨平台开发面试题", ['跨平台', '面试'], ['跨平台']),
        ("interview/ios-apm", "APM", "iOS APM 监控面试题", ['iOS开发', 'APM'], ['iOS', 'APM']),
        ("interview/ios-advanced", "iOS 进阶", "iOS 进阶面试题", ['iOS开发', '面试'], ['iOS', '面试']),
        ("interview/ios-design", "设计模式与原则", "设计模式与原则合集", ['设计', '面试'], ['设计模式', '设计原则', '面试']),
    ]

    for rel_path, title, desc, categories, tags in section_configs:
        section_dir = TARGET / rel_path
        if section_dir.exists() or rel_path == "interview":
            generate_section_index(TARGET / rel_path, title, desc, categories, tags)
            print(f"  ✓ {rel_path}/_index.md")

    # 打印统计
    print("\n" + "=" * 60)
    print("Migration Complete!")
    print(f"  Total files scanned: {stats['total']}")
    print(f"  Articles created:    {stats['created']}")
    print(f"  Skipped:             {stats['skipped']}")
    print(f"  Index pages:         {len(section_configs)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 运行脚本执行迁移**

```bash
python3 scripts/migrate-interviews.py
```

预期输出：逐一列出每篇文章的创建过程，最后显示统计信息。

### Task 2: 创建 interview 入口导航页

**Files:**
- Create: `content/posts/interview/_index.md`

- [ ] **Step 1: 写入 interview 总导航页**

```toml
+++
title = "面试专题"
date = '2026-07-06T09:00:00+08:00'
draft = false
weight = -100
tags = ['面试', 'iOS', 'AI']
categories = ['面试']
+++

iOS 和 AI 面试题知识库，覆盖 iOS 基础、性能优化、编译工程、架构设计、源码分析、设计模式与原则、跨平台开发、APM 及 AI/LLM 领域。
```

目录:
- [AI 面试](./ai/) - AI/LLM 面试题
- [iOS 基础](./ios-basics/) - iOS 基础面试题
- [性能优化](./ios-performance/) - 启动/卡顿/耗电/崩溃/包瘦身/死锁
- [编译工程](./ios-build/) - 编译优化面试题
- [架构设计](./ios-architecture/) - iOS 架构设计
- [源码分析](./ios-source-analysis/) - 第三方库源码分析
- [设计模式与原则](./ios-design/) - 设计模式和设计原则
- [跨平台](./ios-cross-platform/) - 跨平台开发面试题
- [APM](./ios-apm/) - iOS APM 监控
- [iOS 进阶](./ios-advanced/) - 其他进阶话题

### Task 3: 验证迁移结果

- [ ] **Step 1: 检查文件计数**

```bash
find content/posts/interview -name "index.md" | wc -l
```

预期：约 157 个（含 section _index.md 约 170 个）

- [ ] **Step 2: 验证 frontmatter 格式**

```bash
python3 -c "
import os
from pathlib import Path
base = Path('content/posts/interview')
for p in base.rglob('index.md'):
    content = p.read_text(encoding='utf-8')
    if content.startswith('+++'):
        end = content.find('+++', 3)
        if end == -1:
            print(f'MISSING CLOSING +++: {p}')
    else:
        print(f'MISSING FRONTMATTER: {p}')
print('Validation complete.')
"
```

- [ ] **Step 3: Hugo 构建测试**

```bash
hugo --minify 2>&1 | tail -20
```

预期：无错误，构建成功

- [ ] **Step 4: 本地预览检查**

```bash
hugo server -D &
sleep 2
curl -s http://localhost:1313/interview/ | head -50
```

验证 interview 专题首页可访问。

### Task 4: 清理和提交

- [ ] **Step 1: 更新 .gitignore（如需要）**

确保 `scripts/` 目录中的一次性迁移脚本不算作项目正式代码。

- [ ] **Step 2: Git 提交**

```bash
git add content/posts/interview/ scripts/migrate-interviews.py
git commit -m "feat: migrate ~157 interview articles from awesome-ios-interview

- Migrate articles from /Users/jiangzhenhua/Tencent/awesome-ios-interview
- Categorize into: ai, ios-basics, ios-performance, ios-build, ios-architecture, ios-source-analysis, ios-design, ios-cross-platform, ios-apm, ios-advanced
- Auto-generate TOML frontmatter with categories, tags, weight
- Add section _index.md navigation pages
- Fix relative image paths for Hugo page bundle format"
```

---

## 边缘情况处理

| 场景 | 处理方式 |
|-----|--------|
| Texture源码导读.md (3行占位) | 正常迁移，draft=false，内容少但有效 |
| 图片路径引用 | 自动修正为 `../images/xxx.png` |
| 图片复制 | 自动复制到 page bundle 目录 |
| README.md / CATALOG.md | 跳过，不迁移 |
| 文件名冲突 | slug 生成唯一性由脚本保证（加 `-2` 后缀兜底） |
| Git 日期获取失败 | 回退使用当天日期 |
