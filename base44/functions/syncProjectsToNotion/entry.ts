import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

const CONNECTOR_ID = '6a9c83fae18c151ef517de3b';
const NOTION_VERSION = '2022-06-28';
const TASKS_PAGE_TITLE = 'NeuroAligned Tasks';
const MAX_CHILDREN = 100; // Notion page-create limit

// On-demand push of the user's projects & tasks into a Notion database they
// chose (listNotionDatabases). Projects become pages (created once, never
// duplicated); the "NeuroAligned Tasks" page is refreshed on every run so it
// always mirrors the current task list. User-triggered only — no auto-sync.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const databaseId = String(body.database_id || '').trim();
    if (!databaseId) return Response.json({ error: 'Pick a Notion database first' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    };

    // Verify access to the database and find its title property key
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${encodeURIComponent(databaseId)}`, { headers });
    const db = await dbRes.json();
    if (!dbRes.ok) {
      const msg = db.code === 'object_not_found'
        ? 'Notion database not found — make sure it is shared with the NeuroAligned integration in Notion.'
        : (db.message || 'Could not access the Notion database');
      console.error('Notion database access error:', msg);
      return Response.json({ error: msg }, { status: 400 });
    }
    const titleKey = Object.keys(db.properties || {}).find(k => db.properties[k].type === 'title') || 'Name';

    // Read the user's own data (user token — RLS applies)
    const [projects, tasks] = await Promise.all([
      base44.entities.Project.list('-created_date', 100),
      base44.entities.Task.list('-created_date', 500),
    ]);

    // Existing pages in the database (for duplicate prevention)
    const qRes = await fetch(`https://api.notion.com/v1/databases/${encodeURIComponent(databaseId)}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_size: 100 }),
    });
    const qData = await qRes.json();
    if (!qRes.ok) {
      console.error('Notion query error:', qData.message || qData.code);
      return Response.json({ error: qData.message || 'Could not read the Notion database' }, { status: 400 });
    }
    const pages = qData.results || [];
    const existingTitles = new Set(pages.map(p => pageTitle(p, titleKey)));
    const existingPageIdsByTitle = new Map(pages.map(p => [pageTitle(p, titleKey), p.id]));

    const text = (content) => ({ type: 'text', text: { content } });
    const titleProps = (t) => ({ [titleKey]: { title: [text(t)] } });

    async function createPage(props, children) {
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'database_id', database_id: databaseId },
          properties: props,
          children: children.slice(0, MAX_CHILDREN),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('Notion page create error:', err?.message || res.status);
        return false;
      }
      return true;
    }

    // 1. Project pages — created once; existing pages are left untouched
    let projectsPushed = 0;
    let projectsSkipped = 0;
    const pushedNames = [];
    for (const p of projects) {
      const name = (p.name || '').trim();
      if (!name) continue;
      if (existingTitles.has(name.toLowerCase())) { projectsSkipped++; continue; }
      const children = [];
      if (p.description) {
        children.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [text(p.description)] } });
      }
      const meta = [
        `Status: ${p.status || 'active'}`,
        p.priority ? `Priority: ${p.priority}` : null,
        p.due_date ? `Due: ${p.due_date}` : null,
        p.client_name ? `Client: ${p.client_name}` : null,
      ].filter(Boolean).join(' · ');
      children.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [text(meta)] } });
      const ok = await createPage(titleProps(name), children);
      if (ok) { projectsPushed++; pushedNames.push(name); } else { projectsSkipped++; }
    }

    // 2. Tasks page — refreshed every run so it mirrors the current task list
    let tasksPushed = 0;
    if (tasks.length > 0) {
      const oldPageId = existingPageIdsByTitle.get(TASKS_PAGE_TITLE.toLowerCase());
      if (oldPageId) {
        await fetch(`https://api.notion.com/v1/pages/${oldPageId}`, {
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
      const ok = await createPage(titleProps(TASKS_PAGE_TITLE), children);
      if (ok) tasksPushed = counted;
    }

    return Response.json({
      projects_pushed: projectsPushed,
      projects_skipped: projectsSkipped,
      projects: pushedNames,
      tasks_pushed: tasksPushed,
    });
  } catch (error) {
    console.error('syncProjectsToNotion error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

function pageTitle(page, titleKey) {
  const prop = page.properties?.[titleKey];
  const parts = (prop && (prop.title || prop.rich_text)) || [];
  return parts.map(t => t.plain_text).join('').trim().toLowerCase();
}