# UGreen 产品知识库同步说明

该目录保存 UGreen 产品知识库的同步清单与操作说明。

## 目录结构

| 路径 | 用途 |
|------|------|
| `inventory.yaml` | 已发现节点清单、启用状态、同步元数据 |
| `../sources/<nodeId>/doc.md` | 钉钉文档原料（Markdown 导出） |
| `../sources/_index.md` | 入口索引原料的人类可读指针 |
| `../domains/`、`../features/` 等 | 结构化笔记（Obsidian 侧维护） |

## 发布规则（必须遵守）

`sources/` **只允许产品 App 需求**（及同类产品 PRD）。禁止写入：

- 个人说明书 / 成员通讯录
- 入职须知、IT FAQ、共享 Wi‑Fi/账号密码
- 固件文档（当前约定不整理）

推送前自检：`rg -n '个人说明书|入职须知|UG123456|ugreen@123' obsidian/UGreen/sources` 应为无命中。

`inventory.yaml` 同样只保留产品节点。curated 笔记（`domains/` 等）与产品 `sources/` 可一并同步。

`inventory.yaml` 使用受限解析器；除 `enabled` 的 `true`/`false` 外，所有 scalar 值都必须保持为 JSON 双引号字符串（中文直接保留，不写成 `\uXXXX`）。
## MCP 通道

同步脚本使用 `scripts/ugreen-kb/dingtalk_mcp.py`，通过 `~/.cursor/mcp.json` 中 `mcpServers.dingtalk-doc.url` 配置的 **HTTP MCP 网关**连接钉钉文档。**不使用** Cursor `CallDynamicTool`。

使用的 MCP 工具：

| 工具 | 用途 |
|------|------|
| `get_document_info` | 探测节点、读取标题/类型/版本；解析 dlink 指向 |
| `get_document_content` | 导出在线文档 Markdown（`format=markdown`） |
| `list_nodes` | 发现文件夹子节点（本批 MVP 未遇到文件夹导出） |

helper 不输出或记录网关 URL 及其 query key。

### MCP 探测门控（每次同步前）

在拉取任何文档之前，先验证 MCP 可用：

```bash
python3 - <<'PY'
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location(
    "m", Path("scripts/ugreen-kb/dingtalk_mcp.py")
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

ROOT = "https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
client = mod.DingTalkMcpClient()
info = client.call("get_document_info", {"nodeId": ROOT})
print("probe OK:", info.get("nodeId") or info.get("node_id"))
PY
```

**失败时停止**：若抛出 `DingTalkMcpError` 或配置缺失，不要编造内容；检查 `~/.cursor/mcp.json` 中 `dingtalk-doc` 配置与网络，修复后重试。

## 冲突规则

| 层级 | 权威来源 | 说明 |
|------|----------|------|
| `sources/` 原料 | **钉钉** | 同步只更新 `sources/<nodeId>/doc.md`；内容变化时保留 `doc.prev.md` |
| 结构化笔记（`domains/`、`features/`、`requirements/`、`ui/`） | **Obsidian** | 同步**不会**自动覆盖 curated 笔记；需人工合并钉钉变更 |
| `maps_to` | 人工维护 | 指向 curated 笔记路径；变更原料后人工检查是否需要更新笔记 |

## 启用新的产品 App 节点

1. 确认文档是 **产品 App 需求**（不是成员/入职材料）。
2. 在 `inventory.yaml` 增加节点，`enabled: true`（或暂 `false` + `last_error`）。
3. 按「常规同步」导出到 `sources/<nodeId>/`。
4. 更新 `maps_to` 与 curated 笔记的 `source_node_ids`。

## Bootstrap（Tasks 5–6 摘要）

### Task 5：原料与 inventory

1. **MCP 探测**（见上）。
2. **拉取根索引**：`get_document_content` → `sources.write_source` 写入 `sources/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76/doc.md`；维护 `sources/_index.md`。
3. **扫描链接**：对索引正文调用 `links.extract_node_refs` → `inventory.merge_discovered` 合并到 `inventory.yaml`（排除根索引自身）。
4. **批量导出**：对每个 `enabled: true` 节点（MVP ≤15）：
   - `get_document_info` — 若为文件夹则 `list_nodes` 追加子节点，标记 `kind: folder`。
   - 在线文档：`get_document_content` → `write_source`。
   - 更新 inventory：`title`、`last_synced_at`、`content_hash`、`version`；失败时写 `last_error`。
   - dlink/shortcut：通过 `linkSourceInfo` 解析后再导出；循环引用则跳过并记录错误。

### Task 6：结构化骨架

1. 从已导出原料中选取 1–3 个真实产品域，创建 `domains/`、`features/`、`requirements/`、`ui/` 笔记。
2. 各笔记 frontmatter 含 `source_node_ids` 指向真实 `sources/<nodeId>`。
3. 更新 `00-产品首页.md` 产品地图与 Architecture 链接。
4. 在 inventory 中为明显对应的节点填写 `maps_to`。

## 常规同步

每次常规同步先重新拉取根索引 `o14dA3GK8g5bDxmzS7YzblPxV9ekBD76`，调用 `extract_node_refs` + `merge_discovered` 更新清单，并报告新增节点和索引中已缺失的引用。当前约定新增节点默认 `enabled: true`；若该默认值尚未由维护者确认，执行前先把不应导出的节点改为 `false`。

同步保持**两阶段**：先拉取根索引、扫描清单并将全部启用节点拉取校验到内存，再统一写回本地原料与 inventory（避免部分更新）。

