/**
 * Content template for the daily check-in push nudge.
 *
 * Every nudge asks one question — how's your energy right now? — and points at
 * the grounding task that fits the member's most recent answer, so what lands
 * on their phone matches where their nervous system actually was.
 *
 * The grounding tasks named here are the same ones the in-app check-in offers
 * once the member picks their state (see BRAIN_STATES in the check-in selector),
 * so the nudge and the app always agree.
 */

export const NUDGE_QUESTION = "How's your energy right now?";

const NUDGES = {
  overwhelmed: {
    title: "How's your energy right now? 🔴",
    content: 'If today is a red-zone day, start with a 2-minute box-breathing reset.',
  },
  scattered: {
    title: "How's your energy right now? 🟡",
    content: 'If your brain feels revved up, a 90-second grounding exercise can pull you back to centre.',
  },
  neutral: {
    title: "How's your energy right now? 🟢",
    content: "You're regulated — a good moment to pick one thing and start.",
  },
  low_energy: {
    title: "How's your energy right now? 🔵",
    content: "If you're foggy, 60 seconds of gentle activation can bring you back online.",
  },
  focused: {
    title: "How's your energy right now? ✨",
    content: 'You were in flow last time. Check in and protect that window.',
  },
};

const DEFAULT_NUDGE = {
  title: "How's your energy right now? 🧠",
  content: "Two minutes to check in — we'll suggest a grounding task that fits where you are.",
};

/** The nudge copy for a member's most recent energy level. */
export function nudgeForEnergyLevel(brainState) {
  return NUDGES[brainState] || DEFAULT_NUDGE;
}