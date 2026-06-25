// AI Skill Recommendation Engine — heuristic local layer.
// Pending API Configuration: GROQ-based dynamic skill expansion.

const SKILL_MAP: Record<string, string[]> = {
  "talent acquisition specialist": ["Recruitment", "Talent Sourcing", "Boolean Search", "LinkedIn Recruiter", "ATS Management", "Candidate Screening", "Employer Branding", "Stakeholder Management", "Interview Coordination"],
  "technical recruiter": ["Tech Hiring", "Boolean Search", "GitHub Sourcing", "LinkedIn Recruiter", "ATS Management", "Screening", "Stakeholder Management", "Offer Negotiation"],
  "hr generalist": ["HR Operations", "Payroll", "Employee Engagement", "Compliance", "Onboarding", "HRIS", "Conflict Resolution"],
  "hr manager": ["HR Strategy", "People Management", "Compensation", "L&D", "Compliance", "HR Analytics", "Performance Management"],
  "hr executive": ["HR Operations", "Onboarding", "Documentation", "HRIS", "Employee Engagement"],
  "sales executive": ["Lead Generation", "Cold Calling", "CRM", "Negotiation", "Pipeline Management", "Account Management"],
  "sales manager": ["Lead Generation", "B2B Sales", "CRM", "Pipeline Management", "Negotiation", "Revenue Growth", "Account Management", "Forecasting", "Team Leadership"],
  "business development executive": ["Lead Generation", "Prospecting", "Cold Outreach", "CRM", "Negotiation", "Pipeline Building"],
  "business development manager": ["Strategic Partnerships", "B2B Sales", "Pipeline Management", "Negotiation", "Account Management", "Revenue Growth"],
  "account executive": ["B2B Sales", "Discovery", "Demo Delivery", "CRM (Salesforce/HubSpot)", "Closing", "Quota Attainment"],
  "frontend developer": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind", "Vite", "Testing"],
  "backend developer": ["Node.js", "Express", "REST APIs", "SQL", "PostgreSQL", "Redis", "Docker", "System Design"],
  "full stack developer": ["JavaScript", "React", "Node.js", "API Development", "SQL", "MongoDB", "Git", "Cloud Platforms", "System Design"],
  "react developer": ["React", "TypeScript", "Redux", "React Query", "Tailwind", "Vite", "Testing Library"],
  "node.js developer": ["Node.js", "Express", "TypeScript", "REST", "PostgreSQL", "Redis", "Microservices"],
  "python developer": ["Python", "Django", "FastAPI", "PostgreSQL", "Pandas", "Pytest", "Docker"],
  "java developer": ["Java", "Spring Boot", "Hibernate", "REST APIs", "Microservices", "JUnit", "Kafka"],
  "devops engineer": ["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD", "Linux", "Monitoring", "Bash"],
  "data analyst": ["SQL", "Excel", "Tableau", "Power BI", "Python", "Statistics", "Data Visualization"],
  "data scientist": ["Python", "Statistics", "Machine Learning", "SQL", "Pandas", "scikit-learn", "Data Visualization", "A/B Testing"],
  "data engineer": ["SQL", "Python", "Spark", "Airflow", "AWS", "ETL", "Data Modeling", "Snowflake"],
  "machine learning engineer": ["Python", "PyTorch", "TensorFlow", "MLOps", "AWS SageMaker", "Model Deployment", "Statistics"],
  "product manager": ["Roadmapping", "User Research", "PRD Writing", "Stakeholder Management", "Analytics", "Prioritization", "Agile"],
  "ui/ux designer": ["Figma", "Wireframing", "Prototyping", "User Research", "Design Systems", "Interaction Design"],
  "marketing manager": ["Campaign Strategy", "SEO", "Content Marketing", "Performance Marketing", "Analytics", "Brand Management"],
  "project manager": ["Agile", "Scrum", "Stakeholder Management", "JIRA", "Risk Management", "Budgeting", "Reporting"],
  "customer success manager": ["Account Management", "Retention", "Onboarding", "QBRs", "CRM", "Upsell", "Stakeholder Management"],
};

const INDUSTRY_BOOST: Record<string, string[]> = {
  "SaaS": ["B2B SaaS", "Product-Led Growth", "MRR/ARR"],
  "FinTech": ["Compliance", "KYC/AML", "Payments"],
  "Healthcare": ["HIPAA", "Clinical Workflows", "EHR"],
  "E-Commerce": ["Conversion Optimization", "Marketplace", "Logistics"],
  "Manufacturing": ["Lean", "Six Sigma", "Supply Chain"],
  "Banking": ["Risk Management", "Regulatory Compliance", "Treasury"],
  "EdTech": ["Curriculum Design", "Learner Engagement"],
  "Artificial Intelligence": ["LLMs", "Prompt Engineering", "Vector Databases"],
};

const DEFAULT_SKILLS = ["Communication", "Problem Solving", "Stakeholder Management", "Collaboration", "Analytical Thinking"];

export function recommendSkills(args: { role?: string; industry?: string; department?: string }): string[] {
  const role = (args.role || "").trim().toLowerCase();
  let base: string[] = [];

  if (role && SKILL_MAP[role]) base = SKILL_MAP[role];
  else if (role) {
    // partial match
    const key = Object.keys(SKILL_MAP).find((k) => role.includes(k) || k.includes(role));
    if (key) base = SKILL_MAP[key];
  }

  if (base.length === 0) {
    // heuristic by token
    const tokens = role.split(/\s+/);
    if (tokens.includes("developer") || tokens.includes("engineer")) base = SKILL_MAP["full stack developer"];
    else if (tokens.includes("sales")) base = SKILL_MAP["sales manager"];
    else if (tokens.includes("hr") || tokens.includes("recruiter")) base = SKILL_MAP["talent acquisition specialist"];
    else if (tokens.includes("manager")) base = ["Team Leadership", "Stakeholder Management", "Strategy", "Reporting", "Hiring", "Mentorship"];
    else base = DEFAULT_SKILLS;
  }

  const industryBoost = (args.industry && INDUSTRY_BOOST[args.industry]) || [];
  const merged = Array.from(new Set([...base, ...industryBoost]));
  return merged.slice(0, 12);
}