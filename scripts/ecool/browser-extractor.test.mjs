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

const SOURCE_URL = 'https://fe.ecool.fun/knowledge-learn';

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
    async url() { return SOURCE_URL; },
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
  const tab = { async url() { return SOURCE_URL; }, playwright: { locator() { return nodes; } } };

  await assert.rejects(
    selectEntry(tab, { nodeCount: 201, treeIndex: 1, title: '数据类型' }),
    (error) => error.code === 'TREE_NODE_COUNT_MISMATCH',
  );
  assert.equal(clicked, false);
});

test('selectEntry rejects when its exact title never becomes visible', async () => {
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
    filter(options) {
      assert.ok(options.hasText instanceof RegExp);
      assert.match(' 数据类型 ', options.hasText);
      assert.doesNotMatch('类型判断', options.hasText);
      return { async waitFor() { throw new Error('target title did not become visible'); } };
    },
  };
  const tab = {
    async url() { return SOURCE_URL; },
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
    /target title did not become visible/,
  );
  assert.equal(clicked, true);
});

test('selectEntry waits past a visible title containing the target as a substring', async () => {
  let clicked = false;
  let resolveTargetTitle;
  let signalWaitStarted;
  const targetTitleReady = new Promise((resolve) => { resolveTargetTitle = resolve; });
  const titleWaitStarted = new Promise((resolve) => { signalWaitStarted = resolve; });
  const nodes = {
    async count() { return 201; },
    nth(index) {
      assert.equal(index, 1);
      return { async click() { clicked = true; } };
    },
  };
  const title = {
    async waitFor(options) { assert.deepEqual(options, { state: 'visible' }); },
    async innerText() { return '数据+类型(基础)详解'; },
    filter(options) {
      assert.ok(options.hasText instanceof RegExp);
      assert.match(' 数据+类型(基础) ', options.hasText);
      assert.doesNotMatch('数据+类型(基础)详解', options.hasText);
      return {
        async waitFor(options) {
          assert.deepEqual(options, { state: 'visible' });
          signalWaitStarted();
          await targetTitleReady;
        },
        async innerText() { return ' 数据+类型(基础) '; },
      };
    },
  };
  const tab = {
    async url() { return SOURCE_URL; },
    playwright: {
      locator(selector) {
        if (selector === '.ant-tree-node-content-wrapper') return nodes;
        if (selector === '#info-title') return title;
        throw new Error(`unexpected selector: ${selector}`);
      },
    },
  };

  const selection = selectEntry(tab, { nodeCount: 201, treeIndex: 1, title: '数据+类型(基础)' });
  const outcome = await Promise.race([
    selection.then(
      () => 'selected',
      (error) => ({ error }),
    ),
    titleWaitStarted.then(() => 'waiting'),
  ]);
  assert.equal(outcome, 'waiting');
  assert.equal(clicked, true);
  assert.equal(await title.innerText(), '数据+类型(基础)详解');
  resolveTargetTitle();
  await selection;
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
  const tab = { async url() { return SOURCE_URL; }, playwright: { async evaluate() { return extracted; } } };

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
  const tab = { async url() { return SOURCE_URL; }, playwright: { async evaluate() { return JSON.stringify(extracted); } } };

  assert.deepEqual(await extractCurrentArticle(tab), extracted);
});

test('extractCurrentArticle preserves legitimate article text named preview', async () => {
  const extracted = {
    title: '数据类型',
    date: '2024-10-01',
    lastmod: '2025-07-16',
    blocks: [{
      type: 'paragraph',
      children: [
        { type: 'text', value: '预览' },
      ],
    }],
  };
  const tab = { async url() { return SOURCE_URL; }, playwright: { async evaluate() { return JSON.stringify(extracted); } } };

  const article = await extractCurrentArticle(tab);

  assert.deepEqual(article.blocks[0].children, [{ type: 'text', value: '预览' }]);
});

