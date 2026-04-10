import { Link } from 'react-router-dom';
import { Zap, X } from 'lucide-react';
import { useState } from 'react';

export default function TrialBanner({ daysLeft }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || daysLeft === null || daysLeft > 14) return null;

  const urgent = daysLeft <= 3;
  const expired = daysLeft <= 0;

  return (
    <div className={`flex items-center justify-between gap-3 px-5 py-3 text-sm ${
      expired ? 'bg-red-500 text-white' : urgent ? 'bg-amber-500 text-white' : 'bg-primary/10 text-foreground border-b border-primary/10'
    }`}>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 shrink-0" />
        {expired
          ? 'Your free trial has ended — upgrade to continue using NeuroAligned.'
          : urgent
            ? `⚠️ Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left on your trial — upgrade now to avoid interruption.`
            : `You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left on your free trial.`
        }
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/upgrade"
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            expired || urgent ? 'bg-white text-foreground hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {expired ? 'Upgrade Now' : 'Choose a Plan'}
        </Link>
        {!expired && (
          <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}