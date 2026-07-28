import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';
const NOTION_VERSION = '2022-06-28';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sop_title, topic, context, parent_page_id, notion_database_id } = await req.json();

    if (!sop_title || !topic) {
      return Response.json({ error: 'Missing sop_title or topic' }, { status: 400 });
    }
    if (!parent_page_id && !notion_database_id) {
      return Response.json({ error: 'Provide either parent_page_id or notion_database_id' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(NOTION_CONNECTOR_ID);

    // 1. Generate structured SOP content with AI
    const llmPrompt = `You are an expert operations consultant. Draft a clear, actionable Standard Operating Procedure (SOP).

Title: ${sop_title}
Topic: ${topic}
Additional context: ${context || 'None provided — use best judgment for a general small business / solopreneur context.'}

Write the SOP with these standard sections:
1. Purpose — why this procedure exists
2. Scope — who and what it applies to
3. Prerequisites — what's needed before starting (tools, access, materials)
4. Procedure — step-by-step numbered instructions
5. Quality Checks — how to verify it was done correctly
6. Troubleshooting — common issues and fixes
7. Revision History — a simple table placeholder

Keep the tone professional but accessible. Be specific and actionable — no fluff. Each numbered step should be a single, concrete action.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'One-sentence summary of the SOP' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string' },
                type: { type: 'string', enum: ['paragraph', 'bullets', 'numbered'] },
                content: { type: 'string', description: 'Used when type is paragraph' },
                items: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Used when type is bullets or numbered',
                },
              },
              required: ['heading', 'type'],
            },
          },
        },
        required: ['summary', 'sections'],
      },
    });

    const sop = llmResponse as { summary: string; sections: Array<{ heading: string; type: string; content?: string; items?: string[] }> };

    // 2. Build Notion blocks from the structured SOP
    const blocks: any[] = [];

    // Summary callout at the top
    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ text: { content: `Summary: ${sop.summary}`.slice(0, 2000) } }],
        icon: { emoji: '📋' },
      },
    });

    // Divider
    blocks.push({ object: 'block', type: 'divider', divider: {} });

    for (const section of sop.sections) {
      // Section heading
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: section.heading.slice(0, 2000) } }] },
      });

      if (section.type === 'paragraph' && section.content) {
        const chunks = section.content.match(/[\s\S]{1,2000}/g) || [];
        for (const chunk of chunks) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: chunk } }] },
          });
        }
      } else if ((section.type === 'bullets' || section.type === 'numbered') && section.items) {
        const blockType = section.type === 'bullets' ? 'bulleted_list_item' : 'numbered_list_item';
        for (const item of section.items) {
          const chunks = item.match(/[\s\S]{1,2000}/g) || [item];
          for (const chunk of chunks) {
            blocks.push({
              object: 'block',
              type: blockType,
              [blockType]: { rich_text: [{ text: { content: chunk } }] },
            });
          }
        }
      }
    }

    // 3. Build the page body — Notion allows max 100 blocks per request
    const blockBatch = blocks.slice(0, 100);

    let parent: any;
    let properties: any;

    if (notion_database_id) {
      // Fetch the database to find the title property
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Notion-Version': NOTION_VERSION },
      });
      const dbData = await dbRes.json();
      const titleKey = dbData.object !== 'error'
        ? (Object.entries(dbData.properties || {}).find(([_, p]: [string, any]) => p.type === 'title')?.[0] || 'Name')
        : 'Name';

      parent = { database_id: notion_database_id };
      properties = {
        [titleKey]: { title: [{ text: { content: sop_title.slice(0, 2000) } }] },
      };
    } else {
      parent = { page_id: parent_page_id };
      properties = {
        title: [{ text: { content: sop_title.slice(0, 2000) } }],
      };
    }

    // 4. Create the Notion page
    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent,
        properties,
        children: blockBatch,
      }),
    });
    const createData = await createRes.json();

    if (createData.object === 'error') {
      return Response.json({ error: createData.message }, { status: 400 });
    }

    // 5. Append remaining blocks if more than 100
    if (blocks.length > 100) {
      const remaining = blocks.slice(100);
      for (let i = 0; i < remaining.length; i += 100) {
        const batch = remaining.slice(i, i + 100);
        await fetch(`https://api.notion.com/v1/blocks/${createData.id}/children`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ children: batch }),
        });
      }
    }

    return Response.json({
      success: true,
      page_id: createData.id,
      url: createData.url,
      section_count: sop.sections.length,
      summary: sop.summary,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}