import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, Lightbulb, CheckCircle2 } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const TYPES = [
  { value: 'feature', label: 'New feature' },
  { value: 'integration', label: 'Integration' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'other', label: 'Other' },
];

const STATUS_CLS = {
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
  planned: 'bg-violet-50 text-violet-700 border-violet-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  shipped: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-secondary text-muted-foreground border-border',
};
const TYPE_LABEL = { feature: 'Feature', integration: 'Integration', improvement: 'Improvement', other: 'Other' };

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function FeatureRequestSection() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', type: 'feature', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.FeatureRequest.list('-created_date', 100);
      setItems(all);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    load();
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    if (!user) { setError('Please sign in to submit a feature request.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await base44.entities.FeatureRequest.create({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        submitter_email: user.email,
        submitter_name: user.full_name || '',
        status: 'submitted',
      });
      setForm({ title: '', type: 'feature', description: '' });
      setDone(true);
      await load();
    } catch (e) {
      setError(e.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-display font-semibold text-base text-foreground">Feature Requests</h2>
      </div>

      {done ? (
        <div className="bg-card border border-border/60 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-9 h-9 text-green-500 mx-auto" />
          <p className="text-sm font-semibold text-foreground">Thanks — your request was submitted for review!</p>
          <button onClick={() => setDone(false)} className="text-sm text-primary font-semibold hover:underline">Submit another</button>
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
          <div>
            <label className={labelCls}>What would you like?</label>
            <MobileSelect
              value={form.type}
              onChange={v => set('type', v)}
              options={TYPES}
              label="What would you like?"
              className={inputCls + ' min-h-[44px]'}
            />
          </div>
          <div>
            <label className={labelCls}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Add a QuickBooks integration" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Describe it *</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What problem would this solve, or how should it work?" className={inputCls + ' resize-none'} />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
          <button
            onClick={submit}
            disabled={!form.title.trim() || !form.description.trim() || submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit for review
          </button>
        </div>
      )}

      {/* Community board */}
      <div className="space-y-2.5">
        <p className="text-xs text-muted-foreground">Recent requests from the community</p>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/60 rounded-2xl">
            <p className="text-sm text-muted-foreground">No requests yet — be the first to suggest something.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(r => (
              <div key={r.id} className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{TYPE_LABEL[r.type] || r.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLS[r.status] || STATUS_CLS.submitted}`}>{(r.status || 'submitted').replace('_', ' ')}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.description}</p>
                {r.admin_response && (
                  <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                    <p className="text-[11px] font-semibold text-primary mb-0.5">Update from the team</p>
                    <p className="text-xs text-foreground leading-relaxed">{r.admin_response}</p>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">{r.submitter_name || 'Anonymous'}{r.created_date ? ' · ' + new Date(r.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}