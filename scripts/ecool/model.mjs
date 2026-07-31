const SOURCE_URL = 'https://fe.ecool.fun/knowledge-learn';
const DATE_SUFFIX = 'T00:00:00+08:00';

export const CATEGORY_CONFIG = Object.freeze({
  JavaScript: { directory: 'javascript', categories: ['前端开发', '面试'], tags: ['JavaScript'], expectedCount: 29 },
  CSS: { directory: 'css', categories: ['前端开发', '面试'], tags: ['CSS'], expectedCount: 27 },
  HTML: { directory: 'html', categories: ['前端开发', '面试'], tags: ['HTML'], expectedCount: 24 },
  'React.js': { directory: 'react', categories: ['前端开发', '面试'], tags: ['React'], expectedCount: 21 },
  'Vue.js': { directory: 'vue', categories: ['前端开发', '面试'], tags: ['Vue'], expectedCount: 23 },
  '计算机网络': { directory: 'network', categories: ['计算机基础', '面试'], tags: ['计算机网络'], expectedCount: 20 },
  '性能优化': { directory: 'performance', categories: ['前端开发', '面试'], tags: ['性能优化'], expectedCount: 4 },
  '前端安全': { directory: 'security', categories: ['前端开发', '面试'], tags: ['前端安全'], expectedCount: 12 },
  ES6: { directory: 'es6', categories: ['前端开发', '面试'], tags: ['ES6', 'JavaScript'], expectedCount: 17 },
  '工程化': { directory: 'engineering', categories: ['前端开发', '面试'], tags: ['工程化'], expectedCount: 14 },
});

const STABLE_TRANSLITERATIONS = Object.freeze({
  '生命周期': 'lifecycle',
  '和': ' ',
});

function tomlString(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function tomlArray(values) {
  return `[${values.map((value) => `"${tomlString(value)}"`).join(', ')}]`;
}

function timestamp(value) {
  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}${DATE_SUFFIX}` : text;
}

function categoryConfig(category) {
  if (!Object.hasOwn(CATEGORY_CONFIG, category)) throw new Error(`未知分类: ${category}`);
  const config = CATEGORY_CONFIG[category];
  return config;
}

export function slugify(title, fallback) {
  let normalized = String(title).trim();
  for (const [source, translation] of Object.entries(STABLE_TRANSLITERATIONS)) {
    normalized = normalized.replaceAll(source, translation);
  }
  if (/\p{Script=Han}/u.test(normalized)) return fallback;

  const slug = normalized
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return slug || fallback;
}

export function buildFrontmatter(record) {
  const config = categoryConfig(record.category);
  const tags = ['面试', '前端', ...config.tags, record.title, 'ecool'];

  return [
    '+++',
    `title = "${tomlString(record.title)}"`,
    `date = '${timestamp(record.date)}'`,
    `lastmod = '${timestamp(record.lastmod)}'`,
    'draft = true',
    `weight = ${record.weight}`,
    `tags = ${tomlArray([...new Set(tags)])}`,
    `categories = ${tomlArray(config.categories)}`,
    `source = "${SOURCE_URL}"`,
    '+++',
    '',
  ].join('\n');
}

export function articleRelativePath(record) {
  const config = categoryConfig(record.category);
  return `content/posts/interview/ecool/${config.directory}/${record.slug}/index.md`;
}

export function validateCatalog(entries) {
  if (!Array.isArray(entries)) throw new TypeError('目录清单必须是数组');

  const counts = new Map(Object.keys(CATEGORY_CONFIG).map((category) => [category, 0]));
  for (const entry of entries) {
    categoryConfig(entry.category);
    if (!entry.title) throw new Error('目录项缺少标题');
    counts.set(entry.category, counts.get(entry.category) + 1);
  }

  if (entries.length !== 191) throw new Error(`目录总数应为 191，实际为 ${entries.length}`);
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (counts.get(category) !== config.expectedCount) {
      throw new Error(`${category} 分类应有 ${config.expectedCount} 篇，实际为 ${counts.get(category)}`);
    }
  }
}
