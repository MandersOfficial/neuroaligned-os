import { Button } from "@/components/ui/button";
import { ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden opacity-100" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a0033 30%, #2d0060 55%, #0d1b6e 80%, #000820 100%)' }}>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(ellipse, rgba(120,40,200,0.35) 0%, rgba(30,60,180,0.2) 60%, transparent 100%)' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8">
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-2">
            <Brain className="w-8 h-8 text-primary" />
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-[hsl(var(--card-foreground))]">You're not lazy or broken.
You just need the right tool.

          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-[hsl(var(--foreground))]">Thousands of ADHD, autistic, and neurodivergent business owners use NeuroAligned to get more done — without burning out or fighting their own brain.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => base44.auth.redirectToLogin('/onboarding')} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group">
              Try It Free for 14 Days
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-sm text-[hsl(var(--foreground))]">Free trial · No credit card · Cancel anytime

          </p>
        </motion.div>
      </div>
    </section>);

}