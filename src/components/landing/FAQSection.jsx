import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can AI really understand my neurodivergent patterns? This sounds like hype.",
    answer: "Fair skepticism — most AI tools slap a 'personalized' label on generic algorithms. Our AI was trained specifically on neurodivergent work patterns, co-developed with occupational therapists and ND researchers. It doesn't try to 'fix' you. It learns your unique energy rhythms, hyperfocus windows, and crash patterns over time. The nervous system regulation features use evidence-based techniques (polyvagal-informed breathwork, sensory grounding) — not some chatbot telling you to 'just breathe.' We publish our methodology transparently because we know you'll check.",
  },
  {
    question: "I'm autistic, not ADHD. Will this actually work for me, or is it just an ADHD tool?",
    answer: "NeuroAligned is explicitly designed for the full spectrum of neurodivergence — ADHD, autism, dyslexia, and co-occurring conditions. During onboarding, you build your 'spiky profile' that maps your specific strengths, sensitivities, and needs. An autistic founder who needs deep routine gets a fundamentally different experience than an ADHD founder who thrives on novelty. We don't flatten neurodivergence into one archetype. Your OS adapts to your brain, not the other way around.",
  },
  {
    question: "I've abandoned 20+ productivity tools. Why would this be any different?",
    answer: "Because those tools were designed for brains that yours isn't. They rely on consistent motivation, linear thinking, and stable energy — the exact things neurodivergent brains struggle with. NeuroAligned has no 'Day 1 setup marathon' that you'll never finish. It starts simple and grows with you. If you don't open it for a week, it welcomes you back without guilt. The onboarding was designed by someone who's abandoned 20+ tools themselves. We get it because we are it.",
  },
  {
    question: "Isn't a comprehensive 'operating system' going to be overwhelming?",
    answer: "This is our #1 design principle: comprehensive doesn't mean complex. NeuroAligned uses progressive disclosure — you see only what you need in the moment. Start with just the energy check-in and task suggestions. As you're ready, layers reveal themselves naturally. Think of it like a smartphone: incredibly powerful, but you can use just the phone and camera if that's all you need today. Every feature has a 'gentle mode' for high-sensitivity days.",
  },
  {
    question: "Why should I pay for this instead of just using Notion templates or free ADHD apps?",
    answer: "Notion templates are like giving someone a blank canvas and saying 'paint a masterpiece.' Free ADHD apps address one symptom — usually timers or to-do lists. NeuroAligned is an integrated system: your energy levels inform your task suggestions, which connect to your regulation tools, which feed into your burnout prevention system. It's the difference between buying individual ingredients and getting a meal kit designed for your dietary needs. The $30-50/month pays for itself the first time you avoid a 3-day burnout spiral that would've cost you a client.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            FAQ
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6">
            Your skepticism is valid.{' '}
            <span className="text-primary">Here are real answers.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We built this for people who've been burned by "life-changing" tools before.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border/60 rounded-xl px-6 data-[state=open]:shadow-md data-[state=open]:border-primary/20 transition-all"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary py-5 [&[data-state=open]>svg]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}