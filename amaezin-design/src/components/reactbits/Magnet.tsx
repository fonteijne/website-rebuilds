'use client';

/**
 * Adapted from React Bits — Magnet (https://reactbits.dev).
 * Changes: gsap.quickTo instead of React state per mousemove (gsap-performance skill),
 * and it only activates on devices with a fine pointer — on touch it's a plain wrapper.
 */
import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  magnetStrength?: number;
  className?: string;
}

export default function Magnet({ children, padding = 80, magnetStrength = 3, className = '' }: MagnetProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const xTo = gsap.quickTo(inner.current, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(inner.current, 'y', { duration: 0.5, ease: 'power3' });

        const onMove = (e: MouseEvent) => {
          const r = wrap.current!.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const inside =
            Math.abs(cx - e.clientX) < r.width / 2 + padding && Math.abs(cy - e.clientY) < r.height / 2 + padding;
          xTo(inside ? (e.clientX - cx) / magnetStrength : 0);
          yTo(inside ? (e.clientY - cy) / magnetStrength : 0);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
      });
    },
    { scope: wrap, dependencies: [padding, magnetStrength] }
  );

  return (
    <div ref={wrap} className={`relative inline-block ${className}`}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
