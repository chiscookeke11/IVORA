import Architecture from "@/components/Architecture";
import BelieveSection from "@/components/BelieveSection";
import CTA_Section from "@/components/CTASection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Purpose from "@/components/PurposeSection";
import Team from "@/components/Team";




export default function Page() {
  return (
    <div className="bg-[#000000] " >
      <Hero />
      <BelieveSection />
      <Purpose />
      <Architecture />
      <HowItWorks />
      <Team />
      <CTA_Section />
      <Footer />
    </div>
  )
}