import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By creating an account or using NeuroAligned, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.

We may update these Terms periodically. We will notify you of material changes via email or in-app notice at least 14 days before changes take effect. Continued use after the effective date constitutes acceptance of the updated Terms.`,
  },
  {
    title: '2. Description of Service',
    content: `NeuroAligned is a productivity and wellness platform designed for neurodivergent entrepreneurs. Features include energy-aware task management, focus modes, burnout risk monitoring, AI guidance, journal tools, a knowledge base, and community forum.

NeuroAligned is operated in collaboration with Amanda White (mandawhite.com), CPD Certified AI Consultant and neurodivergent entrepreneur.

Features available to you depend on your subscription plan.`,
  },
  {
    title: '3. Not a Medical or Therapeutic Service',
    content: `IMPORTANT DISCLAIMER — PLEASE READ CAREFULLY:

NeuroAligned is NOT a medical device, mental health service, therapy platform, or clinical tool. It is a productivity and self-management application.

• NeuroAligned does not provide medical advice, diagnosis, or treatment.
• Content within NeuroAligned (including the Regulation First Framework™, Knowledge Base articles, and AI guidance) is informational and educational only.
• Nothing in NeuroAligned should be construed as a substitute for professional medical, psychological, psychiatric, or therapeutic advice.
• Use of NeuroAligned does not create a doctor-patient, therapist-client, or any clinical relationship.

If you are experiencing a mental health crisis, please contact a qualified healthcare professional or a crisis helpline. In the US: NAMI Helpline 1-800-950-6264 · Crisis Text Line: text HOME to 741741.`,
  },
  {
    title: '4. Subscription Plans & Billing',
    content: `NeuroAligned offers two paid plans:

Starter — $30/month
• Energy-aware task management
• Focus mode presets
• Burnout risk dashboard
• Basic regulation tools
• Knowledge base access
• Community forum

Pro — $50/month
• Everything in Starter, plus:
• Unlimited customisable focus modes
• AI-powered daily guidance & context capture
• Advanced burnout analytics
• Calendar & email integration
• Priority community support

Both plans include a 14-day free trial. You will not be charged during the trial. After the trial, your chosen plan renews automatically each month until cancelled. You may cancel at any time from your account settings; cancellation takes effect at the end of the current billing period.

All prices are in USD.`,
  },
  {
    title: '5. Free Trial',
    content: `New users are eligible for one 14-day free trial. The trial provides access to the plan you selected. We may require payment details to start a trial and will only charge you after the trial ends if you have not cancelled.

One trial per person and per household. Creating multiple accounts to obtain additional trials is prohibited.`,
  },
  {
    title: '6. Refund Policy',
    content: `We offer a 30-day money-back guarantee on your first subscription payment. If you are not satisfied within the first 30 days of your paid subscription, contact us at support@neuroaligned.com for a full refund.

Subsequent payments are non-refundable except where required by applicable law. We do not offer prorated refunds for partial months.

To request a refund, email support@neuroaligned.com with your account email and reason. We will process eligible refunds within 5–10 business days.`,
  },
  {
    title: '7. FTC Disclosure — Results & Testimonials',
    content: `In compliance with Federal Trade Commission (FTC) guidelines on endorsements and testimonials:

• Testimonials and reviews displayed on NeuroAligned reflect individual experiences and are not guaranteed to represent typical results.
• Individual results vary based on personal effort, neurotype, circumstances, and other factors. NeuroAligned makes no guarantees of specific productivity, income, or health outcomes.
• Any material connections between NeuroAligned, Amanda White, or featured individuals are disclosed.
• NeuroAligned is not a "get rich quick" or income-generating scheme. It is a productivity tool.`,
  },
  {
    title: '8. Acceptable Use',
    content: `You agree not to:

