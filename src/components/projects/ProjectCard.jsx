import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import MobileSelect from '@/components/ui/MobileSelect';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Calendar, User, Trash2, Check, X, Edit2,
  Circle, CheckCircle2, Clock, Video, Loader2, Plus,
} from 'lucide-react';
import {
  STATUS_STYLES, PRIORITY_STYLES, EMOJI_OPTIONS,
  STATUS_SELECT_OPTIONS, PRIORITY_OPTIONS,
} from '@/components/projects/projectMeta';
import useSingleAction from '@/hooks/useSingleAction';
import TaskForm from '@/components/tasks/TaskForm';
import { spawnNextOccurrence } from '@/lib/taskRecurrence';

export default function ProjectCard({ project, projects = [], onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...project });
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [joiningMeet, setJoiningMeet] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleJoinMeet = async () => {
    setJoiningMeet(true);
    try {
      const res = await base44.functions.invoke('createProjectSyncMeet', { project_id: project.id });
      if (res.data.meet_link) {
        window.open(res.data.meet_link, '_blank');
      }
    } catch { /* ignore — user hasn't connected Google Calendar yet */ }
    setJoiningMeet(false);
  };

  const loadTasks = async () => {
    if (tasks.length > 0) return;
    setLoadingTasks(true);
    const t = await base44.entities.Task.filter({ project_id: project.id });
    setTasks(t);
    setLoadingTasks(false);
  };

  const handleExpand = () => {
    if (!expanded) loadTasks();
    setExpanded(!expanded);
  };

  const handleSave = useSingleAction(async () => {
    const updated = await base44.entities.Project.update(project.id, form);
    onUpdate({ ...project, ...updated });
    setEditing(false);
  });

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = await base44.entities.Task.update(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));
    // Completing a repeating task rolls it forward instead of losing it
    if (newStatus === 'done' && task.recurrence && task.recurrence !== 'none') {
      const next = await spawnNextOccurrence({ ...task, status: newStatus });
      if (next) setTasks(prev => [...prev, next]);
    }
  };

  const handleSaveTask = useSingleAction(async (formData) => {
    const updated = await base44.entities.Task.update(editingTask.id, formData);
    setTasks(prev => prev.map(t => (t.id === editingTask.id ? { ...t, ...updated } : t)));
    setEditingTask(null);
  });

  const handleAddTask = useSingleAction(async () => {
    if (!newTaskTitle.trim()) return;
    const task = await base44.entities.Task.create({
      title: newTaskTitle.trim(),
      status: 'todo',
      project_id: project.id,
      energy_required: 'medium',
    });
    setTasks(prev => [...prev, task]);
    setNewTaskTitle('');
    setAddingTask(false);
  });

  const handleDeleteTask = async (task) => {
    await base44.entities.Task.delete(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const done = tasks.filter(t => t.status === 'done').length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-2xl overflow-hidden"
    >
      {/* Project row — same format as task rows */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30">
        <button
          className="shrink-0"
          onClick={async () => {
            const newStatus = project.status === 'completed' ? 'active' : 'completed';
            const updated = await base44.entities.Project.update(project.id, { status: newStatus });
            onUpdate({ ...project, ...updated });
          }}
        >
          {project.status === 'completed'
            ? <CheckCircle2 className="w-5 h-5 text-primary" />
            : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />}
        </button>

        <span className="text-lg leading-none shrink-0">{project.emoji}</span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${project.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {project.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {project.client_name && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <User className="w-3 h-3" />{project.client_name}
              </span>
            )}
            {project.due_date && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />{new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {project.priority && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[project.priority]}`}>
                {project.priority}
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleJoinMeet}
            disabled={joiningMeet}
            title="Join Google Meet"
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            {joiningMeet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(project)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleExpand} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 space-y-4">

              {/* Notes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Notes</p>
                <textarea
                  className="w-full text-sm text-foreground bg-secondary/40 border border-border/40 rounded-xl px-3 py-2.5 resize-none min-h-[80px] focus:outline-none focus:border-primary/40 transition-colors"
                  placeholder="Add notes, context, links, anything relevant to this project…"
                  value={form.notes || ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  onBlur={handleSave}
                />
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Tasks {tasks.length > 0 && `· ${done}/${tasks.length} done`}
                  </p>
                  <button
                    onClick={() => setAddingTask(true)}
                    className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add task
                  </button>
                </div>

                {loadingTasks ? (
                  <div className="text-xs text-muted-foreground py-2">Loading tasks…</div>
                ) : (
                  <div className="space-y-0">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2.5 py-2 border-b border-border/20 last:border-0 group">
                        <button onClick={() => handleToggleTask(task)} className="shrink-0">
                          {task.status === 'done'
                            ? <CheckCircle2 className="w-4 h-4 text-primary" />
                            : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />}
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          title="Open task"
                          className={`text-sm flex-1 text-left hover:underline ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        >
                          {task.title}
                        </button>
                        {task.estimated_minutes && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                            <Clock className="w-3 h-3" />{task.estimated_minutes}m
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {addingTask && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          autoFocus
                          className="flex-1 text-sm bg-secondary/40 border border-primary/30 rounded-lg px-2.5 py-1.5 focus:outline-none"
                          placeholder="Task title…"
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAddingTask(false); }}
                        />
                        <button onClick={handleAddTask} className="p-1.5 bg-primary text-primary-foreground rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setAddingTask(false)} className="p-1.5 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}

                    {tasks.length === 0 && !addingTask && (
                      <p className="text-xs text-muted-foreground py-2">No tasks yet. Add one above.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task editor — opens from a task row */}
      <AnimatePresence>
        {editingTask && (
          <TaskForm
            projects={projects}
            task={editingTask}
            onSave={handleSaveTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-base text-foreground">Edit Project</p>
                <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
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
                    className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
                    placeholder="Project name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <input
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
                  placeholder="Client name"
                  value={form.client_name || ''}
                  onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                />
                <input
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
                  placeholder="Client email"
                  value={form.client_email || ''}
                  onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <MobileSelect
                    value={form.status}
                    onChange={v => setForm(f => ({ ...f, status: v }))}
                    options={STATUS_SELECT_OPTIONS}
                    label="Status"
                    className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
                  />
                  <MobileSelect
                    value={form.priority || 'medium'}
                    onChange={v => setForm(f => ({ ...f, priority: v }))}
                    options={PRIORITY_OPTIONS}
                    label="Priority"
                    className="border border-border rounded-xl px-3 py-2 text-sm bg-card h-9 w-full"
                  />
                </div>

                <input
                  type="date"
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-card focus:outline-none focus:border-primary/40"
                  value={form.due_date || ''}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}