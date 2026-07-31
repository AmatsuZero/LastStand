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

test('normalizes trailing whitespace without changing fenced code semantics', () => {
  const markdown = normalizeMarkdown([
    '硬换行  ',
    '单空格 ',
    ' \t',
    '```javascript',
    'const value = 1;  ',
    '```',
    '~~~text',
    'tilde code\t',
    '~~~',
    '> 引用  ',
    '> ',
    '> 结束\t',
  ].join('\n'));

  assert.equal(markdown, [
    '硬换行<br>',
    '单空格',
    '',
    '```javascript',
    'const value = 1;',
    '```',
    '~~~text',
    'tilde code',
    '~~~',
    '> 引用<br>',
    '>',
    '> 结束',
    '',
  ].join('\n'));
  assert.doesNotMatch(markdown, /[ \t]+$/m);
});

test('renders br nodes as whitespace-free HTML breaks', () => {
  const markdown = renderMarkdown([{ type: 'paragraph', children: [{ type: 'text', value: '第一行' }, { type: 'br' }, { type: 'text', value: '第二行' }] }]);
  assert.equal(markdown, '第一行<br>\n第二行\n');
});

test('normalizes only valid fenced-code closers, including blockquote containers', () => {
  const markdown = normalizeMarkdown([
    '````js',
    'inside  ',
    '```',
    '',
    '',
    '````',
    '~~~lang',
    'still code  ',
    '~~~not-a-close',
    '~~~',
    '    ```js  ',
    'tab\t  ',
    '\t~~~js  ',
    '> ```js',
    '> code  ',
    '> ',
    '> ',
    '> ```',
    '> > ~~~js',
    '> > nested  ',
    '> > ~~~',
  ].join('\n'));

  assert.match(markdown, /inside\n```\n\n\n````/);
  assert.match(markdown, /still code\n~~~not-a-close\n~~~/);
  assert.match(markdown, /^    ```js<br>$/m);
  assert.match(markdown, /^tab<br>$/m);
  assert.match(markdown, /^    ~~~js<br>$/m);
  assert.match(markdown, /^> code$/m);
  assert.match(markdown, /^>$/m);
  assert.match(markdown, /^> > nested$/m);
  assert.doesNotMatch(markdown, /code<br>|nested<br>/);
});

test('closes fences by quote depth and treats invalid openers as ordinary lines', () => {
  const markdown = normalizeMarkdown([
    '前言',
    ' ```js',
    'code  ',
    '  ```',
    '>```js',
    '> code  ',
    '> ````',
    '```info`  ',
  ].join('\n'));

  assert.match(markdown, / ```js\ncode\n  ```/);
  assert.match(markdown, />```js\n> code\n> ````/);
  assert.match(markdown, /^```info`<br>$/m);
  assert.doesNotMatch(markdown, /code<br>/);
});

test('ends unclosed quoted fences when their quote container depth decreases', () => {
  const markdown = normalizeMarkdown([
    '> ```js',
    '> quoted code  ',
    'outside  ',
    '> > ~~~js',
    '> > nested code  ',
    '> after nested  ',
    '```js',
    'top-level code  ',
  ].join('\n'));

  assert.match(markdown, /^outside<br>$/m);
  assert.match(markdown, /^> after nested<br>$/m);
  assert.match(markdown, /^top-level code$/m);
  assert.doesNotMatch(markdown, /^top-level code<br>$/m);
});

test('expands leading tabs to four-column stops without changing body tabs', () => {
  const markdown = normalizeMarkdown([
    '```text',
    '     \tcode',
    ' \t',
    '\tindent',
    'body\tvalue',
    '```',
  ].join('\n'));

  assert.match(markdown, /^        code$/m);
  assert.match(markdown, /code\n\n    indent/);
  assert.match(markdown, /^    indent$/m);
  assert.match(markdown, /^body\tvalue$/m);
  assert.doesNotMatch(markdown, / +\t/);
});
