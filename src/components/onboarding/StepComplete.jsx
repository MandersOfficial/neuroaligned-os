import { Button } from "@/components/ui/button";
import { Rocket, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURE_HIGHLIGHTS = [
  'Energy-aware task queue calibrated to your rhythm',
  'AI guidance tuned to your neurotype profile',
  'Nervous system check-ins built into your day',
];

export default function StepComplete({ name, onFinish, loading }) {
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
          NeuroAligned has used your answers to set up a personalized environment. 
          No overwhelming dashboards, no rigid systems — just a calm, intelligent workspace 
          built around how <em>your</em> brain works.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3">
        <p className="font-semibold text-sm text-foreground mb-4">What's waiting for you:</p>
        {FEATURE_HIGHLIGHTS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
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
          {loading ? 'Setting up your OS...' : 'Enter NeuroAligned'}
          <Rocket className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
}