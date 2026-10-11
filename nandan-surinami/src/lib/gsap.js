// Single place to register every GSAP plugin we use (see gsap-skills: gsap-plugins).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, ScrollToPlugin, DrawSVGPlugin, CustomEase, useGSAP);

// House eases: a soft "pour" for reveals and a punchy "pop" for UI.
CustomEase.create('pour', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('pop', 'M0,0 C0.34,1.56 0.64,1 1,1');

gsap.defaults({ ease: 'pour', duration: 1 });

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
