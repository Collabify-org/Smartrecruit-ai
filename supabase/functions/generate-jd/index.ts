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
