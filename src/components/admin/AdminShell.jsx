import { Link } from 'react-router-dom';
import { Brain, LayoutDashboard, ArrowLeft } from 'lucide-react';

const TABS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'users', label: 'User Management' },
  { id: 'moderation', label: 'Content Moderation' },
  { id: 'feedback', label: 'Feedback Sync' },
  { id: 'settings', label: 'Global Settings' },
];

export default function AdminShell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/60 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-sm text-foreground">Admin Console</span>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">Admin Only</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}