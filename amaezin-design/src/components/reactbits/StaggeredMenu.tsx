'use client';

/**
 * Adapted from React Bits — StaggeredMenu (https://reactbits.dev).
 * Changes: Next <Link> + close on navigate, Lenis stopped while open, Escape to close,
 * focus moved into the panel, inert when closed, useGSAP for setup/cleanup,
 * Dutch labels, logo slot, and a header that is part of the page chrome.
 */
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export interface StaggeredMenuItem {
  label: string;
  link: string;
}

interface StaggeredMenuProps {
  items: StaggeredMenuItem[];
  socialItems?: StaggeredMenuItem[];
  colors?: string[];
  accentColor?: string;
  footer?: React.ReactNode;
}

const LABEL_OPEN = 'Menu';
const LABEL_CLOSE = 'Sluit';

export default function StaggeredMenu({
  items,
  socialItems = [],
  colors = ['#FD62C2', '#1a1a1a'],
  accentColor = '#FD62C2',
  footer
}: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const pathname = usePathname();
  const lenis = useLenis();

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [textLines, setTextLines] = useState<string[]>([LABEL_OPEN, LABEL_CLOSE]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  // Header: solid once scrolled, slides away while scrolling down, returns on scroll up.
  useGSAP(
    () => {
      const hide = gsap.quickTo(headerRef.current, 'yPercent', { duration: 0.4, ease: 'power3.out' });
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          setScrolled(self.scroll() > 40);
          if (openRef.current) return hide(0);
          hide(self.direction === 1 && self.scroll() > 200 ? -110 : 0);
        }
      });
    },
    { dependencies: [pathname], revertOnUpdate: true }
  );

  const { contextSafe } = useGSAP(
    () => {
      const layers = gsap.utils.toArray<HTMLElement>('.sm-prelayer');
      // Inline style keeps them off-screen before hydration; hand over to GSAP (x:0 + xPercent).
      gsap.set([panelRef.current, ...layers], { x: 0, xPercent: 100 });
      gsap.set(plusVRef.current, { rotate: 90 });
    },
    { scope: rootRef }
  );

  const playOpen = contextSafe(() => {
    const panel = panelRef.current!;
    const layers = gsap.utils.toArray<HTMLElement>('.sm-prelayer', preLayersRef.current);
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const labels = panel.querySelectorAll('.sm-panel-itemLabel');
    const numbers = panel.querySelectorAll('.sm-panel-item');
    const extras = panel.querySelectorAll('.sm-extra');

    gsap.set(labels, { yPercent: 140, rotate: 10 });
    gsap.set(numbers, { '--sm-num-opacity': 0 });
    gsap.set(extras, { y: 25, opacity: 0 });

    const tl = gsap.timeline();
    layers.forEach((el, i) => tl.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07));
    const panelAt = (layers.length - 1) * 0.07 + 0.08;
    tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, panelAt);
    tl.to(labels, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: 0.08 }, panelAt + 0.1);
    tl.to(numbers, { '--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, panelAt + 0.2);
    tl.to(extras, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08 }, panelAt + 0.3);
    openTlRef.current = tl;
  });

  const playClose = contextSafe(() => {
    openTlRef.current?.kill();
    const layers = gsap.utils.toArray<HTMLElement>('.sm-prelayer', preLayersRef.current);
    closeTweenRef.current = gsap.to([...layers, panelRef.current], {
      xPercent: 100,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto'
    });
  });

  const animateToggle = contextSafe((opening: boolean) => {
    gsap.to(plusHRef.current, { rotate: opening ? 45 : 0, duration: opening ? 0.5 : 0.35, ease: 'power4.out' });
    gsap.to(plusVRef.current, { rotate: opening ? -45 : 90, duration: opening ? 0.5 : 0.35, ease: 'power4.out' });

    const from = opening ? LABEL_OPEN : LABEL_CLOSE;
    const to = opening ? LABEL_CLOSE : LABEL_OPEN;
    const seq = [from, to, from, to];
    setTextLines(seq);
    gsap.fromTo(
      textInnerRef.current,
      { yPercent: 0 },
      { yPercent: -((seq.length - 1) / seq.length) * 100, duration: 0.5 + seq.length * 0.07, ease: 'power4.out' }
    );
  });

  const setMenu = useCallback(
    (next: boolean) => {
      if (openRef.current === next) return;
      openRef.current = next;
      setOpen(next);
      if (next) {
        playOpen();
        lenis?.stop();
        requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }));
      } else {
        playClose();
        lenis?.start();
      }
      animateToggle(next);
    },
    [playOpen, playClose, animateToggle, lenis]
  );

  // Close whenever the route changes (only on an actual pathname change — setMenu's identity changes every render).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setMenu(false);
  }, [pathname, setMenu]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        toggleBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setMenu]);

  return (
    <div ref={rootRef} className="sm-scope" style={{ '--sm-accent': accentColor } as React.CSSProperties} data-open={open || undefined}>
      <header
        ref={headerRef}
        data-scrolled={scrolled || undefined}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 transition-[background-color,backdrop-filter] duration-300 data-[scrolled]:bg-ink/75 data-[scrolled]:backdrop-blur-md sm:px-6 md:px-10 md:py-5 [.sm-scope[data-open]_&]:bg-transparent [.sm-scope[data-open]_&]:backdrop-blur-none"
      >
        <Link href="/" aria-label="Amaezin Design — home" className="relative block h-8 w-[100px] md:h-10 md:w-[125px]">
          <Image
            src="/images/logo-wit.png"
            alt="Amaezin Design"
            fill
            priority
            sizes="125px"
            className={`object-contain object-left transition-[filter] duration-300 ${open ? 'max-md:invert' : ''}`}
          />
        </Link>

        <button
          ref={toggleBtnRef}
          type="button"
          onClick={() => setMenu(!openRef.current)}
          aria-label={open ? 'Sluit menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-menu-panel"
          className={`relative inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold uppercase tracking-widest transition-colors duration-300 ${open ? 'text-ink' : 'text-white'}`}
        >
          <span className="relative inline-block h-[1em] overflow-hidden leading-none" aria-hidden>
            <span ref={textInnerRef} className="flex flex-col leading-none">
              {textLines.map((l, i) => (
                <span className="block h-[1em] leading-none" key={i}>
                  {l}
                </span>
              ))}
            </span>
          </span>
          <span className="relative inline-flex size-[14px] items-center justify-center" aria-hidden>
            <span ref={plusHRef} className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-current" />
            <span ref={plusVRef} className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-current" />
          </span>
        </button>
      </header>

      {/* Click-away backdrop (desktop, where the panel doesn't cover the full width) */}
      <div
        aria-hidden
        onClick={() => setMenu(false)}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <div ref={preLayersRef} className="sm-prelayers pointer-events-none fixed inset-y-0 right-0 z-40 w-full md:w-[min(560px,45vw)]" aria-hidden>
        {colors.map((c, i) => (
          <div key={i} className="sm-prelayer absolute inset-0" style={{ background: c, transform: 'translateX(100%)' }} />
        ))}
      </div>

      <aside
        id="site-menu-panel"
        ref={panelRef}
        aria-label="Hoofdmenu"
        inert={!open}
        className="fixed inset-y-0 right-0 z-40 flex w-full flex-col overflow-y-auto bg-paper px-6 pb-8 pt-24 text-ink md:w-[min(560px,45vw)] md:px-12 md:pt-32"
        style={{ transform: 'translateX(100%)' }}
        data-lenis-prevent
      >
        <ul className="sm-panel-list flex flex-col gap-1" role="list">
          {items.map((it, idx) => {
            const active = it.link === '/' ? pathname === '/' : pathname.startsWith(it.link);
            return (
              <li key={it.link} className="relative overflow-hidden leading-none">
                <Link
                  href={it.link}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => it.link === pathname && setMenu(false)}
                  className={`sm-panel-item relative inline-block pr-[1.6em] font-display text-[clamp(2.6rem,11vw,4.25rem)] font-extrabold uppercase leading-[0.95] tracking-tight transition-colors duration-200 hover:text-[var(--sm-accent)] focus-visible:text-[var(--sm-accent)] focus-visible:outline-none ${
                    active ? 'text-[var(--sm-accent)]' : ''
                  }`}
                  data-index={String(idx + 1).padStart(2, '0')}
                >
                  <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-6 pt-10">
          {footer && <div className="sm-extra">{footer}</div>}
          {socialItems.length > 0 && (
            <ul className="sm-extra flex flex-wrap gap-x-5 gap-y-2" role="list" aria-label="Socials">
              {socialItems.map(s => (
                <li key={s.link}>
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-base font-semibold underline-offset-4 hover:text-[var(--sm-accent)] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <style>{`
.sm-scope .sm-panel-item::after { content: attr(data-index); position: absolute; top: 0.15em; right: 0.2em; font-family: var(--font-mono), monospace; font-size: 13px; font-weight: 500; letter-spacing: 0; color: var(--sm-accent); opacity: var(--sm-num-opacity, 0); pointer-events: none; }
      `}</style>
    </div>
  );
}
