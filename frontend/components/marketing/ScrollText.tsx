import { VelocityScroll } from '@/components/ui/scrollbasedvelocity';

export default function ScrollBasedVelocity() {
  return (
    <VelocityScroll
      className="relative justify-center items-center px-6 py-15 sm:py-15 text-center text-lg sm:text-xl md:text-2xl font-light text-[#fffaf5] tracking-tight bg-[#2a2a2a]"
      text="AI-powered LaTeX editing    🔴    Lifetime updates               🔴    Figma variables    🔴    Community driven    🔴    Crafted by professionals    🔴    Visual TikZ builder    🔴    Instant compile preview    🔴    Smart error fixing    🔴    Rich export formats    🔴    Daily free credits    🔴    "
      default_velocity={1}
    />
  );
}
