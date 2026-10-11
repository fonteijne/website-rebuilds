import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { scrollToId } from '../lib/scroll';
import { retailers } from '../data/content';
import LogoLoop from '../components/reactbits/LogoLoop';
import RevealTitle from '../components/RevealTitle';
import Magnet from '../components/reactbits/Magnet';

export default function Retailers({ onAsk }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.retailers__ask', {
          y: 60,
          rotate: 4,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'pop',
          scrollTrigger: { trigger: '.retailers__ask', start: 'top 90%', once: true },
        });
        gsap.from('.retailers__loop', { autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: '.retailers__loop', start: 'top 92%', once: true } });
      });
    },
    { scope: root }
  );

  return (
    <section className="retailers" id="verkrijgbaar" ref={root} aria-labelledby="retailers-title">
      <div className="container retailers__head">
        <div>
          <p className="kicker">Verkrijgbaar bij</p>
          <RevealTitle className="display display--md" id="retailers-title">
            Ligt in het schap van <em>jouw</em> supermarkt
          </RevealTitle>
        </div>
        <div className="retailers__ask">
          <p><strong>Staat je supermarkt er niet tussen?</strong> Laat het ons weten en wij sturen onze accountmanagers op pad!</p>
          <Magnet padding={40} magnetStrength={4}>
            <a href="#contact" className="btn btn--red" onClick={(e) => { e.preventDefault(); onAsk(); scrollToId('contact'); }}>
              Laat het ons weten
            </a>
          </Magnet>
        </div>
      </div>
      <div className="retailers__loop">
        <LogoLoop
          logos={retailers}
          speed={70}
          direction="left"
          logoHeight={64}
          gap={72}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor="#FBF3E4"
          ariaLabel="Supermarkten waar H. Nandan verkrijgbaar is"
        />
      </div>
    </section>
  );
}
