import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain, LayoutDashboard, CheckSquare, LogOut,
  ChevronLeft, ChevronRight, Focus, Plug, ShieldAlert,
  BookOpen, Users, Zap, Eye, Moon, Sun, NotebookPen, TrendingUp, DoorOpen, FolderKanban, Database, Calendar,
  HelpCircle, Shield, LifeBuoy, ShieldCheck, Scissors, HeartHandshake
} from 'lucide-react';
import { useSensory } from '@/lib/SensoryContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
      { icon: Scissors, label: 'Break It Down', href: '/task-breakdown' },
      { icon: FolderKanban, label: 'Projects', href: '/projects' },
      { icon: NotebookPen, label: 'Journal', href: '/journal' },
      { icon: Focus, label: 'Focus Modes', href: '/focus-modes' },
      { icon: TrendingUp, label: 'Trends', href: '/productivity' },
    ],
  },
  {
    label: 'Wellbeing',
    items: [
      { icon: ShieldAlert, label: 'Burnout Risk', href: '/burnout' },
      { icon: DoorOpen, label: 'Focus Rooms', href: '/focus-rooms' },
      { icon: HeartHandshake, label: 'Find a Partner', href: '/body-doubling-match' },
      { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { icon: Plug, label: 'Integrations', href: '/integration-settings' },
      { icon: Database, label: 'Notion Sync', href: '/notion-sync' },
      { icon: Calendar, label: 'Calendar Sync', href: '/calendar-sync' },
    ],
  },
  {
    label: 'Account & Support',
    items: [
      { icon: Eye, label: 'Sensory', href: '/sensory' },
      { icon: LifeBuoy, label: 'Support', href: '/support' },
      { icon: HelpCircle, label: 'Help Center', href: '/help-center' },
      { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

const MOBILE_NAV = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Scissors, label: 'Break Down', href: '/task-breakdown' },
  { icon: NotebookPen, label: 'Journal', href: '/journal' },
  { icon: Focus, label: 'Focus', href: '/focus-modes' },
];

const TAB_PATHS_KEY = 'na_tab_paths';

export default function DashboardSidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // Bottom-tab selection that survives navigation to interior pages and reloads
  const [lastTab, setLastTab] = useState(() => localStorage.getItem('na_last_tab') || '/dashboard');
  // Navigation state memory: the last sub-page viewed while each tab was active
  const [tabPaths, setTabPaths] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TAB_PATHS_KEY) || '{}') || {}; } catch { return {}; }
  });
  const { prefs, updatePref } = useSensory();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  // A tab stays selected on interior pages (like native apps): match the
  // current route exactly or by prefix, otherwise fall back to the last tab
  // the user tapped so the selection never resets to nothing.
  const activeTab = (() => {
    const path = location.pathname;
    const exact = MOBILE_NAV.find(t => t.href === path);
    if (exact) return exact.href;
    const partial = MOBILE_NAV.find(t => path.startsWith(t.href + '/'));
    if (partial) return partial.href;
    return MOBILE_NAV.some(t => t.href === lastTab) ? lastTab : '/dashboard';
  })();

  // Remember which sub-page was last viewed under each tab, so switching
  // back to a tab restores it instead of always starting at its root.
  useEffect(() => {
    setTabPaths(prev => {
      if (prev[activeTab] === location.pathname) return prev;
      const next = { ...prev, [activeTab]: location.pathname };
      localStorage.setItem(TAB_PATHS_KEY, JSON.stringify(next));
      return next;
    });
  }, [location.pathname, activeTab]);

  const handleTabTap = (e, href) => {
    localStorage.setItem('na_last_tab', href);
    setLastTab(href);
    e.preventDefault();
    // Restore the tab's remembered sub-page, falling back to its root
    const remembered = tabPaths[href] || href;
    if (location.pathname === remembered) {
      // Re-tapping the view you're already on resets the view back to the top
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(remembered);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex h-screen sticky top-0 flex-col bg-card border-r border-border/60 transition-all duration-300 shrink-0',
        collapsed ? 'w-[60px]' : 'w-52'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-2.5 px-4 py-4 border-b border-border/40',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
            <img src="https://media.base44.com/images/public/69d83404dff23f1198ddc883/8749fbb8f_image.png" alt="NeuroAligned OS" className="w-full h-full object-cover" />
          </div>
          {!collapsed && <span className="font-display font-bold text-sm text-foreground leading-tight">NeuroAligned OS</span>}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ icon: Icon, label, href }) => {
                  const active = location.pathname === href;
                  return (
                    <Link
                      key={href}
                      to={href}
                      title={collapsed ? label : undefined}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade nudge */}
        {!collapsed && (
          <Link
            to="/upgrade"
            className="mx-3 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary leading-none">Upgrade Plan</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Starter $30 · Pro $50/mo</p>
            </div>
          </Link>
        )}

        {/* Bottom controls */}
        <div className="border-t border-border/40 px-2 py-2 space-y-0.5">
          {isAdmin && (
            <Link
              to="/admin"
              title={collapsed ? 'Admin Console' : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all',
                collapsed && 'justify-center px-0'
              )}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Admin Console</span>}
            </Link>
          )}
          <button
            onClick={() => updatePref('darkMode', !prefs.darkMode)}
            title={prefs.darkMode ? 'Light mode' : 'Dark mode'}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all',
              collapsed && 'justify-center px-0'
            )}
          >
            {prefs.darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{prefs.darkMode ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button
            onClick={() => base44.auth.logout('/')}
            title={collapsed ? 'Sign out' : undefined}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/60 flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {MOBILE_NAV.map(({ icon: Icon, label, href }) => {
          const active = activeTab === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={(e) => handleTabTap(e, href)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', active && 'scale-110')} />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}