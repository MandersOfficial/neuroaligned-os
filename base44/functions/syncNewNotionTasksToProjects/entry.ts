import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { readTitle, readRichText, readSelect, readDate, mapStatus, createProjectMatcher } from '../../shared/notionProps.ts';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

export default async function (req) {
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
    const projects = await base44.entities.Project.list('-created_date', 200);
    const { match } = createProjectMatcher(projects, accessToken);

    const pulled = [];
    const matched = [];
    const unmatched = [];
    let hasMore = true;
    let nextCursor;

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
            pulled.push({ name: title, action: 'updated' });
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
            pulled.push({ name: title, action: 'created' });
          }

          const { project, projectRefName } = await match(props);
          if (project) {
            matched.push({ task: title, project: project.name });
          } else if (projectRefName) {
            unmatched.push({ task: title, projectRef: projectRefName });
          }
        } catch (e) {
          pulled.push({ name: '(unknown)', action: 'error', error: e.message });
        }
      }

      hasMore = queryData.has_more;
      nextCursor = queryData.next_cursor;
    }

    // Refresh the Google Tasks schedule for all active projects with due dates
    let syncResult = null;
    try {
      const sr = await base44.functions.invoke('syncProjectDeadlinesToTasks', {});
      syncResult = sr.data || sr;
    } catch (e) {
      syncResult = { error: e.message };
    }

    return Response.json({
      success: true,
      pulled: pulled.length,
      created: pulled.filter(p => p.action === 'created').length,
      updated: pulled.filter(p => p.action === 'updated').length,
      matched: matched.length,
      unmatched: unmatched.length,
      matchedDetails: matched,
      unmatchedDetails: unmatched,
      syncResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}