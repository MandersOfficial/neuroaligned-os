import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Check, Clock, Loader2 } from 'lucide-react';

export default function ActionSteps({ steps, stressText, brainState, onStarted, onSaveLater }) {
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const hasSteps = steps.length > 0;

  const saveTasks = async () => {
    for (const title of steps) {
      await base44.entities.Task.create({
        title,
        status: 'todo',
        is_today: true,
        energy_required: brainState.value === 'focused' ? 'high' : brainState.value === 'low_energy' ? 'low' : 'medium',
      });
    }
  };

  const handleStart = async () => {
    setStarting(true);
    await saveTasks();
    setStarting(false);
    onStarted(steps[0]);
  };

  const handleSaveLater = async () => {
    setSaving(true);
    await saveTasks();
    setSaving(false);
    onSaveLater();
  };

  if (!hasSteps) {
    return (
      <div className="w-full max-w-sm mx-auto text-center space-y-6 py-4">
        <p className="text-muted-foreground text-sm">No breakdown needed. Your existing tasks are ready.</p>
        <button
          onClick={() => onSaveLater()}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to my tasks →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-center text-xs text-muted-foreground mb-4">
          These are your steps — small, doable, yours.
        </p>
        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                activeStep === i
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 bg-card hover:border-primary/30'
              }`}
              onClick={() => setActiveStep(i)}
            >
              <div className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                activeStep === i ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {activeStep === i && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <p className="text-sm text-foreground leading-snug">{step}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleStart}
          disabled={starting}
          className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Clock className="w-4 h-4" /> Start this (2 min)</>}
        </button>
        <button
          onClick={handleSaveLater}
          disabled={saving}
          className="flex-1 py-3.5 border border-border rounded-2xl text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save for later'}
        </button>
      </div>
    </div>
  );
}