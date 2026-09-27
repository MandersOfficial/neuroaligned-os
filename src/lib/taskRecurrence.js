import { base44 } from '@/api/base44Client';

const REPEAT_DAYS = { daily: 1, weekly: 7, monthly: 30 };

/**
 * When a repeating task is completed, create the next occurrence so the user
 * never has to re-create it. Returns the new task, or null when the task
 * doesn't repeat.
 */
export async function spawnNextOccurrence(task) {
  const days = REPEAT_DAYS[task?.recurrence];
  if (!days) return null;

  const base = task.due_date ? new Date(`${task.due_date}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  return base44.entities.Task.create({
    title: task.title,
    description: task.description,
    notes: task.notes || [],
    status: 'todo',
    energy_required: task.energy_required || 'medium',
    category: task.category,
    project_id: task.project_id || '',
    due_date: next.toISOString().split('T')[0],
    estimated_minutes: task.estimated_minutes,
    is_today: false,
    recurrence: task.recurrence,
    reminder_frequency: task.reminder_frequency || 'none',
  });
}