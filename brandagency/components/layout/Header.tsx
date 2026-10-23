"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Logo from "@/components/Logo";
import TLink from "@/components/TLink";
import Menu from "./Menu";

/** Vaste header die wegschuift bij naar beneden scrollen en terugkomt bij omhoog. */
export default function Header() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const bar = el.querySelector("[data-bar]");
    const show = gsap.quickTo(bar, "yPercent", { duration: 0.45, ease: "power3.out" });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        el.toggleAttribute("data-scrolled", y > 40);
        if (document.documentElement.hasAttribute("data-menu-lock")) return;
        show(self.direction === 1 && y > 300 ? -110 : 0);
      },
    });
  });

  return (
    <header ref={ref} className="group/header fixed inset-x-0 top-0 z-[70]">
      <div data-bar className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-data-[scrolled]/header:opacity-100"
        />
        <div className="container-x relative flex h-20 items-center justify-between md:h-24">
          <TLink href="/" aria-label="Brand Agency – home" className="block w-28 text-paper md:w-36">
            <Logo className="h-auto w-full" />
          </TLink>
          <div className="flex items-center gap-5">
            <TLink
              href="/contact"
              className="hidden text-xs font-bold uppercase tracking-[0.3em] text-paper transition-colors hover:text-pink md:block"
            >
              Challenge ons
            </TLink>
            <Menu />
          </div>
        </div>
      </div>
    </header>
  );
}
