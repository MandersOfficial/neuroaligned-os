// Shared Notion plumbing for the app's Notion functions — one place for the
// API version, the retry/timeout policy, and the property readers.
export const NOTION_CONNECTOR_ID = '6a9c83fae18c151ef517de3b';
export const NOTION_VERSION = '2025-09-03';
export const NOTION_API = 'https://api.notion.com/v1';

export function notionHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// Notion averages ~3 requests/sec per connection; 429/529 responses carry a
// Retry-After header we respect before retrying. Every call is also bounded,
// so one hung request can't stall a whole sync.
export async function notionFetch(url, options = {}, attempt = 0) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if ((res.status === 429 || res.status === 529) && attempt < 3) {
    const retryAfter = Number(res.headers.get('Retry-After'));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : Math.min(2 ** attempt, 10);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
    return notionFetch(url, options, attempt + 1);
  }
  return res;
}

export const rowTitle = (page, titleKey) =>
  (page.properties?.[titleKey]?.title || []).map(t => t.plain_text).join('').trim();

export const selValue = (p) => p?.select?.name || null;
export const dateValue = (p) => p?.date?.start || null;
export const richTextValue = (p) => (p?.rich_text || []).map(x => x.plain_text).join('').trim() || null;