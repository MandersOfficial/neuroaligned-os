import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { ELEVENLABS_API_BASE, getElevenLabsKey } from "../../shared/elevenlabs.ts";

const MAX_CHARS = 2500; // protects the key's character budget per request

/**
 * Generates premium read-aloud audio with ElevenLabs for a chosen voice.
 * Input: { voice_id, text } — returns { audio } (mp3 as base64).
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => null);
    const text = typeof payload?.text === 'string' ? payload.text.trim().slice(0, MAX_CHARS) : '';
    const voiceId = typeof payload?.voice_id === 'string' ? payload.voice_id.trim() : '';
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });
    if (!/^[a-zA-Z0-9_-]{4,64}$/.test(voiceId)) {
      return Response.json({ error: 'valid voice_id is required' }, { status: 400 });
    }

    const res = await fetch(
      `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': getElevenLabsKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
        }),
      }
    );
    if (!res.ok) {
      const detail = await res.text();
      return Response.json(
        { error: `ElevenLabs speech failed (${res.status})`, detail: detail.slice(0, 500) },
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