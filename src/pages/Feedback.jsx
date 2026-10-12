import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import FeedbackReviewForm from '../components/support/FeedbackReviewForm';
import { Star, ArrowLeft } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Mobile back */}
          <button onClick={() => navigate(-1)} className="flex md:hidden items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Feedback</h1>
              <p className="text-xs text-muted-foreground">Tell us how NeuroAligned is working for your brain.</p>
            </div>
          </div>

          <FeedbackReviewForm />

        </div>
      </main>
    </div>
  );
}