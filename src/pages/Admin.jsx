import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminShell from '../components/admin/AdminShell';
import AnalyticsOverview from '../components/admin/AnalyticsOverview';
import UserManagement from '../components/admin/UserManagement';
import GlobalSettings from '../components/admin/GlobalSettings';
import SupportTicketsManager from '../components/admin/SupportTicketsManager';
import ReviewsManager from '../components/admin/ReviewsManager';
import MassEmailManager from '../components/admin/MassEmailManager';
import FeatureRequestsManager from '../components/admin/FeatureRequestsManager';

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // The console is owner-only — an "admin" role alone never unlocks it.
    base44.auth.me()
      .then(user => {
        if (!user || user.role !== 'admin' || user.email !== 'mandersofficial@gmail.com') {
          setDenied(true);
        }
      })
      .catch(() => setDenied(true))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="text-center space-y-3 max-w-sm">
          <ShieldAlert className="w-9 h-9 text-muted-foreground mx-auto" />
          <h1 className="font-display font-bold text-lg text-foreground">Admin access is restricted</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The admin console is limited to the account owner. Everything else in your workspace is unchanged.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShell activeTab={tab} onTabChange={setTab}>
      {tab === 'analytics' && <AnalyticsOverview />}
      {tab === 'users' && <UserManagement />}
      {tab === 'tickets' && <SupportTicketsManager />}
      {tab === 'reviews' && <ReviewsManager />}
      {tab === 'email' && <MassEmailManager />}
      {tab === 'features' && <FeatureRequestsManager />}
      {tab === 'settings' && <GlobalSettings />}
    </AdminShell>
  );
}