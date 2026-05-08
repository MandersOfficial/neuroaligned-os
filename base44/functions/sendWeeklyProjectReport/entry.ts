import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users (service role)
    const users = await base44.asServiceRole.entities.User.list();

    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    let sent = 0;
    let errors = 0;

    for (const user of users) {
      if (!user.email) continue;

      try {
        // Fetch data for this user
        const [activeProjects, completedTasks, allTasks] = await Promise.all([
          base44.asServiceRole.entities.Project.filter({ created_by: user.email, status: 'active' }, '-created_date', 20),
          base44.asServiceRole.entities.Task.filter({ created_by: user.email, status: 'done' }, '-updated_date', 50),
          base44.asServiceRole.entities.Task.filter({ created_by: user.email }, '-due_date', 100),
        ]);

        // Filter completed tasks from last 7 days
        const recentlyCompleted = completedTasks.filter(t => {
          const completedDate = t.completed_at || t.updated_date;
          return completedDate && completedDate >= sevenDaysAgo;
        });

        // Upcoming deadlines: tasks due in the next 7 days that aren't done
        const upcomingDeadlines = allTasks.filter(t =>
          t.due_date &&
          t.due_date >= todayStr &&
          t.due_date <= sevenDaysAhead &&
          t.status !== 'done'
        ).sort((a, b) => a.due_date.localeCompare(b.due_date));

        // Projects with upcoming due dates
        const allProjects = await base44.asServiceRole.entities.Project.filter({ created_by: user.email }, '-created_date', 50);
        const projectsWithDeadlines = allProjects.filter(p =>
          p.due_date &&
          p.due_date >= todayStr &&
          p.due_date <= sevenDaysAhead &&
          p.status !== 'completed' &&
          p.status !== 'archived'
        ).sort((a, b) => a.due_date.localeCompare(b.due_date));

        // Skip users with nothing to report
        if (activeProjects.length === 0 && recentlyCompleted.length === 0 && upcomingDeadlines.length === 0) {
          continue;
        }

        const firstName = user.full_name?.split(' ')[0] || 'there';
        const weekOf = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Build email HTML
        const html = buildEmailHtml({
          firstName,
          weekOf,
          activeProjects,
          recentlyCompleted,
          upcomingDeadlines,
          projectsWithDeadlines,
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `📋 Your Weekly Recap — ${weekOf}`,
          body: html,
        });

        sent++;
      } catch (userErr) {
        console.error(`Failed for user ${user.email}:`, userErr.message);
        errors++;
      }
    }

    return Response.json({ success: true, sent, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function priorityBadge(priority) {
  const map = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
  const color = map[priority] || '#6B7280';
  return priority ? `<span style="background:${color}20;color:${color};padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">${priority}</span>` : '';
}

function buildEmailHtml({ firstName, weekOf, activeProjects, recentlyCompleted, upcomingDeadlines, projectsWithDeadlines }) {
  const sectionTitle = (emoji, title) =>
    `<h2 style="font-size:16px;font-weight:700;color:#1e1b4b;margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid #ede9fe;">${emoji} ${title}</h2>`;

  const emptyState = (msg) =>
    `<p style="color:#9ca3af;font-size:13px;font-style:italic;margin:8px 0;">${msg}</p>`;

  const projectRows = activeProjects.map(p => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">${p.emoji || '📁'}</span>
          <div>
            <div style="font-size:14px;font-weight:600;color:#1f2937;">${p.name}</div>
            ${p.client_name ? `<div style="font-size:12px;color:#6b7280;">👤 ${p.client_name}</div>` : ''}
          </div>
        </div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:top;">
        ${priorityBadge(p.priority)}
        ${p.due_date ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Due ${formatDate(p.due_date)}</div>` : ''}
      </td>
    </tr>`).join('');

  const taskRows = (tasks) => tasks.map(t => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="color:#8b5cf6;font-size:16px;">✓</span>
          <span style="font-size:14px;color:#1f2937;">${t.title}</span>
        </div>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:middle;">
        ${t.estimated_minutes ? `<span style="font-size:11px;color:#6b7280;">⏱ ${t.estimated_minutes}m</span>` : ''}
      </td>
    </tr>`).join('');

  const deadlineRows = [...projectsWithDeadlines.map(p => ({ ...p, _type: 'project' })), ...upcomingDeadlines.map(t => ({ ...t, _type: 'task' }))].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')).map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:14px;">${item._type === 'project' ? (item.emoji || '📁') : '☐'}</span>
          <div>
            <div style="font-size:14px;color:#1f2937;">${item.name || item.title}</div>
            <div style="font-size:11px;color:#6b7280;">${item._type === 'project' ? 'Project' : 'Task'}</div>
          </div>
        </div>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:middle;">
        <span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">Due ${formatDate(item.due_date)}</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">🧠</div>
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">NeuroAligned OS</h1>
          <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Your Weekly Recap · ${weekOf}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:32px 36px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <p style="font-size:15px;color:#374151;margin:0 0 4px;">Hey ${firstName} 👋</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 8px;line-height:1.6;">
            Here's a snapshot of your work from the past 7 days — what you've shipped, what's active, and what's coming up next.
          </p>

          ${sectionTitle('🚀', `Active Projects (${activeProjects.length})`)}
          ${activeProjects.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0">${projectRows}</table>` : emptyState('No active projects right now.')}

          ${sectionTitle('✅', `Completed This Week (${recentlyCompleted.length} tasks)`)}
          ${recentlyCompleted.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0">${taskRows(recentlyCompleted)}</table>` : emptyState('No tasks completed in the last 7 days.')}

          ${sectionTitle('⏰', `Upcoming Deadlines (Next 7 Days)`)}
          ${(upcomingDeadlines.length + projectsWithDeadlines.length) > 0 ? `<table width="100%" cellpadding="0" cellspacing="0">${deadlineRows}</table>` : emptyState('Nothing due in the next 7 days. Enjoy the breathing room!')}

          <!-- CTA -->
          <div style="margin:32px 0 0;text-align:center;background:#f5f3ff;border-radius:12px;padding:20px;">
            <p style="margin:0 0 12px;font-size:13px;color:#4b5563;">Ready to plan your week? Open your workspace.</p>
            <a href="https://app.base44.com/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;">Open NeuroAligned →</a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">You're receiving this because you have an active NeuroAligned OS account. Sent every Monday.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}