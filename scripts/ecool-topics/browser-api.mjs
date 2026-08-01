import { exerciseKey, normalizeExercise, normalizeTag, SOURCE_URL } from './model.mjs';

const DEFAULT_ENDPOINTS = Object.freeze({
  tags: '/api/tag/list?vid=9&exerciseCate=0',
  list: '/api/exercise/list?vid=9&exerciseCate=0&pageNum=1&pageSize=1000&ignoreMaster=1&difficulty=&orderBy=default&order=desc',
  detail: '/api/exercise/practice/detail?vid=9&orderBy=default&order=desc&exerciseCate=0&ignoreMaster=1',
});

function unwrap(value) {
  let current = value;
  for (let depth = 0; depth < 4 && current && !Array.isArray(current); depth += 1) {
    const next = current.data ?? current.result;
    if (next === undefined) break;
    current = next;
  }
  return current;
}
function arrayFrom(payload, keys) {
  const value = unwrap(payload);
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
}

export function createBrowserApi(tab, { endpoints = DEFAULT_ENDPOINTS } = {}) {
  async function sameOriginFetch(path, init = {}) {
    const actual = new URL(await tab.url());
    if (actual.origin !== new URL(SOURCE_URL).origin) {
      throw Object.assign(new Error(`ECool 页面来源不匹配: ${actual.href}`), { code: 'SOURCE_PAGE_MISMATCH' });
    }
    const cdp = await tab.capabilities.get('cdp');
    const expression = `(async () => {
      const result = await fetch(${JSON.stringify(path)}, { credentials: 'include', ...${JSON.stringify(init)} });
      const text = await result.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = text; }
      return { ok: result.ok, status: result.status, payload };
    })()`;
    const evaluated = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (evaluated?.exceptionDetails) throw Object.assign(new Error(`ECool API 执行失败: ${path}`), { code: 'API_RUNTIME_ERROR' });
    const response = evaluated?.result?.value;
    if (!response) throw Object.assign(new Error(`ECool API 未返回结果: ${path}`), { code: 'API_RESULT_MISSING' });
    if (!response.ok) throw Object.assign(new Error(`ECool API ${path} 返回 HTTP ${response.status}`), { code: 'API_HTTP_ERROR', status: response.status });
    return response.payload;
  }
  return {
    async listTags() {
      return arrayFrom(await sameOriginFetch(endpoints.tags), ['tags', 'list', 'records'])
        .map(normalizeTag).filter(Boolean);
    },
    async listExercises(tag) {
      const separator = endpoints.list.includes('?') ? '&' : '?';
      const payload = await sameOriginFetch(`${endpoints.list}${separator}tagId=${encodeURIComponent(tag.id)}`);
      return arrayFrom(payload, ['exercises', 'list', 'records', 'items']).map(normalizeExercise);
    },
    async getExerciseDetail(key) {
      const separator = endpoints.detail.includes('?') ? '&' : '?';
      const detail = unwrap(await sameOriginFetch(`${endpoints.detail}${separator}exerciseKey=${encodeURIComponent(key)}`));
      const normalized = normalizeExercise(detail);
      if (exerciseKey(normalized) !== String(key)) throw Object.assign(new Error(`详情 exerciseKey 不匹配: ${key}`), { code: 'DETAIL_KEY_MISMATCH' });
      return normalized;
    },
  };
}
