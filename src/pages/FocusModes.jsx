import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppRefresh } from '@/hooks/useAppRefresh';
import { Plus, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FocusModeCard from '@/components/focus/FocusModeCard';
import FocusModeEditor from '@/components/focus/FocusModeEditor';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

// Built-in neurotype templates (not stored in DB, seeded on first load)
const TEMPLATES = [
  {
    name: 'ADHD Hyperfocus',
    emoji: '⚡',
    neurotype: 'ADHD',
    description: 'Long uninterrupted blocks capitalising on hyperfocus. Minimal distractions, one task at a time.',
    work_block_minutes: 50,
    break_minutes: 10,
    long_break_minutes: 30,
    blocks_before_long_break: 2,
    task_energy_filter: 'high_only',
    show_one_task: true,
    reduce_visual_noise: true,
    regulation_reminder_minutes: 60,
    ambient_sound: 'lo_fi',
    color_accent: '#8B5CF6',
    is_custom: false,
  },
  {
    name: 'ADHD Body Double',
    emoji: '🤝',
    neurotype: 'ADHD',
    description: 'Short sprints with structured breaks. Café ambient sound simulates a body-double environment.',
    work_block_minutes: 20,
    break_minutes: 5,
    long_break_minutes: 15,
    blocks_before_long_break: 3,
    task_energy_filter: 'all',
    show_one_task: true,
    reduce_visual_noise: false,
    regulation_reminder_minutes: 25,
    ambient_sound: 'cafe',
    color_accent: '#F59E0B',
    is_custom: false,
  },
  {
    name: 'Autistic Deep Work',
    emoji: '🔭',
    neurotype: 'Autistic',
    description: 'Predictable, structured blocks with clear start/end. Calm UI and gentle forest sounds.',
    work_block_minutes: 45,
    break_minutes: 15,
    long_break_minutes: 30,
    blocks_before_long_break: 2,
    task_energy_filter: 'low_medium',
    show_one_task: true,
    reduce_visual_noise: true,
    regulation_reminder_minutes: 45,
    ambient_sound: 'forest',
    color_accent: '#10B981',
    is_custom: false,
  },
  {
    name: 'Burnout Recovery',
    emoji: '🌿',
    neurotype: 'Burnout Survivor',
    description: 'Ultra-gentle rhythm. Low-energy tasks only, frequent regulation reminders, maximum rest.',
    work_block_minutes: 15,
    break_minutes: 10,
    long_break_minutes: 30,
    blocks_before_long_break: 2,
    task_energy_filter: 'low',
    show_one_task: true,
    reduce_visual_noise: true,
    regulation_reminder_minutes: 20,
    ambient_sound: 'rain',
    color_accent: '#06B6D4',
    is_custom: false,
  },
  {
    name: 'Dyslexic Flow',
    emoji: '🌊',
    neurotype: 'Dyslexic',
    description: 'Balanced blocks built for creative, non-linear thinking. Reduced visual noise to ease reading.',
    work_block_minutes: 30,
    break_minutes: 10,
    long_break_minutes: 20,
    blocks_before_long_break: 3,
    task_energy_filter: 'all',
    show_one_task: false,
    reduce_visual_noise: true,
    regulation_reminder_minutes: 40,
    ambient_sound: 'white_noise',
    color_accent: '#EC4899',
    is_custom: false,
  },
];

export default function FocusModes() {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    const saved = await base44.entities.FocusMode.list('-created_date', 50);
    setModes(saved);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useAppRefresh(load);

  const activeMode = modes.find(m => m.is_active);

  const handleActivate = async (mode) => {
    // Deactivate all, then activate selected
    const updated = await Promise.all(
      modes.map(m => base44.entities.FocusMode.update(m.id, { is_active: m.id === mode.id ? !m.is_active : false }))
    );
    setModes(updated);
  };

  const handleSave = async (formData) => {
    if (editTarget) {
      const updated = await base44.entities.FocusMode.update(editTarget.id, formData);
      setModes(prev => prev.map(m => m.id === editTarget.id ? updated : m));
    } else {
      const created = await base44.entities.FocusMode.create({ ...formData, is_active: false });
      setModes(prev => [created, ...prev]);
    }
    setShowEditor(false);
    setEditTarget(null);
  };

  const handleDelete = async (mode) => {
    await base44.entities.FocusMode.delete(mode.id);
    setModes(prev => prev.filter(m => m.id !== mode.id));
  };

  const handleSeedTemplate = async (template) => {
    const created = await base44.entities.FocusMode.create({ ...template, is_active: false });
    setModes(prev => [created, ...prev]);
  };

  const savedTemplateNames = new Set(modes.map(m => m.name));
  const unseededTemplates = TEMPLATES.filter(t => !savedTemplateNames.has(t.name));

  if (loading) return <InlineSpinner />;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Focus Modes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeMode ? `✅ Active: ${activeMode.emoji} ${activeMode.name}` : 'No mode active — click any mode to activate it'}
              </p>
            </div>
            <button
              onClick={() => { setEditTarget(null); setShowEditor(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Custom Mode
            </button>
          </div>

          {/* Active mode banner */}
          {activeMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ background: activeMode.color_accent + '0d', borderColor: activeMode.color_accent + '40' }}
            >
              <div className="text-3xl">{activeMode.emoji}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{activeMode.name} is active</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                  <span>⏱ {activeMode.work_block_minutes}m work · {activeMode.break_minutes}m break</span>
                  {activeMode.show_one_task && <span>👁 Single task view</span>}
                  {activeMode.reduce_visual_noise && <span>🌫 Calm UI</span>}
                  {activeMode.ambient_sound !== 'none' && <span>🎵 {activeMode.ambient_sound}</span>}
                </div>
              </div>
              <button onClick={() => handleActivate(activeMode)} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 bg-background/60 rounded-xl border border-border/40">
                Deactivate
              </button>
            </motion.div>
          )}

          {/* Your saved modes */}
          {modes.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display font-semibold text-base text-foreground">Your Modes</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modes.map((mode, i) => (
                  <FocusModeCard
                    key={mode.id}
                    mode={mode}
                    isActive={mode.is_active}
                    index={i}
                    onActivate={handleActivate}
                    onEdit={m => { setEditTarget(m); setShowEditor(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Template library */}
          {unseededTemplates.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Neurotype Templates
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Add a template to your modes, then customise it to fit you.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unseededTemplates.map((tmpl, i) => (
                  <motion.div
                    key={tmpl.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-dashed border-border/60 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border border-border/40"
                        style={{ background: tmpl.color_accent + '18' }}>
                        {tmpl.emoji}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-sm text-foreground">{tmpl.name}</h3>
                        <p className="text-xs text-primary font-medium">{tmpl.neurotype}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tmpl.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                      <span className="bg-secondary px-2 py-0.5 rounded-full">⏱ {tmpl.work_block_minutes}m / {tmpl.break_minutes}m</span>
                      {tmpl.show_one_task && <span className="bg-secondary px-2 py-0.5 rounded-full">👁 One task</span>}
                      {tmpl.reduce_visual_noise && <span className="bg-secondary px-2 py-0.5 rounded-full">🌫 Calm UI</span>}
                    </div>
                    <button
                      onClick={() => handleSeedTemplate(tmpl)}
                      className="mt-auto w-full py-2 border border-primary/30 text-primary text-xs font-semibold rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      + Add to My Modes
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <FocusModeEditor
            initial={editTarget}
            onSave={handleSave}
            onClose={() => { setShowEditor(false); setEditTarget(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}