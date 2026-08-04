import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/landing/v2/Logo';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header>
      <nav className="wrap">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Logo size={42} />
        </a>
        <div className="nav-mid">
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#stories">Stories</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="nav-cta">
          <button className="nav-login" onClick={() => base44.auth.redirectToLogin('/dashboard')}>Log in</button>
          <a
            href="#start"
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); navigate('/onboarding'); }}
          >
            Start free trial
          </a>
        </div>
      </nav>
    </header>
  );
}