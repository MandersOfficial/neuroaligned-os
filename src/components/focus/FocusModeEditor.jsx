import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import MobileSelect from '@/components/ui/MobileSelect';
import { motion } from 'framer-motion';

const EMOJIS = ['🧠', '⚡', '🔭', '🌊', '🌿', '🔥', '🎯', '🌙', '☀️', '🦋'];
const ACCENTS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
const SOUNDS = [
  { value: 'none', label: 'None' },
  { value: 'white_noise', label: 'White Noise' },
  { value: 'rain', label: 'Rain' },
  { value: 'lo_fi', label: 'Lo-fi Music' },
  { value: 'forest', label: 'Forest' },
  { value: 'cafe', label: 'Café Ambience' },
];
const ENERGY_FILTERS = [
  { value: 'all', label: 'All tasks' },
  { value: 'low', label: 'Low energy only' },
  { value: 'low_medium', label: 'Low + Medium' },
  { value: 'high_only', label: 'High energy only' },
];

const defaults = {
  name: '',
  emoji: '🧠',
  description: '',
  neurotype: '',
  work_block_minutes: 25,
  break_minutes: 5,
  long_break_minutes: 20,
  blocks_before_long_break: 4,
  task_energy_filter: 'all',
  show_one_task: false,
  reduce_visual_noise: false,
  regulation_reminder_minutes: 45,
  ambient_sound: 'none',
  color_accent: '#8B5CF6',
  is_custom: true,
};

export default function FocusModeEditor({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...defaults, ...initial } : { ...defaults });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border/60 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <h3 className="font-display font-semibold text-base">{initial ? 'Edit Focus Mode' : 'Create Focus Mode'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Identity */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identity</h4>
              <div className="flex gap-3">
                {/* Emoji picker */}
                <div className="shrink-0">
                  <Label className="text-xs mb-1.5 block">Icon</Label>
                  <div className="flex flex-wrap gap-1 w-28">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => set('emoji', e)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === e ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  <div>
                    <Label className="text-xs mb-1.5 block">Mode name</Label>
                    <Input placeholder="e.g. Deep Focus" value={form.name} onChange={e => set('name', e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Neurotype tag <span className="font-normal text-muted-foreground">(optional)</span></Label>
                    <Input placeholder="e.g. ADHD, Autistic, Burnout" value={form.neurotype} onChange={e => set('neurotype', e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Description</Label>
                <textarea placeholder="When to use this mode..." value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background resize-none focus:ring-1 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Accent color</Label>
                <div className="flex gap-2">
                  {ACCENTS.map(c => (
                    <button key={c} onClick={() => set('color_accent', c)}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color_accent === c ? '#000' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Work Rhythm */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Work Rhythm</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'work_block_minutes', label: 'Work block (min)' },
                  { key: 'break_minutes', label: 'Short break (min)' },
                  { key: 'long_break_minutes', label: 'Long break (min)' },
                  { key: 'blocks_before_long_break', label: 'Blocks before long break' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs mb-1.5 block">{label}</Label>
                    <Input type="number" min={1} value={form[key]} onChange={e => set(key, Number(e.target.value))} className="h-9 text-sm" />
                  </div>
                ))}
              </div>
            </section>

            {/* Task Display */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Display</h4>
              <div>
                <Label className="text-xs mb-1.5 block">Show tasks with energy level</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ENERGY_FILTERS.map(opt => (
                    <button key={opt.value} onClick={() => set('task_energy_filter', opt.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${form.task_energy_filter === opt.value ? 'border-primary bg-primary/8 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/30'}`}
                      style={{ background: form.task_energy_filter === opt.value ? form.color_accent + '10' : undefined }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'show_one_task', label: 'Show one task at a time', desc: 'Reduces overwhelm — great for ADHD & Autistic users' },
                  { key: 'reduce_visual_noise', label: 'Reduce visual noise', desc: 'Simplifies UI — strips colour, stats, decorations' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:bg-secondary/30 cursor-pointer transition-colors">
                    <div onClick={() => set(key, !form[key])}
                      className={`mt-0.5 w-9 h-5 rounded-full shrink-0 transition-all cursor-pointer ${form[key] ? 'bg-primary' : 'bg-border'}`}
                      style={{ background: form[key] ? form.color_accent : undefined }}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white shadow mt-0.5 transition-all ${form[key] ? 'ml-4' : 'ml-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Environment */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Environment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Ambient sound</Label>
                  <MobileSelect
                    value={form.ambient_sound}
                    onChange={v => set('ambient_sound', v)}
                    options={SOUNDS}
                    placeholder="Select sound"
                    label="Ambient sound"
                    className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Regulation reminder (min)</Label>
                  <Input type="number" min={5} value={form.regulation_reminder_minutes} onChange={e => set('regulation_reminder_minutes', Number(e.target.value))} className="h-9 text-sm" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            <Check className="w-4 h-4 mr-1" /> {initial ? 'Save Changes' : 'Create Mode'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}