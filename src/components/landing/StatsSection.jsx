import { motion } from 'framer-motion';

const stats = [
  {
    number: '73%',
    label: 'of neurodivergent entrepreneurs report burnout from using tools designed for neurotypical brains',
    source: 'Journal of Attention Disorders, 2023',
  },
  {
    number: '2.4×',
    label: 'more likely to start a business — ADHD brains are wired for entrepreneurship, not for Asana',
    source: 'Harvard Business Review',
  },
  {
    number: '89%',
    label: 'of NeuroAligned users report completing more meaningful work in less time within 30 days',
    source: 'NeuroAligned User Survey, 2025',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 lg:py-28 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center md:text-left"
            >
              <div className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-accent mb-4">
                {stat.number}
              </div>
              <p className="text-background/70 text-base leading-relaxed mb-2">
                {stat.label}
              </p>
              <p className="text-background/40 text-xs font-medium uppercase tracking-wider">
                {stat.source}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}