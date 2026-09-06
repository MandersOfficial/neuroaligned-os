import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const state = body.state || {};
    const label = String(state.label || 'unknown').slice(0, 50);
    const hint = String(state.hint || '').slice(0, 300);
    const allowedEnergy = Array.isArray(state.allowedEnergy) ? state.allowedEnergy : [];
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 20).map(t => ({
      id: String(t?.id || ''),
      title: String(t?.title || '').slice(0, 200),
      energy_required: t?.energy_required || null,
      category: t?.category || null,
      due_date: t?.due_date || null,
      estimated_minutes: t?.estimated_minutes || null,
    })) : [];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI assistant for neurodivergent entrepreneurs. The user's current energy state is "${label}" — ${hint}

Here are their pending tasks:
${JSON.stringify(tasks, null, 2)}

Tasks they can handle at "${label}" state: energy_required values ${JSON.stringify(allowedEnergy)}.
For burnout_risk: recommend 0 tasks and focus on rest.

Return up to 5 prioritised task IDs with a brief one-sentence reason each. Also give a one-line scheduling tip.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tip: { type: 'string' },
          recommended_tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('suggestEnergyTasks failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}