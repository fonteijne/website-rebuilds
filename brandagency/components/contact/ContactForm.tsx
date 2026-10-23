"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/content";

/**
 * Contactformulier. Er is (nog) geen mailservice gekoppeld, dus bij verzenden
 * wordt een e-mail naar info@brandagency.nl klaargezet in het mailprogramma.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Contact via website – ${name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field =
    "peer w-full border-0 border-b border-white/20 bg-transparent px-0 pb-3 pt-7 text-lg text-paper placeholder-transparent outline-none transition-colors focus:border-pink focus-visible:outline-none";
  const label =
    "pointer-events-none absolute left-0 top-7 text-lg text-paper/50 transition-all duration-300 ease-out-expo peer-focus:top-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-pink peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em]";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-coal p-6 sm:p-10" aria-describedby="form-note">
      <h2 className="text-2xl font-extrabold uppercase md:text-3xl">Stuur ons een bericht</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="relative">
          <input id="name" name="name" required autoComplete="name" placeholder="Naam" className={field} />
          <label htmlFor="name" className={label}>
            Naam
          </label>
        </div>
        <div className="relative">
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
          <label htmlFor="email" className={label}>
            Email
          </label>
        </div>
        <div className="relative sm:col-span-2">
          <textarea id="message" name="message" required rows={5} placeholder="Bericht" className={`${field} resize-none`} data-lenis-prevent />
          <label htmlFor="message" className={label}>
            Bericht
          </label>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <p id="form-note" className="max-w-xs text-xs leading-relaxed text-paper/50" aria-live="polite">
          {sent
            ? "Je mailprogramma is geopend met je bericht. Niets geopend? Mail ons direct op " + site.email + "."
            : "Je bericht wordt klaargezet in je eigen mailprogramma."}
        </p>
        <button
          type="submit"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-pink px-9 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform active:scale-95"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-white transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
          />
          <span className="relative transition-colors duration-300 group-hover:text-black">Versturen</span>
        </button>
      </div>
    </form>
  );
}
