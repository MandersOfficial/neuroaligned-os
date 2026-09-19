import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSensory } from '@/lib/SensoryContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
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
 * Reader voice picker: listen to a preview sample of each voice, stage the
 * preferred choice, and save it explicitly. Bottom-drawer UX on every viewport.
 * Persists the choice to the user's sensory prefs on Save.
 */
export default function ReaderVoicePicker() {
  const { prefs, updatePref } = useSensory();
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState(null); // voice id loading/playing
  const [stagedId, setStagedId] = useState('');
  const [stagedName, setStagedName] = useState('');
  const [saving, setSaving] = useState(false);
  const audioRef = useRef(null);
  const previewTokenRef = useRef(0);

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const stopPreview = () => {
    previewTokenRef.current++;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewing(null);
  };

  const playPreview = async (voice) => {
    if (previewing === voice.id && audioRef.current) {
      stopPreview();
      return;
    }
    stopPreview();
    const token = ++previewTokenRef.current;
    setPreviewing(voice.id);
    try {
      const res = await base44.functions.invoke('generateOpenAISpeech', {
        voice: voice.id,
        text: `Hi, I'm ${voice.name}. This is how I'll read your pages aloud in NeuroAligned.`,
      });
      if (token !== previewTokenRef.current) return; // superseded by another preview or stop
      const audio = new Audio(`data:audio/mpeg;base64,${res.data.audio}`);
      audioRef.current = audio;
      audio.onended = () => setPreviewing(null);
      audio.onerror = () => setPreviewing(null);
      await audio.play();
    } catch {
      if (token === previewTokenRef.current) setPreviewing(null);
    }
  };

  const savedId = prefs.readerVoiceId || '';
  const isDirty = stagedId !== savedId;

  const handleOpenChange = (o) => {
    setOpen(o);
    if (o) {
      // Start staging from whatever is currently saved
      setStagedId(prefs.readerVoiceId || '');
      setStagedName(prefs.readerVoiceName || '');
    } else {
      stopPreview();
    }
  };

  const stage = (id, name) => {
    setStagedId(id);
    setStagedName(name);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updatePref('readerVoiceId', stagedId);
      await updatePref('readerVoiceName', stagedName);
      stopPreview();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedLabel = savedId
    ? (prefs.readerVoiceName || 'Premium voice')
    : 'Device voice (free)';

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="w-full flex items-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-secondary text-sm text-left transition-colors hover:bg-secondary/70"
      >
        <span className="flex-1 truncate">{selectedLabel}</span>
        {savedId && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
      </button>

      <Drawer shouldScaleBackground={false} open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Reader voice</DrawerTitle>
          </DrawerHeader>
          <div className="px-3 max-h-[55vh] overflow-y-auto space-y-1">
            {/* Free default */}
            <button
              type="button"
              onClick={() => stage('', '')}
              className={`w-full flex items-center gap-3 min-h-[44px] px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                !stagedId ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="flex-1">Device voice <span className="font-normal opacity-70">— free, always available</span></span>
              {!stagedId && <Check className="w-4 h-4 shrink-0" />}
            </button>

            {/* Premium voice styles with previews */}
            <p className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-500" /> Premium voices — tap play to listen
            </p>

            {VOICES.map(v => {
              const isSelected = stagedId === v.id;
              const isPreviewing = previewing === v.id;
              const isPlaying = isPreviewing && audioRef.current;
              return (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-secondary'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => stage(v.id, v.name)}
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
                    title={isPlaying ? 'Stop preview' : 'Play preview'}
                  >
                    {isPreviewing ? (
                      isPlaying ? <Square className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  {isSelected && <Check className="w-4 h-4 mr-4 shrink-0 text-primary" />}
                </div>
              );
            })}

            <p className="px-4 pt-3 text-[11px] text-muted-foreground leading-relaxed">
              Premium voices are AI-generated. Your choice is saved when you tap Save.
            </p>
          </div>

          {/* Save / cancel */}
          <div className="px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex gap-2 border-t border-border/40 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!isDirty || saving} onClick={save}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Save voice
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}