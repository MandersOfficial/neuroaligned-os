import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Maps Google Calendar event status → project status
const STATUS_MAP = {
  confirmed: 'active',
  tentative: 'paused',
  cancelled: 'archived',
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // Validate this is a genuine Google Calendar push notification
    const resourceState = body.data?._provider_meta?.['x-goog-resource-state'];
    if (!resourceState) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Initial webhook handshake — ack only
    if (resourceState === 'sync') return Response.json({ status: 'sync_ack' });

    // Shared connection (builder's calendar) — platform authenticates the call
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load persisted sync token for incremental sync
    const existing = await base44.asServiceRole.entities.SyncState.list();
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      url += '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });
    if (res.status === 410) {
      // syncToken expired — fresh sync
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100'
        + '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }
    if (!res.ok) {
      return Response.json({ status: 'api_error' }, { status: 502 });
    }

    // Drain all pages — nextSyncToken only appears on the last page
    const allItems = [];
    let pageData = await res.json();
    let newSyncToken = null;
    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;
      const nextRes = await fetch(url + `&pageToken=${pageData.nextPageToken}`, { headers: authHeader });
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    // Process changed events — only those tagged as NeuroAligned deadline events
    const results = [];
    for (const ev of allItems) {
      const projectId = ev.extendedProperties?.shared?.projectId;
      if (!projectId) continue;

      try {
        const project = await base44.asServiceRole.entities.Project.get(projectId);
        if (!project) continue;

        const updates = {};
        if (ev.status && STATUS_MAP[ev.status]) {
          updates.status = STATUS_MAP[ev.status];
        }
        if (ev.start?.date) {
          updates.due_date = ev.start.date;
        } else if (ev.start?.dateTime) {
          updates.due_date = ev.start.dateTime.split('T')[0];
        }

        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.Project.update(projectId, updates);
          results.push({ updated: true });
        }
      } catch {
        results.push({ updated: false });
      }
    }

    // Persist the new sync token AFTER successful processing
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, { sync_token: newSyncToken });
      } else {
        await base44.asServiceRole.entities.SyncState.create({ sync_token: newSyncToken });
      }
    }

    return Response.json({ status: 'processed', count: results.length });
  } catch (error) {
    return Response.json({ status: 'error' }, { status: 500 });
  }
});