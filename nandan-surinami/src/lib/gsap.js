// Single place to register every GSAP plugin we use (see gsap-skills: gsap-plugins).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, ScrollToPlugin, DrawSVGPlugin, CustomEase, Observer, useGSAP);

// Phones: the address bar showing/hiding resizes the viewport on every scroll direction change.
// Don't let that trigger a full ScrollTrigger.refresh() (layout jump mid-scroll). GSAP already
// defaults to this on touch-only devices; set explicitly so the intent is documented. We do not use
// normalizeScroll(): the pinned sections are desktop-only, so native touch scrolling stays untouched.
ScrollTrigger.config({ ignoreMobileResize: true });

// House eases: a soft "pour" for reveals and a punchy "pop" for UI.
CustomEase.create('pour', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('pop', 'M0,0 C0.34,1.56 0.64,1 1,1');

gsap.defaults({ ease: 'pour', duration: 1 });

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile-first entrance values: phones get ~40% shorter travel and slightly quicker tweens.
// Use inside gsap.matchMedia() with a `small: MQ.small` condition.
export const motionScale = (small) => ({
  d: (px) => (small ? Math.round(px * 0.6) : px),
  t: (s) => (small ? +(s * 0.85).toFixed(3) : s),
});

export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
