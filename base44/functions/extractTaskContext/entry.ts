import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = String(body.text || '').trim().slice(0, 10000);
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI assistant for neurodivergent entrepreneurs. Analyze the following email or note and extract structured context for task management.

Email/Note:
"${text}"

Return a JSON with:
- summary: 1-sentence plain-language summary (max 20 words)
- action_items: array of 2-4 specific, clear next actions (strings)
- key_people: array of names/roles mentioned
- deadline: string or null (e.g. "March 15th", "EOD Friday")
- estimated_energy: "low" | "medium" | "high" (how cognitively demanding is this?)
- suggested_task_title: concise task title (max 8 words)
- tags: array of 2-3 relevant tags (e.g. "client", "deadline", "creative")`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          action_items: { type: 'array', items: { type: 'string' } },
          key_people: { type: 'array', items: { type: 'string' } },
          deadline: { type: 'string' },
          estimated_energy: { type: 'string' },
          suggested_task_title: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('extractTaskContext failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}