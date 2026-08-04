const PAINS = [
  ['01', 'Color-coded planners and habit trackers that hold together for exactly four days.'],
  ['02', 'Productivity gurus telling you to "just be consistent" — as if consistency were a personality trait you\u2019re missing.'],
  ['03', 'Shame every time the system breaks, instead of the system getting rebuilt around how you actually work.'],
];

export default function Empathy() {
  return (
    <section className="empathy">
      <div className="wrap">
        <span className="eyebrow">You\u2019ve tried the planners</span>
        <h2>Every system you\u2019ve tried assumed a brain that isn\u2019t yours — and then blamed you when it broke.</h2>
        <div className="empathy-img">
          <img
            src="https://media.base44.com/images/public/69d83404dff23f1198ddc883/9af499aec_generated_image.png"
            alt="A neurodivergent entrepreneur working calmly at a sunlit desk in a warm, serene workspace"
          />
        </div>
        <div className="pain-grid">
          {PAINS.map(([num, text]) => (
            <div key={num} className="pain-card">
              <span className="num">{num}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}