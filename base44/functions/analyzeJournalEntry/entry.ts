import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const content = String(body.content || '').trim().slice(0, 15000);
    if (!content) return Response.json({ error: 'content is required' }, { status: 400 });
    const mood = String(body.mood || 'neutral').slice(0, 50);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate coach for neurodivergent entrepreneurs. Analyze this brain dump journal entry and extract:
1. Key emotional/cognitive themes (max 4, short labels e.g. "task avoidance", "overwhelm", "creative block")
2. Core insights about what the person is experiencing (max 3, one sentence each, warm and non-judgmental)
3. Concrete small action steps they could take at their next check-in (max 4, very specific, energy-aware — not overwhelming)

Brain dump: "${content}"
Mood self-report: ${mood}

Respond in JSON only.`,
      response_json_schema: {
        type: 'object',
        properties: {
          themes: { type: 'array', items: { type: 'string' } },
          insights: { type: 'array', items: { type: 'string' } },
          action_steps: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('analyzeJournalEntry failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}