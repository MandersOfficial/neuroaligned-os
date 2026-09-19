import { secrets } from "base44:runtime";

export const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

/** Returns the configured ElevenLabs API key or throws a clear error. */
export function getElevenLabsKey() {
  const key = secrets.get("ELEVENLABS_API_KEY");
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
}