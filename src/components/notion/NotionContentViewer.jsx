import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import DatabaseSelect from './DatabaseSelect';
import { Loader2, Search, ExternalLink, Table2 } from 'lucide-react';

export default function NotionContentViewer({ databases }) {
  const [dbId, setDbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleQuery = async () => {
    if (!dbId) return;
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('notionQueryDatabase', { notion_database_id: dbId });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setData(res.data);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Table2 className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Browse Notion Content</p>
          <p className="text-xs text-muted-foreground">View database rows in-app</p>
        </div>
      </div>
      <DatabaseSelect databases={databases} value={dbId} onChange={(v) => { setDbId(v); setData(null); setError(null); }} loading={false} />
      <button
        onClick={handleQuery}
        disabled={!dbId || loading}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</> : <><Search className="w-3.5 h-3.5" /> Load Content</>}
      </button>
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">{error}</p>
      )}
      {data && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{data.rows.length} page{data.rows.length !== 1 ? 's' : ''} in “{data.database_name}”</p>
          {data.rows.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">This database is empty.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    {data.columns.map(col => (
                      <th key={col.key} className="text-left font-semibold text-muted-foreground px-2 py-1.5 whitespace-nowrap">
                        {col.name}
                      </th>
                    ))}
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map(row => (
                    <tr key={row.id} className="border-b border-border/20 hover:bg-secondary/30">
                      {data.columns.map(col => (
                        <td key={col.key} className="px-2 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                          {row.values[col.key] || <span className="text-muted-foreground/30">—</span>}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        {row.url && (
                          <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}