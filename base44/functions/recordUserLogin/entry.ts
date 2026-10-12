import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Stamps the signed-in member's last_login.
 *
 * The id and the timestamp are both taken from the session and the server
 * clock — never from the request body — so a caller can only ever stamp their
 * own record and cannot falsify another member's last_login.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const caller = await base44.auth.me().catch(() => null);
    if (!caller?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const at = new Date().toISOString();
    await base44.asServiceRole.entities.User.update(caller.id, { last_login: at });

    return Response.json({ ok: true, user_id: caller.id, last_login: at });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}