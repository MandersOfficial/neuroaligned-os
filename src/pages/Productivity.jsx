import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ProductivityTrends from '../components/dashboard/ProductivityTrends';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function Productivity() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Task.list('-created_date', 200)])
      .then(([u, t]) => {
        setUser(u);
        setTasks(t);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const doneTasks = tasks.filter(t => t.status === 'done');
  const energyDist = doneTasks.reduce((acc, t) => {
    acc[t.energy_required || 'medium'] = (acc[t.energy_required || 'medium'] || 0) + 1;
    return acc;
  }, {});
  const topEnergy = Object.entries(energyDist).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-y-auto pb-mobile-safe md:pb-0">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Productivity Trends</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Understand your patterns. Work smarter with your brain, not against it.</p>
            </div>
          </div>

          {/* Insight banner */}
          {topEnergy && doneTasks.length > 3 && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-primary/5 border border-primary/15">
              <span className="text-xl">🧠</span>
              <div>
                <p className="text-sm font-semibold text-foreground">Your pattern</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You complete the most <strong className="text-foreground">{topEnergy[0]}-energy</strong> tasks
                  ({topEnergy[1]} done). Schedule those during your peak window for best results.
                </p>
              </div>
            </div>
          )}

          <ProductivityTrends tasks={tasks} />
        </div>
      </main>
    </div>
  );
}