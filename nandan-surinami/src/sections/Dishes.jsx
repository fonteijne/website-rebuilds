import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { dishes } from '../data/content';
import RevealTitle from '../components/RevealTitle';
import SwipeDots from '../components/SwipeDots';

const fan = [-5, 4, -2.5, 6];

export default function Dishes() {
  const root = useRef(null);
  const deckRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray('.dcard');
        const caps = gsap.utils.toArray('.dishes__cap');
        gsap.set(cards, { rotate: (i) => fan[i % fan.length], scale: (i) => 1 - i * 0.04, y: (i) => i * -14 });
        gsap.set(caps.slice(1), { yPercent: 100, autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: '.dishes__pin',
            start: 'top top',
            end: () => '+=' + window.innerHeight * (cards.length - 1) * 0.9,
            pin: true,
            scrub: 1,
            snap: { snapTo: 1 / (cards.length - 1), duration: 0.6, ease: 'power1.inOut' },
          },
        });

        cards.slice(0, -1).forEach((card, i) => {
          tl.to(card, { xPercent: 130, yPercent: i % 2 ? 25 : -25, rotate: i % 2 ? 24 : -16, autoAlpha: 0, ease: 'power2.in' }, i)
            .to(cards.slice(i + 1), { scale: (j) => 1 - j * 0.04, y: (j) => j * -14, rotate: (j) => fan[(i + 1 + j) % fan.length] }, i)
            .to(caps[i], { yPercent: -100, autoAlpha: 0, duration: 0.5 }, i + 0.2)
            .to(caps[i + 1], { yPercent: 0, autoAlpha: 1, duration: 0.5 }, i + 0.5)
            .to('.dishes__count-num', { yPercent: -100 * (i + 1), duration: 0.6 }, i + 0.3);
        });

        gsap.to('.dishes__steam', { y: -30, autoAlpha: 0, repeat: -1, stagger: 0.6, duration: 2.4, ease: 'sine.out' });
      });
    },
    { scope: root }
  );

  return (
    <section className="dishes" id="vandaag" ref={root} aria-labelledby="dishes-title">
      <div className="dishes__pin">
        <div className="dishes__copy">
          <p className="kicker kicker--light">Inspiratie</p>
          <RevealTitle className="display display--light" id="dishes-title">
            Wat eten we <em>vandaag?</em>
          </RevealTitle>
          <div className="dishes__caps" aria-live="polite">
            {dishes.map((d) => (
              <div className="dishes__cap" key={d.title}>
                <h3>{d.title}</h3>
                <p>Gemaakt met <strong>{d.product}</strong></p>
              </div>
            ))}
          </div>
          <div className="dishes__count" aria-hidden="true">
            <span className="dishes__count-win">
              {dishes.map((_, i) => (
                <span className="dishes__count-num" key={i}>{String(i + 1).padStart(2, '0')}</span>
              ))}
            </span>
            <span>/ {String(dishes.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="dishes__deck" ref={deckRef}>
          {dishes.map((d, i) => (
            <figure className="dcard" key={d.title} style={{ zIndex: dishes.length - i }}>
              <img src={d.img} alt={`${d.title}, gemaakt met ${d.product}`} loading="lazy" width="1100" height="1100" />
              <figcaption>{d.title}</figcaption>
            </figure>
          ))}
          <span className="dishes__steam dishes__steam--1" aria-hidden="true" />
          <span className="dishes__steam dishes__steam--2" aria-hidden="true" />
        </div>
        {/* Phones/tablets (<900px): counter + dots for the native swipe row. */}
        <SwipeDots trackRef={deckRef} itemSelector=".dcard" labels={dishes.map((d) => d.title)} className="dishes__dots" label="Gerechten" counter />
      </div>
    </section>
  );
}
