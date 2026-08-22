import { ShieldCheck, Lock, Sparkles, HeartHandshake } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="trustbar" aria-label="Why founders trust NeuroAligned OS">
      <div className="wrap">
        <div className="trust-item">
          <Sparkles className="ic-gold" />
          <span>Built by neurodivergent founders</span>
        </div>
        <div className="trust-item">
          <ShieldCheck className="ic-sage" />
          <span>RISC-protected Google sign-in</span>
        </div>
        <div className="trust-item">
          <Lock className="ic-plum" />
          <span>Your data stays private by default</span>
        </div>
        <div className="trust-item">
          <HeartHandshake className="ic-rose" />
          <span>14-day free trial · Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}