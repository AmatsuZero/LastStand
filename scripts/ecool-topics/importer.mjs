import { createHash, randomUUID } from 'node:crypto';
import { link, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizeExercise } from './model.mjs';
import { renderTagArticle } from './render.mjs';

const STATE = '.omc/state/ecool-topics.json';
const CACHE = '.omc/state/ecool-topics-cache';
const sha = (text) => createHash('sha256').update(text).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function target(root, relative) {
  const base = path.resolve(root); const result = path.resolve(base, relative);
  if (!result.startsWith(`${base}${path.sep}`)) throw Object.assign(new Error(`路径越界: ${relative}`), { code: 'TARGET_PATH_INVALID' });
  return result;
}
async function readOptional(file) { try { return await readFile(file, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function replaceAtomic(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try { await writeFile(temporary, content, { flag: 'wx' }); await rename(temporary, file); } finally { await rm(temporary, { force: true }); }
}
async function createAtomic(file, content) {
  const existing = await readOptional(file);
  if (existing !== null) {
    if (sha(existing) === sha(content)) return 'skipped';
    throw Object.assign(new Error(`目标已存在且内容不同: ${file}`), { code: 'TARGET_CONFLICT' });
  }
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    try { await link(temporary, file); } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const raced = await readOptional(file);
      if (raced !== null && sha(raced) === sha(content)) return 'skipped';
      throw Object.assign(new Error(`目标发生并发冲突: ${file}`), { code: 'TARGET_CONFLICT' });
    }
    return 'written';
  } finally { await rm(temporary, { force: true }); }
}
async function replaceOwnedAtomic(file, content, expectedChecksum) {
  const initial = await readOptional(file);
  if (initial === null || !expectedChecksum || sha(initial) !== expectedChecksum) {
    throw Object.assign(new Error(`目标不再匹配导入器 checkpoint: ${file}`), { code: 'TARGET_CONFLICT' });
  }
  if (sha(initial) === sha(content)) return 'skipped';
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    const beforeCommit = await readOptional(file);
    if (beforeCommit === null || sha(beforeCommit) !== expectedChecksum) {
      throw Object.assign(new Error(`原子刷新前目标发生变化: ${file}`), { code: 'TARGET_CONFLICT' });
    }
    await rename(temporary, file);
    return 'written';
  } finally { await rm(temporary, { force: true }); }
}
async function retry(operation, { retries, baseDelayMs }) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try { return await operation(); } catch (error) { last = error; if (attempt < retries) await sleep(baseDelayMs * (2 ** attempt)); }
  }
  throw last;
}
async function loadState(root) {
  const text = await readOptional(target(root, STATE));
  return text ? JSON.parse(text) : { version: 1, completedTags: {}, failures: [] };
}

export async function importTopics({ api, root, start = 0, limit = Infinity, delayMs = 300, retries = 3, baseDelayMs = 250, refreshOwned = false, now = () => new Date().toISOString() }) {
  const state = await loadState(root);
  const tags = (await retry(() => api.listTags(), { retries, baseDelayMs })).filter((tag) => tag.name);
  const section = [
    '+++', 'title = "前端面试题"', 'draft = false', 'weight = -80',
    'tags = ["面试", "前端", "ecool"]', 'categories = ["前端开发", "面试"]',
    'source = "https://fe.ecool.fun/topic-list"', '+++', '',
    'ECool 前端面试题，按题目标签汇总整理。', '',
  ].join('\n');
  await createAtomic(target(root, 'content/posts/frontend/interview-questions/_index.md'), section);
  const selected = tags.slice(start, Number.isFinite(limit) ? start + limit : undefined);
  const detailMemory = new Map();
  const report = { written: 0, skipped: 0, detailsFetched: 0, tags: tags.length };
  for (const tag of selected) {
    const outputRelative = `content/posts/frontend/interview-questions/${tag.slug}/index.md`;
    try {
      const summaries = await retry(() => api.listExercises(tag), { retries, baseDelayMs });
      const byKey = new Map();
      for (const item of summaries) if (!byKey.has(item.exerciseKey)) byKey.set(item.exerciseKey, item);
      const unique = [...byKey.values()];
      const details = [];
      for (const summary of unique) {
        const key = summary.exerciseKey;
        const cacheFile = target(root, `${CACHE}/${encodeURIComponent(key)}.json`);
        let detail = detailMemory.get(key);
        const cached = detail ? null : await readOptional(cacheFile);
        if (!detail && cached) detail = JSON.parse(cached);
        if (!detail) {
          detail = await retry(() => api.getExerciseDetail(key), { retries, baseDelayMs });
          detail = normalizeExercise({ ...summary, ...detail, exerciseKey: key });
          await replaceAtomic(cacheFile, `${JSON.stringify(detail, null, 2)}\n`);
          report.detailsFetched += 1;
          if (delayMs) await sleep(delayMs);
        }
        detailMemory.set(key, detail); details.push(normalizeExercise({ ...summary, ...detail, exerciseKey: key }));
      }
      const generatedAt = state.completedTags[tag.slug]?.generatedAt ?? now();
      const content = renderTagArticle(tag, details, { generatedAt });
      const previous = state.completedTags[tag.slug];
      const status = refreshOwned && previous
        ? await replaceOwnedAtomic(target(root, outputRelative), content, previous.checksum)
        : await createAtomic(target(root, outputRelative), content);
      report[status] += 1;
      state.completedTags[tag.slug] = { path: outputRelative, checksum: sha(content), count: details.length, generatedAt };
      state.failures = state.failures.filter((failure) => failure.tag !== tag.slug);
      await replaceAtomic(target(root, STATE), `${JSON.stringify(state, null, 2)}\n`);
    } catch (error) {
      state.failures = state.failures.filter((failure) => failure.tag !== tag.slug);
      state.failures.push({ tag: tag.slug, code: error.code ?? 'IMPORT_FAILED', message: error.message, failedAt: now() });
      await replaceAtomic(target(root, STATE), `${JSON.stringify(state, null, 2)}\n`);
      throw error;
    }
  }
  return report;
}
