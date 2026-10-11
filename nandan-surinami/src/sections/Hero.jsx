import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { scrollToId } from '../lib/scroll';
import Sunburst from '../components/Sunburst';
import RotatingText from '../components/reactbits/RotatingText';
import CircularText from '../components/reactbits/CircularText';
import Magnet from '../components/reactbits/Magnet';

const packs = [
  { src: '/img/kerrie-masala.webp', alt: 'Kerrie Masala', depth: 1.2 },
  { src: '/img/extra-hot-masala.webp', alt: 'Extra Hot Masala', depth: 0.6 },
  { src: '/img/roti-kip-masala.webp', alt: 'Roti Kip Masala', depth: 1.6 },
  { src: '/img/doksa-masala.webp', alt: 'Doksa Masala', depth: 0.9 },
];

export default function Hero({ ready }) {
  const root = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 900px)',
        },
        ({ conditions }) => {
          if (!conditions.motion) return;

          // Hold the hero hidden until the preloader hands over.
          if (!ready) {
            gsap.set(['.hero__title', '.hero__sub', '.hero__ctas', '.hero__pack', '.hero__badge', '.hero__eyebrow'], { autoAlpha: 0 });
            return;
          }

          const split = SplitText.create('.hero__line', { type: 'chars', mask: 'chars', charsClass: 'hero__char' });

          gsap
            .timeline({ defaults: { ease: 'pour' } })
            .set(['.hero__title', '.hero__sub', '.hero__ctas', '.hero__badge', '.hero__eyebrow'], { autoAlpha: 1 })
            .from('.sunburst__ray', { scale: 0, opacity: 0, transformOrigin: '50% 50%', stagger: { each: 0.015, from: 'center' }, duration: 1.2 }, 0)
            .from('.hero__eyebrow', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.1)
            .from(split.chars, { yPercent: 110, rotate: 8, stagger: 0.035, duration: 1.1 }, 0.15)
            .from('.hero__sub', { y: 30, autoAlpha: 0, duration: 0.9 }, 0.7)
            .from('.hero__ctas > *', { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.9 }, 0.85)
            .fromTo('.hero__pack', { autoAlpha: 0, y: 260, rotate: (i) => (i % 2 ? 40 : -40), scale: 0.6 }, { autoAlpha: 1, y: 0, rotate: 0, scale: 1, ease: 'pop', stagger: 0.09, duration: 1.2 }, 0.45)
            .from('.hero__badge', { scale: 0, rotate: -90, duration: 1, ease: 'pop' }, 1);

          gsap.to('.hero__burst', { rotate: 360, duration: 90, repeat: -1, ease: 'none' });

          // Scroll: packs drift at different speeds, title lifts, media unfolds.
          gsap.utils.toArray('.hero__pack-inner').forEach((el, i) => {
            gsap.to(el, {
              yPercent: -60 * packs[i].depth,
              rotate: i % 2 ? 18 : -18,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
            });
          });
          gsap.to('.hero__copy', {
            yPercent: -25,
            autoAlpha: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 30%', scrub: true },
          });
          gsap.fromTo(
            '.hero__media',
            { clipPath: conditions.desktop ? 'inset(0% 10% 0% 10% round 48px)' : 'inset(0% 4% 0% 4% round 28px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 0px)',
              ease: 'none',
              scrollTrigger: { trigger: '.hero__media', start: 'top 95%', end: 'top 15%', scrub: true },
            }
          );
          gsap.fromTo(
            '.hero__media img',
            { scale: 1.25, yPercent: -6 },
            { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero__media', start: 'top bottom', end: 'bottom top', scrub: true } }
          );

          // Mouse parallax on the floating packs (quickTo per gsap-performance).
          if (conditions.desktop) {
            const movers = gsap.utils.toArray('.hero__pack-mouse').map((el, i) => ({
              x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }),
              y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }),
              d: packs[i].depth,
            }));
            const onMove = contextSafe((e) => {
              const nx = e.clientX / window.innerWidth - 0.5;
              const ny = e.clientY / window.innerHeight - 0.5;
              movers.forEach((m) => {
                m.x(nx * 60 * m.d);
                m.y(ny * 40 * m.d);
              });
            });
            window.addEventListener('pointermove', onMove);
            return () => window.removeEventListener('pointermove', onMove);
          }
        }
      );
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <Sunburst className="hero__burst" rays={36} inner={90} outer={520} />
      </div>

      <div className="hero__stage">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="dot" /> H. Nandan Surinami — sinds 1979
          </p>
          <h1 className="hero__title" id="hero-title">
            <span className="hero__line hero__line--a">Wordt een</span>
            <span className="hero__line hero__line--b">Wereldchef</span>
          </h1>
          <div className="hero__sub">
            <p>Met onze authentieke Surinaamse specerijenmixen voor</p>
            <RotatingText
              texts={['roti kip kerrie', 'doksa', 'bara', 'kerrie vis', 'phulauri', 'lamsvlees']}
              mainClassName="hero__rotator"
              splitLevelClassName="hero__rotator-split"
              staggerFrom="last"
              staggerDuration={0.015}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 600 }}
              rotationInterval={2200}
            />
          </div>
          <div className="hero__ctas">
            <Magnet padding={60} magnetStrength={3}>
              <a href="#assortiment" className="btn btn--red btn--lg" onClick={(e) => { e.preventDefault(); scrollToId('assortiment'); }}>
                Ontdek het assortiment
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </Magnet>
            <a href="#nieuw" className="link-underline" onClick={(e) => { e.preventDefault(); scrollToId('nieuw'); }}>
              Nieuw: Hindostaanse Boemboe
            </a>
          </div>
        </div>

        <div className="hero__packs" aria-hidden="true">
          {packs.map((p, i) => (
            <div className={`hero__pack hero__pack--${i + 1}`} key={p.src}>
              <div className="hero__pack-mouse">
                <div className="hero__pack-inner">
                  <img src={p.src} alt="" width="600" height="600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hero__badge" aria-hidden="true">
          <CircularText text="SINDS 1979 ✦ AUTHENTIEK ✦ SURINAAMS ✦ " spinDuration={22} onHover="speedUp" className="hero__circular" />
          <img src="/img/logo.webp" alt="" width="70" height="85" />
        </div>
      </div>

      <figure className="hero__media">
        <img src="/img/hero-strip.webp" alt="H. Nandan masala's naast Surinaamse gerechten met roti, kip en lamsvlees" width="2200" height="827" fetchPriority="high" />
        <figcaption>
          <span>Authentic</span>
          <span>made simple.</span>
        </figcaption>
      </figure>
    </section>
  );
}
