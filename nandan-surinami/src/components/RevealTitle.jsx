import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';

// Masked line-by-line reveal for section headings (GSAP SplitText + autoSplit).
export default function RevealTitle({ as: Tag = 'h2', className = '', children, scrub = false, ...rest }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        SplitText.create(ref.current, {
          type: 'lines, words',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'rt-line',
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              rotate: 3,
              stagger: 0.06,
              duration: 1.1,
              ease: 'pour',
              scrollTrigger: scrub
                ? { trigger: ref.current, start: 'top 90%', end: 'top 45%', scrub: 1 }
                : { trigger: ref.current, start: 'top 85%', once: true },
            }),
        });
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
