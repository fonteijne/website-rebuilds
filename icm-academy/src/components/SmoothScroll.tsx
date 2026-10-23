import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync (per Lenis README). */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ anchors: true, allowNestedScroll: true });
    lenis = l;
    l.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis = null;
    };
  }, []);
  return null;
}

export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}
