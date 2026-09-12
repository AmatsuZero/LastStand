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

    def test_validate_rejects_non_dict_node(self):
        data = inv.empty_inventory(self.ROOT)
        data["nodes"] = ["not-a-dict"]
        errs = inv.validate(data)
        self.assertIn("nodes[0] must be a mapping", errs)

    def test_multiline_last_error_roundtrip(self):
        data = inv.empty_inventory(self.ROOT)
        node_id = "a" * 32
        data["nodes"] = [
            {
                "node_id": node_id,
                "title": "",
                "url": f"https://alidocs.dingtalk.com/i/nodes/{node_id}",
                "kind": "doc",
                "enabled": True,
                "last_synced_at": "",
                "content_hash": "",
                "version": "",
                "maps_to": "",
                "last_error": "line1\nline2\tcontrol",
            }
        ]
        again = inv.loads(inv.dumps(data))
        self.assertEqual(again["nodes"][0]["last_error"], "line1\nline2\tcontrol")

    def test_dumps_keeps_chinese_readable(self):
        data = inv.empty_inventory(self.ROOT)
        data["nodes"] = [
            {
                **inv._empty_node("a" * 32, f"https://alidocs.dingtalk.com/i/nodes/{'a' * 32}"),
                "title": "产品说明",
            }
        ]
        self.assertIn('"产品说明"', inv.dumps(data))


if __name__ == "__main__":
    unittest.main()
