import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a58b955a3acbfb32bf0271c';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { spreadsheet_id } = await req.json();
    if (!spreadsheet_id) {
      return Response.json({ error: 'Missing spreadsheet_id' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Get spreadsheet metadata to find the first sheet's name
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const metaData = await metaRes.json();
    if (metaData.error) {
      return Response.json({ error: metaData.error.message }, { status: 400 });
    }
    const sheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';
    const encodedSheet = encodeURIComponent(sheetName);

    // Fetch all projects
    const projects = await base44.entities.Project.list('-created_date', 500);

    // Build the data array
    const headers = ['Name', 'Status', 'Priority', 'Client', 'Due Date', 'Notes', 'Created'];
    const rows = projects.map(p => [
      p.name || '',
      p.status || '',
      p.priority || '',
      p.client_name || '',
      p.due_date || '',
      (p.notes || '').slice(0, 50000),
      p.created_date || '',
    ]);
    const values = [headers, ...rows];

    // Clear existing data in the first sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodedSheet}!A1:Z10000:clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Write new data
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodedSheet}!A1?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });
    const updateData = await updateRes.json();
    if (updateData.error) {
      return Response.json({ error: updateData.error.message }, { status: 400 });
    }

    return Response.json({ success: true, synced: projects.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});