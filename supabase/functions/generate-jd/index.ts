import { admin, authUser, callGemini, checkAndIncrement, corsHeaders, json } from "../_shared/usage.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const user = await authUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { role, experience, skills, company, workMode, mode, template } = await req.json();
    if (!role || !company) return json({ error: "Role and company required" }, 400);

    const gate = await checkAndIncrement(user.id, "usage_jd");
    if (!gate.ok) return json({ error: gate.message }, gate.status);

    const prompt = mode === "template" && template
      ? `You are an expert recruiter. Using the company template below, produce a complete, polished job description for a ${role} at ${company}. Replace all placeholders ({role}, {company}, {experience}, {skills}, {workMode}) with the provided values. Keep the original tone and structure of the template.

Template:
${template}

Values:
- Role: ${role}
- Experience: ${experience || "Not specified"}
- Skills: ${skills || "Not specified"}
- Company: ${company}
- Work mode: ${workMode || "Remote"}`
      : `You are an expert recruiter. Write a complete, professional job description in clean Markdown for the following role. Use these sections in order: About the role, Key responsibilities, Required qualifications, Preferred qualifications, What we offer, How to apply.

- Role: ${role}
- Company: ${company}
- Experience: ${experience || "Not specified"}
- Skills: ${skills || "Not specified"}
- Work mode: ${workMode || "Remote"}

Be specific, role-tailored, and ATS-friendly.`;

    const content = await callGemini(prompt);

    await admin().from("jd_history").insert({
      user_id: user.id,
      role_name: role,
      mode: mode || "smartrecruit",
      content,
    });

    return json({ content });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});