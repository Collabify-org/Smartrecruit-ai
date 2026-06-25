// AI Role Recommendation Engine — local intelligence layer.
// Pending API Configuration: swap with LLM-backed suggestions when GROQ_API_KEY is provisioned.

export type RoleSuggestion = {
  title: string;
  department: string;
  seniority?: "Junior" | "Mid" | "Senior" | "Lead" | "Head";
  aliases?: string[];
};

export const ROLES: RoleSuggestion[] = [
  // Sales
  { title: "Sales Executive", department: "Sales", seniority: "Mid", aliases: ["sales"] },
  { title: "Senior Sales Executive", department: "Sales", seniority: "Senior", aliases: ["sales"] },
  { title: "Business Development Executive", department: "Sales", seniority: "Mid", aliases: ["bd", "sales"] },
  { title: "Business Development Manager", department: "Sales", seniority: "Senior", aliases: ["bd", "sales"] },
  { title: "Account Executive", department: "Sales", seniority: "Mid", aliases: ["sales"] },
  { title: "Territory Sales Manager", department: "Sales", seniority: "Senior", aliases: ["sales"] },
  { title: "Enterprise Sales Manager", department: "Sales", seniority: "Senior", aliases: ["sales"] },
  { title: "Regional Sales Manager", department: "Sales", seniority: "Senior", aliases: ["sales"] },
  { title: "Sales Manager", department: "Sales", seniority: "Senior", aliases: ["sales"] },
  { title: "VP Sales", department: "Sales", seniority: "Head", aliases: ["sales"] },

  // HR
  { title: "HR Executive", department: "Human Resources", seniority: "Mid", aliases: ["hr"] },
  { title: "HR Generalist", department: "Human Resources", seniority: "Mid", aliases: ["hr"] },
  { title: "Talent Acquisition Specialist", department: "Human Resources", seniority: "Mid", aliases: ["hr", "ta", "recruiter"] },
  { title: "Recruitment Consultant", department: "Human Resources", seniority: "Mid", aliases: ["hr", "recruiter"] },
  { title: "HR Manager", department: "Human Resources", seniority: "Senior", aliases: ["hr"] },
  { title: "Talent Partner", department: "Human Resources", seniority: "Senior", aliases: ["hr"] },
  { title: "Technical Recruiter", department: "Human Resources", seniority: "Mid", aliases: ["hr", "tech recruiter"] },
  { title: "Head of People", department: "Human Resources", seniority: "Head", aliases: ["hr"] },

  // Engineering
  { title: "Frontend Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "engineer", "fe"] },
  { title: "Backend Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "engineer", "be"] },
  { title: "Full Stack Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "engineer"] },
  { title: "React Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "react"] },
  { title: "Node.js Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "node"] },
  { title: "Python Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "python"] },
  { title: "Java Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "java"] },
  { title: "DevOps Engineer", department: "Engineering", seniority: "Senior", aliases: ["devops", "engineer"] },
  { title: "Mobile Developer", department: "Engineering", seniority: "Mid", aliases: ["developer", "mobile"] },
  { title: "Engineering Manager", department: "Engineering", seniority: "Lead", aliases: ["engineer", "manager"] },
  { title: "Site Reliability Engineer", department: "Engineering", seniority: "Senior", aliases: ["sre"] },
  { title: "QA Engineer", department: "Engineering", seniority: "Mid", aliases: ["qa", "test"] },

  // Data / AI
  { title: "Data Analyst", department: "Data", seniority: "Mid", aliases: ["data"] },
  { title: "Data Scientist", department: "Data", seniority: "Senior", aliases: ["data", "ds"] },
  { title: "Data Engineer", department: "Data", seniority: "Senior", aliases: ["data"] },
  { title: "Machine Learning Engineer", department: "Data", seniority: "Senior", aliases: ["ml", "ai"] },
  { title: "AI Researcher", department: "Data", seniority: "Senior", aliases: ["ai"] },

  // Product / Design
  { title: "Product Manager", department: "Product", seniority: "Senior", aliases: ["pm", "product"] },
  { title: "Associate Product Manager", department: "Product", seniority: "Junior", aliases: ["apm", "product"] },
  { title: "Senior Product Manager", department: "Product", seniority: "Senior", aliases: ["product"] },
  { title: "UI/UX Designer", department: "Design", seniority: "Mid", aliases: ["designer", "ui", "ux"] },
  { title: "Product Designer", department: "Design", seniority: "Senior", aliases: ["designer"] },

  // Marketing
  { title: "Marketing Manager", department: "Marketing", seniority: "Senior", aliases: ["marketing"] },
  { title: "Performance Marketing Manager", department: "Marketing", seniority: "Senior", aliases: ["marketing"] },
  { title: "Content Marketing Manager", department: "Marketing", seniority: "Senior", aliases: ["marketing", "content"] },
  { title: "Growth Marketer", department: "Marketing", seniority: "Mid", aliases: ["marketing", "growth"] },
  { title: "SEO Specialist", department: "Marketing", seniority: "Mid", aliases: ["seo", "marketing"] },

  // Finance / Ops
  { title: "Financial Analyst", department: "Finance", seniority: "Mid", aliases: ["finance"] },
  { title: "Accountant", department: "Finance", seniority: "Mid", aliases: ["finance", "account"] },
  { title: "Operations Manager", department: "Operations", seniority: "Senior", aliases: ["ops"] },
  { title: "Project Manager", department: "Operations", seniority: "Senior", aliases: ["pm", "project"] },

  // Customer
  { title: "Customer Success Manager", department: "Customer", seniority: "Senior", aliases: ["cs", "customer"] },
  { title: "Customer Support Executive", department: "Customer", seniority: "Junior", aliases: ["support", "customer"] },
];

export function suggestRoles(query: string, limit = 10): RoleSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];
  const scored = ROLES.map((role) => {
    const title = role.title.toLowerCase();
    const dept = role.department.toLowerCase();
    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.split(/\s+/).some((tok) => tok.startsWith(q))) score = 70;
    else if (title.includes(q)) score = 55;
    else if (dept.toLowerCase().includes(q)) score = 35;
    else if (role.aliases?.some((a) => a.includes(q) || q.includes(a))) score = 50;
    return { role, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.role);
}