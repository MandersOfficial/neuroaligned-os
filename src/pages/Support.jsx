import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { LifeBuoy, MessageSquare, Clock, CheckCircle2, Loader2, Paperclip } from 'lucide-react';

const STATUS_META = {
  new: { label: 'New', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'In progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved: { label: 'Resolved', cls: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', cls: 'bg-secondary text-muted-foreground border-border' },
};

const CATEGORY_LABEL = {
  general: 'General',
  help: 'Help',
  review: 'Review',
  support: 'Support',
  bug: 'Bug report',
};

function TicketRow({ ticket }) {
  const status = STATUS_META[ticket.status] || STATUS_META.new;
  const dateStr = ticket.created_date ? new Date(ticket.created_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{CATEGORY_LABEL[ticket.category] || ticket.category}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
          </div>
          <p className="text-sm font-semibold text-foreground mt-2 truncate">{ticket.subject || 'No subject'}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" /> {dateStr}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{ticket.message}</p>
      {ticket.rating != null && (
        <p className="text-xs text-amber-600">★ {ticket.rating}/5</p>
      )}
      {ticket.attachments?.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Paperclip className="w-3 h-3" /> {ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export default function Support() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (u?.email) {
        try {
          const t = await base44.entities.Feedback.filter({ submitter_email: u.email }, '-created_date', 50);
          setTickets(t);
        } catch { /* ignore */ }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-8">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Support</h1>
              <p className="text-xs text-muted-foreground">Submit a help ticket, leave a review, or report an issue — and track your requests.</p>
            </div>
          </div>

          {/* Submit */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base text-foreground">Submit a ticket</h2>
            <FeedbackForm submittedFrom="support" defaultCategory="help" showRating submitLabel="Submit ticket" />
          </section>

          {/* Your tickets */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" /> Your tickets
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">You haven't submitted any tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(t => <TicketRow key={t.id} ticket={t} />)}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}