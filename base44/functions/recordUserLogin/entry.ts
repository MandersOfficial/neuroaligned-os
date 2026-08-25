import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Stamp the authenticated caller's own last_login. The service role is
    // required to write the built-in User field, but the target is scoped to
    // the caller's id — a logged-in user can never update anyone else's record.
    await base44.asServiceRole.entities.User.update(user.id, { last_login: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}