import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { notion_database_id } = await req.json();
    if (!notion_database_id) {
      return Response.json({ error: 'Missing notion_database_id' }, { status: 400 });
    }

    // Get the user's Notion OAuth access token
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a1cfa4c8db502aafb000e1a');

    // Fetch all user profiles (service role for reading all members)
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    const results = [];
    for (const profile of profiles) {
      // Check if a page for this profile already exists
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Email',
            email: { equals: profile.user_email },
          },
        }),
      });

      const searchData = await searchRes.json();
      const existing = searchData.results?.[0];

      const properties = {
        'Name': { title: [{ text: { content: profile.display_name || profile.user_email || 'Unknown' } }] },
        'Email': { email: profile.user_email || '' },
        'Business Type': { select: { name: profile.business_type || 'Other' } },
        'Work Style': { select: { name: profile.work_style || 'Flexible, mood-dependent' } },
        'Peak Energy': { select: { name: profile.energy_peak || 'It varies — I\'m unpredictable' } },
        'Neurotypes': { multi_select: (profile.neurotypes || []).map(n => ({ name: n })) },
      };

      if (existing) {
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });
        const patchData = await patchRes.json();
        if (patchData.object === 'error') {
          results.push({ name: profile.display_name, action: 'error', error: patchData.message });
        } else {
          results.push({ name: profile.display_name, action: 'updated' });
        }
      } else {
        const createRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: notion_database_id },
            properties,
          }),
        });
        const createData = await createRes.json();
        if (createData.object === 'error') {
          results.push({ name: profile.display_name, action: 'error', error: createData.message });
        } else {
          results.push({ name: profile.display_name, action: 'created' });
        }
      }
    }

    const synced = results.filter(r => r.action !== 'error').length;
    const errors = results.filter(r => r.action === 'error');

    return Response.json({ success: true, synced, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});