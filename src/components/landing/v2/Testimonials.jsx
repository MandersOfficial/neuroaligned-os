const TESTIMONIALS = [
  { stars: '★★★★★', quote: '"I stopped hating myself every time a planner failed. Turns out the planner was the problem, not me."', initial: 'J', name: 'Jess R.', role: 'Freelance designer', bg: 'var(--gold-deep)' },
  { stars: '★★★★★', quote: '"First tool that treats my hyperfocus days and my zero-spoon days as equally valid days. Both get a plan."', initial: 'M', name: 'Marcus T.', role: 'Course creator', bg: 'var(--sage-deep)' },
  { stars: '★★★★★', quote: '"I finally have a system that flexes with my ADHD instead of demanding I flex myself into it."', initial: 'P', name: 'Priya N.', role: 'Coach & consultant', bg: 'var(--rose-deep)' },
];

export default function Testimonials() {
  return (
    <section className="testimonials" id="stories">
      <div className="wrap">
        <span className="eyebrow">From people running their OS</span>
        <h2>They stopped fighting their brains and started building.</h2>
        <div className="t-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="t-card">
              <div className="stars">{t.stars}</div>
              <p className="quote">{t.quote}</p>
              <div className="t-person">
                <div className="t-avatar" style={{ background: t.bg }}>{t.initial}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}