import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Analytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ heroImage }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    Analytics.heroCTAClicked();
    navigate('/onboarding');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">For ADHD, Autistic & neurodivergent business owners</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-[1.1]">
              <span className="text-foreground">A to-do app that </span>
              <span className="text-primary">fits your brain,</span>
              <span className="text-foreground"> not the other way around</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              NeuroAligned shows you the <strong className="text-foreground">right tasks at the right time</strong> — based on how much energy you have <em>right now</em>. No guilt. No overwhelm. Just work that actually gets done.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold group w-full sm:w-auto">
                Try It Free for 14 Days
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full px-8 py-6 text-base border-border/60 hover:bg-secondary w-full sm:w-auto">
                See How It Works
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-muted-foreground">
              Free 14-day trial · No credit card · Cancel anytime
            </p>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/30">
              <img
                src={heroImage}
                alt="NeuroAligned neural visualization representing neurodivergent brain patterns as beautiful constellations"
                className="w-full h-auto object-cover"
              />
              {/* Overlay card */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md rounded-2xl p-5 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse-soft" />
                  <span className="text-sm font-medium text-foreground">Energy Level: Creative Flow</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 rounded-full bg-primary/20">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">3 tasks aligned to your current state</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}