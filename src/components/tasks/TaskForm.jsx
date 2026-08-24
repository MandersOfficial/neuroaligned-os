import { useState } from 'react';
import { X, Calendar, Clock, Zap, FolderOpen, Flame, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MobileSelect from '@/components/ui/MobileSelect';
import { motion } from 'framer-motion';

const ENERGY_OPTIONS = [
  { value: 'low', label: 'Low', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
  { value: 'medium', label: 'Medium', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'high', label: 'High', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
];

const CATEGORIES = [
  { value: 'deep_work', label: '🔭 Deep Work' },
  { value: 'admin', label: '📋 Admin' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'communication', label: '💬 Communication' },
  { value: 'self_care', label: '🌱 Self-Care' },
  { value: 'planning', label: '🗺️ Planning' },
];

export default function TaskForm({ projects, onSave, onClose, initialProjectId = '' }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: initialProjectId,
    energy_required: 'medium',
    category: 'deep_work',
    due_date: '',
    estimated_minutes: '',
    is_today: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, status: 'todo', estimated_minutes: Number(form.estimated_minutes) || undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="bg-card border border-border/60 rounded-2xl w-full max-w-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h3 className="font-display font-semibold text-base text-foreground">New Task</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Task title</Label>
            <Input
              autoFocus
              placeholder="What needs to get done?"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="h-11 text-base border-border/60 focus-visible:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Description <span className="font-normal">(optional)</span></Label>
            <textarea
              placeholder="Any context or notes..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Energy */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Energy required</Label>
            <div className="flex gap-2">
              {ENERGY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => set('energy_required', opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      form.energy_required === opt.value ? `${opt.bg} ${opt.color}` : 'border-border/60 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row: Project + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" />Project</Label>
              <MobileSelect
                value={form.project_id || ''}
                onChange={v => set('project_id', v)}
                options={[{ value: '', label: 'No project' }, ...projects.map(p => ({ value: p.id, label: `${p.emoji} ${p.name}` }))]}
                placeholder="No project"
                label="Project"
                className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <MobileSelect
                value={form.category}
                onChange={v => set('category', v)}
                options={CATEGORIES}
                placeholder="Category"
                label="Category"
                className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
              />
            </div>
          </div>

          {/* Row: Date + Estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Due date</Label>
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Est. minutes</Label>
              <Input type="number" placeholder="e.g. 30" value={form.estimated_minutes} onChange={e => set('estimated_minutes', e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          {/* Today toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('is_today', !form.is_today)}
              className={`relative w-10 rounded-full transition-all cursor-pointer ${form.is_today ? 'bg-primary' : 'bg-border'}`}
              style={{ height: '22px' }}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_today ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-foreground font-medium">Add to today's queue</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            Create Task
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}