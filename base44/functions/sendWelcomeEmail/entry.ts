import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Called from entity automation on UserProfile create
    const profileData = payload?.data;
    if (!profileData?.user_email || !profileData?.onboarding_completed) {
      return Response.json({ skipped: true, reason: 'No email or onboarding not complete' });
    }

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
https://neuroa.app/dashboard

You're not broken. You just needed the right tools. Welcome home.

— The NeuroAligned Team

---
Questions? Reply to this email anytime. We read every message.
`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: profileData.user_email,
      subject,
      body,
      from_name: 'NeuroAligned',
    });

    return Response.json({ sent: true, to: profileData.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});