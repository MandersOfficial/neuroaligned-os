import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronUp, Save, Search, Lightbulb } from 'lucide-react';

const STATUSES = ['submitted', 'reviewing', 'planned', 'in_progress', 'shipped', 'declined'];
const STATUS_CLS = {
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  planned: 'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-secondary text-muted-foreground border-border',
};
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_CLS = {
  low: 'bg-secondary text-muted-foreground',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-rose-50 text-rose-700',
};
const TYPE_LABEL = { feature: 'Feature', integration: 'Integration', improvement: 'Improvement', other: 'Other' };

export default function FeatureRequestsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.FeatureRequest.list('-created_date', 200);
      setItems(all);
    } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = [r.title, r.description, r.submitter_name, r.submitter_email].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const toggle = (r) => {
    if (expanded === r.id) { setExpanded(null); return; }
    setExpanded(r.id);
    setDrafts(d => ({ ...d, [r.id]: {
      status: r.status || 'submitted',
      priority: r.priority || 'medium',
      admin_notes: r.admin_notes || '',
      admin_response: r.admin_response || '',
    } }));
  };
  const setDraft = (id, k, v) => setDrafts(d => ({ ...d, [id]: { ...d[id], [k]: v } }));

  const save = async (id) => {
    setSaving(id);
    try {
      await base44.functions.invoke('updateFeatureRequest', { id, ...drafts[id] });
      setExpanded(null);
      await load();
    } catch { /* ignore */ }
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">Feature Requests</h2>
        <p className="text-sm text-muted-foreground">Review requested integrations and features, set priority, and post public updates.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >All <span className="opacity-70">{items.length}</span></button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >{s.replace('_', ' ')} <span className="opacity-70">{items.filter(r => r.status === s).length}</span></button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title, requester…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">No feature requests here yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(r => {
            const open = expanded === r.id;
            const draft = drafts[r.id];
            const dateStr = r.created_date ? new Date(r.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return (
              <div key={r.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <button onClick={() => toggle(r)} className="w-full text-left p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{TYPE_LABEL[r.type] || r.type}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLS[r.status] || STATUS_CLS.submitted}`}>{(r.status || 'submitted').replace('_', ' ')}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_CLS[r.priority] || PRIORITY_CLS.medium}`}>{r.priority || 'medium'}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2 truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.submitter_name || 'Anonymous'} · {dateStr}</p>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {open && draft && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{r.description}</p>
                    </div>
                    {r.submitter_email && <p className="text-xs text-muted-foreground">Requester: {r.submitter_name ? `${r.submitter_name} · ` : ''}{r.submitter_email}</p>}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">Status</label>
                        <select value={draft.status} onChange={e => setDraft(r.id, 'status', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">Priority</label>
                        <select value={draft.priority} onChange={e => setDraft(r.id, 'priority', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Public response <span className="text-muted-foreground font-normal">(shown to users)</span></label>
                      <textarea rows={2} value={draft.admin_response} onChange={e => setDraft(r.id, 'admin_response', e.target.value)} placeholder="Update users on this request…" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Admin notes <span className="text-muted-foreground font-normal">(internal)</span></label>
                      <textarea rows={3} value={draft.admin_notes} onChange={e => setDraft(r.id, 'admin_notes', e.target.value)} placeholder="Internal notes — only you see these." className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                    </div>
                    <button onClick={() => save(r.id)} disabled={saving === r.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      {saving === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}