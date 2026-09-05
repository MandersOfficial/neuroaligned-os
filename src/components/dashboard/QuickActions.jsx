import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActions({ profile }) {
  const prefersFocusRooms =
    profile?.biggest_challenge === 'Staying focused & avoiding distractions' ||
    profile?.work_style?.includes('sprint');

  return (
    <div className="grid sm:grid-cols-2 gap-3">
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

      <Link
        to={prefersFocusRooms ? '/focus-rooms' : '/body-doubling'}
        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors group"
      >
        <span className="text-xl">{prefersFocusRooms ? '🚀' : '👥'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{prefersFocusRooms ? 'Focus Room' : 'Body Doubling'}</p>
          <p className="text-xs text-muted-foreground">
            {prefersFocusRooms ? 'Work alongside others for accountability' : '25-min focus sprint with a peer'}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>
    </div>
  );
}