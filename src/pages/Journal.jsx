import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import JournalEditor from '../components/journal/JournalEditor';
import JournalEntryCard from '../components/journal/JournalEntryCard';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Flame, TrendingUp, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export default function Journal() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.JournalEntry.list('-created_date', 30)])
      .then(([u, e]) => {
        if (!u) { base44.auth.redirectToLogin('/journal'); return; }
        setUser(u);
        setEntries(e);
        setLoading(false);
      });
  }, []);

  const handleSaved = useCallback((entry) => {
    setEntries(prev => [entry, ...prev]);
    showToast('Entry saved & analyzed ✨');
  }, []);

  const handleDelete = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleActionAdded = useCallback((step) => {
    showToast(`"${step.slice(0, 40)}…" added to today's tasks`);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Stats
  const totalEntries = entries.length;
  const analyzedEntries = entries.filter(e => e.analyzed).length;
  const totalActionSteps = entries.reduce((acc, e) => acc + (e.ai_action_steps?.length || 0), 0);
  const streakDays = (() => {
    const dates = new Set(entries.map(e => e.date).filter(Boolean));
    let streak = 0;
    const d = new Date();
    while (dates.has(d.toISOString().split('T')[0])) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  })();

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

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="font-display font-bold text-2xl text-foreground">Brain Dump Journal</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Write freely — no structure needed. AI extracts patterns and suggests action steps for your next check-in.
            </p>
          </div>

          {/* Stats row */}
          {totalEntries > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CalendarDays, label: 'Entries', value: totalEntries, color: 'text-primary' },
                { icon: Flame, label: 'Day Streak', value: `${streakDays}d`, color: 'text-orange-500' },
                { icon: TrendingUp, label: 'Action Steps', value: totalActionSteps, color: 'text-green-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-card border border-border/60 rounded-xl p-3 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <p className="font-display font-bold text-lg text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {format(new Date(), 'EEEE, MMMM d')} — Today's Entry
            </p>
            <JournalEditor onSaved={handleSaved} />
          </div>

          {/* Past entries */}
          {entries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Past Entries ({entries.length})
              </p>
              <div className="space-y-3">
                <AnimatePresence>
                  {entries.map(entry => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDelete}
                      onActionAdded={handleActionAdded}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <p className="text-4xl">📓</p>
              <p className="text-sm font-semibold text-foreground">No entries yet</p>
              <p className="text-xs text-muted-foreground">Write your first brain dump above — it only takes a minute.</p>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}