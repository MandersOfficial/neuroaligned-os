import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Bell, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';

const REASONS = [
  {
    emoji: '🧠',
    title: "So you don't have to hold it all",
    body: 'A nudge is easier to act on than a list you have to remember to check.',
  },
  {
    emoji: '⏰',
    title: 'On your schedule, not ours',
    body: 'You choose the hours below. Nothing is ever sent outside them.',
  },
  {
    emoji: '🛑',
    title: 'Off unless you say so',
    body: 'Nothing reaches your phone until you turn it on — and you can switch any type off later.',
  },
];

export default function StepNotifications({ data, onChange, onNext, onBack }) {
  const enabled = data.push_notifications === true;

  // Remember the member's timezone so the chosen hours mean *their* local time.
  useEffect(() => {
    if (!data.notification_timezone) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) onChange('notification_timezone', timezone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timezone = data.notification_timezone || 'your local time';

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10"
        >
          <Bell className="w-7 h-7 text-primary" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
          Want a nudge when it actually helps?
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Reminders only work when they arrive at the right moment. Tell us when that is for you.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5">
        <div className="space-y-4">
          {REASONS.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">{reason.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{reason.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{reason.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border/60 pt-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Send nudges to my phone</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Gentle check-in prompts and task reminders. Nothing else, ever.
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={v => onChange('push_notifications', v)}
            aria-label="Send nudges to my phone"
          />
        </div>

        <div className={enabled ? 'space-y-4' : 'space-y-4 opacity-50 pointer-events-none'}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Daily check-in nudge</p>
                <p className="text-xs text-muted-foreground mt-0.5">A two-minute check-in prompt.</p>
              </div>
            </div>
            <input
              type="time"
              value={data.push_checkin_time || '09:00'}
              onChange={e => onChange('push_checkin_time', e.target.value)}
              aria-label="Daily check-in nudge time"
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Task reminders</p>
                <p className="text-xs text-muted-foreground mt-0.5">A digest of what you asked to be reminded about.</p>
              </div>
            </div>
            <input
              type="time"
              value={data.push_reminder_time || '08:00'}
              onChange={e => onChange('push_reminder_time', e.target.value)}
              aria-label="Task reminder time"
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Times are in {timezone}.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-3.5 text-sm font-semibold transition-colors"
        >
          {enabled ? 'Save my times' : 'Continue without'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        You can change all of this later under Settings → Push Notifications.
      </p>
    </div>
  );
}