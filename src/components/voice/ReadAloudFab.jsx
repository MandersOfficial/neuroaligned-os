import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

/**
 * Decide what to read aloud: the focused text element if it has text
 * (input/textarea value, contentEditable, or a focused block's innerText),
 * otherwise the page's <main> content as a sensible default.
 */
function getTextToRead() {
  const el = document.activeElement;
  if (el && el !== document.body && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.value && el.value.trim()) return el.value;
    } else if (el.isContentEditable) {
      if (el.innerText && el.innerText.trim()) return el.innerText;
    } else {
      const t = el.innerText || el.textContent;
      if (t && t.trim()) return t;
    }
  }
  const main = document.querySelector('main');
  if (main && main.innerText && main.innerText.trim()) return main.innerText;
  return '';
}

/**
 * Floating "Read aloud" button (sits beside the voice-to-text mic). Speaks the
 * focused text block, or the page's main content if nothing focused, using the
 * browser's SpeechSynthesis API. Tap again to stop. Hidden on unsupported
 * browsers and public pages.
 */
export default function ReadAloudFab() {
  const { isAuthenticated } = useAuth();
  const [speaking, setSpeaking] = useState(false);
  const supported = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';

  const stop = () => {
    if (synth) synth.cancel();
    setSpeaking(false);
  };

  const start = () => {
    const text = getTextToRead();
    if (!text || !text.trim()) {
      toast({
        title: 'Nothing to read here',
        description: 'Tap a text block or focus some text, then tap Read.',
      });
      return;
    }
    if (synth.speaking) synth.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = navigator.language || 'en-US';
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  };

  useEffect(() => () => { if (synth) synth.cancel(); }, []);

  if (!isAuthenticated || !supported) return null;

  return (
    <div className="fixed bottom-20 left-5 md:bottom-6 z-50 flex flex-col items-start gap-2">
      <AnimatePresence>
        {speaking && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="bg-card border border-border/60 rounded-2xl shadow-xl px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-foreground">Reading…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => (speaking ? stop() : start())}
        whileTap={{ scale: 0.94 }}
        aria-label={speaking ? 'Stop reading aloud' : 'Read aloud'}
        title="Read aloud — tap a text block, then this button"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-colors ${
          speaking
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-foreground border-border/60 hover:border-primary/40'
        }`}
      >
        {speaking
          ? <Square className="w-4 h-4 fill-current" />
          : <Volume2 className="w-4 h-4 text-primary" />}
        <span className="text-xs font-semibold">{speaking ? 'Stop' : 'Read'}</span>
      </motion.button>
    </div>
  );
}