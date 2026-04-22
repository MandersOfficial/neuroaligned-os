import { useEffect, useState } from 'react';
import { Check, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BUILD_STEPS = [
  { label: 'Analysing your neurotype profile', duration: 900 },
  { label: 'Calibrating your focus mode', duration: 800 },
  { label: 'Seeding your task queue', duration: 700 },
  { label: 'Starting your 14-day free trial', duration: 600 },
  { label: 'Personalising your dashboard', duration: 700 },
];

export default function StepComplete({ name, data, onFinish, loading }) {
  const goals = data?.initial_goals || [];
  const neurotypes = data?.neurotypes || [];
  const focusPreset = data?.focus_preset;
  const challenge = data?.biggest_challenge;

  const [building, setBuilding] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [started, setStarted] = useState(false);

  const focusLabel = {
    adhd_flow: '⚡ ADHD Flow — 25 min sprints',
    deep_focus: '🔭 Deep Focus — 90 min blocks',
    gentle_start: '🌱 Gentle Start — 15 min bursts',
    hyperfocus: '🌊 Hyperfocus — open-ended blocks',
  }[focusPreset] || '⚡ Focus mode ready';

  const summaryItems = [
    neurotypes.length > 0 && `Personalized for: ${neurotypes.slice(0, 2).join(' · ')}`,
    focusPreset && focusLabel,
    challenge && `Tuned to tackle: ${challenge}`,
    goals.length > 0 && `${goals.length} task${goals.length > 1 ? 's' : ''} waiting in your dashboard`,
  ].filter(Boolean);

  const handleStart = async () => {
    setBuilding(true);
    setStarted(true);

    // Kick off the actual backend work in parallel
    onFinish();

    // Animate steps sequentially
    let elapsed = 0;
    for (let i = 0; i < BUILD_STEPS.length; i++) {
      elapsed += BUILD_STEPS[i].duration;
      await new Promise(r => setTimeout(r, BUILD_STEPS[i].duration));
      setCompletedSteps(prev => [...prev, i]);
    }
    // onFinish handles the redirect once all backend calls are done
  };

  const totalDuration = BUILD_STEPS.reduce((s, step) => s + step.duration, 0);
  const progress = building
    ? Math.min(100, Math.round((completedSteps.length / BUILD_STEPS.length) * 100))
    : 0;
  const allDone = completedSteps.length === BUILD_STEPS.length;

  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 mx-auto"
      >
        <span className="text-5xl">🧠</span>
      </motion.div>

      <div className="space-y-4">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
          {building ? 'Building your workspace…' : `Your OS is ready, ${name}!`}
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
          {building
            ? 'Hang tight — we\'re personalising everything for your brain.'
            : 'NeuroAligned has used your answers to build a workspace that fits your brain — not a generic productivity template.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!building ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border/60 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3"
          >
            <p className="font-semibold text-sm text-foreground mb-4">Your personalised setup:</p>
            {summaryItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {item}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/60 rounded-2xl p-6 text-left max-w-md mx-auto space-y-4"
          >
            {/* Progress bar */}
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{progress}% complete</p>

            {/* Steps */}
            <div className="space-y-3">
              {BUILD_STEPS.map((step, i) => {
                const done = completedSteps.includes(i);
                const active = !done && completedSteps.length === i;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      done ? 'bg-primary/15' : active ? 'bg-accent/20 animate-pulse' : 'bg-secondary'
                    }`}>
                      {done
                        ? <Check className="w-3 h-3 text-primary" />
                        : <div className={`w-2 h-2 rounded-full ${active ? 'bg-accent' : 'bg-border'}`} />
                      }
                    </div>
                    <span className={done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {allDone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm font-semibold text-primary pt-2"
              >
                ✓ Workspace ready! Redirecting you…
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!building && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handleStart}
            disabled={loading || started}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-full px-12 py-4 text-base font-semibold transition-colors"
          >
            Enter NeuroAligned
            <Rocket className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground mt-3">You can change anything from your dashboard settings</p>
        </motion.div>
      )}
    </div>
  );
}