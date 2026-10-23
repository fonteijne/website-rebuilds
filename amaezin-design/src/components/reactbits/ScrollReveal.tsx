'use client';

/**
 * Adapted from React Bits — ScrollReveal (https://reactbits.dev).
 * Changes: useGSAP with a scope instead of useEffect + `ScrollTrigger.getAll().kill()`
 * (the original cleanup killed every trigger on the page), semantic <p>, gsap.matchMedia
 * for reduced motion, blur only on larger screens (filter is expensive on mobile).
 */
import { useMemo, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

interface ScrollRevealProps {
  children: string;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0.12,
  baseRotation = 3,
  blurStrength = 4,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className="sr-word inline-block" key={i}>
            {word}
          </span>
        )
      ),
    [children]
  );

  useGSAP(
    () => {
      const el = ref.current!;
      const wordEls = el.querySelectorAll<HTMLElement>('.sr-word');
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 768px)'
        },
        ctx => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;

          gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            { ease: 'none', rotate: 0, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } }
          );

          gsap.fromTo(
            wordEls,
            { opacity: baseOpacity, filter: desktop ? `blur(${blurStrength}px)` : 'none' },
            {
              ease: 'none',
              opacity: 1,
              filter: desktop ? 'blur(0px)' : 'none',
              stagger: 0.05,
              scrollTrigger: { trigger: el, start: 'top bottom-=15%', end: 'bottom center+=10%', scrub: true }
            }
          );
        }
      );
    },
    { scope: ref, dependencies: [children] }
  );

  return (
    <p ref={ref} className={className}>
      {words}
    </p>
  );
}
