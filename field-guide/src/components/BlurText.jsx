import { useRef } from 'react';
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

/**
 * React Bits' <BlurText> look (blur + fade + slide per word), re-implemented on GSAP SplitText
 * following the gsap-skills guidance: autoSplit + onSplit returning the tween, aria handled by SplitText.
 */
export default function BlurText({ as: Tag = 'span', text, className = '', delay = 0, stagger = 0.07 }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      SplitText.create(ref.current, {
        type: 'words',
        autoSplit: true,
        aria: 'auto',
        onSplit: (self) =>
          gsap.from(self.words, {
            autoAlpha: 0,
            filter: 'blur(12px)',
            y: -28,
            duration: 0.8,
            ease: 'power3.out',
            stagger,
            delay
          })
      });
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
