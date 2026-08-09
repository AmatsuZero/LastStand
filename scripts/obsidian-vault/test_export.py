import importlib.util, json, tempfile, unittest
from pathlib import Path

HERE=Path(__file__).parent
spec=importlib.util.spec_from_file_location('obsidian_export',HERE/'export.py')
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

class ExportTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.root=Path(self.tmp.name)
        self.source=self.root/'content'; self.vault=self.root/'obsidian'; self.source.mkdir(); self.vault.mkdir()
    def tearDown(self): self.tmp.cleanup()
    def put(self,rel,text='x'):
        p=self.source/rel; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text); return p
    def test_frontmatter_and_tags(self):
        data,body=mod.parse_frontmatter('+++\ntitle="T"\ntags=["AI Agent"]\ndraft=false\ndate=2026-01-02T03:04:05+08:00\nparams={ a = 1 }\n+++\nBody')
        self.assertEqual(data['title'],'T'); self.assertFalse(data['draft']); self.assertEqual(body,'Body')
        self.assertIsInstance(data['date'],mod.datetime.datetime); self.assertEqual(data['params'],{'a':1})
        self.assertIn('"a": 1',mod.yaml_value(data['params']))
        self.assertEqual(mod.yaml_value(data['date']),'2026-01-02T03:04:05+08:00')
        nested={'when':mod.datetime.date(2026,1,2),'items':[mod.datetime.time(3,4,5)]}
        rendered=mod.yaml_value(nested)
        self.assertIn('"when": 2026-01-02',rendered); self.assertIn('[03:04:05]',rendered)
        self.assertEqual(mod.normalize_tag('AI Agent'),'AI-Agent')
    def test_path_mapping(self):
        self.assertEqual(mod.note_path('posts/a/index.md').as_posix(),'posts/a.md')
        self.assertEqual(mod.note_path('posts/_index.md').as_posix(),'posts/_overview.md')
    def test_relref_shortcode_anchor_and_youtube(self):
        self.put('posts/a/index.md','+++\ntitle="A"\n+++\n## Heading {#old}\n')
        self.put('posts/b/index.md','+++\ntitle="B"\n+++\n[X]({{< relref "../a/#old" >}})\n{{< youtube abc >}}')
        e=mod.Exporter(self.source,self.vault); out=e.generate(False); text=out[self.vault/'Library/posts/b.md']
        self.assertIn('/Library/posts/a.md#Heading',text); self.assertIn('watch?v=abc',text); self.assertEqual(e.relrefs,1)
    def test_details_and_unknown_shortcode(self):
        self.put('a/index.md','+++\ntitle="A"\n+++\n{{< details summary="More" >}}x{{< /details >}} {{< mystery x >}}')
        e=mod.Exporter(self.source,self.vault); text=e.generate(False)[self.vault/'Library/a.md']
        self.assertIn('<summary>More</summary>',text); self.assertIn('</details>',text); self.assertTrue(e.warnings)
    def test_asset_and_manifest_and_check(self):
        self.put('p/index.md','+++\ntitle="P"\n+++\n![](pic.png)'); (self.source/'p/pic.png').write_bytes(b'png')
        e=mod.Exporter(self.source,self.vault); e.generate(True)
        self.assertTrue((self.vault/'Library/p/pic.png').is_file()); self.assertTrue((self.vault/'Library'/mod.DIR_MARKER).is_file())
        self.assertIn('/Library/p/pic.png',(self.vault/'Library/p.md').read_text())
        self.assertTrue(mod.Exporter(self.source,self.vault).check())
        (self.vault/'Library/p.md').write_text('changed'); self.assertFalse(mod.Exporter(self.source,self.vault).check())
    def test_refuses_unowned_library(self):
        self.put('a/index.md','+++\ntitle="A"\n+++\nx'); lib=self.vault/'Library'; lib.mkdir(); (lib/'mine.md').write_text('personal')
        with self.assertRaises(RuntimeError): mod.Exporter(self.source,self.vault).generate(True)
    def test_refuses_forged_marker(self):
        self.put('a/index.md','+++\ntitle="A"\n+++\nx'); lib=self.vault/'Library'; lib.mkdir(); (lib/mod.DIR_MARKER).write_text('{"generator":"other","version":1}')
        with self.assertRaises(RuntimeError): mod.Exporter(self.source,self.vault).generate(True)
    def test_check_detects_broken_generated_asset(self):
        self.put('p/index.md','+++\ntitle="P"\n+++\n![](missing.png)')
        e=mod.Exporter(self.source,self.vault); e.generate(False); self.assertTrue(any('missing local asset' in x for x in e.errors))
    def test_idempotent(self):
        self.put('a/index.md','+++\ntitle="A"\n+++\nx'); e=mod.Exporter(self.source,self.vault); e.generate(True)
        first={p.relative_to(self.vault):p.read_bytes() for p in self.vault.rglob('*') if p.is_file()}; mod.Exporter(self.source,self.vault).generate(True)
        second={p.relative_to(self.vault):p.read_bytes() for p in self.vault.rglob('*') if p.is_file()}; self.assertEqual(first,second)

if __name__=='__main__': unittest.main()
