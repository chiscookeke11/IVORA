import AI_Advantage from "@/components/AI_Advantage";
import Architecture from "@/components/Architecture";
import BelieveSection from "@/components/BelieveSection";
import CTA_Section from "@/components/CTASection";
import Features from "@/components/Features";
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
      <Features />
      <Architecture />
      <HowItWorks />
      <Team />
      <CTA_Section />
      <AI_Advantage />
      <Footer />
    </div>
  )
}