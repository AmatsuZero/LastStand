import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeMarkdown, renderMarkdown } from './markdown.mjs';

test('renders article blocks without editor chrome or extra trailing blank lines', () => {
  const blocks = [
    { type: 'heading', level: 2, children: [{ type: 'text', value: '前言' }] },
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: '访问 ' },
        { type: 'link', href: 'https://example.com', children: [{ type: 'text', value: '外链' }] },
        { type: 'text', value: '。' },
      ],
    },
    {
      type: 'list',
      ordered: false,
      items: [
        {
          children: [{ type: 'text', value: '第一项' }],
          blocks: [
            {
              type: 'list',
              ordered: true,
              start: 1,
              items: [{ children: [{ type: 'text', value: '嵌套项' }] }],
            },
          ],
        },
      ],
    },
    { type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', value: '引用内容' }] }] },
    {
      type: 'code',
      language: 'javascript',
      value: 'const value = 1;\n',
      lineNumbers: true,
      copyText: '复制',
      className: 'react-syntax-highlighter-line-number',
    },
    {
      type: 'table',
      header: [
        [{ type: 'text', value: '名称' }],
        [{ type: 'text', value: '说明' }],
      ],
      rows: [[[{ type: 'text', value: 'A|B' }], [{ type: 'code', value: '值' }]]],
    },
    { type: 'image', alt: '示意图', src: 'https://cdn.example.com/images/image-01.jpeg?token=abc' },
  ];

  const markdown = normalizeMarkdown(renderMarkdown(blocks));

  assert.match(markdown, /^## 前言/m);
  assert.match(markdown, /```javascript\nconst value = 1;\n```/);
  assert.doesNotMatch(markdown, /复制|react-syntax-highlighter-line-number/);
  assert.match(markdown, /\| 名称 \| 说明 \|/);
  assert.match(markdown, /!\[示意图\]\(image-01\.jpeg\)/);
  assert.match(markdown, /- 第一项\n  1\. 嵌套项/);
  assert.match(markdown, /\| A\\\|B \| `值` \|/);
  assert.match(markdown, /\[外链\]\(https:\/\/example\.com\)/);
  assert.ok(markdown.endsWith('\n'));
  assert.ok(!markdown.endsWith('\n\n'));
});

test('escapes pipes inside formatted table cells', () => {
  const markdown = renderMarkdown([
    {
      type: 'table',
      header: [[{ type: 'text', value: '名称' }]],
      rows: [[[{ type: 'strong', children: [{ type: 'text', value: 'A|B' }] }]]],
    },
  ]);

  assert.match(markdown, /\| \*\*A\\\|B\*\* \|/);
});

test('escapes pipes inside inline code table cells', () => {
  const markdown = renderMarkdown([
    {
      type: 'table',
      header: [[{ type: 'text', value: '名称' }]],
      rows: [[[{ type: 'code', value: 'A|B' }]]],
    },
  ]);

  assert.match(markdown, /\| `A\\\|B` \|/);
});

test('renders blank lines in multi-paragraph blockquotes without trailing whitespace', () => {
  const markdown = renderMarkdown([
    {
      type: 'blockquote',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: '第一段' }] },
        { type: 'paragraph', children: [{ type: 'text', value: '第二段' }] },
      ],
    },
  ]);

  assert.match(markdown, /^> 第一段\n>\n> 第二段$/m);
  assert.doesNotMatch(markdown, /^>[ \t]+$/m);
});
