import { gsap } from './gsap';

// Scroll to a section, using Lenis when it is active and GSAP ScrollTo otherwise.
export function scrollToId(id, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    gsap.to(window, { duration: 1, scrollTo: { y: el, offsetY: -offset } });
  }
}

export const lockScroll = () => {
  window.__lenis?.stop();
  document.documentElement.classList.add('is-locked');
};
export const unlockScroll = () => {
  window.__lenis?.start();
  document.documentElement.classList.remove('is-locked');
};
