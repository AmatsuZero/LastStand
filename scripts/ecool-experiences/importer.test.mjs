import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { importExperiences } from './importer.mjs';
import { renderRoundArticle } from './render.mjs';

async function temporary(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ecool-experiences-'));
  try { await run(root); } finally { await rm(root, { recursive: true, force: true }); }
}

function fixtureApi(calls) {
  return {
    async listCompanies() { return [{ id: 14, name: '小红书' }]; },
    async listExperiences() {
      return [
        { id: 95, title: '小红书-社招-5年', companyId: 14, recruitType: 2 },
        { id: 96, title: '另一份面经', companyId: 14, recruitType: 1 },
      ];
    },
    async getExperienceDetail(id) {
      calls.experiences.push(id);
      if (id === 96) return {
        experience: { id, title: '另一份面经', companyId: 14, companyName: '小红书', recruitTypeName: '校招', sourceUrl: `https://fe.ecool.fun/experience/${id}` },
        rounds: [],
      };
      return {
        experience: {
          id, title: '小红书-社招-5年', companyId: 14, companyName: '小红书', recruitTypeName: '社招',
          sourceUrl: `https://fe.ecool.fun/experience/${id}`, createAt: '2026-02-01T00:00:00.000Z',
        },
        rounds: [
          {
            id: 159, roundOrder: 1, title: '技术面试', description: '第一轮概述', keyPoints: '',
            questions: [
              { type: 'public', exerciseKey: 'public-1', selectedTitle: 'BFC 讲一下', title: 'BFC 讲一下', explanation: '', pivot: '' },
              { type: 'subjective', exerciseKey: '', title: '为什么要创建 BFC？', explanation: '为了包含浮动。', pivot: 'BFC、浮动、高度塌陷' },
            ],
          },
          {
            id: 160, roundOrder: 2, title: '技术面试', description: '第二轮概述', keyPoints: '浏览器、缓存',
            questions: [{ type: 'subjective', exerciseKey: '', title: '缓存策略', explanation: '协商缓存。', pivot: '' }],
          },
        ],
      };
    },
    async getExerciseDetail(key) {
      calls.exercises.push(key);
      return { exerciseKey: key, title: '什么是 BFC？', pivot: '块级格式化上下文', explanation: 'BFC 能包含浮动元素。' };
    },
  };
}

test('creates one parent section per experience and one stable page bundle per round', async () => {
  await temporary(async (root) => {
    const calls = { experiences: [], exercises: [] };
    const report = await importExperiences({ api: fixtureApi(calls), root, delayMs: 0 });
    assert.deepEqual(report, {
      written: 5,
      skipped: 0,
      experiences: 2,
      rounds: 2,
      questions: 3,
      publicDetailsFetched: 1,
      publicDetailsMissing: 0,
      warnings: [],
    });
    assert.deepEqual(calls, { experiences: [95, 96], exercises: ['public-1'] });

    const parent = await readFile(path.join(root, 'content/posts/frontend/interview-experiences/experience-95/_index.md'), 'utf8');
    assert.match(parent, /hiddenInHomeList = true/);
    assert.match(parent, /第 1 轮 · 技术面试.*relref ".*round-159\/index\.md"/);
    assert.match(parent, /第 2 轮 · 技术面试.*relref ".*round-160\/index\.md"/);

    const first = await readFile(path.join(root, 'content/posts/frontend/interview-experiences/experience-95/round-159/index.md'), 'utf8');
    assert.match(first, /roundId = 159/);
    assert.match(first, /roundOrder = 1/);
    assert.match(first, /返回本次面经/);
    assert.match(first, /relref ".*round-160\/index\.md"/);
    assert.match(first, /题库原题：\[什么是 BFC？\]\(https:\/\/fe\.ecool\.fun\/topic\/public-1\)/);
    assert.match(first, /### 题目要点[\s\S]*块级格式化上下文/);
    assert.match(first, /<details>[\s\S]*BFC 能包含浮动元素。/);
    assert.match(first, /为什么要创建 BFC？[\s\S]*BFC、浮动、高度塌陷/);

    const second = await readFile(path.join(root, 'content/posts/frontend/interview-experiences/experience-95/round-160/index.md'), 'utf8');
    assert.match(second, /relref ".*round-159\/index\.md"/);
    assert.match(second, /已是最后一轮/);

    const rootIndex = await readFile(path.join(root, 'content/posts/frontend/interview-experiences/_index.md'), 'utf8');
    assert.match(rootIndex, /共整理 2 份/);
    assert.match(rootIndex, /relref ".*experience-95\/_index\.md"/);
  });
});

test('resumes from caches and skips byte-identical output', async () => {
  await temporary(async (root) => {
    const firstCalls = { experiences: [], exercises: [] };
    await importExperiences({ api: fixtureApi(firstCalls), root, delayMs: 0 });
    const secondCalls = { experiences: [], exercises: [] };
    const report = await importExperiences({ api: fixtureApi(secondCalls), root, delayMs: 0 });
    assert.equal(report.written, 0);
    assert.equal(report.skipped, 5);
    assert.deepEqual(secondCalls, { experiences: [], exercises: [] });
  });
});

test('never overwrites an existing different round article', async () => {
  await temporary(async (root) => {
    const file = path.join(root, 'content/posts/frontend/interview-experiences/experience-95/round-159/index.md');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '用户内容\n');
    await assert.rejects(
      importExperiences({ api: fixtureApi({ experiences: [], exercises: [] }), root, delayMs: 0, limit: 1 }),
      (error) => error.code === 'TARGET_CONFLICT',
    );
    assert.equal(await readFile(file, 'utf8'), '用户内容\n');
  });
});

