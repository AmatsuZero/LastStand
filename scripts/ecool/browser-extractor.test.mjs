import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { CATEGORY_CONFIG } from './model.mjs';
import {
  archiveCurrentImages,
  extractCurrentArticle,
  readCatalog,
  selectEntry,
} from './browser-extractor.mjs';

function completeTreeNodes() {
  const nodes = [];
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    nodes.push({ depth: 0, title: category, vip: false, treeIndex: nodes.length });
    for (let index = 0; index < config.expectedCount; index += 1) {
      nodes.push({
        depth: 1,
        title: `${category}-${index + 1}`,
        vip: index === 0,
        treeIndex: nodes.length,
      });
    }
  }
  return nodes;
}

test('readCatalog builds weighted leaves from one tree snapshot', async () => {
  const rawNodes = completeTreeNodes();
  let evaluateCalls = 0;
  const tab = {
    playwright: {
      async evaluate() {
        evaluateCalls += 1;
        return rawNodes;
      },
    },
  };

  const catalog = await readCatalog(tab);

  assert.equal(evaluateCalls, 1);
  assert.equal(catalog.length, 191);
  assert.deepEqual(catalog[0], {
    category: 'JavaScript',
    nodeCount: 201,
    title: 'JavaScript-1',
    treeIndex: 1,
    vip: true,
    weight: 1,
  });
  assert.deepEqual(catalog.at(-1), {
    category: '工程化',
    nodeCount: 201,
    title: '工程化-14',
    treeIndex: 200,
    vip: false,
    weight: 14,
  });
});

test('selectEntry refuses a changed tree before clicking', async () => {
  let clicked = false;
  const nodes = {
    async count() { return 200; },
    nth() {
      return { async click() { clicked = true; } };
    },
  };
  const tab = { playwright: { locator() { return nodes; } } };

  await assert.rejects(
    selectEntry(tab, { nodeCount: 201, treeIndex: 1, title: '数据类型' }),
    (error) => error.code === 'TREE_NODE_COUNT_MISMATCH',
  );
  assert.equal(clicked, false);
});

test('selectEntry rejects a stale article title after the click', async () => {
  let clicked = false;
  const nodes = {
    async count() { return 201; },
    nth(index) {
      assert.equal(index, 1);
      return { async click() { clicked = true; } };
    },
  };
  const title = {
    async waitFor(options) { assert.deepEqual(options, { state: 'visible' }); },
    async innerText() { return '类型判断'; },
  };
  const tab = {
    playwright: {
      locator(selector) {
        if (selector === '.ant-tree-node-content-wrapper') return nodes;
        if (selector === '#info-title') return title;
        throw new Error(`unexpected selector: ${selector}`);
      },
    },
  };

  await assert.rejects(
    selectEntry(tab, { nodeCount: 201, treeIndex: 1, title: '数据类型' }),
    (error) => error.code === 'PAGE_TITLE_MISMATCH',
  );
  assert.equal(clicked, true);
});

test('extractCurrentArticle returns the main body and test points contract', async () => {
  const extracted = {
    title: '数据类型',
    date: '2024-10-01',
    lastmod: '2025-07-16',
    blocks: [
      { type: 'heading', level: 2, children: [{ type: 'text', value: '前言' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', value: '常见考点' }] },
    ],
  };
  const tab = { playwright: { async evaluate() { return extracted; } } };

  assert.deepEqual(await extractCurrentArticle(tab), extracted);
});

test('extractCurrentArticle preserves deeply nested browser results serialized as JSON', async () => {
  const extracted = {
    title: '数据类型',
    date: '2024-10-01',
    lastmod: '2025-07-16',
    blocks: [{
      type: 'list',
      items: [{ children: [{ type: 'text', value: '一级' }], blocks: [{
        type: 'list',
        items: [{ children: [{ type: 'text', value: '二级' }], blocks: [] }],
      }] }],
    }],
  };
  const tab = { playwright: { async evaluate() { return JSON.stringify(extracted); } } };

  assert.deepEqual(await extractCurrentArticle(tab), extracted);
});

test('extractCurrentArticle removes image preview chrome from the AST', async () => {
  const extracted = {
    title: '数据类型',
    date: '2024-10-01',
    lastmod: '2025-07-16',
    blocks: [{
      type: 'paragraph',
      children: [
        { type: 'image', alt: '', src: 'https://cdn.example.com/diagram.jpeg' },
        { type: 'text', value: '预览' },
      ],
    }],
  };
  const tab = { playwright: { async evaluate() { return JSON.stringify(extracted); } } };

  const article = await extractCurrentArticle(tab);

  assert.deepEqual(article.blocks[0].children, [extracted.blocks[0].children[0]]);
});

test('archiveCurrentImages bundles only referenced images and rewrites repeated URLs', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const bundleDirectory = path.join(workspace, 'bundle');
  const articleDirectory = path.join(workspace, 'article');
  await import('node:fs/promises').then(({ mkdir }) => mkdir(bundleDirectory, { recursive: true }));
  const sourcePath = path.join(bundleDirectory, 'diagram-source');
  await writeFile(sourcePath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  let bundleOptions;
  const pageAssets = {
    async list() {
      return {
        id: 'inventory-1',
        assets: [
          { id: 'asset-1', kind: 'image', name: 'diagram', url: 'https://cdn.example.com/diagram?token=1' },
          { id: 'asset-2', kind: 'image', name: 'unused.png', url: 'https://cdn.example.com/unused.png' },
        ],
      };
    },
    async bundle(options) {
      bundleOptions = options;
      return {
        assets: [{
          contentType: 'image/jpeg',
          id: 'asset-1',
          kind: 'image',
          name: 'diagram',
          path: sourcePath,
          url: 'https://cdn.example.com/diagram?token=1',
        }],
        failures: [],
        summary: { downloadedCount: 1, failedCount: 0, requestedCount: 1 },
      };
    },
  };
  const tab = { capabilities: { async get(id) { assert.equal(id, 'pageAssets'); return pageAssets; } } };
  const record = {
    blocks: [
      { type: 'image', alt: '图', src: 'https://cdn.example.com/diagram?token=1' },
      { type: 'paragraph', children: [{ type: 'image', alt: '同一图', src: 'https://cdn.example.com/diagram?token=1' }] },
    ],
  };

  const result = await archiveCurrentImages(tab, record, articleDirectory);

  assert.deepEqual(bundleOptions, { inventoryId: 'inventory-1', assetIds: ['asset-1'] });
  assert.equal(record.blocks[0].src, 'image-01.jpeg');
  assert.equal(record.blocks[1].children[0].src, 'image-01.jpeg');
  assert.deepEqual(result.assets, [{ filename: 'image-01.jpeg', sourceUrl: 'https://cdn.example.com/diagram?token=1' }]);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-01.jpeg')), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
});

test('archiveCurrentImages fails when a referenced image is absent from the inventory', async () => {
  const tab = {
    capabilities: {
      async get() {
        return { async list() { return { id: 'inventory-1', assets: [] }; } };
      },
    },
  };
  const record = { blocks: [{ type: 'image', alt: '图', src: 'https://cdn.example.com/missing.png' }] };

  await assert.rejects(
    archiveCurrentImages(tab, record, '/tmp/not-written-by-missing-asset'),
    (error) => error.code === 'PAGE_ASSET_MISSING',
  );
});
