import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, ExternalLink, Heart, Zap, Shield, Users } from 'lucide-react';

const REGULATION_PILLARS = [
  {
    emoji: '🧠',
    title: 'Regulation Before Productivity',
    description: 'You cannot think, plan, or execute well from a dysregulated nervous system. Regulation is not a luxury — it is the prerequisite to everything else.',
  },
  {
    emoji: '⚡',
    title: 'Energy-Aware Work Design',
    description: 'Neurodivergent entrepreneurs have variable energy, not consistent 9-to-5 capacity. Your systems must adapt to you — not the other way around.',
  },
  {
    emoji: '🌱',
    title: 'Sustainable Over Optimal',
    description: 'Hyperfocus sprints feel productive until they cause a crash. The goal is sustainable output over time — not heroic peak performance followed by collapse.',
  },
  {
    emoji: '🛡️',
    title: 'Masking Costs Real Energy',
    description: 'Every minute spent performing neurotypicality costs energy you could spend building your business. NeuroAligned helps you unmask in your workflow.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block">NeuroAligned</span>
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">About</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {/* Creator section */}
        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                🧠 Neurodivergent & Proud
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground leading-tight">
                Built by a Neurodivergent Brain,<br />
                <span className="text-primary">for Neurodivergent Brains.</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                NeuroAligned was created in partnership with <strong className="text-foreground">Amanda White</strong> — CPD Certified AI Consultant, Vibe Code Specialist, and neurodivergent entrepreneur from Northern Nevada — whose mission is helping non-tech and neurodivergent entrepreneurs conquer the digital economy using AI.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Amanda went from pharmacy technician to full-time entrepreneur, CPD Certified Instructor, and Admin at The Digital Front Porch Academy. Her neurodivergent brain — once a perceived limitation — became her greatest asset.
              </p>
              <a
                href="https://mandawhite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Visit mandawhite.com <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="bg-card border border-border/60 rounded-3xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">🤝</div>
              <h3 className="font-display font-bold text-lg text-foreground">Amanda White</h3>
              <p className="text-sm text-muted-foreground">Your AI Neurodivergent Tech Bestie</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                {[
                  '✅ CPD Certified AI Consultant',
                  '✅ CPD Certified Instructor',
                  '✅ CPD Vibe Code Specialist',
                  '✅ Certified Funnel Builder (Systeme.io)',
                  '✅ Admin, The Digital Front Porch Academy',
                  '✅ 4K+ Followers · 2.1K Community',
                ].map(cred => (
                  <p key={cred} className="font-medium text-foreground/80">{cred}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href="https://www.facebook.com/Mandersofficial" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">Facebook</a>
                <span className="text-border">·</span>
                <a href="https://www.tiktok.com/@amandadigitalmarketing" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">TikTok</a>
                <span className="text-border">·</span>
                <a href="https://www.skool.com/thedigitalfrontporch/about?ref=a6d5625d6643443496d1da9265678cce" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">Skool Community</a>
                <span className="text-border">·</span>
                <a href="https://beacons.ai/aitechbestie" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">Shop</a>
              </div>
            </div>
          </div>
        </section>

        {/* Regulation First Framework */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-full text-xs font-semibold">
              🧬 Our Core Philosophy
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              The Regulation First Framework™
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Most productivity systems were designed for neurotypical brains. They assume consistent energy, linear focus, and emotional neutrality. NeuroAligned starts from a completely different premise: <strong className="text-foreground">regulation comes before productivity.</strong>
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The <strong className="text-foreground">Regulation First Framework™</strong> is built on neuroscience: your prefrontal cortex — the seat of planning, focus, and executive function — literally cannot perform when your nervous system is in a threat state. Trying to force productivity while dysregulated is like driving with the handbrake on.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For neurodivergent entrepreneurs, dysregulation isn't rare — it can be the default state after years of masking, late diagnoses, and building businesses in systems that weren't designed for us. The framework flips the script: <em>first regulate, then create.</em>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['Regulate First', 'Then Plan', 'Then Execute', 'Rest Without Guilt'].map(step => (
                <span key={step} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {REGULATION_PILLARS.map(pillar => (
              <div key={pillar.title} className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
                <span className="text-2xl">{pillar.emoji}</span>
                <h3 className="font-semibold text-sm text-foreground">{pillar.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="bg-primary/5 border border-primary/15 rounded-3xl p-8 sm:p-10 text-center space-y-5">
          <span className="text-4xl">🧠</span>
          <h2 className="font-display font-bold text-2xl text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            To build the operating system that neurodivergent entrepreneurs deserve — one that honours how their brains actually work, removes the shame around needing different systems, and makes sustainable success possible without burning out first.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">NeuroAligned is not a generic productivity app.</strong> It is infrastructure for a different kind of brain — built with lived experience, backed by neuroscience, and designed to help you earn a living on your own terms.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {['Educate', 'Empower', 'Elevate'].map(v => (
              <span key={v} className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold">{v}</span>
            ))}
          </div>
        </section>

        {/* Non-clinical notice */}
        <section className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-2xl p-6 space-y-2">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Important Notice</h3>
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                NeuroAligned is a productivity and self-management platform. It is <strong>not</strong> a medical device, mental health service, therapy platform, or clinical tool. The content and features of NeuroAligned are informational and educational only and are not a substitute for professional medical, psychological, or psychiatric advice, diagnosis, or treatment. Always consult a qualified healthcare professional for mental health concerns.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}