• Use NeuroAligned for any unlawful purpose or in violation of any regulations.
• Upload or share content that is abusive, discriminatory, harassing, or harmful to other users.
• Impersonate another person or provide false identity information.
• Attempt to gain unauthorised access to any part of the platform or other users' accounts.
• Reverse-engineer, copy, scrape, or create derivative works of NeuroAligned's software or content.
• Use the platform in any way that could damage, disable, overburden, or impair our services.
• Use the platform to send spam or unsolicited commercial communications.`,
  },
  {
    title: '9. User Content',
    content: `You retain ownership of all content you create in NeuroAligned (tasks, notes, journal entries, community posts, etc.).

By posting content in the community forum, you grant NeuroAligned a non-exclusive, royalty-free licence to display that content to other registered users for the purpose of providing the community feature.

You are responsible for ensuring your content does not violate third-party rights or applicable laws. We reserve the right to remove content that violates these Terms or our community guidelines.`,
  },
  {
    title: '10. Intellectual Property',
    content: `NeuroAligned, the Regulation First Framework™, and all associated content, features, and functionality are owned by NeuroAligned and its collaborators (including Amanda White) and are protected by copyright, trademark, and other intellectual property laws.

Nothing in these Terms grants you ownership of any NeuroAligned intellectual property. You may not use our trademarks or branding without written permission.`,
  },
  {
    title: '11. Privacy',
    content: `Your use of NeuroAligned is also governed by our Privacy Policy, which is incorporated into these Terms by reference. The Privacy Policy explains how we collect, use, and protect your personal data in compliance with applicable US privacy law and FTC guidelines.`,
  },
  {
    title: '12. Disclaimer of Warranties',
    content: `NeuroAligned is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

We do not guarantee that the service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not guarantee any particular outcome from use of the platform.

NeuroAligned is a productivity tool and is not a substitute for professional medical, psychological, or therapeutic advice or treatment.`,
  },
  {
    title: '13. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, NeuroAligned and its collaborators (including Amanda White) shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service, including but not limited to loss of data, loss of profits, or personal injury.

Our total aggregate liability to you for any claim arising out of these Terms or your use of NeuroAligned shall not exceed the total amount you paid to us in the 12 months preceding the claim.

Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for consequential damages, so the above limitations may not apply to you.`,
  },
  {
    title: '14. Termination',
    content: `We reserve the right to suspend or terminate your account if you violate these Terms or engage in conduct we determine is harmful to other users or the platform. You will be notified of termination where practicable.

You may delete your account at any time from your account settings. Upon termination, your right to use NeuroAligned ceases immediately. We will handle your data as described in our Privacy Policy.`,
  },
  {
    title: '15. Dispute Resolution & Governing Law',
    content: `These Terms are governed by and construed in accordance with the laws of the United States and the State of Nevada, without regard to its conflict of law provisions.

For any dispute, both parties agree to first attempt to resolve it through good-faith negotiation (30 days). If unresolved, disputes shall be submitted to binding arbitration in accordance with the American Arbitration Association rules, except that either party may seek injunctive relief in a court of competent jurisdiction.

You agree to resolve disputes individually and waive the right to participate in class action lawsuits or class-wide arbitration.`,
  },
  {
    title: '16. Contact',
    content: `Questions about these Terms? Contact us:

Email: legal@neuroaligned.com
Support: support@neuroaligned.com
General: hello@neuroaligned.com

NeuroAligned — In partnership with Amanda White (mandawhite.com)
2026`,
  },
];

export default function Terms() {
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
          <span className="text-sm text-muted-foreground">Terms of Service</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: May 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            These Terms of Service govern your use of NeuroAligned. Please read them carefully before using the platform. By using NeuroAligned, you agree to be bound by these Terms.
          </p>

          <div className="mt-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              <strong>Not a Medical Service:</strong> NeuroAligned is a productivity platform. It does not provide medical advice, diagnosis, or treatment. See Section 3 for full disclaimer. For mental health crises, please contact a qualified healthcare professional.
            </p>
          </div>
        </div>

        <div className="space-y-6">
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