import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, ExternalLink, MessageCircle, Facebook, Music } from 'lucide-react';

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    label: 'Messenger',
    description: 'Message Amanda directly — she personally replies to every message.',
    href: 'https://m.me/Mandersofficial',
    cta: 'Send a Message',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40',
  },
  {
    icon: Facebook,
    label: 'Facebook Page',
    description: 'Follow @mandersofficial for daily content, tips, and community updates.',
    href: 'https://www.facebook.com/Mandersofficial',
    cta: 'Visit Facebook',
    color: 'text-blue-700',
    bg: 'bg-blue-50/50 border-blue-200/60 dark:bg-blue-950/10 dark:border-blue-900/30',
  },
  {
    icon: Music,
    label: 'TikTok',
    description: 'Watch AI tutorials and neurodivergent entrepreneur content @amandadigitalmarketing.',
    href: 'https://www.tiktok.com/@amandadigitalmarketing',
    cta: 'Follow on TikTok',
    color: 'text-foreground',
    bg: 'bg-secondary border-border',
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block">NeuroAligned</span>
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">Contact</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <div className="space-y-3">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Get in Touch</h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            Have a question about NeuroAligned, a partnership inquiry, or just want to connect with the community? Reach out through any of the channels below.
          </p>
        </div>

        {/* Creator card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">🤝</div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-lg text-foreground">Amanda White</h2>
            <p className="text-sm text-muted-foreground">Your AI Neurodivergent Tech Bestie · CPD Certified AI Consultant</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Amanda personally reads every message. Whether you're struggling with the tech, want to collaborate, or simply want to be seen by someone who gets it — don't hesitate to reach out.
            </p>
            <a
              href="https://mandawhite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
            >
              mandawhite.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Contact channels */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg text-foreground">Contact Channels</h2>
          <div className="space-y-3">
            {CONTACT_CHANNELS.map(ch => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-sm ${ch.bg}`}
              >
                <ch.icon className={`w-5 h-5 shrink-0 ${ch.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{ch.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                </div>
                <span className="text-xs font-semibold text-primary shrink-0">{ch.cta} →</span>
              </a>
            ))}
          </div>
        </div>

        {/* Email contacts */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-base text-foreground">Email Contacts</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'General enquiries', email: 'hello@neuroaligned.com' },
              { label: 'Support', email: 'support@neuroaligned.com' },
              { label: 'Privacy & data requests', email: 'privacy@neuroaligned.com' },
              { label: 'Legal & compliance', email: 'legal@neuroaligned.com' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <a href={`mailto:${row.email}`} className="text-primary font-medium hover:underline">{row.email}</a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}