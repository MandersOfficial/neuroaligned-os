import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import MobileSelect from '@/components/ui/MobileSelect';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EMOJI_OPTIONS, PRIORITY_OPTIONS } from '@/components/projects/projectMeta';

export default function NewProjectModal({ onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', emoji: '📁', client_name: '', client_email: '', status: 'active', priority: 'medium', due_date: '' });

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const project = await base44.entities.Project.create({ ...form });
    onCreated(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-base text-foreground">New Project</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <MobileSelect
              value={form.emoji}
              onChange={v => setForm(f => ({ ...f, emoji: v }))}
              options={EMOJI_OPTIONS}
              label="Icon"
              className="border border-border rounded-xl px-2 py-2 text-lg bg-card h-9 w-[60px] shrink-0"
            />
            <input
              autoFocus
              className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
              placeholder="Project name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <input
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
            placeholder="Client name (optional)"
            value={form.client_name}
            onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
          />
          <input
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
            placeholder="Client email (optional)"
            value={form.client_email}
            onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <MobileSelect
              value={form.priority}
              onChange={v => setForm(f => ({ ...f, priority: v }))}
              options={PRIORITY_OPTIONS}
              label="Priority"
              className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
            />
            <input
              type="date"
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
              value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCreate}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Create Project
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}