import { useEffect, useRef } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

// Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger and
// smooth scroll share one RAF loop (per the Lenis + GSAP integration docs).
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const reduced = prefersReducedMotion();
  // The instance is created asynchronously by <ReactLenis>; useLenis re-renders once it exists.
  const lenis = useLenis();

  useEffect(() => {
    if (reduced) return;
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  useEffect(() => {
    if (!lenis) return;
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    // The preloader may have locked scrolling before Lenis existed.
    if (document.documentElement.classList.contains('is-locked')) lenis.stop();
    return () => {
      lenis.off?.('scroll', ScrollTrigger.update);
      delete window.__lenis;
    };
  }, [lenis]);

  if (reduced) return children;

  return (
    <>
      <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, anchors: false }} />
      {children}
    </>
  );
}
