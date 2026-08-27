import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, Mail, FlaskConical, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MobileSelect from '@/components/ui/MobileSelect';

const AUDIENCES = [
  { value: 'all', label: 'All registered users' },
  { value: 'admins', label: 'Admins only' },
  { value: 'trial', label: 'Trial plan subscribers' },
  { value: 'starter', label: 'Starter plan subscribers' },
  { value: 'pro', label: 'Pro plan subscribers' },
  { value: 'cancelled', label: 'Cancelled subscriptions' },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function MassEmailManager() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(null); // null | 'send' | 'test'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const canSend = subject.trim() && html.trim() && html.trim() !== '<p><br></p>';

  const send = async (test) => {
    setSending(test ? 'test' : 'send');
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('sendMassEmail', {
        subject: subject.trim(),
        body: html,
        audience,
        test,
      });
      setResult(res.data || res);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Send failed');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">Mass Email</h2>
        <p className="text-sm text-muted-foreground">Compose and broadcast an email to your users without leaving the app.</p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <div>
          <label className={labelCls}>Audience</label>
          <MobileSelect
            value={audience}
            onChange={setAudience}
            options={AUDIENCES}
            label="Audience"
            className={inputCls + ' min-h-[44px]'}
          />
        </div>

        <div>
          <label className={labelCls}>Subject line *</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. A new focus mode just landed"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Email body *</label>
          <div className="rounded-xl border border-border overflow-hidden bg-background">
            <ReactQuill
              theme="snow"
              value={html}
              onChange={setHtml}
              modules={QUILL_MODULES}
              placeholder="Write your message here…"
              style={{ minHeight: 200 }}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-700">
                {result.test ? 'Test email sent' : 'Broadcast complete'}
              </p>
            </div>
            <p className="text-xs text-green-700/80">
              Sent {result.sent} of {result.total} recipient{result.total === 1 ? '' : 's'}
              {result.failed > 0 && ` · ${result.failed} failed`}.
            </p>
            {result.errors?.length > 0 && (
              <ul className="text-xs text-destructive mt-1 space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e.email}: {e.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => send(false)}
            disabled={!canSend || !!sending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {sending === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to {AUDIENCES.find(a => a.value === audience)?.label.toLowerCase()}
          </button>
          <button
            onClick={() => send(true)}
            disabled={!canSend || !!sending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            {sending === 'test' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Send test to me
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border/40 rounded-xl px-3 py-2.5">
        <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Mass emails are sent individually to each registered user. Use "Send test to me" to preview before broadcasting.</span>
      </div>
    </div>
  );
}