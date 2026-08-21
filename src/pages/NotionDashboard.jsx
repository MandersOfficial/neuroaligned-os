import { useState, useEffect } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DatabaseSelect from '../components/notion/DatabaseSelect';
import { StatusBadge, SyncResultBox } from '../components/notion/SyncResult';
import TaskPuller from '../components/notion/TaskPuller';
import CreatePageForm from '../components/notion/CreatePageForm';
import NotionContentViewer from '../components/notion/NotionContentViewer';
import NotionAutoSyncPin from '../components/notion/NotionAutoSyncPin';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Database, RefreshCw, ArrowUp, ArrowDown,
  Link2, Link2Off, FolderKanban, CheckSquare, FilePlus, Table2, Zap,
} from 'lucide-react';

const CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'create', label: 'Create Page', icon: FilePlus },
  { id: 'browse', label: 'Browse', icon: Table2 },
];

export default function NotionDashboard() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [dbId, setDbId] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [autoSync, setAutoSync] = useState(false);
  const [savingAutoSync, setSavingAutoSync] = useState(false);

  // Push state (app → Notion)
  const [pushing, setPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);
  const [pushResult, setPushResult] = useState(null);

  // Pull state (Notion → app)
  const [pulling, setPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState(null);
  const [pullResult, setPullResult] = useState(null);

  const fetchDatabases = async () => {
    setLoadingDbs(true);
    try {
      const res = await base44.functions.invoke('notionListDatabases', {});
      if (res.data.databases) {
        setDatabases(res.data.databases);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
    setLoadingDbs(false);
    setChecking(false);
  };

  useEffect(() => {
    fetchDatabases();
    base44.auth.me().then(u => {
      if (u?.notion_projects_db) setAutoSync(true);
    }).catch(() => {});
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        fetchDatabases();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setDatabases([]);
    setDbId('');
    setPushStatus(null);
    setPullStatus(null);
    setPushResult(null);
    setPullResult(null);
    setConnecting(false);
  };

  const handlePush = async () => {
    if (!dbId) return;
    setPushing(true);
    setPushStatus(null);
    setPushResult(null);
    try {
      const res = await base44.functions.invoke('notionSyncProjects', { notion_database_id: dbId });
      setPushStatus(res.data.success ? 'success' : 'error');
      setPushResult(res.data);
    } catch (e) {
      setPushStatus('error');
      setPushResult({ error: e.message });
    }
    setPushing(false);
  };

  const handlePull = async () => {
    if (!dbId) return;
    setPulling(true);
    setPullStatus(null);
    setPullResult(null);
    try {
      const res = await base44.functions.invoke('notionPullProjects', { notion_database_id: dbId });
      setPullStatus(res.data.success ? 'success' : 'error');
      setPullResult(res.data);
    } catch (e) {
      setPullStatus('error');
      setPullResult({ error: e.message });
    }
    setPulling(false);
  };

  const handleToggleAutoSync = async () => {
    if (!dbId && !autoSync) return;
    setSavingAutoSync(true);
    try {
      if (autoSync) {
        await base44.auth.updateMe({ notion_projects_db: '' });
        setAutoSync(false);
      } else {
        await base44.auth.updateMe({ notion_projects_db: dbId });
        setAutoSync(true);
      }
    } catch { /* ignore */ }
    setSavingAutoSync(false);
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">N</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Notion Sync</h1>
                <p className="text-xs text-muted-foreground">Two-way sync between your workspace and Notion</p>
              </div>
            </div>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
              connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-secondary text-muted-foreground border-border'
            }`}>
              {connected ? '● Connected' : '○ Not connected'}
            </span>
          </div>

          {!connected ? (
            <div className="border border-border/60 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <span className="text-slate-900 font-black text-2xl">N</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Connect your Notion account</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                  Authorize Notion to enable task pulling, page creation, project syncing, and content browsing.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Connect Notion
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Database selector */}
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Notion Database</p>
                  </div>
                  <button
                    onClick={fetchDatabases}
                    disabled={loadingDbs}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {loadingDbs ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refresh
                  </button>
                </div>
                <DatabaseSelect databases={databases} value={dbId} onChange={setDbId} loading={loadingDbs} />
                {databases.length === 0 && !loadingDbs && (
                  <p className="text-xs text-amber-600 mt-2">
                    No databases found. In Notion, open your database → "…" → "Add connections" → select your integration.
                  </p>
                )}
              </div>

              {/* Automated sync pin (admin) — tasks */}
              <NotionAutoSyncPin dbId={dbId} />

              {/* Automated sync pin (admin) — project deadlines */}
              <NotionAutoSyncPin
                dbId={dbId}
                settingKey="notion_projects_database_id"
                title="Automated 30-min project deadline sync"
                description="Pin the selected database as the source for scheduled project deadline syncing."
                pinLabel="Pin for deadlines"
                pinnedMsg="Pinned — project deadlines will sync every 30 minutes."
                unpinnedMsg="Unpinned — project deadline sync paused."
                settingLabel="Notion project database (deadline auto-sync)"
              />

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {/* Auto-sync toggle */}
                  <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Auto-sync project status</p>
                        <p className="text-xs text-muted-foreground">Push status changes to Notion automatically when you update a project</p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleAutoSync}
                      disabled={(!dbId && !autoSync) || savingAutoSync}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        autoSync
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
                      } disabled:opacity-50`}
                    >
                      {savingAutoSync ? '…' : autoSync ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Push panel */}
                    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <ArrowUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Push to Notion</p>
                          <p className="text-xs text-muted-foreground">App projects → Notion</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Sends your active projects' status, priority, client, due date, and notes to the selected Notion database.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePush}
                          disabled={!dbId || pushing}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {pushing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Pushing…</> : <><ArrowUp className="w-3.5 h-3.5" /> Push Projects</>}
                        </button>
                        <StatusBadge status={pushStatus} />
                      </div>
                      <SyncResultBox result={pushResult} status={pushStatus} />
                    </div>

                    {/* Pull panel */}
                    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                          <ArrowDown className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Pull from Notion</p>
                          <p className="text-xs text-muted-foreground">Notion → App projects</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Imports Notion changes back into your app. New Notion pages become new projects; existing ones are updated.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePull}
                          disabled={!dbId || pulling}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                        >
                          {pulling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Pulling…</> : <><ArrowDown className="w-3.5 h-3.5" /> Pull Projects</>}
                        </button>
                        <StatusBadge status={pullStatus} />
                      </div>
                      <SyncResultBox result={pullResult} status={pullStatus} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && <TaskPuller databases={databases} />}
              {activeTab === 'create' && <CreatePageForm databases={databases} />}
              {activeTab === 'browse' && <NotionContentViewer databases={databases} />}

              {/* Disconnect */}
              <div className="pt-1 border-t border-border/40">
                <button
                  onClick={handleDisconnect}
                  disabled={connecting}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  Disconnect Notion
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}