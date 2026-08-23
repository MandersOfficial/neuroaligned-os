import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function getUrgencyLabel(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' };
  if (diffHours < 6) return { label: 'Due in <6h', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
  if (diffHours < 24) return { label: 'Due today', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Due tomorrow', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
}

export default function DueSoonBanner({ tasks, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false);

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const dueSoonTasks = tasks
    .filter(t => t.status !== 'done' && t.due_date)
    .filter(t => new Date(t.due_date) <= twoDaysFromNow)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (dueSoonTasks.length === 0) return null;

  const overdueCount = dueSoonTasks.filter(t => new Date(t.due_date) < now).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-amber-200 bg-amber-50/60 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-amber-800">
            Due Soon
          </span>
          <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">
            {dueSoonTasks.length}
          </span>
          {overdueCount > 0 && (
            <span className="px-2 py-0.5 bg-destructive/15 text-destructive rounded-full text-xs font-bold">
              {overdueCount} overdue
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-amber-600" />
          : <ChevronUp className="w-4 h-4 text-amber-600" />
        }
      </button>

      {/* Task list */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {dueSoonTasks.map(task => {
                const urgency = getUrgencyLabel(task.due_date);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${urgency.bg}`}
                  >
                    <button
                      onClick={() => onUpdate(task, { status: 'done' })}
                      className="relative w-5 h-5 rounded-full border-2 border-current shrink-0 flex items-center justify-center hover:bg-white/60 transition-colors"
                    >
                      <span className="absolute -inset-[12px]" aria-hidden="true" />
                      <Check className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
                    </button>
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{task.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className={`w-3 h-3 ${urgency.color}`} />
                      <span className={`text-xs font-semibold ${urgency.color}`}>{urgency.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}