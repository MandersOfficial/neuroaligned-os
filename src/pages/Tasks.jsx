import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppRefresh } from '@/hooks/useAppRefresh';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import SmartSortButton from '@/components/tasks/SmartSortButton';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskForm from '@/components/tasks/TaskForm';
import EnergyCheckIn from '@/components/dashboard/EnergyCheckIn';
import AIGuidancePanel from '@/components/tasks/AIGuidancePanel';
import RegulationWidget from '@/components/regulation/RegulationWidget';
import CreateProjectModal from '@/components/tasks/CreateProjectModal';
import EnergyFilter from '@/components/tasks/EnergyFilter';
import MobileSelect from '@/components/ui/MobileSelect';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'deferred', label: 'Deferred' },
];

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All categories' },
  { value: 'deep_work', label: '🔭 Deep Work' },
  { value: 'admin', label: '📋 Admin' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'communication', label: '💬 Communication' },
  { value: 'self_care', label: '🌱 Self-Care' },
  { value: 'planning', label: '🗺️ Planning' },
];

export default function Tasks() {
  const { user } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sortedTasks, setSortedTasks] = useState(null);
  const [sortReasons, setSortReasons] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [energy, setEnergy] = useState('flow');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [energyFilter, setEnergyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  const load = async () => {
    const [t, p] = await Promise.all([
      base44.entities.Task.list('-created_date', 100),
      base44.entities.Project.list('-created_date', 50),
    ]);
    setTasks(t);
    setSortedTasks(null);
    setSortReasons({});
    setProjects(p);
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles.length > 0) setProfile(profiles[0]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useAppRefresh(load);

  // One save path for both creating and editing a task
  const handleSaveTask = async (formData) => {
    if (editingTask) {
      const updated = await base44.entities.Task.update(editingTask.id, formData);
      setTasks(prev => prev.map(t => (t.id === editingTask.id ? { ...t, ...updated } : t)));
      setEditingTask(null);
    } else {
      const task = await base44.entities.Task.create(formData);
      setTasks(prev => [task, ...prev]);
    }
    setSortedTasks(null);
    setSortReasons({});
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const baseTasks = sortedTasks || tasks;
  const visibleTasks = selectedProjectId
    ? baseTasks.filter(t => t.project_id === selectedProjectId)
    : baseTasks;
  const energyFilteredTasks = energyFilter === 'all'
    ? visibleTasks
    : visibleTasks.filter(t => (t.energy_required || 'medium') === energyFilter);
  const statusFilteredTasks = statusFilter === 'all'
    ? energyFilteredTasks
    : energyFilteredTasks.filter(t => t.status === statusFilter);
  const filteredTasks = categoryFilter === 'all'
    ? statusFilteredTasks
    : statusFilteredTasks.filter(t => t.category === categoryFilter);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (loading) return <InlineSpinner />;

  return (
    <>
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            {selectedProject ? `${selectedProject.emoji} ${selectedProject.name}` : 'All Tasks'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredTasks.filter(t => t.status !== 'done').length} tasks remaining
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EnergyCheckIn energy={energy} onEnergyChange={setEnergy} />
          <SmartSortButton
            tasks={filteredTasks}
            profile={profile}
            energy={energy}
            focusMinutes={25}
            onSorted={(sorted, reasons) => { setSortedTasks(sorted); setSortReasons(reasons); }}
            onReset={() => { setSortedTasks(null); setSortReasons({}); }}
            isSorted={sortedTasks !== null}
          />
          <button
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Project filter bar */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border/40 overflow-x-auto shrink-0">
        <button
          onClick={() => setSelectedProjectId(null)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            !selectedProjectId
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:text-foreground bg-card'
          }`}
        >
          All Tasks
        </button>
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProjectId(p.id === selectedProjectId ? null : p.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedProjectId === p.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground bg-card'
            }`}
          >
            <span>{p.emoji}</span>
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowCreateProject(true)}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 bg-card transition-all"
        >
          + New Project
        </button>

        <div className="w-px h-5 bg-border shrink-0 mx-1" />

        <MobileSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTERS}
          label="Filter by status"
          className={`shrink-0 max-w-[150px] px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            statusFilter !== 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground bg-card'
          }`}
        />
        <MobileSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={CATEGORY_FILTERS}
          label="Filter by category"
          className={`shrink-0 max-w-[150px] px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            categoryFilter !== 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground bg-card'
          }`}
        />
      </div>

      {/* Energy filter bar */}
      <EnergyFilter value={energyFilter} onChange={setEnergyFilter} tasks={visibleTasks} />

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Energy & AI guidance — sits above the board instead of in a side column */}
        <div className="hidden xl:block px-6 py-4 border-b border-border/40 shrink-0 max-h-[45vh] overflow-y-auto">
          <AIGuidancePanel energy={energy} tasks={energyFilteredTasks} />
        </div>

        {/* Task board */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <TaskBoard
            tasks={filteredTasks}
            projects={projects}
            energy={energy}
            onTasksChange={setTasks}
            onEditTask={t => { setEditingTask(t); setShowForm(true); }}
          />
        </div>
      </div>

      <RegulationWidget />

      {/* Modals */}
      <AnimatePresence>
        {showCreateProject && (
          <CreateProjectModal
            onCreated={(p) => setProjects(prev => [...prev, p])}
            onClose={() => setShowCreateProject(false)}
          />
        )}
        {showForm && (
          <TaskForm
            projects={projects}
            task={editingTask}
            initialProjectId={selectedProjectId || ''}
            onSave={handleSaveTask}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>
    </>
  );
}