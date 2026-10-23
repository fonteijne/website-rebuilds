"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once, before any useGSAP/ScrollTrigger usage (gsap-skills: gsap-react / gsap-scrolltrigger).
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip);

gsap.defaults({ ease: "power3.out", duration: 0.9 });

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP };
