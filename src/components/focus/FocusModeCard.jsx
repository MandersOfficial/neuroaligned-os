import { Check, Pencil, Trash2, Zap, Clock, Eye, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FocusModeCard({ mode, isActive, onActivate, onEdit, onDelete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-card border rounded-2xl p-5 flex flex-col gap-4 transition-all cursor-pointer group ${
        isActive
          ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20'
          : 'border-border/60 hover:border-primary/30 hover:shadow-sm'
      }`}
      onClick={() => onActivate(mode)}
    >
      {/* Active badge */}
      {isActive && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
          <Check className="w-3 h-3" /> Active
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-16">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-border/40"
          style={{ background: mode.color_accent + '18' }}
        >
          {mode.emoji}
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight">{mode.name}</h3>
          {mode.neurotype && <p className="text-xs text-primary font-medium mt-0.5">{mode.neurotype}</p>}
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mode.description}</p>
        </div>
      </div>

      {/* Rhythm chips */}
      <div className="flex flex-wrap gap-1.5">
        <Chip icon={Clock} label={`${mode.work_block_minutes}m work`} />
        <Chip icon={Zap} label={`${mode.break_minutes}m break`} />
        {mode.show_one_task && <Chip icon={Eye} label="One task view" />}
        {mode.reduce_visual_noise && <Chip icon={Eye} label="Calm UI" />}
        {mode.regulation_reminder_minutes && (
          <Chip icon={Bell} label={`Remind every ${mode.regulation_reminder_minutes}m`} />
        )}
      </div>

      {/* Actions */}
      {mode.is_custom && (
        <div
          className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(mode)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground bg-secondary hover:bg-border rounded-lg transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(mode)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/5 bg-secondary rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}

function Chip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}