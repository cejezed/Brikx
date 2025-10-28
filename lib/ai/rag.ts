// lib/ai/rag.ts
import OpenAI from "openai";

const client =
  process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

type RagOptions = {
  allow_vector_search?: boolean; // gate op basis van keywords/premium
  top_k?: number;
  timeout_ms?: number;
};

/**
 * queryRag
 * - Wanneer allow_vector_search=false → geef lege context terug.
 * - Probeert eerst een eigen RAG endpoint (NEXT_PUBLIC_BRIX_RAG_URL).
 * - Valt terug op OpenAI "mini-samenvatting" als geen endpoint of error.
 */
export async function queryRag(
  query: string,
  allow_vector_search: boolean = true,
  opts: RagOptions = {}
): Promise<string> {
  const { top_k = 5, timeout_ms = 6000 } = opts;

  if (!allow_vector_search) return ""; // gated: geen context injecteren

  // 1) Probeer eigen RAG-service
  const url = process.env.NEXT_PUBLIC_BRIX_RAG_URL;
  if (url) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout_ms);

      const res = await fetch(`${url}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k }),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (res.ok) {
        const data = await res.json();
        const texts = (data?.matches ?? [])
          .map((m: any) => m.text)
          .filter((t: any) => typeof t === "string" && t.trim().length > 0);

        if (texts.length) return texts.join("\n---\n");
      }
    } catch {
      /* val terug */
    }
  }

  // 2) Fallback: mini-samenvatting via OpenAI (alleen als key aanwezig)
  if (client) {
    try {
      const c = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Vat de 3-5 belangrijkste aandachtspunten samen in korte bullet points, zonder cijfers of garanties.",
          },
          { role: "user", content: query },
        ],
        temperature: 0.2,
      });
      return c.choices[0].message?.content ?? "";
    } catch {
      return "";
    }
  }

  return "";
}
