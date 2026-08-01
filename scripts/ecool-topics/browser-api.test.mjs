import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserApi } from './browser-api.mjs';

function fakeTab(responses, observed) {
  return {
    async url() { return 'https://fe.ecool.fun/topic-list'; },
    capabilities: { async get(name) {
      assert.equal(name, 'cdp');
      return { async send(method, params) {
        assert.equal(method, 'Runtime.evaluate');
        assert.equal(params.awaitPromise, true); assert.equal(params.returnByValue, true);
        observed.push(params.expression);
        return { result: { value: { ok: true, status: 200, payload: responses.shift() } } };
      } };
    } },
  };
}

test('uses real endpoints through CDP and normalizes production payloads', async () => {
  const observed = [];
  const tab = fakeTab([
    { data: { list: [
      { tagId: 7, tagName: 'CSS', exerciseCount: 2 },
      { tagId: 8, tagName: '空标签', exerciseCount: 0 },
    ] } },
    { data: { records: [{ exerciseKey: 'k/1', title: '盒模型', difficulty: 'Easy', category: 'Choice' }] } },
    { data: { exerciseKey: 'k/1', title: '盒模型', pivot: '要点', explanation: '答案', renderType: 'md', options: '{"options":[]}' } },
  ], observed);
  const api = createBrowserApi(tab);
  const tags = await api.listTags();
  assert.deepEqual(tags, [{ id: 7, name: 'CSS', slug: 'css', exerciseCount: 2 }]);
  const list = await api.listExercises(tags[0]);
  assert.equal(list[0].exerciseKey, 'k/1'); assert.equal(list[0].type, 'Choice');
  const detail = await api.getExerciseDetail('k/1');
  assert.equal(detail.explanation, '答案'); assert.equal(detail.renderType, 'md');
  assert.match(observed[0], /\/api\/tag\/list\?vid=9&exerciseCate=0/);
  assert.match(observed[1], /pageSize=1000[\s\S]*&tagId=7/);
  assert.match(observed[2], /practice\/detail[\s\S]*&exerciseKey=k%2F1/);
  assert.ok(observed.every((expression) => expression.includes("credentials: 'include'")));
});

test('rejects tabs outside the ECool origin before requesting CDP', async () => {
  const tab = { async url() { return 'https://example.com/'; } };
  await assert.rejects(createBrowserApi(tab).listTags(), (error) => error.code === 'SOURCE_PAGE_MISMATCH');
});
