import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { youtubeId } from '../data/content';
import Magnet from '../components/reactbits/Magnet';
import CircularText from '../components/reactbits/CircularText';

// Lightweight YouTube facade: the iframe only loads after the visitor asks for it.
export default function Video() {
  const root = useRef(null);
  const [playing, setPlaying] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.video__frame', { scale: 0.82, borderRadius: '64px' }, {
          scale: 1,
          borderRadius: '28px',
          ease: 'none',
          scrollTrigger: { trigger: '.video__frame', start: 'top bottom', end: 'center center', scrub: true },
        });
        gsap.fromTo('.video__poster', { scale: 1.2 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.video__frame', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="video" ref={root} aria-label="Video: Authentic made simple">
      <div className="container">
        <div className="video__frame">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title="H. Nandan Surinami — Authentic made simple"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img className="video__poster" src="/img/video-poster.webp" alt="" loading="lazy" width="1280" height="720" />
              <div className="video__overlay">
                <Magnet padding={140} magnetStrength={3}>
                  <button className="video__play" onClick={() => setPlaying(true)} aria-label="Video afspelen">
                    <CircularText text="BEKIJK DE VIDEO ✦ BEKIJK DE VIDEO ✦ " spinDuration={14} onHover="goBonkers" className="video__circular" />
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                </Magnet>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
