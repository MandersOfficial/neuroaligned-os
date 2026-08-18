// Shared Notion property readers + project matcher used by Notion-backed backend functions.

export function readTitle(prop) {
  if (!prop?.title?.length) return '';
  return prop.title.map(t => t.plain_text || '').join('');
}

export function readRichText(prop) {
  if (!prop?.rich_text?.length) return '';
  return prop.rich_text.map(t => t.plain_text || '').join('');
}

export function readSelect(prop) {
  return prop?.select?.name || prop?.status?.name || '';
}

export function readDate(prop) {
  return prop?.date?.start || '';
}

export function mapStatus(notionStatus) {
  const s = (notionStatus || '').toLowerCase();
  if (s.includes('done') || s.includes('complete') || s.includes('finished')) return 'done';
  if (s.includes('progress') || s.includes('doing') || s.includes('active')) return 'in_progress';
  if (s.includes('defer') || s.includes('later') || s.includes('someday')) return 'deferred';
  return 'todo';
}

// Reads a "Project" property (relation / select / rich_text / title) into a name string.
export function readProjectRef(prop) {
  if (!prop) return '';
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'rich_text' && prop.rich_text?.length) {
    return prop.rich_text.map(t => t.plain_text || '').join('');
  }
  if (prop.type === 'title' && prop.title?.length) {
    return prop.title.map(t => t.plain_text || '').join('');
  }
  return '';
}

// Returns a matcher that resolves a Notion page's "Project" property to a NeuroAligned Project entity.
export function createProjectMatcher(projects, accessToken) {
  const projectByName = new Map(projects.map(p => [p.name.trim().toLowerCase(), p]));
  const relationTitleCache = new Map();

  async function resolveRelationTitle(id) {
    if (relationTitleCache.has(id)) return relationTitleCache.get(id);
    let title = '';
    try {
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Notion-Version': '2022-06-28' },
      });
      const data = await r.json();
      const titleProp = Object.values(data.properties || {}).find(p => p.type === 'title');
      title = readTitle(titleProp);
    } catch { /* ignore */ }
    relationTitleCache.set(id, title);
    return title;
  }

  async function match(props) {
    const projectProp = props['Project'] || props['project'];
    let projectRefName = readProjectRef(projectProp);
    if (projectProp?.type === 'relation' && projectProp.relation?.length) {
      const titles = [];
      for (const rel of projectProp.relation) {
        const t = await resolveRelationTitle(rel.id);
        if (t) titles.push(t);
      }
      projectRefName = titles.join(', ');
    }
    const project = projectRefName ? projectByName.get(projectRefName.trim().toLowerCase()) : null;
    return { project, projectRefName };
  }

  return { match };
}