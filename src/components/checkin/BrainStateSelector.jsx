import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Regulated Brain Framework
//
// Based on the polyvagal-informed window of tolerance model:
//
//  🔴 RED ZONE   — Hyper-arousal: fight/flight, overwhelm, panic, shutdown
//  🟡 YELLOW ZONE — Edge: anxious, scattered, irritable, revved-up
//  🟢 GREEN ZONE  — Regulated: calm, present, ready to engage
//  🔵 BLUE ZONE   — Hypo-arousal: fog, freeze, low energy, disconnected
//  ✨ FLOW STATE  — Extended Green: deeply engaged, energised, creative
//
// Each zone maps to:
//  - A nervous system state
//  - A regulation strategy (before tasking)
//  - A capacity level (what kind of tasks are appropriate)
//  - AI prompt tone (how to frame task breakdown)
// ─────────────────────────────────────────────────────────────────────────────

export const BRAIN_STATES = [
  {
    value: 'overwhelmed',
    zone: 'red',
    emoji: '🔴',
    label: 'Overwhelmed',
    sublabel: 'Fight / flight / shutdown',
    color: 'border-border/60 bg-card hover:bg-secondary/60',
    activeColor: 'border-red-400 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-400/30',
    textColor: 'text-foreground',
    subColor: 'text-muted-foreground',
    accentColor: 'bg-red-500',
    zoneBadge: 'bg-red-500/20 text-red-600 border-red-300',
    supportMsg: "Your nervous system is in the red zone right now.",
    subMsg: "This is fight-or-flight. You can't think straight here — and that's biology, not failure. Let's regulate first.",
    regulationTool: 'breathing',
    regulationLabel: '🌬️ Box breathing reset (2 min)',
    capacity: 'low',
    taskTone: 'extremely gentle and tiny — the user is in fight/flight. Max 2 steps, very small actions.',
    energyRequired: 'low',
  },
  {
    value: 'scattered',
    zone: 'yellow',
    emoji: '🟡',
    label: 'Scattered / Anxious',
    sublabel: 'Edge of regulation',
    color: 'border-border/60 bg-card hover:bg-secondary/60',
    activeColor: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 ring-2 ring-yellow-400/30',
    textColor: 'text-foreground',
    subColor: 'text-muted-foreground',
    accentColor: 'bg-yellow-400',
    zoneBadge: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
    supportMsg: "You're in the yellow zone — close to regulated, but not quite there.",
    subMsg: "Your brain is revved up or stretched thin. A short grounding exercise can pull you back to centre.",
    regulationTool: 'grounding',
    regulationLabel: '🌱 5-4-3-2-1 grounding (90s)',
    capacity: 'low-medium',
    taskTone: 'short, concrete tasks that give a quick win. Avoid multi-step or ambiguous tasks.',
    energyRequired: 'low',
  },
  {
    value: 'neutral',
    zone: 'green',
    emoji: '🟢',
    label: 'Okay / Neutral',
    sublabel: 'Window of tolerance',
    color: 'border-border/60 bg-card hover:bg-secondary/60',
    activeColor: 'border-green-400 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-400/30',
    textColor: 'text-foreground',
    subColor: 'text-muted-foreground',
    accentColor: 'bg-green-500',
    zoneBadge: 'bg-green-500/20 text-green-700 border-green-300',
    supportMsg: "You're in the green zone — your window of tolerance.",
    subMsg: "You're regulated and present. This is where good work happens. Let's make the most of it.",
    regulationTool: null,
    regulationLabel: null,
    capacity: 'medium',
    taskTone: 'balanced and realistic. A mix of small and medium tasks is fine.',
    energyRequired: 'medium',
  },
  {
    value: 'low_energy',
    zone: 'blue',
    emoji: '🔵',
    label: 'Low energy / Foggy',
    sublabel: 'Hypo-arousal / freeze',
    color: 'border-border/60 bg-card hover:bg-secondary/60',
    activeColor: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-400/30',
    textColor: 'text-foreground',
    subColor: 'text-muted-foreground',
    accentColor: 'bg-blue-500',
    zoneBadge: 'bg-blue-500/20 text-blue-700 border-blue-300',
    supportMsg: "You're in the blue zone — low activation, possibly freeze mode.",
    subMsg: "This is hypo-arousal. Your brain is conserving energy. Movement or stimulation can help bring you back online gently.",
    regulationTool: 'movement',
    regulationLabel: '🏃 Gentle activation (60s)',
    capacity: 'low',
    taskTone: 'very small and easy to start. Prioritise body-doubling-friendly tasks or anything with a clear first step.',
    energyRequired: 'low',
  },
  {
    value: 'focused',
    zone: 'flow',
    emoji: '✨',
    label: 'Focused / In flow',
    sublabel: 'Extended green zone',
    color: 'border-border/60 bg-card hover:bg-secondary/60',
    activeColor: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-400/30',
    textColor: 'text-foreground',
    subColor: 'text-muted-foreground',
    accentColor: 'bg-purple-500',
    zoneBadge: 'bg-purple-500/20 text-purple-700 border-purple-300',
    supportMsg: "You're in flow state — extended green zone.",
    subMsg: "This is rare and precious. Protect this window. Go deep on your most meaningful work before the window closes.",
    regulationTool: null,
    regulationLabel: null,
    capacity: 'high',
    taskTone: 'ambitious but focused. One or two high-value tasks that move the needle. No busywork.',
    energyRequired: 'high',
  },
];

export const ZONE_LABELS = {
  red: { label: 'Red Zone', color: 'text-red-400', bg: 'bg-red-500/10' },
  yellow: { label: 'Yellow Zone', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  green: { label: 'Green Zone', color: 'text-green-400', bg: 'bg-green-500/10' },
  blue: { label: 'Blue Zone', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  flow: { label: 'Flow State', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export default function BrainStateSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-2 w-full max-w-sm mx-auto">
      {BRAIN_STATES.map((state, i) => {
        const isActive = selected?.value === state.value;
        return (
          <motion.button
            key={state.value}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelect(state)}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 transition-all text-left ${
              isActive ? state.activeColor : state.color
            }`}
          >
            {/* Color accent dot */}
            <div className={`w-3 h-3 rounded-full shrink-0 ${state.accentColor}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{state.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{state.sublabel}</p>
            </div>
            {isActive && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${state.accentColor}`} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}