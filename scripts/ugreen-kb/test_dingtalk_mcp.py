import importlib.util
import json
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).parent


def load():
    spec = importlib.util.spec_from_file_location("ugreen_kb_dingtalk_mcp", HERE / "dingtalk_mcp.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class _Handler(BaseHTTPRequestHandler):
    calls = []

    def log_message(self, *_args):
        pass

    def do_POST(self):
        length = int(self.headers["Content-Length"])
        payload = json.loads(self.rfile.read(length))
        self.__class__.calls.append(payload)
        if payload.get("method") == "notifications/initialized":
            self.send_response(202)
            self.end_headers()
            return

        if payload["method"] == "initialize":
            result = {"protocolVersion": "2025-03-26", "capabilities": {}, "serverInfo": {}}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Mcp-Session-Id", "test-session")
        elif payload["params"]["name"] == "structured":
            result = {"structuredContent": {"value": 1}}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        elif payload["params"]["name"] == "empty":
            result = {"content": []}
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        else:
            result = {"content": [{"type": "text", "text": '{"value": 2}'}]}
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
        body = json.dumps({"jsonrpc": "2.0", "id": payload["id"], "result": result}).encode()
        if payload["method"] == "tools/call" and payload["params"]["name"] != "structured":
            body = b"event: message\ndata: " + body + b"\n\n"
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class ExtractDocumentMarkdownTests(unittest.TestCase):
    def test_accepts_string_and_dict_shapes(self):
        mod = load()
        self.assertEqual(mod.extract_document_markdown("# hi"), "# hi")
        self.assertEqual(
            mod.extract_document_markdown({"markdown": "# md"}),
            "# md",
        )
        self.assertEqual(
            mod.extract_document_markdown({"content": "# body"}),
            "# body",
        )

    def test_rejects_empty_or_unsupported_shapes(self):
        mod = load()
        for bad in ("", "   ", {}, {"title": "x"}, [], 0):
            with self.subTest(bad=bad):
                with self.assertRaises(mod.DingTalkMcpError):
                    mod.extract_document_markdown(bad)


class DingTalkMcpTests(unittest.TestCase):
    def setUp(self):
        _Handler.calls = []
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()

    def test_initializes_then_calls_and_parses_response_shapes(self):
        mod = load()
        url = f"http://127.0.0.1:{self.server.server_port}/mcp?key=secret"
        with tempfile.TemporaryDirectory() as tmp:
            config = Path(tmp) / "mcp.json"
            config.write_text(
                json.dumps({"mcpServers": {"dingtalk-doc": {"url": url}}}),
                encoding="utf-8",
            )
            client = mod.DingTalkMcpClient(config_path=config)
            self.assertEqual(client.call("structured", {}), {"value": 1})
            self.assertEqual(client.call("text", {"nodeId": "n"}), {"value": 2})

        methods = [call["method"] for call in _Handler.calls]
        self.assertEqual(
            methods,
            ["initialize", "notifications/initialized", "tools/call", "tools/call"],
        )
        self.assertEqual(
            _Handler.calls[2]["params"],
            {"name": "structured", "arguments": {}},
        )

    def test_raises_on_empty_or_missing_tool_content(self):
        mod = load()
        url = f"http://127.0.0.1:{self.server.server_port}/mcp?key=secret"
        with tempfile.TemporaryDirectory() as tmp:
            config = Path(tmp) / "mcp.json"
            config.write_text(
                json.dumps({"mcpServers": {"dingtalk-doc": {"url": url}}}),
                encoding="utf-8",
            )
            client = mod.DingTalkMcpClient(config_path=config)
            with self.assertRaises(mod.DingTalkMcpError):
                client.call("empty", {})


if __name__ == "__main__":
    unittest.main()
