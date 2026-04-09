import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$30',
    period: '/month',
    description: 'Everything you need to stop fighting your brain and start working with it.',
    features: [
      'Energy-aware task management',
      'Daily nervous system check-ins',
      'Non-linear project mapping',
      'Basic AI task suggestions',
      'Context-switching bridges',
      'Burnout early-warning alerts',
      'Community access',
    ],
    cta: 'Start Your Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$50',
    period: '/month',
    description: 'The full NeuroAligned OS for founders who are done dimming their brilliance.',
    features: [
      'Everything in Starter',
      'Advanced AI guidance & pattern learning',
      'Full nervous system regulation toolkit',
      'Custom workflow builder',
      'Priority support from ND coaches',
      'Spiky profile analytics dashboard',
      'Team collaboration (up to 5)',
      'API access & integrations',
    ],
    cta: 'Unlock the Full OS',
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
            Invest in an OS that{' '}
            <span className="text-primary">actually fits your brain</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Both plans include a 14-day free trial. No credit card required. 
            Because we know commitment anxiety is real.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-3xl p-8 lg:p-10 border flex flex-col ${
                plan.popular
                  ? 'border-primary/40 bg-primary/[0.03] shadow-xl shadow-primary/10'
                  : 'border-border/60 bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display font-bold text-5xl text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-base">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full rounded-full py-6 text-base font-semibold group ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-foreground hover:bg-foreground/90 text-background'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          🛡️ 30-day money-back guarantee · Switch plans anytime · Built with love by neurodivergent founders
        </motion.p>
      </div>
    </section>
  );
}