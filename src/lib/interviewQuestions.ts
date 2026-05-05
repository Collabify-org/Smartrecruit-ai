export interface PhoneScreenSheet {
  role: string;
  markdown: string;
}

function extractRole(jd: string): string {
  const m = jd.match(/(?:role|position|title|hiring(?:\s+for)?)[:\s-]+([A-Za-z0-9 +\-/.,]+)/i);
  if (m) return m[1].trim().split("\n")[0].slice(0, 60);
  const firstLine = jd.split("\n").find((l) => l.trim());
  return firstLine?.replace(/^#+\s*/, "").trim().slice(0, 60) || "Role";
}

type Domain = "engineering" | "data" | "design" | "product" | "marketing" | "sales" | "hr" | "finance" | "ops" | "generic";

function detectDomain(jd: string): Domain {
  const t = jd.toLowerCase();
  if (/(data scien|ml |machine learn|ai engineer|nlp|llm|analytics)/.test(t)) return "data";
  if (/(designer|figma|ui\/ux|product design|visual design)/.test(t)) return "design";
  if (/(product manager|product owner|roadmap|\bpm\b)/.test(t)) return "product";
  if (/(marketing|seo|growth|content|brand|performance marketing)/.test(t)) return "marketing";
  if (/(sales|account exec|bdr|sdr|business development|inside sales)/.test(t)) return "sales";
  if (/(recruit|talent acquisition|\bhr\b|people ops)/.test(t)) return "hr";
  if (/(finance|accountant|controller|fp&a|cfo)/.test(t)) return "finance";
  if (/(operations|ops manager|supply chain|logistics)/.test(t)) return "ops";
  if (/(engineer|developer|backend|frontend|devops|sre|react|node|python|java|kubernetes|aws)/.test(t)) return "engineering";
  return "generic";
}

function extractSkills(jd: string): string[] {
  const skills = [
    "React","Node.js","Python","Java","Go","Kubernetes","AWS","GCP","Azure","Docker","PostgreSQL","MongoDB","Redis",
    "TypeScript","JavaScript","SQL","Spark","Kafka","Airflow","Snowflake","BigQuery","Tableau","PowerBI",
    "Figma","Sketch","Webflow","HubSpot","Salesforce","Marketo","SEO","SEM","Google Ads","Meta Ads",
    "Tailwind","Next.js","Django","FastAPI","GraphQL","REST","CI/CD","Terraform","Jenkins","Linux"
  ];
  const found: string[] = [];
  for (const s of skills) {
    const re = new RegExp(`\\b${s.replace(/[.+]/g, "\\$&")}\\b`, "i");
    if (re.test(jd)) found.push(s);
  }
  return found.slice(0, 6);
}

function extractYears(jd: string): string {
  const m = jd.match(/(\d+)\+?\s*(?:to\s*\d+\s*)?years?/i);
  return m ? `${m[1]}+ years` : "the required";
}

const DOMAIN_QUESTIONS: Record<Domain, (skills: string[], years: string, role: string) => string[]> = {
  engineering: (skills, years, role) => [
    `Walk me through your experience as a ${role}. What was the scale of systems you worked on?`,
    `You mentioned ${years} of experience — describe the most technically complex project you've shipped end-to-end.`,
    skills[0] ? `How comfortable are you with ${skills[0]}? Describe a production issue you debugged using it.` : `Which backend/frontend stack do you consider yourself strongest in, and why?`,
    skills[1] ? `Tell me about a time you used ${skills[1]} to solve a performance or scalability problem.` : `Describe a system design decision you made that you'd do differently today.`,
    `How do you approach code reviews — both giving and receiving feedback?`,
    `Tell me about a production incident you owned. What was the root cause and what did you change to prevent it?`,
    `How do you balance shipping fast vs writing maintainable, well-tested code?`,
    `Describe your experience working with cross-functional teams (Product, Design, QA).`,
    `What's your approach to learning a new framework or language on the job?`,
    `Why are you exploring a change from your current role?`,
  ],
  data: (skills, years, role) => [
    `Tell me about your background as a ${role} and the type of data problems you've worked on.`,
    `Describe an end-to-end ML or analytics project — from problem framing to deployment and impact measurement.`,
    skills[0] ? `How have you used ${skills[0]} in your recent projects?` : `Which ML frameworks or analytics tools are you strongest in?`,
    `How do you handle missing, imbalanced, or messy real-world data?`,
    `Walk me through how you choose between different models for a classification or regression problem.`,
    `Describe a time your model or analysis didn't work in production. What did you learn?`,
    `How do you communicate findings to non-technical stakeholders?`,
    `What's your experience with data pipelines, orchestration, and MLOps?`,
    `Tell me about a metric you helped define or improve and the business impact.`,
    `Why are you exploring a new opportunity at this stage of your career?`,
  ],
  design: (skills, years, role) => [
    `Walk me through your journey as a ${role} and the kind of products you've designed.`,
    `Pick a project you're most proud of — describe the problem, your process, and the outcome.`,
    `How do you approach user research and validating design decisions?`,
    `Tell me about a time a stakeholder disagreed with your design direction. How did you handle it?`,
    skills[0] ? `How do you use ${skills[0]} in your day-to-day workflow?` : `Which design tools do you use, and how is your design system experience?`,
    `How do you collaborate with engineers during handoff and implementation?`,
    `Describe how you balance business goals, user needs, and technical constraints.`,
    `Tell me about a design decision you made that was driven by data.`,
    `How do you give and receive design critique?`,
    `Why are you looking for a new role right now?`,
  ],
  product: (_skills, _years, role) => [
    `Tell me about your background as a ${role} and the products you've owned.`,
    `Walk me through how you prioritize a roadmap when everything feels urgent.`,
    `Describe a feature you killed or descoped — what was the reasoning?`,
    `How do you discover and validate user problems before writing a PRD?`,
    `Tell me about a launch you led — metrics targeted, results, and learnings.`,
    `How do you work with engineering and design during discovery and delivery?`,
    `Describe a time you had to say no to a senior stakeholder. How did you handle it?`,
    `What metrics do you obsess over in your current role and why?`,
    `How do you handle ambiguity when product strategy isn't clearly defined?`,
    `Why are you exploring a change?`,
  ],
  marketing: (skills, _years, role) => [
    `Walk me through your experience as a ${role} and the channels you've owned.`,
    `Describe a campaign you ran end-to-end — strategy, execution, and measurable outcome.`,
    skills[0] ? `How do you use ${skills[0]} in your marketing stack?` : `Which marketing tools and platforms are you strongest in?`,
    `How do you decide between paid, organic, and content-led growth for a new market?`,
    `Tell me about a time a campaign underperformed. What did you change?`,
    `How do you measure marketing ROI and attribute conversions?`,
    `Describe your experience working with sales, product, and design teams.`,
    `What's your approach to building a content calendar or brand voice from scratch?`,
    `Tell me about a piece of work you're most proud of and why.`,
    `Why are you looking to make a move?`,
  ],
  sales: (_skills, _years, role) => [
    `Walk me through your experience as a ${role} — average deal size, cycle, and quota.`,
    `Tell me about your most challenging deal. How did you close it?`,
    `How do you build a pipeline from scratch in a new territory or segment?`,
    `Describe your discovery and qualification process (e.g., MEDDIC, BANT, SPIN).`,
    `Tell me about a time you lost a deal you expected to win. What did you learn?`,
    `How do you handle objections around pricing or competition?`,
    `Describe how you collaborate with SDRs, marketing, and customer success.`,
    `What CRM and sales tools do you use, and how do you keep your pipeline hygiene tight?`,
    `Tell me about a quarter you exceeded quota — what drove it?`,
    `Why are you exploring a new role right now?`,
  ],
  hr: (_skills, _years, role) => [
    `Tell me about your experience as a ${role} and the kind of roles you've hired for.`,
    `Walk me through your sourcing strategy for a hard-to-fill technical role.`,
    `How do you partner with hiring managers to define a strong intake brief?`,
    `Describe a time you had to push back on a hiring manager's expectations.`,
    `What sourcing tools and ATS systems are you most comfortable with?`,
    `How do you measure the success of your recruiting funnel?`,
    `Tell me about a candidate experience improvement you championed.`,
    `How do you handle offer negotiations and counter-offers?`,
    `Describe your approach to diversity and inclusive hiring.`,
    `Why are you considering a change?`,
  ],
  finance: (_skills, _years, role) => [
    `Tell me about your background as a ${role} and the businesses you've supported.`,
    `Walk me through a financial model you've built end-to-end.`,
    `Describe your experience with monthly close, reporting, and audit cycles.`,
    `How do you partner with non-finance teams to drive better decisions?`,
    `Tell me about a time you spotted a financial risk early. What action did you take?`,
    `Which ERP and finance tools have you worked with?`,
    `Describe your experience with budgeting and forecasting.`,
    `How do you handle tight reporting deadlines and competing priorities?`,
    `Tell me about a process you streamlined or automated in finance.`,
    `Why are you exploring a new opportunity?`,
  ],
  ops: (_skills, _years, role) => [
    `Tell me about your background as a ${role} and the scale of operations you've managed.`,
    `Walk me through a process you redesigned and the impact it had.`,
    `Describe how you use data to identify operational inefficiencies.`,
    `Tell me about a cross-functional project you led across multiple teams.`,
    `How do you handle escalations and on-the-ground crises?`,
    `Which tools do you use to track operational metrics and SLAs?`,
    `Describe your experience managing vendors or third-party partners.`,
    `Tell me about a cost-saving initiative you led.`,
    `How do you balance speed, quality, and cost in operations?`,
    `Why are you looking for a new role?`,
  ],
  generic: (_skills, _years, role) => [
    `Walk me through your background and what attracted you to the ${role} opportunity.`,
    `Describe the most impactful project you've delivered in your current role.`,
    `What are your top 3 strengths relevant to this role?`,
    `Tell me about a time you had to learn something quickly on the job.`,
    `Describe a difficult stakeholder situation and how you navigated it.`,
    `How do you prioritize when you have competing deadlines?`,
    `Tell me about a time you received tough feedback. How did you respond?`,
    `What does success look like for you in the first 90 days of a new role?`,
    `Describe how you collaborate with cross-functional teams.`,
    `Why are you exploring a change right now?`,
  ],
};

export function generatePhoneScreen(jd: string): PhoneScreenSheet {
  const role = extractRole(jd);
  const domain = detectDomain(jd);
  const skills = extractSkills(jd);
  const years = extractYears(jd);
  const questions = DOMAIN_QUESTIONS[domain](skills, years, role);

  // Light shuffle-by-rotation seeded by JD length so output varies per JD but stays stable for same input
  const seed = jd.length % questions.length;
  const rotated = [...questions.slice(seed), ...questions.slice(0, seed)];
  const finalQs = rotated.slice(0, 8 + (jd.length % 3)); // 8-10 questions

  const md = `# Phone Screen Sheet — ${role}

_Use this sheet during the initial phone screen. Fill in candidate responses inline._

---

## Candidate Information

- **Name:** ____________________________
- **Total Work Experience:** ____________________________

---

## Screening Questions

${finalQs.map((q, i) => `**${i + 1}. ${q}**\n\n_Response:_ ____________________________\n`).join("\n")}
---

## Logistics & Compensation

- **Current CTC:** ____________________________
- **Expected CTC:** ____________________________
- **Notice Period:** ____________________________
- **Desktop / Laptop availability:** ____________________________
- **Internet / WiFi speed:** ____________________________
- **Location:** ____________________________
- **Source:** ____________________________
- **Interview Date:** ____________________________
- **Level 1 Feedback:** ____________________________
`;

  return { role, markdown: md };
}