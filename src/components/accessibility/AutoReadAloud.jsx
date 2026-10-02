import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSensory } from '@/lib/SensoryContext';
import { startReadAloud, stopReadAloud } from '@/lib/readAloud';

// Pages that should never read themselves aloud
const SKIP_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/'];

/**
 * Drives the persisted "Read pages aloud automatically" preference: stops any
 * playback on navigation and, when the member has it switched on, starts
 * reading the new page once it has painted.
 */
export default function AutoReadAloud() {
  const location = useLocation();
  const { prefs } = useSensory();
  const voiceRef = useRef(prefs.readerVoiceId);
  voiceRef.current = prefs.readerVoiceId;

  useEffect(() => {
    stopReadAloud();
    if (!prefs.readAloudAuto) return;
    if (SKIP_PATHS.includes(location.pathname)) return;

    // Give the page a moment to render before reading its content
    const timer = setTimeout(() => startReadAloud(voiceRef.current), 600);
    return () => clearTimeout(timer);
  }, [location.pathname, prefs.readAloudAuto]);

  return null;
}