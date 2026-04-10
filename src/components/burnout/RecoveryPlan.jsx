import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATIC_ACTIONS = {
  low: [
    { emoji: '🌿', title: 'Maintain your rhythm', body: "You're in a good place. Protect your schedule by keeping one buffer hour free each afternoon." },
    { emoji: '💧', title: 'Hydrate proactively', body: 'Low risk doesn\'t mean zero risk. Drink water now and schedule one regulation break after lunch.' },
    { emoji: '✅', title: 'Celebrate a win', body: 'Your brain needs positive reinforcement. Name one thing you completed today and acknowledge it.' },
  ],
  moderate: [
    { emoji: '⏸️', title: 'Take a 10-minute break now', body: 'Step away from screens completely. Walk, breathe, or just sit. Your focus will return stronger.' },
    { emoji: '📋', title: 'Trim your task list', body: 'Pick your single most important task. Defer or delegate everything else — seriously.' },
    { emoji: '🫁', title: 'Box breathing (4 minutes)', body: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times. Activates your parasympathetic system.' },
    { emoji: '🔕', title: 'Silence notifications for 1 hour', body: 'Context-switching is expensive for neurodivergent brains. Create a protected focus window.' },
  ],
  high: [
    { emoji: '🚨', title: 'Stop and rest — not optional', body: 'Your nervous system is signalling overload. A 20-minute full rest now prevents a 3-day crash.' },
    { emoji: '🗑️', title: 'Cancel or defer 2 tasks today', body: 'You cannot pour from an empty cup. Protect tomorrow by letting go of something today.' },
    { emoji: '📵', title: 'Go offline for 30 minutes', body: 'No email, no Slack, no scrolling. Physical separation from screens resets your stress hormones.' },
    { emoji: '🧊', title: 'Cold water on your face/wrists', body: 'Activates the dive reflex and drops heart rate within 30 seconds. Immediate nervous system reset.' },
    { emoji: '🤝', title: 'Tell someone you trust', body: 'Social connection is regulation. A 5-minute check-in call can shift your entire state.' },
  ],
  critical: [
    { emoji: '🛑', title: 'Declare today a rest day', body: 'Cancel everything non-essential. Your brain is in emergency mode. Rest is the work right now.' },
    { emoji: '🏥', title: 'Consider professional support', body: 'Chronic burnout in neurodivergent people is real and serious. A therapist or coach who understands ND brains can help.' },
    { emoji: '📵', title: 'Devices off for 2+ hours', body: 'No half-measures. Full disconnection allows your cortisol to actually drop.' },
    { emoji: '🌳', title: 'Get outside — nature, not errands', body: 'Even 15 minutes in a park measurably reduces cortisol. This is medicine.' },
    { emoji: '💤', title: 'Prioritise sleep above everything', body: 'One good night of sleep does more for recovery than any productivity tool.' },
  ],
};

function getStaticLevel(score) {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

export default function RecoveryPlan({ score, stress, missedBreaks, overdueTasks, energyPattern }) {
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const levelKey = getStaticLevel(score);
  const actions = STATIC_ACTIONS[levelKey];

  const generateAIPlan = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate coach specialising in neurodivergent burnout recovery. Based on this person's current state, give a personalised, concrete 3-step recovery micro-plan for the next 2 hours.

Current state:
- Burnout risk score: ${score}/100 (${levelKey})
- Self-reported stress: ${stress}/5
- Missed breaks today: ${missedBreaks}
- Overdue tasks: ${overdueTasks}
- Energy pattern: ${energyPattern}

Return JSON with:
- headline: one empathetic sentence (max 15 words) addressing them directly
- steps: array of exactly 3 objects, each with: emoji (string), title (max 6 words), action (1–2 sentence concrete instruction), duration (e.g. "5 min", "20 min")
- closing: one gentle motivating sentence`,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                emoji: { type: 'string' },
                title: { type: 'string' },
                action: { type: 'string' },
                duration: { type: 'string' },
              },
            },
          },
          closing: { type: 'string' },
        },
      },
    });
    setAiPlan(res);
    setLoading(false);
  };

  const toggle = (id) => setCompletedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const LEVEL_COLORS = {
    low: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  };
  const c = LEVEL_COLORS[levelKey];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" /> Recovery Plan
        </h2>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Static actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actions.map((a, i) => {
                const done = completedIds.includes(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => toggle(i)}
                    className={`cursor-pointer border rounded-2xl p-4 space-y-2 transition-all ${
                      done ? 'border-green-200 bg-green-50 opacity-60' : `${c.border} ${c.bg} hover:opacity-90`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{a.emoji}</span>
                      {done && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className={`text-xs font-semibold ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{a.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                  </motion.div>
                );
              })}
            </div>

            {completedIds.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-800 font-medium">
                ✅ {completedIds.length} action{completedIds.length > 1 ? 's' : ''} completed — your nervous system noticed.
              </div>
            )}

            {/* AI personalised plan */}
            <div className={`border ${c.border} rounded-2xl overflow-hidden`}>
              <div className={`${c.bg} px-5 py-3.5 flex items-center justify-between`}>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Personalised Recovery Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">A tailored 2-hour plan based on your current state</p>
                </div>
                {!aiPlan && (
                  <button
                    onClick={generateAIPlan}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {aiPlan && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 py-4 space-y-4 bg-card overflow-hidden"
                  >
                    <p className="text-sm font-medium text-foreground italic">"{aiPlan.headline}"</p>
                    <div className="space-y-3">
                      {aiPlan.steps?.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm">{step.emoji}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground">{step.title}</p>
                              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{step.duration}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-primary font-medium border-t border-border/40 pt-3">{aiPlan.closing}</p>
                    <button onClick={() => { setAiPlan(null); generateAIPlan(); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Regenerate
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}