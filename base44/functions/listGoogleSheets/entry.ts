import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a58b955a3acbfb32bf0271c';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const url = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet'") + "&pageSize=100&orderBy=modifiedTime%20desc&fields=files(id,name)";
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 400 });
    }

    const spreadsheets = (data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      url: `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
    }));

    return Response.json({ spreadsheets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});