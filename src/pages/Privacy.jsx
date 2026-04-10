import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including:
• Account information: your name, email address, and password when you create an account.
• Profile data: neurotype identifiers, work style preferences, business type, and energy patterns you voluntarily share during onboarding.
• Usage data: tasks, focus sessions, burnout check-ins, community posts, and other content you create within NeuroAligned.
• Device and technical data: browser type, IP address, device identifiers, and log data collected automatically when you use our services.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to:
• Provide, maintain, and improve NeuroAligned's features and services.
• Personalise your experience based on your neurotype and energy patterns.
• Send you product updates, support messages, and trial/subscription notifications.
• Conduct analytics to understand how our platform is used (aggregated and anonymised where possible).
• Comply with legal obligations.

We will never sell your personal data to third parties. We do not use your neurotype information for advertising targeting.`,
  },
  {
    title: '3. Neurotype & Sensitive Data',
    content: `Neurotype information (e.g. ADHD, Autistic, Dyslexic) that you share is treated as sensitive personal data. We apply additional safeguards:
• It is used solely to personalise your NeuroAligned experience.
• It is never shared with third parties, advertisers, or employers.
• You may update or delete this information at any time from your profile settings.`,
  },
  {
    title: '4. Data Sharing',
    content: `We share your data only in these limited circumstances:
• Service providers: trusted third parties that help us operate NeuroAligned (e.g. hosting, analytics) under strict data processing agreements.
• Legal compliance: when required by law, court order, or government authority.
• Business transfers: if NeuroAligned is acquired, your data may transfer to the acquiring entity, and you will be notified.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain it longer.`,
  },
  {
    title: '6. Your Rights',
    content: `Depending on your location, you may have rights including:
• Access: request a copy of the personal data we hold about you.
• Correction: update inaccurate or incomplete data.
• Deletion: request we delete your data ("right to be forgotten").
• Portability: receive your data in a machine-readable format.
• Objection: object to certain processing activities.

To exercise any of these rights, contact us at privacy@neuroaligned.com.`,
  },
  {
    title: '7. Cookies',
    content: `We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies. You may disable cookies in your browser settings, though this may affect some features.`,
  },
  {
    title: '8. Security',
    content: `We use industry-standard encryption (TLS) for data in transit and at rest. Access to personal data is restricted to authorised personnel only. However, no system is completely secure — we encourage you to use a strong, unique password and enable any available two-factor authentication.`,
  },
  {
    title: '9. Children',
    content: `NeuroAligned is not directed at children under 16. We do not knowingly collect personal data from anyone under 16. If you believe we have collected such data, please contact us immediately.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or prominent notice within the app at least 14 days before changes take effect.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have questions about this Privacy Policy or your personal data:

Email: privacy@neuroaligned.com
Address: NeuroAligned Ltd, 2026`,
  },
];

export default function Privacy() {
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
          <span className="text-sm text-muted-foreground">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: April 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            At NeuroAligned, your privacy and autonomy matter deeply — especially when you're sharing sensitive information about how your brain works. This policy explains how we collect, use, and protect your data.
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section key={section.title} className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <h2 className="font-display font-semibold text-lg text-foreground">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}