import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the user's Notion OAuth access token
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a1cfa4c8db502aafb000e1a');

    const res = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
      }),
    });

    const data = await res.json();

    if (data.object === 'error') {
      return Response.json({ error: data.message }, { status: 400 });
    }

    const databases = (data.results || []).map(db => ({
      id: db.id,
      name: db.title?.[0]?.plain_text || 'Untitled Database',
      url: db.url,
    }));

    return Response.json({ databases });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});