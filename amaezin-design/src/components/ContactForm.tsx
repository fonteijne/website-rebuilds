"use client";

import { useState } from "react";
import { site } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "peer w-full rounded-2xl border border-white/15 bg-white/[0.03] px-5 pb-3 pt-7 text-base text-paper outline-none transition-colors placeholder-transparent focus:border-pink";
const label =
  "pointer-events-none absolute left-5 top-2.5 font-mono text-[11px] uppercase tracking-widest text-mute transition-colors peer-focus:text-pink";

/**
 * Posts to /api/contact (which mails via Resend when RESEND_API_KEY is set).
 * If the endpoint isn't configured, falls back to opening the visitor's mail client.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      if (res.status === 501) {
        const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Contactaanvraag via de website")}&body=${body}`;
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl bg-pink p-8 text-ink md:p-12">
        <p className="font-display text-3xl font-extrabold md:text-4xl">Bedankt! 🎉</p>
        <p className="mt-3 text-lg">Je bericht is binnen. Je hoort snel van ons — tot snel!</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate={false}>
      <div className="relative">
        <input id="cf-name" name="name" type="text" required autoComplete="name" placeholder="Naam" className={field} />
        <label htmlFor="cf-name" className={label}>
          Naam
        </label>
      </div>
      <div className="relative">
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="E-mailadres"
          className={field}
        />
        <label htmlFor="cf-email" className={label}>
          E-mailadres
        </label>
      </div>
      <div className="relative">
        <textarea id="cf-message" name="message" required rows={5} placeholder="Bericht" className={`${field} resize-y`} />
        <label htmlFor="cf-message" className={label}>
          Bericht
        </label>
      </div>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-pink px-8 font-semibold text-ink transition-transform active:scale-95 disabled:opacity-60"
        >
          {status === "sending" ? "Versturen…" : "Versturen"}
          <span aria-hidden>→</span>
        </button>
        <p aria-live="polite" className="text-sm text-paper/60">
          {status === "error" ? (
            <span className="text-pink">
              Oeps, dat ging mis. Mail ons direct via{" "}
              <a className="underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              .
            </span>
          ) : (
            "We reageren meestal binnen één werkdag."
          )}
        </p>
      </div>
    </form>
  );
}
