import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Droplets, Footprints, X, Heart, ChevronUp, ChevronDown, Bell, BellOff } from 'lucide-react';
import BreathingGuide from './BreathingGuide';

const CUES = [
  {
    id: 'breathe',
    icon: Wind,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Time to breathe',
    message: 'Your nervous system needs a reset. 2 minutes of breathing can restore focus.',
    action: 'Open Breathing Guide',
    interval: 45, // minutes
  },
  {
    id: 'hydrate',
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    title: 'Hydration check 💧',
    message: 'Dehydration worsens brain fog and focus. Time for a glass of water.',
    action: 'Got it!',
    interval: 60,
  },
  {
    id: 'stretch',
    icon: Footprints,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Gentle body check 🌿',
    message: 'Stand up, roll your shoulders, shake out your hands. 60 seconds is enough.',
    action: 'Done!',
    interval: 90,
  },
];

const STRETCH_PROMPTS = [
  'Roll your shoulders back 3 times',
  'Gently tilt your head side to side',
  'Shake out your hands and wrists',
  'Take 3 deep breaths with your eyes closed',
  'Stand up and stretch your arms overhead',
  'Wiggle your toes and feel the floor',
];

const QUICK_TOOLS = [
  { id: 'breathe', icon: Wind, label: 'Breathe', color: 'text-primary' },
  { id: 'hydrate', icon: Droplets, label: 'Hydrate', color: 'text-blue-500' },
  { id: 'stretch', icon: Footprints, label: 'Stretch', color: 'text-green-600' },
];

export default function RegulationWidget() {
  const [expanded, setExpanded] = useState(false);
  const [activeView, setActiveView] = useState(null); // null | 'breathe' | 'stretch'
  const [reminder, setReminder] = useState(null);
  const [remindersOn, setRemindersOn] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [stretchPrompt, setStretchPrompt] = useState(STRETCH_PROMPTS[0]);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Track session time
  useEffect(() => {
    const tick = setInterval(() => setSessionMinutes(m => m + 1), 60000);
    return () => clearInterval(tick);
  }, []);

  // Timed reminders
  useEffect(() => {
    if (!remindersOn) return;
    const timers = CUES.map(cue =>
      setInterval(() => {
        if (!expanded) {
          setReminder(cue);
          setDismissed(false);
          if (cue.id === 'stretch') {
            const idx = Math.floor(Math.random() * STRETCH_PROMPTS.length);
            setStretchPrompt(STRETCH_PROMPTS[idx]);
          }
        }
      }, cue.interval * 60 * 1000)
    );
    return () => timers.forEach(clearInterval);
  }, [remindersOn, expanded]);

  const dismissReminder = () => { setReminder(null); setDismissed(true); };

  const handleQuickTool = (id) => {
    setActiveView(id === activeView ? null : id);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Reminder toast */}
      <AnimatePresence>
        {reminder && !expanded && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-card border border-border/60 rounded-2xl shadow-xl p-4 max-w-[280px] space-y-2.5"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${reminder.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <reminder.icon className={`w-4 h-4 ${reminder.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{reminder.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{reminder.message}</p>
              </div>
              <button onClick={dismissReminder} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveView(reminder.id === 'hydrate' ? null : reminder.id); setExpanded(true); setReminder(null); }}
                className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                {reminder.action}
              </button>
              <button onClick={dismissReminder} className="px-3 py-1.5 bg-secondary text-muted-foreground rounded-xl text-xs hover:bg-border transition-colors">
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-card border border-border/60 rounded-2xl shadow-2xl w-72 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Nervous System</p>
                  <p className="text-xs text-muted-foreground">Session: {sessionMinutes}m</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRemindersOn(!remindersOn)}
                  title={remindersOn ? 'Mute reminders' : 'Enable reminders'}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  {remindersOn ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setExpanded(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick tools */}
            <div className="p-3 border-b border-border/40">
              <div className="grid grid-cols-3 gap-2">
                {QUICK_TOOLS.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleQuickTool(tool.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                      activeView === tool.id
                        ? 'bg-primary/8 border-primary/25 text-primary'
                        : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-secondary/50'
                    }`}
                    style={{ background: activeView === tool.id ? 'hsl(var(--primary)/0.06)' : undefined }}
                  >
                    <tool.icon className={`w-4 h-4 ${activeView === tool.id ? 'text-primary' : tool.color}`} />
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active view content */}
            <AnimatePresence mode="wait">
              {activeView === 'breathe' && (
                <motion.div
                  key="breathe"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 overflow-hidden"
                >
                  <BreathingGuide />
                </motion.div>
              )}
              {activeView === 'hydrate' && (
                <motion.div
                  key="hydrate"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 overflow-hidden"
                >
                  <div className="text-center space-y-4">
                    <div className="text-4xl">💧</div>
                    <p className="text-sm font-semibold text-foreground">Hydration matters</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Even mild dehydration (1-2%) reduces cognitive function, worsens brain fog, and impairs focus — effects that are amplified in neurodivergent brains.
                    </p>
                    <p className="text-xs text-primary font-medium bg-primary/5 border border-primary/10 rounded-xl px-3 py-2">
                      🎯 Goal: 8 glasses a day. Grab one right now!
                    </p>
                    <button
                      onClick={() => setActiveView(null)}
                      className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      ✓ Water acquired
                    </button>
                  </div>
                </motion.div>
              )}
              {activeView === 'stretch' && (
                <motion.div
                  key="stretch"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 overflow-hidden"
                >
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🌿</div>
                    <p className="text-sm font-semibold text-foreground">Body reset</p>
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <p className="text-sm text-green-800 font-medium">{stretchPrompt}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Moving your body for 60 seconds reduces cortisol and improves focus.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStretchPrompt(STRETCH_PROMPTS[Math.floor(Math.random() * STRETCH_PROMPTS.length)])}
                        className="flex-1 py-2 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-border transition-colors"
                      >
                        Another cue
                      </button>
                      <button
                        onClick={() => setActiveView(null)}
                        className="flex-1 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer tip */}
            {!activeView && (
              <div className="px-4 py-3 bg-secondary/30">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {remindersOn ? '🔔 Gentle reminders are on — you can mute anytime' : '🔕 Reminders muted — tap 🔔 to re-enable'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pill button */}
      <motion.button
        onClick={() => { setExpanded(!expanded); setReminder(null); }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-all ${
          expanded
            ? 'bg-card border-border/60 text-foreground'
            : 'bg-primary text-primary-foreground border-primary/30'
        }`}
      >
        {reminder && !expanded && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
        )}
        <Heart className="w-4 h-4" />
        <span className="text-xs font-semibold">
          {expanded ? 'Close' : 'Regulate'}
        </span>
      </motion.button>
    </div>
  );
}