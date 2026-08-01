import { createHash } from 'node:crypto';

export const SOURCE_URL = 'https://fe.ecool.fun/topic-list';

export function slugifyTag(name, fallback = 'tag') {
  const aliases = new Map([
    ['HTML', 'html'], ['CSS', 'css'], ['JavaScript', 'javascript'], ['TypeScript', 'typescript'],
    ['React.js', 'react'], ['Vue.js', 'vue'], ['Node.js', 'nodejs'], ['AI', 'ai'],
  ]);
  if (aliases.has(String(name).trim())) return aliases.get(String(name).trim());
  const slug = String(name).normalize('NFKD').toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g, '');
  if (slug && !/\p{Script=Han}/u.test(slug)) return slug;
  return `${fallback}-${createHash('sha256').update(String(name)).digest('hex').slice(0, 8)}`;
}

export function exerciseKey(value) {
  return String(value?.exerciseKey ?? value?.key ?? value?.id ?? '').trim();
}

export function normalizeTag(value, index = 0) {
  const name = String(value?.tagName ?? value?.name ?? value?.label ?? value?.title ?? '').trim();
  if (!name) return null;
  const exerciseCount = Number(value?.exerciseCount ?? value?.count ?? NaN);
  if (Number.isFinite(exerciseCount) && exerciseCount <= 0) return null;
  return { name, slug: slugifyTag(name, `tag-${index + 1}`), id: value?.tagId ?? value?.id ?? value?.key ?? name, ...(Number.isFinite(exerciseCount) ? { exerciseCount } : {}) };
}

export function normalizeExercise(value) {
  const key = exerciseKey(value);
  if (!key) throw Object.assign(new Error('题目缺少 exerciseKey'), { code: 'EXERCISE_KEY_MISSING' });
  return {
    ...value,
    exerciseKey: key,
    title: String(value?.title ?? value?.name ?? value?.question ?? key).trim(),
    difficulty: String(value?.difficulty ?? value?.level ?? '').trim(),
    type: String(value?.type ?? value?.questionType ?? value?.category ?? '').trim(),
  };
}
