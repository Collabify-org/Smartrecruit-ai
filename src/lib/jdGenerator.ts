export interface JDInput {
  role: string;
  experience: string;
  skills: string;
  company: string;
  workMode: string;
}

export function generateSmartRecruitJD(i: JDInput): string {
  const skills = i.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const expNum = parseInt(i.experience) || 0;
  const seniority = expNum >= 8 ? "Senior" : expNum >= 4 ? "Mid-level" : "Junior";

  return `# ${i.role}

**Company:** ${i.company}
**Experience:** ${i.experience} years (${seniority})
**Work Mode:** ${i.workMode}

## About the Role
${i.company} is hiring a ${i.role} to join our growing team. You will play a critical role in shaping our product, working alongside a team of passionate engineers, designers, and operators. This is a ${i.workMode.toLowerCase()} opportunity for someone who thrives in fast-paced, high-impact environments.

## Key Responsibilities
- Lead the design, development, and delivery of high-quality work as a ${i.role}.
- Collaborate cross-functionally with product, design, and engineering teams.
- Drive best practices, mentor team members, and contribute to technical decisions.
- Own end-to-end execution from ideation to deployment.
- Continuously improve processes, performance, and team velocity.

## Required Skills & Qualifications
- ${i.experience}+ years of relevant experience as a ${i.role} or in a related role.
- Strong proficiency in: ${skills.join(", ") || "relevant technologies"}.
- Proven track record of shipping production-grade work.
- Excellent communication and collaboration skills.
- Bachelor's degree or equivalent practical experience.

## Nice to Have
- Experience working in startup or high-growth environments.
- Open-source contributions or thought leadership in the space.
- Familiarity with modern development workflows and tooling.

## What We Offer
- Competitive compensation and meaningful equity.
- ${i.workMode} work culture with flexible hours.
- Health, wellness, and learning & development budgets.
- A team that values craft, ownership, and impact.

## How to Apply
Send your resume and a brief note about why this role excites you to careers@${i.company.toLowerCase().replace(/\s+/g, "")}.com.
`;
}

export function fillTemplate(template: string, i: JDInput): string {
  const skills = i.skills.split(",").map((s) => s.trim()).filter(Boolean).join(", ");
  return template
    .replace(/\{\{?\s*role\s*\}?\}/gi, i.role)
    .replace(/\{\{?\s*company\s*\}?\}/gi, i.company)
    .replace(/\{\{?\s*experience\s*\}?\}/gi, i.experience)
    .replace(/\{\{?\s*skills\s*\}?\}/gi, skills)
    .replace(/\{\{?\s*work[_\s]?mode\s*\}?\}/gi, i.workMode)
    .concat(
      `\n\n---\nRole: ${i.role}\nCompany: ${i.company}\nExperience: ${i.experience} years\nSkills: ${skills}\nWork Mode: ${i.workMode}\n`
    );
}