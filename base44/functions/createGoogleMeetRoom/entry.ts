import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CALENDAR_CONNECTOR_ID = '6a68111b02df29e55f1a16d1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomName, durationMinutes } = await req.json().catch(() => ({}));

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CALENDAR_CONNECTOR_ID);

    const now = new Date();
    const end = new Date(now.getTime() + ((durationMinutes || 25) * 60000));

    const body = {
      summary: `Focus Room: ${roomName || 'Body Doubling Session'}`,
      description: 'NeuroAligned body-doubling focus room. Work alongside others for accountability.',
      start: { dateTime: now.toISOString() },
      end: { dateTime: end.toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `focus-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    const meetLink = data.hangoutLink
      || data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri
      || null;

    return Response.json({ success: true, meetLink, eventId: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});