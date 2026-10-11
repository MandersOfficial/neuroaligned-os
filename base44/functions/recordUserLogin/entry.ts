import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Stamps a member's last_login when the auth workflow fires.
 *
 * The auth workflow passes the id straight from the trigger payload, so the
 * stamp is driven by the sign-in event itself rather than by an ambient
 * session — a workflow-invoked function has no logged-in caller, which is why
 * relying on auth.me() here silently recorded nothing.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch { body = {}; }

    // A signed-in caller can only ever stamp their own record; the trigger id is
    // used for the workflow path, where there is no caller session.
    const caller = await base44.auth.me().catch(() => null);
    const userId = caller?.id || body.user_id;

    if (!userId) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    const at = body.occurred_at || new Date().toISOString();
    await base44.asServiceRole.entities.User.update(userId, { last_login: at });

    return Response.json({ ok: true, user_id: userId, last_login: at });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}