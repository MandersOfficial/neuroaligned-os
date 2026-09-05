import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, Send, Paperclip, X, Upload, Lock, LifeBuoy } from 'lucide-react';
import MobileSelect from '@/components/ui/MobileSelect';

const CATEGORIES = [
  { value: 'help', label: 'Help / how-to question' },
  { value: 'support', label: 'Support request' },
  { value: 'bug', label: 'Report a bug' },
];

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function HelpTicketForm({ onSubmitted }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', category: 'help', subject: '', message: '',
    whatYouTried: '', whatWentWrong: '', deviceInfo: '', attachments: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); if (u) setForm(f => ({ ...f, name: u.full_name || '', email: u.email || '' })); })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = async (files) => {
    if (!user || !files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) {
          setForm(f => ({ ...f, attachments: [...f.attachments, { url: res.file_url, name: file.name }] }));
        }
      } catch { setError('Could not upload ' + file.name); }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  const removeAttachment = (i) => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }));

  const submit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('submitFeedback', {
        name: form.name, email: form.email, category: form.category, subject: form.subject, message: form.message,
        what_you_tried: form.whatYouTried, what_went_wrong: form.whatWentWrong, device_info: form.deviceInfo,
        attachments: form.attachments.map(a => a.url), submitted_from: 'support',
      });
      if (res.data && res.data.error) throw new Error(res.data.error);
      setDone(true);
      onSubmitted?.();
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
        <h3 className="font-display font-bold text-lg text-foreground">Ticket submitted</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          We've received your request and will reply below. You'll get an email when there's an update.
        </p>
        <button
          onClick={() => { setDone(false); setForm(f => ({ ...f, subject: '', message: '', whatYouTried: '', whatWentWrong: '', deviceInfo: '', attachments: [] })); }}
          className="text-sm text-primary font-semibold hover:underline"
        >Submit another ticket</button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <LifeBuoy className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-base text-foreground">Submit a help ticket</h2>
      </div>

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
        <label className={labelCls}>What kind of help?</label>
        <MobileSelect
          value={form.category}
          onChange={v => set('category', v)}
          options={CATEGORIES}
          label="What kind of help?"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Subject <span className="text-muted-foreground font-normal">(optional)</span></label>
        <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="A short headline for your request" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>What do you need help with? *</label>
        <textarea rows={4} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Describe your question or issue..." className={inputCls + ' resize-none'} />
      </div>

      <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">More about the issue (optional)</p>
        <div>
          <label className={labelCls}>What were you trying to do?</label>
          <textarea rows={2} value={form.whatYouTried} onChange={e => set('whatYouTried', e.target.value)} placeholder="e.g. I was trying to sync my tasks" className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className={labelCls}>What went wrong (or what did you expect)?</label>
          <textarea rows={2} value={form.whatWentWrong} onChange={e => set('whatWentWrong', e.target.value)} placeholder="e.g. The sync button did nothing" className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className={labelCls}>Device / browser <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input value={form.deviceInfo} onChange={e => set('deviceInfo', e.target.value)} placeholder="e.g. iPhone 13, Safari" className={inputCls} />
        </div>
      </div>

      <div className="border-t border-border/40 pt-4 mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attach a screenshot or recording</p>
        {user ? (
          <>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Attach screenshot or recording</>}
            </button>
            {form.attachments.length > 0 && (
              <div className="space-y-1.5">
                {form.attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-secondary/60 rounded-lg px-2.5 py-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{a.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2.5 rounded-xl border border-dashed border-border bg-secondary/30">
            <Lock className="w-3.5 h-3.5 shrink-0" /> Sign in to attach a screenshot or recording.
          </div>
        )}
      </div>

      {error && <div className="pt-3"><p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p></div>}

      <div className="pt-3">
        <button onClick={submit} disabled={!form.message.trim() || submitting} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Submit ticket</>}
        </button>
      </div>
    </div>
  );
}