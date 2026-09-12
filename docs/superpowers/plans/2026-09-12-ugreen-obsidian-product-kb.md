# UGreen Obsidian Product KB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `obsidian/UGreen/` as a dual-layer product knowledge base (DingTalk `sources/` + structured domain/feature/requirement/UI map) with testable sync helpers and an MCP-driven bootstrap from the product index doc.

**Architecture:** Stdlib Python under `scripts/ugreen-kb/` extracts DingTalk node IDs, validates/writes `inventory.yaml`, and materializes `sources/<nodeId>/`. Agents use 钉钉文档 MCP (`get_document_info`, `get_document_content`, `list_nodes`) to fetch content; curated notes live outside `sources/` and are never auto-overwritten.

**Tech Stack:** Obsidian Markdown + YAML frontmatter; Python 3 stdlib only (unittest); 钉钉文档 MCP (`user-dingtalk-doc` / `dingtalk-doc`).

**Spec:** `docs/superpowers/specs/2026-09-12-ugreen-obsidian-product-kb-design.md`

## Global Constraints

- Vault root: `obsidian/`; product KB: `obsidian/UGreen/`; do not move `obsidian/UGreen-Architecture/`.
- Entry index URL: `https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76` (nodeId `o14dA3GK8g5bDxmzS7YzblPxV9ekBD76`).
- Dual layer: sync only mutates `sources/` + `sync/inventory.yaml`; structured notes require human/Agent merge.
- UI fidelity: medium (page list + key interactions + local key screenshots); no design-system variant trees.
- No third-party Python deps; follow `scripts/obsidian-vault/` style.
- Before any MCP fetch in a session: confirm `user-dingtalk-doc` is callable; if missing, stop and ask to refresh MCP / new chat.
- Do not auto-write back to DingTalk.
- Do not claim DingTalk fetch succeeded without a real MCP tool result.

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `scripts/ugreen-kb/links.py` | Extract alidocs node IDs / URLs from Markdown |
| `scripts/ugreen-kb/inventory.py` | Load/save/validate `inventory.yaml`; merge discovered nodes |
| `scripts/ugreen-kb/sources.py` | Content hash; write `sources/<nodeId>/doc.md` (+ optional `doc.prev.md`) |
| `scripts/ugreen-kb/test_links.py` | Unit tests for link extraction |
| `scripts/ugreen-kb/test_inventory.py` | Unit tests for inventory |
| `scripts/ugreen-kb/test_sources.py` | Unit tests for sources writer |
| `obsidian/UGreen/00-产品首页.md` | Product MOC + Architecture sub-entry |
| `obsidian/UGreen/sync/inventory.yaml` | Sync manifest |
| `obsidian/UGreen/sync/README.md` | Bootstrap + routine sync procedure |
| `obsidian/UGreen/sources/` | Near-faithful DingTalk exports |
| `obsidian/UGreen/domains|features|requirements|ui/` | Curated product map |
| `obsidian/UGreen/Templates/*.md` | Note templates |
| `obsidian/Home.md` | Add link to UGreen product home |

---

### Task 1: DingTalk link extraction (TDD)

**Files:**
- Create: `scripts/ugreen-kb/links.py`
- Test: `scripts/ugreen-kb/test_links.py`

**Interfaces:**
- Consumes: Markdown string
- Produces:
  - `NODE_ID_RE`: compiled regex for 32-char alidocs ids
  - `extract_node_refs(markdown: str) -> list[dict]` each `{"node_id": str, "url": str}` unique, order preserved
  - `normalize_node_id(value: str) -> str` accepts bare id or full URL

- [ ] **Step 1: Write the failing test**

Create `scripts/ugreen-kb/test_links.py`:

```python
import unittest
from pathlib import Path
import importlib.util

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("ugreen_kb_links", HERE / "links.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class LinkTests(unittest.TestCase):
    def test_normalize_url_and_bare_id(self):
        url = "https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
        self.assertEqual(mod.normalize_node_id(url), "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76")
        self.assertEqual(mod.normalize_node_id("o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"), "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76")

    def test_extract_unique_ordered(self):
        md = """
        # Index
        - [A](https://alidocs.dingtalk.com/i/nodes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)
        - bare aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa again
        - [B](https://alidocs.dingtalk.com/i/nodes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb?foo=1)
        """
        refs = mod.extract_node_refs(md)
        self.assertEqual(
            [r["node_id"] for r in refs],
            [
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ],
        )
        self.assertTrue(refs[0]["url"].startswith("https://alidocs.dingtalk.com/i/nodes/"))


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest scripts/ugreen-kb/test_links.py -v`  
Expected: FAIL (cannot import `links.py` or missing attributes)

