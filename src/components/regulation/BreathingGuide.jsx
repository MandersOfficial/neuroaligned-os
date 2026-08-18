import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@/lib/analytics';

const PATTERNS = [
  { id: 'box', label: 'Box Breathing', desc: 'Calms nervous system', steps: ['Inhale', 'Hold', 'Exhale', 'Hold'], durations: [4, 4, 4, 4], colors: ['#8B5CF6', '#6D28D9', '#8B5CF6', '#6D28D9'] },
  { id: '478', label: '4-7-8 Breath', desc: 'Reduces anxiety fast', steps: ['Inhale', 'Hold', 'Exhale', ''], durations: [4, 7, 8, 0], colors: ['#3B82F6', '#1D4ED8', '#10B981', '#10B981'] },
  { id: 'coherent', label: 'Coherent Breathing', desc: 'Steady & grounding', steps: ['Inhale', '', 'Exhale', ''], durations: [5, 0, 5, 0], colors: ['#8B5CF6', '#8B5CF6', '#3B82F6', '#3B82F6'] },
];

export default function BreathingGuide({ onClose }) {
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(pattern.durations[0]);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  const stop = () => { clearInterval(intervalRef.current); setRunning(false); setPhase(0); setCount(pattern.durations[0]); Analytics.breathingStopped(pattern.id, cycles); setCycles(0); };

  const start = () => {
    Analytics.breathingStarted(pattern.id);
    setRunning(true);
    setPhase(0);
    setCount(pattern.durations[0]);
    setCycles(0);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const next = (p + 1) % 4;
            // Skip phases with duration 0
            const nextNext = pattern.durations[next] === 0 ? (next + 1) % 4 : next;
            if (nextNext === 0) setCycles(c => c + 1);
            setCount(pattern.durations[nextNext]);
            return nextNext;
          });
          return pattern.durations[phase] || 1;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase, pattern]);

  useEffect(() => {
    if (!running) { setCount(pattern.durations[0]); setPhase(0); }
  }, [pattern, running]);

  const activeStep = pattern.steps[phase];
  const activeDuration = pattern.durations[phase];
  const progress = activeDuration > 0 ? 1 - ((count - 1) / activeDuration) : 1;
  const isInhale = phase === 0;
  const isExhale = phase === 2;
  const scale = running ? (isInhale ? 1 + progress * 0.35 : isExhale ? 1.35 - progress * 0.35 : 1.35) : 1;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Pattern selector */}
      <div className="flex gap-1.5 w-full">
        {PATTERNS.map(p => (
          <button
            key={p.id}
            onClick={() => { if (!running) setPattern(p); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all border ${pattern.id === p.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30'} ${running ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Circle */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {/* Outer ring */}
        <motion.div
          animate={{ scale }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border-2 opacity-20"
          style={{ borderColor: pattern.colors[phase] }}
        />
        <motion.div
          animate={{ scale: running ? scale * 0.85 : 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-4 rounded-full opacity-10"
          style={{ backgroundColor: pattern.colors[phase] }}
        />
        {/* Main circle */}
        <motion.div
          animate={{ scale: running ? scale * 0.6 : 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: pattern.colors[phase] + '28' }}
        />
        {/* Center */}
        <div className="relative z-10 text-center">
          {running ? (
            <>
              <div className="text-3xl font-bold text-foreground tabular-nums">{count}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: pattern.colors[phase] }}>{activeStep}</div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground text-center px-4">{pattern.desc}</div>
          )}
        </div>
      </div>

      {cycles > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: Math.min(cycles, 5) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary opacity-60" />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 w-full">
        {!running ? (
          <button onClick={start} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Begin Breathing
          </button>
        ) : (
          <button onClick={stop} className="flex-1 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-semibold hover:bg-border transition-colors">
            Stop
          </button>
        )}
      </div>
    </div>
  );
}