import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { query } = await req.json().catch(() => ({ query: "" }));
    const q = String(query || "").trim();
    if (q.length < 2) return json({ suggestions: [] });

    if (!GEMINI_API_KEY) {
      return json({ suggestions: [], pending: "GEMINI_API_KEY not configured" });
    }

    const prompt = `Give me 10 company names that start with "${q}". Include Indian startups, Indian enterprises, global SaaS, Gulf/GCC firms, D2C brands. No big-brand bias. Return only a valid JSON array of strings, nothing else.`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      },
    );

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn("company-suggest gemini error", r.status, txt);
      if (r.status === 429) return json({ suggestions: [], error: "Rate limited, try again shortly." }, 200);
      return json({ suggestions: [] });
    }

    const d = await r.json();
    const content: string = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = content.match(/\[[\s\S]*\]/);
    let names: string[] = [];
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          names = parsed
            .map((x) => (typeof x === "string" ? x : x?.name))
            .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
            .slice(0, 10);
        }
      } catch { /* ignore parse errors */ }
    }

    return json({ suggestions: names });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    console.error("company-suggest error", m);
    return json({ suggestions: [], error: m }, 200);
  }
});