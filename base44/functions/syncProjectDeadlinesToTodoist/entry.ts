import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6aa063064d9baaa5807a360c';
// Marker identifying Todoist tasks created by a NeuroAligned sync
const SYNC_MARKER = 'Synced from NeuroAligned';
const PRIORITY_MAP = { high: 4, medium: 2, low: 1 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id } = await req.json().catch(() => ({}));
    if (!project_id) return Response.json({ error: 'Missing project_id' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Active NeuroAligned projects with a due date
    const projects = await base44.entities.Project.filter({ status: 'active' });
    const withDeadlines = projects.filter(p => p.due_date);

    if (withDeadlines.length === 0) {
      return Response.json({ synced: 0, total: 0, results: [], message: 'No active projects with due dates found.' });
    }

    // Find Todoist tasks in the target project that a previous sync created,
    // so re-syncing updates them instead of creating duplicates.
    const existingByContent = new Map();
    let cursor = null;
    do {
      const url = new URL('https://api.todoist.com/api/v1/tasks');
      url.searchParams.set('project_id', project_id);
      url.searchParams.set('limit', '100');
      if (cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url, { headers: authHeader });
      const data = await res.json();
      if (data.error) return Response.json({ error: data.error }, { status: 400 });
      for (const t of data.results || []) {
        if ((t.description || '').includes(SYNC_MARKER)) existingByContent.set(t.content, t.id);
      }
      cursor = data.next_cursor;
    } while (cursor);

    const results = [];
    let created = 0;
    let updated = 0;

    for (const project of withDeadlines) {
      const existingId = existingByContent.get(project.name);
      const priority = PRIORITY_MAP[project.priority] || 2;

      if (existingId) {
        // Refresh the deadline + priority on the existing Todoist task
        const res = await fetch(`https://api.todoist.com/api/v1/tasks/${existingId}`, {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({ due_date: project.due_date, priority }),
        });
        const data = await res.json();
        if (data.error) {
          results.push({ project: project.name, due_date: project.due_date, success: false, error: data.error });
        } else {
          updated += 1;
          results.push({ project: project.name, due_date: project.due_date, success: true, action: 'updated', task_id: data.id });
        }
      } else {
        // First sync for this project: create the Todoist task
        const description = [
          SYNC_MARKER,
          project.client_name ? `\nClient: ${project.client_name}` : '',
          project.client_email ? `\nClient Email: ${project.client_email}` : '',
          project.description ? `\n\n${project.description}` : '',
          project.notes ? `\nNotes:\n${project.notes}` : '',
        ].join('');

        const res = await fetch('https://api.todoist.com/api/v1/tasks', {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({
            content: project.name,
            description,
            due_date: project.due_date,
            priority,
            project_id,
          }),
        });
        const data = await res.json();
        if (data.error) {
          results.push({ project: project.name, due_date: project.due_date, success: false, error: data.error });
        } else {
          created += 1;
          results.push({ project: project.name, due_date: project.due_date, success: true, action: 'created', task_id: data.id, task_url: data.url });
        }
      }
    }

    return Response.json({
      synced: created + updated,
      created,
      updated,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('syncProjectDeadlinesToTodoist failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});