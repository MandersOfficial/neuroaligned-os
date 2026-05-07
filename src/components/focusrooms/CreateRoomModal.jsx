import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const DURATIONS = [15, 25, 45, 60, 90];

export default function CreateRoomModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', focus_topic: '', duration_minutes: 25, max_participants: 6 });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Create Focus Room</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Room Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Deep Work Sunday"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">What are you working on? <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              value={form.focus_topic}
              onChange={e => set('focus_topic', e.target.value)}
              placeholder="e.g. Client proposals, writing, deep research..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Session Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => set('duration_minutes', d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.duration_minutes === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground bg-background'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Max Participants</label>
            <div className="flex flex-wrap gap-2">
              {[2, 4, 6, 8, 10].map(n => (
                <button
                  key={n}
                  onClick={() => set('max_participants', n)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.max_participants === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground bg-background'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Room'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}