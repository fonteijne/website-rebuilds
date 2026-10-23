"use client";

import { useLenis } from "lenis/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import Magnet from "@/components/fx/Magnet";
import { emailStep, promptForm, site } from "@/lib/content";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isValidEmail, isValidPrompt, LEAD_SESSION_KEY, type LeadSession } from "@/lib/lead";
import { PREFILL_EVENT, type PrefillDetail } from "@/lib/prefill";
import { track } from "@/lib/track";

const DRAFT_KEY = "sps:draft";
const starters = promptForm.chips.map((c) => c.starter);
const isStarterOnly = (v: string) => !v.trim() || starters.includes(v);

type Step = "prompt" | "email";
type SendState = "idle" | "sending" | "error" | "fallback";

/**
 * De funnel in één component (vision.md, stap 2 en 3): eerst de opdracht, daarna het e-mailadres.
 * Geen account, geen chatbot, één duidelijke actie per stap.
 */
export default function PromptForm() {
  const router = useRouter();
  const lenis = useLenis();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);

  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [promptError, setPromptError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [send, setSend] = useState<SendState>("idle");
  const [focused, setFocused] = useState(false);
  const startedRef = useRef(false);

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Mijn prompt")}&body=${encodeURIComponent(
    `${prompt.trim()}\n\nStuur mijn voorstel naar: ${email.trim()}`,
  )}`;

  // Concept terugzetten (bijv. na een uitstapje naar /privacy) en het bezoek tellen.
  useEffect(() => {
    track("visit");
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) setPrompt(draft);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (prompt) sessionStorage.setItem(DRAFT_KEY, prompt);
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, [prompt]);

  const focusPrompt = useCallback(() => {
    const el = textarea.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // Diensten en slot-CTA vragen dit veld om in beeld te komen (en eventueel te vullen).
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { starter } = (e as CustomEvent<PrefillDetail>).detail ?? {};
      setStep("prompt");
      if (starter) setPrompt((p) => (isStarterOnly(p) ? starter : p));
      const target = root.current!;
      const done = () => requestAnimationFrame(focusPrompt);
      if (lenis && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        lenis.scrollTo(target, { offset: -120, duration: 1.2, onComplete: done });
      } else {
        target.scrollIntoView({ block: "center" });
        done();
      }
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [lenis, focusPrompt]);

  const showGhost = step === "prompt" && !prompt && !focused;
  const ghostTl = useRef<gsap.core.Timeline | null>(null);
  const ghostWanted = useRef(showGhost);
  const ghostInView = useRef(false);
  const [ghostOn, setGhostOn] = useState(false);

  const syncGhost = useCallback(() => {
    const tl = ghostTl.current;
    if (!tl) return;
    if (ghostWanted.current && ghostInView.current) tl.play();
    else tl.pause();
  }, []);

  // Getypte voorbeelden in het lege veld. Pauzeert bij focus, invoer of buiten beeld.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Via de ref schrijven: het veld wordt opnieuw gemount na "Wijzig" in stap 2.
        const write = (ex: string, p: { n: number }) => () => {
          if (ghost.current) ghost.current.textContent = ex.slice(0, Math.round(p.n));
        };
        const tl = gsap.timeline({ repeat: -1, paused: true });
        promptForm.examples.forEach((ex) => {
          const p = { n: 0 };
          tl.to(p, { n: ex.length, duration: ex.length * 0.034, ease: "none", onUpdate: write(ex, p) })
            .to({}, { duration: 2 })
            .to(p, { n: 0, duration: ex.length * 0.012, ease: "power1.in", onUpdate: write(ex, p) })
            .to({}, { duration: 0.35 });
        });
        ghostTl.current = tl;
        setGhostOn(true);
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            ghostInView.current = self.isActive;
            syncGhost();
          },
        });
        return () => {
          st.kill();
          ghostTl.current = null;
          setGhostOn(false);
        };
      });
    },
    { scope: root },
  );

  // Zet de typ-animatie aan/uit zonder re-render in de animatielus.
  useEffect(() => {
    ghostWanted.current = showGhost;
    syncGhost();
  }, [showGhost, syncGhost]);

  // Nieuwe stap rustig in beeld (niet bij de eerste render: dan staat het formulier er gewoon).
  const stepMounted = useRef(false);
  useGSAP(
    () => {
      if (!stepMounted.current) {
        stepMounted.current = true;
        return;
      }
      const panel = root.current?.querySelector<HTMLElement>("[data-step]");
      if (!panel) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(panel.querySelectorAll("[data-step-item]"), { opacity: 0, y: 14, duration: 0.5, stagger: 0.05 });
      });
    },
    { scope: root, dependencies: [step], revertOnUpdate: true },
  );

  // En de focus naar het eerste veld van de nieuwe stap.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (step === "email") emailInput.current?.focus({ preventScroll: true });
    else focusPrompt();
  }, [step, focusPrompt]);

  const onPromptChange = (v: string) => {
    setPrompt(v);
    if (promptError && isValidPrompt(v)) setPromptError(false);
    if (!startedRef.current && v.trim()) {
      startedRef.current = true;
      track("prompt_start");
    }
  };

  const pickChip = (starter: string) => {
    setPrompt((p) => (isStarterOnly(p) ? starter : p));
    if (!startedRef.current) {
      startedRef.current = true;
      track("prompt_start");
    }
    requestAnimationFrame(focusPrompt);
  };

  const toEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPrompt(prompt) || isStarterOnly(prompt)) {
      setPromptError(true);
      focusPrompt();
      return;
    }
    track("prompt_step2");
    setStep("email");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError(true);
      emailInput.current?.focus();
      return;
    }
    setSend("sending");
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const res = await fetch("/api/aanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), email: email.trim(), marketing, website, source: "home" }),
      });
      if (res.status === 501) {
        setSend("fallback");
        window.location.href = mailto;
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; mailed?: boolean };
      if (!res.ok || !data.ok) throw new Error(String(res.status));
      try {
        sessionStorage.setItem(
          LEAD_SESSION_KEY,
          JSON.stringify({ prompt: prompt.trim(), mailed: !!data.mailed } satisfies LeadSession),
        );
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push("/bedankt");
    } catch {
      setSend("error");
    }
  };

  const ids = {
    label: `${uid}-label`,
    help: `${uid}-help`,
    err: `${uid}-err`,
    title: `${uid}-title`,
    emailErr: `${uid}-emailerr`,
    privacy: `${uid}-privacy`,
  };

  return (
    <div
      ref={root}
      id="prompt"
      className="relative scroll-mt-28 rounded-[28px] border border-line bg-ink-2 p-2 shadow-[0_40px_120px_-40px_rgb(255_91_34/0.35)] sm:p-3"
    >
      {step === "prompt" ? (
        <form data-step="prompt" onSubmit={toEmail} noValidate aria-labelledby={ids.label}>
          <div
            data-step-item
            className="rounded-[22px] bg-ink-3/70 p-4 ring-1 ring-line transition-shadow focus-within:ring-signal/70 sm:p-5"
          >
            <label
              id={ids.label}
              htmlFor={`${uid}-prompt`}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted"
            >
              <span aria-hidden="true" className="text-signal">
                &gt;
              </span>
              {promptForm.label}
            </label>
            <div className="relative mt-3">
              <textarea
                ref={textarea}
                id={`${uid}-prompt`}
                name="prompt"
                rows={3}
                value={prompt}
                maxLength={promptForm.maxLength}
                onChange={(e) => onPromptChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={promptForm.placeholder}
                data-typing={showGhost && ghostOn ? "true" : undefined}
                aria-describedby={`${ids.help}${promptError ? ` ${ids.err}` : ""}`}
                aria-invalid={promptError || undefined}
                className="block max-h-[50vh] min-h-[7.5rem] w-full resize-none bg-transparent font-mono text-[1.02rem] leading-relaxed text-paper outline-none [field-sizing:content] placeholder:text-muted/70 sm:text-lg"
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 font-mono text-[1.02rem] leading-relaxed text-muted sm:text-lg ${
                  showGhost && ghostOn ? "opacity-100" : "opacity-0"
                }`}
              >
                <span ref={ghost} />
                <span className="caret" />
              </span>
            </div>
            <p id={ids.help} className="mt-3 font-mono text-xs text-muted">
              <span className="sr-only">Bijvoorbeeld: {promptForm.placeholder}. </span>
              {promptForm.helper.map((w, i) => (
                <span key={w}>
                  <span className="text-paper/80">{w}</span>
                  {i < promptForm.helper.length - 1 ? (
                    <span aria-hidden="true"> … </span>
                  ) : (
                    <span aria-hidden="true"> …</span>
                  )}
                </span>
              ))}
              <span className="ml-2 hidden sm:inline">— {promptForm.helperNote}</span>
            </p>
          </div>

          <div data-step-item className="mt-3 flex flex-wrap gap-2 px-1" role="group" aria-label="Inspiratie">
            {promptForm.chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickChip(c.starter)}
                aria-pressed={prompt === c.starter}
                className="rounded-full border border-line px-3.5 py-2 text-sm text-paper/85 transition-colors hover:border-paper/40 hover:text-paper aria-pressed:border-signal aria-pressed:text-signal"
              >
                {c.label}
              </button>
            ))}
          </div>

          {promptError && (
            <p id={ids.err} role="alert" className="mt-3 px-2 text-sm text-signal-soft">
              {promptForm.tooShort}
            </p>
          )}

          <div data-step-item className="mt-3 flex flex-col gap-3 p-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="px-1 text-sm text-muted">{promptForm.support}</p>
            <Magnet className="w-full sm:w-auto">
              <SubmitButton>{promptForm.submit}</SubmitButton>
            </Magnet>
          </div>
        </form>
      ) : (
        <form data-step="email" onSubmit={submit} noValidate aria-labelledby={ids.title} className="p-3 sm:p-5">
          <div
            data-step-item
            className="flex items-start justify-between gap-4 rounded-2xl bg-ink-3/70 p-4 ring-1 ring-line"
          >
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{emailStep.yourPrompt}</p>
              <p className="mt-2 line-clamp-3 font-mono text-sm leading-relaxed text-paper/90">{prompt.trim()}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("prompt")}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-paper/85 hover:border-paper/40"
            >
              {emailStep.edit}
              <span className="sr-only"> je prompt</span>
            </button>
          </div>

          <h2 id={ids.title} data-step-item className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            {emailStep.title}
          </h2>
          <p data-step-item className="mt-2 max-w-xl text-muted">
            {emailStep.lead}
          </p>

          <div data-step-item className="mt-5">
            <label htmlFor={`${uid}-email`} className="text-sm font-medium">
              {emailStep.label}
            </label>
            <input
              ref={emailInput}
              id={`${uid}-email`}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              placeholder={emailStep.placeholder}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError && isValidEmail(e.target.value)) setEmailError(false);
              }}
              aria-invalid={emailError || undefined}
              aria-describedby={`${ids.privacy}${emailError ? ` ${ids.emailErr}` : ""}`}
              className="mt-2 block w-full rounded-2xl border border-line bg-ink-3/70 px-4 py-3.5 text-lg text-paper outline-none transition-colors placeholder:text-muted/60 focus:border-signal"
            />
            {emailError && (
              <p id={ids.emailErr} role="alert" className="mt-2 text-sm text-signal-soft">
                {emailStep.invalidEmail}
              </p>
            )}
          </div>

          {/* Honeypot: onzichtbaar voor mensen, verleidelijk voor bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <label data-step-item className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-paper/85">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-signal"
            />
            <span>{emailStep.marketing}</span>
          </label>

          <p id={ids.privacy} data-step-item className="mt-3 text-xs leading-relaxed text-muted">
            {emailStep.privacy}{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-paper">
              Privacy
            </Link>
            .
          </p>

          <div data-step-item className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnet className="w-full sm:w-auto">
              <SubmitButton disabled={send === "sending"}>
                {send === "sending" ? emailStep.sending : emailStep.submit}
              </SubmitButton>
            </Magnet>
          </div>

          <div aria-live="polite" className="mt-3 text-sm">
            {send === "error" && (
              <p className="text-signal-soft">
                {emailStep.error}{" "}
                <a href={mailto} className="underline underline-offset-2">
                  Mail je prompt
                </a>
              </p>
            )}
            {send === "fallback" && (
              <p className="text-muted">
                {emailStep.fallback}{" "}
                <a href={mailto} className="text-paper underline underline-offset-2">
                  Open je mail opnieuw
                </a>
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-3 rounded-full bg-signal px-6 py-4 text-base font-semibold text-ink transition-colors hover:bg-signal-soft disabled:opacity-60 sm:w-auto"
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
