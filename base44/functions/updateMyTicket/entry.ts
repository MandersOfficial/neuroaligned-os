import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { APP_BASE_URL } from '../../shared/appBaseUrl.ts';

const TICKET_CATEGORIES = ['help', 'support', 'bug'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const id = (body.id || '').toString();
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const current = await base44.asServiceRole.entities.Feedback.get(id);
    if (!current) return Response.json({ error: 'Not found' }, { status: 404 });

    const owns = current.submitter_email === user.email || current.created_by_id === user.id;
    if (!owns) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const str = (v, max) => (v == null ? '' : String(v)).trim().slice(0, max || 2000);

    const update = {};
    if (body.subject != null) update.subject = str(body.subject, 200);
    if (body.message != null) update.message = str(body.message, 4000);
    if (body.what_you_tried != null) update.what_you_tried = str(body.what_you_tried, 2000);
    if (body.what_went_wrong != null) update.what_went_wrong = str(body.what_went_wrong, 2000);
    if (body.device_info != null) update.device_info = str(body.device_info, 200);
    if (body.category != null) update.category = TICKET_CATEGORIES.includes(body.category) ? body.category : current.category;
    if (Array.isArray(body.attachments)) {
      update.attachments = body.attachments.map(u => String(u).slice(0, 2000)).filter(Boolean).slice(0, 10);
    }
    if (body.user_reply != null) update.user_reply = str(body.user_reply, 2000);

    await base44.asServiceRole.entities.Feedback.update(id, update);

    const newReply = body.user_reply != null ? str(body.user_reply, 2000) : '';
    const replyChanged = body.user_reply != null && newReply !== (current.user_reply || '');

    let notified = false;
    if (replyChanged && newReply) {
      try {
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 10);
        if (admins && admins.length) {
          // Link uses the app's own base URL — the Origin header is caller-supplied
          // and must never be trusted inside an email sent to an admin.
          const link = `${APP_BASE_URL}/admin`;
          const lines = [
            'A user replied to their support ticket on NeuroAligned.',
            '',
            `From: ${current.name || '(user)'} <${current.submitter_email || current.email || ''}>`,
            `Subject: ${update.subject ?? current.subject}`,
            `Status: ${current.status || 'new'}`,
            '',
            'Their reply:',
            newReply,
            '',
            `Open Support Tickets in your admin console: ${link}`,
          ].join('\n');
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admins[0].email,
            subject: '[NeuroAligned] New reply on a support ticket',
            body: lines,
          });
          notified = true;
        }
      } catch { /* email failed — update still saved */ }
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}