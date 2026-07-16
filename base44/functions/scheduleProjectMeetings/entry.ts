import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch active projects
    const projects = await base44.entities.Project.filter({ status: 'active' });

    if (projects.length === 0) {
      return Response.json({ error: 'No active projects to schedule' }, { status: 400 });
    }

    // Sort by priority: high > medium > low, then by due date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    projects.sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });

    // Get calendar events for the next 7 days
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${weekFromNow.toISOString()}&singleEvents=true&orderBy=startTime`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const eventsData = await eventsRes.json();
    if (eventsData.error) {
      return Response.json({ error: eventsData.error.message }, { status: 400 });
    }

    // Build busy slots from existing events
    const busySlots = (eventsData.items || [])
      .filter(e => e.start?.dateTime && e.end?.dateTime)
      .map(e => ({
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
      }));

    // Find free 60-min slots during working hours (9am-5pm weekdays) for the next 7 days
    const sessionMinutes = 60;
    const freeSlots = [];

    for (let d = 0; d < 7; d++) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() + d);
      dayStart.setHours(9, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(17, 0, 0, 0);

      // Skip weekends
      const dayOfWeek = dayStart.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Start from max(day start, now)
      let cursor = new Date(Math.max(dayStart.getTime(), now.getTime()));

      while (cursor.getTime() + sessionMinutes * 60000 <= dayEnd.getTime()) {
        const slotEnd = new Date(cursor.getTime() + sessionMinutes * 60000);

        const isFree = !busySlots.some(busy =>
          cursor < busy.end && slotEnd > busy.start
        );

        if (isFree) {
          freeSlots.push({ start: new Date(cursor), end: new Date(slotEnd) });
        }

        cursor = new Date(cursor.getTime() + 30 * 60000);
      }
    }

    if (freeSlots.length === 0) {
      return Response.json({ error: 'No free 60-minute slots found in the next 7 days (weekdays 9am–5pm)' }, { status: 400 });
    }

    // Schedule meetings for projects (up to 5 or until slots run out)
    const maxMeetings = Math.min(5, projects.length, freeSlots.length);
    const scheduled = [];

    for (let i = 0; i < maxMeetings; i++) {
      const project = projects[i];
      const slot = freeSlots[i];

      const event = {
        summary: `Focus: ${project.name}`,
        description: `Project work session\n\nClient: ${project.client_name || 'N/A'}\nPriority: ${project.priority || 'medium'}\nStatus: ${project.status}${project.due_date ? '\nDue: ' + project.due_date : ''}\n\nNotes:\n${project.notes || 'No notes'}`,
        start: { dateTime: slot.start.toISOString() },
        end: { dateTime: slot.end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `proj-${project.id}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      const created = await createRes.json();

      if (created.error) {
        scheduled.push({ project: project.name, error: created.error.message });
      } else {
        const meetLink = created.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;
        scheduled.push({
          project: project.name,
          start: slot.start.toISOString(),
          link: created.htmlLink,
          meet_link: meetLink,
        });
      }
    }

    return Response.json({
      success: true,
      scheduled_count: scheduled.filter(s => !s.error).length,
      slots_found: freeSlots.length,
      scheduled,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});