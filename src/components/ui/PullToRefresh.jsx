import { useRef, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 70; // px to pull before triggering refresh

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (el && el.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startYRef.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    startYRef.current = null;
    setPullY(0);
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);
  const showing = pullY > 0 || refreshing;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-all duration-150 pointer-events-none z-10"
        style={{ height: showing ? `${Math.max(pullY, refreshing ? THRESHOLD : 0)}px` : 0 }}
      >
        <div className={`w-8 h-8 rounded-full bg-card border border-border/60 shadow-md flex items-center justify-center transition-all`}
          style={{ transform: `rotate(${refreshing ? 0 : progress * 180}deg)` }}
        >
          <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div style={{ transform: showing ? `translateY(${refreshing ? THRESHOLD : pullY}px)` : 'none', transition: refreshing || pullY === 0 ? 'transform 0.2s ease' : 'none' }}>
        {children}
      </div>
    </div>
  );
}