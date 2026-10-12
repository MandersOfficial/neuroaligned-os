/**
 * Energy-aware task setup for onboarding.
 *
 * New members tell us when their brain shines (peak energy) and how they like
 * to work. We use those two answers to give every task they add at sign-up an
 * energy level — so their first dashboard is a queue they can actually start,
 * not a flat list.
 */

const HIGH_SIGNALS = [
  'launch', 'proposal', 'website', 'pitch', 'write', 'create', 'design',
  'build', 'strategy', 'plan', 'present', 'deck', 'portfolio', 'product',
  'client', 'research', 'brand', 'course', 'campaign',
];

const LOW_SIGNALS = [
  'email', 'inbox', 'admin', 'invoice', 'receipt', 'book', 'schedule',
  'tidy', 'organize', 'file', 'expense', 'reply', 'update', 'check',
  'buy', 'pay', 'print', 'sort', 'backup',
];

// When a title gives no clear signal, the member's work style sets the default.
const WORK_STYLE_DEFAULT = {
  'Deep focus blocks': 'high',
  'Hyperfocus until done': 'high',
  'Short sprints with breaks': 'medium',
  'Structured routines': 'medium',
  'Flexible, mood-dependent': 'low',
};

const PEAK_WINDOWS = {
  'Early morning (5-9am)': 'early morning',
  'Morning (9am-12pm)': 'morning',
  'Afternoon (12-4pm)': 'afternoon',
  'Evening (4-8pm)': 'evening',
  'Night (8pm+)': 'evening',
  "It varies — I'm unpredictable": 'best window',
};

export const ENERGY_META = {
  high: { label: 'High energy', emoji: '🔥' },
  medium: { label: 'Medium energy', emoji: '⚡' },
  low: { label: 'Low energy', emoji: '🌱' },
};

/** A short, human phrase for the member's peak-energy answer. */
export function peakWindow(energy_peak) {
  return PEAK_WINDOWS[energy_peak] || 'best window';
}

/** How much energy a task is likely to ask for. */
export function inferEnergy(title, work_style) {
  const text = (title || '').toLowerCase();
  if (HIGH_SIGNALS.some(k => text.includes(k))) return 'high';
  if (LOW_SIGNALS.some(k => text.includes(k))) return 'low';
  return WORK_STYLE_DEFAULT[work_style] || 'medium';
}

/** Turn the goals a member added at sign-up into energy-tagged tasks. */
export function planEnergyTasks(goals = [], energy_peak, work_style) {
  const window = energy_peak ? peakWindow(energy_peak) : null;
  return goals.map(title => ({
    title,
    energy_required: inferEnergy(title, work_style),
    window,
  }));
}