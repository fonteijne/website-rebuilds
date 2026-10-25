"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EXAMPLE_RECIPE } from "@/lib/example";
import { emptyProgress } from "@/lib/flow";
import { emptySaved, load, save, type Saved, type Session } from "@/lib/storage";
import type { Recipe, StatusResponse, StepsResponse } from "@/lib/types";
import Cook from "./Cook";
import Home, { type SubmitError } from "./Home";

export default function App() {
  const [saved, setSaved] = useState<Saved>(emptySaved);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<"home" | "cook">("home");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SubmitError | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const s = load();
    setSaved(s);
    // Halverwege een recept? Dan meteen terug naar waar je was.
    if (s.current) setScreen("cook");
    setReady(true);
    fetch("/api/steps")
      .then((r) => r.json() as Promise<StatusResponse>)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    if (ready) save(saved);
  }, [saved, ready]);

  const start = useCallback((recipe: Recipe) => {
    setSaved((s) => ({
      ...s,
      current: { recipe, progress: emptyProgress(), timers: [] },
      history: [recipe, ...s.history.filter((r) => r.id !== recipe.id)].slice(0, 8),
    }));
    setScreen("cook");
    window.scrollTo({ top: 0 });
  }, []);

  const submit = useCallback(
    async (images: string[], text: string) => {
      // Vercel Functions accepteren max. 4,5 MB per verzoek.
      if (images.reduce((n, i) => n + i.length, 0) > 4_000_000) {
        setError({ message: "Die foto's zijn samen te groot. Probeer het met minder foto's." });
        return;
      }
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/steps", {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json", ...(saved.code && { "x-access-code": saved.code }) },
          body: JSON.stringify({ images, text }),
        });
        const data = (await res.json().catch(() => ({ error: "De server gaf een onverwacht antwoord." }))) as StepsResponse;
        if ("recipe" in data) start(data.recipe);
        else setError({ message: data.error, code: data.code });
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError({ message: "Geen verbinding. Controleer je internet en probeer opnieuw." });
      } finally {
        if (abort.current === ctrl) setBusy(false);
      }
    },
    [saved.code, start],
  );

  const cancel = useCallback(() => {
    abort.current?.abort();
    abort.current = null;
    setBusy(false);
  }, []);

  const update = useCallback((next: (s: Session) => Session) => {
    setSaved((s) => (s.current ? { ...s, current: next(s.current) } : s));
  }, []);

  // Server en eerste render tonen het startscherm (snelle LCP); daarna pas weten we of je halverwege een recept was.
  if (screen === "cook" && saved.current) {
    return (
      <Cook
        session={saved.current}
        view={saved.view}
        onView={(view) => setSaved((s) => ({ ...s, view }))}
        onUpdate={update}
        onExit={() => setScreen("home")}
        onNew={() => {
          setSaved((s) => ({ ...s, current: null }));
          setScreen("home");
        }}
      />
    );
  }

  return (
    <Home
      status={status}
      busy={busy}
      error={error}
      code={saved.code}
      onCode={(code) => setSaved((s) => ({ ...s, code }))}
      current={saved.current}
      history={saved.history}
      onSubmit={submit}
      onCancel={cancel}
      onResume={() => setScreen("cook")}
      onOpen={(recipe) => start({ ...recipe, createdAt: Date.now() })}
      onExample={() => start({ ...EXAMPLE_RECIPE, id: "voorbeeld", createdAt: Date.now() })}
    />
  );
}
