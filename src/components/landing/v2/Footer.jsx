import { useNavigate } from 'react-router-dom';
import Logo from '@/components/landing/v2/Logo';

export default function Footer() {
  const navigate = useNavigate();
  const go = (path) => (e) => { e.preventDefault(); navigate(path); };
  const scroll = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <Logo size={48} />
            </a>
            <p>The operating system for neurodivergent entrepreneurs. Built with lived experience, backed by neuroscience.</p>
          </div>
          <div className="foot-col">
            <h4>Product</h4>
            <a href="#features" onClick={scroll('features')}>Features</a>
            <a href="#how" onClick={scroll('how')}>How it works</a>
            <a href="#faq" onClick={scroll('faq')}>FAQ</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="#" onClick={go('/about')}>About</a>
            <a href="#" onClick={scroll('stories')}>Stories</a>
            <a href="#" onClick={go('/contact')}>Contact</a>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <a href="#" onClick={go('/disclaimer')}>Health &amp; Medical Disclaimer</a>
            <a href="#" onClick={go('/privacy')}>Privacy</a>
            <a href="#" onClick={go('/terms')}>Terms</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 NeuroAligned OS. All rights reserved.</span>
          <span>Made for brains that were never the problem.</span>
        </div>
      </div>
    </footer>
  );
}