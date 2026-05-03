import BelieveSection from "@/components/BelieveSection";
import CTA_Section from "@/components/CTASection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Purpose from "@/components/PurposeSection";




export default function Page() {
  return (
    <div className="bg-[#000000] " >
      <Hero />
      <BelieveSection />
      <Purpose />
      <CTA_Section />
      <Footer />
    </div>
  )
}