import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6aa063064d9baaa5807a360c';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': `Bearer ${accessToken}` };

    // Cursor-paginated fetch of the user's Todoist projects
    const projects = [];
    let cursor = null;
    do {
      const url = new URL('https://api.todoist.com/api/v1/projects');
      url.searchParams.set('limit', '50');
      if (cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url, { headers: authHeader });
      const data = await res.json();
      if (data.error) return Response.json({ error: data.error }, { status: 400 });
      projects.push(...(data.results || []));
      cursor = data.next_cursor;
    } while (cursor);

    return Response.json({
      projects: projects.map(p => ({ id: p.id, name: p.name, is_inbox: !!p.is_inbox })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});