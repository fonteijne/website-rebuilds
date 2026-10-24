import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Wat Single Prompt Studio doet met je prompt en je e-mailadres.",
  alternates: { canonical: "/privacy" },
};

/*
 * CONCEPT. Bedrijfsgegevens en bewaartermijnen staan bij "Open besluiten" in vision.md;
 * de [placeholders] hieronder moeten vóór livegang worden ingevuld.
 */
const sections = [
  {
    h: "Wie wij zijn",
    p: [
      `${site.name} (${site.url.replace("https://", "")}) is een handelsnaam van [bedrijfsnaam], ingeschreven bij de KvK onder nummer [KvK-nummer]. Vragen over privacy stuur je naar ${site.email}.`,
    ],
  },
  {
    h: "Wat we verzamelen",
    p: [
      "Je prompt (de opdracht die je beschrijft) en je e-mailadres. Daarnaast, alleen als je dat apart aanvinkt, je toestemming om voorbeelden en aanbiedingen te ontvangen.",
      "We meten anoniem hoeveel bezoekers een prompt beginnen en indienen. Daarvoor gebruiken we geen cookies en slaan we geen persoonsgegevens op.",
    ],
  },
  {
    h: "Waarvoor we het gebruiken",
    p: [
      "Om je opdracht te beoordelen, je een voorstel te sturen en daarover contact met je te houden. We bewaren je prompt bij je aanvraag, zodat je je briefing niet opnieuw hoeft te geven.",
      "Heb je je ook ingeschreven voor voorbeelden en aanbiedingen? Dan sturen we je af en toe “Eén prompt van de week”. Die inschrijving staat los van je aanvraag en afmelden kan in elke mail.",
    ],
  },
  {
    h: "Met wie we het delen",
    p: [
      "Alleen met de diensten die nodig zijn om de site en e-mail te laten werken: hosting (Vercel), opslag van aanvragen (Upstash) en e-mailverzending (Resend). We verkopen je gegevens nooit.",
    ],
  },
  {
    h: "Hoe lang we het bewaren",
    p: ["[Bewaartermijn vaststellen.] Wil je eerder dat we je aanvraag verwijderen? Mail ons, dan doen we dat."],
  },
  {
    h: "Je rechten",
    p: [
      `Je mag je gegevens inzien, laten corrigeren of laten verwijderen, en je toestemming voor marketing altijd intrekken. Mail naar ${site.email}. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.`,
    ],
  },
];

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-gt-blue">Privacy</p>
      <h1 className="mt-4 text-title font-semibold">Wat we doen met je prompt.</h1>
      <p className="mt-5 text-lg text-muted">
        Kort en duidelijk: we gebruiken je gegevens om je opdracht af te handelen, en voor niets anders zonder jouw
        toestemming.
      </p>
      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="mt-3 leading-relaxed text-paper/80">
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
