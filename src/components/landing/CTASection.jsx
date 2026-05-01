import { Button } from "@/components/ui/button";
import { ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-foreground/75 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-2">
            <Brain className="w-8 h-8 text-primary" />
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-background tracking-tight leading-tight">
            You're not lazy or broken.<br />
            <span className="text-primary">You just need the right tool.</span>
          </h2>

          <p className="text-background/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Thousands of ADHD, autistic, and neurodivergent business owners use NeuroAligned to get more done — without burning out or fighting their own brain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => base44.auth.redirectToLogin('/onboarding')} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group">
              Try It Free for 14 Days
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-background/40 text-sm">
            Free trial · No credit card · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}