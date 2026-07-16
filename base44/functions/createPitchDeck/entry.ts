import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a58c008c3935ea2b4e8de42';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, template_url } = await req.json().catch(() => ({}));

    if (!project_id || !template_url) {
      return Response.json({ error: 'Missing project_id or template_url' }, { status: 400 });
    }

    // Extract template ID from URL or use directly
    const match = template_url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const templateId = match ? match[1] : template_url.trim();

    if (!templateId || templateId.length < 10) {
      return Response.json({ error: 'Invalid template URL. Paste a Google Slides link like https://docs.google.com/presentation/d/...' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // Get project data
    const project = await base44.entities.Project.get(project_id);

    // Copy the template using Drive API
    const copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${templateId}/copy`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ name: `Pitch Deck: ${project.name}` }),
    });
    const copyData = await copyRes.json();
    if (copyData.error) {
      return Response.json({ error: copyData.error.message }, { status: 400 });
    }

    const newId = copyData.id;

    // Replace placeholders using Slides API batchUpdate
    const replacements = {
      '{{project_name}}': project.name || '',
      '{{client_name}}': project.client_name || 'N/A',
      '{{due_date}}': project.due_date || 'TBD',
      '{{priority}}': project.priority || 'medium',
      '{{status}}': project.status || 'active',
      '{{notes}}': project.notes || '',
      '{{description}}': project.description || '',
    };

    const requests = Object.entries(replacements).map(([text, replaceText]) => ({
      replaceAllText: {
        containsText: { text, matchCase: true },
        replaceText: String(replaceText),
      },
    }));

    const batchRes = await fetch(`https://slides.googleapis.com/v1/presentations/${newId}:batchUpdate`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ requests }),
    });
    const batchData = await batchRes.json();
    if (batchData.error) {
      return Response.json({ error: batchData.error.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      presentation_id: newId,
      presentation_link: `https://docs.google.com/presentation/d/${newId}/edit`,
      project_name: project.name,
      replacements_made: Object.keys(replacements).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});