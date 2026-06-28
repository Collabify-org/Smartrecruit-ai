import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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

    if (!LOVABLE_API_KEY) {
      return json({ suggestions: [], pending: "LOVABLE_API_KEY not configured" });
    }

    const prompt = `User typed: "${q}". Suggest 8-10 real company names that match — include Indian startups, global SaaS companies, Gulf/GCC firms, D2C brands, mid-market enterprises, and not just Fortune 500 / top IT firms. Return ONLY a JSON array of company name strings, no commentary. Example: ["Razorpay","Careem","Notion"]`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a company-name autocomplete engine. Output strictly a JSON array of strings." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn("company-suggest gateway error", r.status, txt);
      if (r.status === 429) return json({ suggestions: [], error: "Rate limited, try again shortly." }, 200);
      if (r.status === 402) return json({ suggestions: [], error: "AI credits exhausted." }, 200);
      return json({ suggestions: [] });
    }

    const d = await r.json();
    const content: string = d.choices?.[0]?.message?.content ?? "";
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