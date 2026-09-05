import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActions({ profile }) {
  return (
    <Link
      to="/check-in"
      className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors group"
    >
      <span className="text-xl">🧠</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Brain Check-In</p>
        <p className="text-xs text-muted-foreground">
          {profile?.checkin_preference === 'daily' ? 'Your daily check-in is ready' : 'Rate your state & get a plan'}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
}