import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { extractJson, normalizeRecipe } from "@/lib/normalize";
import { extractSteps, openRouterConfigured, openRouterModel, UpstreamError } from "@/lib/openrouter";
import type { StatusResponse, StepsResponse } from "@/lib/types";

// Vision-modellen hebben soms 20-40 s nodig voor een volle verpakking.
export const maxDuration = 60;

const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 3_000_000; // ~2,2 MB per foto na base64
const MAX_TEXT = 8000;
const DATA_URL = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const json = (body: StepsResponse | StatusResponse, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const needsCode = () => Boolean(process.env.ACCESS_CODE?.trim());

function codeOk(req: Request) {
  const expected = process.env.ACCESS_CODE?.trim();
  if (!expected) return true;
  const given = req.headers.get("x-access-code") ?? "";
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(given.trim()), hash(expected));
}

export function GET() {
  return json({ configured: openRouterConfigured(), needsCode: needsCode(), model: openRouterModel() });
}

export async function POST(req: Request) {
  if (!openRouterConfigured()) {
    return json({ code: "no-key", error: "De AI is nog niet gekoppeld: zet OPENROUTER_API_KEY in de omgevingsvariabelen." }, 503);
  }
  if (!codeOk(req)) return json({ code: "bad-code", error: "De toegangscode klopt niet." }, 401);

  let body: { images?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ code: "bad-input", error: "Ongeldig verzoek." }, 400);
  }
  const images = Array.isArray(body.images) ? body.images : [];
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (images.length > MAX_IMAGES) return json({ code: "bad-input", error: `Maximaal ${MAX_IMAGES} foto's.` }, 400);
  if (!images.every((i): i is string => typeof i === "string" && i.length <= MAX_IMAGE_CHARS && DATA_URL.test(i))) {
    return json({ code: "bad-input", error: "Een van de foto's kan niet gelezen worden. Probeer een JPG of PNG." }, 400);
  }
  if (!images.length && !text) return json({ code: "bad-input", error: "Voeg een foto of tekst toe." }, 400);

  try {
    const raw = extractJson(await extractSteps(images, text, AbortSignal.any([req.signal, AbortSignal.timeout(55_000)])));
    const recipe = normalizeRecipe(raw, randomUUID(), Date.now());
    if (!recipe.steps.length) {
      const problem = typeof (raw as { problem?: unknown }).problem === "string" ? (raw as { problem: string }).problem : "";
      return json({ code: "no-steps", error: problem || "Ik kon geen bereidingsinstructies vinden. Probeer een scherpere foto." }, 422);
    }
    return json({ recipe });
  } catch (err) {
    if (err instanceof UpstreamError) {
      console.error("OpenRouter", err.status, err.message);
      const error =
        err.status === 401 ? "De OpenRouter-key is ongeldig." :
        err.status === 402 ? "Het OpenRouter-tegoed is op." :
        err.status === 429 ? "Even te veel verzoeken. Probeer het over een minuut opnieuw." :
        "De AI gaf een fout. Probeer het nog eens.";
      return json({ code: "upstream", error }, 502);
    }
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return json({ code: "upstream", error: "Dat duurde te lang. Probeer het nog eens, of met één foto." }, 504);
    }
    console.error("steps", err);
    // fetch() gooit een TypeError als OpenRouter niet bereikbaar is; de rest is een onleesbaar antwoord.
    const error = err instanceof TypeError ? "De AI is even niet bereikbaar. Probeer het zo nog eens." : "Het antwoord van de AI was onleesbaar. Probeer het nog eens.";
    return json({ code: "upstream", error }, 502);
  }
}
