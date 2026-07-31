import { Shield, Lock, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DATA_POINTS = [
  {
    icon: Shield,
    title: 'Account & Profile Data',
    purpose: 'Your name, email, and self-reported neurotype preferences are used solely to personalise your productivity experience — matching tasks to your energy and work style.',
  },
  {
    icon: Calendar,
    title: 'Google Integrations',
    purpose: 'When you connect Google services, we request only the minimum scopes needed to sync deadlines to your Calendar, schedule focus sessions, and generate documents — never for advertising or resale.',
  },
  {
    icon: Lock,
    title: 'Encrypted & Never Sold',
    purpose: 'All data is encrypted in transit and at rest. We never sell your personal data to third parties, and you can disconnect any integration or delete your account at any time.',
  },
];

export default function DataPrivacySection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Privacy & Data Transparency</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
            Your data works for you — never against you
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            NeuroAligned is built for neurodivergent entrepreneurs who deserve radical transparency about how their data is used. Here's exactly what we collect and why.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {DATA_POINTS.map(({ icon: Icon, title, purpose }) => (
            <div
              key={title}
              className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{purpose}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Read Our Privacy Policy
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/terms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Terms of Service
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8 max-w-3xl mx-auto leading-relaxed">
          NeuroAligned complies with Google's Limited Use requirements. We do not transfer, sell, or use Google user data for advertising, retargeting, or any purpose other than providing the features you see in our interface.
        </p>
      </div>
    </section>
  );
}