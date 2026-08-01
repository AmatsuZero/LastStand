import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { importTopics } from './importer.mjs';

async function temporary(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ecool-topics-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}
function fixtureApi(calls) {
  return {
    async listTags() { return [{ id: 1, name: 'CSS', slug: 'css' }, { id: 2, name: '', slug: 'empty' }]; },
    async listExercises() {
      return [
        { exerciseKey: 'css-1', title: '盒模型', difficulty: '简单', type: '简答题' },
        { exerciseKey: 'css-1', title: '重复项' },
        { exerciseKey: 'shared', title: '代码与表格' },
      ];
    },
    async getExerciseDetail(key) {
      calls.push(key);
      if (key === 'css-1') return { exerciseKey: key, pivot: '- content-box\n- border-box', explanation: '```css\n.a { box-sizing: border-box; }\n```' };
      return { exerciseKey: key, category: 'Choice', desc: '请选择：', pivot: '| A | B |\n|---|---|\n| 1 | 2 |', options: JSON.stringify({ options: ['甲', '乙'], isMulti: false, answer: [1] }), explanation: '答案' };
    },
  };
}

test('creates one article per non-empty tag, deduplicates keys and preserves markdown', async () => {
  await temporary(async (root) => {
    const calls = [];
    const report = await importTopics({ api: fixtureApi(calls), root, delayMs: 0, now: () => '2026-08-01T00:00:00.000Z' });
    assert.deepEqual(calls, ['css-1', 'shared']);
    assert.deepEqual(report, { written: 1, skipped: 0, detailsFetched: 2, tags: 1 });
    const article = await readFile(path.join(root, 'content/posts/frontend/interview-questions/css/index.md'), 'utf8');
    assert.match(article, /## 1\. 盒模型 \{#question-css-1\}/);
    assert.match(article, /> 难度：简单 · 类型：简答题/);
    assert.match(article, /### 题目要点[\s\S]*- content-box/);
    assert.match(article, /<details>[\s\S]*```css[\s\S]*box-sizing/);
    assert.match(article, /\| A \| B \|/);
    assert.match(article, /请选择：\n\n- A\. 甲\n- B\. 乙/);
    assert.match(article, /<details>[\s\S]*\*\*正确答案：B\*\*/);
  });
});

test('derives a useful point from explanation and falls back to the question title', async () => {
  await temporary(async (root) => {
    const api = fixtureApi([]);
    api.listExercises = async () => [
      { exerciseKey: 'derived', title: '事件循环' },
      { exerciseKey: 'fallback', title: '闭包是什么' },
    ];
    api.getExerciseDetail = async (key) => key === 'derived'
      ? { exerciseKey: key, pivot: '', explanation: '# 答案\n\n```js\nconsole.log(1)\n```\n\n- 事件循环协调宏任务与微任务。\n- 第二点' }
      : { exerciseKey: key, pivot: '', explanation: '```js\nconst x = 1\n```' };
    await importTopics({ api, root, delayMs: 0 });
    const article = await readFile(path.join(root, 'content/posts/frontend/interview-questions/css/index.md'), 'utf8');
    assert.match(article, /### 题目要点\n\n事件循环协调宏任务与微任务。/);
    assert.match(article, /### 题目要点\n\n核心考查：闭包是什么的基本概念、实现原理与实际应用。/);
    assert.doesNotMatch(article, /暂无题目要点/);
  });
});

test('resumes from detail cache and safely skips identical article', async () => {
  await temporary(async (root) => {
    const firstCalls = [];
    await importTopics({ api: fixtureApi(firstCalls), root, delayMs: 0, now: () => 'fixed' });
    const secondCalls = [];
    const report = await importTopics({ api: fixtureApi(secondCalls), root, delayMs: 0, now: () => 'changed' });
    assert.deepEqual(secondCalls, []);
    assert.equal(report.skipped, 1);
    assert.equal(report.detailsFetched, 0);
  });
});

test('never overwrites a different existing article', async () => {
  await temporary(async (root) => {
    const directory = path.join(root, 'content/posts/frontend/interview-questions/css');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.md'), 'user content\n');
    await assert.rejects(
      importTopics({ api: fixtureApi([]), root, delayMs: 0 }),
      (error) => error.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(path.join(directory, 'index.md'), 'utf8'), 'user content\n');
  });
});

test('supports tag batches with start and limit', async () => {
  await temporary(async (root) => {
    const calls = [];
    const api = fixtureApi(calls);
    api.listTags = async () => [{ id: 1, name: 'CSS', slug: 'css' }, { id: 2, name: 'HTML', slug: 'html' }];
    await importTopics({ api, root, start: 1, limit: 1, delayMs: 0 });
    await assert.rejects(readFile(path.join(root, 'content/posts/frontend/interview-questions/css/index.md')), /ENOENT/);
    assert.match(await readFile(path.join(root, 'content/posts/frontend/interview-questions/html/index.md'), 'utf8'), /HTML 面试题/);
  });
});

test('escapes dangerous raw HTML outside fences while preserving fenced examples', async () => {
  await temporary(async (root) => {
    const api = fixtureApi([]);
    api.listExercises = async () => [{ exerciseKey: 'unsafe', title: 'HTML 安全' }];
    api.getExerciseDetail = async () => ({
      exerciseKey: 'unsafe',
      pivot: '<iframe src="bad"></iframe> 后续中文',
      explanation: '<script>alert(1)</script>\n\n```html\n<script>示例</script>\n```\n\n~~~css\n<style>示例</style>\n~~~\n<form>表单</form><object></object><embed>',
    });
    await importTopics({ api, root, delayMs: 0 });
    const article = await readFile(path.join(root, 'content/posts/frontend/interview-questions/css/index.md'), 'utf8');
    assert.match(article, /&lt;iframe src="bad"&gt;&lt;\/iframe&gt; 后续中文/);
    assert.match(article, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(article, /```html\n<script>示例<\/script>\n```/);
    assert.match(article, /~~~css\n<style>示例<\/style>\n~~~/);
    assert.match(article, /&lt;form&gt;表单&lt;\/form&gt;&lt;object&gt;&lt;\/object&gt;&lt;embed&gt;/);
    assert.doesNotMatch(article, /\n<script>alert/);
  });
});

test('refreshOwned replaces only an article still matching its checkpoint checksum', async () => {
  await temporary(async (root) => {
    await importTopics({ api: fixtureApi([]), root, delayMs: 0, now: () => 'fixed' });
    const cache = path.join(root, '.omc/state/ecool-topics-cache/css-1.json');
    const detail = JSON.parse(await readFile(cache, 'utf8'));
    detail.explanation = '<script>需要转义的新答案</script>';
    await writeFile(cache, `${JSON.stringify(detail, null, 2)}\n`);
    const report = await importTopics({ api: fixtureApi([]), root, delayMs: 0, refreshOwned: true, now: () => 'changed' });
    assert.equal(report.written, 1);
    const article = await readFile(path.join(root, 'content/posts/frontend/interview-questions/css/index.md'), 'utf8');
    assert.match(article, /&lt;script&gt;需要转义的新答案&lt;\/script&gt;/);
    assert.doesNotMatch(article, /generatedAt = "changed"/);
    const checkpoint = JSON.parse(await readFile(path.join(root, '.omc/state/ecool-topics.json'), 'utf8'));
    assert.equal(checkpoint.completedTags.css.checksum.length, 64);
  });
});

test('refreshOwned rejects an article changed after checkpointing', async () => {
  await temporary(async (root) => {
    await importTopics({ api: fixtureApi([]), root, delayMs: 0 });
    const article = path.join(root, 'content/posts/frontend/interview-questions/css/index.md');
    await writeFile(article, '用户修改\n');
    await assert.rejects(
      importTopics({ api: fixtureApi([]), root, delayMs: 0, refreshOwned: true }),
      (error) => error.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(article, 'utf8'), '用户修改\n');
  });
});
