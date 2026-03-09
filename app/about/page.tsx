import AboutSection from "@/components/AboutSection";
import CoreValuesSection from "@/components/CoreValuesSection";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";   
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutSection />
      <CoreValuesSection />
      <Footer />
    </>
  );
}