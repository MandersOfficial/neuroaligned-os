import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, ListChecks, RefreshCw, Upload, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

const CLICKUP_CONNECTOR_ID = '6a58c092588cac2ae027fd72';

export default function ClickUpSyncPanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchLists = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listClickUpLists', {});
      if (res.data.error) {
        setError(res.data.error);
        setConnected(false);
      } else {
        setConnected(true);
        setLists(res.data.lists || []);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setError(msg);
      setConnected(false);
    }
    setChecking(false);
  };

  const handleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && !connected && lists.length === 0 && !checking) {
      fetchLists();
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(CLICKUP_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        fetchLists();
      }
    }, 500);
  };

  const handleSync = async () => {
    if (!selectedList) return;
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('syncProjectDeadlinesToClickUp', { list_id: selectedList });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
    setSyncing(false);
  };

  const activeWithDeadlines = projects.filter(p => p.status === 'active' && p.due_date);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <ListChecks className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sync to ClickUp</p>
            <p className="text-xs text-muted-foreground">Push project deadlines as ClickUp tasks</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {checking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking ClickUp connection…
            </div>
          ) : !connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect ClickUp to sync your project deadlines as tasks in your workspace.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect ClickUp
              </button>
              {error && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                  <span className="text-xs text-muted-foreground">· {lists.length} list{lists.length !== 1 ? 's' : ''} available</span>
                </div>
                <button onClick={fetchLists} className="text-muted-foreground hover:text-foreground" title="Refresh lists">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {activeWithDeadlines.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {activeWithDeadlines.length} active project{activeWithDeadlines.length !== 1 ? 's' : ''} with due date{activeWithDeadlines.length !== 1 ? 's' : ''} will be synced.
                </p>
              )}

              {lists.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No ClickUp lists found. Create a list in your ClickUp workspace, then refresh.
                </p>
              ) : (
                <>
                  <select
                    value={selectedList}
                    onChange={e => { setSelectedList(e.target.value); setResult(null); setError(null); }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">Select a ClickUp list…</option>
                    {lists.map(l => (
                      <option key={l.id} value={l.id}>{l.name} · {l.team_name} / {l.space_name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSync}
                    disabled={!selectedList || syncing}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : <><Upload className="w-3.5 h-3.5" /> Sync Deadlines</>}
                  </button>
                </>
              )}

              {result && (
                <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2.5 text-xs text-violet-700 space-y-1.5">
                  <p className="font-semibold">{result.synced} task{result.synced !== 1 ? 's' : ''} synced{result.total > result.synced ? ` · ${result.total - result.synced} failed` : ''}</p>
                  {result.results?.filter(r => r.success).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-violet-600">✓</span>
                      <span className="font-medium">{r.project}</span>
                      <span className="text-violet-400">due {r.due_date}</span>
                      {r.task_url && (
                        <a href={r.task_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Task
                        </a>
                      )}
                    </div>
                  ))}
                  {result.results?.filter(r => !r.success).map((r, i) => (
                    <div key={`fail-${i}`} className="text-red-600">✗ {r.project}: {r.error}</div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}