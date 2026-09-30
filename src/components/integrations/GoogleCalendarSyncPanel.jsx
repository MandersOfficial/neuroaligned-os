import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ChevronDown, ChevronUp, CheckCircle2, RefreshCw, Upload, AlertCircle, ExternalLink, Calendar } from 'lucide-react';

const GOOGLE_CALENDAR_CONNECTOR_ID = '69fd1ec20e0e670e38251275';

export default function GoogleCalendarSyncPanel() {
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Reading the calendar doubles as the connection check — it uses the same
  // grant the sync does, and never writes anything.
  const checkConnection = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listUpcomingMeetings', {});
      if (res.data.error) {
        setError(res.data.error);
        setConnected(false);
      } else {
        setConnected(true);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setConnected(false);
    }
    setChecking(false);
  };

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !connected && !checking) checkConnection();
  };

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(GOOGLE_CALENDAR_CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        checkConnection();
      }
    }, 500);
  };

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('syncTasksToGoogleCalendar', {});
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

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Sync tasks to Google Calendar</p>
            <p className="text-xs text-muted-foreground">Put every dated task on your calendar</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/30 pt-4">
          {checking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Google Calendar connection…
            </div>
          ) : !connected ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect Google Calendar and your tasks will appear there as all-day events on their due dates — so your work and your schedule live in one place.
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                Connect Google Calendar
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
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
                <button onClick={checkConnection} className="text-muted-foreground hover:text-foreground" title="Recheck connection">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Open tasks with a due date are added as all-day events. Re-syncing updates the same events instead of creating duplicates.
              </p>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : <><Upload className="w-3.5 h-3.5" /> Sync Tasks</>}
              </button>

              {result && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800 space-y-1.5">
                  <p className="font-semibold">
                    {result.synced} task{result.synced !== 1 ? 's' : ''} synced
                    {result.created > 0 && ` · ${result.created} new`}
                    {result.updated > 0 && ` · ${result.updated} updated`}
                    {result.total > result.synced ? ` · ${result.total - result.synced} failed` : ''}
                  </p>
                  {result.results?.filter(r => r.success).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-blue-500">✓</span>
                      <span className="font-medium">{r.title}</span>
                      <span className="text-blue-500">{r.action === 'updated' ? 'updated' : `due ${r.due_date}`}</span>
                      {r.event_url && (
                        <a href={r.event_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-700 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Event
                        </a>
                      )}
                    </div>
                  ))}
                  {result.results?.filter(r => !r.success).map((r, i) => (
                    <div key={`fail-${i}`} className="text-red-600">✗ {r.title}: {r.error}</div>
                  ))}
                  {result.total === 0 && <p>{result.message}</p>}
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