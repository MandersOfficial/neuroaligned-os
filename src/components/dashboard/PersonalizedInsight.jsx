import { Brain } from 'lucide-react';

export default function PersonalizedInsight({ profile, energy }) {
  const workStyle = profile?.work_style;
  const challenge = profile?.biggest_challenge;

  const insights = {
    hyperfocus: `You're in hyperfocus mode${workStyle === 'Deep focus blocks' ? ' — perfect for your deep focus style' : ''}. Tackle your hardest task now.`,
    flow: `Steady flow energy${challenge === 'Task initiation & getting started' ? ' — a great time to start that task you\'ve been avoiding' : ' — great for creative or medium-effort work'}.`,
    sluggish: `Low energy day${challenge === 'Managing energy & avoiding burnout' ? ' — honor your limits and do only what matters most' : ' — keep it gentle. Admin and easy tasks only'}.`,
    burnout_risk: `You're running on empty. Rest is the most productive thing you can do right now. Protect yourself first.`,
  };

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-primary/5 border border-primary/10">
      <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-sm text-foreground leading-relaxed">{insights[energy] || insights.flow}</p>
    </div>
  );
}