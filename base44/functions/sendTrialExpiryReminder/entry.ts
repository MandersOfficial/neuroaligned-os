import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { isOwnerAdmin } from "../../shared/adminGate.ts";
import { APP_BASE_URL } from "../../shared/appBaseUrl.ts";
import { sendUserPush, PUSH_PREFS } from "../../shared/pushNotifications.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check admin or scheduler
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + 3);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];

    // Find subscriptions expiring in 3 days
    const subs = await base44.asServiceRole.entities.Subscription.filter({
      trial_end_date: reminderDateStr,
      status: 'trialing',
    });

    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const idByEmail = new Map(users.map(u => [u.email, u.id]));

    let sent = 0;
    let pushed = 0;
    for (const sub of (subs || [])) {
      if (!sub.user_email) continue;

      // Get their profile for personalization
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({
        user_email: sub.user_email,
      });
      const profile = profiles[0];
      const name = profile?.display_name || sub.user_email.split('@')[0];

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.user_email,
        from_name: 'NeuroAligned',
        subject: `${name}, your free trial ends in 3 days ⏳`,
        body: `Hi ${name},

Your 14-day free trial of NeuroAligned ends on ${reminderDateStr}.

Don't lose your personalized setup — your focus modes, tasks, check-in history, and AI recommendations are all saved and waiting for you.

Upgrade to keep going →
https://neuroaligned.app/upgrade

Starter Plan — $30/mo (perfect for solo founders)
Pro Plan — $50/mo (full AI + body doubling + priority support)

If you have questions about which plan is right for your brain, just reply to this email.

— The NeuroAligned Team
`,
      });
      sent++;

      const pushResult = await sendUserPush(base44, {
        userId: idByEmail.get(sub.user_email),
        profile,
        preferenceKey: PUSH_PREFS.billingUpdates,
        title: 'Your free trial ends in 3 days ⏳',
        content: 'Upgrade to keep your focus modes, tasks and check-in history.',
        actionLabel: 'See plans',
        actionUrl: `${APP_BASE_URL}/upgrade`,
      });
      if (pushResult === 'sent') pushed++;
    }

    // Billing problems: a past-due subscription gets a push (no extra email)
    const pastDue = await base44.asServiceRole.entities.Subscription.filter({ status: 'past_due' });

    for (const sub of (pastDue || [])) {
      if (!sub.user_email) continue;
      const pastDueProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        user_email: sub.user_email,
      });
      const pastDueResult = await sendUserPush(base44, {
        userId: idByEmail.get(sub.user_email),
        profile: pastDueProfiles[0],
        preferenceKey: PUSH_PREFS.billingUpdates,
        title: 'Payment problem on your subscription',
        content: 'We could not process your last payment. Update your card to keep your workspace.',
        actionLabel: 'Fix payment',
        actionUrl: `${APP_BASE_URL}/upgrade`,
      });
      if (pastDueResult === 'sent') pushed++;
    }

    return Response.json({ sent, pushed, total: (subs || []).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});