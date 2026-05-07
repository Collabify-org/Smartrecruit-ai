import { admin, authUser, callGemini, checkAndIncrement, corsHeaders, json } from "../_shared/usage.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await authUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { jd } = await req.json();
    if (!jd || jd.length < 30) return json({ error: "JD too short" }, 400);

    const gate = await checkAndIncrement(user.id, "usage_talent");
    if (!gate.ok) return json({ error: gate.message }, gate.status);

    const prompt = `You are a senior talent-intelligence analyst. Analyse the job description below and respond with a Markdown report containing exactly these sections:

## Sourcing Keywords
- LinkedIn search keywords
- Job board keywords
- Alternative job titles
- A ready-to-paste Boolean search string

## Sourcing Platforms
Best platforms to source this talent (LinkedIn, GitHub, Stack Overflow, niche communities, etc.) with one line each on why.

## Salary Benchmarks
Entry, Mid, Senior bands in INR and USD with realistic ranges.

## Sourcing Companies
- Top companies producing this talent
- Direct competitor companies to target
- Startup ecosystem
- Service companies

## Hiring Strategy
Channels, fastest sourcing method, referral idea, remote vs local advice.

Job Description:
${jd}`;

    const results = await callGemini(prompt);

    await admin().from("talent_history").insert({
      user_id: user.id,
      jd_input: jd,
      results,
    });

    return json({ results });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});