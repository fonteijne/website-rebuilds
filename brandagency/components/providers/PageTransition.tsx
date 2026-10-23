"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";

type Navigate = (href: string) => void;
const TransitionContext = createContext<Navigate | null>(null);
export const useTransitionNavigate = () => useContext(TransitionContext);

/**
 * Gordijn-transitie tussen pagina's: roze + zwarte laag schuiven omhoog,
 * router.push, nieuwe pagina staat bovenaan, gordijn schuift weg.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const curtain = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const pendingHash = useRef<string | null>(null);

  const reveal = useCallback(() => {
    const el = curtain.current;
    if (!el) return;
    const layers = el.querySelectorAll<HTMLElement>("[data-layer]");
    const label = el.querySelector<HTMLElement>("[data-label]");
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { autoAlpha: 0 });
          covering.current = false;
        },
      })
      .to(label, { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" })
      .to(layers, { yPercent: -100, duration: 0.8, ease: "expo.inOut", stagger: 0.08 }, "<0.05");
  }, []);

  // Nieuwe route geladen → bovenaan beginnen, triggers herberekenen, gordijn open.
  useEffect(() => {
    if (!covering.current) return;
    const hash = pendingHash.current;
    pendingHash.current = null;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);

    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          if (lenis) lenis.scrollTo(target, { immediate: true, force: true, offset: -80 });
          else target.scrollIntoView();
        }
      }
      reveal();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis, reveal]);

  const navigate = useCallback<Navigate>(
    (href) => {
      const url = new URL(href, window.location.href);
      const samePage = url.pathname === window.location.pathname;
      if (samePage && url.hash) {
        const target = document.getElementById(url.hash.slice(1));
        if (target) {
          if (lenis) lenis.scrollTo(target, { offset: -80 });
          else target.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", url.hash);
          return;
        }
      }
      if (samePage) {
        // Zelfde pagina (evt. ander filter): geen gordijn, pathname wijzigt niet.
        if (url.search !== window.location.search) router.push(href, { scroll: false });
        else if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const el = curtain.current;
      if (!el || prefersReducedMotion() || covering.current) {
        router.push(href);
        return;
      }
      covering.current = true;
      pendingHash.current = url.hash ? url.hash.slice(1) : null;
      const layers = el.querySelectorAll<HTMLElement>("[data-layer]");
      const label = el.querySelector<HTMLElement>("[data-label]");
      lenis?.stop();
      gsap
        .timeline({
          onComplete: () => {
            lenis?.start();
            router.push(url.pathname + url.search, { scroll: false });
          },
        })
        .set(el, { autoAlpha: 1 })
        .fromTo(layers, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "expo.inOut", stagger: 0.08 })
        .fromTo(label, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.25");
      router.prefetch(url.pathname);
    },
    [lenis, router],
  );

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div
        ref={curtain}
        aria-hidden="true"
        className="pointer-events-none invisible fixed inset-0 z-[90] overflow-hidden opacity-0"
      >
        <div data-layer className="absolute inset-0 bg-pink" />
        <div data-layer className="absolute inset-0 bg-coal" />
        <div data-label className="absolute inset-0 grid place-items-center">
          <span className="spaced text-sm text-paper/80 md:text-base">Brand Agency</span>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
