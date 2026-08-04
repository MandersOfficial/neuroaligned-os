import { useState, useRef, useEffect } from 'react';

const FAQS = [
  ['Is this just another productivity app?', 'No. Productivity apps ask you to adapt to their system. NeuroAligned builds the system around how your focus and energy actually move — that\u2019s the whole premise.'],
  ['What is considered neurodivergent?', '\u201cNeurodivergent\u201d is a broad, non-clinical term for brains that process focus, energy, and information differently from what\u2019s considered typical — commonly including ADHD, autism, dyslexia, dyspraxia, OCD, and Tourette\u2019s, among others. We use it as an umbrella, not a checklist. You don\u2019t need to fit a specific label to feel like NeuroAligned was built for you.'],
  ['Do I need a diagnosis to use it?', 'No. NeuroAligned is built for anyone who\u2019s done fighting their brain to fit a standard system — formally diagnosed, self-identified, still figuring it out, or just tired of planners that don\u2019t work for you.'],
  ['Is this medical advice, therapy, or a diagnostic tool?', 'No. NeuroAligned is a business and productivity tool, not a medical device, diagnostic instrument, or substitute for therapy, coaching, or clinical care. Nothing in the app should be read as medical, psychological, or diagnostic advice. If you have questions about a diagnosis, medication, or mental health, please talk to a licensed professional — NeuroAligned is meant to work alongside that care, not replace it.'],
  ['Can I use this alongside therapy, coaching, or medication?', 'Yes — many people do. NeuroAligned handles the day-to-day business systems side; it\u2019s not designed to interfere with or replace whatever clinical or personal support you already have in place.'],
  ['What if my energy changes every day?', 'That\u2019s exactly what it\u2019s built for. Your OS re-shapes itself around whatever state you\u2019re actually in — that\u2019s not a bug case, it\u2019s the default case.'],
  ['I don\u2019t have a formal label but a lot of this resonates — is it still for me?', 'Yes. Plenty of people relate to needing systems that flex around focus and energy without identifying with any specific label. NeuroAligned is built around how you actually work, not around proving you belong here.'],
  ['Is my data private?', 'Yes. Your brain map and activity data are yours — used only to run your own OS, never sold, never used to train anything without your say-so.'],
  ['What if I try it and it doesn\u2019t fit how I work?', 'Cancel anytime, no questions asked. If a system doesn\u2019t fit, that\u2019s useful information — for us and for you — not a reason to feel bad about it.'],
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.maxHeight = open === i ? `${el.scrollHeight}px` : null;
    });
  }, [open]);

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <span className="eyebrow">Questions, answered plainly</span>
        <h2>Before you start</h2>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <div key={q} className="faq-item" data-open={open === i}>
              <button
                className="faq-q"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {q}
                <span className="plus">+</span>
              </button>
              <div className="faq-a" ref={(el) => (refs.current[i] = el)}>
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}