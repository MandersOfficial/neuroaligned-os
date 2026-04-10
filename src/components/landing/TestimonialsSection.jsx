import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I've tried every productivity app on the market. They all assume my brain works in a straight line. NeuroAligned was the first tool that didn't make me feel broken for not following a linear workflow. My revenue is up 40% because I'm actually finishing projects now.",
    name: 'Maya Chen',
    title: 'Founder & Creative Director',
    company: 'Flux Design Studio',
    detail: 'ADHD, diagnosed at 32',
  },
  {
    quote: "The nervous system regulation features changed everything. I used to lose entire days to shutdown after client meetings. Now I have a 5-minute bridge ritual built right into my task flow. I went from 3 productive days a week to 5 — without burnout.",
    name: 'Jamie Torres',
    title: 'CEO',
    company: 'Spectrum Analytics',
    detail: 'Autistic, late-diagnosed',
  },
  {
    quote: "As a dyslexic founder, I spent more time fighting my tools than using them. NeuroAligned's AI doesn't just tolerate my thinking style — it amplifies it. I've doubled my client base in 6 months because I stopped wasting energy on systems that weren't built for me.",
    name: 'Sage Nakamura',
    title: 'Business Coach & Author',
    company: 'Rewired Leadership',
    detail: 'Dyslexic & ADHD',
  },
];

export default function TestimonialsSection({ images }) {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Built by neurodivergent founders,{' '}
            <span className="text-primary">loved by neurodivergent founders</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              className="bg-card rounded-2xl p-7 border border-border/60 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground text-sm leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <img
                  src={images[i]}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.title}, {t.company}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">{t.detail}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}