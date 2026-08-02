import { normalizeMarkdown } from '../ecool/markdown.mjs';
import {
  experienceSlug,
  questionAnchor,
  roundSlug,
  SOURCE_LIST_URL,
  sourceTopicUrl,
} from './model.mjs';

const BASE_CONTENT_PATH = '/posts/frontend/interview-experiences';

const CURATED_FALLBACKS = new Map([
  ['请解释一下链表数据结构', {
    point: '节点结构（值与指针）、头尾节点、顺序访问复杂度，以及单链表、双向链表和循环链表的取舍。',
    answer: `链表由一组不必连续存储的节点组成。每个节点保存数据和指向下一个节点的指针；双向链表还会保存前驱指针。链表通常从头节点开始遍历，因此按下标查找是 O(n)，但在已知插入位置或前驱节点时，插入、删除只需修改指针，可做到 O(1)。

与数组相比，链表不要求连续内存，扩容和局部增删更灵活，但随机访问较慢，也会付出额外指针空间。常见变体包括单链表、双向链表和循环链表，可用于队列、LRU 缓存、邻接表等场景。`,
  }],
  ['算法题：', {
    point: '递归与显式栈计算嵌套数组深度；明确空数组的深度定义；为 Promise 扩展定义任务工厂、并发上限、失败重试和最终错误传播。',
    answer: `数组深度可以递归计算，也可以用显式栈迭代。下面约定非数组深度为 0、空数组深度为 1：

\`\`\`js
function arrayDepth(value) {
  if (!Array.isArray(value)) return 0;
  return value.length === 0
    ? 1
    : 1 + Math.max(...value.map(arrayDepth));
}

function arrayDepthIterative(value) {
  if (!Array.isArray(value)) return 0;
  let max = 1;
  const stack = [{ value, depth: 1 }];
  while (stack.length) {
    const current = stack.pop();
    max = Math.max(max, current.depth);
    for (const item of current.value) {
      if (Array.isArray(item)) stack.push({ value: item, depth: current.depth + 1 });
    }
  }
  return max;
}
\`\`\`

\`Promise.half\` 不是标准 API，编码前应先与面试官确认它表示“半数并发”还是其他语义。若要求限制并发并支持失败重试，入参应使用可重新执行的任务工厂，而不是已经开始的 Promise；实现时维护待执行队列和运行计数，单任务失败后在重试次数内重新入队，超过次数则拒绝最终 Promise，并按约定决定是否继续其他任务。`,
  }],
  ['实现跟随鼠标移动和滚动的视觉差效果', {
    point: '把鼠标位置和滚动量归一化，在 requestAnimationFrame 中统一更新 transform；避免高频事件直接改布局，并兼顾 passive 监听和减少动态效果偏好。',
    answer: `核心做法是只在事件中记录状态，再由 \`requestAnimationFrame\` 每帧最多更新一次合成属性：

\`\`\`js
const layer = document.querySelector('.parallax-layer');
let mouseX = 0;
let mouseY = 0;
let scrollY = window.scrollY;
let scheduled = false;

function render() {
  scheduled = false;
  const x = (mouseX / innerWidth - 0.5) * 24;
  const y = (mouseY / innerHeight - 0.5) * 16 + scrollY * 0.08;
  layer.style.transform = \`translate3d(\${x}px, \${y}px, 0)\`;
}

function schedule() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(render);
  }
}

addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  schedule();
});
addEventListener('scroll', () => {
  scrollY = window.scrollY;
  schedule();
}, { passive: true });
\`\`\`

样式侧应优先使用 \`transform\`，并可设置 \`will-change: transform\`。同时用 \`prefers-reduced-motion\` 为不希望看到动态效果的用户关闭或减弱视差。`,
  }],
]);

function toml(value) {
  return String(value ?? '').replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function tomlArray(values) {
  return `[${values.map((value) => `"${toml(value)}"`).join(', ')}]`;
}

function decodeUrlEntities(value) {
  return String(value)
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/gi, (entity, hex, decimal) => {
      const codePoint = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      try { return String.fromCodePoint(codePoint); } catch { return entity; }
    })
    .replace(/&(colon|tab|newline|amp);/gi, (entity, name) => ({
      colon: ':',
      tab: '\t',
      newline: '\n',
      amp: '&',
    })[name.toLowerCase()] ?? entity);
}

