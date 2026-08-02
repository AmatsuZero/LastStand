import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserApi } from './browser-api.mjs';

function fakeTab(responses, observed) {
  return {
    async url() { return 'https://fe.ecool.fun/experience/95'; },
    capabilities: { async get(name) {
      assert.equal(name, 'cdp');
      return { async send(method, params) {
        assert.equal(method, 'Runtime.evaluate');
        assert.equal(params.awaitPromise, true);
        assert.equal(params.returnByValue, true);
        observed.push(params.expression);
        return { result: { value: { ok: true, status: 200, payload: responses.shift() } } };
      } };
    } },
  };
}

test('uses the production experience endpoints and preserves duplicate round titles', async () => {
  const observed = [];
  const tab = fakeTab([
    { code: 0, data: [{ id: 14, name: '小红书' }] },
    { code: 0, data: { list: [{ id: 95, title: '小红书-社招-5年', companyId: 14, recruitType: 2 }] } },
    { code: 0, data: {
      experience: { id: 95, title: '小红书-社招-5年', companyId: 14, recruitType: 2 },
      roundList: [
        { id: 160, roundOrder: 2, title: '技术面试', exerciseKeyList: '[]' },
        { id: 159, roundOrder: 1, title: '技术面试', exerciseKeyList: '[{"type":"public","exerciseKey":"k1","selectedTitle":"题目"}]' },
      ],
    } },
    { code: 0, data: { exerciseKey: 'k1', title: '题库标题', explanation: '答案' } },
  ], observed);
  const api = createBrowserApi(tab);
  const companies = await api.listCompanies();
  assert.deepEqual(companies.map(({ id, name }) => ({ id, name })), [{ id: 14, name: '小红书' }]);
  assert.equal((await api.listExperiences())[0].recruitTypeName, '社招');
  const detail = await api.getExperienceDetail(95, new Map(companies.map((company) => [company.id, company])));
  assert.deepEqual(detail.rounds.map(({ id, roundOrder, title }) => ({ id, roundOrder, title })), [
    { id: 159, roundOrder: 1, title: '技术面试' },
    { id: 160, roundOrder: 2, title: '技术面试' },
  ]);
  assert.equal(detail.rounds[0].questions[0].title, '题目');
  assert.equal((await api.getExerciseDetail('k1')).explanation, '答案');
  assert.match(observed[0], /companyList/);
  assert.match(observed[1], /experienceList/);
  assert.match(observed[1], /"method":"POST"/);
  assert.match(observed[1], /pageSize\\":100/);
  assert.match(observed[2], /experienceDetail[\s\S]*id=95/);
  assert.match(observed[3], /practice\/detail[\s\S]*exerciseKey=k1/);
  assert.ok(observed.every((expression) => expression.includes("credentials: 'include'")));
});

test('rejects a tab outside the ECool origin', async () => {
  const tab = { async url() { return 'https://example.com/'; } };
  await assert.rejects(createBrowserApi(tab).listExperiences(), (error) => error.code === 'SOURCE_PAGE_MISMATCH');
});
