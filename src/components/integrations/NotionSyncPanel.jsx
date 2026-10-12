import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileSelect from '@/components/ui/MobileSelect';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NotionSyncPanel({ connected }) {
  const [databases, setDatabases] = useState([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connected) return;
    (async () => {
      try {
        // Load saved sync preferences + the user's shared Notion databases
        const me = await base44.auth.me();
        const res = await base44.functions.invoke('listNotionDatabases', {});
        const dbs = res.data?.databases || [];
        setDatabases(dbs);
        if (me.notion_sync_datasource_id) setDataSourceId(me.notion_sync_datasource_id);
        if (me.notion_auto_sync !== undefined) setAutoSync(!!me.notion_auto_sync);
        if (dbs.length === 0) {
          setError('No Notion databases found. Share a database with the NeuroAligned integration in Notion first.');
        } else if (!me.notion_sync_datasource_id) {
          // First visit: default to the first database and remember the choice
          setDataSourceId(dbs[0].id);
          try { await base44.auth.updateMe({ notion_sync_datasource_id: dbs[0].id }); } catch { /* non-fatal */ }
        }
      } catch {
        setError('Could not load your Notion databases. Make sure your Notion account is connected above.');
      }
      setLoading(false);
    })();
  }, [connected]);

  const pickDatabase = async (id) => {
    setDataSourceId(id);
    setResult(null);
    setError(null);
    try { await base44.auth.updateMe({ notion_sync_datasource_id: id }); } catch { /* non-fatal */ }
  };

  const toggleAutoSync = async (checked) => {
    setAutoSync(checked);
    try { await base44.auth.updateMe({ notion_auto_sync: checked }); } catch { /* non-fatal */ }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('syncProjectsToNotion', { data_source_id: dataSourceId });
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Sync failed');
    }
    setSyncing(false);
  };

  if (!connected) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        Connect your Notion account in the list above to two-way sync your projects and tasks with Notion.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Two-way sync with the Notion database you pick: your projects become Notion rows (status, priority,
        due date and client stay in sync both ways), and a "NeuroAligned Tasks" page refreshes with your
        current task list. Each project is linked to its row, so renaming either side updates the same row
        instead of creating a duplicate, and whichever side you edited last wins. Every row in the selected
        database is treated as a project — use a dedicated database for syncing.
      </p>

      {/* Database picker */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">Sync target</p>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your databases…
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 px-4 py-3 bg-background">
            <MobileSelect
              value={dataSourceId}
              onChange={pickDatabase}
              options={databases.map(d => ({ value: d.id, label: d.title }))}
              placeholder={databases.length ? 'Pick a database…' : 'No databases shared with the app'}
              label="Notion database"
            />
          </div>
        )}
      </div>

      {/* Auto-sync toggle */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 bg-background">
        <div>
          <p className="text-xs font-semibold text-foreground">Sync automatically</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Runs quietly each time you sign in (once per session).</p>
        </div>
        <Switch checked={autoSync} onCheckedChange={toggleAutoSync} />
      </div>

      <button
        onClick={handleSync}
        disabled={syncing || !dataSourceId}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {syncing ? 'Syncing…' : 'Sync now'}
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
            <p className="text-sm font-semibold">Sync complete</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.pushed_new}</p>
              <p className="text-[11px] text-muted-foreground">New in Notion</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.pushed_updated}</p>
              <p className="text-[11px] text-muted-foreground">Updated in Notion</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.pulled_created + result.pulled_updated}</p>
              <p className="text-[11px] text-muted-foreground">Pulled into NeuroAligned</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.tasks_pushed}</p>
              <p className="text-[11px] text-muted-foreground">Tasks (refreshed)</p>
            </div>
          </div>
          {result.in_sync > 0 && (
            <p className="text-[11px] text-muted-foreground text-center">{result.in_sync} already in sync</p>
          )}
          {result.failed?.length > 0 && (
            <p className="text-[11px] text-destructive text-center">
              {result.failed.length} row(s) couldn't be updated in Notion
            </p>
          )}
          {result.created_in_app?.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">New projects from Notion</p>
              <ul className="space-y-1">
                {result.created_in_app.map((name, i) => (
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