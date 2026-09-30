import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { isOwnerAdmin } from "../../shared/adminGate.ts";
import { APP_BASE_URL } from "../../shared/appBaseUrl.ts";
import { sendUserPush, PUSH_PREFS } from "../../shared/pushNotifications.ts";
import { isPreferredHour, DEFAULT_REMINDER_TIME } from "../../shared/notificationSchedule.ts";

// How long to wait between reminders for each frequency (in hours)
const INTERVAL_HOURS = {
  hourly: 1,
  daily: 24,
  weekly: 168,
  monthly: 720,
};

const FREQUENCY_LABEL = {
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

/**
 * Finds every open task whose reminder is due and emails the task owner a
 * short digest, then stamps last_reminded_at so the next run doesn't repeat it.
 * Run by the "Task Reminders" workflow on an hourly schedule.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Verify this is being called by an admin or the scheduler
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [tasks, users, profiles] = await Promise.all([
      base44.asServiceRole.entities.Task.list('-created_date', 1000),
      base44.asServiceRole.entities.User.list('-created_date', 1000),
      base44.asServiceRole.entities.UserProfile.list('-created_date', 1000),
    ]);

    const emailById = new Map(users.map(u => [u.id, u.email]));
    const profileByEmail = new Map(profiles.map(p => [p.user_email, p]));
    const now = Date.now();

    const dueTasks = tasks.filter(t => {
      const hours = INTERVAL_HOURS[t.reminder_frequency];
      if (!hours) return false;
      if (t.status === 'done') return false;
      if (!emailById.get(t.created_by_id)) return false;
      const last = Date.parse(t.last_reminded_at || t.created_date);
      if (!Number.isFinite(last)) return false;
      return now - last >= hours * 60 * 60 * 1000;
    });

    if (dueTasks.length === 0) {
      return Response.json({ sent: 0, tasks: 0, message: 'No reminders due.' });
    }

    // Group the due tasks by the person who owns them — one email per person
    const byEmail = new Map();
    for (const task of dueTasks) {
      const email = emailById.get(task.created_by_id);
      if (!byEmail.has(email)) byEmail.set(email, []);
      byEmail.get(email).push(task);
    }

    const errors = [];
    const remindedIds = [];
    let sent = 0;
    let pushed = 0;

    for (const [email, ownerTasks] of byEmail) {
      const list = ownerTasks
        .map(t => `• ${t.title}${t.due_date ? ` — due ${t.due_date}` : ''}`)
        .join('\n');

      const subject = ownerTasks.length === 1
        ? `Reminder: ${ownerTasks[0].title}`
        : `${ownerTasks.length} task reminders`;

      const body = `Hi,

You asked to be reminded about ${ownerTasks.length === 1 ? 'this task' : 'these tasks'}:

${list}

Open your tasks: ${APP_BASE_URL}/tasks

---
You're receiving this because you set a reminder on ${ownerTasks.length === 1 ? 'this task' : 'these tasks'} (${FREQUENCY_LABEL[ownerTasks[0].reminder_frequency]}).
Change or remove the reminder anytime by editing the task.
`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body,
        });
        sent++;
        for (const t of ownerTasks) remindedIds.push(t.id);
      } catch (emailErr) {
        errors.push({ email, error: emailErr.message });
      }

      // Same digest to the member's phone — but only during the hour they chose.
      // Reminder emails keep their own cadence; the phone nudge respects the
      // member's preferred time so nothing lands outside their window.
      const profile = profileByEmail.get(email);
      const inReminderWindow = isPreferredHour(
        new Date(),
        profile?.push_reminder_time || DEFAULT_REMINDER_TIME,
        profile?.notification_timezone
      );

      const pushResult = inReminderWindow
        ? await sendUserPush(base44, {
            userId: ownerTasks[0].created_by_id,
            profile,
            preferenceKey: PUSH_PREFS.taskReminders,
            title: ownerTasks.length === 1 ? 'Task reminder' : `${ownerTasks.length} task reminders`,
            content: ownerTasks.slice(0, 3).map(t => t.title).join(' · ')
              + (ownerTasks.length > 3 ? ` +${ownerTasks.length - 3} more` : ''),
            actionLabel: 'Open tasks',
            actionUrl: `${APP_BASE_URL}/tasks`,
          })
        : 'skipped';
      if (pushResult === 'sent') pushed++;
    }

    if (remindedIds.length > 0) {
      const stamp = new Date().toISOString();
      await base44.asServiceRole.entities.Task.bulkUpdate(
        remindedIds.map(id => ({ id, last_reminded_at: stamp }))
      );
    }

    return Response.json({
      sent,
      pushed,
      tasks: remindedIds.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Sent ${sent} reminder email(s) and ${pushed} push notification(s) covering ${remindedIds.length} task(s).`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}