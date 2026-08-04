const STEPS = [
  ['01', 'Map your brain', 'A short assessment on how your focus, energy, and motivation actually move through a week — no generic personality quiz.'],
  ['02', 'Build your system', 'NeuroAligned assembles a working setup around your map. Not a template you have to force yourself into.'],
  ['03', 'Run your OS', 'Your system adapts in real time as your capacity shifts — hour to hour, day to day, season to season.'],
];

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="wrap">
        <span className="eyebrow">Getting started</span>
        <h2>Three steps to a system that finally holds.</h2>
        <div className="steps">
          {STEPS.map(([num, title, desc]) => (
            <div key={num} className="step">
              <div className="step-num">{num}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}