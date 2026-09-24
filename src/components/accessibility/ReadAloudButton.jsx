import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSensory } from '@/lib/SensoryContext';

const CHUNK_CHAR_LIMIT = 2500; // must match the backend function's cap

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

/**
 * Floating read-aloud control: speaks the current page's main content in the
 * user's chosen voice — free device speech by default, or a premium ElevenLabs
 * voice via the backend function. Falls back to device speech if the premium
 * voice fails. Stops automatically on navigation.
 */
export default function ReadAloudButton({ variant = 'floating', collapsed = false }) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { prefs } = useSensory();
  const stopRef = useRef(false);
  const audioRef = useRef(null);

  const stopAll = () => {
    stopRef.current = true;
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
    setLoading(false);
  };

  // Stop speaking whenever the user navigates to another page
  useEffect(() => {
    stopAll();
  }, [location.pathname]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const getPageText = () =>
    (document.querySelector('main')?.innerText || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 30000);

  const speakWithDevice = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  const speakWithElevenLabs = async (voiceId, text) => {
    const chunks = splitIntoChunks(text, CHUNK_CHAR_LIMIT);
    stopRef.current = false;
    for (const chunk of chunks) {
      if (stopRef.current) return;
      const res = await base44.functions.invoke('generateOpenAISpeech', {
        voice: voiceId,
        text: chunk,
      });
      if (stopRef.current) return;
      setLoading(false);
      await new Promise((resolve) => {
        const audio = new Audio(`data:audio/mpeg;base64,${res.data.audio}`);
        audioRef.current = audio;
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
      audioRef.current = null;
    }
  };

  const toggle = async () => {
    if (speaking || loading) {
      stopAll();
      return;
    }
    const text = getPageText();
    if (!text) return;

    const voiceId = prefs.readerVoiceId;
    if (voiceId) {
      setSpeaking(true);
      setLoading(true);
      try {
        await speakWithElevenLabs(voiceId, text);
      } catch {
        // Premium voice failed — fall back to device speech so the feature never breaks
        setLoading(false);
        speakWithDevice(text);
        return;
      }
      setLoading(false);
      setSpeaking(false);
      return;
    }

    speakWithDevice(text);
  };

  const isSidebar = variant === 'sidebar';
  const className = isSidebar
    ? `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
        collapsed ? 'justify-center px-0' : ''
      } ${
        speaking
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
      }`
    : `flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-colors ${
        speaking
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-foreground border-border hover:bg-secondary'
      }`;

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      title={loading ? 'Preparing audio…' : speaking ? 'Stop reading' : 'Read this page aloud'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : speaking ? (
        <Square className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4 text-primary" />
      )}
      {(!isSidebar || !collapsed) && (loading ? 'Loading…' : speaking ? 'Stop' : 'Read Aloud')}
    </button>
  );
}