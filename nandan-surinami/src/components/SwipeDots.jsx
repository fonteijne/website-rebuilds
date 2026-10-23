import { useCallback, useEffect, useRef, useState } from 'react';
import { matches, MQ, useMediaQuery } from '../lib/media';

// Pager for a native horizontal swipe row (scroll-snap). It tracks the row's own scroll
// position (passive listener, one measurement per frame), shows which item is centred and lets
// the visitor jump to an item. Pure UI on top of native scrolling: no scroll hijacking.
// Not rendered from 900px up, where the rows become pinned GSAP sections.
export default function SwipeDots(props) {
  const desktop = useMediaQuery(MQ.desktop);
  return desktop ? null : <SwipePager {...props} />;
}

function SwipePager({ trackRef, itemSelector, labels, className = '', label = 'Navigatie', counter = false }) {
  const [active, setActive] = useState(0);
  const barRef = useRef(null);
  const count = labels.length;

  const items = useCallback(
    () => Array.from(trackRef.current?.querySelectorAll(itemSelector) ?? []).slice(0, count),
    [trackRef, itemSelector, count]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const list = items();
      if (!list.length) return;
      const max = track.scrollWidth - track.clientWidth;
      const progress = max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
      barRef.current?.style.setProperty('--swipe-progress', progress.toFixed(4));

      let index = 0;
      if (max > 0 && track.scrollLeft >= max - 2) {
        index = list.length - 1;
      } else if (track.scrollLeft > 2) {
        const box = track.getBoundingClientRect();
        const mid = box.left + box.width / 2;
        let best = Infinity;
        list.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const dist = Math.abs(r.left + r.width / 2 - mid);
          if (dist < best) {
            best = dist;
            index = i;
          }
        });
      }
      setActive(index);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure();
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [trackRef, items]);

  const goTo = (i) => {
    const track = trackRef.current;
    const el = items()[i];
    if (!track || !el) return;
    const box = track.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = track.scrollLeft + (r.left + r.width / 2) - (box.left + box.width / 2);
    track.scrollTo({ left, behavior: matches(MQ.reduced) ? 'auto' : 'smooth' });
  };

  return (
    <div className={`swipe-dots ${className}`.trim()} ref={barRef} role="group" aria-label={label}>
      {counter && (
        <span className="swipe-dots__count" aria-hidden="true">
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      )}
      <span className="swipe-dots__list">
        {labels.map((l, i) => (
          <button
            key={l}
            type="button"
            className={`swipe-dots__dot${i === active ? ' is-active' : ''}`}
            aria-label={l}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </span>
      <span className="swipe-dots__bar" aria-hidden="true" />
    </div>
  );
}
