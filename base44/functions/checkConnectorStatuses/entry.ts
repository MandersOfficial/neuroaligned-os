import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { connectorIds } = await req.json().catch(() => ({}));
    if (!Array.isArray(connectorIds)) {
      return Response.json({ error: 'connectorIds array required' }, { status: 400 });
    }

    const statuses: Record<string, boolean> = {};

    await Promise.all(connectorIds.map(async (id: string) => {
      try {
        await base44.asServiceRole.connectors.getCurrentAppUserConnection(id);
        statuses[id] = true;
      } catch {
        statuses[id] = false;
      }
    }));

    return Response.json({ statuses });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}