- [ ] **Step 3: Write minimal implementation**

Create `scripts/ugreen-kb/links.py`:

```python
"""Extract DingTalk alidocs node references from Markdown."""
from __future__ import annotations

import re

NODE_ID_RE = re.compile(r"[A-Za-z0-9]{32}")
URL_RE = re.compile(
    r"https://alidocs\.dingtalk\.com/i/nodes/([A-Za-z0-9]{32})(?:[^\s)\]>]*)?"
)
BARE_RE = re.compile(r"(?<![A-Za-z0-9])([A-Za-z0-9]{32})(?![A-Za-z0-9])")


def normalize_node_id(value: str) -> str:
    value = value.strip()
    m = URL_RE.search(value)
    if m:
        return m.group(1)
    if NODE_ID_RE.fullmatch(value):
        return value
    raise ValueError(f"not a DingTalk node id or URL: {value!r}")


def extract_node_refs(markdown: str) -> list[dict]:
    found: list[dict] = []
    seen: set[str] = set()

    def add(node_id: str) -> None:
        if node_id in seen:
            return
        seen.add(node_id)
        found.append(
            {
                "node_id": node_id,
                "url": f"https://alidocs.dingtalk.com/i/nodes/{node_id}",
            }
        )

    for m in URL_RE.finditer(markdown):
        add(m.group(1))
    for m in BARE_RE.finditer(markdown):
        add(m.group(1))
    return found
```

- [ ] **Step 4: Run tests and make sure they pass**

Run: `python3 -m unittest scripts/ugreen-kb/test_links.py -v`  
Expected: OK (2 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/ugreen-kb/links.py scripts/ugreen-kb/test_links.py
git commit -m "$(cat <<'EOF'
feat(ugreen-kb): extract DingTalk node refs from markdown

EOF
)"
```

---

### Task 2: Inventory model (TDD)

**Files:**
- Create: `scripts/ugreen-kb/inventory.py`
- Test: `scripts/ugreen-kb/test_inventory.py`

**Interfaces:**
- Consumes: `links.normalize_node_id`
- Produces:
  - `Inventory` dataclass-like dict schema with keys `root_index_node_id`, `root_index_url`, `nodes: list[Node]`
  - `Node` keys: `node_id`, `title`, `url`, `kind`, `enabled`, `last_synced_at`, `content_hash`, `version`, `maps_to`, `last_error`
  - `empty_inventory(root_url: str) -> dict`
  - `loads(text: str) -> dict` / `dumps(data: dict) -> str` (minimal YAML subset, no PyYAML)
  - `validate(data: dict) -> list[str]` errors (empty = ok)
  - `merge_discovered(data: dict, refs: list[dict], *, default_enabled: bool = True) -> dict` adds missing nodes; does not delete

- [ ] **Step 1: Write the failing test**

Create `scripts/ugreen-kb/test_inventory.py`:

```python
import unittest
from pathlib import Path
import importlib.util

HERE = Path(__file__).parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


inv = load("ugreen_kb_inventory", "inventory.py")


