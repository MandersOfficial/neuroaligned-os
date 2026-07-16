import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a58c092588cac2ae027fd72';

const PRIORITY_MAP = { high: 2, medium: 3, low: 4 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { list_id } = await req.json().catch(() => ({}));
    if (!list_id) return Response.json({ error: 'Missing list_id' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': accessToken, 'Content-Type': 'application/json' };

    // Get active projects with due dates
    const projects = await base44.entities.Project.filter({ status: 'active' });
    const withDeadlines = projects.filter(p => p.due_date);

    if (withDeadlines.length === 0) {
      return Response.json({
        synced: 0,
        total_projects: projects.length,
        message: 'No active projects with due dates found.',
      });
    }

    const results = [];

    for (const project of withDeadlines) {
      const dueTimestamp = new Date(project.due_date + 'T09:00:00').getTime();

      const body = {
        name: project.name,
        description: [
          project.description ? project.description + '\n\n' : '',
          project.client_name ? `Client: ${project.client_name}\n` : '',
          project.client_email ? `Client Email: ${project.client_email}\n` : '',
          project.notes ? `\nNotes:\n${project.notes}\n` : '',
        ].join('').trim(),
        due_date: String(dueTimestamp),
        priority: PRIORITY_MAP[project.priority] || 3,
        status: 'to do',
        tags: ['NeuroAligned'],
      };

      const taskRes = await fetch(`https://api.clickup.com/api/v2/list/${list_id}/task`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(body),
      });
      const taskData = await taskRes.json();

      if (taskData.err || taskData.error) {
        results.push({
          project: project.name,
          due_date: project.due_date,
          success: false,
          error: taskData.err || taskData.error,
        });
      } else {
        results.push({
          project: project.name,
          due_date: project.due_date,
          success: true,
          task_id: taskData.id,
          task_url: taskData.url,
          priority: project.priority,
        });
      }
    }

    const synced = results.filter(r => r.success).length;

    return Response.json({
      synced,
      total: results.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});