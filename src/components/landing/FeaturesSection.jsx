import { motion } from 'framer-motion';
import { Battery, Brain, Shield, Sparkles, Route, HeartPulse } from 'lucide-react';

const features = [
  {
    icon: Battery,
    title: 'Tasks that match your energy',
    description: 'Tell us how you feel right now — focused, tired, or scattered — and we show you only the tasks that make sense. No more staring at a giant list and shutting down.',
    tag: 'Smart Tasks',
  },
  {
    icon: Brain,
    title: 'An AI that actually gets you',
    description: 'Our AI learns your patterns over time and gives you simple, personalized tips. It knows when to encourage you to push forward — and when to tell you to rest.',
    tag: 'AI Coach',
  },
  {
    icon: HeartPulse,
    title: 'Regulation-first framework',
    description: 'Before you see a single task, NeuroAligned OS helps you regulate your nervous system with built-in breathing exercises, sensory grounding tools, and body-doubling rooms. The regulation-first framework means calm comes before productivity — every time.',
    tag: 'Regulation-First',
  },
  {
    icon: Route,
    title: 'Projects your way',
    description: 'Your brain doesn\'t think in straight lines, and your projects don\'t have to either. Organize work in a way that actually makes sense to you.',
    tag: 'Projects',
  },
  {
    icon: Shield,
    title: 'Burnout warning system',
    description: 'We watch your patterns and give you a heads-up before you crash. You get a gentle nudge to slow down — before it becomes a lost week on the couch.',
    tag: 'Protection',
  },
  {
    icon: Sparkles,
    title: 'Easy task switching',
    description: 'Going from a client call to creative work is hard. NeuroAligned gives you a short reset between tasks so your brain can switch gears without the friction.',
    tag: 'Transitions',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
            Everything you need to{' '}
            <span className="text-primary">stop fighting yourself</span>{' '}
            and start getting things done
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature was built by and for people with ADHD, autism, dyslexia, and burnout — 
            who were tired of quitting yet another productivity app after two weeks.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              className="group relative p-7 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}