// AI Company Recommendation Engine — local fuzzy search.
// Architecture is provider-agnostic: swap fetchCompanyProvider with LinkedIn / Crunchbase / Apollo.
// Pending API Configuration: external company database connectors.

export type Company = {
  name: string;
  domain?: string;
  industry?: string;
};

export const COMPANIES: Company[] = [
  { name: "Infosys", domain: "infosys.com", industry: "IT Services" },
  { name: "Info Edge", domain: "infoedge.in", industry: "Internet" },
  { name: "Informatica", domain: "informatica.com", industry: "Software Development" },
  { name: "Amazon", domain: "amazon.com", industry: "E-Commerce" },
  { name: "Amazon Web Services", domain: "aws.amazon.com", industry: "SaaS" },
  { name: "Amadeus", domain: "amadeus.com", industry: "Travel" },
  { name: "Google", domain: "google.com", industry: "Technology" },
  { name: "Microsoft", domain: "microsoft.com", industry: "Software Development" },
  { name: "Meta", domain: "meta.com", industry: "Technology" },
  { name: "Apple", domain: "apple.com", industry: "Technology" },
  { name: "Netflix", domain: "netflix.com", industry: "Media" },
  { name: "Adobe", domain: "adobe.com", industry: "Software Development" },
  { name: "Salesforce", domain: "salesforce.com", industry: "SaaS" },
  { name: "Oracle", domain: "oracle.com", industry: "Software Development" },
  { name: "SAP", domain: "sap.com", industry: "Software Development" },
  { name: "IBM", domain: "ibm.com", industry: "IT Services" },
  { name: "Accenture", domain: "accenture.com", industry: "Consulting" },
  { name: "TCS", domain: "tcs.com", industry: "IT Services" },
  { name: "Wipro", domain: "wipro.com", industry: "IT Services" },
  { name: "HCL Technologies", domain: "hcltech.com", industry: "IT Services" },
  { name: "Tech Mahindra", domain: "techmahindra.com", industry: "IT Services" },
  { name: "Cognizant", domain: "cognizant.com", industry: "IT Services" },
  { name: "Capgemini", domain: "capgemini.com", industry: "Consulting" },
  { name: "Deloitte", domain: "deloitte.com", industry: "Consulting" },
  { name: "PwC", domain: "pwc.com", industry: "Consulting" },
  { name: "EY", domain: "ey.com", industry: "Consulting" },
  { name: "KPMG", domain: "kpmg.com", industry: "Consulting" },
  { name: "McKinsey & Company", domain: "mckinsey.com", industry: "Consulting" },
  { name: "BCG", domain: "bcg.com", industry: "Consulting" },
  { name: "Bain & Company", domain: "bain.com", industry: "Consulting" },
  { name: "Flipkart", domain: "flipkart.com", industry: "E-Commerce" },
  { name: "Zomato", domain: "zomato.com", industry: "FoodTech" },
  { name: "Swiggy", domain: "swiggy.com", industry: "FoodTech" },
  { name: "Paytm", domain: "paytm.com", industry: "FinTech" },
  { name: "PhonePe", domain: "phonepe.com", industry: "FinTech" },
  { name: "Razorpay", domain: "razorpay.com", industry: "FinTech" },
  { name: "Stripe", domain: "stripe.com", industry: "FinTech" },
  { name: "Square", domain: "squareup.com", industry: "FinTech" },
  { name: "Uber", domain: "uber.com", industry: "Transportation" },
  { name: "Ola", domain: "olacabs.com", industry: "Transportation" },
  { name: "Airbnb", domain: "airbnb.com", industry: "Travel" },
  { name: "Booking.com", domain: "booking.com", industry: "Travel" },
  { name: "LinkedIn", domain: "linkedin.com", industry: "Technology" },
  { name: "Slack", domain: "slack.com", industry: "SaaS" },
  { name: "Zoom", domain: "zoom.us", industry: "SaaS" },
  { name: "HubSpot", domain: "hubspot.com", industry: "SaaS" },
  { name: "Atlassian", domain: "atlassian.com", industry: "SaaS" },
  { name: "GitHub", domain: "github.com", industry: "Software Development" },
  { name: "GitLab", domain: "gitlab.com", industry: "Software Development" },
  { name: "Shopify", domain: "shopify.com", industry: "E-Commerce" },
  { name: "Tesla", domain: "tesla.com", industry: "Automotive" },
  { name: "Ford", domain: "ford.com", industry: "Automotive" },
  { name: "Toyota", domain: "toyota.com", industry: "Automotive" },
  { name: "Reliance Industries", domain: "ril.com", industry: "Energy" },
  { name: "ICICI Bank", domain: "icicibank.com", industry: "Banking" },
  { name: "HDFC Bank", domain: "hdfcbank.com", industry: "Banking" },
  { name: "JPMorgan Chase", domain: "jpmorganchase.com", industry: "Banking" },
  { name: "Goldman Sachs", domain: "goldmansachs.com", industry: "Finance" },
  { name: "Pfizer", domain: "pfizer.com", industry: "Pharmaceutical" },
  { name: "Novartis", domain: "novartis.com", industry: "Pharmaceutical" },
  { name: "OpenAI", domain: "openai.com", industry: "Artificial Intelligence" },
  { name: "Anthropic", domain: "anthropic.com", industry: "Artificial Intelligence" },
];

