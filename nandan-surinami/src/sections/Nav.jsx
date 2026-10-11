import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { scrollToId, lockScroll, unlockScroll } from '../lib/scroll';
import Magnet from '../components/reactbits/Magnet';

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
  const [open, setOpen] = useState(false);
  const menuTl = useRef(null);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.from('.nav__inner > *', { y: -40, autoAlpha: 0, stagger: 0.08, duration: 0.9, delay: 0.4 });

      // Hide on scroll down, reveal on scroll up.
      const show = gsap.from(bar.current, { yPercent: -120, paused: true, duration: 0.45, ease: 'power3.out' }).progress(1);
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          bar.current.classList.toggle('nav--solid', self.scroll() > 80);
          if (self.scroll() < 200) return show.play();
          self.direction === -1 ? show.play() : show.reverse();
        },
      });

      menuTl.current = gsap
        .timeline({ paused: true })
        .set('.menu', { visibility: 'visible' })
        .fromTo('.menu__bg', { clipPath: 'circle(0% at calc(100% - 48px) 44px)' }, { clipPath: 'circle(150% at calc(100% - 48px) 44px)', duration: 0.9, ease: 'expo.inOut' })
        .from('.menu__link', { yPercent: 110, rotate: 4, stagger: 0.06, duration: 0.8 }, 0.35)
        .from('.menu__foot > *', { autoAlpha: 0, y: 20, stagger: 0.05, duration: 0.6 }, 0.55);
    },
    { scope: root, dependencies: [ready] }
  );

  const toggle = (next = !open) => {
    setOpen(next);
    if (next) {
      lockScroll();
      menuTl.current?.timeScale(1).play();
    } else {
      unlockScroll();
      menuTl.current?.timeScale(1.6).reverse();
    }
  };

  const go = (id) => (e) => {
    e.preventDefault();
    if (open) toggle(false);
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
          <button className={`nav__burger${open ? ' is-open' : ''}`} onClick={() => toggle()} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Menu sluiten' : 'Menu openen'}>
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
