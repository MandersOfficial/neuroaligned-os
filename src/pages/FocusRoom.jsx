import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Play, Pause, SkipForward, X, Volume2, VolumeX, Check, DoorOpen } from 'lucide-react';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const matchesEnergyFilter = (task, filter) => {
  const e = task.energy_required || 'medium';
  switch (filter) {
    case 'low': return e === 'low';
    case 'low_medium': return e === 'low' || e === 'medium';
    case 'high_only': return e === 'high';
    default: return true;
  }
};

/**
 * Immersive Focus Room: runs the active focus mode's work/break rhythm with
 * a timer, your energy-matched task queue, ambient sound and regulation
 * reminders. Full-screen — no sidebar, no bottom nav.
 */
export default function FocusRoom() {
  const [mode, setMode] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('work'); // work | break | long_break
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(true);
  const [blocksDone, setBlocksDone] = useState(0);
  const [ambientOn, setAmbientOn] = useState(false);
  const [showRegulation, setShowRegulation] = useState(false);
  const audioRef = useRef(null);
  const elapsedRef = useRef(0);

  // Load the active focus mode + matching open tasks
  useEffect(() => {
    (async () => {
      const modes = await base44.entities.FocusMode.list('-created_date', 50);
      const active = modes.find(m => m.is_active);
      setMode(active);
      if (active) {
        const all = await base44.entities.Task.list('-is_today', 100);
        const open = all.filter(t => !t.completed_at && (t.status === 'todo' || t.status === 'in_progress'));
        setTasks(open.filter(t => matchesEnergyFilter(t, active.task_energy_filter)));
      }
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  const phaseMinutes = phase === 'work'
    ? (mode?.work_block_minutes ?? 25)
    : phase === 'break'
      ? (mode?.break_minutes ?? 5)
      : (mode?.long_break_minutes ?? 20);
  const phaseLabel = phase === 'work' ? 'Focus Block' : phase === 'break' ? 'Break' : 'Long Break';

  // (Re)set the timer when the phase changes
  useEffect(() => {
    setSecondsLeft(phaseMinutes * 60);
  }, [phase, phaseMinutes]);

  // Countdown
  useEffect(() => {
    if (!running || !mode) return;
    const id = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, mode]);

  // Soft chime when a phase ends
  const chime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
      setTimeout(() => ctx.close(), 1200);
    } catch { /* audio not available */ }
  };

  const advance = () => {
    chime();
    setShowRegulation(false);
    if (phase === 'work') {
      const next = blocksDone + 1;
      if (next >= (mode.blocks_before_long_break ?? 4)) {
        setBlocksDone(0);
        setPhase('long_break');
      } else {
        setBlocksDone(next);
        setPhase('break');
      }
    } else {
      setPhase('work');
    }
  };

  useEffect(() => {
    if (running && secondsLeft === 0 && mode) advance();
  }, [secondsLeft, running, mode]);

  // Regulation reminder: gentle nudge every N minutes of work time
  useEffect(() => {
    if (!running || phase !== 'work' || !mode) return;
    const every = Math.max(5, mode.regulation_reminder_minutes ?? 45) * 60;
    const id = setInterval(() => {
      elapsedRef.current += 15;
      if (elapsedRef.current >= every) {
        elapsedRef.current = 0;
        setShowRegulation(true);
      }
    }, 15000);
    return () => clearInterval(id);
  }, [running, phase, mode]);

  // Ambient sound: gentle synthesized brown-noise wash (no external files)
  const toggleAmbient = () => {
    if (audioRef.current) {
      audioRef.current.src.stop();
      audioRef.current.ctx.close();
      audioRef.current = null;
      setAmbientOn(false);
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const size = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < size; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = mode?.ambient_sound === 'white_noise' ? 2000 : 500;
      const gain = ctx.createGain();
      gain.gain.value = 0.22;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
      audioRef.current = { ctx, src };
      setAmbientOn(true);
    } catch { /* audio not available */ }
  };

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.src.stop();
      audioRef.current.ctx.close();
    }
  }, []);

  const completeTask = async (task) => {
    await base44.entities.Task.update(task.id, { status: 'done', completed_at: new Date().toISOString() });
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  if (loading) return <div className="fixed inset-0 z-[70] bg-background flex items-center justify-center"><InlineSpinner /></div>;

  if (!mode) {
    return (
      <div className="fixed inset-0 z-[70] bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">🚪</div>
          <h1 className="font-display font-bold text-xl text-foreground">Activate a focus mode to enter the Focus Room</h1>
          <p className="text-sm text-muted-foreground">Pick a mode that matches your brain today — the room runs its rhythm for you.</p>
          <Link to="/focus-modes" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
            <DoorOpen className="w-4 h-4" /> Go to Focus Modes
          </Link>
        </div>
      </div>
    );
  }

  const accent = mode.color_accent || '#8B5CF6';
  const visibleTasks = mode.show_one_task ? tasks.slice(0, 1) : tasks.slice(0, 8);
  const progress = 1 - secondsLeft / (phaseMinutes * 60);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col text-white"
      style={{ background: `linear-gradient(160deg, #0a0a1a 0%, ${accent}22 100%)` }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">{mode.emoji}</span>
          <span className="font-semibold">{mode.name}</span>
          <span className="opacity-60">· Block {blocksDone + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleAmbient} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title={ambientOn ? 'Mute ambient sound' : 'Play ambient sound'}>
            {ambientOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </button>
          <Link to="/focus-modes" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Exit Focus Room">
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 -mt-10">
        <p className="text-xs uppercase tracking-[0.25em] opacity-60">{phaseLabel}</p>
        <p className="font-display font-bold text-7xl sm:text-8xl tabular-nums">{formatTime(secondsLeft)}</p>
        <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%`, background: accent }} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-bold hover:bg-white/90 transition-colors"
          >
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
          </button>
          <button onClick={advance} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors" title="Skip to next phase">
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>

        {showRegulation && (
          <div className="max-w-sm text-center text-sm bg-white/10 rounded-2xl px-5 py-4 space-y-1">
            <p className="font-semibold">🌿 Regulation check-in</p>
            <p className="opacity-80">Stretch, breathe, sip some water. Your brain works better regulated.</p>
            <button onClick={() => setShowRegulation(false)} className="text-xs underline opacity-70">Got it</button>
          </div>
        )}
      </div>

      {/* Task queue */}
      <div className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md w-full mx-auto space-y-2 shrink-0">
        {phase === 'work' && (
          visibleTasks.length > 0 ? (
            <>
              <p className="text-[11px] uppercase tracking-widest opacity-50 text-center pb-1">
                {mode.show_one_task ? 'Your one task' : `Energy-matched tasks (${tasks.length})`}
              </p>
              {visibleTasks.map(t => (
                <div key={t.id} className={`flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ${mode.reduce_visual_noise ? 'bg-white/5' : ''}`}>
                  <button
                    onClick={() => completeTask(t)}
                    className="w-6 h-6 rounded-full border border-white/40 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
                    title="Mark done"
                  >
                    <Check className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <p className="text-sm flex-1 min-w-0 truncate">{t.title}</p>
                  <span className="text-[10px] uppercase opacity-50 shrink-0">{t.energy_required}</span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-center text-xs opacity-50">No matching open tasks — just breathe and focus.</p>
          )
        )}
      </div>
    </div>
  );
}