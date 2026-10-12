import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';
import {
  NOTION_API, NOTION_CONNECTOR_ID, notionFetch, notionHeaders,
  rowTitle, selValue, dateValue, richTextValue,
} from '../../shared/notion.ts';

const TASKS_PAGE_TITLE = 'NeuroAligned Tasks';
const MAX_CHILDREN = 100; // Notion page-create limit

const STATUS_OPTIONS = ['active', 'paused', 'completed', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

// Two-way sync between the user's NeuroAligned projects and a Notion data
// source they chose (listNotionDatabases).
//
//   Matching: each project stores the Notion page id, so renaming a project in
//     either app updates the same row instead of creating a duplicate. Rows are
//     only matched by title once, to link projects that predate this.
//   Conflicts: for every field that differs, whichever side was edited last
//     wins — so an edit made in the app is no longer overwritten by Notion.
//   Tasks: a "NeuroAligned Tasks" page mirrors the task list, rewritten only
//     when its content actually changed.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const dataSourceId = String(body.data_source_id || '').trim();
    if (!dataSourceId) return Response.json({ error: 'Pick a Notion database first' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);
    const headers = notionHeaders(accessToken);
    const text = (content) => ({ type: 'text', text: { content } });

    // 1. Load the data source schema and add the properties the sync needs
    const dsRes = await notionFetch(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}`, { headers });
    const ds = await dsRes.json();
    if (!dsRes.ok) {
      const msg = ds.code === 'object_not_found'
        ? 'Notion database not found — make sure it is shared with the NeuroAligned integration in Notion.'
        : (ds.message || 'Could not access the Notion database');
      console.error('Notion data source access error:', msg);
      return Response.json({ error: msg }, { status: 400 });
    }
    const props = ds.properties || {};
    const titleKey = Object.keys(props).find(k => props[k].type === 'title') || 'Name';

    const missing = {};
    if (!props.Status) missing.Status = { select: { options: STATUS_OPTIONS.map(n => ({ name: n })) } };
    if (!props.Priority) missing.Priority = { select: { options: PRIORITY_OPTIONS.map(n => ({ name: n })) } };
    if (!props['Due Date']) missing['Due Date'] = { date: {} };
    if (!props.Client) missing.Client = { rich_text: {} };
    if (Object.keys(missing).length > 0) {
      await notionFetch(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ properties: missing }),
      });
    }

    // 2. Query every row (paginated)
    const rows = [];
    let cursor = null;
    do {
      const qRes = await notionFetch(`${NOTION_API}/data_sources/${encodeURIComponent(dataSourceId)}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 }),
      });
      const qData = await qRes.json();
      if (!qRes.ok) {
        console.error('Notion query error:', qData.message || qData.code);
        return Response.json({ error: qData.message || 'Could not read the Notion database' }, { status: 400 });
      }
      rows.push(...(qData.results || []));
      cursor = qData.has_more ? qData.next_cursor : null;
    } while (cursor && rows.length < 500);

    const rowsByTitle = new Map();
    for (const r of rows) {
      const t = rowTitle(r, titleKey);
      if (t) rowsByTitle.set(t.toLowerCase(), r);
    }

    const isTasksPage = (title) => (title || '').trim().toLowerCase() === TASKS_PAGE_TITLE.toLowerCase();

    // The Notion values for one row, limited to the fields the sync owns
    const notionValues = (row) => ({
      status: STATUS_OPTIONS.includes(selValue(row.properties.Status)) ? selValue(row.properties.Status) : null,
      priority: PRIORITY_OPTIONS.includes(selValue(row.properties.Priority)) ? selValue(row.properties.Priority) : null,
      due_date: dateValue(row.properties['Due Date']) || null,
      client_name: richTextValue(row.properties.Client),
    });

    const notionPayload = (project, keys) => {
      const payload = {};
      if (keys.includes('name') && project.name) payload[titleKey] = { title: [text(project.name)] };
      if (keys.includes('status') && STATUS_OPTIONS.includes(project.status)) payload.Status = { select: { name: project.status } };
      if (keys.includes('priority') && PRIORITY_OPTIONS.includes(project.priority)) payload.Priority = { select: { name: project.priority } };
      if (keys.includes('due_date') && project.due_date) payload['Due Date'] = { date: { start: project.due_date } };
      if (keys.includes('client_name') && project.client_name) payload.Client = { rich_text: [text(project.client_name)] };
      return payload;
    };

    const projects = await base44.entities.Project.list('-created_date', 200);
    const byPageId = new Map();
    for (const p of projects) if (p.notion_page_id) byPageId.set(p.notion_page_id, p);

    let pulledCreated = 0;
    let pulledUpdated = 0;
    let pushedNew = 0;
    let pushedUpdated = 0;
    let inSync = 0;
    const createdInApp = [];
    const createdInNotion = [];
    const failed = [];

    // 3. Link each project to its row once, by title. From then on the stored
    //    page id is the only match, so renames never duplicate.
    for (const p of projects) {
      if (p.notion_page_id) continue;
      const row = rowsByTitle.get((p.name || '').trim().toLowerCase());
      if (!row || isTasksPage(rowTitle(row, titleKey))) continue;
      await base44.entities.Project.update(p.id, { notion_page_id: row.id });
      p.notion_page_id = row.id;
      byPageId.set(row.id, p);
    }

    // 4. Rows with no project yet become projects
    for (const row of rows) {
      const title = rowTitle(row, titleKey);
      if (!title || isTasksPage(title) || byPageId.has(row.id)) continue;
      const nv = notionValues(row);
      const created = await base44.entities.Project.create({
        name: title,
        status: nv.status || 'active',
        priority: nv.priority || 'medium',
        due_date: nv.due_date,
        client_name: nv.client_name,
        notion_page_id: row.id,
      });
      byPageId.set(row.id, created);
      pulledCreated++;
      createdInApp.push(title);
    }

    // 5. Reconcile every linked pair — most recently edited side wins per field
    for (const row of rows) {
      const project = byPageId.get(row.id);
      if (!project || isTasksPage(project.name)) continue;

      const nv = notionValues(row);
      const title = rowTitle(row, titleKey);
      const notionNewer = Date.parse(row.last_edited_time || 0) > Date.parse(project.updated_date || 0);

      const pullKeys = [];
      const pushKeys = [];
      const consider = (key, appVal, notionVal) => {
        const a = appVal || null;
        const n = notionVal || null;
        if (a === n) return;
        if (!a || (n && notionNewer)) pullKeys.push(key);
        else pushKeys.push(key);
      };
      consider('name', (project.name || '').trim(), title);
      consider('status', project.status, nv.status);
      consider('priority', project.priority, nv.priority);
      consider('due_date', project.due_date, nv.due_date);
      consider('client_name', project.client_name, nv.client_name);

      if (pullKeys.length === 0 && pushKeys.length === 0) {
        inSync++;
        continue;
      }

      if (pullKeys.length > 0) {
        const patch = {};
        for (const k of pullKeys) patch[k] = k === 'name' ? title : nv[k];
        await base44.entities.Project.update(project.id, patch);
        Object.assign(project, patch);
        pulledUpdated++;
      }

      if (pushKeys.length > 0) {
        const res = await notionFetch(`${NOTION_API}/pages/${row.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties: notionPayload(project, pushKeys) }),
        });
        if (res.ok) {
          pushedUpdated++;
        } else {
          const err = await res.json().catch(() => null);
          console.error('Notion page update error:', err?.message || res.status);
          failed.push(project.name || row.id);
        }
      }
    }

    // 6. Projects with no Notion row yet get one
    for (const p of projects) {
      if (p.notion_page_id) continue;
      const name = (p.name || '').trim();
      if (!name) continue;
      const res = await notionFetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'data_source_id', data_source_id: dataSourceId },
          properties: notionPayload(p, ['name', 'status', 'priority', 'due_date', 'client_name']),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('Notion page create error:', err?.message || res.status);
        failed.push(name);
        continue;
      }
      const created = await res.json();
      await base44.entities.Project.update(p.id, { notion_page_id: created.id });
      byPageId.set(created.id, p);
      pushedNew++;
      createdInNotion.push(name);
    }

    // 7. Tasks page — rewritten only when its content actually changed, so a
    //    quiet sign-in no longer archives and recreates it every session.
    const tasks = await base44.entities.Task.list('-created_date', 500);
    let tasksPushed = 0;
    if (tasks.length > 0) {
      const byStatus = {};
      for (const t of tasks) {
        const s = t.status || 'todo';
        (byStatus[s] = byStatus[s] || []).push(t);
      }
      const labels = { in_progress: 'In Progress', todo: 'To Do', deferred: 'Deferred', done: 'Done' };
      const children = [];
      const lines = [];
      let counted = 0;
      for (const [status, label] of Object.entries(labels)) {
        const group = byStatus[status] || [];
        if (!group.length || children.length + 1 >= MAX_CHILDREN) continue;
        children.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [text(label)] } });
        lines.push(label);
        for (const t of group) {
          if (children.length >= MAX_CHILDREN) break;
          const suffix = [
            t.due_date ? `due ${t.due_date}` : null,
            t.estimated_minutes ? `${t.estimated_minutes}m` : null,
          ].filter(Boolean).join(' · ');
          const line = t.title + (suffix ? ` (${suffix})` : '');
          children.push({
            object: 'block',
            type: 'to_do',
            to_do: { rich_text: [text(line)], checked: status === 'done' },
          });
          lines.push(line);
          counted++;
        }
      }

      const oldPage = rowsByTitle.get(TASKS_PAGE_TITLE.toLowerCase());
      let unchanged = false;
      if (oldPage) {
        const blocks = [];
        let childCursor = null;
        do {
          const url = `${NOTION_API}/blocks/${oldPage.id}/children?page_size=100${childCursor ? `&start_cursor=${childCursor}` : ''}`;
          const bRes = await notionFetch(url, { headers });
          const bData = await bRes.json();
          if (!bRes.ok) break;
          blocks.push(...(bData.results || []));
          childCursor = bData.has_more ? bData.next_cursor : null;
        } while (childCursor && blocks.length < MAX_CHILDREN);
        const existing = blocks
          .map(b => (b[b.type]?.rich_text || []).map(x => x.plain_text).join(''))
          .join('\n');
        unchanged = existing === lines.join('\n');
      }

      if (unchanged) {
        tasksPushed = counted;
      } else {
        if (oldPage) {
          await notionFetch(`${NOTION_API}/pages/${oldPage.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ archived: true }),
          });
        }
        const res = await notionFetch(`${NOTION_API}/pages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            parent: { type: 'data_source_id', data_source_id: dataSourceId },
            properties: { [titleKey]: { title: [text(TASKS_PAGE_TITLE)] } },
            children: children.slice(0, MAX_CHILDREN),
          }),
        });
        if (res.ok) tasksPushed = counted;
      }
    }

    return Response.json({
      pushed_new: pushedNew,
      pushed_updated: pushedUpdated,
      created_in_notion: createdInNotion,
      pulled_created: pulledCreated,
      pulled_updated: pulledUpdated,
      created_in_app: createdInApp,
      tasks_pushed: tasksPushed,
      in_sync: inSync,
      failed: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error('syncProjectsToNotion error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}