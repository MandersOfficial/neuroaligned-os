import { motion } from 'framer-motion';

const LEVELS = [
  { max: 25,  label: 'Low Risk',      color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  emoji: '🌿', message: "You're doing well. Keep your current rhythms and don't forget to celebrate that." },
  { max: 50,  label: 'Moderate Risk', color: '#f59e0b', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  emoji: '⚠️', message: "Some strain is building. A few small adjustments now can prevent a bigger crash later." },
  { max: 75,  label: 'High Risk',     color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', emoji: '🔥', message: "Your nervous system is under significant load. Please prioritise rest and regulation today." },
  { max: 100, label: 'Critical',      color: '#ef4444', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    emoji: '🚨', message: "Burnout territory. This is your brain asking for a full stop. Please rest — the work can wait." },
];

function getLevel(score) {
  return LEVELS.find(l => score <= l.max) || LEVELS[LEVELS.length - 1];
}

// SVG arc gauge
const SIZE = 200;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const CIRC = Math.PI * R; // half circle

export default function BurnoutMeter({ score }) {
  const level = getLevel(score);
  const progress = score / 100;
  const dashoffset = CIRC * (1 - progress);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      {/* Gauge */}
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE / 2 + STROKE }}>
        <svg width={SIZE} height={SIZE / 2 + STROKE} viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE}`}>
          {/* Track */}
          <path
            d={`M ${STROKE / 2} ${SIZE / 2} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.path
            d={`M ${STROKE / 2} ${SIZE / 2} A ${R} ${R} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
            fill="none"
            stroke={level.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Score label */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display font-black text-4xl text-foreground leading-none"
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
        {/* Level labels */}
        <div className="absolute bottom-[-18px] left-0 right-0 flex justify-between px-1">
          <span className="text-[10px] text-muted-foreground">Low</span>
          <span className="text-[10px] text-muted-foreground">Critical</span>
        </div>
      </div>

      {/* Level info */}
      <div className="flex-1 space-y-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${level.bg} ${level.border}`}>
          <span>{level.emoji}</span>
          <span className={`text-sm font-bold ${level.text}`}>{level.label}</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{level.message}</p>

        {/* Mini bar breakdown */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Risk level breakdown</p>
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
            {[
              { pct: 25, color: 'bg-green-400' },
              { pct: 25, color: 'bg-amber-400' },
              { pct: 25, color: 'bg-orange-400' },
              { pct: 25, color: 'bg-red-400' },
            ].map((seg, i) => (
              <div key={i} className={`h-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
            ))}
          </div>
          <div className="relative h-3">
            <motion.div
              className="absolute top-0 w-0.5 h-3 bg-foreground rounded-full"
              style={{ left: `${score}%`, transform: 'translateX(-50%)' }}
              animate={{ left: `${score}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}