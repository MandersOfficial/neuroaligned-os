import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id } = await req.json();
    if (!project_id) {
      return Response.json({ error: 'Missing project_id' }, { status: 400 });
    }

    // Read the user's configured Notion database from their auth profile
    const notionDbId = user.notion_projects_db;
    if (!notionDbId) {
      return Response.json({ success: false, message: 'No Notion database configured. Select one in Notion Sync settings.' });
    }

    const project = await base44.entities.Project.get(project_id);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);

    // Find existing Notion page for this project
    const searchRes = await fetch(`https://api.notion.com/v1/databases/${notionDbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'NeuroAligned ID',
          rich_text: { equals: project_id },
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
      'NeuroAligned ID': { rich_text: [{ text: { content: project_id } }] },
    };
    if (project.due_date) properties['Due Date'] = { date: { start: project.due_date } };
    if (project.notes) properties['Notes'] = { rich_text: [{ text: { content: project.notes.slice(0, 2000) } }] };

    if (existing) {
      await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    } else {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parent: { database_id: notionDbId }, properties }),
      });
    }

    return Response.json({ success: true, project: project.name, status: project.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});