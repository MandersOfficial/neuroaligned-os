import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Check } from 'lucide-react';

const OPTIONS = [
  { value: 'daily', emoji: '🌅', label: 'Daily update', desc: 'A gentle check-in email each morning.' },
  { value: 'weekly', emoji: '📊', label: 'Weekly recap', desc: 'One summary email a week — wins, projects, and deadlines.' },
  { value: 'none', emoji: '✌️', label: 'No update emails', desc: 'Nothing scheduled — come back whenever works for you.' },
];

export default function EmailUpdateFrequency() {
  const [frequency, setFrequency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(me => base44.entities.UserProfile.filter({ user_email: me.email }))
      .then(profiles => {
        setFrequency(profiles[0]?.email_update_frequency || 'weekly');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = async (value) => {
    if (saving || value === frequency) return;
    setSaving(true);
    setSaved(false);
    try {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { email_update_frequency: value });
      }
      setFrequency(value);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your email preferences…
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {OPTIONS.map(opt => {
        const active = frequency === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={saving}
            className={`relative w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all disabled:opacity-60 ${
              active
                ? 'border-primary/50 bg-primary/5 shadow-sm'
                : 'border-border/60 hover:border-primary/30 hover:bg-secondary/50'
            }`}
          >
            <span className="text-xl shrink-0">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </div>
            {active && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
      <div className="flex items-center gap-1.5 h-4">
        {saving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        {saved && !saving && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Saved — you'll only get the emails you picked.</p>}
      </div>
    </div>
  );
}