import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Coffee, Plus, Trash2, Calendar, Zap, Info } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const SAMPLE_MEETINGS = [
  { id: 1, title: 'Client Kickoff Call', start: '09:00', end: '09:45', color: 'bg-blue-400' },
  { id: 2, title: 'Team Standup', start: '10:00', end: '10:30', color: 'bg-purple-400' },
  { id: 3, title: 'Strategy Session', start: '11:00', end: '12:00', color: 'bg-indigo-400' },
  { id: 4, title: 'Lunch Break', start: '12:00', end: '13:00', color: 'bg-green-400' },
  { id: 5, title: 'Discovery Call', start: '14:00', end: '14:45', color: 'bg-blue-400' },
  { id: 6, title: 'Content Review', start: '15:00', end: '15:30', color: 'bg-pink-400' },
];

const BREAK_SUGGESTIONS = [
  { after: 'Client Kickoff Call', before: 'Team Standup', gap: 15, type: 'breathe', label: 'Breathing reset', note: 'Back-to-back meetings — your nervous system needs a reset.' },
  { after: 'Team Standup', before: 'Strategy Session', gap: 30, type: 'walk', label: 'Short walk', note: '30-min gap — perfect for a 10-min body movement break.' },
  { after: 'Discovery Call', before: 'Content Review', gap: 15, type: 'hydrate', label: 'Hydration + stretch', note: 'Afternoon energy dip window — movement helps reset focus.' },
];

const BREAK_ICONS = { breathe: '🫁', walk: '🚶', hydrate: '💧' };

export default function AutoBreakScheduler() {
  const [meetings, setMeetings] = useState(SAMPLE_MEETINGS);
  const [breakDuration, setBreakDuration] = useState(10);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', start: '', end: '' });
  const [scheduledBreaks, setScheduledBreaks] = useState([]);

  const scheduleBreak = (suggestion) => {
    if (!scheduledBreaks.find(b => b.after === suggestion.after)) {
      setScheduledBreaks(prev => [...prev, suggestion]);
    }
  };

  const addMeeting = () => {
    if (!newMeeting.title || !newMeeting.start || !newMeeting.end) return;
    const colors = ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400'];
    setMeetings(prev => [...prev, { ...newMeeting, id: Date.now(), color: colors[Math.floor(Math.random() * colors.length)] }]);
    setNewMeeting({ title: '', start: '', end: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Manual mode active.</strong> Add your meetings below and NeuroAligned will suggest optimal breaks. Once Google Calendar is connected, this fills automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-5">
        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Today's Schedule
            </h3>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add meeting
            </button>
          </div>

          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-secondary/50 border border-border rounded-xl p-3 space-y-2 overflow-hidden"
              >
                <input
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Meeting title"
                  value={newMeeting.title}
                  onChange={e => setNewMeeting(p => ({ ...p, title: e.target.value }))}
                />
                <div className="flex gap-2">
                  <input type="time" className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newMeeting.start} onChange={e => setNewMeeting(p => ({ ...p, start: e.target.value }))} />
                  <input type="time" className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newMeeting.end} onChange={e => setNewMeeting(p => ({ ...p, end: e.target.value }))} />
                </div>
                <button onClick={addMeeting} className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Add
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {meetings.sort((a, b) => a.start.localeCompare(b.start)).map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-2.5">
                <div className={`w-2 h-2 rounded-full ${m.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.start} – {m.end}</p>
                </div>
                {meetings.length > 1 && (
                  <button onClick={() => setMeetings(p => p.filter(x => x.id !== m.id))} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Break Suggestions
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <MobileSelect
                value={breakDuration}
                onChange={v => setBreakDuration(Number(v))}
                options={[5, 10, 15, 20].map(n => ({ value: n, label: `${n}m` }))}
                className="text-xs bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            {BREAK_SUGGESTIONS.map((s, i) => {
              const scheduled = scheduledBreaks.find(b => b.after === s.after);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`border rounded-xl p-3 space-y-1.5 transition-colors ${
                    scheduled ? 'border-green-200 bg-green-50' : 'border-border/60 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{BREAK_ICONS[s.type]}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scheduled ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                      {scheduled ? '✓ Scheduled' : `${s.gap}m gap`}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.note}</p>
                  {!scheduled && (
                    <button
                      onClick={() => scheduleBreak(s)}
                      className="w-full mt-1 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-primary/15 transition-colors"
                    >
                      <Coffee className="w-3 h-3 inline mr-1" /> Schedule break
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {scheduledBreaks.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-green-800">✅ {scheduledBreaks.length} break{scheduledBreaks.length > 1 ? 's' : ''} scheduled</p>
              <p className="text-xs text-green-700 mt-0.5">Your nervous system will thank you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}