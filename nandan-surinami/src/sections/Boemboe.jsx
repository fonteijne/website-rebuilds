import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { scrollToId } from '../lib/scroll';
import { boemboes } from '../data/content';
import RevealTitle from '../components/RevealTitle';

export default function Boemboe({ onRecipe }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = root.current.querySelector('.boemboe__track');
        const distance = () => track.scrollWidth - window.innerWidth;

        // Fake horizontal scroll: ease must be "none" (gsap-scrolltrigger skill).
        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.boemboe__pin',
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.to('.boemboe__bar', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.boemboe__pin', start: 'top top', end: () => '+=' + distance(), scrub: true },
        });

        gsap.utils.toArray('.bpanel').forEach((panel) => {
          const pack = panel.querySelector('.bpanel__pack');
          const dish = panel.querySelector('.bpanel__dish img');
          const body = panel.querySelectorAll('.bpanel__body > *');
          if (pack)
            gsap.from(pack, {
              yPercent: 40,
              rotate: -24,
              scale: 0.8,
              ease: 'none',
              scrollTrigger: { containerAnimation: scrollTween, trigger: panel, start: 'left 95%', end: 'left 35%', scrub: true },
            });
          if (dish)
            gsap.fromTo(dish, { xPercent: -8, scale: 1.15 }, {
              xPercent: 8,
              scale: 1.15,
              ease: 'none',
              scrollTrigger: { containerAnimation: scrollTween, trigger: panel, start: 'left right', end: 'right left', scrub: true },
            });
          if (body.length)
            gsap.from(body, {
              x: 80,
              autoAlpha: 0,
              stagger: 0.06,
              duration: 0.9,
              scrollTrigger: { containerAnimation: scrollTween, trigger: panel, start: 'left 70%', toggleActions: 'play none none reverse' },
            });
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="boemboe" id="nieuw" ref={root} aria-labelledby="boemboe-title">
      <div className="boemboe__intro container">
        <p className="kicker"><span className="kicker__tag">Nieuw</span> in ons assortiment</p>
        <RevealTitle className="display" id="boemboe-title">
          Hindostaanse <em>Boemboe</em>
        </RevealTitle>
        <p className="lead">
          Vijf kant-en-klare kruidenmixen voor de bekendste Surinaamse gerechten. 70 gram, voor 2–3 personen
          en klaar in ca. 30 minuten. Jij voegt alleen het vlees, de vis of de groente toe.
        </p>
      </div>

      <div className="boemboe__pin">
        <div className="boemboe__track">
          {boemboes.map((b, i) => (
            <article className="bpanel" key={b.id} style={{ '--accent': b.accent }}>
              <div className="bpanel__visual">
                <div className="bpanel__dish">
                  <img src={b.dish} alt={`Gerecht: ${b.name}`} loading="lazy" width="1600" height="662" />
                </div>
                <img className="bpanel__pack" src={b.pack} alt={`Verpakking Hindostaanse Boemboe ${b.name}`} loading="lazy" width="514" height="800" />
              </div>
              <div className="bpanel__body">
                <span className="bpanel__num">{String(i + 1).padStart(2, '0')} / {String(boemboes.length).padStart(2, '0')}</span>
                <h3 className="bpanel__title">{b.name}</h3>
                <p className="bpanel__text">{b.tagline}</p>
                <ul className="chips">
                  <li>{b.weight}</li>
                  <li>{b.serves}</li>
                  <li>Ca. 30 min</li>
                </ul>
                <p className="bpanel__for">{b.for}</p>
                <button className="btn btn--dark" onClick={() => onRecipe(b)}>
                  Bereidingswijze
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </article>
          ))}
          <div className="bpanel bpanel--end">
            <p className="bpanel__end-kicker">Meer smaken?</p>
            <a href="#assortiment" className="bpanel__end-link" onClick={(e) => { e.preventDefault(); scrollToId('assortiment'); }}>
              Bekijk ons<br />assortiment
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
        <div className="boemboe__progress" aria-hidden="true"><span className="boemboe__bar" /></div>
      </div>
    </section>
  );
}
