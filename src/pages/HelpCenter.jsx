import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  HelpCircle, ChevronDown, ChevronUp, Search,
  Calendar, Video, Table, FileText, Presentation, Mail,
  ListTodo, FolderKanban, Plug, ShieldCheck, Lightbulb, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useDebouncedValue from '@/hooks/useDebouncedValue';

const FAQS = [
  {
    q: "I get a '400: redirect_uri_mismatch' error when connecting Google. How do I fix it?",
    a: "This error means the redirect URI Google received isn't listed in your Google Cloud Console OAuth client settings. The exact URI you need to add is shown in the error message — copy it, go to Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID, paste it under 'Authorized redirect URIs', and click Save. Changes can take up to 5 minutes to propagate.",
  },
  {
    q: "How do I connect my Google Calendar?",
    a: "Go to Integration Settings (or the Projects page), find Google Calendar, and click 'Connect'. You'll be redirected to Google to authorize access. Once approved, you can schedule meetings, create Meet links, and view upcoming events. The calendar.events.readonly and email scopes are requested.",
  },
  {
    q: "Can I sync project deadlines to ClickUp?",
    a: "Yes! Connect your ClickUp account from Integration Settings, then go to the Projects page and use the ClickUp sync panel. Select a ClickUp list, and all active projects with due dates will be synced as tasks.",
  },
  {
    q: "How do I generate a meeting summary?",
    a: "Connect Google Docs from Integration Settings, then go to Projects → Meeting Summary panel. Select a project and click 'Generate Summary' — it will create a Google Doc with AI-summarized notes.",
  },
  {
    q: "My Google integration was working but stopped. What happened?",
    a: "OAuth tokens can expire or be revoked. Go to Integration Settings, disconnect the tool, then reconnect it. If the issue persists, check that your Google Cloud Console OAuth client is still active and the redirect URIs are still listed.",
  },
  {
    q: "How do I disconnect a tool?",
    a: "Go to Integration Settings, find the tool you want to disconnect, and click 'Disconnect'. You can reconnect anytime.",
  },
  {
    q: "What does 'Google Meet' integration do?",
    a: "Connecting Google Meet allows you to create instant video meeting links directly from Projects. Click the video icon on any project to generate a Meet link.",
  },
  {
    q: "Can I sync data to Google Sheets?",
    a: "Yes! Connect Google Sheets from Integration Settings, go to Projects → Google Sheets panel, select a spreadsheet, and click 'Sync Projects'. Your project data will be exported as rows in the spreadsheet.",
  },
];

