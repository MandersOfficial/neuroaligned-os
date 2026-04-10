import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By creating an account or using NeuroAligned, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services. We may update these Terms periodically; continued use constitutes acceptance of any changes.`,
  },
  {
    title: '2. Description of Service',
    content: `NeuroAligned is a productivity and wellness platform designed for neurodivergent entrepreneurs. Features include energy-aware task management, focus modes, burnout risk monitoring, AI guidance, a knowledge base, and community forum. Features available to you depend on your subscription plan.`,
  },
  {
    title: '3. Subscription Plans & Billing',
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

Both plans include a 14-day free trial. You will not be charged during the trial. After the trial, your chosen plan renews automatically each month until cancelled. You may cancel at any time from your account settings; cancellation takes effect at the end of the current billing period.`,
  },
  {
    title: '4. Free Trial',
    content: `New users are eligible for one 14-day free trial. The trial provides access to the plan you selected. We may require payment details to start a trial and will only charge you after the trial ends if you have not cancelled.`,
  },
  {
    title: '5. Refunds',
    content: `We offer a 30-day money-back guarantee on your first subscription payment. If you are not satisfied within the first 30 days of your paid subscription, contact us at support@neuroaligned.com for a full refund. Subsequent payments are non-refundable except where required by law.`,
  },
  {
    title: '6. Acceptable Use',
    content: `You agree not to:
• Use NeuroAligned for any unlawful purpose or in violation of any regulations.
• Upload or share content that is abusive, discriminatory, or harmful.
• Attempt to gain unauthorised access to any part of the platform or other users' accounts.
• Reverse-engineer, copy, or create derivative works of NeuroAligned's software.
• Use the platform in any way that could damage, disable, or impair our services.`,
  },
  {
    title: '7. User Content',
    content: `You retain ownership of all content you create in NeuroAligned (tasks, notes, community posts, etc.). By posting content in the community forum, you grant NeuroAligned a non-exclusive, royalty-free licence to display that content to other users. You are responsible for ensuring your content does not violate third-party rights or applicable laws.`,
  },
  {
    title: '8. Intellectual Property',
    content: `NeuroAligned and all its content, features, and functionality are owned by NeuroAligned Ltd and protected by copyright, trademark, and other intellectual property laws. Nothing in these Terms grants you ownership of any NeuroAligned intellectual property.`,
  },
  {
    title: '9. Disclaimer of Warranties',
    content: `NeuroAligned is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or suitable for any particular purpose. NeuroAligned is a productivity tool and is not a substitute for professional medical, psychological, or therapeutic advice.`,
  },
  {
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by law, NeuroAligned Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: '11. Termination',
    content: `We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time. Upon termination, your right to use NeuroAligned ceases immediately. We will handle your data as described in our Privacy Policy.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms are governed by and construed in accordance with applicable law. Any disputes will be resolved through good-faith negotiation first; if unresolved, through binding arbitration or courts of competent jurisdiction.`,
  },
  {
    title: '13. Contact',
    content: `Questions about these Terms? Contact us:

Email: legal@neuroaligned.com
NeuroAligned Ltd, 2026`,
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
          <p className="text-muted-foreground mt-2 text-sm">Last updated: April 2026</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            These Terms of Service govern your use of NeuroAligned. Please read them carefully before using the platform.
          </p>
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