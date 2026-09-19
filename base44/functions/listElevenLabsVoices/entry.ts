import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { ELEVENLABS_API_BASE, getElevenLabsKey } from "../../shared/elevenlabs.ts";

/**
 * Lists the voices in the app's ElevenLabs library (with preview samples),
 * so users can browse and pick their Read Aloud voice.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
      headers: { 'xi-api-key': getElevenLabsKey() },
    });
    if (!res.ok) {
      const detail = await res.text();
      return Response.json(
        { error: `ElevenLabs list voices failed (${res.status})`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const voices = (data.voices || []).map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      preview_url: v.preview_url || null,
      labels: v.labels
        ? [v.labels.accent, v.labels.description, v.labels.age, v.labels.gender, v.labels.use_case]
            .filter(Boolean)
            .join(' · ')
        : '',
    }));
    return Response.json({ voices });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}