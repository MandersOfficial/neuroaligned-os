import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

const CONNECTOR_ID = '6a9c83fae18c151ef517de3b';
const NOTION_VERSION = '2025-09-03';
const TASKS_PAGE_TITLE = 'NeuroAligned Tasks';
const MAX_CHILDREN = 100; // Notion page-create limit

const STATUS_OPTIONS = ['active', 'paused', 'completed', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

// Two-way sync between the user's NeuroAligned projects/tasks and a Notion
// data source they chose (listNotionDatabases).
//   Pull (Notion → app): rows become projects; edits to Status/Priority/Due
//     Date/Client flow back into the matching project.
//   Push (app → Notion): projects are created/updated as rows; a
//     "NeuroAligned Tasks" page is refreshed with the current task list.
// Runs on demand from the integrations page and automatically once per
// sign-in session (AppShell) for users who enabled auto-sync.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const dataSourceId = String(body.data_source_id || '').trim();
    if (!dataSourceId) return Response.json({ error: 'Pick a Notion database first' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    };

    // 1. Load the data source schema and add missing sync properties
    const dsRes = await fetch(`https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}`, { headers });
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
      await fetch(`https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ properties: missing }),
      });
    }

    // 2. Query all rows (paginated)
    const rows = [];
    let cursor = null;
    do {
      const qRes = await fetch(`https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`, {
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

    const rowTitle = (page) => (page.properties?.[titleKey]?.title || []).map(t => t.plain_text).join('').trim();
    const rowsByTitle = new Map();
    for (const r of rows) {
      const t = rowTitle(r);
      if (t) rowsByTitle.set(t.toLowerCase(), r);
    }
    const sel = (p) => p?.select?.name || null;
    const dateVal = (p) => p?.date?.start || null;
    const rtVal = (p) => (p?.rich_text || []).map(x => x.plain_text).join('').trim() || null;

    // 3. PULL — Notion → NeuroAligned (the generated tasks page is excluded)
    const projects = await base44.entities.Project.list('-created_date', 100);
    const tasks = await base44.entities.Task.list('-created_date', 500);
    const naByTitle = new Map(projects.map(p => [(p.name || '').trim().toLowerCase(), p]));

    let pulledCreated = 0;
    let pulledUpdated = 0;
    const createdInApp = [];
    for (const [key, row] of rowsByTitle) {
      if (key === TASKS_PAGE_TITLE.toLowerCase()) continue;
      const p = naByTitle.get(key);
      const nStatus = STATUS_OPTIONS.includes(sel(row.properties.Status)) ? sel(row.properties.Status) : null;
      const nPriority = PRIORITY_OPTIONS.includes(sel(row.properties.Priority)) ? sel(row.properties.Priority) : null;
      const nDue = dateVal(row.properties['Due Date']) || null;
      const nClient = rtVal(row.properties.Client);
      if (!p) {
        await base44.entities.Project.create({
          name: rowTitle(row),
          status: nStatus || 'active',
          priority: nPriority || 'medium',
          due_date: nDue,
          client_name: nClient,
        });
        pulledCreated++;
        createdInApp.push(rowTitle(row));
      } else {
        const changes = {};
        if (nStatus && nStatus !== p.status) changes.status = nStatus;
        if (nPriority && nPriority !== p.priority) changes.priority = nPriority;
        if (nDue && nDue !== p.due_date) changes.due_date = nDue;
        if (nClient && nClient !== (p.client_name || null)) changes.client_name = nClient;
        if (Object.keys(changes).length > 0) {
          await base44.entities.Project.update(p.id, changes);
          pulledUpdated++;
        }
      }
    }

    // Re-read after the pull so the push reflects the merged state
    const merged = await base44.entities.Project.list('-created_date', 200);

    // 4. PUSH — NeuroAligned → Notion (create or update project rows)
    const text = (content) => ({ type: 'text', text: { content } });
    let pushedNew = 0;
    let pushedUpdated = 0;
    const createdInNotion = [];
    for (const p of merged) {
      const name = (p.name || '').trim();
      if (!name) continue;
      const payload = { [titleKey]: { title: [text(name)] } };
      if (STATUS_OPTIONS.includes(p.status)) payload.Status = { select: { name: p.status } };
      if (PRIORITY_OPTIONS.includes(p.priority)) payload.Priority = { select: { name: p.priority } };
      if (p.due_date) payload['Due Date'] = { date: { start: p.due_date } };
      if (p.client_name) payload.Client = { rich_text: [text(p.client_name)] };

      const existing = rowsByTitle.get(name.toLowerCase());
      const res = existing
        ? await fetch(`https://api.notion.com/v1/pages/${existing.id}`, { method: 'PATCH', headers, body: JSON.stringify({ properties: payload }) })
        : await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers,
            body: JSON.stringify({ parent: { type: 'data_source_id', data_source_id: dataSourceId }, properties: payload }),
          });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('Notion page write error:', err?.message || res.status);
        continue;
      }
      if (existing) pushedUpdated++;
      else { pushedNew++; createdInNotion.push(name); }
    }

    // 5. Tasks page — refreshed every run so it mirrors the current task list
    let tasksPushed = 0;
    if (tasks.length > 0) {
      const oldPage = rowsByTitle.get(TASKS_PAGE_TITLE.toLowerCase());
      if (oldPage) {
        await fetch(`https://api.notion.com/v1/pages/${oldPage.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ archived: true }),
        });
      }
      const byStatus = {};
      for (const t of tasks) {
        const s = t.status || 'todo';
        (byStatus[s] = byStatus[s] || []).push(t);
      }
      const labels = { in_progress: 'In Progress', todo: 'To Do', deferred: 'Deferred', done: 'Done' };
      const children = [];
      let counted = 0;
      for (const [status, label] of Object.entries(labels)) {
        const group = byStatus[status] || [];
        if (!group.length || children.length + 1 >= MAX_CHILDREN) continue;
        children.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [text(label)] } });
        for (const t of group) {
          if (children.length >= MAX_CHILDREN) break;
          const suffix = [
            t.due_date ? `due ${t.due_date}` : null,
            t.estimated_minutes ? `${t.estimated_minutes}m` : null,
          ].filter(Boolean).join(' · ');
          children.push({
            object: 'block',
            type: 'to_do',
            to_do: { rich_text: [text(t.title + (suffix ? ` (${suffix})` : ''))], checked: status === 'done' },
          });
          counted++;
        }
      }
      const res = await fetch('https://api.notion.com/v1/pages', {
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

    return Response.json({
      pushed_new: pushedNew,
      pushed_updated: pushedUpdated,
      created_in_notion: createdInNotion,
      pulled_created: pulledCreated,
      pulled_updated: pulledUpdated,
      created_in_app: createdInApp,
      tasks_pushed: tasksPushed,
    });
  } catch (error) {
    console.error('syncProjectsToNotion error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}