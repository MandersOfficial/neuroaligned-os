import { useState, useEffect } from 'react';
import { AudioLines } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getCommandMode, setCommandMode, subscribeCommandMode, loadCommandMode } from '@/lib/voiceCommandStore';

const speechSupported = () =>
  typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Command Mode switch — shared by the desktop sidebar and the mobile More sheet.
 * Off by default; the choice is saved on the member's profile.
 */
export default function CommandModeToggle({ variant = 'sidebar', collapsed = false }) {
  const [on, setOn] = useState(getCommandMode());
  const [supported] = useState(speechSupported);

  useEffect(() => {
    const unsubscribe = subscribeCommandMode(setOn);
    loadCommandMode();
    return unsubscribe;
  }, []);

  const toggle = (next) => setCommandMode(next);

  if (variant === 'sheet') {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Command Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {supported
                ? 'Speak commands like “go to tasks” instead of typing. Unrecognised phrases use AI (credits).'
                : 'Speech recognition is not available in this browser, so Command Mode is unavailable.'}
            </p>
          </div>
          <Switch checked={on} onCheckedChange={toggle} disabled={!supported} aria-label="Command Mode" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => supported && toggle(!on)}
      disabled={!supported}
      title={supported ? (on ? 'Turn Command Mode off' : 'Turn Command Mode on') : 'Not available in this browser'}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
        collapsed ? 'justify-center px-0' : 'justify-between',
        on ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary',
        !supported && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
        <AudioLines className="w-4 h-4 shrink-0" />
        {!collapsed && <span>Command Mode</span>}
      </span>
      {!collapsed && (
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', on ? 'text-primary' : 'text-muted-foreground/60')}>
          {on ? 'On' : 'Off'}
        </span>
      )}
    </button>
  );
}