import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export const isVoiceToTextSupported = () => !!SpeechRecognition;

/**
 * Insert text into a focused <input>/<textarea>/contentEditable at the caret.
 * For controlled React inputs we use the native value setter + a dispatched
 * `input` event so React's onChange picks it up; for contentEditable (e.g.
 * react-quill) we use execCommand('insertText') so the editor's own state
 * stays in sync.
 */
export function insertTextAtCaret(el, text) {
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + text + el.value.slice(end);
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement : window.HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
    setter.call(el, next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const pos = start + text.length;
    try { el.setSelectionRange(pos, pos); } catch { /* not all input types support selection */ }
    el.focus();
  } else if (el.isContentEditable) {
    el.focus();
    document.execCommand('insertText', false, text);
  }
}

/**
 * Continuous speech-to-text that streams final transcripts into a target
 * editable element. `start(targetEl)` begins; `stop()` ends. The recognizer
 * auto-restarts on its natural end (silence) until explicitly stopped, so a
 * single tap keeps dictating until the user taps Stop.
 */
export function useDictation() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const targetRef = useRef(null);
  const stoppedRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    const r = recRef.current;
    if (r) { try { r.stop(); } catch { /* already stopped */ } }
    recRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback((targetEl) => {
    if (!SpeechRecognition || !targetEl) return;
    // Tear down any existing session first.
    if (recRef.current) {
      stoppedRef.current = true;
      try { recRef.current.stop(); } catch { /* ignore */ }
      recRef.current = null;
    }

    targetRef.current = targetEl;
    stoppedRef.current = false;
    setError(null);

    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || 'en-US';

    r.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) insertTextAtCaret(targetRef.current, finalText + ' ');
      setInterim(interimText);
    };

    r.onerror = (e) => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) {
        stoppedRef.current = true;
        setError(e.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow mic permission in your browser — and note the in-builder preview may block the mic, so try it on the live app.'
          : 'No microphone found or it is unavailable.');
        setListening(false);
        setInterim('');
      }
    };

    r.onend = () => {
      if (!stoppedRef.current) {
        try { r.start(); } catch { setListening(false); }
      } else {
        setListening(false);
        setInterim('');
      }
    };

    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
      setError('Could not start dictation. Try reloading the page.');
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { supported: !!SpeechRecognition, listening, interim, error, start, stop };
}