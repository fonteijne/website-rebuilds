"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { nav, site } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import TLink from "@/components/TLink";

/**
 * Volledig-scherm menu, afgeleid van React Bits' StaggeredMenu:
 * gekleurde voorlagen (roze, blauw) schuiven in, daarna het paneel en
 * gestaggerde items met nummering. Origineel had ook een fullscreen menu.
 */
export default function Menu() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const scope = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      if (!mounted || !overlay.current) return;
      const o = gsap.utils.selector(overlay);
      const b = gsap.utils.selector(scope);
      const q = (sel: string) => [...o(sel), ...b(sel)];
      gsap.set([q("[data-prelayer]"), q("[data-panel]")], { xPercent: 100 });
      gsap.set(q("[data-item-label]"), { yPercent: 140, rotate: 8 });
      gsap.set(q("[data-fade]"), { autoAlpha: 0, y: 20 });

      tl.current = gsap
        .timeline({ paused: true })
        .set(overlay.current, { autoAlpha: 1 })
        .to(q("[data-prelayer]"), { xPercent: 0, duration: 0.5, ease: "power4.out", stagger: 0.07 })
        .to(q("[data-panel]"), { xPercent: 0, duration: 0.65, ease: "power4.out" }, "-=0.35")
        .to(
          q("[data-item-label]"),
          { yPercent: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.06 },
          "-=0.45",
        )
        .to(q("[data-fade]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 }, "-=0.7")
        .to(q("[data-burger-top]"), { rotate: 45, y: 4, duration: 0.4, ease: "power3.inOut" }, 0)
        .to(q("[data-burger-bottom]"), { rotate: -45, y: -4, duration: 0.4, ease: "power3.inOut" }, 0)
        .to(q("[data-toggle-text]"), { yPercent: -50, duration: 0.5, ease: "power4.inOut" }, 0);
    },
    { scope, dependencies: [mounted] },
  );

  const setMenu = useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;
      openRef.current = next;
      setOpen(next);
      document.documentElement.toggleAttribute("data-menu-lock", next);
      const t = tl.current;
      if (!t) return;
      if (next) {
        lenis?.stop();
        t.timeScale(1).play();
      } else {
        lenis?.start();
        t.timeScale(1.8).reverse();
      }
    },
    [lenis],
  );

  // Sluit bij navigatie en met Escape.
  useEffect(() => setMenu(false), [pathname, setMenu]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenu]);

  return (
    <div ref={scope}>
      <button
        type="button"
        onClick={() => setMenu(!openRef.current)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Menu sluiten" : "Menu openen"}
        className="group relative z-[70] flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-paper"
      >
        <span className="relative hidden h-[1em] overflow-hidden leading-none sm:block" aria-hidden="true">
          <span data-toggle-text className="flex flex-col">
            <span className="h-[1em]">Menu</span>
            <span className="h-[1em]">Sluit</span>
          </span>
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-pink transition-transform duration-300 group-hover:scale-110">
          <span className="flex w-4 flex-col gap-[6px]" aria-hidden="true">
            <span data-burger-top className="block h-[2px] w-full bg-white" />
            <span data-burger-bottom className="block h-[2px] w-full bg-white" />
          </span>
        </span>
      </button>

      {mounted &&
        createPortal(
      <div
        ref={overlay}
        className={`invisible fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        onClick={(e) => e.target === e.currentTarget && setMenu(false)}
      >
        <div data-prelayer className="absolute inset-y-0 right-0 w-full bg-pink lg:w-[min(48rem,60vw)]" />
        <div data-prelayer className="absolute inset-y-0 right-0 w-full bg-blue lg:w-[min(48rem,60vw)]" />
        <nav
          id="site-menu"
          data-panel
          aria-label="Hoofdmenu"
          aria-hidden={!open}
          data-lenis-prevent
          className="absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-coal px-6 pb-8 pt-28 sm:px-10 lg:w-[min(48rem,60vw)] lg:px-16"
        >
          <ul className="flex flex-col gap-1 [counter-reset:menu]">
            {nav.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href} className="overflow-hidden">
                  <TLink
                    href={item.href}
                    tabIndex={open ? 0 : -1}
                    className="group relative inline-flex items-start gap-3 py-1 text-[clamp(1.7rem,6.6vw,2.9rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-paper transition-colors hover:text-pink"
                    aria-current={active ? "page" : undefined}
                  >
                    <span data-item-label className="inline-block origin-bottom-left">
                      {item.label}
                    </span>
                    <span
                      data-fade
                      className="mt-1 text-xs font-medium tracking-normal text-pink [counter-increment:menu] before:content-[counter(menu,decimal-leading-zero)]"
                      aria-hidden="true"
                    />
                    {active && <span className="sr-only">(huidige pagina)</span>}
                  </TLink>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto grid gap-6 pt-12 text-sm text-paper/70 sm:grid-cols-2">
            <div data-fade>
              <p className="kicker mb-3 text-pink">Contact</p>
              <a className="link-underline block" href={`mailto:${site.email}`} tabIndex={open ? 0 : -1}>
                {site.email}
              </a>
              <a className="link-underline block" href={site.phoneHref} tabIndex={open ? 0 : -1}>
                {site.phone}
              </a>
            </div>
            <div data-fade>
              <p className="kicker mb-3 text-pink">Socials</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a className="link-underline" href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>,
          document.body,
        )}
    </div>
  );
}
