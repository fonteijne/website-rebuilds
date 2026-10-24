import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register once, before any useGSAP/ScrollTrigger usage (gsap-skills: gsap-react / gsap-scrolltrigger).
// Every component imports gsap, ScrollTrigger and useGSAP from here, never from 'gsap' directly.
gsap.registerPlugin(useGSAP, ScrollTrigger);

gsap.defaults({ ease: 'power3.out', duration: 0.6 });

export const REDUCED = '(prefers-reduced-motion: reduce)';
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';

export { gsap, ScrollTrigger, useGSAP };
