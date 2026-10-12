import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Only callable by platform entity automation on UserProfile create
    const event = payload?.event;
    if (!event || event.type !== 'create' || event.entity_name !== 'UserProfile' || !event.entity_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the real profile from DB — never trust request payload for email content
    const profileData = await base44.asServiceRole.entities.UserProfile.get(event.entity_id);
    if (!profileData?.user_email || !profileData.onboarding_completed) {
      return Response.json({ skipped: true, reason: 'No email or onboarding not complete' });
    }

    // Freshness check — only send for a profile created in the last 5 minutes.
    // The entity automation fires within seconds of signup; an external caller
    // replaying an old entity_id is rejected here.
    const createdMs = profileData.created_date ? new Date(profileData.created_date).getTime() : NaN;
    if (!Number.isFinite(createdMs) || Date.now() - createdMs > 5 * 60 * 1000) {
      return Response.json({ skipped: true, reason: 'Profile not freshly created' });
    }

    // Exactly-once delivery: claim the send before dispatching, so a replayed
    // request (or a duplicate automation run) can never deliver a second copy.
    if (profileData.welcome_email_sent) {
      return Response.json({ skipped: true, reason: 'Welcome email already sent' });
    }
    await base44.asServiceRole.entities.UserProfile.update(event.entity_id, { welcome_email_sent: true });

    const name = profileData.display_name || profileData.user_email.split('@')[0];
    const neurotypes = profileData.neurotypes?.join(', ') || 'neurodivergent';
    const challenge = profileData.biggest_challenge || 'your biggest challenge';
    const workStyle = profileData.work_style || 'your own style';

    const subject = `Welcome to NeuroAligned, ${name} 🧠 — your OS is ready`;
    const body = `Hi ${name},

Welcome! Your NeuroAligned OS is now set up and personalized for how YOUR brain works.

Here's what we've already customized for you:
• Neurotype profile: ${neurotypes}
• Focus style: ${workStyle}
• Priority challenge: ${challenge}

Your dashboard is waiting — it's built around your answers, not a generic template.

What to do next:
1. Start your first check-in to tell us how you're feeling today
2. Review your Today's Tasks — we've pre-loaded some based on your goals
3. Try a Focus Mode session matched to your work style

Start your day →
https://neuroaligned.app

You're not broken. You just needed the right tools. Welcome home.

— The NeuroAligned Team

---
Questions? Reply to this email anytime. We read every message.
`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profileData.user_email,
        subject,
        body,
        from_name: 'NeuroAligned',
      });
    } catch (sendErr) {
      // Release the claim so a genuine retry can still deliver the welcome mail
      await base44.asServiceRole.entities.UserProfile
        .update(event.entity_id, { welcome_email_sent: false })
        .catch(() => {});
      throw sendErr;
    }

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});