import { copyFile, mkdir, open } from 'node:fs/promises';
import path from 'node:path';

import { validateCatalog } from './model.mjs';

const TREE_SELECTOR = '.ant-tree-node-content-wrapper';
const SOURCE_URL = 'https://fe.ecool.fun/knowledge-learn';

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function exactTextPattern(value) {
  return new RegExp(`^\\s*${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

async function assertSourcePage(tab) {
  const actualUrl = typeof tab?.url === 'function' ? await tab.url() : null;
  if (actualUrl !== SOURCE_URL) {
    throw codedError('SOURCE_PAGE_MISMATCH', `ECool 来源页面不匹配：期望 ${SOURCE_URL}，实际 ${actualUrl || 'unknown'}`);
  }
}

export async function readCatalog(tab) {
  await assertSourcePage(tab);
  const nodes = await tab.playwright.evaluate(() =>
    Array.from(document.querySelectorAll('.ant-tree-node-content-wrapper')).map((node, treeIndex) => {
      const treeNode = node.closest('.ant-tree-treenode') || node.parentElement;
      const treeNodeClass = String(treeNode?.className || '');
      const depth = treeNodeClass.includes('treenode-switcher-') ? 0 : 1;
      const vipSelector = '[aria-label="VIP题目"], [title="VIP题目"], img[alt="VIP题目"]';
      return {
        depth,
        title: String(node.textContent || '').trim(),
        treeIndex,
        vip: Boolean(node.querySelector(vipSelector) || treeNode?.querySelector?.(vipSelector)),
      };
    }),
  );

  const catalog = [];
  const weights = new Map();
  let category = null;
  for (const node of nodes) {
    if (node.depth === 0) {
      category = node.title;
      weights.set(category, 0);
      continue;
    }
    if (!category) throw codedError('CATALOG_CATEGORY_MISSING', `目录项 ${node.title} 缺少一级分类`);
    const weight = (weights.get(category) || 0) + 1;
    weights.set(category, weight);
    catalog.push({
      category,
      nodeCount: nodes.length,
      title: node.title,
      treeIndex: node.treeIndex,
      vip: Boolean(node.vip),
      weight,
    });
  }

  validateCatalog(catalog);
  return catalog;
}

export async function selectEntry(tab, entry) {
  await assertSourcePage(tab);
  const nodes = tab.playwright.locator(TREE_SELECTOR);
  const actualCount = await nodes.count();
  if (actualCount !== entry.nodeCount) {
    throw codedError(
      'TREE_NODE_COUNT_MISMATCH',
      `知识树节点数已变化：清单为 ${entry.nodeCount}，页面为 ${actualCount}`,
    );
  }
  if (!Number.isInteger(entry.treeIndex) || entry.treeIndex < 0 || entry.treeIndex >= actualCount) {
    throw codedError('TREE_INDEX_INVALID', `无效知识树索引: ${entry.treeIndex}`);
  }

  await nodes.nth(entry.treeIndex).click();
  const title = tab.playwright.locator('#info-title');
  await title.waitFor({ state: 'visible' });
  const expectedTitle = title.filter({ hasText: exactTextPattern(entry.title) });
  await expectedTitle.waitFor({ state: 'visible' });
  const actualTitle = (await expectedTitle.innerText()).trim();
  if (actualTitle !== entry.title) {
    throw codedError(
      'PAGE_TITLE_MISMATCH',
      `页面标题不匹配：期望 ${entry.title}，实际 ${actualTitle}`,
    );
  }
}

export function extractArticleDocument() {
    const pageDocument = document;
    const elementChildren = (element) => Array.from(element?.children || []);
    const isElement = (node) => node?.nodeType === 1;
    const isText = (node) => node?.nodeType === 3;
    const tag = (node) => String(node?.tagName || '').toLowerCase();
    const classText = (node) => String(node?.className || '');
    const compactText = (value) => String(value || '').replace(/\s+/g, ' ');
    const skipElement = (element) => {
      const name = tag(element);
      const classes = classText(element);
      const label = `${element.getAttribute?.('aria-label') || ''} ${element.getAttribute?.('title') || ''}`;
      return name === 'button'
        || classes.includes('ant-image-mask')
        || classes.includes('linenumber')
        || classes.includes('line-number')
        || /复制|copy/i.test(label)
        || compactText(element.textContent).trim() === '复制';
    };

    const inlineNode = (node) => {
      if (isText(node)) {
        const value = compactText(node.nodeValue);
        return value ? { type: 'text', value } : null;
      }
      if (!isElement(node) || skipElement(node)) return null;
      const name = tag(node);
      const children = () => Array.from(node.childNodes || []).map(inlineNode).filter(Boolean);
      if (name === 'br') return { type: 'br' };
      if (name === 'strong' || name === 'b') return { type: 'strong', children: children() };
      if (name === 'em' || name === 'i') return { type: 'em', children: children() };
      if (name === 'del' || name === 's' || name === 'strike') return { type: 'del', children: children() };
      if (name === 'a') return { type: 'link', href: node.href || node.getAttribute('href') || '', children: children() };
      if (name === 'img') {
        const src = node.currentSrc || node.src || node.getAttribute('src') || '';
        return { type: 'image', alt: node.getAttribute('alt') || node.getAttribute('title') || '', src };
      }
      if (name === 'code') return { type: 'code', value: String(node.textContent || '') };
      return { type: 'span', children: children() };
    };

    const inlineChildren = (element) =>
      Array.from(element?.childNodes || []).map(inlineNode).filter(Boolean);

    const codeText = (root) => {
      const collect = (node) => {
        if (isText(node)) return String(node.nodeValue || '');
        if (!isElement(node) || skipElement(node)) return '';
        if (tag(node) === 'br') return '\n';
        return Array.from(node.childNodes || []).map(collect).join('');
      };
      return collect(root).replace(/^\n+|\n+$/g, '');
    };

    const blockNode = (element) => {
      if (!isElement(element) || skipElement(element)) return [];
      const name = tag(element);
      if (/^h[1-6]$/.test(name)) {
        return [{ type: 'heading', level: Math.max(2, Number(name.slice(1))), children: inlineChildren(element) }];
      }
      if (name === 'p') return [{ type: 'paragraph', children: inlineChildren(element) }];
      if (name === 'blockquote') {
        return [{ type: 'blockquote', children: elementChildren(element).flatMap(blockNode) }];
      }
      if (name === 'pre') {
        const code = element.querySelector('code') || element;
        const language = classText(code).match(/(?:^|\s)language-([^\s]+)/)?.[1] || '';
        return [{ type: 'code', language, value: codeText(code) }];
      }
      if (name === 'ul' || name === 'ol') {
        const items = elementChildren(element).filter((child) => tag(child) === 'li').map((item) => {
          const children = [];
          const blocks = [];
          for (const child of Array.from(item.childNodes || [])) {
            if (isElement(child) && (tag(child) === 'ul' || tag(child) === 'ol')) {
              blocks.push(...blockNode(child));
            } else if (isElement(child) && tag(child) === 'p') {
              children.push(...inlineChildren(child));
            } else if (isElement(child) && /^(pre|blockquote|table)$/.test(tag(child))) {
              blocks.push(...blockNode(child));
            } else {
              const inline = inlineNode(child);
              if (inline) children.push(inline);
            }
          }
          return { children, blocks };
        });
        const start = name === 'ol' ? Number(element.getAttribute('start') || 1) : undefined;
        return [{ type: 'list', ordered: name === 'ol', ...(start ? { start } : {}), items }];
      }
      if (name === 'table') {
        const rows = Array.from(element.querySelectorAll('tr'));
        const converted = rows.map((row) => elementChildren(row)
          .filter((cell) => tag(cell) === 'th' || tag(cell) === 'td')
          .map((cell) => inlineChildren(cell)));
        const firstRowHasHeader = rows[0] && elementChildren(rows[0]).some((cell) => tag(cell) === 'th');
        return [{
          type: 'table',
          header: firstRowHasHeader ? (converted.shift() || []) : Array(converted[0]?.length || 0).fill([]),
          rows: converted,
        }];
      }
      if (name === 'img') {
        const image = inlineNode(element);
        return image ? [image] : [];
      }
      if (name === 'hr') return [{ type: 'hr' }];

      const children = elementChildren(element);
      if (children.some((child) => /^(h[1-6]|p|blockquote|pre|ul|ol|table|img|hr)$/i.test(tag(child)))) {
        return children.flatMap(blockNode);
      }
      const inline = inlineChildren(element);
      return inline.length ? [{ type: 'paragraph', children: inline }] : [];
    };

    const contentBox = Array.from(pageDocument.querySelectorAll('[class*="contentBox"]'))
      .find((element) => element.querySelector('#info-title'));
    if (!contentBox) return { error: 'ARTICLE_CONTENT_MISSING' };
    const articleBoxes = elementChildren(contentBox)
      .filter((element) => classText(element).includes('articleBox'));
    if (articleBoxes.length < 2) return { error: 'ARTICLE_SECTIONS_MISSING' };

    const mainBody = articleBoxes[0].querySelector('.markdown-body');
    const pointsHeading = articleBoxes[1].querySelector('#test-points');
    const pointsBody = articleBoxes[1].querySelector('.markdown-body');
    if (!mainBody || !pointsHeading || !pointsBody) return { error: 'ARTICLE_SECTIONS_MISSING' };

    const metadataText = String(articleBoxes[0].textContent || '');
    const date = metadataText.match(/创建时间：\s*(\d{4}-\d{2}-\d{2})/)?.[1] || '';
    const lastmod = metadataText.match(/最近更新时间：\s*(\d{4}-\d{2}-\d{2})/)?.[1] || date;
    return JSON.stringify({
      title: compactText(pageDocument.querySelector('#info-title')?.textContent).trim(),
      date,
      lastmod,
      blocks: [
        ...elementChildren(mainBody).flatMap(blockNode),
        ...blockNode(pointsHeading),
        ...elementChildren(pointsBody).flatMap(blockNode),
      ],
    });
}

export async function extractCurrentArticle(tab) {
  await assertSourcePage(tab);
  const article = await tab.playwright.evaluate(extractArticleDocument);

  const parsedArticle = typeof article === 'string' ? JSON.parse(article) : article;

  if (parsedArticle?.error) {
    throw codedError(parsedArticle.error, `ECool 正文提取失败: ${parsedArticle.error}`);
  }
  if (!parsedArticle?.title || !parsedArticle?.date || !parsedArticle?.lastmod || !Array.isArray(parsedArticle?.blocks)) {
    throw codedError('ARTICLE_METADATA_INVALID', 'ECool 正文缺少标题、日期或内容');
  }
  return parsedArticle;
}

function imageNodes(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) imageNodes(item, result);
  } else if (value && typeof value === 'object') {
    if (value.type === 'image' && value.src) result.push(value);
    for (const [key, child] of Object.entries(value)) {
      if (key !== 'src') imageNodes(child, result);
    }
  }
  return result;
}

async function imageExtension(filePath) {
  const handle = await open(filePath, 'r');
  const signature = Buffer.alloc(512);
  let bytesRead;
  try {
    ({ bytesRead } = await handle.read(signature, 0, signature.length, 0));
  } finally {
    await handle.close();
  }
  const bytes = signature.subarray(0, bytesRead);
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return '.jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) return '.gif';
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return '.webp';
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp' && ['avif', 'avis'].includes(bytes.subarray(8, 12).toString('ascii'))) return '.avif';
  if (bytes.toString('utf8').replace(/^\uFEFF?\s*/, '').match(/^(?:<\?xml[^>]*>\s*)?<svg[\s>]/i)) return '.svg';
  throw codedError('PAGE_ASSET_TYPE_UNKNOWN', `无法从文件签名识别正文图片: ${filePath}`);
}

export async function archiveCurrentImages(tab, record, articleDirectory) {
  const referencedNodes = imageNodes(record.blocks);
  const referencedUrls = [...new Set(referencedNodes.map((node) => node.src))];
  const pageAssets = await tab.capabilities.get('pageAssets');
  const inventory = await pageAssets.list();
  if (referencedUrls.length === 0) return { record, assets: [] };

  const inventoryByUrl = new Map(
    (inventory.assets || []).filter((asset) => asset.kind === 'image').map((asset) => [asset.url, asset]),
  );
  const selected = referencedUrls.map((url) => inventoryByUrl.get(url));
  const missing = referencedUrls.filter((url, index) => !selected[index]);
  if (missing.length) {
    throw codedError('PAGE_ASSET_MISSING', `页面资产清单缺少正文图片: ${missing.join(', ')}`);
  }

  const bundle = await pageAssets.bundle({
    inventoryId: inventory.id,
    assetIds: selected.map((asset) => asset.id),
  });
  if (bundle.failures?.length || bundle.summary?.failedCount) {
    const reasons = (bundle.failures || []).map((failure) => `${failure.url}: ${failure.reason}`).join('; ');
    throw codedError('PAGE_ASSET_BUNDLE_FAILED', `正文图片归档失败: ${reasons || '未知错误'}`);
  }

  const bundledById = new Map((bundle.assets || []).map((asset) => [asset.id, asset]));
  await mkdir(articleDirectory, { recursive: true });
  const assets = [];
  const localByUrl = new Map();
  for (const [index, selectedAsset] of selected.entries()) {
    const bundledAsset = bundledById.get(selectedAsset.id);
    if (!bundledAsset?.path) {
      throw codedError('PAGE_ASSET_BUNDLE_MISSING', `归档结果缺少图片: ${selectedAsset.url}`);
    }
    const filename = `image-${String(index + 1).padStart(2, '0')}${await imageExtension(bundledAsset.path)}`;
    await copyFile(bundledAsset.path, path.join(articleDirectory, filename));
    localByUrl.set(selectedAsset.url, filename);
    assets.push({ filename, sourceUrl: selectedAsset.url });
  }
  for (const node of referencedNodes) node.src = localByUrl.get(node.src);
  return { record, assets };
}
