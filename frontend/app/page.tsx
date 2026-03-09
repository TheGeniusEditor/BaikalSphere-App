import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import AutomationAdvantage from "@/components/AutomationAdvantage";
import EnterpriseSection from "@/components/EnterpriseSection";
import { Testimonial } from "@/components/TestimonialSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Partners />
      <AutomationAdvantage />
      <EnterpriseSection />
      <Testimonial />
      <CTASection />
      <Footer />
      
      </>
  );
}