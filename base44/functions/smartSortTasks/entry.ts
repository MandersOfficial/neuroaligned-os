import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 30).map(t => ({
      id: String(t?.id || ''),
      title: String(t?.title || '').slice(0, 200),
      energy_required: t?.energy_required || 'medium',
      category: t?.category || null,
      estimated_minutes: t?.estimated_minutes || null,
      due_date: t?.due_date || null,
    })) : [];
    if (tasks.length === 0) return Response.json({ error: 'tasks are required' }, { status: 400 });

    const profile = body.profile || {};
    const neurotypes = Array.isArray(profile.neurotypes) ? profile.neurotypes.join(', ') : 'not specified';
    const energyPeak = String(profile.energy_peak || 'unknown').slice(0, 100);
    const workStyle = String(profile.work_style || 'unknown').slice(0, 100);
    const energy = String(body.energy || 'flow').slice(0, 30);
    const focusMinutes = Number(body.focusMinutes) || 25;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI task prioritizer for neurodivergent entrepreneurs.

USER CONTEXT:
- Neurotypes: ${neurotypes}
- Energy peak window: ${energyPeak}
- Work style: ${workStyle}
- Current energy state: ${energy}
- Minutes remaining in focus session: ${focusMinutes}

TASK LIST:
${JSON.stringify(tasks, null, 2)}

RULES:
1. Match task energy_required to the user's current energy state:
   - hyperfocus/flow → high and medium energy tasks first
   - sluggish → low energy tasks first, avoid high
   - burnout_risk → only self_care or very low tasks if any
2. If focus session has < 15 min left, prioritize tasks with short estimated_minutes
3. Respect neurotype: ADHD/Anxiety users benefit from quick wins first (low estimated_minutes); Autistic users prefer category clustering
4. Overdue tasks get a small priority boost
5. Return ALL task IDs in your preferred order, plus a very short reason (max 5 words) for the top 3

Return a JSON object.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ordered_ids: { type: 'array', items: { type: 'string' } },
          reasons: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('smartSortTasks failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}