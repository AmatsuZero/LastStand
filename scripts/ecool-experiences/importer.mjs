import { createHash, randomUUID } from 'node:crypto';
import { link, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { experienceSlug, inferCompanyName, roundSlug } from './model.mjs';
import { renderExperienceIndex, renderRootIndex, renderRoundArticle } from './render.mjs';

const STATE = '.omc/state/ecool-experiences.json';
const EXPERIENCE_CACHE = '.omc/state/ecool-experiences-cache';
const TOPIC_CACHE = '.omc/state/ecool-topics-cache';
const OUTPUT = 'content/posts/frontend/interview-experiences';

const checksum = (text) => createHash('sha256').update(text).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function target(root, relative) {
  const base = path.resolve(root);
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(`${base}${path.sep}`)) {
    throw Object.assign(new Error(`路径越界: ${relative}`), { code: 'TARGET_PATH_INVALID' });
  }
  return resolved;
}

async function readOptional(file) {
  try { return await readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function replaceAtomic(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function createAtomic(file, content) {
  const existing = await readOptional(file);
  if (existing !== null) {
    if (checksum(existing) === checksum(content)) return 'skipped';
    throw Object.assign(new Error(`目标已存在且内容不同: ${file}`), { code: 'TARGET_CONFLICT' });
  }
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    try { await link(temporary, file); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const raced = await readOptional(file);
      if (raced !== null && checksum(raced) === checksum(content)) return 'skipped';
      throw Object.assign(new Error(`目标发生并发冲突: ${file}`), { code: 'TARGET_CONFLICT' });
    }
    return 'written';
  } finally {
    await rm(temporary, { force: true });
  }
}

async function replaceOwnedAtomic(file, content, expectedChecksum) {
  const initial = await readOptional(file);
  if (initial === null || !expectedChecksum || checksum(initial) !== expectedChecksum) {
    throw Object.assign(new Error(`目标不再匹配导入器 checkpoint: ${file}`), { code: 'TARGET_CONFLICT' });
  }
  if (checksum(initial) === checksum(content)) return 'skipped';
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { flag: 'wx' });
    const beforeCommit = await readOptional(file);
    if (beforeCommit === null || checksum(beforeCommit) !== expectedChecksum) {
      throw Object.assign(new Error(`原子刷新前目标发生变化: ${file}`), { code: 'TARGET_CONFLICT' });
    }
    await rename(temporary, file);
    return 'written';
  } finally {
    await rm(temporary, { force: true });
  }
}

async function retry(operation, { retries, baseDelayMs }) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try { return await operation(); }
    catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(baseDelayMs * (2 ** attempt));
    }
  }
  throw lastError;
}

async function cachedJson(root, relative) {
  const text = await readOptional(target(root, relative));
  return text ? JSON.parse(text) : null;
}

async function cacheJson(root, relative, value) {
  await replaceAtomic(target(root, relative), `${JSON.stringify(value, null, 2)}\n`);
}

async function loadState(root) {
  return (await cachedJson(root, STATE)) ?? { version: 1, files: {}, warnings: [] };
}

async function writeGenerated(root, relative, content, report, state, refreshOwned) {
  const previous = state.files[relative];
  const status = refreshOwned && previous
    ? await replaceOwnedAtomic(target(root, relative), content, previous.checksum)
    : await createAtomic(target(root, relative), content);
  report[status] += 1;
  state.files[relative] = { checksum: checksum(content) };
}

async function resolvePublicDetails(detail, { api, root, memory, retries, baseDelayMs, delayMs, report }) {
  for (const round of detail.rounds) {
    for (const question of round.questions) {
      if (!question.exerciseKey) continue;
      const key = question.exerciseKey;
      let exercise = memory.get(key);
      if (!exercise) exercise = await cachedJson(root, `${TOPIC_CACHE}/${encodeURIComponent(key)}.json`);
      if (!exercise) {
        try {
          exercise = await retry(() => api.getExerciseDetail(key), { retries, baseDelayMs });
          await cacheJson(root, `${TOPIC_CACHE}/${encodeURIComponent(key)}.json`, exercise);
          report.publicDetailsFetched += 1;
          if (delayMs) await sleep(delayMs);
        } catch (error) {
          report.publicDetailsMissing += 1;
          report.warnings.push({
            experienceId: detail.experience.id,
            roundId: round.id,
            exerciseKey: key,
            code: error.code ?? 'EXERCISE_DETAIL_FAILED',
            message: error.message,
          });
          exercise = {};
        }
      }
      memory.set(key, exercise);
      question.detail = exercise;
    }
  }
}

export async function importExperiences({
  api,
  root,
  start = 0,
  limit = Infinity,
  delayMs = 100,
  retries = 3,
  baseDelayMs = 250,
  refreshOwned = false,
} = {}) {
  if (!api || !root) throw new TypeError('importExperiences 需要 api 和 root');
  const state = await loadState(root);
  const companies = await retry(() => api.listCompanies(), { retries, baseDelayMs });
  const companyMap = new Map(companies.map((company) => [company.id, company]));
  const summaries = await retry(() => api.listExperiences(), { retries, baseDelayMs });
  const selected = summaries.slice(start, Number.isFinite(limit) ? start + limit : undefined);
  const report = {
    written: 0,
    skipped: 0,
    experiences: selected.length,
    rounds: 0,
    questions: 0,
    publicDetailsFetched: 0,
    publicDetailsMissing: 0,
    warnings: [],
  };
  const details = [];
  const publicDetailMemory = new Map();

  for (const summary of selected) {
    const cacheRelative = `${EXPERIENCE_CACHE}/experience-${summary.id}.json`;
    let detail = await cachedJson(root, cacheRelative);
    if (!detail) {
      detail = await retry(() => api.getExperienceDetail(summary.id, companyMap), { retries, baseDelayMs });
      await cacheJson(root, cacheRelative, detail);
      if (delayMs) await sleep(delayMs);
    }
    if (!detail.experience.companyName) {
      detail.experience.companyName = companyMap.get(Number(detail.experience.companyId))?.name
        ?? inferCompanyName(detail.experience.title);
    }
    await resolvePublicDetails(detail, {
      api, root, memory: publicDetailMemory, retries, baseDelayMs, delayMs, report,
    });
    report.rounds += detail.rounds.length;
    report.questions += detail.rounds.reduce((sum, round) => sum + round.questions.length, 0);
    details.push(detail);
  }

  await writeGenerated(root, `${OUTPUT}/_index.md`, renderRootIndex(details), report, state, refreshOwned);
  for (let experienceIndex = 0; experienceIndex < details.length; experienceIndex += 1) {
    const detail = details[experienceIndex];
    const directory = `${OUTPUT}/${experienceSlug(detail.experience.id)}`;
    await writeGenerated(root, `${directory}/_index.md`, renderExperienceIndex(detail, { weight: experienceIndex + 1 }), report, state, refreshOwned);
    for (let roundIndex = 0; roundIndex < detail.rounds.length; roundIndex += 1) {
      const round = detail.rounds[roundIndex];
      const relative = `${directory}/${roundSlug(round.id)}/index.md`;
      await writeGenerated(root, relative, renderRoundArticle(detail, round, roundIndex), report, state, refreshOwned);
    }
  }

  state.sourceCount = summaries.length;
  state.importedExperienceIds = details.map(({ experience }) => experience.id);
  state.warnings = report.warnings;
  await replaceAtomic(target(root, STATE), `${JSON.stringify(state, null, 2)}\n`);
  return report;
}
