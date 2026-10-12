import { useState, useEffect } from 'react';
import { Volume2, Pause, Play, Square, Loader2 } from 'lucide-react';
import { useSensory } from '@/lib/SensoryContext';
import { cn } from '@/lib/utils';
import {
  getReadAloudState, subscribeReadAloud,
  startReadAloud, stopReadAloud, pauseReadAloud, resumeReadAloud,
} from '@/lib/readAloud';

/**
 * Read Aloud control: speaks the current page in the member's chosen voice and
 * lets them pause, resume or stop. Playback lives in a shared module, so the
 * desktop sidebar and the mobile More sheet always show the same state.
 */
export default function ReadAloudButton({ variant = 'floating', collapsed = false }) {
  const [status, setStatus] = useState(getReadAloudState());
  const { prefs } = useSensory();

  useEffect(() => subscribeReadAloud(setStatus), []);

  const isSidebar = variant === 'sidebar';
  const isTopbar = variant === 'topbar';
  const active = status !== 'idle';

  const handlePrimary = () => {
    if (status === 'loading') { stopReadAloud(); return; }
    if (status === 'speaking') { pauseReadAloud(); return; }
    if (status === 'paused') { resumeReadAloud(); return; }
    startReadAloud(prefs.readerVoiceId);
  };

  const label = status === 'loading' ? 'Loading…'
    : status === 'speaking' ? 'Pause'
      : status === 'paused' ? 'Resume'
        : 'Read Aloud';

  const Icon = status === 'loading' ? Loader2
    : status === 'speaking' ? Pause
      : status === 'paused' ? Play
        : Volume2;

  const primaryCls = isSidebar
    ? cn(
      'flex items-center gap-2.5 py-2 rounded-lg text-sm font-medium border transition-colors',
      collapsed ? 'justify-center px-2' : 'px-3 flex-1',
      active
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
    )
    : isTopbar
    ? cn(
      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
      active
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
    )
    : cn(
      'flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-colors',
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-card text-foreground border-border hover:bg-secondary'
    );

  const stopCls = isSidebar
    ? 'flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium border border-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors shrink-0'
    : isTopbar
    ? 'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors shrink-0'
    : 'flex items-center gap-2 rounded-full px-3 py-2.5 text-xs font-semibold shadow-lg border border-border bg-card text-foreground hover:bg-secondary transition-colors';

  return (
    <div className={isSidebar ? cn('flex items-center gap-1', collapsed && 'flex-col') : 'flex items-center gap-1.5'}>
      <button
        type="button"
        onClick={handlePrimary}
        className={primaryCls}
        title={status === 'idle' ? 'Read this page aloud' : label}
        aria-label={status === 'idle' ? 'Read this page aloud' : label}
      >
        <Icon className={cn('w-4 h-4 shrink-0', status === 'loading' && 'animate-spin', !active && 'text-primary')} />
        {(!isSidebar || !collapsed) && <span>{label}</span>}
      </button>

      {active && (
        <button
          type="button"
          onClick={stopReadAloud}
          className={stopCls}
          title="Stop reading"
          aria-label="Stop reading"
        >
          <Square className="w-4 h-4 shrink-0" />
          {!isSidebar && <span>Stop</span>}
        </button>
      )}
    </div>
  );
}