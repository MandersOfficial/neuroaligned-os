import { useNavigate } from 'react-router-dom';

export default function CTABanner() {
  const navigate = useNavigate();
  return (
    <section id="start">
      <div className="wrap">
        <div className="cta-banner">
          <div className="cta-inner">
            <h2>Start building a business your brain can actually sustain.</h2>
            <p>Set up your OS in about ten minutes. No diagnosis required — just a brain that\u2019s done fighting itself.</p>
            <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>Start your free trial</button>
            <div className="cta-fine">No credit card required · Cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
}