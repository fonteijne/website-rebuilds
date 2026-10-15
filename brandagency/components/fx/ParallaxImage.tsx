"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Beeld dat met een clip-path onthuld wordt en daarna met scroll mee-parallaxt.
 * Het beeld is iets groter dan het frame, zodat er ruimte is om te bewegen.
 */
type Props = {
  src: StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
  amount?: number;
  reveal?: "up" | "left" | "right" | "none";
  preload?: boolean;
};

const clipFrom = {
  up: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  none: "inset(0% 0% 0% 0%)",
};

export default function ParallaxImage({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  amount = 12,
  reveal = "up",
  preload = false,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !frame.current || !inner.current) return;
      if (reveal !== "none") {
        gsap.fromTo(
          frame.current,
          { clipPath: clipFrom[reveal] },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.inOut",
            scrollTrigger: { trigger: frame.current, start: "top 85%", once: true },
          },
        );
        gsap.from(inner.current, {
          scale: 1.3,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: frame.current, start: "top 85%", once: true },
        });
      }
      gsap.fromTo(
        inner.current.firstElementChild,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div ref={inner} className="absolute inset-0">
        <div className="absolute -inset-y-[8%] inset-x-0 will-change-transform">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" placeholder="blur" preload={preload} />
        </div>
      </div>
    </div>
  );
}
