import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = String(body.text || '').trim().slice(0, 5000);
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const bs = body.brainState || {};
    const zone = String(bs.zone || 'green').slice(0, 20);
    const label = String(bs.label || 'unknown').slice(0, 50);
    const sublabel = String(bs.sublabel || 'unknown').slice(0, 100);
    const capacity = String(bs.capacity || 'unknown').slice(0, 100);
    const taskTone = String(bs.taskTone || 'unknown').slice(0, 200);

    let extraRule = '';
    if (zone === 'red' || zone === 'blue') {
      extraRule = 'NO complex or multi-step tasks. Start with the tiniest possible first action.';
    } else if (zone === 'flow') {
      extraRule = 'They have high capacity — one or two meaningful, deep-work steps are ideal.';
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a supportive productivity coach for neurodivergent entrepreneurs using the Regulated Brain Framework.

The user is currently in the ${zone.toUpperCase()} ZONE (${label}).
Nervous system state: ${sublabel}.
Cognitive capacity right now: ${capacity}.
Task tone guidance: ${taskTone}

The user shared: "${text}"

Break this into 1-3 actionable steps appropriate for their current nervous system state.
Rules:
- Each step must be under 12 words
- Match the energy level: ${capacity} capacity
- ${extraRule}
- Frame steps as actions, not goals. Start with a verb.
- Make each step feel doable, not overwhelming.

Return JSON with a "steps" array of strings.`,
      response_json_schema: {
        type: 'object',
        properties: { steps: { type: 'array', items: { type: 'string' } } },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('coachBreakdown failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}