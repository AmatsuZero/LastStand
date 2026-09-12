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

    def test_extract_preserves_interleaved_order(self):
        md = """
        bare cccccccccccccccccccccccccccccccc first
        then [D](https://alidocs.dingtalk.com/i/nodes/dddddddddddddddddddddddddddddddd)
        """
        refs = mod.extract_node_refs(md)
        self.assertEqual(
            [r["node_id"] for r in refs],
            [
                "cccccccccccccccccccccccccccccccc",
                "dddddddddddddddddddddddddddddddd",
            ],
        )

    def test_extract_percent_encoded_node_url(self):
        node_id = "e" * 32
        md = (
            "[encoded](https://alidocs.dingtalk.com"
            f"%2Fi%2Fnodes%2F{node_id}%3Ffoo%3D1)"
        )
        self.assertEqual(
            [r["node_id"] for r in mod.extract_node_refs(md)],
            [node_id],
        )

    def test_does_not_extract_sso_code(self):
        code = "0123456789abcdef0123456789abcdef"
        md = f"[sign in](https://example.com/sso/callback?state=x&code={code})"
        self.assertEqual(mod.extract_node_refs(md), [])


if __name__ == "__main__":
    unittest.main()
