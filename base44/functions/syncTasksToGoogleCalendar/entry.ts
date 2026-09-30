import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/** Google all-day events are half-open: the end date is the day *after* the last day. */
function dayAfter(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

function buildEvent(task) {
  const details = [
    task.description,
    task.category ? `Category: ${task.category.replace(/_/g, ' ')}` : null,
    task.energy_required ? `Energy: ${task.energy_required}` : null,
    task.estimated_minutes ? `Estimated: ${task.estimated_minutes} min` : null,
    '— Synced from NeuroAligned OS',
  ].filter(Boolean);

  return {
    summary: task.title,
    description: details.join('\n'),
    start: { date: task.due_date },
    end: { date: dayAfter(task.due_date) },
  };
}

/**
 * Pushes the member's own open tasks onto their Google Calendar as all-day
 * events on each task's due date. The Google event id is stored back on the
 * task so re-syncing updates the same event instead of duplicating it.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    // RLS scopes this to the member's own tasks; we only want dated, unfinished work.
    const page = await base44.entities.Task.filter(
      { status: { $ne: 'done' }, due_date: { $exists: true } },
      { limit: 500 }
    );
    const tasks = (page?.items || page || []).filter(t => t.due_date);

    if (tasks.length === 0) {
      return Response.json({
        success: true,
        created: 0,
        updated: 0,
        total: 0,
        message: 'No tasks with a due date to sync yet.',
      });
    }

    const results = [];
    let created = 0;
    let updated = 0;

    for (const task of tasks) {
      const event = buildEvent(task);
      try {
        // Already linked — update it in place so we never duplicate an event.
        if (task.google_event_id) {
          const res = await fetch(`${CALENDAR_API}/${task.google_event_id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(event),
          });

          if (res.ok) {
            updated++;
            results.push({ title: task.title, action: 'updated' });
            continue;
          }

          // 404 means it was deleted in Google — fall through and recreate it.
          if (res.status !== 404) {
            const err = await res.json().catch(() => ({}));
            results.push({ title: task.title, success: false, error: err?.error?.message || `HTTP ${res.status}` });
            continue;
          }
        }

        const createRes = await fetch(CALENDAR_API, {
          method: 'POST',
          headers,
          body: JSON.stringify(event),
        });
        const createData = await createRes.json();

        if (!createRes.ok) {
          results.push({ title: task.title, success: false, error: createData?.error?.message || `HTTP ${createRes.status}` });
          continue;
        }

        await base44.entities.Task.update(task.id, { google_event_id: createData.id });
        created++;
        results.push({
          title: task.title,
          success: true,
          action: 'created',
          due_date: task.due_date,
          event_url: createData.htmlLink || null,
        });
      } catch (taskErr) {
        results.push({ title: task.title, success: false, error: taskErr.message });
      }
    }

    return Response.json({
      success: true,
      created,
      updated,
      synced: created + updated,
      total: tasks.length,
      results,
      message: `Synced ${created + updated} of ${tasks.length} task(s) to Google Calendar.`,
    });
  } catch (error) {
    // Surfaced to the member as "not connected" when the OAuth grant is missing.
    return Response.json({ error: error.message }, { status: 500 });
  }
}