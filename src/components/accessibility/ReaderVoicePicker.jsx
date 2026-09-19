import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSensory } from '@/lib/SensoryContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check, ChevronDown, Loader2, Play, Square, Smartphone, Sparkles } from 'lucide-react';

/**
 * Reader voice picker: free device voice (default) or a premium ElevenLabs
 * voice from the app's library, with playable preview samples. Bottom-drawer
 * UX on every viewport. Saves the choice to the user's sensory prefs.
 */
export default function ReaderVoicePicker() {
  const { prefs, updatePref } = useSensory();
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const audioRef = useRef(null);

  const loadVoices = async () => {
    if (voices || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('listElevenLabsVoices');
      setVoices(res.data.voices || []);
    } catch {
      setError('Could not load premium voices right now. Try again in a moment.');
    }
    setLoading(false);
  };

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewId(null);
  };

  const playPreview = (voice) => {
    if (previewId === voice.voice_id) {
      stopPreview();
      return;
    }
    stopPreview();
    if (!voice.preview_url) return;
    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;
    setPreviewId(voice.voice_id);
    audio.onended = () => setPreviewId(null);
    audio.onerror = () => setPreviewId(null);
    audio.play().catch(() => setPreviewId(null));
  };

  const select = (id, name) => {
    updatePref('readerVoiceId', id);
    updatePref('readerVoiceName', name);
    stopPreview();
    setOpen(false);
  };

  const selectedId = prefs.readerVoiceId || '';
  const currentLabel = selectedId
    ? (prefs.readerVoiceName || 'Premium voice')
    : 'Device voice (free)';

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); loadVoices(); }}
        className="w-full flex items-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-secondary text-sm text-left transition-colors hover:bg-secondary/70"
      >
        <span className="flex-1 truncate">{currentLabel}</span>
        {selectedId && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
      </button>

      <Drawer shouldScaleBackground={false} open={open} onOpenChange={(o) => { setOpen(o); if (!o) stopPreview(); }}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Reader voice</DrawerTitle>
          </DrawerHeader>
          <div className="px-3 pb-6 max-h-[60vh] overflow-y-auto space-y-1">
            {/* Free default */}
            <button
              type="button"
              onClick={() => select('', '')}
              className={`w-full flex items-center gap-3 min-h-[44px] px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                !selectedId ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="flex-1">Device voice <span className="font-normal opacity-70">— free, always available</span></span>
              {!selectedId && <Check className="w-4 h-4 shrink-0" />}
            </button>

            {/* Premium voices */}
            <p className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-500" /> Premium voices
            </p>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading voices…
              </div>
            )}

            {error && (
              <p className="px-4 py-3 text-xs text-destructive">{error}</p>
            )}

            {(voices || []).map(v => {
              const isSelected = selectedId === v.voice_id;
              const isPlaying = previewId === v.voice_id;
              return (
                <div
                  key={v.voice_id}
                  className={`flex items-center gap-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-secondary'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => select(v.voice_id, v.name)}
                    className="flex-1 flex flex-col items-start min-h-[44px] px-4 py-3 text-left"
                  >
                    <span className={`text-sm ${isSelected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                      {v.name}
                    </span>
                    {v.labels && <span className="text-xs text-muted-foreground truncate max-w-full">{v.labels}</span>}
                  </button>
                  {v.preview_url && (
                    <button
                      type="button"
                      onClick={() => playPreview(v)}
                      className="w-10 h-10 mr-2 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary"
                      title={isPlaying ? 'Stop preview' : 'Play preview'}
                    >
                      {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                  )}
                  {isSelected && <Check className="w-4 h-4 mr-4 shrink-0 text-primary" />}
                </div>
              );
            })}

            {!loading && !error && voices && voices.length === 0 && (
              <p className="px-4 py-3 text-xs text-muted-foreground">
                No premium voices found in the connected ElevenLabs library.
              </p>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}