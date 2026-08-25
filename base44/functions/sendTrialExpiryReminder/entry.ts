import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check admin or scheduler
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
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

    if (!subs || subs.length === 0) {
      return Response.json({ sent: 0, message: 'No trials expiring in 3 days.' });
    }

    let sent = 0;
    for (const sub of subs) {
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
    }

    return Response.json({ sent, total: subs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});