import { useState } from 'react';

import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { Calendar, Mail, Zap, Brain, Clock, Coffee, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AutoBreakScheduler from '../components/integrations/AutoBreakScheduler';
import ContextCapture from '../components/integrations/ContextCapture';

const INTEGRATIONS = [
  {
    id: 'googlecalendar',
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
    icon: Mail,
    name: 'Gmail',
    description: 'AI reads your emails to add rich context directly to your tasks',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    features: ['Email → Task context', 'Client email summaries', 'Action item extraction'],
  },
];

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | breaks | capture

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Header */}
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect your tools so NeuroAligned can work where you already do.</p>
          </div>

          {/* Connection Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {INTEGRATIONS.map((int) => (
              <motion.div
                key={int.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border ${int.border} rounded-2xl p-5 space-y-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${int.bg} flex items-center justify-center`}>
                      <int.icon className={`w-5 h-5 ${int.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{int.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{int.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    Coming Soon
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {int.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-secondary text-muted-foreground cursor-not-allowed opacity-60 border border-border"
                >
                  Connect {int.name}
                </button>
              </motion.div>
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
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Google integrations coming soon</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Connect your Google Calendar and Gmail when ready. Below you can preview exactly what each feature will do — and even use the manual versions right now.
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