class InventoryTests(unittest.TestCase):
    ROOT = "https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"

    def test_empty_and_roundtrip(self):
        data = inv.empty_inventory(self.ROOT)
        self.assertEqual(data["root_index_node_id"], "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76")
        text = inv.dumps(data)
        again = inv.loads(text)
        self.assertEqual(again["root_index_url"], self.ROOT)
        self.assertEqual(inv.validate(again), [])

    def test_merge_discovered_adds_does_not_delete(self):
        data = inv.empty_inventory(self.ROOT)
        data = inv.merge_discovered(
            data,
            [{"node_id": "a" * 32, "url": f"https://alidocs.dingtalk.com/i/nodes/{'a'*32}"}],
        )
        data["nodes"][0]["title"] = "KeepMe"
        data = inv.merge_discovered(
            data,
            [{"node_id": "b" * 32, "url": f"https://alidocs.dingtalk.com/i/nodes/{'b'*32}"}],
        )
        ids = [n["node_id"] for n in data["nodes"]]
        self.assertEqual(ids, ["a" * 32, "b" * 32])
        self.assertEqual(data["nodes"][0]["title"], "KeepMe")
        self.assertTrue(data["nodes"][1]["enabled"])

    def test_validate_rejects_bad_node(self):
        data = inv.empty_inventory(self.ROOT)
        data["nodes"] = [{"node_id": "short", "url": "x", "enabled": True}]
        errs = inv.validate(data)
        self.assertTrue(errs)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest scripts/ugreen-kb/test_inventory.py -v`  
Expected: FAIL (missing module)

- [ ] **Step 3: Write minimal implementation**

Create `scripts/ugreen-kb/inventory.py` that:
1. Imports `normalize_node_id` from sibling `links.py` via `importlib` or same-directory import path.
2. Implements `empty_inventory`, `dumps`/`loads` for this fixed schema only (quoted strings, booleans, nested `nodes:` list).
3. `validate` checks root fields and each node has 32-char `node_id`, non-empty `url`, bool `enabled`.
4. `merge_discovered` appends unknown ids with `title: ""`, `kind: "doc"`, `enabled: default_enabled`, empty optional fields.

Minimal `dumps` shape example the tests must accept:

```yaml
root_index_node_id: "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
root_index_url: "https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
nodes:
  - node_id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    title: ""
    url: "https://alidocs.dingtalk.com/i/nodes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    kind: "doc"
    enabled: true
    last_synced_at: ""
    content_hash: ""
    version: ""
    maps_to: ""
    last_error: ""
```

Prefer implementing a small line-oriented loader for this schema rather than a general YAML parser.

- [ ] **Step 4: Run tests and make sure they pass**

Run: `python3 -m unittest scripts/ugreen-kb/test_inventory.py -v`  
Expected: OK

- [ ] **Step 5: Commit**

```bash
git add scripts/ugreen-kb/inventory.py scripts/ugreen-kb/test_inventory.py
git commit -m "$(cat <<'EOF'
feat(ugreen-kb): add inventory.yaml model and merge helpers

