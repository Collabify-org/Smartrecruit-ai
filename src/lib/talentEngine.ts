export interface TalentReport {
  role: string;
  market: { demand: "High" | "Medium" | "Low"; trend: "Rising" | "Stable" | "Declining"; context: string };
  sources: { topCompanies: string[]; competitors: string[]; startups: string[]; serviceCompanies: string[] };
  salary: { entry: string; mid: string; senior: string; global: string };
  keywords: { linkedin: string[]; jobBoards: string[]; altTitles: string[]; boolean: string };
  strategy: { channels: string[]; fastest: string; referral: string; remoteAdvice: string };
}

function pickRole(jd: string): string {
  const m = jd.match(/(?:#\s*|role[:\s]+)([A-Za-z0-9 +\-/]+)/i);
  if (m) return m[1].trim().split("\n")[0].slice(0, 60);
  const firstLine = jd.split("\n").find((l) => l.trim());
  return firstLine?.replace(/^#+\s*/, "").slice(0, 60) || "Software Role";
}

function detectDomain(jd: string): "engineering" | "data" | "design" | "product" | "marketing" | "sales" | "generic" {
  const t = jd.toLowerCase();
  if (/(data scien|ml |machine learn|ai engineer|nlp)/.test(t)) return "data";
  if (/(designer|figma|ui\/ux|product design)/.test(t)) return "design";
  if (/(product manager|pm |roadmap)/.test(t)) return "product";
  if (/(marketing|seo|growth|content)/.test(t)) return "marketing";
  if (/(sales|account exec|bdr|sdr)/.test(t)) return "sales";
  if (/(engineer|developer|backend|frontend|devops|sre|react|node|python|java)/.test(t)) return "engineering";
  return "generic";
}

const CATALOG = {
  engineering: {
    top: ["Google", "Microsoft", "Meta", "Amazon", "Stripe", "Atlassian"],
    competitors: ["Razorpay", "Zerodha", "Postman", "Freshworks", "Zomato", "Swiggy"],
    startups: ["Linear", "Vercel", "Supabase", "Cred", "Slice", "Setu"],
    services: ["TCS", "Infosys", "Wipro", "Accenture", "ThoughtWorks"],
    altTitles: ["Software Engineer", "Backend Engineer", "Full-stack Developer", "Member of Technical Staff", "SDE II"],
  },
  data: {
    top: ["Google", "Meta", "Microsoft", "Netflix", "Uber", "LinkedIn"],
    competitors: ["Flipkart", "Myntra", "Ola", "Dream11", "PhonePe"],
    startups: ["Hugging Face", "Anthropic", "Sarvam AI", "Krutrim", "Glance"],
    services: ["Mu Sigma", "Fractal", "LatentView", "Tiger Analytics"],
    altTitles: ["Data Scientist", "ML Engineer", "Applied Scientist", "Research Engineer", "AI Engineer"],
  },
  design: {
    top: ["Apple", "Airbnb", "Google", "Adobe", "Figma"],
    competitors: ["Razorpay", "Cred", "Swiggy", "Zomato"],
    startups: ["Linear", "Notion", "Arc", "Pitch", "Framer"],
    services: ["IDEO", "Lollypop", "Designit"],
    altTitles: ["Product Designer", "UX Designer", "UI Designer", "Senior Designer"],
  },
  product: {
    top: ["Google", "Meta", "Stripe", "Airbnb", "Atlassian"],
    competitors: ["Razorpay", "Cred", "PhonePe", "Zerodha"],
    startups: ["Linear", "Notion", "Ramp", "Mercury"],
    services: ["McKinsey", "BCG", "Bain"],
    altTitles: ["Product Manager", "Senior PM", "Group PM", "Associate PM"],
  },
  marketing: {
    top: ["HubSpot", "Salesforce", "Adobe", "Google"],
    competitors: ["Zoho", "Freshworks", "Browserstack"],
    startups: ["Webflow", "Vercel", "Supabase"],
    services: ["WPP", "Ogilvy", "Dentsu"],
    altTitles: ["Growth Marketer", "Content Lead", "SEO Manager", "Demand Gen"],
  },
  sales: {
    top: ["Salesforce", "Oracle", "SAP", "ServiceNow"],
    competitors: ["Zoho", "Freshworks", "Postman"],
    startups: ["Notion", "Linear", "Mercury"],
    services: ["Accenture", "Deloitte"],
    altTitles: ["Account Executive", "BDR", "SDR", "Sales Lead"],
  },
  generic: {
    top: ["Google", "Microsoft", "Amazon"],
    competitors: ["Local market leaders"],
    startups: ["High-growth startups in your sector"],
    services: ["Top consulting firms"],
    altTitles: ["Specialist", "Senior Specialist", "Lead"],
  },
} as const;

const SALARY: Record<string, { entry: string; mid: string; senior: string; global: string }> = {
  engineering: { entry: "₹8–14 LPA", mid: "₹18–35 LPA", senior: "₹40–80 LPA", global: "$90K–$220K (US/EU)" },
  data: { entry: "₹10–18 LPA", mid: "₹22–45 LPA", senior: "₹50–110 LPA", global: "$120K–$280K (US/EU)" },
  design: { entry: "₹6–12 LPA", mid: "₹15–30 LPA", senior: "₹35–70 LPA", global: "$80K–$180K (US/EU)" },
  product: { entry: "₹12–20 LPA", mid: "₹25–50 LPA", senior: "₹55–120 LPA", global: "$130K–$300K (US/EU)" },
  marketing: { entry: "₹5–10 LPA", mid: "₹12–25 LPA", senior: "₹30–60 LPA", global: "$70K–$160K (US/EU)" },
  sales: { entry: "₹6–12 LPA + commission", mid: "₹15–30 LPA + commission", senior: "₹35–80 LPA + commission", global: "$80K–$200K OTE" },
  generic: { entry: "₹5–10 LPA", mid: "₹12–25 LPA", senior: "₹30–60 LPA", global: "Varies by region" },
};

export function analyzeJD(jd: string): TalentReport {
  const role = pickRole(jd);
  const domain = detectDomain(jd);
  const cat = CATALOG[domain];
  const sal = SALARY[domain];

  const skillsMatch = jd.match(/(react|node|python|java|aws|kubernetes|figma|sql|ml|llm|typescript|go|rust|swift|kotlin)/gi) || [];
  const skills = Array.from(new Set(skillsMatch.map((s) => s.toLowerCase())));
  const isAI = /(ai|llm|ml|gpt|gen[- ]?ai)/i.test(jd);

  return {
    role,
    market: {
      demand: isAI || domain === "data" ? "High" : domain === "engineering" ? "High" : "Medium",
      trend: isAI ? "Rising" : domain === "design" || domain === "product" ? "Stable" : "Rising",
      context: isAI
        ? "Hiring for AI/ML talent is at an all-time high. Expect aggressive competition and faster-than-usual closures."
        : `The ${domain} market is active with steady demand from both startups and enterprises. Mid-to-senior roles see the highest competition.`,
    },
    sources: {
      topCompanies: [...cat.top],
      competitors: [...cat.competitors],
      startups: [...cat.startups],
      serviceCompanies: [...cat.services],
    },
    salary: sal,
    keywords: {
      linkedin: [role, ...cat.altTitles.slice(0, 3), ...skills.slice(0, 3)].filter(Boolean),
      jobBoards: [role, `${role} jobs`, `Hiring ${role}`, ...skills.slice(0, 2)].filter(Boolean),
      altTitles: [...cat.altTitles],
      boolean: `("${role}" OR ${cat.altTitles
        .slice(0, 3)
        .map((t) => `"${t}"`)
        .join(" OR ")})${skills.length ? ` AND (${skills.slice(0, 4).map((s) => `"${s}"`).join(" OR ")})` : ""} NOT (intern OR student)`,
    },
    strategy: {
      channels: ["LinkedIn Recruiter", "Employee Referrals", "GitHub / portfolios", "Niche Slack & Discord communities", "AngelList / Wellfound"],
      fastest: "Warm outbound on LinkedIn paired with referrals typically closes in 3–5 weeks.",
      referral: `Offer a tiered referral bonus (e.g., ₹50K base + ₹25K on retention) — referred ${role}s convert 4× higher than cold inbound.`,
      remoteAdvice:
        domain === "engineering" || domain === "data"
          ? "Remote-first hiring expands your talent pool 5×. Tier-2 cities offer 30–40% cost savings with comparable quality."
          : "Hybrid setups work best for this role. Anchor in 1–2 metros and offer flexibility.",
    },
  };
}