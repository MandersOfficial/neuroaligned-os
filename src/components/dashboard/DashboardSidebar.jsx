import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, Focus, Plug, ShieldAlert, BookOpen, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'My Tasks', href: '/tasks' },
  { icon: Focus, label: 'Focus Modes', href: '/focus-modes' },
  { icon: ShieldAlert, label: 'Burnout Risk', href: '/burnout' },
  { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
  { icon: Users, label: 'Community', href: '/forum' },
  { icon: Plug, label: 'Integrations', href: '/integrations' },
];

// Show only 5 most important items on mobile bottom nav
const MOBILE_NAV = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Focus, label: 'Focus', href: '/focus-modes' },
  { icon: ShieldAlert, label: 'Burnout', href: '/burnout' },
  { icon: Users, label: 'Community', href: '/forum' },
];

export default function DashboardSidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className={cn(
        'hidden md:flex h-screen sticky top-0 flex-col bg-card border-r border-border/60 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 px-4 py-5 border-b border-border/40', collapsed && 'justify-center px-2')}>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display font-bold text-base text-foreground">NeuroAligned</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, href }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade nudge */}
        {!collapsed && (
          <Link to="/upgrade" className="mx-3 mb-3 block px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">Upgrade Plan</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Starter $30 · Pro $50/mo</p>
          </Link>
        )}

        {/* Bottom */}
        <div className="border-t border-border/40 p-2 space-y-1">
          <button
            onClick={() => base44.auth.logout()}
            title={collapsed ? 'Sign out' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/60 flex items-stretch">
        {MOBILE_NAV.map(({ icon: Icon, label, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', active && 'scale-110 transition-transform')} />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}