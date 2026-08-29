import { useEffect } from 'react';
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
  useEffect(() => { Analytics.landingPageViewed(); }, []);

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