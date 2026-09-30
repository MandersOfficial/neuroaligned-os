import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { isOwnerAdmin } from "../../shared/adminGate.ts";
import { APP_BASE_URL } from "../../shared/appBaseUrl.ts";

const BRAIN_STATE_MESSAGES = {
  overwhelmed: {
    subject: "One breath. One step. That's enough today 🌊",
    body: `Hey,

Yesterday you mentioned feeling overwhelmed — and that's completely valid.

Today, you don't need to conquer your list. You just need one small thing.

Start with a breath. Then open your check-in and let's find your one step together.`,
    cta: "Start my check-in →",
  },
  low_energy: {
    subject: "Low energy days count too 🌧️",
    body: `Hey,

Low energy doesn't mean low value. You showed up yesterday, and that already matters.

Today, let's find something that fits where you actually are — not where you think you should be.

Your check-in is ready when you are.`,
    cta: "Start my check-in →",
  },
  scattered: {
    subject: "You don't have to hold it all today 🍂",
    body: `Hey,

Feeling scattered is one of the hardest places to work from. Your brain is trying to track too many things at once.

Let's pick one thread together. Just one. The rest can wait.

Your check-in takes 2 minutes and helps you find your one thing.`,
    cta: "Find my one thing →",
  },
  neutral: {
    subject: "A fresh start is waiting for you ☁️",
    body: `Hey,

Neutral is actually a good place to be — no pressure, just possibility.

Let's take a moment to check in and see what feels most natural to work on today.`,
    cta: "Start my check-in →",
  },
  focused: {
    subject: "You had clarity yesterday — protect it today ✨",
    body: `Hey,

Yesterday you were in a focused state. Let's see if we can build on that.

Even if today feels different, checking in will help you find your footing and make the most of your energy window.`,
    cta: "Check in now →",
  },
  default: {
    subject: "Your daily check-in is ready 🧠",
    body: `Hey,

Take 2 minutes to check in with yourself before the day takes over.

NeuroAligned will meet you where you are — no pressure, no streaks, just support.`,
    cta: "Start my check-in →",
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify this is being called by an admin or the scheduler
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all user profiles that opted into daily update emails
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      email_update_frequency: 'daily',
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ sent: 0, message: 'No users opted into daily check-in.' });
    }

    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const idByEmail = new Map(users.map(u => [u.email, u.id]));

    const checkinUrl = `${req.headers.get('origin') || 'https://neuroaligned.app'}/check-in`;

    let sent = 0;
    const errors = [];

    for (const profile of profiles) {
      if (!profile.user_email) continue;

      const stateKey = profile.last_brain_state || 'default';
      const msg = BRAIN_STATE_MESSAGES[stateKey] || BRAIN_STATE_MESSAGES.default;

      const displayName = profile.display_name || profile.user_email.split('@')[0];

      const emailBody = `${displayName ? `Hi ${displayName},` : 'Hey,'}

${msg.body.replace('Hey,', '').trim()}

${msg.cta}
${checkinUrl}

---
You're receiving this because of your Email Updates setting (Daily).
Change it anytime in the app under Settings → Email Updates.
`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.user_email,
          subject: msg.subject,
          body: emailBody,
        });
        sent++;
      } catch (emailErr) {
        errors.push({ email: profile.user_email, error: emailErr.message });
      }

      // The phone nudge is handled separately by sendCheckinNudges, which runs
      // hourly so each member gets it during the hour they chose.
    }

    return Response.json({
      sent,
      total: profiles.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully sent ${sent} of ${profiles.length} check-in emails.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});