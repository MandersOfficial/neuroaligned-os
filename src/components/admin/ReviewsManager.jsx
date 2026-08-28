import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, Search, Inbox, MessageSquareQuote, CheckCircle2, XCircle } from 'lucide-react';

const WTP_LABEL = {
  free: 'Free ($0)', starter: 'Starter ($10–20)', pro: 'Pro ($30–50)', power: 'Power ($75+)',
};

const FILTERS = [
  { id: 'all', label: 'All reviews' },
  { id: 'consented', label: 'Usable publicly' },
  { id: 'pending', label: 'No consent yet' },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= (rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('listAllFeedback');
      const body = res?.data ?? res;
      const all = (body?.feedback || []).filter(r => r.category === 'review');
      setReviews(all);
    } catch { /* ignore */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = reviews.filter(r => {
    if (filter === 'consented' && !r.review_consent) return false;
    if (filter === 'pending' && r.review_consent) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = [r.message, r.name, r.email, r.subject].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';
  const consentedCount = reviews.filter(r => r.review_consent).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">Reviews & Testimonials</h2>
          <p className="text-sm text-muted-foreground">Curate the reviews users submit from the Support page.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-foreground leading-none">{reviews.length}</p>
            <p className="text-muted-foreground mt-1">Total</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-amber-500 leading-none">★ {avg}</p>
            <p className="text-muted-foreground mt-1">Avg rating</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-green-600 leading-none">{consentedCount}</p>
            <p className="text-muted-foreground mt-1">Usable publicly</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search reviews…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">No reviews match this filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(r => {
            const dateStr = r.created_date
              ? new Date(r.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            return (
              <div key={r.id} className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  {r.review_consent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> Usable publicly
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                      <XCircle className="w-3 h-3" /> No public consent
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{r.message}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  {r.intent_usage && <span className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground">Usage: {r.intent_usage}</span>}
                  {r.willingness_to_pay && <span className="px-2 py-1 rounded-lg bg-secondary text-muted-foreground">WTP: {WTP_LABEL[r.willingness_to_pay] || r.willingness_to_pay}</span>}
                </div>

                <div className="border-t border-border/40 pt-3">
                  <p className="text-sm font-semibold text-foreground">{r.name || 'Anonymous'}</p>
                  {r.email && <p className="text-xs text-muted-foreground">{r.email}</p>}
                  <p className="text-[11px] text-muted-foreground mt-0.5">{dateStr}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}