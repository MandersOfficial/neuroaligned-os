import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, Clock } from 'lucide-react';
import { ENERGY_TASK_FILTER } from '@/components/dashboard/EnergyPicker';

function TodayTaskRow({ task, onToggle }) {
  const done = task.status === 'done';
  return (
    <motion.div
      layout
      className={`flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0 ${done ? 'opacity-50' : ''}`}
    >
      <button onClick={() => onToggle(task)} className="shrink-0">
        {done
          ? <CheckCircle2 className="w-5 h-5 text-primary" />
          : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />}
      </button>
      <span className={`text-sm flex-1 leading-snug ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      {task.estimated_minutes && (
        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
          <Clock className="w-3 h-3" />{task.estimated_minutes}m
        </span>
      )}
    </motion.div>
  );
}

export default function TodayFocusList({ tasks, energy, onToggle }) {
  const navigate = useNavigate();
  const allowedEnergy = ENERGY_TASK_FILTER[energy] || [];
  const filteredTasks = energy === 'burnout_risk'
    ? []
    : tasks.filter(t => allowedEnergy.includes(t.energy_required));
  const hiddenCount = tasks.filter(t => t.status !== 'done').length - filteredTasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Today's Focus</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doneCount}/{tasks.length} done
            {hiddenCount > 0 && ` · ${hiddenCount} hidden (too demanding)`}
          </p>
        </div>
        <Link to="/tasks" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
          All tasks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">
            {energy === 'burnout_risk'
              ? '🛑 Rest. You don\'t need to do anything right now.'
              : tasks.length === 0
              ? '✨ Nothing queued for today. Add tasks to get started.'
              : '🔒 All tasks are too demanding for your current energy.'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {filteredTasks.map(task => (
            <TodayTaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </AnimatePresence>
      )}

      <button
        onClick={() => navigate('/tasks')}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        + Add task for today
      </button>
    </div>
  );
}