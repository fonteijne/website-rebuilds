"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { useLenis } from "lenis/react";
import type { Member, User } from "@/lib/types";
import { api, colorFor, friendly } from "@/lib/api";
import { gsap, reducedMotion } from "@/lib/gsap";

type Props = { me: User; open: boolean; onClose: () => void; onLogout: () => void };

export default function SettingsSheet({ me, open, onClose, onLogout }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [regOpen, setRegOpen] = useState(true);
  const [msg, setMsg] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const lenis = useLenis();

  const load = useCallback(async () => {
    const d = await api<{ registrationOpen: boolean; members: Member[] }>("/api/admin/settings").catch(() => null);
    if (d) {
      setRegOpen(d.registrationOpen);
      setMembers(d.members);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setMsg("");
      setConfirmId(null);
      load();
    }
  }, [open, load]);

  // Openen/sluiten (timeline: achtergrond + sheet + rijen)
  useEffect(() => {
    if (!mounted) return;
    const reduce = reducedMotion();
    if (open) {
      lenis?.stop();
      const tl = gsap.timeline();
      tl.fromTo(".sheet-bg", { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.25 })
        .fromTo(sheet.current, { yPercent: 100 }, { yPercent: 0, duration: reduce ? 0 : 0.6, ease: "power4.out" }, 0)
        .from(".sheet-in", { y: 16, autoAlpha: 0, duration: reduce ? 0 : 0.4, stagger: 0.05, ease: "power2.out", clearProps: "all" }, reduce ? 0 : 0.2);
      return () => {
        tl.kill();
      };
    } else {
      lenis?.start();
      gsap
        .timeline({ onComplete: () => setMounted(false) })
        .to(sheet.current, { yPercent: 100, duration: reduce ? 0 : 0.35, ease: "power3.in" })
        .to(".sheet-bg", { autoAlpha: 0, duration: reduce ? 0 : 0.2 }, 0);
    }
  }, [open, mounted, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toggleReg = async () => {
    const next = !regOpen;
    setRegOpen(next);
    try {
      await api("/api/admin/settings", { method: "POST", json: { registrationOpen: next } });
      setMsg(next ? "Registratie staat open." : "Registratie is gesloten.");
    } catch (e) {
      setRegOpen(!next);
      setMsg(friendly(e));
    }
  };

  const removeMember = async (id: string) => {
    if (confirmId !== id) return setConfirmId(id);
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      setConfirmId(null);
      load();
    } catch (e) {
      setMsg(friendly(e));
    }
  };

  const addPasskey = async () => {
    setMsg("");
    try {
      const options = await api<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/auth/register/options", { method: "POST", json: { add: true } });
      const response = await startRegistration({ optionsJSON: options });
      await api("/api/auth/register/verify", { method: "POST", json: response });
      setMsg("Passkey toegevoegd.");
      load();
    } catch (e) {
      setMsg(friendly(e));
    }
  };

  if (!mounted) return null;

  return (
    <div ref={wrap} className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Instellingen">
      <button className="sheet-bg absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-label="Sluiten" onClick={onClose} />
      <div
        ref={sheet}
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[28px] bg-bg p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <div className="sheet-in mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full text-lg font-bold text-white" style={{ background: colorFor(me.id) }}>
            {me.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-semibold">{me.name}</p>
            <p className="text-sm text-ink2">{me.admin ? "Beheerder" : "Lid"}</p>
          </div>
          <button className="btn btn-ghost !min-h-10 !px-4 text-sm" onClick={onClose}>
            Klaar
          </button>
        </div>

        {me.admin && (
          <section className="sheet-in card mb-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-bold">Registratie</p>
                <p className="text-sm text-ink2">{regOpen ? "Open: iedereen met de link kan een account maken." : "Gesloten: alleen bestaande accounts kunnen inloggen."}</p>
              </div>
              <button
                role="switch"
                aria-checked={regOpen}
                aria-label="Registratie open"
                onClick={toggleReg}
                className="relative h-8 w-14 flex-none rounded-full transition-colors"
                style={{ background: regOpen ? "var(--leaf)" : "var(--line)" }}
              >
                <span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: regOpen ? "1.75rem" : "0.25rem" }} />
              </button>
            </div>
          </section>
        )}

        <section className="sheet-in card mb-4 p-4">
          <p className="mb-2 font-bold">Leden</p>
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white" style={{ background: colorFor(m.id) }}>
                  {m.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="flex-1 truncate font-semibold">
                  {m.name} {m.id === me.id && <span className="text-xs font-normal text-muted">(jij)</span>}
                </span>
                <span className="text-xs text-muted">{m.admin ? "beheerder" : `${m.passkeys} passkey${m.passkeys === 1 ? "" : "s"}`}</span>
                {me.admin && !m.admin && (
                  <button className="rounded-full px-3 py-1 text-sm font-bold text-brand hover:bg-brand/10" onClick={() => removeMember(m.id)}>
                    {confirmId === m.id ? "Zeker weten?" : "Verwijder"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="sheet-in flex flex-col gap-2">
          <button className="btn btn-ghost w-full" onClick={addPasskey}>
            Passkey toevoegen op dit apparaat
          </button>
          <button className="btn btn-ghost w-full" onClick={() => location.reload()}>
            Vernieuw app
          </button>
          <button className="btn btn-ghost w-full" onClick={onLogout}>
            Uitloggen
          </button>
          <p role="status" className="min-h-5 text-center text-sm font-semibold text-leaf">
            {msg}
          </p>
        </div>
      </div>
    </div>
  );
}
