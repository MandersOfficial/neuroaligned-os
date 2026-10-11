import { Link } from 'react-router-dom';
import { Brain, Zap } from 'lucide-react';
import { planLabel } from '@/lib/subscription';

export default function ProfileSummaryCard({ profile, subscription, onTakeTour }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold text-foreground">Your Setup</p>
      <div className="space-y-2.5">
        {[
          ['Peak Energy', profile?.energy_peak || 'Not set'],
          ['Work Style', profile?.work_style || 'Not set'],
          ['Biggest Challenge', profile?.biggest_challenge?.split(' ').slice(0, 4).join(' ') + '…' || 'Not set'],
          ['Plan', planLabel(subscription)],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="font-medium text-foreground text-right truncate max-w-[160px]">{val}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onTakeTour}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <Brain className="w-3 h-3" /> Take the tour
        </button>
        <Link to="/integrations" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          <Zap className="w-3 h-3" /> Integrations
        </Link>
      </div>
    </div>
  );
}