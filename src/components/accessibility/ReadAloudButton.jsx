import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, Square } from 'lucide-react';

/**
 * Floating read-aloud control: speaks the current page's main content using
 * the browser's speech synthesis. Stops automatically on navigation.
 */
export default function ReadAloudButton() {
  const [speaking, setSpeaking] = useState(false);
  const location = useLocation();

  // Stop speaking whenever the user navigates to another page
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [location.pathname]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const main = document.querySelector('main');
    const text = (main?.innerText || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 30000);
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-colors ${
        speaking
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-foreground border-border hover:bg-secondary'
      }`}
      title={speaking ? 'Stop reading' : 'Read this page aloud'}
    >
      {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
      {speaking ? 'Stop' : 'Read Aloud'}
    </button>
  );
}