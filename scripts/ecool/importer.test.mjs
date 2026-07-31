import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  runBatch,
  writeArticleAtomically,
  writeSectionIndexes,
} from './importer.mjs';

const SOURCE_URL = 'https://fe.ecool.fun/knowledge-learn';

async function withTemporaryRoot(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ecool-importer-'));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function article(overrides = {}) {
  return {
    category: 'JavaScript',
    title: '测试文章',
    slug: 'javascript-001',
    date: '2024-10-01',
    lastmod: '2025-07-16',
    weight: 1,
    markdown: '## 正文\n\n这是可恢复导入测试。\n',
    imageCount: 0,
    ...overrides,
  };
}

function fakeTab() {
  let selectedTitle = '';
  return {
    async url() {
      return SOURCE_URL;
    },
    playwright: {
      locator(selector) {
        if (selector === '.ant-tree-node-content-wrapper') {
          return {
            async count() { return 2; },
            nth() {
              return {
                async click() {
                  selectedTitle = '测试文章';
                },
              };
            },
          };
        }
        if (selector === '#info-title') {
          return {
            async waitFor() {},
            async innerText() { return selectedTitle; },
          };
        }
        throw new Error(`unexpected selector: ${selector}`);
      },
      async evaluate() {
        return JSON.stringify({
          title: '测试文章',
          date: '2024-10-01',
          lastmod: '2025-07-16',
          blocks: [{ type: 'paragraph', children: [{ type: 'text', value: '批处理正文' }] }],
        });
      },
    },
    capabilities: {
      async get(name) {
        assert.equal(name, 'pageAssets');
        return {
          async list() { return { id: 'assets', assets: [] }; },
        };
      },
    },
  };
}

test('writeArticleAtomically writes a new article and safely skips identical content', async () => {
  await withTemporaryRoot(async (root) => {
    const record = article();
    const first = await writeArticleAtomically(root, record);
    const target = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001/index.md');

    assert.equal(first.status, 'written');
    assert.match(await readFile(target, 'utf8'), /title = "测试文章"/);
    assert.match(await readFile(target, 'utf8'), /## 正文/);

    const second = await writeArticleAtomically(root, record);
    assert.equal(second.status, 'skipped');
    assert.equal(second.fileChecksum, first.fileChecksum);
  });
});

test('writeArticleAtomically fails closed when existing content differs', async () => {
  await withTemporaryRoot(async (root) => {
    await writeArticleAtomically(root, article());
    const target = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001/index.md');
    const original = await readFile(target, 'utf8');

    await assert.rejects(
      () => writeArticleAtomically(root, article({ markdown: '## 已修改\n\n不能覆盖已有文件。\n' })),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(target, 'utf8'), original);
  });
});

test('writeArticleAtomically completes its unique temporary file before renaming it', async () => {
  await withTemporaryRoot(async (root) => {
    let observed;
    await writeArticleAtomically(root, article({
      onTemporaryWrite: async ({ temporaryPath, targetPath, content }) => {
        observed = {
          temporary: await readFile(temporaryPath, 'utf8'),
          targetExists: await stat(targetPath).then(() => true, () => false),
          content,
        };
      },
    }));

    assert.deepEqual(observed, {
      temporary: observed.content,
      targetExists: false,
      content: observed.content,
    });
    const articleDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    assert.deepEqual((await readdir(articleDirectory)).sort(), ['index.md']);
  });
});

test('writeArticleAtomically fails closed when another importer owns the target lock', async () => {
  await withTemporaryRoot(async (root) => {
    let releaseFirst;
    const firstPaused = new Promise((resolve) => {
      releaseFirst = resolve;
    });
    let firstTemporaryWritten;
    const firstReady = new Promise((resolve) => {
      firstTemporaryWritten = resolve;
    });
    const first = writeArticleAtomically(root, article({
      onTemporaryWrite: async () => {
        firstTemporaryWritten();
        await firstPaused;
      },
    }));
    await firstReady;

    await assert.rejects(
      () => writeArticleAtomically(root, article({ markdown: '## 竞争写入\n\n不能绕过锁。\n' })),
      (error) => error?.code === 'TARGET_LOCKED',
    );
    releaseFirst();
    assert.equal((await first).status, 'written');
  });
});

test('runBatch resumes only checkpoint entries whose on-disk checksum still matches', async () => {
  await withTemporaryRoot(async (root) => {
    const catalog = [{
      category: 'JavaScript',
      title: '测试文章',
      treeIndex: 1,
      nodeCount: 2,
      vip: false,
      weight: 1,
    }];
    const first = await runBatch({ tab: fakeTab(), root, catalog, start: 0, limit: 1 });
    const checkpointPath = path.join(root, '.omc/state/ecool-import.json');
    const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
    const target = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001/index.md');

    assert.equal(first.completed, 1);
    assert.equal(checkpoint.completed.length, 1);
    assert.equal(checkpoint.completed[0].title, '测试文章');
    assert.equal(checkpoint.completed[0].path, 'content/posts/interview/ecool/javascript/javascript-001/index.md');
    assert.match(checkpoint.completed[0].checksum, /^[a-f0-9]{64}$/);

    const resumed = await runBatch({
      tab: { url: async () => { throw new Error('completed item must not reopen the browser'); } },
      root,
      catalog,
      start: 0,
      limit: 1,
    });
    assert.equal(resumed.skipped, 1);
    assert.match(await readFile(target, 'utf8'), /批处理正文/);
  });
});

test('runBatch rejects browser batches larger than twenty entries', async () => {
  await withTemporaryRoot(async (root) => {
    await assert.rejects(
      () => runBatch({ tab: fakeTab(), root, catalog: [], start: 0, limit: 21 }),
      (error) => error?.code === 'BATCH_LIMIT_EXCEEDED',
    );
  });
});

test('writeSectionIndexes creates the root and ten ordered category indexes', async () => {
  await withTemporaryRoot(async (root) => {
    const result = await writeSectionIndexes(root, []);
    const ecoolRoot = path.join(root, 'content/posts/interview/ecool');
    const rootIndex = await readFile(path.join(ecoolRoot, '_index.md'), 'utf8');
    const engineering = await readFile(path.join(ecoolRoot, 'engineering/_index.md'), 'utf8');

    assert.equal(result.written, 11);
    assert.match(rootIndex, /title = "ECool 前端面试资料"/);
    assert.match(rootIndex, /draft = true/);
    assert.match(rootIndex, /weight = -90/);
    assert.match(engineering, /title = "工程化"/);
    assert.match(engineering, /weight = 10/);
    assert.match(engineering, /tags = \["工程化", "ecool"\]/);
    assert.match(engineering, /categories = \["前端开发", "面试"\]/);
    assert.match(engineering, /source = "https:\/\/fe\.ecool\.fun\/knowledge-learn"/);
  });
});
