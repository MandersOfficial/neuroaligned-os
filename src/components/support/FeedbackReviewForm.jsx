import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Send, Star } from 'lucide-react';

const USAGE_OPTIONS = ['Daily', 'A few times a week', 'Weekly', 'Rarely', 'No, not really'];
const WTP_OPTIONS = [
  { value: 'free', label: 'Free', sub: '$0' },
  { value: 'starter', label: 'Starter', sub: '$10–20/mo' },
  { value: 'pro', label: 'Pro', sub: '$30–50/mo' },
  { value: 'power', label: 'Power', sub: '$75+/mo' },
];

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function FeedbackReviewForm() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', rating: 0, message: '', intentUsage: '', willingnessToPay: '', consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); if (u) setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' })); })
      .catch(() => {});
  }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.message.trim()) { setError('Please write your review.'); return; }
    if (!form.intentUsage) { setError("Please tell us how often you'd use NeuroAligned."); return; }
    if (!form.willingnessToPay) { setError('Please pick a pricing option — your access stays free either way.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('submitFeedback', {
        name: form.name, email: form.email, category: 'review', subject: 'Review', message: form.message,
        rating: form.rating || null, intent_usage: form.intentUsage, willingness_to_pay: form.willingnessToPay,
        review_consent: form.consent, submitted_from: 'support',
      });
      if (res.data && res.data.error) throw new Error(res.data.error);
      setDone(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-8 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
        <h3 className="font-display font-bold text-lg text-foreground">Thank you!</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your review means a lot. We read every one — they genuinely shape how NeuroAligned grows.
        </p>
        <button
          onClick={() => { setDone(false); setForm(f => ({ ...f, rating: 0, message: '', consent: false })); }}
          className="text-sm text-primary font-semibold hover:underline"
        >Send another review</button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name {user && <span className="text-muted-foreground font-normal">(signed in)</span>}</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" disabled={!!user} className={inputCls + (user ? ' opacity-70' : '')} />
        </div>
        <div>
          <label className={labelCls}>Email {user && <span className="text-muted-foreground font-normal">(signed in)</span>}</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" disabled={!!user} className={inputCls + (user ? ' opacity-70' : '')} />
        </div>
      </div>

      <div>
        <label className={labelCls}>How would you rate your experience?</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => set('rating', n)} className="p-1" title={`${n} star${n > 1 ? 's' : ''}`}>
              <Star className={`w-6 h-6 transition-colors ${form.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Your honest review *</label>
        <textarea rows={5} value={form.message} onChange={e => set('message', e.target.value)} placeholder="What's working, what's not, what would make NeuroAligned better for you..." className={inputCls + ' resize-none'} />
      </div>

      <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Help us shape NeuroAligned</p>
        <p className="text-xs text-muted-foreground -mt-1 leading-relaxed">
          Two quick questions. Your access stays <span className="font-semibold text-foreground">free no matter what you choose</span>.
        </p>
        <div>
          <label className={labelCls}>How often would you use NeuroAligned?</label>
          <div className="flex flex-wrap gap-2">
            {USAGE_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => set('intentUsage', opt)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${form.intentUsage === opt ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>{opt}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>If pricing weren't a factor, what would you pay?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WTP_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => set('willingnessToPay', opt.value)} className={`flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl border text-center transition-colors ${form.willingnessToPay === opt.value ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-[11px] opacity-80">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 pt-4 mt-4">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-border accent-primary" />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Yes — I'm happy for NeuroAligned to feature my review publicly (with credit to my name). You can submit without checking this; we'll still read it.
          </span>
        </label>
      </div>

      {error && <div className="pt-3"><p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p></div>}

      <div className="pt-3">
        <button onClick={submit} disabled={!form.message.trim() || submitting} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send review</>}
        </button>
      </div>
    </div>
  );
}