import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CATEGORIES = ['general', 'help', 'review', 'support', 'bug'];
const WTP_LABELS = {
  free: 'Free only ($0)',
  starter: 'Starter ($10–20 / mo)',
  pro: 'Pro ($30–50 / mo)',
  power: 'Power ($75+ / mo)',
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Optional auth — feedback can come from anonymous visitors
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }

    const body = await req.json();
    const str = (v, max) => (v == null ? '' : String(v)).trim().slice(0, max || 2000);

    const name = str(body.name, 120);
    const email = str(body.email, 200);
    const category = CATEGORIES.includes(body.category) ? body.category : 'general';
    const subject = str(body.subject, 200);
    const message = str(body.message, 4000);
    const whatYouTried = str(body.what_you_tried, 2000);
    const whatWentWrong = str(body.what_went_wrong, 2000);
    const deviceInfo = str(body.device_info, 200);
    const intentUsage = str(body.intent_usage, 60);
    const willingnessToPay = WTP_LABELS[body.willingness_to_pay] ? body.willingness_to_pay : '';
    const submittedFrom = str(body.submitted_from, 60);
    const ratingRaw = body.rating;
    const rating = ratingRaw != null && !isNaN(Number(ratingRaw)) ? Number(ratingRaw) : null;

    let attachments = [];
    if (Array.isArray(body.attachments)) {
      attachments = body.attachments.map(u => String(u).slice(0, 2000)).filter(Boolean).slice(0, 10);
    }

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const submitterEmail = user ? user.email : (email || '');

    const record = await base44.asServiceRole.entities.Feedback.create({
      name: name || (user ? (user.full_name || '') : ''),
      email: email || (user ? user.email : ''),
      submitter_email: submitterEmail,
      category,
      subject: subject || (category === 'review' ? 'Review' : 'Feedback'),
      message,
      rating,
      status: 'new',
      submitted_from: submittedFrom,
      what_you_tried: whatYouTried,
      what_went_wrong: whatWentWrong,
      device_info: deviceInfo,
      intent_usage: intentUsage,
      willingness_to_pay: willingnessToPay,
      attachments,
    });

    // Resolve the recipient (first admin = the app owner)
    let recipientEmail = '';
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 10);
      if (admins && admins.length) recipientEmail = admins[0].email;
    } catch { /* ignore */ }

    let emailSent = false;
    if (recipientEmail) {
      const lines = [
        'You received new feedback via NeuroAligned.',
        '',
        `Category: ${category}`,
        subject ? `Subject: ${subject}` : null,
        rating != null ? `Rating: ${rating}/5` : null,
        `From: ${name || '(anonymous)'}${email ? ' <' + email + '>' : ''}${user ? ' (registered user: ' + user.email + ')' : ''}`,
        submittedFrom ? `Submitted from: ${submittedFrom}` : null,
        intentUsage ? `Would use it: ${intentUsage}` : null,
        willingnessToPay ? `Willingness to pay: ${WTP_LABELS[willingnessToPay]}` : null,
        '',
        'Message:',
        message,
      ];
      if (whatYouTried || whatWentWrong || deviceInfo) {
        lines.push('', '--- Issue details ---');
        if (whatYouTried) lines.push('What they were trying to do:', whatYouTried);
        if (whatWentWrong) lines.push('What went wrong / what they expected:', whatWentWrong);
        if (deviceInfo) lines.push('Device / browser:', deviceInfo);
      }
      if (attachments.length) {
        lines.push('', 'Attachments:');
        attachments.forEach((u, i) => lines.push(`${i + 1}. ${u}`));
      }
      lines.push('', 'Manage this in your Support dashboard.');

      const bodyText = lines.filter(l => l !== null).join('\n');
      const subjectLine = `[NeuroAligned] New ${category} feedback${subject ? ' — ' + subject : ''}`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: subjectLine,
          body: bodyText,
        });
        emailSent = true;
      } catch { /* email failed — record still saved */ }
    }

    return Response.json({
      success: true,
      id: record.id,
      emailSent,
      recipient: recipientEmail ? 'sent' : 'no_admin',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}