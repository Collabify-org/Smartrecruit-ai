supabase/functions/_shared/usage.ts
// supabase/functions/_shared/usage.ts
// Shared utilities for SmartRecruit AI Edge Functions

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ---------- CORS ----------
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ---------- Supabase admin client ----------
export function admin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------- Auth helper ----------
export async function authUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { user: null, error: "Missing Authorization bearer token" };
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null, error: error?.message ?? "Invalid auth token" };
  }
  return { user: data.user, error: null };
}

// ---------- Usage tracking ----------
type UsageColumn = "usage_jd" | "usage_interview" | "usage_talent";

const PLAN_LIMITS: Record<string, Record<UsageColumn, number>> = {
  free: { usage_jd: 5, usage_interview: 5, usage_talent: 3 },
  pro: { usage_jd: 200, usage_interview: 200, usage_talent: 100 },
  enterprise: {
    usage_jd: Number.MAX_SAFE_INTEGER,
    usage_interview: Number.MAX_SAFE_INTEGER,
    usage_talent: Number.MAX_SAFE_INTEGER,
  },
};

export async function checkAndIncrement(
  userId: string,
  column: UsageColumn,
): Promise<{ ok: boolean; remaining: number; error?: string }> {
  const db = admin();

  const { data: profile, error: profileErr } = await db
    .from("profiles")
    .select(`plan, ${column}`)
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    return { ok: false, remaining: 0, error: profileErr.message };
  }

  const plan = (profile?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const limit = PLAN_LIMITS[plan]?.[column] ?? PLAN_LIMITS.free[column];
  const current = Number((profile as Record<string, unknown> | null)?.[column] ?? 0);

  if (current >= limit) {
    return { ok: false, remaining: 0, error: "Usage limit reached for your plan" };
  }

  const next = current + 1;
  const { error: updErr } = await db
    .from("profiles")
    .update({ [column]: next })
    .eq("id", userId);

  if (updErr) {
    return { ok: false, remaining: limit - current, error: updErr.message };
  }

  return { ok: true, remaining: Math.max(limit - next, 0) };
}

// ---------- LLM call chain ----------
export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallLLMOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

function buildPrompt(messages: LLMMessage[]): string {
  return messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
}

async function callEmergent(opts: CallLLMOptions): Promise<string> {
  const url = Deno.env.get("LLM_PROXY_URL");
  const secret = Deno.env.get("LLM_PROXY_SECRET");
  if (!url || !secret) throw new Error("emergent_proxy_disabled");

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1500,
      json: !!opts.jsonMode,
    }),
  });
  if (!res.ok) throw new Error(`emergent_proxy_${res.status}`);
  const data = await res.json();
  const text = data?.text ?? data?.content ?? data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("emergent_proxy_empty");
  return text;
}

