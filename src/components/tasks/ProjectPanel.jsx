import { useState } from 'react';
import { Plus, FolderOpen, ChevronRight, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['📁', '🚀', '💼', '🎨', '📊', '🧠', '🌱', '⚡', '🔥', '💡'];
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

const STATUS_COLOR = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-secondary text-muted-foreground',
  archived: 'bg-secondary text-muted-foreground',
};

export default function ProjectPanel({ projects, selectedProjectId, onSelectProject, onProjectsChange }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [newColor, setNewColor] = useState('#8B5CF6');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const project = await base44.entities.Project.create({
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      status: 'active',
    });
    onProjectsChange([...projects, project]);
    setNewName(''); setCreating(false);
  };

  return (
    <div className="w-56 shrink-0 flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</span>
        <button onClick={() => setCreating(true)} className="w-6 h-6 rounded-lg bg-primary/10 hover:bg-primary/15 flex items-center justify-center text-primary transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* All Tasks */}
      <button
        onClick={() => onSelectProject(null)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full text-left ${
          !selectedProjectId ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <FolderOpen className="w-4 h-4 shrink-0" />
        All Tasks
      </button>

      {/* Projects */}
      {projects.map(p => (
        <button
          key={p.id}
          onClick={() => onSelectProject(p.id === selectedProjectId ? null : p.id)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full text-left group ${
            selectedProjectId === p.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <span className="text-base">{p.emoji}</span>
          <span className="flex-1 truncate">{p.name}</span>
          {p.status !== 'active' && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>{p.status}</span>
          )}
        </button>
      ))}

      {/* Create project form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 bg-card border border-border/60 rounded-xl p-3 space-y-2.5 overflow-hidden"
          >
            <Input
              autoFocus
              placeholder="Project name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              className="h-8 text-xs"
            />
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNewEmoji(e)}
                  className={`text-sm w-6 h-6 rounded-md flex items-center justify-center transition-all ${newEmoji === e ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                >{e}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className="w-5 h-5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: newColor === c ? c : 'transparent', outlineOffset: '2px' }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleCreate} className="flex-1 h-7 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/90">
                <Check className="w-3 h-3" /> Create
              </button>
              <button onClick={() => setCreating(false)} className="h-7 w-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-border transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}