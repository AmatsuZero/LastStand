#!/usr/bin/env python3
"""kb - 开发经验知识库检索工具（工具无关内核）。

零第三方依赖，仅用 Python 标准库 + 内置 sqlite3。

子命令：
  build              增量构建/更新索引（kb.db）
  search "<关键词>"   检索经验笔记，返回命中 Top-N
  show <id>          输出某篇笔记全文（id 来自 search 结果）
  tags [--tag X]     列出标签或按标签筛选笔记
  init               安装 git hooks（post-commit/post-merge 自动重建索引）
  stats              显示索引统计

设计文档：docs/plans/2026-11-04-knowledge-base-design.md
"""

import os
import sys
import re
import hashlib
import sqlite3
import subprocess


def repo_root():
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True,
        )
        return out.stdout.strip()
    except Exception:
        return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


ROOT = repo_root()
CONTENT_DIR = os.path.join(ROOT, "content", "posts")
DB_PATH = os.path.join(ROOT, "kb.db")
TOML_PATH = os.path.join(ROOT, "kb.toml")
HOOKS_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "git-hooks")


def _parse_toml_array(text, key):
    m = re.search(rf"{key}\s*=\s*\[(.*?)\]", text, re.DOTALL)
    if not m:
        return []
    inner = m.group(1)
    items = re.findall(r'["\'](.*?)["\']', inner)
    return [x.strip() for x in items if x.strip()]


def load_scope():
    if not os.path.exists(TOML_PATH):
        return None, None
    with open(TOML_PATH, "r", encoding="utf-8") as f:
        text = f.read()
    block = ""
    m = re.search(r"\[scope\](.*?)(?:\n\[|\Z)", text, re.DOTALL)
    if m:
        block = m.group(1)
    cats = _parse_toml_array(block, "include_categories")
    tags = _parse_toml_array(block, "include_tags")
    if not cats and not tags:
        return None, None
    return set(cats), set(tags)


