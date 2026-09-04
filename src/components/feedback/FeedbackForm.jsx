import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Send, Star, Paperclip, X, Upload, Lock } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const CATEGORIES = [
  { value: 'general', label: 'General feedback' },
  { value: 'help', label: 'Help / how-to question' },
  { value: 'review', label: 'Review' },
  { value: 'support', label: 'Support request' },
  { value: 'bug', label: 'Report a bug' },
];

const USAGE_OPTIONS = ['Daily', 'A few times a week', 'Weekly', 'Rarely', 'No, not really'];

const WTP_OPTIONS = [
  { value: 'free', label: 'Free only', sub: '$0' },
  { value: 'starter', label: 'Starter', sub: '$10–20 / mo' },
  { value: 'pro', label: 'Pro', sub: '$30–50 / mo' },
  { value: 'power', label: 'Power', sub: '$75+ / mo' },
];

const ISSUE_CATEGORIES = ['help', 'support', 'bug'];

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

function Section({ title, required, children }) {
  return (
    <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}{required && <span className="text-primary ml-0.5">*</span>}
      </p>
      {children}
    </div>
  );
}

export default function FeedbackForm({
  defaultCategory = 'general',
  submittedFrom = 'contact',
  showRating = false,
  showCategory = true,
  submitLabel = 'Send',
}) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', category: defaultCategory, subject: '', message: '',
    rating: 0, whatYouTried: '', whatWentWrong: '', deviceInfo: '',
    intentUsage: '', willingnessToPay: '', attachments: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        if (u) setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' }));
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showIssue = ISSUE_CATEGORIES.includes(form.category);

  const handleFiles = async (files) => {
    if (!user || !files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) {
          setForm(f => ({ ...f, attachments: [...f.attachments, { url: res.file_url, name: file.name }] }));
        }
      } catch {
        setError('Could not upload ' + file.name);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeAttachment = (i) => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }));

  const submit = async () => {
    if (!form.message.trim()) return;
    if (!form.intentUsage) {
      setError("Please let us know how often you'd use NeuroAligned.");
      return;
    }
    if (!form.willingnessToPay) {
      setError('Please pick a pricing option — your access stays free either way.');
      return;
    }
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
        what_you_tried: form.whatYouTried,
        what_went_wrong: form.whatWentWrong,
        device_info: form.deviceInfo,
        intent_usage: form.intentUsage,
        willingness_to_pay: form.willingnessToPay,
        attachments: form.attachments.map(a => a.url),
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
          onClick={() => {
            setDone(false);
            setForm(f => ({ ...f, subject: '', message: '', rating: 0, whatYouTried: '', whatWentWrong: '', deviceInfo: '', attachments: [] }));
          }}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
      {/* Your details */}
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
          <MobileSelect value={form.category} onChange={v => set('category', v)} options={CATEGORIES} label="What's this about?" className={inputCls} />
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

      {showRating && (
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
      )}

      {/* Issue details (help / support / bug) */}
      {showIssue && (
        <Section title="More about the issue">
          <div>
            <label className={labelCls}>What were you trying to do?</label>
            <textarea
              rows={3}
              value={form.whatYouTried}
              onChange={e => set('whatYouTried', e.target.value)}
              placeholder="e.g. I was trying to sync my Notion tasks to a project"
              className={inputCls + ' resize-none'}
            />
          </div>
          <div>
            <label className={labelCls}>What went wrong (or what did you expect)?</label>
            <textarea
              rows={3}
              value={form.whatWentWrong}
              onChange={e => set('whatWentWrong', e.target.value)}
              placeholder="e.g. The sync button did nothing — I expected tasks to appear"
              className={inputCls + ' resize-none'}
            />
          </div>
          <div>
            <label className={labelCls}>Device / browser <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              value={form.deviceInfo}
              onChange={e => set('deviceInfo', e.target.value)}
              placeholder="e.g. iPhone 13, Safari — or Windows, Chrome"
              className={inputCls}
            />
          </div>
        </Section>
      )}

      {/* Attachments */}
      <Section title="Attach a screenshot or recording">
        {user ? (
          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Attach screenshot or recording</>}
            </button>
            {form.attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {form.attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-secondary/60 rounded-lg px-2.5 py-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{a.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2.5 rounded-xl border border-dashed border-border bg-secondary/30">
            <Lock className="w-3.5 h-3.5 shrink-0" /> Sign in to attach a screenshot or recording.
          </div>
        )}
      </Section>

      {/* Customer discovery */}
      <Section title="Help us shape NeuroAligned" required>
        <p className="text-xs text-muted-foreground -mt-1 leading-relaxed">
          These two quick questions help us build the right product. Your access stays <span className="font-semibold text-foreground">free no matter what you choose</span>.
        </p>
        <div>
          <label className={labelCls}>Do you see yourself using NeuroAligned daily?</label>
          <div className="flex flex-wrap gap-2">
            {USAGE_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => set('intentUsage', opt)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  form.intentUsage === opt
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>If pricing weren't a factor, what would you pay?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WTP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('willingnessToPay', opt.value)}
                className={`flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl border text-center transition-colors ${
                  form.willingnessToPay === opt.value
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-[11px] opacity-80">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {error && (
        <div className="pt-3">
          <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      <div className="pt-3">
        <button
          onClick={submit}
          disabled={!form.message.trim() || submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> {submitLabel}</>}
        </button>
      </div>
    </div>
  );
}