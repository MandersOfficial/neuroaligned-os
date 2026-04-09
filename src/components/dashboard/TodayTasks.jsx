import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Plus, Clock, Flame, Leaf, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const ENERGY_CONFIG = {
  low: { label: 'Low energy', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
  medium: { label: 'Medium', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  high: { label: 'High energy', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
};

function TaskItem({ task, onComplete }) {
  const cfg = ENERGY_CONFIG[task.energy_required] || ENERGY_CONFIG.medium;
  const Icon = cfg.icon;
  const done = task.status === 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: done ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all group ${done ? 'bg-secondary/40 border-border/30' : 'bg-card border-border/50 hover:border-primary/20 hover:shadow-sm'}`}
    >
      <button
        onClick={() => onComplete(task)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${done ? 'border-primary bg-primary' : 'border-border hover:border-primary'}`}
      >
        {done && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
          {task.estimated_minutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {task.estimated_minutes}m
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function TodayTasks({ tasks, onTasksChange }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleComplete = async (task) => {
    const updated = await base44.entities.Task.update(task.id, {
      status: task.status === 'done' ? 'todo' : 'done',
      completed_at: task.status === 'done' ? null : new Date().toISOString(),
    });
    onTasksChange(tasks.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    const task = await base44.entities.Task.create({
      title: newTitle.trim(),
      status: 'todo',
      is_today: true,
      energy_required: 'medium',
    });
    onTasksChange([...tasks, task]);
    setNewTitle('');
    setAdding(false);
  };

  const done = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-foreground">Today's Queue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{done} of {tasks.length} done</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/15 flex items-center justify-center text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Add Task */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="What needs doing?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                className="h-9 text-sm border-primary/30 focus-visible:ring-primary"
              />
              <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">Add</Button>
              <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-2xl mb-2">✨</p>
              <p className="text-sm">Your queue is clear. Add a task or take a breath.</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem key={task.id} task={task} onComplete={handleComplete} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}