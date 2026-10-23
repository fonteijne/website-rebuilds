import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

/** React Bits-style CountUp, driven by GSAP + ScrollTrigger (counts once when scrolled into view). */
export default function CountUp({ to, duration = 1.6, className = '', suffix = '' }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (prefersReducedMotion()) {
        el.textContent = to + suffix;
        return;
      }
      const o = { v: 0 };
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () =>
          gsap.to(o, { v: to, duration, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => (el.textContent = o.v + suffix) })
      });
    },
    { scope: ref, dependencies: [to] }
  );
  return <span ref={ref} className={className}>{to}{suffix}</span>;
}
