import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import BurnoutMeter from '../components/burnout/BurnoutMeter';
import RiskFactors from '../components/burnout/RiskFactors';
import RecoveryPlan from '../components/burnout/RecoveryPlan';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw } from 'lucide-react';

function calcRisk({ stress, missedBreaks, overdueTasks, hoursWorked, energyPattern }) {
  let score = 0;
  score += stress * 8;                            // 0–40
  score += Math.min(missedBreaks, 5) * 5;         // 0–25
  score += Math.min(overdueTasks, 6) * 3;         // 0–18
  score += Math.min(Math.max(hoursWorked - 6, 0), 6) * 2; // 0–12
  score += energyPattern === 'declining' ? 5 : energyPattern === 'crashed' ? 10 : 0;
  return Math.min(Math.round(score), 100);
}

export default function BurnoutRisk() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Self-report inputs
  const [stress, setStress] = useState(2);           // 1–5
  const [missedBreaks, setMissedBreaks] = useState(2);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [energyPattern, setEnergyPattern] = useState('stable');

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Task.list('-created_date', 100)])
      .then(([u, t]) => { setUser(u); setTasks(t); setLoading(false); });
  }, []);

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;
  const highEnergyTasks = tasks.filter(t => t.energy_required === 'high' && t.status !== 'done').length;

  const riskScore = calcRisk({ stress, missedBreaks, overdueTasks, hoursWorked, energyPattern });

  const factors = [
    {
      id: 'stress',
      label: 'Self-Reported Stress',
      value: stress,
      max: 5,
      contribution: stress * 8,
      icon: '🧠',
      description: 'How stressed you feel right now',
      interactive: true,
      type: 'slider',
      setter: setStress,
    },
    {
      id: 'breaks',
      label: 'Missed Breaks Today',
      value: missedBreaks,
      max: 5,
      contribution: Math.min(missedBreaks, 5) * 5,
      icon: '☕',
      description: 'Regulation breaks skipped',
      interactive: true,
      type: 'stepper',
      setter: setMissedBreaks,
    },
    {
      id: 'hours',
      label: 'Hours Worked Today',
      value: hoursWorked,
      max: 12,
      contribution: Math.min(Math.max(hoursWorked - 6, 0), 6) * 2,
      icon: '⏱️',
      description: 'Hours worked beyond 6h adds risk',
      interactive: true,
      type: 'stepper',
      setter: setHoursWorked,
    },
    {
      id: 'tasks',
      label: 'Overdue Tasks',
      value: overdueTasks,
      max: 6,
      contribution: Math.min(overdueTasks, 6) * 3,
      icon: '📋',
      description: 'Tasks past their due date',
      interactive: false,
    },
    {
      id: 'highEnergy',
      label: 'High-Energy Tasks Pending',
      value: highEnergyTasks,
      max: 10,
      contribution: Math.min(highEnergyTasks, 5) * 2,
      icon: '⚡',
      description: 'Deep work tasks still in queue',
      interactive: false,
    },
    {
      id: 'energy',
      label: 'Energy Pattern',
      value: energyPattern,
      contribution: energyPattern === 'crashed' ? 10 : energyPattern === 'declining' ? 5 : 0,
      icon: '📉',
      description: 'How your energy has shifted today',
      interactive: true,
      type: 'select',
      options: ['rising', 'stable', 'declining', 'crashed'],
      setter: setEnergyPattern,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h1 className="font-display font-bold text-2xl text-foreground">Burnout Risk</h1>
              </div>
              <p className="text-sm text-muted-foreground">A real-time view of your nervous system load — so you can act before it's too late.</p>
            </div>
            <button
              onClick={() => { setStress(2); setMissedBreaks(2); setHoursWorked(8); setEnergyPattern('stable'); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Meter + Summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/60 rounded-2xl p-6"
          >
            <BurnoutMeter score={riskScore} />
          </motion.div>

          {/* Risk Factors */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <RiskFactors factors={factors} totalScore={riskScore} />
          </motion.div>

          {/* Recovery Plan */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <RecoveryPlan score={riskScore} stress={stress} missedBreaks={missedBreaks} overdueTasks={overdueTasks} energyPattern={energyPattern} />
          </motion.div>

        </div>
      </main>
    </div>
  );
}