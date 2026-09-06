import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronDown, ChevronUp, Zap, Scissors, RotateCcw, Copy, Check } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';
import { AnimatePresence, motion } from 'framer-motion';

const ENERGY_LABELS = {
  1: 'Depleted (1/5)',
  2: 'Low (2/5)',
  3: 'Moderate (3/5)',
  4: 'Good (4/5)',
  5: 'Peak (5/5)',
};

function ResponseBlock({ text, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
      {text}
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors border border-border/40"
        title="Copy response"
      >
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function PromptCard({ icon: Icon, color, bg, title, description, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-primary/30' : 'border-border/60'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/40 ${open ? 'bg-secondary/30' : 'bg-card'}`}
      >
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/40 bg-card space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Prompt 1: What's the most important task given your energy?
function EnergyPriorityPrompt({ energy, tasks }) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult('');
    const pending = tasks
      .filter(t => t.status !== 'done')
      .slice(0, 15)
      .map(t => ({
        title: t.title,
        energy_required: t.energy_required,
        category: t.category,
        due_date: t.due_date,
        estimated_minutes: t.estimated_minutes,
      }));

    const res = await base44.functions.invoke('getEnergyPriority', { energy, tasks: pending });
    setResult(res.data?.text || '');
    setLoading(false);
  };

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Current energy: <span className="font-semibold text-foreground">{ENERGY_LABELS[energy]}</span> · {tasks.filter(t => t.status !== 'done').length} pending tasks
      </p>
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-full text-xs font-semibold transition-colors"
      >
        <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <ResponseBlock text={result} />
        </motion.div>
      )}
    </>
  );
}

// Prompt 2: Break down a large task
function TaskBreakdownPrompt({ tasks }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const highEnergyTasks = tasks.filter(t => t.status !== 'done' && (t.energy_required === 'high' || t.category === 'deep_work'));
  const allPending = tasks.filter(t => t.status !== 'done');

  const getTaskTitle = () => {
    if (customTask.trim()) return customTask.trim();
    const task = allPending.find(t => t.id === selectedTaskId);
    return task?.title || '';
  };

  const run = async () => {
    const title = getTaskTitle();
    if (!title) return;
    setLoading(true);
    setResult('');

    const res = await base44.functions.invoke('breakDownTask', { taskTitle: title });
    setResult(res.data?.text || '');
    setLoading(false);
  };

  const taskTitle = getTaskTitle();

  return (
    <>
      <div className="space-y-2.5">
        {allPending.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Pick a task from your list</label>
            <MobileSelect
              value={selectedTaskId}
              onChange={v => { setSelectedTaskId(v); setCustomTask(''); setResult(''); }}
              options={[{ value: '', label: '— choose a task —' }, ...allPending.map(t => ({ value: t.id, label: t.title }))]}
              placeholder="— choose a task —"
              label="Pick a task"
              className="w-full text-xs border border-input rounded-lg px-2.5 py-2 bg-background text-foreground h-9"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">{allPending.length > 0 ? 'Or type a task manually' : 'Describe the task'}</label>
          <input
            type="text"
            placeholder="e.g. Write Q2 client proposal..."
            value={customTask}
            onChange={e => { setCustomTask(e.target.value); setSelectedTaskId(''); setResult(''); }}
            className="w-full h-8 text-xs border border-input rounded-lg px-2.5 bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <button
        onClick={run}
        disabled={loading || !taskTitle}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-full text-xs font-semibold transition-colors"
      >
        <Scissors className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Breaking it down...' : 'Break It Down'}
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <ResponseBlock text={result} />
        </motion.div>
      )}
    </>
  );
}

export default function AIGuidancePanel({ energy, tasks }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border/40 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">AI Guidance</p>
          <p className="text-xs text-muted-foreground">Neurodivergent-aware coaching</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <PromptCard
          icon={Zap}
          color="text-primary"
          bg="bg-primary/10"
          title="What's my most important task?"
          description="Get energy-matched task recommendation"
        >
          <EnergyPriorityPrompt energy={energy} tasks={tasks} />
        </PromptCard>

        <PromptCard
          icon={Scissors}
          color="text-amber-600"
          bg="bg-amber-50"
          title="Break down a large task"
          description="Turn overwhelming tasks into tiny steps"
        >
          <TaskBreakdownPrompt tasks={tasks} />
        </PromptCard>
      </div>
    </div>
  );
}