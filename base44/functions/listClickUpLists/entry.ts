import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a58c092588cac2ae027fd72';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { 'Authorization': accessToken };

    // Get authorized teams
    const teamRes = await fetch('https://api.clickup.com/api/v2/team', { headers: authHeader });
    const teamData = await teamRes.json();
    if (teamData.err || teamData.error) {
      return Response.json({ error: teamData.err || teamData.error }, { status: 400 });
    }

    const teams = teamData.teams || [];

    // For each team, get spaces, then for each space get lists
    const lists = [];
    for (const team of teams) {
      const spaceRes = await fetch(`https://api.clickup.com/api/v2/team/${team.id}/space`, { headers: authHeader });
      const spaceData = await spaceRes.json();
      const spaces = spaceData.spaces || [];

      for (const space of spaces) {
        const listRes = await fetch(`https://api.clickup.com/api/v2/space/${space.id}/list`, { headers: authHeader });
        const listData = await listRes.json();
        const spaceLists = listData.lists || [];

        for (const list of spaceLists) {
          lists.push({
            id: list.id,
            name: list.name,
            team_name: team.name,
            space_name: space.name,
          });
        }
      }
    }

    return Response.json({ lists, teams_count: teams.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});