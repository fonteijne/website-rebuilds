"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { thanks } from "@/lib/content";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { LEAD_SESSION_KEY, type LeadSession } from "@/lib/lead";

/** Bevestiging (vision.md, stap 4): kopie van de opdracht + uitleg van de volgende stap. */
export default function ThanksView() {
  const root = useRef<HTMLDivElement>(null);
  const [lead, setLead] = useState<LeadSession | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LEAD_SESSION_KEY);
      if (raw) setLead(JSON.parse(raw) as LeadSession);
    } catch {}
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline()
          .from("[data-check] path", { drawSVG: "0%", duration: 0.7, ease: "power2.inOut", stagger: 0.15 })
          .from("[data-in]", { opacity: 0, y: 18, duration: 0.6, stagger: 0.08 }, "-=0.4");
      });
    },
    { scope: root },
  );

  const steps = lead && !lead.mailed ? thanks.steps.slice(1) : thanks.steps;

  return (
    <div ref={root} className="mx-auto max-w-3xl px-4 sm:px-6">
      <svg data-check aria-hidden="true" viewBox="0 0 64 64" className="size-16 text-signal" fill="none">
        <path d="M32 4a28 28 0 1 1 0 56 28 28 0 0 1 0-56Z" stroke="currentColor" strokeWidth="2" />
        <path d="m20 33 8 8 16-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h1 data-in className="mt-8 text-title font-semibold">
        {thanks.title}
      </h1>
      <p data-in className="mt-5 text-lg leading-relaxed text-paper/85 sm:text-xl">
        {thanks.lead}
      </p>

      <div data-in className="mt-10 rounded-[24px] border border-line bg-ink-2 p-5 sm:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{thanks.yourPrompt}</p>
        {lead?.prompt ? (
          <p className="mt-3 whitespace-pre-line font-mono leading-relaxed text-paper">
            <span aria-hidden="true" className="text-signal">
              &gt;{" "}
            </span>
            {lead.prompt}
          </p>
        ) : (
          <p className="mt-3 text-muted">{thanks.noPrompt}</p>
        )}
      </div>

      <h2 data-in className="mt-14 text-2xl font-semibold tracking-tight">
        {thanks.stepsTitle}
      </h2>
      <ol className="mt-6 space-y-6">
        {steps.map((s, i) => (
          <li key={s.title} data-in className="grid grid-cols-[2.5rem_1fr] gap-2">
            <span className="font-mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        data-in
        href="/"
        className="mt-14 inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:text-paper hover:underline"
      >
        <span aria-hidden="true">←</span> {thanks.back}
      </Link>
    </div>
  );
}
