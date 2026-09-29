import { base44 } from '@/api/base44Client';

/**
 * Shared voice-command state.
 *
 * Command Mode is one setting that must agree between the sidebar row and the
 * mobile More sheet, so it lives here (mirrored to localStorage for instant
 * boot, persisted on the member's profile so it follows them between devices).
 * The same module carries the "Dictate" request fired from the More sheet.
 */

const KEY = 'na_voice_command_mode';

let commandMode = (() => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
})();

const modeListeners = new Set();
let loadedFromProfile = false;

export function getCommandMode() {
  return commandMode;
}

export function subscribeCommandMode(fn) {
  modeListeners.add(fn);
  return () => modeListeners.delete(fn);
}

function emitMode() {
  modeListeners.forEach(fn => fn(commandMode));
}

/** Pull the saved choice off the member's profile once per session. */
export async function loadCommandMode() {
  if (loadedFromProfile) return commandMode;
  loadedFromProfile = true;
  try {
    const me = await base44.auth.me();
    if (!me?.email) return commandMode;
    const [profile] = await base44.entities.UserProfile.filter({ user_email: me.email });
    if (profile && typeof profile.voice_command_mode === 'boolean') {
      commandMode = profile.voice_command_mode;
      try { localStorage.setItem(KEY, commandMode ? '1' : '0'); } catch { /* ignore */ }
      emitMode();
    }
  } catch {
    // Keep the cached value — Command Mode still works this session.
  }
  return commandMode;
}

export async function setCommandMode(value) {
  commandMode = !!value;
  try { localStorage.setItem(KEY, commandMode ? '1' : '0'); } catch { /* ignore */ }
  emitMode();
  try {
    const me = await base44.auth.me();
    if (!me?.email) return;
    const [profile] = await base44.entities.UserProfile.filter({ user_email: me.email });
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { voice_command_mode: commandMode });
    } else {
      await base44.entities.UserProfile.create({ user_email: me.email, voice_command_mode: commandMode });
    }
  } catch {
    // Local choice still applies for this session.
  }
}

/* ---- "Dictate" requested from the More sheet ------------------------------ */

let dictatePending = false;
const dictateListeners = new Set();

/** Ask the dictation mic to start on the next field the member focuses. */
export function requestDictate() {
  dictatePending = true;
  dictateListeners.forEach(fn => fn());
}

export function consumeDictateRequest() {
  const value = dictatePending;
  dictatePending = false;
  return value;
}

export function subscribeDictateRequest(fn) {
  dictateListeners.add(fn);
  return () => dictateListeners.delete(fn);
}