```bash
python3 - <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import importlib.util

def load(name, file):
    spec = importlib.util.spec_from_file_location(name, Path("scripts/ugreen-kb") / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

mcp = load("mcp", "dingtalk_mcp.py")
inv_mod = load("inv", "inventory.py")
links = load("links", "links.py")
src = load("src", "sources.py")

root = Path("obsidian/UGreen")
inv_path = root / "sync" / "inventory.yaml"
data = inv_mod.loads(inv_path.read_text(encoding="utf-8"))
client = mcp.DingTalkMcpClient()
now = datetime.now(timezone.utc).isoformat()
ROOT_ID = "o14dA3GK8g5bDxmzS7YzblPxV9ekBD76"
ROOT_URL = f"https://alidocs.dingtalk.com/i/nodes/{ROOT_ID}"

# Phase 1a: re-fetch root index, discover nodes, and merge in memory.
root_info = client.call("get_document_info", {"nodeId": ROOT_URL})
root_response = client.call(
    "get_document_content", {"nodeId": ROOT_URL, "format": "markdown"}
)
root_body = mcp.extract_document_markdown(root_response)
refs = [r for r in links.extract_node_refs(root_body) if r["node_id"] != ROOT_ID]
old_ids = {node["node_id"] for node in data["nodes"]}
ref_ids = {ref["node_id"] for ref in refs}
data = inv_mod.merge_discovered(data, refs, default_enabled=True)
added_ids = [node["node_id"] for node in data["nodes"] if node["node_id"] not in old_ids]
missing_ref_ids = sorted(old_ids - ref_ids)

# Phase 1b: fetch + validate every enabled node (still no writes).
fetched = []
for node in data["nodes"]:
    if not node.get("enabled"):
        continue
    nid = node["node_id"]
    info = client.call("get_document_info", {"nodeId": node["url"]})
    title = info.get("title") or node.get("title") or nid
    version = str(info.get("version") or info.get("docVersion") or "")
    content = client.call(
        "get_document_content",
        {"nodeId": node["url"], "format": "markdown"},
    )
    body = mcp.extract_document_markdown(content)
    fetched.append((node, nid, title, version, body))

# Phase 2: write the root source, all enabled sources, and inventory.
src.write_source(
    root,
    ROOT_ID,
    title=root_info.get("title") or "UGreen 产品知识库索引",
    body=root_body,
    source_url=ROOT_URL,
)
changed_ids = []
for node, nid, title, version, body in fetched:
    r = src.write_source(root, nid, title=title, body=body, source_url=node["url"])
    node["title"] = title
    node["content_hash"] = r["content_hash"]
    node["last_synced_at"] = now
    node["version"] = version
    node["last_error"] = ""
    if r["changed"]:
        changed_ids.append(nid)

inv_path.write_text(inv_mod.dumps(data), encoding="utf-8")
print("added node_ids (default enabled):", added_ids or "(none)")
print("missing refs from root index:", missing_ref_ids or "(none)")
print("changed node_ids:", changed_ids or "(none)")
for nid in changed_ids:
    node = next(n for n in data["nodes"] if n["node_id"] == nid)
    if node.get("maps_to"):
        print(f"review maps_to: {nid} -> {node['maps_to']}")
PY
```

**两阶段与响应形状门控**：Phase 1 拉取全部启用节点；任一 MCP 错误或 `extract_document_markdown` 检测到缺失/空/不受支持的 `get_document_content` 形状时抛出 `DingTalkMcpError`，**此阶段不写任何文件**。脚本未捕获该异常，进程以非零退出码终止，**不会**部分更新 `sources/` 或 `inventory.yaml`（既有文件均保持不变）。Phase 1 全部成功后，Phase 2 再写入全部 `sources/<nodeId>/doc.md` 并保存 inventory；修复网关/节点类型后重试。

**变更摘要**（同步后）：

```bash
# 上一步脚本已打印 changed node_ids 及对应 maps_to（仅 content 有变的节点）
# 若需手动复查某个 changed node_id 的 maps_to：
CHANGED="EpGBa2Lm8azarRXjsEkNBbZjWgN7R35y"  # 替换为实际 changed id
rg -n "node_id: \"${CHANGED}\"" -A8 obsidian/UGreen/sync/inventory.yaml | rg "maps_to:"
```

若某 `maps_to` 对应节点的 `content_hash` 变化，打开该 curated 笔记对照 `sources/<nodeId>/doc.md` 手动合并。

## 幂等性

`write_source` 对相同 body 再次写入应返回 `changed: false`，且不生成 `doc.prev.md`：

```bash
python3 - <<'PY'
from pathlib import Path
import importlib.util, json

def load(file):
    spec = importlib.util.spec_from_file_location("m", Path("scripts/ugreen-kb") / file)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

src = load("sources.py")
root = Path("obsidian/UGreen")
node_id = "EpGBa2Lm8azarRXjsEkNBbZjWgN7R35y"  # 任选已导出节点
doc = (root / "sources" / node_id / "doc.md").read_text(encoding="utf-8")
parts = doc.split("---", 2)
body = parts[2].lstrip("\n")
fm = {}
for line in parts[1].splitlines():
    if ":" in line:
        k, v = line.split(":", 1)
        fm[k.strip()] = json.loads(v.strip())
r = src.write_source(root, node_id, title=fm["title"], body=body, source_url=fm["source_url"])
print("changed:", r["changed"])  # 期望 False
PY
```

## 单元测试

```bash
python3 -m unittest discover -s scripts/ugreen-kb -v
```

## 端到端验证清单

```bash
python3 -m unittest discover -s scripts/ugreen-kb -v
test -f obsidian/UGreen/sync/inventory.yaml
test -f obsidian/UGreen/00-产品首页.md
find obsidian/UGreen/sources -name doc.md | head
rg -n "UGreen/00-产品首页" obsidian/Home.md
```
