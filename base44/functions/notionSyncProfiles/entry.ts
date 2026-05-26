import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required to sync team profiles' }, { status: 403 });
    }

    const { notion_database_id, notion_access_token } = await req.json();
    if (!notion_database_id || !notion_access_token) {
      return Response.json({ error: 'Missing notion_database_id or notion_access_token' }, { status: 400 });
    }

    // Fetch all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    const results = [];
    for (const profile of profiles) {
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${notion_database_id}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notion_access_token}`,
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
        'Neurotypes': {
          multi_select: (profile.neurotypes || []).map(n => ({ name: n })),
        },
      };

      if (existing) {
        await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${notion_access_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });
        results.push({ name: profile.display_name, action: 'updated' });
      } else {
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notion_access_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: notion_database_id },
            properties,
          }),
        });
        results.push({ name: profile.display_name, action: 'created' });
      }
    }

    return Response.json({ success: true, synced: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});