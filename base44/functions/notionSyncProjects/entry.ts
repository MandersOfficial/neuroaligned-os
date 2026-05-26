import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notion_database_id, notion_access_token } = await req.json();
    if (!notion_database_id || !notion_access_token) {
      return Response.json({ error: 'Missing notion_database_id or notion_access_token' }, { status: 400 });
    }

    // Fetch the user's projects
    const projects = await base44.entities.Project.filter({ created_by_id: user.id });

    const results = [];
    for (const project of projects) {
      // Check if a page for this project already exists
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notion_access_token}`,
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

      if (existing) {
        // Update existing page
        await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${notion_access_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });
        results.push({ name: project.name, action: 'updated' });
      } else {
        // Create new page
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notion_access_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: notion_database_id },
            properties,
          }),
        });
        results.push({ name: project.name, action: 'created' });
      }
    }

    return Response.json({ success: true, synced: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});