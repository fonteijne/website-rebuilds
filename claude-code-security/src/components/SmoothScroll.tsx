import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, REDUCED } from '../lib/gsap';

export let lenis: Lenis | null = null;

/**
 * Lenis smooth scroll driven by GSAP's ticker, so there is one rAF loop and ScrollTrigger stays in sync.
 * Touch stays native (syncTouch: false). Not started at all under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    const l = new Lenis({ autoRaf: false, syncTouch: false, anchors: true, allowNestedScroll: true });
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
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}
