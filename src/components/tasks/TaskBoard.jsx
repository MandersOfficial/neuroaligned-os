import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Clock, Flame, Zap, Leaf, Calendar, ChevronDown, Sparkles, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENERGY_STATES } from '@/components/dashboard/EnergyCheckIn';
import PullToRefresh from '@/components/ui/PullToRefresh';

const ENERGY_CONFIG = {
  low: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', label: 'Low' },
  medium: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' },
  high: { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
};

const CATEGORY_EMOJI = {
  deep_work: '🔭', admin: '📋', creative: '🎨', communication: '💬', self_care: '🌱', planning: '🗺️'
};

const STATUS_COLS = [
  { id: 'todo', label: 'To Do', color: 'bg-secondary' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', label: 'Done', color: 'bg-green-100' },
];

function TaskCard({ task, projects, recommended, onUpdate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const energy = ENERGY_CONFIG[task.energy_required] || ENERGY_CONFIG.medium;
  const EnergyIcon = energy.icon;
  const project = projects.find(p => p.id === task.project_id);
  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-card border rounded-xl p-4 group cursor-pointer transition-all hover:shadow-md ${
        recommended ? 'border-primary/40 shadow-sm shadow-primary/10' : 'border-border/50'
      } ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      {recommended && (
        <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2">
          <Sparkles className="w-3 h-3" /> AI Recommended
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => onUpdate(task, { status: task.status === 'done' ? 'todo' : 'done' })}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
            task.status === 'done' ? 'border-primary bg-primary' : 'border-border hover:border-primary'
          }`}
        >
          {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
        </button>
        <p className={`text-sm font-medium leading-snug flex-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
              {['todo', 'in_progress', 'done', 'deferred'].map(s => (
                <button key={s} onClick={() => { onUpdate(task, { status: s }); setMenuOpen(false); }}
                  className={`w-full px-3 py-1.5 text-xs text-left transition-colors hover:bg-secondary capitalize ${task.status === s ? 'font-semibold text-primary' : 'text-foreground'}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
              <div className="border-t border-border/40 mt-1 pt-1">
                <button onClick={() => { onDelete(task); setMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-xs text-left text-destructive hover:bg-destructive/5 flex items-center gap-1.5 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 ml-7">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${energy.bg} ${energy.color}`}>
          <EnergyIcon className="w-3 h-3" />{energy.label}
        </span>
        {task.category && (
          <span className="text-xs text-muted-foreground">{CATEGORY_EMOJI[task.category]}</span>
        )}
        {task.estimated_minutes && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />{task.estimated_minutes}m
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-0.5 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            <Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {project && (
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground flex items-center gap-1">
            {project.emoji} {project.name}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function TaskBoard({ tasks, projects, energy, recommendedIds, onTasksChange }) {
  const energyState = ENERGY_STATES.find(s => s.value === energy) || ENERGY_STATES[1];
  const isFiltering = energyState.allowedEnergy.length < 3;

  const handleRefresh = useCallback(async () => {
    const refreshed = await base44.entities.Task.list('-created_date', 100);
    onTasksChange(refreshed);
  }, [onTasksChange]);

  const filteredByEnergy = (colTasks) => {
    if (energyState.allowedEnergy.length === 3) return colTasks; // hyperfocus — show all
    if (energyState.value === 'burnout_risk') return []; // burnout — show nothing
    return colTasks.filter(t => energyState.allowedEnergy.includes(t.energy_required));
  };

  const handleUpdate = async (task, changes) => {
    const updated = await base44.entities.Task.update(task.id, changes);
    onTasksChange(tasks.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const handleDelete = async (task) => {
    await base44.entities.Task.delete(task.id);
    onTasksChange(tasks.filter(t => t.id !== task.id));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="flex flex-col gap-5 flex-1 px-6 py-6">
      {/* Energy filter banner */}
      {isFiltering && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 ${energyState.bg}`}
        >
          <span className="text-lg leading-none mt-0.5">{energyState.emoji}</span>
          <div>
            <p className={`text-sm font-semibold ${energyState.color}`}>
              {energyState.label} mode active
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{energyState.hint}</p>
          </div>
          <Info className="w-4 h-4 text-muted-foreground ml-auto shrink-0 mt-0.5" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {STATUS_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const matchingTasks = col.id === 'done' ? colTasks : filteredByEnergy(colTasks);
        const dimmedCount = col.id !== 'done' ? colTasks.length - matchingTasks.length : 0;

        return (
          <div key={col.id} className="flex flex-col gap-3 min-w-0">
            {/* Column header */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${col.color}`}>
              <span className="text-xs font-semibold text-foreground">{col.label}</span>
              <span className="text-xs text-muted-foreground font-medium">{colTasks.length}</span>
            </div>

            {/* Energy mismatch notice */}
            {dimmedCount > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                🔒 {dimmedCount} task{dimmedCount > 1 ? 's' : ''} hidden — too demanding right now
              </p>
            )}

            {/* Cards */}
            <div className="space-y-3 flex-1">
              <AnimatePresence>
                {matchingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/40 rounded-xl">
                    <p className="text-xs">
                      {energyState.value === 'burnout_risk'
                        ? '🛑 Rest. You don\'t have to do anything right now.'
                        : col.id === 'done' ? '✅ Nothing done yet'
                        : col.id === 'todo' ? '🌿 All clear'
                        : '▶️ Nothing in progress'}
                    </p>
                  </div>
                ) : (
                  matchingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      recommended={recommendedIds.includes(task.id)}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      </div>
    </div>
    </PullToRefresh>
  );
}