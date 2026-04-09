import { motion } from 'framer-motion';
import { Battery, Brain, Shield, Sparkles, Route, HeartPulse } from 'lucide-react';

const features = [
  {
    icon: Battery,
    title: 'Energy-Aware Task Engine',
    description: 'Tasks automatically adapt to your energy levels. Hyperfocusing? We surface deep work. Crashing? Only gentle tasks appear. No more guilt spirals from unfinished lists.',
    tag: 'Core System',
  },
  {
    icon: Brain,
    title: 'AI Guidance That Gets You',
    description: 'Our AI learns your patterns — not to optimize you into a neurotypical mold, but to help you leverage your spiky profile. It knows when to push and when to pause.',
    tag: 'Intelligence',
  },
  {
    icon: HeartPulse,
    title: 'Nervous System Regulation',
    description: 'Built-in breathwork, grounding exercises, and sensory check-ins. Because you can\'t think your way through a meltdown, and your OS should know that.',
    tag: 'Regulation',
  },
  {
    icon: Route,
    title: 'Non-Linear Workflows',
    description: 'Forget rigid step-by-step processes. Map your projects as interconnected webs that match how your brain actually navigates complex ideas.',
    tag: 'Workflows',
  },
  {
    icon: Shield,
    title: 'Burnout Prevention System',
    description: 'Real-time monitoring of your capacity with gentle guardrails. NeuroAligned intervenes before you hit the wall — not after you\'ve been down for a week.',
    tag: 'Protection',
  },
  {
    icon: Sparkles,
    title: 'Context-Switching Bridges',
    description: 'Smooth transitions between tasks with built-in buffers. Because jumping from client call to creative work without a bridge is a recipe for executive dysfunction.',
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
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
            An operating system that works{' '}
            <span className="text-primary">with</span> your wiring, not against it
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature was co-designed with neurodivergent entrepreneurs who were tired 
            of abandoning yet another productivity tool after two weeks.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
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