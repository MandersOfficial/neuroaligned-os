import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isOwnerAdmin } from "../../shared/adminGate.ts";
import { APP_BASE_URL } from "../../shared/appBaseUrl.ts";
import { sendUserPush, PUSH_PREFS } from "../../shared/pushNotifications.ts";
import { isPreferredHour, DEFAULT_CHECKIN_TIME } from "../../shared/notificationSchedule.ts";
import { nudgeForEnergyLevel } from "../../shared/checkinNudgeContent.ts";

/**
 * Sends the daily check-in push nudge to every member who opted in, but only
 * during the hour they chose on their profile. Runs hourly so each member's
 * chosen hour is reached exactly once a day in their own timezone.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Verify this is being called by an admin or the scheduler
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only members who turned pushes on and left the check-in nudge enabled
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      push_notifications: true,
      push_checkin_nudge: { $ne: false },
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ pushed: 0, total: 0, message: 'No members opted into check-in nudges.' });
    }

    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const idByEmail = new Map(users.map(u => [u.email, u.id]));

    const now = new Date();
    let pushed = 0;
    let outsideWindow = 0;

    for (const profile of profiles) {
      if (!profile.user_email) continue;

      const inWindow = isPreferredHour(
        now,
        profile.push_checkin_time || DEFAULT_CHECKIN_TIME,
        profile.notification_timezone
      );
      if (!inWindow) {
        outsideWindow++;
        continue;
      }

      // Asks about their energy and names the grounding task that fits the
      // state they reported last time.
      const nudge = nudgeForEnergyLevel(profile.last_brain_state);

      const result = await sendUserPush(base44, {
        userId: idByEmail.get(profile.user_email),
        profile,
        preferenceKey: PUSH_PREFS.checkinNudge,
        title: nudge.title,
        content: nudge.content,
        actionLabel: 'Check in',
        actionUrl: `${APP_BASE_URL}/check-in`,
      });
      if (result === 'sent') pushed++;
    }

    return Response.json({
      pushed,
      outsideWindow,
      total: profiles.length,
      message: `Sent ${pushed} check-in nudge(s); ${outsideWindow} member(s) outside their chosen hour.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}