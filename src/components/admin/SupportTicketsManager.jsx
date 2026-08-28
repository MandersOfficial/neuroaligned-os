import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronUp, Save, ExternalLink, Search, Inbox } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const STATUSES = ['new', 'in_progress', 'resolved', 'closed'];
const STATUS_CLS = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-secondary text-muted-foreground border-border',
};
const CATEGORY_LABEL = {
  general: 'General', help: 'Help', review: 'Review', support: 'Support', bug: 'Bug report',
};
const WTP_LABEL = {
  free: 'Free ($0)', starter: 'Starter ($10–20)', pro: 'Pro ($30–50)', power: 'Power ($75+)',
};
const FILTERS = ['all', ...STATUSES];

export default function SupportTicketsManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('listAllFeedback');
      const body = res?.data ?? res;
      setTickets(body?.feedback || []);
    } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = [t.subject, t.message, t.name, t.email, t.submitter_email].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const toggle = (t) => {
    if (expanded === t.id) { setExpanded(null); return; }
    setExpanded(t.id);
    setDrafts(d => ({ ...d, [t.id]: { status: t.status || 'new', admin_notes: t.admin_notes || '', admin_response: t.admin_response || '' } }));
  };
  const setDraft = (id, k, v) => setDrafts(d => ({ ...d, [id]: { ...d[id], [k]: v } }));

  const save = async (id) => {
    setSaving(id);
    try {
      await base44.functions.invoke('updateSupportTicket', { id, ...drafts[id] });
      setExpanded(null);
      await load();
    } catch { /* ignore */ }
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">Support Tickets</h2>
        <p className="text-sm text-muted-foreground">Every feedback, help, support, and bug submission — manage status and add internal notes.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CLS[f].split(' ')[0].replace('bg-', '').replace('-50', '')}
              {f !== 'all' && (
                <span className="ml-1.5 opacity-70">{tickets.filter(t => t.status === f).length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search subject, email…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">No tickets match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => {
            const open = expanded === t.id;
            const draft = drafts[t.id];
            const dateStr = t.created_date ? new Date(t.created_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
            return (
              <div key={t.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <button onClick={() => toggle(t)} className="w-full text-left p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{CATEGORY_LABEL[t.category] || t.category}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLS[t.status] || STATUS_CLS.new}`}>{t.status || 'new'}</span>
                      {t.submitted_from && <span className="text-[11px] text-muted-foreground">via {t.submitted_from}</span>}
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2 truncate">{t.subject || 'No subject'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {t.name || '(anonymous)'}{t.email ? ` · ${t.email}` : ''} · {dateStr}
                    </p>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {open && draft && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Message</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{t.message}</p>
                    </div>

                    {(t.what_you_tried || t.what_went_wrong || t.device_info) && (
                      <div className="space-y-1.5 text-sm">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Issue details</p>
                        {t.what_you_tried && <p className="text-muted-foreground"><span className="text-foreground font-medium">Tried:</span> {t.what_you_tried}</p>}
                        {t.what_went_wrong && <p className="text-muted-foreground"><span className="text-foreground font-medium">Went wrong:</span> {t.what_went_wrong}</p>}
                        {t.device_info && <p className="text-muted-foreground"><span className="text-foreground font-medium">Device:</span> {t.device_info}</p>}
                      </div>
                    )}

                    {(t.intent_usage || t.willingness_to_pay || t.rating != null || t.review_consent) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {t.intent_usage && <span className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground">Usage: {t.intent_usage}</span>}
                        {t.willingness_to_pay && <span className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground">WTP: {WTP_LABEL[t.willingness_to_pay] || t.willingness_to_pay}</span>}
                        {t.rating != null && <span className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground">★ {t.rating}/5</span>}
                        {t.review_consent && <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700">Review consent: granted</span>}
                      </div>
                    )}

                    {t.attachments?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attachments</p>
                        {t.attachments.map((url, i) => {
                          const safe = typeof url === 'string' && /^https?:\/\//i.test(url);
                          return safe ? (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                              <ExternalLink className="w-3 h-3" /> Attachment {i + 1}
                            </a>
                          ) : (
                            <span key={i} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <ExternalLink className="w-3 h-3" /> Attachment {i + 1}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {t.user_reply && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <p className="text-[11px] font-semibold text-amber-700 mb-0.5">User reply</p>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{t.user_reply}</p>
                      </div>
                    )}

                    {/* Admin controls */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">Status</label>
                        <MobileSelect
                          value={draft.status}
                          onChange={v => setDraft(t.id, 'status', v)}
                          options={STATUSES.map(s => ({ value: s, label: s.replace('_', ' ') }))}
                          label="Status"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[40px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Reply to user <span className="text-muted-foreground font-normal">(they'll see this and get an email)</span></label>
                      <textarea
                        rows={3}
                        value={draft.admin_response}
                        onChange={e => setDraft(t.id, 'admin_response', e.target.value)}
                        placeholder="Write a response to the user…"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">Admin notes <span className="text-muted-foreground font-normal">(internal)</span></label>
                      <textarea
                        rows={3}
                        value={draft.admin_notes}
                        onChange={e => setDraft(t.id, 'admin_notes', e.target.value)}
                        placeholder="Internal notes — only you see these."
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <button
                      onClick={() => save(t.id)}
                      disabled={saving === t.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {saving === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save changes
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