"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Eén keer registreren (gsap-react skill: nooit binnen een component).
gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, SplitText);

export { gsap, ScrollTrigger, Flip, SplitText, useGSAP };

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
