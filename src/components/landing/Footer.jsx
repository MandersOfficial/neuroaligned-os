import { Brain, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Community Forum', href: '/forum' },
    { label: 'Knowledge Base', href: '/knowledge' },
  ],
  Resources: [
    { label: 'Regulation First Framework™', href: '/regulation-first' },
    { label: 'Focus Modes', href: '/focus-modes' },
    { label: 'Burnout Dashboard', href: '/burnout' },
    { label: 'Integrations', href: '/integrations' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'mandawhite.com', href: 'https://mandawhite.com', external: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">NeuroAligned</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The operating system for neurodivergent entrepreneurs. Built on the Regulation First Framework™.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Created with</p>
              <a
                href="https://mandawhite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
              >
                Amanda White 🧠 <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-muted-foreground">CPD Certified AI Consultant · Neurodivergent Tech Bestie</p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {item.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : item.href.startsWith('/') ? (
                      <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Non-clinical notice */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            <strong className="text-foreground/60">Disclaimer:</strong> NeuroAligned is a productivity tool, not a medical or mental health service. Content is informational only and not a substitute for professional medical or psychological advice. See our{' '}
            <Link to="/disclaimer" className="text-primary hover:underline">full disclaimer</Link>.
            Results are not guaranteed and vary by individual. See{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
            for FTC disclosures.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NeuroAligned · In partnership with{' '}
            <a href="https://mandawhite.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Amanda White</a>.
            Built with love by neurodivergent entrepreneurs. 🧠
          </p>
          <p className="text-xs text-muted-foreground">
            Educate. Empower. Elevate.
          </p>
        </div>
      </div>
    </footer>
  );
}