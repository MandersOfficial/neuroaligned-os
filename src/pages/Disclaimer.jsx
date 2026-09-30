import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base text-foreground hidden sm:block">NeuroAligned</span>
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">Disclaimer</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Disclaimer</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: May 2026</p>
        </div>

        {[
          {
            icon: Shield,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
            title: 'Not a Medical or Mental Health Service',
            content: `NeuroAligned is a productivity and self-management tool — not a medical device, healthcare provider, therapist, or clinical service.

The content on NeuroAligned, including but not limited to the Regulation First Framework™, knowledge base articles, AI-generated guidance, check-in tools, and burnout monitoring, is provided for informational and educational purposes only.

Nothing on NeuroAligned constitutes medical advice, psychological advice, diagnosis, treatment, or therapy. No clinician-patient relationship is formed by using this platform.

Always consult a qualified and licensed healthcare professional for medical, psychological, or psychiatric concerns. Do not delay seeking professional help because of anything you read or experience on NeuroAligned.

If you are experiencing a mental health emergency:
• US National Crisis Hotline: 988 (call or text)
• Crisis Text Line: Text HOME to 741741
• NAMI Helpline: 1-800-950-6264`,
          },
          {
            icon: AlertTriangle,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40',
            title: 'HIPAA Notice',
            content: `NeuroAligned is NOT a covered entity or business associate under the Health Insurance Portability and Accountability Act (HIPAA).

Neurotype information you share (e.g. "I have ADHD") is self-reported personalisation data you choose to provide — it is not protected health information (PHI) under HIPAA and is not processed as such.

NeuroAligned does not store, transmit, or process clinical health records, medical diagnoses, or treatment data. We do not interface with any healthcare systems or electronic medical records.`,
          },
          {
            icon: Shield,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40',
            title: 'FTC Disclosure — Results & Earnings',
            content: `In compliance with the Federal Trade Commission (FTC) 16 CFR Part 255 guidelines on endorsements and testimonials:

Results Disclaimer: Testimonials, reviews, and success stories displayed on NeuroAligned represent individual experiences. Results are not typical and are not guaranteed. Your results will vary based on your personal neurotype, effort, consistency, life circumstances, and other factors beyond our control.

No Income or Productivity Guarantees: NeuroAligned makes no representations or guarantees regarding specific productivity gains, business outcomes, or financial results from using this platform.

Material Connections: Any material relationships between NeuroAligned, Amanda White (mandawhite.com), community partners, or featured individuals are disclosed. Amanda White is a collaborator and co-creator of NeuroAligned. Content from or about Amanda White reflects a material relationship.

Affiliate Disclosure: NeuroAligned may contain links to third-party products or services. If we earn a commission on purchases made through such links, this will be disclosed in the relevant content.`,
          },
          {
            icon: Shield,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40',
            title: 'Informational Content',
            content: `The Regulation First Framework™, knowledge base articles, and educational content on NeuroAligned are written based on publicly available neuroscience research, lived neurodivergent experience, and educational best practices.

This content is:
• Intended to inform and empower, not to diagnose or treat
• Not peer-reviewed clinical research
• Not a substitute for formal assessment or therapeutic intervention
• Subject to change as understanding of neurodivergence evolves

We make reasonable efforts to ensure content is accurate but make no warranty as to completeness, accuracy, or fitness for any particular purpose.`,
          },
          {
            icon: Shield,
            color: 'text-foreground',
            bg: 'bg-card border-border/50',
            title: 'Third-Party Links',
            content: `NeuroAligned may contain links to third-party websites, including mandawhite.com, Skool communities, and external resources. These links are provided for convenience and informational purposes.

We are not responsible for the content, accuracy, privacy practices, or terms of third-party websites. Linking to a resource does not constitute endorsement.`,
          },
        ].map(item => (
          <section key={item.title} className={`border rounded-2xl p-6 space-y-3 ${item.bg}`}>
            <div className="flex items-start gap-3">
              <item.icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
              <h2 className="font-display font-semibold text-lg text-foreground">{item.title}</h2>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-8">{item.content}</div>
          </section>
        ))}

        <p className="text-xs text-muted-foreground text-center">
          Questions? Contact us at <a href="mailto:legal@neuroaligned.app" className="text-primary hover:underline">legal@neuroaligned.app</a>
        </p>
      </main>
    </div>
  );
}