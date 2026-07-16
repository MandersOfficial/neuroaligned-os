import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import AutoBreakScheduler from '@/components/integrations/AutoBreakScheduler';
import ContextCapture from '@/components/integrations/ContextCapture';
import {
  CheckCircle2, Link2, Loader2, RefreshCw, AlertCircle,
  Calendar, Video, Table, FileText, Presentation, Mail,
  ListTodo, FolderKanban, HardDrive, ChevronDown, ChevronUp,
  Coffee, Brain, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONNECTORS = [
  {
    id: '69fd1ec20e0e670e38251275',
    name: 'Google Calendar',
    description: 'Sync deadlines, schedule meetings, and track upcoming events.',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    id: '69fd203fe5416ec116a6593a',
    name: 'Google Meet',
    description: 'Create instant video meeting links for focus rooms and projects.',
    icon: Video,
    color: 'bg-green-50 text-green-500',
  },
  {
    id: '6a58b955a3acbfb32bf0271c',
    name: 'Google Sheets',
    description: 'Export project data to spreadsheets for reporting.',
    icon: Table,
    color: 'bg-emerald-50 text-emerald-500',
  },
  {
    id: '6a58bb594a5a09e519c6c4a1',
    name: 'Google Docs',
    description: 'Generate meeting summaries and notes from project data.',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-500',
  },
  {
    id: '6a58c008c3935ea2b4e8de42',
    name: 'Google Slides',
    description: 'Create pitch decks and presentations from projects.',
    icon: Presentation,
    color: 'bg-amber-50 text-amber-500',
  },
  {
    id: '69fd1ff7759e80cf1cc1e1e9',
    name: 'Gmail',
    description: 'Send emails and notifications to your contacts.',
    icon: Mail,
    color: 'bg-red-50 text-red-500',
  },
  {
    id: '69fd1eef9864033b48130ab1',
    name: 'Google Tasks',
    description: 'Sync project deadlines into your Google Tasks list.',
    icon: ListTodo,
    color: 'bg-yellow-50 text-yellow-500',
  },
  {
    id: '69fd2017a301e5f58c875f5d',
    name: 'Google Drive',
    description: 'Access and manage files stored in your Drive.',
    icon: HardDrive,
    color: 'bg-cyan-50 text-cyan-500',
  },
  {
    id: '6a58c092588cac2ae027fd72',
    name: 'ClickUp',
    description: 'Sync project deadlines as tasks into your ClickUp lists.',
    icon: FolderKanban,
    color: 'bg-purple-50 text-purple-500',
  },
  {
    id: '6a1cfa4c8db502aafb000e1a',
    name: 'Notion',
    description: 'Sync projects, tasks, and profiles with your Notion workspace.',
    icon: FileText,
    color: 'bg-slate-100 text-slate-600',
  },
];

function ConnectorCard({ connector }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnected(true);
          setLoading(false);
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
    setConnected(false);
    setLoading(false);
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">
          <div>
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

          {/* Connector grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONNECTORS.map(c => (
              <ConnectorCard key={c.id} connector={c} />
            ))}
          </div>

          {/* Feature panels */}
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

          {/* Quick links to dedicated sync pages */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/calendar-sync"
              className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-5 py-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Calendar Sync</p>
                <p className="text-xs text-muted-foreground mt-0.5">Push project deadlines to Google Calendar</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>

            <Link
              to="/notion-sync"
              className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-5 py-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Notion Sync</p>
                <p className="text-xs text-muted-foreground mt-0.5">Two-way sync with your Notion workspace</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}