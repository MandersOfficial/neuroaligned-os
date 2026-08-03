import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';

function nextDay(dueDate) {
  const [y, m, d] = dueDate.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start.getTime() + 86400000);
  return end.toISOString().split('T')[0];
}

// --- Timezone-aware helpers for task focus blocks ---

function localNoonOffsetMinutes(dateStr, tz) {
  try {
    const dt = new Date(dateStr + 'T12:00:00Z');
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    const parts = fmt.formatToParts(dt);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    const m = tzName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    const hours = parseInt(m[2], 10);
    const minutes = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  } catch {
    return 0;
  }
}

function localToUTC(dateStr, hours, minutes, tz) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const offsetMin = localNoonOffsetMinutes(dateStr, tz);
  return new Date(Date.UTC(y, m - 1, d, hours, minutes) - offsetMin * 60000);
}

function toLocalDateStr(date, tz) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(date);
}

function findFreeSlot(busyIntervals, dateStr, tz, durationMin) {
  const dayStart = localToUTC(dateStr, 9, 0, tz);
  const dayEnd = localToUTC(dateStr, 18, 0, tz);
  let cursor = dayStart;
  const sorted = [...busyIntervals].sort((a, b) => a.start - b.start);
  for (const iv of sorted) {
    if (iv.end <= cursor) continue;
    if (iv.start >= dayEnd) break;
    if (iv.start - cursor >= durationMin * 60000) {
      return { start: cursor, end: new Date(cursor.getTime() + durationMin * 60000) };
    }
    if (iv.end > cursor) cursor = iv.end;
  }
  if (dayEnd - cursor >= durationMin * 60000) {
    return { start: cursor, end: new Date(cursor.getTime() + durationMin * 60000) };
  }
  return null;
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

    // Fetch open tasks that have an estimate + due date
    const allTasks = await base44.entities.Task.filter({});
    const schedulableTasks = allTasks.filter(t =>
      (t.status === 'todo' || t.status === 'in_progress') &&
      t.estimated_minutes && t.estimated_minutes > 0 &&
      t.due_date
    );

    // Fetch existing NeuroAligned calendar events to avoid duplicates
    const existingRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sharedExtendedProperties=neuroaligned%3Dtrue&maxResults=2500', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const existingData = await existingRes.json();
    if (existingData.error) {
      return Response.json({ error: existingData.error.message }, { status: 400 });
    }

    const eventByProject = new Map();
    const eventByTask = new Map();
    for (const ev of existingData.items || []) {
      const pid = ev.extendedProperties?.shared?.projectId;
      if (pid) eventByProject.set(pid, ev);
      const tid = ev.extendedProperties?.shared?.taskId;
      if (tid) eventByTask.set(tid, ev);
    }

    if (dryRun) {
      return Response.json({
        success: true,
        connected: true,
        dueCount: projects.length,
        skipped: allProjects.length - projects.length,
        existingCount: eventByProject.size,
        projects: projects.map(p => {
          const ev = eventByProject.get(p.id);
          const meetLink = ev?.hangoutLink || ev?.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || null;
          return {
            id: p.id,
            name: p.name,
            due_date: p.due_date,
            status: p.status,
            priority: p.priority,
            client_name: p.client_name,
            meetLink,
            onCalendar: !!ev,
          };
        }),
        tasks: schedulableTasks.map(t => {
          const ev = eventByTask.get(t.id);
          return {
            id: t.id,
            title: t.title,
            due_date: t.due_date,
            estimated_minutes: t.estimated_minutes,
            energy_required: t.energy_required,
            onCalendar: !!ev,
            scheduledFor: ev?.start?.dateTime || null,
          };
        }),
        taskCount: schedulableTasks.length,
        taskOnCalendar: eventByTask.size,
      });
    }

    // --- Project deadline sync ---
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

      const existingEvent = eventByProject.get(project.id);
      const hasMeet = existingEvent?.conferenceData?.entryPoints?.some(ep => ep.entryPointType === 'video')
        || existingEvent?.hangoutLink;

      const body = {
        summary: `Deadline: ${project.name}`,
        description,
        start: { date: project.due_date },
        end: { date: nextDay(project.due_date) },
        extendedProperties: {
          shared: { neuroaligned: 'true', projectId: project.id },
        },
        conferenceData: hasMeet
          ? existingEvent.conferenceData
          : {
              createRequest: {
                requestId: `${project.id}-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
      };

      const meetLink = (d) => d?.hangoutLink || d?.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || null;

      try {
        if (existingEvent) {
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEvent.id}?conferenceDataVersion=1`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.error) {
            results.push({ name: project.name, action: 'error', error: data.error.message });
          } else {
            results.push({ name: project.name, action: 'updated', meetLink: meetLink(data) });
          }
        } else {
          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.error) {
            results.push({ name: project.name, action: 'error', error: data.error.message });
          } else {
            results.push({ name: project.name, action: 'created', meetLink: meetLink(data) });
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

    // --- Task focus blocks ---
    const taskResults = [];
    let taskCreated = 0, taskUpdated = 0, taskSkipped = 0, taskNoSlot = 0, taskErrors = [];

    if (schedulableTasks.length > 0) {
      // Resolve calendar timezone for correct local-day math
      let calTz = 'UTC';
      try {
        const calMeta = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const calMetaJson = await calMeta.json();
        if (calMetaJson.timeZone) calTz = calMetaJson.timeZone;
      } catch {}

      const dueDates = schedulableTasks.map(t => t.due_date).sort();
      const minDate = dueDates[0];
      const maxDate = dueDates[dueDates.length - 1];
      const rangeStart = localToUTC(minDate, 0, 0, calTz);
      const [my, mm, md] = maxDate.split('-').map(Number);
      const rangeEnd = new Date(Date.UTC(my, mm - 1, md) + 86400000);

      // Fetch all timed events in the range to build busy intervals per day
      const busyRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(rangeStart.toISOString())}&timeMax=${encodeURIComponent(rangeEnd.toISOString())}&singleEvents=true&maxResults=2500`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const busyData = await busyRes.json();

      const busyByDate = new Map();
      for (const ev of busyData.items || []) {
        if (!ev.start?.dateTime) continue;
        if (ev.extendedProperties?.shared?.taskId) continue; // skip our own task blocks
        const start = new Date(ev.start.dateTime);
        const end = new Date(ev.end?.dateTime || ev.start.dateTime);
        const dateStr = toLocalDateStr(start, calTz);
        if (!busyByDate.has(dateStr)) busyByDate.set(dateStr, []);
        busyByDate.get(dateStr).push({ start, end });
      }

      for (const task of schedulableTasks) {
        const existingTaskEv = eventByTask.get(task.id);
        const busy = busyByDate.get(task.due_date) || [];
        const duration = Math.min(Math.max(task.estimated_minutes, 15), 120);
        const slot = findFreeSlot(busy, task.due_date, calTz, duration);

        if (!slot) {
          taskNoSlot++;
          taskResults.push({ name: task.title, action: 'no_slot', due_date: task.due_date });
          continue;
        }

        const body = {
          summary: `Focus: ${task.title}`,
          description: [
            'NeuroAligned focus block — auto-scheduled',
            task.description ? task.description.slice(0, 1000) : null,
            task.energy_required ? `Energy: ${task.energy_required}` : null,
            task.category ? `Category: ${task.category}` : null,
            `Est: ${task.estimated_minutes} min`,
          ].filter(Boolean).join('\n\n'),
          start: { dateTime: slot.start.toISOString() },
          end: { dateTime: slot.end.toISOString() },
          extendedProperties: {
            shared: { neuroaligned: 'true', taskId: task.id },
          },
        };

        try {
          if (existingTaskEv) {
            const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingTaskEv.id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.error) {
              taskResults.push({ name: task.title, action: 'error', error: data.error.message });
            } else {
              taskResults.push({ name: task.title, action: 'updated', scheduledFor: slot.start.toISOString() });
              taskUpdated++;
            }
          } else {
            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.error) {
              taskResults.push({ name: task.title, action: 'error', error: data.error.message });
            } else {
              taskResults.push({ name: task.title, action: 'created', scheduledFor: slot.start.toISOString() });
              taskCreated++;
            }
          }
          // Prevent overlapping blocks on the same day within this run
          if (!busyByDate.has(task.due_date)) busyByDate.set(task.due_date, []);
          busyByDate.get(task.due_date).push({ start: slot.start, end: slot.end });
        } catch (e) {
          taskResults.push({ name: task.title, action: 'error', error: e.message });
        }
      }
      taskErrors = taskResults.filter(r => r.action === 'error');
      taskSkipped = taskNoSlot;
    }

    return Response.json({
      success: true,
      synced,
      created,
      updated,
      skipped,
      results,
      errors,
      tasksSynced: taskCreated + taskUpdated,
      tasksCreated: taskCreated,
      tasksUpdated: taskUpdated,
      tasksNoSlot: taskNoSlot,
      taskResults,
      taskErrors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});