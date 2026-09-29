import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Check, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const TYPES = [
  {
    key: 'push_task_reminders',
    label: 'Task reminders',
    desc: 'When a task is due or hits the reminder frequency you set on it.',
  },
  {
    key: 'push_checkin_nudge',
    label: 'Daily check-in nudge',
    desc: 'A gentle prompt to run your check-in — sent alongside your daily update.',
  },
  {
    key: 'push_billing_updates',
    label: 'Trial & billing updates',
    desc: 'Trial ending soon, or a problem with a subscription payment.',
  },
];

const DEFAULTS = {
  push_notifications: false,
  push_task_reminders: true,
  push_checkin_nudge: true,
  push_billing_updates: true,
};

export default function PushNotificationSettings() {
  const [profileId, setProfileId] = useState(null);
  const [email, setEmail] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(async (me) => {
        setEmail(me.email);
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        const profile = profiles[0];
        setProfileId(profile?.id || null);
        setPrefs({
          push_notifications: profile?.push_notifications === true,
          push_task_reminders: profile?.push_task_reminders !== false,
          push_checkin_nudge: profile?.push_checkin_nudge !== false,
          push_billing_updates: profile?.push_billing_updates !== false,
        });
      })
      .catch(() => setPrefs({ ...DEFAULTS }))
      .finally(() => setLoading(false));
  }, []);

  const update = async (key, value) => {
    if (!prefs || saving) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    setSaved(false);
    try {
      if (profileId) {
        await base44.entities.UserProfile.update(profileId, next);
      } else if (email) {
        const created = await base44.entities.UserProfile.create({ user_email: email, ...next });
        setProfileId(created.id);
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your notification preferences…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Push notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Send notifications to your phone through the NeuroAligned app. Off by default.
            </p>
          </div>
        </div>
        <Switch
          checked={prefs.push_notifications}
          onCheckedChange={v => update('push_notifications', v)}
          aria-label="Push notifications"
        />
      </div>

      <div className={prefs.push_notifications ? 'space-y-1' : 'space-y-1 opacity-50 pointer-events-none'}>
        {TYPES.map(type => (
          <div
            key={type.key}
            className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.desc}</p>
            </div>
            <Switch
              checked={prefs[type.key]}
              onCheckedChange={v => update(type.key, v)}
              aria-label={type.label}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 h-4">
        {saving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        {saved && !saving && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" /> Saved.
          </p>
        )}
      </div>
    </div>
  );
}