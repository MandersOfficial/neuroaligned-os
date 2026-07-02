import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';

function nextDay(dueDate) {
  const [y, m, d] = dueDate.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start.getTime() + 86400000);
  return end.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { dryRun } = await req.json().catch(() => ({}));

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch the user's projects that have a due date
    const allProjects = await base44.entities.Project.filter({});
    const projects = allProjects.filter(p => p.due_date);

    // Fetch existing NeuroAligned calendar events to avoid duplicates
    const existingRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sharedExtendedProperties=neuroaligned%3Dtrue&maxResults=2500', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const existingData = await existingRes.json();
    if (existingData.error) {
      return Response.json({ error: existingData.error.message }, { status: 400 });
    }

    const eventByProject = new Map();
    for (const ev of existingData.items || []) {
      const pid = ev.extendedProperties?.shared?.projectId;
      if (pid) eventByProject.set(pid, ev.id);
    }

    if (dryRun) {
      return Response.json({
        success: true,
        connected: true,
        dueCount: projects.length,
        skipped: allProjects.length - projects.length,
        existingCount: eventByProject.size,
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          due_date: p.due_date,
          status: p.status,
          priority: p.priority,
          client_name: p.client_name,
        })),
      });
    }

    const results = [];
    for (const project of projects) {
      const description = [
        'Project deadline',
        project.description,
        project.client_name ? `Client: ${project.client_name}` : null,
        project.priority ? `Priority: ${project.priority}` : null,
        project.status ? `Status: ${project.status}` : null,
        project.notes ? `Notes: ${project.notes.slice(0, 1500)}` : null,
      ].filter(Boolean).join('\n\n');

      const body = {
        summary: `Deadline: ${project.name}`,
        description,
        start: { date: project.due_date },
        end: { date: nextDay(project.due_date) },
        extendedProperties: {
          shared: { neuroaligned: 'true', projectId: project.id },
        },
      };

      const existingId = eventByProject.get(project.id);
      try {
        if (existingId) {
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.error) {
            results.push({ name: project.name, action: 'error', error: data.error.message });
          } else {
            results.push({ name: project.name, action: 'updated' });
          }
        } else {
          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.error) {
            results.push({ name: project.name, action: 'error', error: data.error.message });
          } else {
            results.push({ name: project.name, action: 'created' });
          }
        }
      } catch (e) {
        results.push({ name: project.name, action: 'error', error: e.message });
      }
    }

    const synced = results.filter(r => r.action !== 'error').length;
    const created = results.filter(r => r.action === 'created').length;
    const updated = results.filter(r => r.action === 'updated').length;
    const errors = results.filter(r => r.action === 'error');
    const skipped = allProjects.length - projects.length;

    return Response.json({ success: true, synced, created, updated, skipped, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});