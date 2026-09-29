import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const normalise = (value) => (value || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

async function loadFocusModes() {
  return base44.entities.FocusMode.list('-created_date', 50);
}

function findMode(modes, name) {
  const target = normalise(name);
  if (!target) return null;
  return modes.find(m => normalise(m.name) === target)
    || modes.find(m => normalise(m.name).includes(target))
    || modes.find(m => target.includes(normalise(m.name)))
    || null;
}

/**
 * Carries out a voice-command intent. Navigation acts immediately; anything
 * that writes saved data states what it is about to do first.
 */
export default function useVoiceCommands() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(null);

  const runIntent = useCallback(async (intent) => {
    if (!intent || intent.type === 'unknown') {
      setStatus({ tone: 'warn', message: intent?.reply || "I didn't catch a command in that — try “go to tasks”." });
      return;
    }

    if (intent.type === 'navigate') {
      navigate(intent.path);
      setStatus({ tone: 'ok', message: `Opening ${intent.label}.` });
      return;
    }

    if (intent.type === 'open_project') {
      navigate('/projects');
      setStatus({ tone: 'ok', message: 'Opening your projects.' });
      return;
    }

    if (intent.type === 'set_focus_mode') {
      const modes = await loadFocusModes();
      const mode = findMode(modes, intent.name);
      if (!mode) {
        setStatus({ tone: 'warn', message: `Couldn't find a focus mode called “${intent.name}”. Nothing changed.` });
        return;
      }
      await Promise.all(modes.map(m => base44.entities.FocusMode.update(m.id, { is_active: m.id === mode.id })));
      navigate('/focus-modes');
      setStatus({ tone: 'ok', message: `${mode.emoji || ''} ${mode.name} is now your active mode.`.trim() });
      return;
    }

    if (intent.type === 'add_task') {
      setPending({ type: 'add_task', title: intent.title });
      setStatus({ tone: 'ask', message: `Add a task called “${intent.title}”?` });
      return;
    }
  }, [navigate]);

  const confirmPending = useCallback(async () => {
    const action = pending;
    setPending(null);
    if (!action) return;
    if (action.type === 'add_task') {
      await base44.entities.Task.create({ title: action.title });
      setStatus({ tone: 'ok', message: `Added task “${action.title}”.` });
    }
  }, [pending]);

  const cancelPending = useCallback(() => {
    setPending(null);
    setStatus({ tone: 'ok', message: 'Cancelled — nothing was changed.' });
  }, []);

  const clearStatus = useCallback(() => setStatus(null), []);

  return { status, pending, runIntent, confirmPending, cancelPending, clearStatus };
}