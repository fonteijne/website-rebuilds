import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from './gsap.js';

/**
 * Scroll-reveal for any container: `[data-reveal]` children fade/slide in as they enter,
 * batched with ScrollTrigger.batch() so groups stagger naturally (gsap-scrolltrigger skill).
 */
export function useReveal() {
  const root = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray('[data-reveal]', root.current);
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        interval: 0.1,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true })
      });
    },
    { scope: root }
  );
  return root;
}
