import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import DatabaseSelect from './DatabaseSelect';
import { Loader2, FilePlus, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreatePageForm({ databases }) {
  const [dbId, setDbId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreate = async () => {
    if (!dbId || !title.trim()) return;
    setCreating(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('notionCreatePage', {
        notion_database_id: dbId,
        title: title.trim(),
        content: content.trim() || undefined,
      });
      setResult(res.data);
      if (res.data.success) {
        setTitle('');
        setContent('');
      }
    } catch (e) {
      setResult({ error: e.message });
    }
    setCreating(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <FilePlus className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Create Notion Page</p>
          <p className="text-xs text-muted-foreground">From form submission</p>
        </div>
      </div>
      <DatabaseSelect databases={databases} value={dbId} onChange={setDbId} loading={false} />
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">Page Title *</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter a title…"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">Content <span className="text-muted-foreground font-normal">(optional)</span></label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add page content…"
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>
      {result?.error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {result.error}
        </p>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Page created.
          {result.url && (
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-green-700 hover:underline font-medium ml-1">
              Open in Notion <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
      <button
        onClick={handleCreate}
        disabled={!dbId || !title.trim() || creating}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : <><FilePlus className="w-3.5 h-3.5" /> Create Page</>}
      </button>
    </div>
  );
}