import { RECIPE_SCHEMA, SYSTEM_PROMPT } from "./prompt";

// OpenRouter chat completions (OpenAI-compatibel). Docs: https://openrouter.ai/docs/api-reference/chat-completion

// OPENROUTER_BASE_URL alleen aanpassen voor tests of een proxy.
const endpoint = () => `${process.env.OPENROUTER_BASE_URL?.replace(/\/$/, "") || "https://openrouter.ai/api/v1"}/chat/completions`;
export const DEFAULT_MODEL = "google/gemini-3.8-flash";

export const openRouterModel = () => process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
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
      max_tokens: 6000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      ...(structured && {
        response_format: { type: "json_schema", json_schema: { name: "kookstappen", strict: true, schema: RECIPE_SCHEMA } },
      }),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new UpstreamError(body.slice(0, 500) || res.statusText, res.status);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string | null } }[]; error?: { message?: string } };
  if (data.error) throw new UpstreamError(data.error.message ?? "Onbekende fout", 502);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new UpstreamError("Leeg antwoord van het model", 502);
  return text;
}

/** Stuurt foto's en/of tekst naar het model en geeft de ruwe tekst (JSON) terug. */
export async function extractSteps(images: string[], text: string, signal: AbortSignal) {
  const content: Content[] = [
    {
      type: "text",
      text: text
        ? `Zet deze bereidingsinstructies om in losse handelingen:\n\n${text}`
        : "Zet de bereidingsinstructies op deze foto('s) om in losse handelingen.",
    },
    ...images.map((url): Content => ({ type: "image_url", image_url: { url } })),
  ];
  try {
    return await call(content, true, signal);
  } catch (err) {
    // Niet elk model ondersteunt json_schema; probeer dan zonder (de prompt vraagt ook om JSON).
    if (err instanceof UpstreamError && err.status === 400) return call(content, false, signal);
    throw err;
  }
}
