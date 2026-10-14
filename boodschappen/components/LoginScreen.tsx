"use client";

import { useRef, useState } from "react";
import { startAuthentication, startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import type { User } from "@/lib/types";
import { api, friendly } from "@/lib/api";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import type { Invite } from "./Root";
import Backdrop from "./Backdrop";
import SplitText from "./reactbits/SplitText";
import Magnet from "./reactbits/Magnet";

type Props = {
  registrationOpen: boolean;
  invite: Invite | null;
  hasUsers: boolean;
  needsSetupCode: boolean;
  onAuthed: (u: User) => void;
};

export default function LoginScreen({ registrationOpen, invite, hasUsers, needsSetupCode, onAuthed }: Props) {
  // Met een uitnodigingslink maak je een account in die familie, zonder link start je een nieuwe familie.
  // De globale schakelaar van de beheerder wint altijd; `invite.open` houdt daar al rekening mee.
  const canRegister = invite ? invite.open : registrationOpen;
  const joining = invite?.family ?? null;
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"login" | "register">(!hasUsers || (invite?.open && joining) ? "register" : "login");
  const [name, setName] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".basket-path", { strokeDashoffset: 1, duration: 1.1, stagger: 0.12, ease: "power2.inOut" })
          .from(".basket-fill", { opacity: 0, scale: 0.8, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(2)" }, 0.5)
          .from(".tagline", { y: 18, opacity: 0, duration: 0.7 }, 0.9)
          .from(".auth-card", { y: 40, opacity: 0, duration: 0.8 }, 1.0);
        gsap.to(".basket", { y: -8, rotation: 2, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Wissel tussen inloggen en account maken met een kleine hoogte-animatie.
  const switchMode = (next: "login" | "register") => {
    setError("");
    if (reducedMotion()) return setMode(next);
    gsap.to(".auth-body", {
      autoAlpha: 0,
      y: 8,
      duration: 0.15,
      onComplete: () => {
        setMode(next);
        gsap.to(".auth-body", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", delay: 0.02 });
      },
    });
  };

  const fail = (e: unknown) => {
    setError(friendly(e));
    if (!reducedMotion()) gsap.fromTo(".auth-card", { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1.2, 0.25)" });
  };

  const done = (u: User) => {
    if (invite) history.replaceState(null, "", location.pathname);
    if (reducedMotion()) return onAuthed(u);
    gsap.to(root.current, { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in", onComplete: () => onAuthed(u) });
  };

  const login = async () => {
    setBusy(true);
    setError("");
    try {
      const options = await api<Parameters<typeof startAuthentication>[0]["optionsJSON"]>("/api/auth/login/options", { method: "POST", json: {} });
      const response = await startAuthentication({ optionsJSON: options });
      const { user } = await api<{ user: User }>("/api/auth/login/verify", { method: "POST", json: response });
      done(user);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const options = await api<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/auth/register/options", {
        method: "POST",
        json: { name, setupCode, familyName, invite: invite?.code },
      });
      const response = await startRegistration({ optionsJSON: options });
      const { user } = await api<{ user: User }>("/api/auth/register/verify", { method: "POST", json: response });
      done(user);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const supported = typeof window === "undefined" ? true : browserSupportsWebAuthn();

  return (
    <main ref={root} className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <Backdrop />

      <div className="mb-8 flex flex-col items-center text-center">
        <svg className="basket mb-4 h-24 w-24 text-ink" viewBox="0 0 96 96" fill="none" aria-hidden>
          <path className="basket-fill" d="M16 42h64l-6.5 34a6 6 0 0 1-5.9 4.9H28.4A6 6 0 0 1 22.5 76z" fill="var(--sun)" />
          <path className="basket-path" pathLength={1} style={{ strokeDasharray: 1 }} d="M16 42h64l-6.5 34a6 6 0 0 1-5.9 4.9H28.4A6 6 0 0 1 22.5 76z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path className="basket-path" pathLength={1} style={{ strokeDasharray: 1 }} d="M32 42c0-13 7-22 16-22s16 9 16 22" stroke="var(--brand)" strokeWidth="5" strokeLinecap="round" />
          <path className="basket-path" pathLength={1} style={{ strokeDasharray: 1 }} d="M36 58l8 8 16-17" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="sr-only">Boodschappen</h1>
        <SplitText text="Boodschappen" tag="h2" className="font-display text-[clamp(2.6rem,13vw,3.8rem)] font-semibold leading-none tracking-tight" delay={45} duration={1} rootMargin="0px" />
        <p className="tagline mt-3 max-w-[22ch] text-balance text-ink2">Samen één lijst. Nooit meer dubbel kopen.</p>
      </div>

      <section className="auth-card card p-5">
        <div className="auth-body">
          {!supported && <p className="mb-3 rounded-xl bg-brand/10 p-3 text-sm">Deze browser ondersteunt geen passkeys. Probeer Safari, Chrome of Edge.</p>}

          {mode === "login" ? (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-xl font-semibold">Welkom terug</h3>
              <p className="text-sm text-ink2">Log in met je vingerafdruk, gezicht of schermvergrendeling. Geen wachtwoord nodig.</p>
              <Magnet padding={60} magnetStrength={4} wrapperClassName="!block" innerClassName="w-full">
                <button className="btn btn-brand w-full" onClick={login} disabled={busy || !supported}>
                  <KeyIcon /> {busy ? "Even wachten…" : "Inloggen met passkey"}
                </button>
              </Magnet>
              {invite && !joining && <p className="rounded-xl bg-brand/10 p-3 text-center text-sm">Deze uitnodigingslink is ongeldig of vervangen. Vraag om een nieuwe link.</p>}
              {invite && joining && !invite.open && <p className="rounded-xl bg-brand/10 p-3 text-center text-sm">De registratie voor {joining} is gesloten.</p>}
              {canRegister ? (
                <button className="btn btn-ghost w-full" onClick={() => switchMode("register")}>
                  {joining ? `Nieuw hier? Doe mee met ${joining}` : "Nieuw hier? Account maken"}
                </button>
              ) : (
                !invite && <p className="text-center text-xs text-muted">Registratie is gesloten. Alleen bestaande accounts kunnen inloggen.</p>
              )}
            </div>
          ) : (
            <form onSubmit={register} className="flex flex-col gap-3">
              <h3 className="font-display text-xl font-semibold">{joining ? `Doe mee met ${joining}` : hasUsers ? "Eigen familie starten" : "Eerste keer: jij wordt beheerder"}</h3>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Je naam
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Sam" maxLength={24} autoComplete="name" required />
              </label>
              {!joining && (
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Naam van je familie <span className="font-normal text-muted">(optioneel)</span>
                  <input className="input" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Bijv. Familie Jansen" maxLength={30} />
                </label>
              )}
              {needsSetupCode && (
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Setup-code
                  <input className="input" value={setupCode} onChange={(e) => setSetupCode(e.target.value)} placeholder="Staat in je Vercel-instellingen" autoComplete="off" required />
                </label>
              )}
              <button className="btn btn-brand w-full" disabled={busy || !supported || !canRegister}>
                <KeyIcon /> {busy ? "Even wachten…" : "Passkey aanmaken"}
              </button>
              {!canRegister && <p className="text-center text-xs text-muted">Registratie is gesloten.</p>}
              {hasUsers && (
                <button type="button" className="btn btn-ghost w-full" onClick={() => switchMode("login")}>
                  Ik heb al een account
                </button>
              )}
            </form>
          )}

          <p role="alert" aria-live="polite" className="mt-3 min-h-5 text-center text-sm font-semibold text-brand">
            {error}
          </p>
        </div>
      </section>
    </main>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 20 3m-3 3 3 3m-6-0 2 2" />
    </svg>
  );
}
