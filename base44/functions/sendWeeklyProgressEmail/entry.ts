import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin or scheduler
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all completed onboarding profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      onboarding_completed: true,
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ sent: 0, message: 'No profiles found.' });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let sent = 0;
    for (const profile of profiles) {
      if (!profile.user_email) continue;

      // Get tasks completed this week
      const tasks = await base44.asServiceRole.entities.Task.filter({
        created_by: profile.user_email,
        status: 'done',
      });

      const weeklyDone = tasks.filter(t => {
        if (!t.completed_at) return false;
        return new Date(t.completed_at) >= oneWeekAgo;
      });

      const name = profile.display_name || profile.user_email.split('@')[0];
      const count = weeklyDone.length;

      const encouragement = count === 0
        ? "Some weeks are about rest, not results. That's valid too."
        : count < 3
        ? `You completed ${count} task${count > 1 ? 's' : ''} this week. Every step forward counts.`
        : `You completed ${count} tasks this week. That's a real win for a neurodivergent brain running a business.`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.user_email,
        from_name: 'NeuroAligned',
        subject: `Your week in review, ${name} 📊`,
        body: `Hi ${name},

Here's a quick look at your week:

✅ Tasks completed: ${count}
🧠 Last brain state: ${profile.last_brain_state || 'not checked in'}
📅 Check-ins this week: ${profile.session_count || 0} total sessions

${encouragement}

This week, try to:
• Do one check-in before you start work each day
• Use a Focus Mode for your deepest work
• Schedule one body doubling session for accountability

Open your dashboard →
https://neuroa.app/dashboard

You're doing better than you think. See you next week.

— The NeuroAligned Team
`,
      });
      sent++;
    }

    return Response.json({ sent, total: profiles.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});