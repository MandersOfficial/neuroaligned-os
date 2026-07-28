import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Inbox, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FeedbackSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('syncIntercomFeedbackToTasks', { dryRun: false });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to sync feedback');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Pulls recent customer conversations from Intercom and creates a communication task for each new piece of feedback. Already-synced conversations are skipped automatically.
      </p>
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Inbox className="w-3.5 h-3.5" />}
        {loading ? 'Syncing…' : 'Sync Feedback to Tasks'}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          {result.success ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium text-foreground">
                  {result.created} task{result.created !== 1 ? 's' : ''} created · {result.skipped} already synced
                </span>
              </div>
              {result.results && result.results.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.results.map(r => (
                    <div key={r.id} className="text-xs text-muted-foreground py-1.5 px-2 rounded bg-secondary/50">
                      <span className="font-medium text-foreground">{r.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{result.error || 'Sync failed'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}