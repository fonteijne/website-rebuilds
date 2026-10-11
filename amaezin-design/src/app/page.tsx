import CallToAction from "@/components/CallToAction";
import About from "@/components/home/About";
import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Services from "@/components/home/Services";
import Statement from "@/components/home/Statement";
import Testimonials from "@/components/home/Testimonials";
import WorkShowcase from "@/components/home/WorkShowcase";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Statement />
      <WorkShowcase />
      <Services />
      <About />
      <Testimonials />
      <CallToAction />
    </>
  );
}
