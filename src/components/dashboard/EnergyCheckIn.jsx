import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, ChevronDown } from 'lucide-react';

const LEVELS = [
  { value: 1, label: 'Depleted', desc: 'Gentle tasks only', color: 'text-red-400', bg: 'bg-red-50 border-red-200', emoji: '🪫' },
  { value: 2, label: 'Low', desc: 'Light admin & email', color: 'text-orange-400', bg: 'bg-orange-50 border-orange-200', emoji: '🔋' },
  { value: 3, label: 'Moderate', desc: 'Regular work mode', color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200', emoji: '⚡' },
  { value: 4, label: 'Good', desc: 'Creative & complex tasks', color: 'text-green-500', bg: 'bg-green-50 border-green-200', emoji: '✨' },
  { value: 5, label: 'Peak', desc: 'Deep work & breakthroughs', color: 'text-primary', bg: 'bg-primary/5 border-primary/20', emoji: '🚀' },
];

export default function EnergyCheckIn({ energy, onEnergyChange }) {
  const [open, setOpen] = useState(false);
  const current = LEVELS.find(l => l.value === energy) || LEVELS[2];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all w-full sm:w-auto ${current.bg}`}
      >
        <span className="text-2xl">{current.emoji}</span>
        <div className="text-left">
          <div className={`font-semibold text-sm ${current.color}`}>Energy: {current.label}</div>
          <div className="text-xs text-muted-foreground">{current.desc}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-30 bg-card border border-border rounded-2xl shadow-xl p-2 min-w-[220px]"
          >
            <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">How are you feeling right now?</p>
            {LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => { onEnergyChange(level.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-secondary ${energy === level.value ? 'bg-secondary font-semibold' : ''}`}
              >
                <span className="text-lg">{level.emoji}</span>
                <div className="text-left">
                  <div className={`font-medium ${level.color}`}>{level.label}</div>
                  <div className="text-xs text-muted-foreground">{level.desc}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}