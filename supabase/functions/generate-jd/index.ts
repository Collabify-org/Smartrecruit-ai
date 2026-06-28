import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LLM_PROXY_URL = Deno.env.get("LLM_PROXY_URL");
const LLM_PROXY_SECRET = Deno.env.get("LLM_PROXY_SECRET");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

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

// ── LLM providers ─────────────────────────────────────────────────────────────

async function tryEmergent(prompt: string): Promise<string> {
  if (!LLM_PROXY_URL || !LLM_PROXY_SECRET) throw new Error("Proxy not configured");
  const r = await fetch(`${LLM_PROXY_URL.replace(/\/$/, "")}/api/llm/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_PROXY_SECRET}` },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) throw new Error(`proxy ${r.status}`);
  const d = await r.json();
  if (!d.content) throw new Error("empty proxy");
  return d.content;
}

async function tryGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("no gemini key");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5 },
      }),
    },
  );
  if (!r.ok) throw new Error(`gemini ${r.status}`);
  const d = await r.json();
  const t = d.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!t) throw new Error("empty gemini");
  return t;
}

async function tryGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("no groq key");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 4096,
    }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}`);
  const d = await r.json();
  const t = d.choices?.[0]?.message?.content;
  if (!t) throw new Error("empty groq");
  return t;
}

async function tryOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("no openai key");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}`);
  const d = await r.json();
  const t = d.choices?.[0]?.message?.content;
  if (!t) throw new Error("empty openai");
  return t;
}

