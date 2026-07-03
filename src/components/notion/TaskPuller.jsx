import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import DatabaseSelect from './DatabaseSelect';
import { StatusBadge, SyncResultBox } from './SyncResult';
import { Loader2, ArrowDown } from 'lucide-react';

export default function TaskPuller({ databases }) {
  const [dbId, setDbId] = useState('');
  const [pulling, setPulling] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const handlePull = async () => {
    if (!dbId) return;
    setPulling(true);
    setStatus(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('notionPullTasks', { notion_database_id: dbId });
      setStatus(res.data.success ? 'success' : 'error');
      setResult(res.data);
    } catch (e) {
      setStatus('error');
      setResult({ error: e.message });
    }
    setPulling(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <ArrowDown className="w-4 h-4 text-violet-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Pull Tasks from Notion</p>
          <p className="text-xs text-muted-foreground">Import Notion pages as tasks</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Imports pages from a Notion database into your task list. New pages become new tasks; existing ones are updated by status, due date, and description.
      </p>
      <DatabaseSelect databases={databases} value={dbId} onChange={(v) => { setDbId(v); setStatus(null); }} loading={false} />
      <div className="flex items-center gap-3">
        <button
          onClick={handlePull}
          disabled={!dbId || pulling}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {pulling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Pulling…</> : <><ArrowDown className="w-3.5 h-3.5" /> Pull Tasks</>}
        </button>
        <StatusBadge status={status} />
      </div>
      <SyncResultBox result={result} status={status} />
    </div>
  );
}