import PlatformsSection from "@/components/PlatformsSection";
import Navbar from "@/components/Navbar";
import TechnicalFoundation from "@/components/TechnicalFoundation";
import { DemoCTA } from "@/components/TechnicalFoundation";
import { Footer } from "@/components/Footer";

export default function PlatformsPage() {
  return (
    <>
        <Navbar/>
      <PlatformsSection />
      <TechnicalFoundation />
      <DemoCTA />
      <Footer />
    </>
  );
}