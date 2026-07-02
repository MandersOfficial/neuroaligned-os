import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STATUSES = ['active', 'paused', 'completed', 'archived'];
const PRIORITIES = ['low', 'medium', 'high'];

function readTitle(prop) {
  if (!prop?.title?.length) return '';
  return prop.title.map(t => t.plain_text || '').join('');
}
function readSelect(prop) {
  return prop?.select?.name || '';
}
function readRichText(prop) {
  if (!prop?.rich_text?.length) return '';
  return prop.rich_text.map(t => t.plain_text || '').join('');
}
function readDate(prop) {
  return prop?.date?.start || '';
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

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a1cfa4c8db502aafb000e1a');

    // Index all the user's projects by id for matching
    const allProjects = await base44.entities.Project.filter({});
    const projectById = new Map(allProjects.map(p => [p.id, p]));

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
          const name = readTitle(props['Name']);
          const notionId = readRichText(props['NeuroAligned ID']);
          const status = readSelect(props['Status']);
          const priority = readSelect(props['Priority']);
          const client = readRichText(props['Client']);
          const dueDate = readDate(props['Due Date']);
          const notes = readRichText(props['Notes']);

          const update = { name: name || 'Untitled' };
          if (STATUSES.includes(status)) update.status = status;
          if (PRIORITIES.includes(priority)) update.priority = priority;
          if (client) update.client_name = client;
          if (dueDate) update.due_date = dueDate;
          if (notes) update.notes = notes.slice(0, 2000);

          const existing = notionId ? projectById.get(notionId) : null;

          if (existing) {
            await base44.entities.Project.update(existing.id, update);
            results.push({ name: update.name, action: 'updated' });
          } else {
            const created = await base44.entities.Project.create(update);
            // Write the new app project ID back to Notion so future pushes update this page
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
            results.push({ name: update.name, action: 'created' });
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