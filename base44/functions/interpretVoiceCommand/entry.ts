import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ALLOWED_PATHS = [
  '/dashboard',
  '/tasks',
  '/task-breakdown',
  '/projects',
  '/journal',
  '/focus-modes',
  '/productivity',
  '/burnout',
  '/knowledge',
  '/integration-settings',
  '/sensory',
  '/feedback',
  '/support',
  '/help-center',
];

function labelFor(path) {
  const name = path.replace('/', '').replace(/-/g, ' ');
  return name === 'sensory' ? 'Settings' : name;
}

/**
 * AI fallback for voice commands: turns a natural spoken instruction into one
 * structured intent. Only reached when the local phrase list finds no match.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const transcript = typeof body?.transcript === 'string' ? body.transcript.trim().slice(0, 300) : '';
    if (!transcript) {
      return Response.json({ type: 'unknown', reply: "I didn't hear anything." });
    }

    const prompt = [
      'You convert one spoken instruction from a productivity app user into a single structured intent.',
      '',
      'Allowed types:',
      '- "navigate": the user wants to open a screen. Choose the closest path from this exact list only: ' + ALLOWED_PATHS.join(', '),
      '- "set_focus_mode": the user wants to activate a focus or energy mode by name. Put the mode name in "name".',
      '- "add_task": the user clearly wants to create a task. Put a short task title in "title".',
      '- "unknown": nothing actionable.',
      '',
      'Rules:',
      '- Never invent a path outside the list.',
      '- If the instruction is not a clear command, return "unknown" with a short friendly "reply".',
      '',
      'Spoken instruction: "' + transcript.replace(/"/g, "'") + '"',
    ].join('\n');

    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['navigate', 'set_focus_mode', 'add_task', 'unknown'] },
          path: { type: 'string' },
          name: { type: 'string' },
          title: { type: 'string' },
          reply: { type: 'string' },
        },
        required: ['type'],
      },
    });

    const intent = raw && typeof raw === 'object' ? raw : { type: 'unknown' };

    if (intent.type === 'navigate') {
      if (!ALLOWED_PATHS.includes(intent.path)) {
        return Response.json({ type: 'unknown', reply: "I couldn't find that screen." });
      }
      return Response.json({ type: 'navigate', path: intent.path, label: labelFor(intent.path) });
    }

    if (intent.type === 'set_focus_mode' && intent.name) {
      return Response.json({ type: 'set_focus_mode', name: String(intent.name).slice(0, 60) });
    }

    if (intent.type === 'add_task' && intent.title) {
      return Response.json({ type: 'add_task', title: String(intent.title).slice(0, 200) });
    }

    return Response.json({ type: 'unknown', reply: intent.reply || "I didn't catch a command in that." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}