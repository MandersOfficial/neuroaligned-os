import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import useCurrentUser from '@/hooks/useCurrentUser';
import LoadingScreen from '@/components/workspace/LoadingScreen';
import UpdateAnnouncement from '@/components/workspace/UpdateAnnouncement';

/**
 * Shared layout for the core workspace pages: sidebar, safe-area padding,
 * mobile bottom-nav clearance, and the auth check — every nested page only
 * renders its own content and reads the user from outlet context.
 */
export default function AppShell() {
  const { user, loading } = useCurrentUser();

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-mobile-safe md:pb-0">
        <UpdateAnnouncement user={user} />
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}