test('keeps rendering when one public topic detail cannot be fetched', async () => {
  await temporary(async (root) => {
    const api = fixtureApi({ experiences: [], exercises: [] });
    api.getExerciseDetail = async () => { throw Object.assign(new Error('missing'), { code: 'NOT_FOUND' }); };
    const report = await importExperiences({ api, root, delayMs: 0, retries: 0, limit: 1 });
    assert.equal(report.publicDetailsMissing, 1);
    assert.equal(report.warnings[0].exerciseKey, 'public-1');
    const article = await readFile(path.join(root, 'content/posts/frontend/interview-experiences/experience-95/round-159/index.md'), 'utf8');
    assert.match(article, /暂无参考答案/);
    assert.match(article, /https:\/\/fe\.ecool\.fun\/topic\/public-1/);
  });
});

test('supplies reviewed fallback answers for the three source questions without answers', () => {
  const round = {
    id: 1,
    roundOrder: 1,
    title: '技术面试',
    questions: [
      { type: 'subjective', title: '请解释一下链表数据结构', question: '', explanation: '', pivot: '' },
      { type: 'subjective', title: '算法题：', question: '求数组深度；实现 Promise.half', explanation: '', pivot: '' },
      { type: 'subjective', title: '实现跟随鼠标移动和滚动的视觉差效果', question: '', explanation: '', pivot: '' },
    ],
  };
  const detail = {
    experience: { id: 1, title: '示例面经', sourceUrl: 'https://fe.ecool.fun/experience/1' },
    rounds: [round],
  };
  const article = renderRoundArticle(detail, round, 0);
  assert.doesNotMatch(article, /暂无参考答案/);
  assert.match(article, /按下标查找是 O\(n\)/);
  assert.match(article, /Promise\.half.*不是标准 API/s);
  assert.match(article, /requestAnimationFrame.*translate3d/s);
});

test('neutralizes active HTML attributes and executable URL schemes outside code fences', () => {
  const round = {
    id: 1,
    roundOrder: 1,
    title: '技术面试',
    questions: [{
      type: 'subjective',
      title: 'HTML 安全',
      question: '<img src=x onerror="alert(1)">',
      pivot: '<a href="javascript:alert(1)" onclick="alert(2)">检查链接</a>\n<a href="jav&#x61;script&colon;alert(3)">实体编码链接</a>',
      explanation: '<svg onload="alert(3)"></svg>\n<a\n href="javascript:alert(4)">多行链接</a>\n\n```html\n<img onerror="代码示例">\n```',
    }],
  };
  const detail = {
    experience: { id: 1, title: '示例面经', sourceUrl: 'https://fe.ecool.fun/experience/1' },
    rounds: [round],
  };
  const article = renderRoundArticle(detail, round, 0);
  assert.match(article, /<img src=x>/);
  assert.match(article, /href="#"/);
  assert.equal(article.match(/href="#"/g)?.length, 2);
  assert.doesNotMatch(article, /jav&#x61;script/);
  assert.doesNotMatch(article, /onclick=/);
  assert.match(article, /&lt;svg onload="alert\(3\)"&gt;/);
  assert.match(article, /&lt;a\n href="javascript:alert\(4\)"/);
  assert.match(article, /```html\n<img onerror="代码示例">\n```/);
});
