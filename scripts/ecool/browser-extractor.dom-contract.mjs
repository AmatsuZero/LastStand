import assert from 'node:assert/strict';

import { extractArticleDocument } from './browser-extractor.mjs';
import { renderMarkdown } from './markdown.mjs';

async function extractLive(tab) {
  const rawArticle = await tab.playwright.evaluate(extractArticleDocument);
  const article = typeof rawArticle === 'string' ? JSON.parse(rawArticle) : rawArticle;
  const markdown = renderMarkdown(article.blocks);
  return { article, markdown };
}

function descendants(value, predicate, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) descendants(item, predicate, result);
  } else if (value && typeof value === 'object') {
    if (predicate(value)) result.push(value);
    for (const child of Object.values(value)) descendants(child, predicate, result);
  }
  return result;
}

export async function runSampleArticleDomContract(tab) {
  const { article, markdown } = await extractLive(tab);

  assert.equal(article.title, '数据类型');
  assert.equal(article.date, '2024-10-01');
  assert.equal(article.lastmod, '2025-07-16');
  for (const type of ['heading', 'paragraph', 'blockquote', 'list', 'code']) {
    assert.ok(descendants(article.blocks, (node) => node.type === type).length > 0, `missing ${type}`);
  }
  assert.ok(descendants(article.blocks, (node) => node.type === 'code' && node.language === 'javascript').length > 0);
  assert.equal(descendants(article.blocks, (node) => node.type === 'image').length, 3);
  assert.match(markdown, /## 前言/);
  assert.match(markdown, /## 常见考点/);
  assert.doesNotMatch(markdown, /复制|关联面试题|VIP题目|linenumber|预览/);

  return { blockCount: article.blocks.length, markdown };
}

export async function runTableArticleDomContract(tab, expectedTitle) {
  const { article, markdown } = await extractLive(tab);

  assert.equal(article.title, expectedTitle);
  assert.ok(descendants(article.blocks, (node) => node.type === 'table').length > 0, 'missing table');
  assert.match(markdown, /## 常见考点/);
  assert.doesNotMatch(markdown, /关联面试题|复制|linenumber/);

  return { blockCount: article.blocks.length, markdown };
}
