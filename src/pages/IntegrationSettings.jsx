import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  CheckCircle2, Link2, Loader2, RefreshCw, AlertCircle,
  Calendar, Video, Table, FileText, Presentation, Mail,
  ListTodo, FolderKanban, HardDrive, ChevronDown, ChevronUp, X, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONNECTORS = [
  {
    id: '69fd1ec20e0e670e38251275',
    name: 'Google Calendar',
    description: 'Sync deadlines, schedule meetings, and track upcoming events.',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-500',
    scopes: ['calendar.events.readonly', 'email'],
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

function ConnectorCard({ connector, onStatusChange }) {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      setConnected(!!url);
    } catch (e) {
      // If it throws, likely means already connected or no connector set
      setConnected(false);
    }
    // Lightweight check: try connecting silently won't work well.
    // Instead we use a simple heuristic — check via localStorage flag
    const flag = localStorage.getItem(`connector_${connector.id}_connected`);
    if (flag === 'true') setConnected(true);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnecting(false);
          localStorage.setItem(`connector_${connector.id}_connected`, 'true');
          setConnected(true);
          if (onStatusChange) onStatusChange();
        }
      }, 500);
    } catch (e) {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`connector_${connector.id}_connected`);
    setConnected(false);
    if (onStatusChange) onStatusChange();
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
      </div>

      <div className="flex items-center gap-2 mt-1">
        {checking ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Checking…
          </span>
        ) : connected ? (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </span>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Not connected
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        {connected ? (
          <button
            onClick={handleDisconnect}
            className="flex-1 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationSettings() {
  const [user, setUser] = useState(null);
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  const refreshCount = () => {
    const count = CONNECTORS.filter(c => localStorage.getItem(`connector_${c.id}_connected`) === 'true').length;
    setConnectedCount(count);
  };

  useEffect(() => {
    refreshCount();
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Integration Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Connect and manage your productivity tools in one place.</p>
            </div>
            <button
              onClick={refreshCount}
              className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Summary card */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {connectedCount} of {CONNECTORS.length} integrations connected
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect your accounts to enable syncing, scheduling, and automation features.</p>
            </div>
          </div>

          {/* Connector grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONNECTORS.map(c => (
              <ConnectorCard key={c.id} connector={c} onStatusChange={refreshCount} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}