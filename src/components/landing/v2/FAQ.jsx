import { useState, useRef, useEffect } from 'react';

const FAQS = [
  ['Is this just another productivity app?', 'No. Productivity apps ask you to adapt to their system. NeuroAligned builds the system around how your focus and energy actually move — that\u2019s the whole premise.'],
  ['Do I need a diagnosis to use it?', 'No. NeuroAligned is built for anyone who\u2019s done fighting their brain to fit a standard system — diagnosed, self-identified, or still figuring it out.'],
  ['What if my energy changes every day?', 'That\u2019s exactly what it\u2019s built for. Your OS re-shapes itself around whatever state you\u2019re actually in — that\u2019s not a bug case, it\u2019s the default case.'],
  ['Is my data private?', 'Yes. Your brain map and activity data are yours — used only to run your own OS, never sold, never used to train anything without your say-so.'],
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