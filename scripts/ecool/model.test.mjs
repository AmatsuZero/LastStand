import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATEGORY_CONFIG,
  articleRelativePath,
  buildFrontmatter,
  slugify,
  validateCatalog,
} from './model.mjs';

const sample = {
  category: 'JavaScript',
  title: '数据类型',
  slug: 'javascript-001',
  date: '2024-10-01',
  lastmod: '2025-07-16',
  weight: 1,
};

test('uses the configured ten categories and their catalog counts', () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(CATEGORY_CONFIG).map(([name, config]) => [name, config.expectedCount]),
    ),
    {
      JavaScript: 29,
      CSS: 27,
      HTML: 24,
      'React.js': 21,
      'Vue.js': 23,
      '计算机网络': 20,
      '性能优化': 4,
      '前端安全': 12,
      ES6: 17,
      '工程化': 14,
    },
  );
});

test('slugifies stable English words and falls back for Chinese-only titles', () => {
  assert.equal(slugify('React 生命周期', 'react-001'), 'react-lifecycle');
  assert.equal(slugify('call、apply和bind', 'javascript-020'), 'call-apply-bind');
  assert.equal(slugify('数据类型', 'javascript-001'), 'javascript-001');
});

test('builds an ECool page-bundle path from category and slug', () => {
  assert.equal(
    articleRelativePath({ category: 'JavaScript', slug: 'javascript-001' }),
    'content/posts/frontend/javascript/javascript-001/index.md',
  );
});

test('rejects inherited object properties as unknown categories', () => {
  for (const category of ['toString', 'constructor', '__proto__']) {
    assert.throws(
      () => articleRelativePath({ category, slug: 'javascript-001' }),
      /未知分类/,
    );
    assert.throws(() => validateCatalog([{ category, title: 'x' }]), /未知分类/);
  }
});

test('builds published TOML frontmatter with source and title tag', () => {
  const frontmatter = buildFrontmatter(sample);

  assert.match(frontmatter, /^\+\+\+\ntitle = "数据类型"/);
  assert.match(frontmatter, /date = '2024-10-01T00:00:00\+08:00'/);
  assert.match(frontmatter, /lastmod = '2025-07-16T00:00:00\+08:00'/);
  assert.match(frontmatter, /draft = false/);
  assert.match(frontmatter, /tags = \["面试", "前端", "JavaScript", "数据类型", "ecool"\]/);
  assert.match(frontmatter, /source = "https:\/\/fe\.ecool\.fun\/knowledge-learn"/);
});

test('escapes TOML string values without changing date precision', () => {
  const frontmatter = buildFrontmatter({
    ...sample,
    title: 'A "quote" \\ path',
    date: '2024-10-01T08:30:00+08:00',
    lastmod: '2025-07-16T12:45:00+08:00',
  });

  assert.match(frontmatter, /title = "A \\\"quote\\\" \\\\ path"/);
  assert.match(frontmatter, /date = '2024-10-01T08:30:00\+08:00'/);
  assert.match(frontmatter, /lastmod = '2025-07-16T12:45:00\+08:00'/);
});

test('rejects catalogs with an unknown category', () => {
  assert.throws(() => validateCatalog([{ category: '未知', title: 'x' }]), /未知分类/);
});

test('accepts a complete catalog with the documented category counts', () => {
  const entries = Object.entries(CATEGORY_CONFIG).flatMap(([category, config]) =>
    Array.from({ length: config.expectedCount }, (_, index) => ({
      category,
      title: `${category}-${index + 1}`,
    })),
  );

  assert.doesNotThrow(() => validateCatalog(entries));
});
