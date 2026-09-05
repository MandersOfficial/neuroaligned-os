import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppRefresh } from '@/hooks/useAppRefresh';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import SmartSortButton from '@/components/tasks/SmartSortButton';
import ProjectPanel from '@/components/tasks/ProjectPanel';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskForm from '@/components/tasks/TaskForm';
import EnergyScheduler from '@/components/tasks/EnergyScheduler';
import AIGuidancePanel from '@/components/tasks/AIGuidancePanel';
import RegulationWidget from '@/components/regulation/RegulationWidget';
import CreateProjectModal from '@/components/tasks/CreateProjectModal';
import EnergyFilter from '@/components/tasks/EnergyFilter';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

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
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [energyFilter, setEnergyFilter] = useState('all');

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

  const handleCreateTask = async (formData) => {
    const task = await base44.entities.Task.create(formData);
    setTasks(prev => [task, ...prev]);
    setSortedTasks(null);
    setSortReasons({});
    setShowForm(false);
  };

  const baseTasks = sortedTasks || tasks;
  const visibleTasks = selectedProjectId
    ? baseTasks.filter(t => t.project_id === selectedProjectId)
    : baseTasks;
  const energyFilteredTasks = energyFilter === 'all'
    ? visibleTasks
    : visibleTasks.filter(t => (t.energy_required || 'medium') === energyFilter);

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
            {energyFilteredTasks.filter(t => t.status !== 'done').length} tasks remaining
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SmartSortButton
            tasks={energyFilteredTasks}
            profile={profile}
            energy={energy}
            focusMinutes={25}
            onSorted={(sorted, reasons) => { setSortedTasks(sorted); setSortReasons(reasons); }}
            onReset={() => { setSortedTasks(null); setSortReasons({}); }}
            isSorted={sortedTasks !== null}
          />
          <button
            onClick={() => setShowForm(true)}
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
      </div>

      {/* Energy filter bar */}
      <EnergyFilter value={energyFilter} onChange={setEnergyFilter} tasks={visibleTasks} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Project sidebar */}
        <div className="hidden xl:block w-52 border-r border-border/40 py-5 overflow-y-auto shrink-0 space-y-6 px-3">
          <ProjectPanel
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onProjectsChange={setProjects}
          />
          <EnergyScheduler
            energy={energy}
            onEnergyChange={setEnergy}
            tasks={energyFilteredTasks}
            onRecommend={setRecommendedIds}
          />
          <AIGuidancePanel energy={energy} tasks={energyFilteredTasks} />
        </div>

        {/* Task board */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <TaskBoard
            tasks={energyFilteredTasks}
            projects={projects}
            energy={energy}
            recommendedIds={recommendedIds}
            onTasksChange={setTasks}
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
            initialProjectId={selectedProjectId || ''}
            onSave={handleCreateTask}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}