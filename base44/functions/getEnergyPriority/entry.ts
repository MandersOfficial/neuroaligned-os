import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ENERGY_LABELS = {
  1: 'Depleted (1/5)',
  2: 'Low (2/5)',
  3: 'Moderate (3/5)',
  4: 'Good (4/5)',
  5: 'Peak (5/5)',
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const energy = Math.min(5, Math.max(1, Number(body.energy) || 3));
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 15) : [];

    const pending = tasks.map(t => {
      const title = String(t?.title || '').slice(0, 200);
      const energyRequired = String(t?.energy_required || 'medium');
      const category = String(t?.category || 'general');
      const due = t?.due_date ? `, due: ${String(t.due_date).slice(0, 20)}` : '';
      const mins = t?.estimated_minutes ? `, ~${t.estimated_minutes}min` : '';
      return `- "${title}" [energy: ${energyRequired}, category: ${category}${due}${mins}]`;
    }).join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate AI coach for neurodivergent entrepreneurs.

The user's current energy level is ${energy}/5 (${ENERGY_LABELS[energy]}).

Their pending tasks are:
${pending || '(no tasks yet)'}

Answer the question: "What is the single most important task I should do right now, given my energy?"

Guidelines:
- Be direct and specific — name ONE task (or suggest a short task if all are mismatched)
- Explain WHY it's the right fit for their energy level in 1-2 sentences
- If energy is low (1-2), protect them from overcommitting — suggest the gentlest option
- If energy is high (4-5), help them capitalise on it with the highest-leverage task
- End with one tiny encouraging sentence. Keep total response under 100 words.`,
    });

    return Response.json({ text: result });
  } catch (error) {
    console.error('getEnergyPriority failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}