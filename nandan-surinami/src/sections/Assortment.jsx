import { useMemo, useRef, useState } from 'react';
import { gsap, Flip, ScrollTrigger, useGSAP, motionScale } from '../lib/gsap';
import { matches, MQ } from '../lib/media';
import { boemboes, products } from '../data/content';
import TiltedCard from '../components/reactbits/TiltedCard';
import RevealTitle from '../components/RevealTitle';

const all = [
  ...boemboes.map((b) => ({ id: `b-${b.id}`, name: b.name, cat: 'boemboe', desc: b.tagline, sizes: [b.weight], img: b.pack, isNew: true, recipe: b })),
  ...products,
];

const filters = [
  { id: 'all', label: 'Alles' },
  { id: 'boemboe', label: 'Boemboe' },
  { id: 'masala', label: "Masala's" },
  { id: 'mix', label: 'Besan & mixen' },
];

export default function Assortment({ onRecipe }) {
  const root = useRef(null);
  const [filter, setFilter] = useState('all');
  const flipState = useRef(null);
  const counts = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.id, f.id === 'all' ? all.length : all.filter((p) => p.cat === f.id).length])),
    []
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, small: MQ.small }, ({ conditions }) => {
        if (!conditions.motion) return;
        const { d, t } = motionScale(conditions.small);
        gsap.from('.filters', { y: d(30), autoAlpha: 0, duration: t(0.9), scrollTrigger: { trigger: '.filters', start: 'top 90%', once: true } });
        gsap.set('.pcard', { y: d(100), autoAlpha: 0 });
        ScrollTrigger.batch('.pcard', {
          start: 'top 92%',
          once: true,
          onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, stagger: conditions.small ? 0.06 : 0.08, duration: t(1), overwrite: true }),
        });
      });
    },
    { scope: root }
  );

  // Flip: animate cards from their old layout to the new filtered layout.
  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        targets: '.pcard',
        duration: 0.8,
        ease: 'power3.inOut',
        scale: true,
        absolute: true,
        stagger: 0.03,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, delay: 0.2 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.7, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
      flipState.current = null;
    },
    { scope: root, dependencies: [filter] }
  );

  // Phones: the filter bar is a horizontal scroll row; keep the chosen pill fully in view.
  const revealPill = (btn) => {
    const row = btn?.parentElement;
    if (!row || row.scrollWidth <= row.clientWidth + 1) return;
    const r = btn.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const left = row.scrollLeft + (r.left + r.width / 2) - (box.left + box.width / 2);
    row.scrollTo({ left, behavior: matches(MQ.reduced) ? 'auto' : 'smooth' });
  };

  const choose = (id, e) => {
    revealPill(e?.currentTarget);
    if (id === filter) return;
    const cards = root.current.querySelectorAll('.pcard');
    // Cards not yet revealed by the scroll batch should take part in the Flip fully visible.
    gsap.set(cards, { autoAlpha: 1, y: 0 });
    flipState.current = Flip.getState(cards);
    setFilter(id);
  };

  return (
    <section className="assortment" id="assortiment" ref={root} aria-labelledby="assortment-title">
      <div className="container">
        <div className="assortment__head">
          <p className="kicker">Ons assortiment</p>
          <RevealTitle className="display" id="assortment-title">
            Alle smaken van <em>Suriname</em>
          </RevealTitle>
        </div>

        <div className="filters" role="tablist" aria-label="Filter producten">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`filter${filter === f.id ? ' is-active' : ''}`}
              onClick={(e) => choose(f.id, e)}
            >
              {f.label} <sup>{counts[f.id]}</sup>
            </button>
          ))}
        </div>

        <ul className="pgrid">
          {all.map((p) => {
            const hidden = filter !== 'all' && p.cat !== filter;
            return (
              <li key={p.id} className={`pcard pcard--${p.cat}${hidden ? ' is-hidden' : ''}`} data-flip-id={p.id} hidden={hidden}>
                {p.isNew && <span className="pcard__badge">Nieuw!</span>}
                {p.hot && <span className="pcard__badge pcard__badge--hot">Pittig</span>}
                <div className="pcard__media">
                  <TiltedCard
                    imageSrc={p.img}
                    altText={p.name}
                    containerHeight="100%"
                    containerWidth="100%"
                    imageHeight="100%"
                    imageWidth="100%"
                    rotateAmplitude={12}
                    scaleOnHover={1.06}
                    showMobileWarning={false}
                    showTooltip={false}
                  />
                </div>
                <div className="pcard__body">
                  <h3 className="pcard__name">{p.name}</h3>
                  <p className="pcard__desc">{p.desc}</p>
                  <div className="pcard__foot">
                    <ul className="sizes" aria-label="Verkrijgbaar in">
                      {p.sizes.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                    {p.recipe && (
                      <button className="pcard__recipe" onClick={() => onRecipe(p.recipe)} aria-label={`Bereidingswijze ${p.name}`}>
                        Recept
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
