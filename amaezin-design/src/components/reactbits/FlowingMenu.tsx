'use client';

/**
 * Adapted from React Bits — FlowingMenu (https://reactbits.dev).
 * Changes: Next <Link>, index + description per row (readable on touch, where there is
 * no hover), marquee tween only created on hover-capable devices and scoped via useGSAP,
 * contextSafe handlers, and a fixed repetition count instead of a resize listener.
 */
import Link from 'next/link';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export interface FlowingMenuItem {
  link: string;
  text: string;
  image: string;
  index?: string;
  description?: string;
}

export default function FlowingMenu({ items }: { items: FlowingMenuItem[] }) {
  return (
    <nav aria-label="Diensten" className="border-y border-white/15">
      {items.map((item, i) => (
        <MenuItem key={item.link} {...item} isFirst={i === 0} />
      ))}
    </nav>
  );
}

const REPS = 6;

function MenuItem({ link, text, image, index, description, isFirst }: FlowingMenuItem & { isFirst: boolean }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const closestEdge = (x: number, y: number, w: number, h: number) =>
    (x - w / 2) ** 2 + y ** 2 < (x - w / 2) ** 2 + (y - h) ** 2 ? 'top' : 'bottom';

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(hover: hover) and (pointer: fine)', () => {
        const part = innerRef.current!.querySelector<HTMLElement>('.marquee-part');
        if (!part) return;
        gsap.to(innerRef.current, { x: () => -part.offsetWidth, duration: 12, ease: 'none', repeat: -1 });
      });
    },
    { scope: itemRef }
  );

  const onEnter = contextSafe((e: React.MouseEvent) => {
    const r = itemRef.current!.getBoundingClientRect();
    const edge = closestEdge(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
    gsap
      .timeline({ defaults: { duration: 0.6, ease: 'expo' } })
      .set(marqueeRef.current, { yPercent: edge === 'top' ? -101 : 101 }, 0)
      .set(innerRef.current, { yPercent: edge === 'top' ? 101 : -101 }, 0)
      .to([marqueeRef.current, innerRef.current], { yPercent: 0 }, 0);
  });

  const onLeave = contextSafe((e: React.MouseEvent) => {
    const r = itemRef.current!.getBoundingClientRect();
    const edge = closestEdge(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
    gsap
      .timeline({ defaults: { duration: 0.6, ease: 'expo' } })
      .to(marqueeRef.current, { yPercent: edge === 'top' ? -101 : 101 }, 0)
      .to(innerRef.current, { yPercent: edge === 'top' ? 101 : -101 }, 0);
  });

  return (
    <div ref={itemRef} className={`relative overflow-hidden ${isFirst ? '' : 'border-t border-white/15'}`}>
      <Link
        href={link}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="group relative z-0 flex items-center gap-4 py-7 md:py-10 focus-visible:outline-none"
      >
        {index && <span className="font-mono text-xs text-pink md:text-sm">{index}</span>}
        <span className="flex-1">
          <span className="block font-display text-[clamp(2.1rem,8vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-tight">
            {text}
          </span>
          {description && <span className="mt-2 block max-w-md text-sm text-white/60 md:text-base">{description}</span>}
        </span>
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 transition-colors group-hover:bg-pink group-hover:text-ink group-focus-visible:bg-pink group-focus-visible:text-ink md:size-14"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
      </Link>
      <div
        ref={marqueeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 translate-y-[101%] overflow-hidden bg-pink text-ink"
      >
        <div ref={innerRef} className="flex h-full w-fit">
          {Array.from({ length: REPS }, (_, i) => (
            <div key={i} className="marquee-part flex shrink-0 items-center">
              <span className="whitespace-nowrap px-[2vw] font-display text-[clamp(2rem,6vw,5rem)] font-extrabold uppercase leading-none">
                {text}
              </span>
              <span
                className="mx-[2vw] h-[60%] w-[clamp(120px,14vw,220px)] rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