test('browser extractors reject non-source routes before reading or clicking DOM', async () => {
  const operations = [
    ['readCatalog', (tab) => readCatalog(tab)],
    ['selectEntry', (tab) => selectEntry(tab, { nodeCount: 201, treeIndex: 1, title: '数据类型' })],
    ['extractCurrentArticle', (tab) => extractCurrentArticle(tab)],
  ];
  for (const invalidUrl of ['https://fe.ecool.fun/topic/123', 'https://example.com/knowledge-learn']) {
    for (const [name, operation] of operations) {
      let touchedDom = false;
      const tab = {
        async url() { return invalidUrl; },
        playwright: {
          async evaluate() { touchedDom = true; throw new Error('unexpected DOM read'); },
          locator() { touchedDom = true; throw new Error('unexpected DOM access'); },
        },
      };

      await assert.rejects(
        operation(tab),
        (error) => error.code === 'SOURCE_PAGE_MISMATCH',
        `${name} should reject ${invalidUrl}`,
      );
      assert.equal(touchedDom, false, `${name} touched DOM for ${invalidUrl}`);
    }
  }
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

test('archiveCurrentImages names a misreported JPEG from its WebP file signature', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-webp-signature-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const sourcePath = path.join(workspace, 'misreported-jpeg');
  const webpBytes = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  await writeFile(sourcePath, webpBytes);
  const url = 'https://cdn.example.com/diagram.jpeg';
  const pageAssets = {
    async list() {
      return { id: 'inventory-webp', assets: [{ id: 'asset-webp', kind: 'image', name: 'diagram.jpeg', url }] };
    },
    async bundle() {
      return {
        assets: [{
          contentType: 'image/jpeg',
          id: 'asset-webp',
          kind: 'image',
          name: 'diagram.jpeg',
          path: sourcePath,
          url,
        }],
        failures: [],
        summary: { downloadedCount: 1, failedCount: 0, requestedCount: 1 },
      };
    },
  };
  const tab = { capabilities: { async get() { return pageAssets; } } };
  const record = { blocks: [{ type: 'image', alt: '图', src: url }] };
  const articleDirectory = path.join(workspace, 'article');

  const result = await archiveCurrentImages(tab, record, articleDirectory);

  assert.equal(record.blocks[0].src, 'image-01.webp');
  assert.deepEqual(result.assets, [{ filename: 'image-01.webp', sourceUrl: url }]);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-01.webp')), webpBytes);
});

test('archiveCurrentImages re-reads the inventory once when a referenced image is initially absent', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-refresh-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const sourcePath = path.join(workspace, 'diagram-source');
  const articleDirectory = path.join(workspace, 'article');
  const url = 'https://cdn.example.com/late-diagram.png';
  await writeFile(sourcePath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  let listCalls = 0;
  let bundleOptions;
  const pageAssets = {
    async list() {
      listCalls += 1;
      if (listCalls === 1) return { id: 'inventory-stale', assets: [] };
      return { id: 'inventory-fresh', assets: [{ id: 'asset-1', kind: 'image', name: 'late-diagram.png', url }] };
    },
    async bundle(options) {
      bundleOptions = options;
      return {
        assets: [{ id: 'asset-1', kind: 'image', name: 'late-diagram.png', path: sourcePath, url }],
        failures: [],
        summary: { failedCount: 0 },
      };
    },
  };
  const tab = { capabilities: { async get() { return pageAssets; } } };
  const record = { blocks: [{ type: 'image', alt: '延迟图片', src: url }] };

  const result = await archiveCurrentImages(tab, record, articleDirectory);

  assert.equal(listCalls, 2);
  assert.deepEqual(bundleOptions, { inventoryId: 'inventory-fresh', assetIds: ['asset-1'] });
  assert.equal(record.blocks[0].src, 'image-01.png');
  assert.deepEqual(result.assets, [{ filename: 'image-01.png', sourceUrl: url }]);
});

test('archiveCurrentImages falls back to CDP for an octet-stream WebP bundle failure', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-cdp-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const articleDirectory = path.join(workspace, 'article');
  const url = 'https://cdn.example.com/diagram.awebp';
  const webpBytes = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  const cdpCalls = [];
  const pageAssets = {
    async list() { return { id: 'inventory-1', assets: [{ id: 'asset-1', kind: 'image', name: 'diagram.awebp', url }] }; },
    async bundle() {
      return {
        assets: [],
        failures: [{ reason: 'application/octet-stream', url }],
        summary: { failedCount: 1 },
      };
    },
  };
  const cdp = {
    async send(method, params) {
      cdpCalls.push({ method, params });
      if (method === 'Page.getResourceTree') {
        return {
          frameTree: {
            childFrames: [],
            frame: { id: 'frame-1' },
            resources: [{ mimeType: 'application/octet-stream', type: 'Image', url }],
          },
        };
      }
      if (method === 'Page.getResourceContent') {
        assert.deepEqual(params, { frameId: 'frame-1', url });
        return { base64Encoded: true, content: webpBytes.toString('base64') };
      }
      throw new Error(`unexpected CDP method: ${method}`);
    },
  };
  const tab = {
    capabilities: {
      async get(name) {
        if (name === 'pageAssets') return pageAssets;
        if (name === 'cdp') return cdp;
        throw new Error(`unexpected capability: ${name}`);
      },
    },
  };
  const record = { blocks: [{ type: 'image', alt: 'WebP', src: url }] };

  const result = await archiveCurrentImages(tab, record, articleDirectory);

  assert.deepEqual(cdpCalls.map((call) => call.method), ['Page.getResourceTree', 'Page.getResourceContent']);
  assert.equal(record.blocks[0].src, 'image-01.webp');
  assert.deepEqual(result.assets, [{ filename: 'image-01.webp', sourceUrl: url }]);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-01.webp')), webpBytes);
});

