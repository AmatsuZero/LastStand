import { link, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
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
const execFile = promisify(execFileCallback);
const RENAME_EXCL_SCRIPT = String.raw`
import ctypes
import os
import sys

libc = ctypes.CDLL('/usr/lib/libSystem.B.dylib', use_errno=True)
renameatx_np = libc.renameatx_np
renameatx_np.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
renameatx_np.restype = ctypes.c_int
AT_FDCWD = -100
RENAME_EXCL = 0x00000004
if renameatx_np(AT_FDCWD, os.fsencode(sys.argv[1]), AT_FDCWD, os.fsencode(sys.argv[2]), RENAME_EXCL) != 0:
    print(ctypes.get_errno())
    sys.exit(1)
`;

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

function isWithin(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

async function targetDirectoryState(root, targetDirectory) {
  const logicalRoot = path.resolve(root);
  const realRoot = await realpath(logicalRoot);
  if (!isWithin(logicalRoot, targetDirectory)) {
    throw codedError('TARGET_CONFLICT', `导入目标超出根目录: ${targetDirectory}`);
  }
  const relative = path.relative(logicalRoot, targetDirectory);
  let current = logicalRoot;
  let targetExists = false;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) {
        throw codedError('TARGET_CONFLICT', `导入目标包含非目录或符号链接: ${current}`);
      }
      if (!isWithin(realRoot, await realpath(current))) {
        throw codedError('TARGET_CONFLICT', `导入目标解析到根目录外: ${current}`);
      }
      if (current === targetDirectory) targetExists = true;
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
  }
  return { realRoot, targetExists };
}

async function publishDirectoryNoReplace(stagingDirectory, targetDirectory) {
  try {
    await execFile('python3', ['-c', RENAME_EXCL_SCRIPT, stagingDirectory, targetDirectory]);
  } catch (error) {
    const errno = Number(String(error?.stdout || '').trim());
    if (errno === 17) return false;
    throw codedError('BUNDLE_PUBLISH_FAILED', `无法使用 macOS 无覆盖目录提交: ${error?.message || String(error)}`);
  }
  return true;
}

async function bundleFileMap(directory, prefix = '') {
  const files = new Map();
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isFile()) {
      files.set(relativePath, await readFile(absolutePath));
    } else if (entry.isDirectory()) {
      files.set(`${relativePath}/`, null);
      for (const [childPath, childContents] of await bundleFileMap(absolutePath, relativePath)) {
        files.set(childPath, childContents);
      }
    } else {
      throw codedError('BUNDLE_ENTRY_INVALID', `页面包包含不支持的条目: ${relativePath}`);
    }
  }
  return files;
}

async function bundlesMatch(stagingDirectory, targetDirectory) {
  const [staging, target] = await Promise.all([bundleFileMap(stagingDirectory), bundleFileMap(targetDirectory)]);
  if (staging.size !== target.size) return false;
  for (const [relativePath, stagingContents] of staging) {
    const targetContents = target.get(relativePath);
    if (targetContents === undefined) return false;
    if (stagingContents === null || targetContents === null) {
      if (stagingContents !== targetContents) return false;
    } else if (!stagingContents.equals(targetContents)) {
      return false;
    }
  }
  return true;
}

async function commitStagedBundle(root, relativePath, stagingDirectory, content, onBeforeBundleCommit, onAfterBundlePrecheck) {
  const targetPath = resolveTarget(root, relativePath);
  const targetDirectory = path.dirname(targetPath);
  const fileChecksum = checksum(content);
  let state = await targetDirectoryState(root, targetDirectory);
  try {
    await mkdir(path.dirname(targetDirectory), { recursive: true });
  } catch (error) {
    throw codedError('TARGET_CONFLICT', `无法创建导入目标父目录: ${relativePath}`);
  }
  state = await targetDirectoryState(root, targetDirectory);
  if (onBeforeBundleCommit) await onBeforeBundleCommit({ stagingDirectory, targetDirectory });
  state = await targetDirectoryState(root, targetDirectory);
  if (state.targetExists) {
    if (await bundlesMatch(stagingDirectory, targetDirectory)) {
      return { status: 'skipped', relativePath, fileChecksum };
    }
    throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
  }
  if (onAfterBundlePrecheck) await onAfterBundlePrecheck({ stagingDirectory, targetDirectory });
  if (!await publishDirectoryNoReplace(stagingDirectory, targetDirectory)) {
    state = await targetDirectoryState(root, targetDirectory);
    if (state.targetExists && await bundlesMatch(stagingDirectory, targetDirectory)) {
      return { status: 'skipped', relativePath, fileChecksum };
    }
    throw codedError('TARGET_CONFLICT', `导入目标已存在且内容不同: ${relativePath}`);
  }
  return { status: 'written', relativePath, fileChecksum };
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

export async function runBatch({
  tab,
  root,
  catalog,
  start = 0,
  limit = MAX_BATCH_SIZE,
  onBeforeBundleCommit,
  onAfterBundlePrecheck,
}) {
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
        const result = await commitStagedBundle(
          root,
          relativePath,
          stagingDirectory,
          content,
          onBeforeBundleCommit,
          onAfterBundlePrecheck,
        );
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
