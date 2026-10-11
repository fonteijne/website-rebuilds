import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { values } from '../data/content';
import ScrollReveal from '../components/reactbits/ScrollReveal';
import CountUp from '../components/reactbits/CountUp';
import RevealTitle from '../components/RevealTitle';

const stats = [
  { to: 1979, label: 'Opgericht', sep: '' },
  { to: 3, suffix: 'e', label: 'Generatie aan het roer' },
  { to: 16, label: 'Producten in het assortiment' },
  { to: 100, suffix: '%', label: 'Plantaardig & natuurlijk' },
];

export default function Story() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.story__photo',
          { clipPath: 'inset(100% 0% 0% 0% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.story__photo', start: 'top 85%', once: true } }
        );
        gsap.fromTo('.story__photo img', { scale: 1.35, yPercent: -8 }, {
          scale: 1.05,
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '.story__photo', start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from('.story__year', {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from('.stat', {
          y: 50,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: '.story__stats', start: 'top 88%', once: true },
        });
        gsap.fromTo('.story__underline path', { drawSVG: '0%' }, {
          drawSVG: '100%',
          duration: 1.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: '.story__title-wrap', start: 'top 70%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="story" id="verhaal" ref={root} aria-labelledby="story-title">
      <span className="story__year" aria-hidden="true">1979</span>
      <div className="container">
        <div className="story__title-wrap">
          <p className="kicker kicker--light">Ons verhaal</p>
          <RevealTitle className="display display--light story__title" id="story-title" scrub>
            Vanuit de authentieke Surinaamse keuken naar huishoudens <em>wereldwijd</em>
          </RevealTitle>
          <svg className="story__underline" viewBox="0 0 440 18" aria-hidden="true" preserveAspectRatio="none">
            <path d="M4 12 C 120 2, 300 2, 436 9" />
          </svg>
        </div>

        <div className="story__grid">
          <figure className="story__photo">
            <img src="/img/founder.webp" alt="Historische foto uit de beginjaren van H. Nandan Surinami" loading="lazy" width="946" height="540" />
            <figcaption>Est. 1979</figcaption>
          </figure>
          <div className="story__text">
            <p className="story__since">Opgericht in 1979</p>
            <ScrollReveal baseOpacity={0.15} enableBlur blurStrength={6} baseRotation={2} textClassName="story__reveal" wordAnimationEnd="center center" rotationEnd="center center">
              H. Nandan Surinami heeft met succes de authentieke smaken van Suriname in combinatie met de beste ingrediënten van de wereld sinds de oprichting geproduceerd voor de liefhebbers. Deze missie wordt vandaag de dag door de 3e generatie voortgezet — voor de liefhebbers over de hele wereld.
            </ScrollReveal>
          </div>
        </div>

        <ul className="story__stats">
          {stats.map((s) => (
            <li className="stat" key={s.label}>
              <span className="stat__num">
                <CountUp to={s.to} from={s.to === 1979 ? 1900 : 0} duration={2} separator={s.sep ?? ''} />
                {s.suffix}
              </span>
              <span className="stat__label">{s.label}</span>
            </li>
          ))}
        </ul>

        <ul className="story__values">
          {values.map((v) => (
            <li key={v.title}>
              <span className="story__icon" style={{ '--icon': `url(${v.icon})` }} aria-hidden="true" />
              <span><strong>{v.title}</strong>{v.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
