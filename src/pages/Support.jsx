import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import HelpTicketForm from '../components/support/HelpTicketForm';
import HelpTicketHistory from '../components/support/HelpTicketHistory';
import FeatureRequestSection from '@/components/feedback/FeatureRequestSection';
import { LifeBuoy, Ticket, Star, Lightbulb, ArrowLeft } from 'lucide-react';

const TABS = [
  { id: 'support', label: 'Support', icon: Ticket, desc: 'Get help — submit a ticket, then track it, edit it, or reply to us below.' },
  { id: 'features', label: 'Feature Requests', icon: Lightbulb, desc: 'Suggest an integration or feature that would make your life easier.' },
];

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('support');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => { base44.auth.me().then(u => setUser(u)).catch(() => {}); }, []);

  const active = TABS.find(t => t.id === tab);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Mobile back */}
          <button onClick={() => navigate(-1)} className="flex md:hidden items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Support</h1>
              <p className="text-xs text-muted-foreground">Pick what you need — we're here to help.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">{active.desc}</p>

          {tab === 'support' && (
            <div className="space-y-8">
              {/* Reminder: reviews have their own page in the sidebar */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  Looking to leave a review? <span className="font-medium text-foreground">Feedback</span> has its own page, so it's easy to find.
                </p>
                <Link
                  to="/feedback"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold text-foreground hover:bg-secondary transition-colors shrink-0"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Go to Feedback
                </Link>
              </div>
              <HelpTicketForm onSubmitted={() => setReloadKey(k => k + 1)} />
              <HelpTicketHistory reloadKey={reloadKey} />
            </div>
          )}
          {tab === 'features' && <FeatureRequestSection />}

        </div>
      </main>
    </div>
  );
}