import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAIN_STATES, ZONE_LABELS } from '../checkin/BrainStateSelector';
import { ArrowRight } from 'lucide-react';

// Visual zone bar showing where the user is in the window of tolerance
const ZONES = [
  { zone: 'red',    emoji: '🔴', label: 'Red',    tip: 'Hyper-arousal · Fight/flight' },
  { zone: 'yellow', emoji: '🟡', label: 'Yellow', tip: 'Edge · Anxious/scattered' },
  { zone: 'green',  emoji: '🟢', label: 'Green',  tip: 'Regulated · Ready to work' },
  { zone: 'flow',   emoji: '✨', label: 'Flow',   tip: 'Deep engagement' },
  { zone: 'blue',   emoji: '🔵', label: 'Blue',   tip: 'Hypo-arousal · Freeze/fog' },
];

const ZONE_GUIDANCE = {
  red:    { next: 'Breathe first, then pick one tiny task.', color: 'text-red-400' },
  yellow: { next: 'Ground yourself, then start with a quick win.', color: 'text-yellow-400' },
  green:  { next: 'You\'re regulated. Pick meaningful work.', color: 'text-green-400' },
  blue:   { next: 'Move your body gently, then start small.', color: 'text-blue-400' },
  flow:   { next: 'Protect this window. Go deep on what matters.', color: 'text-purple-400' },
};

export default function RegulationZoneWidget({ lastBrainState }) {
  const stateObj = BRAIN_STATES.find(s => s.value === lastBrainState);
  const zone = stateObj?.zone || null;
  const zoneInfo = zone ? ZONE_LABELS[zone] : null;
  const guidance = zone ? ZONE_GUIDANCE[zone] : null;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-sm text-foreground">Regulated Brain Zone</h4>
        <Link to="/check-in" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          Check in <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Zone bar */}
      <div className="flex gap-1.5">
        {ZONES.map(z => (
          <div
            key={z.zone}
            title={z.tip}
            className={`flex-1 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
              zone === z.zone
                ? 'ring-2 ring-white/30 scale-110 shadow-lg'
                : 'opacity-30'
            }`}
            style={{ background: zone === z.zone ? undefined : 'transparent' }}
          >
            {z.emoji}
          </div>
        ))}
      </div>

      {zone && stateObj ? (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stateObj.zoneBadge}`}>
            {stateObj.emoji} {zoneInfo?.label} Zone · {stateObj.sublabel}
          </div>
          <p className={`text-xs font-medium ${guidance.color}`}>
            {guidance.next}
          </p>
        </motion.div>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">No check-in yet today.</p>
          <Link to="/check-in" className="text-xs text-primary hover:underline">
            Start your session →
          </Link>
        </div>
      )}

      {/* Framework legend */}
      <details className="group">
        <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">›</span>
          What is the Regulated Brain Framework?
        </summary>
        <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <p>Your nervous system determines what work your brain can do. The framework maps 5 zones:</p>
          <div className="space-y-1 pl-1">
            {ZONES.map(z => (
              <p key={z.zone}>{z.emoji} <span className="font-medium text-foreground/80">{z.label}:</span> {z.tip}</p>
            ))}
          </div>
          <p className="pt-1">Regulate first → then task. Always.</p>
        </div>
      </details>
    </div>
  );
}