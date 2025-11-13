import Hero from "@/components/marketing/Hero";
import Services from "@/components/marketing/Services";
import { Features } from "@/components/marketing/Features";
import Image from "next/image";
import Faq1 from "@/components/marketing/Faq";
import FooterStandard from "@/components/common/Footer";
import Testimonials from "@/components/marketing/Testimonials";
import CongestedPricing from "@/components/marketing/PricingTable";
import LastTry from "@/components/marketing/LastTry";
import { ScrollText } from "lucide-react";
import ScrollBasedVelocity from "@/components/marketing/ScrollText";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center  flex-col bg-[#fffaf5]">
      <Hero/>
      <Services/>
      <Features/>
      <ScrollBasedVelocity/>
      <Testimonials/>
      <CongestedPricing/>
      <Faq1/>
      <LastTry/>
      <FooterStandard/>
    </div>
  );
}
