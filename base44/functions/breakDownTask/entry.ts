import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const taskTitle = String(body.taskTitle || '').trim().slice(0, 300);
    if (!taskTitle) return Response.json({ error: 'taskTitle is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate AI coach for neurodivergent entrepreneurs (ADHD, Autistic, Dyslexic, Burnout survivors).

The user needs help breaking down this task into small, manageable steps:
"${taskTitle}"

Create a step-by-step breakdown that:
1. Starts with the absolute smallest possible first action (under 2 minutes)
2. Keeps each step concrete and actionable — no vague verbs
3. Groups related micro-steps together
4. Includes a "rest checkpoint" after every 3-4 steps
5. Flags which steps need high energy vs can be done on low energy
6. Stays under 250 words total

Format as numbered steps. Be warm and non-judgmental in tone.`,
    });

    return Response.json({ text: result });
  } catch (error) {
    console.error('breakDownTask failed:', error);
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}