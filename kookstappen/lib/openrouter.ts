import { extractJson } from "./normalize";
import { RECIPE_SCHEMA, SYSTEM_PROMPT } from "./prompt";

// OpenRouter chat completions (OpenAI-compatibel). Docs: https://openrouter.ai/docs/api-reference/chat-completion

// OPENROUTER_BASE_URL alleen aanpassen voor tests of een proxy.
const endpoint = () => `${process.env.OPENROUTER_BASE_URL?.replace(/\/$/, "") || "https://openrouter.ai/api/v1"}/chat/completions`;
export const DEFAULT_MODEL = "google/gemini-3.8-flash";

export const openRouterModel = () => process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
// "low" houdt het snel en goedkoop; zet op "medium"/"high" als de stappen te slordig worden, of "none" om uit te zetten.
const reasoningEffort = () => process.env.OPENROUTER_REASONING?.trim() || "low";

export const openRouterConfigured = () => Boolean(process.env.OPENROUTER_API_KEY?.trim());

export class UpstreamError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type Content = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

async function call(content: Content[], structured: boolean, signal: AbortSignal) {
  const res = await fetch(endpoint(), {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!.trim()}`,
      "Content-Type": "application/json",
      // Optioneel bij OpenRouter: laat de app herkenbaar zijn in je dashboard.
      "HTTP-Referer": process.env.SITE_URL || "https://kookstappen.vercel.app",
      "X-Title": "Kookstappen",
    },
    body: JSON.stringify({
      model: openRouterModel(),
      temperature: 0.2,
      max_tokens: 5000,
      usage: { include: true },
      reasoning: reasoningEffort() === "none" ? { enabled: false } : { effort: reasoningEffort(), exclude: true },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      ...(structured && {
        response_format: { type: "json_schema", json_schema: { name: "kookstappen", strict: true, schema: RECIPE_SCHEMA } },
        // Alleen providers die het schema echt afdwingen.
        provider: { require_parameters: true },
      }),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new UpstreamError(body.slice(0, 500) || res.statusText, res.status);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
    error?: { message?: string };
    usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number; completion_tokens_details?: { reasoning_tokens?: number } };
  };
  if (data.usage) {
    const u = data.usage;
    console.info(`OpenRouter ${openRouterModel()}: ${u.prompt_tokens} in, ${u.completion_tokens} uit (${u.completion_tokens_details?.reasoning_tokens ?? 0} reasoning), $${u.cost ?? "?"}`);
  }
  if (data.error) throw new UpstreamError(data.error.message ?? "Onbekende fout", 502);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new UpstreamError("Leeg antwoord van het model", 502);
  return text;
}

/** Stuurt foto's en/of tekst naar het model en geeft het geparste JSON-object terug. */
export async function extractSteps(images: string[], text: string, signal: AbortSignal): Promise<unknown> {
  const content: Content[] = [
    {
      type: "text",
      text: text
        ? `Zet deze bereidingsinstructies om in losse handelingen:\n\n${text}`
        : "Zet de bereidingsinstructies op deze foto('s) om in losse handelingen.",
    },
    ...images.map((url): Content => ({ type: "image_url", image_url: { url } })),
  ];
  let structured = true;
  for (let attempt = 1; ; attempt++) {
    let reply: string;
    try {
      reply = await call(content, structured, signal);
    } catch (err) {
      // Model/provider zonder json_schema-ondersteuning: opnieuw zonder (de prompt vraagt ook om JSON).
      if (structured && err instanceof UpstreamError && (err.status === 400 || err.status === 404)) {
        structured = false;
        continue;
      }
      throw err;
    }
    try {
      return extractJson(reply);
    } catch (err) {
      // Soms levert een model kapotte JSON; één keer opnieuw proberen lost dat meestal op.
      if (attempt >= 2) throw err;
      console.warn("Onleesbare JSON van model, opnieuw proberen:", (err as Error).message);
    }
  }
}
