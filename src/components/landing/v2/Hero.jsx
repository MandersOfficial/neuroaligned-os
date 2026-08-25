import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@/lib/analytics';

const STATES = {
  hyperfocus: {
    headline: 'Ride the wave.',
    sub: "Your capacity is high — the OS clears the runway for deep work.",
    border: 'var(--gold-deep)',
    tasks: [
    ['Finish the launch page copy', '2.5 hrs'],
    ['Batch-record 3 podcast intros', '1 hr'],
    ['Ship the pricing update', '45 min']]

  },
  steady: {
    headline: 'Keep it moving.',
    sub: 'Balanced capacity — a mix of focused work and lighter admin.',
    border: 'var(--sage-deep)',
    tasks: [
    ['Reply to 5 client emails', '30 min'],
    ['Draft next week\u2019s content', '1 hr'],
    ['Quick check-in call', '20 min']]

  },
  low: {
    headline: 'Protect the floor.',
    sub: "Low spoons today — the OS trims the list to what actually matters.",
    border: 'var(--rose-deep)',
    tasks: [
    ['One small task: invoice follow-up', '10 min'],
    ['Rest block (protected)', '—'],
    ['Optional: skim inbox', '5 min']]

  }
};

export default function Hero() {
  const navigate = useNavigate();
  const [state, setState] = useState('hyperfocus');
  const s = STATES[state];

  const handleStart = () => {
    Analytics.heroCTAClicked();
    navigate('/register?returnTo=/onboarding');
  };

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">Built by neurodivergent founders</span>
          <h1>Your brain was never<br />the problem. <em>Your systems<br />were.</em></h1>
          <p className="lead">NeuroAligned OS is the operating system for neurodivergent entrepreneurs. Get energy-based planning that works with your actual capacity, body doubling for instant momentum, and shame-free tracking that makes progress finally feel real — so you can build a business without burning out first.

          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={handleStart}>Start Free Trial — No Card Needed</button>
            <a href="#demo" className="btn btn-ghost" onClick={(e) => {e.preventDefault();document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });}}>See how it works</a>
          </div>
          <div className="hero-note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            14-day free trial &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Cancel anytime
          </div>
        </div>

        <div id="demo" className="demo-card">
          <div className="demo-topbar">
            <span className="demo-dot" /><span className="demo-dot" /><span className="demo-dot" />
            <span className="demo-title">Today · Your OS</span>
          </div>
          <div className="state-toggle" role="group" aria-label="Brain state">
            {Object.entries(STATES).map(([key]) =>
            <button
              key={key}
              className="state-btn"
              data-state={key}
              aria-pressed={state === key}
              onClick={() => setState(key)}>
              
                {key === 'low' ? 'Low spoons' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            )}
          </div>
          <div className="demo-body">
            <div className="demo-headline">{s.headline}</div>
            <p className="demo-sub">{s.sub}</p>
            <div className="demo-tasks">
              {s.tasks.map(([label, tag]) =>
              <div key={label} className="demo-task" style={{ borderLeftColor: s.border }}>
                  <span>{label}</span>
                  <span className="tag">{tag}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}