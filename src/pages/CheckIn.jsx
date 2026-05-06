import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useSensory } from '@/lib/SensoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import BrainStateSelector from '../components/checkin/BrainStateSelector';
import RegulationTool from '../components/checkin/RegulationTool';
import StressInput from '../components/checkin/StressInput';
import ActionSteps from '../components/checkin/ActionSteps';
import SessionComplete from '../components/checkin/SessionComplete';

// Steps:
// 'select'      → Brain state selection
// 'support'     → Supportive message + option to do regulation tool
// 'regulate'    → Breathing / grounding tool
// 'stress'      → "What's stressing you?" (first-time or if not skipped)
// 'steps'       → AI-generated action steps
// 'complete'    → Session complete

export default function CheckIn() {
  const navigate = useNavigate();
  const { applyBrainStateTheme } = useSensory();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [step, setStep] = useState('select');
  const [brainState, setBrainState] = useState(null);
  const [aiSteps, setAiSteps] = useState([]);
  const [stressText, setStressText] = useState('');
  const [firstTask, setFirstTask] = useState('');
  const [weekStats, setWeekStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);

      const [profiles, tasks] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: u.email }),
        base44.entities.Task.filter({ created_by: u.email }),
      ]);

      if (profiles.length > 0) {
        setProfile(profiles[0]);
        // First session = never completed a check-in before
        if (!profiles[0].checkin_preference) setIsFirstSession(true);
      } else {
        setIsFirstSession(true);
      }

      // Compute week stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekTasks = tasks.filter(t => t.created_date && new Date(t.created_date) > weekAgo);
      const done = weekTasks.filter(t => t.status === 'done').length;
      setWeekStats({
        sessions: profiles[0]?.session_count || 0,
        tasksCompleted: done,
        hardDayReturn: (profiles[0]?.last_brain_state === 'overwhelmed' || profiles[0]?.last_brain_state === 'low_energy') && done > 0,
      });

      setLoading(false);
    };
    init();
  }, []);

  const handleStateSelect = async (state) => {
    setBrainState(state);
    setStep('support');

    // Auto-apply sensory theme based on brain state
    applyBrainStateTheme(state.value);

    // Persist last state + increment session count
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        last_brain_state: state.value,
        session_count: (profile.session_count || 0) + 1,
      });
    }
  };

  const handleSteps = (steps, text) => {
    setAiSteps(steps);
    setStressText(text);
    setStep('steps');
  };

  const handleStarted = (taskTitle) => {
    setFirstTask(taskTitle);
    setStep('complete');
  };

  const handleSaveLater = () => {
    setStep('complete');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sm text-foreground">NeuroAligned</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip to dashboard
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* ── State Selection ── */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="text-center space-y-2">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-widest"
                  >
                    {profile ? `Welcome back` : 'Welcome'}
                    {user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display font-bold text-3xl text-foreground"
                  >
                    How's your brain right now?
                  </motion.h1>
                </div>
                <BrainStateSelector selected={brainState} onSelect={handleStateSelect} />
              </motion.div>
            )}

            {/* ── Supportive Message ── */}
            {step === 'support' && brainState && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-8 text-center"
              >
                <div className="space-y-4">
                  <p className="text-5xl">{brainState.emoji}</p>
                  <h2 className="font-display font-bold text-2xl text-foreground leading-snug">
                    {brainState.supportMsg}
                  </h2>
                  <p className="text-muted-foreground">{brainState.subMsg}</p>
                </div>

                {/* Zone badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${brainState.zoneBadge}`}>
                  {brainState.emoji} {brainState.sublabel}
                </div>

                {brainState.regulationTool ? (
                  <div className="w-full max-w-sm space-y-3">
                    <p className="text-xs text-muted-foreground text-center">
                      Regulating first helps your brain access its prefrontal cortex — where planning and decision-making live.
                    </p>
                    <button
                      onClick={() => setStep('regulate')}
                      className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      {brainState.regulationLabel}
                    </button>
                    <button
                      onClick={() => setStep('stress')}
                      className="w-full py-3 border border-border rounded-2xl text-sm text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Skip — go straight to tasks
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setStep('stress')}
                    className="w-full max-w-sm py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Let's go →
                  </button>
                )}
              </motion.div>
            )}

            {/* ── Regulation Tool ── */}
            {step === 'regulate' && brainState && (
              <motion.div
                key="regulate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-sm text-muted-foreground text-center">Take your time. There's no rush.</p>
                <RegulationTool type={brainState.regulationTool} onDone={() => setStep('stress')} />
              </motion.div>
            )}

            {/* ── Stress Input ── */}
            {step === 'stress' && brainState && (
              <motion.div
                key="stress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    What's the one thing on your mind right now?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    It doesn't have to be work. Just whatever's taking up space.
                  </p>
                </div>
                <StressInput brainState={brainState} onSteps={handleSteps} />
              </motion.div>
            )}

            {/* ── Action Steps ── */}
            {step === 'steps' && (
              <motion.div
                key="steps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    {aiSteps.length > 0 ? 'Here are your next small steps' : 'Your tasks are ready'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {aiSteps.length > 0 ? 'Pick one. Just one.' : 'Start with whatever feels easiest.'}
                  </p>
                </div>
                <ActionSteps
                  steps={aiSteps}
                  stressText={stressText}
                  brainState={brainState}
                  onStarted={handleStarted}
                  onSaveLater={handleSaveLater}
                />
              </motion.div>
            )}

            {/* ── Complete ── */}
            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SessionComplete
                  firstTask={firstTask}
                  weekStats={weekStats}
                  isFirstSession={isFirstSession}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}