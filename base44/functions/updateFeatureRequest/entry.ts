import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { isOwnerAdmin } from "../../shared/adminGate.ts";

const STATUSES = ['submitted', 'reviewing', 'planned', 'in_progress', 'shipped', 'declined'];
const PRIORITIES = ['low', 'medium', 'high'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const id = (body.id || '').toString();
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const status = STATUSES.includes(body.status) ? body.status : null;
    const priority = PRIORITIES.includes(body.priority) ? body.priority : null;
    const adminNotes = body.admin_notes != null ? String(body.admin_notes).slice(0, 4000) : null;
    const adminResponse = body.admin_response != null ? String(body.admin_response).slice(0, 2000) : null;

    const current = await base44.asServiceRole.entities.FeatureRequest.get(id);
    if (!current) return Response.json({ error: 'Not found' }, { status: 404 });

    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (adminNotes !== null) update.admin_notes = adminNotes;
    if (adminResponse !== null) update.admin_response = adminResponse;

    await base44.asServiceRole.entities.FeatureRequest.update(id, update);

    const statusChanged = status && status !== current.status;
    const responseChanged = adminResponse !== null && adminResponse !== (current.admin_response || '');

    let notified = false;
    if ((statusChanged || responseChanged) && current.submitter_email) {
      const origin = req.headers.get('origin') || '';
      const link = origin ? `${origin.replace(/\/$/, '')}/support` : '';
      const lines = [
        `Hi ${current.submitter_name || 'there'},`,
        '',
        "There's an update on your feature request with NeuroAligned OS.",
        '',
        `Request: ${current.title}`,
        statusChanged ? `New status: ${status.replace('_', ' ')}` : null,
        '',
        responseChanged ? 'Update from our team:' : null,
        responseChanged ? adminResponse : null,
        '',
        link ? `View it here: ${link}` : 'Open NeuroAligned and visit the Support page.',
        '',
        'Thanks for helping shape NeuroAligned OS.',
        '— The NeuroAligned team',
      ].filter(l => l !== null).join('\n');

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: current.submitter_email,
          subject: 'Update on your NeuroAligned feature request',
          body: lines,
        });
        notified = true;
      } catch { /* email may fail for non-registered addresses */ }
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}