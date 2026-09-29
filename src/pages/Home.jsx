import { useState, useEffect, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Landing = lazy(() => import('@/pages/Landing'));

// Phones and tablets open straight into the app — the marketing landing page is
// desktop-only. Signed-in members land on their dashboard, everyone else on login.
const DESKTOP_MIN_WIDTH = 1024;

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < DESKTOP_MIN_WIDTH);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);
    const onChange = () => setIsNarrow(window.innerWidth < DESKTOP_MIN_WIDTH);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (isNarrow) {
    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
  }

  return <Landing />;
}