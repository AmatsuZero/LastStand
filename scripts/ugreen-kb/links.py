"""Extract DingTalk alidocs node references from Markdown."""
from __future__ import annotations

import re
from urllib.parse import unquote

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
    markdown = unquote(markdown)
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

    matches: list[tuple[int, str]] = []
    for m in URL_RE.finditer(markdown):
        matches.append((m.start(), m.group(1)))
    for m in BARE_RE.finditer(markdown):
        # OAuth/SSO callbacks commonly contain unrelated 32-hex `code` values.
        if markdown[max(0, m.start() - 5) : m.start()].lower() == "code=":
            continue
        matches.append((m.start(), m.group(1)))
    for _, node_id in sorted(matches, key=lambda item: item[0]):
        add(node_id)
    return found
