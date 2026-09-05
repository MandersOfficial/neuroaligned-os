import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileSelect from '@/components/ui/MobileSelect';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NotionSyncPanel({ connected }) {
  const [databases, setDatabases] = useState([]);
  const [databaseId, setDatabaseId] = useState('');
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connected) return;
    setLoadingDbs(true);
    base44.functions.invoke('listNotionDatabases', {})
      .then(res => {
        const dbs = res.data?.databases || [];
        setDatabases(dbs);
        if (dbs.length > 0) setDatabaseId(dbs[0].id);
        if (dbs.length === 0) setError('No Notion databases found. Share a database with the NeuroAligned integration in Notion first.');
      })
      .catch(() => setError('Could not load your Notion databases. Make sure your Notion account is connected above.'))
      .finally(() => setLoadingDbs(false));
  }, [connected]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('syncProjectsToNotion', { database_id: databaseId });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Sync failed');
    }
    setSyncing(false);
  };

  if (!connected) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        Connect your Notion account in the list above to push your projects and tasks into Notion.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Pushes your projects into Notion on demand — one page per project (details, status and due date),
        plus a "NeuroAligned Tasks" page with your current task list that refreshes on every sync.
        Re-running is safe: project pages that already exist are left untouched.
      </p>

      {/* Database picker */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">Push destination</p>
        {loadingDbs ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your databases…
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 px-4 py-3 bg-background">
            <MobileSelect
              value={databaseId}
              onChange={setDatabaseId}
              options={databases.map(d => ({ value: d.id, label: d.title }))}
              placeholder={databases.length ? 'Pick a database…' : 'No databases shared with the app'}
              label="Notion database"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSync}
        disabled={syncing || !databaseId}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {syncing ? 'Pushing…' : 'Push projects & tasks now'}
      </button>

      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Couldn't sync</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-semibold">Pushed to Notion</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.projects_pushed}</p>
              <p className="text-[11px] text-muted-foreground">Project pages</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.projects_skipped}</p>
              <p className="text-[11px] text-muted-foreground">Already in Notion</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.tasks_pushed}</p>
              <p className="text-[11px] text-muted-foreground">Tasks (refreshed)</p>
            </div>
          </div>
          {result.projects?.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">New project pages</p>
              <ul className="space-y-1">
                {result.projects.map((name, i) => (
                  <li key={i} className="text-xs text-foreground truncate">• {name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}