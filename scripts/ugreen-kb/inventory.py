"""Inventory model for UGreen product KB sync (minimal YAML subset)."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

_HERE = Path(__file__).parent
_spec = importlib.util.spec_from_file_location("ugreen_kb_links", _HERE / "links.py")
_links = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_links)
normalize_node_id = _links.normalize_node_id

NODE_ID_RE = re.compile(r"^[A-Za-z0-9]{32}$")

NODE_KEYS = (
    "node_id",
    "title",
    "url",
    "kind",
    "enabled",
    "last_synced_at",
    "content_hash",
    "version",
    "maps_to",
    "last_error",
)


def _empty_node(node_id: str, url: str, *, enabled: bool = True) -> dict:
    return {
        "node_id": node_id,
        "title": "",
        "url": url,
        "kind": "doc",
        "enabled": enabled,
        "last_synced_at": "",
        "content_hash": "",
        "version": "",
        "maps_to": "",
        "last_error": "",
    }


def empty_inventory(root_url: str) -> dict:
    return {
        "root_index_node_id": normalize_node_id(root_url),
        "root_index_url": root_url.strip(),
        "nodes": [],
    }


def validate(data: dict) -> list[str]:
    errors: list[str] = []
    node_id = data.get("root_index_node_id", "")
    if not isinstance(node_id, str) or not NODE_ID_RE.fullmatch(node_id):
        errors.append("root_index_node_id must be a 32-character node id")
    root_url = data.get("root_index_url", "")
    if not isinstance(root_url, str) or not root_url:
        errors.append("root_index_url must be non-empty")
    nodes = data.get("nodes")
    if not isinstance(nodes, list):
        errors.append("nodes must be a list")
        return errors
    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"nodes[{index}] must be a mapping")
            continue
        nid = node.get("node_id", "")
        if not isinstance(nid, str) or not NODE_ID_RE.fullmatch(nid):
            errors.append(f"nodes[{index}].node_id must be a 32-character node id")
        url = node.get("url", "")
        if not isinstance(url, str) or not url:
            errors.append(f"nodes[{index}].url must be non-empty")
        enabled = node.get("enabled")
        if not isinstance(enabled, bool):
            errors.append(f"nodes[{index}].enabled must be a boolean")
    return errors


def merge_discovered(
    data: dict, refs: list[dict], *, default_enabled: bool = True
) -> dict:
    merged = {**data, "nodes": list(data.get("nodes", []))}
    known = {node["node_id"] for node in merged["nodes"]}
    for ref in refs:
        node_id = ref["node_id"]
        if node_id in known:
            continue
        url = ref.get("url", f"https://alidocs.dingtalk.com/i/nodes/{node_id}")
        merged["nodes"].append(_empty_node(node_id, url, enabled=default_enabled))
        known.add(node_id)
    return merged


def _quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def _format_scalar(key: str, value) -> str:
    if key == "enabled":
        return "true" if value else "false"
    if value is None:
        value = ""
    return _quote(str(value))


def dumps(data: dict) -> str:
    lines = [
        f"root_index_node_id: {_quote(data['root_index_node_id'])}",
        f"root_index_url: {_quote(data['root_index_url'])}",
        "nodes:",
    ]
    for node in data.get("nodes", []):
        lines.append(f"  - node_id: {_format_scalar('node_id', node['node_id'])}")
        for key in NODE_KEYS[1:]:
            lines.append(f"    {key}: {_format_scalar(key, node.get(key, ''))}")
    return "\n".join(lines) + "\n"


def _parse_quoted(raw: str) -> str:
    raw = raw.strip()
    if not (raw.startswith('"') and raw.endswith('"')):
        raise ValueError(f"expected quoted string, got {raw!r}")
    return json.loads(raw)


def _parse_scalar(key: str, raw: str):
    raw = raw.strip()
    if key == "enabled":
        if raw == "true":
            return True
        if raw == "false":
            return False
        raise ValueError(f"expected boolean, got {raw!r}")
    return _parse_quoted(raw)


def loads(text: str) -> dict:
    lines = text.splitlines()
    data: dict = {"nodes": []}
    index = 0
    while index < len(lines):
        line = lines[index]
        if line.startswith("root_index_node_id:"):
            data["root_index_node_id"] = _parse_scalar(
                "root_index_node_id", line.split(":", 1)[1]
            )
        elif line.startswith("root_index_url:"):
            data["root_index_url"] = _parse_scalar(
                "root_index_url", line.split(":", 1)[1]
            )
        elif line.strip() == "nodes:":
            index += 1
            nodes: list[dict] = []
            while index < len(lines) and lines[index].startswith("  - "):
                node: dict = {}
                first = lines[index][4:]
                key, raw = first.split(":", 1)
                node[key.strip()] = _parse_scalar(key.strip(), raw)
                index += 1
                while index < len(lines) and lines[index].startswith("    "):
                    key, raw = lines[index].strip().split(":", 1)
                    node[key.strip()] = _parse_scalar(key.strip(), raw)
                    index += 1
                nodes.append(node)
            data["nodes"] = nodes
            continue
        index += 1
    return data
