import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

function readTitle(prop) {
  if (!prop?.title?.length) return '';
  return prop.title.map(t => t.plain_text || '').join('');
}
function readRichText(prop) {
  if (!prop?.rich_text?.length) return '';
  return prop.rich_text.map(t => t.plain_text || '').join('');
}
function readSelect(prop) {
  return prop?.select?.name || prop?.status?.name || '';
}
function readDate(prop) {
  return prop?.date?.start || '';
}

function mapStatus(notionStatus) {
  const s = (notionStatus || '').toLowerCase();
  if (s.includes('done') || s.includes('complete') || s.includes('finished')) return 'done';
  if (s.includes('progress') || s.includes('doing') || s.includes('active')) return 'in_progress';
  if (s.includes('defer') || s.includes('later') || s.includes('someday')) return 'deferred';
  return 'todo';
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

    const allTasks = await base44.entities.Task.filter({});
    const taskById = new Map(allTasks.map(t => [t.id, t]));

    let hasMore = true;
    let nextCursor = undefined;
    const results = [];

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
        try {
          const props = page.properties || {};
          const titleProp = Object.values(props).find(p => p.type === 'title');
          const title = readTitle(titleProp);
          const notionId = readRichText(props['NeuroAligned ID']);
          const status = readSelect(props['Status']) || readSelect(props['status']);
          const dueDate = readDate(props['Due Date']) || readDate(props['due_date']);
          const description = readRichText(props['Description']) || readRichText(props['description']) || readRichText(props['Notes']);

          if (!title) continue;

          const update = { title };
          update.status = mapStatus(status);
          if (dueDate) update.due_date = dueDate;
          if (description) update.description = description.slice(0, 2000);

          const existing = notionId ? taskById.get(notionId) : null;

          if (existing) {
            await base44.entities.Task.update(existing.id, update);
            results.push({ name: title, action: 'updated' });
          } else {
            const created = await base44.entities.Task.create(update);
            await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                properties: {
                  'NeuroAligned ID': { rich_text: [{ text: { content: created.id } }] },
                },
              }),
            });
            results.push({ name: title, action: 'created' });
          }
        } catch (e) {
          results.push({ name: '(unknown)', action: 'error', error: e.message });
        }
      }

      hasMore = queryData.has_more;
      nextCursor = queryData.next_cursor;
    }

    const synced = results.filter(r => r.action !== 'error').length;
    const created = results.filter(r => r.action === 'created').length;
    const updated = results.filter(r => r.action === 'updated').length;
    const errors = results.filter(r => r.action === 'error');

    return Response.json({ success: true, synced, created, updated, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});