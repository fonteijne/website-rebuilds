"use client";

import { useEffect, useMemo, useRef } from "react";
import { unlockAudio } from "@/lib/alarm";
import { emptyProgress, flatten, formatDuration, formatTime, isDone, type Item, type Progress } from "@/lib/flow";
import type { Session, Timer } from "@/lib/storage";
import { useNow, useWakeLock } from "./hooks";
import { ArrowLeft, Check, TimerIcon, Undo } from "./Icons";
import Timers, { isFinished, remainingMs } from "./Timers";

type View = "focus" | "list";

type Props = {
  session: Session;
  view: View;
  onView: (view: View) => void;
  onUpdate: (next: (s: Session) => Session) => void;
  onExit: () => void;
  onNew: () => void;
};

export default function Cook({ session, view, onView, onUpdate, onExit, onNew }: Props) {
  const { recipe, progress, timers } = session;
  const items = useMemo(() => flatten(recipe, progress.choices), [recipe, progress.choices]);
  const current = items.findIndex((i) => !isDone(i, progress));
  const finished = current === -1;
  const doneCount = items.filter((i) => isDone(i, progress)).length;
  const started = Object.keys(progress.done).length > 0 || Object.keys(progress.choices).length > 0;
  const showPrep = view === "focus" && recipe.ingredients.length > 0 && !progress.prepSkipped && !started;

  const now = useNow(timers.some((t) => t.endsAt !== null));
  useWakeLock(true);

  const setProgress = (fn: (p: Progress) => Progress) => onUpdate((s) => ({ ...s, progress: fn(s.progress) }));
  const setTimers = (next: Timer[]) => onUpdate((s) => ({ ...s, timers: next }));

  const complete = (item: Item) => setProgress((p) => ({ ...p, prepSkipped: true, done: { ...p.done, [item.id]: true } }));
  const choose = (item: Item, index: number) =>
    setProgress((p) => ({ ...p, prepSkipped: true, choices: { ...p.choices, [item.id]: index } }));
  const undo = (item: Item) =>
    setProgress((p) => {
      const done = { ...p.done };
      const choices = { ...p.choices };
      delete done[item.id];
      delete choices[item.id];
      return { ...p, done, choices };
    });
  const back = () => {
    const prev = items[(finished ? items.length : current) - 1];
    if (prev) undo(prev);
  };
  const startTimer = (item: Item) => {
    unlockAudio();
    const durationMs = item.timerSeconds * 1000;
    onUpdate((s) => ({
      ...s,
      timers: [
        ...s.timers.filter((t) => t.itemId !== item.id),
        { id: `${item.id}-${Date.now()}`, itemId: item.id, label: item.text, durationMs, endsAt: Date.now() + durationMs, remainingMs: durationMs },
      ],
      // Mag je tijdens het wachten al verder? Dan schuift de stap meteen door.
      progress: item.parallel ? { ...s.progress, prepSkipped: true, done: { ...s.progress.done, [item.id]: true } } : s.progress,
    }));
  };

  const timerFor = (item: Item) => timers.find((t) => t.itemId === item.id);

  return (
    <div className="min-h-dvh" style={{ paddingBottom: timers.length ? `${timers.length * 84 + 32}px` : undefined }}>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-2 py-2">
          <button type="button" onClick={onExit} aria-label="Naar het startscherm" className="grid size-12 shrink-0 place-items-center rounded-xl active:bg-soft">
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{recipe.title}</h1>
          <div role="group" aria-label="Weergave" className="flex shrink-0 rounded-xl bg-soft p-1">
            {(["focus", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => onView(v)}
                className={`min-h-10 rounded-lg px-3 text-sm font-bold ${view === v ? "bg-card text-ink shadow-card" : "text-ink2"}`}
              >
                {v === "focus" ? "Stap" : "Lijst"}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-xl px-4 pb-3">
          <div className="flex items-baseline justify-between text-sm text-ink2">
            <span>{finished ? "Alles gedaan" : `Stap ${current + 1} van ${items.length}`}</span>
            <span>{Math.round((doneCount / Math.max(1, items.length)) * 100)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft" aria-hidden>
            <div className="progress-fill h-full rounded-full bg-ok" style={{ transform: `scaleX(${doneCount / Math.max(1, items.length)})` }} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-6">
        {showPrep ? (
          <Prep
            ingredients={recipe.ingredients}
            checked={progress.prep}
            onToggle={(i) =>
              setProgress((p) => {
                const prep = { ...p.prep };
                if (prep[i]) delete prep[i];
                else prep[i] = true;
                return { ...p, prep };
              })
            }
            onStart={() => setProgress((p) => ({ ...p, prepSkipped: true }))}
          />
        ) : finished ? (
          <Finished
            tips={recipe.tips}
            onBack={back}
            onAgain={() => onUpdate((s) => ({ ...s, progress: emptyProgress(), timers: [] }))}
            onNew={onNew}
          />
        ) : view === "focus" ? (
          <Focus
            item={items[current]}
            next={items[current + 1]}
            index={current}
            timer={timerFor(items[current])}
            now={now}
            onDone={() => complete(items[current])}
            onChoose={(i) => choose(items[current], i)}
            onBack={back}
            onStartTimer={() => startTimer(items[current])}
          />
        ) : (
          <List
            items={items}
            progress={progress}
            current={current}
            timerFor={timerFor}
            now={now}
            onToggle={(item) => (isDone(item, progress) ? undo(item) : complete(item))}
            onChoose={choose}
            onStartTimer={startTimer}
          />
        )}

        {view === "list" && recipe.tips.length > 0 && !finished && <Tips tips={recipe.tips} />}
      </main>

      <Timers timers={timers} now={now} onChange={setTimers} />
    </div>
  );
}

const bigBtn = "flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-5 text-xl font-bold";

function Focus(p: {
  item: Item;
  next?: Item;
  index: number;
  timer?: Timer;
  now: number;
  onDone: () => void;
  onChoose: (i: number) => void;
  onBack: () => void;
  onStartTimer: () => void;
}) {
  const { item, timer } = p;
  const timerDone = timer && isFinished(timer, p.now);
  const meta = [item.group, item.source ? `uit stap ${item.source}` : ""].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <article key={item.id} className="step-in shadow-card flex flex-col gap-6 rounded-3xl bg-card p-6">
        {meta && <p className="text-sm font-bold uppercase tracking-wide text-muted">{meta}</p>}
        <h2 aria-live="polite" className="text-[clamp(1.75rem,7vw,2.5rem)] font-bold leading-tight text-balance">
          {item.text}
        </h2>

        {item.options ? (
          <div className="flex flex-col gap-3">
            {item.options.map((o, i) => (
              <button key={o.label} type="button" onClick={() => p.onChoose(i)} className={`${bigBtn} border-2 border-line bg-bg active:bg-soft`}>
                {o.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            {item.timerSeconds > 0 &&
              (timer ? (
                <div className={`rounded-2xl p-4 text-center ${timerDone ? "bg-accent text-accent-ink" : "bg-soft"}`}>
                  <p className={`text-5xl font-bold tabular-nums ${timerDone ? "ringing" : ""}`}>
                    {timerDone ? "Tijd is om!" : formatTime(remainingMs(timer, p.now) / 1000)}
                  </p>
                </div>
              ) : (
                <button type="button" onClick={p.onStartTimer} className={`${bigBtn} border-2 border-accent bg-card text-accent`}>
                  <TimerIcon className="size-7" />
                  Start timer · {formatDuration(item.timerSeconds)}
                </button>
              ))}
            <button type="button" onClick={p.onDone} className={`${bigBtn} min-h-20 bg-ok text-white dark:text-bg`}>
              <Check className="size-8" strokeWidth={3} />
              Klaar
            </button>
          </>
        )}
      </article>

      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={p.onBack}
          disabled={p.index === 0}
          className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-3 font-bold text-ink2 active:bg-soft disabled:invisible"
        >
          <Undo className="size-5" /> Vorige
        </button>
        {p.next && (
          <p className="min-w-0 pt-3 text-right text-ink2">
            <span className="text-sm font-bold uppercase tracking-wide text-muted">Hierna</span>
            <span className="block">{p.next.text}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function List(p: {
  items: Item[];
  progress: Progress;
  current: number;
  timerFor: (item: Item) => Timer | undefined;
  now: number;
  onToggle: (item: Item) => void;
  onChoose: (item: Item, index: number) => void;
  onStartTimer: (item: Item) => void;
}) {
  const currentRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <ol className="flex flex-col gap-2" aria-label="Alle stappen">
      {p.items.map((item, i) => {
        const done = isDone(item, p.progress);
        const isCurrent = i === p.current;
        const timer = p.timerFor(item);
        const frame = `rounded-2xl border-2 ${isCurrent ? "border-accent bg-card shadow-card" : "border-transparent"} ${done ? "opacity-60" : ""}`;

        if (item.options) {
          const chosen = p.progress.choices[item.id];
          return (
            <li key={item.id} ref={isCurrent ? currentRef : undefined} className={`${frame} p-4`}>
              <p className="text-lg font-bold">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.options.map((o, j) => (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={chosen === j}
                    onClick={() => p.onChoose(item, j)}
                    className={`min-h-12 rounded-xl border-2 px-4 font-bold ${chosen === j ? "border-ok bg-ok-soft text-ink" : "border-line bg-bg"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </li>
          );
        }

        return (
          <li key={item.id} ref={isCurrent ? currentRef : undefined} className={frame}>
            <label className="flex min-h-14 cursor-pointer items-start gap-4 p-4">
              <input type="checkbox" checked={done} onChange={() => p.onToggle(item)} className="peer sr-only" />
              <span
                aria-hidden
                className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] ${done ? "check-pop border-ok bg-ok text-white dark:text-bg" : "border-ink2/40 bg-card"}`}
              >
                {done && <Check className="size-5" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                {item.group && <span className="block text-xs font-bold uppercase tracking-wide text-muted">{item.group}</span>}
                <span className={`text-lg leading-snug ${done ? "line-through decoration-2" : ""}`}>{item.text}</span>
              </span>
            </label>
            {item.timerSeconds > 0 && !done && (
              <div className="px-4 pb-4 pl-16">
                {timer ? (
                  <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-soft px-3 font-bold tabular-nums">
                    <TimerIcon className="size-5" />
                    {isFinished(timer, p.now) ? "Tijd is om!" : formatTime(remainingMs(timer, p.now) / 1000)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => p.onStartTimer(item)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border-2 border-accent px-3 font-bold text-accent"
                  >
                    <TimerIcon className="size-5" /> Start timer · {formatDuration(item.timerSeconds)}
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Prep(p: { ingredients: string[]; checked: Record<number, true>; onToggle: (i: number) => void; onStart: () => void }) {
  return (
    <section aria-labelledby="klaarzetten" className="step-in flex flex-col gap-5">
      <div>
        <h2 id="klaarzetten" className="text-2xl font-bold">Zet eerst alles klaar</h2>
        <p className="mt-1 text-ink2">Vink af wat op het aanrecht staat. Mag ook overslaan.</p>
      </div>
      <ul className="flex flex-col gap-2">
        {p.ingredients.map((ing, i) => {
          const on = Boolean(p.checked[i]);
          return (
            <li key={i}>
              <label className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 ${on ? "border-ok bg-ok-soft" : "border-line bg-card"}`}>
                <input type="checkbox" checked={on} onChange={() => p.onToggle(i)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] ${on ? "check-pop border-ok bg-ok text-white dark:text-bg" : "border-ink2/40"}`}
                >
                  {on && <Check className="size-4" strokeWidth={3} />}
                </span>
                <span className="text-lg">{ing}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={p.onStart} className={`${bigBtn} bg-accent text-accent-ink`}>
        Begin met koken
      </button>
    </section>
  );
}

function Tips({ tips }: { tips: string[] }) {
  return (
    <aside className="mt-8 rounded-2xl bg-soft p-5">
      <h2 className="font-bold">Tips</h2>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-ink2">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}

function Finished(p: { tips: string[]; onBack: () => void; onAgain: () => void; onNew: () => void }) {
  return (
    <section className="step-in flex flex-col gap-6 text-center" aria-live="polite">
      <div className="shadow-card flex flex-col items-center gap-3 rounded-3xl bg-card p-8">
        <span className="check-pop grid size-20 place-items-center rounded-full bg-ok text-white dark:text-bg">
          <Check className="size-12" strokeWidth={3} />
        </span>
        <h2 className="text-3xl font-bold">Klaar! Eet smakelijk.</h2>
        <p className="text-ink2">Alle stappen zijn afgevinkt.</p>
      </div>
      {p.tips.length > 0 && (
        <div className="text-left">
          <Tips tips={p.tips} />
        </div>
      )}
      <div className="flex flex-col gap-3">
        <button type="button" onClick={p.onNew} className={`${bigBtn} bg-accent text-accent-ink`}>
          Nieuw recept
        </button>
        <button type="button" onClick={p.onAgain} className={`${bigBtn} border-2 border-line bg-card`}>
          Opnieuw koken
        </button>
        <button type="button" onClick={p.onBack} className="flex min-h-12 items-center justify-center gap-2 font-bold text-ink2">
          <Undo className="size-5" /> Laatste stap terug
        </button>
      </div>
    </section>
  );
}
