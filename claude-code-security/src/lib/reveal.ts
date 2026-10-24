import { gsap, ScrollTrigger, MOTION_OK } from './gsap';

/**
 * Scroll reveals for a page, called inside useGSAP: one ScrollTrigger.batch for every .reveal element in `root`
 * (gsap-skills: gsap-performance). Only when motion is allowed; under reduced motion nothing is ever hidden.
 */
export function revealOnScroll(root: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    const els = gsap.utils.toArray<HTMLElement>('.reveal', root);
    gsap.set(els, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, overwrite: true }),
    });
  });
  return mm;
}
