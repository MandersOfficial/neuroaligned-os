import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a68111b02df29e55f1a16d1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${future.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const eventsData = await eventsRes.json();
    if (eventsData.error) {
      return Response.json({ error: eventsData.error.message }, { status: 400 });
    }

    const meetings = (eventsData.items || [])
      .filter(e => e.hangoutLink || e.conferenceData?.entryPoints?.some(ep => ep.entryPointType === 'video'))
      .map(e => {
        const meetLink = e.hangoutLink
          || e.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri
          || null;
        const start = e.start?.dateTime || e.start?.date;
        const end = e.end?.dateTime || e.end?.date;
        return {
          id: e.id,
          title: e.summary || '(No title)',
          start,
          end,
          meet_link: meetLink,
          event_link: e.htmlLink || null,
          attendees: (e.attendees || []).map(a => a.email),
        };
      });

    return Response.json({
      success: true,
      meetings,
      count: meetings.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});