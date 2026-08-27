import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const subject = (body.subject || '').trim();
    const html = body.body || '';
    const audience = body.audience || 'all';
    const testOnly = !!body.test;
    if (!subject || !html) return Response.json({ error: 'Subject and body are required' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    let recipients = users.filter(u => !!u.email);

    if (audience === 'admins') {
      recipients = recipients.filter(u => u.role === 'admin');
    } else if (['trial', 'starter', 'pro', 'cancelled'].includes(audience)) {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ plan: audience });
      const emailSet = new Set(subs.map(s => s.user_email));
      recipients = recipients.filter(u => emailSet.has(u.email));
    }

    // Test mode: send only to the calling admin so they can preview delivery
    if (testOnly) {
      recipients = [{ email: user.email, full_name: user.full_name }];
    }

    let sent = 0;
    let failed = 0;
    const errors = [];
    for (const r of recipients) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject,
          body: html,
          from_name: 'NeuroAligned OS',
        });
        sent++;
      } catch (e) {
        failed++;
        if (errors.length < 10) errors.push({ email: r.email, error: e.message });
      }
    }

    return Response.json({ sent, failed, total: recipients.length, test: testOnly, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}