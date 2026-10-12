import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, LogOut, Focus, Plug, ShieldAlert,
  BookOpen, Zap, Moon, Sun, NotebookPen, TrendingUp, FolderKanban,
  HelpCircle, Shield, LifeBuoy, ShieldCheck, Scissors, Star,
  Settings as SettingsIcon, Menu, Accessibility, Target, MoreHorizontal,
} from 'lucide-react';
import { useSensory } from '@/lib/SensoryContext';
import ReadAloudButton from '@/components/accessibility/ReadAloudButton';
import CommandMic from '@/components/accessibility/CommandMic';
import MoreMenuSheet from '@/components/accessibility/MoreMenuSheet';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { isNativeApp } from '@/lib/isNativeApp';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Always visible in the horizontal top bar
const PRIMARY_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Scissors, label: 'Break It Down', href: '/task-breakdown' },
  { icon: Target, label: 'Accountability', href: '/accountability' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: NotebookPen, label: 'Journal', href: '/journal' },
  { icon: Focus, label: 'Focus Modes', href: '/focus-modes' },
  { icon: TrendingUp, label: 'Trends', href: '/productivity' },
];

// Everything else lives in the More menu so the bar stays uncluttered
const MORE_GROUPS = [
  {
    label: 'Wellbeing',
    items: [
      { icon: ShieldAlert, label: 'Burnout Risk', href: '/burnout' },
      { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
    ],
  },
  {
    label: 'Integrations',
    items: [{ icon: Plug, label: 'Integrations', href: '/integration-settings' }],
  },
  {
    label: 'Account & Support',
    items: [
      { icon: SettingsIcon, label: 'Sensory Settings', href: '/sensory' },
      { icon: Star, label: 'Feedback', href: '/feedback' },
      { icon: LifeBuoy, label: 'Support', href: '/support' },
      { icon: HelpCircle, label: 'Help Center', href: '/help-center' },
      { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
      { icon: Accessibility, label: 'Accessibility', href: '/accessibility' },
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

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // Bottom-tab selection that survives navigation to interior pages and reloads
  const [lastTab, setLastTab] = useState(() => localStorage.getItem('na_last_tab') || '/dashboard');
  // Navigation state memory: the last sub-page viewed while each tab was active
  const [tabPaths, setTabPaths] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TAB_PATHS_KEY) || '{}') || {}; } catch { return {}; }
  });
  const { prefs, updatePref } = useSensory();

  useEffect(() => {
    // Owner-only: the admin console is never exposed to other accounts
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin' && u?.email === 'mandersofficial@gmail.com')).catch(() => {});
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
      // Replace instead of push: tab switching shouldn't pile up history entries
      // (keeps the native WebView back gesture returning to the previous screen).
      navigate(remembered, { replace: true });
    }
  };

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center gap-3 h-14 px-4 bg-card/95 backdrop-blur-md border-b border-border/60 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
            <img src="https://media.base44.com/images/public/69d83404dff23f1198ddc883/8749fbb8f_image.png" alt="NeuroAligned OS" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-sm text-foreground leading-tight whitespace-nowrap">NeuroAligned OS</span>
        </Link>

        <nav className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          {PRIMARY_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                isActive(location.pathname, href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <ReadAloudButton variant="topbar" />
          <CommandMic variant="topbar" />

          <button
            onClick={() => updatePref('darkMode', !prefs.darkMode)}
            title={prefs.darkMode ? 'Light mode' : 'Dark mode'}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {prefs.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <MoreHorizontal className="w-4 h-4" />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[75vh] overflow-y-auto">
              {MORE_GROUPS.map((group, i) => (
                <div key={group.label}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.items.map(({ icon: Icon, label, href }) => (
                    <DropdownMenuItem key={href} onClick={() => navigate(href)} className="gap-2.5 text-sm cursor-pointer">
                      <Icon className="w-4 h-4" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
              <DropdownMenuSeparator />
              {!isNativeApp() && (
                <DropdownMenuItem onClick={() => navigate('/upgrade')} className="gap-2.5 text-sm cursor-pointer text-primary focus:text-primary">
                  <Zap className="w-4 h-4" />
                  Upgrade Plan
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2.5 text-sm cursor-pointer">
                  <ShieldCheck className="w-4 h-4" />
                  Admin Console
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => base44.auth.logout('/')} className="gap-2.5 text-sm cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-w-0',
            moreOpen ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="truncate w-full text-center">More</span>
        </button>
      </nav>

      <MoreMenuSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}