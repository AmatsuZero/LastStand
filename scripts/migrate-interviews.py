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
TARGET = Path("content/posts/interview")
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
            return dt_str.replace(" ", "T", 1).replace(" +0800", "+08:00").replace(" -", "-")
    except Exception:
        pass
    return datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00")


def slugify(filename: str, prefix: str = "") -> str:
    """从文件名生成 URL 安全的 slug"""
    name = filename.replace(".md", "")
    if prefix and name.startswith(prefix):
        name = name[len(prefix):]
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


DIR_MAPPING = OrderedDict([
    ("ai/openclaw",            ("ai", ['AI', '面试'], ['AI', 'LLM', '面试', 'OpenClaw'], "OpenClaw源码导读-", "openclaw-")),
    ("ai",                     ("ai", ['AI', '面试'], ['AI', 'LLM', '面试'], "", "")),
    ("ios-basics",             ("ios-basics", ['iOS开发', '面试'], ['iOS', '面试', '基础'], "", "")),
    ("ios-advanced/包瘦身",    ("ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '包瘦身'], "包瘦身-", "size-")),
    ("ios-advanced/启动优化",  ("ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '启动'], "启动优化-", "launch-")),
    ("ios-advanced/卡顿",      ("ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '卡顿'], "卡顿-", "stutter-")),
    ("ios-advanced/耗电",      ("ios-performance", ['iOS开发', '性能优化'], ['iOS', '性能优化', '耗电'], "耗电-", "power-")),
    ("ios-advanced/崩溃",      ("ios-performance", ['iOS开发', '性能优化', '稳定性'], ['iOS', '性能优化', '稳定性', '崩溃'], "崩溃-", "crash-")),
    ("ios-advanced/死锁",      ("ios-performance", ['iOS开发', '多线程'], ['iOS', '多线程', '死锁'], "死锁-", "deadlock-")),
    ("ios-advanced/编译优化",  ("ios-build", ['iOS开发', '工程化'], ['iOS', '工程化', '编译'], "编译优化-", "")),
    ("ios-advanced/architecture", ("ios-architecture", ['iOS开发', '架构'], ['iOS', '架构'], "", "")),
    ("ios-advanced/CocoaPods", ("ios-source-analysis", ['iOS开发', '源码分析'], ['iOS', '源码分析', 'CocoaPods'], "CocoaPods源码导读-", "cocoapods-")),
    ("ios-advanced/三方库源码", ("ios-source-analysis", ['iOS开发', '源码分析'], ['iOS', '源码分析'], "源码导读", "")),
    ("ios-advanced/design-patterns", ("ios-design/patterns", ['设计模式', '面试'], ['设计模式', '面试'], "模式", "")),
    ("ios-advanced/design-principles", ("ios-design/principles", ['设计原则', '面试'], ['设计原则', '面试'], "", "")),
    ("ios-advanced/cross-platform", ("ios-cross-platform", ['跨平台', '面试'], ['跨平台', '面试'], "", "")),
    ("ios-advanced/APM",       ("ios-apm", ['iOS开发', 'APM'], ['iOS', 'APM', '监控'], "APM-", "")),
])


def get_mapping(filepath: Path) -> tuple:
    rel = filepath.relative_to(SOURCE)
    rel_str = str(rel).replace("\\", "/")

    for pattern, (target_dir, categories, tags, strip_prefix, sub_slug) in DIR_MAPPING.items():
        if rel_str.startswith(pattern + "/") or rel_str.startswith(pattern + "."):
            filename = os.path.basename(rel_str)
            slug_base = slugify(filename, strip_prefix)
            if sub_slug:
                slug_base = sub_slug + slug_base
            return target_dir, categories, tags, slug_base

    if "ios-advanced" in rel_str:
        return "ios-advanced", ['iOS开发', '面试'], ['iOS', '面试'], slugify(os.path.basename(rel_str), "")

    return "misc", ['面试'], ['面试'], slugify(os.path.basename(rel_str), "")


def copy_images(source_file: Path, target_dir: Path):
    source_dir = source_file.parent
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']:
        for img in source_dir.rglob(f'*{ext}'):
            rel = img.relative_to(source_dir)
            target_img = target_dir / rel
            target_img.parent.mkdir(parents=True, exist_ok=True)
            if not target_img.exists():
                shutil.copy2(str(img), str(target_img))
                print(f"  Copied image: {rel}")


def fix_image_paths(content: str) -> str:
    def replacer(match):
        prefix = match.group(1)
        path = match.group(2)
        suffix = match.group(3)
        if path.startswith('../') or path.startswith('http'):
            return match.group(0)
        return f'{prefix}../{path}{suffix}'

    content = re.sub(r'(!\[.*?\]\()([^)http][^)]*)(\))', replacer, content)
    content = re.sub(r'(<img[^>]*src=")([^"http][^"]*)(")', replacer, content)
    return content


def generate_frontmatter(title: str, date: str, categories: list, tags: list, weight: int) -> str:
    cats = str(categories).replace("'", '"')
    tgs = str(tags).replace("'", '"')
    return f"""+++
title = "{title}"
date = '{date}'
draft = false
weight = {weight}
tags = {tgs}
categories = {cats}
+++"""


def write_article(source_file: Path, target_dir: Path, title: str, date: str,
                  categories: list, tags: list, weight: int):
    target_dir.mkdir(parents=True, exist_ok=True)

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    if lines and lines[0].startswith('# '):
        content = '\n'.join(lines[1:]).lstrip('\n')

    content = fix_image_paths(content)
    fm = generate_frontmatter(title, date, categories, tags, weight)

    target_file = target_dir / "index.md"
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(fm + "\n" + content)

    print(f"  Created: {target_file.relative_to(TARGET)}")
    copy_images(source_file, target_dir)


def generate_section_index(target_section: Path, title: str, description: str,
                           categories: list, tags: list, articles: list = None):
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

    if TARGET.exists():
        print(f"\nRemoving existing target: {TARGET}")
        shutil.rmtree(TARGET)

    TARGET.mkdir(parents=True, exist_ok=True)

    weight_counter = {}
    stats = {"total": 0, "skipped": 0, "created": 0}

    for root, dirs, files in os.walk(SOURCE):
        dirs[:] = [d for d in dirs if d != 'images']

        for file in sorted(files):
            if not file.endswith('.md'):
                continue

            source_file = Path(root) / file
            stats["total"] += 1

            if file in ['README.md', 'CATALOG.md', '_index.md']:
                stats["skipped"] += 1
                continue

            target_rel_dir, categories, tags, slug = get_mapping(source_file)
            target_dir = TARGET / target_rel_dir / slug

            section_key = target_dir.parent
            if section_key not in weight_counter:
                weight_counter[section_key] = 1
            else:
                weight_counter[section_key] += 1

            title = extract_title(source_file)
            date = get_git_date(source_file)

            print(f"\n[{stats['total']}] {source_file.relative_to(SOURCE)}")
            print(f"  → {target_dir.relative_to(TARGET.parent)}")

            write_article(source_file, target_dir, title, date, categories, tags,
                         weight_counter[section_key])
            stats["created"] += 1

    print("\n" + "=" * 60)
    print("Generating section index pages...")
    print("=" * 60)

    section_configs = [
        ("", "面试专题", "iOS 和 AI 面试题知识库", ['面试'], ['面试', 'iOS', 'AI']),
        ("ai", "AI 面试", "AI/LLM 相关面试题", ['AI', '面试'], ['AI', 'LLM', '面试']),
        ("ios-basics", "iOS 基础", "iOS 基础面试题", ['iOS开发', '面试'], ['iOS', '面试', '基础']),
        ("ios-performance", "性能优化", "iOS 性能优化面试题 - 启动/卡顿/耗电/崩溃/包瘦身/死锁", ['iOS开发', '性能优化'], ['iOS', '性能优化']),
        ("ios-build", "编译工程", "iOS 编译优化面试题", ['iOS开发', '工程化'], ['iOS', '工程化', '编译']),
        ("ios-architecture", "架构设计", "iOS 架构设计面试题", ['iOS开发', '架构'], ['iOS', '架构']),
        ("ios-source-analysis", "源码分析", "iOS 第三方库源码分析", ['iOS开发', '源码分析'], ['iOS', '源码分析']),
        ("ios-design/patterns", "设计模式", "设计模式面试题", ['设计模式', '面试'], ['设计模式']),
        ("ios-design/principles", "设计原则", "设计原则面试题", ['设计原则', '面试'], ['设计原则']),
        ("ios-cross-platform", "跨平台", "跨平台开发面试题", ['跨平台', '面试'], ['跨平台']),
        ("ios-apm", "APM", "iOS APM 监控面试题", ['iOS开发', 'APM'], ['iOS', 'APM']),
        ("ios-advanced", "iOS 进阶", "iOS 进阶面试题", ['iOS开发', '面试'], ['iOS', '面试']),
        ("ios-design", "设计模式与原则", "设计模式与原则合集", ['设计', '面试'], ['设计模式', '设计原则', '面试']),
    ]

    for rel_path, title, desc, categories, tags in section_configs:
        if rel_path:
            section_dir = TARGET / rel_path
            section_path = section_dir
        else:
            section_dir = TARGET
            section_path = TARGET
        if section_dir.exists() or rel_path == "":
            generate_section_index(section_path, title, desc, categories, tags)
            label = rel_path + "/" if rel_path else ""
            print(f"  ✓ {label}_index.md")

    print("\n" + "=" * 60)
    print("Migration Complete!")
    print(f"  Total files scanned: {stats['total']}")
    print(f"  Articles created:    {stats['created']}")
    print(f"  Skipped:             {stats['skipped']}")
    print(f"  Index pages:         {len(section_configs)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
