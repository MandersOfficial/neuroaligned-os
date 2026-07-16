import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, CheckSquare, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const TASKS_CONNECTOR_ID = '69fd1eef9864033b48130ab1';

export default function GoogleTasksSyncPanel({ projects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const dueDateCount = projects.filter(p => p.due_date && p.status !== 'completed' && p.status !== 'archived').length;

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(TASKS_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        setConnected(true);
      }
    }, 500);
  };

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('syncProjectDeadlinesToTasks', {});
      if (res.data.error) {
        setError(res.data.error);
        if (res.data.error.toLowerCase().includes('connection') || res.data.error.toLowerCase().includes('connector')) {
          setConnected(false);
        }
      } else {
        setResult(res.data);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message;
      setError(msg);
      if (msg.toLowerCase().includes('connection') || msg.toLowerCase().includes('connector')) {
        setConnected(false);
      }
    }
    setSyncing(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sync Deadlines to Google Tasks</p>
            <p className="text-xs text-muted-foreground">Create task items for projects with due dates</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {!connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Connect Google Tasks to sync your project deadlines as task items.</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Tasks
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
                <span className="text-muted-foreground">· {dueDateCount} project{dueDateCount !== 1 ? 's' : ''} with due date{dueDateCount !== 1 ? 's' : ''}</span>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing || dueDateCount === 0}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : <><RefreshCw className="w-3.5 h-3.5" /> Sync Deadlines</>}
              </button>

              {dueDateCount === 0 && !result && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No active projects with due dates. Add a due date to a project first.
                </p>
              )}

              {result && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2.5 text-xs text-indigo-700">
                  <p className="font-semibold">{result.synced} of {result.total} deadline{result.synced !== 1 ? 's' : ''} synced to Google Tasks.</p>
                  {result.message && <p className="text-[10px] mt-0.5 text-indigo-600">{result.message}</p>}
                  {result.errors?.length > 0 && (
                    <p className="text-[10px] mt-0.5 text-amber-600">{result.errors.length} error(s) occurred during sync.</p>
                  )}
                  <p className="text-[10px] mt-0.5 text-indigo-600">Click "Sync Deadlines" again anytime to re-sync.</p>
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