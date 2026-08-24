import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch { /* ignore */ }
    const userId = body.user_id;
    if (!userId) return Response.json({ error: 'user_id required' }, { status: 400 });
    await base44.asServiceRole.entities.User.update(userId, { last_login: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}