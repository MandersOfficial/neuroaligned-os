import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Shield, ShieldCheck, Trash2, Ban } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. About NeuroAligned & This Policy',
    content: `NeuroAligned is a productivity and self-management platform designed for neurodivergent entrepreneurs. It is operated in collaboration with Amanda White (mandawhite.com), CPD Certified AI Consultant and neurodivergent entrepreneur.

This Privacy Policy explains how NeuroAligned ("we", "us", "our") collects, uses, stores, and protects your personal data. By using NeuroAligned, you agree to the practices described here.

Last updated: May 2026`,
  },
  {
    title: '2. Important: Not a Healthcare Provider (HIPAA Notice)',
    content: `NeuroAligned is NOT a healthcare provider, covered entity, or business associate under the Health Insurance Portability and Accountability Act (HIPAA). We do not provide medical advice, diagnosis, treatment, or therapy.

Information you share about your neurotype (e.g. ADHD, Autism) is self-reported personal preference data used solely to personalise your productivity experience. It is NOT protected health information (PHI) under HIPAA.

If you are seeking mental health treatment, clinical diagnosis, or therapy, please consult a licensed healthcare professional. NeuroAligned is not a substitute for professional medical or psychological care.`,
  },
  {
    title: '3. Information We Collect',
    content: `We collect information you provide directly to us, including:

• Account information: your name, email address, and password when you create an account.
• Profile data: self-reported neurotype identifiers, work style preferences, business type, and energy patterns you voluntarily share during onboarding. This is productivity personalisation data, not medical data.
• Usage data: tasks, focus sessions, check-ins, journal entries, community posts, and other content you create within NeuroAligned.
• Device and technical data: browser type, IP address, device identifiers, and log data collected automatically when you use our services.
• Communications: messages you send to us via email or support channels.`,
  },
  {
    title: '4. How We Use Your Information',
    content: `We use your information to:

• Provide, maintain, and improve NeuroAligned's features and services.
• Personalise your experience based on your neurotype and energy patterns.
• Send you product updates, support messages, and trial/subscription notifications (you may opt out of marketing emails at any time).
• Conduct analytics to understand how our platform is used (aggregated and anonymised where possible).
• Comply with legal obligations.

FTC Disclosure: We will never sell your personal data to third parties. We do not use your neurotype information for advertising targeting. Any affiliate relationships or sponsorships within NeuroAligned are disclosed clearly and separately.

We do not use your data to make automated decisions that have legal or similarly significant effects on you.`,
  },
  {
    title: '5. Neurotype & Sensitive Data',
    content: `Neurotype information (e.g. ADHD, Autistic, Dyslexic) that you share is treated as sensitive personal data under applicable data protection laws. We apply additional safeguards:

• It is used solely to personalise your NeuroAligned productivity experience.
• It is never shared with third parties, advertisers, employers, insurers, or government agencies.
• You may update or delete this information at any time from your profile settings.
• We do not use neurotype data for advertising, profiling, or any purpose other than your personalisation.

Reminder: This data is self-reported and is not medical data. NeuroAligned does not store or process any clinical diagnoses.`,
  },
  {
    title: '6. Data Sharing',
    content: `We share your data only in these limited circumstances:

• Service providers: trusted third parties that help us operate NeuroAligned (e.g. cloud hosting, payment processors, email delivery) under strict data processing agreements. These providers are contractually prohibited from using your data for their own purposes.
• Legal compliance: when required by applicable law, court order, or government authority, we will disclose the minimum data required.
• Business transfers: if NeuroAligned is acquired or merged, your data may transfer to the acquiring entity, and you will be notified at least 30 days before transfer.
• Community content: content you voluntarily post in the community forum is visible to other registered users.

We do not sell, rent, or broker your personal data.`,
  },
  {
    title: '7. Google User Data & API Access',
    content: `NeuroAligned integrates with certain Google APIs (including Google Calendar, Google Tasks, Google Docs, Google Sheets, Google Slides, Gmail, and Google Meet) to provide productivity features such as calendar syncing, meeting scheduling, deadline tracking, and document generation.

How we access, use, store, and share Google user data:

• Access: When you connect a Google service, NeuroAligned requests only the minimum OAuth scopes necessary to provide the requested feature (e.g. calendar event read/write access to sync your project deadlines). You will see the exact scopes requested before granting access.

• Use: Google user data is used solely to provide or improve user-facing features visible in the NeuroAligned interface. For example, calendar event data is used to display your schedule, detect conflicts, and sync project deadlines. Gmail data (if applicable) is used only with your explicit consent for specific features you initiate.

• Storage: Google user data is processed in real-time to provide the requested features. We do not store raw Google API data beyond what is necessary to provide the feature (e.g. synced calendar event references for project deadline tracking). Any cached data is encrypted at rest.

• Limited Use: NeuroAligned complies with Google's Limited Use requirements. We do not transfer, sell, or use Google user data for advertising, retargeting, credit assessment, or any purpose other than providing the features you see in our interface. Google user data is not shared with third parties except as necessary to provide the feature you requested (e.g. our cloud hosting provider) or as required by law.

• Human Access: NeuroAligned personnel do not read your Google user data, except when necessary for security purposes (e.g. investigating abuse), to comply with applicable law, or when you have given affirmative consent for support purposes.

• Data Deletion: When you disconnect a Google service or delete your NeuroAligned account, we revoke our access tokens and delete any cached Google data within 30 days, except where retention is required by law.

• Scope Justification: NeuroAligned requests only the narrowest scopes needed for each feature. For example:
  - Google Calendar (calendar.events): Used to create focus session events, schedule project meetings, sync deadline reminders, and list upcoming meetings so users can manage their schedule within NeuroAligned.
  - Google Tasks (task lists): Used to sync project deadlines to your Google Tasks so you can track them alongside other tasks.
  - Google Docs/Sheets/Slides: Used to generate and store productivity documents (e.g. meeting summaries, pitch decks, project reports) that you explicitly create through NeuroAligned.

You can disconnect any Google integration at any time from Settings → Integrations, which revokes our access immediately.`,
  },
  {
    title: '8. FTC Compliance & Endorsements',
    content: `In compliance with the Federal Trade Commission (FTC) guidelines:

• Any testimonials, reviews, or results shared on NeuroAligned's platform or marketing materials reflect individual experiences. Results are not guaranteed and may vary.
• Where we feature user testimonials, those users may have received early access or other consideration. This will be disclosed.
• NeuroAligned does not guarantee specific productivity or income outcomes.
• Any material connections between NeuroAligned and featured individuals (including Amanda White) are disclosed clearly.`,
  },
  {
    title: '9. Data Retention',
    content: `We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain it longer (e.g. financial records, legal disputes).

Journal entries, check-in data, and productivity logs are deleted within 30 days of account deletion.`,
  },
  {
    title: '10. Your Rights',
    content: `Depending on your location, you may have rights including:

• Access: request a copy of the personal data we hold about you.
• Correction: update inaccurate or incomplete data.
• Deletion: request we delete your data ("right to be forgotten").
• Portability: receive your data in a machine-readable format.
• Objection / Opt-out: object to certain processing activities or marketing communications.
• Non-discrimination: we will not discriminate against you for exercising your privacy rights.

California residents may have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete, and the right to opt out of sale (we do not sell data).

To exercise any of these rights, contact us at privacy@neuroaligned.com. We will respond within 30 days.`,
  },
  {
    title: '11. Cookies & Tracking',
    content: `We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies or tracking pixels.

We may use analytics tools (e.g. aggregated session data) to understand product usage. This data is anonymised and not linked to your personal identity.

You may disable cookies in your browser settings, though this may affect platform functionality.`,
  },
  {
    title: '12. Security',
    content: `We use industry-standard encryption (TLS/SSL) for data in transit and encryption at rest for stored data. Access to personal data is restricted to authorised personnel only under strict access controls.

We conduct periodic security reviews. However, no internet-based system is completely secure. We encourage you to use a strong, unique password and contact us immediately if you suspect unauthorised access to your account.

In the event of a data breach that affects your personal data, we will notify you within 72 hours as required by applicable law.`,
  },
  {
    title: '13. Children\'s Privacy',
    content: `NeuroAligned is intended for users aged 16 and older. We do not knowingly collect personal data from anyone under 16. If you are a parent or guardian and believe your child has provided personal data, contact us at privacy@neuroaligned.com and we will delete it promptly.`,
  },
  {
    title: '14. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or prominent in-app notice at least 14 days before changes take effect. Continued use of NeuroAligned after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    title: '15. Contact & Data Requests',
    content: `For privacy questions, data access requests, or to exercise your rights:

Email: privacy@neuroaligned.com
General: hello@neuroaligned.com
Legal: legal@neuroaligned.com

NeuroAligned — In partnership with Amanda White (mandawhite.com)
2026`,
  },
];