function fuzzyScore(name: string, q: string): number {
  const n = name.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 85;
  // word-prefix match
  if (n.split(/\s+/).some((tok) => tok.startsWith(q))) return 70;
  if (n.includes(q)) return 55;
  // sequential char fuzzy
  let i = 0;
  for (const c of n) if (c === q[i]) i++;
  if (i === q.length) return 25;
  return 0;
}

export interface CompanyProvider {
  search(query: string, limit?: number): Promise<Company[]>;
}

export const localCompanyProvider: CompanyProvider = {
  async search(query: string, limit = 10) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COMPANIES.map((c) => ({ c, s: fuzzyScore(c.name, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.c);
  },
};

// Future: register additional providers (linkedin, crunchbase, apollo) and merge results.
// Pending API Configuration.
let activeProvider: CompanyProvider = localCompanyProvider;
export function setCompanyProvider(p: CompanyProvider) { activeProvider = p; }
export async function searchCompanies(query: string, limit = 10) {
  return activeProvider.search(query, limit);
}

// ── AI-powered suggestions via Lovable AI (edge function: company-suggest) ─────
import { supabase } from "@/integrations/supabase/client";

const aiCache = new Map<string, Company[]>();
const inflight = new Map<string, Promise<Company[]>>();

export async function searchCompaniesAI(query: string, limit = 10): Promise<Company[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const key = q.toLowerCase();
  if (aiCache.has(key)) return aiCache.get(key)!.slice(0, limit);
  if (inflight.has(key)) return inflight.get(key)!.then((r) => r.slice(0, limit));

  const p = (async (): Promise<Company[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("company-suggest", {
        body: { query: q },
      });
      if (error) throw error;
      const names: string[] = Array.isArray((data as any)?.suggestions)
        ? (data as any).suggestions
        : [];
      const aiResults: Company[] = names.map((n) => ({ name: n }));
      // Merge with any local matches for redundancy (de-dupe by lowercased name)
      const local = await localCompanyProvider.search(q, 5);
      const seen = new Set<string>();
      const merged: Company[] = [];
      for (const c of [...aiResults, ...local]) {
        const k = c.name.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        merged.push(c);
      }
      aiCache.set(key, merged);
      return merged;
    } catch (e) {
      // Fallback to local fuzzy search on any failure
      const local = await localCompanyProvider.search(q, limit);
      return local;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p.then((r) => r.slice(0, limit));
}