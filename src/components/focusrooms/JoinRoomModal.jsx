import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JoinRoomModal({ room, onJoin, onClose }) {
  const [task, setTask] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    await onJoin(room, task.trim());
    setJoining(false);
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
        className="bg-card border border-border/60 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Join "{room.name}"</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="bg-secondary/60 rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
          {room.focus_topic ? `🎯 ${room.focus_topic}` : 'Open focus session'}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">What will you work on?</label>
          <input
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="e.g. Finish client brief..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">This is visible to others in the room for accountability.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {joining ? 'Joining…' : 'Join Room →'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}