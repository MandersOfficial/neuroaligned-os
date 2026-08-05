// Shared Notion property readers used by Notion-backed backend functions.

export function readTitle(prop) {
  if (!prop?.title?.length) return '';
  return prop.title.map(t => t.plain_text || '').join('');
}

export function readRichText(prop) {
  if (!prop?.rich_text?.length) return '';
  return prop.rich_text.map(t => t.plain_text || '').join('');
}

export function readSelect(prop) {
  return prop?.select?.name || prop?.status?.name || '';
}

export function readDate(prop) {
  return prop?.date?.start || '';
}

export function mapStatus(notionStatus) {
  const s = (notionStatus || '').toLowerCase();
  if (s.includes('done') || s.includes('complete') || s.includes('finished')) return 'done';
  if (s.includes('progress') || s.includes('doing') || s.includes('active')) return 'in_progress';
  if (s.includes('defer') || s.includes('later') || s.includes('someday')) return 'deferred';
  return 'todo';
}