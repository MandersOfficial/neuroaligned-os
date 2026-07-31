import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import DataPrivacySection from '../components/landing/DataPrivacySection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const HERO_IMAGE = "https://media.base44.com/images/public/69d83404dff23f1198ddc883/2d0c19a74_generated_e8d44661.png";
const TESTIMONIAL_IMAGES = [
  "https://media.base44.com/images/public/69d83404dff23f1198ddc883/af210a5a3_generated_7d3e678b.png",
  "https://media.base44.com/images/public/69d83404dff23f1198ddc883/b2a4bc80f_generated_87b5976e.png",
  "https://media.base44.com/images/public/69d83404dff23f1198ddc883/263657275_generated_cf3b4cfc.png",
];

export default function Landing() {
  useEffect(() => { Analytics.landingPageViewed(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection heroImage={HERO_IMAGE} />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection images={TESTIMONIAL_IMAGES} />
      <PricingSection />
      <FAQSection />
      <DataPrivacySection />
      <CTASection />
      <Footer />
    </div>
  );
}