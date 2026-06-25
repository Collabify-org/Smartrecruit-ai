// AI Mock Service Layer.
// Pending API Configuration: when GROQ_API_KEY (or other provider) is provisioned,
// swap these mocks with edge-function calls. The interface stays stable.

export type HiringRisk = { title: string; severity: "low" | "medium" | "high"; note: string };
export type InterviewQ = { question: string; type: "behavioral" | "technical" | "situational" };
export type SalaryBand = { currency: string; min: number; max: number; median: number; source: string };
export type SourcingPlatform = { name: string; reason: string };

export type HiringInsights = {
  interviewQuestions: InterviewQ[];
  risks: HiringRisk[];
  salary: SalaryBand;
  sourcingPlatforms: SourcingPlatform[];
  pendingApiConfiguration: boolean;
};

const SOURCING_DEFAULTS: SourcingPlatform[] = [
  { name: "LinkedIn Recruiter", reason: "Largest active candidate pool" },
  { name: "Naukri", reason: "Strong India coverage" },
  { name: "GitHub", reason: "Best for engineering talent" },
  { name: "AngelList / Wellfound", reason: "Startup-friendly candidates" },
  { name: "Hirist", reason: "India tech mid-senior pool" },
];

function salaryFor(role: string, country = "India"): SalaryBand {
  const r = role.toLowerCase();
  const isSenior = /senior|lead|manager|head|principal/.test(r);
  const isEng = /engineer|developer|architect|sre|devops/.test(r);
  const isData = /data|ml|ai|scientist/.test(r);
  let base = 800000;
  if (isEng) base = 1500000;
  if (isData) base = 1800000;
  if (isSenior) base *= 1.8;
  if (country === "USA") return { currency: "USD", min: Math.round(base / 65 * 0.8), max: Math.round(base / 65 * 1.4), median: Math.round(base / 65), source: "Synlumex AI estimate" };
  return { currency: "INR", min: Math.round(base * 0.8), max: Math.round(base * 1.4), median: Math.round(base), source: "Synlumex AI estimate" };
}

export async function generateHiringInsights(args: {
  role: string;
  industry?: string;
  experience?: string;
  skills?: string[];
  country?: string;
}): Promise<HiringInsights> {
  // Simulated latency to feel like real AI
  await new Promise((r) => setTimeout(r, 600));
  const role = args.role || "Role";

  const interviewQuestions: InterviewQ[] = [
    { question: `Walk me through your most impactful project as a ${role}.`, type: "behavioral" },
    { question: `How do you prioritise when stakeholders give you conflicting requirements?`, type: "situational" },
    { question: `What metrics do you track to measure success in a ${role} role?`, type: "behavioral" },
    { question: `Describe a technical/process challenge you solved in the last 6 months.`, type: "technical" },
    { question: `How would you ramp up in the first 30/60/90 days?`, type: "situational" },
  ];

  const risks: HiringRisk[] = [
    { title: "Skill scarcity", severity: "medium", note: `${role} talent with ${args.experience || "the required experience"} is competitive in the current market.` },
    { title: "Salary mismatch", severity: "medium", note: "Benchmark against the salary band before extending offers." },
    { title: "Offer-to-join drop", severity: "low", note: "Keep candidate engagement high during notice period." },
  ];
  if (args.industry === "Artificial Intelligence" || args.industry === "FinTech") {
    risks.unshift({ title: "Counter-offer risk", severity: "high", note: `${args.industry} talent often receives multiple offers — move fast.` });
  }

  return {
    interviewQuestions,
    risks,
    salary: salaryFor(role, args.country),
    sourcingPlatforms: SOURCING_DEFAULTS,
    pendingApiConfiguration: true,
  };
}

// Identify role/industry/experience/skills from an uploaded JD text — local heuristic.
export async function identifyFromJD(text: string): Promise<{
  role?: string;
  industry?: string;
  experience?: string;
  skills: string[];
  pendingApiConfiguration: boolean;
}> {
  await new Promise((r) => setTimeout(r, 300));
  const first = text.split("\n").find((l) => l.trim().length > 4 && l.trim().length < 80);
  const expMatch = text.match(/(\d+\s*(?:-|to)\s*\d+\s*(?:years?|yrs?))/i);
  const known = ["React", "Node.js", "Python", "Java", "SQL", "AWS", "Docker", "Kubernetes", "TypeScript", "GraphQL", "Salesforce", "HubSpot", "Figma", "Tableau"];
  const skills = known.filter((s) => new RegExp(`\\b${s.replace(".", "\\.")}\\b`, "i").test(text));
  return {
    role: first?.trim(),
    experience: expMatch?.[1],
    skills,
    pendingApiConfiguration: true,
  };
}