function escapeDangerousRawHtml(markdown) {
  let fence = null;
  return String(markdown ?? '').split(/\r?\n/).map((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && /^\s*$/.test(marker[2])) fence = null;
      return line;
    }
    if (marker && (marker[1][0] === '~' || !marker[2].includes('`'))) {
      fence = { char: marker[1][0], length: marker[1].length };
      return line;
    }
    const singleLineTags = line.replace(/<\s*\/?\s*[a-z][^>]*$/i, (tag) => tag.replace('<', '&lt;'));
    return singleLineTags.replace(/<[^>]*>/g, (tag) => {
      if (/<\s*\/?\s*(?:script|style|iframe|object|embed|form|meta|link|base|svg|math)\b/i.test(tag)) {
        return tag.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      }
      const withoutActiveAttributes = tag.replace(
        /\s+(?:on[a-z0-9_-]+|style|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
        '',
      );
      return withoutActiveAttributes.replace(
        /(\s+(?:href|src|xlink:href|action|formaction)\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)/gi,
        (attribute, prefix, rawValue) => {
          const value = decodeUrlEntities(rawValue.replace(/^["']|["']$/g, ''))
            .replace(/[\u0000-\u0020]/g, '')
            .toLowerCase();
          return /^(?:javascript|vbscript|data):/.test(value) ? `${prefix}"#"` : attribute;
        },
      );
    });
  }).join('\n');
}

function body(value) {
  const markdown = Array.isArray(value) ? value.filter(Boolean).map(String).join('\n\n') : String(value ?? '');
  return normalizeMarkdown(escapeDangerousRawHtml(markdown)).trim();
}

function inline(value) {
  return body(value).replace(/\s*\n\s*/g, ' ').trim();
}

function relref(path, label) {
  const safeLabel = inline(label).replaceAll('[', '\\[').replaceAll(']', '\\]');
  return `[${safeLabel}]({{< relref "${path}" >}})`;
}

function experiencePath(experience) {
  return `${BASE_CONTENT_PATH}/${experienceSlug(experience.id)}/_index.md`;
}

function roundPath(experience, round) {
  return `${BASE_CONTENT_PATH}/${experienceSlug(experience.id)}/${roundSlug(round.id)}/index.md`;
}

function derivedPoint(explanation, title) {
  let fence = null;
  const candidates = [];
  for (const line of String(explanation ?? '').split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && /^\s*$/.test(marker[2])) fence = null;
      continue;
    }
    if (marker && (marker[1][0] === '~' || !marker[2].includes('`'))) { fence = marker; continue; }
    const candidate = line.trim()
      .replace(/^#{1,6}\s+/, '')
      .replace(/^>\s?/, '')
      .replace(/^(?:[-*+] |\d+[.)]\s+)/, '')
      .trim();
    if (candidate && !/^\|.*\|$/.test(candidate) && !/^<\/?(?:details|summary)>$/i.test(candidate)) candidates.push(candidate);
  }
  const meaningful = candidates.find((candidate) => candidate.length >= 8);
  if (!meaningful) return `核心考查：${title}的概念、原理与实际应用。`;
  const chars = [...meaningful];
  return `${chars.slice(0, 240).join('')}${chars.length > 240 ? '…' : ''}`;
}

function choiceData(item) {
  if (!item?.options) return null;
  try {
    const parsed = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
    return Array.isArray(parsed) ? { options: parsed, answer: [] } : parsed;
  } catch { return null; }
}

function renderChoices(item) {
  const choice = choiceData(item);
  if (!Array.isArray(choice?.options)) return { prompt: '', answer: '' };
  const prompt = choice.options.map((option, index) => {
    const label = body(option?.label ?? option?.content ?? option);
    return `- ${String.fromCharCode(65 + index)}. ${label}`;
  }).join('\n');
  const answers = (choice.answer ?? []).map((answer) => Number.isInteger(answer) ? String.fromCharCode(65 + answer) : String(answer));
  return { prompt, answer: answers.length ? `**正确答案：${answers.join('、')}**` : '' };
}

function renderQuestion(question, index) {
  const detail = question.detail ?? {};
  const rawTitle = question.selectedTitle || question.title || detail.title || `问题 ${index + 1}`;
  const title = inline(rawTitle);
  const curated = CURATED_FALLBACKS.get(rawTitle);
  const explanation = body(question.explanation || detail.explanation || detail.answer || detail.analysis || curated?.answer);
  const pivot = body(question.pivot || detail.pivot || detail.points || detail.keyPoints)
    || body(curated?.point)
    || body(derivedPoint(question.explanation || detail.explanation || detail.answer || detail.analysis, rawTitle));
  const prompt = body(question.question || detail.desc);
  const choices = renderChoices({ ...detail, ...question, options: question.options || detail.options });
  const source = question.exerciseKey
    ? `> 题库原题：[${inline(detail.title || rawTitle).replaceAll('[', '\\[').replaceAll(']', '\\]')}](${sourceTopicUrl(question.exerciseKey)})`
    : '';
  return [
    `## ${index + 1}. ${title} {#${questionAnchor(question, index)}}`,
    source,
    prompt,
    choices.prompt,
    `### 题目要点\n\n${pivot}`,
    [
      '<details>',
      '<summary>参考答案</summary>',
      '',
      choices.answer,
      explanation || '暂无参考答案，请结合题目要点自行梳理。',
      '',
      '</details>',
    ].filter((line, lineIndex, all) => line !== '' || all[lineIndex - 1] !== '').join('\n'),
  ].filter(Boolean).join('\n\n');
}

