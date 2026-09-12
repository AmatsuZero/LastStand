"""Minimal stdlib client for the configured DingTalk document MCP gateway."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class DingTalkMcpError(RuntimeError):
    """An MCP request failed without exposing the configured gateway URL."""


def extract_document_markdown(content: object) -> str:
    """Return markdown body from a ``get_document_content`` tool result."""
    if isinstance(content, str):
        body = content
    elif isinstance(content, dict):
        body = None
        for key in ("markdown", "content"):
            value = content.get(key)
            if isinstance(value, str):
                body = value
                break
        if body is None:
            raise DingTalkMcpError("MCP document content has unsupported shape")
    else:
        raise DingTalkMcpError("MCP document content has unsupported shape")
    if not body.strip():
        raise DingTalkMcpError("MCP document content is empty")
    return body


class DingTalkMcpClient:
    def __init__(self, config_path: Path | None = None, *, timeout: float = 60):
        path = config_path or Path.home() / ".cursor" / "mcp.json"
        try:
            config = json.loads(path.read_text(encoding="utf-8"))
            self._url = config["mcpServers"]["dingtalk-doc"]["url"]
        except (OSError, KeyError, TypeError, json.JSONDecodeError) as exc:
            raise DingTalkMcpError("cannot read dingtalk-doc MCP configuration") from exc
        if not isinstance(self._url, str) or not self._url:
            raise DingTalkMcpError("dingtalk-doc MCP URL is missing")
        self._timeout = timeout
        self._session_id: str | None = None
        self._next_id = 1
        self._initialized = False

    def _decode_response(self, body: bytes, content_type: str) -> dict | None:
        text = body.decode("utf-8")
        if not text.strip():
            return None
        if "text/event-stream" in content_type:
            data_lines = [
                line[5:].lstrip()
                for line in text.splitlines()
                if line.startswith("data:")
            ]
            if not data_lines:
                raise DingTalkMcpError("MCP gateway returned an invalid event stream")
            text = "\n".join(data_lines)
        try:
            value = json.loads(text)
        except json.JSONDecodeError as exc:
            raise DingTalkMcpError("MCP gateway returned invalid JSON") from exc
        if not isinstance(value, dict):
            raise DingTalkMcpError("MCP gateway returned an invalid response")
        return value

    def _post(self, payload: dict) -> dict | None:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }
        if self._session_id:
            headers["Mcp-Session-Id"] = self._session_id
        request = Request(
            self._url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with urlopen(request, timeout=self._timeout) as response:
                session_id = response.headers.get("Mcp-Session-Id")
                if session_id:
                    self._session_id = session_id
                result = self._decode_response(
                    response.read(), response.headers.get("Content-Type", "")
                )
        except HTTPError as exc:
            raise DingTalkMcpError(f"MCP gateway HTTP error {exc.code}") from None
        except (URLError, TimeoutError, OSError) as exc:
            raise DingTalkMcpError(
                f"MCP gateway request failed ({type(exc).__name__})"
            ) from None
        if result and "error" in result:
            error = result["error"]
            message = error.get("message", "unknown error") if isinstance(error, dict) else "unknown error"
            raise DingTalkMcpError(f"MCP error: {message}")
        return result

    def _request(self, method: str, params: dict) -> dict:
        request_id = self._next_id
        self._next_id += 1
        response = self._post(
            {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}
        )
        if not response or response.get("id") != request_id or "result" not in response:
            raise DingTalkMcpError("MCP gateway returned a mismatched response")
        result = response["result"]
        if not isinstance(result, dict):
            raise DingTalkMcpError("MCP gateway returned an invalid result")
        return result

    def initialize(self) -> None:
        if self._initialized:
            return
        self._request(
            "initialize",
            {
                "protocolVersion": "2025-03-26",
                "capabilities": {},
                "clientInfo": {"name": "ugreen-kb", "version": "1"},
            },
        )
        self._post({"jsonrpc": "2.0", "method": "notifications/initialized"})
        self._initialized = True

    def call(self, name: str, arguments: dict) -> object:
        self.initialize()
        result = self._request(
            "tools/call", {"name": name, "arguments": arguments}
        )
        if result.get("isError"):
            raise DingTalkMcpError(f"MCP tool {name} returned an error")
        if "structuredContent" in result:
            return result["structuredContent"]
        content = result.get("content")
        if isinstance(content, list):
            if not content:
                raise DingTalkMcpError(f"MCP tool {name} returned empty content")
            first = content[0]
            if not isinstance(first, dict) or not isinstance(first.get("text"), str):
                raise DingTalkMcpError(f"MCP tool {name} returned unsupported content shape")
            try:
                return json.loads(first["text"])
            except json.JSONDecodeError:
                return first["text"]
        raise DingTalkMcpError(f"MCP tool {name} returned no structured or text content")
