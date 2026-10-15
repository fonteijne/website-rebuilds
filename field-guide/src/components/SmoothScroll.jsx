import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap.js';

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock
 * (the official pattern from the Lenis README + gsap-scrolltrigger skill).
 * Disabled entirely for people who ask for reduced motion.
 */
export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const { pathname } = useLocation();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  useLenis(() => ScrollTrigger.update());

  // new page => back to the top, instantly
  useEffect(() => {
    const l = lenisRef.current?.lenis;
    if (l) l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  if (reduced) return null;
  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, anchors: true, allowNestedScroll: true, lerp: 0.1, syncTouch: false }}
    />
  );
}
