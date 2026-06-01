import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Database, RefreshCw, ExternalLink, AlertCircle, ChevronDown, Link2, Link2Off } from 'lucide-react';

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

export default function NotionSync() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [projectDbId, setProjectDbId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check connection status on mount by trying to list databases
  const fetchDatabases = async () => {
    setLoadingDbs(true);
    setSyncStatus(null);
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
    setProjectDbId('');
    setSyncStatus(null);
    setSyncResult(null);
    setConnecting(false);
  };

  const handleSync = async () => {
    if (!projectDbId) return;
    setSyncing(true);
    setSyncStatus(null);
    setSyncResult(null);
    const res = await base44.functions.invoke('notionSyncProjects', { notion_database_id: projectDbId });
    if (res.data.success) {
      setSyncStatus('success');
      setSyncResult(res.data);
    } else {
      setSyncStatus('error');
      setSyncResult(res.data);
    }
    setSyncing(false);
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
            <p className="font-semibold text-sm text-foreground">Notion — Active Project Sync</p>
            <p className="text-xs text-muted-foreground">Push your active projects to a Notion database</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
          connected
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {connected ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      {!connected ? (
        <div className="border border-border/60 rounded-xl p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your Notion account to sync active project statuses directly to a Notion database.
          </p>
          <a
            href="https://www.notion.so/help/create-integrations-with-the-notion-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Learn about Notion integrations <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            Connect Notion
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* What gets synced */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Fields synced to Notion</p>
            <div className="grid grid-cols-2 gap-1">
              {['Name', 'Status (active only)', 'Priority', 'Client', 'Due Date', 'Notes', 'NeuroAligned ID'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Database selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Target Notion Database</label>
              <button
                onClick={fetchDatabases}
                disabled={loadingDbs}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {loadingDbs ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Refresh
              </button>
            </div>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                value={projectDbId}
                onChange={e => { setProjectDbId(e.target.value); setSyncStatus(null); }}
              >
                <option value="">Select a database…</option>
                {databases.map(db => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            {databases.length === 0 && !loadingDbs && (
              <p className="text-xs text-amber-600">No databases found. Make sure your Notion integration has been granted access to your databases.</p>
            )}
          </div>

          {/* Sync button + status */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={!projectDbId || syncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {syncing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</>
                : <><RefreshCw className="w-4 h-4" /> Sync Active Projects</>
              }
            </button>
            <StatusBadge status={syncStatus} />
          </div>

          {syncResult && syncStatus === 'success' && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 space-y-1">
              <p className="font-semibold">{syncResult.synced} active project{syncResult.synced !== 1 ? 's' : ''} synced to Notion.</p>
              {syncResult.results?.length > 0 && (
                <ul className="space-y-0.5 mt-1">
                  {syncResult.results.map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {r.name} — {r.action}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {syncResult && syncStatus === 'error' && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
              {syncResult.error}
            </p>
          )}

          {/* Disconnect */}
          <div className="pt-2 border-t border-border/40">
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