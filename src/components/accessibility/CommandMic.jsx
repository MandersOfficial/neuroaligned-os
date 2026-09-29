import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import useVoiceCommands from '@/components/accessibility/useVoiceCommands';
import { matchPhrase } from '@/components/accessibility/commandPhrases';
import { getCommandMode, subscribeCommandMode, loadCommandMode } from '@/lib/voiceCommandStore';

/**
 * The Command Mode mic. Only rendered while Command Mode is on; speaks an
 * instruction, which is matched against the local phrase list first and sent to
 * AI understanding only when nothing local matches.
 */
export default function CommandMic({ variant = 'floating', collapsed = false }) {
  const [enabled, setEnabled] = useState(getCommandMode());
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const { status, pending, runIntent, confirmPending, cancelPending, clearStatus } = useVoiceCommands();

  useEffect(() => {
    const unsubscribe = subscribeCommandMode(setEnabled);
    loadCommandMode();
    return unsubscribe;
  }, []);

  const stop = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  };

  useEffect(() => () => stop(), []);

  const handleTranscript = async (text) => {
    const local = matchPhrase(text);
    if (local) {
      await runIntent(local);
      return;
    }
    try {
      const res = await base44.functions.invoke('interpretVoiceCommand', { transcript: text });
      await runIntent(res.data);
    } catch {
      await runIntent({ type: 'unknown' });
    }
  };

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) handleTranscript(transcript.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    try { recognition.start(); } catch { return; }
    recognitionRef.current = recognition;
    setListening(true);
  };

  if (!enabled) return null;

  const isSidebar = variant === 'sidebar';
  const buttonClass = isSidebar
    ? cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
        collapsed ? 'justify-center px-0' : '',
        listening
          ? 'bg-red-600/10 text-red-600 border-red-600/30'
          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
      )
    : cn(
        'flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-colors',
        listening
          ? 'bg-red-600 text-white border-red-600 animate-pulse-soft'
          : 'bg-card text-foreground border-border hover:bg-secondary'
      );

  const panel = (status || pending) && (
    <div
      className={cn(
        'rounded-xl border bg-card shadow-lg px-3 py-2.5 text-xs max-w-[16rem]',
        status?.tone === 'warn' ? 'border-amber-500/40 text-amber-700 dark:text-amber-400' : 'border-border text-foreground'
      )}
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 leading-relaxed">{status?.message}</p>
        {!pending && (
          <button type="button" onClick={clearStatus} className="text-muted-foreground hover:text-foreground shrink-0" title="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {pending && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={confirmPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold"
          >
            <Check className="w-3 h-3" /> Yes
          </button>
          <button
            type="button"
            onClick={cancelPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-muted-foreground font-semibold"
          >
            <X className="w-3 h-3" /> No
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(isSidebar ? 'w-full space-y-2' : 'flex flex-col items-end gap-2')}>
      {panel}
      <button
        type="button"
        onClick={listening ? stop : start}
        className={buttonClass}
        title={listening ? 'Stop listening' : 'Speak a command'}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
        {(!isSidebar || !collapsed) && (listening ? 'Listening…' : 'Speak a command')}
      </button>
    </div>
  );
}