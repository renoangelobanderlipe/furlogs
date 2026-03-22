import { FeatureDeepDiveSection } from "@/components/landing/FeatureDeepDiveSection";
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesGridSection />
        <HowItWorksSection />
        <FeatureDeepDiveSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