function navigation(experience, rounds, index) {
  const previous = rounds[index - 1];
  const next = rounds[index + 1];
  return [
    previous ? `← ${relref(roundPath(experience, previous), `第 ${previous.roundOrder} 轮`)}` : '← 已是第一轮',
    relref(experiencePath(experience), '返回本次面经'),
    next ? `${relref(roundPath(experience, next), `第 ${next.roundOrder} 轮`)} →` : '已是最后一轮 →',
  ].join(' · ');
}

export function renderRootIndex(details) {
  const items = details.map(({ experience, rounds }, index) => {
    const meta = [experience.companyName, experience.recruitTypeName, `${rounds.length} 轮`].filter(Boolean).join(' · ');
    return `${index + 1}. ${relref(experiencePath(experience), experience.title)}${meta ? ` — ${meta}` : ''}`;
  }).join('\n');
  return [
    '+++',
    'title = "大厂面经"',
    'draft = false',
    'weight = -79',
    'tags = ["面试", "前端", "大厂面经", "ecool"]',
    'categories = ["前端开发", "面试"]',
    `source = "${SOURCE_LIST_URL}"`,
    '+++',
    '',
    `共整理 ${details.length} 份大厂前端面经。每份面经按真实面试轮次拆分为独立文章，并提供上一轮、下一轮和父级面经导航。`,
    '',
    '## 面经目录',
    '',
    items,
    '',
  ].join('\n');
}

export function renderExperienceIndex({ experience, rounds }, { weight = 0 } = {}) {
  const roundItems = rounds.map((round) => {
    const suffix = round.questions.length ? `（${round.questions.length} 道题）` : '';
    return `- ${relref(roundPath(experience, round), `第 ${round.roundOrder} 轮 · ${round.title}`)}${suffix}`;
  }).join('\n');
  const tags = ['面试', '前端', '大厂面经', experience.companyName, experience.recruitTypeName, 'ecool'].filter(Boolean);
  return [
    '+++',
    `title = "${toml(experience.title)}"`,
    'draft = false',
    'hiddenInHomeList = true',
    `weight = ${weight}`,
    `tags = ${tomlArray(tags)}`,
    'categories = ["前端开发", "面试", "大厂面经"]',
    `source = "${toml(experience.sourceUrl)}"`,
    `experienceId = ${experience.id}`,
    experience.companyName ? `company = "${toml(experience.companyName)}"` : '',
    `recruitType = "${toml(experience.recruitTypeName)}"`,
    experience.createAt ? `date = "${toml(experience.createAt)}"` : '',
    experience.updateAt ? `lastmod = "${toml(experience.updateAt)}"` : '',
    '+++',
    '',
    `本次面经共 ${rounds.length} 轮。每轮单独成文；轮次标题重复时，以“第 N 轮”和稳定的轮次 ID 区分。`,
    '',
    '## 轮次导航',
    '',
    roundItems || '- 暂无轮次内容。',
    '',
    `> ${relref(`${BASE_CONTENT_PATH}/_index.md`, '返回大厂面经目录')} · [查看 ECool 原文](${experience.sourceUrl})`,
    '',
  ].filter((line, lineIndex, all) => line !== '' || all[lineIndex - 1] !== '').join('\n');
}

export function renderRoundArticle({ experience, rounds }, round, index) {
  const tags = ['面试', '前端', '大厂面经', experience.companyName, round.title, 'ecool'].filter(Boolean);
  const overview = [
    round.description ? `**本轮概述：** ${body(round.description)}` : '',
    round.interviewTime ? `**面试时间：** ${body(round.interviewTime)}` : '',
    round.keyPoints ? `**本轮要点：** ${body(round.keyPoints)}` : '',
  ].filter(Boolean).join('\n\n');
  const questions = round.questions.map(renderQuestion).join('\n\n');
  const nav = navigation(experience, rounds, index);
  return [
    '+++',
    `title = "${toml(experience.title)} · 第 ${round.roundOrder} 轮 · ${toml(round.title)}"`,
    'draft = false',
    `weight = ${round.roundOrder}`,
    `tags = ${tomlArray(tags)}`,
    'categories = ["前端开发", "面试", "大厂面经"]',
    `source = "${toml(experience.sourceUrl)}"`,
    `experienceId = ${experience.id}`,
    `roundId = ${round.id}`,
    `roundOrder = ${round.roundOrder}`,
    experience.companyName ? `company = "${toml(experience.companyName)}"` : '',
    round.createAt ? `date = "${toml(round.createAt)}"` : (experience.createAt ? `date = "${toml(experience.createAt)}"` : ''),
    '+++',
    '',
    `> ${nav}`,
    '',
    overview,
    '',
    `本轮共 ${round.questions.length} 道题。答案默认折叠，便于先自行作答。`,
    '',
    questions || '暂无题目。',
    '',
    '---',
    '',
    nav,
    '',
  ].filter((line, lineIndex, all) => line !== '' || all[lineIndex - 1] !== '').join('\n');
}

export const pathsFor = { experiencePath, roundPath };