EOF
)"
```

---

### Task 3: Sources writer + content hash (TDD)

**Files:**
- Create: `scripts/ugreen-kb/sources.py`
- Test: `scripts/ugreen-kb/test_sources.py`

**Interfaces:**
- Produces:
  - `content_hash(text: str) -> str` SHA-256 hex of UTF-8 body
  - `write_source(root: Path, node_id: str, *, title: str, body: str, source_url: str) -> dict`  
    Writes `root/sources/<node_id>/doc.md` with YAML frontmatter (`title`, `dingtalk_node_id`, `source_url`, `synced_at` ISO8601).  
    If prior `doc.md` exists and hash differs, copy to `doc.prev.md` first.  
    Returns `{"path": str, "content_hash": str, "changed": bool}`.

- [ ] **Step 1: Write the failing test**

```python
import tempfile, unittest
from pathlib import Path
import importlib.util

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("ugreen_kb_sources", HERE / "sources.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class SourcesTests(unittest.TestCase):
    def test_hash_stable(self):
        self.assertEqual(mod.content_hash("abc"), mod.content_hash("abc"))
        self.assertNotEqual(mod.content_hash("abc"), mod.content_hash("abd"))

    def test_write_and_prev_on_change(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            r1 = mod.write_source(
                root,
                "c" * 32,
                title="T",
                body="hello",
                source_url="https://alidocs.dingtalk.com/i/nodes/" + "c" * 32,
            )
            self.assertTrue(r1["changed"])
            doc = root / "sources" / ("c" * 32) / "doc.md"
            self.assertTrue(doc.is_file())
            self.assertIn("dingtalk_node_id:", doc.read_text())
            r2 = mod.write_source(
                root,
                "c" * 32,
                title="T",
                body="hello",
                source_url="https://alidocs.dingtalk.com/i/nodes/" + "c" * 32,
            )
            self.assertFalse(r2["changed"])
            r3 = mod.write_source(
                root,
                "c" * 32,
                title="T",
                body="hello2",
                source_url="https://alidocs.dingtalk.com/i/nodes/" + "c" * 32,
            )
            self.assertTrue(r3["changed"])
            self.assertTrue((root / "sources" / ("c" * 32) / "doc.prev.md").is_file())


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest scripts/ugreen-kb/test_sources.py -v`  
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Implement `sources.py` with stdlib `hashlib`, `datetime` (timezone-aware UTC or local ISO), and frontmatter wrapping. Hash the **body only** (not frontmatter) so metadata churn does not false-positive changes—or hash the full file consistently; pick **full file after write** and document it in the return value. Prefer hashing the markdown body passed in (stable across `synced_at` changes): store `content_hash` of `body` in the return dict and in a HTML comment or frontmatter field `content_hash`.

- [ ] **Step 4: Run tests and make sure they pass**

Run: `python3 -m unittest scripts/ugreen-kb/test_sources.py -v`  
Expected: OK

- [ ] **Step 5: Commit**

```bash
git add scripts/ugreen-kb/sources.py scripts/ugreen-kb/test_sources.py
git commit -m "$(cat <<'EOF'
feat(ugreen-kb): write sources exports with hash and prev snapshot

EOF
)"
```

---

### Task 4: Vault scaffold, templates, Home entry

**Files:**
- Create: `obsidian/UGreen/00-产品首页.md`
- Create: `obsidian/UGreen/sync/README.md` (procedure stub; filled fully in Task 7)
- Create: `obsidian/UGreen/sync/inventory.yaml` (empty inventory via `inventory.empty_inventory` + dumps)
- Create: `obsidian/UGreen/sources/_index.md` (placeholder pointing at root index URL)
- Create: `obsidian/UGreen/domains/.gitkeep` (or a short README note)
- Create: `obsidian/UGreen/features/.gitkeep`
- Create: `obsidian/UGreen/requirements/.gitkeep`
- Create: `obsidian/UGreen/ui/.gitkeep`
- Create: `obsidian/UGreen/Templates/域.md`
- Create: `obsidian/UGreen/Templates/功能.md`
- Create: `obsidian/UGreen/Templates/需求.md`
- Create: `obsidian/UGreen/Templates/UI.md`
- Modify: `obsidian/Home.md`

**Interfaces:**
- Consumes: inventory dumps from Task 2
- Produces: navigable empty product KB shell

- [ ] **Step 1: Generate empty inventory file**

```bash
python3 - <<'PY'
from pathlib import Path
import importlib.util
p = Path("scripts/ugreen-kb/inventory.py")
spec = importlib.util.spec_from_file_location("inv", p)
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
root = "https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
out = Path("obsidian/UGreen/sync/inventory.yaml")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(m.dumps(m.empty_inventory(root)), encoding="utf-8")
print(out, "bytes", out.stat().st_size)
PY
```

Expected: file created, `validate` would return `[]`.

- [ ] **Step 2: Write templates**

`obsidian/UGreen/Templates/域.md`:

```markdown
---
title: "{{title}}"
tags: [ugreen, domain]
status: draft
updated: "{{date}}"
domain_id: ""
source_node_ids: []
source_paths: []
---

# {{title}}

## 职责与边界

## 下属功能

-
```

`功能.md` / `需求.md` / `UI.md` similarly with fields from the spec (`feature_id`+`domain`, `req_id`+`feature`+`priority`, `ui_id`+`feature`+`screens`).

- [ ] **Step 3: Write `00-产品首页.md`**

Must include sections: 产品地图（空列表 OK）、架构与技术方案 → `[[UGreen-Architecture/00-摸底索引]]`、同步与原料 → `[[UGreen/sync/README]]` / `sources/`、Agent 约定（先地图后 sources）。

- [ ] **Step 4: Update `obsidian/Home.md`**

Add under a clear heading (e.g. 产品):

```markdown
- [[UGreen/00-产品首页|UGreen 产品知识库]]
```

- [ ] **Step 5: Smoke check**

```bash
test -f obsidian/UGreen/00-产品首页.md
test -f obsidian/UGreen/sync/inventory.yaml
rg -n "UGreen/00-产品首页" obsidian/Home.md
```

Expected: all succeed.

- [ ] **Step 6: Commit**

```bash
git add obsidian/UGreen obsidian/Home.md
git commit -m "$(cat <<'EOF'
docs(obsidian): scaffold UGreen product knowledge base shell

EOF
)"
```

---

### Task 5: MCP bootstrap — index fetch → inventory → sources

**Files:**
- Modify: `obsidian/UGreen/sync/inventory.yaml`
- Create/Modify: `obsidian/UGreen/sources/_index.md` and `obsidian/UGreen/sources/<nodeId>/doc.md` for enabled nodes
- Modify: `obsidian/UGreen/sync/README.md` (record exact MCP tool names used)

**Interfaces:**
- Consumes: MCP `get_document_info`, `get_document_content`; `links.extract_node_refs`; `inventory.merge_discovered`; `sources.write_source`
- Produces: populated inventory + first batch of sources

- [ ] **Step 1: Probe MCP in this session**

Call `GetDynamicTools` / list namespaces for `user-dingtalk-doc` (or equivalent).  
Call `get_document_info` with:

`nodeId = https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76`

Expected: success with `nodeId` / title / extension.  
If server missing: **STOP** — do not invent content; ask user to refresh MCP and retry this task only.

- [ ] **Step 2: Fetch index markdown**

Call `get_document_content` with same `nodeId`, `format=markdown`.  
Save body via:

```bash
python3 - <<'PY'
# paste fetched markdown into INDEX_MD triple-quoted string or read from a temp file written by the agent
from pathlib import Path
import importlib.util

