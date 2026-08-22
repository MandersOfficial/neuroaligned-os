import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../components/admin/AdminShell';
import AnalyticsOverview from '../components/admin/AnalyticsOverview';
import UserManagement from '../components/admin/UserManagement';
import ContentModeration from '../components/admin/ContentModeration';
import GlobalSettings from '../components/admin/GlobalSettings';
import FeedbackSyncPanel from '@/components/integrations/FeedbackSyncPanel';
import SupportTicketsManager from '../components/admin/SupportTicketsManager';
import FeatureRequestsManager from '../components/admin/FeatureRequestsManager';

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || user.role !== 'admin') {
        navigate('/dashboard');
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminShell activeTab={tab} onTabChange={setTab}>
      {tab === 'analytics' && <AnalyticsOverview />}
      {tab === 'users' && <UserManagement />}
      {tab === 'moderation' && <ContentModeration />}
      {tab === 'feedback' && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 max-w-2xl">
          <h2 className="font-display font-semibold text-lg text-foreground mb-1">Customer Feedback Sync</h2>
          <p className="text-sm text-muted-foreground mb-4">Pull Intercom conversations into your task queue.</p>
          <FeedbackSyncPanel />
        </div>
      )}
      {tab === 'tickets' && <SupportTicketsManager />}
      {tab === 'features' && <FeatureRequestsManager />}
      {tab === 'settings' && <GlobalSettings />}
    </AdminShell>
  );
}