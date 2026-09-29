import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/landing/v2/Logo';

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <nav className="wrap">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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
          <button className="nav-login" onClick={() => navigate('/login')}>Log in</button>
          <a
            href="#start"
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); navigate('/onboarding'); }}
          >
            Start free trial
          </a>
          <button
            className="nav-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div className={`nav-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        <a href="#how" onClick={() => setOpen(false)}>How it works</a>
        <a href="#features" onClick={() => setOpen(false)}>Features</a>
        <a href="#stories" onClick={() => setOpen(false)}>Stories</a>
        <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
        <button className="nav-menu-login" onClick={() => { setOpen(false); navigate('/login'); }}>Log in</button>
      </div>
    </header>
  );
}