import { motion } from 'framer-motion';

export const BRAIN_STATES = [
  {
    value: 'overwhelmed',
    emoji: '🌊',
    label: 'Overwhelmed',
    color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    activeColor: 'border-blue-400 bg-blue-100 ring-2 ring-blue-300',
    textColor: 'text-blue-700',
    supportMsg: "Let's slow this down. You don't have to do everything at once.",
    subMsg: "One small breath first. Then one small thing.",
    regulationTool: 'breathing',
  },
  {
    value: 'low_energy',
    emoji: '🌧️',
    label: 'Low energy',
    color: 'border-slate-200 bg-slate-50 hover:bg-slate-100',
    activeColor: 'border-slate-400 bg-slate-100 ring-2 ring-slate-300',
    textColor: 'text-slate-700',
    supportMsg: "Low energy days are real. You're not lazy.",
    subMsg: "Let's find something that fits where you are right now.",
    regulationTool: 'grounding',
  },
  {
    value: 'scattered',
    emoji: '🍂',
    label: 'Scattered',
    color: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
    activeColor: 'border-amber-400 bg-amber-100 ring-2 ring-amber-300',
    textColor: 'text-amber-700',
    supportMsg: "Scattered is okay. Let's pick just one thread.",
    subMsg: "You don't have to hold it all. Just one thing.",
    regulationTool: 'grounding',
  },
  {
    value: 'neutral',
    emoji: '☁️',
    label: 'Neutral',
    color: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    activeColor: 'border-purple-400 bg-purple-100 ring-2 ring-purple-300',
    textColor: 'text-purple-700',
    supportMsg: "Neutral is a perfectly fine place to start.",
    subMsg: "No pressure. Let's just see what feels doable.",
    regulationTool: null,
  },
  {
    value: 'focused',
    emoji: '✨',
    label: 'Focused',
    color: 'border-green-200 bg-green-50 hover:bg-green-100',
    activeColor: 'border-green-400 bg-green-100 ring-2 ring-green-300',
    textColor: 'text-green-700',
    supportMsg: "You've got some clarity today. Let's use it gently.",
    subMsg: "Pick one meaningful thing and protect this window.",
    regulationTool: null,
  },
];

export default function BrainStateSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-sm mx-auto">
      {BRAIN_STATES.map((state, i) => (
        <motion.button
          key={state.value}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={() => onSelect(state)}
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
            selected?.value === state.value ? state.activeColor : state.color
          }`}
        >
          <span className="text-2xl leading-none">{state.emoji}</span>
          <span className={`font-semibold text-base ${state.textColor}`}>{state.label}</span>
        </motion.button>
      ))}
    </div>
  );
}