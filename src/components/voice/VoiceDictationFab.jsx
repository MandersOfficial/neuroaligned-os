import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { useDictation } from '@/hooks/useDictation';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Whether a DOM element is a text entry target dictation can write into.
 * Excludes non-text input types (checkbox/radio/range/etc.).
 */
function isEditableTarget(el) {
  if (!el) return false;
  if (el.tagName === 'INPUT') {
    const t = (el.type || '').toLowerCase();
    return ['text', 'search', 'url', 'email', 'tel', ''].includes(t);
  }
  return el.tagName === 'TEXTAREA' || el.isContentEditable;
}

/**
 * App-wide floating microphone that turns spoken words into text in whatever
 * field has focus. Works across every form in the app with no per-form wiring.
 * Hidden when speech recognition isn't supported (e.g. Firefox) and on public
 * pages (only mounts for authenticated users).
 */
export default function VoiceDictationFab() {
  const { isAuthenticated } = useAuth();
  const { supported, listening, interim, start, stop } = useDictation();

  if (!isAuthenticated || !supported) return null;

  const handleToggle = () => {
    if (listening) { stop(); return; }
    const el = document.activeElement;
    if (!isEditableTarget(el)) {
      toast({
        title: 'Tap a text field first',
        description: 'Focus any text box, then tap the mic to dictate into it.',
      });
      return;
    }
    start(el);
  };

  return (
    <div className="fixed bottom-20 left-5 md:bottom-6 z-50 flex flex-col items-start gap-2">
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="max-w-[240px] bg-card border border-border/60 rounded-2xl shadow-xl px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-foreground">Listening…</span>
            </div>
            <p className="text-muted-foreground leading-relaxed line-clamp-3 min-h-[16px]">
              {interim || 'Speak now — text appears in the field you tapped.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggle}
        whileTap={{ scale: 0.94 }}
        aria-label={listening ? 'Stop voice to text' : 'Start voice to text'}
        title="Voice to text — tap a text field, then the mic"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-colors ${
          listening
            ? 'bg-red-500 text-white border-red-400'
            : 'bg-card text-foreground border-border/60 hover:border-primary/40'
        }`}
      >
        {listening
          ? <Square className="w-4 h-4 fill-current" />
          : <Mic className="w-4 h-4 text-primary" />}
        <span className="text-xs font-semibold">{listening ? 'Stop' : 'Voice'}</span>
      </motion.button>
    </div>
  );
}