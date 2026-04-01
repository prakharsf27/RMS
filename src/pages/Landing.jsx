import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PipelineSection from "@/components/landing/PipelineSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="landing-theme">
      <Navbar />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <PipelineSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
