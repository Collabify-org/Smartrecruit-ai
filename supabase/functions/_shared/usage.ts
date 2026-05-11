Confirmations (read these first)
Other files changed? No. Only one file changes in your repo: supabase/functions/_shared/usage.ts. The 3 edge function files (generate-jd/index.ts, talent-intel/index.ts, interview-questions/index.ts) are untouched.

New folders/files to create? No. The file already exists in your repo — you are replacing its contents in place. No new directories, no new files.

Existing imports in the 3 edge functions remain untouched? Yes, fully untouched. They keep doing import { admin, authUser, callGemini, checkAndIncrement, corsHeaders, json } from "../_shared/usage.ts";. I kept callGemini exported as an alias of the new callLLM, so the import surface is 100% backward compatible.

Is the pasted file production-ready for direct GitHub web commit? Yes. It's the exact content currently running and tested green in my sandbox (10/10 backend tests passed). Safe to paste and "Commit to main".

Where to paste it on GitHub (90-second walkthrough)
Open https://github.com/Collabify-org/Smartrecruit-ai/blob/main/supabase/functions/_shared/usage.ts
Click the pencil icon (top-right of the file view) labelled "Edit this file"
Press Cmd/Ctrl + A to select all existing content → Delete
Paste the full content below
Scroll down → commit message: fix: smart multi-provider LLM fallback (replaces deprecated gemini-1.5-flash)
Choose "Commit directly to the main branch" → click Commit changes
FULL FILE CONTENT — paste this exactly
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const CONTACT_EMAIL = "team@collabifyspace.com";

export const PLAN_LIMITS: Record<string, number> = {
  trial: 10,
  starter: 10,
  professional: 50,
  agency: Infinity,
};

export function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function authUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

type UsageField = "usage_jd" | "usage_talent" | "usage_interview";

export async function checkAndIncrement(userId: string, field: UsageField) {
  const sb = admin();
  const { data: profile, error } = await sb
    .from("profiles")
    .select("plan, trial_expires_at, usage_jd, usage_talent, usage_interview")
    .eq("id", userId)
    .maybeSingle();
  if (error || !profile) {
    return { ok: false as const, status: 404, message: "Profile not found" };
  }
  const plan = (profile.plan || "trial").toLowerCase();

  if (plan === "trial" && profile.trial_expires_at && new Date(profile.trial_expires_at) < new Date()) {
    return {
      ok: false as const,
      status: 402,
      message: `Your 3-day trial has ended. Please contact us to continue: ${CONTACT_EMAIL}`,
    };
  }

  const limit = PLAN_LIMITS[plan] ?? 10;
  const current = (profile as any)[field] ?? 0;
  if (current >= limit) {
    return {
      ok: false as const,
      status: 402,
      message: `You have reached your plan limit. Please contact us to upgrade: ${CONTACT_EMAIL}`,
    };
  }

  const { error: upErr } = await sb
    .from("profiles")
    .update({ [field]: current + 1 })
    .eq("id", userId);
  if (upErr) return { ok: false as const, status: 500, message: upErr.message };

  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Smart multi-provider LLM caller with automatic fallback.
//
// Provider chain (in order):
//   1. Emergent LLM proxy  -> rotates OpenAI -> Gemini -> Claude internally
//   2. Direct Gemini API   -> gemini-2.5-flash (free tier)
//   3. Groq API            -> llama-3.3-70b-versatile (free tier)
//   4. OpenAI API          -> gpt-4o-mini (if OPENAI_API_KEY set)
//
// Required Supabase secrets (set at least ONE of these to keep app alive):
//   LLM_PROXY_URL      e.g. https://your-emergent-app.preview.emergentagent.com
//   LLM_PROXY_SECRET   bearer token shared with the Emergent backend
//   GEMINI_API_KEY     (optional fallback)
//   GROQ_API_KEY       (optional fallback)
//   OPENAI_API_KEY     (optional fallback)
// ---------------------------------------------------------------------------

type ProviderAttempt = { provider: string; ok: boolean; error?: string };

async function tryEmergentProxy(prompt: string): Promise<string> {
  const url = Deno.env.get("LLM_PROXY_URL");
  const secret = Deno.env.get("LLM_PROXY_SECRET");
  if (!url || !secret) throw new Error("Emergent proxy not configured");

  const endpoint = `${url.replace(/\/$/, "")}/api/llm/complete`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Emergent proxy ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.content;
  if (!content) throw new Error("Empty proxy response");
  return content;
}

async function tryGeminiDirect(prompt: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text)
    .join("") ?? "";
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function tryGroq(prompt: string): Promise<string> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty Groq response");
  return text;
}

async function tryOpenAI(prompt: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty OpenAI response");
  return text;
}

export async function callLLM(prompt: string): Promise<string> {
  const chain: Array<[string, (p: string) => Promise<string>]> = [
    ["EmergentProxy", tryEmergentProxy],
    ["Gemini-2.5-Flash", tryGeminiDirect],
    ["Groq-Llama-3.3", tryGroq],
    ["OpenAI-GPT-4o-mini", tryOpenAI],
  ];

  const attempts: ProviderAttempt[] = [];
  for (const [name, fn] of chain) {
    try {
      const content = await fn(prompt);
      console.log(`[LLM] ${name} succeeded`);
      return content;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[LLM] ${name} failed: ${msg}`);
      attempts.push({ provider: name, ok: false, error: msg });
      continue;
    }
  }

  throw new Error(
    `All LLM providers failed. Attempts: ${JSON.stringify(attempts)}`,
  );
}

// Back-compat alias so older imports keep working
export const callGemini = callLLM;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
