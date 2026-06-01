import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notion_database_id } = await req.json();
    if (!notion_database_id) {
      return Response.json({ error: 'Missing notion_database_id' }, { status: 400 });
    }

    // Get the user's Notion OAuth access token
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a1cfa4c8db502aafb000e1a');

    // Fetch only the user's ACTIVE projects
    const allProjects = await base44.entities.Project.filter({ status: 'active' });

    const results = [];
    for (const project of allProjects) {
      // Check if a page for this project already exists in Notion
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'NeuroAligned ID',
            rich_text: { equals: project.id },
          },
        }),
      });

      const searchData = await searchRes.json();
      const existing = searchData.results?.[0];

      const properties = {
        'Name': { title: [{ text: { content: project.name || 'Untitled' } }] },
        'Status': { select: { name: project.status || 'active' } },
        'Priority': { select: { name: project.priority || 'medium' } },
        'Client': { rich_text: [{ text: { content: project.client_name || '' } }] },
        'NeuroAligned ID': { rich_text: [{ text: { content: project.id } }] },
      };

      if (project.due_date) {
        properties['Due Date'] = { date: { start: project.due_date } };
      }

      if (project.notes) {
        properties['Notes'] = { rich_text: [{ text: { content: project.notes.slice(0, 2000) } }] };
      }

      if (existing) {
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });
        const patchData = await patchRes.json();
        if (patchData.object === 'error') {
          results.push({ name: project.name, action: 'error', error: patchData.message });
        } else {
          results.push({ name: project.name, action: 'updated' });
        }
      } else {
        const createRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: notion_database_id },
            properties,
          }),
        });
        const createData = await createRes.json();
        if (createData.object === 'error') {
          results.push({ name: project.name, action: 'error', error: createData.message });
        } else {
          results.push({ name: project.name, action: 'created' });
        }
      }
    }

    const synced = results.filter(r => r.action !== 'error').length;
    const errors = results.filter(r => r.action === 'error');

    return Response.json({ success: true, synced, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});