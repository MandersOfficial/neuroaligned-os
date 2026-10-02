// Read Aloud playback engine.
//
// Lives at module scope so every control (desktop sidebar, mobile More sheet)
// shows the same playback state and only one of them ever speaks. Supports
// start, pause, resume and stop for both the free device voice and the premium
// voice served by the generateOpenAISpeech backend function.
import { base44 } from '@/api/base44Client';

const CHUNK_CHAR_LIMIT = 2500; // must match the backend function's cap
const MAX_TEXT_CHARS = 30000;

let state = 'idle'; // idle | loading | speaking | paused
let stopRequested = false;
let audioEl = null;
let finishChunk = null;
const listeners = new Set();

function setState(next) {
  if (state === next) return;
  state = next;
  listeners.forEach(fn => fn(next));
}

export function getReadAloudState() {
  return state;
}

export function subscribeReadAloud(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The current page's main content, collapsed to a single readable string. */
function getPageText() {
  return (document.querySelector('main')?.innerText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

/** Splits text into <=limit chunks at sentence boundaries (hard-split fallback). */
function splitIntoChunks(text, limit) {
  const pieces = [];
  let current = '';
  for (const sentence of text.split(/(?<=[.!?\u2026])\s+/)) {
    let s = sentence;
    while (s.length > limit) {
      if (current) { pieces.push(current); current = ''; }
      pieces.push(s.slice(0, limit));
      s = s.slice(limit);
    }
    if (current && (current + ' ' + s).length > limit) {
      pieces.push(current);
      current = s;
    } else {
      current = current ? current + ' ' + s : s;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

function speakWithDevice(text) {
  const synth = window.speechSynthesis;
  if (!synth) {
    setState('idle');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.onend = () => { if (!stopRequested) setState('idle'); };
  utterance.onerror = () => { if (!stopRequested) setState('idle'); };
  synth.cancel();
  synth.speak(utterance);
  setState('speaking');
}

/** Plays one chunk. Resolves true when it played, false if playback was blocked. */
function playChunk(base64) {
  return new Promise((resolve) => {
    const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
    audioEl = audio;
    const done = (played) => {
      finishChunk = null;
      if (audioEl === audio) audioEl = null;
      resolve(played);
    };
    finishChunk = () => done(true);
    audio.onended = () => done(true);
    audio.onerror = () => done(true);
    audio.play().then(() => {}).catch(() => done(false));
  });
}

async function speakWithPremium(voiceId, text) {
  const chunks = splitIntoChunks(text, CHUNK_CHAR_LIMIT);
  let firstChunk = true;
  for (const chunk of chunks) {
    if (stopRequested) return;
    const res = await base44.functions.invoke('generateOpenAISpeech', { voice: voiceId, text: chunk });
    if (stopRequested) return;
    const base64 = res?.data?.audio;
    if (!base64) throw new Error('No audio returned');
    if (state === 'loading') setState('speaking');
    const played = await playChunk(base64);
    // Playback blocked (e.g. browser autoplay policy) — let the caller fall
    // back to the free device voice instead of burning credits silently.
    if (!played && firstChunk) throw new Error('Playback blocked');
    firstChunk = false;
  }
}

export async function startReadAloud(voiceId) {
  if (state !== 'idle') return;
  const text = getPageText();
  if (!text) return;

  stopRequested = false;

  if (voiceId) {
    setState('loading');
    try {
      await speakWithPremium(voiceId, text);
      if (!stopRequested) setState('idle');
    } catch {
      if (!stopRequested) speakWithDevice(text);
    }
    return;
  }

  speakWithDevice(text);
}

export function pauseReadAloud() {
  if (state !== 'speaking') return;
  if (audioEl) audioEl.pause();
  else window.speechSynthesis?.pause();
  setState('paused');
}

export function resumeReadAloud() {
  if (state !== 'paused') return;
  if (audioEl) audioEl.play().catch(() => {});
  else window.speechSynthesis?.resume();
  setState('speaking');
}

export function stopReadAloud() {
  stopRequested = true;
  window.speechSynthesis?.cancel();
  if (audioEl) audioEl.pause();
  if (finishChunk) {
    const done = finishChunk;
    finishChunk = null;
    done();
  }
  audioEl = null;
  setState('idle');
}