// Industry Intelligence Database
// Pending API Configuration: future Apollo/Crunchbase enrichment.

export type Industry = {
  name: string;
  category: string;
  keywords: string[];
};

export const INDUSTRIES: Industry[] = [
  { name: "IT Services", category: "Technology", keywords: ["it", "services", "consulting"] },
  { name: "Software Development", category: "Technology", keywords: ["software", "engineering", "dev"] },
  { name: "SaaS", category: "Technology", keywords: ["saas", "cloud", "subscription"] },
  { name: "Artificial Intelligence", category: "Technology", keywords: ["ai", "ml", "intelligence"] },
  { name: "Cybersecurity", category: "Technology", keywords: ["security", "infosec"] },
  { name: "Healthcare", category: "Health", keywords: ["hospital", "clinic", "medical"] },
  { name: "Pharmaceutical", category: "Health", keywords: ["pharma", "drugs"] },
  { name: "Biotechnology", category: "Health", keywords: ["biotech", "biology"] },
  { name: "Manufacturing", category: "Industrial", keywords: ["factory", "production"] },
  { name: "Construction", category: "Industrial", keywords: ["build", "civil"] },
  { name: "Automotive", category: "Industrial", keywords: ["auto", "cars", "vehicle"] },
  { name: "Energy", category: "Industrial", keywords: ["power", "oil", "gas"] },
  { name: "Banking", category: "Finance", keywords: ["bank", "loans"] },
  { name: "Finance", category: "Finance", keywords: ["finance", "investment"] },
  { name: "Insurance", category: "Finance", keywords: ["insurance"] },
  { name: "FinTech", category: "Finance", keywords: ["fintech", "payments"] },
  { name: "Retail", category: "Commerce", keywords: ["retail", "store"] },
  { name: "E-Commerce", category: "Commerce", keywords: ["ecommerce", "online"] },
  { name: "FMCG", category: "Commerce", keywords: ["fmcg", "consumer goods"] },
  { name: "Logistics", category: "Operations", keywords: ["logistics", "supply"] },
  { name: "Transportation", category: "Operations", keywords: ["transport"] },
  { name: "Telecom", category: "Technology", keywords: ["telecom", "network"] },
  { name: "Education", category: "Education", keywords: ["education", "school"] },
  { name: "EdTech", category: "Education", keywords: ["edtech", "learning"] },
  { name: "HR Services", category: "Services", keywords: ["hr", "people"] },
  { name: "Recruitment", category: "Services", keywords: ["recruitment", "staffing"] },
  { name: "Consulting", category: "Services", keywords: ["consulting", "advisory"] },
  { name: "Government", category: "Public", keywords: ["government", "public"] },
  { name: "Real Estate", category: "Property", keywords: ["realestate", "property"] },
  { name: "Media", category: "Media", keywords: ["media", "broadcast"] },
  { name: "Marketing", category: "Media", keywords: ["marketing", "ads"] },
  { name: "Hospitality", category: "Travel", keywords: ["hospitality", "hotel"] },
  { name: "Travel", category: "Travel", keywords: ["travel", "tourism"] },
  { name: "Agriculture", category: "Primary", keywords: ["agriculture", "farming"] },
  { name: "Food Processing", category: "Primary", keywords: ["food", "beverage"] },
  { name: "Aerospace", category: "Industrial", keywords: ["aerospace", "aviation"] },
  { name: "Gaming", category: "Media", keywords: ["games", "gaming"] },
  { name: "Renewable Energy", category: "Industrial", keywords: ["solar", "wind", "renewable"] },
];

export function searchIndustries(query: string, limit = 10): Industry[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDUSTRIES.slice(0, limit);
  const scored = INDUSTRIES.map((ind) => {
    const name = ind.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (ind.keywords.some((k) => k.includes(q))) score = 40;
    else if (ind.category.toLowerCase().includes(q)) score = 20;
    return { ind, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.ind);
}