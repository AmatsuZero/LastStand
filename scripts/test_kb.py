"""Exercise incremental indexing through the actual CLI and Git hook."""
import hashlib
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import tempfile
import unittest


SOURCE = Path(__file__).resolve().parent


class IncrementalIndexTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "scripts/git-hooks").mkdir(parents=True)
        shutil.copy2(SOURCE / "kb.py", self.root / "scripts/kb.py")
        for hook in ("post-commit", "post-merge"):
            shutil.copy2(SOURCE / "git-hooks" / hook, self.root / "scripts/git-hooks" / hook)
        self.article = self.root / "content/posts/fixture/index.md"
        self.article.parent.mkdir(parents=True)
        self.env = dict(os.environ, KB_HOME=str(self.root))
        # Keep a caller's repository/index settings out of the isolated Git fixture.
        for name in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"):
            self.env.pop(name, None)
        self.write_article("First version")

    def write_article(self, title):
        self.article.write_text(
            '---\ntitle: "' + title + '"\ndraft: true\n'
            'categories: ["绿联工作笔记"]\ntags: ["踩坑"]\n---\n\n## 现象\nFixture body.\n',
            encoding="utf-8",
        )

    def run_cli(self, *args):
        return subprocess.run(
            ["python3", str(self.root / "scripts/kb.py"), *args],
            env=self.env, cwd=self.root, capture_output=True, text=True, timeout=10,
        )

    def assert_current_index(self, title):
        with sqlite3.connect(self.root / "kb.db") as database:
            self.assertEqual(database.execute("SELECT title FROM posts").fetchall(), [(title,)])
            self.assertEqual(database.execute("SELECT hash FROM meta").fetchone()[0],
                             hashlib.sha256(self.article.read_bytes()).hexdigest())

    def test_modified_draft_replaces_existing_index_row(self):
        self.assertEqual(self.run_cli("build").returncode, 0)
        self.write_article("Updated draft")
        result = self.run_cli("build")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_current_index("Updated draft")
        result = self.run_cli("search", "Updated draft")
        self.assertIn("Updated draft", result.stdout)

    def test_existing_article_leaving_scope_is_removed(self):
        (self.root / "kb.toml").write_text('[scope]\ninclude_categories = ["绿联工作笔记"]\n')
        self.assertEqual(self.run_cli("build").returncode, 0)
        self.article.write_text('---\ntitle: "Other"\ncategories: ["Other"]\n---\nBody.\n')
        result = self.run_cli("build")
        self.assertEqual(result.returncode, 0, result.stderr)
        with sqlite3.connect(self.root / "kb.db") as database:
            self.assertEqual(database.execute("SELECT COUNT(*) FROM posts").fetchone()[0], 0)

    def test_commit_hook_refreshes_changed_article_without_push(self):
        def git(*args):
            result = subprocess.run(
                ["git", "-c", "core.hooksPath=.git/hooks", "-c", "user.name=Fixture",
                 "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", *args],
                env=self.env, cwd=self.root, capture_output=True, text=True, timeout=10,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            return result

        git("init")
        self.assertEqual(self.run_cli("init").returncode, 0)
        git("add", "content")
        git("commit", "-m", "Initial draft")
        self.assert_current_index("First version")
        self.write_article("Changed by commit")
        git("add", "content")
        result = git("commit", "-m", "Update draft")
        self.assertNotIn("Traceback", result.stderr)
        self.assert_current_index("Changed by commit")


if __name__ == "__main__":
    unittest.main()
