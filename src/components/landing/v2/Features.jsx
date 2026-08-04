const FEATURES = [
  {
    stroke: '#4adede',
    title: 'Energy-based planning',
    desc: 'Plan around your actual capacity, not a fictional 9-to-5. Your day rearranges itself when your energy does.',
    icon: <><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="4" strokeWidth="1.8" /></>,
  },
  {
    stroke: '#4d79ff',
    title: 'Body doubling, built in',
    desc: 'Work alongside others in real time — no cameras required if you don\u2019t want them. Momentum by proximity.',
    icon: <><circle cx="8" cy="9" r="3" strokeWidth="1.8" /><circle cx="17" cy="9" r="3" strokeWidth="1.8" /><path d="M2.5 20c.7-3.3 3-5 5.5-5s4.8 1.7 5.5 5M13 20c.7-3.3 3-5 5.5-5s4.8 1.7 5.5 5" strokeWidth="1.8" strokeLinecap="round" /></>,
  },
  {
    stroke: '#9747ff',
    title: 'Shame-free tracking',
    desc: 'See what you did, not what you "should have." Progress is logged without a running commentary of judgment.',
    icon: <path d="M4 12l5 5L20 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    stroke: '#c476ff',
    title: 'Dopamine-friendly momentum',
    desc: 'Small wins, real rewards. Systems built with your brain\u2019s reward circuitry — not the willpower myth.',
    icon: <path d="M12 2l2.6 6.5L21 11l-6.4 2.5L12 20l-2.6-6.5L3 11l6.4-2.5L12 2z" strokeWidth="1.6" strokeLinejoin="round" />,
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="wrap">
        <div className="features-head">
          <div>
            <span className="eyebrow">The OS, module by module</span>
            <h2>Infrastructure for a different kind of brain.</h2>
          </div>
          <p>Every module ships with one question in mind: does this work with your brain, or against it?</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={f.stroke}>{f.icon}</svg>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}