def load(name, file):
    spec = importlib.util.spec_from_file_location(name, Path("scripts/ugreen-kb") / file)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

links, sources = load("l", "links.py"), load("s", "sources.py")
INDEX_MD = Path("/tmp/ugreen-index.md").read_text(encoding="utf-8")
root = Path("obsidian/UGreen")
r = sources.write_source(
    root,
    "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76",
    title="产品入口索引",  # replace with real title from get_document_info
    body=INDEX_MD,
    source_url="https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76",
)
# also copy/symlink-style note for humans
Path("obsidian/UGreen/sources/_index.md").write_text(
    "---\ntitle: 入口索引原料\nsource: [[sources/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76/doc]]\n---\n\n见 node 导出。\n",
    encoding="utf-8",
)
print(r)
print("refs", len(links.extract_node_refs(INDEX_MD)))
PY
```

- [ ] **Step 3: Merge refs into inventory**

```bash
python3 - <<'PY'
from pathlib import Path
import importlib.util

def load(file):
    spec = importlib.util.spec_from_file_location("m", Path("scripts/ugreen-kb") / file)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

links, inv = load("links.py"), load("inventory.py")
path = Path("obsidian/UGreen/sync/inventory.yaml")
data = inv.loads(path.read_text(encoding="utf-8"))
body = Path("obsidian/UGreen/sources/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76/doc.md").read_text(encoding="utf-8")
# strip frontmatter roughly: split on second ---
parts = body.split("---", 2)
md = parts[2] if len(parts) >= 3 else body
refs = links.extract_node_refs(md)
# exclude the index itself if present
refs = [r for r in refs if r["node_id"] != data["root_index_node_id"]]
data = inv.merge_discovered(data, refs, default_enabled=True)
assert inv.validate(data) == []
path.write_text(inv.dumps(data), encoding="utf-8")
print("nodes", len(data["nodes"]))
for n in data["nodes"]:
    print(n["node_id"], n["enabled"])
PY
```

- [ ] **Step 4: Export each enabled node**

For each `enabled: true` node in inventory (cap MVP at **15** nodes if the index is huge; leave the rest `enabled: false` with `last_error: "deferred: mvp cap"`):

1. `get_document_info(nodeId=...)` — if folder, use `list_nodes` and add children to inventory instead of exporting as doc; mark folder `kind: folder`.
2. If `extension=adoc` (or equivalent online doc): `get_document_content` → `sources.write_source`.
3. Update inventory fields: `title`, `last_synced_at`, `content_hash`, clear `last_error` on success; on failure set `enabled: false` or keep enabled with `last_error` per spec (prefer keep file, set `last_error`, leave `enabled: false` only when permanently inaccessible).
4. Shortcuts/dlink: resolve via `get_document_info` `linkSourceInfo` before export; on cycles, set `last_error` and skip.

- [ ] **Step 5: Verify**

```bash
python3 -m unittest scripts/ugreen-kb/test_links.py scripts/ugreen-kb/test_inventory.py scripts/ugreen-kb/test_sources.py -v
rg -n "root_index_node_id" obsidian/UGreen/sync/inventory.yaml
find obsidian/UGreen/sources -name doc.md | wc -l
```

Expected: tests OK; at least 1 `doc.md` (index) plus exported children; inventory lists discovered nodes.

- [ ] **Step 6: Commit**

```bash
git add obsidian/UGreen/sources obsidian/UGreen/sync/inventory.yaml obsidian/UGreen/sync/README.md
git commit -m "$(cat <<'EOF'
docs(ugreen): bootstrap DingTalk sources and sync inventory

