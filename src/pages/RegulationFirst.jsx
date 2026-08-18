import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@/lib/analytics';

const STAGES = [
  {
    step: '01',
    emoji: '🌊',
    title: 'Assess Your Nervous System State',
    description: 'Before you open your task list, check in with your nervous system. Are you regulated, hyper-aroused, or shut down? Your answer determines your capacity for the next 90 minutes — not your to-do list.',
    tools: ['Brain Check-In', 'Energy Selector', 'Burnout Risk Gauge'],
  },
  {
    step: '02',
    emoji: '🧘',
    title: 'Regulate First (if needed)',
    description: 'If dysregulated, regulation is your first task. Not a luxury. Not self-indulgence. The most productive thing you can do in the next 10 minutes is bring your nervous system online so your prefrontal cortex can function.',
    tools: ['Box Breathing', 'Grounding Tools', 'Sensory Regulation'],
  },
  {
    step: '03',
    emoji: '⚡',
    title: 'Match Work to Current Energy',
    description: 'Regulated doesn\'t mean hyperfocused. Energy-aware task design means matching the demand of work to your actual current capacity — not your ideal capacity. Deep work when you\'re in flow. Admin when you\'re sluggish.',
    tools: ['Focus Modes', 'Energy Filter', 'Task Queue'],
  },
  {
    step: '04',
    emoji: '🔁',
    title: 'Build in Recovery as Standard',
    description: 'Recovery is not a reward for productivity. It is a structural requirement. Neurodivergent brains need deliberate decompression between intense tasks, not just at the end of a collapse.',
    tools: ['Break Reminders', 'Focus Room Cooldown', 'Regulation Widget'],
  },
  {
    step: '05',
    emoji: '📊',
    title: 'Track Without Shame',
    description: 'Notice patterns over time. When do you crash? What triggers dysregulation? What conditions produce your best work? The data is for your self-understanding — not self-judgment.',
    tools: ['Productivity Trends', 'Journal', 'Burnout Dashboard'],
  },
];

const MYTHS = [
  { myth: 'You need to push through to be productive.', truth: 'Pushing through a dysregulated state burns energy without results. Regulate first, produce faster.' },
  { myth: 'Rest is for when the work is done.', truth: 'For ND brains, rest is how the work gets done. Scheduled rest prevents unscheduled collapse.' },
  { myth: 'Consistency means doing the same thing every day.', truth: 'Consistency for ND entrepreneurs means showing up to your work in whatever form your brain allows that day.' },
  { myth: 'You\'re lazy if you can\'t start tasks.', truth: 'Task initiation is an executive function — neurological, not moral. The fix is strategy, not willpower.' },
];

export default function RegulationFirst() {
  const navigate = useNavigate();

  useEffect(() => { Analytics.regulationPageViewed(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block">NeuroAligned</span>
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">Regulation First Framework™</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {/* Hero */}
        <section className="space-y-5 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
            🧬 Core Philosophy
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-foreground leading-tight">
            The Regulation First<br />
            <span className="text-primary">Framework™</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Most productivity systems were built for neurotypical brains. They assume consistent energy, linear focus, and emotional neutrality. NeuroAligned starts from a completely different premise.
          </p>
          <p className="text-foreground font-semibold text-xl">
            Regulation is not optional. It is the foundation.
          </p>
        </section>

        {/* The science */}
        <section className="bg-card border border-border/60 rounded-3xl p-8 sm:p-10 space-y-5">
          <h2 className="font-display font-bold text-2xl text-foreground">The Neuroscience Behind It</h2>
          <p className="text-muted-foreground leading-relaxed">
            When your nervous system is in a threat or stress response — even a low-grade one — your brain redirects resources away from the prefrontal cortex (PFC) and toward survival circuits. The PFC is where executive function lives: planning, decision-making, working memory, task initiation.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For neurodivergent people, the baseline threshold for entering a stress response is often lower, the recovery time is longer, and the masking required to function in neurotypical environments consumes enormous cognitive load even when you feel "fine."
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Trying to be productive from this state is like trying to run software on a computer with insufficient RAM.</strong> You can force it — but it will be slow, crash often, and cause long-term damage to the system.
          </p>
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/15 text-sm text-foreground font-medium text-center">
            "Regulate the nervous system first. Then the brain can do the work it's actually capable of."
          </div>
        </section>

        {/* 5-Stage Framework */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-foreground">The 5-Stage Framework</h2>
          <div className="space-y-4">
            {STAGES.map((stage, i) => (
              <div key={stage.step} className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">{stage.emoji}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary">STEP {stage.step}</span>
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {stage.tools.map(tool => (
                        <span key={tool} className="text-[10px] bg-secondary px-2.5 py-1 rounded-full text-muted-foreground font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Myths */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-foreground">Myths This Framework Replaces</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {MYTHS.map((item, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Myth</p>
                  <p className="text-sm text-muted-foreground italic">"{item.myth}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Reality</p>
                  <p className="text-sm text-foreground leading-relaxed">{item.truth}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Credit + CTA */}
        <section className="bg-primary/5 border border-primary/15 rounded-3xl p-8 sm:p-10 space-y-5 text-center">
          <span className="text-4xl">🧠</span>
          <h2 className="font-display font-bold text-2xl text-foreground">Built by Neurodivergent Entrepreneurs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Regulation First Framework™ was developed in collaboration with <strong className="text-foreground">Amanda White</strong> — neurodivergent entrepreneur, CPD Certified AI Consultant, and founder of the Digital Front Porch community — whose lived experience shapes every feature of NeuroAligned.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { Analytics.regulationCTAClicked('try_free'); navigate('/onboarding'); }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Try NeuroAligned Free
            </button>
            <a
              href="https://mandawhite.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => Analytics.regulationCTAClicked('amanda_link')}
              className="border border-border bg-card text-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
            >
              Learn more from Amanda <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          NeuroAligned is a productivity tool, not a clinical resource. The Regulation First Framework™ is educational content drawn from publicly available neuroscience and is not a substitute for professional mental health care.
        </p>
      </main>
    </div>
  );
}