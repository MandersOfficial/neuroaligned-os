import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

function readPropValue(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return (prop.title || []).map(t => t.plain_text || '').join('');
    case 'rich_text':
      return (prop.rich_text || []).map(t => t.plain_text || '').join('');
    case 'select':
      return prop.select?.name || '';
    case 'status':
      return prop.status?.name || '';
    case 'multi_select':
      return (prop.multi_select || []).map(s => s.name).join(', ');
    case 'date':
      return prop.date?.start || '';
    case 'checkbox':
      return prop.checkbox ? 'Yes' : 'No';
    case 'number':
      return prop.number?.toString() || '';
    case 'url':
      return prop.url || '';
    case 'email':
      return prop.email || '';
    case 'phone_number':
      return prop.phone_number || '';
    case 'people':
      return (prop.people || []).map(p => p.name || '').join(', ');
    case 'created_time':
      return prop.created_time || '';
    case 'last_edited_time':
      return prop.last_edited_time || '';
    case 'relation':
      return (prop.relation || []).length + ' linked';
    default:
      return '';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notion_database_id } = await req.json();
    if (!notion_database_id) {
      return Response.json({ error: 'Missing notion_database_id' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);

    // Fetch database schema for column names
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    const dbData = await dbRes.json();
    if (dbData.object === 'error') {
      return Response.json({ error: dbData.message }, { status: 400 });
    }

    const dbName = dbData.title?.[0]?.plain_text || 'Untitled Database';
    const columns = Object.entries(dbData.properties || {}).map(([key, p]) => ({
      key,
      name: key,
      type: p.type,
    }));

    // Query all pages
    let hasMore = true;
    let nextCursor = undefined;
    const rows = [];

    while (hasMore) {
      const body = { page_size: 100 };
      if (nextCursor) body.start_cursor = nextCursor;

      const queryRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const queryData = await queryRes.json();

      if (queryData.object === 'error') {
        return Response.json({ error: queryData.message }, { status: 400 });
      }

      for (const page of queryData.results || []) {
        if (page.archived) continue;
        const values = {};
        for (const col of columns) {
          values[col.key] = readPropValue(page.properties?.[col.key]);
        }
        rows.push({
          id: page.id,
          url: page.url,
          values,
        });
      }

      hasMore = queryData.has_more;
      nextCursor = queryData.next_cursor;
    }

    return Response.json({ success: true, database_name: dbName, columns, rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});