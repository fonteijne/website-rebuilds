import { useRef } from 'react';
import { gsap, SplitText, useGSAP, motionScale } from '../lib/gsap';
import { MQ } from '../lib/media';

// Masked line-by-line reveal for section headings (GSAP SplitText + autoSplit).
export default function RevealTitle({ as: Tag = 'h2', className = '', children, scrub = false, ...rest }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, small: MQ.small }, ({ conditions }) => {
        if (!conditions.motion) return;
        const { t } = motionScale(conditions.small);
        SplitText.create(ref.current, {
          type: 'lines, words',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'rt-line',
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              rotate: conditions.small ? 2 : 3,
              stagger: conditions.small ? 0.045 : 0.06,
              duration: t(1.1),
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
