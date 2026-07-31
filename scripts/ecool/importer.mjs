import { link, lstat, mkdir, mkdtemp, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

import {
  archiveCurrentImages,
  extractCurrentArticle,
  selectEntry,
} from './browser-extractor.mjs';
import {
  CATEGORY_CONFIG,
  articleRelativePath,
  buildFrontmatter,
  slugify,
} from './model.mjs';
import { renderMarkdown } from './markdown.mjs';

const SOURCE_URL = 'https://fe.ecool.fun/knowledge-learn';
const CHECKPOINT_RELATIVE_PATH = '.omc/state/ecool-import.json';
const MAX_BATCH_SIZE = 20;

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function checksum(value) {
  return createHash('sha256').update(value).digest('hex');
}

function resolveTarget(root, relativePath) {
  const base = path.resolve(root);
  const target = path.resolve(base, relativePath);
  if (!target.startsWith(`${base}${path.sep}`)) {
    throw codedError('TARGET_PATH_INVALID', `导入目标超出根目录: ${relativePath}`);
  }
  return target;
}

async function readTextIfPresent(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeTextAtomically(root, relativePath, content, onTemporaryWrite, onBeforeCommit) {
  const targetPath = resolveTarget(root, relativePath);
  const existing = await readTextIfPresent(targetPath);
  const fileChecksum = checksum(content);
  if (existing !== null) {
    if (checksum(existing) === fileChecksum) {
      return { status: 'skipped', relativePath, fileChecksum };
    }
    throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  const lockPath = `${targetPath}.ecool-import.lock`;
  let lock;
  try {
    lock = await open(lockPath, 'wx');
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw codedError('TARGET_LOCKED', `导入目标正由另一批次写入: ${relativePath}`);
    }
    throw error;
  }
  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    // The lock closes the check-to-rename window between concurrent importer processes.
    const beforeRename = await readTextIfPresent(targetPath);
    if (beforeRename !== null) {
      if (checksum(beforeRename) === fileChecksum) {
        return { status: 'skipped', relativePath, fileChecksum };
      }
      throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
    }
    await writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
    if (onTemporaryWrite) await onTemporaryWrite({ temporaryPath, targetPath, content });

    // Check again immediately before rename so concurrent importers fail closed instead of clobbering a user file.
    const current = await readTextIfPresent(targetPath);
    if (current !== null) {
      if (checksum(current) === fileChecksum) {
        return { status: 'skipped', relativePath, fileChecksum };
      }
      throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
    }
    if (onBeforeCommit) await onBeforeCommit({ temporaryPath, targetPath, content });
    try {
      // link(2) is atomic no-replace: unlike rename(2), it cannot clobber a file created after the check above.
      await link(temporaryPath, targetPath);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      const raced = await readTextIfPresent(targetPath);
      if (raced !== null && checksum(raced) === fileChecksum) {
        return { status: 'skipped', relativePath, fileChecksum };
      }
      throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
    }
    return { status: 'written', relativePath, fileChecksum };
  } finally {
    await rm(temporaryPath, { force: true });
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

function markdownFor(record) {
  if (typeof record.markdown === 'string') return record.markdown.endsWith('\n') ? record.markdown : `${record.markdown}\n`;
  return renderMarkdown(record.blocks);
}

function contentFor(record, markdown) {
  if (typeof record.content === 'string') return record.content.endsWith('\n') ? record.content : `${record.content}\n`;
  return `${buildFrontmatter(record)}${markdown}`;
}

export async function writeArticleAtomically(root, record) {
  const markdown = markdownFor(record);
  const relativePath = record.relativePath || articleRelativePath(record);
  const result = await writeTextAtomically(
    root,
    relativePath,
    contentFor(record, markdown),
    record.onTemporaryWrite,
    record.onBeforeCommit,
  );
  return {
    ...result,
    bodyChecksum: checksum(markdown),
    imageCount: Number.isInteger(record.imageCount) ? record.imageCount : 0,
  };
}

function tomlArray(values) {
  return `[${values.map((value) => `"${value}"`).join(', ')}]`;
}

function rootIndexContent() {
  return [
    '+++',
    'title = "ECool 前端面试资料"',
    'draft = true',
    'weight = -90',
    `source = "${SOURCE_URL}"`,
    '+++',
    'ECool 前端面试资料，按原站知识树分类与顺序整理。',
    '',
  ].join('\n');
}

function sectionIndexContent(category, config, weight) {
  return [
    '+++',
    `title = "${category}"`,
    'draft = true',
    `weight = ${weight}`,
    `tags = ${tomlArray([...config.tags, 'ecool'])}`,
    `categories = ${tomlArray(config.categories)}`,
    `source = "${SOURCE_URL}"`,
    '+++',
    `ECool 面试资料中的${category}分类，文章顺序与原站知识树一致。`,
    '',
  ].join('\n');
}

export async function writeSectionIndexes(root, catalog) {
  void catalog;
  const entries = [
    ['content/posts/interview/ecool/_index.md', rootIndexContent()],
    ...Object.entries(CATEGORY_CONFIG).map(([category, config], index) => [
      `content/posts/interview/ecool/${config.directory}/_index.md`,
      sectionIndexContent(category, config, index + 1),
    ]),
  ];
  const results = [];
  for (const [relativePath, content] of entries) {
    results.push(await writeTextAtomically(root, relativePath, content));
  }
  return {
    written: results.filter((result) => result.status === 'written').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
  };
}

function emptyCheckpoint() {
  return { version: 1, completed: [], failures: [] };
}

async function readCheckpoint(root) {
  const statePath = resolveTarget(root, CHECKPOINT_RELATIVE_PATH);
  const text = await readTextIfPresent(statePath);
  if (text === null) return emptyCheckpoint();
  let checkpoint;
  try {
    checkpoint = JSON.parse(text);
  } catch {
    throw codedError('CHECKPOINT_INVALID', `断点状态不是有效 JSON: ${CHECKPOINT_RELATIVE_PATH}`);
  }
  if (!Array.isArray(checkpoint.completed) || !Array.isArray(checkpoint.failures)) {
    throw codedError('CHECKPOINT_INVALID', `断点状态缺少完成或失败列表: ${CHECKPOINT_RELATIVE_PATH}`);
  }
  return checkpoint;
}

async function writeCheckpoint(root, checkpoint) {
  const relativePath = CHECKPOINT_RELATIVE_PATH;
  const targetPath = resolveTarget(root, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = path.join(path.dirname(targetPath), `.ecool-import.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, `${JSON.stringify(checkpoint, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, targetPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withCheckpointLock(root, run) {
  const lockPath = resolveTarget(root, '.omc/state/ecool-import.lock');
  await mkdir(path.dirname(lockPath), { recursive: true });
  let lock;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      lock = await open(lockPath, 'wx');
      break;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      await delay(5);
    }
  }
  if (!lock) throw codedError('CHECKPOINT_LOCKED', `断点状态正由另一批次更新: ${CHECKPOINT_RELATIVE_PATH}`);
  try {
    return await run();
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

async function updateCheckpoint(root, update) {
  return withCheckpointLock(root, async () => {
    const checkpoint = await readCheckpoint(root);
    update(checkpoint);
    await writeCheckpoint(root, checkpoint);
    return checkpoint;
  });
}

function fallbackSlug(entry) {
  const config = CATEGORY_CONFIG[entry.category];
  if (!config) throw codedError('CATEGORY_INVALID', `未知分类: ${entry.category}`);
  return slugify(entry.title, `${config.directory}-${String(entry.weight).padStart(3, '0')}`);
}

async function completedEntryMatches(root, completed) {
  if (!completed?.fileChecksum || !completed?.path) return false;
  const current = await readTextIfPresent(resolveTarget(root, completed.path));
  return current !== null && checksum(current) === completed.fileChecksum;
}

function saveFailure(checkpoint, entry, relativePath, error) {
  const failure = {
    title: entry?.title || '',
    path: relativePath,
    error: { code: error?.code || 'IMPORT_FAILED', message: error?.message || String(error) },
    failedAt: new Date().toISOString(),
  };
  checkpoint.failures = checkpoint.failures.filter((item) => item.path !== relativePath);
  checkpoint.failures.push(failure);
}

async function pathExists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function removeOwnedLinks(links) {
  for (const { source, target } of links.reverse()) {
    try {
      const [sourceStats, targetStats] = await Promise.all([lstat(source), lstat(target)]);
      if (sourceStats.dev === targetStats.dev && sourceStats.ino === targetStats.ino) {
        await rm(target, { force: true });
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

async function commitStagedBundle(root, relativePath, stagingDirectory, content, assets) {
  const targetPath = resolveTarget(root, relativePath);
  const targetDirectory = path.dirname(targetPath);
  const stagedIndex = path.join(stagingDirectory, 'index.md');
  const fileChecksum = checksum(content);
  await mkdir(path.dirname(targetDirectory), { recursive: true });
  try {
    await mkdir(targetDirectory);
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
  }

  const created = [];
  try {
    for (const asset of assets) {
      const source = path.join(stagingDirectory, asset.filename);
      const target = path.join(targetDirectory, asset.filename);
      await link(source, target);
      created.push({ source, target });
    }
    await link(stagedIndex, targetPath);
    created.push({ source: stagedIndex, target: targetPath });
    return { status: 'written', relativePath, fileChecksum };
  } catch (error) {
    await removeOwnedLinks(created);
    if (error?.code === 'EEXIST') {
      throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
    }
    throw error;
  }
}

async function withStagingDirectory(root, run) {
  const stagingParent = resolveTarget(root, '.omc/state/ecool-import-staging');
  await mkdir(stagingParent, { recursive: true });
  const stagingDirectory = await mkdtemp(path.join(stagingParent, 'bundle-'));
  try {
    return await run(stagingDirectory);
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

export async function runBatch({ tab, root, catalog, start = 0, limit = MAX_BATCH_SIZE }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_BATCH_SIZE) {
    throw codedError('BATCH_LIMIT_EXCEEDED', `单批最多处理 ${MAX_BATCH_SIZE} 篇，实际请求 ${limit}`);
  }
  if (!Number.isInteger(start) || start < 0) throw codedError('BATCH_START_INVALID', `无效批次起点: ${start}`);
  if (!Array.isArray(catalog)) throw codedError('CATALOG_INVALID', '目录清单必须是数组');

  const checkpoint = await readCheckpoint(root);
  const batch = catalog.slice(start, start + limit);
  let completed = 0;
  let skipped = 0;

  for (const entry of batch) {
    let relativePath = null;
    try {
      const slug = fallbackSlug(entry);
      relativePath = articleRelativePath({ ...entry, slug });
      const previous = checkpoint.completed.find((item) => item.path === relativePath);
      if (previous && await completedEntryMatches(root, previous)) {
        skipped += 1;
        continue;
      }
      if (previous) {
        throw codedError('CHECKPOINT_CHECKSUM_MISMATCH', `已完成文章的磁盘校验和不匹配: ${relativePath}`);
      }
      const targetDirectory = path.dirname(resolveTarget(root, relativePath));
      if (await pathExists(targetDirectory)) {
        throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
      }
      await selectEntry(tab, entry);
      const article = await extractCurrentArticle(tab);
      if (article.title !== entry.title) {
        throw codedError('PAGE_TITLE_MISMATCH', `页面标题不匹配：期望 ${entry.title}，实际 ${article.title}`);
      }

      const record = { ...entry, ...article, slug };
      const written = await withStagingDirectory(root, async (stagingDirectory) => {
        const archived = await archiveCurrentImages(tab, record, stagingDirectory);
        record.markdown = renderMarkdown(record.blocks);
        record.imageCount = archived.assets.length;
        const content = contentFor(record, record.markdown);
        await writeFile(path.join(stagingDirectory, 'index.md'), content, { encoding: 'utf8', flag: 'wx' });
        const result = await commitStagedBundle(root, relativePath, stagingDirectory, content, archived.assets);
        return {
          ...result,
          bodyChecksum: checksum(record.markdown),
          imageCount: record.imageCount,
        };
      });
      await updateCheckpoint(root, (latest) => {
        latest.completed = latest.completed.filter((item) => item.path !== relativePath);
        latest.completed.push({
          title: record.title,
          path: written.relativePath,
          checksum: written.bodyChecksum,
          fileChecksum: written.fileChecksum,
          imageCount: written.imageCount,
          completedAt: new Date().toISOString(),
        });
        latest.failures = latest.failures.filter((item) => item.path !== relativePath);
      });
      if (written.status === 'skipped') skipped += 1;
      else completed += 1;
    } catch (error) {
      await updateCheckpoint(root, (latest) => saveFailure(latest, entry, relativePath, error));
      throw error;
    }
  }
  return { completed, skipped, failures: (await readCheckpoint(root)).failures.length };
}