test('archiveCurrentImages rejects malformed CDP base64 without writing an image', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-cdp-invalid-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const articleDirectory = path.join(workspace, 'article');
  const url = 'https://cdn.example.com/invalid.awebp';
  const validWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]).toString('base64');
  const pageAssets = {
    async list() { return { id: 'inventory-1', assets: [{ id: 'asset-1', kind: 'image', name: 'invalid.awebp', url }] }; },
    async bundle() { return { assets: [], failures: [{ reason: 'octet-stream', url }], summary: { failedCount: 1 } }; },
  };
  const cdp = {
    async send(method) {
      if (method === 'Page.getResourceTree') {
        return { frameTree: { childFrames: [], frame: { id: 'frame-1' }, resources: [{ type: 'Image', url }] } };
      }
      return { base64Encoded: true, content: `${validWebp}!!!!` };
    },
  };
  const tab = { capabilities: { async get(name) { return name === 'pageAssets' ? pageAssets : cdp; } } };
  const record = { blocks: [{ type: 'image', alt: '损坏图片', src: url }] };

  await assert.rejects(
    archiveCurrentImages(tab, record, articleDirectory),
    (error) => error.code === 'PAGE_ASSET_CDP_CONTENT_INVALID',
  );
  await assert.rejects(readFile(path.join(articleDirectory, 'image-01.webp')),
    (error) => error.code === 'ENOENT');
});

