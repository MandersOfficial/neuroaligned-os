import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSensory } from '@/lib/SensoryContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check, ChevronDown, Loader2, Play, Smartphone, Sparkles, Square } from 'lucide-react';

/** Curated premium voice styles (OpenAI GPT-4o mini TTS built-ins). */
const VOICES = [
  { id: 'marin', name: 'Marin', labels: 'Smooth & polished — recommended' },
  { id: 'cedar', name: 'Cedar', labels: 'Rich & natural — recommended' },
  { id: 'coral', name: 'Coral', labels: 'Friendly & upbeat' },
  { id: 'sage', name: 'Sage', labels: 'Calm & soft-spoken' },
  { id: 'ash', name: 'Ash', labels: 'Warm & grounded' },
  { id: 'nova', name: 'Nova', labels: 'Bright & energetic' },
  { id: 'alloy', name: 'Alloy', labels: 'Neutral & balanced' },
  { id: 'onyx', name: 'Onyx', labels: 'Deep & confident' },
  { id: 'ballad', name: 'Ballad', labels: 'Expressive & dramatic' },
];

/**
 * Reader voice picker: free device voice (default) or a premium voice style
 * with a playable preview sample. Bottom-drawer UX on every viewport.
 * Saves the choice to the user's sensory prefs.
 */
export default function ReaderVoicePicker() {
  const { prefs, updatePref } = useSensory();
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState(null); // voice id loading/playing
  const audioRef = useRef(null);

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewing(null);
  };

  const playPreview = async (voice) => {
    if (previewing === voice.id) {
      stopPreview();
      return;
    }
    stopPreview();
    setPreviewing(voice.id);
    try {
      const res = await base44.functions.invoke('generateOpenAISpeech', {
        voice: voice.id,
        text: `Hi, I'm ${voice.name}. This is how I'll read your pages aloud in NeuroAligned.`,
      });
      if (previewing !== voice.id && !audioRef.current) return; // user stopped meanwhile
      const audio = new Audio(`data:audio/mpeg;base64,${res.data.audio}`);
      audioRef.current = audio;
      audio.onended = () => setPreviewing(null);
      audio.onerror = () => setPreviewing(null);
      await audio.play();
    } catch {
      setPreviewing(null);
    }
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
        onClick={() => setOpen(true)}
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

            {/* Premium voice styles */}
            <p className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-500" /> Premium voices
            </p>

            {VOICES.map(v => {
              const isSelected = selectedId === v.id;
              const isPreviewing = previewing === v.id;
              return (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-secondary'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => select(v.id, v.name)}
                    className="flex-1 flex flex-col items-start min-h-[44px] px-4 py-3 text-left"
                  >
                    <span className={`text-sm ${isSelected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                      {v.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{v.labels}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playPreview(v)}
                    className="w-10 h-10 mr-2 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary"
                    title={isPreviewing ? 'Stop preview' : 'Play preview'}
                  >
                    {isPreviewing ? (
                      audioRef.current ? <Square className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  {isSelected && <Check className="w-4 h-4 mr-4 shrink-0 text-primary" />}
                </div>
              );
            })}

            <p className="px-4 pt-3 text-[11px] text-muted-foreground leading-relaxed">
              Premium voices are AI-generated. Preview samples use a short phrase of generated audio.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}