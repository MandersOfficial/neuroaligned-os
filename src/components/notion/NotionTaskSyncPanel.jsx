import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, ArrowDown, Link2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const NOTION_CONNECTOR_ID = '6a1cfa4c8db502aafb000e1a';

export default function NotionTaskSyncPanel({ onSynced }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [dbId, setDbId] = useState('');
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('notionListDatabases', {});
      if (res.data.databases) {
        setConnected(true);
        setDatabases(res.data.databases);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
    setChecking(false);
  };

  useEffect(() => {
    if (expanded && !checking && connected === false && databases.length === 0) {
      checkConnection();
    }
  }, [expanded]);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(NOTION_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        checkConnection();
      }
    }, 500);
  };

  const handlePull = async () => {
    if (!dbId) return;
    setPulling(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('notionPullTasks', { notion_database_id: dbId });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
        if (onSynced) onSynced();
      }
    } catch (e) {
      setError(e.message);
    }
    setPulling(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sync tasks from Notion</p>
            <p className="text-xs text-muted-foreground">Pull task lists from a Notion database</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {checking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Notion connection…
            </div>
          ) : !connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect your Notion account to start syncing tasks.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Notion
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                  <span className="text-xs text-muted-foreground">· {databases.length} database{databases.length !== 1 ? 's' : ''}</span>
                </div>
                <button onClick={checkConnection} className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {databases.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No databases found. In Notion, open your database → "…" → "Add connections" → select your integration.
                </p>
              ) : (
                <>
                  <select
                    value={dbId}
                    onChange={e => { setDbId(e.target.value); setResult(null); setError(null); }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select a database…</option>
                    {databases.map(db => (
                      <option key={db.id} value={db.id}>{db.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handlePull}
                    disabled={!dbId || pulling}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    {pulling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Pulling tasks…</> : <><ArrowDown className="w-3.5 h-3.5" /> Pull Tasks</>}
                  </button>

                  {result && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-700">
                      <p className="font-semibold">
                        {result.synced} task{result.synced !== 1 ? 's' : ''} synced
                        {result.created !== undefined && ` (${result.created} created, ${result.updated} updated)`}.
                      </p>
                      <p className="text-[10px] mt-0.5 text-green-600">Click "Pull Tasks" again anytime to re-sync.</p>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}