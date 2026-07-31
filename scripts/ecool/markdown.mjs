function inlineChildren(node) {
  return Array.isArray(node) ? node : node?.children ?? [];
}

function localImageName(src) {
  const pathname = String(src ?? '').split(/[?#]/, 1)[0];
  return pathname.split('/').filter(Boolean).at(-1) ?? '';
}

function longestBacktickRun(value) {
  return Math.max(0, ...(String(value).match(/`+/g) ?? []).map((run) => run.length));
}

function renderInline(nodes, { tableCell = false } = {}) {
  return inlineChildren(nodes).map((node) => renderInlineNode(node, { tableCell })).join('');
}

function renderInlineNode(node, { tableCell }) {
  const value = node?.value ?? node?.text ?? '';
  switch (node?.type) {
    case 'text':
      return tableCell ? String(value).replaceAll('|', '\\|') : String(value);
    case 'code': {
      const ticks = '`'.repeat(longestBacktickRun(value) + 1);
      const code = tableCell ? String(value).replaceAll('|', '\\|') : value;
      return `${ticks}${code}${ticks}`;
    }
    case 'strong':
      return `**${renderInline(node, { tableCell })}**`;
    case 'em':
      return `*${renderInline(node, { tableCell })}*`;
    case 'del':
      return `~~${renderInline(node, { tableCell })}~~`;
    case 'link':
      return `[${renderInline(node, { tableCell })}](${node.href ?? node.url ?? ''})`;
    case 'image':
      return `![${node.alt ?? renderInline(node)}](${localImageName(node.src ?? node.url)})`;
    case 'br':
      return '  \n';
    default:
      return renderInline(node, { tableCell });
  }
}

function codeFence(value) {
  return '`'.repeat(Math.max(3, longestBacktickRun(value) + 1));
}

function renderList(list, depth = 0) {
  const ordered = Boolean(list.ordered);
  const start = Number.isInteger(list.start) ? list.start : 1;
  return (list.items ?? []).flatMap((item, index) => {
    const marker = ordered ? `${start + index}. ` : '- ';
    const prefix = '  '.repeat(depth);
    const firstLine = `${prefix}${marker}${renderInline(item)}`;
    const nested = (item.blocks ?? item.childrenBlocks ?? [])
      .map((block) => (block.type === 'list' ? renderList(block, depth + 1) : renderBlock(block, depth + 1)))
      .filter(Boolean);
    return [firstLine, ...nested];
  }).join('\n');
}

function tableCell(cell) {
  return renderInline(cell, { tableCell: true }).replaceAll('\n', '<br>');
}

function renderTable(table) {
  const header = table.header ?? table.headers ?? [];
  const rows = table.rows ?? [];
  const columnCount = header.length || rows[0]?.length || 0;
  const row = (cells) => `| ${Array.from({ length: columnCount }, (_, index) => tableCell(cells[index] ?? [])).join(' | ')} |`;
  return [row(header), `| ${Array(columnCount).fill('---').join(' | ')} |`, ...rows.map(row)].join('\n');
}

function renderBlock(block, depth = 0) {
  switch (block?.type) {
    case 'heading':
      return `${'#'.repeat(Math.max(2, Math.min(6, Number(block.level) || 2)))} ${renderInline(block)}`;
    case 'paragraph':
      return renderInline(block);
    case 'blockquote': {
      const content = (block.children ?? block.blocks ?? []).map((child) => renderBlock(child, depth)).join('\n\n');
      return content.split('\n').map((line) => (line ? `> ${line}` : '>')).join('\n');
    }
    case 'list':
      return renderList(block, depth);
    case 'code': {
      const value = String(block.value ?? block.code ?? '').replace(/\n$/, '');
      const fence = codeFence(value);
      return `${fence}${block.language ?? block.lang ?? ''}\n${value}\n${fence}`;
    }
    case 'table':
      return renderTable(block);
    case 'image':
      return `![${block.alt ?? ''}](${localImageName(block.src ?? block.url)})`;
    case 'hr':
      return '---';
    default:
      return '';
  }
}

export function normalizeMarkdown(markdown) {
  return `${String(markdown).replace(/\n[\t ]*\n(?:[\t ]*\n)+/g, '\n\n').trim()}\n`;
}

export function renderMarkdown(blocks) {
  return normalizeMarkdown((blocks ?? []).map((block) => renderBlock(block)).filter(Boolean).join('\n\n'));
}
