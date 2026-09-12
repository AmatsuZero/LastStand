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

    def test_rejects_invalid_node_id(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for bad_id in ("short", "../" + "c" * 32, "c" * 31, "c" * 33, "c" * 16 + "/" + "c" * 16):
                with self.subTest(node_id=bad_id):
                    with self.assertRaises(ValueError):
                        mod.write_source(
                            root,
                            bad_id,
                            title="T",
                            body="hello",
                            source_url="https://example.com",
                        )

    def test_metadata_refresh_without_prev(self):
        node_id = "d" * 32
        url = f"https://alidocs.dingtalk.com/i/nodes/{node_id}"
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            mod.write_source(root, node_id, title="Old", body="same", source_url=url)
            doc = root / "sources" / node_id / "doc.md"
            first_text = doc.read_text()
            r = mod.write_source(
                root,
                node_id,
                title="New",
                body="same",
                source_url=url + "?v=2",
            )
            self.assertFalse(r["changed"])
            self.assertFalse((root / "sources" / node_id / "doc.prev.md").is_file())
            second_text = doc.read_text()
            self.assertNotEqual(first_text, second_text)
            self.assertIn('"New"', second_text)
            self.assertIn("?v=2", second_text)

    def test_chinese_title_is_readable(self):
        node_id = "e" * 32
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            mod.write_source(
                root,
                node_id,
                title="产品说明",
                body="body",
                source_url=f"https://alidocs.dingtalk.com/i/nodes/{node_id}",
            )
            doc = root / "sources" / node_id / "doc.md"
            self.assertIn('title: "产品说明"', doc.read_text(encoding="utf-8"))

    def test_non_json_frontmatter_is_treated_as_no_prior_hash(self):
        node_id = "f" * 32
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            doc_dir = root / "sources" / node_id
            doc_dir.mkdir(parents=True)
            doc = doc_dir / "doc.md"
            doc.write_text(
                "---\ntitle: unquoted\ncontent_hash: invalid\n---\nold",
                encoding="utf-8",
            )
            result = mod.write_source(
                root,
                node_id,
                title="New",
                body="new",
                source_url=f"https://alidocs.dingtalk.com/i/nodes/{node_id}",
            )
            self.assertTrue(result["changed"])
            self.assertTrue((doc_dir / "doc.prev.md").is_file())


if __name__ == "__main__":
    unittest.main()