EOF
)"
```

---

### Task 6: Minimal curated product map

**Files:**
- Create: at least one `obsidian/UGreen/domains/<slug>.md`
- Create: at least two `obsidian/UGreen/features/<slug>.md`
- Create: at least one `obsidian/UGreen/requirements/<slug>.md` (optional if sources lack clear reqs — then one draft stub is OK)
- Create: at least one `obsidian/UGreen/ui/<slug>.md` medium sample (page list + interactions; screenshot only if an image was exported)
- Modify: `obsidian/UGreen/00-产品首页.md` to link these notes
- Modify: matching inventory `maps_to` fields where obvious

**Interfaces:**
- Consumes: `sources/*/doc.md` content (read for understanding)
- Produces: Agent-readable skeleton; `status: draft` allowed

- [ ] **Step 1: Choose domains from exported sources**

Skim `sources/*/doc.md` titles/headings; pick **1–3** real product domains reflected in the material (do not invent unrelated domains). If sources are only an index with little detail, create one domain `未分类` and features named after linked doc titles.

- [ ] **Step 2: Write notes using templates**

Each note must include valid frontmatter with `source_node_ids` pointing at real node ids under `sources/`.

- [ ] **Step 3: Update product home map**

Replace empty 产品地图 bullets with wikilinks to the new notes; keep Architecture link.

- [ ] **Step 4: Spot-check Agent path**

Open path mentally: `Home` → `UGreen/00-产品首页` → feature → `source_node_ids` → `sources/<id>/doc.md`.  
Run:

```bash
rg -n "source_node_ids" obsidian/UGreen/domains obsidian/UGreen/features obsidian/UGreen/ui
rg -n "UGreen-Architecture/00-摸底索引" obsidian/UGreen/00-产品首页.md
```

Expected: curated notes have provenance; Architecture link present.

- [ ] **Step 5: Commit**

```bash
git add obsidian/UGreen
git commit -m "$(cat <<'EOF'
docs(ugreen): add minimal curated product map from DingTalk sources

EOF
)"
```

---

### Task 7: Sync README + end-to-end verification

**Files:**
- Modify: `obsidian/UGreen/sync/README.md` (complete procedure)
- Optional: `scripts/ugreen-kb/README.md` (how to run unit tests)

- [ ] **Step 1: Write full sync README**

Must document:

1. MCP probe gate
2. Bootstrap steps (Tasks 5–6 summary)
3. Routine sync: re-fetch enabled nodes → `write_source` → update inventory hashes → produce a short change summary listing changed `node_id`s and any `maps_to` hits via `rg`
4. Conflict rules (sources=DingTalk wins; curated=Obsidian wins)
5. MVP cap / enabling new nodes

Include exact unittest command:

`python3 -m unittest discover -s scripts/ugreen-kb -v`

- [ ] **Step 2: Re-run full verification checklist from spec**

```bash
python3 -m unittest discover -s scripts/ugreen-kb -v
test -f obsidian/UGreen/sync/inventory.yaml
test -f obsidian/UGreen/00-产品首页.md
find obsidian/UGreen/sources -name doc.md | head
rg -n "UGreen/00-产品首页" obsidian/Home.md
```

Idempotency spot-check: run `write_source` again on one unchanged body; expect `changed: false`.

- [ ] **Step 3: Commit**

```bash
git add obsidian/UGreen/sync/README.md scripts/ugreen-kb/README.md
git commit -m "$(cat <<'EOF'
docs(ugreen): document product KB sync procedure and verify helpers

EOF
)"
```

---

## Self-Review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Dual-layer `sources/` + curated map | 3, 4, 5, 6 |
| Entry index scan → inventory | 1, 2, 5 |
| Semi-auto sync, no silent curated overwrite | 3, 5, 7 |
| Architecture linked, not moved | 4, 6 |
| Medium UI | 6 |
| MCP prerequisite / failure stop | 5, 7 Global Constraints |
| MVP not full corpus | 5 cap + 6 skeleton |
| Templates + Home entry | 4 |
| Errors: permission, dlink, inventory | 5 steps + inventory fields |

No TBD placeholders remain. Script interfaces are named consistently across tasks (`extract_node_refs`, `merge_discovered`, `write_source`, `content_hash`).
