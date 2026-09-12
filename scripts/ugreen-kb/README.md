# UGreen KB sync helpers

Python stdlib helpers for the UGreen Obsidian product knowledge base sync pipeline.

## Modules

| Module | Key functions |
|--------|----------------|
| `links.py` | `extract_node_refs`, `normalize_node_id` |
| `inventory.py` | `loads`, `dumps`, `merge_discovered`, `validate` |
| `sources.py` | `write_source`, `content_hash` |
| `dingtalk_mcp.py` | `DingTalkMcpClient` — HTTP MCP client via `~/.cursor/mcp.json` → `dingtalk-doc` |

## Run tests

From the repository root:

```bash
python3 -m unittest discover -s scripts/ugreen-kb -v
```

## MCP usage

Sync operations call DingTalk document tools through `DingTalkMcpClient`, not Cursor `CallDynamicTool`. See `obsidian/UGreen/sync/README.md` for probe gate, bootstrap, and routine sync procedures.
