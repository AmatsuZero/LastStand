"""Write DingTalk source exports under sources/<node_id>/ with content hashing."""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

NODE_ID_RE = re.compile(r"^[A-Za-z0-9]{32}$")


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def _read_frontmatter(doc_path: Path) -> dict[str, str] | None:
    text = doc_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    frontmatter: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if ":" not in line:
            continue
        key, raw = line.split(":", 1)
        try:
            frontmatter[key.strip()] = json.loads(raw.strip())
        except (json.JSONDecodeError, TypeError):
            # Hand-edited/non-JSON frontmatter cannot provide a trusted prior hash.
            return None
    return frontmatter


def _read_content_hash(doc_path: Path) -> str | None:
    frontmatter = _read_frontmatter(doc_path)
    if frontmatter is None:
        return None
    return frontmatter.get("content_hash")


def _build_doc(
    *,
    title: str,
    node_id: str,
    source_url: str,
    synced_at: str,
    body_hash: str,
    body: str,
) -> str:
    frontmatter = "\n".join(
        [
            "---",
            f"title: {_quote(title)}",
            f"dingtalk_node_id: {_quote(node_id)}",
            f"source_url: {_quote(source_url)}",
            f"synced_at: {_quote(synced_at)}",
            f"content_hash: {_quote(body_hash)}",
            "---",
            "",
        ]
    )
    return frontmatter + body


def write_source(
    root: Path,
    node_id: str,
    *,
    title: str,
    body: str,
    source_url: str,
) -> dict:
    if not NODE_ID_RE.fullmatch(node_id):
        raise ValueError(f"invalid node_id: {node_id!r}")

    doc_dir = root / "sources" / node_id
    doc_path = doc_dir / "doc.md"
    body_hash = content_hash(body)

    old_hash: str | None = None
    old_frontmatter: dict[str, str] | None = None
    if doc_path.is_file():
        old_frontmatter = _read_frontmatter(doc_path)
        old_hash = old_frontmatter.get("content_hash") if old_frontmatter else None

    changed = old_hash != body_hash

    if changed and doc_path.is_file():
        shutil.copy2(doc_path, doc_dir / "doc.prev.md")

    metadata_refresh = (
        not changed
        and old_frontmatter is not None
        and (
            old_frontmatter.get("title") != title
            or old_frontmatter.get("source_url") != source_url
        )
    )

    if changed or metadata_refresh:
        synced_at = datetime.now(timezone.utc).isoformat()
        doc_dir.mkdir(parents=True, exist_ok=True)
        doc_path.write_text(
            _build_doc(
                title=title,
                node_id=node_id,
                source_url=source_url,
                synced_at=synced_at,
                body_hash=body_hash,
                body=body,
            ),
            encoding="utf-8",
        )

    return {"path": str(doc_path), "content_hash": body_hash, "changed": changed}
