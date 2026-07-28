import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a68111b02df29e55f1a16d1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch all tasks and filter those with upcoming deadlines
    const allTasks = await base44.entities.Task.filter({});
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = allTasks
      .filter(t => t.due_date && t.status !== 'done')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    if (tasks.length === 0) {
      return Response.json({ error: 'No upcoming task deadlines found' }, { status: 400 });
    }

    // Get calendar events for the next 21 days to find free slots
    const now = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 21);

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${horizon.toISOString()}&singleEvents=true&orderBy=startTime`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const eventsData = await eventsRes.json();
    if (eventsData.error) {
      return Response.json({ error: eventsData.error.message }, { status: 400 });
    }

    const busySlots = (eventsData.items || [])
      .filter(e => e.start?.dateTime && e.end?.dateTime)
      .map(e => ({
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
      }));

    const scheduled = [];
    const maxTasks = Math.min(8, tasks.length);

    for (let i = 0; i < maxTasks; i++) {
      const task = tasks[i];
      const dueDate = new Date(task.due_date + 'T00:00:00');
      const slot = findFreeSlotBeforeDeadline(busySlots, now, dueDate);

      if (!slot) {
        scheduled.push({ task: task.title, due_date: task.due_date, error: 'No free slot found before deadline' });
        continue;
      }

      const event = {
        summary: `Deadline Call: ${task.title}`,
        description: `Video call to review/complete task before deadline.\n\nTask: ${task.title}\nDue: ${task.due_date}\nStatus: ${task.status}${task.description ? '\n\nDescription:\n' + task.description : ''}`,
        start: { dateTime: slot.start.toISOString() },
        end: { dateTime: slot.end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `task-${task.id}-${Date.now()}`,
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
        scheduled.push({ task: task.title, due_date: task.due_date, error: created.error.message });
      } else {
        const meetLink = created.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;
        scheduled.push({
          task: task.title,
          due_date: task.due_date,
          start: slot.start.toISOString(),
          link: created.htmlLink,
          meet_link: meetLink,
        });
      }
    }

    return Response.json({
      success: true,
      scheduled_count: scheduled.filter(s => !s.error).length,
      total_deadlines: tasks.length,
      scheduled,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function findFreeSlotBeforeDeadline(busySlots, now, dueDate) {
  const sessionMinutes = 30;
  // Try 1-7 days before the deadline
  for (let daysBefore = 1; daysBefore <= 7; daysBefore++) {
    const targetDay = new Date(dueDate);
    targetDay.setDate(targetDay.getDate() - daysBefore);
    targetDay.setHours(9, 0, 0, 0);

    const dayEnd = new Date(targetDay);
    dayEnd.setHours(17, 0, 0, 0);

    // Skip weekends
    const dayOfWeek = targetDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Skip past days
    if (dayEnd <= now) continue;

    let cursor = new Date(Math.max(targetDay.getTime(), now.getTime()));

    while (cursor.getTime() + sessionMinutes * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + sessionMinutes * 60000);

      const isFree = !busySlots.some(busy =>
        cursor < busy.end && slotEnd > busy.start
      );

      if (isFree) {
        return { start: new Date(cursor), end: new Date(slotEnd) };
      }

      cursor = new Date(cursor.getTime() + 30 * 60000);
    }
  }
  return null;
}