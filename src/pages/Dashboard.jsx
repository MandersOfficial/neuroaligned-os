import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import RegulationWidget from '../components/regulation/RegulationWidget';
import TrialBanner from '../components/subscription/TrialBanner';
import GoogleConnectWidget from '../components/dashboard/GoogleConnectWidget';
import { CheckCircle2, Circle, ArrowRight, Zap, Clock, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 as b44 } from '@/api/base44Client';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ENERGY_OPTIONS = [
  { value: 'hyperfocus', emoji: '⚡', label: 'Hyperfocus', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { value: 'flow', emoji: '🌊', label: 'Flow', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { value: 'sluggish', emoji: '🌧️', label: 'Sluggish', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { value: 'burnout_risk', emoji: '🚨', label: 'Burnout Risk', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
];

const ENERGY_TASK_FILTER = {
  hyperfocus: ['high', 'medium', 'low'],
  flow: ['medium', 'low'],
  sluggish: ['low'],
  burnout_risk: [],
};

function EnergyPicker({ energy, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ENERGY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all ${
            energy === opt.value ? opt.bg + ' shadow-sm' : 'border-border bg-card hover:bg-secondary'
          }`}
        >
          <span className="text-xl leading-none">{opt.emoji}</span>
          <span className={`text-[10px] font-semibold leading-tight ${energy === opt.value ? opt.color : 'text-muted-foreground'}`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

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

function PersonalizedInsight({ profile, energy }) {
  const workStyle = profile?.work_style;
  const challenge = profile?.biggest_challenge;

  const insights = {
    hyperfocus: `You're in hyperfocus mode${workStyle === 'Deep focus blocks' ? ' — perfect for your deep focus style' : ''}. Tackle your hardest task now.`,
    flow: `Steady flow energy${challenge === 'Task initiation & getting started' ? ' — a great time to start that task you\'ve been avoiding' : ' — great for creative or medium-effort work'}.`,
    sluggish: `Low energy day${challenge === 'Managing energy & avoiding burnout' ? ' — honor your limits and do only what matters most' : ' — keep it gentle. Admin and easy tasks only'}.`,
    burnout_risk: `You're running on empty. Rest is the most productive thing you can do right now. Protect yourself first.`,
  };

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-primary/5 border border-primary/10">
      <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-sm text-foreground leading-relaxed">{insights[energy] || insights.flow}</p>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [energy, setEnergy] = useState('flow');
  const [tasks, setTasks] = useState([]);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      if (!u) { base44.auth.redirectToLogin('/dashboard'); return; }
      setUser(u);
      const [t, subs, profiles] = await Promise.all([
        base44.entities.Task.filter({ is_today: true }),
        base44.entities.Subscription.filter({ created_by: u.email }, '-created_date', 1),
        base44.entities.UserProfile.filter({ user_email: u.email }),
      ]);
      setTasks(t);
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        if (p.last_brain_state) setEnergy(p.last_brain_state);
      }
      const sub = subs[0];
      if (sub?.trial_end_date) {
        const days = Math.max(0, Math.ceil((new Date(sub.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)));
        setTrialDaysLeft(days);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = await base44.entities.Task.update(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const allowedEnergy = ENERGY_TASK_FILTER[energy] || [];
  const filteredTasks = energy === 'burnout_risk'
    ? []
    : tasks.filter(t => allowedEnergy.includes(t.energy_required));
  const hiddenCount = tasks.filter(t => t.status !== 'done').length - filteredTasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const firstName = user?.full_name?.split(' ')[0] || 'there';

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

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <TrialBanner daysLeft={trialDaysLeft} />

        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Greeting */}
          <div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mt-0.5">
              {getGreeting()}, {firstName} 👋
            </h1>
            {profile?.neurotypes?.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.neurotypes.slice(0, 2).join(' · ')} · {profile.work_style || 'Your style'}
              </p>
            )}
          </div>

          {/* Energy check-in */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">How's your energy right now?</p>
              <p className="text-xs text-muted-foreground mt-0.5">This filters your tasks to match your capacity.</p>
            </div>
            <EnergyPicker energy={energy} onChange={setEnergy} />
          </div>

          {/* Personalized insight */}
          <PersonalizedInsight profile={profile} energy={energy} />

          {/* Today's tasks */}
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
                  <TodayTaskRow key={task.id} task={task} onToggle={handleToggleTask} />
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

          {/* Quick actions — personalized based on onboarding */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/check-in"
              className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors group"
            >
              <span className="text-xl">🧠</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Brain Check-In</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.checkin_preference === 'daily' ? 'Your daily check-in is ready' : 'Rate your state & get a plan'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            {profile?.biggest_challenge === 'Staying focused & avoiding distractions' || profile?.work_style?.includes('sprint') ? (
              <Link
                to="/focus-rooms"
                className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors group"
              >
                <span className="text-xl">🚀</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Focus Room</p>
                  <p className="text-xs text-muted-foreground">Work alongside others for accountability</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ) : (
              <Link
                to="/body-doubling"
                className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors group"
              >
                <span className="text-xl">👥</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Body Doubling</p>
                  <p className="text-xs text-muted-foreground">25-min focus sprint with a peer</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            )}
          </div>

          {/* Bottom widgets */}
          <div className="grid sm:grid-cols-2 gap-5">
            <GoogleConnectWidget />

            {/* Profile summary */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-semibold text-foreground">Your Setup</p>
              <div className="space-y-2.5">
                {[
                  ['Peak Energy', profile?.energy_peak || 'Not set'],
                  ['Work Style', profile?.work_style || 'Not set'],
                  ['Biggest Challenge', profile?.biggest_challenge?.split(' ').slice(0, 4).join(' ') + '…' || 'Not set'],
                  ['Trial', trialDaysLeft != null ? `${trialDaysLeft} days left` : 'Active'],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[160px]">{val}</span>
                  </div>
                ))}
              </div>
              <Link to="/integrations" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                <Zap className="w-3 h-3" /> Manage integrations
              </Link>
            </div>
          </div>

        </div>
      </main>

      <RegulationWidget />
    </div>
  );
}