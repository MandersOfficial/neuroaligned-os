import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AutoBreakScheduler from '@/components/integrations/AutoBreakScheduler';
import ContextCapture from '@/components/integrations/ContextCapture';
import CalendlySyncPanel from '@/components/integrations/CalendlySyncPanel';
import NotionSyncPanel from '@/components/integrations/NotionSyncPanel';
import GoogleSheetsSyncPanel from '@/components/integrations/GoogleSheetsSyncPanel';
import GoogleTasksSyncPanel from '@/components/integrations/GoogleTasksSyncPanel';
import ClickUpSyncPanel from '@/components/integrations/ClickUpSyncPanel';
import TodoistSyncPanel from '@/components/integrations/TodoistSyncPanel';
import GoogleCalendarSyncPanel from '@/components/integrations/GoogleCalendarSyncPanel';
import UpcomingMeetingsPanel from '@/components/integrations/UpcomingMeetingsPanel';
import ProjectSyncPanel from '@/components/integrations/ProjectSyncPanel';
import MeetingSummaryPanel from '@/components/integrations/MeetingSummaryPanel';
import CalendarSchedulePanel from '@/components/integrations/CalendarSchedulePanel';
import DeadlineCallPanel from '@/components/integrations/DeadlineCallPanel';
import PitchDeckPanel from '@/components/integrations/PitchDeckPanel';
import {
  Loader2, Calendar, Video, Table, FileText, Presentation, Mail,
  ListTodo, FolderKanban, ChevronDown, ChevronUp,
  Coffee, Brain, Zap, ExternalLink, CalendarClock, ArrowLeft, NotebookPen, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Connector display order: rendered grouped by CONNECTOR_CATEGORIES below
const CONNECTORS = [
  {
    id: '69fd1ec20e0e670e38251275',
    name: 'Google Calendar',
    description: 'Sync deadlines, schedule meetings, and track upcoming events.',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-500',
    category: 'Communication & Scheduling',
  },
  {
    id: '69fd203fe5416ec116a6593a',
    name: 'Google Meet',
    description: 'Create instant video meeting links for projects.',
    icon: Video,
    color: 'bg-green-50 text-green-500',
    category: 'Communication & Scheduling',
  },
  {
    id: '6a58b955a3acbfb32bf0271c',
    name: 'Google Sheets',
    description: 'Export project data to spreadsheets for reporting.',
    icon: Table,
    color: 'bg-emerald-50 text-emerald-500',
    category: 'Documents & Files',
  },
  {
    id: '6a58bb594a5a09e519c6c4a1',
    name: 'Google Docs',
    description: 'Generate meeting summaries and notes from project data.',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-500',
    category: 'Documents & Files',
  },
  {
    id: '6a58c008c3935ea2b4e8de42',
    name: 'Google Slides',
    description: 'Create pitch decks and presentations from projects.',
    icon: Presentation,
    color: 'bg-amber-50 text-amber-500',
    category: 'Documents & Files',
  },
  {
    id: '69fd1ff7759e80cf1cc1e1e9',
    name: 'Gmail',
    description: 'Send emails and notifications to your contacts.',
    icon: Mail,
    color: 'bg-red-50 text-red-500',
    category: 'Communication & Scheduling',
  },
  {
    id: '69fd1eef9864033b48130ab1',
    name: 'Google Tasks',
    description: 'Sync project deadlines into your Google Tasks list.',
    icon: ListTodo,
    color: 'bg-yellow-50 text-yellow-500',
    category: 'Task Management',
  },
  {
    id: '6a58c092588cac2ae027fd72',
    name: 'ClickUp',
    description: 'Sync project deadlines as tasks into your ClickUp lists.',
    icon: FolderKanban,
    color: 'bg-purple-50 text-purple-500',
    category: 'Task Management',
  },
  {
    id: '6aa063064d9baaa5807a360c',
    name: 'Todoist',
    description: 'Sync project deadlines as tasks into a Todoist project.',
    icon: ListTodo,
    color: 'bg-red-50 text-red-500',
    category: 'Task Management',
  },
  {
    id: '6a88338fe746048ca65ac142',
    name: 'Calendly',
    description: 'Connect your own Calendly account to sync bookings into project deadlines.',
    icon: CalendarClock,
    color: 'bg-indigo-50 text-indigo-500',
    category: 'Communication & Scheduling',
  },
  {
    id: '6a9c83fae18c151ef517de3b',
    name: 'Notion',
    description: 'Two-way sync your projects and task list with a Notion database you choose.',
    icon: NotebookPen,
    color: 'bg-stone-100 text-stone-600',
    category: 'Task Management',
  },
];

const CONNECTOR_CATEGORIES = ['Task Management', 'Communication & Scheduling', 'Documents & Files'];

function ConnectorCard({ connector, connected, onRecheck }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setLoading(false);
          onRecheck();
        }
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await base44.connectors.disconnectAppUser(connector.id);
    } catch {
      // ignore if no active connection
    }
    setLoading(false);
    onRecheck();
  };

  const Icon = connector.icon;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${connector.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{connector.name}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{connector.description}</p>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
          connected
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {connected ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        {loading ? (
          <div className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> {connected ? 'Disconnecting…' : 'Connecting…'}
          </div>
        ) : connected ? (
          <button
            onClick={handleDisconnect}
            className="flex-1 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Connect
          </button>
        )}
      </div>
    </div>
  );
}