const GUIDES = [
  {
    title: 'Setting Up Google Calendar',
    description: 'Connect Google Calendar to sync deadlines and schedule meetings automatically.',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-500',
    steps: [
      'Go to Integration Settings and find Google Calendar.',
      'Click "Connect" — you\'ll be redirected to Google.',
      'Sign in and grant calendar.events.readonly + email permissions.',
      'Return to the app — the status will show "Connected".',
      'Use the Calendar Schedule or Deadline Call panels on the Projects page.',
    ],
    troubleshooting: [
      { problem: 'redirect_uri_mismatch error', solution: 'Add the redirect URI from the error message to Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs.' },
      { problem: 'Stuck on "Checking…"', solution: 'Refresh the page. If it persists, disconnect and reconnect.' },
    ],
  },
  {
    title: 'Setting Up ClickUp',
    description: 'Sync project deadlines as tasks into your ClickUp workspace.',
    icon: FolderKanban,
    color: 'bg-purple-50 text-purple-500',
    steps: [
      'Go to Integration Settings and find ClickUp.',
      'Click "Connect" and authorize with your ClickUp account.',
      'Go to Projects → ClickUp Sync panel.',
      'Select a ClickUp list from the dropdown.',
      'Click "Sync Deadlines" — active projects with due dates become ClickUp tasks.',
    ],
    troubleshooting: [
      { problem: 'No lists appear in dropdown', solution: 'Make sure you have at least one space and list in your ClickUp workspace.' },
      { problem: 'Sync fails with API error', solution: 'Check that your ClickUp plan allows API access and you have write permissions on the selected list.' },
    ],
  },
  {
    title: 'Setting Up Google Meet',
    description: 'Create instant video meeting links from projects.',
    icon: Video,
    color: 'bg-green-50 text-green-500',
    steps: [
      'Connect Google Calendar first — Meet links are created via Calendar.',
      'Go to any Project.',
      'Click the video icon to generate an instant Meet link.',
      'The link opens in a new tab and is saved to the room/project.',
    ],
    troubleshooting: [],
  },
  {
    title: 'Setting Up Google Sheets',
    description: 'Export project data to a spreadsheet for reporting.',
    icon: Table,
    color: 'bg-emerald-50 text-emerald-500',
    steps: [
      'Connect Google Sheets from Integration Settings.',
      'Go to Projects → Google Sheets panel.',
      'Select an existing spreadsheet from the dropdown.',
      'Click "Sync Projects" — project data is written as rows.',
      'Re-sync anytime to update with the latest data.',
    ],
    troubleshooting: [
      { problem: 'No spreadsheets appear', solution: 'Create a Google Sheet in your Drive first, then refresh the list.' },
    ],
  },
  {
    title: 'Setting Up Google Docs',
    description: 'Generate AI-powered meeting summaries as Google Docs.',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-500',
    steps: [
      'Connect Google Docs from Integration Settings.',
      'Go to Projects → Meeting Summary panel.',
      'Select a project from the dropdown.',
      'Click "Generate Summary" — a new Google Doc is created with AI-summarized notes.',
    ],
    troubleshooting: [],
  },
  {
    title: 'Setting Up Google Slides',
    description: 'Create pitch decks and presentations from your project data.',
    icon: Presentation,
    color: 'bg-amber-50 text-amber-500',
    steps: [
      'Connect Google Slides from Integration Settings.',
      'Go to Projects → Pitch Deck panel.',
      'Select a project and provide a template URL (optional).',
      'Click "Create Pitch Deck" — a new presentation is generated with project data.',
    ],
    troubleshooting: [],
  },
  {
    title: 'Setting Up Google Tasks',
    description: 'Sync project deadlines into your Google Tasks list.',
    icon: ListTodo,
    color: 'bg-yellow-50 text-yellow-500',
    steps: [
      'Connect Google Tasks from Integration Settings.',
      'Go to Projects → Google Tasks panel.',
      'Click "Sync Deadlines" — active projects with due dates are added as tasks.',
    ],
    troubleshooting: [],
  },
];

function FAQItem({ faq, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-4 pr-6">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuideCard({ guide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${guide.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{guide.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
              {/* Steps */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3" /> Setup Steps
                </p>
                <ol className="space-y-2">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Troubleshooting */}
              {guide.troubleshooting.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Troubleshooting
                  </p>
                  <div className="space-y-2">
                    {guide.troubleshooting.map((t, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                        <p className="text-xs font-semibold text-amber-700 mb-0.5">⚠ {t.problem}</p>
                        <p className="text-xs text-amber-600 leading-relaxed">{t.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  // Filter runs once typing pauses instead of on every keystroke
  const q = debouncedSearch.toLowerCase();
  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(q) ||
    f.a.toLowerCase().includes(q)
  );

  const filteredGuides = GUIDES.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.description.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-8">
          {/* Mobile back */}
          <button onClick={() => navigate(-1)} className="flex md:hidden items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Help Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Troubleshooting guides, setup tutorials, and FAQs for all your integrations.</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search guides and FAQs…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Quick link */}
          <Link
            to="/integration-settings"
            className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 hover:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Go to Integration Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect and manage all your productivity tools in one place.</p>
            </div>
          </Link>

          {/* Setup Guides */}
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground mb-3">Setup Tutorials</h2>
            <div className="space-y-3">
              {filteredGuides.length > 0 ? (
                filteredGuides.map(g => <GuideCard key={g.title} guide={g} />)
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No guides match your search.</p>
              )}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
            </h2>
            <div className="bg-card border border-border/60 rounded-2xl px-5">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((f, i) => <FAQItem key={i} faq={f} defaultOpen={i === 0 && !search} />)
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No FAQs match your search.</p>
              )}
            </div>
          </div>

          {/* Still need help? */}
          <div className="bg-card border border-border/60 rounded-2xl px-5 py-5 text-center">
            <p className="text-sm font-semibold text-foreground">Still need help?</p>
            <p className="text-xs text-muted-foreground mt-1">If you can't find an answer, reach out and we'll help you get set up.</p>
            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}