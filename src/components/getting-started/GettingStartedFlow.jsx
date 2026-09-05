import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Check, Loader2, ExternalLink,
  Brain, Battery, ListTodo, Timer, HeartHandshake,
  Calendar, FileText, Sparkles,
} from 'lucide-react';

const DONE_KEY = 'na_getting_started_v1';

const GOOGLE_CALENDAR_ID = '69fd1ec20e0e670e38251275';
const NOTION_ID = '6a1cfa4c8db502aafb000e1a';

const DAILY_LOOP = [
  { icon: Battery, title: 'Check your energy', desc: 'Start on the dashboard by picking how your brain feels. Tasks filter to match your capacity.', color: 'text-violet-500', bg: 'bg-violet-50' },
  { icon: ListTodo, title: 'Pick today’s focus', desc: 'Work from Today’s Focus. One task at a time beats an overwhelming list.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Timer, title: 'Work in a focus mode', desc: 'Use Focus Modes for timed work/break blocks that match your rhythm.', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: HeartHandshake, title: 'Regulate & reflect', desc: 'Take regulation breaks. Journal a brain dump when scattered. Rest is productive.', color: 'text-rose-500', bg: 'bg-rose-50' },
];

const TIPS = [
  { icon: Brain, title: 'Check in before you check off', desc: 'Rate your state in the Brain Check-In to get a plan tuned to your energy — not a generic to-do list.' },
  { icon: Sparkles, title: 'Break tasks down with AI', desc: 'Stuck on a big task? Open Task Breakdown and let AI split it into small, doable steps.' },
  { icon: Calendar, title: 'Let deadlines sync themselves', desc: 'Connect Google Calendar and project deadlines push to your calendar automatically — no manual entry.' },
  { icon: FileText, title: 'Use Notion as your source of truth', desc: 'Connect Notion and your tasks & projects stay in two-way sync — edit here or there.' },
];

function ConnectorButton({ connectorId, name, connected, onRecheck }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connectorId);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setLoading(false);
          onRecheck();
        }
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold">
        <Check className="w-4 h-4" /> {name} connected
      </div>
    );
  }
  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
      Connect {name}
    </button>
  );
}

const StepShell = ({ children }) => (
  <div className="space-y-5">{children}</div>
);

export default function GettingStartedFlow({ user, onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [statuses, setStatuses] = useState({});

  const TOTAL = 5; // welcome, loop, calendar, notion, tips+done

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('checkConnectorStatuses', {
        connectorIds: [GOOGLE_CALENDAR_ID, NOTION_ID],
      });
      if (res?.data?.statuses) setStatuses(res.data.statuses);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchStatuses(); }, [fetchStatuses]);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const close = () => {
    localStorage.setItem(DONE_KEY, '1');
    onComplete();
  };

  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
        <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-5 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepShell>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-2xl text-foreground">Welcome, {firstName} 👋</h1>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      NeuroAligned OS is built for ADHD, autistic, dyslexic, and burnout-recovering brains.
                      Instead of forcing you through a rigid to-do list, it works with your energy and attention.
                      Here’s the 2-minute tour of how to get the most out of it.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm text-foreground leading-relaxed">
                    <strong className="font-semibold">The core idea:</strong> regulate first, then produce.
                    You’ll check how you feel, work on what fits, and rest before you burn out.
                  </div>
                </StepShell>
              )}

              {step === 1 && (
                <StepShell>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">Your daily flow</h2>
                    <p className="text-sm text-muted-foreground mt-1">Four steps — repeat them each work session.</p>
                  </div>
                  <div className="space-y-3">
                    {DAILY_LOOP.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 bg-card border border-border/60 rounded-2xl p-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{i + 1}. {item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { close(); navigate('/check-in'); }}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Try the Brain Check-In now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">Connect Google Calendar</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      This unlocks the biggest wins: project deadlines push to your calendar, you can schedule
                      focus meetings, and upcoming events show on your dashboard.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Deadlines sync automatically</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Schedule project syncs & deadline calls</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Auto-break scheduler protects your energy</li>
                  </ul>
                  <ConnectorButton
                    connectorId={GOOGLE_CALENDAR_ID}
                    name="Google Calendar"
                    connected={!!statuses[GOOGLE_CALENDAR_ID]}
                    onRecheck={fetchStatuses}
                  />
                  <p className="text-xs text-muted-foreground">You can skip this and connect any time under Integrations.</p>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">Connect Notion</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Use Notion as your source of truth. Tasks and projects sync both ways — edit in Notion
                      and it shows up here, or plan here and it lands in Notion.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Pull tasks from a Notion database</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Sync projects & status back to Notion</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Draft SOPs straight to your workspace</li>
                  </ul>
                  <ConnectorButton
                    connectorId={NOTION_ID}
                    name="Notion"
                    connected={!!statuses[NOTION_ID]}
                    onRecheck={fetchStatuses}
                  />
                  <p className="text-xs text-muted-foreground">You can skip this and connect any time under Integrations.</p>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">Best practices</h2>
                    <p className="text-sm text-muted-foreground mt-1">A few habits that make this actually work.</p>
                  </div>
                  <div className="space-y-3">
                    {TIPS.map((tip, i) => {
                      const Icon = tip.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 bg-card border border-border/60 rounded-2xl p-4">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                    <p className="text-sm font-semibold text-foreground">You’re all set 🎉</p>
                    <p className="text-xs text-muted-foreground mt-1">Your dashboard is ready. Start with an energy check-in.</p>
                  </div>
                </StepShell>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-border/40 px-5 py-4 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < TOTAL - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {step === 0 ? 'Start the tour' : 'Next'} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={close}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to dashboard <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export { DONE_KEY };