export default function Privacy() {
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
          <span className="text-sm text-muted-foreground">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: May 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            At NeuroAligned, your privacy and autonomy matter deeply — especially when you're sharing sensitive information about how your brain works. This policy explains how we collect, use, and protect your data. It has been written to comply with applicable US privacy law including relevant FTC guidelines and state privacy regulations.
          </p>

          {/* Non-HIPAA notice */}
          <div className="mt-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              <strong>Not a Healthcare Provider:</strong> NeuroAligned is a productivity platform, not a covered entity under HIPAA. Information about your neurotype is self-reported preference data, not protected health information. This platform is not a substitute for medical or mental health care.
            </p>
          </div>

          {/* Google Data Usage Disclosure — required for Google OAuth verification */}
          <div className="mt-6 bg-card border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/40">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              <div>
                <h2 className="font-display font-bold text-base text-foreground leading-tight">Google Data Usage Disclosure</h2>
                <p className="text-xs text-muted-foreground mt-0.5">How NeuroAligned accesses and uses your Google data</p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                NeuroAligned only uses your Google data to provide the features you see in our app. We do not use it for any other purpose.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                When you connect a Google service (Google Calendar, Google Tasks, Google Docs, Google Sheets, Google Slides, Gmail, or Google Meet), NeuroAligned requests only the minimum permission scopes needed to provide the feature you chose. You will always see the exact scopes requested before granting access.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 bg-green-50 dark:bg-green-950/20 rounded-xl p-3.5">
                  <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">What we do</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Display your calendar, schedule meetings, sync project deadlines, generate documents you create, and list upcoming events — all visible to you in the app.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl p-3.5">
                  <Ban className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">What we never do</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">No advertising, no retargeting, no selling data, no credit assessment, no transferring your Google data to third parties for any other purpose.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/60 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-foreground">Our commitments to you</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                  <li className="flex gap-2"><span className="text-foreground shrink-0">•</span><span><strong className="text-foreground">Limited Use compliant:</strong> NeuroAligned complies with Google's <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">Limited Use</a> requirements. We only use Google user data to provide or improve features you see in our interface.</span></li>
                  <li className="flex gap-2"><span className="text-foreground shrink-0">•</span><span><strong className="text-foreground">No human reading:</strong> NeuroAligned personnel do not read your Google data, except for security, legal compliance, or with your affirmative consent for support.</span></li>
                  <li className="flex gap-2"><span className="text-foreground shrink-0">•</span><span><strong className="text-foreground">Minimal storage:</strong> We process Google data in real-time and do not store raw API data beyond what is necessary to provide the feature (e.g. synced event references for deadline tracking). Cached data is encrypted at rest.</span></li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <div className="flex items-start gap-2.5 flex-1">
                  <Trash2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Revoke access anytime:</strong> Disconnect any Google integration from <span className="font-medium text-foreground">Settings → Integrations</span> to immediately revoke our access. Cached Google data is deleted within 30 days.
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
                Full details are in <a href="#google-data" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">Section 7 — Google User Data &amp; API Access</a> below.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section
              key={section.title}
              id={section.title.includes('Google User Data') ? 'google-data' : undefined}
              className="bg-card border border-border/50 rounded-2xl p-6 space-y-3 scroll-mt-24"
            >
              <h2 className="font-display font-semibold text-lg text-foreground">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}