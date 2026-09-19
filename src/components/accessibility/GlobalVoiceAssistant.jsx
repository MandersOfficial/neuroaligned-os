import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ReadAloudButton from '@/components/accessibility/ReadAloudButton';
import VoiceDictation from '@/components/accessibility/VoiceDictation';

/**
 * Global voice + accessibility controls for authenticated users. Floating on
 * the right edge so it never covers the left-hand sidebar; dictation only
 * appears while a text input is focused.
 */
export default function GlobalVoiceAssistant() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  if (!authed) return null;

  return (
    <div className="fixed right-4 bottom-24 md:bottom-6 z-[60] flex flex-col items-end gap-2">
      <VoiceDictation />
      <ReadAloudButton />
    </div>
  );
}