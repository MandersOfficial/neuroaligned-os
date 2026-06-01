import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle2, Loader2, Database, Users, RefreshCw,
  ExternalLink, AlertCircle, ChevronDown, Link2, Link2Off
} from 'lucide-react';

const CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

function StatusBadge({ status }) {
  if (status === 'success') return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Synced
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
      <AlertCircle className="w-3.5 h-3.5" /> Failed
    </span>
  );
  return null;
}

function SyncResultBox({ result, status }) {
  if (!result) return null;
  if (status === 'success') return (
    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 space-y-1">
      <p className="font-semibold">{result.synced} record{result.synced !== 1 ? 's' : ''} synced to Notion.</p>
      {result.results?.length > 0 && (
        <ul className="space-y-0.5 mt-1">
          {result.results.map((r, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              {r.name} — {r.action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  if (status === 'error') return (
    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
      {result.error}
    </p>
  );
  return null;
}

function DatabaseSelect({ databases, value, onChange, loading }) {
  return (
    <div className="relative">
      <select
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none disabled:opacity-50"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading || databases.length === 0}
      >
        <option value="">Select a database…</option>
        {databases.map(db => (
          <option key={db.id} value={db.id}>{db.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function NotionSync() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);

  // Projects sync state
  const [projectDbId, setProjectDbId] = useState('');
  const [syncingProjects, setSyncingProjects] = useState(false);
  const [projectSyncStatus, setProjectSyncStatus] = useState(null);
  const [projectSyncResult, setProjectSyncResult] = useState(null);

  // Profiles sync state
  const [profileDbId, setProfileDbId] = useState('');
  const [syncingProfiles, setSyncingProfiles] = useState(false);
  const [profileSyncStatus, setProfileSyncStatus] = useState(null);
  const [profileSyncResult, setProfileSyncResult] = useState(null);

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

  useEffect(() => { fetchDatabases(); }, []);

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
    setProjectDbId('');
    setProfileDbId('');
    setProjectSyncStatus(null);
    setProfileSyncStatus(null);
    setProjectSyncResult(null);
    setProfileSyncResult(null);
    setConnecting(false);
  };

  const handleSyncProjects = async () => {
    if (!projectDbId) return;
    setSyncingProjects(true);
    setProjectSyncStatus(null);
    setProjectSyncResult(null);
    const res = await base44.functions.invoke('notionSyncProjects', { notion_database_id: projectDbId });
    setProjectSyncStatus(res.data.success ? 'success' : 'error');
    setProjectSyncResult(res.data);
    setSyncingProjects(false);
  };

  const handleSyncProfiles = async () => {
    if (!profileDbId) return;
    setSyncingProfiles(true);
    setProfileSyncStatus(null);
    setProfileSyncResult(null);
    const res = await base44.functions.invoke('notionSyncProfiles', { notion_database_id: profileDbId });
    setProfileSyncStatus(res.data.success ? 'success' : 'error');
    setProfileSyncResult(res.data);
    setSyncingProfiles(false);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base">N</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Notion Integration</p>
            <p className="text-xs text-muted-foreground">Sync project statuses & team profiles to your Notion workspace</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
          connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {connected ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      {!connected ? (
        /* ── Not Connected State ── */
        <div className="border border-border/60 rounded-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <span className="text-slate-900 font-black text-2xl">N</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Connect your Notion account</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
              Authorize Notion to automatically pull in project statuses and team member profiles.
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
          <a
            href="https://www.notion.so/help/create-integrations-with-the-notion-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            How Notion integrations work <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        /* ── Connected State ── */
        <div className="space-y-4">
          {/* Refresh databases row */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Select a Notion database for each sync type below.</p>
            <button
              onClick={fetchDatabases}
              disabled={loadingDbs}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {loadingDbs ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Refresh databases
            </button>
          </div>

          {databases.length === 0 && !loadingDbs && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              No databases found. In Notion, open each database → click "…" → "Add connections" → select your integration.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* ── Project Status Sync ── */}
            <div className="border border-border/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Project Statuses</p>
                  <p className="text-xs text-muted-foreground">Active projects only</p>
                </div>
              </div>

              <div className="space-y-1">
                {['Name', 'Status', 'Priority', 'Client', 'Due Date', 'Notes'].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" /> {f}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Target Database</label>
                <DatabaseSelect
                  databases={databases}
                  value={projectDbId}
                  onChange={v => { setProjectDbId(v); setProjectSyncStatus(null); }}
                  loading={loadingDbs}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSyncProjects}
                  disabled={!projectDbId || syncingProjects}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {syncingProjects
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                    : <><RefreshCw className="w-3.5 h-3.5" /> Sync Projects</>
                  }
                </button>
                <StatusBadge status={projectSyncStatus} />
              </div>

              <SyncResultBox result={projectSyncResult} status={projectSyncStatus} />
            </div>

            {/* ── Team Profile Sync ── */}
            <div className="border border-border/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Team Profiles</p>
                  <p className="text-xs text-muted-foreground">All member profiles</p>
                </div>
              </div>

              <div className="space-y-1">
                {['Name', 'Email', 'Business Type', 'Work Style', 'Peak Energy', 'Neurotypes'].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-violet-400 shrink-0" /> {f}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Target Database</label>
                <DatabaseSelect
                  databases={databases}
                  value={profileDbId}
                  onChange={v => { setProfileDbId(v); setProfileSyncStatus(null); }}
                  loading={loadingDbs}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSyncProfiles}
                  disabled={!profileDbId || syncingProfiles}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {syncingProfiles
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                    : <><RefreshCw className="w-3.5 h-3.5" /> Sync Profiles</>
                  }
                </button>
                <StatusBadge status={profileSyncStatus} />
              </div>

              <SyncResultBox result={profileSyncResult} status={profileSyncStatus} />
            </div>
          </div>

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
  );
}