async function callGemini(opts: CallLLMOptions): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("gemini_disabled");

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: buildPrompt(opts.messages) }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 1500,
      ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) throw new Error(`gemini_${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("gemini_empty");
  return text;
}

async function callGroq(opts: CallLLMOptions): Promise<string> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("groq_disabled");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1500,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`groq_${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("groq_empty");
  return text;
}

async function callOpenAI(opts: CallLLMOptions): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("openai_disabled");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1500,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`openai_${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("openai_empty");
  return text;
}

export async function callLLM(opts: CallLLMOptions): Promise<string> {
  const errors: string[] = [];
  const chain = [
    { name: "emergent", fn: callEmergent },
    { name: "gemini", fn: callGemini },
    { name: "groq", fn: callGroq },
    { name: "openai", fn: callOpenAI },
  ];

  for (const provider of chain) {
    try {
      const out = await provider.fn(opts);
      if (out && out.trim()) return out.trim();
    } catch (e) {
      errors.push(`${provider.name}: ${(e as Error).message}`);
    }
  }
  throw new Error(`All LLM providers failed -> ${errors.join(" | ")}`);
}

// ---------- JSON helpers ----------
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

export function extractJSON<T = unknown>(raw: string): T {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    }
    throw new Error("LLM did not return valid JSON");
  }
}
supabase/functions/generate-jd/index.ts
// supabase/functions/generate-jd/index.ts
import {
  authUser,
  callLLM,
  checkAndIncrement,
  corsHeaders,
  jsonResponse,
} from "../_shared/usage.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { user, error: authErr } = await authUser(req);
    if (!user) return jsonResponse({ error: authErr ?? "Unauthorized" }, 401);

    let payload: {
      title?: string;
      company?: string;
      seniority?: string;
      skills?: string[];
      location?: string;
      employmentType?: string;
      notes?: string;
    } = {};
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!payload.title || typeof payload.title !== "string") {
      return jsonResponse({ error: "Field 'title' is required" }, 400);
    }

    const usage = await checkAndIncrement(user.id, "usage_jd");
    if (!usage.ok) {
      return jsonResponse({ error: usage.error ?? "Usage limit reached" }, 403);
    }

    const system =
      "You are an expert technical recruiter. Write a clear, structured, inclusive Job Description in Markdown. " +
      "Include: Role Summary, Responsibilities, Required Qualifications, Nice-to-haves, Compensation & Benefits, About the Company. " +
      "Avoid biased language. Keep it concise and scannable.";

    const userPrompt = `Create a Job Description for:
Title: ${payload.title}
Company: ${payload.company ?? "N/A"}
Seniority: ${payload.seniority ?? "N/A"}
Location: ${payload.location ?? "Remote"}
Employment Type: ${payload.employmentType ?? "Full-time"}
Skills: ${(payload.skills ?? []).join(", ") || "N/A"}
Additional notes: ${payload.notes ?? "None"}`;

    const jd = await callLLM({
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      maxTokens: 1800,
    });

    return jsonResponse({ jd, remaining: usage.remaining });
  } catch (e) {
    console.error("generate-jd error:", e);
    return jsonResponse({ error: (e as Error).message ?? "Internal error" }, 500);
  }
});
supabase/functions/interview-questions/index.ts
// supabase/functions/interview-questions/index.ts
import {
  authUser,
  callLLM,
  checkAndIncrement,
  corsHeaders,
  extractJSON,
  jsonResponse,
} from "../_shared/usage.ts";

interface InterviewPayload {
  role?: string;
  seniority?: string;
  skills?: string[];
  count?: number;
  focus?: string;
}

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  ideal_answer: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { user, error: authErr } = await authUser(req);
    if (!user) return jsonResponse({ error: authErr ?? "Unauthorized" }, 401);

    let payload: InterviewPayload = {};
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!payload.role) {
      return jsonResponse({ error: "Field 'role' is required" }, 400);
    }

    const count = Math.min(Math.max(payload.count ?? 8, 1), 20);

    const usage = await checkAndIncrement(user.id, "usage_interview");
    if (!usage.ok) {
      return jsonResponse({ error: usage.error ?? "Usage limit reached" }, 403);
    }

    const system =
      "You are a senior interviewer. Return ONLY valid minified JSON. No markdown, no commentary.";

    const userPrompt = `Generate ${count} interview questions for:
Role: ${payload.role}
Seniority: ${payload.seniority ?? "Mid"}
Skills: ${(payload.skills ?? []).join(", ") || "general"}
Focus: ${payload.focus ?? "balanced (technical + behavioral)"}

Return JSON exactly in this shape:
{
  "questions": [
    {
      "question": "string",
      "category": "technical|behavioral|system-design|culture",
      "difficulty": "easy|medium|hard",
      "ideal_answer": "string (2-4 sentences)"
    }
  ]
}`;

    const raw = await callLLM({
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      maxTokens: 2200,
      jsonMode: true,
    });

    const parsed = extractJSON<{ questions: InterviewQuestion[] }>(raw);
    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      return jsonResponse({ error: "LLM returned malformed payload" }, 502);
    }

    return jsonResponse({ questions: parsed.questions, remaining: usage.remaining });
  } catch (e) {
    console.error("interview-questions error:", e);
    return jsonResponse({ error: (e as Error).message ?? "Internal error" }, 500);
  }
});
supabase/functions/talent-intel/index.ts
// supabase/functions/talent-intel/index.ts
import {
  authUser,
  callLLM,
  checkAndIncrement,
  corsHeaders,
  extractJSON,
  jsonResponse,
} from "../_shared/usage.ts";

interface TalentPayload {
  role?: string;
  location?: string;
  skills?: string[];
  industry?: string;
  seniority?: string;
}

interface TalentReport {
  market_summary: string;
  salary_range: { currency: string; min: number; max: number; median: number };
  demand_score: number;
  top_skills: string[];
  top_locations: string[];
  competitors: string[];
  hiring_tips: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { user, error: authErr } = await authUser(req);
    if (!user) return jsonResponse({ error: authErr ?? "Unauthorized" }, 401);

    let payload: TalentPayload = {};
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!payload.role) {
      return jsonResponse({ error: "Field 'role' is required" }, 400);
    }

    const usage = await checkAndIncrement(user.id, "usage_talent");
    if (!usage.ok) {
      return jsonResponse({ error: usage.error ?? "Usage limit reached" }, 403);
    }

    const system =
      "You are a talent market analyst. Return ONLY valid minified JSON. No markdown, no commentary.";

    const userPrompt = `Build a talent intelligence report for:
Role: ${payload.role}
Seniority: ${payload.seniority ?? "Mid"}
Location: ${payload.location ?? "Global"}
Industry: ${payload.industry ?? "Tech"}
Skills: ${(payload.skills ?? []).join(", ") || "general"}

Return JSON exactly in this shape:
{
  "market_summary": "string (3-5 sentences)",
  "salary_range": { "currency": "USD", "min": 0, "max": 0, "median": 0 },
  "demand_score": 0,
  "top_skills": ["string"],
  "top_locations": ["string"],
  "competitors": ["string"],
  "hiring_tips": ["string"]
}
demand_score is an integer 0-100.`;

    const raw = await callLLM({
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      maxTokens: 1800,
      jsonMode: true,
    });

    const parsed = extractJSON<TalentReport>(raw);
    if (!parsed?.market_summary) {
      return jsonResponse({ error: "LLM returned malformed payload" }, 502);
    }

    return jsonResponse({ report: parsed, remaining: usage.remaining });
  } catch (e) {
    console.error("talent-intel error:", e);
    return jsonResponse({ error: (e as Error).message ?? "Internal error" }, 500);
  }
});
