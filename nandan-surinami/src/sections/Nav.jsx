import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { scrollToId, lockScroll, unlockScroll } from '../lib/scroll';
import Magnet from '../components/reactbits/Magnet';
import { MQ } from '../lib/media';

const links = [
  { id: 'nieuw', label: 'Boemboe' },
  { id: 'assortiment', label: 'Assortiment' },
  { id: 'vandaag', label: 'Inspiratie' },
  { id: 'verkrijgbaar', label: 'Verkrijgbaar' },
  { id: 'verhaal', label: 'Ons verhaal' },
];

export default function Nav({ ready }) {
  const root = useRef(null);
  const bar = useRef(null);
  const burger = useRef(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const menuTl = useRef(null);
  const showTl = useRef(null);

  // The menu timeline exists from the first render, so a tap on the burger always works,
  // even before the preloader hands over.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, reduced: MQ.reduced }, ({ conditions }) => {
        const from = 'circle(0% at calc(100% - 48px) 44px)';
        const to = 'circle(150% at calc(100% - 48px) 44px)';
        const tl = gsap.timeline({ paused: true }).set('.menu', { visibility: 'visible' });
        if (conditions.reduced) {
          tl.fromTo('.menu__bg', { clipPath: from }, { clipPath: to, duration: 0.01, ease: 'none' });
        } else {
          tl.fromTo('.menu__bg', { clipPath: from }, { clipPath: to, duration: 0.9, ease: 'expo.inOut' })
            .from('.menu__link', { yPercent: 110, rotate: 4, stagger: 0.06, duration: 0.8 }, 0.35)
            .from('.menu__foot > *', { autoAlpha: 0, y: 20, stagger: 0.05, duration: 0.6 }, 0.55);
        }
        if (openRef.current) tl.progress(1);
        menuTl.current = tl;
        return () => {
          menuTl.current = null;
        };
      });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, small: MQ.small }, ({ conditions }) => {
        if (!conditions.motion) return;
        gsap.from('.nav__inner > *', { y: conditions.small ? -24 : -40, autoAlpha: 0, stagger: 0.08, duration: conditions.small ? 0.75 : 0.9, delay: 0.4 });
      });

      // Hide on scroll down, reveal on scroll up (never while the menu is open).
      const show = gsap.from(bar.current, { yPercent: -120, paused: true, duration: 0.45, ease: 'power3.out' }).progress(1);
      showTl.current = show;
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          bar.current.classList.toggle('nav--solid', self.scroll() > 80);
          if (openRef.current || self.scroll() < 200) return show.play();
          self.direction === -1 ? show.play() : show.reverse();
        },
      });
    },
    { scope: root, dependencies: [ready] }
  );

  const toggle = useCallback((next = !openRef.current) => {
    if (next === openRef.current) return;
    openRef.current = next;
    setOpen(next);
    if (next) {
      lockScroll();
      showTl.current?.play();
      menuTl.current?.timeScale(1).play();
    } else {
      unlockScroll();
      menuTl.current?.timeScale(1.6).reverse();
    }
  }, []);

  // Keyboard: Escape closes, Tab stays inside burger + menu links while the menu is open.
  useEffect(() => {
    if (!open) return undefined;
    const menuLinks = () => Array.from(root.current.querySelectorAll('.menu__link'));
    const focusFirst = setTimeout(() => menuLinks()[0]?.focus({ preventScroll: true }), 350);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggle(false);
        burger.current?.focus({ preventScroll: true });
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [burger.current, ...menuLinks()].filter(Boolean);
      const first = items[0];
      const last = items[items.length - 1];
      const inside = items.includes(document.activeElement);
      if (!inside) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(focusFirst);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, toggle]);

  const go = (id) => (e) => {
    e.preventDefault();
    if (openRef.current) toggle(false);
    scrollToId(id);
  };

  return (
    <div className="nav-root" ref={root}>
      <header className="nav" ref={bar}>
        <div className="nav__inner">
          <a href="#top" className="nav__logo" onClick={go('top')} aria-label="H. Nandan Surinami — naar boven">
            <img src="/img/logo.webp" alt="" width="52" height="63" />
            <span className="nav__word">H. Nandan<br />Surinami</span>
          </a>
          <nav className="nav__links" aria-label="Hoofdmenu">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="nav__link">
                <span className="nav__clip"><span data-text={l.label}>{l.label}</span></span>
              </a>
            ))}
          </nav>
          <Magnet padding={40} magnetStrength={4} wrapperClassName="nav__cta-wrap">
            <a href="#contact" className="btn btn--red nav__cta" onClick={go('contact')}>Contact</a>
          </Magnet>
          <button ref={burger} type="button" className={`nav__burger${open ? ' is-open' : ''}`} onClick={() => toggle()} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Menu sluiten' : 'Menu openen'}>
            <span /><span />
          </button>
        </div>
      </header>

      {/* Outside the header: its hide/show transform would trap a fixed overlay. */}
      <div className="menu" id="menu" aria-hidden={!open}>
        <div className="menu__bg" />
        <nav className="menu__nav" aria-label="Mobiel menu">
          {[...links, { id: 'contact', label: 'Contact' }].map((l, i) => (
            <span className="menu__mask" key={l.id}>
              <a className="menu__link" href={`#${l.id}`} onClick={go(l.id)} tabIndex={open ? 0 : -1}>
                <small>0{i + 1}</small>{l.label}
              </a>
            </span>
          ))}
        </nav>
        <div className="menu__foot">
          <span>Sinds 1979</span>
          <span>Nyan Switi!</span>
        </div>
      </div>
    </div>
  );
}