async function callLLM(prompt: string): Promise<string> {
  const chain: Array<[string, (p: string) => Promise<string>]> = [
    ["EmergentProxy", tryEmergent],
    ["Gemini2.5", tryGemini],
    ["Groq", tryGroq],
    ["OpenAI", tryOpenAI],
  ];
  const errs: string[] = [];
  for (const [name, fn] of chain) {
    try {
      const c = await fn(prompt);
      console.log(`[LLM] ${name} OK`);
      return c;
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      console.warn(`[LLM] ${name} fail: ${m}`);
      errs.push(`${name}:${m}`);
    }
  }
  throw new Error("All LLM providers failed: " + errs.join(" | "));
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildPrompt(params: {
  roleName: string;
  experience: string;
  skills: string;
  companyName: string;
  workMode: string;
  country: string;
  industry: string;
  seniority: string;
  hiringType: string;
  benefits: string;
}): string {
  const { roleName, experience, skills, companyName, workMode, country, industry, seniority, hiringType, benefits } = params;

  const countryInstructions: Record<string, string> = {
    India: "Use Indian hiring market language. Reference CTC-based compensation framing if salary is mentioned. Mention relevant Indian qualifications (BE/BTech/MBA) where appropriate. Reference notice period norms. Do NOT use US-centric benefits language like 401k, PTO, or health premiums.",
    USA: "Use US hiring market language. Reference base salary framing. For contract roles mention W2/1099 where relevant. Use neutral EEO-compliant language. Avoid Indian or GCC-specific terminology.",
    UAE: "Use GCC/Gulf hiring market language. Reference visa sponsorship norms naturally. Use package-based framing. Use project-based hiring language where relevant. Avoid US or India-specific terminology.",
    UK: "Use UK hiring market language. Use British English spelling throughout. Reference right-to-work awareness lightly. Avoid US acronyms and Indian market references.",
    Canada: "Use Canadian hiring market language. Reference provincial norms lightly where relevant. Use neutral inclusive language.",
    Australia: "Use Australian hiring market language. Reference Australian work rights awareness. Use AU spelling. Avoid US or UK-specific terminology.",
    Singapore: "Use Singapore hiring market language. Reference MOM (Ministry of Manpower) norms lightly. Note EP/S-Pass awareness for roles that may attract international candidates.",
  };

  const industryInstructions: Record<string, string> = {
    Technology: "Focus on agile/scrum delivery, sprint planning, stakeholder management, product thinking, engineering collaboration, CI/CD, system design, and technical ownership.",
    "EPC & Construction": "Focus on project execution phases (engineering, procurement, construction), site coordination, HSE compliance, vendor and subcontractor management, commissioning, punch-list clearance, QA/QC, and schedule adherence.",
    Manufacturing: "Focus on production targets, SOP adherence, lean/six sigma principles, shift management, yield optimization, quality metrics, and plant operations.",
    Healthcare: "Focus on patient safety, clinical protocols, regulatory compliance (reference local equivalent of HIPAA), interdisciplinary coordination, and evidence-based practice.",
    Finance: "Focus on regulatory compliance (reference RBI/SEBI for India, SEC for USA, FCA for UK as applicable), risk management, financial reporting, audit readiness, and portfolio or credit management.",
    Retail: "Focus on footfall conversion, visual merchandising, planogram compliance, inventory management, loss prevention, customer experience, and sales targets.",
    Logistics: "Focus on last-mile delivery, warehouse operations, fleet management, SLA adherence, ERP/WMS tools, route optimization, and supply chain coordination.",
    Education: "Focus on curriculum design, pedagogy, student outcomes, accreditation compliance, LMS tools, and parent or institutional stakeholder communication.",
    Energy: "Focus on grid operations, renewable energy systems, SCADA, load dispatch, regulatory compliance, asset maintenance, and energy efficiency targets.",
    "Oil & Gas": "Focus on HSE-critical language, permit-to-work systems, HAZOP/HAZID awareness, offshore/onshore distinction, process safety, and regulatory compliance.",
  };

  const countryNote = countryInstructions[country] ?? "Use professional hiring language appropriate to the local market.";
  const industryNote = industryInstructions[industry] ?? "Use professional language relevant to the industry.";
  const benefitsSection = benefits?.trim()
    ? `BENEFITS:\n• ${benefits.split(",").map((b) => b.trim()).join("\n• ")}`
    : "";

  const companyStyleNote = companyName?.trim()
    ? `COMPANY STYLE — ${companyName}:
Write this Job Description in the style and tone that ${companyName} would use — match their culture, formality level, and typical hiring language. If ${companyName} is a well-known company, mirror their known voice (e.g. Google = clear & ambitious, Stripe = precise & technical, Razorpay = builder-energy & crisp, Zomato = playful & bold, ADNOC = formal & structured). If unknown or a startup, infer style from the company type — startups: casual, bold, mission-driven; enterprises: formal, structured, compliance-aware; D2C/consumer brands: warm, vivid, customer-led. Never name or describe the company in the output — only let the tone reflect it.`
    : "";

  return `You are a senior recruitment consultant writing a job description for a professional hiring platform. Your output must read like it was written by an experienced recruiter — direct, specific, and market-aware. Never sound like an AI assistant.

ABSOLUTE RULES:
- Never write an "About the Company" or "About Us" section. Do not describe the company at all.
- Never invent or assume benefits. ${benefits?.trim() ? "Use only the benefits explicitly provided below." : "Do not include a Benefits section."}
- Never use these phrases: leading provider, global leader, dynamic environment, cutting-edge, world-class, innovative company, fast-paced, passionate team, pioneering, state-of-the-art
- No markdown symbols anywhere: no **, no *, no ##, no --, no __
- Bullets use • only. No nested bullets. No sub-points.
- Section headings in BOLD CAPS followed by a colon (e.g. KEY RESPONSIBILITIES:)
- Maximum 8 bullets per section, minimum 5
- Each bullet starts with an action verb and contains one clear idea, maximum 15 words
- Output plain text only — ready for direct copy-paste or Word export
- Do not add any commentary, preamble, or closing note outside the JD structure

COUNTRY CONTEXT — ${country}:
${countryNote}

INDUSTRY CONTEXT — ${industry}:
${industryNote}

${companyStyleNote}

ROLE INPUT:
Role: ${roleName}
Seniority: ${seniority}
Experience: ${experience || "Not specified"} years
Skills: ${skills || "Not specified"}
Company: ${companyName} (use name only where structurally needed — do NOT describe the company)
Work Mode: ${workMode}
Hiring Type: ${hiringType}
Industry: ${industry}
Country: ${country}

OUTPUT STRUCTURE — follow exactly in this order:

${roleName} (${seniority}) — ${hiringType}

HIRING SNAPSHOT:
- Role: ${roleName}
- Seniority: ${seniority}
- Experience: ${experience || "Not specified"} years
- Industry: ${industry}
- Country: ${country}
- Work Mode: ${workMode}
- Hiring Type: ${hiringType}

ABOUT THE ROLE:
(Write 2–3 lines. Describe what the person will own and do. No company description. No hype.)

KEY RESPONSIBILITIES:
(6–8 bullets. Action-verb start. ${industry}-specific. ${country}-market relevant.)

REQUIREMENTS:
(5–7 bullets. Specific, testable. Include relevant qualifications for ${country} market.)

PREFERRED SKILLS:
(3–5 bullets. Genuinely optional additions. Skip this section entirely if not relevant.)

${benefitsSection}

APPLICATION NOTE:
(1–2 lines. Neutral, professional closing. No hype. No "join our amazing team" language.)`;
}

// ── Post-processing ────────────────────────────────────────────────────────────

function cleanOutput(text: string): string {
  return text
    // Strip hallucinated company description patterns
    .replace(/about\s+(the\s+)?(company|us|organization|${/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")   // remove bold markdown
    .replace(/\*(.*?)\*/g, "$1")        // remove italic markdown
    .replace(/^#{1,4}\s+/gm, "")        // remove heading hashes
    .replace(/^[-–]\s+/gm, "• ")        // normalise dashes to bullet
    .replace(/^\s*\*\s+/gm, "• ")       // normalise * bullets
    .trim();
}

// ── Main handler ───────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Server misconfigured: missing Supabase env" }, 500);
    }

    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    let body: {
      roleName?: string;
      experience?: string | number;
      skills?: string;
      companyName?: string;
      workMode?: string;
      country?: string;
      industry?: string;
      seniority?: string;
      hiringType?: string;
      benefits?: string;
      mode?: string;
      template?: string;
    } = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const {
      roleName,
      experience,
      skills,
      companyName,
      workMode,
      country = "India",
      industry = "Technology",
      seniority = "Mid-level",
      hiringType = "Full-time",
      benefits = "",
    } = body;

    if (!roleName) return json({ error: "roleName is required" }, 400);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profErr) return json({ error: profErr.message }, 500);
    if (!profile) return json({ error: "Profile not found" }, 404);

    if ((profile.usage_jd ?? 0) >= (profile.jd_limit ?? 5)) {
      return json({ error: "Monthly JD limit reached. Please upgrade your plan." }, 403);
    }

    const prompt = buildPrompt({
      roleName: roleName ?? "",
      experience: String(experience ?? ""),
      skills: skills ?? "",
      companyName: companyName ?? "",
      workMode: workMode ?? "Remote",
      country,
      industry,
      seniority,
      hiringType,
      benefits,
    });

    const raw = await callLLM(prompt);
    const generatedText = cleanOutput(raw);

    await supabase
      .from("profiles")
      .update({ usage_jd: (profile.usage_jd ?? 0) + 1 })
      .eq("id", user.id);

    await supabase.from("jd_history").insert({
      user_id: user.id,
      role_name: roleName ?? "",
      company_name: companyName ?? "",
      output: generatedText,
    });

    return json({ jd: generatedText });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    console.error("generate-jd error:", m);
    return json({ error: m }, 500);
  }
});
