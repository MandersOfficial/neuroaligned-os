import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '69fd1eef9864033b48130ab1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch all projects with due dates
    const projects = await base44.entities.Project.list('-created_date', 200);
    const withDueDates = projects.filter(p => p.due_date && p.status !== 'completed' && p.status !== 'archived');

    if (withDueDates.length === 0) {
      return Response.json({ success: true, synced: 0, message: 'No active projects with due dates found.' });
    }

    // Get the default task list
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const listsData = await listsRes.json();
    if (listsData.error) {
      return Response.json({ error: listsData.error.message }, { status: 400 });
    }
    const taskListId = (listsData.items && listsData.items.length > 0)
      ? listsData.items[0].id
      : '@default';

    let synced = 0;
    const errors = [];

    for (const project of withDueDates) {
      // Due date needs to be at the end of that day (RFC 3339)
      const dueDate = new Date(project.due_date + 'T23:59:59');

      const task = {
        title: `${project.emoji || '📁'} ${project.name}`,
        notes: `Project: ${project.name}\nClient: ${project.client_name || 'N/A'}\nPriority: ${project.priority || 'medium'}\nStatus: ${project.status}\nDue: ${project.due_date}${project.notes ? '\n\nNotes:\n' + project.notes : ''}`,
        due: dueDate.toISOString(),
      };

      const createRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const createData = await createRes.json();
      if (createData.error) {
        errors.push({ project: project.name, error: createData.error.message });
      } else {
        synced++;
      }
    }

    return Response.json({
      success: true,
      synced,
      total: withDueDates.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});