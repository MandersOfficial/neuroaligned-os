import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

const CONNECTOR_ID = '6a9c83fae18c151ef517de3b';
const NOTION_VERSION = '2022-06-28';

// Lists the Notion databases the connected user has shared with the app,
// so they can pick a push target in the Notion sync panel.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const res = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter: { property: 'object', value: 'database' }, page_size: 100 }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Notion search error:', data.message || data.code);
      return Response.json({ error: data.message || 'Could not list Notion databases' }, { status: 400 });
    }

    const databases = (data.results || []).map(d => ({
      id: d.id,
      title: (d.title || []).map(t => t.plain_text).join('').trim() || 'Untitled database',
      url: d.url,
    }));

    return Response.json({ databases });
  } catch (error) {
    console.error('listNotionDatabases error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}