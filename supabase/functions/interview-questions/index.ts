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
