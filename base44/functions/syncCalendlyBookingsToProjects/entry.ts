import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CALENDLY_CONNECTOR_ID = '6a88338fe746048ca65ac142';
const LOOKBACK_DAYS = 7;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CALENDLY_CONNECTOR_ID);

    // Resolve the current Calendly user (needed to scope scheduled_events).
    const meRes = await fetch('https://api.calendly.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    if (!meData.resource) {
      return Response.json({ error: 'Could not fetch Calendly user', detail: meData }, { status: 400 });
    }
    const userUri = meData.resource.uri;

    // Pull active scheduled events from the last LOOKBACK_DAYS (Calendly caps ranges at 7 days).
    const now = new Date();
    const minStart = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 3600 * 1000).toISOString();
    const maxStart = now.toISOString();

    const events = [];
    let nextUrl = `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&min_start_time=${encodeURIComponent(minStart)}&max_start_time=${encodeURIComponent(maxStart)}`;
    let pageCount = 0;
    while (nextUrl && pageCount < 10) {
      const res = await fetch(nextUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.error) {
        return Response.json({ error: data.error.message || 'Calendly API error', detail: data }, { status: 400 });
      }
      for (const e of data.collection || []) events.push(e);
      nextUrl = data.pagination?.next_page || null;
      pageCount++;
    }

    // Index existing projects by name for idempotent match-or-create.
    const projects = await base44.entities.Project.list('-created_date', 200);
    const byName = new Map();
    for (const p of projects) {
      if (p.name) byName.set(p.name.trim().toLowerCase(), p);
    }

    const updated = [];
    const created = [];

    for (const ev of events) {
      const name = (ev.name || 'Calendly Meeting').trim();
      const dueDate = ev.start_time ? ev.start_time.slice(0, 10) : null;
      if (!dueDate) continue;

      const existing = byName.get(name.toLowerCase());
      if (existing) {
        await base44.entities.Project.update(existing.id, { due_date: dueDate });
        updated.push({ name, due_date: dueDate });
      } else {
        const proj = await base44.entities.Project.create({ name, due_date: dueDate, status: 'active' });
        byName.set(name.toLowerCase(), proj);
        created.push({ name, due_date: dueDate });
      }
    }

    return Response.json({
      success: true,
      scanned: events.length,
      updated: updated.length,
      created: created.length,
      updatedDetails: updated,
      createdDetails: created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}