import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const score = Number(body.score);
    if (!Number.isFinite(score)) {
      return Response.json({ error: 'score is required' }, { status: 400 });
    }
    const level = score <= 25 ? 'low' : score <= 50 ? 'moderate' : score <= 75 ? 'high' : 'critical';
    const stress = Number(body.stress) || 0;
    const missedBreaks = Number(body.missedBreaks) || 0;
    const overdueTasks = Number(body.overdueTasks) || 0;
    const energyPattern = String(body.energyPattern || 'unknown').slice(0, 100);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate coach specialising in neurodivergent burnout recovery. Based on this person's current state, give a personalised, concrete 3-step recovery micro-plan for the next 2 hours.

Current state:
- Burnout risk score: ${score}/100 (${level})
- Self-reported stress: ${stress}/5
- Missed breaks today: ${missedBreaks}
- Overdue tasks: ${overdueTasks}
- Energy pattern: ${energyPattern}

Return JSON with:
- headline: one empathetic sentence (max 15 words) addressing them directly
- steps: array of exactly 3 objects, each with: emoji (string), title (max 6 words), action (1–2 sentence concrete instruction), duration (e.g. "5 min", "20 min")
- closing: one gentle motivating sentence`,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                emoji: { type: 'string' },
                title: { type: 'string' },
                action: { type: 'string' },
                duration: { type: 'string' },
              },
            },
          },
          closing: { type: 'string' },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('generateRecoveryPlan failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}