/**
 * Shared helper for native push notifications.
 *
 * Native delivery is handled by the Base44 native shell, which registers the
 * device token itself — so a send only needs the member's Base44 user id.
 * Every send is checked against the member's saved preferences on their
 * UserProfile, so nothing goes out that they did not opt into.
 */

export const PUSH_PREFS = {
  taskReminders: 'push_task_reminders',
  checkinNudge: 'push_checkin_nudge',
  billingUpdates: 'push_billing_updates',
};

/** Master switch must be on, and the specific category must not be off. */
export function pushAllowed(profile, preferenceKey) {
  if (!profile) return false;
  if (profile.push_notifications !== true) return false;
  if (preferenceKey && profile[preferenceKey] === false) return false;
  return true;
}

/**
 * Sends one push to a member, respecting their preferences.
 * @returns 'sent' | 'skipped' | 'error'
 */
export async function sendUserPush(base44, { userId, profile, preferenceKey, title, content, actionLabel, actionUrl }) {
  if (!userId || !title || !content) return 'skipped';
  if (!pushAllowed(profile, preferenceKey)) return 'skipped';

  const payload = {
    user_id: userId,
    title,
    content,
  };
  if (actionLabel) payload.action_label = actionLabel;
  if (actionUrl) payload.action_url = actionUrl;

  try {
    await base44.asServiceRole.integrations.Core.SendPushNotification(payload);
    return 'sent';
  } catch (error) {
    // Logged rather than thrown: one unreachable device must never stop the
    // rest of the run, and this is where to look when a send fails.
    console.error('Push notification failed', {
      userId,
      preferenceKey,
      error: error?.message,
    });
    return 'error';
  }
}