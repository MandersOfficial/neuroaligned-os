import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const TEXT_FIELD_SELECTOR = 'input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input:not([type]), textarea, [contenteditable="true"]';

/**
 * Global voice-to-text dictation. The mic pill only appears while a text
 * input is actively focused; dictated text is inserted into that field.
 */
export default function VoiceDictation({ variant = 'floating', collapsed = false }) {
  const [activeField, setActiveField] = useState(null);
  const [listening, setListening] = useState(false);
  const fieldRef = useRef(null);
  const recognitionRef = useRef(null);

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  };

  useEffect(() => {
    const onFocusIn = (e) => {
      const el = e.target;
      if (el?.matches?.(TEXT_FIELD_SELECTOR) && el.type !== 'password') {
        fieldRef.current = el;
        setActiveField(el);
      }
    };
    const onFocusOut = () => {
      // Keep the pill if focus moved into it (user tapped the mic) or another text field
      setTimeout(() => {
        const active = document.activeElement;
        if (active?.closest?.('[data-dictation-pill]') || active?.matches?.(TEXT_FIELD_SELECTOR)) return;
        fieldRef.current = null;
        setActiveField(null);
        stopListening();
      }, 0);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      stopListening();
    };
  }, []);

  const insertText = (text) => {
    const el = fieldRef.current;
    if (!el || !text) return;
    if (el.isContentEditable) {
      el.focus();
      document.execCommand('insertText', false, ` ${text} `);
    } else {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      const current = el.value || '';
      const joiner = current && !current.endsWith(' ') ? ' ' : '';
      setter.call(el, current + joiner + text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const toggle = () => {
    if (listening) { stopListening(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) transcript += e.results[i][0].transcript;
      }
      insertText(transcript.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    try { rec.start(); } catch { return; }
    recognitionRef.current = rec;
    setListening(true);
  };

  const supported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!supported || !activeField) return null;

  const isSidebar = variant === 'sidebar';
  const className = isSidebar
    ? `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
        collapsed ? 'justify-center px-0' : ''
      } ${
        listening
          ? 'bg-red-600/10 text-red-600 border-red-600/30'
          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
      }`
    : `flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-colors ${
        listening
          ? 'bg-red-600 text-white border-red-600 animate-pulse-soft'
          : 'bg-card text-foreground border-border hover:bg-secondary'
      }`;

  return (
    <button
      data-dictation-pill
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={toggle}
      className={className}
      title={listening ? 'Stop dictation' : 'Dictate into this field'}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
      {(!isSidebar || !collapsed) && (listening ? 'Stop' : 'Dictate')}
    </button>
  );
}