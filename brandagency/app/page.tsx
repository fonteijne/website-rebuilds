import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Marquee from "@/components/home/Marquee";
import HorizontalActivations from "@/components/home/HorizontalActivations";
import CaseShowcase from "@/components/home/CaseShowcase";
import Stats from "@/components/sections/Stats";
import Cta from "@/components/sections/Cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Marquee />
      <HorizontalActivations />
      <Stats />
      <CaseShowcase />
      <Cta />
    </>
  );
}
