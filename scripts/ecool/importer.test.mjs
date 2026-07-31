import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
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

async function withBatchRoot(run) {
  await withTemporaryRoot(async (root) => {
    await writeSectionIndexes(root, []);
    await run(root);
  });
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

function catalogEntry(overrides = {}) {
  return {
    category: 'JavaScript',
    title: '测试文章',
    treeIndex: 1,
    nodeCount: 2,
    vip: false,
    weight: 1,
    ...overrides,
  };
}

function fakeTab({ title = '测试文章', blocks, assets = [], bundledAssets = assets, beforeSelect, nodeCount = 2 } = {}) {
  let selectedTitle = '';
  return {
    async url() {
      return SOURCE_URL;
    },
    playwright: {
      locator(selector) {
        if (selector === '.ant-tree-node-content-wrapper') {
          return {
            async count() { return nodeCount; },
            nth() {
              return {
                async click() {
                  if (beforeSelect) await beforeSelect();
                  selectedTitle = title;
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
          title,
          date: '2024-10-01',
          lastmod: '2025-07-16',
          blocks: blocks || [{ type: 'paragraph', children: [{ type: 'text', value: '批处理正文' }] }],
        });
      },
    },
    capabilities: {
      async get(name) {
        assert.equal(name, 'pageAssets');
        return {
          async list() { return { id: 'assets', assets }; },
          async bundle() { return { assets: bundledAssets, summary: { failedCount: 0 } }; },
        };
      },
    },
  };
}

function webpBytes() {
  return Buffer.from([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
}

function imageBlock(url) {
  return [{ type: 'paragraph', children: [{ type: 'image', src: url, alt: '示意图' }] }];
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

test('writeArticleAtomically preserves a non-cooperating target created at final commit time', async () => {
  await withTemporaryRoot(async (root) => {
    const target = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001/index.md');
    const externalContent = '用户在提交瞬间创建的内容。\n';

    await assert.rejects(
      () => writeArticleAtomically(root, article({
        onBeforeCommit: async ({ targetPath }) => {
          assert.equal(targetPath, target);
          await writeFile(targetPath, externalContent);
        },
      })),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(target, 'utf8'), externalContent);
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

test('writeArticleAtomically clears its target lock after an exceptional temporary write hook', async () => {
  await withTemporaryRoot(async (root) => {
    await assert.rejects(
      () => writeArticleAtomically(root, article({
        onTemporaryWrite: async () => { throw new Error('temporary hook failed'); },
      })),
      /temporary hook failed/,
    );
    assert.equal((await writeArticleAtomically(root, article())).status, 'written');
  });
});

test('runBatch resumes only checkpoint entries whose on-disk checksum still matches', async () => {
  await withBatchRoot(async (root) => {
    const catalog = [catalogEntry()];
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

test('runBatch stages image bundles so an index conflict leaves the existing bundle untouched', async () => {
  await withTemporaryRoot(async (root) => {
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    const targetIndex = path.join(targetDirectory, 'index.md');
    const targetImage = path.join(targetDirectory, 'image-01.webp');
    const bundledPath = path.join(root, 'bundled.webp');
    await mkdir(targetDirectory, { recursive: true });
    await writeFile(targetIndex, '用户文章\n');
    await writeFile(targetImage, '用户图片\n');
    await writeFile(bundledPath, webpBytes());
    const url = 'https://static.ecool.fun/article/example.webp';

    await assert.rejects(
      () => runBatch({
        tab: fakeTab({
          blocks: imageBlock(url),
          assets: [{ id: 'image-1', kind: 'image', url }],
          bundledAssets: [{ id: 'image-1', path: bundledPath }],
        }),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
      }),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(targetIndex, 'utf8'), '用户文章\n');
    assert.equal(await readFile(targetImage, 'utf8'), '用户图片\n');
    assert.deepEqual((await readdir(targetDirectory)).sort(), ['image-01.webp', 'index.md']);
  });
});

test('runBatch discards a staged bundle when page-assets fail partway through', async () => {
  await withTemporaryRoot(async (root) => {
    const firstBundledPath = path.join(root, 'first.webp');
    await writeFile(firstBundledPath, webpBytes());
    const firstUrl = 'https://static.ecool.fun/article/first.webp';
    const secondUrl = 'https://static.ecool.fun/article/second.webp';
    const blocks = [
      ...imageBlock(firstUrl),
      ...imageBlock(secondUrl),
    ];

    await assert.rejects(
      () => runBatch({
        tab: fakeTab({
          blocks,
          assets: [
            { id: 'image-1', kind: 'image', url: firstUrl },
            { id: 'image-2', kind: 'image', url: secondUrl },
          ],
          bundledAssets: [{ id: 'image-1', path: firstBundledPath }],
        }),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
      }),
      (error) => error?.code === 'PAGE_ASSET_BUNDLE_MISSING',
    );
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    assert.equal(await stat(targetDirectory).then(() => true, () => false), false);
  });
});

test('runBatch leaves no target bundle when final directory commit fails', async () => {
  await withBatchRoot(async (root) => {
    await assert.rejects(
      () => runBatch({
        tab: fakeTab(),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
        onBeforeBundleCommit: async () => { throw new Error('commit interrupted'); },
      }),
      /commit interrupted/,
    );
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    assert.equal(await stat(targetDirectory).then(() => true, () => false), false);
  });
});

test('runBatch preserves an external bundle created during final directory commit', async () => {
  await withBatchRoot(async (root) => {
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    const marker = path.join(targetDirectory, 'external.txt');
    await assert.rejects(
      () => runBatch({
        tab: fakeTab(),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
        onBeforeBundleCommit: async ({ targetDirectory: commitTarget }) => {
          assert.equal(commitTarget, targetDirectory);
          await mkdir(commitTarget, { recursive: true });
          await writeFile(marker, '外部写入\n');
        },
      }),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(marker, 'utf8'), '外部写入\n');
    assert.deepEqual(await readdir(targetDirectory), ['external.txt']);
  });
});

test('runBatch never replaces an empty target directory created after the final precheck', async () => {
  await withBatchRoot(async (root) => {
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    await assert.rejects(
      () => runBatch({
        tab: fakeTab(),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
        onAfterBundlePrecheck: async ({ targetDirectory: publishTarget }) => {
          assert.equal(publishTarget, targetDirectory);
          await mkdir(publishTarget, { recursive: true });
        },
      }),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.deepEqual(await readdir(targetDirectory), []);
  });
});

test('runBatch fails closed when a category parent is swapped to a symlink after the final precheck', async () => {
  await withTemporaryRoot(async (root) => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'ecool-outside-raced-parent-'));
    try {
      const categoryParent = path.join(root, 'content/posts/interview/ecool/javascript');
      const displacedParent = path.join(root, 'content/posts/interview/ecool/javascript.original');
      const outsideTarget = path.join(outside, 'javascript-001');
      await mkdir(categoryParent, { recursive: true });
      await writeFile(path.join(categoryParent, '_index.md'), '受信任栏目\n');

      await assert.rejects(
        () => runBatch({
          tab: fakeTab(),
          root,
          catalog: [catalogEntry()],
          start: 0,
          limit: 1,
          onAfterBundlePrecheck: async ({ targetDirectory }) => {
            assert.equal(targetDirectory, path.join(categoryParent, 'javascript-001'));
            await rename(categoryParent, displacedParent);
            await symlink(outside, categoryParent);
          },
        }),
        (error) => error?.code === 'TARGET_CONFLICT',
      );
      assert.equal((await lstat(categoryParent)).isSymbolicLink(), true);
      assert.equal(await stat(outsideTarget).then(() => true, () => false), false);
      assert.deepEqual(await readdir(outside), []);
      assert.equal(await readFile(path.join(displacedParent, '_index.md'), 'utf8'), '受信任栏目\n');
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('runBatch requires the checked-in category parent instead of creating target parents recursively', async () => {
  await withTemporaryRoot(async (root) => {
    const categoryParent = path.join(root, 'content/posts/interview/ecool/javascript');
    const targetDirectory = path.join(categoryParent, 'javascript-001');

    await assert.rejects(
      () => runBatch({ tab: fakeTab(), root, catalog: [catalogEntry()], start: 0, limit: 1 }),
      (error) => error?.code === 'TARGET_PARENT_MISSING',
    );
    assert.equal(await stat(categoryParent).then(() => true, () => false), false);
    assert.equal(await stat(targetDirectory).then(() => true, () => false), false);
  });
});

test('runBatch rejects a target-directory symlink without adopting outside matching files', async () => {
  await withBatchRoot(async (root) => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'ecool-outside-target-'));
    try {
      const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
      await assert.rejects(
        () => runBatch({
          tab: fakeTab(),
          root,
          catalog: [catalogEntry()],
          start: 0,
          limit: 1,
          onBeforeBundleCommit: async ({ stagingDirectory }) => {
            await mkdir(path.dirname(targetDirectory), { recursive: true });
            await writeFile(path.join(outside, 'index.md'), await readFile(path.join(stagingDirectory, 'index.md')));
            await symlink(outside, targetDirectory);
          },
        }),
        (error) => error?.code === 'TARGET_CONFLICT',
      );
      assert.equal((await lstat(targetDirectory)).isSymbolicLink(), true);
      assert.match(await readFile(path.join(outside, 'index.md'), 'utf8'), /测试文章/);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('runBatch rejects a symlinked category parent without writing outside root', async () => {
  await withTemporaryRoot(async (root) => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'ecool-outside-parent-'));
    try {
      const categoryParent = path.join(root, 'content/posts/interview/ecool');
      const categoryLink = path.join(categoryParent, 'javascript');
      await mkdir(categoryParent, { recursive: true });
      await symlink(outside, categoryLink);

      await assert.rejects(
        () => runBatch({ tab: fakeTab(), root, catalog: [catalogEntry()], start: 0, limit: 1 }),
        (error) => error?.code === 'TARGET_CONFLICT',
      );
      assert.equal((await lstat(categoryLink)).isSymbolicLink(), true);
      assert.deepEqual(await readdir(outside), []);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('runBatch rejects a higher symlinked parent without writing outside root', async () => {
  await withTemporaryRoot(async (root) => {
    const outside = await mkdtemp(path.join(os.tmpdir(), 'ecool-outside-ancestor-'));
    try {
      const interviewParent = path.join(root, 'content/posts/interview');
      const ecoolLink = path.join(interviewParent, 'ecool');
      await mkdir(interviewParent, { recursive: true });
      await symlink(outside, ecoolLink);

      await assert.rejects(
        () => runBatch({ tab: fakeTab(), root, catalog: [catalogEntry()], start: 0, limit: 1 }),
        (error) => error?.code === 'TARGET_CONFLICT',
      );
      assert.equal((await lstat(ecoolLink)).isSymbolicLink(), true);
      assert.deepEqual(await readdir(outside), []);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });
});

test('runBatch reports a regular file at the target-directory path as TARGET_CONFLICT', async () => {
  await withTemporaryRoot(async (root) => {
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    await mkdir(path.dirname(targetDirectory), { recursive: true });
    await writeFile(targetDirectory, '用户文件\n');

    await assert.rejects(
      () => runBatch({ tab: fakeTab(), root, catalog: [catalogEntry()], start: 0, limit: 1 }),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(targetDirectory, 'utf8'), '用户文件\n');
  });
});

test('runBatch safely adopts an identical complete bundle after checkpoint persistence fails', async () => {
  await withBatchRoot(async (root) => {
    const checkpointPath = path.join(root, '.omc/state/ecool-import.json');
    const bundledPath = path.join(root, 'recovery.webp');
    await writeFile(bundledPath, webpBytes());
    const url = 'https://static.ecool.fun/article/recovery.webp';
    const options = {
      blocks: imageBlock(url),
      assets: [{ id: 'image-1', kind: 'image', url }],
      bundledAssets: [{ id: 'image-1', path: bundledPath }],
    };
    await assert.rejects(
      () => runBatch({
        tab: fakeTab({
          ...options,
          beforeSelect: async () => { await mkdir(checkpointPath, { recursive: true }); },
        }),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
      }),
      (error) => error?.code === 'EISDIR',
    );
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    const targetIndex = path.join(targetDirectory, 'index.md');
    const targetImage = path.join(targetDirectory, 'image-01.webp');
    const originalIndex = await readFile(targetIndex);
    const originalImage = await readFile(targetImage);
    await rm(checkpointPath, { recursive: true, force: true });

    const resumed = await runBatch({ tab: fakeTab(options), root, catalog: [catalogEntry()], start: 0, limit: 1 });
    assert.equal(resumed.skipped, 1);
    assert.deepEqual(await readFile(targetIndex), originalIndex);
    assert.deepEqual(await readFile(targetImage), originalImage);
    const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
    assert.equal(checkpoint.completed.length, 1);
  });
});

test('runBatch recovery rejects bundles with extra or changed target assets', async () => {
  await withBatchRoot(async (root) => {
    const checkpointPath = path.join(root, '.omc/state/ecool-import.json');
    const bundledPath = path.join(root, 'different.webp');
    await writeFile(bundledPath, webpBytes());
    const url = 'https://static.ecool.fun/article/different.webp';
    const options = {
      blocks: imageBlock(url),
      assets: [{ id: 'image-1', kind: 'image', url }],
      bundledAssets: [{ id: 'image-1', path: bundledPath }],
    };
    await assert.rejects(
      () => runBatch({
        tab: fakeTab({ ...options, beforeSelect: async () => { await mkdir(checkpointPath, { recursive: true }); } }),
        root,
        catalog: [catalogEntry()],
        start: 0,
        limit: 1,
      }),
      (error) => error?.code === 'EISDIR',
    );
    const targetDirectory = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001');
    const targetImage = path.join(targetDirectory, 'image-01.webp');
    await rm(checkpointPath, { recursive: true, force: true });
    await writeFile(targetImage, '用户替换的图片\n');
    await writeFile(path.join(targetDirectory, 'external.txt'), '额外文件\n');

    await assert.rejects(
      () => runBatch({ tab: fakeTab(options), root, catalog: [catalogEntry()], start: 0, limit: 1 }),
      (error) => error?.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(targetImage, 'utf8'), '用户替换的图片\n');
    assert.equal(await readFile(path.join(targetDirectory, 'external.txt'), 'utf8'), '额外文件\n');
  });
});

test('runBatch merges concurrent checkpoint updates from separate batches', async () => {
  await withBatchRoot(async (root) => {
    let releaseSelections;
    const selectionGate = new Promise((resolve) => { releaseSelections = resolve; });
    let selected = 0;
    let bothSelected;
    const bothSelectedGate = new Promise((resolve) => { bothSelected = resolve; });
    const waitForBothSelections = async () => {
      selected += 1;
      if (selected === 2) bothSelected();
      await selectionGate;
    };
    const catalog = [
      catalogEntry({ title: '第一篇', weight: 1, nodeCount: 3 }),
      catalogEntry({ category: 'CSS', title: '第二篇', weight: 1, treeIndex: 2, nodeCount: 3 }),
    ];
    const first = runBatch({ tab: fakeTab({ title: '第一篇', beforeSelect: waitForBothSelections, nodeCount: 3 }), root, catalog, start: 0, limit: 1 });
    const second = runBatch({ tab: fakeTab({ title: '第二篇', beforeSelect: waitForBothSelections, nodeCount: 3 }), root, catalog, start: 1, limit: 1 });
    await bothSelectedGate;
    releaseSelections();
    await Promise.all([first, second]);

    const checkpoint = JSON.parse(await readFile(path.join(root, '.omc/state/ecool-import.json'), 'utf8'));
    assert.deepEqual(checkpoint.completed.map((item) => item.title).sort(), ['第一篇', '第二篇']);
  });
});

test('runBatch records a checksum mismatch before it touches the browser', async () => {
  await withBatchRoot(async (root) => {
    const catalog = [catalogEntry()];
    await runBatch({ tab: fakeTab(), root, catalog, start: 0, limit: 1 });
    const target = path.join(root, 'content/posts/interview/ecool/javascript/javascript-001/index.md');
    await writeFile(target, '用户修改后的文章\n');

    await assert.rejects(
      () => runBatch({ tab: new Proxy({}, { get() { throw new Error('browser must not be touched'); } }), root, catalog, start: 0, limit: 1 }),
      (error) => error?.code === 'CHECKPOINT_CHECKSUM_MISMATCH',
    );
    const checkpoint = JSON.parse(await readFile(path.join(root, '.omc/state/ecool-import.json'), 'utf8'));
    assert.equal(checkpoint.failures.at(-1).error.code, 'CHECKPOINT_CHECKSUM_MISMATCH');
  });
});

test('runBatch records malformed entries as checkpoint failures', async () => {
  await withTemporaryRoot(async (root) => {
    const entry = catalogEntry({ category: '未知分类', title: '无法定位的文章' });
    await assert.rejects(
      () => runBatch({ tab: new Proxy({}, { get() { throw new Error('browser must not be touched'); } }), root, catalog: [entry], start: 0, limit: 1 }),
      (error) => error?.code === 'CATEGORY_INVALID',
    );
    const checkpoint = JSON.parse(await readFile(path.join(root, '.omc/state/ecool-import.json'), 'utf8'));
    assert.deepEqual(checkpoint.failures.at(-1).title, '无法定位的文章');
    assert.equal(checkpoint.failures.at(-1).path, null);
    assert.equal(checkpoint.failures.at(-1).error.code, 'CATEGORY_INVALID');
  });
});

test('runBatch rejects browser batches larger than twenty entries', async () => {
  await withTemporaryRoot(async (root) => {
    let browserTouched = false;
    await assert.rejects(
      () => runBatch({ tab: new Proxy({}, { get() { browserTouched = true; throw new Error('browser must not be touched'); } }), root, catalog: [], start: 0, limit: 21 }),
      (error) => error?.code === 'BATCH_LIMIT_EXCEEDED',
    );
    assert.equal(browserTouched, false);
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
