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

export async function callGemini(prompt: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Gemini error", res.status, t);
    throw new Error(`Gemini API error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}