import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import VoiceDictation from '@/components/accessibility/VoiceDictation';
import CommandMic from '@/components/accessibility/CommandMic';

/**
 * Floating voice controls for authenticated users. Read Aloud, Dictate and the
 * Command Mode switch live in the app's own menus (sidebar on desktop, More
 * sheet on mobile) — this only carries the contextual dictation pill and, on
 * mobile, the Command Mode mic.
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
      <div className="md:hidden">
        <CommandMic />
      </div>
    </div>
  );
}