import { admin, authUser, callGemini, checkAndIncrement, corsHeaders, json } from "../_shared/usage.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await authUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { jd } = await req.json();
    if (!jd || jd.length < 30) return json({ error: "JD too short" }, 400);

    const gate = await checkAndIncrement(user.id, "usage_interview");
    if (!gate.ok) return json({ error: gate.message }, gate.status);

    const prompt = `You are a senior recruiter creating a phone-screening sheet for the role described below. Output clean Markdown with this exact structure:

# Phone Screen Sheet — <role name>

## Candidate Details
- Name:
- Phone:
- Email:
- Current company:
- Current role:
- Years of experience:
- Notice period:
- Current CTC:
- Expected CTC:
- Location / willing to relocate:
- Reason for change:

## Screening Questions (role-specific)
Generate 10–12 phone-screen questions that are specific to the role, skills, and seniority in the JD. Mix background, motivation, technical depth, and situational questions. Number them.

## Recruiter Notes
Leave space for notes and a final recommendation (Proceed / Hold / Reject).

Job Description:
${jd}`;

    const questions = await callGemini(prompt);

    await admin().from("interview_history").insert({
      user_id: user.id,
      jd_input: jd,
      questions,
    });

    return json({ questions });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});