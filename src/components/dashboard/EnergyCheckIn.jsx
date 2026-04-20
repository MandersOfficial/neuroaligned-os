import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Droplets, CloudRain, AlertTriangle, ChevronDown, X } from 'lucide-react';

export const ENERGY_STATES = [
  {
    value: 'hyperfocus',
    numericValue: 5,
    label: 'Hyperfocus',
    emoji: '⚡',
    icon: Zap,
    desc: 'In the zone — tackle your hardest work',
    hint: 'You have deep focus and high stamina. Perfect for complex, high-effort tasks.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    pill: 'bg-violet-100 text-violet-700',
    allowedEnergy: ['high', 'medium', 'low'],
  },
  {
    value: 'flow',
    numericValue: 4,
    label: 'Flow',
    emoji: '🌊',
    icon: Droplets,
    desc: 'Smooth & creative — good work ahead',
    hint: 'Steady energy and creativity. Great for medium-effort and creative tasks.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    pill: 'bg-blue-100 text-blue-700',
    allowedEnergy: ['medium', 'low'],
  },
  {
    value: 'sluggish',
    numericValue: 2,
    label: 'Sluggish',
    emoji: '🌧️',
    icon: CloudRain,
    desc: 'Low battery — light tasks only',
    hint: 'Your energy is low. Protect it with gentle, easy tasks and short breaks.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    pill: 'bg-amber-100 text-amber-700',
    allowedEnergy: ['low'],
  },
  {
    value: 'burnout_risk',
    numericValue: 1,
    label: 'Burnout Risk',
    emoji: '🚨',
    icon: AlertTriangle,
    desc: 'Rest first — protect yourself',
    hint: 'You\'re close to your edge. Rest is productive. Only do the absolute minimum today.',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    pill: 'bg-red-100 text-red-700',
    allowedEnergy: [],
  },
];

export default function EnergyCheckIn({ energy, onEnergyChange }) {
  const [open, setOpen] = useState(false);

  const current = ENERGY_STATES.find(s => s.value === energy) || ENERGY_STATES[1];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all w-full sm:w-auto ${current.bg}`}
      >
        <span className="text-2xl leading-none">{current.emoji}</span>
        <div className="text-left min-w-0">
          <div className={`font-semibold text-sm ${current.color}`}>{current.label}</div>
          <div className="text-xs text-muted-foreground truncate">{current.desc}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 z-30 bg-card border border-border rounded-2xl shadow-2xl p-3 w-72"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-semibold text-foreground">How's your energy right now?</p>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {ENERGY_STATES.map(state => {
                  const StateIcon = state.icon;
                  const isActive = energy === state.value;
                  return (
                    <button
                      key={state.value}
                      onClick={() => { onEnergyChange(state.value); setOpen(false); }}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-sm transition-all text-left border-2 ${
                        isActive ? state.bg + ' shadow-sm' : 'border-transparent hover:bg-secondary'
                      }`}
                    >
                      <span className="text-xl leading-none mt-0.5">{state.emoji}</span>
                      <div className="min-w-0">
                        <div className={`font-semibold text-sm ${isActive ? state.color : 'text-foreground'}`}>
                          {state.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{state.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-3 px-1">
                Your task board will filter automatically based on your selection.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}