import "server-only";
import { Redis } from "@upstash/redis";
import type { FunnelEvent, Lead, LeadStatus } from "./lead";

/**
 * Opslag van aanvragen, marketingtoestemming en funneltellers in Upstash Redis (via Vercel).
 * Keys:
 *   lead:{id}            hash met de aanvraag
 *   leads                lijst met ids, nieuwste eerst
 *   marketing:optin      hash e-mail → ISO-datum (los van de aanvraagstatus, vision.md)
 *   funnel:total         hash event → aantal
 *   funnel:day:{datum}   hash event → aantal
 * Zonder env vars is er geen opslag (null). Alleen voor lokaal testen: LEAD_STORE=memory.
 */
export interface Store {
  saveLead(lead: Lead): Promise<void>;
  listLeads(limit?: number): Promise<Lead[]>;
  setStatus(id: string, status: LeadStatus): Promise<boolean>;
  optIn(email: string): Promise<void>;
  marketingCount(): Promise<number>;
  track(event: FunnelEvent): Promise<void>;
  funnel(): Promise<Record<string, number>>;
  /** Telt hits per sleutel binnen een venster; geeft het nieuwe aantal terug. */
  hit(key: string, windowSeconds: number): Promise<number>;
}

const today = () => new Date().toISOString().slice(0, 10);

function redisStore(r: Redis): Store {
  return {
    async saveLead(lead) {
      await r.hset(`lead:${lead.id}`, lead);
      await r.lpush("leads", lead.id);
    },
    async listLeads(limit = 200) {
      const ids = await r.lrange<string>("leads", 0, limit - 1);
      if (!ids.length) return [];
      const p = r.pipeline();
      ids.forEach((id) => p.hgetall(`lead:${id}`));
      const rows = (await p.exec()) as (Record<string, unknown> | null)[];
      return rows
        .filter(Boolean)
        .map((row) => ({ ...row, marketing: row!.marketing === true || row!.marketing === "true" }) as Lead);
    },
    async setStatus(id, status) {
      if (!(await r.exists(`lead:${id}`))) return false;
      await r.hset(`lead:${id}`, { status, updatedAt: new Date().toISOString() });
      return true;
    },
    async optIn(email) {
      await r.hset("marketing:optin", { [email.toLowerCase()]: new Date().toISOString() });
    },
    marketingCount: () => r.hlen("marketing:optin"),
    async track(event) {
      const p = r.pipeline();
      p.hincrby("funnel:total", event, 1);
      p.hincrby(`funnel:day:${today()}`, event, 1);
      p.expire(`funnel:day:${today()}`, 60 * 60 * 24 * 400);
      await p.exec();
    },
    async funnel() {
      const raw = (await r.hgetall<Record<string, number | string>>("funnel:total")) ?? {};
      return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
    },
    async hit(key, windowSeconds) {
      const n = await r.incr(`rl:${key}`);
      if (n === 1) await r.expire(`rl:${key}`, windowSeconds);
      return n;
    },
  };
}

function memoryStore(): Store {
  const leads = new Map<string, Lead>();
  const order: string[] = [];
  const optins = new Map<string, string>();
  const funnel: Record<string, number> = {};
  const hits = new Map<string, { n: number; until: number }>();
  return {
    async saveLead(lead) {
      leads.set(lead.id, lead);
      order.unshift(lead.id);
    },
    async listLeads(limit = 200) {
      return order.slice(0, limit).map((id) => leads.get(id)!);
    },
    async setStatus(id, status) {
      const l = leads.get(id);
      if (!l) return false;
      leads.set(id, { ...l, status, updatedAt: new Date().toISOString() });
      return true;
    },
    async optIn(email) {
      optins.set(email.toLowerCase(), new Date().toISOString());
    },
    marketingCount: async () => optins.size,
    async track(event) {
      funnel[event] = (funnel[event] ?? 0) + 1;
    },
    funnel: async () => ({ ...funnel }),
    async hit(key, windowSeconds) {
      const now = Date.now();
      const h = hits.get(key);
      const next = h && h.until > now ? { n: h.n + 1, until: h.until } : { n: 1, until: now + windowSeconds * 1000 };
      hits.set(key, next);
      return next.n;
    },
  };
}

const g = globalThis as unknown as { __spsStore?: Store | null };

export function getStore(): Store | null {
  if (g.__spsStore !== undefined) return g.__spsStore;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) g.__spsStore = redisStore(new Redis({ url, token }));
  else if (process.env.LEAD_STORE === "memory") g.__spsStore = memoryStore();
  else g.__spsStore = null;
  return g.__spsStore;
}
