import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const MAX_CHARS = 2500; // protects the key's character budget per request
const VOICES = new Set([
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova',
  'onyx', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
]);

/**
 * Generates premium read-aloud audio with OpenAI's GPT-4o mini TTS.
 * Input: { voice, text } — returns { audio } (mp3 as base64).
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => null);
    const text = typeof payload?.text === 'string' ? payload.text.trim().slice(0, MAX_CHARS) : '';
    const voice = typeof payload?.voice === 'string' ? payload.voice.trim() : '';
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });
    if (!VOICES.has(voice)) return Response.json({ error: 'valid voice is required' }, { status: 400 });

    const apiKey = secrets.get('OPENAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        response_format: 'mp3',
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return Response.json(
        { error: `OpenAI speech failed (${res.status})`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return Response.json({ audio: btoa(binary) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}