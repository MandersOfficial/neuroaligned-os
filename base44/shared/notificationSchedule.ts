/**
 * Shared scheduling helper for notification timing.
 *
 * Members choose the hour their nudges arrive in their own timezone, so a send
 * is only allowed when the clock in *their* part of the world matches the hour
 * they picked. Without a saved timezone we fall back to UTC rather than sending
 * something at an hour they never chose.
 */

export const DEFAULT_CHECKIN_TIME = '09:00';
export const DEFAULT_REMINDER_TIME = '08:00';
export const DEFAULT_TIMEZONE = 'UTC';

/** The wall-clock hour (0-23) at `date` in the given IANA timezone. */
export function localHour(date, timeZone) {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timeZone || DEFAULT_TIMEZONE,
    }).format(date);
    const hour = parseInt(formatted, 10);
    return Number.isFinite(hour) ? hour % 24 : null;
  } catch {
    // An unknown timezone string throws — treat it as "cannot schedule".
    return null;
  }
}

/**
 * True when `date` falls inside the hour the member chose.
 * @param date - the moment the job is running
 * @param preferredTime - "HH:MM" as saved on the member's profile
 * @param timeZone - the member's IANA timezone
 */
export function isPreferredHour(date, preferredTime, timeZone) {
  const hour = localHour(date, timeZone || DEFAULT_TIMEZONE);
  if (hour === null) return false;

  const preferredHour = parseInt(String(preferredTime || '').split(':')[0], 10);
  if (!Number.isFinite(preferredHour)) return false;

  return hour === preferredHour;
}