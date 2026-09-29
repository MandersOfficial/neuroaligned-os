/**
 * Local voice-command phrase list — matched instantly, with no network call and
 * no integration credits. Anything this does not recognise is handed to AI
 * understanding (the interpretVoiceCommand backend function) as a fallback.
 */

const NAV = [
  { path: '/dashboard', label: 'your dashboard', words: ['dashboard', 'home', 'home screen', 'my dashboard'] },
  { path: '/tasks', label: 'tasks', words: ['tasks', 'task list', 'my tasks', 'to do list', 'todo list', 'todos'] },
  { path: '/task-breakdown', label: 'Break It Down', words: ['break it down', 'break down', 'task breakdown', 'breakdown'] },
  { path: '/projects', label: 'projects', words: ['projects', 'project list', 'my projects'] },
  { path: '/journal', label: 'your journal', words: ['journal', 'brain dump'] },
  { path: '/focus-modes', label: 'Focus Modes', words: ['focus modes', 'focus mode', 'focus', 'focus room'] },
  { path: '/productivity', label: 'Trends', words: ['trends', 'productivity', 'my trends'] },
  { path: '/burnout', label: 'Burnout Risk', words: ['burnout', 'burnout risk', 'burnout meter'] },
  { path: '/knowledge', label: 'the Knowledge Base', words: ['knowledge base', 'knowledge', 'articles', 'wiki'] },
  { path: '/integration-settings', label: 'Integrations', words: ['integrations', 'integration settings', 'connections'] },
  { path: '/sensory', label: 'Settings', words: ['settings', 'sensory settings', 'accessibility settings', 'preferences'] },
  { path: '/feedback', label: 'Feedback', words: ['feedback'] },
  { path: '/support', label: 'Support', words: ['support', 'help tickets', 'my tickets'] },
  { path: '/help-center', label: 'the Help Center', words: ['help center', 'help'] },
];

const LEAD_IN = /^(?:go to|open up|open|take me to|navigate to|show me|show|jump to)\s+(.+)$/;
const MODE_LEAD = /^(?:set|start|activate|switch to|use|turn on)\s+(?:my\s+)?(?:energy\s+mode|focus\s+mode|energy|focus|mode)?\s*(?:to\s+)?(.+)$/;
const TASK_LEAD = /^(?:add|create|make|new)\s+(?:a\s+|an\s+)?(?:task|to do|todo)\s*(?:called\s+|named\s+|to\s+)?(.+)$/;
const PROJECT_LEAD = /^(?:open|show|go to)\s+(?:the\s+)?project\s+(.+)$/;

const findNav = (value) => NAV.find(item => item.words.includes(value)) || null;

/**
 * @returns an intent object, or null when nothing local matches.
 * Intents: {type:'navigate',path,label} | {type:'set_focus_mode',name}
 *        | {type:'add_task',title} | {type:'open_project',name}
 */
export function matchPhrase(raw) {
  const text = (raw || '').toLowerCase().replace(/[.,!?]/g, '').trim();
  if (!text) return null;

  const lead = text.match(LEAD_IN);
  if (lead) {
    const nav = findNav(lead[1].trim());
    if (nav) return { type: 'navigate', path: nav.path, label: nav.label };
  }

  const direct = findNav(text);
  if (direct) return { type: 'navigate', path: direct.path, label: direct.label };

  const project = text.match(PROJECT_LEAD);
  if (project) return { type: 'open_project', name: project[1].trim() };

  const task = text.match(TASK_LEAD);
  if (task) return { type: 'add_task', title: task[1].trim() };

  const mode = text.match(MODE_LEAD);
  if (mode) {
    const name = mode[1].trim();
    const modeNav = findNav(name);
    if (modeNav) return { type: 'navigate', path: modeNav.path, label: modeNav.label };
    return { type: 'set_focus_mode', name };
  }

  return null;
}