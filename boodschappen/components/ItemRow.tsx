"use client";

import { memo, useRef } from "react";
import type { Item } from "@/lib/types";
import { colorFor } from "@/lib/api";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import ClickSpark from "./reactbits/ClickSpark";

type Props = {
  item: Item;
  who: string;
  onToggle: (item: Item) => void;
  onDelete: (item: Item) => void;
};

const SWIPE_DELETE = 90;

function ItemRow({ item, who, onToggle, onDelete }: Props) {
  const li = useRef<HTMLLIElement>(null);
  const fg = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const check = useRef<SVGPathElement>(null);
  const strike = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  const drag = useRef({ x0: 0, y0: 0, id: -1, active: false, moved: false });

  // Vink-animatie: checkbox "pop", vinkje tekenen, tekst doorstrepen (gsap-timeline skill).
  useGSAP(
    () => {
      const first = !seen.current;
      seen.current = true;
      if (first || reducedMotion()) return;
      const d = item.done;
      gsap
        .timeline()
        .to(box.current, { scale: 0.78, duration: 0.09, ease: "power2.in" })
        .to(box.current, { scale: 1, duration: 0.5, ease: "back.out(3.2)" })
        .fromTo(check.current, { strokeDashoffset: d ? 1 : 0 }, { strokeDashoffset: d ? 0 : 1, duration: 0.3, ease: "power2.out" }, 0.08)
        .fromTo(strike.current, { scaleX: d ? 0 : 1 }, { scaleX: d ? 1 : 0, duration: 0.35, ease: "power3.out" }, 0.05);
    },
    { dependencies: [item.done], scope: li },
  );

  const down = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x0: e.clientX, y0: e.clientY, id: e.pointerId, active: false, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5 && dx < 0) {
        d.active = true;
        d.moved = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > 10) d.id = -1;
      else return;
    }
    gsap.set(fg.current, { x: Math.min(0, dx) * 0.9 });
    gsap.set(li.current!.querySelector(".del-bg"), { opacity: Math.min(1, -dx / SWIPE_DELETE) });
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId || !d.active) {
      drag.current.id = -1;
      return;
    }
    const x = Number(gsap.getProperty(fg.current, "x"));
    drag.current.id = -1;
    d.active = false;
    if (x < -SWIPE_DELETE) {
      gsap.to(fg.current, { x: -window.innerWidth, duration: 0.25, ease: "power2.in", onComplete: () => onDelete(item) });
    } else {
      gsap.to(fg.current, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.55)" });
      gsap.to(li.current!.querySelector(".del-bg"), { opacity: 0, duration: 0.2 });
    }
    // Voorkom dat het loslaten als klik telt
    setTimeout(() => (drag.current.moved = false), 0);
  };

  const toggle = () => {
    if (drag.current.moved) return;
    onToggle(item);
  };

  const remove = () => {
    gsap.to(fg.current, { x: -window.innerWidth, duration: 0.25, ease: "power2.in", onComplete: () => onDelete(item) });
  };

  return (
    <li ref={li} data-flip data-flip-id={`i-${item.id}`} className="relative list-none">
      <div className="del-bg absolute inset-0 flex items-center justify-end rounded-[18px] bg-brand pr-6 text-white opacity-0" aria-hidden>
        <TrashIcon />
      </div>
      <div
        ref={fg}
        className="row card group relative flex items-center gap-3 py-2 pl-3 pr-2"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ opacity: item.done ? 0.62 : 1 }}
      >
        <div className="h-9 w-9 flex-none">
          <ClickSpark sparkColor={["#e5533c", "#f2c14e", "#3f8a5a"]} sparkCount={9} sparkRadius={26} sparkSize={9} duration={650} shape="streak" disabled={item.done}>
            <button
              role="checkbox"
              aria-checked={item.done}
              aria-label={`${item.text} ${item.done ? "weer op de lijst" : "afvinken"}`}
              onClick={toggle}
              className="grid h-9 w-9 place-items-center"
            >
              <span
                ref={box}
                className="grid h-7 w-7 place-items-center rounded-full border-2 transition-colors"
                style={{ borderColor: item.done ? "var(--leaf)" : "var(--ink-2)", background: item.done ? "var(--leaf)" : "transparent" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path ref={check} pathLength={1} d="M3.5 8.5l3 3 6-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1, strokeDashoffset: item.done ? 0 : 1 }} />
                </svg>
              </span>
            </button>
          </ClickSpark>
        </div>

        <button onClick={toggle} className="relative flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-[1.05rem] font-semibold leading-tight">
          <span className="relative inline-block min-w-0 truncate align-bottom">
            {item.text}
            <span ref={strike} className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-ink" style={{ transform: `scaleX(${item.done ? 1 : 0})` }} />
          </span>
          {item.rec && item.rec.length > 0 && (
            <span className="flex flex-none items-center gap-1" title={item.rec.map((r) => r.label + (r.q ? ` (${r.q}×)` : "")).join(", ")}>
              <span className="max-w-[9rem] truncate rounded-full bg-leaf/15 px-2 py-0.5 text-[11px] font-bold text-leaf">
                {item.rec[0].q ? `${item.rec[0].q}× ` : ""}
                {item.rec[0].label}
              </span>
              {item.rec.length > 1 && <span className="rounded-full bg-leaf/15 px-1.5 py-0.5 text-[11px] font-bold text-leaf">+{item.rec.length - 1}</span>}
            </span>
          )}
        </button>

        {item.qty > 1 && <span className="rounded-full bg-sun/50 px-2 py-0.5 text-sm font-bold tabular-nums">{item.qty}×</span>}
        <span title={`Toegevoegd door ${who}`} className="grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: colorFor(item.by) }}>
          {who.slice(0, 1).toUpperCase()}
        </span>
        <button onClick={remove} aria-label={`${item.text} verwijderen`} className="hidden h-9 w-9 place-items-center rounded-full text-muted hover:bg-brand/10 hover:text-brand focus-visible:grid group-hover:grid [@media(hover:none)]:!hidden">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
    </svg>
  );
}

export default memo(ItemRow);
