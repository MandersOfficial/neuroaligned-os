import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Leaf } from 'lucide-react';

// ── Breathing Reset ──────────────────────────────────────────────
function BreathingTool({ onDone }) {
  const phases = [
    { label: 'Breathe in', duration: 4 },
    { label: 'Hold', duration: 4 },
    { label: 'Breathe out', duration: 6 },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          const next = (phaseIdx + 1) % phases.length;
          setPhaseIdx(next);
          if (next === 0) {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles >= 3) { setDone(true); clearInterval(timerRef.current); }
          }
          return phases[(phaseIdx + 1) % phases.length].duration;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phaseIdx, cycles, done]);

  const phase = phases[phaseIdx];
  const progress = 1 - (count / phase.duration);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
        <p className="text-3xl mb-3">🌿</p>
        <p className="font-semibold text-foreground text-lg mb-1">Well done.</p>
        <p className="text-muted-foreground text-sm mb-6">Your nervous system appreciated that.</p>
        <button onClick={onDone} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Continue
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-sm text-muted-foreground mb-6">3 slow breath cycles · {cycles + 1} of 3</p>
      <div className="relative w-32 h-32 mb-6">
        <svg className="absolute inset-0 -rotate-90" width="128" height="128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Wind className="w-6 h-6 text-primary mb-1" />
          <span className="text-2xl font-bold text-foreground">{count}</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-lg font-semibold text-foreground"
        >
          {phase.label}
        </motion.p>
      </AnimatePresence>
      <button onClick={onDone} className="mt-8 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
        Skip for now
      </button>
    </div>
  );
}

// ── Grounding Prompt ─────────────────────────────────────────────
const GROUNDING_STEPS = [
  { num: 5, sense: 'things you can see', emoji: '👁️' },
  { num: 4, sense: 'things you can physically feel', emoji: '🖐️' },
  { num: 3, sense: 'things you can hear', emoji: '👂' },
  { num: 2, sense: 'things you can smell', emoji: '👃' },
  { num: 1, sense: 'thing you can taste', emoji: '👅' },
];

function GroundingTool({ onDone }) {
  const [step, setStep] = useState(0);
  const current = GROUNDING_STEPS[step];

  if (step >= GROUNDING_STEPS.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
        <p className="text-3xl mb-3">🌱</p>
        <p className="font-semibold text-foreground text-lg mb-1">You're here.</p>
        <p className="text-muted-foreground text-sm mb-6">Grounding complete. You're in the present moment.</p>
        <button onClick={onDone} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Continue
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-sm text-muted-foreground mb-8">5-4-3-2-1 Grounding · Step {step + 1} of 5</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="text-center mb-10"
        >
          <p className="text-5xl mb-4">{current.emoji}</p>
          <p className="text-4xl font-bold text-foreground mb-2">{current.num}</p>
          <p className="text-muted-foreground">{current.sense}</p>
        </motion.div>
      </AnimatePresence>
      <button
        onClick={() => setStep(s => s + 1)}
        className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Got it →
      </button>
      <button onClick={onDone} className="mt-4 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
        Skip for now
      </button>
    </div>
  );
}

export default function RegulationTool({ type, onDone }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {type === 'breathing' ? <BreathingTool onDone={onDone} /> : <GroundingTool onDone={onDone} />}
    </div>
  );
}