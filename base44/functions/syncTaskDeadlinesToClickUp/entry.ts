import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a58c092588cac2ae027fd72';
// Tag identifying ClickUp tasks that belong to a NeuroAligned task sync
const SYNC_TAG = 'NeuroAligned Task';
const ENERGY_PRIORITY = { high: 2, medium: 3, low: 4 };
const MAX_LIST_PAGES = 20;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { list_id } = await req.json().catch(() => ({}));
    if (!list_id) return Response.json({ error: 'Missing list_id' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': accessToken, 'Content-Type': 'application/json' };

    // NeuroAligned tasks that carry a due date (their workflow schedule)
    const tasks = await base44.entities.Task.filter({});
    const scheduled = tasks.filter(t => t.due_date && t.status !== 'done');

    if (scheduled.length === 0) {
      return Response.json({
        synced: 0, created: 0, updated: 0, total: 0, results: [],
        message: 'No tasks with due dates found.',
      });
    }

    // Find ClickUp tasks in this list that a previous sync created, so
    // re-syncing updates them instead of creating duplicates.
    const existingByName = new Map();
    for (let page = 0; page < MAX_LIST_PAGES; page++) {
      const res = await fetch(`https://api.clickup.com/api/v2/list/${list_id}/task?page=${page}`, { headers: authHeader });
      const data = await res.json();
      if (data.err || data.error) return Response.json({ error: data.err || data.error }, { status: 400 });
      const pageTasks = data.tasks || [];
      if (pageTasks.length === 0) break;
      for (const t of pageTasks) {
        const tagNames = (t.tags || []).map(tag => typeof tag === 'string' ? tag : tag?.name);
        if (tagNames.includes(SYNC_TAG)) existingByName.set(t.name, t.id);
      }
    }

    const results = [];
    let created = 0;
    let updated = 0;

    for (const task of scheduled) {
      const dueTimestamp = new Date(task.due_date + 'T09:00:00').getTime();
      const existingId = existingByName.get(task.title);

      if (existingId) {
        // Refresh the deadline + priority on the existing ClickUp task
        const updateRes = await fetch(`https://api.clickup.com/api/v2/task/${existingId}`, {
          method: 'PUT',
          headers: authHeader,
          body: JSON.stringify({
            due_date: String(dueTimestamp),
            priority: ENERGY_PRIORITY[task.energy_required] || 3,
          }),
        });
        const data = await updateRes.json();

        if (data.err || data.error) {
          results.push({ task: task.title, due_date: task.due_date, success: false, error: data.err || data.error });
        } else {
          updated += 1;
          results.push({ task: task.title, due_date: task.due_date, success: true, action: 'updated', task_id: data.id, task_url: data.url });
        }
      } else {
        // First sync for this task: create it in the list
        const description = [
          'Synced from NeuroAligned',
          task.estimated_minutes ? `\nEstimate: ${task.estimated_minutes} min` : '',
          task.category ? `\nCategory: ${task.category.replace(/_/g, ' ')}` : '',
        ].join('');

        const createRes = await fetch(`https://api.clickup.com/api/v2/list/${list_id}/task`, {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({
            name: task.title,
            description,
            due_date: String(dueTimestamp),
            priority: ENERGY_PRIORITY[task.energy_required] || 3,
            status: 'to do',
            tags: [SYNC_TAG],
          }),
        });
        const data = await createRes.json();

        if (data.err || data.error) {
          results.push({ task: task.title, due_date: task.due_date, success: false, error: data.err || data.error });
        } else {
          created += 1;
          results.push({ task: task.title, due_date: task.due_date, success: true, action: 'created', task_id: data.id, task_url: data.url });
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
    console.error('syncTaskDeadlinesToClickUp failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});