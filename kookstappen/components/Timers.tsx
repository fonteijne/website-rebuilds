"use client";

import { useEffect, useRef } from "react";
import { beep } from "@/lib/alarm";
import { formatTime } from "@/lib/flow";
import type { Timer } from "@/lib/storage";
import { Close, Pause, Play, Plus } from "./Icons";

export const remainingMs = (t: Timer, now: number) => (t.endsAt === null ? t.remainingMs : t.endsAt - now);
export const isFinished = (t: Timer, now: number) => t.endsAt !== null && t.endsAt <= now;

const RING_FOR_MS = 60_000;
const RING_EVERY_MS = 3_000;

type Props = {
  timers: Timer[];
  now: number;
  onChange: (timers: Timer[]) => void;
};

/** Vaste balk onderin met alle lopende timers. Afgelopen timers piepen tot je op "Oké" tikt (max. 1 minuut). */
export default function Timers({ timers, now, onChange }: Props) {
  const lastBeep = useRef<Record<string, number>>({});

  useEffect(() => {
    for (const t of timers) {
      if (!isFinished(t, now) || now - t.endsAt! > RING_FOR_MS) continue;
      if (now - (lastBeep.current[t.id] ?? 0) >= RING_EVERY_MS) {
        lastBeep.current[t.id] = now;
        beep();
      }
    }
  }, [timers, now]);

  if (!timers.length) return null;

  const set = (id: string, patch: (t: Timer) => Timer | null) =>
    onChange(timers.flatMap((t) => (t.id === id ? (patch(t) ?? []) : [t])));

  return (
    <section
      aria-label="Timers"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm"
    >
      <ul className="mx-auto flex max-w-xl flex-col gap-2">
        {timers.map((t) => {
          const done = isFinished(t, now);
          const left = remainingMs(t, now);
          return (
            <li
              key={t.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2 ${done ? "bg-accent text-accent-ink" : "bg-card shadow-card"}`}
            >
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${done ? "" : "text-ink2"}`}>{t.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${done ? "ringing" : ""}`} role={done ? "alert" : undefined}>
                  {done ? "Tijd is om!" : formatTime(left / 1000)}
                  {t.endsAt === null && <span className="ml-2 text-base font-normal text-ink2">gepauzeerd</span>}
                </p>
              </div>
              {done ? (
                <button
                  type="button"
                  onClick={() => set(t.id, () => null)}
                  className="min-h-12 rounded-xl bg-accent-ink px-5 text-lg font-bold text-accent"
                >
                  Oké
                </button>
              ) : (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="1 minuut erbij"
                    onClick={() =>
                      set(t.id, (x) => ({
                        ...x,
                        endsAt: x.endsAt === null ? null : x.endsAt + 60_000,
                        remainingMs: x.remainingMs + 60_000,
                      }))
                    }
                    className="grid size-12 place-items-center rounded-xl text-ink2 active:bg-soft"
                  >
                    <Plus className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t.endsAt === null ? "Verder" : "Pauze"}
                    onClick={() =>
                      set(t.id, (x) =>
                        x.endsAt === null
                          ? { ...x, endsAt: Date.now() + x.remainingMs }
                          : { ...x, endsAt: null, remainingMs: x.endsAt - Date.now() },
                      )
                    }
                    className="grid size-12 place-items-center rounded-xl text-ink2 active:bg-soft"
                  >
                    {t.endsAt === null ? <Play className="size-5" /> : <Pause className="size-5" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Timer stoppen"
                    onClick={() => set(t.id, () => null)}
                    className="grid size-12 place-items-center rounded-xl text-ink2 active:bg-soft"
                  >
                    <Close className="size-5" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
