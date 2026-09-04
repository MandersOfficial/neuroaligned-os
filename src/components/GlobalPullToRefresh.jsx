import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { triggerAppRefresh } from '@/hooks/useAppRefresh';
import { queryClientInstance } from '@/lib/query-client';

const THRESHOLD = 70; // px of pull before triggering

// True when the page and every scrollable ancestor of the touch target is
// scrolled to the very top — the only state where a downward pull means
// "refresh" rather than "scroll".
function isScrolledPastTop(target) {
  if (window.scrollY > 0 || document.documentElement.scrollTop > 0) return true;
  let el = target;
  while (el && el !== document.body) {
    if (el.scrollTop > 0) return true;
    el = el.parentElement;
  }
  return false;
}

// Ignore gestures that start inside overlays or text entry — pulling there
// means interacting with that control, not refreshing the page.
function isInsideOverlay(target) {
  return !!target.closest?.(
    '[role="dialog"], [data-vaul-drawer], [data-radix-popper-content-wrapper], input, textarea, select, [contenteditable="true"]'
  );
}

/**
 * App-wide pull-to-refresh, mounted once in App. Works with any scroll
 * container (pages use nested overflow-y-auto mains) by checking the touch
 * target's scroll ancestors. On trigger it invalidates react-query caches
 * and broadcasts an event that wired pages listen to via useAppRefresh().
 */
export default function GlobalPullToRefresh() {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const startX = useRef(null);
  const canPull = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const setPull = (v) => { pullRef.current = v; setPullY(v); };
    const resetGesture = () => { startY.current = null; canPull.current = false; setPull(0); };

    const onStart = (e) => {
      if (refreshingRef.current || e.touches.length > 1 || isInsideOverlay(e.target)) {
        canPull.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      canPull.current = !isScrolledPastTop(e.target);
    };

    const onMove = (e) => {
      if (startY.current === null || refreshingRef.current) return;
      // If a container started scrolling mid-gesture, this was a scroll, not a pull.
      if (canPull.current && (e.touches.length > 1 || isScrolledPastTop(e.target))) {
        resetGesture();
        return;
      }
      if (!canPull.current) return;
      const deltaY = e.touches[0].clientY - startY.current;
      const deltaX = Math.abs(e.touches[0].clientX - startX.current);
      if (deltaY > 0 && deltaX < deltaY) {
        setPull(Math.min(deltaY * 0.45, THRESHOLD + 24));
      } else if (pullRef.current !== 0) {
        setPull(0);
      }
    };

    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (canPull.current && pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(THRESHOLD);
        queryClientInstance.invalidateQueries();
        triggerAppRefresh();
        window.setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          setPull(0);
        }, 700);
      } else {
        setPull(0);
      }
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  const progress = Math.min(pullY / THRESHOLD, 1);
  if (pullY === 0 && !refreshing) return null;

  return (
    <div
      className="fixed left-1/2 z-[90] pointer-events-none"
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        transform: `translate(-50%, ${Math.min(pullY, THRESHOLD) * 0.5}px)`,
      }}
      aria-hidden="true"
    >
      <div
        className="w-9 h-9 rounded-full bg-card border border-border/60 shadow-lg flex items-center justify-center"
        style={{ transform: `scale(${0.7 + progress * 0.3})` }}
      >
        <RefreshCw
          className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 180}deg)` }}
        />
      </div>
    </div>
  );
}