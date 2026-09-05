import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Timer, CheckCircle2, ArrowLeft, Pencil, Zap } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const SPRINT_SECONDS = 25 * 60;

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Lobby: waiting for a partner ──────────────────────────────────
function Lobby({ user, myTask, onMyTaskChange, session, onCancel }) {
  const [editing, setEditing] = useState(!myTask);

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center"
      >
        <Users className="w-9 h-9 text-primary" />
      </motion.div>

      <div className="space-y-1">
        <h2 className="font-display font-bold text-2xl text-foreground">Looking for a focus partner…</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          You'll be matched with another NeuroAligned user for a 25-minute sprint. Stay on your screen — matching is instant when someone joins.
        </p>
      </div>

      {/* My task */}
      <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl p-4 text-left space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your focus task this sprint</p>
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={myTask}
              onChange={e => onMyTaskChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && myTask.trim() && setEditing(false)}
              placeholder="e.g. Write intro paragraph for proposal"
              className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary/30"
            />
            <button
              onClick={() => myTask.trim() && setEditing(false)}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Set
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{myTask || <span className="text-muted-foreground italic">No task set</span>}</p>
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
          />
        ))}
      </div>

      <button
        onClick={onCancel}
        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Cancel &amp; leave queue
      </button>
    </div>
  );
}

// ── Active sprint ─────────────────────────────────────────────────
function ActiveSprint({ session, user, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(SPRINT_SECONDS);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // If session has a started_at, calculate remaining time
    if (session.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
      setSecondsLeft(Math.max(0, SPRINT_SECONDS - elapsed));
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const isHost = session.host_email === user.email;
  const myTask = isHost ? session.host_task : session.partner_task;
  const partnerTask = isHost ? session.partner_task : session.host_task;
  const partnerName = isHost ? session.partner_name : session.host_name;

  const progress = ((SPRINT_SECONDS - secondsLeft) / SPRINT_SECONDS) * 100;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-10 rounded-3xl"
          >
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Sprint complete!</h2>
            <p className="text-muted-foreground text-sm mb-6">Great work staying accountable.</p>
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Finish session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl text-foreground tabular-nums">{formatTime(secondsLeft)}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">remaining</span>
        </div>
      </div>

      {/* Partner info */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-green-400 font-medium">{partnerName} is working alongside you</span>
      </div>

      {/* Task cards */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <div className="bg-card border border-primary/30 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wide">You</p>
          <p className="text-sm text-foreground font-medium leading-snug">{myTask || 'No task set'}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-1">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{partnerName?.split(' ')[0]}</p>
          <p className="text-sm text-foreground font-medium leading-snug">{partnerTask || 'Working…'}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="text-center text-xs text-muted-foreground max-w-xs">
        <p>🔕 Silence notifications · 🎧 Put on headphones · 💪 You've got this</p>
      </div>

      <button
        onClick={onComplete}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
      >
        End sprint early
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function BodyDoubling() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myTask, setMyTask] = useState('');
  const [phase, setPhase] = useState('lobby'); // lobby | active | done
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { base44.auth.redirectToLogin('/body-doubling'); return; }
      setUser(u);
      setLoading(false);
      joinOrCreate(u);
    }).catch(() => {
      base44.auth.redirectToLogin('/body-doubling');
    });
    return () => clearInterval(pollRef.current);
  }, []);

  const joinOrCreate = useCallback(async (u) => {
    // Try to find an open waiting session to join
    const waiting = await base44.entities.BodyDoublingSession.filter({ status: 'waiting' }, '-created_date', 10);
    const joinable = waiting.find(s => s.host_email !== u.email);

    if (joinable) {
      // Join as partner
      const updated = await base44.entities.BodyDoublingSession.update(joinable.id, {
        partner_email: u.email,
        partner_name: u.full_name || u.email.split('@')[0],
        status: 'active',
        started_at: new Date().toISOString(),
      });
      setSession({ ...joinable, ...updated });
      setMyTask(joinable.partner_task || '');
      setPhase('active');
    } else {
      // Create new session as host
      const newSession = await base44.entities.BodyDoublingSession.create({
        host_email: u.email,
        host_name: u.full_name || u.email.split('@')[0],
        status: 'waiting',
        sprint_minutes: 25,
      });
      setSession(newSession);
      startPolling(newSession.id, u);
    }
  }, []);

  const startPolling = (sessionId, u) => {
    pollRef.current = setInterval(async () => {
      const sessions = await base44.entities.BodyDoublingSession.filter({ status: 'active' }, '-created_date', 20);
      const matched = sessions.find(s => s.id === sessionId);
      if (matched) {
        clearInterval(pollRef.current);
        setSession(matched);
        setPhase('active');
      }
    }, 3000);
  };

  const handleMyTaskChange = async (val) => {
    setMyTask(val);
    if (session) {
      await base44.entities.BodyDoublingSession.update(session.id, { host_task: val });
    }
  };

  const handleCancel = async () => {
    clearInterval(pollRef.current);
    if (session) await base44.entities.BodyDoublingSession.update(session.id, { status: 'completed' });
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    clearInterval(pollRef.current);
    if (session) await base44.entities.BodyDoublingSession.update(session.id, { status: 'completed', completed_at: new Date().toISOString() });
    setPhase('done');
  };

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
      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-5 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Body Doubling
              </h1>
              <p className="text-xs text-muted-foreground">25-minute focus sprints with a peer</p>
            </div>
          </div>

          {/* Card */}
          <div className="relative bg-card border border-border/60 rounded-3xl p-6 overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20" style={{ background: 'hsl(var(--primary))' }} />

            <AnimatePresence mode="wait">
              {phase === 'lobby' && (
                <motion.div key="lobby" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Lobby user={user} myTask={myTask} onMyTaskChange={handleMyTaskChange} session={session} onCancel={handleCancel} />
                </motion.div>
              )}
              {phase === 'active' && session && (
                <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ActiveSprint session={session} user={user} onComplete={handleComplete} />
                </motion.div>
              )}
              {phase === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-5">
                  <span className="text-5xl">🧠✅</span>
                  <h2 className="font-display font-bold text-2xl text-foreground">Sprint complete!</h2>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Accountability works. Research shows body doubling increases task completion by up to 3×.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => { setPhase('lobby'); joinOrCreate(user); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <Zap className="w-4 h-4" /> Start another sprint
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-5 py-2.5 border border-border rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Back to dashboard
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* What is body doubling? */}
          {phase === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm space-y-2">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wide">💡 What is body doubling?</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Body doubling is an ADHD strategy where working alongside another person (virtually or in-person) makes it easier to stay on task. The presence of another person engages a part of the brain that keeps you anchored.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}