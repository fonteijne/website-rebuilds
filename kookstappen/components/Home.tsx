"use client";

import { useRef, useState } from "react";
import { resizeImage } from "@/lib/image";
import type { Session } from "@/lib/storage";
import type { Recipe, StatusResponse } from "@/lib/types";
import { Camera, Close, ImageIcon, Plus, Spinner } from "./Icons";

export type SubmitError = { message: string; code?: string };

const MAX_PHOTOS = 4;

type Props = {
  status: StatusResponse | null;
  busy: boolean;
  error: SubmitError | null;
  code: string;
  onCode: (code: string) => void;
  current: Session | null;
  history: Recipe[];
  onSubmit: (images: string[], text: string) => void;
  onCancel: () => void;
  onResume: () => void;
  onOpen: (recipe: Recipe) => void;
  onExample: () => void;
};

const btn = "inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 text-lg font-bold transition-colors disabled:opacity-50";
const primary = `${btn} bg-accent text-accent-ink active:brightness-95`;
const secondary = `${btn} border-2 border-line bg-card text-ink active:bg-soft`;

export default function Home(p: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [reading, setReading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const notConfigured = p.status && !p.status.configured;
  const askCode = p.status?.needsCode || p.error?.code === "bad-code";

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setReading(true);
    setPhotoError("");
    try {
      const room = MAX_PHOTOS - photos.length;
      const next: string[] = [];
      for (const file of Array.from(files).slice(0, room)) next.push(await resizeImage(file));
      setPhotos((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
      if (files.length > room) setPhotoError(`Maximaal ${MAX_PHOTOS} foto's per recept.`);
    } catch (err) {
      setPhotoError((err as Error).message);
    } finally {
      setReading(false);
      if (cameraInput.current) cameraInput.current.value = "";
      if (galleryInput.current) galleryInput.current.value = "";
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kookstappen</h1>
        <p className="text-lg leading-snug text-ink2">
          Maak een foto van de bereidingswijze. Je krijgt een afvinklijst met één handeling per stap.
        </p>
      </header>

      {p.current && !p.busy && (
        <button
          type="button"
          onClick={p.onResume}
          className="shadow-card flex items-center justify-between gap-4 rounded-3xl border-2 border-accent bg-card p-5 text-left"
        >
          <span>
            <span className="block text-sm font-bold uppercase tracking-wide text-accent">Verder koken</span>
            <span className="mt-1 block text-xl font-bold">{p.current.recipe.title}</span>
          </span>
          <span aria-hidden className="text-3xl text-accent">→</span>
        </button>
      )}

      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => addFiles(e.target.files)} />
      <input ref={galleryInput} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => addFiles(e.target.files)} />

      {p.busy ? (
        <section aria-live="polite" className="shadow-card flex flex-col items-center gap-5 rounded-3xl bg-card p-6 text-center">
          {photos[0] && (
            // Lokale data-URL: next/image heeft hier geen meerwaarde.
            <img src={photos[0]} alt="" className="h-40 w-full rounded-2xl object-cover opacity-80" />
          )}
          <Spinner className="spin size-10 text-accent" />
          <div>
            <p className="text-xl font-bold">Ik lees de instructies…</p>
            <p className="mt-1 text-ink2">Dit duurt meestal 10 tot 30 seconden.</p>
          </div>
          <button type="button" onClick={p.onCancel} className={secondary}>
            Annuleer
          </button>
        </section>
      ) : (
        <section aria-labelledby="nieuw" className="flex flex-col gap-4">
          <h2 id="nieuw" className="sr-only">Nieuw recept</h2>

          {photos.length > 0 && (
            <ul className="grid grid-cols-2 gap-3" aria-label="Gekozen foto's">
              {photos.map((src, i) => (
                <li key={i} className="relative">
                  <img src={src} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full rounded-2xl border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-card/90 text-ink shadow-card"
                    aria-label={`Foto ${i + 1} verwijderen`}
                  >
                    <Close className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {photos.length > 0 ? (
            <>
              <button type="button" className={primary} onClick={() => p.onSubmit(photos, "")} disabled={reading}>
                Maak stappen
              </button>
              {photos.length < MAX_PHOTOS && (
                <button type="button" className={secondary} onClick={() => cameraInput.current?.click()} disabled={reading}>
                  <Plus className="size-6" /> Nog een foto
                </button>
              )}
            </>
          ) : (
            <>
              <button type="button" className={`${primary} min-h-20 text-xl`} onClick={() => cameraInput.current?.click()} disabled={reading}>
                {reading ? <Spinner className="spin size-7" /> : <Camera className="size-7" />}
                {reading ? "Foto verwerken…" : "Maak een foto"}
              </button>
              <button type="button" className={secondary} onClick={() => galleryInput.current?.click()} disabled={reading}>
                <ImageIcon className="size-6" /> Kies uit je foto&apos;s
              </button>
            </>
          )}

          {photoError && <p role="alert" className="rounded-2xl bg-soft p-4 text-ink">{photoError}</p>}

          <details className="group rounded-2xl border-2 border-line bg-card">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-lg font-bold">
              Of plak de tekst
              <span aria-hidden className="text-ink2 transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="flex flex-col gap-3 px-5 pb-5">
              <label htmlFor="recepttekst" className="text-ink2">
                Bijvoorbeeld van een website of uit een bericht.
              </label>
              <textarea
                id="recepttekst"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full rounded-xl border-2 border-line bg-bg p-3 text-base"
                placeholder="1. Verhit de olie en bak de ui glazig…"
              />
              <button type="button" className={primary} disabled={!text.trim()} onClick={() => p.onSubmit([], text)}>
                Maak stappen van tekst
              </button>
            </div>
          </details>

          {p.error && (
            <div role="alert" className="rounded-2xl border-2 border-accent bg-card p-4">
              <p className="font-bold">Dat lukte niet</p>
              <p className="mt-1 text-ink2">{p.error.message}</p>
            </div>
          )}

          {askCode && (
            <div className="flex flex-col gap-2">
              <label htmlFor="code" className="font-bold">Toegangscode</label>
              <input
                id="code"
                type="password"
                autoComplete="off"
                value={p.code}
                onChange={(e) => p.onCode(e.target.value)}
                className="min-h-14 rounded-xl border-2 border-line bg-card px-4 text-lg"
              />
              <p className="text-sm text-ink2">Wordt alleen op dit apparaat bewaard.</p>
            </div>
          )}

          {notConfigured && (
            <p className="rounded-2xl bg-soft p-4 text-ink2">
              De AI is nog niet gekoppeld (OpenRouter-key ontbreekt). Het voorbeeld hieronder werkt wel.
            </p>
          )}
        </section>
      )}

      {!p.busy && (
        <section aria-labelledby="eerder" className="flex flex-col gap-3">
          <h2 id="eerder" className="text-lg font-bold">
            {p.history.length ? "Eerder gemaakt" : "Eerst even kijken?"}
          </h2>
          <ul className="flex flex-col gap-2">
            {p.history.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => p.onOpen(r)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 border-line bg-card px-5 text-left"
                >
                  <span className="font-bold">{r.title}</span>
                  <span className="shrink-0 text-sm text-muted">{r.steps.length} stappen</span>
                </button>
              </li>
            ))}
            {!p.history.some((r) => r.id === "voorbeeld") && (
              <li>
                <button
                  type="button"
                  onClick={p.onExample}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-line px-5 text-left"
                >
                  <span>
                    <span className="font-bold">Probeer het voorbeeld</span>
                    <span className="block text-sm text-ink2">Wraps met pulled chicken</span>
                  </span>
                  <span aria-hidden className="text-2xl text-ink2">→</span>
                </button>
              </li>
            )}
          </ul>
        </section>
      )}
    </main>
  );
}
