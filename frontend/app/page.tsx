import Hero from "@/components/marketing/Hero";
import Services from "@/components/marketing/Services";
import { Features } from "@/components/marketing/Features";
import Image from "next/image";
import Faq1 from "@/components/marketing/Faq";
import FooterStandard from "@/components/common/Footer";
import Testimonials from "@/components/marketing/Testimonials";
import CongestedPricing from "@/components/marketing/PricingTable";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black flex-col">
      <Hero/>
      <Services/>
      <Features/>
      <Testimonials/>
      <CongestedPricing/>
      <Faq1/>
      <FooterStandard/>
    </div>
  );
}
