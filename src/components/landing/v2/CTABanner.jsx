import { useNavigate } from 'react-router-dom';

export default function CTABanner() {
  const navigate = useNavigate();
  return (
    <section id="start">
      <div className="wrap">
        <div className="cta-banner">
          <div className="cta-inner">
            <h2>Get your first brain-aligned workday in under 10 minutes.</h2>
            <p>Join 1,000+ neurodivergent entrepreneurs who stopped fighting their brain and started building with it. Set up takes minutes — no diagnosis, no overwhelm.</p>
            <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>Start My Free Trial</button>
            <div className="cta-fine">14-day free trial · No credit card required · Cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
}