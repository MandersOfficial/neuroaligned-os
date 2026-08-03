import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, duration_minutes } = await req.json().catch(() => ({}));

    if (!project_id) {
      return Response.json({ error: 'Missing project_id' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const project = await base44.entities.Project.get(project_id);

    const now = new Date();
    const end = new Date(now.getTime() + ((duration_minutes || 30) * 60000));

    const event = {
      summary: `Project Sync: ${project.name}`,
      description: `Project sync meeting\n\nProject: ${project.name}\nClient: ${project.client_name || 'N/A'}\nPriority: ${project.priority || 'medium'}\nStatus: ${project.status}${project.due_date ? '\nDue: ' + project.due_date : ''}\n\nNotes:\n${project.notes || 'No notes'}`,
      start: { dateTime: now.toISOString() },
      end: { dateTime: end.toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `sync-${project.id}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    const meetLink = data.hangoutLink
      || data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri
      || null;

    return Response.json({
      success: true,
      meet_link: meetLink,
      event_link: data.htmlLink || null,
      project_name: project.name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});