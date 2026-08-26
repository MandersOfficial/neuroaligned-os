import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Analytics } from '@/lib/analytics';
import '@/components/landing/v2/landing.css';
import Navbar from '@/components/landing/v2/Navbar';
import Hero from '@/components/landing/v2/Hero';
import TrustBar from '@/components/landing/v2/TrustBar';
import Empathy from '@/components/landing/v2/Empathy';
import Statement from '@/components/landing/v2/Statement';
import Features from '@/components/landing/v2/Features';
import HowItWorks from '@/components/landing/v2/HowItWorks';
import Testimonials from '@/components/landing/v2/Testimonials';
import CTABanner from '@/components/landing/v2/CTABanner';
import FAQ from '@/components/landing/v2/FAQ';
import Footer from '@/components/landing/v2/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  useEffect(() => { Analytics.landingPageViewed(); }, []);

  // Authenticated users never need the marketing page — send them straight to
  // their workspace. This breaks the mobile "log in, land on home, get asked to
  // log in again" loop: after sign-in the return target may resolve to "/", but
  // a valid session now bounces them to /dashboard instead of showing the
  // landing page with its "Log in" button.
  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, isLoadingPublicSettings, navigate]);

  return (
    <div className="lp">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Empathy />
        <Statement />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTABanner />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}