import { normalizeMarkdown } from '../ecool/markdown.mjs';
import { SOURCE_URL } from './model.mjs';

function toml(value) { return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"'); }
function escapeDangerousRawHtml(markdown) {
  let fence = null;
  return String(markdown).split(/\r?\n/).map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && /^\s*$/.test(marker[2])) fence = null;
      return line;
    }
    if (marker && (marker[1][0] === '~' || !marker[2].includes('`'))) {
      fence = { char: marker[1][0], length: marker[1].length };
      return line;
    }
    return line.replace(/<\s*\/?\s*(?:script|style|iframe|object|embed|form)\b[^>]*>/gi, (tag) => tag.replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
  }).join('\n');
}
function body(value) {
  const markdown = Array.isArray(value) ? value.filter(Boolean).map(String).join('\n\n') : String(value ?? '');
  return normalizeMarkdown(escapeDangerousRawHtml(markdown)).trim();
}
function metadata(item) {
  const parts = [];
  if (item.difficulty) parts.push(`难度：${item.difficulty}`);
  if (item.type) parts.push(`类型：${item.type}`);
  return parts.length ? `> ${parts.join(' · ')}\n\n` : '';
}
function choiceData(item) {
  if (!item.options) return null;
  try {
    const parsed = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
    return Array.isArray(parsed) ? { options: parsed, answer: [] } : parsed;
  } catch { return null; }
}
function renderChoices(item) {
  const choice = choiceData(item);
  if (!Array.isArray(choice?.options)) return { prompt: '', answer: '' };
  const labels = choice.options.map((option, index) => `- ${String.fromCharCode(65 + index)}. ${body(option?.label ?? option?.content ?? option)}`);
  const answers = (choice.answer ?? []).map((answer) => Number.isInteger(answer) ? String.fromCharCode(65 + answer) : String(answer));
  return { prompt: labels.join('\n'), answer: answers.length ? `**正确答案：${answers.join('、')}**` : '' };
}
function derivedPoint(explanation, title) {
  let fence = null;
  const blocks = [];
  let current = [];
  const flush = () => {
    if (current.length) blocks.push(current.join(' ').replace(/\s+/g, ' ').trim());
    current = [];
  };
  for (const line of String(explanation ?? '').split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && /^\s*$/.test(marker[2])) fence = null;
      continue;
    }
    if (marker && (marker[1][0] === '~' || !marker[2].includes('`'))) {
      flush(); fence = { char: marker[1][0], length: marker[1].length }; continue;
    }
    const text = line.trim();
    if (!text) { flush(); continue; }
    if (/^#{1,6}\s/.test(text) || /^\|.*\|$/.test(text) || /^:?-{3,}:?(?:\s*\|\s*:?-{3,}:?)+$/.test(text)) continue;
    if (/^(?:[-*+] |\d+[.)] )/.test(text)) { flush(); blocks.push(text.replace(/^(?:[-*+] |\d+[.)] )/, '').trim()); continue; }
    current.push(text.replace(/^>\s?/, ''));
  }
  flush();
  const meaningful = blocks.find((block) => block && !/^<\/?(?:details|summary)>$/i.test(block));
  if (!meaningful) return `核心考查：${title}的基本概念、实现原理与实际应用。`;
  return [...meaningful].slice(0, 240).join('') + ([...meaningful].length > 240 ? '…' : '');
}

export function renderTagArticle(tag, exercises, { generatedAt = new Date().toISOString() } = {}) {
  const questions = exercises.map((item, index) => {
    const pivot = body(item.pivot ?? item.points ?? item.keyPoints);
    const explanation = body(item.explanation ?? item.answer ?? item.analysis);
    const desc = body(item.desc);
    const choices = renderChoices(item);
    const point = pivot || derivedPoint(item.explanation ?? item.answer ?? item.analysis, item.title);
    const blocks = [
      `## ${index + 1}. ${item.title} {#question-${item.exerciseKey.replace(/[^a-zA-Z0-9_-]/g, '-') || index + 1}}`,
      metadata(item).trim(), desc, choices.prompt,
      `### 题目要点\n\n${body(point)}`,
      ['<details>', '<summary>参考答案</summary>', '', choices.answer, explanation || '暂无参考答案。', '', '</details>']
        .filter((line, lineIndex, all) => line !== '' || all[lineIndex - 1] !== '').join('\n'),
    ];
    return blocks.filter(Boolean).join('\n\n');
  }).join('\n\n');
  return [
    '+++', `title = "${toml(tag.name)} 面试题"`, 'draft = false',
    `tags = ["面试", "前端", "${toml(tag.name)}", "ecool"]`,
    'categories = ["前端开发", "面试"]', `source = "${SOURCE_URL}"`,
    `generatedAt = "${toml(generatedAt)}"`, '+++', '',
    `共 ${exercises.length} 道 ${tag.name} 面试题。答案默认折叠，便于先自行作答。`, '', questions, '',
  ].join('\n');
}
