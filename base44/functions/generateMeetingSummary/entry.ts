import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a58bb594a5a09e519c6c4a1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id } = await req.json();
    if (!project_id) {
      return Response.json({ error: 'Missing project_id' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch the project and its tasks
    const project = await base44.entities.Project.get(project_id);
    const tasks = await base44.entities.Task.filter({ project_id });

    const taskList = tasks.length > 0
      ? tasks.map(t => `- [${t.status === 'done' ? 'x' : ' '}] ${t.title}${t.estimated_minutes ? ` (${t.estimated_minutes}m)` : ''}`).join('\n')
      : 'No tasks recorded.';

    const notes = project.notes || 'No notes recorded.';

    // Generate meeting summary using InvokeLLM
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a professional meeting summary for the following project. Structure it with clear sections using markdown headings (##).

## Meeting Overview
Brief intro: project name, today's date, and any known participants.

## Project Status
Current status, priority, client, and due date.

## Key Discussion Points
Summarize the project notes into 3-5 key discussion themes. Use bullet points.

## Action Items
List incomplete tasks as action items with owners (if known). Derive additional action items from the notes if applicable. Use checkboxes.

## Next Steps
Recommend 2-3 concrete next steps based on the project state.

---
Project: ${project.name}
Status: ${project.status}
Priority: ${project.priority || 'N/A'}
Client: ${project.client_name || 'N/A'}
Due Date: ${project.due_date || 'N/A'}

Notes:
${notes}

Tasks:
${taskList}

Write the summary in clear, professional prose.`,
    });

    const summaryText = typeof llmRes === 'string' ? llmRes : (llmRes.content || llmRes.text || JSON.stringify(llmRes));

    // Create a new Google Doc
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: `Meeting Summary — ${project.name}` }),
    });
    const createData = await createRes.json();
    if (createData.error) {
      return Response.json({ error: createData.error.message }, { status: 400 });
    }
    const docId = createData.documentId;

    // Insert the summary text into the doc
    const insertRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: summaryText,
            },
          },
        ],
      }),
    });
    const insertData = await insertRes.json();
    if (insertData.error) {
      return Response.json({ error: insertData.error.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      doc_url: `https://docs.google.com/document/d/${docId}/edit`,
      doc_id: docId,
      project_name: project.name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});