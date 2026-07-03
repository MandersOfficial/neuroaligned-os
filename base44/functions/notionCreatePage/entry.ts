import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notion_database_id, title, content } = await req.json();
    if (!notion_database_id || !title) {
      return Response.json({ error: 'Missing notion_database_id or title' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);

    // Fetch the database schema to find the title property name
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    const dbData = await dbRes.json();

    const titleKey = dbData.object !== 'error'
      ? (Object.entries(dbData.properties || {}).find(([_, p]) => p.type === 'title')?.[0] || 'Name')
      : 'Name';

    const pageBody = {
      parent: { database_id: notion_database_id },
      properties: {
        [titleKey]: { title: [{ text: { content: title.slice(0, 2000) } }] },
      },
      children: [],
    };

    if (content) {
      const chunks = content.match(/[\s\S]{1,2000}/g) || [];
      for (const chunk of chunks.slice(0, 100)) {
        pageBody.children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: chunk } }] },
        });
      }
    }

    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageBody),
    });
    const createData = await createRes.json();

    if (createData.object === 'error') {
      return Response.json({ error: createData.message }, { status: 400 });
    }

    return Response.json({ success: true, page_id: createData.id, url: createData.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});