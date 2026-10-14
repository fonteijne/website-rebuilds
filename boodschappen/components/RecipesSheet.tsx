"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { Recipe } from "@/lib/types";
import { api, friendly } from "@/lib/api";
import { gsap, reducedMotion } from "@/lib/gsap";

type Props = { open: boolean; onClose: () => void; onAdded: (label: string, count: number) => void };
type Draft = { id?: string; label: string; text: string };

export default function RecipesSheet({ open, onClose, onAdded }: Props) {
  const sheet = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const lenis = useLenis();

  const load = useCallback(async () => {
    const d = await api<{ recipes: Recipe[] }>("/api/recipes").catch(() => null);
    if (d) setRecipes(d.recipes);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setMsg("");
      setDraft(null);
      setConfirmId(null);
      load();
    }
  }, [open, load]);

  useEffect(() => {
    if (!mounted) return;
    const reduce = reducedMotion();
    if (open) {
      lenis?.stop();
      const tl = gsap.timeline();
      tl.fromTo(".rs-bg", { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.25 })
        .fromTo(sheet.current, { yPercent: 100 }, { yPercent: 0, duration: reduce ? 0 : 0.6, ease: "power4.out" }, 0)
        .from(".rs-in", { y: 16, autoAlpha: 0, duration: reduce ? 0 : 0.4, stagger: 0.05, ease: "power2.out", clearProps: "all" }, reduce ? 0 : 0.2);
      return () => {
        tl.kill();
      };
    } else {
      lenis?.start();
      gsap
        .timeline({ onComplete: () => setMounted(false) })
        .to(sheet.current, { yPercent: 100, duration: reduce ? 0 : 0.35, ease: "power3.in" })
        .to(".rs-bg", { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0);
    }
  }, [open, mounted, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (draft ? setDraft(null) : onClose());
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, draft]);

  // Wisselen tussen overzicht en formulier: zacht invliegen
  useEffect(() => {
    if (!mounted || reducedMotion()) return;
    gsap.fromTo(".rs-view", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out", clearProps: "all" });
  }, [draft === null, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy("save");
    setMsg("");
    try {
      const body = { label: draft.label, ingredients: draft.text };
      if (draft.id) await api(`/api/recipes/${draft.id}`, { method: "PUT", json: body });
      else await api("/api/recipes", { method: "POST", json: body });
      setDraft(null);
      await load();
    } catch (err) {
      setMsg(friendly(err));
    } finally {
      setBusy(null);
    }
  };

  const addToList = async (r: Recipe) => {
    setBusy(r.id);
    setMsg("");
    try {
      const res = await api<{ added: number }>(`/api/recipes/${r.id}/add`, { method: "POST" });
      navigator.vibrate?.(14);
      onAdded(r.label, res.added);
      onClose();
    } catch (err) {
      setMsg(friendly(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (r: Recipe) => {
    if (confirmId !== r.id) return setConfirmId(r.id);
    setConfirmId(null);
    setRecipes((rs) => rs?.filter((x) => x.id !== r.id) ?? rs);
    await api(`/api/recipes/${r.id}`, { method: "DELETE" }).catch(() => null);
    load();
  };

  if (!mounted) return null;

  const count = draft ? draft.text.split(/[\n,;]+/).filter((l) => l.trim()).length : 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Recepten">
      <button className="rs-bg absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-label="Sluiten" onClick={onClose} />
      <div
        ref={sheet}
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[28px] bg-bg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />

        {draft ? (
          <form onSubmit={save} className="rs-view flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="flex-1 font-display text-2xl font-semibold">{draft.id ? "Recept aanpassen" : "Nieuw recept"}</h2>
              <button type="button" className="btn btn-ghost !min-h-10 !px-4 text-sm" onClick={() => setDraft(null)}>
                Terug
              </button>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">Label</span>
              <input className="input" value={draft.label} maxLength={40} placeholder="bv. Spaghetti bolognese" autoFocus onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">
                Ingrediënten <span className="font-normal text-muted">(één per regel, bv. 2x ui)</span>
              </span>
              <textarea
                className="input !min-h-44 py-3 leading-relaxed"
                value={draft.text}
                placeholder={"gehakt\npasta\n2x ui\ntomatenblokjes"}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              />
            </label>
            <button className="btn btn-brand" disabled={busy === "save" || !draft.label.trim() || !count}>
              {busy === "save" ? "Opslaan…" : `Opslaan${count ? ` · ${count} ingrediënt${count === 1 ? "" : "en"}` : ""}`}
            </button>
          </form>
        ) : (
          <div className="rs-view">
            <div className="rs-in mb-4 flex items-center gap-3">
              <h2 className="flex-1 font-display text-2xl font-semibold">Recepten</h2>
              <button className="btn btn-ghost !min-h-10 !px-4 text-sm" onClick={onClose}>
                Klaar
              </button>
            </div>

            {recipes === null && <p className="py-8 text-center text-ink2">Laden…</p>}
            {recipes?.length === 0 && (
              <p className="rs-in mb-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-ink2">
                Nog geen recepten. Maak er een met alleen de ingrediënten en zet ze met één tik op je lijst.
              </p>
            )}

            <ul className="mb-4 flex flex-col gap-3">
              {recipes?.map((r) => (
                <li key={r.id} className="rs-in card p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-semibold">{r.label}</p>
                      <p className="mt-0.5 text-sm text-ink2">{r.ingredients.join(", ")}</p>
                    </div>
                    <span className="flex-none rounded-full bg-line px-2.5 py-0.5 text-xs font-bold tabular-nums">{r.ingredients.length}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="btn btn-brand !min-h-11 flex-1 text-sm" disabled={busy === r.id} onClick={() => addToList(r)}>
                      {busy === r.id ? "Toevoegen…" : "Zet op lijst"}
                    </button>
                    <button className="rounded-full px-3 py-2 text-sm font-bold text-ink2 hover:bg-line" onClick={() => setDraft({ id: r.id, label: r.label, text: r.ingredients.join("\n") })}>
                      Bewerk
                    </button>
                    <button className="rounded-full px-3 py-2 text-sm font-bold text-brand hover:bg-brand/10" onClick={() => remove(r)}>
                      {confirmId === r.id ? "Zeker?" : "Wis"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button className="rs-in btn btn-ghost w-full" onClick={() => setDraft({ label: "", text: "" })}>
              + Nieuw recept
            </button>
          </div>
        )}

        <p role="status" className="mt-3 min-h-5 text-center text-sm font-semibold text-brand">
          {msg}
        </p>
      </div>
    </div>
  );
}
