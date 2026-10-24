import { promptForm } from "./content";

/** Gedeelde validatie voor client én server. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidPrompt = (p: string) => {
  const len = p.trim().length;
  return len >= promptForm.minLength && len <= promptForm.maxLength;
};

export const isValidEmail = (e: string) => e.length <= 254 && EMAIL_RE.test(e.trim());

export type LeadStatus = "nieuw" | "in-beoordeling" | "voorstel-verstuurd" | "akkoord" | "opgeleverd" | "niet-passend";

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "nieuw", label: "Nieuw" },
  { id: "in-beoordeling", label: "In beoordeling" },
  { id: "voorstel-verstuurd", label: "Voorstel verstuurd" },
  { id: "akkoord", label: "Akkoord (betaald)" },
  { id: "opgeleverd", label: "Opgeleverd" },
  { id: "niet-passend", label: "Niet passend" },
];

export type Lead = {
  id: string;
  prompt: string;
  email: string;
  /** Losse, optionele toestemming; staat ook apart in de marketinglijst. */
  marketing: boolean;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  source?: string;
};

/** Funnelstappen uit vision.md ("Succesmeting"). Alleen tellers, geen persoonsgegevens. */
export const FUNNEL_EVENTS = ["visit", "prompt_start", "prompt_step2", "lead"] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

/** Wat de bedankpagina uit sessionStorage leest. */
export const LEAD_SESSION_KEY = "sps:lead";
export type LeadSession = { prompt: string; mailed: boolean };
