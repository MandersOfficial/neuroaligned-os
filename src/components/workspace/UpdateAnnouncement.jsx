import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Check, Loader2 } from 'lucide-react';

// Key under which the acknowledgment is stored on the user record
// (via auth.updateMe) so the message never shows again once dismissed.
const ACK_KEY = 'update_ack_notion_2026_09';

/**
 * One-time update announcement shown inside the workspace shell.
 * Appears for every signed-in user until they acknowledge it —
 * the dismissal is saved to their account, so it won't reappear
 * on later sign-ins or other devices.
 */
export default function UpdateAnnouncement({ user }) {
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || dismissed || user[ACK_KEY]) return null;

  const acknowledge = async () => {
    setSaving(true);
    // Optimistically hide the message; the flag persists server-side.
    setDismissed(true);
    try {
      await base44.auth.updateMe({ [ACK_KEY]: true });
    } catch {
      // If saving fails, the message may reappear next visit — acceptable fallback.
    }
    setSaving(false);
  };

  return (
    <div className="mx-3 md:mx-6 mt-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">What's new in NeuroAligned</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            You can now push your projects and task list straight into Notion — connect your account
            from the Integrations page and choose the database to sync to.
          </p>
        </div>
        <button
          onClick={acknowledge}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Got it
        </button>
      </div>
    </div>
  );
}