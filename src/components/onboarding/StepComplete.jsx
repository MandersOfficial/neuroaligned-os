import { Button } from "@/components/ui/button";
import { Rocket, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StepComplete({ name, data, onFinish, loading }) {
  const goals = data?.initial_goals || [];
  const neurotypes = data?.neurotypes || [];
  const focusPreset = data?.focus_preset;
  const challenge = data?.biggest_challenge;

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
          Your OS is ready, {name}!
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
          NeuroAligned has used your answers to build a workspace that fits <em>your</em> brain —
          not a generic productivity template. Here's what's set up for you:
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3">
        <p className="font-semibold text-sm text-foreground mb-4">Your personalized setup:</p>
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          size="lg"
          onClick={onFinish}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-6 text-base font-semibold group"
        >
          {loading ? 'Building your workspace...' : 'Enter NeuroAligned'}
          <Rocket className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">You can change anything from your dashboard settings</p>
      </motion.div>
    </div>
  );
}