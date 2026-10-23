import type { Metadata } from "next";
import { LEAD_STATUSES } from "@/lib/lead";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Beheer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const pct = (a = 0, b = 0) => (b ? `${Math.round((a / b) * 100)}%` : "–");
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" });

/**
 * Intern overzicht (vision.md, MVP: "interne mogelijkheid om aanvragen te beoordelen en op te volgen").
 * Beveiligd met Basic Auth in proxy.ts. Funnelstappen 3 t/m 6 volgen uit de status per aanvraag.
 */
export default async function Page() {
  const store = getStore();
  if (!store) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-32">
        <h1 className="text-3xl font-semibold">Beheer</h1>
        <p className="mt-4 text-muted">
          Er is geen opslag gekoppeld. Zet de Upstash-variabelen in Vercel (zie README).
        </p>
      </section>
    );
  }

  const [leads, funnel, optins] = await Promise.all([store.listLeads(), store.funnel(), store.marketingCount()]);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, leads.filter((l) => l.status === s.id).length]));
  const qualified = leads.filter(
    (l) => l.status !== "nieuw" && l.status !== "niet-passend" && l.status !== "in-beoordeling",
  ).length;
  const paid = (byStatus["akkoord"] ?? 0) + (byStatus["opgeleverd"] ?? 0);

  const stats = [
    { label: "Bezoeken (sessies)", value: funnel.visit ?? 0 },
    { label: "Prompt begonnen", value: funnel.prompt_start ?? 0, rate: pct(funnel.prompt_start, funnel.visit) },
    { label: "Naar e-mailstap", value: funnel.prompt_step2 ?? 0, rate: pct(funnel.prompt_step2, funnel.prompt_start) },
    { label: "Aanvragen", value: funnel.lead ?? 0, rate: pct(funnel.lead, funnel.prompt_step2) },
    { label: "Voorstel verstuurd+", value: qualified, rate: pct(qualified, leads.length) },
    { label: "Betaald", value: paid, rate: pct(paid, qualified) },
    { label: "Marketing opt-ins", value: optins },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Beheer</h1>
      <p className="mt-2 text-muted">{leads.length} aanvragen. Nieuwste bovenaan.</p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-ink-2 p-4">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {s.value}
              {s.rate && <span className="ml-2 text-sm font-normal text-signal">{s.rate}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-10 space-y-4">
        {leads.map((l) => (
          <li key={l.id} id={l.id} className="rounded-2xl border border-line bg-ink-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <a
                  className="font-medium text-paper underline-offset-4 hover:underline"
                  href={`mailto:${l.email}?subject=${encodeURIComponent("Je voorstel van Single Prompt Studio")}&body=${encodeURIComponent(`Je prompt:\n> ${l.prompt}\n\n`)}`}
                >
                  {l.email}
                </a>
                <span className="text-muted">{fmt(l.createdAt)}</span>
                {l.marketing && (
                  <span className="rounded-full border border-signal/50 px-2 py-0.5 text-xs text-signal">
                    marketing
                  </span>
                )}
              </div>
              <form action="/api/beheer/status" method="post" className="flex items-center gap-2">
                <input type="hidden" name="id" value={l.id} />
                <label className="sr-only" htmlFor={`s-${l.id}`}>
                  Status
                </label>
                <select
                  id={`s-${l.id}`}
                  name="status"
                  defaultValue={l.status}
                  className="rounded-full border border-line bg-ink px-3 py-1.5 text-sm"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold text-ink">Opslaan</button>
              </form>
            </div>
            <p className="mt-4 whitespace-pre-line font-mono text-sm leading-relaxed text-paper/90">{l.prompt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