def _strip_quotes(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
        return v[1:-1]
    return v


def _parse_array(v):
    v = v.strip()
    if v.startswith("["):
        v = v[1:-1]
    return [x.strip().strip("\"'") for x in v.split(",") if x.strip()]


def parse_frontmatter(text):
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, text
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return {}, text
    fm = "\n".join(lines[1:end])
    body = "\n".join(lines[end + 1:])
    meta = {}
    for line in fm.split("\n"):
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        k, v = k.strip(), v.strip()
        if k in ("title", "date"):
            meta[k] = _strip_quotes(v)
        elif k in ("categories", "tags"):
            meta[k] = _parse_array(v)
    return meta, body


def extract_structure(body):
    headings = []
    summary_parts = []
    summary = ""
    in_code = False
    for line in body.split("\n"):
        if line.strip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = re.match(r"^#{2,4}\s+(.+?)\s*#*$", line)
        if m:
            headings.append(m.group(1).strip())
            continue
        if not summary and line.strip() and not line.startswith((">", "-", "*", "|", "!", "[", "]", "#")):
            summary_parts.append(line.strip())
            if len(" ".join(summary_parts)) > 200:
                summary = " ".join(summary_parts)[:300]
                break
    if not summary:
        summary = " ".join(summary_parts)[:300]
    return headings, summary


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS posts (
               id INTEGER PRIMARY KEY,
               path TEXT UNIQUE,
               title TEXT,
               categories TEXT,
               tags TEXT,
               headings TEXT,
               summary TEXT,
               body TEXT
           )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS meta (
               path TEXT PRIMARY KEY,
               mtime REAL,
               hash TEXT
           )"""
    )
    conn.commit()
    return conn


def _hash_file(raw):
    return hashlib.sha256(raw).hexdigest()


def cmd_build(quiet=False):
    if not os.path.isdir(CONTENT_DIR):
        print(f"未找到内容目录：{CONTENT_DIR}", file=sys.stderr)
        return 1
    inc_cats, inc_tags = load_scope()
    conn = connect()
    existing = {r[0]: r[1] for r in conn.execute("SELECT id, path FROM posts")}
    meta_map = {r[0]: (r[1], r[2]) for r in conn.execute("SELECT path, mtime, hash FROM meta")}
    current = set()
    changed = 0
    for root, _, files in os.walk(CONTENT_DIR):
        for fn in files:
            if not fn.endswith(".md") or fn == "_index.md":
                continue
            full = os.path.join(root, fn)
            path = os.path.relpath(full, ROOT)
            current.add(path)
            raw = open(full, "rb").read()
            mtime = os.path.getmtime(full)
            h = _hash_file(raw)
            if path in meta_map and meta_map[path] == (mtime, h):
                continue
            text = raw.decode("utf-8", errors="replace")
            meta, body = parse_frontmatter(text)
            headings, summary = extract_structure(body)
            in_scope = True
            if inc_cats is not None or inc_tags is not None:
                cat_ok = (inc_cats is None) or bool(set(meta.get("categories", [])) & inc_cats)
                tag_ok = (inc_tags is None) or bool(set(meta.get("tags", [])) & inc_tags)
                in_scope = cat_ok or tag_ok
            if not in_scope:
                if path in existing:
                    conn.execute("DELETE FROM posts WHERE path=?", (path,))
                    conn.execute("DELETE FROM meta WHERE path=?", (path,))
                    changed += 1
                continue
            if path in existing:
                conn.execute("DELETE FROM posts WHERE path=?", (path,))
            conn.execute(
                """INSERT INTO posts (path, title, categories, tags, headings, summary, body)
                   VALUES (?,?,?,?,?,?,?)""",
                (
                    path,
                    meta.get("title", ""),
                    ",".join(meta.get("categories", [])),
                    ",".join(meta.get("tags", [])),
                    "\n".join(headings),
                    summary,
                    body,
                ),
            )
            conn.execute(
                "INSERT OR REPLACE INTO meta (path, mtime, hash) VALUES (?,?,?)",
                (path, mtime, h),
            )
            changed += 1
    for path in set(existing) - current:
        conn.execute("DELETE FROM posts WHERE path=?", (path,))
        conn.execute("DELETE FROM meta WHERE path=?", (path,))
        changed += 1
    conn.commit()
    total = conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    conn.close()
    if not quiet:
        print(f"索引更新完成：当前 {total} 篇，本次变更 {changed} 篇。")
    return 0


def _snippet(text, terms, width=80):
    low = text.lower()
    pos = len(text)
    for t in terms:
        i = low.find(t.lower())
        if i != -1 and i < pos:
            pos = i
    if pos == len(text):
        return text[:width]
    start = max(0, pos - 30)
    end = min(len(text), pos + width)
    s = text[start:end].replace("\n", " ")
    if start > 0:
        s = "…" + s
    if end < len(text):
        s = s + "…"
    return s


def cmd_search(query, top=10):
    if not os.path.exists(DB_PATH):
        if cmd_build(quiet=True) != 0:
            return 1
    terms = query.split()
    if not terms:
        print("用法：kb search \"<关键词>\"", file=sys.stderr)
        return 1
    conn = connect()
    rows = conn.execute(
        "SELECT id, path, title, tags, headings, summary, body FROM posts"
    ).fetchall()
    conn.close()
    results = []
    for r in rows:
        rid, path, title, tags, headings, summary, body = r
        score = 0
        matched = False
        for t in terms:
            tl = t.lower()
            if title and tl in title.lower():
                score += 5
                matched = True
            if tags and tl in tags.lower():
                score += 4
                matched = True
            if headings and tl in headings.lower():
                score += 3
                matched = True
            if summary and tl in summary.lower():
                score += 2
                matched = True
            if body and tl in body.lower():
                score += 1
                matched = True
        if matched:
            results.append((score, rid, path, title, tags, summary, body))
    results.sort(reverse=True)
    if not results:
        print("知识库无相关记录。")
        return 0
    for i, (score, rid, path, title, tags, summary, body) in enumerate(results[:top], 1):
        print(f"#{i}  [{rid}]  {title or path}")
        print(f"    路径: {path}")
        if tags:
            print(f"    标签: {tags}")
        hay = (summary or "") + "\n" + (body or "")
        print(f"    摘要: {_snippet(hay, terms)}")
        print()
    print(f"共命中 {len(results)} 篇，显示前 {min(top, len(results))} 篇。用 `kb show <id>` 看全文。")
    return 0


def cmd_show(rid):
    if not os.path.exists(DB_PATH):
        cmd_build(quiet=True)
    conn = connect()
    row = conn.execute("SELECT path FROM posts WHERE id=?", (rid,)).fetchone()
    conn.close()
    if not row:
        print(f"未找到 id={rid} 的笔记。", file=sys.stderr)
        return 1
    path = os.path.join(ROOT, row[0])
    if not os.path.exists(path):
        print(f"源文件不存在：{path}", file=sys.stderr)
        return 1
    with open(path, "r", encoding="utf-8") as f:
        print(f.read())
    return 0


def cmd_tags(tag=None):
    if not os.path.exists(DB_PATH):
        cmd_build(quiet=True)
    conn = connect()
    rows = conn.execute("SELECT id, path, title, tags FROM posts").fetchall()
    conn.close()
    if tag:
        tl = tag.lower()
        hits = [r for r in rows if r[3] and tl in r[3].lower()]
        for rid, path, title, tags in hits:
            print(f"[{rid}] {title or path}  ({tags})")
        print(f"\n标签 '{tag}' 命中 {len(hits)} 篇。")
        return 0
    counts = {}
    for _, _, _, tags in rows:
        for t in (tags or "").split(","):
            t = t.strip()
            if t:
                counts[t] = counts.get(t, 0) + 1
    for t, c in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"{c:4d}  {t}")
    return 0


def cmd_stats():
    if not os.path.exists(DB_PATH):
        cmd_build(quiet=True)
    conn = connect()
    total = conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    conn.close()
    print(f"知识库索引：{DB_PATH}")
    print(f"已索引笔记：{total} 篇")
    return 0


def cmd_init():
    hook_dir = os.path.join(ROOT, ".git", "hooks")
    if not os.path.isdir(hook_dir):
        print("未检测到 .git/hooks 目录，跳过 hook 安装。", file=sys.stderr)
        return 1
    for name in ("post-commit", "post-merge"):
        src = os.path.join(HOOKS_SRC, name)
        if not os.path.exists(src):
            print(f"缺少 hook 模板：{src}", file=sys.stderr)
            continue
        dst = os.path.join(hook_dir, name)
        with open(src, "r", encoding="utf-8") as f:
            content = f.read()
        with open(dst, "w", encoding="utf-8") as f:
            f.write(content)
        os.chmod(dst, 0o755)
        print(f"已安装 hook：{dst}")
    print("完成。以后 commit / pull 后会自动增量重建索引。")
    return 0


def main(argv):
    if not argv:
        print(__doc__)
        return 0
    cmd = argv[0]
    rest = argv[1:]
    if cmd in ("build", "b"):
        return cmd_build(quiet='--quiet' in rest)
    if cmd in ("search", "s"):
        if not rest:
            print("用法：kb search \"<关键词>\"", file=sys.stderr)
            return 1
        return cmd_search(" ".join(rest))
    if cmd in ("show", "view"):
        if not rest:
            print("用法：kb show <id>", file=sys.stderr)
            return 1
        return cmd_show(rest[0])
    if cmd == "tags":
        tag = None
        if "--tag" in rest:
            idx = rest.index("--tag")
            if idx + 1 < len(rest):
                tag = rest[idx + 1]
        return cmd_tags(tag)
    if cmd in ("stats",):
        return cmd_stats()
    if cmd in ("init",):
        return cmd_init()
    print(f"未知子命令：{cmd}\n", file=sys.stderr)
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
