import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Anchor, Timer, Music, X } from 'lucide-react';

const TOOLS = [
  {
    icon: Wind,
    label: 'Box Breathing',
    desc: '4-4-4-4 reset',
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-100',
    component: 'BoxBreathing',
  },
  {
    icon: Anchor,
    label: '5-4-3-2-1',
    desc: 'Grounding',
    color: 'text-teal-500',
    bg: 'bg-teal-50 border-teal-100',
    component: 'Grounding',
  },
  {
    icon: Timer,
    label: 'Focus Timer',
    desc: '25 min sprint',
    color: 'text-violet-500',
    bg: 'bg-violet-50 border-violet-100',
    component: 'FocusTimer',
  },
  {
    icon: Music,
    label: 'Brain Music',
    desc: 'Focus sounds',
    color: 'text-pink-500',
    bg: 'bg-pink-50 border-pink-100',
    component: null,
  },
];

function BoxBreathing({ onClose }) {
  const [phase, setPhase] = useState(0);
  const [active, setActive] = useState(false);
  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const counts = [4, 4, 4, 4];

  const startBreathing = () => {
    setActive(true);
    let p = 0;
    const cycle = () => {
      setPhase(p % 4);
      p++;
      setTimeout(cycle, counts[p % 4] * 1000);
    };
    cycle();
  };

  return (
    <div className="text-center space-y-6 py-4">
      <p className="text-muted-foreground text-sm">Inhale → Hold → Exhale → Hold, 4 seconds each</p>
      <motion.div
        className="w-32 h-32 rounded-full border-4 border-primary/40 flex items-center justify-center mx-auto bg-primary/5"
        animate={active ? { scale: [1, 1.3, 1.3, 1, 1] } : {}}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="text-center">
          <p className="font-semibold text-primary text-sm">{active ? phases[phase] : 'Ready'}</p>
          {active && <p className="text-2xl font-bold text-primary">{counts[phase]}s</p>}
        </div>
      </motion.div>
      {!active ? (
        <button onClick={startBreathing} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Begin
        </button>
      ) : (
        <button onClick={() => setActive(false)} className="px-6 py-2.5 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
          Pause
        </button>
      )}
    </div>
  );
}

function FocusTimer({ onClose }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const toggle = () => {
    if (running) {
      clearInterval(intervalId);
      setRunning(false);
    } else {
      const id = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(id); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
      setIntervalId(id);
      setRunning(true);
    }
  };

  const reset = () => { clearInterval(intervalId); setRunning(false); setSeconds(25 * 60); };
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="text-center space-y-5 py-4">
      <div className="font-display font-bold text-6xl text-foreground tracking-tight">{m}:{s}</div>
      <p className="text-sm text-muted-foreground">25 minute focus sprint</p>
      <div className="flex gap-3 justify-center">
        <button onClick={toggle} className="px-7 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="px-5 py-2.5 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}

export default function RegulationTools() {
  const [active, setActive] = useState(null);

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-base text-foreground">Regulation Tools</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Quick nervous system support</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              onClick={() => setActive(active === tool.label ? null : tool.label)}
              className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border text-left transition-all ${
                active === tool.label ? 'border-primary/30 bg-primary/5' : `${tool.bg} hover:border-primary/20`
              }`}
            >
              <Icon className={`w-4 h-4 ${active === tool.label ? 'text-primary' : tool.color}`} />
              <div>
                <div className="text-xs font-semibold text-foreground">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/40 pt-4 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">{active}</span>
              <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {active === 'Box Breathing' && <BoxBreathing />}
            {active === 'Focus Timer' && <FocusTimer />}
            {active === '5-4-3-2-1' && (
              <div className="text-sm text-muted-foreground space-y-2 py-2">
                {['5 things you can SEE', '4 things you can TOUCH', '3 things you can HEAR', '2 things you can SMELL', '1 thing you can TASTE'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 text-xs flex items-center justify-center font-bold">{5 - i}</span>{s}</div>
                ))}
              </div>
            )}
            {active === 'Brain Music' && (
              <p className="text-sm text-muted-foreground text-center py-4">🎵 Try: brain.fm, Endel, or search "brown noise" on YouTube</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}