import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

// Reads a "Project" property (relation / select / rich_text / title) into a name string.
function readProjectRef(prop) {
  if (!prop) return '';
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'rich_text' && prop.rich_text?.length) {
    return prop.rich_text.map(t => t.plain_text || '').join('');
  }
  if (prop.type === 'title' && prop.title?.length) {
    return prop.title.map(t => t.plain_text || '').join('');
  }
  return '';
}

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
    const projectByName = new Map(projects.map(p => [p.name.trim().toLowerCase(), p]));

    const relationTitleCache = new Map();
    async function resolveRelationTitle(id) {
      if (relationTitleCache.has(id)) return relationTitleCache.get(id);
      let title = '';
      try {
        const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Notion-Version': '2022-06-28' },
        });
        const data = await r.json();
        const titleProp = Object.values(data.properties || {}).find(p => p.type === 'title');
        title = readTitle(titleProp);
      } catch { /* ignore */ }
      relationTitleCache.set(id, title);
      return title;
    }

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
          let taskName = title;
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

          // Match task → Project by the Notion "Project" property name
          const projectProp = props['Project'] || props['project'];
          let projectRefName = readProjectRef(projectProp);
          if (projectProp?.type === 'relation' && projectProp.relation?.length) {
            const titles = [];
            for (const rel of projectProp.relation) {
              const t = await resolveRelationTitle(rel.id);
              if (t) titles.push(t);
            }
            projectRefName = titles.join(', ');
          }
          const project = projectRefName ? projectByName.get(projectRefName.trim().toLowerCase()) : null;
          if (project) {
            matched.push({ task: taskName, project: project.name });
          } else if (projectRefName) {
            unmatched.push({ task: taskName, projectRef: projectRefName });
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