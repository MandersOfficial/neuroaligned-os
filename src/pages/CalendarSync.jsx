import { useState, useEffect, useCallback } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { StatusBadge, SyncResultBox } from '../components/notion/SyncResult';
import { base44 } from '@/api/base44Client';
import { Loader2, Calendar, RefreshCw, Link2, Link2Off, ArrowUp, CalendarDays } from 'lucide-react';

const CONNECTOR_ID = '69fd1ec20e0e670e38251275';

export default function CalendarSync() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [projects, setProjects] = useState([]);
  const [existingCount, setExistingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const fetchPreview = useCallback(async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke('googleCalendarSyncDeadlines', { dryRun: true });
      if (res.data.success) {
        setConnected(true);
        setProjects(res.data.projects || []);
        setExistingCount(res.data.existingCount || 0);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
      setProjects([]);
    }
    setChecking(false);
  }, []);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  const handleConnect = async () => {
    setConnecting(true);
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(false);
        fetchPreview();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setProjects([]);
    setExistingCount(0);
    setSyncStatus(null);
    setSyncResult(null);
    setConnecting(false);
    setChecking(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('googleCalendarSyncDeadlines', { dryRun: false });
      setSyncStatus(res.data.success ? 'success' : 'error');
      setSyncResult(res.data);
      if (res.data.success) {
        setExistingCount(res.data.synced);
      }
    } catch (e) {
      setSyncStatus('error');
      setSyncResult({ error: e.message });
    }
    setSyncing(false);
  };

  if (checking && !connected) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sorted = [...projects].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Calendar Sync</h1>
                <p className="text-xs text-muted-foreground">Push project deadlines to your Google Calendar</p>
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
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Connect your Google Calendar</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                  Authorize Google Calendar to sync your project deadlines as all-day events on your daily schedule.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Connect Google Calendar
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <ArrowUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sync Deadlines</p>
                      <p className="text-xs text-muted-foreground">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} with due dates · {existingCount} already on calendar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchPreview}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Creates an all-day event on each project's due date. Existing NeuroAligned events are updated, so re-syncing won't create duplicates.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSync}
                    disabled={syncing || projects.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</> : <><ArrowUp className="w-3.5 h-3.5" /> Sync to Calendar</>}
                  </button>
                  <StatusBadge status={syncStatus} />
                </div>

                <SyncResultBox result={syncResult} status={syncStatus} />
              </div>

              {sorted.length > 0 && (
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">Upcoming Deadlines</p>
                  <div className="space-y-1">
                    {sorted.map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Due {p.due_date} · {p.status}</p>
                        </div>
                        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-sm font-medium text-amber-700">No projects with due dates</p>
                  <p className="text-xs text-amber-600 mt-1">Add due dates to your projects to sync them to your calendar.</p>
                </div>
              )}

              <div className="pt-1 border-t border-border/40">
                <button
                  onClick={handleDisconnect}
                  disabled={connecting}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  Disconnect Google Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}