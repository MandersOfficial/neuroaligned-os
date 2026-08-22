import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CATEGORIES = ['general', 'help', 'review', 'support', 'bug'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Optional auth — feedback can come from anonymous visitors
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }

    const body = await req.json();
    const name = (body.name || '').toString().trim().slice(0, 120);
    const email = (body.email || '').toString().trim().slice(0, 200);
    const category = CATEGORIES.includes(body.category) ? body.category : 'general';
    const subject = (body.subject || '').toString().trim().slice(0, 200);
    const message = (body.message || '').toString().trim().slice(0, 4000);
    const ratingRaw = body.rating;
    const rating = ratingRaw != null && !isNaN(Number(ratingRaw)) ? Number(ratingRaw) : null;
    const submittedFrom = (body.submitted_from || '').toString().slice(0, 60);

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
    });

    // Resolve the recipient (first admin = the app owner)
    let recipientEmail = '';
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 10);
      if (admins && admins.length) recipientEmail = admins[0].email;
    } catch { /* ignore — fall back below */ }

    let emailSent = false;
    if (recipientEmail) {
      const subjectLine = `[NeuroAligned] New ${category} feedback${subject ? ' — ' + subject : ''}`;
      const bodyText = [
        'You received new feedback via NeuroAligned.',
        '',
        `Category: ${category}`,
        subject ? `Subject: ${subject}` : null,
        rating != null ? `Rating: ${rating}/5` : null,
        `From: ${name || '(anonymous)'}${email ? ' <' + email + '>' : ''}${user ? ' (registered user: ' + user.email + ')' : ''}`,
        submittedFrom ? `Submitted from: ${submittedFrom}` : null,
        '',
        'Message:',
        message,
        '',
        'Manage this in your Support dashboard.',
      ].filter(Boolean).join('\n');

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