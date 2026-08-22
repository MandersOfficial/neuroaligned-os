import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Send, Star } from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General feedback' },
  { value: 'help', label: 'Help / how-to question' },
  { value: 'review', label: 'Review' },
  { value: 'support', label: 'Support request' },
  { value: 'bug', label: 'Report a bug' },
];

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function FeedbackForm({
  defaultCategory = 'general',
  submittedFrom = 'contact',
  showRating = false,
  showCategory = true,
  submitLabel = 'Send',
}) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', category: defaultCategory, subject: '', message: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        if (u) setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' }));
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('submitFeedback', {
        name: form.name,
        email: form.email,
        category: form.category,
        subject: form.subject,
        message: form.message,
        rating: showRating && form.rating ? form.rating : null,
        submitted_from: submittedFrom,
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
          Your message has been sent to our team. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => { setDone(false); setForm(f => ({ ...f, subject: '', message: '', rating: 0 })); }}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name {user && <span className="text-muted-foreground font-normal">(signed in)</span>}</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your name"
            disabled={!!user}
            className={inputCls + (user ? ' opacity-70' : '')}
          />
        </div>
        <div>
          <label className={labelCls}>Email {user && <span className="text-muted-foreground font-normal">(signed in)</span>}</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            disabled={!!user}
            className={inputCls + (user ? ' opacity-70' : '')}
          />
        </div>
      </div>

      {showCategory && (
        <div>
          <label className={labelCls}>What's this about?</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>Subject <span className="text-muted-foreground font-normal">(optional)</span></label>
        <input
          value={form.subject}
          onChange={e => set('subject', e.target.value)}
          placeholder="A short headline for your message"
          className={inputCls}
        />
      </div>

      {showRating && (
        <div>
          <label className={labelCls}>How would you rate your experience?</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => set('rating', n)}
                className="p-1"
                title={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star className={`w-6 h-6 transition-colors ${form.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Message *</label>
        <textarea
          rows={5}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us what's on your mind..."
          className={inputCls + ' resize-none'}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={!form.message.trim() || submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> {submitLabel}</>}
      </button>
    </div>
  );
}