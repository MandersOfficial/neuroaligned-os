import { CheckCircle2, AlertCircle } from 'lucide-react';

export function StatusBadge({ status }) {
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

export function SyncResultBox({ result, status }) {
  if (!result) return null;
  if (status === 'success') return (
    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 space-y-1">
      <p className="font-semibold">
        {result.synced} record{result.synced !== 1 ? 's' : ''} synced
        {result.created !== undefined && ` (${result.created} created, ${result.updated} updated)`}.
      </p>
      {result.results?.length > 0 && (
        <ul className="space-y-0.5 mt-1">
          {result.results.map((r, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {r.action === 'error'
                ? <AlertCircle className="w-3 h-3 shrink-0 text-red-500" />
                : <CheckCircle2 className="w-3 h-3 shrink-0" />}
              {r.name} — {r.action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  if (status === 'error') return (
    <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
      {result.error}
    </p>
  );
  return null;
}