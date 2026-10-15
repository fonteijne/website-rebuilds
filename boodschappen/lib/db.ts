import { Redis } from "@upstash/redis";

/**
 * Minimale key-value laag. Productie = Upstash Redis (REST).
 * Alleen buiten productie valt hij terug op geheugen, zodat je lokaal zonder account kunt testen.
 */
export interface DB {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }): Promise<boolean>;
  del(key: string): Promise<void>;
  getdel<T>(key: string): Promise<T | null>;
  incr(key: string): Promise<number>;
  hset(key: string, field: string, value: unknown): Promise<void>;
  hsetMany(key: string, values: Record<string, unknown>): Promise<void>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hgetall<T>(key: string): Promise<Record<string, T>>;
  hdel(key: string, ...fields: string[]): Promise<void>;
  sadd(key: string, member: string): Promise<void>;
  srem(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
  zincr(key: string, member: string, by: number): Promise<void>;
  zincrMany(key: string, members: string[]): Promise<void>;
  ztop(key: string, n: number): Promise<string[]>;
}

function upstash(): DB {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is niet gekoppeld (KV_REST_API_URL / KV_REST_API_TOKEN ontbreken).");
  const r = new Redis({ url, token });
  return {
    get: (k) => r.get(k),
    async set(k, v, o) {
      const res = await r.set(k, v as never, { ...(o?.ex ? { ex: o.ex } : {}), ...(o?.nx ? { nx: true } : {}) } as never);
      return res === "OK";
    },
    async del(k) {
      await r.del(k);
    },
    getdel: (k) => r.getdel(k),
    incr: (k) => r.incr(k),
    async hset(k, f, v) {
      await r.hset(k, { [f]: v as never });
    },
    async hsetMany(k, values) {
      await r.hset(k, values as never);
    },
    hget: (k, f) => r.hget(k, f),
    async hgetall(k) {
      return ((await r.hgetall(k)) ?? {}) as never;
    },
    async hdel(k, ...f) {
      if (f.length) await r.hdel(k, ...f);
    },
    async sadd(k, m) {
      await r.sadd(k, m);
    },
    async srem(k, m) {
      await r.srem(k, m);
    },
    smembers: (k) => r.smembers(k),
    async zincr(k, m, by) {
      await r.zincrby(k, by, m);
    },
    async zincrMany(k, members) {
      if (!members.length) return;
      const p = r.pipeline();
      for (const m of members) p.zincrby(k, 1, m);
      await p.exec();
    },
    ztop: (k, n) => r.zrange(k, 0, n - 1, { rev: true }) as Promise<string[]>,
  };
}

function memory(): DB {
  const g = globalThis as unknown as { __mem?: Map<string, unknown> };
  const m = (g.__mem ??= new Map<string, unknown>());
  const clone = <T,>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));
  const exp = new Map<string, number>();
  const live = (k: string) => {
    const e = exp.get(k);
    if (e && e < Date.now()) {
      m.delete(k);
      exp.delete(k);
    }
  };
  const hash = (k: string) => (m.get(k) as Map<string, unknown>) ?? new Map<string, unknown>();
  return {
    async get<T>(k: string) {
      live(k);
      return (m.has(k) ? clone(m.get(k)) : null) as T | null;
    },
    async set(k, v, o) {
      live(k);
      if (o?.nx && m.has(k)) return false;
      m.set(k, clone(v));
      if (o?.ex) exp.set(k, Date.now() + o.ex * 1000);
      return true;
    },
    async del(k) {
      m.delete(k);
    },
    async getdel<T>(k: string) {
      live(k);
      const v = m.has(k) ? clone(m.get(k)) : null;
      m.delete(k);
      return v as T | null;
    },
    async incr(k) {
      const n = ((m.get(k) as number) ?? 0) + 1;
      m.set(k, n);
      return n;
    },
    async hset(k, f, v) {
      const h = hash(k);
      h.set(f, clone(v));
      m.set(k, h);
    },
    async hsetMany(k, values) {
      const h = hash(k);
      for (const [f, v] of Object.entries(values)) h.set(f, clone(v));
      m.set(k, h);
    },
    async hget<T>(k: string, f: string) {
      const v = hash(k).get(f);
      return (v === undefined ? null : clone(v)) as T | null;
    },
    async hgetall<T>(k: string) {
      return Object.fromEntries([...hash(k).entries()].map(([a, b]) => [a, clone(b)])) as Record<string, T>;
    },
    async hdel(k, ...f) {
      const h = hash(k);
      for (const x of f) h.delete(x);
    },
    async sadd(k, x) {
      const s = (m.get(k) as Set<string>) ?? new Set<string>();
      s.add(x);
      m.set(k, s);
    },
    async srem(k, x) {
      ((m.get(k) as Set<string>) ?? new Set()).delete(x);
    },
    async smembers(k) {
      return [...((m.get(k) as Set<string>) ?? [])];
    },
    async zincr(k, x, by) {
      const z = (m.get(k) as Map<string, number>) ?? new Map<string, number>();
      z.set(x, (z.get(x) ?? 0) + by);
      m.set(k, z);
    },
    async zincrMany(k, members) {
      const z = (m.get(k) as Map<string, number>) ?? new Map<string, number>();
      for (const x of members) z.set(x, (z.get(x) ?? 0) + 1);
      m.set(k, z);
    },
    async ztop(k, n) {
      const z = (m.get(k) as Map<string, number>) ?? new Map<string, number>();
      return [...z.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([a]) => a);
    },
  };
}

let instance: DB | undefined;
export function db(): DB {
  if (instance) return instance;
  const configured = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  if (!configured && process.env.NODE_ENV !== "production") instance = memory();
  else instance = upstash();
  return instance;
}
