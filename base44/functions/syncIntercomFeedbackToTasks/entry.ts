import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveTitle(conv, bodyText) {
  const msg = conv.conversation_message || {};
  const raw = conv.title || msg.subject || (bodyText || '').slice(0, 60) || 'Untitled feedback';
  return raw.slice(0, 120);
}

async function fetchConversationDetails(id, headers) {
  try {
    const res = await fetch(`https://api.intercom.io/conversations/${id}?display_as=plaintext`, { headers });
    const data = await res.json();
    if (data.errors) return null;
    return data;
  } catch {
    return null;
  }
}

function extractFirstMessage(convDetails) {
  if (!convDetails) return '';
  const parts = convDetails.conversation_parts?.conversation_parts || [];
  const firstCustomer = parts.find(p => p.part_type === 'comment' || p.part_type === 'message');
  if (firstCustomer?.body) return stripHtml(firstCustomer.body);
  const initMsg = convDetails.conversation_message?.body;
  return initMsg ? stripHtml(initMsg) : '';
}

function extractContactName(convDetails) {
  if (!convDetails?.source?.author?.name) return '';
  return convDetails.source.author.name;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dryRun } = await req.json().catch(() => ({}));

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('intercom');

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Intercom-Version': '2.12',
    };

    const convRes = await fetch('https://api.intercom.io/conversations?per_page=50&order=desc&sort=updated_at', { headers });
    const convData = await convRes.json();
    if (convData.errors) {
      return Response.json({ error: convData.errors[0]?.message || 'Intercom API error' }, { status: 400 });
    }

    const conversations = convData.conversations || [];

    // Dedup against already-synced tasks
    const existingTasks = await base44.entities.Task.filter({});
    const syncedIds = new Set(
      existingTasks.map(t => t.intercom_conversation_id).filter(Boolean)
    );

    const toSync = conversations.filter(c => !syncedIds.has(c.id));

    if (dryRun) {
      const feedback = [];
      for (const c of toSync) {
        const details = await fetchConversationDetails(c.id, headers);
        const bodyText = extractFirstMessage(details);
        feedback.push({
          id: c.id,
          title: deriveTitle(c, bodyText),
          preview: bodyText.slice(0, 200),
          contact: extractContactName(details),
          state: c.state || null,
          created_at: c.created_at || null,
        });
      }
      return Response.json({
        success: true,
        total: conversations.length,
        alreadySynced: conversations.length - toSync.length,
        newCount: toSync.length,
        feedback,
      });
    }

    const results = [];
    let created = 0;
    const errors = [];

    for (const c of toSync) {
      const details = await fetchConversationDetails(c.id, headers);
      const bodyText = extractFirstMessage(details);
      const contact = extractContactName(details);
      const title = deriveTitle(c, bodyText);
      const description = [
        `Intercom conversation #${c.id}`,
        contact ? `From: ${contact}` : null,
        c.created_at ? `Received: ${new Date(c.created_at * 1000).toISOString().split('T')[0]}` : null,
        c.state ? `State: ${c.state}` : null,
        bodyText ? `\n${bodyText.slice(0, 1500)}` : null,
      ].filter(Boolean).join('\n');

      try {
        const task = await base44.entities.Task.create({
          title,
          description,
          category: 'communication',
          energy_required: 'medium',
          status: 'todo',
          intercom_conversation_id: c.id,
        });
        results.push({ id: c.id, title, taskId: task.id, action: 'created' });
        created++;
      } catch (e) {
        errors.push({ id: c.id, title, error: e.message });
      }
    }

    return Response.json({
      success: true,
      total: conversations.length,
      created,
      skipped: conversations.length - toSync.length,
      results,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}