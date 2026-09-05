export const STATUS_OPTIONS = ['active', 'paused', 'completed', 'archived'];

export const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-secondary text-muted-foreground',
  archived: 'bg-secondary text-muted-foreground',
};

export const PRIORITY_STYLES = {
  low: 'bg-green-50 text-green-600',
  medium: 'bg-yellow-50 text-yellow-600',
  high: 'bg-red-50 text-red-600',
};

export const EMOJIS = ['📁', '🚀', '💼', '🎨', '📊', '🧠', '🌱', '⚡', '🔥', '💡', '👤', '🏢'];
export const EMOJI_OPTIONS = EMOJIS.map(e => ({ value: e, label: e }));

export const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high', label: 'High priority' },
];