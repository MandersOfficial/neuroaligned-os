import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';
import { NOTION_API, NOTION_CONNECTOR_ID, notionFetch, notionHeaders } from '../../shared/notion.ts';

// Lists the Notion data sources the connected user has shared with the app,
// so they can pick a sync target in the Notion sync panel. Uses the
// 2025-09-03 API: search for data sources, not databases.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);

    const res = await notionFetch(`${NOTION_API}/search`, {
      method: 'POST',
      headers: notionHeaders(accessToken),
      body: JSON.stringify({ filter: { property: 'object', value: 'data_source' }, page_size: 100 }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Notion search error:', data.message || data.code);
      return Response.json({ error: data.message || 'Could not list Notion databases' }, { status: 400 });
    }

    const databases = (data.results || []).map(s => ({
      id: s.id,
      title: (s.name || '').trim() || 'Untitled database',
      url: s.url || '',
    }));

    return Response.json({ databases });
  } catch (error) {
    console.error('listNotionDatabases error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}