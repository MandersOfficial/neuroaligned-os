import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, CheckSquare, Zap, HeartPulse, Settings, LogOut, ChevronLeft, ChevronRight, Focus, Plug } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'My Tasks', href: '/tasks' },
  { icon: Focus, label: 'Focus Modes', href: '/focus-modes' },
  { icon: Plug, label: 'Integrations', href: '/integrations' },
  { icon: Zap, label: 'Energy Log', href: '/energy' },
  { icon: HeartPulse, label: 'Regulation', href: '/regulation' },
];

export default function DashboardSidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'h-screen sticky top-0 flex flex-col bg-card border-r border-border/60 transition-all duration-300 shrink-0',
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/40 p-2 space-y-1">
        <Link
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && 'Settings'}
        </Link>
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
  );
}