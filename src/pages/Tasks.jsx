import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, List, LayoutGrid } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ProjectPanel from '../components/tasks/ProjectPanel';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskForm from '../components/tasks/TaskForm';
import EnergyScheduler from '../components/tasks/EnergyScheduler';
import AIGuidancePanel from '../components/tasks/AIGuidancePanel';

export default function Tasks() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Task.list('-created_date', 100),
      base44.entities.Project.list('-created_date', 50),
    ]).then(([u, t, p]) => {
      setUser(u);
      setTasks(t);
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const handleCreateTask = async (formData) => {
    const task = await base44.entities.Task.create(formData);
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  };

  const visibleTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks;

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

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {selectedProject ? `${selectedProject.emoji} ${selectedProject.name}` : 'All Tasks'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {visibleTasks.filter(t => t.status !== 'done').length} tasks remaining
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Project sidebar */}
          <div className="hidden md:block w-64 border-r border-border/40 px-4 py-5 overflow-y-auto shrink-0">
            <ProjectPanel
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onProjectsChange={setProjects}
            />

            <div className="mt-6">
              <EnergyScheduler
                energy={energy}
                onEnergyChange={setEnergy}
                tasks={visibleTasks}
                onRecommend={setRecommendedIds}
              />
            </div>

            <div className="mt-4">
              <AIGuidancePanel energy={energy} tasks={visibleTasks} />
            </div>
          </div>

          {/* Task board */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <TaskBoard
              tasks={visibleTasks}
              projects={projects}
              energy={energy}
              recommendedIds={recommendedIds}
              onTasksChange={setTasks}
            />
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      <AnimatePresence>
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