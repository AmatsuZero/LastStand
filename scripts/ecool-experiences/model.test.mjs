import assert from 'node:assert/strict';
import test from 'node:test';
import { inferCompanyName, normalizeRound, parseQuestionList, questionAnchor } from './model.mjs';

test('parses production round payloads and prefers selectedTitle for public questions', () => {
  const round = normalizeRound({
    id: 159,
    roundOrder: 1,
    title: '技术面试',
    keyPoints: '',
    tagPointList: '[{"name":"Vue"},{"name":"Webpack"}]',
    exerciseKeyList: JSON.stringify([{ type: 'public', title: '旧标题', selectedTitle: '本轮追问', exerciseKey: 'a/b' }]),
  });
  assert.equal(round.keyPoints, 'Vue、Webpack');
  assert.equal(round.questions[0].title, '本轮追问');
  assert.equal(questionAnchor(round.questions[0], 0), 'question-a-b');
});

test('fails closed on malformed question JSON', () => {
  assert.throws(() => parseQuestionList('{bad json'), (error) => error.code === 'QUESTION_LIST_INVALID');
});

test('infers an unlisted company from the experience title without guessing free text', () => {
  assert.equal(inferCompanyName('小红书-社招-5年'), '小红书');
  assert.equal(inferCompanyName('没有分隔符的面经'), '');
});
