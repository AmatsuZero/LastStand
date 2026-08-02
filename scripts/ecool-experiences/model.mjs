import { createHash } from 'node:crypto';

export const SOURCE_LIST_URL = 'https://fe.ecool.fun/experience-list';
export const sourceExperienceUrl = (id) => `https://fe.ecool.fun/experience/${encodeURIComponent(id)}`;
export const sourceTopicUrl = (key) => `https://fe.ecool.fun/topic/${encodeURIComponent(key)}`;

function requiredId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error(`${label} 缺少有效 id`), { code: `${label.toUpperCase()}_ID_MISSING` });
  }
  return id;
}

export function parseQuestionList(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  try {
    const parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return parsed;
  } catch (cause) {
    throw Object.assign(new Error('面试轮次的 exerciseKeyList 不是有效数组'), {
      code: 'QUESTION_LIST_INVALID',
      cause,
    });
  }
}

export function normalizeCompany(value) {
  const id = Number(value?.companyId ?? value?.id);
  const name = String(value?.companyName ?? value?.name ?? value?.title ?? '').trim();
  if (!Number.isInteger(id) || !name) return null;
  return { ...value, id, name };
}

export function recruitTypeName(value) {
  const names = new Map([[1, '校招'], [2, '社招']]);
  return names.get(Number(value)) ?? (value == null || value === '' ? '未注明' : String(value));
}

export function inferCompanyName(title) {
  const parts = String(title ?? '').split(/[-—]/).map((part) => part.trim()).filter(Boolean);
  const candidate = parts.length > 1 ? parts[0] : '';
  return candidate && [...candidate].length <= 12 ? candidate : '';
}

export function normalizeExperience(value, { company } = {}) {
  const id = requiredId(value?.id ?? value?.experienceId, 'experience');
  return {
    ...value,
    id,
    title: String(value?.title ?? `面经 ${id}`).trim(),
    companyId: Number(value?.companyId ?? company?.id ?? 0) || null,
    companyName: String(value?.companyName || company?.name || inferCompanyName(value?.title) || '').trim(),
    recruitTypeName: recruitTypeName(value?.recruitType),
    sourceUrl: sourceExperienceUrl(id),
  };
}

export function normalizeQuestion(value, index = 0) {
  const exerciseKey = String(value?.exerciseKey ?? '').trim();
  const type = String(value?.type ?? (exerciseKey ? 'public' : 'subjective')).trim() || 'subjective';
  const title = String(value?.selectedTitle || value?.title || value?.question || '').trim();
  return {
    ...value,
    type,
    exerciseKey,
    title: title || `问题 ${index + 1}`,
    selectedTitle: String(value?.selectedTitle ?? '').trim(),
    question: String(value?.question ?? '').trim(),
    explanation: String(value?.explanation ?? '').trim(),
    pivot: String(value?.pivot ?? '').trim(),
  };
}

export function normalizeRound(value) {
  const id = requiredId(value?.id ?? value?.roundId, 'round');
  const roundOrder = Number(value?.roundOrder);
  if (!Number.isInteger(roundOrder) || roundOrder <= 0) {
    throw Object.assign(new Error(`轮次 ${id} 缺少有效 roundOrder`), { code: 'ROUND_ORDER_MISSING' });
  }
  const rawKeyPoints = value?.keyPoints || value?.tagPointList || '';
  let keyPoints = rawKeyPoints;
  if (typeof rawKeyPoints === 'string' && /^[\[{]/.test(rawKeyPoints.trim())) {
    try { keyPoints = JSON.parse(rawKeyPoints); } catch { /* Preserve non-JSON text verbatim. */ }
  }
  if (Array.isArray(keyPoints)) {
    keyPoints = keyPoints.map((point) => point?.name ?? point?.label ?? point?.title ?? point).filter(Boolean).join('、');
  } else if (keyPoints && typeof keyPoints === 'object') {
    keyPoints = Object.values(keyPoints).filter((point) => ['string', 'number'].includes(typeof point)).join('、');
  }
  return {
    ...value,
    id,
    roundOrder,
    title: String(value?.title ?? '面试').trim() || '面试',
    description: String(value?.description ?? '').trim(),
    keyPoints: String(keyPoints ?? '').trim(),
    questions: parseQuestionList(value?.questions ?? value?.exerciseKeyList).map(normalizeQuestion),
  };
}

export function normalizeExperienceDetail(value, companies = new Map()) {
  const experienceValue = value?.experience ?? value;
  const companyId = Number(experienceValue?.companyId ?? 0) || null;
  const company = companies.get(companyId);
  const experience = normalizeExperience(experienceValue, { company });
  const rounds = (value?.roundList ?? value?.rounds ?? []).map(normalizeRound)
    .sort((a, b) => a.roundOrder - b.roundOrder || a.id - b.id);
  return { experience, rounds };
}

export function experienceSlug(id) {
  return `experience-${requiredId(id, 'experience')}`;
}

export function roundSlug(id) {
  return `round-${requiredId(id, 'round')}`;
}

export function questionAnchor(question, index) {
  if (question.exerciseKey) return `question-${question.exerciseKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const seed = `${question.title}\0${index}`;
  return `question-subjective-${createHash('sha256').update(seed).digest('hex').slice(0, 12)}`;
}
