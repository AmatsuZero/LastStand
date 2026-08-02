import {
  normalizeCompany,
  normalizeExperience,
  normalizeExperienceDetail,
  SOURCE_LIST_URL,
} from './model.mjs';

const DEFAULT_ENDPOINTS = Object.freeze({
  companies: '/api/interviewExperience/companyList?platform=pc&os=pc&vid=9',
  list: '/api/interviewExperience/experienceList',
  detail: '/api/interviewExperience/experienceDetail?platform=pc&os=pc&vid=9',
  exerciseDetail: '/api/exercise/practice/detail?vid=9&orderBy=default&order=desc&exerciseCate=0&ignoreMaster=1',
});

function unwrap(value) {
  let current = value;
  for (let depth = 0; depth < 4 && current != null; depth += 1) {
    if (current?.code != null && Number(current.code) !== 0) {
      throw Object.assign(new Error(`ECool API 返回错误：${current.message ?? current.code}`), {
        code: 'API_RESPONSE_ERROR',
        apiCode: current.code,
      });
    }
    const next = current?.data ?? current?.result;
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
  async function sameOriginFetch(requestPath, init = {}) {
    const actual = new URL(await tab.url());
    if (actual.origin !== new URL(SOURCE_LIST_URL).origin) {
      throw Object.assign(new Error(`ECool 页面来源不匹配: ${actual.href}`), { code: 'SOURCE_PAGE_MISMATCH' });
    }
    const cdp = await tab.capabilities.get('cdp');
    const expression = `(async () => {
      const response = await fetch(${JSON.stringify(requestPath)}, {
        credentials: 'include',
        ...${JSON.stringify(init)}
      });
      const text = await response.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = text; }
      return { ok: response.ok, status: response.status, payload };
    })()`;
    const evaluated = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (evaluated?.exceptionDetails) {
      throw Object.assign(new Error(`ECool API 执行失败: ${requestPath}`), { code: 'API_RUNTIME_ERROR' });
    }
    const response = evaluated?.result?.value;
    if (!response) throw Object.assign(new Error(`ECool API 未返回结果: ${requestPath}`), { code: 'API_RESULT_MISSING' });
    if (!response.ok) {
      throw Object.assign(new Error(`ECool API ${requestPath} 返回 HTTP ${response.status}`), {
        code: 'API_HTTP_ERROR',
        status: response.status,
      });
    }
    return response.payload;
  }

  return {
    async listCompanies() {
      return arrayFrom(await sameOriginFetch(endpoints.companies), ['companyList', 'companies', 'list', 'records'])
        .map(normalizeCompany).filter(Boolean);
    },

    async listExperiences() {
      const payload = await sameOriginFetch(endpoints.list, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1, pageSize: 100, platform: 'pc', os: 'pc', vid: 9 }),
      });
      return arrayFrom(payload, ['experienceList', 'experiences', 'list', 'records', 'items'])
        .map((value) => normalizeExperience(value));
    },

    async getExperienceDetail(id, companies = new Map()) {
      const separator = endpoints.detail.includes('?') ? '&' : '?';
      const payload = await sameOriginFetch(`${endpoints.detail}${separator}id=${encodeURIComponent(id)}`);
      return normalizeExperienceDetail(unwrap(payload), companies);
    },

    async getExerciseDetail(key) {
      const separator = endpoints.exerciseDetail.includes('?') ? '&' : '?';
      return unwrap(await sameOriginFetch(`${endpoints.exerciseDetail}${separator}exerciseKey=${encodeURIComponent(key)}`));
    },
  };
}

export { DEFAULT_ENDPOINTS };
