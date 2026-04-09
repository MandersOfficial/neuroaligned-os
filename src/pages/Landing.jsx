import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const HERO_IMAGE = "/__generating__/img_0f7652b37712.png";
const TESTIMONIAL_IMAGES = [
  "/__generating__/img_d9df12c64c05.png",
  "/__generating__/img_0e5df6cc0517.png",
  "/__generating__/img_8f87961ce194.png",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection heroImage={HERO_IMAGE} />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection images={TESTIMONIAL_IMAGES} />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}