function FeaturePanel({ icon: Icon, color, bg, title, description, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/30 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntegrationSettings() {
  const [statuses, setStatuses] = useState({});
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('checkConnectorStatuses', {
        connectorIds: CONNECTORS.map(c => c.id),
      });
      if (res.data.statuses) {
        setStatuses(res.data.statuses);
      }
    } catch {
      // ignore — statuses stay at default (not connected)
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    base44.entities.Project.list('-created_date', 100).then(setProjects).catch(() => {});
  }, [fetchStatuses]);

  return (
    <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">
          <div>
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h1 className="font-display font-bold text-2xl text-foreground">Integration Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect and manage your productivity tools in one place.</p>
          </div>

          {/* Summary card */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{CONNECTORS.length} integrations available</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect your accounts to enable syncing, scheduling, and automation features.</p>
            </div>
          </div>

          {/* Connectors grouped by category */}
          <div className="space-y-6">
            {CONNECTOR_CATEGORIES.map(label => (
              <div key={label} className="space-y-3">
                <h2 className="font-display font-semibold text-lg text-foreground">{label}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONNECTORS.filter(c => c.category === label).map(c => (
                    <ConnectorCard
                      key={c.id}
                      connector={c}
                      connected={!!statuses[c.id]}
                      onRecheck={fetchStatuses}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI features */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-semibold text-lg text-foreground">AI-Powered Features</h2>

            <FeaturePanel
              icon={Coffee}
              color="text-amber-500"
              bg="bg-amber-50"
              title="Auto-Break Scheduler"
              description="Automatically suggests regulation breaks between back-to-back meetings."
            >
              <AutoBreakScheduler />
            </FeaturePanel>

            <FeaturePanel
              icon={Brain}
              color="text-violet-500"
              bg="bg-violet-50"
              title="AI Context Capture"
              description="Extracts structured task context from emails, notes, and messages."
            >
              <ContextCapture />
            </FeaturePanel>
          </div>

          {/* Project & task sync */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-semibold text-lg text-foreground">Project & Task Sync</h2>

            <FeaturePanel
              icon={Table}
              color="text-emerald-500"
              bg="bg-emerald-50"
              title="Google Sheets Export"
              description="Push project data into a Google Sheet for reporting."
            >
              <GoogleSheetsSyncPanel />
            </FeaturePanel>

            <FeaturePanel
              icon={ListTodo}
              color="text-yellow-500"
              bg="bg-yellow-50"
              title="Google Tasks Sync"
              description="Sync project deadlines into your Google Tasks list."
            >
              <GoogleTasksSyncPanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={FolderKanban}
              color="text-purple-500"
              bg="bg-purple-50"
              title="ClickUp Sync"
              description="Sync project and task deadlines into your ClickUp lists."
            >
              <ClickUpSyncPanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={ListTodo}
              color="text-red-500"
              bg="bg-red-50"
              title="Todoist Sync"
              description="Sync project deadlines as tasks into a Todoist project."
            >
              <TodoistSyncPanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={Calendar}
              color="text-blue-500"
              bg="bg-blue-50"
              title="Google Calendar Task Sync"
              description="Put every task with a due date on your Google Calendar."
            >
              <GoogleCalendarSyncPanel />
            </FeaturePanel>

            <FeaturePanel
              icon={CalendarClock}
              color="text-indigo-500"
              bg="bg-indigo-50"
              title="Calendly Booking Sync"
              description="Match new team meeting bookings to project deadlines (match or create)."
            >
              <CalendlySyncPanel />
            </FeaturePanel>

            <FeaturePanel
              icon={NotebookPen}
              color="text-stone-600"
              bg="bg-stone-100"
              title="Notion Project & Task Sync"
              description="Two-way sync your projects and tasks with Notion — manually or automatically on sign-in."
            >
              <NotionSyncPanel connected={!!statuses['6a9c83fae18c151ef517de3b']} />
            </FeaturePanel>
          </div>

          {/* Meetings & client communication */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-semibold text-lg text-foreground">Meetings & Client Communication</h2>

            <FeaturePanel
              icon={Calendar}
              color="text-blue-500"
              bg="bg-blue-50"
              title="Upcoming Meetings"
              description="See what's coming up on your Google Calendar."
            >
              <UpcomingMeetingsPanel />
            </FeaturePanel>

            <FeaturePanel
              icon={Video}
              color="text-green-500"
              bg="bg-green-50"
              title="Project Sync Meetings"
              description="Create Google Meet links for project sync sessions."
            >
              <ProjectSyncPanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={FileText}
              color="text-indigo-500"
              bg="bg-indigo-50"
              title="Meeting Summaries"
              description="Generate AI meeting summaries and notes in Google Docs."
            >
              <MeetingSummaryPanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={CalendarClock}
              color="text-blue-500"
              bg="bg-blue-50"
              title="Schedule Project Meetings"
              description="Put project meetings straight onto your Google Calendar."
            >
              <CalendarSchedulePanel projects={projects} />
            </FeaturePanel>

            <FeaturePanel
              icon={PhoneCall}
              color="text-rose-500"
              bg="bg-rose-50"
              title="Deadline Calls"
              description="Schedule calls ahead of upcoming project deadlines."
            >
              <DeadlineCallPanel />
            </FeaturePanel>
          </div>

          {/* Business tools */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-semibold text-lg text-foreground">Business Tools</h2>

            <FeaturePanel
              icon={Presentation}
              color="text-amber-500"
              bg="bg-amber-50"
              title="Pitch Deck Builder"
              description="Generate a pitch deck in Google Slides from a project."
            >
              <PitchDeckPanel projects={projects} />
            </FeaturePanel>
          </div>

        </div>
    </div>
  );
}