// Adapted from React Bits (CountUp). Changes: GSAP tween + ScrollTrigger instead of motion's spring,
// writes textContent directly (no re-render per frame), shows the final number under reduced motion.
import { useRef } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../../lib/gsap';

export default function CountUp({ to, className = '' }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const v = { n: 0 };
        gsap.to(v, {
          n: to,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 95%', once: true },
          onUpdate: () => {
            if (ref.current) ref.current.textContent = String(Math.round(v.n));
          },
        });
      });
    },
    { scope: ref, dependencies: [to] },
  );
  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  );
}
