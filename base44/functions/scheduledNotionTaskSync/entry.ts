import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { readTitle, readRichText, readSelect, readDate, mapStatus, createProjectMatcher } from '../../shared/notionProps.ts';

const SETTING_KEY = 'notion_tasks_database_id';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled jobs run with the workspace admin context; mirror the existing scheduled-function guard.
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: SETTING_KEY });
    const dbId = settings && settings[0] ? settings[0].value : '';
    if (!dbId) {
      return Response.json({ success: true, skipped: true, reason: 'No Notion task database pinned.' });
    }

    const notionToken = secrets.get('Notion_api');
    if (!notionToken) {
      return Response.json({ error: 'Notion_api secret not set' }, { status: 500 });
    }

    const allTasks = await base44.asServiceRole.entities.Task.filter({});
    const taskById = new Map(allTasks.map(t => [t.id, t]));
    const projects = await base44.asServiceRole.entities.Project.list('-created_date', 200);
    const { match } = createProjectMatcher(projects, notionToken);

    const pulled = [];
    const matched = [];
    const unmatched = [];
    const projectEarliestDue = new Map();

    let hasMore = true;
    let nextCursor;

    while (hasMore) {
      const body = { page_size: 100 };
      if (nextCursor) body.start_cursor = nextCursor;

      const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
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
            await base44.asServiceRole.entities.Task.update(existing.id, update);
            pulled.push({ name: title, action: 'updated' });
          } else {
            const created = await base44.asServiceRole.entities.Task.create(update);
            await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${notionToken}`,
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
            if (dueDate) {
              const cur = projectEarliestDue.get(project.id);
              if (!cur || dueDate < cur) projectEarliestDue.set(project.id, dueDate);
            }
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

    // Update project deadlines from the earliest matched task due date
    let deadlinesUpdated = 0;
    for (const [projectId, earliest] of projectEarliestDue) {
      const proj = projects.find(p => p.id === projectId);
      if (!proj) continue;
      if (!proj.due_date || earliest < proj.due_date) {
        await base44.asServiceRole.entities.Project.update(projectId, { due_date: earliest });
        deadlinesUpdated++;
      }
    }

    return Response.json({
      success: true,
      pulled: pulled.length,
      created: pulled.filter(p => p.action === 'created').length,
      updated: pulled.filter(p => p.action === 'updated').length,
      matched: matched.length,
      unmatched: unmatched.length,
      deadlinesUpdated,
      unmatchedDetails: unmatched,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}