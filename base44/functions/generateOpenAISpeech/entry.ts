import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

const MAX_CHARS = 2500; // protects the key's character budget per request
const DAILY_CALL_LIMIT = 40; // fair-use ceiling per member per day
// Premium voices sit behind a paid plan; anything else falls back to the free
// device voice in the client (readAloud.js catches the error and switches).
const PAID_PLANS = new Set(['lifetime', 'beta', 'starter', 'pro']);
const ENTITLED_STATUSES = new Set(['active', 'trialing']);
const VOICES = new Set([
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova',
  'onyx', 'sage', 'shimmer', 'verse', 'marin', 'cedar',
]);

/**
 * Generates premium read-aloud audio with OpenAI's GPT-4o mini TTS.
 * Input: { voice, text } — returns { audio } (mp3 as base64).
 *
 * The OpenAI key is app-owned, so calls are gated on an active paid plan and a
 * per-member daily cap; otherwise any signed-in caller could bill the key
 * without limit.
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

    // 1. Entitlement — only an active paid plan may spend the app's key
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
    const sub = subs[0];
    if (!sub || !PAID_PLANS.has(sub.plan) || !ENTITLED_STATUSES.has(sub.status)) {
      return Response.json(
        { error: 'Premium voices are part of a paid plan', upgrade: true },
        { status: 403 }
      );
    }

    // 2. Daily fair-use cap, so a loop can't run up an unbounded third-party bill
    const today = new Date().toISOString().slice(0, 10);
    const usageRows = await base44.asServiceRole.entities.TtsUsage.filter({ user_email: user.email });
    const usage = usageRows[0];
    const usedToday = usage?.day === today ? (usage.count || 0) : 0;
    if (usedToday >= DAILY_CALL_LIMIT) {
      return Response.json(
        { error: 'Daily premium voice limit reached', limit: DAILY_CALL_LIMIT },
        { status: 429 }
      );
    }

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

    // 3. Count the call only once it actually produced audio
    if (usage) {
      await base44.asServiceRole.entities.TtsUsage.update(usage.id, { day: today, count: usedToday + 1 });
    } else {
      await base44.asServiceRole.entities.TtsUsage.create({ user_email: user.email, day: today, count: 1 });
    }

    return Response.json({ audio: btoa(binary) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}