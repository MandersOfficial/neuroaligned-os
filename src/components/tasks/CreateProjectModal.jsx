import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

const EMOJIS = ['📁', '🚀', '💼', '🎨', '📊', '🧠', '🌱', '⚡', '🔥', '💡'];
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export default function CreateProjectModal({ onCreated, onClose }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#8B5CF6');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const project = await base44.entities.Project.create({ name: name.trim(), emoji, color, status: 'active' });
    onCreated(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-foreground">New Project</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-border transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <Input
          autoFocus
          placeholder="Project name..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onClose(); }}
        />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Emoji</p>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`text-sm w-8 h-8 rounded-lg flex items-center justify-center transition-all ${emoji === e ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-secondary'}`}
              >{e}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent', outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || saving}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Create Project
        </button>
      </motion.div>
    </div>
  );
}