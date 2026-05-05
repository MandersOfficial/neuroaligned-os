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
    color: 'border-red-800/40 bg-red-950/30 hover:bg-red-900/40',
    activeColor: 'border-red-500/70 bg-red-950/50 ring-2 ring-red-500/40',
    textColor: 'text-red-300',
    subColor: 'text-red-400/70',
    zoneBadge: 'bg-red-500/20 text-red-300 border-red-500/30',
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
    color: 'border-yellow-800/40 bg-yellow-950/30 hover:bg-yellow-900/40',
    activeColor: 'border-yellow-500/70 bg-yellow-950/50 ring-2 ring-yellow-500/40',
    textColor: 'text-yellow-300',
    subColor: 'text-yellow-400/70',
    zoneBadge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
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
    color: 'border-green-800/40 bg-green-950/30 hover:bg-green-900/40',
    activeColor: 'border-green-500/70 bg-green-950/50 ring-2 ring-green-500/40',
    textColor: 'text-green-300',
    subColor: 'text-green-400/70',
    zoneBadge: 'bg-green-500/20 text-green-300 border-green-500/30',
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
    color: 'border-blue-800/40 bg-blue-950/30 hover:bg-blue-900/40',
    activeColor: 'border-blue-500/70 bg-blue-950/50 ring-2 ring-blue-500/40',
    textColor: 'text-blue-300',
    subColor: 'text-blue-400/70',
    zoneBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
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
    color: 'border-purple-800/40 bg-purple-950/30 hover:bg-purple-900/40',
    activeColor: 'border-purple-500/70 bg-purple-950/50 ring-2 ring-purple-500/40',
    textColor: 'text-purple-300',
    subColor: 'text-purple-400/70',
    zoneBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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
    <div className="grid grid-cols-1 gap-2.5 w-full max-w-sm mx-auto">
      {BRAIN_STATES.map((state, i) => (
        <motion.button
          key={state.value}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={() => onSelect(state)}
          className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border-2 transition-all text-left ${
            selected?.value === state.value ? state.activeColor : state.color
          }`}
        >
          <span className="text-xl leading-none">{state.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${state.textColor}`}>{state.label}</p>
            <p className={`text-[11px] leading-tight ${state.subColor}`}>{state.sublabel}</p>
          </div>
          {selected?.value === state.value && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${state.zoneBadge}`}>
              selected
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}