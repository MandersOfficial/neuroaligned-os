import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const ENERGY_LABELS = { rising: '📈 Rising', stable: '➡️ Stable', declining: '📉 Declining', crashed: '💥 Crashed' };

function ContributionBar({ value, max = 40 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct > 70 ? 'bg-red-400' : pct > 40 ? 'bg-amber-400' : 'bg-green-400';
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mt-1.5">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function RiskFactors({ factors, totalScore }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display font-semibold text-base text-foreground">Contributing Factors</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {factors.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border/60 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground shrink-0">+{f.contribution}</span>
            </div>

            {/* Interactive controls */}
            {f.interactive && f.type === 'slider' && (
              <div className="space-y-1">
                <input
                  type="range" min={1} max={5} value={f.value}
                  onChange={e => f.setter(Number(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Calm</span><span>Overwhelmed</span>
                </div>
              </div>
            )}

            {f.interactive && f.type === 'stepper' && (
              <div className="flex items-center gap-3">
                <button onClick={() => f.setter(Math.max(0, f.value - 1))} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{f.value}</span>
                <button onClick={() => f.setter(Math.min(f.max || 12, f.value + 1))} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            {f.interactive && f.type === 'select' && (
              <MobileSelect
                value={f.value}
                onChange={v => f.setter(v)}
                options={f.options.map(o => ({ value: o, label: ENERGY_LABELS[o] || o }))}
                className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}

            {!f.interactive && (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-foreground">{f.value}</span>
              </div>
            )}

            <ContributionBar value={f.contribution} max={40} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}