test('archiveCurrentImages combines bundled, failed, and inventory-missing images in reference order', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-mixed-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const articleDirectory = path.join(workspace, 'article');
  const bundledPath = path.join(workspace, 'bundled.jpeg');
  const bundledBytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  const fallbackBytes = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50,
  ]);
  const bundledUrl = 'https://cdn.example.com/bundled.jpeg';
  const fallbackUrl = 'https://cdn.example.com/fallback.awebp';
  const missingUrl = 'https://cdn.example.com/missing.awebp';
  await writeFile(bundledPath, bundledBytes);
  const cdpCalls = [];
  let bundleOptions;
  const pageAssets = {
    async list() {
      return {
        id: 'inventory-1',
        assets: [
          { id: 'asset-1', kind: 'image', name: 'bundled.jpeg', url: bundledUrl },
          { id: 'asset-2', kind: 'image', name: 'fallback.awebp', url: fallbackUrl },
        ],
      };
    },
    async bundle(options) {
      bundleOptions = options;
      return {
        assets: [{ id: 'asset-1', path: bundledPath, url: bundledUrl }],
        failures: [{ reason: 'octet-stream', url: fallbackUrl }],
        summary: { failedCount: 1 },
      };
    },
  };
  const cdp = {
    async send(method, params) {
      cdpCalls.push({ method, params });
      if (method === 'Page.getResourceTree') {
        return {
          frameTree: {
            childFrames: [],
            frame: { id: 'frame-1' },
            resources: [{ type: 'Image', url: fallbackUrl }, { type: 'Image', url: missingUrl }],
          },
        };
      }
      assert.ok([fallbackUrl, missingUrl].includes(params.url));
      return { base64Encoded: true, content: fallbackBytes.toString('base64') };
    },
  };
  const tab = { capabilities: { async get(name) { return name === 'pageAssets' ? pageAssets : cdp; } } };
  const record = {
    blocks: [
      { type: 'image', alt: '已归档', src: bundledUrl },
      { type: 'image', alt: 'CDP 回退', src: fallbackUrl },
      { type: 'image', alt: '清单缺失', src: missingUrl },
    ],
  };

  const result = await archiveCurrentImages(tab, record, articleDirectory);

  assert.deepEqual(cdpCalls, [
    { method: 'Page.getResourceTree', params: undefined },
    { method: 'Page.getResourceContent', params: { frameId: 'frame-1', url: fallbackUrl } },
    { method: 'Page.getResourceContent', params: { frameId: 'frame-1', url: missingUrl } },
  ]);
  assert.deepEqual(bundleOptions, { inventoryId: 'inventory-1', assetIds: ['asset-1', 'asset-2'] });
  assert.deepEqual(record.blocks.map((block) => block.src), ['image-01.jpeg', 'image-02.webp', 'image-03.webp']);
  assert.deepEqual(result.assets, [
    { filename: 'image-01.jpeg', sourceUrl: bundledUrl },
    { filename: 'image-02.webp', sourceUrl: fallbackUrl },
    { filename: 'image-03.webp', sourceUrl: missingUrl },
  ]);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-01.jpeg')), bundledBytes);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-02.webp')), fallbackBytes);
  assert.deepEqual(await readFile(path.join(articleDirectory, 'image-03.webp')), fallbackBytes);
});

test('archiveCurrentImages fails when CDP cannot find a failed asset as an image resource', async () => {
  const url = 'https://cdn.example.com/not-an-image.awebp';
  const pageAssets = {
    async list() { return { id: 'inventory-1', assets: [{ id: 'asset-1', kind: 'image', name: 'not-an-image.awebp', url }] }; },
    async bundle() {
      return { assets: [], failures: [{ reason: 'application/octet-stream', url }], summary: { failedCount: 1 } };
    },
  };
  const cdp = {
    async send(method) {
      assert.equal(method, 'Page.getResourceTree');
      return { frameTree: { childFrames: [], frame: { id: 'frame-1' }, resources: [{ type: 'Document', url }] } };
    },
  };
  const tab = {
    capabilities: {
      async get(name) { return name === 'pageAssets' ? pageAssets : cdp; },
    },
  };
  const record = { blocks: [{ type: 'image', alt: '错误资源', src: url }] };

  await assert.rejects(
    archiveCurrentImages(tab, record, '/tmp/not-written-by-cdp-fallback'),
    (error) => error.code === 'PAGE_ASSET_CDP_RESOURCE_MISSING',
  );
});

test('archiveCurrentImages fails when an inventory-missing image is also absent from CDP', async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'ecool-assets-missing-cdp-'));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  let listCalls = 0;
  const url = 'https://cdn.example.com/missing.png';
  const tab = {
    capabilities: {
      async get(name) {
        if (name === 'pageAssets') {
          return {
          async list() {
            listCalls += 1;
            return { id: 'inventory-1', assets: [] };
          },
          };
        }
        return {
          async send(method) {
            assert.equal(method, 'Page.getResourceTree');
            return { frameTree: { childFrames: [], frame: { id: 'frame-1' }, resources: [] } };
          },
        };
      },
    },
  };
  const record = { blocks: [{ type: 'image', alt: '图', src: url }] };

  await assert.rejects(
    archiveCurrentImages(tab, record, workspace),
    (error) => error.code === 'PAGE_ASSET_CDP_RESOURCE_MISSING',
  );
  assert.equal(listCalls, 2);
  await assert.rejects(readFile(path.join(workspace, 'image-01.png')), (error) => error.code === 'ENOENT');
});
