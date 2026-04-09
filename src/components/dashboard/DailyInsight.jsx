import { Sparkles } from 'lucide-react';

const INSIGHTS_BY_ENERGY = {
  1: [
    "Your brain needs rest, not more tasks. What's the one micro-task that would make tomorrow easier?",
    "Depleted days are data, not failure. Rest is productive for a neurodivergent nervous system.",
  ],
  2: [
    "Low energy is perfect for gentle admin, organizing, or short replies. Save the deep work for later.",
    "You're in recovery mode — and that's a valid mode. Pick one small win and protect your energy.",
  ],
  3: [
    "Moderate energy = sustainable work. This is your baseline — protect it with regular breaks.",
    "You're in a good working zone. Consider a 25-minute focus sprint before your energy shifts.",
  ],
  4: [
    "Good energy day! This is the time to tackle that creative challenge you've been deferring.",
    "Your brain is primed for complex work. Block distractions and let yourself go deep.",
  ],
  5: [
    "Peak state. Drop everything else — do the hardest, most meaningful work on your list right now.",
    "This is your hyperfocus window. Go all-in, but set a timer to surface for air.",
  ],
};

export default function DailyInsight({ energy }) {
  const insights = INSIGHTS_BY_ENERGY[energy] || INSIGHTS_BY_ENERGY[3];
  const insight = insights[new Date().getDate() % insights.length];

  return (
    <div className="bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">NeuroAligned Insight</p>
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}