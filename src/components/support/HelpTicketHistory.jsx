import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Clock, Loader2, Paperclip, Trash2, Pencil, ChevronDown, ChevronUp, Send, ExternalLink, CheckCircle2, AlertTriangle, Save, X } from 'lucide-react';

const STATUS_META = {
  new: { label: 'New', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'In progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved: { label: 'Resolved', cls: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', cls: 'bg-secondary text-muted-foreground border-border' },
};
const CATEGORY_LABEL = { help: 'Help', support: 'Support', bug: 'Bug report' };

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground';
const labelCls = 'text-xs font-semibold text-foreground block mb-1.5';

export default function HelpTicketHistory({ reloadKey }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      if (!me?.email) { setLoading(false); return; }
      const all = await base44.entities.Feedback.filter({ submitter_email: me.email }, '-created_date', 50);
      setTickets(all.filter(t => ['help', 'support', 'bug'].includes(t.category)));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const toggle = (t) => {
    if (openId === t.id) { setOpenId(null); setEditing(false); setDraft(null); return; }
    setOpenId(t.id);
    setEditing(false);
    setDraft({ subject: t.subject || '', message: t.message || '', whatYouTried: t.what_you_tried || '', whatWentWrong: t.what_went_wrong || '', deviceInfo: t.device_info || '' });
    setReply(t.user_reply || '');
  };

  const saveEdit = async (id) => {
    setBusy(id);
    try {
      await base44.functions.invoke('updateMyTicket', {
        id, subject: draft.subject, message: draft.message,
        what_you_tried: draft.whatYouTried, what_went_wrong: draft.whatWentWrong, device_info: draft.deviceInfo,
      });
      setEditing(false);
      await load();
    } catch { /* ignore */ }
    setBusy(null);
  };

  const sendReply = async (id) => {
    if (!reply.trim()) return;
    setBusy(id);
    try {
      await base44.functions.invoke('updateMyTicket', { id, user_reply: reply.trim() });
      await load();
    } catch { /* ignore */ }
    setBusy(null);
  };

  const doDelete = async (id) => {
    setBusy(id);
    try {
      await base44.entities.Feedback.delete(id);
      setConfirmDelete(null);
      setOpenId(null);
      await load();
    } catch { /* ignore */ }
    setBusy(null);
  };

  return (
    <section className="space-y-3">
      <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" /> Your tickets
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border/60 rounded-2xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No tickets yet — submit one above and it'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => {
            const status = STATUS_META[t.status] || STATUS_META.new;
            const dateStr = t.created_date ? new Date(t.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const open = openId === t.id;
            return (
              <div key={t.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                <button onClick={() => toggle(t)} className="w-full text-left p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{CATEGORY_LABEL[t.category] || t.category}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                      {t.user_reply && <span className="text-[11px] text-amber-600 font-medium">• you replied</span>}
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2 truncate">{t.subject || 'No subject'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" /> {dateStr}</span>
                  {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
                    {/* Ticket body / edit */}
                    {editing ? (
                      <div className="space-y-3">
                        <div>
                          <label className={labelCls}>Subject</label>
                          <input value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Message</label>
                          <textarea rows={4} value={draft.message} onChange={e => setDraft(d => ({ ...d, message: e.target.value }))} className={inputCls + ' resize-none'} />
                        </div>
                        <div>
                          <label className={labelCls}>What you were trying to do</label>
                          <textarea rows={2} value={draft.whatYouTried} onChange={e => setDraft(d => ({ ...d, whatYouTried: e.target.value }))} className={inputCls + ' resize-none'} />
                        </div>
                        <div>
                          <label className={labelCls}>What went wrong</label>
                          <textarea rows={2} value={draft.whatWentWrong} onChange={e => setDraft(d => ({ ...d, whatWentWrong: e.target.value }))} className={inputCls + ' resize-none'} />
                        </div>
                        <div>
                          <label className={labelCls}>Device / browser</label>
                          <input value={draft.deviceInfo} onChange={e => setDraft(d => ({ ...d, deviceInfo: e.target.value }))} className={inputCls} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(t.id)} disabled={busy === t.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                            {busy === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                          </button>
                          <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Your message</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{t.message}</p>
                        </div>
                        {(t.what_you_tried || t.what_went_wrong || t.device_info) && (
                          <div className="space-y-1 text-sm">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Issue details</p>
                            {t.what_you_tried && <p className="text-muted-foreground"><span className="text-foreground font-medium">Tried:</span> {t.what_you_tried}</p>}
                            {t.what_went_wrong && <p className="text-muted-foreground"><span className="text-foreground font-medium">Went wrong:</span> {t.what_went_wrong}</p>}
                            {t.device_info && <p className="text-muted-foreground"><span className="text-foreground font-medium">Device:</span> {t.device_info}</p>}
                          </div>
                        )}
                        {t.attachments?.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attachments</p>
                            {t.attachments.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                                <ExternalLink className="w-3 h-3" /> Attachment {i + 1}
                              </a>
                            ))}
                          </div>
                        )}

                        {t.admin_response && (
                          <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                            <p className="text-[11px] font-semibold text-primary mb-0.5">Reply from the team</p>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{t.admin_response}</p>
                          </div>
                        )}
                        {t.user_reply && !editing && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Your last reply</p>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{t.user_reply}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => setConfirmDelete(t.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}

                    {/* Reply box (always available) */}
                    {!editing && (
                      <div className="space-y-2 border-t border-border/40 pt-3">
                        <label className={labelCls}>Reply to the team</label>
                        <textarea rows={3} value={reply} onChange={e => setReply(e.target.value)} placeholder="Add a follow-up message for our team…" className={inputCls + ' resize-none'} />
                        <button onClick={() => sendReply(t.id)} disabled={!reply.trim() || busy === t.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                          {busy === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send reply
                        </button>
                      </div>
                    )}

                    {/* Delete confirm */}
                    {confirmDelete === t.id && (
                      <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        <p className="text-xs text-foreground flex-1">Delete this ticket permanently?</p>
                        <button onClick={() => doDelete(t.id)} disabled={busy === t.id} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold">
                          {busy === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}