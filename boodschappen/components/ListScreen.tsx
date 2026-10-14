"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Item, ListPayload, User } from "@/lib/types";
import { api, colorFor } from "@/lib/api";
import { CATEGORIES, categorize, normKey, parseItem } from "@/lib/categories";
import { gsap, Flip, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import Backdrop from "./Backdrop";
import ItemRow from "./ItemRow";
import SettingsSheet from "./SettingsSheet";
import RecipesSheet from "./RecipesSheet";
import SplitText from "./reactbits/SplitText";

type FlipState = ReturnType<typeof Flip.getState>;
const POLL_MS = 3000;

export default function ListScreen({ me, onLogout }: { me: User; onLogout: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const [data, setData] = useState<ListPayload | null>(null);
  const [text, setText] = useState("");
  const [settings, setSettings] = useState(false);
  const [recipes, setRecipes] = useState(false);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const flipState = useRef<FlipState | null>(null);
  const pending = useRef(0);
  const rev = useRef(-1);
  const firstRender = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Alle lijstwijzigingen lopen hierdoor: stand vastleggen -> state wijzigen -> Flip animeert het verschil. */
  const commit = useCallback((updater: (d: ListPayload) => ListPayload) => {
    if (root.current && !reducedMotion()) flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip]"));
    setData((d) => (d ? updater(d) : d));
  }, []);

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !root.current) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.55,
      ease: "power3.inOut",
      scale: false,
      onEnter: (els) =>
        gsap.fromTo(els, { autoAlpha: 0, y: 16, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.04, clearProps: "transform,opacity,visibility" }),
    });
  }, [data]);

  const load = useCallback(async () => {
    if (pending.current > 0) return;
    try {
      const res = await api<ListPayload & { unchanged?: boolean }>(`/api/items?since=${rev.current}`);
      if (res.unchanged || pending.current > 0) return;
      rev.current = res.rev;
      commit(() => res as ListPayload);
      setData((d) => d ?? (res as ListPayload));
    } catch {
      /* offline of sessie verlopen: volgende poll probeert opnieuw */
    }
  }, [commit]);

  useEffect(() => {
    load();
    const tick = () => document.visibilityState === "visible" && load();
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [load]);

  /** Optimistische mutatie met server-bevestiging. */
  const mutate = useCallback(
    async (updater: (d: ListPayload) => ListPayload, request: () => Promise<unknown>) => {
      pending.current++;
      commit(updater);
      try {
        await request();
      } catch {
        // terugdraaien via verse serverstand
      } finally {
        pending.current--;
        rev.current = -1;
        load();
      }
    },
    [commit, load],
  );

  const showToast = (msg: string, undo?: () => void) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const add = useCallback(
    (raw: string) => {
      const { text: t, qty } = parseItem(raw);
      if (!t) return;
      const id = crypto.randomUUID().slice(0, 12);
      const key = normKey(t);
      navigator.vibrate?.(8);
      mutate(
        (d) => {
          const dupe = d.items.find((i) => normKey(i.text) === key);
          const items = dupe
            ? d.items.map((i) => (i.id === dupe.id ? { ...i, done: false, doneAt: undefined, qty: dupe.done ? qty : dupe.qty + (qty > 1 ? qty : 0) } : i))
            : [...d.items, { id, text: t, qty, cat: categorize(t), done: false, by: me.id, at: Date.now() }];
          return { ...d, items, suggestions: d.suggestions.filter((s) => normKey(s) !== key) };
        },
        () => api("/api/items", { method: "POST", json: { text: raw, id } }),
      );
    },
    [me.id, mutate],
  );

  const toggle = useCallback(
    (item: Item) => {
      navigator.vibrate?.(item.done ? 6 : 14);
      mutate(
        (d) => ({ ...d, items: d.items.map((i) => (i.id === item.id ? { ...i, done: !i.done, doneAt: !i.done ? Date.now() : undefined } : i)) }),
        () => api(`/api/items/${item.id}`, { method: "PATCH", json: { done: !item.done } }),
      );
    },
    [mutate],
  );

  const remove = useCallback(
    (item: Item) => {
      mutate(
        (d) => ({ ...d, items: d.items.filter((i) => i.id !== item.id) }),
        () => api(`/api/items/${item.id}`, { method: "DELETE" }),
      );
      showToast(`${item.text} verwijderd`, () => {
        setToast(null);
        add(item.qty > 1 ? `${item.qty}x ${item.text}` : item.text);
      });
    },
    [mutate, add],
  );

  const clearDone = () => {
    const n = data?.items.filter((i) => i.done).length ?? 0;
    if (!n) return;
    mutate(
      (d) => ({ ...d, items: d.items.filter((i) => !i.done) }),
      () => api("/api/items/clear-done", { method: "POST" }),
    );
    showToast(`${n} afgevinkt${n === 1 ? "" : "e"} item${n === 1 ? "" : "s"} gewist`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    add(text);
    setText("");
    inputRef.current?.focus();
  };

  // --- afgeleide data ---
  const items = data?.items ?? [];
  const active = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
  const groups = useMemo(
    () => CATEGORIES.map((c) => ({ ...c, items: active.filter((i) => i.cat === c.id) })).filter((g) => g.items.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );
  const total = items.length;
  const pct = total ? done.length / total : 0;
  const who = (id: string) => data?.members[id] ?? "?";

  // --- animaties ---
  const counter = useRef({ v: 0 });
  const countEl = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const barMini = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(counter.current, {
        v: done.length,
        duration: reducedMotion() ? 0 : 0.6,
        ease: "power2.out",
        onUpdate: () => countEl.current && (countEl.current.textContent = String(Math.round(counter.current.v))),
      });
      gsap.to([bar.current, barMini.current], { scaleX: pct, duration: reducedMotion() ? 0 : 0.8, ease: "power3.out" });
    },
    { dependencies: [done.length, pct] },
  );

  // Intro: rijen staggeren binnen zodra de lijst voor het eerst geladen is.
  useGSAP(
    () => {
      if (!data || !firstRender.current) return;
      firstRender.current = false;
      if (reducedMotion()) return;
      gsap.from("[data-flip]", { y: 26, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.045, delay: 0.25, clearProps: "transform,opacity,visibility" });
      gsap.from(".add-bar", { yPercent: 130, duration: 0.8, ease: "power4.out", delay: 0.2 });
    },
    { dependencies: [!!data], scope: root },
  );

  // Compacte balk schuift in via ScrollTrigger (gesynchroniseerd met Lenis).
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        ".mini-bar",
        { yPercent: -120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: hero.current, start: "bottom 120px", end: "bottom 50px", scrub: true } },
      );
      gsap.to(".hero-title", { scale: 0.92, opacity: 0.4, ease: "none", transformOrigin: "left top", scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true } });
      return () => ScrollTrigger.getAll().forEach((s) => s.kill());
    },
    { scope: root },
  );

  // Toast in/uit
  useGSAP(
    () => {
      if (toast) gsap.fromTo(".toast", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" });
    },
    { dependencies: [toast?.msg], scope: root },
  );

  const mine = me.name;
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Nog wakker" : hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div ref={root} className="relative mx-auto min-h-dvh w-full max-w-md px-4 pb-52">
      <Backdrop />

      {/* compacte balk */}
      <div className="mini-bar invisible fixed inset-x-0 top-0 z-30 mx-auto max-w-md px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="card flex items-center gap-3 !rounded-2xl px-4 py-2.5 backdrop-blur">
          <span className="font-display text-lg font-semibold">Boodschappen</span>
          <span className="ml-auto text-sm font-bold tabular-nums">
            {done.length}/{total}
          </span>
          <Avatar name={mine} id={me.id} onClick={() => setSettings(true)} size={30} />
        </div>
        <div className="mx-3 -mt-px h-1 overflow-hidden rounded-b-full bg-line">
          <div ref={barMini} className="h-full origin-left bg-leaf" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      <header ref={hero} className="pb-5 pt-[max(1.75rem,env(safe-area-inset-top))]">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink2">
            {greeting}, {mine}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setRecipes(true)} className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-card px-4 text-sm font-bold shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11M9 8h6" />
              </svg>
              Recepten
            </button>
            <Avatar name={mine} id={me.id} onClick={() => setSettings(true)} size={40} />
          </div>
        </div>
        <div className="hero-title">
          <SplitText text="Boodschappen" tag="h1" textAlign="left" className="font-display text-[clamp(2.6rem,12vw,3.4rem)] font-semibold leading-none tracking-tight" delay={40} duration={0.9} rootMargin="0px" />
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-baseline justify-between text-sm font-semibold text-ink2">
            <span>
              <span ref={countEl} className="font-display text-2xl text-ink tabular-nums">
                0
              </span>{" "}
              van {total} in de mand
            </span>
            <span>{active.length} te halen</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang">
            <div ref={bar} className="h-full origin-left rounded-full bg-gradient-to-r from-leaf to-sun" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </header>

      <main>
        {!data && <p className="py-16 text-center text-ink2">Lijst laden…</p>}

        {data && total === 0 && <EmptyState />}

        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <section key={g.id} aria-label={g.label}>
              <h2 data-flip data-flip-id={`s-${g.id}`} className="mb-2 flex items-center gap-2 px-1 text-xs font-extrabold uppercase tracking-widest text-ink2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                {g.label}
                <span className="font-semibold text-muted">{g.items.length}</span>
              </h2>
              <ul className="flex flex-col gap-2">
                {g.items.map((i) => (
                  <ItemRow key={i.id} item={i} who={who(i.by)} onToggle={toggle} onDelete={remove} />
                ))}
              </ul>
            </section>
          ))}

          {done.length > 0 && (
            <section aria-label="In de mand">
              <h2 data-flip data-flip-id="s-done" className="mb-2 flex items-center gap-2 px-1 text-xs font-extrabold uppercase tracking-widest text-ink2">
                <span className="h-2.5 w-2.5 rounded-full bg-leaf" />
                In de mand
                <span className="font-semibold text-muted">{done.length}</span>
                <button onClick={clearDone} className="ml-auto rounded-full px-3 py-1 text-xs font-bold normal-case tracking-normal text-brand hover:bg-brand/10">
                  Wis afgevinkte
                </button>
              </h2>
              <ul className="flex flex-col gap-2">
                {done.map((i) => (
                  <ItemRow key={i.id} item={i} who={who(i.by)} onToggle={toggle} onDelete={remove} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      {/* toevoegen: onderaan, binnen duimbereik */}
      <div className="add-bar fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6" style={{ background: "linear-gradient(to top, var(--bg) 55%, transparent)" }}>
        {data && data.suggestions.length > 0 && (
          <div className="-mx-3 mb-2 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]" data-lenis-prevent-wheel aria-label="Vaak gekocht">
            {data.suggestions.slice(0, 8).map((s) => (
              <button key={s} className="chip" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="card flex items-center gap-2 !rounded-full p-1.5 pl-5">
          <label htmlFor="new-item" className="sr-only">
            Wat moet er op de lijst?
          </label>
          <input
            id="new-item"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wat moet er op de lijst? (bv. 2x melk)"
            enterKeyHint="done"
            autoComplete="off"
            autoCapitalize="sentences"
            maxLength={60}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button className="btn btn-brand !min-h-11 !w-11 !px-0" aria-label="Toevoegen" disabled={!text.trim()}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </form>
      </div>

      {toast && (
        <div className="toast fixed inset-x-0 bottom-36 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-xl" role="status">
          {toast.msg}
          {toast.undo && (
            <button onClick={toast.undo} className="font-extrabold text-sun underline underline-offset-2">
              Ongedaan maken
            </button>
          )}
        </div>
      )}

      <RecipesSheet
        open={recipes}
        onClose={() => setRecipes(false)}
        onAdded={(label, n) => {
          rev.current = -1;
          load();
          showToast(`${label}: ${n} ingrediënt${n === 1 ? "" : "en"} op de lijst`);
        }}
      />
      <SettingsSheet me={me} open={settings} onClose={() => setSettings(false)} onLogout={onLogout} />
    </div>
  );
}

function Avatar({ name, id, size, onClick }: { name: string; id: string; size: number; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Instellingen" className="grid flex-none place-items-center rounded-full font-bold text-white shadow" style={{ width: size, height: size, background: colorFor(id), fontSize: size * 0.42 }}>
      {name.slice(0, 1).toUpperCase()}
    </button>
  );
}

function EmptyState() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(".e-in", { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: "power3.out" });
      gsap.to(".e-bob", { y: -6, repeat: -1, yoyo: true, duration: 1.6, ease: "sine.inOut" });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="flex flex-col items-center py-14 text-center">
      <svg className="e-in e-bob mb-4 h-20 w-20 text-ink2" viewBox="0 0 96 96" fill="none" aria-hidden>
        <path d="M16 42h64l-6.5 34a6 6 0 0 1-5.9 4.9H28.4A6 6 0 0 1 22.5 76z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M32 42c0-13 7-22 16-22s16 9 16 22" stroke="var(--brand)" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <p className="e-in font-display text-2xl font-semibold">Je mand is leeg</p>
      <p className="e-in mt-1 max-w-[26ch] text-ink2">Typ hieronder wat je nodig hebt. Je partner ziet het meteen.</p>
    </div>
  );
}
