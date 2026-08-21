import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { readTitle, readDate } from '../../shared/notionProps.ts';

const SETTING_KEY = 'notion_projects_database_id';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled jobs run with the workspace admin context.
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: SETTING_KEY });
    const dbId = settings && settings[0] ? settings[0].value : '';
    if (!dbId) {
      return Response.json({ success: true, skipped: true, reason: 'No Notion projects database pinned.' });
    }

    const notionToken = secrets.get('Notion_api');
    if (!notionToken) {
      return Response.json({ error: 'Notion_api secret not set' }, { status: 500 });
    }

    // Index existing projects by name (case-insensitive) for matching.
    const projects = await base44.asServiceRole.entities.Project.list('-created_date', 200);
    const byName = new Map();
    for (const p of projects) {
      if (p.name) byName.set(p.name.trim().toLowerCase(), p);
    }

    const updated = [];
    const unmatched = [];
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
          const dueDate =
            readDate(props['Due Date']) ||
            readDate(props['due_date']) ||
            readDate(props['Deadline']) ||
            readDate(props['deadline']);
          if (!title || !dueDate) continue;

          const proj = byName.get(title.trim().toLowerCase());
          if (proj) {
            if (proj.due_date !== dueDate) {
              await base44.asServiceRole.entities.Project.update(proj.id, { due_date: dueDate });
              updated.push({ name: title, due_date: dueDate });
            }
          } else {
            unmatched.push({ name: title });
          }
        } catch (e) {
          unmatched.push({ name: '(error)', error: e.message });
        }
      }

      hasMore = queryData.has_more;
      nextCursor = queryData.next_cursor;
    }

    return Response.json({
      success: true,
      pinnedDatabase: dbId,
      scanned: updated.length + unmatched.length,
      deadlinesUpdated: updated.length,
      unmatched: unmatched.length,
      unmatchedDetails: unmatched.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}