import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { scrollToId } from '../lib/scroll';
import { socials } from '../data/content';
import Sunburst from '../components/Sunburst';

export default function Footer() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        SplitText.create('.footer__word', {
          type: 'chars',
          mask: 'chars',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 120,
              rotate: (i) => (i % 2 ? 10 : -10),
              stagger: { each: 0.04, from: 'center' },
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'bottom bottom', scrub: 1 },
            }),
        });
        gsap.from('.footer__burst', {
          scale: 0.4,
          rotate: -90,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <footer className="footer" ref={root}>
      <Sunburst className="footer__burst" rays={40} inner={140} outer={520} />
      <div className="container footer__top">
        <img className="footer__logo" src="/img/logo.webp" alt="H. Nandan Surinami" width="110" height="134" loading="lazy" />
        <p className="footer__claim">Authentieke Surinaams-Hindostaanse specerijenmixen. Sinds 1979.</p>
        <ul className="footer__links">
          {[
            ['nieuw', 'Boemboe'],
            ['assortiment', 'Assortiment'],
            ['vandaag', 'Inspiratie'],
            ['verhaal', 'Ons verhaal'],
            ['contact', 'Contact'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>{label}</a>
            </li>
          ))}
        </ul>
        <ul className="footer__links">
          {socials.map((s) => (
            <li key={s.name}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.name} ↗</a></li>
          ))}
        </ul>
      </div>
      <p className="footer__word" aria-label="Nyan Switi — eet smakelijk">Nyan Switi</p>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Nandan Surinami</span>
        <span>Nyan Switi = Eet smakelijk</span>
        <button className="footer__top-btn" onClick={() => scrollToId('top')}>Terug naar boven ↑</button>
      </div>
    </footer>
  );
}
