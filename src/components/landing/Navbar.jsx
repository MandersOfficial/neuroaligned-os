import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              NeuroAligned
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              Start Free Trial
            </Button>
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 text-xs">
              Free Trial
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  Sign In
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}