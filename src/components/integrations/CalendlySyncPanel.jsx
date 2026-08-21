import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CalendlySyncPanel() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('syncCalendlyBookingsToProjects', {});
      setResult(res.data);
    } catch (e) {
      setError(e.message || 'Sync failed');
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Scans your last 7 days of Calendly bookings and matches each meeting to a project by name —
        updating the project's deadline to the meeting date, or creating a new project if none matches.
        Re-running is safe: existing projects are updated, not duplicated.
      </p>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {syncing ? 'Syncing…' : 'Sync Calendly bookings'}
      </button>

      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Couldn't sync</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-1 text-muted-foreground">Make sure your Calendly account is connected above, then try again.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-semibold">Sync complete</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.scanned}</p>
              <p className="text-[11px] text-muted-foreground">Bookings scanned</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.updated}</p>
              <p className="text-[11px] text-muted-foreground">Projects updated</p>
            </div>
            <div className="bg-white/60 rounded-lg py-2">
              <p className="text-lg font-bold text-foreground">{result.created}</p>
              <p className="text-[11px] text-muted-foreground">Projects created</p>
            </div>
          </div>
          {result.createdDetails?.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">New projects</p>
              <ul className="space-y-1">
                {result.createdDetails.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <CalendarClock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{d.name}</span>
                    <span className="text-muted-foreground ml-auto">{d.due_date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}