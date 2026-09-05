import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppRefresh } from '@/hooks/useAppRefresh';
import { Plus, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import GoogleSheetsSyncPanel from '@/components/integrations/GoogleSheetsSyncPanel';
import MeetingSummaryPanel from '@/components/integrations/MeetingSummaryPanel';
import CalendarSchedulePanel from '@/components/integrations/CalendarSchedulePanel';
import DeadlineCallPanel from '@/components/integrations/DeadlineCallPanel';
import ProjectSyncPanel from '@/components/integrations/ProjectSyncPanel';
import UpcomingMeetingsPanel from '@/components/integrations/UpcomingMeetingsPanel';
import GoogleTasksSyncPanel from '@/components/integrations/GoogleTasksSyncPanel';
import ClickUpSyncPanel from '@/components/integrations/ClickUpSyncPanel';
import PitchDeckPanel from '@/components/integrations/PitchDeckPanel';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

const FILTERS = [['active', 'Active'], ['paused', 'Paused'], ['completed', 'Completed'], ['all', 'All']];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState('active');
  const navigate = useNavigate();

  const load = async () => {
    const p = await base44.entities.Project.list('-created_date', 100);
    setProjects(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useAppRefresh(load);

  const handleUpdate = (updated) => setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));

  const handleDelete = async (project) => {
    await base44.entities.Project.delete(project.id);
    setProjects(prev => prev.filter(p => p.id !== project.id));
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) return <InlineSpinner />;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <h1 className="font-display font-bold text-2xl text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your client work, track tasks, and keep notes in one place.</p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground bg-card'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Integration panels */}
          <GoogleSheetsSyncPanel />
          <MeetingSummaryPanel projects={projects} />
          <CalendarSchedulePanel projects={projects} />
          <DeadlineCallPanel />
          <ProjectSyncPanel projects={projects} />
          <UpcomingMeetingsPanel />
          <GoogleTasksSyncPanel projects={projects} />
          <ClickUpSyncPanel projects={projects} />
          <PitchDeckPanel projects={projects} />

          {/* Project list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <p className="text-3xl">📁</p>
              <p className="font-semibold text-foreground">No {filter === 'all' ? '' : filter} projects yet</p>
              <p className="text-sm">Create your first project to start managing client workloads.</p>
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNew && <NewProjectModal onCreated={p => setProjects(prev => [p, ...prev])} onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </>
  );
}