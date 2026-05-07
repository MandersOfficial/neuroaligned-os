import { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { Calendar, Mail, Video, Zap, Brain, Clock, Coffee, CheckCircle2, ArrowRight, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AutoBreakScheduler from '../components/integrations/AutoBreakScheduler';
import ContextCapture from '../components/integrations/ContextCapture';

const INTEGRATIONS = [
  {
    id: 'googlecalendar',
    connectorId: '69fd1ec20e0e670e38251275',
    icon: Calendar,
    name: 'Google Calendar',
    description: 'Auto-schedule breaks between meetings based on your real calendar',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    features: ['Auto-break detection', 'Meeting buffer suggestions', 'Energy-aware scheduling'],
  },
  {
    id: 'gmail',
    connectorId: '69fd1ff7759e80cf1cc1e1e9',
    icon: Mail,
    name: 'Gmail',
    description: 'AI reads your emails to add rich context directly to your tasks',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    features: ['Email → Task context', 'Client email summaries', 'Action item extraction'],
  },
  {
    id: 'googlemeet',
    connectorId: '69fd203fe5416ec116a6593a',
    icon: Video,
    name: 'Google Meet',
    description: 'Join and manage meetings directly from your workspace',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    features: ['Quick-join meeting links', 'Meeting prep reminders', 'Post-meeting task creation'],
  },
];

function IntegrationCard({ integration }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const url = await base44.connectors.connectAppUser(integration.connectorId);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnected(true);
        setLoading(false);
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await base44.connectors.disconnectAppUser(integration.connectorId);
    } catch {
      // ignore if no active connection
    }
    setConnected(false);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border ${integration.border} rounded-2xl p-5 space-y-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${integration.bg} flex items-center justify-center`}>
            <integration.icon className={`w-5 h-5 ${integration.color}`} />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{integration.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
          connected
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-secondary text-muted-foreground border-border'
        }`}>
          {connected ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      <ul className="space-y-1.5">
        {integration.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${connected ? 'text-green-500' : 'text-muted-foreground/40'}`} />
            {f}
          </li>
        ))}
      </ul>

      {loading ? (
        <div className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting…
        </div>
      ) : connected ? (
        <button
          onClick={handleDisconnect}
          className="w-full py-2.5 rounded-xl text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
        >
          Disconnect {integration.name}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Connect {integration.name}
        </button>
      )}
    </motion.div>
  );
}

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect your tools so NeuroAligned can work where you already do.</p>
          </div>

          {/* Connection Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS.map((int) => (
              <IntegrationCard key={int.id} integration={int} />
            ))}
          </div>

          {/* Feature Tabs */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="flex border-b border-border/40">
              {[
                { id: 'overview', label: 'Overview', icon: Zap },
                { id: 'breaks', label: 'Auto-Break Scheduler', icon: Coffee },
                { id: 'capture', label: 'AI Context Capture', icon: Brain },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && <IntegrationsOverview onTabChange={setActiveTab} />}
              {activeTab === 'breaks' && <AutoBreakScheduler />}
              {activeTab === 'capture' && <ContextCapture />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function IntegrationsOverview({ onTabChange }) {
  return (
    <div className="space-y-5">
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex gap-3">
        <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Connect your Google tools above</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Link Google Calendar, Gmail, and Google Meet to unlock AI-powered scheduling, context capture, and meeting management — all tailored for neurodivergent workflows.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FeaturePreviewCard
          icon={Coffee}
          color="text-amber-500"
          bg="bg-amber-50"
          title="Auto-Break Scheduler"
          description="NeuroAligned reads your calendar and automatically suggests regulation breaks between back-to-back meetings — protecting your nervous system."
          bullets={['Detects meeting clusters', 'Suggests 5–15 min breaks', 'Syncs with Focus Modes']}
          action="Preview Scheduler"
          onClick={() => onTabChange('breaks')}
        />
        <FeaturePreviewCard
          icon={Sparkles}
          color="text-violet-500"
          bg="bg-violet-50"
          title="AI Context Capture"
          description="The AI scans relevant emails and calendar notes, then surfaces key context alongside your tasks — so you never lose the 'why' behind your work."
          bullets={['Email → task context links', 'Client name & deadline extraction', 'Meeting prep summaries']}
          action="Try Context Capture"
          onClick={() => onTabChange('capture')}
        />
      </div>
    </div>
  );
}

function FeaturePreviewCard({ icon: Icon, color, bg, title, description, bullets, action, onClick }) {
  return (
    <div className="border border-border/60 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      <ul className="space-y-1">
        {bullets.map(b => (
          <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> {b}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        {action} <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}