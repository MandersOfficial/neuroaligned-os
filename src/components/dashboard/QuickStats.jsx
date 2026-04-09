import { CheckCircle, Clock, TrendingUp, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickStats({ tasks }) {
  const done = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
  const totalMinutes = tasks.filter(t => t.status !== 'done').reduce((a, t) => a + (t.estimated_minutes || 0), 0);
  const streak = 4; // placeholder

  const stats = [
    { icon: CheckCircle, label: 'Done Today', value: done, color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Clock, label: 'In Queue', value: pending, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: TrendingUp, label: 'Est. Minutes', value: totalMinutes || '—', color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: CalendarDays, label: 'Day Streak', value: `${streak}🔥`, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}