import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const AFFIRMATIONS = [
  "You showed up. That counts.",
  "Small steps are still steps.",
  "You did something today. That matters.",
  "One thing done is one thing done.",
  "You're not behind. You're just going at your pace.",
];

const CHECK_IN_OPTIONS = [
  { value: 'daily', label: 'Yes, daily check-in', emoji: '🌅', desc: 'A gentle nudge every morning' },
  { value: 'stuck', label: 'Only when I\'m stuck', emoji: '🪴', desc: 'Check in on harder days' },
  { value: 'no', label: 'No thanks', emoji: '✌️', desc: 'I\'ll come back on my own' },
];

export default function SessionComplete({ firstTask, weekStats, isFirstSession }) {
  const [checkinPref, setCheckinPref] = useState(null);
  const [saved, setSaved] = useState(false);
  const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

  const handleCheckin = async (val) => {
    if (saved) return;
    setCheckinPref(val);
    setSaved(true);
    // Save preference to user profile
    const me = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        checkin_preference: val,
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto text-center space-y-8 py-4">
      {/* Affirmation */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">🌿</span>
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">{affirmation}</h2>
        {firstTask && (
          <p className="text-muted-foreground text-sm">
            You started: <span className="font-medium text-foreground">"{firstTask}"</span>
          </p>
        )}
      </motion.div>

      {/* Week stats — non-toxic */}
      {weekStats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary/60 rounded-2xl p-4 space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">This week</p>
          <div className="grid grid-cols-3 gap-3">
            {weekStats.sessions > 0 && (
              <div>
                <p className="text-xl font-bold text-foreground">{weekStats.sessions}</p>
                <p className="text-xs text-muted-foreground leading-tight">times you showed up</p>
              </div>
            )}
            {weekStats.tasksCompleted > 0 && (
              <div>
                <p className="text-xl font-bold text-foreground">{weekStats.tasksCompleted}</p>
                <p className="text-xs text-muted-foreground leading-tight">small steps done</p>
              </div>
            )}
            {weekStats.hardDayReturn && (
              <div>
                <p className="text-xl font-bold text-foreground">🏅</p>
                <p className="text-xs text-muted-foreground leading-tight">came back after a hard day</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Check-in preference */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {!saved ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Want me to check in with you tomorrow?</p>
            {CHECK_IN_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleCheckin(opt.value)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-secondary transition-colors text-left"
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {checkinPref === 'daily' ? "I'll check in tomorrow morning 🌅" :
             checkinPref === 'stuck' ? "I'll be here when you need me 🪴" :
             "See you whenever you're ready ✌️"}
          </motion.p>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-3">
        <Link
          to="/dashboard"
          className="block w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
        >
          Go to my workspace
        </Link>
        {isFirstSession && (
          <Link
            to="/forum"
            className="block w-full py-3 border border-border rounded-2xl text-sm text-muted-foreground hover:bg-secondary transition-colors text-center"
          >
            You're not alone — see what others are doing →
          </Link>
        )}
      </motion.div>
    </div>
  );
}