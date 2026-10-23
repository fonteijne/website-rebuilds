import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, motionScale } from '../lib/gsap';
import { MQ } from '../lib/media';
import { values } from '../data/content';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import RevealTitle from '../components/RevealTitle';

export default function Values() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, small: MQ.small }, ({ conditions }) => {
        if (!conditions.motion) return;
        const { d, t } = motionScale(conditions.small);
        gsap.set('.value', { y: d(80), autoAlpha: 0, rotate: (i) => [-3, 2, -2][i] * (conditions.small ? 0.6 : 1) });
        ScrollTrigger.batch('.value', {
          start: 'top 88%',
          once: true,
          onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, rotate: 0, stagger: 0.12, duration: t(1.1), ease: 'pop' }),
        });
        gsap.from('.value__icon', {
          scale: 0,
          rotate: -45,
          stagger: 0.12,
          duration: t(1),
          ease: 'pop',
          scrollTrigger: { trigger: '.values__grid', start: 'top 80%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="values" ref={root} aria-labelledby="values-title">
      <div className="container">
        <div className="values__head">
          <RevealTitle className="display display--md" id="values-title">
            Puur, plantaardig <em>&amp;</em> lekker snel
          </RevealTitle>
          <p className="lead">
            Al onze producten zijn 100% natuurlijk en vegan. Zonder kunstmatige toevoegingen, mét de smaak van
            Suriname — zoals het hoort.
          </p>
        </div>
        <div className="values__grid">
          {values.map((v, i) => (
            <SpotlightCard
              key={v.title}
              className="value"
              theme="light"
              spotlightColor="rgba(232, 163, 60, 0.35)"
              intensity={0.5}
            >
              <span className="value__num">0{i + 1}</span>
              <span className="value__icon" style={{ '--icon': `url(${v.icon})` }} aria-hidden="true" />
              <h3 className="value__title">{v.title}</h3>
              <p className="value__text">{v.text}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
