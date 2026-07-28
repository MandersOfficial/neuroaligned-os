import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, List, LayoutGrid } from 'lucide-react';
import SmartSortButton from '../components/tasks/SmartSortButton';
import { AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ProjectPanel from '../components/tasks/ProjectPanel';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskForm from '../components/tasks/TaskForm';
import EnergyScheduler from '../components/tasks/EnergyScheduler';
import AIGuidancePanel from '../components/tasks/AIGuidancePanel';
import RegulationWidget from '../components/regulation/RegulationWidget';
import CreateProjectModal from '../components/tasks/CreateProjectModal';
import EnergyFilter from '../components/tasks/EnergyFilter';

export default function Tasks() {
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Task.list('-created_date', 100),
      base44.entities.Project.list('-created_date', 50),
    ]).then(async ([u, t, p]) => {
      setUser(u);
      setTasks(t);
      setProjects(p);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between gap-4 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
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
      </main>

      <RegulationWidget />

      {/* Task Form Modal */}
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
    </div>
  );
}