import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isOwnerAdmin } from "../../shared/adminGate.ts";

/**
 * Returns every Feedback record for the admin dashboard (support tickets +
 * reviews). Feedback reads are locked to the submitter at the RLS level, so
 * the admin Support Tickets and Reviews tabs read cross-user data through this
 * service-role function. Admin-only; verified server-side.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedback = await base44.asServiceRole.entities.Feedback.list('-created_date', 500);
    return Response.json({ feedback });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}