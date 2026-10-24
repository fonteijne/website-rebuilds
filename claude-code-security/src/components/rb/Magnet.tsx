// Adapted from React Bits (Magnet). Changes: GSAP quickTo instead of React state per mousemove,
// only on (hover: hover) and (pointer: fine) without reduced motion, scoped via useGSAP.
import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, FINE_POINTER, MOTION_OK } from '../../lib/gsap';

export default function Magnet({ children, padding = 60, strength = 3 }: { children: ReactNode; padding?: number; strength?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${FINE_POINTER} and ${MOTION_OK}`, () => {
        const el = inner.current!;
        const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
        const onMove = (e: PointerEvent) => {
          const r = wrap.current!.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const near = Math.abs(e.clientX - cx) < r.width / 2 + padding && Math.abs(e.clientY - cy) < r.height / 2 + padding;
          x(near ? (e.clientX - cx) / strength : 0);
          y(near ? (e.clientY - cy) / strength : 0);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      });
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className="inline-block">
      <div ref={inner} className="inline-block">
        {children}
      </div>
    </div>
  );
}
