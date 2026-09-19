import { useRef, useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

/**
 * Inline dictation control for the journal editor: uses the browser's speech
 * recognition to stream spoken words into the entry via onText — no typing needed.
 */
export default function JournalDictation({ onText, registerStop }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const recRef = useRef(null);

  const Ctor = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = () => {
    const rec = recRef.current;
    recRef.current = null;
    setListening(false);
    setInterim('');
    try { rec?.stop(); } catch { /* already stopped */ }
  };

  // Always stop the microphone when the editor unmounts
  useEffect(() => () => stop(), []);
  useEffect(() => { registerStop?.(stop); }, [registerStop]);

  const start = () => {
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (e) => {
      let final = '';
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else live += r[0].transcript;
      }
      setInterim(live);
      if (final.trim()) onText(final.trim());
    };
    rec.onend = () => {
      // Only reset if we didn't already stop deliberately
      if (recRef.current === rec) stop();
    };
    rec.onerror = () => stop();
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  if (!Ctor) return null;

  return (
    <div className="flex items-center gap-2">
      {listening && interim && (
        <span className="text-xs text-muted-foreground italic max-w-44 truncate hidden sm:inline">
          {interim}
        </span>
      )}
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          listening
            ? 'bg-red-500/10 border border-red-400/40 text-red-500'
            : 'border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30'
        }`}
        title={listening ? 'Stop dictation' : 'Dictate your thoughts'}
      >
        {listening ? (
          <><Square className="w-3.5 h-3.5 animate-pulse" /> Stop</>
        ) : (
          <><Mic className="w-3.5 h-3.5" /> Dictate</>
        )}
      </button>
    </div>
  );
}